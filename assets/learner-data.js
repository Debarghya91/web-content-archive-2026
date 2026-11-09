/* PaymentForge learner data: dashboard, portfolio and backup.
   Reads the progress this academy already stores in this browser.
   Nothing here signs you in, and nothing is sent to any server.
   Storage keys read (never written by this file, except the learner
   name and a restore you confirm):
     payments-academy-progress-v1  lessons, lesson quizzes, capstones
     payments-academy-tests-v1     test attempts
     payments-academy-diagnostic-v1 placement test result
     payments-academy-labs-v1      lab step checklists
     payments-academy-isolab-v1    ISO lab exercises marked done
     pa-situations-progress-v1     situations completed, bookmarks, notes
     pf-features-progress-v1       practice experience best scores
     pa-upi-claims-v1              situations purchase claims (backup only)
     pa-note-<id>, pa-studio-bookmark-<id>  BA Studio notes and bookmarks
     payments-academy-simulators-v1  simulator visits, recorded on
       each simulator page (10/10 plan, 9 Nov 2026)
   No em dashes are used in any user-facing string in this file.
*/
(function (root) {
  "use strict";

  var PROGRESS_KEY = "payments-academy-progress-v1";
  var TESTS_KEY = "payments-academy-tests-v1";
  var DIAGNOSTIC_KEY = "payments-academy-diagnostic-v1";
  var LABS_KEY = "payments-academy-labs-v1";
  var ISO_KEY = "payments-academy-isolab-v1";
  var SIT_KEY = "pa-situations-progress-v1";
  var FEATURES_KEY = "pf-features-progress-v1";
  var SIMS_KEY = "payments-academy-simulators-v1";
  var CLAIMS_KEY = "pa-upi-claims-v1";
  var LEARNER_KEY = "payments-academy-learner-v1";
  var BACKUP_FORMAT = "payments-training-hub-backup";
  var BACKUP_VERSION = 1;
  // Date of the last backup download, so the dashboard can remind a
  // learner who has progress but no backup yet (10 Nov 2026, ChatGPT
  // review 4 priority 8: progress export reminders).
  var BACKUP_DATE_KEY = "payments-academy-backup-date-v1";
  var BACKUP_KEYS = [PROGRESS_KEY, TESTS_KEY, DIAGNOSTIC_KEY, LABS_KEY,
    ISO_KEY, SIT_KEY, FEATURES_KEY, SIMS_KEY, CLAIMS_KEY, LEARNER_KEY];
  var BACKUP_PREFIXES = ["pa-note-", "pa-studio-bookmark-"];

  var lastData = null;
  var lastSummary = null;
  var pendingBackup = null;

  /* ---------- small helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function pct(done, total) {
    if (!total) return 0;
    return Math.round((done / total) * 100);
  }
  function fmtDate(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
  }
  function safeStore(storage) {
    if (storage) return storage;
    try {
      if (typeof root.localStorage !== "undefined" && root.localStorage) return root.localStorage;
    } catch (e) { /* storage unavailable */ }
    var mem = {};
    return {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
      setItem: function (k, v) { mem[k] = String(v); },
      removeItem: function (k) { delete mem[k]; },
      key: function (i) { return Object.keys(mem)[i] || null; },
      length: 0
    };
  }
  function readJson(storage, key) {
    try {
      var raw = storage.getItem(key);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
      return null;
    } catch (e) { return null; }
  }
  function downloadText(filename, text) {
    try {
      var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      return true;
    } catch (e) { return false; }
  }
  function bar(done, total) {
    var p = pct(done, total);
    return '<div class="dash-bar"><div style="width:' + p + '%"></div></div>';
  }
  function badge(text, muted) {
    return '<span class="pa-badge' + (muted ? ' pa-badge-muted' : '') + '">' + esc(text) + '</span>';
  }

  /* ---------- summary: one read of every stored key ---------- */
  function summarize(storage, data) {
    var store = safeStore(storage);
    var progress = readJson(store, PROGRESS_KEY) || {};
    var lessonsDone = progress.lessons || {};
    var quiz = progress.quiz || {};
    var capstoneDone = progress.capstone || {};
    var testsData = readJson(store, TESTS_KEY) || {};
    var attempts = Array.isArray(testsData.attempts) ? testsData.attempts : [];
    var diagnostic = readJson(store, DIAGNOSTIC_KEY);
    var labsDone = readJson(store, LABS_KEY) || {};
    var isoDone = readJson(store, ISO_KEY) || {};
    var sit = readJson(store, SIT_KEY) || {};
    var sitCompleted = sit.completed || {};
    var sitBookmarked = sit.bookmarked || {};
    var sitNotes = sit.notes || {};
    var sitReview = sit.review || {};
    var features = readJson(store, FEATURES_KEY) || {};
    var simsDone = readJson(store, SIMS_KEY) || {};
    var simRows = (data.simulators || []).map(function (s) {
      return { id: s.slug, title: s.title, url: s.url,
        when: simsDone[s.slug] || null };
    });

    var chapterById = {};
    (data.chapters || []).forEach(function (c) { chapterById[c.id] = c; });
    var lessonById = {};
    (data.lessonOrder || []).forEach(function (l) { lessonById[l.id] = l; });
    var testById = {};
    (data.tests || []).forEach(function (t) { testById[t.id] = t; });

    var knownDone = {};
    Object.keys(lessonsDone).forEach(function (id) {
      if (lessonById[id]) knownDone[id] = true;
    });
    var lessonsTotal = data.totals.lessons;
    var lessonsDoneCount = Object.keys(knownDone).length;

    var chapterDoneCount = 0;
    var chapterRows = (data.chapters || []).map(function (c) {
      var n = 0;
      (data.lessonOrder || []).forEach(function (l) {
        if (l.ch === c.id && knownDone[l.id]) n++;
      });
      var done = c.lessons > 0 && n >= c.lessons;
      if (done) chapterDoneCount++;
      return { id: c.id, title: c.title, domain: c.domain,
        done: n, total: c.lessons, complete: done, url: c.url };
    });

    var domainRows = (data.domains || []).map(function (d) {
      var n = 0;
      (data.lessonOrder || []).forEach(function (l) {
        var ch = chapterById[l.ch];
        if (ch && ch.domain === d.name && knownDone[l.id]) n++;
      });
      return { name: d.name, chapters: d.chapters, done: n, total: d.lessons,
        complete: d.lessons > 0 && n >= d.lessons };
    });
    var domainsComplete = domainRows.filter(function (d) { return d.complete; }).length;

    var nextLesson = null;
    (data.lessonOrder || []).some(function (l) {
      if (!knownDone[l.id]) {
        var ch = chapterById[l.ch] || {};
        var inChapter = (data.lessonOrder || []).filter(function (x) { return x.ch === l.ch; });
        nextLesson = { id: l.id, ch: l.ch, n: l.n, heading: l.heading,
          url: l.url, chapterTitle: ch.title || l.ch,
          chapterTotal: inChapter.length };
        return true;
      }
      return false;
    });

    var quizKeys = Object.keys(quiz);
    var quizCorrect = quizKeys.filter(function (k) { return quiz[k]; }).length;

    var bestById = {};
    var attemptsById = {};
    var latest = null;
    attempts.forEach(function (a) {
      if (!a || !a.test_id) return;
      attemptsById[a.test_id] = (attemptsById[a.test_id] || 0) + 1;
      if (!bestById[a.test_id] || (a.percent || 0) > bestById[a.test_id].percent) {
        bestById[a.test_id] = a;
      }
      if (!latest || (a.completed_at || "") > (latest.completed_at || "")) latest = a;
    });
    var passedCount = attempts.filter(function (a) { return a && a.passed; }).length;
    var testRows = (data.tests || []).map(function (t) {
      var best = bestById[t.id];
      return { id: t.id, title: t.title, domain: t.domain, url: t.url,
        best: best ? best.percent : null, passed: best ? !!best.passed : false,
        attempts: attemptsById[t.id] || 0 };
    });

    var areaById = {};
    (data.areas || []).forEach(function (a) { areaById[a.id] = a; });
    var weakest = [];
    if (diagnostic && diagnostic.area_scores) {
      Object.keys(diagnostic.area_scores).forEach(function (areaId) {
        var s = diagnostic.area_scores[areaId];
        var p = s && typeof s.percent === "number" ? s.percent : pct(s.correct, s.total);
        if (p < 80) {
          var area = areaById[areaId] || {};
          weakest.push({ label: area.name || areaId, percent: p, kind: "area",
            link: "courses.html#" + (area.bundle_id || "full"),
            detail: (s.correct || 0) + " of " + (s.total || 0) + " correct" });
        }
      });
    }
    testRows.forEach(function (t) {
      if (t.best != null && t.best < 80) {
        weakest.push({ label: t.title, percent: t.best, kind: "test",
          link: t.url, detail: "Best score " + t.best + "%" });
      }
    });
    weakest.sort(function (a, b) { return a.percent - b.percent; });
    var seenLabels = {};
    weakest = weakest.filter(function (w) {
      if (seenLabels[w.label]) return false;
      seenLabels[w.label] = true;
      return true;
    }).slice(0, 5);

    var recommended = null;
    if (diagnostic && diagnostic.recommendation) {
      recommended = { text: "Start " + diagnostic.recommendation.bundle_name,
        link: "courses.html#" + (diagnostic.recommendation.bundle_id || "full"),
        detail: diagnostic.recommendation.reason || "" };
    } else if (weakest.length) {
      recommended = { text: "Work on your weakest area: " + weakest[0].label,
        link: weakest[0].link, detail: weakest[0].detail };
    } else if (nextLesson) {
      recommended = { text: "Continue with the next lesson: " + nextLesson.heading,
        link: nextLesson.url, detail: nextLesson.chapterTitle };
    }

    var practiceRows = (data.practice || []).map(function (f) {
      var s = features[f.id];
      return { id: f.id, title: f.title, url: f.url,
        best: s ? s.best : null, bestTotal: s ? s.bestTotal : null,
        attempts: s ? (s.attempts || 0) : 0, when: s ? s.when : null };
    });

    var labRows = (data.labs || []).map(function (l) {
      var done = labsDone[l.id] || {};
      var n = Object.keys(done).length;
      return { id: l.id, title: l.title, url: l.url, done: n, total: l.steps,
        complete: l.steps > 0 && n >= l.steps,
        hours: l.hours, difficulty: l.difficulty,
        deliverables: l.deliverables || [], templates: l.templates || [] };
    });
    var labsComplete = labRows.filter(function (l) { return l.complete; }).length;

    var capstoneRows = (data.capstones || []).map(function (p) {
      return { id: p.id, title: p.title, url: p.url, brief: p.brief,
        done: !!capstoneDone[p.id] };
    });
    var capstonesDone = capstoneRows.filter(function (p) { return p.done; }).length;

    var sitStages = (data.situations && data.situations.byId) || {};
    var sitStageDone = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    Object.keys(sitCompleted).forEach(function (id) {
      var st = sitStages[id];
      if (st && sitStageDone[st] != null) sitStageDone[st]++;
    });
    var sitTotals = (data.situations && data.situations.stages) || {};
    var sitTotal = (data.situations && data.situations.total) || 0;

    var achievements = [];
    attempts.forEach(function (a) {
      if (a && a.passed) {
        achievements.push({ date: a.completed_at || "", kind: "test",
          text: "Passed " + (a.title || a.test_id) + " (" + (a.percent || 0) + "%)" });
      }
    });
    practiceRows.forEach(function (f) {
      if (f.when && f.best != null) {
        achievements.push({ date: f.when, kind: "practice",
          text: "Best score " + f.best + " of " + f.bestTotal + " in " + f.title });
      }
    });
    if (diagnostic && diagnostic.completed_at) {
      achievements.push({ date: diagnostic.completed_at, kind: "test",
        text: "Placement test taken (" + (diagnostic.percent || 0) + "%)" });
    }
    achievements.sort(function (a, b) {
      return (b.date || "") < (a.date || "") ? -1 : 1;
    });

    var hasAnything = lessonsDoneCount > 0 || attempts.length > 0 ||
      !!diagnostic || labRows.some(function (l) { return l.done > 0; }) ||
      Object.keys(isoDone).length > 0 || Object.keys(sitCompleted).length > 0 ||
      practiceRows.some(function (f) { return f.best != null; }) ||
      simRows.some(function (s) { return s.when; }) ||
      capstonesDone > 0;

    return {
      lessonsDone: lessonsDoneCount, lessonsTotal: lessonsTotal,
      chaptersDone: chapterDoneCount, chaptersTotal: data.totals.chapters,
      chapterRows: chapterRows, domainRows: domainRows,
      domainsComplete: domainsComplete, domainsTotal: data.totals.domains,
      nextLesson: nextLesson, allLessonsDone: lessonsTotal > 0 && lessonsDoneCount >= lessonsTotal,
      quizAttempted: quizKeys.length, quizCorrect: quizCorrect,
      testAttempts: attempts.length, testPassedCount: passedCount,
      testRows: testRows, latestAttempt: latest,
      diagnostic: diagnostic, weakest: weakest, recommended: recommended,
      practiceRows: practiceRows, labRows: labRows, labsComplete: labsComplete,
      labsTotal: data.totals.labs, isoDone: Object.keys(isoDone).length,
      isoTotal: data.totals.isoLab, capstoneRows: capstoneRows,
      simRows: simRows,
      capstonesDone: capstonesDone, capstonesTotal: data.totals.capstones,
      sitCompleted: Object.keys(sitCompleted).length,
      sitBookmarked: Object.keys(sitBookmarked).length,
      sitNotes: Object.keys(sitNotes).length,
      sitReview: Object.keys(sitReview).length, sitLast: sit.last || "",
      sitStageDone: sitStageDone, sitStageTotals: sitTotals, sitTotal: sitTotal,
      achievements: achievements.slice(0, 8), hasAnything: hasAnything
    };
  }

  /* ---------- dashboard page ---------- */
  function dashboardHTML(summary, data) {
    var h = "";
    h += '<section class="section"><h2>Continue learning</h2>';
    if (!summary.hasAnything) {
      h += '<p>You have not started yet, and that is fine. Your progress will appear here as you learn. ' +
        'The quickest start is the placement test, or Lesson 1 of Chapter 1.</p>' +
        '<p><a class="studio-btn primary" href="diagnostic.html">Take the placement test</a> ' +
        '<a class="studio-btn" href="lessons/ch1s1.html">Start Lesson 1: What is a Payment</a></p>';
    } else {
      // Backup reminder (10 Nov 2026, ChatGPT review 4 priority 8):
      // a learner with progress but no backup yet gets one nudge at the
      // top of the dashboard, linking to the backup section below.
      var _backupDate = null;
      try { _backupDate = safeStore().getItem(BACKUP_DATE_KEY); } catch (e) {}
      if (!_backupDate) {
        h += '<p class="pa-notice"><strong>Back up your progress.</strong> Everything here lives in this browser only. ' +
          '<a href="#backup">Download a backup</a> so a cleared browser or a new device does not wipe it.</p>';
      }
      h += '<div class="hp-dash">';
      if (summary.nextLesson) {
        var nl = summary.nextLesson;
        h += '<div class="hp-dash-card"><b>' + esc(nl.heading) + '</b><span>Next lesson: ' +
          esc(nl.chapterTitle) + ', lesson ' + nl.n + ' of ' + nl.chapterTotal + '</span>' +
          '<p><a href="' + esc(nl.url) + '">Open this lesson</a></p></div>';
      } else if (summary.allLessonsDone) {
        h += '<div class="hp-dash-card"><b>All 706 lessons complete</b><span>You finished the whole curriculum. ' +
          'Retake a test or work a capstone to keep it sharp.</span>' +
          '<p><a href="tests.html">Retake a test</a></p></div>';
      }
      if (summary.latestAttempt) {
        var la = summary.latestAttempt;
        var test = null;
        (data.tests || []).forEach(function (t) { if (t.id === la.test_id) test = t; });
        h += '<div class="hp-dash-card"><b>' + esc(la.title || la.test_id) + ': ' + (la.percent || 0) + '%</b>' +
          '<span>Last test, ' + esc(fmtDate(la.completed_at)) + ' ' +
          (la.passed ? '(passed)' : '(not yet a pass)') + '</span>' +
          '<p><a href="' + esc(test ? test.url : "tests.html") + '">Retake this test</a> ' +
          '<a href="tests.html">All tests</a></p></div>';
      }
      if (summary.recommended) {
        h += '<div class="hp-dash-card"><b>' + esc(summary.recommended.text) + '</b>' +
          '<span>' + esc(summary.recommended.detail || "") + '</span>' +
          '<p><a href="' + esc(summary.recommended.link) + '">Go there</a></p></div>';
      }
      h += '</div>';
    }
    h += '</section>';

    h += '<section class="section"><h2>Your progress</h2>' +
      '<div class="hp-dash">' +
      '<div class="hp-dash-card"><b>' + summary.lessonsDone + ' / ' + summary.lessonsTotal + '</b>' +
      '<span>Lessons completed</span>' + bar(summary.lessonsDone, summary.lessonsTotal) + '</div>' +
      '<div class="hp-dash-card"><b>' + summary.chaptersDone + ' / ' + summary.chaptersTotal + '</b>' +
      '<span>Chapters completed (a chapter counts when every lesson in it is done)</span>' +
      bar(summary.chaptersDone, summary.chaptersTotal) + '</div>' +
      '<div class="hp-dash-card"><b>' + summary.domainsComplete + ' / ' + summary.domainsTotal + '</b>' +
      '<span>Domains fully completed</span>' + bar(summary.domainsComplete, summary.domainsTotal) + '</div>' +
      '<div class="hp-dash-card"><b>' + summary.testAttempts + ' attempt' + (summary.testAttempts === 1 ? '' : 's') +
      ' (' + summary.testPassedCount + ' passed)</b><span>Test series, pass mark 80%</span>' +
      '<p><a href="tests.html">Open the test series</a></p></div>' +
      '</div>';
    h += '<h3>Progress by domain</h3><table class="pa-table"><tr><th>Domain</th><th>Lessons done</th><th></th></tr>';
    summary.domainRows.forEach(function (d) {
      h += '<tr><td>' + esc(d.name) + '</td><td>' + d.done + ' / ' + d.total + '</td>' +
        '<td style="min-width:140px">' + bar(d.done, d.total) + '</td></tr>';
    });
    h += '</table>';
    h += '<p class="pa-note">Lesson quizzes answered: ' + summary.quizCorrect + ' correct out of ' +
      summary.quizAttempted + ' answered. A lesson counts as complete when its narration finishes ' +
      'playing, or when you tap Mark complete under a lesson.</p></section>';

    h += '<section class="section"><h2>Tests and placement</h2>';
    if (summary.diagnostic) {
      var dg = summary.diagnostic;
      h += '<p><strong>Placement test:</strong> ' + (dg.percent || 0) + '% on ' +
        esc(fmtDate(dg.completed_at)) + '. ';
      if (dg.recommendation) {
        h += 'Recommended starting course: <a href="courses.html#' +
          esc(dg.recommendation.bundle_id || "full") + '">' +
          esc(dg.recommendation.bundle_name) + '</a>.</p>';
      } else { h += '</p>'; }
      if (dg.area_scores) {
        h += '<h3>Placement scores by area</h3><table class="pa-table"><tr><th>Area</th><th>Score</th></tr>';
        Object.keys(dg.area_scores).forEach(function (areaId) {
          var s = dg.area_scores[areaId];
          var areaName = areaId;
          (data.areas || []).forEach(function (a) { if (a.id === areaId) areaName = a.name; });
          var p = s && typeof s.percent === "number" ? s.percent : pct(s.correct, s.total);
          h += '<tr><td>' + esc(areaName) + '</td><td>' + (s.correct || 0) + ' of ' +
            (s.total || 0) + ' (' + p + '%)</td></tr>';
        });
        h += '</table>';
      }
      h += '<p><a href="diagnostic.html">Retake the placement test</a></p>';
    } else {
      h += '<p>Placement test: not taken yet. <a href="diagnostic.html">Take the 10-minute placement test</a> ' +
        'and we will tell you exactly which course to start with.</p>';
    }
    h += '<h3>Test series: best score per test</h3><table class="pa-table">' +
      '<tr><th>Test</th><th>Best score</th><th>Attempts</th><th></th></tr>';
    summary.testRows.forEach(function (t) {
      h += '<tr><td><a href="' + esc(t.url) + '">' + esc(t.title) + '</a><br>' +
        '<span class="pa-note">' + esc(t.domain) + '</span></td><td>' +
        (t.best == null ? 'Not attempted yet' : t.best + '%') + '</td><td>' + t.attempts + '</td><td>' +
        (t.best == null ? '' : (t.passed ? badge("Passed") : badge("Not yet a pass", true))) + '</td></tr>';
    });
    h += '</table></section>';

    h += '<section class="section"><h2>Weakest competencies</h2>';
    if (summary.weakest.length) {
      h += '<p>These are the areas where your scores are below the 80% pass mark, weakest first. ' +
        'Each one links to the course or test that fixes it.</p><ol>';
      summary.weakest.forEach(function (w) {
        h += '<li><a href="' + esc(w.link) + '">' + esc(w.label) + '</a> ' +
          esc(w.percent) + '% <span class="pa-note">' + esc(w.detail || "") + '</span></li>';
      });
      h += '</ol>';
    } else if (summary.hasAnything) {
      h += '<p>No weak areas yet: everything you have attempted is at or above 80%. ' +
        'Take a test you have not tried to find the next gap.</p>';
    } else {
      h += '<p>Nothing to show yet. Take the placement test or any domain test and your weakest ' +
        'areas will appear here, with links to the lessons that fix them.</p>';
    }
    h += '</section>';

    h += '<section class="section"><h2>Practice</h2>' +
      '<p>Five hands-on experiences. Best scores are saved in this browser only.</p><div class="hp-grid">';
    summary.practiceRows.forEach(function (f) {
      h += '<a class="hp-card" href="' + esc(f.url) + '"><b>' + esc(f.title) + '</b>' +
        '<span>' + (f.best == null ? 'Not attempted yet' :
          'Best score: ' + f.best + ' of ' + f.bestTotal + ' (' + f.attempts + ' attempt' +
          (f.attempts === 1 ? '' : 's') + ')') + '</span></a>';
    });
    h += '</div></section>';

    h += '<section class="section"><h2>Labs and ISO exercises</h2>';
    h += '<p>' + summary.labsComplete + ' of ' + summary.labsTotal + ' labs complete. ' +
      'A lab counts as complete when every step is ticked.</p>' +
      '<table class="pa-table"><tr><th>Lab</th><th>Steps done</th><th></th></tr>';
    summary.labRows.forEach(function (l) {
      h += '<tr><td><a href="' + esc(l.url) + '">' + esc(l.title) + '</a><br>' +
        '<span class="pa-note">' + esc(l.id) + (l.difficulty ? ' &middot; ' + esc(l.difficulty) : '') +
        (l.hours ? ' &middot; about ' + esc(String(l.hours)) + ' hours' : '') + '</span></td>' +
        '<td>' + l.done + ' / ' + l.total + '</td><td>' +
        (l.complete ? badge("Complete") : badge("In progress", true)) + '</td></tr>';
    });
    h += '</table>';
    h += '<p>ISO 20022 lab: ' + summary.isoDone + ' of ' + summary.isoTotal +
      ' exercises marked done. <a href="iso-lab.html">Open the ISO lab</a></p>' +
      '<p class="pa-note">Lab deliverables, the work products each lab asks for, are listed on ' +
      'your <a href="portfolio.html">portfolio page</a>, with a downloadable record per lab.</p></section>';

    h += '<section class="section"><h2>Capstone projects</h2><div class="hp-grid">';
    summary.capstoneRows.forEach(function (p) {
      h += '<a class="hp-card" href="' + esc(p.url) + '"><b>' + esc(p.title) + '</b>' +
        '<span>' + (p.done ? 'Brief read, marked complete.' : 'Not started yet.') + ' ' +
        '<a href="' + esc(p.brief) + '">Download the brief</a></span></a>';
    });
    h += '</div><p class="pa-note">A capstone counts as complete when you open its brief from the ' +
      'projects page. The deliverables themselves are yours to keep; the academy does not ' +
      'collect them.</p></section>';

    h += '<section class="section"><h2>Payment Situations</h2>';
    h += '<p>' + summary.sitCompleted + ' of ' + summary.sitTotal + ' situations completed &middot; ' +
      summary.sitBookmarked + ' bookmarked &middot; ' + summary.sitNotes + ' with personal notes &middot; ' +
      summary.sitReview + ' of 8 Stage 6 reflection prompts ticked.</p>';
    h += '<table class="pa-table"><tr><th>Stage</th><th>Completed</th><th></th></tr>';
    var stageNames = { 1: "Stage 1: Payment mechanics", 2: "Stage 2: Processing decisions",
      3: "Stage 3: Operational exceptions", 4: "Stage 4: Cross-system consequences",
      5: "Stage 5: Complex banking scenarios", 6: "Stage 6: Senior SME judgement" };
    [1, 2, 3, 4, 5, 6].forEach(function (st) {
      var tot = summary.sitStageTotals[String(st)] || 0;
      h += '<tr><td>' + stageNames[st] + '</td><td>' + (summary.sitStageDone[st] || 0) +
        ' / ' + tot + '</td><td style="min-width:140px">' +
        bar(summary.sitStageDone[st] || 0, tot) + '</td></tr>';
    });
    h += '</table>';
    if (summary.sitLast) {
      h += '<p>Last opened situation: ' + esc(summary.sitLast) + '.</p>';
    }
    var hasAccess = false;
    try { hasAccess = (typeof root.paHasSituationsAccess === "function") && root.paHasSituationsAccess(); } catch (e) {}
    h += '<p class="pa-note">' + (hasAccess ?
      'You have access to Payment Situations in this browser.' :
      'Payment Situations is a paid product. The counts above cover the free samples you have worked through.') +
      ' <a href="situations.html">Open Payment Situations</a></p></section>';

    var simsVisited = (summary.simRows || []).filter(function (s) { return s.when; });
    h += '<section class="section"><h2>Simulators</h2>' +
      '<p>' + simsVisited.length + ' of ' + (data.simulators || []).length +
      ' simulators run in this browser.</p><div class="link-card-grid">';
    (summary.simRows || []).forEach(function (s) {
      h += '<a class="link-card" href="' + esc(s.url) + '"><b>' + esc(s.title) + '</b>' +
        '<span>' + (s.when ? 'Run ' + fmtDate(s.when) : 'Run it') + '</span></a>';
    });
    h += '</div></section>';

    h += '<section class="section"><h2>Recent achievements</h2>';
    if (summary.achievements.length) {
      h += '<ul>';
      summary.achievements.forEach(function (a) {
        h += '<li>' + esc(a.text) + ' <span class="pa-note">' + esc(fmtDate(a.date)) + '</span></li>';
      });
      h += '</ul>';
    } else {
      h += '<p>No dated achievements yet. Pass a test or finish a practice experience and it will appear here.</p>';
    }
    var milestones = [];
    if (summary.labsComplete > 0) milestones.push(summary.labsComplete + ' lab' + (summary.labsComplete === 1 ? '' : 's') + ' complete');
    if (summary.capstonesDone > 0) milestones.push(summary.capstonesDone + ' capstone' + (summary.capstonesDone === 1 ? '' : 's') + ' complete');
    var fullStages = [1, 2, 3, 4, 5, 6].filter(function (st) {
      var tot = summary.sitStageTotals[String(st)] || 0;
      return tot > 0 && (summary.sitStageDone[st] || 0) >= tot;
    });
    if (fullStages.length) milestones.push('Payment Situations stage' + (fullStages.length === 1 ? '' : 's') + ' ' + fullStages.join(', ') + ' fully complete');
    if (milestones.length) h += '<p class="pa-note">Milestones (no date recorded): ' + esc(milestones.join('; ')) + '.</p>';
    h += '</section>';

    h += '<section class="section" id="backup"><h2>Back up and restore your progress</h2>' +
      '<p>Everything on this page lives in this browser only. Clearing browser data, or moving to ' +
      'another device, wipes it. Download a backup now and keep it somewhere safe. The backup ' +
      'covers lessons, tests, placement, labs, ISO exercises, Payment Situations progress, notes ' +
      'and bookmarks, practice scores and your portfolio name. It does not include any payment ' +
      'or account details, because there are no accounts.</p>' +
      '<p><button type="button" class="studio-btn primary" onclick="PALearner.exportBackup()">Download a backup of all my progress</button></p>' +
      '<h3>Restore from a backup file</h3>' +
      '<p><input type="file" id="pa-backup-file" accept=".json,application/json" onchange="PALearner.previewBackupFile(this)"></p>' +
      '<div id="pa-backup-preview"></div>' +
      '<p id="pa-backup-result"></p>' +
      '<p class="pa-note">Restoring replaces everything currently stored in this browser with the ' +
      'contents of the backup file. Check the preview before you confirm. A file made by a newer ' +
      'version of the academy, or a file that is not a Payments Training Hub backup, is refused.</p>' +
      '</section>';
    return h;
  }

  /* ---------- portfolio page ---------- */
  function portfolioHTML(summary, data) {
    var name = "";
    try {
      var stored = safeStore().getItem(LEARNER_KEY);
      if (stored) { var parsed = JSON.parse(stored); name = (parsed && parsed.name) || ""; }
    } catch (e) {}
    var h = "";
    h += '<div class="pa-notice"><strong>What this portfolio is.</strong> This is a record of your own ' +
      'learning on Payments Training Hub, so you can show it in an interview. It is not a certificate, ' +
      'not an accredited qualification, and not independently verified by anyone. It lists what you ' +
      'completed here, and nothing more.</div>';
    h += '<section class="section pa-no-print"><h2>Your name on the portfolio</h2>' +
      '<p>Your name appears at the top of the printed report and in the downloaded portfolio file. ' +
      'It is stored in this browser only.</p>' +
      '<p><input type="text" id="pa-learner-name" value="' + esc(name) + '" placeholder="Your name" ' +
      'style="padding:8px 10px;min-width:260px;border:1px solid #cbd5e1;border-radius:8px"> ' +
      '<button type="button" class="studio-btn primary" onclick="PALearner.saveLearnerName()">Save name</button> ' +
      '<span id="pa-name-saved"></span></p></section>';

    h += '<section class="section"><h2 id="pa-portfolio-name">' + (name ? esc(name) : 'My Learning Portfolio') + '</h2>' +
      '<p>Payments Training Hub &middot; ' + summary.lessonsDone + ' of ' + summary.lessonsTotal +
      ' lessons completed &middot; ' + summary.testPassedCount + ' test' +
      (summary.testPassedCount === 1 ? '' : 's') + ' passed &middot; ' +
      summary.labsComplete + ' of ' + summary.labsTotal + ' labs complete &middot; ' +
      summary.capstonesDone + ' of ' + summary.capstonesTotal + ' capstones complete.</p></section>';

    h += '<section class="section"><h2>Content viewed</h2>' +
      '<p>' + summary.lessonsDone + ' of ' + summary.lessonsTotal + ' narrated lessons completed, across ' +
      summary.chaptersDone + ' of ' + summary.chaptersTotal + ' chapters and ' +
      summary.domainsComplete + ' of ' + summary.domainsTotal + ' domains fully completed.</p>' +
      '<p>Lesson quizzes answered: ' + summary.quizCorrect + ' correct out of ' +
      summary.quizAttempted + ' answered.</p></section>';

    h += '<section class="section"><h2>Activities completed</h2><ul>' +
      '<li>' + summary.labsComplete + ' of ' + summary.labsTotal + ' hands-on labs complete, with ' +
      summary.isoDone + ' of ' + summary.isoTotal + ' ISO 20022 exercises marked done.</li>' +
      '<li>Practice experiences attempted: ' +
      summary.practiceRows.filter(function (f) { return f.best != null; }).length + ' of ' +
      summary.practiceRows.length + '. Best scores: ' +
      (summary.practiceRows.filter(function (f) { return f.best != null; }).map(function (f) {
        return f.title + ' ' + f.best + '/' + f.bestTotal;
      }).join('; ') || 'none yet') + '.</li>' +
      '<li>Payment Situations: ' + summary.sitCompleted + ' of ' + summary.sitTotal +
      ' completed, ' + summary.sitBookmarked + ' bookmarked, ' + summary.sitNotes +
      ' with personal notes, ' + summary.sitReview + ' of 8 Stage 6 reflection prompts ticked.</li>' +
      '</ul></section>';

    h += '<section class="section"><h2>Assessments passed</h2>';
    var passedTests = summary.testRows.filter(function (t) { return t.passed; });
    if (passedTests.length) {
      h += '<ul>';
      passedTests.forEach(function (t) {
        h += '<li>' + esc(t.title) + ' (' + esc(t.domain) + '): best ' + t.best +
          '% over ' + t.attempts + ' attempt' + (t.attempts === 1 ? '' : 's') + '.</li>';
      });
      h += '</ul>';
    } else {
      h += '<p>No tests passed yet. The pass mark is 80%.</p>';
    }
    if (summary.diagnostic) {
      h += '<p>Placement test: ' + (summary.diagnostic.percent || 0) + '% on ' +
        esc(fmtDate(summary.diagnostic.completed_at)) + '.';
      if (summary.diagnostic.recommendation) {
        h += ' Recommended starting course: ' + esc(summary.diagnostic.recommendation.bundle_name) + '.';
      }
      h += '</p>';
    }
    h += '<p class="pa-note">Tests not passed yet are not listed as passes. Best scores below 80% appear ' +
      'on the dashboard, not here.</p></section>';

    h += '<section class="section"><h2>Practical deliverables produced</h2>';
    h += '<p>Capstones are end-to-end projects. A capstone counts here when you opened its brief ' +
      'from the projects page. The deliverables themselves are yours to keep; the academy does not ' +
      'collect them.</p><ul>';
    summary.capstoneRows.forEach(function (p) {
      h += '<li>' + esc(p.title) + ': ' + (p.done ? 'brief read, marked complete.' : 'not started yet.') +
        ' <a href="' + esc(p.brief) + '">Brief</a></li>';
    });
    h += '</ul>';
    h += '<p>Lab records, one file per lab, list the steps you completed and the work products the ' +
      'lab asks for.</p><table class="pa-table"><tr><th>Lab</th><th>Steps done</th><th>Record</th></tr>';
    summary.labRows.forEach(function (l) {
      h += '<tr><td>' + esc(l.title) + '</td><td>' + l.done + ' / ' + l.total + '</td>' +
        '<td><button type="button" class="studio-btn" onclick="PALearner.downloadLabRecord(\'' +
        esc(l.id) + '\')">Download record</button></td></tr>';
    });
    h += '</table></section>';

    h += '<section class="section"><h2>Recent achievements</h2>';
    if (summary.achievements.length) {
      h += '<ul>';
      summary.achievements.forEach(function (a) {
        h += '<li>' + esc(a.text) + ' <span class="pa-note">' + esc(fmtDate(a.date)) + '</span></li>';
      });
      h += '</ul>';
    } else {
      h += '<p>No dated achievements yet.</p>';
    }
    h += '</section>';

    h += '<section class="section pa-no-print"><h2>Download your portfolio</h2>' +
      '<p><button type="button" class="studio-btn primary" onclick="PALearner.printPortfolio()">Print or save as PDF</button> ' +
      '<button type="button" class="studio-btn" onclick="PALearner.downloadPortfolio()">Download portfolio (JSON)</button></p>' +
      '<p class="pa-note">The printed report is this page. The JSON file is a machine-readable copy of ' +
      'the same summary. To move all your progress to another browser, use ' +
      '<a href="dashboard.html#backup">Backup and restore on your dashboard</a>.</p></section>';
    return h;
  }

  /* ---------- backup manager ---------- */
  function buildBackup(storage) {
    var store = safeStore(storage);
    var data = {};
    BACKUP_KEYS.forEach(function (k) {
      var v = readJson(store, k);
      if (v != null) data[k] = v;
    });
    try {
      var n = store.length || 0;
      var i, k;
      var extra = [];
      if (typeof store.key === "function") {
        for (i = 0; i < n; i++) {
          k = store.key(i);
          if (k && BACKUP_PREFIXES.some(function (p) { return k.indexOf(p) === 0; })) extra.push(k);
        }
      }
      extra.forEach(function (k) {
        try { data[k] = JSON.parse(store.getItem(k)); } catch (e) { data[k] = store.getItem(k); }
      });
    } catch (e) { /* prefix scan is best effort */ }
    return { format: BACKUP_FORMAT, version: BACKUP_VERSION,
      exported_at: new Date().toISOString(), data: data };
  }
  function backupPreviewText(backup) {
    var d = backup.data || {};
    var lines = [];
    var p = d[PROGRESS_KEY] || {};
    var lessons = p.lessons ? Object.keys(p.lessons).length : 0;
    lines.push(lessons + " lessons completed");
    var t = d[TESTS_KEY] || {};
    var attempts = Array.isArray(t.attempts) ? t.attempts : [];
    lines.push(attempts.length + " test attempt" + (attempts.length === 1 ? "" : "s"));
    if (d[DIAGNOSTIC_KEY]) lines.push("placement test result included");
    var labs = d[LABS_KEY] || {};
    lines.push(Object.keys(labs).length + " lab" + (Object.keys(labs).length === 1 ? "" : "s") + " with saved steps");
    var iso = d[ISO_KEY] || {};
    lines.push(Object.keys(iso).length + " ISO lab exercises marked done");
    var sit = d[SIT_KEY] || {};
    var sitDone = sit.completed ? Object.keys(sit.completed).length : 0;
    lines.push(sitDone + " Payment Situations completed");
    var feats = d[FEATURES_KEY] || {};
    lines.push(Object.keys(feats).length + " practice experience" + (Object.keys(feats).length === 1 ? "" : "s") + " with scores");
    var prefixed = Object.keys(d).filter(function (k) {
      return BACKUP_PREFIXES.some(function (pr) { return k.indexOf(pr) === 0; });
    });
    if (prefixed.length) lines.push(prefixed.length + " studio note" + (prefixed.length === 1 ? "" : "s") + " or bookmark" + (prefixed.length === 1 ? "" : "s"));
    if (d[LEARNER_KEY]) lines.push("portfolio name included");
    return lines;
  }
  function validateBackup(text) {
    var errors = [];
    var parsed = null;
    try { parsed = JSON.parse(text); } catch (e) {
      return { ok: false, errors: ["This file is not valid JSON."], preview: [], parsed: null };
    }
    if (!parsed || typeof parsed !== "object") {
      return { ok: false, errors: ["This file is not a backup file."], preview: [], parsed: null };
    }
    if (parsed.format !== BACKUP_FORMAT) {
      errors.push("This file is not a Payments Training Hub backup. It has no backup marker, so it was refused.");
    }
    if (parsed.version == null) {
      errors.push("This backup has no version number, so it was refused.");
    } else if (parsed.version > BACKUP_VERSION) {
      errors.push("This backup was made by a newer version of the academy (version " + parsed.version + "). It cannot be restored here.");
    } else if (parsed.version < BACKUP_VERSION) {
      errors.push("This backup is from an older version (version " + parsed.version + ") and cannot be restored here.");
    }
    if (!parsed.data || typeof parsed.data !== "object") {
      errors.push("This backup has no progress data in it.");
    } else {
      Object.keys(parsed.data).forEach(function (k) {
        var known = BACKUP_KEYS.indexOf(k) !== -1 ||
          BACKUP_PREFIXES.some(function (pr) { return k.indexOf(pr) === 0; });
        if (!known) errors.push("Unknown entry in the backup: " + k + ".");
      });
    }
    if (errors.length) return { ok: false, errors: errors, preview: [], parsed: null };
    return { ok: true, errors: [], preview: backupPreviewText(parsed), parsed: parsed };
  }
  function restoreBackup(storage, parsed) {
    var store = safeStore(storage);
    var count = 0;
    Object.keys(parsed.data || {}).forEach(function (k) {
      try {
        store.setItem(k, JSON.stringify(parsed.data[k]));
        count++;
      } catch (e) { /* one failed key does not stop the rest */ }
    });
    return count;
  }

  /* ---------- DOM rendering and actions ---------- */
  function renderDashboard(containerId, data) {
    lastData = data;
    var box = document.getElementById(containerId);
    if (!box) return null;
    lastSummary = summarize(null, data);
    box.innerHTML = dashboardHTML(lastSummary, data);
    return lastSummary;
  }
  function renderPortfolio(containerId, data) {
    lastData = data;
    var box = document.getElementById(containerId);
    if (!box) return null;
    lastSummary = summarize(null, data);
    box.innerHTML = portfolioHTML(lastSummary, data);
    return lastSummary;
  }
  function exportBackup() {
    var backup = buildBackup(null);
    var today = new Date().toISOString().slice(0, 10);
    downloadText("payments-training-hub-backup-" + today + ".json",
      JSON.stringify(backup, null, 2));
    try { safeStore().setItem(BACKUP_DATE_KEY, today); } catch (e) {}
    var r = document.getElementById("pa-backup-result");
    if (r) r.textContent = "Backup downloaded. Keep the file somewhere safe; it is the only copy of your progress outside this browser.";
  }
  function previewBackupFile(input) {
    var preview = document.getElementById("pa-backup-preview");
    var result = document.getElementById("pa-backup-result");
    pendingBackup = null;
    if (!input || !input.files || !input.files[0]) return;
    var file = input.files[0];
    var reader = new FileReader();
    reader.onload = function () {
      var check = validateBackup(String(reader.result || ""));
      if (!check.ok) {
        if (preview) {
          preview.innerHTML = '<div class="pa-notice"><strong>This backup was refused.</strong><ul>' +
            check.errors.map(function (e) { return "<li>" + esc(e) + "</li>"; }).join("") + "</ul></div>";
        }
        return;
      }
      pendingBackup = check.parsed;
      if (preview) {
        preview.innerHTML = '<div class="pa-notice"><strong>This backup looks valid.</strong>' +
          '<p>Exported ' + esc(fmtDate(check.parsed.exported_at)) + '. It contains:</p><ul>' +
          check.preview.map(function (line) { return "<li>" + esc(line) + "</li>"; }).join("") + "</ul>" +
          '<p><strong>Restoring replaces everything currently stored in this browser.</strong> ' +
          'Your current progress will be overwritten, not merged.</p>' +
          '<p><button type="button" class="studio-btn primary" onclick="PALearner.confirmRestore()">Yes, restore this backup</button></p></div>';
      }
    };
    reader.onerror = function () {
      if (preview) preview.innerHTML = '<div class="pa-notice"><strong>That file could not be read.</strong> Try downloading a fresh backup first.</div>';
    };
    reader.readAsText(file);
  }
  function confirmRestore() {
    var result = document.getElementById("pa-backup-result");
    if (!pendingBackup) {
      if (result) result.textContent = "No valid backup is waiting. Choose a backup file first.";
      return;
    }
    var n = restoreBackup(null, pendingBackup);
    pendingBackup = null;
    if (result) result.textContent = "Restored " + n + " saved item" + (n === 1 ? "" : "s") + ". The page will reload to show your restored progress.";
    setTimeout(function () { try { location.reload(); } catch (e) {} }, 1200);
  }
  function saveLearnerName() {
    var input = document.getElementById("pa-learner-name");
    var saved = document.getElementById("pa-name-saved");
    if (!input) return;
    var name = String(input.value || "").trim().slice(0, 120);
    try {
      safeStore().setItem(LEARNER_KEY, JSON.stringify({ name: name }));
    } catch (e) {}
    if (saved) saved.textContent = name ? "Saved." : "Cleared.";
    var title = document.getElementById("pa-portfolio-name");
    if (title) title.textContent = name || "My Learning Portfolio";
  }
  function printPortfolio() {
    try { window.print(); } catch (e) {}
  }
  function downloadPortfolio() {
    if (!lastSummary) return;
    var name = "";
    try {
      var stored = safeStore().getItem(LEARNER_KEY);
      if (stored) { var parsed = JSON.parse(stored); name = (parsed && parsed.name) || ""; }
    } catch (e) {}
    var doc = {
      format: "payments-training-hub-portfolio", version: 1,
      exported_at: new Date().toISOString(), learner_name: name,
      summary: {
        lessons_completed: lastSummary.lessonsDone + " of " + lastSummary.lessonsTotal,
        chapters_completed: lastSummary.chaptersDone + " of " + lastSummary.chaptersTotal,
        domains_fully_completed: lastSummary.domainsComplete + " of " + lastSummary.domainsTotal,
        tests_passed: lastSummary.testRows.filter(function (t) { return t.passed; }).map(function (t) {
          return { title: t.title, domain: t.domain, best_percent: t.best, attempts: t.attempts };
        }),
        placement_percent: lastSummary.diagnostic ? lastSummary.diagnostic.percent : null,
        labs_complete: lastSummary.labsComplete + " of " + lastSummary.labsTotal,
        iso_exercises_done: lastSummary.isoDone + " of " + lastSummary.isoTotal,
        capstones_complete: lastSummary.capstonesDone + " of " + lastSummary.capstonesTotal,
        situations_completed: lastSummary.sitCompleted + " of " + lastSummary.sitTotal,
        practice_best_scores: lastSummary.practiceRows.filter(function (f) { return f.best != null; }).map(function (f) {
          return { title: f.title, best: f.best, total: f.bestTotal, attempts: f.attempts };
        }),
        achievements: lastSummary.achievements
      },
      note: "A record of learning on Payments Training Hub. Not a certificate, not an accredited qualification, and not independently verified."
    };
    downloadText("payments-training-hub-portfolio.json", JSON.stringify(doc, null, 2));
  }
  function downloadLabRecord(labId) {
    if (!lastData || !lastSummary) return;
    var lab = null;
    (lastSummary.labRows || []).forEach(function (l) { if (l.id === labId) lab = l; });
    if (!lab) return;
    var lines = [];
    lines.push("Payments Training Hub: lab record");
    lines.push("Lab: " + lab.title + " (" + lab.id + ")");
    lines.push("Steps completed: " + lab.done + " of " + lab.total +
      (lab.complete ? " (complete)" : " (in progress)"));
    lines.push("Difficulty: " + (lab.difficulty || "not stated"));
    lines.push("Estimated time: " + (lab.hours ? lab.hours + " hours" : "not stated"));
    lines.push("");
    lines.push("Work products this lab asks for:");
    (lab.deliverables || []).forEach(function (d) { lines.push("- " + (d.name || d)); });
    if (!(lab.deliverables || []).length) lines.push("- none listed");
    lines.push("");
    lines.push("Templates named in the lab:");
    (lab.templates || []).forEach(function (t) { lines.push("- " + t); });
    if (!(lab.templates || []).length) lines.push("- none listed");
    lines.push("");
    lines.push("This record lists what you completed in the lab. The work products themselves are yours to keep; the academy does not collect them.");
    downloadText("lab-" + String(labId).toLowerCase() + "-record.txt", lines.join("\n"));
  }

  var api = {
    PROGRESS_KEY: PROGRESS_KEY, TESTS_KEY: TESTS_KEY,
    DIAGNOSTIC_KEY: DIAGNOSTIC_KEY, LABS_KEY: LABS_KEY, ISO_KEY: ISO_KEY,
    SIT_KEY: SIT_KEY, FEATURES_KEY: FEATURES_KEY, LEARNER_KEY: LEARNER_KEY,
    BACKUP_FORMAT: BACKUP_FORMAT, BACKUP_VERSION: BACKUP_VERSION,
    summarize: summarize, dashboardHTML: dashboardHTML,
    portfolioHTML: portfolioHTML, buildBackup: buildBackup,
    validateBackup: validateBackup, restoreBackup: restoreBackup,
    renderDashboard: renderDashboard, renderPortfolio: renderPortfolio,
    exportBackup: exportBackup, previewBackupFile: previewBackupFile,
    confirmRestore: confirmRestore, saveLearnerName: saveLearnerName,
    printPortfolio: printPortfolio, downloadPortfolio: downloadPortfolio,
    downloadLabRecord: downloadLabRecord
  };
  root.PALearner = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
