import { useRef } from 'react'
import { SettingsWindow } from './SettingsModal'
import { useCourseStore } from '../store/courseStore'
import { startTour } from './GuidedTour'

/**
 * Manual de usuario integrado (menú Ayuda → «Manual de usuario»).
 * El contenido vive aquí como JSX (misma fuente que la UI: si cambia la
 * interfaz, se actualiza este fichero). Las capturas se cargan de
 * `src/assets/help/*.png` por nombre: añadir/actualizar una captura = soltar
 * el png; si falta, la figura no se pinta (el manual sigue siendo válido).
 */
const SHOTS = import.meta.glob('../assets/help/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

function shotUrl(id: string): string | null {
  const key = Object.keys(SHOTS).find((p) => p.endsWith(`/${id}.png`))
  return key ? SHOTS[key] : null
}

function Shot({ id, caption }: { id: string; caption: string }) {
  const url = shotUrl(id)
  if (!url) return null
  return (
    <figure className="ed-help-shot">
      <img src={url} alt={caption} loading="lazy" />
      <figcaption>{caption}</figcaption>
    </figure>
  )
}

function Kbd({ k }: { k: string }) {
  return <kbd className="ed-help-kbd">{k}</kbd>
}

type Section = { id: string; title: string; body: React.ReactNode }

const SECTIONS: Section[] = [
  {
    id: 'que-es',
    title: 'Qué es SCORMEditor',
    body: (
      <>
        <p>
          SCORMEditor es un editor que funciona íntegramente en tu navegador y genera
          paquetes <strong>SCORM 1.2</strong> listos para subir a Moodle u otro LMS.
          No necesitas instalar nada ni depender de herramientas como Articulate o
          Captivate: el curso exportado es HTML autocontenido.
        </p>
        <p>Trabajarás con dos archivos distintos; conviene tener clara la diferencia:</p>
        <ul>
          <li>
            El <strong>proyecto</strong> (<code>.scormproj</code>) es tu documento de
            trabajo, como un <code>.docx</code>: lo guardas, lo reabres y lo sigues
            editando. Contiene el curso y sus imágenes/audios.
          </li>
          <li>
            El <strong>SCORM ZIP</strong> es el paquete final que se sube al LMS. Se
            genera con «Archivo → Exportar SCORM ZIP» y no se reedita: los cambios se
            hacen siempre sobre el proyecto y se vuelve a exportar.
          </li>
        </ul>
        <p>
          Todo se procesa y se guarda <strong>en tu equipo</strong>: el editor no sube
          tu contenido a ningún servidor.
        </p>
      </>
    ),
  },
  {
    id: 'primeros-pasos',
    title: 'Primeros pasos: crear, abrir y guardar',
    body: (
      <>
        <p>
          Todo el ciclo de vida del documento está en el menú <strong>Archivo</strong>{' '}
          de la barra superior:
        </p>
        <ul>
          <li>
            <strong>Nuevo (vacío)</strong> crea un curso mínimo desde cero;{' '}
            <strong>Nuevo (demo)</strong> carga un curso de ejemplo con todos los tipos
            de pantalla e interacción — muy útil para curiosear cómo está hecho cada uno.
          </li>
          <li>
            <strong>Abrir proyecto…</strong> admite un <code>.scormproj</code> y también
            un ZIP SCORM exportado antes (se reimporta como proyecto editable).
          </li>
          <li>
            <strong>Guardar</strong> (<Kbd k="Ctrl + S" />) escribe el{' '}
            <code>.scormproj</code>. En Chrome/Edge se reescribe el mismo archivo sin
            volver a preguntar; en Firefox/Safari se descarga.
          </li>
        </ul>
        <Shot id="toolbar" caption="Barra superior: título del curso, indicador de guardado, deshacer/rehacer y los menús Archivo, Ajustes y Ayuda." />
        <p>
          Junto al título verás el <strong>indicador de estado</strong>: «Sin guardar»
          (punto) o «Guardado» (✓). Es además un botón: pulsarlo guarda. Aunque cierres
          sin guardar, el trabajo se conserva automáticamente en el navegador y se
          restaura al volver a abrir la página — es una red de seguridad, no un
          sustituto del guardado: el proyecto de verdad es siempre el archivo{' '}
          <code>.scormproj</code>.
        </p>
        <p>
          <strong>Deshacer/Rehacer</strong> (<Kbd k="Ctrl + Z" /> / <Kbd k="Ctrl + Y" />)
          cubren cualquier cambio de contenido, hasta 50 pasos.
        </p>
      </>
    ),
  },
  {
    id: 'arbol',
    title: 'La estructura del curso: el árbol',
    body: (
      <>
        <p>
          El panel izquierdo de la pestaña <strong>Editor</strong> es el árbol del
          curso: <strong>módulos → unidades → pantallas</strong>. La pantalla es la
          unidad básica de contenido (lo que el alumno ve de una vez).
        </p>
        <Shot id="arbol" caption="Árbol del curso: módulos, unidades y pantallas, con las secciones Evaluación y Materiales al final." />
        <ul>
          <li>
            <strong>Añadir</strong>: «+ Añadir pantalla…» al pie de cada unidad abre un
            selector de <em>recetas</em> (ver más abajo). «+ Añadir unidad» y «+ Añadir
            módulo» crean la estructura; el lápiz renombra el curso, los módulos y las
            unidades ahí mismo.
          </li>
          <li>
            <strong>Reordenar</strong>: las pantallas se arrastran por su asa; los
            módulos y unidades se mueven con las flechas ▲/▼ que aparecen junto a su
            nombre (una unidad puede cruzar al módulo de al lado desde el extremo).
          </li>
          <li>
            <strong>Duplicar y eliminar</strong> por pantalla (eliminar pide
            confirmación, y siempre puedes deshacer).
          </li>
          <li>
            El <strong>filtro</strong> de la parte superior busca por título o tipo de
            pantalla.
          </li>
          <li>
            Cada pantalla muestra el icono de su tipo, una marca si tiene interacción
            (⭐ si es evaluable) y un aviso rojo/ámbar si la validación detecta
            problemas.
          </li>
        </ul>
        <p>
          Al final del árbol hay dos secciones fijas: <strong>Evaluación</strong> (el
          test final del curso) y <strong>Materiales</strong> (glosario y
          bibliografía), que se editan como cualquier otra pantalla al seleccionarlas.
        </p>
        <p>
          El separador entre el árbol y el editor se <strong>arrastra</strong> para
          cambiar el ancho; con doble clic el árbol se pliega o despliega.
        </p>
        <h4>Recetas de pantalla</h4>
        <Shot id="recetas" caption="El selector de recetas agrupa las pantallas por lo que hace el alumno: Estructura, Contenido, Práctica, Evaluación y Otros." />
        <p>
          «+ Añadir pantalla…» no te pregunta por tipos técnicos: ofrece{' '}
          <strong>tarjetas agrupadas por lo que hace el alumno</strong> — Estructura
          (portada, objetivos, resumen…), Contenido (leer, ver, explorar), Práctica
          (hacer con corrección) y Evaluación (test de unidad). Cada tarjeta
          preconfigura el tipo de pantalla, el recurso y la interacción de golpe;
          después todo sigue siendo editable. Por defecto, las de Práctica{' '}
          <em>no puntúan</em> y las de Evaluación <em>sí</em>.
        </p>
      </>
    ),
  },
  {
    id: 'pantalla',
    title: 'Editar una pantalla',
    body: (
      <>
        <p>
          Al seleccionar una pantalla en el árbol, el panel central muestra su
          formulario. Lo primero es el <strong>título</strong> (se edita directamente
          en la cabecera) y el <strong>objetivo de aprendizaje</strong>: qué debería
          saber hacer el alumno tras esta pantalla. Los objetivos alimentan la matriz
          de trazabilidad del Informe, así que merece la pena rellenarlos.
        </p>
        <Shot id="editor" caption="Editor de pantalla: título en la cabecera, objetivo, texto principal y las secciones plegables de recurso visual, audio e interacción." />
        <h4>El texto y su formato</h4>
        <p>
          La caja «Texto para el estudiante» es el contenido principal. Escribes texto
          normal y aplicas formato con la barra: <strong>negrita</strong>,{' '}
          <em>cursiva</em>, títulos, listas, enlaces e imágenes en línea. El botón de{' '}
          <strong>bloques destacados</strong> inserta callouts (idea clave, ejemplo,
          advertencia…) con el color de la paleta del curso; también puedes crear
          bloques personalizados con tu propio icono, color y título, y guardarlos como
          preset para reutilizarlos.
        </p>
        <Shot id="texto" caption="El editor de texto muestra el resultado en vivo: callouts con su color real, negritas, listas… sin códigos visibles." />
        <p>
          Verás el resultado en vivo mientras escribes (los códigos de formato quedan
          ocultos). Para tocar un enlace, una imagen o un bloque, usa la barra
          contextual que aparece al situar el cursor encima.
        </p>
        <h4>Recurso visual</h4>
        <p>
          Cada pantalla puede llevar una <strong>imagen, vídeo (archivo o YouTube) o
          audio</strong> como recurso principal. Eliges la disposición respecto al
          texto (izquierda, derecha, arriba…) y la proporción, y ves una vista previa
          debajo. Los archivos se suben con su botón y quedan dentro del proyecto.
        </p>
        <h4>Audio de locución y transcripción</h4>
        <p>
          La sección de audio permite adjuntar una locución por pantalla y su
          transcripción (accesibilidad). Si configuras la narración por IA en{' '}
          <strong>Ajustes → Narración</strong>, puedes generar el audio de la pantalla
          — o de todo el curso en lote — a partir de la transcripción.
        </p>
        <h4>Avanzado</h4>
        <p>
          Plegado al final: el tipo de pantalla (por si quieres cambiarlo a mano), el{' '}
          <strong>tiempo mínimo</strong> en segundos antes de poder avanzar y si la
          pantalla es <strong>obligatoria</strong> para completar el curso.
        </p>
      </>
    ),
  },
  {
    id: 'interacciones',
    title: 'Interacciones',
    body: (
      <>
        <p>
          Una interacción es la actividad de la pantalla: desde un acordeón informativo
          hasta una pregunta evaluable. Se añade desde la sección{' '}
          <strong>Interacción</strong> del editor de pantalla; el selector muestra
          tarjetas agrupadas por lo que hace el alumno (presentar contenido, responder
          preguntas, manipular elementos, juegos, medios y avanzado), con una marca ⭐
          en las que pueden puntuar.
        </p>
        <Shot id="tipos-interaccion" caption="Selector de tipo de interacción: tarjetas con descripción, agrupadas por familia didáctica." />
        <ul>
          <li>
            <strong>Actividad</strong>: el enunciado, las instrucciones y la
            configuración propia de cada tipo (opciones, parejas, tarjetas, huecos,
            zonas de la imagen…). Las listas se reordenan, duplican y pliegan desde el
            propio editor.
          </li>
          <li>
            <strong>Evaluación</strong>: si el tipo tiene corrección, puedes marcarla
            como <em>evaluable</em>, darle puntos e intentos, y vincularla a un
            objetivo de aprendizaje. Que las actividades cuenten para la nota depende
            además del origen de la nota en Ajustes (ver «Ajustes del curso»).
          </li>
          <li>
            <strong>Feedback</strong>: mensajes de acierto/error y una explicación
            pedagógica opcional; varios tipos admiten además feedback por opción.
          </li>
        </ul>
        <p>
          «Cambiar tipo…» convierte la interacción en otra conservando lo que sea
          compatible (por ejemplo, una pregunta de opción única en verdadero/falso); si
          algo se fuera a perder, te avisa antes.
        </p>
      </>
    ),
  },
  {
    id: 'evaluacion-materiales',
    title: 'Test final, glosario y bibliografía',
    body: (
      <>
        <p>
          El <strong>test final</strong> se edita desde el nodo «Evaluación → Test
          final» del árbol: preguntas con sus opciones (marca la correcta con el
          círculo), feedback y objetivo vinculado por pregunta. Puedes elegir que se
          muestre una pregunta por pantalla y ver el recuento vivo de preguntas y
          puntos.
        </p>
        <Shot id="test-final" caption="Editor del test final: preguntas plegables con opciones, correcta y feedback." />
        <p>
          En <strong>Materiales</strong> viven el <strong>glosario</strong>{' '}
          (término + definición, con ordenación alfabética A→Z) y la{' '}
          <strong>bibliografía</strong> (cita + enlace opcional). El alumno los abre en
          cualquier momento desde la barra del curso; sus títulos («Glosario»,
          «Recursos») se pueden personalizar en la cabecera del editor.
        </p>
      </>
    ),
  },
  {
    id: 'ajustes',
    title: 'Ajustes del curso',
    body: (
      <>
        <p>El menú <strong>⚙ Ajustes</strong> agrupa cuatro ventanas:</p>
        <ul>
          <li>
            <strong>Curso (Finalización)</strong>: las reglas SCORM — nota mínima para
            aprobar, <strong>origen de la nota</strong> (solo el test final, solo las
            actividades evaluables, o mixto con el peso que decidas), porcentaje de
            pantallas que hay que ver, si las interacciones obligatorias bloquean el
            avance, intentos y tipo de navegación (libre, secuencial o mixta). Incluye
            una herramienta para aplicar un tiempo mínimo a todas las pantallas de
            golpe.
          </li>
          <li>
            <strong>Objetivos de aprendizaje</strong>: reúne todos los objetivos del
            curso, dónde se declaran y qué evaluaciones los cubren; permite
            renombrarlos o quitarlos en todos los usos a la vez.
          </li>
          <li>
            <strong>Interfaz (Apariencia)</strong>: la marca y el color principal del
            curso que verá el alumno, y el nivel de animaciones.
          </li>
          <li>
            <strong>Narración (Audio IA)</strong>: proveedor de voz, clave de API (se
            guarda solo en tu navegador) y generación de audio en lote para todas las
            pantallas con transcripción.
          </li>
        </ul>
        <Shot id="ajustes" caption="Ajustes del curso: nota mínima, origen de la nota, navegación y reglas de finalización." />
      </>
    ),
  },
  {
    id: 'vista',
    title: 'Vista estudiante',
    body: (
      <>
        <p>
          La pestaña <strong>Vista estudiante</strong> muestra el curso{' '}
          <strong>exactamente como se exportará</strong>: es la misma carcasa que va
          dentro del ZIP, no una simulación. Se abre en la pantalla que tuvieras
          seleccionada en el editor, y al navegar por ella el editor te sigue (al
          volver a la pestaña Editor estarás en la pantalla donde te quedaste).
        </p>
        <Shot id="vista" caption="Vista estudiante: la carcasa real del SCORM, con la píldora de modo autor en la esquina." />
        <p>
          La píldora <strong>«Modo autor»</strong> de la esquina superior derecha te
          deja alternar entre navegar sin restricciones (modo autor activado) y probar
          el comportamiento real que tendrá el alumno: navegación bloqueada, tiempo
          mínimo por pantalla e interacciones obligatorias. El SCORM exportado nunca
          incluye este conmutador.
        </p>
      </>
    ),
  },
  {
    id: 'validacion',
    title: 'Validación e informe',
    body: (
      <>
        <p>
          La pestaña <strong>Validación</strong> revisa el curso entero:{' '}
          <strong>errores</strong> (cosas que romperían la experiencia, como una
          pregunta sin opción correcta) y <strong>avisos</strong> (mejorables). Cada
          aviso enlaza con la pantalla o el ajuste correspondiente. El recuento aparece
          también como badge en la propia pestaña, y el árbol marca las pantallas
          afectadas.
        </p>
        <Shot id="validacion" caption="Panel de validación: errores y avisos con enlace directo a la pantalla afectada." />
        <p>
          La pestaña <strong>Informe</strong> genera un resumen del curso: recuentos de
          pantallas e interacciones, reglas de evaluación y la{' '}
          <strong>matriz de trazabilidad</strong> objetivos ↔ evaluaciones (qué
          objetivo se evalúa dónde, y cuáles quedan sin evaluar). Se puede exportar
          para revisión.
        </p>
      </>
    ),
  },
  {
    id: 'exportar',
    title: 'Exportar y subir a Moodle',
    body: (
      <>
        <p>
          Cuando el curso esté listo (idealmente sin errores de validación):{' '}
          <strong>Archivo → Exportar SCORM ZIP</strong>. El ZIP resultante es el
          paquete completo.
        </p>
        <p>En Moodle:</p>
        <ol>
          <li>Activa la edición del curso y añade una actividad <strong>«Paquete SCORM»</strong>.</li>
          <li>Sube el ZIP exportado (no hace falta descomprimirlo).</li>
          <li>
            En los ajustes de la actividad, la calificación y los intentos ya vienen
            definidos por el paquete (nota de superación incluida); revisa que el
            método de calificación sea por puntuación.
          </li>
        </ol>
        <p>
          Si más adelante cambias algo, edita el <strong>proyecto</strong> y vuelve a
          exportar y subir el ZIP: el ZIP no se edita nunca directamente.
        </p>
      </>
    ),
  },
  {
    id: 'atajos',
    title: 'Atajos y trucos',
    body: (
      <>
        <ul>
          <li><Kbd k="Ctrl + S" /> guardar · <Kbd k="Ctrl + Z" /> deshacer · <Kbd k="Ctrl + Y" /> rehacer</li>
          <li><Kbd k="Alt + ↓" /> / <Kbd k="Alt + ↑" /> pantalla siguiente / anterior</li>
          <li><Kbd k="F1" /> o <Kbd k="Ctrl + /" /> ventana de atajos de teclado</li>
          <li><Kbd k="Esc" /> cierra la ventana o el menú abiertos</li>
        </ul>
        <p>
          La lista completa está en <strong>Ayuda → Atajos de teclado</strong>. Y si es
          tu primera vez, el <strong>tour guiado</strong> (Ayuda → Tour guiado) te
          enseña la interfaz en un minuto.
        </p>
      </>
    ),
  },
]

/** Ventana «Manual de usuario» (menú Ayuda). */
export function HelpModal({ onClose }: { onClose: () => void }) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const setSettingsModal = useCourseStore((s) => s.setSettingsModal)

  function goTo(id: string) {
    bodyRef.current?.querySelector(`#help-${id}`)?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }

  return (
    <SettingsWindow title="Manual de usuario" onClose={onClose} wide>
      <div className="ed-help">
        <nav className="ed-help-nav" aria-label="Índice del manual">
          {SECTIONS.map((s, i) => (
            <button key={s.id} onClick={() => goTo(s.id)}>
              <span className="ed-help-num">{i + 1}</span> {s.title}
            </button>
          ))}
          <button
            className="ed-help-tourbtn"
            onClick={() => { setSettingsModal(null); startTour() }}
            title="Recorrido interactivo por la interfaz"
          >
            ▸ Tour guiado
          </button>
        </nav>
        <div className="ed-help-body" ref={bodyRef}>
          {SECTIONS.map((s, i) => (
            <section key={s.id} id={`help-${s.id}`} className="ed-help-section">
              <h3>{i + 1}. {s.title}</h3>
              {s.body}
            </section>
          ))}
        </div>
      </div>
    </SettingsWindow>
  )
}
