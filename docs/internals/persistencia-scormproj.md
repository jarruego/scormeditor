# Persistencia y modelo de documento (`src/store/persistence.ts`, `autosave.ts`)

> Doc interno de SCORMEditor. Índice en `CLAUDE.md`.

## Un único concepto de «guardado»: el archivo de proyecto `.scormproj`
Hay **un solo documento**: un archivo `.scormproj` (constante `PROJECT_EXT`) que es un
**ZIP** con `course.json` + `assets/` dentro (`buildProjectBlob()`,
`compression: 'STORE'` para reempaquetar casi instantáneo; los media ya vienen
comprimidos). Modelo mental tipo `.docx`/`.fig`/`.sb3`: «editar → Sin guardar → Ctrl+S →
Guardado». (Se descartó el modelo anterior de archivo/carpeta JSON + varios estados de
guardado: confundía.)

- **Abrir** (`openProject` con File System Access; `openProjectFromFile` como fallback):
  `loadProjectFromBlob()` lee el ZIP, exige `course.json` (si falta, error), llama a
  `importJson` (parsea+migra+valida) y vuelca el resto de entradas a `AssetMap` por su
  `entry.name` (las claves ya incluyen `assets/`).
- **Abrir desde ZIP SCORM** (misma decisión que eXeLearning con su `content.xml`):
  `loadProjectFromBlob` acepta también un **paquete SCORM exportado** (detectado por
  `data/course.json`); los pickers admiten `.zip`. Del paquete solo se importan los
  assets **referenciados** por el curso (`collectAssetPaths`) — en el ZIP conviven con la
  carcasa (`assets/css`, `assets/js`) que no debe entrar como asset.
  **Invariante: el ZIP SCORM se importa, nunca se vincula** (`projectHandle = null`,
  sin `linkedFileName`, `dirty: true`): si se guardara encima, el paquete perdería
  manifiesto y carcasa y dejaría de ser SCORM. El primer Ctrl+S pide destino
  `.scormproj`.
- **MIME por extensión al abrir**: JSZip devuelve los blobs de las entradas **sin tipo**,
  y los object URLs de la vista previa (`StudentPreview`, `useObjectUrl`, `ImageFigureNode`)
  heredan ese vacío. PNG/JPEG sobreviven porque el navegador los detecta por contenido,
  pero **SVG y VTT no** (un `<img>` con SVG sin `image/svg+xml` no se pinta).
  `typedBlob()` (autosave.ts, mapa `MIME_BY_EXT`) reenvuelve cada blob con el MIME de su
  extensión al importar; extensión desconocida → blob tal cual. Subir con `FileButton` no
  lo necesita (el `File` trae tipo del SO), pero el ciclo guardar→reabrir lo perdía.
- **Guardar** (`saveProject` / Ctrl+S / clic en el indicador): construye el blob y, si
  hay `projectHandle`, reescribe el mismo archivo; si no, abre `showSaveFilePicker`
  (sugerido `<courseId>.scormproj`) y lo vincula. `saveProjectAs()` fuerza destino nuevo
  (`projectHandle = null`).
- **Guardado manual, no automático al disco.** El archivo solo se escribe cuando el
  usuario guarda. Diálogos rotulados «Proyecto SCORMEditor».

> La invariante de que las claves `assets/…` del ZIP coincidan literalmente con las rutas
> del `course.json` la comparte el GPT generador (ver `ingesta-gpt.md`).

