# SCORMEditor

Generador de paquetes **SCORM 1.2** reutilizables a partir de un `course.json`
estructurado. Sin dependencias de Articulate/Captivate: el SCORM exportado es
HTML/CSS/JS plano, autocontenido y compatible con Moodle.

> ⚠️ Esta herramienta **no acredita homologación ni cumplimiento oficial** ante el
> SEPE u otra administración. Genera contenido preparado para revisión por la
> entidad y alineable con criterios oficiales; la conformidad normativa la
> confirma la entidad responsable.

## Arrancar

```bash
npm install
npm run dev        # editor en http://localhost:5173
npm run build      # build de producción del editor
npm run typecheck  # verificación de tipos
```

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
│  ├─ assets/js/interactions.js  # motor de 12 interacciones
│  ├─ assets/js/renderer.js      # render por tipo de pantalla
│  ├─ assets/js/app.js           # orquestador + reglas SCORM
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
├─ validation/validators.ts      # panel de validadores
├─ report/report.ts              # informe HTML/Markdown
├─ store/courseStore.ts          # estado (Zustand) + CRUD pantallas
├─ components/                    # Editor, árbol DnD, paneles
├─ App.tsx · main.tsx · editor.css
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

Reglas configurables (`scorm.rules` en `course.json`): % de pantallas
obligatorias vistas, interacciones obligatorias, nota mínima, intentos, origen de
la nota (test final / tests de unidad / mixto), navegación (libre / secuencial /
mixta) y reanudación de sesión.

## Schema versionado

`course.json` incluye `schema_version`. En import: `migrate()` encadena
migraciones hasta la versión actual y luego Zod valida y normaliza (rellena
defaults). Para evolucionar el schema: subir `SCHEMA_VERSION` y añadir una
entrada en `migrations.ts`.

## Plan MVP por fases

| Fase | Alcance | Estado en este scaffold |
|---|---|---|
| **F1 · Núcleo** | Schema Zod, carcasa SCORM fija, wrapper 1.2, export ZIP, manifest, import/export JSON | ✅ Implementado |
| **F2 · Editor** | Árbol DnD, CRUD pantallas, editor de campos e interacción, vista estudiante | ✅ Base funcional |
| **F3 · Render & interacciones** | 10 tipos de pantalla + 12 interacciones, subtítulos VTT, transcripción | ✅ Implementado (refinable) |
| **F4 · Calidad** | Validadores, informe de revisión, matriz de trazabilidad, checklists | ✅ Implementado |
| **F5 · Gestión de assets** | Subida de imágenes/vídeo/audio/VTT a `assets/`, vinculación en pantallas | 🔜 `addAsset()` listo; falta UI de carga |
| **F6 · Backend (opcional)** | Persistencia de cursos, assets y versiones; multiusuario; exportación servidor | 🔜 Pendiente |

### Próximos refinamientos sugeridos
- UI de carga de media (drag&drop a `assets/img|media`, generación de `.vtt`).
- DnD entre unidades distintas (hoy: reordenación intra-unidad + movimiento por
  acción; el store ya soporta `moveScreen` cross-unit).
- Persistencia en IndexedDB (autoguardado) y export/import de proyecto completo
  (course.json + assets).
- Editores específicos por tipo de interacción (acordeón, tabs, sort, hotspots).
- Tests de empaquetado SCORM contra Moodle (SCORM Cloud / `scorm-again`).

## Tipos soportados

**Pantallas:** cover, objectives, route, content, summary, video, reflection,
forum_prompt, unit_quiz, content_placeholder.

**Interacciones:** accordion, tabs, flip_cards, match_pairs, sort_steps,
single_choice, true_false, classification, scenario_decision, case_practice,
hotspots, video (con transcripción + subtítulos VTT).

Todas son editables, todo multimedia admite transcripción y todo feedback es
textual además de visual (región `aria-live`).
