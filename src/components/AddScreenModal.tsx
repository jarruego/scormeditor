import { useCourseStore } from '../store/courseStore'
import type { ScreenInput } from '../schema/course.schema'
import { RECIPE_GROUPS, RECIPE_GROUP_LABELS, RECIPE_GROUP_HINTS, SCREEN_RECIPES, type ScreenRecipe } from '../schema/screenRecipes'
import { SettingsWindow } from './SettingsModal'

/**
 * Selector de recetas de «+ Añadir pantalla»: tarjetas agrupadas por el papel
 * de la pantalla en la unidad (estructura / contenido / práctica / evaluación).
 * Las recetas «únicas por unidad» ya presentes se atenúan pero siguen siendo
 * pulsables (aviso blando, no bloqueo). Si llega `atIndex` (punto de inserción
 * elegido por el autor en el árbol), esa posición manda sobre la colocación
 * automática de la receta.
 */
export function AddScreenModal({ unitId, atIndex, onClose }: { unitId: string; atIndex?: number; onClose: () => void }) {
  const course = useCourseStore((s) => s.course)
  const addScreen = useCourseStore((s) => s.addScreen)

  const unit = course.modules.flatMap((m) => m.units).find((u) => u.id === unitId)
  if (!unit) return null

  function create(r: ScreenRecipe) {
    if (!unit) return
    const preset: Partial<ScreenInput> = { type: r.type, ...(r.extras ? r.extras() : {}) }
    const title = typeof r.defaultTitle === 'function' ? r.defaultTitle(unit) : r.defaultTitle
    if (title) preset.title = title
    addScreen(unitId, undefined, preset, atIndex ?? (r.place ? r.place(unit.screens) : undefined))
    onClose()
    // La pantalla queda seleccionada en el store; llevamos el foco al título
    // para que el autor pueda teclear directamente.
    setTimeout(() => {
      const el = document.querySelector<HTMLInputElement>('input[data-field="screen-title"]')
      if (el) { el.focus(); el.select() }
    }, 0)
  }

  // Navegación con flechas entre tarjetas (además del orden natural de Tab).
  function onKeyDown(e: React.KeyboardEvent) {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return
    const cards = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('.ed-recipe'))
    const i = cards.indexOf(document.activeElement as HTMLButtonElement)
    if (i < 0) return
    e.preventDefault()
    const delta = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1
    cards[(i + delta + cards.length) % cards.length]?.focus()
  }

  return (
    <SettingsWindow title="Nueva pantalla" onClose={onClose} wide>
      <div className="ed-recipes" onKeyDown={onKeyDown}>
        {RECIPE_GROUPS.map((g) => (
          <section key={g} className="ed-recipe-group">
            <h3>
              {RECIPE_GROUP_LABELS[g]}
              {RECIPE_GROUP_HINTS[g] && <span className="ed-recipe-group-hint"> — {RECIPE_GROUP_HINTS[g]}</span>}
            </h3>
            <div className="ed-recipe-grid">
              {SCREEN_RECIPES.filter((r) => r.group === g).map((r) => {
                const dup = r.uniquePerUnit && unit.screens.some((s) => s.type === r.type)
                return (
                  <button
                    key={r.key}
                    className={`ed-recipe${dup ? ' is-dup' : ''}${r.subtle ? ' ed-recipe-blank' : ''}`}
                    title={dup ? 'Ya existe una pantalla de este tipo en la unidad' : undefined}
                    onClick={() => create(r)}
                  >
                    <span className="ed-recipe-name"><span aria-hidden="true">{r.icon}</span> {r.label}</span>
                    <span className="ed-recipe-desc">{r.description}</span>
                  </button>
                )
              })}
            </div>
          </section>
        ))}
        <p className="ed-recipes-note">
          La receta solo preconfigura la pantalla: el tipo, el recurso, la actividad y si puntúa se pueden cambiar después.
        </p>
      </div>
    </SettingsWindow>
  )
}
