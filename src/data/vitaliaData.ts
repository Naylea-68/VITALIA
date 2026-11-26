import {
  Badge,
  BiotecProject,
  EcologicalChallenge,
  FoodExperiment,
  FoodGroupData,
  FoodSearchItem,
  GlossaryTerm,
  Mission,
  MovementActivity,
  MythRealityItem,
  NutrientCardData,
  Recipe,
  VitaStageId,
} from '../types/vitalia';

export const VITA_STAGES: {
  id: VitaStageId;
  name: string;
  minXp: number;
  maxXp: number;
  description: string;
}[] = [
  {
    id: 'semilla',
    name: 'Semilla',
    minXp: 0,
    maxXp: 149,
    description:
      'El inicio de la aventura. Representa la curiosidad, tus primeras preguntas y el gusto por descubrir.',
  },
  {
    id: 'brote',
    name: 'Brote',
    minXp: 150,
    maxXp: 349,
    description:
      'Aparece cuando comienzas a explorar los alimentos, el movimiento y el cuidado cotidiano.',
  },
  {
    id: 'explorador',
    name: 'Explorador',
    minXp: 350,
    maxXp: 649,
    description:
      'Representa el conocimiento adquirido y tu capacidad para resolver misiones y decisiones diarias.',
  },
  {
    id: 'guardian',
    name: 'Guardián de VITALIA',
    minXp: 650,
    maxXp: 99999,
    description:
      'La etapa más avanzada: comprendes mejor los alimentos, el autocuidado y cómo aprovechar residuos para cuidar el planeta.',
  },
];

export function getVitaStage(xp: number) {
  for (let i = VITA_STAGES.length - 1; i >= 0; i--) {
    if (xp >= VITA_STAGES[i].minXp) {
      return VITA_STAGES[i];
    }
  }
  return VITA_STAGES[0];
}

export function getUserLevel(xp: number): { level: number; currentLevelXp: number; nextLevelXp: number } {
  const levelSize = 100;
  const level = Math.floor(xp / levelSize) + 1;
  const currentLevelXp = xp % levelSize;
  return { level, currentLevelXp, nextLevelXp: levelSize };
}

export const WORLDS = [
  {
    id: 1,
    title: 'Mundo 1: El misterio de los alimentos',
    zoneName: 'El Jardín de los Descubrimientos',
    description:
      'Conoce a VITA y descubre los grupos de alimentos, sus características y por qué la variedad es clave.',
    accent: 'emerald',
    character: 'vita' as const,
  },
  {
    id: 2,
    title: 'Mundo 2: Los poderes de los nutrientes',
    zoneName: 'El Valle de los Nutrientes',
    description:
      'Explora qué hacen los carbohidratos, proteínas, grasas, vitaminas, minerales, fibra y agua en tu cuerpo.',
    accent: 'amber',
    character: 'nutri' as const,
  },
  {
    id: 3,
    title: 'Mundo 3: Decisiones de la vida diaria',
    zoneName: 'La Ciudad de las Decisiones',
    description:
      'Resuelve situaciones reales de secundaria: poco tiempo por la mañana, presupuesto y opciones para el recreo.',
    accent: 'sky',
    character: 'chefia' as const,
  },
  {
    id: 4,
    title: 'Mundo 4: Exploradores del bienestar',
    zoneName: 'El Santuario del Bienestar',
    description:
      'Conecta la alimentación con el descanso, el movimiento disfrutable y el cuidado de tus emociones.',
    accent: 'indigo',
    character: 'lumi' as const,
  },
  {
    id: 5,
    title: 'Mundo 5: Guardianes del planeta',
    zoneName: 'El Laboratorio de la Innovación',
    description:
      'Investiga qué ocurre con las cáscaras y residuos orgánicos y cómo la ciencia busca darles nueva vida.',
    accent: 'teal',
    character: 'eco' as const,
  },
];

