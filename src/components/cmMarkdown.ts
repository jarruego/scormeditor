/* =============================================================================
 * cmMarkdown.ts — Configuración de CodeMirror 6 para el editor de texto.
 * El documento sigue siendo MARKDOWN EN TEXTO PLANO (la invariante del proyecto):
 * aquí solo se define cómo se PINTA la caja mientras editas, no cómo se guarda.
 *   - mdHighlighting: negrita en negrita, encabezados grandes, enlaces, código…
 *   - calloutDecorations: pinta los bloques "::: tipo … :::" como cajas de color
 *     (los "::: custom | #color …" con su propio color, validado como hex).
 *   - livePreview: modo «vista viva» estilo Obsidian — OCULTA los marcadores de
 *     sintaxis (**, #, [ ]( ), :::) salvo en la línea donde está el cursor, para
 *     que la caja muestre el resultado pero se puedan seguir editando.
 *   - editorTheme: aspecto de la caja alineado con las variables del editor.
 * No se genera ni almacena HTML: CodeMirror trabaja sobre texto plano.
 * ===========================================================================*/
import { HighlightStyle, syntaxHighlighting, syntaxTree } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import { Decoration, EditorView, ViewPlugin, WidgetType } from '@codemirror/view'
import type { DecorationSet, ViewUpdate } from '@codemirror/view'
import { useCourseStore } from '../store/courseStore'

// Resaltado del markdown: el contenido se ve con su formato y los marcadores
// (**, #, [ ]( )) quedan atenuados/ocultos, para que la caja se lea como el resultado.
const mdHighlight = HighlightStyle.define([
  { tag: t.heading1, fontSize: '1.35em', fontWeight: '700' },
  { tag: t.heading2, fontSize: '1.2em', fontWeight: '700' },
  { tag: t.heading3, fontSize: '1.08em', fontWeight: '700' },
  { tag: [t.heading4, t.heading5, t.heading6], fontWeight: '700' },
  { tag: t.strong, fontWeight: '700' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  { tag: t.link, color: 'var(--c-primary)', textDecoration: 'underline' },
  { tag: t.url, color: 'var(--c-muted)' },
  { tag: t.monospace, fontFamily: 'ui-monospace, Menlo, Consolas, monospace', fontSize: '.95em' },
  { tag: [t.processingInstruction, t.contentSeparator, t.meta], color: 'var(--c-muted)' },
])

export const mdHighlighting = syntaxHighlighting(mdHighlight)

// Etiquetas de cabecera de los callouts predefinidos (para el «chip» de bloque).
const CALLOUT_CHIP: Record<string, string> = {
  tip: '💡 Consejo',
  info: 'ℹ️ Información',
  warn: '⚠️ Atención',
  important: '📌 Importante',
  fact: '🧠 ¿Sabías que…?',
  reflect: '💭 Reflexiona',
  case: '🧪 Caso práctico',
}

// Color de cada tipo de callout, alineado con la carcasa (runtime/styles.css) para
// que el bloque se vea en el editor con el MISMO color que tendrá de verdad.
const CALLOUT_COLORS: Record<string, string> = {
  tip: '#6dc3c0', fact: '#6dc3c0', important: '#6dc3c0',
  warn: '#f4c910', reflect: '#f4c910', case: '#f4c910',
  info: '#7787bf',
}

// Color del bloque: para "custom", el hex validado de su cabecera; para los
// predefinidos, el de la paleta. `null` si no hay color aplicable.
function calloutColor(type: string, rest: string): string | null {
  if (type === 'custom') {
    const c = rest.split('|').map((s) => s.trim())[1] || ''
    return /^#[0-9a-fA-F]{3,8}$/.test(c) ? c : null
  }
  return CALLOUT_COLORS[type] || null
}

// --- Decoración de bloques destacados (::: tipo … :::) --------------------
// Recorre el documento marcando las líneas de cada bloque para pintarlas como
// una caja. En los "custom" con color hex válido se expone el color por CSS var.
function lineDeco(cls: string, color: string | null) {
  const attributes: Record<string, string> = { class: cls }
  if (color) attributes.style = `--cm-callout-color:${color};`
  return Decoration.line({ attributes })
}

function buildCallouts(view: EditorView): DecorationSet {
  const ranges = []
  const doc = view.state.doc
  const { from: vpFrom, to: vpTo } = view.viewport
  let open = false
  let color: string | null = null
  for (let i = 1; i <= doc.lines; i++) {
    const line = doc.line(i)
    if (line.from > vpTo) break
    const isClose = /^\s*:::\s*$/.test(line.text)
    const openM = /^\s*:::\s*([A-Za-z]+)\s*(.*)$/.exec(line.text)
    let cls: string | null = null
    if (open) {
      if (isClose) {
        cls = 'cm-callout cm-callout-fence cm-callout-end'
        open = false
      } else {
        cls = 'cm-callout cm-callout-body'
      }
    } else if (openM && !isClose) {
      color = calloutColor(openM[1].toLowerCase(), openM[2])
      cls = 'cm-callout cm-callout-fence cm-callout-start'
      open = true
    }
    if (cls && line.to >= vpFrom) ranges.push(lineDeco(cls, color).range(line.from))
    if (cls && cls.indexOf('cm-callout-end') >= 0) color = null
  }
  return Decoration.set(ranges)
}

export const calloutDecorations = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet
    constructor(view: EditorView) {
      this.decorations = buildCallouts(view)
    }
    update(u: ViewUpdate) {
      if (u.docChanged || u.viewportChanged) this.decorations = buildCallouts(u.view)
    }
  },
  { decorations: (v) => v.decorations },
)

