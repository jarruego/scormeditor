import { useEffect, useRef, useState } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, placeholder as cmPlaceholder } from '@codemirror/view'
import { markdown } from '@codemirror/lang-markdown'
import { syntaxTree } from '@codemirror/language'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { mdHighlighting, calloutDecorations, livePreview, editorTheme } from './cmMarkdown'
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

// Tipos de callout predefinidos, para el selector «cambiar tipo» de un bloque.
const CALLOUT_TYPES: { value: string; label: string }[] = [
  { value: 'tip', label: '💡 Consejo' },
  { value: 'warn', label: '⚠️ Atención' },
  { value: 'important', label: '📌 Importante' },
  { value: 'fact', label: '🧠 ¿Sabías que…?' },
  { value: 'reflect', label: '💭 Reflexiona' },
  { value: 'case', label: '🧪 Caso práctico' },
]

// Estado contextual: qué hay bajo el cursor (para editar seleccionando).
type LinkCtx = { from: number; to: number; text: string; url: string }
type BlockCtx = {
  from: number // inicio de la cabecera "::: …"
  to: number // fin de la línea de cierre ":::"
  headerFrom: number
  headerTo: number
  type: string
  color: string
  icon: string
  title: string
}
type Ctx = { link: LinkCtx | null; block: BlockCtx | null }

// Analiza el documento alrededor del cursor: enlace [texto](url) en la línea
// actual y el bloque "::: …" que lo contiene (cabecera arriba, cierre abajo).
function analyze(state: EditorState): Ctx {
  const head = state.selection.main.head
  const line = state.doc.lineAt(head)
  let link: LinkCtx | null = null
  const re = /\[([^\]]*)\]\(([^)]*)\)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(line.text))) {
    const from = line.from + m.index
    const to = from + m[0].length
    if (head >= from && head <= to) {
      link = { from, to, text: m[1], url: m[2] }
      break
    }
  }

  // Cabecera del bloque que contiene el cursor (buscando hacia arriba).
  let block: BlockCtx | null = null
  let openLine = -1
  let type = ''
  let rest = ''
  for (let i = line.number; i >= 1; i--) {
    const l = state.doc.line(i)
    if (i < line.number && /^\s*:::\s*$/.test(l.text)) break // salimos de un bloque
    const cm = /^\s*:::\s*([A-Za-z]+)\s*(.*)$/.exec(l.text)
    if (cm && !/^\s*:::\s*$/.test(l.text)) {
      openLine = i
      type = cm[1].toLowerCase()
      rest = cm[2]
      break
    }
  }
  if (openLine >= 0) {
    const openL = state.doc.line(openLine)
    let closeTo = state.doc.length
    for (let i = openLine + 1; i <= state.doc.lines; i++) {
      const l = state.doc.line(i)
      if (/^\s*:::\s*$/.test(l.text)) {
        closeTo = l.to
        break
      }
    }
    let color = ''
    let icon = ''
    let title = ''
    if (type === 'custom') {
      const parts = rest.split('|').map((x) => x.trim())
      color = parts[1] || ''
      icon = parts[2] || ''
      title = parts[3] || ''
    }
    block = { from: openL.from, to: closeTo, headerFrom: openL.from, headerTo: openL.to, type, color, icon, title }
  }
  return { link, block }
}

