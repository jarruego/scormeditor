# Navegación de la carcasa (topbar, menú, barra inferior)

> Doc interno de SCORMEditor. Índice en `CLAUDE.md`. Complementa `arquitectura-runtime.md`
> (render de contenido, animaciones, manifiesto) con el **chrome de navegación** propio:
> cabecera, menú lateral y barra inferior del runtime (`src/runtime/`).

## Cabecera (topbar)
- **Cabecera minimal**: la topbar solo lleva tres zonas: `#me-toggle-menu` (☰) a la
  izquierda, `.me-topbar-title` (marca opcional + título del curso) centrada
  (`flex:1 1 auto; text-align:center`, con ellipsis), y `.me-topbar-right` (Imprimir,
  Ayuda, Cerrar) a la derecha. El resto de herramientas que antes vivían en la topbar
  se repartió: Glosario/Recursos al final del menú lateral, y Transcripción + el
  reproductor de audio + Pantalla completa a la barra inferior (ver más abajo). Iconos
  vía `icons.js`: `printer` Imprimir, `help-circle` Ayuda, `log-out` Cerrar, `menu` ☰.
- **Cerrar el curso**: `#me-btn-close` (topbar, icono `log-out`) llama a `requestExit()`
  (app.js) — la misma lógica que el botón «Salir del curso» de la pantalla de
  Resultados: si `evaluateCompletion()` da `incomplete`, pide confirmación
  (`confirmExitIncomplete`, progreso guardado, se puede seguir luego); si no, cierra la
  sesión SCORM directamente (`exitCourse`). Disponible en cualquier pantalla, no solo
  en Resultados.

## Menú lateral
- **Bloques diferenciados**: cada tema/unidad (`.me-menu-unit`) lleva un fondo sutil
  (`color-mix` sobre `--me-bg`) y esquinas redondeadas — minimalista, sin bordes duros
  ni sombras. Materiales (`.me-menu-materials`) y Evaluación (`.me-menu-final`, ver
  abajo) comparten el mismo tratamiento, así todos los "bloques" del índice se leen con
  el mismo lenguaje visual. El propio módulo no lleva tarjeta (su título ya destaca en
  mayúsculas); si hay más de uno, un filete fino los separa (`.me-menu-module +
  .me-menu-module`).
- **Materiales en el menú lateral**: `buildMenu()` (app.js) añade, tras los
  módulos/unidades y las pantallas sintéticas, un bloque `.me-menu-materials` (filete
  superior, además del fondo de bloque) con dos entradas `.me-menu-material` — «📖
  Glosario» y «🔗 Recursos» (icono + rótulo, `esc(glossaryTitle())`/
  `esc(bibliographyTitle())`) — que abren el modal correspondiente
  (`data-modal="glossary|resources"`) en vez de navegar. Clase propia (no
  `.me-menu-link`): así `refreshMenuChecks()` no las confunde con pantallas (no tienen
  `data-idx` ni cuentan para el progreso). `glossary_title`/`bibliography_title` de
  `course.json` (defaults «Glosario» / «Recursos y bibliografía») rotulan estas
  entradas directamente al generarlas; se editan en la cabecera de `MaterialsEditor`
  (ver `editor-pantallas.md`).
- **Evaluación (Test final/Resultados)**: `buildMenu()` agrupa las pantallas sintéticas
  finales bajo un bloque `.me-menu-final` con rótulo propio («EVALUACIÓN», mismo estilo
  que `.me-menu-mtitle`) — antes salían sueltas, una por `.me-menu-unit`, sin
  distinguirse visualmente del resto del índice ni agruparse entre sí.
- **Pestaña de plegado del índice**: asa gris plana (`#me-menu-tab`, `.me-menu-tab`)
  centrada verticalmente en el borde derecho del menú, con flecha ◂; plegado el menú,
  asoma pegada al lateral izquierdo con ▸. Es un segundo control del mismo `toggleMenu()`
  que el ☰ de la topbar; `reflectMenuUI()` (app.js) sincroniza `aria-expanded` de ambos y
  el sentido de la flecha. Solo escritorio (en móvil el slide-over se maneja con el ☰ y
  la pestaña se oculta); tampoco sale en impresión.

## Barra inferior
La estructura (`index.html`): `.me-toolbar` → `.me-toolbar-center` (960px, centrado) →
dos grupos, `.me-toolbar-audio` (Transcripción, reproductor de audio, Pantalla completa
al final) y `.me-toolbar-nav` (Anterior, progreso, Siguiente).

- **Centrado clásico, no grid**: `.me-toolbar` es `display:flex; justify-content:center`
  con un único hijo flexible (`.me-toolbar-center`, `width:100%; max-width:960px`) — el
  centrado de un solo elemento dentro de un padre `justify-content:center` es exacto
  pase lo que pase, sin necesitar columnas laterales de contrapeso. Esto **solo
  funciona** porque `#me-btn-fullscreen` sale del flujo normal vía `position:absolute`
  (ver más abajo): si compitiera por espacio como un hermano más, habría que volver a
  columnas simétricas para no desviar el centrado (ver la lección de CSS más abajo).
  Verificado por píxeles: `.me-toolbar-center` tiene el mismo `left`/`right`/`width`
  que `.me-screen`.
- **`justify-content:space-between` dentro de `.me-toolbar-center`** (no `center`): el
  espacio sobrante se autoestira en el **hueco central**, entre `.me-toolbar-audio` y
  `.me-toolbar-nav`, que quedan pegados a los márgenes de la diapositiva en vez de
  apelotonados en medio con aire sobrante a los lados.
