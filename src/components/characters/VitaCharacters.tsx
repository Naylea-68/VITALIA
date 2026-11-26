import React from 'react';
import {
  CharacterId,
  VitaAccessoryId,
  VitaExpression,
  VitaStageId,
} from '../../types/vitalia';

interface VitaCharacterProps {
  stage?: VitaStageId;
  expression?: VitaExpression;
  accessory?: VitaAccessoryId;
  size?: number;
  className?: string;
}

export const VitaMascot: React.FC<VitaCharacterProps> = ({
  stage = 'semilla',
  expression = 'alegria',
  accessory = 'ninguno',
  size = 140,
  className = '',
}) => {
  const renderEyes = () => {
    switch (expression) {
      case 'sorpresa':
        return (
          <g>
            <circle cx="48" cy="64" r="7.5" fill="#0F172A" />
            <circle cx="72" cy="64" r="7.5" fill="#0F172A" />
            <circle cx="50" cy="61.5" r="2.5" fill="#FFFFFF" />
            <circle cx="74" cy="61.5" r="2.5" fill="#FFFFFF" />
            <ellipse cx="60" cy="77" rx="4" ry="5" fill="#0F172A" />
          </g>
        );
      case 'curiosidad':
        return (
          <g>
            <circle cx="48" cy="64" r="7" fill="#0F172A" />
            <circle cx="72" cy="62" r="8" fill="#0F172A" />
            <circle cx="50" cy="62" r="2.3" fill="#FFFFFF" />
            <circle cx="74.5" cy="59.5" r="2.6" fill="#FFFFFF" />
            <path d="M55 76 Q60 74 65 76" stroke="#0F172A" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          </g>
        );
      case 'concentracion':
        return (
          <g>
            <path d="M41 56 L54 58" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M79 56 L66 58" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="48" cy="65" r="6" fill="#0F172A" />
            <circle cx="72" cy="65" r="6" fill="#0F172A" />
            <circle cx="49.5" cy="63" r="2" fill="#FFFFFF" />
            <circle cx="73.5" cy="63" r="2" fill="#FFFFFF" />
            <line x1="55" y1="77" x2="65" y2="77" stroke="#0F172A" strokeWidth="2.4" strokeLinecap="round" />
          </g>
        );
      case 'emocion':
        return (
          <g>
            <path d="M41 65 Q48 56 55 65" stroke="#0F172A" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M65 65 Q72 56 79 65" stroke="#0F172A" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M52 74 Q60 84 68 74 Z" fill="#FACC15" stroke="#0F172A" strokeWidth="2" />
          </g>
        );
      case 'tranquilidad':
        return (
          <g>
            <path d="M42 64 Q48 69 54 64" stroke="#0F172A" strokeWidth="2.6" fill="none" strokeLinecap="round" />
            <path d="M66 64 Q72 69 78 64" stroke="#0F172A" strokeWidth="2.6" fill="none" strokeLinecap="round" />
            <path d="M55 75 Q60 79 65 75" stroke="#0F172A" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          </g>
        );
      case 'alegria':
      default:
        return (
          <g>
            <circle cx="48" cy="64" r="6.8" fill="#0F172A" />
            <circle cx="72" cy="64" r="6.8" fill="#0F172A" />
            <circle cx="50" cy="61.5" r="2.4" fill="#FFFFFF" />
            <circle cx="74" cy="61.5" r="2.4" fill="#FFFFFF" />
            <circle cx="46" cy="66" r="1.1" fill="#FFFFFF" opacity="0.6" />
            <circle cx="70" cy="66" r="1.1" fill="#FFFFFF" opacity="0.6" />
            <path d="M53 74 Q60 81 67 74" stroke="#0F172A" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          </g>
        );
    }
  };

  const renderStageLeaf = () => {
    const leafGold = accessory === 'hoja_dorada';
    const primaryLeaf = leafGold ? '#FACC15' : '#4ADE80';
    const secondaryLeaf = leafGold ? '#F59E0B' : '#22C55E';

    if (stage === 'semilla') {
      return (
        <g>
          <path d="M60 32 Q60 20 68 15" stroke="#15803D" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <path d="M68 15 Q79 11 77 22 Q70 25 68 15 Z" fill={primaryLeaf} stroke="#14532D" strokeWidth="2" />
        </g>
      );
    }
    if (stage === 'brote') {
      return (
        <g>
          <path d="M60 32 Q60 17 60 12" stroke="#15803D" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          <path d="M60 18 Q44 10 43 22 Q52 27 60 18 Z" fill={primaryLeaf} stroke="#14532D" strokeWidth="2" />
          <path d="M60 16 Q76 8 77 20 Q68 25 60 16 Z" fill={secondaryLeaf} stroke="#14532D" strokeWidth="2" />
          <circle cx="60" cy="11" r="4" fill="#FACC15" stroke="#14532D" strokeWidth="1.8" />
        </g>
      );
    }
    if (stage === 'explorador') {
      return (
        <g>
          <path d="M60 32 L60 10" stroke="#15803D" strokeWidth="3.6" strokeLinecap="round" />
          <path d="M60 22 Q40 12 39 26 Q51 31 60 22 Z" fill={primaryLeaf} stroke="#14532D" strokeWidth="2" />
          <path d="M60 20 Q80 10 81 24 Q69 29 60 20 Z" fill={secondaryLeaf} stroke="#14532D" strokeWidth="2" />
          <path d="M60 10 Q52 2 60 2 Q68 2 60 10 Z" fill="#FACC15" stroke="#14532D" strokeWidth="1.8" />
        </g>
      );
    }
    // guardian
    return (
      <g>
        <circle cx="60" cy="16" r="14" fill="#FEF08A" opacity="0.45" />
        <path d="M60 32 L60 9" stroke="#15803D" strokeWidth="3.8" strokeLinecap="round" />
        <path d="M60 23 Q37 13 37 27 Q51 32 60 23 Z" fill={primaryLeaf} stroke="#14532D" strokeWidth="2" />
        <path d="M60 23 Q83 13 83 27 Q69 32 60 23 Z" fill={secondaryLeaf} stroke="#14532D" strokeWidth="2" />
        <path d="M60 13 Q47 4 47 15 Q55 18 60 13 Z" fill="#FACC15" stroke="#14532D" strokeWidth="1.8" />
        <path d="M60 13 Q73 4 73 15 Q65 18 60 13 Z" fill="#FDE047" stroke="#14532D" strokeWidth="1.8" />
      </g>
    );
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label={`VITA etapa ${stage} con expresión ${expression}`}
    >
      {/* Subtle shadow */}
      <ellipse cx="60" cy="109" rx="24" ry="5" fill="#0F172A" opacity="0.1" />

      {/* Backpack if equipped */}
      {accessory === 'mochila' && (
        <g>
          <rect x="24" y="54" width="14" height="30" rx="6" fill="#0284C7" stroke="#0F172A" strokeWidth="2.2" />
          <rect x="82" y="54" width="14" height="30" rx="6" fill="#0284C7" stroke="#0F172A" strokeWidth="2.2" />
        </g>
      )}

      {/* Legs */}
      <path d="M48 93 L45 104" stroke="#15803D" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M72 93 L75 104" stroke="#15803D" strokeWidth="5.5" strokeLinecap="round" />
      <ellipse cx="44" cy="105" rx="5.5" ry="3.2" fill="#FACC15" stroke="#14532D" strokeWidth="1.8" />
      <ellipse cx="76" cy="105" rx="5.5" ry="3.2" fill="#FACC15" stroke="#14532D" strokeWidth="1.8" />

      {/* Arms */}
      <path d="M31 66 Q21 70 25 79" stroke="#16A34A" strokeWidth="5.5" fill="none" strokeLinecap="round" />
      <path d="M89 66 Q99 70 95 79" stroke="#16A34A" strokeWidth="5.5" fill="none" strokeLinecap="round" />

      {/* Leaf evolution on top */}
      {renderStageLeaf()}

      {/* Main botanical-tech body */}
      <path
        d="M32 62 C32 41 44 31 60 31 C76 31 88 41 88 62 C88 83 78 96 60 96 C42 96 32 83 32 62 Z"
        fill="#22C55E"
        stroke="#14532D"
        strokeWidth="2.6"
      />
      {/* Yellow chest accent */}
      <ellipse cx="60" cy="83" rx="16" ry="9" fill="#FEF08A" opacity="0.9" />
      {/* Subtle cheek highlights */}
      <ellipse cx="40" cy="72" rx="4" ry="2.2" fill="#FACC15" opacity="0.7" />
      <ellipse cx="80" cy="72" rx="4" ry="2.2" fill="#FACC15" opacity="0.7" />

      {/* Lab coat if equipped */}
      {accessory === 'bata' && (
        <g>
          <path
            d="M36 74 L84 74 L82 93 C76 96 44 96 38 93 Z"
            fill="#FFFFFF"
            stroke="#0F172A"
            strokeWidth="2"
          />
          <line x1="60" y1="74" x2="60" y2="95" stroke="#CBD5E1" strokeWidth="1.8" />
          <rect x="66" y="80" width="9" height="7" rx="1.5" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.2" />
        </g>
      )}

      {/* Chef hat if equipped */}
      {accessory === 'gorro' && (
        <g>
          <path
            d="M42 33 C37 22 47 14 55 19 C59 13 65 13 69 19 C77 15 84 23 78 33 Z"
            fill="#FFFFFF"
            stroke="#0F172A"
            strokeWidth="2"
          />
          <rect x="43" y="30" width="34" height="6" rx="2" fill="#FACC15" stroke="#0F172A" strokeWidth="1.8" />
        </g>
      )}

      {/* Face / Eyes */}
      {renderEyes()}

      {/* Magnifying glass if equipped */}
      {accessory === 'lupa' && (
        <g transform="translate(76, 62)">
          <circle cx="10" cy="10" r="8.5" fill="#E0F2FE" fillOpacity="0.65" stroke="#0F172A" strokeWidth="2.3" />
          <line x1="16" y1="16" x2="23" y2="23" stroke="#92400E" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
};

interface SecondaryCharacterProps {
  character: CharacterId;
  size?: number;
  vitaStage?: VitaStageId;
  vitaExpression?: VitaExpression;
  vitaAccessory?: VitaAccessoryId;
  className?: string;
}

export const UniverseCharacter: React.FC<SecondaryCharacterProps> = ({
  character,
  size = 84,
  vitaStage = 'brote',
  vitaExpression = 'alegria',
  vitaAccessory = 'ninguno',
  className = '',
}) => {
  if (character === 'vita') {
    return (
      <VitaMascot
        stage={vitaStage}
        expression={vitaExpression}
        accessory={vitaAccessory}
        size={size}
        className={className}
      />
    );
  }

  if (character === 'nutri') {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" className={className} role="img" aria-label="Personaje NUTRI">
        <ellipse cx="60" cy="108" rx="22" ry="4.5" fill="#0F172A" opacity="0.1" />
        <line x1="60" y1="26" x2="60" y2="14" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
        <circle cx="60" cy="12" r="4.5" fill="#F59E0B" stroke="#0F172A" strokeWidth="1.8" />
        <rect x="31" y="28" width="58" height="62" rx="22" fill="#0EA5E9" stroke="#0F172A" strokeWidth="2.5" />
        <rect x="39" y="43" width="42" height="24" rx="10" fill="#0F172A" />
        <circle cx="50" cy="55" r="4.5" fill="#38BDF8" />
        <circle cx="70" cy="55" r="4.5" fill="#38BDF8" />
        <path d="M54 77 Q60 82 66 77" stroke="#FEF08A" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <rect x="48" y="88" width="8" height="15" rx="4" fill="#0284C7" stroke="#0F172A" strokeWidth="2" />
        <rect x="64" y="88" width="8" height="15" rx="4" fill="#0284C7" stroke="#0F172A" strokeWidth="2" />
      </svg>
    );
  }

  if (character === 'chefia') {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" className={className} role="img" aria-label="Personaje CHEFIA">
        <ellipse cx="60" cy="108" rx="22" ry="4.5" fill="#0F172A" opacity="0.1" />
        <path d="M40 36 C34 24 45 14 54 19 C59 12 65 12 70 19 C79 15 86 24 80 36 Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.2" />
        <circle cx="60" cy="64" r="28" fill="#F59E0B" stroke="#0F172A" strokeWidth="2.5" />
        <rect x="41" y="32" width="38" height="7" rx="3" fill="#EF4444" stroke="#0F172A" strokeWidth="2" />
        <circle cx="50" cy="61" r="5" fill="#0F172A" />
        <circle cx="70" cy="61" r="5" fill="#0F172A" />
        <circle cx="51.5" cy="59.5" r="1.8" fill="#FFFFFF" />
        <circle cx="71.5" cy="59.5" r="1.8" fill="#FFFFFF" />
        <path d="M53 73 Q60 80 67 73" stroke="#0F172A" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        {/* Wooden spoon */}
        <line x1="94" y1="54" x2="86" y2="85" stroke="#92400E" strokeWidth="3.5" strokeLinecap="round" />
        <ellipse cx="95" cy="50" rx="5.5" ry="7.5" fill="#D97706" stroke="#78350F" strokeWidth="1.8" />
        <line x1="50" y1="92" x2="48" y2="104" stroke="#D97706" strokeWidth="5" strokeLinecap="round" />
        <line x1="70" y1="92" x2="72" y2="104" stroke="#D97706" strokeWidth="5" strokeLinecap="round" />
      </svg>
    );
  }

  if (character === 'eco') {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" className={className} role="img" aria-label="Personaje ECO">
        <ellipse cx="60" cy="108" rx="22" ry="4.5" fill="#0F172A" opacity="0.1" />
        <path d="M60 32 Q46 15 36 24 Q46 35 60 32 Z" fill="#2DD4BF" stroke="#0F172A" strokeWidth="2" />
        <path d="M60 32 Q74 15 84 24 Q74 35 60 32 Z" fill="#38BDF8" stroke="#0F172A" strokeWidth="2" />
        <path d="M33 65 C33 42 46 31 60 31 C74 31 87 42 87 65 C87 84 76 95 60 95 C44 95 33 84 33 65 Z" fill="#0D9488" stroke="#0F172A" strokeWidth="2.5" />
        <circle cx="50" cy="61" r="5.5" fill="#0F172A" />
        <circle cx="70" cy="61" r="5.5" fill="#0F172A" />
        <circle cx="51.5" cy="59" r="2" fill="#FFFFFF" />
        <circle cx="71.5" cy="59" r="2" fill="#FFFFFF" />
        <path d="M54 74 Q60 79 66 74" stroke="#FFFFFF" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <circle cx="60" cy="84" r="4" fill="#A78BFA" />
        <line x1="50" y1="94" x2="48" y2="104" stroke="#0F766E" strokeWidth="5" strokeLinecap="round" />
        <line x1="70" y1="94" x2="72" y2="104" stroke="#0F766E" strokeWidth="5" strokeLinecap="round" />
      </svg>
    );
  }

  if (character === 'mova') {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" className={className} role="img" aria-label="Personaje MOVA">
        <ellipse cx="60" cy="108" rx="22" ry="4.5" fill="#0F172A" opacity="0.1" />
        <circle cx="60" cy="62" r="28" fill="#F97316" stroke="#0F172A" strokeWidth="2.5" />
        {/* Sport headband */}
        <path d="M34 49 Q60 43 86 49 L85 55 Q60 49 35 55 Z" fill="#0284C7" stroke="#0F172A" strokeWidth="1.8" />
        <circle cx="50" cy="63" r="5" fill="#0F172A" />
        <circle cx="70" cy="63" r="5" fill="#0F172A" />
        <circle cx="51.5" cy="61" r="1.8" fill="#FFFFFF" />
        <circle cx="71.5" cy="61" r="1.8" fill="#FFFFFF" />
        <path d="M53 74 Q60 81 67 74" stroke="#0F172A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M32 62 L21 52" stroke="#EA580C" strokeWidth="5" strokeLinecap="round" />
        <path d="M88 62 L99 52" stroke="#EA580C" strokeWidth="5" strokeLinecap="round" />
        <path d="M50 89 L43 103" stroke="#EA580C" strokeWidth="5.5" strokeLinecap="round" />
        <path d="M70 89 L78 103" stroke="#EA580C" strokeWidth="5.5" strokeLinecap="round" />
      </svg>
    );
  }

  // lumi
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} role="img" aria-label="Personaje LUMI">
      <ellipse cx="60" cy="108" rx="22" ry="4.5" fill="#0F172A" opacity="0.1" />
      <circle cx="60" cy="62" r="30" fill="#818CF8" opacity="0.2" />
      <path d="M35 64 C35 43 46 33 60 33 C74 33 85 43 85 64 C85 83 75 94 60 94 C45 94 35 83 35 64 Z" fill="#6366F1" stroke="#0F172A" strokeWidth="2.5" />
      <path d="M44 61 Q49 66 54 61" stroke="#FFFFFF" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <path d="M66 61 Q71 66 76 61" stroke="#FFFFFF" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <path d="M54 73 Q60 78 66 73" stroke="#FFFFFF" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <ellipse cx="42" cy="69" rx="4" ry="2" fill="#A5F3FC" opacity="0.8" />
      <ellipse cx="78" cy="69" rx="4" ry="2" fill="#A5F3FC" opacity="0.8" />
      <line x1="51" y1="94" x2="50" y2="104" stroke="#4F46E5" strokeWidth="5" strokeLinecap="round" />
      <line x1="69" y1="94" x2="70" y2="104" stroke="#4F46E5" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
};

export const CHARACTER_META: Record<
  CharacterId,
  { name: string; role: string; tagline: string }
> = {
  vita: {
    name: 'VITA',
    role: 'Guía principal de VITALIA',
    tagline: 'Evoluciona contigo conforme descubres el mundo.',
  },
  nutri: {
    name: 'NUTRI',
    role: 'Especialista en nutrientes',
    tagline: 'Traduce vitaminas, proteínas y fibra a ejemplos claros.',
  },
  chefia: {
    name: 'CHEFIA',
    role: 'Maestra de recetas prácticas',
    tagline: 'Crea combinaciones ricas, sencillas y económicas.',
  },
  eco: {
    name: 'ECO',
    role: 'Explorador de BIOTEC',
    tagline: 'Investiga cómo los residuos orgánicos cobran nueva vida.',
  },
  mova: {
    name: 'MOVA',
    role: 'Guía de movimiento',
    tagline: 'Te anima a moverte a tu manera y respetar tu descanso.',
  },
  lumi: {
    name: 'LUMI',
    role: 'Acompañante de bienestar',
    tagline: 'Te recuerda respirar, cuidarte y validar tus emociones.',
  },
};
