/* Payments Training Hub: MBA Test Series engine, shared logic.
   Plain vanilla JS, no libraries. Usable in the browser as a classic
   script (window.MbaEngine) and in Node for tests (module.exports).
   No em dashes. Brand: Payments Training Hub only. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  root.MbaEngine = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  function escapeHtml(s) {
    if (s === null || s === undefined) { return ''; }
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function fmtInt(n) {
    var v = Math.round(Number(n) || 0);
    return String(v);
  }

  /* Seconds -> "01:23:45" (or "23:45" when under an hour and short form asked). */
  function formatHMS(totalSeconds) {
    var s = Math.max(0, Math.floor(totalSeconds));
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return p(h) + ':' + p(m) + ':' + p(sec);
  }

  function formatMS(totalSeconds) {
    var s = Math.max(0, Math.floor(totalSeconds));
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  /* Fix round 6, D-01 (GMAT 60-second break auto-start): the official
     rule (GMAC "GMAT Exam Policies and Procedures (Focus Edition)",
     7 May 2024, fidelity-GMAT 2.5, PROVEN) is "Unless you elect to
     skip the break, your break will automatically start in 60
     seconds." These pure helpers drive the break-screen countdown in
     the player: how many seconds of the 60-second wait are left, and
     whether the wait has expired. A missing offer timestamp means the
     full wait is still ahead; elapsed time past 60 clamps to zero, so
     a late reader auto-starts instead of going negative. The official
     document does NOT state what the 60-second wait deducts from, so
     the player treats the wait as neutral (credited back to the
     overall deadline when it ends); that neutrality is a product
     decision recorded here, not an official rule. */
  var GMAT_BREAK_AUTO_START_SECONDS = 60;
  function gmatBreakWaitRemaining(offeredAtMs, nowMs) {
    if (!offeredAtMs || !nowMs || nowMs <= offeredAtMs) { return GMAT_BREAK_AUTO_START_SECONDS; }
    var elapsed = Math.floor((nowMs - offeredAtMs) / 1000);
    return Math.max(0, GMAT_BREAK_AUTO_START_SECONDS - elapsed);
  }
  function gmatBreakWaitExpired(offeredAtMs, nowMs) {
    if (!offeredAtMs || !nowMs) { return false; }
    return (nowMs - offeredAtMs) >= GMAT_BREAK_AUTO_START_SECONDS * 1000;
  }

  function formatDurationMs(ms) {
    var s = Math.floor((Number(ms) || 0) / 1000);
    if (s < 60) { return s + 's'; }
    var m = Math.floor(s / 60);
    var rest = s % 60;
    return m + 'm ' + (rest < 10 ? '0' : '') + rest + 's';
  }

  function markingLabel(marking) {
    marking = marking || {};
    var c = (marking.correct === undefined || marking.correct === null) ? 0 : marking.correct;
    var w = (marking.wrong === undefined || marking.wrong === null) ? 0 : marking.wrong;
    var u = (marking.unattempted === undefined || marking.unattempted === null) ? 0 : marking.unattempted;
    return '+' + c + ' correct, ' + w + ' wrong, ' + u + ' unattempted';
  }

  /* ---- Set context: first item of a set carries the shared material ---- */
  function buildSetContext(items) {
    var map = {};
    (items || []).forEach(function (it) {
      if (!it || !it.set_id) { return; }
      if (!map[it.set_id]) {
        map[it.set_id] = {
          set_id: it.set_id,
          set_title: it.set_title || null,
          passage: it.passage || null,
          diagram: it.diagram || null
        };
      }
    });
    return map;
  }

  function setContextFor(item, setMap) {
    if (!item || !item.set_id) { return null; }
    return setMap[item.set_id] || null;
  }

  /* ---- TITA matching: numeric answers compare numerically, else text ---- */
  function numericValue(v) {
    if (v === null || v === undefined) { return null; }
    var t = String(v).trim().replace(/,/g, '').replace(/%$/, '');
    if (t === '' || t === '-' || t === '+') { return null; }
    var n = Number(t);
    return isFinite(n) ? n : null;
  }

  function titaMatches(userAnswer, correctAnswer) {
    if (userAnswer === null || userAnswer === undefined) { return false; }
    var u = String(userAnswer).trim();
    var c = String(correctAnswer === null || correctAnswer === undefined ? '' : correctAnswer).trim();
    if (u === '' || c === '') { return false; }
    var un = numericValue(u);
    var cn = numericValue(c);
    if (un !== null && cn !== null) {
      return Math.abs(un - cn) <= 0.01 + 1e-9;
    }
    var norm = function (s) { return s.toLowerCase().replace(/\s+/g, ' ').trim(); };
    return norm(u) === norm(c);
  }

  /* What kind of answer a TITA expects: 'numeric' when the correct
     answer parses as a number (commas and a trailing % ignored),
     'letter' for a sequence of A-D letters (e.g. a para-jumble order),
     'text' for anything else. Drives the TITA input shown to the
     candidate. */
  function titaKind(correctAnswer) {
    if (correctAnswer === null || correctAnswer === undefined) { return 'text'; }
    if (numericValue(correctAnswer) !== null) { return 'numeric'; }
    if (/^[A-D]+$/i.test(String(correctAnswer).trim())) { return 'letter'; }
    return 'text';
  }

  function isAnswered(item, answer) {
    if (answer === null || answer === undefined) { return false; }
    if (item.type === 'mcq') {
      return answer.value !== null && answer.value !== undefined && answer.value !== '';
    }
    if (item.type === 'tita') {
      return String(answer.value).trim() !== '';
    }
    if (item.type === 'essay') {
      return String(answer.value).trim() !== '';
    }
    return false;
  }

  /* One item scored against the mock marking scheme. The optional 4th
     arg markingResolver is a function (item) => {correct, wrong,
     unattempted}; when passed it supplies the marking for this item
     (per-exam overrides, e.g. no negative marking on CAT TITA). */
  function scoreItem(item, answer, marking, markingResolver) {
    if (typeof markingResolver === 'function') {
      marking = markingResolver(item) || marking;
    }
    marking = marking || {};
    var correct = (marking.correct === undefined || marking.correct === null) ? 0 : Number(marking.correct);
    var wrong = (marking.wrong === undefined || marking.wrong === null) ? 0 : Number(marking.wrong);
    var unattempted = (marking.unattempted === undefined || marking.unattempted === null) ? 0 : Number(marking.unattempted);
    if (item.type === 'essay') {
      var attempted = answer && String(answer.value || '').trim() !== '';
      return { status: attempted ? 'essay' : 'unattempted', score: 0, scored: false };
    }
    if (!answer || !isAnswered(item, answer)) {
      return { status: 'unattempted', score: unattempted, scored: true };
    }
    var ok = false;
    if (item.type === 'mcq') {
      ok = Number(answer.value) === Number(item.correct_index);
    } else if (item.type === 'tita') {
      ok = titaMatches(answer.value, item.correct_answer);
    }
    return { status: ok ? 'correct' : 'wrong', score: ok ? correct : wrong, scored: true };
  }

  function maxScore(mock) {
    var marking = (mock && mock.marking) || {};
    var correct = Number(marking.correct || 0);
    var n = 0;
    (mock.items || []).forEach(function (it) {
      if (it.type !== 'essay') { n += 1; }
    });
    return n * correct;
  }

  /* Full attempt scoring: totals plus per-section breakdown.
     subsetItems (optional) scores only those items, for sectional and
     topic modes; sections with no scored items are left out.
     opts (optional): { markingResolver, unattemptedPenalty }.
     markingResolver is passed through to scoreItem per item.
     unattemptedPenalty, when a non-zero number, is subtracted from the
     total and reported as result.unattemptedPenalty. */
  function scoreAttempt(mock, answers, subsetItems, opts) {
    answers = answers || {};
    opts = opts || {};
    var markingResolver = opts.markingResolver || null;
    var unattemptedPenalty = (typeof opts.unattemptedPenalty === 'number' && opts.unattemptedPenalty !== 0)
      ? opts.unattemptedPenalty : 0;
    var marking = mock.marking || {};
    var allItems = mock.items || [];
    var itemsToScore = subsetItems || allItems;
    var sections = {};
    (mock.sections || []).forEach(function (s) {
      sections[s.id] = {
        id: s.id, name: s.name || s.id, total: 0, attempted: 0,
        correct: 0, wrong: 0, unattempted: 0, essay: 0,
        score: 0, timeMs: 0
      };
    });
    var perQuestion = [];
    var totalScore = 0;
    itemsToScore.forEach(function (item) {
      var sec = sections[item.section];
      if (!sec) {
        sec = { id: item.section, name: item.section, total: 0, attempted: 0,
          correct: 0, wrong: 0, unattempted: 0, essay: 0, score: 0, timeMs: 0 };
        sections[item.section] = sec;
      }
      var ans = answers[item.id] || null;
      var r = scoreItem(item, ans, marking, markingResolver);
      var timeMs = ans && ans.timeMs ? Number(ans.timeMs) : 0;
      sec.total += 1;
      sec.timeMs += timeMs;
      sec.score += r.score;
      totalScore += r.score;
      if (r.status === 'correct') { sec.correct += 1; sec.attempted += 1; }
      else if (r.status === 'wrong') { sec.wrong += 1; sec.attempted += 1; }
      else if (r.status === 'essay') { sec.essay += 1; sec.attempted += 1; }
      else { sec.unattempted += 1; }
      perQuestion.push({
        id: item.id, section: item.section, type: item.type,
        status: r.status, score: r.score, scored: r.scored,
        userValue: ans ? ans.value : null, timeMs: timeMs
      });
    });
    var sectionList = (mock.sections || []).map(function (s) { return sections[s.id]; });
    Object.keys(sections).forEach(function (k) {
      if (sectionList.indexOf(sections[k]) === -1) { sectionList.push(sections[k]); }
    });
    if (subsetItems) {
      sectionList = sectionList.filter(function (sec) { return sec.total > 0; });
    }
    sectionList.forEach(function (sec) {
      sec.accuracy = sec.attempted > 0 ? (sec.correct / sec.attempted) : null;
    });
    var attempted = perQuestion.filter(function (q) { return q.status !== 'unattempted'; }).length;
    var correctCount = perQuestion.filter(function (q) { return q.status === 'correct'; }).length;
    var subsetMax = 0;
    itemsToScore.forEach(function (it) { if (it.type !== 'essay') { subsetMax += 1; } });
    var max = subsetItems ? subsetMax * Number(marking.correct || 0) : maxScore(mock);
    if (unattemptedPenalty !== 0) {
      totalScore = Math.round((totalScore + unattemptedPenalty) * 100) / 100;
    }
    return {
      totalScore: totalScore,
      unattemptedPenalty: unattemptedPenalty,
      maxScore: max,
      totalQuestions: itemsToScore.length,
      attempted: attempted,
      correct: correctCount,
      wrong: perQuestion.filter(function (q) { return q.status === 'wrong'; }).length,
      unattempted: perQuestion.filter(function (q) { return q.status === 'unattempted'; }).length,
      essayCount: perQuestion.filter(function (q) { return q.status === 'essay'; }).length,
      sections: sectionList,
      perQuestion: perQuestion
    };
  }

  /* ---- One authoritative scoring path (G26) ---- */
  /* XAT rule, computed from the profile: -penalty per unattempted
     question beyond the threshold in the rule's scope. Part-1-wide
     (fix round 6): the penalty is defined over Part 1 as a whole, so
     it applies only on a full run, never on a sectional/topic run;
     isFullRun false returns 0. Returns 0 or a negative number; 0 for
     every other exam. Mirrors the profile module's
     computeUnattemptedPenalty; the engine owns this copy so
     scoreAttemptWithProfile needs no second module. */
  /* XAT cycle-aware threshold (fix round 7, stream A, item 4).
     Mirrors exam-profiles.js resolveUnattemptedPenaltyThreshold
     (the engine is standalone and does not import the profiles
     module). The mock may carry an optional cycle field; a 2027
     mock resolves 12, anything else (including no cycle at all)
     resolves the profile default 8. The profile declares both
     cycle thresholds, so a future 2027 mock cannot silently
     inherit 8. */
  function resolveUnattemptedPenaltyThreshold(profile, mock) {
    var rule = profile && profile.unattemptedPenalty;
    if (!rule) { return 0; }
    if (rule.cycles && mock && mock.cycle !== undefined && mock.cycle !== null) {
      var c = String(mock.cycle);
      if (rule.cycles[c] !== undefined && rule.cycles[c] !== null) { return Number(rule.cycles[c]); }
    }
    return Number(rule.threshold || 0);
  }

  function computeProfileUnattemptedPenalty(profile, mock, answers, isFullRun) {
    var rule = profile && profile.unattemptedPenalty;
    if (!rule) { return 0; }
    if (isFullRun === false) { return 0; }
    var scopeSections = null;
    if (rule.scope === 'PART1' && profile.parts) {
      for (var i = 0; i < profile.parts.length; i++) {
        if (profile.parts[i].id === 'PART1') { scopeSections = profile.parts[i].sections || []; }
      }
    } else if (Array.isArray(rule.scope)) {
      scopeSections = rule.scope;
    }
    if (!scopeSections || !(Number(rule.penalty) > 0)) { return 0; }
    var count = 0;
    (mock && mock.items || []).forEach(function (item) {
      if (scopeSections.indexOf(item.section) === -1) { return; }
      var ans = (answers || {})[item.id];
      if (!isAnswered(item, ans)) { count += 1; }
    });
    var excess = count - resolveUnattemptedPenaltyThreshold(profile, mock);
    if (excess <= 0) { return 0; }
    return -Math.round(excess * Number(rule.penalty) * 100) / 100;
  }

  /* THE single scoring path for a whole attempt (G26). Builds the
     marking resolver from the exam profile (per-section overrides,
     TITA wrong mark) and the unattempted-question penalty from the
     same profile, then scores through scoreAttempt. The player, the
     unit tests and the results page (via the stored record) all use
     this function, never a second re-pricing pass, so unit tests,
     live attempts and results-page scores cannot disagree. When
     profile is null the mock marking is used as-is. subsetItems scores
     a subset of the mock (sectional/topic runs). opts (optional):
     { fullRun }. The XAT unattempted penalty is Part-1-wide (fix
     round 6), so it applies only when the run is a full run:
     opts.fullRun false suppresses it, and passing a strict subset in
     subsetItems suppresses it too. An explicit opts.fullRun true
     overrides the subset inference. */
  function scoreAttemptWithProfile(mock, answers, profile, subsetItems, opts) {
    profile = profile || {};
    var marking = (mock && mock.marking) || {};
    function num(v, fallback) {
      return (v === undefined || v === null) ? fallback : Number(v);
    }
    var resolver = function (item) {
      var correct = num(marking.correct, 0);
      var wrong = num(marking.wrong, 0);
      var unattempted = num(marking.unattempted, 0);
      var overrides = profile.sectionMarkingOverrides || {};
      if (item && item.section && overrides[item.section]) {
        var o = overrides[item.section];
        correct = num(o.correct, correct);
        wrong = num(o.wrong, wrong);
        unattempted = num(o.unattempted, unattempted);
      }
      if (item && item.type === 'tita' && profile.titaWrongMark !== null && profile.titaWrongMark !== undefined) {
        wrong = Number(profile.titaWrongMark);
      }
      return { correct: correct, wrong: wrong, unattempted: unattempted };
    };
    var penalty = 0;
    /* Part-1-wide (fix round 6): see the function comment above. */
    var fullRun = true;
    if (opts && opts.fullRun === false) { fullRun = false; }
    else if (subsetItems && mock && mock.items && subsetItems.length < mock.items.length) { fullRun = false; }
    if (opts && opts.fullRun === true) { fullRun = true; }
    if (fullRun) { penalty = computeProfileUnattemptedPenalty(profile, mock, answers); }
    return scoreAttempt(mock, answers, subsetItems, { markingResolver: resolver, unattemptedPenalty: penalty });
  }

  /* Palette state for one question, from its stored answer record.
     mode 'merittrac' (IBSAT) uses the MeritTrac semantics: an unvisited
     question is white "not visited", exactly as on the TCS/NTA consoles.
     The MeritTrac manual's own screenshots show white Not Visited tiles
     with a live legend count; the manual text paragraph that lists grey
     "skipped" instead disagrees with its screenshots, and the
     screenshots are the visual truth. A visited-but-unanswered question
     is red "not answered". The 'skipped' state is retained in
     PALETTE_LABELS for old records only; no current path returns it. */
  function paletteState(rec, mode) {
    if (!rec || !rec.visited) { return 'not-visited'; }
    var answered = rec.value !== null && rec.value !== undefined &&
      String(rec.value).trim() !== '';
    if (rec.marked && answered) { return 'answered-marked'; }
    if (rec.marked) { return 'marked'; }
    if (answered) { return 'answered'; }
    return 'not-answered';
  }

  var PALETTE_LABELS = {
    'answered': 'Answered',
    'not-answered': 'Not Answered',
    'marked': 'Marked for Review',
    'answered-marked': 'Answered and Marked for Review',
    'not-visited': 'Not Visited',
    'skipped': 'Not answered and skipped'
  };

  /* Fix round 5 (R4-01, CAT per-section submit): answer counts for one
     section, from palette states. A selected-but-unsaved answer counts
     as not answered, because scoring and the palette read rec.value
     only. Used by the player for the per-section submit summary. */
  function sectionAnswerCounts(mock, answers, sectionId) {
    var counts = { answered: 0, 'not-answered': 0, marked: 0, 'answered-marked': 0, 'not-visited': 0, total: 0 };
    ((mock && mock.items) || []).forEach(function (item) {
      if (item.section !== sectionId) { return; }
      counts.total += 1;
      var st = paletteState((answers || {})[item.id]);
      if (counts[st] === undefined) { counts[st] = 0; }
      counts[st] += 1;
    });
    return counts;
  }

  /* Fix round 5 (R4-02, GMAT unofficial score): the official framing
     for the score shown immediately after the exam (fidelity-GMAT
     sections 1 and 2.7, PROVEN from mba.com): Total Score 205-805
     with section scores 60-90 each, and the Official Score Report
     within 3 to 5 days. The mock cannot compute the adaptive scaled
     score, so the note discloses that and points at the raw counts
     instead. Returns null for every other exam. */
  function unofficialScoreNote(examKey) {
    if (String(examKey || '').trim().toUpperCase() !== 'GMAT') { return null; }
    return 'Unofficial score: on the real GMAT your Total Score (205-805) and your three section scores (60-90 each) appear on screen immediately after the exam, and your Official Score Report follows within 3 to 5 days. This mock cannot compute the adaptive scaled score, so it reports raw counts instead: see your per-section correct answers.';
  }

  /* ---- Diagram rendering: native HTML table or inline SVG, never raster ---- */
  /* Infer the diagram kind from its shape when the kind field is missing,
     so a diagram with recognisable data never silently vanishes. */
  function inferDiagramKind(diagram) {
    if (!diagram) { return ''; }
    if (diagram.headers && diagram.rows) { return 'table'; }
    if (diagram.labels && diagram.values) { return 'pie'; }
    if (diagram.labels && diagram.series) { return 'bar'; }
    if (typeof diagram.content === 'string') { return 'text'; }
    return '';
  }

  function renderDiagramHTML(diagram) {
    if (!diagram) { return ''; }
    var kind = diagram.kind || inferDiagramKind(diagram);
    if (!kind) { return ''; }
    var caption = diagram.caption ? '<figcaption class="mba-diag-caption">' + escapeHtml(diagram.caption) + '</figcaption>' : '';
    if (kind === 'table') {
      var head = '<thead><tr>' + (diagram.headers || []).map(function (h) {
        return '<th scope="col">' + escapeHtml(h) + '</th>';
      }).join('') + '</tr></thead>';
      var body = '<tbody>' + (diagram.rows || []).map(function (row) {
        return '<tr>' + row.map(function (cell) {
          return '<td>' + escapeHtml(cell) + '</td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody>';
      return '<figure class="mba-diagram mba-diagram-table">' + caption +
        '<table class="mba-diag-table">' + head + body + '</table></figure>';
    }
    if (kind === 'text') {
      return '<figure class="mba-diagram mba-diagram-text">' + caption +
        '<div class="mba-diag-text">' + escapeHtml(diagram.content || '') + '</div></figure>';
    }
    if (kind === 'pie') {
      var labels = diagram.labels || [];
      var values = diagram.values || [];
      var total = values.reduce(function (a, b) { return a + (Number(b) || 0); }, 0);
      var colors = ['#173F8C', '#C9A326', '#0E7C5B', '#B42318', '#7C3AED', '#0E7490', '#BE5A00', '#47576E'];
      var cx = 130, cy = 130, r = 95;
      var start = -Math.PI / 2;
      var slices = '';
      var legend = '';
      values.forEach(function (v, i) {
        var frac = total > 0 ? (Number(v) || 0) / total : 0;
        var end = start + frac * Math.PI * 2;
        var large = (end - start) > Math.PI ? 1 : 0;
        var x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
        var x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
        var color = colors[i % colors.length];
        if (frac > 0) {
          if (frac >= 0.999) {
            slices += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + color + '"/>';
          } else {
            slices += '<path d="M ' + cx + ' ' + cy + ' L ' + x1.toFixed(1) + ' ' + y1.toFixed(1) +
              ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + x2.toFixed(1) + ' ' + y2.toFixed(1) +
              ' Z" fill="' + color + '"/>';
          }
        }
        var pct = total > 0 ? ((Number(v) || 0) / total * 100) : 0;
        legend += '<li><span class="mba-legend-swatch" style="background:' + color + '"></span>' +
          escapeHtml(labels[i] || ('Slice ' + (i + 1))) + ': ' + escapeHtml(fmtInt(v)) +
          ' (' + pct.toFixed(1) + '%)</li>';
        start = end;
      });
      return '<figure class="mba-diagram mba-diagram-pie">' + caption +
        '<div class="mba-pie-wrap"><svg viewBox="0 0 260 260" width="260" height="260" role="img" aria-label="' +
        escapeHtml(diagram.caption || 'Pie chart') + '">' + slices + '</svg>' +
        '<ul class="mba-legend">' + legend + '</ul></div></figure>';
    }
    if (kind === 'bar' || kind === 'line') {
      var bLabels = diagram.labels || [];
      var series = diagram.series || [];
      var W = 560, H = 300, padL = 48, padB = 34, padT = 16, padR = 12;
      var allVals = [];
      series.forEach(function (s) { (s.values || []).forEach(function (v) { allVals.push(Number(v) || 0); }); });
      var maxV = allVals.length ? Math.max.apply(null, allVals) : 0;
      if (maxV <= 0) { maxV = 1; }
      var plotW = W - padL - padR, plotH = H - padT - padB;
      var n = Math.max(bLabels.length, 1);
      var slot = plotW / n;
      var barColors = ['#173F8C', '#C9A326', '#0E7C5B', '#B42318'];
      var svg = '';
      for (var g = 0; g <= 4; g++) {
        var gy = padT + plotH - (plotH * g / 4);
        var gv = (maxV * g / 4);
        svg += '<line x1="' + padL + '" y1="' + gy.toFixed(1) + '" x2="' + (W - padR) + '" y2="' + gy.toFixed(1) + '" stroke="#E2E8F0"/>' +
          '<text x="' + (padL - 6) + '" y="' + (gy + 4).toFixed(1) + '" text-anchor="end" font-size="10" fill="#47576E">' + escapeHtml(String(Math.round(gv))) + '</text>';
      }
      if (kind === 'bar') {
        var groups = series.length || 1;
        var barW = Math.min(34, (slot * 0.8) / groups);
        series.forEach(function (s, si) {
          (s.values || []).forEach(function (v, i) {
            var h = (Number(v) || 0) / maxV * plotH;
            var x = padL + i * slot + (slot - barW * groups) / 2 + si * barW;
            var y = padT + plotH - h;
            svg += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + h.toFixed(1) + '" fill="' + barColors[si % barColors.length] + '"/>' +
              '<text x="' + (x + barW / 2).toFixed(1) + '" y="' + (y - 4).toFixed(1) + '" text-anchor="middle" font-size="10" fill="#0B1F3D">' + escapeHtml(fmtInt(v)) + '</text>';
          });
        });
      } else {
        series.forEach(function (s, si) {
          var pts = (s.values || []).map(function (v, i) {
            var x = padL + i * slot + slot / 2;
            var y = padT + plotH - ((Number(v) || 0) / maxV * plotH);
            return { x: x, y: y, v: v };
          });
          var d = pts.map(function (p, i) { return (i === 0 ? 'M ' : 'L ') + p.x.toFixed(1) + ' ' + p.y.toFixed(1); }).join(' ');
          svg += '<path d="' + d + '" fill="none" stroke="' + barColors[si % barColors.length] + '" stroke-width="2"/>';
          pts.forEach(function (p) {
            svg += '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="3.5" fill="' + barColors[si % barColors.length] + '"/>' +
              '<text x="' + p.x.toFixed(1) + '" y="' + (p.y - 8).toFixed(1) + '" text-anchor="middle" font-size="10" fill="#0B1F3D">' + escapeHtml(fmtInt(p.v)) + '</text>';
          });
        });
      }
      bLabels.forEach(function (lab, i) {
        var x = padL + i * slot + slot / 2;
        svg += '<text x="' + x.toFixed(1) + '" y="' + (H - 10) + '" text-anchor="middle" font-size="11" fill="#0B1F3D">' + escapeHtml(lab) + '</text>';
      });
      var legendHtml = series.map(function (s, si) {
        return '<li><span class="mba-legend-swatch" style="background:' + barColors[si % barColors.length] + '"></span>' + escapeHtml(s.name || ('Series ' + (si + 1))) + '</li>';
      }).join('');
      return '<figure class="mba-diagram mba-diagram-chart">' + caption +
        '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="' +
        escapeHtml(diagram.caption || 'Chart') + '">' + svg + '</svg>' +
        (series.length > 1 ? '<ul class="mba-legend mba-legend-inline">' + legendHtml + '</ul>' : '') + '</figure>';
    }
    return '';
  }

  function correctAnswerText(item) {
    if (!item) { return ''; }
    if (item.type === 'mcq') {
      var idx = Number(item.correct_index);
      return (item.options && item.options[idx] !== undefined) ? item.options[idx] : '';
    }
    if (item.type === 'tita' || item.type === 'essay') {
      return item.correct_answer || '';
    }
    return '';
  }

  function userAnswerText(item, answer) {
    if (!answer || answer.value === null || answer.value === undefined || String(answer.value).trim() === '') {
      return null;
    }
    if (item.type === 'mcq') {
      var idx = Number(answer.value);
      return (item.options && item.options[idx] !== undefined) ? item.options[idx] : null;
    }
    return String(answer.value);
  }

  function optionLetter(i) {
    return String.fromCharCode(65 + i);
  }

  /* ---- Estimated percentile: seeded baseline per exam, labelled clearly
     wherever shown. Until real learner data exists, the baseline below is
     a fixed normal distribution over the fraction of the maximum score. ---- */
  var PERCENTILE_BASELINE = {
    CAT: { mean: 0.42, sd: 0.14 },
    XAT: { mean: 0.45, sd: 0.13 },
    NMAT: { mean: 0.55, sd: 0.12 },
    SNAP: { mean: 0.55, sd: 0.13 },
    MAT: { mean: 0.55, sd: 0.12 },
    CMAT: { mean: 0.50, sd: 0.13 },
    IBSAT: { mean: 0.55, sd: 0.12 },
    GMAT: { mean: 0.55, sd: 0.12 },
    GRE: { mean: 0.55, sd: 0.12 }
  };

  function normalCdf(z) {
    /* Abramowitz and Stegun approximation for the standard normal CDF. */
    var t = 1 / (1 + 0.2316419 * Math.abs(z));
    var d = 0.3989423 * Math.exp(-z * z / 2);
    var p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - p : p;
  }

  function percentileForScore(score, maxScoreValue, examKey) {
    if (!maxScoreValue || maxScoreValue <= 0) { return null; }
    var base = PERCENTILE_BASELINE[examKey] || { mean: 0.50, sd: 0.13 };
    var frac = Number(score) / Number(maxScoreValue);
    var z = (frac - base.mean) / base.sd;
    var pct = Math.round(normalCdf(z) * 100);
    if (pct < 1) { pct = 1; }
    if (pct > 99) { pct = 99; }
    return pct;
  }

  /* ---- Exam instructions, generated from the profile + mock ---- */
  /* One instruction document per exam, rendered from the same profile
     object that drives the player and the same mock that supplies the
     questions, so instructions and behaviour cannot contradict (G23).
     profile: exam-profiles entry (or the player fallback shape).
     mock: mock JSON. opts: { runModeType: 'full'|'sectional'|'topic',
     nmatMode: 'simulation'|'standard' }. Returns an HTML <ul>. */
  function buildExamInstructions(profile, mock, examKey, opts) {
    opts = opts || {};
    profile = profile || {};
    mock = mock || {};
    var key = String(examKey || '').trim().toUpperCase();
    var secs = ((mock.sections || []).slice()).sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    function secById(id) {
      var found = null;
      secs.forEach(function (s) { if (s.id === id) { found = s; } });
      return found;
    }
    function calcAllowed(sectionId) {
      var list = profile.calculatorSections || [];
      for (var i = 0; i < list.length; i++) {
        if (list[i] === '*') { return true; }
        if (list[i] === sectionId) { return true; }
        if (sectionId && String(sectionId).indexOf(list[i]) === 0) { return true; }
      }
      return false;
    }
    function calcNames() {
      var names = [];
      secs.forEach(function (s) { if (calcAllowed(s.id)) { names.push(s.name || s.id); } });
      return names;
    }
    function calcLine() {
      var names = calcNames();
      if (!names.length) { return 'This mock provides no on-screen calculator.'; }
      /* "All sections" is only true when the run covers the whole exam.
         A topic/sectional run holds a subset of the exam sections, so the
         derived mock's section list makes the comparison vacuously true
         (D-03, final verification, fix round 5): name the sections. */
      var fullRun = !opts.runModeType || opts.runModeType === 'full';
      if (fullRun && names.length === secs.length) { return 'The on-screen calculator is available in all sections.'; }
      return 'The on-screen calculator is available in ' + names.join(' and ') + ' only.';
    }
    function sectionListLine() {
      return secs.map(function (s) {
        var q = s.question_count || 0;
        var m = (s.time_limit_minutes === null || s.time_limit_minutes === undefined) ? null : s.time_limit_minutes;
        return (s.name || s.id) + ' (' + q + ' question' + (q === 1 ? '' : 's') +
          (m !== null ? ', ' + m + ' minutes' : '') + ')';
      }).join('; ');
    }
    function partMinutes(partId) {
      var parts = profile.parts || [];
      for (var i = 0; i < parts.length; i++) {
        if (parts[i].id === partId) { return Number(parts[i].minutes || 0); }
      }
      return null;
    }
    var items = [];
    var totalMin = Number(mock.duration_minutes || 0);
    if (key === 'CAT') {
      var catNames = secs.map(function (s) { return s.name || s.id; }).join(', then ');
      var catMin = secs.length ? secs[0].time_limit_minutes : null;
      items.push('Sections run in a fixed order: ' + catNames + '.' +
        (catMin ? ' Each section has ' + catMin + ' minutes.' : ''));
      items.push('You cannot return to a finished section. The next section starts automatically when a section ends.');
      items.push('Your answer is saved only when you click Save & Next or Mark for Review & Next. Selecting an option alone does not save it. Jumping to another question from the palette without Save & Next does not save your answer.');
      items.push('There is no Previous button. Move back to an earlier question with the palette.');
      items.push('Palette: white not visited, red not answered, green answered, purple marked for review, purple with a green dot answered and marked for review. A marked question with no answer is not evaluated.');
      items.push('The official mock adds a Submit Section button for each section: submitting a section closes it and moves to the next section, and after all three sections are submitted a summary of your answers is shown. The real exam has no manual submit: when a section timer reaches zero, the section ends by itself and the next section starts.');
      items.push('There is no highlighter and no on-screen scratchpad. Rough work is on the rough sheets provided at the centre.');
      items.push(calcLine());
      if (profile.titaWrongMark !== null && profile.titaWrongMark !== undefined) {
        items.push('Type-in answers (TITA) carry no negative marking: a wrong TITA scores ' + profile.titaWrongMark + '.');
      }
      items.push('For number and letter-sequence answers, an on-screen keypad appears below the TITA input. Text answers have no keypad; type them directly.');
    } else if (key === 'XAT') {
      var p1 = (profile.parts || []).filter(function (p) { return p.id === 'PART1'; })[0] || null;
      var p1Names = p1 ? p1.sections.map(function (id) { var s = secById(id); return s ? (s.name || id) : id; }) : [];
      var p1Min = partMinutes('PART1') || 170;
      var p2Min = partMinutes('PART2') || 10;
      var gk = secById('GK');
      var gkCount = gk ? (gk.question_count || 0) : 20;
      if (opts.runModeType === 'topic') {
        /* Topic mode has no per-section limit: the derived mock sets
           section time limits to null and enforces one overall clock
           (mock.duration_minutes, derived from the question count,
           minimum 10 minutes). State that clock honestly (G23
           follow-up, fix round 5); never claim a per-section limit. */
        items.push('Topic mode: this run covers ' + sectionListLine() + ' under one overall ' + totalMin + '-minute clock. There is no separate per-section time limit in this run; the test auto-submits when the overall clock ends.');
      } else if (opts.runModeType && opts.runModeType !== 'full') {
        /* Sectional mode enforces the per-section limits stored
           on the mock sections, so the instructions must state them
           instead of the shared Part 1 clock (G23-9). */
        items.push('Sectional mode: each section has its own time limit: ' + sectionListLine() + '.');
      } else {
        items.push('Part 1 (' + p1Names.join(', ') + ') shares one ' + p1Min + '-minute clock. There are no separate section time limits in Part 1; divide the time yourself.');
        items.push('General Knowledge is Part 2: ' + gkCount + ' questions in ' + p2Min + ' minutes, starting only after Part 1 ends. You cannot return to Part 1.');
      }
      var gkMark = (profile.sectionMarkingOverrides || {}).GK;
      if (gkMark) {
        items.push('General Knowledge has no negative marking (' + markingLabel(gkMark) + ').');
      }
      /* The unattempted penalty is a Part-1-wide rule (it spans all Part 1
         sections), so it only belongs on a full run. A topic/sectional run
         is not Part 1, and on a 4-question topic run the line is
         meaningless (D-04, final verification, fix round 5). */
      if (profile.unattemptedPenalty && (!opts.runModeType || opts.runModeType === 'full')) {
        items.push('In Part 1, every unattempted question beyond the first ' + resolveUnattemptedPenaltyThreshold(profile, mock) +
          ' loses ' + profile.unattemptedPenalty.penalty + ' marks.');
      }
      items.push('Your answer is saved only when you click Save & Next or Mark for Review & Next. Selecting an option alone does not save it. Jumping to another question from the palette without Save & Next does not save your answer.');
      items.push('Every question has five options (A to E). There is no Previous button. Move back to an earlier question with the palette.');
      items.push('Palette: white not visited, red not answered, green answered, purple marked for review, purple with a green dot answered and marked for review.');
      items.push('There is no highlighter and no on-screen scratchpad. Rough work is on the rough sheets provided at the centre.');
      items.push(calcLine());
    } else if (key === 'NMAT') {
      var nmatMode = opts.nmatMode || 'simulation';
      if (nmatMode === 'simulation') {
        items.push('NMAT simulation: you chose your section order before starting. Questions come one at a time with no Previous button and no palette.');
        /* Fix round 8, stream A, item 1: official GMAC sources prove
           the real NMAT does not let the candidate review or return
           to previous questions (GMAC support FAQ: "You cannot review
           or return to previous questions"; gmac.com 2026-27 page;
           Shiksha firsthand 2026), so there is no review screen and
           no revisit path in simulation. */
        items.push('You cannot go back to a previous question, review a question, or change an answer once you move on. Each answer is final when you move to the next question, and you cannot return to a finished section.');
        items.push('Your answer is recorded when you move to the next question and is final; you cannot go back to change it, and once a section ends, its answers are final.');
        items.push('At the end of each section you move straight to the next section; there is no review screen.');
      } else {
        items.push('Practice mode: free navigation is on, with the Previous button available. The real NMAT has no Previous button and no palette in either mode; revisiting is only through the review screen at the end of a section.');
        items.push('Your answer is recorded when you move to the next question. You can change an answer while its section is still open; once a section ends, its answers are final.');
        items.push('At the end of each section, if time remains, a review screen lists that section questions so you can revise them before the section closes.');
      }
      items.push('Hide clock hides the section timer; the clock keeps running. This follows the 2011 demo; the current console has not confirmed it.');
      items.push('Each section has its own time limit: ' + sectionListLine() + '. Total time ' + totalMin + ' minutes.');
      items.push('There is no negative marking and no on-screen calculator. There is no palette, no Question Paper in simulation, no highlighter and no on-screen scratchpad. Rough work is on the noteboard booklet and pen provided at the centre.');
      if (profile.simulationDisclosure) { items.push(profile.simulationDisclosure); }
      if (profile.scaledScoreNote) { items.push(profile.scaledScoreNote); }
    } else if (key === 'GMAT') {
      var gmatMin = secs.length ? secs[0].time_limit_minutes : 45;
      items.push('You chose your section order before starting. Each section has ' + gmatMin + ' minutes.');
      items.push('Your answer is recorded when you move to the next question. There is no Save step and no going back to an earlier question within a section.');
      items.push('There is no palette. Bookmark questions to find them on the Question Review and Edit screen.');
      var max = (profile.reviewAndEdit && profile.reviewAndEdit.maxChanges) || 0;
      if (profile.reviewAndEdit && profile.reviewAndEdit.enabled) {
        items.push('At the end of a section, if time remains, you get a Question Review and Edit screen: you may review as many questions as you like and change up to ' + max + ' answers per section. If the section time runs out, there is no review screen and you move straight on.');
      }
      var unofficial = unofficialScoreNote('GMAT');
      if (unofficial) { items.push(unofficial); }
      if (profile.breakMinutes) {
        /* Fix round 8, stream A, item 2: the one optional break is
           offered after the first section only, never after the
           second. */
        items.push('One optional ' + profile.breakMinutes + '-minute break is offered after the first section only.');
      }
      items.push('There is no highlighter. Rough work is on the on-screen whiteboard.');
      items.push(calcLine());
      items.push('The Data Insights calculator keys follow the description in secondary sources (a Magoosh tour of the calculator in the official Data Insights practice questions and the Princeton Review Math Workout for the GMAT): digits, the four operations, plus/minus, decimal, equals, square root, percent, reciprocal, memory keys MC, MR, MS and M+, backspace, clear entry and clear all. GMAC does not publish the official key list, so the exact set is unconfirmed.');
      if (profile.scaledScoreNote) { items.push(profile.scaledScoreNote); }
    } else if (key === 'GRE') {
      var greOrder = secs.map(function (s) {
        var m = (s.time_limit_minutes === null || s.time_limit_minutes === undefined) ? '' : ' (' + s.time_limit_minutes + ' minutes)';
        return (s.name || s.id) + m;
      }).join(', then ');
      items.push('Sections run in this order: ' + greOrder + '.');
      items.push('Every section opens with its directions. Read them, then begin the section; the section clock starts when you begin.');
      items.push('Your answers are recorded as you enter them and you can change them freely within the section. There is no Save step.');
      items.push('The real test is section-adaptive: how you do in the first Verbal or Quantitative section sets the difficulty of the second section of that measure. This fixed mock does not adapt; both sections are the same for every candidate.');
      items.push('Use Time to hide or show the timer, Help for directions (the clock keeps running), Review to see the section status table, Mark to mark a question, Back and Next to move within the section, and Exit Section to leave a section early.');
      items.push('There is no palette. The Review screen lists each question with whether you answered it and a check mark if you marked it.');
      items.push('Analytical Writing is always first: one task, 30 minutes. The editor has Cut, Paste and Undo only, and no spellcheck or grammar check. There is no Redo button.');
      items.push('In the real test the Verbal and Quantitative sections after Analytical Writing appear in an order assigned by the system; this mock uses the fixed order above.');
      items.push('There is no highlighter and no on-screen scratchpad. Rough work is on the scratch paper provided at the centre.');
      items.push('You cannot return to a finished section.');
      items.push(calcLine());
    } else {
      /* SNAP, MAT, CMAT, IBSAT and any other free-navigation exam:
         the same generated block, with each exam's own sections,
         counts, total time and marking. */
      items.push('Sections: ' + sectionListLine() + '. Total time ' + totalMin + ' minutes.');
      items.push('There are no sectional time limits in this exam. Move freely between sections with the tabs or the palette, and start in any section you choose.');
      items.push(calcLine());
      if (key === 'MAT' || key === 'CMAT') {
        items.push('Your answer is saved only when you click Save & Next or Mark for Review & Next. Selecting an option alone does not save it. Jumping to another question from the palette without Save & Next does not save your answer.');
        items.push('There is no Previous button. Move back to an earlier question with the palette.');
        items.push('Palette: white not visited, red not answered, green answered, purple marked for review, purple with a green dot answered and marked for review.');
        items.push('There is no highlighter and no on-screen scratchpad. Rough work is on the rough sheets provided at the centre.');
      }
      if (key === 'CMAT') {
        /* R4-06: the Exam Summary wording (REPRO, shared NTA platform)
           and the auto-end rule (PROVEN, CMAT 2027 bulletin Appendix IV
           point 2: when the timer reaches zero the examination ends by
           itself and the candidate is not required to end or submit it). */
        items.push('SUBMIT opens the Exam Summary, showing how many questions you answered out of the total. Once you submit, your responses will be locked and cannot be changed. When the timer reaches zero, the examination ends by itself; you are not required to end or submit it.');
      }
      if (key === 'SNAP') {
        items.push('Your answers are recorded as you select them. Use Next to move on, Mark for Review to flag a question, and Clear to remove your answer. There is no Save & Next button and no Previous button.');
        items.push('The summary on the left shows how many questions are answered, not answered, marked for review, not visited, and answered and marked for review.');
        items.push('Click Submit when you are finished. A submission summary appears, showing answered, unattempted and marked counts; choose Submit to finish or Go Back to make changes. Then END TEST and VIEW RESULT show your scores.');
        items.push('There is no highlighter and no on-screen scratchpad.');
      }
      if (key === 'IBSAT') {
        items.push('Save each answer before moving on: your answer is recorded when you click Next or Mark for Review. Moving with the palette without Next does not record it.');
        items.push('Use Next and Previous to move between questions, Mark for Review to flag a question, and Clear to remove your answer.');
        items.push('The question palette uses the MeritTrac colours: green answered, red not answered, orange marked for review, blue answered and marked, white not visited.');
        items.push('There is no highlighter and no on-screen scratchpad.');
      }
      if (key === 'SNAP') {
        var ethics = secById('ETHICS');
        if (ethics) {
          items.push('Ethics, Morality and Values is the fourth section: ' + (ethics.question_count || 10) +
            ' questions, ' + (ethics.question_count || 10) + ' marks, 1 mark each, same marking as the other sections.');
        }
      }
    }
    items.push('Marking for this mock: ' + markingLabel(mock.marking) + '.');
    items.push('If the page refreshes, resume from where you left off with the same time remaining.');
    items.push('Submit only when you are finished. The confirmation screen shows your per-section summary first.');
    return '<ul>' + items.map(function (t) { return '<li>' + escapeHtml(t) + '</li>'; }).join('') + '</ul>';
  }

  /* Difficulty label for a whole mock, from its question mix. */
  function mockDifficultyLabel(mock) {
    var items = (mock && mock.items) || [];
    if (!items.length) { return 'Medium'; }
    var total = 0, weighted = 0;
    items.forEach(function (it) {
      var w = it.difficulty === 'easy' ? 1 : it.difficulty === 'hard' ? 3 : 2;
      weighted += w; total += 1;
    });
    var avg = weighted / total;
    if (avg < 1.7) { return 'Easy'; }
    if (avg < 2.35) { return 'Medium'; }
    return 'Hard';
  }

  /* Topic-wise accuracy from a scored attempt. */
  function topicAccuracy(mock, score) {
    var byTopic = {};
    var pqById = {};
    (score.perQuestion || []).forEach(function (q) { pqById[q.id] = q; });
    (mock.items || []).forEach(function (item) {
      var pq = pqById[item.id];
      if (!pq) { return; }
      var topic = item.topic || 'Untagged';
      if (!byTopic[topic]) { byTopic[topic] = { topic: topic, total: 0, attempted: 0, correct: 0, timeMs: 0 }; }
      var t = byTopic[topic];
      t.total += 1;
      t.timeMs += pq.timeMs || 0;
      if (pq.status !== 'unattempted') { t.attempted += 1; }
      if (pq.status === 'correct') { t.correct += 1; }
    });
    var list = Object.keys(byTopic).map(function (k) { return byTopic[k]; });
    list.forEach(function (t) {
      t.accuracy = t.attempted > 0 ? (t.correct / t.attempted) : null;
    });
    list.sort(function (a, b) { return (a.accuracy === null ? -1 : a.accuracy) - (b.accuracy === null ? -1 : b.accuracy); });
    return list;
  }

  /* GRE per-measure raw counts (fix round 5, R4-03): ETS reports no
     combined GRE score (fidelity-GRE 1: Verbal Reasoning 130-170,
     Quantitative Reasoning 130-170, Analytical Writing 0-6), so the
     results page shows raw correct counts per measure instead of one
     combined total. score is a scoreAttempt result; its sections
     carry id, correct and total. A section whose id starts with VR
     counts toward Verbal, QR toward Quantitative; anything else
     (including the AW essay section) is ignored. */
  function greMeasureCounts(score) {
    var out = { VR: { correct: 0, total: 0 }, QR: { correct: 0, total: 0 } };
    (score && score.sections || []).forEach(function (sec) {
      var key = null;
      if (sec.id && sec.id.indexOf('VR') === 0) { key = 'VR'; }
      else if (sec.id && sec.id.indexOf('QR') === 0) { key = 'QR'; }
      if (!key) { return; }
      out[key].correct += Number(sec.correct || 0);
      out[key].total += Number(sec.total || 0);
    });
    return out;
  }

  /* Read every stored result in this browser, for the analytics page. */
  function readAllResults(storage) {
    var out = [];
    try {
      var keys = [];
      for (var i = 0; i < storage.length; i++) { keys.push(storage.key(i)); }
      keys.forEach(function (k) {
        if (k && k.indexOf('mba-ts-result-') === 0) {
          try {
            var rec = JSON.parse(storage.getItem(k));
            if (rec && rec.score) { out.push(rec); }
          } catch (e) { /* ignore corrupt record */ }
        }
      });
    } catch (e) { /* storage unavailable */ }
    out.sort(function (a, b) {
      return new Date(a.submittedAt || 0).getTime() - new Date(b.submittedAt || 0).getTime();
    });
    return out;
  }

  /* ---- On-screen calculator (fix round 4, GRE ETS precedence) ----
     ETS GRE on-screen calculator (PROVEN, ETS "Guidelines to Using
     the On-screen Calculator", fidelity-GRE section 11): 25 keys
     plus a Transfer Display bar, display up to 8 digits, ERROR on
     division by zero, square root of a negative number, or a result
     greater than 99,999,999 (press C to clear), a positive result
     below 0.0000001 displays as zero, and standard order of
     operations: parentheses, exponentiation (including square
     roots), multiplication and division left to right, addition and
     subtraction left to right. One memory location with M+ / MR / MC.
     Other exams keep the 19-key basic panel they already had: CAT's
     exact key set is UNPROVEN (fidelity-CAT section 11: reported
     keys are LEAD only), so no keys are added to it on unproven
     evidence. GMAT Data Insights gets its own 27-key set (fix round
     6, D-02, LEAD: convergent Magoosh and Princeton Review
     descriptions, exact set UNPROVEN, GMAC publishes no key list).
     The evaluator tokenises the expression and uses shunting-yard;
     eval() and Function() are never used. Note the evaluator keeps
     standard precedence (1+2x4 is 9) for every exam: Magoosh says
     the DI calculator does not understand order of operations and
     works left to right, which the shared evaluator does not
     reproduce; that difference is UNSETTLED, not built here. */
  var CALC_KEYS_BASIC = ['C', 'back', '+/-', '/', '7', '8', '9', 'x', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '='];
  /* 5 rows of 5: memory and clear, then digits with operators. */
  var CALC_KEYS_GRE = ['MC', 'MR', 'M+', 'C', 'CE',
    '7', '8', '9', '/', '√',
    '4', '5', '6', 'x', '(',
    '1', '2', '3', '-', ')',
    '0', '.', '+/-', '+', '='];

  /* GMAT Data Insights only, 27 keys in 5 columns: memory and clear
     on the top row, digits with operators, then CE and CA/C. LEAD
     (fix round 6, D-02): convergent secondary sources, Magoosh's
     tour of the calculator in GMAC's official DI practice questions
     and the Princeton Review "Math Workout for the GMAT", agree on
     digits, + - x /, +/-, decimal, =, sqrt, %, 1/x, MC, MR, MS, M+,
     BS, CE and a clear-all key (Magoosh labels it CA, Princeton
     labels it C, so the player labels it CA/C). The visible label
     of the BS key is the word "Backspace" (fix round 7, item 2):
     Magoosh states the real button said the word "backspace", not
     "BS", and the Princeton Review names the key "Backspace"
     throughout; the internal key id stays 'BS' and press() still
     handles it, only the rendered label changed. GMAC publishes no
     key list, so the exact set is UNPROVEN; the settle step is the
     free official practice tests 1 and 2 on mba.com, opening the
     calculator in Data Insights. This set is NOT the GRE set: no
     parentheses, no C, and it adds %, 1/x, MS, BS and CA/C. The
     panel only ever opens in Data Insights: GMAT calculatorSections
     is ['DI'], so routing on examKey here is DI-only in practice.
     Evaluation order (fix round 7, item 6, LEAD left to right):
     the DI calculator evaluates chained operations immediately
     left to right with no operator precedence (Magoosh: "it just
     calculates uninterrupted from left to right"; Princeton CE
     example: 2*3+5 then CE shows 6, the result of 2*3; GMAT Club
     founder bb: 3+2*5=== returns 625). The GMAT DI state machine
     below implements that; GRE and the basic panel keep the shared
     precedence evaluator. */
  var CALC_KEYS_GMAT_DI = ['MC', 'MR', 'MS', 'M+', 'BS',
    '7', '8', '9', '/', '√',
    '4', '5', '6', 'x', '%',
    '1', '2', '3', '-', '1/x',
    '0', '.', '+/-', '+', '=',
    'CE', 'CA/C'];

  function calcKeysForExam(examKey) {
    if (examKey === 'GRE') { return CALC_KEYS_GRE.slice(); }
    if (examKey === 'GMAT') { return CALC_KEYS_GMAT_DI.slice(); }
    return CALC_KEYS_BASIC.slice();
  }

  function calcHasTransferDisplay(examKey) { return examKey === 'GRE'; }

  function calcDigitCap(examKey) { return examKey === 'GRE' ? 8 : 12; }

  function calcErrorText(examKey) { return examKey === 'GRE' ? 'ERROR' : 'Error'; }

  function calcTokenize(expr) {
    var tokens = [];
    var s = String(expr || '');
    var i = 0;
    while (i < s.length) {
      var ch = s.charAt(i);
      if (ch === ' ' || ch === '\t') { i++; continue; }
      if ((ch >= '0' && ch <= '9') || ch === '.') {
        var num = '';
        var dots = 0;
        while (i < s.length && ((s.charAt(i) >= '0' && s.charAt(i) <= '9') || s.charAt(i) === '.')) {
          if (s.charAt(i) === '.') { dots++; }
          num += s.charAt(i);
          i++;
        }
        if (dots > 1 || num === '.') { return null; }
        tokens.push({ t: 'num', v: parseFloat(num) });
        continue;
      }
      if (ch === '+' || ch === '-' || ch === 'x' || ch === '*' || ch === '/' || ch === '÷' ||
          ch === '(' || ch === ')' || ch === '√') {
        tokens.push({ t: 'op', v: ch === '*' ? 'x' : (ch === '÷' ? '/' : ch) });
        i++;
        continue;
      }
      return null;
    }
    return tokens;
  }

  function calcPrecedence(op) {
    if (op === '+' || op === '-') { return 1; }
    if (op === 'x' || op === '/') { return 2; }
    if (op === 'u-') { return 3; }
    if (op === '√') { return 4; }
    return 0;
  }

  function calcIsRightAssoc(op) { return op === 'u-' || op === '√'; }

  /* Shunting-yard. A '-' is unary when it opens the expression or
     follows '(', another operator or '√'. '√' is a prefix function
     with the highest precedence, so it binds tighter than
     multiplication: √9x2 is 6, √(9+16) is 5. */
  function calcToRpn(tokens) {
    var out = [];
    var stack = [];
    var prev = null;
    for (var i = 0; i < tokens.length; i++) {
      var tk = tokens[i];
      if (tk.t === 'num') { out.push(tk); prev = tk; continue; }
      var op = tk.v;
      if (op === '(') { stack.push('('); prev = tk; continue; }
      if (op === ')') {
        var found = false;
        while (stack.length) {
          var top = stack.pop();
          if (top === '(') { found = true; break; }
          out.push({ t: 'op', v: top });
        }
        if (!found) { return null; }
        if (stack.length && stack[stack.length - 1] === '√') { out.push({ t: 'op', v: stack.pop() }); }
        prev = tk;
        continue;
      }
      if (op === '√') { stack.push('√'); prev = tk; continue; }
      if (op === '-') {
        var unary = !prev || (prev.t === 'op' && prev.v !== ')');
        if (unary) { op = 'u-'; }
      }
      while (stack.length) {
        var topOp = stack[stack.length - 1];
        if (topOp === '(') { break; }
        /* A pending √ has finished its operand once a binary
           operator arrives, so it pops now. */
        if (topOp === '√') { out.push({ t: 'op', v: stack.pop() }); continue; }
        if (calcPrecedence(topOp) > calcPrecedence(op) ||
            (calcPrecedence(topOp) === calcPrecedence(op) && !calcIsRightAssoc(op))) {
          out.push({ t: 'op', v: stack.pop() });
        } else { break; }
      }
      stack.push(op);
      prev = tk;
    }
    while (stack.length) {
      var rest = stack.pop();
      if (rest === '(') { return null; }
      out.push({ t: 'op', v: rest });
    }
    return out;
  }

  function calcEvalRpn(rpn) {
    var st = [];
    for (var i = 0; i < rpn.length; i++) {
      var tk = rpn[i];
      if (tk.t === 'num') { st.push(tk.v); continue; }
      if (tk.v === '√') {
        if (!st.length) { return { ok: false, error: 'syntax' }; }
        var a = st.pop();
        if (a < 0) { return { ok: false, error: 'sqrt' }; }
        st.push(Math.sqrt(a));
        continue;
      }
      if (tk.v === 'u-') {
        if (!st.length) { return { ok: false, error: 'syntax' }; }
        st.push(-st.pop());
        continue;
      }
      if (st.length < 2) { return { ok: false, error: 'syntax' }; }
      var b = st.pop();
      var c = st.pop();
      if (tk.v === '+') { st.push(c + b); }
      else if (tk.v === '-') { st.push(c - b); }
      else if (tk.v === 'x') { st.push(c * b); }
      else if (tk.v === '/') {
        if (b === 0) { return { ok: false, error: 'div0' }; }
        st.push(c / b);
      } else { return { ok: false, error: 'syntax' }; }
    }
    if (st.length !== 1) { return { ok: false, error: 'syntax' }; }
    return { ok: true, value: st[0] };
  }

  /* Returns { ok: true, value } or { ok: false, error } where error
     is 'div0' (division by zero), 'sqrt' (square root of a negative
     number) or 'syntax' (malformed expression). */
  function calcEvaluate(expr) {
    var tokens = calcTokenize(expr);
    if (!tokens || !tokens.length) { return { ok: false, error: 'syntax' }; }
    var rpn = calcToRpn(tokens);
    if (!rpn) { return { ok: false, error: 'syntax' }; }
    return calcEvalRpn(rpn);
  }

  /* Number to a display string without ever using exponent notation,
     so a small result never shows as 1.2e-7 on the calculator. */
  function calcPlainNumberString(n) {
    var s = String(n);
    if (s.indexOf('e') === -1 && s.indexOf('E') === -1) { return s; }
    var parts = s.split(/e/i);
    var mant = parts[0];
    var exp = parseInt(parts[1], 10);
    var neg = mant.charAt(0) === '-';
    if (neg) { mant = mant.slice(1); }
    var dot = mant.indexOf('.');
    var digits = mant.replace('.', '').replace(/0+$/, '') || '0';
    var point = (dot === -1 ? mant.length : dot) + exp;
    var out;
    if (point <= 0) {
      var zeros = '';
      for (var i = 0; i < -point; i++) { zeros += '0'; }
      out = '0.' + zeros + digits;
    } else if (point >= digits.length) {
      var tail = '';
      for (var j = 0; j < point - digits.length; j++) { tail += '0'; }
      out = digits + tail;
    } else {
      out = digits.slice(0, point) + '.' + digits.slice(point);
    }
    return (neg ? '-' : '') + out;
  }

  /* Format an evaluated result for the display. GRE (ETS): ERROR
     past 99,999,999, a result with magnitude below 0.0000001 shows
     as zero, otherwise at most 8 significant digits. The ETS wording
     covers positive tiny results; the same zero is used for a
     negative result of that size, since the display cannot show it.
     Other exams keep the previous behaviour: the full JS number. */
  function calcFormatResult(value, examKey) {
    var err = calcErrorText(examKey);
    if (typeof value !== 'number' || !isFinite(value)) { return err; }
    if (examKey === 'GRE') {
      if (Math.abs(value) > 99999999) { return err; }
      if (value === 0 || Math.abs(value) < 0.0000001) { return '0'; }
      var rounded = Number(value.toPrecision(8));
      if (Math.abs(rounded) > 99999999) { return err; }
      return calcPlainNumberString(rounded);
    }
    return String(value);
  }

  /* One memory location (ETS: three memory buttons, one location). */
  function createCalcMemory() {
    var stored = null;
    return {
      add: function (v) {
        var n = Number(v);
        if (!isFinite(n)) { return; }
        stored = (stored === null ? 0 : stored) + n;
      },
      /* MS (GMAT DI): replace the stored value outright. M+ adds;
         MS overwrites, erasing whatever was stored before. */
      store: function (v) {
        var n = Number(v);
        if (!isFinite(n)) { return; }
        stored = n;
      },
      recall: function () { return stored; },
      clear: function () { stored = null; },
      has: function () { return stored !== null; }
    };
  }

  /* Key-press state machine for the on-screen calculator, so the
     player and the Node tests drive the same logic. press() takes
     one key id from calcKeysForExam(examKey); display() is what the
     panel shows. In an ERROR state only C does anything (ETS: press
     C to clear; CA/C clears on the GMAT DI set). CE clears the
     entry only and leaves a pending expression alone. */
  function createCalculator(examKey) {
    var mem = createCalcMemory();
    var st = { display: '0', entry: '', tokens: [], fresh: true, justEvaluated: false, error: false };
    /* GMAT DI only (fix round 7, item 6, LEAD left to right): the
       last operation and its operand, so a repeated = repeats that
       operation (3+2*5=== gives 625). Null except right after a
       GMAT = that evaluated a plain [number, op, number] chain. */
    var lastOp = null;
    var lastOperand = null;

    /* One binary step, used by the GMAT DI immediate evaluator and
       by repeat-=. Returns null on division by zero. */
    function applyBinary(a, op, b) {
      if (op === '+') { return a + b; }
      if (op === '-') { return a - b; }
      if (op === 'x') { return a * b; }
      if (op === '/') { if (b === 0) { return null; } return a / b; }
      return null;
    }

    function errText() { return calcErrorText(examKey); }
    function digitCap() { return calcDigitCap(examKey); }
    function showError() {
      st.display = errText();
      st.entry = '';
      st.tokens = [];
      st.fresh = true;
      st.justEvaluated = false;
      st.error = true;
    }
    function entryDigits() { return st.entry.replace('-', '').replace('.', '').length; }
    function isBinOp(t) { return t === '+' || t === '-' || t === 'x' || t === '/'; }
    function flushEntry() { if (st.entry !== '') { st.tokens.push(st.entry); st.entry = ''; } }
    function openParens() {
      var d = 0;
      st.tokens.forEach(function (t) { if (t === '(') { d++; } else if (t === ')') { d--; } });
      return d;
    }
    function currentValue() { return st.entry !== '' ? parseFloat(st.entry) : parseFloat(st.display); }
    function resetEntry() { st.entry = ''; st.tokens = []; st.justEvaluated = false; st.fresh = true; lastOp = null; lastOperand = null; }
    function lastToken() { return st.tokens.length ? st.tokens[st.tokens.length - 1] : null; }
    function needsImplicitMultiply() {
      var last = lastToken();
      return last === ')' || (last !== null && last !== '(' && last !== '√' && !isBinOp(last));
    }

    function inputDigit(d) {
      if (st.justEvaluated) { resetEntry(); }
      if (st.fresh || st.entry === '') { st.entry = d; st.fresh = false; }
      else if (entryDigits() < digitCap()) { st.entry += d; }
      st.display = st.entry;
    }

    function inputDot() {
      if (st.justEvaluated) { resetEntry(); }
      if (st.fresh || st.entry === '') { st.entry = '0.'; st.fresh = false; }
      else if (st.entry.indexOf('.') === -1) { st.entry += '.'; }
      st.display = st.entry;
    }

    function applyOp(op) {
      if (st.justEvaluated) { st.tokens = [st.display]; st.justEvaluated = false; lastOp = null; lastOperand = null; }
      /* A leading minus starts a negative number, it is not 0 minus. */
      if (st.tokens.length === 0 && st.entry === '' && op === '-') {
        st.entry = '-';
        st.fresh = false;
        st.display = st.entry;
        return;
      }
      flushEntry();
      if (st.tokens.length === 0) { st.tokens.push(st.display); }
      if (isBinOp(lastToken())) { st.tokens[st.tokens.length - 1] = op; }
      else {
        /* GMAT DI only (fix round 7, item 6, LEAD left to right):
           a chained operation evaluates immediately when the next
           operator arrives, so 1+2x4 is 12 and 2+3x4 is 20. The
           result replaces the pending chain, keeping the display
           live at every step, exactly as Magoosh and the Princeton
           Review describe (Magoosh 1350x8 shows 10800 as soon as +
           is pressed). Only a plain [number, op, number] chain
           evaluates here; sqrt/paren forms fall through to the
           shared evaluator at =. GRE and the basic panel never
           enter this branch and keep deferred precedence. */
        if (examKey === 'GMAT' && st.tokens.length === 3 && isBinOp(st.tokens[1])) {
          var av = parseFloat(st.tokens[0]);
          var bv = parseFloat(st.tokens[2]);
          if (isFinite(av) && isFinite(bv)) {
            var imm = applyBinary(av, st.tokens[1], bv);
            if (imm === null) { showError(); return; }
            var immText = calcFormatResult(imm, examKey);
            if (immText === errText()) { showError(); return; }
            st.tokens = [immText];
            st.display = immText;
          }
        }
        st.tokens.push(op);
      }
      st.fresh = true;
    }

    function openParen() {
      if (st.justEvaluated) { resetEntry(); }
      flushEntry();
      if (needsImplicitMultiply()) { st.tokens.push('x'); }
      st.tokens.push('(');
      st.fresh = true;
    }

    function closeParen() {
      flushEntry();
      if (openParens() > 0) { st.tokens.push(')'); }
      st.fresh = true;
    }

    function sqrtKey() {
      if (st.justEvaluated) { st.entry = st.display; st.justEvaluated = false; }
      if (st.entry !== '') {
        /* Square root of the number being typed: applied at once, so
           √9 then x 2 is 6. A negative entry is an ETS ERROR. */
        var v = parseFloat(st.entry);
        if (v < 0) { showError(); return; }
        st.entry = calcFormatResult(Math.sqrt(v), examKey);
        if (st.entry === errText()) { showError(); return; }
        st.display = st.entry;
        st.fresh = false;
      } else {
        /* No entry: square root of what follows, as √( ... ). */
        if (needsImplicitMultiply()) { st.tokens.push('x'); }
        st.tokens.push('√');
        st.tokens.push('(');
        st.fresh = true;
      }
    }

    /* Percent key (GMAT DI, LEAD: Magoosh and Princeton agree).
       130 + 15% is 149.50 and 400 x 20% is 80, so % is not just
       divide-by-100: after + or - the entry is that percent OF the
       number on the left (15% of 130 is 19.5, then = adds it), while
       after x or / (or with no pending operator) the entry itself
       becomes hundredths (20% is 0.2). The result lands in the
       entry at once, so no = is needed after % (Princeton). */
    function percentKey() {
      var v;
      if (st.entry !== '') { v = parseFloat(st.entry); }
      else if (st.justEvaluated) { st.entry = st.display; st.justEvaluated = false; v = parseFloat(st.entry); }
      else { return; }
      if (!isFinite(v)) { return; }
      var last = lastToken();
      var pct = v / 100;
      if ((last === '+' || last === '-') && st.tokens.length >= 2) {
        var base = parseFloat(st.tokens[st.tokens.length - 2]);
        if (isFinite(base)) { pct = base * v / 100; }
      }
      st.entry = calcFormatResult(pct, examKey);
      if (st.entry === errText()) { showError(); return; }
      st.display = st.entry;
      st.fresh = false;
    }

    /* Reciprocal key (GMAT DI, LEAD: Magoosh and Princeton agree).
       2 then 1/x is 0.5, applied at once with no = needed. 1/0 is
       an error, cleared by CA/C (C on the GRE set). */
    function reciprocalKey() {
      var v;
      if (st.entry !== '') { v = parseFloat(st.entry); }
      else if (st.justEvaluated) { st.entry = st.display; st.justEvaluated = false; v = parseFloat(st.entry); }
      else { return; }
      if (!isFinite(v)) { return; }
      if (v === 0) { showError(); return; }
      st.entry = calcFormatResult(1 / v, examKey);
      if (st.entry === errText()) { showError(); return; }
      st.display = st.entry;
      st.fresh = false;
    }

    function signChange() {
      if (st.entry !== '' && st.entry !== '-') {
        st.entry = String(-parseFloat(st.entry));
        st.display = st.entry;
      } else if (st.entry === '-') {
        st.entry = '';
        st.display = '0';
        st.fresh = true;
      } else {
        st.entry = String(-parseFloat(st.display));
        st.display = st.entry;
        st.justEvaluated = false;
        st.fresh = false;
      }
    }

    function equals() {
      if (st.justEvaluated) {
        /* GMAT DI only (fix round 7, item 6, LEAD left to right):
           = repeats the last operation, so 3+2*5=== gives 625
           (25, then 125, then 625). GRE and the basic panel return
           here with no repeat, as before. */
        if (examKey === 'GMAT' && lastOp && lastOperand !== null && lastOperand !== undefined) {
          var cur = parseFloat(st.display);
          if (isFinite(cur)) {
            var rep = applyBinary(cur, lastOp, lastOperand);
            if (rep === null) { showError(); return; }
            st.display = calcFormatResult(rep, examKey);
            if (st.display === errText()) { st.error = true; }
            st.justEvaluated = true;
            st.fresh = true;
          }
        }
        return;
      }
      flushEntry();
      while (st.tokens.length && isBinOp(lastToken())) { st.tokens.pop(); }
      if (!st.tokens.length) { return; }
      if (examKey === 'GMAT') {
        /* Record the last operation for repeat-= before the tokens
           are consumed. Only a plain [number, op, number] chain
           records; sqrt/paren forms do not repeat. */
        if (st.tokens.length === 3 && isBinOp(st.tokens[1]) &&
            isFinite(parseFloat(st.tokens[0])) && isFinite(parseFloat(st.tokens[2]))) {
          lastOp = st.tokens[1];
          lastOperand = parseFloat(st.tokens[2]);
        } else { lastOp = null; lastOperand = null; }
      }
      var res = calcEvaluate(st.tokens.join(''));
      st.tokens = [];
      st.entry = '';
      if (!res.ok) { showError(); return; }
      st.display = calcFormatResult(res.value, examKey);
      if (st.display === errText()) { st.error = true; }
      st.justEvaluated = true;
      st.fresh = true;
    }

    function press(key) {
      if (st.error) {
        if (key === 'C' || key === 'CA/C') {
          st.display = '0'; st.entry = ''; st.tokens = [];
          st.fresh = true; st.justEvaluated = false; st.error = false;
        }
        return;
      }
      /* C and CA/C are both clear-all: C is the GRE/basic key, CA/C
         is the GMAT DI key (Magoosh labels it CA, Princeton C). */
      if (key === 'C' || key === 'CA/C') {
        st.display = '0'; st.entry = ''; st.tokens = [];
        st.fresh = true; st.justEvaluated = false; st.error = false;
        lastOp = null; lastOperand = null;
      } else if (key === 'CE') {
        st.entry = ''; st.fresh = true;
        /* GMAT DI only (fix round 7, item 6, LEAD left to right):
           CE shows the already-evaluated running value, not 0
           (Princeton: 2*3+5 then CE shows 6, the result of 2*3).
           With no pending operator there is no running value, so
           the display is 0 as before. GRE and the basic panel
           keep the 0 display. After a completed evaluation CE
           also ends the repeat-= chain. */
        if (examKey === 'GMAT' && st.tokens.length >= 2 && isBinOp(lastToken())) {
          st.display = st.tokens[st.tokens.length - 2];
        } else { st.display = '0'; }
        if (examKey === 'GMAT' && st.justEvaluated) { st.justEvaluated = false; lastOp = null; lastOperand = null; }
      } else if (key === 'back' || key === 'BS') {
        /* 'back' is the basic-panel key; 'BS' is the GMAT DI key
           id. The rendered GMAT label is the word "Backspace"
           (setupCalculator maps it); the id stays 'BS'. */
        if (st.entry !== '') {
          st.entry = st.entry.slice(0, -1);
          st.display = (st.entry === '' || st.entry === '-') ? '0' : st.entry;
          if (st.entry === '') { st.fresh = true; }
        } else if (st.justEvaluated) {
          st.display = st.display.length > 1 ? st.display.slice(0, -1) : '0';
          st.entry = st.display;
          st.justEvaluated = false;
          st.fresh = false;
        }
      } else if (key === '+/-') { signChange(); }
      else if (key === '√') { sqrtKey(); }
      else if (key === '%') { percentKey(); }
      else if (key === '1/x') { reciprocalKey(); }
      else if (key === '(') { openParen(); }
      else if (key === ')') { closeParen(); }
      else if (key === 'MS') {
        var sv = currentValue();
        if (isFinite(sv)) { mem.store(sv); }
        /* MS completes the entry, like M+: the next digit starts a
           new number instead of appending to the stored one. */
        st.fresh = true;
      }
      else if (key === 'M+') {
        var v = currentValue();
        if (isFinite(v)) { mem.add(v); }
        /* M+ completes the entry: the next digit starts a new
           number instead of appending to the stored one. */
        st.fresh = true;
      }
      else if (key === 'MR') {
        var m = mem.recall();
        st.entry = m === null ? '0' : String(m);
        st.display = st.entry;
        st.justEvaluated = false;
        st.fresh = true;
      }
      else if (key === 'MC') { mem.clear(); }
      else if (key === '/' || key === 'x' || key === '-' || key === '+') { applyOp(key); }
      else if (key === '=') { equals(); }
      else if (key === '.') { inputDot(); }
      else if (key >= '0' && key <= '9') { inputDigit(key); }
    }

    return {
      press: press,
      display: function () { return st.display; },
      isError: function () { return st.error; },
      memoryValue: function () { return mem.recall(); },
      keys: function () { return calcKeysForExam(examKey); },
      hasTransferDisplay: function () { return calcHasTransferDisplay(examKey); }
    };
  }

  /* R4-05 (fix round 5): the SIU SNAP mock shows scores only after two
     separate steps, END TEST then VIEW RESULT (PROVEN, snaptest.org
     mock instructions). The order is a contract: Submit, END TEST,
     VIEW RESULT. */
  function snapSubmitSteps() { return ['Submit', 'END TEST', 'VIEW RESULT']; }

  /* R4-06 (fix round 5): the CMAT Exam Summary as attested for the
     shared NTA platform (REPRO): SUBMIT leads to an Exam Summary
     confirming how many were answered out of the total, with a
     confirmation warning that responses will be locked. This is
     platform-attested, not CMAT-bulletin-proven: the CMAT 2027
     bulletin Appendix IV describes auto-end at zero only and no
     manual submit. */
  function cmatExamSummaryLine(answered, total) {
    return 'Exam Summary: ' + answered + ' answered out of ' + total +
      ' questions. Once you submit, your responses will be locked and cannot be changed.';
  }

  return {
    escapeHtml: escapeHtml,
    formatHMS: formatHMS,
    formatMS: formatMS,
    GMAT_BREAK_AUTO_START_SECONDS: GMAT_BREAK_AUTO_START_SECONDS,
    gmatBreakWaitRemaining: gmatBreakWaitRemaining,
    gmatBreakWaitExpired: gmatBreakWaitExpired,
    formatDurationMs: formatDurationMs,
    markingLabel: markingLabel,
    buildSetContext: buildSetContext,
    setContextFor: setContextFor,
    titaMatches: titaMatches,
    titaKind: titaKind,
    isAnswered: isAnswered,
    scoreItem: scoreItem,
    scoreAttempt: scoreAttempt,
    scoreAttemptWithProfile: scoreAttemptWithProfile,
    computeProfileUnattemptedPenalty: computeProfileUnattemptedPenalty,
    resolveUnattemptedPenaltyThreshold: resolveUnattemptedPenaltyThreshold,
    maxScore: maxScore,
    paletteState: paletteState,
    PALETTE_LABELS: PALETTE_LABELS,
    sectionAnswerCounts: sectionAnswerCounts,
    unofficialScoreNote: unofficialScoreNote,
    renderDiagramHTML: renderDiagramHTML,
    inferDiagramKind: inferDiagramKind,
    correctAnswerText: correctAnswerText,
    userAnswerText: userAnswerText,
    optionLetter: optionLetter,
    percentileForScore: percentileForScore,
    buildExamInstructions: buildExamInstructions,
    snapSubmitSteps: snapSubmitSteps,
    cmatExamSummaryLine: cmatExamSummaryLine,
    mockDifficultyLabel: mockDifficultyLabel,
    topicAccuracy: topicAccuracy,
    greMeasureCounts: greMeasureCounts,
    readAllResults: readAllResults,
    calcKeysForExam: calcKeysForExam,
    calcHasTransferDisplay: calcHasTransferDisplay,
    calcDigitCap: calcDigitCap,
    calcErrorText: calcErrorText,
    calcEvaluate: calcEvaluate,
    calcFormatResult: calcFormatResult,
    createCalcMemory: createCalcMemory,
    createCalculator: createCalculator
  };
});
