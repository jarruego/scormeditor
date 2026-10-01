import { useMemo } from 'react'
import { useCourseStore } from '../store/courseStore'
import { estimateScreensSync, formatEstimatedDuration } from '../report/estimateDuration'
import { useDurationSum } from '../media/useDurationSum'
import { Icon } from './Icon'

/**
 * Chip siempre visible en la Toolbar, junto a `SuspendSizeIndicator` (memoria
 * de `suspend_data`): duración ESTIMADA de completar el curso entero (lectura
 * de texto + hacer cada actividad según su tipo y tamaño + vídeos + audio de
 * locución), para hacerse una idea mientras se va montando el curso — crece
 * sola al añadir pantallas. Es una heurística orientativa de diseño
 * instruccional (ver `estimateDuration.ts`), no una medición real.
 *
 * (La duración del AUDIO de narración por sí sola, para el tiempo de
 * escucha, vive en Ajustes → Narración — `TtsPanel` —, no aquí: este chip es
 * el agregado de todo el curso, no solo de lo narrado.)
 */
export function CourseTimeIndicator() {
  const course = useCourseStore((s) => s.course)
  const estimates = useMemo(() => estimateScreensSync(course), [course])
  const audioPaths = useMemo(
    () => [...new Set(estimates.map((e) => e.audioPath).filter((p): p is string => !!p))],
    [estimates],
  )
  const videoPaths = useMemo(() => [...new Set(estimates.flatMap((e) => e.videoPaths))], [estimates])
  const audio = useDurationSum(audioPaths, 'audio')
  const video = useDurationSum(videoPaths, 'video')

  if (!estimates.length) return null
  const busy = audio.busy || video.busy
  const total = estimates.reduce((sum, e) => {
    const audioSeconds = e.audioPath ? audio.durations[e.audioPath] : undefined
    // Si hay audio de locución, su duración REAL sustituye (no se suma a) el
    // tiempo de lectura de esa pantalla: se escuchan a la vez que se mira,
    // no una cosa detrás de la otra (ver estimateDuration.ts).
    const screenBase = e.syncSeconds - e.textSeconds + Math.max(e.textSeconds, audioSeconds ?? 0)
    const videoSeconds = e.videoPaths.reduce((a, p) => a + (video.durations[p] ?? 0), 0)
    return sum + screenBase + videoSeconds
  }, 0)
  const unreadable = audio.unreadable + video.unreadable

  return (
    <div
      className="ed-duration-chip"
      title={
        'Estimación ORIENTATIVA de lo que le llevaría a un alumno completar todo el curso: lectura de texto, '
        + 'hacer cada actividad (según tipo y tamaño), vídeos y audio de locución. No es una medición real, '
        + 'es una heurística de diseño instruccional (~130 palabras/minuto de lectura).'
        + (unreadable ? ` ${unreadable} archivo(s) de audio/vídeo no se pudieron medir y no cuentan en el total.` : '')
      }
    >
      <Icon name="clock" size={13} />
      {busy ? 'Duración estimada: calculando…' : `Duración estimada: ~${formatEstimatedDuration(total)}`}
    </div>
  )
}
