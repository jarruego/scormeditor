import { useCourseStore } from '../store/courseStore'
import type { Screen } from '../schema/course.schema'
import { allScreens } from '../schema/traverse'
import { buildTranscript } from './buildTranscript'

/**
 * Narración por voz (TTS) integrada en el editor.
 *
 * SCORMEditor es una SPA sin backend: las llamadas van DIRECTAS desde el
 * navegador al proveedor de TTS, con la clave que el usuario guarda en su propio
 * navegador (localStorage). La clave nunca sale del equipo ni se guarda en el
 * `.scormproj`. Sin dependencias: usamos `fetch` contra la API REST.
 *
 * Dos proveedores soportados:
 *  - `openai`: endpoint `/audio/speech`, devuelve audio ya codificado (mp3/…).
 *    Pago por uso (céntimos por curso).
 *  - `gemini`: Google Generative Language API (`:generateContent`), devuelve PCM
 *    crudo (L16, 24 kHz, mono) que envolvemos en WAV. Tiene capa gratuita.
 *
 * El audio generado se guarda como asset (`assets/media/<id>_narracion.<ext>`),
 * igual que un audio subido a mano, y se referencia en `screen.audio_src`, de
 * modo que viaja en el ZIP del proyecto y del SCORM.
 */

export type TtsProvider = 'openai' | 'gemini'

export interface TtsConfig {
  provider: TtsProvider
  /** Una clave por proveedor: cada API es distinta y se conservan por separado. */
  keys: Record<TtsProvider, string>
  /** Base de la API OpenAI (permite Azure/OpenAI-compatibles). Ignorado en Gemini. */
  baseUrl: string
  model: string
  voice: string
  /** Formato de salida OpenAI. Gemini siempre produce WAV. */
  format: 'mp3' | 'wav' | 'opus' | 'aac' | 'flac'
  /** Velocidad de locución OpenAI (0.25–4.0). Ignorado en Gemini. */
  speed: number
  /** Indicaciones de tono/estilo (OpenAI gpt-4o-mini-tts; Gemini como prefijo). */
  instructions: string
}

const LS_KEY = 'scormeditor.tts'

export const PROVIDERS: { value: TtsProvider; label: string }[] = [
  { value: 'openai', label: 'OpenAI (pago por uso, céntimos)' },
  { value: 'gemini', label: 'Google Gemini (gratis)' },
]

export const OPENAI_MODELS = ['gpt-4o-mini-tts', 'tts-1', 'tts-1-hd'] as const
export const OPENAI_VOICES = [
  'alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'nova', 'onyx', 'sage', 'shimmer',
] as const

export const GEMINI_MODELS = ['gemini-2.5-flash-preview-tts', 'gemini-2.5-pro-preview-tts'] as const
// Subconjunto curado de voces preconstruidas de Gemini (hay ~30 disponibles).
export const GEMINI_VOICES = [
  'Kore', 'Puck', 'Zephyr', 'Charon', 'Aoede', 'Leda', 'Orus', 'Fenrir', 'Callirrhoe', 'Enceladus',
] as const

export function modelsFor(provider: TtsProvider): readonly string[] {
  return provider === 'gemini' ? GEMINI_MODELS : OPENAI_MODELS
}
export function voicesFor(provider: TtsProvider): readonly string[] {
  return provider === 'gemini' ? GEMINI_VOICES : OPENAI_VOICES
}
/** Valores que deben restablecerse al cambiar de proveedor (modelo y voz válidos). */
export function providerDefaults(provider: TtsProvider): Partial<TtsConfig> {
  return { provider, model: modelsFor(provider)[0], voice: voicesFor(provider)[0] }
}

/** Límite de caracteres por petición; margen bajo el máximo de OpenAI (4096). */
const MAX_CHARS = 3800

const DEFAULTS: TtsConfig = {
  provider: 'openai',
  keys: { openai: '', gemini: '' },
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini-tts',
  voice: 'nova',
  format: 'mp3',
  speed: 1,
  instructions: '',
}

