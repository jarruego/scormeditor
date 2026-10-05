# -*- coding: utf-8 -*-
"""Tema 1 de UF0127 · Instituciones de atención a personas dependientes y equipo interdisciplinar.

Originales: s001–s022. Todo el texto sale del original (lib.B / lib.text_of); solo se
trocea y se reparte entre pantallas e interacciones."""
import re

from lib import (B, accordion, az_quiz, callout, case_practice, classification, clean, crossword,
                 fill_blanks, flashcards, image_cards, img, join, match_pairs, scenario_decision,
                 screen, single_choice, tabs, true_false, word_search)

O1 = 'Reconocer las características de las instituciones de atención a personas dependientes y de los servicios sociales en España.'
O2 = 'Diferenciar los tipos de servicios de asistencia a personas dependientes: ayuda a domicilio, teleasistencia, centros de día y residencias.'
O3 = 'Identificar las funciones de los profesionales del equipo interdisciplinar y del resto del personal del centro.'
OBJECTIVES = [O1, O2, O3]

GLOSSARY = [('Ánimo de lucro', 'Actividad que tiene como fin la obtención de un beneficio económico.')]


def inner(block):
    """Cuerpo de un callout, sin marcas ni numeración de ejercicio."""
    lines = block.split('\n')[1:-1]
    return '\n'.join(lines).strip()


def unnum(t):
    """Quita «1. » al inicio de párrafos de un ejercicio."""
    return re.sub(r'(?m)^\d+\.\s+', '', t)


def fix(t, *pairs):
    for a, b in pairs:
        assert a in t, a
        t = t.replace(a, b)
    return t


def cap(block):
    """Pie de foto: quita los asteriscos de cursiva."""
    return block.strip('*').strip()


s001, s002, s003, s004, s005, s006, s007, s008, s009, s010, s011, s019 = (
    B(x) for x in ['s001', 's002', 's003', 's004', 's005', 's006', 's007', 's008', 's009', 's010', 's011', 's019'])

# --- arreglos de extracción -------------------------------------------------
s006[1] = fix(s006[1], ('- Residencias Los tres primeros', '- Residencias\n\nLos tres primeros'))
s006[5] = fix(s006[5], ('Lo prestación', 'La prestación'))
s009[5] = fix(s009[5], ('medioalto', 'medio-alto'))
s010[9] = fix(s010[9], ('sani taria', 'sanitaria'), ('respon sables', 'responsables'))

# los dos bullets de condiciones (s002[1]) se reparten en pestañas
_cond = s002[1].split('\n')
_prox = re.sub(r'^- \*\*Proximidad física\*\*, es decir', 'Es decir', _cond[0])
_inter = re.sub(r'^- \*\*Intercambios bidireccionales\*\*, es decir', 'Es decir', _cond[1])

# motivos de la iniciativa privada (s004[5]) → acordeón
_motivos = [l[2:] for l in s004[5].split('\n')]
_m_titles = ['Mala coordinación', 'Criterios de acceso', 'Predominio de las residencias', 'Reconocimiento profesional']

# alternativas (callout fact de s006[7]) se mantiene entero
FACT_ALT = s006[7]

# acceso a residencias (s009[5]) → pestañas
_acc = re.split(r'(?<=\.) ', s009[5], maxsplit=2)
assert len(_acc) == 3

# --- Reflexiona -------------------------------------------------------------
_r5 = unnum(inner(s005[4]))
_r5_q1, _r5_q2 = _r5.split('\n\n', 1)[0], _r5.split('\n\n', 1)[1]
_r5_q2_intro, _r5_q2_stmt = _r5_q2.split('\n\n', 1)
_r9 = unnum(inner(s009[4]))
_r19 = unnum(inner(s019[5]))

