/**
 * Lectura de un backup Moodle (formato moodle2, sin descomprimir el .mbz/.tar.gz:
 * se asume ya extraído en una carpeta) y utilidades de HTML → markdown ligero
 * de SCORMEditor. Sin dependencias de un curso concreto: cualquier backup con
 * actividades "lesson"/"quiz" agrupadas en secciones sirve de entrada.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

function tag(str, t) {
  const m = str.match(new RegExp(`<${t}(?:\\s[^>]*)?>([\\s\\S]*?)</${t}>`))
  return m ? m[1] : ''
}
function tagAll(str, t) {
  return [...str.matchAll(new RegExp(`<${t}(?:\\s[^>]*)?>([\\s\\S]*?)</${t}>`, 'g'))].map((m) => m[1])
}
function attr(openTag, name) {
  const m = openTag.match(new RegExp(`${name}="([^"]*)"`))
  return m ? m[1] : ''
}

// Des-escapa entidades XML (el backup guarda el HTML de origen escapado una vez
// dentro de <contents>/<questiontext>/etc.). NO decodifica entidades HTML como
// &nbsp; aquí: eso lo hace decodeHtmlEntities() sobre el HTML ya “real”.
export function unescapeXml(s) {
  return String(s ?? '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

export function decodeHtmlEntities(s) {
  return String(s ?? '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&aacute;/g, 'á').replace(/&eacute;/g, 'é').replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó').replace(/&uacute;/g, 'ú').replace(/&ntilde;/g, 'ñ')
    .replace(/&Aacute;/g, 'Á').replace(/&Eacute;/g, 'É').replace(/&Iacute;/g, 'Í')
    .replace(/&Oacute;/g, 'Ó').replace(/&Uacute;/g, 'Ú').replace(/&Ntilde;/g, 'Ñ')
    .replace(/&iquest;/g, '¿').replace(/&iexcl;/g, '¡')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
}

/** Nombre real del curso (moodle_backup.xml), para etiquetar source_refs/description. */
export function parseCourseInfo(backupDir) {
  const xml = readFileSync(join(backupDir, 'moodle_backup.xml'), 'utf-8')
  return {
    fullname: decodeHtmlEntities(unescapeXml(tag(xml, 'original_course_fullname'))).trim(),
    shortname: decodeHtmlEntities(unescapeXml(tag(xml, 'original_course_shortname'))).trim(),
  }
}

/** Secciones del curso, ordenadas por <number> (orden real en Moodle). */
export function parseSections(backupDir) {
  const dir = join(backupDir, 'sections')
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name, 'section.xml')
    if (!existsSync(p)) continue
    const xml = readFileSync(p, 'utf-8')
    const idMatch = xml.match(/<section id="(\d+)">/)
    out.push({
      sectionid: idMatch ? idMatch[1] : name.replace('section_', ''),
      number: Number(tag(xml, 'number') || '0'),
      name: decodeHtmlEntities(unescapeXml(tag(xml, 'name'))).trim(),
      sequence: (tag(xml, 'sequence') || '').split(',').map((s) => s.trim()).filter(Boolean),
    })
  }
  out.sort((a, b) => a.number - b.number)
  return out
}

/** moduleid -> { modulename, directory, sectionid, title } desde moodle_backup.xml */
export function parseActivitiesIndex(backupDir) {
  const xml = readFileSync(join(backupDir, 'moodle_backup.xml'), 'utf-8')
  const block = xml.match(/<activities>([\s\S]*?)<\/activities>/)[1]
  const acts = tagAll(block, 'activity')
  const index = new Map()
  for (const a of acts) {
    index.set(tag(a, 'moduleid'), {
      modulename: tag(a, 'modulename'),
      directory: tag(a, 'directory'),
      sectionid: tag(a, 'sectionid'),
      title: decodeHtmlEntities(unescapeXml(tag(a, 'title'))).trim(),
    })
  }
  return index
}