export const INITIAL_MISSIONS: Mission[] = [
  // MUNDO 1
  {
    id: 'm1-1',
    worldId: 1,
    worldTitle: 'Mundo 1: El misterio de los alimentos',
    zoneName: 'El Jardín de los Descubrimientos',
    title: 'El desayuno misterioso',
    summary: 'Descubre qué grupos de alimentos faltan en una mesa matutina.',
    narrativeIntro:
      'Son las 7:00 a. m. en el Jardín de los Descubrimientos. VITA encontró una charola con pan tostado y agua, pero nota que falta variedad para tener energía estable en clase.',
    character: 'vita',
    xpReward: 40,
    type: 'choice',
    question: '¿Qué combinación agrega variedad de grupos de alimentos de forma práctica y accesible?',
    options: [
      {
        id: 'a',
        label: 'Agregar otro pan dulce igual al primero',
        feedback:
          'Aporta energía rápida, pero repite el mismo grupo (cereales/azúcares) y no suma proteína ni fruta.',
        pros: 'Es rápido de conseguir.',
        limits: 'Poca variedad de nutrientes para mantener la saciedad.',
      },
      {
        id: 'b',
        label: 'Sumar huevo o frijoles y una pieza de fruta de temporada',
        feedback:
          '¡Excelente descubrimiento! Combinaste cereales (pan), proteína (huevo o frijol) y vitaminas/fibra (fruta).',
        isBest: true,
        pros: 'Equilibrio entre energía, saciedad y micronutrientes.',
        limits: 'Requiere unos minutos extra de preparación.',
      },
      {
        id: 'c',
        label: 'Solo tomar una bebida energética en lugar de comer',
        feedback:
          'Las bebidas con cafeína o exceso de azúcar no reemplazan los nutrientes de un desayuno variado.',
        pros: 'No requiere preparación.',
        limits: 'Puede provocar bajón de energía a media mañana.',
      },
    ],
    educationalTakeaway:
      'Un desayuno variado no necesita ser costoso ni complicado: combinar un cereal, una fuente de proteína y una fruta o verdura ayuda a sostener tu energía en la escuela.',
  },
  {
    id: 'm1-2',
    worldId: 1,
    worldTitle: 'Mundo 1: El misterio de los alimentos',
    zoneName: 'El Jardín de los Descubrimientos',
    title: '¿Qué contiene este alimento?',
    summary: 'Distingue alimentos naturales de ultraprocesados.',
    narrativeIntro:
      'VITA sacó su lupa para observar dos opciones de refrigerio: un plátano con avena y una botana empaquetada con 12 ingredientes desconocidos.',
    character: 'vita',
    xpReward: 40,
    type: 'quiz',
    question: '¿Cuál es una pista clara para identificar un alimento mínimamente procesado frente a un ultraprocesado?',
    options: [
      {
        id: 'a',
        label: 'Su color es muy brillante aunque no tenga fruta real',
        feedback: 'Los colores artificiales intensos suelen indicar aditivos propios de ultraprocesados.',
      },
      {
        id: 'b',
        label: 'Tiene pocos ingredientes reconocibles que tendrías en tu cocina',
        feedback:
          '¡Exacto! Cuando lees ingredientes familiares (avena, plátano, canela), estás frente a una preparación natural o mínimamente procesada.',
        isBest: true,
      },
      {
        id: 'c',
        label: 'Trae una etiqueta que dice "fitness" en letras grandes',
        feedback: 'Las palabras llamativas en el frente del empaque son publicidad; la lista de ingredientes revela la verdad.',
      },
    ],
    educationalTakeaway:
      'No se trata de prohibir empaques, sino de aprender a leer qué contienen para tomar decisiones informadas.',
  },
  {
    id: 'm1-3',
    worldId: 1,
    worldTitle: 'Mundo 1: El misterio de los alimentos',
    zoneName: 'El Jardín de los Descubrimientos',
    title: 'El secreto de las frutas y verduras',
    summary: 'Comprende por qué los colores naturales aportan diversidad.',
    narrativeIntro:
      'En el invernadero del jardín, VITA te muestra jitomates rojos, zanahorias naranjas y espinacas verdes.',
    character: 'vita',
    xpReward: 40,
    type: 'quiz',
    question: '¿Por qué es útil variar los colores de frutas y verduras durante la semana?',
    options: [
      {
        id: 'a',
        label: 'Porque cada pigmento natural suele asociarse con distintas vitaminas y antioxidantes',
        feedback:
          '¡Correcto! Por ejemplo, el naranja de la zanahoria aporta betacarotenos y el verde de la espinaca aporta folatos y minerales.',
        isBest: true,
      },
      {
        id: 'b',
        label: 'Porque los colores aumentan mágicamente la inteligencia en 5 minutos',
        feedback:
          'Los colores nos ayudan a variar nutrientes de forma visual, pero no cambian la inteligencia ni el estado de ánimo por arte de magia.',
      },
      {
        id: 'c',
        label: 'Solo para que la foto del plato se vea bonita',
        feedback: 'Aunque se ve genial, el beneficio real está en la variedad de compuestos protectores de cada planta.',
      },
    ],
    educationalTakeaway:
      'Variar frutas y verduras según lo que esté de temporada y disponible en tu localidad amplía los nutrientes que recibe tu cuerpo.',
  },
  {
    id: 'm1-4',
    worldId: 1,
    worldTitle: 'Mundo 1: El misterio de los alimentos',
    zoneName: 'El Jardín de los Descubrimientos',
    title: 'Detectives de etiquetas',
    summary: 'Aprende el orden real de la lista de ingredientes.',
    narrativeIntro:
      'Un jugo comercial presume en la portada "Con fruta natural", pero VITA te invita a girar la caja y leer la letra pequeña.',
    character: 'vita',
    xpReward: 45,
    type: 'quiz',
    question: 'En una etiqueta nutricional, ¿cómo se ordenan los ingredientes?',
    options: [
      {
        id: 'a',
        label: 'En orden alfabético',
        feedback: 'No, el orden sigue la cantidad presente en el producto.',
      },
      {
        id: 'b',
        label: 'De mayor a menor cantidad según su peso',
        feedback:
          '¡Bien visto, detective! Si el primer ingrediente es agua y el segundo es azúcar o jarabe, la fruta está en menor proporción.',
        isBest: true,
      },
      {
        id: 'c',
        label: 'Primero los ingredientes más saludables aunque tengan muy poquito',
        feedback: 'La ley exige listar primero lo que más contiene el alimento.',
      },
    ],
    educationalTakeaway:
      'Leer los primeros tres ingredientes de cualquier producto te toma 5 segundos y te da información mucho más clara que la portada.',
  },
  {
    id: 'm1-5',
    worldId: 1,
    worldTitle: 'Mundo 1: El misterio de los alimentos',
    zoneName: 'El Jardín de los Descubrimientos',
    title: 'La misión del plato variado',
    summary: 'Arma una comida cotidiana equilibrada con alimentos accesibles.',
    narrativeIntro:
      'Es hora de armar una comida completa para la tarde después de clases usando ingredientes comunes de casa.',
    character: 'chefia',
    xpReward: 50,
    type: 'choice',
    question: 'Elige la opción que mejor integra verduras, proteína y cereales:',
    options: [
      {
        id: 'a',
        label: 'Arroz con pollo o lentejas + ensalada fresca de lechuga, jitomate y aguacate',
        feedback:
          '¡Misión cumplida! Tiene energía de cereales (arroz), proteína (pollo o lentejas), fibra/vitaminas (ensalada) y grasa saludable (aguacate).',
        isBest: true,
      },
      {
        id: 'b',
        label: 'Únicamente un tazón grande de pasta con mantequilla',
        feedback:
          'Es rico y aporta energía, pero podrías enriquecerlo fácilmente agregando verduras picadas y queso, pollo o frijoles.',
      },
      {
        id: 'c',
        label: 'Papas fritas con refresco',
        feedback:
          'Pueden disfrutarse ocasionalmente, pero como comida principal dejan fuera fibra, proteínas y agua.',
      },
    ],
    educationalTakeaway:
      'No existe un único "plato perfecto": puedes adaptar la variedad a tus gustos, presupuesto y cultura alimentaria.',
  },
  {
    id: 'm1-6',
    worldId: 1,
    worldTitle: 'Mundo 1: El misterio de los alimentos',
    zoneName: 'El Jardín de los Descubrimientos',
    title: 'Tesoros locales y de temporada',
    summary: 'Descubre por qué elegir alimentos regionales mejora el sabor, la economía y el cuidado ambiental.',
    narrativeIntro:
      'VITA recorre un mercado escolar lleno de mangos, naranjas, plátanos y calabacitas recién cosechadas en la región.',
    character: 'vita',
    xpReward: 45,
    type: 'choice',
    question: '¿Qué ventaja tiene elegir frutas y verduras de temporada en tu localidad?',
    options: [
      {
        id: 'a',
        label: 'Suelen ser más frescas, conservar mejor sus vitaminas, costar menos y requerir menos transporte',
        feedback:
          '¡Exacto! Cuando un alimento está en temporada crece de forma natural en tu región, llega más fresco a tu mesa y apoya a productores locales.',
        isBest: true,
        pros: 'Mejor sabor, precio accesible y menor huella de transporte.',
        limits: 'Algunas frutas cambian según la época del año, lo cual invita a variar el menú.',
      },
      {
        id: 'b',
        label: 'Solo son útiles si vienen envueltas en tres capas de plástico importado',
        feedback: 'El exceso de empaque y transporte largo suele encarecer el producto y generar más residuos.',
      },
      {
        id: 'c',
        label: 'Tienen exactamente cero nutrientes fuera de verano',
        feedback: 'En cada estación del año existen frutas y verduras nutritivas disponibles.',
      },
    ],
    educationalTakeaway:
      'Preguntar qué fruta está de temporada en el mercado te ayuda a comer más variado, fresco y económico todo el año.',
  },
  {
    id: 'm1-7',
    worldId: 1,
    worldTitle: 'Mundo 1: El misterio de los alimentos',
    zoneName: 'El Jardín de los Descubrimientos',
    title: 'Hidratación inteligente todos los días',
    summary: 'Compara el agua simple y las bebidas naturales frente a las bebidas con exceso de azúcar.',
    narrativeIntro:
      'Después de la clase de educación física, VITA observa varias botellas sobre la banca del patio.',
    character: 'nutri',
    xpReward: 45,
    type: 'quiz',
    question: '¿Cuál es la mejor opción principal para hidratarte durante la jornada escolar?',
    options: [
      {
        id: 'a',
        label: 'Agua simple como bebida principal, complementada ocasionalmente con aguas o licuados naturales sin azúcar añadida',
        feedback:
          '¡Muy bien! El agua simple hidrata al 100 % sin azúcares añadidos, y opciones como los jugos naturales Nutrí sorbo suman vitaminas cuando quieres variar.',
        isBest: true,
      },
      {
        id: 'b',
        label: 'Tomar refresco en cada comida y descanso porque también contiene agua',
        feedback: 'Aunque los refrescos tienen agua, aportan mucha azúcar añadida que no ayuda a calmar la sed real.',
      },
      {
        id: 'c',
        label: 'Esperar hasta el final del día para tomar un solo vaso de agua',
        feedback: 'Hidratarte en pequeños sorbos durante el día mantiene tu atención y energía más estables.',
      },
    ],
    educationalTakeaway:
      'Llevar tu botella rellenable con agua simple es uno de los hábitos escolares más sencillos y efectivos.',
  },

  // MUNDO 2
  {
    id: 'm2-1',
    worldId: 2,
    worldTitle: 'Mundo 2: Los poderes de los nutrientes',
    zoneName: 'El Valle de los Nutrientes',
    title: 'El equipo de los nutrientes',
    summary: 'Descubre qué diferencia a los macronutrientes de los micronutrientes.',
    narrativeIntro:
      'NUTRI te da la bienvenida al Valle de los Nutrientes. Cada nutriente trabaja en equipo para que puedas estudiar, moverte y crecer.',
    character: 'nutri',
    xpReward: 40,
    type: 'quiz',
    question: '¿Qué grupo incluye a los nutrientes que necesitamos en mayor cantidad diaria para obtener energía y construir tejidos?',
    options: [
      {
        id: 'a',
        label: 'Carbohidratos, proteínas y grasas',
        feedback:
          '¡Exacto! Se llaman macronutrientes porque el cuerpo los usa en cantidades mayores cada día.',
        isBest: true,
      },
      {
        id: 'b',
        label: 'Únicamente vitaminas y minerales',
        feedback: 'Las vitaminas y minerales son micronutrientes: esenciales en pequeñas dosis, pero no dan energía directa.',
      },
      {
        id: 'c',
        label: 'Solo agua y colorantes',
        feedback: 'El agua es vital, pero los colorantes no son nutrientes.',
      },
    ],
    educationalTakeaway:
      'Macronutrientes y micronutrientes se necesitan mutuamente: ninguno es "el único bueno" ni "el enemigo".',
  },
  {
    id: 'm2-2',
    worldId: 2,
    worldTitle: 'Mundo 2: Los poderes de los nutrientes',
    zoneName: 'El Valle de los Nutrientes',
    title: '¿Quién hace qué en el cuerpo?',
    summary: 'Relaciona el combustible principal de tu cerebro y tus músculos.',
    narrativeIntro:
      'En la estación central del valle, NUTRI revisa los paneles de energía antes de un partido escolar o un examen.',
    character: 'nutri',
    xpReward: 45,
    type: 'quiz',
    question: '¿Qué nutriente funciona como la fuente de energía más rápida y preferida para tu cerebro y músculos?',
    options: [
      {
        id: 'a',
        label: 'Los carbohidratos (como avena, fruta, pan integral, maíz o papa)',
        feedback:
          '¡Correcto! Los carbohidratos se transforman en glucosa, el combustible favorito de tu cerebro para concentrarse.',
        isBest: true,
      },
      {
        id: 'b',
        label: 'La sal de mesa',
        feedback: 'El sodio es un mineral necesario en equilibrio, pero no aporta energía.',
      },
      {
        id: 'c',
        label: 'Ninguno, el cuerpo no usa alimentos para obtener energía',
        feedback: 'Todo lo que haces —respirar, pensar y moverte— requiere la energía de los alimentos.',
      },
    ],
    educationalTakeaway:
      'Elegir carbohidratos con fibra (como avena, fruta entera o tortillas/pan integral) libera energía de manera más constante.',
  },
  {
    id: 'm2-3',
    worldId: 2,
    worldTitle: 'Mundo 2: Los poderes de los nutrientes',
    zoneName: 'El Valle de los Nutrientes',
    title: 'El viaje de una proteína',
    summary: 'Conoce fuentes animales y vegetales de proteína.',
    narrativeIntro:
      'Las proteínas actúan como bloques constructores. NUTRI te reta a encontrar una combinación vegetal completa.',
    character: 'nutri',
    xpReward: 45,
    type: 'quiz',
    question: '¿Cómo ayudan las proteínas al cuerpo durante la adolescencia?',
    options: [
      {
        id: 'a',
        label: 'Reparan tejidos, forman músculos, enzimas y defensas del sistema inmune',
        feedback:
          '¡Así es! Están presentes en pollo, huevo, leche, yogur, pescado, y también en frijoles, lentejas, garbanzos y semillas.',
        isBest: true,
      },
      {
        id: 'b',
        label: 'Solo sirven para personas que levantan pesas en un gimnasio',
        feedback: 'Todas las personas necesitan proteínas todos los días para crecer, pensar y reparar células.',
      },
      {
        id: 'c',
        label: 'Sirven únicamente para dar sabor salado',
        feedback: 'Las proteínas cumplen funciones estructurales vitales en todo el organismo.',
      },
    ],
    educationalTakeaway:
      'Tanto alimentos de origen animal (huevo, pollo, yogur) como leguminosas combinadas con cereales (frijol con arroz o maíz) aportan proteínas valiosas.',
  },
  {
    id: 'm2-4',
    worldId: 2,
    worldTitle: 'Mundo 2: Los poderes de los nutrientes',
    zoneName: 'El Valle de los Nutrientes',
    title: 'La aventura de la fibra',
    summary: 'Descubre por qué comer la fruta entera marca diferencia frente al exceso de jugos colados.',
    narrativeIntro:
      'En el río del valle, la fibra ayuda a que todo fluya con calma en el sistema digestivo.',
    character: 'nutri',
    xpReward: 45,
    type: 'quiz',
    question: '¿Qué alimento conserva mejor su fibra natural?',
    options: [
      {
        id: 'a',
        label: 'Una naranja en gajos o avena en hojuelas con fresas',
        feedback:
          '¡Exacto! La fibra está en la pulpa, cáscaras comestibles y granos enteros, ayudando a la digestión y a una absorción gradual de energía.',
        isBest: true,
      },
      {
        id: 'b',
        label: 'Un refresco sabor naranja',
        feedback: 'Los refrescos no contienen fibra ni pulpa real de fruta.',
      },
      {
        id: 'c',
        label: 'Un dulce de caramelo duro',
        feedback: 'El caramelo aporta azúcar simple sin fibra.',
      },
    ],
    educationalTakeaway:
      'La fibra alimenta a las bacterias benéficas de tu intestino y ayuda a que te sientas satisfecho por más tiempo.',
  },
  {
    id: 'm2-5',
    worldId: 2,
    worldTitle: 'Mundo 2: Los poderes de los nutrientes',
    zoneName: 'El Valle de los Nutrientes',
    title: 'El misterio de las vitaminas',
    summary: 'Vitamina C, vitamina A y su relación con alimentos frescos.',
    narrativeIntro:
      'CHEFIA está preparando los jugos "Nutrí sorbo" de naranja con zanahoria y piña con limón. NUTRI explica qué micronutrientes destacan.',
    character: 'nutri',
    xpReward: 50,
    type: 'quiz',
    question: '¿Qué aportan principalmente la naranja y el limón junto con la zanahoria?',
    options: [
      {
        id: 'a',
        label: 'Vitamina C (cítricos) y vitamina A en forma de betacarotenos (zanahoria)',
        feedback:
          '¡Excelente! Apoyan tus defensas, la piel y la visión, además de hidratarte cuando se preparan con agua natural.',
        isBest: true,
      },
      {
        id: 'b',
        label: 'Grandes cantidades de grasa saturada',
        feedback: 'Las frutas y verduras prácticamente no tienen grasas saturadas.',
      },
      {
        id: 'c',
        label: 'Únicamente cafeína natural',
        feedback: 'Ninguno de estos ingredientes contiene cafeína.',
      },
    ],
    educationalTakeaway:
      'Las vitaminas no dan energía por sí mismas, pero son llaves indispensables para que tu cuerpo aproveche los alimentos.',
  },
  {
    id: 'm2-6',
    worldId: 2,
    worldTitle: 'Mundo 2: Los poderes de los nutrientes',
    zoneName: 'El Valle de los Nutrientes',
    title: 'Grasas amigas del cerebro',
    summary: 'Aprende para qué sirven las grasas saludables y dónde encontrarlas.',
    narrativeIntro:
      'NUTRI abre una caja con aguacate, cacahuates naturales, nueces y semillas de girasol.',
    character: 'nutri',
    xpReward: 45,
    type: 'quiz',
    question: '¿Por qué es importante incluir grasas saludables en la alimentación diaria?',
    options: [
      {
        id: 'a',
        label: 'Ayudan a absorber vitaminas (A, D, E, K), protegen las células y apoyan el funcionamiento del cerebro',
        feedback:
          '¡Correcto! Alimentos como aguacate, semillas, nueces, cacahuates y aceite de oliva aportan grasas insaturadas muy valiosas.',
        isBest: true,
      },
      {
        id: 'b',
        label: 'Porque debemos eliminar por completo cualquier tipo de grasa de nuestra comida',
        feedback: 'Eliminar todas las grasas sería dañino: el cuerpo necesita grasas saludables para funcionar bien.',
      },
      {
        id: 'c',
        label: 'Porque sustituyen completamente al agua y a la fibra',
        feedback: 'Cada nutriente tiene una función distinta; ninguno reemplaza al agua ni a la fibra.',
      },
    ],
    educationalTakeaway:
      'No todas las grasas son iguales: sumar un poco de aguacate o semillas en tus comidas enriquece tus platos de forma sencilla.',
  },
  {
    id: 'm2-7',
    worldId: 2,
    worldTitle: 'Mundo 2: Los poderes de los nutrientes',
    zoneName: 'El Valle de los Nutrientes',
    title: 'Minerales en acción: hierro y calcio',
    summary: 'Descubre cómo trabajan dos minerales clave durante tu crecimiento.',
    narrativeIntro:
      'En el puente de los minerales, NUTRI conecta un plato de frijoles con limón y un vaso de leche o yogur.',
    character: 'nutri',
    xpReward: 50,
    type: 'quiz',
    question: '¿Cómo puedes aprovechar mejor el hierro de alimentos vegetales como frijoles, lentejas o espinacas?',
    options: [
      {
        id: 'a',
        label: 'Acompañándolos con una fuente de vitamina C, como limón, naranja o jitomate fresco',
        feedback:
          '¡Gran truco científico! La vitamina C ayuda a que el cuerpo absorba mucho mejor el hierro de origen vegetal.',
        isBest: true,
      },
      {
        id: 'b',
        label: 'Evitando cualquier fruta o verdura ese día',
        feedback: 'Al contrario, combinar leguminosas con verduras o cítricos mejora el aprovechamiento de minerales.',
      },
      {
        id: 'c',
        label: 'Tomando solo bebidas con cafeína junto a la comida',
        feedback: 'El exceso de café o té justo con la comida puede disminuir ligeramente la absorción de hierro vegetal.',
      },
    ],
    educationalTakeaway:
      'Un chorrito de limón sobre tus frijoles o una ensalada con jitomate hace equipo con los minerales de tu comida.',
  },

  // MUNDO 3
  {
    id: 'm3-1',
    worldId: 3,
    worldTitle: 'Mundo 3: Decisiones de la vida diaria',
    zoneName: 'La Ciudad de las Decisiones',
    title: 'Mañana con prisa antes de clase',
    summary: 'Elige una opción real cuando solo tienes 5 minutos antes de salir.',
    narrativeIntro:
      'Son las 6:45 a. m., tienes clases por la mañana y casi no hay tiempo para cocinar. Veamos qué opciones existen sin juzgar.',
    character: 'chefia',
    xpReward: 45,
    type: 'decision',
    question: 'Tienes clases durante la mañana y poco tiempo para preparar algo. ¿Qué opciones podrías considerar?',
    options: [
      {
        id: 'a',
        label: 'Licuado rápido de plátano con leche y 2 cucharadas de avena',
        feedback:
          'Gran alternativa de 2 minutos: aporta carbohidratos, algo de proteína, potasio y fibra, y puedes llevarlo en un termo.',
        isBest: true,
        pros: 'Listo en 2 minutos, económico y completo.',
        limits: 'Si no tienes licuadora a mano, puedes llevar el plátano y unas galletas de avena caseras.',
      },
      {
        id: 'b',
        label: 'Comer solo unas galletas dulces de tienda en el camino',
        feedback:
          'Es una opción práctica si no había nada más en casa; aunque da energía rápida, es probable que te dé hambre pronto en clase.',
        pros: 'Muy accesible y cero preparación.',
        limits: 'Poca proteína y fibra; puedes complementarlo con un puñito de cacahuates o una fruta cuando puedas.',
      },
      {
        id: 'c',
        label: 'Dejar preparadas desde la noche anterior 2 galletas de avena y plátano + fruta',
        feedback:
          '¡Planificación inteligente! Preparar en lote el fin de semana te salva las mañanas apuradas.',
        isBest: true,
        pros: 'Cero estrés en la mañana y sabor casero.',
        limits: 'Requiere organizar 20 minutos un día previo.',
      },
    ],
    educationalTakeaway:
      'Cuando tienes prisa, hacer lo posible con lo que tienes ya es un logro. No necesitas un desayuno de revista para cuidarte.',
  },
  {
    id: 'm3-2',
    worldId: 3,
    worldTitle: 'Mundo 3: Decisiones de la vida diaria',
    zoneName: 'La Ciudad de las Decisiones',
    title: '¿Qué puedo llevar a la escuela?',
    summary: 'Opciones prácticas que aguantan en la mochila sin echarse a perder.',
    narrativeIntro:
      'Vas a pasar 6 horas en la secundaria y no hay refrigerador para estudiantes. CHEFIA te ayuda a elegir algo seguro y rico.',
    character: 'chefia',
    xpReward: 45,
    type: 'decision',
    question: '¿Qué opción resiste mejor varias horas en la mochila si hace calor?',
    options: [
      {
        id: 'a',
        label: 'Galletas de avena y plátano "Minguita feliz", manzana o cacahuates y botella de agua',
        feedback:
          '¡Muy práctica! Los alimentos horneados secos, frutas enteras con cáscara y semillas resisten bien sin refrigeración.',
        isBest: true,
      },
      {
        id: 'b',
        label: 'Licuado con leche abierto desde la mañana bajo el sol',
        feedback:
          'La leche sin refrigeración prolongada puede fermentarse si hace mucho calor. Es mejor tomar licuados recién hechos o usar hielera térmica.',
      },
      {
        id: 'c',
        label: 'Sándwich de pollo en bolsa térmica pequeña o lonchera aislante',
        feedback:
          'Si cuentas con lonchera térmica o lo consumes en el primer receso temprano, es una opción muy completa y rica en proteína.',
        isBest: true,
      },
    ],
    educationalTakeaway:
      'Pensar en la temperatura y el empaque reutilizable ayuda a conservar tus alimentos seguros y reduce envolturas desechables.',
  },
  {
    id: 'm3-3',
    worldId: 3,
    worldTitle: 'Mundo 3: Decisiones de la vida diaria',
    zoneName: 'La Ciudad de las Decisiones',
    title: 'Comprando con un presupuesto limitado',
    summary: 'Descubre cómo nutrirte bien sin gastar de más.',
    narrativeIntro:
      'En la tienda o mercado del barrio tienes un presupuesto ajustado para tus refrigerios de la semana.',
    character: 'chefia',
    xpReward: 50,
    type: 'decision',
    question: '¿Qué estrategia rinde más dinero y aporta más nutrientes?',
    options: [
      {
        id: 'a',
        label: 'Comprar avena a granel, plátanos y naranjas de temporada en lugar de snacks individuales empacados',
        feedback:
          '¡Excelente cálculo! Con un kilo de avena y fruta de temporada salen múltiples porciones de galletas, licuados o tazones por una fracción del precio.',
        isBest: true,
      },
      {
        id: 'b',
        label: 'Comprar productos que dicen "orgánico importado premium"',
        feedback:
          'Suelen ser mucho más caros, mientras que las frutas, verduras y granos locales de temporada tienen igual o mayor frescura.',
      },
      {
        id: 'c',
        label: 'Comprar bebidas azucaradas diarias en lugar de rellenar botella con agua o jugo natural casero',
        feedback:
          'Gastar todos los días en bebidas embotelladas consume mucho presupuesto semanal y genera más plástico.',
      },
    ],
    educationalTakeaway:
      'Comer saludable NO significa gastar mucho: los alimentos locales, de temporada y básicos como avena, frijol, huevo y fruta regional suelen ser los más económicos.',
  },
  {
    id: 'm3-4',
    worldId: 3,
    worldTitle: 'Mundo 3: Decisiones de la vida diaria',
    zoneName: 'La Ciudad de las Decisiones',
    title: 'El recreo inteligente',
    summary: 'Equilibra antojo, convivencia y energía para las últimas horas de clase.',
    narrativeIntro:
      'Suena el timbre del recreo. Quieres platicar con tus amigos y comer algo rico sin quedarte dormido en la clase de matemáticas.',
    character: 'vita',
    xpReward: 45,
    type: 'decision',
    question: 'En la cooperativa escolar encuentras varias opciones. ¿Cómo puedes combinar mejor tu recreo?',
    options: [
      {
        id: 'a',
        label: 'Fruta picada o sándwich sencillo + agua simple, y si se te antoja algo dulce, compartirlo sin culpa',
        feedback:
          '¡Equilibrio realista! Disfrutar lo que te gusta dentro de una base variada evita prohibiciones innecesarias.',
        isBest: true,
      },
      {
        id: 'b',
        label: 'No comer nada en todo el día para "compensar" la cena de ayer',
        feedback:
          'Saltarte comidas por compensar puede causarte cansancio, dolor de cabeza y dificultad para aprender en clase.',
      },
      {
        id: 'c',
        label: 'Tomar solo café frío con mucha azúcar',
        feedback: 'Te dará un pico breve de energía y luego cansancio; acompañar con comida real ayuda mucho más.',
      },
    ],
    educationalTakeaway:
      'No hay alimentos prohibidos por moral: escuchar tu hambre, hidratarte y disfrutar con equilibrio funciona mejor que las reglas rígidas.',
  },
  {
    id: 'm3-5',
    worldId: 3,
    worldTitle: 'Mundo 3: Decisiones de la vida diaria',
    zoneName: 'La Ciudad de las Decisiones',
    title: '¿Qué puedo preparar con lo que tengo?',
    summary: 'Improvisa en la cocina con ingredientes básicos de alacena.',
    narrativeIntro:
      'Abres la cocina por la tarde y ves 2 plátanos muy maduros, un poco de avena y canela.',
    character: 'chefia',
    xpReward: 50,
    type: 'choice',
    question: 'En lugar de tirar los plátanos maduros porque tienen manchitas cafés, ¿qué puedes hacer?',
    options: [
      {
        id: 'a',
        label: 'Usarlos para hacer las galletas "Minguita feliz", porque maduros son naturalmente más dulces',
        feedback:
          '¡Brillante! Aprovechas un alimento en su punto más dulce, evitas desperdicio y obtienes un snack delicioso.',
        isBest: true,
      },
      {
        id: 'b',
        label: 'Tirarlos a la basura porque ya no están completamente amarillos',
        feedback:
          'Las manchitas cafés indican que el almidón se convirtió en azúcar natural: están ideales para licuados, hot cakes o galletas.',
      },
      {
        id: 'c',
        label: 'Dejarlos en la mesa una semana más sin usarlos',
        feedback: 'Si no los vas a usar hoy, ¡pélalos, córtalos y congélalos para un licuado futuro!',
      },
    ],
    educationalTakeaway:
      'Aprender a cocinar con lo que ya hay en casa ahorra dinero, reduce el desperdicio y desarrolla tu creatividad.',
  },
  {
    id: 'm3-6',
    worldId: 3,
    worldTitle: 'Mundo 3: Decisiones de la vida diaria',
    zoneName: 'La Ciudad de las Decisiones',
    title: 'Cena o comida rápida en 15 minutos',
    summary: 'Resuelve qué preparar cuando llegas cansado después de estudiar.',
    narrativeIntro:
      'Son las 7:30 p. m., terminaste tus tareas y quieres algo rico y nutritivo sin pasar una hora en la cocina.',
    character: 'chefia',
    xpReward: 50,
    type: 'decision',
    question: '¿Qué opción rápida te da energía equilibrada y satisfacción sin complicaciones?',
    options: [
      {
        id: 'a',
        label: 'Un sándwich Pío-Fit de pollo con aderezo de yogur y verduras, o unas quesadillas con frijoles y jitomate',
        feedback:
          '¡Excelente elección! En 10 a 15 minutos reúnes proteína, cereal integral o maíz y verduras frescas.',
        isBest: true,
        pros: 'Rápido, saciante y con ingredientes reales.',
        limits: 'Requiere tener pan integral o tortillas y verduras lavadas listas.',
      },
      {
        id: 'b',
        label: 'Irte a dormir con hambre para ahorrar tiempo',
        feedback: 'Acostarte sin cenar después de un día largo puede afectar tu descanso y despertarte con poca energía.',
      },
      {
        id: 'c',
        label: 'Comer solo una sopa instantánea sin ningún acompañante todos los días',
        feedback: 'Si algún día usas algo rápido, agregarle verduras picadas y huevo cocido mejora muchísimo su aporte nutricional.',
      },
    ],
    educationalTakeaway:
      'Tener 2 o 3 recetas fáciles de 15 minutos en mente evita decisiones apresuradas cuando estás cansado.',
  },
  {
    id: 'm3-7',
    worldId: 3,
    worldTitle: 'Mundo 3: Decisiones de la vida diaria',
    zoneName: 'La Ciudad de las Decisiones',
    title: 'Comer sin prisas y escuchando tu cuerpo',
    summary: 'Nota la diferencia entre comer distraído frente a una pantalla y disfrutar tu comida.',
    narrativeIntro:
      'VITA se sienta a comer y nota que cuando ve videos sin parar termina el plato sin recordar a qué sabía la comida.',
    character: 'vita',
    xpReward: 45,
    type: 'choice',
    question: '¿Qué ayuda a disfrutar mejor los alimentos y reconocer cuando ya estás satisfecho?',
    options: [
      {
        id: 'a',
        label: 'Dedicarte unos minutos sin pantalla, masticar con calma y notar los sabores y texturas',
        feedback:
          '¡Muy bien! Comer con atención permite que tu estómago y cerebro se comuniquen con tranquilidad sobre tu saciedad.',
        isBest: true,
      },
      {
        id: 'b',
        label: 'Comer lo más rápido posible en dos minutos mientras caminas',
        feedback: 'Comer con demasiada prisa dificulta la digestión y hace más difícil notar cuando ya te sientes bien.',
      },
      {
        id: 'c',
        label: 'Terminar todo por obligación aunque ya te sientas demasiado lleno',
        feedback: 'Escuchar tus señales internas de hambre y saciedad te ayuda a cuidarte con respeto.',
      },
    ],
    educationalTakeaway:
      'Alimentarte también es un momento de pausa y disfrute: saborear tu comida mejora tu relación con ella.',
  },

  // MUNDO 4
  {
    id: 'm4-1',
    worldId: 4,
    worldTitle: 'Mundo 4: Exploradores del bienestar',
    zoneName: 'El Santuario del Bienestar',
    title: '¿Por qué necesitamos descansar?',
    summary: 'Descubre qué pasa en tu cerebro y cuerpo mientras duermes.',
    narrativeIntro:
      'LUMI te invita a observar el cielo nocturno del Santuario. Dormir no es perder el tiempo: es recargar todo tu sistema.',
    character: 'lumi',
    xpReward: 45,
    type: 'quiz',
    question: '¿Qué ocurre cuando duermes lo suficiente (alrededor de 8 a 10 horas en la adolescencia)?',
    options: [
      {
        id: 'a',
        label: 'Tu cerebro organiza lo aprendido en el día, regula emociones y repara músculos',
        feedback:
          '¡Exacto! El descanso nocturno consolida la memoria, mejora la concentración y cuida tu estado de ánimo.',
        isBest: true,
      },
      {
        id: 'b',
        label: 'El cerebro se apaga por completo y no hace nada',
        feedback: '¡Al contrario! Durante el sueño hay fases muy activas donde tu cerebro limpia desechos y guarda recuerdos.',
      },
      {
        id: 'c',
        label: 'Dormir solo importa si hiciste deporte profesional',
        feedback: 'Todas las personas necesitan descansar bien para pensar con claridad y regular su energía.',
      },
    ],
    educationalTakeaway:
      'Descansar también forma parte de cuidarte. Dejar las pantallas 30 minutos antes de dormir facilita un sueño más reparador.',
  },
  {
    id: 'm4-2',
    worldId: 4,
    worldTitle: 'Mundo 4: Exploradores del bienestar',
    zoneName: 'El Santuario del Bienestar',
    title: 'Descubre diferentes formas de moverte',
    summary: 'El movimiento es mucho más que hacer ejercicio intenso.',
    narrativeIntro:
      'MOVA llega saltando al santuario para demostrar que no a todos les gusta lo mismo, ¡y eso está genial!',
    character: 'mova',
    xpReward: 45,
    type: 'quiz',
    question: '¿Cuál de estas opciones cuenta como movimiento saludable en tu semana?',
    options: [
      {
        id: 'a',
        label: 'Bailar tu música favorita, caminar con amigos, andar en bici, estirar o jugar en el patio',
        feedback:
          '¡Todas cuentan! El mejor movimiento es el que disfrutas, puedes adaptar a tus posibilidades y te hace sentir con vitalidad.',
        isBest: true,
      },
      {
        id: 'b',
        label: 'Solo entrenamientos extremos de 2 horas diarios',
        feedback: 'La actividad física no tiene que ser extrema ni dolorosa para aportar beneficios reales.',
      },
      {
        id: 'c',
        label: 'Solo las actividades diseñadas para bajar de peso',
        feedback:
          'Moverte fortalece tu corazón, huesos, coordinación y bienestar mental, sin importar tu peso o talla.',
      },
    ],
    educationalTakeaway:
      'Cada cuerpo y cada rutina es distinta. Encuentra formas de moverte que se sientan bien para ti.',
  },
  {
    id: 'm4-3',
    worldId: 4,
    worldTitle: 'Mundo 4: Exploradores del bienestar',
    zoneName: 'El Santuario del Bienestar',
    title: 'Reconoce tus emociones',
    summary: 'Aprende a escuchar lo que sientes sin juzgarte.',
    narrativeIntro:
      'En el lago sereno del Santuario, LUMI te muestra que todas las emociones traen información valiosa.',
    character: 'lumi',
    xpReward: 45,
    type: 'quiz',
    question: '¿Qué es lo más sano cuando sientes frustración, cansancio o preocupación antes de un examen?',
    options: [
      {
        id: 'a',
        label: 'Reconocer la emoción, hacer una pausa de respiración y pedir apoyo si lo necesitas',
        feedback:
          '¡Muy bien! Ponerle nombre a lo que sientes baja la tensión y te ayuda a buscar soluciones o hablar con alguien de confianza.',
        isBest: true,
      },
      {
        id: 'b',
        label: 'Fingir que no pasa nada y criticarte por sentirte así',
        feedback: 'Sentir nervios o cansancio es completamente humano; criticarte solo añade más peso.',
      },
      {
        id: 'c',
        label: 'Aislarte y no contarle nunca a nadie cómo te sientes',
        feedback: 'Compartir lo que sientes con una amistad, familiar o docente puede aliviar mucho la carga.',
      },
    ],
    educationalTakeaway:
      'Las emociones no son "buenas" ni "malas": son señales. Si alguna vez te sientes abrumado, habla con una persona adulta de confianza.',
  },
  {
    id: 'm4-4',
    worldId: 4,
    worldTitle: 'Mundo 4: Exploradores del bienestar',
    zoneName: 'El Santuario del Bienestar',
    title: 'Un momento para desconectarte',
    summary: 'Equilibrio digital y pausas para la vista y la mente.',
    narrativeIntro:
      'Después de varias horas frente al celular o la computadora haciendo tareas, VITA nota los ojos cansados.',
    character: 'lumi',
    xpReward: 45,
    type: 'choice',
    question: '¿Qué pausa breve ayuda a descansar vista y mente en 3 minutos?',
    options: [
      {
        id: 'a',
        label: 'Mirar a lo lejos por una ventana, estirar cuello y hombros y respirar lento',
        feedback:
          '¡Excelente pausa consciente! Relajas los músculos oculares, liberas tensión de hombros y oxigenas tu atención.',
        isBest: true,
      },
      {
        id: 'b',
        label: 'Cambiar de la tarea a ver videos cortos sin parar durante una hora',
        feedback: 'Seguir frente a la pantalla mantiene estimulada la vista y puede aumentar el cansancio mental.',
      },
      {
        id: 'c',
        label: 'Tomar dos refrescos de cola seguidos',
        feedback: 'El azúcar y la cafeína no relajan la tensión ocular ni sustituyen una pausa.',
      },
    ],
    educationalTakeaway:
      'Pequeñas pausas de 2 o 3 minutos cada hora mejoran tu bienestar mucho más que exigirte sin descanso.',
  },
  {
    id: 'm4-5',
    worldId: 4,
    worldTitle: 'Mundo 4: Exploradores del bienestar',
    zoneName: 'El Santuario del Bienestar',
    title: 'Hábitos pequeños para el día a día',
    summary: 'Construye cambios realistas sin perfección ni presiones.',
    narrativeIntro:
      'Para cerrar el capítulo del Santuario, VITA y LUMI te comparten su regla favorita: "Pequeños hábitos, grandes descubrimientos".',
    character: 'vita',
    xpReward: 50,
    type: 'choice',
    question: '¿Cuál es una meta realista y sostenible para empezar a cuidarte más esta semana?',
    options: [
      {
        id: 'a',
        label: 'Llevar mi botella con agua a la escuela y hacer 5 minutos de estiramiento cuando termine la tarea',
        feedback:
          '¡Perfecto! Es concreto, posible en tu rutina real y no te exige perfección imposible.',
        isBest: true,
      },
      {
        id: 'b',
        label: 'Cambiar toda mi vida mañana mismo y no fallar jamás ningún día',
        feedback: 'Las metas extremas suelen causar frustración. En VITALIA nunca te castigamos si un día es distinto.',
      },
      {
        id: 'c',
        label: 'Comparar mis hábitos diarios con los de influencers en redes',
        feedback: 'Cada persona tiene circunstancias, horarios y recursos diferentes; tu camino es tuyo.',
      },
    ],
    educationalTakeaway:
      'No tienes que hacerlo todo perfecto para aprender algo nuevo. Cada pequeño paso cuenta.',
  },
  {
    id: 'm4-6',
    worldId: 4,
    worldTitle: 'Mundo 4: Exploradores del bienestar',
    zoneName: 'El Santuario del Bienestar',
    title: 'Pausas activas entre tareas',
    summary: 'Activa tu cuerpo 5 minutos después de estar sentado estudiando.',
    narrativeIntro:
      'Llevas una hora sentado resolviendo ejercicios de historia y sientes la espalda rígida. MOVA aparece con una propuesta breve.',
    character: 'mova',
    xpReward: 45,
    type: 'choice',
    question: '¿Qué pausa activa de 5 minutos ayuda a recargar tu cuerpo sin agotarte?',
    options: [
      {
        id: 'a',
        label: 'Levantarte, girar hombros suavemente, estirar brazos y caminar unos pasos por tu espacio',
        feedback:
          '¡Genial! Activas la circulación, liberas tensión de cuello y espalda y vuelves a estudiar con la mente más despejada.',
        isBest: true,
      },
      {
        id: 'b',
        label: 'Quedarte en la misma postura encorvada otras tres horas seguidas',
        feedback: 'Permanecer demasiado tiempo inmóvil acumula rigidez y fatiga.',
      },
      {
        id: 'c',
        label: 'Hacer saltos al límite hasta quedar exhausto en el cuarto',
        feedback: 'Las pausas entre tareas buscan renovar tu energía, no dejarte agotado.',
      },
    ],
    educationalTakeaway:
      'Moverte unos minutos cada hora de estudio cuida tu postura y mantiene tu mente fresca.',
  },
  {
    id: 'm4-7',
    worldId: 4,
    worldTitle: 'Mundo 4: Exploradores del bienestar',
    zoneName: 'El Santuario del Bienestar',
    title: 'Agua y recuperación al moverte',
    summary: 'Cuida tu hidratación antes, durante y después de jugar o bailar.',
    narrativeIntro:
      'Terminó una partida amistosa en el patio escolar y MOVA recuerda revisar cómo se siente el cuerpo.',
    character: 'mova',
    xpReward: 50,
    type: 'quiz',
    question: 'Al terminar una actividad física escolar de intensidad ligera o moderada, ¿qué es lo más recomendable?',
    options: [
      {
        id: 'a',
        label: 'Tomar agua simple a sorbos tranquilos, caminar un par de minutos para bajar el ritmo y estirar suavemente',
        feedback:
          '¡Excelente rutina de recuperación! Ayudas a tu corazón a regresar a su ritmo normal y repones el agua perdida al sudar.',
        isBest: true,
      },
      {
        id: 'b',
        label: 'Comprar una bebida energética con cafeína alta',
        feedback: 'Las bebidas energéticas no están pensadas para hidratar tras el ejercicio escolar.',
      },
      {
        id: 'c',
        label: 'Sentarte de golpe sin tomar nada de líquido en toda la tarde',
        feedback: 'Reponer líquidos y enfriar el cuerpo de forma gradual te ayuda a sentirte mucho mejor después.',
      },
    ],
    educationalTakeaway:
      'Escuchar tu respiración, hidratarte con agua y estirar suavemente completa cualquier sesión de movimiento.',
  },

  // MUNDO 5
  {
    id: 'm5-1',
    worldId: 5,
    worldTitle: 'Mundo 5: Guardianes del planeta',
    zoneName: 'El Laboratorio de la Innovación',
    title: '¿Qué sucede con los residuos de frutas?',
    summary: 'Descubre la diferencia entre basura mezclada y residuos orgánicos aprovechables.',
    narrativeIntro:
      'ECO te recibe en el Laboratorio BIOTEC. Cada día, tras preparar jugos y licuados, quedan cáscaras de naranja, plátano y piña.',
    character: 'eco',
    xpReward: 50,
    type: 'quiz',
    question: '¿Qué pasa si mezclamos cáscaras de fruta húmedas con plástico y papel limpio en un solo bote?',
    options: [
      {
        id: 'a',
        label: 'Se contamina el material reciclable y se pierden nutrientes y biopolímeros valiosos de la fruta',
        feedback:
          '¡Exacto! Separar los residuos orgánicos desde el origen permite compostarlos o investigarlos en proyectos como BIOTEC.',
        isBest: true,
      },
      {
        id: 'b',
        label: 'Las cáscaras se transforman solas en plástico útil en el relleno sanitario',
        feedback: 'En rellenos sanitarios sin oxígeno, la materia orgánica genera metano y pierde su potencial de aprovechamiento.',
      },
      {
        id: 'c',
        label: 'No pasa nada, da igual separarlos',
        feedback: 'Separar en la escuela y en casa es el primer paso para cualquier proceso de economía circular.',
      },
    ],
    educationalTakeaway:
      'Lo que queda después de preparar tus alimentos no es necesariamente "basura": puede ser materia prima para ciencia y compostaje.',
  },
  {
    id: 'm5-2',
    worldId: 5,
    worldTitle: 'Mundo 5: Guardianes del planeta',
    zoneName: 'El Laboratorio de la Innovación',
    title: 'El viaje de una cáscara',
    summary: 'Explora compuestos como almidón, celulosa y pectina en cáscaras.',
    narrativeIntro:
      'En la mesa experimental de BIOTEC hay cáscaras de plátano y naranja secándose para investigación.',
    character: 'eco',
    xpReward: 50,
    type: 'quiz',
    question: '¿Por qué la ciencia investiga cáscaras de plátano o naranja para elaborar bioplásticos experimentales?',
    options: [
      {
        id: 'a',
        label: 'Porque contienen biopolímeros naturales como almidón, celulosa y pectina',
        feedback:
          '¡Brillante! Al combinarlos con agua, glicerina y calor controlado en laboratorio escolar pueden formar láminas flexibles experimentales.',
        isBest: true,
      },
      {
        id: 'b',
        label: 'Porque contienen petróleo líquido en su interior',
        feedback: '¡Al contrario! Los bioplásticos buscan alternativas de origen biológico frente a plásticos derivados del petróleo.',
      },
      {
        id: 'c',
        label: 'Porque ya salen listos para vender como envase industrial sin pruebas',
        feedback: 'Todo prototipo necesita pruebas científicas de resistencia, humedad, degradación y seguridad.',
      },
    ],
    educationalTakeaway:
      'Los bioplásticos son fascinantes, pero su impacto real depende de su composición y de las condiciones donde se degraden.',
  },
  {
    id: 'm5-3',
    worldId: 5,
    worldTitle: 'Mundo 5: Guardianes del planeta',
    zoneName: 'El Laboratorio de la Innovación',
    title: '¿Qué podemos aprovechar?',
    summary: 'Identifica segundas vidas útiles para residuos de cocina.',
    narrativeIntro:
      'CHEFIA y ECO colaboran después de preparar el jugo de naranja-zanahoria y las galletas de plátano.',
    character: 'eco',
    xpReward: 50,
    type: 'choice',
    question: '¿Qué uso creativo podemos dar al bagazo de zanahoria o naranja que queda tras preparar un jugo?',
    options: [
      {
        id: 'a',
        label: 'Incorporar el bagazo limpio de zanahoria en masa para panqués/galletas o usarlo en composta y pruebas BIOTEC',
        feedback:
          '¡Doble aprovechamiento! Conserva fibra útil para repostería casera o se convierte en recurso orgánico para el huerto escolar.',
        isBest: true,
      },
      {
        id: 'b',
        label: 'Echarlo al drenaje del fregadero',
        feedback: 'El bagazo puede tapar las tuberías; es mucho mejor compostarlo o aprovecharlo.',
      },
      {
        id: 'c',
        label: 'Quemarlo en el patio',
        feedback: 'Quemar residuos húmedos genera humo contaminante y desperdicia materia orgánica útil.',
      },
    ],
    educationalTakeaway:
      'Aprovechar por completo los alimentos conecta la nutrición con la sostenibilidad ambiental.',
  },
  {
    id: 'm5-4',
    worldId: 5,
    worldTitle: 'Mundo 5: Guardianes del planeta',
    zoneName: 'El Laboratorio de la Innovación',
    title: 'Detectives del desperdicio',
    summary: 'Detecta hábitos escolares que evitan desperdiciar comida y empaques.',
    narrativeIntro:
      'En la cafetería de la escuela, ECO observa cuánta comida y botellas terminan en el bote sin aprovecharse.',
    character: 'eco',
    xpReward: 50,
    type: 'decision',
    question: '¿Qué acción en equipo tiene mayor impacto práctico en la escuela?',
    options: [
      {
        id: 'a',
        label: 'Usar termos reutilizables, pedir solo la porción que vas a comer y colocar contenedores para residuos de fruta',
        feedback:
          '¡Excelente estrategia! Prevenir el desperdicio desde el principio es incluso más poderoso que reciclar después.',
        isBest: true,
      },
      {
        id: 'b',
        label: 'Usar tres bolsas de plástico nuevas cada recreo',
        feedback: 'Eso multiplica los residuos plásticos de un solo uso.',
      },
      {
        id: 'c',
        label: 'Servirse el plato lleno aunque sepas que no te lo vas a acabar',
        feedback: 'Servir porciones acordes a tu hambre real reduce muchísimo el desperdicio de alimentos.',
      },
    ],
    educationalTakeaway:
      'Reducir y reutilizar siempre van antes que reciclar. Tus decisiones cotidianas en la escuela suman.',
  },
  {
    id: 'm5-5',
    worldId: 5,
    worldTitle: 'Mundo 5: Guardianes del planeta',
    zoneName: 'El Laboratorio de la Innovación',
    title: 'Diseña una solución sostenible',
    summary: 'Evalúa críticamente un prototipo escolar de bioplástico.',
    narrativeIntro:
      '¡Última misión del capítulo! El equipo diseñó una lámina biodegradable experimental a partir de cáscara de plátano y almidón.',
    character: 'eco',
    xpReward: 60,
    type: 'quiz',
    question: 'Antes de proponer esta lámina como empaque escolar de alimentos, ¿qué paso científico es indispensable?',
    options: [
      {
        id: 'a',
        label: 'Realizar pruebas de resistencia, humedad, higiene, seguridad alimentaria y condiciones reales de degradación',
        feedback:
          '¡Pensamiento científico de Guardián de VITALIA! Los prototipos escolares abren caminos de investigación, y cada aplicación requiere validación rigurosa.',
        isBest: true,
      },
      {
        id: 'b',
        label: 'Darla por segura automáticamente porque viene de una fruta',
        feedback: 'Que un material sea de origen natural no garantiza automáticamente resistencia al agua o seguridad para contacto directo con comida.',
      },
      {
        id: 'c',
        label: 'Asumir que desaparecerá en 10 segundos en cualquier lugar',
        feedback: 'La biodegradación depende de temperatura, humedad y microorganismos presentes.',
      },
    ],
    educationalTakeaway:
      'La verdadera innovación combina creatividad ecológica con rigor científico y honestidad sobre lo que aún está en etapa experimental.',
  },
  {
    id: 'm5-6',
    worldId: 5,
    worldTitle: 'Mundo 5: Guardianes del planeta',
    zoneName: 'El Laboratorio de la Innovación',
    title: 'Fibras vegetales y papel artesanal',
    summary: 'Descubre cómo el bagazo de frutas puede transformarse en hojas recicladas escolares.',
    narrativeIntro:
      'En la mesa de secado de BIOTEC, ECO muestra tarjetas texturizadas elaboradas con fibras de bagazo de piña y zanahoria.',
    character: 'eco',
    xpReward: 50,
    type: 'quiz',
    question: '¿Qué componente de las plantas permite entrelazar fibras en el agua para formar papel artesanal?',
    options: [
      {
        id: 'a',
        label: 'La celulosa presente en tallos, cáscaras y bagazos vegetales',
        feedback:
          '¡Exacto! Las fibras de celulosa se suspenden en agua y al prensarlas en malla y secarlas al sol forman láminas útiles para carteles escolares.',
        isBest: true,
      },
      {
        id: 'b',
        label: 'El azúcar disuelto en agua fría',
        feedback: 'El azúcar se disuelve y no forma una red fibrosa resistente.',
      },
      {
        id: 'c',
        label: 'Colorantes sintéticos líquidos',
        feedback: 'Los colorantes solo dan tono, no crean estructura vegetal.',
      },
    ],
    educationalTakeaway:
      'Aprovechar las fibras vegetales del bagazo transforma un residuo húmedo en material educativo creativo.',
  },
  {
    id: 'm5-7',
    worldId: 5,
    worldTitle: 'Mundo 5: Guardianes del planeta',
    zoneName: 'El Laboratorio de la Innovación',
    title: 'Feria escolar cero desperdicios',
    summary: 'Organiza una presentación de VITALIA en tu escuela cuidando recursos y residuos.',
    narrativeIntro:
      'Tu grupo va a presentar los prototipos de Minguita Feliz, Nutri-Sorbo y Pío-Fit en la feria escolar. ECO pide ayuda para planear la logística.',
    character: 'eco',
    xpReward: 60,
    type: 'decision',
    question: '¿Qué combinación hace que la exposición escolar sea más sostenible y funcional?',
    options: [
      {
        id: 'a',
        label: 'Usar códigos QR en carteles reutilizables para ver las recetas, vasos reutilizables y un contenedor separado para cáscaras rumbo a BIOTEC',
        feedback:
          '¡Plan maestro de Guardián de VITALIA! Reduces papel innecesario, evitas desechables y conectas la comida con los proyectos científicos.',
        isBest: true,
        pros: 'Menos basura, mejor experiencia interactiva y economía circular real.',
        limits: 'Requiere coordinar turnos para lavar los recipientes reutilizables.',
      },
      {
        id: 'b',
        label: 'Imprimir 300 folletos de papel y usar doble vaso desechable para cada muestra',
        feedback: 'Eso generaría mucha basura innecesaria después del evento.',
      },
      {
        id: 'c',
        label: 'Tirar todas las cáscaras de naranja y piña mezcladas con servilletas con grasa',
        feedback: 'Si separas las cáscaras limpias desde el inicio, pueden servir para composta o experimentos BIOTEC.',
      },
    ],
    educationalTakeaway:
      'Cada evento escolar es una oportunidad para demostrar cómo la alimentación saludable y la sostenibilidad van de la mano.',
  },
];

