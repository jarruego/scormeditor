# -*- coding: utf-8 -*-
"""Tema 2 de UF0127 (originales s023–s041): Personas en situación de dependencia y
atención institucional. Todo el texto sale del original (lib.B / lib.text_of)."""
import re

import lib
from lib import (B, accordion, case_practice, classification, crossword, fill_blanks,
                 flashcards, image_cards, img, join, match_pairs, screen, single_choice,
                 tabs, true_false)

O1 = 'Describir la atención a las personas en situación de dependencia por parte de la familia y de las instituciones, y las consecuencias del ingreso en una residencia.'
O2 = 'Reconocer los factores personales, físicos y psicológicos que condicionan la dependencia.'
O3 = 'Explicar los cambios sociales y familiares en el apoyo informal y el papel de la LAPAD.'
OBJECTIVES = [O1, O2, O3]


def blk(sid, *idx):
    """Bloques concretos (por índice) de una pantalla original, unidos."""
    bs = B(sid)
    return join([bs[i] for i in idx])


def caption(sid, i):
    """Pie de foto original («*Fig. 1.1. …*») sin asteriscos."""
    c = B(sid)[i].strip('*').strip()
    return re.sub(r'^Tabla\.(\d)', r'Tabla \1', c)


# --- retoques de formato sobre el texto original --------------------------------------
def fix(t):
    t = t.replace('una**perspectiva multifactorial**', 'una **perspectiva multifactorial**')
    return t


S = []
add = S.append

# 1. Portada y objetivos --------------------------------------------------------------
add(screen('Tema 2. Personas en situación de dependencia y atención institucional', type='cover', objective=O1))
add(screen('Objetivos del tema', join('Al terminar este tema serás capaz de:', '\n'.join('- ' + o for o in OBJECTIVES)),
           type='objectives', objective=O1))

# 2. La familia y el entorno ---------------------------------------------------------
add(screen('La familia y el entorno', join(blk('s023', 0), blk('s023', 2, 3)), objective=O1, src=['s023'],
           visual=img('assets/img/fig1-1-28dd80.png',
                      'Ilustración de una mujer y una niña abrazando con cariño a una persona mayor sentada en una silla.',
                      caption('s023', 4), layout='right', media_width='50')))
add(screen('La familia y el entorno', blk('s023', 5), objective=O1, src=['s023']))
add(screen('Cuidado de un familiar dependiente',
           'Lee los dos casos y piensa cómo los resolverías antes de comparar tu respuesta con los criterios.\n\n'
           + re.sub(r'^::: custom[^\n]*\n|\n:::$', '', B('s024')[0]).strip(),
           objective=O1, src=['s024'],
           interaction=case_practice(
               'Piensa tu respuesta a las preguntas de los dos casos (puedes escribirla en papel) y compárala con estos criterios.',
               ['Reconoce que el cuidado de las personas mayores y/o dependientes ha estado tradicionalmente a cargo de las familias y, dentro de ellas, de una mujer del entorno sin salario ni reconocimiento (en el caso, María).',
                'Identifica el apoyo que se solicita: cuidados y vigilancia constante de una persona con Alzheimer.',
                'Relaciona la LAPAD con la posibilidad de recibir recursos como el SAD o la teleasistencia.',
                'En el segundo caso, razona su elección de prioridad con los datos de cada persona (edad, enfermedad, vivir sola, caída reciente, limitaciones de salud).'])))

