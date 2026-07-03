import { useEffect } from 'react'
import { initAutoSave, saveProject } from './store/autosave'
import { useCourseStore } from './store/courseStore'
import type { Tab } from './store/courseStore'
import { Toolbar } from './components/Toolbar'
import { CourseTree } from './components/CourseTree'
import { ScreenEditor } from './components/ScreenEditor'
import { FinalTestEditor } from './components/FinalTestEditor'
import { ValidationPanel } from './components/ValidationPanel'
import { StudentPreview } from './components/StudentPreview'
import { ReportPanel } from './components/ReportPanel'
import { ConfirmModal } from './components/ConfirmModal'

export function App() {
  const tab = useCourseStore((s) => s.activeTab)
  const setTab = useCourseStore((s) => s.setActiveTab)
  const selectedFinal = useCourseStore((s) => s.selectedScreenId === '__final__')

  useEffect(() => {
    initAutoSave()
  }, [])

  // Atajos globales: Ctrl/Cmd+Z deshacer, Ctrl/Cmd+Shift+Z o Ctrl+Y rehacer.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
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
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="ed-app">
      <Toolbar />
      <div className="ed-tabs" role="tablist">
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
          </button>
        ))}
      </div>

      <div className={`ed-main ${tab === 'preview' || tab === 'report' ? 'ed-main-full' : ''}`}>
        {(tab === 'editor' || tab === 'validation') && (
          <aside className="ed-tree">
            <CourseTree />
          </aside>
        )}
        <section className="ed-content">
          {tab === 'editor' && (selectedFinal ? <FinalTestEditor /> : <ScreenEditor />)}
          {tab === 'preview' && <StudentPreview />}
          {tab === 'validation' && <ValidationPanel />}
          {tab === 'report' && <ReportPanel />}
        </section>
      </div>
      <ConfirmModal />
    </div>
  )
}
