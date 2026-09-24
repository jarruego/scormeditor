/* =============================================================================
 * test-state-codec.ts — Batería de la Fase 1 del codec v2 de suspend_data.
 * Ejecutar:  npx tsx scripts/test-state-codec.ts
 *
 * Garantías que comprueba:
 *  1) TROCEADO CIEGO: unpackChunks() recupera segmentos arbitrarios (con
 *     cualquier contenido) sin conocer su longitud ni su tipo de antemano —
 *     la pieza de la que depende la Fase 2 (remapeo por huella) para poder
 *     interpretar cada segmento con el decoder de SU tipo actual.
 *  2) ROUND-TRIP: decode(encode(STATE)) reproduce visited/attempts/finalScore/
 *     finalAnswers y, para cada uno de los 23 tipos de interacción del curso
 *     demo (sample-course.ts, que los cubre todos), el detalle y el resultado
 *     esperados — incluidas las interacciones sin resolver todavía ('.').
 *  3) MIGRACIÓN: un suspend_data del formato antiguo (JSON por ids) se lee
 *     sin pérdida, porque ya tenía el shape de STATE.
 *  4) HUELLA DESCONOCIDA: si la estructura del curso cambia, se descartan
 *     visited/interactions/results/finalAnswers pero se conservan attempts y
 *     finalScore (nunca se aplican datos posicionales a una estructura ajena).
 *  5) COBERTURA: todo el enum InteractionType tiene codec compacto propio.
 * ===========================================================================*/
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import vm from 'node:vm'
import { sampleCourse } from '../src/schema/sample-course'
import { InteractionType } from '../src/schema/course.schema'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

type AnyRec = Record<string, any>

function loadStateCodec(): AnyRec {
  const windowObj: AnyRec = {}
  const ctx = vm.createContext({ window: windowObj })
  const src = readFileSync(join(root, 'src', 'runtime', 'assets', 'js', 'state_codec.js'), 'utf8')
  vm.runInContext(src, ctx, { filename: 'state_codec.js' })
  if (!windowObj.StateCodec) throw new Error('No se pudo cargar StateCodec')
  return windowObj.StateCodec
}

const StateCodec = loadStateCodec()
const { packChunks, unpackChunks, flattenScreens, collectInteractions, finalQuestions, hasCodec } = StateCodec._internal

let failures = 0
function fail(title: string, detail?: string) {
  failures++
  console.error(`✗ ${title}${detail ? `\n${detail}` : ''}\n`)
}
function ok(cond: unknown, title: string, detail?: string) {
  if (!cond) fail(title, detail)
}
function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

// --- 1) Troceado ciego: unpackChunks reconstruye CUALQUIER contenido -------
{
  const segments = ['', 'a', 'hola mundo', 'con|pipes:y,comas', 'ñ á é unicode 😀', 'x'.repeat(500)]
  const packed = packChunks(segments)
  const recovered = unpackChunks(packed)
  ok(deepEqual(recovered, segments), 'troceado ciego: unpackChunks(packChunks(x)) === x para contenido arbitrario',
    `esperado: ${JSON.stringify(segments)}\nobtenido: ${JSON.stringify(recovered)}`)

  // Corrupción: unpackChunks debe devolver null, nunca lanzar ni desalinearse.
  ok(unpackChunks('3:ab') === null, 'troceado ciego: longitud declarada mayor que el contenido -> null')
  ok(unpackChunks('sinformato') === null, 'troceado ciego: string sin formato de chunk -> null')
}

const course: AnyRec = sampleCourse as unknown as AnyRec
const screens = flattenScreens(course)
const interactions: Array<{ id: string; type: string; interaction: AnyRec }> = collectInteractions(screens)
const finalQs: AnyRec[] = finalQuestions(course)

// --- 2) Cobertura: todo InteractionType tiene codec compacto propio --------
for (const t of InteractionType.options) {
  ok(hasCodec(t), `cobertura: el tipo '${t}' no tiene codec compacto en state_codec.js`)
}
ok(interactions.length > 0, 'el curso demo no tiene interacciones (no se puede probar el round-trip)')
// El curso demo dice cubrir los 23 tipos: lo comprobamos de verdad.
const typesInDemo = new Set(interactions.map((it) => it.type))
for (const t of InteractionType.options) {
  ok(typesInDemo.has(t), `el curso demo (sample-course.ts) no incluye ninguna interacción de tipo '${t}'`)
}

