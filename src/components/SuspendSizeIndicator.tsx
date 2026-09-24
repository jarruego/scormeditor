import { useEffect, useRef, useState } from 'react'
import { useCourseStore } from '../store/courseStore'
import { getStateCodec } from '../scorm/stateCodec'
import type { SuspendSizeEstimate } from '../scorm/stateCodec'
import { Icon } from './Icon'

function useDismiss(open: boolean, ref: React.RefObject<HTMLDivElement>, close: () => void) {
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
}

const ROWS: { key: keyof SuspendSizeEstimate['breakdown']; label: string }[] = [
  { key: 'visited', label: 'Pantallas vistas' },
  { key: 'results', label: 'Resultados' },
  { key: 'interactions', label: 'Detalle de interacciones' },
  { key: 'finalAnswers', label: 'Respuestas del test final' },
  { key: 'attempts', label: 'Intentos' },
  { key: 'finalScore', label: 'Nota final' },
]

/**
 * Medidor siempre visible del PEOR CASO de `cmi.suspend_data` (SCORM 1.2,
 * límite 4096 caracteres — ver docs/suspend-data.md): si el alumno viera y
 * respondiera absolutamente todo el curso. Recalcula con debounce al cambiar
 * el curso, pasando por el mismo `StateCodec.estimateSuspendSize()` que usan
 * los validadores SUSPEND_NEAR_LIMIT / SUSPEND_OVER_LIMIT (validators.ts):
 * lo que se ve aquí y lo que reporta Validación son siempre el mismo número.
 */
export function SuspendSizeIndicator() {
  const course = useCourseStore((s) => s.course)
  const goToScreen = useCourseStore((s) => s.goToScreen)
  const [estimate, setEstimate] = useState<SuspendSizeEstimate | null>(null)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useDismiss(open, ref, () => setOpen(false))

  useEffect(() => {
    const t = setTimeout(() => {
      try { setEstimate(getStateCodec().estimateSuspendSize(course)) } catch { setEstimate(null) }
    }, 400)
    return () => clearTimeout(t)
  }, [course])

  if (!estimate) return null
  const pct = Math.round((estimate.worstCase / estimate.limit) * 100)
  const level = pct > 100 ? 'over' : pct >= 75 ? 'near' : 'ok'

  return (
    <div className="ed-suspend-meter" ref={ref}>
      <button
        type="button"
        className={`ed-suspend-chip is-${level}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        title="Peor caso estimado del progreso guardado del alumno (cmi.suspend_data, límite 4096 caracteres de SCORM 1.2). Pulsa para ver el desglose."
      >
        <Icon name="chart" size={13} />
        Memoria: {estimate.worstCase.toLocaleString('es-ES')} / {estimate.limit.toLocaleString('es-ES')} ({pct}%)
      </button>
      {open && (
        <div className="ed-suspend-popover" role="dialog" aria-label="Desglose de la memoria de progreso SCORM">
          <p className="ed-hint-lead">
            Peor caso: si el alumno viera y respondiera absolutamente todo el curso. El progreso real
            de un alumno concreto pesa menos que esto.
          </p>
          <ul className="ed-suspend-breakdown">
            {ROWS.map((r) => (
              <li key={r.key}><span>{r.label}</span><span>{estimate.breakdown[r.key]}</span></li>
            ))}
          </ul>
          {estimate.perInteraction.length > 0 && (
            <>
              <p className="ed-hint" style={{ margin: '.6rem 0 .3rem', fontWeight: 600 }}>Lo que más consume</p>
              <ul className="ed-suspend-top">
                {estimate.perInteraction.slice(0, 5).map((p) => (
                  <li key={p.id}>
                    <button type="button" className="ed-suspend-top-link" onClick={() => { goToScreen(p.screenId); setOpen(false) }}>
                      <strong>{p.screenTitle || p.screenId}</strong>
                      <span className="ed-hint">{p.motivo}</span>
                    </button>
                    <span className="ed-suspend-top-chars">{p.chars}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {estimate.missingEstimator.length > 0 && (
            <p className="ed-hint-warn">
              <Icon name="alert-triangle" size={13} />{' '}
              {estimate.missingEstimator.length} interacción(es) de un tipo sin estimador de tamaño preciso todavía: se usó una cota conservadora.
            </p>
          )}
          {level !== 'ok' && (
            <p className={level === 'over' ? 'ed-hint-warn' : 'ed-hint'}>
              {level === 'over'
                ? 'Por encima del límite: si se llega a este peor caso, el runtime degradará detalle automáticamente al guardar (ver «Historial de estructuras» y «Protección de tamaño» en docs/suspend-data.md), pero conviene reducir el contenido con más detalle guardado (crucigramas grandes, rosco con muchas definiciones, HTML a medida con mucho estado interno).'
                : 'Cerca del límite: si el curso sigue creciendo, revisa las interacciones con más detalle guardado antes de que el runtime tenga que degradar nada.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
