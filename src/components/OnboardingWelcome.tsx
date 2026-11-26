import React, { useState } from 'react';
import { ArrowRight, Check, KeyRound, Leaf, ShieldCheck } from 'lucide-react';
import { AccessPolicySummary, CharacterId, UserProfile } from '../types/vitalia';
import { CHARACTER_META, UniverseCharacter, VitaMascot } from './characters/VitaCharacters';

interface OnboardingWelcomeProps {
  entryPolicy?: AccessPolicySummary;
  onComplete: (
    profileData: Pick<UserProfile, 'nickname' | 'avatar' | 'interests' | 'allergies'>,
    groupCode?: string
  ) => Promise<{ ok: boolean; error?: string }> | { ok: boolean; error?: string } | void;
}

const INTEREST_OPTIONS = [
  'Alimentación cotidiana',
  'Recetas prácticas',
  'Movimiento y cuerpo',
  'Bienestar emocional',
  'Ciencia y medio ambiente (BIOTEC)',
];

const COMMON_ALLERGIES = [
  'Lácteos',
  'Gluten / Trigo',
  'Huevo',
  'Cacahuate / Nueces',
  'Fresa / Frutos rojos',
  'Soya',
];

export const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({
  entryPolicy,
  onComplete,
}) => {
  const [step, setStep] = useState<'welcome' | 'profile' | 'intro'>('welcome');
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState<CharacterId>('vita');
  const [interests, setInterests] = useState<string[]>(['Alimentación cotidiana', 'Recetas prácticas']);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [entryError, setEntryError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toggleInterest = (topic: string) => {
    setInterests((prev) =>
      prev.includes(topic) ? prev.filter((item) => item !== topic) : [...prev, topic]
    );
  };

  const toggleAllergy = (item: string) => {
    setAllergies((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const addCustomAllergy = () => {
    const trimmed = customAllergy.trim();
    if (trimmed && !allergies.includes(trimmed)) {
      setAllergies((prev) => [...prev, trimmed]);
      setCustomAllergy('');
    }
  };

  const handleFinishProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('intro');
  };

  const finalNickname = nickname.trim() || 'Explorador';

  const handleEnterVitalia = async () => {
    setEntryError(null);
    if (entryPolicy?.requireGroupCode && !groupCode.trim()) {
      setEntryError('Ingresa el código de grupo escolar para entrar.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await onComplete(
        {
          nickname: finalNickname,
          avatar,
          interests,
          allergies,
        },
        groupCode.trim() || undefined
      );
      if (result && result.ok === false) {
        setEntryError(
          result.error || 'No se pudo validar el ingreso. Verifica el código de grupo.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'welcome') {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-900 text-white flex items-center justify-center p-6">
        {/* Subtle botanical light particles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute top-[12%] left-[14%] w-3 h-3 rounded-full bg-yellow-300/40 animate-pulse" />
          <div className="absolute top-[28%] right-[18%] w-4 h-4 rounded-full bg-emerald-300/35 animate-bounce" />
          <div className="absolute bottom-[20%] left-[22%] w-2.5 h-2.5 rounded-full bg-amber-200/40 animate-pulse" />
          <div className="absolute bottom-[16%] right-[14%] w-5 h-5 rounded-full bg-teal-200/25" />
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-400/15 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-teal-300/15 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-2xl w-full text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 text-emerald-100 text-sm font-medium tracking-wide mb-6">
            <Leaf className="w-4 h-4 text-yellow-300" />
            <span>Aprende a cuidarte jugando</span>
            <span aria-hidden="true">·</span>
            <span>Android, iOS y Web</span>
          </div>

          <div className="mb-6 transform transition-transform duration-300 hover:scale-105">
            <VitaMascot stage="brote" expression="alegria" size={168} />
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            VITALIA
          </h1>

          <p className="text-lg sm:text-xl text-emerald-50/95 max-w-xl leading-relaxed mb-8 text-balance">
            «¡Bienvenido a VITALIA! Un mundo donde aprender a cuidarte se convierte en una aventura».
          </p>

          <button
            type="button"
            onClick={() => setStep('profile')}
            className="min-h-[48px] px-8 py-3.5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-display font-bold text-base shadow-lg shadow-emerald-950/30 transition-all active:scale-[0.98] inline-flex items-center gap-2.5 cursor-pointer"
          >
            <span>Comenzar aventura</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="mt-6 text-xs sm:text-sm text-emerald-100/80 max-w-md">
            Pequeños hábitos, grandes descubrimientos. Sin dietas restrictivas ni comparaciones físicas.
          </p>
        </div>
      </div>
    );
  }

  if (step === 'profile') {
    return (
      <div className="min-h-screen bg-[#F6FAF7] py-8 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-medium text-emerald-700 mb-1">Paso 1 de 2 · Tu perfil de explorador</p>
              <h2 className="font-display text-2xl font-bold text-slate-900">Personaliza tu aventura</h2>
            </div>
            <VitaMascot stage="semilla" expression="curiosidad" size={68} />
          </div>

          <form onSubmit={handleFinishProfile} className="space-y-6">
            <div>
              <label htmlFor="vitalia-nickname" className="block text-sm font-semibold text-slate-800 mb-2">
                Elige un nombre o apodo
              </label>
              <input
                id="vitalia-nickname"
                type="text"
                maxLength={24}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ej. Alex, Sofía, ExploradorVerde..."
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <span className="block text-sm font-semibold text-slate-800 mb-3">
                Selecciona tu avatar compañero
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {(Object.keys(CHARACTER_META) as CharacterId[]).map((charId) => {
                  const selected = avatar === charId;
                  return (
                    <button
                      key={charId}
                      type="button"
                      onClick={() => setAvatar(charId)}
                      className={`flex flex-col items-center p-2.5 rounded-2xl border transition-all cursor-pointer min-h-[44px] ${
                        selected
                          ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <UniverseCharacter character={charId} size={48} vitaStage="semilla" />
                      <span className="mt-1 text-xs font-semibold text-slate-800">
                        {CHARACTER_META[charId].name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="block text-sm font-semibold text-slate-800 mb-2">
                ¿Qué temas te da más curiosidad explorar?
              </span>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((topic) => {
                  const active = interests.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleInterest(topic)}
                      className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                        active
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {active && <Check className="w-3.5 h-3.5" />}
                      <span>{topic}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="block text-sm font-semibold text-slate-800 mb-1">
                Alergias o ingredientes que prefieras evitar en recetas (opcional)
              </span>
              <p className="text-xs text-slate-500 mb-3">
                Se guarda únicamente en tu dispositivo para adaptar sugerencias de recetas.
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {COMMON_ALLERGIES.map((item) => {
                  const active = allergies.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleAllergy(item)}
                      className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                        active
                          ? 'bg-amber-100 text-amber-900 border-amber-400'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customAllergy}
                  onChange={(e) => setCustomAllergy(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomAllergy();
                    }
                  }}
                  placeholder="Agregar otro ingrediente a evitar..."
                  className="flex-1 min-h-[40px] px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={addCustomAllergy}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium cursor-pointer"
                >
                  Agregar
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-950 leading-relaxed">
                <strong>Privacidad y respeto en VITALIA:</strong> nunca te pediremos peso, talla, medidas corporales ni fotografías. Tu progreso depende exclusivamente de tus descubrimientos y misiones.
              </p>
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-base transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Continuar con VITA</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6FAF7] py-8 px-4 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center">
        <div className="flex justify-center mb-4">
          <VitaMascot stage="semilla" expression="emocion" size={140} />
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
          ¡Hola, {finalNickname}!
        </h2>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
          Soy <strong>VITA</strong> y te acompañaré por todo el mundo de VITALIA. Aquí no hay castigos si faltas un día ni comparaciones físicas: explorarás misiones, recetas del Laboratorio de alimentos, experimentos ecológicos en BIOTEC y espacios para tu movimiento y bienestar.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left mb-6">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
            <p className="font-display font-bold text-sm text-emerald-900">5 Mundos</p>
            <p className="text-xs text-emerald-800 mt-1">Historias interactivas desde El Jardín hasta BIOTEC.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100">
            <p className="font-display font-bold text-sm text-amber-900">Laboratorio y QR</p>
            <p className="text-xs text-amber-800 mt-1">Recetas reales, experimentos y escáner para prototipos.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100">
            <p className="font-display font-bold text-sm text-indigo-900">VITA RESPONDE</p>
            <p className="text-xs text-indigo-800 mt-1">Resuelve tus dudas educativas cuando quieras.</p>
          </div>
        </div>

        {entryPolicy?.requireGroupCode && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-left space-y-2">
            <label
              htmlFor="vitalia-group-code"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-950"
            >
              <KeyRound className="w-4 h-4 text-amber-700" />
              <span>Código de grupo escolar</span>
            </label>
            {entryPolicy.groupCodeHint && (
              <p className="text-xs text-amber-900">{entryPolicy.groupCodeHint}</p>
            )}
            <input
              id="vitalia-group-code"
              type="text"
              value={groupCode}
              onChange={(e) => setGroupCode(e.target.value)}
              placeholder="Escribe el código proporcionado por tu docente"
              className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-amber-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}

        {entryError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-800 font-medium">
            {entryError}
          </div>
        )}

        <button
          type="button"
          disabled={submitting}
          onClick={() => void handleEnterVitalia()}
          className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-display font-bold text-base transition-colors cursor-pointer"
        >
          {submitting ? 'Verificando ingreso...' : 'Entrar al mundo VITALIA'}
        </button>
      </div>
    </div>
  );
};
