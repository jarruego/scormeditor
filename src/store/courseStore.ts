import { create } from 'zustand'
import type { Course, Screen, ScreenType, UnitTest, ScormConfig, ShellConfig, GlossaryTerm, BibliographyEntry } from '../schema/course.schema'
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
function blankScreen(preset?: Partial<Screen>): Screen {
  // El parse rellena los defaults del esquema sobre lo que traiga el preset.
  return ScreenSchema.parse({ id: newId('s'), type: 'content', title: 'Nueva pantalla', ...(preset || {}) })
}

interface Located { mi: number; ui: number; si: number }

export type Tab = 'editor' | 'preview' | 'validation' | 'report'

/** Ventana de ajustes abierta (vive en el store para poder abrirla desde Validación). */
export type SettingsModalKind = 'course' | 'narration' | 'appearance'

/** Instantánea para el historial de deshacer/rehacer. */
type CourseSnapshot = { course: Course; selectedScreenId: string | null }

interface CourseState {
  course: Course
  assets: AssetMap
  selectedScreenId: string | null
  importError: string | null

  // Pestaña activa de la interfaz
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
  /** Selecciona la pantalla Y cambia a la pestaña Editor (enlaces desde Validación/Informe). */
  goToScreen: (id: string) => void
  /** Modal de Ajustes abierto (null = cerrado). */
  settingsModal: SettingsModalKind | null
  setSettingsModal: (m: SettingsModalKind | null) => void

  // Persistencia / autoguardado
  linkedFileName: string | null // archivo de proyecto vinculado, si lo hay
  projectDirty: boolean // cambios sin guardar en el archivo de proyecto
  setProjectDirty: (dirty: boolean) => void
  setLinked: (name: string | null) => void
  hydrate: (course: Course, assets: AssetMap) => void
  replaceAssets: (assets: AssetMap) => void

  setCourse: (c: Course) => void
  importJson: (text: string) => boolean
  resetSample: () => void

  selectScreen: (id: string | null) => void
  locate: (id: string) => Located | null
  getScreen: (id: string) => Screen | null
  updateScreen: (id: string, patch: Partial<Screen>) => void
  changeScreenType: (id: string, type: ScreenType) => void
  /** Añade una pantalla; `preset` permite plantillas (texto+imagen, actividad…). */
  addScreen: (unitId: string, afterId?: string, preset?: Partial<Screen>) => void
  duplicateScreen: (id: string) => void
  deleteScreen: (id: string) => void
  /** Reordena dentro de la unidad o mueve entre unidades. */
  moveScreen: (id: string, toUnitId: string, toIndex: number) => void
  /** Reemplaza el test final (`assessments.final_test`); `null` lo elimina. */
  setFinalTest: (test: UnitTest | null) => void
  /** Actualiza la config SCORM (nota mínima, reglas de finalización, etc.). */
  updateScorm: (patch: Partial<ScormConfig>) => void
  /** Actualiza la config de la carcasa (marca, color, animaciones…). */
  updateShell: (patch: Partial<ShellConfig>) => void
  /** Pone el mismo tiempo mínimo (s) en TODAS las pantallas del curso. */
  setAllMinTime: (seconds: number) => void
  /** Actualiza los metadatos del curso (título principal, subtítulo, entidad…). */
  updateCourseInfo: (patch: Partial<Course['course']>) => void
  /** Renombra un módulo (título estructural del menú lateral). */
  updateModule: (id: string, patch: { title?: string }) => void
  /** Renombra una unidad (título estructural del menú lateral). */
  updateUnit: (id: string, patch: { title?: string; summary?: string }) => void
  /** Reemplaza el glosario completo (edición del panel Glosario). */
  setGlossary: (terms: GlossaryTerm[]) => void
  /** Reemplaza la bibliografía completa (panel Recursos y bibliografía). */
  setBibliography: (entries: BibliographyEntry[]) => void

