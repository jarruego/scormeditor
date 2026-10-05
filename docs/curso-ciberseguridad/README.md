# Programa «Ciberseguridad en centros sociosanitarios»

Curso de muestra (≈ 8-10 h) en 6 `.scormproj` para personal de residencias y centros sociosanitarios,
pensado para móvil y para personas sin soltura digital. Hecho con SCORMEditor para enseñar de qué es capaz:
interactivos a medida (HTML+CSS+JS aislados), historias con decisiones, ilustraciones SVG propias, escenas
con `hotspots`, vídeos de YouTube verificados, rosco/crucigrama/sopa de letras, compromiso final y test.

| Qué | Dónde |
|---|---|
| **Documento base** (investigación, fuentes, casos, vídeos, preguntas) | `documento-base.md` |
| Dossiers de investigación por curso | `fuentes/0N-*.md` |
| **Los 6 `.scormproj`** (abrir con *Archivo ▸ Abrir*) | `scormproj/` |
| Guiones que generan cada curso | `../../scripts/curso-ciberseguridad/cN-*.mjs` |

## Regenerar

```bash
node scripts/curso-ciberseguridad/run.mjs c1-fundamentos.mjs     # deja scormproj/<id>.scormproj
node scripts/curso-ciberseguridad/verify-scorm.mjs docs/curso-ciberseguridad/scormproj/<id>.scormproj [carpetaCapturas]
node scripts/curso-ciberseguridad/build-doc-base.mjs             # recompone documento-base.md
```

`run.mjs` valida contra el schema Zod y `validateCourse` reales del editor; `verify-scorm.mjs` monta el curso
con la carcasa real y lo recorre entero en Chrome móvil (390 px). Reglas de autoría en
`scripts/curso-ciberseguridad/GUIA-AUTORIA.md`; kit reutilizable en `lib.mjs` (DSL), `widgets.mjs`
(interactivos), `svgkit.mjs` (ilustraciones).

## Pendiente de revisión humana antes de publicar

Ver «Verificaciones pendientes» en `documento-base.md` y las `editor_notes` de cada pantalla (vídeos por ver,
licencia del kit INCIBE, propuestas a validar por el DPD del centro). Los tiempos de los interactivos
(`est_seconds`) están estimados a ojo.
