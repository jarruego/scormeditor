import { useEffect, useMemo, useRef, useState } from 'react'
import { useCourseStore } from '../store/courseStore'
import { downloadScorm } from '../export/exportScorm'
import {
  isFsSupported,
  openProject,
  openProjectFromFile,
  saveProjectAs,
  clearLocalLink,
} from '../store/autosave'
import { saveCurrentProject } from '../cloud/sync'
import { CourseSettingsModal, AppearanceModal, NarrationModal } from './SettingsModal'
import { ObjectivesModal } from './ObjectivesModal'
import { ShortcutsModal } from './ShortcutsModal'
import { HelpModal } from './HelpModal'
import { CloudModal } from './CloudModal'
import { startTour } from './GuidedTour'
import { InlineRename } from './InlineRename'
import { confirmDialog } from '../store/confirm'
import { orphanAssetPaths } from '../schema/assetRefs'
import { isCloudConfigured } from '../cloud/client'
import { useCloudSessionStore } from '../cloud/session'
import { Icon } from './Icon'
import logoUrl from '../assets/brand/logo-horizontal.svg'

// Confirmación de descarte con el modal propio (no window.confirm), como el
// resto de confirmaciones del editor.
function confirmDiscard() {
  return confirmDialog({
    title: 'Reemplazar el curso abierto',
    message:
      'Esto reemplazará el curso que tienes abierto. Los cambios que no hayas guardado en el archivo de proyecto se perderán. ¿Continuar?',
    confirmLabel: 'Continuar',
    danger: true,
  })
}

