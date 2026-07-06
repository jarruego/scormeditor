import { useEffect, useMemo, useRef, useState } from 'react'
import { useCourseStore } from '../store/courseStore'
import { downloadScorm } from '../export/exportScorm'
import { validateCourse } from '../validation/validators'
import {
  isFsSupported,
  openProject,
  openProjectFromFile,
  saveProject,
  saveProjectAs,
} from '../store/autosave'
import { CourseSettingsModal, AppearanceModal, NarrationModal } from './SettingsModal'
import { InlineRename } from './InlineRename'

const DISCARD_MSG =
  'Esto reemplazará el curso que tienes abierto. Los cambios que no hayas guardado en el archivo de proyecto se perderán. ¿Continuar?'
function confirmDiscard() {
  return window.confirm(DISCARD_MSG)
}

export function Toolbar() {
  const course = useCourseStore((s) => s.course)
  const assets = useCourseStore((s) => s.assets)
  const resetSample = useCourseStore((s) => s.resetSample)
  const importError = useCourseStore((s) => s.importError)
  const linkedFileName = useCourseStore((s) => s.linkedFileName)
  const projectDirty = useCourseStore((s) => s.projectDirty)
  const undo = useCourseStore((s) => s.undo)
  const redo = useCourseStore((s) => s.redo)
  const canUndo = useCourseStore((s) => s.past.length > 0)
  const canRedo = useCourseStore((s) => s.future.length > 0)
  const setActiveTab = useCourseStore((s) => s.setActiveTab)
  const updateCourseInfo = useCourseStore((s) => s.updateCourseInfo)
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  // Qué ventana de ajustes está abierta. Vive en el store para que Validación
  // pueda abrirla desde sus enlaces («abrir ajustes»).
  const settingsModal = useCourseStore((s) => s.settingsModal)
  const setSettingsModal = useCourseStore((s) => s.setSettingsModal)
  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const settingsMenuRef = useRef<HTMLDivElement>(null)
  const fsOk = isFsSupported()

  // Cierra un menú desplegable al hacer clic fuera o pulsar Escape.
  function useMenuDismiss(open: boolean, ref: React.RefObject<HTMLDivElement>, close: () => void) {
    useEffect(() => {
      if (!open) return
      function onDown(e: MouseEvent) {
        if (ref.current && !ref.current.contains(e.target as Node)) close()
      }
      function onKey(e: KeyboardEvent) {
        if (e.key === 'Escape') close()
      }
      document.addEventListener('mousedown', onDown)
      document.addEventListener('keydown', onKey)
      return () => {
        document.removeEventListener('mousedown', onDown)
        document.removeEventListener('keydown', onKey)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])
  }
  useMenuDismiss(menuOpen, menuRef, () => setMenuOpen(false))
  useMenuDismiss(settingsMenuOpen, settingsMenuRef, () => setSettingsMenuOpen(false))

  const val = useMemo(() => validateCourse(course), [course])
  const isSaved = !!linkedFileName && !projectDirty

  function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (confirmDiscard()) void openProjectFromFile(file)
  }

  async function onExportScorm() {
    setBusy(true)
    try {
      await downloadScorm({ course, assets })
    } finally {
      setBusy(false)
    }
  }

  // Ejecuta la acción de un ítem del menú y lo cierra.
  function runMenu(action: () => void) {
    setMenuOpen(false)
    action()
  }

  function onNewDemo() {
    if (confirmDiscard()) resetSample()
  }
  function onOpen() {
    if (confirmDiscard()) void openProject()
  }

  return (
    <header className="ed-toolbar">
      <strong className="ed-logo">SCORMEditor</strong>
      <span className="ed-course-name">
        <InlineRename value={course.course.title} placeholder="Curso sin título"
          title="Renombrar el curso (título principal del SCORM)"
          onChange={(title) => updateCourseInfo({ title })} />
      </span>

      {/* Estado del documento: un único concepto de guardado = el archivo. */}
      <button
        className={`ed-docstate ${isSaved ? 'is-saved' : 'is-dirty'}`}
        onClick={() => void saveProject()}
        title={
          isSaved
            ? `Proyecto guardado en ${linkedFileName}. Ctrl+S para volver a guardar.`
            : 'Cambios sin guardar. Pulsa para guardar el proyecto (Ctrl+S). Tus cambios se conservan automáticamente por si cierras sin guardar.'
        }
      >
        {isSaved ? `✓ Guardado · ${linkedFileName}` : `● Sin guardar${linkedFileName ? ` · ${linkedFileName}` : ''}`}
      </button>

      <div className="ed-toolbar-actions">
        <button onClick={undo} disabled={!canUndo} title="Deshacer (Ctrl+Z)" aria-label="Deshacer">↶ Deshacer</button>
        <button onClick={redo} disabled={!canRedo} title="Rehacer (Ctrl+Mayús+Z)" aria-label="Rehacer">↷ Rehacer</button>

        <input ref={fileRef} type="file" accept=".scormproj,application/zip" hidden onChange={onImportFile} />
        <div className="ed-menu" ref={menuRef}>
          <button
            className="ed-menu-trigger"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {busy ? 'Generando…' : 'Archivo ▾'}
          </button>
          {menuOpen && (
            <div className="ed-menu-list" role="menu">
              <button role="menuitem" onClick={() => runMenu(fsOk ? onOpen : () => fileRef.current?.click())} title="Abrir un proyecto .scormproj">
                Abrir proyecto…
              </button>
              <button role="menuitem" onClick={() => runMenu(() => void saveProject())} title="Guardar el proyecto (Ctrl+S)">
                Guardar{linkedFileName ? '' : ' proyecto…'}
              </button>
              {fsOk && (
                <button role="menuitem" onClick={() => runMenu(() => void saveProjectAs())} title="Guardar una copia en un archivo nuevo">
                  Guardar como…
                </button>
              )}
              <hr className="ed-menu-sep" />
              <button role="menuitem" onClick={() => runMenu(onNewDemo)}>Nuevo (demo)</button>
              <button role="menuitem" className="ed-menu-primary" disabled={busy} onClick={() => runMenu(onExportScorm)}>
                {busy ? 'Generando…' : 'Exportar SCORM ZIP'}
              </button>
            </div>
          )}
        </div>

        <div className="ed-menu" ref={settingsMenuRef}>
          <button
            className="ed-menu-trigger"
            aria-haspopup="menu"
            aria-expanded={settingsMenuOpen}
            onClick={() => setSettingsMenuOpen((o) => !o)}
            title="Ajustes del curso y de narración"
          >
            ⚙ Ajustes ▾
          </button>
          {settingsMenuOpen && (
            <div className="ed-menu-list" role="menu">
              <button role="menuitem" onClick={() => { setSettingsMenuOpen(false); setSettingsModal('course') }}
                title="Nota mínima, finalización, peso de la nota, navegación…">
                Curso (Finalización)
              </button>
              <button role="menuitem" onClick={() => { setSettingsMenuOpen(false); setSettingsModal('appearance') }}
                title="Presentación de la carcasa: animaciones…">
                Interfaz (Apariencia)
              </button>
              <button role="menuitem" onClick={() => { setSettingsMenuOpen(false); setSettingsModal('narration') }}
                title="Proveedor/clave de API, voz y generación de audio">
                Narración (Audio IA)
              </button>
            </div>
          )}
        </div>

        <button
          className={`ed-status ${val.ok ? 'ok' : 'err'}`}
          onClick={() => setActiveTab('validation')}
          title="Ver pantalla de validación"
        >
          {val.errors} ⛔ · {val.warnings} ⚠
        </button>
      </div>

      {importError && <div className="ed-import-error">⛔ {importError}</div>}

      {settingsModal === 'course' && <CourseSettingsModal onClose={() => setSettingsModal(null)} />}
      {settingsModal === 'appearance' && <AppearanceModal onClose={() => setSettingsModal(null)} />}
      {settingsModal === 'narration' && <NarrationModal onClose={() => setSettingsModal(null)} />}
    </header>
  )
}