# 3. Ingreso en residencias ----------------------------------------------------------
add(screen('Ingreso en residencias', blk('s025', 1, 2), objective=O1, src=['s025']))
add(screen('Consecuencias del ingreso', join(blk('s025', 3), blk('s026', 0)), objective=O1, src=['s025', 's026'],
           interaction=image_cards([
               ('assets/img/tabla1-1-8c4c7e.png',
                'Tabla «Consecuencias positivas» con cuatro puntos: descanso para la familia, satisfacción de los cuidados básicos, entorno adaptado y tratamientos rehabilitadores.',
                'Consecuencias positivas',
                '- La familia deja la responsabilidad de los cuidados en manos de profesionales y eso supone una mejora en tranquilidad y descanso.\n'
                '- Completa satisfacción de los cuidados básicos de la persona ingresada, sobre todo si precisa un soporte técnico especializado o una atención sanitaria continuada (p. ej., cura de escaras, grúas, etc.).\n'
                '- El entorno está adaptado para que sea el adecuado a la situación del residente, por ejemplo, con la eliminación de barreras arquitectónicas.\n'
                '- La persona dependiente recibe los tratamientos rehabilitadores adecuados e individualizados a su patología y evolución, teniendo en cuenta que algunos de ellos no podrían recibirlos en su domicilio (p. ej., atención psicológica, ludoterapia, etc.).\n\n'
                '*' + caption('s025', 5) + '*'),
               ('assets/img/tabla1-2-3e9599.png',
                'Tabla «Consecuencias negativas» con cinco puntos: desorientación, sentimiento de ser un paciente, egocentrismo, pérdida de identidad y pérdida de control.',
                'Consecuencias negativas',
                '- La persona puede desorientarse y perder el control sobre aspectos cotidianos de su vida (p. ej., horarios de comidas, terapias, etc.).\n'
                '- El ingresado desarrolla el sentimiento de ser un «paciente» y siente una necesidad de cuidados mayor de lo habitual o de la que realmente precisa.\n'
                '- Suele desarrollar un egocentrismo exagerado y una despreocupación por lo que ocurre en el «mundo exterior» y no esté relacionado con su propia situación.\n'
                '- El ingresado puede perder la sensación de identidad por pasar a formar parte de un colectivo con una vida más ordenada y rígida de la que está acostumbrado.\n'
                '- La persona ingresada desarrolla la sensación de una importante pérdida de control y responsabilidad sobre lo que sucede en su vida.\n\n'
                '*' + caption('s025', 7) + '*'),
           ]), notes=['Las dos tablas son imágenes; el texto de cada tarjeta es su transcripción (revisar con la imagen).']))
add(screen('Consecuencias del ingreso', '', objective=O1,
           interaction=classification(
               ['Consecuencia positiva', 'Consecuencia negativa'],
               [('La familia deja la responsabilidad de los cuidados en manos de profesionales.', 'Consecuencia positiva'),
                ('El entorno está adaptado a la situación del residente, por ejemplo, sin barreras arquitectónicas.', 'Consecuencia positiva'),
                ('La persona recibe tratamientos rehabilitadores individualizados que no podría recibir en su domicilio.', 'Consecuencia positiva'),
                ('La persona puede desorientarse y perder el control sobre aspectos cotidianos de su vida.', 'Consecuencia negativa'),
                ('El ingresado desarrolla el sentimiento de ser un «paciente».', 'Consecuencia negativa'),
                ('El ingresado puede perder la sensación de identidad por pasar a formar parte de un colectivo con una vida más rígida.', 'Consecuencia negativa')],
               prompt='Clasifica cada situación según sea una consecuencia positiva o negativa del ingreso en una residencia.',
               expl='Las consecuencias del ingreso no siempre son favorables: aportan cuidados y tratamientos especializados, pero también pueden restar identidad y control sobre la propia vida.')))
add(screen('Ingreso en residencias y centros de día',
           re.sub(r'^::: custom[^\n]*\n+|\n+:::$', '', B('s026')[1]).strip(),
           type='reflection', objective=O1, src=['s026']))

# 4. Los centros asistenciales y sus profesionales -----------------------------------
add(screen('Los centros asistenciales', blk('s027', 1, 2, 3), objective=O1, src=['s027']))
add(screen('Los centros asistenciales', blk('s027', 4, 5, 6), objective=O1, src=['s027']))
add(screen('Los centros asistenciales', B('s028')[1], objective=O1, src=['s028']))
add(screen('Los centros asistenciales', '', objective=O1,
           interaction=single_choice(
               '¿Qué es un **protocolo escrito**, según el tema?',
               [('Una serie de directrices aplicables a determinadas situaciones.', True),
                ('Un informe individual sobre la evolución de cada persona ingresada.', False),
                ('Un registro de las quejas y sugerencias de los familiares.', False)],
               expl='Los profesionales deben contar con un protocolo escrito, es decir, con una serie de directrices aplicables a determinadas situaciones.')))

