import { useEffect, useRef, useState } from 'react'
import { useCourseStore } from '../store/courseStore'
import { probeDuration, toBlob, sizeOf } from './probeDuration'

export interface DurationSumResult {
  /** Duración (s) de cada ruta medida con éxito. Ausente = no medida todavía
   *  o no se pudo decodificar (ver `unreadable`). */
  durations: Record<string, number>
  /** Cuántas rutas no se pudieron medir (formato no soportado, archivo roto,
   *  o tope de tiempo agotado — ver `probeDuration`). */
  unreadable: number
  /** Hay una medición en curso (tras el debounce). */
  busy: boolean
}

/**
 * Duración de cada archivo de audio/vídeo de una lista de rutas de `assets`,
 * leyendo solo sus metadatos (nunca reproduce nada). Compartido por
 * `TtsPanel` (suma de audio de narración) y `CourseTimeIndicator` (estimación
 * de duración del curso): cada uno decide qué hacer con las duraciones
 * (sumarlas sin más, o combinarlas con un tiempo de lectura).
 *
 * Cachea por ruta+tamaño (`durationsRef`, en memoria del hook — se pierde al
 * recargar): regenerar un audio/vídeo (nuevo `Blob` en `assets`) invalida
 * sola la entrada vieja sin tener que compararla a mano. Recalcula con un
 * debounce de 400 ms al cambiar las rutas pedidas o los assets del curso.
 */
export function useDurationSum(paths: string[], kind: 'audio' | 'video' = 'audio'): DurationSumResult {
  const assets = useCourseStore((s) => s.assets)
  const [durations, setDurations] = useState<Record<string, number>>({})
  const [unreadable, setUnreadable] = useState(0)
  const [busy, setBusy] = useState(false)
  const cacheRef = useRef(new Map<string, number>())
  const seqRef = useRef(0)
  const pathsKey = paths.join('\u0001')

  useEffect(() => {
    const t = setTimeout(() => {
      if (!paths.length) { setDurations({}); setUnreadable(0); setBusy(false); return }
      const seq = ++seqRef.current
      setBusy(true)
      ;(async () => {
        const next: Record<string, number> = {}
        let misses = 0
        for (const path of paths) {
          const val = assets[path]
          if (val == null) { misses++; continue } // asset no cargado aún (p. ej. justo tras importar)
          const cacheKey = `${path}:${sizeOf(val)}`
          let dur = cacheRef.current.get(cacheKey)
          if (dur === undefined) {
            const probed = await probeDuration(toBlob(val), kind)
            if (seq !== seqRef.current) return // las rutas/assets cambiaron mientras medíamos: se descarta
            if (probed == null) { misses++; continue }
            dur = probed
            cacheRef.current.set(cacheKey, dur)
          }
          next[path] = dur
        }
        if (seq !== seqRef.current) return
        setDurations(next)
        setUnreadable(misses)
        setBusy(false)
      })()
    }, 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathsKey, assets, kind])

  return { durations, unreadable, busy }
}
