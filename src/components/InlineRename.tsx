import { useEffect, useRef, useState } from 'react'

/**
 * Etiqueta con renombrado inline: un lápiz ✏ convierte el texto en un input.
 * Enter o perder el foco confirman; Escape restaura el valor original.
 * Los clics paran la propagación para poder vivir dentro de un `<summary>`
 * (árbol de unidades) sin plegar/desplegar el bloque.
 */
export function InlineRename({ value, onChange, title = 'Renombrar', placeholder = '(sin título)' }: {
  value: string
  onChange: (next: string) => void
  title?: string
  placeholder?: string
}) {
  const [editing, setEditing] = useState(false)
  const origRef = useRef(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  if (!editing) {
    return (
      <>
        <span className="ed-rename-text">{value || placeholder}</span>
        <button type="button" className="ed-rename" title={title} aria-label={title}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); origRef.current = value; setEditing(true) }}>
          ✏
        </button>
      </>
    )
  }
  return (
    <input
      ref={inputRef}
      className="ed-rename-input"
      value={value}
      aria-label={title}
      onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => setEditing(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.preventDefault(); setEditing(false) }
        if (e.key === 'Escape') { e.preventDefault(); onChange(origRef.current); setEditing(false) }
      }}
    />
  )
}
