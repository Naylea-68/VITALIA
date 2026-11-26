import React, { useEffect, useState } from 'react';
import { Heart, Pause, Play, ShieldAlert, Sparkles, Wind } from 'lucide-react';
import { EMOTION_RESPONSES, VITA_WELLBEING_MESSAGES } from '../../data/vitaliaData';
import { UserProfile } from '../../types/vitalia';
import { UniverseCharacter } from '../characters/VitaCharacters';

interface WellbeingViewProps {
  profile: UserProfile;
  onLogEmotion: (emotion: string) => void;
  onSaveReflection: (promptId: string, answer: string) => void;
}

const REFLECTION_PROMPTS = [
  {
    id: 'ref-1',
    question: '¿Qué pequeño momento del día te dio calma o te hizo sentir bien?',
  },
  {
    id: 'ref-2',
    question: '¿Cómo sabes cuándo necesitas una pausa de pantallas o de estudio?',
  },
  {
    id: 'ref-3',
    question: '¿A quién puedes acudir si algún día te sientes abrumado o preocupado?',
  },
];

export const WellbeingView: React.FC<WellbeingViewProps> = ({
  profile,
  onLogEmotion,
  onSaveReflection,
}) => {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhala lento (4s)' | 'Sostén suave (4s)' | 'Exhala despacio (4s)'>('Inhala lento (4s)');
  const [breathCount, setBreathCount] = useState(4);
  const [mentalScene, setMentalScene] = useState<'bosque' | 'lago' | 'aurora'>('aurora');
  const [draftReflections, setDraftReflections] = useState<Record<string, string>>(
    profile.reflectionAnswers
  );
  const [savedToast, setSavedToast] = useState<string | null>(null);

  useEffect(() => {
    if (!breathingActive) return;
    const phases: ('Inhala lento (4s)' | 'Sostén suave (4s)' | 'Exhala despacio (4s)')[] = [
      'Inhala lento (4s)',
      'Sostén suave (4s)',
      'Exhala despacio (4s)',
    ];
    let step = 0;
    let sec = 4;
    setBreathPhase(phases[0]);
    setBreathCount(4);

    const timer = setInterval(() => {
      sec -= 1;
      if (sec <= 0) {
        step = (step + 1) % phases.length;
        sec = 4;
        setBreathPhase(phases[step]);
      }
      setBreathCount(sec);
    }, 1000);

    return () => clearInterval(timer);
  }, [breathingActive]);

  const handleChooseEmotion = (key: string) => {
    setSelectedEmotion(key);
    onLogEmotion(key);
  };

  const handleSaveNote = (id: string) => {
    onSaveReflection(id, draftReflections[id] || '');
    setSavedToast(id);
    setTimeout(() => setSavedToast(null), 2000);
  };

  const emotionData = selectedEmotion ? EMOTION_RESPONSES[selectedEmotion] : null;

  return (
    <div className="space-y-6">
      {/* Calm Header */}
      <section className="rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-teal-700 text-white p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-9 space-y-2.5">
            <div className="text-xs font-medium text-indigo-100 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>Bienestar VITALIA</span>
              <span aria-hidden="true">·</span>
              <span>Emociones, descanso y autocuidado</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold">
              Un espacio tranquilo para escucharte
            </h1>
            <p className="text-sm sm:text-base text-indigo-50/95 max-w-2xl leading-relaxed">
              LUMI te acompaña a hacer pausas conscientes, reconocer cómo te sientes y recordar que descansar también es parte de cuidarte.
            </p>
          </div>
          <div className="lg:col-span-3 flex justify-center">
            <div className="bg-white/15 border border-white/20 rounded-3xl p-4">
              <UniverseCharacter character="lumi" size={108} />
            </div>
          </div>
        </div>
      </section>

      {/* A. ¿Cómo te sientes hoy? */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            A. ¿Cómo te sientes hoy?
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Es completamente voluntario. Elige la palabra que mejor describa tu momento actual.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {Object.entries(EMOTION_RESPONSES).map(([key, info]) => {
            const active = selectedEmotion === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleChooseEmotion(key)}
                className={`min-h-[48px] px-3 py-3 rounded-2xl border text-sm font-semibold transition-all cursor-pointer ${
                  active
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-200'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                }`}
              >
                {info.label}
              </button>
            );
          })}
        </div>

        {emotionData && (
          <div className="rounded-2xl bg-indigo-50/80 border border-indigo-200 p-5 space-y-2">
            <p className="font-display font-bold text-base text-indigo-950">
              Hoy elegiste: {emotionData.label}
            </p>
            <p className="text-sm text-indigo-950 leading-relaxed">{emotionData.message}</p>
            <p className="text-xs sm:text-sm text-indigo-800">{emotionData.suggestion}</p>
          </div>
        )}
      </section>

      {/* B. Pausas conscientes */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 text-indigo-700 font-display font-bold text-base">
            <Wind className="w-5 h-5" />
            <span>B. Pausas conscientes · Paisaje mental y respiración</span>
          </div>
          <p className="text-sm text-slate-600">
            Elige un paisaje cromático para imaginar mientras descansas de las pantallas y sigues el ritmo 4-4-4.
          </p>

          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
            {[
              { id: 'aurora', label: 'Aurora calma' },
              { id: 'bosque', label: 'Bosque verde' },
              { id: 'lago', label: 'Lago azul' },
            ].map((scene) => (
              <button
                key={scene.id}
                type="button"
                onClick={() => setMentalScene(scene.id as typeof mentalScene)}
                className={`min-h-[36px] rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  mentalScene === scene.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                {scene.label}
              </button>
            ))}
          </div>

          {(() => {
            const sceneStyles = {
              aurora: {
                canvas: 'from-indigo-950 via-violet-900 to-teal-900 text-white',
                orb: 'from-teal-300 via-indigo-300 to-violet-300',
                prompt: 'Imagina luces suaves moviéndose lento en un cielo tranquilo.',
              },
              bosque: {
                canvas: 'from-emerald-900 via-teal-800 to-green-950 text-white',
                orb: 'from-lime-200 via-emerald-300 to-teal-200',
                prompt: 'Imagina el aire fresco entre hojas verdes y sombra suave.',
              },
              lago: {
                canvas: 'from-sky-900 via-cyan-800 to-blue-950 text-white',
                orb: 'from-cyan-200 via-sky-300 to-indigo-200',
                prompt: 'Imagina ondas lentas y serenas sobre un lago en calma.',
              },
            }[mentalScene];

            return (
              <div className={`rounded-3xl bg-gradient-to-br ${sceneStyles.canvas} p-6 flex flex-col items-center justify-center transition-colors duration-500`}>
                <div
                  className={`w-36 h-36 rounded-full bg-gradient-to-tr ${sceneStyles.orb} flex flex-col items-center justify-center shadow-lg transition-transform duration-1000 ${
                    breathingActive && breathPhase.startsWith('Inhala')
                      ? 'scale-110'
                      : breathingActive && breathPhase.startsWith('Sostén')
                      ? 'scale-110'
                      : 'scale-95'
                  }`}
                >
                  <span className="font-mono-num text-2xl font-bold text-slate-950">{breathCount}</span>
                  <span className="text-xs font-bold text-slate-900 text-center px-3 mt-1">
                    {breathingActive ? breathPhase : 'Listo para respirar'}
                  </span>
                </div>

                <p className="text-xs text-white/85 text-center mt-4 max-w-xs">
                  {sceneStyles.prompt}
                </p>

                <button
                  type="button"
                  onClick={() => setBreathingActive((a) => !a)}
                  className="mt-4 min-h-[44px] px-5 py-2.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
                >
                  {breathingActive ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pausar ejercicio</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Iniciar pausa de respiración</span>
                    </>
                  )}
                </button>
              </div>
            );
          })()}
        </div>

        {/* D. Mensajes VITA */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
          <div className="flex items-center gap-2 text-teal-700 font-display font-bold text-base">
            <Sparkles className="w-5 h-5" />
            <span>D. Mensajes VITA de autocuidado</span>
          </div>
          <div className="space-y-2.5">
            {VITA_WELLBEING_MESSAGES.map((msg) => (
              <div
                key={msg}
                className="p-3.5 rounded-2xl bg-[#F6FAF7] border border-emerald-100 text-sm text-slate-800 leading-relaxed"
              >
                {msg}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* C. Conócete mejor */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            C. Conócete mejor (espacio privado)
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Tus respuestas se guardan únicamente en este dispositivo para ti. Nadie más las lee ni se califican.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {REFLECTION_PROMPTS.map((item) => (
            <div key={item.id} className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-col justify-between gap-3">
              <label htmlFor={item.id} className="text-sm font-semibold text-slate-900">
                {item.question}
              </label>
              <textarea
                id={item.id}
                rows={3}
                value={draftReflections[item.id] || ''}
                onChange={(e) =>
                  setDraftReflections((prev) => ({ ...prev, [item.id]: e.target.value }))
                }
                placeholder="Escribe aquí si lo deseas..."
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => handleSaveNote(item.id)}
                className="min-h-[38px] px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer self-end"
              >
                {savedToast === item.id ? 'Guardado localmente' : 'Guardar nota'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Supportive Notice */}
      <section className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-amber-950 leading-relaxed">
          <strong>Acompañamiento responsable:</strong> VITALIA es una herramienta educativa y no sustituye la atención psicológica o médica profesional ni realiza diagnósticos. Si en algún momento sientes que necesitas ayuda, busca apoyo hablando con una persona adulta de confianza en tu familia, escuela o servicio de salud.
        </p>
      </section>
    </div>
  );
};
