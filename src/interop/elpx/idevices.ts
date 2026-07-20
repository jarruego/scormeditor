/**
 * Constructores de iDevices de eXeLearning a partir de una `Interaction` del
 * editor. Cada función devuelve un `ElpxComponent` (typeName + htmlView +
 * jsonProperties) listo para incrustar en un bloque del `content.xml`.
 *
 * Dos estrategias, según el tipo:
 *  - **Nativo**: cuando el iDevice de eXe es equivalente y su estado es
 *    autocontenido y reproducible con fidelidad (word-search, crossword,
 *    complete, quick-questions, relate, flipcards, beforeafter). Se reconstruye
 *    su `*-DataGame` (cifrado o plano) con los `msgs`/flags reales del corpus.
 *  - **Degradado a `text`**: para el resto, se vuelca el contenido a HTML
 *    legible y editable (títulos, ítems, preguntas con la correcta marcada…).
 *    No se pierde contenido y el autor puede reconstruir el interactivo en eXe.
 *
 * El texto del usuario se escapa siempre (misma invariante anti-XSS que la
 * carcasa) antes de convertir su markdown ligero.
 */
import type { Interaction, InteractionOption } from '../../schema/course.schema'
import type { ElpxComponent } from './types'
import { esc, rich, stripInline, mdToHtml } from './mdToHtml'
import { encodeDataGame, plainDataGame } from './datagame'
import {
  MSGS_WORDSEARCH,
  MSGS_CROSSWORD,
  MSGS_COMPLETE,
  MSGS_QUICKQUESTIONS,
  MSGS_RELATE,
  MSGS_FLIPCARDS,
  MSGS_BEFOREAFTER,
} from './gameMessages'

/** Itinerario por defecto (sin pista ni código de acceso), común a los juegos. */
const ITINERARY = {
  showClue: false,
  clueGame: '',
  percentageClue: 40,
  showCodeAccess: false,
  codeAccess: '',
  messageCodeAccess: '',
}

/** Envuelve un HTML en un párrafo si viene vacío, para no dejar iDevices mudos. */
function orEmpty(html: string): string {
  return html && html.trim() ? html : '<p></p>'
}

// ---------------------------------------------------------------------------
// iDevice `text` (contenido y degradación)
// ---------------------------------------------------------------------------

/** Construye el iDevice `text` de eXe a partir de HTML ya renderizado. */
export function textIdevice(ideviceId: string, innerHtml: string): ElpxComponent {
  const html = orEmpty(innerHtml)
  const htmlView =
    '<div class="exe-text-template"><div class="textIdeviceContent">\n' +
    '            <div class="exe-text-activity">\n' +
    '                <div><div class="exe-text">\n' +
    html +
    '\n</div><p class="clearfix"></p></div>\n' +
    '            </div></div></div>'
  const jsonProperties = JSON.stringify({
    ideviceId,
    textInfoDurationInput: '',
    textInfoDurationTextInput: 'Duración',
    textInfoParticipantsInput: '',
    textInfoParticipantsTextInput: 'Agrupamiento',
    textTextarea: '\n' + html + '\n',
  })
  return { typeName: 'text', htmlView, jsonProperties }
}

/** Encabezado opcional de una interacción degradada (enunciado + instrucciones). */
function promptHeader(it: Interaction, resolve: (s: string) => string): string {
  let h = ''
  if (it.prompt && it.prompt.trim()) h += `<p><strong>${rich(it.prompt)}</strong></p>`
  if (it.instructions && it.instructions.trim()) h += mdToHtml(it.instructions, resolve)
  return h
}

/** Lista de opciones marcando la correcta (✓) y su feedback, para degradación. */
function optionsList(options: InteractionOption[]): string {
  if (!options.length) return ''
  const items = options
    .map((o) => {
      const mark = o.correct ? '✔ ' : ''
      const fb = o.feedback ? ` — <em>${rich(o.feedback)}</em>` : ''
      const strong = o.correct ? `<strong>${rich(o.text)}</strong>` : rich(o.text)
      return `<li>${mark}${strong}${fb}</li>`
    })
    .join('')
  return `<ul>${items}</ul>`
}

// ---------------------------------------------------------------------------
// Helpers de construcción de juegos
// ---------------------------------------------------------------------------

