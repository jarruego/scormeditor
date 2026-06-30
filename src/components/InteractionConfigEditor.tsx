import type { Interaction, InteractionOption } from '../schema/course.schema'
import { RichTextArea } from './RichTextArea'

const rid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 7)}`

/**
 * Editor de la parte específica (`config` / `options`) de cada tipo de
 * interacción. Se monta dentro del editor de pantalla.
 */
export function InteractionConfigEditor({
  it,
  onChange,
}: {
  it: Interaction
  onChange: (next: Interaction) => void
}) {
  const cfg: Record<string, any> = it.config || {}
  const setConfig = (patch: Record<string, any>) => onChange({ ...it, config: { ...cfg, ...patch } })
  const setOptions = (options: InteractionOption[]) => onChange({ ...it, options })

  switch (it.type) {
    // ---- Elección simple / Verdadero-Falso --------------------------------
    case 'single_choice':
    case 'true_false':
      return (
        <ListEditor
          title="Opciones de respuesta"
          items={it.options}
          onChange={(options) => setOptions(options as InteractionOption[])}
          create={() => ({ id: rid('o'), text: '', correct: false })}
          render={(o, update) => (
            <>
              <input value={o.text} placeholder="Texto de la opción" onChange={(e) => update({ ...o, text: e.target.value })} />
              <label className="ed-check"><input type="checkbox" checked={!!o.correct} onChange={(e) => update({ ...o, correct: e.target.checked })} /><span>Correcta</span></label>
              <input value={o.feedback || ''} placeholder="Feedback de esta opción (opcional)" onChange={(e) => update({ ...o, feedback: e.target.value })} />
            </>
          )}
        />
      )

    // ---- Escenario con decisión -------------------------------------------
    case 'scenario_decision':
      return (
        <>
          <label className="ed-field"><span>Escenario / caso</span>
            <RichTextArea rows={3} value={cfg.scenario || ''} onChange={(v) => setConfig({ scenario: v })} /></label>
          <ListEditor
            title="Opciones de decisión"
            items={it.options}
            onChange={(options) => setOptions(options as InteractionOption[])}
            create={() => ({ id: rid('o'), text: '', correct: false, feedback: '' })}
            render={(o, update) => (
              <>
                <input value={o.text} placeholder="Texto de la decisión" onChange={(e) => update({ ...o, text: e.target.value })} />
                <label className="ed-check"><input type="checkbox" checked={!!o.correct} onChange={(e) => update({ ...o, correct: e.target.checked })} /><span>Correcta</span></label>
                <input value={o.feedback || ''} placeholder="Feedback de esta decisión" onChange={(e) => update({ ...o, feedback: e.target.value })} />
              </>
            )}
          />
        </>
      )

    // ---- Clasificación / Emparejamiento (grupos + ítems) ------------------
    case 'classification':
    case 'match_pairs': {
      const groups: { id: string; label: string }[] = cfg.groups || []
      return (
        <>
          <ListEditor
            title="Categorías / grupos"
            items={groups}
            onChange={(g) => setConfig({ groups: g })}
            create={() => ({ id: rid('g'), label: '' })}
            render={(g, update) => (
              <input value={g.label} placeholder="Etiqueta de la categoría" onChange={(e) => update({ ...g, label: e.target.value })} />
            )}
          />
          <ListEditor
            title="Elementos a clasificar"
            items={it.options}
            onChange={(options) => setOptions(options as InteractionOption[])}
            create={() => ({ id: rid('o'), text: '', group: groups[0]?.id || '' })}
            render={(o, update) => (
              <>
                <input value={o.text} placeholder="Texto del elemento" onChange={(e) => update({ ...o, text: e.target.value })} />
                <select value={o.group || ''} onChange={(e) => update({ ...o, group: e.target.value })}>
                  <option value="">— categoría correcta —</option>
                  {groups.map((g) => <option key={g.id} value={g.id}>{g.label || g.id}</option>)}
                </select>
              </>
            )}
          />
        </>
      )
    }

    // ---- Ordenar pasos -----------------------------------------------------
    case 'sort_steps': {
      const steps: { id: string; text: string; order: number }[] = cfg.steps || []
      // El orden correcto es la posición actual en la lista (1..n)
      const commit = (next: any[]) => setConfig({ steps: next.map((s, i) => ({ ...s, order: i + 1 })) })
      return (
        <ListEditor
          title="Pasos (en el ORDEN CORRECTO; se barajan en el SCORM)"
          items={steps}
          onChange={commit}
          reorder
          create={() => ({ id: rid('p'), text: '', order: steps.length + 1 })}
          render={(s, update) => (
            <input value={s.text} placeholder="Texto del paso" onChange={(e) => update({ ...s, text: e.target.value })} />
          )}
        />
      )
    }

    // ---- Acordeón / Pestañas (título + cuerpo) ----------------------------
    case 'accordion':
    case 'tabs': {
      const items: { title: string; body: string }[] = cfg.items || []
      return (
        <ListEditor
          title={it.type === 'tabs' ? 'Pestañas' : 'Apartados del acordeón'}
          items={items}
          onChange={(next) => setConfig({ items: next })}
          create={() => ({ title: '', body: '' })}
          render={(item, update) => (
            <div className="ed-stack">
              <input value={item.title} placeholder="Título" onChange={(e) => update({ ...item, title: e.target.value })} />
              <RichTextArea rows={2} value={item.body} onChange={(v) => update({ ...item, body: v })} />
            </div>
          )}
        />
      )
    }

    // ---- Flip cards --------------------------------------------------------
    case 'flip_cards': {
      const cards: { front: string; back: string }[] = cfg.cards || []
      return (
        <ListEditor
          title="Tarjetas"
          items={cards}
          onChange={(next) => setConfig({ cards: next })}
          create={() => ({ front: '', back: '' })}
          render={(c, update) => (
            <>
              <input value={c.front} placeholder="Anverso" onChange={(e) => update({ ...c, front: e.target.value })} />
              <input value={c.back} placeholder="Reverso" onChange={(e) => update({ ...c, back: e.target.value })} />
            </>
          )}
        />
      )
    }

    // ---- Práctica de caso (rúbrica) ---------------------------------------
    case 'case_practice': {
      const rubric: { label: string }[] = cfg.rubric || []
      return (
        <ListEditor
          title="Rúbrica de autoevaluación (opcional)"
          items={rubric}
          onChange={(next) => setConfig({ rubric: next })}
          create={() => ({ label: '' })}
          render={(r, update) => (
            <input value={r.label} placeholder="Criterio de la rúbrica" onChange={(e) => update({ ...r, label: e.target.value })} />
          )}
        />
      )
    }

    // ---- Vídeo -------------------------------------------------------------
    case 'video':
      return (
        <div className="ed-stack">
          <label className="ed-field"><span>ID de YouTube (o deja vacío y usa archivo)</span>
            <input value={cfg.youtube || ''} onChange={(e) => setConfig({ youtube: e.target.value })} /></label>
          <label className="ed-field"><span>Ruta de vídeo propio (assets/media/…)</span>
            <input value={cfg.src || ''} onChange={(e) => setConfig({ src: e.target.value })} /></label>
          <label className="ed-field"><span>Transcripción</span>
            <textarea rows={3} value={cfg.transcript || ''} onChange={(e) => setConfig({ transcript: e.target.value })} /></label>
        </div>
      )

    // ---- Hotspots ----------------------------------------------------------
    case 'hotspots': {
      const spots: any[] = cfg.spots || []
      return (
        <>
          <label className="ed-field"><span>Imagen (assets/img/…)</span>
            <input value={cfg.image || ''} onChange={(e) => setConfig({ image: e.target.value })} /></label>
          <label className="ed-field"><span>Texto alternativo de la imagen</span>
            <input value={cfg.alt || ''} onChange={(e) => setConfig({ alt: e.target.value })} /></label>
          <ListEditor
            title="Zonas activas (x, y, w, h en %)"
            items={spots}
            onChange={(next) => setConfig({ spots: next })}
            create={() => ({ id: rid('z'), label: '', x: 10, y: 10, w: 12, h: 12, correct: false, feedback: '' })}
            render={(s, update) => (
              <div className="ed-stack">
                <input value={s.label} placeholder="Etiqueta accesible" onChange={(e) => update({ ...s, label: e.target.value })} />
                <div className="ed-row">
                  {(['x', 'y', 'w', 'h'] as const).map((k) => (
                    <label key={k} className="ed-field ed-field-narrow"><span>{k} %</span>
                      <input type="number" value={s[k]} onChange={(e) => update({ ...s, [k]: Number(e.target.value) })} /></label>
                  ))}
                  <label className="ed-check"><input type="checkbox" checked={!!s.correct} onChange={(e) => update({ ...s, correct: e.target.checked })} /><span>Correcta</span></label>
                </div>
                <input value={s.feedback || ''} placeholder="Feedback de la zona" onChange={(e) => update({ ...s, feedback: e.target.value })} />
              </div>
            )}
          />
        </>
      )
    }

    default:
      return null
  }
}

// ---- Editor genérico de listas ---------------------------------------------
function ListEditor<T>({
  title,
  items,
  onChange,
  create,
  render,
  reorder = false,
}: {
  title: string
  items: T[]
  onChange: (next: T[]) => void
  create: () => T
  render: (item: T, update: (next: T) => void) => React.ReactNode
  reorder?: boolean
}) {
  const update = (i: number, next: T) => onChange(items.map((x, j) => (j === i ? next : x)))
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i))
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = items.slice()
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  return (
    <div className="ed-options">
      <p className="ed-options-head">{title}</p>
      {items.map((item, i) => (
        <div key={i} className="ed-option-row ed-config-row">
          <span className="ed-config-num">{i + 1}</span>
          <div className="ed-config-fields">{render(item, (next) => update(i, next))}</div>
          {reorder && (
            <span className="ed-config-move">
              <button type="button" onClick={() => move(i, -1)} aria-label="Subir">▲</button>
              <button type="button" onClick={() => move(i, 1)} aria-label="Bajar">▼</button>
            </span>
          )}
          <button type="button" onClick={() => remove(i)} aria-label="Eliminar">✕</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, create()])}>+ Añadir</button>
    </div>
  )
}
