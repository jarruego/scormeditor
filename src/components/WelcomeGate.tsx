import { useRef, useState } from 'react'
import { useCourseStore } from '../store/courseStore'
import { isFsSupported, openProject, openProjectFromFile } from '../store/autosave'
import { isCloudConfigured } from '../cloud/client'
import { useCloudSessionStore } from '../cloud/session'
import { Icon } from './Icon'

const DISMISSED_KEY = 'ed:startGateDismissed'

/**
 * Pantalla de bienvenida: qué abrir sin nada que retomar. Se muestra en DOS
 * casos independientes (`autosaveReady` primero, para no parpadear al
 * arrancar):
 * 1. **Arranque sin nada que retomar** (`nothingToResume`: ni archivo, ni
 *    nube, ni cambios sin guardar — la demo por defecto tal cual, sin tocar).
 *    Elegir cualquier opción la descarta para siempre en localStorage (igual
 *    que `WelcomeTip`): es una pantalla de primer arranque, no un aviso
 *    recurrente — si luego hay algo que retomar, no vuelve a aparecer aunque
 *    se borre.
 * 2. **`projectClosed`** (menú Archivo → «Cerrar proyecto», ver
 *    `Toolbar.tsx`/`closeCurrentProject()` en `autosave.ts`): reaparece
 *    SIEMPRE, sin depender del descarte de localStorage — cerrar es una
 *    acción explícita, no algo que deba dejar de avisar tras la primera vez.
 *    Se limpia sola en cuanto se abre/crea cualquier proyecto (todas las
 *    opciones de abajo ya lo hacen por su cuenta: `resetEmpty`/`resetSample`/
 *    `importJson` ponen `projectClosed: false`).
 */
export function WelcomeGate() {
  const autosaveReady = useCourseStore((s) => s.autosaveReady)
  const linkedFileName = useCourseStore((s) => s.linkedFileName)
  const projectDirty = useCourseStore((s) => s.projectDirty)
  const cloudDocumentId = useCourseStore((s) => s.cloudDocumentId)
  const projectClosed = useCourseStore((s) => s.projectClosed)
  const resetEmpty = useCourseStore((s) => s.resetEmpty)
  const resetSample = useCourseStore((s) => s.resetSample)
  const setSettingsModal = useCourseStore((s) => s.setSettingsModal)
  const cloudSession = useCloudSessionStore((s) => s.session)
  const fileRef = useRef<HTMLInputElement>(null)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === '1')

  const nothingToResume = !linkedFileName && !projectDirty && !cloudDocumentId
  const show = autosaveReady && ((nothingToResume && !dismissed) || projectClosed)

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setDismissed(true)
  }

  if (!show) return null

  function startBlank() {
    dismiss()
    resetEmpty()
  }

  async function openLocal() {
    dismiss()
    if (isFsSupported()) {
      await openProject()
    } else {
      fileRef.current?.click()
    }
  }

  async function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) await openProjectFromFile(file)
  }

  function openCloud() {
    dismiss()
    setSettingsModal('cloud')
  }

  // Con projectClosed no hay ninguna demo cargada de fondo (closeProject()
  // deja un curso vacío neutro): «Ver la demo» tiene que cargarla de verdad
  // en vez de solo descartar la pantalla, a diferencia del primer arranque
  // (donde la demo YA es el curso activo por defecto).
  function viewDemo() {
    if (projectClosed) resetSample()
    else dismiss()
  }

  return (
    <div className="ed-startgate-backdrop" role="dialog" aria-modal="true" aria-labelledby="ed-startgate-title">
      <input ref={fileRef} type="file" accept=".scormproj,.zip,application/zip" hidden onChange={(e) => void onFileChosen(e)} />
      <div className="ed-startgate">
        <h2 id="ed-startgate-title">{projectClosed ? 'SCORMEditor' : 'Bienvenido a SCORMEditor'}</h2>
        <p>{projectClosed
          ? 'No hay ningún proyecto abierto. ¿Por dónde quieres empezar?'
          : 'Estás viendo el curso de demostración, sin guardar. ¿Por dónde quieres empezar?'}</p>
        <div className="ed-startgate-options">
          <button className="ed-startgate-opt" onClick={startBlank}>
            <Icon name="plus" size={20} />
            <strong>Empezar en blanco</strong>
            <span>Un curso nuevo, con una portada vacía</span>
          </button>
          <button className="ed-startgate-opt" onClick={viewDemo}>
            <Icon name="book" size={20} />
            <strong>Ver la demo</strong>
            <span>Explora el curso de ejemplo, con todos los tipos de pantalla</span>
          </button>
          <button className="ed-startgate-opt" onClick={() => void openLocal()}>
            <Icon name="folder" size={20} />
            <strong>Abrir un archivo…</strong>
            <span>Un proyecto <code>.scormproj</code> o un ZIP SCORM exportado</span>
          </button>
          {isCloudConfigured() && (
            <button className="ed-startgate-opt" onClick={openCloud}>
              <Icon name="cloud" size={20} />
              <strong>Abrir de la nube</strong>
              <span>{cloudSession ? 'Elige un proyecto de tu organización' : 'Inicia sesión para ver tus proyectos'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