# 5. Factores que condicionan la dependencia ------------------------------------------
add(screen('Factores que condicionan la dependencia', fix(join(B('s029'))), objective=O2, src=['s029']))
add(screen('Factores personales y físicos', blk('s030', 1, 2, 3), objective=O2, src=['s030']))
add(screen('Expectativa de vida autónoma', blk('s030', 4), objective=O2, src=['s030']))
add(screen('Factores personales y físicos', blk('s030', 5, 6, 7), objective=O2, src=['s030']))
add(screen('Factores personales y físicos', '', objective=O2,
           interaction=true_false(
               'La relación entre la edad y la dependencia se manifiesta de manera uniforme en todos los rangos de edad.', False,
               expl='La correlación entre edad y dependencia no es uniforme: cobra mayor importancia en la población mayor de 65 años y se acentúa significativamente a partir de la octava década, es decir, en personas con más de 80 años.')))
add(screen('Concepto de dependencia',
           re.sub(r'^::: custom[^\n]*\n+|\n+:::$', '', B('s030')[8]).strip(),
           objective=O2, src=['s030'],
           interaction=case_practice(
               'Piensa tu respuesta a las dos preguntas y compárala con estos criterios.',
               ['Recuerda que, tradicionalmente, la dependencia se equiparaba exclusivamente con la incapacidad funcional.',
                'Explica que el concepto actual es multifactorial: tiene en cuenta factores personales y físicos, y también el bienestar psicológico y social.'])))

# 6. Factores psicológicos --------------------------------------------------------------
add(screen('Factores psicológicos', blk('s031', 1, 2, 3), objective=O2, src=['s031']))
add(screen('Factores psicológicos', blk('s031', 4, 5), objective=O2, src=['s031']))
_ps = B('s031')
add(screen('Factores psicológicos', _ps[6], objective=O2, src=['s031'],
           interaction=tabs([
               ('Externos', 'Referidos al tipo de apoyo que recibe la persona dependiente, ya sea apoyo informal (familia) o profesional.'),
               ('Internos', 'Referidos a rasgos de personalidad, mapa cognitivo, locus de control y otros similares, etc.')]),
           notes=['Los dos elementos de la lista original se presentan en pestañas (cuerpos breves): revisar si se prefiere dejar la lista.']))
add(screen('Factores psicológicos', blk('s031', 8, 9), objective=O2, src=['s031']))
add(screen('Factores psicológicos', blk('s032', 1, 2, 3, 4), objective=O2, src=['s032']))
add(screen('Factores psicológicos', '', objective=O2,
           interaction=classification(
               ['Verdadera', 'Falsa'],
               [('Uno de los objetivos de la intervención psicológica es mejorar la competencia social de la persona dependiente.', 'Verdadera'),
                ('Los factores psicosociales sobre los que se puede intervenir pueden ser externos, internos y personales.', 'Falsa'),
                ('Una persona con mayor bienestar psicológico se percibirá con mayor autoeficacia, pero con menor percepción subjetiva de la situación.', 'Falsa'),
                ('Uno de los objetivos de la intervención psicológica es crear un sistema eficaz de apoyo informal.', 'Falsa')],
               prompt='Señala si las siguientes afirmaciones son verdaderas o falsas.',
               expl='Los factores psicosociales son externos o internos; el bienestar psicológico se asocia a una mayor percepción positiva de la situación; y el objetivo es crear un sistema eficaz de apoyo social.')))

# 7. Factores sociales ---------------------------------------------------------------------
add(screen('Factores sociales', blk('s033', 1, 2), objective=O3, src=['s033']))
add(screen('Autocuidado', blk('s034', 1), objective=O3, src=['s034']))
add(screen('Factores sociales', '', objective=O3,
           interaction=fill_blanks(
               'La red de apoyo familiar, conocida como [[apoyo informal]], consiste en el [[cuidado]] y atención que se dispensa de manera [[altruista]] y gratuita a las personas con algún grado de dependencia, fundamentalmente por sus familiares y allegados.',
               distractors=['apoyo formal', 'remunerada'],
               expl='El apoyo informal es el cuidado y atención que se dispensa de manera altruista y gratuita, fundamentalmente por familiares y allegados.')))

# 8. Evolución social y familiar --------------------------------------------------------------
add(screen('Evolución social y familiar', blk('s035', 2, 3), objective=O3, src=['s035']))
add(screen('Evolución social y familiar', blk('s035', 4, 5), objective=O3, src=['s035']))
add(screen('Evolución social y familiar', blk('s036', 2), objective=O3, src=['s036'],
           visual=img('assets/img/tabla1-3-d12533.png',
                      'Tabla con cinco factores que inciden en el proceso de transformación de las relaciones familiares: desaparición de la familia extensa, más separaciones y divorcios, movilidad territorial, nuevos tipos de familia e incorporación de la mujer al mundo del trabajo.',
                      caption('s036', 4), layout='top')))
