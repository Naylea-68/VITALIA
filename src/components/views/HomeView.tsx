import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  Compass,
  FlaskConical,
  HelpCircle,
  Leaf,
  MessageCircle,
  QrCode,
  Sparkles,
  Utensils,
} from 'lucide-react';
import {
  BADGES_LIST,
  DAILY_FUN_FACTS,
  SURPRISE_CHALLENGES,
  VITA_WELLBEING_MESSAGES,
  WORLDS,
  getUserLevel,
  getVitaStage,
} from '../../data/vitaliaData';
import { FoodSubTab, MainTab, Mission, UserProfile, VitaExpression } from '../../types/vitalia';
import { VitaMascot } from '../characters/VitaCharacters';

interface HomeViewProps {
  profile: UserProfile;
  missions: Mission[];
  onNavigateTab: (tab: MainTab, foodSubTab?: FoodSubTab) => void;
  onStartMission: (mission: Mission) => void;
  onOpenVitaChat: () => void;
  onOpenQrScanner: () => void;
  onCompleteSurpriseChallenge: (dateKey: string, xp: number) => void;
}

const EXPRESSIONS: { id: VitaExpression; label: string }[] = [
  { id: 'alegria', label: 'Alegría' },
  { id: 'curiosidad', label: 'Curiosidad' },
  { id: 'emocion', label: 'Emoción' },
  { id: 'concentracion', label: 'Concentración' },
  { id: 'sorpresa', label: 'Sorpresa' },
  { id: 'tranquilidad', label: 'Tranquilidad' },
];

