import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode } from 'lucide-react';
import { Recipe } from '../types/vitalia';
import { RecipeIllustration } from './FoodIllustrations';

export function getRecipeQrUrl(qrCode: string): string {
  if (typeof window === 'undefined') {
    return `/?qr=${encodeURIComponent(qrCode)}`;
  }
  return `${window.location.origin}/?qr=${encodeURIComponent(qrCode)}`;
}

export function extractQrCodeFromScan(rawCode: string): string {
  const trimmed = rawCode.trim();
  try {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://vitalia.local';
    const parsed = new URL(trimmed, base);
    const qrParam = parsed.searchParams.get('qr');
    if (qrParam) {
      return qrParam.trim().toUpperCase();
    }
  } catch {
    // Fallback below if rawCode is not a valid URL
  }

  const match = trimmed.match(/[?&]qr=([^&]+)/i);
  if (match?.[1]) {
    try {
      return decodeURIComponent(match[1]).trim().toUpperCase();
    } catch {
      return match[1].trim().toUpperCase();
    }
  }

  return trimmed.toUpperCase();
}

interface RecipeQrGridProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
}

export const RecipeQrGrid: React.FC<RecipeQrGridProps> = ({ recipes, onSelectRecipe }) => {
  const [qrImages, setQrImages] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      recipes.map(async (r) => {
        const targetUrl = getRecipeQrUrl(r.qrCode);
        const dataUrl = await QRCode.toDataURL(targetUrl, {
          width: 260,
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {recipes.map((recipe) => (
        <div
          key={recipe.id}
          className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col items-center text-center gap-3 hover:border-emerald-300 transition-colors"
        >
          <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            {qrImages[recipe.id] ? (
              <img
                src={qrImages[recipe.id]}
                alt={`Código QR funcional para ${recipe.name}`}
                className="w-36 h-36 sm:w-40 sm:h-40 block"
              />
            ) : (
              <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                <QrCode className="w-8 h-8" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full text-left">
            <RecipeIllustration
              recipeId={recipe.id}
              imageUrl={recipe.imageUrl}
              alt={recipe.name}
              size={44}
            />
            <div className="space-y-0.5 min-w-0 flex-1">
              <p className="text-[11px] font-mono-num text-emerald-700 font-semibold">
                {recipe.qrCode}
              </p>
              <h4 className="font-display font-bold text-sm text-slate-900 leading-snug">
                {recipe.name}
              </h4>
              {recipe.brandLine && (
                <p className="text-xs text-slate-500">{recipe.brandLine}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectRecipe(recipe)}
            className="w-full min-h-[38px] px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            Abrir receta
          </button>
        </div>
      ))}
    </div>
  );
};
