/* =============================================================================
 * state_codec.js — Codec v2 de cmi.suspend_data (posicional, compacto)
 *
 * Sustituye el JSON.stringify(STATE) plano (que en un curso grande supera con
 * facilidad el límite de 4096 caracteres de SCORM 1.2) por una codificación
 * por POSICIÓN: en vez de guardar ids largos, cada dato se guarda en el hueco
 * que le corresponde según el orden de pantallas/interacciones/preguntas del
 * curso empaquetado, y se reinterpreta contra la config ACTUAL al decodificar.
 *
 * API: encode(STATE, course) -> string ; decode(raw, course, layouts) -> STATE
 * ; encodeWithBudget(STATE, course, limit=4096) -> { raw, fits, degraded,
 * size, breakdown } (degrada el detalle ya redundante hasta que quepa, ver
 * degradeDetail más abajo; la usa app.js en persist()).
 * STATE es el MISMO objeto que usa app.js (visited/interactions/results/
 * attempts/finalScore/finalAnswers) — este módulo no cambia ese contrato,
 * solo cómo se serializa.
 *
 * Formato del string: "2|" + huella(6) + "|" + 7 segmentos autodelimitados
 * por longitud (packChunks/unpackChunks: "<len>:<contenido>", sin límite de
 * caracteres dentro del contenido — no se rompe el troceado pase lo que pase
 * dentro). Si el string no empieza por "2|", se trata como el formato antiguo
 * (JSON.stringify(STATE) por ids) y se migra sin pérdida, porque ese formato
 * ya tenía exactamente el shape de STATE.
 *
 * La huella es un hash corto del orden de ids de pantallas/interacciones/
 * preguntas del test final tal como está empaquetado el curso. decode() no
 * distingue "huella igual" de "huella distinta pero conocida": en ambos
 * casos resuelve una lista de referencia (ids de pantallas, {id,type} de
 * interacciones, ids de preguntas) — la del curso ACTUAL si la huella
 * coincide, o la de la entrada de `layouts` (historial de estructuras
 * publicadas, ver course.schema.ts `scorm.layouts`) que coincida si no — y
 * decodifica cada posición contra esa lista: si el id ya no existe en el
 * curso actual, o su tipo cambió, se descarta (nunca se aplican datos
 * desplazados); si sigue existiendo con el mismo tipo, se decodifica con el
 * decoder de ese tipo contra la config ACTUAL (la validación de la Fase 1).
 * Huella desconocida (ni coincide ni está en `layouts`) → se descarta todo lo
 * posicional (visited/interactions/results/finalAnswers) pero se conservan
 * attempts y finalScore, que no dependen de la posición, y se registra un
 * aviso en consola.
 *
 * Convención del proyecto: los ficheros de src/runtime/assets/js/ son scripts
 * planos que se cargan con <script src> (no hay bundler en el paquete SCORM),
 * así que este fichero sigue el mismo patrón que sus hermanos
 * (interactions.js, app.js…): una IIFE que cuelga un único global. El editor
 * (TypeScript, sin `allowJs`) no puede hacer `import` directo de un .js
 * plano — para reutilizar esta lógica en Node/TS, la forma que ya usa este
 * repo (ver scripts/test-md-dialect.ts) es evaluar el texto crudo del
 * fichero en un sandbox de `vm` con un objeto `window`, exactamente igual que
 * para interactions.js/renderer.js. scripts/test-state-codec.ts hace eso.
 * ===========================================================================*/
