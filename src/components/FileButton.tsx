import { useCourseStore } from '../store/courseStore'

/**
 * Botón de subida de archivo. Guarda el archivo como asset (para que viaje en el
 * ZIP) y devuelve la ruta destino vía onUploaded. `makePath(ext)` define la ruta.
 */
export function FileButton({
  accept,
  label = 'Subir archivo…',
  makePath,
  onUploaded,
}: {
  accept: string
  label?: string
  makePath: (ext: string) => string
  onUploaded: (path: string) => void
}) {
  const addAsset = useCourseStore((s) => s.addAsset)

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = (file.name.split('.').pop() || '').toLowerCase()
    const path = makePath(ext)
    addAsset(path, file)
    onUploaded(path)
    e.target.value = ''
  }

  return (
    <label className="ed-file-btn">
      {label}
      <input type="file" accept={accept} hidden onChange={onChange} />
    </label>
  )
}
