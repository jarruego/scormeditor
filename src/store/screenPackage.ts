import JSZip from 'jszip'
import { useCourseStore } from './courseStore'
import { SCHEMA_VERSION, safeParseCourse, type Course, type GlossaryTerm, type Screen } from '../schema/course.schema'
import { migrate } from '../schema/migrations'
import { collectAssetPaths } from '../schema/assetRefs'
import { allScreens } from '../schema/traverse'
import type { AssetMap } from '../export/exportScorm'
import { downloadBlob, typedBlob } from './autosave'

/**
 * Paquete de pantallas reutilizables (`.scormscreen`): ZIP con `screens.json`
 * + los `assets/…` que esas pantallas referencian (mismas rutas literales que
 * en un `.scormproj`). Sirve para llevar material de un curso a otro sin
 * tocar el formato del proyecto: exportar lee el curso abierto, importar
 * inserta copias (ids nuevos) en un contenedor del curso de destino.
 *
 * `screens.json` lleva `schema_version` del editor que lo generó: al importar,
 * las pantallas se envuelven en un curso mínimo y pasan por el mismo
 * `migrate()` + `safeParseCourse` que un `.scormproj`, así un paquete antiguo
 * se lee igual que un proyecto antiguo.
 */

export const SCREEN_PKG_EXT = '.scormscreen'
const FORMAT = 'scormeditor-screens'

type PackageJson = {
  format: typeof FORMAT
  schema_version: string
  exported_at: string
  source_course: string
  screens: Screen[]
  /** Términos del glosario del curso de origen que aparecen en las pantallas. */
  glossary: GlossaryTerm[]
}

export type ScreenPackage = {
  screens: Screen[]
  glossary: GlossaryTerm[]
  assets: Record<string, Blob>
  sourceCourse: string
}

