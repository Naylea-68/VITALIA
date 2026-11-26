import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, HeartHandshake, Pause, Play, RotateCcw } from 'lucide-react';
import { BODY_EDUCATION_TOPICS, MOVEMENT_ACTIVITIES } from '../../data/vitaliaData';
import { MovementActivity } from '../../types/vitalia';
import { UniverseCharacter } from '../characters/VitaCharacters';

interface MovementViewProps {
  onUnlockDiscovery: (discoveryId: string, xp: number) => void;
  unlockedDiscoveries: string[];
}

export const MovementView: React.FC<MovementViewProps> = ({
  onUnlockDiscovery,
  unlockedDiscoveries,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [activeActivity, setActiveActivity] = useState<MovementActivity | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const filteredActivities =
    selectedCategory === 'todas'
      ? MOVEMENT_ACTIVITIES
      : MOVEMENT_ACTIVITIES.filter((a) => a.category === selectedCategory);

  const handleCompleteActivity = (act: MovementActivity) => {
    if (!unlockedDiscoveries.includes(`mov-${act.id}`)) {
      onUnlockDiscovery(`mov-${act.id}`, 25);
    }
    setActiveActivity(null);
    setTimerRunning(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-sky-600 text-white p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-9 space-y-2.5">
            <div className="text-xs font-medium text-amber-50 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>Movimiento VITALIA</span>
              <span aria-hidden="true">·</span>
              <span>Adaptable a tu ritmo y posibilidades</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold">
              Muévete a tu manera, sin presiones ni comparaciones
            </h1>
            <p className="text-sm sm:text-base text-white/95 max-w-2xl leading-relaxed">
              Caminar, bailar, andar en bicicleta, jugar o estirar forman parte de una vida activa. Aquí no contamos calorías ni medimos cuerpos: celebramos disfrutar el movimiento y respetar tu descanso.
            </p>
          </div>
          <div className="lg:col-span-3 flex justify-center">
            <div className="bg-white/15 border border-white/20 rounded-3xl p-4">
              <UniverseCharacter character="mova" size={110} />
            </div>
          </div>
        </div>
      </section>

      {/* A & C: Muévete a tu manera filter */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            Explora y elige cómo quieres moverte hoy
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Filtra por el tipo de actividad que te llame la atención. Todas se adaptan a tu espacio y energía.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-2xl">
          {[
            { id: 'todas', label: 'Todas' },
            { id: 'baile', label: 'Baile' },
            { id: 'caminata', label: 'Caminata' },
            { id: 'movilidad', label: 'Movilidad' },
            { id: 'juegos', label: 'Juegos recreativos' },
            { id: 'ejercicios', label: 'Movimiento general' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-700 hover:bg-white/70'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredActivities.map((act) => {
            const done = unlockedDiscoveries.includes(`mov-${act.id}`);
            return (
              <article
                key={act.id}
                className="rounded-2xl border border-slate-200 p-5 flex flex-col justify-between bg-white"
              >
                <div>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mb-1.5">
                    <span className="font-semibold text-orange-700 capitalize">{act.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{act.duration}</span>
                    <span aria-hidden="true">·</span>
                    <span>{act.adaptability}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900 mb-2">{act.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-3">{act.description}</p>
                  <p className="text-xs text-sky-900 bg-sky-50 border border-sky-100 rounded-xl p-2.5 mb-4">
                    <strong>Beneficio:</strong> {act.bodyFocus}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    {done ? 'Explorada (+25 XP ganados)' : '+25 XP al explorar'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveActivity(act);
                      setTimerSeconds(60);
                      setTimerRunning(false);
                    }}
                    className="min-h-[42px] px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold cursor-pointer"
                  >
                    Ver guía
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Active Activity Interactive Guide */}
      {activeActivity && (
        <section className="bg-white rounded-3xl border-2 border-orange-300 p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-orange-700">Actividad seleccionada</p>
              <h3 className="font-display text-xl font-bold text-slate-900">{activeActivity.title}</h3>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 rounded-2xl px-4 py-2">
              <span className="font-mono-num font-bold text-lg text-slate-900">
                {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:
                {String(timerSeconds % 60).padStart(2, '0')}
              </span>
              <button
                type="button"
                onClick={() => setTimerRunning((r) => !r)}
                aria-label={timerRunning ? 'Pausar temporizador' : 'Iniciar temporizador de 1 minuto'}
                className="min-w-[38px] min-h-[38px] rounded-xl bg-orange-600 text-white flex items-center justify-center cursor-pointer"
              >
                {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimerRunning(false);
                  setTimerSeconds(60);
                }}
                aria-label="Reiniciar temporizador"
                className="min-w-[38px] min-h-[38px] rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <ol className="list-decimal pl-5 text-sm text-slate-700 space-y-1.5">
            {activeActivity.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <p className="text-xs text-slate-600 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Recuerda tomar agua y descansar si sientes cansancio.</span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveActivity(null);
                  setTimerRunning(false);
                }}
                className="min-h-[42px] px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => handleCompleteActivity(activeActivity)}
                className="min-h-[42px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Marcar como explorada</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* D. Aprende sobre tu cuerpo */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            Aprende sobre tu cuerpo
          </h2>
          <p className="text-sm text-slate-600">
            Descubre cómo trabajan tus músculos, huesos, articulaciones y por qué la recuperación es esencial.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {BODY_EDUCATION_TOPICS.map((topic) => (
            <div key={topic.id} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-2">
              <h3 className="font-display text-lg font-bold text-slate-900">{topic.title}</h3>
              <p className="text-xs font-semibold text-sky-700">{topic.summary}</p>
              <p className="text-sm text-slate-700 leading-relaxed">{topic.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
