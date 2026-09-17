import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { create } from 'zustand'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  pointerWithin,
  closestCenter,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useCourseStore } from '../store/courseStore'
import type { Screen } from '../schema/course.schema'
import { screenTypeLabel, screenTypeIcon, screenTypeColor, interactionTypeLabel, TYPE_COLORS, type CoverLevel } from '../schema/labels'
import { interactionRecipe, interactionColor } from '../schema/interactionRecipes'
import { INTRO_CONTAINER_ID, OUTRO_CONTAINER_ID, moduleClosingContainerId } from '../schema/traverse'
import { validateCourse, type Issue } from '../validation/validators'
import { confirmDialog } from '../store/confirm'
import { InlineRename } from './InlineRename'
import { AddScreenModal } from './AddScreenModal'
import { Icon } from './Icon'

/**
 * Estado de plegado de las unidades del árbol: preferencia de UI (no viaja en
 * el curso ni entra en el historial de deshacer). Vive en un store propio para
 * sobrevivir al desmontaje del árbol al cambiar de pestaña (App solo renderiza
 * el aside en la pestaña Editor). Ids huérfanos de unidades borradas = inocuos.
 */
const useTreeFold = create<{
  collapsed: Record<string, boolean>
  setCollapsed: (id: string, v: boolean) => void
  /** Acordeón: abre `id` y cierra el resto de `allIds` (solo un módulo activo). */
  openOnly: (id: string, allIds: string[]) => void
}>((set) => ({
  collapsed: {},
  setCollapsed: (id, v) => set((s) => ({ collapsed: { ...s.collapsed, [id]: v } })),
  openOnly: (id, allIds) =>
    set((s) => {
      const next = { ...s.collapsed }
      for (const other of allIds) next[other] = other !== id
      return { collapsed: next }
    }),
}))

/** Lado de inserción («antes»/«después» de la pantalla apuntada) durante un
 *  arrastre: se recalcula en `onDragOver` (posición real del puntero) y lo lee
 *  cada `ScreenItem` para dibujar la línea de «diana» en el borde correcto.
 *  Solo hace falta un estado global (no por id): en cada instante únicamente
 *  la pantalla con `isOver` (de `useSortable`) lo usa.
 *
 *  Deliberadamente NO se simula aquí un «hueco» real (con alto propio) al
 *  cruzar de contenedor, aunque se probó: dnd-kit solo mide los rectángulos
 *  droppable UNA VEZ al empezar el arrastre («WhileDragging» mide al iniciar
 *  y luego solo si un `ResizeObserver` ve que ESE MISMO elemento cambia de
 *  tamaño). Insertar un `<li>` con alto real desplaza las pantallas
 *  siguientes sin que dnd-kit se entere, dejándolas con una posición «real»
 *  más abajo de la que dnd-kit sigue creyendo — exactamente el mismo defecto
 *  que tenían los puntos de inserción agrandados (ver `.ed-insert` en
 *  `editor.css`) y la causa de tener que arrastrar varias pantallas de más
 *  para acertar. La línea de diana (`is-drop-before`/`is-drop-after`, solo
 *  `box-shadow`) no mueve nada del documento y no tiene ese problema. */
const useDropSide = create<{
  after: boolean
  set: (v: { after: boolean }) => void
  reset: () => void
}>((set) => ({
  after: false,
  set: (v) => set(v),
  reset: () => set({ after: false }),
}))

/** Scroll del árbol hasta el nodo, solo si no está ya del todo a la vista.
 *  Centrado (no `nearest`): alineado al borde el nodo apenas se percibe. */
function scrollTreeTo(el: HTMLElement | null) {
  if (!el) return
  const tree = el.closest('.ed-tree')
  if (!tree) return
  const r = el.getBoundingClientRect()
  const t = tree.getBoundingClientRect()
  if (r.top < t.top || r.bottom > t.bottom - 4) el.scrollIntoView({ block: 'center' })
}

/** Ref a un `<li>` del árbol que se lleva a la vista cuando pasa a estar
 *  seleccionado (también al montar: al volver de otra pestaña el árbol se monta
 *  de nuevo con la selección ya puesta, p. ej. al navegar en Vista estudiante y
 *  volver a Editor). Diferido dos frames: en el montaje el layout aún no es
 *  definitivo y el scroll inmediato se queda corto.
 *
 *  `moduleId`/`unitId`: contenedores plegables de la pantalla (`undefined` si
 *  no aplica, p. ej. una pantalla de introducción). Si están cerrados, el
 *  `<li>` existe en el DOM pero oculto por el `<details>` — `scrollIntoView`
 *  no puede llevarlo a la vista mientras siga oculto — así que se abren
 *  ANTES de programar el scroll (mismo acordeón que al abrir a mano: abrir el
 *  módulo de la pantalla cierra los demás). */
