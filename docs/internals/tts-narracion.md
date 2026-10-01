# Narración, transcripción y TTS

> Doc interno de SCORMEditor. Índice en `CLAUDE.md`.

## Transcripción (`screen.transcript`)
Texto autorado (por el GPT o a mano) que es la **alternativa textual** de la pantalla y
la **base de la narración**. En el runtime se muestra como **botón fuera del contenido**
(`toggleTranscript` en `app.js`), nunca duplicado dentro del cuerpo. No se genera solo:
lo que no esté en `transcript` no aparece ahí (regla de contenido del GPT).

### Regenerar desde el contenido
`buildTranscript(screen)` (`src/tts/buildTranscript.ts`) reconstruye la transcripción
anteponiendo SIEMPRE el **título de la pantalla** (primera frase, como anunciaría un
narrador real) y a partir de `student_text` (markdown ligero → texto plano: quita
`**`/`*`/enlaces, aplana listas, y sustituye los fences `:::` por la **etiqueta hablada**
del callout — mismas etiquetas que `renderer.js`, mantener en sync). El título es lo único
que garantiza que una portada de módulo/unidad (solo título, sin `student_text`) tenga
algo que narrar en vez de quedar muda — antes se omitía del todo y `buildTranscript` podía
devolver vacío para esas pantallas, sin que ni siquiera apareciesen como «pendientes» en
Validación.

El resto depende de si la interacción es **informativa** (`INFORMATIVE`, exportado por
`buildTranscript.ts`: `accordion`/`tabs`/`flip_cards`/`timeline`/`image_cards`/
`flashcards`/`before_after`/`case_practice`/`scenario_decision`) o **evaluable** (cualquier
otro tipo — `single_choice`, `fill_blanks`, `hotspots`, crucigrama…):
- **Evaluable**: solo entra el **enunciado** (`prompt`), nunca opciones, pasos a ordenar,
  zonas, respuestas ni feedback — narrar eso en voz alta sería «caos auditivo» (listas
  largas sin la pausa/interacción real del alumno) y en varios casos desvelaría
  literalmente la respuesta. El enunciado por sí solo evita que la pantalla quede muda.
- **Informativa**: entra su contenido completo, con dos sub-familias:
  - *Revelable* (`REVEALABLE_TYPES`: `accordion`/`tabs`/`flip_cards`/`timeline`/
    `image_cards`/`flashcards`) OCULTA el CUERPO de cada ítem tras un gesto de revelado
    (desplegar/pestañear/girar/abrir): ese cuerpo NO entra en la transcripción general
    —leerlo antes de que el alumno lo despliegue chafaría el propio mecanismo de
    descubrimiento— y se narra por ítem con audio propio (ver «Narración por ítem» más
    abajo). El TÍTULO/etiqueta de cada ítem, en cambio, es visible SIN clicar (cabecera,
    pestaña, anverso de la tarjeta…), así que **sí** entra en la transcripción general
    junto al `prompt`: funciona como un índice hablado de lo que hay para explorar, sin
    desvelar el contenido.
  - *No revelable* no oculta nada tras un gesto, así que entra entera sin esperar: 
    `before_after` (etiqueta + alt de cada cara), `case_practice` (los criterios de la
    rúbrica de autoevaluación — no tiene «correcta», así que narrarlos no desvela nada) y
    `scenario_decision` (la situación inicial, que es contexto, no una opción a adivinar;
    las opciones y su feedback sí quedan fuera, como cualquier evaluable).

`hotspots` es evaluable (solo su `prompt` entra en la transcripción general) pero tiene
además su **propio** mecanismo de audio por zona — ver «Narración por ítem» — sin estar en
`REVEALABLE_TYPES`: sus zonas no deben aparecer en el índice hablado (sería leer las
opciones de la pregunta antes de que el alumno las pulse).

Botón «↻ Regenerar transcripción desde el contenido» en `ScreenEditor`
(`onRebuildTranscript`): si hay transcripción distinta pide confirmación de sobrescritura;
si la pantalla tiene `audio_src`, tras regenerar avisa de que **el audio ya no se
corresponde** y ofrece regenerarlo con TTS en el momento (o mantenerlo, dejando un aviso).

