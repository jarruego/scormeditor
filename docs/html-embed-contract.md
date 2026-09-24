# Contrato «MeEmbed v1» para HTML a medida

> Guía para quien escribe el HTML/CSS/JS de una interacción **«HTML a medida»**
> en SCORMEditor. Si solo vas a usar el editor sin programar, no necesitas leer
> esto — es para cuando quieres que tu interactivo bloquee el avance o recuerde
> algo entre sesiones.

## Qué es y qué no es

Tu código corre dentro de un `<iframe sandbox="allow-scripts">`, **sin**
`allow-same-origin`: el navegador le da un origen opaco (`null`), aislado de
todo lo demás. Esto es innegociable — el sandbox no se relaja nunca, pase lo
que pase — así que tu código:

- **No puede** acceder a la API SCORM, a `localStorage`/`sessionStorage`, a
  cookies, ni leer o tocar el DOM de la carcasa (topbar, menú, otras
  pantallas).
- **No puede** puntuar: toda interacción `html_embed` guarda siempre
  `scored: false`, la marques como marques en el editor.
- **Solo puede** hablar con la carcasa a través de `window.MeEmbed`, descrito
  abajo — es el único canal, y es deliberadamente pequeño.

## `window.MeEmbed`

Disponible desde el primer instante en que tu HTML/CSS/JS se ejecuta (se
inyecta antes que tu propio código):

| Miembro | Tipo | Descripción |
|---|---|---|
| `version` | `1` | Versión del contrato. Si en el futuro cambia, será `2`, `3`… — comprueba `MeEmbed.version` si tu código necesita comportarse distinto según la versión. |
| `id` | `string` | Id interno de esta interacción. Normalmente no lo necesitas. |
| `completed` | `boolean` | `true` si el alumno ya la completó en una sesión anterior (o en esta). Consúltalo al arrancar para no repetir un mensaje de «¡completado!» si ya lo estaba. |
| `state` | `any \| null` | El último estado que guardaste con `saveState()`, restaurado tal cual (ya como objeto, no como texto) — `null` si nunca guardaste nada. |
| `stateMax` | `number` | Presupuesto de caracteres disponible para `state` (ver «Memoria para guardar su estado» en el editor; 0 = no puedes guardar nada). |
| `complete()` | función | Marca la interacción como completada. |
| `saveState(obj)` | función | Guarda `obj` como tu estado propio. |

### `MeEmbed.complete()`

Llámala cuando el alumno termine la actividad. Es la única forma de que el
curso sepa que ha acabado:

```js
MeEmbed.complete();
```

Puedes llamarla más de una vez sin problema (la segunda vez no hace nada
nuevo), pero comprueba `MeEmbed.completed` al arrancar para no mostrar un
mensaje de «¡enhorabuena!» si el alumno ya la había completado antes.

### `MeEmbed.saveState(obj)`

Guarda `obj` (cualquier valor serializable en JSON: números, booleanos,
cadenas cortas, arrays, objetos planos) para poder restaurarlo si el alumno
recarga la página o vuelve más tarde:

```js
MeEmbed.saveState({ s: [0, 2] }); // guardado
// ...en otra sesión...
if (MeEmbed.state) { /* MeEmbed.state ya es {s:[0,2]}, no texto */ }
```

Si `obj` no se puede convertir a JSON, o el JSON resultante pesa más
caracteres que `MeEmbed.stateMax`, la llamada se ignora silenciosamente (con
un aviso en la consola del navegador — nunca rompe tu interactivo) y
`MeEmbed.state` no cambia. La carcasa vuelve a comprobar el tamaño al recibir
el dato: aunque manipules `MeEmbed` a mano para saltarte el límite, el estado
por encima del presupuesto no se guarda.

## Cuándo bloquea el avance

Activar **«Exigir que el alumno la complete para avanzar»** en el editor
(`config.require_completion`) no basta por sí solo. El alumno se queda
bloqueado en esta pantalla **solo si se cumplen las tres condiciones**:

1. La opción está activada en esta interacción.
2. La pantalla está marcada como **obligatoria** (`screen.required`).
3. El curso tiene activada la regla **«Exigir completar las interacciones»**
   (⚙ Ajustes del curso → Evaluación y finalización).

Si activas la opción pero tu código nunca llama a `MeEmbed.complete()`, el
alumno se queda atascado sin remedio — el validador del editor te avisa de
esto con el error `EMBED_NO_COMPLETE`.

## Presupuesto de memoria

`suspend_data` (donde SCORM 1.2 guarda todo el progreso del curso) tiene un
límite de **4096 caracteres para el curso entero**, no por pantalla. Por eso
el estado de cada `html_embed` está acotado por un presupuesto propio,
configurable en el editor (**«Memoria para guardar su estado»**, 0–300
caracteres, 100 por defecto). Súbelo solo si de verdad necesitas guardar más;
bájalo a 0 si tu interactivo no necesita recordar nada entre sesiones.

## Buenas prácticas

- **Sin librerías por CDN.** El curso debe poder verse sin conexión (LMS sin
  salida a internet, o el propio SCORM offline); si tu interactivo depende de
  una librería externa, empaquétala tú mismo dentro del HTML/CSS/JS pegado.
- **Imágenes como `assets/img/…`, no como URL externa.** Sube las imágenes
  con el botón «Subir imagen…» del propio editor de la interacción y
  referéncialas por su ruta — viajan dentro del paquete SCORM. Si necesitas
  algo minúsculo y no quieres subir un archivo, un `data:` URI (base64)
  también funciona.
- **Nunca uses `100vh` ni alturas de viewport.** El iframe no tiene tamaño
  fijo salvo que pongas uno explícito en el editor («Alto fijo en px») — por
  defecto, tu documento reporta su propia altura y la carcasa ajusta el
  iframe a tu contenido real. Diseña para tu propio alto de contenido, no
  para el de la pantalla.
- **Degrada con elegancia si `MeEmbed` no está.** Es muy improbable (se
  inyecta siempre antes que tu código), pero si copias tu script a otro sitio
  para probarlo suelto, protégete:
  ```js
  var ME = window.MeEmbed || { completed: false, state: null, stateMax: 0, complete: function () {}, saveState: function () {} };
  ```
- **Estado compacto, no descriptivo.** Con un presupuesto de 100 caracteres
  por defecto, cuenta cada carácter: `{"s":[0,2]}` (índices vistos) cabe
  muchísimas veces mejor que `{"secciones_vistas":["intro","ejemplo"]}`. Guarda
  índices/booleanos, nunca texto libre.

## Ejemplo mínimo

Un interactivo con dos pasos, que bloquea el avance hasta ver ambos y
recuerda el progreso:

**JS** (con el shim de degradación de arriba ya aplicado):
```js
var ME = window.MeEmbed || { completed: false, state: null, stateMax: 0, complete: function () {}, saveState: function () {} };
var seen = (ME.state && ME.state.s) || [];

function markSeen(i) {
  if (seen.indexOf(i) === -1) seen.push(i);
  ME.saveState({ s: seen });
  document.querySelectorAll('.paso')[i].classList.add('visto');
  if (seen.length >= 2 && !ME.completed) ME.complete();
}

document.querySelectorAll('.paso').forEach(function (el, i) {
  if (seen.indexOf(i) !== -1) el.classList.add('visto');
  el.addEventListener('click', function () { markSeen(i); });
});
```

Con `config.require_completion: true` y la pantalla marcada como obligatoria,
el alumno no avanza hasta clicar los dos `.paso`; si recarga a mitad, los ya
vistos se restauran desde `MeEmbed.state` y, si ya había completado los dos,
sigue completada.

## Ver también

- `docs/html-embed-template/` — HTML, CSS y JS de arranque con este patrón ya
  montado, listos para copiar en el editor y adaptar.
- `docs/internals/interacciones.md` — sección `html_embed`, para quien toque
  el propio motor (`interactions.js`).
