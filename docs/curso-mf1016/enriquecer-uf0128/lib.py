# -*- coding: utf-8 -*-
"""Utilidades comunes para rehacer UF0128 a partir del importado literal de Moodle.

El texto de cada pantalla ORIGINAL (baseline) se obtiene con `orig(id)` y se limpia
mecánicamente con `clean()`; los temas arman las pantallas NUEVAS con `screen()` y
los constructores de interacción. Nada de teclear de nuevo el texto del curso:
se trocea el original con `blocks()` / `take()` para no alterar el contenido.
"""
import copy
import json
import os
import re
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
BASE_ZIP = os.path.join(HERE, 'base-importado.scormproj')
DOC = 'Moodle: MF1016_2 · UF0128'

_zf = zipfile.ZipFile(BASE_ZIP)
BASE = json.loads(_zf.read('course.json').decode('utf8'))
_ORIG = {s['id']: s for u in BASE['modules'][0]['units'] for s in u['screens']}


def orig(sid):
    """Pantalla original (copia) del importado literal."""
    return copy.deepcopy(_ORIG[sid])


# --------------------------------------------------------------------------
# Limpieza mecánica de la extracción (formato perdido / incorrecto)
# --------------------------------------------------------------------------
_CALLOUT = r'(?:custom|tip|warn|important|fact|reflect|case|info)'


def clean(md):
    """Arregla los defectos de formato típicos del importador de Moodle."""
    t = md.replace('\r\n', '\n')
    # cierre y apertura de callout pegados en la misma línea: «::: ::: custom …»
    t = re.sub(r'^:::[ \t]+(?=::: ' + _CALLOUT + r')', ':::\n\n', t, flags=re.M)
    t = re.sub(r'^::: ::: ', '::: ', t, flags=re.M) if False else t
    # título del bloque personalizado que se coló como encabezado dentro de la caja
    t = re.sub(r'^(::: custom \| #\w+ \|[^|\n]*\| *)\n+## (.+)$', lambda m: m.group(1) + m.group(2).strip(), t, flags=re.M)
    # encabezados «##» vacíos y viñetas «*» sueltas
    t = re.sub(r'^#{1,6}[ \t]*$', '', t, flags=re.M)
    t = re.sub(r'^\*[ \t]*$', '', t, flags=re.M)
    # negritas contiguas «**a** **b**» → «**a b**»
    for _ in range(3):
        t = re.sub(r'\*\*([^*\n]+?)\*\*( )\*\*([^*\n]+?)\*\*', r'**\1 \3**', t)
    # espacios dentro de comillas angulares
    t = re.sub(r'«[ \t]+', '«', t)
    t = re.sub(r'[ \t]+»', '»', t)
    # espacios dentro de negritas: «** a**» / «**a **»
    t = re.sub(r'\*\*[ \t]+([^*\n]+?)\*\*', r'**\1**', t)
    t = re.sub(r'\*\*([^*\n]+?)[ \t]+\*\*(?=\S)', r'**\1** ', t)
    t = re.sub(r'\*\*([^*\n]+?)[ \t]+\*\*', r'**\1**', t)
    t = re.sub(r'[ \t]+\n', '\n', t)
    t = re.sub(r'\n{3,}', '\n\n', t)
    return t.strip()


def strip_heading(md, *titles):
    """Quita encabezados `##`/`###` iniciales que repiten el título de la pantalla."""
    out = md
    while True:
        m = re.match(r'\s*#{2,3}[ \t]+(.+)\n+', out)
        if not m:
            break
        out = out[m.end():]
    return out.strip()


def blocks(md):
    """Trocea markdown en bloques de nivel superior (párrafo, lista, callout completo,
    encabezado, línea de imagen…), sin perder nada: `'\n\n'.join(blocks(x)) == x`
    salvo normalización de líneas en blanco."""
    out, cur, in_call = [], [], False
    for line in md.split('\n'):
        if not in_call and line.startswith('::: ') and not line.strip() == ':::':
            if cur:
                out.append('\n'.join(cur).strip())
                cur = []
            in_call = True
            cur.append(line)
            continue
        if in_call:
            cur.append(line)
            if line.strip() == ':::':
                out.append('\n'.join(cur).strip())
                cur, in_call = [], False
            continue
        if line.strip() == '':
            if cur:
                out.append('\n'.join(cur).strip())
                cur = []
        else:
            cur.append(line)
    if cur:
        out.append('\n'.join(cur).strip())
    return [b for b in out if b]


def join(*parts):
    """Une bloques/textos en un student_text."""
    flat = []
    for p in parts:
        if isinstance(p, (list, tuple)):
            flat.extend(p)
        elif p:
            flat.append(p)
    return '\n\n'.join(x.strip() for x in flat if x and x.strip())


