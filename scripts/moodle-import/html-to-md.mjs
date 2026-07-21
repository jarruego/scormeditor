/**
 * HTML de Moodle (Atto: p/div/h4/strong/b/em/i/u/ul/li/br/a/img/span, con
 * estilos inline que se descartan) -> markdown ligero de SCORMEditor
 * (src/runtime/assets/js/renderer.js `mdToHtml`). No es un conversor HTML
 * genérico: cubre el subconjunto de etiquetas realmente usado en el curso
 * fuente (ver inventario en el informe de la conversión).
 *
 * Mapeo de "cajas" (`<div class="caja caja-COLOR">`) a los callouts del editor:
 * decidido por (clase, título del <h4>) sobre el contenido REAL de las 8
 * unidades (no la lección plantilla, que solo trae "xxxxxxx" de relleno).
 */

const CALLOUT_BY_TITLE = new Map([
  ['importante', 'important'],
  ['¿sabías que...?', 'fact'],
  ['¿sabías que…?', 'fact'],
  ['actividad práctica', 'case'],
  ['reflexiona', 'reflect'],
  ['clave de reflexión', 'reflect'],
  ['resolución propuesta', 'reflect'],
])

// Fallback por clase de caja cuando el título del h4 no está en la tabla anterior
// (no aparece en el contenido real de las 8 unidades, solo en la lección plantilla).
const CUSTOM_BY_CLASS = {
  'caja-roja': { color: '#E57373', icon: '⚠️' },
  'caja-violeta': { color: '#7787BF', icon: 'ℹ️' },
  'caja-azul': { color: '#64B5F6', icon: 'ℹ️' },
  'caja-rosa': { color: '#F4D6D2', icon: '📚' },
  'caja-flex': { color: '#6DC3C0', icon: '' },
  caja: { color: '#6DC3C0', icon: '' },
}

// Tokens ASCII explícitos (nunca caracteres invisibles) para proteger saltos
// de línea "con significado" (párrafo/lista/<br>) mientras pasan por
// inlineFormat(), que colapsa cualquier \n suelto a un espacio (los saltos de
// línea de maquetación manual del editor Atto NO son intencionales).
const BLOCKBREAK = '@@BLOCKBREAK@@'
const LINEBREAK = '@@LINEBREAK@@'

function stripTags(html) {
  return html.replace(/<[^>]+>/g, '')
}

/** Envuelve en marcador (** o *) conservando un espacio simple en los bordes si el original lo tenía. */
function wrapPreservingEdges(raw, marker) {
  const leading = /^\s/.test(raw) ? ' ' : ''
  const trailing = /\s$/.test(raw) ? ' ' : ''
  const text = raw.trim()
  return text ? leading + marker + text + marker + trailing : ''
}

function inlineFormat(html) {
  // negrita/cursiva/enlaces; todo lo demás (span, u, estilos) se aplana a texto.
  let s = html
  s = s.replace(/<a\s+[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, inner) => {
    const text = stripTags(inner).trim()
    if (!text) return ''
    if (!/^https?:|^mailto:/i.test(href)) return text
    return `[${text}](${href})`
  })
  s = s.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, inner) => wrapPreservingEdges(inlineFormat(inner), '**'))
  s = s.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, inner) => wrapPreservingEdges(inlineFormat(inner), '*'))
  s = s.replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, (_, inner) => inlineFormat(inner))
  s = s.replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, (_, inner) => inlineFormat(inner))
  s = stripTags(s)
  // Colapsa TODO whitespace (incluidos saltos de línea de maquetación manual)
  // a un solo espacio: en un tramo inline un \n suelto nunca es intencional
  // (regla "reagrupar frases partidas por la maquetación", ingesta-gpt.md).
  // Los saltos con significado viajan como BLOCKBREAK/LINEBREAK, que no
  // contienen \n literal, así que sobreviven intactos a este colapso.
  s = s.replace(/ /g, ' ')
  s = s.replace(/\s+/g, ' ')
  return s
}

/** Convierte texto corto (prompt de pregunta, opciones): solo negrita/cursiva/enlace, sin bloques. */
export function htmlToInlineText(html) {
  return inlineFormat(html).trim()
}

function normalizeTitle(t) {
  return t.toLowerCase().replace(/[:：]\s*$/, '').trim()
}

/**
 * Convierte el HTML de una página de lección a markdown ligero + extrae las
 * imágenes en el orden en que aparecen (para decidir visual_resource vs. inline
 * en el llamante).
 * @param {string} html
 * @param {(originalSrc: string) => {path:string, alt:string}|null} resolveImage
 * @returns {{ markdown: string, images: Array<{path:string, alt:string}> }}
 */