const gEval = (id: string) =>
  `<div class="game-evaluation-ids js-hidden" data-id="${id}" data-evaluationb="false" data-evaluationid=""></div>`

const instrHtml = (it: Interaction) =>
  it.prompt && it.prompt.trim() ? `<p>${rich(it.prompt)}</p>` : '<p></p>'

// ---------------------------------------------------------------------------
// word-search (sopa de letras) — DataGame cifrado
// ---------------------------------------------------------------------------

export function wordSearchIdevice(it: Interaction, id: string): ElpxComponent {
  const words: string[] = ((it.config?.words as string[]) || [])
    .map((w) => String(w || '').trim())
    .filter(Boolean)
  const data = {
    typeGame: 'Sopa',
    instructions: instrHtml(it),
    showMinimize: false,
    itinerary: ITINERARY,
    wordsGame: words.map((w) => ({
      word: w,
      definition: '',
      x: 0,
      y: 0,
      author: '',
      alt: '',
      url: '',
      audio: '',
      percentageShow: null,
    })),
    isScorm: 0,
    textButtonScorm: 'Guardar la puntuación',
    repeatActivity: true,
    weighted: 100,
    textFeedBack: '',
    textAfter: '',
    feedBack: false,
    percentajeFB: 100,
    version: 1,
    percentajeQuestions: 100,
    time: 0,
    diagonals: false,
    reverses: false,
    showResolve: true,
    evaluation: false,
    evaluationID: '',
    id,
    msgs: MSGS_WORDSEARCH,
  }
  const htmlView =
    '<div class="sopa-IDevice">' +
    gEval(id) +
    '<div class="sopa-version js-hidden">2</div>' +
    `<div class="sopa-instructions">${instrHtml(it)}</div>` +
    '<div class="sopa-feedback-game"></div>' +
    `<div class="sopa-DataGame js-hidden">${encodeDataGame(data)}</div>` +
    '<div class="sopa-bns js-hidden">Su navegador no es compatible con esta herramienta.</div>' +
    '</div>'
  return { typeName: 'word-search', htmlView, jsonProperties: JSON.stringify({ ideviceId: id, textTextarea: htmlView }) }
}

// ---------------------------------------------------------------------------
// crossword (crucigrama) — DataGame cifrado
// ---------------------------------------------------------------------------

export function crosswordIdevice(it: Interaction, id: string): ElpxComponent {
  const entries = (it.config?.entries as Array<{ word?: string; clue?: string }>) || []
  const data = {
    typeGame: 'Crucigrama',
    instructions: instrHtml(it),
    showMinimize: false,
    showSolution: true,
    itinerary: ITINERARY,
    wordsGame: entries
      .filter((e) => e && String(e.word || '').trim())
      .map((e) => ({
        word: String(e.word || '').trim(),
        definition: String(e.clue || '').trim(),
        x: 0,
        y: 0,
        author: '',
        alt: '',
        url: '',
        audio: '',
        percentageShow: null,
      })),
    isScorm: 0,
    hasBack: false,
    urlBack: '',
    textButtonScorm: 'Guardar la puntuación',
    repeatActivity: true,
    weighted: 100,
    textFeedBack: '',
    textAfter: '',
    caseSensitive: false,
    tilde: true,
    feedBack: false,
    percentajeFB: 100,
    version: 2,
    evaluation: false,
    evaluationID: '',
    percentajeQuestions: '100',
    difficulty: '100',
    time: '0',
    authorBackImage: '',
    id,
    msgs: MSGS_CROSSWORD,
  }
  const htmlView =
    '<div class="crucigrama-IDevice">' +
    gEval(id) +
    '<div class="crucigrama-version js-hidden">1</div>' +
    '<div class="crucigrama-feedback-game"></div>' +
    `<div class="crucigrama-instructions gameQP-instructions">${instrHtml(it)}</div>` +
    `<div class="crucigrama-DataGame js-hidden">${encodeDataGame(data)}</div>` +
    '<div class="crucigrama-bns js-hidden">Su navegador no es compatible con esta herramienta.</div>' +
    '</div>'
  return { typeName: 'crossword', htmlView, jsonProperties: JSON.stringify({ ideviceId: id, textTextarea: htmlView }) }
}

// ---------------------------------------------------------------------------
// complete (rellenar huecos) — DataGame cifrado + texto legible
// ---------------------------------------------------------------------------

