import { useRef } from 'react'

/**
 * Área de texto con barra de formato ligera. Inserta el mismo markdown que
 * renderiza la carcasa SCORM: **negrita**, *cursiva*, [texto](url), listas.
 * No usa WYSIWYG ni dependencias: el valor sigue siendo texto plano (markdown).
 */
export function RichTextArea({
  value,
  onChange,
  rows = 6,
}: {
  value: string
  onChange: (v: string) => void
  rows?: number
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  function surround(before: string, after: string, placeholder: string) {
    const ta = ref.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const sel = value.slice(start, end) || placeholder
    const next = value.slice(0, start) + before + sel + after + value.slice(end)
    onChange(next)
    requestAnimationFrame(() => {
      ta.focus()
      ta.selectionStart = start + before.length
      ta.selectionEnd = start + before.length + sel.length
    })
  }

  function insertLink() {
    const ta = ref.current
    if (!ta) return
    const url = window.prompt('URL del enlace (https://… o mailto:…)', 'https://')
    if (!url) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const sel = value.slice(start, end) || 'texto del enlace'
    const next = value.slice(0, start) + '[' + sel + '](' + url + ')' + value.slice(end)
    onChange(next)
    requestAnimationFrame(() => ta.focus())
  }

  function bulletList() {
    const ta = ref.current
    if (!ta) return
    const start = ta.selectionStart
    const prefix = value.slice(0, start).endsWith('\n') || start === 0 ? '' : '\n'
    const next = value.slice(0, start) + prefix + '- ' + value.slice(start)
    onChange(next)
    requestAnimationFrame(() => ta.focus())
  }

  return (
    <div className="ed-rta">
      <div className="ed-rta-bar" role="toolbar" aria-label="Formato de texto">
        <button type="button" onClick={() => surround('**', '**', 'negrita')} title="Negrita"><strong>B</strong></button>
        <button type="button" onClick={() => surround('*', '*', 'cursiva')} title="Cursiva"><em>I</em></button>
        <button type="button" onClick={insertLink} title="Insertar enlace">🔗 Enlace</button>
        <button type="button" onClick={bulletList} title="Lista con viñetas">• Lista</button>
      </div>
      <textarea ref={ref} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
