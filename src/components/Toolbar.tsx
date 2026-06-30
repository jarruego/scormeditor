import { useRef, useState } from 'react'
import { useCourseStore } from '../store/courseStore'
import { downloadScorm } from '../export/exportScorm'
import { validateCourse } from '../validation/validators'
import {
  isFsSupported,
  linkSaveFile,
  linkSaveFolder,
  openProjectFile,
  openProjectFolder,
  reconnectFile,
} from '../store/autosave'

const DISCARD_MSG =
  'Esto reemplazará el curso que tienes abierto. Si hay un destino vinculado, el autoguardado lo sobrescribirá. ¿Continuar?'
function confirmDiscard() {
  return window.confirm(DISCARD_MSG)
}

const SAVE_LABEL: Record<string, string> = {
  idle: '',
  saving: '○ Guardando…',
  saved: '● Guardado',
  error: '⚠ Error al guardar',
}

export function Toolbar() {
  const course = useCourseStore((s) => s.course)
  const assets = useCourseStore((s) => s.assets)
  const importJson = useCourseStore((s) => s.importJson)
  const exportJson = useCourseStore((s) => s.exportJson)
  const resetSample = useCourseStore((s) => s.resetSample)
  const importError = useCourseStore((s) => s.importError)
  const saveState = useCourseStore((s) => s.saveState)
  const linkedFileName = useCourseStore((s) => s.linkedFileName)
  const linkedNeedsPermission = useCourseStore((s) => s.linkedNeedsPermission)
  const linkedIsFolder = useCourseStore((s) => s.linkedIsFolder)
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const fsOk = isFsSupported()

  const val = validateCourse(course)

  function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    file.text().then((t) => importJson(t))
    e.target.value = ''
  }

  function onExportJson() {
    const blob = new Blob([exportJson()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${course.course.id || 'course'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function onExportScorm() {
    setBusy(true)
    try {
      await downloadScorm({ course, assets })
    } finally {
      setBusy(false)
    }
  }

  function onNewDemo() {
    if (confirmDiscard()) resetSample()
  }
  function onOpenFile() {
    if (confirmDiscard()) openProjectFile()
  }
  function onOpenFolder() {
    if (confirmDiscard()) openProjectFolder()
  }

  return (
    <header className="ed-toolbar">
      <strong className="ed-logo">SCORMEditor</strong>
      <span className="ed-course-name">{course.course.title || 'Curso sin título'}</span>

      {/* Estado de autoguardado */}
      <span className={`ed-save ed-save-${saveState}`} title="Autoguardado en el navegador (IndexedDB)">
        {SAVE_LABEL[saveState]}
      </span>
      {linkedFileName && !linkedNeedsPermission && (
        <span className="ed-linked" title="Autoguardado también en este destino del disco">
          {linkedIsFolder ? '📁' : '📄'} {linkedFileName}
        </span>
      )}
      {linkedNeedsPermission && (
        <button className="ed-warnbtn" onClick={reconnectFile} title="Volver a dar permiso al destino">
          🔒 Reconectar {linkedFileName}
        </button>
      )}

      <div className="ed-toolbar-actions">
        {fsOk ? (
          <>
            <button onClick={onOpenFile}>Abrir archivo…</button>
            <button onClick={onOpenFolder}>Abrir carpeta…</button>
            <button onClick={linkSaveFile}>Guardar en archivo…</button>
            <button onClick={linkSaveFolder} title="Proyecto portable: course.json + assets/">Guardar en carpeta…</button>
          </>
        ) : (
          <>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={onImport} />
            <button onClick={() => fileRef.current?.click()}>Importar JSON</button>
            <button onClick={onExportJson}>Exportar JSON</button>
          </>
        )}
        <button onClick={onNewDemo}>Nuevo (demo)</button>
        <button className="ed-primary" disabled={busy} onClick={onExportScorm}>
          {busy ? 'Generando…' : 'Exportar SCORM ZIP'}
        </button>
        <span className={`ed-status ${val.ok ? 'ok' : 'err'}`} title="Errores / Avisos">
          {val.errors} ⛔ · {val.warnings} ⚠
        </span>
      </div>

      {importError && <div className="ed-import-error">⛔ {importError}</div>}
    </header>
  )
}
