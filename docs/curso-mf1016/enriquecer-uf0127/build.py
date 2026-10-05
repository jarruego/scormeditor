# -*- coding: utf-8 -*-
"""Ensambla UF0127 enriquecido: tema1.py, tema2.py, tema3.py → .scormproj.

    python build.py [--out ruta.scormproj]

Cada temaN.py expone:
    SCREENS    lista de pantallas (lib.screen) del tema, en orden
    OBJECTIVES lista de textos de objetivo (los usados en screen(objective=...))
    GLOSSARY   [(término, definición)] opcional
Controla: lint de formato, cobertura de texto frente al original y validador del editor.
"""
import collections
import copy
import importlib
import io
import json
import os
import re
import subprocess
import sys
import zipfile

import lib

HERE = lib.HERE
OUT_DEFAULT = os.path.join(HERE, '..', 'scormproj', 'mf1016-u01-uf0127-apoyo-en-la-recepcion-y-acogida-en-instituciones-de-p.scormproj')

COURSE_TITLE = 'UF0127. Apoyo en la recepción y acogida en instituciones de personas dependientes'
UNIT_TITLES = {
    'u01_t00': 'Tema 1. Instituciones de atención a personas dependientes y equipo interdisciplinar',
    'u01_t01': 'Tema 2. Personas en situación de dependencia y atención institucional',
    'u01_t02': 'Tema 3. Atención integral y principios éticos en la recepción y acogida',
}
TEMAS = [('u01_t00', 'tema1'), ('u01_t01', 'tema2'), ('u01_t02', 'tema3')]


def words(t):
    t = re.sub(r':::\s*\w*( \|[^\n]*)?', ' ', t)
    return re.findall(r'[a-záéíóúüñ0-9]+', t.lower())


def interaction_text(it):
    if not it:
        return ''
    parts = [it.get('prompt', ''), it.get('instructions', '')]
    parts += [o.get('text', '') for o in it.get('options', [])]
    cfg = it.get('config', {})
    for k in ('items', 'cards', 'milestones', 'entries'):
        for x in cfg.get(k, []):
            parts += [str(v) for v in x.values()]
    parts += [it['feedback'].get('explanation', '')]
    parts += [cfg.get('scenario', ''), cfg.get('text', '')]
    parts += [g.get('label', '') for g in cfg.get('groups', [])]
    parts += [s.get('text', '') for s in cfg.get('steps', [])]
    return '\n'.join(str(p) for p in parts)


def main():
    out_path = OUT_DEFAULT
    if '--out' in sys.argv:
        out_path = sys.argv[sys.argv.index('--out') + 1]
    course = copy.deepcopy(lib.BASE)
    mod = course['modules'][0]
    glossary = []
    report = []
    problems = 0
    for unit, (uid, modname) in zip(mod['units'], TEMAS):
        try:
            t = importlib.import_module(modname)
        except ModuleNotFoundError as e:
            if e.name != modname:
                raise
            print(f'  ({modname}.py aún no existe: se deja el tema importado tal cual)')
            continue
        screens = copy.deepcopy(t.SCREENS)
        unit['screens'] = screens
        glossary += getattr(t, 'GLOSSARY', [])
        # cobertura de texto frente al original
        orig_txt = ' '.join(lib.text_of(s['id']) for s in lib.BASE['modules'][0]['units'][TEMAS.index((uid, modname))]['screens'])
        orig_w = collections.Counter(words(orig_txt))
        new_txt = ' '.join(s['student_text'] + '\n' + interaction_text(s['interaction']) + '\n' + s['visual_resource'].get('caption', '') for s in screens)
        new_w = collections.Counter(words(new_txt))
        missing = orig_w - new_w
        miss_n = sum(missing.values())
        report.append((uid, sum(orig_w.values()), miss_n, missing.most_common(25)))
    # ids secuenciales por proyecto
    n = 0
    for unit in mod['units']:
        unit['title'] = UNIT_TITLES[unit['id']]
        for s in unit['screens']:
            n += 1
            s['id'] = f's{n:03d}'
            if s['interaction']:
                s['interaction']['id'] = f"{s['id']}_i01"
    mod['title'] = COURSE_TITLE
    course['course']['title'] = COURSE_TITLE
    course['course']['subtitle'] = 'Módulo formativo MF1016_2 · SCO independiente de la UF0127'
    course['scorm']['title'] = COURSE_TITLE
    if glossary:
        seen = set()
        course['glossary'] = []
        for term, d in glossary:
            if term.lower() in seen:
                continue
            seen.add(term.lower())
            course['glossary'].append({'term': term, 'definition': d, 'source_refs': [{'doc': lib.DOC}]})
    # lint
    for unit in mod['units']:
        prev_plain = 0
        for s in unit['screens']:
            for p in lib.lint(s):
                print(f"  LINT {s['id']} «{s['title']}»: {p}")
                problems += 1
            plain = s['interaction'] is None and s['visual_resource'].get('kind', 'none') == 'none' and '::: ' not in s['student_text']
            prev_plain = prev_plain + 1 if plain else 0
            if prev_plain > 3:
                print(f"  RITMO {s['id']} «{s['title']}»: más de 3 pantallas seguidas de solo texto")
                problems += 1
        kinds = [s['interaction']['type'] for s in unit['screens'] if s['interaction']]
        print(f"{unit['id']}: {len(unit['screens'])} pantallas, {len(kinds)} interacciones {collections.Counter(kinds).most_common()}")
    for uid, tot, miss, top in report:
        print(f'COBERTURA {uid}: {tot} palabras originales, {miss} sin reaparecer ({100 * (1 - miss / tot):.1f}% conservado)')
        if miss:
            print('   faltan:', ', '.join(f'{w}×{c}' for w, c in top))
    # empaquetar solo los assets referenciados
    txt = json.dumps(course, ensure_ascii=False)
    used = set(re.findall(r'assets/img/[^\s"\'()\\]+', txt))
    zin = lib._zf
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    with zipfile.ZipFile(out_path, 'w', zipfile.ZIP_STORED) as zo:
        zo.writestr('course.json', json.dumps(course, ensure_ascii=False, indent=2))
        for name in zin.namelist():
            if name.startswith('assets/') and name in used:
                zo.writestr(name, zin.read(name))
    unused = [n for n in zin.namelist() if n.startswith('assets/') and n not in used]
    print(f'Escrito {out_path} · {len(used)} imágenes usadas, {len(unused)} sin usar: {unused}')
    print(f'{problems} avisos de lint')
    root = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
    subprocess.run(['node', 'scripts/moodle-import/qa-scormproj.mjs', os.path.abspath(out_path)], cwd=root)


if __name__ == '__main__':
    main()
