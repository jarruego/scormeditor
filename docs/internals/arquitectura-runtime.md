# Arquitectura y runtime (carcasa)

> Doc interno de SCORMEditor. Índice en `CLAUDE.md`. Invariantes (una sola fuente,
> anti-XSS) viven en `CLAUDE.md`; aquí va el **detalle** del render de la carcasa.

## Dos mundos
- **Editor** (`src/` salvo `src/runtime/`): SPA React+TS+Vite+Zustand+Zod.
- **Carcasa/Runtime** (`src/runtime/`): HTML/CSS/JS **plano, sin framework ni build**,
  se copia *verbatim* dentro del ZIP SCORM. El editor la carga con
  `import.meta.glob('../runtime/**', { query:'?raw' })` (`src/scorm/runtimeAssets.ts`);
  Vista estudiante (`buildPreview.ts`) y export ZIP consumen los mismos strings.

## Texto enriquecido (markdown ligero)
Editor: `src/components/RichTextArea.tsx` (barra de botones, sin dependencias).
Render: `mdToHtml`/`blocksToHtml` en `src/runtime/assets/js/renderer.js`.

Sintaxis soportada:
- `## ` / `### ` encabezados (H1 reservado al título de pantalla). Además, una línea que
  es **solo negrita** (`**Título**`, con `:` opcional) se renderiza como `<h3>` (para
  títulos que el origen trae en negrita en vez de con `##`).
- `**negrita**`, `*cursiva*`, `[texto](url)` (http(s) o mailto). Los enlaces se abren en
  otra pestaña (`target="_blank" rel="noopener noreferrer"`, ver `rich()`).
- `- ` listas con viñetas (también acepta `*`, `•`, `·`, `–`, `—` al inicio de línea,
  porque los PDF/DOC suelen usarlos); `1. ` / `1) ` listas numeradas (honra el número
  escrito con `<ol start>`/`<li value>` cuando no van consecutivos).
- Bloques destacados (callouts): `::: tipo` … `:::`
- Bloque personalizado: `::: custom | #color | icono | título` … `:::`

Ninguna plantilla de `renderer.js` muestra `objective` como banner — tampoco la pantalla
`objectives` (jul 2026): su `student_text` ya presenta los objetivos al alumno y pintarlo
duplicaba el contenido. `objective` queda como **metadato de trazabilidad** (el validador
sigue exigiéndolo salvo en `cover`/`summary`).

