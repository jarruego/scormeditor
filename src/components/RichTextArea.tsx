import { useEffect, useRef, useState } from 'react'
import { loadPresets, savePresets, PALETTE, type CustomBlockPreset } from '../store/customBlocks'

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

/**
 * Área de texto con barra de formato ligera. Inserta el mismo markdown que
 * renderiza la carcasa SCORM: encabezados (##, ###), **negrita**, *cursiva*,
 * [texto](url), listas con viñetas y numeradas, y bloques destacados
 * (::: tip|warn|important|fact|reflect|case ... :::) más bloques personalizados
 * (::: custom | #color | icono | título ... :::). No usa WYSIWYG ni dependencias:
 * el valor sigue siendo texto plano (markdown). Se ve en «Vista estudiante».
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
  const iconRef = useRef<HTMLDivElement>(null)
  const [showCustom, setShowCustom] = useState(false)
  const [showIcons, setShowIcons] = useState(false)
  const [presets, setPresets] = useState<CustomBlockPreset[]>(() => loadPresets())
  // El bloque personalizado arranca vacío: sin icono ni título por defecto.
  const [draft, setDraft] = useState({ title: '', icon: '', color: PALETTE[0].value })

  // Cierra la rejilla de iconos al hacer clic fuera de ella.
  useEffect(() => {
    if (!showIcons) return
    function onDown(e: MouseEvent) {
      if (iconRef.current && !iconRef.current.contains(e.target as Node)) setShowIcons(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [showIcons])

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

  // Inserta un prefijo al principio de la línea actual (encabezados, listas).
  function linePrefix(prefix: string) {
    const ta = ref.current
    if (!ta) return
    const start = ta.selectionStart
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const next = value.slice(0, lineStart) + prefix + value.slice(lineStart)
    onChange(next)
    requestAnimationFrame(() => {
      ta.focus()
      ta.selectionStart = ta.selectionEnd = start + prefix.length
    })
  }

  // Inserta un bloque destacado envolviendo la selección. `head` es la cabecera
  // tras "::: " (un tipo predefinido o "custom | #color | icono | título").
  function insertBlock(head: string) {
    const ta = ref.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const sel = value.slice(start, end) || 'Texto destacado'
    const pre = start === 0 || value.slice(0, start).endsWith('\n') ? '' : '\n'
    const block = pre + '::: ' + head + '\n' + sel + '\n:::\n'
    const next = value.slice(0, start) + block + value.slice(end)
    onChange(next)
    requestAnimationFrame(() => ta.focus())
  }

  function callout(type: 'tip' | 'warn' | 'important' | 'fact' | 'reflect' | 'case') {
    insertBlock(type)
  }

  function insertCustom(p: { title: string; icon: string; color: string }) {
    insertBlock(`custom | ${p.color} | ${p.icon} | ${p.title}`)
  }

  function applyDraft(save: boolean) {
    // Icono y título son opcionales: se insertan tal cual (vacíos si el usuario
    // no eligió nada) y el runtime omite la cabecera cuando ambos faltan.
    const clean = { title: draft.title.trim(), icon: draft.icon.trim(), color: draft.color }
    if (save && (clean.title || clean.icon)) {
      const next = [{ id: `c-${Date.now().toString(36)}`, ...clean }, ...presets].slice(0, 20)
      setPresets(next)
      savePresets(next)
    }
    insertCustom(clean)
    closeCustom()
  }

  // Cierra el panel del bloque personalizado y deja el borrador limpio para la
  // próxima vez (vuelve a arrancar sin icono ni título).
  function closeCustom() {
    setShowIcons(false)
    setShowCustom(false)
    setDraft({ title: '', icon: '', color: PALETTE[0].value })
  }

  function deletePreset(id: string) {
    const next = presets.filter((p) => p.id !== id)
    setPresets(next)
    savePresets(next)
  }

  return (
    <div className="ed-rta">
      <div className="ed-rta-bar" role="toolbar" aria-label="Formato de texto">
        <button type="button" onClick={() => surround('**', '**', 'negrita')} title="Negrita"><strong>B</strong></button>
        <button type="button" onClick={() => surround('*', '*', 'cursiva')} title="Cursiva"><em>I</em></button>
        <span className="ed-rta-sep" aria-hidden="true" />
        <button type="button" onClick={() => linePrefix('## ')} title="Encabezado">H2</button>
        <button type="button" onClick={() => linePrefix('### ')} title="Subencabezado">H3</button>
        <span className="ed-rta-sep" aria-hidden="true" />
        <button type="button" onClick={() => linePrefix('- ')} title="Lista con viñetas">• Lista</button>
        <button type="button" onClick={() => linePrefix('1. ')} title="Lista numerada">1. Lista</button>
        <button type="button" onClick={insertLink} title="Insertar enlace">🔗 Enlace</button>
        <span className="ed-rta-sep" aria-hidden="true" />
        <button type="button" onClick={() => callout('tip')} title="Bloque: consejo">💡 Consejo</button>
        <button type="button" onClick={() => callout('warn')} title="Bloque: atención">⚠️ Atención</button>
        <button type="button" onClick={() => callout('important')} title="Bloque: importante">📌 Importante</button>
        <button type="button" onClick={() => callout('fact')} title="Bloque: ¿sabías que…?">🧠 ¿Sabías que…?</button>
        <button type="button" onClick={() => callout('reflect')} title="Bloque: reflexiona">💭 Reflexiona</button>
        <button type="button" onClick={() => callout('case')} title="Bloque: caso práctico">🧪 Caso práctico</button>
        <span className="ed-rta-sep" aria-hidden="true" />
        <button type="button" onClick={() => (showCustom ? closeCustom() : setShowCustom(true))} title="Bloque personalizado (icono, color y título a elegir)">✚ Personalizado</button>
        {presets.map((p) => (
          <span key={p.id} className="ed-rta-preset">
            <button type="button" onClick={() => insertCustom(p)} title={`Insertar «${p.title}»`}
              style={{ borderLeft: `4px solid ${p.color}` }}>
              {p.icon} {p.title}
            </button>
            <button type="button" className="ed-rta-preset-x" onClick={() => deletePreset(p.id)} aria-label={`Eliminar preset ${p.title}`}>✕</button>
          </span>
        ))}
      </div>

      {showCustom && (
        <div className="ed-rta-custom">
          <div className="ed-rta-custom-row">
            <div className="ed-rta-custom-icon">
              <span className="ed-rta-custom-lbl">Icono</span>
              <div className="ed-rta-iconpick" ref={iconRef}>
                <button type="button" className={`ed-rta-icon-btn ${draft.icon ? 'has-icon' : ''}`}
                  aria-label="Elegir icono" aria-expanded={showIcons}
                  title="Elegir un icono" onClick={() => setShowIcons((s) => !s)}>
                  {draft.icon || '＋'}
                </button>
                {showIcons && (
                  <div className="ed-rta-icon-pop" role="menu" aria-label="Iconos">
                    <button type="button" className="ed-rta-icon-cell ed-rta-icon-none"
                      title="Sin icono" onClick={() => { setDraft({ ...draft, icon: '' }); setShowIcons(false) }}>∅</button>
                    {ICONS.map((ic) => (
                      <button key={ic} type="button" className="ed-rta-icon-cell"
                        title={`Usar ${ic}`} onClick={() => { setDraft({ ...draft, icon: ic }); setShowIcons(false) }}>{ic}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <label>
              <span>Título</span>
              <input value={draft.title} placeholder="p. ej. Buenas prácticas"
                onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </label>
          </div>
          <div className="ed-rta-custom-row">
            <div className="ed-rta-swatches">
              {PALETTE.map((c) => (
                <button key={c.value} type="button" title={c.label}
                  className={`ed-rta-swatch ${draft.color.toLowerCase() === c.value.toLowerCase() ? 'is-on' : ''}`}
                  style={{ background: c.value }} onClick={() => setDraft({ ...draft, color: c.value })} />
              ))}
              <input type="color" value={draft.color} aria-label="Color personalizado"
                onChange={(e) => setDraft({ ...draft, color: e.target.value })} />
            </div>
            <div className="ed-rta-custom-actions">
              <button type="button" onClick={closeCustom}>Cancelar</button>
              <button type="button" onClick={() => applyDraft(false)}>Insertar</button>
              <button type="button" className="ed-primary" disabled={!draft.title.trim() && !draft.icon.trim()}
                title="Guarda el bloque como preset reutilizable" onClick={() => applyDraft(true)}>Guardar y usar</button>
            </div>
          </div>
        </div>
      )}

      <textarea ref={ref} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
