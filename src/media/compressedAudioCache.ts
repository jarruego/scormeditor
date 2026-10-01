import type { AssetMap } from '../export/exportScorm'
import { compressToMp3 } from './compressAudio'
import { sizeOf, toBlob } from './probeDuration'

/** Caché compartida (módulo, no ligada a ningún componente) de audios ya
 *  recomprimidos: la usan tanto `exportScorm.ts` (ZIP) como `StudentPreview`
 *  (Vista estudiante) — comprimir 45 min de locución no es instantáneo, y
 *  las dos vías comprimen EXACTAMENTE lo mismo (misma ruta, mismo archivo,
 *  mismo kbps), así que no hay motivo para hacerlo dos veces. Clave =
 *  ruta + tamaño del asset + kbps: regenerar un audio (nuevo `Blob` en
 *  `assets`) o cambiar el bitrate invalida sola la entrada vieja. */
const cache = new Map<string, Promise<Blob>>()

/** Devuelve (y cachea) la versión MP3 recomprimida de un asset de audio al
 *  bitrate indicado. No cachea fallos: una compresión fallida se reintenta
 *  la próxima vez en vez de quedar atascada para siempre. */
export function getCompressedAudio(path: string, val: AssetMap[string], kbps: number): Promise<Blob> {
  const key = `${path}:${sizeOf(val)}:${kbps}`
  let p = cache.get(key)
  if (!p) {
    p = compressToMp3(toBlob(val), { kbps }).catch((e) => {
      cache.delete(key)
      throw e
    })
    cache.set(key, p)
  }
  return p
}
