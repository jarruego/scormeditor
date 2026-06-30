import { useEffect, useMemo, useState } from 'react'
import { useCourseStore } from '../store/courseStore'
import { buildPreviewHtml } from '../preview/buildPreview'

export function StudentPreview() {
  const course = useCourseStore((s) => s.course)
  const assets = useCourseStore((s) => s.assets)

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
  const srcDoc = useMemo(() => buildPreviewHtml(course, assetUrls), [course, assetUrls])

  return (
    <div className="ed-preview">
      <p className="ed-preview-note">
        Vista estudiante con la <strong>misma carcasa</strong> que el SCORM exportado (modo standalone,
        sin LMS). <strong>Modo autor</strong>: navegación libre sin restricciones de tiempo ni
        interacciones obligatorias (en el SCORM exportado sí se aplican las reglas). Los recursos
        <strong> subidos </strong>(audio, imágenes, vídeo, subtítulos) se reproducen aquí; los que solo
        tengan una ruta escrita sin archivo cargado, no.
      </p>
      <iframe className="ed-preview-frame" title="Vista estudiante" srcDoc={srcDoc} />
    </div>
  )
}