export function getTtsConfig(): TtsConfig {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      const saved = JSON.parse(raw)
      const cfg: TtsConfig = { ...DEFAULTS, ...saved, keys: { ...DEFAULTS.keys, ...(saved.keys || {}) } }
      // Migración: versiones antiguas guardaban una única `apiKey` compartida.
      if (typeof saved.apiKey === 'string' && saved.apiKey && !cfg.keys[cfg.provider]) {
        cfg.keys[cfg.provider] = saved.apiKey
      }
      return cfg
    }
  } catch {
    /* localStorage no disponible o JSON corrupto: usamos defaults */
  }
  return { ...DEFAULTS, keys: { ...DEFAULTS.keys } }
}

export function setTtsConfig(patch: Partial<TtsConfig>): TtsConfig {
  const cur = getTtsConfig()
  const next: TtsConfig = { ...cur, ...patch, keys: { ...cur.keys, ...(patch.keys || {}) } }
  localStorage.setItem(LS_KEY, JSON.stringify(next))
  return next
}

/** Clave activa según el proveedor seleccionado (sin espacios). */
export function keyFor(cfg: TtsConfig): string {
  return (cfg.keys[cfg.provider] || '').trim()
}

/** Guarda la clave de un proveedor concreto sin tocar la del otro. */
export function setProviderKey(provider: TtsProvider, key: string): TtsConfig {
  return setTtsConfig({ keys: { [provider]: key } as Record<TtsProvider, string> })
}

export function hasApiKey(): boolean {
  return keyFor(getTtsConfig()).length > 0
}

/** Extensión del archivo de salida según el proveedor/formato. */
function outputExt(cfg: TtsConfig): string {
  return cfg.provider === 'gemini' ? 'wav' : cfg.format
}

/** MIME aproximado por formato OpenAI (por si la respuesta no trae content-type). */
function mimeFor(format: TtsConfig['format']): string {
  switch (format) {
    case 'mp3': return 'audio/mpeg'
    case 'wav': return 'audio/wav'
    case 'opus': return 'audio/ogg'
    case 'aac': return 'audio/aac'
    case 'flac': return 'audio/flac'
  }
}

/** Trocea un texto largo en fragmentos <= MAX_CHARS respetando frases. */
function splitText(text: string): string[] {
  const clean = text.trim()
  if (clean.length <= MAX_CHARS) return clean ? [clean] : []
  const sentences = clean.split(/(?<=[.!?…])\s+/)
  const chunks: string[] = []
  let cur = ''
  for (const s of sentences) {
    if ((cur ? cur.length + 1 : 0) + s.length > MAX_CHARS) {
      if (cur) { chunks.push(cur); cur = '' }
      if (s.length > MAX_CHARS) {
        for (let i = 0; i < s.length; i += MAX_CHARS) chunks.push(s.slice(i, i + MAX_CHARS))
      } else {
        cur = s
      }
    } else {
      cur = cur ? `${cur} ${s}` : s
    }
  }
  if (cur) chunks.push(cur)
  return chunks
}

/** Mensaje de error legible a partir de una respuesta HTTP fallida. */
async function errorFromResponse(res: Response): Promise<Error> {
  let detail = `${res.status} ${res.statusText}`
  try {
    const j = await res.json()
    if (j?.error?.message) detail = j.error.message
  } catch {
    /* cuerpo no-JSON: nos quedamos con el status */
  }
  if (res.status === 401 || res.status === 403) return new Error(`Clave de API rechazada (${res.status}). Revisa la clave. — ${detail}`)
  if (res.status === 429) return new Error(`Límite de uso o cuota agotada (429). — ${detail}`)
  return new Error(detail)
}

// ---- OpenAI -----------------------------------------------------------------

