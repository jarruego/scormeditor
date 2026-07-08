import type { Course } from './course.schema'

/**
 * Recorre el curso y devuelve el conjunto de rutas `assets/…` realmente
 * referenciadas (recurso visual, póster, pistas VTT, audio de locución,
 * imágenes de interacciones, etc.). Recorrido profundo recogiendo cualquier
 * string que empiece por `assets/`, para no depender de la forma concreta del
 * esquema (así, si aparece un campo nuevo con una ruta de asset, se cubre solo).
 *
 * Se usa en dos sitios: el export (para no empaquetar assets huérfanos) y el
 * borrado de assets (para no eliminar un binario que otra pantalla aún usa).
 */
export function collectAssetPaths(course: Course): Set<string> {
  const out = new Set<string>()
  const visit = (v: unknown) => {
    if (typeof v === 'string') {
      if (v.startsWith('assets/')) { out.add(v); return }
      // Rutas incrustadas en markdown (p. ej. ![alt](assets/img/x.png) dentro
      // de student_text o de un cuerpo de interacción).
      const embedded = v.match(/assets\/[^\s)"'\]]+/g)
      if (embedded) embedded.forEach((p) => out.add(p))
      return
    }
    if (Array.isArray(v)) { v.forEach(visit); return }
    if (v && typeof v === 'object') {
      for (const key of Object.keys(v as Record<string, unknown>)) visit((v as Record<string, unknown>)[key])
    }
  }
  visit(course)
  return out
}

/** ¿La ruta de asset sigue referenciada en algún punto del curso? */
export function isAssetReferenced(course: Course, path: string): boolean {
  return collectAssetPaths(course).has(path)
}

/**
 * Rutas de `assets` que ya no referencia ninguna pantalla del curso (huérfanos):
 * binarios que quedaron sin uso al borrar pantallas, cambiar de recurso, etc. El
 * export los ignora igualmente; sirve para poder purgarlos y aligerar el proyecto.
 */
export function orphanAssetPaths(course: Course, assets: Record<string, unknown>): string[] {
  const referenced = collectAssetPaths(course)
  return Object.keys(assets).filter((p) => !referenced.has(p))
}
