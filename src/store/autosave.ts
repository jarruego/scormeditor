import JSZip from 'jszip'
import { useCourseStore } from './courseStore'
import { safeParseCourse } from '../schema/course.schema'
import { migrate } from '../schema/migrations'
import { kvGet, kvSet } from './persistence'
import type { AssetMap } from '../export/exportScorm'
import { collectAssetPaths } from '../schema/assetRefs'

/**
 * Persistencia en dos niveles:
 *  - AUTOGUARDADO continuo en IndexedDB (course + assets), restaurado al recargar.
 *    Es instantáneo y no toca el disco.
 *  - PROYECTO en disco: un único archivo `.scormproj` (un ZIP con course.json +
 *    assets/). Se abre/guarda con diálogos de archivo normales. El guardado al
 *    archivo es MANUAL (botón Guardar / Ctrl+S); mientras tanto los cambios viven
 *    en IndexedDB. En navegadores con File System Access (Chrome/Edge) se mantiene
 *    un handle para reescribir el mismo archivo sin volver a preguntar; en el resto
 *    se abre con <input file> y se guarda como descarga.
 */

export const PROJECT_EXT = '.scormproj'

let projectHandle: any = null // FileSystemFileHandle del .scormproj vinculado
let timer: ReturnType<typeof setTimeout> | null = null
let started = false

const fsSupported =
  typeof (window as any).showSaveFilePicker === 'function' &&
  typeof (window as any).showOpenFilePicker === 'function'
export function isFsSupported() {
  return fsSupported
}

function courseId() {
  return useCourseStore.getState().course.course.id || 'curso'
}

async function ensurePermission(handle: any, request = false): Promise<boolean> {
  if (!handle?.queryPermission) return true
  const opts = { mode: 'readwrite' as const }
  if ((await handle.queryPermission(opts)) === 'granted') return true
  if (request && (await handle.requestPermission(opts)) === 'granted') return true
  return false
}

async function writeHandle(handle: any, data: BlobPart) {
  const w = await handle.createWritable()
  await w.write(data)
  await w.close()
}

// --- Recuperación automática en el navegador (IndexedDB) ---------------------
// Copia interna para no perder trabajo si se cierra sin guardar. No es el
// «guardado» que ve el usuario: ese es siempre el archivo .scormproj.

function scheduleSave() {
  if (timer) clearTimeout(timer)
  timer = setTimeout(doSave, 800)
}

/** Persiste el proyecto en IndexedDB (recuperación), incluido el flag «sin
 *  guardar» y el vínculo de nube (para no «olvidarlo» al recargar la página).
 *  Exportada para que la nube fuerce la persistencia inmediata tras
 *  abrir/subir un documento, igual que ya hace `openProject`. */
export async function persistToIndexedDb() {
  const { course, assets, projectDirty, cloudDocumentId, cloudOrgId, cloudTitle, cloudVersionId } = useCourseStore.getState()
  await kvSet('project', { course, assets, dirty: projectDirty, cloudDocumentId, cloudOrgId, cloudTitle, cloudVersionId })
}

async function doSave() {
  try {
    await persistToIndexedDb()
  } catch (e) {
    console.error('La copia de recuperación falló', e)
  }
}

// --- Empaquetado / lectura del archivo de proyecto (.scormproj = ZIP) --------

/** Construye el ZIP del proyecto en memoria: course.json + assets/ . Se
 *  reutiliza tal cual para subir a la nube (`src/cloud/documents.ts`): un
 *  documento-nube es el mismo ZIP, solo cambia dónde vive. */
export async function buildProjectBlob(): Promise<Blob> {
  const { course, assets } = useCourseStore.getState()
  const zip = new JSZip()
  zip.file('course.json', JSON.stringify(course, null, 2))
  for (const [path, content] of Object.entries(assets)) {
    zip.file(path, content as any) // las claves ya incluyen el prefijo assets/
  }
  // STORE (sin comprimir): el reempaquetado es casi instantáneo y los media ya
  // suelen venir comprimidos.
  return zip.generateAsync({ type: 'blob', compression: 'STORE' })
}

// MIME por extensión para los assets del ZIP: JSZip devuelve blobs SIN tipo y
// los object URLs de la vista previa heredan ese vacío. PNG/JPEG sobreviven
// porque el navegador los detecta por contenido, pero SVG y VTT no se detectan
// (un <img> con SVG sin image/svg+xml no se pinta). Extensiones desconocidas:
// se deja el blob tal cual (mismo comportamiento que antes).
const MIME_BY_EXT: Record<string, string> = {
  svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  gif: 'image/gif', webp: 'image/webp', avif: 'image/avif',
  mp4: 'video/mp4', webm: 'video/webm', ogv: 'video/ogg',
  mp3: 'audio/mpeg', m4a: 'audio/mp4', ogg: 'audio/ogg', wav: 'audio/wav',
  vtt: 'text/vtt',
}

