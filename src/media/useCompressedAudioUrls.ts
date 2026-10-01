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
 * tanto (nunca se bloquea la reproducción esperando). Se publican los
 * resultados de uno en uno conforme van terminando (no espera a que TODOS
 * los audios del curso estén listos) — puede causar que la vista previa se
 * recargue más de una vez justo después de generar/cambiar varios audios de
 * golpe; una vez cada archivo está en caché, las siguientes veces es
 * instantáneo.
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
        if (seq !== seqRef.current) return
        setUrls((prev) => ({ ...prev, [path]: url! }))
        // Cede el hilo entre archivo y archivo para no congelar la UI mientras
        // se comprime un curso entero (la codificación en sí, dentro de un
        // mismo archivo, sí es un bloque síncrono).
        await new Promise((r) => setTimeout(r, 0))
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathsKey, assets, enabled, kbps])

  return urls
}