/**
 * Traduce el texto de `fill_blanks` (huecos `[[respuesta]]`, distractores en
 * `config.distractors`) al formato de eXe (`@@respuesta|distr1|distr2@@`).
 */
function toCompleteText(text: string, distractors: string[]): string {
  const extra = distractors.filter(Boolean)
  return String(text || '').replace(/\[\[(.+?)\]\]/g, (_m, answer) => {
    const parts = [String(answer).trim(), ...extra]
    return '@@' + parts.join('|') + '@@'
  })
}

export function completeIdevice(it: Interaction, id: string): ElpxComponent {
  const raw = String(it.config?.text || '')
  const distractors = ((it.config?.distractors as string[]) || []).map((d) => String(d || '').trim())
  const completeText = toCompleteText(raw, distractors)
  const htmlText = '<p>' + esc(completeText).replace(/@@(.+?)@@/g, (m) => m) + '</p>'
  const data = {
    typeGame: 'Completa',
    instructions: instrHtml(it),
    textText: encodeURIComponent(htmlText),
    showMinimize: false,
    itinerary: ITINERARY,
    caseSensitive: false,
    isScorm: 0,
    textButtonScorm: 'Guardar la puntuación',
    repeatActivity: true,
    weighted: 100,
    textFeedBack: '',
    textAfter: '',
    feedBack: false,
    percentajeFB: 100,
    version: 1,
    estrictCheck: false,
    wordsSize: false,
    time: 0,
    type: 0,
    wordsErrors: '',
    attempsNumber: it.attempts || 2,
    percentajeError: 20,
    showSolution: false,
    wordsLimit: true,
    evaluation: false,
    evaluationID: '',
    id,
    msgs: MSGS_COMPLETE,
  }
  const htmlView =
    '<div class="completa-IDevice">' +
    gEval(id) +
    '<div class="completa-feedback-game"></div>' +
    `<div class="completa-instructions">${instrHtml(it)}</div>` +
    `<div class="completa-DataGame js-hidden">${encodeDataGame(data)}</div>` +
    `<div class="completa-text-game js-hidden">${htmlText}</div>` +
    '<div class="cmpt-bns js-hidden">Su navegador no es compatible con esta herramienta.</div>' +
    '</div>'
  return { typeName: 'complete', htmlView, jsonProperties: JSON.stringify({ ideviceId: id, textTextarea: htmlView }) }
}

// ---------------------------------------------------------------------------
// quick-questions (preguntas de opción) — DataGame cifrado
// ---------------------------------------------------------------------------

export function quickQuestionsIdevice(it: Interaction, id: string): ElpxComponent {
  // Una interacción del editor = una pregunta con sus opciones.
  const opts = it.options || []
  const solution = Math.max(0, opts.findIndex((o) => o.correct)) + 1 // eXe usa 1-based
  const question = {
    type: 1,
    time: 0,
    numberOptions: opts.length,
    x: 0,
    y: 0,
    author: '',
    alt: '',
    customScore: 1,
    url: '',
    audio: '',
    soundVideo: 1,
    imageVideo: 1,
    iVideo: 0,
    fVideo: 0,
    silentVideo: 0,
    tSilentVideo: 0,
    eText: '',
    quextion: it.prompt ? `<p>${rich(it.prompt)}</p>` : '<p></p>',
    options: opts.map((o) => stripInline(o.text)),
    solution,
    msgHit: it.feedback?.correct || '',
    msgError: it.feedback?.incorrect || '',
  }
  const data = {
    asignatura: '',
    author: '',
    authorVideo: '',
    typeGame: 'QuExt',
    endVideo: 0,
    idVideo: '',
    startVideo: 0,
    instructionsExe: encodeURIComponent(instrHtml(it)),
    instructions: stripInline(it.prompt || 'Elija la respuesta correcta'),
    showMinimize: false,
    optionsRamdon: false,
    answersRamdon: false,
    showSolution: true,
    timeShowSolution: 3,
    useLives: false,
    numberLives: 3,
    itinerary: ITINERARY,
    questionsGame: [question],
    isScorm: 0,
    textButtonScorm: 'Guardar la puntuación',
    repeatActivity: true,
    weighted: 100,
    title: '',
    customScore: false,
    textAfter: '',
    textFeedBack: '',
    gameMode: 0,
    feedBack: false,
    percentajeFB: 100,
    version: 2,
    customMessages: false,
    percentajeQuestions: 100,
    evaluation: false,
    evaluationID: '',
    id,
    msgs: MSGS_QUICKQUESTIONS,
  }
  const htmlView =
    '<div class="quext-IDevice">' +
    gEval(id) +
    `<div class="quext-instructions QXTP-instructions">${instrHtml(it)}</div>` +
    '<div class="quext-version js-hidden">2</div>' +
    '<div class="quext-feedback-game"></div>' +
    `<div class="quext-DataGame js-hidden">${encodeDataGame(data)}</div>` +
    '<div class="quext-bns js-hidden">Su navegador no es compatible con esta herramienta.</div>' +
    '</div>'
  return { typeName: 'quick-questions', htmlView, jsonProperties: JSON.stringify({ ideviceId: id, textTextarea: htmlView }) }
}