export const RECETARIO_BRAND_IMAGES = {
  pioFit: '/assets/aistudio/336d6004-c36d-4907-9275-55e3a630dfd1_16a284c7.jpeg',
  miguitaFeliz: '/assets/aistudio/b71c34d1-6395-443f-9b8f-039f0ee4dc08_7c4f8e5c.jpeg',
  puraVida: '/assets/aistudio/3b4b0d45-36e9-4b34-9cbc-f09da3938ab0_bc7a0e54.jpeg',
  nutriSorbo: '/assets/aistudio/8241398b-08a5-475e-8912-d8ff0033e0d7_8be62d75.jpeg',
} as const;

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'rec-minguita-feliz',
    qrCode: 'VITALIA-REC-01',
    name: 'Galletas saludables de avena y plátano',
    brandLine: 'Minguita feliz',
    category: 'snack',
    isProjectRecipe: true,
    prepTime: '25 min',
    difficulty: 'Sencilla',
    costLevel: 'Económica',
    ingredients: [
      '2 plátanos maduros',
      '1 taza de avena',
      '1 cucharadita de canela',
      '1 cucharada de miel',
      '¼ de taza de pasas o chispas de chocolate amargo (opcional)',
    ],
    keyIngredientTags: ['platano', 'avena', 'canela', 'miel'],
    allergens: ['gluten (trazas en avena si no es certificada)'],
    steps: [
      'Machaca los plátanos maduros en un recipiente hasta obtener un puré.',
      'Agrega la avena, la canela y la miel (y las pasas o chispas si deseas).',
      'Mezcla hasta obtener una masa uniforme.',
      'Forma pequeñas galletas y colócalas en una charola.',
      'Hornea a 180 °C durante 15-20 minutos.',
      'Deja enfriar y sirve.',
    ],
    substitutions: [
      'Puedes cambiar la miel por puré de manzana o usar solo plátano muy maduro.',
      'Si prefieres textura crujiente, agrega semillas de girasol o nuez picada.',
    ],
    nutrientsInfo:
      'Aporta carbohidratos complejos y fibra soluble de la avena, potasio y vitamina B6 del plátano, con dulzor natural.',
    projectWhy:
      'Seleccionada por el equipo VITALIA porque aprovecha plátanos maduros económicos, no requiere harinas refinadas y es fácil de llevar a la escuela.',
    accentColor: 'amber',
    imageUrl: RECETARIO_BRAND_IMAGES.miguitaFeliz,
    economics: {
      portionLabel: 'Paquete (2 pzas)',
      unitCost: 3.79,
      suggestedPrice: 10.0,
      breakdown: [
        { ingredient: 'Avena', portion: 'Porción proporcional', cost: 0.73 },
        { ingredient: 'Plátano', portion: 'Porción proporcional', cost: 0.76 },
        { ingredient: 'Chocolate amargo', portion: 'Porción proporcional', cost: 1.4 },
        { ingredient: 'Miel / canela', portion: 'Porción proporcional', cost: 0.5 },
        { ingredient: 'Bolsita de empaque', portion: '1 pza', cost: 0.4 },
      ],
    },
  },
  {
    id: 'rec-jugo-naranja-zanahoria',
    qrCode: 'VITALIA-REC-02',
    name: 'Jugo natural de naranja y zanahoria',
    brandLine: 'Nutrí sorbo',
    category: 'bebida',
    isProjectRecipe: true,
    prepTime: '10 min',
    difficulty: 'Sencilla',
    costLevel: 'Económica',
    ingredients: [
      '2 naranjas',
      '1 zanahoria',
      '½ taza de agua',
      'Hielo al gusto',
    ],
    keyIngredientTags: ['naranja', 'zanahoria', 'agua'],
    allergens: [],
    steps: [
      'Lava y pela la zanahoria.',
      'Exprime las naranjas.',
      'Coloca el jugo, la zanahoria en trozos y el agua en la licuadora.',
      'Licúa hasta integrar bien los ingredientes.',
      'Sirve con hielo.',
    ],
    substitutions: [
      'Si lo prefieres con toda su fibra, tómalo sin colar; el bagazo sobrante puede ir a composta o experimentos BIOTEC.',
      'Puedes añadir un trocito pequeño de jengibre fresco para variar el aroma.',
    ],
    nutrientsInfo:
      'Fuente natural de vitamina C de la naranja, betacarotenos (precursores de vitamina A) de la zanahoria e hidratación refrescante.',
    projectWhy:
      'Parte de la línea Nutrí sorbo creada para ofrecer una bebida fresca en la escuela sin azúcares añadidos ni colorantes artificiales.',
    accentColor: 'orange',
    imageUrl: RECETARIO_BRAND_IMAGES.nutriSorbo,
    economics: {
      portionLabel: '12 oz',
      unitCost: 11.98,
      suggestedPrice: 18.0,
      breakdown: [
        { ingredient: 'Naranja', portion: '450 g', cost: 9.0 },
        { ingredient: 'Zanahoria', portion: '100 g', cost: 1.4 },
        { ingredient: 'Miel', portion: 'Porción proporcional', cost: 0.4 },
        { ingredient: 'Vaso / popote', portion: '1 juego', cost: 1.18 },
      ],
    },
  },
  {
    id: 'rec-jugo-pina-limon',
    qrCode: 'VITALIA-REC-03',
    name: 'Jugo de piña con limón',
    brandLine: 'Nutrí sorbo',
    category: 'bebida',
    isProjectRecipe: true,
    prepTime: '5 min',
    difficulty: 'Sencilla',
    costLevel: 'Económica',
    ingredients: [
      '1 taza de piña picada',
      'Jugo de 1 limón',
      '1 taza de agua',
      'Hielo al gusto',
    ],
    keyIngredientTags: ['pina', 'limon', 'agua'],
    allergens: [],
    steps: [
      'Corta la piña en trozos pequeños.',
      'Agrega la piña, el jugo de limón y el agua a la licuadora.',
      'Licúa durante un minuto.',
      'Sirve frío.',
    ],
    substitutions: [
      'Puedes añadir unas hojas de hierbabuena o menta fresca para mayor frescura.',
      'La cáscara limpia de la piña puede aprovecharse para agua fermentada casera o proyectos BIOTEC.',
    ],
    nutrientsInfo:
      'Aporta hidratación, vitamina C del limón y la piña, y enzimas naturales presentes en la piña fresca.',
    projectWhy:
      'Elegida por ser rápida, refrescante para días calurosos en la escuela y una alternativa real frente a refrescos comerciales.',
    accentColor: 'yellow',
    imageUrl: RECETARIO_BRAND_IMAGES.nutriSorbo,
    economics: {
      portionLabel: '12 oz (aprox.)',
      unitCost: 7.98,
      suggestedPrice: 15.0,
      isEstimate: true,
      breakdown: [
        { ingredient: 'Piña fresca (estimado)', portion: '150 g aprox.', cost: 5.25 },
        { ingredient: 'Limón (estimado)', portion: '1 pieza', cost: 1.2 },
        { ingredient: 'Agua y hielo', portion: '1 taza', cost: 0.35 },
        { ingredient: 'Vaso / popote', portion: '1 juego', cost: 1.18 },
      ],
    },
  },
  {
    id: 'rec-licuado-fresa',
    qrCode: 'VITALIA-REC-04',
    name: 'Licuado de fresa',
    brandLine: 'Nutrí sorbo',
    category: 'bebida',
    isProjectRecipe: true,
    prepTime: '5 min',
    difficulty: 'Sencilla',
    costLevel: 'Económica',
    ingredients: [
      '1 taza de fresas lavadas y desinfectadas',
      '1 taza de leche',
      '3 cucharadas de avena',
      '1 cucharadita de miel (opcional)',
    ],
    keyIngredientTags: ['fresa', 'leche', 'avena', 'miel'],
    allergens: ['lácteos'],
    steps: [
      'Lava y desinfecta cuidadosamente las fresas.',
      'Coloca las fresas, la leche y la avena en la licuadora.',
      'Agrega miel si lo deseas.',
      'Licúa hasta obtener una mezcla cremosa.',
      'Sirve inmediatamente.',
    ],
    substitutions: [
      'Si evitas lácteos, usa bebida vegetal fortificada con calcio (soya o almendra sin azúcar).',
      'Puedes congelar las fresas previamente para lograr textura tipo malteada fría.',
    ],
    nutrientsInfo:
      'Combina proteínas y calcio de la leche, fibra de la avena y vitamina C y antioxidantes naturales de la fresa.',
    projectWhy:
      'Demuestra que un licuado casero con avena aporta mayor saciedad y nutrientes que las bebidas saborizadas empaquetadas.',
    accentColor: 'rose',
    imageUrl: RECETARIO_BRAND_IMAGES.nutriSorbo,
    economics: {
      portionLabel: '12 oz',
      unitCost: 17.78,
      suggestedPrice: 25.0,
      breakdown: [
        { ingredient: 'Leche', portion: '250 ml', cost: 3.5 },
        { ingredient: 'Fresa natural', portion: '~80 g', cost: 12.6 },
        { ingredient: 'Miel / azúcar', portion: 'Porción proporcional', cost: 0.5 },
        { ingredient: 'Vaso / popote', portion: '1 juego', cost: 1.18 },
      ],
    },
  },
  {
    id: 'rec-licuado-platano',
    qrCode: 'VITALIA-REC-05',
    name: 'Licuado de plátano',
    brandLine: 'Nutrí sorbo',
    category: 'bebida',
    isProjectRecipe: true,
    prepTime: '4 min',
    difficulty: 'Sencilla',
    costLevel: 'Económica',
    ingredients: [
      '1 plátano',
      '1 taza de leche',
      '2 cucharadas de avena',
      'Una pizca de canela',
      'Hielo al gusto',
    ],
    keyIngredientTags: ['platano', 'leche', 'avena', 'canela'],
    allergens: ['lácteos'],
    steps: [
      'Pela y corta el plátano en rodajas.',
      'Agrega todos los ingredientes a la licuadora.',
      'Licúa durante 1 minuto.',
      'Sirve en un vaso.',
    ],
    substitutions: [
      'Puedes sustituir la leche de vaca por bebida de soya o avena si eres intolerante a la lactosa.',
      'Agrega una cucharadita de crema de cacahuate si no tienes alergia y deseas más proteína.',
    ],
    nutrientsInfo:
      'Energía estable gracias a la mezcla de carbohidratos del plátano y la avena con proteínas y calcio de la leche.',
    projectWhy:
      'Es una de las opciones favoritas para mañanas con poco tiempo: económica, rápida y con ingredientes fáciles de encontrar en casa.',
    accentColor: 'amber',
    imageUrl: RECETARIO_BRAND_IMAGES.nutriSorbo,
    economics: {
      portionLabel: '12 oz',
      unitCost: 8.0,
      suggestedPrice: 15.0,
      breakdown: [
        { ingredient: 'Leche', portion: '250 ml', cost: 3.5 },
        { ingredient: 'Plátano', portion: '120 g', cost: 2.28 },
        { ingredient: 'Avena', portion: '20 g', cost: 0.44 },
        { ingredient: 'Canela / miel', portion: 'Porción proporcional', cost: 0.6 },
        { ingredient: 'Vaso / popote', portion: '1 juego', cost: 1.18 },
      ],
    },
  },
  {
    id: 'rec-sandwich-pollo',
    qrCode: 'VITALIA-REC-06',
    name: 'Sándwich de pollo con aderezo fit de yogur',
    brandLine: 'Prototipo VITALIA',
    category: 'comida',
    isProjectRecipe: true,
    prepTime: '20 min',
    difficulty: 'Media',
    costLevel: 'Moderada',
    ingredients: [
      '2 rebanadas de pan integral',
      '1 filete de pechuga de pollo (150 g aprox.)',
      'Aderezo fit: 2 cdas de yogur griego sin azúcar + jugo de ½ limón + sal + pimienta + ajo en polvo',
      'Lechuga, jitomate en rodajas, cebolla morada y aguacate',
      '1 rebanada de queso panela o Oaxaca light (opcional)',
      'Para sazonar el pollo: paprika, ajo en polvo, sal, pimienta y un chorrito de limón',
    ],
    keyIngredientTags: ['pan integral', 'pollo', 'yogur', 'verduras', 'aguacate', 'queso'],
    allergens: ['gluten', 'lácteos'],
    steps: [
      'Sazona el pollo: ponle paprika, ajo en polvo, sal, pimienta y un chorrito de limón. Déjalo reposar 5 minutos.',
      'Ásalo en sartén con un poco de aceite en spray, 4-5 minutos por lado hasta que quede dorado por fuera y jugoso por dentro. Déjalo reposar 2 minutos y córtalo en tiritas.',
      'Prepara el aderezo: mezcla el yogur griego sin azúcar con jugo de limón, sal, pimienta y ajo en polvo.',
      'Arma el sándwich: pan integral tostado + aderezo + lechuga + jitomate + pollo en tiritas + aguacate + cebolla + queso opcional.',
      'Caliéntalo 1 minuto en la sartén o sandwichera si deseas que quede doradito y se derrita el queso.',
    ],
    substitutions: [
      'Versión vegetal o más económica: sustituye el pollo por garbanzos machacados sazonados con paprika o huevo cocido.',
      'Si evitas lácteos, usa puré de aguacate con limón en lugar de yogur griego y queso.',
    ],
    nutrientsInfo:
      'Comida completa con proteína de alta calidad (pollo y yogur), fibra y granos enteros (pan integral), grasas saludables (aguacate) y vitaminas de verduras frescas.',
    projectWhy:
      'Muestra cómo mejorar un alimento cotidiano como el sándwich sustituyendo aderezos comerciales pesados por una crema casera de yogur griego y sumando vegetales frescos.',
    accentColor: 'emerald',
    imageUrl: RECETARIO_BRAND_IMAGES.pioFit,
    economics: {
      portionLabel: '1 pieza',
      unitCost: 11.8,
      suggestedPrice: 20.0,
      breakdown: [
        { ingredient: 'Pan integral', portion: '2 rebanadas', cost: 2.8 },
        { ingredient: 'Pechuga de pollo', portion: '60 g', cost: 5.7 },
        { ingredient: 'Aguacate', portion: '30 g', cost: 1.17 },
        { ingredient: 'Tomate / lechuga / cebolla', portion: 'Porción fresca', cost: 1.65 },
        { ingredient: 'Envoltura', portion: '1 pza', cost: 0.48 },
      ],
    },
  },
];

