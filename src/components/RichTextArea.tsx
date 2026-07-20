import { useEffect, useRef, useState } from 'react'
import { useEditor, useEditorState, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extensions'
import { Extension, getMarkRange } from '@tiptap/core'
import type { Editor } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'
import { mdToJson, jsonToMd } from '../text/mdDialect'
import { CalloutNode } from './tiptap/CalloutNode'
import { ImageFigureNode } from './tiptap/ImageFigureNode'
import { CustomBlockPanel, type CustomBlockDraft } from './tiptap/CustomBlockPanel'
import { loadPresets, savePresets, PALETTE, type CustomBlockPreset } from '../store/customBlocks'
import { useCourseStore } from '../store/courseStore'
import { optimizeImage } from '../media/optimizeImage'
import { Icon } from './Icon'

// Tipos de callout predefinidos, para los botones rápidos de la barra.
const CALLOUT_TYPES: { value: string; label: string }[] = [
  { value: 'tip', label: '💡 Consejo' },
  { value: 'warn', label: '⚠️ Atención' },
  { value: 'important', label: '📌 Importante' },
  { value: 'fact', label: '🧠 ¿Sabías que…?' },
  { value: 'reflect', label: '💭 Reflexiona' },
  { value: 'case', label: '🧪 Caso práctico' },
]

// Ctrl/Cmd+A por defecto de ProseMirror crea una AllSelection: al colapsarla
// después con teclado (Fin, flechas) el modelo interno no siempre queda
// sincronizado con la posición visible (con clic de ratón sí), y el Intro
// deja de partir el párrafo. Se sustituye por una selección de texto normal
// que cubre todo el documento — mismo resultado visible, navegación con
// teclado fiable después.
const SelectAllFix = Extension.create({
  name: 'selectAllFix',
  addKeyboardShortcuts() {
    return {
      'Mod-a': () => {
        const { state, view } = this.editor
        view.dispatch(state.tr.setSelection(TextSelection.create(state.doc, 0, state.doc.content.size)))
        return true
      },
    }
  },
})

const EXTENSIONS = [
  SelectAllFix,
  StarterKit.configure({
    heading: { levels: [2, 3] },
    link: {
      openOnClick: false,
      autolink: false,
      defaultProtocol: 'https',
      protocols: ['http', 'https', 'mailto'],
    },
    // Fuera del dialecto: la carcasa no los renderiza (mantener el esquema
    // cerrado a lo que realmente se guarda en course.json).
    strike: false,
    code: false,
    codeBlock: false,
    blockquote: false,
    horizontalRule: false,
    underline: false,
  }),
  Placeholder.configure({ placeholder: 'Escribe el texto…' }),
  CalloutNode,
  ImageFigureNode,
]

type LinkEdit = { range: { from: number; to: number } | null; text: string; url: string }

/**
 * Área de texto con formato ligero: editor WYSIWYG (TipTap/ProseMirror) sobre
 * el MISMO markdown ligero en texto plano que renderiza la carcasa SCORM (la
 * invariante no cambia — nunca se guarda HTML). El puente es `mdDialect.ts`
 * (mdToJson/jsonToMd): al montar se parsea el valor a un documento
 * ProseMirror; cada cambio se vuelve a serializar a markdown antes de
 * propagarlo con `onChange`. Soporta: encabezados (##, ###), **negrita**,
 * *cursiva*, [texto](url), listas y bloques destacados (callouts estándar y
 * personalizados) e imágenes en línea propia — cada uno editado con sus
 * propios controles integrados (nodos React), sin barras flotantes frágiles.
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
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  // Último markdown que ESTE editor produjo, para no reaplicar por sync externo
  // el mismo cambio que acabamos de emitir (evita bucles y saltos de cursor).
  const lastEmittedRef = useRef(value)

  const editor = useEditor({
    extensions: EXTENSIONS,
    content: mdToJson(value),
    onUpdate: ({ editor }) => {
      const md = jsonToMd(editor.getJSON())
      lastEmittedRef.current = md
      onChangeRef.current(md)
    },
  })

  // Sincroniza cambios EXTERNOS del valor (deshacer global, cargar proyecto…).
  useEffect(() => {
    if (!editor || value === lastEmittedRef.current) return
    lastEmittedRef.current = value
    editor.commands.setContent(mdToJson(value), { emitUpdate: false })
  }, [editor, value])

  if (!editor) return null
  return <RichTextAreaBody editor={editor} rows={rows} />
}

function RichTextAreaBody({ editor, rows }: { editor: Editor; rows: number }) {
  const [showCustom, setShowCustom] = useState(false)
  const [presets, setPresets] = useState<CustomBlockPreset[]>(() => loadPresets())
  const [draft, setDraft] = useState<CustomBlockDraft>({ title: '', icon: '', color: PALETTE[0].value })
  const [linkEdit, setLinkEdit] = useState<LinkEdit | null>(null)
  const [imgBusy, setImgBusy] = useState(false)

  const addAsset = useCourseStore((s) => s.addAsset)

  // Estado reactivo derivado del editor (solo re-renderiza si cambia algo de
  // esto, no en cada pulsación): qué marcas/nodos están activos bajo el cursor.
  const active = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      h2: editor.isActive('heading', { level: 2 }),
      h3: editor.isActive('heading', { level: 3 }),
      bulletList: editor.isActive('bulletList'),
      orderedList: editor.isActive('orderedList'),
      link: editor.isActive('link'),
    }),
  })

  function insertCallout(ctype: string, extra?: { color?: string; icon?: string; title?: string }) {
    const { state } = editor
    const { from, to, empty } = state.selection
    const text = empty ? '' : state.doc.textBetween(from, to, ' ')
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'callout',
        attrs: { ctype, color: extra?.color ?? '', icon: extra?.icon ?? '', title: extra?.title ?? '' },
        content: [{ type: 'paragraph', content: text ? [{ type: 'text', text }] : [] }],
      })
      .run()
  }

  function openCustomNew() {
    setDraft({ title: '', icon: '', color: PALETTE[0].value })
    setShowCustom(true)
  }

  function applyCustomDraft(save: boolean) {
    const clean = { title: draft.title.trim(), icon: draft.icon.trim(), color: draft.color }
    if (save && (clean.title || clean.icon)) {
      const next = [{ id: `c-${Date.now().toString(36)}`, ...clean }, ...presets].slice(0, 20)
      setPresets(next)
      savePresets(next)
    }
    insertCallout('custom', clean)
    setShowCustom(false)
  }

  function deletePreset(id: string) {
    const next = presets.filter((p) => p.id !== id)
    setPresets(next)
    savePresets(next)
  }

  // --- Imagen: subir como asset e insertar en línea propia -------------------
  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImgBusy(true)
    try {
      const { blob, ext } = await optimizeImage(file)
      const path = `assets/img/txt-${Date.now().toString(36)}.${ext}`
      addAsset(path, blob)
      editor.chain().focus().insertContent({ type: 'imageFigure', attrs: { src: path, alt: '', width: null } }).run()
    } finally {
      setImgBusy(false)
      e.target.value = ''
    }
  }

  // --- Enlaces: insertar / editar el que hay bajo el cursor -------------------
  function openLinkEditor() {
    const linkType = editor.schema.marks.link
    if (editor.isActive('link')) {
      const range = getMarkRange(editor.state.selection.$from, linkType)
      const text = range ? editor.state.doc.textBetween(range.from, range.to, ' ') : ''
      setLinkEdit({ range: range ? { from: range.from, to: range.to } : null, text, url: editor.getAttributes('link').href || '' })
      return
    }
    const { from, to } = editor.state.selection
    const text = from === to ? '' : editor.state.doc.textBetween(from, to, ' ')
    setLinkEdit({ range: from === to ? null : { from, to }, text, url: 'https://' })
  }

  function saveLink() {
    if (!linkEdit) return
    const text = linkEdit.text.trim() || 'texto del enlace'
    const url = linkEdit.url.trim()
    const node = url
      ? { type: 'text', text, marks: [{ type: 'link', attrs: { href: url } }] }
      : { type: 'text', text }
    const chain = editor.chain().focus()
    if (linkEdit.range) chain.insertContentAt(linkEdit.range, node)
    else chain.insertContent(node)
    chain.run()
    setLinkEdit(null)
  }

  function removeLink() {
    if (!linkEdit) return
    const text = linkEdit.text.trim() || 'texto del enlace'
    const chain = editor.chain().focus()
    if (linkEdit.range) chain.insertContentAt(linkEdit.range, { type: 'text', text })
    setLinkEdit(null)
    chain.run()
  }

  function handleEscClose(): boolean {
    if (showCustom) {
      setShowCustom(false)
      return true
    }
    if (linkEdit) {
      setLinkEdit(null)
      return true
    }
    return false
  }

  return (
    <div className="ed-rta"
      onKeyDown={(e) => { if (e.key === 'Escape' && handleEscClose()) { e.preventDefault(); e.stopPropagation() } }}>
      <div className="ed-rta-bar" role="toolbar" aria-label="Formato de texto">
        <button type="button" className={active.bold ? 'is-on' : ''} onClick={() => editor.chain().focus().toggleBold().run()} title="Negrita"><strong>B</strong></button>
        <button type="button" className={active.italic ? 'is-on' : ''} onClick={() => editor.chain().focus().toggleItalic().run()} title="Cursiva"><em>I</em></button>
        <span className="ed-rta-sep" aria-hidden="true" />
        <button type="button" className={active.h2 ? 'is-on' : ''} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Encabezado">H2</button>
        <button type="button" className={active.h3 ? 'is-on' : ''} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Subencabezado">H3</button>
        <span className="ed-rta-sep" aria-hidden="true" />
        <button type="button" className={active.bulletList ? 'is-on' : ''} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Lista con viñetas">• Lista</button>
        <button type="button" className={active.orderedList ? 'is-on' : ''} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Lista numerada">1. Lista</button>
        <button type="button" className={active.link ? 'is-on' : ''} onClick={openLinkEditor}
          title={active.link ? 'Editar el enlace donde está el cursor' : 'Insertar enlace'}>
          <Icon name="link" size={13} /> {active.link ? 'Editar enlace' : 'Enlace'}
        </button>
        <label className="ed-rta-imgbtn" title="Insertar una imagen (se optimiza y viaja en el ZIP)" aria-busy={imgBusy}>
          <Icon name="image" size={13} /> {imgBusy ? 'Subiendo…' : 'Imagen'}
          <input type="file" accept="image/*" hidden disabled={imgBusy} onChange={onPickImage} />
        </label>
        <span className="ed-rta-sep" aria-hidden="true" />
        {CALLOUT_TYPES.map((c) => (
          <button key={c.value} type="button" onClick={() => insertCallout(c.value)} title={`Bloque: ${c.label.replace(/^\S+\s/, '')}`}>{c.label}</button>
        ))}
        <span className="ed-rta-sep" aria-hidden="true" />
        <button type="button" onClick={() => (showCustom ? setShowCustom(false) : openCustomNew())}
          title="Bloque personalizado (icono, color y título a elegir)"><Icon name="plus" size={13} /> Personalizado</button>
        {presets.map((p) => (
          <span key={p.id} className="ed-rta-preset">
            <button type="button" onClick={() => insertCallout('custom', p)} title={`Insertar «${p.title}»`}
              style={{ borderLeft: `4px solid ${p.color}` }}>
              {p.icon} {p.title}
            </button>
            <button type="button" className="ed-rta-preset-x" onClick={() => deletePreset(p.id)} aria-label={`Eliminar preset ${p.title}`}><Icon name="x" size={12} /></button>
          </span>
        ))}
      </div>

      {showCustom && (
        <CustomBlockPanel mode="insert" draft={draft} setDraft={setDraft}
          onCancel={() => setShowCustom(false)} onApply={applyCustomDraft} />
      )}

      {linkEdit && (
        <div className="ed-rta-blockbar ed-rta-linkedit">
          <span className="ed-rta-blocklbl"><Icon name="link" size={13} /> Enlace:</span>
          <input className="ed-rta-linktext" value={linkEdit.text} placeholder="Texto visible"
            onChange={(e) => setLinkEdit({ ...linkEdit, text: e.target.value })} />
          <input className="ed-rta-linkurl" value={linkEdit.url} placeholder="https://… o mailto:…"
            onChange={(e) => setLinkEdit({ ...linkEdit, url: e.target.value })} />
          <button type="button" onClick={() => setLinkEdit(null)}>Cancelar</button>
          {active.link && <button type="button" onClick={removeLink} title="Quitar el enlace y dejar solo el texto">Quitar</button>}
          <button type="button" className="ed-primary" onClick={saveLink}>{active.link ? 'Guardar' : 'Insertar'}</button>
        </div>
      )}

      <EditorContent editor={editor} className="ed-rta-cm" style={{ ['--ed-rta-minh' as string]: `${rows * 1.5}em` }} />
    </div>
  )
}
