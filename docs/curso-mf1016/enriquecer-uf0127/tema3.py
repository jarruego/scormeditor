# -*- coding: utf-8 -*-
"""UF0127 · Tema 3 — Atención integral y principios éticos en la recepción y acogida.
Originales: s042–s065."""
from lib import (B, screen, img, join, callout, single_choice, true_false, fill_blanks, match_pairs,
                 classification, scenario_decision, case_practice, accordion, tabs, flip_cards,
                 flashcards, az_quiz, image_cards)

IMG = 'assets/img/'

# Objetivos (texto exacto repetido en cada pantalla que los desarrolla)
O1 = 'Distinguir la dependencia de la falta de autonomía y respetar la capacidad de decisión de la persona usuaria.'
O2 = 'Reconocer la función de los protocolos de actuación y las tareas características de cada servicio del equipo multiprofesional.'
O3 = 'Aplicar los principios éticos de la intervención social y los derechos a la intimidad y a la dignidad en el trato a la persona usuaria.'
O4 = 'Describir la atención integral en la intervención: actuación del equipo, programas de intervención y servicios del centro.'
OBJECTIVES = [O1, O2, O3, O4]


def fix(t):
    """Arreglos de extracción (solo forma)."""
    for a, b in [
        ('**dependencia**(necesidad', '**dependencia** (necesidad'),
        ('de** autonomía**', 'de **autonomía**'),
        ('muyim portante', 'muy importante'),
        ('cui dar', 'cuidar'),
        ('equipo,,', 'equipo,'),
        ('El**principio', 'El **principio'),
        ('J.,Bioética', 'J., Bioética'),
        ('31032003.*', '31032003).*'),
    ]:
        t = t.replace(a, b)
    return t


def F(sid, *idx):
    return [fix(B(sid)[i]) for i in idx]


b42 = B('s042')
# "falta de*autonomía**" no existe tal cual: se comprueba el bloque 1 abajo
p_dep = fix(b42[1])

S = []

# ---------------------------------------------------------------- portada y objetivos
S.append(screen('Tema 3. Atención integral y principios éticos en la recepción y acogida', '', type='cover'))
S.append(screen('Objetivos del tema', join(*[f'- {o}' for o in OBJECTIVES]), type='objectives', objective=O1,
                notes=['Objetivos redactados a partir del contenido del tema; revisar con la ficha del módulo.']))

# ---------------------------------------------------------------- 1. Autonomía (s042, s043)
S.append(screen('Autonomía y dependencia',
                join(b42[0], p_dep, b42[2]),
                objective=O1, src=['s042'],
                visual=img(IMG + 'fig3-1-8acb59.png',
                           'Esquema que relaciona autonomía (capacidad de controlar y tomar decisiones personales y actividades básicas de la vida diaria) con dependencia (estado debido a edad, discapacidad o enfermedad, que requiere atención de otras personas, ayudas en las ABVD y otros apoyos).',
                           caption='Fig. 3.1. Relación entre los conceptos de autonomía y dependencia.', layout='top')))
S.append(screen('Fomentar la autonomía de la persona usuaria',
                join(fix(b42[3]), fix(b42[4])), objective=O1, src=['s042']))
s43 = B('s043')[0]
enun, sol = s43.split('**Solución**')
enun = enun.split('\n', 1)[1].strip()
sol = sol.replace('\n:::', '').strip()
S.append(screen('Autonomía en la práctica', 'Un caso para aplicar lo visto sobre la autonomía.', objective=O1, src=['s043'],
                interaction=scenario_decision(
                    enun,
                    [('Conversar con la persona para que comprenda los riesgos y los inconvenientes de su acción, procurando que acepte la compañía de algún profesional.', True,
                      'Es la actuación adecuada: se respeta su decisión y se la orienta.'),
                     ('Prohibirle la salida del centro.', False, 'Si no está incapacitada judicialmente, no se le puede prohibir que salga de la residencia.'),
                     ('Dejarla salir sin decirle nada, aunque temamos que se pierda.', False, 'Hay que hablar con ella sobre los riesgos que asume.')],
                    prompt='¿Cómo debemos actuar en este caso?',
                    ok='Correcto: se respeta su autonomía y se la orienta.',
                    ko='Revisa el apartado: no podemos prohibirle la salida, pero sí conversar con ella.',
                    expl=sol)))

