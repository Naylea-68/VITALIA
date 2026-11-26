import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Activity,
  Award,
  Compass,
  Heart,
  Home,
  MessageCircle,
  ShieldAlert,
  Sparkles,
  Utensils,
} from 'lucide-react';
import {
  INITIAL_BIOTEC_PROJECTS,
  INITIAL_MISSIONS,
  INITIAL_RECIPES,
} from './data/vitaliaData';
import {
  AccessPolicySummary,
  ActivityEventType,
  BiotecProject,
  FoodSubTab,
  MainTab,
  Mission,
  Recipe,
  UserProfile,
  VitaAccessoryId,
} from './types/vitalia';
import { OnboardingWelcome } from './components/OnboardingWelcome';
import { VitaChatDrawer } from './components/VitaChatDrawer';
import { QrScannerModal } from './components/QrScannerModal';
import { VitaMascot } from './components/characters/VitaCharacters';
import { HomeView } from './components/views/HomeView';
import { AdventuresView } from './components/views/AdventuresView';
import { FoodView } from './components/views/FoodView';
import { MovementView } from './components/views/MovementView';
import { WellbeingView } from './components/views/WellbeingView';
import { ProgressView } from './components/views/ProgressView';

const STORAGE_KEY = 'vitalia_profile_v1';
const VISITOR_ID_KEY = 'vitalia_visitor_id_v1';

const DEFAULT_PROFILE: UserProfile = {
  onboarded: false,
  nickname: 'Explorador',
  avatar: 'vita',
  interests: [],
  allergies: [],
  equippedAccessory: 'ninguno',
  xp: 0,
  completedMissions: [],
  lastMissionId: 'm1-1',
  completedSurpriseDates: [],
  unlockedDiscoveries: [],
  wellbeingLogs: [],
  reflectionAnswers: {},
};

function loadInitialProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch {
    return DEFAULT_PROFILE;
  }
}

function getOrCreateVisitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_ID_KEY);
    if (existing && /^[a-zA-Z0-9_-]{8,64}$/.test(existing)) return existing;
    const randomPart =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID().replace(/-/g, '').slice(0, 16)
        : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
    const created = `vt-${randomPart}`;
    localStorage.setItem(VISITOR_ID_KEY, created);
    return created;
  } catch {
    return `vt-${Date.now().toString(36)}`;
  }
}

