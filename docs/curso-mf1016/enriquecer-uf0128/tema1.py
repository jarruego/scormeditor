# -*- coding: utf-8 -*-
"""Tema 1 de UF0128 · Participación en la preparación de actividades en instituciones sociales.

Originales: s001–s022. Todo el texto sale del original (lib.B / lib.text_of); solo se
trocea y se reparte entre pantallas e interacciones."""
import re

from lib import (B, accordion, az_quiz, callout, case_practice, classification, fill_blanks,
                 flashcards, img, join, match_pairs, scenario_decision, screen, single_choice,
                 tabs, true_false)

O1 = 'Describir cómo se organiza el trabajo diario del gerocultor en un centro: protocolos, planificación de tareas y registros.'
O2 = 'Explicar el papel del gerocultor en la participación del usuario en las actividades del centro: autonomía, alimentación y motivación.'
O3 = 'Reconocer los rasgos e intereses de las personas dependientes que condicionan su integración social y la atención a las incidencias.'
OBJECTIVES = [O1, O2, O3]


def fix(t, *pairs):
    for a, b in pairs:
        assert a in t, a
        t = t.replace(a, b)
    return t


def cap(block):
    """Pie de foto: quita los asteriscos de cursiva."""
    return block.strip('*').strip()


def inner(block):
    """Cuerpo de un callout, sin marcas."""
    return '\n'.join(block.split('\n')[1:-1]).strip()


def terms(block):
    """Párrafos (uno por término) de una caja de vocabulario."""
    return [p.strip() for p in inner(block).split('\n\n') if p.strip()]


def vocab(*items):
    return callout('custom', '\n\n'.join(items), 'Vocabulario', '#F4D6D2', '📚')


s001, s002, s003, s004, s005, s006, s007, s008, s009, s010, s011, s012, s013, s014, s015, s016, s017, s018, s019 = (
    B(f's{i:03d}') for i in range(1, 20))

# --- arreglos de extracción / erratas tipográficas ---------------------------
s001[2] = fix(s001[2], ('coor dinación', 'coordinación'))
s005[1] = fix(s005[1], ('cual es su tarea', 'cuál es su tarea'))
s005[2] = fix(s005[2], ('ordenes', 'órdenes'))
s006[3] = fix(s006[3], ('Dado que es el gerocultor es el', 'Dado que el gerocultor es el'))
s006[6] = fix(s006[6], ('vi da', 'vida'), ('con trol', 'control'))
s014[4] = fix(s014[4], ('profesional .', 'profesional.'))

V1 = terms(s001[3])      # programa informático, hojas organizativas, absorbente
V_LUDO = inner(s005[3])
V_DEF = inner(s007[2])
V_ESP = terms(s010[5])   # espesante, broncoaspiración
V_EMP = terms(s014[7])   # empatía, feedback

GLOSSARY = []
for t in V1 + [V_LUDO, V_DEF] + V_ESP + V_EMP:
    m = re.match(r'\*\*(.+?)\.?\*\*\s*(.*)', t, re.S)
    GLOSSARY.append((m.group(1).strip().rstrip('.'), m.group(2).strip()))

# --- modelo de planificación de tareas (s004) → acordeón ------------------------


def task(block):
    m = re.match(r'^- \*\*(.+?)\.?\*\*\s+(.*)$', block, re.S)
    return m.group(1).strip(), m.group(2).strip()


_t_banos, _b_banos = task(s004[3])
_t_orina, _b_orina = task(s004[6])
_t_comedor, _b_comedor = task(s004[7])
TAREAS = [
    (_t_banos, join(_b_banos, s004[4], s004[5])),
    (_t_orina, _b_orina),
    (_t_comedor, join(_b_comedor, s004[8])),
]

# --- caso práctico 1 (s008) y 2 (s019): enunciado / solución ------------------------
_c1 = inner(s008[0])
_c1_caso, _c1_sol = _c1.split('\n\n**Solución**\n\n')
_c1_narr, _c1_preg = _c1_caso.split(' ¿Crees')
_c1_preg = '¿Crees' + _c1_preg
_c2 = inner(s019[0])
_c2_caso, _c2_sol = _c2.split('\n\n**Solución**\n\n')