/** Devuelve el blob con su MIME según la extensión de `name` (si le falta). */
function typedBlob(name: string, blob: Blob): Blob {
  if (blob.type) return blob
  const ext = name.split('.').pop()?.toLowerCase() || ''
  const mime = MIME_BY_EXT[ext]
  return mime ? new Blob([blob], { type: mime }) : blob
}

/**
 * Carga un proyecto al store desde un Blob/File. Acepta dos formatos:
 * - `.scormproj` (course.json en la raíz + assets/): el documento nativo.
 * - **ZIP SCORM exportado** (data/course.json): el paquete lleva el curso y sus
 *   assets dentro, así que se puede re-editar aunque solo se conserve el ZIP
 *   (misma decisión que eXeLearning con su content.xml). De la carcasa no se
 *   importa nada: solo entran los assets que el curso referencia.
 * Devuelve el formato detectado ('project' | 'scorm') o false si el JSON no valida.
 *
 * Se exporta para que abrir un documento-nube (`src/cloud/documents.ts`)
 * reutilice el mismo parser que abrir un `.scormproj` local: el formato es
 * idéntico, solo cambia de dónde viene el blob. Como «cargar contenido
 * nuevo» siempre desvincula cualquier documento-nube anterior, el llamante
 * de la nube debe fijar el vínculo (`setCloudLink`) DESPUÉS de llamar aquí.
 */
export async function loadProjectFromBlob(blob: Blob): Promise<'project' | 'scorm' | false> {
  const zip = await JSZip.loadAsync(blob)
  const courseFile = zip.file('course.json') || zip.file('data/course.json')
  if (!courseFile)
    throw new Error('El archivo no es un proyecto ni un SCORM de SCORMEditor (falta course.json).')
  const isScormZip = courseFile.name === 'data/course.json'
  const text = await courseFile.async('string')
  const ok = useCourseStore.getState().importJson(text) // parsea, migra y valida
  if (!ok) return false

  // En un ZIP SCORM conviven curso y carcasa (assets/css, assets/js…): se
  // importa solo lo que el curso referencia. En un .scormproj, todo (los
  // huérfanos son decisión del autor; hay purga manual).
  const referenced = isScormZip ? collectAssetPaths(useCourseStore.getState().course) : null
  const assets: AssetMap = {}
  for (const entry of Object.values(zip.files) as any[]) {
    if (entry.dir || entry.name === courseFile.name) continue
    if (referenced && !referenced.has(entry.name)) continue
    if (!referenced && entry.name === 'course.json') continue
    assets[entry.name] = typedBlob(entry.name, await entry.async('blob'))
  }
  useCourseStore.getState().replaceAssets(assets)
  // Un ZIP SCORM se IMPORTA, no se vincula: si se guardara encima, el paquete
  // dejaría de ser SCORM (perdería manifiesto y carcasa). Queda «Sin guardar»
  // para que el primer Ctrl+S pida un destino .scormproj nuevo.
  useCourseStore.getState().setProjectDirty(isScormZip)
  // Cargar contenido nuevo siempre desvincula cualquier documento-nube
  // anterior (un proyecto es local o es nube, nunca las dos cosas). Se hace
  // aquí, al final, para no desvincular nada si el import fallaba antes.
  useCourseStore.getState().setCloudLink(null, null, null)
  return isScormZip ? 'scorm' : 'project'
}

// --- Abrir / Guardar proyecto ------------------------------------------------

/** Desvincula cualquier archivo local (handle) — usado al importar un ZIP
 *  SCORM (nunca se vincula) y al abrir un documento-nube (`src/cloud/`), que
 *  por definición no tiene archivo local asociado. */
export async function clearLocalLink() {
  projectHandle = null
  await kvSet('projectHandle', null)
  useCourseStore.getState().setLinked(null)
}

