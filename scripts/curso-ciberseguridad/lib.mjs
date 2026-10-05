/**
 * Librería común para generar los .scormproj del programa «Ciberseguridad en
 * centros sociosanitarios» por script (un curso = un fichero cN-*.mjs).
 *
 *   npx tsx scripts/curso-ciberseguridad/c1-fundamentos.mjs
 *
 * Construye el course.json con un DSL corto (CourseBuilder + ix.*), lo pasa por el
 * schema Zod REAL del editor (rellena defaults) y por `validateCourse` (los mismos
 * avisos que verá el autor), y empaqueta el ZIP `.scormproj` (course.json + assets/).
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import JSZip from 'jszip'
import { Course } from '../../src/schema/course.schema.ts'
import { validateCourse } from '../../src/validation/validators.ts'
import { estimateScreensSync, formatEstimatedDuration } from '../../src/report/estimateDuration.ts'

const HERE = dirname(fileURLToPath(import.meta.url))
export const OUT_DIR = join(HERE, '..', '..', 'docs', 'curso-ciberseguridad', 'scormproj')
const IMG_DIR = join(HERE, '..', '..', 'docs', 'curso-ciberseguridad', 'imagenes')

const pad = (n, w = 2) => String(n).padStart(w, '0')

/** Opciones `[texto, correcta?, feedback?]` → InteractionOption con id a, b, c… */
function opts(list) {
  return list.map((o, i) => {
    const [text, ok, fb] = Array.isArray(o) ? o : [o.t, o.ok, o.fb]
    const out = { id: String.fromCharCode(97 + i), text }
    if (ok) out.correct = true
    else out.correct = false
    if (fb) out.feedback = fb
    return out
  })
}
const fbk = (correct, incorrect, explanation = '') => ({ correct, incorrect, explanation })

/**
 * Fábricas de interacción. Devuelven la interacción SIN id (la pone la pantalla).
 * Campos de texto corto: solo **negrita**, *cursiva* y [enlaces](url).
 */
