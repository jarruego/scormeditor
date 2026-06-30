/* =============================================================================
 * app.js — Orquestador de la carcasa SCORM
 * Carga data/course.json, monta menú/contenido, aplica reglas SCORM 1.2,
 * persiste en suspend_data y reanuda sesión. Depende de:
 *   scorm_api.js, accessibility.js, interactions.js, renderer.js
 * ===========================================================================*/
(function (global) {
  'use strict';

  var COURSE = null;
  var SCREENS = [];          // lista plana { unit, screen, isFinalTest }
  var current = 0;
  var startTotalSeconds = 0; // tiempo de sesión acumulado al entrar a la pantalla
  var sessionStart = Date.now();
  var screenEnter = Date.now();
  var activeController = null;

  var STATE = { visited: {}, interactions: {}, results: {}, attempts: 0, finalScore: 0 };

  // Modo autor (previsualización del editor): navegación libre sin restricciones
  // de tiempo mínimo, interacciones obligatorias ni secuencia. En el SCORM real
  // (sin este flag) se aplican todas las reglas configuradas.
  var AUTHOR = !!global.__AUTHOR_MODE__;

  // ---- Carga -------------------------------------------------------------
  function boot() {
    SCORM.initialize();
    restore();
    // Modo previsualización del editor: datos inyectados en memoria.
    if (global.__COURSE_DATA__) { COURSE = global.__COURSE_DATA__; setup(); return; }
    fetch('data/course.json', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (data) { COURSE = data; setup(); })
      .catch(function (e) {
        document.getElementById('me-content').innerHTML = '<p class="me-warn">No se pudo cargar el curso: ' + e + '</p>';
      });
  }

  function restore() {
    var s = SCORM.getSuspend();
    if (s && typeof s === 'object') STATE = Object.assign(STATE, s);
  }
  function persist() {
    SCORM.setSuspend(STATE);
    SCORM.setLocation(String(current));
    SCORM.commit();
  }

  function flatten() {
    SCREENS = [];
    (COURSE.modules || []).forEach(function (m) {
      (m.units || []).forEach(function (u) {
        (u.screens || []).forEach(function (sc) { SCREENS.push({ unit: u, module: m, screen: sc, isFinalTest: false }); });
      });
    });
    if (COURSE.assessments && COURSE.assessments.final_test && (COURSE.assessments.final_test.questions || []).length) {
      SCREENS.push({ unit: null, module: null, screen: { id: '__final__', type: 'final_test', title: COURSE.assessments.final_test.title || 'Test final', required: true }, isFinalTest: true });
    }
  }

  // ---- Setup UI ----------------------------------------------------------
  function setup() {
    flatten();
    applyBranding();
    buildMenu();
    bindChrome();
    var rules = COURSE.scorm.rules || {};
    if (rules.allow_resume) {
      var loc = parseInt(SCORM.getLocation(), 10);
      if (!isNaN(loc) && loc >= 0 && loc < SCREENS.length) current = loc;
    }
    // En modo autor (Vista estudiante) arranca en la diapositiva activa del editor.
    if (AUTHOR && global.__START_SCREEN_ID__) {
      for (var si = 0; si < SCREENS.length; si++) {
        if (SCREENS[si].screen && SCREENS[si].screen.id === global.__START_SCREEN_ID__) { current = si; break; }
      }
    }
    if (SCORM.getStatus() === 'not attempted') SCORM.setStatus('incomplete');
    // En móvil el menú lateral arranca cerrado para no tapar el contenido.
    if (isMobile()) {
      document.getElementById('me-app').classList.add('me-menu-hidden');
      document.getElementById('me-toggle-menu').setAttribute('aria-expanded', 'false');
    }
    goTo(current, true);
  }

  function isMobile() { return global.matchMedia && global.matchMedia('(max-width: 760px)').matches; }
  function closeMenuIfMobile() {
    if (isMobile()) {
      document.getElementById('me-app').classList.add('me-menu-hidden');
      document.getElementById('me-toggle-menu').setAttribute('aria-expanded', 'false');
    }
  }

  function applyBranding() {
    var shell = COURSE.shell || {};
    if (shell.primary_color) document.documentElement.style.setProperty('--me-primary', shell.primary_color);
    document.getElementById('me-brand').textContent = shell.brand || COURSE.course.title || 'Curso';
    document.getElementById('me-course-title').textContent = COURSE.course.title || '';
    document.title = COURSE.course.title || 'Curso SCORM';
    document.documentElement.lang = (shell.language || COURSE.course.language || 'es');
  }

  function buildMenu() {
    var nav = document.getElementById('me-menu');
    var html = '';
    var idx = 0;
    (COURSE.modules || []).forEach(function (m) {
      html += '<div class="me-menu-module"><p class="me-menu-mtitle">' + esc(m.title) + '</p>';
      (m.units || []).forEach(function (u) {
        html += '<div class="me-menu-unit"><p class="me-menu-utitle">' + esc(u.title) + '</p><ul>';
        (u.screens || []).forEach(function (sc) {
          html += '<li><button class="me-menu-link" data-idx="' + idx + '">' + esc(sc.title || sc.type) +
            '<span class="me-menu-check" aria-hidden="true"></span></button></li>';
          idx++;
        });
        html += '</ul></div>';
      });
      html += '</div>';
    });
    if (SCREENS.length && SCREENS[SCREENS.length - 1].isFinalTest) {
      html += '<div class="me-menu-unit"><ul><li><button class="me-menu-link" data-idx="' + (SCREENS.length - 1) + '">' +
        esc(SCREENS[SCREENS.length - 1].screen.title) + '<span class="me-menu-check" aria-hidden="true"></span></button></li></ul></div>';
    }
    nav.innerHTML = html;
    nav.addEventListener('click', function (e) {
      var b = e.target.closest('.me-menu-link'); if (!b) return;
      var target = parseInt(b.getAttribute('data-idx'), 10);
      if (canNavigateTo(target)) { goTo(target); closeMenuIfMobile(); }
      else A11Y.announce('Esa pantalla aún no está disponible. Completa las anteriores.');
    });
  }

  function bindChrome() {
    document.getElementById('me-prev').addEventListener('click', function () { goRelative(-1); });
    document.getElementById('me-next').addEventListener('click', function () { goRelative(1); });
    document.getElementById('me-toggle-menu').addEventListener('click', toggleMenu);
    document.getElementById('me-btn-transcript').addEventListener('click', toggleTranscript);
    document.getElementById('me-btn-print').addEventListener('click', function () { window.print(); });
    document.getElementById('me-btn-glossary').addEventListener('click', function () { openModal('glossary'); });
    document.getElementById('me-btn-resources').addEventListener('click', function () { openModal('resources'); });
    document.getElementById('me-btn-help').addEventListener('click', function () { openModal('help'); });
    document.querySelectorAll('.me-modal-close').forEach(function (b) { b.addEventListener('click', closeModals); });
    A11Y.bindShortcuts({ next: function () { goRelative(1); }, prev: function () { goRelative(-1); }, menu: toggleMenu, transcript: toggleTranscript });
    global.addEventListener('beforeunload', function () { finishSession(); });
    setupLightbox();
  }

  // Ampliación de imágenes (lightbox) accesible. Funciona por delegación, así
  // que cubre cualquier imagen .me-zoomable renderada en cada pantalla.
  function setupLightbox() {
    if (document.getElementById('me-lightbox')) return;
    var lb = document.createElement('div');
    lb.id = 'me-lightbox';
    lb.className = 'me-lightbox';
    lb.hidden = true;
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Imagen ampliada');
    lb.innerHTML = '<button class="me-lightbox-close" aria-label="Cerrar (Esc)">✕</button><img class="me-lightbox-img" alt="">';
    document.body.appendChild(lb);
    var img = lb.querySelector('.me-lightbox-img');
    var lastFocus = null;

    function open(src, alt) {
      lastFocus = document.activeElement;
      img.src = src; img.alt = alt || '';
      lb.hidden = false;
      lb.querySelector('.me-lightbox-close').focus();
    }
    function close() {
      lb.hidden = true; img.removeAttribute('src');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.classList.contains('me-lightbox-close')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (!lb.hidden && e.key === 'Escape') close();
      else if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('me-zoomable')) {
        e.preventDefault(); open(e.target.getAttribute('src'), e.target.getAttribute('alt'));
      }
    });
    document.addEventListener('click', function (e) {
      var z = e.target.closest && e.target.closest('.me-zoomable');
      if (z) open(z.getAttribute('src'), z.getAttribute('alt'));
    });
  }

  // ---- Navegación --------------------------------------------------------
  function canNavigateTo(target) {
    if (AUTHOR) return true;
    var nav = (COURSE.scorm.rules || {}).navigation || 'mixed';
    if (nav === 'free') return true;
    if (target <= current) return true;            // volver atrás siempre
    if (nav === 'mixed') {
      // permitido si todas las pantallas previas obligatorias están "ok"
      for (var i = 0; i < target; i++) if (isRequired(i) && !screenSatisfied(i)) return false;
      return true;
    }
    // sequential: solo la siguiente y si la actual está satisfecha
    return target === current + 1 && screenSatisfied(current);
  }

  function goRelative(delta) {
    var t = current + delta;
    if (t < 0 || t >= SCREENS.length) return;
    if (delta > 0 && !AUTHOR && !screenSatisfied(current)) { A11Y.announce(blockReason(current)); return; }
    if (!canNavigateTo(t)) { A11Y.announce('Pantalla no disponible todavía.'); return; }
    goTo(t);
  }

  function goTo(idx, isRestore) {
    saveTime();
    if (activeController) activeController = null;
    current = idx;
    screenEnter = Date.now();
    var entry = SCREENS[idx];
    // En modo autor avisa al editor de la pantalla actual, para que al volver a
    // la pestaña «Editar» se sitúe en la misma diapositiva (test final excluido).
    if (AUTHOR && entry.screen && !entry.isFinalTest && global.parent && global.parent !== global) {
      try { global.parent.postMessage({ type: 'me-screen-change', screenId: entry.screen.id }, '*'); } catch (e) {}
    }
    var content = document.getElementById('me-content');

    if (entry.isFinalTest) {
      renderFinalTest(content, entry.screen);
    } else {
      var sc = entry.screen;
      var ctx = {
        state: (STATE.interactions[sc.interaction ? sc.interaction.id : ''] || null),
        save: function (st) {
          if (!sc.interaction) return;
          STATE.interactions[sc.interaction.id] = st;
          var r = activeController ? activeController.result() : null;
          if (r) STATE.results[sc.interaction.id] = r;
          recomputeAndPersist();
          refreshNavState();
        },
        announce: A11Y.announce,
      };
      var rendered = Renderer.render(content, sc, ctx);
      activeController = rendered.interaction;
      // Captura el estado inicial: las interacciones informativas (accordion,
      // tabs, flip_cards, video, case_practice...) se consideran completadas al
      // renderizarse y nunca llaman a ctx.save. Las evaluables devuelven
      // completed:false hasta que el usuario las resuelve. No se sobrescribe un
      // resultado ya guardado (reanudación de sesión).
      if (activeController && sc.interaction && !STATE.results[sc.interaction.id]) {
        STATE.results[sc.interaction.id] = activeController.result();
      }
    }

    markVisited(idx);
    updateProgress();
    refreshMenuChecks();
    refreshNavState();
    document.getElementById('me-position').textContent = (idx + 1) + ' / ' + SCREENS.length;
    if (!isRestore) A11Y.focusMain();
    recomputeAndPersist();
    startMinTimer();
  }

  function startMinTimer() {
    refreshNavState();
    var entry = SCREENS[current];
    var min = entry.isFinalTest ? 0 : (entry.screen.min_time_seconds || 0);
    if (min > 0) {
      setTimeout(function () { refreshNavState(); }, min * 1000 + 100);
    }
  }

  // ---- Reglas de "pantalla satisfecha" -----------------------------------
  function isRequired(idx) {
    var e = SCREENS[idx];
    return e.isFinalTest ? true : !!e.screen.required;
  }
  function minTimeOk(idx) {
    var e = SCREENS[idx];
    if (e.isFinalTest) return true;
    var min = e.screen.min_time_seconds || 0;
    if (min <= 0) return true;
    if (idx !== current) return true; // ya pasada
    return (Date.now() - screenEnter) / 1000 >= min;
  }
  function interactionOk(idx) {
    var e = SCREENS[idx];
    if (e.isFinalTest) return !!STATE.results.__final__;
    var sc = e.screen;
    if (!sc.interaction) return true;
    if (!(COURSE.scorm.rules || {}).require_interactions) return true;
    var r = STATE.results[sc.interaction.id];
    return !!(r && r.completed);
  }
  function screenSatisfied(idx) {
    if (!isRequired(idx)) return true;
    return minTimeOk(idx) && interactionOk(idx);
  }
  function blockReason(idx) {
    if (!minTimeOk(idx)) return 'Permanece un poco más en esta pantalla antes de continuar.';
    if (!interactionOk(idx)) return 'Completa la actividad de esta pantalla para continuar.';
    return 'Pantalla no disponible.';
  }

  function markVisited(idx) {
    var e = SCREENS[idx];
    STATE.visited[e.screen.id] = true;
  }

  // ---- Progreso y finalización -------------------------------------------
  function requiredScreens() {
    return SCREENS.filter(function (_, i) { return isRequired(i) && SCREENS[i].screen.scorm && SCREENS[i].screen.scorm.counts_for_completion !== false; });
  }
  function updateProgress() {
    var total = SCREENS.length;
    var visited = SCREENS.filter(function (e) { return STATE.visited[e.screen.id]; }).length;
    var pct = total ? Math.round((visited / total) * 100) : 0;
    var bar = document.getElementById('me-progress-bar');
    bar.style.width = pct + '%';
    bar.parentElement.setAttribute('aria-valuenow', String(pct));
    document.getElementById('me-progress-label').textContent = pct + '%';
  }

  function computeScore() {
    var rules = COURSE.scorm.rules || {};
    var src = rules.score_source || 'final_test';
    var got = 0, max = 0;
    function addResult(r) { if (r && r.scored) { got += r.score || 0; max += r.maxScore || 0; } }
    if (src === 'final_test') {
      var fr = STATE.results.__final__;
      if (fr) { got = fr.score; max = fr.maxScore; }
    } else if (src === 'unit_tests') {
      SCREENS.forEach(function (e) { if (!e.isFinalTest && e.screen.interaction) addResult(STATE.results[e.screen.interaction.id]); });
    } else { // mixed
      SCREENS.forEach(function (e) { if (!e.isFinalTest && e.screen.interaction) addResult(STATE.results[e.screen.interaction.id]); });
      var f = STATE.results.__final__; if (f) { got += f.score; max += f.maxScore; }
    }
    return max > 0 ? Math.round((got / max) * 100) : 0;
  }

  function evaluateCompletion() {
    var rules = COURSE.scorm.rules || {};
    var req = requiredScreens();
    var seenReq = req.filter(function (e) { return STATE.visited[e.screen.id]; }).length;
    var pctSeen = req.length ? (seenReq / req.length) * 100 : 100;
    var screensOk = pctSeen >= (rules.min_required_screens_pct || 100);

    var interactionsOk = true;
    if (rules.require_interactions) {
      SCREENS.forEach(function (e, i) {
        if (!e.isFinalTest && isRequired(i) && e.screen.interaction) {
          var r = STATE.results[e.screen.interaction.id];
          if (!(r && r.completed)) interactionsOk = false;
        }
      });
    }

    var score = computeScore();
    STATE.finalScore = score;
    var hasScoredContent = (function () {
      if ((rules.score_source) === 'final_test') return !!(COURSE.assessments && COURSE.assessments.final_test && COURSE.assessments.final_test.questions.length);
      return SCREENS.some(function (e) { return e.screen.interaction && e.screen.interaction.scored; });
    })();
    var scoreOk = !hasScoredContent || score >= (rules.min_score || 0);

    SCORM.setScore(score, 0, 100);

    var status;
    if (!screensOk || !interactionsOk) status = 'incomplete';
    else if (hasScoredContent) status = scoreOk ? 'passed' : 'failed';
    else status = 'completed';
    SCORM.setStatus(status);
    return status;
  }

  function recomputeAndPersist() {
    evaluateCompletion();
    persist();
  }

  // ---- Chrome / paneles --------------------------------------------------
  function toggleMenu() {
    var app = document.getElementById('me-app');
    app.classList.toggle('me-menu-hidden');
    var btn = document.getElementById('me-toggle-menu');
    btn.setAttribute('aria-expanded', String(!app.classList.contains('me-menu-hidden')));
  }
  function toggleTranscript() {
    var entry = SCREENS[current];
    var t = entry && !entry.isFinalTest ? entry.screen.transcript : '';
    if (!t) { A11Y.announce('Esta pantalla no tiene transcripción.'); return; }
    openModalHtml('Transcripción', '<div class="me-prose">' + Renderer.mdToHtml(t) + '</div>');
  }
  function openModal(which) {
    if (which === 'glossary') {
      var g = (COURSE.glossary || []).map(function (t) { return '<dt>' + esc(t.term) + '</dt><dd>' + esc(t.definition) + '</dd>'; }).join('');
      openModalHtml('Glosario', g ? '<dl class="me-glossary">' + g + '</dl>' : '<p>Glosario vacío.</p>');
    } else if (which === 'resources') {
      var b = (COURSE.bibliography || []).map(function (e) {
        return '<li>' + esc(e.ref) + (e.url ? ' — <a href="' + esc(e.url) + '" target="_blank" rel="noopener">enlace</a>' : '') + '</li>';
      }).join('');
      openModalHtml('Recursos y bibliografía', b ? '<ul>' + b + '</ul>' : '<p>Sin recursos.</p>');
    } else if (which === 'help') {
      openModalHtml('Ayuda', '<ul><li><strong>Alt + →</strong> Siguiente</li><li><strong>Alt + ←</strong> Anterior</li><li><strong>Alt + M</strong> Menú</li><li><strong>Alt + T</strong> Transcripción</li></ul><p>Usa Tab para navegar por los controles.</p>');
    }
  }
  function openModalHtml(title, bodyHtml) {
    var modal = document.getElementById('me-modal');
    modal.querySelector('.me-modal-title').textContent = title;
    modal.querySelector('.me-modal-body').innerHTML = bodyHtml;
    modal.hidden = false;
    modal.querySelector('.me-modal-close').focus();
  }
  function closeModals() { document.getElementById('me-modal').hidden = true; A11Y.focusMain(); }

  function refreshNavState() {
    var prev = document.getElementById('me-prev');
    var next = document.getElementById('me-next');
    prev.disabled = current <= 0;
    var last = current >= SCREENS.length - 1;
    next.disabled = last || (!AUTHOR && !screenSatisfied(current));
    next.textContent = last ? 'Fin' : 'Siguiente ▸';
  }
  function refreshMenuChecks() {
    document.querySelectorAll('.me-menu-link').forEach(function (b) {
      var i = parseInt(b.getAttribute('data-idx'), 10);
      var e = SCREENS[i];
      var done = STATE.visited[e.screen.id] && screenSatisfied(i);
      b.classList.toggle('is-done', !!done);
      b.classList.toggle('is-current', i === current);
      var chk = b.querySelector('.me-menu-check');
      if (chk) chk.textContent = done ? '✓' : '';
    });
  }

  // ---- Test final --------------------------------------------------------
  function renderFinalTest(content, screen) {
    var test = COURSE.assessments.final_test;
    var saved = STATE.finalAnswers || {};
    var allowed = (COURSE.scorm.rules || {}).attempts_allowed || 0;
    var attemptsUsed = STATE.attempts || 0;
    var exhausted = allowed > 0 && attemptsUsed >= allowed;

    var html = '<article class="me-screen"><h1>' + esc(screen.title) + '</h1>' +
      '<p class="me-instructions">Responde a todas las preguntas y pulsa «Enviar test».' +
      (allowed > 0 ? ' Intentos: ' + Math.min(attemptsUsed, allowed) + '/' + allowed + '.' : '') + '</p><form id="me-final">';
    (test.questions || []).forEach(function (q, qi) {
      html += '<fieldset class="me-q"><legend>' + (qi + 1) + '. ' + rich(q.prompt) + '</legend>';
      (q.options || []).forEach(function (o) {
        var checked = saved[q.id] === o.id ? ' checked' : '';
        html += '<label class="me-choice"><input type="radio" name="q-' + esc(q.id) + '" value="' + esc(o.id) + '"' + checked + (exhausted ? ' disabled' : '') + '> <span>' + rich(o.text) + '</span></label>';
      });
      html += '<div class="me-feedback" data-q="' + esc(q.id) + '" role="status" aria-live="polite" hidden></div></fieldset>';
    });
    html += '<button type="submit" class="me-btn me-primary"' + (exhausted ? ' disabled' : '') + '>Enviar test</button>' +
      '</form><div id="me-final-result" aria-live="polite"></div></article>';
    content.innerHTML = html;

    // Pinta el feedback por pregunta y la nota a partir de un mapa de respuestas.
    function paint(answers) {
      var got = 0, max = 0;
      (test.questions || []).forEach(function (q) {
        max += q.points || 1;
        var chosen = answers[q.id];
        var box = content.querySelector('.me-feedback[data-q="' + q.id + '"]');
        if (chosen != null) {
          var opt = (q.options || []).filter(function (o) { return o.id === chosen; })[0];
          var ok = !!(opt && opt.correct);
          if (ok) got += q.points || 1;
          box.className = 'me-feedback ' + (ok ? 'is-ok' : 'is-error');
          box.innerHTML = '<strong>' + (ok ? '✔ ' : '✖ ') + rich(ok ? q.feedback.correct : q.feedback.incorrect) + '</strong>' +
            (q.feedback.explanation ? '<p class="me-expl">' + rich(q.feedback.explanation) + '</p>' : '');
          box.hidden = false;
        }
      });
      var score = max ? Math.round((got / max) * 100) : 0;
      var pass = score >= (test.pass_score || 60);
      document.getElementById('me-final-result').innerHTML =
        '<div class="me-feedback ' + (pass ? 'is-ok' : 'is-error') + '"><strong>Puntuación: ' + score + '% — ' + (pass ? 'APTO' : 'NO APTO') + '</strong></div>';
      return { got: got, max: max, score: score, pass: pass };
    }

    // Restaura el resultado si ya se había enviado (mismo intento u otra sesión).
    if (STATE.results.__final__ && Object.keys(saved).length) paint(saved);

    document.getElementById('me-final').addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (exhausted) return;
      var answers = {}, answered = 0;
      (test.questions || []).forEach(function (q) {
        var sel = content.querySelector('input[name="q-' + q.id + '"]:checked');
        if (sel) { answers[q.id] = sel.value; answered++; }
      });
      if (answered < (test.questions || []).length) { A11Y.announce('Responde a todas las preguntas.'); return; }

      var res = paint(answers);
      STATE.attempts = attemptsUsed = (STATE.attempts || 0) + 1;
      STATE.finalAnswers = answers;
      STATE.results.__final__ = { completed: true, scored: true, correct: res.pass, score: res.got, maxScore: res.max };
      A11Y.announce('Puntuación ' + res.score + ' por ciento. ' + (res.pass ? 'Apto.' : 'No apto.'));

      if (allowed > 0 && attemptsUsed >= allowed) {
        content.querySelector('button[type=submit]').disabled = true;
        content.querySelectorAll('#me-final input').forEach(function (i) { i.disabled = true; });
      }
      recomputeAndPersist();
      refreshMenuChecks();
      refreshNavState();
    });
  }

  // ---- Tiempo / cierre ---------------------------------------------------
  function saveTime() {}
  function finishSession() {
    var secs = Math.round((Date.now() - sessionStart) / 1000);
    SCORM.setSessionTime(secs);
    evaluateCompletion();
    SCORM.finish();
  }

  var esc = function (s) { return global.Interactions.esc(s); };
  var rich = function (s) { return global.Interactions.rich(s); };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
