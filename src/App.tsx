import { useEffect, useMemo, useRef, useState } from 'react'
import { initAutoSave, saveProject } from './store/autosave'
import { useCourseStore } from './store/courseStore'
import { validateCourse } from './validation/validators'
import { allScreens } from './schema/traverse'
import type { Tab } from './store/courseStore'
import { Toolbar } from './components/Toolbar'
import { CourseTree } from './components/CourseTree'
import { ScreenEditor } from './components/ScreenEditor'
import { FinalTestEditor } from './components/FinalTestEditor'
import { GlossaryEditor, BibliographyEditor } from './components/MaterialsEditor'
import { ValidationPanel } from './components/ValidationPanel'
import { StudentPreview } from './components/StudentPreview'
import { ReportPanel } from './components/ReportPanel'
import { ConfirmModal } from './components/ConfirmModal'
import { GuidedTour, WelcomeTip } from './components/GuidedTour'
import { Icon } from './components/Icon'

export function App() {
  const tab = useCourseStore((s) => s.activeTab)
  const setTab = useCourseStore((s) => s.setActiveTab)
  const course = useCourseStore((s) => s.course)
  // Recuento para el badge de la pestaña Validación (solo si hay errores/avisos).
  const val = useMemo(() => validateCourse(course), [course])
  // Entradas sintéticas del árbol (no son pantallas): test final y materiales.
  const selectedSynthetic = useCourseStore((s) =>
    s.selectedScreenId === '__final__' || s.selectedScreenId === '__glossary__' || s.selectedScreenId === '__bibliography__'
      ? s.selectedScreenId
      : null)

  useEffect(() => {
    initAutoSave()
  }, [])

  // Árbol lateral redimensionable (plan UX fase 9): ancho persistido; arrastrar
  // el separador redimensiona (soltar por debajo de ~80px lo pliega) y el doble
  // clic pliega/despliega.
  const [treeW, setTreeW] = useState<number>(() => {
    const raw = localStorage.getItem('ed:treeW')
    if (raw === null) return 320 // ojo: Number(null) === 0 plegaría el árbol
    const v = Number(raw)
    return Number.isFinite(v) && v >= 0 ? v : 320
  })
  useEffect(() => {
    localStorage.setItem('ed:treeW', String(treeW))
  }, [treeW])
  const dragRef = useRef<{ startX: number; startW: number } | null>(null)
  function onSplitDown(e: React.PointerEvent) {
    dragRef.current = { startX: e.clientX, startW: treeW }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  function onSplitMove(e: React.PointerEvent) {
    if (!dragRef.current) return
    const w = Math.round(dragRef.current.startW + e.clientX - dragRef.current.startX)
    setTreeW(w <= 80 ? 0 : Math.max(200, Math.min(560, w)))
  }
  function onSplitUp() {
    dragRef.current = null
  }

  // Atajos globales: Ctrl/Cmd+Z deshacer, Ctrl/Cmd+Shift+Z o Ctrl+Y rehacer,
  // Ctrl+S guardar, Alt+↑/↓ pantalla anterior/siguiente, F1 o Ctrl+/ ayuda.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'F1') {
        e.preventDefault()
        useCourseStore.getState().setSettingsModal('shortcuts')
        return
      }
      if (e.altKey && !e.ctrlKey && !e.metaKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault()
        const st = useCourseStore.getState()
        const ids = allScreens(st.course).map((s) => s.id)
        if (!ids.length) return
        const i = ids.indexOf(st.selectedScreenId ?? '')
        // Sin selección (o nodo sintético): baja al primero / sube al último.
        const id = i === -1
          ? (e.key === 'ArrowDown' ? ids[0] : ids[ids.length - 1])
          : ids[e.key === 'ArrowDown' ? Math.min(ids.length - 1, i + 1) : Math.max(0, i - 1)]
        st.goToScreen(id)
        return
      }
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return
      const key = e.key.toLowerCase()
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault()
        useCourseStore.getState().undo()
      } else if ((key === 'z' && e.shiftKey) || key === 'y') {
        e.preventDefault()
        useCourseStore.getState().redo()
      } else if (key === 's') {
        e.preventDefault()
        void saveProject()
      } else if (key === '/') {
        e.preventDefault()
        useCourseStore.getState().setSettingsModal('shortcuts')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="ed-app">
      <Toolbar />
      <div className="ed-tabs" role="tablist" data-tour="tabs">
        {([
          ['editor', 'Editor'],
          ['preview', 'Vista estudiante'],
          ['validation', 'Validación'],
          ['report', 'Informe'],
        ] as [Tab, string][]).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? 'is-active' : ''}
            onClick={() => setTab(id)}
          >
            {label}
            {id === 'validation' && (val.errors > 0 || val.warnings > 0) && (
              <span className={`ed-status ${val.errors > 0 ? 'err' : 'warn'}`}
                title={`${val.errors} error${val.errors === 1 ? '' : 'es'} · ${val.warnings} aviso${val.warnings === 1 ? '' : 's'}`}>
                {val.errors > 0 && <>{val.errors} <Icon name="alert-octagon" size={11} /></>}
                {val.errors > 0 && val.warnings > 0 && ' · '}
                {val.warnings > 0 && <>{val.warnings} <Icon name="alert-triangle" size={11} /></>}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Con el árbol plegado el aside no se renderiza: si siguiera en el grid
          (aunque fuera con display:none) los ítems se recolocarían de columna. */}
      <div className={`ed-main ${tab === 'editor' ? '' : 'ed-main-full'}`}
        style={tab === 'editor' ? { gridTemplateColumns: treeW === 0 ? '6px 1fr' : `${treeW}px 6px 1fr` } : undefined}>
        {tab === 'editor' && (
          <>
            {treeW > 0 && (
              <aside className="ed-tree" data-tour="tree">
                <CourseTree />
              </aside>
            )}
            <div className="ed-splitter" role="separator" aria-orientation="vertical"
              aria-label="Redimensionar el árbol"
              title="Arrastra para redimensionar el árbol; doble clic lo pliega/despliega"
              onPointerDown={onSplitDown} onPointerMove={onSplitMove} onPointerUp={onSplitUp}
              onDoubleClick={() => setTreeW((w) => (w === 0 ? 320 : 0))} />
          </>
        )}
        <section className="ed-content" data-tour="content">
          {tab === 'editor' && (
            selectedSynthetic === '__final__' ? <FinalTestEditor />
            : selectedSynthetic === '__glossary__' ? <GlossaryEditor />
            : selectedSynthetic === '__bibliography__' ? <BibliographyEditor />
            : <ScreenEditor />
          )}
          {tab === 'preview' && <StudentPreview />}
          {tab === 'validation' && <ValidationPanel />}
          {tab === 'report' && <ReportPanel />}
        </section>
      </div>
      <ConfirmModal />
      <GuidedTour />
      <WelcomeTip />
    </div>
  )
}
