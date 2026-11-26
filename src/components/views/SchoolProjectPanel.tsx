import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import {
  BookOpen,
  Calculator,
  CheckCircle2,
  Download,
  FileText,
  Landmark,
  Minus,
  Plus,
  Printer,
  QrCode,
  RotateCcw,
  School,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  BIBLIOGRAPHIC_SOURCES,
  PROJECT_RESEARCH_OVERVIEW,
  RECETARIO_BRAND_IMAGES,
} from '../../data/vitaliaData';
import { Recipe } from '../../types/vitalia';
import { VitaMascot } from '../characters/VitaCharacters';
import { resolveRecipeImage } from '../FoodIllustrations';
import { getRecipeQrUrl } from '../RecipeQrGrid';

interface SchoolProjectPanelProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
}

interface RecipeMenuState {
  dailyUnits: number;
  salePrice: number;
}

function formatMxn(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function getAccessibilityLabel(salePrice: number): { label: string; badgeClass: string } {
  if (salePrice <= 15) {
    return { label: 'Muy accesible', badgeClass: 'bg-emerald-100 text-emerald-800' };
  }
  if (salePrice <= 20) {
    return { label: 'Accesible', badgeClass: 'bg-teal-100 text-teal-800' };
  }
  return { label: 'Especial natural', badgeClass: 'bg-amber-100 text-amber-800' };
}

function getDefaultMenuMap(recipes: Recipe[]): Record<string, RecipeMenuState> {
  const map: Record<string, RecipeMenuState> = {};
  const coreIds = new Set([
    'rec-minguita-feliz',
    'rec-jugo-naranja-zanahoria',
    'rec-licuado-fresa',
    'rec-licuado-platano',
    'rec-sandwich-pollo',
  ]);
  for (const r of recipes) {
    const salePrice = r.economics?.suggestedPrice ?? 15;
    map[r.id] = {
      dailyUnits: coreIds.has(r.id) ? 1 : 0,
      salePrice,
    };
  }
  return map;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let currY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, currY);
      line = words[i];
      currY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, currY);
    currY += lineHeight;
  }
  return currY;
}