/** Sintetiza un fragmento con OpenAI y devuelve el audio ya codificado. */
async function openaiChunk(text: string, cfg: TtsConfig, signal?: AbortSignal): Promise<Blob> {
  const body: Record<string, unknown> = {
    model: cfg.model,
    voice: cfg.voice,
    input: text,
    response_format: cfg.format,
    speed: cfg.speed,
  }
  if (cfg.model === 'gpt-4o-mini-tts' && cfg.instructions.trim()) {
    body.instructions = cfg.instructions.trim()
  }
  const url = `${cfg.baseUrl.replace(/\/+$/, '')}/audio/speech`
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${keyFor(cfg)}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })
  if (!res.ok) throw await errorFromResponse(res)
  return res.blob()
}

// ---- Gemini -----------------------------------------------------------------

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

/** Frecuencia de muestreo del mimeType L16 (p. ej. "audio/L16;codec=pcm;rate=24000"). */
function rateFromMime(mime: string): number {
  const m = /rate=(\d+)/.exec(mime || '')
  return m ? Number(m[1]) : 24000
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0)
  const out = new Uint8Array(total)
  let off = 0
  for (const p of parts) { out.set(p, off); off += p.length }
  return out
}

/** Envuelve PCM 16-bit mono en una cabecera WAV para que sea reproducible/guardable. */
function pcmToWavBlob(pcm: Uint8Array, sampleRate: number): Blob {
  const numChannels = 1
  const bitsPerSample = 16
  const blockAlign = (numChannels * bitsPerSample) / 8
  const byteRate = sampleRate * blockAlign
  const buffer = new ArrayBuffer(44 + pcm.length)
  const view = new DataView(buffer)
  const writeStr = (off: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)) }
  writeStr(0, 'RIFF')
  view.setUint32(4, 36 + pcm.length, true)
  writeStr(8, 'WAVE')
  writeStr(12, 'fmt ')
  view.setUint32(16, 16, true) // tamaño del bloque fmt
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitsPerSample, true)
  writeStr(36, 'data')
  view.setUint32(40, pcm.length, true)
  new Uint8Array(buffer, 44).set(pcm)
  return new Blob([buffer], { type: 'audio/wav' })
}

