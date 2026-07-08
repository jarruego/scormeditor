import { z } from 'zod'

/**
 * Schema versionado de course.json.
 *
 * Regla de evolución: cualquier cambio incompatible incrementa SCHEMA_VERSION
 * y añade una entrada en src/schema/migrations.ts. El import siempre pasa por
 * migrate() antes de validar contra el schema actual.
 */
export const SCHEMA_VERSION = '1.0.0'

// ----------------------------------------------------------------------------
// Tipos enumerados
// ----------------------------------------------------------------------------

export const ScreenType = z.enum([
  'cover',
  'objectives',
  'route',
  'content',
  'summary',
  'video',
  'reflection',
  'forum_prompt',
  'unit_quiz',
  'content_placeholder',
])
export type ScreenType = z.infer<typeof ScreenType>

export const InteractionType = z.enum([
  'accordion',
  'tabs',
  'flip_cards',
  'match_pairs',
  'sort_steps',
  'single_choice',
  'true_false',
  'classification',
  'scenario_decision',
  'case_practice',
  'hotspots',
  'video',
  'fill_blanks',
  'timeline',
  'flashcards',
  'html_embed',
  'image_cards',
])
export type InteractionType = z.infer<typeof InteractionType>

export const LessonStatus = z.enum([
  'not attempted',
  'incomplete',
  'completed',
  'passed',
  'failed',
])

export const NavigationMode = z.enum(['free', 'sequential', 'mixed'])

// ----------------------------------------------------------------------------
// Bloques reutilizables
// ----------------------------------------------------------------------------

/** Referencia a la fuente documental original (trazabilidad). */
export const SourceRef = z.object({
  doc: z.string().describe('Identificador del documento fuente (PDF/Word/vídeo)'),
  locator: z.string().optional().describe('Página, sección, timestamp, etc.'),
  quote: z.string().optional().describe('Cita literal preservada'),
  transform: z
    .string()
    .optional()
    .describe('Cómo se transformó el original (resumen, reescritura, ...)'),
})
export type SourceRef = z.infer<typeof SourceRef>

export const AltMedia = z.object({
  alt: z.string().default('').describe('Texto alternativo (obligatorio para imágenes)'),
  caption: z.string().optional(),
})

export const VisualResource = z.object({
  kind: z.enum(['none', 'image', 'video_youtube', 'video_file', 'audio']).default('none'),
  src: z.string().default(''),
  alt: z.string().default(''),
  caption: z.string().optional(),
  poster: z.string().optional(),
  // Subtítulos VTT (uno por idioma) + transcripción asociada al recurso
  tracks: z
    .array(
      z.object({
        lang: z.string().default('es'),
        label: z.string().default('Español'),
        src: z.string(),
        kind: z.enum(['subtitles', 'captions']).default('subtitles'),
      }),
    )
    .default([]),
  has_voice: z.boolean().default(false).describe('Si el medio contiene voz (exige subtítulos)'),
  // Los enums de presentación toleran '' (los GPT a veces lo emiten) → cae al default
  layout: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z
      .enum(['top', 'bottom', 'left', 'right'])
      .default('top')
      .describe('Posición del recurso respecto al texto en pantallas de contenido'),
  ),
  media_width: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z
      .enum(['33', '50', '66'])
      .default('50')
      .describe('Ancho del recurso (% ) en disposiciones laterales left/right'),
  ),
  media_align: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z
      .enum(['left', 'center'])
      .default('left')
      .describe('Alineación horizontal del recurso en disposiciones top/bottom'),
  ),
  media_full: z
    .boolean()
    .default(false)
    .describe('Estira el recurso al 100% del ancho en disposiciones top/bottom'),
})
export type VisualResource = z.infer<typeof VisualResource>

export const Accessibility = z.object({
  alt_text_ok: z.boolean().default(false),
  keyboard_ok: z.boolean().default(true),
  contrast_ok: z.boolean().default(true),
  notes: z.string().optional(),
})

// ----------------------------------------------------------------------------
// Interacciones
// ----------------------------------------------------------------------------

const Feedback = z.object({
  correct: z.string().default('Correcto.'),
  incorrect: z.string().default('Revisa tu respuesta.'),
  explanation: z.string().default('').describe('Explicación pedagógica'),
})

