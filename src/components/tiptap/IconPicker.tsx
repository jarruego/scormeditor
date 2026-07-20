import { useEffect, useRef } from 'react'
import { Icon } from '../Icon'

// Iconos frecuentes en formación online para el bloque personalizado. Es una
// lista curada (no un teclado emoji completo) para elegir con un clic sin pegar.
const ICONS = [
  // Avisos y destacados
  '💡', 'ℹ️', '⚠️', '📌', '🧠', '💭', '🧪', '✅', '❗', '❓',
  '⭐', '🌟', '🔥', '❤️', '🚩', '📢', '📣', '🔔', '‼️', '✔️',
  // Objetivos, logros y evaluación
  '🎯', '🏆', '🥇', '🎓', '📈', '📊', '📉', '🧮', '💯', '🏅',
  '⏱️', '⏳', '📅', '🗓️', '🕐', '🔢', '➕', '➗', '📐', '📏',
  // Documentos, lectura y notas
  '📖', '📚', '📝', '📄', '📃', '📋', '🗒️', '📎', '🖇️', '📌',
  '🔖', '🏷️', '✍️', '🖊️', '🖍️', '✏️', '📁', '📂', '🗂️', '🗃️',
  // Ideas, comunicación y personas
  '🔑', '🔍', '🔎', '💬', '🗨️', '🗯️', '👥', '👤', '🤝', '🙋',
  '👍', '👏', '👀', '🙌', '💪', '🧭', '🗺️', '📍', '🧩', '🎲',
  // Herramientas, tecnología y estado
  '⚙️', '🛠️', '🔧', '🔨', '💻', '🖥️', '⌨️', '🖱️', '🌐', '🔗',
  '🔒', '🔓', '🛡️', '⚡', '🔋', '💾', '📤', '📥', '🚀', '💼',
]

/** Selector de emoji del bloque personalizado (popover con rejilla curada). */
export function IconPicker({
  value,
  onChange,
  open,
  onOpenChange,
}: {
  value: string
  onChange: (icon: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOpenChange(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open, onOpenChange])

  return (
    <div className="ed-rta-custom-icon">
      <span className="ed-rta-custom-lbl">Icono</span>
      <div className="ed-rta-iconpick" ref={ref}>
        <button type="button" className={`ed-rta-icon-btn ${value ? 'has-icon' : ''}`}
          aria-label="Elegir icono" aria-expanded={open}
          title="Elegir un icono" onClick={() => onOpenChange(!open)}>
          {value || <Icon name="plus" size={14} />}
        </button>
        {open && (
          <div className="ed-rta-icon-pop" role="menu" aria-label="Iconos">
            <button type="button" className="ed-rta-icon-cell ed-rta-icon-none"
              title="Sin icono" onClick={() => { onChange(''); onOpenChange(false) }}>∅</button>
            {ICONS.map((ic) => (
              <button key={ic} type="button" className="ed-rta-icon-cell"
                title={`Usar ${ic}`} onClick={() => { onChange(ic); onOpenChange(false) }}>{ic}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
