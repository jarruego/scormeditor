import type { InteractionType, ScreenType } from './course.schema'

/**
 * Énfasis del ScreenEditor por tipo de pantalla (capa 2 de la guía al autor:
 * las recetas guían al crear, esto guía al editar). Es SOLO presentación:
 * reordena, pliega/despliega y sugiere — nunca restringe. Cualquier
 * combinación sigue siendo posible; lo incongruente lo señalan los avisos de
 * `validators.ts`.
 */
export type ScreenTypeUI = {
  /** El recurso visual se muestra ANTES del texto (pantallas donde el medio es el contenido). */
  mediaFirst?: boolean
  /** Sección «Interacción» desplegada de serie (además de cuando ya hay interacción). */
  interactionOpen?: boolean
  /** Ocultar «Objetivo de aprendizaje» (tipos exentos en validación: cover/summary). */
  hideObjective?: boolean
  /** Interacciones recomendadas: van en un grupo propio arriba del desplegable
   *  y la primera es el tipo inicial de «+ Añadir interacción». */
  recommended?: InteractionType[]
}

export const SCREEN_TYPE_UI: Partial<Record<ScreenType, ScreenTypeUI>> = {
  cover: { hideObjective: true },
  summary: { hideObjective: true },
  video: { mediaFirst: true, recommended: ['video'] },
  unit_quiz: {
    interactionOpen: true,
    recommended: ['single_choice', 'true_false', 'classification', 'match_pairs', 'sort_steps', 'fill_blanks', 'scenario_decision'],
  },
}
