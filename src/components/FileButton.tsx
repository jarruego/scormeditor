import { useState } from 'react'
import { useCourseStore } from '../store/courseStore'
import { optimizeImage } from '../media/optimizeImage'
import { confirmDialog } from '../store/confirm'

// Formatea un tamaño en bytes de forma legible (coma decimal en español).
function fmtSize(n: number): string {
  if (n >= 1024 * 1024) return (n / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB'
  if (n >= 1024) return Math.round(n / 1024) + ' KB'
  return n + ' B'
}

/**
 * Botón de subida de archivo. Guarda el archivo como asset (para que viaje en el
 * ZIP) y devuelve la ruta destino vía onUploaded. `makePath(ext)` define la ruta.
 * Las imágenes se optimizan (recorte de tamaño + recompresión) antes de guardar.
 * Si `currentPath` apunta a un recurso ya existente, avisa de que se sustituirá y
 * borra el binario anterior (irrecuperable).
 */
export function FileButton({
  accept,
  label = 'Subir archivo…',
  makePath,
  onUploaded,
  currentPath,
}: {
  accept: string
  label?: string
  makePath: (ext: string) => string
  onUploaded: (path: string) => void
  currentPath?: string
}) {
  const addAsset = useCourseStore((s) => s.addAsset)
  const removeAsset = useCourseStore((s) => s.removeAsset)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Aviso de sustitución: hay un recurso previo que se perderá.
    if (currentPath) {
      const ok = await confirmDialog({
        title: 'Sustituir recurso',
        message: 'Se sustituirá el recurso actual y se borrará el anterior sin poder recuperarlo. ¿Deseas continuar?',
        confirmLabel: 'Sustituir',
        danger: true,
      })
      if (!ok) { e.target.value = ''; return }
    }
    setBusy(true)
    setMsg(null)
    try {
      const originalSize = file.size
      const { blob, ext, changed } = await optimizeImage(file)
      const path = makePath(ext)
      addAsset(path, blob)
      // Borra el binario anterior si su ruta cambia (misma ruta = ya sobrescrito).
      if (currentPath && currentPath !== path) removeAsset(currentPath)
      onUploaded(path)
      if (changed) setMsg(`Imagen reducida de ${fmtSize(originalSize)} a ${fmtSize(blob.size)}.`)
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  return (
    <span className="ed-file">
      <label className="ed-file-btn" aria-busy={busy}>
        {busy ? 'Procesando…' : label}
        <input type="file" accept={accept} hidden disabled={busy} onChange={onChange} />
      </label>
      {msg && <span className="ed-file-msg">{msg}</span>}
    </span>
  )
}