export interface BaseSupplyPrice {
  id: string;
  name: string;
  presentation: string;
  costLabel: string;
  numericCost?: number;
  note: string;
  isEstimate?: boolean;
}

export const BASE_SUPPLIES_PRICES: BaseSupplyPrice[] = [
  { id: 'sup-platano', name: 'Plátano', presentation: '1 kg', costLabel: '$19.00', numericCost: 19, note: 'Dato cotizado por el equipo' },
  { id: 'sup-avena', name: 'Avena', presentation: '1 kg', costLabel: '$22.00', numericCost: 22, note: 'Dato cotizado por el equipo' },
  { id: 'sup-leche', name: 'Leche', presentation: '1 litro', costLabel: '$14.00', numericCost: 14, note: 'Dato cotizado por el equipo' },
  { id: 'sup-fresa', name: 'Fresa', presentation: '1 caja (aprox. 450–500 g)', costLabel: '$79.00', numericCost: 79, note: 'Dato cotizado por el equipo' },
  { id: 'sup-zanahoria', name: 'Zanahoria', presentation: '1 kg', costLabel: '$14.00', numericCost: 14, note: 'Dato cotizado por el equipo' },
  { id: 'sup-naranja', name: 'Naranja', presentation: '1 kg', costLabel: '$20.00', numericCost: 20, note: 'Dato cotizado por el equipo' },
  { id: 'sup-chocolate', name: 'Chocolate', presentation: '100 g', costLabel: '$28.00', numericCost: 28, note: 'Dato cotizado por el equipo' },
  { id: 'sup-azucar', name: 'Azúcar', presentation: '1 kg', costLabel: '$24.00', numericCost: 24, note: 'Dato cotizado por el equipo' },
  { id: 'sup-popotes', name: 'Popotes', presentation: 'Paquete 150 pzas', costLabel: '$17.00', numericCost: 17, note: '$0.11 por pieza (dato cotizado)' },
  { id: 'sup-tomate', name: 'Tomate rojo', presentation: '1 kg', costLabel: '$33.00', numericCost: 33, note: 'Dato cotizado por el equipo' },
  { id: 'sup-cebolla', name: 'Cebolla', presentation: '1 kg', costLabel: '$19.00', numericCost: 19, note: 'Dato cotizado por el equipo' },
  { id: 'sup-aguacate', name: 'Aguacate', presentation: '1 kg', costLabel: '$39.00', numericCost: 39, note: 'Dato cotizado por el equipo' },
  { id: 'sup-pollo', name: 'Pechuga de pollo', presentation: '1 kg (referencia promedio)', costLabel: '$95.00*', numericCost: 95, note: 'Varía según peso; rinde ~14 sándwiches', isEstimate: true },
  { id: 'sup-lechuga', name: 'Lechuga', presentation: '1 pieza grande', costLabel: '$18.00*', numericCost: 18, note: 'Estimación de mercado (rinde ~15 sándwiches)', isEstimate: true },
  { id: 'sup-pina', name: 'Piña y limón (referencia)', presentation: '1 kg aprox.', costLabel: '$35.00*', numericCost: 35, note: 'Estimación aproximada para proyectar el jugo Piña-Limón', isEstimate: true },
  { id: 'sup-otros', name: 'Canela / Miel / Pan / Vasos', presentation: 'Porción proporcional', costLabel: 'Variable*', note: 'Estimación incluida en el prorrateo unitario', isEstimate: true },
];