add(screen('Evolución social y familiar', blk('s036', 5), objective=O3, src=['s036'],
           visual=img('assets/img/fig1-2-f816ee.png',
                      'Fotografía de una profesional sanitaria tomando la tensión a una mujer mayor sentada en un jardín.',
                      caption('s036', 7), layout='right', media_width='50')))
add(screen('Conceptos clave', '', objective=O3,
           interaction=match_pairs(
               [('Autoestima', 'Percepción emocional que las personas tienen de sí mismas.'),
                ('Familia nuclear', 'La familia compuesta por los progenitores y los hijos.'),
                ('Apoyo informal', 'Cuidado y atención altruista y gratuita, fundamentalmente por familiares y allegados.'),
                ('Escara', 'Lesión o úlcera por presión que aparece en los puntos de apoyo del cuerpo de quien permanece inmóvil en una cama.')],
               prompt='Relaciona cada término con su significado.',
               expl='Son los términos de vocabulario del tema: autoestima, familia nuclear, apoyo informal y escara.')))
add(screen('Evolución social y familiar', blk('s037', 2), objective=O3, src=['s037'],
           visual=img('assets/img/tabla1-4-a463b9.png',
                      'Tabla de estructura de la familia y del hogar: tamaño medio del hogar, porcentaje y estatus socioeconómico (alto, medio, bajo) de las familias unipersonales, conyugales, nucleares, monoparentales, extensas y otras. Total: 3,6 individuos de media.',
                      caption('s037', 5), layout='top')))
add(screen('Evolución social y familiar', blk('s037', 3, 4), objective=O3, src=['s037']))

# 9. La LAPAD -------------------------------------------------------------------------------------
add(screen('La LAPAD', blk('s038', 2, 3), objective=O3, src=['s038']))
add(screen('La LAPAD', blk('s038', 4), objective=O3, src=['s038']))
add(screen('La LAPAD', '', objective=O3,
           interaction=single_choice(
               '¿Qué posibilidad ofrece la LAPAD a las personas que necesitan ayuda?',
               [('El cuidado bien en el propio domicilio (con recursos como el SAAD o la teleasistencia), bien en una institución (residencias, centros de día).', True),
                ('Únicamente una plaza en una residencia pública.', False),
                ('Dejar el cuidado exclusivamente en manos de la red de apoyo informal.', False)],
               expl='La LAPAD intenta reflejar y solucionar la atención que precisa el colectivo de personas necesitadas de ayuda, ofreciendo la posibilidad del cuidado en el propio domicilio o en una institución.')))
add(screen('La LAPAD y el apoyo informal',
           re.sub(r'^::: custom[^\n]*\n+|\n+:::$', '', B('s039')[2]).strip(),
           objective=O3, src=['s039'],
           interaction=case_practice(
               'Piensa tu respuesta a las tres preguntas y compárala con estos criterios.',
               ['Define el apoyo informal como el cuidado y atención que se dispensa de manera altruista y gratuita, fundamentalmente por familiares y allegados.',
                'Contrasta el apoyo tradicional (familia, sobre todo mujeres) con el actual, y relaciona el cambio con los factores sociales estudiados (familia nuclear, separaciones, movilidad, nuevos tipos de familia, incorporación de la mujer al trabajo).',
                'Menciona que la LAPAD atiende las necesidades de personas en situación de especial vulnerabilidad: apoyos para las actividades esenciales de la vida diaria, mayor autonomía personal y ejercicio pleno de sus derechos de ciudadanía.'])))

