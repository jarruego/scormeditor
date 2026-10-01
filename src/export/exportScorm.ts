import JSZip from 'jszip'
import type { Course } from '../schema/course.schema'
import { generateManifest, generateLomMetadata } from '../scorm/manifest'
import { getRuntimeFiles } from '../scorm/runtimeAssets'
import { collectAssetPaths } from '../schema/assetRefs'
import { stripFlaggedForReview } from '../schema/review'
import { allScreens } from '../schema/traverse'
import { itemsKeyOf } from '../tts/buildTranscript'
import { listNarrationAudioPaths } from '../tts/tts'
import { getCompressedAudio } from '../media/compressedAudioCache'

// `collectAssetPaths` vive en `../schema/assetRefs` (compartido con el store para
// el borrado seguro de assets); se reexporta aquí por compatibilidad.
export { collectAssetPaths }

/** Mapa de assets binarios: rutaEnZip -> contenido. */
export type AssetMap = Record<string, Blob | Uint8Array | ArrayBuffer | string>

export interface ExportOptions {
  course: Course
  assets?: AssetMap
}

/** Progreso de `buildScormZip`/`downloadScorm`: `percent` es relativo a la
 *  FASE actual (0-100), no acumulado entre fases — un curso grande sin
 *  comprimir puede tardar un buen rato (recomprimir audio de locución +
 *  generar el ZIP), así que conviene mostrarlo en vez de solo "Generando…". */
export interface ExportProgress {
  label: string
  percent: number
}

/**
 * Construye el ZIP SCORM 1.2 en memoria y devuelve un Blob.
 * Estructura: imsmanifest.xml + index.html + assets/** + data/course.json
 */
export async function buildScormZip(
  { course: courseWithDrafts, assets = {} }: ExportOptions,
  onProgress?: (p: ExportProgress) => void,
): Promise<Blob> {
  const zip = new JSZip()

  // 0) Pantallas marcadas «pendiente de revisión»: fuera del paquete real (la
  //    Vista estudiante sí las muestra, con borde rojo — excepción deliberada
  //    a la invariante «Vista estudiante = export», ver arquitectura-runtime.md
  //    y CLAUDE.md). A partir de aquí, `course` es ya la versión sin ellas
  //    (clon propio, independiente del store: se puede mutar sin más abajo).
  const course = stripFlaggedForReview(courseWithDrafts)

  // 0.5) Audio de NARRACIÓN: se recomprime aquí si `narration.compressAudio`
  //    está activo — el `.scormproj` conserva siempre el original a su
  //    calidad de generación; lo que viaja en el ZIP es la copia comprimida
  //    (ver «Compresión de audio de locución» en tts-narracion.md). El
  //    resultado SIEMPRE es mp3 (el codificador solo sabe producir eso), así
  //    que la ruta cambia de extensión — y con ella, toda referencia a ese
  //    audio en `course` (pantalla o ítem), ANTES de serializar `course.json`
  //    más abajo. Un fallo de compresión de un archivo concreto no aborta el
  //    export: ese archivo viaja con su ruta y contenido originales.
  const compressCfg = course.narration.compressAudio
  const compressedAssets: Record<string, Blob> = {}
  if (compressCfg.enabled) {
    const narrationPaths = listNarrationAudioPaths(course)
    const pathRemap = new Map<string, string>()
    for (let i = 0; i < narrationPaths.length; i++) {
      const path = narrationPaths[i]
      onProgress?.({
        label: `Comprimiendo audio de locución (${i + 1}/${narrationPaths.length})…`,
        percent: ((i + 1) / narrationPaths.length) * 100,
      })
      const val = assets[path]
      if (val == null) continue
      try {
        const compressed = await getCompressedAudio(path, val, compressCfg.kbps)
        const newPath = path.replace(/\.[^./]+$/, '.mp3')
        compressedAssets[newPath] = compressed
        if (newPath !== path) pathRemap.set(path, newPath)
      } catch {
        // se exporta el original para este archivo en vez de romper el export
      }
    }
    if (pathRemap.size) {
      for (const s of allScreens(course)) {
        const remapped = pathRemap.get(s.audio_src)
        if (remapped) s.audio_src = remapped
        const key = s.interaction ? itemsKeyOf(s.interaction.type) : undefined
        if (key) {
          const cfg = s.interaction!.config as Record<string, unknown>
          const list = Array.isArray(cfg[key]) ? (cfg[key] as Record<string, unknown>[]) : null
          list?.forEach((raw) => {
            const r = pathRemap.get(raw.audio_src as string)
            if (r) raw.audio_src = r
          })
        }
      }
    }
  }

  // 1) Carcasa (HTML/CSS/JS plano, idéntica a la vista estudiante)
  for (const f of getRuntimeFiles()) {
    zip.file(f.path, f.content)
  }

  // 2) Datos del curso (con las rutas de audio ya reescritas, si procede)
  zip.file('data/course.json', JSON.stringify(course, null, 2))

  // 3) Assets de media (imágenes, vídeos, audios, VTT...). Solo los REFERENCIADOS
  //    por el curso: así los huérfanos (versiones antiguas, pantallas borradas…)
  //    no engordan el ZIP. Al filtrar antes de aquí, los assets exclusivos de una
  //    pantalla en revisión tampoco viajan. Los audios recomprimidos sustituyen
  //    al original bajo su NUEVA ruta (`compressedAssets`); el original, bajo su
  //    ruta vieja, ya no está referenciado por `course` y se descarta solo.
  const referenced = collectAssetPaths(course)
  const assetPaths: string[] = []
  for (const [path, content] of Object.entries({ ...assets, ...compressedAssets })) {
    if (!referenced.has(path)) continue
    zip.file(path, content as any)
    assetPaths.push(path)
  }

  // 4) Metadatos LOM + manifiesto (incluye los assets en el listado de ficheros)
  zip.file('imslrm.xml', generateLomMetadata(course))
  zip.file('imsmanifest.xml', generateManifest(course, assetPaths))

  onProgress?.({ label: 'Generando el ZIP…', percent: 0 })
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }, (meta) => {
    onProgress?.({
      label: `Generando el ZIP…${meta.currentFile ? ` ${meta.currentFile}` : ''}`,
      percent: meta.percent,
    })
  })
}

/** Dispara la descarga del ZIP en el navegador. */
export async function downloadScorm(opts: ExportOptions, filename?: string, onProgress?: (p: ExportProgress) => void): Promise<void> {
  const blob = await buildScormZip(opts, onProgress)
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