export interface ProjectMethodologyCard {
  id: string;
  title: string;
  description: string;
}

export interface BibliographicSource {
  id: string;
  number: number;
  shortOrg: string;
  authors: string;
  title: string;
  publicationInfo: string;
  publicationDate: string;
  consultationDate: string;
  summary: string;
  highlights: string[];
}

export const PROJECT_RESEARCH_OVERVIEW: {
  cards: ProjectMethodologyCard[];
  supportInstitutions: string[];
  schoolContextStats: { label: string; value: string; note: string }[];
} = {
  cards: [
    {
      id: 'metodologia',
      title: 'Metodología',
      description:
        'Procedimiento diseñado por el equipo para desarrollar la investigación documental, aplicar una encuesta en la comunidad escolar, analizar sus resultados, elaborar cada producto saludable y evaluar su viabilidad económica y nutricional.',
    },
    {
      id: 'resultados',
      title: 'Resultados esperados',
      description:
        'Las expectativas del equipo sobre los hábitos alimentarios de los estudiantes y la aceptación de las recetas saludables se comprueban mediante la aplicación de la encuesta escolar y la evaluación práctica de cada producto.',
    },
    {
      id: 'conclusion',
      title: 'Conclusión',
      description:
        'Elaboración propia basada en la investigación documental y en las fuentes científicas e institucionales consultadas durante el proyecto escolar VITALIA.',
    },
  ],
  supportInstitutions: [
    'Organización Mundial de la Salud (OMS)',
    'Organización de las Naciones Unidas para la Alimentación y la Agricultura (FAO)',
    'Instituto Nacional de Salud Pública (INSP)',
    'Secretaría de Salud',
    'Diario Oficial de la Federación (DOF)',
    'Fondo de las Naciones Unidas para la Infancia (UNICEF México)',
    'Instituto Mexicano del Seguro Social (IMSS)',
  ],
  schoolContextStats: [
    {
      label: 'Escolares de 5 a 11 años en México',
      value: '36.6 %',
      note: 'Prevalencia de sobrepeso u obesidad reportada en investigación nacional (Shamah-Levy y cols.).',
    },
    {
      label: 'Adolescentes de 12 a 19 años en México',
      value: '40.1 %',
      note: 'Prevalencia de sobrepeso u obesidad que respalda impulsar educación alimentaria en planteles.',
    },
    {
      label: 'Lineamientos escolares vigentes',
      value: '30 sep. 2024',
      note: 'Publicación en el Diario Oficial de la Federación sobre alimentos y bebidas en escuelas.',
    },
  ],
};

