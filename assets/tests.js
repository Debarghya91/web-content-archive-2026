/* PaymentForge test engine. Plain JavaScript, no dependencies.
   Used by every test page and by the diagnostic (placement) test page.
   Each page supplies a TEST_DATA block and calls paStartTest.
   No em dashes are used in any user-facing string in this file.
   Storage keys:
     tests:       payments-academy-tests-v1
     diagnostic:  payments-academy-diagnostic-v1
     lessons:     payments-academy-progress-v1 (read only, never written here)
*/
(function (root) {
  "use strict";

  var TESTS_KEY = "payments-academy-tests-v1";
  var DIAGNOSTIC_KEY = "payments-academy-diagnostic-v1";
  var PROGRESS_KEY = "payments-academy-progress-v1";
  var PASS_MARK = 80;

  /* ---------- small helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function pct(correct, total) {
    if (!total) return 0;
    return Math.round((correct / total) * 100);
  }
  function formatTime(totalSeconds) {
    var s = Math.max(0, totalSeconds);
    var m = Math.floor(s / 60);
    var r = s % 60;
    return (m < 10 ? "0" + m : "" + m) + ":" + (r < 10 ? "0" + r : "" + r);
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
      removeItem: function (k) { delete mem[k]; }
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
  function isEmptyProgress(value) {
    if (!value) return true;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "object") {
      if (Array.isArray(value.completed)) return value.completed.length === 0;
      if (typeof value.completedCount === "number") return value.completedCount === 0;
      return Object.keys(value).length === 0;
    }
    return false;
  }

  /* ---------- diagnostic recommendation ---------- */
  var AREA_BUNDLE = {
    "foundations": { bundle_id: "foundations", bundle_name: "Payment Foundations" },
    "messaging": { bundle_id: "messaging", bundle_name: "ISO 20022 and SWIFT Messaging" },
    "rails": { bundle_id: "rails", bundle_name: "Global Payment Rails" },
    "crossborder": { bundle_id: "crossborder", bundle_name: "Cross-Border and Correspondent Banking" },
    "clearing": { bundle_id: "clearing", bundle_name: "Clearing, Settlement and Liquidity" },
    "cards": { bundle_id: "cards", bundle_name: "Cards and Domestic Payments" },
    "compliance": { bundle_id: "compliance-ops", bundle_name: "Compliance, Risk, Operations and Reconciliation" },
    "architecture-apis": { bundle_id: "architecture-apis", bundle_name: "Payment Architecture and APIs" },
    "ba-practice": { bundle_id: "ba-practice", bundle_name: "BA and PO Professional Practice" }
  };

  function recommendCourse(areaScores, rules) {
    var areas = Object.keys(areaScores);
    var total = 0, correct = 0, i, a;
    for (i = 0; i < areas.length; i++) {
      a = areaScores[areas[i]];
      total += a.total || 0;
      correct += a.correct || 0;
    }
    var overall = pct(correct, total);
    function areaPct(id) {
      var s = areaScores[id];
      return s ? pct(s.correct, s.total) : 0;
    }
    function noAreaBelow(n) {
      for (var j = 0; j < areas.length; j++) {
        if (areaPct(areas[j]) < n) return false;
      }
      return true;
    }
    // Rules are evaluated in priority order. The fallback (lowest area) is last.
    if (overall >= 85 && noAreaBelow(50)) {
      return { rule_id: "strong-everywhere", bundle_id: "full",
        bundle_name: "The Integrated Course", overall_percent: overall,
        reason: "You scored strongly across every area, so starting at the beginning would repeat what you already know. The Integrated Course fills the remaining gaps and gives you the full academy for completeness." };
    }
    if (overall < 40) {
      return { rule_id: "complete-beginner", bundle_id: "foundations",
        bundle_name: "Payment Foundations", overall_percent: overall,
        reason: "Your scores are low across most areas, which means the foundations are the right place to start. Payment Foundations builds the ground floor solid before you touch messages or rails." };
    }
    if (areaPct("foundations") >= 75 && areaPct("messaging") < 50) {
      return { rule_id: "messaging-weak", bundle_id: "messaging",
        bundle_name: "ISO 20022 and SWIFT Messaging", overall_percent: overall,
        reason: "Your foundations are strong, but messaging is your weakest area. The ISO 20022 and SWIFT Messaging bundle takes you through MT and MX messages field by field." };
    }
    if (areaPct("crossborder") < 50) {
      return { rule_id: "crossborder-weak", bundle_id: "crossborder",
        bundle_name: "Cross-Border and Correspondent Banking", overall_percent: overall,
        reason: "Cross-border is your weakest area. The Cross-Border and Correspondent Banking bundle covers correspondent banking, serial versus cover, charges, FX and exceptions end to end." };
    }
    if (areaPct("architecture-apis") < 50) {
      return { rule_id: "architecture-weak", bundle_id: "architecture-apis",
        bundle_name: "Payment Architecture and APIs", overall_percent: overall,
        reason: "Architecture and APIs is your weakest area. The Payment Architecture and APIs bundle covers hubs, platforms, gateways and integration, the engineering view of payments." };
    }
    if (areaPct("rails") < 50) {
      return { rule_id: "rails-weak", bundle_id: "rails",
        bundle_name: "Global Payment Rails", overall_percent: overall,
        reason: "Global rails is your weakest area. The Global Payment Rails bundle covers India, US, Europe and UK rails, plus TARGET and TIPS." };
    }
    if (areaPct("clearing") < 50) {
      return { rule_id: "clearing-weak", bundle_id: "clearing",
        bundle_name: "Clearing, Settlement and Liquidity", overall_percent: overall,
        reason: "Clearing and settlement is your weakest area. The Clearing, Settlement and Liquidity bundle covers netting, settlement models, liquidity and settlement risk." };
    }
    if (areaPct("cards") < 50) {
      return { rule_id: "cards-weak", bundle_id: "cards",
        bundle_name: "Cards and Domestic Payments", overall_percent: overall,
        reason: "Cards is your weakest area. The Cards and Domestic Payments bundle covers authorisation, clearing, settlement, wallets and POS." };
    }
    if (areaPct("compliance") < 50) {
      return { rule_id: "compliance-weak", bundle_id: "compliance-ops",
        bundle_name: "Compliance, Risk, Operations and Reconciliation", overall_percent: overall,
        reason: "Compliance and operations is your weakest area. The Compliance, Risk, Operations and Reconciliation bundle covers sanctions, AML, exceptions, returns and daily operations." };
    }
    if (areaPct("ba-practice") < 50) {
      return { rule_id: "ba-practice-weak", bundle_id: "ba-practice",
        bundle_name: "BA and PO Professional Practice", overall_percent: overall,
        reason: "BA and PO practice is your weakest area. The BA and PO Professional Practice bundle covers requirements, stories, mappings, tests and the capstone." };
    }
    // Fallback: recommend the bundle for the lowest scoring area.
    var worst = null, worstPct = 101;
    for (var k = 0; k < areas.length; k++) {
      var p = areaPct(areas[k]);
      if (p < worstPct) { worstPct = p; worst = areas[k]; }
    }
    var bundle = AREA_BUNDLE[worst] || { bundle_id: "full", bundle_name: "The Integrated Course" };
    return { rule_id: "weakest-area-fallback", bundle_id: bundle.bundle_id,
      bundle_name: bundle.bundle_name, overall_percent: overall,
      reason: "Your lowest scoring area is the best place to start, so we recommend the bundle that covers it." };
  }

  /* ---------- first-visit diagnostic prompt ---------- */
  function paDiagnosticPrompt(storage) {
    var store = safeStore(storage);
    var progress = readJson(store, PROGRESS_KEY);
    var diagnostic = readJson(store, DIAGNOSTIC_KEY);
    var hasProgress = !isEmptyProgress(progress);
    var hasDiagnostic = !!diagnostic;
    if (hasDiagnostic) {
      var rec = diagnostic.recommendation || null;
      return { state: "has-diagnostic", showBigPrompt: false, hasProgress: hasProgress,
        hasDiagnostic: true, recommendation: rec,
        message: "Your placement test result is saved. Your recommended starting course is shown below, and you can retake the test any time." };
    }
    if (hasProgress) {
      return { state: "has-progress", showBigPrompt: false, hasProgress: true,
        hasDiagnostic: false, recommendation: null,
        message: "You have already started learning. Your placement test recommendation is available in the Courses section, and you can take the test any time." };
    }
    return { state: "first-visit", showBigPrompt: true, hasProgress: false,
      hasDiagnostic: false, recommendation: null,
      message: "New here? Take the 10-minute placement test and we will tell you exactly which course to start with." };
  }

  /* ---------- test runner (works in the browser and in Node) ---------- */
  function createRunner(testData, storage) {
    var store = safeStore(storage);
    var mode = testData.mode || "test"; // "test" or "diagnostic"
    var test = testData.test || {};
    var questions = testData.questions || [];
    var passMark = test.pass_mark_percent != null ? test.pass_mark_percent : PASS_MARK;
    var durationSeconds = mode === "diagnostic" ? 0 : (test.duration_minutes || questions.length) * 60;
    var state = {
      mode: mode, testId: test.id || "diagnostic", title: test.title || "Placement Test",
      status: "intro", // intro, running, confirm, submitted
      current: 0, answers: {}, marked: {}, secondsLeft: durationSeconds,
      autoSubmitted: false, result: null, reviewIndex: 0, reviewMode: false,
      startedAt: null, submittedAt: null
    };
    var timerId = null;

    function stopTimer() {
      if (timerId) { try { clearInterval(timerId); } catch (e) { /* ignore */ } timerId = null; }
    }
    function score() {
      var correct = 0, i, q;
      var perQuestion = [];
      for (i = 0; i < questions.length; i++) {
        q = questions[i];
        var chosen = state.answers[i];
        var ok = chosen != null && chosen === q.answer;
        if (ok) correct++;
        perQuestion.push({ index: i, question_id: q.id, area: q.area || q.domain || null,
          chosen: chosen == null ? null : chosen, correct_answer: q.answer,
          is_correct: ok, explanation: q.explanation });
      }
      var areaScores = {};
      for (i = 0; i < questions.length; i++) {
        var area = questions[i].area || questions[i].domain || "general";
        if (!areaScores[area]) areaScores[area] = { correct: 0, total: 0 };
        areaScores[area].total++;
        if (perQuestion[i].is_correct) areaScores[area].correct++;
      }
      Object.keys(areaScores).forEach(function (k) {
        areaScores[k].percent = pct(areaScores[k].correct, areaScores[k].total);
      });
      return { correct: correct, total: questions.length, percent: pct(correct, questions.length),
        passed: mode === "diagnostic" ? null : pct(correct, questions.length) >= passMark,
        pass_mark_percent: passMark, per_question: perQuestion, area_scores: areaScores };
    }
    function saveAttempt(result) {
      try {
        if (mode === "diagnostic") {
          var rec = recommendCourse(result.area_scores, testData.recommendation_rules || []);
          var record = { test_id: "diagnostic", title: "Placement Test",
            completed_at: new Date().toISOString(), score: result.correct,
            total: result.total, percent: result.percent,
            area_scores: result.area_scores, recommendation: rec };
          store.setItem(DIAGNOSTIC_KEY, JSON.stringify(record));
          result.recommendation = rec;
          return record;
        }
        var attempts = readJson(store, TESTS_KEY) || { attempts: [] };
        if (!Array.isArray(attempts.attempts)) attempts.attempts = [];
        var attempt = { test_id: state.testId, title: state.title,
          completed_at: new Date().toISOString(), score: result.correct,
          total: result.total, percent: result.percent, passed: result.passed,
          pass_mark_percent: passMark, auto_submitted: state.autoSubmitted };
        attempts.attempts.push(attempt);
        store.setItem(TESTS_KEY, JSON.stringify(attempts));
        return attempt;
      } catch (e) { return null; }
    }
    function doSubmit(auto) {
      if (state.status === "submitted") return state.result;
      stopTimer();
      state.autoSubmitted = !!auto;
      var result = score();
      state.result = result;
      state.status = "submitted";
      state.submittedAt = new Date().toISOString();
      saveAttempt(result);
      return result;
    }
    var api = {
      state: state,
      questions: questions,
      start: function () {
        state.status = "running";
        state.startedAt = new Date().toISOString();
        state.current = 0;
        if (mode !== "diagnostic" && typeof root.setInterval === "function") {
          stopTimer();
          timerId = root.setInterval(function () { api.tick(1); }, 1000);
        }
        return state;
      },
      answer: function (optionIndex) {
        if (state.status !== "running") return false;
        if (optionIndex < 0 || optionIndex >= questions[state.current].options.length) return false;
        state.answers[state.current] = optionIndex;
        return true;
      },
      goTo: function (index) {
        if (index < 0 || index >= questions.length) return false;
        state.current = index;
        return true;
      },
      next: function () { return api.goTo(Math.min(state.current + 1, questions.length - 1)); },
      prev: function () { return api.goTo(Math.max(state.current - 1, 0)); },
      toggleMark: function (index) {
        var i = index == null ? state.current : index;
        if (i < 0 || i >= questions.length) return false;
        state.marked[i] = !state.marked[i];
        if (!state.marked[i]) delete state.marked[i];
        return !!state.marked[i];
      },
      palette: function () {
        var out = [];
        for (var i = 0; i < questions.length; i++) {
          var answered = Object.prototype.hasOwnProperty.call(state.answers, i);
          out.push({ index: i, answered: answered, marked: !!state.marked[i],
            status: state.marked[i] ? "marked" : (answered ? "answered" : "unanswered"),
            current: i === state.current });
        }
        return out;
      },
      tick: function (seconds) {
        if (state.status !== "running" || mode === "diagnostic") return false;
        state.secondsLeft -= seconds;
        if (state.secondsLeft <= 0) {
          state.secondsLeft = 0;
          doSubmit(true);
          return true; // auto-submitted
        }
        return false;
      },
      requestSubmit: function () {
        if (state.status !== "running") return false;
        state.status = "confirm";
        return true;
      },
      cancelSubmit: function () {
        if (state.status !== "confirm") return false;
        state.status = "running";
        return true;
      },
      confirmSubmit: function () { return doSubmit(false); },
      submit: function () { return doSubmit(false); },
      retake: function () {
        stopTimer();
        state.status = "intro";
        state.current = 0; state.answers = {}; state.marked = {};
        state.secondsLeft = durationSeconds; state.autoSubmitted = false;
        state.result = null; state.reviewIndex = 0; state.reviewMode = false;
        state.startedAt = null; state.submittedAt = null;
        return state;
      },
      review: function (index) {
        if (state.status !== "submitted") return null;
        state.reviewMode = true;
        state.reviewIndex = Math.max(0, Math.min(index || 0, questions.length - 1));
        return state.result.per_question[state.reviewIndex];
      },
      reviewNext: function () {
        if (!state.reviewMode) return null;
        state.reviewIndex = Math.min(state.reviewIndex + 1, questions.length - 1);
        return state.result.per_question[state.reviewIndex];
      },
      reviewPrev: function () {
        if (!state.reviewMode) return null;
        state.reviewIndex = Math.max(state.reviewIndex - 1, 0);
        return state.result.per_question[state.reviewIndex];
      },
      getResult: function () { return state.result; },
      timeLeft: function () { return formatTime(state.secondsLeft); },
      durationSeconds: durationSeconds,
      durationMinutes: mode === "diagnostic" ? 0 : (test.duration_minutes || questions.length)
    };
    return api;
  }

  /* ---------- attempt / dashboard helpers ---------- */
  function getAttempts(storage) {
    var store = safeStore(storage);
    var data = readJson(store, TESTS_KEY);
    if (data && Array.isArray(data.attempts)) return data.attempts;
    return [];
  }
  function getDiagnosticResult(storage) {
    var store = safeStore(storage);
    return readJson(store, DIAGNOSTIC_KEY);
  }
  function dashboardSummary(storage) {
    var attempts = getAttempts(storage);
    var passed = attempts.filter(function (a) { return a.passed; }).length;
    var best = {};
    attempts.forEach(function (a) {
      if (!best[a.test_id] || a.percent > best[a.test_id].percent) best[a.test_id] = a;
    });
    return { attempts: attempts, total_attempts: attempts.length, passed_count: passed,
      best_by_test: best, diagnostic: getDiagnosticResult(storage) };
  }

  /* ---------- DOM rendering (browser only) ---------- */
  function renderDiagnosticPrompt(container, storage) {
    if (!container || typeof document === "undefined") return null;
    var decision = paDiagnosticPrompt(storage);
    if (decision.showBigPrompt) {
      container.innerHTML =
        '<div class="pa-diagnostic-banner" style="border:2px solid #1d4ed8;border-radius:12px;padding:20px;margin:16px 0;background:#eff6ff;">' +
        '<h2 style="margin:0 0 8px;">New here? Take the 10-minute placement test</h2>' +
        '<p style="margin:0 0 12px;">' + esc(decision.message) + ' Free, no account, no payment.</p>' +
        '<a href="diagnostic.html" class="pa-cta" style="display:inline-block;padding:10px 18px;background:#1d4ed8;color:#fff;border-radius:8px;text-decoration:none;">Take the placement test</a> ' +
        '<a href="courses.html" style="margin-left:12px;">Browse courses instead</a></div>';
    } else if (decision.hasDiagnostic && decision.recommendation) {
      container.innerHTML =
        '<div class="pa-diagnostic-saved" style="border:1px solid #cbd5e1;border-radius:12px;padding:16px;margin:16px 0;background:#f8fafc;">' +
        '<p style="margin:0 0 6px;"><strong>Your recommended starting course: ' + esc(decision.recommendation.bundle_name) + '</strong></p>' +
        '<p style="margin:0 0 10px;">' + esc(decision.recommendation.reason) + '</p>' +
        '<a href="courses.html#' + esc(decision.recommendation.bundle_id) + '">View this course</a> ' +
        '<a href="diagnostic.html" style="margin-left:12px;">Retake the placement test</a></div>';
    } else {
      container.innerHTML =
        '<div class="pa-diagnostic-quiet" style="margin:16px 0;">' +
        '<p style="margin:0;">Not sure where to start? <a href="diagnostic.html">Take the 10-minute placement test</a> and we will tell you exactly which course to start with.</p></div>';
    }
    return decision;
  }

  function paStartTest(containerId, testData, storage) {
    if (typeof document === "undefined") return createRunner(testData, storage);
    var container = typeof containerId === "string" ? document.getElementById(containerId) : containerId;
    if (!container) throw new Error("Test container not found: " + containerId);
    var runner = createRunner(testData, storage);
    var questions = runner.questions;
    function optionLetter(i) { return String.fromCharCode(65 + i); }
    function render() {
      var s = runner.state;
      if (s.status === "intro") {
        var intro = '<div class="pa-test-intro"><h1>' + esc(s.title) + '</h1>' +
          '<p>' + questions.length + ' questions, one at a time.</p>';
        if (s.mode === "diagnostic") {
          intro += '<p>This placement test is untimed. Take your time, there is no countdown and no pressure. It takes about 15 minutes.</p>' +
            '<p>When you finish, you will see a score for each area and one recommended starting course, with the reason.</p>';
        } else {
          intro += '<p>Time limit: ' + esc(String(runner.durationMinutes)) + ' minutes. The timer runs throughout and never pauses, and the time left counts down at the top of every question.</p>' +
            '<p>Pass mark: 80%. When the timer reaches zero, the test submits automatically.</p>' +
            '<p>Answers are not revealed during the test. After you submit, you will see the correct answer and the explanation for every question, and you can retake the test.</p>';
        }
        intro += '<p><button type="button" data-pa="start">Start the test</button></p></div>';
        container.innerHTML = intro;
        return;
      }
      if (s.status === "submitted") {
        var r = s.result;
        var html = '<div class="pa-test-result"><h1>Your result</h1>';
        if (s.mode === "diagnostic") {
          html += '<p>You scored ' + r.correct + ' out of ' + r.total + ' (' + r.percent + '%).</p>';
          html += '<h2>Scores by area</h2><ul>';
          Object.keys(r.area_scores).forEach(function (k) {
            var a = r.area_scores[k];
            html += '<li>' + esc(k) + ': ' + a.correct + ' of ' + a.total + ' (' + a.percent + '%)</li>';
          });
          html += '</ul>';
          if (r.recommendation) {
            html += '<h2>Your recommended starting course</h2><p><strong>' + esc(r.recommendation.bundle_name) + '</strong></p>' +
              '<p>' + esc(r.recommendation.reason) + '</p>' +
              '<p><a href="courses.html#' + esc(r.recommendation.bundle_id) + '">View this course and payment page</a></p>';
          }
          html += '<p><a href="tests.html">Take the full test series next</a></p>' +
            '<p><button type="button" data-pa="review">Review every question</button> ' +
            '<button type="button" data-pa="retake">Retake the placement test</button></p>';
        } else {
          html += '<p>You scored ' + r.correct + ' out of ' + r.total + ' (' + r.percent + '%).</p>' +
            '<p><strong>' + (r.passed ? 'Pass' : 'Not yet a pass') + '</strong> (pass mark ' + r.pass_mark_percent + '%)</p>' +
            (s.autoSubmitted ? '<p>The timer ran out, so the test was submitted automatically.</p>' : '') +
            '<p><button type="button" data-pa="review">Review every question</button> ' +
            '<button type="button" data-pa="retake">Retake this test</button></p>';
        }
        if (s.reviewMode) {
          var item = r.per_question[s.reviewIndex];
          var q = questions[item.index];
          html += '<div class="pa-review"><h2>Question ' + (item.index + 1) + ' of ' + questions.length + '</h2>' +
            '<p>' + esc(q.question) + '</p><ul class="pa-options">';
          q.options.forEach(function (opt, i) {
            var cls = "";
            if (i === item.correct_answer) cls = ' style="font-weight:bold;color:green;"';
            else if (i === item.chosen) cls = ' style="color:#b91c1c;"';
            html += '<li' + cls + '>' + optionLetter(i) + '. ' + esc(opt) +
              (i === item.correct_answer ? ' (correct answer)' : '') +
              (i === item.chosen && i !== item.correct_answer ? ' (your answer)' : '') + '</li>';
          });
          html += '</ul><p><strong>Why:</strong> ' + esc(q.explanation) + '</p>' +
            (q.why_wrong ? '<p><strong>Why the other options are wrong:</strong></p><ul>' +
              q.why_wrong.map(function (w, i) {
                return w ? '<li><strong>' + optionLetter(i) + '.</strong> ' + esc(w) + '</li>' : '';
              }).join('') + '</ul>' : '') +
            '<p><button type="button" data-pa="review-prev">Previous</button> ' +
            '<button type="button" data-pa="review-next">Next</button></p></div>';
        } else {
          html += '<h2>Question by question</h2><ol>';
          r.per_question.forEach(function (item) {
            var qq = questions[item.index];
            html += '<li><p>' + esc(qq.question) + '</p><p>Your answer: ' +
              (item.chosen == null ? 'Not answered' : esc(qq.options[item.chosen])) + ' - ' +
              (item.is_correct ? 'Correct' : 'Wrong') + '. Correct answer: ' + esc(qq.options[item.correct_answer]) + '</p>' +
              '<p><strong>Why:</strong> ' + esc(qq.explanation) + '</p>' +
              (qq.why_wrong ? '<p><strong>Why the other options are wrong:</strong></p><ul>' +
                qq.why_wrong.map(function (w, i) {
                  return w ? '<li><strong>' + optionLetter(i) + '.</strong> ' + esc(w) + '</li>' : '';
                }).join('') + '</ul>' : '') + '</li>';
          });
          html += '</ol>';
        }
        html += '</div>';
        container.innerHTML = html;
        return;
      }
      // running or confirm
      var q = questions[s.current];
      var palette = runner.palette();
      var h = '<div class="pa-test-run">';
      if (s.mode !== "diagnostic") {
        h += '<p>Time left: <strong id="pa-time-left" aria-live="polite">' + runner.timeLeft() + '</strong> of ' +
          esc(String(runner.durationMinutes)) + ' minutes</p>' +
          '<div class="pa-timebar" role="progressbar" aria-label="Time remaining"><div class="pa-timebar-fill" id="pa-timebar-fill" style="width:' +
          (runner.durationSeconds ? Math.max(0, Math.round(runner.state.secondsLeft / runner.durationSeconds * 100)) : 100) + '%"></div></div>';
      }
      h += '<div class="pa-palette">';
      palette.forEach(function (p) {
        var cls = (p.current ? ' current' : '') + (p.answered ? ' answered' : '') + (p.marked ? ' marked' : '');
        h += '<button type="button" class="' + cls.trim() + '" data-pa-goto="' + p.index + '" aria-pressed="' + (p.current ? 'true' : 'false') + '" aria-label="Question ' + (p.index + 1) + ', ' + p.status + '">' +
          (p.index + 1) + (p.marked ? '*' : '') + '</button>';
      });
      h += '</div><p>Answered: ' + palette.filter(function (p) { return p.answered; }).length +
        ' of ' + questions.length + '. Marked for review: ' + palette.filter(function (p) { return p.marked; }).length + '.</p>';
      h += '<h2>Question ' + (s.current + 1) + ' of ' + questions.length + '</h2><p>' + esc(q.question) + '</p><ul class="pa-options">';
      q.options.forEach(function (opt, i) {
        var checked = s.answers[s.current] === i ? ' checked' : '';
        h += '<li><label><input type="radio" name="pa-option" value="' + i + '"' + checked + '> ' + optionLetter(i) + '. ' + esc(opt) + '</label></li>';
      });
      h += '</ul><p><button type="button" data-pa="prev">Previous</button> ' +
        '<button type="button" data-pa="next">Next</button> ' +
        '<button type="button" data-pa="mark">' + (s.marked[s.current] ? 'Unmark for review' : 'Mark for review') + '</button></p>';
      if (s.status === "confirm") {
        var unanswered = palette.filter(function (p) { return !p.answered; }).length;
        h += '<div class="pa-confirm"><p>Submit this test now? You have ' + unanswered + ' unanswered question(s). You cannot change answers after submitting.</p>' +
          '<p><button type="button" data-pa="confirm-submit">Yes, submit</button> ' +
          '<button type="button" data-pa="cancel-submit">Keep working</button></p></div>';
      } else {
        h += '<p><button type="button" data-pa="request-submit">Submit test</button></p>';
      }
      h += '</div>';
      container.innerHTML = h;
    }
    container.addEventListener("click", function (ev) {
      var t = ev.target;
      if (!t) return;
      var action = t.getAttribute && t.getAttribute("data-pa");
      var goto = t.getAttribute && t.getAttribute("data-pa-goto");
      /* Advancing to another question must show the new question from its
         top: the page keeps the old scroll position otherwise, and the
         question stem is cut off above the viewport. Scroll the test
         block to just below the sticky header after every navigation. */
      function scrollToQuestion() {
        var y = container.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo(0, Math.max(0, y));
      }
      if (goto != null) { runner.goTo(parseInt(goto, 10)); render(); scrollToQuestion(); return; }
      if (action === "start") { runner.start(); render(); return; }
      if (action === "prev") { runner.prev(); render(); scrollToQuestion(); return; }
      if (action === "next") { runner.next(); render(); scrollToQuestion(); return; }
      if (action === "mark") { runner.toggleMark(); render(); return; }
      if (action === "request-submit") { runner.requestSubmit(); render(); return; }
      if (action === "cancel-submit") { runner.cancelSubmit(); render(); return; }
      if (action === "confirm-submit") { runner.confirmSubmit(); render(); return; }
      if (action === "retake") { runner.retake(); render(); return; }
      if (action === "review") { runner.review(0); render(); return; }
      if (action === "review-next") { runner.reviewNext(); render(); scrollToQuestion(); return; }
      if (action === "review-prev") { runner.reviewPrev(); render(); scrollToQuestion(); return; }
    });
    container.addEventListener("change", function (ev) {
      var t = ev.target;
      if (t && t.name === "pa-option") {
        runner.answer(parseInt(t.value, 10));
        render();
      }
    });
    /* Live countdown: the runner ticks state every second, but nothing in
       the DOM moved with it, so the displayed time never counted down and
       an auto-submit left the running view on screen. This interval keeps
       the time text and the time bar moving, and re-renders the moment an
       auto-submit lands, so the result appears without another click. */
    var lastStatus = runner.state.status;
    setInterval(function () {
      var st = runner.state;
      if (st.status === "running" || st.status === "confirm") {
        var t = document.getElementById("pa-time-left");
        if (t) t.textContent = runner.timeLeft();
        var fill = document.getElementById("pa-timebar-fill");
        if (fill && runner.durationSeconds) {
          var leftPct = Math.max(0, Math.round(st.secondsLeft / runner.durationSeconds * 100));
          fill.style.width = leftPct + "%";
          fill.style.background = st.secondsLeft <= 60 ? "#F87171" : "";
        }
      }
      if (st.status === "submitted" && lastStatus !== "submitted") {
        lastStatus = st.status;
        render();
        return;
      }
      lastStatus = st.status;
    }, 500);
    render();
    return runner;
  }

  var api = {
    TESTS_KEY: TESTS_KEY, DIAGNOSTIC_KEY: DIAGNOSTIC_KEY, PROGRESS_KEY: PROGRESS_KEY,
    PASS_MARK: PASS_MARK, createRunner: createRunner, recommendCourse: recommendCourse,
    paDiagnosticPrompt: paDiagnosticPrompt, getAttempts: getAttempts,
    getDiagnosticResult: getDiagnosticResult, dashboardSummary: dashboardSummary,
    renderDiagnosticPrompt: renderDiagnosticPrompt, paStartTest: paStartTest,
    formatTime: formatTime, pct: pct
  };
  root.PaymentForgeTests = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
