import { useEffect, useRef, useState } from 'react'
import { useCourseStore } from '../store/courseStore'
import { listNarrationAudioPaths } from '../tts/tts'
import { Icon } from './Icon'
import type { AssetMap } from '../export/exportScorm'

/** Normaliza un valor de `AssetMap` a `Blob` (puede llegar como Blob, bytes o
 *  string — mismo criterio que `useObjectUrl` en ScreenEditor/StudentPreview). */
function toBlob(val: AssetMap[string]): Blob {
  return val instanceof Blob ? val : new Blob([val as BlobPart])
}

/** Tamaño en bytes/caracteres de un valor de `AssetMap`, cualquiera que sea su
 *  forma — huella barata para detectar que un asset cambió sin comparar el
 *  contenido entero (ver `durationsRef`). */
function sizeOf(val: AssetMap[string]): number {
  if (val instanceof Blob) return val.size
  if (val instanceof ArrayBuffer) return val.byteLength
  if (ArrayBuffer.isView(val)) return val.byteLength
  return String(val).length
}

/** Duración (segundos) de un audio, leyendo solo sus metadatos (sin
 *  reproducirlo). `null` si el navegador no puede decodificarlo o no responde
 *  a tiempo — algunos navegadores no disparan `error` para un archivo roto o
 *  mientras la pestaña está en segundo plano (difieren la carga de medios),
 *  así que un tope de tiempo evita que un archivo problemático deje el chip
 *  calculando para siempre. */
function probeDuration(blob: Blob, timeoutMs = 8000): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob)
    const audio = new Audio()
    let done = false
    function finish(result: number | null) {
      if (done) return
      done = true
      clearTimeout(timer)
      URL.revokeObjectURL(url)
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('error', onError)
      resolve(result)
    }
    function onLoaded() {
      // `Infinity`/`NaN` ocurre con algunos contenedores sin duración en la
      // cabecera (streaming): se descarta en vez de sumar basura.
      finish(Number.isFinite(audio.duration) ? audio.duration : null)
    }
    function onError() { finish(null) }
    const timer = setTimeout(() => finish(null), timeoutMs)
    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('error', onError)
    audio.src = url
  })
}

function formatDuration(totalSeconds: number): string {
  const s = Math.round(totalSeconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h} h ${m} min`
  if (m > 0) return `${m} min ${sec} s`
  return `${sec} s`
}

/**
 * Chip siempre visible (junto a `SuspendSizeIndicator`, en la Toolbar) con la
 * duración TOTAL de todo el audio de narración ya generado — pantalla
 * (`screen.audio_src`) + ítem/zona (accordion/tabs/flip_cards/timeline/
 * image_cards/flashcards/hotspots) — para hacerse una idea orientativa del
 * tiempo de escucha del curso. Solo mide METADATOS (duración), nunca
 * reproduce el audio. Cachea la duración por ruta (`durationsRef`) para no
 * releer el mismo archivo en cada recálculo; se invalida sola si la ruta deja
 * de existir o el asset cambia de referencia (regenerar el audio sustituye el
 * Blob en `assets`, así que la clave de caché incluye su tamaño como huella
 * barata de cambio).
 */
export function NarrationDurationIndicator() {
  const course = useCourseStore((s) => s.course)
  const assets = useCourseStore((s) => s.assets)
  const [total, setTotal] = useState<number | null>(null)
  const [unreadable, setUnreadable] = useState(0)
  const [busy, setBusy] = useState(false)
  const durationsRef = useRef(new Map<string, number>())
  const seqRef = useRef(0)

  useEffect(() => {
    const t = setTimeout(() => {
      const paths = listNarrationAudioPaths()
      if (!paths.length) { setTotal(null); setUnreadable(0); setBusy(false); return }
      const seq = ++seqRef.current
      setBusy(true)
      ;(async () => {
        let sum = 0
        let misses = 0
        for (const path of paths) {
          const val = assets[path]
          if (val == null) { misses++; continue } // asset no cargado aún (p. ej. justo tras importar)
          const cacheKey = `${path}:${sizeOf(val)}`
          let dur = durationsRef.current.get(cacheKey)
          if (dur === undefined) {
            const probed = await probeDuration(toBlob(val))
            if (seq !== seqRef.current) return // el curso cambió mientras medíamos: se descarta
            if (probed == null) { misses++; continue }
            dur = probed
            durationsRef.current.set(cacheKey, dur)
          }
          sum += dur
        }
        if (seq !== seqRef.current) return
        setTotal(sum)
        setUnreadable(misses)
        setBusy(false)
      })()
    }, 400)
    return () => clearTimeout(t)
  }, [course, assets])

  if (total == null && !busy) return null

  return (
    <div
      className="ed-duration-chip"
      title={
        `Duración total del audio de narración generado (pantallas + ítems de interacciones), orientativa para hacerte una idea del tiempo de escucha.`
        + (unreadable ? ` ${unreadable} archivo(s) no se pudieron medir (formato no soportado por este navegador).` : '')
      }
    >
      <Icon name="clock" size={13} />
      {busy ? 'Audio: calculando…' : `Audio: ${formatDuration(total ?? 0)}`}
    </div>
  )
}
