/**
 * Punto de entrada del exportador `.elpx`. Se carga con `import()` dinámico desde
 * el menú Archivo, de modo que su código (y los `msgs`/DTD incrustados) no entra
 * en el bundle principal si nunca se usa.
 */
import type { Course } from '../../schema/course.schema'
import type { AssetMap } from '../../export/exportScorm'
import { buildElpx, type ElpxExportResult } from './exportElpx'

export type { ElpxExportResult }
export { buildElpx }
export type { ExportSummary } from './types'

/** Versión de eXeLearning a la que apunta el exportador (rótulo del menú). */
export const ELPX_TARGET = 'eXeLearning 4.0.1+'

/** Genera el `.elpx` y dispara la descarga en el navegador. */
export async function downloadElpx(course: Course, assets: AssetMap = {}): Promise<ElpxExportResult> {
  const result = await buildElpx(course, assets)
  const url = URL.createObjectURL(result.blob)
  const a = document.createElement('a')
  a.href = url
  a.download = result.filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
  return result
}