// ---------------------------------------------------------------------------
// relate (relacionar parejas) — DataGame plano
// ---------------------------------------------------------------------------

/** Card de flipcards/relate con valores por defecto y textos front/back. */
function relCard(front: string, back: string, frontImg: string, backAudio: string) {
  return {
    url: frontImg,
    x: 0,
    y: 0,
    author: '',
    alt: '',
    audio: '',
    color: '#000000',
    backcolor: '#ffffff',
    eText: encodeURIComponent(front),
    urlBk: '',
    xBk: 0,
    yBk: 0,
    authorBk: '',
    altBk: '',
    audioBk: backAudio,
    colorBk: '#000000',
    backcolorBk: '#ffffff',
    eTextBk: encodeURIComponent(back),
  }
}

export function relateIdevice(
  it: Interaction,
  id: string,
  resolve: (s: string) => string,
): ElpxComponent {
  // `match_pairs`: cada opción tiene `text` (descripción) y `group` (id); el otro
  // lado de la pareja es el `label` del grupo, en `config.groups: [{id,label}]`.
  const opts = it.options || []
  const groups = (it.config?.groups as Array<{ id?: string; label?: string }>) || []
  const labelOf = new Map(groups.map((g) => [String(g.id), String(g.label || '')]))
  const cards = opts
    .filter((o) => o.group && labelOf.has(o.group))
    .map((o) => relCard(stripInline(labelOf.get(o.group!) || ''), stripInline(o.text), '', ''))
  void resolve
  const data = {
    typeGame: 'Relaciona',
    author: '',
    randomCards: true,
    instructions: instrHtml(it),
    showMinimize: false,
    itinerary: ITINERARY,
    cardsGame: cards,
    isScorm: 0,
    textButtonScorm: 'Guardar la puntuación',
    repeatActivity: true,
    weighted: 100,
    textAfter: '',
    version: 2,
    percentajeCards: 100,
    type: 1,
    showSolution: true,
    timeShowSolution: 3,
    time: 1,
    evaluation: false,
    evaluationID: '',
    id,
    msgs: MSGS_RELATE,
  }
  const htmlView =
    '<div class="relaciona-IDevice">' +
    `<div class="relaciona-instructions gameQP-instructions">${instrHtml(it)}</div>` +
    `<div class="relaciona-DataGame js-hidden">${plainDataGame(data)}</div>` +
    gEval(id) +
    '<div class="relaciona-bns js-hidden">Su navegador no es compatible con esta herramienta.</div>' +
    '</div>'
  return { typeName: 'relate', htmlView, jsonProperties: JSON.stringify({ ideviceId: id, textTextarea: htmlView }) }
}

// ---------------------------------------------------------------------------
// flipcards (tarjetas de memoria) — DataGame plano
// ---------------------------------------------------------------------------

