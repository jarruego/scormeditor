import { useState } from 'react'
import { confirmDialog } from '../store/confirm'
import { Icon } from './Icon'

/**
 * Editor genérico de listas del editor (opciones, tarjetas, apartados,
 * preguntas…). Extraído de `InteractionConfigEditor` y enriquecido (plan UX
 * fase 3): todas las listas se comportan igual —
 * - **Reordenar siempre** (▲/▼; se deshabilitan en los extremos).
 * - **Duplicar** (⧉): clon profundo; si el ítem tiene `id` de primer nivel se
 *   regenera para no duplicar identidades (estado del runtime, radios…). Se
 *   puede afinar con `clone`.
 * - **Plegado por ítem** (solo con `summary`): la fila plegada muestra
 *   `nº + resumen` y se despliega al pulsarla. Al montar nacen abiertos los
 *   primeros `collapseFrom` (def. 4); los añadidos/duplicados nacen abiertos.
 * - `confirmRemove` devuelve el mensaje de confirmación para borrar un ítem
 *   (null/undefined = borrar sin preguntar; deshacer siempre disponible).
 */
export function ListEditor<T>({
  title,
  items,
  onChange,
  create,
  render,
  summary,
  clone,
  addLabel,
  collapseFrom = 4,
  confirmRemove,
}: {
  title: string
  items: T[]
  onChange: (next: T[]) => void
  create: () => T
  render: (item: T, update: (next: T) => void, index: number) => React.ReactNode
  /** Texto de la fila plegada; su presencia activa el plegado por ítem. */
  summary?: (item: T, index: number) => string
  /** Clon para «Duplicar» (def.: clon profundo + regenerar `id` de 1er nivel). */
  clone?: (item: T) => T
  addLabel?: string
  /** Con `summary`: nº de ítems que nacen abiertos al montar (def. 4). */
  collapseFrom?: number
  /** Mensaje de confirmación al eliminar el ítem (null = sin confirmación). */
  confirmRemove?: (item: T) => string | null
}) {
  // Índices abiertos (solo aplica con `summary`). Vive por posición: las
  // mutaciones (mover/duplicar/eliminar) lo reajustan para seguir al ítem.
  const [open, setOpen] = useState<Set<number>>(
    () => new Set(items.map((_, i) => i).filter((i) => i < collapseFrom)),
  )
  const isOpen = (i: number) => !summary || open.has(i)
  const mutOpen = (fn: (s: Set<number>) => void) =>
    setOpen((prev) => {
      const s = new Set(prev)
      fn(s)
      return s
    })

  const update = (i: number, next: T) => onChange(items.map((x, j) => (j === i ? next : x)))

  async function remove(i: number) {
    const msg = confirmRemove?.(items[i])
    if (msg) {
      const ok = await confirmDialog({
        title: 'Eliminar elemento',
        message: msg,
        confirmLabel: 'Eliminar',
        danger: true,
      })
      if (!ok) return
    }
    onChange(items.filter((_, j) => j !== i))
    mutOpen((s) => {
      s.delete(i)
      const shifted = [...s].map((j) => (j > i ? j - 1 : j))
      s.clear()
      shifted.forEach((j) => s.add(j))
    })
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = items.slice()
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
    mutOpen((s) => {
      const a = s.has(i)
      const b = s.has(j)
      if (a) s.add(j)
      else s.delete(j)
      if (b) s.add(i)
      else s.delete(i)
    })
  }

  const defaultClone = (item: T): T => {
    const c = JSON.parse(JSON.stringify(item)) as T
    if (c && typeof c === 'object' && typeof (c as Record<string, unknown>).id === 'string') {
      const old = (c as Record<string, unknown>).id as string
      const prefix = old.split('-')[0] || 'x'
      ;(c as Record<string, unknown>).id = `${prefix}-${Math.random().toString(36).slice(2, 7)}`
    }
    return c
  }

  function duplicate(i: number) {
    const copy = (clone ?? defaultClone)(items[i])
    const next = items.slice()
    next.splice(i + 1, 0, copy)
    onChange(next)
    mutOpen((s) => {
      const shifted = [...s].map((j) => (j > i ? j + 1 : j))
      s.clear()
      shifted.forEach((j) => s.add(j))
      s.add(i + 1)
    })
  }

  function add() {
    onChange([...items, create()])
    mutOpen((s) => s.add(items.length))
  }

  return (
    <div className="ed-options">
      <p className="ed-options-head">{title}</p>
      {items.map((item, i) => (
        <div key={i} className="ed-option-row ed-config-row">
          <span className="ed-config-num">{i + 1}</span>
          {isOpen(i) ? (
            <div className="ed-config-fields">{render(item, (next) => update(i, next), i)}</div>
          ) : (
            <button
              type="button"
              className="ed-config-sum"
              title="Desplegar para editar"
              onClick={() => mutOpen((s) => s.add(i))}
            >
              {summary!(item, i).trim() || '(vacío)'}
            </button>
          )}
          <span className="ed-config-tools">
            {summary && isOpen(i) && (
              <button type="button" className="ed-icobtn" onClick={() => mutOpen((s) => s.delete(i))}
                title="Plegar" aria-label="Plegar"><Icon name="fold" size={13} /></button>
            )}
            <button type="button" className="ed-icobtn" onClick={() => move(i, -1)} disabled={i === 0}
              title="Subir" aria-label="Subir"><Icon name="arrow-up" size={13} /></button>
            <button type="button" className="ed-icobtn" onClick={() => move(i, 1)} disabled={i === items.length - 1}
              title="Bajar" aria-label="Bajar"><Icon name="arrow-down" size={13} /></button>
            <button type="button" className="ed-icobtn" onClick={() => duplicate(i)}
              title="Duplicar" aria-label="Duplicar"><Icon name="copy" size={13} /></button>
            <button type="button" className="ed-icobtn ed-icobtn-danger" onClick={() => void remove(i)}
              title="Eliminar" aria-label="Eliminar"><Icon name="trash" size={13} /></button>
          </span>
        </div>
      ))}
      <button type="button" onClick={add}>
        <Icon name="plus" size={13} /> {(addLabel ?? '+ Añadir').replace(/^\+\s*/, '')}
      </button>
    </div>
  )
}
