import { useMemo } from 'react'
import { useCourseStore } from '../store/courseStore'
import { generateReportHtml, generateReportMarkdown } from '../report/report'

export function ReportPanel() {
  const course = useCourseStore((s) => s.course)
  const html = useMemo(() => generateReportHtml(course), [course])

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
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 300)
  }

  return (
    <div className="ed-report">
      <div className="ed-report-actions">
        <button onClick={() => download(generateReportMarkdown(course), 'informe.md', 'text/markdown')}>
          Descargar Markdown
        </button>
        <button onClick={() => download(html, 'informe.html', 'text/html')}>Descargar HTML</button>
        <button className="ed-primary" onClick={printPdf}>Imprimir / PDF</button>
      </div>
      <iframe className="ed-report-frame" title="Informe de revisión" srcDoc={html} />
    </div>
  )
}
