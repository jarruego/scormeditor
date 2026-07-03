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

function ScreenItem({ screen, unitId }: { screen: Screen; unitId: string }) {
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
        <span className="ed-screen-type">{screen.type}</span>
        <span className="ed-screen-title">{screen.title || '(sin título)'}</span>
        {flagged && <span className="ed-flag" title="Pendiente de desarrollo">⚠</span>}
      </button>
      <span className="ed-screen-actions">
        <button onClick={() => duplicate(screen.id)} title="Duplicar">⧉</button>
        <button onClick={() => remove(screen.id)} title="Eliminar">🗑</button>
      </span>
    </li>
  )
}

export function CourseTree() {
  const course = useCourseStore((s) => s.course)
  const moveScreen = useCourseStore((s) => s.moveScreen)
  const addScreen = useCourseStore((s) => s.addScreen)
  const locate = useCourseStore((s) => s.locate)
  const select = useCourseStore((s) => s.selectScreen)
  const finalSelected = useCourseStore((s) => s.selectedScreenId === '__final__')

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

  return (
    <div className="ed-tree-inner">
      <h2 className="ed-tree-title">Estructura</h2>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        {course.modules.map((m) => (
          <div key={m.id} className="ed-module">
            <p className="ed-module-title">{m.title}</p>
            {m.units.map((u) => (
              <div key={u.id} className="ed-unit">
                <p className="ed-unit-title">{u.title}</p>
                <SortableContext items={u.screens.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <ul className="ed-screens">
                    {u.screens.map((s) => (
                      <ScreenItem key={s.id} screen={s} unitId={u.id} />
                    ))}
                  </ul>
                </SortableContext>
                <button className="ed-add" onClick={() => addScreen(u.id)}>+ Añadir pantalla</button>
              </div>
            ))}
          </div>
        ))}
      </DndContext>

      <div className="ed-module">
        <p className="ed-module-title">Evaluación</p>
        <div className="ed-unit">
          <ul className="ed-screens">
            <li className={`ed-screen ${finalSelected ? 'is-selected' : ''}`}>
              <button className="ed-screen-label" onClick={() => select('__final__')}>
                <span className="ed-screen-type">test</span>
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
    </div>
  )
}
