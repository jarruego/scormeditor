/**
 * Lectura de un paquete SCORM de Adobe Captivate (HTML5, con `assets/js/CPM.js`)
 * ya descomprimido, para rehacerlo como `.scormproj`.
 *
 * Captivate no guarda el contenido como HTML sino como un gran literal JS
 * (`cp.model.data = {...}`) con un objeto por elemento de diapositiva. Aquí no se
 * evalúa (no es JSON válido): se localizan por regex los elementos y se agrupan por
 * diapositiva (`apsn`). Lo que se extrae:
 *  - diapositivas normales: título/subtítulo, bloques de texto (HTML → markdown
 *    ligero, con negrita y listas) e imágenes propias de la diapositiva;
 *  - diapositivas de pregunta (`st:'Question Slide'`): enunciado, opciones y
 *    respuestas correctas (`cal`), solo test de opción única / verdadero-falso.
 * Las imágenes viven en `dr/*.json` (PNG en base64) y se devuelven ya decodificadas.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }
const decode = (s) =>
  s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, g) => {
    if (g[0] === '#') return String.fromCodePoint(g[1].toLowerCase() === 'x' ? parseInt(g.slice(2), 16) : parseInt(g.slice(1), 10))
    return ENT[g.toLowerCase()] ?? m
  })

/** El literal JS usa comillas simples con escapes \' y \" : se deshacen. */
const unescapeJs = (s) => s.replace(/\\(['"\\\/])/g, '$1').replace(/\\u([0-9a-f]{4})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))

/**
 * HTML de texto de Captivate → markdown ligero. Conserva párrafos, saltos,
 * negrita (`font-weight:bold`), cursiva y listas (`<li>`); descarta estilos y los
 * símbolos de viñeta (`cp-numbering`).
 */
export function captivateHtmlToMd(html) {
  let h = unescapeJs(html)
  h = h.replace(/<span[^>]*cp-numbering[^>]*>[\s\S]*?<\/span>/g, '')
  // negrita/cursiva por estilo inline → marcas, antes de quitar las etiquetas
  h = h.replace(/<span style="([^"]*)">([\s\S]*?)<\/span>/g, (m, st, inner) => {
    if (!inner.trim() || /<[^>]*>/.test(inner.replace(/<br>/g, ''))) return m
    let out = inner
    if (/font-weight:\s*bold/.test(st)) out = `**${out.trim()}** `
    if (/font-style:\s*italic/.test(st)) out = `*${out.trim()}* `
    return out
  })
  h = h.replace(/<li>/g, '\n- ').replace(/<\/li>/g, '')
  h = h.replace(/<br\s*\/?>/g, '\n')
  h = h.replace(/<\/div>/g, '\n').replace(/<\/p>/g, '\n')
  h = h.replace(/<[^>]*>/g, '')
  h = decode(h)
  // marcas de negrita fusionadas: «**a** **b**» → «**a b**»
  h = h.replace(/\*\*\s*\*\*/g, ' ')
  // espacios dentro de las marcas: «** a**» → « **a**»
  h = h.replace(/\*\*([^*\n]+?)\*\*/g, (m, t) => {
    const lead = /^\s/.test(t) ? ' ' : ''
    const trail = /\s$/.test(t) ? ' ' : ''
    return t.trim() ? `${lead}**${t.trim()}**${trail}` : ' '
  })
  const lines = h.split('\n').map((l) => l.replace(/[ \t ]+/g, ' ').trim())
  const out = []
  for (const l of lines) {
    if (l === '' && out[out.length - 1] === '') continue
    out.push(l)
  }
  // una línea de lista no debe ir separada por línea en blanco de su vecina
  return out.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\n\n(- )/g, '\n$1').trim()
}

const num = (s) => Number(s)

