import { useCourseStore } from '../store/courseStore'
import type { ScreenInput } from '../schema/course.schema'
import { INTRO_CONTAINER_ID, OUTRO_CONTAINER_ID, moduleClosingContainerId } from '../schema/traverse'
import { RECIPE_GROUPS, RECIPE_GROUP_LABELS, RECIPE_GROUP_HINTS, RECIPE_GROUP_COLORS, SCREEN_RECIPES, type ScreenRecipe } from '../schema/screenRecipes'
import { screenTypeLabel, type CoverLevel } from '../schema/labels'
import { SettingsWindow } from './SettingsModal'
import { Icon } from './Icon'

/**
 * Selector de recetas de «+ Añadir pantalla»: tarjetas agrupadas por el papel
 * de la pantalla en la unidad (estructura / contenido / práctica / evaluación).
 * Las recetas «únicas por unidad» ya presentes se atenúan pero siguen siendo
 * pulsables (aviso blando, no bloqueo). Si llega `atIndex` (punto de inserción
 * elegido por el autor en el árbol), esa posición manda sobre la colocación
 * automática de la receta. `containerId` puede ser la introducción o el
 * cierre del curso (`INTRO_CONTAINER_ID`/`OUTRO_CONTAINER_ID`), una unidad o
 * un módulo (pantallas propias del módulo o de su cierre,
 * `moduleClosingContainerId`).
 */
export function AddScreenModal({ containerId, atIndex, onClose }: { containerId: string; atIndex?: number; onClose: () => void }) {
  const course = useCourseStore((s) => s.course)
  const addScreen = useCourseStore((s) => s.addScreen)

  const isIntro = containerId === INTRO_CONTAINER_ID
  const isOutro = containerId === OUTRO_CONTAINER_ID
  const closingModule = course.modules.find((m) => moduleClosingContainerId(m.id) === containerId)
  const unit = course.modules.flatMap((m) => m.units).find((u) => u.id === containerId)
  const plainModule = course.modules.find((m) => m.id === containerId)
  const container = isIntro
    ? { title: course.course.title, screens: course.intro_screens }
    : isOutro
    ? { title: course.course.title, screens: course.closing_screens }
    : closingModule
    ? { title: closingModule.title, screens: closingModule.closing_screens }
    : (unit ?? plainModule)
  if (!container) return null
  const isModule = !!(closingModule || plainModule)
  const scope: CoverLevel = (isIntro || isOutro) ? 'course' : isModule ? 'module' : 'unit'

  // Las tres recetas de portada comparten `type: 'cover'` (el diseño lo decide
  // el contenedor, no el tipo — ver arquitectura-runtime.md) pero cada una
  // vive en un `scope` distinto, así que ESE es el nivel real de su rótulo. El
  // resto de recetas conserva su `label` didáctico propio (varias comparten
  // `type`, p. ej. varias de tipo `content`, así que no se puede derivar de
  // `screenTypeLabel(r.type)` sin perder esa variedad).
  function recipeLabel(r: ScreenRecipe): string {
    if (r.type === 'cover' && r.scope) {
      return screenTypeLabel(r.type, { level: r.scope, module: course.module_label, unit: course.unit_label })
    }
    return r.label
  }

  function create(r: ScreenRecipe) {
    if (!container) return
    const preset: Partial<ScreenInput> = { type: r.type, ...(r.extras ? r.extras() : {}) }
    const title = typeof r.defaultTitle === 'function' ? r.defaultTitle(container) : r.defaultTitle
    if (title) preset.title = title
    addScreen(containerId, undefined, preset, atIndex ?? (r.place ? r.place(container.screens) : undefined))
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
              {SCREEN_RECIPES.filter((r) => r.group === g && (!r.scope || r.scope === scope)).map((r) => {
                const dup = r.uniquePerUnit && container.screens.some((s) => s.type === r.type)
                return (
                  <button
                    key={r.key}
                    className={`ed-recipe${dup ? ' is-dup' : ''}${r.subtle ? ' ed-recipe-blank' : ''}`}
                    title={dup ? 'Ya existe una pantalla de este tipo aquí' : undefined}
                    onClick={() => create(r)}
                  >
                    <span className="ed-recipe-ico" aria-hidden="true"
                      style={{ '--ico-c': RECIPE_GROUP_COLORS[r.group] } as React.CSSProperties}>
                      <Icon name={r.icon} size={18} /></span>
                    <span className="ed-recipe-text">
                      <span className="ed-recipe-name">{recipeLabel(r)}</span>
                      <span className="ed-recipe-desc">{r.description}</span>
                    </span>
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
