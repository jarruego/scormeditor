# Editor de texto enriquecido (`RichTextArea` + `mdDialect`)

> Doc interno de SCORMEditor. Índice en `CLAUDE.md`. El render del markdown ligero en la
> carcasa (sintaxis, callouts, bloque personalizado) está en `arquitectura-runtime.md`.

`RichTextArea` (`src/components/RichTextArea.tsx`) es la caja de texto de `student_text`
y de otros campos (feedback, escenarios…). Es un editor **WYSIWYG real sobre
TipTap/ProseMirror**: el valor que entra y sale de `onChange` sigue siendo el **markdown
ligero en texto plano** del proyecto (la invariante no cambia — nunca se guarda HTML); el
puente entre ambos mundos es `src/text/mdDialect.ts` (`mdToJson`/`jsonToMd`), un módulo
puro sin dependencias que parsea ese markdown a un documento ProseMirror (JSON) y lo
serializa de vuelta.

## `mdDialect.ts`: el puente markdown ↔ ProseMirror
La referencia semántica es el renderizador de la carcasa (`renderer.js` `mdToHtml` +
`interactions.js` `rich`): este módulo **replica sus regex y su orden de aplicación**
(enlaces primero, luego `**negrita**`, luego `*cursiva*`) para que el editor jamás
interprete un texto de forma distinta a como lo verá el alumno. No hay AST intermedio
compartido con el runtime — son implementaciones paralelas deliberadamente alineadas, no
un import cruzado (el runtime es HTML/CSS/JS plano sin build, ver `CLAUDE.md`).

Dos garantías, verificadas por `scripts/test-md-dialect.ts` (`npx tsx
scripts/test-md-dialect.ts`):
- **Round-trip exacto**: `jsonToMd(mdToJson(x)) === x` para un corpus canónico de casos
  (negrita/cursiva anidadas, listas con numeración no consecutiva, callouts con y sin
  cierre, imágenes con/sin ancho…). Algunos casos de entrada se **normalizan** de forma
  aceptada (viñetas con `*`/`•`/`–` → `-`, `1)` → `1.`…): para esos solo se exige
  equivalencia de render, no igualdad byte a byte.
- **Equivalencia de render**: para todos los strings del proyecto demo
  (`docs/internals/demo-scormeditor.scormproj`), el `mdToHtml` **real** de la carcasa
  (evaluado en un sandbox `vm` de Node, cargando los `.js` del runtime tal cual) produce
  el mismo HTML antes y después del round-trip. Si esto se cumple, abrir un texto con el
  editor y guardarlo sin tocar nada no puede cambiar lo que ve el alumno.

Al tocar el dialecto (nueva marca inline, nuevo tipo de bloque) hay que mantener alineadas
tres cosas: las regex de `mdDialect.ts`, las de `renderer.js`/`interactions.js` en el
runtime, y añadir el caso nuevo al corpus del test. **Ejecutar el test es obligatorio**
tras cualquier cambio en el dialecto — es la única red de seguridad contra una regresión
silenciosa en lo que ve el alumno.

## Esquema del editor (`EXTENSIONS` en `RichTextArea.tsx`)
`StarterKit` de TipTap **recortado** a lo que el dialecto soporta: encabezados solo
`level: 2 | 3` (`##`/`###`), `link` sin autolink (se inserta siempre por el editor de
enlace, nunca detectando URLs sueltas), y **desactivados** `strike`, `code`, `codeBlock`,
`blockquote`, `horizontalRule`, `underline` — no existen en el dialecto ni los renderiza
la carcasa; dejarlos activos permitiría crear contenido que luego no se ve igual. Dos
nodos propios en `src/components/tiptap/`:
- **`CalloutNode`** (`CalloutNode.tsx`): el bloque `::: tipo … :::`. `content: 'block+'`,
  `isolating: true` (no se fusiona con el párrafo de fuera al editar en el borde) y
  `defining: true`. Su `NodeView` (React) pinta cabecera con icono/etiqueta, un `<select>`
  para cambiar de tipo (estándar, presets personalizados guardados o «Personalizado a
  medida…») y un botón «quitar formato» (`unwrap`: sustituye el nodo por su contenido en
  el documento, conservando el texto). Un `addKeyboardShortcuts` propio maneja Enter sobre
  un párrafo vacío al final del bloque para «salir» de él (ProseMirror no hace
  `liftEmptyBlock` automático en nodos `isolating`).
