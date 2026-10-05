# -*- coding: utf-8 -*-
"""UF0128 · Tema 3 — Plan de cuidados individualizado y documentación básica de trabajo.
Originales: s041–s055."""
import re

from lib import (B, screen, img, join, single_choice, true_false, fill_blanks, match_pairs,
                 classification, sort_steps, case_practice, accordion, tabs, flip_cards,
                 flashcards, crossword, image_cards)

IMG = 'assets/img/'

# Objetivos (texto exacto repetido en cada pantalla que los desarrolla)
O1 = 'Describir el Plan de Atención Individualizado (PAI), las necesidades básicas que atiende y los profesionales que participan en él.'
O2 = 'Distinguir el PAI del Plan Individual de Actuación (PIA) y reconocer los niveles de prestación de servicios.'
O3 = 'Identificar la documentación del usuario: expediente, valoraciones, registro de incidencias y datos mínimos del PAI.'
O4 = 'Reconocer cómo se transmite la información al equipo interdisciplinario.'
OBJECTIVES = [O1, O2, O3, O4]

GLOSSARY = [
    ('PAI (Plan de Atención Individualizado)',
     'Instrumento que permite reflejar, objetivar y plasmar de forma concreta las actividades que una institución debe llevar a cabo para prevenir, mantener y mejorar las necesidades básicas de los usuarios.'),
    ('PIA (Plan Individual de Actuación)',
     'Instrumento a través del cual se hace un plan personalizado para la persona dependiente.'),
]


def cap(block):
    """Pie de foto: «*Fig. 7.1. …*» → «Fig. 7.1. …»."""
    return block.strip().strip('*').strip()


b41, b42, b43, b44 = B('s041'), B('s042'), B('s043'), B('s044')
b45, b46, b47, b48, b49 = B('s045'), B('s046'), B('s047'), B('s048'), B('s049')
b50, b51 = B('s050'), B('s051')

S = []

# ------------------------------------------------------------------ portada y objetivos
S.append(screen('Tema 3. Plan de cuidados individualizado y documentación básica de trabajo', '', type='cover'))
S.append(screen('Objetivos del tema', join(*[f'- {o}' for o in OBJECTIVES]), type='objectives', objective=O1,
                notes=['Objetivos redactados a partir del contenido del tema; revisar con la ficha del módulo.']))

# ------------------------------------------------------------------ 1. PAI (s041)
S.append(screen('Plan de Atención Individualizado', join(b41[0:3]), objective=O1, src=['s041', 's042'],
                visual=img(IMG + 'fig7-2-f863a8.png',
                           'Grupo de profesionales sanitarios con bata y uniforme conversando en un pasillo de un centro.',
                           caption=cap(b42[4]), layout='right', media_width='50')))
S.append(screen('Cambios y familia en el PAI', join(b41[3:5]), objective=O1, src=['s041']))

# ------------------------------------------------------------------ 1.1 Maslow (s042, s043)
S.append(screen('Necesidades básicas del usuario', join(b42[1:4]), objective=O1, src=['s042']))
S.append(screen('Pirámide de Maslow', b43[1], objective=O1, src=['s043'],
                visual=img(IMG + 'fig7-1-a8c30c.jpg',
                           'Pirámide de cinco niveles. De la base a la cima: fisiológicas, seguridad, sociales, estima y autorrealización.',
                           caption=cap(b43[2]), layout='top')))

niveles = []
for line in b43[3].split('\n'):
    m = re.match(r'- \*\*(.+?)\*\*\s*(.+)$', line)
    niveles.append((m.group(1).rstrip('.'), m.group(2)))
S.append(screen('Niveles de la pirámide de Maslow', 'Despliega cada nivel para ver qué necesidades abarca.', objective=O1, src=['s043'],
                interaction=accordion(niveles)))
S.append(screen('Niveles de la pirámide de Maslow', '', objective=O1, notes=[],
                interaction=sort_steps(
                    ['Necesidades fisiológicas', 'Necesidades de seguridad y protección', 'Necesidades de afiliación y afecto',
                     'Necesidades de estima', 'Auto-realización o auto-actualización'],
                    prompt='Ordena los niveles de la pirámide de Maslow, desde la base hasta la cima.',
                    instructions='Coloca primero las necesidades que se deben cubrir antes que las demás.',
                    ok='Orden correcto.',
                    ko='El orden no es correcto: las necesidades de los niveles más altos solo se empiezan a cubrir cuando se han satisfecho las de los niveles inferiores.',
                    expl='La jerarquía de Maslow va de las necesidades fisiológicas (base) a la auto-realización (cima); las de niveles superiores solo se empiezan a cubrir cuando ya se han satisfecho las inferiores.')))

