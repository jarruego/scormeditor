import type { ScreenType, InteractionType } from './course.schema'
import type { IconName } from '../components/Icon'

/**
 * Etiquetas en español para los valores internos del esquema. La UI del editor
 * nunca muestra los identificadores en crudo (`content_placeholder`,
 * `single_choice`…): siempre pasa por aquí. Los valores internos no cambian
 * (contrato de course.json).
 */
export const SCREEN_TYPE_LABELS: Record<ScreenType, string> = {
  cover: 'Portada',
  objectives: 'Objetivos',
  route: 'Itinerario',
  content: 'Contenido',
  summary: 'Resumen',
  video: 'Vídeo',
  reflection: 'Reflexión',
  forum_prompt: 'Debate (foro)',
  unit_quiz: 'Test de unidad',
  content_placeholder: 'Pendiente de desarrollo',
}

export const INTERACTION_TYPE_LABELS: Record<InteractionType, string> = {
  accordion: 'Desplegables (acordeón)',
  tabs: 'Pestañas',
  flip_cards: 'Tarjetas giratorias',
  match_pairs: 'Emparejar',
  sort_steps: 'Ordenar pasos',
  single_choice: 'Opción única',
  true_false: 'Verdadero / Falso',
  classification: 'Clasificar en categorías',
  scenario_decision: 'Escenario con decisión',
  case_practice: 'Caso práctico (reflexión + rúbrica)',
  hotspots: 'Zonas interactivas (imagen)',
  video: 'Vídeo interactivo',
  fill_blanks: 'Rellenar huecos',
  timeline: 'Línea de tiempo',
  flashcards: 'Tarjetas de repaso',
  html_embed: 'HTML a medida (código)',
  image_cards: 'Tarjetas de imagen (modal)',
  before_after: 'Antes / después (comparador)',
  word_search: 'Sopa de letras',
  crossword: 'Crucigrama',
  hidden_image: 'Imagen oculta (preguntas)',
  az_quiz: 'Rosco A-Z (pasapalabra)',
  puzzle: 'Puzzle de imagen',
  progress_report: 'Informe de progreso',
}

/** Icono compacto por tipo de pantalla (árbol del editor); nombres de `Icon`. */
export const SCREEN_TYPE_ICONS: Record<ScreenType, IconName> = {
  cover: 'home',
  objectives: 'target',
  route: 'route',
  content: 'file-text',
  summary: 'clipboard-list',
  video: 'film',
  reflection: 'message-dots',
  forum_prompt: 'forum',
  unit_quiz: 'clipboard-check',
  content_placeholder: 'placeholder',
}

export function screenTypeLabel(t: string): string {
  return SCREEN_TYPE_LABELS[t as ScreenType] ?? t
}

export function screenTypeIcon(t: string): IconName {
  return SCREEN_TYPE_ICONS[t as ScreenType] ?? 'file-text'
}

/**
 * Color semántico por tipo de pantalla (árbol y chips del editor). Familias de
 * la paleta corporativa de teleformación, saturadas para leerse en iconos
 * pequeños: estructura=índigo, contenido=teal, práctica=ámbar,
 * evaluación=frambuesa, pendiente=gris.
 */
export const TYPE_COLORS = {
  estructura: '#5265c4',
  contenido: '#0f9490',
  practica: '#c27b06',
  evaluacion: '#c2417e',
  /** Glosario y Recursos/bibliografía (familia rosa corporativa, saturada a terracota). */
  materiales: '#bd5d52',
  otros: '#7d8694',
} as const

export const SCREEN_TYPE_COLORS: Record<ScreenType, string> = {
  cover: TYPE_COLORS.estructura,
  objectives: TYPE_COLORS.estructura,
  route: TYPE_COLORS.estructura,
  summary: TYPE_COLORS.estructura,
  content: TYPE_COLORS.contenido,
  video: TYPE_COLORS.contenido,
  reflection: TYPE_COLORS.practica,
  forum_prompt: TYPE_COLORS.practica,
  unit_quiz: TYPE_COLORS.evaluacion,
  content_placeholder: TYPE_COLORS.otros,
}

export function screenTypeColor(t: string): string {
  return SCREEN_TYPE_COLORS[t as ScreenType] ?? TYPE_COLORS.contenido
}

export function interactionTypeLabel(t: string): string {
  return INTERACTION_TYPE_LABELS[t as InteractionType] ?? t
}
