import { useEffect, useRef, useState } from 'react'
import { useCourseStore } from '../store/courseStore'
import type { AssetMap } from '../export/exportScorm'
import { SettingsWindow } from './SettingsModal'
import { Icon } from './Icon'

/**
 * Editor visual de zonas para la interacción `hotspots`: muestra la imagen a
 * tamaño grande y permite dibujar zonas arrastrando sobre ella, moverlas,
 * redimensionarlas (tirador de la esquina) y editar etiqueta/correcta/feedback
 * de la zona seleccionada. Trabaja sobre una copia local y solo escribe en el
 * curso al pulsar «Guardar zonas» (una única entrada en el historial).
 * Las coordenadas se guardan como en el runtime: x, y, w, h en % de la imagen.
 */

export interface HotspotSpot {
  id: string
  label: string
  x: number
  y: number
  w: number
  h: number
  correct?: boolean
  feedback?: string
}

const rid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 7)}`
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const round1 = (v: number) => Math.round(v * 10) / 10
/** Tamaño mínimo de zona en % (por debajo, el arrastre se considera un clic). */
const MIN_SIZE = 2

// Object URL para previsualizar un asset (mismo criterio que useObjectUrl de
// ScreenEditor; se duplica aquí para no importar desde ScreenEditor y crear un
// ciclo ScreenEditor → InteractionConfigEditor → este modal).
function useAssetUrl(val: AssetMap[string] | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (val == null) { setUrl(null); return }
    const blob = val instanceof Blob ? val : new Blob([val as BlobPart])
    const u = URL.createObjectURL(blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [val])
  return url
}

type Drag = {
  mode: 'draw' | 'move' | 'resize'
  id: string
  start: { x: number; y: number }
  orig: HotspotSpot
  /** Última geometría aplicada durante el arrastre (lectura síncrona en pointerup). */
  last?: { w: number; h: number }
}

export function HotspotZonesModal({
  image,
  alt,
  initialSpots,
  onSave,
  onClose,
}: {
  image: string
  alt?: string
  initialSpots: HotspotSpot[]
  onSave: (spots: HotspotSpot[]) => void
  onClose: () => void
}) {
  const assets = useCourseStore((s) => s.assets)
  const [spots, setSpots] = useState<HotspotSpot[]>(() => initialSpots.map((s) => ({ ...s })))
  const [selId, setSelId] = useState<string | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<Drag | null>(null)

  const isHttp = /^https?:\/\//i.test(image)
  const blobUrl = useAssetUrl(isHttp ? undefined : assets[image])
  const src = isHttp ? image : blobUrl

  const sel = spots.find((s) => s.id === selId) || null

  function pct(e: React.PointerEvent): { x: number; y: number } {
    const r = stageRef.current!.getBoundingClientRect()
    return {
      x: clamp(((e.clientX - r.left) / r.width) * 100, 0, 100),
      y: clamp(((e.clientY - r.top) / r.height) * 100, 0, 100),
    }
  }

  function updateSpot(id: string, patch: Partial<HotspotSpot>) {
    setSpots((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!stageRef.current || e.button !== 0) return
    const t = e.target as HTMLElement
    const zoneEl = t.closest<HTMLElement>('[data-zone-id]')
    const p = pct(e)
    if (zoneEl) {
      const id = zoneEl.dataset.zoneId!
      const orig = spots.find((s) => s.id === id)
      if (!orig) return
      setSelId(id)
      dragRef.current = { mode: t.dataset.handle ? 'resize' : 'move', id, start: p, orig: { ...orig } }
    } else {
      // Dibujo de zona nueva: nace en el punto de anclaje y crece con el arrastre.
      const id = rid('z')
      const spot: HotspotSpot = { id, label: '', x: p.x, y: p.y, w: 0, h: 0, correct: false, feedback: '' }
      setSpots((prev) => [...prev, spot])
      setSelId(id)
      dragRef.current = { mode: 'draw', id, start: p, orig: spot }
    }
    stageRef.current.setPointerCapture(e.pointerId)
    e.preventDefault()
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = dragRef.current
    if (!d) return
    const p = pct(e)
    const dx = p.x - d.start.x
    const dy = p.y - d.start.y
    if (d.mode === 'draw') {
      const patch = {
        x: round1(Math.min(d.start.x, p.x)),
        y: round1(Math.min(d.start.y, p.y)),
        w: round1(Math.abs(dx)),
        h: round1(Math.abs(dy)),
      }
      d.last = { w: patch.w, h: patch.h }
      updateSpot(d.id, patch)
    } else if (d.mode === 'move') {
      updateSpot(d.id, {
        x: round1(clamp(d.orig.x + dx, 0, 100 - d.orig.w)),
        y: round1(clamp(d.orig.y + dy, 0, 100 - d.orig.h)),
      })
    } else {
      updateSpot(d.id, {
        w: round1(clamp(d.orig.w + dx, MIN_SIZE, 100 - d.orig.x)),
        h: round1(clamp(d.orig.h + dy, MIN_SIZE, 100 - d.orig.y)),
      })
    }
  }

  function onPointerUp() {
    const d = dragRef.current
    dragRef.current = null
    if (!d) return
    if (d.mode === 'draw') {
      // Arrastre demasiado corto = clic en zona vacía: se descarta la zona
      // provisional y solo se deselecciona. Se decide con d.last (síncrono),
      // no con el estado de React, que puede no estar refrescado aún.
      if (!d.last || d.last.w < MIN_SIZE || d.last.h < MIN_SIZE) {
        setSpots((prev) => prev.filter((x) => x.id !== d.id))
        setSelId(null)
      }
    }
  }

  // Teclado sobre una zona: flechas mueven 1 % (con Mayús, redimensionan);
  // Supr/Retroceso elimina.
  function onZoneKeyDown(e: React.KeyboardEvent, s: HotspotSpot) {
    const step = 1
    let patch: Partial<HotspotSpot> | null = null
    if (e.key === 'Delete' || e.key === 'Backspace') {
      removeSpot(s.id)
      e.preventDefault()
      return
    }
    if (e.shiftKey) {
      if (e.key === 'ArrowRight') patch = { w: round1(clamp(s.w + step, MIN_SIZE, 100 - s.x)) }
      if (e.key === 'ArrowLeft') patch = { w: round1(clamp(s.w - step, MIN_SIZE, 100 - s.x)) }
      if (e.key === 'ArrowDown') patch = { h: round1(clamp(s.h + step, MIN_SIZE, 100 - s.y)) }
      if (e.key === 'ArrowUp') patch = { h: round1(clamp(s.h - step, MIN_SIZE, 100 - s.y)) }
    } else {
      if (e.key === 'ArrowRight') patch = { x: round1(clamp(s.x + step, 0, 100 - s.w)) }
      if (e.key === 'ArrowLeft') patch = { x: round1(clamp(s.x - step, 0, 100 - s.w)) }
      if (e.key === 'ArrowDown') patch = { y: round1(clamp(s.y + step, 0, 100 - s.h)) }
      if (e.key === 'ArrowUp') patch = { y: round1(clamp(s.y - step, 0, 100 - s.h)) }
    }
    if (patch) {
      updateSpot(s.id, patch)
      e.preventDefault()
    }
  }

  function removeSpot(id: string) {
    setSpots((prev) => prev.filter((s) => s.id !== id))
    setSelId((cur) => (cur === id ? null : cur))
  }

  return (
    <SettingsWindow title="Zonas activas sobre la imagen" onClose={onClose} wide>
      <p className="ed-hint">
        <strong>Arrastra sobre la imagen</strong> para dibujar una zona nueva. Arrastra una zona para moverla
        y usa el tirador de su esquina para cambiar el tamaño. Con el teclado: flechas mueven la zona
        seleccionada (con Mayús cambian el tamaño) y Supr la elimina. Los cambios no se aplican hasta pulsar
        «Guardar zonas».
      </p>
      <div className="ed-hz-layout">
        <div
          ref={stageRef}
          className="ed-hz-stage"
          onPointerDown={src ? onPointerDown : undefined}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {src ? (
            <img src={src} alt={alt || ''} draggable={false} />
          ) : (
            <p className="ed-media-empty">
              {image
                ? `Sin archivo subido para «${image}». Sube la imagen para poder dibujar las zonas.`
                : 'Sube primero la imagen de la interacción para poder dibujar las zonas.'}
            </p>
          )}
          {src && spots.map((s, i) => (
            <div
              key={s.id}
              data-zone-id={s.id}
              className={`ed-hz-zone${s.correct ? ' is-correct' : ''}${s.id === selId ? ' is-sel' : ''}`}
              style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.w}%`, height: `${s.h}%` }}
              tabIndex={0}
              role="button"
              aria-label={`Zona ${i + 1}${s.label ? `: ${s.label}` : ''}${s.correct ? ' (correcta)' : ''}`}
              onFocus={() => setSelId(s.id)}
              onKeyDown={(e) => onZoneKeyDown(e, s)}
            >
              <span className="ed-hz-num">{i + 1}</span>
              {s.id === selId && <span className="ed-hz-handle" data-handle="se" title="Redimensionar" />}
            </div>
          ))}
        </div>

        <div className="ed-hz-panel">
          {spots.length > 0 && (
            <div className="ed-hz-list" role="listbox" aria-label="Zonas definidas">
              {spots.map((s, i) => (
                <button
                  key={s.id}
                  className={`ed-hz-item${s.id === selId ? ' is-sel' : ''}`}
                  onClick={() => setSelId(s.id)}
                  title="Seleccionar la zona"
                >
                  <span className="ed-hz-num">{i + 1}</span>
                  <span className="ed-hz-item-label">{s.label || '(sin etiqueta)'}</span>
                  {s.correct && <span className="ed-hz-ok" title="Zona correcta"><Icon name="check" size={13} /></span>}
                </button>
              ))}
            </div>
          )}
          {sel ? (
            <div className="ed-stack">
              <label className="ed-field"><span>Etiqueta accesible de la zona</span>
                <input value={sel.label} placeholder="P. ej. «Extintor de la pared»"
                  onChange={(e) => updateSpot(sel.id, { label: e.target.value })} /></label>
              <label className="ed-check">
                <input type="checkbox" checked={!!sel.correct}
                  onChange={(e) => updateSpot(sel.id, { correct: e.target.checked })} />
                <span>Es la zona correcta</span>
              </label>
              <label className="ed-field"><span>Feedback al pulsar esta zona (opcional)</span>
                <input value={sel.feedback || ''} onChange={(e) => updateSpot(sel.id, { feedback: e.target.value })} /></label>
              <p className="ed-hint">x {sel.x} % · y {sel.y} % · ancho {sel.w} % · alto {sel.h} %</p>
              <button className="ed-hz-del" onClick={() => removeSpot(sel.id)}><Icon name="trash" size={14} /> Quitar esta zona</button>
            </div>
          ) : (
            <p className="ed-hint">
              {spots.length === 0
                ? 'Todavía no hay zonas: dibuja la primera arrastrando sobre la imagen.'
                : 'Selecciona una zona (en la imagen o en la lista) para editar su etiqueta y su feedback.'}
            </p>
          )}
        </div>
      </div>
      <footer className="ed-hz-foot">
        <button onClick={onClose}>Cancelar</button>
        <button className="ed-primary" onClick={() => { onSave(spots); onClose() }}>Guardar zonas</button>
      </footer>
    </SettingsWindow>
  )
}
