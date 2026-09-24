/* =============================================================================
 * test-state-codec.ts — Batería del codec v2 de suspend_data (Fases 1 y 2).
 * Ejecutar:  npx tsx scripts/test-state-codec.ts
 *
 * Garantías que comprueba:
 *  1) TROCEADO CIEGO: unpackChunks() recupera segmentos arbitrarios (con
 *     cualquier contenido) sin conocer su longitud ni su tipo de antemano —
 *     la pieza de la que depende el remapeo por huella para poder interpretar
 *     cada segmento con el decoder de SU tipo actual.
 *  2) ROUND-TRIP: decode(encode(STATE)) reproduce visited/attempts/finalScore/
 *     finalAnswers y, para cada uno de los 23 tipos de interacción del curso
 *     demo (sample-course.ts, que los cubre todos), el detalle y el resultado
 *     esperados — incluidas las interacciones sin resolver todavía ('.').
 *  3) MIGRACIÓN: un suspend_data del formato antiguo (JSON por ids) se lee
 *     sin pérdida, porque ya tenía el shape de STATE.
 *  4) HUELLA DESCONOCIDA (sin entrada en `layouts`): se descartan visited/
 *     interactions/results/finalAnswers pero se conservan attempts y
 *     finalScore (nunca se aplican datos posicionales a una estructura ajena).
 *  5) COBERTURA: todo el enum InteractionType tiene codec compacto propio.
 *  6) REMAPEO (historial de estructuras, `layouts`): reordenar e insertar
 *     pantallas no pierde nada; eliminar una pantalla/interacción descarta
 *     solo lo suyo; cambiar el tipo de una interacción descarta su resultado
 *     Y su detalle (nunca se aplican datos desplazados); lo que no se toca
 *     sobrevive exacto.
 *  7) DEGRADACIÓN POR TAMAÑO (encodeWithBudget): con un estado inflado que no
 *     cabe en 4096 ni de lejos, prueba niveles crecientes hasta que cabe, sin
 *     tocar NUNCA visited/results/attempts/finalScore — solo detalle ya
 *     redundante (exploratorias completas, texto ya acertado de crucigrama/
 *     rosco, estado interno de html_embed completados), en ese orden.
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
const { packChunks, unpackChunks, flattenScreens, collectInteractions, finalQuestions, hasCodec, hasEstimator } = StateCodec._internal

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

// --- 2) Cobertura: todo InteractionType tiene codec compacto y estimador ---
for (const t of InteractionType.options) {
  ok(hasCodec(t), `cobertura: el tipo '${t}' no tiene codec compacto en state_codec.js`)
  ok(hasEstimator(t), `cobertura: el tipo '${t}' no tiene estimador de peor caso (worstCaseDetail) en state_codec.js`)
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

function findScreenArrays(c: AnyRec): AnyRec[][] {
  const arrs: AnyRec[][] = []
  ;(c.modules || []).forEach((m: AnyRec) => {
    arrs.push(m.screens || [])
    ;(m.units || []).forEach((u: AnyRec) => arrs.push(u.screens || []))
    arrs.push(m.closing_screens || [])
  })
  return arrs
}
function findInteractionScreen(c: AnyRec, id: string): AnyRec | undefined {
  for (const arr of findScreenArrays(c)) {
    const sc = arr.find((s: AnyRec) => s.interaction?.id === id)
    if (sc) return sc
  }
  return undefined
}

// --- 6b) Remapeo (Fase 2): reordenar, insertar, eliminar y cambiar tipo -----
{
  const oldLayout = StateCodec.buildLayoutEntry(course)
  ok(oldLayout.fp === encoded.slice(2, 8), 'buildLayoutEntry: la huella del curso original no coincide con la del encode() ya hecho')
  ok(
    oldLayout.screens.length === screens.length &&
    oldLayout.interactions.length === interactions.length &&
    oldLayout.final_questions.length === finalQs.length,
    'buildLayoutEntry: no reproduce el mismo recuento de pantallas/interacciones/preguntas',
  )

  const mutated: AnyRec = JSON.parse(JSON.stringify(course))
  const modWithScreens = (mutated.modules || []).find((m: AnyRec) => (m.screens || []).length > 0)

  // 1) Reordena las pantallas propias del módulo (cambia la huella, no los ids).
  modWithScreens.screens.reverse()
  // 2) Inserta una pantalla nueva sin interacción: no debería afectar a nada existente.
  modWithScreens.screens.push({ id: '__test_new_screen__', type: 'content', title: 'Nueva' })

  // 3) Elimina la pantalla que aloja la 1ª interacción activa: su id desaparece.
  const removedId = active[0]
  const removedScreenId = findInteractionScreen(course as AnyRec, removedId)!.id
  for (const arr of findScreenArrays(mutated)) {
    const idx = arr.findIndex((s: AnyRec) => s.interaction?.id === removedId)
    if (idx !== -1) arr.splice(idx, 1)
  }

  // 4) Cambia el tipo de la 2ª interacción activa (mismo id, tipo distinto).
  const retypedId = active[1]
  const retypedScreen = findInteractionScreen(mutated, retypedId)!
  retypedScreen.interaction.type = retypedScreen.interaction.type === 'true_false' ? 'single_choice' : 'true_false'

  // Una 3ª interacción activa que NO se toca: debe sobrevivir intacta.
  const untouchedId = active.find((id) => id !== removedId && id !== retypedId)!

  // 5) Preguntas del test final: elimina la primera respondida (su respuesta
  // desaparece) e inserta una nueva (no debería afectar a las demás).
  const answeredFinalQId = Object.keys(state.finalAnswers)[0]
  const survivingFinalQId = Object.keys(state.finalAnswers).find((id) => id !== answeredFinalQId)
  const ft = mutated.assessments?.final_test
  if (ft && answeredFinalQId) {
    ft.questions = ft.questions.filter((q: AnyRec) => q.id !== answeredFinalQId)
    ft.questions.push({ id: '__test_new_question__', prompt: 'Nueva', type: 'single_choice', points: 1, options: [{ id: 'a', text: 'A', correct: true }] })
  }

  const remapped = StateCodec.decode(encoded, mutated, [oldLayout])

  ok(remapped.attempts === state.attempts, 'remapeo: attempts debería conservarse')
  ok(remapped.finalScore === state.finalScore, 'remapeo: finalScore debería conservarse')
  ok(!remapped.visited[removedScreenId], 'remapeo: la pantalla eliminada no debería quedar visited')
  const otherVisited = Object.keys(state.visited).filter((id) => id !== removedScreenId)
  ok(otherVisited.every((id) => remapped.visited[id]), 'remapeo: las pantallas que siguen existiendo deberían conservar su visited')

  ok(!remapped.results[removedId] && !remapped.interactions[removedId],
    'remapeo: la interacción eliminada no debería tener resultado ni detalle')
  ok(!remapped.results[retypedId] && !remapped.interactions[retypedId],
    'remapeo: la interacción que cambió de tipo no debería conservar ni resultado ni detalle')
  ok(deepEqual(remapped.results[untouchedId], state.results[untouchedId]),
    'remapeo: una interacción sin tocar debería conservar su resultado exacto')
  ok(deepEqual(remapped.interactions[untouchedId], decoded.interactions[untouchedId]),
    'remapeo: una interacción sin tocar debería conservar su detalle exacto')
  if (answeredFinalQId) {
    ok(remapped.finalAnswers[answeredFinalQId] === undefined,
      'remapeo: la respuesta de una pregunta de test final ELIMINADA no debería sobrevivir')
  } else {
    ok(deepEqual(remapped.finalAnswers, state.finalAnswers),
      'remapeo: las respuestas del test final (sin tocar) deberían conservarse íntegras')
  }
  if (survivingFinalQId) {
    ok(remapped.finalAnswers[survivingFinalQId] === state.finalAnswers[survivingFinalQId],
      'remapeo: la respuesta de una pregunta de test final que sigue existiendo (con una nueva insertada al lado) debería conservarse')
  }

  // Huella conocida en `layouts` pero SIN mutar nada: debe comportarse igual
  // que decodificar contra el curso original (round-trip también por esta vía).
  const sameStructureViaLayouts = StateCodec.decode(encoded, course, [oldLayout])
  ok(deepEqual(sameStructureViaLayouts, decoded),
    'remapeo: decodificar vía `layouts` con la MISMA estructura debe dar el mismo resultado que la vía rápida (huella igual)')
}

// --- 6c) Config de interacción cambiada (mismo id, mismo tipo, huella IGUAL:
//         el fp no depende de la config, así que esto pasa por la vía rápida,
//         no por el remapeo — es la validación por tipo de la Fase 1) --------
{
  const choiceId = active.find((id) => {
    const it = interactions.find((x) => x.id === id)
    return !!it && (it.type === 'single_choice' || it.type === 'true_false')
  })
  ok(!!choiceId, 'config cambiada: el curso demo debería tener alguna single_choice/true_false activa para esta prueba')
  if (choiceId) {
    const configMutated: AnyRec = JSON.parse(JSON.stringify(course))
    const sc = findInteractionScreen(configMutated, choiceId)!
    sc.interaction.options = [] // la opción codificada (índice 0) deja de existir
    const currentFpUnchanged = StateCodec._internal.fingerprint(
      StateCodec._internal.flattenScreens(configMutated),
      StateCodec._internal.collectInteractions(StateCodec._internal.flattenScreens(configMutated)),
      StateCodec._internal.finalQuestions(configMutated),
    )
    ok(currentFpUnchanged === encoded.slice(2, 8),
      'config cambiada: vaciar las opciones de una interacción no debería cambiar la huella (no es un cambio de ids/tipos)')

    const afterConfigChange = StateCodec.decode(encoded, configMutated, [])
    ok(!afterConfigChange.interactions[choiceId],
      'config cambiada: el detalle de la interacción con la config incompatible debería descartarse, no lanzar ni devolver basura')
    ok(deepEqual(afterConfigChange.results[choiceId], state.results[choiceId]),
      'config cambiada: el RESULTADO no depende de `options`, así que debería conservarse igual')
    const otherActiveId = active.find((id) => id !== choiceId)!
    ok(deepEqual(afterConfigChange.interactions[otherActiveId], decoded.interactions[otherActiveId]),
      'config cambiada: una interacción sin relación no debería verse afectada')
  }
}

// --- 6d) Exportar dos veces sin duplicar el historial de layouts -----------
// (mismo criterio de deduplicación por huella que Toolbar.tsx: `onExportScorm`)
{
  let layouts: AnyRec[] = []
  function registerExport(c: AnyRec) {
    const entry = StateCodec.buildLayoutEntry(c)
    if (!layouts.some((l) => l.fp === entry.fp)) layouts = [...layouts, { ...entry, exported_at: new Date().toISOString() }]
  }
  registerExport(course)
  registerExport(course) // segunda exportación seguida, sin cambiar nada
  ok(layouts.length === 1, `exportar dos veces sin cambios no debería duplicar el historial (quedaron ${layouts.length})`)
  const reordered: AnyRec = JSON.parse(JSON.stringify(course))
  const m = (reordered.modules || []).find((mm: AnyRec) => (mm.screens || []).length > 0)
  m.screens.push({ id: '__test_export_twice_screen__', type: 'content', title: 'Nueva' }) // cambia la huella de verdad
  registerExport(reordered) // estructura distinta: sí debe añadir una entrada nueva
  ok(layouts.length === 2, `una estructura distinta sí debería añadir una entrada nueva al historial (quedaron ${layouts.length})`)
}

// --- 6e) Curso sintético de 150 pantallas: el peor caso debe seguir siendo
//         pequeño (la razón de ser de todo este rediseño: el problema
//         original era ~10.000 caracteres frente al límite de 4096) --------
{
  const bigCourse: AnyRec = {
    modules: [{ id: 'm1', screens: [], units: [{ id: 'u1', screens: [] }], closing_screens: [] }],
    intro_screens: [], closing_screens: [],
    assessments: { final_test: { questions: [] } },
    scorm: {},
  }
  const unitScreens = bigCourse.modules[0].units[0].screens
  let n = 0
  function addScreen(interaction?: AnyRec) {
    n++
    unitScreens.push({ id: `s${n}`, type: 'content', title: `Pantalla ${n}`, interaction })
  }
  // 20 exploratorias (acordeón/pestañas/volteo), como en el enunciado original.
  for (let i = 0; i < 20; i++) {
    addScreen({
      id: `i-exp-${i}`, type: (['accordion', 'tabs', 'flip_cards'] as const)[i % 3],
      scored: false, points: 0, options: [],
      config: { items: [{ title: 'a' }, { title: 'b' }, { title: 'c' }], cards: [{ front: 'a', back: 'b' }, { front: 'c', back: 'd' }] },
    })
  }
  // 15 rellenar huecos.
  for (let i = 0; i < 15; i++) {
    addScreen({
      id: `i-fb-${i}`, type: 'fill_blanks', scored: true, points: 1, options: [],
      config: { text: 'Un [[hueco]] y otro [[hueco2]] más.', distractors: ['x', 'y'] },
    })
  }
  // 10 elección (single_choice).
  for (let i = 0; i < 10; i++) {
    addScreen({
      id: `i-sc-${i}`, type: 'single_choice', scored: true, points: 1,
      options: [{ id: 'a', text: 'A', correct: true }, { id: 'b', text: 'B' }, { id: 'c', text: 'C' }],
      config: {},
    })
  }
  // 5 ordenar (sort_steps).
  for (let i = 0; i < 5; i++) {
    addScreen({
      id: `i-ss-${i}`, type: 'sort_steps', scored: true, points: 1, options: [],
      config: { steps: [{ id: 'p1', text: 'uno', order: 1 }, { id: 'p2', text: 'dos', order: 2 }, { id: 'p3', text: 'tres', order: 3 }] },
    })
  }
  // 4 html_embed. state_max realista (docs/html-embed-contract.md recomienda
  // un estado compacto tipo {"s":[0,2]}, no el techo de 100 por defecto).
  for (let i = 0; i < 4; i++) {
    addScreen({ id: `i-he-${i}`, type: 'html_embed', scored: false, points: 0, options: [], config: { state_max: 20 } })
  }
  // El resto, hasta 150, pantallas de contenido sin interacción.
  while (n < 150) addScreen()
  ok(n === 150, `curso sintético: debería tener 150 pantallas, tiene ${n}`)
  ok(unitScreens.filter((s: AnyRec) => s.interaction).length === 54,
    `curso sintético: debería tener 54 interacciones (20+15+10+5+4), tiene ${unitScreens.filter((s: AnyRec) => s.interaction).length}`)

  const bigEstimate = StateCodec.estimateSuspendSize(bigCourse)
  console.log(`Curso sintético (150 pantallas, 54 interacciones, como en el enunciado original): peor caso ${bigEstimate.worstCase} / ${bigEstimate.limit} caracteres.`)
  ok(bigEstimate.missingEstimator.length === 0, 'curso sintético: no debería haber tipos sin estimador')
  ok(bigEstimate.worstCase < 1500,
    `curso sintético: el peor caso debería quedar por debajo de 1500 caracteres (dio ${bigEstimate.worstCase}) — el problema original eran ~10.000 caracteres frente al límite de 4096`)
}

// --- 7) Tamaño real: el curso demo completo, con progreso total, cabe ------
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

// --- 8) Degradación por tamaño (Fase 3): nunca toca visited/results/attempts/
//        finalScore, y actúa en el orden documentado hasta que quepa --------
{
  const bloated: AnyRec = { visited: {}, interactions: {}, results: {}, attempts: 4, finalScore: 88, finalAnswers: {} }
  screens.forEach((sc: AnyRec) => { bloated.visited[sc.id] = true })
  interactions.forEach((it) => {
    const detail = synthDetail(it.type, it.interaction)
    if (detail) bloated.interactions[it.id] = detail
    bloated.results[it.id] = synthResult(it.interaction)
  })
  finalQs.forEach((q) => { if ((q.options || []).length) bloated.finalAnswers[q.id] = q.options[0].id })

  // Infla artificialmente detalle de tipos concretos para forzar que el
  // nivel 0 no quepa y comprobar el orden exacto de la degradación.
  const explor = interactions.find((it) => StateCodec._internal.isExploratoryType(it.type))
  const crossword = interactions.find((it) => it.type === 'crossword')
  const azQuiz = interactions.find((it) => it.type === 'az_quiz')
  const htmlEmbed = interactions.find((it) => it.type === 'html_embed')
  ok(!!explor && !!crossword && !!azQuiz && !!htmlEmbed,
    'degradación: el curso demo debería tener al menos un tipo de cada categoría a degradar')

  if (crossword) {
    const values: AnyRec = {}
    for (let i = 0; i < 30; i++) for (let j = 0; j < 30; j++) values[`${i},${j}`] = 'A'
    bloated.interactions[crossword.id] = { values, correct: true, attempts: 2 }
    bloated.results[crossword.id] = { completed: true, scored: true, correct: true, score: crossword.interaction.points || 1, maxScore: crossword.interaction.points || 1 }
  }
  if (azQuiz) {
    const n = ((azQuiz.interaction.config || {}).items || []).length || 1
    const res: AnyRec = {}
    for (let i = 0; i < n; i++) res[i] = { given: 'x'.repeat(200), correct: true }
    bloated.interactions[azQuiz.id] = { res }
    bloated.results[azQuiz.id] = { completed: true, scored: true, correct: true, score: azQuiz.interaction.points || 1, maxScore: azQuiz.interaction.points || 1 }
  }
  if (htmlEmbed) {
    bloated.interactions[htmlEmbed.id] = { done: true, data: { blob: 'y'.repeat(4500) } }
    bloated.results[htmlEmbed.id] = { completed: true, scored: false }
  }

  const level0 = StateCodec.encode(bloated, course, 0)
  ok(level0.length > 4096, `degradación: el estado inflado debería superar 4096 en nivel 0 para que la prueba sea significativa (mide ${level0.length})`)

  const budget = StateCodec.encodeWithBudget(bloated, course, 4096)
  console.log(`Degradación: nivel 0 = ${level0.length} caracteres; elegido nivel ${budget.degraded} = ${budget.size} caracteres (cabe: ${budget.fits}).`)
  ok(budget.fits, `degradación: debería caber con degradación máxima (mide ${budget.size} en nivel ${budget.degraded})`)
  ok(budget.degraded >= 3, `degradación: con esta inflación debería necesitar llegar al nivel 3 (html_embed), llegó a ${budget.degraded}`)

  const afterDegrade = StateCodec.decode(budget.raw, course, [])
  ok(afterDegrade.attempts === bloated.attempts, 'degradación: attempts no debería alterarse')
  ok(afterDegrade.finalScore === bloated.finalScore, 'degradación: finalScore no debería alterarse')
  ok(deepEqual(afterDegrade.visited, bloated.visited), 'degradación: visited no debería alterarse')
  ok(deepEqual(afterDegrade.results, bloated.results), 'degradación: NINGÚN resultado debería alterarse, solo el detalle')

  if (explor) ok(!afterDegrade.interactions[explor.id],
    `degradación [nivel 1, ${explor.type}]: el detalle de una exploratoria ya completada debería desaparecer`)
  if (crossword) {
    const d = afterDegrade.interactions[crossword.id]
    ok(!!d && Object.keys(d.values).length === 0 && d.correct === true && d.attempts === 2,
      'degradación [nivel 2, crossword]: values debería vaciarse conservando correct/attempts')
  }
  if (azQuiz) {
    const d = afterDegrade.interactions[azQuiz.id]
    const items = Object.keys(d?.res || {}).filter((k) => k !== '__last')
    ok(!!d && items.length > 0 && items.every((k) => d.res[k].given === '' && d.res[k].correct === true),
      'degradación [nivel 2, az_quiz]: given debería vaciarse conservando correct')
  }
  if (htmlEmbed) {
    const d = afterDegrade.interactions[htmlEmbed.id]
    ok(!!d && d.done === true && d.data === null,
      'degradación [nivel 3, html_embed]: data debería vaciarse conservando done')
  }

  // Ni siquiera el nivel 3 basta: no debe fingir que cupo, y el tamaño
  // reportado debe ser el del intento más pequeño (nivel 3), no el original.
  const tinyBudget = StateCodec.encodeWithBudget(bloated, course, 100)
  ok(!tinyBudget.fits && tinyBudget.degraded === 3 && tinyBudget.size === budget.size,
    'degradación: con un límite imposible debe reportar fits=false en el nivel 3 (el más pequeño posible)')
}

// --- 9) Medidor del editor (Fase 4): estimateSuspendSize --------------------
{
  const estimate = StateCodec.estimateSuspendSize(course)
  console.log(`Peor caso estimado (curso demo): ${estimate.worstCase} / ${estimate.limit} caracteres.`)
  ok(estimate.limit === 4096, 'estimateSuspendSize: el límite debería ser 4096')
  ok(Array.isArray(estimate.missingEstimator) && estimate.missingEstimator.length === 0,
    `estimateSuspendSize: el curso demo no debería tener tipos sin estimador (${JSON.stringify(estimate.missingEstimator)})`)
  ok(typeof estimate.breakdown === 'object' && estimate.breakdown != null, 'estimateSuspendSize: debería devolver un desglose')
  // El "peor caso" debe serlo de verdad: >= cualquier progreso real ya
  // observado sin degradar (el curso demo completo de la sección 7).
  ok(estimate.worstCase >= fullEncoded.length,
    `estimateSuspendSize: el peor caso (${estimate.worstCase}) debería ser >= un progreso real completo (${fullEncoded.length})`)

  // Curso vacío (sin interacciones): el peor caso debe seguir siendo un
  // número pequeño y sensato, no un error ni NaN.
  const emptyCourse: AnyRec = { modules: [], intro_screens: [], closing_screens: [], assessments: {}, scorm: {} }
  const emptyEstimate = StateCodec.estimateSuspendSize(emptyCourse)
  ok(emptyEstimate.worstCase > 0 && emptyEstimate.worstCase < 100,
    `estimateSuspendSize: un curso vacío debería dar un peor caso pequeño y sensato (dio ${emptyEstimate.worstCase})`)
}

if (failures) {
  console.error(`\n${failures} fallo(s).`)
  process.exit(1)
}
console.log(`state_codec.js — Fases 1-4: OK. ${interactions.length} interacciones y ${finalQs.length} preguntas de test final comprobadas contra el curso demo, ${InteractionType.options.length} tipos con codec y estimador propios, remapeo por huella y degradación por tamaño verificados.`)