/** Abre un `.scormproj` con el diálogo de archivo (Chrome/Edge) y lo vincula. */
export async function openProject(): Promise<boolean> {
  if (!fsSupported) return false
  let handle: any
  try {
    ;[handle] = await (window as any).showOpenFilePicker({
      types: [{ description: 'Proyecto SCORMEditor o ZIP SCORM', accept: { 'application/zip': [PROJECT_EXT, '.zip'] } }],
    })
  } catch {
    return false // el usuario canceló
  }
  const file = await handle.getFile()
  const kind = await loadProjectFromBlob(file)
  if (kind === 'project') {
    projectHandle = handle
    await kvSet('projectHandle', handle)
    useCourseStore.getState().setLinked(handle.name)
    await persistToIndexedDb()
  } else if (kind === 'scorm') {
    // Importado desde un ZIP SCORM: sin vincular (ver loadProjectFromBlob).
    await clearLocalLink()
    await persistToIndexedDb()
  }
  return kind !== false
}

/** Carga un proyecto desde un File (fallback sin File System Access). */
export async function openProjectFromFile(file: File): Promise<boolean> {
  const kind = await loadProjectFromBlob(file)
  if (kind !== false) {
    projectHandle = null // sin handle no podemos reescribir: Guardar descargará
    useCourseStore.getState().setLinked(kind === 'scorm' ? '' : file.name)
    await persistToIndexedDb()
  }
  return kind !== false
}

/**
 * Guarda el proyecto en su archivo vinculado (o pide destino la primera vez).
 * El permiso de escritura se (re)pide aquí de forma transparente: si caducó tras
 * recargar, el navegador lo solicita en este momento. Si el usuario lo deniega o
 * cancela, el proyecto sencillamente sigue marcado como «sin guardar».
 */
export async function saveProject(): Promise<void> {
  const blob = await buildProjectBlob()
  if (fsSupported) {
    if (!projectHandle) {
      let handle: any
      try {
        handle = await (window as any).showSaveFilePicker({
          suggestedName: `${courseId()}${PROJECT_EXT}`,
          types: [{ description: 'Proyecto SCORMEditor', accept: { 'application/zip': [PROJECT_EXT] } }],
        })
      } catch {
        return // el usuario canceló
      }
      projectHandle = handle
      await kvSet('projectHandle', handle)
      useCourseStore.getState().setLinked(handle.name)
      // Crear un archivo local nuevo desvincula cualquier documento-nube: a
      // partir de aquí esta copia se guarda en disco, no en la nube (acción
      // explícita en sentido contrario si se quiere volver a subir).
      useCourseStore.getState().setCloudLink(null, null, null)
    }
    if (!(await ensurePermission(projectHandle, true))) return // permiso denegado
    await writeHandle(projectHandle, blob)
  } else {
    // Fallback: descarga del archivo.
    downloadBlob(blob, `${courseId()}${PROJECT_EXT}`)
  }
  useCourseStore.getState().setProjectDirty(false)
  await persistToIndexedDb()
}

/** Guarda en un archivo NUEVO (forzando el diálogo de destino). */
export async function saveProjectAs(): Promise<void> {
  projectHandle = null
  await saveProject()
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

// --- Arranque ----------------------------------------------------------------

/** Restaura el proyecto autoguardado y arranca el autoguardado. Llamar una vez. */
export async function initAutoSave() {
  if (started) return
  started = true

  try {
    const saved = await kvGet<{
      course: unknown; assets: AssetMap; dirty?: boolean
      cloudDocumentId?: string | null; cloudOrgId?: string | null; cloudTitle?: string | null; cloudVersionId?: string | null
    }>('project')
    if (saved?.course) {
      const parsed = safeParseCourse(migrate(saved.course))
      if (parsed.success) {
        useCourseStore.getState().hydrate(parsed.data, saved.assets || {})
        // Restauramos el estado «sin guardar» para no afirmar «Guardado» si los
        // últimos cambios no llegaron a escribirse en el archivo antes de recargar.
        useCourseStore.getState().setProjectDirty(!!saved.dirty)
        // Restauramos también el vínculo de nube: sin esto, recargar la
        // página con un documento-nube abierto lo «olvidaría» en silencio.
        if (saved.cloudDocumentId) {
          useCourseStore.getState().setCloudLink(saved.cloudDocumentId, saved.cloudOrgId ?? null, saved.cloudTitle ?? null)
          useCourseStore.getState().setCloudVersion(saved.cloudVersionId ?? null)
        }
      }
    }
    if (fsSupported) {
      projectHandle = (await kvGet('projectHandle')) || null
      if (projectHandle) useCourseStore.getState().setLinked(projectHandle.name)
    }
  } catch (e) {
    console.error('No se pudo restaurar el proyecto', e)
  }

  useCourseStore.subscribe((state, prev) => {
    if (state.course !== prev.course || state.assets !== prev.assets) {
      useCourseStore.getState().setProjectDirty(true)
      scheduleSave()
    }
  })
}
