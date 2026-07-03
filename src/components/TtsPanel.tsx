import { useEffect, useMemo, useRef, useState } from 'react'
import { useCourseStore } from '../store/courseStore'
import {
  generateAll,
  getTtsConfig,
  listNarratable,
  modelsFor,
  providerDefaults,
  PROVIDERS,
  setProviderKey,
  setTtsConfig,
  synthesize,
  voicesFor,
  type BulkResult,
  type TtsConfig,
  type TtsProvider,
} from '../tts/tts'

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
  const [cfg, setCfg] = useState<TtsConfig>(() => getTtsConfig())
  const [busy, setBusy] = useState(false)
  const [onlyMissing, setOnlyMissing] = useState(true)
  const [progress, setProgress] = useState<{ index: number; total: number; title: string } | null>(null)
  const [result, setResult] = useState<BulkResult | null>(null)
  const [testMsg, setTestMsg] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Recuento reactivo (depende del curso).
  const stats = useMemo(() => {
    void course
    const list = listNarratable()
    const withTranscript = list.filter((s) => s.hasTranscript)
    return {
      total: list.length,
      withTranscript: withTranscript.length,
      missingAudio: withTranscript.filter((s) => !s.hasAudio).length,
    }
  }, [course])

  const willGenerate = onlyMissing ? stats.missingAudio : stats.withTranscript

  // Informa al modal contenedor de si hay una generación en curso (bloquea cierre).
  useEffect(() => {
    onBusyChange?.(busy)
  }, [busy, onBusyChange])

  function update(patch: Partial<TtsConfig>) {
    setCfg(setTtsConfig(patch)) // persiste al instante en localStorage
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
      setTestMsg(`⛔ ${(e as Error).message}`)
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
      const res = await generateAll({
        onlyMissing,
        signal: ctrl.signal,
        onProgress: (info) => setProgress(info),
      })
      setResult(res)
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
            <div className="ed-row">
              <label className="ed-field">
                <span>Modelo</span>
                <select value={cfg.model} onChange={(e) => update({ model: e.target.value })}>
                  {modelsFor(cfg.provider).map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </label>
              <label className="ed-field">
                <span>Voz</span>
                <select value={cfg.voice} onChange={(e) => update({ voice: e.target.value })}>
                  {voicesFor(cfg.provider).map((v) => <option key={v} value={v}>{v}</option>)}
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
            {showInstructions && (
              <label className="ed-field">
                <span>Indicaciones de tono/estilo (opcional)</span>
                <input value={cfg.instructions} placeholder="p. ej. Tono cercano y didáctico, ritmo pausado."
                  onChange={(e) => update({ instructions: e.target.value })} />
              </label>
            )}
            <div className="ed-row">
              <button type="button" onClick={onTest} disabled={busy}>▶ Probar voz</button>
              {testMsg && <span className="ed-tts-msg">{testMsg}</span>}
            </div>
          </fieldset>

          <fieldset className="ed-group">
            <legend>Generar todos los audios</legend>
            <p className="ed-tts-stats">
              {stats.withTranscript} de {stats.total} pantallas tienen transcripción.
              {' '}{stats.missingAudio} sin audio todavía.
            </p>
            <label className="ed-check">
              <input type="checkbox" checked={onlyMissing} disabled={busy}
                onChange={(e) => setOnlyMissing(e.target.checked)} />
              <span>Generar solo las que aún no tienen audio (desmarca para regenerar todas)</span>
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
                <button type="button" className="ed-primary" disabled={busy || willGenerate === 0}
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
            El audio se guarda en cada pantalla (campo «Audio de la diapositiva») y viaja en el
            proyecto y en el SCORM exportado. La generación tiene coste según tu proveedor de API.
          </p>
    </>
  )
}