const NAV_ITEMS: { id: MainTab; label: string; icon: typeof Home }[] = [
  { id: 'inicio', label: 'Inicio', icon: Home },
  { id: 'aventuras', label: 'Aventuras', icon: Compass },
  { id: 'alimentacion', label: 'Alimentación', icon: Utensils },
  { id: 'movimiento', label: 'Movimiento', icon: Activity },
  { id: 'bienestar', label: 'Bienestar', icon: Heart },
  { id: 'progreso', label: 'Progreso', icon: Award },
];

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(loadInitialProfile);
  const [visitorId] = useState<string>(getOrCreateVisitorId);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [entryPolicy, setEntryPolicy] = useState<AccessPolicySummary>({
    requireGroupCode: false,
    groupCodeHint: '',
  });
  const [accessBlocked, setAccessBlocked] = useState(false);

  const [activeTab, setActiveTab] = useState<MainTab>('inicio');
  const [foodSubTab, setFoodSubTab] = useState<FoodSubTab>('biblioteca');

  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [missions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [biotecProjects, setBiotecProjects] = useState<BiotecProject[]>(INITIAL_BIOTEC_PROJECTS);

  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [vitaChatOpen, setVitaChatOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [xpToast, setXpToast] = useState<string | null>(null);

  const initialEntrySourceRef = useRef<'directo' | 'qr'>(
    new URLSearchParams(window.location.search).has('qr') ? 'qr' : 'directo'
  );

  const showXpNotification = (xp: number, reason: string) => {
    setXpToast(`+${xp} XP · ${reason}`);
    setTimeout(() => setXpToast(null), 3200);
  };

  const trackInteraction = useCallback(
    (
      eventType: ActivityEventType,
      label: string,
      detail?: string,
      xpDelta?: number,
      overrideProfile?: { xp?: number; missionsCompletedCount?: number; nickname?: string; avatar?: UserProfile['avatar'] }
    ) => {
      fetch('/api/activity/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId,
          nickname: overrideProfile?.nickname ?? profile.nickname,
          avatar: overrideProfile?.avatar ?? profile.avatar,
          eventType,
          label,
          detail,
          xpDelta,
          xp: overrideProfile?.xp ?? profile.xp,
          missionsCompletedCount:
            overrideProfile?.missionsCompletedCount ?? profile.completedMissions.length,
        }),
      })
        .then(async (res) => {
          if (res.status === 403) {
            const data = (await res.json().catch(() => ({}))) as { blocked?: boolean };
            if (data.blocked) setAccessBlocked(true);
          }
        })
        .catch(() => {
          // Non-blocking activity log
        });
    },
    [visitorId, profile.nickname, profile.avatar, profile.xp, profile.completedMissions.length]
  );

  const syncVisitorSession = useCallback(
    async (
      customData?: {
        nickname?: string;
        avatar?: UserProfile['avatar'];
        groupCode?: string;
        entrySource?: 'directo' | 'qr';
      }
    ): Promise<{ ok: boolean; error?: string }> => {
      try {
        const res = await fetch('/api/activity/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitorId,
            nickname: customData?.nickname ?? profile.nickname,
            avatar: customData?.avatar ?? profile.avatar,
            entrySource: customData?.entrySource ?? initialEntrySourceRef.current,
            xp: profile.xp,
            missionsCompletedCount: profile.completedMissions.length,
            groupCode: customData?.groupCode,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          blocked?: boolean;
          error?: string;
        };
        if (res.status === 403) {
          if (data.blocked) {
            setAccessBlocked(true);
          }
          return { ok: true };
        }
        if (!res.ok) {
          return { ok: true };
        }
        setAccessBlocked(false);
        return { ok: true };
      } catch {
        // Offline / server unavailable does not lock students out of playing
        return { ok: true };
      }
    },
    [visitorId, profile.nickname, profile.avatar, profile.xp, profile.completedMissions.length]
  );

  // Persist user profile locally
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore storage quota errors safely
    }
  }, [profile]);

  // Fetch entry policy for onboarding
  useEffect(() => {
    if (profile.onboarded) return;
    fetch('/api/activity/entry-policy')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { requireGroupCode?: boolean; hint?: string } | null) => {
        if (data) {
          setEntryPolicy({
            requireGroupCode: Boolean(data.requireGroupCode),
            groupCodeHint: data.hint || '',
          });
        }
      })
      .catch(() => {});
  }, [profile.onboarded]);

  // Sync returning onboarded visitor session once on mount
  const syncedStartupRef = useRef(false);
  useEffect(() => {
    if (syncedStartupRef.current || !profile.onboarded) return;
    syncedStartupRef.current = true;
    void syncVisitorSession();
  }, [profile.onboarded, syncVisitorSession]);

  // Load any custom recipes / BIOTEC projects saved on server
  useEffect(() => {
    fetch('/api/custom-content')
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (
          data: {
            recipes?: Recipe[];
            biotecProjects?: BiotecProject[];
          } | null
        ) => {
          if (!data) return;
          if (Array.isArray(data.recipes) && data.recipes.length > 0) {
            setRecipes([...INITIAL_RECIPES, ...data.recipes]);
          }
          if (Array.isArray(data.biotecProjects) && data.biotecProjects.length > 0) {
            setBiotecProjects([...INITIAL_BIOTEC_PROJECTS, ...data.biotecProjects]);
          }
        }
      )
      .catch(() => {
        // Offline / server unavailable gracefully falls back to built-in content
      });
  }, []);

  const handledQrRef = useRef(false);

  // Support direct QR query links like ?qr=VITALIA-REC-01
  useEffect(() => {
    if (handledQrRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const qrParam = params.get('qr');
    if (qrParam) {
      const normalized = qrParam.trim().toUpperCase();
      const found = recipes.find(
        (r) => r.qrCode.toUpperCase() === normalized || r.id.toUpperCase() === normalized
      );
      if (found) {
        handledQrRef.current = true;
        const alreadyUnlocked = profile.unlockedDiscoveries.includes(found.id);
        const nextXp = alreadyUnlocked ? profile.xp : profile.xp + 15;
        setProfile((prev) => {
          const done = prev.unlockedDiscoveries.includes(found.id);
          return {
            ...prev,
            onboarded: true,
            xp: done ? prev.xp : prev.xp + 15,
            unlockedDiscoveries: done
              ? prev.unlockedDiscoveries
              : [...prev.unlockedDiscoveries, found.id],
          };
        });
        setActiveTab('alimentacion');
        setFoodSubTab('laboratorio');
        setSelectedRecipe(found);

        void syncVisitorSession({ entrySource: 'qr' }).then((res) => {
          if (res.ok) {
            trackInteraction(
              'qr_scan',
              'Abrió receta mediante código QR',
              found.name,
              alreadyUnlocked ? 0 : 15,
              { xp: nextXp }
            );
          }
        });

        params.delete('qr');
        const nextSearch = params.toString();
        const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
        window.history.replaceState({}, '', nextUrl);
      }
    }
  }, [recipes, profile.unlockedDiscoveries, profile.xp, syncVisitorSession, trackInteraction]);

  const handleOnboardingComplete = async (
    data: Pick<UserProfile, 'nickname' | 'avatar' | 'interests' | 'allergies'>,
    groupCode?: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const result = await syncVisitorSession({
      nickname: data.nickname,
      avatar: data.avatar,
      groupCode,
    });
    if (!result.ok) {
      return result;
    }
    setProfile((prev) => ({
      ...prev,
      ...data,
      onboarded: true,
    }));
    trackInteraction(
      'onboarding',
      'Completó su perfil de explorador',
      data.interests.slice(0, 2).join(', '),
      0,
      { nickname: data.nickname, avatar: data.avatar }
    );
    return { ok: true };
  };

  const handleNavigateTab = (tab: MainTab, sub?: FoodSubTab) => {
    setActiveTab(tab);
    if (sub) {
      setFoodSubTab(sub);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartMission = (mission: Mission) => {
    setProfile((prev) => ({ ...prev, lastMissionId: mission.id }));
    setActiveTab('aventuras');
    setActiveMission(mission);
    trackInteraction('mision_inicio', 'Inició una misión', mission.title);
  };

  const handleCompleteMission = (mission: Mission) => {
    const alreadyDone = profile.completedMissions.includes(mission.id);
    const nextXp = alreadyDone ? profile.xp : profile.xp + mission.xpReward;
    const nextMissionsCount = alreadyDone
      ? profile.completedMissions.length
      : profile.completedMissions.length + 1;

    setProfile((prev) => {
      const doneBefore = prev.completedMissions.includes(mission.id);
      const nextMission = missions.find((m) => !prev.completedMissions.includes(m.id) && m.id !== mission.id);
      return {
        ...prev,
        xp: doneBefore ? prev.xp : prev.xp + mission.xpReward,
        completedMissions: doneBefore
          ? prev.completedMissions
          : [...prev.completedMissions, mission.id],
        lastMissionId: nextMission ? nextMission.id : mission.id,
      };
    });
    if (!alreadyDone) {
      showXpNotification(mission.xpReward, 'Misión completada');
    }
    trackInteraction(
      'mision_completada',
      'Completó una misión',
      mission.title,
      alreadyDone ? 0 : mission.xpReward,
      { xp: nextXp, missionsCompletedCount: nextMissionsCount }
    );
  };

  const handleCompleteSurpriseChallenge = (dateKey: string, xp: number) => {
    const alreadyDone = profile.completedSurpriseDates.includes(dateKey);
    if (!alreadyDone) {
      showXpNotification(xp, 'Desafío del día');
      trackInteraction(
        'desafio_diario',
        'Respondió el desafío sorpresa del día',
        dateKey,
        xp,
        { xp: profile.xp + xp }
      );
    }
    setProfile((prev) => {
      if (prev.completedSurpriseDates.includes(dateKey)) return prev;
      return {
        ...prev,
        xp: prev.xp + xp,
        completedSurpriseDates: [...prev.completedSurpriseDates, dateKey],
      };
    });
  };

  const handleUnlockDiscovery = (discoveryId: string, xp: number) => {
    const alreadyUnlocked = profile.unlockedDiscoveries.includes(discoveryId);
    if (!alreadyUnlocked) {
      showXpNotification(xp, 'Nuevo descubrimiento');
      const matchedRecipe = recipes.find((r) => r.id === discoveryId);
      const matchedBiotec = biotecProjects.find((p) => p.id === discoveryId);
      const eventType: ActivityEventType = discoveryId.startsWith('mov')
        ? 'movimiento'
        : discoveryId.startsWith('bio') || discoveryId.startsWith('eco')
        ? 'biotec'
        : 'receta';
      const detail = matchedRecipe?.name || matchedBiotec?.title || discoveryId;
      trackInteraction(
        eventType,
        eventType === 'movimiento'
          ? 'Completó guía de movimiento'
          : eventType === 'biotec'
          ? 'Exploró prototipo o reto BIOTEC'
          : 'Exploró receta saludable',
        detail,
        xp,
        { xp: profile.xp + xp }
      );
    }
    setProfile((prev) => {
      if (prev.unlockedDiscoveries.includes(discoveryId)) return prev;
      return {
        ...prev,
        xp: prev.xp + xp,
        unlockedDiscoveries: [...prev.unlockedDiscoveries, discoveryId],
      };
    });
  };

  const handleSelectRecipe = (recipe: Recipe | null) => {
    setSelectedRecipe(recipe);
    if (recipe) {
      trackInteraction('receta', 'Consultó receta en el Laboratorio', recipe.name);
    }
  };

  const handleLogEmotion = (emotion: string) => {
    setProfile((prev) => ({
      ...prev,
      wellbeingLogs: [
        {
          id: `wb-${Date.now()}`,
          emotion,
          date: new Date().toISOString(),
        },
        ...prev.wellbeingLogs.slice(0, 29),
      ],
    }));
    trackInteraction('bienestar', 'Registró su estado emocional', emotion);
  };

  const handleSaveReflection = (promptId: string, answer: string) => {
    setProfile((prev) => ({
      ...prev,
      reflectionAnswers: {
        ...prev.reflectionAnswers,
        [promptId]: answer,
      },
    }));
    trackInteraction('bienestar', 'Respondió reflexión de bienestar', promptId);
  };

  const handleAddRecipe = async (newRecipe: Recipe): Promise<boolean> => {
    if (!adminToken) return false;
    const updated = [...recipes, newRecipe];
    const customOnly = updated.filter((r) => !INITIAL_RECIPES.some((ir) => ir.id === r.id));
    try {
      const res = await fetch('/api/custom-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ recipes: customOnly }),
      });
      if (!res.ok) return false;
      setRecipes(updated);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddBiotecProject = async (newProj: BiotecProject): Promise<boolean> => {
    if (!adminToken) return false;
    const updated = [...biotecProjects, newProj];
    const customOnly = updated.filter((p) => !INITIAL_BIOTEC_PROJECTS.some((ip) => ip.id === p.id));
    try {
      const res = await fetch('/api/custom-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ biotecProjects: customOnly }),
      });
      if (!res.ok) return false;
      setBiotecProjects(updated);
      return true;
    } catch {
      return false;
    }
  };

  if (accessBlocked) {
    return (
      <div className="min-h-screen bg-[#F6FAF7] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-rose-200 shadow-sm p-7 text-center space-y-4">
          <div className="flex justify-center">
            <VitaMascot stage="semilla" expression="tranquilidad" size={112} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
            <ShieldAlert className="w-4 h-4" />
            <span>Acceso pausado</span>
          </div>
          <h1 className="font-display text-xl font-bold text-slate-900">
            El acceso desde este dispositivo está pausado
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            El equipo coordinador de VITALIA pausó temporalmente este acceso. Si crees que se trata de un error, pide ayuda a tu docente o al equipo encargado.
          </p>
          <button
            type="button"
            onClick={() => void syncVisitorSession()}
            className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold cursor-pointer"
          >
            Verificar de nuevo
          </button>
        </div>
      </div>
    );
  }

  if (!profile.onboarded) {
    return (
      <OnboardingWelcome
        entryPolicy={entryPolicy}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  const getSectionAtmosphere = () => {
    if (activeTab === 'aventuras') return 'bg-gradient-to-br from-sky-50/75 via-[#F4F9FE] to-amber-50/50';
    if (activeTab === 'alimentacion' && foodSubTab === 'laboratorio') {
      return 'bg-gradient-to-br from-yellow-50/70 via-[#FAFDF6] to-emerald-50/60';
    }
    if (activeTab === 'alimentacion' && foodSubTab === 'biotec') {
      return 'bg-gradient-to-br from-cyan-50/75 via-[#F2FAFC] to-violet-50/55';
    }
    if (activeTab === 'alimentacion' && foodSubTab === 'escolar') {
      return 'bg-gradient-to-br from-teal-50/75 via-[#F3FBF8] to-amber-50/45';
    }
    if (activeTab === 'alimentacion') {
      return 'bg-gradient-to-br from-emerald-50/75 via-[#F5FBF7] to-lime-50/45';
    }
    if (activeTab === 'movimiento') return 'bg-gradient-to-br from-orange-50/65 via-[#FFF9F4] to-sky-50/55';
    if (activeTab === 'bienestar') return 'bg-gradient-to-br from-indigo-50/65 via-[#F6F7FE] to-teal-50/50';
    if (activeTab === 'progreso') return 'bg-gradient-to-br from-amber-50/55 via-[#F7FAF7] to-emerald-50/55';
    return 'bg-gradient-to-br from-emerald-50/75 via-[#F6FAF7] to-amber-50/45';
  };

  const getTabAccentText = (tabId: MainTab) => {
    switch (tabId) {
      case 'aventuras':
        return 'text-sky-700 border-sky-600';
      case 'alimentacion':
        return foodSubTab === 'biotec'
          ? 'text-cyan-700 border-cyan-600'
          : foodSubTab === 'escolar'
          ? 'text-teal-700 border-teal-600'
          : foodSubTab === 'laboratorio'
          ? 'text-amber-700 border-amber-500'
          : 'text-emerald-700 border-emerald-600';
      case 'movimiento':
        return 'text-orange-700 border-orange-600';
      case 'bienestar':
        return 'text-indigo-700 border-indigo-600';
      case 'progreso':
        return 'text-amber-700 border-amber-600';
      case 'inicio':
      default:
        return 'text-emerald-700 border-emerald-600';
    }
  };

  return (
    <div className={`min-h-screen ${getSectionAtmosphere()} text-slate-900 flex flex-col transition-colors duration-300 print:bg-white`}>
      {/* Desktop Top Navigation Bar (3-zone contract) + Compact Mobile Header */}
      <header className="print:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 pt-safe">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-13 md:h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => handleNavigateTab('inicio')}
            className="font-display text-lg md:text-xl font-extrabold tracking-tight text-emerald-700 whitespace-nowrap shrink-0 cursor-pointer"
          >
            VITALIA
          </button>

          {/* Zone 2: Desktop Single-Line Navigation */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Navegación principal">
            {NAV_ITEMS.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigateTab(item.id)}
                  className={`text-sm font-semibold whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                    active
                      ? getTabAccentText(item.id)
                      : 'text-slate-600 border-transparent hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action (VITA RESPONDE) */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setVitaChatOpen(true)}
              className="min-h-[38px] md:min-h-[40px] px-3.5 md:px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>VITA RESPONDE</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-8 pb-24 md:pb-12">
        {activeTab === 'inicio' && (
          <HomeView
            profile={profile}
            missions={missions}
            onNavigateTab={handleNavigateTab}
            onStartMission={handleStartMission}
            onOpenVitaChat={() => setVitaChatOpen(true)}
            onOpenQrScanner={() => setQrOpen(true)}
            onCompleteSurpriseChallenge={handleCompleteSurpriseChallenge}
          />
        )}

        {activeTab === 'aventuras' && (
          <AdventuresView
            profile={profile}
            missions={missions}
            activeMission={activeMission}
            onSelectMission={setActiveMission}
            onCompleteMission={handleCompleteMission}
          />
        )}

        {activeTab === 'alimentacion' && (
          <FoodView
            subTab={foodSubTab}
            onChangeSubTab={setFoodSubTab}
            profile={profile}
            recipes={recipes}
            biotecProjects={biotecProjects}
            selectedRecipe={selectedRecipe}
            onSelectRecipe={handleSelectRecipe}
            onOpenQrScanner={() => setQrOpen(true)}
            onUnlockDiscovery={handleUnlockDiscovery}
          />
        )}

        {activeTab === 'movimiento' && (
          <MovementView
            onUnlockDiscovery={handleUnlockDiscovery}
            unlockedDiscoveries={profile.unlockedDiscoveries}
          />
        )}

        {activeTab === 'bienestar' && (
          <WellbeingView
            profile={profile}
            onLogEmotion={handleLogEmotion}
            onSaveReflection={handleSaveReflection}
          />
        )}

        {activeTab === 'progreso' && (
          <ProgressView
            profile={profile}
            missions={missions}
            recipes={recipes}
            biotecProjects={biotecProjects}
            adminToken={adminToken}
            onAdminTokenChange={setAdminToken}
            onEquipAccessory={(acc: VitaAccessoryId) =>
              setProfile((prev) => ({ ...prev, equippedAccessory: acc }))
            }
            onUpdateProfile={(partial) => setProfile((prev) => ({ ...prev, ...partial }))}
            onResetProfile={() => {
              localStorage.removeItem(STORAGE_KEY);
              setProfile(DEFAULT_PROFILE);
              setActiveTab('inicio');
            }}
            onAddRecipe={handleAddRecipe}
            onAddBiotecProject={handleAddBiotecProject}
          />
        )}
      </main>

      {/* Desktop Footer */}
      <footer className="print:hidden hidden md:block border-t border-slate-200 bg-white py-5 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-slate-500">
          <span>VITALIA · Aprende a cuidarte jugando · Pequeños hábitos, grandes descubrimientos</span>
          <span>Disponible para Android, iOS y Web</span>
        </div>
      </footer>

      {/* Mobile / Tablet Bottom Tab Bar (6 main sections) */}
      <nav
        className="print:hidden md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe"
        aria-label="Menú inferior de navegación"
      >
        <div className="grid grid-cols-6 items-center h-14">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigateTab(item.id)}
                className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 px-1 cursor-pointer transition-colors ${
                  active ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                <span className="text-[10px] font-semibold tracking-tight truncate max-w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* XP Celebration Toast */}
      {xpToast && (
        <div
          role="status"
          aria-live="polite"
          className="print:hidden fixed bottom-20 md:bottom-6 right-4 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-2xl shadow-lg border border-emerald-500 flex items-center gap-2 text-xs sm:text-sm font-bold"
        >
          <Sparkles className="w-4 h-4 text-yellow-300 shrink-0" />
          <span>{xpToast}</span>
        </div>
      )}

      {/* VITA RESPONDE AI Assistant Drawer */}
      <VitaChatDrawer
        open={vitaChatOpen}
        onClose={() => setVitaChatOpen(false)}
        profile={profile}
        onMessageSent={(question) =>
          trackInteraction('vita_chat', 'Consultó a VITA RESPONDE', question.slice(0, 120))
        }
      />

      {/* QR Code Scanner & Cafeteria Poster Modal */}
      <QrScannerModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        recipes={recipes}
        onSelectRecipe={(recipe) => {
          const alreadyUnlocked = profile.unlockedDiscoveries.includes(recipe.id);
          setActiveTab('alimentacion');
          setFoodSubTab('laboratorio');
          setSelectedRecipe(recipe);
          if (!alreadyUnlocked) {
            showXpNotification(15, 'Receta escaneada con QR');
            setProfile((prev) =>
              prev.unlockedDiscoveries.includes(recipe.id)
                ? prev
                : {
                    ...prev,
                    xp: prev.xp + 15,
                    unlockedDiscoveries: [...prev.unlockedDiscoveries, recipe.id],
                  }
            );
          }
          trackInteraction(
            'qr_scan',
            'Escaneó código QR de receta',
            recipe.name,
            alreadyUnlocked ? 0 : 15,
            { xp: alreadyUnlocked ? profile.xp : profile.xp + 15 }
          );
        }}
      />
    </div>
  );
}
