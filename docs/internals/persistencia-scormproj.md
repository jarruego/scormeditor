# Persistencia y modelo de documento (`src/store/persistence.ts`, `autosave.ts`)

> Doc interno de SCORMEditor. Índice en `CLAUDE.md`.

## Un único concepto de «guardado»: el archivo de proyecto `.scormproj`
Decisión de jun 2026 (revertido el modelo anterior de archivo/carpeta JSON + varios
estados de guardado, que confundía). Ahora hay **un solo documento**: un archivo
`.scormproj` (constante `PROJECT_EXT`) que es un **ZIP** con `course.json` + `assets/`
dentro (`buildProjectBlob()`, `compression: 'STORE'` para reempaquetar casi instantáneo;
los media ya vienen comprimidos). Modelo mental tipo `.docx`/`.fig`/`.sb3`: «editar → Sin
guardar → Ctrl+S → Guardado».

- **Abrir** (`openProject` con File System Access; `openProjectFromFile` como fallback):
  `loadProjectFromBlob()` lee el ZIP, exige `course.json` (si falta, error), llama a
  `importJson` (parsea+migra+valida) y vuelca el resto de entradas a `AssetMap` por su
  `entry.name` (las claves ya incluyen `assets/`).
- **Guardar** (`saveProject` / Ctrl+S / clic en el indicador): construye el blob y, si hay
  `projectHandle`, reescribe el mismo archivo; si no, abre `showSaveFilePicker` (sugerido
  `<courseId>.scormproj`) y lo vincula. `saveProjectAs()` fuerza destino nuevo
  (`projectHandle = null`).
- **Guardado manual, no automático al disco.** El archivo solo se escribe cuando el
  usuario guarda. Diálogos rotulados «Proyecto SCORMEditor».

> La invariante de que las claves `assets/…` del ZIP coincidan literalmente con las rutas
> del `course.json` la comparte el GPT generador (ver `ingesta-gpt.md`).

### Ciclo de vida de los assets (limpieza / peso)
El `AssetMap` del store puede acumular **huérfanos**: `addAsset` indexa por ruta, así que
reemplazar en el mismo hueco con **otra extensión**, cambiar el **tipo** de recurso o
**borrar** una pantalla deja el binario anterior sin referencia. Dos capas de defensa:

1. **Borrado explícito con aviso** (`removeAsset` en el store; irreversible, **no** entra en
   el historial). Lo disparan, tras `window.confirm`:
   - **Sustituir un recurso** (`FileButton` con `currentPath`): avisa antes de subir y borra
     el binario anterior si su ruta cambia (misma ruta = ya se sobrescribió). Se pasa
     `currentPath` en imagen/vídeo/audio, póster, VTT y audio de locución.
   - **Tipo «Sin recurso»** (`changeKind` en `ScreenEditor`): borra `src`/`poster`/tracks
     asociados y pone `kind:'none'`, previo aviso.
2. **Red de seguridad en el export**: `buildScormZip` empaqueta **solo lo referenciado**
   (`collectAssetPaths(course)`, recorrido profundo recogiendo strings `assets/…`). Cubre
   los huérfanos que no pasaron por (1) (p. ej. pantalla borrada o cambio a otro tipo de
   media). → El ZIP entregado **nunca** lleva basura.

Al **subir imágenes** se optimizan antes de guardar (`optimizeImage` en `FileButton`): lado
máx. 1600 px, recompresión (PNG opaco→JPEG q0.85, PNG con alfa se mantiene, SVG/GIF
intactos); solo se usa el resultado si pesa menos, y se avisa «Imagen reducida de X a Y».

## Recuperación automática (IndexedDB) — invisible, NO es «el guardado»
Copia interna continua en IndexedDB (`DB_NAME = 'scormeditor'`, store `kv`, clave
`project`) con `{ course, assets, dirty }` vía structured clone; debounce 800 ms
(`scheduleSave`/`doSave`). Solo evita perder trabajo si se cierra sin guardar; **nunca se
presenta como «guardado»** (ese es siempre el `.scormproj`). El flag `dirty` se persiste
para que, tras recargar, el indicador diga la verdad. `initAutoSave()` (una vez desde
`App.tsx`) restaura esa copia, re-vincula el `projectHandle` y se suscribe a cambios de
`course`/`assets` → marca `projectDirty` y agenda recuperación.

## Permisos del File System Access — transparentes (sin botón «Reconectar»)
Los permisos del handle no sobreviven a un reload. **No** hay botón de reconectar: al
**Guardar**, `ensurePermission(handle, true)` re-pide permiso en ese momento; si el
usuario lo deniega/cancela, el documento sigue «Sin guardar». Sin File System Access
(Firefox/Safari), abrir usa `<input file>` y guardar descarga el blob (`downloadBlob`).

## Estado en el store y UI
`courseStore`: `activeTab`, `linkedFileName`, `projectDirty` + `setProjectDirty`,
`setLinked(name)`. La toolbar (`Toolbar.tsx`) muestra **un único indicador**
`.ed-docstate` (`✓ Guardado · archivo` / `● Sin guardar`) que es un botón = guardar; un
menú **«Archivo ▾»** (`.ed-menu`) agrupa Abrir / Guardar / Guardar como… / Nuevo (demo) /
Exportar SCORM ZIP.