# 10. Cierre ------------------------------------------------------------------------------------------
add(screen('Repaso del tema', '', objective=O1,
           interaction=flashcards([
               ('¿Qué es el apoyo informal?', 'El cuidado y atención que se dispensa de manera altruista y gratuita a las personas que presentan algún grado de discapacidad o dependencia, fundamentalmente por sus familiares y allegados.'),
               ('¿Qué es una barrera arquitectónica?', 'Cualquier obstáculo físico que impida que determinados grupos de población puedan acceder o moverse por un edificio, lugar o zona en particular.'),
               ('¿Qué es una escara?', 'Lesión, también conocida como úlcera por presión (UPP), que se presenta en el cuerpo de un paciente cuando tiene que permanecer inmóvil en una cama.'),
               ('¿Qué concepto de dependencia se utiliza en la actualidad?', 'Una perspectiva multifactorial que tiene en cuenta factores personales y físicos, y otros que implican al bienestar psicológico y social.'),
               ('¿Cómo define Bandura la autoeficacia?', 'Como «un estado psicológico en el que el sujeto se juzga capaz de ejecutar una conducta en unas determinadas circunstancias y a un determinado nivel de dificultad».'),
               ('¿Qué es la autoestima?', 'La percepción emocional que las personas tienen de sí mismas. Puede expresarse también como el amor hacia uno mismo.'),
               ('¿Qué es la familia nuclear?', 'La familia compuesta por los progenitores y los hijos.'),
               ('¿Qué es la «expectativa de vida autónoma»?', 'Según la OMS, uno de los índices que mide la calidad de la salud en la sociedad.')])))
add(screen('Pasatiempo del tema', '', objective=O1,
           interaction=crossword([
               ('AUTOESTIMA', 'Percepción emocional que las personas tienen de sí mismas'),
               ('AUTOEFICACIA', 'Estado psicológico en el que el sujeto se juzga capaz de ejecutar una conducta (Bandura)'),
               ('LAPAD', 'Ley de Promoción de la Autonomía Personal y Atención a las Personas en Situación de Dependencia'),
               ('ESCARA', 'Úlcera por presión en glúteos, hombros, rodillas o talones'),
               ('PROTOCOLO', 'Serie de directrices escritas aplicables a determinadas situaciones'),
               ('NUCLEAR', 'Tipo de familia compuesta por progenitores e hijos'),
               ('INFORMAL', 'Tipo de apoyo que presta la familia de manera altruista y gratuita'),
               ('DEPENDENCIA', 'Situación que hoy se entiende con una perspectiva multifactorial'),
               ('RESIDENCIA', 'Institución que ofrece atención las 24 horas a personas dependientes')])))
add(screen('Resumen del tema', join(
    'En este tema has visto que:',
    '\n'.join('- ' + x for x in [
        'La atención de las personas mayores y/o dependientes ha estado tradicionalmente a cargo de las familias, y los centros de atención sociosanitaria ayudan a los familiares a cuidar de ellas.',
        'El ingreso en una residencia trae consecuencias positivas y negativas para la persona dependiente.',
        'Los profesionales de los centros asistenciales deben contar con un protocolo escrito y ser conscientes de que son garantes de los derechos de personas frágiles o con capacidades limitadas.',
        'La dependencia se entiende hoy desde una perspectiva multifactorial: factores personales y físicos, psicológicos y sociales.',
        'La evolución social y familiar ha transformado el apoyo informal, y la LAPAD ha sido la respuesta a esa necesidad de las familias españolas.'])),
    type='summary', objective=O1,
    notes=['Resumen compuesto con frases del propio tema (material añadido).']))
add(screen('Síntesis del tema', '', type='summary', objective=O1, src=['s040'],
           visual=img('assets/img/sintesis1-1-5cc59d.png',
                      'Esquema de síntesis: «Personas en situación de dependencia» se divide en familia y entorno, ingreso en residencias (ventajas e inconvenientes) y centros asistenciales y profesionales.',
                      layout='top')))
add(screen('Síntesis del tema', '', type='summary', objective=O1, src=['s041'],
           visual=img('assets/img/sintesis1-2-358020.png',
                      'Esquema de síntesis: «Dependencia» se divide en factores personales y físicos, factores psicológicos (autoestima, autoeficacia) y factores sociales (evolución social y familiar, LAPAD).',
                      layout='top')))

SCREENS = S

GLOSSARY = []
for sid in ('s025', 's032', 's035'):
    for b in B(sid):
        m = re.match(r'::: custom \| #F4D6D2 \| 📚 \| Vocabulario\n\*\*(.+?)\*\*\.? ?(.+)\n:::$', b, flags=re.S)
        if m:
            GLOSSARY.append((m.group(1).strip(' .'), m.group(2).strip()))
