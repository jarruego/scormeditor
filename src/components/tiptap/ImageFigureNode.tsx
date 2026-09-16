/* =============================================================================
 * ImageFigureNode — nodo TipTap para "![alt|ancho](ruta "pie")" (línea propia,
 * nunca inline: una imagen ocupa su propio renglón, igual que en la carcasa).
 * attrs: src (ruta assets/… o http(s)://…), alt, width (10-100 | null),
 * caption (pie, texto plano — el runtime lo interpreta con `rich()`, así que
 * negrita/cursiva/enlaces funcionan ahí aunque aquí sea un `<input>` simple).
 *
 * Mismo nodo/sintaxis para vídeos de YouTube: si `src` es un enlace de
 * YouTube reconocible (`extractYoutubeId`), se renderiza como iframe
 * incrustado en vez de `<img>` — sin tipo de nodo ni sintaxis aparte, el
 * dialecto/serializador (`mdDialect.ts`) no necesita saber que existe. Mismo
 * despacho por URL en el runtime (`renderer.js`, `youtubeId`).
 * ===========================================================================*/
import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { useState } from 'react'
import { Icon } from '../Icon'
import { useCourseStore } from '../../store/courseStore'
import { optimizeImage } from '../../media/optimizeImage'
import { extractYoutubeId } from '../../media/youtube'

const imgUrlCache = new Map<string, { raw: unknown; url: string }>()

/** Resuelve una ruta de asset a una object URL cacheada (o pasa la http(s) tal cual). */
function useImageUrl(src: string): string | null {
  const raw = useCourseStore((s) => (/^https?:\/\//.test(src) ? undefined : s.assets[src]))
  if (/^https?:\/\//.test(src)) return src
  if (raw == null) return null
  const hit = imgUrlCache.get(src)
  if (hit && hit.raw === raw) return hit.url
  if (hit) URL.revokeObjectURL(hit.url)
  const blob = raw instanceof Blob ? raw : new Blob([raw as BlobPart])
  const url = URL.createObjectURL(blob)
  imgUrlCache.set(src, { raw, url })
  return url
}

function ImageFigureView({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
  const { src, alt, width, caption } = node.attrs as { src: string; alt: string; width: number | null; caption: string }
  const ytId = extractYoutubeId(src)
  const url = useImageUrl(src)
  const addAsset = useCourseStore((s) => s.addAsset)
  const removeAsset = useCourseStore((s) => s.removeAsset)
  const [busy, setBusy] = useState(false)

  async function replace(file: File) {
    setBusy(true)
    try {
      const { blob, ext } = await optimizeImage(file)
      const path = `assets/img/txt-${Date.now().toString(36)}.${ext}`
      addAsset(path, blob)
      if (src.startsWith('assets/') && src !== path) removeAsset(src)
      updateAttributes({ src: path })
    } finally {
      setBusy(false)
    }
  }

  function remove() {
    if (src.startsWith('assets/')) removeAsset(src)
    deleteNode()
  }

  return (
    <NodeViewWrapper className={`ed-imgnode ${selected ? 'is-selected' : ''} ${width ? 'has-width' : ''} ${ytId ? 'is-video' : ''}`} contentEditable={false}>
      {ytId ? (
        <div className="ed-imgnode-video" style={width ? { width: `${width}%` } : undefined}>
          <iframe src={`https://www.youtube-nocookie.com/embed/${ytId}`} title={alt || 'Vídeo'} allowFullScreen />
        </div>
      ) : url ? (
        <img src={url} alt={alt} title={alt} style={width ? { width: `${width}%` } : undefined} />
      ) : (
        <div className="ed-imgnode-missing">🖼 imagen no encontrada en assets</div>
      )}
      <div className="ed-rta-blockbar ed-rta-imgbar" onMouseDown={(e) => e.stopPropagation()}>
        <span className="ed-rta-blocklbl">
          <Icon name={ytId ? 'film' : 'image'} size={13} /> {ytId ? 'Vídeo:' : 'Imagen:'}
        </span>
        <input className="ed-rta-imgalt" value={alt} placeholder={ytId ? 'Título del vídeo (accesibilidad)' : 'Texto alternativo (accesibilidad)'}
          onChange={(e) => updateAttributes({ alt: e.target.value.replace(/[\]|]/g, '') })} />
        <select value={width ?? ''} title={`Ancho del ${ytId ? 'vídeo' : 'la imagen'} en la diapositiva`}
          onChange={(e) => updateAttributes({ width: e.target.value ? Number(e.target.value) : null })}>
          <option value="">Tamaño real</option>
          <option value="25">25 % del ancho</option>
          <option value="33">33 % del ancho</option>
          <option value="50">50 % del ancho</option>
          <option value="66">66 % del ancho</option>
          <option value="100">100 % del ancho</option>
        </select>
        {ytId ? (
          <input className="ed-rta-yturl" value={src} placeholder="Enlace de YouTube"
            onChange={(e) => updateAttributes({ src: e.target.value })} />
        ) : (
          <label className="ed-rta-imgbtn" title="Sustituir por otra imagen" aria-busy={busy}>
            {busy ? 'Subiendo…' : <><Icon name="refresh" size={13} /> Sustituir…</>}
            <input type="file" accept="image/*" hidden disabled={busy}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) replace(f); e.target.value = '' }} />
          </label>
        )}
        <input className="ed-rta-imgcaption" value={caption}
          placeholder={`Pie de ${ytId ? 'vídeo' : 'foto'} (admite **negrita**, *cursiva* y [enlaces](url))`}
          onChange={(e) => updateAttributes({ caption: e.target.value })} />
        <button type="button" className="ed-danger" onClick={remove}
          title={ytId ? 'Quitar el vídeo' : 'Quitar la imagen (el archivo se conserva si otra pantalla lo usa)'}>
          <Icon name="trash" size={13} /> Quitar
        </button>
      </div>
    </NodeViewWrapper>
  )
}

export const ImageFigureNode = Node.create({
  name: 'imageFigure',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: '' },
      alt: { default: '' },
      width: { default: null },
      caption: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-image-figure]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-image-figure': '' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageFigureView)
  },
})

// Evita fugas del cache de object URLs entre recargas del módulo en dev (HMR).
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    imgUrlCache.forEach((v) => URL.revokeObjectURL(v.url))
    imgUrlCache.clear()
  })
}
