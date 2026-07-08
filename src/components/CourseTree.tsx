import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
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
import { screenTypeLabel, screenTypeIcon } from '../schema/labels'
import { validateCourse, type Issue } from '../validation/validators'
import { confirmDialog } from '../store/confirm'
import { InlineRename } from './InlineRename'
import { AddScreenModal } from './AddScreenModal'

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
      {isErr ? '⛔' : '⚠'}
    </span>
  )
}

function ScreenItem({ screen, unitId, issues }: { screen: Screen; unitId: string; issues?: ScreenIssues }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: screen.id,
    data: { unitId },
  })
  const selected = useCourseStore((s) => s.selectedScreenId === screen.id)
  const select = useCourseStore((s) => s.selectScreen)
  const duplicate = useCourseStore((s) => s.duplicateScreen)
  const remove = useCourseStore((s) => s.deleteScreen)

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  const flagged = screen.type === 'content_placeholder' || screen.status === 'esqueleto_pendiente_desarrollo'

  // Al seleccionarse (p. ej. pantalla recién creada desde una receta, o enlace
  // desde Validación), el árbol hace scroll hasta dejarla a la vista.
  const liRef = useRef<HTMLLIElement | null>(null)
  useEffect(() => {
    if (selected) liRef.current?.scrollIntoView({ block: 'nearest' })
  }, [selected])
  const setRefs = (el: HTMLLIElement | null) => { liRef.current = el; setNodeRef(el) }

  return (
    <li ref={setRefs} style={style} className={`ed-screen ${selected ? 'is-selected' : ''}`}>
      <button className="ed-grip" {...attributes} {...listeners} aria-label="Arrastrar para reordenar">⋮⋮</button>
      <button className="ed-screen-label" onClick={() => select(screen.id)}>
        <span className="ed-screen-type">
          <span aria-hidden="true">{screenTypeIcon(screen.type)}</span> {screenTypeLabel(screen.type)}
          {screen.interaction && (screen.interaction.scored
            ? <span className="ed-eval" title="Actividad evaluable: puntúa para la nota"> · ⭐ evaluable</span>
            : <span title="Interacción informativa (no puntúa)"> · 🧩</span>)}
        </span>
        <span className="ed-screen-title">{screen.title || '(sin título)'}</span>
        {flagged && <span className="ed-flag" title="Pendiente de desarrollo">⚠</span>}
      </button>
      <IssueBadge info={issues} />
      <span className="ed-screen-actions">
        <button onClick={() => duplicate(screen.id)} title="Duplicar">⧉</button>
        <button
          onClick={() => {
            void confirmDialog({
              title: 'Eliminar pantalla',
              message: `Se eliminará la pantalla «${screen.title || '(sin título)'}» y no podrá recuperarse (salvo con Deshacer). ¿Deseas continuar?`,
              confirmLabel: 'Eliminar',
              danger: true,
            }).then((ok) => { if (ok) remove(screen.id) })
          }}
          title="Eliminar"
        >🗑</button>
      </span>
    </li>
  )
}

/** Botón «+ Añadir pantalla»: abre el selector de recetas (AddScreenModal). */
function AddScreenButton({ unitId }: { unitId: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className="ed-add" onClick={() => setOpen(true)}>+ Añadir pantalla…</button>
      {open && <AddScreenModal unitId={unitId} onClose={() => setOpen(false)} />}
    </>
  )
}

/** Punto de inserción entre pantallas: al pasar el ratón (o con Tab) aparece un
 *  divisor con «+» que abre el selector de recetas insertando justo ahí. */
function InsertPoint({ unitId, index }: { unitId: string; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <li className="ed-insert" role="presentation">
      <button aria-label="Insertar pantalla aquí" title="Insertar pantalla aquí" onClick={() => setOpen(true)}>
        <span aria-hidden="true">＋</span>
      </button>
      {open && <AddScreenModal unitId={unitId} atIndex={index} onClose={() => setOpen(false)} />}
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
  const [filter, setFilter] = useState('')

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
    const toUnitId = (over.data.current?.unitId as string) ?? (active.data.current?.unitId as string)
    const overLoc = locate(String(over.id))
    if (!overLoc) return
    moveScreen(String(active.id), toUnitId, overLoc.si)
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
        {course.modules.map((m) => (
          <div key={m.id} className="ed-module">
            <p className="ed-module-title">
              <InlineRename value={m.title} title="Renombrar módulo"
                onChange={(title) => updateModule(m.id, { title })} />
            </p>
            {m.units.map((u) => {
              const visible = u.screens.filter(matches)
              if (q && visible.length === 0) return null
              return (
                // key con el filtro: al (des)activar el filtro se remonta abierto.
                <details key={`${u.id}-${q ? 'f' : 'n'}`} className="ed-tree-unit" open>
                  <summary className="ed-unit-title">
                    <span className="ed-unit-name">
                      <InlineRename value={u.title} title="Renombrar unidad"
                        onChange={(title) => updateUnit(u.id, { title })} />
                    </span>
                    <span className="ed-unit-count">{q ? `${visible.length}/${u.screens.length}` : u.screens.length}</span>
                  </summary>
                  <SortableContext items={u.screens.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    <ul className="ed-screens">
                      {visible.map((s, i) => (
                        <Fragment key={s.id}>
                          {/* Con filtro activo los índices no se corresponden con la unidad → sin puntos de inserción */}
                          {!q && <InsertPoint unitId={u.id} index={i} />}
                          <ScreenItem screen={s} unitId={u.id} issues={issuesByScreen.get(s.id)} />
                        </Fragment>
                      ))}
                    </ul>
                  </SortableContext>
                  {!q && <AddScreenButton unitId={u.id} />}
                </details>
              )
            })}
          </div>
        ))}
      </DndContext>

      {!q && (
        <>
          <div className="ed-module">
            <p className="ed-module-title">Evaluación</p>
            <div className="ed-unit">
              <ul className="ed-screens">
                <li className={`ed-screen ${finalSelected ? 'is-selected' : ''}`}>
                  <button className="ed-screen-label" onClick={() => select('__final__')}>
                    <span className="ed-screen-type"><span aria-hidden="true">📝</span> Test</span>
                    <span className="ed-screen-title">
                      {course.assessments.final_test
                        ? course.assessments.final_test.title || 'Test final'
                        : 'Test final (vacío)'}
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="ed-module">
            <p className="ed-module-title">Materiales</p>
            <div className="ed-unit">
              <ul className="ed-screens">
                <li className={`ed-screen ${glossarySelected ? 'is-selected' : ''}`}>
                  <button className="ed-screen-label" onClick={() => select('__glossary__')}>
                    <span className="ed-screen-type"><span aria-hidden="true">📖</span> Glosario</span>
                    <span className="ed-screen-title">
                      {course.glossary.length
                        ? `${course.glossary.length} término${course.glossary.length === 1 ? '' : 's'}`
                        : 'Vacío'}
                    </span>
                  </button>
                </li>
                <li className={`ed-screen ${biblioSelected ? 'is-selected' : ''}`}>
                  <button className="ed-screen-label" onClick={() => select('__bibliography__')}>
                    <span className="ed-screen-type"><span aria-hidden="true">🔗</span> Recursos</span>
                    <span className="ed-screen-title">
                      {course.bibliography.length
                        ? `${course.bibliography.length} referencia${course.bibliography.length === 1 ? '' : 's'}`
                        : 'Sin referencias'}
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