// Clave de comparación de términos (y de búsqueda en el texto): sin acentos ni
// mayúsculas, mismo criterio laxo que los objetivos.
function norm(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Todo el texto de las pantallas (recorrido profundo de strings), normalizado. */
function screensText(screens: Screen[]): string {
  const parts: string[] = []
  const visit = (v: unknown) => {
    if (typeof v === 'string') parts.push(v)
    else if (Array.isArray(v)) v.forEach(visit)
    else if (v && typeof v === 'object') Object.values(v as Record<string, unknown>).forEach(visit)
  }
  visit(screens)
  return norm(parts.join('\n'))
}

/** Términos del glosario que aparecen como palabra completa en las pantallas. */
function glossaryUsedBy(screens: Screen[], glossary: GlossaryTerm[]): GlossaryTerm[] {
  const text = screensText(screens)
  return glossary.filter((g) => {
    const t = norm(g.term)
    return t && new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRe(t)}($|[^\\p{L}\\p{N}])`, 'u').test(text)
  })
}

function referencedPaths(screens: Screen[]): Set<string> {
  return collectAssetPaths({ intro_screens: screens } as unknown as Course)
}

function toBlob(val: AssetMap[string]): Blob {
  return val instanceof Blob ? val : new Blob([val as BlobPart])
}

/** Construye el `.scormscreen` con las pantallas `ids` (en el orden del árbol). */
export async function buildScreenPackage(ids: Set<string>): Promise<Blob> {
  const { course, assets } = useCourseStore.getState()
  const screens = allScreens(course).filter((s) => ids.has(s.id))
  const pkg: PackageJson = {
    format: FORMAT,
    schema_version: course.schema_version || SCHEMA_VERSION,
    exported_at: new Date().toISOString(),
    source_course: course.course.title,
    screens,
    glossary: glossaryUsedBy(screens, course.glossary),
  }
  const zip = new JSZip()
  zip.file('screens.json', JSON.stringify(pkg, null, 2))
  for (const path of referencedPaths(screens)) {
    if (assets[path] != null) zip.file(path, assets[path] as any)
  }
  return zip.generateAsync({ type: 'blob', compression: 'STORE' })
}

/** Nombre de archivo sugerido: el título de la pantalla, o «pantallas-N». */
function packageFileName(ids: Set<string>): string {
  const { course } = useCourseStore.getState()
  const first = allScreens(course).find((s) => ids.has(s.id))
  const base = ids.size === 1 && first?.title
    ? norm(first.title).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
    : ''
  return `${base || `pantallas-${ids.size}`}${SCREEN_PKG_EXT}`
}

export async function exportScreens(ids: Set<string>): Promise<void> {
  if (!ids.size) return
  downloadBlob(await buildScreenPackage(ids), packageFileName(ids))
}

/** Lee y valida un `.scormscreen` (lanza Error con un mensaje para el autor). */
export async function readScreenPackage(file: Blob): Promise<ScreenPackage> {
  let zip: JSZip
  try {
    zip = await JSZip.loadAsync(file)
  } catch {
    throw new Error(`El archivo no es un paquete de pantallas (${SCREEN_PKG_EXT}).`)
  }
  const entry = zip.file('screens.json')
  if (!entry) throw new Error(`El archivo no es un paquete de pantallas (${SCREEN_PKG_EXT}): falta screens.json.`)
  let raw: any
  try {
    raw = JSON.parse(await entry.async('string'))
  } catch (e) {
    throw new Error(`screens.json no es JSON válido: ${(e as Error).message}`)
  }
  if (raw?.format !== FORMAT || !Array.isArray(raw.screens))
    throw new Error(`El archivo no es un paquete de pantallas (${SCREEN_PKG_EXT}).`)
  // Curso mínimo envoltorio: todo lo demás tiene default en el esquema.
  const wrapped = migrate({
    schema_version: raw.schema_version,
    intro_screens: raw.screens,
    glossary: Array.isArray(raw.glossary) ? raw.glossary : [],
  })
  const parsed = safeParseCourse(wrapped)
  if (!parsed.success) {
    const detail = parsed.error.issues.slice(0, 3).map((i) => `${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(`Las pantallas del paquete no son válidas:\n${detail}`)
  }
  const screens = parsed.data.intro_screens
  const referenced = referencedPaths(screens)
  const assets: Record<string, Blob> = {}
  for (const e of Object.values(zip.files)) {
    if (e.dir || !referenced.has(e.name)) continue
    assets[e.name] = typedBlob(e.name, await e.async('blob'))
  }
  return { screens, glossary: parsed.data.glossary, assets, sourceCourse: String(raw.source_course ?? '') }
}

async function sameBytes(a: Blob, b: Blob): Promise<boolean> {
  if (a.size !== b.size) return false
  const [x, y] = await Promise.all([a.arrayBuffer(), b.arrayBuffer()])
  const u = new Uint8Array(x), v = new Uint8Array(y)
  for (let i = 0; i < u.length; i++) if (u[i] !== v[i]) return false
  return true
}

function renamedPath(path: string, taken: (p: string) => boolean): string {
  const dot = path.lastIndexOf('.')
  const slash = path.lastIndexOf('/')
  const [stem, ext] = dot > slash ? [path.slice(0, dot), path.slice(dot)] : [path, '']
  let p: string
  do p = `${stem}-${Math.random().toString(36).slice(2, 6)}${ext}`
  while (taken(p))
  return p
}

export type ImportResult = { screens: number; glossary: number; firstId: string | null }

/**
 * Inserta las pantallas del paquete en `containerId` (en `atIndex`, o al final).
 * Assets: si la ruta ya existe en el proyecto con el mismo contenido se
 * reutiliza; si existe con contenido distinto, el del paquete entra con un
 * nombre nuevo y se reescriben sus referencias en las pantallas importadas
 * (nunca se pisa un binario que ya usa el curso de destino). Ids de pantalla e
 * interacción, nuevos (lo hace el store). Glosario: solo los términos que el
 * destino aún no tiene.
 */
export async function importScreenPackage(pkg: ScreenPackage, containerId: string, atIndex?: number): Promise<ImportResult> {
  const store = useCourseStore.getState()
  const current = store.assets
  const renames: [string, string][] = []
  const toAdd: Record<string, Blob> = {}
  const taken = (p: string) => p in current || p in toAdd || p in pkg.assets
  for (const [path, blob] of Object.entries(pkg.assets)) {
    const existing = current[path]
    if (existing == null) { toAdd[path] = blob; continue }
    if (await sameBytes(toBlob(existing), blob)) continue
    const p = renamedPath(path, taken)
    renames.push([path, p])
    toAdd[p] = blob
  }
  let json = JSON.stringify(pkg.screens)
  // Las rutas más largas primero, por si una fuera prefijo de otra.
  for (const [from, to] of renames.sort((a, b) => b[0].length - a[0].length))
    json = json.split(from).join(to)
  const screens: Screen[] = JSON.parse(json)

  const have = new Set(store.course.glossary.map((g) => norm(g.term)))
  const glossary = pkg.glossary.filter((g) => {
    const k = norm(g.term)
    if (!k || have.has(k)) return false
    have.add(k)
    return true
  })

  for (const [path, blob] of Object.entries(toAdd)) store.addAsset(path, blob)
  const firstId = store.insertScreens(containerId, screens, atIndex, glossary)
  return { screens: firstId ? screens.length : 0, glossary: firstId ? glossary.length : 0, firstId }
}
