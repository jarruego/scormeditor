import { useEffect, useMemo, useRef, useState } from 'react'
import { useCourseStore } from '../store/courseStore'
import { confirmDialog } from '../store/confirm'
import {
  generateAll,
  generateAllItems,
  getTtsConfig,
  listNarratable,
  listNarratableItems,
  listNarrationAudioPaths,
  modelsFor,
  providerDefaults,
  PROVIDERS,
  setProviderKey,
  setTtsConfig,
  synthesize,
  voiceLabel,
  voicesFor,
  type BulkResult,
  type TtsConfig,
  type TtsProvider,
} from '../tts/tts'
import { useDurationSum } from '../media/useDurationSum'
import { getCompressedAudio } from '../media/compressedAudioCache'
import { formatEstimatedDuration } from '../report/estimateDuration'
import { Icon } from './Icon'

/**
 * Sección «Narración por voz (TTS)»: configura la clave/voz/modelo de la API y
 * genera el audio de todas las pantallas con transcripción de una vez. La
 * generación individual vive en el editor de cada pantalla; aquí está la config
 * (compartida vía localStorage) y la generación masiva. Se muestra como pestaña
 * del modal unificado de Ajustes (`SettingsModal`); informa de `busy` al padre
 * para que no cierre mientras genera.
 */
