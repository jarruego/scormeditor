import { SettingsWindow } from './SettingsModal'

const SHORTCUTS: { keys: string; what: string }[] = [
  { keys: 'Ctrl + S', what: 'Guardar el proyecto' },
  { keys: 'Ctrl + Z', what: 'Deshacer (el tecleo seguido se deshace de una vez)' },
  { keys: 'Ctrl + Mayús + Z  ·  Ctrl + Y', what: 'Rehacer' },
  { keys: 'Alt + ↓  ·  Alt + ↑', what: 'Pantalla siguiente / anterior (en el orden del árbol)' },
  { keys: 'F1  ·  Ctrl + /', what: 'Esta ayuda de atajos' },
  { keys: 'Esc', what: 'Cerrar la ventana o el menú abiertos' },
]

/** Ventana «Atajos de teclado» (F1 / Ctrl+/ / menú Ajustes). */
export function ShortcutsModal({ onClose }: { onClose: () => void }) {
  return (
    <SettingsWindow title="Atajos de teclado" onClose={onClose}>
      <table className="ed-shortcuts">
        <tbody>
          {SHORTCUTS.map((s) => (
            <tr key={s.keys}>
              <td className="ed-shortcuts-keys">{s.keys}</td>
              <td>{s.what}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="ed-hint">
        Además: el separador entre el árbol y el editor se arrastra para redimensionar
        (doble clic lo pliega/despliega), y en el árbol las pantallas se reordenan
        arrastrando su asa (también con teclado) y los módulos/unidades con las flechas.
      </p>
    </SettingsWindow>
  )
}
