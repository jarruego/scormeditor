import { create } from 'zustand'
import type { Course, Screen, ScreenInput, ScreenType, InteractionType, UnitTest, ScormConfig, ShellConfig, GlossaryTerm, BibliographyEntry } from '../schema/course.schema'
import { Course as CourseSchema, Screen as ScreenSchema, Interaction as InteractionSchema } from '../schema/course.schema'
import { interactionRecipe, migrateInteractionData } from '../schema/interactionRecipes'
import { migrate } from '../schema/migrations'
import { sampleCourse } from '../schema/sample-course'
import { isAssetReferenced, orphanAssetPaths } from '../schema/assetRefs'
import { normalizeObjective } from '../validation/objectives'
import { buildTranscript } from '../tts/buildTranscript'
import type { AssetMap } from '../export/exportScorm'

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x))
}

function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`
}

/** Crea una pantalla vacía válida según el schema. */
function blankScreen(preset?: Partial<ScreenInput>): Screen {
  // El parse rellena los defaults del esquema sobre lo que traiga el preset.
  return ScreenSchema.parse({ id: newId('s'), type: 'content', title: 'Nueva pantalla', ...(preset || {}) })
}

interface Located { mi: number; ui: number; si: number }

export type Tab = 'editor' | 'preview' | 'validation' | 'report'

/** Ventana de ajustes abierta (vive en el store para poder abrirla desde Validación). */
export type SettingsModalKind = 'course' | 'narration' | 'appearance' | 'objectives' | 'shortcuts' | 'help'

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
  /** Curso mínimo vacío (un módulo/unidad con portada); vacía también los assets. */
  resetEmpty: () => void
  /** Añade un módulo al final (con una unidad vacía dentro). */
  addModule: () => void
  /** Añade una unidad vacía al final del módulo. */
  addUnit: (moduleId: string) => void
  /** Elimina la unidad con sus pantallas (la confirmación vive en la UI). */
  removeUnit: (id: string) => void
  /** Elimina el módulo con sus unidades y pantallas (confirmación en la UI). */
  removeModule: (id: string) => void
  /** Reordena el módulo dentro del curso (dir: -1 sube, +1 baja). */
  moveModule: (id: string, dir: -1 | 1) => void
  /** Reordena la unidad (dir: -1 sube, +1 baja). Desde el extremo de su módulo
   *  cruza al adyacente: al final del anterior o al principio del siguiente. */
  moveUnit: (id: string, dir: -1 | 1) => void

  selectScreen: (id: string | null) => void
  locate: (id: string) => Located | null
  getScreen: (id: string) => Screen | null
  updateScreen: (id: string, patch: Partial<Screen>) => void
  changeScreenType: (id: string, type: ScreenType) => void
  /** Cambia el tipo de la interacción de una pantalla migrando el contenido
   *  compatible (misma familia) y descartando el resto — nunca deja claves
   *  huérfanas de otros tipos en `config`. La confirmación de pérdida vive en
   *  la UI (`migrateInteractionData(...).lossy`). Paso de historial propio. */
  changeInteractionType: (screenId: string, type: InteractionType) => void
  /** Añade una pantalla; `preset` permite recetas (texto+imagen, actividad…) y
   *  `atIndex` fija la posición en la unidad (si falta: tras `afterId` o al final). */
  addScreen: (unitId: string, afterId?: string, preset?: Partial<ScreenInput>, atIndex?: number) => void
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
  /** Actualiza la config de narración del curso (curso narrado auto/sí/no). */
  updateNarration: (patch: Partial<Course['narration']>) => void
  /** Rellena la transcripción de las pantallas narrables que la tienen VACÍA
   *  (nunca sobrescribe una existente). Devuelve cuántas rellenó. */
  fillMissingTranscripts: () => number
  /** Pone el mismo tiempo mínimo (s) en TODAS las pantallas del curso. */
  setAllMinTime: (seconds: number) => void
  /** Actualiza los metadatos del curso (título principal, subtítulo, entidad…). */
  updateCourseInfo: (patch: Partial<Course['course']>) => void
  /** Renombra un módulo (título estructural del menú lateral). */
  updateModule: (id: string, patch: { title?: string }) => void
  /** Renombra una unidad (título estructural del menú lateral). */
  updateUnit: (id: string, patch: { title?: string; summary?: string }) => void
  /** Renombra un objetivo de aprendizaje en TODOS sus usos (pantallas,
   *  interacciones y preguntas de test; comparación normalizada). */
  renameObjective: (from: string, to: string) => void
  /** Quita un objetivo de todos sus usos (deja el campo vacío). */
  removeObjective: (text: string) => void
  /** Reemplaza el glosario completo (edición del panel Glosario). */
  setGlossary: (terms: GlossaryTerm[]) => void
  setGlossaryTitle: (title: string) => void
  /** Reemplaza la bibliografía completa (panel Recursos y bibliografía). */
  setBibliography: (entries: BibliographyEntry[]) => void
  setBibliographyTitle: (title: string) => void

  addAsset: (path: string, blob: Blob) => void
  /** Borra un binario del mapa de assets (irreversible: no entra en el historial). */
  removeAsset: (path: string) => void
  /** Purga los assets huérfanos (sin referencia en el curso). Devuelve cuántos borró. */
  pruneOrphanAssets: () => number

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

  // Sustituye un objetivo por otro texto ('' = quitarlo) en todos sus usos:
  // pantallas, interacciones y preguntas de test (comparación normalizada).
  function remapObjective(from: string, to: string) {
    const key = normalizeObjective(from)
    if (!key) return
    snapshot()
    const course = clone(get().course)
    const apply = (v: string) => (normalizeObjective(v) === key ? to : v)
    for (const m of course.modules)
      for (const u of m.units)
        for (const s of u.screens) {
          s.objective = apply(s.objective)
          if (s.interaction) s.interaction.learning_objective = apply(s.interaction.learning_objective ?? '')
        }
    const tests = [...course.assessments.unit_tests, ...(course.assessments.final_test ? [course.assessments.final_test] : [])]
    for (const t of tests)
      for (const q of t.questions) q.learning_objective = apply(q.learning_objective ?? '')
    set({ course })
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

  resetEmpty: () => {
    resetCoalesce()
    // Curso mínimo válido vía parse (defaults del esquema): un módulo/unidad
    // con la portada, listo para empezar de cero. Los assets se vacían: un
    // proyecto nuevo no debe arrastrar binarios del anterior.
    const cover = { id: newId('s'), type: 'cover' as const, title: 'Portada' }
    const course = CourseSchema.parse({
      course: { title: 'Curso nuevo' },
      modules: [{ id: newId('m'), title: 'Módulo 1', units: [{ id: newId('u'), title: 'Unidad 1', screens: [cover] }] }],
    })
    set({ course, assets: {}, importError: null, past: [], future: [], selectedScreenId: cover.id })
  },

  addModule: () => {
    snapshot()
    const course = clone(get().course)
    course.modules.push({
      id: newId('m'),
      title: `Módulo ${course.modules.length + 1}`,
      units: [{ id: newId('u'), title: 'Unidad 1', summary: '', screens: [], status: 'ok' }],
    })
    set({ course })
  },

  addUnit: (moduleId) => {
    if (!get().course.modules.some((m) => m.id === moduleId)) return
    snapshot()
    const course = clone(get().course)
    const m = course.modules.find((x) => x.id === moduleId)!
    m.units.push({ id: newId('u'), title: `Unidad ${m.units.length + 1}`, summary: '', screens: [], status: 'ok' })
    set({ course })
  },

  removeUnit: (id) => {
    if (!get().course.modules.some((m) => m.units.some((u) => u.id === id))) return
    snapshot()
    const course = clone(get().course)
    let removedScreenIds: string[] = []
    for (const m of course.modules) {
      const i = m.units.findIndex((u) => u.id === id)
      if (i >= 0) {
        removedScreenIds = m.units[i].screens.map((s) => s.id)
        m.units.splice(i, 1)
        break
      }
    }
    const sel = get().selectedScreenId
    set({ course, selectedScreenId: sel && removedScreenIds.includes(sel) ? null : sel })
  },

  removeModule: (id) => {
    if (!get().course.modules.some((m) => m.id === id)) return
    snapshot()
    const course = clone(get().course)
    const mod = course.modules.find((m) => m.id === id)!
    const removedScreenIds = mod.units.flatMap((u) => u.screens.map((s) => s.id))
    course.modules = course.modules.filter((m) => m.id !== id)
    const sel = get().selectedScreenId
    set({ course, selectedScreenId: sel && removedScreenIds.includes(sel) ? null : sel })
  },

  moveModule: (id, dir) => {
    const i = get().course.modules.findIndex((m) => m.id === id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= get().course.modules.length) return
    snapshot()
    const course = clone(get().course)
    ;[course.modules[i], course.modules[j]] = [course.modules[j], course.modules[i]]
    set({ course })
  },

  moveUnit: (id, dir) => {
    const modules = get().course.modules
    const mi = modules.findIndex((m) => m.units.some((u) => u.id === id))
    if (mi < 0) return
    const i = modules[mi].units.findIndex((u) => u.id === id)
    const j = i + dir
    if (j >= 0 && j < modules[mi].units.length) {
      // Dentro del módulo: intercambio con la vecina.
      snapshot()
      const course = clone(get().course)
      const m = course.modules[mi]
      ;[m.units[i], m.units[j]] = [m.units[j], m.units[i]]
      set({ course })
      return
    }
    // En el extremo: la unidad cruza al módulo adyacente (si lo hay) — al
    // final del anterior subiendo, al principio del siguiente bajando.
    const tm = mi + dir
    if (tm < 0 || tm >= modules.length) return
    snapshot()
    const course = clone(get().course)
    const [unit] = course.modules[mi].units.splice(i, 1)
    if (dir === -1) course.modules[tm].units.push(unit)
    else course.modules[tm].units.unshift(unit)
    set({ course })
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
    const s = get().getScreen(id)
    if (!s) return
    // Congruencia mínima al pasar a Vídeo sin recurso: precarga YouTube (el
    // autor puede cambiarlo; evita una pantalla de vídeo sin vídeo).
    if (type === 'video' && s.visual_resource.kind === 'none')
      get().updateScreen(id, { type, visual_resource: { ...s.visual_resource, kind: 'video_youtube', layout: 'top' } })
    else get().updateScreen(id, { type })
  },

  changeInteractionType: (screenId, type) => {
    const loc = get().locate(screenId)
    if (!loc) return
    const cur = get().course.modules[loc.mi].units[loc.ui].screens[loc.si]
    if (!cur.interaction || cur.interaction.type === type) return
    // snapshot sin clave: el cambio de tipo nunca se coalesce con el tecleo.
    snapshot()
    const course = clone(get().course)
    const s = course.modules[loc.mi].units[loc.ui].screens[loc.si]
    const it = s.interaction!
    const rec = interactionRecipe(type)
    const mig = migrateInteractionData(it, type)
    // Conserva lo común (id, enunciado, instrucciones, feedback, intentos,
    // objetivo, source_refs); la puntuación solo si el tipo nuevo puede puntuar.
    s.interaction = InteractionSchema.parse({
      ...it,
      type,
      options: mig.options,
      config: mig.config,
      scored: rec.gradable ? it.scored : false,
      points: rec.gradable ? it.points : 0,
    })
    set({ course })
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

  updateNarration: (patch) => {
    snapshot()
    const course = clone(get().course)
    course.narration = { ...course.narration, ...patch }
    set({ course })
  },

  fillMissingTranscripts: () => {
    // Solo pantallas con contenido narrable y sin esqueleto (mismo criterio que
    // el aviso NARR_NO_TRANSCRIPT de validators.ts). Un único snapshot: el
    // relleno masivo se deshace de una vez.
    snapshot()
    const course = clone(get().course)
    let filled = 0
    for (const m of course.modules)
      for (const u of m.units)
        for (const s of u.screens) {
          if (s.transcript.trim()) continue
          if (s.type === 'content_placeholder' || s.status === 'esqueleto_pendiente_desarrollo') continue
          const t = buildTranscript(s).trim()
          if (!t) continue
          s.transcript = t
          filled++
        }
    if (filled) set({ course })
    return filled
  },

  setAllMinTime: (seconds) => {
    snapshot()
    const course = clone(get().course)
    for (const m of course.modules)
      for (const u of m.units)
        for (const s of u.screens) s.min_time_seconds = seconds
    set({ course })
  },

  // Renombrar/quitar un objetivo actúa sobre TODOS sus usos a la vez para que
  // la vinculación (por texto, comparado normalizado) nunca quede rota a medias.
  renameObjective: (from, to) => {
    const text = to.trim()
    if (text && text !== from.trim()) remapObjective(from, text)
  },

  removeObjective: (text) => remapObjective(text, ''),

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

  setGlossaryTitle: (title) => {
    snapshot('glossary-title')
    const course = clone(get().course)
    course.glossary_title = title
    set({ course })
  },

  setBibliography: (entries) => {
    snapshot('bibliography')
    const course = clone(get().course)
    course.bibliography = entries
    set({ course })
  },

  setBibliographyTitle: (title) => {
    snapshot('bibliography-title')
    const course = clone(get().course)
    course.bibliography_title = title
    set({ course })
  },

  addScreen: (unitId, afterId, preset, atIndex) => {
    snapshot()
    const course = clone(get().course)
    outer: for (const m of course.modules)
      for (const u of m.units)
        if (u.id === unitId) {
          const s = blankScreen(preset)
          const idx = atIndex != null
            ? Math.max(0, Math.min(atIndex, u.screens.length))
            : afterId ? u.screens.findIndex((x) => x.id === afterId) + 1 : u.screens.length
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
    // Seguridad: no se borra el binario si alguna pantalla del curso aún lo
    // referencia (una misma imagen puede reutilizarse en varias diapositivas).
    // Por eso los llamantes deben ACTUALIZAR primero el curso (quitar/sustituir
    // la referencia) y llamar a removeAsset después: si queda algún uso, se
    // conserva; si era el último, se elimina.
    if (isAssetReferenced(get().course, path)) return
    const assets = { ...get().assets }
    if (path in assets) {
      delete assets[path]
      set({ assets })
    }
  },

  pruneOrphanAssets: () => {
    const { course, assets } = get()
    const orphans = orphanAssetPaths(course, assets)
    if (!orphans.length) return 0
    const next = { ...assets }
    for (const p of orphans) delete next[p]
    set({ assets: next })
    return orphans.length
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