# ---------------------------------------------------------------- 2. Protocolos (s044–s046)
b44 = B('s044')
S.append(screen('Protocolos de actuación del equipo',
                join(fix(b44[0]), b44[1], b44[3]), objective=O2, src=['s044'],
                visual=img(IMG + 'fig3-2-b13f52.png',
                           'Una enfermera sentada junto a una mujer mayor en un sillón le muestra unos documentos en una carpeta.',
                           caption=b44[2].strip('*'), layout='right', media_width='50')))
s46 = B('s046')[0]
S.append(screen('Protocolos de actuación del equipo', 'Comprueba si recuerdas para qué sirven los protocolos.', objective=O2, src=['s046'],
                interaction=single_choice(
                    'La existencia de protocolos es importante para que:',
                    [('Todos los miembros del equipo posean los conocimientos necesarios para una actuación correcta ante una determinada circunstancia.', False),
                     ('Todos actúen de manera uniforme ante la misma circunstancia.', False),
                     ('Ambas son correctas.', True)],
                    ok='Correcto: los protocolos aportan ambas cosas.',
                    ko='Piensa en lo que permiten los protocolos: conocimientos compartidos y una actuación uniforme.',
                    expl='La existencia de protocolos es importante para que todos los miembros del equipo sepan llevar a cabo una actuación correcta ante una determinada circunstancia y para que actúen de manera uniforme.',
                    instructions='Elige la respuesta correcta.')))

b45 = B('s045')
S.append(screen('Protocolos de cada servicio', b45[0], objective=O2, src=['s045'],
                interaction=accordion([
                    ('Protocolo de Enfermería', fix(b45[2])),
                    ('Protocolo de Medicina', fix(b45[4])),
                    ('Protocolo de Psicología', join(b45[6], b45[7])),
                    ('Protocolo de Trabajo Social', join(b45[10], b45[11])),
                    ('Protocolo de Fisioterapia', fix(b45[13])),
                    ('Protocolo de Terapia Ocupacional', fix(b45[16])),
                    ('Protocolo de Animación Sociocultural', join(b45[18], b45[19])),
                    ('Protocolo del personal de recepción', join(b45[22], b45[23])),
                ])))
S.append(screen('Conceptos clave de los protocolos', join(b45[8], b45[14]), objective=O2, src=['s045']))
S.append(screen('El trabajo en equipo multiprofesional', join(b45[20], b45[24], b45[25]), objective=O2, src=['s045']))
S.append(screen('Servicios y tareas', 'Relaciona cada servicio con su tarea característica.', objective=O2, src=['s045'],
                interaction=match_pairs([
                    ('Trabajo Social', 'Realiza el ingreso del nuevo usuario, le muestra el centro y le explica las normas de funcionamiento.'),
                    ('Fisioterapia', 'Realiza cualquier tipo de terapia cuyo objetivo sea combatir la dependencia funcional.'),
                    ('Psicología', 'Trata los problemas en la esfera psíquica del usuario y desarrolla sus habilidades sociales.'),
                    ('Animación Sociocultural', 'Realiza actividades lúdicas, culturales y psicoeducativas adaptadas a los gustos de los usuarios.'),
                    ('Personal de recepción', 'Son los primeros en entrar en contacto con cualquier persona que acceda al centro.'),
                ], ok='Todas las parejas son correctas.', ko='Alguna pareja no es correcta: repasa el protocolo de cada servicio.',
                    expl='Cada servicio tiene sus tareas características y todos trabajan coordinados con los demás servicios del centro.')))

