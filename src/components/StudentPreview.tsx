import { useEffect, useMemo, useRef } from 'react'
import { useCourseStore } from '../store/courseStore'
import { buildPreviewHtml } from '../preview/buildPreview'
import type { AssetMap } from '../export/exportScorm'

// Caché de blob URLs a nivel de MÓDULO (no ligada al ciclo de montaje del
// componente): en desarrollo, React.StrictMode monta cada componente, ejecuta
// la limpieza de sus efectos una vez de más y vuelve a montarlo (para detectar
// fugas). Si las blob URLs se crean y se revocan dentro de un efecto propio de
// `StudentPreview`, esa limpieza extra revoca las URLs recién insertadas en el
// <iframe> sin volver a crearlas — bug real observado: las imágenes se veían
// bien en el Editor (mismo `assets` del store) pero nunca en Vista estudiante,
// con `net::ERR_FILE_NOT_FOUND` sobre la propia blob URL en la consola del
// iframe. Al vivir la caché fuera del componente, sobrevive intacta a ese
// doble montaje: `resolveAssetUrls` es idempotente (misma entrada → mismo
// resultado, sin crear ni revocar nada de nuevo) y solo revoca cuando un
// asset realmente cambia o desaparece del proyecto.
const assetUrlCache = new Map<string, { blob: AssetMap[string]; url: string }>()

function resolveAssetUrls(assets: AssetMap): Record<string, string> {
  const current = new Set(Object.keys(assets))
  for (const [path, entry] of assetUrlCache) {
    if (!current.has(path) || assets[path] !== entry.blob) {
      URL.revokeObjectURL(entry.url)
      assetUrlCache.delete(path)
    }
  }
  const map: Record<string, string> = {}
  for (const [path, val] of Object.entries(assets)) {
    let entry = assetUrlCache.get(path)
    if (!entry) {
      const blob = val instanceof Blob ? val : new Blob([val as BlobPart])
      entry = { blob: val, url: URL.createObjectURL(blob) }
      assetUrlCache.set(path, entry)
    }
    map[path] = entry.url
  }
  return map
}

export function StudentPreview() {
  const course = useCourseStore((s) => s.course)
  const assets = useCourseStore((s) => s.assets)
  const selectedScreenId = useCourseStore((s) => s.selectedScreenId)
  const selectScreen = useCourseStore((s) => s.selectScreen)

  const assetUrls = useMemo(() => resolveAssetUrls(assets), [assets])

  // Reconstruye la previsualización al cambiar el curso o las URLs de assets
  // La vista informa por postMessage de la diapositiva en la que se navega; así
  // al volver a la pestaña «Editar» el editor se sitúa en esa misma pantalla.
  const frameRef = useRef<HTMLIFrameElement>(null)
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      // Solo se aceptan mensajes del propio iframe de la vista previa.
      if (e.source !== frameRef.current?.contentWindow) return
      const d = e.data
      if (d && d.type === 'me-screen-change' && typeof d.screenId === 'string') {
        selectScreen(d.screenId)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [selectScreen])

  // La diapositiva de arranque se fija al montar (al abrir la pestaña): así la
  // vista se sitúa en la pantalla activa del editor. No se incluye en las
  // dependencias para no recargar el iframe al navegar dentro de la propia vista.
  const startScreenId = useRef(selectedScreenId).current
  const srcDoc = useMemo(
    () => buildPreviewHtml(course, assetUrls, startScreenId || undefined),
    [course, assetUrls, startScreenId],
  )

  return (
    <div className="ed-preview">
      {/* allowFullScreen: sin él, el botón de pantalla completa de la carcasa
          no estaría disponible dentro de la vista previa */}
      <iframe ref={frameRef} className="ed-preview-frame" title="Vista estudiante" srcDoc={srcDoc} allowFullScreen />
    </div>
  )
}
