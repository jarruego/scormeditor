import JSZip from 'jszip'
import type { Course } from '../schema/course.schema'
import { generateManifest } from '../scorm/manifest'
import { getRuntimeFiles } from '../scorm/runtimeAssets'

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
export async function buildScormZip({ course, assets = {} }: ExportOptions): Promise<Blob> {
  const zip = new JSZip()

  // 1) Carcasa (HTML/CSS/JS plano, idéntica a la vista estudiante)
  for (const f of getRuntimeFiles()) {
    zip.file(f.path, f.content)
  }

  // 2) Datos del curso
  zip.file('data/course.json', JSON.stringify(course, null, 2))

  // 3) Assets de media (imágenes, vídeos, audios, VTT...)
  const assetPaths: string[] = []
  for (const [path, content] of Object.entries(assets)) {
    zip.file(path, content as any)
    assetPaths.push(path)
  }

  // 4) Manifiesto (incluye los assets en el listado de ficheros)
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
