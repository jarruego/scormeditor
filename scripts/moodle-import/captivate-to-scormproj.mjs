/**
 * Convierte las actividades `mod_scorm` de un backup Moodle cuyo paquete es un
 * curso de Adobe Captivate (HTML5) en un `.scormproj` por paquete.
 *
 * Uso:
 *   node scripts/moodle-import/captivate-to-scormproj.mjs <backupDir> <outDir> \
 *        [--prefix manip] [--unit 12]
 *
 * - Cada diapositiva normal → pantalla `content` (texto en markdown ligero, imágenes
 *   propias de la diapositiva; los adornos repetidos —logos, cabeceras— se descartan).
 * - Las diapositivas de pregunta (`Question Slide`) → `assessments.final_test`
 *   (verdadero/falso u opción única), igual que los cuestionarios del resto de
 *   unidades: el test calificable va solo en `final_test`.
 * - Título del proyecto: el de la actividad Moodle (`TEMA 12.1.- ...`).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { createHash as hash } from 'node:crypto'
import JSZip from 'jszip'
import { parseCaptivate, captivateHtmlToMd } from './captivate-parse.mjs'
import { slugify, physicalFilePath } from './moodle-parse.mjs'

const args = process.argv.slice(2)
const flag = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : null)
const [backupDir, outDir] = args
const prefix = (flag('--prefix') || 'curso').toLowerCase()
const unitNo = flag('--unit') || '12'
if (!backupDir || !outDir || !existsSync(backupDir)) {
  console.error('Uso: node captivate-to-scormproj.mjs <backupDir> <outDir> [--prefix xxx] [--unit 12]')
  process.exit(1)
}
mkdirSync(outDir, { recursive: true })

const dec = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&')
const tag = (x, t) => (x.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`)) || [])[1] || ''

// ---- actividades mod_scorm del backup -------------------------------------------
const scorms = []
for (const d of readdirSync(join(backupDir, 'activities')).filter((d) => d.startsWith('scorm_'))) {
  const x = readFileSync(join(backupDir, 'activities', d, 'scorm.xml'), 'utf8')
  scorms.push({ dir: d, name: dec(tag(x, 'name')).trim(), sha1: tag(x, 'sha1hash'), moduleid: Number(d.split('_')[1]) })
}
scorms.sort((a, b) => a.moduleid - b.moduleid)

const report = []
for (const [idx, sc] of scorms.entries()) {
  const pkgPath = physicalFilePath(backupDir, sc.sha1)
  if (!existsSync(pkgPath)) {
    console.log(`✗ ${sc.name}: paquete ${sc.sha1} no encontrado`)
    continue
  }
  const tmp = join(outDir, '.tmp-' + sc.sha1)
  const zip = await JSZip.loadAsync(readFileSync(pkgPath))
  for (const [p, f] of Object.entries(zip.files)) {
    if (f.dir || !/^(assets\/js\/CPM\.js|dr\/.*\.json)$/.test(p)) continue
    const out = join(tmp, p)
    mkdirSync(join(out, '..'), { recursive: true })
    writeFileSync(out, await f.async('nodebuffer'))
  }
  const built = buildProject(sc, idx + 1, parseCaptivate(tmp))
  const z = new JSZip()
  z.file('course.json', JSON.stringify(built.course, null, 2))
  for (const a of built.assets) z.file(a.zipPath, a.data)
  const outPath = join(outDir, `${built.course.course.id}.scormproj`)
  writeFileSync(outPath, await z.generateAsync({ type: 'nodebuffer', compression: 'STORE' }))
  report.push({ proyecto: sc.name.slice(0, 60), pantallas: built.screens, preguntas: built.questions, imágenes: built.assets.length })
  console.log(`✓ ${outPath}`)
}
console.table(report)

// ----------------------------------------------------------------------------------

function buildProject(sc, n, { slides, images }) {
  // «TEMA 12.1.- IMPORTANCIA DEL…» → «Tema 12.1. Importancia del…»
  const nice = sc.name
    .replace(/\.\s*$/, '')
    .replace(/^TEMA\s+([\d.]+)\s*\.?-\s*/i, '')
    .trim()
  const title = capitalize(nice.toLowerCase())
  const subNo = (sc.name.match(/TEMA\s+([\d.]+)/i) || [])[1]?.replace(/\.$/, '') || `${unitNo}.${n}`
  const slug = slugify(title)
  const courseId = `${prefix}-u${subNo.replace('.', '-')}-${slug}`.slice(0, 80)
  const uid = `u${subNo.replace('.', '_')}`

  // Imágenes: se descartan las que se repiten en ≥3 diapositivas (logos/cabeceras)
  // o miden ≤60 px de alto.
  const uses = new Map()
  slides.forEach((s) => s.items.forEach((i) => i.img && uses.set(i.img, (uses.get(i.img) || 0) + 1)))
  const keepImg = (src) => {
    const m = src.match(/_(\d+)_(\d+)\.\w+$/)
    const h = m ? Number(m[2]) : 999
    return (uses.get(src) || 0) < 3 && h > 60 && images.has(src)
  }
  const assets = []
  const assetFor = (src) => {
    const data = images.get(src)
    const hs = hash('sha1').update(data).digest('hex').slice(0, 6)
    const ext = src.split('.').pop()
    const zipPath = `assets/img/${slugify(subNo)}-${src.split('/').pop().replace(/\.\w+$/, '')}-${hs}.${ext}`
    if (!assets.some((a) => a.zipPath === zipPath)) assets.push({ zipPath, data })
    return zipPath
  }

  let seq = 0
  const nextId = () => `s${String(++seq).padStart(3, '0')}`
  const screens = []
  const questions = []
  let k = 0
  let lastTitle = ''
  let cont = 0
  for (const sl of slides) {
    if (sl.kind === 'question') {
      if (sl.q.options.length >= 2 && sl.q.options.some((o) => o.correct)) questions.push(sl.q)
      continue
    }
    const texts = sl.items.filter((i) => i.type === 19).map((i) => tidy(captivateHtmlToMd(i.vt)))
    const heading = sl.items.find((i) => i.type === 589)
    const isCover = texts.length === 0 && k === 0
    k += 1
    const picks = sl.items.filter((i) => i.img && keepImg(i.img)).map((i) => assetFor(i.img))
    let body = texts.filter(Boolean).join('\n\n')
    if (isCover) {
      body = tidy(captivateHtmlToMd(heading?.vt || '')).replace(/^\*\*(.+?)\*\*\s*/, '').trim()
    }
    // el subtítulo repetido del tema no aporta como cuerpo
    if (!isCover && /^Tema\s+\d+\./i.test(body.split('\n')[0] || '') && texts.length > 1) {
      body = texts.slice(1).filter(Boolean).join('\n\n')
    }
    let { title: sTitle, rest } = splitTitle(body)
    if (isCover) { sTitle = title; rest = body }
    if (sTitle) { lastTitle = sTitle; cont = 0 }
    else if (lastTitle) { cont += 1; sTitle = `${lastTitle} (continuación${cont > 1 ? ' ' + cont : ''})` }
    else sTitle = title
    let visual = { kind: 'none' }
    let text = rest
    if (picks.length === 1) visual = { kind: 'image', src: picks[0], alt: sTitle, layout: 'top' }
    else if (picks.length > 1) text = `${rest}\n\n${picks.map((p) => `![${sTitle}](${p})`).join('\n\n')}`.trim()
    if (!text.trim() && visual.kind === 'none') continue
    screens.push({
      id: nextId(),
      type: 'content',
      title: sTitle,
      objective: '',
      student_text: text,
      source_refs: [{ doc: `Moodle: ${sc.name}`, locator: `diapositiva ${k}`, transform: 'conservación' }],
      visual_resource: visual,
      interaction: null,
      interaction_layout: 'bottom',
      required: true,
      min_time_seconds: 0,
      audio_src: '',
      transcript: '',
      editor_notes: picks.length ? ['Imagen sin texto alternativo: revisar accesibilidad.'] : [],
      status: 'ok',
    })
  }

  const finalTest = questions.length
    ? {
        id: 'A01',
        title: 'Autoevaluación',
        instructions: '',
        questions: questions.map((q, i) => buildQuestion(q, i)),
        pass_score: 60,
        one_question_per_screen: false,
        unit_id: `${uid}_t00`,
      }
    : null

  const course = {
    schema_version: '1.0.0',
    course: {
      id: courseId,
      title: `Tema ${subNo}. ${title}`,
      subtitle: `SCO independiente del Tema ${subNo}`,
      description: `Tema rehecho desde el paquete Captivate de la actividad Moodle «${sc.name}». Revisar objetivos de aprendizaje (vacíos) y la maquetación de listas antes de publicar.`,
      authoring_entity: '',
      source_document: `Moodle: ${sc.name} (paquete Captivate)`,
      estimated_hours: Math.max(1, Math.round(screens.length / 12)),
      language: 'es',
    },
    scorm: {
      version: '1.2',
      identifier: courseId.toUpperCase().replace(/-/g, '_'),
      title: `Tema ${subNo} - ${title}`,
      mastery_score: 60,
      rules: {
        min_required_screens_pct: 100,
        require_interactions: true,
        min_score: 60,
        attempts_allowed: 0,
        score_source: 'final_test',
        mixed_final_weight: 70,
        navigation: 'mixed',
        allow_resume: true,
      },
    },
    shell: {},
    narration: { mode: 'auto' },
    modules: [
      {
        id: `m${subNo.replace('.', '_')}`,
        title: `Tema ${subNo} - ${title}`,
        screens: [],
        units: [{ id: `${uid}_t00`, title: `Tema ${subNo}. ${title}`, summary: '', status: 'ok', screens }],
      },
    ],
    assessments: { unit_tests: [], final_test: finalTest },
    glossary: [],
    glossary_title: 'Glosario',
    bibliography: [],
    bibliography_title: 'Recursos y bibliografía',
    quality_checklist: {},
  }
  return { course, assets, screens: screens.length, questions: questions.length }

  function buildQuestion(q, i) {
    const id = `Q${String(i + 1).padStart(2, '0')}`
    const prompt = q.prompt.replace(/^\s*\d+\s*[.\-)]+\s*/, '').trim()
    const isTf = q.options.length === 2 && q.options.every((o) => /^(verdadero|falso)$/i.test(o.text.trim()))
    return {
      id,
      prompt,
      type: isTf ? 'true_false' : q.multiple ? 'multiple_choice' : 'single_choice',
      options: q.options.map((o, j) => ({ id: `${id}_o${j + 1}`, text: isTf ? capitalize(o.text.trim().toLowerCase()) : o.text.trim(), correct: o.correct })),
      feedback: { correct: 'Correcto.', incorrect: 'Revisa el contenido del tema.', explanation: '' },
      points: 1,
      learning_objective: '',
      source_refs: [{ doc: `Moodle: ${sc.name}`, locator: `pregunta ${i + 1}`, transform: 'conservación' }],
    }
  }
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1) }

/** Quita viñetas vacías y convierte «- Encabezado:» seguido de viñetas en negrita. */
function tidy(md) {
  const lines = md.split('\n').filter((l) => l.trim() !== '-')
  return lines
    .map((l, i) => {
      const m = l.match(/^- (.{3,90}:)$/)
      return m && /^- /.test(lines[i + 1] || '') ? `**${m[1]}**` : l
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Título de pantalla: primera línea toda en negrita, o encabezado terminado en «:». */
function splitTitle(md) {
  const lines = md.split('\n')
  const first = (lines[0] || '').trim()
  let m = first.match(/^\*\*(.{3,100}?)\*\*$/)
  if (m) return { title: m[1].replace(/[:.]+$/, '').trim(), rest: lines.slice(1).join('\n').trim() }
  m = first.match(/^(?:- )?(.{3,90}):$/)
  if (m && lines.length > 1) return { title: m[1].replace(/\*+/g, '').trim(), rest: lines.slice(1).join('\n').trim() }
  m = first.match(/^(Tema\s+\d+\..{3,100}?)[:.]?$/)
  if (m && lines.length > 1) return { title: m[1].trim(), rest: lines.slice(1).join('\n').trim() }
  return { title: '', rest: md }
}