# ---------------------------------------------------------------- 3. Principios éticos (s047–s054)
b47 = B('s047')
b48 = B('s048')
b49 = B('s049')
S.append(screen('Derechos y conflictos éticos', join(b47[0], b47[1], b47[2], b47[3]), objective=O3, src=['s047']))
S.append(screen('Resolver los conflictos éticos', join(b47[4], b47[5].replace('cui dar', 'cuidar'), b48[0]), objective=O3, src=['s047', 's048']))
S.append(screen('Principios de la bioética',
                join(b48[1], b49[0].replace('Impotante', 'Importante').replace('::: custom | #6DC3C0 |  | Importante', '::: important')),
                objective=O3, src=['s048', 's049'],
                visual=img(IMG + 'tabla3-1-2eb82b.png',
                           'Tabla de los cuatro principios de la bioética: beneficencia (dar un trato digno y respetuoso y promover el bienestar), no-maleficencia (no hacer daño ni abandonar o maltratar), autonomía (respetar la libertad y capacidad de decisión) y justicia (igual consideración y respeto para todos).',
                           caption=fix(b48[2]).strip('*'), layout='top')))
refl = b49[1].split('\n', 1)[1]
refl = refl.replace('\n:::', '').strip()
refl = refl.replace('2. ¿Cuál', '1. ¿Cuál').replace('3. ¿Qué es la bioética', '2. ¿Qué es la bioética')
S.append(screen('Ética y bioética', refl, type='reflection', objective=O3, src=['s049']))

b50 = B('s050')
S.append(screen('Principio de beneficencia', join(b50[1], b50[2], b50[3], b50[4]), objective=O3, src=['s050']))
b51 = B('s051')
S.append(screen('Principio de no-maleficencia', join(fix(b51[1]), b51[2]), objective=O3, src=['s051']))
S.append(screen('Principio de autonomía', join(fix(b51[4]), b51[5], b51[6]), objective=O3, src=['s051']))
b52 = B('s052')
S.append(screen('Principio de justicia', join(fix(b52[1]), b52[2], b52[3]), objective=O3, src=['s052']))
S.append(screen('Buena y mala actuación profesional',
                'Dos formas de actuar ante los usuarios que no pueden reclamar o quejarse.', objective=O3, src=['s052'],
                interaction=image_cards([
                    (IMG + 'fig3-4-a-f32463.png', 'Mala actuación profesional: atender solo a los usuarios que puedan formular quejas ante la dirección del centro, por temor a las posibles represalias.',
                     'Mala actuación profesional',
                     'Atender sólo a los usuarios que puedan formular quejas ante la dirección del centro, por temor a las posibles represalias.'),
                    (IMG + 'fig3-4-b-4baf99.png', 'Buena actuación profesional: dar el mismo trato a todos los usuarios, incluso a los que tienen dañadas sus capacidades cognitivas y no son capaces de reclamar atención o de formular quejas.',
                     'Buena actuación profesional',
                     'Dar el mismo trato a todos los usuarios, incluso a los que tienen dañadas sus capacidades cognitivas y, por tanto, no son capaces de reclamar atención o de formular quejas ante los superiores.'),
                ])))