# ------------------------------------------------------------------ 1.2 Profesionales (s044)
S.append(screen('Profesionales del PAI', b44[1], objective=O1, src=['s044'],
                interaction=case_practice(
                    '¿Qué es el PAI? ¿Qué profesionales estarán implicados en este plan? ¿Cómo actuarán dichos profesionales individualmente o desde una perspectiva interdisciplinar? Razona tu respuesta.',
                    ['Define el PAI como el instrumento que concreta las actividades que el centro debe llevar a cabo para prevenir, mantener y mejorar las necesidades básicas de los usuarios',
                     'Cita a los profesionales implicados: médico, enfermero, psicólogo, fisioterapeuta, trabajador social, terapeuta ocupacional y gerocultor o técnico de atención sociosanitaria',
                     'Explica que el PAI se elabora de forma interdisciplinaria, con objetivos, profesionales responsables y calendario de aplicación compartidos'])))

# ------------------------------------------------------------------ 2. PIA (s045, s046)
S.append(screen('Plan Individual de Actuación (PIA)', join(b45[0:2]), objective=O2, src=['s045']))
S.append(screen('Qué se valora en el PIA', join(b45[2:4]), objective=O2, src=['s045']))
S.append(screen('Niveles de prestación de servicios', join(b45[4], b45[5], b45[7]), objective=O2, src=['s045'],
                notes=['Las dos tarjetas transcriben el texto de las imágenes de la Tabla 7.1: contrastar con las imágenes originales.'],
                interaction=image_cards([
                    (IMG + 'tabla7-1-a-044b71.png',
                     'Tabla con el encabezado «Prestación dentro del domicilio» y cinco filas de circunstancias a considerar.',
                     'Prestación dentro del domicilio',
                     '- Impacto de las intervenciones en la vida del usuario.\n- La percepción sobre su vida, su red de apoyo y su futuro.\n- Dificultades para la relación interpersonal y la convivencia.\n- La complejidad y dificultad en la prestación de los apoyos.\n- La provisión de conexión con otros profesionales.'),
                    (IMG + 'tabla7-1-b-838981.png',
                     'Tabla con el encabezado «Prestación fuera del domicilio» y dos filas de circunstancias a considerar.',
                     'Prestación fuera del domicilio',
                     '- Idoneidad de los cuidados que se le prestan.\n- Síntesis de las necesidades y potencialidades detectadas: garantía técnica para la prescripción de los servicios y prestaciones sociales.')])))
S.append(screen('Informe social', b46[0], objective=O2, src=['s046']))
S.append(screen('Informe social', 'Intenta recordar qué recoge el informe social antes de comprobar los criterios.', objective=O2, src=['s051'],
                interaction=case_practice(
                    '¿Qué aspectos debe recoger el informe social que se hace de cada usuario? Razona tu respuesta.',
                    ['Identificación del usuario', 'Antecedentes de la persona', 'Motivo del informe', 'Situación de dependencia',
                     'Situación de convivencia', 'Entorno',
                     'Expectativas de la unidad de convivencia, con especial referencia al cuidador principal',
                     'Valoración técnica y diagnóstico social'])))
S.append(screen('PAI y PIA', '', objective=O2,
                interaction=classification(
                    ['PAI', 'PIA'],
                    [('Lo establece cada centro de atención sociosanitaria.', 'PAI'),
                     ('Es interdisciplinario: define los objetivos asistenciales y terapéuticos, los profesionales responsables y el calendario de aplicación.', 'PAI'),
                     ('Incorpora las actuaciones, circunstancias y cambios que suceden en la vida de la persona.', 'PAI'),
                     ('Se introduce con la Ley de Autonomía y Dependencia.', 'PIA'),
                     ('Los trabajadores sociales determinan la ayuda o prestación que mejor satisface las necesidades de la persona dependiente.', 'PIA'),
                     ('Los servicios tienen siempre prioridad sobre las prestaciones económicas.', 'PIA'),
                     ('Es imprescindible adjuntarle un informe social.', 'PIA')],
                    prompt='Clasifica cada característica según corresponda al PAI o al PIA.',
                    ok='Todo está bien clasificado.',
                    ko='Alguna característica está en la categoría equivocada. Repasa qué es el PAI y qué es el PIA.',
                    expl='El PAI es el plan interdisciplinario que establece cada centro; el PIA se introduce con la Ley de Autonomía y Dependencia y lo determinan los trabajadores sociales, con prioridad de los servicios sobre las prestaciones económicas y con un informe social adjunto.')))

