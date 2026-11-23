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

  /* One item scored against the mock marking scheme. */
  function scoreItem(item, answer, marking) {
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
     topic modes; sections with no scored items are left out. */
  function scoreAttempt(mock, answers, subsetItems) {
    answers = answers || {};
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
      var r = scoreItem(item, ans, marking);
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
    return {
      totalScore: totalScore,
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

  /* Palette state for one question, from its stored answer record. */
  function paletteState(rec) {
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
    'not-visited': 'Not Visited'
  };

  /* ---- Diagram rendering: native HTML table or inline SVG, never raster ---- */
  function renderDiagramHTML(diagram) {
    if (!diagram || !diagram.kind) { return ''; }
    var caption = diagram.caption ? '<figcaption class="mba-diag-caption">' + escapeHtml(diagram.caption) + '</figcaption>' : '';
    if (diagram.kind === 'table') {
      var head = '<thead><tr>' + (diagram.headers || []).map(function (h) {
        return '<th>' + escapeHtml(h) + '</th>';
      }).join('') + '</tr></thead>';
      var body = '<tbody>' + (diagram.rows || []).map(function (row) {
        return '<tr>' + row.map(function (cell) {
          return '<td>' + escapeHtml(cell) + '</td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody>';
      return '<figure class="mba-diagram mba-diagram-table">' + caption +
        '<table class="mba-diag-table">' + head + body + '</table></figure>';
    }
    if (diagram.kind === 'text') {
      return '<figure class="mba-diagram mba-diagram-text">' + caption +
        '<div class="mba-diag-text">' + escapeHtml(diagram.content || '') + '</div></figure>';
    }
    if (diagram.kind === 'pie') {
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
    if (diagram.kind === 'bar' || diagram.kind === 'line') {
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
      if (diagram.kind === 'bar') {
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

  return {
    escapeHtml: escapeHtml,
    formatHMS: formatHMS,
    formatMS: formatMS,
    formatDurationMs: formatDurationMs,
    markingLabel: markingLabel,
    buildSetContext: buildSetContext,
    setContextFor: setContextFor,
    titaMatches: titaMatches,
    isAnswered: isAnswered,
    scoreItem: scoreItem,
    scoreAttempt: scoreAttempt,
    maxScore: maxScore,
    paletteState: paletteState,
    PALETTE_LABELS: PALETTE_LABELS,
    renderDiagramHTML: renderDiagramHTML,
    correctAnswerText: correctAnswerText,
    userAnswerText: userAnswerText,
    optionLetter: optionLetter,
    percentileForScore: percentileForScore,
    mockDifficultyLabel: mockDifficultyLabel,
    topicAccuracy: topicAccuracy,
    readAllResults: readAllResults
  };
});