/** Sintetiza un fragmento con Gemini y devuelve el PCM crudo + su sample rate. */
async function geminiChunk(text: string, cfg: TtsConfig, signal?: AbortSignal): Promise<{ pcm: Uint8Array; rate: number }> {
  const prompt = cfg.instructions.trim() ? `${cfg.instructions.trim()}: ${text}` : text
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(cfg.model)}:generateContent`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'x-goog-api-key': keyFor(cfg), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: cfg.voice } } },
      },
    }),
    signal,
  })
  if (!res.ok) throw await errorFromResponse(res)
  const json = await res.json()
  const part = json?.candidates?.[0]?.content?.parts?.[0]
  const b64 = part?.inlineData?.data
  if (!b64) throw new Error('La API de Gemini no devolvió audio (revisa el modelo TTS y la voz).')
  return { pcm: base64ToBytes(b64), rate: rateFromMime(part.inlineData.mimeType) }
}

// ---- Síntesis (multi-proveedor, con troceado) -------------------------------

/**
 * Sintetiza un texto de cualquier longitud. Trocea si excede el límite y
 * combina: en Gemini concatena el PCM y escribe una única cabecera WAV; en
 * OpenAI concatena los blobs codificados (los frames MP3/AAC se reproducen bien).
 */
export async function synthesize(
  text: string,
  cfgOverride?: Partial<TtsConfig>,
  signal?: AbortSignal,
): Promise<Blob> {
  const cfg = { ...getTtsConfig(), ...cfgOverride }
  if (!keyFor(cfg)) throw new Error('Falta la clave de API. Configúrala en «Narración por voz».')
  const chunks = splitText(text)
  if (chunks.length === 0) throw new Error('No hay texto que locutar.')

  if (cfg.provider === 'gemini') {
    const pcms: Uint8Array[] = []
    let rate = 24000
    for (const chunk of chunks) {
      const r = await geminiChunk(chunk, cfg, signal)
      pcms.push(r.pcm)
      rate = r.rate
    }
    return pcmToWavBlob(concatBytes(pcms), rate)
  }

  const parts: Blob[] = []
  for (const chunk of chunks) parts.push(await openaiChunk(chunk, cfg, signal))
  if (parts.length === 1) return parts[0]
  return new Blob(parts, { type: parts[0].type || mimeFor(cfg.format) })
}

// ---- Aplicación al curso ----------------------------------------------------

/** Recorre todas las pantallas del curso en orden. */
export function eachScreen(): Screen[] {
  return allScreens(useCourseStore.getState().course)
}

export interface NarratableScreen {
  id: string
  title: string
  hasTranscript: boolean
  hasAudio: boolean
  /** Tiene contenido narrable (mismo criterio que `buildTranscript`/validación). */
  hasContent: boolean
  /** Esqueleto/pendiente de desarrollo: se excluye del trabajo de narración. */
  skeleton: boolean
}

/** Lista las pantallas con datos relevantes para narración. */
export function listNarratable(): NarratableScreen[] {
  return eachScreen().map((s) => ({
    id: s.id,
    title: s.title || s.id,
    hasTranscript: s.transcript.trim().length > 0,
    hasAudio: s.audio_src.trim().length > 0,
    hasContent: buildTranscript(s).trim().length > 0,
    skeleton: s.type === 'content_placeholder' || s.status === 'esqueleto_pendiente_desarrollo',
  }))
}

/** Guarda el audio generado como asset y lo enlaza en la pantalla. */
function applyAudio(screenId: string, blob: Blob, cfg: TtsConfig) {
  const path = `assets/media/${screenId}_narracion.${outputExt(cfg)}`
  const st = useCourseStore.getState()
  st.addAsset(path, blob)
  st.updateScreen(screenId, { audio_src: path })
  return path
}

/**
 * Genera (o regenera) el audio de una pantalla a partir de su transcripción.
 * Devuelve la ruta del asset creado.
 */
export async function generateForScreen(screenId: string, signal?: AbortSignal): Promise<string> {
  const screen = useCourseStore.getState().getScreen(screenId)
  if (!screen) throw new Error('Pantalla no encontrada.')
  const text = screen.transcript.trim()
  if (!text) throw new Error('La pantalla no tiene transcripción que locutar.')
  const cfg = getTtsConfig()
  const blob = await synthesize(text, undefined, signal)
  return applyAudio(screenId, blob, cfg)
}

export interface BulkResult {
  done: number
  skipped: number
  errors: { id: string; title: string; message: string }[]
}

export interface BulkOptions {
  /** Si true, salta las pantallas que ya tienen `audio_src`. */
  onlyMissing: boolean
  onProgress?: (info: { index: number; total: number; title: string }) => void
  signal?: AbortSignal
}

/** Genera el audio de todas las pantallas con transcripción (secuencial). */
export async function generateAll(opts: BulkOptions): Promise<BulkResult> {
  const cfg = getTtsConfig()
  if (!keyFor(cfg)) throw new Error('Falta la clave de API. Configúrala en «Narración por voz».')

  const targets = eachScreen().filter((s) => s.transcript.trim().length > 0)
  const result: BulkResult = { done: 0, skipped: 0, errors: [] }
  let index = 0
  for (const s of targets) {
    if (opts.signal?.aborted) break
    index++
    if (opts.onlyMissing && s.audio_src.trim()) { result.skipped++; continue }
    opts.onProgress?.({ index, total: targets.length, title: s.title || s.id })
    try {
      const blob = await synthesize(s.transcript.trim(), undefined, opts.signal)
      applyAudio(s.id, blob, cfg)
      result.done++
    } catch (e) {
      if ((e as Error).name === 'AbortError') break
      result.errors.push({ id: s.id, title: s.title || s.id, message: (e as Error).message })
    }
  }
  return result
}