# ------------------------------------------------------------------ 3. Expediente (s047, s048)
exp_reuniones = b47[2]
exp_protocolo = re.sub(r'^- ', '', b47[3])
S.append(screen('Seguimiento del usuario', join(b47[0], b47[1]), objective=O3, src=['s047'],
                interaction=tabs([('Reuniones de equipo', exp_reuniones),
                                  ('Protocolo de valoración inicial', exp_protocolo)])))
S.append(screen('Valoración integral', join(b48[0], b48[1]), objective=O3, src=['s048']))
p_esc = b48[2]
S.append(screen('Escalas de valoración',
                'Para realizar esas valoraciones se suelen utilizar cuestionarios o escalas estándar. Por ejemplo:',
                objective=O3, src=['s048'],
                notes=['El párrafo original sobre las escalas (Barthel, Katz, Lawton, Tinneti, Yesavage) se reparte en las tarjetas, con las mismas palabras.'],
                interaction=flip_cards([
                    ('Escalas de Barthel y Katz', 'Se emplean para medir la funcionalidad básica para realizar las actividades de la vida diaria.'),
                    ('Escala de Lawton', 'Se emplea para medir la funcionalidad instrumental referida a las actividades de la vida diaria.'),
                    ('Escala de Tinneti', 'Si se trata de valorar la marcha y el equilibrio, una de las más utilizadas.'),
                    ('Test de Yesavage', 'A nivel psicológico, es importante realizar el test de depresión geriátrica de Yesavage, que valora tanto el estado de ánimo como el deterioro cognitivo.')])))
S.append(screen('Escalas de valoración', '', objective=O3,
                interaction=match_pairs(
                    [('Escalas de Barthel y Katz', 'Funcionalidad básica para las actividades de la vida diaria'),
                     ('Escala de Lawton', 'Funcionalidad instrumental referida a las actividades de la vida diaria'),
                     ('Escala de Tinneti', 'Marcha y equilibrio'),
                     ('Test de Yesavage', 'Estado de ánimo y deterioro cognitivo (depresión geriátrica)')],
                    prompt='Relaciona cada escala o test con lo que valora.',
                    expl='Barthel y Katz miden la funcionalidad básica; Lawton, la instrumental; Tinneti, la marcha y el equilibrio; y el test de Yesavage, el estado de ánimo y el deterioro cognitivo.')))
S.append(screen('Contenido mínimo del PAI', join(b48[3], b49[3]), objective=O3, src=['s048', 's049'],
                notes=['La caja sobre la revisión anual del Plan (s049) se adelanta junto a la de los datos mínimos del PAI.']))
S.append(screen('Contenido mínimo del PAI', '', objective=O3,
                interaction=fill_blanks(
                    'El Plan de Atención Individualizado debe contener, como mínimo, los datos del [[usuario]], la fecha de [[ingreso]], la identificación del equipo [[interdisciplinario]] con su firma y una evaluación [[periódica]]. Su revisión se hará una vez al [[año]], salvo que requiera modificar los objetivos de atención.',
                    distractors=['mes', 'multidisciplinar'],
                    expl='El PAI recoge los datos del usuario, las fechas de ingreso, de realización y de evaluación, la identificación y firma del equipo interdisciplinario, las áreas relevantes de atención, objetivos claros y alcanzables y su evaluación periódica; se revisa una vez al año, salvo que haya que modificar los objetivos.')))

