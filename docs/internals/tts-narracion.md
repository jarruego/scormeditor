# Narración, transcripción y TTS

> Doc interno de SCORMEditor. Índice en `CLAUDE.md`.

## Transcripción (`screen.transcript`)
Texto autorado (por el GPT o a mano) que es la **alternativa textual** de la pantalla y
la **base de la narración**. En el runtime se muestra como **botón fuera del contenido**
(`toggleTranscript` en `app.js`), nunca duplicado dentro del cuerpo. No se genera solo:
lo que no esté en `transcript` no aparece ahí (regla de contenido del GPT).

### Regenerar desde el contenido
`buildTranscript(screen)` (`src/tts/buildTranscript.ts`) reconstruye la transcripción a
partir de `student_text` (markdown ligero → texto plano: quita `**`/`*`/enlaces, aplana
listas, y sustituye los fences `:::` por la **etiqueta hablada** del callout — mismas
etiquetas que `renderer.js`, mantener en sync) **más el enunciado (`prompt`) de la
interacción si es informativa**. Las evaluables se excluyen: no se leen
opciones/respuestas. `accordion`/`tabs`/`flip_cards`/`timeline`/`image_cards`/
`flashcards` OCULTAN el CUERPO de cada ítem tras un gesto de revelado
(desplegar/pestañear/girar/abrir): ese cuerpo NO entra en la transcripción general
—leerlo antes de que el alumno lo despliegue chafaría el propio mecanismo de
descubrimiento— y se narra por ítem con audio propio (ver «Narración por ítem» más
abajo). El TÍTULO/etiqueta de cada ítem, en cambio, es visible SIN clicar (cabecera,
pestaña, anverso de la tarjeta…), así que **sí** entra en la transcripción general junto
al `prompt`: funciona como un índice hablado de lo que hay para explorar, sin desvelar el
contenido. `before_after` no oculta nada (las dos caras se ven a la vez) y sigue
narrándose entera aquí (etiqueta + alt de cada cara).
Botón «↻ Regenerar transcripción desde el contenido» en `ScreenEditor`
(`onRebuildTranscript`): si hay transcripción distinta pide confirmación de sobrescritura;
si la pantalla tiene `audio_src`, tras regenerar avisa de que **el audio ya no se
corresponde** y ofrece regenerarlo con TTS en el momento (o mantenerlo, dejando un aviso).

Además, al **editar el contenido** de una pantalla que ya tiene `audio_src` (texto del
estudiante, una interacción informativa — `INFORMATIVE` exportado por
`buildTranscript.ts` — o la propia transcripción a mano), salta un aviso informativo
(modal `hideCancel`) de que los cambios no se aplican al audio hasta regenerar
transcripción y audio (al editar la transcripción, solo el audio). Es **único por
pantalla y sesión** (`audioStaleWarned`, `Set` a nivel de módulo en `ScreenEditor`) y se
re-arma al regenerar el audio con TTS.

En cursos **narrados**, la validación señala el trabajo pendiente por pantalla:
`NARR_NO_TRANSCRIPT` (aviso), `NARR_NO_AUDIO` (info, lista de «pendientes de narrar») y
`NARR_ITEM_NO_AUDIO` (info, mismo criterio pero por ítem de una interacción revelable).
«Narrado» lo decide el ajuste **«Curso narrado»** de Ajustes → Narración
(`course.narration.mode`: `auto` = si alguna pantalla tiene `audio_src` | `on` | `off`;
se guarda en el proyecto, no en localStorage; helper compartido `isNarrated()` en
`validators.ts`, que solo mira `audio_src` de pantalla). Detalle en `informes-validacion.md`.

## Narración por diapositiva (`screen.audio_src`)
Audio propio de la pantalla (ruta en `assets/media`), **separado del media visual**. El
runtime lo inyecta con `narrationBlock()` (renderer.js) como `<audio class=
"me-narration-audio">`; un botón «🔊/🔇 Audio» (`toggleAudio` en app.js) activa/desactiva
la reproducción automática al entrar en la pantalla (persistida en `localStorage`
`me-audio-enabled`). El navegador puede bloquear el autoplay hasta la primera interacción.

## Narración por ítem (accordion/tabs/flip_cards/timeline/image_cards/flashcards)
Estos 6 tipos ocultan el cuerpo de cada ítem tras un gesto de revelado; en vez de
narrarlo por adelantado en el audio de pantalla (spoiler + desincronía), cada ítem tiene
su **propio** audio corto que suena **solo la primera vez que se revela**. El guion **es
el propio texto visible del ítem** (título/cara/hito + cuerpo) — no hay campo de
locución aparte que mantener sincronizado.

