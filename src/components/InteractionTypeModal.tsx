import type { InteractionType } from '../schema/course.schema'
import { interactionTypeLabel } from '../schema/labels'
import {
  INTERACTION_GROUPS,
  INTERACTION_GROUP_LABELS,
  INTERACTION_GROUP_HINTS,
  INTERACTION_RECIPES,
  type InteractionRecipe,
} from '../schema/interactionRecipes'
import { SettingsWindow } from './SettingsModal'

/**
 * Selector visual del tipo de interacción: tarjetas con icono y descripción
 * «qué hace el alumno», agrupadas por grupo didáctico (mismo patrón que las
 * recetas de «+ Añadir pantalla»). Si la pantalla tiene tipos recomendados
 * (`SCREEN_TYPE_UI`), van en una sección propia arriba (y siguen apareciendo
 * en su grupo). La tarjeta del tipo actual queda marcada.
 */
export function InteractionTypeModal({
  current,
  recommended,
  onPick,
  onClose,
}: {
  current?: InteractionType
  recommended?: InteractionType[]
  onPick: (t: InteractionType) => void
  onClose: () => void
}) {
  function pick(t: InteractionType) {
    onClose()
    if (t !== current) onPick(t)
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

  const card = (r: InteractionRecipe) => (
    <button
      key={r.type}
      className={`ed-recipe${r.type === current ? ' is-current' : ''}`}
      title={r.type === current ? 'Tipo actual de la interacción' : undefined}
      onClick={() => pick(r.type)}
    >
      <span className="ed-recipe-name">
        <span aria-hidden="true">{r.icon}</span> {interactionTypeLabel(r.type)}
        {r.gradable && (
          <span className="ed-recipe-flag" title="Puede puntuar (evaluable)">
            <span aria-hidden="true"> ⭐</span>
          </span>
        )}
      </span>
      <span className="ed-recipe-desc">{r.description}</span>
    </button>
  )

  const recRecipes = (recommended ?? [])
    .map((t) => INTERACTION_RECIPES.find((r) => r.type === t))
    .filter((r): r is InteractionRecipe => !!r)

  return (
    <SettingsWindow title={current ? 'Cambiar el tipo de interacción' : 'Nueva interacción'} onClose={onClose} wide>
      <div className="ed-recipes" onKeyDown={onKeyDown}>
        {recRecipes.length > 0 && (
          <section className="ed-recipe-group">
            <h3>
              Recomendadas para esta pantalla
              <span className="ed-recipe-group-hint"> — Encajan con el tipo de pantalla actual.</span>
            </h3>
            <div className="ed-recipe-grid">{recRecipes.map(card)}</div>
          </section>
        )}
        {INTERACTION_GROUPS.map((g) => {
          const recipes = INTERACTION_RECIPES.filter((r) => r.group === g)
          if (recipes.length === 0) return null
          return (
            <section key={g} className="ed-recipe-group">
              <h3>
                {INTERACTION_GROUP_LABELS[g]}
                {INTERACTION_GROUP_HINTS[g] && (
                  <span className="ed-recipe-group-hint"> — {INTERACTION_GROUP_HINTS[g]}</span>
                )}
              </h3>
              <div className="ed-recipe-grid">{recipes.map(card)}</div>
            </section>
          )
        })}
        <p className="ed-recipes-note">
          ⭐ = puede puntuar. Al cambiar de tipo se conservan enunciado, feedback y objetivo; el
          contenido específico se migra entre tipos compatibles (y si algo se descartaría, se avisa antes).
        </p>
      </div>
    </SettingsWindow>
  )
}