# ------------------------------------------------------------------ 4. Registro de incidencias (s049)
S.append(screen('Registro de incidencias', join(b49[0], b49[1]), objective=O3, src=['s049']))
ctrl = b49[2]
intro_ctrl, lista_ctrl = ctrl.split('siguientes controles de incidencias: ')
items_ctrl = [x.strip().rstrip('.') for x in lista_ctrl.split(';')]
items_ctrl = [x[:1].upper() + x[1:] + '.' for x in items_ctrl]
S.append(screen('Controles de incidencias en residencias',
                intro_ctrl + 'siguientes controles de incidencias:\n\n' + '\n'.join(f'- {x}' for x in items_ctrl),
                objective=O3, src=['s049'],
                notes=['La enumeración separada por punto y coma del original se presenta como lista, con las mismas palabras.']))
S.append(screen('Registro de incidencias', '', objective=O3,
                interaction=single_choice(
                    'En un centro con tres turnos diarios, ¿quién lleva el control del registro de incidencias?',
                    [('Un encargado en cada uno de los turnos.', True, 'Correcto: si hay tres turnos, hay un encargado en cada uno.'),
                     ('Solo el director del centro, una vez a la semana.', False, 'El control se lleva diariamente, por una persona designada o por un encargado en cada turno.'),
                     ('Únicamente el equipo de limpieza y seguridad.', False, 'Hay controles de incidencias en varias áreas, pero el control lo lleva una persona designada o un encargado por turno.')],
                    ok='Correcto.', ko='Revisa el apartado: el control es diario.',
                    expl='El control lo lleva diariamente una persona designada a tal efecto o, en caso de existir tres turnos diarios, un encargado en cada uno de ellos.')))

# ------------------------------------------------------------------ 5. Documentación (s050)
S.append(screen('Documentación sociosanitaria', '', objective=O3, src=['s050'],
                interaction=tabs([('Registros diarios', b50[0]), ('Documentos de trabajo social', b50[1])])))

# ------------------------------------------------------------------ 6. Transmisión de la información (s051)
S.append(screen('Transmisión de la información', join(b51[0], b51[1]), objective=O4, src=['s051'],
                visual=img(IMG + 'fig7-3-9c5acd.png',
                           'Esquema en aspa: la colaboración, en el centro, une cuatro ideas: compartir, independencia, compañerismo y poder simétrico.',
                           caption=cap(b51[2]), layout='right', media_width='50')))
S.append(screen('Función de la asistencia sociosanitaria', b51[3], objective=O4, src=['s051']))
S.append(screen('Función de la asistencia sociosanitaria', '', objective=O4,
                interaction=true_false(
                    'La función propia del PAI es hacer por la persona usuaria todas las actividades que no puede realizar.',
                    False,
                    ko='Es falso: la función propia de la asistencia sociosanitaria es ayudar a la persona a adquirir la mayor independencia posible.',
                    expl='La función de la asistencia sociosanitaria, y por tanto del PAI, es asistir al individuo en las actividades que contribuyen a mejorar su salud y que él mismo haría sin ayuda si tuviera la fuerza, la voluntad o el conocimiento necesarios: se trata de ayudarle a adquirir la mayor independencia posible, según su estado de salud.')))

# ------------------------------------------------------------------ cierre
S.append(screen('Repaso del tema', 'Repasa los conceptos clave del tema.', objective=O1,
                interaction=flashcards([
                    ('¿Qué es el PAI?', 'El Plan de Atención Individualizado: el instrumento que permite reflejar, objetivar y plasmar de forma concreta las actividades que una institución debe llevar a cabo para prevenir, mantener y mejorar las necesidades básicas de los usuarios.'),
                    ('¿Cómo ordena las necesidades básicas la pirámide de Maslow?', 'En cinco niveles: fisiológicas, seguridad y protección, afiliación y afecto, estima y auto-realización. Las de los niveles altos solo se empiezan a cubrir cuando se han satisfecho las inferiores.'),
                    ('¿Qué es el PIA?', 'El Plan Individual de Actuación: un instrumento a través del cual se hace un plan personalizado para la persona dependiente; los trabajadores sociales determinan la ayuda o prestación que mejor satisface sus necesidades.'),
                    ('¿Qué niveles hay en la prestación de servicios?', 'Dos: dentro del propio domicilio y fuera del domicilio (residencia, centro de día, etc.).'),
                    ('¿Qué tres aspectos contempla la valoración integral de un usuario?', 'El social (familia y relaciones), el físico (salud y funcionalidad) y el psicológico (cognitivo y psicopatológico).'),
                    ('¿Qué es el registro de incidencias?', 'Una base de datos o un conjunto de hojas en las que se anotan las situaciones extraordinarias que pudieran afectar al tratamiento de la información o a sus soportes.'),
                    ('¿Cada cuánto se revisa el PAI?', 'Una vez al año, a no ser que requiera una modificación de los objetivos de atención planteados.'),
                    ('¿Cómo se transmite la información al equipo?', 'Con reuniones del equipo interdisciplinario, informes diarios de los profesionales y la elaboración del PAI.')])))
