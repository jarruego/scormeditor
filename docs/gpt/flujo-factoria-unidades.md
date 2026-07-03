# Flujo «factoría» para unidades grandes (SCORMEditor)

Procedimiento **obligatorio** cuando se pide generar una **unidad completa** (varios
temas) para SCORMEditor a partir de PDF/DOC/texto. Complementa a
`contrato-course-json.md` (estructura), `guia-diseno-interacciones.md` (criterio,
Regla Nº1 de no resumir) y `ejemplo-course-json.md` (forma).

## Por qué existe este flujo
Un `course.json` con los `transcript` completos de una unidad entera **no cabe en una
sola respuesta**: el modelo, al intentar «escupirlo» de golpe, comprime y **resume**
(cobertura observada ~44 % del texto fuente). La solución no es escribir mejor el
prompt, sino **trocear la producción**: trabajar **tema a tema**, generar **parciales
auditables descargables** y **fusionar solo al final**. Requiere Code Interpreter /
Data Analysis activo.

## Regla crítica
**Nunca** escribas el `course.json` completo de una unidad larga directamente en el
chat. Constrúyelo **mediante archivos** con Code Interpreter (un `dict` por tema que
se vuelca a un parcial descargable). El usuario recibe **archivos**, no JSON gigante.

## Los tres modos
1. **Inventario** (Fase 0): planificar la unidad, sin generar nada final.
2. **Tema parcial** (Fase 1–2): producir y auditar **un** tema, entregar su parcial.
3. **Fusión final** (Fase 3): unir los parciales aprobados en un único `.scormproj`.

---

## Fase 0 — Inventario de la unidad
1. **Extrae el índice real** de la unidad desde el documento (no de memoria).
2. Identifica todos los **temas, epígrafes, subepígrafes, actividades, imágenes,
   tablas, casos, glosario y bibliografía**.
3. Estima el **nº de palabras fuente por tema**.
4. Devuelve un **plan de producción**: lista de temas, palabras fuente estimadas por
   tema, nº de pantallas previsto, imágenes detectadas por tema.
5. **No generes todavía** ningún `.scormproj` ni parcial. Espera la orden de trabajar
   el primer tema.

---

## Fase 1 — Producción tema a tema
Para **cada** tema, y **solo** ese tema (ver Regla Nº1 de la guía):
1. **Extrae el texto completo CON su formato** (no en plano): con PyMuPDF
   `get_text("dict")`, conserva las **negritas** del original (`flags`/fuente «Bold» →
   `**...**`), detecta **encabezados** (tamaño/estilo → `## `/`### `) y **cajas
   destacadas** (etiqueta o recuadro/color → callouts `::: tipo`).
2. **Segmenta** por epígrafe/idea en trozos **pequeños y coherentes**, en orden.
3. **Una pantalla por trozo** (o más si mezcla ideas). Sin tope: 20-40+ pantallas por
   tema es normal.
4. Conserva el texto **casi literal (~100%)**: NO resumas ni reescribas «para
   e-learning»; usa las palabras del documento con solo retoques de conexión. El texto
   va **visible** (`student_text` y/o dentro de accordion/tabs/flip_cards que lo
   **contienen**) y **duplicado íntegro en `transcript`**.
5. Presenta el texto de forma amena con interactividades **informativas** (que
   contienen el texto fuente) y, cada **4-8 pantallas**, una pantalla de checkpoint con
   una interactividad **aplicada** (`scenario_decision`/`classification`/
   `single_choice`/`case_practice`). Una interacción por pantalla.
6. Añade callouts (`::: tipo`), `source_refs` reales (página real del PDF, no
   aproximada), imágenes del tema y su `alt`.

### Control de cobertura (obligatorio antes de cerrar un tema)
1. Cuenta las **palabras del texto fuente** del tema.
2. Cuenta las **palabras del texto conservado** (visible + `transcript`, sin contar el
   duplicado).
3. `ratio_conservacion = palabras_conservadas / palabras_fuente`.
4. Objetivo **≈1.0 (mínimo ≥0.95)**. Si `ratio < 0.95`: **NO** cierres el tema. Añade
   pantallas, recupera listas, ejemplos, actividades y matices omitidos, y **recalcula**.
5. Registra en el informe: palabras fuente, palabras conservadas, % conservado,
   epígrafes cubiertos, imágenes incluidas, imágenes omitidas, incidencias.

### El parcial (archivo descargable)
Genera **un parcial por tema**. Si el tema **no** tiene imágenes, un `.json`; si
**tiene** imágenes, un **`.scormpart`** (ZIP con el `.json` en la raíz + `assets/`).
Nómbralo `u01_t01.partial.json` / `u01_t01.scormpart`.

Estructura del parcial (`*.partial.json`):

```json
{
  "partial_version": "1.0.0",
  "tema_id": "u01_t01",
  "unit": {
    "id": "u01_t01",
    "title": "Tema 1. ...",
    "summary": "...",
    "status": "ok",
    "screens": [ /* pantallas del tema, forma del contrato §4 */ ]
  },
  "glossary": [ /* términos del tema, forma §8 */ ],
  "bibliography": [ /* referencias del tema, forma §8 */ ],
  "question_bank": [ /* preguntas del tema, forma §7 (single_choice/true_false) */ ],
  "assets": [ "assets/img/u01_t01_fig1.png" ],
  "coverage": {
    "palabras_fuente": 0,
    "palabras_conservadas": 0,
    "ratio": 0.0,
    "epigrafes_cubiertos": [],
    "imagenes_incluidas": [],
    "imagenes_omitidas": [],
    "incidencias": []
  }
}
```

