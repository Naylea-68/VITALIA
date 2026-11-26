import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Ban,
  CheckCircle2,
  Download,
  KeyRound,
  Lock,
  LogOut,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Unlock,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  AccessPolicySummary,
  ActivityEventRecord,
  ActivityEventType,
  AuthorizedCollaborator,
  BiotecProject,
  Recipe,
  VisitorRecord,
} from '../../types/vitalia';
import { UniverseCharacter, VitaMascot } from '../characters/VitaCharacters';

interface OperatorInfo {
  id: string;
  name: string;
  role: 'primary' | 'collaborator';
}

interface AdminOverviewResponse {
  operator: OperatorInfo;
  summaryStats: {
    totalVisitors: number;
    activeLast24h: number;
    totalInteractions: number;
    qrScansCount: number;
    missionsCompletedCount: number;
  };
  visitors: VisitorRecord[];
  events: ActivityEventRecord[];
  topRecipes: { name: string; count: number }[];
  topMissions: { name: string; count: number }[];
  collaborators: AuthorizedCollaborator[];
  accessPolicy: AccessPolicySummary;
}

interface AuthorizedControlPanelProps {
  token: string | null;
  onTokenChange: (token: string | null) => void;
  recipesCount: number;
  biotecCount: number;
  onAddRecipe: (recipe: Recipe) => Promise<boolean> | boolean | void;
  onAddBiotecProject: (proj: BiotecProject) => Promise<boolean> | boolean | void;
}