Además, al **editar el contenido** de una pantalla que ya tiene `audio_src` (texto del
estudiante, una interacción informativa — `INFORMATIVE` exportado por
`buildTranscript.ts` — o la propia transcripción a mano), salta un aviso informativo
(modal `hideCancel`) de que los cambios no se aplican al audio hasta regenerar
transcripción y audio (al editar la transcripción, solo el audio). Es **único por
pantalla y sesión** (`audioStaleWarned`, `Set` a nivel de módulo en `ScreenEditor`, se
pierde al recargar) y se re-arma al regenerar el audio con TTS — es un aviso puntual en
el momento de editar, no un estado que quede marcado en ningún sitio: ver «Desactualizado»
más abajo para el indicador persistente.

En cursos **narrados**, la validación señala el trabajo pendiente por pantalla:
`NARR_NO_TRANSCRIPT` (aviso), `NARR_NO_AUDIO` (info, lista de «pendientes de narrar») y
`NARR_ITEM_NO_AUDIO` (info, mismo criterio pero por ítem de una interacción revelable).
«Narrado» lo decide el ajuste **«Curso narrado»** de Ajustes → Narración
(`course.narration.mode`: `auto` = si alguna pantalla tiene `audio_src` | `on` | `off`;
se guarda en el proyecto, no en localStorage; helper compartido `isNarrated()` en
`validators.ts`, que solo mira `audio_src` de pantalla). Detalle en `informes-validacion.md`.

### Desactualizado (`transcript_content_hash`/`audio_transcript_hash`)
El aviso puntual de arriba se pierde al recargar y no deja rastro. Para que quede algo
persistente que sobreviva a cerrar el editor, cada `Screen` guarda dos huellas
**internas del editor** (metadato de caché, no autorado — el GPT nunca las redacta,
quedan `undefined` si faltan y eso es normal en proyectos/pantallas de antes de este
mecanismo):
- `transcript_content_hash`: huella (`contentHash`, FNV-1a 32 bits — no criptográfica,
  solo para detectar cambios) de `buildTranscript(screen)` en el momento de escribir o
  regenerar `transcript` por última vez.
- `audio_transcript_hash`: huella de `transcript` en el momento de generar `audio_src`
  por última vez (TTS o subida manual).

`updateScreen()` (`courseStore.ts`) las resella automáticamente cada vez que `transcript`
o `audio_src` cambian — es el único punto de escritura de Screen, así que no hace falta
tocar nada más al añadir una vía nueva de editarlos. Si el contenido (`student_text`,
interacción) cambia SIN tocar `transcript`, o `transcript` cambia SIN regenerar
`audio_src`, la huella guardada deja de coincidir con la que se recalcularía ahora:
**desactualizado**. Sin huella sellada (nunca se guardó desde el editor) nunca se marca
como desactualizado — no hay con qué comparar, así que se asume al día por defecto en vez
de avisar en falso sobre contenido de fuera del editor (GPT, proyectos antiguos).

- **Validadores** (solo en cursos narrados, igual que el resto de la familia `NARR_*`):
  `NARR_TRANSCRIPT_STALE` (info) y `NARR_AUDIO_STALE` (info).
- **`ScreenEditor`**: aviso `.ed-hint-warn` junto a la transcripción/al audio cuando esa
  pantalla concreta está desactualizada, señalando el botón «Regenerar» que ya existía.
- **`listNarratable()`** (`tts.ts`) expone `staleTranscript`/`staleAudio` por pantalla;
  `TtsPanel` los cuenta junto al resto de estadísticas.
