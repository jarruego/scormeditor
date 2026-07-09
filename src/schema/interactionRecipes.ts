import type { Interaction, InteractionType } from './course.schema'

/**
 * Catálogo declarativo de los tipos de interacción, hermano de
 * `screenRecipes.ts`: una entrada por tipo con el grupo didáctico, la
 * descripción «qué hace el alumno», si tiene corrección real (`gradable`),
 * si el runtime respeta el campo `attempts` (`supportsAttempts`) y el estado
 * inicial útil (`seed`). Es una capa de UI: no toca el esquema ni el contrato
 * de `course.json`. Las etiquetas en español siguen viviendo en `labels.ts`
 * (única fuente; aquí no se duplican).
 *
 * - `gradable`: el tipo produce acierto/error de verdad y puede puntuar. Los
 *   exploratorios (acordeón, pestañas…) devuelven siempre `scored: false` en
 *   el runtime y los validadores avisan de los casos absurdos (`FC_SCORED`,
 *   `BA_SCORED`, `EMBED_SCORED`, `PR_SCORED`).
 * - `supportsAttempts`: tipos cuyo factory del runtime pasa por `attemptsOf`
 *   (botón Comprobar con límite de intentos). El resto ignora el campo.
 * - `family`: tipos que comparten shape de datos y pueden migrar contenido
 *   entre sí al cambiar el tipo (lo usa `changeInteractionType`).
 */

export type InteractionGroup =
  | 'presentar' // el alumno explora contenido
  | 'preguntar' // el alumno responde y recibe corrección
  | 'manipular' // el alumno ordena, empareja o clasifica
  | 'juegos' // dinámicas lúdicas con corrección
  | 'media' // vídeo
  | 'avanzado' // código a medida y paneles

export const INTERACTION_GROUPS: InteractionGroup[] = [
  'presentar',
  'preguntar',
  'manipular',
  'juegos',
  'media',
  'avanzado',
]

export const INTERACTION_GROUP_LABELS: Record<InteractionGroup, string> = {
  presentar: 'Presentar contenido',
  preguntar: 'Preguntar',
  manipular: 'Manipular',
  juegos: 'Juegos didácticos',
  media: 'Vídeo',
  avanzado: 'Avanzado',
}

/** Subtítulo del grupo: comunica qué hace el alumno (tono de screenRecipes). */
export const INTERACTION_GROUP_HINTS: Record<InteractionGroup, string> = {
  presentar: 'El alumno explora: abre, gira o compara. No hay respuestas.',
  preguntar: 'El alumno responde y recibe corrección.',
  manipular: 'El alumno ordena, empareja o clasifica elementos.',
  juegos: 'Dinámicas lúdicas con corrección automática.',
  media: 'El alumno ve un vídeo, con preguntas opcionales que lo pausan.',
  avanzado: 'Piezas especiales: código a medida y paneles.',
}

/** Familias de datos compatibles para migrar contenido al cambiar de tipo. */
export type InteractionFamily = 'options' | 'cards' | 'titled-items' | 'questions'

export type InteractionRecipe = {
  type: InteractionType
  icon: string
  /** «Qué hace el alumno», una línea (tono de screenRecipes). */
  description: string
  group: InteractionGroup
  /** Tiene corrección real → puede puntuar (checkbox Evaluable). */
  gradable: boolean
  /** El runtime respeta `attempts` (botón Comprobar con límite). */
  supportsAttempts: boolean
  family?: InteractionFamily
  /** Estado inicial útil (opciones/config) al crear o llegar sin contenido. */
  seed?: () => Partial<Pick<Interaction, 'options' | 'config'>>
}

const oid = () => `o-${Math.random().toString(36).slice(2, 7)}`

