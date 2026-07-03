import { useMemo, useState, useEffect, useRef } from 'react'
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

  return (
    <li ref={setNodeRef} style={style} className={`ed-screen ${selected ? 'is-selected' : ''}`}>
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
        <button onClick={() => remove(screen.id)} title="Eliminar">🗑</button>
      </span>
    </li>
  )
}

/** Plantillas del botón «+ Añadir pantalla». */
const PRESETS: { key: string; icon: string; label: string; make: () => Partial<Screen> }[] = [
  { key: 'text', icon: '📄', label: 'Texto', make: () => ({}) },
  {
    key: 'text-image',
    icon: '🖼️',
    label: 'Texto + imagen',
    make: () => ({ visual_resource: { kind: 'image', layout: 'right', media_width: '50' } as any }),
  },
  {
    key: 'activity',
    icon: '🧩',
    label: 'Actividad',
    make: () => ({
      interaction: {
        id: `i-${Math.random().toString(36).slice(2, 7)}`,
        type: 'single_choice',
        prompt: '',
        instructions: '',
        options: [],
        config: {},
        feedback: { correct: 'Correcto.', incorrect: 'Revisa tu respuesta.', explanation: '' },
        scored: true,
        points: 1,
        attempts: 1,
        retries: 0,
        learning_objective: '',
        source_refs: [],
      } as any,
    }),
  },
  {
    key: 'video',
    icon: '🎬',
    label: 'Vídeo',
    make: () => ({ type: 'video', visual_resource: { kind: 'video_youtube', layout: 'top' } as any }),
  },
]

function AddScreenMenu({ unitId }: { unitId: string }) {
  const addScreen = useCourseStore((s) => s.addScreen)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="ed-addmenu" ref={ref}>
      <button className="ed-add" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        + Añadir pantalla…
      </button>
      {open && (
        <div className="ed-addmenu-list" role="menu">
          {PRESETS.map((p) => (
            <button key={p.key} role="menuitem"
              onClick={() => { setOpen(false); addScreen(unitId, undefined, p.make()) }}>
              <span aria-hidden="true">{p.icon}</span> {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function CourseTree() {
  const course = useCourseStore((s) => s.course)
  const moveScreen = useCourseStore((s) => s.moveScreen)
  const locate = useCourseStore((s) => s.locate)
  const select = useCourseStore((s) => s.selectScreen)
  const finalSelected = useCourseStore((s) => s.selectedScreenId === '__final__')
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
            <p className="ed-module-title">{m.title}</p>
            {m.units.map((u) => {
              const visible = u.screens.filter(matches)
              if (q && visible.length === 0) return null
              return (
                // key con el filtro: al (des)activar el filtro se remonta abierto.
                <details key={`${u.id}-${q ? 'f' : 'n'}`} className="ed-tree-unit" open>
                  <summary className="ed-unit-title">
                    <span className="ed-unit-name">{u.title}</span>
                    <span className="ed-unit-count">{q ? `${visible.length}/${u.screens.length}` : u.screens.length}</span>
                  </summary>
                  <SortableContext items={u.screens.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    <ul className="ed-screens">
                      {visible.map((s) => (
                        <ScreenItem key={s.id} screen={s} unitId={u.id} issues={issuesByScreen.get(s.id)} />
                      ))}
                    </ul>
                  </SortableContext>
                  {!q && <AddScreenMenu unitId={u.id} />}
                </details>
              )
            })}
          </div>
        ))}
      </DndContext>

      {!q && (
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
      )}
    </div>
  )
}