export const ix = {
  /** Test de opción única. options: [[texto, correcta, feedback]] */
  single(prompt, options, f, o = {}) {
    return { type: 'single_choice', prompt, instructions: o.instructions || '', options: opts(options), feedback: f, scored: o.scored ?? true, points: o.points ?? 1, attempts: o.attempts ?? 2 }
  },
  tf(prompt, isTrue, f, o = {}) {
    return { type: 'true_false', prompt, instructions: o.instructions || '', options: opts([['Verdadero', isTrue], ['Falso', !isTrue]]), feedback: f, scored: o.scored ?? true, points: o.points ?? 1, attempts: o.attempts ?? 2 }
  },
  /** Decisión ante un caso. options: [[texto, correcta, feedback]] */
  scenario(scenario, prompt, options, f, o = {}) {
    return { type: 'scenario_decision', prompt, instructions: o.instructions || '', options: opts(options), config: { scenario }, feedback: f, scored: o.scored ?? true, points: o.points ?? 1, attempts: o.attempts ?? 2 }
  },
  /** Clasificar elementos en grupos. groups: [[id, etiqueta]], items: [[texto, idGrupo]] */
  classify(prompt, groups, items, f, o = {}) {
    return {
      type: 'classification', prompt, instructions: o.instructions || 'Arrastra cada elemento a su grupo y pulsa Comprobar.',
      options: items.map(([text, group], i) => ({ id: `o${i + 1}`, text, group })),
      config: { groups: groups.map(([id, label]) => ({ id, label })) }, feedback: f, scored: o.scored ?? true, points: o.points ?? 1, attempts: o.attempts ?? 2,
    }
  },
  /** Emparejar. pairs: [[izquierda, derecha]] (cada derecha = un grupo) */
  match(prompt, pairs, f, o = {}) {
    const groups = pairs.map(([, r], i) => ({ id: `g${i + 1}`, label: r }))
    return {
      type: 'match_pairs', prompt, instructions: o.instructions || 'Une cada elemento con su pareja y pulsa Comprobar.',
      options: pairs.map(([l], i) => ({ id: `o${i + 1}`, text: l, group: `g${i + 1}` })),
      config: { groups }, feedback: f, scored: o.scored ?? true, points: o.points ?? 1, attempts: o.attempts ?? 2,
    }
  },
  /** Ordenar pasos (se dan en el orden correcto). */
  sort(prompt, steps, f, o = {}) {
    return {
      type: 'sort_steps', prompt, instructions: o.instructions || 'Ordena los pasos arrastrándolos y pulsa Comprobar.',
      config: { steps: steps.map((text, i) => ({ id: `p${i + 1}`, text, order: i + 1 })) }, feedback: f, scored: o.scored ?? true, points: o.points ?? 1, attempts: o.attempts ?? 2,
    }
  },
  /** Completar huecos: text con [[respuesta]]. */
  fill(prompt, text, distractors, f, o = {}) {
    return { type: 'fill_blanks', prompt, instructions: o.instructions || 'Elige la palabra correcta en cada hueco.', config: { text, distractors: distractors || [] }, feedback: f, scored: o.scored ?? true, points: o.points ?? 1, attempts: o.attempts ?? 2 }
  },
  accordion: (items, prompt = '') => ({ type: 'accordion', prompt, config: { items: items.map(([title, body]) => ({ title, body })) }, scored: false }),
  tabs: (items, prompt = '') => ({ type: 'tabs', prompt, config: { items: items.map(([title, body]) => ({ title, body })) }, scored: false }),
  flip: (cards, prompt = '') => ({ type: 'flip_cards', prompt, config: { cards: cards.map(([front, back]) => ({ front, back })) }, scored: false }),
  flash: (cards, prompt = '') => ({ type: 'flashcards', prompt, config: { cards: cards.map(([front, back]) => ({ front, back })) }, scored: false }),
  /** milestones: [[label, title, body]] */
  timeline: (ms, prompt = '') => ({ type: 'timeline', prompt, config: { milestones: ms.map(([label, title, body]) => ({ label, title, body })) }, scored: false }),
  wordsearch: (words, prompt = 'Encuentra las palabras ocultas.') => ({ type: 'word_search', prompt, config: { words }, scored: false }),
  /** entries: [[PALABRA, pista]] */
  crossword: (entries, prompt = 'Resuelve el crucigrama.') => ({ type: 'crossword', prompt, config: { entries: entries.map(([word, clue]) => ({ word, clue })) }, scored: false }),
  /** items: [[pista, respuesta]] */
  az: (items, prompt = 'Rosco: escribe la respuesta o pasa palabra.') => ({ type: 'az_quiz', prompt, config: { items: items.map(([clue, answer]) => ({ clue, answer })) }, scored: false }),
  /** Reflexión guiada con rúbrica de autoevaluación. */
  casep: (prompt, rubric, f = {}) => ({ type: 'case_practice', prompt, config: { rubric: rubric.map((label) => ({ label })) }, feedback: { correct: '', incorrect: '', explanation: f.explanation || '' }, scored: false }),
  /** cards: [{image, alt, title, text}] (image = ruta assets/img/...) */
  imageCards: (cards, prompt = '') => ({ type: 'image_cards', prompt, config: { cards }, scored: false }),
  /** Zonas sobre imagen. spots: [{x,y,w,h,label,correct,feedback}] (en %). */
  hotspots: (image, alt, spots, prompt, f, o = {}) => ({
    type: 'hotspots', prompt, instructions: o.instructions || 'Toca las zonas de la imagen.',
    config: { image, alt, spots: spots.map((s, i) => ({ id: `z${i + 1}`, ...s })) }, feedback: f || fbk('¡Bien visto!', 'Revisa la imagen.'), scored: o.scored ?? false, points: o.points ?? 1,
  }),
  beforeAfter: (before, beforeAlt, after, afterAlt, labels = {}, prompt = '') => ({
    type: 'before_after', prompt, config: { before_image: before, before_alt: beforeAlt, after_image: after, after_alt: afterAlt, before_label: labels.before || 'Antes', after_label: labels.after || 'Después' }, scored: false,
  }),
  /** Imagen oculta. questions: [{prompt, options:[{text, correct, feedback}]}] */
  hidden: (image, alt, questions, prompt = '') => ({ type: 'hidden_image', prompt, config: { image, alt, questions }, scored: false }),
  puzzle: (image, alt, cols = 3, rows = 3, prompt = '') => ({ type: 'puzzle', prompt, config: { image, alt, cols, rows }, scored: false }),
  /**
   * Interactivo a medida (HTML+CSS+JS) en iframe aislado. Usa window.MeEmbed (ver
   * docs/html-embed-contract.md). `require_completion`: bloquea hasta MeEmbed.complete().
   */
  html: ({ html, css, js, height, require_completion = false, state_max = 0, est_seconds, prompt = '' }) => ({
    // est_seconds: tiempo real estimado de la actividad (s); sin él, el editor cuenta 30 s.
    type: 'html_embed', prompt, config: { html, css, js, ...(height ? { height } : {}), require_completion, state_max, ...(est_seconds ? { est_seconds } : {}) }, scored: false,
  }),
}

