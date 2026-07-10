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
etiquetas que `renderer.js`, mantener en sync) **más el contenido de la interacción si es
informativa** (`accordion`/`tabs`/`flip_cards`/`timeline`/`flashcards`, que contienen
texto del curso). Las evaluables se excluyen: no se leen opciones/respuestas.
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
`NARR_NO_TRANSCRIPT` (aviso) y `NARR_NO_AUDIO` (info, lista de «pendientes de narrar»).
«Narrado» lo decide el ajuste **«Curso narrado»** de Ajustes → Narración
(`course.narration.mode`: `auto` = si alguna pantalla tiene `audio_src` | `on` | `off`;
se guarda en el proyecto, no en localStorage; helper compartido `isNarrated()` en
`validators.ts`). Detalle en `informes-validacion.md`.

## Narración por diapositiva (`screen.audio_src`)
Audio propio de la pantalla (ruta en `assets/media`), **separado del media visual**. El
runtime lo inyecta con `narrationBlock()` (renderer.js) como `<audio class=
"me-narration-audio">`; un botón «🔊/🔇 Audio» (`toggleAudio` en app.js) activa/desactiva
la reproducción automática al entrar en la pantalla (persistida en `localStorage`
`me-audio-enabled`). El navegador puede bloquear el autoplay hasta la primera interacción.

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
  con transcripción de una vez.

El panel de generación masiva **respeta el ajuste «Curso narrado»**: con `off` la
generación (audios y transcripciones) queda deshabilitada con una nota — probable
despiste y coste de API. Los contadores incluyen las pantallas **con contenido narrable
sin transcripción** (mismo criterio que `NARR_NO_TRANSCRIPT`: `hasContent`/`skeleton` en
`listNarratable`), y hay un paso previo masivo «↻ Generar transcripciones desde el
contenido» (`fillMissingTranscripts` en el store): **solo rellena las vacías** — nunca
sobrescribe una editada a mano, por eso no pide confirmación — y hace un único snapshot
(un solo deshacer). El flujo completo queda: marcar curso narrado → transcripciones en
bloque → revisarlas → audios en bloque, con los números cuadrando con la pestaña
Validación.

Consecuencia: un `transcript` completo (incluido el texto de las interacciones si así se
decide) ⇒ una narración completa. Ver criterios de contenido en `ingesta-gpt.md`.