S.append(screen('Principios éticos en la práctica', 'Asigna cada situación al principio ético que la fundamenta.', objective=O3, src=['s048', 's050', 's051', 's052'],
                interaction=classification(
                    ['Beneficencia', 'No-maleficencia', 'Autonomía', 'Justicia'],
                    [('Dar al usuario un trato digno y respetuoso y promover su bienestar.', 'Beneficencia'),
                     ('Tener en cuenta lo que el afectado entiende por «su» beneficio.', 'Beneficencia'),
                     ('Abstenerse de hacer daño a otras personas.', 'No-maleficencia'),
                     ('No abusar, abandonar o maltratar al usuario.', 'No-maleficencia'),
                     ('Respetar las decisiones del usuario sobre su proyecto vital y pedir su consentimiento para cualquier actuación.', 'Autonomía'),
                     ('Respetar la libertad y capacidad de decisión del usuario como agente moral.', 'Autonomía'),
                     ('Dar a todos igualdad de oportunidades, sin tener en cuenta su edad, discapacidad o capacidad de defenderse.', 'Justicia'),
                     ('Igual consideración y respeto para todos, sin ningún tipo de marginación o discriminación.', 'Justicia')],
                    ok='Todas las situaciones están en su principio.', ko='Alguna situación está en un principio equivocado. Repasa la Tabla 3.1.',
                    expl='Beneficencia: actuar en beneficio de la persona. No-maleficencia: abstenerse de hacer daño. Autonomía: respetar sus decisiones. Justicia: considerar a todas las personas iguales.')))

b53 = B('s053')
S.append(screen('Derecho a la intimidad', join(b53[1], b53[2], b53[3], b53[5]), objective=O3, src=['s053']))
S.append(screen('Derecho a la dignidad', join(b53[4], b53[6], b53[7]), objective=O3, src=['s053']))
S.append(screen('Respeto a la intimidad en el aseo', 'Una situación cotidiana para aplicar el derecho a la intimidad.', objective=O3, src=['s053'],
                interaction=scenario_decision(
                    'Estás atendiendo el aseo de un usuario y se acerca una persona que no participa en su atención directa.',
                    [('Cuidar de que no se exponga el cuerpo desnudo del usuario ante la persona que no está implicada en la atención.', True,
                      'Correcto: hay que proteger la intimidad del usuario.'),
                     ('Continuar con el aseo sin cambiar nada, porque es el momento de atenderle.', False,
                      'El cuerpo desnudo del usuario no debe exponerse ante personas no implicadas en la atención directa.'),
                     ('Explicar a la persona quién es el usuario y cuál es su diagnóstico clínico.', False,
                      'No se debe desvelar a otros información sobre el diagnóstico clínico del usuario.')],
                    prompt='¿Qué debes hacer?', ok='Correcto: se protege su intimidad.',
                    ko='Piensa en el derecho a la intimidad del usuario durante su atención.',
                    expl='En la atención de las necesidades básicas del usuario (p. ej., el aseo), el profesional debe cuidar que no se exponga el cuerpo desnudo de aquel ante personas no implicadas en la atención directa.')))
S.append(screen('Conducta profesional ante la persona usuaria', '', objective=O3, src=['s054'],
                visual=img(IMG + 'fig3-4-c-5e40e2.png',
                           'Tabla con doce pautas de actitud y conducta profesional: dirigirse al usuario por su nombre; no hablar de él ante otros usuarios ni como si no estuviera delante; respetar su intimidad; mostrar empatía; respetar sus gustos y decisiones; evitar situaciones de nerviosismo; no cambiar sus cosas de sitio; no entrometerse en sus relaciones familiares; no usar sus objetos ni pedir dinero o regalos; no transferirle problemas personales; y no dejar que le afecten conductas molestas.',
                           caption='Cuadro resumen: aplicación práctica de estos principios en la actitud y conducta profesional', layout='top')))
S.append(screen('Conducta profesional ante la persona usuaria', 'Aplica el cuadro resumen a una conducta concreta.', objective=O3, src=['s054'],
                interaction=single_choice(
                    '¿Cuál de estas conductas es una aplicación práctica de los principios éticos?',
                    [('Respetar su intimidad física y personal.', True),
                     ('Hablar del usuario ante otros usuarios.', False),
                     ('Pedir dinero o regalos al usuario.', False),
                     ('Cambiar las cosas de sitio sin su conocimiento.', False)],
                    ok='Correcto.', ko='Esa conducta no respeta los principios éticos. Revisa el cuadro resumen.',
                    expl='Entre las pautas de conducta profesional están respetar su intimidad física y personal, dirigirse al usuario por su nombre y mostrar empatía, comprensión y tolerancia; no hay que hablar de él ante otros, pedirle dinero o regalos ni cambiar sus cosas de sitio sin su conocimiento.')))