/** Preguntas del test final: `[prompt, [[texto, ok, fb]...], explicación, nºObjetivo]`. */
export class CourseBuilder {
  constructor(o) {
    this.o = o
    this.assets = {}
    this.objectives = o.objectives || []
    this.sN = 0
    this.intro_screens = []
    this.modules = []
    this.glossaryList = []
    this.bibList = []
    this.final = null
    this.closing_screens = []
  }

  /** Texto exacto del objetivo nº i (0-based) o el propio string. */
  obj(i) { return typeof i === 'number' ? this.objectives[i] : i }

  asset(path, data) {
    if (!path.startsWith('assets/')) throw new Error('asset: la ruta debe empezar por assets/ → ' + path)
    this.assets[path] = typeof data === 'string' ? Buffer.from(data, 'utf8') : data
    return path
  }

  /** Copia un fichero local al paquete. */
  assetFile(path, file) { return this.asset(path, readFileSync(file)) }

  /** Crea una pantalla (objeto Screen, sin añadirla a ningún contenedor). */
  makeScreen(s) {
    this.sN += 1
    const id = `s${pad(this.sN)}`
    const t = s.type || 'content'
    const out = {
      id, type: t, title: s.title,
      objective: t === 'cover' || t === 'summary' ? (s.obj != null ? this.obj(s.obj) : '') : this.obj(s.obj ?? 0),
      student_text: s.text || '',
      source_refs: s.src || [],
      interaction: null,
      required: s.required ?? true,
      min_time_seconds: 0,
      transcript: s.transcript || '',
      editor_notes: s.notes || [],
      status: 'ok',
      accessibility: { alt_text_ok: true, keyboard_ok: true, contrast_ok: true },
    }
    if (s.img) {
      out.visual_resource = { kind: 'image', src: s.img.src, alt: s.img.alt, caption: s.img.caption || '', layout: s.img.layout || 'top', ...(s.img.width ? { media_width: String(s.img.width) } : {}), ...(s.img.full ? { media_full: true } : {}), media_align: s.img.align || 'center', tracks: [], has_voice: false }
    } else if (s.video) {
      out.visual_resource = { kind: 'video_youtube', src: s.video.id, alt: '', caption: s.video.caption || '', layout: 'top', media_ratio: s.video.ratio || '16x9', tracks: [], has_voice: false }
      out.transcript = s.video.transcript || out.transcript
    } else {
      out.visual_resource = { kind: 'none', src: '', alt: '', tracks: [], has_voice: false }
    }
    if (s.ix) {
      out.interaction = {
        id: `${id}_i01`, prompt: '', instructions: '', options: [], config: {},
        feedback: fbk('Correcto.', 'Revisa tu respuesta.'), scored: false, points: 0, attempts: 1, retries: 0, source_refs: [],
        ...s.ix,
      }
      if (s.ixTop) out.interaction_layout = 'top'
    }
    return out
  }

  intro(s) { this.intro_screens.push(this.makeScreen(s)); return this }
  closing(s) { this.closing_screens.push(this.makeScreen(s)); return this }

  /** Abre un módulo nuevo (por defecto basta con el primero, que se crea solo). */
  module(title) {
    const m = { id: `m${this.modules.length + 1}`, title, screens: [], units: [] }
    this.modules.push(m)
    return m
  }