export function flipcardsIdevice(it: Interaction, id: string): ElpxComponent {
  const cards = ((it.config?.cards as Array<{ front?: string; back?: string }>) || [])
    .filter((c) => c && (String(c.front || '').trim() || String(c.back || '').trim()))
    .map((c) => relCard(stripInline(String(c.front || '')), stripInline(String(c.back || '')), '', ''))
  const data = {
    typeGame: 'FlipCards',
    author: '',
    randomCards: true,
    instructions: instrHtml(it),
    showMinimize: false,
    itinerary: ITINERARY,
    cardsGame: cards,
    isScorm: 0,
    textButtonScorm: 'Guardar la puntuación',
    repeatActivity: false,
    textAfter: '',
    version: 1.3,
    percentajeCards: 100,
    type: 0,
    showSolution: true,
    timeShowSolution: null,
    time: 4,
    evaluation: false,
    evaluationID: '',
    id,
    msgs: MSGS_FLIPCARDS,
  }
  const htmlView =
    '<div class="flipcards-IDevice">' +
    `<div class="flipcards-instructions gameQP-instructions">${instrHtml(it)}</div>` +
    `<div class="flipcards-DataGame js-hidden">${plainDataGame(data)}</div>` +
    '<div class="flipcards-bns js-hidden">Su navegador no es compatible con esta herramienta.</div>' +
    '</div>'
  return { typeName: 'flipcards', htmlView, jsonProperties: JSON.stringify({ ideviceId: id, textTextarea: htmlView }) }
}

// ---------------------------------------------------------------------------
// beforeafter (comparador antes/después) — DataGame plano
// ---------------------------------------------------------------------------

export function beforeAfterIdevice(
  it: Interaction,
  id: string,
  resolve: (s: string) => string,
): ElpxComponent {
  const c = it.config || {}
  const after = resolve(String(c.after_image || ''))
  const before = resolve(String(c.before_image || ''))
  const card = {
    url: after,
    author: '',
    alt: String(c.after_alt || ''),
    eText: '',
    urlBk: before,
    authorBk: '',
    altBk: String(c.before_alt || ''),
    eTextBk: '',
    description: stripInline(it.prompt || ''),
    position: '50',
    vertical: false,
  }
  const data = {
    typeGame: 'BeforeAfter',
    author: '',
    instructions: instrHtml(it),
    isScorm: 0,
    textButtonScorm: 'Guardar la puntuación',
    repeatActivity: true,
    itinerary: ITINERARY,
    weighted: 100,
    cardsGame: [card],
    textAfter: '',
    version: 2,
    evaluation: false,
    evaluationID: '',
    id,
    msgs: MSGS_BEFOREAFTER,
  }
  const links =
    (after ? `<a href="${esc(after)}" class="js-hidden beforeafter-LinkImages">0</a>` : '') +
    (before ? `<a href="${esc(before)}" class="js-hidden beforeafter-LinkImagesBack">0</a>` : '')
  const htmlView =
    '<div class="beforeafter-IDevice">' +
    `<div class="beforeafter-instructions gameQP-instructions">${instrHtml(it)}</div>` +
    `<div class="beforeafter-DataGame js-hidden">${plainDataGame(data)}</div>` +
    links +
    gEval(id) +
    '<div class="beforeafter-bns js-hidden">Su navegador no es compatible con esta herramienta.</div>' +
    '</div>'
  return { typeName: 'beforeafter', htmlView, jsonProperties: JSON.stringify({ ideviceId: id, textTextarea: htmlView }) }
}

// ---------------------------------------------------------------------------
// Degradaciones a `text` por tipo
// ---------------------------------------------------------------------------

