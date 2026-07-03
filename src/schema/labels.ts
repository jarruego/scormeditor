import type { ScreenType, InteractionType } from './course.schema'

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
  case_practice: 'Caso práctico (respuesta abierta)',
  hotspots: 'Zonas interactivas (imagen)',
  video: 'Vídeo interactivo',
  fill_blanks: 'Rellenar huecos',
  timeline: 'Línea de tiempo',
  flashcards: 'Tarjetas de repaso',
}

/** Icono compacto por tipo de pantalla (árbol del editor). */
export const SCREEN_TYPE_ICONS: Record<ScreenType, string> = {
  cover: '🏠',
  objectives: '🎯',
  route: '🗺️',
  content: '📄',
  summary: '📋',
  video: '🎬',
  reflection: '💭',
  forum_prompt: '💬',
  unit_quiz: '📝',
  content_placeholder: '🚧',
}

export function screenTypeLabel(t: string): string {
  return SCREEN_TYPE_LABELS[t as ScreenType] ?? t
}

export function screenTypeIcon(t: string): string {
  return SCREEN_TYPE_ICONS[t as ScreenType] ?? '📄'
}

export function interactionTypeLabel(t: string): string {
  return INTERACTION_TYPE_LABELS[t as InteractionType] ?? t
}