export function NarrationSection({ onBusyChange }: { onBusyChange?: (busy: boolean) => void }) {
  // El curso cambia mientras se genera (audio_src): lo leemos para el recuento.
  const course = useCourseStore((s) => s.course)
  const updateNarration = useCourseStore((s) => s.updateNarration)
  const fillMissingTranscripts = useCourseStore((s) => s.fillMissingTranscripts)
  const [trMsg, setTrMsg] = useState<string | null>(null)
  const [cfg, setCfg] = useState<TtsConfig>(() => getTtsConfig())
  // Proveedor/modelo/voz/Vibe viven en el proyecto (course.narration.tts):
  // si cambian por fuera de este panel (deshacer/rehacer, cambio de proyecto),
  // este estado local se resincroniza. Las claves de API no están aquí (viven
  // solo en localStorage, nunca en el proyecto), así que no hace falta
  // resincronizarlas por este camino.
  useEffect(() => {
    setCfg(getTtsConfig())
  }, [course.narration.tts])
  const [busy, setBusy] = useState(false)
  const [onlyMissing, setOnlyMissing] = useState(true)
  const [progress, setProgress] = useState<{ index: number; total: number; title: string } | null>(null)
  const [result, setResult] = useState<BulkResult | null>(null)
  const [testMsg, setTestMsg] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Recuento reactivo (depende del curso). `missingTranscript` usa el mismo
  // criterio que el aviso NARR_NO_TRANSCRIPT de validación (contenido narrable,
  // sin esqueletos), para que los números cuadren con la pestaña Validación.
  // Los ítems (accordion/tabs/flip_cards/timeline/image_cards/flashcards) no
  // tienen transcripción propia — su guion es su propio texto visible — así
  // que se cuentan aparte, por `hasText`/`hasAudio` (ver NARR_ITEM_NO_AUDIO).
  const stats = useMemo(() => {
    void course
    const list = listNarratable()
    const withTranscript = list.filter((s) => s.hasTranscript)
    const items = listNarratableItems().filter((it) => it.hasText)
    return {
      total: list.length,
      withTranscript: withTranscript.length,
      missingAudio: withTranscript.filter((s) => !s.hasAudio).length,
      missingTranscript: list.filter((s) => s.hasContent && !s.hasTranscript && !s.skeleton).length,
      staleTranscript: list.filter((s) => s.staleTranscript).length,
      staleAudio: list.filter((s) => s.staleAudio).length,
      itemsTotal: items.length,
      itemsMissingAudio: items.filter((it) => !it.hasAudio).length,
    }
  }, [course])

  // Duración total de TODO el audio de narración ya generado (pantalla +
  // ítems/zonas), orientativa para hacerse una idea del tiempo de escucha —
  // mide solo metadatos (nunca reproduce nada), ver `useDurationSum`.
  const audioPaths = useMemo(() => listNarrationAudioPaths(), [course])
  const audioDuration = useDurationSum(audioPaths, 'audio')
  const audioDurationTotal = Object.values(audioDuration.durations).reduce((a, b) => a + b, 0)

  // Compresión del audio de locución en Vista estudiante y en el ZIP exportado
  // (el `.scormproj` conserva siempre el original — ver `estimateDuration.ts`
  // y «Compresión de audio de locución» en tts-narracion.md).
  const compressCfg = course.narration.compressAudio
  const [compressBusy, setCompressBusy] = useState(false)
  const [compressMsg, setCompressMsg] = useState<string | null>(null)
  const [compressProgress, setCompressProgress] = useState<{ index: number; total: number } | null>(null)
  async function onCompressNow() {
    setCompressMsg(null)
    setCompressBusy(true)
    setCompressProgress({ index: 0, total: audioPaths.length })
    try {
      const assets = useCourseStore.getState().assets
      let before = 0, after = 0, done = 0
      for (let i = 0; i < audioPaths.length; i++) {
        const val = assets[audioPaths[i]]
        setCompressProgress({ index: i + 1, total: audioPaths.length })
        if (val == null) continue
        before += val instanceof Blob ? val.size : String(val).length
        const compressed = await getCompressedAudio(audioPaths[i], val, compressCfg.kbps)
        after += compressed.size
        done++
        // Cede el hilo entre archivo y archivo (ver useCompressedAudioUrls) —
        // también es lo que deja pintar la barra de progreso entre uno y otro.
        await new Promise((r) => setTimeout(r, 0))
      }
      if (!done) { setCompressMsg('No hay audio de locución que comprimir todavía.'); return }
      const pct = before ? Math.round((1 - after / before) * 100) : 0
      const fmtMb = (n: number) => (n / (1024 * 1024)).toFixed(1).replace('.', ',')
      setCompressMsg(`✓ ${done} archivo(s): ${fmtMb(before)} MB → ${fmtMb(after)} MB (-${pct}%). Ya está en caché para Vista estudiante y el export.`)
    } catch (e) {
      setCompressMsg(`Error: ${(e as Error).message}`)
    } finally {
      setCompressBusy(false)
      setCompressProgress(null)
    }
  }

  const willGenerate = onlyMissing
    ? stats.missingAudio + stats.itemsMissingAudio
    : stats.withTranscript + stats.itemsTotal
  // Curso marcado como NO narrado: la generación masiva queda deshabilitada
  // (probable despiste y coste de API); el ajuste está justo encima.
  const narrationOff = course.narration.mode === 'off'

  function onFillTranscripts() {
    const { filled, refreshed } = fillMissingTranscripts()
    if (!filled && !refreshed) { setTrMsg('No había transcripciones vacías ni desactualizadas.'); return }
    const parts: string[] = []
    if (filled) parts.push(`${filled} generada${filled === 1 ? '' : 's'}`)
    if (refreshed) parts.push(`${refreshed} actualizada${refreshed === 1 ? '' : 's'}`)
    setTrMsg(`✓ ${parts.join(' · ')} desde el contenido (revísalas antes de locutar).`)
  }

  // Fuerza la regeneración de TODAS las transcripciones narrables, incluidas
  // las que están al día o no tienen huella (editadas a mano, importadas del
  // GPT…) — el camino para que un cambio de política de narración (qué entra
  // en `buildTranscript`) alcance también a transcripciones que el sistema de
  // huellas no detecta solo como desactualizadas. Pide confirmación porque
  // sobrescribe texto que puede llevar retoques manuales.
  async function onForceRebuildTranscripts() {
    const ok = await confirmDialog({
      title: 'Regenerar TODAS las transcripciones',
      message: 'Se sustituirá la transcripción de cada pantalla narrable por una generada desde su contenido actual, '
        + 'aunque ya estuviera al día o editada a mano (p. ej. retoques de redacción se perderían). '
        + 'Los audios ya generados no se tocan, pero quedarán desactualizados si el texto cambia.',
      confirmLabel: 'Regenerar todas',
    })
    if (!ok) return
    const { filled, refreshed } = fillMissingTranscripts(true)
    if (!filled && !refreshed) { setTrMsg('No había ninguna transcripción que regenerar (sin contenido narrable).'); return }
    const parts: string[] = []
    if (filled) parts.push(`${filled} generada${filled === 1 ? '' : 's'}`)
    if (refreshed) parts.push(`${refreshed} regenerada${refreshed === 1 ? '' : 's'}`)
    setTrMsg(`✓ ${parts.join(' · ')} desde el contenido (revísalas antes de locutar).`)
  }

  // Informa al modal contenedor de si hay una generación en curso (bloquea cierre).
  useEffect(() => {
    onBusyChange?.(busy)
  }, [busy, onBusyChange])

  function update(patch: Partial<TtsConfig>) {
    setCfg(setTtsConfig(patch)) // persiste al instante (proyecto, salvo `keys`: solo localStorage)
  }

  async function onTest() {
    setTestMsg(null)
    if (!(cfg.keys[cfg.provider] || '').trim()) { setTestMsg('Introduce primero la clave de API.'); return }
    setBusy(true)
    try {
      const blob = await synthesize(
        'Hola, esta es una prueba de la voz seleccionada para la narración del curso.',
      )
      const url = URL.createObjectURL(blob)
      if (!audioRef.current) audioRef.current = new Audio()
      audioRef.current.src = url
      await audioRef.current.play()
      setTestMsg('✓ Voz generada correctamente.')
    } catch (e) {
      setTestMsg(`Error: ${(e as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  async function onGenerate() {
    setResult(null)
    setTestMsg(null)
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setBusy(true)
    setProgress({ index: 0, total: willGenerate, title: '' })
    try {
      // Dos fases sobre la misma barra de progreso: primero las pantallas,
      // luego los ítems (accordion/tabs/flip_cards/timeline/image_cards/
      // flashcards) — funciones separadas en tts.ts porque su fuente de texto
      // y su `audio_src` de destino son distintos, pero un único botón/resultado.
      const screensRes = await generateAll({
        onlyMissing,
        signal: ctrl.signal,
        onProgress: (info) => setProgress(info),
      })
      const screensDone = screensRes.done + screensRes.skipped + screensRes.errors.length
      const itemsRes = ctrl.signal.aborted
        ? { done: 0, skipped: 0, errors: [] }
        : await generateAllItems({
            onlyMissing,
            signal: ctrl.signal,
            onProgress: (info) => setProgress({ index: screensDone + info.index, total: willGenerate, title: info.title }),
          })
      setResult({
        done: screensRes.done + itemsRes.done,
        skipped: screensRes.skipped + itemsRes.skipped,
        errors: [...screensRes.errors, ...itemsRes.errors],
      })
    } catch (e) {
      setResult({ done: 0, skipped: 0, errors: [{ id: '', title: '', message: (e as Error).message }] })
    } finally {
      setBusy(false)
      setProgress(null)
      abortRef.current = null
    }
  }

  function onCancel() {
    abortRef.current?.abort()
  }

  const isGemini = cfg.provider === 'gemini'
  // El estilo por texto lo admiten Gemini (todas) y OpenAI gpt-4o-mini-tts.
  const showInstructions = isGemini || cfg.model === 'gpt-4o-mini-tts'

  return (
    <>
          <fieldset className="ed-group">
            <legend>Curso narrado</legend>
            <label className="ed-field">
              <span>¿Este curso lleva locución? Activa los avisos de validación de transcripciones y audios pendientes (se guarda en el proyecto)</span>
              <select value={course.narration.mode} disabled={busy}
                onChange={(e) => updateNarration({ mode: e.target.value as typeof course.narration.mode })}>
                <option value="auto">Automático: narrado si alguna pantalla ya tiene audio</option>
                <option value="on">Sí — avisar de transcripciones y audios pendientes</option>
                <option value="off">No — sin avisos de narración</option>
              </select>
            </label>
          </fieldset>

          <fieldset className="ed-group">
            <legend>Conexión con la API</legend>
            <label className="ed-field">
              <span>Proveedor</span>
              <select value={cfg.provider} disabled={busy}
                onChange={(e) => update(providerDefaults(e.target.value as TtsProvider))}>
                {PROVIDERS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </label>
            <label className="ed-field">
              <span>Clave de API de {isGemini ? 'Google Gemini' : 'OpenAI'} (se guarda por proveedor, solo en este navegador; nunca en el proyecto)</span>
              <input type="password" autoComplete="off" value={cfg.keys[cfg.provider] || ''}
                placeholder={isGemini ? 'Clave de Google AI Studio' : 'sk-…'}
                onChange={(e) => setCfg(setProviderKey(cfg.provider, e.target.value))} />
            </label>
            {isGemini ? (
              <p className="ed-tts-msg">
                Consigue una clave gratis en <strong>aistudio.google.com → Get API key</strong>.
              </p>
            ) : (
              <label className="ed-field">
                <span>Endpoint (deja el valor por defecto para OpenAI; cámbialo para Azure/compatibles)</span>
                <input value={cfg.baseUrl} onChange={(e) => update({ baseUrl: e.target.value })} />
              </label>
            )}
          </fieldset>

          <fieldset className="ed-group">
            <legend>Voz y calidad</legend>
            <p className="ed-hint">
              Se guarda en el proyecto (no en este navegador): todo el equipo locuta con la
              misma voz al abrir el <code>.scormproj</code>. La clave de API es la única
              excepción (arriba), por quedarse solo en este navegador.
            </p>
            <div className="ed-row">
              <label className="ed-field">
                <span>Modelo</span>
                <select value={cfg.model} onChange={(e) => {
                  const model = e.target.value
                  // tts-1/tts-1-hd soportan menos voces que gpt-4o-mini-tts: si la
                  // voz actual deja de ser válida con el modelo nuevo, se ajusta sola.
                  const voices = voicesFor(cfg.provider, model)
                  update({ model, voice: voices.includes(cfg.voice) ? cfg.voice : voices[0] })
                }}>
                  {modelsFor(cfg.provider).map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </label>
              <label className="ed-field">
                <span>Voz</span>
                <select value={cfg.voice} onChange={(e) => update({ voice: e.target.value })}>
                  {voicesFor(cfg.provider, cfg.model).map((v) => <option key={v} value={v}>{voiceLabel(cfg.provider, v)}</option>)}
                </select>
              </label>
              {!isGemini && (
                <>
                  <label className="ed-field ed-field-narrow">
                    <span>Formato</span>
                    <select value={cfg.format} onChange={(e) => update({ format: e.target.value as TtsConfig['format'] })}>
                      {['mp3', 'wav', 'opus', 'aac', 'flac'].map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </label>
                  <label className="ed-field ed-field-narrow">
                    <span>Velocidad</span>
                    <input type="number" min={0.25} max={4} step={0.05} value={cfg.speed}
                      onChange={(e) => update({ speed: Number(e.target.value) })} />
                  </label>
                </>
              )}
            </div>
            {!isGemini && (
              <p className="ed-hint">
                El género entre paréntesis es orientativo (percepción más repetida en la comunidad, no un dato
                oficial de OpenAI: varias voces están pensadas como neutras y para las más nuevas
                (ballad, verse, marin, cedar) aún no hay consenso documentado, por eso no llevan etiqueta).
                Pruébalas en <strong>openai.fm</strong> antes de decidir.
              </p>
            )}
            {showInstructions && (
              <label className="ed-field">
                <span>Indicaciones de tono/estilo — «Vibe» (opcional)</span>
                <textarea rows={5} maxLength={800} value={cfg.instructions}
                  placeholder="p. ej. Tono cercano y didáctico, ritmo pausado."
                  onChange={(e) => update({ instructions: e.target.value })} />
                <span className="ed-hint">
                  {cfg.instructions.length}/800 caracteres. Mismo campo que el «Vibe» de openai.fm: instrucciones en lenguaje natural sobre tono, ritmo,
                  emoción o acento. Se envían junto al texto en cada generación (no se guardan «vibes» predefinidos,
                  escribe las tuyas libremente).
                </span>
              </label>
            )}
            <div className="ed-row">
              <button type="button" onClick={onTest} disabled={busy}><Icon name="play" size={14} /> Probar voz</button>
              {testMsg && <span className="ed-tts-msg">{testMsg}</span>}
            </div>
          </fieldset>

          {/* Oculto (no solo deshabilitado) si el curso no es narrado: a
              diferencia de «Generar todos los audios» (ahí SÍ interesa
              explicar por qué está deshabilitado, porque es como se empieza
              a narrar un curso), comprimir solo tiene sentido una vez la
              narración es cosa asentada del curso, no antes. */}
          {audioPaths.length > 0 && !narrationOff && (
            <fieldset className="ed-group">
              <legend>Compresión del audio de locución</legend>
              <label className="ed-check">
                <input type="checkbox" checked={compressCfg.enabled}
                  onChange={(e) => updateNarration({ compressAudio: { ...compressCfg, enabled: e.target.checked } })} />
                <span>Comprimir el audio al exportar y en Vista estudiante (el proyecto conserva siempre el original a su calidad de generación)</span>
              </label>
              {compressCfg.enabled && (
                <>
                  <label className="ed-field">
                    <span>Nivel de compresión</span>
                    <select value={compressCfg.kbps}
                      onChange={(e) => updateNarration({ compressAudio: { ...compressCfg, kbps: Number(e.target.value) } })}>
                      <option value={64}>Equilibrado (64 kbps) — indistinguible del original para voz</option>
                      <option value={48}>Agresivo (48 kbps) — clara, algo más áspera en consonantes</option>
                      <option value={32}>Máximo (32 kbps) — inteligible, se nota la compresión</option>
                    </select>
                  </label>
                  <p className="ed-hint">
                    Se aplica a TODO el audio de locución, se haya generado hoy o hace meses — no hace falta
                    regenerar nada al cambiar de nivel. «Comprimir ahora» solo adelanta el trabajo (y te dice
                    cuánto se ahorra); si no lo pulsas, se comprime igualmente la primera vez que abras Vista
                    estudiante o exportes.
                  </p>
                  {compressBusy && compressProgress ? (
                    <div className="ed-tts-progress">
                      <div className="ed-tts-bar">
                        <div className="ed-tts-bar-fill"
                          style={{ width: `${compressProgress.total ? (compressProgress.index / compressProgress.total) * 100 : 0}%` }} />
                      </div>
                      <p>Comprimiendo {compressProgress.index}/{compressProgress.total}…</p>
                    </div>
                  ) : (
                    <div className="ed-row">
                      <button type="button" onClick={() => void onCompressNow()} disabled={compressBusy}>
                        <Icon name="refresh" size={14} /> Comprimir ahora
                      </button>
                      {compressMsg && <span className="ed-tts-msg">{compressMsg}</span>}
                    </div>
                  )}
                </>
              )}
            </fieldset>
          )}

          <fieldset className="ed-group">
            <legend>Generar todos los audios</legend>
            {narrationOff && (
              <p className="ed-tts-msg">
                <Icon name="alert-triangle" size={13} /> El curso está marcado como <strong>no narrado</strong>: la generación masiva está
                deshabilitada. Cambia el ajuste «Curso narrado» (arriba) si quieres locutarlo.
              </p>
            )}
            <p className="ed-tts-stats">
              {stats.withTranscript} de {stats.total} pantallas tienen transcripción.
              {' '}{stats.missingAudio} sin audio todavía.
              {stats.missingTranscript > 0 && <>
                {' '}<strong>{stats.missingTranscript} con contenido narrable aún sin transcripción.</strong>
              </>}
              {stats.staleTranscript > 0 && <>
                {' '}<strong>{stats.staleTranscript} transcripción{stats.staleTranscript === 1 ? '' : 'es'} desactualizada{stats.staleTranscript === 1 ? '' : 's'}</strong> (el contenido cambió después).
              </>}
              {stats.staleAudio > 0 && <>
                {' '}<strong>{stats.staleAudio} audio{stats.staleAudio === 1 ? '' : 's'} desactualizado{stats.staleAudio === 1 ? '' : 's'}</strong> (la transcripción cambió después).
              </>}
              {stats.itemsTotal > 0 && <>
                {' '}Además, {stats.itemsTotal} ítem{stats.itemsTotal === 1 ? '' : 's'} de interacciones revelables
                (accordion/tabs/flip_cards/timeline/image_cards/flashcards)
                {' '}— {stats.itemsMissingAudio} sin audio propio todavía.
              </>}
              {audioPaths.length > 0 && <>
                {' '}Duración total del audio generado: {audioDuration.busy ? 'calculando…' : `~${formatEstimatedDuration(audioDurationTotal)}`}
                {audioDuration.unreadable > 0 && ` (${audioDuration.unreadable} archivo(s) no se pudieron medir)`}.
              </>}
            </p>

            {/* Paso previo: transcripciones en bloque. Rellena las VACÍAS y
                REGENERA las desactualizadas (huella no coincide); nunca toca
                una editada a mano que siga al día o sin huella con qué
                comparar, por eso no pide confirmación. */}
            <div className="ed-row">
              <button type="button"
                disabled={busy || narrationOff || (stats.missingTranscript === 0 && stats.staleTranscript === 0)}
                onClick={onFillTranscripts}
                title="Genera la transcripción de las pantallas sin ella y regenera las desactualizadas, a partir del texto y las interacciones informativas">
                <Icon name="refresh" size={14} /> Generar/actualizar transcripciones desde el contenido
                {(stats.missingTranscript > 0 || stats.staleTranscript > 0) && ' ('}
                {stats.missingTranscript > 0 && `${stats.missingTranscript} vacía${stats.missingTranscript === 1 ? '' : 's'}`}
                {stats.missingTranscript > 0 && stats.staleTranscript > 0 && ' · '}
                {stats.staleTranscript > 0 && `${stats.staleTranscript} desactualizada${stats.staleTranscript === 1 ? '' : 's'}`}
                {(stats.missingTranscript > 0 || stats.staleTranscript > 0) && ')'}
              </button>
              {trMsg && <span className="ed-tts-msg">{trMsg}</span>}
            </div>

            {/* Vía de escape para cuando el sistema de huellas no basta: una
                transcripción sin huella (editada a mano, importada del GPT, o
                de antes de este mecanismo) nunca se marca sola como
                desactualizada, así que un cambio de política de narración no
                la alcanza con el botón de arriba. Pide confirmación porque
                sobrescribe texto, sea cual sea su origen. */}
            <div className="ed-row">
              <button type="button" disabled={busy || narrationOff || stats.total === 0}
                onClick={() => void onForceRebuildTranscripts()}
                title="Regenera TODAS las transcripciones narrables desde el contenido actual, también las que ya están al día o no tienen huella (sobrescribe ediciones manuales)">
                <Icon name="refresh" size={14} /> Forzar regeneración de TODAS las transcripciones
              </button>
            </div>

            <label className="ed-check">
              <input type="checkbox" checked={onlyMissing} disabled={busy || narrationOff}
                onChange={(e) => setOnlyMissing(e.target.checked)} />
              <span>Generar solo las que aún no tienen audio (desmarca para regenerar todas —
                {' '}incluye las {stats.staleAudio} desactualizadas)</span>
            </label>

            {busy && progress ? (
              <div className="ed-tts-progress">
                <div className="ed-tts-bar">
                  <div className="ed-tts-bar-fill"
                    style={{ width: `${progress.total ? (progress.index / progress.total) * 100 : 0}%` }} />
                </div>
                <p>Generando {progress.index}/{progress.total}: {progress.title}…</p>
                <button type="button" className="ed-danger" onClick={onCancel}>Cancelar</button>
              </div>
            ) : (
              <div className="ed-row">
                <button type="button" className="ed-primary" disabled={busy || narrationOff || willGenerate === 0}
                  onClick={onGenerate}>
                  Generar {willGenerate} audio{willGenerate === 1 ? '' : 's'}
                </button>
              </div>
            )}

            {result && (
              <div className="ed-tts-result">
                <p>✓ {result.done} generado{result.done === 1 ? '' : 's'}
                  {result.skipped ? ` · ${result.skipped} omitido${result.skipped === 1 ? '' : 's'}` : ''}
                  {result.errors.length ? ` · ${result.errors.length} con error` : ''}.
                </p>
                {result.errors.length > 0 && (
                  <ul className="ed-tts-errors">
                    {result.errors.map((err, i) => (
                      <li key={i}>{err.title ? `${err.title}: ` : ''}{err.message}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </fieldset>

          <p className="ed-disclaimer">
            El audio se guarda en cada pantalla (campo «Audio de la diapositiva») o, para los
            ítems de accordion/tabs/flip_cards/timeline/image_cards/flashcards, en el propio
            ítem — y viaja en el proyecto y en el SCORM exportado. La generación tiene coste
            según tu proveedor de API.
          </p>
    </>
  )
}
