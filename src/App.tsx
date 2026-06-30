import { useEffect, useState } from 'react'
import { initAutoSave } from './store/autosave'
import { Toolbar } from './components/Toolbar'
import { CourseTree } from './components/CourseTree'
import { ScreenEditor } from './components/ScreenEditor'
import { ValidationPanel } from './components/ValidationPanel'
import { StudentPreview } from './components/StudentPreview'
import { ReportPanel } from './components/ReportPanel'

type Tab = 'editor' | 'preview' | 'validation' | 'report'

export function App() {
  const [tab, setTab] = useState<Tab>('editor')

  useEffect(() => {
    initAutoSave()
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
          {tab === 'editor' && <ScreenEditor />}
          {tab === 'preview' && <StudentPreview />}
          {tab === 'validation' && <ValidationPanel />}
          {tab === 'report' && <ReportPanel />}
        </section>
      </div>
    </div>
  )
}