/** Quita marcas de trabajo interno moodle ("(MODIFICAR)", "(BORRAR)") de un título. */
export function stripWorkMarkers(title) {
  const markers = /^\s*\(\s*(MODIFICAR|BORRAR|REVISAR|PENDIENTE)\s*\)\s*/i
  let clean = title
  let hadMarker = false
  while (markers.test(clean)) {
    hadMarker = true
    clean = clean.replace(markers, '')
  }
  return { title: clean.trim().replace(/\s{2,}/g, ' '), hadMarker }
}

/** Páginas (en orden real, siguiendo nextpageid) de una actividad "lesson". */
export function parseLessonPages(lessonXmlPath) {
  const xml = readFileSync(lessonXmlPath, 'utf-8')
  const pagesBlock = tag(xml, 'pages')
  const rawPages = tagAll(pagesBlock, 'page').map((p) => ({
    id: (p.match(/^\s*<id>(\d+)<\/id>/) || [])[1] || null,
    prevpageid: tag(p, 'prevpageid'),
    nextpageid: tag(p, 'nextpageid'),
    qtype: tag(p, 'qtype'),
    title: decodeHtmlEntities(unescapeXml(tag(p, 'title'))).trim(),
    contents: decodeHtmlEntities(unescapeXml(tag(p, 'contents'))),
  }))
  // El id real de <page id="NNNN"> no lo captura tag() (tiene atributo); lo re-extraemos aparte.
  const idsInOrder = [...pagesBlock.matchAll(/<page id="(\d+)">/g)].map((m) => m[1])
  rawPages.forEach((p, i) => { p.id = idsInOrder[i] })

  const byPrev = new Map(rawPages.map((p) => [p.prevpageid, p]))
  const ordered = []
  let cursor = byPrev.get('0')
  const seen = new Set()
  while (cursor && !seen.has(cursor.id)) {
    seen.add(cursor.id)
    ordered.push(cursor)
    cursor = byPrev.get(cursor.id)
  }
  // Red de seguridad: si el enlazado prev/next está roto, cae al orden de aparición.
  return ordered.length === rawPages.length ? ordered : rawPages
}

/** Banco de preguntas del backup: questionbankentryid -> pregunta normalizada. */
export function parseQuestionBank(backupDir) {
  const xml = readFileSync(join(backupDir, 'questions.xml'), 'utf-8')
  const entries = [...xml.matchAll(/<question_bank_entry id="(\d+)">([\s\S]*?)<\/question_bank_entry>/g)]
  const bank = new Map()
  for (const [, entryId, block] of entries) {
    const qBlock = tag(block, 'questions')
    const qXmls = tagAll(qBlock, 'question')
    if (qXmls.length === 0) continue
    const q = qXmls[0] // primera/única versión
    const qtype = tag(q, 'qtype')
    const name = decodeHtmlEntities(unescapeXml(tag(q, 'name'))).trim()
    const questiontext = decodeHtmlEntities(unescapeXml(tag(q, 'questiontext')))
    const generalfeedback = decodeHtmlEntities(unescapeXml(tag(q, 'generalfeedback')))
    let type = null
    let answers = []
    let correctFeedback = '', incorrectFeedback = ''
    if (qtype === 'multichoice') {
      const plugin = tag(q, 'plugin_qtype_multichoice_question')
      const single = tag(plugin, 'single') // dentro de <multichoice>, pero single también válido buscar directo
      const mc = tag(plugin, 'multichoice')
      const isSingle = tag(mc, 'single') !== '0'
      type = isSingle ? 'single_choice' : 'multiple_choice'
      correctFeedback = decodeHtmlEntities(unescapeXml(tag(mc, 'correctfeedback')))
      incorrectFeedback = decodeHtmlEntities(unescapeXml(tag(mc, 'incorrectfeedback')))
      const answersBlock = tag(plugin, 'answers')
      answers = tagAll(answersBlock, 'answer').map((a) => ({
        text: decodeHtmlEntities(unescapeXml(tag(a, 'answertext'))),
        fraction: parseFloat(tag(a, 'fraction') || '0'),
        feedback: decodeHtmlEntities(unescapeXml(tag(a, 'feedback'))),
      }))
    } else if (qtype === 'truefalse') {
      type = 'true_false'
      const plugin = tag(q, 'plugin_qtype_truefalse_question')
      const answersBlock = tag(plugin, 'answers')
      answers = tagAll(answersBlock, 'answer').map((a) => ({
        text: decodeHtmlEntities(unescapeXml(tag(a, 'answertext'))),
        fraction: parseFloat(tag(a, 'fraction') || '0'),
        feedback: decodeHtmlEntities(unescapeXml(tag(a, 'feedback'))),
      }))
    }
    bank.set(entryId, { name, questiontext, generalfeedback, qtype, type, answers, correctFeedback, incorrectFeedback })
  }
  return bank
}

