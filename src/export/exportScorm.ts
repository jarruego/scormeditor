import JSZip from 'jszip'
import type { Course } from '../schema/course.schema'
import { generateManifest, generateLomMetadata } from '../scorm/manifest'
import { getRuntimeFiles } from '../scorm/runtimeAssets'
import { collectAssetPaths } from '../schema/assetRefs'
import { stripFlaggedForReview } from '../schema/review'

// `collectAssetPaths` vive en `../schema/assetRefs` (compartido con el store para
// el borrado seguro de assets); se reexporta aquí por compatibilidad.
export { collectAssetPaths }

/** Mapa de assets binarios: rutaEnZip -> contenido. */
export type AssetMap = Record<string, Blob | Uint8Array | ArrayBuffer | string>

export interface ExportOptions {
  course: Course
  assets?: AssetMap
}

/**
 * Construye el ZIP SCORM 1.2 en memoria y devuelve un Blob.
 * Estructura: imsmanifest.xml + index.html + assets/** + data/course.json
 */
export async function buildScormZip({ course: courseWithDrafts, assets = {} }: ExportOptions): Promise<Blob> {
  const zip = new JSZip()

  // 0) Pantallas marcadas «pendiente de revisión»: fuera del paquete real (la
  //    Vista estudiante sí las muestra, con borde rojo — excepción deliberada
  //    a la invariante «Vista estudiante = export», ver arquitectura-runtime.md
  //    y CLAUDE.md). A partir de aquí, `course` es ya la versión sin ellas.
  const course = stripFlaggedForReview(courseWithDrafts)

  // 1) Carcasa (HTML/CSS/JS plano, idéntica a la vista estudiante)
  for (const f of getRuntimeFiles()) {
    zip.file(f.path, f.content)
  }

  // 2) Datos del curso
  zip.file('data/course.json', JSON.stringify(course, null, 2))

  // 3) Assets de media (imágenes, vídeos, audios, VTT...). Solo los REFERENCIADOS
  //    por el curso: así los huérfanos (versiones antiguas, pantallas borradas…)
  //    no engordan el ZIP. Al filtrar antes de aquí, los assets exclusivos de una
  //    pantalla en revisión tampoco viajan.
  const referenced = collectAssetPaths(course)
  const assetPaths: string[] = []
  for (const [path, content] of Object.entries(assets)) {
    if (!referenced.has(path)) continue
    zip.file(path, content as any)
    assetPaths.push(path)
  }

  // 4) Metadatos LOM + manifiesto (incluye los assets en el listado de ficheros)
  zip.file('imslrm.xml', generateLomMetadata(course))
  zip.file('imsmanifest.xml', generateManifest(course, assetPaths))

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
}

/** Dispara la descarga del ZIP en el navegador. */
export async function downloadScorm(opts: ExportOptions, filename?: string): Promise<void> {
  const blob = await buildScormZip(opts)
  const name = filename || `${opts.course.scorm.identifier || 'scorm'}.zip`
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