/** Devuelve las diapositivas ordenadas del paquete + las imágenes decodificadas. */
export function parseCaptivate(dir) {
  const s = readFileSync(join(dir, 'assets/js/CPM.js'), 'utf8')
  const start = s.indexOf('cp.model.data = {')
  const endIdx = s.indexOf('cp.model.data.project', start)
  const seg = s.slice(start, endIdx > 0 ? endIdx : start + 4e6)

  // ---- diapositivas -------------------------------------------------------
  const slideRe = /(Slide\d+):\{lb:'([^']*)',id:(\d+),from:(\d+),to:(\d+)/g
  const slideHeads = []
  let m
  while ((m = slideRe.exec(seg))) slideHeads.push({ key: m[1], from: num(m[4]), pos: m.index })
  const slides = new Map()
  slideHeads.forEach((h, i) => {
    const body = seg.slice(h.pos, slideHeads[i + 1]?.pos ?? seg.length)
    slides.set(h.key, {
      key: h.key,
      from: h.from,
      kind: /st:'Question Slide'/.test(body.slice(0, 1500)) ? 'question' : 'content',
      items: [],
      question: null,
    })
  })

  // ---- elementos ----------------------------------------------------------
  const itemRe = /([A-Za-z_0-9]+):\{type:(\d+),from:(\d+),to:(\d+)/g
  const heads = []
  while ((m = itemRe.exec(seg))) heads.push({ name: m[1], type: num(m[2]), pos: m.index })
  heads.forEach((h, i) => {
    const body = seg.slice(h.pos, heads[i + 1]?.pos ?? seg.length)
    const apsn = (body.match(/apsn:'([^']*)'/) || [])[1]
    const sl = slides.get(apsn)
    if (!sl) return
    const t = body.match(/1024:\{vt:'((?:[^'\\]|\\.)*)',text:'((?:[^'\\]|\\.)*)'\}/)
    const geom = seg.match(new RegExp(`${h.name}c:\\{b:\\[(-?[\\d.]+),(-?[\\d.]+),(-?[\\d.]+),(-?[\\d.]+)\\]`))
    sl.items.push({
      name: h.name,
      type: h.type,
      vt: t ? t[1] : '',
      text: t ? unescapeJs(t[2]).trim() : '',
      top: geom ? Number(geom[2]) : 0,
      left: geom ? Number(geom[1]) : 0,
      img: (body.match(/'(dr\/[^']+\.(?:png|jpg|gif))'/) || [])[1] || null,
    })
  })

  // ---- preguntas ----------------------------------------------------------
  const qRe = /(Slide\d+)q\d+:\{noa:\d+,qt:'((?:[^'\\]|\\.)*)'.*?itp:'([^']*)',cal:\[([^\]]*)\],qtp:'([^']*)'/g
  while ((m = qRe.exec(seg))) {
    const sl = slides.get(m[1])
    if (sl) sl.question = { itp: m[3], cal: [...m[4].matchAll(/'([A-Z])'/g)].map((x) => x[1]), qtp: m[5] }
  }

  // ---- imágenes (dr/*.json con data en base64) ------------------------------
  const images = new Map()
  const drDir = join(dir, 'dr')
  if (existsSync(drDir)) {
    for (const f of readdirSync(drDir).filter((f) => f.endsWith('.json'))) {
      const txt = readFileSync(join(drDir, f), 'utf8')
      for (const im of txt.matchAll(/"(dr\/[^"]+)":\s*"([A-Za-z0-9+/=]+)"/g)) {
        images.set(im[1], Buffer.from(im[2], 'base64'))
      }
    }
  }

  const ordered = [...slides.values()].sort((a, b) => a.from - b.from)
  for (const sl of ordered) {
    sl.items.sort((a, b) => a.top - b.top || a.left - b.left)
    if (sl.kind === 'question') sl.q = buildQuestion(sl)
  }
  return { slides: ordered, images }
}

function buildQuestion(sl) {
  const prompt = sl.items.find((i) => i.type === 79)
  // Opciones (tipo 80) en orden de aparición = A), B), C)… (etiquetas, tipo 10088).
  const opts = sl.items.filter((i) => i.type === 80).sort((a, b) => a.top - b.top)
  const correct = sl.question?.cal || []
  const letters = 'ABCDEFGH'
  return {
    prompt: prompt ? prompt.text : '',
    multiple: correct.length > 1,
    options: opts.map((o, i) => ({ text: o.text, correct: correct.includes(letters[i]) })),
  }
}
