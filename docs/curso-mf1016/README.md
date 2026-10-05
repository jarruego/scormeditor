# MF1016_2 · Apoyo en la organización de intervenciones en el ámbito institucional

2 `.scormproj` (UF0127 y UF0128) en `scormproj/`, generados con
`scripts/moodle-import/moodle-to-scormproj.mjs` desde el backup Moodle `MF1016_2.mbz`.
Cada lección es una unidad; el test de cada tema va en `assessments.unit_tests` y el
«Test UFxxxx» de cierre en `final_test` (`score_source: mixed`, 50/50).

No importados: páginas «Contenidos»/«Objetivos del curso» y los dos «Ejercicio
evaluable» (tareas). El backup no contiene vídeos de YouTube. Pendiente de revisión:
objetivos (vacíos) y texto alternativo de las imágenes.

## Versión enriquecida (UF0127 y UF0128)
Los dos `.scormproj` se rehicen a partir del importado literal con
`enriquecer-uf0127/` y `enriquecer-uf0128/` (`python build.py`): títulos de menú sin
numeración, formato corregido, pantallas largas divididas, portada de módulo y de
tema, objetivos, actividades (informativas, evaluables, repaso y pasatiempo) y
resumen, según `docs/gpt/guia-diseno-interacciones.md` (decisiones en `CRITERIOS.md`).
Cobertura de texto ≥97 % (solo faltan numeraciones/encabezados quitados a propósito).
Revisar a mano: objetivos, preguntas y rúbricas (redactados a partir del tema),
transcripciones de tablas-imagen, bibliografía (el backup no la trae).
