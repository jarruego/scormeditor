import type { Course, Module, Unit, Screen } from './course.schema'

/**
 * Recorrido canónico de las pantallas del curso. Desde que los módulos tienen
 * pantallas propias (`module.screens`, antes de sus unidades), el doble bucle
 * módulos→unidades se queda corto: este helper es la única definición del
 * orden lineal del curso en el editor (el runtime lo replica en `flatten()`
 * de app.js — mantener ambos en sincronía).
 */

/** Contenedor de pantallas: `unit` null = pantallas propias del módulo. */
export interface ScreenContainer {
  module: Module
  unit: Unit | null
  screens: Screen[]
}

/** Contenedores en el orden del curso: las pantallas del módulo primero,
 *  después las de cada unidad. */
export function screenContainers(course: Course): ScreenContainer[] {
  return course.modules.flatMap((m): ScreenContainer[] => [
    { module: m, unit: null, screens: m.screens },
    ...m.units.map((u) => ({ module: m, unit: u, screens: u.screens })),
  ])
}

/** Todas las pantallas del curso en orden lineal. */
export function allScreens(course: Course): Screen[] {
  return screenContainers(course).flatMap((c) => c.screens)
}
