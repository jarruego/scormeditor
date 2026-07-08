import type { Course, QuizQuestion, Screen, Unit } from '../schema/course.schema'
import { normalizeObjective } from './objectives'
import { buildTranscript } from '../tts/buildTranscript'

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
  /** El curso es narrado: activa los avisos de narración pendiente. Manda el
   *  ajuste explícito `course.narration.mode` ('on'/'off'); en 'auto' (default)
   *  se deduce de que alguna pantalla tenga `audio_src` — sin locución, un
   *  curso sin transcripciones es perfectamente legítimo y no debe generar ruido. */
  narrated: boolean
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

  // Congruencia tipo ↔ recurso ↔ interacción: avisos (no bloquean) para
  // combinaciones que casi siempre son un despiste del autor.
  if (s.type === 'cover' && s.interaction)
    add('COVER_INTERACTION', 'warning', 'La portada lleva una actividad: se recomienda moverla a una pantalla propia.')
  if (s.type === 'video' &&
      s.visual_resource.kind !== 'video_file' && s.visual_resource.kind !== 'video_youtube' &&
      s.interaction?.type !== 'video')
    add('VIDEO_NO_MEDIA', 'warning', 'Pantalla de tipo Vídeo sin recurso de vídeo.')
  if (s.type === 'unit_quiz' && !s.interaction?.scored)
    add('QUIZ_NO_SCORED', 'warning', 'Test de unidad sin actividad evaluable: no aportará nada a la nota.')
  if (s.type === 'forum_prompt' && s.interaction?.scored)
    add('FORUM_SCORED', 'warning', 'El debate en foro es una actividad externa (campus): su interacción no debería puntuar.')

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

  // Narración pendiente (solo en cursos con locución; ver Ctx.narrated). Los
  // placeholders ya cargan con SKELETON y los casos con vídeo/audio sin
  // transcripción ya son errores arriba: aquí solo el flujo de trabajo.
  const skeleton = s.type === 'content_placeholder' || s.status === 'esqueleto_pendiente_desarrollo'
  if (ctx.narrated && !skeleton && !s.audio_src.trim()) {
    if (!s.transcript.trim()) {
      // «Debería tenerla» = tiene contenido narrable (mismo criterio que el
      // botón «Generar transcripción desde el contenido»). El caso isVideo ya
      // es VIDEO_NO_TRANSCRIPT (error): no duplicar.
      if (!isVideo && buildTranscript(s).trim())
        add('NARR_NO_TRANSCRIPT', 'warning', 'El curso usa locución y esta pantalla no tiene transcripción (alternativa textual y entrada del TTS).')
    } else {
      add('NARR_NO_AUDIO', 'info', 'Pendiente de narrar: hay transcripción pero no audio de locución.')
    }
  }

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
    if (it.type === 'fill_blanks') {
      const blanks = String((it.config as any)?.text || '').match(/\[\[.+?\]\]/g) || []
      if (blanks.length === 0)
        add('FB_NO_BLANKS', 'error', 'Rellenar huecos sin ningún hueco [[respuesta]] en el texto.')
      if (!it.feedback.correct.trim() && !it.feedback.incorrect.trim())
        add('Q_NO_FEEDBACK', 'error', 'Pregunta sin feedback de acierto/error.')
    }
    if (it.type === 'timeline' && ((it.config as any)?.milestones || []).length === 0)
      add('TL_EMPTY', 'error', 'Línea de tiempo sin hitos.')
    if (it.type === 'case_practice' && ((it.config as any)?.rubric || []).length === 0)
      add('CP_NO_RUBRIC', 'warning', 'Caso práctico sin rúbrica: sin criterios de autoevaluación queda solo el enunciado.')
    if (it.type === 'html_embed') {
      const c = (it.config as any) || {}
      if (!String(c.html || '').trim() && !String(c.js || '').trim())
        add('EMBED_EMPTY', 'error', 'HTML a medida sin código: pega al menos HTML o JavaScript.')
      if (it.scored)
        add('EMBED_SCORED', 'warning', 'El HTML a medida corre aislado en un sandbox y no puede puntuar (scored: false).')
    }
    if (it.type === 'flashcards') {
      if (((it.config as any)?.cards || []).length === 0)
        add('FC_EMPTY', 'error', 'Tarjetas de repaso sin tarjetas.')
      if (it.scored)
        add('FC_SCORED', 'warning', 'Las tarjetas de repaso son autoevaluación: no deberían puntuar (scored: false).')
    }
  }
}

