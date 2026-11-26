export type MainTab =
  | 'inicio'
  | 'aventuras'
  | 'alimentacion'
  | 'movimiento'
  | 'bienestar'
  | 'progreso';

export type FoodSubTab = 'biblioteca' | 'laboratorio' | 'biotec' | 'escolar';

export type CharacterId = 'vita' | 'nutri' | 'chefia' | 'eco' | 'mova' | 'lumi';

export type VitaExpression =
  | 'alegria'
  | 'sorpresa'
  | 'curiosidad'
  | 'concentracion'
  | 'emocion'
  | 'tranquilidad';

export type VitaStageId = 'semilla' | 'brote' | 'explorador' | 'guardian';

export type VitaAccessoryId = 'ninguno' | 'lupa' | 'bata' | 'mochila' | 'gorro' | 'hoja_dorada';

export interface UserProfile {
  onboarded: boolean;
  nickname: string;
  avatar: CharacterId;
  interests: string[];
  allergies: string[];
  equippedAccessory: VitaAccessoryId;
  xp: number;
  completedMissions: string[];
  lastMissionId: string | null;
  completedSurpriseDates: string[];
  unlockedDiscoveries: string[];
  wellbeingLogs: {
    id: string;
    emotion: string;
    note?: string;
    date: string;
  }[];
  reflectionAnswers: Record<string, string>;
}

export interface MissionStepOption {
  id: string;
  label: string;
  feedback: string;
  isBest?: boolean;
  pros?: string;
  limits?: string;
}

export interface Mission {
  id: string;
  worldId: number;
  worldTitle: string;
  zoneName: string;
  title: string;
  summary: string;
  narrativeIntro: string;
  character: CharacterId;
  xpReward: number;
  type: 'choice' | 'quiz' | 'decision';
  question: string;
  options: MissionStepOption[];
  educationalTakeaway: string;
}

export interface RecipeCostItem {
  ingredient: string;
  portion: string;
  cost: number;
}

export interface RecipeEconomics {
  portionLabel: string;
  unitCost: number;
  suggestedPrice?: number;
  isEstimate?: boolean;
  breakdown: RecipeCostItem[];
}

export interface Recipe {
  id: string;
  qrCode: string;
  name: string;
  brandLine?: string;
  category: 'snack' | 'bebida' | 'comida';
  isProjectRecipe: boolean;
  prepTime: string;
  difficulty: 'Sencilla' | 'Media';
  costLevel: 'Económica' | 'Moderada';
  ingredients: string[];
  keyIngredientTags: string[];
  allergens: string[];
  steps: string[];
  substitutions: string[];
  nutrientsInfo: string;
  projectWhy?: string;
  accentColor: string;
  imageUrl?: string;
  economics?: RecipeEconomics;
}

export interface NutrientCardData {
  id: string;
  name: string;
  role: string;
  everydayExample: string;
  foodSources: string[];
  funFact: string;
}

export interface FoodGroupData {
  id: string;
  name: string;
  description: string;
  examples: string[];
  dailyTip: string;
}

export interface MythRealityItem {
  id: string;
  myth: string;
  reality: string;
  explanation: string;
}

export interface FoodExperiment {
  id: string;
  title: string;
  question: string;
  materials: string[];
  steps: string[];
  scienceExplanation: string;
  observationPrompt: string;
}

export interface BiotecProject {
  id: string;
  title: string;
  originMaterials: string[];
  processSummary: string;
  observations: string;
  possibleApplications: string[];
  safetyDisclaimer: string;
  isTeamPrototype: boolean;
}

export interface EcologicalChallenge {
  id: string;
  title: string;
  prompt: string;
  items: {
    id: string;
    label: string;
    category: 'organico_aprovechable' | 'no_aprovechable_compostable' | 'inorganico_reciclable';
    hint: string;
  }[];
}

export interface MovementActivity {
  id: string;
  title: string;
  category: 'baile' | 'caminata' | 'movilidad' | 'juegos' | 'ejercicios';
  duration: string;
  adaptability: string;
  description: string;
  steps: string[];
  bodyFocus: string;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  category: 'Alimentación' | 'Nutrientes' | 'Bienestar' | 'BIOTEC';
  definition: string;
  example: string;
}

export interface FoodSearchItem {
  id: string;
  name: string;
  group: string;
  mainNutrients: string[];
  characteristics: string;
  prepIdeas: string[];
  residueIdea: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  conditionText: string;
  accessoryReward?: VitaAccessoryId;
  accessoryName?: string;
  checkUnlocked: (profile: UserProfile) => boolean;
}

export type ActivityEventType =
  | 'ingreso'
  | 'onboarding'
  | 'qr_scan'
  | 'receta'
  | 'mision_inicio'
  | 'mision_completada'
  | 'desafio_diario'
  | 'biotec'
  | 'movimiento'
  | 'bienestar'
  | 'vita_chat';

export interface VisitorRecord {
  visitorId: string;
  nickname: string;
  avatar: CharacterId;
  entrySource: 'directo' | 'qr';
  firstSeenAt: string;
  lastSeenAt: string;
  xp: number;
  missionsCompletedCount: number;
  interactionCount: number;
  blocked: boolean;
  lastActionLabel?: string;
}

export interface ActivityEventRecord {
  id: string;
  visitorId: string;
  nickname: string;
  avatar: CharacterId;
  eventType: ActivityEventType;
  label: string;
  detail?: string;
  xpDelta?: number;
  createdAt: string;
}

export interface AuthorizedCollaborator {
  id: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AccessPolicySummary {
  requireGroupCode: boolean;
  groupCodeHint: string;
}