export const INTERACTION_RECIPES: InteractionRecipe[] = [
  // ---- Presentar contenido -------------------------------------------------
  {
    type: 'accordion',
    icon: '🪗',
    description: 'Despliega apartados uno a uno para leer su contenido.',
    group: 'presentar',
    gradable: false,
    supportsAttempts: false,
    family: 'titled-items',
  },
  {
    type: 'tabs',
    icon: '🗂️',
    description: 'Cambia entre pestañas para ver cada bloque de contenido.',
    group: 'presentar',
    gradable: false,
    supportsAttempts: false,
    family: 'titled-items',
  },
  {
    type: 'flip_cards',
    icon: '🎴',
    description: 'Gira tarjetas para descubrir el contenido del reverso.',
    group: 'presentar',
    gradable: false,
    supportsAttempts: false,
    family: 'cards',
  },
  {
    type: 'timeline',
    icon: '📅',
    description: 'Recorre hitos en orden y despliega el detalle de cada uno.',
    group: 'presentar',
    gradable: false,
    supportsAttempts: false,
  },
  {
    type: 'image_cards',
    icon: '🖼️',
    description: 'Abre tarjetas con imagen que muestran su texto en una ventana.',
    group: 'presentar',
    gradable: false,
    supportsAttempts: false,
  },
  {
    type: 'before_after',
    icon: '↔️',
    description: 'Desliza un divisor para comparar dos imágenes superpuestas.',
    group: 'presentar',
    gradable: false,
    supportsAttempts: false,
  },
  {
    type: 'hotspots',
    icon: '🎯',
    description: 'Pulsa zonas de una imagen para explorarla (puede puntuar).',
    group: 'presentar',
    gradable: true,
    supportsAttempts: false,
  },

  // ---- Preguntar -----------------------------------------------------------
  {
    type: 'single_choice',
    icon: '☑️',
    description: 'Elige la respuesta correcta entre varias opciones.',
    group: 'preguntar',
    gradable: true,
    supportsAttempts: true,
    family: 'options',
    seed: () => ({
      options: [
        { id: oid(), text: '', correct: true },
        { id: oid(), text: '' },
      ],
    }),
  },
  {
    type: 'true_false',
    icon: '⚖️',
    description: 'Decide si la afirmación es verdadera o falsa.',
    group: 'preguntar',
    gradable: true,
    supportsAttempts: true,
    family: 'options',
    seed: () => ({
      options: [
        { id: oid(), text: 'Verdadero', correct: true },
        { id: oid(), text: 'Falso' },
      ],
    }),
  },
  {
    type: 'scenario_decision',
    icon: '🎭',
    description: 'Lee una situación y decide qué haría; cada decisión tiene su feedback.',
    group: 'preguntar',
    gradable: true,
    supportsAttempts: false,
    family: 'options',
  },
  {
    type: 'fill_blanks',
    icon: '✍️',
    description: 'Completa los huecos del texto eligiendo la palabra correcta.',
    group: 'preguntar',
    gradable: true,
    supportsAttempts: true,
  },
  {
    type: 'case_practice',
    icon: '📋',
    description: 'Reflexiona sobre un caso y se autoevalúa con una rúbrica.',
    group: 'preguntar',
    gradable: false,
    supportsAttempts: false,
  },

  // ---- Manipular -----------------------------------------------------------
  {
    type: 'sort_steps',
    icon: '🔢',
    description: 'Arrastra los pasos hasta dejarlos en el orden correcto.',
    group: 'manipular',
    gradable: true,
    supportsAttempts: true,
  },
  {
    type: 'match_pairs',
    icon: '🔗',
    description: 'Empareja cada elemento con el que le corresponde.',
    group: 'manipular',
    gradable: true,
    supportsAttempts: true,
  },
  {
    type: 'classification',
    icon: '🗃️',
    description: 'Coloca cada elemento en su categoría.',
    group: 'manipular',
    gradable: true,
    supportsAttempts: true,
  },

  // ---- Juegos didácticos ---------------------------------------------------
  {
    type: 'word_search',
    icon: '🔎',
    description: 'Encuentra las palabras ocultas en la sopa de letras.',
    group: 'juegos',
    gradable: true,
    supportsAttempts: false,
  },
  {
    type: 'crossword',
    icon: '✏️',
    description: 'Rellena el crucigrama a partir de las pistas.',
    group: 'juegos',
    gradable: true,
    supportsAttempts: true,
  },
  {
    type: 'az_quiz',
    icon: '🅰️',
    description: 'Responde una definición por letra, como en el pasapalabra.',
    group: 'juegos',
    gradable: true,
    supportsAttempts: false,
  },
  {
    type: 'hidden_image',
    icon: '🕵️',
    description: 'Destapa una imagen oculta acertando preguntas.',
    group: 'juegos',
    gradable: true,
    supportsAttempts: false,
    family: 'questions',
  },
  {
    type: 'puzzle',
    icon: '🧩',
    description: 'Recompone la imagen intercambiando piezas.',
    group: 'juegos',
    gradable: true,
    supportsAttempts: false,
    seed: () => ({ config: { cols: 3, rows: 3 } }),
  },
  {
    type: 'flashcards',
    icon: '🔁',
    description: 'Se autoevalúa: intenta responder cada tarjeta y comprueba al girarla.',
    group: 'juegos',
    gradable: false,
    supportsAttempts: false,
    family: 'cards',
  },

  // ---- Vídeo ---------------------------------------------------------------
  {
    type: 'video',
    icon: '🎬',
    description: 'Ve un vídeo; con preguntas, se pausa y pregunta en el momento indicado.',
    group: 'media',
    gradable: true,
    supportsAttempts: false,
    family: 'questions',
  },

  // ---- Avanzado ------------------------------------------------------------
  {
    type: 'html_embed',
    icon: '💻',
    description: 'Interactivo HTML/CSS/JS a medida, aislado en un sandbox.',
    group: 'avanzado',
    gradable: false,
    supportsAttempts: false,
  },
  {
    type: 'progress_report',
    icon: '📊',
    description: 'Consulta su avance y su nota en un panel que se actualiza solo.',
    group: 'avanzado',
    gradable: false,
    supportsAttempts: false,
  },
]

