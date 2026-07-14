import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { create } from 'zustand'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
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
import { screenTypeLabel, screenTypeIcon, screenTypeColor, interactionTypeLabel, TYPE_COLORS } from '../schema/labels'
import { interactionRecipe, interactionColor } from '../schema/interactionRecipes'
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
}>((set) => ({
  collapsed: {},
  setCollapsed: (id, v) => set((s) => ({ collapsed: { ...s.collapsed, [id]: v } })),
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
 *  de nuevo con la selección ya puesta). Diferido dos frames: en el montaje el
 *  layout aún no es definitivo y el scroll inmediato se queda corto. */
function useScrollWhenSelected(selected: boolean) {
  const ref = useRef<HTMLLIElement | null>(null)
  useEffect(() => {
    if (!selected) return
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => scrollTreeTo(ref.current))
    })
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2) }
  }, [selected])
  return ref
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

function ScreenItem({ screen, containerId, issues }: { screen: Screen; containerId: string; issues?: ScreenIssues }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: screen.id,
    data: { containerId },
  })
  const selected = useCourseStore((s) => s.selectedScreenId === screen.id)
  const select = useCourseStore((s) => s.selectScreen)
  const duplicate = useCourseStore((s) => s.duplicateScreen)
  const remove = useCourseStore((s) => s.deleteScreen)

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  const flagged = screen.type === 'content_placeholder' || screen.status === 'esqueleto_pendiente_desarrollo'

  // Al seleccionarse (pantalla recién creada, enlace desde Validación, o al
  // volver de la Vista estudiante), el árbol lleva la pantalla a la vista.
  const liRef = useScrollWhenSelected(selected)
  const setRefs = (el: HTMLLIElement | null) => { liRef.current = el; setNodeRef(el) }

  return (
    <li ref={setRefs} style={style} className={`ed-screen ${selected ? 'is-selected' : ''}`}>
      <button className="ed-grip" {...attributes} {...listeners} aria-label="Arrastrar para reordenar">
        <Icon name="grip" size={14} />
      </button>
      <button className="ed-screen-label" onClick={() => select(screen.id)}>
        <span className="ed-screen-type">
          <Icon name={screenTypeIcon(screen.type)} size={12} color={screenTypeColor(screen.type)} /> {screenTypeLabel(screen.type)}
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
      </button>
      <IssueBadge info={issues} />
      <span className="ed-screen-actions">
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
  const [filter, setFilter] = useState('')
  const collapsed = useTreeFold((s) => s.collapsed)
  const setCollapsed = useTreeFold((s) => s.setCollapsed)

  // Borrado de módulo/unidad: confirma solo si contiene pantallas (deshacer
  // siempre disponible). Los botones viven en <summary>/<p>: hay que cortar el
  // clic para no plegar el details ni disparar el rename.
  async function onRemoveUnit(u: { id: string; title: string; screens: Screen[] }) {
    if (u.screens.length > 0) {
      const ok = await confirmDialog({
        title: 'Eliminar unidad',
        message: `Se eliminará la unidad «${u.title || '(sin título)'}» con sus ${u.screens.length} pantalla${u.screens.length === 1 ? '' : 's'}. ¿Deseas continuar?`,
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
        title: 'Eliminar módulo',
        message: `Se eliminará el módulo «${m.title || '(sin título)'}» con sus ${m.units.length} unidad${m.units.length === 1 ? '' : 'es'} y ${n} pantalla${n === 1 ? '' : 's'}. ¿Deseas continuar?`,
        confirmLabel: 'Eliminar',
        danger: true,
      })
      if (!ok) return
    }
    removeModule(m.id)
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

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const toContainerId = (over.data.current?.containerId as string) ?? (active.data.current?.containerId as string)
    const overLoc = locate(String(over.id))
    if (!overLoc) return
    moveScreen(String(active.id), toContainerId, overLoc.si)
  }

  const q = filter.trim().toLowerCase()
  const matches = (s: Screen) =>
    !q || (s.title || '').toLowerCase().includes(q) || screenTypeLabel(s.type).toLowerCase().includes(q)

  return (
    <div className="ed-tree-inner">
      <h2 className="ed-tree-title">Estructura</h2>
      <input
        className="ed-tree-filter"
        type="search"
        placeholder="Filtrar pantallas…"
        aria-label="Filtrar pantallas por título o tipo"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        {course.modules.map((m, mi) => (
          <div key={m.id} className="ed-module">
            <p className="ed-module-title">
              <InlineRename value={m.title} title="Renombrar módulo"
                onChange={(title) => updateModule(m.id, { title })} />
              {!q && (
                <span className="ed-struct-tools">
                  <button type="button" className="ed-struct-btn" title="Subir módulo" aria-label="Subir módulo"
                    disabled={mi === 0}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveModule(m.id, -1) }}>
                    <Icon name="arrow-up" size={12} /></button>
                  <button type="button" className="ed-struct-btn" title="Bajar módulo" aria-label="Bajar módulo"
                    disabled={mi === course.modules.length - 1}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveModule(m.id, 1) }}>
                    <Icon name="arrow-down" size={12} /></button>
                  <button type="button" className="ed-struct-btn" title="Eliminar módulo" aria-label="Eliminar módulo"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); void onRemoveModule(m) }}>
                    <Icon name="trash" size={12} />
                  </button>
                </span>
              )}
            </p>
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
                        <ScreenItem screen={s} containerId={m.id} issues={issuesByScreen.get(s.id)} />
                      </Fragment>
                    ))}
                  </ul>
                </SortableContext>
              )
            })()}
            {!q && (
              <AddScreenButton containerId={m.id} label="Añadir pantalla al módulo…" />
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
                  open={q ? true : !collapsed[u.id]}
                  onToggle={(e) => { if (!q) setCollapsed(u.id, !e.currentTarget.open) }}>
                  <summary className="ed-unit-title">
                    <span className="ed-unit-name">
                      <InlineRename value={u.title} title="Renombrar unidad"
                        onChange={(title) => updateUnit(u.id, { title })} />
                    </span>
                    <span className="ed-unit-count">{q ? `${visible.length}/${u.screens.length}` : u.screens.length}</span>
                    {!q && (
                      <span className="ed-struct-tools">
                        {/* Desde el extremo del módulo, subir/bajar cruza al módulo adyacente */}
                        <button type="button" className="ed-struct-btn"
                          title={ui === 0 ? 'Subir unidad (pasa al final del módulo anterior)' : 'Subir unidad'}
                          aria-label="Subir unidad"
                          disabled={mi === 0 && ui === 0}
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveUnit(u.id, -1) }}>
                          <Icon name="arrow-up" size={12} /></button>
                        <button type="button" className="ed-struct-btn"
                          title={ui === m.units.length - 1 ? 'Bajar unidad (pasa al principio del módulo siguiente)' : 'Bajar unidad'}
                          aria-label="Bajar unidad"
                          disabled={mi === course.modules.length - 1 && ui === m.units.length - 1}
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveUnit(u.id, 1) }}>
                          <Icon name="arrow-down" size={12} /></button>
                        <button type="button" className="ed-struct-btn" title="Eliminar unidad" aria-label="Eliminar unidad"
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
                          <ScreenItem screen={s} containerId={u.id} issues={issuesByScreen.get(s.id)} />
                        </Fragment>
                      ))}
                    </ul>
                  </SortableContext>
                  {!q && <AddScreenButton containerId={u.id} />}
                </details>
              )
            })}
            {!q && (
              <button className="ed-add" onClick={() => addUnit(m.id)}><Icon name="plus" size={13} /> Añadir unidad</button>
            )}
          </div>
        ))}
      </DndContext>

      {!q && (
        course.modules.length === 0 ? (
          <div className="ed-tree-empty">
            <p className="ed-hint">El curso no tiene módulos. Crea el primero para empezar a añadir pantallas.</p>
            <button className="ed-primary" onClick={addModule}><Icon name="plus" size={13} /> Crear el primer módulo</button>
          </div>
        ) : (
          <button className="ed-add ed-add-module" onClick={addModule}><Icon name="plus" size={13} /> Añadir módulo</button>
        )
      )}

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
