import type { Course } from '../schema/course.schema'
import { screenContainers } from '../schema/traverse'
import { validateCourse, type Issue, type ValidationResult } from '../validation/validators'

export interface Counts {
  modules: number
  units: number
  screens: number
  interactions: number
  questions: number
}

function counts(course: Course): Counts {
  let units = 0, screens = 0, interactions = 0
  screenContainers(course).forEach(({ unit, screens: ss }) => {
    if (unit) units++
    ss.forEach((s) => { screens++; if (s.interaction) interactions++ })
  })
  const questions =
    (course.assessments.final_test?.questions.length ?? 0) +
    course.assessments.unit_tests.reduce((a, t) => a + t.questions.length, 0)
  return { modules: course.modules.length, units, screens, interactions, questions }
}

export interface MatrixRow {
  objective: string
  /** Ubicación módulo › unidad ('—' para el test final). */
  path: string
  screen: string
  interaction: string
  evaluation: string
  /** Pantalla enlazable en el editor ('__final__' para el test final). */
  screenId?: string
}

function traceabilityMatrix(course: Course): MatrixRow[] {
  const rows: MatrixRow[] = []
  screenContainers(course).forEach(({ module: m, unit: u, screens }) => {
    const path = u ? `${m.title || m.id} › ${u.title || u.id}` : m.title || m.id
    screens.forEach((s) => {
      if (!s.objective && !s.interaction) return
      rows.push({
        objective: s.objective || '—',
        path,
        screen: `${s.title || s.id} (${s.type})`,
        interaction: s.interaction ? s.interaction.type : '—',
        evaluation: s.interaction?.scored ? `Sí (${s.interaction.points} pts)` : 'No',
        screenId: s.id,
      })
    })
    // Tests de unidad: se enlazan a la primera pantalla de su unidad.
    if (u) course.assessments.unit_tests.filter((t) => t.unit_id === u.id).forEach((t) =>
      t.questions.forEach((q) => rows.push({
        objective: q.learning_objective || '—',
        path,
        screen: `Test de unidad «${t.title || t.id}»`,
        interaction: q.type,
        evaluation: `Sí (${q.points} pts)`,
        screenId: u.screens[0]?.id,
      })))
  })
  course.assessments.final_test?.questions.forEach((q) => {
    rows.push({ objective: q.learning_objective || '—', path: '—', screen: 'Test final', interaction: q.type, evaluation: `Sí (${q.points} pts)`, screenId: '__final__' })
  })
  return rows
}

export interface QARow {
  question: string
  correct: string
  objective: string
  /** De dónde sale la pregunta (pantalla, test de unidad o test final). */
  origin: string
  screenId?: string
}

function qaTable(course: Course): QARow[] {
  const rows: QARow[] = []
  const collect = (prompt: string, options: { text: string; correct?: boolean }[], obj: string, origin: string, screenId?: string) => {
    const correct = options.filter((o) => o.correct).map((o) => o.text).join(', ') || '—'
    rows.push({ question: prompt, correct, objective: obj || '—', origin, screenId })
  }
  screenContainers(course).forEach(({ unit: u, screens }) => {
    screens.forEach((s) => {
      const it = s.interaction
      if (it && (it.options || []).some((o) => o.correct))
        collect(it.prompt, it.options, s.objective, s.title || s.id, s.id)
    })
    if (u) course.assessments.unit_tests.filter((t) => t.unit_id === u.id).forEach((t) =>
      t.questions.forEach((q) =>
        collect(q.prompt, q.options, q.learning_objective, `Test de unidad «${t.title || t.id}»`, u.screens[0]?.id)))
  })
  course.assessments.final_test?.questions.forEach((q) =>
    collect(q.prompt, q.options, q.learning_objective, 'Test final', '__final__'))
  return rows
}