- `unit` es una **unidad del contrato** (`modules[].units[]`): en la fusión se inserta
  tal cual.
- Las rutas de `assets[]` deben coincidir con las referenciadas en las pantallas del
  tema (misma regla que §11). En un `.scormpart`, los binarios van en `assets/`.

---

## Fase 2 — Validación por tema
Al terminar cada tema, entrega:
1. **Enlace** al parcial (`.json` o `.scormpart`).
2. **Informe de cobertura** (los campos de `coverage`).
3. **Lista de incidencias** (imágenes omitidas, epígrafes dudosos, contenido que
   requiere revisión humana).
4. **Pregunta** al usuario si continúa con el siguiente tema.

No avances al siguiente tema si el usuario pide revisar el actual. Si el ratio de un
tema quedó `< 0.95`, avísalo explícitamente como incidencia bloqueante.

---

## Fase 3 — Fusión final
Cuando **todos** los temas estén aprobados:
1. **Lee todos los parciales** generados (`.json` / `.scormpart`).
2. **Fusiona** las `unit` de cada parcial dentro de `modules[].units[]` (en orden).
3. **Unifica** glosario, bibliografía, evaluación, assets y `quality_checklist`.
4. **Deduplica** términos de glosario (por `term`) y referencias (por `ref`/`url`).
5. Monta la **evaluación**: por defecto (`score_source=final_test`) vuelca todos los
   `question_bank` en `assessments.final_test.questions`; si el usuario pide test por
   tema, usa `assessments.unit_tests[]` (uno por `unit`).
6. Construye **un único `.scormproj`** con `build_scormproj` (contrato §11):
   `course.json` en la raíz + `assets/` con todos los binarios; **sin rutas rotas**.
7. **Valida** el paquete antes de entregarlo.

### Entrega final
- Enlace al `.scormproj`.
- **Informe global de cobertura**: % de conservación global y por tema.
- Imágenes incluidas / no incluidas.
- Incidencias pendientes.

### Helper de fusión (Code Interpreter)

```python
import json, zipfile, glob, os

def load_partial(path):
    if path.endswith('.scormpart'):
        z = zipfile.ZipFile(path)
        name = next(n for n in z.namelist() if n.endswith('.partial.json'))
        data = json.loads(z.read(name))
        assets = {n: z.read(n) for n in z.namelist()
                  if n.startswith('assets/') and not n.endswith('/')}
        return data, assets
    return json.loads(open(path, encoding='utf-8').read()), {}

def merge_unit(base_course, partials, score_source='final_test'):
    """base_course: dict con course/scorm/shell ya definidos y modules=[{id,title,units:[]}].
    partials: lista de rutas a parciales aprobados, en orden."""
    units, glo, bib, qbank, asset_files = [], [], [], [], {}
    for p in partials:
        data, assets = load_partial(p)
        units.append(data['unit'])
        glo += data.get('glossary', [])
        bib += data.get('bibliography', [])
        qbank += data.get('question_bank', [])
        asset_files.update(assets)
    # dedup
    seen=set(); glo=[g for g in glo if (g['term'] not in seen and not seen.add(g['term']))]
    seenb=set(); bib=[b for b in bib if ((b.get('ref'),b.get('url')) not in seenb and not seenb.add((b.get('ref'),b.get('url'))))]
    base_course['modules'][0]['units'] = units
    base_course['glossary'] = glo
    base_course['bibliography'] = bib
    if score_source == 'unit_tests':
        base_course['assessments'] = {'unit_tests': [
            {'id': f"A_{u['id']}", 'unit_id': u['id'], 'title': f"Test {u['title']}",
             'pass_score': 70, 'questions': pq}
            for u, pq in zip(units, [d.get('question_bank', []) for d,_ in map(load_partial, partials)])
        ], 'final_test': None}
    else:
        base_course['assessments'] = {'unit_tests': [],
            'final_test': {'id':'A01','unit_id':units[0]['id'],'title':'Evaluación final',
                           'pass_score':70,'questions': qbank}}
    return base_course, asset_files

# uso: course, asset_files = merge_unit(base, sorted(glob.glob('u01_t*.*')))
#      build_scormproj(course, asset_files)   # del contrato §11
```

---

## Órdenes de trabajo típicas (para el usuario)

**Inventario:**
> Haz el **inventario** de la Unidad 1 del PDF. Devuélveme el plan de producción por
> temas (palabras fuente y pantallas estimadas). No generes aún el `.scormproj`.

**Tema a tema:**
> Trabaja **solo el Tema 1** de la Unidad 1. No generes el `.scormproj` final.
> Entrégame el **parcial del Tema 1** y el **informe de cobertura**.

> Continúa con el **Tema 2** con el mismo criterio. Mantén compatibilidad con el
> parcial del Tema 1 para fusionarlos después.

**Fusión:**
> **Fusiona** los parciales aprobados de los temas 1, 2 y 3 en un único `.scormproj`
> de la Unidad 1. Valida rutas de assets, evaluación final, glosario, bibliografía y
> el **porcentaje global de conservación**.
