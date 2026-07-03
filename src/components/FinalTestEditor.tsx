import { useCourseStore } from '../store/courseStore'
import type { UnitTest, QuizQuestion, InteractionOption } from '../schema/course.schema'

function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 7)}`
}

function blankOption(correct = false): InteractionOption {
  return { id: newId('o'), text: '', correct }
}

function blankQuestion(): QuizQuestion {
  return {
    id: newId('q'),
    prompt: '',
    type: 'single_choice',
    options: [blankOption(true), blankOption(false)],
    feedback: { correct: 'Correcto.', incorrect: 'Revisa tu respuesta.', explanation: '' },
    points: 1,
    learning_objective: '',
    source_refs: [],
  }
}

function blankTest(): UnitTest {
  return { id: 'final', unit_id: '', title: 'Test final', pass_score: 70, questions: [blankQuestion()] }
}

export function FinalTestEditor() {
  const test = useCourseStore((s) => s.course.assessments.final_test)
  const setFinalTest = useCourseStore((s) => s.setFinalTest)

  if (!test) {
    return (
      <div className="ed-form">
        <h2>Test final</h2>
        <p className="ed-empty">Este curso no tiene test final. El test calificable se muestra al estudiante y genera la nota final.</p>
        <button className="ed-primary" onClick={() => setFinalTest(blankTest())}>+ Crear test final</button>
      </div>
    )
  }

  const patch = (p: Partial<UnitTest>) => setFinalTest({ ...test, ...p })
  const setQuestions = (questions: QuizQuestion[]) => patch({ questions })
  const updateQuestion = (qi: number, p: Partial<QuizQuestion>) =>
    setQuestions(test.questions.map((q, i) => (i === qi ? { ...q, ...p } : q)))
  const updateOption = (qi: number, oi: number, p: Partial<InteractionOption>) =>
    updateQuestion(qi, { options: test.questions[qi].options.map((o, i) => (i === oi ? { ...o, ...p } : o)) })
  const setCorrect = (qi: number, oi: number) =>
    updateQuestion(qi, { options: test.questions[qi].options.map((o, i) => ({ ...o, correct: i === oi })) })

  return (
    <div className="ed-form">
      <h2>Test final</h2>

      <div className="ed-row">
        <label className="ed-field">
          <span>Título</span>
          <input value={test.title} onChange={(e) => patch({ title: e.target.value })} />
        </label>
        <label className="ed-field ed-field-narrow">
          <span>Nota mínima (%)</span>
          <input type="number" min={0} max={100} value={test.pass_score}
            onChange={(e) => patch({ pass_score: Number(e.target.value) })} />
        </label>
      </div>

      {test.questions.map((q, qi) => (
        <fieldset className="ed-group" key={q.id}>
          <legend>Pregunta {qi + 1}</legend>
          <div className="ed-row">
            <label className="ed-field">
              <span>Tipo</span>
              <select value={q.type} onChange={(e) => updateQuestion(qi, { type: e.target.value as any })}>
                <option value="single_choice">Opción única</option>
                <option value="true_false">Verdadero / Falso</option>
              </select>
            </label>
            <label className="ed-field ed-field-narrow">
              <span>Puntos</span>
              <input type="number" min={0} value={q.points}
                onChange={(e) => updateQuestion(qi, { points: Number(e.target.value) })} />
            </label>
          </div>

          <label className="ed-field"><span>Enunciado</span>
            <input value={q.prompt} onChange={(e) => updateQuestion(qi, { prompt: e.target.value })} /></label>

          <div className="ed-field">
            <span>Opciones (marca la correcta)</span>
            {q.options.map((o, oi) => (
              <div className="ed-row" key={o.id}>
                <label className="ed-check" title="Correcta">
                  <input type="radio" name={`correct-${q.id}`} checked={!!o.correct} onChange={() => setCorrect(qi, oi)} />
                </label>
                <input className="ed-grow" value={o.text} placeholder={`Opción ${oi + 1}`}
                  onChange={(e) => updateOption(qi, oi, { text: e.target.value })} />
                <button className="ed-danger" title="Eliminar opción" disabled={q.options.length <= 2}
                  onClick={() => updateQuestion(qi, { options: q.options.filter((_, i) => i !== oi) })}>🗑</button>
              </div>
            ))}
            <button onClick={() => updateQuestion(qi, { options: [...q.options, blankOption()] })}>+ Añadir opción</button>
          </div>

          <label className="ed-field"><span>Feedback acierto</span>
            <input value={q.feedback.correct} onChange={(e) => updateQuestion(qi, { feedback: { ...q.feedback, correct: e.target.value } })} /></label>
          <label className="ed-field"><span>Feedback error</span>
            <input value={q.feedback.incorrect} onChange={(e) => updateQuestion(qi, { feedback: { ...q.feedback, incorrect: e.target.value } })} /></label>
          <label className="ed-field"><span>Explicación</span>
            <input value={q.feedback.explanation} onChange={(e) => updateQuestion(qi, { feedback: { ...q.feedback, explanation: e.target.value } })} /></label>

          <button className="ed-danger" onClick={() => setQuestions(test.questions.filter((_, i) => i !== qi))}>Eliminar pregunta</button>
        </fieldset>
      ))}

      <div className="ed-row">
        <button className="ed-primary" onClick={() => setQuestions([...test.questions, blankQuestion()])}>+ Añadir pregunta</button>
        <button className="ed-danger" onClick={() => setFinalTest(null)}>Eliminar test final</button>
      </div>
    </div>
  )
}
