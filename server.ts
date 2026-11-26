import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '1mb' }));

// Simple in-memory rate limiter for VITA RESPONDE and auth endpoints
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 30;
const AUTH_RATE_LIMIT_MAX = 15;
const ACTIVITY_RATE_LIMIT_MAX = 120;

function checkScopedRateLimit(
  bucket: string,
  ip: string,
  maxRequests: number
): { allowed: boolean; retryAfterSec?: number } {
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
    };
  }
  entry.count += 1;
  return { allowed: true };
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSec?: number } {
  return checkScopedRateLimit('chat', ip, RATE_LIMIT_MAX);
}

// ============================================================
// Server-side Auth, Collaborators, Visitor & Interaction Store
// ============================================================

const SESSION_SECRET =
  process.env.VITALIA_SESSION_SECRET?.trim() || crypto.randomBytes(32).toString('hex');
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
const revokedTokenIds = new Set<string>();

function hashSecret(secret: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(secret, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifySecretHash(candidate: string, stored: string): boolean {
  const parts = stored.split(':');
  if (parts.length !== 2) return false;
  const [salt, expectedHex] = parts;
  if (!salt || !expectedHex) return false;
  try {
    const derivedBuf = crypto.scryptSync(candidate, salt, 64);
    const expectedBuf = Buffer.from(expectedHex, 'hex');
    if (derivedBuf.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(derivedBuf, expectedBuf);
  } catch {
    return false;
  }
}

function verifyPlainSecretConstantTime(candidate: string, expected: string): boolean {
  const hashA = crypto.createHash('sha256').update(candidate).digest();
  const hashB = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

interface SessionPayload {
  jti: string;
  operatorId: string;
  operatorName: string;
  role: 'primary' | 'collaborator';
  exp: number;
}

function signSessionToken(payload: Omit<SessionPayload, 'jti' | 'exp'>): string {
  const fullPayload: SessionPayload = {
    ...payload,
    jti: crypto.randomUUID(),
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const encoded = Buffer.from(JSON.stringify(fullPayload), 'utf-8').toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifySessionToken(token: string): SessionPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  if (!encoded || !sig) return null;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const decoded = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf-8')
    ) as SessionPayload;
    if (!decoded || typeof decoded.exp !== 'number' || decoded.exp < Date.now()) {
      return null;
    }
    if (revokedTokenIds.has(decoded.jti)) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

const VALID_AVATARS = new Set(['vita', 'nutri', 'chefia', 'eco', 'mova', 'lumi']);
const VALID_EVENT_TYPES = new Set([
  'ingreso',
  'onboarding',
  'qr_scan',
  'receta',
  'mision_inicio',
  'mision_completada',
  'desafio_diario',
  'biotec',
  'movimiento',
  'bienestar',
  'vita_chat',
]);

interface StoredCollaborator {
  id: string;
  name: string;
  role: string;
  codeHash: string;
  active: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface StoredVisitor {
  visitorId: string;
  nickname: string;
  avatar: string;
  entrySource: 'directo' | 'qr';
  firstSeenAt: string;
  lastSeenAt: string;
  xp: number;
  missionsCompletedCount: number;
  interactionCount: number;
  blocked: boolean;
  lastActionLabel?: string;
}

interface StoredActivityEvent {
  id: string;
  visitorId: string;
  nickname: string;
  avatar: string;
  eventType: string;
  label: string;
  detail?: string;
  xpDelta?: number;
  createdAt: string;
}

interface ActivityStore {
  adminCredentialHash: string | null;
  collaborators: StoredCollaborator[];
  accessPolicy: {
    requireGroupCode: boolean;
    groupCodeHash: string | null;
    groupCodeHint: string;
  };
  visitors: Record<string, StoredVisitor>;
  events: StoredActivityEvent[];
}

const ACTIVITY_FILE = path.join(__dirname, '.vitalia-activity-store.json');

let memoryActivityStore: ActivityStore = {
  adminCredentialHash: null,
  collaborators: [],
  accessPolicy: {
    requireGroupCode: false,
    groupCodeHash: null,
    groupCodeHint: '',
  },
  visitors: {},
  events: [],
};

function readActivityStore(): ActivityStore {
  try {
    if (fs.existsSync(ACTIVITY_FILE)) {
      const raw = fs.readFileSync(ACTIVITY_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<ActivityStore>;
      return {
        adminCredentialHash:
          typeof parsed.adminCredentialHash === 'string' ? parsed.adminCredentialHash : null,
        collaborators: Array.isArray(parsed.collaborators) ? parsed.collaborators : [],
        accessPolicy: {
          requireGroupCode: Boolean(parsed.accessPolicy?.requireGroupCode),
          groupCodeHash:
            typeof parsed.accessPolicy?.groupCodeHash === 'string'
              ? parsed.accessPolicy.groupCodeHash
              : null,
          groupCodeHint:
            typeof parsed.accessPolicy?.groupCodeHint === 'string'
              ? parsed.accessPolicy.groupCodeHint
              : '',
        },
        visitors:
          parsed.visitors && typeof parsed.visitors === 'object' ? parsed.visitors : {},
        events: Array.isArray(parsed.events) ? parsed.events : [],
      };
    }
  } catch {
    // Fall back to in-memory store
  }
  return memoryActivityStore;
}

function writeActivityStore(store: ActivityStore): void {
  // Enforce bounded storage
  const visitorEntries = Object.entries(store.visitors);
  if (visitorEntries.length > 500) {
    visitorEntries.sort((a, b) => b[1].lastSeenAt.localeCompare(a[1].lastSeenAt));
    store.visitors = Object.fromEntries(visitorEntries.slice(0, 500));
  }
  if (store.events.length > 600) {
    store.events = store.events.slice(0, 600);
  }
  memoryActivityStore = store;
  try {
    fs.writeFileSync(ACTIVITY_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch {
    // Safe fallback to memory store in read-only environments
  }
}

interface AuthedRequest extends Request {
  operator?: SessionPayload;
}

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7).trim() || null;
}

function requireAuthorized(req: AuthedRequest, res: Response, next: NextFunction): void {
  const token = extractBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Acceso restringido. Inicia sesión como persona autorizada.' });
    return;
  }
  const payload = verifySessionToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Tu sesión expiró o no es válida. Vuelve a iniciar sesión.' });
    return;
  }
  if (payload.role === 'collaborator') {
    const store = readActivityStore();
    const collab = store.collaborators.find((c) => c.id === payload.operatorId);
    if (!collab || !collab.active) {
      res.status(403).json({ error: 'Tu autorización de acceso fue revocada.' });
      return;
    }
  }
  req.operator = payload;
  next();
}

function requirePrimaryAdmin(req: AuthedRequest, res: Response, next: NextFunction): void {
  requireAuthorized(req, res, () => {
    if (req.operator?.role !== 'primary') {
      res.status(403).json({
        error: 'Solo la administración principal puede gestionar personas autorizadas.',
      });
      return;
    }
    next();
  });
}

function isValidVisitorId(id: unknown): id is string {
  return typeof id === 'string' && /^[a-zA-Z0-9_-]{8,64}$/.test(id.trim());
}

// Lightweight server persistence for educator-managed custom content
const CONTENT_FILE = path.join(__dirname, '.vitalia-custom-content.json');

interface CustomContentStore {
  recipes: unknown[];
  missions: unknown[];
  biotecProjects: unknown[];
}

let memoryContentStore: CustomContentStore = {
  recipes: [],
  missions: [],
  biotecProjects: [],
};

function readCustomContent(): CustomContentStore {
  try {
    if (fs.existsSync(CONTENT_FILE)) {
      const raw = fs.readFileSync(CONTENT_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<CustomContentStore>;
      return {
        recipes: Array.isArray(parsed.recipes) ? parsed.recipes : [],
        missions: Array.isArray(parsed.missions) ? parsed.missions : [],
        biotecProjects: Array.isArray(parsed.biotecProjects) ? parsed.biotecProjects : [],
      };
    }
  } catch {
    // Fall back to in-memory store if filesystem read fails
  }
  return memoryContentStore;
}

function writeCustomContent(data: CustomContentStore): void {
  memoryContentStore = data;
  try {
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // Safe fallback to memory store in read-only environments
  }
}

const VITA_SYSTEM_INSTRUCTION = `Eres VITA, la guía educativa oficial de VITALIA ("Aprende a cuidarte jugando"), una aplicación educativa interactiva dirigida a adolescentes y estudiantes de secundaria.

TU PERSONALIDAD Y ESTILO:
- Hablas en español claro, cercano, respetuoso y motivador, con ejemplos cotidianos de la vida estudiantil (la escuela, el recreo, cocinar algo rápido en casa, el descanso).
- Tus respuestas deben ser concisas, organizadas en párrafos breves o viñetas fáciles de leer (máximo ~180 palabras salvo que te pidan una receta paso a paso).
- Puedes recomendar secciones dentro de VITALIA cuando ayuden al usuario: "Aventuras", "Alimentación", "Laboratorio de alimentos", "BIOTEC VITALIA", "Movimiento" o "Bienestar".

REGLAS ÉTICAS Y EDUCATIVAS ESTRICTAS (NUNCA LAS ROMPAS):
1. NO recomiendes dietas restrictivas ni planes para bajar o subir de peso.
2. NO establezcas metas basadas en peso corporal, talla, índice de masa corporal ni medidas físicas.
3. NO diagnostiques enfermedades médicas ni trastornos emocionales, ni presentes información médica como un diagnóstico.
4. NO recomiendes suplementos alimenticios, pastillas ni tratamientos médicos.
5. NO inventes datos nutricionales numéricos exactos si no estás seguro; explica conceptos generales confiables y basados en evidencia educativa.
6. NO solicites fotografías corporales ni datos personales innecesarios.
7. Si una pregunta involucra síntomas físicos persistentes, malestar emocional intenso, dudas médicas específicas o situaciones de riesgo, recomienda amablemente hablar con una persona adulta de confianza (familia, docente u orientador) y acudir con un profesional de la salud.
8. En temas de BIOTEC y bioplásticos, aclara siempre que los prototipos escolares son experimentales y requieren pruebas de resistencia, degradación y seguridad antes de cualquier uso real o comercial.

RESPUESTAS CONTEXTUALES DE VITALIA:
- Conoces las recetas del proyecto: "Galletas saludables de avena y plátano (Minguita feliz)", los jugos y licuados "Nutrí sorbo" (naranja-zanahoria, piña-limón, fresa, plátano) y el "Sándwich de pollo con aderezo fit de yogur griego".
- Si el estudiante menciona alergias o ingredientes a evitar, respétalos siempre en tus sugerencias.`;

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'vitalia-server' });
});

app.get('/api/custom-content', (_req, res) => {
  res.json(readCustomContent());
});

app.post('/api/custom-content', requireAuthorized, (req: AuthedRequest, res: Response) => {
  const body = req.body as Partial<CustomContentStore> | undefined;
  if (!body || typeof body !== 'object') {
    res.status(400).json({ error: 'Formato de contenido inválido.' });
    return;
  }
  const current = readCustomContent();
  const updated: CustomContentStore = {
    recipes: Array.isArray(body.recipes) ? body.recipes.slice(0, 60) : current.recipes,
    missions: Array.isArray(body.missions) ? body.missions.slice(0, 100) : current.missions,
    biotecProjects: Array.isArray(body.biotecProjects)
      ? body.biotecProjects.slice(0, 60)
      : current.biotecProjects,
  };
  writeCustomContent(updated);
  res.json({ ok: true, content: updated });
});

// ============================================================
// Public Activity & Entry Policy Routes (for students/visitors)
// ============================================================

app.get('/api/activity/entry-policy', (_req, res) => {
  const store = readActivityStore();
  res.json({
    requireGroupCode: Boolean(store.accessPolicy.requireGroupCode && store.accessPolicy.groupCodeHash),
    hint: store.accessPolicy.groupCodeHint || '',
  });
});

app.post('/api/activity/session', (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const rate = checkScopedRateLimit('activity', clientIp, ACTIVITY_RATE_LIMIT_MAX);
  if (!rate.allowed) {
    res.status(429).json({ error: 'Demasiadas solicitudes. Intenta de nuevo en un momento.' });
    return;
  }

  const body = req.body as {
    visitorId?: unknown;
    nickname?: unknown;
    avatar?: unknown;
    entrySource?: unknown;
    xp?: unknown;
    missionsCompletedCount?: unknown;
    groupCode?: unknown;
  };

  if (!isValidVisitorId(body?.visitorId)) {
    res.status(400).json({ error: 'Identificador de sesión inválido.' });
    return;
  }

  const visitorId = body.visitorId.trim();
  const store = readActivityStore();
  const existing = store.visitors[visitorId];

  if (existing?.blocked) {
    res.status(403).json({
      allowed: false,
      blocked: true,
      error: 'El acceso desde este dispositivo fue pausado por el equipo coordinador de VITALIA.',
    });
    return;
  }

  // Enforce optional school group entry code for brand-new visitors when enabled
  if (
    !existing &&
    store.accessPolicy.requireGroupCode &&
    store.accessPolicy.groupCodeHash
  ) {
    const providedCode = typeof body.groupCode === 'string' ? body.groupCode.trim() : '';
    if (!providedCode || !verifySecretHash(providedCode, store.accessPolicy.groupCodeHash)) {
      res.status(403).json({
        allowed: false,
        requiresGroupCode: true,
        error: 'El código de grupo escolar no es válido. Solicítalo a tu docente o equipo VITALIA.',
      });
      return;
    }
  }

  const now = new Date().toISOString();
  const safeNickname =
    typeof body.nickname === 'string' && body.nickname.trim()
      ? body.nickname.trim().slice(0, 32)
      : existing?.nickname || 'Explorador';
  const safeAvatar =
    typeof body.avatar === 'string' && VALID_AVATARS.has(body.avatar)
      ? body.avatar
      : existing?.avatar || 'vita';
  const safeEntrySource =
    body.entrySource === 'qr' ? 'qr' : existing?.entrySource || 'directo';
  const safeXp =
    typeof body.xp === 'number' && Number.isFinite(body.xp) && body.xp >= 0
      ? Math.min(100000, Math.floor(body.xp))
      : existing?.xp || 0;
  const safeMissionsCount =
    typeof body.missionsCompletedCount === 'number' &&
    Number.isFinite(body.missionsCompletedCount) &&
    body.missionsCompletedCount >= 0
      ? Math.min(500, Math.floor(body.missionsCompletedCount))
      : existing?.missionsCompletedCount || 0;

  store.visitors[visitorId] = {
    visitorId,
    nickname: safeNickname,
    avatar: safeAvatar,
    entrySource: safeEntrySource,
    firstSeenAt: existing?.firstSeenAt || now,
    lastSeenAt: now,
    xp: safeXp,
    missionsCompletedCount: safeMissionsCount,
    interactionCount: existing?.interactionCount ?? 0,
    blocked: false,
    lastActionLabel: existing?.lastActionLabel || 'Ingresó a VITALIA',
  };

  if (!existing) {
    store.events.unshift({
      id: `evt-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      visitorId,
      nickname: safeNickname,
      avatar: safeAvatar,
      eventType: 'ingreso',
      label: safeEntrySource === 'qr' ? 'Ingresó mediante código QR' : 'Ingresó a la plataforma',
      createdAt: now,
    });
  }

  writeActivityStore(store);
  res.json({ ok: true, allowed: true });
});

app.post('/api/activity/event', (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const rate = checkScopedRateLimit('activity', clientIp, ACTIVITY_RATE_LIMIT_MAX);
  if (!rate.allowed) {
    res.status(429).json({ error: 'Demasiadas solicitudes.' });
    return;
  }

  const body = req.body as {
    visitorId?: unknown;
    nickname?: unknown;
    avatar?: unknown;
    eventType?: unknown;
    label?: unknown;
    detail?: unknown;
    xpDelta?: unknown;
    xp?: unknown;
    missionsCompletedCount?: unknown;
  };

  if (!isValidVisitorId(body?.visitorId)) {
    res.status(400).json({ error: 'Identificador inválido.' });
    return;
  }
  if (typeof body.eventType !== 'string' || !VALID_EVENT_TYPES.has(body.eventType)) {
    res.status(400).json({ error: 'Tipo de interacción inválido.' });
    return;
  }
  if (typeof body.label !== 'string' || !body.label.trim()) {
    res.status(400).json({ error: 'Descripción de interacción requerida.' });
    return;
  }

  const visitorId = body.visitorId.trim();
  const store = readActivityStore();
  const existing = store.visitors[visitorId];
  if (existing?.blocked) {
    res.status(403).json({ ok: false, blocked: true });
    return;
  }

  const now = new Date().toISOString();
  const safeNickname =
    typeof body.nickname === 'string' && body.nickname.trim()
      ? body.nickname.trim().slice(0, 32)
      : existing?.nickname || 'Explorador';
  const safeAvatar =
    typeof body.avatar === 'string' && VALID_AVATARS.has(body.avatar)
      ? body.avatar
      : existing?.avatar || 'vita';
  const safeLabel = body.label.trim().slice(0, 120);
  const safeDetail =
    typeof body.detail === 'string' && body.detail.trim()
      ? body.detail.trim().slice(0, 160)
      : undefined;
  const safeXpDelta =
    typeof body.xpDelta === 'number' && Number.isFinite(body.xpDelta) && body.xpDelta >= 0
      ? Math.min(1000, Math.floor(body.xpDelta))
      : undefined;
  const safeXp =
    typeof body.xp === 'number' && Number.isFinite(body.xp) && body.xp >= 0
      ? Math.min(100000, Math.floor(body.xp))
      : existing?.xp || 0;
  const safeMissionsCount =
    typeof body.missionsCompletedCount === 'number' &&
    Number.isFinite(body.missionsCompletedCount) &&
    body.missionsCompletedCount >= 0
      ? Math.min(500, Math.floor(body.missionsCompletedCount))
      : existing?.missionsCompletedCount || 0;

  store.visitors[visitorId] = {
    visitorId,
    nickname: safeNickname,
    avatar: safeAvatar,
    entrySource: existing?.entrySource || (body.eventType === 'qr_scan' ? 'qr' : 'directo'),
    firstSeenAt: existing?.firstSeenAt || now,
    lastSeenAt: now,
    xp: safeXp,
    missionsCompletedCount: safeMissionsCount,
    interactionCount: (existing?.interactionCount || 0) + 1,
    blocked: false,
    lastActionLabel: safeLabel,
  };

  store.events.unshift({
    id: `evt-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    visitorId,
    nickname: safeNickname,
    avatar: safeAvatar,
    eventType: body.eventType,
    label: safeLabel,
    detail: safeDetail,
    xpDelta: safeXpDelta,
    createdAt: now,
  });

  writeActivityStore(store);
  res.json({ ok: true });
});

// ============================================================
// Authorized Admin & Team Control Routes
// ============================================================

app.get('/api/admin/status', (req: AuthedRequest, res: Response) => {
  const envPasscode = process.env.VITALIA_ADMIN_PASSCODE?.trim() || '';
  const store = readActivityStore();
  const needsSetup = !envPasscode && !store.adminCredentialHash;

  const token = extractBearerToken(req);
  const payload = token ? verifySessionToken(token) : null;
  let authenticated = false;
  let operator: { id: string; name: string; role: 'primary' | 'collaborator' } | null = null;

  if (payload) {
    if (payload.role === 'primary') {
      authenticated = true;
      operator = { id: payload.operatorId, name: payload.operatorName, role: 'primary' };
    } else {
      const collab = store.collaborators.find((c) => c.id === payload.operatorId && c.active);
      if (collab) {
        authenticated = true;
        operator = { id: collab.id, name: collab.name, role: 'collaborator' };
      }
    }
  }

  res.json({
    needsSetup,
    usesEnvSecret: Boolean(envPasscode),
    authenticated,
    operator,
  });
});

app.post('/api/admin/setup', (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const rate = checkScopedRateLimit('auth', clientIp, AUTH_RATE_LIMIT_MAX);
  if (!rate.allowed) {
    res.status(429).json({ error: 'Demasiados intentos. Espera unos minutos.' });
    return;
  }

  const envPasscode = process.env.VITALIA_ADMIN_PASSCODE?.trim() || '';
  const store = readActivityStore();
  if (envPasscode || store.adminCredentialHash) {
    res.status(409).json({
      error: 'La clave maestra ya fue configurada. Inicia sesión con tu clave autorizada.',
    });
    return;
  }

  const { passcode } = req.body as { passcode?: unknown };
  if (typeof passcode !== 'string' || passcode.trim().length < 6 || passcode.trim().length > 64) {
    res.status(400).json({
      error: 'Elige una clave segura de entre 6 y 64 caracteres.',
    });
    return;
  }

  store.adminCredentialHash = hashSecret(passcode.trim());
  writeActivityStore(store);

  const token = signSessionToken({
    operatorId: 'primary-admin',
    operatorName: 'Administrador principal',
    role: 'primary',
  });

  res.json({
    ok: true,
    token,
    operator: {
      id: 'primary-admin',
      name: 'Administrador principal',
      role: 'primary',
    },
  });
});

app.post('/api/admin/login', (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const rate = checkScopedRateLimit('auth', clientIp, AUTH_RATE_LIMIT_MAX);
  if (!rate.allowed) {
    res.status(429).json({ error: 'Demasiados intentos fallidos. Espera unos minutos.' });
    return;
  }

  const { passcode } = req.body as { passcode?: unknown };
  if (typeof passcode !== 'string' || !passcode.trim()) {
    res.status(400).json({ error: 'Ingresa tu clave de acceso autorizado.' });
    return;
  }

  const candidate = passcode.trim();
  const envPasscode = process.env.VITALIA_ADMIN_PASSCODE?.trim() || '';
  const store = readActivityStore();

  // 1. Verify against env secret (takes precedence) or claimed primary admin hash
  const matchesPrimary = envPasscode
    ? verifyPlainSecretConstantTime(candidate, envPasscode)
    : store.adminCredentialHash
    ? verifySecretHash(candidate, store.adminCredentialHash)
    : false;

  if (matchesPrimary) {
    const token = signSessionToken({
      operatorId: 'primary-admin',
      operatorName: 'Administrador principal',
      role: 'primary',
    });
    res.json({
      ok: true,
      token,
      operator: {
        id: 'primary-admin',
        name: 'Administrador principal',
        role: 'primary',
      },
    });
    return;
  }

  // 2. Verify against active authorized collaborators
  const matchedCollab = store.collaborators.find(
    (c) => c.active && verifySecretHash(candidate, c.codeHash)
  );
  if (matchedCollab) {
    matchedCollab.lastLoginAt = new Date().toISOString();
    writeActivityStore(store);
    const token = signSessionToken({
      operatorId: matchedCollab.id,
      operatorName: matchedCollab.name,
      role: 'collaborator',
    });
    res.json({
      ok: true,
      token,
      operator: {
        id: matchedCollab.id,
        name: matchedCollab.name,
        role: 'collaborator',
      },
    });
    return;
  }

  res.status(401).json({ error: 'Clave no autorizada. Verifica con el responsable del proyecto.' });
});

app.post('/api/admin/logout', (req, res) => {
  const token = extractBearerToken(req);
  if (token) {
    const payload = verifySessionToken(token);
    if (payload) {
      revokedTokenIds.add(payload.jti);
    }
  }
  res.json({ ok: true });
});

app.get('/api/admin/overview', requireAuthorized, (req: AuthedRequest, res: Response) => {
  const store = readActivityStore();
  const visitors = Object.values(store.visitors).sort((a, b) =>
    b.lastSeenAt.localeCompare(a.lastSeenAt)
  );
  const events = store.events;

  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const activeLast24h = visitors.filter(
    (v) => new Date(v.lastSeenAt).getTime() >= oneDayAgo
  ).length;
  const qrScansCount = events.filter((e) => e.eventType === 'qr_scan').length;
  const missionsCompletedCount = events.filter((e) => e.eventType === 'mision_completada').length;

  const recipeCounts = new Map<string, number>();
  const missionCounts = new Map<string, number>();
  for (const ev of events) {
    if ((ev.eventType === 'receta' || ev.eventType === 'qr_scan') && ev.detail) {
      recipeCounts.set(ev.detail, (recipeCounts.get(ev.detail) || 0) + 1);
    }
    if (ev.eventType === 'mision_completada' && ev.detail) {
      missionCounts.set(ev.detail, (missionCounts.get(ev.detail) || 0) + 1);
    }
  }

  const topRecipes = Array.from(recipeCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  const topMissions = Array.from(missionCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  res.json({
    operator: req.operator,
    summaryStats: {
      totalVisitors: visitors.length,
      activeLast24h,
      totalInteractions: events.length,
      qrScansCount,
      missionsCompletedCount,
    },
    visitors,
    events: events.slice(0, 200),
    topRecipes,
    topMissions,
    collaborators: store.collaborators.map((c) => ({
      id: c.id,
      name: c.name,
      role: c.role,
      active: c.active,
      createdAt: c.createdAt,
      lastLoginAt: c.lastLoginAt,
    })),
    accessPolicy: {
      requireGroupCode: Boolean(store.accessPolicy.requireGroupCode && store.accessPolicy.groupCodeHash),
      groupCodeHint: store.accessPolicy.groupCodeHint || '',
    },
  });
});

app.post('/api/admin/collaborators', requirePrimaryAdmin, (req: AuthedRequest, res: Response) => {
  const { name, role, passcode } = req.body as {
    name?: unknown;
    role?: unknown;
    passcode?: unknown;
  };
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 48) {
    res.status(400).json({ error: 'Ingresa un nombre válido (máx. 48 caracteres).' });
    return;
  }
  if (typeof passcode !== 'string' || passcode.trim().length < 6 || passcode.trim().length > 64) {
    res.status(400).json({ error: 'La clave personal debe tener entre 6 y 64 caracteres.' });
    return;
  }

  const store = readActivityStore();
  if (store.collaborators.length >= 30) {
    res.status(400).json({ error: 'Se alcanzó el límite de personas autorizadas.' });
    return;
  }

  const safeRole =
    typeof role === 'string' && role.trim() ? role.trim().slice(0, 40) : 'Docente / Equipo';

  const newCollab: StoredCollaborator = {
    id: `col-${crypto.randomUUID().slice(0, 8)}`,
    name: name.trim(),
    role: safeRole,
    codeHash: hashSecret(passcode.trim()),
    active: true,
    createdAt: new Date().toISOString(),
  };

  store.collaborators.unshift(newCollab);
  writeActivityStore(store);

  res.json({
    ok: true,
    collaborator: {
      id: newCollab.id,
      name: newCollab.name,
      role: newCollab.role,
      active: newCollab.active,
      createdAt: newCollab.createdAt,
    },
  });
});

app.patch('/api/admin/collaborators/:id', requirePrimaryAdmin, (req: AuthedRequest, res: Response) => {
  const collabId = req.params.id;
  const { active } = req.body as { active?: unknown };
  if (typeof active !== 'boolean') {
    res.status(400).json({ error: 'Estado inválido.' });
    return;
  }
  const store = readActivityStore();
  const target = store.collaborators.find((c) => c.id === collabId);
  if (!target) {
    res.status(404).json({ error: 'Persona autorizada no encontrada.' });
    return;
  }
  target.active = active;
  writeActivityStore(store);
  res.json({ ok: true });
});

app.delete('/api/admin/collaborators/:id', requirePrimaryAdmin, (req: AuthedRequest, res: Response) => {
  const collabId = req.params.id;
  const store = readActivityStore();
  const nextList = store.collaborators.filter((c) => c.id !== collabId);
  if (nextList.length === store.collaborators.length) {
    res.status(404).json({ error: 'Persona autorizada no encontrada.' });
    return;
  }
  store.collaborators = nextList;
  writeActivityStore(store);
  res.json({ ok: true });
});

app.patch('/api/admin/visitors/:visitorId', requireAuthorized, (req: AuthedRequest, res: Response) => {
  const visitorId = req.params.visitorId;
  const { blocked } = req.body as { blocked?: unknown };
  if (!isValidVisitorId(visitorId) || typeof blocked !== 'boolean') {
    res.status(400).json({ error: 'Parámetros inválidos.' });
    return;
  }
  const store = readActivityStore();
  const target = store.visitors[visitorId];
  if (!target) {
    res.status(404).json({ error: 'Visitante no encontrado.' });
    return;
  }
  target.blocked = blocked;
  writeActivityStore(store);
  res.json({ ok: true, blocked });
});

app.post('/api/admin/access-policy', requireAuthorized, (req: AuthedRequest, res: Response) => {
  const { requireGroupCode, groupCode, groupCodeHint } = req.body as {
    requireGroupCode?: unknown;
    groupCode?: unknown;
    groupCodeHint?: unknown;
  };
  if (typeof requireGroupCode !== 'boolean') {
    res.status(400).json({ error: 'Configuración inválida.' });
    return;
  }
  const store = readActivityStore();
  const cleanCode = typeof groupCode === 'string' ? groupCode.trim() : '';

  if (requireGroupCode && !cleanCode && !store.accessPolicy.groupCodeHash) {
    res.status(400).json({ error: 'Define un código de grupo escolar (mínimo 3 caracteres).' });
    return;
  }
  if (cleanCode && (cleanCode.length < 3 || cleanCode.length > 32)) {
    res.status(400).json({ error: 'El código de grupo debe tener entre 3 y 32 caracteres.' });
    return;
  }

  store.accessPolicy.requireGroupCode = requireGroupCode;
  if (cleanCode) {
    store.accessPolicy.groupCodeHash = hashSecret(cleanCode);
  }
  if (typeof groupCodeHint === 'string') {
    store.accessPolicy.groupCodeHint = groupCodeHint.trim().slice(0, 80);
  }
  writeActivityStore(store);

  res.json({
    ok: true,
    accessPolicy: {
      requireGroupCode: Boolean(store.accessPolicy.requireGroupCode && store.accessPolicy.groupCodeHash),
      groupCodeHint: store.accessPolicy.groupCodeHint,
    },
  });
});

app.delete('/api/admin/events', requirePrimaryAdmin, (_req: AuthedRequest, res: Response) => {
  const store = readActivityStore();
  store.events = [];
  writeActivityStore(store);
  res.json({ ok: true });
});

app.post('/api/vita-chat', async (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const rateCheck = checkRateLimit(clientIp);
  if (!rateCheck.allowed) {
    res.status(429).json({
      error: `Has enviado varias preguntas seguidas. Espera ${rateCheck.retryAfterSec ?? 60} segundos antes de volver a consultar a VITA RESPONDE.`,
    });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      error: 'El asistente VITA RESPONDE no tiene configurada la clave de servicio de IA en el servidor. Mientras tanto, todas las misiones, recetas, el laboratorio y BIOTEC funcionan sin conexión al asistente.',
    });
    return;
  }

  const { message, history, context } = req.body as {
    message?: unknown;
    history?: Array<{ role: 'user' | 'assistant'; text: string }>;
    context?: { nickname?: string; stage?: string; allergies?: string[] };
  };

  if (typeof message !== 'string' || message.trim().length === 0) {
    res.status(400).json({ error: 'Escribe una pregunta para que VITA pueda ayudarte.' });
    return;
  }

  if (message.trim().length > 600) {
    res.status(400).json({ error: 'Tu pregunta es muy larga. Intenta resumirla en menos de 600 caracteres.' });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const userContextParts: string[] = [];
    if (context?.nickname) {
      userContextParts.push(`El estudiante se llama "${context.nickname}".`);
    }
    if (context?.stage) {
      userContextParts.push(`Su etapa actual de VITA es "${context.stage}".`);
    }
    if (Array.isArray(context?.allergies) && context.allergies.length > 0) {
      userContextParts.push(`Ingredientes que prefiere evitar o tiene alergia: ${context.allergies.join(', ')}.`);
    }

    const recentHistory = Array.isArray(history)
      ? history.slice(-6).map((item) => ({
          role: item.role === 'assistant' ? ('model' as const) : ('user' as const),
          parts: [{ text: String(item.text).slice(0, 800) }],
        }))
      : [];

    const fullSystemInstruction =
      userContextParts.length > 0
        ? `${VITA_SYSTEM_INSTRUCTION}\n\nCONTEXTO ACTUAL DEL ESTUDIANTE:\n${userContextParts.join('\n')}`
        : VITA_SYSTEM_INSTRUCTION;

    const contents = [
      ...recentHistory,
      { role: 'user' as const, parts: [{ text: message.trim() }] },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents,
      config: {
        systemInstruction: fullSystemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const replyText = response.text?.trim();
    if (!replyText) {
      res.status(502).json({ error: 'VITA no recibió una respuesta clara del servicio. Intenta formular tu pregunta de otra manera.' });
      return;
    }

    res.json({ reply: replyText });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido al conectar con el servicio de IA.';
    if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      res.status(429).json({
        error: 'El servicio de VITA RESPONDE alcanzó temporalmente su límite de consultas. Intenta de nuevo en unos momentos.',
      });
      return;
    }
    if (errorMessage.includes('403') || errorMessage.includes('400') || errorMessage.includes('API_KEY')) {
      res.status(502).json({
        error: 'No se pudo autenticar con el servicio de IA. Revisa la configuración de GEMINI_API_KEY en el panel de secretos.',
      });
      return;
    }
    res.status(500).json({
      error: 'Ocurrió un problema temporal al consultar a VITA RESPONDE. Puedes seguir explorando misiones, recetas y BIOTEC mientras tanto.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VITALIA server running on http://localhost:${PORT}`);
  });
}

startServer();
