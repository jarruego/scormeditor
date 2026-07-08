import { useEffect, useMemo, useRef, useState } from 'react'
import { useCourseStore } from '../store/courseStore'
import { buildPreviewHtml } from '../preview/buildPreview'

export function StudentPreview() {
  const course = useCourseStore((s) => s.course)
  const assets = useCourseStore((s) => s.assets)
  const selectedScreenId = useCourseStore((s) => s.selectedScreenId)
  const selectScreen = useCourseStore((s) => s.selectScreen)

  // Genera blob URLs para los assets subidos y las renueva solo cuando cambian
  // los assets (no en cada pulsación de tecla sobre el curso).
  const [assetUrls, setAssetUrls] = useState<Record<string, string>>({})
  useEffect(() => {
    const map: Record<string, string> = {}
    const urls: string[] = []
    for (const [path, val] of Object.entries(assets)) {
      const blob = val instanceof Blob ? val : new Blob([val as BlobPart])
      const url = URL.createObjectURL(blob)
      map[path] = url
      urls.push(url)
    }
    setAssetUrls(map)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [assets])

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
