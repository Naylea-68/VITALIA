import React, { useEffect, useState } from 'react';
import { CheckCircle2, ChevronRight, Compass, Lock, MapPin, Play, Sparkles, X } from 'lucide-react';
import { WORLDS } from '../../data/vitaliaData';
import { Mission, MissionStepOption, UserProfile } from '../../types/vitalia';
import { CHARACTER_META, UniverseCharacter } from '../characters/VitaCharacters';

interface AdventuresViewProps {
  profile: UserProfile;
  missions: Mission[];
  activeMission: Mission | null;
  onSelectMission: (mission: Mission | null) => void;
  onCompleteMission: (mission: Mission) => void;
}

export const AdventuresView: React.FC<AdventuresViewProps> = ({
  profile,
  missions,
  activeMission,
  onSelectMission,
  onCompleteMission,
}) => {
  const [selectedWorldId, setSelectedWorldId] = useState<number>(1);
  const [selectedOption, setSelectedOption] = useState<MissionStepOption | null>(null);

  useEffect(() => {
    if (!activeMission) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSelectMission(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeMission, onSelectMission]);

  const openMission = (mission: Mission) => {
    setSelectedOption(null);
    onSelectMission(mission);
  };

  const handleChooseOption = (opt: MissionStepOption) => {
    setSelectedOption(opt);
  };

  const handleFinishMission = () => {
    if (!activeMission) return;
    onCompleteMission(activeMission);
    setSelectedOption(null);
    onSelectMission(null);
  };

  const worldMissions = missions.filter((m) => m.worldId === selectedWorldId);
  const currentWorld = WORLDS.find((w) => w.id === selectedWorldId) || WORLDS[0];

  const worldThemeMap: Record<
    number,
    {
      banner: string;
      cardActive: string;
      cardIdle: string;
      pillText: string;
      button: string;
    }
  > = {
    1: {
      banner: 'from-emerald-600 via-teal-600 to-green-700',
      cardActive: 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200',
      cardIdle: 'border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50/70',
      pillText: 'text-emerald-700',
      button: 'bg-emerald-600 hover:bg-emerald-700',
    },
    2: {
      banner: 'from-amber-500 via-orange-500 to-yellow-600',
      cardActive: 'border-amber-600 bg-amber-50 ring-2 ring-amber-200',
      cardIdle: 'border-amber-100 bg-amber-50/30 hover:bg-amber-50/70',
      pillText: 'text-amber-700',
      button: 'bg-amber-600 hover:bg-amber-700',
    },
    3: {
      banner: 'from-sky-600 via-blue-600 to-cyan-700',
      cardActive: 'border-sky-600 bg-sky-50 ring-2 ring-sky-200',
      cardIdle: 'border-sky-100 bg-sky-50/30 hover:bg-sky-50/70',
      pillText: 'text-sky-700',
      button: 'bg-sky-600 hover:bg-sky-700',
    },
    4: {
      banner: 'from-indigo-600 via-violet-600 to-purple-700',
      cardActive: 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200',
      cardIdle: 'border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50/70',
      pillText: 'text-indigo-700',
      button: 'bg-indigo-600 hover:bg-indigo-700',
    },
    5: {
      banner: 'from-teal-600 via-cyan-700 to-indigo-700',
      cardActive: 'border-cyan-600 bg-cyan-50 ring-2 ring-cyan-200',
      cardIdle: 'border-cyan-100 bg-cyan-50/30 hover:bg-cyan-50/70',
      pillText: 'text-cyan-700',
      button: 'bg-cyan-700 hover:bg-cyan-800',
    },
  };

  const activeTheme = worldThemeMap[selectedWorldId] || worldThemeMap[1];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="rounded-3xl bg-white border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-sky-700 mb-1">
              El camino de VITALIA · Punto de partida: El origen de VITALIA
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Aventuras por los 5 Mundos
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Explora cada territorio a tu ritmo. Cada zona tiene su propia atmósfera visual para acompañarte mientras descubres cosas nuevas, sin penalizaciones ni prisas.
            </p>
          </div>
          <div className="text-xs sm:text-sm font-mono-num text-slate-800 bg-gradient-to-r from-emerald-50 to-sky-50 border border-slate-200 rounded-2xl px-4 py-3 shrink-0">
            Misiones completadas: <strong>{profile.completedMissions.length}</strong> / {missions.length}
          </div>
        </div>

        {/* Adventure Map Path */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {WORLDS.map((world) => {
            const worldMs = missions.filter((m) => m.worldId === world.id);
            const doneCount = worldMs.filter((m) => profile.completedMissions.includes(m.id)).length;
            const active = selectedWorldId === world.id;
            const wTheme = worldThemeMap[world.id] || worldThemeMap[1];
            return (
              <button
                key={world.id}
                type="button"
                onClick={() => setSelectedWorldId(world.id)}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  active ? wTheme.cardActive : wTheme.cardIdle
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-xs font-mono-num font-bold ${wTheme.pillText}`}>
                    Zona {world.id}
                  </span>
                  <UniverseCharacter character={world.character} size={42} vitaStage="brote" />
                </div>
                <div>
                  <p className="font-display font-bold text-sm text-slate-900 leading-snug">
                    {world.zoneName}
                  </p>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{world.title}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-between text-xs font-mono-num text-slate-700">
                  <span>{doneCount}/{worldMs.length} listas</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Selected World Detail & Mission List */}
      <section className="rounded-3xl bg-white border border-slate-200 overflow-hidden">
        <div className={`bg-gradient-to-r ${activeTheme.banner} text-white p-6 flex flex-col sm:flex-row sm:items-center gap-4`}>
          <div className="shrink-0 bg-white/15 border border-white/20 rounded-3xl p-2 self-start sm:self-center">
            <UniverseCharacter character={currentWorld.character} size={74} vitaStage="explorador" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-white/90 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{currentWorld.zoneName}</span>
              <span aria-hidden="true">·</span>
              <span>Guía: {CHARACTER_META[currentWorld.character].name}</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white mt-0.5">
              {currentWorld.title}
            </h2>
            <p className="text-sm text-white/90 mt-1">{currentWorld.description}</p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {worldMissions.map((mission, idx) => {
            const isCompleted = profile.completedMissions.includes(mission.id);
            return (
              <div
                key={mission.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between transition-colors ${
                  isCompleted ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                    <span className="font-mono-num">Misión {idx + 1}</span>
                    <span className={`font-mono-num font-semibold ${activeTheme.pillText}`}>
                      +{mission.xpReward} XP
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-slate-900 mb-1.5">
                    {mission.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{mission.summary}</p>
                </div>

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    {isCompleted ? (
                      <span className="text-emerald-700 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Completada
                      </span>
                    ) : (
                      <span className="text-slate-500 inline-flex items-center gap-1">
                        <Compass className="w-4 h-4" />
                        Lista para explorar
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => openMission(mission)}
                    className={`min-h-[42px] px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                      isCompleted
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        : `${activeTheme.button} text-white`
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isCompleted ? 'Repasar' : 'Explorar'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Mission Modal */}
      {activeMission && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={activeMission.title}
          onClick={(e) => {
            if (e.target === e.currentTarget) onSelectMission(null);
          }}
        >
          <div className="bg-white w-full sm:max-w-xl max-h-[92dvh] rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-emerald-700 font-semibold">{activeMission.zoneName}</p>
                <h2 className="font-display font-bold text-lg text-slate-900">{activeMission.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => onSelectMission(null)}
                aria-label="Cerrar misión"
                className="min-w-[44px] min-h-[44px] rounded-xl hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-700" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Narrative intro with character */}
              <div className="rounded-2xl bg-[#F6FAF7] border border-emerald-100 p-4 flex items-start gap-3.5">
                <div className="shrink-0">
                  <UniverseCharacter character={activeMission.character} size={64} vitaStage="explorador" />
                </div>
                <p className="text-sm text-slate-800 leading-relaxed">{activeMission.narrativeIntro}</p>
              </div>

              {/* Interactive question */}
              <div>
                <h3 className="font-display font-bold text-base text-slate-900 mb-3">
                  {activeMission.question}
                </h3>
                <div className="space-y-2.5">
                  {activeMission.options.map((opt) => {
                    const isPicked = selectedOption?.id === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleChooseOption(opt)}
                        className={`w-full text-left p-4 rounded-2xl border text-sm transition-all cursor-pointer ${
                          isPicked
                            ? opt.isBest
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-200'
                              : 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-200'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <p className="font-medium leading-snug">{opt.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback & educational takeaway */}
              {selectedOption && (
                <div className="space-y-3">
                  <div
                    className={`rounded-2xl p-4 border text-sm leading-relaxed ${
                      selectedOption.isBest
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : 'bg-amber-50 border-amber-200 text-amber-950'
                    }`}
                  >
                    <p className="font-semibold mb-1">{selectedOption.feedback}</p>
                    {(selectedOption.pros || selectedOption.limits) && (
                      <div className="mt-2 pt-2 border-t border-black/10 text-xs space-y-1">
                        {selectedOption.pros && (
                          <p>
                            <strong>Ventajas:</strong> {selectedOption.pros}
                          </p>
                        )}
                        {selectedOption.limits && (
                          <p>
                            <strong>A considerar:</strong> {selectedOption.limits}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Aprendizaje clave</span>
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {activeMission.educationalTakeaway}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3 pb-safe">
              <span className="text-xs font-mono-num text-slate-500 flex items-center gap-1">
                {selectedOption ? (
                  <>Recompensa: +{activeMission.xpReward} XP</>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    Elige una respuesta para continuar
                  </>
                )}
              </span>
              <button
                type="button"
                disabled={!selectedOption}
                onClick={handleFinishMission}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-sm font-bold cursor-pointer transition-colors"
              >
                {profile.completedMissions.includes(activeMission.id)
                  ? 'Finalizar repaso'
                  : `Completar (+${activeMission.xpReward} XP)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
