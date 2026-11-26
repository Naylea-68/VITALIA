import React from 'react';
import { RECETARIO_BRAND_IMAGES } from '../data/vitaliaData';

interface RecipeIllustrationProps {
  recipeId: string;
  imageUrl?: string;
  alt?: string;
  size?: number;
  className?: string;
}

export function resolveRecipeImage(recipeId: string, imageUrl?: string): string {
  if (imageUrl) return imageUrl;
  if (recipeId.includes('minguita')) return RECETARIO_BRAND_IMAGES.miguitaFeliz;
  if (recipeId.includes('sandwich')) return RECETARIO_BRAND_IMAGES.pioFit;
  if (
    recipeId.includes('naranja') ||
    recipeId.includes('pina') ||
    recipeId.includes('fresa') ||
    recipeId.includes('platano')
  ) {
    return RECETARIO_BRAND_IMAGES.nutriSorbo;
  }
  return RECETARIO_BRAND_IMAGES.puraVida;
}

export const RecipeIllustration: React.FC<RecipeIllustrationProps> = ({
  recipeId,
  imageUrl,
  alt = 'Ilustración de receta VITALIA',
  size = 64,
  className = '',
}) => {
  const src = resolveRecipeImage(recipeId, imageUrl);

  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden shrink-0 flex items-center justify-center p-1 ${className}`}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain rounded-xl"
        loading="lazy"
      />
    </div>
  );
};
