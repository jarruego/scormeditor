# Arquitectura y runtime (carcasa)

> Doc interno de SCORMEditor. Índice en `CLAUDE.md`. Invariantes (una sola fuente,
> anti-XSS) viven en `CLAUDE.md`; aquí va el **detalle** del render de la carcasa.

## Dos mundos
- **Editor** (`src/` salvo `src/runtime/`): SPA React+TS+Vite+Zustand+Zod.
- **Carcasa/Runtime** (`src/runtime/`): HTML/CSS/JS **plano, sin framework ni build**,
  se copia *verbatim* dentro del ZIP SCORM. El editor la carga con
  `import.meta.glob('../runtime/**', { query:'?raw' })` (`src/scorm/runtimeAssets.ts`);
  Vista estudiante (`buildPreview.ts`) y export ZIP consumen los mismos strings.

## Texto enriquecido (markdown ligero)
Editor: `src/components/RichTextArea.tsx` (barra de botones, sin dependencias).
Render: `mdToHtml`/`blocksToHtml` en `src/runtime/assets/js/renderer.js`.

Sintaxis soportada:
- `## ` / `### ` encabezados (H1 reservado al título de pantalla). Además, una línea que
  es **solo negrita** (`**Título**`, con `:` opcional) se renderiza como `<h3>` (para
  títulos que el origen trae en negrita en vez de con `##`).
- `**negrita**`, `*cursiva*`, `[texto](url)` (http(s) o mailto). Los enlaces se abren en
  otra pestaña (`target="_blank" rel="noopener noreferrer"`, ver `rich()`).
- `- ` listas con viñetas (también acepta `*`, `•`, `·`, `–`, `—` al inicio de línea,
  porque los PDF/DOC suelen usarlos); `1. ` / `1) ` listas numeradas (honra el número
  escrito con `<ol start>`/`<li value>` cuando no van consecutivos).
- Bloques destacados (callouts): `::: tipo` … `:::`
- Bloque personalizado: `::: custom | #color | icono | título` … `:::`

La plantilla `content` (`renderer.js`) **no** muestra `objective` como banner en cada
pantalla (queda como metadato de trazabilidad; el validador sigue exigiéndolo salvo en
`cover`/`summary`); solo la pantalla `objectives` presenta los objetivos al alumno.

### Bloques destacados y paleta corporativa
Los tipos viven en `CALLOUTS` (`renderer.js`) y su color en
`src/runtime/assets/css/styles.css` (`.me-callout-*`). Colores alineados con la
**paleta oficial de teleformación** (tabla "Tabla de Elementos Clave para Formación
Online.odt" en Google Drive; ver memoria `paleta-teleformacion`):

| Color | Hex | Bloques |
|---|---|---|
| Turquesa | `#6DC3C0` | 💡 Consejo (`tip`), 🧠 ¿Sabías que…? (`fact`), 📌 Importante (`important`) |
| Naranja | `#F4C910` | ⚠️ Atención (`warn`), 💭 Reflexiona (`reflect`), 🧪 Caso práctico (`case`) |
| Violeta | `#7787BF` | ℹ️ Información (`info`) |
| Rosa | `#F4D6D2` | (color por defecto del bloque personalizado) |

Decisiones: se adoptó la paleta de 4 colores (varios bloques **comparten color**, como
en la tabla original); **no** se añadieron como bloques fijos todos los elementos
(Tablas, Actividad, Referencias, Glosario, Debate, Tests): quedan cubiertos por el
bloque personalizado.

### Bloque personalizado
Botón **✚ Personalizado** en la barra: título, icono y color (muestras de la paleta +
selector libre). "Insertar" lo mete una vez; "Guardar y usar" lo persiste como **preset
reutilizable**. Presets en `localStorage` (`src/store/customBlocks.ts`, clave
`scormeditor.customBlocks`), **no** en `course.json` (cada bloque se exporta ya resuelto
en el texto). El color se valida como hex antes de inyectarlo en `style` (anti-inyección
CSS); icono y título se escapan con `esc()`.

## Recursos visuales
- `visual_resource` admite `layout` (`top`/`bottom`/`left`/`right`, def. `top`) y
  `media_width` (`33`/`50`/`66`, def. `50`). La maquetación texto+media
  (`.me-layout`/`.me-media`/`.me-mw-*`) aplica en **todas** las plantillas, no solo en
  content/route/video (un fallo histórico fue limitarlo).
- **Lightbox**: imágenes ampliables al 100% al hacer clic (`setupLightbox()`,
  `.me-lightbox`/`.me-zoomable`).
- **Assets en preview**: blobs vía `window.__ASSETS__` (mapa id→blobURL);
  `assetUrl()`/`asset` resuelve. En export, los ficheros van al ZIP y al manifiesto.

## Responsive / móvil
La carcasa es 100% responsive. En `max-width:760px` el menú lateral pasa a **slide-over**
absoluto y el cuerpo ocupa una sola columna (`.me-body, #me-app.me-menu-hidden .me-body {
grid-template-columns: 1fr; }`; ojo a la especificidad: un conflicto en
`grid-template-columns` dejó la pantalla en blanco en móvil). En vista alumno **no** se
muestra el árbol de pantallas del editor.

## Renombrado MecoSCORM → SCORMEditor (jun 2026)
La app se llamaba MecoSCORM. Se renombró **todo**: carpeta del repo, `package.json`
(`name: scormeditor`), id por defecto del manifiesto/CLI (`SCORMEDITOR-COURSE`), `brand`,
diálogos de guardado, docs y la base IndexedDB (`DB_NAME = 'scormeditor'`). No deben
quedar referencias a «mecoscorm» en el código.