def text_of(sid):
    """Texto limpio de una pantalla original."""
    return clean(_ORIG[sid]['student_text'])


def B(sid):
    """Bloques limpios de una pantalla original."""
    return blocks(text_of(sid))


def callout(kind, body, title=None, color='#6DC3C0', icon=''):
    if kind == 'custom':
        return f'::: custom | {color} | {icon} | {title}\n{body.strip()}\n:::'
    return f'::: {kind}\n{body.strip()}\n:::'


# --------------------------------------------------------------------------
# Pantallas
# --------------------------------------------------------------------------
def img(src, alt, caption='', layout='top', media_width=None):
    """Recurso visual (la ruta debe existir en el ZIP base: assets/img/…)."""
    v = {'kind': 'image', 'src': src, 'alt': alt, 'layout': layout}
    if caption:
        v['caption'] = caption
    if media_width:
        v['media_width'] = media_width
    return v


def screen(title, text='', *, type='content', objective='', visual=None, interaction=None,
           interaction_top=False, src=(), notes=(), status='ok'):
    """Pantalla nueva. `src`: ids de pantallas originales de las que sale el texto."""
    return {
        'id': '',
        'type': type,
        'title': title,
        'objective': objective,
        'student_text': text.strip(),
        'source_refs': [{'doc': DOC, 'locator': ', '.join(src) or 'material añadido', 'transform': 'conservación' if src else 'añadido'}],
        'visual_resource': visual or {'kind': 'none'},
        'interaction': interaction,
        'interaction_layout': 'top' if interaction_top else 'bottom',
        'required': True,
        'min_time_seconds': 0,
        'audio_src': '',
        'transcript': '',
        'editor_notes': list(notes),
        'status': status,
    }


def _fb(ok='Correcto.', ko='Revisa el contenido del tema.', expl=''):
    return {'correct': ok, 'incorrect': ko, 'explanation': expl}


def _inter(type_, *, prompt='', instructions='', options=None, config=None, fb=None, scored=False, points=0, attempts=1):
    return {
        'id': '', 'type': type_, 'prompt': prompt, 'instructions': instructions,
        'options': options or [], 'config': config or {},
        'feedback': fb or {'correct': '', 'incorrect': '', 'explanation': ''},
        'scored': scored, 'points': points, 'attempts': attempts, 'retries': 0,
        'source_refs': [],
    }


def single_choice(prompt, options, ok='Correcto.', ko='No es la opción correcta. Revisa el apartado.', expl='', instructions=''):
    """options: lista de (texto, correcta:bool) o (texto, correcta, feedback)."""
    opts = []
    for i, o in enumerate(options):
        d = {'id': chr(97 + i), 'text': o[0], 'correct': bool(o[1])}
        if len(o) > 2 and o[2]:
            d['feedback'] = o[2]
        opts.append(d)
    return _inter('single_choice', prompt=prompt, instructions=instructions, options=opts,
                  fb=_fb(ok, ko, expl), scored=True, points=1, attempts=2)


def true_false(prompt, is_true, ok='Correcto.', ko='No es correcto. Revisa el apartado.', expl=''):
    opts = [{'id': 'a', 'text': 'Verdadero', 'correct': bool(is_true)}, {'id': 'b', 'text': 'Falso', 'correct': not is_true}]
    return _inter('true_false', prompt=prompt, options=opts, fb=_fb(ok, ko, expl), scored=True, points=1, attempts=2)


def fill_blanks(text, distractors=(), instructions='Completa los huecos eligiendo la palabra correcta.', ok='Correcto.', ko='Alguna respuesta no es correcta. Revisa el apartado.', expl=''):
    cfg = {'text': text}
    if distractors:
        cfg['distractors'] = list(distractors)
    return _inter('fill_blanks', instructions=instructions, config=cfg, fb=_fb(ok, ko, expl), scored=True, points=1, attempts=2)


def classification(groups, items, prompt='', instructions='Arrastra o asigna cada elemento a su categoría.', ok='Todo está bien clasificado.', ko='Alguno está en una categoría equivocada. Revisa el apartado.', expl=''):
    """groups: [label]; items: [(texto, label_del_grupo)]."""
    gid = {g: f'g{i + 1}' for i, g in enumerate(groups)}
    return _inter('classification', prompt=prompt, instructions=instructions,
                  config={'groups': [{'id': gid[g], 'label': g} for g in groups]},
                  options=[{'id': f'o{i + 1}', 'text': t, 'group': gid[g]} for i, (t, g) in enumerate(items)],
                  fb=_fb(ok, ko, expl), scored=True, points=1, attempts=2)