export const BIBLIOGRAPHIC_SOURCES: BibliographicSource[] = [
  {
    id: 'fuente-1',
    number: 1,
    shortOrg: 'OMS',
    authors: 'Organización Mundial de la Salud (OMS)',
    title: 'Malnutrición',
    publicationInfo: 'Portal oficial de notas descriptivas',
    publicationDate: 'Consultar fecha de actualización indicada en la página',
    consultationDate: '18 de noviembre de 2026',
    summary:
      'La malnutrición comprende las deficiencias, los excesos y los desequilibrios en la ingesta de energía y nutrientes de una persona. No se refiere únicamente a la falta de alimentos, sino también al consumo excesivo o desequilibrado de determinados nutrientes. Incluye la desnutrición (retraso del crecimiento, emaciación e insuficiencia ponderal), las deficiencias de vitaminas y minerales, y el sobrepeso y la obesidad.',
    highlights: [
      'La malnutrición puede afectar el crecimiento y desarrollo del organismo y aumentar el riesgo de enfermedades.',
      'El sobrepeso y la obesidad se relacionan con desequilibrios entre la energía consumida y utilizada, además de factores sociales, ambientales y biológicos.',
      'Una alimentación saludable debe ser variada y equilibrada, e incluir frutas, verduras, leguminosas y cereales integrales.',
    ],
  },
  {
    id: 'fuente-2',
    number: 2,
    shortOrg: 'UNICEF México',
    authors:
      'UNICEF México, Organización Panamericana de la Salud / OMS México, FAO México e Instituto Nacional de Salud Pública (INSP)',
    title: 'Recomendaciones para evitar la malnutrición en niñas, niños y adolescentes',
    publicationInfo: 'Documento técnico interinstitucional',
    publicationDate: 'Diciembre de 2020',
    consultationDate: '18 de noviembre de 2026',
    summary:
      'La alimentación durante la infancia y la adolescencia es fundamental porque el organismo necesita energía y nutrientes para crecer y desarrollarse. Los hábitos alimentarios formados en estos años influyen en la salud durante la vida adulta.',
    highlights: [
      'Una alimentación adecuada aporta variedad de nutrientes y debe estar acompañada de alimentos accesibles e información clara para las familias.',
      'La alimentación insuficiente o desequilibrada afecta el crecimiento, desarrollo y bienestar de niñas, niños y adolescentes.',
      'La educación alimentaria ayuda a que estudiantes y familias reconozcan la importancia de consumir alimentos variados y mantener hábitos saludables.',
    ],
  },
  {
    id: 'fuente-3',
    number: 3,
    shortOrg: 'Salud Pública de México',
    authors: 'Teresa Shamah-Levy y colaboradores',
    title:
      'Prevalencia nacional y estatal de sobrepeso y obesidad en escolares y adolescentes en México y factores asociados',
    publicationInfo: 'Revista Salud Pública de México',
    publicationDate: '2025 (según referencia del documento original)',
    consultationDate: '18 de noviembre de 2026',
    summary:
      'Las encuestas nacionales de salud permiten conocer las condiciones de nutrición de la población mexicana y analizar el panorama del sobrepeso y la obesidad en edad escolar y adolescente.',
    highlights: [
      'El 40.1 % de los adolescentes de 12 a 19 años y el 36.6 % de niñas y niños de 5 a 11 años presentaron sobrepeso u obesidad en los datos analizados.',
      'Las cifras nacionales muestran la relevancia de estudiar la alimentación escolar como prioridad de salud pública, considerando el contexto particular de cada escuela.',
    ],
  },
  {
    id: 'fuente-4',
    number: 4,
    shortOrg: 'IMSS',
    authors: 'Instituto Mexicano del Seguro Social (IMSS)',
    title: 'Salud en línea: orientación para el cuidado de la salud',
    publicationInfo: 'Portal institucional de orientación médica y nutricional',
    publicationDate: 'No especificada en el portal general',
    consultationDate: '18 de noviembre de 2026',
    summary:
      'La alimentación contribuye de forma directa al cuidado de la salud. Una dieta variada con alimentos de distintos grupos aporta proteínas, carbohidratos, grasas, vitaminas y minerales esenciales para el organismo.',
    highlights: [
      'Cada nutriente cumple una función específica: el hierro participa en el transporte de oxígeno y el calcio contribuye al mantenimiento de huesos y dientes.',
      'La orientación nutricional ayuda a identificar hábitos que pueden mejorarse y comprender el valor de una alimentación equilibrada.',
    ],
  },
  {
    id: 'fuente-5',
    number: 5,
    shortOrg: 'Diario Oficial (DOF)',
    authors: 'Secretaría de Educación Pública (SEP) y Secretaría de Salud',
    title:
      'Lineamientos generales para la preparación, distribución y expendio de alimentos y bebidas dentro de las escuelas del Sistema Educativo Nacional',
    publicationInfo: 'Diario Oficial de la Federación (DOF)',
    publicationDate: '30 de septiembre de 2024',
    consultationDate: '18 de noviembre de 2026',
    summary:
      'Establece disposiciones oficiales para promover una alimentación saludable dentro de las escuelas del Sistema Educativo Nacional y orientar a las comunidades educativas sobre la selección, preparación y distribución de alimentos.',
    highlights: [
      'Busca que los alimentos y bebidas disponibles en los planteles favorezcan la salud de los estudiantes.',
      'Reconoce a la escuela como un espacio clave para impulsar hábitos alimentarios saludables y el acceso a opciones adecuadas.',
    ],
  },
  {
    id: 'fuente-6',
    number: 6,
    shortOrg: 'UNICEF · UNESCO · PMA',
    authors: 'UNICEF, UNESCO y Programa Mundial de Alimentos',
    title: 'Listos para aprender y prosperar: salud y nutrición escolar en el mundo',
    publicationInfo: 'Informe internacional sobre salud y nutrición escolar',
    publicationDate: '2023',
    consultationDate: '18 de noviembre de 2026',
    summary:
      'La salud y la nutrición escolar son elementos fundamentales para el desarrollo y el aprendizaje de los estudiantes. En diversos países se combinan iniciativas de alimentación escolar y educación nutricional para fortalecer el bienestar estudiantil.',
    highlights: [
      'Los programas de alimentación escolar mejoran el acceso a alimentos saludables dentro de los centros educativos.',
      'Integrar alimentación nutritiva con educación alimentaria favorece la salud, el bienestar y el aprendizaje en la escuela.',
    ],
  },
];

export const FOOD_GROUPS: FoodGroupData[] = [
  {
    id: 'frutas-verduras',
    name: 'Frutas y verduras',
    description:
      'Aportan vitaminas, minerales, agua, fibra y compuestos protectores que ayudan al buen funcionamiento de tu cuerpo.',
    examples: ['Plátano', 'Naranja', 'Fresa', 'Piña', 'Zanahoria', 'Jitomate', 'Lechuga', 'Espinaca'],
    dailyTip: 'Elige las de temporada en tu mercado local: son más frescas, sabrosas y económicas.',
  },
  {
    id: 'cereales-tuberculos',
    name: 'Cereales y tubérculos',
    description:
      'Son la principal fuente de energía diaria para pensar, estudiar y moverte. Cuando son integrales conservan su fibra.',
    examples: ['Avena', 'Pan integral', 'Tortilla de maíz', 'Arroz', 'Papa', 'Camote'],
    dailyTip: 'Combinar cereales con leguminosas o verduras hace tus comidas mucho más completas.',
  },
  {
    id: 'proteinas-leguminosas',
    name: 'Alimentos de origen animal y leguminosas',
    description:
      'Proveen las proteínas necesarias para formar tejidos, músculos y defensas, además de minerales como hierro y zinc.',
    examples: ['Pollo', 'Huevo', 'Leche y yogur', 'Queso fresco', 'Frijoles', 'Lentejas', 'Garbanzos'],
    dailyTip: 'Las leguminosas (frijol, lenteja) son fuentes de proteína muy accesibles, duraderas y amigables con el planeta.',
  },
  {
    id: 'grasas-saludables',
    name: 'Grasas saludables y semillas',
    description:
      'Ayudan a absorber ciertas vitaminas (A, D, E, K), protegen las células y dan textura y saciedad a los alimentos.',
    examples: ['Aguacate', 'Cacahuate', 'Nueces', 'Semillas de girasol', 'Aceite de oliva o canola'],
    dailyTip: 'Unas rebanadas de aguacate o un puñito de semillas enriquecen fácilmente un sándwich o ensalada.',
  },
];

export const NUTRIENTS_LIST: NutrientCardData[] = [
  {
    id: 'carbohidratos',
    name: 'Carbohidratos',
    role: 'Energía principal para el cerebro, el sistema nervioso y los músculos activos.',
    everydayExample: 'Un tazón de avena o dos rebanadas de pan integral antes de clases te ayudan a mantener la atención.',
    foodSources: ['Avena', 'Maíz', 'Arroz', 'Pan integral', 'Plátano', 'Papa'],
    funFact: 'Tu cerebro representa solo ~2% de tu cuerpo, ¡pero consume cerca del 20% de tu energía diaria!',
  },
  {
    id: 'proteinas',
    name: 'Proteínas',
    role: 'Construyen y reparan células, músculos, piel, enzimas y anticuerpos.',
    everydayExample: 'El pollo del sándwich, el huevo del desayuno o unos frijoles con arroz aportan bloques constructores.',
    foodSources: ['Pollo', 'Huevo', 'Yogur griego', 'Leche', 'Frijoles', 'Lentejas', 'Garbanzos'],
    funFact: 'Al combinar una leguminosa (frijol) con un cereal (arroz o maíz) obtienes una proteína vegetal muy completa.',
  },
  {
    id: 'grasas',
    name: 'Grasas saludables',
    role: 'Reserva de energía, protección de órganos y transporte de vitaminas A, D, E y K.',
    everydayExample: 'El aguacate en el sándwich aporta cremosidad y grasas insaturadas benéficas.',
    foodSources: ['Aguacate', 'Cacahuates', 'Nueces', 'Chía', 'Aceite de oliva', 'Pescado'],
    funFact: 'Sin un poco de grasa en el plato, tu cuerpo no puede absorber bien las vitaminas de la zanahoria o la espinaca.',
  },
  {
    id: 'vitaminas',
    name: 'Vitaminas',
    role: 'Regulan cientos de reacciones químicas, apoyan tus defensas, la visión y la piel.',
    everydayExample: 'La vitamina C de la naranja y el limón ayuda además a absorber mejor el hierro de alimentos vegetales.',
    foodSources: ['Naranja', 'Limón', 'Fresa', 'Piña', 'Zanahoria', 'Espinaca'],
    funFact: 'La palabra vitamina viene de "vital" + "amina", porque son indispensables aunque se requieran en miligramos.',
  },
  {
    id: 'minerales',
    name: 'Minerales',
    role: 'Forman huesos fuertes (calcio), transportan oxígeno en sangre (hierro) y equilibran líquidos (potasio).',
    everydayExample: 'El calcio del yogur o la leche y el potasio del plátano trabajan junto a tus músculos.',
    foodSources: ['Leche', 'Yogur', 'Plátano', 'Frijoles', 'Verduras de hoja verde', 'Semillas'],
    funFact: 'El hierro vegetal de las lentejas se aprovecha mucho mejor cuando lo acompañas con unas gotas de limón.',
  },
  {
    id: 'fibra',
    name: 'Fibra',
    role: 'Cuida la salud digestiva, nutre la microbiota intestinal y evita subidas bruscas de azúcar.',
    everydayExample: 'Las hojuelas de avena y la fruta entera mantienen la fibra intacta.',
    foodSources: ['Avena', 'Pan integral', 'Frijoles', 'Manzana con cáscara', 'Fresa', 'Zanahoria'],
    funFact: 'La fibra no se digiere como tal, ¡pero alimenta a millones de bacterias amigas en tu intestino!',
  },
  {
    id: 'agua',
    name: 'Agua',
    role: 'Transporta nutrientes, regula la temperatura corporal y mantiene alerta tu concentración.',
    everydayExample: 'Tomar agua simple durante la jornada escolar previene dolor de cabeza y fatiga leve.',
    foodSources: ['Agua simple', 'Piña', 'Naranja', 'Lechuga', 'Jitomate', 'Sandía'],
    funFact: 'Incluso una deshidratación leve puede hacerte sentir cansado antes de que sientas mucha sed.',
  },
];