- **Schema**: cada entrada de `items`/`cards`/`milestones` admite `id?: string` (ancla
  estable — no la asigna el GPT; el editor la genera al vuelo la primera vez que hace
  falta, vía el mismo generador `rid()` que ya usan opciones/pasos/grupos) y
  `audio_src?: string` (ruta `assets/media/...`, igual que el audio de pantalla).
- **`itemsOf(interaction)`** (`src/tts/buildTranscript.ts`) da, por cada ítem de un tipo
  revelable (`[]` para el resto): `label` (título/cara/hito, visible sin revelar — lo usa
  la transcripción general), `text` (guion completo del audio de ítem: label + cuerpo),
  `id` y `audioSrc`. `itemsKeyOf(type)` da la clave de `config` correspondiente
  (`items`/`cards`/`milestones`) — única fuente de esa correspondencia, la reutilizan
  `tts.ts` y los validadores.
- **Generación** (`src/tts/tts.ts`): `generateForItem(screenId, interactionId, itemId)`
  sintetiza el texto del ítem y lo guarda en su `audio_src`; `listNarratableItems()` lista
  todos los ítems narrables del curso con su estado (para contadores/validación);
  `generateAllItems(opts)` los genera todos en bloque (mismo patrón que `generateAll` pero
  por ítem). Botones en `InteractionConfigEditor.tsx`: uno por ítem («🔊 Generar/
  Regenerar audio») y uno por interacción («🔊 Generar audios de ítem pendientes»); si el
  ítem aún no tiene `id` se lo asigna en el momento. El panel masivo de Ajustes →
  Narración (`TtsPanel.tsx`) encadena `generateAll` + `generateAllItems` sobre la misma
  barra de progreso y el mismo botón — sí incluye los ítems (ver más abajo).
- **Runtime** (`interactions.js`): el audio (oculto, `<audio class="me-item-narration">`)
  vive dentro del cuerpo/cara que ya está oculta hasta el revelado. Suena **cada vez**
  que el ítem se abre/gira/activa (no solo la primera vez; sin control de «escuchar de
  nuevo» — si resulta repetitivo, el alumno desactiva el audio con las opciones
  generales de la barra inferior). `revealItemAudio()` es el punto único donde las 6
  factories disparan el audio; el marcado de `seen[i]` (check ✓, gating de completado)
  sigue ocurriendo solo la primera vez, pero es independiente de la reproducción.
  `playItemAudio`/`stopItemAudio` (helpers compartidos del módulo) garantizan que **solo
  suena una narración a la vez**: revelar un ítem para el audio de pantalla
  (`ctx.pauseScreenNarration`) y viceversa (`Interactions.stopItemAudio`, que `app.js`
  llama al navegar y al activar/desactivar el audio de pantalla); respeta el mismo
  toggle 🔊/🔇 (`ctx.audioEnabled()`), el mismo volumen (`ctx.audioVolume()`) y la misma
  velocidad de reproducción (`ctx.audioRate()`, ver «Velocidad de reproducción»). Como
  cada pantalla tiene como mucho una interacción, basta una única referencia "activa" a
  nivel de módulo. `flashcards` ya narraba así desde siempre (sin `seen` persistente, el
  repaso se repite a propósito: cada «Mostrar respuesta» es su propio revelado).
- **Validación**: `NARR_ITEM_NO_AUDIO` (info) — ítem con texto pero sin `audio_src`,
  mismo criterio que `NARR_NO_AUDIO` pero por ítem.

## Reproductor de la narración (barra inferior)
El bloque `#me-audio-player` de `src/runtime/index.html` (dentro de `.me-toolbar-center`,
junto a Anterior/progreso/Siguiente — ver `arquitectura-runtime.md`) es un reproductor
completo de la narración de **pantalla**: play/pause, barra de progreso + tiempo
(`#me-audio-seek`/`#me-audio-time`), botón de sonido (mute) con selector de volumen y
selector de velocidad. Se oculta entero si la pantalla actual no tiene `audio_src`
(`refreshAudioPlayer()` en `app.js`, llamada tras cada `goTo`).
- **Play/pause** (`togglePlayPause`/`reflectPlayPause`): el transporte actúa sobre el
  `<audio>` real de la pantalla. `.paused` NO es fuente de verdad (el navegador lo pone a
  `false` en cuanto se llama a `.play()`, aunque el recurso no llegue a sonar nunca — ruta
  sin archivo subido, ver más arriba, o archivo roto): el icono se rige por un flag propio
  (`narrationPlaying`) que solo el evento `'playing'` pone a `true`, y `'pause'`/`'ended'`/
  `'error'` ponen a `false`. Así el botón nunca se queda mostrando «pausa» sin sonar nada.
