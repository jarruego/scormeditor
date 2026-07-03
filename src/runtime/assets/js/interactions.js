/* =============================================================================
 * interactions.js — Motor de interacciones (12 tipos MVP)
 * Patrón registro: Interactions.register(type, factory).
 * factory(el, data, ctx) -> controller { result() }
 *   ctx = { state, save(state), announce(msg), esc(str) }
 *   result() -> { completed, scored, correct, score, maxScore }
 * Todo feedback es TEXTUAL además de visual. Sin dependencias externas.
 * ===========================================================================*/
(function (global) {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Texto enriquecido: subconjunto SEGURO de markdown -> HTML.
  // Permite **negrita**, *cursiva* y enlaces [texto](http(s)://... | mailto:...).
  // Primero escapa todo (anti-XSS) y luego aplica el formato controlado.
  function rich(s) {
    var out = esc(s);
    out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g, function (m, t, url) {
      return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + t + '</a>';
    });
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
    return out;
  }

  // Markdown de bloque (párrafos, listas, encabezados) para cuerpos largos de
  // interacciones (accordion/tabs). Reusa el renderer si ya está cargado; si no,
  // cae a inline. Así las listas dentro de un accordion salen como <ul>, no en línea.
  function block(s) {
    return (global.Renderer && global.Renderer.mdToHtml) ? global.Renderer.mdToHtml(s) : '<p>' + rich(s) + '</p>';
  }

  // Versión en texto plano (para atributos: aria-label, <option>, etc.).
  function stripTags(s) {
    return String(s == null ? '' : s)
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1');
  }

  // Resuelve una ruta de asset a una blob URL si la previsualización del editor
  // la ha inyectado en window.__ASSETS__. En el SCORM real no existe ese mapa y
  // la ruta relativa se usa tal cual.
  function assetUrl(p) {
    if (!p) return p;
    var map = global.__ASSETS__;
    if (map && Object.prototype.hasOwnProperty.call(map, p)) return map[p];
    return p;
  }

  var registry = {};
  function register(type, factory) { registry[type] = factory; }

  function shuffle(arr, seed) {
    // Orden determinista por id para que coincida con suspend_data
    return arr.slice().sort(function (a, b) {
      var ka = (a.id || a.title || a.text || '') + seed;
      var kb = (b.id || b.title || b.text || '') + seed;
      return ka < kb ? -1 : ka > kb ? 1 : 0;
    });
  }

  // Nº de intentos de una interacción evaluable. Por defecto 1; 0 = ilimitados.
  function attemptsOf(data) {
    return data.attempts == null ? 1 : data.attempts;
  }

  // Reordena items según una lista de ids guardada (restauración de sort_steps).
  function orderByIds(items, ids) {
    var byId = {};
    items.forEach(function (s) { byId[s.id] = s; });
    var res = [];
    ids.forEach(function (id) { if (byId[id]) { res.push(byId[id]); delete byId[id]; } });
    items.forEach(function (s) { if (byId[s.id]) res.push(s); });
    return res;
  }

  function feedbackBox(data) {
    return '<div class="me-feedback" role="status" aria-live="polite" hidden></div>';
  }
  // Reinicia la animación CSS de un nodo que persiste (reflow para replay).
  function replay(node) {
    node.style.animation = 'none';
    void node.offsetWidth;
    node.style.animation = '';
  }

  function showFeedback(el, ok, data) {
    var box = el.querySelector('.me-feedback');
    if (!box) return;
    var msg = ok ? (data.feedback.correct || 'Correcto.') : (data.feedback.incorrect || 'Revisa tu respuesta.');
    var expl = data.feedback.explanation ? '<p class="me-expl">' + rich(data.feedback.explanation) + '</p>' : '';
    box.className = 'me-feedback ' + (ok ? 'is-ok' : 'is-error');
    box.innerHTML = '<strong>' + (ok ? '✔ ' : '✖ ') + rich(msg) + '</strong>' + expl;
    box.hidden = false;
    replay(box);
  }

  function header(data) {
    return (data.prompt ? '<p class="me-prompt">' + rich(data.prompt) + '</p>' : '') +
           (data.instructions ? '<p class="me-instructions">' + rich(data.instructions) + '</p>' : '');
  }

  // --- 1. Accordion ----------------------------------------------------------
  register('accordion', function (el, data, ctx) {
    var items = (data.config.items || []);
    var html = header(data) + '<div class="me-accordion">';
    items.forEach(function (it, i) {
      var id = 'acc-' + i;
      html += '<div class="me-acc-item">' +
        '<button class="me-acc-head" aria-expanded="false" aria-controls="' + id + '">' + rich(it.title) + '</button>' +
        '<div class="me-acc-body" id="' + id + '" role="region" hidden>' + block(it.body) + '</div></div>';
    });
    html += '</div>';
    el.innerHTML = html;
    el.querySelectorAll('.me-acc-head').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        var body = document.getElementById(btn.getAttribute('aria-controls'));
        body.hidden = open;
      });
    });
    return { result: function () { return { completed: true, scored: false }; } };
  });

  // --- 2. Tabs ---------------------------------------------------------------
  register('tabs', function (el, data, ctx) {
    var items = (data.config.items || []);
    var tablist = '<div class="me-tabs" role="tablist">';
    var panels = '';
    items.forEach(function (it, i) {
      var sel = i === 0;
      tablist += '<button role="tab" id="tab-' + i + '" aria-controls="panel-' + i + '" aria-selected="' + sel + '" tabindex="' + (sel ? '0' : '-1') + '">' + rich(it.title) + '</button>';
      panels += '<div role="tabpanel" id="panel-' + i + '" aria-labelledby="tab-' + i + '" ' + (sel ? '' : 'hidden') + '>' + block(it.body) + '</div>';
    });
    tablist += '</div>';
    el.innerHTML = header(data) + tablist + panels;
    var tabs = [].slice.call(el.querySelectorAll('[role=tab]'));
    function activate(i) {
      tabs.forEach(function (t, j) {
        var on = i === j;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        el.querySelector('#panel-' + j).hidden = !on;
        if (on) t.focus();
      });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { activate(i); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); activate((i + 1) % tabs.length); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); activate((i - 1 + tabs.length) % tabs.length); }
      });
    });
    return { result: function () { return { completed: true, scored: false }; } };
  });

  // --- 3. Flip cards ---------------------------------------------------------
  register('flip_cards', function (el, data, ctx) {
    // Volteo 3D real (CSS rotateY): ambas caras viven en el DOM apiladas; la
    // visibilidad la resuelve backface-visibility y el lector de pantalla usa
    // aria-hidden. La impresión aplana las dos caras vía print.css.
    var cards = (data.config.cards || []);
    var html = header(data) + '<div class="me-cards">';
    cards.forEach(function (c, i) {
      html += '<button class="me-card" aria-pressed="false" data-i="' + i + '" title="Pulsa para girar la tarjeta">' +
        '<span class="me-flip-inner">' +
        '<span class="me-card-front">' + rich(c.front) + '</span>' +
        '<span class="me-card-back" aria-hidden="true">' + rich(c.back) + '</span></span></button>';
    });
    el.innerHTML = html + '</div>';
    el.querySelectorAll('.me-card').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var flipped = btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-pressed', String(!flipped));
        btn.querySelector('.me-card-front').setAttribute('aria-hidden', String(!flipped));
        btn.querySelector('.me-card-back').setAttribute('aria-hidden', String(flipped));
      });
    });
    return { result: function () { return { completed: true, scored: false }; } };
  });

  // --- 6. Single choice / 7. True-false (comparten lógica) -------------------
  function choiceFactory(el, data, ctx) {
    var opts = data.options || [];
    var name = 'opt-' + data.id;
    var maxAtt = attemptsOf(data); // 0 = ilimitados
    var html = header(data) + '<fieldset class="me-choices"><legend class="sr-only">' + esc(data.prompt) + '</legend>';
    opts.forEach(function (o) {
      html += '<label class="me-choice"><input type="radio" name="' + name + '" value="' + esc(o.id) + '"> <span>' + rich(o.text) + '</span></label>';
    });
    html += '</fieldset><button class="me-btn me-check">Comprobar</button>' + feedbackBox(data);
    el.innerHTML = html;
    var attempts = 0, done = false, correct = false;

    function lock() {
      el.querySelectorAll('input').forEach(function (i) { i.disabled = true; });
      var cb = el.querySelector('.me-check'); if (cb) cb.disabled = true;
    }

    // Marca visual (color + icono) de la opción elegida al comprobar.
    function markChoice(input, ok) {
      el.querySelectorAll('.me-choice').forEach(function (l) { l.classList.remove('is-right', 'is-wrong'); });
      var lbl = input && input.closest('.me-choice');
      if (lbl) { lbl.classList.add(ok ? 'is-right' : 'is-wrong'); replay(lbl); }
    }

    if (ctx.state && ctx.state.value) {
      var pre = el.querySelector('input[value="' + ctx.state.value + '"]');
      if (pre) pre.checked = true;
      attempts = ctx.state.attempts || 0;
      if (typeof ctx.state.correct === 'boolean') {
        correct = ctx.state.correct;
        showFeedback(el, correct, data);
        markChoice(pre, correct);
        if (correct || (maxAtt > 0 && attempts >= maxAtt)) { done = true; lock(); }
      }
    }

    function hasAnswer() { return !!el.querySelector('input[name="' + name + '"]:checked'); }
    function check() {
      if (done) return { resolved: true, correct: correct };
      var sel = el.querySelector('input[name="' + name + '"]:checked');
      if (!sel) { ctx.announce('Selecciona una opción.'); return { resolved: false, correct: false }; }
      attempts++;
      var opt = opts.filter(function (o) { return o.id === sel.value; })[0];
      correct = !!(opt && opt.correct);
      showFeedback(el, correct, data);
      markChoice(sel, correct);
      done = correct || (maxAtt > 0 && attempts >= maxAtt);
      if (done) lock();
      ctx.save({ value: sel.value, correct: correct, attempts: attempts });
      ctx.announce(correct ? 'Respuesta correcta.' : (done ? 'Respuesta incorrecta. Sin más intentos.' : 'Respuesta incorrecta. Inténtalo de nuevo.'));
      return { resolved: done, correct: correct };
    }
    el.querySelector('.me-check').addEventListener('click', check);

    return {
      result: function () {
        return { completed: done, scored: !!data.scored, correct: correct, score: correct ? (data.points || 1) : 0, maxScore: data.points || 1 };
      },
      check: check,
      hasAnswer: hasAnswer,
    };
  }
  register('single_choice', choiceFactory);
  register('true_false', choiceFactory);

  // --- 5. Sort steps (ordenar) ----------------------------------------------
  // Arrastrar y soltar (ratón) + botones ▲▼ y flechas de teclado (accesible).
  register('sort_steps', function (el, data, ctx) {
    var steps = (data.config.steps || []); // [{id, text, order}]
    var shown = (ctx.state && ctx.state.order && ctx.state.order.length)
      ? orderByIds(steps, ctx.state.order)
      : shuffle(steps, data.id);
    var html = header(data) +
      '<p class="me-sort-hint">Arrastra los elementos para ordenarlos. También puedes usar los botones ▲▼ o las flechas del teclado.</p>' +
      '<ol class="me-sort" aria-label="Lista ordenable">';
    shown.forEach(function (s) {
      html += '<li class="me-sort-item" data-id="' + esc(s.id) + '" draggable="true" tabindex="0" aria-roledescription="elemento reordenable">' +
        '<span class="me-sort-grip" aria-hidden="true">⋮⋮</span> <span class="me-sort-text">' + rich(s.text) + '</span>' +
        ' <span class="me-sort-ctrl"><button type="button" class="me-up" aria-label="Subir">▲</button><button type="button" class="me-down" aria-label="Bajar">▼</button></span></li>';
    });
    el.innerHTML = html + '</ol><button class="me-btn me-check">Comprobar</button>' + feedbackBox(data);
    var list = el.querySelector('.me-sort');
    var attempts = (ctx.state && ctx.state.attempts) || 0;
    var maxAtt = attemptsOf(data);

    function move(li, dir) {
      if (dir < 0 && li.previousElementSibling) list.insertBefore(li, li.previousElementSibling);
      else if (dir > 0 && li.nextElementSibling) list.insertBefore(li.nextElementSibling, li);
    }

    // Botones ▲▼
    list.addEventListener('click', function (e) {
      var li = e.target.closest('.me-sort-item'); if (!li) return;
      if (e.target.classList.contains('me-up')) { move(li, -1); li.focus(); }
      else if (e.target.classList.contains('me-down')) { move(li, 1); li.focus(); }
    });

    // Teclado: flechas arriba/abajo reordenan el elemento enfocado
    list.addEventListener('keydown', function (e) {
      var li = e.target.closest('.me-sort-item'); if (!li) return;
      if (e.key === 'ArrowUp') { e.preventDefault(); move(li, -1); li.focus(); ctx.announce('Movido hacia arriba.'); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); move(li, 1); li.focus(); ctx.announce('Movido hacia abajo.'); }
    });

    // Drag & drop nativo (ratón)
    function afterElement(y) {
      var items = [].slice.call(list.querySelectorAll('.me-sort-item:not(.is-dragging)'));
      var closest = { offset: -Infinity, el: null };
      items.forEach(function (child) {
        var box = child.getBoundingClientRect();
        var offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) closest = { offset: offset, el: child };
      });
      return closest.el;
    }
    list.addEventListener('dragstart', function (e) {
      var li = e.target.closest('.me-sort-item'); if (!li) return;
      li.classList.add('is-dragging');
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', li.getAttribute('data-id')); } catch (err) {}
    });
    list.addEventListener('dragend', function (e) {
      var li = e.target.closest('.me-sort-item'); if (li) li.classList.remove('is-dragging');
    });
    list.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      var dragging = list.querySelector('.is-dragging'); if (!dragging) return;
      var after = afterElement(e.clientY);
      if (after == null) list.appendChild(dragging);
      else list.insertBefore(dragging, after);
    });
    list.addEventListener('drop', function (e) { e.preventDefault(); });

    var correct = false, done = false;
    function lockSort() {
      list.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
      list.querySelectorAll('.me-sort-item').forEach(function (li) { li.setAttribute('draggable', 'false'); });
      var cb = el.querySelector('.me-check'); if (cb) cb.disabled = true;
    }
    if (ctx.state && typeof ctx.state.correct === 'boolean') {
      correct = ctx.state.correct; done = true; showFeedback(el, correct, data); lockSort();
    }
    function check() {
      if (done) return { resolved: true, correct: correct };
      var order = [].slice.call(list.children).map(function (li) { return li.getAttribute('data-id'); });
      var expected = steps.slice().sort(function (a, b) { return a.order - b.order; }).map(function (s) { return s.id; });
      correct = JSON.stringify(order) === JSON.stringify(expected);
      attempts++;
      done = correct || (maxAtt > 0 && attempts >= maxAtt);
      showFeedback(el, correct, data);
      ctx.save({ order: order, correct: correct, attempts: attempts });
      if (done) lockSort();
      ctx.announce(correct ? 'Orden correcto.' : (done ? 'Orden incorrecto. Sin más intentos.' : 'Orden incorrecto. Inténtalo de nuevo.'));
      return { resolved: done, correct: correct };
    }
    el.querySelector('.me-check').addEventListener('click', check);
    return {
      result: function () { return { completed: done, scored: !!data.scored, correct: correct, score: correct ? (data.points || 1) : 0, maxScore: data.points || 1 }; },
      check: check,
      hasAnswer: function () { return true; },
    };
  });

  // --- 4. Match pairs / 8. Classification -> arrastrar a categorías ----------
  // DnD nativo (ratón) + desplegable «Asignar a» por elemento (teclado/táctil).
  function dragAssignFactory(el, data, ctx) {
    var groups = data.config.groups || [];   // [{id, label}]
    var opts = data.options || [];            // [{id, text, group}]
    var assign = {};                          // itemId -> groupId ('' = sin asignar)
    if (ctx.state && ctx.state.answers) assign = Object.assign({}, ctx.state.answers);

    function selectOptions(selected) {
      var h = '<option value="">Sin asignar</option>';
      groups.forEach(function (g) {
        h += '<option value="' + esc(g.id) + '"' + (selected === g.id ? ' selected' : '') + '>' + esc(stripTags(g.label)) + '</option>';
      });
      return h;
    }
    function chipHtml(o) {
      return '<div class="me-chip" draggable="true" tabindex="0" data-id="' + esc(o.id) + '">' +
        '<span class="me-chip-text">' + rich(o.text) + '</span>' +
        '<label class="sr-only" for="sel-' + esc(o.id) + '">Asignar «' + esc(stripTags(o.text)) + '» a categoría</label>' +
        '<select id="sel-' + esc(o.id) + '" class="me-chip-select" data-id="' + esc(o.id) + '">' + selectOptions(assign[o.id] || '') + '</select>' +
        '</div>';
    }

    var html = header(data) +
      '<p class="me-sort-hint">Arrastra cada elemento a su categoría. En móvil o con teclado, usa el desplegable «Asignar a».</p>' +
      '<div class="me-dnd">' +
      '<div class="me-dnd-pool me-dnd-zone" data-zone="" aria-label="Elementos sin asignar"><p class="me-dnd-title">Sin asignar</p><div class="me-dnd-list" data-zone-list=""></div></div>' +
      '<div class="me-dnd-groups">';
    groups.forEach(function (g) {
      html += '<div class="me-dnd-group me-dnd-zone" data-zone="' + esc(g.id) + '">' +
        '<p class="me-dnd-title">' + rich(g.label) + '</p>' +
        '<div class="me-dnd-list" data-zone-list="' + esc(g.id) + '"></div></div>';
    });
    html += '</div></div><button class="me-btn me-check">Comprobar</button>' + feedbackBox(data);
    el.innerHTML = html;
    var attempts = (ctx.state && ctx.state.attempts) || 0;
    var maxAtt = attemptsOf(data);

    // Construye los chips y los coloca en su zona inicial
    var chips = {};
    opts.forEach(function (o) {
      var tmp = document.createElement('div');
      tmp.innerHTML = chipHtml(o);
      chips[o.id] = tmp.firstChild;
    });
    function listFor(zone) { return el.querySelector('[data-zone-list="' + (zone || '') + '"]'); }
    function place(id) { (listFor(assign[id] || '') || listFor('')).appendChild(chips[id]); }
    opts.forEach(function (o) { place(o.id); });

    // Desplegable (teclado / táctil)
    el.addEventListener('change', function (e) {
      var s = e.target.closest('.me-chip-select'); if (!s) return;
      var id = s.getAttribute('data-id');
      assign[id] = s.value; place(id); chips[id].focus();
    });

    // Drag & drop (ratón)
    var draggingId = null;
    el.addEventListener('dragstart', function (e) {
      var chip = e.target.closest('.me-chip'); if (!chip) return;
      draggingId = chip.getAttribute('data-id');
      chip.classList.add('is-dragging');
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', draggingId); } catch (err) {}
    });
    el.addEventListener('dragend', function (e) {
      var chip = e.target.closest('.me-chip'); if (chip) chip.classList.remove('is-dragging');
      el.querySelectorAll('.me-dnd-zone').forEach(function (z) { z.classList.remove('is-over'); });
    });
    el.querySelectorAll('.me-dnd-zone').forEach(function (zone) {
      zone.addEventListener('dragover', function (e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; zone.classList.add('is-over'); });
      zone.addEventListener('dragleave', function () { zone.classList.remove('is-over'); });
      zone.addEventListener('drop', function (e) {
        e.preventDefault(); zone.classList.remove('is-over');
        if (draggingId == null) return;
        var z = zone.getAttribute('data-zone');
        assign[draggingId] = z;
        var sel = chips[draggingId].querySelector('.me-chip-select'); if (sel) sel.value = z;
        place(draggingId); draggingId = null;
      });
    });

    var correct = false, done = false;
    function lockAssign() {
      el.querySelectorAll('.me-chip-select').forEach(function (s) { s.disabled = true; });
      el.querySelectorAll('.me-chip').forEach(function (c) { c.setAttribute('draggable', 'false'); });
      var cb = el.querySelector('.me-check'); if (cb) cb.disabled = true;
    }
    if (ctx.state && typeof ctx.state.correct === 'boolean') {
      correct = ctx.state.correct; done = true; showFeedback(el, correct, data); lockAssign();
    }
    function allAssigned() { return opts.every(function (o) { return !!assign[o.id]; }); }
    function check() {
      if (done) return { resolved: true, correct: correct };
      var all = true;
      opts.forEach(function (o) { if (!assign[o.id] || assign[o.id] !== o.group) all = false; });
      correct = all; attempts++;
      done = correct || (maxAtt > 0 && attempts >= maxAtt);
      showFeedback(el, correct, data);
      ctx.save({ answers: assign, correct: correct, attempts: attempts });
      if (done) lockAssign();
      ctx.announce(correct ? 'Clasificación correcta.' : (done ? 'Incorrecto. Sin más intentos.' : 'Hay asignaciones incorrectas. Inténtalo de nuevo.'));
      return { resolved: done, correct: correct };
    }
    el.querySelector('.me-check').addEventListener('click', check);
    return {
      result: function () { return { completed: done, scored: !!data.scored, correct: correct, score: correct ? (data.points || 1) : 0, maxScore: data.points || 1 }; },
      check: check,
      hasAnswer: allAssigned,
    };
  }
  register('match_pairs', dragAssignFactory);
  register('classification', dragAssignFactory);

  // --- 9. Scenario decision --------------------------------------------------
  register('scenario_decision', function (el, data, ctx) {
    // config.scenario (texto), options con correct + feedback por opción
    var html = header(data);
    if (data.config.scenario) html += '<div class="me-scenario">' + rich(data.config.scenario) + '</div>';
    html += '<div class="me-choices">';
    (data.options || []).forEach(function (o) {
      html += '<button class="me-btn me-option" data-id="' + esc(o.id) + '">' + rich(o.text) + '</button>';
    });
    el.innerHTML = html + '</div>' + feedbackBox(data);
    var correct = false, done = false;
    function markOption(id, ok) {
      el.querySelectorAll('.me-option').forEach(function (x) { x.classList.remove('is-right', 'is-wrong'); });
      var btn = el.querySelector('.me-option[data-id="' + id + '"]');
      if (btn) btn.classList.add(ok ? 'is-right' : 'is-wrong');
    }
    el.querySelectorAll('.me-option').forEach(function (b) {
      b.addEventListener('click', function () {
        var o = (data.options || []).filter(function (x) { return x.id === b.dataset.id; })[0];
        correct = !!o.correct; done = true;
        markOption(o.id, correct);
        var box = el.querySelector('.me-feedback');
        box.className = 'me-feedback ' + (correct ? 'is-ok' : 'is-error');
        box.innerHTML = '<strong>' + (correct ? '✔ ' : '✖ ') + rich(o.feedback || (correct ? data.feedback.correct : data.feedback.incorrect)) + '</strong>' +
          (data.feedback.explanation ? '<p class="me-expl">' + rich(data.feedback.explanation) + '</p>' : '');
        box.hidden = false;
        ctx.save({ choice: o.id, correct: correct });
        ctx.announce(correct ? 'Decisión correcta.' : 'Decisión mejorable.');
      });
    });
    if (ctx.state && ctx.state.choice) {
      var so = (data.options || []).filter(function (x) { return x.id === ctx.state.choice; })[0];
      if (so) {
        correct = !!so.correct; done = true;
        markOption(so.id, correct);
        var sb = el.querySelector('.me-feedback');
        sb.className = 'me-feedback ' + (correct ? 'is-ok' : 'is-error');
        sb.innerHTML = '<strong>' + (correct ? '✔ ' : '✖ ') + rich(so.feedback || (correct ? data.feedback.correct : data.feedback.incorrect)) + '</strong>' +
          (data.feedback.explanation ? '<p class="me-expl">' + rich(data.feedback.explanation) + '</p>' : '');
        sb.hidden = false;
      }
    }
    return { result: function () { return { completed: done, scored: !!data.scored, correct: correct, score: correct ? (data.points || 1) : 0, maxScore: data.points || 1 }; } };
  });

  // --- 10. Case practice (respuesta abierta, no evaluada o rúbrica simple) ----
  register('case_practice', function (el, data, ctx) {
    var rubric = data.config.rubric || []; // [{label}]
    var html = header(data) +
      '<label class="me-field"><span class="sr-only">Tu respuesta</span>' +
      '<textarea class="me-textarea" rows="6" placeholder="Escribe tu respuesta..."></textarea></label>';
    if (rubric.length) {
      html += '<div class="me-rubric"><p>Autoevalúate según la rúbrica:</p><ul>';
      rubric.forEach(function (r, i) { html += '<li><label><input type="checkbox" data-r="' + i + '"> ' + esc(r.label) + '</label></li>'; });
      html += '</ul></div>';
    }
    el.innerHTML = html;
    var ta = el.querySelector('.me-textarea');
    if (ctx.state && ctx.state.text) ta.value = ctx.state.text;
    function save() {
      var checks = [].slice.call(el.querySelectorAll('.me-rubric input:checked')).length;
      ctx.save({ text: ta.value, rubric_checks: checks });
    }
    // Reflexión abierta: se guarda sola (al salir del campo) y NO bloquea el avance.
    ta.addEventListener('change', save);
    el.addEventListener('change', function (e) { if (e.target.closest('.me-rubric')) save(); });
    return { result: function () { return { completed: true, scored: false }; } };
  });

  // --- 11. Hotspots accesibles ----------------------------------------------
  register('hotspots', function (el, data, ctx) {
    // config: { image, alt, spots:[{id,x,y,w,h,label,correct,feedback}] }
    var c = data.config || {};
    var html = header(data) + '<div class="me-hotspot-wrap"><img src="' + esc(assetUrl(c.image)) + '" alt="' + esc(c.alt || '') + '" class="me-hotspot-img">';
    (c.spots || []).forEach(function (s) {
      html += '<button class="me-hotspot" data-id="' + esc(s.id) + '" aria-label="' + esc(s.label) + '" ' +
        'style="left:' + s.x + '%;top:' + s.y + '%;width:' + (s.w || 8) + '%;height:' + (s.h || 8) + '%"></button>';
    });
    // Alternativa textual accesible: lista de botones equivalentes
    html += '</div><ul class="me-hotspot-list">';
    (c.spots || []).forEach(function (s) { html += '<li><button class="me-btn me-hs-alt" data-id="' + esc(s.id) + '">' + esc(s.label) + '</button></li>'; });
    el.innerHTML = html + '</ul>' + feedbackBox(data);
    var correct = false, done = false;
    function pick(id) {
      var s = (c.spots || []).filter(function (x) { return x.id === id; })[0];
      correct = !!s.correct; done = true;
      showFeedback(el, correct, { feedback: { correct: s.feedback || data.feedback.correct, incorrect: s.feedback || data.feedback.incorrect, explanation: data.feedback.explanation } });
      ctx.save({ choice: id, correct: correct });
      ctx.announce(correct ? 'Zona correcta.' : 'Zona incorrecta.');
    }
    el.querySelectorAll('.me-hotspot, .me-hs-alt').forEach(function (b) {
      b.addEventListener('click', function () { pick(b.dataset.id); });
    });
    if (ctx.state && ctx.state.choice) {
      var hs = (c.spots || []).filter(function (x) { return x.id === ctx.state.choice; })[0];
      if (hs) {
        correct = !!hs.correct; done = true;
        showFeedback(el, correct, { feedback: { correct: hs.feedback || data.feedback.correct, incorrect: hs.feedback || data.feedback.incorrect, explanation: data.feedback.explanation } });
      }
    }
    return { result: function () { return { completed: done, scored: !!data.scored, correct: correct, score: correct ? (data.points || 1) : 0, maxScore: data.points || 1 }; } };
  });

  // --- 12. Video con transcripción y subtítulos VTT --------------------------
  register('video', function (el, data, ctx) {
    var c = data.config || {};
    var html = header(data);
    if (c.youtube) {
      html += '<div class="me-video"><iframe src="https://www.youtube-nocookie.com/embed/' + esc(c.youtube) +
        '" title="' + esc(data.prompt || 'Vídeo') + '" allowfullscreen loading="lazy"></iframe></div>';
    } else if (c.src) {
      html += '<video class="me-video" controls preload="metadata"' + (c.poster ? ' poster="' + esc(assetUrl(c.poster)) + '"' : '') + '>' +
        '<source src="' + esc(assetUrl(c.src)) + '">';
      (c.tracks || []).forEach(function (t) {
        html += '<track kind="' + esc(t.kind || 'subtitles') + '" src="' + esc(assetUrl(t.src)) + '" srclang="' + esc(t.lang || 'es') + '" label="' + esc(t.label || 'Español') + '" default>';
      });
      html += '</video>';
    }
    if (c.transcript) {
      html += '<details class="me-transcript"><summary>Ver transcripción</summary><div>' + esc(c.transcript) + '</div></details>';
    }
    el.innerHTML = html;
    return { result: function () { return { completed: true, scored: false }; } };
  });

  // Etiqueta/coletilla que indica el TIPO de ejercicio. Así el título de la
  // pantalla puede ser el del tema (no "Checkpoint…") y la app señala por sí
  // misma qué clase de actividad es. Evaluable ⇒ "Actividad"; informativa ⇒
  // "Interactivo".
  var TYPE_LABELS = {
    accordion:      { kind: 'Interactivo', text: 'Despliega cada apartado' },
    tabs:           { kind: 'Interactivo', text: 'Explora las pestañas' },
    flip_cards:     { kind: 'Interactivo', text: 'Voltea las tarjetas' },
    hotspots:       { kind: 'Interactivo', text: 'Explora los puntos de la imagen' },
    case_practice:  { kind: 'Actividad',   text: 'Caso práctico' },
    single_choice:  { kind: 'Actividad',   text: 'Elige la opción correcta' },
    true_false:     { kind: 'Actividad',   text: 'Verdadero o falso' },
    sort_steps:     { kind: 'Actividad',   text: 'Ordena los pasos' },
    match_pairs:    { kind: 'Actividad',   text: 'Relaciona los pares' },
    classification: { kind: 'Actividad',   text: 'Clasifica los elementos' }
  };
  function typeTag(type) {
    var t = TYPE_LABELS[type];
    if (!t) return '';
    return '<p class="me-inter-tag"><span class="me-inter-tag-kind">' + esc(t.kind) +
      '</span> ' + esc(t.text) + '</p>';
  }

  global.Interactions = { register: register, render: function (el, data, ctx) {
    var f = registry[data.type];
    if (!f) { el.innerHTML = '<p class="me-warn">Tipo de interacción no soportado: ' + esc(data.type) + '</p>'; return { result: function () { return { completed: true, scored: false }; } }; }
    var ctrl = f(el, data, ctx);
    var tag = typeTag(data.type);
    if (tag) el.insertAdjacentHTML('afterbegin', tag);
    return ctrl;
  }, esc: esc, rich: rich, stripTags: stripTags, asset: assetUrl };
})(window);