# ---------------------------------------------------------------- 4. Atención integral (s055–s061)
b55 = B('s055')
S.append(screen('Plan General de Intervención',
                b55[0], objective=O4, src=['s055'],
                visual=img(IMG + 'tabla3-2-d74bc9.png',
                           'Tabla de servicios indispensables en una residencia: básicos (manutención, alojamiento, asistencia en las AVD, transporte accesible, gimnasio), terapéuticos (atención social, psicológica y sanitaria, terapia ocupacional, cuidados de salud) y complementarios (podología, cafetería, peluquería).',
                           caption=b55[1].strip('*'), layout='top')))
b56 = B('s056')
S.append(screen('Actuación del equipo multidisciplinar', join(b56[1], b56[6]), objective=O4, src=['s056'],
                interaction=tabs([
                    ('Cuidado sanitario', join(b56[2], b56[3])),
                    ('Atención social', join(fix(b56[4]).replace('social,**', 'social**,'), b56[5])),
                ])))
b57 = B('s057')
S.append(screen('Programas de intervención', b57[1], objective=O4, src=['s057'],
                visual=img(IMG + 'fig3-4-d-36b33f.png',
                           'Tabla con los apartados de un programa de intervención: justificación teórica (objetivo principal y objetivos específicos o secundarios), metodología (actividades, terapias, talleres y recursos materiales necesarios) y recursos humanos (planning o planificación temporal y evaluación del programa).',
                           layout='top')))
S.append(screen('Programas de intervención', 'Completa lo que recoge un programa de intervención.', objective=O4, src=['s057'],
                interaction=fill_blanks(
                    'Un programa de intervención consta de una [[justificación teórica]], una [[metodología]] y los [[recursos humanos]].',
                    distractors=['evaluación sanitaria', 'protocolo de recepción'],
                    ok='Correcto.', ko='Revisa los apartados de un programa de intervención.',
                    expl='Los programas de intervención constan de justificación teórica (objetivos), metodología (actividades, terapias, talleres y recursos materiales) y recursos humanos (planificación temporal y evaluación del programa).')))
b58 = B('s058')
S.append(screen('Necesidades de la persona usuaria', fix(b58[2]).strip('*').strip(), objective=O4, src=['s058'],
                visual=img(IMG + 'fig3-3-9f6bf5.png',
                           'Diagrama con tres círculos que se solapan —factores sociales, factores psicológicos y factores biológicos— y, en el centro, el ser humano.',
                           layout='top')))
