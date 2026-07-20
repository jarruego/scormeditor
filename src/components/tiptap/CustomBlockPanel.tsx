import { useState } from 'react'
import { PALETTE } from '../../store/customBlocks'
import { IconPicker } from './IconPicker'

export type CustomBlockDraft = { title: string; icon: string; color: string }

/**
 * Formulario de "Bloque personalizado" (icono, color, título): lo usan tanto la
 * barra del editor (insertar uno nuevo) como el propio nodo callout (editar el
 * que ya existe). Único origen para no duplicar el marcado dos veces.
 */
export function CustomBlockPanel({
  draft,
  setDraft,
  onCancel,
  onApply,
  mode,
}: {
  draft: CustomBlockDraft
  setDraft: (d: CustomBlockDraft) => void
  onCancel: () => void
  onApply: (save: boolean) => void
  mode: 'insert' | 'edit'
}) {
  const [showIcons, setShowIcons] = useState(false)

  return (
    <div className="ed-rta-custom">
      <div className="ed-rta-custom-row">
        <IconPicker value={draft.icon} onChange={(icon) => setDraft({ ...draft, icon })} open={showIcons} onOpenChange={setShowIcons} />
        <label>
          <span>Título</span>
          <input value={draft.title} placeholder="p. ej. Buenas prácticas"
            onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        </label>
      </div>
      <div className="ed-rta-custom-row">
        <div className="ed-rta-swatches">
          {PALETTE.map((c) => (
            <button key={c.value} type="button" title={c.label}
              className={`ed-rta-swatch ${draft.color.toLowerCase() === c.value.toLowerCase() ? 'is-on' : ''}`}
              style={{ background: c.value }} onClick={() => setDraft({ ...draft, color: c.value })} />
          ))}
          <input type="color" value={draft.color} aria-label="Color personalizado"
            onChange={(e) => setDraft({ ...draft, color: e.target.value })} />
        </div>
        <div className="ed-rta-custom-actions">
          <button type="button" onClick={onCancel}>Cancelar</button>
          {mode === 'edit' ? (
            <button type="button" className="ed-primary" onClick={() => onApply(false)}>Guardar cambios</button>
          ) : (
            <>
              <button type="button" onClick={() => onApply(false)}>Insertar</button>
              <button type="button" className="ed-primary" disabled={!draft.title.trim() && !draft.icon.trim()}
                title="Guarda el bloque como preset reutilizable" onClick={() => onApply(true)}>Guardar y usar</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