const ACCESSIBILITY_CHECKS = [
  { code: 'IMG_NO_ALT', label: 'Todas las imágenes tienen texto alternativo' },
  { code: 'VIDEO_NO_TRANSCRIPT', label: 'Todos los vídeos tienen transcripción' },
  { code: 'MEDIA_NO_SUBS', label: 'Medios con voz tienen subtítulos VTT' },
]
const INTERACTIVITY_CHECKS = [
  { code: 'UNIT_NO_ACTIVITY', label: 'Todas las unidades tienen actividad o test' },
  { code: 'Q_NO_FEEDBACK', label: 'Todas las preguntas tienen feedback' },
  { code: 'INT_NO_OBJECTIVE', label: 'Interacciones vinculadas a un objetivo' },
]
const SCORM_CHECKS = [
  { code: 'SCORM_NO_ID', label: 'Identificador SCORM definido' },
  { code: 'SCORM_NO_FINAL', label: 'Origen de la nota coherente con el contenido' },
  { code: 'Q_NO_CORRECT', label: 'Todas las preguntas tienen respuesta correcta' },
]

export interface ChecklistItem { code: string; label: string; failed: boolean }
export interface Checklist { label: string; items: ChecklistItem[] }

function buildChecklists(issues: Issue[]): Checklist[] {
  const build = (label: string, defs: { code: string; label: string }[]): Checklist => ({
    label,
    items: defs.map((d) => ({ ...d, failed: issues.some((i) => i.code === d.code) })),
  })
  return [
    build('Accesibilidad', ACCESSIBILITY_CHECKS),
    build('Interactividad', INTERACTIVITY_CHECKS),
    build('SCORM / Moodle', SCORM_CHECKS),
  ]
}

/**
 * Modelo estructurado del informe: única fuente para el render interactivo de
 * `ReportPanel` (con enlaces al editor vía `screenId`) y para las exportaciones
 * Markdown/HTML/PDF.
 */
export interface ReportData {
  counts: Counts
  validation: ValidationResult
  matrix: MatrixRow[]
  qa: QARow[]
  checklists: Checklist[]
  /** Errores (riesgos bloqueantes). */
  risks: Issue[]
  /** Avisos (pendientes de validación por la entidad). */
  pending: Issue[]
}

export function buildReport(course: Course): ReportData {
  const validation = validateCourse(course)
  return {
    counts: counts(course),
    validation,
    matrix: traceabilityMatrix(course),
    qa: qaTable(course),
    checklists: buildChecklists(validation.issues),
    risks: validation.issues.filter((i) => i.severity === 'error'),
    pending: validation.issues.filter((i) => i.severity === 'warning'),
  }
}

/** Neutraliza caracteres que romperían una celda de tabla Markdown. */
function mdCell(s: string): string {
  return String(s ?? '').replace(/\|/g, '¦').replace(/\s*\n\s*/g, ' ')
}

function checklistMd(list: Checklist): string {
  const rows = list.items.map((d) => `| ${d.failed ? '❌' : '✅'} | ${mdCell(d.label)} |`).join('\n')
  return `### ${list.label}\n\n| Estado | Criterio |\n|:---:|---|\n${rows}\n`
}

/** Genera el informe de revisión en Markdown. */
export function generateReportMarkdown(course: Course): string {
  const { counts: c, matrix, qa, checklists, risks, pending } = buildReport(course)

  const md: string[] = []
  md.push(`# Informe de revisión — ${course.course.title || 'Curso'}\n`)
  md.push(`> Documento de apoyo a la revisión interna. **No constituye homologación ni acreditación oficial**; queda pendiente de validación por la entidad y la administración competente.\n`)

  md.push(`## 1. Datos generales\n`)
  md.push(`- **Título:** ${course.course.title}`)
  md.push(`- **Entidad:** ${course.course.authoring_entity || '—'}`)
  md.push(`- **Fuente documental:** ${course.course.source_document || '—'}`)
  md.push(`- **Idioma:** ${course.course.language}`)
  md.push(`- **Duración estimada:** ${course.course.estimated_hours || '—'} h`)
  md.push(`- **SCORM:** ${course.scorm.version} · id \`${course.scorm.identifier}\` · nota mínima ${course.scorm.rules.min_score}%\n`)

  md.push(`## 2. Estructura\n`)
  md.push(`| Módulos | Unidades | Pantallas | Interacciones | Preguntas |`)
  md.push(`|:---:|:---:|:---:|:---:|:---:|`)
  md.push(`| ${c.modules} | ${c.units} | ${c.screens} | ${c.interactions} | ${c.questions} |\n`)

  md.push(`## 3. Matriz de trazabilidad (objetivo ↔ pantalla ↔ interacción ↔ evaluación)\n`)
  md.push(`| Objetivo | Ubicación | Pantalla | Interacción | Evaluado |`)
  md.push(`|---|---|---|---|---|`)
  matrix.forEach((r) => md.push(`| ${mdCell(r.objective)} | ${mdCell(r.path)} | ${mdCell(r.screen)} | ${mdCell(r.interaction)} | ${mdCell(r.evaluation)} |`))
  md.push('')

  md.push(`## 4. Preguntas y respuestas correctas\n`)
  md.push(`| Pregunta | Origen | Respuesta correcta | Objetivo |`)
  md.push(`|---|---|---|---|`)
  qa.forEach((r) => md.push(`| ${mdCell(r.question)} | ${mdCell(r.origin)} | ${mdCell(r.correct)} | ${mdCell(r.objective)} |`))
  md.push('')

  md.push(`## 5. Checklists\n`)
  checklists.forEach((list) => md.push(checklistMd(list)))

  md.push(`## 6. Riesgos detectados (errores)\n`)
  if (risks.length === 0) md.push(`_Sin errores bloqueantes._`)
  else risks.forEach((i) => md.push(`- **[${i.code}]** ${i.message} — _${i.location}_`))
  md.push('')

  md.push(`## 7. Pendientes de validación normativa / por la entidad\n`)
  if (pending.length === 0) md.push(`_Sin avisos._`)
  else pending.forEach((i) => md.push(`- **[${i.code}]** ${i.message} — _${i.location}_`))
  md.push('')
  md.push(`> **Pendiente de revisión por la entidad** y, en su caso, de alineación con criterios del SEPE o administración competente.\n`)

  return md.join('\n')
}