S.append(screen('Intervenciones imprescindibles en una residencia', b58[3], objective=O4, src=['s058', 's059', 's060'],
                interaction=image_cards([
                    (IMG + 'tabla3-3-a-5462db.png', 'Tabla de intervención sanitaria: alimentación y nutrición, aseo e higiene, prevención y tratamiento de incontinencias, prevención de caídas, control y seguimiento médico de enfermedades y trastornos, y atención de enfermería.',
                     'Intervención sanitaria',
                     '*Tabla 3.3.a Conjunto de intervenciones imprescindibles en una residencia.*\n\n- Alimentación y nutrición\n- Aseo e higiene\n- Prevención y tratamiento de incontinencias\n- Prevención de caídas\n- Control y seguimiento médico de enfermedades y trastornos\n- Atención de enfermería'),
                    (IMG + 'tabla3-3-b-9d2087.png', 'Tabla de intervención terapéutica: terapias funcionales, cognitivas, psicoafectivas y socializadoras, intervención con familias y animación sociocultural.',
                     'Intervención terapéutica',
                     '*Tabla 3.3.b Conjunto de intervenciones imprescindibles en una residencia.*\n\n- Terapias funcionales (rehabilitación funcional, entrenamiento en AVD, psicomotricidad, gerontogimnasia)\n- Terapias cognitivas (orientación a la realidad, psicoestimulación cognitiva, rehabilitación cognitiva)\n- Terapias psicoafectivas (grupos terapéuticos, reminiscencia)\n- Terapias socializadoras (ergoterapia, musicoterapia, ludoterapia, grupos de habilidades sociales y de comunicación, tertulias)\n- Intervención con familias\n- Animación sociocultural'),
                    (IMG + 'tabla3-3-c-491d99.png', 'Tabla de intervención con familias (información, grupos de autoayuda y psicoeducativos, participación) y cuidados paliativos, junto con otros programas como intervenciones ambientales, formación permanente y colaboradores externos.',
                     'Intervención con familias y cuidados paliativos',
                     '*Tabla 3.3.c Conjunto de intervenciones imprescindibles en una residencia.*\n\n**Intervención con familias**\n\n- Información\n- Grupos de autoayuda y psicoeducativos\n- Participación\n\n**Cuidados paliativos**\n\nCualquier otro programa de intervención, además de los mencionados, dirigidos a personas dependientes y/o mayores, que garanticen la calidad de la atención, como:\n\n- Intervenciones ambientales\n- Formación permanente de los profesionales y cuidadores del centro\n- Programa de colaboradores externos (voluntariado, alumnos en prácticas)'),
                ])))
b61 = B('s061')
S.append(screen('Participación de la familia', ' '.join(x.strip('*').strip() for x in b61[1].split('*') if x.strip()), objective=O4, src=['s061'],
                visual=img(IMG + 'fig3-4-31e7dd.png',
                           'Ilustración de un grupo de personas sentadas en círculo en un grupo de ayuda, conversando.',
                           layout='right', media_width='33')))
S.append(screen('Repaso de la atención integral',
                'Responde con tus propias palabras y contrasta después tu respuesta con los criterios.', objective=O4, src=['s061'],
                interaction=case_practice(
                    '¿Qué actuaciones son características en el cuidado sanitario? ¿Qué entiendes por red social? ¿De qué constan los programas de intervención y qué apartados incluyen? ¿Qué programas de intervención requiere cualquier institución?',
                    ['Cuidado sanitario: cuidados básicos, seguimiento de los trastornos y su control terapéutico, alimentación sana y equilibrada, y limpieza, ventilación y orden en las estancias.',
                     'Red social: el campo total de relaciones de una persona o familia (familia, amigos, vecinos y otras personas capaces de aportar ayuda y apoyo real y duradero).',
                     'Los programas constan de justificación teórica, metodología y recursos humanos.',
                     'Programas imprescindibles: intervención sanitaria, intervención terapéutica, intervención con familias y cuidados paliativos.'])))

# ---------------------------------------------------------------- Cierre
S.append(screen('Repaso del tema', 'Repasa los conceptos principales del tema.', objective=O1, src=[],
                interaction=flashcards([
                    ('¿Qué diferencia hay entre dependencia y falta de autonomía?', 'Dependencia es la necesidad de ayuda; la autonomía es la capacidad para tomar decisiones. No hay que confundirlas.'),
                    ('¿Qué es un protocolo de actuación?', 'El conjunto de procedimientos específicos que constituyen un plan detallado y por escrito con las tareas de cada profesional del equipo, expresadas de forma ordenada y explícita.'),
                    ('Principio de beneficencia', 'La obligación de actuar en beneficio de otros, promoviendo sus legítimos intereses y suprimiendo los perjuicios.'),
                    ('Principio de no-maleficencia', 'Abstenerse de hacer daño a otras personas.'),
                    ('Principio de autonomía', 'Tratar a todos los individuos como seres autónomos y respetar sus decisiones en todo lo que afecte a su proyecto vital.'),
                    ('Principio de justicia', 'La obligación de considerar a todas las personas iguales, sin tener en cuenta su edad, discapacidades, enfermedades o capacidad de comunicación.'),
                    ('¿Qué es la bioética?', 'La inclusión de los valores en la toma de decisiones sanitarias y asistenciales, a fin de aumentar su calidad y corrección.'),
                    ('¿Qué es el Plan General de Intervención (PGI)?', 'El plan en el que figuran los servicios disponibles de un centro y los programas de intervención.'),
                ])))