- **`ImageFigureNode`** (`ImageFigureNode.tsx`): `![alt|ancho](ruta)` como nodo **atómico**
  de bloque propio (nunca inline, igual que en la carcasa). Su `NodeView` resuelve la ruta
  del asset a una object URL cacheada (`imgUrlCache`, con limpieza en `import.meta.hot` en
  dev) y trae su propia barra integrada: alt, `<select>` de ancho (Tamaño real / 25–100 %),
  «Sustituir…» (sube otra imagen y borra el binario anterior si nadie más lo usa vía
  `removeAsset`) y «Quitar».

`SelectAllFix` (extensión pequeña definida en `RichTextArea.tsx`) sustituye el `Mod-a` por
defecto de ProseMirror: la `AllSelection` que crea Ctrl/Cmd+A no queda bien sincronizada al
colapsarla luego con teclado (Fin, flechas) —con clic de ratón sí— y el Intro dejaba de
partir el párrafo (confirmado con Playwright, no era flakiness del test). Se reemplaza por
una `TextSelection` que cubre todo el documento: mismo resultado visible, navegación con
teclado fiable después.

`CustomBlockPanel.tsx` es el formulario de icono/color/título del bloque «Personalizado»;
lo comparten la barra (insertar uno nuevo) y el propio `CalloutNode` (editar el que ya
existe) para no duplicar el marcado. `IconPicker.tsx` es el popover de emoji curados (no
un selector de emoji del sistema). Los presets guardados (`customBlocks.ts`, localStorage)
son independientes del documento — es una lista de atajos, no se serializa en el markdown.

## Sincronización controlada
El componente sigue siendo **controlado** (`value`/`onChange`, misma interfaz que antes de
TipTap): al montar, `content: mdToJson(value)`; cada `onUpdate` serializa con `jsonToMd` y
llama `onChange`. Para no reaplicar por sync externo (deshacer global, carga de proyecto)
el mismo cambio que el editor acaba de emitir —lo que rompería el cursor—, se guarda en un
ref (`lastEmittedRef`) el último markdown que **este** editor produjo; el `useEffect` que
escucha `value` solo llama a `editor.commands.setContent(..., { emitUpdate: false })`
cuando el valor entrante difiere de ese ref.

## Barra de formato y edición contextual
El estado de la barra (qué botones están «encendidos») es reactivo vía `useEditorState`
(selector con `editor.isActive(...)`): solo re-renderiza cuando cambia algo de eso, no en
cada pulsación. El botón de enlace es contextual: si el cursor está dentro de un enlace
(`getMarkRange`) pasa a «Editar enlace» y precarga texto/URL; si no, «Insertar enlace»
abre el mismo panel vacío. El editor de enlace y el panel de bloque personalizado son
paneles inline bajo la barra (no flotantes); **Esc** los cierra (`handleEscClose` en el
`onKeyDown` del contenedor).

## Imágenes en el texto
Botón **🖼 Imagen** en la barra: `<label>` con `<input type="file">` oculto vestido de
botón (`.ed-rta-imgbtn`); sube con `optimizeImage`, guarda el asset
(`assets/img/txt-<ts>.<ext>`) e inserta un nodo `imageFigure` en la posición del cursor.
Comparte camino con el botón «Sustituir…» del propio nodo. El render final y sus
invariantes de seguridad: `interacciones.md` / `arquitectura-runtime.md`.

## Integración en formularios (avisos importantes)
- `RichTextArea` **no debe envolverse en un `<label>`**: un `<label>` asocia su primer
  control etiquetable y le reenvía clic/`:hover`. Usar `<div className="ed-field">`.
- El documento ProseMirror vive solo en memoria del editor; `course.json` únicamente
  contiene el markdown ligero que produce `jsonToMd` — nunca el JSON del documento ni HTML.