### Curso demo por defecto (`src/schema/sample-course.ts`)
`sampleCourse` (el curso con el que arranca el editor sin nada que retomar, y que carga
«Nuevo (demo)») es el proyecto de referencia exhaustivo: ejercita los **10 tipos de
pantalla** y las **23 interacciones**, autorreferencial a propósito (no trata de ningún
tema ajeno: cada pantalla demuestra en vivo el tipo de pantalla o de interacción del que
habla). Test final, glosario y bibliografía también son de ejemplo. Sus imágenes son SVG
sencillos incrustados como `data:image/svg+xml;base64,…` directamente en `src`/`config`
(sin `assets/`, porque este curso no tiene ZIP ni `AssetMap` detrás — funciona igual en
Vista estudiante y en el SCORM exportado, ver «MIME por extensión» más abajo para por qué
esto no aplica a imágenes en línea del texto, que si necesitan `assets/` o `http(s)`).
El aviso SKELETON de su informe es intencionado (la pantalla «Pendiente de desarrollo» se
explica a sí misma).

**Convención**: al añadir un tipo de pantalla o de interacción nuevo, actualizar también
este curso. Se genera con un script (validado contra `parseCourse`/`validateCourse`
reales antes de serializar) en vez de escribirse el TypeScript a mano completo — más
robusto que un `.scormproj` aparte porque cualquier cambio de esquema que lo rompa se ve
en el propio `tsc -b` del build, no hay que acordarse de regenerarlo por separado. (Existió
una versión anterior como `.scormproj` en `docs/internals/`: se retiró en favor de esta,
que al vivir en el propio arranque de la app es la que de verdad se ve —y por tanto se
nota si queda desactualizada— y además tipa en compilación.)

### Ciclo de vida de los assets (limpieza / peso)
El `AssetMap` del store puede acumular **huérfanos**: `addAsset` indexa por ruta, así que
reemplazar en el mismo hueco con **otra extensión**, cambiar el **tipo** de recurso o
**borrar** una pantalla deja el binario anterior sin referencia. Dos capas de defensa:

1. **Borrado explícito con aviso** (`removeAsset` en el store; irreversible, **no** entra
   en el historial). Lo disparan, tras `confirmDialog`:
   - **Sustituir un recurso** (`FileButton` con `currentPath`): avisa antes de subir y
     borra el binario anterior si su ruta cambia (misma ruta = ya se sobrescribió). Se
     pasa `currentPath` en imagen/vídeo/audio, póster, VTT y audio de locución.
   - **Tipo «Sin recurso»** (`changeKind` en `ScreenEditor`): borra `src`/`poster`/tracks
     asociados y pone `kind:'none'`, previo aviso.

   **Guarda anti-borrado de assets compartidos**: `removeAsset` **no** elimina el binario
   si alguna pantalla del curso aún lo referencia (`isAssetReferenced` en
   `schema/assetRefs.ts`, mismo recorrido profundo que `collectAssetPaths`). Un mismo
   archivo puede reutilizarse en varias diapositivas (p. ej. al **duplicar** una
   pantalla, la copia hereda la misma ruta de asset), así que borrarlo desde una rompería
   las demás. Por eso los llamantes **actualizan primero la referencia** (quitan/
   sustituyen la ruta en el curso) y llaman a `removeAsset` **después**: si queda algún
   uso, el binario se conserva; si era el último, se borra.
2. **Red de seguridad en el export**: `buildScormZip` empaqueta **solo lo referenciado**
   (`collectAssetPaths(course)` en `schema/assetRefs.ts` —reexportado desde
   `exportScorm`—, recorrido profundo recogiendo strings `assets/…`). Cubre los huérfanos
   que no pasaron por (1) (p. ej. pantalla borrada o cambio a otro tipo de media). → El
   ZIP entregado **nunca** lleva basura.

**Purga manual de huérfanos** (peso del `.scormproj`): el guardado (autosave a IndexedDB
y `buildProjectBlob` del `.scormproj`) persiste **todos** los assets, incluidos los
huérfanos (borrar una pantalla **no** borra su binario, para no chocar con
deshacer/rehacer). Para controlar el tamaño hay una acción explícita en **menú Archivo →
«Borrar recursos huérfanos (N)»** (`pruneOrphanAssets` en el store; usa
`orphanAssetPaths(course, assets)`): solo se muestra si N>0, con aviso de que es
irreversible. Es deliberada (no automática) precisamente porque `removeAsset`/purga
**no** entran en el historial. El contador N se recalcula por render en la Toolbar
(`useMemo` sobre `course`+`assets`).

