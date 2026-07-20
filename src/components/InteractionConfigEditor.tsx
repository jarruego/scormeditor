import { useState } from 'react'
import type { Interaction, InteractionOption } from '../schema/course.schema'
import { RichTextArea } from './RichTextArea'
import { FileButton } from './FileButton'
import { HotspotZonesModal, type HotspotSpot } from './HotspotZonesModal'
import { ListEditor } from './ListEditor'
import { SegIcons } from './SegIcons'
import { Icon } from './Icon'
import { generateForItem, hasApiKey } from '../tts/tts'

const rid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 7)}`

/** Ítem narrable (accordion/tabs/flip_cards/timeline/image_cards/flashcards):
 *  botón para generar/regenerar el audio de UN ítem a partir de su propio
 *  texto visible (sin transcripción de ítem aparte). Si el ítem aún no tiene
 *  `id` estable (proyectos antiguos/importados del GPT), se lo asigna en el
 *  momento — el runtime y `tts.ts` lo necesitan para anclar el `audio_src`.
 */
function ItemAudioButton({
  screenId,
  interactionId,
  audioSrc,
  ensureId,
}: {
  screenId: string
  interactionId: string
  audioSrc?: string
  ensureId: () => string
}) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  async function onClick() {
    setErr(null)
    if (!hasApiKey()) { setErr('Falta la clave de API (Ajustes → Narración).'); return }
    setBusy(true)
    try {
      await generateForItem(screenId, interactionId, ensureId())
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <span className="ed-row">
      <button type="button" onClick={onClick} disabled={busy}>
        {busy ? 'Generando…' : audioSrc ? '🔊 Regenerar audio' : '🔊 Generar audio'}
      </button>
      {err && <span className="ed-tts-msg">{err}</span>}
    </span>
  )
}

/** Genera de una vez los audios pendientes de todos los ítems de la
 *  interacción (los que ya tienen audio se saltan). */
function BulkItemAudioButton({
  screenId,
  interactionId,
  items,
  ensureIds,
}: {
  screenId: string
  interactionId: string
  items: { id?: string; audio_src?: string }[]
  ensureIds: () => { id: string; audio_src?: string }[]
}) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  if (!items.length) return null
  const missing = items.filter((x) => !x.audio_src).length
  async function onClick() {
    setMsg(null)
    if (!hasApiKey()) { setMsg('Falta la clave de API (Ajustes → Narración).'); return }
    setBusy(true)
    try {
      const withIds = ensureIds()
      let done = 0
      for (const x of withIds) {
        if (x.audio_src) continue
        await generateForItem(screenId, interactionId, x.id)
        done++
      }
      setMsg(done ? `✓ ${done} audio(s) generado(s).` : 'Ya estaban todos generados.')
    } catch (e) {
      setMsg((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="ed-row">
      <button type="button" onClick={onClick} disabled={busy || missing === 0}>
        {busy ? 'Generando…' : `🔊 Generar audios de ítem pendientes (${missing})`}
      </button>
      {msg && <span className="ed-tts-msg">{msg}</span>}
    </div>
  )
}

/**
 * Editor de la parte específica (`config` / `options`) de cada tipo de
 * interacción. Se monta dentro del editor de pantalla.
 */
export function InteractionConfigEditor({
  it,
  screenId,
  onChange,
}: {
  it: Interaction
  screenId: string
  onChange: (next: Interaction) => void
}) {
  const cfg: Record<string, any> = it.config || {}
  const setConfig = (patch: Record<string, any>) => onChange({ ...it, config: { ...cfg, ...patch } })
  const setOptions = (options: InteractionOption[]) => onChange({ ...it, options })
  // Modal del editor visual de zonas (solo lo usa el caso `hotspots`; el hook
  // vive aquí porque dentro del switch no puede haber hooks).
  const [zonesOpen, setZonesOpen] = useState(false)

  switch (it.type) {
    // ---- Elección simple / Verdadero-Falso --------------------------------
    case 'single_choice':
    case 'true_false':
      return (
        <ListEditor
          title="Opciones de respuesta"
          items={it.options}
          onChange={(options) => setOptions(options as InteractionOption[])}
          create={() => ({ id: rid('o'), text: '', correct: false })}
          render={(o, update) => (
            <>
              <input value={o.text} placeholder="Texto de la opción" onChange={(e) => update({ ...o, text: e.target.value })} />
              <label className="ed-check" title="Puede haber varias correctas: cualquiera de ellas cuenta como acierto (en el test final, en cambio, solo hay una)"><input type="checkbox" checked={!!o.correct} onChange={(e) => update({ ...o, correct: e.target.checked })} /><span>Correcta</span></label>
              <input value={o.feedback || ''} placeholder="Feedback de esta opción (opcional)" onChange={(e) => update({ ...o, feedback: e.target.value })} />
            </>
          )}
        />
      )

    // ---- Escenario con decisión -------------------------------------------
    case 'scenario_decision':
      return (
        <>
          <div className="ed-field"><span>Escenario / caso</span>
            <RichTextArea rows={3} value={cfg.scenario || ''} onChange={(v) => setConfig({ scenario: v })} /></div>
          <ListEditor
            title="Opciones de decisión"
            items={it.options}
            onChange={(options) => setOptions(options as InteractionOption[])}
            create={() => ({ id: rid('o'), text: '', correct: false, feedback: '' })}
            render={(o, update) => (
              <>
                <input value={o.text} placeholder="Texto de la decisión" onChange={(e) => update({ ...o, text: e.target.value })} />
                <label className="ed-check" title="Puede haber varias correctas: cualquiera de ellas cuenta como acierto (en el test final, en cambio, solo hay una)"><input type="checkbox" checked={!!o.correct} onChange={(e) => update({ ...o, correct: e.target.checked })} /><span>Correcta</span></label>
                <input value={o.feedback || ''} placeholder="Feedback de esta decisión" onChange={(e) => update({ ...o, feedback: e.target.value })} />
              </>
            )}
          />
        </>
      )

    // ---- Clasificación / Emparejamiento (grupos + ítems) ------------------
    case 'classification':
    case 'match_pairs': {
      const groups: { id: string; label: string }[] = cfg.groups || []
      return (
        <>
          <ListEditor
            title="Categorías / grupos"
            items={groups}
            onChange={(g) => setConfig({ groups: g })}
            create={() => ({ id: rid('g'), label: '' })}
            render={(g, update) => (
              <input value={g.label} placeholder="Etiqueta de la categoría" onChange={(e) => update({ ...g, label: e.target.value })} />
            )}
          />
          <ListEditor
            title="Elementos a clasificar"
            items={it.options}
            onChange={(options) => setOptions(options as InteractionOption[])}
            create={() => ({ id: rid('o'), text: '', group: groups[0]?.id || '' })}
            render={(o, update) => (
              <>
                <input value={o.text} placeholder="Texto del elemento" onChange={(e) => update({ ...o, text: e.target.value })} />
                <select value={o.group || ''} onChange={(e) => update({ ...o, group: e.target.value })}>
                  <option value="">— categoría correcta —</option>
                  {groups.map((g) => <option key={g.id} value={g.id}>{g.label || g.id}</option>)}
                </select>
              </>
            )}
          />
        </>
      )
    }

    // ---- Ordenar pasos -----------------------------------------------------
    case 'sort_steps': {
      const steps: { id: string; text: string; order: number }[] = cfg.steps || []
      // El orden correcto es la posición actual en la lista (1..n)
      const commit = (next: any[]) => setConfig({ steps: next.map((s, i) => ({ ...s, order: i + 1 })) })
      return (
        <ListEditor
          title="Pasos (en el ORDEN CORRECTO; se barajan en el SCORM)"
          items={steps}
          onChange={commit}
          create={() => ({ id: rid('p'), text: '', order: steps.length + 1 })}
          render={(s, update) => (
            <input value={s.text} placeholder="Texto del paso" onChange={(e) => update({ ...s, text: e.target.value })} />
          )}
        />
      )
    }

    // ---- Acordeón / Pestañas (título + cuerpo) ----------------------------
    case 'accordion':
    case 'tabs': {
      const items: { title: string; body: string; id?: string; audio_src?: string }[] = cfg.items || []
      const ensureIds = () => {
        const withIds = items.map((x) => (x.id ? x : { ...x, id: rid('it') }))
        if (withIds.some((x, i) => x.id !== items[i]?.id)) setConfig({ items: withIds })
        return withIds as { id: string; audio_src?: string }[]
      }
      return (
        <>
          <ListEditor
            title={it.type === 'tabs' ? 'Pestañas' : 'Apartados del acordeón'}
            items={items}
            onChange={(next) => setConfig({ items: next })}
            summary={(item) => item.title.trim() || '(sin título)'}
            create={() => ({ id: rid('it'), title: '', body: '' })}
            render={(item, update) => (
              <div className="ed-stack">
                <input value={item.title} placeholder="Título" onChange={(e) => update({ ...item, title: e.target.value })} />
                <RichTextArea rows={2} value={item.body} onChange={(v) => update({ ...item, body: v })} />
                <ItemAudioButton
                  screenId={screenId}
                  interactionId={it.id}
                  audioSrc={item.audio_src}
                  ensureId={() => { if (item.id) return item.id; const id = rid('it'); update({ ...item, id }); return id }}
                />
              </div>
            )}
          />
          <BulkItemAudioButton screenId={screenId} interactionId={it.id} items={items} ensureIds={ensureIds} />
        </>
      )
    }

    // ---- Flip cards --------------------------------------------------------
    case 'flip_cards': {
      const cards: { front: string; back: string; id?: string; audio_src?: string }[] = cfg.cards || []
      const ensureIds = () => {
        const withIds = cards.map((x) => (x.id ? x : { ...x, id: rid('cd') }))
        if (withIds.some((x, i) => x.id !== cards[i]?.id)) setConfig({ cards: withIds })
        return withIds as { id: string; audio_src?: string }[]
      }
      return (
        <>
          <ListEditor
            title="Tarjetas"
            items={cards}
            onChange={(next) => setConfig({ cards: next })}
            create={() => ({ id: rid('cd'), front: '', back: '' })}
            render={(c, update) => (
              <div className="ed-stack">
                <input value={c.front} placeholder="Anverso" onChange={(e) => update({ ...c, front: e.target.value })} />
                <input value={c.back} placeholder="Reverso" onChange={(e) => update({ ...c, back: e.target.value })} />
                <ItemAudioButton
                  screenId={screenId}
                  interactionId={it.id}
                  audioSrc={c.audio_src}
                  ensureId={() => { if (c.id) return c.id; const id = rid('cd'); update({ ...c, id }); return id }}
                />
              </div>
            )}
          />
          <BulkItemAudioButton screenId={screenId} interactionId={it.id} items={cards} ensureIds={ensureIds} />
        </>
      )
    }

    // ---- Práctica de caso (rúbrica) ---------------------------------------
    case 'case_practice': {
      const rubric: { label: string }[] = cfg.rubric || []
      return (
        <ListEditor
          title="Rúbrica de autoevaluación (opcional)"
          items={rubric}
          onChange={(next) => setConfig({ rubric: next })}
          create={() => ({ label: '' })}
          render={(r, update) => (
            <input value={r.label} placeholder="Criterio de la rúbrica" onChange={(e) => update({ ...r, label: e.target.value })} />
          )}
        />
      )
    }

    // ---- Vídeo (con preguntas opcionales en timestamps) ---------------------
    case 'video': {
      const questions: QItem[] = cfg.questions || []
      return (
        <div className="ed-stack">
          <label className="ed-field"><span>ID de YouTube (o deja vacío y usa archivo)</span>
            <input value={cfg.youtube || ''} onChange={(e) => setConfig({ youtube: e.target.value })} /></label>
          <label className="ed-field"><span>Ruta de vídeo propio (assets/media/…)</span>
            <input value={cfg.src || ''} onChange={(e) => setConfig({ src: e.target.value })} /></label>
          <label className="ed-field"><span>Transcripción</span>
            <textarea rows={3} value={cfg.transcript || ''} onChange={(e) => setConfig({ transcript: e.target.value })} /></label>
          <QuestionListEditor
            title="Preguntas del vídeo (pausan la reproducción en su segundo)"
            withTime
            questions={questions}
            onChange={(next) => setConfig({ questions: next })}
          />
          {questions.length > 0 && (
            <p className="ed-hint">
              Con preguntas, la actividad se completa al responderlas todas y puede puntuar
              (cada acierto suma su parte). Una pregunta por segundo indicado; el alumno tiene
              un intento por pregunta.
            </p>
          )}
        </div>
      )
    }

    // ---- Hotspots ----------------------------------------------------------
    case 'hotspots': {
      const spots: any[] = cfg.spots || []
      return (
        <>
          <div className="ed-row">
            <label className="ed-field"><span>Imagen (assets/img/…)</span>
              <input value={cfg.image || ''} onChange={(e) => setConfig({ image: e.target.value })} /></label>
            <FileButton accept="image/*" label="Subir imagen…" currentPath={cfg.image || undefined}
              makePath={(ext) => `assets/img/${it.id}-img.${ext}`}
              onUploaded={(path) => setConfig({ image: path })} />
          </div>
          <label className="ed-field"><span>Texto alternativo de la imagen</span>
            <input value={cfg.alt || ''} onChange={(e) => setConfig({ alt: e.target.value })} /></label>
          <button className="ed-hz-open" onClick={() => setZonesOpen(true)} disabled={!cfg.image}>
            <Icon name="hotspot" size={14} /> Editar zonas sobre la imagen…
          </button>
          {!cfg.image && <p className="ed-hint">Sube o indica la imagen para poder dibujar las zonas visualmente.</p>}
          {zonesOpen && (
            <HotspotZonesModal
              image={cfg.image || ''}
              alt={cfg.alt || ''}
              initialSpots={spots as HotspotSpot[]}
              onSave={(next) => setConfig({ spots: next })}
              onClose={() => setZonesOpen(false)}
            />
          )}
          {spots.length > 0 && (
            <p className="ed-hint">
              {spots.length === 1 ? '1 zona definida' : `${spots.length} zonas definidas`}
              {spots.some((s) => s.correct) ? ` · correcta: «${spots.find((s) => s.correct)?.label || 'sin etiqueta'}»` : ' · ninguna marcada como correcta'}
            </p>
          )}
        </>
      )
    }

    // ---- Rellenar huecos ---------------------------------------------------
    case 'fill_blanks': {
      const distractors: string[] = cfg.distractors || []
      // Preview trivial de los huecos: pares texto/hueco por split del [[...]].
      const fbText: string = cfg.text || ''
      const fbParts = fbText.split(/\[\[(.+?)\]\]/g)
      const fbBlanks = (fbParts.length - 1) / 2
      return (
        <>
          <label className="ed-field">
            <span>Texto con huecos — escribe la respuesta correcta entre dobles corchetes: [[respuesta]]</span>
            <textarea rows={4} value={fbText}
              placeholder="El SCORM exportado se sube a [[Moodle]] como paquete [[ZIP]]."
              onChange={(e) => setConfig({ text: e.target.value })} />
          </label>
          {fbText.trim() !== '' && (
            <>
              <div className="ed-fb-preview" aria-label="Vista previa de los huecos">
                {fbParts.map((p, i) => (i % 2 ? <mark key={i}>{p}</mark> : <span key={i}>{p}</span>))}
              </div>
              <p className="ed-hint">
                {fbBlanks === 1 ? '1 hueco' : `${fbBlanks} huecos`} ·{' '}
                {distractors.length === 1 ? '1 distractor' : `${distractors.length} distractores`}
                {fbBlanks === 0 && ' — escribe al menos un [[hueco]] para que haya ejercicio.'}
              </p>
            </>
          )}
          <ListEditor
            title="Distractores (opciones falsas añadidas a los desplegables; opcional)"
            items={distractors.map((t) => ({ text: t }))}
            onChange={(next) => setConfig({ distractors: next.map((d) => d.text) })}
            create={() => ({ text: '' })}
            render={(d, update) => (
              <input value={d.text} placeholder="Opción falsa" onChange={(e) => update({ text: e.target.value })} />
            )}
          />
        </>
      )
    }

    // ---- Línea de tiempo ---------------------------------------------------
    case 'timeline': {
      const milestones: { label: string; title: string; body: string; id?: string; audio_src?: string }[] = cfg.milestones || []
      const ensureIds = () => {
        const withIds = milestones.map((x) => (x.id ? x : { ...x, id: rid('ms') }))
        if (withIds.some((x, i) => x.id !== milestones[i]?.id)) setConfig({ milestones: withIds })
        return withIds as { id: string; audio_src?: string }[]
      }
      return (
        <>
          <ListEditor
            title="Hitos de la línea de tiempo (en orden)"
            items={milestones}
            onChange={(next) => setConfig({ milestones: next })}
            summary={(mi) => [mi.label.trim(), mi.title.trim()].filter(Boolean).join(' · ') || '(sin hito)'}
            create={() => ({ id: rid('ms'), label: '', title: '', body: '' })}
            render={(mi, update) => (
              <div className="ed-stack">
                <div className="ed-row">
                  <input style={{ maxWidth: 160 }} value={mi.label} placeholder="Fecha / fase (p. ej. 1995)"
                    onChange={(e) => update({ ...mi, label: e.target.value })} />
                  <input value={mi.title} placeholder="Título del hito" onChange={(e) => update({ ...mi, title: e.target.value })} />
                </div>
                <RichTextArea rows={2} value={mi.body} onChange={(v) => update({ ...mi, body: v })} />
                <ItemAudioButton
                  screenId={screenId}
                  interactionId={it.id}
                  audioSrc={mi.audio_src}
                  ensureId={() => { if (mi.id) return mi.id; const id = rid('ms'); update({ ...mi, id }); return id }}
                />
              </div>
            )}
          />
          <BulkItemAudioButton screenId={screenId} interactionId={it.id} items={milestones} ensureIds={ensureIds} />
        </>
      )
    }

    // ---- Tarjetas de repaso (flashcards) ------------------------------------
    case 'flashcards': {
      const cards: { front: string; back: string; id?: string; audio_src?: string }[] = cfg.cards || []
      const ensureIds = () => {
        const withIds = cards.map((x) => (x.id ? x : { ...x, id: rid('cd') }))
        if (withIds.some((x, i) => x.id !== cards[i]?.id)) setConfig({ cards: withIds })
        return withIds as { id: string; audio_src?: string }[]
      }
      return (
        <>
          <ListEditor
            title="Tarjetas de repaso (pregunta / respuesta)"
            items={cards}
            onChange={(next) => setConfig({ cards: next })}
            create={() => ({ id: rid('cd'), front: '', back: '' })}
            render={(c, update) => (
              <div className="ed-stack">
                <input value={c.front} placeholder="Pregunta / concepto" onChange={(e) => update({ ...c, front: e.target.value })} />
                <input value={c.back} placeholder="Respuesta / definición" onChange={(e) => update({ ...c, back: e.target.value })} />
                <ItemAudioButton
                  screenId={screenId}
                  interactionId={it.id}
                  audioSrc={c.audio_src}
                  ensureId={() => { if (c.id) return c.id; const id = rid('cd'); update({ ...c, id }); return id }}
                />
              </div>
            )}
          />
          <BulkItemAudioButton screenId={screenId} interactionId={it.id} items={cards} ensureIds={ensureIds} />
        </>
      )
    }

    // ---- Tarjetas de imagen (modal texto + imagen) --------------------------
    case 'image_cards': {
      const cards: { image: string; alt: string; title: string; text: string; id?: string; audio_src?: string }[] = cfg.cards || []
      const ensureIds = () => {
        const withIds = cards.map((x) => (x.id ? x : { ...x, id: rid('cd') }))
        if (withIds.some((x, i) => x.id !== cards[i]?.id)) setConfig({ cards: withIds })
        return withIds as { id: string; audio_src?: string }[]
      }
      return (
        <>
          <ListEditor
            title="Tarjetas de imagen (clic → modal con texto a la izquierda e imagen a la derecha)"
            items={cards}
            onChange={(next) => setConfig({ cards: next })}
            summary={(c) => c.title.trim() || c.alt.trim() || '(sin título)'}
            create={() => ({ id: rid('cd'), image: '', alt: '', title: '', text: '' })}
            render={(c, update) => (
              <div className="ed-stack">
                <div className="ed-row">
                  <input value={c.image} placeholder="Imagen (assets/img/…)"
                    onChange={(e) => update({ ...c, image: e.target.value })} />
                  <FileButton accept="image/*" label="Subir imagen…" currentPath={c.image || undefined}
                    makePath={(ext) => `assets/img/${it.id}-${rid('c')}.${ext}`}
                    onUploaded={(p) => update({ ...c, image: p })} />
                </div>
                <input value={c.alt} placeholder="Texto alternativo de la imagen (obligatorio)"
                  onChange={(e) => update({ ...c, alt: e.target.value })} />
                <input value={c.title} placeholder="Título de la tarjeta"
                  onChange={(e) => update({ ...c, title: e.target.value })} />
                <RichTextArea rows={3} value={c.text} onChange={(v) => update({ ...c, text: v })} />
                <ItemAudioButton
                  screenId={screenId}
                  interactionId={it.id}
                  audioSrc={c.audio_src}
                  ensureId={() => { if (c.id) return c.id; const id = rid('cd'); update({ ...c, id }); return id }}
                />
              </div>
            )}
          />
          <BulkItemAudioButton screenId={screenId} interactionId={it.id} items={cards} ensureIds={ensureIds} />
        </>
      )
    }

    // ---- Antes / después (comparador de imágenes) ----------------------------
    case 'before_after': {
      const side = (key: 'before' | 'after', title: string, defLabel: string) => (
        <div className="ed-stack">
          <p className="ed-options-head">{title}</p>
          <div className="ed-row">
            <input value={cfg[`${key}_image`] || ''} placeholder="Imagen (assets/img/…)"
              onChange={(e) => setConfig({ [`${key}_image`]: e.target.value })} />
            <FileButton accept="image/*" label="Subir imagen…" currentPath={cfg[`${key}_image`] || undefined}
              makePath={(ext) => `assets/img/${it.id}-${key}.${ext}`}
              onUploaded={(p) => setConfig({ [`${key}_image`]: p })} />
          </div>
          <input value={cfg[`${key}_alt`] || ''} placeholder="Texto alternativo (obligatorio)"
            onChange={(e) => setConfig({ [`${key}_alt`]: e.target.value })} />
          <input value={cfg[`${key}_label`] || ''} placeholder={`Etiqueta sobre la imagen (por defecto «${defLabel}»)`}
            onChange={(e) => setConfig({ [`${key}_label`]: e.target.value })} />
        </div>
      )
      return (
        <>
          <p className="ed-hint">
            Las dos imágenes se superponen y el alumno desliza el divisor para compararlas.
            Funcionan mejor si tienen las mismas dimensiones.
          </p>
          {side('before', 'Imagen «antes» (izquierda)', 'Antes')}
          {side('after', 'Imagen «después» (derecha)', 'Después')}
        </>
      )
    }

    // ---- Sopa de letras ------------------------------------------------------
    case 'word_search': {
      const words: string[] = cfg.words || []
      return (
        <>
          <ListEditor
            title="Palabras a encontrar (3–12 letras; acentos y espacios se ignoran en el tablero)"
            items={words.map((t) => ({ text: t }))}
            onChange={(next) => setConfig({ words: next.map((w) => w.text) })}
            create={() => ({ text: '' })}
            render={(w, update) => (
              <input value={w.text} placeholder="Palabra" onChange={(e) => update({ text: e.target.value })} />
            )}
          />
          <p className="ed-hint">
            El tablero se genera solo. El alumno toca la primera y la última letra de cada
            palabra; se valida al momento, sin botón Comprobar.
          </p>
        </>
      )
    }

    // ---- Crucigrama ----------------------------------------------------------
    case 'crossword': {
      const entries: { word: string; clue: string }[] = cfg.entries || []
      return (
        <>
          <ListEditor
            title="Palabras y pistas (3–12 letras; el crucigrama se monta solo con los cruces posibles)"
            items={entries}
            onChange={(next) => setConfig({ entries: next })}
            create={() => ({ word: '', clue: '' })}
            render={(en, update) => (
              <>
                <input style={{ maxWidth: 160 }} value={en.word} placeholder="Palabra"
                  onChange={(e) => update({ ...en, word: e.target.value })} />
                <input value={en.clue} placeholder="Pista / definición"
                  onChange={(e) => update({ ...en, clue: e.target.value })} />
              </>
            )}
          />
          <p className="ed-hint">
            Una palabra que no cruce con ninguna otra se descarta del tablero. Conviene que
            compartan letras entre sí.
          </p>
        </>
      )
    }

    // ---- Imagen oculta ---------------------------------------------------------
    case 'hidden_image': {
      const hiQuestions: QItem[] = cfg.questions || []
      return (
        <>
          <div className="ed-row">
            <input value={cfg.image || ''} placeholder="Imagen a desvelar (assets/img/…)"
              onChange={(e) => setConfig({ image: e.target.value })} />
            <FileButton accept="image/*" label="Subir imagen…" currentPath={cfg.image || undefined}
              makePath={(ext) => `assets/img/${it.id}-hi.${ext}`}
              onUploaded={(p) => setConfig({ image: p })} />
          </div>
          <input value={cfg.alt || ''} placeholder="Texto alternativo de la imagen (obligatorio)"
            onChange={(e) => setConfig({ alt: e.target.value })} />
          <QuestionListEditor
            title="Preguntas (cada acierto destapa parte de la imagen; un intento por pregunta)"
            questions={hiQuestions}
            onChange={(next) => setConfig({ questions: next })}
          />
        </>
      )
    }

    // ---- Rosco A-Z (pasapalabra) ------------------------------------------------
    case 'az_quiz': {
      const azItems: { clue: string; answer: string }[] = cfg.items || []
      const letterOf = (answer: string) =>
        (answer || '').trim().toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').charAt(0) || '?'
      return (
        <>
          <ListEditor
            title="Definiciones del rosco (la letra es la inicial de la respuesta)"
            items={azItems}
            onChange={(next) => setConfig({ items: next })}
            summary={(q) => `${letterOf(q.answer)} · ${q.clue.trim() || '(sin pista)'}`}
            create={() => ({ clue: '', answer: '' })}
            render={(q, update) => (
              <>
                <span className="ed-az-letter">{letterOf(q.answer)}</span>
                <input value={q.clue} placeholder="Definición / pista"
                  onChange={(e) => update({ ...q, clue: e.target.value })} />
                <input style={{ maxWidth: 180 }} value={q.answer} placeholder="Respuesta"
                  onChange={(e) => update({ ...q, answer: e.target.value })} />
              </>
            )}
          />
          <p className="ed-hint">
            El alumno escribe la respuesta o pasa palabra (la letra vuelve en la siguiente
            vuelta). Mayúsculas, acentos y espacios extra no cuentan al corregir.
          </p>
        </>
      )
    }

    // ---- Puzzle de imagen ---------------------------------------------------------
    case 'puzzle':
      return (
        <div className="ed-stack">
          <div className="ed-row">
            <input value={cfg.image || ''} placeholder="Imagen del puzzle (assets/img/…)"
              onChange={(e) => setConfig({ image: e.target.value })} />
            <FileButton accept="image/*" label="Subir imagen…" currentPath={cfg.image || undefined}
              makePath={(ext) => `assets/img/${it.id}-pz.${ext}`}
              onUploaded={(p) => setConfig({ image: p })} />
          </div>
          <input value={cfg.alt || ''} placeholder="Texto alternativo de la imagen (obligatorio)"
            onChange={(e) => setConfig({ alt: e.target.value })} />
          <div className="ed-row">
            <SegIcons label="Columnas" value={String(cfg.cols ?? 3)}
              options={[2, 3, 4, 5].map((n) => ({ value: String(n), icon: String(n), title: `${n} columnas` }))}
              onChange={(v) => setConfig({ cols: Number(v) })} />
            <SegIcons label="Filas" value={String(cfg.rows ?? 3)}
              options={[2, 3, 4, 5].map((n) => ({ value: String(n), icon: String(n), title: `${n} filas` }))}
              onChange={(v) => setConfig({ rows: Number(v) })} />
          </div>
          <p className="ed-hint">El alumno toca dos piezas para intercambiarlas hasta recomponer la imagen.</p>
        </div>
      )

    // ---- HTML a medida (iframe sandbox) ------------------------------------
    case 'html_embed':
      return (
        <div className="ed-stack">
          <p className="ed-hint">
            Pega aquí tu animación o interactivo. El código se ejecuta <strong>aislado en un
            iframe sandbox</strong> dentro del SCORM: no puede acceder al LMS, a la API SCORM ni al
            resto de la pantalla. Debe ser autocontenido (sin cargar librerías externas por CDN si
            el curso puede verse sin conexión).
          </p>
          <label className="ed-field"><span>HTML</span>
            <textarea className="ed-code" rows={8} spellCheck={false} value={cfg.html || ''}
              placeholder={'<div id="demo">…</div>'}
              onChange={(e) => setConfig({ html: e.target.value })} /></label>
          <label className="ed-field"><span>CSS</span>
            <textarea className="ed-code" rows={5} spellCheck={false} value={cfg.css || ''}
              placeholder={'#demo { color: teal; }'}
              onChange={(e) => setConfig({ css: e.target.value })} /></label>
          <label className="ed-field"><span>JavaScript</span>
            <textarea className="ed-code" rows={8} spellCheck={false} value={cfg.js || ''}
              placeholder={"document.getElementById('demo').addEventListener('click', …)"}
              onChange={(e) => setConfig({ js: e.target.value })} /></label>
          <label className="ed-field ed-field-narrow"><span>Alto fijo en px (vacío = automático)</span>
            <input type="number" min={0} value={cfg.height ?? ''}
              onChange={(e) => setConfig({ height: e.target.value === '' ? undefined : Number(e.target.value) })} /></label>
        </div>
      )

    default:
      return null
  }
}

// ---- Preguntas con opciones (compartido por video e hidden_image) -----------
type QOption = { text: string; correct?: boolean; feedback?: string }
type QItem = { time?: number; prompt: string; options: QOption[] }

/** Lista de preguntas (enunciado + opciones); `withTime` añade el segundo en el
 *  que el vídeo se pausa. Sub-editor común de `video` y `hidden_image`. */
function QuestionListEditor({
  title,
  withTime = false,
  questions,
  onChange,
}: {
  title: string
  withTime?: boolean
  questions: QItem[]
  onChange: (next: QItem[]) => void
}) {
  return (
    <ListEditor
      title={title}
      items={questions}
      onChange={onChange}
      addLabel="+ Añadir pregunta"
      summary={(q) => (withTime ? `${q.time ?? 0} s · ` : '') + (q.prompt.trim() || '(sin enunciado)')}
      create={(): QItem => ({
        ...(withTime ? { time: 0 } : {}),
        prompt: '',
        options: [{ text: '', correct: true }, { text: '' }],
      })}
      render={(q, update) => (
        <div className="ed-stack">
          {withTime ? (
            <div className="ed-row">
              <label className="ed-field ed-field-narrow"><span>Segundo</span>
                <input type="number" min={0} value={q.time ?? 0}
                  onChange={(e) => update({ ...q, time: Math.max(0, Number(e.target.value)) })} /></label>
              <input value={q.prompt} placeholder="Enunciado de la pregunta"
                onChange={(e) => update({ ...q, prompt: e.target.value })} />
            </div>
          ) : (
            <input value={q.prompt} placeholder="Enunciado de la pregunta"
              onChange={(e) => update({ ...q, prompt: e.target.value })} />
          )}
          <ListEditor
            title="Opciones"
            items={q.options || []}
            onChange={(options) => update({ ...q, options })}
            create={(): QOption => ({ text: '' })}
            render={(o, uo) => (
              <>
                <input value={o.text} placeholder="Texto de la opción" onChange={(e) => uo({ ...o, text: e.target.value })} />
                <label className="ed-check" title="Puede haber varias correctas: cualquiera de ellas cuenta como acierto"><input type="checkbox" checked={!!o.correct} onChange={(e) => uo({ ...o, correct: e.target.checked })} /><span>Correcta</span></label>
                <input value={o.feedback || ''} placeholder="Feedback (opcional)" onChange={(e) => uo({ ...o, feedback: e.target.value })} />
              </>
            )}
          />
        </div>
      )}
    />
  )
}