function useScrollWhenSelected(selected: boolean, moduleId?: string, unitId?: string) {
  const ref = useRef<HTMLLIElement | null>(null)
  useEffect(() => {
    if (!selected) return
    if (moduleId) {
      const allModuleIds = useCourseStore.getState().course.modules.map((m) => m.id)
      useTreeFold.getState().openOnly(moduleId, allModuleIds)
    }
    if (unitId) useTreeFold.getState().setCollapsed(unitId, false)
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => scrollTreeTo(ref.current))
    })
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2) }
  }, [selected])
  return ref
}

/** Plural simple en español para rótulos personalizables cortos (Módulo→Módulos,
 *  Unidad→Unidades, Tema→Temas, Bloque→Bloques…): vocal final → +s, consonante → +es.
 *  No cubre toda la morfología del español (p. ej. tildes que se desplazan), pero
 *  basta para los sustantivos cortos y habituales que tiene sentido usar aquí. */
function pluralize(label: string): string {
  return /[aeiouáéíóú]$/i.test(label) ? `${label}s` : `${label}es`
}

/** Peor severidad de los issues de una pantalla (para el badge del árbol). */
type ScreenIssues = { errors: number; warnings: number }

function IssueBadge({ info }: { info?: ScreenIssues }) {
  if (!info || (!info.errors && !info.warnings)) return null
  const isErr = info.errors > 0
  const n = isErr ? info.errors : info.warnings
  const what = isErr ? 'error' : 'aviso'
  return (
    <span
      className={`ed-screen-badge ${isErr ? 'is-err' : 'is-warn'}`}
      title={`${n} ${what}${n === 1 ? '' : 's'} de validación en esta pantalla`}
    >
      <Icon name={isErr ? 'alert-octagon' : 'alert-triangle'} size={14} />
    </span>
  )
}

/** `index`/`count`: posición real (sin filtrar) en su contenedor, para los
 *  botones Subir/Bajar — `undefined` con el filtro activo (los índices de la
 *  lista filtrada no se corresponden con el contenedor), que los oculta.
 *  `level`: nivel del contenedor (introducción/módulo/unidad), para el rótulo
 *  real de una portada (`type: 'cover'`) — lo sabe quien llama, no hace falta
 *  derivarlo de `containerId` aquí. `moduleId`/`unitId`: contenedores plegables
 *  a abrir si la pantalla se selecciona estando cerrados (ver
 *  `useScrollWhenSelected`); ausentes en pantallas de introducción. */
