import type { Interaction, InteractionType } from './course.schema'
import type { IconName } from '../components/Icon'

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

/** Color semántico por grupo (mismas familias que `RECIPE_GROUP_COLORS`). */
export const INTERACTION_GROUP_COLORS: Record<InteractionGroup, string> = {
  presentar: '#0f9490', // contenido = teal
  preguntar: '#c27b06', // práctica = ámbar
  manipular: '#c2570b', // matiz naranja dentro de práctica
  juegos: '#c2417e', // lúdico/evaluable = frambuesa
  media: '#5265c4', // índigo
  avanzado: '#7d8694', // gris
}

/** Color del grupo de un tipo de interacción (para iconos fuera de las tarjetas). */
export function interactionColor(type: string): string {
  return INTERACTION_GROUP_COLORS[interactionRecipe(type).group]
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

/**
 * Familias de datos compatibles para migrar contenido al cambiar de tipo:
 * - `options`: respuestas con `correct` en `options` (single_choice, true_false,
 *   scenario_decision).
 * - `assign`: elementos con `group` en `options` (match_pairs, classification) —
 *   mismo shape exacto, migran sin pérdida.
 * - `titled-content`: patrón «título + detalle» (accordion, tabs, flip_cards,
 *   flashcards, timeline, image_cards). Cada tipo guarda un shape distinto en
 *   `config`, así que la migración pasa por un adaptador canónico
 *   (`TITLED_ADAPTERS`); los campos que el destino no conserva (label de
 *   timeline, image/alt de image_cards) se descartan avisando (`lossy`).
 * - `questions`: preguntas con timestamp/opciones en `config.questions`
 *   (video, hidden_image).
 */
export type InteractionFamily = 'options' | 'assign' | 'titled-content' | 'questions'

export type InteractionRecipe = {
  type: InteractionType
  icon: IconName
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
    icon: 'accordion',
    description: 'Despliega apartados uno a uno para leer su contenido.',
    group: 'presentar',
    gradable: false,
    supportsAttempts: false,
    family: 'titled-content',
  },
  {
    type: 'tabs',
    icon: 'tabs',
    description: 'Cambia entre pestañas para ver cada bloque de contenido.',
    group: 'presentar',
    gradable: false,
    supportsAttempts: false,
    family: 'titled-content',
  },
  {
    type: 'flip_cards',
    icon: 'flip',
    description: 'Gira tarjetas para descubrir el contenido del reverso.',
    group: 'presentar',
    gradable: false,
    supportsAttempts: false,
    family: 'titled-content',
  },
  {
    type: 'timeline',
    icon: 'timeline',
    description: 'Recorre hitos en orden y despliega el detalle de cada uno.',
    group: 'presentar',
    gradable: false,
    supportsAttempts: false,
    family: 'titled-content',
  },
  {
    type: 'image_cards',
    icon: 'gallery',
    description: 'Abre tarjetas con imagen que muestran su texto en una ventana.',
    group: 'presentar',
    gradable: false,
    supportsAttempts: false,
    family: 'titled-content',
  },
  {
    type: 'before_after',
    icon: 'compare',
    description: 'Desliza un divisor para comparar dos imágenes superpuestas.',
    group: 'presentar',
    gradable: false,
    supportsAttempts: false,
  },
  {
    type: 'hotspots',
    icon: 'hotspot',
    description: 'Pulsa zonas de una imagen para explorarla (puede puntuar).',
    group: 'presentar',
    gradable: true,
    supportsAttempts: false,
  },

  // ---- Preguntar -----------------------------------------------------------
  {
    type: 'single_choice',
    icon: 'circle-check',
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
    icon: 'true-false',
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
    icon: 'branch',
    description: 'Lee una situación y decide qué haría; cada decisión tiene su feedback.',
    group: 'preguntar',
    gradable: true,
    supportsAttempts: false,
    family: 'options',
  },
  {
    type: 'fill_blanks',
    icon: 'fill-blanks',
    description: 'Completa los huecos del texto eligiendo la palabra correcta.',
    group: 'preguntar',
    gradable: true,
    supportsAttempts: true,
  },
  {
    type: 'case_practice',
    icon: 'briefcase',
    description: 'Reflexiona sobre un caso y se autoevalúa con una rúbrica.',
    group: 'preguntar',
    gradable: false,
    supportsAttempts: false,
  },

  // ---- Manipular -----------------------------------------------------------
  {
    type: 'sort_steps',
    icon: 'sort',
    description: 'Arrastra los pasos hasta dejarlos en el orden correcto.',
    group: 'manipular',
    gradable: true,
    supportsAttempts: true,
  },
  {
    type: 'match_pairs',
    icon: 'link',
    description: 'Empareja cada elemento con el que le corresponde.',
    group: 'manipular',
    gradable: true,
    supportsAttempts: true,
    family: 'assign',
  },
  {
    type: 'classification',
    icon: 'classify',
    description: 'Coloca cada elemento en su categoría.',
    group: 'manipular',
    gradable: true,
    supportsAttempts: true,
    family: 'assign',
  },

  // ---- Juegos didácticos ---------------------------------------------------
  {
    type: 'word_search',
    icon: 'grid-search',
    description: 'Encuentra las palabras ocultas en la sopa de letras.',
    group: 'juegos',
    gradable: true,
    supportsAttempts: false,
  },
  {
    type: 'crossword',
    icon: 'grid',
    description: 'Rellena el crucigrama a partir de las pistas.',
    group: 'juegos',
    gradable: true,
    supportsAttempts: true,
  },
  {
    type: 'az_quiz',
    icon: 'letter-a',
    description: 'Responde una definición por letra, como en el pasapalabra.',
    group: 'juegos',
    gradable: true,
    supportsAttempts: false,
  },
  {
    type: 'hidden_image',
    icon: 'eye',
    description: 'Destapa una imagen oculta acertando preguntas.',
    group: 'juegos',
    gradable: true,
    supportsAttempts: false,
    family: 'questions',
  },
  {
    type: 'puzzle',
    icon: 'puzzle',
    description: 'Recompone la imagen intercambiando piezas.',
    group: 'juegos',
    gradable: true,
    supportsAttempts: false,
    seed: () => ({ config: { cols: 3, rows: 3 } }),
  },
  {
    type: 'flashcards',
    icon: 'cards',
    description: 'Se autoevalúa: intenta responder cada tarjeta y comprueba al girarla.',
    group: 'juegos',
    gradable: false,
    supportsAttempts: false,
    family: 'titled-content',
  },

  // ---- Vídeo ---------------------------------------------------------------
  {
    type: 'video',
    icon: 'film',
    description: 'Ve un vídeo; con preguntas, se pausa y pregunta en el momento indicado.',
    group: 'media',
    gradable: true,
    supportsAttempts: false,
    family: 'questions',
  },

  // ---- Avanzado ------------------------------------------------------------
  {
    type: 'html_embed',
    icon: 'code',
    description: 'Interactivo HTML/CSS/JS a medida, aislado en un sandbox.',
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
      icon: 'puzzle',
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

/** Ítem canónico de la familia `titled-content`: título + detalle y extras opcionales. */
type TitledItem = { title: string; body: string; label: string; image: string; alt: string }

type TitledAdapter = {
  /** Clave de `config` donde vive la lista de este tipo. */
  key: string
  /** Campos canónicos que el shape del tipo conserva (el resto se pierde al migrar). */
  keeps: ReadonlyArray<keyof TitledItem>
  read: (raw: Record<string, unknown>) => TitledItem
  write: (item: TitledItem) => Record<string, unknown>
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '')

/** Tipos con `config.items: [{title, body}]` (accordion, tabs). */
const ITEMS_ADAPTER: TitledAdapter = {
  key: 'items',
  keeps: ['title', 'body'],
  read: (r) => ({ title: str(r.title), body: str(r.body), label: '', image: '', alt: '' }),
  write: (it) => ({ title: it.title, body: it.body }),
}

/** Tipos con `config.cards: [{front, back}]` (flip_cards, flashcards). */
const FLIP_ADAPTER: TitledAdapter = {
  key: 'cards',
  keeps: ['title', 'body'],
  read: (r) => ({ title: str(r.front), body: str(r.back), label: '', image: '', alt: '' }),
  write: (it) => ({ front: it.title, back: it.body }),
}

/** Cómo lee/escribe cada tipo de `titled-content` su shape real de `config`. */
const TITLED_ADAPTERS: Partial<Record<InteractionType, TitledAdapter>> = {
  accordion: ITEMS_ADAPTER,
  tabs: ITEMS_ADAPTER,
  flip_cards: FLIP_ADAPTER,
  flashcards: FLIP_ADAPTER,
  timeline: {
    key: 'milestones',
    keeps: ['title', 'body', 'label'],
    read: (r) => ({ title: str(r.title), body: str(r.body), label: str(r.label), image: '', alt: '' }),
    write: (it) => ({ label: it.label, title: it.title, body: it.body }),
  },
  image_cards: {
    key: 'cards',
    keeps: ['title', 'body', 'image', 'alt'],
    read: (r) => ({ title: str(r.title), body: str(r.text), label: '', image: str(r.image), alt: str(r.alt) }),
    write: (it) => ({ image: it.image, alt: it.alt, title: it.title, text: it.body }),
  },
}

/**
 * Datos específicos resultantes de cambiar `it` al tipo `to`:
 * - misma `family` → migra el contenido compartido (y nada más: sin claves
 *   huérfanas de config en el `course.json`). En `titled-content` el shape del
 *   origen pasa a ítem canónico y de ahí al shape del destino; los campos que
 *   el destino no conserva se descartan.
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
    // `options` y `assign` viven en `options` con el mismo shape: migra tal cual.
    if (fromRec.family === 'options' || fromRec.family === 'assign')
      return { options: it.options ?? [], config: {}, lossy: hasText(it.config) }
    if (fromRec.family === 'questions') {
      const rest = { ...(it.config ?? {}) }
      const kept = rest.questions ?? []
      delete rest.questions
      return { options: [], config: { questions: kept }, lossy: hasText(it.options) || hasText(rest) }
    }
    const fromAd = TITLED_ADAPTERS[it.type]
    const toAd = TITLED_ADAPTERS[to]
    if (fromAd && toAd) {
      const rest = { ...(it.config ?? {}) }
      const raw = rest[fromAd.key]
      delete rest[fromAd.key]
      const items = (Array.isArray(raw) ? raw : []).map((r) => fromAd.read(r ?? {}))
      // Se pierde algo si algún ítem trae texto en un campo que el destino no conserva.
      const dropped = items.some((item) =>
        fromAd.keeps.some((k) => !toAd.keeps.includes(k) && item[k].trim() !== ''),
      )
      return {
        options: [],
        config: { [toAd.key]: items.map(toAd.write) },
        lossy: dropped || hasText(it.options) || hasText(rest),
      }
    }
  }
  const seed = toRec.seed?.() ?? {}
  return {
    options: seed.options ?? [],
    config: (seed.config as Record<string, unknown>) ?? {},
    lossy: interactionHasContent(it),
  }
}