  /** Abre una unidad en el módulo actual y devuelve un ayudante `add(screen)`. */
  unit(title, summary) {
    if (!this.modules.length) this.module(this.o.moduleTitle || 'Contenido')
    const m = this.modules[this.modules.length - 1]
    const nUnits = this.modules.reduce((n, mm) => n + mm.units.length, 0)
    const u = { id: `u${nUnits + 1}`, title, summary, status: 'ok', screens: [] }
    m.units.push(u)
    const api = { unit: u, add: (s) => { u.screens.push(this.makeScreen({ ...s })); return api } }
    return api
  }

  glossary(term, definition) { this.glossaryList.push({ term, definition, source_refs: [] }); return this }
  bib(ref, url = '') { this.bibList.push({ ref, url }); return this }

  /** questions: [[prompt, options, explanation, nºObjetivo, (opcional) feedbackAcierto]] */
  finalTest(title, questions, instructions = '') {
    const firstUnit = this.modules[0]?.units[0]?.id || 'u1'
    this.final = {
      id: 'A01', unit_id: firstUnit, title, instructions, one_question_per_screen: true,
      questions: questions.map(([prompt, options, explanation, obj, okFb], i) => ({
        id: `Q${pad(i + 1)}`, prompt, type: 'single_choice', options: opts(options),
        feedback: fbk(okFb || '¡Correcto!', 'No es esa. Fíjate en la explicación.', explanation), points: 1, learning_objective: this.obj(obj ?? 0), source_refs: [],
      })),
    }
    return this
  }

  toJson() {
    const o = this.o
    return {
      schema_version: '1.1.0',
      course: { id: o.id, title: o.title, subtitle: o.subtitle || '', description: o.description || '', authoring_entity: 'MECOHISA S.L.', source_document: o.source_document || 'Documento base: Ciberseguridad en centros sociosanitarios', estimated_hours: o.hours || 1.5, language: 'es' },
      module_label: o.moduleLabel || 'Bloque',
      unit_label: o.unitLabel || 'Lección',
      scorm: {
        version: '1.2', identifier: o.identifier, title: o.scormTitle || o.title, mastery_score: 70,
        rules: { min_required_screens_pct: 100, require_interactions: true, min_score: 70, attempts_allowed: 0, score_source: 'mixed', mixed_final_weight: 70, navigation: 'mixed', allow_resume: true },
      },
      shell: { brand: '', primary_color: o.primary || '#0b5fff', accent_color: o.accent || '#6DC3C0', show_sidebar: true, show_progress: true, language: 'es', motion: 'rich', motion_speed: 'normal' },
      intro_screens: this.intro_screens,
      modules: this.modules,
      ...(this.closing_screens.length ? { closing_screens: this.closing_screens } : {}),
      assessments: { unit_tests: [], final_test: this.final },
      glossary: this.glossaryList,
      bibliography: this.bibList,
      quality_checklist: { 'Objetivos alineados con las evaluaciones': true, 'Imágenes con texto alternativo': true, 'Fuentes oficiales citadas': true },
    }
  }

