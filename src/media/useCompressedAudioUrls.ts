import { useEffect, useRef, useState } from 'react'
import type { AssetMap } from '../export/exportScorm'
import { getCompressedAudio } from './compressedAudioCache'
import { sizeOf } from './probeDuration'

// Blob URLs de audios YA comprimidos, a nivel de MÓDULO (no ligada al ciclo
// de montaje del componente) — mismo criterio que `assetUrlCache` en
// StudentPreview.tsx: sobrevive a que la pestaña Vista estudiante se
// desmonte/remonte (cambiar de pestaña del editor) y a StrictMode, así nunca
// se repite una compresión ya hecha ni se revoca una URL en uso.
const urlCache = new Map<string, string>() // path:size:kbps -> blob url

/**
 * URLs comprimidas (si `enabled`) de las rutas de audio de narración
 * indicadas, para Vista estudiante — ver `compressedAudioCache.ts` (misma
 * caché que usa el export ZIP, así «lo que se oye en Vista estudiante es lo
 * que se exporta» también vale para el audio comprimido).
 *
 * Mientras una ruta se comprime por primera vez, se omite del resultado: el
 * llamante debe usar la URL del asset ORIGINAL como alternativa mientras
 * tanto (nunca se bloquea la reproducción esperando).
 *
 * **Publica en UN SOLO bloque al terminar con TODAS las rutas, nunca una por
 * una** (bug ya corregido: publicar de una en una generaba un nuevo objeto
 * de resultado por archivo, y el llamante lo usa para reconstruir el `srcDoc`
 * del iframe de Vista estudiante — cada publicación recargaba el iframe
 * entero, así que un curso con N audios narrados producía N recargas
 * seguidas, percibido como «no para de refrescarse»). Mientras se comprime
 * un curso entero, Vista estudiante sigue mostrando el audio original (sin
 * recargar) hasta que TODO está listo; a partir de ahí, con todo en caché,
 * sucesivas aperturas son instantáneas y sin recargas de más.
 */
export function useCompressedAudioUrls(
  assets: AssetMap,
  paths: string[],
  enabled: boolean,
  kbps: number,
): Record<string, string> {
  const [urls, setUrls] = useState<Record<string, string>>({})
  const seqRef = useRef(0)
  const pathsKey = paths.join('\u0001')

  useEffect(() => {
    if (!enabled || !paths.length) { setUrls({}); return }
    const seq = ++seqRef.current
    ;(async () => {
      const next: Record<string, string> = {}
      for (const path of paths) {
        const val = assets[path]
        if (val == null) continue
        const cacheKey = `${path}:${sizeOf(val)}:${kbps}`
        let url = urlCache.get(cacheKey)
        if (!url) {
          try {
            const blob = await getCompressedAudio(path, val, kbps)
            if (seq !== seqRef.current) return // las rutas/assets cambiaron mientras comprimíamos
            url = URL.createObjectURL(blob)
            urlCache.set(cacheKey, url)
          } catch {
            continue // se queda con el original (lo decide el llamante al fusionar)
          }
        }
        next[path] = url
        // Cede el hilo entre archivo y archivo para no congelar la UI mientras
        // se comprime un curso entero (la codificación en sí, dentro de un
        // mismo archivo, sí es un bloque síncrono) — pero SIN publicar a
        // React todavía: eso es lo que antes recargaba el iframe una vez por
        // archivo (ver comentario de la función).
        await new Promise((r) => setTimeout(r, 0))
      }
      if (seq !== seqRef.current) return
      setUrls(next)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathsKey, assets, enabled, kbps])

  return urls
}