TABLES = [
    ('assets/img/tabla2-2-1f051c.png', 'Técnicos de asistencia sanitaria', 'Tabla 2.2. Funciones de los técnicos de asistencia sanitaria.',
     'Tabla de funciones de los técnicos de asistencia sanitaria: orden y mantenimiento de los enseres del usuario, cama, comidas, actividades de la vida diaria, acompañamiento, traslados, cambios posturales, hidratación, avisos de incidencias y preparación de fallecidos.',
     ['Ordenar y mantener los enseres del usuario: ayudas técnicas (p. ej., prótesis auditiva), útiles de aseo personal y ropa.',
      'Hacer diariamente la cama, cambiando y retirando las sábanas usadas.',
      'Repartir y retirar los alimentos en la habitación, si el estado del usuario no le permite utilizar el comedor.',
      'Atender y cuidar al usuario en las actividades de la vida diaria, siguiendo las pautas marcadas por los terapeutas.',
      'Acompañar permanente en las salas comunes a los usuarios dependientes (p. ej., con silla de ruedas).',
      'Trasladar a los usuarios que precisen de ayuda dentro de las instalaciones del centro y a otros espacios si así se regula.',
      'Realizar a los usuarios los cambios posturales pautados por el especialista.',
      'Hidratar con agua o zumos, al menos dos veces al día, a los usuarios que lo necesiten.',
      'Solicitar la atención del profesional correspondiente si se producen incidencias o alteraciones en la salud del usuario.',
      'Preparar a los fallecidos y trasladados a las dependencias destinadas a tal efecto.',
      'Comunicar cualquier incidencia al responsable que corresponda.']),
    ('assets/img/tabla2-3-af3fe3.png', 'Enfermería', 'Tabla 2.3. Funciones de los titulados en enfermería.',
     'Tabla de funciones de los titulados en enfermería: seguimiento de problemas de salud, cuidados propios, primera atención, dietas, urgencias, medicación, material de farmacia, higiene y comunicación con familiares.',
     ['Seguir la evolución y control de los problemas de salud, en colaboración con el médico.',
      'Llevar a cabo los cuidados de salud propios de la enfermería (toma de muestras para analíticas, curas, etc.).',
      'Primera atención en caso de incidencias de salud de gravedad moderada.',
      'Prescripción de dietas, coordinación con los servicios de cocina y control de lo prescrito por el médico.',
      'Avisar a los recursos externos de salud en caso de urgencias y seguir el contacto con el usuario hospitalizado.',
      'Organizar y preparar la medicación pautada. Organizar el archivo de historias clínicas.',
      'Colaborar en la preparación de los usuarios fallecidos y comunicarlo a los familiares.',
      'Supervisar y aprovisionar del material de farmacia necesario.',
      'Supervisar la higiene personal de los usuarios, su alimentación y el estado general de los dormitorios y estancias comunes, especialmente en el caso de pacientes inmovilizados en cama de forma permanente o temporal.',
      'Comunicar a los familiares cualquier aspecto relacionado con la salud del usuario.',
      'Comunicar cualquier incidencia al responsable correspondiente.']),
    ('assets/img/tabla2-4-5b08dc.png', 'Medicina', 'Tabla 2.4. Funciones de los titulados en medicina.',
     'Tabla de funciones de los titulados en medicina: asistencia médica, tratamiento y seguimiento, medicina preventiva, supervisión sanitaria del centro, medidas profilácticas y relación con los sistemas sanitarios.',
     ['Proporcionar asistencia médica (diagnóstico e intervención) a todos los usuarios.',
      'Tratamiento del usuario, seguimiento de su evolución y derivación a otro profesional si fuese necesario.',
      'Elaborar programas de medicina preventiva.',
      'Supervisión general del centro, en el aspecto sanitario y de inspecciones.',
      'Asesorar sobre las medidas profilácticas que deban adoptarse en casos específicos y/o generales.',
      'Relación con los sistemas sanitarios del entorno.']),
    ('assets/img/tabla2-5-9c7a47.png', 'Psicología', 'Tabla 2.5. Funciones de los titulados en psicología.',
     'Tabla de funciones de los titulados en psicología: valoración, intervención preventiva, resolución de conflictos, rehabilitación neuropsicológica, apoyo a familiares, acompañamiento a usuarios terminales y seguimiento de casos.',
     ['Valorar cognitiva, afectiva y psicopatológicamente al usuario. Diagnóstico y posterior tratamiento individualizado o grupal.',
      'Programas de intervención preventiva.',
      'Intervenir en la resolución de conflictos personales y entre los usuarios y el centro, procurando un trato individualizado.',
      'Rehabilitar neuropsicológicamente y supervisar los talleres de terapia ocupacional.',
      'Sensibilizar e informar a los usuarios que mantienen sus capacidades cognitivas, procurando su comprensión hacia comportamientos de otros usuarios afectados.',
      'Ofrecer apoyo psicológico a los familiares de los usuarios en caso de conflicto familiar.',
      'Acompañar a los usuarios terminales atendiendo sus últimas necesidades psíquicas y emocionales.',
      'Realizar un seguimiento de los casos dados de alta o potencialmente conflictivos.',
      'Organizar el archivo de historias clínicas.',
      'Recoger información relevante, dada por otros profesionales, sobre anomalías en el comportamiento del usuario para modificar el tratamiento si fuese necesario.']),
    ('assets/img/tabla2-6-432c5b.png', 'Fisioterapia', 'Tabla 2.6. Funciones de los titulados en fisioterapia.',
     'Tabla de funciones de los titulados en fisioterapia: evaluación del estado físico, tratamiento de patologías, seguimiento del proceso patológico y asesoramiento sobre movilizaciones.',
     ['Evaluar el estado físico del colectivo del centro.',
      'Tratar individual y colectivamente las patologías que lo requieran, para su rehabilitación o en tratamientos paliativos.',
      'Seguir la evolución del proceso patológico.',
      'Asesorar sobre movilizaciones y otros aspectos de interés para el adecuado trato a los usuarios afectados por una determinada patología.']),
    ('assets/img/tabla2-7-defb02.png', 'Trabajo social', 'Tabla 2.7. Funciones de los titulados en trabajo social.',
     'Tabla de funciones de los titulados en trabajo social: solicitudes de ingreso, información personal del usuario, atención individual, informes sociales, gestiones, sugerencias y reclamaciones, relaciones con la comunidad, voluntariado y redes de apoyo.',
     ['Evaluar las solicitudes de ingreso, en función de las necesidades y del cumplimiento de los requisitos del usuario potencial.',
      'Recoger información personal del usuario relativa a su área y puesta en común con los profesionales implicados.',
      'Atender de forma individual a las personas usuarias o interesadas en el servicio desempeñado por la institución.',
      'Realizar los informes sociales requeridos por la Administración Pública, los familiares u otras instituciones.',
      'Apoyar en las gestiones «necesarias» del usuario sin capacidad o proporcionar los recursos de apoyo necesarios.',
      'Elaborar, en colaboración con dirección, un sistema de gestión de las sugerencias y de las reclamaciones, y posteriormente realizar las actuaciones necesarias para mejorar la calidad del centro.',
      'Establecer relaciones con otros servicios de la comunidad y con otras entidades privadas.',
      'Coordinar al voluntariado, en caso de existir esta opción.',
      'Evaluar la satisfacción de los beneficiarios y sus familias y analizar las reclamaciones con el fin de optimizar la calidad.',
      'Controlar las visitas y las llamadas telefónicas de familiares y amigos para tener un conocimiento exacto de las redes de apoyo con las que cuenta el usuario.',
      'Comunicar al resto del equipo aquellos aspectos que deban ser tenidos en cuenta en el trato diario con el usuario (p. ej., ausencia justificada de un familiar, para tranquilizarle).']),
    ('assets/img/tabla2-8-bc9af3.png', 'Terapia ocupacional', 'Tabla 2.8. Funciones de los titulados en terapia ocupacional.',
     'Tabla de funciones de los titulados en terapia ocupacional: valoración de las actividades de la vida diaria, intervención terapéutica, seguimiento de programas, prevención, ayudas técnicas y explicación del modo de realizarlas.',
     ['Valorar individualmente las actividades de la vida diaria de cada usuario y el tipo de ayuda que necesita para cada una.',
      'Intervenir terapéuticamente, de forma individual y/o colectiva, para mantener o recuperar la autonomía del usuario.',
      'Seguir y evaluar los programas de intervención.',
      'Prevenir las posibles dolencias que afecten a la autonomía de los usuarios.',
      'Supervisar y controlar las ayudas técnicas necesarias para mejorar la funcionalidad del beneficiario.',
      'Revisar y aprovisionar de dichas ayudas técnicas, según las necesidades del centro.',
      'Explicar el tipo de ayuda necesaria para cada individuo y el modo correcto de realizarla, a fin de mantener al sujeto activo, motivado e independiente el mayor tiempo posible.']),
]