def match_pairs(pairs, prompt='', instructions='Relaciona cada concepto con su correspondencia.', ok='Emparejado correctamente.', ko='Alguna pareja no es correcta: revísalo.', expl=''):
    """pairs: [(término, correspondencia)]. El término es el grupo; la correspondencia, la opción."""
    return _inter('match_pairs', prompt=prompt, instructions=instructions,
                  config={'groups': [{'id': f'g{i + 1}', 'label': t} for i, (t, _) in enumerate(pairs)]},
                  options=[{'id': f'o{i + 1}', 'text': d, 'group': f'g{i + 1}'} for i, (_, d) in enumerate(pairs)],
                  fb=_fb(ok, ko, expl), scored=True, points=1, attempts=2)


def sort_steps(steps, prompt='', instructions='Ordena los pasos.', ok='Orden correcto.', ko='El orden no es correcto. Revisa el apartado.', expl=''):
    return _inter('sort_steps', prompt=prompt, instructions=instructions,
                  config={'steps': [{'id': f'p{i + 1}', 'text': t, 'order': i + 1} for i, t in enumerate(steps)]},
                  fb=_fb(ok, ko, expl), scored=True, points=1, attempts=2)


def scenario_decision(scenario, options, prompt='¿Qué decisión tomas?', ok='Buena decisión.', ko='Hay una opción más adecuada. Revisa el apartado.', expl=''):
    """options: (texto, correcta, feedback)."""
    return _inter('scenario_decision', prompt=prompt, config={'scenario': scenario},
                  options=[{'id': chr(97 + i), 'text': o[0], 'correct': bool(o[1]), 'feedback': o[2] if len(o) > 2 else ''} for i, o in enumerate(options)],
                  fb=_fb(ok, ko, expl), scored=True, points=1, attempts=2)


def case_practice(prompt, rubric, instructions='Piensa tu respuesta (o escríbela en papel) y compárala después con los criterios.', expl=''):
    return _inter('case_practice', prompt=prompt, instructions=instructions,
                  config={'rubric': [{'label': r} for r in rubric]},
                  fb={'correct': '', 'incorrect': '', 'explanation': expl})


def accordion(items):
    return _inter('accordion', config={'items': [{'title': t, 'body': b} for t, b in items]})


def tabs(items):
    return _inter('tabs', config={'items': [{'title': t, 'body': b} for t, b in items]})


def flip_cards(cards):
    return _inter('flip_cards', config={'cards': [{'front': f, 'back': b} for f, b in cards]})


def timeline(milestones):
    """milestones: (label, title, body)."""
    return _inter('timeline', config={'milestones': [{'label': l, 'title': t, 'body': b} for l, t, b in milestones]})


def flashcards(cards):
    return _inter('flashcards', instructions='Repasa los conceptos del tema: piensa la respuesta, compruébala y marca si la sabías.',
                  config={'cards': [{'front': f, 'back': b} for f, b in cards]})


def word_search(words):
    return _inter('word_search', instructions='Encuentra las palabras clave del tema: toca la primera y la última letra de cada una.', config={'words': list(words)})


def crossword(entries):
    return _inter('crossword', instructions='Completa el crucigrama con los conceptos del tema.', config={'entries': [{'word': w, 'clue': c} for w, c in entries]})


def az_quiz(items):
    return _inter('az_quiz', instructions='Escribe la respuesta de cada definición; la letra del rosco es la inicial de la respuesta.', config={'items': [{'clue': c, 'answer': a} for c, a in items]})


def image_cards(cards):
    """cards: (src, alt, title, text)."""
    return _inter('image_cards', config={'cards': [{'image': s, 'alt': a, 'title': t, 'text': x} for s, a, t, x in cards]})


# --------------------------------------------------------------------------
# Control de calidad propio (además del validador del editor)
# --------------------------------------------------------------------------
def lint(scr):
    p = []
    t = scr['student_text']
    if re.search(r'^:::[ \t]+:::', t, flags=re.M) or '::: :::' in t:
        p.append('callouts pegados')
    if re.search(r'^#{1,6}[ \t]*$', t, flags=re.M):
        p.append('encabezado vacío')
    if t.count('**') % 2:
        p.append('negritas desemparejadas')
    if '![' in t:
        p.append('imagen incrustada en el texto')
    if re.match(r'\s*#{2,3} ', t):
        p.append('arranca con encabezado (¿repite el título?)')
    if re.match(r'^\d+(\.\d+)*\.?\s', scr['title']):
        p.append('título con numeración')
    if scr['interaction'] is None and len(t) > 1300:
        p.append(f'texto muy largo sin interacción ({len(t)})')
    if scr['visual_resource'].get('kind') == 'image' and not scr['visual_resource'].get('alt', '').strip():
        p.append('imagen sin alt')
    if re.search(r'[a-záéíóúñ]\*\*[^\s*]', t) and False:
        p.append('negrita pegada')
    return p
