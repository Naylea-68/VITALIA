import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Calculator,
  ChefHat,
  Clock,
  FlaskConical,
  QrCode,
  Search,
  Sparkles,
  Utensils,
  X,
} from 'lucide-react';
import {
  FOOD_EXPERIMENTS,
  FOOD_GROUPS,
  FOOD_SEARCH_ITEMS,
  GLOSSARY_TERMS,
  MYTHS_REALITIES,
  NUTRIENTS_LIST,
  RECETARIO_BRAND_IMAGES,
} from '../../data/vitaliaData';
import { BiotecProject, FoodSubTab, Recipe, UserProfile } from '../../types/vitalia';
import { UniverseCharacter } from '../characters/VitaCharacters';
import { RecipeIllustration } from '../FoodIllustrations';
import { RecipeQrGrid } from '../RecipeQrGrid';
import { BiotecPanel } from './BiotecPanel';
import { SchoolProjectPanel } from './SchoolProjectPanel';

interface FoodViewProps {
  subTab: FoodSubTab;
  onChangeSubTab: (sub: FoodSubTab) => void;
  profile: UserProfile;
  recipes: Recipe[];
  biotecProjects: BiotecProject[];
  selectedRecipe: Recipe | null;
  onSelectRecipe: (recipe: Recipe | null) => void;
  onOpenQrScanner: () => void;
  onUnlockDiscovery: (discoveryId: string, xp: number) => void;
}

const LAB_INGREDIENTS = [
  { id: 'platano', label: 'Plátano' },
  { id: 'avena', label: 'Avena' },
  { id: 'naranja', label: 'Naranja' },
  { id: 'zanahoria', label: 'Zanahoria' },
  { id: 'pina', label: 'Piña' },
  { id: 'limon', label: 'Limón' },
  { id: 'fresa', label: 'Fresa' },
  { id: 'leche', label: 'Leche' },
  { id: 'pollo', label: 'Pollo' },
  { id: 'yogur', label: 'Yogur griego' },
  { id: 'pan integral', label: 'Pan integral' },
  { id: 'huevo', label: 'Huevo' },
];

