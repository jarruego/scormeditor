# Editor de texto enriquecido (`RichTextArea` + `cmMarkdown`)

> Doc interno de SCORMEditor. Índice en `CLAUDE.md`. El render del markdown ligero en la
> carcasa (sintaxis, callouts, bloque personalizado) está en `arquitectura-runtime.md`.

`RichTextArea` (`src/components/RichTextArea.tsx`) es la caja de texto de `student_text`
y de otros campos (feedback, escenarios…). Está sobre **CodeMirror 6** en modo **«vista
viva»** (estilo Obsidian): el valor sigue siendo **markdown en texto plano** (la
invariante no cambia — no hay HTML ni WYSIWYG que lo guarde; CodeMirror opera sobre texto
plano y se ve idéntico en «Vista estudiante»), pero la caja **muestra el resultado** y
**oculta los marcadores** de sintaxis. Un WYSIWYG «puro» alternativo
(ProseMirror/Lexical) se descartó por peso y por crear un segundo renderizador que
divergiría del runtime.

## Configuración CodeMirror (`src/components/cmMarkdown.ts`)
- `mdHighlighting` (`HighlightStyle`): negrita en negrita, `##/###` grandes, enlaces,
  código.
- `livePreview` (`ViewPlugin`): oculta **siempre** con `Decoration.replace` los
  marcadores (`**`, `#`, `[ ]( )`, `URL`) — nunca se revelan por cursor ni por selección,
  para que ni el clic simple ni el doble clic ni seleccionar un bloque hagan reaparecer
  los `**`/`:::` ni desplacen el contenido — y sustituye la cabecera `::: tipo …` por un
  **chip** legible (icono + título / etiqueta del callout). Sus rangos se exponen como
  `atomicRanges` para que las flechas salten los marcadores ocultos. Todo por línea: solo
  `replace` de **una** línea (nunca cruza saltos → sin decoraciones de bloque, más
  robusto).
- `calloutDecorations`: fondo/filete de color por línea para los bloques `:::`. El color
  sale de `calloutColor(type, rest)`: los `custom` con su hex validado y los predefinidos
  con su color de paleta (`CALLOUT_COLORS`, **alineado con `runtime/styles.css`** para
  que en el editor se vea el MISMO color que de verdad, no gris). Se expone como
  `--cm-callout-color`.
- `editorTheme(rows*1.5)`: aspecto alineado con las variables del editor; `rows` → alto
  mínimo.

Como los marcadores no se revelan nunca, **editar el crudo** (URL de un enlace,
color/icono/título de un bloque, quitar negrita…) se hace siempre por los controles de la
barra — no tecleando entre los `**`; para casos límite el texto plano subyacente sigue
ahí (deshacer, seleccionar todo, etc.).

## Imágenes en el texto
Botón **🖼 Imagen**: es un `<label>` con `<input type="file">` oculto (vestido de botón,
`.ed-rta-imgbtn`); sube la imagen con `optimizeImage`, la guarda como asset
(`assets/img/txt-<ts>.<ext>`) e inserta `![](ruta)` en línea propia con el cursor sobre
ella. El render y sus invariantes: `interacciones.md` / `arquitectura-runtime.md`.
Las líneas `![alt|ancho](ruta)` se **sustituyen enteras** por la imagen (`ImgWidget` en
`cmMarkdown.ts`; el markdown nunca se ve — la variante con el texto visible confundía
porque el alt parecía un enlace). Al clicar la imagen se selecciona (contorno +
`selectionSet` en el plugin) y aparece la **barra contextual «Imagen»** bajo el editor
(mismo patrón que la barra de bloque): campo de **alt** (se sanea `]`/`|`), select de
**tamaño** (Tamaño real / 25–100 % → sufijo `|NN` en el markdown), **↻ Sustituir…** (sube
otra y borra el binario anterior si nadie más lo usa) y **🗑 Quitar** (borra la línea y
el asset vía `removeAsset`, que respeta referencias). El detector de enlaces de
`analyze()` ignora los `[…](…)` precedidos de `!` para no ofrecer «Editar enlace» sobre
una imagen. Los blobs de assets se resuelven a object URLs cacheadas (`imageUrl`); si la
ruta no existe en assets el widget muestra «imagen no encontrada».

## Barra de formato y edición contextual
La **barra** conmuta de verdad: `B`/`I` usan el árbol de sintaxis (`syntaxTree`) para, si
la selección ya está dentro de `StrongEmphasis`/`Emphasis`, **quitar** los marcadores en
vez de añadirlos. Edición **contextual** (según lo que hay bajo el cursor, recalculado en
`updateListener`):
- Cursor en un **enlace** → el botón pasa a «Editar enlace» y abre un popover
  (texto/URL, con «Quitar»). El editor de enlace se **abre automáticamente** al entrar el
  cursor en un `[texto](url)` y se cierra al salir; «Cancelar» lo descarta hasta salir y
  volver a entrar (`dismissedLinkRef`).
- Cursor dentro de un **bloque `:::`** → aparece una **barra de bloque** con un
  `<select>` para **cambiar el tipo** — incluye los tipos estándar, los **presets
  personalizados guardados** (valor `preset:<id>`, que reescriben la cabecera con su
  color/icono/título) y «Personalizado a medida…» que abre el diálogo precargado — y
  **«Quitar formato»** (`unwrapBlock`), que **conserva el texto**: elimina solo la línea
  de cabecera `::: …` y la de cierre `:::` (cada una con su salto de línea; se despachan
  en coordenadas del documento original, sin solaparse), dejando el contenido interior
  como texto plano. No es un borrado destructivo, así que no lleva estilo `ed-danger`.

Las barras contextuales (bloque, imagen y enlace) **flotan** sobre la parte superior de
la caja (`.ed-rta-floats`, `position:absolute` dentro de `.ed-rta-editwrap`), de modo que
aparecer o desaparecer **no empuja** el editor; el contenedor lleva
`pointer-events:none` (salvo las propias barras) para no bloquear los clics del editor.
**Esc** cierra los paneles flotantes visibles (`handleEscClose` en el `onKeyDown` de
`.ed-rta`): el diálogo personalizado, el enlace (Cancelar) y las barras de bloque/imagen
(ocultadas por firma con `dismissedBlock`/`dismissedImg`, que se reactivan al salir y
volver). La barra de formato lleva `onMouseDown={preventDefault}` para **no robar el
foco** al editor (si no, el botón pulsado se quedaba resaltado y con foco).

## Integración en formularios (avisos importantes)
- `RichTextArea` **no debe envolverse en un `<label>`** (usar
  `<div className="ed-field">`). Un `<label>` asocia su primer control etiquetable y le
  reenvía **clics** y **:hover**; como CodeMirror no es un control etiquetable, el label
  apuntaría al **primer botón de la barra** (la «B»), de modo que pasar el ratón la
  resaltaba y clicar en cualquier parte del campo aplicaba negrita. El editor añade
  además `onClick={preventDefault}` en su contenedor como salvaguarda.
- El componente es **controlado**: sincroniza el valor externo (deshacer global, carga de
  proyecto) comparando el doc actual antes de despachar, para no entrar en bucle ni mover
  el cursor.
