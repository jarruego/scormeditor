# SCORMEditor

**App en producción: <https://scormeditor.netlify.app/>** (Netlify, despliegue continuo
desde `main`).

Editor y generador de paquetes **SCORM 1.2** para Moodle a partir de un curso
estructurado (`course.json`). Sin dependencias de Articulate/Captivate: el SCORM
exportado es HTML/CSS/JS plano, autocontenido y compatible con Moodle.

Proyecto **libre y colaborativo**: cualquier persona puede usarlo, proponer mejoras
y abrir Pull Requests.

SCORMEditor permite crear un proyecto completo **desde cero** en el propio editor.
Además, si quieres acelerar la maquetación inicial, puedes usar un **GPT de ChatGPT**
que convierta un PDF/Word en un `.scormproj` editable. Mientras se termina de validar al
100% un GPT oficial compatible, puedes configurar el tuyo con los ficheros de `docs/gpt/`.
Flujos típicos:

```
Desde 0 en SCORMEditor ─▶ [SCORMEditor: editar] ─▶ Exportar SCORM ZIP ─▶ Moodle
PDF/Word ─▶ [GPT ChatGPT propio] ─▶ .scormproj ─▶ [SCORMEditor: editar] ─▶ Exportar SCORM ZIP ─▶ Moodle
```

Ese GPT es un paso **intermedio**: entrega el proyecto editable, no el SCORM final (lo
genera SCORMEditor al exportar). Ver «Generación del contenido (GPT)».

> ⚠️ Esta herramienta **no acredita homologación ni cumplimiento oficial** ante el
> SEPE u otra administración. Genera contenido preparado para revisión por la
> entidad y alineable con criterios oficiales; la conformidad normativa la
> confirma la entidad responsable.

## Documentación
- **`CLAUDE.md`** — invariantes de diseño + índice de la doc interna.
- **`docs/internals/`** — doc interna por área (runtime, editor, interacciones,
  evaluación/finalización, persistencia, TTS, validación/informes, ingesta).
- **`docs/internals/demo-scormeditor.scormproj`** — proyecto demo con todos los
  tipos de pantalla e interacción.
- **`docs/gpt/`** — los 6 ficheros de conocimiento que se suben al GPT de ChatGPT
  (contrato, ejemplo, guía, flujo por fases, referencia rápida, instrucciones).

## Arrancar

```bash
npm install
npm run dev         # editor en http://localhost:5173
npm run build       # build de producción del editor (tsc -b + vite build)
npm run typecheck   # verificación de tipos
npm run preview     # servir build local
npm run scorm:build # empaqueta el curso de ejemplo a SCORM por CLI (scripts/build-scorm.mjs)
```

## Despliegue (Netlify)

Publicado en **<https://scormeditor.netlify.app/>** con **despliegue continuo**: cada
`push` a `main` dispara `npm run build` y publica `dist/`; cada Pull Request genera un
Deploy Preview. La configuración (comando, carpeta, Node y fallback SPA) está en
**`netlify.toml`**, así que Netlify no necesita ajustes manuales. Si el build falla (p. ej.
error de `tsc`), no se publica y la versión anterior sigue online. No hay backend ni
secretos en el build; las claves de la narración TTS son de cada usuario (localStorage).

## Guardar y abrir proyectos

El editor trabaja con un **archivo de proyecto** `.scormproj`: un ZIP que
contiene `course.json` + `assets/`. Es el documento real, igual que un `.docx`
o un `.fig`. El flujo es el estándar de cualquier app de documento:

> editar → **● Sin guardar** → `Ctrl+S` → **✓ Guardado**

- **Menú «Archivo»** de la barra superior: *Abrir proyecto…*, *Guardar*,
  *Guardar como…*, *Nuevo (demo)* y *Exportar SCORM ZIP*.
- **Importación dual** al abrir: admite `.scormproj` y también `.zip` SCORM
  exportado (se importa como proyecto editable, sin vincular el ZIP de origen).
