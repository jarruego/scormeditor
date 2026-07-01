import { useCourseStore } from '../store/courseStore'
import { ScreenType, InteractionType, type Interaction } from '../schema/course.schema'
import { RichTextArea } from './RichTextArea'
import { InteractionConfigEditor } from './InteractionConfigEditor'
import { FileButton } from './FileButton'

const LAYOUTS: { value: 'top' | 'bottom' | 'left' | 'right'; label: string }[] = [
  { value: 'top', label: 'Arriba del texto' },
  { value: 'bottom', label: 'Debajo del texto' },
  { value: 'left', label: 'A la izquierda' },
  { value: 'right', label: 'A la derecha' },
]

export function ScreenEditor() {
  const id = useCourseStore((s) => s.selectedScreenId)
  const screen = useCourseStore((s) => (id ? s.getScreen(id) : null))
  const update = useCourseStore((s) => s.updateScreen)

  if (!id || !screen) return <div className="ed-empty">Selecciona una pantalla en el árbol para editarla.</div>

  const patch = (p: Parameters<typeof update>[1]) => update(id, p)
  const vr = screen.visual_resource
  const it = screen.interaction
  const setVr = (p: Partial<typeof vr>) => patch({ visual_resource: { ...vr, ...p } })
  const setTracks = (tracks: typeof vr.tracks) => setVr({ tracks })

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
      learning_objective: '',
      source_refs: [],
    }
  }

  return (
    <div className="ed-form">
      <h2>Editar pantalla</h2>

      <label className="ed-field">
        <span>Título</span>
        <input value={screen.title} onChange={(e) => patch({ title: e.target.value })} />
      </label>

      <div className="ed-row">
        <label className="ed-field">
          <span>Tipo de pantalla</span>
          <select value={screen.type} onChange={(e) => patch({ type: e.target.value as any })}>
            {ScreenType.options.map((t) => <option key={t} value={t}>{t}</option>)}
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
        <input value={screen.objective} onChange={(e) => patch({ objective: e.target.value })} />
      </label>

      <label className="ed-field">
        <span>Texto del estudiante (texto enriquecido: encabezados, negrita, cursiva, enlaces, listas y destacados)</span>
        <RichTextArea value={screen.student_text} onChange={(v) => patch({ student_text: v })} />
      </label>

      <fieldset className="ed-group">
        <legend>Recurso visual</legend>
        <div className="ed-row">
          <label className="ed-field">
            <span>Tipo</span>
            <select value={vr.kind} onChange={(e) => setVr({ kind: e.target.value as any })}>
              {['none', 'image', 'video_youtube', 'video_file', 'audio'].map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </label>
          {vr.kind !== 'none' && (
            <label className="ed-field">
              <span>{vr.kind === 'video_youtube' ? 'ID de YouTube' : 'Ruta del archivo (assets/…)'}</span>
              <input value={vr.src} onChange={(e) => setVr({ src: e.target.value })} />
            </label>
          )}
          {vr.kind === 'image' && (
            <FileButton accept="image/*" label="Subir imagen…"
              makePath={(ext) => `assets/img/${screen.id}.${ext}`} onUploaded={(p) => setVr({ src: p })} />
          )}
          {vr.kind === 'video_file' && (
            <FileButton accept="video/*" label="Subir vídeo…"
              makePath={(ext) => `assets/media/${screen.id}_video.${ext}`} onUploaded={(p) => setVr({ src: p })} />
          )}
          {vr.kind === 'audio' && (
            <FileButton accept="audio/*" label="Subir audio…"
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
            <FileButton accept="image/*" label="Subir póster…"
              makePath={(ext) => `assets/img/${screen.id}_poster.${ext}`} onUploaded={(p) => setVr({ poster: p })} />
          </div>
        )}

        {vr.kind !== 'none' && vr.kind !== 'audio' && (
          <div className="ed-row">
            <label className="ed-field">
              <span>Disposición respecto al texto</span>
              <select value={vr.layout} onChange={(e) => setVr({ layout: e.target.value as any })}>
                {LAYOUTS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </label>
            {(vr.layout === 'left' || vr.layout === 'right') && (
              <label className="ed-field">
                <span>Proporción (ancho del recurso)</span>
                <select value={vr.media_width} onChange={(e) => setVr({ media_width: e.target.value as any })}>
                  <option value="33">Recurso 33% · texto 66%</option>
                  <option value="50">Recurso 50% · texto 50%</option>
                  <option value="66">Recurso 66% · texto 33%</option>
                </select>
              </label>
            )}
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
                      <FileButton accept=".vtt,text/vtt" label="Subir VTT…"
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
      </fieldset>

      <fieldset className="ed-group">
        <legend>Audio de locución y transcripción</legend>
        <div className="ed-row">
          <label className="ed-field">
            <span>Audio de la diapositiva (assets/media/…)</span>
            <input value={screen.audio_src} placeholder="assets/media/s01_narracion.mp3"
              onChange={(e) => patch({ audio_src: e.target.value })} />
          </label>
          <FileButton accept="audio/*" label="Subir audio…"
            makePath={(ext) => `assets/media/${screen.id}_narracion.${ext}`} onUploaded={(p) => patch({ audio_src: p })} />
          {screen.audio_src && (
            <button type="button" className="ed-danger" onClick={() => patch({ audio_src: '' })}>Quitar</button>
          )}
        </div>
        <label className="ed-field">
          <span>Transcripción (se muestra SOLO con el botón «Transcripción»; alternativa textual del audio)</span>
          <textarea rows={3} value={screen.transcript} onChange={(e) => patch({ transcript: e.target.value })} />
        </label>
      </fieldset>

      <fieldset className="ed-group">
        <legend>Interacción</legend>
        {!it ? (
          <button onClick={() => setInteraction(blankInteraction())}>+ Añadir interacción</button>
        ) : (
          <>
            <div className="ed-row">
              <label className="ed-field">
                <span>Tipo</span>
                <select value={it.type} onChange={(e) => setInteraction({ ...it, type: e.target.value as any })}>
                  {InteractionType.options.map((t) => <option key={t} value={t}>{t}</option>)}
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
              {['single_choice', 'true_false', 'sort_steps', 'match_pairs', 'classification'].includes(it.type) && (
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
              <input value={it.learning_objective} onChange={(e) => setInteraction({ ...it, learning_objective: e.target.value })} /></label>

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
      </fieldset>

      {screen.source_refs.length > 0 && (
        <div className="ed-sources">
          <p>Trazabilidad (source_refs):</p>
          <ul>{screen.source_refs.map((r, i) => <li key={i}>{r.doc}{r.locator ? ` · ${r.locator}` : ''}{r.transform ? ` · ${r.transform}` : ''}</li>)}</ul>
        </div>
      )}
    </div>
  )
}