export const InteractionOption = z.object({
  id: z.string(),
  text: z.string(),
  correct: z.boolean().optional(),
  group: z.string().optional().describe('Para clasificación / match pairs'),
  feedback: z.string().optional(),
})
export type InteractionOption = z.infer<typeof InteractionOption>

export const Interaction = z.object({
  id: z.string(),
  type: InteractionType,
  prompt: z.string().default('').describe('Enunciado'),
  instructions: z.string().default(''),
  options: z.array(InteractionOption).default([]),
  // Estructuras específicas (libres por tipo, validadas en runtime por el motor)
  config: z.record(z.any()).default({}),
  feedback: Feedback.default({}),
  scored: z.boolean().default(false),
  points: z.number().default(0),
  attempts: z
    .number()
    .int()
    .min(0)
    .default(1)
    .describe('Intentos permitidos para comprobar la respuesta. 1 por defecto, 0 = ilimitados'),
  retries: z.number().int().min(0).default(0).describe('DEPRECADO: usar attempts'),
  learning_objective: z.string().default('').describe('Objetivo de aprendizaje vinculado'),
  source_refs: z.array(SourceRef).default([]),
})
export type Interaction = z.infer<typeof Interaction>

// ----------------------------------------------------------------------------
// Pantalla
// ----------------------------------------------------------------------------

export const Screen = z.object({
  id: z.string(),
  type: ScreenType,
  title: z.string().default(''),
  objective: z.string().default(''),
  student_text: z.string().default('').describe('Texto para el estudiante (HTML limitado/markdown)'),
  source_refs: z.array(SourceRef).default([]),
  visual_resource: VisualResource.default({}),
  interaction: Interaction.nullable().default(null),
  interaction_layout: z
    .enum(['top', 'bottom'])
    .default('bottom')
    .describe('Posición de la interacción respecto al texto: encima (top) o debajo (bottom)'),
  required: z.boolean().default(true),
  min_time_seconds: z.number().int().min(0).default(0),
  audio_src: z
    .string()
    .default('')
    .describe('Audio de locución/narración de la diapositiva (ruta en assets/media)'),
  transcript: z
    .string()
    .default('')
    .describe('Transcripción de la diapositiva: se muestra SOLO en el botón «Transcripción» y sirve de alternativa textual del audio/vídeo'),
  accessibility: Accessibility.default({}),
  scorm: z
    .object({
      counts_for_completion: z.boolean().default(true),
    })
    .default({}),
  editor_notes: z.array(z.string()).default([]).describe('Notas/avisos editoriales'),
  status: z
    .enum(['ok', 'esqueleto_pendiente_desarrollo', 'borrador'])
    .default('ok'),
})
export type Screen = z.infer<typeof Screen>
/** Forma de entrada del esquema: los campos con default son opcionales (presets/recetas). */
export type ScreenInput = z.input<typeof Screen>

export const Unit = z.object({
  id: z.string(),
  title: z.string().default(''),
  summary: z.string().default(''),
  screens: z.array(Screen).default([]),
  status: z.enum(['ok', 'esqueleto_pendiente_desarrollo']).default('ok'),
})
export type Unit = z.infer<typeof Unit>

export const Module = z.object({
  id: z.string(),
  title: z.string().default(''),
  units: z.array(Unit).default([]),
})
export type Module = z.infer<typeof Module>

// ----------------------------------------------------------------------------
// Evaluación, glosario, bibliografía
// ----------------------------------------------------------------------------

export const QuizQuestion = z.object({
  id: z.string(),
  prompt: z.string(),
  type: z.enum(['single_choice', 'true_false', 'multiple_choice']).default('single_choice'),
  options: z.array(InteractionOption).default([]),
  feedback: Feedback.default({}),
  points: z.number().default(1),
  learning_objective: z.string().default(''),
  source_refs: z.array(SourceRef).default([]),
})

export type QuizQuestion = z.infer<typeof QuizQuestion>

export const UnitTest = z.object({
  id: z.string(),
  unit_id: z.string(),
  title: z.string().default('Test de unidad'),
  questions: z.array(QuizQuestion).default([]),
  pass_score: z.number().min(0).max(100).default(60),
})
export type UnitTest = z.infer<typeof UnitTest>

