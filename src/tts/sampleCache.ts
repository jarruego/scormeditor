import { contentHash } from './buildTranscript'
import type { TtsConfig } from './tts'

/**
 * Caché persistente de las muestras de voz («Probar voz» / «Escuchar muestra»),
 * para no volver a sintetizar —y pagar— la misma frase con la misma voz cada
 * vez que se prueba. Usa la Cache API del navegador (sobrevive a recargar, sin
 * límite práctico de tamaño como localStorage); si no está disponible (contexto
 * no seguro), cae a una caché en memoria de la sesión. La clave incluye todo lo
 * que cambia el audio: proveedor, modelo, voz, formato, velocidad, «Vibe» y el
 * propio texto. Nunca incluye la clave de API.
 */

const CACHE = 'scormeditor-tts-muestras'
const memoria = new Map<string, Blob>()

function claveDe(cfg: TtsConfig, texto: string): string {
  const firma = [cfg.provider, cfg.model, cfg.voice, cfg.format, cfg.speed, cfg.instructions, texto].join('\u0001')
  // URL ficticia: la Cache API indexa por petición.
  return `https://scormeditor.local/tts-muestra/${cfg.provider}/${contentHash(firma)}`
}

const hayCacheApi = () => typeof caches !== 'undefined'

export async function leerMuestra(cfg: TtsConfig, texto: string): Promise<Blob | null> {
  const k = claveDe(cfg, texto)
  if (memoria.has(k)) return memoria.get(k)!
  if (!hayCacheApi()) return null
  try {
    const r = await (await caches.open(CACHE)).match(k)
    if (!r) return null
    const b = await r.blob()
    memoria.set(k, b)
    return b
  } catch {
    return null
  }
}

export async function guardarMuestra(cfg: TtsConfig, texto: string, blob: Blob): Promise<void> {
  const k = claveDe(cfg, texto)
  memoria.set(k, blob)
  if (!hayCacheApi()) return
  try {
    await (await caches.open(CACHE)).put(k, new Response(blob, { headers: { 'Content-Type': blob.type || 'audio/mpeg' } }))
  } catch {
    /* sin espacio o bloqueado: queda en memoria */
  }
}