- **Progreso/seek**: `#me-audio-seek` (input range) se actualiza en `timeupdate`/
  `loadedmetadata`; arrastrarlo mueve `currentTime`. Mientras se arrastra
  (`pointerdown`/`pointerup`) no se pisa el valor desde `timeupdate`.
- **Volumen**: `#me-audio-volume` (0..1), persistido en `localStorage` `me-audio-volume`
  igual que `me-audio-enabled`/`me-audio-rate`. El botón 🔊/🔇 sigue siendo el mismo
  toggle de siempre (`audioEnabled`/`toggleAudio`) — silencia/reactiva la narración
  entera, no solo el volumen.
- **Velocidad**: `<select id="me-audio-rate">` (1×/1.25×/1.5×/2×), sin cambios respecto a
  antes.
- **Color**: los controles de audio son turquesa (`--me-accent`, `accent-color` en los
  `<input type=range>` y `#me-btn-audio.is-on`), nunca azul — así se distinguen a simple
  vista de Anterior/Siguiente (`--me-primary`).

Velocidad y volumen afectan a **ambas** narraciones (pantalla e ítem):
- **De pantalla**: `playCurrentNarration()` aplica `audioRate`/`audioVolume` al `<audio>`
  de pantalla al reproducir; `setAudioRate()`/`setAudioVolume()` los aplican también al
  vuelo si ya está sonando.
- **De ítem**: `ctx.audioRate()`/`ctx.audioVolume()` (mismo objeto `ctx` que
  `audioEnabled`/`pauseScreenNarration`) los lee `playItemAudio()` en `interactions.js`;
  si un ítem está sonando cuando el alumno cambia la velocidad o el volumen, `app.js`
  llama a `Interactions.setItemAudioRate(rate)`/`setItemAudioVolume(vol)` para aplicarlos
  al vuelo sin cortar la reproducción.

## TTS (texto→voz): generación del audio
Módulo `src/tts/tts.ts` + sección `NarrationSection` (`src/components/TtsPanel.tsx`),
mostrada en su propia ventana `NarrationModal`, que abre la opción **Narración** del menú
**⚙ Ajustes** de la `Toolbar` (no hay botón de narración suelto en la barra). La sección
informa de `busy` para que la ventana no se cierre mientras genera.
- **Config compartida** (`getTtsConfig`/`setTtsConfig`, claves de API vía
  `setProviderKey`) en `localStorage`; varios `PROVIDERS` con sus `voicesFor`/`modelsFor`/
  `providerDefaults`.
- **Por pantalla**: `generateForScreen(id)` sintetiza el audio **desde la `transcript`**
  y lo guarda en `audio_src`. Disparador en `ScreenEditor` (botón «Generar audio»);
  requiere clave de API configurada.
- **Masivo**: `generateAll` (con `onlyMissing`) genera el audio de todas las pantallas
  con transcripción de una vez; `generateAllItems` hace lo mismo por ítem (ver
  «Narración por ítem»). `TtsPanel.tsx` (`onGenerate`) encadena ambas bajo un único botón
  «Generar N audios» y una única barra de progreso (índice combinado: primero pantallas,
  luego ítems).

El panel de generación masiva **respeta el ajuste «Curso narrado»**: con `off` la
generación (audios y transcripciones) queda deshabilitada con una nota — probable
despiste y coste de API. Los contadores incluyen las pantallas **con contenido narrable
sin transcripción** (mismo criterio que `NARR_NO_TRANSCRIPT`: `hasContent`/`skeleton` en
`listNarratable`) y los **ítems narrables sin audio propio** (`listNarratableItems`,
mismo criterio que `NARR_ITEM_NO_AUDIO`), y hay un paso previo masivo «↻ Generar
transcripciones desde el contenido» (`fillMissingTranscripts` en el store, solo a nivel
de pantalla): **solo rellena las vacías** — nunca sobrescribe una editada a mano, por eso
no pide confirmación — y hace un único snapshot (un solo deshacer). El flujo completo
queda: marcar curso narrado → transcripciones en bloque → revisarlas → audios en bloque
(pantallas + ítems), con los números cuadrando con la pestaña Validación.

Consecuencia: un `transcript` completo (texto del estudiante + enunciado e índice
hablado de títulos de la interacción) más el audio de cada ítem revelable generado ⇒ una
narración completa. Ver criterios de contenido en `ingesta-gpt.md`.