- **Regenerar en bloque**: `fillMissingTranscripts(force?)` (store) hace dos cosas bajo un
  único snapshot/deshacer — rellena las transcripciones **vacías** (como antes) Y
  **regenera** las que están desactualizadas (nunca una transcripción al día, ni una sin
  huella sellada: no hay con qué comparar, así que no se toca). Devuelve `{filled,
  refreshed}`. El audio no tiene un botón «solo desactualizados» propio: la casilla
  existente «Generar solo las que aún no tienen audio» ya cubre el caso al desmarcarla
  (regenera todas, desactualizadas incluidas) — un botón dedicado sería forzar sin
  necesidad una regeneración completa (coste de API) cuando el objetivo es solo arreglar
  unas pocas; para eso está el botón por pantalla en `ScreenEditor`.
  - **`force: true`** («Forzar regeneración de TODAS las transcripciones» en `TtsPanel`,
    con confirmación — sobrescribe texto, sea cual sea su origen): regenera TODAS las
    narrables desde el contenido actual, también las que están al día o SIN huella. Es la
    vía de escape para lo que el sistema de huellas no puede detectar solo: una
    transcripción sin huella sellada (editada a mano, importada del GPT, o de antes de
    este mecanismo) nunca se marca sola como desactualizada aunque **cambie el propio
    código** de `buildTranscript` (p. ej. un cambio de política de narración) — necesita
    este botón para alcanzarla. No toca el audio ya generado (queda desactualizado si el
    texto cambió; para refrescarlo, el flujo sigue siendo desmarcar «solo sin audio» y
    pulsar «Generar N audios», como cualquier otro caso de audio desactualizado).

## Narración por diapositiva (`screen.audio_src`)
Audio propio de la pantalla (ruta en `assets/media`), **separado del media visual**. El
runtime lo inyecta con `narrationBlock()` (renderer.js) como `<audio class=
"me-narration-audio">`; un botón «🔊/🔇 Audio» (`toggleAudio` en app.js) activa/desactiva
la reproducción automática al entrar en la pantalla (persistida en `localStorage`
`me-audio-enabled`). El navegador puede bloquear el autoplay hasta la primera interacción.

## Narración por ítem (accordion/tabs/flip_cards/timeline/image_cards/flashcards/hotspots)
Los 6 tipos revelables ocultan el cuerpo de cada ítem tras un gesto de revelado; en vez de
narrarlo por adelantado en el audio de pantalla (spoiler + desincronía), cada ítem tiene
su **propio** audio corto que suena **solo la primera vez que se revela**. El guion **es
el propio texto visible del ítem** (título/cara/hito + cuerpo) — no hay campo de
locución aparte que mantener sincronizado.

`hotspots` reutiliza el mismo mecanismo (clave `spots` en `ITEM_KEY`, mismos botones de
audio por ítem) pero con una semántica distinta: no es un gesto de exploración libre, es
una zona de una pregunta de un único intento. Por eso **solo** entra en `ITEM_KEY` (audio
por zona, suena al clicarla) y **no** en `REVEALABLE_TYPES` (nunca aparece en el índice
hablado de la transcripción general — ver arriba) y **no** se narra en la restauración de
estado al recargar (solo en el clic en vivo): el guion es únicamente el `label` de la
zona (nunca su `feedback` de correcto/incorrecto, igual que no se narran las opciones de
un `single_choice`).

- **Schema**: cada entrada de `items`/`cards`/`milestones`/`spots` admite `id?: string`
  (ancla estable — no la asigna el GPT; el editor la genera al vuelo la primera vez que
  hace falta, vía el mismo generador `rid()` que ya usan opciones/pasos/grupos) y
  `audio_src?: string` (ruta `assets/media/...`, igual que el audio de pantalla).
- **`itemsOf(interaction)`** (`src/tts/buildTranscript.ts`) da, por cada ítem de un tipo
  con `ITEM_KEY` (`[]` para el resto): `label` (título/cara/hito/zona), `text` (guion del
  audio de ítem — en `hotspots`, solo el `label`; en el resto, label + cuerpo), `id` y
  `audioSrc`. `itemsKeyOf(type)` da la clave de `config` correspondiente
  (`items`/`cards`/`milestones`/`spots`) — única fuente de esa correspondencia, la
  reutilizan `tts.ts` y los validadores.
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