export const MYTHS_REALITIES: MythRealityItem[] = [
  {
    id: 'myth-1',
    myth: '¿Todos los carbohidratos son malos?',
    reality: 'Falso: son el combustible principal de tu cerebro.',
    explanation:
      'La diferencia está en el tipo y la compañía: la avena, las frutas, el maíz y el pan integral traen fibra, vitaminas y energía estable. No necesitas eliminarlos.',
  },
  {
    id: 'myth-2',
    myth: '¿Comer saludable significa gastar mucho dinero?',
    reality: 'Falso: los alimentos básicos y de temporada suelen ser los más accesibles.',
    explanation:
      'Avena, plátano, zanahoria, frijoles, lentejas, huevo y verduras locales cuestan mucho menos por porción que muchos productos ultraprocesados "light" o importados.',
  },
  {
    id: 'myth-3',
    myth: '¿Es necesario eliminar por completo los alimentos que nos gustan?',
    reality: 'Falso: prohibir suele generar ansiedad y culpa innecesaria.',
    explanation:
      'La alimentación es también convivencia, cultura y disfrute. Construir una base variada cotidiana deja espacio para disfrutar tus antojos con tranquilidad.',
  },
  {
    id: 'myth-4',
    myth: '¿Todos necesitamos comer exactamente lo mismo?',
    reality: 'Falso: cada persona tiene gustos, tiempos, recursos, cultura y necesidades distintas.',
    explanation:
      'Lo que funciona para tu compañero o para alguien en internet no tiene que ser idéntico a lo que funciona en tu casa. Por eso VITALIA se adapta a tu realidad.',
  },
];

export const FOOD_EXPERIMENTS: FoodExperiment[] = [
  {
    id: 'exp-1',
    title: '¿Por qué cambian de color el plátano o la manzana al cortarlos?',
    question: '¿Qué ocurre con el pardeamiento enzimático y cómo lo retrasa el limón?',
    materials: ['2 rodajas de plátano o manzana', 'Unas gotas de jugo de limón', '1 plato pequeño'],
    steps: [
      'Coloca dos rodajas de fruta recién cortada en un plato.',
      'Deja una rodaja sin nada y cubre la otra con unas gotas de jugo de limón.',
      'Observa ambos trozos después de 15 y 30 minutos.',
    ],
    scienceExplanation:
      'Al cortar la fruta, una enzima (polifenol oxidasa) reacciona con el oxígeno del aire y produce pigmentos oscuros. El ácido cítrico y la vitamina C del limón bajan el pH y frenan esa oxidación.',
    observationPrompt: '¿Notaste cómo el limón ayuda a conservar el color claro sin alterar la seguridad del alimento?',
  },
  {
    id: 'exp-2',
    title: '¿Cómo cambia la textura de la avena con humedad y calor?',
    question: '¿Por qué la masa de "Minguita feliz" se vuelve firme al hornearse?',
    materials: ['2 cucharadas de avena', '½ plátano machacado', 'Agua tibia (opcional para comparar)'],
    steps: [
      'Toca la avena seca y observa su dureza.',
      'Mézclala con el plátano machacado y deja reposar 5 minutos para que absorba humedad.',
      'Al hornear a 180 °C, el agua se evapora parcialmente y los almidones se gelatinizan formando estructura.',
    ],
    scienceExplanation:
      'La avena contiene fibra soluble (betaglucanos) y almidón que absorben el líquido del plátano formando una red suave que se consolida con el calor.',
    observationPrompt: 'Así entiendes por qué esperar 5 minutos antes de hornear mejora la cohesión de la galleta.',
  },
  {
    id: 'exp-3',
    title: 'Mezcla y emulsión rápida: el aderezo de yogur griego',
    question: '¿Qué pasa cuando combinamos yogur griego con jugo de limón y especias?',
    materials: ['2 cdas de yogur griego sin azúcar', '½ limón', 'Pizca de sal, pimienta y ajo'],
    steps: [
      'Observa la textura densa del yogur antes de mezclar.',
      'Agrega poco a poco el jugo de limón mientras revuelves.',
      'Nota cómo se vuelve más fluido, brillante y homogéneo.',
    ],
    scienceExplanation:
      'Las proteínas lácteas del yogur crean una matriz cremosa natural sin necesidad de aceites refinados en exceso ni conservadores industriales.',
    observationPrompt: '¡Una técnica sencilla de cocina aplicada directamente al sándwich del proyecto!',
  },
  {
    id: 'exp-4',
    title: 'Conservación natural: frío vs. temperatura ambiente',
    question: '¿Por qué los licuados deben tomarse recién hechos o mantenerse fríos?',
    materials: ['Observación comparativa de fruta fresca vs. licuado reposado'],
    steps: [
      'Observa un licuado de fresa recién licuado: es espumoso y homogéneo.',
      'Si queda en reposo al sol, las fases se separan y los microorganismos naturales se multiplican más rápido.',
      'Mantener en frío frena la actividad microbiana y conserva mejor sabor y vitaminas.',
    ],
    scienceExplanation:
      'Al licuar rompemos las paredes celulares de la fruta, liberando azúcares y agua disponibles. El frío ralentiza tanto la oxidación de vitamina C como el crecimiento bacteriano.',
    observationPrompt: 'Por eso en nuestras recetas "Nutrí sorbo" recomendamos servir al momento o usar hielo.',
  },
];

export const INITIAL_BIOTEC_PROJECTS: BiotecProject[] = [
  {
    id: 'bio-1',
    title: 'Película biodegradable experimental de cáscara de plátano',
    originMaterials: ['Cáscaras de plátano maduro', 'Agua destilada', 'Glicerina vegetal', 'Vinagre blanco', 'Almidón de maíz'],
    processSummary:
      'Lavado y triturado de cáscaras limpias, cocción controlada con almidón, agua, vinagre y glicerina como plastificante hasta espesar, seguido de secado en superficie lisa durante 48 horas.',
    observations:
      'Se obtuvo una lámina flexible de tono ámbar oscuro. Mantuvo flexibilidad al doblarse, aunque se ablandó al contacto directo prolongado con agua líquida.',
    possibleApplications: [
      'Láminas y películas biodegradables para proyectos escolares',
      'Prototipos de empaques secos experimentales',
      'Objetos decorativos o separadores de cuaderno',
    ],
    safetyDisclaimer:
      'Prototipo escolar de investigación y desarrollo. No es un envase certificado ni apto para comercialización directa sin pruebas de resistencia, migración, toxicidad y degradación.',
    isTeamPrototype: true,
  },
  {
    id: 'bio-2',
    title: 'Bioplástico cítrico con pectina de cáscara de naranja',
    originMaterials: ['Cáscaras de naranja del proyecto Nutrí sorbo', 'Agua', 'Glicerina', 'Ácido cítrico natural'],
    processSummary:
      'Extracción térmica sencilla de pectina de la parte blanca y cáscara de naranja, mezcla con plastificante y moldeado en lámina delgada.',
    observations:
      'Aroma cítrico agradable y textura semitranslúcida más rígida que la muestra de plátano; requiere cuidado al desmoldar para evitar grietas.',
    possibleApplications: [
      'Bolsas experimentales de demostración',
      'Materiales didácticos sobre economía circular',
      'Empaques secos experimentales de un solo proyecto',
    ],
    safetyDisclaimer:
      'Material en fase experimental educativa. No todos los bioplásticos se degradan igual ni en el mismo tiempo; depende de humedad, temperatura y composta.',
    isTeamPrototype: true,
  },
  {
    id: 'bio-3',
    title: 'Prototipo de fibra y papel artesanal con bagazo de piña y zanahoria',
    originMaterials: ['Bagazo fibroso de piña', 'Restos de zanahoria', 'Agua', 'Tamiz escolar'],
    processSummary:
      'Lavado del bagazo residual de jugos, licuado con abundante agua para suspender fibras celulósicas, prensado en bastidor con malla y secado al sol.',
    observations:
      'Generó hojas texturizadas resistentes ideales para tarjetas informativas con códigos QR de exposición escolar.',
    possibleApplications: [
      'Tarjetas con códigos QR para carteles escolares',
      'Materiales artísticos y maquetas',
      'Exploración de fibras para prototipos textiles experimentales',
    ],
    safetyDisclaimer:
      'Uso demostrativo y escolar; cualquier aplicación textil o alimentaria requiere pruebas mecánicas y sanitarias adicionales.',
    isTeamPrototype: true,
  },
];

export const BIOTEC_APPLICATIONS_CATALOG = [
  {
    title: 'Bolsas experimentales',
    detail: 'Pruebas de carga ligera a partir de almidón y biopolímeros de cáscaras vegetales.',
  },
  {
    title: 'Láminas y películas biodegradables',
    detail: 'Películas delgadas obtenidas por secado en bandeja para estudiar elasticidad y humedad.',
  },
  {
    title: 'Empaques experimentales',
    detail: 'Prototipos rígidos o flexibles pensados para objetos secos en ferias científicas.',
  },
  {
    title: 'Objetos decorativos y escolares',
    detail: 'Separadores, placas de exhibición y piezas moldeadas con pigmentos naturales.',
  },
  {
    title: 'Prototipos de textiles experimentales',
    detail: 'Investigación inicial de fibras vegetales (como hoja/cáscara de piña) hacia telas alternativas.',
  },
];

export const ECO_CHALLENGES: EcologicalChallenge[] = [
  {
    id: 'eco-chal-1',
    title: 'Clasifica los residuos después de preparar Nutrí sorbo y Minguita feliz',
    prompt: 'Decide qué destino le darías a cada residuo en el laboratorio escolar:',
    items: [
      {
        id: 'i1',
        label: 'Cáscaras de plátano maduro',
        category: 'organico_aprovechable',
        hint: 'Contienen almidón y fibras ideales para bioplástico experimental o composta.',
      },
      {
        id: 'i2',
        label: 'Cáscaras de naranja exprimida',
        category: 'organico_aprovechable',
        hint: 'Ricas en pectina y aceites esenciales para experimentos BIOTEC.',
      },
      {
        id: 'i3',
        label: 'Botella de vidrio limpia',
        category: 'inorganico_reciclable',
        hint: 'Residuo inorgánico 100% reciclable si se separa limpio.',
      },
      {
        id: 'i4',
        label: 'Bagazo de zanahoria',
        category: 'organico_aprovechable',
        hint: 'Aprovechable en repostería o como fibra vegetal en papel artesanal/composta.',
      },
    ],
  },
];

export const MOVEMENT_ACTIVITIES: MovementActivity[] = [
  {
    id: 'mov-1',
    title: 'Baile libre de 3 canciones',
    category: 'baile',
    duration: '10 min',
    adaptability: 'Sin equipo · En tu cuarto o patio',
    description:
      'Pon tres canciones que te gusten y muévete a tu propio ritmo. No importa la coreografía, sino disfrutar la música.',
    steps: [
      'Canción 1: mueve hombros, brazos y camina al ritmo para entrar en calor.',
      'Canción 2: sube un poco la energía saltando suave o marcando pasos.',
      'Canción 3: baja el ritmo con movimientos amplios y respira hondo al terminar.',
    ],
    bodyFocus: 'Coordinación, ritmo cardíaco alegre y liberación de tensión.',
  },
  {
    id: 'mov-2',
    title: 'Caminata exploradora con pausas',
    category: 'caminata',
    duration: '15–20 min',
    adaptability: 'Apto para cualquier nivel · Individual o con amigos',
    description:
      'Sal a caminar observando detalles nuevos de tu entorno o recorriendo el patio escolar sin prisa ni cronómetro competitivo.',
    steps: [
      'Camina 5 minutos a paso cómodo dejando los hombros relajados.',
      'Acelera ligeramente 5 minutos manteniendo respiración cómoda para platicar.',
      'Camina los últimos 5 minutos más lento para recuperarte.',
    ],
    bodyFocus: 'Resistencia suave, articulaciones de cadera/rodillas y despeje mental.',
  },
  {
    id: 'mov-3',
    title: 'Pausa de movilidad anti-mochila',
    category: 'movilidad',
    duration: '5 min',
    adaptability: 'De pie o sentado · Ideal tras estudiar',
    description:
      'Rutina suave para liberar cuello, espalda y muñecas después de cargar mochila o estar frente a la pantalla.',
    steps: [
      'Círculos lentos de hombros hacia atrás (8 repeticiones).',
      'Estiramiento suave de cuello inclinando oreja hacia el hombro (15 seg por lado).',
      'Giro suave de tronco sentado o de pie y sacudida relajada de manos.',
    ],
    bodyFocus: 'Columna, articulaciones de hombros y postura cómoda.',
  },
  {
    id: 'mov-4',
    title: 'Reto de equilibrio y coordinación',
    category: 'juegos',
    duration: '8 min',
    adaptability: 'En equipo o individual · Espacio pequeño',
    description:
      'Pequeños juegos para desafiar tu equilibrio y coordinación sin competencias físicas.',
    steps: [
      'Sostente sobre un pie 15 segundos mientras dibujas un círculo imaginario con una mano.',
      'Cambia de pie e intenta pasar un objeto ligero de una mano a otra.',
      'Camina sobre una línea recta imaginaria talón con punta.',
    ],
    bodyFocus: 'Equilibrio, tobillos, concentración motora y reflejos.',
  },
  {
    id: 'mov-5',
    title: 'Circuito suave de fuerza funcional',
    category: 'ejercicios',
    duration: '12 min',
    adaptability: 'Adaptable a tu ritmo · Descansa cuando necesites',
    description:
      'Movimientos cotidianos que ayudan a tus músculos y huesos a mantenerse fuertes para cargar libros o jugar.',
    steps: [
      '10 sentadillas cómodas apoyándote cerca de una silla si lo prefieres.',
      '8 flexiones inclinadas apoyando manos en una pared firme.',
      '20 segundos de elevación alternada de rodillas al paso.',
      'Repite 2 veces descansando 1 minuto entre rondas y toma agua.',
    ],
    bodyFocus: 'Piernas, brazos, estabilidad central y salud ósea.',
  },
];

export const BODY_EDUCATION_TOPICS = [
  {
    id: 'musculos',
    title: 'Músculos',
    summary: 'Te permiten moverte, sostener tu postura y generar calor corporal.',
    detail:
      'Funcionan contrayéndose y relajándose como ligas inteligentes. Necesitan movimiento variado, proteína suficiente y tiempo de descanso para recuperarse.',
  },
  {
    id: 'huesos',
    title: 'Huesos',
    summary: 'El armazón vivo que protege tus órganos y crece durante la adolescencia.',
    detail:
      'Aunque parecen rígidos, son tejido vivo que se fortalece con movimientos de impacto suave (caminar, saltar, bailar) y minerales como calcio y vitamina D.',
  },
  {
    id: 'articulaciones',
    title: 'Articulaciones',
    summary: 'Puntos de unión como rodillas, hombros y muñecas que permiten doblar y girar.',
    detail:
      'El movimiento suave lubrica las articulaciones con líquido sinovial. Calentar antes de moverte fuerte las cuida mejor.',
  },
  {
    id: 'equilibrio-recuperacion',
    title: 'Coordinación y recuperación',
    summary: 'Tu cerebro y músculos aprenden juntos cada movimiento, y crecen cuando descansas.',
    detail:
      'Descansar entre días activos no es flojera: es parte indispensable para evitar molestias y mejorar tu coordinación.',
  },
];

export const EMOTION_RESPONSES: Record<
  string,
  { label: string; color: string; message: string; suggestion: string }