export const SchoolProjectPanel: React.FC<SchoolProjectPanelProps> = ({
  recipes,
  onSelectRecipe,
}) => {
  const [subSection, setSubSection] = useState<'economia' | 'carteles' | 'fuentes'>('economia');
  const [menuMap, setMenuMap] = useState<Record<string, RecipeMenuState>>(() =>
    getDefaultMenuMap(recipes)
  );
  const [schoolDaysPerWeek, setSchoolDaysPerWeek] = useState<number>(5);
  const [showPricesOnPosters, setShowPricesOnPosters] = useState<boolean>(true);
  const [showPuraVidaSeal, setShowPuraVidaSeal] = useState<boolean>(true);
  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Sync newly added custom recipes into menu state
  useEffect(() => {
    setMenuMap((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const r of recipes) {
        if (!next[r.id]) {
          next[r.id] = {
            dailyUnits: 0,
            salePrice: r.economics?.suggestedPrice ?? 15,
          };
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [recipes]);

  // Generate high-contrast functional QR codes for school posters
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      recipes.map(async (r) => {
        const targetUrl = getRecipeQrUrl(r.qrCode);
        const dataUrl = await QRCode.toDataURL(targetUrl, {
          width: 340,
          margin: 2,
          errorCorrectionLevel: 'M',
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        });
        return [r.id, dataUrl] as const;
      })
    ).then((entries) => {
      if (!cancelled) {
        setQrImages(Object.fromEntries(entries));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [recipes]);

  const menuSummary = useMemo(() => {
    let totalUnits = 0;
    let dailyTotal = 0;
    let minPrice = Infinity;
    let maxPrice = 0;

    for (const r of recipes) {
      const entry = menuMap[r.id];
      if (!entry) continue;
      const units = Math.max(0, entry.dailyUnits);
      totalUnits += units;
      dailyTotal += units * entry.salePrice;
      if (entry.salePrice < minPrice) minPrice = entry.salePrice;
      if (entry.salePrice > maxPrice) maxPrice = entry.salePrice;
    }

    const avgPricePerItem = totalUnits > 0 ? dailyTotal / totalUnits : 0;
    const weeklyTotal = dailyTotal * schoolDaysPerWeek;
    const monthlyTotal = weeklyTotal * 4;

    return {
      totalUnits,
      dailyTotal,
      weeklyTotal,
      monthlyTotal,
      avgPricePerItem,
      minPrice: Number.isFinite(minPrice) ? minPrice : 0,
      maxPrice,
    };
  }, [recipes, menuMap, schoolDaysPerWeek]);

  const updateRecipeMenu = (id: string, patch: Partial<RecipeMenuState>) => {
    setMenuMap((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || { dailyUnits: 0, salePrice: 15 }),
        ...patch,
      },
    }));
  };

  const applyPresetMenu = (unitsEachCore: number) => {
    const coreIds = new Set([
      'rec-minguita-feliz',
      'rec-jugo-naranja-zanahoria',
      'rec-licuado-fresa',
      'rec-licuado-platano',
      'rec-sandwich-pollo',
    ]);
    setMenuMap((prev) => {
      const next = { ...prev };
      for (const r of recipes) {
        const existing = next[r.id] || {
          dailyUnits: 0,
          salePrice: r.economics?.suggestedPrice ?? 15,
        };
        next[r.id] = {
          ...existing,
          dailyUnits: coreIds.has(r.id) ? unitsEachCore : 0,
        };
      }
      return next;
    });
  };

  const handleDownloadPosterPng = async (recipe: Recipe) => {
    setDownloadingId(recipe.id);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 1060;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // White poster background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Soft outer border
      ctx.strokeStyle = '#D1FAE5';
      ctx.lineWidth = 10;
      drawRoundedRect(ctx, 20, 20, 760, 1020, 36);
      ctx.stroke();

      // Top VITALIA header banner
      const grad = ctx.createLinearGradient(20, 20, 780, 170);
      grad.addColorStop(0, '#059669');
      grad.addColorStop(1, '#0D9488');
      ctx.fillStyle = grad;
      drawRoundedRect(ctx, 36, 36, 728, 130, 28);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 44px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('VITALIA', 68, 98);

      ctx.fillStyle = '#D1FAE5';
      ctx.font = '600 22px "DM Sans", system-ui, sans-serif';
      ctx.fillText(recipe.brandLine || 'Recetario escolar saludable', 68, 136);

      // Optional Pura Vida mini seal in header
      if (showPuraVidaSeal) {
        const puraImg = await loadImage(RECETARIO_BRAND_IMAGES.puraVida);
        if (puraImg) {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(694, 101, 46, 0, Math.PI * 2);
          ctx.fill();
          ctx.save();
          ctx.beginPath();
          ctx.arc(694, 101, 42, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(puraImg, 652, 59, 84, 84);
          ctx.restore();
        }
      }

      // Recipe Logo card
      const logoSrc = resolveRecipeImage(recipe.id, recipe.imageUrl);
      const logoImg = await loadImage(logoSrc);
      ctx.fillStyle = '#F6FAF7';
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 3;
      drawRoundedRect(ctx, 250, 194, 300, 250, 28);
      ctx.fill();
      ctx.stroke();

      if (logoImg) {
        ctx.drawImage(logoImg, 280, 206, 240, 226);
      }

      // Recipe Title
      ctx.fillStyle = '#0F172A';
      ctx.font = '800 34px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.textAlign = 'center';
      let nextY = wrapCanvasText(ctx, recipe.name, 400, 496, 680, 42);

      // Optional Promotional Sale Price Badge (no internal costs or profits shown)
      const priceVal = menuMap[recipe.id]?.salePrice ?? recipe.economics?.suggestedPrice;
      const portionText = recipe.economics?.portionLabel ? ` · ${recipe.economics.portionLabel}` : '';
      if (showPricesOnPosters && priceVal !== undefined) {
        ctx.fillStyle = '#FEF3C7';
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, 210, nextY + 6, 380, 50, 25);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#92400E';
        ctx.font = '700 22px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.fillText(`Precio: ${formatMxn(priceVal)}${portionText}`, 400, nextY + 39);
        nextY += 74;
      } else {
        nextY += 16;
      }

      // QR Container
      const qrDataUrl = qrImages[recipe.id] || (await QRCode.toDataURL(getRecipeQrUrl(recipe.qrCode), { width: 340, margin: 2 }));
      const qrImg = await loadImage(qrDataUrl);

      const qrBoxY = Math.max(nextY, 600);
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 4;
      drawRoundedRect(ctx, 235, qrBoxY, 330, 330, 28);
      ctx.fill();
      ctx.stroke();

      if (qrImg) {
        ctx.drawImage(qrImg, 255, qrBoxY + 15, 290, 290);
      }

      // Bottom instruction
      ctx.fillStyle = '#047857';
      ctx.font = '700 21px "DM Sans", system-ui, sans-serif';
      ctx.fillText('Escanea el código QR para ver la receta y sus nutrientes', 400, qrBoxY + 372);

      ctx.fillStyle = '#64748B';
      ctx.font = '600 17px "IBM Plex Mono", monospace';
      ctx.fillText(`${recipe.qrCode} · Proyecto escolar VITALIA`, 400, qrBoxY + 404);

      const link = document.createElement('a');
      link.download = `cartel-${recipe.qrCode.toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner (hidden on print) */}
      <section className="print:hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-900 text-white p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-emerald-100 flex items-center gap-2">
              <School className="w-4 h-4 text-yellow-300" />
              <span>Implementación en la escuela</span>
              <span aria-hidden="true">·</span>
              <span>Menú escolar y carteles QR</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold">
              Menú escolar accesible, carteles QR y sustento del proyecto
            </h1>
            <p className="text-sm text-emerald-50/90 max-w-2xl leading-relaxed">
              Consulta nuestros precios accesibles para el recreo escolar, imprime o descarga carteles promocionales con el logo y QR funcional de cada producto y conoce las fuentes oficiales que respaldan VITALIA.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1.5 bg-white/15 backdrop-blur-xs rounded-2xl border border-white/20 shrink-0">
            <button
              type="button"
              onClick={() => setSubSection('economia')}
              className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                subSection === 'economia'
                  ? 'bg-yellow-400 text-slate-950'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Calculator className="w-4 h-4 shrink-0" />
              <span>Menú y precios</span>
            </button>
            <button
              type="button"
              onClick={() => setSubSection('carteles')}
              className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                subSection === 'carteles'
                  ? 'bg-yellow-400 text-slate-950'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <QrCode className="w-4 h-4 shrink-0" />
              <span>Carteles QR con logos</span>
            </button>
            <button
              type="button"
              onClick={() => setSubSection('fuentes')}
              className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                subSection === 'fuentes'
                  ? 'bg-yellow-400 text-slate-950'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Marco y fuentes</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 1: MENÚ ESCOLAR Y PRECIOS ACCESIBLES (SIN COSTOS INTERNOS NI GANANCIAS) */}
      {subSection === 'economia' && (
        <div className="space-y-6">
          {/* Promotional Budget KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <p className="text-xs text-slate-500 font-medium">Productos en tu selección</p>
              <p className="font-mono-num text-2xl font-extrabold text-slate-900 mt-1">
                {menuSummary.totalUnits} pzas
              </p>
              <p className="text-xs text-emerald-700 mt-1">
                Promedio: {formatMxn(menuSummary.avgPricePerItem)} / pza
              </p>
            </div>

            <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5">
              <p className="text-xs text-emerald-800 font-semibold">Total de tu combo / día</p>
              <p className="font-mono-num text-2xl font-extrabold text-emerald-900 mt-1">
                {formatMxn(menuSummary.dailyTotal)}
              </p>
              <p className="text-xs text-emerald-800 mt-1">
                Opciones frescas y naturales del día
              </p>
            </div>

            <div className="bg-teal-50 rounded-2xl border border-teal-200 p-5">
              <p className="text-xs text-teal-900 font-semibold">
                Presupuesto semanal ({schoolDaysPerWeek} días)
              </p>
              <p className="font-mono-num text-2xl font-extrabold text-teal-950 mt-1">
                {formatMxn(menuSummary.weeklyTotal)}
              </p>
              <p className="text-xs text-teal-900 mt-1">
                Al mes (~4 sem.): {formatMxn(menuSummary.monthlyTotal)}
              </p>
            </div>

            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
              <p className="text-xs text-amber-900 font-semibold">Precios en la escuela</p>
              <p className="font-mono-num text-2xl font-extrabold text-amber-950 mt-1">
                {formatMxn(menuSummary.minPrice)} – {formatMxn(menuSummary.maxPrice)}
              </p>
              <p className="text-xs text-amber-900 mt-1">
                Alimentación saludable al alcance de todos
              </p>
            </div>
          </div>

          {/* Interactive School Menu & Order Calculator */}
          <section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-700" />
                  <span>Menú promocional y calculadora de presupuesto</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Arma tu desayuno o recreo saludable, conoce nuestros precios accesibles en el plantel y calcula cuánto gastarías al día o a la semana.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    applyPresetMenu(1);
                    setSchoolDaysPerWeek(5);
                  }}
                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Probar 1 de cada uno</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    applyPresetMenu(2);
                    setSchoolDaysPerWeek(5);
                  }}
                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Combo compartido (2 c/u)
                </button>
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                  <span>Días/sem:</span>
                  <select
                    value={schoolDaysPerWeek}
                    onChange={(e) => setSchoolDaysPerWeek(Number(e.target.value))}
                    className="bg-transparent font-mono-num font-bold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[660px]">
                <thead>
                  <tr className="bg-emerald-900 text-white text-xs">
                    <th className="py-3 px-3.5 rounded-tl-xl font-semibold">Producto</th>
                    <th className="py-3 px-3 font-semibold">Porción</th>
                    <th className="py-3 px-3 font-semibold">Precio de venta</th>
                    <th className="py-3 px-3 font-semibold">Rango</th>
                    <th className="py-3 px-3 font-semibold text-center">Cantidad</th>
                    <th className="py-3 px-3.5 rounded-tr-xl font-semibold text-right">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                  {recipes.map((rec) => {
                    const entry = menuMap[rec.id] || {
                      dailyUnits: 0,
                      salePrice: rec.economics?.suggestedPrice ?? 15,
                    };
                    const subtotal = entry.dailyUnits * entry.salePrice;
                    const isApprox = rec.economics?.isEstimate || !rec.economics;
                    const acc = getAccessibilityLabel(entry.salePrice);

                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={resolveRecipeImage(rec.id, rec.imageUrl)}
                              alt={rec.name}
                              className="w-9 h-9 rounded-lg object-contain bg-white border border-slate-200 shrink-0 p-0.5"
                            />
                            <div>
                              <button
                                type="button"
                                onClick={() => onSelectRecipe(rec)}
                                className="font-display font-bold text-slate-900 hover:text-emerald-700 text-left cursor-pointer"
                              >
                                {rec.name}
                              </button>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                <span>{rec.brandLine || 'VITALIA'}</span>
                                {isApprox && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                                    Precio de referencia
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 text-xs">
                          {rec.economics?.portionLabel || '1 porción'}
                        </td>
                        <td className="py-3 px-3 font-mono-num font-bold text-emerald-800">
                          {formatMxn(entry.salePrice)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold ${acc.badgeClass}`}
                          >
                            {acc.label}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              aria-label={`Restar cantidad de ${rec.name}`}
                              onClick={() =>
                                updateRecipeMenu(rec.id, {
                                  dailyUnits: Math.max(0, entry.dailyUnits - 1),
                                })
                              }
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center font-mono-num font-bold text-slate-900">
                              {entry.dailyUnits}
                            </span>
                            <button
                              type="button"
                              aria-label={`Sumar cantidad de ${rec.name}`}
                              onClick={() =>
                                updateRecipeMenu(rec.id, {
                                  dailyUnits: entry.dailyUnits + 1,
                                })
                              }
                              className="w-7 h-7 rounded-lg bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center text-emerald-800 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3.5 text-right font-mono-num font-bold text-slate-900">
                          {formatMxn(subtotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs sm:text-sm text-amber-950 leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p>
                <strong>Comer rico y saludable en la escuela sí es accesible:</strong> Con precios pensados para estudiantes entre <strong>$10.00 y $25.00</strong> pesos, puedes elegir opciones recién preparadas con fruta natural, avena, pollo y granos integrales todos los días en el recreo.
              </p>
            </div>
          </section>

          {/* Promotional Product Catalog Cards (zero costs / zero profits) */}
          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold text-slate-900">
              Catálogo promocional del menú VITALIA
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipes.map((rec) => {
                const salePrice = menuMap[rec.id]?.salePrice ?? rec.economics?.suggestedPrice;
                return (
                  <article
                    key={rec.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-[11px] font-semibold text-emerald-700 block">
                            {rec.brandLine || 'VITALIA'} · {rec.economics?.portionLabel || '1 porción'}
                          </span>
                          <h4 className="font-display font-bold text-base text-slate-900 mt-0.5">
                            {rec.name}
                          </h4>
                        </div>
                        <img
                          src={resolveRecipeImage(rec.id, rec.imageUrl)}
                          alt={rec.name}
                          className="w-12 h-12 rounded-xl object-contain bg-[#F6FAF7] border border-slate-200 p-1 shrink-0"
                        />
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {rec.nutrientsInfo}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      {salePrice !== undefined ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 font-mono-num font-bold text-xs">
                          Precio: {formatMxn(salePrice)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">{rec.prepTime}</span>
                      )}
                      <button
                        type="button"
                        onClick={() => onSelectRecipe(rec)}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                      >
                        Ver receta y nutrientes →
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* SECTION 2: CARTELES QR CON LOGOS PARA LA ESCUELA */}
      {subSection === 'carteles' && (
        <div className="space-y-5">
          {/* Controls bar (hidden on print) */}
          <div className="print:hidden bg-white rounded-3xl border border-slate-200 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Carteles promocionales listos para colocar en la escuela
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Cada cartel une el logo oficial de la receta, su precio accesible y su código QR funcional. Descárgalos en PNG o imprímelos directo.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPricesOnPosters}
                  onChange={(e) => setShowPricesOnPosters(e.target.checked)}
                  className="accent-emerald-600 w-4 h-4"
                />
                <span>Mostrar precio de venta</span>
              </label>

              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPuraVidaSeal}
                  onChange={(e) => setShowPuraVidaSeal(e.target.checked)}
                  className="accent-emerald-600 w-4 h-4"
                />
                <span>Incluir sello Pura Vida</span>
              </label>

              <button
                type="button"
                onClick={() => window.print()}
                className="min-h-[42px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir carteles</span>
              </button>
            </div>
          </div>

          {/* Printable School Posters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 print:grid-cols-2 print:gap-4">
            {recipes.map((recipe) => {
              const salePrice =
                menuMap[recipe.id]?.salePrice ?? recipe.economics?.suggestedPrice;
              const logoSrc = resolveRecipeImage(recipe.id, recipe.imageUrl);

              return (
                <article
                  key={recipe.id}
                  className="break-inside-avoid bg-white rounded-3xl border-2 border-emerald-200 overflow-hidden flex flex-col justify-between shadow-xs print:shadow-none"
                >
                  {/* Poster Header */}
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 flex items-center justify-between gap-2">
                    <div>
                      <p className="font-display font-extrabold text-base tracking-tight">
                        VITALIA
                      </p>
                      <p className="text-[11px] text-emerald-100 font-medium">
                        {recipe.brandLine || 'Recetario escolar'}
                      </p>
                    </div>
                    {showPuraVidaSeal && (
                      <div className="w-10 h-10 rounded-full bg-white p-0.5 shrink-0 overflow-hidden">
                        <img
                          src={RECETARIO_BRAND_IMAGES.puraVida}
                          alt="Sello Pura Vida"
                          className="w-full h-full object-contain rounded-full"
                        />
                      </div>
                    )}
                  </div>

                  {/* Poster Body: Logo + Name + Promotional Sale Price + Functional QR */}
                  <div className="p-5 flex flex-col items-center text-center gap-3.5">
                    <div className="w-28 h-28 rounded-2xl bg-[#F6FAF7] border border-slate-200 p-1.5 flex items-center justify-center overflow-hidden">
                      <img
                        src={logoSrc}
                        alt={`Logo de ${recipe.name}`}
                        className="w-full h-full object-contain rounded-xl"
                      />
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-display font-extrabold text-base text-slate-900 leading-snug">
                        {recipe.name}
                      </h3>
                      {showPricesOnPosters && salePrice !== undefined && (
                        <p className="inline-block px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-950 font-mono-num font-bold text-xs">
                          Precio: {formatMxn(salePrice)}
                          {recipe.economics?.portionLabel ? ` · ${recipe.economics.portionLabel}` : ''}
                        </p>
                      )}
                    </div>

                    <div className="p-2.5 rounded-2xl bg-white border-2 border-emerald-500 shadow-xs">
                      {qrImages[recipe.id] ? (
                        <img
                          src={qrImages[recipe.id]}
                          alt={`Código QR para ${recipe.name}`}
                          className="w-36 h-36 block"
                        />
                      ) : (
                        <div className="w-36 h-36 bg-slate-100 rounded-xl flex items-center justify-center">
                          <QrCode className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-emerald-800">
                        Escanea para ver receta y nutrientes
                      </p>
                      <p className="text-[11px] font-mono-num text-slate-500">{recipe.qrCode}</p>
                    </div>
                  </div>

                  {/* Action Buttons (hidden on print) */}
                  <div className="print:hidden px-4 pb-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadPosterPng(recipe)}
                      disabled={downloadingId === recipe.id}
                      className="flex-1 min-h-[40px] px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>
                        {downloadingId === recipe.id ? 'Generando...' : 'Descargar cartel PNG'}
                      </span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: MARCO METODOLÓGICO Y FUENTES BIBLIOGRÁFICAS */}
      {subSection === 'fuentes' && (
        <div className="space-y-6">
          {/* Metodología, Resultados esperados y Conclusión + VITA */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PROJECT_RESEARCH_OVERVIEW.cards.map((card) => (
                <article
                  key={card.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h2 className="font-display font-bold text-base text-slate-900">
                      {card.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="lg:col-span-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-3xl border border-emerald-200 p-5 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-3">
                <VitaMascot stage="guardian" expression="concentracion" size={82} />
                <div>
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                    Respaldo científico
                  </p>
                  <h3 className="font-display font-bold text-base text-slate-900">
                    Instituciones de apoyo
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    El proyecto VITALIA se fundamenta en fuentes oficiales nacionales e internacionales.
                  </p>
                </div>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {PROJECT_RESEARCH_OVERVIEW.supportInstitutions.map((inst) => (
                  <li key={inst} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Panorama escolar en México */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PROJECT_RESEARCH_OVERVIEW.schoolContextStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1.5"
              >
                <p className="text-xs font-semibold text-teal-700">{stat.label}</p>
                <p className="font-mono-num text-2xl font-extrabold text-slate-900">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">{stat.note}</p>
              </div>
            ))}
          </section>

          {/* 6 Fuentes Bibliográficas completas */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-emerald-700" />
                  <span>Fuentes bibliográficas del proyecto</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Referencias documentales consultadas el 18 de noviembre de 2026 para sustentar la educación alimentaria y la implementación escolar.
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl self-start">
                {BIBLIOGRAPHIC_SOURCES.length} fuentes documentales
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BIBLIOGRAPHIC_SOURCES.map((source) => (
                <article
                  key={source.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-bold">
                        Fuente {source.number} · {source.shortOrg}
                      </span>
                      <span className="text-[11px] font-mono-num text-slate-500">
                        Consulta: {source.consultationDate}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display font-bold text-base text-slate-900 leading-snug">
                        {source.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">
                        <strong>Autoría:</strong> {source.authors}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {source.publicationInfo} · Publicación: {source.publicationDate}
                      </p>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-[#F6FAF7] border border-emerald-100 rounded-2xl p-3.5">
                      {source.summary}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <p className="text-xs font-bold text-slate-800">
                      Ideas clave aplicadas en VITALIA:
                    </p>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {source.highlights.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
