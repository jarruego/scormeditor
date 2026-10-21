// Curso de ejemplo que se graba para el vídeo de «Instrucciones de uso». Es una unidad
// corta de tema neutro con todo lo que enseña el vídeo: narración + transcripción,
// actividad evaluable, glosario y recursos. Se valida con el esquema real (parseCourse)
// para que lo que se graba sea exactamente lo que exporta el editor.
// Lo compila y ejecuta capturar.mjs (esbuild → _tmp/demo-course.mjs).
import { parseCourse } from '../../src/schema/course.schema'

const vr = { kind: 'none' }
const screen = (s: Record<string, unknown>) => ({ visual_resource: vr, interaction: null, ...s })

export const NARRACION_DEMO = 'assets/narracion-demo.mp3'

export function demoCourse() {
  return parseCourse({
    course: { id: 'demo-instrucciones', title: 'Trabajo en equipo', language: 'es' },
    scorm: {
      identifier: 'DEMO-INSTRUCCIONES',
      title: 'Trabajo en equipo',
      rules: { navigation: 'free', require_interactions: false, score_source: 'mixed', mixed_final_weight: 0 },
    },
    shell: { primary_color: '#5265c4', accent_color: '#6DC3C0', motion: 'subtle' },
    modules: [{
      id: 'm1',
      title: 'Trabajo en equipo',
      units: [{
        id: 'u1',
        title: 'La comunicación en el equipo',
        screens: [
          screen({ id: 's1', type: 'cover', title: 'La comunicación en el equipo', student_text: 'Cómo compartir información para que todo el equipo trabaje a una.' }),
          screen({
            id: 's2', type: 'content', title: 'Por qué importa comunicarse bien',
            objective: 'Reconocer el papel de la comunicación en el equipo.',
            student_text: 'En un equipo, cada persona tiene una parte de la información. Cuando esa información **no circula**, aparecen los errores, las repeticiones y los malentendidos.\n\nComunicarse bien no es hablar más, sino **compartir lo importante, a tiempo y con claridad**:\n\n- Qué ha pasado y qué queda pendiente.\n- Quién se encarga de cada tarea.\n- Qué necesitas de los demás.\n\n::: tip\nAntes de terminar tu turno, repasa con tu compañero o compañera lo que queda pendiente.\n:::',
            audio_src: NARRACION_DEMO,
            transcript: 'En un equipo, cada persona tiene una parte de la información. Cuando esa información no circula, aparecen los errores, las repeticiones y los malentendidos.\n\nComunicarse bien no es hablar más, sino compartir lo importante, a tiempo y con claridad: qué ha pasado y qué queda pendiente, quién se encarga de cada tarea y qué necesitas de los demás.\n\nConsejo: antes de terminar tu turno, repasa con tu compañero o compañera lo que queda pendiente.',
          }),
          screen({
            id: 's3', type: 'content', title: 'El traspaso de información',
            objective: 'Aplicar un traspaso de información ordenado.',
            student_text: 'El **traspaso** es el momento en que una persona entrega a otra la información que necesita para seguir con el trabajo.\n\nUn buen traspaso es **breve, ordenado y comprobado**: se cuenta lo esencial, siguiendo siempre el mismo orden, y quien lo recibe confirma que lo ha entendido.',
          }),
          screen({
            id: 's4', type: 'content', title: 'Comprueba lo que sabes',
            objective: 'Aplicar un traspaso de información ordenado.',
            interaction: {
              id: 'i1', type: 'single_choice',
              prompt: '¿Qué caracteriza a un buen traspaso de información?',
              options: [
                { id: 'o1', text: 'Contarlo todo con el máximo detalle posible.', correct: false },
                { id: 'o2', text: 'Ser breve, ordenado y comprobar que se ha entendido.', correct: true },
                { id: 'o3', text: 'Dejarlo por escrito y no comentarlo.', correct: false },
              ],
              feedback: { correct: '¡Correcto! Lo esencial, siempre en el mismo orden y confirmando que se ha entendido.', incorrect: 'Revisa la pantalla anterior.' },
              scored: true, points: 1, attempts: 2,
            },
          }),
          screen({ id: 's5', type: 'summary', title: 'Resumen', student_text: '- Compartir lo importante, a tiempo y con claridad.\n- Traspasos breves, ordenados y comprobados.' }),
        ],
      }],
    }],
    glossary: [
      { term: 'Traspaso', definition: 'Entrega de la información necesaria para continuar un trabajo.' },
      { term: 'Equipo', definition: 'Grupo de personas que trabajan coordinadas hacia un objetivo común.' },
    ],
    bibliography: [{ ref: 'Guía de buenas prácticas de comunicación en equipos de trabajo.' }],
  })
}
