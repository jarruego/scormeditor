import { useEffect, useState } from 'react'
import { CourseSettingsSection } from './CourseSettingsEditor'
import { NarrationSection } from './TtsPanel'

/**
 * Ventana (modal) genérica de ajustes: marco + cabecera + cierre (Escape / clic
 * fuera / ✕). Si `busy` es true (p. ej. narración generando) no se puede cerrar.
 */
function SettingsWindow({
  title,
  onClose,
  busy = false,
  children,
}: {
  title: string
  onClose: () => void
  busy?: boolean
  children: React.ReactNode
}) {
  const close = () => { if (!busy) onClose() }

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy])

  return (
    <div className="ed-modal-backdrop" onMouseDown={close}>
      <div className="ed-modal ed-modal-lg" role="dialog" aria-modal="true" aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}>
        <header className="ed-modal-head">
          <strong>{title}</strong>
          <button className="ed-modal-x" onClick={close} disabled={busy} aria-label="Cerrar">✕</button>
        </header>
        <div className="ed-modal-body">{children}</div>
      </div>
    </div>
  )
}

/** Ventana «Ajustes del curso (SCORM y finalización)». */
export function CourseSettingsModal({ onClose }: { onClose: () => void }) {
  return (
    <SettingsWindow title="Ajustes del curso (SCORM y finalización)" onClose={onClose}>
      <CourseSettingsSection />
    </SettingsWindow>
  )
}

/** Ventana «Narración por voz (TTS)»; bloquea el cierre mientras genera. */
export function NarrationModal({ onClose }: { onClose: () => void }) {
  const [busy, setBusy] = useState(false)
  return (
    <SettingsWindow title="🔊 Narración por voz (TTS)" onClose={onClose} busy={busy}>
      <NarrationSection onBusyChange={setBusy} />
    </SettingsWindow>
  )
}