/** Vuelca a HTML el contenido de una interacción sin iDevice nativo equivalente. */
export function degradeToTextHtml(
  it: Interaction,
  resolve: (s: string) => string,
): string {
  const cfg = it.config || {}
  let body = promptHeader(it, resolve)

  const titledItems = (key: string, tField = 'title', bField = 'body') => {
    const list = (cfg[key] as Array<Record<string, unknown>>) || []
    return list
      .map((item) => {
        const t = stripInline(String(item[tField] || ''))
        const b = mdToHtml(String(item[bField] || ''), resolve)
        return (t ? `<h4>${esc(t)}</h4>` : '') + b
      })
      .join('')
  }

  switch (it.type) {
    case 'accordion':
    case 'tabs':
      body += titledItems('items')
      break
    case 'flip_cards':
      body += titledItems('cards', 'front', 'back')
      break
    case 'flashcards':
      body += titledItems('cards', 'front', 'back')
      break
    case 'timeline':
      body += ((cfg.milestones as Array<Record<string, unknown>>) || [])
        .map(
          (m) =>
            `<h4>${esc(stripInline(String(m.label || '')))} ${esc(stripInline(String(m.title || '')))}</h4>` +
            mdToHtml(String(m.body || ''), resolve),
        )
        .join('')
      break
    case 'image_cards':
      body += ((cfg.cards as Array<Record<string, unknown>>) || [])
        .map((c) => {
          const img = resolve(String(c.image || ''))
          const alt = esc(stripInline(String(c.alt || '')))
          const t = stripInline(String(c.title || ''))
          return (
            (img ? `<p><img src="${esc(img)}" alt="${alt}"></p>` : '') +
            (t ? `<h4>${esc(t)}</h4>` : '') +
            mdToHtml(String(c.text || ''), resolve)
          )
        })
        .join('')
      break
    case 'single_choice':
    case 'true_false':
    case 'scenario_decision':
      if (cfg.scenario) body += mdToHtml(String(cfg.scenario), resolve)
      body += optionsList(it.options || [])
      break
    case 'classification': {
      // Categorías (label) en `config.groups`; cada opción lleva el id en `group`.
      const defs = (cfg.groups as Array<{ id?: string; label?: string }>) || []
      const labelOf = new Map(defs.map((g) => [String(g.id), String(g.label || g.id)]))
      const buckets = new Map<string, string[]>()
      ;(it.options || []).forEach((o) => {
        const label = labelOf.get(o.group || '') || o.group || '—'
        if (!buckets.has(label)) buckets.set(label, [])
        buckets.get(label)!.push(stripInline(o.text))
      })
      body += Array.from(buckets.entries())
        .map(([g, items]) => `<h4>${esc(g)}</h4><ul>${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`)
        .join('')
      break
    }
    case 'sort_steps':
      body += `<ol>${((cfg.steps as Array<Record<string, unknown>>) || [])
        .slice()
        .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0))
        .map((s) => `<li>${rich(String(s.text || ''))}</li>`)
        .join('')}</ol>`
      break
    case 'az_quiz':
      body += `<ul>${((cfg.items as Array<Record<string, unknown>>) || [])
        .map(
          (q) =>
            `<li><strong>${esc(stripInline(String(q.answer || '')))}</strong>: ${rich(String(q.clue || ''))}</li>`,
        )
        .join('')}</ul>`
      break
    case 'hidden_image':
    case 'video': {
      const img = resolve(String(cfg.image || ''))
      if (img) body += `<p><img src="${esc(img)}" alt="${esc(stripInline(String(cfg.alt || '')))}"></p>`
      body += ((cfg.questions as Array<Record<string, unknown>>) || [])
        .map((q) => {
          const opts = ((q.options as Array<Record<string, unknown>>) || []).map((o) => ({
            id: '',
            text: String(o.text || ''),
            correct: !!o.correct,
          }))
          return `<p><strong>${rich(String(q.prompt || ''))}</strong></p>` + optionsList(opts as InteractionOption[])
        })
        .join('')
      break
    }
    case 'puzzle': {
      const img = resolve(String(cfg.image || ''))
      if (img) body += `<p><img src="${esc(img)}" alt="${esc(stripInline(String(cfg.alt || '')))}"></p>`
      break
    }
    case 'hotspots': {
      const img = resolve(String(cfg.image || ''))
      if (img) body += `<p><img src="${esc(img)}" alt="${esc(stripInline(String(cfg.alt || '')))}"></p>`
      body += `<ul>${((cfg.spots as Array<Record<string, unknown>>) || [])
        .map((s) => `<li>${rich(String(s.label || ''))}</li>`)
        .join('')}</ul>`
      break
    }
    case 'case_practice':
      body += `<ul>${((cfg.rubric as Array<Record<string, unknown>>) || [])
        .map((r) => `<li>${rich(String(r.label || ''))}</li>`)
        .join('')}</ul>`
      break
    case 'html_embed':
      // El HTML a medida se conserva dentro de un aviso (queda editable en eXe).
      body += `<div>${String(cfg.html || '')}</div>`
      break
    default:
      body += optionsList(it.options || [])
  }

  // Explicación pedagógica del feedback, si la hay (no visible en la carcasa,
  // pero útil como material del autor al reeditar en eXe).
  if (it.feedback?.explanation && it.feedback.explanation.trim()) {
    body += `<p><em>${rich(it.feedback.explanation)}</em></p>`
  }
  return body
}
