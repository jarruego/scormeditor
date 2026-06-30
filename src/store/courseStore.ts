import { create } from 'zustand'
import type { Course, Screen, ScreenType } from '../schema/course.schema'
import { Course as CourseSchema, Screen as ScreenSchema } from '../schema/course.schema'
import { migrate } from '../schema/migrations'
import { sampleCourse } from '../schema/sample-course'
import type { AssetMap } from '../export/exportScorm'

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x))
}

function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`
}

/** Crea una pantalla vacía válida según el schema. */
function blankScreen(type: ScreenType = 'content'): Screen {
  return ScreenSchema.parse({ id: newId('s'), type, title: 'Nueva pantalla' })
}

interface Located { mi: number; ui: number; si: number }

export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

interface CourseState {
  course: Course
  assets: AssetMap
  selectedScreenId: string | null
  importError: string | null

  // Persistencia / autoguardado
  saveState: SaveState
  linkedFileName: string | null
  linkedNeedsPermission: boolean
  linkedIsFolder: boolean
  setSaveState: (s: SaveState) => void
  setLinked: (name: string | null, needsPermission?: boolean, isFolder?: boolean) => void
  hydrate: (course: Course, assets: AssetMap) => void
  replaceAssets: (assets: AssetMap) => void

  setCourse: (c: Course) => void
  importJson: (text: string) => boolean
  exportJson: () => string
  resetSample: () => void

  selectScreen: (id: string | null) => void
  locate: (id: string) => Located | null
  getScreen: (id: string) => Screen | null
  updateScreen: (id: string, patch: Partial<Screen>) => void
  changeScreenType: (id: string, type: ScreenType) => void
  addScreen: (unitId: string, afterId?: string) => void
  duplicateScreen: (id: string) => void
  deleteScreen: (id: string) => void
  /** Reordena dentro de la unidad o mueve entre unidades. */
  moveScreen: (id: string, toUnitId: string, toIndex: number) => void

  addAsset: (path: string, blob: Blob) => void
}

export const useCourseStore = create<CourseState>((set, get) => ({
  course: sampleCourse,
  assets: {},
  selectedScreenId: sampleCourse.modules[0]?.units[0]?.screens[0]?.id ?? null,
  importError: null,

  saveState: 'idle',
  linkedFileName: null,
  linkedNeedsPermission: false,
  linkedIsFolder: false,
  setSaveState: (s) => set({ saveState: s }),
  setLinked: (name, needsPermission = false, isFolder = false) =>
    set({ linkedFileName: name, linkedNeedsPermission: needsPermission, linkedIsFolder: isFolder }),
  hydrate: (course, assets) =>
    set({ course, assets, importError: null, selectedScreenId: course.modules[0]?.units[0]?.screens[0]?.id ?? null }),
  replaceAssets: (assets) => set({ assets }),

  setCourse: (c) => set({ course: c }),

  importJson: (text) => {
    try {
      const raw = migrate(JSON.parse(text))
      const parsed = CourseSchema.safeParse(raw)
      if (!parsed.success) {
        set({ importError: parsed.error.issues.slice(0, 5).map((i) => `${i.path.join('.')}: ${i.message}`).join('\n') })
        return false
      }
      set({ course: parsed.data, importError: null, selectedScreenId: parsed.data.modules[0]?.units[0]?.screens[0]?.id ?? null })
      return true
    } catch (e) {
      set({ importError: `JSON inválido: ${(e as Error).message}` })
      return false
    }
  },

  exportJson: () => JSON.stringify(get().course, null, 2),

  resetSample: () => set({ course: sampleCourse, importError: null, selectedScreenId: sampleCourse.modules[0]?.units[0]?.screens[0]?.id ?? null }),

  selectScreen: (id) => set({ selectedScreenId: id }),

  locate: (id) => {
    const { course } = get()
    for (let mi = 0; mi < course.modules.length; mi++)
      for (let ui = 0; ui < course.modules[mi].units.length; ui++) {
        const si = course.modules[mi].units[ui].screens.findIndex((s) => s.id === id)
        if (si >= 0) return { mi, ui, si }
      }
    return null
  },

  getScreen: (id) => {
    const loc = get().locate(id)
    if (!loc) return null
    return get().course.modules[loc.mi].units[loc.ui].screens[loc.si]
  },

  updateScreen: (id, patch) => {
    const loc = get().locate(id)
    if (!loc) return
    const course = clone(get().course)
    const cur = course.modules[loc.mi].units[loc.ui].screens[loc.si]
    course.modules[loc.mi].units[loc.ui].screens[loc.si] = { ...cur, ...patch }
    set({ course })
  },

  changeScreenType: (id, type) => {
    get().updateScreen(id, { type })
  },

  addScreen: (unitId, afterId) => {
    const course = clone(get().course)
    outer: for (const m of course.modules)
      for (const u of m.units)
        if (u.id === unitId) {
          const s = blankScreen()
          const idx = afterId ? u.screens.findIndex((x) => x.id === afterId) + 1 : u.screens.length
          u.screens.splice(idx, 0, s)
          set({ course, selectedScreenId: s.id })
          break outer
        }
  },

  duplicateScreen: (id) => {
    const loc = get().locate(id)
    if (!loc) return
    const course = clone(get().course)
    const screens = course.modules[loc.mi].units[loc.ui].screens
    const copy: Screen = { ...clone(screens[loc.si]), id: newId('s'), title: screens[loc.si].title + ' (copia)' }
    if (copy.interaction) copy.interaction.id = newId('i')
    screens.splice(loc.si + 1, 0, copy)
    set({ course, selectedScreenId: copy.id })
  },

  deleteScreen: (id) => {
    const loc = get().locate(id)
    if (!loc) return
    const course = clone(get().course)
    course.modules[loc.mi].units[loc.ui].screens.splice(loc.si, 1)
    set({ course, selectedScreenId: get().selectedScreenId === id ? null : get().selectedScreenId })
  },

  moveScreen: (id, toUnitId, toIndex) => {
    const loc = get().locate(id)
    if (!loc) return
    const course = clone(get().course)
    const [moved] = course.modules[loc.mi].units[loc.ui].screens.splice(loc.si, 1)
    outer: for (const m of course.modules)
      for (const u of m.units)
        if (u.id === toUnitId) {
          const clamped = Math.max(0, Math.min(toIndex, u.screens.length))
          u.screens.splice(clamped, 0, moved)
          break outer
        }
    set({ course })
  },

  addAsset: (path, blob) => set({ assets: { ...get().assets, [path]: blob } }),
}))
