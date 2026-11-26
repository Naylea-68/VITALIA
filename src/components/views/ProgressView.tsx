import React, { useState } from 'react';
import { Award, BookMarked, Check, Lock, ShieldCheck, Trash2 } from 'lucide-react';
import {
  ACCESSORY_LABELS,
  BADGES_LIST,
  VITA_STAGES,
  getUserLevel,
  getVitaStage,
} from '../../data/vitaliaData';
import {
  BiotecProject,
  Mission,
  Recipe,
  UserProfile,
  VitaAccessoryId,
} from '../../types/vitalia';
import { VitaMascot } from '../characters/VitaCharacters';
import { AuthorizedControlPanel } from './AuthorizedControlPanel';

interface ProgressViewProps {
  profile: UserProfile;
  missions: Mission[];
  recipes: Recipe[];
  biotecProjects: BiotecProject[];
  adminToken: string | null;
  onAdminTokenChange: (token: string | null) => void;
  onEquipAccessory: (acc: VitaAccessoryId) => void;
  onUpdateProfile: (partial: Partial<UserProfile>) => void;
  onResetProfile: () => void;
  onAddRecipe: (recipe: Recipe) => Promise<boolean> | boolean | void;
  onAddBiotecProject: (proj: BiotecProject) => Promise<boolean> | boolean | void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  profile,
  missions,
  recipes,
  biotecProjects,
  adminToken,
  onAdminTokenChange,
  onEquipAccessory,
  onUpdateProfile,
  onResetProfile,
  onAddRecipe,
  onAddBiotecProject,
}) => {
  const [activeTab, setActiveTab] = useState<'logros' | 'biblioteca' | 'privacidad' | 'admin'>('logros');
  const [editNickname, setEditNickname] = useState(profile.nickname);
  const [newAllergy, setNewAllergy] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const stage = getVitaStage(profile.xp);
  const { level, currentLevelXp, nextLevelXp } = getUserLevel(profile.xp);

  const unlockedBadges = BADGES_LIST.filter((b) => b.checkUnlocked(profile));
  const unlockedAccessories: VitaAccessoryId[] = [
    'ninguno',
    ...unlockedBadges
      .map((b) => b.accessoryReward)
      .filter((a): a is VitaAccessoryId => Boolean(a)),
  ];

  const handleSaveProfileChanges = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ nickname: editNickname.trim() || 'Explorador' });
  };

  const handleAddAllergy = () => {
    const trimmed = newAllergy.trim();
    if (trimmed && !profile.allergies.includes(trimmed)) {
      onUpdateProfile({ allergies: [...profile.allergies, trimmed] });
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (item: string) => {
    onUpdateProfile({ allergies: profile.allergies.filter((a) => a !== item) });
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-white border border-slate-200 rounded-2xl">
        {[
          { id: 'logros', label: 'Progreso y evolución' },
          { id: 'biblioteca', label: 'Biblioteca descubierta' },
          { id: 'privacidad', label: 'Perfil y privacidad' },
          { id: 'admin', label: 'Equipo autorizado' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as typeof activeTab)}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
              activeTab === t.id
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t.id === 'admin' && <Lock className="w-3.5 h-3.5" />}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'logros' && (
        <div className="space-y-6">
          {/* Evolution & Level Card */}
          <section className="bg-white rounded-3xl border border-slate-200 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-4 flex flex-col items-center bg-[#F6FAF7] rounded-3xl p-5 border border-emerald-100">
                <VitaMascot
                  stage={stage.id}
                  expression="emocion"
                  accessory={profile.equippedAccessory}
                  size={136}
                />
                <p className="font-display font-bold text-lg text-slate-900 mt-2">
                  VITA · {stage.name}
                </p>
                <p className="text-xs text-slate-600 text-center mt-1">{stage.description}</p>
              </div>

              <div className="lg:col-span-8 space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-xs text-slate-500">Nivel actual</p>
                    <p className="font-mono-num text-2xl font-bold text-slate-900 mt-0.5">{level}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-xs text-slate-500">Experiencia</p>
                    <p className="font-mono-num text-2xl font-bold text-emerald-700 mt-0.5">
                      {profile.xp} XP
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
                    <p className="text-xs text-slate-500">Misiones</p>
                    <p className="font-mono-num text-2xl font-bold text-slate-900 mt-0.5">
                      {profile.completedMissions.length}/{missions.length}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono-num text-slate-600 mb-1.5">
                    <span>Siguiente nivel ({level + 1})</span>
                    <span>{currentLevelXp} / {nextLevelXp} XP</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all"
                      style={{ width: `${Math.max(5, (currentLevelXp / nextLevelXp) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* 4 Stages Evolution Roadmap */}
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-900 mb-2">
                    Etapas de evolución de VITA (basadas en aprendizaje)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {VITA_STAGES.map((st) => {
                      const reached = profile.xp >= st.minXp;
                      return (
                        <div
                          key={st.id}
                          className={`p-3 rounded-2xl border text-xs ${
                            reached
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                              : 'border-slate-200 bg-slate-50 text-slate-500'
                          }`}
                        >
                          <p className="font-display font-bold">{st.name}</p>
                          <p className="font-mono-num mt-0.5">{st.minXp}+ XP</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Accessory Wardrobe */}
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-900 mb-2">
                    Accesorios desbloqueados para VITA
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(ACCESSORY_LABELS) as VitaAccessoryId[]).map((acc) => {
                      const isUnlocked = unlockedAccessories.includes(acc);
                      const isEquipped = profile.equippedAccessory === acc;
                      return (
                        <button
                          key={acc}
                          type="button"
                          disabled={!isUnlocked}
                          onClick={() => onEquipAccessory(acc)}
                          className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                            isEquipped
                              ? 'bg-emerald-600 text-white border-emerald-600 cursor-pointer'
                              : isUnlocked
                              ? 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 cursor-pointer'
                              : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          }`}
                        >
                          {ACCESSORY_LABELS[acc]}
                          {!isUnlocked && ' (Bloqueado)'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Badges */}
          <section className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <span>Insignias de VITALIA ({unlockedBadges.length}/{BADGES_LIST.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {BADGES_LIST.map((badge) => {
                const earned = badge.checkUnlocked(profile);
                return (
                  <div
                    key={badge.id}
                    className={`rounded-2xl border p-4 space-y-2 ${
                      earned
                        ? 'border-amber-300 bg-amber-50/50'
                        : 'border-slate-200 bg-slate-50/60 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className={earned ? 'text-amber-800' : 'text-slate-500'}>
                        {earned ? 'Desbloqueada' : 'Por descubrir'}
                      </span>
                      {earned && <Check className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <h3 className="font-display font-bold text-base text-slate-900">{badge.name}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{badge.description}</p>
                    <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/70">
                      {badge.conditionText}
                      {badge.accessoryName ? ` · Accesorio: ${badge.accessoryName}` : ''}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'biblioteca' && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-emerald-700" />
            <h2 className="font-display text-xl font-bold text-slate-900">
              Biblioteca de descubrimientos
            </h2>
          </div>

          <div>
            <h3 className="font-display font-bold text-sm text-slate-800 mb-2">
              Misiones exploradas ({profile.completedMissions.length})
            </h3>
            {profile.completedMissions.length === 0 ? (
              <p className="text-sm text-slate-500">
                Aún no has completado misiones. ¡Visita el mapa de Aventuras para comenzar!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {missions
                  .filter((m) => profile.completedMissions.includes(m.id))
                  .map((m) => (
                    <div key={m.id} className="p-4 rounded-2xl bg-[#F6FAF7] border border-emerald-100">
                      <p className="text-xs text-emerald-700 font-semibold">{m.zoneName}</p>
                      <p className="font-display font-bold text-sm text-slate-900">{m.title}</p>
                      <p className="text-xs text-slate-700 mt-1">{m.educationalTakeaway}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-display font-bold text-sm text-slate-800 mb-2">
              Recetas y actividades guardadas ({profile.unlockedDiscoveries.length})
            </h3>
            {profile.unlockedDiscoveries.length === 0 ? (
              <p className="text-sm text-slate-500">
                Abre recetas del Laboratorio, retos BIOTEC o guías de Movimiento para ir llenando tu biblioteca.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 text-xs text-slate-700">
                {profile.unlockedDiscoveries.map((id) => {
                  const rec = recipes.find((r) => r.id === id);
                  return (
                    <span key={id} className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
                      {rec ? rec.name : id}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === 'privacidad' && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Perfil y controles de privacidad
              </h2>
              <p className="text-sm text-slate-600">
                Tus datos de perfil, alergias y progreso se almacenan localmente en tu dispositivo. Nunca recopilamos peso, talla, medidas ni fotos corporales.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfileChanges} className="space-y-4 max-w-lg">
            <div>
              <label htmlFor="edit-nick" className="block text-sm font-semibold text-slate-800 mb-1.5">
                Tu apodo en VITALIA
              </label>
              <div className="flex gap-2">
                <input
                  id="edit-nick"
                  type="text"
                  maxLength={24}
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
                <button
                  type="submit"
                  className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </div>
          </form>

          <div className="max-w-lg space-y-3">
            <p className="text-sm font-semibold text-slate-800">
              Alergias o ingredientes a evitar en recetas
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.allergies.length === 0 && (
                <span className="text-xs text-slate-500">Ninguno registrado.</span>
              )}
              {profile.allergies.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleRemoveAllergy(item)}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium text-amber-900 cursor-pointer hover:bg-amber-100"
                >
                  {item} ×
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder="Agregar ingrediente a evitar..."
                className="flex-1 min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
              <button
                type="button"
                onClick={handleAddAllergy}
                className="min-h-[42px] px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold cursor-pointer"
              >
                Agregar
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="min-h-[42px] px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reiniciar perfil y borrar datos locales</span>
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3 max-w-lg">
                <p className="text-sm text-rose-950 font-medium">
                  ¿Seguro que deseas reiniciar tu perfil, progreso y reflexiones guardadas en este dispositivo?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onResetProfile();
                      setConfirmReset(false);
                    }}
                    className="min-h-[40px] px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Sí, reiniciar todo
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="min-h-[40px] px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === 'admin' && (
        <AuthorizedControlPanel
          token={adminToken}
          onTokenChange={onAdminTokenChange}
          recipesCount={recipes.length}
          biotecCount={biotecProjects.length}
          onAddRecipe={onAddRecipe}
          onAddBiotecProject={onAddBiotecProject}
        />
      )}
    </div>
  );
};
