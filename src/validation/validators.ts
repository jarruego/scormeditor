import type { Course, Screen, Unit } from '../schema/course.schema'

export type Severity = 'error' | 'warning' | 'info'

export interface Issue {
  code: string
  severity: Severity
  message: string
  /** Ruta legible: "M1 › U1 › Pantalla 's-content'" */
  location: string
  screenId?: string
  unitId?: string
}

interface Ctx {
  course: Course
  push: (i: Issue) => void
}

function screenLoc(mTitle: string, uTitle: string, s: Screen) {
  return `${mTitle} › ${uTitle} › «${s.title || s.id}»`
}

// --- Reglas por pantalla -----------------------------------------------------
function checkScreen(ctx: Ctx, s: Screen, loc: string) {
  const add = (code: string, severity: Severity, message: string) =>
    ctx.push({ code, severity, message, location: loc, screenId: s.id })

  if (s.type === 'content_placeholder' || s.status === 'esqueleto_pendiente_desarrollo') {
    add('SKELETON', 'warning', 'Pantalla marcada como esqueleto / pendiente de desarrollo.')
  }
  if (!s.title.trim()) add('NO_TITLE', 'error', 'Pantalla sin título.')
  if (s.type !== 'cover' && s.type !== 'summary' && !s.objective.trim())
    add('NO_OBJECTIVE', 'warning', 'Pantalla sin objetivo de aprendizaje.')

  const vr = s.visual_resource
  if (vr.kind === 'image' && !vr.alt.trim())
    add('IMG_NO_ALT', 'error', 'Imagen sin texto alternativo (alt).')

  const isVideo = vr.kind === 'video_file' || vr.kind === 'video_youtube' || s.type === 'video'
  if (isVideo && !s.transcript.trim() && !(s.interaction?.config?.transcript))
    add('VIDEO_NO_TRANSCRIPT', 'error', 'Vídeo sin transcripción.')
  if (s.audio_src.trim() && !s.transcript.trim())
    add('AUDIO_NO_TRANSCRIPT', 'error', 'Audio de locución sin transcripción.')
  if ((vr.kind === 'video_file' || vr.kind === 'audio') && vr.has_voice && (vr.tracks || []).length === 0)
    add('MEDIA_NO_SUBS', 'error', 'Medio con voz sin subtítulos (VTT).')

  // Interacción
  const it = s.interaction
  if (it) {
    if (!it.learning_objective.trim())
      add('INT_NO_OBJECTIVE', 'warning', 'Interacción sin objetivo de aprendizaje vinculado.')
    const isQuestion = ['single_choice', 'true_false', 'classification', 'match_pairs', 'scenario_decision'].includes(it.type)
    if (isQuestion) {
      const hasCorrect =
        (it.options || []).some((o) => o.correct) ||
        (it.options || []).some((o) => o.group) // clasificación usa group
      if (!hasCorrect) add('Q_NO_CORRECT', 'error', 'Pregunta sin respuesta correcta definida.')
      if (!it.feedback.correct.trim() && !it.feedback.incorrect.trim())
        add('Q_NO_FEEDBACK', 'error', 'Pregunta sin feedback de acierto/error.')
    }
  }
}

// --- Reglas por unidad -------------------------------------------------------
function checkUnit(ctx: Ctx, u: Unit, mTitle: string) {
  const loc = `${mTitle} › ${u.title || u.id}`
  if (u.status === 'esqueleto_pendiente_desarrollo')
    ctx.push({ code: 'UNIT_SKELETON', severity: 'warning', message: 'Unidad marcada como esqueleto pendiente de desarrollo.', location: loc, unitId: u.id })
  const hasSummary = !!u.summary.trim() || u.screens.some((s) => s.type === 'summary')
  if (!hasSummary) ctx.push({ code: 'UNIT_NO_SUMMARY', severity: 'warning', message: 'Unidad sin resumen.', location: loc, unitId: u.id })

  const hasActivity = u.screens.some((s) => s.interaction) ||
    ctx.course.assessments.unit_tests.some((t) => t.unit_id === u.id)
  if (!hasActivity) ctx.push({ code: 'UNIT_NO_ACTIVITY', severity: 'warning', message: 'Unidad sin actividad ni test.', location: loc, unitId: u.id })

  // Notas editoriales como avisos
  u.screens.forEach((s) => {
    s.editor_notes.forEach((n) =>
      ctx.push({ code: 'EDITOR_NOTE', severity: 'info', message: `Nota editorial: ${n}`, location: screenLoc(mTitle, u.title || u.id, s), screenId: s.id }),
    )
  })
}

// --- Reglas SCORM / globales -------------------------------------------------
function checkGlobal(ctx: Ctx) {
  const c = ctx.course
  if (c.glossary.length === 0)
    ctx.push({ code: 'GLOSSARY_EMPTY', severity: 'warning', message: 'Glosario vacío.', location: 'Curso' })
  if (c.bibliography.length === 0)
    ctx.push({ code: 'BIBLIO_EMPTY', severity: 'warning', message: 'Bibliografía vacía.', location: 'Curso' })

  const rules = c.scorm.rules
  if (rules.score_source === 'final_test' && (!c.assessments.final_test || c.assessments.final_test.questions.length === 0))
    ctx.push({ code: 'SCORM_NO_FINAL', severity: 'error', message: 'La nota sale del test final pero no hay preguntas en el test final.', location: 'SCORM' })
  if (rules.score_source === 'unit_tests' && c.assessments.unit_tests.length === 0)
    ctx.push({ code: 'SCORM_NO_UNIT_TESTS', severity: 'error', message: 'La nota sale de tests por unidad pero no hay tests de unidad.', location: 'SCORM' })
  if (!c.scorm.identifier.trim())
    ctx.push({ code: 'SCORM_NO_ID', severity: 'error', message: 'Falta el identificador SCORM.', location: 'SCORM' })

  // Riesgo normativo: cobertura de objetivos sin evaluación
  const objectives = new Set<string>()
  const evaluatedObjectives = new Set<string>()
  c.modules.forEach((m) => m.units.forEach((u) => u.screens.forEach((s) => {
    if (s.objective.trim()) objectives.add(s.objective.trim())
    if (s.interaction?.scored && s.interaction.learning_objective)
      evaluatedObjectives.add(s.interaction.learning_objective.trim())
  })))
  c.assessments.final_test?.questions.forEach((q) => q.learning_objective && evaluatedObjectives.add(q.learning_objective.trim()))
  const uncovered = [...objectives].filter((o) => !evaluatedObjectives.has(o))
  if (uncovered.length > 0)
    ctx.push({ code: 'OBJ_NOT_EVALUATED', severity: 'info', message: `${uncovered.length} objetivo(s) sin evaluación asociada (riesgo para revisión normativa).`, location: 'Trazabilidad' })
}

export interface ValidationResult {
  issues: Issue[]
  errors: number
  warnings: number
  infos: number
  ok: boolean
}

export function validateCourse(course: Course): ValidationResult {
  const issues: Issue[] = []
  const ctx: Ctx = { course, push: (i) => issues.push(i) }

  course.modules.forEach((m) => {
    m.units.forEach((u) => {
      checkUnit(ctx, u, m.title || m.id)
      u.screens.forEach((s) => checkScreen(ctx, s, screenLoc(m.title || m.id, u.title || u.id, s)))
    })
  })
  checkGlobal(ctx)

  const errors = issues.filter((i) => i.severity === 'error').length
  const warnings = issues.filter((i) => i.severity === 'warning').length
  const infos = issues.filter((i) => i.severity === 'info').length
  return { issues, errors, warnings, infos, ok: errors === 0 }
}
