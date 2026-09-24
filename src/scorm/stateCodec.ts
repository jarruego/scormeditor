import type { Course, InteractionType } from '../schema/course.schema'
import { getRuntimeFiles } from './runtimeAssets'

/** Forma mínima de STATE (ver app.js) que necesita el editor. */
export interface RuntimeState {
  visited: Record<string, boolean>
  interactions: Record<string, unknown>
  results: Record<string, unknown>
  attempts: number
  finalScore: number
  finalAnswers: Record<string, string>
}

export interface CourseLayoutEntry {
  fp: string
  screens: string[]
  interactions: { id: string; type: InteractionType }[]
  final_questions: string[]
}

export interface SuspendSizeBudget {
  raw: string
  fits: boolean
  degraded: number
  size: number
  breakdown: SuspendSizeBreakdown
}

export interface SuspendSizeBreakdown {
  visited: number
  results: number
  interactions: number
  finalAnswers: number
  attempts: number
  finalScore: number
}

export interface SuspendSizeEstimate {
  worstCase: number
  limit: number
  breakdown: SuspendSizeBreakdown
  missingEstimator: { id: string; type: InteractionType }[]
}

export interface StateCodecApi {
  VERSION: number
  encode: (state: RuntimeState, course: Course, level?: number) => string
  decode: (raw: string, course: Course, layouts: CourseLayoutEntry[]) => RuntimeState
  encodeWithBudget: (state: RuntimeState, course: Course, limit?: number) => SuspendSizeBudget
  estimateSuspendSize: (course: Course) => SuspendSizeEstimate
  buildLayoutEntry: (course: Course) => CourseLayoutEntry
}

let cached: StateCodecApi | null = null

/**
 * Carga StateCodec (src/runtime/assets/js/state_codec.js) para usarlo desde
 * el editor (TypeScript). Es un script plano sin bundler — se copia verbatim
 * al paquete SCORM, así que no puede depender de nada del build — y el
 * editor no tiene `allowJs`, así que un `import` directo no compila. Se
 * evalúa su texto crudo (el mismo que ya sirve Vista estudiante vía
 * `getRuntimeFiles()`) contra un objeto a modo de `window` propio: mismo
 * patrón que ya usa scripts/test-state-codec.ts en Node con el módulo `vm`,
 * adaptado a `Function` porque en el navegador no hay `vm`.
 */
export function getStateCodec(): StateCodecApi {
  if (cached) return cached
  const src = getRuntimeFiles().find((f) => f.path === 'assets/js/state_codec.js')?.content
  if (!src) throw new Error('No se encontró state_codec.js en los assets del runtime')
  const sandbox: { StateCodec?: StateCodecApi } = {}
  // eslint-disable-next-line @typescript-eslint/no-implied-eval -- carga nuestro propio runtime, no código externo
  new Function('window', src)(sandbox)
  if (!sandbox.StateCodec) throw new Error('state_codec.js no expuso StateCodec')
  cached = sandbox.StateCodec
  return cached
}