/**
 * Preguntas de un quiz (quiz.xml), en orden de slot, resueltas contra el banco.
 * Solo se admiten los qtype que `parseQuestionBank` sabe traducir (`type` no
 * nulo: multichoice/truefalse). Cualquier otro tipo de pregunta de Moodle
 * (`match`, `shortanswer`, `essay`, `numerical`...) se DESCARTA aquí — antes
 * se colaba como `single_choice` con `options: []` (pregunta sin respuesta
 * correcta, inválida) porque nada filtraba por `type`. Devuelve también
 * `skipped` para que el llamante pueda avisar de qué se quedó fuera.
 */
export function parseQuizQuestions(quizXmlPath, questionBank) {
  const xml = readFileSync(quizXmlPath, 'utf-8')
  const instancesBlock = tag(xml, 'question_instances')
  const instances = tagAll(instancesBlock, 'question_instance')
  const out = []
  const skipped = []
  for (const inst of instances) {
    const slot = Number(tag(inst, 'slot') || '0')
    const refBlock = tag(inst, 'question_reference')
    const entryId = tag(refBlock, 'questionbankentryid')
    const q = questionBank.get(entryId)
    if (!q) continue
    if (!q.type) {
      skipped.push({ slot, name: q.name, qtype: q.qtype })
      continue
    }
    out.push({ slot, ...q })
  }
  out.sort((a, b) => a.slot - b.slot)
  return { questions: out, skipped }
}

/** contenthash -> [{component, filearea, itemid, filename, mimetype}], mod_lesson/mod_quiz solamente. */
export function parseFilesIndex(backupDir) {
  const xml = readFileSync(join(backupDir, 'files.xml'), 'utf-8')
  const files = tagAll(xml, 'file')
  // Clave de búsqueda: component|filearea|itemid|filename -> hash+mimetype
  const byRef = new Map()
  for (const f of files) {
    const component = tag(f, 'component')
    if (component !== 'mod_lesson' && component !== 'mod_quiz') continue
    const filename = decodeHtmlEntities(unescapeXml(tag(f, 'filename')))
    if (!filename || filename === '.') continue
    const mimetype = tag(f, 'mimetype')
    if (!mimetype || mimetype === '$@NULL@$') continue
    const filearea = tag(f, 'filearea')
    const itemid = tag(f, 'itemid')
    const contenthash = tag(f, 'contenthash')
    byRef.set(`${component}|${filearea}|${itemid}|${filename}`, { contenthash, mimetype, filename })
  }
  return byRef
}

export function physicalFilePath(backupDir, contenthash) {
  return join(backupDir, 'files', contenthash.slice(0, 2), contenthash)
}

export function extFromMime(mimetype) {
  const map = {
    'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif',
    'image/svg+xml': 'svg', 'image/webp': 'webp', 'application/pdf': 'pdf',
  }
  return map[mimetype] || 'bin'
}

export function slugify(text) {
  return String(text)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'x'
}
