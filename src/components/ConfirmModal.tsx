import { useEffect, useRef } from 'react'
import { useConfirmStore } from '../store/confirm'
import { Icon } from './Icon'

/**
 * Modal de confirmación (centrado, con Aceptar/Cancelar). Se monta una vez en
 * `App` y muestra lo que pida `confirmDialog(...)`. Enter = aceptar, Esc = cancelar.
 */
export function ConfirmModal() {
  const current = useConfirmStore((s) => s.current)
  const resolve = useConfirmStore((s) => s.resolve)
  const okRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!current) return
    okRef.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); resolve('cancel') }
      else if (e.key === 'Enter') { e.preventDefault(); resolve('confirm') }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, resolve])

  if (!current) return null

  return (
    <div className="ed-confirm-backdrop"
      onMouseDown={(e) => { if (e.target === e.currentTarget) resolve('cancel') }}>
      <div className="ed-confirm" role="alertdialog" aria-modal="true"
        aria-labelledby="ed-confirm-title" aria-describedby="ed-confirm-msg">
        <div className="ed-confirm-head">
          <span className={`ed-confirm-icon ${current.danger ? 'is-danger' : 'is-info'}`} aria-hidden="true">
            <Icon name={current.danger ? 'alert-triangle' : 'info'} size={24} />
          </span>
          <h2 className="ed-confirm-title" id="ed-confirm-title">{current.title || 'Confirmar'}</h2>
        </div>
        <p className="ed-confirm-msg" id="ed-confirm-msg">{current.message}</p>
        <div className="ed-confirm-actions">
          {!current.hideCancel && (
            <button type="button" className="ed-confirm-cancel" onClick={() => resolve('cancel')}>
              {current.cancelLabel || 'Cancelar'}
            </button>
          )}
          {current.thirdLabel && (
            <button type="button" className="ed-danger" onClick={() => resolve('third')}>
              {current.thirdLabel}
            </button>
          )}
          <button type="button" ref={okRef} className={current.danger ? 'ed-danger' : 'ed-primary'}
            onClick={() => resolve('confirm')}>
            {current.confirmLabel || 'Aceptar'}
          </button>
        </div>
      </div>
    </div>
  )
}