// --- Vista viva: ocultar marcadores fuera de la línea con el cursor --------
const HIDE = Decoration.replace({})

// «Chip» que sustituye la línea de cabecera "::: tipo …" por un rótulo legible.
class ChipWidget extends WidgetType {
  constructor(
    readonly label: string,
    readonly color: string | null,
  ) {
    super()
  }
  eq(other: ChipWidget) {
    return other.label === this.label && other.color === this.color
  }
  toDOM() {
    const span = document.createElement('span')
    span.className = 'cm-callout-chip'
    if (this.color) span.style.setProperty('--cm-callout-color', this.color)
    span.textContent = this.label
    return span
  }
  ignoreEvent() {
    return false
  }
}

// --- Previsualización de imágenes ![alt](ruta) -----------------------------
// Misma sintaxis que renderiza la carcasa (línea propia, ruta assets/ o http(s),
// ancho opcional en % con `![alt|50](ruta)`). La línea entera se sustituye por
// la imagen (sin markdown visible); se edita con la barra contextual «Imagen»
// de RichTextArea. Los blobs de assets se resuelven a object URLs cacheadas.
export const IMG_LINE = /^\s*!\[([^\]|]*)(?:\|(\d{1,3}))?\]\((assets\/[^\s)]+|https?:\/\/[^\s)]+)\)\s*$/

