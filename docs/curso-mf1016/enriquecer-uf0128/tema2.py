# -*- coding: utf-8 -*-
"""Tema 2 de UF0128 (originales s023–s040): Participación en la organización funcional
de una institución sociosanitaria. Todo el texto sale del original (lib.B / lib.text_of)."""
import re

import lib
from lib import (B, accordion, case_practice, classification, fill_blanks, flashcards,
                 flip_cards, img, join, match_pairs, screen, scenario_decision,
                 single_choice, tabs, true_false, word_search)

O1 = 'Describir la participación del gerocultor o técnico de atención sociosanitaria en el funcionamiento diario de la institución.'
O2 = 'Reconocer cómo el organigrama, los turnos y los horarios determinan la distribución de las tareas en un centro sociosanitario.'
O3 = 'Distinguir los cauces oral y escrito de transmisión de la información y los medios de la comunicación escrita.'
O4 = 'Explicar la planificación de la realización del servicio y los indicadores de calidad de las intervenciones.'
OBJECTIVES = [O1, O2, O3, O4]

GLOSSARY = [
    ('Organigrama', 'Representación gráfica de la estructura organizativa de una empresa u organización.'),
    ('Indicador', 'Medida cuantitativa que puede usarse como guía para controlar y valorar la calidad de los diferentes servicios prestados en una residencia, centro de día, casa tutelada o cualquier otro centro de asistencia sociosanitaria.'),
]


def blk(sid, *idx):
    """Bloques concretos (por índice) de una pantalla original, unidos."""
    bs = B(sid)
    return join([bs[i] for i in idx])


def caption(sid, i):
    """Pie de foto original («*Fig. 6.1. …*») sin asteriscos."""
    return B(sid)[i].strip('*').strip()


def unbox(block):
    """Contenido de una caja `::: custom | … | título` (sin cabecera ni cierre)."""
    return re.sub(r'^::: custom[^\n]*\n+|\n+:::$', '', block).strip()


def case_parts(block):
    """Un «Caso práctico» → (enunciado, solución)."""
    body = unbox(block)
    stmt, _, sol = body.partition('**Solución**')
    return stmt.strip(), sol.strip()


def bullets(block):
    return [re.sub(r'^- ', '', l).strip() for l in block.split('\n') if l.startswith('- ')]


S = []
add = S.append

# 1. Portada y objetivos --------------------------------------------------------------
add(screen('Tema 2. Participación en la organización funcional de una institución sociosanitaria',
           type='cover', objective=O1))
add(screen('Objetivos del tema',
           join('Al terminar este tema serás capaz de:', '\n'.join('- ' + o for o in OBJECTIVES)),
           type='objectives', objective=O1))

# 2. Participación del gerocultor (s023–s024) -------------------------------------------
add(screen('Participación del gerocultor', join(B('s023')), objective=O1, src=['s023']))
add(screen('Importancia de las tareas del gerocultor', '', objective=O1, src=['s024'],
           interaction=tabs([
               ('Cuidados básicos y acompañamiento', join(blk('s024', 0, 1))),
               ('Información al resto del equipo', join(blk('s024', 2, 3))),
           ]),
           notes=['Las dos pestañas agrupan los tres puntos de la lista anterior según el texto que los desarrolla (puntos 1–2 y punto 3); los títulos de pestaña son rótulos añadidos.']))
add(screen('Actividades de la vida diaria', B('s024')[4], objective=O1, src=['s024']))
add(screen('Participación del gerocultor', '', objective=O1,
           interaction=single_choice(
               '¿De qué depende, en gran medida, la efectividad y la eficacia de las actuaciones del equipo multidisciplinar?',
               [('De la correcta transmisión de información al resto del equipo sobre el comportamiento diario de la persona a cargo del gerocultor.', True),
                ('De que el gerocultor sustituya a los demás profesionales en la ejecución de sus planes de intervención.', False),
                ('De que el gerocultor trabaje sin supervisión de otro profesional.', False)],
               ko='No es la opción correcta. Revisa el apartado.',
               expl='De la correcta ejecución de la tarea de proporcionar información relevante y necesaria al resto del equipo depende en gran medida la efectividad y la eficacia de las actuaciones del equipo multidisciplinar: por ejemplo, al exponer alteraciones en el comportamiento del usuario o advertir signos «alarmantes» que indiquen posibles cambios en su evolución.')))

