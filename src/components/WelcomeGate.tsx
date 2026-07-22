import { useRef, useState } from 'react'
import { useCourseStore } from '../store/courseStore'
import { isFsSupported, openProject, openProjectFromFile } from '../store/autosave'
import { isCloudConfigured } from '../cloud/client'
import { useCloudSessionStore } from '../cloud/session'
import { Icon } from './Icon'

const DISMISSED_KEY = 'ed:startGateDismissed'

/**
 * Pantalla de bienvenida: qué abrir al arrancar sin nada que retomar. Se
 * muestra solo cuando `initAutoSave()` ya terminó de comprobar IndexedDB
 * (`autosaveReady`) y no hay nada vinculado ni sin guardar — o sea, se está
 * mostrando la demo por defecto tal cual, sin que nadie la haya tocado ni
 * haya un proyecto/documento-nube en curso. En cuanto hay algo que retomar
 * (autoguardado, archivo vinculado o documento-nube) no se interpone: la app
 * entra directa, como hasta ahora. Elegir cualquier opción la descarta para
 * siempre (localStorage, igual que `WelcomeTip`): es una pantalla de
 * arranque, no un aviso recurrente.
 */
export function WelcomeGate() {
  const autosaveReady = useCourseStore((s) => s.autosaveReady)
  const linkedFileName = useCourseStore((s) => s.linkedFileName)
  const projectDirty = useCourseStore((s) => s.projectDirty)
  const cloudDocumentId = useCourseStore((s) => s.cloudDocumentId)
  const resetEmpty = useCourseStore((s) => s.resetEmpty)
  const setSettingsModal = useCourseStore((s) => s.setSettingsModal)
  const cloudSession = useCloudSessionStore((s) => s.session)
  const fileRef = useRef<HTMLInputElement>(null)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === '1')

  const nothingToResume = !linkedFileName && !projectDirty && !cloudDocumentId
  const show = autosaveReady && nothingToResume && !dismissed

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

  return (
    <div className="ed-startgate-backdrop" role="dialog" aria-modal="true" aria-labelledby="ed-startgate-title">
      <input ref={fileRef} type="file" accept=".scormproj,.zip,application/zip" hidden onChange={(e) => void onFileChosen(e)} />
      <div className="ed-startgate">
        <h2 id="ed-startgate-title">Bienvenido a SCORMEditor</h2>
        <p>Estás viendo el curso de demostración, sin guardar. ¿Por dónde quieres empezar?</p>
        <div className="ed-startgate-options">
          <button className="ed-startgate-opt" onClick={startBlank}>
            <Icon name="plus" size={20} />
            <strong>Empezar en blanco</strong>
            <span>Un curso nuevo, con una portada vacía</span>
          </button>
          <button className="ed-startgate-opt" onClick={dismiss}>
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
