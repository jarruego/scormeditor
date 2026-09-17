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

/** Id de contenedor reservado para `course.closing_screens` (pantallas
 *  sueltas de cierre, después de TODO lo demás — simétrico a
 *  `INTRO_CONTAINER_ID`). */
export const OUTRO_CONTAINER_ID = '__course_outro__'

/** Id de contenedor derivado para `module.closing_screens`: no puede ser el
 *  propio id del módulo (ese ya identifica `module.screens`) ni chocar con un
 *  id real de unidad — `newId()` nunca genera `:` en sus ids. */
export function moduleClosingContainerId(moduleId: string): string {
  return `${moduleId}:closing`
}

/** Contenedor de pantallas: `module` null = pantallas sueltas del curso
 *  (`course.intro_screens`/`closing_screens`, sin ningún módulo); `unit` null
 *  con `module` no nulo = pantallas propias del módulo (`screens` o
 *  `closing_screens`, distinguidas por `closing`). `closing` true = va
 *  después del resto del contenedor (unidades del módulo, o todo el curso). */
export interface ScreenContainer {
  module: Module | null
  unit: Unit | null
  screens: Screen[]
  closing?: boolean
}

/** Contenedores en el orden del curso: introducción del paquete SCORM
 *  primero; luego, por cada módulo, sus pantallas propias, las de cada
 *  unidad y su cierre; al final del todo, el cierre del paquete SCORM. */
export function screenContainers(course: Course): ScreenContainer[] {
  return [
    { module: null, unit: null, screens: course.intro_screens },
    ...course.modules.flatMap((m): ScreenContainer[] => [
      { module: m, unit: null, screens: m.screens },
      ...m.units.map((u) => ({ module: m, unit: u, screens: u.screens })),
      { module: m, unit: null, screens: m.closing_screens, closing: true },
    ]),
    { module: null, unit: null, screens: course.closing_screens, closing: true },
  ]
}

/** Todas las pantallas del curso en orden lineal. */
export function allScreens(course: Course): Screen[] {
  return screenContainers(course).flatMap((c) => c.screens)
}

/** Rótulo de un contenedor para agrupar en Validación/Informe/Objetivos: el
 *  mismo criterio (`módulo › unidad`, o «Introducción del paquete SCORM» sin
 *  módulo) que ya usaban esas pantallas antes de que hubiera cierres, más la
 *  distinción de cierre para no confundir un grupo con el otro. */
export function containerLabel(c: Pick<ScreenContainer, 'module' | 'unit' | 'closing'>): string {
  if (c.unit) return `${c.module!.title || c.module!.id} › ${c.unit.title || c.unit.id}`
  if (c.module) {
    const base = c.module.title || c.module.id
    return c.closing ? `${base} (cierre)` : base
  }
  return c.closing ? 'Cierre del paquete SCORM' : 'Introducción del paquete SCORM'
}
