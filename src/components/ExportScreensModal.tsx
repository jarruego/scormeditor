import { useMemo, useState } from 'react'
import { useCourseStore } from '../store/courseStore'
import { confirmDialog } from '../store/confirm'
import { exportScreens, SCREEN_PKG_EXT } from '../store/screenPackage'
import { screenContainers, containerLabel } from '../schema/traverse'
import { screenTypeIcon, screenTypeColor } from '../schema/labels'
import { SettingsWindow } from './SettingsModal'
import { Icon } from './Icon'

/**
 * «Exportar pantallas» (desde la cabecera del `ScreenEditor`): elige una o
 * varias pantallas del curso —la abierta viene marcada— y las descarga como
 * paquete `.scormscreen` para importarlas en otro curso (ver `screenPackage.ts`).
 * Lista agrupada por contenedor, en el orden del árbol; cada grupo tiene una
 * casilla para marcar/desmarcar todas sus pantallas.
 */
export function ExportScreensModal({ initialId, onClose }: { initialId: string; onClose: () => void }) {
  const course = useCourseStore((s) => s.course)
  const groups = useMemo(() => screenContainers(course).filter((c) => c.screens.length), [course])
  const [picked, setPicked] = useState<Set<string>>(() => new Set([initialId]))
  const [busy, setBusy] = useState(false)

  function toggle(ids: string[], on: boolean) {
    const next = new Set(picked)
    ids.forEach((id) => (on ? next.add(id) : next.delete(id)))
    setPicked(next)
  }

  async function run() {
    setBusy(true)
    try {
      await exportScreens(picked)
      onClose()
    } catch (e) {
      void confirmDialog({ title: 'Exportar pantallas', message: `No se pudo exportar: ${(e as Error).message}`, hideCancel: true })
    } finally {
      setBusy(false)
    }
  }

  return (
    <SettingsWindow title="Exportar pantallas" onClose={onClose} busy={busy}>
      <p className="ed-hint">
        Marca las pantallas que quieras reutilizar. Se descargan en un archivo <code>{SCREEN_PKG_EXT}</code> con
        sus imágenes, vídeos y audios de narración, y los términos del glosario que usan. Para usarlo en otro
        curso: «Añadir pantalla…» › «Importar pantallas».
      </p>
      <div className="ed-export-list">
        {groups.map((g, gi) => {
          const ids = g.screens.map((s) => s.id)
          const n = ids.filter((id) => picked.has(id)).length
          return (
            <fieldset key={gi} className="ed-export-group">
              <legend>
                <label>
                  <input type="checkbox" checked={n === ids.length}
                    ref={(el) => { if (el) el.indeterminate = n > 0 && n < ids.length }}
                    onChange={(e) => toggle(ids, e.target.checked)} />
                  {containerLabel(g)}
                </label>
              </legend>
              {g.screens.map((s) => (
                <label key={s.id} className="ed-export-item">
                  <input type="checkbox" checked={picked.has(s.id)} onChange={(e) => toggle([s.id], e.target.checked)} />
                  <Icon name={screenTypeIcon(s.type)} size={13} color={screenTypeColor(s.type)} />
                  <span>{s.title || '(sin título)'}</span>
                </label>
              ))}
            </fieldset>
          )
        })}
      </div>
      <footer className="ed-hz-foot">
        <button onClick={onClose} disabled={busy}>Cancelar</button>
        <button className="ed-primary" onClick={() => void run()} disabled={busy || !picked.size}>
          <Icon name="download" size={13} /> {busy ? 'Exportando…' : `Exportar ${picked.size} ${picked.size === 1 ? 'pantalla' : 'pantallas'}`}
        </button>
      </footer>
    </SettingsWindow>
  )
}