function ScreenItem({ screen, containerId, issues, index, count, level, moduleId, unitId }: {
  screen: Screen; containerId: string; issues?: ScreenIssues; index?: number; count?: number; level: CoverLevel
  moduleId?: string; unitId?: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } = useSortable({
    id: screen.id,
    data: { containerId },
  })
  const dropAfter = useDropSide((s) => s.after)
  const selected = useCourseStore((s) => s.selectedScreenId === screen.id)
  const select = useCourseStore((s) => s.selectScreen)
  const duplicate = useCourseStore((s) => s.duplicateScreen)
  const remove = useCourseStore((s) => s.deleteScreen)
  const moveScreen = useCourseStore((s) => s.moveScreen)
  const moduleLabel = useCourseStore((s) => s.course.module_label)
  const unitLabel = useCourseStore((s) => s.course.unit_label)
  const canMove = index != null && count != null

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  const flagged = screen.type === 'content_placeholder' || screen.status === 'esqueleto_pendiente_desarrollo'

  // Al seleccionarse (pantalla recién creada, enlace desde Validación, o al
  // volver de la Vista estudiante), el árbol lleva la pantalla a la vista.
  const liRef = useScrollWhenSelected(selected, moduleId, unitId)
  const setRefs = (el: HTMLLIElement | null) => { liRef.current = el; setNodeRef(el) }

  const isDropTarget = isOver && !isDragging
  return (
    <li ref={setRefs} style={style}
      className={`ed-screen ${selected ? 'is-selected' : ''} ${isDropTarget ? `is-drop-target ${dropAfter ? 'is-drop-after' : 'is-drop-before'}` : ''}`}>
      <button className="ed-grip" {...attributes} {...listeners} aria-label="Arrastrar para reordenar">
        <Icon name="grip" size={14} />
      </button>
      <button className="ed-screen-label" onClick={() => select(screen.id)}>
        <span className="ed-screen-type">
          <Icon name={screenTypeIcon(screen.type)} size={12} color={screenTypeColor(screen.type)} /> {screenTypeLabel(screen.type, { level, module: moduleLabel, unit: unitLabel })}
          {/* Marca de la interacción: su icono real (con el color de su grupo), no un genérico */}
          {screen.interaction && (
            <span title={`${interactionTypeLabel(screen.interaction.type)}${screen.interaction.scored ? '' : ' (no puntúa)'}`}>
              {' · '}
              <Icon name={interactionRecipe(screen.interaction.type).icon} size={11}
                color={interactionColor(screen.interaction.type)} />
              {screen.interaction.scored && (
                <span className="ed-eval" title="Actividad evaluable: puntúa para la nota">
                  {' '}<Icon name="star" size={11} /> evaluable
                </span>
              )}
            </span>
          )}
        </span>
        <span className="ed-screen-title">{screen.title || '(sin título)'}</span>
        {flagged && <span className="ed-flag" title="Pendiente de desarrollo"><Icon name="alert-triangle" size={13} /></span>}
        {screen.review.flagged && (
          <span className="ed-flag ed-flag-review" title="Pendiente de revisión: no se exporta en el paquete SCORM">
            <Icon name="alert-octagon" size={13} />
          </span>
        )}
      </button>
      <IssueBadge info={issues} />
      <span className="ed-screen-actions">
        {canMove && (
          <>
            <button className="ed-icobtn" title="Subir" aria-label="Subir"
              disabled={index === 0}
              onClick={() => moveScreen(screen.id, containerId, index! - 1)}>
              <Icon name="arrow-up" size={14} />
            </button>
            <button className="ed-icobtn" title="Bajar" aria-label="Bajar"
              disabled={index === count! - 1}
              onClick={() => moveScreen(screen.id, containerId, index! + 1)}>
              <Icon name="arrow-down" size={14} />
            </button>
          </>
        )}
        <button className="ed-icobtn" onClick={() => duplicate(screen.id)} title="Duplicar" aria-label="Duplicar">
          <Icon name="copy" size={14} />
        </button>
        <button className="ed-icobtn ed-icobtn-danger"
          onClick={() => {
            void confirmDialog({
              title: 'Eliminar pantalla',
              message: `Se eliminará la pantalla «${screen.title || '(sin título)'}» y no podrá recuperarse (salvo con Deshacer). ¿Deseas continuar?`,
              confirmLabel: 'Eliminar',
              danger: true,
            }).then((ok) => { if (ok) remove(screen.id) })
          }}
          title="Eliminar" aria-label="Eliminar"
        ><Icon name="trash" size={14} /></button>
      </span>
    </li>
  )
}

/** Botón «+ Añadir pantalla»: abre el selector de recetas (AddScreenModal).
 *  `containerId` puede ser una unidad o un módulo (pantallas del módulo). */
function AddScreenButton({ containerId, label = 'Añadir pantalla…' }: { containerId: string; label?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className="ed-add" onClick={() => setOpen(true)}><Icon name="plus" size={13} /> {label}</button>
      {open && <AddScreenModal containerId={containerId} onClose={() => setOpen(false)} />}
    </>
  )
}

/** Punto de inserción entre pantallas: al pasar el ratón (o con Tab) aparece un
 *  divisor con «+» que abre el selector de recetas insertando justo ahí. */
function InsertPoint({ containerId, index }: { containerId: string; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <li className="ed-insert" role="presentation">
      <button aria-label="Insertar pantalla aquí" title="Insertar pantalla aquí" onClick={() => setOpen(true)}>
        <span aria-hidden="true"><Icon name="plus" size={12} /></span>
      </button>
      {open && <AddScreenModal containerId={containerId} atIndex={index} onClose={() => setOpen(false)} />}
    </li>
  )
}

/** Objetivo de drop de un contenedor SIN pantallas: sin ningún `ScreenItem`
 *  dentro (cada uno registra su propio droppable vía `useSortable`) no había
 *  nada donde soltar y arrastrar ahí no hacía nada. Este marcador usa el
 *  propio `containerId` como id droppable — `onDragEnd` lo distingue por
 *  `data.current.empty` e inserta siempre en la primera posición. Solo se
 *  muestra mientras se arrastra (`dragging`), para no alterar el aspecto
 *  habitual de un contenedor vacío. */
function EmptyDropZone({ containerId, dragging }: { containerId: string; dragging: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: containerId, data: { containerId, empty: true } })
  if (!dragging) return null
  return (
    <li ref={setNodeRef} className={`ed-insert-empty ${isOver ? 'is-drop-target' : ''}`} role="presentation">
      Suelta aquí
    </li>
  )
}

