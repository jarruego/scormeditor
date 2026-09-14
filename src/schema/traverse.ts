import type { Course, Module, Unit, Screen } from './course.schema'

/**
 * Recorrido canónico de las pantallas del curso. Desde que los módulos tienen
 * pantallas propias (`module.screens`, antes de sus unidades), el doble bucle
 * módulos→unidades se queda corto: este helper es la única definición del
 * orden lineal del curso en el editor (el runtime lo replica en `flatten()`
 * de app.js — mantener ambos en sincronía).
 */

/** Id de contenedor reservado para `course.intro_screens` (pantallas sueltas
 *  de introducción, antes de cualquier módulo): no coincide con ningún id real
 *  de módulo/unidad (esos los genera `newId()`, nunca con este formato). */
export const INTRO_CONTAINER_ID = '__course_intro__'

/** Contenedor de pantallas: `module` null = pantallas de introducción del
 *  paquete SCORM (`course.intro_screens`, antes de cualquier módulo); `unit`
 *  null con `module` no nulo = pantallas propias del módulo. */
export interface ScreenContainer {
  module: Module | null
  unit: Unit | null
  screens: Screen[]
}

/** Contenedores en el orden del curso: introducción del paquete SCORM
 *  primero, luego las pantallas de cada módulo, después las de cada unidad. */
export function screenContainers(course: Course): ScreenContainer[] {
  return [
    { module: null, unit: null, screens: course.intro_screens },
    ...course.modules.flatMap((m): ScreenContainer[] => [
      { module: m, unit: null, screens: m.screens },
      ...m.units.map((u) => ({ module: m, unit: u, screens: u.screens })),
    ]),
  ]
}

/** Todas las pantallas del curso en orden lineal. */
export function allScreens(course: Course): Screen[] {
  return screenContainers(course).flatMap((c) => c.screens)
}