/**
 * Área de texto con formato ligero, sobre CodeMirror 6 en modo «vista viva».
 * La caja MUESTRA el resultado (negrita en negrita, encabezados grandes, bloques
 * "::: …" como cajas con su cabecera) ocultando los marcadores de sintaxis salvo
 * en la línea que estás editando. El valor sigue siendo el mismo MARKDOWN EN
 * TEXTO PLANO que renderiza la carcasa SCORM (idéntico en «Vista estudiante»):
 * encabezados (##, ###), **negrita**, *cursiva*, [texto](url), listas y
 * destacados (::: tip|warn|important|fact|reflect|case … :::) más bloques
 * personalizados (::: custom | #color | icono | título … :::). No es WYSIWYG que
 * guarde HTML: CodeMirror opera sobre texto plano.
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
  const hostRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const [showCustom, setShowCustom] = useState(false)
  const [showIcons, setShowIcons] = useState(false)
  const [presets, setPresets] = useState<CustomBlockPreset[]>(() => loadPresets())
  // El bloque personalizado arranca vacío: sin icono ni título por defecto.
  const [draft, setDraft] = useState({ title: '', icon: '', color: PALETTE[0].value })
  // Si estamos EDITANDO un bloque existente, guardamos el tramo de su cabecera.
  const [editing, setEditing] = useState<{ headerFrom: number; headerTo: number } | null>(null)
  // Lo que hay bajo el cursor (enlace/bloque) y el popover de edición de enlace.
  const [ctx, setCtx] = useState<Ctx>({ link: null, block: null })
  const [linkEdit, setLinkEdit] = useState<LinkCtx | null>(null)

  // Crea el editor CodeMirror una sola vez.
  useEffect(() => {
    const parent = hostRef.current
    if (!parent) return
    const view = new EditorView({
      parent,
      state: EditorState.create({
        doc: value,
        extensions: [
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          markdown(),
          mdHighlighting,
          calloutDecorations,
          livePreview,
          EditorView.lineWrapping,
          cmPlaceholder('Escribe el texto…'),
          editorTheme(rows * 1.5),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) onChangeRef.current(u.state.doc.toString())
            if (u.docChanged || u.selectionSet) setCtx(analyze(u.state))
          }),
        ],
      }),
    })
    viewRef.current = view
    return () => {
      view.destroy()
      viewRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sincroniza cambios EXTERNOS del valor (deshacer global, cargar proyecto…).
  // No entra en bucle: al teclear, el padre nos devuelve el mismo string.
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const cur = view.state.doc.toString()
    if (value !== cur) view.dispatch({ changes: { from: 0, to: cur.length, insert: value } })
  }, [value])

  // Cierra la rejilla de iconos al hacer clic fuera de ella.
  useEffect(() => {
    if (!showIcons) return
    function onDown(e: MouseEvent) {
      if (iconRef.current && !iconRef.current.contains(e.target as Node)) setShowIcons(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [showIcons])

  // --- Acciones de la barra (operan sobre la selección de CodeMirror) -------
  function surround(before: string, after: string, placeholder: string) {
    const v = viewRef.current
    if (!v) return
    const { from, to } = v.state.selection.main
    const sel = v.state.sliceDoc(from, to) || placeholder
    v.dispatch({
      changes: { from, to, insert: before + sel + after },
      selection: { anchor: from + before.length, head: from + before.length + sel.length },
    })
    v.focus()
  }

  // Conmuta negrita/cursiva: si la selección ya está dentro de **…**/*…*, quita
  // los marcadores; si no, envuelve. Usa el árbol de sintaxis de markdown.
  function toggleMark(kind: 'strong' | 'em') {
    const v = viewRef.current
    if (!v) return
    const { from, to } = v.state.selection.main
    // Solo actúa con texto SELECCIONADO: un cursor sin selección (clic simple) no
    // pone NI quita el estilo. Así solo se formatea lo que eliges a propósito.
    if (from === to) {
      v.focus()
      return
    }
    const nodeName = kind === 'strong' ? 'StrongEmphasis' : 'Emphasis'
    const len = kind === 'strong' ? 2 : 1
    let hit: { from: number; to: number } | null = null
    for (let n = syntaxTree(v.state).resolveInner(to, -1) as { name: string; from: number; to: number; parent: unknown } | null; n; n = n.parent as typeof n) {
      if (n.name === nodeName) {
        hit = { from: n.from, to: n.to }
        break
      }
    }
    if (hit) {
      // La selección está dentro de un texto ya formateado: quita los marcadores.
      v.dispatch({ changes: [{ from: hit.from, to: hit.from + len }, { from: hit.to - len, to: hit.to }] })
    } else {
      // Envuelve la selección (no inserta texto de ejemplo).
      surround(kind === 'strong' ? '**' : '*', kind === 'strong' ? '**' : '*', '')
    }
    v.focus()
  }

  function linePrefix(prefix: string) {
    const v = viewRef.current
    if (!v) return
    const head = v.state.selection.main.head
    const line = v.state.doc.lineAt(head)
    v.dispatch({ changes: { from: line.from, insert: prefix }, selection: { anchor: head + prefix.length } })
    v.focus()
  }

  function insertBlock(head: string) {
    const v = viewRef.current
    if (!v) return
    const { from, to } = v.state.selection.main
    const sel = v.state.sliceDoc(from, to) || 'Texto destacado'
    const atLineStart = from === 0 || v.state.sliceDoc(from - 1, from) === '\n'
    const block = (atLineStart ? '' : '\n') + '::: ' + head + '\n' + sel + '\n:::\n'
    v.dispatch({ changes: { from, to, insert: block } })
    v.focus()
  }

  function callout(type: 'tip' | 'warn' | 'important' | 'fact' | 'reflect' | 'case') {
    insertBlock(type)
  }

  function insertCustom(p: { title: string; icon: string; color: string }) {
    insertBlock(`custom | ${p.color} | ${p.icon} | ${p.title}`)
  }

  // --- Enlaces: insertar / editar el que hay bajo el cursor -----------------
  function openLinkEditor() {
    const v = viewRef.current
    if (!v) return
    if (ctx.link) {
      setLinkEdit(ctx.link)
      return
    }
    const { from, to } = v.state.selection.main
    setLinkEdit({ from, to, text: v.state.sliceDoc(from, to), url: 'https://' })
  }

  function saveLink() {
    const v = viewRef.current
    if (!v || !linkEdit) return
    const text = linkEdit.text.trim() || 'texto del enlace'
    const url = linkEdit.url.trim()
    const md = url ? `[${text}](${url})` : text
    v.dispatch({ changes: { from: linkEdit.from, to: linkEdit.to, insert: md } })
    setLinkEdit(null)
    v.focus()
  }

  function removeLink() {
    const v = viewRef.current
    if (!v || !linkEdit) return
    v.dispatch({ changes: { from: linkEdit.from, to: linkEdit.to, insert: linkEdit.text } })
    setLinkEdit(null)
    v.focus()
  }

  // --- Bloques: cambiar tipo / eliminar / editar personalizado --------------
  function changeType(value: string) {
    const b = ctx.block
    const v = viewRef.current
    if (!b || !v) return
    if (value === 'custom') {
      openCustomEdit()
      return
    }
    // Aplicar un preset personalizado guardado: reescribe la cabecera con su
    // color/icono/título. Los valores "preset:<id>" vienen del <select>.
    let header = '::: ' + value
    if (value.startsWith('preset:')) {
      const p = presets.find((x) => x.id === value.slice('preset:'.length))
      if (!p) return
      header = `::: custom | ${p.color} | ${p.icon} | ${p.title}`
    }
    v.dispatch({ changes: { from: b.headerFrom, to: b.headerTo, insert: header } })
    v.focus()
  }

  function deleteBlock() {
    const b = ctx.block
    const v = viewRef.current
    if (!b || !v) return
    let to = b.to
    if (to < v.state.doc.length && v.state.sliceDoc(to, to + 1) === '\n') to += 1
    v.dispatch({ changes: { from: b.from, to } })
    v.focus()
  }

  function openCustomNew() {
    setEditing(null)
    setShowIcons(false)
    setDraft({ title: '', icon: '', color: PALETTE[0].value })
    setShowCustom(true)
  }

  function openCustomEdit() {
    const b = ctx.block
    if (!b) return
    setEditing({ headerFrom: b.headerFrom, headerTo: b.headerTo })
    setShowIcons(false)
    setDraft({ title: b.title, icon: b.icon, color: /^#[0-9a-fA-F]{3,8}$/.test(b.color) ? b.color : PALETTE[0].value })
    setShowCustom(true)
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
    const v = viewRef.current
    if (v && editing) {
      // Reescribe SOLO la cabecera del bloque existente (respeta su contenido).
      v.dispatch({
        changes: { from: editing.headerFrom, to: editing.headerTo, insert: `::: custom | ${clean.color} | ${clean.icon} | ${clean.title}` },
      })
      v.focus()
    } else {
      insertCustom(clean)
    }
    closeCustom()
  }

  // Cierra el panel del bloque personalizado y deja el borrador limpio.
  function closeCustom() {
    setShowIcons(false)
    setShowCustom(false)
    setEditing(null)
    setDraft({ title: '', icon: '', color: PALETTE[0].value })
  }

  function deletePreset(id: string) {
    const next = presets.filter((p) => p.id !== id)
    setPresets(next)
    savePresets(next)
  }

  // Valor seleccionado en el <select> del bloque: el tipo estándar, o "preset:<id>"
  // si el bloque personalizado coincide con un preset guardado, o "custom" si no.
  function currentBlockValue(): string {
    const b = ctx.block
    if (!b) return ''
    if (CALLOUT_TYPES.some((t) => t.value === b.type)) return b.type
    const match = presets.find(
      (p) => p.color.toLowerCase() === (b.color || '').toLowerCase() && p.icon === b.icon && p.title === b.title,
    )
    return match ? `preset:${match.id}` : 'custom'
  }
  const blockTypeValue = currentBlockValue()

  return (
    <div className="ed-rta">
      <div className="ed-rta-bar" role="toolbar" aria-label="Formato de texto"
        onMouseDown={(e) => e.preventDefault()}>
        <button type="button" onClick={() => toggleMark('strong')} title="Negrita (poner/quitar)"><strong>B</strong></button>
        <button type="button" onClick={() => toggleMark('em')} title="Cursiva (poner/quitar)"><em>I</em></button>
        <span className="ed-rta-sep" aria-hidden="true" />
        <button type="button" onClick={() => linePrefix('## ')} title="Encabezado">H2</button>
        <button type="button" onClick={() => linePrefix('### ')} title="Subencabezado">H3</button>
        <span className="ed-rta-sep" aria-hidden="true" />
        <button type="button" onClick={() => linePrefix('- ')} title="Lista con viñetas">• Lista</button>
        <button type="button" onClick={() => linePrefix('1. ')} title="Lista numerada">1. Lista</button>
        <button type="button" onClick={openLinkEditor}
          title={ctx.link ? 'Editar el enlace donde está el cursor' : 'Insertar enlace'}>
          🔗 {ctx.link ? 'Editar enlace' : 'Enlace'}
        </button>
        <span className="ed-rta-sep" aria-hidden="true" />
        <button type="button" onClick={() => callout('tip')} title="Bloque: consejo">💡 Consejo</button>
        <button type="button" onClick={() => callout('warn')} title="Bloque: atención">⚠️ Atención</button>
        <button type="button" onClick={() => callout('important')} title="Bloque: importante">📌 Importante</button>
        <button type="button" onClick={() => callout('fact')} title="Bloque: ¿sabías que…?">🧠 ¿Sabías que…?</button>
        <button type="button" onClick={() => callout('reflect')} title="Bloque: reflexiona">💭 Reflexiona</button>
        <button type="button" onClick={() => callout('case')} title="Bloque: caso práctico">🧪 Caso práctico</button>
        <span className="ed-rta-sep" aria-hidden="true" />
        <button type="button" onClick={() => (showCustom && !editing ? closeCustom() : openCustomNew())}
          title="Bloque personalizado (icono, color y título a elegir)">✚ Personalizado</button>
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
              {editing ? (
                <button type="button" className="ed-primary" onClick={() => applyDraft(false)}>Guardar cambios</button>
              ) : (
                <>
                  <button type="button" onClick={() => applyDraft(false)}>Insertar</button>
                  <button type="button" className="ed-primary" disabled={!draft.title.trim() && !draft.icon.trim()}
                    title="Guarda el bloque como preset reutilizable" onClick={() => applyDraft(true)}>Guardar y usar</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* preventDefault en el click evita que, si este editor quedara dentro de un
          <label>, sus clics se reenvíen al primer control (un botón de la barra) y
          disparen su acción. CodeMirror coloca el cursor en mousedown, no en click. */}
      <div ref={hostRef} className="ed-rta-cm" onClick={(e) => e.preventDefault()} />

      {/* Barras contextuales DEBAJO del editor: al aparecer/desaparecer no desplazan
          la caja (evita clics fallidos entre los dos toques de un doble clic). */}
      {ctx.block && (
        <div className="ed-rta-blockbar">
          <span className="ed-rta-blocklbl">Bloque donde está el cursor:</span>
          <select value={blockTypeValue} onChange={(e) => changeType(e.target.value)} title="Cambiar el tipo del bloque">
            <optgroup label="Estándar">
              {CALLOUT_TYPES.map((tp) => (
                <option key={tp.value} value={tp.value}>{tp.label}</option>
              ))}
            </optgroup>
            {presets.length > 0 && (
              <optgroup label="Personalizados guardados">
                {presets.map((p) => (
                  <option key={p.id} value={`preset:${p.id}`}>{`${p.icon} ${p.title}`.trim() || 'Personalizado'}</option>
                ))}
              </optgroup>
            )}
            <option value="custom">✚ Personalizado a medida…</option>
          </select>
          {ctx.block.type === 'custom' && (
            <button type="button" onClick={openCustomEdit} title="Editar color, icono y título">✎ Editar</button>
          )}
          <button type="button" className="ed-danger" onClick={deleteBlock} title="Eliminar todo el bloque">🗑 Eliminar bloque</button>
        </div>
      )}

      {linkEdit && (
        <div className="ed-rta-linkedit">
          <label>
            <span>Texto</span>
            <input value={linkEdit.text} placeholder="texto visible"
              onChange={(e) => setLinkEdit({ ...linkEdit, text: e.target.value })} />
          </label>
          <label>
            <span>URL</span>
            <input value={linkEdit.url} placeholder="https://… o mailto:…"
              onChange={(e) => setLinkEdit({ ...linkEdit, url: e.target.value })} />
          </label>
          <div className="ed-rta-custom-actions">
            <button type="button" onClick={() => setLinkEdit(null)}>Cancelar</button>
            {ctx.link && <button type="button" onClick={removeLink} title="Quitar el enlace y dejar solo el texto">Quitar</button>}
            <button type="button" className="ed-primary" onClick={saveLink}>{ctx.link ? 'Guardar' : 'Insertar'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
