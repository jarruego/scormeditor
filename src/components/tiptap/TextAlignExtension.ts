/* =============================================================================
 * TextAlignExtension — alineación (izquierda/centro/derecha) de párrafos y
 * encabezados. Implementación propia y mínima (no `@tiptap/extension-text-align`:
 * sin dependencias nuevas, ver CLAUDE.md) — un atributo global `textAlign` sobre
 * los tipos de bloque de texto, sin nodo ni marca aparte.
 *
 * Se serializa como prefijo de línea `{center}`/`{right}` en el markdown ligero
 * (mdDialect.ts + `src/runtime/assets/js/renderer.js`, mismo patrón que el resto
 * del dialecto: «izquierda» es el default implícito, sin marca). No aplica a
 * listas ni callouts — alinear un párrafo/encabezado cubre el caso de uso
 * («lo típico de centrar, izq., dcha.»); ver `editor-richtext.md`.
 * ===========================================================================*/
import { Extension } from '@tiptap/core'

export type TextAlignValue = 'left' | 'center' | 'right'

const TYPES = ['heading', 'paragraph']

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textAlign: {
      setTextAlign: (align: TextAlignValue) => ReturnType
    }
  }
}

export const TextAlignExtension = Extension.create({
  name: 'textAlign',

  addGlobalAttributes() {
    return [
      {
        types: TYPES,
        attributes: {
          textAlign: {
            default: null,
            parseHTML: (el) => el.style.textAlign || null,
            renderHTML: (attrs) => (attrs.textAlign ? { style: `text-align: ${attrs.textAlign}` } : {}),
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setTextAlign:
        (align: TextAlignValue) =>
        ({ commands }) => {
          // «Izquierda» es el default implícito (sin marca en el markdown): se
          // guarda como `null`, no como la cadena 'left'.
          const value = align === 'left' ? null : align
          // `.map()` primero (nunca corta a medias) y `.every()` después: la
          // selección normalmente solo contiene UNO de los dos tipos, y
          // `updateAttributes` devuelve `false` cuando ese tipo no está en la
          // selección — encadenar `.every()` directo sobre `.map()` cortaría
          // en el primer `false` (p. ej. «heading» antes que «paragraph») y
          // nunca llegaría a aplicar el que sí corresponde.
          return TYPES.map((t) => commands.updateAttributes(t, { textAlign: value })).every(Boolean)
        },
    }
  },
})