# 3. Distribución de las tareas (s025–s027) -----------------------------------------------
add(screen('El organigrama', blk('s025', 0, 1), objective=O2, src=['s025'],
           visual=img('assets/img/fig6-1-4bfc50.png',
                      'Fotografía a contraluz de un grupo de profesionales de pie conversando y consultando documentos junto a una gran cristalera.',
                      caption('s025', 2), layout='right', media_width='50'),
           notes=['Fotografía de baja resolución (411 px): se coloca al lado del texto, no a todo el ancho.']))
add(screen('Peculiaridades de cada centro', blk('s025', 3, 4), objective=O2, src=['s025']))
add(screen('Organigrama de una residencia', blk('s026', 0, 1), objective=O2, src=['s026'],
           visual=img('assets/img/fig6-2-3763bf.png',
                      'Organigrama de una residencia: Dirección (con Subdirección) de la que dependen la Coordinación de Servicios Sociosanitarios, que agrupa a gerocultores o técnicos de atención sanitaria, enfermería, fisioterapia, atención médica, psicología, terapia ocupacional y trabajo social, y la Coordinación de Servicios Generales, que agrupa a recepción/administración, limpieza/lavandería, mantenimiento/conductor, cocina y podología.',
                      caption('s026', 2), layout='top')))
add(screen('Turnos y horarios', join(blk('s027', 0, 2), B('s027')[1]), objective=O2, src=['s027'],
           notes=['El callout del IMSERSO (originalmente entre los dos párrafos) pasa al final para que el ejemplo siga a la frase que ilustra.']))
add(screen('Turnos y horarios', '', objective=O2,
           interaction=match_pairs(
               [('Servicio de aseo/ducha', 'Tarea propia de los turnos de mañana'),
                ('Acompañamiento a consulta médica', 'Se ajusta a los horarios de dicha consulta'),
                ('Acompañamiento al servicio religioso', 'Una vez a la semana')],
               prompt='Relaciona cada servicio con el momento en que se planifica.',
               expl='Una correcta planificación diferencia por turnos y las especificidades dependen del turno y del día de la semana: el aseo/ducha es propio de los turnos de mañana; el acompañamiento a consulta médica se ajusta a los horarios de la consulta; el acompañamiento al servicio religioso es una vez a la semana.')))
add(screen('Organigrama del centro', unbox(B('s027')[3]).split('. ', 1)[1] if False else re.sub(r'^1\.\s*', '', unbox(B('s027')[3])),
           objective=O2, src=['s027'],
           interaction=case_practice(
               'Piensa tu organigrama (o dibújalo en papel) y compáralo con estos criterios.',
               ['Parte del organigrama tipo de una residencia: mantiene la Dirección (y la Subdirección) en el nivel superior.',
                'Elimina la Coordinación de Servicios Sociosanitarios y la Coordinación de Servicios Generales, de modo que desaparece ese nivel intermedio.',
                'Mantiene todos los servicios que dependían de ellas (atención médica, gerocultores o técnicos de atención sanitaria, enfermería, psicología, fisioterapia, terapia ocupacional, trabajo social, recepción/administración, limpieza/lavandería, mantenimiento/conductor, cocina y podología) y los relaciona directamente con la Dirección.'])))

# 4. Transmisión de la información (s028–s032) ---------------------------------------------
add(screen('Transmisión de la información', join(B('s028')), objective=O3, src=['s028']))
add(screen('Comunicación oral', B('s029')[0], objective=O3, src=['s029'],
           visual=img('assets/img/fig6-3-42652d.png',
                      'Diagrama de flujo de la comunicación oral: al iniciar el turno se revisan las incidencias del turno anterior y se realizan las tareas según la hoja de planificación diaria; si se genera una necesidad de comunicación oral de carácter inmediato, se comunica por vía telefónica o presencial, y si no lo es, se lista para las reuniones periódicas interdisciplinares; si se generan cambios en la planificación de tareas, se reflejan por escrito en la hoja de planificación diaria, y el proceso termina.',
                      caption('s029', 1), layout='top')))
add(screen('Comunicación escrita', B('s031')[0], objective=O3, src=['s030', 's031'],
           visual=img('assets/img/fig6-4-2aff71.png',
                      'Diagrama de flujo de la comunicación escrita: al iniciar el turno se revisan las incidencias del turno anterior y se realizan las tareas según la hoja de planificación diaria; si se producen incidencias, se anotan en el programa informático de gestión o, si no existe, en el libro de incidencias; al finalizar el turno, Coordinación supervisa las incidencias y, si se detectan necesidades de intervención, se reflejan en la hoja de planificación diaria, que se elabora para el turno siguiente.',
                      caption('s030', 0), layout='top')))