/** Nodo sintético del árbol (Test final / Glosario / Recursos): mismo aspecto
 *  que una pantalla y mismo scroll-a-la-vista al quedar seleccionado. */
function SyntheticItem({ selected, onSelect, children }: {
  selected: boolean
  onSelect: () => void
  children: React.ReactNode
}) {
  const liRef = useScrollWhenSelected(selected)
  return (
    <li ref={liRef} className={`ed-screen ${selected ? 'is-selected' : ''}`}>
      <button className="ed-screen-label" onClick={onSelect}>
        {children}
      </button>
    </li>
  )
}

export function CourseTree() {
  const course = useCourseStore((s) => s.course)
  const moveScreen = useCourseStore((s) => s.moveScreen)
  const locate = useCourseStore((s) => s.locate)
  const select = useCourseStore((s) => s.selectScreen)
  const finalSelected = useCourseStore((s) => s.selectedScreenId === '__final__')
  const glossarySelected = useCourseStore((s) => s.selectedScreenId === '__glossary__')
  const biblioSelected = useCourseStore((s) => s.selectedScreenId === '__bibliography__')
  const updateModule = useCourseStore((s) => s.updateModule)
  const updateUnit = useCourseStore((s) => s.updateUnit)
  const addModule = useCourseStore((s) => s.addModule)
  const addUnit = useCourseStore((s) => s.addUnit)
  const removeModule = useCourseStore((s) => s.removeModule)
  const removeUnit = useCourseStore((s) => s.removeUnit)
  const moveModule = useCourseStore((s) => s.moveModule)
  const moveUnit = useCourseStore((s) => s.moveUnit)
  const promoteUnit = useCourseStore((s) => s.promoteUnit)
  const [filter, setFilter] = useState('')
  const collapsed = useTreeFold((s) => s.collapsed)
  const setCollapsed = useTreeFold((s) => s.setCollapsed)
  const openOnly = useTreeFold((s) => s.openOnly)

  // Rótulos personalizables (por defecto «Módulo»/«Unidad», ver Ajustes → Curso):
  // un paquete SCORM no siempre es un curso con módulos de verdad. En minúscula
  // para encajar en frases («Añadir unidad», «Subir módulo»…); el plural es una
  // aproximación (pluralize) que basta para estos sustantivos cortos.
  const moduleLabel = (course.module_label || 'Módulo').toLowerCase()
  const unitLabel = (course.unit_label || 'Unidad').toLowerCase()
  const moduleLabelPlural = pluralize(moduleLabel)
  const unitLabelPlural = pluralize(unitLabel)

  // Borrado de módulo/unidad: confirma solo si contiene pantallas (deshacer
  // siempre disponible). Los botones viven en <summary>/<p>: hay que cortar el
  // clic para no plegar el details ni disparar el rename. El mensaje evita
  // concordancia de género con el rótulo personalizado (título entre comillas +
  // el rótulo entre paréntesis, sin artículo).
  async function onRemoveUnit(u: { id: string; title: string; screens: Screen[] }) {
    if (u.screens.length > 0) {
      const ok = await confirmDialog({
        title: `Eliminar ${unitLabel}`,
        message: `Se eliminará «${u.title || '(sin título)'}» (${unitLabel}) con sus ${u.screens.length} pantalla${u.screens.length === 1 ? '' : 's'}. ¿Deseas continuar?`,
        confirmLabel: 'Eliminar',
        danger: true,
      })
      if (!ok) return
    }
    removeUnit(u.id)
  }
  async function onRemoveModule(m: { id: string; title: string; screens: Screen[]; units: { screens: Screen[] }[] }) {
    const n = m.screens.length + m.units.reduce((a, u) => a + u.screens.length, 0)
    if (n > 0 || m.units.length > 1) {
      const ok = await confirmDialog({
        title: `Eliminar ${moduleLabel}`,
        message: `Se eliminará «${m.title || '(sin título)'}» (${moduleLabel}) con ${m.units.length} ${m.units.length === 1 ? unitLabel : unitLabelPlural} y ${n} pantalla${n === 1 ? '' : 's'}. ¿Deseas continuar?`,
        confirmLabel: 'Eliminar',
        danger: true,
      })
      if (!ok) return
    }
    removeModule(m.id)
  }
  async function onPromoteUnit(u: { id: string; title: string }) {
    const ok = await confirmDialog({
      title: `Subir de nivel`,
      message: `«${u.title || '(sin título)'}» pasará de ${unitLabel} a ${moduleLabel}, con sus pantallas como hijas directas del nuevo ${moduleLabel} (sin ${unitLabel} intermedia). Puedes deshacerlo con Ctrl+Z. ¿Continuar?`,
      confirmLabel: 'Convertir',
      danger: true,
    })
    if (ok) promoteUnit(u.id)
  }

  // Issues de validación por pantalla (badges ⛔/⚠ en el árbol).
  const issuesByScreen = useMemo(() => {
    const map = new Map<string, ScreenIssues>()
    validateCourse(course).issues.forEach((i: Issue) => {
      if (!i.screenId || i.severity === 'info') return
      const cur = map.get(i.screenId) || { errors: 0, warnings: 0 }
      if (i.severity === 'error') cur.errors++
      else cur.warnings++
      map.set(i.screenId, cur)
    })
    return map
  }, [course])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // Feedback visual del arrastre: `dragging` anima los huecos entre pantallas
  // (ver `.ed-insert` en editor.css, solo con `transform`/`opacity` — nunca
  // con tamaño real, para no desajustar las medidas de dnd-kit, ver más
  // abajo); el resaltado de la pantalla apuntada («diana») usa `isOver` de
  // `useSortable` en `ScreenItem`, y `useDropSide` decide si la línea de
  // diana va arriba o abajo de esa pantalla.
  const [dragging, setDragging] = useState(false)
  const setDropSide = useDropSide((s) => s.set)
  const resetDropSide = useDropSide((s) => s.reset)
  function onDragStart(_e: DragStartEvent) { setDragging(true); resetDropSide() }
  function onDragCancel() { setDragging(false); resetDropSide() }

  // Antes/después de la pantalla apuntada: comparar el centro vertical del
  // elemento arrastrado (posición real del puntero) con el centro vertical
  // del objetivo. Solo importa el borde superior/inferior, así que basta con
  // los rects que ya trae el propio evento — sin esto, soltar sobre un
  // contenedor con una única pantalla SIEMPRE la insertaba delante (ver
  // `onDragEnd`), sin forma de indicar ni de elegir «después».
  function onDragOver(e: DragOverEvent) {
    const { active, over } = e
    if (!over) { resetDropSide(); return }
    const activeRect = active.rect.current.translated
    if (!activeRect) { resetDropSide(); return }
    const activeMid = activeRect.top + activeRect.height / 2
    const overMid = over.rect.top + over.rect.height / 2
    setDropSide({ after: activeMid > overMid })
  }

  // `closestCenter` a secas compara TODAS las pantallas del árbol por
  // distancia de su centro al puntero, sin tener en cuenta las fronteras
  // visuales entre unidades/módulos: cerca del borde de un tema, el centro
  // más próximo podía ser el de una pantalla de otro módulo bastante alejada
  // en la estructura, y el arrastre «se iba a otro sitio» sin avisar.
  // `pointerWithin` exige que el puntero esté literalmente dentro del
  // rectángulo de la pantalla candidata — mucho más preciso y coherente con
  // el resaltado de «diana» — y solo cuando el puntero cae en un hueco sin
  // ninguna pantalla debajo (huecos entre contenedores) se recurre a
  // `closestCenter` como respaldo.
  const collisionDetection: CollisionDetection = (args) => {
    const pointerHits = pointerWithin(args)
    return pointerHits.length > 0 ? pointerHits : closestCenter(args)
  }

  function onDragEnd(e: DragEndEvent) {
    setDragging(false)
    resetDropSide()
    const { active, over } = e
    if (!over || active.id === over.id) return
    const toContainerId = (over.data.current?.containerId as string) ?? (active.data.current?.containerId as string)
    // Contenedor vacío (`EmptyDropZone`): ninguna pantalla dentro sirve de
    // referencia — siempre a la primera posición.
    if (over.data.current?.empty) {
      moveScreen(String(active.id), toContainerId, 0)
      return
    }
    const overLoc = locate(String(over.id))
    if (!overLoc) return
    let targetIndex = overLoc.si
    // Al reordenar DENTRO del mismo contenedor, la dirección del arrastre
    // (de dónde a dónde) ya decide antes/después de forma natural — mismo
    // convenio que `arrayMove` de dnd-kit. Al soltar en un contenedor
    // DISTINTO no hay ninguna otra pantalla con la que comparar esa
    // dirección (con una sola pantalla dentro, `overLoc.si` siempre
    // apuntaría delante de ella) — ahí decide la posición real del puntero
    // calculada en `onDragOver`.
    const fromContainerId = active.data.current?.containerId as string | undefined
    if (fromContainerId && fromContainerId !== toContainerId) {
      const activeRect = active.rect.current.translated
      if (activeRect && activeRect.top + activeRect.height / 2 > over.rect.top + over.rect.height / 2) {
        targetIndex = overLoc.si + 1
      }
    }
    moveScreen(String(active.id), toContainerId, targetIndex)
  }

  const q = filter.trim().toLowerCase()
  const matches = (s: Screen) =>
    !q || (s.title || '').toLowerCase().includes(q) ||
    screenTypeLabel(s.type, { module: course.module_label, unit: course.unit_label }).toLowerCase().includes(q)

  return (
    <div className={`ed-tree-inner ${dragging ? 'is-dragging' : ''}`}>
      <h2 className="ed-tree-title">Estructura</h2>
      <input
        className="ed-tree-filter"
        type="search"
        placeholder="Filtrar pantallas…"
        aria-label="Filtrar pantallas por título o tipo"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <DndContext sensors={sensors} collisionDetection={collisionDetection}
        onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd} onDragCancel={onDragCancel}>
        <div className="ed-module ed-intro-block">
          <p className="ed-module-title">
            <span className="ed-intro-title-text">Introducción del paquete SCORM</span>
          </p>
          {(() => {
            const visible = course.intro_screens.filter(matches)
            if (q && visible.length === 0) return null
            return (
              <SortableContext items={course.intro_screens.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <ul className="ed-screens ed-module-screens">
                  {visible.map((s, i) => (
                    <Fragment key={s.id}>
                      {!q && <InsertPoint containerId={INTRO_CONTAINER_ID} index={i} />}
                      <ScreenItem screen={s} containerId={INTRO_CONTAINER_ID} issues={issuesByScreen.get(s.id)} level="course"
                        index={q ? undefined : i} count={q ? undefined : course.intro_screens.length} />
                    </Fragment>
                  ))}
                  {!q && course.intro_screens.length === 0 && <EmptyDropZone containerId={INTRO_CONTAINER_ID} dragging={dragging} />}
                </ul>
              </SortableContext>
            )
          })()}
          {!q && (
            <AddScreenButton containerId={INTRO_CONTAINER_ID} label="Añadir pantalla de introducción…" />
          )}
        </div>
        {course.modules.map((m, mi) => (
          <details key={`${m.id}-${q ? 'f' : 'n'}`} className="ed-module ed-tree-module"
            open={q ? true : collapsed[m.id] === false}
            onToggle={(e) => {
              if (q) return
              // Acordeón: un solo módulo abierto a la vez — abrirlo cierra los demás.
              if (e.currentTarget.open) openOnly(m.id, course.modules.map((mm) => mm.id))
              else setCollapsed(m.id, true)
            }}>
            <summary className="ed-module-title">
              <span className="ed-module-name">
                <InlineRename value={m.title} title={`Renombrar ${moduleLabel}`}
                  onChange={(title) => updateModule(m.id, { title })} />
              </span>
              {!q && (
                <span className="ed-struct-tools">
                  <button type="button" className="ed-struct-btn" title={`Subir ${moduleLabel}`} aria-label={`Subir ${moduleLabel}`}
                    disabled={mi === 0}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveModule(m.id, -1) }}>
                    <Icon name="arrow-up" size={12} /></button>
                  <button type="button" className="ed-struct-btn" title={`Bajar ${moduleLabel}`} aria-label={`Bajar ${moduleLabel}`}
                    disabled={mi === course.modules.length - 1}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveModule(m.id, 1) }}>
                    <Icon name="arrow-down" size={12} /></button>
                  <button type="button" className="ed-struct-btn" title={`Eliminar ${moduleLabel}`} aria-label={`Eliminar ${moduleLabel}`}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); void onRemoveModule(m) }}>
                    <Icon name="trash" size={12} />
                  </button>
                </span>
              )}
            </summary>
            {/* Pantallas propias del módulo: siempre ANTES de sus unidades
                (portada/presentación de módulo). Mismo tratamiento que las de
                unidad: sortable, puntos de inserción y badge de validación. */}
            {(() => {
              const visible = m.screens.filter(matches)
              if (q && visible.length === 0) return null
              return (
                <SortableContext items={m.screens.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <ul className="ed-screens ed-module-screens">
                    {visible.map((s, i) => (
                      <Fragment key={s.id}>
                        {!q && <InsertPoint containerId={m.id} index={i} />}
                        <ScreenItem screen={s} containerId={m.id} issues={issuesByScreen.get(s.id)} level="module"
                          moduleId={m.id}
                          index={q ? undefined : i} count={q ? undefined : m.screens.length} />
                      </Fragment>
                    ))}
                    {!q && m.screens.length === 0 && <EmptyDropZone containerId={m.id} dragging={dragging} />}
                  </ul>
                </SortableContext>
              )
            })()}
            {!q && (
              <AddScreenButton containerId={m.id} label={`Añadir pantalla al ${moduleLabel}…`} />
            )}
            {m.units.map((u, ui) => {
              const visible = u.screens.filter(matches)
              if (q && visible.length === 0) return null
              return (
                // key con el filtro: al (des)activar el filtro se remonta abierto
                // (con filtro siempre desplegada para ver los resultados). Sin
                // filtro manda el estado plegado guardado, que sobrevive al
                // cambio de pestaña (useTreeFold).
                <details key={`${u.id}-${q ? 'f' : 'n'}`} className="ed-tree-unit"
                  open={q ? true : collapsed[u.id] === false}
                  onToggle={(e) => { if (!q) setCollapsed(u.id, !e.currentTarget.open) }}>
                  <summary className="ed-unit-title">
                    <span className="ed-unit-name">
                      <InlineRename value={u.title} title={`Renombrar ${unitLabel}`}
                        onChange={(title) => updateUnit(u.id, { title })} />
                    </span>
                    <span className="ed-unit-count">{q ? `${visible.length}/${u.screens.length}` : u.screens.length}</span>
                    {!q && (
                      <span className="ed-struct-tools">
                        <button type="button" className="ed-struct-btn"
                          title={`Subir de nivel: convertir en ${moduleLabel} propio`}
                          aria-label={`Subir de nivel: convertir esta ${unitLabel} en un ${moduleLabel} propio`}
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); void onPromoteUnit(u) }}>
                          <Icon name="arrow-left" size={12} /></button>
                        {/* Desde el extremo del módulo, subir/bajar cruza al módulo adyacente */}
                        <button type="button" className="ed-struct-btn"
                          title={ui === 0 ? `Subir ${unitLabel} (pasa al final del ${moduleLabel} anterior)` : `Subir ${unitLabel}`}
                          aria-label={`Subir ${unitLabel}`}
                          disabled={mi === 0 && ui === 0}
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveUnit(u.id, -1) }}>
                          <Icon name="arrow-up" size={12} /></button>
                        <button type="button" className="ed-struct-btn"
                          title={ui === m.units.length - 1 ? `Bajar ${unitLabel} (pasa al principio del ${moduleLabel} siguiente)` : `Bajar ${unitLabel}`}
                          aria-label={`Bajar ${unitLabel}`}
                          disabled={mi === course.modules.length - 1 && ui === m.units.length - 1}
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveUnit(u.id, 1) }}>
                          <Icon name="arrow-down" size={12} /></button>
                        <button type="button" className="ed-struct-btn" title={`Eliminar ${unitLabel}`} aria-label={`Eliminar ${unitLabel}`}
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); void onRemoveUnit(u) }}>
                          <Icon name="trash" size={12} />
                        </button>
                      </span>
                    )}
                  </summary>
                  <SortableContext items={u.screens.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    <ul className="ed-screens">
                      {visible.map((s, i) => (
                        <Fragment key={s.id}>
                          {/* Con filtro activo los índices no se corresponden con la unidad → sin puntos de inserción */}
                          {!q && <InsertPoint containerId={u.id} index={i} />}
                          <ScreenItem screen={s} containerId={u.id} issues={issuesByScreen.get(s.id)} level="unit"
                            moduleId={m.id} unitId={u.id}
                            index={q ? undefined : i} count={q ? undefined : u.screens.length} />
                        </Fragment>
                      ))}
                      {!q && u.screens.length === 0 && <EmptyDropZone containerId={u.id} dragging={dragging} />}
                    </ul>
                  </SortableContext>
                  {!q && <AddScreenButton containerId={u.id} />}
                </details>
              )
            })}
            {!q && (
              <button className="ed-add" onClick={() => addUnit(m.id)}><Icon name="plus" size={13} /> Añadir {unitLabel}</button>
            )}
            {/* Pantallas de cierre del módulo: siempre DESPUÉS de sus unidades
                (resumen/despedida antes de pasar al siguiente módulo). Mismo
                tratamiento que las propias de arriba (sortable, puntos de
                inserción, badge de validación), contenedor propio
                (`moduleClosingContainerId`) para no mezclarse con `m.screens`. */}
            {(() => {
              const closingContainerId = moduleClosingContainerId(m.id)
              const visible = m.closing_screens.filter(matches)
              if (q && visible.length === 0) return null
              return (
                <>
                  {!q && <p className="ed-closing-label">Cierre del {moduleLabel}</p>}
                  <SortableContext items={m.closing_screens.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    <ul className="ed-screens ed-module-screens">
                      {visible.map((s, i) => (
                        <Fragment key={s.id}>
                          {!q && <InsertPoint containerId={closingContainerId} index={i} />}
                          <ScreenItem screen={s} containerId={closingContainerId} issues={issuesByScreen.get(s.id)} level="module"
                            moduleId={m.id}
                            index={q ? undefined : i} count={q ? undefined : m.closing_screens.length} />
                        </Fragment>
                      ))}
                      {!q && m.closing_screens.length === 0 && <EmptyDropZone containerId={closingContainerId} dragging={dragging} />}
                    </ul>
                  </SortableContext>
                  {!q && (
                    <AddScreenButton containerId={closingContainerId} label={`Añadir pantalla de cierre del ${moduleLabel}…`} />
                  )}
                </>
              )
            })()}
          </details>
        ))}

        {!q && (
          course.modules.length === 0 ? (
            <div className="ed-tree-empty">
              <p className="ed-hint">El curso no tiene {moduleLabelPlural}. Crea el primero para empezar a añadir pantallas.</p>
              <button className="ed-primary" onClick={addModule}><Icon name="plus" size={13} /> Crear el primer {moduleLabel}</button>
            </div>
          ) : (
            <button className="ed-add ed-add-module" onClick={addModule}><Icon name="plus" size={13} /> Añadir {moduleLabel}</button>
          )
        )}

        <div className="ed-module ed-intro-block">
          <p className="ed-module-title">
            <span className="ed-intro-title-text">Cierre del paquete SCORM</span>
          </p>
          {(() => {
            const visible = course.closing_screens.filter(matches)
            if (q && visible.length === 0) return null
            return (
              <SortableContext items={course.closing_screens.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <ul className="ed-screens ed-module-screens">
                  {visible.map((s, i) => (
                    <Fragment key={s.id}>
                      {!q && <InsertPoint containerId={OUTRO_CONTAINER_ID} index={i} />}
                      <ScreenItem screen={s} containerId={OUTRO_CONTAINER_ID} issues={issuesByScreen.get(s.id)} level="course"
                        index={q ? undefined : i} count={q ? undefined : course.closing_screens.length} />
                    </Fragment>
                  ))}
                  {!q && course.closing_screens.length === 0 && <EmptyDropZone containerId={OUTRO_CONTAINER_ID} dragging={dragging} />}
                </ul>
              </SortableContext>
            )
          })()}
          {!q && (
            <AddScreenButton containerId={OUTRO_CONTAINER_ID} label="Añadir pantalla de cierre del SCORM…" />
          )}
        </div>
      </DndContext>

      {!q && (
        <>
          <div className="ed-module">
            <p className="ed-module-title">Evaluación</p>
            <div className="ed-unit">
              <ul className="ed-screens">
                <SyntheticItem selected={finalSelected} onSelect={() => select('__final__')}>
                  <span className="ed-screen-type"><Icon name="clipboard-check" size={12} color={TYPE_COLORS.evaluacion} /> Test</span>
                  <span className="ed-screen-title">
                    {course.assessments.final_test
                      ? course.assessments.final_test.title || 'Test final'
                      : 'Test final (vacío)'}
                  </span>
                </SyntheticItem>
              </ul>
            </div>
          </div>

          <div className="ed-module">
            <p className="ed-module-title">Materiales</p>
            <div className="ed-unit">
              <ul className="ed-screens">
                <SyntheticItem selected={glossarySelected} onSelect={() => select('__glossary__')}>
                  <span className="ed-screen-type"><Icon name="book" size={12} color={TYPE_COLORS.materiales} /> {course.glossary_title.trim() || 'Glosario'}</span>
                  <span className="ed-screen-title">
                    {course.glossary.length
                      ? `${course.glossary.length} término${course.glossary.length === 1 ? '' : 's'}`
                      : 'Vacío'}
                  </span>
                </SyntheticItem>
                <SyntheticItem selected={biblioSelected} onSelect={() => select('__bibliography__')}>
                  {/* Con el título por defecto se abrevia a «Recursos», como el botón de la carcasa */}
                  <span className="ed-screen-type"><Icon name="link" size={12} color={TYPE_COLORS.materiales} /> {
                    course.bibliography_title.trim() === 'Recursos y bibliografía' || !course.bibliography_title.trim()
                      ? 'Recursos' : course.bibliography_title
                  }</span>
                  <span className="ed-screen-title">
                    {course.bibliography.length
                      ? `${course.bibliography.length} referencia${course.bibliography.length === 1 ? '' : 's'}`
                      : 'Sin referencias'}
                  </span>
                </SyntheticItem>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
