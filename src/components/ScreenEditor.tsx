import { useState, useEffect, useMemo } from 'react'
import { useCourseStore } from '../store/courseStore'
import { validateCourse } from '../validation/validators'
import { ScreenType, InteractionType, type Interaction } from '../schema/course.schema'
import { screenTypeLabel, interactionTypeLabel } from '../schema/labels'
import { RichTextArea } from './RichTextArea'
import { InteractionConfigEditor } from './InteractionConfigEditor'
import { ObjectiveInput, ObjectiveSelect } from './ObjectiveSelect'
import { FileButton } from './FileButton'
import { generateForScreen, hasApiKey } from '../tts/tts'
import { buildTranscript } from '../tts/buildTranscript'
import { confirmDialog } from '../store/confirm'
import type { AssetMap } from '../export/exportScorm'

// Controles compactos con iconos (title/aria-label describen la acción) en vez de selects.
const KIND_ICONS = [
  { value: 'none', icon: '🚫', title: 'Sin recurso' },
  { value: 'image', icon: '🖼️', title: 'Imagen' },
  { value: 'video_youtube', icon: '▶️', title: 'Vídeo de YouTube' },
  { value: 'video_file', icon: '🎬', title: 'Vídeo (archivo)' },
  { value: 'audio', icon: '🔊', title: 'Audio' },
]
const LAYOUT_ICONS = [
  { value: 'top', icon: '⬆️', title: 'Arriba del texto' },
  { value: 'bottom', icon: '⬇️', title: 'Debajo del texto' },
  { value: 'left', icon: '⬅️', title: 'A la izquierda del texto' },
  { value: 'right', icon: '➡️', title: 'A la derecha del texto' },
]
const WIDTH_ICONS = [
  { value: '33', icon: '⅓', title: 'Recurso 33% · texto 66%' },
  { value: '50', icon: '½', title: 'Recurso 50% · texto 50%' },
  { value: '66', icon: '⅔', title: 'Recurso 66% · texto 33%' },
]
// Ajuste del recurso en top/bottom (estados excluyentes: al estirar al 100% el
// centrado ya no aplica). Mapea a media_align + media_full.
const FIT_ICONS = [
  { value: 'left', icon: '◧', title: 'Alineada a la izquierda' },
  { value: 'center', icon: '▣', title: 'Centrada' },
  { value: 'full', icon: '▬', title: 'Ancho completo (100%)' },
]

