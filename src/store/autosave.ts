import { useCourseStore } from './courseStore'
import { safeParseCourse } from '../schema/course.schema'
import { migrate } from '../schema/migrations'
import { kvGet, kvSet, kvDel } from './persistence'
import type { AssetMap } from '../export/exportScorm'

/**
 * Autoguardado:
 *  - SIEMPRE en IndexedDB (course + assets), restaurado al recargar.
 *  - OPCIONAL en disco (File System Access API; Chrome/Edge):
 *      · ARCHIVO: solo course.json.
 *      · CARPETA: proyecto portable = course.json + assets/** (recomendado).
 *    Archivo y carpeta son mutuamente excluyentes como destino.
 */

let fileHandle: any = null // FileSystemFileHandle (destino = archivo)
let dirHandle: any = null // FileSystemDirectoryHandle (destino = carpeta)
let lastAssetsWritten: AssetMap | null = null // evita reescribir assets si no cambian
let timer: ReturnType<typeof setTimeout> | null = null
let started = false

const fsSupported = typeof (window as any).showSaveFilePicker === 'function'
export function isFsSupported() {
  return fsSupported
}

async function ensurePermission(handle: any, request = false): Promise<boolean> {
  if (!handle?.queryPermission) return true
  const opts = { mode: 'readwrite' as const }
  if ((await handle.queryPermission(opts)) === 'granted') return true
  if (request && (await handle.requestPermission(opts)) === 'granted') return true
  return false
}

async function writeHandle(handle: any, data: BlobPart | string) {
  const w = await handle.createWritable()
  await w.write(data)
  await w.close()
}

/** Escribe un archivo dentro de la carpeta, creando subcarpetas (assets/img/…). */
async function writeInDir(dir: any, path: string, data: BlobPart | string) {
  const parts = path.split('/')
  const name = parts.pop() as string
  let d = dir
  for (const p of parts) d = await d.getDirectoryHandle(p, { create: true })
  const fh = await d.getFileHandle(name, { create: true })
  await writeHandle(fh, data)
}

/** Lee recursivamente la carpeta assets/ del proyecto a un AssetMap. */
async function readDirAssets(dir: any): Promise<AssetMap> {
  const map: AssetMap = {}
  async function walk(handle: any, path: string) {
    for await (const [name, h] of handle.entries()) {
      const childPath = path ? `${path}/${name}` : name
      if (h.kind === 'directory') await walk(h, childPath)
      else map[childPath] = await (h as any).getFile()
    }
  }
  try {
    const assetsDir = await dir.getDirectoryHandle('assets')
    await walk(assetsDir, 'assets')
  } catch {
    /* sin carpeta assets */
  }
  return map
}

function scheduleSave() {
  useCourseStore.getState().setSaveState('saving')
  if (timer) clearTimeout(timer)
  timer = setTimeout(doSave, 800)
}

async function doSave() {
  const { course, assets } = useCourseStore.getState()
  const json = JSON.stringify(course, null, 2)
  try {
    await kvSet('project', { course, assets })

    if (dirHandle) {
      if (await ensurePermission(dirHandle)) {
        await writeInDir(dirHandle, 'course.json', json)
        if (assets !== lastAssetsWritten) {
          for (const [path, val] of Object.entries(assets)) {
            await writeInDir(dirHandle, path, val instanceof Blob ? val : new Blob([val as BlobPart]))
          }
          lastAssetsWritten = assets
        }
        useCourseStore.getState().setLinked(dirHandle.name, false, true)
      } else {
        useCourseStore.getState().setLinked(dirHandle.name, true, true)
      }
    } else if (fileHandle) {
      if (await ensurePermission(fileHandle)) {
        await writeHandle(fileHandle, json)
        useCourseStore.getState().setLinked(fileHandle.name, false, false)
      } else {
        useCourseStore.getState().setLinked(fileHandle.name, true, false)
      }
    }
    useCourseStore.getState().setSaveState('saved')
  } catch (e) {
    console.error('Autoguardado falló', e)
    useCourseStore.getState().setSaveState('error')
  }
}