### Bloques destacados y paleta corporativa
Los tipos viven en `CALLOUTS` (`renderer.js`) y su color en
`src/runtime/assets/css/styles.css` (`.me-callout-*`). Colores alineados con la
**paleta oficial de teleformación** (tabla "Tabla de Elementos Clave para Formación
Online.odt" en Google Drive; ver memoria `paleta-teleformacion`):

| Color | Hex | Bloques |
|---|---|---|
| Turquesa | `#6DC3C0` | 💡 Consejo (`tip`), 🧠 ¿Sabías que…? (`fact`), 📌 Importante (`important`) |
| Naranja | `#F4C910` | ⚠️ Atención (`warn`), 💭 Reflexiona (`reflect`), 🧪 Caso práctico (`case`) |
| Violeta | `#7787BF` | ℹ️ Información (`info`) |
| Rosa | `#F4D6D2` | (color por defecto del bloque personalizado) |

Decisiones: se adoptó la paleta de 4 colores (varios bloques **comparten color**, como
en la tabla original); **no** se añadieron como bloques fijos todos los elementos
(Tablas, Actividad, Referencias, Glosario, Debate, Tests): quedan cubiertos por el
bloque personalizado.

### Bloque personalizado
Botón **✚ Personalizado** en la barra abre un panel con **icono, título y color**
(el icono va a la izquierda del título). Acciones: **Cancelar** (cierra y limpia el
borrador), **Insertar** (lo mete una vez) y **Guardar y usar** (lo persiste como **preset
reutilizable**; deshabilitado si no hay ni título ni icono, porque un preset necesita algo
que lo etiquete).

- **Icono opcional, elegible con un clic**: no se pega texto; hay un botón tamaño-icono
  (muestra el icono o `＋`) que abre una **rejilla de emojis** curada (`ICONS` en
  `RichTextArea.tsx`, ~100 iconos de formación) más la opción **∅ Sin icono**. Se cierra al
  elegir o al hacer clic fuera.
- **Arranca vacío**: sin icono ni título por defecto. Si **ambos** quedan vacíos, el runtime
  (`renderCustomCallout`) **no pinta cabecera**: solo el filete de color + el cuerpo. Si hay
  solo uno, se muestra ese.
- **Formato de la valla**: `::: custom | #color | icono | título`. Ojo: tras `::: custom` el
  resto empieza por `|`, así que el primer segmento del `split('|')` llega vacío y
  `renderCustomCallout` lo descarta (`parts.shift()`) para que color/icono/título caigan en
  su sitio.
- **Presets** en `localStorage` (`src/store/customBlocks.ts`, clave
  `scormeditor.customBlocks`), **no** en `course.json` (cada bloque se exporta ya resuelto en
  el texto). Un preset vale si tiene `color` y al menos `title` **o** `icon`.
- **Seguridad**: el color se valida como hex antes de inyectarlo en `style` (anti-inyección
  CSS); icono y título se escapan con `esc()`.

## Recursos visuales
- `visual_resource` admite `layout` (`top`/`bottom`/`left`/`right`, def. `top`) y
  `media_width` (`33`/`50`/`66`, def. `50`). La maquetación texto+media
  (`.me-layout`/`.me-media`/`.me-mw-*`) aplica en **todas** las plantillas, no solo en
  content/route/video (un fallo histórico fue limitarlo).
- Solo en `top`/`bottom`: `media_align` (`left`/`center`, def. `left`) y `media_full`
  (bool, def. `false`) → clases `.me-media-center` / `.me-media-full` que centran o estiran
  el recurso al 100% del ancho. Defaults = comportamiento previo (izquierda, tamaño
  intrínseco hasta el 100%). En el editor es un **único control segmentado «Ajuste»**
  (iconos ◧/▣/⬛ = Izquierda/Centrada/Ancho 100%, estados excluyentes) que solo aparece con
  disposición arriba/abajo y mapea a esos dos campos (iconos ◧/▣/▬, glifos de texto para
  alinear en altura con Disposición/Proporción; `.ed-seg button` tiene tamaño fijo).
- **Lightbox**: imágenes ampliables al 100% al hacer clic (`setupLightbox()`,
  `.me-lightbox`/`.me-zoomable`).
- **Assets en preview**: blobs vía `window.__ASSETS__` (mapa id→blobURL);
  `assetUrl()`/`asset` resuelve. En export, los ficheros van al ZIP y al manifiesto.

## Lenguaje visual de la carcasa (fase 1, jul 2026)
- **Acento corporativo** `--me-accent` (turquesa `#6DC3C0`) para **estructura**: filo
  superior de la tarjeta `.me-screen`, pantalla actual del menú (fondo + barra izquierda),
  pestaña activa, accordion abierto, flip-card pulsada. El azul
  `--me-primary` queda para **acciones** (botones, focus, hover de opciones).
- **Elevación** con sombras (`--me-shadow-1`/`-2`) en vez de solo bordes: tarjeta de
  pantalla, cards (hover se eleva), botones (hover sombra, active se hunde 1px).
- **Tipografía**: H1 1.9rem/800/track -.015em; H2 1.35; body line-height 1.6.
- **Transición de pantalla**: `.me-screen` entra con fade+slide (`me-screen-in`, 220 ms);
  funciona sola porque `renderScreen` recrea el nodo. `prefers-reduced-motion` desactiva
  `transition` **y** `animation`.
- **Feedback de interacciones**: la opción elegida se marca en el propio elemento
  (`.is-right`/`.is-wrong`: color + icono ✔/✖, no solo color) en `choiceFactory`
  (single_choice/true_false) y `scenario_decision`, también al **restaurar**. Error hace
  `me-shake`; la caja `.me-feedback` aparece con `me-pop`. Como los nodos persisten entre
  intentos, `replay()` (interactions.js) reinicia la animación forzando reflow.

### Fase 2 (jul 2026): percepción
- **Portada hero**: la plantilla `cover` (`.me-cover`) se estiliza como hero — título
  grande centrado sobre banda degradada del acento; prose centrada a 560 px.
- **Accordion/tabs animados**: chevron `▸` rotatorio en `.me-acc-head::before`; cuerpos y
  paneles aparecen con `me-reveal` (corre al pasar de `display:none` a visible).
- **Flip 3D**: ver `interacciones.md` (afecta también a `print.css`).
- **Resultados**: la nota sube animada (`animateNumber`, rAF + easing) y al quedar APTO
  suena **confeti propio** (`celebrate()` en app.js: canvas efímero `.me-confetti`, paleta
  corporativa, ~2,4 s, una vez por sesión). Todo respeta `prefers-reduced-motion`.
- **Menú con progreso por unidad**: `buildMenu` marca cada unidad con
  `data-start`/`data-count`; `refreshMenuChecks` rellena el contador «hechas/total»
  (`.me-menu-count`) y la mini-barra (`.me-menu-uprog`).

### Niveles de animación (`shell.motion`, jul 2026)
`shell.motion` (`none`/`subtle` def./`rich`; editable en ⚙ Ajustes → Interfaz (Apariencia))
pone `body.me-motion-<nivel>` en `applyShell`:
- **`none`**: mata toda animación/transición por CSS (y `celebrate()` no lanza confeti).
- **`subtle`** (defecto): el comportamiento de fases 1-2 tal cual.
- **`rich`**: además, **revelado progresivo** (`applyReveal` en app.js): en la **primera
  visita** de cada pantalla los bloques visibles (`.me-prose > *`, `.me-media`,
  `.me-interaction`, `.me-transcript`) entran en cascada (70 ms/bloque, tope 560 ms) y
  los que quedan bajo el pliegue esperan (`.me-rv-wait`, `opacity:0`) hasta entrar en el
  viewport (`IntersectionObserver` con `root` = `#me-content`) → clase `.me-rv`. Extras
  CSS bajo `body.me-motion-rich`: cada bloque entra con un **gesto propio** (fade +
  transform, nunca solo fade): callouts deslizan desde su borde (`me-rv-callout`),
  encabezados h2/h3 desde la izquierda (`me-rv-heading`), el media —imágenes/vídeo—
  con zoom pronunciado (`me-rv-media`, scale .8), y los ítems de
  accordion/cards/timeline/chips en cascada `nth-child` **solo** si su `.me-interaction`
  lleva `.me-rv` (primera visita). En `rich` las entradas van **más lentas**: las
  duraciones viven en dos variables CSS (`--me-anim-dur` entrada de pantalla,
  `--me-rv-dur` revelado) que `body.me-motion-rich` sube a .45s/.55s (defecto
  `subtle`: .22s/.32s); los retardos de la cascada `nth-child` van aparte (90 ms/ítem
  en rich).

**Velocidad** (`shell.motion_speed`, jul 2026): `fast`/`normal` def./`slow`, editable en
⚙ Ajustes → Interfaz (Apariencia), deshabilitado con `motion: none`. `applyBranding` pone
`body.me-speed-<v>` → variable `--me-speed` (fast 1 / normal 1.5 / slow 3, calibrado a
ojo con el usuario) que **multiplica** con `calc()`
todas las duraciones y retardos de entrada; los delays JS de `applyReveal` (70 ms/bloque,
tope 560 ms) escalan con el mismo factor (`SPEED`). Afecta solo a las **entradas**
(pantalla y revelado), no a hovers/feedback, que deben seguir siendo inmediatos.
Decisiones deliberadas: **nunca temporizar por tiempo de lectura** (el ritmo lo pone el
alumno con el scroll); `REVEALED` (por sesión) evita re-animar pantallas ya vistas; sin
`IntersectionObserver` o con `prefers-reduced-motion` todo se muestra al instante; solo
`opacity`/`transform` (contenido siempre en el DOM → lectores de pantalla OK) y
`print.css` fuerza todo visible en papel. Compatible con cualquier navegador que use
Moodle (IO es 2019+; hay degradación).

## Impresión
El botón **Imprimir** llama a `window.print()`. `src/runtime/print/print.css` reduce la
salida a **solo la pantalla actual**: oculta topbar (transcripción/audio/glosario/recursos/
imprimir), menú lateral, toolbar (anterior/siguiente), modales y botones «Comprobar». En el
ZIP se enlaza con `media="print"` (`index.html`); en **Vista estudiante** `buildPreview.ts`
lo inyecta como `<style>` en el `srcdoc` del iframe (ya viene envuelto en `@media print`),
porque si no el preview imprimía toda la interfaz. Las interactividades **informativas** ocultan
contenido tras un clic; para que el papel sea completo, `setupPrint()` (`app.js`) se
engancha a `beforeprint`/`afterprint` (así vale igual con el botón y con Ctrl+P) y, solo
durante la impresión, **expande** desplegables (`accordion`), pestañas (`tabs`) y tarjetas
(`flip_cards`), restaurando el estado al terminar. En pestañas, como el DOM lista primero
todos los botones y luego los paneles, se **oculta la barra de pestañas** y se inyecta un
rótulo (`.me-print-tablabel`) con el título de cada pestaña sobre su panel. Las
interactividades **evaluables** no se expanden (no se imprimen respuestas correctas).

## Responsive / móvil
La carcasa es 100% responsive. En `max-width:760px` el menú lateral pasa a **slide-over**
absoluto y el cuerpo ocupa una sola columna (`.me-body, #me-app.me-menu-hidden .me-body {
grid-template-columns: 1fr; }`; ojo a la especificidad: un conflicto en
`grid-template-columns` dejó la pantalla en blanco en móvil). En vista alumno **no** se
muestra el árbol de pantallas del editor.

## Renombrado MecoSCORM → SCORMEditor (jun 2026)
La app se llamaba MecoSCORM. Se renombró **todo**: carpeta del repo, `package.json`
(`name: scormeditor`), id por defecto del manifiesto/CLI (`SCORMEDITOR-COURSE`), `brand`,
diálogos de guardado, docs y la base IndexedDB (`DB_NAME = 'scormeditor'`). No deben
quedar referencias a «mecoscorm» en el código.
