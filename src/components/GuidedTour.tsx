import { useEffect, useLayoutEffect, useState } from 'react'
import { create } from 'zustand'
import { useCourseStore } from '../store/courseStore'
import type { Tab } from '../store/courseStore'
import { Icon } from './Icon'

/**
 * Tour guiado por la interfaz (menú Ayuda → «Tour guiado»), hecho a medida y
 * sin dependencias: un overlay resalta zonas reales de la UI (marcadas con
 * atributos `data-tour`) y una tarjeta explica cada parada. Si el elemento de
 * una parada no está en pantalla (p. ej. el árbol plegado), la parada se salta.
 * Al terminar (o salir) se marca `localStorage['ed:tourDone']` para que el
 * aviso de bienvenida del primer arranque no vuelva a aparecer.
 */

type TourStep = {
  /** Selector del elemento a resaltar; sin target = tarjeta centrada. */
  target?: string
  /** Pestaña que debe estar activa para que exista el target. */
  tab?: Tab
  title: string
  body: string
}

const STEPS: TourStep[] = [
  {
    title: 'Bienvenida a SCORMEditor',
    body: 'Este tour recorre la interfaz en un minuto. Muévete con los botones o las flechas del teclado, y sal cuando quieras con Esc.',
  },
  {
    target: '[data-tour="course-name"]',
    title: 'El título del curso',
    body: 'Este es el título principal del SCORM. Pasa el ratón y pulsa el lápiz para renombrarlo.',
  },
  {
    target: '[data-tour="docstate"]',
    title: 'El estado de guardado',
    body: 'Este indicador dice dónde vive tu proyecto: un archivo .scormproj en tu equipo, un documento en la nube, o —si aún no elegiste ninguno— solo este navegador (sin portabilidad). Pulsarlo (o Ctrl+S) guarda en el destino que corresponda.',
  },
  {
    target: '[data-tour="cloud-chip"]',
    title: 'Trabajo en equipo (nube)',
    body: 'Si tu organización tiene la nube activada, aquí inicias sesión y accedes a los proyectos compartidos: carpetas con permisos por profesor, un bloqueo de edición para no pisaros el trabajo (con «Tomar el control» si hace falta) y sincronización automática al guardar. Sin nube configurada, este botón no aparece y todo sigue siendo 100% local.',
  },
  {
    target: '[data-tour="file-menu"]',
    title: 'Menú Archivo',
    body: 'Abrir y guardar el proyecto, empezar uno nuevo (vacío o demo) y, cuando el curso esté listo, «Exportar SCORM ZIP»: el paquete final que se sube a Moodle. También puedes exportar a eXeLearning (.elpx) si prefieres seguir editando allí.',
  },
  {
    target: '[data-tour="tabs"]',
    title: 'Las cuatro pestañas',
    body: 'Editor (donde se construye el curso), Vista estudiante (el resultado real), Validación (errores y avisos) e Informe (resumen y trazabilidad de objetivos).',
  },
  {
    target: '[data-tour="tree"]',
    tab: 'editor',
    title: 'El árbol del curso',
    body: 'Módulos → unidades → pantallas. Arrastra las pantallas para reordenarlas, usa «+ Añadir pantalla…» para crear (con recetas ya preparadas) y el filtro para buscar. Al final están el test final y los materiales (glosario y bibliografía).',
  },
  {
    target: '[data-tour="content"]',
    tab: 'editor',
    title: 'El editor de pantalla',
    body: 'Aquí se edita la pantalla seleccionada: título, objetivo de aprendizaje, el texto con formato (negritas, listas, bloques destacados…), el recurso visual, el audio y la interacción.',
  },
  {
    target: '[data-tour="content"]',
    tab: 'editor',
    title: 'La interacción de la pantalla',
    body: 'Cada pantalla puede llevar una interacción: desde un acordeón informativo hasta un crucigrama o una pregunta evaluable. Hay 23 tipos agrupados por lo que hace el alumno; el manual las describe todas una a una.',
  },
  {
    target: '[data-tour="settings-menu"]',
    title: 'Menú Ajustes',
    body: 'Las reglas del curso: nota mínima y origen de la nota, finalización y navegación; el gestor de objetivos; la apariencia (marca, color, animaciones) y la narración por voz (IA): transcripción, audio por pantalla o por ítem, y generación masiva.',
  },
  {
    target: '[data-tour="content"]',
    tab: 'preview',
    title: 'Vista estudiante',
    body: 'El curso exactamente como se exportará: es la misma carcasa que va en el ZIP. La píldora «Modo autor» de la esquina permite alternar entre navegar libremente y probar las restricciones reales (navegación, tiempos, obligatorias).',
  },
  {
    target: '[data-tour="content"]',
    tab: 'validation',
    title: 'Validación',
    body: 'Revisa el curso entero: errores (rojo) y avisos (ámbar), cada uno con enlace a la pantalla o al ajuste afectado. La pestaña Informe complementa esto con recuentos y la matriz objetivos ↔ evaluaciones.',
  },
  {
    target: '[data-tour="help-menu"]',
    title: 'Menú Ayuda',
    body: 'Desde aquí puedes abrir el manual de usuario completo, repetir este tour y consultar los atajos de teclado (también con F1).',
  },
  {
    title: '¡Listo!',
    body: 'Eso es lo esencial. Para el detalle de cada parte (formato del texto, interacciones, exportar a Moodle…) tienes el manual de usuario en el menú Ayuda.',
  },
]

const useTourStore = create<{ step: number | null }>(() => ({ step: null }))

export function startTour() {
  useCourseStore.getState().setActiveTab('editor')
  useTourStore.setState({ step: 0 })
}

function stopTour() {
  useTourStore.setState({ step: null })
  localStorage.setItem('ed:tourDone', '1')
}