export const GlossaryTerm = z.object({
  term: z.string(),
  definition: z.string(),
  source_refs: z.array(SourceRef).default([]),
})
export type GlossaryTerm = z.infer<typeof GlossaryTerm>

export const BibliographyEntry = z.object({
  ref: z.string(),
  url: z.string().optional(),
})
export type BibliographyEntry = z.infer<typeof BibliographyEntry>

// ----------------------------------------------------------------------------
// Configuración SCORM y carcasa
// ----------------------------------------------------------------------------

export const ScormConfig = z.object({
  version: z.literal('1.2').default('1.2'),
  identifier: z.string().default('SCORMEDITOR-COURSE'),
  title: z.string().default(''),
  mastery_score: z.number().min(0).max(100).default(60),
  rules: z.object({
    min_required_screens_pct: z.number().min(0).max(100).default(100),
    require_interactions: z.boolean().default(true),
    min_score: z.number().min(0).max(100).default(60),
    attempts_allowed: z.number().int().min(0).default(0).describe('0 = ilimitados'),
    score_source: z.enum(['final_test', 'unit_tests', 'mixed']).default('mixed'),
    mixed_final_weight: z
      .number()
      .min(0)
      .max(100)
      .default(70)
      .describe('En score_source="mixed", peso (%) del test final; la práctica pesa el resto'),
    navigation: NavigationMode.default('mixed'),
    allow_resume: z.boolean().default(true),
  }).default({}),
})
export type ScormConfig = z.infer<typeof ScormConfig>

// Código de idioma tipo BCP-47 («es», «es-ES», «en»). Se valida porque se
// interpola en atributos HTML (lang=…) de la carcasa y la previsualización;
// un valor inválido (proyecto antiguo o manipulado) cae a «es» sin romper la carga.
const LanguageCode = z.string()
  .regex(/^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/)
  .default('es')
  .catch('es')

export const ShellConfig = z.object({
  brand: z
    .string()
    .default('')
    .describe('Marca de la cabecera; vacía, la cabecera muestra solo el título del curso'),
  logo: z.string().optional(),
  primary_color: z.string().default('#0b5fff'),
  show_sidebar: z.boolean().default(true),
  show_progress: z.boolean().default(true),
  language: LanguageCode,
  motion: z
    .enum(['none', 'subtle', 'rich'])
    .default('subtle')
    .describe('Animaciones de la carcasa: none (sin), subtle (básicas), rich (revelado progresivo y microanimaciones)'),
  motion_speed: z
    .enum(['fast', 'normal', 'slow'])
    .default('normal')
    .describe('Velocidad de las animaciones de entrada (multiplica la duración del nivel elegido)'),
}).default({})
export type ShellConfig = z.infer<typeof ShellConfig>

// ----------------------------------------------------------------------------
// Curso completo
// ----------------------------------------------------------------------------

export const Course = z.object({
  schema_version: z.string().default(SCHEMA_VERSION),
  course: z.object({
    id: z.string().default('curso-1'),
    title: z.string().default(''),
    subtitle: z.string().default(''),
    description: z.string().default(''),
    authoring_entity: z.string().default(''),
    source_document: z.string().default('').describe('Documento origen (PDF/Word)'),
    estimated_hours: z.number().default(0),
    language: LanguageCode,
  }).default({}),
  scorm: ScormConfig.default({}),
  shell: ShellConfig,
  narration: z.object({
    mode: z
      .enum(['auto', 'on', 'off'])
      .default('auto')
      .describe('Curso narrado: activa los avisos de transcripción/audio pendientes. auto = según haya locución en alguna pantalla'),
  }).default({}),
  modules: z.array(Module).default([]),
  assessments: z.object({
    unit_tests: z.array(UnitTest).default([]),
    final_test: UnitTest.nullable().default(null),
  }).default({}),
  glossary: z.array(GlossaryTerm).default([]),
  bibliography: z.array(BibliographyEntry).default([]),
  quality_checklist: z.record(z.boolean()).default({}),
})
export type Course = z.infer<typeof Course>

/**
 * Parsea y normaliza (rellena defaults) un objeto course.json.
 * Lanza ZodError con detalle si la estructura es inválida.
 */
export function parseCourse(input: unknown): Course {
  return Course.parse(input)
}

export function safeParseCourse(input: unknown) {
  return Course.safeParse(input)
}