_med = bullets(B('s031')[1])
add(screen('Medios de la comunicación escrita', 'Descubre en qué consiste cada uno de los medios de la comunicación escrita.',
           objective=O3, src=['s031'],
           interaction=flip_cards([
               (re.match(r'\*\*(.+?)\.\*\*', m).group(1), re.sub(r'^\*\*.+?\*\*\s*', '', m)) for m in _med])))
_stmt1, _sol1 = case_parts(B('s032')[0])
_q1 = _stmt1[_stmt1.rindex('¿'):]
add(screen('Comunicar una incidencia', '', objective=O3, src=['s032'],
           interaction=scenario_decision(
               _stmt1[:_stmt1.rindex('¿')].strip(),
               [('Comunicar la anomalía al departamento de coordinación, que la trasladará al de psicología para que indague los motivos.', True,
                 'Es el cauce correcto: el técnico transmite la información y el equipo investiga la causa.'),
                ('Consolar a la señora María y no comunicar nada, porque llorar al acostarse es normal.', False,
                 'Una conducta nueva o llamativa de la persona a su cargo debe transmitirse al equipo.'),
                ('Esperar a que el problema desaparezca por sí solo, sin dejar constancia de lo ocurrido.', False,
                 'Sin transmitir la información, el equipo no puede actuar.')],
               prompt=_q1, expl=_sol1)))

# 5. Indicadores de calidad (s033–s038) -----------------------------------------------------
add(screen('Calidad de las intervenciones', blk('s033', 0, 1), objective=O4, src=['s033']))
add(screen('Calidad de las intervenciones', blk('s033', 2, 3), objective=O4, src=['s033']))
add(screen('Actuaciones complementarias', blk('s033', 4, 5, 6), objective=O4, src=['s033']))
_plan = bullets(B('s034')[3])
add(screen('Planificación del servicio', blk('s034', 1, 2), objective=O4, src=['s034'],
           interaction=accordion([
               ('Objetivos de calidad', _plan[0]),
               ('Necesidades de recursos', _plan[1]),
               ('Documentos y registros del sistema de calidad', _plan[2]),
               ('Gestión de contratos', _plan[3])]),
           notes=['Los cuatro apartados eran viñetas sin rótulo; los títulos del desplegable son rótulos añadidos y el cuerpo es la viñeta original.']))
add(screen('Planificación del servicio', '', objective=O4,
           interaction=fill_blanks(
               'La planificación de los procesos se realiza a partir del análisis de las necesidades de los [[usuarios]], las [[administraciones]] y la [[sociedad]], o bien a partir de la modificación de los existentes.',
               distractors=['proveedores', 'competidores'],
               expl='La planificación de los procesos se realiza a partir del análisis de las necesidades de los usuarios, las administraciones y la sociedad, o bien a partir de la modificación de los existentes debido a cambios en las actividades operativas, en la legislación o por requerimientos del usuario.')))
add(screen('Servicios del proceso de salud', B('s035')[1], objective=O4, src=['s035']))
add(screen('Control mediante indicadores', join(blk('s034', 4, 5), B('s036')[1]), objective=O4, src=['s034', 's036'],
           notes=['Los dos párrafos que abren los indicadores (originalmente antes del cuadro de servicios) pasan detrás de él, junto a la definición de indicador.']))
add(screen('Indicadores de calidad', '', objective=O4,
           interaction=true_false(
               'Los indicadores de calidad solo pueden utilizarse para valorar los servicios prestados en una residencia.', False,
               expl='Un indicador es una medida cuantitativa que sirve de guía para controlar y valorar la calidad de los servicios prestados en una residencia, centro de día, casa tutelada o cualquier otro centro de asistencia sociosanitaria.')))
add(screen('Cómo construir un indicador', blk('s036', 2, 3), objective=O4, src=['s036']))
_stmt2, _sol2 = case_parts(B('s037')[0])
_q2 = _stmt2[_stmt2.rindex('¿'):]
add(screen('Indicadores en la restauración', '', objective=O4, src=['s037'],
           interaction=scenario_decision(
               _stmt2[:_stmt2.rindex('¿')].strip(),
               [('Dos indicadores: las analíticas de los productos preparados y las analíticas de las superficies.', True,
                 'Ambos indicadores permiten controlar el proceso de restauración y sus resultados deben estar dentro de los parámetros de la legislación vigente.'),
                ('Un único indicador: el número de comidas servidas en cada turno.', False,
                 'Ese dato mide la cantidad, no si el servicio se ofrece de forma correcta.'),
                ('Un único indicador: el número de quejas verbales recibidas en el comedor.', False,
                 'No controla las fases del proceso (almacenamiento, preparación y elaboración) que garantizan un servicio correcto.')],
               prompt=_q2, expl=_sol2)))
