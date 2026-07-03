import { useMemo } from 'react'
import { useCourseStore } from '../store/courseStore'
import { buildReport, generateReportHtml, generateReportMarkdown } from '../report/report'
import { IssueItem } from './IssueList'

export function ReportPanel() {
  const course = useCourseStore((s) => s.course)
  const goToScreen = useCourseStore((s) => s.goToScreen)
  const setActiveTab = useCourseStore((s) => s.setActiveTab)
  const data = useMemo(() => buildReport(course), [course])

  function download(text: string, name: string, type: string) {
    const blob = new Blob([text], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }

  function printPdf() {
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(generateReportHtml(course))
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 300)
  }

  /** Enlace a la superficie de edición de una fila del informe. */
  const screenLink = (screenId: string | undefined, text: string) =>
    screenId ? (
      <button className="ed-link" onClick={() => goToScreen(screenId)} title="Abrir en el editor">
        {text}
      </button>
    ) : (
      text
    )

  const c = data.counts
  const meta = course.course

  return (
    <div className="ed-report">
      <div className="ed-report-actions">
        <button onClick={() => download(generateReportMarkdown(course), 'informe.md', 'text/markdown')}>
          Descargar Markdown
        </button>
        <button onClick={() => download(generateReportHtml(course), 'informe.html', 'text/html')}>
          Descargar HTML
        </button>
        <button className="ed-primary" onClick={printPdf}>Imprimir / PDF</button>
      </div>

      <div className="ed-report-body">
        <h1>Informe de revisión — {meta.title || 'Curso'}</h1>
        <blockquote>
          Documento de apoyo a la revisión interna. <strong>No constituye homologación ni
          acreditación oficial</strong>; queda pendiente de validación por la entidad y la
          administración competente.
        </blockquote>

        <h2>1. Datos generales</h2>
        <ul>
          <li><strong>Título:</strong> {meta.title}</li>
          <li><strong>Entidad:</strong> {meta.authoring_entity || '—'}</li>
          <li><strong>Fuente documental:</strong> {meta.source_document || '—'}</li>
          <li><strong>Idioma:</strong> {meta.language}</li>
          <li><strong>Duración estimada:</strong> {meta.estimated_hours || '—'} h</li>
          <li>
            <strong>SCORM:</strong> {course.scorm.version} · id <code>{course.scorm.identifier}</code> ·
            nota mínima {course.scorm.rules.min_score}%
          </li>
        </ul>

        <h2>2. Estructura</h2>
        <table>
          <thead>
            <tr><th>Módulos</th><th>Unidades</th><th>Pantallas</th><th>Interacciones</th><th>Preguntas</th></tr>
          </thead>
          <tbody>
            <tr><td>{c.modules}</td><td>{c.units}</td><td>{c.screens}</td><td>{c.interactions}</td><td>{c.questions}</td></tr>
          </tbody>
        </table>

        <h2>3. Matriz de trazabilidad (objetivo ↔ pantalla ↔ interacción ↔ evaluación)</h2>
        <table>
          <thead>
            <tr><th>Objetivo</th><th>Ubicación</th><th>Pantalla</th><th>Interacción</th><th>Evaluado</th></tr>
          </thead>
          <tbody>
            {data.matrix.map((r, i) => (
              <tr key={i}>
                <td>{r.objective}</td>
                <td>{r.path}</td>
                <td>{screenLink(r.screenId, r.screen)}</td>
                <td>{r.interaction}</td>
                <td>{r.evaluation}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>4. Preguntas y respuestas correctas</h2>
        <table>
          <thead>
            <tr><th>Pregunta</th><th>Origen</th><th>Respuesta correcta</th><th>Objetivo</th></tr>
          </thead>
          <tbody>
            {data.qa.map((r, i) => (
              <tr key={i}>
                <td>{screenLink(r.screenId, r.question)}</td>
                <td>{r.origin}</td>
                <td>{r.correct}</td>
                <td>{r.objective}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>5. Checklists</h2>
        {data.checklists.map((list) => (
          <div key={list.label}>
            <h3>{list.label}</h3>
            <table>
              <thead><tr><th>Estado</th><th>Criterio</th></tr></thead>
              <tbody>
                {list.items.map((it) => (
                  <tr key={it.code}>
                    <td>{it.failed ? '❌' : '✅'}</td>
                    <td>
                      {it.label}
                      {it.failed && (
                        <button className="ed-link" onClick={() => setActiveTab('validation')}>
                          ver en Validación
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        <h2>6. Riesgos detectados (errores)</h2>
        {data.risks.length === 0 ? (
          <p><em>Sin errores bloqueantes.</em></p>
        ) : (
          <ul className="ed-issues">
            {data.risks.map((i, idx) => <IssueItem key={idx} issue={i} />)}
          </ul>
        )}

        <h2>7. Pendientes de validación normativa / por la entidad</h2>
        {data.pending.length === 0 ? (
          <p><em>Sin avisos.</em></p>
        ) : (
          <ul className="ed-issues">
            {data.pending.map((i, idx) => <IssueItem key={idx} issue={i} />)}
          </ul>
        )}
        <blockquote>
          <strong>Pendiente de revisión por la entidad</strong> y, en su caso, de alineación con
          criterios del SEPE o administración competente.
        </blockquote>
      </div>
    </div>
  )
}
