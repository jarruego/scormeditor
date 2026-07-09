import { useMemo, useRef } from 'react'
import { useCourseStore } from '../store/courseStore'
import type { UnitTest, QuizQuestion, InteractionOption } from '../schema/course.schema'
import { uncoveredObjectives } from '../validation/objectives'
import { ObjectiveSelect } from './ObjectiveSelect'
import { ListEditor } from './ListEditor'

function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 7)}`
}

function blankOption(correct = false): InteractionOption {
  return { id: newId('o'), text: '', correct }
}

// `objective`: prerrelleno con el primer objetivo del curso aún sin evaluación
// (se puede cambiar en el desplegable de la pregunta).
function blankQuestion(objective = ''): QuizQuestion {
  return {
    id: newId('q'),
    prompt: '',
    type: 'single_choice',
    options: [blankOption(true), blankOption(false)],
    feedback: { correct: 'Correcto.', incorrect: 'Revisa tu respuesta.', explanation: '' },
    points: 1,
    learning_objective: objective,
    source_refs: [],
  }
}

function blankTest(objective = ''): UnitTest {
  return { id: 'final', unit_id: '', title: 'Test final', pass_score: 70, questions: [blankQuestion(objective)] }
}

// Clon para «Duplicar pregunta»: regenera el id de la pregunta Y el de cada
// opción — el grupo de radios usa `correct-${q.id}` y el runtime guarda la
// respuesta por id de opción, así que duplicar identidades los rompería.
function cloneQuestion(q: QuizQuestion): QuizQuestion {
  const c: QuizQuestion = JSON.parse(JSON.stringify(q))
  c.id = newId('q')
  c.options = c.options.map((o) => ({ ...o, id: newId('o') }))
  return c
}

export function FinalTestEditor() {
  const test = useCourseStore((s) => s.course.assessments.final_test)
  const setFinalTest = useCourseStore((s) => s.setFinalTest)
  const course = useCourseStore((s) => s.course)
  const titleRef = useRef<HTMLInputElement>(null)
  // Primer objetivo declarado que ninguna evaluación cubre: al añadir preguntas
  // se va avanzando solo por los objetivos pendientes.
  const nextObjective = useMemo(() => uncoveredObjectives(course)[0] ?? '', [course])

  if (!test) {
    return (
      <div className="ed-form">
        <h2>Test final</h2>
        <p className="ed-empty">Este curso no tiene test final. El test calificable se muestra al estudiante y genera la nota final.</p>
        <button className="ed-primary" onClick={() => setFinalTest(blankTest(nextObjective))}>+ Crear test final</button>
      </div>
    )
  }

  const patch = (p: Partial<UnitTest>) => setFinalTest({ ...test, ...p })
  const setQuestions = (questions: QuizQuestion[]) => patch({ questions })
  const totalPoints = test.questions.reduce((a, q) => a + (q.points || 0), 0)

  return (
    <div className="ed-form">
      {/* Cabecera con el título del test editable in situ, como en ScreenEditor */}
      <h2 className="ed-form-head">
        <input ref={titleRef} className="ed-title-input"
          value={test.title} placeholder="(sin título)" aria-label="Título del test final"
          onChange={(e) => patch({ title: e.target.value })} />
        <button type="button" className="ed-title-pencil" title="Editar título" aria-label="Editar título"
          onClick={() => { titleRef.current?.focus(); titleRef.current?.select() }}>
          <span aria-hidden="true">✏️</span>
        </button>
        <span className="ed-form-type"><span aria-hidden="true">📝</span> Test final</span>
      </h2>

      <div className="ed-row">
        <label className="ed-field ed-field-narrow">
          <span>Nota mínima (%)</span>
          <input type="number" min={0} max={100} value={test.pass_score}
            onChange={(e) => patch({ pass_score: Number(e.target.value) })} />
        </label>
        <span className="ed-hint">
          {test.questions.length === 1 ? '1 pregunta' : `${test.questions.length} preguntas`} ·{' '}
          {totalPoints === 1 ? '1 punto' : `${totalPoints} puntos`}
        </span>
      </div>

      {/* Preguntas sobre ListEditor (plan UX fase 6): plegadas por defecto con
          resumen (⛔ si ninguna opción es correcta), reordenar y duplicar. */}
      <ListEditor
        title="Preguntas"
        items={test.questions}
        onChange={setQuestions}
        addLabel="+ Añadir pregunta"
        collapseFrom={1}
        summary={(q) =>
          `${q.options.some((o) => o.correct) ? '' : '⛔ sin opción correcta · '}${q.prompt.trim() || '(sin enunciado)'}`}
        create={() => blankQuestion(nextObjective)}
        clone={cloneQuestion}
        confirmRemove={(q) =>
          q.prompt.trim() || q.options.some((o) => o.text.trim())
            ? `Se eliminará la pregunta «${q.prompt.trim() || '(sin enunciado)'}» con sus opciones y feedback.`
            : null}
        render={(q, uq) => (
          <div className="ed-stack">
            <div className="ed-row">
              <label className="ed-field">
                <span>Tipo</span>
                <select value={q.type} onChange={(e) => uq({ ...q, type: e.target.value as QuizQuestion['type'] })}>
                  <option value="single_choice">Opción única</option>
                  <option value="true_false">Verdadero / Falso</option>
                </select>
              </label>
              <label className="ed-field ed-field-narrow">
                <span>Puntos</span>
                <input type="number" min={0} value={q.points}
                  onChange={(e) => uq({ ...q, points: Number(e.target.value) })} />
              </label>
            </div>

            <label className="ed-field"><span>Enunciado</span>
              <input value={q.prompt} onChange={(e) => uq({ ...q, prompt: e.target.value })} /></label>

            <label className="ed-field"><span>Objetivo vinculado</span>
              <ObjectiveSelect value={q.learning_objective} onChange={(v) => uq({ ...q, learning_objective: v })} /></label>

            <ListEditor
              title="Opciones (marca la correcta)"
              items={q.options}
              onChange={(options) => uq({ ...q, options })}
              addLabel="+ Añadir opción"
              create={() => blankOption()}
              clone={(o) => ({ ...o, id: newId('o'), correct: false })}
              render={(o) => (
                <>
                  <label className="ed-check" title="Correcta">
                    <input type="radio" name={`correct-${q.id}`} checked={!!o.correct}
                      onChange={() => uq({ ...q, options: q.options.map((x) => ({ ...x, correct: x.id === o.id })) })} />
                  </label>
                  <input className="ed-grow" value={o.text} placeholder="Texto de la opción"
                    onChange={(e) => uq({ ...q, options: q.options.map((x) => (x.id === o.id ? { ...x, text: e.target.value } : x)) })} />
                </>
              )}
            />

            <label className="ed-field"><span>Feedback acierto</span>
              <input value={q.feedback.correct} onChange={(e) => uq({ ...q, feedback: { ...q.feedback, correct: e.target.value } })} /></label>
            <label className="ed-field"><span>Feedback error</span>
              <input value={q.feedback.incorrect} onChange={(e) => uq({ ...q, feedback: { ...q.feedback, incorrect: e.target.value } })} /></label>
            <label className="ed-field"><span>Explicación</span>
              <input value={q.feedback.explanation} onChange={(e) => uq({ ...q, feedback: { ...q.feedback, explanation: e.target.value } })} /></label>
          </div>
        )}
      />

      <div className="ed-row">
        <button className="ed-danger" onClick={() => setFinalTest(null)}>Eliminar test final</button>
      </div>
    </div>
  )
}