(function (global) {
  'use strict';

  // ---- Utilidades base --------------------------------------------------

  var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

  function packBits(bits) {
    var out = '';
    for (var i = 0; i < bits.length; i += 6) {
      var v = 0;
      for (var j = 0; j < 6; j++) v = (v << 1) | (bits[i + j] ? 1 : 0);
      out += B64.charAt(v);
    }
    return out;
  }
  function unpackBits(str) {
    var bits = [];
    for (var i = 0; i < str.length; i++) {
      var v = B64.indexOf(str.charAt(i));
      if (v < 0) v = 0;
      for (var j = 5; j >= 0; j--) bits.push((v >> j) & 1);
    }
    return bits;
  }

  function b36(n) {
    n = Math.round(n || 0);
    if (n < 0) n = 0;
    return n.toString(36);
  }
  function fromB36(s) {
    var n = parseInt(s, 36);
    return isNaN(n) ? 0 : n;
  }

  // Segmentos autodelimitados por longitud: "<len_base36>:<contenido>"
  // concatenados. No usa caracteres delimitadores dentro del contenido (se
  // trocea por longitud, no por escaneo), así que cualquier contenido —
  // incluidos '|', ':' o Unicode — es seguro. Es la pieza que permite trocear
  // el estado en "segmento nº k" sin conocer su tipo ni su config (ver
  // scripts/test-state-codec.ts, prueba de troceado ciego).
  function packChunks(arr) {
    var out = '';
    for (var i = 0; i < arr.length; i++) {
      var s = String(arr[i]);
      out += s.length.toString(36) + ':' + s;
    }
    return out;
  }
  function unpackChunks(str) {
    var out = [];
    var i = 0;
    var n = str.length;
    while (i < n) {
      var colon = str.indexOf(':', i);
      if (colon < 0) return null;
      var len = parseInt(str.slice(i, colon), 36);
      if (isNaN(len) || len < 0) return null;
      var start = colon + 1;
      var end = start + len;
      if (end > n) return null;
      out.push(str.slice(start, end));
      i = end;
    }
    return out;
  }

  // Escapa cualquier carácter fuera de ASCII imprimible (y el propio '~',
  // que es el marcador de escape) como "~" + 4 dígites hex. Solo hace falta
  // en los pocos puntos donde puede viajar texto libre real: lo que escribe
  // el alumno en az_quiz, el JSON de estado de html_embed y el fallback JSON
  // genérico. El resto del formato son índices/ids ya ASCII por construcción.
  function asciiEscape(s) {
    var out = '';
    var str = String(s);
    for (var i = 0; i < str.length; i++) {
      var code = str.charCodeAt(i);
      var ch = str.charAt(i);
      if (ch === '~' || code < 0x20 || code > 0x7e) {
        var h = code.toString(16);
        while (h.length < 4) h = '0' + h;
        out += '~' + h;
      } else {
        out += ch;
      }
    }
    return out;
  }
  function asciiUnescape(s) {
    var out = '';
    for (var i = 0; i < s.length; i++) {
      if (s.charAt(i) === '~' && i + 4 < s.length) {
        var code = parseInt(s.substr(i + 1, 4), 16);
        if (!isNaN(code)) {
          out += String.fromCharCode(code);
          i += 4;
          continue;
        }
      }
      out += s.charAt(i);
    }
    return out;
  }

  function indexOfById(arr, id) {
    for (var i = 0; i < arr.length; i++) if (arr[i] && arr[i].id === id) return i;
    return -1;
  }

  function hash32(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return h >>> 0;
  }

  // ---- Estructura del curso: mismo orden que flatten() en app.js ---------

  function flattenScreens(course) {
    var out = [];
    (course.intro_screens || []).forEach(function (sc) { out.push(sc); });
    (course.modules || []).forEach(function (m) {
      (m.screens || []).forEach(function (sc) { out.push(sc); });
      (m.units || []).forEach(function (u) {
        (u.screens || []).forEach(function (sc) { out.push(sc); });
      });
      (m.closing_screens || []).forEach(function (sc) { out.push(sc); });
    });
    var hasFinal = !!(course.assessments && course.assessments.final_test &&
      (course.assessments.final_test.questions || []).length);
    if (hasFinal) out.push({ id: '__final__', __synthetic: true });
    var hasScoredInter = out.some(function (sc) { return sc.interaction && sc.interaction.scored; });
    if (hasFinal || hasScoredInter) out.push({ id: '__results__', __synthetic: true });
    (course.closing_screens || []).forEach(function (sc) { out.push(sc); });
    return out;
  }

  function collectInteractions(screens) {
    var out = [];
    for (var i = 0; i < screens.length; i++) {
      var sc = screens[i];
      if (!sc.__synthetic && sc.interaction) {
        out.push({ id: sc.interaction.id, type: sc.interaction.type, interaction: sc.interaction });
      }
    }
    return out;
  }

  function finalQuestions(course) {
    return (course.assessments && course.assessments.final_test && course.assessments.final_test.questions) || [];
  }

  function fingerprint(screens, interactions, finalQs) {
    var parts = [];
    var i;
    for (i = 0; i < screens.length; i++) parts.push(screens[i].id);
    parts.push('|');
    for (i = 0; i < interactions.length; i++) parts.push(interactions[i].id + ':' + interactions[i].type);
    parts.push('|');
    for (i = 0; i < finalQs.length; i++) parts.push(finalQs[i].id);
    var s = hash32(parts.join(',')).toString(36);
    while (s.length < 6) s = '0' + s;
    return s.slice(-6);
  }

  // ---- Codec compacto por tipo de interacción ----------------------------
  // Cada entrada: encode(detalle, interaction) -> string | null (null = no se
  // puede codificar de forma compacta, se usa el fallback JSON genérico),
  // decode(payload, interaction) -> objeto de detalle | null (null = el
  // segmento no encaja con la config actual, se descarta SOLO el detalle,
  // el result ya decodificado aparte se conserva).

  var TYPE_CODECS = {};

  // accordion/tabs/flip_cards/timeline/image_cards: exploración de N ítems,
  // detalle = { seen: { índice: true } } → máscara de bits.
  function seenCodec(countFn) {
    return {
      encode: function (detail, it) {
        if (!detail || !detail.seen) return null;
        var n = countFn(it);
        var bits = [];
        for (var i = 0; i < n; i++) bits.push(detail.seen[i] ? 1 : 0);
        return packBits(bits);
      },
      decode: function (payload, it) {
        var n = countFn(it);
        var bits = unpackBits(payload);
        var seen = {};
        for (var i = 0; i < n; i++) if (bits[i]) seen[i] = true;
        return { seen: seen };
      },
    };
  }
  TYPE_CODECS.accordion = seenCodec(function (it) { return ((it.config || {}).items || []).length; });
  TYPE_CODECS.tabs = seenCodec(function (it) { return ((it.config || {}).items || []).length; });
  TYPE_CODECS.flip_cards = seenCodec(function (it) { return ((it.config || {}).cards || []).length; });
  TYPE_CODECS.timeline = seenCodec(function (it) { return ((it.config || {}).milestones || []).length; });
  TYPE_CODECS.image_cards = seenCodec(function (it) { return ((it.config || {}).cards || []).length; });

  // case_practice: rúbrica autoevaluada, detalle = { rubric: [índices marcados] }.
  TYPE_CODECS.case_practice = {
    encode: function (detail, it) {
      if (!detail || !detail.rubric) return null;
      var n = ((it.config || {}).rubric || []).length;
      var bits = [];
      for (var i = 0; i < n; i++) bits.push(detail.rubric.indexOf(i) !== -1 ? 1 : 0);
      return packBits(bits);
    },
    decode: function (payload, it) {
      var n = ((it.config || {}).rubric || []).length;
      var bits = unpackBits(payload);
      var marked = [];
      for (var i = 0; i < n; i++) if (bits[i]) marked.push(i);
      return { rubric: marked };
    },
  };

  // flashcards: detalle = { idx, known: [bool], done }.
  TYPE_CODECS.flashcards = {
    encode: function (detail, it) {
      if (!detail) return null;
      var n = ((it.config || {}).cards || []).length;
      var idx = detail.idx || 0;
      var known = detail.known || [];
      var bits = [];
      for (var i = 0; i < n; i++) bits.push(known[i] ? 1 : 0);
      return packChunks([detail.done ? '1' : '0', b36(idx), packBits(bits)]);
    },
    decode: function (payload, it) {
      var n = ((it.config || {}).cards || []).length;
      var p = unpackChunks(payload);
      if (!p || p.length !== 3) return null;
      var idx = fromB36(p[1]);
      if (idx < 0 || idx > n) return null;
      var bits = unpackBits(p[2]);
      var known = [];
      for (var i = 0; i < idx; i++) known.push(!!bits[i]);
      return { idx: idx, known: known, done: p[0] === '1' };
    },
  };

  // single_choice/true_false: detalle = { value, correct, attempts }. `value`
  // se guarda como índice en `interaction.options` (orden de autor, estable
  // aunque la vista baraje su orden); `correct` se recalcula desde la config
  // actual — pero SE INCLUYE en el objeto devuelto porque choiceFactory lee
  // `ctx.state.correct` directamente en la restauración para decidir si la
  // interacción queda bloqueada (no lo vuelve a derivar de `value`).
  var choiceCodec = {
    encode: function (detail, it) {
      if (!detail || detail.value == null) return null;
      var idx = indexOfById(it.options || [], detail.value);
      if (idx < 0 || idx > 35) return null;
      return packChunks([b36(idx), b36(detail.attempts || 0)]);
    },
    decode: function (payload, it) {
      var p = unpackChunks(payload);
      if (!p || p.length !== 2) return null;
      var opt = (it.options || [])[fromB36(p[0])];
      if (!opt) return null;
      return { value: opt.id, attempts: fromB36(p[1]), correct: !!opt.correct };
    },
  };
  TYPE_CODECS.single_choice = choiceCodec;
  TYPE_CODECS.true_false = choiceCodec;

  // scenario_decision: detalle = { choice, correct }. La propia interacción
  // recalcula `correct` desde `choice` al restaurar, así que basta con la
  // elección — no hace falta guardar ni derivar `correct` aquí.
  TYPE_CODECS.scenario_decision = {
    encode: function (detail, it) {
      if (!detail || detail.choice == null) return null;
      var idx = indexOfById(it.options || [], detail.choice);
      if (idx < 0 || idx > 35) return null;
      return b36(idx);
    },
    decode: function (payload, it) {
      var opt = (it.options || [])[fromB36(payload)];
      if (!opt) return null;
      return { choice: opt.id };
    },
  };

  // hotspots: igual que scenario_decision pero contra config.spots.
  TYPE_CODECS.hotspots = {
    encode: function (detail, it) {
      if (!detail || detail.choice == null) return null;
      var spots = (it.config || {}).spots || [];
      var idx = indexOfById(spots, detail.choice);
      if (idx < 0 || idx > 35) return null;
      return b36(idx);
    },
    decode: function (payload, it) {
      var spots = (it.config || {}).spots || [];
      var spot = spots[fromB36(payload)];
      if (!spot) return null;
      return { choice: spot.id };
    },
  };

  // sort_steps: detalle = { order: [ids en el orden actual], correct, attempts }.
  // Se guarda la permutación de índices contra `config.steps` (orden de
  // autor); `correct` se deriva comparando con el orden correcto (steps
  // ordenados por su campo `order`) porque el restore de sort_steps SÍ lee
  // `ctx.state.correct` directamente para bloquear el intento agotado.
  TYPE_CODECS.sort_steps = {
    encode: function (detail, it) {
      var steps = (it.config || {}).steps || [];
      if (!detail || !detail.order || detail.order.length !== steps.length) return null;
      var digits = '';
      for (var i = 0; i < detail.order.length; i++) {
        var idx = indexOfById(steps, detail.order[i]);
        if (idx < 0 || idx > 35) return null;
        digits += b36(idx);
      }
      return packChunks([digits, b36(detail.attempts || 0)]);
    },
    decode: function (payload, it) {
      var steps = (it.config || {}).steps || [];
      var p = unpackChunks(payload);
      if (!p || p.length !== 2 || p[0].length !== steps.length) return null;
      var order = [];
      var used = {};
      for (var i = 0; i < p[0].length; i++) {
        var idx = fromB36(p[0].charAt(i));
        if (!steps[idx] || used[idx]) return null;
        used[idx] = true;
        order.push(steps[idx].id);
      }
      var expected = steps.slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); })
        .map(function (s) { return s.id; });
      return { order: order, attempts: fromB36(p[1]), correct: order.join(',') === expected.join(',') };
    },
  };

  // match_pairs/classification: detalle = { answers: {optId: groupId}, correct,
  // attempts }. Un dígito por opción (orden de autor) con el índice del grupo
  // asignado (sentinela = groups.length si no se asignó); `correct` se deriva
  // comparando con `option.group` (el grupo correcto de cada opción) porque
  // el restore también lee `ctx.state.correct` directamente.
  var dragAssignCodec = {
    encode: function (detail, it) {
      var groups = (it.config || {}).groups || [];
      var opts = it.options || [];
      if (!detail || !detail.answers) return null;
      if (groups.length > 35) return null;
      var digits = '';
      for (var i = 0; i < opts.length; i++) {
        var g = detail.answers[opts[i].id];
        var gi = g ? indexOfById(groups, g) : -1;
        digits += b36(gi < 0 ? groups.length : gi);
      }
      return packChunks([digits, b36(detail.attempts || 0)]);
    },
    decode: function (payload, it) {
      var groups = (it.config || {}).groups || [];
      var opts = it.options || [];
      var p = unpackChunks(payload);
      if (!p || p.length !== 2 || p[0].length !== opts.length) return null;
      var answers = {};
      var allCorrect = opts.length > 0;
      for (var i = 0; i < opts.length; i++) {
        var gi = fromB36(p[0].charAt(i));
        if (gi < groups.length && groups[gi]) {
          answers[opts[i].id] = groups[gi].id;
          if (groups[gi].id !== opts[i].group) allCorrect = false;
        } else {
          allCorrect = false;
        }
      }
      return { answers: answers, attempts: fromB36(p[1]), correct: allCorrect };
    },
  };
  TYPE_CODECS.match_pairs = dragAssignCodec;
  TYPE_CODECS.classification = dragAssignCodec;

  // fill_blanks: detalle = { values: [texto elegido por hueco], correct,
  // attempts }. El "pool" (respuestas + distractores, sin duplicados, orden
  // de autor — la vista lo baraja, pero el valor guardado no depende de ese
  // barajado) da un índice compacto por hueco. `correct` se deriva comparando
  // con la respuesta correcta de cada hueco (extraída del propio texto).
  function fillBlanksMeta(it) {
    var text = String((it.config || {}).text || '');
    var answers = [];
    var re = /\[\[(.+?)\]\]/g;
    var m;
    while ((m = re.exec(text)) !== null) answers.push(m[1].trim());
    var pool = [];
    answers.concat((it.config || {}).distractors || []).forEach(function (t) {
      t = String(t).trim();
      if (t && pool.indexOf(t) === -1) pool.push(t);
    });
    return { answers: answers, pool: pool };
  }
  TYPE_CODECS.fill_blanks = {
    encode: function (detail, it) {
      var meta = fillBlanksMeta(it);
      if (!detail || !detail.values || detail.values.length !== meta.answers.length) return null;
      if (meta.pool.length > 35) return null;
      var digits = '';
      for (var i = 0; i < detail.values.length; i++) {
        var idx = meta.pool.indexOf(detail.values[i]);
        digits += idx < 0 ? '.' : b36(idx);
      }
      return packChunks([digits, b36(detail.attempts || 0)]);
    },
    decode: function (payload, it) {
      var meta = fillBlanksMeta(it);
      var p = unpackChunks(payload);
      if (!p || p.length !== 2 || p[0].length !== meta.answers.length) return null;
      var values = [];
      var correct = meta.answers.length > 0;
      for (var i = 0; i < p[0].length; i++) {
        var c = p[0].charAt(i);
        var v = c === '.' ? '' : (meta.pool[fromB36(c)] || '');
        values.push(v);
        if (v !== meta.answers[i]) correct = false;
      }
      return { values: values, attempts: fromB36(p[1]), correct: correct };
    },
  };

  // video/hidden_image: preguntas de opción única sobre el mismo shape
  // { prompt, options }, filtradas igual que en interactions.js. Detalle =
  // { answered|answers: { índice: {choice, correct} } }, un carácter por
  // pregunta (índice de opción elegida, o '.' sin responder).
  function filteredQuestions(it) {
    return ((it.config || {}).questions || []).filter(function (q) {
      return q && String(q.prompt || '').trim() && (q.options || []).length >= 2;
    });
  }
  function questionSetCodec(key) {
    return {
      encode: function (detail, it) {
        if (!detail) return null;
        var questions = filteredQuestions(it);
        var answered = detail[key] || {};
        var out = '';
        for (var i = 0; i < questions.length; i++) {
          var a = answered[i];
          if (!a || a.choice == null || a.choice < 0 || a.choice > 35) out += '.';
          else out += b36(a.choice);
        }
        return out;
      },
      decode: function (payload, it) {
        var questions = filteredQuestions(it);
        if (payload.length !== questions.length) return null;
        var answered = {};
        for (var i = 0; i < questions.length; i++) {
          var c = payload.charAt(i);
          if (c === '.') continue;
          var choice = fromB36(c);
          var opt = (questions[i].options || [])[choice];
          if (!opt) continue;
          answered[i] = { choice: choice, correct: !!opt.correct };
        }
        var out = {};
        out[key] = answered;
        return out;
      },
    };
  }
  TYPE_CODECS.video = questionSetCodec('answered');
  TYPE_CODECS.hidden_image = questionSetCodec('answers');

  // html_embed: detalle = { done, data }. `data` es el JSON libre del propio
  // autor (contrato MeEmbed v1), ya acotado en runtime por `state_max`.
  TYPE_CODECS.html_embed = {
    encode: function (detail) {
      if (!detail) return null;
      var flag = detail.done ? '1' : '0';
      var dataStr = detail.data == null ? '' : asciiEscape(JSON.stringify(detail.data));
      return flag + dataStr;
    },
    decode: function (payload) {
      if (!payload) return null;
      var flag = payload.charAt(0) === '1';
      var rest = payload.slice(1);
      var data = null;
      if (rest) {
        try { data = JSON.parse(asciiUnescape(rest)); } catch (e) { data = null; }
      }
      return { done: flag, data: data };
    },
  };

  // before_after: detalle = { moved, pos } — pos 0-100, moved siempre true
  // (solo se guarda tras el primer movimiento del slider).
  TYPE_CODECS.before_after = {
    encode: function (detail) {
      if (!detail) return null;
      var pos = Math.max(0, Math.min(100, Math.round(detail.pos != null ? detail.pos : 50)));
      var s = pos.toString(36);
      while (s.length < 2) s = '0' + s;
      return s;
    },
    decode: function (payload) {
      var pos = parseInt(payload, 36);
      if (isNaN(pos) || pos < 0 || pos > 100) pos = 50;
      return { moved: true, pos: pos };
    },
  };

  // word_search: detalle = { found: [palabras normalizadas] }. Se codifica
  // como máscara de bits sobre la lista de palabras TAL COMO LA ESCRIBIÓ EL
  // AUTOR (config.words, sin barajar ni colocar en el tablero — eso es
  // responsabilidad del propio interactivo, que ya filtra `found` contra su
  // colocación real al restaurar), así no hace falta reproducir aquí el PRNG
  // de colocación.
  function normWord(w) {
    var NTILDE = String.fromCharCode(209);
    var MARK = String.fromCharCode(1);
    var DIACRITICS = new RegExp('[' + String.fromCharCode(0x300) + '-' + String.fromCharCode(0x36f) + ']', 'g');
    return String(w || '').toUpperCase()
      .split(NTILDE).join(MARK)
      .normalize('NFD').replace(DIACRITICS, '')
      .split(MARK).join(NTILDE)
      .replace(new RegExp('[^A-Z' + NTILDE + ']', 'g'), '');
  }
  TYPE_CODECS.word_search = {
    encode: function (detail, it) {
      if (!detail || !detail.found) return null;
      var words = (it.config || {}).words || [];
      var normFound = detail.found.map(normWord);
      var bits = [];
      for (var i = 0; i < words.length; i++) bits.push(normFound.indexOf(normWord(words[i])) !== -1 ? 1 : 0);
      return packBits(bits);
    },
    decode: function (payload, it) {
      var words = (it.config || {}).words || [];
      var bits = unpackBits(payload);
      var found = [];
      for (var i = 0; i < words.length; i++) {
        if (bits[i]) {
          var w = normWord(words[i]);
          if (found.indexOf(w) === -1) found.push(w);
        }
      }
      return { found: found };
    },
  };

  // crossword: detalle = { values: {'r,c': letra}, correct, attempts }. No
  // reproduce el algoritmo de colocación (PRNG + cruces): guarda las celdas
  // rellenas tal cual (pares clave=valor, cantidad variable) y dos campos
  // fijos al final; las celdas que ya no existan en la rejilla actual
  // simplemente no se pintan (el propio interactivo solo lee por clave).
  TYPE_CODECS.crossword = {
    encode: function (detail) {
      if (!detail || !detail.values) return null;
      var keys = Object.keys(detail.values);
      var pairs = [];
      for (var i = 0; i < keys.length; i++) {
        if (!/^\d+,\d+$/.test(keys[i])) continue;
        pairs.push(keys[i] + '=' + asciiEscape(String(detail.values[keys[i]] || '')));
      }
      pairs.push(detail.correct ? '1' : '0');
      pairs.push(b36(detail.attempts || 0));
      return packChunks(pairs);
    },
    decode: function (payload) {
      var arr = unpackChunks(payload);
      if (!arr || arr.length < 2) return null;
      var attempts = fromB36(arr[arr.length - 1]);
      var correct = arr[arr.length - 2] === '1';
      var values = {};
      for (var i = 0; i < arr.length - 2; i++) {
        var eq = arr[i].indexOf('=');
        if (eq < 0) continue;
        values[arr[i].slice(0, eq)] = asciiUnescape(arr[i].slice(eq + 1));
      }
      return { values: values, correct: correct, attempts: attempts };
    },
  };

  // az_quiz: detalle = { res: { índice: {given, correct}, __last } }. `given`
  // es texto libre tecleado por el alumno — se guarda escapado; `correct` se
  // deriva comparando con la respuesta (normLetters), no hace falta guardarlo.
  // Nota (Fase 2): el orden de `items` aquí es el de la config ACTUAL
  // (ordenado por letra inicial); si un republicado cambia la respuesta de un
  // ítem, su letra —y por tanto su posición— puede desplazarse. El remapeo
  // por huella de la Fase 2 deberá indexar por la posición en `config.items`
  // TAL COMO LA ESCRIBIÓ EL AUTOR (antes de este `sort`), no por esta.
  function normLettersLite(s) {
    var NTILDE = String.fromCharCode(209);
    var MARK = String.fromCharCode(1);
    var DIACRITICS = new RegExp('[' + String.fromCharCode(0x300) + '-' + String.fromCharCode(0x36f) + ']', 'g');
    return String(s || '').toUpperCase()
      .split(NTILDE).join(MARK)
      .normalize('NFD').replace(DIACRITICS, '')
      .split(MARK).join(NTILDE)
      .replace(new RegExp('[^A-Z' + NTILDE + '0-9 ]', 'g'), '')
      .replace(/\s+/g, ' ').trim();
  }
  function azQuizItems(it) {
    var items = ((it.config || {}).items || []).map(function (q) {
      var answer = String(q.answer || '').trim();
      return { answer: answer, letter: normLettersLite(answer).charAt(0), clue: String(q.clue || '').trim() };
    }).filter(function (q) { return q.clue && q.answer && q.letter; });
    items.sort(function (a, b) { return a.letter < b.letter ? -1 : a.letter > b.letter ? 1 : 0; });
    return items;
  }
  TYPE_CODECS.az_quiz = {
    encode: function (detail, it) {
      if (!detail || !detail.res) return null;
      var items = azQuizItems(it);
      var slots = [];
      for (var i = 0; i < items.length; i++) {
        var r = detail.res[i];
        slots.push(r && r.given != null ? asciiEscape(r.given) : '');
      }
      var last = detail.res.__last;
      slots.push(last == null ? '' : b36(last));
      return packChunks(slots);
    },
    decode: function (payload, it) {
      var items = azQuizItems(it);
      var arr = unpackChunks(payload);
      if (!arr || arr.length !== items.length + 1) return null;
      var res = {};
      for (var i = 0; i < items.length; i++) {
        if (!arr[i]) continue;
        var given = asciiUnescape(arr[i]);
        // Degradado por tamaño (Fase 3): "" + '1'/'0' sustituye el texto
        // tecleado por el alumno, ya innecesario, por su acierto explícito
        // (nunca se reexpone `given` al restaurar, ver interactions.js).
        if (given.charAt(0) === '') {
          res[i] = { given: '', correct: given.charAt(1) === '1' };
        } else {
          res[i] = { given: given, correct: normLettersLite(given) === normLettersLite(items[i].answer) };
        }
      }
      if (arr[items.length]) res.__last = fromB36(arr[items.length]);
      return { res: res };
    },
  };

  // puzzle: detalle = { order: [permutación de piezas], solved }.
  TYPE_CODECS.puzzle = {
    encode: function (detail, it) {
      if (!detail || !detail.order) return null;
      var c = it.config || {};
      var cols = Math.min(5, Math.max(2, +c.cols || 3));
      var rows = Math.min(5, Math.max(2, +c.rows || 3));
      var n = cols * rows;
      if (detail.order.length !== n) return null;
      var digits = '';
      var used = {};
      for (var i = 0; i < n; i++) {
        var v = detail.order[i];
        if (v < 0 || v >= n || v > 35 || used[v]) return null;
        used[v] = true;
        digits += b36(v);
      }
      return digits + (detail.solved ? '1' : '0');
    },
    decode: function (payload, it) {
      var c = it.config || {};
      var cols = Math.min(5, Math.max(2, +c.cols || 3));
      var rows = Math.min(5, Math.max(2, +c.rows || 3));
      var n = cols * rows;
      if (payload.length !== n + 1) return null;
      var order = [];
      var used = {};
      for (var i = 0; i < n; i++) {
        var v = fromB36(payload.charAt(i));
        if (v < 0 || v >= n || used[v]) return null;
        used[v] = true;
        order.push(v);
      }
      return { order: order, solved: payload.charAt(n) === '1' };
    },
  };

  // ---- Envoltorio de detalle: compacto por tipo, con fallback JSON --------
  // Cada segmento empieza por un carácter de modo: '' (vacío) = sin detalle,
  // '0' = codec compacto del tipo, '1' = JSON genérico (escapado a ASCII).

  function encodeDetail(type, detail, it) {
    if (detail == null) return '';
    var codec = TYPE_CODECS[type];
    if (codec) {
      var compact = null;
      try { compact = codec.encode(detail, it); } catch (e) { compact = null; }
      if (typeof compact === 'string') return '0' + compact;
    }
    try { return '1' + asciiEscape(JSON.stringify(detail)); } catch (e) { return ''; }
  }
  function decodeDetail(type, payload, it) {
    if (!payload) return null;
    var mode = payload.charAt(0);
    var rest = payload.slice(1);
    if (mode === '0') {
      var codec = TYPE_CODECS[type];
      if (!codec) return null;
      try {
        var d = codec.decode(rest, it);
        return d && typeof d === 'object' ? d : null;
      } catch (e) { return null; }
    }
    if (mode === '1') {
      try {
        var v = JSON.parse(asciiUnescape(rest));
        return v && typeof v === 'object' ? v : null;
      } catch (e2) { return null; }
    }
    return null;
  }

  // ---- Resultados: un carácter + puntuación opcional ----------------------
  // '.' pendiente · 'd' completada sin nota · 'c' acierto (nota = máxima,
  // no hace falta guardarla) · 'f' completada evaluable sin acierto pleno
  // (necesita la puntuación real, porque puede ser parcial). El test final
  // es la única excepción: su "correct" es un apto/no-apto por nota mínima,
  // no "nota perfecta", así que SIEMPRE guarda la puntuación cuando completa.

  function classify(r) {
    if (!r || !r.completed) return '.';
    if (!r.scored) return 'd';
    return r.correct ? 'c' : 'f';
  }
  function encodeScore(r, ch, isFinal) {
    if (ch === '.' || ch === 'd') return '';
    if (isFinal) return b36(r.score || 0);
    if (ch === 'c') return '';
    return b36(Math.round((r.score || 0) * 100));
  }
  function decodeResultSlot(ch, scoreChunk, maxScore, isFinal) {
    if (ch === '.') return null;
    if (ch === 'd') return { completed: true, scored: false };
    if (isFinal) {
      var got = scoreChunk !== '' ? fromB36(scoreChunk) : (ch === 'c' ? maxScore : 0);
      return { completed: true, scored: true, correct: ch === 'c', score: got, maxScore: maxScore };
    }
    if (ch === 'c') return { completed: true, scored: true, correct: true, score: maxScore, maxScore: maxScore };
    var raw = scoreChunk !== '' ? fromB36(scoreChunk) / 100 : 0;
    return { completed: true, scored: true, correct: false, score: raw, maxScore: maxScore };
  }

  // ---- Degradación por tamaño (Fase 3, ver scorm_api.js/app.js) -----------
  // El `result` de cada interacción (results/attempts/finalScore) NUNCA se
  // toca: solo se recorta el DETALLE (`STATE.interactions[id]`), y solo
  // cuando ya no hace falta para que el runtime se comporte igual. Orden,
  // de menos a más agresivo (encodeWithBudget prueba niveles 0..3 hasta que
  // quepa):
  //  1. Interacciones exploratorias (sin nota) ya completadas: su detalle
  //     (qué se ha abierto/marcado) es redundante una vez completas — todo
  //     estaba visto/marcado, si no no estarían completas.
  //  2. Respuestas ESCRITAS ya acertadas del todo (crucigrama, rosco): el
  //     texto en sí ya no hace falta para nada — ni se vuelve a mostrar
  //     (el rosco nunca reexpone lo tecleado) ni afecta al bloqueo, que lee
  //     `correct`/`attempts` directamente. Se conservan esos dos campos
  //     (vacíos, el bloqueo por intentos agotados de un crucigrama YA
  //     correcto es irrelevante) para que la interacción siga quedando
  //     bloqueada al restaurar.
  //  3. `data` de `html_embed` ya completados: se pierde el estado interno
  //     del interactivo del autor (MeEmbed.state), pero `done` (y por tanto
  //     el bloqueo de navegación) se conserva intacto.
  var EXPLORATORY_TYPES = {
    accordion: 1, tabs: 1, flip_cards: 1, timeline: 1, image_cards: 1, case_practice: 1,
  };
  function degradeDetail(type, detail, resultChar, level) {
    if (detail == null || level <= 0) return detail;
    if (level >= 1 && EXPLORATORY_TYPES[type] && resultChar !== '.') return null;
    if (level >= 2 && type === 'crossword' && resultChar === 'c') {
      return { correct: true, attempts: detail.attempts || 0, values: {} };
    }
    if (level >= 2 && type === 'az_quiz' && detail.res) {
      var res2 = {};
      Object.keys(detail.res).forEach(function (k) {
        if (k === '__last') { res2.__last = detail.res.__last; return; }
        var r = detail.res[k];
        if (r) res2[k] = { given: '' + (r.correct ? '1' : '0'), correct: r.correct };
      });
      return { res: res2 };
    }
    if (level >= 3 && type === 'html_embed' && detail.done) {
      return { done: true, data: null };
    }
    return detail;
  }

  // ---- API pública ---------------------------------------------------------

  function defaultState() {
    return { visited: {}, interactions: {}, results: {}, attempts: 0, finalScore: 0, finalAnswers: {} };
  }

  // Construye los 7 segmentos de nivel superior (sin unirlos) contra un
  // nivel de degradación dado. La usan tanto encode() como encodeWithBudget()
  // (que además necesita el tamaño de cada segmento por separado para el log).
  function encodeParts(state, course, level) {
    state = state || {};
    level = level || 0;
    var screens = flattenScreens(course);
    var interactions = collectInteractions(screens);
    var finalQs = finalQuestions(course);
    var fp = fingerprint(screens, interactions, finalQs);

    var i;
    var visitedBits = [];
    for (i = 0; i < screens.length; i++) visitedBits.push(state.visited && state.visited[screens[i].id] ? 1 : 0);
    var visitedB64 = packBits(visitedBits);

    var results = state.results || {};
    var hasFinal = finalQs.length > 0;
    var stateChars = '';
    var scoreList = [];
    var resultChars = [];
    for (i = 0; i < interactions.length; i++) {
      var r = results[interactions[i].id];
      var ch = classify(r);
      stateChars += ch;
      resultChars.push(ch);
      scoreList.push(encodeScore(r, ch, false));
    }
    if (hasFinal) {
      var fr = results.__final__;
      var chf = classify(fr);
      stateChars += chf;
      scoreList.push(encodeScore(fr, chf, true));
    }

    var detailsIn = state.interactions || {};
    var interactionChunks = [];
    for (i = 0; i < interactions.length; i++) {
      var degraded = degradeDetail(interactions[i].type, detailsIn[interactions[i].id], resultChars[i], level);
      interactionChunks.push(encodeDetail(interactions[i].type, degraded, interactions[i].interaction));
    }

    var faIn = state.finalAnswers || {};
    var faChunks = [];
    for (i = 0; i < finalQs.length; i++) {
      var chosen = faIn[finalQs[i].id];
      if (chosen == null) { faChunks.push(''); continue; }
      var oi = indexOfById(finalQs[i].options || [], chosen);
      faChunks.push(oi < 0 ? '' : b36(oi));
    }

    return {
      fp: fp,
      visited: visitedB64,
      results: stateChars,
      scores: packChunks(scoreList),
      interactions: packChunks(interactionChunks),
      finalAnswers: packChunks(faChunks),
      attempts: b36(state.attempts || 0),
      finalScore: b36(state.finalScore || 0),
    };
  }

  function joinParts(parts) {
    return '2|' + parts.fp + '|' + packChunks([
      parts.visited, parts.results, parts.scores, parts.interactions,
      parts.finalAnswers, parts.attempts, parts.finalScore,
    ]);
  }

  function encode(state, course, level) {
    return joinParts(encodeParts(state, course, level || 0));
  }

  // Prueba niveles de degradación 0..3 (ver degradeDetail) hasta que el
  // string codificado quepa en `limit` (4096 por defecto, el límite real de
  // cmi.suspend_data en SCORM 1.2). Nunca toca visited/results/attempts/
  // finalScore — solo recorta detalle de interacciones ya resuelto.
  // Devuelve { raw, fits, degraded, size, breakdown } — si `fits` es false
  // ni siquiera el nivel más agresivo cupo: `raw` es igualmente el mejor
  // intento (el más pequeño posible), para que quien llama decida si
  // arriesgarse a escribirlo o conservar lo que ya hubiera en el LMS.
  function encodeWithBudget(state, course, limit) {
    limit = limit || 4096;
    var best = null;
    for (var level = 0; level <= 3; level++) {
      var parts = encodeParts(state, course, level);
      var raw = joinParts(parts);
      var breakdown = {
        visited: parts.visited.length,
        results: parts.results.length + parts.scores.length,
        interactions: parts.interactions.length,
        finalAnswers: parts.finalAnswers.length,
        attempts: parts.attempts.length,
        finalScore: parts.finalScore.length,
      };
      best = { raw: raw, fits: raw.length <= limit, degraded: level, size: raw.length, breakdown: breakdown };
      if (best.fits) return best;
    }
    return best;
  }

  function findLayout(layouts, fp) {
    if (!layouts) return null;
    for (var i = 0; i < layouts.length; i++) if (layouts[i] && layouts[i].fp === fp) return layouts[i];
    return null;
  }

  function decode(raw, course, layouts) {
    var screens = flattenScreens(course);
    var interactions = collectInteractions(screens);
    var finalQs = finalQuestions(course);
    var st = defaultState();
    if (typeof raw !== 'string' || !raw) return st;

    if (raw.charAt(0) === '2' && raw.charAt(1) === '|') {
      var fp = raw.slice(2, 8);
      var body = raw.slice(9);
      var parts = unpackChunks(body);
      if (!parts || parts.length !== 7) return st; // corrupto: defaults seguros

      st.attempts = fromB36(parts[5]);
      st.finalScore = fromB36(parts[6]);

      var currentFp = fingerprint(screens, interactions, finalQs);

      // Lista de referencia contra la que interpretar cada posición: la del
      // curso actual si la huella coincide, o la de la entrada de `layouts`
      // que coincida si no (remapeo). Huella desconocida → nada posicional.
      var refScreenIds, refInteractions, refFinalQIds;
      if (fp === currentFp) {
        refScreenIds = screens.map(function (sc) { return sc.id; });
        refInteractions = interactions.map(function (it) { return { id: it.id, type: it.type }; });
        refFinalQIds = finalQs.map(function (q) { return q.id; });
      } else {
        var oldLayout = findLayout(layouts, fp);
        if (!oldLayout) {
          if (global.console && global.console.warn) {
            global.console.warn('[StateCodec] huella de suspend_data desconocida (' + fp +
              '): se descarta el progreso posicional (pantallas vistas, interacciones, ' +
              'resultados, respuestas del test final) y se conservan intentos y nota.');
          }
          return st;
        }
        refScreenIds = oldLayout.screens || [];
        refInteractions = oldLayout.interactions || [];
        refFinalQIds = oldLayout.final_questions || [];
      }

      var i;
      var currentScreenIdSet = {};
      for (i = 0; i < screens.length; i++) currentScreenIdSet[screens[i].id] = true;
      var currentInteractionById = {};
      for (i = 0; i < interactions.length; i++) currentInteractionById[interactions[i].id] = interactions[i];
      var currentFinalQById = {};
      for (i = 0; i < finalQs.length; i++) currentFinalQById[finalQs[i].id] = finalQs[i];

      // visited: solo se propaga lo que sigue existiendo en el curso actual.
      var visitedBits = unpackBits(parts[0]);
      st.visited = {};
      for (i = 0; i < refScreenIds.length; i++) {
        if (visitedBits[i] && currentScreenIdSet[refScreenIds[i]]) st.visited[refScreenIds[i]] = true;
      }

      // resultados: por id, solo si la interacción sigue existiendo con el
      // MISMO tipo (si cambió de tipo, ni su resultado ni su detalle son de
      // fiar — se descartan los dos, nunca se aplican datos desplazados).
      var stateChars = parts[1];
      var scoreList = unpackChunks(parts[2]) || [];
      var refHasFinal = refFinalQIds.length > 0;
      var expectedSlots = refInteractions.length + (refHasFinal ? 1 : 0);
      st.results = {};
      if (stateChars.length === expectedSlots && scoreList.length === expectedSlots) {
        for (i = 0; i < refInteractions.length; i++) {
          var cur = currentInteractionById[refInteractions[i].id];
          if (!cur || cur.type !== refInteractions[i].type) continue;
          var maxScore = cur.interaction.points || 1;
          var r = decodeResultSlot(stateChars.charAt(i), scoreList[i], maxScore, false);
          if (r) st.results[cur.id] = r;
        }
        if (refHasFinal) {
          var maxFinal = 0;
          for (i = 0; i < finalQs.length; i++) maxFinal += finalQs[i].points || 1;
          var rf = decodeResultSlot(stateChars.charAt(refInteractions.length), scoreList[refInteractions.length], maxFinal, true);
          if (rf) st.results.__final__ = rf;
        }
      }

      // detalle de interacciones: misma condición (id vivo + tipo sin cambiar),
      // decodificado con el codec de ese tipo contra la config ACTUAL.
      var detailRaw = unpackChunks(parts[3]);
      st.interactions = {};
      if (detailRaw && detailRaw.length === refInteractions.length) {
        for (i = 0; i < refInteractions.length; i++) {
          var cur2 = currentInteractionById[refInteractions[i].id];
          if (!cur2 || cur2.type !== refInteractions[i].type) continue;
          var det = decodeDetail(cur2.type, detailRaw[i], cur2.interaction);
          if (det != null) st.interactions[cur2.id] = det;
        }
      }

      // respuestas del test final: por id de pregunta; el índice de opción se
      // reinterpreta contra las opciones ACTUALES de esa pregunta.
      var faRaw = unpackChunks(parts[4]);
      st.finalAnswers = {};
      if (faRaw && faRaw.length === refFinalQIds.length) {
        for (i = 0; i < refFinalQIds.length; i++) {
          if (!faRaw[i]) continue;
          var curQ = currentFinalQById[refFinalQIds[i]];
          if (!curQ) continue;
          var opt = (curQ.options || [])[fromB36(faRaw[i])];
          if (opt) st.finalAnswers[curQ.id] = opt.id;
        }
      }
      return st;
    }

    // Formato antiguo (JSON.stringify(STATE) por ids) o dato corrupto:
    // migración directa, porque ese formato ya tenía el shape de destino.
    try {
      var legacy = JSON.parse(raw);
      if (legacy && typeof legacy === 'object') {
        st.visited = legacy.visited || {};
        st.interactions = legacy.interactions || {};
        st.results = legacy.results || {};
        st.attempts = legacy.attempts || 0;
        st.finalScore = legacy.finalScore || 0;
        st.finalAnswers = legacy.finalAnswers || {};
      }
    } catch (e) { /* raw corrupto: se devuelven los valores por defecto */ }
    return st;
  }

  // Entrada de `course.scorm.layouts` para la estructura ACTUAL del curso
  // (sin `exported_at`: lo añade quien exporta, es un dato de reloj, no de
  // codec). La usa el flujo de exportación del editor para registrar cada
  // estructura publicada — nunca se genera en la Vista previa.
  function buildLayoutEntry(course) {
    var screens = flattenScreens(course);
    var interactions = collectInteractions(screens);
    var finalQs = finalQuestions(course);
    return {
      fp: fingerprint(screens, interactions, finalQs),
      screens: screens.map(function (sc) { return sc.id; }),
      interactions: interactions.map(function (it) { return { id: it.id, type: it.type }; }),
      final_questions: finalQs.map(function (q) { return q.id; }),
    };
  }

  global.StateCodec = {
    VERSION: 2,
    encode: encode,
    decode: decode,
    encodeWithBudget: encodeWithBudget,
    buildLayoutEntry: buildLayoutEntry,
    // Expuesto solo para scripts/test-state-codec.ts (Fase 1: demostrar que
    // el estado se puede trocear en segmentos sin conocer tipo ni config).
    _internal: {
      packChunks: packChunks,
      unpackChunks: unpackChunks,
      packBits: packBits,
      unpackBits: unpackBits,
      flattenScreens: flattenScreens,
      collectInteractions: collectInteractions,
      finalQuestions: finalQuestions,
      fingerprint: fingerprint,
      hasCodec: function (type) { return !!TYPE_CODECS[type]; },
      isExploratoryType: function (type) { return !!EXPLORATORY_TYPES[type]; },
    },
  };
})(typeof window !== 'undefined' ? window : this);