  /**
   * Sustituye las ilustraciones SVG por las imágenes profesionales generadas (docs/curso-ciberseguridad/
   * imagenes/optimizadas/<nombre>.jpg) cuando existen con el mismo nombre base. Reescribe rutas, aplica el
   * alt de `alts.json` y, en las escenas con hotspots, las zonas de `hotspots.json` (por etiqueta).
   */
  applyGeneratedImages(raw) {
    const optDir = join(IMG_DIR, 'optimizadas')
    const readJson = (f) => (existsSync(join(IMG_DIR, f)) ? JSON.parse(readFileSync(join(IMG_DIR, f), 'utf8')) : {})
    const alts = readJson('alts.json'), zones = readJson('hotspots.json')
    const swapped = new Map() // ruta nueva → nombre base
    for (const p of Object.keys(this.assets)) {
      const m = p.match(/^assets\/img\/(.+)\.svg$/)
      if (!m || !existsSync(join(optDir, `${m[1]}.jpg`))) continue
      const np = `assets/img/${m[1]}.jpg`
      this.assets[np] = readFileSync(join(optDir, `${m[1]}.jpg`))
      delete this.assets[p]
      swapped.set(np, m[1])
      raw = JSON.parse(JSON.stringify(raw).split(p).join(np))
    }
    const screens = [...raw.intro_screens, ...(raw.closing_screens || []), ...raw.modules.flatMap((mod) => [...mod.screens, ...(mod.closing_screens || []), ...mod.units.flatMap((u) => u.screens)])]
    for (const s of screens) {
      const vr = s.visual_resource
      if (vr && swapped.has(vr.src) && alts[swapped.get(vr.src)]) vr.alt = alts[swapped.get(vr.src)]
      const cfg = s.interaction && s.interaction.config
      if (cfg && swapped.has(cfg.image)) {
        const base = swapped.get(cfg.image)
        if (alts[base]) cfg.alt = alts[base]
        if (s.interaction.type === 'hotspots') {
          for (const sp of cfg.spots || []) {
            const z = (zones[base] || {})[sp.label]
            if (z) [sp.x, sp.y, sp.w, sp.h] = z
            else console.log(`  ⚠ hotspots ${base}: sin zona nueva para «${sp.label}» (se mantiene la del SVG)`)
          }
        }
      }
    }
    if (swapped.size) console.log(`  ▸ ${swapped.size} ilustración(es) sustituida(s) por imagen generada`)
    return raw
  }

  /** Valida (Zod + validateCourse), informa y escribe `<id>.scormproj`. */
  async build({ outDir = OUT_DIR, strict = true } = {}) {
    const raw = this.applyGeneratedImages(this.toJson())
    const parsed = Course.safeParse(raw)
    if (!parsed.success) {
      console.error('✗ ZOD:', JSON.stringify(parsed.error.issues.slice(0, 15), null, 2))
      process.exitCode = 1
      throw new Error('course.json no cumple el schema')
    }
    const course = parsed.data
    const res = validateCourse(course)
    const errs = res.issues.filter((i) => i.severity === 'error')
    const warns = res.issues.filter((i) => i.severity === 'warning')
    for (const i of [...errs, ...warns]) console.log(`  ${i.severity === 'error' ? '✗' : '⚠'} [${i.code}] ${i.location || ''}: ${i.message}`)
    if (errs.length && strict) { process.exitCode = 1; throw new Error(`${errs.length} errores de validación`) }

    const json = JSON.stringify(course, null, 2)
    const referenced = new Set([...json.matchAll(/assets\/[A-Za-z0-9_\-./]+\.[A-Za-z0-9]+/g)].map((m) => m[0]))
    const missing = [...referenced].filter((p) => !this.assets[p])
    if (missing.length) throw new Error('Faltan binarios de assets: ' + missing.join(', '))
    const orphans = Object.keys(this.assets).filter((p) => !referenced.has(p))

    const zip = new JSZip()
    zip.file('course.json', json)
    for (const [p, d] of Object.entries(this.assets)) zip.file(p, d)
    const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'STORE' })
    mkdirSync(outDir, { recursive: true })
    const file = join(outDir, `${course.course.id}.scormproj`)
    writeFileSync(file, buf)

    const est = estimateScreensSync(course)
    const nQ = course.assessments.final_test?.questions.length || 0
    // El test final no entra en la estimación del editor: ~30 s por pregunta.
    const total = est.reduce((n, e) => n + e.syncSeconds, 0) + nQ * 30
    const screens = est.length
    const assetKB = Math.round(Object.values(this.assets).reduce((n, d) => n + d.length, 0) / 1024)
    console.log(`✓ ${course.course.id}: ${screens} pantallas · duración estimada ≈ ${formatEstimatedDuration(total)} · ${Object.keys(this.assets).length} assets (${assetKB} KB) · ${errs.length} errores, ${warns.length} avisos · ${(buf.length / 1024).toFixed(0)} KB`)
    if (orphans.length) console.log('  assets sin referenciar:', orphans.join(', '))
    return { file, course, errors: errs, warnings: warns, seconds: total }
  }
}

export { fbk }