/** Carga el proyecto guardado y arranca el autoguardado. Llamar una vez. */
export async function initAutoSave() {
  if (started) return
  started = true

  try {
    const saved = await kvGet<{ course: unknown; assets: AssetMap }>('project')
    if (saved?.course) {
      const parsed = safeParseCourse(migrate(saved.course))
      if (parsed.success) useCourseStore.getState().hydrate(parsed.data, saved.assets || {})
    }
    if (fsSupported) {
      dirHandle = (await kvGet('dirHandle')) || null
      fileHandle = dirHandle ? null : (await kvGet('fileHandle')) || null
      const h = dirHandle || fileHandle
      if (h) {
        const granted = await ensurePermission(h)
        useCourseStore.getState().setLinked(h.name, !granted, !!dirHandle)
      }
    }
  } catch (e) {
    console.error('No se pudo restaurar el proyecto', e)
  }

  useCourseStore.subscribe((state, prev) => {
    if (state.course !== prev.course || state.assets !== prev.assets) scheduleSave()
  })

  if (useCourseStore.getState().saveState === 'idle') useCourseStore.getState().setSaveState('saved')
}

/** Vincula (o cambia) un ARCHIVO de disco donde autoguardar course.json. */
export async function linkSaveFile() {
  if (!fsSupported) return
  const id = useCourseStore.getState().course.course.id || 'curso'
  const h = await (window as any).showSaveFilePicker({
    suggestedName: `${id}.json`,
    types: [{ description: 'Curso SCORMEditor (JSON)', accept: { 'application/json': ['.json'] } }],
  })
  fileHandle = h
  dirHandle = null
  lastAssetsWritten = null
  await kvSet('fileHandle', h)
  await kvDel('dirHandle')
  await doSave()
}

/** Vincula (o cambia) una CARPETA de proyecto (course.json + assets/). */
export async function linkSaveFolder() {
  if (!fsSupported) return
  const h = await (window as any).showDirectoryPicker({ mode: 'readwrite' })
  dirHandle = h
  fileHandle = null
  lastAssetsWritten = null
  await kvSet('dirHandle', h)
  await kvDel('fileHandle')
  await doSave()
}

/** Abre un course.json del disco y lo vincula como archivo. */
export async function openProjectFile() {
  if (!fsSupported) return
  const [handle] = await (window as any).showOpenFilePicker({
    types: [{ description: 'Curso SCORMEditor (JSON)', accept: { 'application/json': ['.json'] } }],
  })
  const file = await handle.getFile()
  const ok = useCourseStore.getState().importJson(await file.text())
  if (ok) {
    fileHandle = handle
    dirHandle = null
    lastAssetsWritten = null
    await kvSet('fileHandle', handle)
    await kvDel('dirHandle')
    useCourseStore.getState().setLinked(handle.name, false, false)
  }
}

/** Abre una CARPETA de proyecto (course.json + assets/) y la vincula. */
export async function openProjectFolder() {
  if (!fsSupported) return
  const dir = await (window as any).showDirectoryPicker({ mode: 'readwrite' })
  const courseHandle = await dir.getFileHandle('course.json')
  const file = await courseHandle.getFile()
  const ok = useCourseStore.getState().importJson(await file.text())
  if (ok) {
    const assets = await readDirAssets(dir)
    useCourseStore.getState().replaceAssets(assets)
    dirHandle = dir
    fileHandle = null
    lastAssetsWritten = null
    await kvSet('dirHandle', dir)
    await kvDel('fileHandle')
    useCourseStore.getState().setLinked(dir.name, false, true)
  }
}

/** Reotorga permiso al destino vinculado (requiere gesto del usuario). */
export async function reconnectFile() {
  const h = dirHandle || fileHandle
  if (!h) return
  if (await ensurePermission(h, true)) {
    useCourseStore.getState().setLinked(h.name, false, !!dirHandle)
    await doSave()
  }
}