const EVENT_TYPE_LABELS: Record<ActivityEventType, { label: string; badgeClass: string }> = {
  ingreso: { label: 'Ingreso', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  onboarding: { label: 'Registro', badgeClass: 'bg-teal-50 text-teal-800 border-teal-200' },
  qr_scan: { label: 'Escaneo QR', badgeClass: 'bg-amber-50 text-amber-900 border-amber-200' },
  receta: { label: 'Receta', badgeClass: 'bg-lime-50 text-lime-900 border-lime-200' },
  mision_inicio: { label: 'Inició misión', badgeClass: 'bg-sky-50 text-sky-800 border-sky-200' },
  mision_completada: { label: 'Completó misión', badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  desafio_diario: { label: 'Desafío diario', badgeClass: 'bg-yellow-50 text-yellow-900 border-yellow-200' },
  biotec: { label: 'BIOTEC', badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
  movimiento: { label: 'Movimiento', badgeClass: 'bg-orange-50 text-orange-800 border-orange-200' },
  bienestar: { label: 'Bienestar', badgeClass: 'bg-violet-50 text-violet-800 border-violet-200' },
  vita_chat: { label: 'VITA RESPONDE', badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
};

function formatDateTimeEs(iso: string): string {
  try {
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function escapeCsvCell(value: string | number | undefined): string {
  const str = String(value ?? '');
  const safe = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  return `"${safe.replace(/"/g, '""')}"`;
}

export const AuthorizedControlPanel: React.FC<AuthorizedControlPanelProps> = ({
  token,
  onTokenChange,
  recipesCount,
  biotecCount,
  onAddRecipe,
  onAddBiotecProject,
}) => {
  const [statusLoading, setStatusLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [usesEnvSecret, setUsesEnvSecret] = useState(false);
  const [operator, setOperator] = useState<OperatorInfo | null>(null);

  // Login / setup forms
  const [passcodeInput, setPasscodeInput] = useState('');
  const [setupPasscode, setSetupPasscode] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Dashboard state
  const [innerTab, setInnerTab] = useState<'actividad' | 'accesos' | 'contenido'>('actividad');
  const [overview, setOverview] = useState<AdminOverviewResponse | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [panelFeedback, setPanelFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );

  // Filters
  const [visitorSearch, setVisitorSearch] = useState('');
  const [visitorFilter, setVisitorFilter] = useState<'todos' | 'qr' | 'directo' | 'pausados'>('todos');
  const [confirmClearEvents, setConfirmClearEvents] = useState(false);

  // Access policy form
  const [requireGroupCode, setRequireGroupCode] = useState(false);
  const [groupCodeInput, setGroupCodeInput] = useState('');
  const [groupCodeHint, setGroupCodeHint] = useState('');
  const [savingPolicy, setSavingPolicy] = useState(false);

  // Collaborator form
  const [collabName, setCollabName] = useState('');
  const [collabRole, setCollabRole] = useState('Docente / Equipo');
  const [collabCode, setCollabCode] = useState('');
  const [savingCollab, setSavingCollab] = useState(false);

  // Content publish forms
  const [recName, setRecName] = useState('');
  const [recTime, setRecTime] = useState('15 min');
  const [recPrice, setRecPrice] = useState('');
  const [recIngredients, setRecIngredients] = useState('');
  const [recSteps, setRecSteps] = useState('');
  const [recNutrients, setRecNutrients] = useState('');
  const [bioTitle, setBioTitle] = useState('');
  const [bioMaterials, setBioMaterials] = useState('');
  const [bioProcess, setBioProcess] = useState('');
  const [bioObs, setBioObs] = useState('');

  const showFeedback = (type: 'ok' | 'err', text: string) => {
    setPanelFeedback({ type, text });
    setTimeout(() => setPanelFeedback(null), 4000);
  };

  const fetchOverview = useCallback(
    async (activeToken: string) => {
      setOverviewLoading(true);
      try {
        const res = await fetch('/api/admin/overview', {
          headers: { Authorization: `Bearer ${activeToken}` },
        });
        if (res.status === 401 || res.status === 403) {
          onTokenChange(null);
          setOperator(null);
          setOverview(null);
          return;
        }
        if (!res.ok) {
          throw new Error('No se pudo cargar la actividad.');
        }
        const data = (await res.json()) as AdminOverviewResponse;
        setOverview(data);
        setOperator(data.operator);
        setRequireGroupCode(data.accessPolicy.requireGroupCode);
        setGroupCodeHint(data.accessPolicy.groupCodeHint || '');
      } catch {
        showFeedback('err', 'No fue posible consultar el registro en el servidor.');
      } finally {
        setOverviewLoading(false);
      }
    },
    [onTokenChange]
  );

  const checkStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const res = await fetch('/api/admin/status', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error('Estado no disponible');
      const data = (await res.json()) as {
        needsSetup: boolean;
        usesEnvSecret: boolean;
        authenticated: boolean;
        operator: OperatorInfo | null;
      };
      setNeedsSetup(data.needsSetup);
      setUsesEnvSecret(data.usesEnvSecret);
      if (data.authenticated && data.operator && token) {
        setOperator(data.operator);
        await fetchOverview(token);
      } else {
        setOperator(null);
        if (token && !data.authenticated) {
          onTokenChange(null);
        }
      }
    } catch {
      setIsConfigured(true); setNeedsSeptup(false); setStatus('disconnected');
    } finally {
      setStatusLoading(false);
    }
  }, [token, fetchOverview, onTokenChange]);

  useEffect(() => {
    void checkStatus();
  }, [checkStatus]);

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (setupPasscode.trim().length < 6) {
      setAuthError('La clave maestra debe tener al menos 6 caracteres.');
      return;
    }
    if (setupPasscode.trim() !== setupConfirm.trim()) {
      setAuthError('Las dos claves no coinciden. Verifica antes de guardar.');
      return;
    }
    setAuthSubmitting(true);
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: setupPasscode.trim() }),
      });
      const data = (await res.json()) as { token?: string; operator?: OperatorInfo; error?: string };
      if (!res.ok || !data.token) {
        setAuthError(data.error || 'No se pudo guardar la clave maestra.');
        return;
      }
      setSetupPasscode('');
      setSetupConfirm('');
      setNeedsSetup(false);
      onTokenChange(data.token);
      if (data.operator) setOperator(data.operator);
      await fetchOverview(data.token);
    } catch {
      setAuthError('Error de conexión al configurar la clave.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!passcodeInput.trim()) {
      setAuthError('Ingresa tu clave de acceso autorizado.');
      return;
    }
    setAuthSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcodeInput.trim() }),
      });
      const data = (await res.json()) as { token?: string; operator?: OperatorInfo; error?: string };
      if (!res.ok || !data.token) {
        setAuthError(data.error || 'Clave no autorizada.');
        return;
      }
      setPasscodeInput('');
      onTokenChange(data.token);
      if (data.operator) setOperator(data.operator);
      await fetchOverview(data.token);
    } catch {
      setAuthError('No fue posible validar la clave con el servidor.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (token) {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    onTokenChange(null);
    setOperator(null);
    setOverview(null);
  };

  const handleToggleVisitorBlock = async (visitor: VisitorRecord) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/visitors/${encodeURIComponent(visitor.visitorId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ blocked: !visitor.blocked }),
      });
      if (!res.ok) {
        showFeedback('err', 'No se pudo actualizar el estado del visitante.');
        return;
      }
      showFeedback(
        'ok',
        !visitor.blocked
          ? `Acceso pausado para ${visitor.nickname}.`
          : `Acceso reactivado para ${visitor.nickname}.`
      );
      await fetchOverview(token);
    } catch {
      showFeedback('err', 'Error de conexión al actualizar acceso.');
    }
  };

  const handleSaveAccessPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSavingPolicy(true);
    try {
      const res = await fetch('/api/admin/access-policy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requireGroupCode,
          groupCode: groupCodeInput.trim() || undefined,
          groupCodeHint: groupCodeHint.trim(),
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        showFeedback('err', data.error || 'No se pudo guardar la política de ingreso.');
        return;
      }
      setGroupCodeInput('');
      showFeedback(
        'ok',
        requireGroupCode
          ? 'Modo con código de grupo activado para nuevos ingresos.'
          : 'Modo libre activado: los visitantes entran directamente a jugar.'
      );
      await fetchOverview(token);
    } catch {
      showFeedback('err', 'Error al guardar la política de ingreso.');
    } finally {
      setSavingPolicy(false);
    }
  };

  const handleCreateCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSavingCollab(true);
    try {
      const res = await fetch('/api/admin/collaborators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: collabName.trim(),
          role: collabRole.trim(),
          passcode: collabCode.trim(),
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        showFeedback('err', data.error || 'No se pudo registrar a la persona autorizada.');
        return;
      }
      setCollabName('');
      setCollabCode('');
      showFeedback('ok', 'Persona autorizada agregada con su clave personal.');
      await fetchOverview(token);
    } catch {
      showFeedback('err', 'Error al registrar persona autorizada.');
    } finally {
      setSavingCollab(false);
    }
  };

  const handleToggleCollaborator = async (collab: AuthorizedCollaborator) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/collaborators/${encodeURIComponent(collab.id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active: !collab.active }),
      });
      if (!res.ok) {
        showFeedback('err', 'No se pudo cambiar el estado de autorización.');
        return;
      }
      showFeedback(
        'ok',
        !collab.active
          ? `Se reactivó el acceso para ${collab.name}.`
          : `Se revocó el acceso de ${collab.name}.`
      );
      await fetchOverview(token);
    } catch {
      showFeedback('err', 'Error al actualizar autorización.');
    }
  };

  const handleDeleteCollaborator = async (collab: AuthorizedCollaborator) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/collaborators/${encodeURIComponent(collab.id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        showFeedback('err', 'No se pudo eliminar a la persona autorizada.');
        return;
      }
      showFeedback('ok', `${collab.name} fue retirado de la lista autorizada.`);
      await fetchOverview(token);
    } catch {
      showFeedback('err', 'Error al eliminar autorización.');
    }
  };

  const handleClearEvents = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/events', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        showFeedback('err', 'No se pudo limpiar el historial.');
        return;
      }
      setConfirmClearEvents(false);
      showFeedback('ok', 'Historial de interacciones limpiado.');
      await fetchOverview(token);
    } catch {
      showFeedback('err', 'Error al limpiar el historial.');
    }
  };

  const handleExportCsv = () => {
    if (!overview) return;
    const headers = [
      'Fecha',
      'Apodo',
      'Tipo de interacción',
      'Actividad',
      'Detalle',
      'XP obtenido',
    ];
    const rows = overview.events.map((ev) => [
      escapeCsvCell(formatDateTimeEs(ev.createdAt)),
      escapeCsvCell(ev.nickname),
      escapeCsvCell(EVENT_TYPE_LABELS[ev.eventType]?.label || ev.eventType),
      escapeCsvCell(ev.label),
      escapeCsvCell(ev.detail || ''),
      escapeCsvCell(ev.xpDelta ?? 0),
    ]);
    const csvContent = [headers.map(escapeCsvCell).join(','), ...rows.map((r) => r.join(','))].join(
      '\n'
    );
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vitalia-interacciones-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredVisitors = useMemo(() => {
    if (!overview) return [];
    const q = visitorSearch.trim().toLowerCase();
    return overview.visitors.filter((v) => {
      if (visitorFilter === 'qr' && v.entrySource !== 'qr') return false;
      if (visitorFilter === 'directo' && v.entrySource !== 'directo') return false;
      if (visitorFilter === 'pausados' && !v.blocked) return false;
      if (!q) return true;
      return (
        v.nickname.toLowerCase().includes(q) ||
        (v.lastActionLabel || '').toLowerCase().includes(q)
      );
    });
  }, [overview, visitorSearch, visitorFilter]);

  const handleCreateAdminRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recName.trim()) return;
    const parsedPrice = Number(recPrice);
    const hasPrice = parsedPrice > 0;
    const newRec: Recipe = {
      id: `rec-custom-${Date.now()}`,
      qrCode: `VITALIA-REC-${String(recipesCount + 1).padStart(2, '0')}`,
      name: recName.trim(),
      brandLine: 'Agregada por equipo autorizado',
      category: 'comida',
      isProjectRecipe: true,
      prepTime: recTime || '15 min',
      difficulty: 'Sencilla',
      costLevel: 'Económica',
      ingredients: recIngredients
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      keyIngredientTags: ['avena', 'platano'],
      allergens: [],
      steps: recSteps
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      substitutions: ['Adapta con ingredientes de temporada disponibles.'],
      nutrientsInfo: recNutrients.trim() || 'Aporta energía y nutrientes de ingredientes frescos.',
      accentColor: 'emerald',
      economics: hasPrice
        ? {
            portionLabel: '1 porción',
            unitCost: parsedPrice,
            suggestedPrice: parsedPrice,
            isEstimate: false,
            breakdown: [],
          }
        : undefined,
    };
    const saved = await onAddRecipe(newRec);
    if (saved === false) {
      showFeedback('err', 'Tu sesión expiró al guardar la receta. Inicia sesión de nuevo.');
      return;
    }
    setRecName('');
    setRecPrice('');
    setRecIngredients('');
    setRecSteps('');
    setRecNutrients('');
    showFeedback('ok', 'Receta publicada en el Recetario, menú escolar y carteles QR.');
  };

  const handleCreateAdminBiotec = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bioTitle.trim()) return;
    const newProj: BiotecProject = {
      id: `bio-custom-${Date.now()}`,
      title: bioTitle.trim(),
      originMaterials: bioMaterials
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      processSummary: bioProcess.trim() || 'Proceso experimental documentado en taller escolar.',
      observations: bioObs.trim() || 'Muestra en observación de flexibilidad y resistencia.',
      possibleApplications: ['Prototipo escolar para exposición BIOTEC'],
      safetyDisclaimer:
        'Prototipo educativo experimental. Requiere pruebas adicionales de seguridad y degradación.',
      isTeamPrototype: true,
    };
    const saved = await onAddBiotecProject(newProj);
    if (saved === false) {
      showFeedback('err', 'Tu sesión expiró al publicar en BIOTEC.');
      return;
    }
    setBioTitle('');
    setBioMaterials('');
    setBioProcess('');
    setBioObs('');
    showFeedback('ok', 'Proyecto BIOTEC publicado en la Galería de innovación.');
  };

  if (statusLoading) {
    return (
      <section className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
        <VitaMascot stage="brote" expression="curiosidad" size={88} />
        <p className="text-sm font-medium text-slate-600">
          Verificando acceso autorizado de VITALIA...
        </p>
      </section>
    );
  }

  // Gate: Unauthenticated view
  if (!operator || !token) {
    return (
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Zona exclusiva para equipo autorizado
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Los estudiantes y visitantes juegan, escanean QR y contestan misiones libremente; este espacio es únicamente para supervisar ingresos, interacciones y contenidos.
              </p>
            </div>
          </div>
          <div className="shrink-0 self-center sm:self-auto">
            <VitaMascot stage="guardian" expression="concentracion" size={76} />
          </div>
        </div>

        {needsSetup ? (
          <form
            onSubmit={handleSetupSubmit}
            className="max-w-md space-y-4 p-5 rounded-2xl bg-[#F6FAF7] border border-emerald-200"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-950">
              <KeyRound className="w-4 h-4 text-emerald-700" />
              <span>Configuración inicial de clave maestra</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Aún no existe una clave maestra registrada. Crea la clave privada del responsable de VITALIA (mínimo 6 caracteres) para proteger el panel y autorizar a tus compañeros o docentes.
            </p>
            <div className="space-y-2.5">
              <input
                type="password"
                required
                minLength={6}
                maxLength={64}
                value={setupPasscode}
                onChange={(e) => setSetupPasscode(e.target.value)}
                placeholder="Nueva clave maestra (mín. 6 caracteres)"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              />
              <input
                type="password"
                required
                minLength={6}
                maxLength={64}
                value={setupConfirm}
                onChange={(e) => setSetupConfirm(e.target.value)}
                placeholder="Confirmar clave maestra"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              />
            </div>
            {authError && (
              <p className="text-xs text-rose-700 font-medium">{authError}</p>
            )}
            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{authSubmitting ? 'Guardando...' : 'Activar clave y entrar al panel'}</span>
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleLoginSubmit}
            className="max-w-md space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Lock className="w-4 h-4 text-emerald-700" />
              <span>Iniciar sesión como persona autorizada</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ingresa la clave maestra del proyecto o la clave personal que te asignó el responsable de VITALIA.
              {usesEnvSecret ? ' La clave principal está protegida desde el servidor.' : ''}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="password"
                required
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Clave de acceso autorizado"
                className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              />
              <button
                type="submit"
                disabled={authSubmitting}
                className="min-h-[44px] px-5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>{authSubmitting ? 'Validando...' : 'Entrar'}</span>
              </button>
            </div>
            {authError && (
              <p className="text-xs text-rose-700 font-medium">{authError}</p>
            )}
          </form>
        )}
      </section>
    );
  }

  return (
    <section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">
                Control y monitoreo VITALIA
              </h2>
              <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {operator.name} · {operator.role === 'primary' ? 'Principal' : 'Autorizado'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Seguimiento en vivo de ingresos, escaneos QR, misiones e interacción de la comunidad.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void fetchOverview(token)}
            disabled={overviewLoading}
            className="min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${overviewLoading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="min-h-[40px] px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>

      {panelFeedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-medium flex items-center gap-2 ${
            panelFeedback.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}
        >
          {panelFeedback.type === 'ok' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
          )}
          <span>{panelFeedback.text}</span>
        </div>
      )}

      {/* Inner Sub-navigation */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-50 border border-slate-200 rounded-2xl">
        {[
          { id: 'actividad', label: 'Ingresos e interacciones', icon: Activity },
          { id: 'accesos', label: 'Control de accesos', icon: Users },
          { id: 'contenido', label: 'Publicar contenido', icon: Plus },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = innerTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setInnerTab(tab.id as typeof innerTab)}
              className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                active
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Ingresos e interacciones */}
      {innerTab === 'actividad' && overview && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#F6FAF7] border border-emerald-200">
              <p className="text-xs text-slate-600">Personas que ingresaron</p>
              <p className="font-mono-num text-2xl font-bold text-slate-900 mt-1">
                {overview.summaryStats.totalVisitors}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200">
              <p className="text-xs text-slate-600">Activos en 24 horas</p>
              <p className="font-mono-num text-2xl font-bold text-sky-900 mt-1">
                {overview.summaryStats.activeLast24h}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
              <p className="text-xs text-slate-600">Interacciones registradas</p>
              <p className="font-mono-num text-2xl font-bold text-amber-900 mt-1">
                {overview.summaryStats.totalInteractions}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200">
              <p className="text-xs text-slate-600">Escaneos QR / Misiones</p>
              <p className="font-mono-num text-2xl font-bold text-indigo-900 mt-1">
                {overview.summaryStats.qrScansCount} / {overview.summaryStats.missionsCompletedCount}
              </p>
            </div>
          </div>

          {/* Visitors directory */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Registro de visitantes ({filteredVisitors.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Puedes observar cómo entró cada participante y pausar o reactivar el acceso desde un dispositivo si lo necesitas.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={visitorSearch}
                    onChange={(e) => setVisitorSearch(e.target.value)}
                    placeholder="Buscar apodo o acción..."
                    className="w-full sm:w-52 min-h-[38px] pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs"
                  />
                </div>
                <select
                  value={visitorFilter}
                  onChange={(e) => setVisitorFilter(e.target.value as typeof visitorFilter)}
                  aria-label="Filtrar visitantes"
                  className="min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700"
                >
                  <option value="todos">Todos</option>
                  <option value="qr">Entraron por QR</option>
                  <option value="directo">Ingreso directo</option>
                  <option value="pausados">Con acceso pausado</option>
                </select>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  disabled={overview.events.length === 0}
                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar CSV</span>
                </button>
              </div>
            </div>

            {filteredVisitors.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                Aún no hay visitantes que coincidan con este filtro. En cuanto alguien entre a VITALIA aparecerá aquí automáticamente.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
                {filteredVisitors.map((v) => (
                  <div
                    key={v.visitorId}
                    className={`p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      v.blocked ? 'bg-rose-50/40' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0">
                        <UniverseCharacter character={v.avatar} size={40} vitaStage="brote" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-display font-bold text-sm text-slate-900 truncate">
                            {v.nickname}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border inline-flex items-center gap-1 ${
                              v.entrySource === 'qr'
                                ? 'bg-amber-50 text-amber-900 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {v.entrySource === 'qr' && <QrCode className="w-3 h-3" />}
                            {v.entrySource === 'qr' ? 'Vía QR' : 'Directo'}
                          </span>
                          {v.blocked && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              Acceso pausado
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 truncate mt-0.5">
                          {v.lastActionLabel || 'Explorando VITALIA'}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono-num mt-0.5">
                          {v.xp} XP · {v.missionsCompletedCount} misiones · {v.interactionCount} interacciones · Última vez: {formatDateTimeEs(v.lastSeenAt)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleToggleVisitorBlock(v)}
                      className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold border inline-flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors ${
                        v.blocked
                          ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                          : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                      }`}
                    >
                      {v.blocked ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Permitir acceso</span>
                        </>
                      ) : (
                        <>
                          <Ban className="w-3.5 h-3.5" />
                          <span>Pausar acceso</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top content & Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Timeline */}
            <div className="lg:col-span-8 rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display font-bold text-base text-slate-900">
                  Actividad reciente ({overview.events.length})
                </h3>
                {operator.role === 'primary' && overview.events.length > 0 && (
                  !confirmClearEvents ? (
                    <button
                      type="button"
                      onClick={() => setConfirmClearEvents(true)}
                      className="text-xs font-semibold text-rose-700 hover:underline cursor-pointer"
                    >
                      Limpiar historial
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void handleClearEvents()}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold cursor-pointer"
                      >
                        Confirmar borrado
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmClearEvents(false)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  )
                )}
              </div>

              {overview.events.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  Todavía no hay interacciones registradas. Cada misión, receta abierta, escaneo QR o pregunta a VITA se mostrará aquí.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
                  {overview.events.map((ev) => {
                    const meta = EVENT_TYPE_LABELS[ev.eventType] || {
                      label: ev.eventType,
                      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
                    };
                    return (
                      <div key={ev.id} className="p-3.5 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-xs sm:text-sm text-slate-900">
                              {ev.nickname}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${meta.badgeClass}`}
                            >
                              {meta.label}
                            </span>
                            {typeof ev.xpDelta === 'number' && ev.xpDelta > 0 && (
                              <span className="font-mono-num text-[11px] font-bold text-emerald-700">
                                +{ev.xpDelta} XP
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-700 mt-0.5">
                            {ev.label}
                            {ev.detail ? ` — ${ev.detail}` : ''}
                          </p>
                        </div>
                        <span className="text-[11px] font-mono-num text-slate-400 shrink-0">
                          {formatDateTimeEs(ev.createdAt)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Popular items */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
                <h3 className="font-display font-bold text-sm text-slate-900">
                  Recetas y QR más consultados
                </h3>
                {overview.topRecipes.length === 0 ? (
                  <p className="text-xs text-slate-500">Sin consultas registradas aún.</p>
                ) : (
                  <ul className="space-y-2">
                    {overview.topRecipes.map((item) => (
                      <li
                        key={item.name}
                        className="flex items-center justify-between gap-2 text-xs text-slate-700"
                      >
                        <span className="truncate">{item.name}</span>
                        <span className="font-mono-num font-bold text-emerald-700 shrink-0">
                          {item.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
                <h3 className="font-display font-bold text-sm text-slate-900">
                  Misiones más completadas
                </h3>
                {overview.topMissions.length === 0 ? (
                  <p className="text-xs text-slate-500">Sin misiones completadas aún.</p>
                ) : (
                  <ul className="space-y-2">
                    {overview.topMissions.map((item) => (
                      <li
                        key={item.name}
                        className="flex items-center justify-between gap-2 text-xs text-slate-700"
                      >
                        <span className="truncate">{item.name}</span>
                        <span className="font-mono-num font-bold text-indigo-700 shrink-0">
                          {item.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Control de accesos */}
      {innerTab === 'accesos' && overview && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student/Visitor entry policy */}
          <form
            onSubmit={handleSaveAccessPolicy}
            className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4"
          >
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Ingreso de la comunidad y estudiantes
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Por defecto cualquier persona entra directamente a jugar y contestar. Si lo prefieres en clase o exposición, puedes activar un código de grupo escolar para nuevos ingresos.
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer">
                <input
                  type="radio"
                  name="entry-mode"
                  checked={!requireGroupCode}
                  onChange={() => setRequireGroupCode(false)}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Ingreso libre (solo juegan y contestan)
                  </p>
                  <p className="text-xs text-slate-500">
                    Ideal para carteles QR en la escuela y comunidad abierta.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer">
                <input
                  type="radio"
                  name="entry-mode"
                  checked={requireGroupCode}
                  onChange={() => setRequireGroupCode(true)}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Solicitar código de grupo escolar al entrar
                  </p>
                  <p className="text-xs text-slate-500">
                    Solo quienes tengan el código del salón podrán registrarse por primera vez.
                  </p>
                </div>
              </label>
            </div>

            {requireGroupCode && (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código de grupo escolar
                  </label>
                  <input
                    type="text"
                    value={groupCodeInput}
                    onChange={(e) => setGroupCodeInput(e.target.value)}
                    placeholder={
                      overview.accessPolicy.requireGroupCode
                        ? 'Escribe uno nuevo solo si deseas cambiarlo'
                        : 'Ej. VITALIA-3B'
                    }
                    className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Indicación visible en la pantalla de entrada (opcional)
                  </label>
                  <input
                    type="text"
                    maxLength={80}
                    value={groupCodeHint}
                    onChange={(e) => setGroupCodeHint(e.target.value)}
                    placeholder="Ej. Pide el código a tu docente o en el módulo de VITALIA"
                    className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={savingPolicy}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold cursor-pointer"
            >
              {savingPolicy ? 'Guardando...' : 'Guardar regla de ingreso'}
            </button>
          </form>

          {/* Authorized panel operators */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Personas autorizadas al panel ({overview.collaborators.length + 1})
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Solo las personas aquí registradas pueden ver estadísticas, aprobar/pausar visitantes o publicar recetas.
              </p>
            </div>

            {operator.role === 'primary' ? (
              <form
                onSubmit={handleCreateCollaborator}
                className="p-4 rounded-xl bg-white border border-slate-200 space-y-2.5"
              >
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-emerald-700" />
                  <span>Autorizar nueva persona</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    maxLength={48}
                    value={collabName}
                    onChange={(e) => setCollabName(e.target.value)}
                    placeholder="Nombre completo"
                    className="min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                  <input
                    type="text"
                    maxLength={40}
                    value={collabRole}
                    onChange={(e) => setCollabRole(e.target.value)}
                    placeholder="Rol (ej. Docente, Equipo)"
                    className="min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    required
                    minLength={6}
                    maxLength={64}
                    value={collabCode}
                    onChange={(e) => setCollabCode(e.target.value)}
                    placeholder="Clave personal (mín. 6 caracteres)"
                    className="flex-1 min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                  <button
                    type="submit"
                    disabled={savingCollab}
                    className="min-h-[40px] px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                  >
                    {savingCollab ? 'Agregando...' : 'Autorizar'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
                Ingresaste con una clave de colaborador. Solo la administración principal puede dar de alta o revocar accesos de otras personas.
              </div>
            )}

            <div className="space-y-2 max-h-[260px] overflow-y-auto">
              <div className="p-3 rounded-xl bg-white border border-emerald-200 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-slate-900">Administrador principal</p>
                  <p className="text-[11px] text-emerald-700">Control total del proyecto</p>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Activo
                </span>
              </div>

              {overview.collaborators.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{c.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {c.role}
                      {c.lastLoginAt ? ` · Último acceso: ${formatDateTimeEs(c.lastLoginAt)}` : ''}
                    </p>
                  </div>
                  {operator.role === 'primary' ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => void handleToggleCollaborator(c)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer ${
                          c.active
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-amber-50 hover:text-amber-900'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800'
                        }`}
                      >
                        {c.active ? 'Activo' : 'Revocado'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteCollaborator(c)}
                        aria-label={`Eliminar acceso de ${c.name}`}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                      {c.active ? 'Activo' : 'Revocado'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Publicar contenido */}
      {innerTab === 'contenido' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Recipe */}
          <form
            onSubmit={handleCreateAdminRecipe}
            className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
          >
            <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-700" />
              <span>Publicar nueva receta / código QR</span>
            </h3>
            <input
              type="text"
              required
              value={recName}
              onChange={(e) => setRecName(e.target.value)}
              placeholder="Nombre de la receta (ej. Tostadas de frijol y aguacate)"
              className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
            />
            <input
              type="text"
              value={recTime}
              onChange={(e) => setRecTime(e.target.value)}
              placeholder="Tiempo aproximado (ej. 15 min)"
              className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
            />
            <input
              type="number"
              min={0}
              step="0.5"
              value={recPrice}
              onChange={(e) => setRecPrice(e.target.value)}
              placeholder="Precio de venta escolar ($)"
              className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-mono-num"
            />
            <textarea
              rows={3}
              value={recIngredients}
              onChange={(e) => setRecIngredients(e.target.value)}
              placeholder="Ingredientes (uno por línea)"
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm"
            />
            <textarea
              rows={3}
              value={recSteps}
              onChange={(e) => setRecSteps(e.target.value)}
              placeholder="Pasos de preparación (uno por línea)"
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm"
            />
            <input
              type="text"
              value={recNutrients}
              onChange={(e) => setRecNutrients(e.target.value)}
              placeholder="Explicación breve de nutrientes"
              className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
            />
            <button
              type="submit"
              className="min-h-[42px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold cursor-pointer"
            >
              Agregar al Recetario VITALIA
            </button>
          </form>

          {/* Add BIOTEC Project */}
          <form
            onSubmit={handleCreateAdminBiotec}
            className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
          >
            <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-cyan-700" />
              <span>Agregar prototipo a Galería BIOTEC</span>
            </h3>
            <input
              type="text"
              required
              value={bioTitle}
              onChange={(e) => setBioTitle(e.target.value)}
              placeholder="Nombre del prototipo experimental"
              className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
            />
            <input
              type="text"
              value={bioMaterials}
              onChange={(e) => setBioMaterials(e.target.value)}
              placeholder="Materiales de origen separados por coma"
              className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
            />
            <textarea
              rows={3}
              value={bioProcess}
              onChange={(e) => setBioProcess(e.target.value)}
              placeholder="Resumen del proceso experimental"
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm"
            />
            <textarea
              rows={2}
              value={bioObs}
              onChange={(e) => setBioObs(e.target.value)}
              placeholder="Observaciones y resultados"
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm"
            />
            <button
              type="submit"
              className="min-h-[42px] px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-sm font-semibold cursor-pointer"
            >
              Publicar en BIOTEC ({biotecCount} totales)
            </button>
          </form>
        </div>
      )}
    </section>
  );
};
