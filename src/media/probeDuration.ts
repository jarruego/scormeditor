import type { AssetMap } from '../export/exportScorm'

/** Normaliza un valor de `AssetMap` a `Blob` (puede llegar como Blob, bytes o
 *  string — mismo criterio que `useObjectUrl` en ScreenEditor/StudentPreview). */
export function toBlob(val: AssetMap[string]): Blob {
  return val instanceof Blob ? val : new Blob([val as BlobPart])
}

/** Tamaño en bytes/caracteres de un valor de `AssetMap`, cualquiera que sea su
 *  forma — huella barata para detectar que un asset cambió sin comparar el
 *  contenido entero (clave de caché de quien llama). */
export function sizeOf(val: AssetMap[string]): number {
  if (val instanceof Blob) return val.size
  if (val instanceof ArrayBuffer) return val.byteLength
  if (ArrayBuffer.isView(val)) return val.byteLength
  return String(val).length
}

/** Duración (segundos) de un audio o vídeo, leyendo solo sus metadatos (sin
 *  reproducirlo). `null` si el navegador no puede decodificarlo o no responde
 *  a tiempo — algunos navegadores no disparan `error` para un archivo roto, o
 *  mientras la pestaña está en segundo plano (difieren la carga de medios),
 *  así que un tope de tiempo evita quedarse esperando para siempre. */
export function probeDuration(blob: Blob, kind: 'audio' | 'video' = 'audio', timeoutMs = 8000): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob)
    const media: HTMLMediaElement = kind === 'video' ? document.createElement('video') : new Audio()
    let done = false
    function finish(result: number | null) {
      if (done) return
      done = true
      clearTimeout(timer)
      URL.revokeObjectURL(url)
      media.removeEventListener('loadedmetadata', onLoaded)
      media.removeEventListener('error', onError)
      resolve(result)
    }
    function onLoaded() {
      // `Infinity`/`NaN` ocurre con algunos contenedores sin duración en la
      // cabecera (streaming): se descarta en vez de sumar basura.
      finish(Number.isFinite(media.duration) ? media.duration : null)
    }
    function onError() { finish(null) }
    const timer = setTimeout(() => finish(null), timeoutMs)
    media.addEventListener('loadedmetadata', onLoaded)
    media.addEventListener('error', onError)
    media.src = url
  })
}