- El **indicador de estado** junto al título es además un botón: pulsarlo guarda.
- En **Chrome/Edge** (File System Access API) se reescribe el mismo archivo sin
  volver a preguntar; el permiso, si caduca tras recargar, se vuelve a pedir de
  forma transparente al guardar. En **Firefox/Safari** abrir usa el selector de
  archivos y guardar descarga el `.scormproj`.
- **Recuperación automática**: en paralelo, el trabajo se conserva en IndexedDB
  por si cierras sin guardar; al reabrir se restaura solo. No es «el guardado»
  (ese es siempre el `.scormproj`), solo una red de seguridad.

> El `.scormproj` es el **proyecto editable**; *Exportar SCORM ZIP* genera el
> paquete final para subir al LMS. Son cosas distintas.

## Generación del contenido (GPT)

Un **GPT de ChatGPT** (con Code Interpreter) transforma un PDF/Word en el `.scormproj`
que abre el editor: extrae el texto **con formato** (negritas, listas, cajas→callouts) y
las imágenes, lo trocea en pantallas con interacciones y test final, y empaqueta
`course.json` + `assets/` en el ZIP. Su comportamiento se define en los **6 ficheros de
`docs/gpt/`** (que se suben a ChatGPT: instrucciones + conocimiento). Criterio central:
**conservar el texto de origen casi al 100%** (sin resumir), repartir interacciones y
respetar el formato. Para unidades grandes trabaja en **modo factoría** (tema a tema con
parciales auditables). Detalle en `docs/internals/ingesta-gpt.md`.

## Edición en SCORMEditor

- **Pantallas**: árbol con reordenación (dnd-kit); editor de campos, recurso visual
  (imagen/vídeo/audio con subida de archivos y disposición por proporción) e interacción.
- **Materiales**: nodos editables de **Glosario** y **Bibliografía** desde el árbol.
- **Test final**: editable desde el nodo «Evaluación → Test final» (preguntas, opciones,
  feedback, nota de corte).
- **⚙ Ajustes** (menú con ventanas separadas): **Curso (finalización/evaluación)**,
  **Interfaz (marca, color y animaciones)** y **Narración (Audio IA)**.
- **Narración por voz (TTS)**: genera el audio de las pantallas a partir de la
  transcripción, individualmente o en lote (desde **⚙ Ajustes → Narración**).
- **Vista estudiante**: la misma carcasa que se exporta, sincronizada con el editor.
- **Validación e informe**: badge de errores/avisos + pestañas de validación y de informe
  (recuentos y matriz de trazabilidad de objetivos).
- **Ayuda integrada**: manual de usuario con capturas y **tour guiado** por la interfaz
  (menú «Ayuda»; en el primer arranque se ofrecen solos).

## Arquitectura

Dos mundos **desacoplados**:

1. **Editor** (`src/` salvo `src/runtime/`): SPA React + TS + Vite + Zustand + Zod.
   Importa/edita/valida el `course.json` y exporta. Vive solo en el navegador
   (persistencia local; backend opcional en fase 2).
2. **Carcasa / Runtime** (`src/runtime/`): HTML/CSS/JS **plano, sin framework ni
   build**. Es la plantilla fija que se copia *verbatim* dentro del ZIP. La
   interfaz nunca cambia; solo varían `data/course.json` y `assets/`.

Clave de coherencia: el editor carga la plantilla con
`import.meta.glob('../runtime/**', { query:'?raw' })` y tanto la **Vista
estudiante** como el **export ZIP** consumen esos mismos strings. Lo que pruebas
es exactamente lo que se exporta.

