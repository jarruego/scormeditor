/* =============================================================================
 * interactions.js — Motor de interacciones (todos los tipos del enum)
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

  // Botón Comprobar: nace desactivado; cuando `ready()` (respuesta completa) se cumple,
  // se activa y, si el cambio viene del usuario (`pulse`), late para invitar a comprobar.
  // El pulso se apaga al clicar y vuelve si se cambia la respuesta.
  function wireCheck(el, ready) {
    var btn = el.querySelector('.me-check');
    if (!btn) return function () {};
    btn.disabled = true;
    btn.addEventListener('click', function () { btn.classList.remove('me-pulse'); });
    return function (pulse) {
      var ok = ready();
      btn.disabled = !ok;
      btn.classList.toggle('me-pulse', !!(ok && pulse));
    };
  }

  // --- 1. Accordion ----------------------------------------------------------
  register('accordion', function (el, data, ctx) {
    var items = (data.config.items || []);
    var seen = (ctx.state && ctx.state.seen) || {}; // índice -> true (persistido)
    var html = header(data) + '<div class="me-accordion">';
    items.forEach(function (it, i) {
      var id = 'acc-' + i;
      html += '<div class="me-acc-item">' +
        '<button class="me-acc-head' + (seen[i] ? ' is-seen' : '') + '" aria-expanded="false" aria-controls="' + id + '">' +
        '<span class="me-acc-title">' + rich(it.title) + '</span>' +
        '<span class="me-seen-check" aria-hidden="true">✓</span></button>' +
        '<div class="me-acc-body" id="' + id + '" role="region" hidden>' + block(it.body) + '</div></div>';
    });
    html += '</div>';
    el.innerHTML = html;
    var heads = [].slice.call(el.querySelectorAll('.me-acc-head'));
    // Pulso en el primero para invitar al clic, solo si aún no se ha abierto ninguno
    if (!Object.keys(seen).length && heads[0]) heads[0].classList.add('me-pulse');
    heads.forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        // Exclusivo: al abrir uno se cierran los demás
        heads.forEach(function (other) {
          var on = other === btn && !open;
          other.classList.remove('me-pulse');
          other.setAttribute('aria-expanded', String(on));
          document.getElementById(other.getAttribute('aria-controls')).hidden = !on;
        });
        if (!open && !seen[i]) { seen[i] = true; btn.classList.add('is-seen'); ctx.save({ seen: seen }); }
      });
    });
    // Completada solo cuando se han abierto TODOS los apartados: con la regla
    // «exigir completar las interacciones» activa, no deja avanzar hasta entonces.
    return { result: function () {
      return { completed: items.every(function (_, i) { return !!seen[i]; }), scored: false };
    } };
  });

  // --- 2. Tabs ---------------------------------------------------------------
  register('tabs', function (el, data, ctx) {
    var items = (data.config.items || []);
    var seen = (ctx.state && ctx.state.seen) || {}; // índice -> true (persistido)
    seen[0] = true; // la primera pestaña está visible desde el principio
    var tablist = '<div class="me-tabs" role="tablist">';
    var panels = '';
    items.forEach(function (it, i) {
      var sel = i === 0;
      tablist += '<button role="tab" id="tab-' + i + '" aria-controls="panel-' + i + '" aria-selected="' + sel + '" tabindex="' + (sel ? '0' : '-1') + '"' +
        (seen[i] ? ' class="is-seen"' : '') + '>' + rich(it.title) +
        '<span class="me-seen-check" aria-hidden="true">✓</span></button>';
      panels += '<div role="tabpanel" id="panel-' + i + '" aria-labelledby="tab-' + i + '" ' + (sel ? '' : 'hidden') + '>' + block(it.body) + '</div>';
    });
    tablist += '</div>';
    el.innerHTML = header(data) + '<div class="me-tabs-box">' + tablist + panels + '</div>';
    var tabs = [].slice.call(el.querySelectorAll('[role=tab]'));
    // Pulso en la segunda pestaña (la primera ya está activa) hasta que se cambie
    if (Object.keys(seen).length <= 1 && tabs[1]) tabs[1].classList.add('me-pulse');
    function activate(i) {
      tabs.forEach(function (t, j) {
        var on = i === j;
        t.classList.remove('me-pulse');
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        el.querySelector('#panel-' + j).hidden = !on;
        if (on) t.focus();
      });
      if (!seen[i]) { seen[i] = true; tabs[i].classList.add('is-seen'); ctx.save({ seen: seen }); }
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { activate(i); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); activate((i + 1) % tabs.length); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); activate((i - 1 + tabs.length) % tabs.length); }
      });
    });
    // Completada solo cuando se han visitado TODAS las pestañas (la primera
    // cuenta desde el principio porque ya está visible).
    return { result: function () {
      return { completed: items.every(function (_, i) { return !!seen[i]; }), scored: false };
    } };
  });

  // --- 3. Flip cards ---------------------------------------------------------
  register('flip_cards', function (el, data, ctx) {
    // Volteo 3D real (CSS rotateY): ambas caras viven en el DOM apiladas; la
    // visibilidad la resuelve backface-visibility y el lector de pantalla usa
    // aria-hidden. La impresión aplana las dos caras vía print.css.
    var cards = (data.config.cards || []);
    var seen = (ctx.state && ctx.state.seen) || {}; // índice -> true (persistido)
    var html = header(data) + '<div class="me-cards">';
    cards.forEach(function (c, i) {
      html += '<button class="me-card' + (seen[i] ? ' is-seen' : '') + '" aria-pressed="false" data-i="' + i + '" title="Pulsa para girar la tarjeta">' +
        '<span class="me-flip-inner">' +
        '<span class="me-card-front">' + rich(c.front) + '<span class="me-flip-tab" aria-hidden="true"></span></span>' +
        '<span class="me-card-back" aria-hidden="true">' + rich(c.back) + '</span></span></button>';
    });
    el.innerHTML = html + '</div>';
    var btns = [].slice.call(el.querySelectorAll('.me-card'));
    // Pulso en la primera para invitar al clic, solo si aún no se ha girado ninguna
    if (!Object.keys(seen).length && btns[0]) btns[0].classList.add('me-pulse');
    function setFlip(btn, on) {
      btn.setAttribute('aria-pressed', String(on));
      btn.querySelector('.me-card-front').setAttribute('aria-hidden', String(on));
      btn.querySelector('.me-card-back').setAttribute('aria-hidden', String(!on));
    }
    btns.forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        var flipped = btn.getAttribute('aria-pressed') === 'true';
        // Exclusivo: al girar una se devuelven las demás a su anverso
        btns.forEach(function (b) {
          b.classList.remove('me-pulse');
          setFlip(b, b === btn && !flipped);
        });
        if (!flipped && !seen[i]) { seen[i] = true; btn.classList.add('is-seen'); ctx.save({ seen: seen }); }
      });
    });
    // Completada solo cuando se han girado TODAS las tarjetas.
    return { result: function () {
      return { completed: cards.every(function (_, i) { return !!seen[i]; }), scored: false };
    } };
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
    var refreshCheck = wireCheck(el, hasAnswer);
    el.querySelector('.me-choices').addEventListener('change', function () { if (!done) refreshCheck(true); });

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
    if (!done) refreshCheck(false); // respuesta restaurada sin resolver: activo sin pulso

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
    // Aquí «responder» es reordenar: el botón se activa al primer movimiento
    var refreshCheck = wireCheck(el, function () { return true; });

    function move(li, dir) {
      if (done) return;
      if (dir < 0 && li.previousElementSibling) list.insertBefore(li, li.previousElementSibling);
      else if (dir > 0 && li.nextElementSibling) list.insertBefore(li.nextElementSibling, li);
      refreshCheck(true);
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
      if (!done) refreshCheck(true);
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

    function chipHtml(o) {
      return '<div class="me-chip" role="button" draggable="true" tabindex="0" aria-pressed="false" data-id="' + esc(o.id) + '">' +
        '<span class="me-chip-text">' + rich(o.text) + '</span></div>';
    }

    var html = header(data) +
      '<p class="me-sort-hint">Arrastra cada elemento a su categoría, o tócalo para seleccionarlo y después toca la categoría destino.</p>' +
      '<div class="me-dnd">' +
      '<div class="me-dnd-pool me-dnd-zone" data-zone="" tabindex="0" role="button" aria-label="Sin asignar"><p class="me-dnd-title">Sin asignar</p><div class="me-dnd-list" data-zone-list=""></div></div>' +
      '<div class="me-dnd-groups">';
    groups.forEach(function (g) {
      html += '<div class="me-dnd-group me-dnd-zone" data-zone="' + esc(g.id) + '" tabindex="0" role="button" aria-label="Categoría ' + esc(stripTags(g.label)) + '">' +
        '<p class="me-dnd-title">' + rich(g.label) + '</p>' +
        '<div class="me-dnd-list" data-zone-list="' + esc(g.id) + '"></div></div>';
    });
    html += '</div></div><button class="me-btn me-check">Comprobar</button>' + feedbackBox(data);
    el.innerHTML = html;
    var attempts = (ctx.state && ctx.state.attempts) || 0;
    var maxAtt = attemptsOf(data);
    var refreshCheck = wireCheck(el, allAssigned);

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

    // Tocar y colocar (táctil / teclado / ratón): se selecciona un chip y luego
    // se toca la zona destino. Enter/Espacio equivalen al toque.
    var pickedId = null, locked = false;
    function setPicked(id) {
      if (pickedId && chips[pickedId]) {
        chips[pickedId].classList.remove('is-picked');
        chips[pickedId].setAttribute('aria-pressed', 'false');
      }
      pickedId = id;
      if (id) {
        chips[id].classList.add('is-picked');
        chips[id].setAttribute('aria-pressed', 'true');
      }
    }
    el.addEventListener('click', function (e) {
      if (locked) return;
      var chip = e.target.closest('.me-chip');
      if (chip) {
        var id = chip.getAttribute('data-id');
        setPicked(pickedId === id ? null : id);
        if (pickedId) ctx.announce('Elemento seleccionado. Toca una categoría para colocarlo.');
        return;
      }
      var zone = e.target.closest('.me-dnd-zone');
      if (zone && pickedId) {
        var picked = pickedId;
        assign[picked] = zone.getAttribute('data-zone');
        setPicked(null); place(picked); chips[picked].focus();
        refreshCheck(true);
        var title = zone.querySelector('.me-dnd-title');
        ctx.announce('Colocado en «' + (title ? title.textContent : 'Sin asignar') + '».');
      }
    });
    el.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var t = e.target.closest('.me-chip, .me-dnd-zone'); if (!t) return;
      e.preventDefault(); t.click();
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
        assign[draggingId] = zone.getAttribute('data-zone');
        setPicked(null); place(draggingId); draggingId = null;
        refreshCheck(true);
      });
    });

    var correct = false, done = false;
    function lockAssign() {
      locked = true; setPicked(null);
      el.querySelectorAll('.me-chip').forEach(function (c) {
        c.setAttribute('draggable', 'false'); c.removeAttribute('role');
        c.removeAttribute('aria-pressed'); c.tabIndex = -1;
      });
      el.querySelectorAll('.me-dnd-zone').forEach(function (z) { z.removeAttribute('role'); z.tabIndex = -1; });
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

  // --- 10. Case practice (reflexión guiada + autoevaluación por rúbrica) ------
  // Sin campo de texto a propósito: la respuesta se piensa o se escribe en papel
  // (no gasta suspend_data); solo se persisten los criterios marcados.
  register('case_practice', function (el, data, ctx) {
    var rubric = data.config.rubric || []; // [{label}]
    var html = header(data) +
      '<p class="me-case-hint">Piensa tu respuesta con calma —o escríbela en un papel—' +
      (rubric.length ? ' y, cuando la tengas, autoevalúate con la rúbrica.' : '.') + '</p>';
    // La rúbrica es una card desplegable (mismo patrón/clases que el accordion:
    // «+», glow y expansión automática al imprimir vienen heredados).
    var rid = 'rubric-' + data.id;
    if (rubric.length) {
      html += '<div class="me-rubric">' +
        '<button class="me-acc-head" type="button" aria-expanded="false" aria-controls="' + rid + '">' +
        '<span class="me-acc-title">Autoevalúate según la rúbrica</span></button>' +
        '<div class="me-acc-body" id="' + rid + '" role="region" hidden><ul>';
      rubric.forEach(function (r, i) { html += '<li><label><input type="checkbox" data-r="' + i + '"> ' + esc(r.label) + '</label></li>'; });
      html += '</ul></div></div>';
    }
    el.innerHTML = html;
    var boxes = [].slice.call(el.querySelectorAll('.me-rubric input'));
    // rubric: índices de los criterios marcados (compacto para suspend_data)
    var marked0 = (ctx.state && ctx.state.rubric) || [];
    marked0.forEach(function (i) { if (boxes[i]) boxes[i].checked = true; });
    var head = el.querySelector('.me-rubric .me-acc-head');
    if (head) {
      var body = document.getElementById(rid);
      // Con autoevaluación empezada se muestra abierta; si no, late para invitar
      if (marked0.length) { head.setAttribute('aria-expanded', 'true'); body.hidden = false; }
      else head.classList.add('me-pulse');
      head.addEventListener('click', function () {
        var open = head.getAttribute('aria-expanded') === 'true';
        head.classList.remove('me-pulse');
        head.setAttribute('aria-expanded', String(!open));
        body.hidden = open;
      });
    }
    el.addEventListener('change', function (e) {
      if (!e.target.closest('.me-rubric')) return;
      var marked = [];
      boxes.forEach(function (b, i) { if (b.checked) marked.push(i); });
      ctx.save({ rubric: marked });
    });
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
    // Solo la imagen con sus zonas: cada zona ya es un <button> con aria-label
    // (focusable con teclado y anunciado por lector), así que no hace falta una
    // lista textual aparte (se retiró en jul 2026: duplicaba los botones y
    // desvelaba las etiquetas de las zonas bajo la imagen).
    el.innerHTML = html + '</div>' + feedbackBox(data);
    var correct = false, done = false;
    // Pulso en las zonas para invitar al clic (en todas: señalar solo una sesgaría
    // la respuesta); se apaga al primer intento
    if (!(ctx.state && ctx.state.choice)) {
      el.querySelectorAll('.me-hotspot').forEach(function (b) { b.classList.add('me-pulse'); });
    }
    function pick(id) {
      el.querySelectorAll('.me-hotspot').forEach(function (b) { b.classList.remove('me-pulse'); });
      var s = (c.spots || []).filter(function (x) { return x.id === id; })[0];
      correct = !!s.correct; done = true;
      showFeedback(el, correct, { feedback: { correct: s.feedback || data.feedback.correct, incorrect: s.feedback || data.feedback.incorrect, explanation: data.feedback.explanation } });
      ctx.save({ choice: id, correct: correct });
      ctx.announce(correct ? 'Zona correcta.' : 'Zona incorrecta.');
    }
    el.querySelectorAll('.me-hotspot').forEach(function (b) {
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
  // Vídeo con preguntas opcionales en timestamps (config.questions:
  // [{ time (segundos), prompt, options: [{text, correct, feedback?}] }]).
  // El vídeo se PAUSA al llegar al timestamp y muestra la pregunta en overlay;
  // al responder (1 intento por pregunta) se ve el feedback y se reanuda.
  // - video_file: nativo (timeupdate/pause/play).
  // - YouTube: puente postMessage del IFrame API (enablejsapi=1, sin cargar JS
  //   externo). Si el puente no entrega tiempo (bloqueado), las preguntas
  //   aparecen como lista visible bajo el vídeo: siempre son respondibles.
  // Sin preguntas se comporta como siempre (informativa, completa al render).
  register('video', function (el, data, ctx) {
    var c = data.config || {};
    var questions = (c.questions || []).filter(function (q) {
      return q && String(q.prompt || '').trim() && (q.options || []).length >= 2;
    });
    var answered = (ctx.state && ctx.state.answered) || {}; // idx -> {choice, correct}

    var html = header(data) + '<div class="me-iv-box">';
    if (c.youtube) {
      html += '<div class="me-video"><iframe src="https://www.youtube-nocookie.com/embed/' + esc(c.youtube) +
        (questions.length ? '?enablejsapi=1' : '') +
        '" title="' + esc(stripTags(data.prompt) || 'Vídeo') + '" allow="autoplay" allowfullscreen loading="lazy"></iframe></div>';
    } else if (c.src) {
      html += '<video class="me-video" controls preload="metadata"' + (c.poster ? ' poster="' + esc(assetUrl(c.poster)) + '"' : '') + '>' +
        '<source src="' + esc(assetUrl(c.src)) + '">';
      (c.tracks || []).forEach(function (t) {
        html += '<track kind="' + esc(t.kind || 'subtitles') + '" src="' + esc(assetUrl(t.src)) + '" srclang="' + esc(t.lang || 'es') + '" label="' + esc(t.label || 'Español') + '" default>';
      });
      html += '</video>';
    }
    html += '<div class="me-iv-overlay" hidden></div></div>';
    if (questions.length) {
      html += '<p class="me-iv-progress" aria-live="polite"></p>';
      // Contenedor del modo lista (fallback YouTube sin puente): oculto de serie.
      html += '<div class="me-iv-list" hidden></div>';
    }
    if (c.transcript) {
      html += '<details class="me-transcript"><summary>Ver transcripción</summary><div>' + esc(c.transcript) + '</div></details>';
    }
    el.innerHTML = html;

    if (!questions.length) {
      return { result: function () { return { completed: true, scored: false }; } };
    }

    var overlay = el.querySelector('.me-iv-overlay');
    var progress = el.querySelector('.me-iv-progress');
    var videoEl = el.querySelector('video');
    var iframeEl = el.querySelector('iframe');
    var listBox = el.querySelector('.me-iv-list');

    function answeredCount() { return Object.keys(answered).length; }
    function refreshProgress() {
      progress.textContent = 'Preguntas del vídeo: ' + answeredCount() + ' de ' + questions.length + ' respondidas.';
    }
    refreshProgress();

    // --- Control de reproducción (nativo o puente YouTube) -----------------
    var yt = { ready: false, time: 0 };
    function ytCmd(func) {
      if (iframeEl && iframeEl.contentWindow) {
        iframeEl.contentWindow.postMessage(JSON.stringify({ event: 'command', func: func, args: [] }), '*');
      }
    }
    function pause() { if (videoEl) videoEl.pause(); else ytCmd('pauseVideo'); }
    function play() { if (videoEl) videoEl.play(); else ytCmd('playVideo'); }
    function currentTime() { return videoEl ? videoEl.currentTime : yt.time; }

    // --- Pregunta en overlay -------------------------------------------------
    function renderQuestion(i, box, onDone) {
      var q = questions[i];
      var prev = answered[i];
      var h = '<div class="me-iv-q" role="group" aria-label="Pregunta del vídeo">' +
        '<p class="me-iv-prompt">' + rich(q.prompt) + '</p><div class="me-iv-opts">';
      (q.options || []).forEach(function (o, j) {
        h += '<button type="button" class="me-iv-opt' +
          (prev && prev.choice === j ? (prev.correct ? ' is-right' : ' is-wrong') : '') +
          '" data-j="' + j + '"' + (prev ? ' disabled' : '') + '>' + rich(o.text) + '</button>';
      });
      h += '</div><div class="me-iv-fb"' + (prev ? '' : ' hidden') + '></div>' +
        (onDone ? '<button type="button" class="me-btn me-primary me-iv-continue" hidden>Continuar</button>' : '') +
        '</div>';
      box.innerHTML = h;
      var fb = box.querySelector('.me-iv-fb');
      function showFb(o, ok) {
        fb.hidden = false;
        fb.className = 'me-iv-fb ' + (ok ? 'is-ok' : 'is-error');
        fb.innerHTML = '<strong>' + (ok ? '✔ ' : '✖ ') + '</strong>' +
          rich(o.feedback || (ok ? (data.feedback.correct || 'Correcto.') : (data.feedback.incorrect || 'No es correcto.')));
      }
      if (prev) showFb(q.options[prev.choice] || {}, prev.correct);
      box.querySelector('.me-iv-opts').addEventListener('click', function (e) {
        var btn = e.target.closest('.me-iv-opt');
        if (!btn || answered[i]) return;
        var j = +btn.getAttribute('data-j');
        var ok = !!q.options[j].correct;
        answered[i] = { choice: j, correct: ok };
        btn.classList.add(ok ? 'is-right' : 'is-wrong');
        [].slice.call(box.querySelectorAll('.me-iv-opt')).forEach(function (b) { b.disabled = true; });
        showFb(q.options[j], ok);
        ctx.save({ answered: answered });
        refreshProgress();
        ctx.announce(ok ? 'Respuesta correcta.' : 'Respuesta incorrecta.');
        var cont = box.querySelector('.me-iv-continue');
        if (cont) { cont.hidden = false; cont.focus(); }
      });
      var cont = box.querySelector('.me-iv-continue');
      if (cont) cont.addEventListener('click', function () { onDone(); });
    }

    var showing = false;
    function pendingAt(t) {
      for (var i = 0; i < questions.length; i++) {
        if (!answered[i] && t >= (questions[i].time || 0)) return i;
      }
      return -1;
    }
    function maybeAsk() {
      if (showing) return;
      var i = pendingAt(currentTime());
      if (i === -1) return;
      showing = true;
      pause();
      overlay.hidden = false;
      renderQuestion(i, overlay, function () {
        overlay.hidden = true;
        showing = false;
        // Otra pregunta en el mismo punto: se muestra antes de reanudar.
        if (pendingAt(currentTime()) !== -1) { maybeAsk(); return; }
        play();
      });
      overlay.querySelector('.me-iv-opt').focus();
    }

    if (videoEl) {
      videoEl.addEventListener('timeupdate', maybeAsk);
      videoEl.addEventListener('seeked', maybeAsk);
    } else if (iframeEl) {
      // Puente YouTube: pedir escucha hasta recibir infoDelivery con el tiempo.
      var gotInfo = false;
      var onMsg = function (e) {
        if (!iframeEl.isConnected) { global.removeEventListener('message', onMsg); return; }
        if (e.source !== iframeEl.contentWindow) return;
        var d;
        try { d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (err) { return; }
        if (d && d.info && typeof d.info.currentTime === 'number') {
          gotInfo = true;
          yt.time = d.info.currentTime;
          maybeAsk();
        }
      };
      global.addEventListener('message', onMsg);
      var listenTries = 0;
      var listener = setInterval(function () {
        if (!iframeEl.isConnected || gotInfo || listenTries++ > 20) { clearInterval(listener); return; }
        if (iframeEl.contentWindow) {
          iframeEl.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: String(data.id) }), '*');
        }
      }, 500);
      // Fallback: sin señal de tiempo en 6 s, preguntas como lista visible.
      setTimeout(function () {
        if (gotInfo || !iframeEl.isConnected) return;
        listBox.hidden = false;
        listBox.innerHTML = '<p class="me-iv-list-head">Preguntas del vídeo</p>';
        questions.forEach(function (_, i) {
          var slot = document.createElement('div');
          listBox.appendChild(slot);
          renderQuestion(i, slot, null);
        });
      }, 6000);
    }

    return {
      result: function () {
        var total = questions.length;
        var okCount = 0;
        questions.forEach(function (_, i) { if (answered[i] && answered[i].correct) okCount++; });
        var all = answeredCount() >= total;
        var pts = data.points || 1;
        return {
          completed: all,
          scored: !!data.scored,
          correct: all && okCount === total,
          score: Math.round(pts * (okCount / total) * 100) / 100,
          maxScore: pts,
        };
      },
      hasAnswer: function () { return answeredCount() > 0; },
    };
  });

  // --- 13. Rellenar huecos (fill_blanks) --------------------------------------
  // config.text contiene huecos [[respuesta correcta]]; cada hueco se renderiza
  // como <select> cuyo pool de opciones son todas las respuestas + distractores
  // (config.distractors), barajadas de forma determinista.
  register('fill_blanks', function (el, data, ctx) {
    var text = String((data.config || {}).text || '');
    var answers = [];
    // Trocea el texto: parte fija escapada + un select por hueco.
    var body = '';
    var re = /\[\[(.+?)\]\]/g;
    var last = 0, m2;
    while ((m2 = re.exec(text)) !== null) {
      body += rich(text.slice(last, m2.index)).replace(/\n/g, '<br>');
      answers.push(m2[1].trim());
      body += '@@BLANK' + (answers.length - 1) + '@@';
      last = re.lastIndex;
    }
    body += rich(text.slice(last)).replace(/\n/g, '<br>');

    // Pool: respuestas + distractores, sin duplicados, orden determinista.
    var pool = [];
    answers.concat((data.config || {}).distractors || []).forEach(function (t) {
      t = String(t).trim();
      if (t && pool.indexOf(t) === -1) pool.push(t);
    });
    pool = shuffle(pool.map(function (t) { return { id: t }; }), data.id).map(function (x) { return x.id; });

    var optionsHtml = pool.map(function (t) { return '<option value="' + esc(t) + '">' + esc(t) + '</option>'; }).join('');
    answers.forEach(function (_, i) {
      body = body.replace('@@BLANK' + i + '@@',
        '<select class="me-blank" data-i="' + i + '" aria-label="Hueco ' + (i + 1) + '">' +
        '<option value="">…</option>' + optionsHtml + '</select>');
    });

    var maxAtt = attemptsOf(data);
    el.innerHTML = header(data) + '<p class="me-blanks">' + body + '</p>' +
      '<button class="me-btn me-check">Comprobar</button>' + feedbackBox(data);

    var selects = [].slice.call(el.querySelectorAll('.me-blank'));
    var attempts = 0, done = false, correct = false;
    var refreshCheck = wireCheck(el, function () {
      return selects.every(function (s) { return !!s.value; });
    });
    el.addEventListener('change', function (e) {
      if (!done && e.target.closest('.me-blank')) refreshCheck(true);
    });

    function lock() {
      selects.forEach(function (s) { s.disabled = true; });
      var cb = el.querySelector('.me-check'); if (cb) cb.disabled = true;
    }
    function markBlanks() {
      selects.forEach(function (s, i) {
        var ok = s.value === answers[i];
        s.classList.remove('is-right', 'is-wrong');
        s.classList.add(ok ? 'is-right' : 'is-wrong');
        replay(s);
      });
    }
    function hasAnswer() {
      return selects.some(function (s) { return !!s.value; });
    }
    function check() {
      if (done) return { resolved: true, correct: correct };
      if (selects.some(function (s) { return !s.value; })) {
        ctx.announce('Completa todos los huecos.');
        return { resolved: false, correct: false };
      }
      attempts++;
      correct = selects.every(function (s, i) { return s.value === answers[i]; });
      showFeedback(el, correct, data);
      markBlanks();
      done = correct || (maxAtt > 0 && attempts >= maxAtt);
      if (done) lock();
      ctx.save({ values: selects.map(function (s) { return s.value; }), correct: correct, attempts: attempts });
      ctx.announce(correct ? 'Todos los huecos correctos.' : (done ? 'Hay huecos incorrectos. Sin más intentos.' : 'Hay huecos incorrectos. Inténtalo de nuevo.'));
      return { resolved: done, correct: correct };
    }
    el.querySelector('.me-check').addEventListener('click', check);

    if (ctx.state && ctx.state.values) {
      ctx.state.values.forEach(function (v, i) { if (selects[i]) selects[i].value = v; });
      attempts = ctx.state.attempts || 0;
      if (typeof ctx.state.correct === 'boolean') {
        correct = ctx.state.correct;
        showFeedback(el, correct, data);
        markBlanks();
        if (correct || (maxAtt > 0 && attempts >= maxAtt)) { done = true; lock(); }
      }
    }
    if (!done) refreshCheck(false); // valores restaurados sin resolver: activo sin pulso

    return {
      result: function () {
        return { completed: done, scored: !!data.scored, correct: correct, score: correct ? (data.points || 1) : 0, maxScore: data.points || 1 };
      },
      check: check,
      hasAnswer: hasAnswer,
    };
  });

  // --- 14. Línea de tiempo (timeline) -----------------------------------------
  // config.milestones: [{ label (fecha/fase), title, body }]. Informativa: hitos
  // sobre una línea vertical; cada uno se despliega como un accordion.
  register('timeline', function (el, data, ctx) {
    var miles = (data.config || {}).milestones || [];
    var seen = (ctx.state && ctx.state.seen) || {}; // índice -> true (persistido)
    var html = header(data) + '<ol class="me-tl">';
    miles.forEach(function (mi, i) {
      var id = 'tl-' + i;
      html += '<li class="me-tl-item">' +
        '<button class="me-tl-head' + (seen[i] ? ' is-seen' : '') + '" aria-expanded="false" aria-controls="' + id + '">' +
        (mi.label ? '<span class="me-tl-label">' + rich(mi.label) + '</span>' : '') +
        '<span class="me-tl-title">' + rich(mi.title || '') + '</span>' +
        '<span class="me-seen-check" aria-hidden="true">✓</span></button>' +
        '<div class="me-tl-body" id="' + id + '" role="region" hidden>' + block(mi.body || '') + '</div></li>';
    });
    html += '</ol>';
    el.innerHTML = html;
    var heads = [].slice.call(el.querySelectorAll('.me-tl-head'));
    // Pulso en el primer hito para invitar al clic, solo si aún no se ha abierto ninguno
    if (!Object.keys(seen).length && heads[0]) heads[0].classList.add('me-pulse');
    heads.forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        // Exclusivo: al abrir un hito se cierran los demás
        heads.forEach(function (other) {
          var on = other === btn && !open;
          other.classList.remove('me-pulse');
          other.setAttribute('aria-expanded', String(on));
          document.getElementById(other.getAttribute('aria-controls')).hidden = !on;
        });
        if (!open && !seen[i]) { seen[i] = true; btn.classList.add('is-seen'); ctx.save({ seen: seen }); }
      });
    });
    // Completada solo cuando se han desplegado TODOS los hitos.
    return { result: function () {
      return { completed: miles.every(function (_, i) { return !!seen[i]; }), scored: false };
    } };
  });

  // --- 15. Tarjetas de repaso (flashcards) -------------------------------------
  // config.cards: [{ front, back }] (mismo shape que flip_cards). Autoevaluación:
  // una carta cada vez → «Mostrar respuesta» → «¿La sabías?» Sí/No → resumen.
  // No puntúa (scored: false recomendado); guarda el repaso en el estado.
  register('flashcards', function (el, data, ctx) {
    var cards = (data.config || {}).cards || [];
    if (!cards.length) {
      el.innerHTML = header(data);
      return { result: function () { return { completed: true, scored: false }; } };
    }
    var st = ctx.state || {};
    var idx = st.idx || 0;
    var known = st.known || []; // true/false por carta respondida
    if (idx > cards.length) idx = 0;
    // Completada al terminar el repaso una vez; «Repetir repaso» no la des-completa
    // (el flag persiste para no re-bloquear el avance en repasos posteriores).
    var doneOnce = !!st.done || (idx >= cards.length && known.length >= cards.length);

    var html = header(data) + '<div class="me-fc">' +
      '<p class="me-fc-progress" aria-live="polite"></p>' +
      '<div class="me-fc-stage"></div>' +
      '<div class="me-fc-controls"></div></div>';
    el.innerHTML = html;
    var stage = el.querySelector('.me-fc-stage');
    var controls = el.querySelector('.me-fc-controls');
    var progress = el.querySelector('.me-fc-progress');

    function save() { ctx.save({ idx: idx, known: known, done: doneOnce }); }

    function renderSummary() {
      var yes = known.filter(function (k) { return k; }).length;
      progress.textContent = '';
      stage.innerHTML = '<div class="me-fc-summary"><p><strong>' + yes + ' de ' + cards.length +
        '</strong> tarjetas sabidas.</p>' +
        (yes < cards.length ? '<p>Repite el repaso para afianzar las que fallaste.</p>' : '<p>¡Repaso completo!</p>') + '</div>';
      controls.innerHTML = '<button class="me-btn" type="button">↻ Repetir repaso</button>';
      controls.querySelector('button').addEventListener('click', function () {
        idx = 0; known = []; save(); renderCard(false);
      });
    }

    // Pulso-glow solo la primera vez (repaso sin empezar); no vuelve al repetir
    var pulseLeft = !st.idx && !(st.known || []).length;

    function renderCard(revealed) {
      if (idx >= cards.length) { renderSummary(); return; }
      var c = cards[idx];
      progress.textContent = 'Tarjeta ' + (idx + 1) + ' de ' + cards.length;
      stage.innerHTML = '<div class="me-fc-card' + (revealed ? ' is-revealed' : '') +
        (!revealed && idx === 0 && pulseLeft ? ' me-pulse' : '') + '">' +
        '<span class="me-flip-tab" aria-hidden="true"></span>' +
        '<div class="me-fc-front">' + rich(c.front) + '</div>' +
        (revealed ? '<div class="me-fc-back">' + rich(c.back) + '</div>' : '') + '</div>';
      if (!revealed) {
        controls.innerHTML = '<button class="me-btn me-primary" type="button">Mostrar respuesta</button>';
        var show = function () { pulseLeft = false; renderCard(true); };
        controls.querySelector('button').addEventListener('click', show);
        // La lengüeta «+» invita a tocar la carta: el clic también revela
        stage.querySelector('.me-fc-card').addEventListener('click', show);
      } else {
        controls.innerHTML = '<span class="me-fc-ask">¿La sabías?</span>' +
          '<button class="me-btn me-fc-yes" type="button">✔ Sí</button>' +
          '<button class="me-btn me-fc-no" type="button">✖ Aún no</button>';
        controls.querySelector('.me-fc-yes').addEventListener('click', function () { answer(true); });
        controls.querySelector('.me-fc-no').addEventListener('click', function () { answer(false); });
      }
    }
    function answer(knew) {
      known[idx] = knew;
      idx++;
      if (idx >= cards.length) doneOnce = true;
      save();
      if (idx >= cards.length) renderSummary();
      else renderCard(false);
    }

    if (idx >= cards.length && known.length >= cards.length) renderSummary();
    else renderCard(false);

    return { result: function () { return { completed: doneOnce, scored: false }; } };
  });

  // --- 16. HTML a medida (iframe sandbox) ------------------------------------
  // El autor pega HTML+CSS+JS propios (animaciones, interactivos ad hoc).
  // config: { html, css, js, height? } (height en px; sin ella, alto automático).
  // Corre en <iframe sandbox="allow-scripts"> SIN allow-same-origin: origen
  // opaco, así el código NO puede tocar la API SCORM, el estado ni el DOM de la
  // carcasa. La invariante anti-XSS se mantiene porque nada del autor se inyecta
  // en nuestro DOM: viaja escapado dentro del atributo srcdoc.
  register('html_embed', function (el, data, ctx) {
    var c = data.config || {};
    var height = parseInt(c.height, 10) || 0;
    // El código del usuario no debe poder cerrar por accidente su propio
    // <script>/<style> dentro del documento interno.
    function noClose(s, tag) {
      return String(s || '').replace(new RegExp('</' + tag, 'gi'), '<\\/' + tag);
    }
    // Sin alto fijo, el documento interno reporta su altura por postMessage
    // (único canal disponible con origen opaco).
    var resizer = '<script>(function(){var h=0;function post(){var n=document.documentElement.scrollHeight;' +
      'if(n!==h){h=n;parent.postMessage({meEmbed:' + JSON.stringify(String(data.id)) + ',height:n},"*");}}' +
      'if(window.ResizeObserver){new ResizeObserver(post).observe(document.documentElement);}' +
      'else{setInterval(post,600);}window.addEventListener("load",post);post();})();<\/script>';
    var doc = '<!doctype html><html><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<style>html,body{margin:0}' + noClose(c.css, 'style') + '</style></head><body>' +
      String(c.html || '') +
      (c.js ? '<script>' + noClose(c.js, 'script') + '<\/script>' : '') +
      (height ? '' : resizer) + '</body></html>';
    el.innerHTML = header(data) +
      '<iframe class="me-embed" sandbox="allow-scripts" srcdoc="' + esc(doc) + '"' +
      ' title="' + esc(stripTags(data.prompt) || 'Contenido interactivo') + '"' +
      (height ? ' style="height:' + height + 'px"' : '') + '></iframe>';
    if (!height) {
      var frame = el.querySelector('.me-embed');
      var onMsg = function (e) {
        if (!frame.isConnected) { global.removeEventListener('message', onMsg); return; }
        var d = e.data;
        if (!d || d.meEmbed !== String(data.id)) return;
        frame.style.height = Math.max(40, d.height | 0) + 'px';
      };
      global.addEventListener('message', onMsg);
    }
    return { result: function () { return { completed: true, scored: false }; } };
  });

  // --- 17. Tarjetas de imagen (modal texto + imagen) ---------------------------
  // config.cards: [{ image, alt, title, text }]. Informativa: cada tarjeta
  // muestra su imagen (+ título) y al clicarla se abre una modal con el texto a
  // la izquierda y la imagen a la derecha. Mismo lenguaje de affordance que el
  // resto: lengüeta «+», pulso-glow en la primera y check verde al verla.
  register('image_cards', function (el, data, ctx) {
    var cards = (data.config || {}).cards || [];
    var seen = (ctx.state && ctx.state.seen) || {}; // índice -> true (persistido)
    var html = header(data) + '<div class="me-imgcards">';
    cards.forEach(function (c, i) {
      html += '<div class="me-imgcard-wrap">' +
        '<button class="me-imgcard' + (seen[i] ? ' is-seen' : '') + '" type="button" data-i="' + i + '"' +
        (c.title ? '' : ' aria-label="' + esc(stripTags(c.alt || 'Ver detalle')) + '"') + '>' +
        '<span class="me-flip-tab" aria-hidden="true"></span>' +
        (c.image ? '<img src="' + esc(assetUrl(c.image)) + '" alt="' + esc(c.alt || '') + '" loading="lazy">' : '') +
        (c.title ? '<span class="me-imgcard-title">' + rich(c.title) + '</span>' : '') +
        '</button>' +
        // Solo impresión: el texto de la modal, oculto en pantalla (print.css lo muestra)
        '<div class="me-imgcard-print" hidden>' + block(c.text || '') + '</div>' +
        '</div>';
    });
    html += '</div>';
    el.innerHTML = html;
    var btns = [].slice.call(el.querySelectorAll('.me-imgcard'));
    if (!Object.keys(seen).length && btns.length) btns[0].classList.add('me-pulse');

    function openCard(c) {
      var overlay = document.createElement('div');
      overlay.className = 'me-modal me-icmodal';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', stripTags(c.title || c.alt || 'Detalle'));
      overlay.innerHTML = '<div class="me-modal-card me-icmodal-card">' +
        '<div class="me-modal-head"><h2 class="me-modal-title">' + rich(c.title || '') + '</h2>' +
        '<button class="me-modal-close me-icon-btn" aria-label="Cerrar">✕</button></div>' +
        '<div class="me-icmodal-body">' +
        '<div class="me-icmodal-text">' + block(c.text || '') + '</div>' +
        (c.image ? '<figure class="me-icmodal-media"><img class="me-zoomable" src="' + esc(assetUrl(c.image)) +
          '" alt="' + esc(c.alt || '') + '" tabindex="0" role="button" aria-label="Ampliar imagen"></figure>' : '') +
        '</div></div>';
      var last = document.activeElement;
      function close() {
        overlay.remove();
        document.removeEventListener('keydown', onKey);
        if (last && last.focus) last.focus();
      }
      function onKey(e) {
        if (e.key !== 'Escape') return;
        // Con el lightbox abierto encima, Esc cierra solo el lightbox.
        var lb = document.getElementById('me-lightbox');
        if (lb && !lb.hidden) return;
        close();
      }
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay || e.target.closest('.me-modal-close')) close();
      });
      document.addEventListener('keydown', onKey);
      document.body.appendChild(overlay);
      overlay.querySelector('.me-modal-close').focus();
    }

    el.querySelector('.me-imgcards').addEventListener('click', function (e) {
      var btn = e.target.closest('.me-imgcard');
      if (!btn) return;
      var i = +btn.getAttribute('data-i');
      btns.forEach(function (b) { b.classList.remove('me-pulse'); });
      if (!seen[i]) { seen[i] = true; btn.classList.add('is-seen'); ctx.save({ seen: seen }); }
      openCard(cards[i]);
    });

    return { result: function () { return { completed: true, scored: false }; } };
  });

  // --- 18. Antes / después (comparador de imágenes) ---------------------------
  // config: { before_image, before_alt, after_image, after_alt,
  //           before_label?, after_label? }. Informativa: dos imágenes
  // superpuestas; un divisor deslizante (input range accesible) recorta la de
  // «antes» con clip-path. Completa al mover el divisor una vez.
  register('before_after', function (el, data, ctx) {
    var c = data.config || {};
    var labelB = c.before_label || 'Antes';
    var labelA = c.after_label || 'Después';
    var moved = !!(ctx.state && ctx.state.moved);
    var pos = (ctx.state && typeof ctx.state.pos === 'number') ? ctx.state.pos : 50;
    el.innerHTML = header(data) +
      '<div class="me-ba">' +
      '<img class="me-ba-after" src="' + esc(assetUrl(c.after_image)) + '" alt="' + esc(c.after_alt || '') + '">' +
      '<img class="me-ba-before" src="' + esc(assetUrl(c.before_image)) + '" alt="' + esc(c.before_alt || '') + '">' +
      '<span class="me-ba-label me-ba-label-b">' + rich(labelB) + '</span>' +
      '<span class="me-ba-label me-ba-label-a">' + rich(labelA) + '</span>' +
      '<span class="me-ba-divider" aria-hidden="true"><span class="me-ba-handle' + (moved ? '' : ' me-pulse') + '">◂▸</span></span>' +
      '<input class="me-ba-range" type="range" min="0" max="100" step="1" value="' + pos + '"' +
      ' aria-label="' + esc(stripTags(data.prompt) || 'Comparador antes y después') + '">' +
      '</div>' +
      // Solo impresión: ambas imágenes completas con su etiqueta (print.css lo muestra)
      '<div class="me-ba-print" hidden>' +
      '<figure><img src="' + esc(assetUrl(c.before_image)) + '" alt="' + esc(c.before_alt || '') + '"><figcaption>' + rich(labelB) + '</figcaption></figure>' +
      '<figure><img src="' + esc(assetUrl(c.after_image)) + '" alt="' + esc(c.after_alt || '') + '"><figcaption>' + rich(labelA) + '</figcaption></figure>' +
      '</div>';

    var box = el.querySelector('.me-ba');
    var range = el.querySelector('.me-ba-range');
    var handle = el.querySelector('.me-ba-handle');
    function apply(p) {
      // La imagen «antes» se recorta por la derecha; el divisor sigue al valor.
      box.style.setProperty('--me-ba-pos', p + '%');
    }
    apply(pos);
    range.addEventListener('input', function () {
      pos = +range.value;
      apply(pos);
      if (!moved) {
        moved = true;
        handle.classList.remove('me-pulse');
        ctx.announce('Comparador activado: desliza para comparar ambas imágenes.');
      }
      ctx.save({ moved: true, pos: pos });
    });

    return { result: function () { return { completed: moved, scored: false }; } };
  });

  // --- 19. Sopa de letras (word_search) ---------------------------------------
  // config: { words: [string] }. Evaluable opcional y AUTOVALIDANTE: sin botón
  // Comprobar ni attempts — se toca la primera y la última letra de una palabra
  // y se valida al momento (mismo criterio «tocar y colocar» que el drag&drop).
  // El grid se genera DETERMINISTA desde data.id para que la restauración desde
  // suspend_data ({found}) reconstruya exactamente el mismo tablero.
  register('word_search', function (el, data, ctx) {
    // PRNG sembrado (mulberry32) con hash del id: mismo tablero en cada sesión.
    function seedOf(s) {
      var h = 1779033703 ^ s.length;
      for (var i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
      return h >>> 0;
    }
    function mulberry32(a) {
      return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        var t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    // Normaliza para el tablero: mayúsculas, sin acentos (Ñ se conserva), sin espacios.
    var NTILDE = String.fromCharCode(209); // letra enye
    var WSMARK = String.fromCharCode(1);   // marcador interno (nunca visible)
    var DIACRITICS = new RegExp('[' + String.fromCharCode(0x300) + '-' + String.fromCharCode(0x36f) + ']', 'g');
    function norm(w) {
      return String(w || '').toUpperCase()
        .split(NTILDE).join(WSMARK) // aparta la enye para que NFD no la descomponga
        .normalize('NFD').replace(DIACRITICS, '') // quita acentos
        .split(WSMARK).join(NTILDE)
        .replace(new RegExp('[^A-Z' + NTILDE + ']', 'g'), '');
    }

    var rawWords = ((data.config || {}).words || []).map(function (w) { return String(w || '').trim(); }).filter(Boolean);
    var words = [];
    var wordMap = {}; // normalizada -> original (para la lista visible)
    rawWords.forEach(function (w) {
      var n = norm(w);
      if (n.length >= 3 && n.length <= 12 && !wordMap[n]) { words.push(n); wordMap[n] = w; }
    });

    if (!words.length) {
      el.innerHTML = header(data) + '<p class="me-warn">Sopa de letras sin palabras válidas (3–12 letras).</p>';
      return { result: function () { return { completed: true, scored: false }; } };
    }

    var rnd = mulberry32(seedOf(String(data.id)));
    var maxLen = words.reduce(function (m, w) { return Math.max(m, w.length); }, 0);
    var size = Math.max(8, Math.min(14, maxLen, 14));
    size = Math.max(size, Math.min(14, maxLen + 2, Math.ceil(Math.sqrt(words.join('').length * 2.2))));

    // Colocación: 4 direcciones (→ ↓ ↘ ↗), con reintentos; permite cruces
    // compatibles (misma letra en la celda).
    var DIRS = [[0, 1], [1, 0], [1, 1], [-1, 1]];
    var grid = [], placements = {}; // palabra -> [ [r,c], ... ]
    for (var r = 0; r < size; r++) { grid.push([]); for (var q = 0; q < size; q++) grid[r].push(''); }
    // Las largas primero: más difíciles de encajar.
    var toPlace = words.slice().sort(function (a, b) { return b.length - a.length; });
    toPlace.forEach(function (w) {
      for (var att = 0; att < 200; att++) {
        var d = DIRS[Math.floor(rnd() * DIRS.length)];
        var r0 = Math.floor(rnd() * size), c0 = Math.floor(rnd() * size);
        var rEnd = r0 + d[0] * (w.length - 1), cEnd = c0 + d[1] * (w.length - 1);
        if (rEnd < 0 || rEnd >= size || cEnd < 0 || cEnd >= size) continue;
        var cells = [], ok = true;
        for (var k = 0; k < w.length; k++) {
          var rr = r0 + d[0] * k, cc = c0 + d[1] * k;
          if (grid[rr][cc] && grid[rr][cc] !== w[k]) { ok = false; break; }
          cells.push([rr, cc]);
        }
        if (!ok) continue;
        cells.forEach(function (rc, k2) { grid[rc[0]][rc[1]] = w[k2]; });
        placements[w] = cells;
        return;
      }
      // Sin hueco tras 200 intentos: la palabra queda fuera del tablero (y de la
      // lista), para no dejar una palabra imposible de encontrar.
    });
    words = words.filter(function (w) { return placements[w]; });

    // Relleno sesgado a las letras de las propias palabras (dificulta sin frustrar).
    var poolLetters = (words.join('') + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ').split('');
    for (var r2 = 0; r2 < size; r2++) for (var c2 = 0; c2 < size; c2++) {
      if (!grid[r2][c2]) grid[r2][c2] = poolLetters[Math.floor(rnd() * poolLetters.length)];
    }

    var found = (ctx.state && ctx.state.found) || []; // palabras normalizadas
    found = found.filter(function (w) { return placements[w]; });

    var html = header(data) + '<div class="me-ws">' +
      '<div class="me-ws-grid" role="group" aria-label="Tablero de la sopa de letras" style="--me-ws-size:' + size + '">';
    for (var r3 = 0; r3 < size; r3++) for (var c3 = 0; c3 < size; c3++) {
      html += '<button type="button" class="me-ws-cell" data-r="' + r3 + '" data-c="' + c3 + '"' +
        ' aria-label="Fila ' + (r3 + 1) + ', columna ' + (c3 + 1) + ': ' + grid[r3][c3] + '">' + grid[r3][c3] + '</button>';
    }
    html += '</div><ul class="me-ws-words" aria-label="Palabras a encontrar">';
    words.forEach(function (w) {
      html += '<li class="me-ws-word' + (found.indexOf(w) !== -1 ? ' is-found' : '') + '" data-w="' + esc(w) + '">' + esc(wordMap[w]) + '</li>';
    });
    html += '</ul></div>' + feedbackBox(data);
    el.innerHTML = html;

    var cellAt = function (r4, c4) { return el.querySelector('.me-ws-cell[data-r="' + r4 + '"][data-c="' + c4 + '"]'); };
    function markFound(w) {
      (placements[w] || []).forEach(function (rc) { cellAt(rc[0], rc[1]).classList.add('is-found'); });
      var li = el.querySelector('.me-ws-word[data-w="' + w + '"]');
      if (li) li.classList.add('is-found');
    }
    found.forEach(markFound);

    var first = null; // celda inicial seleccionada
    function clearPick() {
      if (first) { first.classList.remove('is-picked'); first = null; }
    }
    function lineBetween(a, b) {
      // Devuelve las celdas de la recta a→b si es horizontal/vertical/diagonal.
      var dr = b.r - a.r, dc = b.c - a.c;
      var len = Math.max(Math.abs(dr), Math.abs(dc)) + 1;
      if (!(dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc))) return null;
      var sr = dr === 0 ? 0 : (dr > 0 ? 1 : -1), sc = dc === 0 ? 0 : (dc > 0 ? 1 : -1);
      var cells = [];
      for (var k = 0; k < len; k++) cells.push([a.r + sr * k, a.c + sc * k]);
      return cells;
    }
    function wordDone() { return words.every(function (w) { return found.indexOf(w) !== -1; }); }

    el.querySelector('.me-ws-grid').addEventListener('click', function (e) {
      var cell = e.target.closest('.me-ws-cell');
      if (!cell || wordDone()) return;
      var pt = { r: +cell.getAttribute('data-r'), c: +cell.getAttribute('data-c') };
      if (!first) {
        first = cell;
        cell.classList.add('is-picked');
        ctx.announce('Letra inicial marcada. Toca la última letra de la palabra.');
        return;
      }
      if (cell === first) { clearPick(); return; }
      var a = { r: +first.getAttribute('data-r'), c: +first.getAttribute('data-c') };
      var cells = lineBetween(a, pt);
      clearPick();
      if (!cells) { ctx.announce('La selección debe ser una línea recta.'); return; }
      var s = cells.map(function (rc) { return grid[rc[0]][rc[1]]; }).join('');
      var rev = s.split('').reverse().join('');
      var hit = null;
      words.forEach(function (w) {
        if (found.indexOf(w) !== -1) return;
        if (w === s || w === rev) hit = w;
      });
      if (hit) {
        found.push(hit);
        markFound(hit);
        ctx.save({ found: found });
        ctx.announce('«' + wordMap[hit] + '» encontrada. ' + (words.length - found.length) + ' restantes.');
        if (wordDone()) showFeedback(el, true, data);
      } else {
        ctx.announce('Ahí no hay ninguna palabra de la lista.');
      }
    });

    if (wordDone()) showFeedback(el, true, data);

    return {
      result: function () {
        var all = wordDone();
        var pts = data.points || 1;
        return {
          completed: all,
          scored: !!data.scored,
          correct: all,
          score: Math.round(pts * (found.length / words.length) * 100) / 100,
          maxScore: pts,
        };
      },
      hasAnswer: function () { return found.length > 0; },
    };
  });

  // Normalización compartida de respuestas/letras: mayúsculas, sin acentos
  // (la enye se preserva), solo A-Z + enye. Misma regla que la sopa de letras.
  var NTILDE = String.fromCharCode(209);
  var normLetters = (function () {
    var MARK = String.fromCharCode(1);
    var DIACRITICS = new RegExp('[' + String.fromCharCode(0x300) + '-' + String.fromCharCode(0x36f) + ']', 'g');
    return function (s) {
      return String(s || '').toUpperCase()
        .split(NTILDE).join(MARK)
        .normalize('NFD').replace(DIACRITICS, '')
        .split(MARK).join(NTILDE)
        .replace(new RegExp('[^A-Z' + NTILDE + '0-9 ]', 'g'), '')
        .replace(/\s+/g, ' ').trim();
    };
  })();
  // PRNG determinista compartido (mismo tablero en cada sesión por id).
  function seededRandom(seedStr) {
    var h = 1779033703 ^ seedStr.length;
    for (var i = 0; i < seedStr.length; i++) { h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    var a = h >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // Tarjeta de pregunta de opción única reutilizable (vídeo interactivo, imagen
  // oculta): pinta enunciado + opciones, 1 intento, feedback, persiste vía cb.
  function questionCard(box, q, prev, fallbackFb, onAnswer) {
    var h = '<div class="me-iv-q" role="group" aria-label="Pregunta">' +
      '<p class="me-iv-prompt">' + rich(q.prompt) + '</p><div class="me-iv-opts">';
    (q.options || []).forEach(function (o, j) {
      h += '<button type="button" class="me-iv-opt' +
        (prev && prev.choice === j ? (prev.correct ? ' is-right' : ' is-wrong') : '') +
        '" data-j="' + j + '"' + (prev ? ' disabled' : '') + '>' + rich(o.text) + '</button>';
    });
    h += '</div><div class="me-iv-fb"' + (prev ? '' : ' hidden') + '></div></div>';
    box.innerHTML = h;
    var fb = box.querySelector('.me-iv-fb');
    function showFb(o, ok) {
      fb.hidden = false;
      fb.className = 'me-iv-fb ' + (ok ? 'is-ok' : 'is-error');
      fb.innerHTML = '<strong>' + (ok ? '✔ ' : '✖ ') + '</strong>' +
        rich(o.feedback || (ok ? (fallbackFb.correct || 'Correcto.') : (fallbackFb.incorrect || 'No es correcto.')));
    }
    if (prev) showFb(q.options[prev.choice] || {}, prev.correct);
    box.querySelector('.me-iv-opts').addEventListener('click', function (e) {
      var btn = e.target.closest('.me-iv-opt');
      if (!btn || btn.disabled) return;
      var j = +btn.getAttribute('data-j');
      var ok = !!q.options[j].correct;
      btn.classList.add(ok ? 'is-right' : 'is-wrong');
      [].slice.call(box.querySelectorAll('.me-iv-opt')).forEach(function (b) { b.disabled = true; });
      showFb(q.options[j], ok);
      onAnswer(j, ok);
    });
  }

  // --- 20. Crucigrama (crossword) ----------------------------------------------
  // config.entries: [{ word, clue }]. Evaluable con Comprobar + intentos (como
  // fill_blanks). El layout se autocalcula con cruces, determinista por id; las
  // palabras sin encaje se descartan (nunca una pista sin casillas).
  register('crossword', function (el, data, ctx) {
    var entries = ((data.config || {}).entries || []).map(function (en) {
      // Solo letras: normLetters conserva dígitos y espacios, aquí sobran.
      return { word: normLetters(en.word || '').replace(/[0-9 ]/g, ''), clue: String(en.clue || '').trim() };
    }).filter(function (en) { return en.word.length >= 3 && en.word.length <= 12 && en.clue; });
    // Dedup
    var seenW = {};
    entries = entries.filter(function (en) { if (seenW[en.word]) return false; seenW[en.word] = 1; return true; });

    if (!entries.length) {
      el.innerHTML = header(data) + '<p class="me-warn">Crucigrama sin palabras válidas (3–12 letras con pista).</p>';
      return { result: function () { return { completed: true, scored: false }; } };
    }

    // Colocación con cruces sobre un grid disperso {'r,c': letra}.
    var grid = {}, placed = [];
    function cellsOf(word, r, c, dr, dc) {
      var cells = [];
      for (var k = 0; k < word.length; k++) cells.push([r + dr * k, c + dc * k]);
      return cells;
    }
    function fits(word, r, c, dr, dc) {
      // Casilla previa y posterior libres (no alargar otra palabra).
      if (grid[(r - dr) + ',' + (c - dc)] != null) return false;
      if (grid[(r + dr * word.length) + ',' + (c + dc * word.length)] != null) return false;
      var crosses = 0;
      for (var k = 0; k < word.length; k++) {
        var rr = r + dr * k, cc = c + dc * k;
        var cur = grid[rr + ',' + cc];
        if (cur != null) {
          if (cur !== word[k]) return false;
          crosses++;
        } else {
          // Sin vecinos laterales (evita palabras pegadas ilegibles).
          if (grid[(rr + dc) + ',' + (cc + dr)] != null) return false;
          if (grid[(rr - dc) + ',' + (cc - dr)] != null) return false;
        }
      }
      return placed.length === 0 || crosses > 0;
    }
    function put(word, clue, r, c, dr, dc) {
      cellsOf(word, r, c, dr, dc).forEach(function (rc, k) { grid[rc[0] + ',' + rc[1]] = word[k]; });
      placed.push({ word: word, clue: clue, r: r, c: c, dr: dr, dc: dc });
    }
    var sorted = entries.slice().sort(function (a, b) { return b.word.length - a.word.length; });
    put(sorted[0].word, sorted[0].clue, 0, 0, 0, 1); // la más larga, horizontal
    sorted.slice(1).forEach(function (en) {
      var w = en.word;
      for (var pi = 0; pi < placed.length; pi++) {
        var p = placed[pi];
        var pdr = p.dr === 0 ? 1 : 0, pdc = p.dc === 0 ? 1 : 0; // perpendicular
        for (var k = 0; k < w.length; k++) {
          for (var m = 0; m < p.word.length; m++) {
            if (p.word[m] !== w[k]) continue;
            var cr = p.r + p.dr * m, cc = p.c + p.dc * m; // celda de cruce
            var r0 = cr - pdr * k, c0 = cc - pdc * k;
            if (fits(w, r0, c0, pdr, pdc)) { put(w, en.clue, r0, c0, pdr, pdc); return; }
          }
        }
      }
      // sin encaje: descartada
    });

    // Bounding box y numeración en orden de lectura.
    var minR = Infinity, minC = Infinity, maxR = -Infinity, maxC = -Infinity;
    Object.keys(grid).forEach(function (key) {
      var p2 = key.split(',');
      minR = Math.min(minR, +p2[0]); maxR = Math.max(maxR, +p2[0]);
      minC = Math.min(minC, +p2[1]); maxC = Math.max(maxC, +p2[1]);
    });
    placed.forEach(function (p) { p.r -= minR; p.c -= minC; });
    var rows = maxR - minR + 1, cols = maxC - minC + 1;
    placed.sort(function (a, b) { return (a.r - b.r) || (a.c - b.c) || (a.dr - b.dr); });
    var numAt = {}, nextNum = 1;
    placed.forEach(function (p) {
      var key = p.r + ',' + p.c;
      if (!numAt[key]) numAt[key] = nextNum++;
      p.num = numAt[key];
    });

    var values = (ctx.state && ctx.state.values) || {}; // 'r,c' -> letra
    var maxAtt = attemptsOf(data);

    var html = header(data) + '<div class="me-cw">' +
      '<div class="me-cw-grid" style="--me-cw-cols:' + cols + '" role="group" aria-label="Casillas del crucigrama">';
    for (var r = 0; r < rows; r++) for (var c2 = 0; c2 < cols; c2++) {
      var key2 = (r + minR) + ',' + (c2 + minC);
      if (grid[key2] == null) { html += '<span class="me-cw-void"></span>'; continue; }
      var k2 = r + ',' + c2;
      html += '<span class="me-cw-box">' + (numAt[k2] ? '<i class="me-cw-num">' + numAt[k2] + '</i>' : '') +
        '<input class="me-cw-cell" maxlength="2" data-k="' + k2 + '" value="' + esc(values[k2] || '') + '"' +
        ' aria-label="Casilla fila ' + (r + 1) + ', columna ' + (c2 + 1) + '"></span>';
    }
    html += '</div><div class="me-cw-clues">';
    ['Horizontales', 'Verticales'].forEach(function (title, v) {
      var list = placed.filter(function (p) { return (v === 0 ? p.dc === 1 : p.dr === 1); });
      if (!list.length) return;
      html += '<p class="me-cw-clues-head">' + title + '</p><ol class="me-cw-clue-list">';
      list.forEach(function (p) {
        html += '<li value="' + p.num + '" data-w="' + esc(p.word) + '">' + rich(p.clue) + ' <span class="me-cw-len">(' + p.word.length + ')</span></li>';
      });
      html += '</ol>';
    });
    html += '</div></div><button class="me-btn me-check">Comprobar</button>' + feedbackBox(data);
    el.innerHTML = html;

    var inputs = [].slice.call(el.querySelectorAll('.me-cw-cell'));
    var attempts = 0, done = false, correct = false;
    var refreshCheck = wireCheck(el, function () {
      return inputs.every(function (inp) { return normLetters(inp.value).length === 1; });
    });
    el.addEventListener('input', function (e) {
      var inp = e.target.closest('.me-cw-cell');
      if (!inp || done) return;
      var ch = normLetters(inp.value).slice(-1);
      inp.value = ch;
      refreshCheck(true);
    });

    function wordOk(p) {
      return cellsOf(p.word, p.r, p.c, p.dr, p.dc).every(function (rc, k) {
        var inp = el.querySelector('.me-cw-cell[data-k="' + rc[0] + ',' + rc[1] + '"]');
        return inp && normLetters(inp.value) === p.word[k];
      });
    }
    function markWords() {
      inputs.forEach(function (inp) { inp.classList.remove('is-right', 'is-wrong'); });
      placed.forEach(function (p) {
        var ok = wordOk(p);
        cellsOf(p.word, p.r, p.c, p.dr, p.dc).forEach(function (rc) {
          var inp = el.querySelector('.me-cw-cell[data-k="' + rc[0] + ',' + rc[1] + '"]');
          // Una casilla de cruce solo se marca bien si TODAS sus palabras lo están.
          if (!ok) inp.classList.add('is-wrong');
          else if (!inp.classList.contains('is-wrong')) inp.classList.add('is-right');
        });
      });
    }
    function okCount() { return placed.filter(wordOk).length; }
    function lock() {
      inputs.forEach(function (inp) { inp.disabled = true; });
      var cb = el.querySelector('.me-check'); if (cb) cb.disabled = true;
    }
    function saveState() {
      var vals = {};
      inputs.forEach(function (inp) { if (inp.value) vals[inp.getAttribute('data-k')] = inp.value; });
      ctx.save({ values: vals, attempts: attempts, correct: correct });
    }
    function hasAnswer() { return inputs.some(function (inp) { return !!inp.value; }); }
    function check() {
      if (done) return { resolved: true, correct: correct };
      if (inputs.some(function (inp) { return !inp.value; })) {
        ctx.announce('Rellena todas las casillas.');
        return { resolved: false, correct: false };
      }
      attempts++;
      correct = okCount() === placed.length;
      markWords();
      showFeedback(el, correct, data);
      done = correct || (maxAtt > 0 && attempts >= maxAtt);
      if (done) lock();
      saveState();
      ctx.announce(correct ? 'Crucigrama correcto.' : okCount() + ' de ' + placed.length + ' palabras correctas.' + (done ? ' Sin más intentos.' : ''));
      return { resolved: done, correct: correct };
    }
    el.querySelector('.me-check').addEventListener('click', check);

    if (ctx.state && typeof ctx.state.correct === 'boolean') {
      attempts = ctx.state.attempts || 0;
      correct = ctx.state.correct;
      markWords();
      showFeedback(el, correct, data);
      if (correct || (maxAtt > 0 && attempts >= maxAtt)) { done = true; lock(); }
    }
    if (!done) refreshCheck(false);

    return {
      result: function () {
        var pts = data.points || 1;
        return {
          completed: done, scored: !!data.scored, correct: correct,
          score: Math.round(pts * (okCount() / placed.length) * 100) / 100,
          maxScore: pts,
        };
      },
      check: check,
      hasAnswer: hasAnswer,
    };
  });

  // --- 21. Imagen oculta (hidden_image) ----------------------------------------
  // config: { image, alt, questions: [{prompt, options}] }. Cada acierto destapa
  // su parte de la imagen (losetas en orden aleatorio determinista); al terminar
  // todas las preguntas la imagen se muestra entera. 1 intento por pregunta.
  register('hidden_image', function (el, data, ctx) {
    var c = data.config || {};
    var questions = (c.questions || []).filter(function (q) {
      return q && String(q.prompt || '').trim() && (q.options || []).length >= 2;
    });
    var answers = (ctx.state && ctx.state.answers) || {}; // idx -> {choice, correct}
    var TILES = 12; // 4x3

    if (!questions.length || !c.image) {
      el.innerHTML = header(data) + '<p class="me-warn">Imagen oculta sin imagen o sin preguntas.</p>';
      return { result: function () { return { completed: true, scored: false }; } };
    }

    var html = header(data) + '<div class="me-hi">' +
      '<div class="me-hi-stage"><img src="' + esc(assetUrl(c.image)) + '" alt="' + esc(c.alt || '') + '">' +
      '<div class="me-hi-tiles" aria-hidden="true">';
    for (var t = 0; t < TILES; t++) html += '<span class="me-hi-tile" data-t="' + t + '"></span>';
    html += '</div></div>' +
      '<p class="me-hi-progress" aria-live="polite"></p>' +
      '<div class="me-hi-q"></div></div>';
    el.innerHTML = html;

    var rnd = seededRandom(String(data.id));
    var order = [];
    for (var i2 = 0; i2 < TILES; i2++) order.push(i2);
    order.sort(function () { return rnd() - 0.5; });

    var qBox = el.querySelector('.me-hi-q');
    var progressEl = el.querySelector('.me-hi-progress');

    function counts() {
      var done2 = 0, ok = 0;
      questions.forEach(function (_, i) { if (answers[i]) { done2++; if (answers[i].correct) ok++; } });
      return { done: done2, ok: ok };
    }
    function refreshTiles() {
      var st = counts();
      var reveal = st.done >= questions.length ? TILES : Math.floor(TILES * (st.ok / questions.length));
      order.forEach(function (tileIdx, pos) {
        var tile = el.querySelector('.me-hi-tile[data-t="' + tileIdx + '"]');
        tile.classList.toggle('is-open', pos < reveal);
      });
      progressEl.textContent = st.done >= questions.length
        ? 'Imagen desvelada: ' + st.ok + ' de ' + questions.length + ' aciertos.'
        : 'Preguntas: ' + st.done + ' de ' + questions.length + ' · cada acierto destapa la imagen.';
    }
    function nextPending() {
      for (var i = 0; i < questions.length; i++) if (!answers[i]) return i;
      return -1;
    }
    function renderCurrent() {
      var i = nextPending();
      refreshTiles();
      if (i === -1) {
        var st = counts();
        qBox.innerHTML = '<p class="me-hi-end">' + (st.ok === questions.length
          ? rich(data.feedback.correct || '¡Imagen desvelada al completo!')
          : 'Actividad terminada: ' + st.ok + ' de ' + questions.length + ' aciertos.') + '</p>';
        return;
      }
      questionCard(qBox, questions[i], null, data.feedback, function (j, ok) {
        answers[i] = { choice: j, correct: ok };
        ctx.save({ answers: answers });
        ctx.announce(ok ? 'Correcto: se destapa parte de la imagen.' : 'Incorrecto.');
        setTimeout(renderCurrent, 1200); // deja leer el feedback antes de avanzar
      });
    }
    renderCurrent();

    return {
      result: function () {
        var st = counts();
        var pts = data.points || 1;
        return {
          completed: st.done >= questions.length,
          scored: !!data.scored,
          correct: st.ok === questions.length,
          score: Math.round(pts * (st.ok / questions.length) * 100) / 100,
          maxScore: pts,
        };
      },
      hasAnswer: function () { return counts().done > 0; },
    };
  });

  // --- 22. Rosco A-Z (az_quiz, tipo pasapalabra) --------------------------------
  // config.items: [{ clue, answer }] — la letra se deriva de la respuesta. El
  // alumno escribe la respuesta o pasa palabra (la letra vuelve en la siguiente
  // vuelta). Autovalidante: sin Comprobar ni attempts; 1 oportunidad por letra.
  register('az_quiz', function (el, data, ctx) {
    var items = ((data.config || {}).items || []).map(function (q) {
      var answer = String(q.answer || '').trim();
      return { clue: String(q.clue || '').trim(), answer: answer, letter: normLetters(answer).charAt(0) };
    }).filter(function (q) { return q.clue && q.answer && q.letter; });
    items.sort(function (a, b) { return a.letter < b.letter ? -1 : a.letter > b.letter ? 1 : 0; });

    if (!items.length) {
      el.innerHTML = header(data) + '<p class="me-warn">Rosco sin definiciones válidas.</p>';
      return { result: function () { return { completed: true, scored: false }; } };
    }

    var res = (ctx.state && ctx.state.res) || {}; // idx -> {given, correct}

    var html = header(data) + '<div class="me-az">' +
      '<div class="me-az-letters" role="group" aria-label="Letras del rosco">';
    items.forEach(function (q, i) {
      html += '<span class="me-az-letter" data-i="' + i + '">' + esc(q.letter) + '</span>';
    });
    html += '</div><div class="me-az-play"></div></div>';
    el.innerHTML = html;

    var playBox = el.querySelector('.me-az-play');
    function chip(i) { return el.querySelector('.me-az-letter[data-i="' + i + '"]'); }
    function refreshChips(currentI) {
      items.forEach(function (_, i) {
        var cEl = chip(i);
        cEl.className = 'me-az-letter' +
          (res[i] ? (res[i].correct ? ' is-right' : ' is-wrong') : '') +
          (i === currentI ? ' is-current' : '');
      });
    }
    function nextPending(from) {
      for (var k = 1; k <= items.length; k++) {
        var i = (from + k) % items.length;
        if (!res[i]) return i;
      }
      return -1;
    }
    var current = res.__last != null ? nextPending(res.__last) : (function () {
      for (var i = 0; i < items.length; i++) if (!res[i]) return i;
      return -1;
    })();

    function counts() {
      var done2 = 0, ok = 0;
      items.forEach(function (_, i) { if (res[i]) { done2++; if (res[i].correct) ok++; } });
      return { done: done2, ok: ok };
    }
    function renderPlay() {
      refreshChips(current);
      if (current === -1) {
        var st = counts();
        playBox.innerHTML = '<p class="me-az-end">Rosco terminado: <strong>' + st.ok + ' de ' + items.length + '</strong> aciertos.</p>';
        return;
      }
      var q = items[current];
      playBox.innerHTML =
        '<p class="me-az-clue"><span class="me-az-starts">Empieza por ' + esc(q.letter) + '</span> ' + rich(q.clue) + '</p>' +
        '<div class="me-az-controls">' +
        '<input class="me-az-input" type="text" autocomplete="off" aria-label="Tu respuesta">' +
        '<button type="button" class="me-btn me-primary me-az-send">Responder</button>' +
        '<button type="button" class="me-btn me-az-pass">Pasapalabra</button></div>' +
        '<div class="me-iv-fb" hidden></div>';
      var input = playBox.querySelector('.me-az-input');
      var fb = playBox.querySelector('.me-iv-fb');
      input.focus();
      function advance() {
        current = nextPending(current);
        renderPlay();
      }
      function answer() {
        var given = input.value.trim();
        if (!given) { ctx.announce('Escribe una respuesta o pulsa Pasapalabra.'); return; }
        var ok = normLetters(given) === normLetters(items[current].answer);
        res[current] = { given: given, correct: ok };
        res.__last = current;
        ctx.save({ res: res });
        fb.hidden = false;
        fb.className = 'me-iv-fb ' + (ok ? 'is-ok' : 'is-error');
        fb.innerHTML = '<strong>' + (ok ? '✔ ' : '✖ ') + '</strong>' +
          (ok ? 'Correcto.' : 'La respuesta era «' + rich(items[current].answer) + '».');
        refreshChips(-1);
        ctx.announce(ok ? 'Correcto.' : 'Incorrecto. La respuesta era ' + items[current].answer + '.');
        playBox.querySelector('.me-az-send').disabled = true;
        playBox.querySelector('.me-az-pass').disabled = true;
        input.disabled = true;
        setTimeout(advance, 1400);
      }
      playBox.querySelector('.me-az-send').addEventListener('click', answer);
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') answer(); });
      playBox.querySelector('.me-az-pass').addEventListener('click', function () {
        ctx.announce('Pasapalabra. La letra ' + items[current].letter + ' volverá después.');
        advance();
      });
    }
    renderPlay();

    return {
      result: function () {
        var st = counts();
        var pts = data.points || 1;
        return {
          completed: st.done >= items.length,
          scored: !!data.scored,
          correct: st.ok === items.length,
          score: Math.round(pts * (st.ok / items.length) * 100) / 100,
          maxScore: pts,
        };
      },
      hasAnswer: function () { return counts().done > 0; },
    };
  });

  // --- 23. Puzzle de imagen ------------------------------------------------------
  // config: { image, alt, cols?, rows? } (def. 3×3). Piezas barajadas de forma
  // determinista; tocar dos piezas las intercambia (mismo criterio accesible
  // «tocar y colocar»). Completa al resolverse.
  register('puzzle', function (el, data, ctx) {
    var c = data.config || {};
    var cols = Math.min(5, Math.max(2, +c.cols || 3));
    var rows = Math.min(5, Math.max(2, +c.rows || 3));
    var n = cols * rows;

    if (!c.image) {
      el.innerHTML = header(data) + '<p class="me-warn">Puzzle sin imagen.</p>';
      return { result: function () { return { completed: true, scored: false }; } };
    }

    var order = (ctx.state && ctx.state.order) || null; // posición -> pieza
    var solvedOnce = !!(ctx.state && ctx.state.solved);
    if (!order || order.length !== n) {
      var rnd = seededRandom(String(data.id));
      order = [];
      for (var i = 0; i < n; i++) order.push(i);
      do {
        order.sort(function () { return rnd() - 0.5; });
      } while (order.every(function (p, i3) { return p === i3; }));
    }

    var html = header(data) + '<div class="me-pz" role="group" aria-label="Puzzle">' +
      '<div class="me-pz-grid" style="--me-pz-cols:' + cols + '; --me-pz-rows:' + rows + '">';
    for (var pos = 0; pos < n; pos++) html += '<button type="button" class="me-pz-piece" data-pos="' + pos + '"></button>';
    html += '</div><p class="me-pz-status" aria-live="polite"></p></div>';
    el.innerHTML = html;

    var gridEl = el.querySelector('.me-pz-grid');
    var statusEl = el.querySelector('.me-pz-status');
    var pieces = [].slice.call(el.querySelectorAll('.me-pz-piece'));
    var url = assetUrl(c.image);

    function paint() {
      pieces.forEach(function (btn, pos2) {
        var piece = order[pos2];
        var pr = Math.floor(piece / cols), pc = piece % cols;
        btn.style.backgroundImage = 'url("' + url + '")';
        btn.style.backgroundPosition = (cols > 1 ? (pc / (cols - 1)) * 100 : 0) + '% ' + (rows > 1 ? (pr / (rows - 1)) * 100 : 0) + '%';
        btn.setAttribute('aria-label', 'Pieza en posición ' + (pos2 + 1));
        btn.classList.toggle('is-home', piece === pos2);
      });
    }
    function solved() { return order.every(function (p, i4) { return p === i4; }); }
    function refreshStatus() {
      var okN = order.filter(function (p, i5) { return p === i5; }).length;
      statusEl.textContent = solved()
        ? '¡Puzzle resuelto!'
        : okN + ' de ' + n + ' piezas en su sitio. Toca dos piezas para intercambiarlas.';
    }

    var picked = -1;
    function finish() {
      gridEl.classList.add('is-solved');
      pieces.forEach(function (b) { b.disabled = true; });
      ctx.announce('Puzzle resuelto.');
    }
    gridEl.addEventListener('click', function (e) {
      var btn = e.target.closest('.me-pz-piece');
      if (!btn || solved()) return;
      var pos3 = +btn.getAttribute('data-pos');
      if (picked === -1) {
        picked = pos3;
        btn.classList.add('is-picked');
        return;
      }
      var a = picked; picked = -1;
      pieces[a].classList.remove('is-picked');
      if (a === pos3) return;
      var tmp = order[a]; order[a] = order[pos3]; order[pos3] = tmp;
      paint();
      refreshStatus();
      if (solved()) { solvedOnce = true; finish(); }
      ctx.save({ order: order, solved: solvedOnce });
    });

    paint();
    refreshStatus();
    if (solved()) finish();

    return {
      result: function () {
        var ok = solvedOnce || solved();
        return {
          completed: ok, scored: !!data.scored, correct: ok,
          score: ok ? (data.points || 1) : 0, maxScore: data.points || 1,
        };
      },
      hasAnswer: function () { return solvedOnce || solved(); },
    };
  });

  // --- 24. Informe de progreso (progress_report) ---------------------------------
  // Panel en vivo del avance del curso: actividades pendientes/correctas con su
  // peso en la nota, test final, nota actual y umbral APTO. Los datos los expone
  // app.js vía ctx.progress() (no hay acceso directo a STATE desde aquí).
  // Informativa: siempre completed, nunca puntúa. Se repinta al entrar en la
  // pantalla, así siempre refleja el estado actual.
  register('progress_report', function (el, data, ctx) {
    if (typeof ctx.progress !== 'function') {
      el.innerHTML = header(data) + '<p class="me-warn">El informe de progreso no está disponible en este contexto.</p>';
      return { result: function () { return { completed: true, scored: false }; } };
    }
    var p = ctx.progress();
    var STATE_LABELS = {
      pending: ['⏳', 'Pendiente', 'is-pending'],
      done: ['✔', 'Hecha', 'is-done'],
      correct: ['✔', 'Correcta', 'is-ok'],
      partial: ['◐', 'Parcial', 'is-partial'],
      incorrect: ['✖', 'Incorrecta', 'is-ko'],
    };

    var pendingCount = p.items.filter(function (it) { return it.state === 'pending' && it.required; }).length;
    if (p.finalRow && !p.finalRow.done) pendingCount++;

    var html = header(data) + '<div class="me-pr">' +
      '<div class="me-pr-hero">' +
      '<div class="me-pr-cell"><span class="me-pr-big">' + p.score + '%</span><span class="me-pr-cap">Nota actual</span></div>' +
      '<div class="me-pr-cell"><span class="me-pr-big">' + p.minScore + '%</span><span class="me-pr-cap">Mínimo para APTO</span></div>' +
      '<div class="me-pr-cell"><span class="me-pr-big">' + p.seenReq + '/' + p.totalReq + '</span><span class="me-pr-cap">Pantallas requeridas vistas</span></div>' +
      '<div class="me-pr-cell"><span class="me-pr-big">' + pendingCount + '</span><span class="me-pr-cap">Actividades pendientes</span></div>' +
      '</div>';

    var rows = p.items.slice();
    if (rows.length || p.finalRow) {
      // Detalle plegado (mismo patrón/clases que el accordion: la impresión lo
      // expande vía setupPrint y print.css muestra .me-acc-body[hidden]).
      var tbl = '<table class="me-pr-table"><thead><tr><th scope="col">Actividad</th><th scope="col">Estado</th>' +
        '<th scope="col">Puntos</th><th scope="col">Peso en la nota</th></tr></thead><tbody>';
      rows.forEach(function (it) {
        var lbl = STATE_LABELS[it.state] || STATE_LABELS.pending;
        tbl += '<tr><th scope="row">' + esc(it.title) + (it.unit ? ' <span class="me-pr-unit">' + esc(it.unit) + '</span>' : '') + '</th>' +
          '<td class="me-pr-state ' + lbl[2] + '">' + lbl[0] + ' ' + lbl[1] + '</td>' +
          '<td>' + (it.scored ? (it.state === 'pending' ? '—' : it.score) + '/' + it.maxScore : '—') + '</td>' +
          '<td>' + (it.weightPct ? it.weightPct + '%' : '—') + '</td></tr>';
      });
      if (p.finalRow) {
        var f = p.finalRow;
        tbl += '<tr class="me-pr-final"><th scope="row">' + esc(f.title) + '</th>' +
          '<td class="me-pr-state ' + (f.done ? 'is-ok' : 'is-pending') + '">' + (f.done ? '✔ Realizado' : '⏳ Pendiente') + '</td>' +
          '<td>' + (f.done ? f.score + '/' + f.maxScore : '—') + '</td>' +
          '<td>' + f.weightPct + '%</td></tr>';
      }
      tbl += '</tbody></table>';
      var foldId = 'me-pr-fold-' + String(data.id).replace(/[^a-zA-Z0-9_-]/g, '');
      html += '<div class="me-fold me-acc-item">' +
        '<button class="me-acc-head" aria-expanded="false" aria-controls="' + foldId + '">' +
        '<span class="me-acc-title">Detalle de actividades (' + (rows.length + (p.finalRow ? 1 : 0)) + ')</span></button>' +
        '<div class="me-acc-body" id="' + foldId + '" role="region" hidden>' + tbl + '</div></div>';
    }

    if (p.source === 'mixed' && p.finalRow) {
      html += '<p class="me-pr-note">La nota combina la práctica (' + (100 - p.finalRow.weightPct) + '%) y el test final (' + p.finalRow.weightPct + '%).</p>';
    } else if (p.source === 'final_test') {
      html += '<p class="me-pr-note">La nota del curso es la del test final; las actividades son práctica y requisito para terminar.</p>';
    }
    html += '</div>';
    el.innerHTML = html;

    var foldHead = el.querySelector('.me-fold > .me-acc-head');
    if (foldHead) {
      foldHead.addEventListener('click', function () {
        var open = foldHead.getAttribute('aria-expanded') === 'true';
        foldHead.setAttribute('aria-expanded', String(!open));
        var body = document.getElementById(foldHead.getAttribute('aria-controls'));
        if (body) body.hidden = open;
      });
    }

    return { result: function () { return { completed: true, scored: false }; } };
  });

  global.Interactions = { register: register, render: function (el, data, ctx) {
    var f = registry[data.type];
    if (!f) { el.innerHTML = '<p class="me-warn">Tipo de interacción no soportado: ' + esc(data.type) + '</p>'; return { result: function () { return { completed: true, scored: false }; } }; }
    return f(el, data, ctx);
  }, esc: esc, rich: rich, stripTags: stripTags, asset: assetUrl };
})(window);