export const FoodView: React.FC<FoodViewProps> = ({
  subTab,
  onChangeSubTab,
  profile,
  recipes,
  biotecProjects,
  selectedRecipe,
  onSelectRecipe,
  onOpenQrScanner,
  onUnlockDiscovery,
}) => {
  const [libraryTab, setLibraryTab] = useState<
    'alimentos' | 'nutrientes' | 'combinar' | 'mitos' | 'recetario' | 'buscador'
  >('recetario');
  const [labTab, setLabTab] = useState<'experimentos' | 'crea' | 'proyecto' | 'escanear'>('experimentos');
  const [selectedPigment, setSelectedPigment] = useState<'rojo' | 'naranja' | 'verde' | 'morado'>('naranja');

  // Combinar alimentos state (practical constraints, zero body metrics)
  const [comboMealTime, setComboMealTime] = useState<'desayuno' | 'recreo' | 'comida'>('desayuno');
  const [comboTimeAvail, setComboTimeAvail] = useState<'5min' | '20min'>('5min');
  const [comboBudget, setComboBudget] = useState<'economico' | 'flexible'>('economico');

  // Myths reveal state
  const [revealedMyths, setRevealedMyths] = useState<Record<string, boolean>>({});

  const [searchQuery, setSearchQuery] = useState('');
  const [recipeCategoryFilter, setRecipeCategoryFilter] = useState<'todas' | 'bebida' | 'snack' | 'comida'>('todas');

  // Crea tu receta ingredient picker
  const [pickedIngredients, setPickedIngredients] = useState<string[]>(['platano', 'avena']);

  useEffect(() => {
    if (!selectedRecipe) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSelectRecipe(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRecipe, onSelectRecipe]);

  const filteredRecipes = useMemo(() => {
    if (recipeCategoryFilter === 'todas') return recipes;
    return recipes.filter((r) => r.category === recipeCategoryFilter);
  }, [recipes, recipeCategoryFilter]);

  const openRecipeDetail = (recipe: Recipe) => {
    onSelectRecipe(recipe);
    if (!profile.unlockedDiscoveries.includes(recipe.id)) {
      onUnlockDiscovery(recipe.id, 15);
    }
  };

  const toggleIngredient = (id: string) => {
    setPickedIngredients((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const matchedLabRecipes = useMemo(() => {
    if (pickedIngredients.length === 0) return recipes;
    return [...recipes]
      .map((r) => {
        const matches = r.keyIngredientTags.filter((tag) => pickedIngredients.includes(tag));
        return { recipe: r, score: matches.length, matches };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((e) => e.recipe);
  }, [pickedIngredients, recipes]);

  const filteredFoodItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return FOOD_SEARCH_ITEMS;
    return FOOD_SEARCH_ITEMS.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.group.toLowerCase().includes(q) ||
        f.mainNutrients.some((n) => n.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const filteredGlossary = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return GLOSSARY_TERMS;
    return GLOSSARY_TERMS.filter(
      (g) =>
        g.term.toLowerCase().includes(q) ||
        g.definition.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const checkRecipeAllergyConflict = (recipe: Recipe) => {
    if (!profile.allergies.length) return [];
    const lowerAllergies = profile.allergies.map((a) => a.toLowerCase());
    return recipe.allergens.filter((al) =>
      lowerAllergies.some((ua) => al.toLowerCase().includes(ua) || ua.includes(al.toLowerCase()))
    );
  };

  const getComboSuggestions = () => {
    const avoidDairy = profile.allergies.some((a) => a.toLowerCase().includes('lácte'));
    if (comboMealTime === 'desayuno' && comboTimeAvail === '5min') {
      return avoidDairy
        ? [
            'Avena remojada con plátano machacado, canela y bebida vegetal fortificada',
            'Pan integral tostado con aguacate y huevo revuelto rápido',
          ]
        : [
            'Licuado Nutrí sorbo de plátano con leche y avena (4 min)',
            'Yogur natural con fruta de temporada y 2 cucharadas de avena',
          ];
    }
    if (comboMealTime === 'recreo') {
      return [
        '2 galletas Minguita feliz de avena y plátano + botella de agua simple',
        'Jugo natural Nutrí sorbo de naranja y zanahoria + fruta entera o cacahuates',
      ];
    }
    if (comboBudget === 'economico') {
      return [
        'Frijoles de la olla con arroz, tortillas de maíz y pico de gallo (jitomate, cebolla y limón)',
        'Huevo con verduras picadas + pan integral o tortilla + agua de fruta sin azúcar añadida',
      ];
    }
    return [
      'Sándwich de pollo con aderezo fit de yogur griego + verduras frescas y aguacate',
      'Plato variado de arroz integral o pasta, lentejas o pollo, ensalada fresca y fruta',
    ];
  };

  return (
    <div className="space-y-6">
      {/* Main section switcher: Biblioteca / Laboratorio / BIOTEC / Proyecto escolar */}
      <div className="print:hidden bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Alimentación, Laboratorio y Proyecto Escolar
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Biblioteca interactiva, laboratorio, biotecnología, precios escolares y carteles QR promocionales.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-slate-100 rounded-2xl shrink-0">
          <button
            type="button"
            onClick={() => onChangeSubTab('biblioteca')}
            className={`min-h-[42px] px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              subTab === 'biblioteca'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Alimentación
          </button>
          <button
            type="button"
            onClick={() => onChangeSubTab('laboratorio')}
            className={`min-h-[42px] px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              subTab === 'laboratorio'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Laboratorio
          </button>
          <button
            type="button"
            onClick={() => onChangeSubTab('biotec')}
            className={`min-h-[42px] px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              subTab === 'biotec'
                ? 'bg-cyan-700 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            BIOTEC
          </button>
          <button
            type="button"
            onClick={() => onChangeSubTab('escolar')}
            className={`min-h-[42px] px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              subTab === 'escolar'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Proyecto escolar
          </button>
        </div>
      </div>

      {/* 1. BIBLIOTECA DE ALIMENTACION */}
      {subTab === 'biblioteca' && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-1.5 p-1.5 bg-white border border-slate-200 rounded-2xl">
            {[
              { id: 'recetario', label: 'Recetario VITALIA' },
              { id: 'alimentos', label: 'A. Conoce los alimentos' },
              { id: 'nutrientes', label: 'B. Descubre los nutrientes' },
              { id: 'combinar', label: 'C. Combina alimentos' },
              { id: 'mitos', label: 'D. Mitos y realidades' },
              { id: 'buscador', label: 'Buscador y glosario' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setLibraryTab(t.id as typeof libraryTab)}
                className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  libraryTab === t.id
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {libraryTab === 'alimentos' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FOOD_GROUPS.map((group, idx) => {
                  const groupStyles = [
                    'from-emerald-50 to-white border-emerald-200',
                    'from-amber-50 to-white border-amber-200',
                    'from-rose-50 to-white border-rose-200',
                    'from-lime-50 to-white border-lime-200',
                  ][idx % 4];
                  return (
                    <div
                      key={group.id}
                      className={`bg-gradient-to-br ${groupStyles} rounded-3xl border p-6 space-y-3`}
                    >
                      <h2 className="font-display text-lg font-bold text-slate-900">{group.name}</h2>
                      <p className="text-sm text-slate-700 leading-relaxed">{group.description}</p>
                      <p className="text-xs text-slate-600">
                        <strong>Ejemplos cotidianos:</strong> {group.examples.join(' · ')}
                      </p>
                      <div className="rounded-xl bg-white/85 border border-black/5 p-3 text-xs text-slate-800">
                        <strong>Tip práctico:</strong> {group.dailyTip}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Arcoíris de Pigmentos Naturales */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900">
                    El secreto de los colores en frutas y verduras
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Toca cada color natural para descubrir qué compuestos vegetales le dan su tono y por qué combinarlos aporta mayor variedad nutricional.
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'rojo', label: 'Rojo natural', bg: 'bg-rose-500 text-white' },
                    { id: 'naranja', label: 'Naranja y amarillo', bg: 'bg-amber-400 text-slate-950' },
                    { id: 'verde', label: 'Verde intenso', bg: 'bg-emerald-600 text-white' },
                    { id: 'morado', label: 'Morado y azul', bg: 'bg-indigo-600 text-white' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedPigment(c.id as typeof selectedPigment)}
                      className={`min-h-[46px] px-4 py-2.5 rounded-2xl font-display font-bold text-xs sm:text-sm transition-transform cursor-pointer ${c.bg} ${
                        selectedPigment === c.id ? 'ring-4 ring-slate-900/15 scale-[1.02]' : 'opacity-85 hover:opacity-100'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                {(() => {
                  const pigmentDetails = {
                    rojo: {
                      title: 'Pigmentos rojos (Licopeno y antocianinas)',
                      foods: 'Fresa, jitomate, sandía, pimiento rojo',
                      detail:
                        'Aportan vitamina C y antioxidantes naturales que protegen tus células. Las fresas del licuado Nutrí sorbo son un gran ejemplo.',
                      box: 'bg-rose-50 border-rose-200 text-rose-950',
                    },
                    naranja: {
                      title: 'Pigmentos naranja y amarillo (Betacarotenos y flavonoides)',
                      foods: 'Zanahoria, naranja, piña, plátano, mango',
                      detail:
                        'Ricos en vitamina C y precursores de vitamina A que cuidan la vista y la piel, presentes en nuestros jugos Nutrí sorbo.',
                      box: 'bg-amber-50 border-amber-200 text-amber-950',
                    },
                    verde: {
                      title: 'Pigmento verde (Clorofila y folatos)',
                      foods: 'Lechuga, espinaca, aguacate, limón, calabacita',
                      detail:
                        'Contienen fibra, minerales y vitamina K. Acompañan muy bien platillos salados como el Sándwich de pollo VITALIA.',
                      box: 'bg-emerald-50 border-emerald-200 text-emerald-950',
                    },
                    morado: {
                      title: 'Pigmentos morados y azules (Antocianinas)',
                      foods: 'Cebolla morada, uvas, moras, col morada, betabel',
                      detail:
                        'Compuestos vegetales protectores que añaden sabor y textura fresca a tus comidas cotidianas.',
                      box: 'bg-indigo-50 border-indigo-200 text-indigo-950',
                    },
                  }[selectedPigment];
                  return (
                    <div className={`rounded-2xl border p-4 space-y-1.5 ${pigmentDetails.box}`}>
                      <p className="font-display font-bold text-base">{pigmentDetails.title}</p>
                      <p className="text-xs font-semibold">Ejemplos: {pigmentDetails.foods}</p>
                      <p className="text-sm leading-relaxed">{pigmentDetails.detail}</p>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {libraryTab === 'nutrientes' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-sky-600 to-cyan-700 text-white rounded-3xl p-5 flex items-center gap-4">
                <div className="bg-white/15 rounded-2xl p-1.5 shrink-0">
                  <UniverseCharacter character="nutri" size={64} />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-white">
                    Guía de nutrientes con NUTRI
                  </h2>
                  <p className="text-sm text-sky-50">
                    Conoce qué hace cada nutriente en tu cuerpo y en qué alimentos cotidianos lo encuentras.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {NUTRIENTS_LIST.map((nut, idx) => {
                  const nutThemes = [
                    { card: 'border-amber-200 bg-gradient-to-br from-amber-50/70 to-white', title: 'text-amber-900', box: 'bg-amber-100/70 text-amber-950' },
                    { card: 'border-rose-200 bg-gradient-to-br from-rose-50/70 to-white', title: 'text-rose-900', box: 'bg-rose-100/70 text-rose-950' },
                    { card: 'border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-white', title: 'text-emerald-900', box: 'bg-emerald-100/70 text-emerald-950' },
                    { card: 'border-orange-200 bg-gradient-to-br from-orange-50/70 to-white', title: 'text-orange-900', box: 'bg-orange-100/70 text-orange-950' },
                    { card: 'border-sky-200 bg-gradient-to-br from-sky-50/70 to-white', title: 'text-sky-900', box: 'bg-sky-100/70 text-sky-950' },
                    { card: 'border-lime-200 bg-gradient-to-br from-lime-50/70 to-white', title: 'text-lime-900', box: 'bg-lime-100/70 text-lime-950' },
                    { card: 'border-cyan-200 bg-gradient-to-br from-cyan-50/70 to-white', title: 'text-cyan-900', box: 'bg-cyan-100/70 text-cyan-950' },
                  ][idx % 7];
                  return (
                    <div key={nut.id} className={`rounded-3xl border p-6 space-y-2.5 ${nutThemes.card}`}>
                      <h3 className={`font-display text-lg font-bold ${nutThemes.title}`}>{nut.name}</h3>
                      <p className="text-sm text-slate-700 leading-relaxed">{nut.role}</p>
                      <p className="text-xs text-slate-600">
                        <strong>En tu día a día:</strong> {nut.everydayExample}
                      </p>
                      <p className="text-xs text-slate-500">
                        <strong>Fuentes accesibles:</strong> {nut.foodSources.join(' · ')}
                      </p>
                      <div className={`rounded-xl p-3 text-xs ${nutThemes.box}`}>
                        {nut.funFact}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {libraryTab === 'combinar' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900">
                  Aprende a combinar alimentos según tu realidad
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Elige tu momento del día, tiempo disponible y presupuesto. VITALIA respeta tus gustos y alergias sin contar calorías ni calcular dietas restrictivas.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="block text-xs font-semibold text-slate-700 mb-2">Momento</span>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
                    {[
                      { id: 'desayuno', label: 'Desayuno' },
                      { id: 'recreo', label: 'Recreo' },
                      { id: 'comida', label: 'Comida' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setComboMealTime(m.id as typeof comboMealTime)}
                        className={`min-h-[38px] rounded-lg text-xs font-semibold cursor-pointer ${
                          comboMealTime === m.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-700 mb-2">Tiempo disponible</span>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setComboTimeAvail('5min')}
                      className={`min-h-[38px] rounded-lg text-xs font-semibold cursor-pointer ${
                        comboTimeAvail === '5min' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      5 minutos
                    </button>
                    <button
                      type="button"
                      onClick={() => setComboTimeAvail('20min')}
                      className={`min-h-[38px] rounded-lg text-xs font-semibold cursor-pointer ${
                        comboTimeAvail === '20min' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      15–20 min
                    </button>
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-700 mb-2">Presupuesto</span>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setComboBudget('economico')}
                      className={`min-h-[38px] rounded-lg text-xs font-semibold cursor-pointer ${
                        comboBudget === 'economico' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Económico
                    </button>
                    <button
                      type="button"
                      onClick={() => setComboBudget('flexible')}
                      className={`min-h-[38px] rounded-lg text-xs font-semibold cursor-pointer ${
                        comboBudget === 'flexible' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Flexible
                    </button>
                  </div>
                </div>
              </div>

              {profile.allergies.length > 0 && (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  Tomando en cuenta tus preferencias/alergias configuradas: <strong>{profile.allergies.join(', ')}</strong>.
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {getComboSuggestions().map((idea) => (
                  <div key={idea} className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-950 font-medium">
                    {idea}
                  </div>
                ))}
              </div>
            </div>
          )}

          {libraryTab === 'mitos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MYTHS_REALITIES.map((item) => {
                const open = !!revealedMyths[item.id];
                return (
                  <div key={item.id} className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-semibold text-amber-700 mb-1">Mito cotidiano</p>
                      <h3 className="font-display text-lg font-bold text-slate-900 mb-3">
                        {item.myth}
                      </h3>
                      {open && (
                        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 space-y-1.5 mb-4">
                          <p className="font-display font-bold text-sm text-emerald-900">
                            {item.reality}
                          </p>
                          <p className="text-sm text-emerald-950 leading-relaxed">{item.explanation}</p>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setRevealedMyths((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                      }
                      className="min-h-[42px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-semibold cursor-pointer self-start"
                    >
                      {open ? 'Ocultar explicación' : 'Descubrir la realidad'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {libraryTab === 'recetario' && (
            <div className="space-y-5">
              {/* Encabezado ilustrado del Recetario VITALIA con las 4 imágenes del proyecto */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                    <Utensils className="w-4 h-4" />
                    <span>Recetario VITALIA · Colección escolar</span>
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                    Recetas ilustradas del proyecto
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
                    Explora las líneas saludables del equipo escolar: Pura Vida, Miguita Feliz, Nutri-Sorbo y Pío-Fit.
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-2.5 sm:gap-3 shrink-0">
                  {[
                    { label: 'Pura Vida', src: RECETARIO_BRAND_IMAGES.puraVida },
                    { label: 'Miguita Feliz', src: RECETARIO_BRAND_IMAGES.miguitaFeliz },
                    { label: 'Nutri-Sorbo', src: RECETARIO_BRAND_IMAGES.nutriSorbo },
                    { label: 'Pío-Fit', src: RECETARIO_BRAND_IMAGES.pioFit },
                  ].map((stamp) => (
                    <div
                      key={stamp.label}
                      className="flex flex-col items-center gap-1.5 bg-[#F6FAF7] border border-emerald-100 rounded-2xl p-2"
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white border border-slate-200/80 p-1 flex items-center justify-center overflow-hidden">
                        <img
                          src={stamp.src}
                          alt={stamp.label}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 text-center leading-tight">
                        {stamp.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Filter Bar + Link to School Economics */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl">
                  {[
                    { id: 'todas', label: `Todas (${recipes.length})` },
                    { id: 'bebida', label: 'Bebidas' },
                    { id: 'snack', label: 'Snacks' },
                    { id: 'comida', label: 'Comidas' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setRecipeCategoryFilter(cat.id as typeof recipeCategoryFilter)}
                      className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        recipeCategoryFilter === cat.id
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => onChangeSubTab('escolar')}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Ver costos y carteles QR escolares</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRecipes.map((rec) => {
                  const conflicts = checkRecipeAllergyConflict(rec);
                  const headerBg: Record<string, string> = {
                    amber: 'from-amber-100/80 via-yellow-50 to-white',
                    orange: 'from-orange-100/80 via-amber-50 to-white',
                    yellow: 'from-yellow-100/80 via-lime-50 to-white',
                    rose: 'from-rose-100/80 via-pink-50 to-white',
                    emerald: 'from-emerald-100/80 via-teal-50 to-white',
                  };
                  return (
                    <article
                      key={rec.id}
                      className={`bg-gradient-to-b ${headerBg[rec.accentColor] || headerBg.emerald} rounded-3xl border border-slate-200 p-5 flex flex-col justify-between hover:border-emerald-400 transition-colors`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="text-xs text-slate-600 flex flex-wrap items-center gap-1.5">
                            <span className="font-semibold text-emerald-800">
                              {rec.brandLine || 'Recetario VITALIA'}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{rec.prepTime}</span>
                            <span aria-hidden="true">·</span>
                            <span>{rec.costLevel}</span>
                          </div>
                          <RecipeIllustration
                            recipeId={rec.id}
                            imageUrl={rec.imageUrl}
                            alt={`Ilustración de ${rec.name}`}
                            size={72}
                          />
                        </div>
                        <h3 className="font-display text-lg font-bold text-slate-900 mb-2">
                          {rec.name}
                        </h3>
                        <p className="text-xs text-slate-700 leading-relaxed mb-3">
                          {rec.nutrientsInfo}
                        </p>
                        {rec.economics?.suggestedPrice !== undefined && (
                          <p className="text-xs font-mono-num text-amber-950 bg-amber-50/90 border border-amber-200 rounded-xl px-2.5 py-1.5 mb-3 flex items-center justify-between gap-2">
                            <span>
                              Precio escolar:{' '}
                              <strong className="text-emerald-800">
                                ${rec.economics.suggestedPrice.toFixed(2)}
                              </strong>
                            </span>
                            <span className="text-slate-600 font-medium">
                              {rec.economics.portionLabel}
                            </span>
                          </p>
                        )}
                        {conflicts.length > 0 && (
                          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2 mb-3 flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>Contiene: {conflicts.join(', ')}. Consulta sustituciones dentro.</span>
                          </p>
                        )}
                      </div>
                      <div className="pt-3 border-t border-black/5 flex items-center justify-between gap-2">
                        <span className="text-xs font-mono-num text-slate-600">{rec.qrCode}</span>
                        <button
                          type="button"
                          onClick={() => openRecipeDetail(rec)}
                          className="min-h-[40px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold cursor-pointer"
                        >
                          Ver receta
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {libraryTab === 'buscador' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-5">
                <label htmlFor="food-search" className="block text-sm font-bold text-slate-900 mb-2">
                  Buscador inteligente de alimentos y Glosario VITALIA
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="food-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Busca plátano, avena, fibra, bioplástico, proteína..."
                    className="w-full min-h-[44px] pl-10 pr-10 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Limpiar búsqueda"
                      className="w-8 h-8 rounded-lg hover:bg-slate-200/70 flex items-center justify-center text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 mb-3">
                  Fichas de alimentos ({filteredFoodItems.length})
                </h3>
                {filteredFoodItems.length === 0 ? (
                  <p className="text-sm text-slate-500 bg-white rounded-2xl border border-slate-200 p-4">
                    No encontramos alimentos que coincidan con "{searchQuery}". Prueba buscando otra palabra o limpia el filtro.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredFoodItems.map((item) => (
                      <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
                        <div className="text-xs text-emerald-700 font-medium">{item.group}</div>
                        <h4 className="font-display text-lg font-bold text-slate-900">{item.name}</h4>
                        <p className="text-xs text-slate-600">
                          <strong>Nutrientes destacados:</strong> {item.mainNutrients.join(' · ')}
                        </p>
                        <p className="text-sm text-slate-700">{item.characteristics}</p>
                        <p className="text-xs text-slate-600">
                          <strong>Ideas de preparación:</strong> {item.prepIdeas.join(', ')}
                        </p>
                        <p className="text-xs text-teal-800 bg-teal-50 rounded-xl p-2.5">
                          <strong>Aprovechamiento BIOTEC:</strong> {item.residueIdea}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-700" />
                  <span>Glosario VITALIA ({filteredGlossary.length})</span>
                </h3>
                {filteredGlossary.length === 0 ? (
                  <p className="text-sm text-slate-500 bg-white rounded-2xl border border-slate-200 p-4">
                    No hay términos en el glosario para "{searchQuery}".
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredGlossary.map((g) => (
                      <div key={g.id} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1.5">
                        <div className="text-xs text-slate-500">{g.category}</div>
                        <h4 className="font-display font-bold text-base text-slate-900">{g.term}</h4>
                        <p className="text-sm text-slate-700 leading-relaxed">{g.definition}</p>
                        <p className="text-xs text-emerald-800">Ejemplo: {g.example}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. LABORATORIO DE ALIMENTOS VITALIA */}
      {subTab === 'laboratorio' && (
        <div className="space-y-6">
          {/* Lab Banner: green, yellow, white modern lab */}
          <section className="rounded-3xl bg-gradient-to-br from-emerald-50 via-yellow-50 to-white border border-emerald-200 p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-9 space-y-2.5">
                <div className="text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-amber-600" />
                  <span>Laboratorio de alimentos VITALIA</span>
                  <span aria-hidden="true">·</span>
                  <span>Ciencia cotidiana en la cocina</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Experimenta, combina ingredientes y descubre prototipos reales
                </h2>
                <p className="text-sm sm:text-base text-slate-700 max-w-2xl leading-relaxed">
                  Conecta lo que ocurre en la cocina con la ciencia y los alimentos desarrollados por el equipo VITALIA.
                </p>
              </div>
              <div className="lg:col-span-3 flex justify-center">
                <UniverseCharacter character="chefia" size={110} />
              </div>
            </div>
          </section>

          <div className="flex flex-wrap gap-1.5 p-1.5 bg-white border border-slate-200 rounded-2xl">
            {[
              { id: 'experimentos', label: 'A. Experimentos' },
              { id: 'crea', label: 'B. Crea tu receta' },
              { id: 'proyecto', label: 'C. Recetas del proyecto' },
              { id: 'escanear', label: 'D. Escanea y descubre (QR)' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setLabTab(t.id as typeof labTab)}
                className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  labTab === t.id
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {labTab === 'experimentos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FOOD_EXPERIMENTS.map((exp) => (
                <article key={exp.id} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
                  <h3 className="font-display text-lg font-bold text-slate-900">{exp.title}</h3>
                  <p className="text-xs font-semibold text-amber-800">{exp.question}</p>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">Materiales:</p>
                    <p className="text-xs sm:text-sm text-slate-700">{exp.materials.join(' · ')}</p>
                  </div>
                  <ol className="list-decimal pl-5 text-sm text-slate-700 space-y-1">
                    {exp.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-3.5 text-xs sm:text-sm text-emerald-950">
                    <strong>Explicación científica:</strong> {exp.scienceExplanation}
                  </div>
                </article>
              ))}
            </div>
          )}

          {labTab === 'crea' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5">
              <div>
                <h3 className="font-display text-xl font-bold text-slate-900 mb-1">
                  Selecciona ingredientes que tienes disponibles
                </h3>
                <p className="text-sm text-slate-600">
                  CHEFIA buscará preparaciones del Laboratorio que aprovechen lo que marcaste.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {LAB_INGREDIENTS.map((ing) => {
                  const active = pickedIngredients.includes(ing.id);
                  return (
                    <button
                      key={ing.id}
                      type="button"
                      onClick={() => toggleIngredient(ing.id)}
                      className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-colors cursor-pointer ${
                        active
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {ing.label}
                    </button>
                  );
                })}
              </div>

              {pickedIngredients.includes('huevo') && pickedIngredients.includes('platano') && (
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-950">
                  <strong>Idea rápida con huevo + plátano:</strong> Puedes machacar 1 plátano maduro con 1 huevo y 2 cdas de avena para preparar hot cakes rápidos en sartén en menos de 10 minutos.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchedLabRecipes.map((rec) => (
                  <div key={rec.id} className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <RecipeIllustration
                        recipeId={rec.id}
                        imageUrl={rec.imageUrl}
                        alt={rec.name}
                        size={52}
                      />
                      <div className="min-w-0">
                        <p className="font-display font-bold text-base text-slate-900 truncate">{rec.name}</p>
                        <p className="text-xs text-slate-500">
                          {rec.brandLine || 'VITALIA'} · {rec.prepTime}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openRecipeDetail(rec)}
                      className="min-h-[40px] px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shrink-0 cursor-pointer"
                    >
                      Abrir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {labTab === 'proyecto' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {recipes
                .filter((r) => r.isProjectRecipe)
                .map((rec) => (
                  <article key={rec.id} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="font-semibold text-emerald-700">{rec.brandLine}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono-num">{rec.qrCode}</span>
                        </div>
                        <h3 className="font-display text-lg font-bold text-slate-900">{rec.name}</h3>
                      </div>
                      <RecipeIllustration
                        recipeId={rec.id}
                        imageUrl={rec.imageUrl}
                        alt={`Ilustración de ${rec.name}`}
                        size={64}
                      />
                    </div>
                    {rec.projectWhy && (
                      <p className="text-sm text-slate-700 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                        <strong>¿Por qué se seleccionó para VITALIA?</strong> {rec.projectWhy}
                      </p>
                    )}
                    <p className="text-xs text-slate-600">{rec.nutrientsInfo}</p>
                    <button
                      type="button"
                      onClick={() => openRecipeDetail(rec)}
                      className="min-h-[42px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold cursor-pointer"
                    >
                      Consultar ficha completa
                    </button>
                  </article>
                ))}
            </div>
          )}

          {labTab === 'escanear' && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900">
                      Códigos QR listos para escanear
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Escanea cualquier código con la cámara de tu celular para abrir su receta en VITALIA.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onChangeSubTab('escolar')}
                    className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 font-display font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Carteles QR con logos</span>
                  </button>
                  <button
                    type="button"
                    onClick={onOpenQrScanner}
                    className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Escanear con cámara</span>
                  </button>
                </div>
              </div>

              <RecipeQrGrid recipes={recipes} onSelectRecipe={openRecipeDetail} />
            </div>
          )}
        </div>
      )}

      {/* 3. BIOTEC VITALIA */}
      {subTab === 'biotec' && (
        <BiotecPanel
          projects={biotecProjects}
          onUnlockDiscovery={onUnlockDiscovery}
          unlockedDiscoveries={profile.unlockedDiscoveries}
        />
      )}

      {/* 4. PROYECTO ESCOLAR (ECONOMÍA Y CARTELES QR CON LOGOS) */}
      {subTab === 'escolar' && (
        <SchoolProjectPanel recipes={recipes} onSelectRecipe={openRecipeDetail} />
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div
          className="print:hidden fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={selectedRecipe.name}
          onClick={(e) => {
            if (e.target === e.currentTarget) onSelectRecipe(null);
          }}
        >
          <div className="bg-white w-full sm:max-w-2xl max-h-[92dvh] rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <RecipeIllustration
                  recipeId={selectedRecipe.id}
                  imageUrl={selectedRecipe.imageUrl}
                  alt={`Ilustración de ${selectedRecipe.name}`}
                  size={56}
                />
                <div className="min-w-0">
                  <p className="text-xs text-emerald-700 font-semibold truncate">
                    {selectedRecipe.brandLine || 'Recetario VITALIA'} · {selectedRecipe.qrCode}
                  </p>
                  <h2 className="font-display font-bold text-lg sm:text-xl text-slate-900">
                    {selectedRecipe.name}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectRecipe(null)}
                aria-label="Cerrar receta"
                className="min-w-[44px] min-h-[44px] rounded-xl hover:bg-slate-100 flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-5 h-5 text-slate-700" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl bg-[#F6FAF7] border border-emerald-100 p-4">
                <RecipeIllustration
                  recipeId={selectedRecipe.id}
                  imageUrl={selectedRecipe.imageUrl}
                  alt={`Sello ilustrado de ${selectedRecipe.name}`}
                  size={104}
                />
                <div className="flex flex-wrap gap-3 text-xs text-slate-700 justify-center sm:justify-start">
                  <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    Tiempo: {selectedRecipe.prepTime}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                    <ChefHat className="w-4 h-4 text-amber-600" />
                    Dificultad: {selectedRecipe.difficulty}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                    <Utensils className="w-4 h-4 text-sky-600" />
                    Costo: {selectedRecipe.costLevel}
                  </span>
                </div>
              </div>

              {selectedRecipe.projectWhy && (
                <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-4 text-sm text-amber-950">
                  <strong>Por qué forma parte del proyecto:</strong> {selectedRecipe.projectWhy}
                </div>
              )}

              <div>
                <h3 className="font-display font-bold text-base text-slate-900 mb-2">Ingredientes</h3>
                <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                  {selectedRecipe.ingredients.map((ing) => (
                    <li key={ing}>{ing}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-display font-bold text-base text-slate-900 mb-2">
                  Preparación paso a paso
                </h3>
                <ol className="list-decimal pl-5 text-sm text-slate-700 space-y-1.5">
                  {selectedRecipe.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>

              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 space-y-1.5">
                <h4 className="font-display font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>Nutrientes presentes</span>
                </h4>
                <p className="text-sm text-emerald-950 leading-relaxed">{selectedRecipe.nutrientsInfo}</p>
              </div>

              {selectedRecipe.economics?.suggestedPrice !== undefined && (
                <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-4 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-display font-bold text-sm text-amber-950 flex items-center gap-1.5">
                      <Calculator className="w-4 h-4 text-amber-700" />
                      <span>
                        Menú escolar VITALIA ({selectedRecipe.economics.portionLabel})
                      </span>
                    </h4>
                    {selectedRecipe.economics.isEstimate && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        Precio de referencia
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-white rounded-xl p-2.5 border border-amber-200">
                      <p className="text-[11px] text-slate-500">Precio al público</p>
                      <p className="font-mono-num font-bold text-base text-emerald-800">
                        ${selectedRecipe.economics.suggestedPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-2.5 border border-amber-200">
                      <p className="text-[11px] text-slate-500">Presentación</p>
                      <p className="font-display font-bold text-sm text-slate-900">
                        {selectedRecipe.economics.portionLabel}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedRecipe.substitutions.length > 0 && (
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-1.5">
                  <h4 className="font-display font-bold text-sm text-slate-900">
                    Posibles sustituciones
                  </h4>
                  <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-700 space-y-1">
                    {selectedRecipe.substitutions.map((sub) => (
                      <li key={sub}>{sub}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
