import type { InteractionType, Screen, ScreenInput, ScreenType, Unit } from './course.schema'
import { Interaction } from './course.schema'

/**
 * Recetas de creación de pantallas: presets con nombre didáctico que fijan de
 * golpe tipo + recurso visual + interacción, para que el autor novel no tenga
 * que combinar a mano las tres decisiones. La receta solo decide el estado
 * inicial: tras crear, el editor permite cambiar cualquier cosa (el desplegable
 * «Tipo de pantalla» sigue disponible como ajuste avanzado).
 *
 * Criterio de agrupado: QUÉ HACE EL ALUMNO en la pantalla — leer/explorar
 * (Contenido), hacer y recibir corrección (Práctica), puntuar (Evaluación).
 * Si puntúa o no es el DEFAULT DEL GRUPO (Práctica crea con scored:false,
 * Evaluación con scored:true), nunca una promesa de la tarjeta: la decisión
 * real se toma después en la interacción y en los Ajustes (score_source).
 *
 * No tocan el esquema ni el contrato de course.json: son una capa de UI.
 * `html_embed` y Verdadero/Falso no tienen tarjeta a propósito: el primero es
 * la interacción avanzada (sandbox) y el segundo es una variante de Pregunta.
 */

function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`
}

/** Interacción completa vía `Interaction.parse`: los defaults del esquema son la única fuente de verdad. */
function makeInteraction(type: InteractionType, extra?: Partial<Interaction>): Interaction {
  return Interaction.parse({ id: newId('i'), type, ...extra })
}

/** Índice tras la última pantalla cuyo tipo esté en `types` (0 si no hay ninguna). */
function afterLast(screens: Screen[], types: ScreenType[]): number {
  let idx = 0
  screens.forEach((s, i) => {
    if (types.includes(s.type)) idx = i + 1
  })
  return idx
}

export type RecipeGroup = 'estructura' | 'contenido' | 'practica' | 'evaluacion' | 'otros'

export const RECIPE_GROUPS: RecipeGroup[] = ['estructura', 'contenido', 'practica', 'evaluacion', 'otros']

export const RECIPE_GROUP_LABELS: Record<RecipeGroup, string> = {
  estructura: 'Estructura',
  contenido: 'Contenido',
  practica: 'Práctica',
  evaluacion: 'Evaluación',
  otros: 'Otros',
}

/** Subtítulo del grupo: comunica la intención y el default de puntuación. */
export const RECIPE_GROUP_HINTS: Record<RecipeGroup, string> = {
  estructura: 'El armazón de la unidad.',
  contenido: 'El alumno lee, ve o explora; no hay respuestas.',
  practica: 'El alumno hace algo y recibe corrección; de serie no puntúa.',
  evaluacion: 'Cuenta para la nota (según los Ajustes del curso).',
  otros: '',
}

export type ScreenRecipe = {
  key: string
  icon: string
  label: string
  /** Línea breve de la tarjeta: qué hace el alumno (sin promesas de nota). */
  description: string
  group: RecipeGroup
  /** Tipo de pantalla resultante (también decide el atenuado si es única por unidad). */
  type: ScreenType
  /** Preset adicional sobre el tipo (recurso visual, interacción…). */
  extras?: () => Partial<ScreenInput>
  /** Título inicial; si falta, el del store («Nueva pantalla»). */
  defaultTitle?: string | ((unit: Unit) => string)
  /** Índice de inserción en la unidad; por defecto, al final. */
  place?: (screens: Screen[]) => number
  /** Sugerir una sola pantalla de este tipo por unidad (atenúa la tarjeta, no bloquea). */
  uniquePerUnit?: boolean
  /** Tarjeta discreta (grupo «Otros»). */
  subtle?: boolean
}

export const SCREEN_RECIPES: ScreenRecipe[] = [
  // --- Estructura -------------------------------------------------------------
  {
    key: 'cover',
    icon: '🏠',
    label: 'Portada',
    description: 'Presentación de la unidad. Se coloca al principio.',
    group: 'estructura',
    type: 'cover',
    defaultTitle: (u) => u.title,
    place: () => 0,
    uniquePerUnit: true,
  },
  {
    key: 'objectives',
    icon: '🎯',
    label: 'Objetivos',
    description: 'Qué va a aprender el alumno en esta unidad.',
    group: 'estructura',
    type: 'objectives',
    defaultTitle: 'Objetivos',
    place: (ss) => afterLast(ss, ['cover']),
    uniquePerUnit: true,
  },
  {
    key: 'route',
    icon: '🗺️',
    label: 'Itinerario',
    description: 'Cómo se organiza la unidad y qué camino seguir.',
    group: 'estructura',
    type: 'route',
    defaultTitle: 'Itinerario',
    place: (ss) => afterLast(ss, ['cover', 'objectives']),
    uniquePerUnit: true,
  },
  {
    key: 'summary',
    icon: '📋',
    label: 'Resumen',
    description: 'Ideas clave para cerrar la unidad. Se coloca al final.',
    group: 'estructura',
    type: 'summary',
    defaultTitle: 'Resumen',
    place: (ss) => {
      const qi = ss.findIndex((s) => s.type === 'unit_quiz')
      return qi >= 0 ? qi : ss.length
    },
    uniquePerUnit: true,
  },

  // --- Contenido (leer, ver, explorar) -----------------------------------------
  {
    key: 'text',
    icon: '📄',
    label: 'Texto',
    description: 'Texto con formato: encabezados, listas, destacados…',
    group: 'contenido',
    type: 'content',
  },
  {
    key: 'text-image',
    icon: '🖼️',
    label: 'Texto + imagen',
    description: 'Texto acompañado de una imagen a un lado.',
    group: 'contenido',
    type: 'content',
    extras: () => ({ visual_resource: { kind: 'image', layout: 'right', media_width: '50' } }),
  },
  {
    key: 'video',
    icon: '🎬',
    label: 'Vídeo',
    description: 'Vídeo de YouTube o archivo propio, con transcripción.',
    group: 'contenido',
    type: 'video',
    extras: () => ({ visual_resource: { kind: 'video_youtube', layout: 'top' } }),
  },
  {
    key: 'accordion',
    icon: '🗂️',
    label: 'Acordeón',
    description: 'Contenido troceado en secciones desplegables.',
    group: 'contenido',
    type: 'content',
    extras: () => ({ interaction: makeInteraction('accordion') }),
  },
  {
    key: 'tabs',
    icon: '📑',
    label: 'Pestañas',
    description: 'Contenido organizado en pestañas paralelas.',
    group: 'contenido',
    type: 'content',
    extras: () => ({ interaction: makeInteraction('tabs') }),
  },
  {
    key: 'flip-cards',
    icon: '🎴',
    label: 'Tarjetas giratorias',
    description: 'Tarjetas que se voltean para descubrir el reverso.',
    group: 'contenido',
    type: 'content',
    extras: () => ({ interaction: makeInteraction('flip_cards') }),
  },
  {
    key: 'timeline',
    icon: '⏳',
    label: 'Línea de tiempo',
    description: 'Hitos ordenados cronológicamente.',
    group: 'contenido',
    type: 'content',
    extras: () => ({ interaction: makeInteraction('timeline') }),
  },
  {
    key: 'hotspots',
    icon: '🔍',
    label: 'Imagen explorable',
    description: 'Imagen con puntos interactivos que amplían información.',
    group: 'contenido',
    type: 'content',
    extras: () => ({ interaction: makeInteraction('hotspots') }),
  },
  {
    key: 'image-cards',
    icon: '🏞️',
    label: 'Tarjetas de imagen',
    description: 'Tarjetas con imagen que se abren en grande con su explicación.',
    group: 'contenido',
    type: 'content',
    extras: () => ({ interaction: makeInteraction('image_cards') }),
  },

  // --- Práctica (hacer y recibir corrección; scored:false de serie) ------------
  {
    key: 'single-choice',
    icon: '✅',
    label: 'Pregunta de opciones',
    description: 'El alumno elige la respuesta y recibe feedback.',
    group: 'practica',
    type: 'content',
    extras: () => ({ interaction: makeInteraction('single_choice') }),
  },
  {
    key: 'match-pairs',
    icon: '🧩',
    label: 'Emparejar',
    description: 'Unir conceptos relacionados entre sí.',
    group: 'practica',
    type: 'content',
    extras: () => ({ interaction: makeInteraction('match_pairs') }),
  },
  {
    key: 'sort-steps',
    icon: '🔢',
    label: 'Ordenar pasos',
    description: 'Colocar los elementos en su orden correcto.',
    group: 'practica',
    type: 'content',
    extras: () => ({ interaction: makeInteraction('sort_steps') }),
  },
  {
    key: 'classification',
    icon: '🗃️',
    label: 'Clasificar',
    description: 'Repartir elementos en sus categorías.',
    group: 'practica',
    type: 'content',
    extras: () => ({ interaction: makeInteraction('classification') }),
  },
  {
    key: 'fill-blanks',
    icon: '✏️',
    label: 'Rellenar huecos',
    description: 'Completar un texto con las palabras que faltan.',
    group: 'practica',
    type: 'content',
    extras: () => ({ interaction: makeInteraction('fill_blanks') }),
  },
  {
    key: 'scenario',
    icon: '🎭',
    label: 'Escenario con decisiones',
    description: 'Situación simulada donde cada decisión tiene consecuencias.',
    group: 'practica',
    type: 'content',
    extras: () => ({ interaction: makeInteraction('scenario_decision') }),
  },
  {
    key: 'case',
    icon: '💼',
    label: 'Caso práctico',
    description: 'Situación real con tarea; la solución va en el feedback.',
    group: 'practica',
    type: 'content',
    extras: () => ({ interaction: makeInteraction('case_practice') }),
  },
  {
    key: 'flashcards',
    icon: '🃏',
    label: 'Fichas de repaso',
    description: 'Tarjetas pregunta-respuesta para repasar lo aprendido.',
    group: 'practica',
    type: 'content',
    extras: () => ({ interaction: makeInteraction('flashcards') }),
  },
  {
    key: 'reflection',
    icon: '💭',
    label: 'Reflexión',
    description: 'Pregunta abierta para pensar; el enunciado va en el texto.',
    group: 'practica',
    type: 'reflection',
  },
  {
    key: 'forum',
    icon: '💬',
    label: 'Debate en foro',
    description: 'Enunciado para debatir en el foro del campus.',
    group: 'practica',
    type: 'forum_prompt',
  },

  // --- Evaluación (scored:true de serie) ----------------------------------------
  {
    key: 'unit-quiz',
    icon: '📝',
    label: 'Test de unidad',
    description: 'Pregunta que cierra la unidad. Se coloca al final.',
    group: 'evaluacion',
    type: 'unit_quiz',
    defaultTitle: 'Comprueba lo aprendido',
    extras: () => ({ interaction: makeInteraction('single_choice', { scored: true, points: 1 }) }),
    place: (ss) => ss.length,
    uniquePerUnit: true,
  },

  // --- Otros ---------------------------------------------------------------------
  {
    key: 'placeholder',
    icon: '🚧',
    label: 'Pendiente de desarrollo',
    description: 'Marcador para contenido que se desarrollará más adelante.',
    group: 'otros',
    type: 'content_placeholder',
    subtle: true,
  },
  {
    key: 'blank',
    icon: '⬜',
    label: 'En blanco',
    description: 'Pantalla sin preconfigurar, para montarla a mano.',
    group: 'otros',
    type: 'content',
    subtle: true,
  },
]
