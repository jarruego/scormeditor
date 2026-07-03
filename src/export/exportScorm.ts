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
 * Recorre el curso y devuelve el conjunto de rutas `assets/…` realmente
 * referenciadas (recurso visual, póster, pistas VTT, audio, imágenes de
 * interacciones, etc.). Se usa para no empaquetar assets huérfanos que
 * engordarían el ZIP inútilmente.
 */
export function collectAssetPaths(course: Course): Set<string> {
  const out = new Set<string>()
  const visit = (v: unknown) => {
    if (typeof v === 'string') {
      if (v.startsWith('assets/')) out.add(v)
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

  // 3) Assets de media (imágenes, vídeos, audios, VTT...). Solo los REFERENCIADOS
  //    por el curso: así los huérfanos (versiones antiguas, pantallas borradas…)
  //    no engordan el ZIP.
  const referenced = collectAssetPaths(course)
  const assetPaths: string[] = []
  for (const [path, content] of Object.entries(assets)) {
    if (!referenced.has(path)) continue
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
