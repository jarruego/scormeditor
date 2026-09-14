import type { Course, Screen } from './course.schema'

/**
 * Quita del curso las pantallas marcadas para revisión (`screen.review.flagged`)
 * antes de exportar el paquete SCORM. Es la mitad "export" de la excepción
 * deliberada a la invariante «Vista estudiante = export»: el visor SÍ las
 * muestra (con borde rojo + nota, ver `arquitectura-runtime.md`), el ZIP real
 * nunca las lleva — ni su contenido ni sus assets (al filtrar antes de
 * `collectAssetPaths`, sus imágenes/vídeos exclusivos quedan fuera solos).
 * No podan contenedores que se queden vacíos (módulo/unidad sin pantallas):
 * un contenedor vacío es un estado válido, igual que tras borrar a mano.
 */
export function stripFlaggedForReview(course: Course): Course {
  const clone: Course = JSON.parse(JSON.stringify(course))
  const keep = (screens: Screen[]) => screens.filter((s) => !s.review?.flagged)
  clone.intro_screens = keep(clone.intro_screens)
  clone.modules.forEach((m) => {
    m.screens = keep(m.screens)
    m.units.forEach((u) => { u.screens = keep(u.screens) })
  })
  return clone
}

/** Cuenta las pantallas marcadas para revisión (para el aviso de `validators.ts`). */
export function countFlaggedForReview(course: Course): number {
  let n = 0
  const count = (screens: Screen[]) => { n += screens.filter((s) => s.review?.flagged).length }
  count(course.intro_screens)
  course.modules.forEach((m) => {
    count(m.screens)
    m.units.forEach((u) => count(u.screens))
  })
  return n
}