/** Envuelve el Markdown en un HTML imprimible/exportable a PDF (vía navegador). */
export function generateReportHtml(course: Course): string {
  const md = generateReportMarkdown(course)
  // Conversión MD→HTML mínima para tablas/encabezados/listas
  const html = mdToHtml(md)
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Informe — ${escape(course.course.title)}</title>
<style>
  body{font-family:system-ui,sans-serif;max-width:900px;margin:2rem auto;padding:0 1rem;color:#1b1f24;line-height:1.5}
  h1{border-bottom:3px solid #0b5fff;padding-bottom:.3rem}
  table{border-collapse:collapse;width:100%;margin:1rem 0;font-size:.9rem}
  th,td{border:1px solid #dce0e6;padding:.4rem .6rem;text-align:left;vertical-align:top}
  th{background:#f0f4ff}
  blockquote{background:#fff8e6;border-left:4px solid #d09a00;margin:1rem 0;padding:.5rem 1rem}
  code{background:#eef;padding:.1rem .3rem;border-radius:4px}
  @media print{body{margin:0}}
</style></head><body>${html}</body></html>`
}

// Conversor Markdown→HTML mínimo (encabezados, tablas, listas, negrita, blockquote)
function mdToHtml(md: string): string {
  const lines = md.split('\n')
  let html = '', i = 0
  const inline = (s: string) =>
    escape(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>')
  while (i < lines.length) {
    const ln = lines[i]
    if (/^\|/.test(ln) && /^\|[-: |]+\|$/.test(lines[i + 1] || '')) {
      const header = ln.split('|').slice(1, -1).map((c) => `<th>${inline(c.trim())}</th>`).join('')
      i += 2
      let body = ''
      while (i < lines.length && /^\|/.test(lines[i])) {
        const cells = lines[i].split('|').slice(1, -1).map((c) => `<td>${inline(c.trim())}</td>`).join('')
        body += `<tr>${cells}</tr>`; i++
      }
      html += `<table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`
      continue
    }
    const h = /^(#{1,4})\s+(.*)/.exec(ln)
    if (h) { html += `<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`; i++; continue }
    if (/^>\s?/.test(ln)) { html += `<blockquote>${inline(ln.replace(/^>\s?/, ''))}</blockquote>`; i++; continue }
    if (/^-\s+/.test(ln)) {
      let items = ''
      while (i < lines.length && /^-\s+/.test(lines[i])) { items += `<li>${inline(lines[i].replace(/^-\s+/, ''))}</li>`; i++ }
      html += `<ul>${items}</ul>`; continue
    }
    if (ln.trim()) html += `<p>${inline(ln)}</p>`
    i++
  }
  return html
}

function escape(s: string) {
  return String(s ?? '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] as string))
}