export function lessonHtmlToMarkdown(html, resolveImage) {
  const images = []
  const boxes = []
  let src = html

  // 1) Cajas -> token opaco @@BOX:i@@ (el markdown final del bloque se calcula
  //    aparte y se inserta DESPUÉS de que el resto del documento pase por
  //    blockToMarkdown: si se insertara ya como "::: tipo\n...\n:::" con \n
  //    reales en este punto, el colapso de line-wrap del propio
  //    blockToMarkdown se los comería. Sin cajas anidadas en el corpus.
  src = src.replace(
    /<div class="(caja(?:\s+caja-\w+)?|caja-flex)">([\s\S]*?)<\/div>/g,
    (_, cls, inner) => {
      const classes = cls.split(/\s+/)
      const colorClass = classes.find((c) => c !== 'caja') || 'caja'
      const hMatch = inner.match(/<h4[^>]*>([^<]*)<\/h4>/)
      const rawTitle = hMatch ? decodeInlineEntities(hMatch[1]).trim() : ''
      const bodyHtml = hMatch ? inner.slice(inner.indexOf(hMatch[0]) + hMatch[0].length) : inner
      const calloutType = rawTitle ? CALLOUT_BY_TITLE.get(normalizeTitle(rawTitle)) : null

      const bodyMd = blockToMarkdown(bodyHtml, images, resolveImage)
      let block
      if (calloutType) {
        // El título ya lo pinta el callout con su propio rótulo fijo; si el h4
        // real no es el rótulo estándar (p. ej. "Resolución propuesta" dentro
        // de un "reflect"), se conserva como primera línea en negrita.
        const standardLabels = new Set(['importante', '¿sabías que...?', '¿sabías que…?', 'actividad práctica', 'reflexiona'])
        const keepHeading = rawTitle && !standardLabels.has(normalizeTitle(rawTitle))
        const body = (keepHeading ? `**${rawTitle}**\n\n` : '') + bodyMd
        block = `::: ${calloutType}\n${body.trim()}\n:::`
      } else {
        const custom = CUSTOM_BY_CLASS[colorClass] || CUSTOM_BY_CLASS.caja
        block = `::: custom | ${custom.color} | ${custom.icon} | ${rawTitle}\n${bodyMd.trim()}\n:::`
      }
      boxes.push(block)
      return `\n\n@@BOX:${boxes.length - 1}@@\n\n`
    },
  )

  let markdown = blockToMarkdown(src, images, resolveImage)
  markdown = markdown.replace(/@@BOX:(\d+)@@/g, (_, i) => boxes[Number(i)])
  return { markdown, images }
}

function decodeInlineEntities(s) {
  return s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
}

/** Convierte un fragmento de bloque (fuera de cajas) a markdown ligero. */
function blockToMarkdown(html, images, resolveImage) {
  let s = html

  // El origen trae saltos de línea manuales dentro del propio texto (line-wrap
  // del editor Atto de Moodle, no listas ni párrafos): se colapsan a espacio
  // ANTES de insertar los \n con significado (párrafo/lista/<br> más abajo),
  // que de lo contrario serían indistinguibles de estos. Regla "reagrupar
  // frases partidas por la maquetación" (ingesta-gpt.md).
  s = s.replace(/\r?\n/g, ' ')

  // Imágenes: se extraen como token de línea propia; el llamante decide si
  // acaban en visual_resource o como ![...](...) inline según cuántas haya.
  s = s.replace(/<img\s+[^>]*src="([^"]*)"[^>]*>/gi, (full, rawSrc) => {
    const resolved = resolveImage ? resolveImage(rawSrc) : null
    if (!resolved) return ''
    const altMatch = full.match(/alt="([^"]*)"/)
    const alt = altMatch && altMatch[1] ? decodeInlineEntities(altMatch[1]) : ''
    images.push({ path: resolved.path, alt: alt || resolved.alt })
    return `\n\n@@IMG:${images.length - 1}@@\n\n`
  })

  // h4 sueltos (fuera de caja) -> encabezado de nivel 3 en el cuerpo.
  s = s.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, inner) => `\n\n## ${inlineFormat(inner)}\n\n`)

  // Listas (los <li> pasan por inlineFormat, que ya colapsa sus propios
  // saltos de línea de maquetación).
  s = s.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, inner) => {
    const items = [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => inlineFormat(m[1]))
    return '\n\n' + items.filter(Boolean).map((t) => `- ${t}`).join('\n') + '\n\n'
  })
  s = s.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, inner) => {
    const items = [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => inlineFormat(m[1]))
    return '\n\n' + items.filter(Boolean).map((t, i) => `${i + 1}. ${t}`).join('\n') + '\n\n'
  })

  // Párrafos -> separación en blanco; <br> -> salto simple.
  s = s.replace(/<p[^>]*>/gi, '\n\n').replace(/<\/p>/gi, '\n\n')
  s = s.replace(/<br\s*\/?>/gi, '\n')

  // Protege los saltos ya insertados (con significado) antes de inlineFormat.
  s = s.replace(/\n{2,}/g, BLOCKBREAK).replace(/\n/g, LINEBREAK)
  s = inlineFormat(s)
  s = s.split(BLOCKBREAK).join('\n\n').split(LINEBREAK).join('\n')

  // Restaura los tokens de imagen como línea de imagen en el markdown ligero.
  s = s.replace(/@@IMG:(\d+)@@/g, (_, i) => {
    const img = images[Number(i)]
    return `![${(img.alt || '').replace(/[[\]]/g, '')}](${img.path})`
  })

  return normalizeWhitespace(s)
}

function normalizeWhitespace(s) {
  return s
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