const BY_TYPE = new Map(INTERACTION_RECIPES.map((r) => [r.type, r]))

/** Receta del tipo; para tipos futuros sin entrada, un fallback permisivo. */
export function interactionRecipe(type: string): InteractionRecipe {
  return (
    BY_TYPE.get(type as InteractionType) ?? {
      type: type as InteractionType,
      icon: '🧩',
      description: '',
      group: 'avanzado',
      gradable: true,
      supportsAttempts: true,
    }
  )
}

// ---- Cambio de tipo: contenido y migración ----------------------------------

/** ¿Hay algún texto no vacío en el valor (recorrido profundo)? */
const hasText = (v: unknown): boolean =>
  Array.isArray(v)
    ? v.some(hasText)
    : v && typeof v === 'object'
      ? Object.values(v).some(hasText)
      : typeof v === 'string' && v.trim() !== ''

/** ¿La parte específica del tipo (options/config) tiene contenido escrito? */
export function interactionHasContent(it: Interaction): boolean {
  return hasText(it.options) || hasText(it.config)
}

/** Dónde vive el contenido de cada familia dentro de `config` (options aparte). */
const FAMILY_CONFIG_KEY: Record<Exclude<InteractionFamily, 'options'>, string> = {
  cards: 'cards',
  'titled-items': 'items',
  questions: 'questions',
}

/**
 * Datos específicos resultantes de cambiar `it` al tipo `to`:
 * - misma `family` → migra el contenido compartido (y nada más: sin claves
 *   huérfanas de config en el `course.json`);
 * - sin familia común → parte del `seed()` del tipo nuevo.
 * `lossy` indica si se descarta contenido escrito (la UI confirma solo entonces).
 */
export function migrateInteractionData(
  it: Interaction,
  to: InteractionType,
): { options: Interaction['options']; config: Record<string, unknown>; lossy: boolean } {
  const fromRec = interactionRecipe(it.type)
  const toRec = interactionRecipe(to)
  if (fromRec.family && fromRec.family === toRec.family) {
    if (fromRec.family === 'options')
      return { options: it.options ?? [], config: {}, lossy: hasText(it.config) }
    const key = FAMILY_CONFIG_KEY[fromRec.family]
    const rest = { ...(it.config ?? {}) }
    const kept = rest[key] ?? []
    delete rest[key]
    return { options: [], config: { [key]: kept }, lossy: hasText(it.options) || hasText(rest) }
  }
  const seed = toRec.seed?.() ?? {}
  return {
    options: seed.options ?? [],
    config: (seed.config as Record<string, unknown>) ?? {},
    lossy: interactionHasContent(it),
  }
}