- **Pantalla completa** (`#me-btn-fullscreen`): vive al final de `.me-toolbar-audio` en
  el HTML. En **escritorio** sale del flujo (`position:absolute; top:50%; right:.9rem`,
  ancla en `.me-toolbar`) y queda pegada al borde derecho de toda la barra, sin competir
  por espacio con el centrado. En **móvil** vuelve al flujo normal (`position:static`)
  pero con `margin-left:auto`, así igualmente queda pegada al extremo derecho de la
  fila de audio (que en móvil se estira de lado a lado) en vez de quedar centrada junto
  con el resto de controles de audio. Fullscreen API sobre `documentElement` con
  fallback `webkit`; icono `maximize`/`minimize` y title/aria-label se sincronizan en
  `fullscreenchange` (cubre también la salida con Esc). Arranca `hidden` y solo se
  muestra si el entorno lo permite (`fullscreenEnabled`): en un iframe de LMS sin
  `allowfullscreen` o en iPhone no aparece. El iframe de la Vista estudiante lleva
  `allowFullScreen` (`StudentPreview.tsx`) para que funcione también en la
  previsualización.
- **Reproductor de la narración de pantalla** (`#me-audio-player`, dentro de
  `.me-toolbar-audio`): play/pause, progreso + tiempo, sonido (mute) + volumen y
  velocidad. Se oculta entero si la pantalla no tiene `audio_src`. El botón de sonido
  activo usa turquesa (`--me-accent`, no `--me-primary`) para distinguirse de
  Anterior/Siguiente (azules); el seek y el volumen (`<input type=range>`) van en gris
  neutro (`accent-color: var(--me-muted)`) y más finos, como controles secundarios que
  no compiten visualmente con el turquesa de la barra de progreso ni el azul de la
  navegación. El selector de velocidad es compacto y ligero (fondo transparente, borde
  tenue, texto `--me-muted`). Detalle de comportamiento (play/pause robusto ante audio
  roto, seek, volumen persistido) en `tts-narracion.md` → «Reproductor de la narración
  (barra inferior)».
- **Anterior/Siguiente**: `.me-btn.me-nav-btn` (doble clase, no solo `.me-nav-btn`: más
  especificidad que `.me-btn` para que su padding gane pase lo que pase con el orden de
  las reglas) — menos padding que un `.me-btn` normal e icono de flecha propio
  (`arrow-left`/`arrow-right` de `icons.js`) en vez del triángulo tipográfico `◂`/`▸`.
  `refreshNavState()` (app.js) solo toca el texto del botón Siguiente («Siguiente» ↔
  «Fin» según la pantalla) a través de `.me-nav-btn-label` — un `textContent` directo
  sobre el botón borraría el icono en cada navegación (bug real detectado y corregido).
- **Barra de progreso**: `min-width: 240px` en escritorio (hay margen de sobra en el
  hueco central autoestirado — antes 100px, se veía innecesariamente estrecha); el
  media query de móvil la recorta a 90px.
- **En móvil** (≤1024px, ver punto de corte más abajo): `.me-toolbar-center` pasa a
  `flex-direction: column-reverse` — como `.me-toolbar-audio` va primero en el HTML y
  `.me-toolbar-nav` segundo, el reverse pone **navegación arriba, audio abajo**. Ambos
  grupos se estiran de lado a lado (`align-self:stretch`): la navegación para que
  `.me-progress` (ya `flex:1`) aproveche el máximo ancho, y el de audio para que
  Pantalla completa tenga sitio donde anclarse a la derecha del todo sin quedar
  centrada con el resto (ver arriba). En pantallas muy estrechas (`.me-nav-btn-label`)
  se ocultan las etiquetas de texto de Anterior/Siguiente y quedan solo los iconos (con
  `aria-label` fijo como nombre accesible), y el reproductor de audio pierde
  tiempo/volumen (icono + play/pause + seek + velocidad bastan).

⚠ **Lección de CSS aprendida en este trabajo** (aplica a cualquier grid/flex anidado,
aunque el diseño final ya no dependa de ello): un `1fr` suelto en `grid-template-columns`
equivale a `minmax(auto,1fr)` — su mínimo es el *min-content* del contenido, no `0`. Si
ese contenido no cabe, el grid no encoge y es el **contenedor** el que se desborda. Y el
problema se repite en cascada: cualquier elemento que sea a la vez grid/flex **item** (de
un padre) y grid/flex **container** (de sus hijos) trae su propio `min-width:auto` por
defecto, que ignora el `minmax(0,…)` que hayas puesto en el nivel de abajo. Por eso
`.me-toolbar` y `.me-topbar` llevan `min-width: 0` explícito **como filas del grid de
`#me-app`** — sin eso, un título de curso largo desbordaba toda la carcasa en móvil
aunque `.me-topbar-title` ya tuviera su propio `min-width:0` un nivel más abajo.

## Punto de corte de la versión móvil
`@media (max-width: 1024px)` (sección «Responsive» de `styles.css`) gobierna el cambio
de layout completo: menú lateral pasa a panel deslizante (slide-over) sobre el
contenido, topbar se compacta, y la barra inferior apila navegación/audio (ver arriba).
Es un único punto de corte para todo el chrome de navegación — no confundir con los
`@media (max-width: 640px)` sueltos de widgets concretos (drag&drop, buscaminas de
palabras, navegación de preguntas…), que son ajustes de detalle independientes de este.