_stmt3, _sol3 = case_parts(B('s038')[0])
add(screen('Indicadores en la encuesta de satisfacción', _stmt3, objective=O4, src=['s038'],
           interaction=fill_blanks(
               'Los indicadores de calidad estarían representados por las respuestas [[negativas]], cuyo número porcentual debería ser inferior al [[25]] por ciento para que se considerase que los usuarios y sus familiares se encuentran satisfechos con los servicios ofrecidos en la institución.',
               distractors=['positivas', '50', '75'],
               instructions='Completa la solución del caso eligiendo la palabra o el número correctos.',
               expl=re.sub(r'^En este caso, ', '', _sol3))))
add(screen('Servicios y equipo multiprofesional', re.sub(r'^2\.\s*', '', unbox(B('s038')[1])),
           type='reflection', objective=O4, src=['s038']))

# 6. Cierre -----------------------------------------------------------------------------
add(screen('Repaso del tema', '', objective=O4,
           interaction=flashcards([
               ('¿Qué es un organigrama?', 'La representación gráfica de la estructura organizativa de una empresa u organización.'),
               ('¿Qué queda establecido por ley en cuanto al personal de un centro?', 'El número de gerocultores o técnicos sociosanitarios, según el número de usuarios, así como el de otros profesionales necesarios para la atención especializada.'),
               ('¿Cuáles son los dos cauces para transmitir la información?', 'La transmisión oral y la transmisión escrita.'),
               ('¿Para qué sirve el cuaderno de incidencias?', 'Para recoger todas las situaciones «anómalas» que se producen en un turno de trabajo, identificando al usuario y al trabajador que recoge la información.'),
               ('¿Qué función tienen las hojas de planificación?', 'Complementan los demás medios de comunicación escrita y marcan las pautas de actuación al equipo multidisciplinar.'),
               ('¿Qué dos actuaciones complementarias hay que establecer para controlar la calidad?', 'La planificación de la realización del servicio y el establecimiento de una serie de indicadores de calidad.'),
               ('¿Qué es un indicador de calidad?', 'Una medida cuantitativa que se usa como guía para controlar y valorar la calidad de los servicios prestados en un centro de asistencia sociosanitaria.')])))
add(screen('Vocabulario del tema', '', objective=O4,
           interaction=word_search(['ORGANIGRAMA', 'GEROCULTOR', 'TURNOS', 'HORARIOS', 'INCIDENCIAS', 'CUADERNO', 'INDICADOR', 'CALIDAD', 'SERVICIO', 'USUARIO'])))
add(screen('Resumen del tema',
           '\n'.join([
               '- El gerocultor o técnico en atención sociosanitaria forma parte del equipo interdisciplinar y su labor es primordial en el funcionamiento diario de la institución.',
               '- La distribución de las tareas, los horarios y los turnos depende del organigrama de cada institución.',
               '- La información se transmite de forma oral o escrita; la escrita se apoya en el cuaderno de incidencias, los programas informáticos de gestión y las hojas de planificación.',
               '- La calidad de las intervenciones se controla con la planificación de la realización del servicio y con indicadores medibles, evaluados periódicamente.']),
           type='summary', objective=O4,
           notes=['Resumen redactado con frases del propio tema (material añadido).']))
add(screen('Síntesis: participación y distribución', '', type='summary', objective=O4, src=['s039'],
           visual=img('assets/img/sintesis6-1-b880d3.png',
                      'Esquema de síntesis: la participación del gerocultor comprende los cuidados básicos del usuario, el acompañamiento en actividades de la vida diaria y la información al resto del equipo; la distribución de las tareas se apoya en el organigrama.',
                      layout='top')))
add(screen('Síntesis: información y calidad', '', type='summary', objective=O4, src=['s040'],
           visual=img('assets/img/sintesis6-2-f411f8.png',
                      'Esquema de síntesis: la transmisión de la información puede ser comunicación oral o escrita (cuaderno de incidencias, programa informático de gestión y hojas de planificación); los indicadores de calidad en la intervención incluyen la planificación del servicio y los indicadores.',
                      layout='top')))

SCREENS = S