const CARD_W = 360

export function GuidedTour() {
  const step = useTourStore((s) => s.step)
  const [rect, setRect] = useState<DOMRect | null>(null)

  // Mide el target de la parada actual (tras activar su pestaña). Si el
  // selector no encuentra nada, la parada se salta en la misma dirección.
  useLayoutEffect(() => {
    if (step === null) return
    const def = STEPS[step]
    if (def.tab) useCourseStore.getState().setActiveTab(def.tab)
    let raf = 0
    let tries = 0
    function measure() {
      if (!def.target) { setRect(null); return }
      const el = document.querySelector(def.target)
      if (el) {
        setRect(el.getBoundingClientRect())
      } else if (tries++ < 10) {
        raf = requestAnimationFrame(measure) // la pestaña aún se está montando
      } else {
        // Target inexistente (p. ej. árbol plegado): saltar la parada.
        useTourStore.setState({ step: step! + 1 < STEPS.length ? step! + 1 : null })
        if (step! + 1 >= STEPS.length) localStorage.setItem('ed:tourDone', '1')
      }
    }
    raf = requestAnimationFrame(measure)
    const onResize = () => measure()
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [step])

  useEffect(() => {
    if (step === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') stopTour()
      else if (e.key === 'ArrowRight' || e.key === 'Enter') next()
      else if (e.key === 'ArrowLeft') prev()
      else return
      e.preventDefault()
      e.stopPropagation()
    }
    // Captura para adelantarse a los atajos globales del editor.
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  if (step === null) return null
  const def = STEPS[step]
  const last = step === STEPS.length - 1

  function next() {
    if (step === null) return
    if (step + 1 < STEPS.length) useTourStore.setState({ step: step + 1 })
    else stopTour()
  }
  function prev() {
    if (step !== null && step > 0) useTourStore.setState({ step: step - 1 })
  }

  // Posición de la tarjeta: debajo del target si cabe, si no encima; centrada
  // si la parada no tiene target.
  const hasTarget = !!def.target && !!rect
  let cardStyle: React.CSSProperties
  if (hasTarget && rect) {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const left = Math.min(Math.max(rect.left, 12), Math.max(12, vw - CARD_W - 12))
    const below = rect.bottom + 16
    const style: React.CSSProperties = { left, width: CARD_W }
    if (below + 220 < vh) style.top = below
    else if (rect.top - 236 > 0) style.bottom = vh - rect.top + 16
    else style.top = Math.max(12, vh / 2 - 110)
    cardStyle = style
  } else {
    cardStyle = { left: '50%', top: '38%', transform: 'translate(-50%, -50%)', width: CARD_W }
  }

  // Atenuado: un único velo a pantalla completa (como el fondo de los
  // modales) con un «agujero» sobre el elemento resaltado, recortado con
  // clip-path path(evenodd). Así el resto de la UI queda bloqueada y oscura
  // y el target se ve intacto.
  const vw = window.innerWidth
  const vh = window.innerHeight
  let veilClip: string | undefined
  let hl: React.ReactNode = null
  if (hasTarget && rect) {
    const x = rect.left - 6
    const y = rect.top - 6
    const w = rect.width + 12
    const h = rect.height + 12
    veilClip = `path(evenodd, "M0 0H${vw}V${vh}H0z M${x} ${y}h${w}v${h}h${-w}z")`
    hl = <div className="ed-tour-hl" style={{ left: x, top: y, width: w, height: h }} />
  }

  return (
    <>
      <div className="ed-tour-veil" style={veilClip ? { clipPath: veilClip } : undefined} />
      {hl}
      <div className="ed-tour-card" style={cardStyle} role="dialog" aria-modal="true"
        aria-label={`Tour guiado: ${def.title}`}>
        <header>
          <strong>{def.title}</strong>
          <button className="ed-icobtn" onClick={stopTour} aria-label="Salir del tour" title="Salir del tour (Esc)">
            <Icon name="x" size={14} />
          </button>
        </header>
        <p>{def.body}</p>
        <footer>
          <span className="ed-tour-count">{step + 1} / {STEPS.length}</span>
          <span className="ed-tour-btns">
            {step > 0 && <button onClick={prev}>Anterior</button>}
            <button className="ed-tour-next" onClick={next} autoFocus>
              {last ? 'Terminar' : 'Siguiente'}
            </button>
          </span>
        </footer>
      </div>
    </>
  )
}

/**
 * Aviso de bienvenida del primer arranque: tarjeta discreta abajo a la derecha
 * que ofrece el tour y el manual. No vuelve a aparecer una vez descartada (o
 * hecho el tour).
 */
export function WelcomeTip() {
  const [visible, setVisible] = useState(
    () => !localStorage.getItem('ed:tourDone') && !localStorage.getItem('ed:welcomeDismissed'),
  )
  const tourActive = useTourStore((s) => s.step !== null)
  const setSettingsModal = useCourseStore((s) => s.setSettingsModal)
  if (!visible || tourActive) return null

  function dismiss() {
    localStorage.setItem('ed:welcomeDismissed', '1')
    setVisible(false)
  }

  return (
    <div className="ed-welcome" role="note">
      <button className="ed-icobtn ed-welcome-x" onClick={dismiss} aria-label="Cerrar"><Icon name="x" size={14} /></button>
      <strong>¿Primera vez por aquí?</strong>
      <p>El tour guiado te enseña la interfaz en un minuto; el manual explica cada parte con detalle.</p>
      <div className="ed-welcome-actions">
        <button className="ed-tour-next" onClick={() => { dismiss(); startTour() }}>Hacer el tour</button>
        <button onClick={() => { dismiss(); setSettingsModal('help') }}>Abrir el manual</button>
      </div>
    </div>
  )
}