const imgUrlCache = new Map<string, { raw: unknown; url: string }>()
function imageUrl(path: string): string | null {
  if (/^https?:\/\//.test(path)) return path
  const raw = useCourseStore.getState().assets[path]
  if (raw == null) return null
  const hit = imgUrlCache.get(path)
  if (hit && hit.raw === raw) return hit.url
  if (hit) URL.revokeObjectURL(hit.url)
  // El mapa de assets admite Blob u otros binarios (mismo criterio que useObjectUrl).
  const blob = raw instanceof Blob ? raw : new Blob([raw as BlobPart])
  const url = URL.createObjectURL(blob)
  imgUrlCache.set(path, { raw, url })
  return url
}

class ImgWidget extends WidgetType {
  constructor(
    readonly url: string | null,
    readonly alt: string,
    readonly width: number | null,
    readonly selected: boolean,
  ) {
    super()
  }
  eq(other: ImgWidget) {
    return other.url === this.url && other.alt === this.alt &&
      other.width === this.width && other.selected === this.selected
  }
  toDOM() {
    const span = document.createElement('span')
    span.className = 'cm-md-img' + (this.selected ? ' is-selected' : '')
    if (!this.url) {
      span.classList.add('is-missing')
      span.textContent = '🖼 imagen no encontrada en assets'
      return span
    }
    const img = document.createElement('img')
    img.src = this.url
    img.alt = this.alt
    img.title = this.alt
    if (this.width) {
      // Ancho en % del ancho de la caja (WYSIWYG con la diapositiva).
      span.classList.add('has-width')
      img.style.width = `${this.width}%`
    }
    span.appendChild(img)
    return span
  }
  ignoreEvent() {
    return false
  }
}

function buildLivePreview(view: EditorView): DecorationSet {
  const state = view.state
  const doc = state.doc
  const items: { from: number; to: number; deco: Decoration }[] = []
  const fenceLines = new Set<number>()
  const imgLines = new Set<number>()

  // 1) Bloques ::: — cabecera como chip legible y línea de cierre oculta.
  let open = false
  for (let i = 1; i <= doc.lines; i++) {
    const line = doc.line(i)
    const isClose = /^\s*:::\s*$/.test(line.text)
    const openM = /^\s*:::\s*([A-Za-z]+)\s*(.*)$/.exec(line.text)
    if (!open && openM && !isClose) {
      fenceLines.add(i)
      const type = openM[1].toLowerCase()
      const color = calloutColor(type, openM[2])
      let label = CALLOUT_CHIP[type] || type
      if (type === 'custom') {
        const parts = openM[2].split('|').map((s) => s.trim())
        label = (`${parts[2] || ''} ${parts[3] || ''}`).trim() || 'Bloque personalizado'
      }
      if (line.length > 0) {
        items.push({ from: line.from, to: line.to, deco: Decoration.replace({ widget: new ChipWidget(label, color) }) })
      }
      open = true
      continue
    }
    if (open && isClose) {
      fenceLines.add(i)
      if (line.length > 0) items.push({ from: line.from, to: line.to, deco: HIDE })
      open = false
      continue
    }
    // Línea de imagen (también dentro de un callout): se sustituye ENTERA por
    // la imagen. Con el cursor en la línea se marca seleccionada (contorno) y
    // RichTextArea muestra su barra contextual para editarla.
    const img = IMG_LINE.exec(line.text)
    if (img && line.length > 0) {
      imgLines.add(i)
      const head = state.selection.main.head
      items.push({
        from: line.from,
        to: line.to,
        deco: Decoration.replace({
          widget: new ImgWidget(
            imageUrl(img[3]), img[1], img[2] ? +img[2] : null,
            head >= line.from && head <= line.to,
          ),
        }),
      })
    }
  }

  // 2) Marcadores inline (**, #, enlaces, código) vía árbol de sintaxis: se
  //    ocultan SIEMPRE (salvo en líneas de fence, ya tratadas). Nunca se revelan
  //    por cursor/selección; para editarlos se usan los botones de la barra.
  for (const { from, to } of view.visibleRanges) {
    syntaxTree(state).iterate({
      from,
      to,
      enter: (node) => {
        const n = node.name
        if (n === 'EmphasisMark' || n === 'HeaderMark' || n === 'LinkMark' || n === 'CodeMark' || n === 'URL') {
          if (node.to <= node.from) return
          const ln = doc.lineAt(node.from).number
          if (fenceLines.has(ln) || imgLines.has(ln)) return
          items.push({ from: node.from, to: node.to, deco: HIDE })
        }
      },
    })
  }

  return Decoration.set(
    items.map((it) => it.deco.range(it.from, it.to)),
    true,
  )
}

export const livePreview = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet
    constructor(view: EditorView) {
      this.decorations = buildLivePreview(view)
    }
    update(u: ViewUpdate) {
      // selectionSet: el contorno de imagen seleccionada depende del cursor.
      if (u.docChanged || u.viewportChanged || u.selectionSet) this.decorations = buildLivePreview(u.view)
    }
  },
  {
    decorations: (v) => v.decorations,
    // Rangos atómicos: las flechas saltan los marcadores ocultos como una unidad.
    provide: (plugin) =>
      EditorView.atomicRanges.of((view) => view.plugin(plugin)?.decorations ?? Decoration.none),
  },
)

// Aspecto de la caja: hereda tipografía y colores del editor (variables CSS).
// `minHeightEm` traduce el antiguo `rows` a una altura mínima cómoda.
export function editorTheme(minHeightEm: number) {
  return EditorView.theme({
    '&': {
      border: '1px solid var(--c-border)',
      borderRadius: '6px',
      background: '#fff',
      color: 'var(--c-text)',
    },
    '&.cm-focused': { outline: '3px solid var(--c-primary)', outlineOffset: '1px' },
    '.cm-scroller': { fontFamily: 'inherit', lineHeight: '1.5' },
    '.cm-content': { padding: '.45rem .55rem', minHeight: `${minHeightEm}em` },
    '.cm-line': { padding: '0 2px' },
  })
}
