// Pega esto en el campo «JavaScript» del editor de la interacción.
// Activa «Exigir que el alumno la complete para avanzar» si quieres que
// bloquee el paso de pantalla — y recuerda marcar la propia pantalla como
// obligatoria y activar «Exigir completar las interacciones» en Ajustes del
// curso: las tres condiciones tienen que darse a la vez (ver
// docs/html-embed-contract.md, «Cuándo bloquea el avance»).

// Shim de degradación: MeEmbed se inyecta siempre antes que este código
// dentro del editor, pero si copias este script a otro sitio para probarlo
// suelto (fuera del iframe del curso), esto evita que rompa.
var ME = window.MeEmbed || { version: 0, completed: false, state: null, stateMax: 0, complete: function () {}, saveState: function () {} };

// Patrón "explorar N elementos": recuerda cuáles ha tocado el alumno
// (guardando solo sus índices, no su texto — el presupuesto de memoria es
// pequeño) y completa la actividad en cuanto los ha visto todos.
var items = document.querySelectorAll('.item');
var status = document.querySelector('.me-embed-status');
var seen = (ME.state && ME.state.s) || [];

function paint() {
  items.forEach(function (el, i) {
    if (seen.indexOf(i) !== -1) el.classList.add('visto');
  });
  if (status) status.hidden = !ME.completed;
}

function markSeen(i) {
  if (seen.indexOf(i) === -1) {
    seen.push(i);
    ME.saveState({ s: seen }); // p. ej. {"s":[0,2]} — compacto, nunca texto
  }
  if (seen.length >= items.length && !ME.completed) ME.complete();
  paint();
}

items.forEach(function (el, i) {
  el.addEventListener('click', function () { markSeen(i); });
});

// Restaura lo ya visto (recarga de página, o reanudar el curso más tarde) y,
// si ya estaba completa, no vuelve a marcarla ni a mostrar nada nuevo.
paint();
