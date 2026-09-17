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
 *  (`intro_screens`/`closing_screens`); `unit` null con `module` no nulo =
 *  pantallas propias del módulo (`screens` o, con `closing`, `closing_screens`)
 *  O de un bloque suelto «entre unidades» (`unit.loose`, ver `Unit` — se
 *  trata como si no perteneciera a ninguna unidad, a propósito: mismo peso
 *  que las pantallas propias del módulo, solo que en medio de sus unidades).
 *  `unit` no nulo = pantallas de esa unidad real. `closing` true = va después
 *  del resto de su contenedor (unidades del módulo, o todo el curso). */
export interface ScreenContainer {
  module: Module | null
  unit: Unit | null
  screens: Screen[]
  closing?: boolean
}

/** Contenedores en el orden del curso: introducción del paquete SCORM
 *  primero; luego, por cada módulo, sus pantallas propias, después cada
 *  elemento de `units[]` en orden (una unidad real, o un bloque suelto
 *  «entre unidades» sin atribución de unidad) y el cierre del módulo; al
 *  final de todo, el cierre del paquete SCORM. */
export function screenContainers(course: Course): ScreenContainer[] {
  return [
    { module: null, unit: null, screens: course.intro_screens },
    ...course.modules.flatMap((m): ScreenContainer[] => [
      { module: m, unit: null, screens: m.screens },
      ...m.units.map((u): ScreenContainer =>
        u.loose ? { module: m, unit: null, screens: u.screens } : { module: m, unit: u, screens: u.screens }),
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
 *  distinción de cierre para no confundir un grupo con el otro. Un bloque
 *  suelto «entre unidades» (`unit` null pero dentro de un módulo) se agrupa
 *  igual que las pantallas propias del módulo — sin nombre de unidad, porque
 *  no lo es. */
export function containerLabel(c: Pick<ScreenContainer, 'module' | 'unit' | 'closing'>): string {
  if (c.unit) {
    const base = `${c.module!.title || c.module!.id} › ${c.unit.title || c.unit.id}`
    return c.closing ? `${base} (cierre)` : base
  }
  if (c.module) {
    const base = c.module.title || c.module.id
    return c.closing ? `${base} (cierre)` : base
  }
  return c.closing ? 'Cierre del paquete SCORM' : 'Introducción del paquete SCORM'
}