export const HomeView: React.FC<HomeViewProps> = ({
  profile,
  missions,
  onNavigateTab,
  onStartMission,
  onOpenVitaChat,
  onOpenQrScanner,
  onCompleteSurpriseChallenge,
}) => {
  const [vitaExpression, setVitaExpression] = useState<VitaExpression>('alegria');
  const [selectedSurpriseOpt, setSelectedSurpriseOpt] = useState<number | null>(null);
  const [surpriseFeedback, setSurpriseFeedback] = useState<boolean>(false);

  const stage = getVitaStage(profile.xp);
  const { level, currentLevelXp, nextLevelXp } = getUserLevel(profile.xp);

  const nextPendingMission =
    missions.find((m) => m.id === profile.lastMissionId && !profile.completedMissions.includes(m.id)) ||
    missions.find((m) => !profile.completedMissions.includes(m.id)) ||
    missions[0];

  const todayKey = new Date().toISOString().slice(0, 10);
  const dayIndex = new Date().getDate();
  const funFact = DAILY_FUN_FACTS[dayIndex % DAILY_FUN_FACTS.length];
  const surpriseChallenge = SURPRISE_CHALLENGES[dayIndex % SURPRISE_CHALLENGES.length];
  const surpriseAlreadyDone = profile.completedSurpriseDates.includes(todayKey);
  const motivatingMsg = VITA_WELLBEING_MESSAGES[dayIndex % VITA_WELLBEING_MESSAGES.length];

  const unlockedBadges = BADGES_LIST.filter((b) => b.checkUnlocked(profile));

  const handleAnswerSurprise = (idx: number) => {
    setSelectedSurpriseOpt(idx);
    setSurpriseFeedback(true);
    if (idx === surpriseChallenge.correctIndex && !surpriseAlreadyDone) {
      onCompleteSurpriseChallenge(todayKey, 20);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero World Card */}
      <section className="rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="text-xs sm:text-sm text-emerald-100 font-medium flex flex-wrap items-center gap-2">
              <span>Nivel <span className="font-mono-num font-bold text-white">{level}</span></span>
              <span aria-hidden="true">·</span>
              <span>Etapa de VITA: <strong className="text-yellow-300">{stage.name}</strong></span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-num">{profile.xp} XP totales</span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-balance">
              ¡Hola, {profile.nickname}! Hoy hay nuevos descubrimientos esperándote.
            </h1>

            <p className="text-sm sm:text-base text-emerald-50/90 max-w-2xl leading-relaxed">
              ¿Estás listo para continuar? Avanza a tu propio ritmo: cada misión, receta o experimento suma conocimientos nuevos.
            </p>

            {/* XP Progress Bar */}
            <div className="max-w-md space-y-1.5 pt-1">
              <div className="flex justify-between text-xs text-emerald-100 font-mono-num">
                <span>Progreso del nivel {level}</span>
                <span>{currentLevelXp} / {nextLevelXp} XP</span>
              </div>
              <div className="h-3 rounded-full bg-emerald-950/35 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-yellow-400 transition-all duration-300"
                  style={{ width: `${Math.max(6, (currentLevelXp / nextLevelXp) * 100)}%` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => onStartMission(nextPendingMission)}
                className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-display font-bold text-sm inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Continuar mi aventura</span>
              </button>
              <button
                type="button"
                onClick={onOpenVitaChat}
                className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm inline-flex items-center gap-2 border border-white/20 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Preguntar a VITA RESPONDE</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="bg-white/10 border border-white/15 rounded-3xl p-4 flex flex-col items-center w-full max-w-[260px]">
              <VitaMascot
                stage={stage.id}
                expression={vitaExpression}
                accessory={profile.equippedAccessory}
                size={136}
              />
              <div className="mt-2 flex flex-wrap justify-center gap-1">
                {EXPRESSIONS.map((exp) => (
                  <button
                    key={exp.id}
                    type="button"
                    onClick={() => setVitaExpression(exp.id)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                      vitaExpression === exp.id
                        ? 'bg-yellow-400 text-slate-950'
                        : 'bg-white/10 text-emerald-50 hover:bg-white/20'
                    }`}
                  >
                    {exp.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Mission of the Day + Quick Access Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <div className="text-xs font-medium text-emerald-700 flex items-center gap-2 mb-2">
              <span>Misión recomendada del día</span>
              <span aria-hidden="true">·</span>
              <span>{nextPendingMission.zoneName}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-num">+{nextPendingMission.xpReward} XP</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">
              {nextPendingMission.title}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              {nextPendingMission.narrativeIntro}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              {profile.completedMissions.includes(nextPendingMission.id)
                ? 'Ya completaste esta misión, puedes volver a explorarla.'
                : 'Actividad interactiva breve · Sin límite de tiempo'}
            </span>
            <button
              type="button"
              onClick={() => onStartMission(nextPendingMission)}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Abrir misión</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Shortcuts */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onNavigateTab('alimentacion', 'laboratorio')}
            className="text-left p-4 rounded-2xl bg-gradient-to-br from-amber-50 via-yellow-50/70 to-white border border-amber-200 hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between min-h-[124px]"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs">
              <Utensils className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <p className="font-display font-bold text-sm text-slate-900">Laboratorio de alimentos</p>
              <p className="text-xs text-amber-900/80 mt-0.5">Recetas, experimentos y crea tu menú</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('alimentacion', 'biotec')}
            className="text-left p-4 rounded-2xl bg-gradient-to-br from-cyan-50 via-teal-50/70 to-violet-50/60 border border-cyan-200 hover:border-cyan-400 transition-all cursor-pointer flex flex-col justify-between min-h-[124px]"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-xs">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <p className="font-display font-bold text-sm text-slate-900">BIOTEC VITALIA</p>
              <p className="text-xs text-cyan-900/80 mt-0.5">Bioplásticos y residuos orgánicos</p>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenQrScanner}
            className="text-left p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white border border-emerald-200 hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between min-h-[124px]"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <p className="font-display font-bold text-sm text-slate-900">Escanea y descubre</p>
              <p className="text-xs text-emerald-900/80 mt-0.5">Lee códigos QR de prototipos</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('aventuras')}
            className="text-left p-4 rounded-2xl bg-gradient-to-br from-sky-50 via-indigo-50/50 to-white border border-sky-200 hover:border-sky-400 transition-all cursor-pointer flex flex-col justify-between min-h-[124px]"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <p className="font-display font-bold text-sm text-slate-900">Mapa de mundos</p>
              <p className="text-xs text-sky-900/80 mt-0.5">{WORLDS.length} capítulos por explorar</p>
            </div>
          </button>
        </div>
      </div>

      {/* Surprise Challenge + Daily Fun Fact + Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-gradient-to-br from-white via-white to-amber-50/60 rounded-3xl border border-amber-200/80 p-6">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-amber-800 font-display font-bold text-base">
              <HelpCircle className="w-5 h-5 text-amber-600" />
              <span>Desafío sorpresa del día</span>
            </div>
            <span className="text-xs font-mono-num text-amber-800 font-semibold">
              {surpriseAlreadyDone ? 'Completado hoy' : '+20 XP'}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-900 mb-3">{surpriseChallenge.question}</p>
          <div className="space-y-2">
            {surpriseChallenge.options.map((opt, idx) => {
              const isSelected = selectedSurpriseOpt === idx;
              const isCorrect = idx === surpriseChallenge.correctIndex;
              let btnStyle = 'border-slate-200 bg-white hover:bg-amber-50/70 text-slate-800';
              if (surpriseFeedback && isCorrect) {
                btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950';
              } else if (surpriseFeedback && isSelected && !isCorrect) {
                btnStyle = 'border-amber-400 bg-amber-50 text-amber-950';
              }
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleAnswerSurprise(idx)}
                  className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-colors cursor-pointer min-h-[44px] ${btnStyle}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {surpriseFeedback && (
            <p className="mt-3 text-xs sm:text-sm text-slate-800 bg-white rounded-xl p-3 border border-emerald-200">
              {surpriseChallenge.explanation}
            </p>
          )}
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gradient-to-br from-teal-600 to-emerald-700 text-white rounded-3xl p-5 shadow-xs">
            <div className="flex items-center gap-2 text-yellow-300 font-display font-bold text-sm mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Dato curioso del día</span>
            </div>
            <p className="text-sm text-emerald-50 leading-relaxed">{funFact}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-900 font-display font-bold text-sm">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Insignias recientes</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('progreso')}
                className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
              >
                Ver todas
              </button>
            </div>
            {unlockedBadges.length > 0 ? (
              <div className="space-y-2">
                {unlockedBadges.slice(0, 3).map((b) => (
                  <div key={b.id} className="text-xs text-slate-700 flex items-center gap-2">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-900">{b.name}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate text-slate-500">{b.description}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Completa tus primeras misiones o registra un momento en Bienestar para desbloquear tu primera insignia.
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-indigo-50/70 border border-indigo-100 p-4 text-xs sm:text-sm text-indigo-950 leading-relaxed">
            {motivatingMsg}
          </div>
        </div>
      </div>
    </div>
  );
};
