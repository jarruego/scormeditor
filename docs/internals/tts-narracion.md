# Narración, transcripción y TTS

> Doc interno de SCORMEditor. Índice en `CLAUDE.md`.

## Transcripción (`screen.transcript`)
Texto autorado (por el GPT o a mano) que es la **alternativa textual** de la pantalla y
la **base de la narración**. En el runtime se muestra como **botón fuera del contenido**
(`toggleTranscript` en `app.js`), nunca duplicado dentro del cuerpo. No se genera solo:
lo que no esté en `transcript` no aparece ahí (regla de contenido del GPT).

## Narración por diapositiva (`screen.audio_src`)
Audio propio de la pantalla (ruta en `assets/media`), **separado del media visual**. El
runtime lo inyecta con `narrationBlock()` (renderer.js) como `<audio class=
"me-narration-audio">`; un botón «🔊/🔇 Audio» (`toggleAudio` en app.js) activa/desactiva
la reproducción automática al entrar en la pantalla (persistida en `localStorage`
`me-audio-enabled`). El navegador puede bloquear el autoplay hasta la primera interacción.

## TTS (texto→voz): generación del audio
Módulo `src/tts/tts.ts` + sección `NarrationSection` (`src/components/TtsPanel.tsx`),
mostrada en su propia ventana `NarrationModal`, que abre la opción **Narración por voz…**
del menú **⚙ Ajustes** (`SettingsModal.tsx` / `Toolbar`).
- **Config compartida** (`getTtsConfig`/`setTtsConfig`, claves de API vía
  `setProviderKey`) en `localStorage`; varios `PROVIDERS` con sus `voicesFor`/`modelsFor`/
  `providerDefaults`.
- **Por pantalla**: `generateForScreen(id)` sintetiza el audio **desde la
  `transcript`** y lo guarda en `audio_src`. Disparador en `ScreenEditor` (botón «Generar
  audio»); requiere clave de API configurada.
- **Masivo**: `generateAll` (con `onlyMissing`) genera el audio de todas las pantallas con
  transcripción de una vez. Vive en `NarrationSection` (ventana `NarrationModal`), que abre la
  opción **Narración por voz…** del menú **⚙ Ajustes** de la `Toolbar` (ya no hay botón
  «🔊 Narración» suelto). La generación individual está en el editor de cada pantalla; la
  sección tiene la config (compartida) y la generación en lote, e informa de `busy` para que
  la ventana no cierre mientras genera.

Consecuencia: un `transcript` completo (incluido el texto de las interacciones si así se
decide) ⇒ una narración completa. Ver criterios de contenido en `ingesta-gpt.md`.