// --- Reglas por pregunta de test (final o de unidad) -------------------------
function checkQuizQuestions(
  ctx: Ctx,
  questions: QuizQuestion[],
  locBase: string,
  link: { screenId?: string; unitId?: string },
) {
  questions.forEach((q, n) => {
    const short = q.prompt.trim() ? `«${q.prompt.trim().slice(0, 60)}${q.prompt.trim().length > 60 ? '…' : ''}»` : `pregunta ${n + 1}`
    const loc = `${locBase} › ${short}`
    const add = (code: string, severity: Severity, message: string) =>
      ctx.push({ code, severity, message, location: loc, ...link })
    if (!q.prompt.trim()) add('Q_NO_PROMPT', 'error', 'Pregunta sin enunciado.')
    if (!(q.options || []).some((o) => o.correct))
      add('Q_NO_CORRECT', 'error', 'Pregunta sin respuesta correcta definida.')
    if (!q.feedback.correct.trim() && !q.feedback.incorrect.trim())
      add('Q_NO_FEEDBACK', 'error', 'Pregunta sin feedback de acierto/error.')
  })
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

  // Origen de la nota. Ojo a la semántica real del runtime (`computeScore` en
  // app.js): 'unit_tests' significa «actividades evaluables» (interacciones de
  // pantalla con scored), NO los objetos assessments.unit_tests.
  const rules = c.scorm.rules
  const finalQuestions = c.assessments.final_test?.questions.length ?? 0
  const scoredActivities = c.modules.reduce(
    (a, m) => a + m.units.reduce((b, u) => b + u.screens.filter((s) => s.interaction?.scored).length, 0), 0)
  if (rules.score_source === 'final_test' && finalQuestions === 0)
    ctx.push({ code: 'SCORM_NO_FINAL', severity: 'error', message: 'La nota sale del test final pero no hay preguntas en el test final.', location: 'SCORM', screenId: '__final__' })
  if (rules.score_source === 'final_test' && scoredActivities > 0)
    ctx.push({
      code: 'SCORM_ACTIVITIES_IGNORED', severity: 'warning',
      message: `Hay ${scoredActivities} actividad${scoredActivities === 1 ? '' : 'es'} marcada${scoredActivities === 1 ? '' : 's'} como evaluable${scoredActivities === 1 ? '' : 's'}, pero la nota sale solo del test final: no contarán para la nota.`,
      location: 'SCORM',
    })
  if (rules.score_source === 'unit_tests' && scoredActivities === 0)
    ctx.push({ code: 'SCORM_NO_ACTIVITIES', severity: 'error', message: 'La nota sale de las actividades evaluables pero ninguna interacción puntúa.', location: 'SCORM' })
  if (rules.score_source === 'mixed') {
    if (finalQuestions === 0 && scoredActivities === 0)
      ctx.push({ code: 'SCORM_MIXED_EMPTY', severity: 'error', message: 'La nota es mixta pero no hay ni test final ni actividades evaluables.', location: 'SCORM' })
    else if (finalQuestions === 0)
      ctx.push({ code: 'SCORM_MIXED_NO_FINAL', severity: 'warning', message: 'La nota es mixta pero no hay test final: el peso del test no se aplicará.', location: 'SCORM', screenId: '__final__' })
    else if (scoredActivities === 0)
      ctx.push({ code: 'SCORM_MIXED_NO_ACTIVITIES', severity: 'warning', message: 'La nota es mixta pero no hay actividades evaluables: solo contará el test final.', location: 'SCORM' })
  }
  if (!c.scorm.identifier.trim())
    ctx.push({ code: 'SCORM_NO_ID', severity: 'error', message: 'Falta el identificador SCORM.', location: 'SCORM' })

  // Preguntas de los tests (final y por unidad): mismas exigencias que las
  // interacciones de pantalla (respuesta correcta y feedback).
  if (c.assessments.final_test)
    checkQuizQuestions(ctx, c.assessments.final_test.questions, 'Test final', { screenId: '__final__' })
  c.assessments.unit_tests.forEach((t) =>
    checkQuizQuestions(ctx, t.questions, `Test de unidad «${t.title || t.id}»`, { unitId: t.unit_id }))

  // Riesgo normativo: cobertura de objetivos sin evaluación. Un issue por
  // objetivo, enlazado a la primera pantalla que lo declara. La comparación es
  // NORMALIZADA (normalizeObjective): la vinculación histórica era texto libre
  // y abundan pares «casi iguales» que no deben contar como desvinculados.
  const declaredBy = new Map<string, { obj: string; screen: Screen; loc: string }>()
  const evaluatedObjectives = new Set<string>()
  c.modules.forEach((m) => m.units.forEach((u) => u.screens.forEach((s) => {
    const obj = s.objective.trim()
    const key = normalizeObjective(obj)
    if (key && !declaredBy.has(key))
      declaredBy.set(key, { obj, screen: s, loc: screenLoc(m.title || m.id, u.title || u.id, s) })
    if (s.interaction?.scored && s.interaction.learning_objective)
      evaluatedObjectives.add(normalizeObjective(s.interaction.learning_objective))
  })))
  c.assessments.final_test?.questions.forEach((q) => q.learning_objective && evaluatedObjectives.add(normalizeObjective(q.learning_objective)))
  c.assessments.unit_tests.forEach((t) => t.questions.forEach((q) => q.learning_objective && evaluatedObjectives.add(normalizeObjective(q.learning_objective))))
  declaredBy.forEach(({ obj, screen, loc }, key) => {
    if (!evaluatedObjectives.has(key))
      ctx.push({
        code: 'OBJ_NOT_EVALUATED', severity: 'info',
        message: `Objetivo sin evaluación asociada: «${obj}» (riesgo para revisión normativa).`,
        location: loc, screenId: screen.id,
      })
  })
}

export interface ValidationResult {
  issues: Issue[]
  errors: number
  warnings: number
  infos: number
  ok: boolean
}

/** El curso es narrado según el ajuste `narration.mode` ('auto' = si alguna
 *  pantalla tiene locución). Compartido con el panel de Narración (TtsPanel). */
export function isNarrated(course: Course): boolean {
  return course.narration.mode === 'on' ||
    (course.narration.mode === 'auto' && course.modules.some((m) =>
      m.units.some((u) => u.screens.some((s) => s.audio_src.trim()))))
}

export function validateCourse(course: Course): ValidationResult {
  const issues: Issue[] = []
  const ctx: Ctx = { course, narrated: isNarrated(course), push: (i) => issues.push(i) }

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