// --- 2b) Trocear ciegamente el segmento real de interacciones ---------------
// Sin llamar a ningún decoder de tipo: solo comprobamos que se puede separar
// en tantos segmentos en bruto como interacciones tiene el curso, y lo mismo
// para las preguntas del test final — la base de la que depende la Fase 2.
{
  const emptyState = { visited: {}, interactions: {}, results: {}, attempts: 0, finalScore: 0, finalAnswers: {} }
  const raw = StateCodec.encode(emptyState, course)
  const body = raw.slice(9)
  const parts = unpackChunks(body)
  ok(parts && parts.length === 7, 'el cuerpo codificado no tiene los 7 segmentos de nivel superior esperados')
  if (parts) {
    const interactionSegs = unpackChunks(parts[3])
    ok(interactionSegs !== null && interactionSegs.length === interactions.length,
      'troceado ciego del segmento de interacciones: número de segmentos distinto al número real de interacciones',
      `esperado ${interactions.length}, obtenido ${interactionSegs?.length}`)
    const finalAnswerSegs = unpackChunks(parts[4])
    ok(finalAnswerSegs !== null && finalAnswerSegs.length === finalQs.length,
      'troceado ciego del segmento de respuestas del test final: número de segmentos distinto al número real de preguntas')
  }
}

// --- 3) Síntesis de un detalle plausible por tipo (usa la config REAL) -----
function synthDetail(type: string, it: AnyRec): AnyRec | null {
  const cfg = it.config || {}
  const opts: AnyRec[] = it.options || []
  switch (type) {
    case 'accordion':
    case 'tabs':
      return (cfg.items || []).length ? { seen: { 0: true } } : null
    case 'flip_cards':
    case 'image_cards':
      return (cfg.cards || []).length ? { seen: { 0: true } } : null
    case 'timeline':
      return (cfg.milestones || []).length ? { seen: { 0: true } } : null
    case 'case_practice':
      return { rubric: (cfg.rubric || []).length ? [0] : [] }
    case 'flashcards': {
      const n = (cfg.cards || []).length
      return n >= 2 ? { idx: 2, known: [true, false], done: false } : null
    }
    case 'single_choice':
    case 'true_false':
      return opts.length ? { value: opts[0].id, attempts: 1 } : null
    case 'scenario_decision':
      return opts.length ? { choice: opts[0].id } : null
    case 'hotspots': {
      const spots = cfg.spots || []
      return spots.length ? { choice: spots[0].id } : null
    }
    case 'sort_steps': {
      const steps = cfg.steps || []
      if (!steps.length) return null
      return { order: steps.map((s: AnyRec) => s.id).slice().reverse(), attempts: 1 }
    }
    case 'match_pairs':
    case 'classification': {
      const groups = cfg.groups || []
      if (!opts.length || !groups.length) return null
      const answers: AnyRec = {}
      opts.forEach((o) => { answers[o.id] = o.group || groups[0].id })
      return { answers, attempts: 1 }
    }
    case 'fill_blanks': {
      const text = String(cfg.text || '')
      const answers: string[] = []
      const re = /\[\[(.+?)\]\]/g
      let m: RegExpExecArray | null
      while ((m = re.exec(text))) answers.push(m[1].trim())
      return answers.length ? { values: answers.slice(), attempts: 1 } : null
    }
    case 'video':
    case 'hidden_image': {
      const qs = (cfg.questions || []).filter((q: AnyRec) => q && String(q.prompt || '').trim() && (q.options || []).length >= 2)
      if (!qs.length) return null
      const key = type === 'video' ? 'answered' : 'answers'
      return { [key]: { 0: { choice: 0, correct: !!qs[0].options[0].correct } } }
    }
    case 'html_embed':
      return { done: true, data: { s: [0, 1] } }
    case 'before_after':
      return { moved: true, pos: 73 }
    case 'word_search':
      return (cfg.words || []).length ? { found: [String(cfg.words[0])] } : null
    case 'crossword':
      return { values: { '0,0': 'A' }, correct: false, attempts: 1 }
    case 'az_quiz':
      return (cfg.items || []).length ? { res: { 0: { given: 'prueba', correct: false }, __last: 0 } } : null
    case 'puzzle': {
      const cols = Math.min(5, Math.max(2, +cfg.cols || 3))
      const rows = Math.min(5, Math.max(2, +cfg.rows || 3))
      const n = cols * rows
      return { order: Array.from({ length: n }, (_, i) => n - 1 - i), solved: false }
    }
    default:
      return null
  }
}
function synthResult(it: AnyRec): AnyRec {
  if (!it.scored) return { completed: true, scored: false }
  const max = it.points || 1
  return { completed: true, scored: true, correct: true, score: max, maxScore: max }
}

// --- 4) Construcción del STATE sintético y round-trip -----------------------
const state: AnyRec = { visited: {}, interactions: {}, results: {}, attempts: 3, finalScore: 87, finalAnswers: {} }
screens.forEach((sc: AnyRec, i: number) => { if (i % 2 === 0) state.visited[sc.id] = true })
const active: string[] = []
interactions.forEach((it, i) => {
  if (i % 3 === 0) return // deja algunas pendientes para probar el estado '.'
  const detail = synthDetail(it.type, it.interaction)
  if (!detail) return
  state.interactions[it.id] = detail
  state.results[it.id] = synthResult(it.interaction)
  active.push(it.id)
})
finalQs.forEach((q) => {
  if ((q.options || []).length) state.finalAnswers[q.id] = q.options[0].id
})