> = {
  alegria: {
    label: 'Alegría',
    color: 'emerald',
    message:
      '¡Qué gusto saber que hoy te sientes alegre! Aprovecha esa buena energía para compartir un momento con tus amigos o explorar una misión nueva.',
    suggestion: '¿Qué te hizo sonreír hoy? Anótalo en "Conócete mejor" para recordarlo en días nublados.',
  },
  tranquilidad: {
    label: 'Tranquilidad',
    color: 'sky',
    message:
      'Sentir calma es un gran espacio para aprender a tu ritmo, leer con curiosidad o preparar algo rico sin prisas.',
    suggestion: 'Disfruta de este estado y cuida tus pausas para mantener tu equilibrio.',
  },
  preocupacion: {
    label: 'Preocupación',
    color: 'amber',
    message:
      'Es normal sentirse preocupado cuando hay tareas, exámenes o cambios. No tienes que resolverlo todo en este minuto.',
    suggestion:
      'Prueba una pausa de respiración 4-4-4 aquí abajo y, si la preocupación persiste, platícalo con un familiar, docente o persona adulta de confianza.',
  },
  cansancio: {
    label: 'Cansancio',
    color: 'indigo',
    message:
      'Tu cuerpo y tu mente te están pidiendo un respiro. Descansar también forma parte de cuidarte.',
    suggestion:
      'Toma un vaso de agua, aléjate un momento de las pantallas y date permiso de bajar el ritmo hoy.',
  },
  frustracion: {
    label: 'Frustración',
    color: 'orange',
    message:
      'Cuando algo no sale como esperabas, la frustración aparece. Recuerda: no tienes que hacerlo todo perfecto para aprender algo nuevo.',
    suggestion:
      'Haz una pausa breve, estira los hombros y vuelve cuando te sientas más despejado.',
  },
  tristeza: {
    label: 'Tristeza',
    color: 'violet',
    message:
      'Gracias por ser honesto contigo mismo. Sentir tristeza también es válido y no significa debilidad.',
    suggestion:
      'Si llevas varios días sintiéndote así o necesitas ser escuchado, busca apoyo con una persona adulta de confianza (mamá, papá, docente u orientador escolar). No estás solo.',
  },
};

export const VITA_WELLBEING_MESSAGES = [
  '«No tienes que hacerlo todo perfecto para aprender algo nuevo».',
  '«Cada persona tiene circunstancias diferentes. Encuentra hábitos que puedan funcionar en tu vida».',
  '«Descansar también forma parte de cuidarte».',
  '«Tu valor no se mide por un número en la báscula ni por parecerte a nadie más».',
  '«Pequeños hábitos sostenibles valen mucho más que metas extremas de un solo día».',
];

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'g-proteina',
    term: 'Proteína',
    category: 'Nutrientes',
    definition:
      'Nutriente formado por aminoácidos que construye y repara músculos, tejidos, enzimas y defensas del cuerpo.',
    example: 'Presente en pollo, huevo, yogur, frijoles y lentejas.',
  },
  {
    id: 'g-fibra',
    term: 'Fibra',
    category: 'Nutrientes',
    definition:
      'Parte de los alimentos vegetales que el cuerpo no digiere por completo; ayuda a la digestión y nutre bacterias benéficas.',
    example: 'Se encuentra en avena, frutas enteras, verduras y pan integral.',
  },
  {
    id: 'g-vitamina',
    term: 'Vitamina',
    category: 'Nutrientes',
    definition:
      'Micronutriente necesario en pequeñas cantidades para procesos vitales como visión, defensas y producción de energía.',
    example: 'Vitamina C en naranja y limón; betacarotenos en zanahoria.',
  },
  {
    id: 'g-metabolismo',
    term: 'Metabolismo',
    category: 'Alimentación',
    definition:
      'Conjunto de reacciones químicas dentro de tus células que transforman los alimentos en energía y estructuras para vivir.',
    example: 'Funciona las 24 horas: al pensar en clase, caminar e incluso al dormir.',
  },
  {
    id: 'g-bioplastico',
    term: 'Bioplástico',
    category: 'BIOTEC',
    definition:
      'Material plástico derivado parcial o totalmente de fuentes biológicas (como almidón o celulosa), o diseñado para biodegradarse bajo condiciones específicas.',
    example: 'Láminas experimentales hechas en BIOTEC con cáscaras de plátano o naranja.',
  },
  {
    id: 'g-residuos',
    term: 'Residuos orgánicos',
    category: 'BIOTEC',
    definition:
      'Restos de origen biológico como cáscaras, semillas, bagazo y restos vegetales que pueden compostarse o investigarse como materia prima.',
    example: 'Cáscaras de naranja tras preparar el jugo Nutrí sorbo.',
  },
  {
    id: 'g-sostenibilidad',
    term: 'Sostenibilidad',
    category: 'BIOTEC',
    definition:
      'Forma de satisfacer nuestras necesidades actuales cuidando los recursos naturales y evitando desperdicios para las futuras generaciones.',
    example: 'Usar termos reutilizables y aprovechar por completo frutas de temporada.',
  },
  {
    id: 'g-autocuidado',
    term: 'Autocuidado',
    category: 'Bienestar',
    definition:
      'Acciones cotidianas y realistas que realizas para cuidar tu cuerpo, descanso, emociones y entorno sin comparaciones ni castigos.',
    example: 'Dormir lo suficiente, hidratarte y pedir ayuda cuando te sientes abrumado.',
  },
];

export const FOOD_SEARCH_ITEMS: FoodSearchItem[] = [
  {
    id: 'fs-platano',
    name: 'Plátano',
    group: 'Frutas y verduras',
    mainNutrients: ['Carbohidratos naturales', 'Potasio', 'Vitamina B6', 'Fibra'],
    characteristics: 'Económico, fácil de llevar en la mochila y más dulce conforme madura.',
    prepIdeas: ['Galletas Minguita feliz', 'Licuado de plátano Nutrí sorbo', 'En rodajas con avena'],
    residueIdea: 'Su cáscara contiene almidón y fibra útiles en prototipos de bioplástico BIOTEC o composta.',
  },
  {
    id: 'fs-avena',
    name: 'Avena',
    group: 'Cereales y tubérculos',
    mainNutrients: ['Carbohidratos complejos', 'Fibra soluble (betaglucanos)', 'Proteína vegetal', 'Hierro'],
    characteristics: 'Cereal versátil, muy rendidor y económico que aporta energía gradual.',
    prepIdeas: ['Galletas Minguita feliz', 'Licuado de fresa o plátano', 'Avena cocida con canela y fruta'],
    residueIdea: 'Puedes aprovecharla por completo sin generar residuos.',
  },
  {
    id: 'fs-naranja',
    name: 'Naranja',
    group: 'Frutas y verduras',
    mainNutrients: ['Vitamina C', 'Agua', 'Fibra (en gajos)', 'Folatos'],
    characteristics: 'Cítrico refrescante que mejora la absorción del hierro vegetal.',
    prepIdeas: ['Jugo natural de naranja y zanahoria Nutrí sorbo', 'Gajos frescos como colación'],
    residueIdea: 'Sus cáscaras ricas en pectina y aceites esenciales se investigan en BIOTEC.',
  },
  {
    id: 'fs-pollo',
    name: 'Pechuga de pollo',
    group: 'Alimentos de origen animal y leguminosas',
    mainNutrients: ['Proteína de alta calidad', 'Vitaminas del complejo B (B3, B6)', 'Fósforo'],
    characteristics: 'Versátil, fácil de sazonar y combinar con verduras frescas y pan integral.',
    prepIdeas: ['Sándwich de pollo con aderezo fit', 'Tacos de pollo asado con verduras'],
    residueIdea: 'Cocinar exactamente la porción necesaria evita desperdicio de alimentos.',
  },
  {
    id: 'fs-fresa',
    name: 'Fresa',
    group: 'Frutas y verduras',
    mainNutrients: ['Vitamina C', 'Antioxidantes (antocianinas)', 'Fibra', 'Agua'],
    characteristics: 'Importante lavar y desinfectar muy bien antes de consumir o licuar.',
    prepIdeas: ['Licuado de fresa Nutrí sorbo', 'Con yogur natural y avena'],
    residueIdea: 'Las hojitas verdes superiores pueden ir directamente a composta escolar.',
  },
  {
    id: 'fs-yogur',
    name: 'Yogur griego sin azúcar',
    group: 'Alimentos de origen animal y leguminosas',
    mainNutrients: ['Proteína', 'Calcio', 'Probióticos naturales', 'Vitamina B12'],
    characteristics: 'Textura cremosa ideal tanto para opciones dulces con fruta como aderezos salados.',
    prepIdeas: ['Aderezo fit con limón para sándwich', 'Tazón con fruta fresca y avena'],
    residueIdea: 'Reutiliza o recicla limpio el envase plástico tras enjuagarlo.',
  },
  {
    id: 'fs-zanahoria',
    name: 'Zanahoria',
    group: 'Frutas y verduras',
    mainNutrients: ['Betacarotenos (Vitamina A)', 'Fibra', 'Agua', 'Potasio'],
    characteristics: 'Crujiente, económica y dulce de forma natural tanto cruda como cocida.',
    prepIdeas: ['Jugo de naranja y zanahoria', 'Bastones con limón', 'Rallada en ensalada'],
    residueIdea: 'El bagazo sobrante de jugos sirve para panqués caseros o papel artesanal BIOTEC.',
  },
  {
    id: 'fs-aguacate',
    name: 'Aguacate',
    group: 'Grasas saludables y semillas',
    mainNutrients: ['Grasas monoinsaturadas', 'Fibra', 'Potasio', 'Vitamina E'],
    characteristics: 'Ayuda a absorber vitaminas de las verduras de tu plato y da cremosidad natural.',
    prepIdeas: ['Sándwich de pollo', 'Tostadas de frijoles con aguacate'],
    residueIdea: 'La cáscara es compostable y la semilla se estudia por sus pigmentos y almidones naturales.',
  },
];

export const DAILY_FUN_FACTS = [
  '¿Sabías que una taza de fresas aporta más vitamina C por porción de lo que muchos imaginan, además de antioxidantes naturales?',
  'El color naranja de la zanahoria se debe a los betacarotenos, que tu cuerpo transforma en vitamina A para cuidar tu vista y piel.',
  'Las cáscaras de plátano contienen almidón y celulosa que estudiantes investigan en BIOTEC para crear láminas biodegradables experimentales.',
  'Dormir bien ayuda a que tu cerebro consolide lo que estudiaste en clase y regule mejor tus emociones del día siguiente.',
  'Combinar frijoles con tortilla de maíz o arroz forma una proteína vegetal muy completa que ha alimentado culturas enteras por siglos.',
  'Según la OMS, la malnutrición no solo es falta de alimentos: también incluye deficiencias de vitaminas o desequilibrios en lo que comemos cada día.',
  'De acuerdo con el IMSS, el hierro ayuda a transportar oxígeno por todo tu cuerpo, mientras que el calcio fortalece huesos y dientes.',
  'Los lineamientos escolares de la SEP y la Secretaría de Salud (2024) impulsan que en las escuelas haya alimentos y bebidas saludables accesibles para todos.',
];

export const SURPRISE_CHALLENGES = [
  {
    id: 'sc-1',
    question: '¿Por qué es recomendable lavar y desinfectar las fresas justo antes de licuarlas y no días antes?',
    options: [
      'Porque el exceso de humedad en refrigeración acelera que se ablanden o desarrollen moho',
      'Porque pierden su color rojo inmediatamente al tocar agua',
      'Porque así cambian de sabor a plátano',
    ],
    correctIndex: 0,
    explanation: 'Lavarlas justo antes de usarlas mantiene su textura firme y las conserva frescas por más días en el refrigerador.',
  },
  {
    id: 'sc-2',
    question: 'En la receta del sándwich de pollo VITALIA, ¿qué aporta el limón en el aderezo de yogur griego?',
    options: [
      'Sabor fresco ácido y un toque de vitamina C sin necesidad de conservadores',
      'Colorante azul artificial',
      'Más de 100 gramos de proteína por gota',
    ],
    correctIndex: 0,
    explanation: 'El limón realza sabores de forma natural, lo que permite usar menos sal y lograr un aderezo ligero y rico.',
  },
  {
    id: 'sc-3',
    question: '¿Cuál afirmación sobre los bioplásticos es científicamente correcta?',
    options: [
      'No todos se degradan igual: depende de sus ingredientes y de condiciones como humedad y microorganismos',
      'Cualquier objeto verde en la tienda es 100% biodegradable en una hora',
      'Solo se pueden hacer con plástico reciclado de botellas',
    ],
    correctIndex: 0,
    explanation: 'En BIOTEC aprendemos ciencia real: cada material requiere condiciones y pruebas específicas para validar su degradación y seguridad.',
  },
];

export const BADGES_LIST: Badge[] = [
  {
    id: 'badge-detective',
    name: 'Detective de alimentos',
    description: 'Completaste las primeras investigaciones del Jardín de los Descubrimientos.',
    conditionText: 'Completa al menos 2 misiones del Mundo 1',
    accessoryReward: 'lupa',
    accessoryName: 'Lupa de detective',
    checkUnlocked: (p) =>
      p.completedMissions.filter((id) => id.startsWith('m1-')).length >= 2,
  },
  {
    id: 'badge-nutrientes',
    name: 'Explorador de nutrientes',
    description: 'Descubriste cómo trabajan en equipo carbohidratos, proteínas, vitaminas y fibra.',
    conditionText: 'Completa al menos 2 misiones del Mundo 2',
    accessoryReward: 'bata',
    accessoryName: 'Bata de laboratorio',
    checkUnlocked: (p) =>
      p.completedMissions.filter((id) => id.startsWith('m2-')).length >= 2,
  },
  {
    id: 'badge-etiquetas',
    name: 'Maestro de las etiquetas',
    description: 'Resolviste el reto de leer ingredientes reales en los empaques.',
    conditionText: 'Completa la misión "Detectives de etiquetas"',
    accessoryReward: 'mochila',
    accessoryName: 'Mochila de explorador',
    checkUnlocked: (p) => p.completedMissions.includes('m1-4'),
  },
  {
    id: 'badge-recetas',
    name: 'Creador de recetas',
    description: 'Exploraste el Laboratorio de alimentos o el Recetario VITALIA.',
    conditionText: 'Descubre 3 recetas o combinaciones del laboratorio',
    accessoryReward: 'gorro',
    accessoryName: 'Gorro de CHEFIA',
    checkUnlocked: (p) =>
      p.unlockedDiscoveries.filter((d) => d.startsWith('rec-') || d.startsWith('lab-')).length >= 2,
  },
  {
    id: 'badge-planeta',
    name: 'Guardián del planeta',
    description: 'Investigaste cómo transformar residuos orgánicos en nuevos materiales.',
    conditionText: 'Completa al menos 2 misiones del Mundo 5 o retos BIOTEC',
    accessoryReward: 'hoja_dorada',
    accessoryName: 'Hoja Dorada BIOTEC',
    checkUnlocked: (p) =>
      p.completedMissions.filter((id) => id.startsWith('m5-')).length >= 2 ||
      p.unlockedDiscoveries.some((d) => d.startsWith('biotec-')),
  },
  {
    id: 'badge-bienestar',
    name: 'Explorador del bienestar',
    description: 'Dedicaste un momento al descanso, la respiración o el registro emocional.',
    conditionText: 'Completa una misión del Mundo 4 o haz un registro en Bienestar',
    checkUnlocked: (p) =>
      p.completedMissions.some((id) => id.startsWith('m4-')) || p.wellbeingLogs.length >= 1,
  },
];

export const ACCESSORY_LABELS: Record<string, string> = {
  ninguno: 'Sin accesorio',
  lupa: 'Lupa de detective',
  bata: 'Bata de laboratorio',
  mochila: 'Mochila de explorador',
  gorro: 'Gorro de chef',
  hoja_dorada: 'Hoja dorada BIOTEC',
};
