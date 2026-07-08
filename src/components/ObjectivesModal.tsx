import { useMemo, useState } from 'react'
import { useCourseStore } from '../store/courseStore'
import { collectObjectives, type ObjectiveInfo } from '../validation/objectives'
import { confirmDialog } from '../store/confirm'
import { SettingsWindow } from './SettingsModal'

/**
 * Gestor central de objetivos de aprendizaje. Los objetivos no son una entidad
 * propia del curso: viven como texto en las pantallas que los declaran y en las
 * evaluaciones vinculadas. Este modal los reúne todos y permite renombrarlos
 * (propagando a todos los usos), quitarlos y añadir uno nuevo declarándolo en
 * una pantalla.
 */

function ObjectiveRow({ info, onGo }: { info: ObjectiveInfo; onGo: (id: string) => void }) {
  const renameObjective = useCourseStore((s) => s.renameObjective)
  const removeObjective = useCourseStore((s) => s.removeObjective)
  const [draft, setDraft] = useState(info.text)

  // El renombrado se confirma al salir del campo (o con Intro), no tecla a
  // tecla: así un texto a medias no se «fusiona» por accidente con otro
  // objetivo que normalice igual.
  function commit() {
    const t = draft.trim()
    if (!t || t === info.text) {
      setDraft(info.text)
      return
    }
    renameObjective(info.text, t)
  }

  async function onDelete() {
    const parts = []
    if (info.declaredIn.length > 0)
      parts.push(`${info.declaredIn.length} pantalla${info.declaredIn.length === 1 ? '' : 's'}`)
    if (info.usedBy.length > 0)
      parts.push(`${info.usedBy.length} evaluación${info.usedBy.length === 1 ? '' : 'es'} vinculada${info.usedBy.length === 1 ? '' : 's'}`)
    const ok = await confirmDialog({
      title: 'Quitar objetivo',
      message: `Se quitará «${info.text}» de ${parts.join(' y ')}. Los campos quedarán vacíos (se puede deshacer con Ctrl+Z). ¿Continuar?`,
      confirmLabel: 'Quitar',
      danger: true,
    })
    if (ok) removeObjective(info.text)
  }

  const evaluated = info.usedBy.some((u) => u.evaluative)
  return (
    <div className="ed-obj-row">
      <div className="ed-obj-main">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
          title="Renombrar: el cambio se aplica a todas las pantallas y evaluaciones vinculadas"
        />
        <button className="ed-obj-del" onClick={() => void onDelete()}
          title="Quitar este objetivo de todas las pantallas y evaluaciones" aria-label="Quitar objetivo">🗑</button>
      </div>
      <div className="ed-obj-uses">
        {info.declaredIn.length === 0 && (
          <span className="ed-obj-flag err" title="Alguna evaluación lo vincula, pero ninguna pantalla lo declara (típico de cursos importados)">
            ⚠ no declarado en ninguna pantalla
          </span>
        )}
        {!evaluated && info.declaredIn.length > 0 && (
          <span className="ed-obj-flag warn" title="Ninguna actividad puntuable ni pregunta de test lo evalúa todavía">
            sin evaluación
          </span>
        )}
        {info.declaredIn.map((s) => (
          <button key={s.id} className="ed-obj-chip" onClick={() => onGo(s.id)} title="Abrir la pantalla en el editor">
            📄 {s.title}
          </button>
        ))}
        {info.usedBy.map((u, i) => (
          <button key={i} className="ed-obj-chip" disabled={!u.screenId}
            onClick={() => u.screenId && onGo(u.screenId)}
            title={u.screenId ? 'Abrir en el editor' : undefined}>
            {u.evaluative ? '✅' : '▫'} {u.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Alta de un objetivo nuevo: nace declarándose en una pantalla. */
function AddObjective() {
  const course = useCourseStore((s) => s.course)
  const updateScreen = useCourseStore((s) => s.updateScreen)
  const [text, setText] = useState('')
  const [screenId, setScreenId] = useState('')

  const groups = useMemo(
    () =>
      course.modules.flatMap((m) =>
        m.units.map((u) => ({
          label: `${m.title} › ${u.title}`,
          screens: u.screens.map((s) => ({ id: s.id, title: s.title || s.id, has: !!s.objective.trim() })),
        })),
      ),
    [course],
  )

  function onAdd() {
    const t = text.trim()
    if (!t || !screenId) return
    updateScreen(screenId, { objective: t })
    setText('')
    setScreenId('')
  }

  return (
    <div className="ed-obj-add">
      <h4>Añadir objetivo</h4>
      <p className="ed-hint">Un objetivo nace declarándose en una pantalla (campo «Objetivo de aprendizaje»). Escríbelo y elige la pantalla que lo declara; después podrás vincular sus evaluaciones desde los desplegables.</p>
      <div className="ed-obj-add-form">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Nuevo objetivo de aprendizaje…" />
        <select value={screenId} onChange={(e) => setScreenId(e.target.value)}>
          <option value="">Declararlo en la pantalla…</option>
          {groups.map((g) => (
            <optgroup key={g.label} label={g.label}>
              {g.screens.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}{s.has ? ' (ya tiene objetivo: se reemplaza)' : ''}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <button onClick={onAdd} disabled={!text.trim() || !screenId}>Añadir</button>
      </div>
    </div>
  )
}

export function ObjectivesModal({ onClose }: { onClose: () => void }) {
  const course = useCourseStore((s) => s.course)
  const goToScreen = useCourseStore((s) => s.goToScreen)
  const objectives = useMemo(() => collectObjectives(course), [course])

  function onGo(id: string) {
    onClose()
    goToScreen(id)
  }

  return (
    <SettingsWindow title="🎯 Objetivos de aprendizaje" onClose={onClose}>
      <p className="ed-hint">
        Cada objetivo se declara en una o varias pantallas y las evaluaciones (interacciones puntuables y
        preguntas de test) se vinculan a él. Renombrar aquí actualiza <strong>todos</strong> los usos a la vez;
        quitarlo vacía el campo en todas partes. Ambas acciones se pueden deshacer con Ctrl+Z.
      </p>
      {objectives.length === 0 ? (
        <p>El curso aún no declara ningún objetivo.</p>
      ) : (
        <div className="ed-obj-list">
          {objectives.map((o) => (
            <ObjectiveRow key={o.key} info={o} onGo={onGo} />
          ))}
        </div>
      )}
      <AddObjective />
    </SettingsWindow>
  )
}