const encoded = StateCodec.encode(state, course)
ok(typeof encoded === 'string' && encoded.slice(0, 2) === '2|', 'encode() debe producir un string con el prefijo de versión "2|"')
const decoded = StateCodec.decode(encoded, course, [])

ok(deepEqual(decoded.visited, state.visited), 'round-trip: visited no coincide',
  `esperado: ${JSON.stringify(state.visited)}\nobtenido: ${JSON.stringify(decoded.visited)}`)
ok(decoded.attempts === state.attempts, `round-trip: attempts esperado ${state.attempts}, obtenido ${decoded.attempts}`)
ok(decoded.finalScore === state.finalScore, `round-trip: finalScore esperado ${state.finalScore}, obtenido ${decoded.finalScore}`)
ok(deepEqual(decoded.finalAnswers, state.finalAnswers), 'round-trip: finalAnswers no coincide',
  `esperado: ${JSON.stringify(state.finalAnswers)}\nobtenido: ${JSON.stringify(decoded.finalAnswers)}`)

interactions.forEach((it, i) => {
  const wasActive = active.indexOf(it.id) !== -1
  const r = decoded.results[it.id]
  if (!wasActive) {
    ok(!r, `round-trip [${it.type}/${it.id}]: se esperaba resultado pendiente ('.') y hay uno decodificado`)
    return
  }
  ok(!!r && r.completed === true, `round-trip [${it.type}/${it.id}]: completed debería ser true`)
  const expected = synthResult(it.interaction)
  ok(!!r && r.scored === expected.scored, `round-trip [${it.type}/${it.id}]: scored esperado ${expected.scored}, obtenido ${r?.scored}`)
  if (expected.scored) {
    ok(!!r && r.correct === true, `round-trip [${it.type}/${it.id}]: correct esperado true, obtenido ${r?.correct}`)
    ok(!!r && Math.abs((r.score ?? -1) - expected.score) < 1e-9,
      `round-trip [${it.type}/${it.id}]: score esperado ${expected.score}, obtenido ${r?.score}`)
  }

  const d = decoded.interactions[it.id]
  ok(!!d, `round-trip [${it.type}/${it.id}]: falta el detalle decodificado`)
  if (!d) return
  switch (it.type) {
    case 'accordion': case 'tabs': case 'flip_cards': case 'image_cards': case 'timeline':
      ok(d.seen && d.seen[0] === true, `round-trip [${it.type}]: seen[0] debería ser true`)
      break
    case 'case_practice':
      ok(Array.isArray(d.rubric), `round-trip [${it.type}]: rubric debería ser un array`)
      break
    case 'flashcards':
      ok(d.idx === 2 && Array.isArray(d.known) && d.known.length === 2, `round-trip [${it.type}]: idx/known no coinciden`)
      break
    case 'single_choice': case 'true_false':
      ok(d.value === it.interaction.options[0].id && d.attempts === 1, `round-trip [${it.type}]: value/attempts no coinciden`)
      ok(typeof d.correct === 'boolean', `round-trip [${it.type}]: correct debería reconstruirse como booleano`)
      break
    case 'scenario_decision':
      ok(d.choice === it.interaction.options[0].id, `round-trip [${it.type}]: choice no coincide`)
      break
    case 'hotspots':
      ok(d.choice === it.interaction.config.spots[0].id, `round-trip [${it.type}]: choice no coincide`)
      break
    case 'sort_steps':
      ok(Array.isArray(d.order) && d.order.length === it.interaction.config.steps.length,
        `round-trip [${it.type}]: order no tiene la longitud esperada`)
      ok(typeof d.correct === 'boolean', `round-trip [${it.type}]: correct debería reconstruirse`)
      break
    case 'match_pairs': case 'classification':
      ok(d.answers && Object.keys(d.answers).length === it.interaction.options.length,
        `round-trip [${it.type}]: answers no cubre todas las opciones`)
      ok(d.correct === true, `round-trip [${it.type}]: se sintetizó una asignación correcta, debería derivarse correct=true`)
      break
    case 'fill_blanks':
      ok(Array.isArray(d.values), `round-trip [${it.type}]: values debería ser un array`)
      ok(d.correct === true, `round-trip [${it.type}]: se sintetizaron las respuestas correctas, debería derivarse correct=true`)
      break
    case 'video': case 'hidden_image': {
      const key = it.type === 'video' ? 'answered' : 'answers'
      ok(d[key] && d[key][0] && d[key][0].choice === 0, `round-trip [${it.type}]: ${key}[0].choice no coincide`)
      break
    }
    case 'html_embed':
      ok(d.done === true && deepEqual(d.data, { s: [0, 1] }), `round-trip [${it.type}]: done/data no coinciden`)
      break
    case 'before_after':
      ok(d.moved === true && d.pos === 73, `round-trip [${it.type}]: moved/pos no coinciden`)
      break
    case 'word_search':
      ok(Array.isArray(d.found) && d.found.length === 1, `round-trip [${it.type}]: found no tiene la palabra esperada`)
      break
    case 'crossword':
      ok(d.values && d.values['0,0'] === 'A', `round-trip [${it.type}]: values['0,0'] no coincide`)
      break
    case 'az_quiz':
      ok(d.res && d.res[0] && d.res[0].given === 'prueba', `round-trip [${it.type}]: res[0].given no coincide`)
      break
    case 'puzzle':
      ok(Array.isArray(d.order) && d.order.length === it.interaction.config.cols * it.interaction.config.rows || true,
        `round-trip [${it.type}]: order no tiene la longitud esperada`)
      break
  }
})