SCREENS = [
    # ------------------------------------------------------------------ apertura
    screen('Tema 1. Instituciones de atención a personas dependientes y equipo interdisciplinar', type='cover'),
    screen('Objetivos del tema', '\n'.join(f'- {o}' for o in OBJECTIVES), type='objectives', objective=O1),

    # ------------------------------------------------------- instituciones (OBJ1)
    screen('Instituciones de atención a personas dependientes', join(s001[0], s001[1]), objective=O1, src=['s001']),
    screen('Condiciones de los centros', join(s001[2], s002[0]), objective=O1, src=['s001', 's002'],
           interaction=tabs([('Proximidad física', _prox), ('Intercambios bidireccionales', _inter)])),
    screen('Necesidad y requisitos de las instituciones', join(s002[2], s002[3]), objective=O1, src=['s002']),
    screen('Condiciones de los centros', objective=O1, src=['s002'],
           text='Comprueba si recuerdas qué deben cumplir los centros gerontológicos.',
           interaction=single_choice(
               '¿Qué dos condiciones principales deben cumplir las instituciones o centros gerontológicos para evitar el desarraigo del usuario?',
               [('Proximidad física e intercambios bidireccionales', True),
                ('Gran tamaño y aislamiento del entorno habitual', False),
                ('Atención exclusivamente sanitaria y visitas restringidas', False),
                ('Estancia temporal y ausencia de actividades en el exterior', False)],
               ok='Correcto: así se mantiene el contacto con la red social habitual.',
               expl='Los centros deben estar en la misma comunidad de residencia habitual del anciano (proximidad física) y los beneficiarios deben participar tanto en las actividades del exterior como en la vida del centro (intercambios bidireccionales).')),
    screen('Mantenimiento del bienestar', join(s003[2], s003[3], s003[4]), objective=O1, src=['s003'],
           visual=img('assets/img/fig2-1-ea4199.png', 'Ilustración de dos mujeres mayores sentadas a una mesa que juegan a un juego de mesa.',
                      cap(s003[1]), layout='right', media_width='50')),
    screen('Servicios sociales en España', join(s004[1], s004[2], s004[3]), objective=O1, src=['s004']),
    screen('Protagonismo de la iniciativa privada', s004[4], objective=O1, src=['s004'],
           interaction=accordion(list(zip(_m_titles, [m[0].upper() + m[1:] for m in _motivos])))),
    screen('Servicios sociales en España', join(s005[1], s005[3]), objective=O1, src=['s005'],
           visual=img('assets/img/fig2-2-b32ce3.png',
                      'Esquema de los objetivos de los servicios sociales comunitarios: informar sobre recursos sociales y derechos; proporcionar recursos adaptados a las necesidades de la población; desarrollar servicios y programas para fomentar la autonomía personal y la calidad de vida; promocionar el desarrollo pleno de la persona, los grupos y las comunidades; y potenciar vías de participación y cooperación social.',
                      cap(s005[2]), layout='top')),
    screen('Permanecer en el entorno habitual', _r5_q1, type='reflection', objective=O1, src=['s005']),
    screen('Suficiencia de los servicios públicos', objective=O1, src=['s005'],
           text=_r5_q2_intro,
           interaction=true_false(_r5_q2_stmt, False,
                                  ok='Correcto: los servicios públicos no cubren la demanda.',
                                  expl='En España el número de solicitudes para ingresar en instituciones estatales para personas dependientes es muy superior al de plazas disponibles: los recursos sociales existentes son insuficientes.')),

    # ----------------------------------------------- tipos de servicios (OBJ2)
    screen('Tipos de servicios de asistencia', join(s006[0], s006[1]), objective=O2, src=['s006']),
    screen('Servicio de ayuda a domicilio', join(s006[3], s006[4]), objective=O2, src=['s006']),
    screen('Servicio de ayuda a domicilio', join(s006[5], s006[6]), objective=O2, src=['s006']),
    screen('Alternativas a la asistencia habitual', FACT_ALT, objective=O2, src=['s006']),
    screen('Eficacia real del SAD', s006[8], objective=O2, src=['s006']),
    screen('Recursos de la Ley de Autonomía', unnum(inner(s006[9])), type='reflection', objective=O2, src=['s006']),
    screen('Servicio de teleasistencia', join(s007[2], s007[3]), objective=O2, src=['s007'],
           visual=img('assets/img/fig2-3-0ea7c3.png', 'Una profesional sanitaria con uniforme blanco muestra un folleto a una mujer mayor sentada en un sillón de su domicilio.',
                      cap(s007[1]), layout='right', media_width='50')),
    screen('Servicio de teleasistencia', join(s007[4], s007[5]), objective=O2, src=['s007']),
    screen('Elegir el servicio adecuado', objective=O2, src=['s007'],
           text='Aplica lo que sabes de los servicios de asistencia a una situación concreta.',
           interaction=scenario_decision(
               'Una persona mayor con dependencia vive sola y prefiere seguir en su casa. Su familia quiere que pueda pedir ayuda urgente a cualquier hora del día y de la noche sin tener que trasladarse a un centro.',
               [('Contratar el servicio de teleasistencia.', True,
                 'Correcto: con solo pulsar un botón del aparato que lleva consigo se comunica con una centralita 24 horas al día, los 365 días del año.'),
                ('Ingresarla en una residencia.', False,
                 'No es necesario: las residencias implican residir de forma continuada en el centro, y la persona prefiere permanecer en su domicilio.'),
                ('Acudir a un centro de día.', False,
                 'Los centros de día atienden solo durante un número determinado de horas, por lo que no cubren las urgencias de noche.'),
                ('Solicitar únicamente el servicio de ayuda a domicilio.', False,
                 'El SAD aporta atención y asistencia en el hogar, pero con horas muy reducidas; no ofrece comunicación urgente permanente.')],
               expl='La teleasistencia permite al usuario, que permanece en su casa, comunicarse con los servicios de urgencia con solo pulsar un botón, lo que aporta mucha tranquilidad a los dependientes y a sus familias.')),
    screen('Centros de día', join(s008[1], s008[2], s008[3], s008[4]), objective=O2, src=['s008']),
    screen('Teleasistencia y centros de día', objective=O2, src=['s009'],
           text=_r9,
           interaction=case_practice(
               'Piensa tu respuesta a las dos cuestiones (o escríbela en papel) y compárala después con los criterios.',
               ['Para la teleasistencia: el usuario permanece en su casa y puede llevar siempre a mano el aparato (colgante o pulsera) y pulsar el botón.',
                'Para la teleasistencia: se valora que los profesionales dispongan de los teléfonos de los familiares allegados, a los que avisan en una urgencia.',
                'Para los centros de día: favorecen la permanencia en el domicilio, que es la preferencia de la mayoría de los ciudadanos.',
                'Para los centros de día: son una importante ayuda para las familias y ofrecen atención especializada durante un número de horas.'])),
    screen('Residencias', join(s009[1], s009[2], s009[3]), objective=O2, src=['s009']),
    screen('Acceso a las residencias', 'Las plazas residenciales se reparten, en la práctica, según el nivel de renta:', objective=O2, src=['s009'],
           interaction=tabs([('Plazas públicas', _acc[0]), ('Residencias privadas', _acc[1]), ('Franja intermedia', _acc[2])])),
    screen('Residencias', join(s009[6], s009[7]), objective=O2, src=['s009']),
    screen('Decidir el ingreso en una residencia', s009[8], objective=O2, src=['s009'],
           visual=img('assets/img/tabla2-1-687bf2.png',
                      'Tabla con el número y el porcentaje de población, por comunidades y ciudades autónomas, que recibe cada una de las prestaciones identificadas en el PIA (prevención de la dependencia, teleasistencia, ayuda a domicilio, centros de día/noche, atención residencial y prestaciones económicas), con los totales.',
                      cap(s009[9]), layout='top')),
    screen('Tipos de servicios de asistencia', objective=O2, src=['s006', 's007', 's008', 's009'],
           text='Clasifica estas características según el servicio de asistencia al que corresponden.',
           interaction=classification(
               ['Ayuda a domicilio', 'Teleasistencia', 'Centros de día', 'Residencias'],
               [('Es el recurso mejor valorado y más solicitado por las personas dependientes.', 'Ayuda a domicilio'),
                ('Incluye la limpieza del hogar, el acompañamiento y las compras.', 'Ayuda a domicilio'),
                ('El usuario lleva un aparato colgado del cuello o en forma de pulsera.', 'Teleasistencia'),
                ('La llamada se recibe en una centralita telefónica.', 'Teleasistencia'),
                ('Las personas acuden durante un número determinado de horas.', 'Centros de día'),
                ('Suelen carecer de un equipo profesional adecuado para evaluaciones y tratamientos individualizados.', 'Centros de día'),
                ('Si es pública, el acceso se hace a través de una larga lista de espera.', 'Residencias'),
                ('Si es privada, el ingreso suele ser casi inmediato por su elevado coste.', 'Residencias')],
               expl='Los tres primeros son servicios intermedios porque no exigen residir de forma continuada en el centro; las residencias sí.')),

    # --------------------------------------------- equipo interdisciplinar (OBJ3)
    screen('El equipo interdisciplinar', join(s010[0], s010[1], s010[2], s010[3]), objective=O3, src=['s010']),
    screen('Funciones y plantilla del centro', join(s010[4], s010[5]), objective=O3, src=['s010']),
    screen('Perfil de las personas usuarias', join(s010[6], s010[7]), objective=O3, src=['s010']),
    screen('Finalidad de la intervención', join(s010[8], s010[9]), objective=O3, src=['s010']),
    screen('Responsables de la calidad de la atención', objective=O3, src=['s010'],
           text='Completa la idea sobre los profesionales que más influyen en la calidad de la atención.',
           interaction=fill_blanks(
               'Los profesionales de [[trato directo]] con la persona dependiente, como los enfermeros y los técnicos de atención sociosanitaria, son los principales [[responsables]] de la calidad de la atención, puesto que comparten un mayor número de [[horas]] y de intimidad con el beneficiario.',
               distractors=['gestión', 'directores', 'días'],
               expl='Quienes tratan directamente con la persona dependiente son quienes más horas e intimidad comparten con ella, por eso son los principales responsables de la calidad de la atención.')),
    screen('Funciones comunes del equipo', join(s011[1], s011[2], s011[4]), objective=O3, src=['s011']),
    screen('Funciones comunes del equipo', objective=O3, src=['s011'],
           text='Distingue las responsabilidades comunes de las específicas de cada profesión.',
           interaction=single_choice(
               '¿Cuál de las siguientes funciones es común a todos los profesionales del equipo interdisciplinar?',
               [('Llevar un registro sistemático de las intervenciones realizadas.', True),
                ('Prescribir dietas y controlar lo prescrito por el médico.', False, 'Es una función específica de enfermería.'),
                ('Realizar los informes sociales requeridos por la Administración Pública.', False, 'Es una función específica de trabajo social.'),
                ('Hacer diariamente la cama de los usuarios.', False, 'Es una función específica de los técnicos de asistencia sanitaria.')],
               expl='Todos los profesionales deben llevar un registro sistemático de las intervenciones, participar en las reuniones del equipo y formar parte del comité de ética asistencial.')),
    screen('Funciones específicas por profesión', objective=O3, src=['s012', 's013', 's014', 's015', 's016', 's017', 's018'],
           text='Abre cada tarjeta para consultar la tabla de funciones de cada profesión.',
           interaction=image_cards([(src, alt, title, '*' + capt + '*\n\n' + '\n'.join('- ' + b for b in bullets))
                                    for src, title, capt, alt, bullets in TABLES])),
    screen('Profesionales de un centro gerontológico', unnum(inner(s011[3])), objective=O3, src=['s011'],
           interaction=case_practice(
               'Piensa tu respuesta (o escríbela en papel) y compárala después con los criterios.',
               ['Cita al personal de atención directa: auxiliares de enfermería, gerocultores o técnicos de atención sanitaria.',
                'Cita los profesionales de enfermería, medicina, psicología, fisioterapia, terapia ocupacional y trabajo social.',
                'Menciona, de forma opcional, otros profesionales como animadores socioculturales o agentes psicoeducativos.',
                'Explica la necesidad: la atención se dispensa 24 horas al día y los usuarios, con una media de edad superior a 80 años, requieren cuidados especializados.',
                'Resume las funciones principales de cada profesional (las de las tablas).'])),
    screen('Otros profesionales del centro', join(s019[1], s019[3], s019[4]), objective=O3, src=['s019'],
           visual=img('assets/img/fig2-4-ab9b63.png', 'Una profesional con uniforme ayuda a una persona mayor sentada en un sillón a ponerse el calzado.',
                      cap(s019[2]), layout='right', media_width='50')),
    screen('Quién hace cada tarea', objective=O3, src=['s019'],
           text='Relaciona cada profesional con la tarea que le corresponde.',
           interaction=match_pairs(
               prompt='Identifica cuál de los profesionales mencionados en la unidad es el encargado de realizar las siguientes tareas:',
               pairs=[('Técnicos de asistencia sanitaria', 'Hacer las camas cada día y cambiar las sábanas, retirando después las usadas.'),
                ('Enfermería', 'Coordinar las dietas según lo prescrito por el médico.'),
                ('Trabajo social', 'Realizar los informes sociales.'),
                ('Medicina', 'La supervisión del centro en el aspecto sanitario y de inspecciones.'),
                ('Animación sociocultural', 'La socialización e integración activa de los usuarios mediante la participación en actividades.'),
                ('Terapia ocupacional', 'Explicar el tipo de ayuda que precisa cada usuario y el modo correcto de realizarla.'),
                ('Fisioterapia', 'Evaluar el estado físico de los usuarios del centro.'),
                ('Psicología', 'Valorar las capacidades cognitivas, afectivas y psicopatológicas de cada usuario.')],
               expl='Cada tarea está recogida en la tabla de funciones de su profesión; la socialización e integración mediante actividades es labor de los animadores socioculturales.')),

    # ------------------------------------------------------------------ cierre
    screen('Repaso del tema', objective=O1, text='Repasa los conceptos clave del tema antes de continuar.',
           interaction=flashcards([
               ('¿Cómo se define una institución destinada a personas mayores con dependencias?', 'Un centro gerontológico abierto, de desarrollo personal y atención sociosanitaria interprofesional, en el que viven temporal o permanentemente personas mayores con algún grado de dependencia.'),
               ('¿Qué dos condiciones deben cumplir los centros gerontológicos?', 'Proximidad física e intercambios bidireccionales.'),
               ('¿Qué requisitos deben cumplir las instituciones para el cuidado de personas dependientes?', 'Atención integral que abarque las áreas social y sanitaria y un equipo multiprofesional que lleve a cabo la atención.'),
               ('¿Qué son los servicios intermedios?', 'El servicio de ayuda a domicilio, la teleasistencia y los centros de día: no implican que la persona dependiente tenga que residir de forma continuada en el centro de asistencia.'),
               ('¿En qué consiste la teleasistencia?', 'El usuario, que permanece en su casa, siempre tiene a mano un aparato que le permite, con solo pulsar un botón, comunicarse con los servicios de urgencia.'),
               ('¿Qué son los centros de día?', 'Instituciones de atención especializada a las que las personas dependientes acuden durante un número determinado de horas.'),
               ('¿Quiénes son los principales responsables de la calidad de la atención?', 'Los profesionales de trato directo con la persona dependiente, como los enfermeros y los técnicos de atención sociosanitaria, porque comparten más horas e intimidad con el beneficiario.'),
               ('¿Cuál es la finalidad de cualquier intervención?', '«Facilitar y potenciar el mantenimiento de la autonomía de la persona mayor», garantizando siempre el respeto y la dignidad.')])),
    screen('Vocabulario del tema', objective=O2, text='Encuentra en la sopa de letras los conceptos clave del tema.',
           interaction=word_search(['dependencia', 'residencia', 'bienestar', 'gerocultor', 'equipo', 'autonomía', 'enfermería', 'psicología', 'fisioterapia', 'dignidad'])),
    screen('Síntesis: instituciones de atención', type='summary', objective=O1,
           visual=img('assets/img/sintesis2-1-16fa40.png',
                      'Esquema de síntesis: las instituciones de atención se describen por sus características (proximidad física e intercambios bidireccionales), el mantenimiento del estado de bienestar y la situación en España.',
                      layout='top')),
    screen('Síntesis: tipos de servicios de asistencia', type='summary', objective=O2,
           visual=img('assets/img/sintesis2-2-581d84.png',
                      'Esquema de síntesis: los tipos de servicios de asistencia son el servicio de ayuda a domicilio (SAD), la teleasistencia, los centros de día y las residencias.',
                      layout='top')),
    screen('Síntesis: profesionales del equipo', type='summary', objective=O3,
           visual=img('assets/img/sintesis2-3-455733.png',
                      'Esquema de síntesis: los profesionales del equipo multidisciplinar son los técnicos de asistencia sanitaria, enfermería, psicología, fisioterapia, trabajo social, terapia ocupacional y otros profesionales.',
                      layout='top')),
]