## Duración total del audio (indicador en la Toolbar)
`NarrationDurationIndicator` (`src/components/NarrationDurationIndicator.tsx`), chip
siempre visible en la Toolbar junto a `SuspendSizeIndicator` (memoria de
`suspend_data`): suma la duración de TODO el audio de narración ya generado — de
pantalla (`screen.audio_src`) y de ítem/zona (accordion/tabs/flip_cards/timeline/
image_cards/flashcards/hotspots, vía `listNarrationAudioPaths()` en `tts.ts`) — para
hacerse una idea orientativa del tiempo de escucha del curso. Es un dato **informativo
sin umbral bueno/malo** (a diferencia del medidor de memoria): chip neutro
(`.ed-duration-chip`), sin popover de desglose.

- **Mide solo metadatos**: crea un `<audio>` oculto por archivo (`URL.createObjectURL`
  sobre el `Blob` del asset) y lee `.duration` en `loadedmetadata`, sin reproducir nada.
  Con tope de 8 s por archivo (`probeDuration`): si el navegador no puede decodificarlo
  (o no dispara ni `loadedmetadata` ni `error` — pasa con un archivo roto, o con pestañas
  en segundo plano, que algunos navegadores difieren adrede) se cuenta como «no medible»
  en vez de dejar el chip calculando para siempre; el tooltip dice cuántos quedaron sin
  medir.
- **Caché por ruta** (`durationsRef`, en memoria del componente, se pierde al recargar):
  la clave combina la ruta con el tamaño del asset, así que regenerar un audio (nuevo
  `Blob` en `assets`) invalida sola la entrada vieja sin tener que compararla a mano.
  Recalcula con el mismo debounce (400 ms) que `SuspendSizeIndicator` al cambiar
  `course`/`assets`.
- Se oculta por completo si el curso no tiene ningún audio de narración generado todavía
  (no un chip en «0 s» sin más, que no aportaría nada).

## TTS (texto→voz): generación del audio
Módulo `src/tts/tts.ts` + sección `NarrationSection` (`src/components/TtsPanel.tsx`),
mostrada en su propia ventana `NarrationModal`, que abre la opción **Narración** del menú
**⚙ Ajustes** de la `Toolbar` (no hay botón de narración suelto en la barra). La sección
informa de `busy` para que la ventana no se cierre mientras genera.
- **Config partida entre proyecto y navegador** (`getTtsConfig`/`setTtsConfig` en
  `tts.ts`, tipo `TtsConfig`): proveedor, `baseUrl`, modelo, voz, formato, velocidad e
  instrucciones/«Vibe» viajan en el proyecto (`course.narration.tts`, ver
  `course.schema.ts`) — así todo el equipo locuta con la misma voz al abrir el mismo
  `.scormproj`/documento-nube, sin reconfigurarla cada uno. La **clave de API** (`keys`,
  una por proveedor vía `setProviderKey`) es la única excepción: vive SOLO en
  `localStorage` de cada navegador y nunca se escribe en el proyecto ni en el ZIP —
  `readProjectTts()`/`readLocalKeys()` leen cada mitad de su sitio y `getTtsConfig()` las
  junta; `readProjectTts()` copia los campos **uno a uno** (nunca con un `{ ...tts }` a
  ciegas) precisamente para que un `keys` que pudiera colarse en `narration.tts` (p. ej.
  un proyecto tocado por una build con este bug ya corregido) se descarte al leer en vez
  de propagarse al siguiente guardado. `setTtsConfig(patch)` separa `patch.keys` (→
  `localStorage`) del resto (→ `updateNarration({tts}, 'tts-config')`, con una clave de
  agrupación para que teclear el «Vibe» o tocar varios selectores seguidos sea **un solo**
  paso de deshacer, igual que un campo de texto). Proyectos de antes de este campo reciben
  los valores por defecto de `course.schema.ts` al cargar — la voz guardada en el
  navegador de quien lo creó NO se migra automáticamente a esos proyectos ya existentes
  (hay que re-elegirla una vez; desde entonces queda en el proyecto). `PROVIDERS` con sus
  `voicesFor`/`modelsFor`/`providerDefaults`.
- **Por pantalla**: `generateForScreen(id)` sintetiza el audio **desde la `transcript`**
  y lo guarda en `audio_src`. Disparador en `ScreenEditor` (botón «Generar audio»);
  requiere clave de API configurada.