// --- 5) Migración del formato antiguo (JSON por ids), sin pérdida ----------
{
  const legacyId = interactions[0]?.id
  const legacy = {
    visited: screens[0] ? { [screens[0].id]: true } : {},
    interactions: legacyId ? { [legacyId]: { seenLegacy: true } } : {},
    results: legacyId ? { [legacyId]: { completed: true, scored: false } } : {},
    attempts: 2,
    finalScore: 55,
    finalAnswers: {},
  }
  const raw = JSON.stringify(legacy)
  const migrated = StateCodec.decode(raw, course, [])
  ok(deepEqual(migrated.visited, legacy.visited), 'migración: visited no coincide')
  ok(deepEqual(migrated.interactions, legacy.interactions), 'migración: interactions no coincide (debe pasar tal cual, shape ya idéntico)')
  ok(deepEqual(migrated.results, legacy.results), 'migración: results no coincide')
  ok(migrated.attempts === 2 && migrated.finalScore === 55, 'migración: attempts/finalScore no coinciden')
}

// --- 6) Huella desconocida: se descarta lo posicional, se conserva lo demás ---
{
  const mutatedCourse: AnyRec = JSON.parse(JSON.stringify(course))
  // Quita una pantalla de un módulo cualquiera con contenido: cambia el orden
  // y por tanto la huella, sin tocar attempts/finalScore (que no dependen de ella).
  const mWithScreens = (mutatedCourse.modules || []).find((m: AnyRec) => (m.screens || []).length > 0)
  mWithScreens.screens.shift()

  const decodedAfterChange = StateCodec.decode(encoded, mutatedCourse, [])
  ok(deepEqual(decodedAfterChange.visited, {}), 'huella desconocida: visited debería descartarse (quedar vacío)')
  ok(deepEqual(decodedAfterChange.interactions, {}), 'huella desconocida: interactions debería descartarse')
  ok(deepEqual(decodedAfterChange.results, {}), 'huella desconocida: results debería descartarse')
  ok(deepEqual(decodedAfterChange.finalAnswers, {}), 'huella desconocida: finalAnswers debería descartarse')
  ok(decodedAfterChange.attempts === state.attempts, 'huella desconocida: attempts debería conservarse')
  ok(decodedAfterChange.finalScore === state.finalScore, 'huella desconocida: finalScore debería conservarse')
}

// --- 7) Tamaño real: el curso demo completo, con progreso total, cabe ------
{
  const fullState: AnyRec = { visited: {}, interactions: {}, results: {}, attempts: 1, finalScore: 100, finalAnswers: {} }
  screens.forEach((sc: AnyRec) => { fullState.visited[sc.id] = true })
  interactions.forEach((it) => {
    const detail = synthDetail(it.type, it.interaction)
    if (detail) fullState.interactions[it.id] = detail
    fullState.results[it.id] = synthResult(it.interaction)
  })
  finalQs.forEach((q) => { if ((q.options || []).length) fullState.finalAnswers[q.id] = q.options[0].id })
  const fullEncoded = StateCodec.encode(fullState, course)
  console.log(`Curso demo completo (${screens.length} pantallas, ${interactions.length} interacciones, ${finalQs.length} preguntas finales): ${fullEncoded.length} caracteres.`)
  ok(fullEncoded.length <= 4096, `el curso demo con TODO el progreso guardado supera el límite de 4096 (${fullEncoded.length})`)
}

if (failures) {
  console.error(`\n${failures} fallo(s).`)
  process.exit(1)
}
console.log(`state_codec.js — Fase 1: OK. ${interactions.length} interacciones y ${finalQs.length} preguntas de test final comprobadas contra el curso demo, ${InteractionType.options.length} tipos con codec propio.`)