  addAsset: (path: string, blob: Blob) => void
  /** Borra un binario del mapa de assets (irreversible: no entra en el historial). */
  removeAsset: (path: string) => void

  // Historial de cambios (deshacer / rehacer)
  past: CourseSnapshot[]
  future: CourseSnapshot[]
  undo: () => void
  redo: () => void
}

export const useCourseStore = create<CourseState>((set, get) => {
  // ---- Historial (deshacer / rehacer) -----------------------------------
  const COALESCE_MS = 400 // ediciones de texto seguidas dentro de esta ventana = 1 paso
  const MAX_HISTORY = 50
  let lastKey: string | null = null
  let lastTime = 0

  // Apila el estado ACTUAL en `past` antes de aplicar una mutación e invalida el
  // `future` (rehacer). Si la acción se agrupa con la anterior (misma clave y
  // dentro de la ventana de tiempo) no crea un paso nuevo: así un párrafo entero
  // tecleado se deshace de una vez en lugar de letra a letra.
  function snapshot(coalesceKey?: string) {
    const now = Date.now()
    const coalesce = !!coalesceKey && coalesceKey === lastKey && now - lastTime < COALESCE_MS
    lastKey = coalesceKey ?? null
    lastTime = now
    if (coalesce) {
      set({ future: [] })
      return
    }
    const { past, course, selectedScreenId } = get()
    const entry: CourseSnapshot = { course, selectedScreenId }
    const next = past.length >= MAX_HISTORY ? [...past.slice(1), entry] : [...past, entry]
    set({ past: next, future: [] })
  }
  function resetCoalesce() {
    lastKey = null
    lastTime = 0
  }

  return {
  course: sampleCourse,
  assets: {},
  selectedScreenId: sampleCourse.modules[0]?.units[0]?.screens[0]?.id ?? null,
  importError: null,

  activeTab: 'editor',
  setActiveTab: (tab) => set({ activeTab: tab }),
  goToScreen: (id) => set({ selectedScreenId: id, activeTab: 'editor' }),
  settingsModal: null,
  setSettingsModal: (m) => set({ settingsModal: m }),

  past: [],
  future: [],

  linkedFileName: null,
  projectDirty: false,
  setProjectDirty: (dirty) => set({ projectDirty: dirty }),
  setLinked: (name) => set({ linkedFileName: name }),
  hydrate: (course, assets) => {
    resetCoalesce()
    set({ course, assets, importError: null, past: [], future: [], selectedScreenId: course.modules[0]?.units[0]?.screens[0]?.id ?? null })
  },
  replaceAssets: (assets) => set({ assets }),

  setCourse: (c) => {
    resetCoalesce()
    set({ course: c, past: [], future: [] })
  },

  importJson: (text) => {
    try {
      const raw = migrate(JSON.parse(text))
      const parsed = CourseSchema.safeParse(raw)
      if (!parsed.success) {
        set({ importError: parsed.error.issues.slice(0, 5).map((i) => `${i.path.join('.')}: ${i.message}`).join('\n') })
        return false
      }
      resetCoalesce()
      set({ course: parsed.data, importError: null, past: [], future: [], selectedScreenId: parsed.data.modules[0]?.units[0]?.screens[0]?.id ?? null })
      return true
    } catch (e) {
      set({ importError: `JSON inválido: ${(e as Error).message}` })
      return false
    }
  },

  resetSample: () => {
    resetCoalesce()
    set({ course: sampleCourse, importError: null, past: [], future: [], selectedScreenId: sampleCourse.modules[0]?.units[0]?.screens[0]?.id ?? null })
  },

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
    snapshot(`update:${id}`)
    const course = clone(get().course)
    const cur = course.modules[loc.mi].units[loc.ui].screens[loc.si]
    course.modules[loc.mi].units[loc.ui].screens[loc.si] = { ...cur, ...patch }
    set({ course })
  },

  changeScreenType: (id, type) => {
    get().updateScreen(id, { type })
  },

  setFinalTest: (test) => {
    snapshot()
    const course = clone(get().course)
    course.assessments = { ...course.assessments, final_test: test }
    set({ course })
  },

  updateScorm: (patch) => {
    snapshot()
    const course = clone(get().course)
    course.scorm = { ...course.scorm, ...patch }
    set({ course })
  },

  updateShell: (patch) => {
    snapshot()
    const course = clone(get().course)
    course.shell = { ...course.shell, ...patch }
    set({ course })
  },

  setAllMinTime: (seconds) => {
    snapshot()
    const course = clone(get().course)
    for (const m of course.modules)
      for (const u of m.units)
        for (const s of u.screens) s.min_time_seconds = seconds
    set({ course })
  },

  // Los renombrados y la edición de glosario/bibliografía se coalescen por clave
  // (como updateScreen): teclear un título entero = un solo paso de deshacer.
  updateCourseInfo: (patch) => {
    snapshot('courseinfo')
    const course = clone(get().course)
    course.course = { ...course.course, ...patch }
    set({ course })
  },

  updateModule: (id, patch) => {
    if (!get().course.modules.some((x) => x.id === id)) return
    snapshot(`module:${id}`)
    const course = clone(get().course)
    Object.assign(course.modules.find((x) => x.id === id)!, patch)
    set({ course })
  },

  updateUnit: (id, patch) => {
    if (!get().course.modules.some((m) => m.units.some((u) => u.id === id))) return
    snapshot(`unit:${id}`)
    const course = clone(get().course)
    for (const m of course.modules) {
      const u = m.units.find((x) => x.id === id)
      if (u) {
        Object.assign(u, patch)
        break
      }
    }
    set({ course })
  },

  setGlossary: (terms) => {
    snapshot('glossary')
    const course = clone(get().course)
    course.glossary = terms
    set({ course })
  },

  setBibliography: (entries) => {
    snapshot('bibliography')
    const course = clone(get().course)
    course.bibliography = entries
    set({ course })
  },

  addScreen: (unitId, afterId, preset) => {
    snapshot()
    const course = clone(get().course)
    outer: for (const m of course.modules)
      for (const u of m.units)
        if (u.id === unitId) {
          const s = blankScreen(preset)
          const idx = afterId ? u.screens.findIndex((x) => x.id === afterId) + 1 : u.screens.length
          u.screens.splice(idx, 0, s)
          set({ course, selectedScreenId: s.id })
          break outer
        }
  },

  duplicateScreen: (id) => {
    const loc = get().locate(id)
    if (!loc) return
    snapshot()
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
    snapshot()
    const course = clone(get().course)
    course.modules[loc.mi].units[loc.ui].screens.splice(loc.si, 1)
    set({ course, selectedScreenId: get().selectedScreenId === id ? null : get().selectedScreenId })
  },

  moveScreen: (id, toUnitId, toIndex) => {
    const loc = get().locate(id)
    if (!loc) return
    snapshot()
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

  removeAsset: (path) => {
    const assets = { ...get().assets }
    if (path in assets) {
      delete assets[path]
      set({ assets })
    }
  },

  undo: () => {
    const { past, future, course, selectedScreenId } = get()
    if (past.length === 0) return
    const previous = past[past.length - 1]
    set({
      course: previous.course,
      selectedScreenId: previous.selectedScreenId,
      past: past.slice(0, -1),
      future: [{ course, selectedScreenId }, ...future],
    })
    resetCoalesce()
  },

  redo: () => {
    const { past, future, course, selectedScreenId } = get()
    if (future.length === 0) return
    const nextState = future[0]
    set({
      course: nextState.course,
      selectedScreenId: nextState.selectedScreenId,
      past: [...past, { course, selectedScreenId }],
      future: future.slice(1),
    })
    resetCoalesce()
  },
  }
})