S.append(screen('Pasatiempo del tema', 'Completa el crucigrama con conceptos del tema.', objective=O3,
                interaction=crossword([
                    ('EXPEDIENTE', 'Documento del usuario basado en las valoraciones de cada profesional y en las incidencias de su salud'),
                    ('INCIDENCIAS', 'Situaciones extraordinarias que se anotan en un registro'),
                    ('VALORACION', 'Evaluación inicial e integral del usuario: social, física y psicológica'),
                    ('MASLOW', 'Autor de la pirámide que ordena las necesidades básicas'),
                    ('BARTHEL', 'Escala que mide la funcionalidad básica para las actividades de la vida diaria'),
                    ('YESAVAGE', 'Test de depresión geriátrica'),
                    ('PRESTACION', 'Ayuda que determinan los trabajadores sociales en el PIA'),
                    ('REUNIONES', 'Se celebran en equipo para seguir la evolución del usuario'),
                    ('INFORMES', 'Documentos diarios de los profesionales sobre tratamientos, medicación o curas'),
                    ('DEPENDENCIA', 'Situación de la persona cuyo grado se reconoce y consta en el PIA')])))

# ------------------------------------------------------------------ resumen y síntesis
S.append(screen('Resumen del tema',
                join('- El PAI es el instrumento que concreta las actividades que el centro debe llevar a cabo para cubrir las necesidades básicas de los usuarios, y en él participan todos los profesionales del cuidado sociosanitario.',
                     '- Las necesidades básicas se ordenan en la pirámide de Maslow, de las fisiológicas a la auto-realización.',
                     '- El PIA, introducido con la Ley de Autonomía y Dependencia, determina la ayuda o prestación que mejor satisface las necesidades de la persona dependiente, dentro o fuera del domicilio.',
                     '- El expediente del usuario recoge la valoración integral (social, física y psicológica) y se actualiza con el seguimiento del equipo.',
                     '- El registro de incidencias y la documentación sociosanitaria completan la información del usuario.',
                     '- La información se transmite al equipo mediante reuniones, informes diarios y la elaboración del PAI.').replace('\n\n- ', '\n- '),
                type='summary', objective=O1,
                notes=['Resumen redactado con frases del propio tema; revisar.']))
S.append(screen('Síntesis: el PAI', '', type='summary', objective=O1, src=['s052'],
                visual=img(IMG + 'sintesis7-1-d49c73.png',
                           'Mapa conceptual: el Plan de Atención Individualizado (PAI) se divide en necesidades básicas (pirámide de Maslow: fisiológicas, seguridad y protección, afiliación y afecto, estima y auto-realización) y profesionales implicados.',
                           layout='top')))
S.append(screen('Síntesis: PIA y expediente del usuario', '', type='summary', objective=O2, src=['s053'],
                visual=img(IMG + 'sintesis7-2-3232bd.jpg',
                           'Mapa conceptual: el Plan Individual de Actuación (PIA) distingue prestación en el domicilio y fuera del domicilio; el expediente del usuario incluye reuniones de equipo, valoración inicial y valoración integral (social, física y psicológica).',
                           layout='top')))
S.append(screen('Síntesis: registro y documentación', '', type='summary', objective=O3, src=['s054'],
                visual=img(IMG + 'sintesis7-3-460844.png',
                           'Esquema: el registro de incidencias se basa en el control diario; la documentación sociosanitaria incluye el grado de dependencia.',
                           layout='top')))
S.append(screen('Síntesis: transmisión de la información', '', type='summary', objective=O4, src=['s055'],
                visual=img(IMG + 'sintesis7-4-65f7a2.png',
                           'Esquema: la transmisión de información al equipo se apoya en reuniones interdisciplinarias, informes diarios y la elaboración del PAI.',
                           layout='top')))

SCREENS = S
