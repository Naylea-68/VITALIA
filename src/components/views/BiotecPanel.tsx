import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, FlaskConical, Leaf, Recycle, Sparkles } from 'lucide-react';
import {
  BIOTEC_APPLICATIONS_CATALOG,
  ECO_CHALLENGES,
} from '../../data/vitaliaData';
import { BiotecProject } from '../../types/vitalia';
import { UniverseCharacter } from '../characters/VitaCharacters';

interface BiotecPanelProps {
  projects: BiotecProject[];
  onUnlockDiscovery: (discoveryId: string, xp: number) => void;
  unlockedDiscoveries: string[];
}

export const BiotecPanel: React.FC<BiotecPanelProps> = ({
  projects,
  onUnlockDiscovery,
  unlockedDiscoveries,
}) => {
  const [activeSub, setActiveSub] = useState<
    'residuos' | 'bioplasticos' | 'crear' | 'retos' | 'galeria'
  >('residuos');

  const challenge = ECO_CHALLENGES[0];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [challengeSubmitted, setChallengeSubmitted] = useState(false);

  const handleSelectItemCategory = (itemId: string, cat: string) => {
    setAnswers((prev) => ({ ...prev, [itemId]: cat }));
    setChallengeSubmitted(false);
  };

  const handleVerifyChallenge = () => {
    setChallengeSubmitted(true);
    const allCorrect = challenge.items.every((item) => answers[item.id] === item.category);
    if (allCorrect && !unlockedDiscoveries.includes('biotec-reto-1')) {
      onUnlockDiscovery('biotec-reto-1', 40);
    }
  };

  const residueExamples = [
    {
      name: 'Cáscaras de plátano',
      origin: 'De licuados y galletas Minguita feliz',
      potential: 'Contienen almidón y celulosa estudiados para películas biodegradables y composta.',
    },
    {
      name: 'Cáscaras de naranja',
      origin: 'De jugos Nutrí sorbo',
      potential: 'Ricas en pectina y aceites esenciales usados en bioplásticos cítricos y extractos.',
    },
    {
      name: 'Restos de manzana y pera',
      origin: 'Refrigerios escolares',
      potential: 'El bagazo aporta fibra y pectina para pruebas de materiales orgánicos.',
    },
    {
      name: 'Semillas y otros restos de frutas',
      origin: 'Preparación de alimentos frescos',
      potential: 'Semillas de aguacate o cítricos se investigan por almidones y pigmentos naturales.',
    },
    {
      name: 'Restos vegetales (zanahoria y hojas)',
      origin: 'Cocina diaria y extractor',
      potential: 'Ideales para lombricomposta escolar, papel artesanal fibroso y huertos.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* BIOTEC Header */}
      <section className="rounded-3xl bg-gradient-to-br from-teal-700 via-cyan-700 to-indigo-800 text-white p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-9 space-y-3">
            <div className="text-xs font-medium text-cyan-100 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-violet-200" />
              <span>BIOTEC VITALIA</span>
              <span aria-hidden="true">·</span>
              <span>Biotecnología y aprovechamiento de residuos</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold">
              La ciencia transforma lo que otros desechan.
            </h2>
            <p className="text-sm sm:text-base text-cyan-50/95 leading-relaxed max-w-2xl">
              «¿Sabías que algunos residuos de frutas y otros materiales orgánicos pueden aprovecharse para desarrollar nuevos productos? En BIOTEC descubrirás cómo la ciencia, la creatividad y la tecnología pueden transformar los residuos en nuevas posibilidades».
            </p>
          </div>
          <div className="lg:col-span-3 flex justify-center">
            <div className="bg-white/10 border border-white/15 rounded-3xl p-4">
              <UniverseCharacter character="eco" size={112} />
            </div>
          </div>
        </div>
      </section>

      {/* Sub-navigation */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-white border border-slate-200 rounded-2xl">
        {[
          { id: 'residuos', label: 'A. Del residuo al recurso' },
          { id: 'bioplasticos', label: 'B. Laboratorio de bioplásticos' },
          { id: 'crear', label: 'C. ¿Qué podemos crear?' },
          { id: 'retos', label: 'D. Retos ecológicos' },
          { id: 'galeria', label: 'E. Galería de innovación' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSub(tab.id as typeof activeSub)}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              activeSub === tab.id
                ? 'bg-cyan-700 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* A. Del residuo al recurso */}
      {activeSub === 'residuos' && (
        <section className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <h3 className="font-display text-xl font-bold text-slate-900 mb-2">
              ¿Qué son los residuos orgánicos y por qué aprovecharlos?
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Son restos de origen vegetal o alimentario que quedan tras preparar nuestras comidas. Cuando se separan limpios desde el inicio, dejan de ser basura mezclada y se convierten en materia prima para composta, papel fibroso o investigación de biopolímeros.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {residueExamples.map((res) => (
              <div key={res.name} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
                <div className="flex items-center gap-2 text-teal-700 font-display font-bold text-base">
                  <Leaf className="w-4 h-4 shrink-0" />
                  <span>{res.name}</span>
                </div>
                <p className="text-xs text-slate-500">Origen: {res.origin}</p>
                <p className="text-sm text-slate-700 leading-relaxed">{res.potential}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* B. Laboratorio de bioplásticos */}
      {activeSub === 'bioplasticos' && (
        <section className="space-y-5">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-display text-xl font-bold text-slate-900">
              ¿Qué son los bioplásticos?
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              Los bioplásticos son materiales plásticos elaborados a partir de fuentes biológicas renovables (como almidón de maíz o papa, celulosa o pectina de cáscaras de fruta), o plásticos diseñados para biodegradarse en condiciones específicas.
            </p>
            <div className="rounded-2xl bg-violet-50 border border-violet-200 p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-violet-700 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-violet-950 leading-relaxed">
                <strong>Dato científico importante:</strong> No todos los bioplásticos son iguales ni todos se degradan de la misma manera. Su impacto ambiental depende de su composición química exacta, de si requieren composta industrial o casera, y de factores como humedad, temperatura y microorganismos.
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <h4 className="font-display text-lg font-bold text-slate-900">
              Proceso experimental del equipo VITALIA
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[
                { step: '1. Recolección', text: 'Separación de cáscaras de plátano y naranja limpias de nuestras recetas.' },
                { step: '2. Extracción', text: 'Triturado y mezcla controlada con agua, almidón, vinagre y glicerina vegetal.' },
                { step: '3. Moldeado', text: 'Calentamiento suave hasta espesar y extendido en lámina delgada sobre bandeja.' },
                { step: '4. Observación', text: 'Registro de secado (48 h), flexibilidad, resistencia y pruebas de humedad.' },
              ].map((s) => (
                <div key={s.step} className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-100">
                  <p className="font-display font-bold text-sm text-cyan-950 mb-1">{s.step}</p>
                  <p className="text-xs text-cyan-900 leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* C. ¿Qué podemos crear? */}
      {activeSub === 'crear' && (
        <section className="space-y-4">
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-amber-950 leading-relaxed">
              <strong>Aclaración científica:</strong> Las aplicaciones mostradas son <strong>posibilidades de investigación y desarrollo</strong>, no productos automáticamente seguros ni listos para comercializar. Cada material requiere pruebas rigurosas de resistencia mecánica, degradación y seguridad sanitaria según su uso final.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BIOTEC_APPLICATIONS_CATALOG.map((app) => (
              <div key={app.title} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center mb-3">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="font-display font-bold text-base text-slate-900 mb-1">{app.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{app.detail}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* D. Retos ecológicos */}
      {activeSub === 'retos' && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5">
          <div>
            <div className="flex items-center gap-2 text-teal-700 font-display font-bold text-sm mb-1">
              <Recycle className="w-4 h-4" />
              <span>Reto ecológico interactivo · +40 XP</span>
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900">{challenge.title}</h3>
            <p className="text-sm text-slate-600 mt-1">{challenge.prompt}</p>
          </div>

          <div className="space-y-3">
            {challenge.items.map((item) => {
              const selected = answers[item.id];
              const isCorrect = selected === item.category;
              return (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <p className="font-semibold text-sm text-slate-900">{item.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'organico_aprovechable', label: 'Orgánico aprovechable (BIOTEC / Composta)' },
                      { id: 'inorganico_reciclable', label: 'Inorgánico reciclable' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectItemCategory(item.id, opt.id)}
                        className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                          selected === opt.id
                            ? 'bg-cyan-700 text-white border-cyan-700'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {challengeSubmitted && (
                    <p
                      className={`text-xs font-medium flex items-center gap-1.5 ${
                        isCorrect ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{isCorrect ? `¡Correcto! ${item.hint}` : `Pista: ${item.hint}`}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleVerifyChallenge}
            disabled={Object.keys(answers).length < challenge.items.length}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white text-sm font-bold cursor-pointer"
          >
            Verificar clasificación
          </button>
        </section>
      )}

      {/* E. Galería de innovación */}
      {activeSub === 'galeria' && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map((proj) => (
            <article key={proj.id} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
              <div className="text-xs text-cyan-700 font-medium flex items-center gap-2">
                <span>{proj.isTeamPrototype ? 'Prototipo estudiantil' : 'Proyecto comunitario'}</span>
                <span aria-hidden="true">·</span>
                <span>Galería BIOTEC</span>
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900">{proj.title}</h3>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Materiales de origen:</p>
                <p className="text-sm text-slate-800">{proj.originMaterials.join(' · ')}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Proceso experimental:</p>
                <p className="text-sm text-slate-700 leading-relaxed">{proj.processSummary}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Resultados y observaciones:</p>
                <p className="text-sm text-slate-700 leading-relaxed">{proj.observations}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Posibles aplicaciones futuras:</p>
                <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-700 space-y-0.5">
                  {proj.possibleApplications.map((app) => (
                    <li key={app}>{app}</li>
                  ))}
                </ul>
              </div>
              <p className="text-xs text-violet-900 bg-violet-50 border border-violet-100 rounded-xl p-3">
                {proj.safetyDisclaimer}
              </p>
            </article>
          ))}
        </section>
      )}
    </div>
  );
};