- **Masivo**: `generateAll` (con `onlyMissing`) genera el audio de todas las pantallas
  con transcripción de una vez; `generateAllItems` hace lo mismo por ítem (ver
  «Narración por ítem»). `TtsPanel.tsx` (`onGenerate`) encadena ambas bajo un único botón
  «Generar N audios» y una única barra de progreso (índice combinado: primero pantallas,
  luego ítems).
- **Coste**: la API de OpenAI cobra por tokens de texto de entrada + tokens de audio de
  salida (sin cargo fijo por petición), así que generar el audio pantalla a pantalla no
  cuesta más en total que uno combinado y cortado luego — y evita el problema de cortar
  con precisión y desincronizar `audio_src` por pantalla. `MAX_CHARS` (3800, margen bajo
  el límite de 4096 de OpenAI) ya trocea internamente una transcripción larga en varias
  peticiones dentro de `synthesize()`.
- **Voces de OpenAI** (`OPENAI_VOICES`, `voicesFor(provider, model)`): las 13 voces del
  modelo más nuevo (`gpt-4o-mini-tts`; OpenAI recomienda `marin`/`cedar` para la mejor
  calidad). Los modelos heredados `tts-1`/`tts-1-hd` solo soportan 9
  (`OPENAI_VOICES_LEGACY`, sin `ballad`/`verse`/`marin`/`cedar`) — `voicesFor` ya filtra
  según el modelo, y el `<select>` de modelo en `TtsPanel` reajusta la voz sola si la
  elegida deja de ser válida al cambiar de modelo.
  `voiceLabel()` añade entre paréntesis el género **percibido**, orientativo — OpenAI
  **no** publica el género de estas voces a propósito (varias están pensadas como
  neutras) y la percepción se contradice entre fuentes de comunidad para varias de ellas;
  `OPENAI_VOICE_GENDER` solo etiqueta las que tienen consenso razonable y deja sin
  etiqueta las 4 más nuevas (`ballad`/`verse`/`marin`/`cedar`, aún sin documentación de
  comunidad suficiente) en vez de arriesgar una etiqueta sin base. El panel lo explica con
  un aviso junto al desplegable.
- **Tono/estilo** (`cfg.instructions`, campo «Vibe» en `TtsPanel`): instrucciones en
  lenguaje natural sobre tono/ritmo/emoción/acento, el mismo concepto que el «Vibe» de
  **openai.fm** (demo oficial de OpenAI para probar voces) — se envían tal cual junto al
  texto en cada síntesis (`openaiChunk`), sin «vibes» predefinidos que mantener; las
  admite `gpt-4o-mini-tts` (no `tts-1`/`tts-1-hd`) y, con otro uso, todos los modelos de
  Gemini (`showInstructions` en `TtsPanel.tsx`).

El panel de generación masiva **respeta el ajuste «Curso narrado»**: con `off` la
generación (audios y transcripciones) queda deshabilitada con una nota — probable
despiste y coste de API. Los contadores incluyen las pantallas **con contenido narrable
sin transcripción** (mismo criterio que `NARR_NO_TRANSCRIPT`: `hasContent`/`skeleton` en
`listNarratable`) y los **ítems narrables sin audio propio** (`listNarratableItems`,
mismo criterio que `NARR_ITEM_NO_AUDIO`), y hay un paso previo masivo «↻ Generar/actualizar
transcripciones desde el contenido» (`fillMissingTranscripts` en el store, solo a nivel de
pantalla): rellena las vacías y regenera las desactualizadas — nunca una editada a mano
que siga al día, por eso no pide confirmación (detalle en «Desactualizado» más abajo) — y
hace un único snapshot (un solo deshacer). El flujo completo queda: marcar curso narrado →
transcripciones en bloque → revisarlas → audios en bloque (pantallas + ítems), con los
números cuadrando con la pestaña Validación.

Consecuencia: un `transcript` completo (texto del estudiante + enunciado e índice
hablado de títulos de la interacción) más el audio de cada ítem revelable generado ⇒ una
narración completa. Ver criterios de contenido en `ingesta-gpt.md`.