```
course.json ─▶ [Zod migrate+parse] ─▶ store (Zustand)
                                          ├─▶ ScreenEditor / CourseTree (dnd-kit)
                                          ├─▶ validateCourse() ─▶ ValidationPanel
                                          ├─▶ generateReport()  ─▶ ReportPanel
                                          ├─▶ buildPreviewHtml() ─▶ iframe carcasa
                                          └─▶ buildScormZip() (JSZip)
                                                ├─ src/runtime/** (carcasa fija)
                                                ├─ data/course.json
                                                ├─ assets/** (media)
                                                └─ imsmanifest.xml (generado)
```

## Modelo de carpetas

```
src/
├─ runtime/                      # CARCASA SCORM (plantilla, copiada al ZIP)
│  ├─ index.html
│  ├─ assets/css/styles.css
│  ├─ assets/js/scorm_api.js     # wrapper SCORM 1.2
│  ├─ assets/js/accessibility.js # aria-live, atajos, foco
│  ├─ assets/js/interactions.js  # motor de interacciones + esc()/rich() (anti-XSS)
│  ├─ assets/js/renderer.js      # render por tipo de pantalla + markdown ligero
│  ├─ assets/js/app.js           # orquestador, gating, nota, test final, resultados
│  └─ print/print.css
├─ schema/                       # contrato de datos
│  ├─ course.schema.ts           # Zod + tipos (versionado)
│  ├─ migrations.ts              # migración entre versiones de schema
│  └─ sample-course.ts
├─ scorm/
│  ├─ manifest.ts                # generador imsmanifest.xml
│  └─ runtimeAssets.ts           # carga la carcasa como strings
├─ export/exportScorm.ts         # JSZip → ZIP SCORM
├─ preview/buildPreview.ts       # srcDoc del iframe (misma carcasa)
├─ validation/validators.ts      # reglas de validación (errores/avisos)
├─ report/report.ts              # informe (recuentos + matriz de trazabilidad)
├─ tts/tts.ts                     # narración por voz (config + síntesis)
├─ store/
│  ├─ courseStore.ts             # estado (Zustand) + CRUD + undo/redo
│  ├─ autosave.ts                # .scormproj (abrir/guardar) + recuperación
│  ├─ persistence.ts             # IndexedDB (kv)
│  └─ customBlocks.ts            # presets de bloque personalizado (localStorage)
├─ components/                    # Toolbar, CourseTree, ScreenEditor, FinalTestEditor,
│                                 # CourseSettingsEditor, TtsPanel, InteractionConfigEditor,
│                                 # RichTextArea, FileButton, StudentPreview, Validation/Report
├─ App.tsx · main.tsx · editor.css

docs/
├─ gpt/         # EXTERNO: los 6 ficheros que se suben al GPT de ChatGPT
└─ internals/   # INTERNO: doc del código por área
```

ZIP exportado:

```
scorm_package.zip
├─ imsmanifest.xml
├─ index.html
├─ assets/css/styles.css
├─ assets/js/{scorm_api,accessibility,interactions,renderer,app}.js
├─ assets/img/ · assets/media/   (si hay assets)
├─ data/course.json
└─ print/print.css
```

## SCORM 1.2

`scorm_api.js` implementa el wrapper (`LMSInitialize`, `LMSGetValue`,
`LMSSetValue`, `LMSCommit`, `LMSFinish` + gestión de errores) y un **modo
standalone** automático cuando no hay LMS (para la Vista estudiante). Registra:
`cmi.core.lesson_status`, `cmi.core.score.raw`, `cmi.core.session_time`,
`cmi.core.lesson_location`, `cmi.suspend_data`.

El manifiesto (`imsmanifest.xml`) se genera desde los mismos ficheros reales del
runtime + `course.json` + assets referenciados, e incluye metadatos LOM en
`imslrm.xml`.

Reglas configurables (`scorm.rules` + `mastery_score`, editables en **⚙ Ajustes**):
% de pantallas obligatorias vistas, interacciones obligatorias, nota mínima, nota de
superación (`masteryscore`), intentos, origen de la nota (test final / tests de unidad /
mixto, con **peso configurable** práctica↔test en modo mixto), navegación (libre /
secuencial / mixta) y reanudación de sesión. Al final del curso, el runtime añade una
**pantalla de Resultados** (nota, APTO/NO APTO y desglose).