Al **subir imágenes** se optimizan antes de guardar (`optimizeImage` en `FileButton`):
lado máx. 1600 px, recompresión (PNG opaco→JPEG q0.85, PNG con alfa se mantiene, SVG/GIF
intactos); solo se usa el resultado si pesa menos, y se avisa «Imagen reducida de X a Y».

## Recuperación automática (IndexedDB) — invisible, NO es «el guardado»
Copia interna continua en IndexedDB (`DB_NAME = 'scormeditor'`, store `kv`, clave
`project`) con `{ course, assets, dirty }` vía structured clone; debounce 800 ms
(`scheduleSave`/`doSave`). Solo evita perder trabajo si se cierra sin guardar; **nunca se
presenta como «guardado»** (ese es siempre el `.scormproj`). El flag `dirty` se persiste
para que, tras recargar, el indicador diga la verdad. `initAutoSave()` (una vez desde
`App.tsx`) restaura esa copia, re-vincula el `projectHandle` y se suscribe a cambios de
`course`/`assets` → marca `projectDirty` y agenda recuperación.

## Pantalla de bienvenida (`WelcomeGate`) — solo si no hay nada que retomar
Por defecto el store arranca con `sampleCourse` (la demo) sin vincular a nada. Si
`initAutoSave()` no encuentra copia en IndexedDB, ese estado por defecto se queda tal
cual — y sin `WelcomeGate` el usuario vería la demo cargada en silencio sin haberlo
decidido. `WelcomeGate` (`src/components/WelcomeGate.tsx`) es un overlay a pantalla
completa montado en `App.tsx` que se muestra solo cuando **las tres cosas** son ciertas:
`autosaveReady` (a `true` en el `finally` de `initAutoSave()`, para no parpadear mientras
IndexedDB responde) y `!linkedFileName && !projectDirty && !cloudDocumentId` (nada
vinculado, nada sin guardar, ningún documento-nube). En cuanto hay algo que retomar —
autoguardado, archivo local o documento-nube — no se interpone: la app entra directa,
como siempre.

Ofrece: Empezar en blanco (`resetEmpty`), Ver la demo (cierra el overlay sin tocar el
curso, ya es el que se ve), Abrir un archivo (`openProject`/`openProjectFromFile`,
mismo flujo que «Archivo → Abrir») y, si `isCloudConfigured()`, Abrir de la nube
(`setSettingsModal('cloud')`, reutiliza `CloudModal` tal cual). Elegir cualquier opción
la descarta **para siempre** vía `localStorage` (`ed:startGateDismissed`, mismo patrón
que `WelcomeTip` en `GuidedTour.tsx`): es una pantalla de primer arranque, no un aviso
recurrente en cada recarga sin cambios.

## Permisos del File System Access — transparentes (sin botón «Reconectar»)
Los permisos del handle no sobreviven a un reload. **No** hay botón de reconectar: al
**Guardar**, `ensurePermission(handle, true)` re-pide permiso en ese momento; si el
usuario lo deniega/cancela, el documento sigue «Sin guardar». Sin File System Access
(Firefox/Safari), abrir usa `<input file>` y guardar descarga el blob (`downloadBlob`).

## Estado en el store y UI
`courseStore`: `activeTab`, `linkedFileName`, `projectDirty` + `setProjectDirty`,
`setLinked(name)`. La toolbar (`Toolbar.tsx`) muestra **un único indicador**
`.ed-docstate` (`✓ Guardado · archivo` / `● Sin guardar`) que es un botón = guardar; un
menú **«Archivo ▾»** (`.ed-menu`) agrupa Abrir / Guardar / Guardar como… / Nuevo (vacío) /
Nuevo (demo) / Borrar recursos huérfanos / Exportar SCORM ZIP.