S.append(screen('Pasapalabra del tema', 'Pon a prueba lo aprendido con un rosco de definiciones.', objective=O3, src=[],
                interaction=az_quiz([
                    ('Capacidad para tomar decisiones personales, que no hay que confundir con la dependencia', 'Autonomía'),
                    ('Disciplina que contempla la inclusión de los valores en la toma de decisiones sanitarias y asistenciales', 'Bioética'),
                    ('Órgano de ética asistencial al que se recurre cuando hay conflictos de valores', 'Comité'),
                    ('Derecho que asegura que cada ser humano posee un valor inherente por encima de cualquier circunstancia', 'Dignidad'),
                    ('Servicio que, junto al equipo médico, contribuye al programa sanitario global del centro', 'Enfermería'),
                    ('Servicio que realiza terapias para combatir la dependencia funcional', 'Fisioterapia'),
                    ('Derecho del usuario a mantener ocultos ciertos aspectos de su vida', 'Intimidad'),
                    ('Principio que obliga a considerar a todas las personas iguales', 'Justicia'),
                    ('Plan detallado y por escrito con las tareas de cada profesional del equipo', 'Protocolo'),
                    ('Personal que primero entra en contacto con cualquier persona que acceda al centro', 'Recepción'),
                ])))

# ---------------------------------------------------------------- Síntesis (s062–s065)
S.append(screen('Síntesis: autonomía y dependencia', '', type='summary', objective=O1, src=['s062'],
                visual=img(IMG + 'sintesis3-1-c99354.png', 'Mapa conceptual: la autonomía de la persona dependiente en relación a su atención se compone de dependencia y autonomía.', layout='top')))
S.append(screen('Síntesis: protocolos de actuación', '', type='summary', objective=O2, src=['s063'],
                visual=img(IMG + 'sintesis3-2-a11114.png', 'Mapa conceptual de los protocolos de actuación: Enfermería, Medicina, Psicología, Trabajo Social, Fisioterapia, Terapia Ocupacional, Animación Sociocultural y personal de recepción.', layout='top')))
S.append(screen('Síntesis: principios éticos', '', type='summary', objective=O3, src=['s064'],
                visual=img(IMG + 'sintesis3-3-933448.png', 'Mapa conceptual de los principios éticos de la intervención social: bioética, principios de beneficencia, no-maleficencia, autonomía y justicia, y derecho a la intimidad y la dignidad.', layout='top')))
S.append(screen('Síntesis: atención integral', '', type='summary', objective=O4, src=['s065'],
                visual=img(IMG + 'sintesis3-4-61ed67.png', 'Mapa conceptual de la atención integral en la intervención: actuación del equipo, programas de intervención, intervención sanitaria, terapéutica y con familias, y cuidados paliativos.', layout='top')))

SCREENS = S

GLOSSARY = [
    ('Psicomotricidad', 'Integración de las capacidades cognitivas, emocionales, simbólicas y sensomotrices para ser y expresarse en un contexto psicosocial.'),
    ('Capacidad sensorial', 'Toda actividad relacionada con los cinco sentidos. Cuando falta esta capacidad sensorial, se habla de déficit sensorial.'),
    ('Red social', 'Es el campo total de relaciones de una persona o una familia. Es decir, el grupo de miembros de la familia, amigos, vecinos y otras personas capaces de aportar ayuda y apoyo, real y duradero, a un individuo o familia.'),
]