function SegIcons({ label, value, options, onChange }: {
  label: string
  value: string
  options: { value: string; icon: string; title: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div className="ed-field ed-field-auto">
      <span>{label}</span>
      <div className="ed-seg" role="group" aria-label={label}>
        {options.map((o) => (
          <button key={o.value} type="button" className={value === o.value ? 'is-on' : ''}
            aria-pressed={value === o.value} title={o.title} aria-label={o.title}
            onClick={() => onChange(o.value)}>
            <span aria-hidden="true">{o.icon}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// Crea (y libera) un object URL para un asset, para la vista previa. Normaliza el
// valor del AssetMap a Blob igual que StudentPreview (puede ser Blob/bytes/string).
function useObjectUrl(val: AssetMap[string] | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (val == null) { setUrl(null); return }
    const blob = val instanceof Blob ? val : new Blob([val as BlobPart])
    const u = URL.createObjectURL(blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [val])
  return url
}

function MediaPreview({ vr, assets }: { vr: any; assets: AssetMap }) {
  const fileBacked = vr.kind === 'image' || vr.kind === 'video_file' || vr.kind === 'audio'
  const url = useObjectUrl(fileBacked ? assets[vr.src] : undefined)
  const posterUrl = useObjectUrl(vr.poster ? assets[vr.poster] : undefined)

  if (vr.kind === 'none') return null
  if (vr.kind === 'video_youtube') {
    if (!vr.src) return null
    return (
      <div className="ed-media-preview">
        <iframe className="ed-media-yt" src={`https://www.youtube.com/embed/${vr.src}`}
          title="Vista previa de YouTube" allowFullScreen loading="lazy" />
      </div>
    )
  }
  if (!vr.src) return null
  if (!url) return <p className="ed-media-empty">Sin archivo subido para «{vr.src}». Súbelo para ver la vista previa.</p>
  return (
    <div className="ed-media-preview">
      {vr.kind === 'image' && <img className="ed-media-img" src={url} alt={vr.alt || 'Vista previa'} />}
      {vr.kind === 'video_file' && <video className="ed-media-vid" src={url} poster={posterUrl || undefined} controls />}
      {vr.kind === 'audio' && <audio className="ed-media-aud" src={url} controls />}
    </div>
  )
}

export function ScreenEditor() {
  const id = useCourseStore((s) => s.selectedScreenId)
  const screen = useCourseStore((s) => (id ? s.getScreen(id) : null))
  const update = useCourseStore((s) => s.updateScreen)
  const assets = useCourseStore((s) => s.assets)
  const removeAsset = useCourseStore((s) => s.removeAsset)
  const course = useCourseStore((s) => s.course)
  const [ttsBusy, setTtsBusy] = useState(false)
  const [ttsMsg, setTtsMsg] = useState<string | null>(null)

  // Issues de validación de ESTA pantalla (validación en contexto, no solo en
  // la pestaña Validación).
  const screenIssues = useMemo(
    () => (id ? validateCourse(course).issues.filter((i) => i.screenId === id && i.severity !== 'info') : []),
    [course, id],
  )

  if (!id || !screen) return <div className="ed-empty">Selecciona una pantalla en el árbol para editarla.</div>

  async function onGenerateAudio() {
    if (!id) return
    setTtsMsg(null)
    if (!hasApiKey()) {
      setTtsMsg('⛔ Falta la clave de API. Configúrala en «⚙ Ajustes → Narración» de la barra superior.')
      return
    }
    setTtsBusy(true)
    try {
      await generateForScreen(id)
      setTtsMsg('✓ Audio generado desde la transcripción.')
    } catch (e) {
      setTtsMsg(`⛔ ${(e as Error).message}`)
    } finally {
      setTtsBusy(false)
    }
  }

  const patch = (p: Parameters<typeof update>[1]) => update(id, p)
  const vr = screen.visual_resource
  const it = screen.interaction
  const setVr = (p: Partial<typeof vr>) => patch({ visual_resource: { ...vr, ...p } })
  const setTracks = (tracks: typeof vr.tracks) => setVr({ tracks })

  // Cambia el tipo de recurso. Al pasar a «Sin recurso», ofrece borrar los
  // binarios asociados de assets (irrecuperable) con aviso previo.
  async function changeKind(next: string) {
    if (next === vr.kind) return
    if (next === 'none') {
      const paths = [vr.src, vr.poster, ...vr.tracks.map((t) => t.src)]
        .filter((p): p is string => !!p && !!assets[p])
      if (paths.length) {
        const ok = await confirmDialog({
          title: 'Quitar recurso',
          message: 'Se borrará el archivo asociado de assets sin poder recuperarlo. ¿Deseas continuar?',
          confirmLabel: 'Quitar',
          danger: true,
        })
        if (!ok) return
        paths.forEach((p) => removeAsset(p))
      }
      setVr({ kind: 'none', src: '' })
      return
    }
    setVr({ kind: next as any })
  }

  // Regenera la transcripción a partir del contenido de la pantalla. Si hay un
  // audio de locución asociado, dejará de corresponderse con el texto: se avisa
  // y se ofrece regenerarlo con TTS en el momento.
  async function onRebuildTranscript() {
    if (!screen) return
    const next = buildTranscript(screen)
    if (!next.trim()) {
      setTtsMsg('⚠ La pantalla no tiene texto ni interacciones informativas de las que generar la transcripción.')
      return
    }
    if (screen.transcript.trim() && screen.transcript.trim() !== next.trim()) {
      const ok = await confirmDialog({
        title: 'Regenerar transcripción',
        message: 'Se sustituirá la transcripción actual por una generada a partir del texto del estudiante y las interacciones informativas de esta pantalla.',
        confirmLabel: 'Regenerar',
      })
      if (!ok) return
    }
    patch({ transcript: next })
    setTtsMsg('✓ Transcripción regenerada desde el contenido.')
    if (screen.audio_src) {
      const regen = await confirmDialog({
        title: 'Audio desactualizado',
        message: 'Esta diapositiva tiene un audio de locución que ya no se corresponde con la nueva transcripción. ¿Quieres regenerar el audio ahora con la voz IA?',
        confirmLabel: 'Regenerar audio',
        cancelLabel: 'Mantener el audio',
      })
      if (regen) await onGenerateAudio()
      else setTtsMsg('⚠ El audio actual ya no se corresponde con la transcripción regenerada.')
    }
  }

  function setInteraction(next: Interaction | null) {
    patch({ interaction: next })
  }
  function blankInteraction(): Interaction {
    return {
      id: `i-${Math.random().toString(36).slice(2, 7)}`,
      type: 'single_choice',
      prompt: '',
      instructions: '',
      options: [],
      config: {},
      feedback: { correct: 'Correcto.', incorrect: 'Revisa tu respuesta.', explanation: '' },
      scored: true,
      points: 1,
      attempts: 1,
      retries: 0,
      // Prerrelleno: casi siempre la interacción evalúa el objetivo de su
      // propia pantalla (se puede cambiar en el desplegable si no es el caso).
      learning_objective: screen?.objective.trim() ?? '',
      source_refs: [],
    }
  }

  return (
    <div className="ed-form">
      <h2>Editar pantalla</h2>

      {screenIssues.length > 0 && (
        <ul className="ed-inline-issues" aria-label="Avisos de validación de esta pantalla">
          {screenIssues.map((i, n) => (
            <li key={n} className={i.severity === 'error' ? 'is-err' : 'is-warn'}>
              {i.severity === 'error' ? '⛔' : '⚠'} {i.message}
            </li>
          ))}
        </ul>
      )}

      <label className="ed-field">
        <span>Título</span>
        <input value={screen.title} onChange={(e) => patch({ title: e.target.value })} />
      </label>

      <div className="ed-row">
        <label className="ed-field">
          <span>Tipo de pantalla</span>
          <select value={screen.type} onChange={(e) => patch({ type: e.target.value as any })}>
            {ScreenType.options.map((t) => <option key={t} value={t}>{screenTypeLabel(t)}</option>)}
          </select>
        </label>
        <label className="ed-field ed-field-narrow">
          <span>Tiempo mín. (s)</span>
          <input type="number" min={0} value={screen.min_time_seconds}
            onChange={(e) => patch({ min_time_seconds: Number(e.target.value) })} />
        </label>
        <label className="ed-check">
          <input type="checkbox" checked={screen.required} onChange={(e) => patch({ required: e.target.checked })} />
          <span>Obligatoria</span>
        </label>
      </div>

      <label className="ed-field">
        <span>Objetivo de aprendizaje</span>
        <ObjectiveInput value={screen.objective} onChange={(v) => patch({ objective: v })} />
      </label>

      <label className="ed-field">
        <span>Texto del estudiante (texto enriquecido: encabezados, negrita, cursiva, enlaces, listas y destacados)</span>
        <RichTextArea rows={16} value={screen.student_text} onChange={(v) => patch({ student_text: v })} />
      </label>

      <details className="ed-fold" open>
        <summary>Recurso visual</summary>
        <div className="ed-fold-body">
        <div className="ed-row">
          <SegIcons label="Tipo de recurso" value={vr.kind}
            onChange={changeKind} options={KIND_ICONS} />
        </div>

        {vr.kind !== 'none' && (
          <div className="ed-media-layout">
            {/* Columna izquierda: ruta/subir, pie, alt, póster */}
            <div className="ed-media-fields">
              <div className="ed-row">
                <label className="ed-field">
                  <span>{vr.kind === 'video_youtube' ? 'ID de YouTube' : 'Ruta del archivo (assets/…)'}</span>
                  <input value={vr.src} onChange={(e) => setVr({ src: e.target.value })} />
                </label>
                {vr.kind === 'image' && (
                  <FileButton accept="image/*" label="Subir imagen…" currentPath={vr.src}
                    makePath={(ext) => `assets/img/${screen.id}.${ext}`} onUploaded={(p) => setVr({ src: p })} />
                )}
                {vr.kind === 'video_file' && (
                  <FileButton accept="video/*" label="Subir vídeo…" currentPath={vr.src}
                    makePath={(ext) => `assets/media/${screen.id}_video.${ext}`} onUploaded={(p) => setVr({ src: p })} />
                )}
                {vr.kind === 'audio' && (
                  <FileButton accept="audio/*" label="Subir audio…" currentPath={vr.src}
                    makePath={(ext) => `assets/media/${screen.id}_audio.${ext}`} onUploaded={(p) => setVr({ src: p })} />
                )}
              </div>

              {(vr.kind === 'image' || vr.kind === 'video_youtube' || vr.kind === 'video_file') && (
                <label className="ed-field"><span>Pie / leyenda (caption)</span>
                  <input value={vr.caption || ''} onChange={(e) => setVr({ caption: e.target.value })} /></label>
              )}
              {vr.kind === 'image' && (
                <label className="ed-field"><span>Texto alternativo (alt) — obligatorio</span>
                  <input value={vr.alt} onChange={(e) => setVr({ alt: e.target.value })} /></label>
              )}
              {vr.kind === 'video_file' && (
                <div className="ed-row">
                  <label className="ed-field"><span>Póster (imagen, assets/img/…)</span>
                    <input value={vr.poster || ''} onChange={(e) => setVr({ poster: e.target.value })} /></label>
                  <FileButton accept="image/*" label="Subir póster…" currentPath={vr.poster}
                    makePath={(ext) => `assets/img/${screen.id}_poster.${ext}`} onUploaded={(p) => setVr({ poster: p })} />
                </div>
              )}
            </div>

            {/* Columna derecha: vista previa + disposición/proporción debajo */}
            <div className="ed-media-side">
              <MediaPreview vr={vr} assets={assets} />
              {vr.kind !== 'audio' && (
                <div className="ed-media-controls">
                  <SegIcons label="Disposición" value={vr.layout}
                    onChange={(l) => setVr({ layout: l as any })} options={LAYOUT_ICONS} />
                  {(vr.layout === 'left' || vr.layout === 'right') && (
                    <SegIcons label="Proporción" value={vr.media_width}
                      onChange={(w) => setVr({ media_width: w as any })} options={WIDTH_ICONS} />
                  )}
                  {(vr.layout === 'top' || vr.layout === 'bottom') && (
                    <SegIcons label="Ajuste" options={FIT_ICONS}
                      value={vr.media_full ? 'full' : vr.media_align === 'center' ? 'center' : 'left'}
                      onChange={(v) => setVr(v === 'full' ? { media_full: true } : { media_full: false, media_align: v as any })} />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {(vr.kind === 'video_file' || vr.kind === 'audio') && (
          <>
            <label className="ed-check">
              <input type="checkbox" checked={vr.has_voice} onChange={(e) => setVr({ has_voice: e.target.checked })} />
              <span>Contiene voz (exige subtítulos VTT)</span>
            </label>
            <div className="ed-options">
              <p className="ed-options-head">Subtítulos / pistas (VTT)</p>
              {vr.tracks.map((t, i) => {
                const updateTrack = (next: typeof t) => setTracks(vr.tracks.map((x, j) => (j === i ? next : x)))
                return (
                  <div key={i} className="ed-option-row ed-config-row">
                    <div className="ed-config-fields">
                      <input style={{ maxWidth: 70 }} value={t.lang} placeholder="es" onChange={(e) => updateTrack({ ...t, lang: e.target.value })} />
                      <input value={t.label} placeholder="Etiqueta (Español)" onChange={(e) => updateTrack({ ...t, label: e.target.value })} />
                      <input value={t.src} placeholder="assets/media/….vtt" onChange={(e) => updateTrack({ ...t, src: e.target.value })} />
                      <FileButton accept=".vtt,text/vtt" label="Subir VTT…" currentPath={t.src}
                        makePath={() => `assets/media/${screen.id}_${t.lang || 'es'}.vtt`} onUploaded={(p) => updateTrack({ ...t, src: p })} />
                    </div>
                    <button type="button" onClick={() => setTracks(vr.tracks.filter((_, j) => j !== i))} aria-label="Eliminar">✕</button>
                  </div>
                )
              })}
              <button type="button" onClick={() => setTracks([...vr.tracks, { lang: 'es', label: 'Español', src: '', kind: 'subtitles' }])}>+ Añadir subtítulo</button>
            </div>
          </>
        )}
        </div>
      </details>

      <details className="ed-fold">
        <summary>Audio de locución y transcripción</summary>
        <div className="ed-fold-body">
        <div className="ed-row">
          <label className="ed-field">
            <span>Audio de la diapositiva (assets/media/…)</span>
            <input value={screen.audio_src} placeholder="assets/media/s01_narracion.mp3"
              onChange={(e) => patch({ audio_src: e.target.value })} />
          </label>
          <FileButton accept="audio/*" label="Subir audio…" currentPath={screen.audio_src}
            makePath={(ext) => `assets/media/${screen.id}_narracion.${ext}`} onUploaded={(p) => patch({ audio_src: p })} />
          {screen.audio_src && (
            <button type="button" className="ed-danger" onClick={() => patch({ audio_src: '' })}>Quitar</button>
          )}
        </div>
        <label className="ed-field">
          <span>Transcripción (se muestra SOLO con el botón «Transcripción»; alternativa textual del audio)</span>
          <textarea rows={3} value={screen.transcript} onChange={(e) => patch({ transcript: e.target.value })} />
        </label>
        <div className="ed-row">
          <button type="button" disabled={ttsBusy}
            onClick={() => void onRebuildTranscript()}
            title="Genera la transcripción a partir del texto del estudiante y las interacciones informativas de la pantalla">
            ↻ {screen.transcript.trim() ? 'Regenerar' : 'Generar'} transcripción desde el contenido
          </button>
          <button type="button" className="ed-primary" disabled={ttsBusy || !screen.transcript.trim()}
            onClick={onGenerateAudio}
            title={screen.transcript.trim() ? 'Genera el audio con voz a partir de la transcripción' : 'Escribe primero una transcripción'}>
            {ttsBusy ? 'Generando…' : screen.audio_src ? '🔊 Regenerar audio desde la transcripción' : '🔊 Generar audio desde la transcripción'}
          </button>
          {ttsMsg && <span className="ed-tts-msg">{ttsMsg}</span>}
        </div>
        </div>
      </details>

      <details className="ed-fold">
        <summary>Interacción</summary>
        <div className="ed-fold-body">
        {!it ? (
          <button onClick={() => setInteraction(blankInteraction())}>+ Añadir interacción</button>
        ) : (
          <>
            <div className="ed-row">
              <label className="ed-field">
                <span>Tipo</span>
                <select value={it.type} onChange={(e) => setInteraction({ ...it, type: e.target.value as any })}>
                  {InteractionType.options.map((t) => <option key={t} value={t}>{interactionTypeLabel(t)}</option>)}
                </select>
              </label>
              <label className="ed-field ed-field-narrow">
                <span>Posición</span>
                <select value={screen.interaction_layout} onChange={(e) => patch({ interaction_layout: e.target.value as any })}>
                  <option value="bottom">Debajo del texto</option>
                  <option value="top">Encima del texto</option>
                </select>
              </label>
              <label className="ed-check">
                <input type="checkbox" checked={it.scored} onChange={(e) => setInteraction({ ...it, scored: e.target.checked })} />
                <span>Evaluable</span>
              </label>
              <label className="ed-field ed-field-narrow">
                <span>Puntos</span>
                <input type="number" min={0} value={it.points} onChange={(e) => setInteraction({ ...it, points: Number(e.target.value) })} />
              </label>
              {['single_choice', 'true_false', 'sort_steps', 'match_pairs', 'classification', 'fill_blanks'].includes(it.type) && (
                <label className="ed-field ed-field-narrow">
                  <span>Intentos (0=∞)</span>
                  <input type="number" min={0} value={it.attempts}
                    onChange={(e) => setInteraction({ ...it, attempts: Number(e.target.value) })} />
                </label>
              )}
            </div>
            <label className="ed-field"><span>Enunciado</span>
              <input value={it.prompt} onChange={(e) => setInteraction({ ...it, prompt: e.target.value })} /></label>
            <label className="ed-field"><span>Instrucciones</span>
              <input value={it.instructions} onChange={(e) => setInteraction({ ...it, instructions: e.target.value })} /></label>
            <label className="ed-field"><span>Objetivo vinculado</span>
              <ObjectiveSelect value={it.learning_objective} onChange={(v) => setInteraction({ ...it, learning_objective: v })} /></label>

            <InteractionConfigEditor it={it} onChange={setInteraction} />

            <label className="ed-field"><span>Feedback acierto</span>
              <input value={it.feedback.correct} onChange={(e) => setInteraction({ ...it, feedback: { ...it.feedback, correct: e.target.value } })} /></label>
            <label className="ed-field"><span>Feedback error</span>
              <input value={it.feedback.incorrect} onChange={(e) => setInteraction({ ...it, feedback: { ...it.feedback, incorrect: e.target.value } })} /></label>
            <label className="ed-field"><span>Explicación pedagógica</span>
              <RichTextArea rows={2} value={it.feedback.explanation} onChange={(v) => setInteraction({ ...it, feedback: { ...it.feedback, explanation: v } })} /></label>

            <button className="ed-danger" onClick={() => setInteraction(null)}>Eliminar interacción</button>
          </>
        )}
        </div>
      </details>

      {screen.source_refs.length > 0 && (
        <div className="ed-sources">
          <p>Trazabilidad (source_refs):</p>
          <ul>{screen.source_refs.map((r, i) => <li key={i}>{r.doc}{r.locator ? ` · ${r.locator}` : ''}{r.transform ? ` · ${r.transform}` : ''}</li>)}</ul>
        </div>
      )}
    </div>
  )
}