## Schema versionado

`course.json` incluye `schema_version`. En import: `migrate()` encadena
migraciones hasta la versión actual y luego Zod valida y normaliza (rellena
defaults). Para evolucionar el schema: subir `SCHEMA_VERSION` y añadir una
entrada en `migrations.ts`.

## Plan MVP por fases

| Fase | Alcance | Estado |
|---|---|---|
| **F1 · Núcleo** | Schema Zod, carcasa SCORM fija, wrapper 1.2, export ZIP, manifest | ✅ |
| **F2 · Editor** | Árbol DnD, CRUD pantallas, editor de campos e interacción, vista estudiante, editor de test final, ajustes del curso, undo/redo | ✅ |
| **F3 · Render & interacciones** | Tipos de pantalla + interacciones, subtítulos VTT, transcripción, markdown ligero + callouts, disposición de media | ✅ (refinable) |
| **F4 · Calidad** | Validadores, informe, matriz de trazabilidad, pantalla de resultados | ✅ |
| **F5 · Assets y proyecto** | Subida de imagen/vídeo/audio, proyecto `.scormproj` (abrir/guardar) + recuperación IndexedDB | ✅ (falta generar `.vtt`) |
| **F6 · Ingesta GPT** | GPT que genera `.scormproj` desde PDF/Word (docs de `docs/gpt/`) | ✅ (iteración continua) |
| **F7 · Narración TTS** | Audio por pantalla desde la transcripción (individual + lote) | ✅ |
| **F8 · Backend (opcional)** | Persistencia servidor, versiones, multiusuario | 🔜 Pendiente |

### Próximos refinamientos sugeridos
- Generación de subtítulos `.vtt` desde el audio/transcripción.
- Drag&drop de media a `assets/` (hoy: subida por botón `FileButton`).
- DnD de pantallas entre unidades distintas (hoy: reordenación intra-unidad +
  movimiento por acción; el store ya soporta `moveScreen` cross-unit).
- **Animación secuencial** del contenido (revelar bloques en cascada; ver
  `docs/internals/interacciones.md`).
- Tests de empaquetado SCORM contra Moodle (SCORM Cloud / `scorm-again`).

## Cómo colaborar

Este proyecto también está pensado para aprender. **No hace falta ser experto en
desarrollo ni en Git** para participar.

Yo también estoy aprendiendo el flujo de mantenimiento colaborativo (issues,
revisiones y pull requests), así que puede que algunas respuestas tarden más de
lo ideal. Aun así, la intención es mantener el proyecto vivo y hacerlo crecer
con la comunidad.

Si quieres aportar, puedes empezar así:

1. Abre un **Issue** y cuéntanos la idea, duda o bug (aunque sea breve).
2. Si te animas, envía un **Pull Request** pequeño y enfocado.
3. Si es tu primera contribución, indícalo en el Issue/PR y te ayudamos con el proceso.
4. Si tocas comportamiento, actualiza también la doc interna de `docs/internals/`.
5. Verifica antes de enviar con `npm run build` (y `npm run typecheck` si procede).

El objetivo del proyecto es ser útil y mantenible para toda la comunidad de
formación e-learning.

## Tipos soportados

**Pantallas:** cover, objectives, route, content, summary, video, reflection,
forum_prompt, unit_quiz, content_placeholder.

**Interacciones:** accordion, tabs, flip_cards, match_pairs, sort_steps,
single_choice, true_false, classification, scenario_decision, case_practice,
hotspots, video (con preguntas opcionales), fill_blanks, timeline,
flashcards, html_embed, image_cards, before_after, word_search.

Todas son editables, todo multimedia admite transcripción y todo feedback es
textual además de visual (región `aria-live`).