# --- Reflexiona (sin numeración ni rótulo) ----------------------------------------


def unnum(t):
    return re.sub(r'(?m)^\d+\.\s+', '', t)


_r1 = unnum(inner(s005[7])).split('\n\n')            # 3 preguntas
_r4 = unnum(inner(s011[4]))
_r5 = unnum(inner(s018[3])).split('\n\n')            # 3 preguntas

SCREENS = [
    # ------------------------------------------------------------------ apertura
    screen('Tema 1. Participación en la preparación de actividades en instituciones sociales', type='cover'),
    screen('Objetivos del tema', '\n'.join(f'- {o}' for o in OBJECTIVES), type='objectives', objective=O1),

    # --------------------------------------------- protocolos diarios (OBJ1)
    screen('Organización diaria del trabajo', join(s001[0], s001[1]), objective=O1, src=['s001']),
    screen('Inicio de la jornada', join(s001[2], vocab(V1[0], V1[1])), objective=O1, src=['s001']),
    screen('Información al iniciar el turno', join(s002[0], vocab(V1[2])), objective=O1, src=['s002', 's001']),
    screen('Información al iniciar el turno', objective=O1, src=['s002'],
           text='Aplica lo anterior a una situación habitual al comenzar un turno.',
           interaction=scenario_decision(
               'Al comenzar tu turno en una residencia compruebas que quedan pocos absorbentes en el carro y que una de las grúas no funciona bien.',
               [('Hacer una lista del material que hay que reponer, entregarla a coordinación o enfermería y avisar de la grúa que necesita reparación.', True,
                 'Correcto: es lo establecido al inicio de cada turno.'),
                ('Seguir con la jornada y esperar a que lo advierta el turno siguiente.', False,
                 'No es lo adecuado: la información relevante debe recogerse y comunicarse al comienzo del turno.'),
                ('Usar la grúa igualmente y comentarlo al terminar la jornada.', False,
                 'El material propio que requiere reparación debe avisarse; usarlo estropeado puede dañar al usuario y al personal.'),
                ('Esperar a que sea la familia del usuario quien reponga el material.', False,
                 'La reposición de material se gestiona con coordinación o enfermería, no con las familias.')],
               prompt='¿Qué haces?',
               expl='Cada turno debe comenzar por la recogida de la información relevante: los gerocultores confeccionan una lista con el material que hay que reponer (como los absorbentes) y la entregan a coordinación o enfermería; también avisan cuando se requiere la reparación de material propio (como las grúas) o del servicio.')),
    screen('Atención en sala y trato personalizado', join(s002[1], s002[2]), objective=O1, src=['s002']),
    screen('Indicadores de pérdida de autonomía', s002[3], objective=O1, src=['s002', 's003'],
           visual=img('assets/img/tabla4-1-8cc3ca.png',
                      'Tabla «Señales de pérdida de autonomía»: fallos en funciones cognitivas superiores (atención, memoria, orientación, pensamiento y lenguaje); alimentación desordenada; caídas frecuentes y problemas de equilibrio; alteraciones leves y reiteradas de la salud; falta de motivación y pérdida de interés; comportamientos poco adaptativos; dificultades de movilidad; dificultades en las actividades de la vida doméstica y en las actividades básicas de la vida diaria.',
                      cap(s003[0]), layout='top')),

    # ---------------------------------------- modelo de planificación (OBJ1)
    screen('Tareas del gerocultor', join(s004[1], s004[2]), objective=O1, src=['s004'],
           interaction=accordion(TAREAS)),
    screen('Hidratación, actividades y registro', join(s004[9], vocab(V_LUDO)), objective=O1, src=['s004', 's005']),
    screen('Exceso de protección', s004[10], objective=O1, src=['s004']),
    screen('Hojas de planificación diaria', join(s005[1], s005[2]), objective=O1, src=['s005']),
    screen('Registros del gerocultor', objective=O1, src=['s005'],
           interaction=accordion([('Libro de incidencias', s005[4]),
                                  ('Control diario de encamados', s005[5]),
                                  ('Hoja de pedido', s005[6])])),
    screen('Registros del gerocultor', objective=O1, src=['s005'],
           text=_r1[0],
           interaction=fill_blanks(
               'En el registro «Control diario de encamados» se anotan los [[cambios posturales]], la eliminación de orina y heces, la ingesta de [[agua]] y de alimentos, las [[indicaciones especiales]], las constantes vitales y los [[fármacos]] o medicación.',
               distractors=['visitas familiares', 'actividades de ocio'],
               expl='Los gerocultores asignados a usuarios que deben permanecer en cama rellenan a diario este registro con los datos de cambios posturales, eliminación de orina y heces, ingesta de agua y de alimentos, indicaciones especiales, constantes vitales y fármacos o medicación.')),
    screen('Planificación de un día de trabajo', _r1[1], type='reflection', objective=O1, src=['s005']),
    screen('Registro de incidencias', _r1[2], objective=O1, src=['s005'],
           interaction=case_practice(
               'Piensa tu respuesta (o escríbela en papel) y compárala después con los criterios.',
               ['Debe figurar cualquier anomalía que se haya producido durante el turno del gerocultor.',
                'Sirve para que el compañero del siguiente turno esté informado y pueda actuar en base a esa información.',
                'Sí: el registro se cumplimenta diariamente, al terminar la jornada.'])),

    # ------------------------------------ participación del usuario (OBJ2)
    screen('Autonomía del usuario', join(s006[0], s006[1], s006[2]), objective=O2, src=['s006']),
    screen('Valoración de la autonomía por el gerocultor', join(s006[3], s006[4], s006[5]), objective=O2, src=['s006']),
    screen('Actividades de la vida diaria', 'Las **actividades de la vida diaria (AVD)** son de dos tipos:', objective=O2, src=['s006'],
           interaction=tabs([
               ('Básicas', 'Conjunto de actividades de autocuidado, es decir, aseo, vestido, control de esfínteres, comer, caminar, etc.'),
               ('Instrumentales', 'Tareas que requieren la capacidad de poder llevar una vida independiente en el entorno habitual (tareas del hogar, compras, control de la medicación, etc.).')])),
    screen('Clasificación de las AVD', objective=O2, src=['s007'],
           visual=img('assets/img/fig4-1-ed8fb7.png',
                      'Esquema de las actividades de la vida diaria (AVD), que se dividen en básicas (elementales: el cuidado mínimo de uno mismo, asearse, vestirse, moverse, alimentarse) e instrumentales (más complejas, maneras de relacionarse con el entorno: manejo del dinero, hacer la compra, tareas del hogar, ir al médico).',
                      cap(s007[0]), layout='top')),
    screen('Variaciones en el comportamiento del usuario', join(s007[1], vocab(V_DEF)), objective=O2, src=['s007']),
    screen('Pautas del profesional competente', s007[3], objective=O2, src=['s007']),
    screen('Señales de alarma en la conducta', objective=O2, src=['s008'],
           text='Analiza esta situación y decide cómo debe actuar la gerocultora.',
           interaction=scenario_decision(
               _c1_narr,
               [('Avisar de los cambios para que los valore el equipo médico del centro.', True,
                 'Correcto: en su conjunto adquieren mayor significado y pueden ser el comienzo de una demencia senil.'),
                ('Atribuir los cambios a la edad y no darles importancia.', False,
                 'Aislados pueden parecer poco importantes, pero actúan como «señales de alarma» que hay que comunicar.'),
                ('Esperar a ver si se repiten durante varios meses antes de decir nada.', False,
                 'Una buena profesional detecta y comunica los cambios; no se espera a que se agraven.'),
                ('Comentarlo únicamente con los familiares en su visita del fin de semana.', False,
                 'La información debe llegar al equipo médico del centro para que valore a la usuaria.')],
               prompt=_c1_preg,
               expl=_c1_sol)),
    screen('La alimentación de la persona dependiente', join(s009[1], s009[2], s009[3]), objective=O2, src=['s009']),
    screen('Modelo biopsicosocial', s009[4], objective=O2, src=['s009']),
    screen('Anomalías en la ingesta de alimentos', join(s010[1], s010[2], s010[3], s010[4]), objective=O2, src=['s010']),
    screen('Cubiertos adaptados y atragantamientos', join(s011[1], s011[2], s011[3], vocab(*V_ESP)), objective=O2, src=['s011', 's010']),
    screen('Cada anomalía, su servicio', objective=O2, src=['s010', 's011'],
           text='Relaciona cada situación con el servicio que se encarga de resolverla.',
           interaction=match_pairs(
               [('Una señora ha dejado de comer o ha disminuido mucho su apetito', 'Servicio de psicología'),
                ('Un usuario tiene problemas para manejar los cubiertos', 'Servicio de terapia ocupacional'),
                ('Un usuario se atraganta con facilidad', 'Servicio de enfermería')],
               expl='Psicología averigua la causa del cambio de comportamiento; terapia ocupacional suministra cubiertos adaptados; enfermería pauta la cantidad de espesante en los líquidos para evitar la broncoaspiración.')),
    screen('Gerocultor fijo o rotación del personal', _r4, type='reflection', objective=O2, src=['s011']),
    screen('La motivación del usuario', join(s012[1], s012[2]), objective=O2, src=['s012'],
           visual=img('assets/img/fig4-2-6ff93d.png',
                      'Ilustración de varias personas mayores sentadas alrededor de una mesa que hacen manualidades con flores de colores y cestas.',
                      cap(s012[5]), layout='top')),
    screen('Teoría de la actividad', join(s012[3], s012[4]), objective=O2, src=['s012']),
    screen('Teoría de la actividad', objective=O2, src=['s012'],
           text='Comprueba si recuerdas qué plantea la Teoría de la actividad.',
           interaction=single_choice(
               'Según la Teoría de la actividad de Tartler (1961), ¿qué relación existe entre el nivel de actividad de una persona y su nivel de satisfacción?',
               [('Es directamente proporcional: quien mantiene su actividad envejece satisfactoriamente.', True),
                ('Es inversamente proporcional: cuanto menos activa, más satisfecha.', False),
                ('No existe ninguna relación entre ambos niveles.', False),
                ('Solo depende de la edad de la persona, no de su actividad.', False)],
               ok='Correcto: esa es la perspectiva más extendida en las instituciones.',
               expl='Existe una relación directamente proporcional entre el nivel de actividad y el nivel de satisfacción; por eso hay que buscar ocupaciones que mantengan activa a la persona, teniendo en cuenta sus recursos y circunstancias.')),
    screen('Falta de participación y labor del gerocultor', join(s013[1], s013[2], s013[3]), objective=O2, src=['s013']),
    screen('Intimidad y motivación', join(s014[1], s014[2], vocab(V_EMP[0])), objective=O2, src=['s014']),
    screen('Comunicación en los dos sentidos', join(s014[3], s014[4], s014[5], s014[6], vocab(V_EMP[1])), objective=O2, src=['s014']),
    screen('Motivar sin obligar', objective=O2, src=['s013'],
           text='Revisa la labor del gerocultor ante un usuario poco participativo.',
           interaction=true_false(
               'La labor del gerocultor ante la falta de participación consiste en informar, motivar y recordar, pero nunca obligar.', True,
               ok='Correcto.',
               expl='La información dada al usuario promueve su libre elección cuando se trata de actividades voluntarias planteadas por el centro: el gerocultor informa, motiva y recuerda, pero nunca obliga.')),

    # ----------------------------- intereses de los usuarios e incidencias (OBJ3)
    screen('Rigidez carencial o cognitiva', join(s015[0], s015[1], s015[3]), objective=O3, src=['s015']),
    screen('Rigidez carencial o cognitiva', join(s016[0], s015[2]), objective=O3, src=['s016', 's015']),
    screen('Tendencia a la autorreflexión', join(s016[1], s016[2]), objective=O3, src=['s016']),
    screen('Rasgos de la última etapa de la vida', objective=O3, src=['s015', 's016'],
           text='Distingue los dos rasgos que dificultan la integración del usuario.',
           interaction=classification(
               ['Rigidez carencial o cognitiva', 'Autorreflexión'],
               [('Incapacidad para desviar la atención de un estímulo que se impone sobre los demás.', 'Rigidez carencial o cognitiva'),
                ('Incapacidad de cambiar el comportamiento en función del estímulo recibido.', 'Rigidez carencial o cognitiva'),
                ('Se escudan en una colección de rutinas que aportan sensación de seguridad.', 'Rigidez carencial o cognitiva'),
                ('Aumenta el tiempo dedicado a pensar sobre la propia vida.', 'Autorreflexión'),
                ('Necesidad de integrar las experiencias acumuladas cuando la vida llega al final.', 'Autorreflexión'),
                ('Funciona como mecanismo adaptativo.', 'Autorreflexión')],
               expl='La rigidez carencial o cognitiva se relaciona con la dificultad para cambiar de estímulo, de comportamiento o de hipótesis; la autorreflexión, con el tiempo que se dedica a integrar la propia experiencia.')),
    screen('Soledad e internamiento', join(s017[0], s017[1], s017[2]), objective=O3, src=['s017']),
    screen('Factores que limitan las relaciones sociales', join(s017[3], s017[4], s018[0]), objective=O3, src=['s017', 's018']),
    screen('Favorecer las relaciones sociales', join(s018[1], s018[2]), objective=O3, src=['s018']),
    screen('Integración en el centro', objective=O3, src=['s017'],
           text='Piensa cómo favorecer la integración de las personas dependientes en el centro.',
           interaction=single_choice(
               '¿Qué es importante para ayudar a la integración de las personas dependientes en el centro de atención?',
               [('Conocer sus gustos, escucharles, mostrarse receptivo y motivarles para que se relacionen con sus compañeros.', True),
                ('Evitar que se relacionen con el resto para no generar conflictos.', False),
                ('Mantener las mismas rutinas para todos los usuarios sin atender sus preferencias.', False),
                ('Esperar a que sean ellos quienes tomen siempre la iniciativa.', False)],
               ok='Correcto.',
               expl='Conocer sus gustos, escucharles y mostrarse receptivo a sus proposiciones, intentar satisfacer sus necesidades y motivarles para que se relacionen con el resto de sus compañeros favorece su integración.')),
    screen('Motivación e integración de los usuarios', '1. ' + _r5[0] + '\n2. ' + _r5[1] + '\n3. ' + _r5[2], type='reflection', objective=O3, src=['s018']),
    screen('Intervención ante la soledad del usuario', _c2_caso, objective=O3, src=['s019'],
           interaction=case_practice(
               'Piensa tu respuesta (o escríbela en papel) y compárala después con los criterios.',
               ['Perspectiva social: fomentar las actividades de ocio y procurar su integración en la comunidad mediante salidas al centro de día o con otras personas mayores de la zona.',
                'Con la familia: reforzar los vínculos afectivos que ya existen, incrementar las visitas de los familiares y animarles a llevar a cabo actividades conjuntas.',
                'Con la comunidad: recuperar las relaciones con su círculo de amigos y animarle a participar en las actividades de centros de día o centros culturales.'],
               expl=_c2_sol)),

    # ------------------------------------------------------------------ cierre
    screen('Repaso del tema', objective=O1, text='Repasa los conceptos clave del tema antes de continuar.',
           interaction=flashcards([
               ('¿Quién lleva a cabo la distribución de los cuidados diarios?', 'El departamento de coordinación o de enfermería, según el organigrama del centro.'),
               ('¿Qué se hace antes de dar comienzo la jornada de trabajo?', 'La persona encargada de la coordinación distribuye al personal si hay novedades, se leen las hojas organizativas y los libros de incidencias, y se exponen las incidencias que puedan afectar a la jornada.'),
               ('¿Qué registros cumplimenta el gerocultor?', 'El libro de incidencias, el «Control diario de encamados» (usuarios que deben permanecer en cama) y, semanalmente, la «hoja de pedido» de material.'),
               ('¿Qué tipos de actividades de la vida diaria (AVD) hay?', 'Básicas (autocuidado: aseo, vestido, control de esfínteres, comer, caminar) e instrumentales (tareas del hogar, compras, control de la medicación).'),
               ('¿Por qué es el gerocultor quien mejor valora la autonomía del usuario?', 'Porque es el profesional de trato más continuado con el usuario.'),
               ('¿Qué plantea la Teoría de la actividad de Tartler?', 'Que existe una relación directamente proporcional entre el nivel de actividad de una persona y su nivel de satisfacción.'),
               ('¿Qué hace el gerocultor para motivar al usuario?', 'Informar, motivar y recordar, pero nunca obligar; comunicarse en los dos sentidos desde la comprensión y la empatía.'),
               ('¿Qué dos rasgos dificultan integrar al usuario en nuevas actividades o relaciones?', 'La rigidez carencial o cognitiva y la tendencia a la autorreflexión.')])),
    screen('Pasapalabra del tema', objective=O2, text='Escribe la respuesta de cada definición.',
           interaction=az_quiz([
               ('Documento donde se anota cualquier anomalía del turno para informar al compañero del turno siguiente (libro de ...)', 'Incidencias'),
               ('Sustancia que se agrega a los alimentos líquidos para evitar la broncoaspiración', 'Espesante'),
               ('Técnica de tratamiento que utiliza el juego como medio de expresión y comunicación', 'Ludoterapia'),
               ('Proceso de compartir observaciones y sugerencias; retroalimentación', 'Feedback'),
               ('Comportamiento excesivo del gerocultor que hace al usuario más vulnerable y débil: exceso de ...', 'Protección'),
               ('Autor (1961) de la Teoría de la actividad', 'Tartler'),
               ('Profesional de trato más continuado con el usuario', 'Gerocultor'),
               ('Factor muy importante para realizar de forma autónoma las actividades de la vida diaria', 'Motivación'),
               ('Con los usuarios hay que informar, motivar y recordar, pero nunca ...', 'Obligar'),
               ('Tipo de rigidez, junto a la cognitiva, que consiste en la incapacidad de desviar la atención de un estímulo', 'Carencial')])),
    screen('Síntesis: protocolos diarios de actuación', type='summary', objective=O1,
           visual=img('assets/img/sintesis4-1-8e50ac.png',
                      'Esquema de síntesis: los protocolos diarios de actuación incluyen métodos de planificación de tareas de un gerocultor: baños y aseos diarios, control de orina y heces, en el comedor, hidratación, acompañamiento a las actividades y registro de incidencias.',
                      layout='top')),
    screen('Síntesis: participación del usuario en las actividades', type='summary', objective=O2,
           visual=img('assets/img/sintesis4-2-0a8270.png',
                      'Esquema de síntesis: la participación del usuario en las actividades del centro comprende el gerocultor y la alimentación del usuario dependiente, y la motivación de la persona dependiente.',
                      layout='top')),
    screen('Síntesis: intereses de los usuarios e incidencias', type='summary', objective=O3,
           visual=img('assets/img/sintesis4-3-dc651c.png',
                      'Esquema de síntesis: los intereses de los usuarios y las incidencias abarcan la rigidez carencial o cognitiva, la tendencia a la autorreflexión y las limitaciones para relacionarse (cese de la actividad laboral, familiares envejecidos o lejanos, abandono de actividades habituales y pérdida de seres queridos).',
                      layout='top')),
]