export function Toolbar() {
  const course = useCourseStore((s) => s.course)
  const assets = useCourseStore((s) => s.assets)
  const resetSample = useCourseStore((s) => s.resetSample)
  const resetEmpty = useCourseStore((s) => s.resetEmpty)
  const importError = useCourseStore((s) => s.importError)
  const linkedFileName = useCourseStore((s) => s.linkedFileName)
  const projectDirty = useCourseStore((s) => s.projectDirty)
  const cloudDocumentId = useCourseStore((s) => s.cloudDocumentId)
  const cloudTitle = useCourseStore((s) => s.cloudTitle)
  const cloudStale = useCourseStore((s) => s.cloudStale)
  const cloudLockHolderEmail = useCourseStore((s) => s.cloudLockHolderEmail)
  const undo = useCourseStore((s) => s.undo)
  const redo = useCourseStore((s) => s.redo)
  const canUndo = useCourseStore((s) => s.past.length > 0)
  const canRedo = useCourseStore((s) => s.future.length > 0)
  const updateCourseInfo = useCourseStore((s) => s.updateCourseInfo)
  const pruneOrphanAssets = useCourseStore((s) => s.pruneOrphanAssets)
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const cloudSession = useCloudSessionStore((s) => s.session)
  // Qué ventana de ajustes está abierta. Vive en el store para que Validación
  // pueda abrirla desde sus enlaces («abrir ajustes»).
  const settingsModal = useCourseStore((s) => s.settingsModal)
  const setSettingsModal = useCourseStore((s) => s.setSettingsModal)
  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false)
  const [helpMenuOpen, setHelpMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const settingsMenuRef = useRef<HTMLDivElement>(null)
  const helpMenuRef = useRef<HTMLDivElement>(null)
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
  useMenuDismiss(helpMenuOpen, helpMenuRef, () => setHelpMenuOpen(false))

  // Local y nube son mutuamente excluyentes (courseStore.setCloudLink): un
  // proyecto está SIEMPRE en uno de los dos modos, nunca los dos — de ahí
  // que un único indicador/gesto de guardado baste (ver src/cloud/sync.ts).
  const isCloudMode = !!cloudDocumentId
  const isSaved = !!linkedFileName && !projectDirty
  // «Sincronizado» significa dos cosas a la vez: nada tuyo pendiente de subir
  // Y nada ajeno pendiente de bajar (cloudStale, que viene de Realtime en
  // src/cloud/watch.ts). Si alguien más ha subido una versión, el proyecto
  // NO está sincronizado aunque projectDirty sea false — de ahí el estado
  // «isStale» aparte, con su propio aviso en vez de mentir con la pastilla verde.
  const isStale = isCloudMode && cloudStale
  const isSynced = isCloudMode && !projectDirty && !cloudStale
  // Recursos que ya no usa ninguna diapositiva (peso muerto en el .scormproj).
  const orphanCount = useMemo(() => orphanAssetPaths(course, assets).length, [course, assets])

  async function onSaveClick() {
    setSaving(true)
    try {
      await saveCurrentProject()
    } finally {
      setSaving(false)
    }
  }

  async function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (await confirmDiscard()) void openProjectFromFile(file)
  }

  async function onExportScorm() {
    setBusy(true)
    try {
      await downloadScorm({ course, assets })
    } finally {
      setBusy(false)
    }
  }

  // Exporta el curso a un paquete .elpx de eXeLearning (≥ 4.0.1). El módulo se
  // carga bajo demanda (import dinámico): su código no pesa en el bundle si no
  // se usa. Tras generar, se resume qué se convirtió y qué se reconvirtió.
  async function onExportElpx() {
    setBusy(true)
    try {
      const { downloadElpx } = await import('../interop/elpx')
      const { summary } = await downloadElpx(course, assets)
      const lines = [
        `Se ha generado el paquete .elpx para eXeLearning 4.0.1 o posterior.`,
        ``,
        `• Páginas: ${summary.pages}`,
        `• Actividades y bloques de contenido: ${summary.components}`,
      ]
      if (summary.notes.length) {
        lines.push(``, `Reconversiones y ajustes:`)
        for (const n of summary.notes) lines.push(`• ${n}`)
      }
      lines.push(
        ``,
        `Ábrelo en eXeLearning con «Importar». Se pierden la nota SCORM, el gating y los intentos (eXe los gestiona de otro modo).`,
      )
      await confirmDialog({
        title: 'Exportación a eXeLearning completada',
        message: lines.join('\n'),
        confirmLabel: 'Entendido',
        hideCancel: true,
      })
    } catch (err) {
      await confirmDialog({
        title: 'No se pudo exportar a eXeLearning',
        message: `Ha ocurrido un error al generar el .elpx:\n\n${err instanceof Error ? err.message : String(err)}`,
        confirmLabel: 'Cerrar',
        hideCancel: true,
      })
    } finally {
      setBusy(false)
    }
  }

  // Ejecuta la acción de un ítem del menú y lo cierra.
  function runMenu(action: () => void) {
    setMenuOpen(false)
    action()
  }

  async function onNewDemo() {
    if (await confirmDiscard()) { await clearLocalLink(); resetSample() }
  }
  async function onNewEmpty() {
    if (await confirmDiscard()) { await clearLocalLink(); resetEmpty() }
  }
  async function onOpen() {
    if (await confirmDiscard()) void openProject()
  }
  async function onPruneOrphans() {
    if (orphanCount === 0) return
    const ok = await confirmDialog({
      title: 'Borrar recursos huérfanos',
      message: `Se eliminarán ${orphanCount} recurso(s) que ya no usa ninguna diapositiva, para reducir el tamaño del proyecto. Es irreversible (no se puede deshacer). ¿Continuar?`,
      confirmLabel: 'Borrar',
      danger: true,
    })
    if (ok) pruneOrphanAssets()
  }

  return (
    <header className="ed-toolbar">
      <img className="ed-logo-img" src={logoUrl} alt="SCORMEditor" />
      <span className="ed-course-name" data-tour="course-name">
        <InlineRename value={course.course.title} placeholder="Curso sin título"
          title="Renombrar el curso (título principal del SCORM)"
          onChange={(title) => updateCourseInfo({ title })} />
      </span>

      {/* Estado del documento (guardado) + estado de cuenta (nube), como un
          único bloque «en conjunto»: dos botones independientes pero unidos
          visualmente (segmented pill), para que se lean como una sola pieza
          de información en vez de dos indicadores sueltos por la Toolbar.
          El de guardado usa un único gesto (clic o Ctrl+S) adaptado al modo
          activo — escribe en disco si es local, sube una versión si es
          nube (src/cloud/sync.ts). Nunca los dos modos a la vez. */}
      <div className="ed-doc-status">
        <button
          className={`ed-docstate ${isCloudMode ? (isStale ? 'is-stale' : isSynced ? 'is-saved' : 'is-dirty') : (isSaved ? 'is-saved' : 'is-dirty')}`}
          data-tour="docstate"
          disabled={saving}
          onClick={() => void onSaveClick()}
          title={
            isCloudMode
              ? (isStale
                ? `Hay una versión más reciente en la nube: alguien ha subido cambios después de tu última sincronización. Pulsa para abrir ☁ Nube y decidir (bajarla, o subir la tuya igualmente).`
                : isSynced
                ? `Sincronizado con la nube («${cloudTitle}»).${cloudLockHolderEmail ? ` ${cloudLockHolderEmail} lo tiene abierto también ahora mismo.` : ''} Ctrl+S para forzar una subida.`
                : `Cambios sin subir a la nube («${cloudTitle}»).${cloudLockHolderEmail ? ` ${cloudLockHolderEmail} lo tiene abierto también ahora mismo.` : ''} Pulsa para subir (Ctrl+S).`)
              : (isSaved
                ? `Proyecto guardado en ${linkedFileName}. Ctrl+S para volver a guardar.`
                : 'Cambios sin guardar. Pulsa para guardar el proyecto (Ctrl+S). Tus cambios se conservan automáticamente por si cierras sin guardar.')
          }
        >
          {saving ? (
            <>{isCloudMode ? 'Subiendo…' : 'Guardando…'}</>
          ) : isCloudMode ? (
            // El título del curso ya se ve al lado, en la cabecera — repetirlo
            // aquí sería ruido; queda solo en el tooltip (hover), no en pantalla.
            <><Icon name={isStale ? 'refresh' : 'cloud'} size={12} /> {isStale ? 'Nueva versión' : isSynced ? 'Sincronizado' : 'Sin subir'}</>
          ) : (
            <><Icon name={isSaved ? 'check' : 'dot'} size={12} />{' '}
              {isSaved ? `Guardado · ${linkedFileName}` : `Sin guardar${linkedFileName ? ` · ${linkedFileName}` : ''}`}</>
          )}
        </button>

        {isCloudConfigured() && (
          <button
            className={`ed-session-chip ${cloudSession ? 'is-connected' : ''}`}
            onClick={() => setSettingsModal('cloud')}
            title={cloudSession ? `Conectado a la nube como ${cloudSession.user.email}. Pulsa para gestionar equipo y proyectos.` : 'Nube: sin conectar. Pulsa para iniciar sesión.'}
          >
            <Icon name="cloud" size={13} /> {cloudSession ? cloudSession.user.email : 'Nube: sin conectar'}
          </button>
        )}
      </div>

      <div className="ed-toolbar-actions">
        <button onClick={undo} disabled={!canUndo} title="Deshacer (Ctrl+Z)" aria-label="Deshacer">
          <Icon name="undo" size={14} /> Deshacer</button>
        <button onClick={redo} disabled={!canRedo} title="Rehacer (Ctrl+Mayús+Z)" aria-label="Rehacer">
          <Icon name="redo" size={14} /> Rehacer</button>

        <input ref={fileRef} type="file" accept=".scormproj,.zip,application/zip" hidden onChange={onImportFile} />
        <div className="ed-menu" ref={menuRef} data-tour="file-menu">
          <button
            className="ed-menu-trigger"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {busy ? 'Generando…' : <>Archivo <Icon name="chevron-down" size={12} /></>}
          </button>
          {menuOpen && (
            <div className="ed-menu-list" role="menu">
              <p className={`ed-menu-modeline ${isCloudMode ? 'is-cloud' : 'is-local'}`}>
                {isCloudMode
                  ? <><Icon name="cloud" size={13} /> Nube</>
                  : <><Icon name="folder" size={13} /> Local{linkedFileName ? ` · ${linkedFileName}` : ' · sin guardar todavía'}</>}
              </p>

              {isCloudMode ? (
                <>
                  <button role="menuitem" className="ed-menu-cloud-item" onClick={() => runMenu(() => void onSaveClick())} title="Sube una versión nueva a la nube (Ctrl+S)">
                    <Icon name="cloud" size={13} /> Actualizar en la nube
                  </button>
                  <button role="menuitem" className="ed-menu-cloud-item" onClick={() => runMenu(() => setSettingsModal('cloud'))} title="Elegir otro proyecto de la nube">
                    <Icon name="cloud" size={13} /> Abrir otro proyecto de la nube…
                  </button>
                  <button role="menuitem" className="ed-menu-cloud-item" onClick={() => runMenu(() => setSettingsModal('cloud'))} title="Ver el equipo, cambiar de organización o de rol">
                    <Icon name="cloud" size={13} /> Gestionar equipo…
                  </button>
                  <hr className="ed-menu-sep" />
                  <button role="menuitem" onClick={() => runMenu(fsOk ? onOpen : () => fileRef.current?.click())} title="Reemplaza el curso abierto por uno local; deja de estar vinculado a la nube">
                    <Icon name="folder" size={13} /> Abrir proyecto local…
                  </button>
                  {fsOk && (
                    <button role="menuitem" onClick={() => runMenu(() => void saveProjectAs())} title="Crea una copia en un archivo local y desvincula este curso de la nube">
                      <Icon name="folder" size={13} /> Guardar copia local…
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button role="menuitem" onClick={() => runMenu(fsOk ? onOpen : () => fileRef.current?.click())} title="Abrir un proyecto .scormproj">
                    <Icon name="folder" size={13} /> Abrir proyecto…
                  </button>
                  <button role="menuitem" onClick={() => runMenu(() => void onSaveClick())} title="Guardar el proyecto (Ctrl+S)">
                    <Icon name="folder" size={13} /> Guardar{linkedFileName ? '' : ' proyecto…'}
                  </button>
                  {fsOk && (
                    <button role="menuitem" onClick={() => runMenu(() => void saveProjectAs())} title="Guardar una copia en un archivo nuevo">
                      <Icon name="folder" size={13} /> Guardar como…
                    </button>
                  )}
                  {isCloudConfigured() && (
                    <>
                      <hr className="ed-menu-sep" />
                      <button role="menuitem" className="ed-menu-cloud-item" onClick={() => runMenu(() => setSettingsModal('cloud'))} title="Elegir un proyecto guardado en la nube del equipo">
                        <Icon name="cloud" size={13} /> Abrir desde la nube…
                      </button>
                      <button role="menuitem" className="ed-menu-cloud-item" onClick={() => runMenu(() => setSettingsModal('cloud'))} title="Subir este curso a la nube para compartirlo con el equipo">
                        <Icon name="cloud" size={13} /> Subir a la nube…
                      </button>
                    </>
                  )}
                </>
              )}

              {orphanCount > 0 && (
                <button role="menuitem"
                  onClick={() => runMenu(() => void onPruneOrphans())}
                  title="Elimina del proyecto los archivos que ya no usa ninguna diapositiva, para reducir su tamaño (el SCORM exportado ya los ignora)">
                  Borrar recursos huérfanos ({orphanCount})
                </button>
              )}
              <hr className="ed-menu-sep" />
              <button role="menuitem" onClick={() => runMenu(onNewEmpty)}
                title="Curso mínimo desde cero: un módulo con la portada, sin recursos">
                Nuevo (vacío)
              </button>
              <button role="menuitem" onClick={() => runMenu(onNewDemo)}>Nuevo (demo)</button>
              <button role="menuitem" className="ed-menu-primary" disabled={busy} onClick={() => runMenu(onExportScorm)}>
                {busy ? 'Generando…' : 'Exportar SCORM ZIP'}
              </button>
              <button role="menuitem" disabled={busy} onClick={() => runMenu(() => void onExportElpx())}
                title="Exportar el curso a un paquete .elpx para seguir editándolo en eXeLearning 4.0.1 o posterior">
                {busy ? 'Generando…' : 'Exportar a eXeLearning (.elpx)'}
              </button>
            </div>
          )}
        </div>

        <div className="ed-menu" ref={settingsMenuRef} data-tour="settings-menu">
          <button
            className="ed-menu-trigger"
            aria-haspopup="menu"
            aria-expanded={settingsMenuOpen}
            onClick={() => setSettingsMenuOpen((o) => !o)}
            title="Ajustes del curso y de narración"
          >
            <Icon name="settings" size={14} /> Ajustes <Icon name="chevron-down" size={12} />
          </button>
          {settingsMenuOpen && (
            <div className="ed-menu-list" role="menu">
              <button role="menuitem" onClick={() => { setSettingsMenuOpen(false); setSettingsModal('course') }}
                title="Nota mínima, finalización, peso de la nota, navegación…">
                Curso (Finalización)
              </button>
              <button role="menuitem" onClick={() => { setSettingsMenuOpen(false); setSettingsModal('objectives') }}
                title="Ver, renombrar, quitar y añadir objetivos de aprendizaje del curso">
                Objetivos de aprendizaje
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

        <div className="ed-menu" ref={helpMenuRef} data-tour="help-menu">
          <button
            className="ed-menu-trigger"
            aria-haspopup="menu"
            aria-expanded={helpMenuOpen}
            onClick={() => setHelpMenuOpen((o) => !o)}
            title="Manual, tour guiado y atajos de teclado"
          >
            <Icon name="help-circle" size={14} /> Ayuda <Icon name="chevron-down" size={12} />
          </button>
          {helpMenuOpen && (
            <div className="ed-menu-list" role="menu">
              <button role="menuitem" onClick={() => { setHelpMenuOpen(false); setSettingsModal('help') }}
                title="El manual completo de la aplicación, con capturas">
                Manual de usuario
              </button>
              <button role="menuitem" onClick={() => { setHelpMenuOpen(false); startTour() }}
                title="Recorrido interactivo por la interfaz (un minuto)">
                Tour guiado
              </button>
              <hr className="ed-menu-sep" />
              <button role="menuitem" onClick={() => { setHelpMenuOpen(false); setSettingsModal('shortcuts') }}
                title="Lista de atajos de teclado del editor (también con F1)">
                Atajos de teclado
              </button>
            </div>
          )}
        </div>
      </div>

      {importError && <div className="ed-import-error"><Icon name="alert-octagon" size={14} /> {importError}</div>}

      {settingsModal === 'shortcuts' && <ShortcutsModal onClose={() => setSettingsModal(null)} />}
      {settingsModal === 'course' && <CourseSettingsModal onClose={() => setSettingsModal(null)} />}
      {settingsModal === 'objectives' && <ObjectivesModal onClose={() => setSettingsModal(null)} />}
      {settingsModal === 'appearance' && <AppearanceModal onClose={() => setSettingsModal(null)} />}
      {settingsModal === 'narration' && <NarrationModal onClose={() => setSettingsModal(null)} />}
      {settingsModal === 'help' && <HelpModal onClose={() => setSettingsModal(null)} />}
      {settingsModal === 'cloud' && <CloudModal onClose={() => setSettingsModal(null)} />}
    </header>
  )
}
