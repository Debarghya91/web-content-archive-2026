/* PALearnerSync: signed-in progress sync for the learner dashboard.
   Reads and writes the Supabase tables learner_progress and
   learner_results, and reads course_certificates for the dashboard.
   Every Supabase call is guarded: any failure (no session, offline,
   CDN blocked, request timeout, RLS error) falls back silently to the
   localStorage progress the dashboard already reads. Nothing in this
   file throws, and nothing here blocks a lesson, a test or a page.
   Guests see the browser-only dashboard. Signed-in learners see their
   cloud progress merged with this browser's progress, plus their
   certificates and recommended next lessons.
   No em dashes are used in any user-facing string in this file.
   No payment code lives here: purchases stay in the iOS app only.
*/
(function (root) {
  "use strict";

  var SUPABASE_URL = "https://eofsotgclhwsdwvbbtib.supabase.co";
  var SUPABASE_KEY = "sb_publishable_4d5gOEpkTOMp7NadcV9ErA_Ujcc2ahU";
  var MIGRATED_FLAG = "pa-cloud-migrated-v1";
  var REQUEST_TIMEOUT_MS = 8000;
  var FETCH_LIMIT = 1000;

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
  function chapterOf(lessonId) {
    var m = String(lessonId || "").match(/^(ch\d+)/);
    return m ? m[1] : "";
  }
  function readLocal(key) {
    try {
      var raw = root.localStorage && root.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  /* ---------- session (via the shared auth.js client) ---------- */
  function getSession() {
    return new Promise(function (resolve) {
      try {
        if (typeof root.paAuthLoadClient === "function") {
          root.paAuthLoadClient(function (client) {
            try {
              client.auth.getSession().then(function (res) {
                var s = res && res.data && res.data.session;
                resolve(s || null);
              }).catch(function () { resolve(null); });
            } catch (e) { resolve(null); }
          });
          return;
        }
      } catch (e) { /* fall through */ }
      resolve(null);
    });
  }
  function getUser() {
    return getSession().then(function (s) {
      if (!s || !s.user) return null;
      return { id: s.user.id, email: s.user.email || "", token: s.access_token || "" };
    });
  }

  /* ---------- guarded REST calls ---------- */
  function restFetch(path, user, options) {
    var controller = null;
    var signal = null;
    try {
      if (typeof AbortController !== "undefined") {
        controller = new AbortController();
        signal = controller.signal;
        setTimeout(function () { try { controller.abort(); } catch (e) {} }, REQUEST_TIMEOUT_MS);
      }
    } catch (e) { /* no abort support, proceed without a timeout */ }
    var headers = { apikey: SUPABASE_KEY, "Content-Type": "application/json" };
    if (user && user.token) headers.Authorization = "Bearer " + user.token;
    var init = { method: (options && options.method) || "GET", headers: headers };
    if (signal) init.signal = signal;
    if (options && options.body) init.body = JSON.stringify(options.body);
    if (options && options.prefer) headers.Prefer = options.prefer;
    return fetch(SUPABASE_URL + "/rest/v1/" + path, init).then(function (res) {
      if (!res.ok) return null;
      return res.json().catch(function () { return null; });
    }).catch(function () { return null; });
  }

  /* ---------- writes (fire and forget, never throw) ---------- */
  function recordLesson(lessonId, chapterId, score) {
    try {
      if (!lessonId) return;
      getUser().then(function (user) {
        if (!user) return;
        var row = {
          user_id: user.id,
          lesson_id: String(lessonId),
          chapter_id: chapterId || chapterOf(lessonId),
          completed_at: new Date().toISOString(),
          source: "web"
        };
        if (typeof score === "number") row.score = score;
        restFetch("learner_progress?on_conflict=user_id,lesson_id", user, {
          method: "POST", body: [row], prefer: "resolution=merge-duplicates"
        });
      }).catch(function () {});
    } catch (e) { /* sync is best effort */ }
  }
  function recordResult(kind, itemId, fields) {
    try {
      if (!kind || !itemId) return;
      getUser().then(function (user) {
        if (!user) return;
        var f = fields || {};
        var path = "learner_results?user_id=eq." + encodeURIComponent(user.id) +
          "&kind=eq." + encodeURIComponent(kind) +
          "&item_id=eq." + encodeURIComponent(itemId) + "&select=attempts,best_score_percent";
        restFetch(path, user, {}).then(function (rows) {
          var prev = (rows && rows[0]) || {};
          var attempts = (prev.attempts || 0) + 1;
          var best = prev.best_score_percent;
          if (typeof f.score_percent === "number") {
            best = (best == null) ? f.score_percent : Math.max(best, f.score_percent);
          }
          var row = {
            user_id: user.id,
            kind: kind,
            item_id: String(itemId),
            attempts: attempts,
            completed_at: new Date().toISOString()
          };
          if (typeof f.score_percent === "number") row.score_percent = f.score_percent;
          if (typeof f.correct_count === "number") row.correct_count = f.correct_count;
          if (typeof f.total_questions === "number") row.total_questions = f.total_questions;
          if (best != null) row.best_score_percent = best;
          restFetch("learner_results?on_conflict=user_id,kind,item_id", user, {
            method: "POST", body: [row], prefer: "resolution=merge-duplicates"
          });
        });
      }).catch(function () {});
    } catch (e) { /* sync is best effort */ }
  }

  /* ---------- reads ---------- */
  function fetchCloud(user) {
    var base = "user_id=eq." + encodeURIComponent(user.id) + "&limit=" + FETCH_LIMIT;
    var p1 = restFetch("learner_progress?select=lesson_id,chapter_id,completed_at,score&" + base, user, {});
    var p2 = restFetch("learner_results?select=kind,item_id,score_percent,correct_count,total_questions,attempts,best_score_percent,completed_at&" + base, user, {});
    var p3 = restFetch("course_certificates?select=id,course_id,course_name,learner_name,issued_at,correct_count,total_questions,score_percent&" + base + "&order=issued_at.desc", user, {});
    return Promise.all([p1, p2, p3]).then(function (parts) {
      if (!parts[0] && !parts[1] && !parts[2]) return null;
      return {
        lessons: parts[0] || [],
        results: parts[1] || [],
        certificates: parts[2] || []
      };
    }).catch(function () { return null; });
  }

  /* ---------- one-time local to cloud migration ---------- */
  function migrateLocalOnce(user) {
    try {
      var flag = null;
      try { flag = root.localStorage && root.localStorage.getItem(MIGRATED_FLAG); } catch (e) {}
      if (flag === user.id) return;
      var progress = readLocal("payments-academy-progress-v1") || {};
      var lessons = progress.lessons || {};
      var ids = Object.keys(lessons).filter(function (id) { return lessons[id]; });
      var tests = readLocal("payments-academy-tests-v1") || {};
      var attempts = Array.isArray(tests.attempts) ? tests.attempts : [];
      var sims = readLocal("payments-academy-simulators-v1") || {};
      var simIds = Object.keys(sims).filter(function (id) { return sims[id]; });
      if (!ids.length && !attempts.length && !simIds.length) {
        try { root.localStorage.setItem(MIGRATED_FLAG, user.id); } catch (e) {}
        return;
      }
      var lessonRows = ids.map(function (id) {
        return { user_id: user.id, lesson_id: id, chapter_id: chapterOf(id),
          completed_at: new Date().toISOString(), source: "web" };
      });
      var resultRows = [];
      var bestByTest = {};
      attempts.forEach(function (a) {
        if (!a || !a.test_id) return;
        var b = bestByTest[a.test_id];
        if (!b || (a.percent || 0) > (b.percent || 0)) bestByTest[a.test_id] = a;
      });
      Object.keys(bestByTest).forEach(function (tid) {
        var a = bestByTest[tid];
        resultRows.push({ user_id: user.id, kind: "test", item_id: tid,
          score_percent: a.percent, correct_count: a.score, total_questions: a.total,
          attempts: attempts.filter(function (x) { return x.test_id === tid; }).length,
          best_score_percent: a.percent, completed_at: a.completed_at || new Date().toISOString() });
      });
      simIds.forEach(function (slug) {
        resultRows.push({ user_id: user.id, kind: "simulator", item_id: slug,
          attempts: 1, completed_at: new Date().toISOString() });
      });
      var chunk = 50;
      var i;
      for (i = 0; i < lessonRows.length; i += chunk) {
        restFetch("learner_progress?on_conflict=user_id,lesson_id", user, {
          method: "POST", body: lessonRows.slice(i, i + chunk), prefer: "resolution=merge-duplicates"
        });
      }
      for (i = 0; i < resultRows.length; i += chunk) {
        restFetch("learner_results?on_conflict=user_id,kind,item_id", user, {
          method: "POST", body: resultRows.slice(i, i + chunk), prefer: "resolution=merge-duplicates"
        });
      }
      try { root.localStorage.setItem(MIGRATED_FLAG, user.id); } catch (e) {}
    } catch (e) { /* migration is best effort */ }
  }

  /* ---------- merge cloud + local, then render ---------- */
  function mergeProgress(cloud, data) {
    var done = {};
    var scores = {};
    (cloud.lessons || []).forEach(function (r) {
      if (r && r.lesson_id) { done[r.lesson_id] = true; if (typeof r.score === "number") scores[r.lesson_id] = r.score; }
    });
    var local = readLocal("payments-academy-progress-v1") || {};
    Object.keys(local.lessons || {}).forEach(function (id) { if (local.lessons[id]) done[id] = true; });
    var lessonById = {};
    (data.lessonOrder || []).forEach(function (l) { lessonById[l.id] = l; });
    var knownDone = {};
    Object.keys(done).forEach(function (id) { if (lessonById[id]) knownDone[id] = true; });
    var chapterById = {};
    (data.chapters || []).forEach(function (c) { chapterById[c.id] = c; });
    var lessonsTotal = data.totals.lessons;
    var lessonsDoneCount = Object.keys(knownDone).length;
    var chapterRows = (data.chapters || []).map(function (c) {
      var n = 0;
      (data.lessonOrder || []).forEach(function (l) { if (l.ch === c.id && knownDone[l.id]) n++; });
      return { id: c.id, title: c.title, done: n, total: c.lessons,
        complete: c.lessons > 0 && n >= c.lessons, url: c.url };
    });
    var chapterDoneCount = chapterRows.filter(function (c) { return c.complete; }).length;
    var courseRows = (data.courses || []).map(function (course) {
      var total = 0, n = 0;
      (course.chapters || []).forEach(function (cid) {
        var ch = chapterById[cid];
        if (!ch) return;
        total += ch.lessons;
        (data.lessonOrder || []).forEach(function (l) { if (l.ch === cid && knownDone[l.id]) n++; });
      });
      return { id: course.id, title: course.title, done: n, total: total,
        complete: total > 0 && n >= total, url: course.url };
    });
    var bestTest = {};
    (cloud.results || []).forEach(function (r) {
      if (r && r.kind === "test" && r.item_id) {
        bestTest[r.item_id] = { percent: r.best_score_percent != null ? r.best_score_percent : r.score_percent,
          attempts: r.attempts || 1, when: r.completed_at };
      }
    });
    var localTests = readLocal("payments-academy-tests-v1") || {};
    (Array.isArray(localTests.attempts) ? localTests.attempts : []).forEach(function (a) {
      if (!a || !a.test_id) return;
      var b = bestTest[a.test_id];
      if (!b || (a.percent || 0) > (b.percent || 0)) {
        bestTest[a.test_id] = { percent: a.percent, attempts: (b ? b.attempts : 0) + 1, when: a.completed_at };
      }
    });
    var simsDone = {};
    (cloud.results || []).forEach(function (r) { if (r && r.kind === "simulator" && r.item_id) simsDone[r.item_id] = true; });
    var localSims = readLocal("payments-academy-simulators-v1") || {};
    Object.keys(localSims).forEach(function (id) { if (localSims[id]) simsDone[id] = true; });
    var nextLesson = null;
    (data.lessonOrder || []).some(function (l) {
      if (!knownDone[l.id]) {
        var ch = chapterById[l.ch] || {};
        nextLesson = { id: l.id, heading: l.heading, url: l.url, chapterTitle: ch.title || l.ch };
        return true;
      }
      return false;
    });
    var recommendations = [];
    if (nextLesson) recommendations.push(nextLesson);
    courseRows.forEach(function (course) {
      if (recommendations.length >= 3) return;
      if (course.done > 0 && !course.complete) {
        var next = null;
        (data.lessonOrder || []).some(function (l) {
          if ((course.chapters || []).indexOf(l.ch) !== -1 && !knownDone[l.id]) {
            next = { id: l.id, heading: l.heading, url: l.url, chapterTitle: course.title };
            return true;
          }
          return false;
        });
        if (next && next.id !== (nextLesson && nextLesson.id)) recommendations.push(next);
      }
    });
    return {
      lessonsDoneCount: lessonsDoneCount, lessonsTotal: lessonsTotal,
      chapterDoneCount: chapterDoneCount, chapterTotal: chapterRows.length,
      chapterRows: chapterRows, courseRows: courseRows,
      bestTest: bestTest, simsDone: simsDone,
      certificates: cloud.certificates || [],
      nextLesson: nextLesson, recommendations: recommendations
    };
  }

  function bar(done, total) {
    var p = pct(done, total);
    return '<div class="dash-bar"><div style="width:' + p + '%"></div></div>';
  }
  function renderCloud(container, merged, data, email) {
    var h = "";
    h += '<section class="section pa-cloud"><h2>Your synced progress</h2>';
    h += '<p class="pa-note">Signed in as ' + esc(email) + '. This progress is saved to your account, so it follows you across devices. ' +
      'Anything you finish in this browser is also saved locally, and the two are combined here.</p>';
    h += '<div class="hp-dash">';
    h += '<div class="hp-dash-card"><b>' + merged.lessonsDoneCount + ' / ' + merged.lessonsTotal + '</b><span>Lessons completed</span>' + bar(merged.lessonsDoneCount, merged.lessonsTotal) + '</div>';
    h += '<div class="hp-dash-card"><b>' + merged.chapterDoneCount + ' / ' + merged.chapterTotal + '</b><span>Chapters completed</span>' + bar(merged.chapterDoneCount, merged.chapterTotal) + '</div>';
    var certCount = merged.certificates.length;
    h += '<div class="hp-dash-card"><b>' + certCount + ' certificate' + (certCount === 1 ? '' : 's') + '</b><span>Certificates earned</span><p style="color:#5B6B85;font-size:14px;margin:6px 0 0">' +
      (certCount ? 'Issued for the courses below.' : 'Pass a course Final Assessment to earn one.') + '</p></div>';
    h += '</div>';
    if (merged.recommendations.length) {
      h += '<h3>Recommended next</h3><ul class="pa-next">';
      merged.recommendations.forEach(function (r) {
        h += '<li><a href="' + esc(r.url) + '">' + esc(r.heading) + '</a> <span class="pa-note">in ' + esc(r.chapterTitle) + '</span></li>';
      });
      h += '</ul>';
    }
    h += '<h3>Progress by course</h3>';
    h += '<table class="pa-table"><thead><tr><th>Course</th><th>Lessons</th><th>Progress</th></tr></thead><tbody>';
    merged.courseRows.forEach(function (c) {
      h += '<tr><td><a href="' + esc(c.url) + '">' + esc(c.title) + '</a>' +
        (c.complete ? ' <span class="pa-badge">Complete</span>' : '') + '</td><td>' + c.done + ' / ' + c.total + '</td><td>' + bar(c.done, c.total) + '</td></tr>';
    });
    h += '</tbody></table>';
    var testIds = Object.keys(merged.bestTest);
    if (testIds.length) {
      h += '<h3>Assessment scores</h3>';
      h += '<table class="pa-table"><thead><tr><th>Assessment</th><th>Best score</th><th>Attempts</th></tr></thead><tbody>';
      (data.tests || []).forEach(function (t) {
        var b = merged.bestTest[t.id];
        if (!b) return;
        h += '<tr><td><a href="' + esc(t.url) + '">' + esc(t.title) + '</a></td><td>' + (b.percent != null ? b.percent + '%' : 'Not scored') + '</td><td>' + (b.attempts || 1) + '</td></tr>';
      });
      h += '</tbody></table>';
    }
    var simDoneCount = Object.keys(merged.simsDone).length;
    if (simDoneCount) {
      h += '<p class="pa-note">Simulators visited: ' + simDoneCount + ' of ' + (data.simulators || []).length + '.</p>';
    }
    if (merged.certificates.length) {
      h += '<h3>Certificates</h3>';
      h += '<table class="pa-table"><thead><tr><th>Course</th><th>Issued</th><th>Score</th><th>Certificate</th></tr></thead><tbody>';
      merged.certificates.forEach(function (c) {
        var pctScore = (c.score_percent != null) ? c.score_percent : Math.round(100 * (c.correct_count || 0) / (c.total_questions || 1));
        h += '<tr><td>' + esc(c.course_name) + '</td><td>' + esc(fmtDate(c.issued_at)) + '</td><td>' +
          esc(c.correct_count) + ' / ' + esc(c.total_questions) + ' (' + pctScore + '%)</td>' +
          '<td><a href="verify?id=' + esc(c.id) + '">' + esc(c.id) + '</a></td></tr>';
      });
      h += '</tbody></table>';
    }
    h += '<p><button type="button" class="studio-btn" onclick="PALearnerSync.syncNow()">Refresh synced progress</button> ' +
      '<button type="button" class="studio-btn" onclick="paAuthSignOut()">Sign out</button></p>';
    h += '</section>';
    container.innerHTML = h;
  }
  function renderSignInPrompt(container) {
    container.innerHTML =
      '<section class="section pa-cloud"><h2>Sign in to sync your progress</h2>' +
      '<p>Your progress is currently stored only in this browser. Sign in and it is saved to your account, ' +
      'so it follows you to any device and survives clearing browser data. Lessons stay open to everyone, with or without sign-in.</p>' +
      '<p><a class="studio-btn primary" href="signin.html">Sign in</a> ' +
      '<button type="button" class="studio-btn" onclick="paAuthGoogle()">Continue with Google</button></p>' +
      '<p class="pa-note">No payment is taken on this website. Courses are available for purchase in the Payments Training Hub iOS app.</p>' +
      '</section>';
  }

  function initDashboard(containerId, data) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '<p class="pa-note">Checking your sign-in status.</p>';
    getUser().then(function (user) {
      if (!user) { renderSignInPrompt(container); return; }
      container.innerHTML = '<p class="pa-note">Loading your synced progress.</p>';
      try { migrateLocalOnce(user); } catch (e) {}
      fetchCloud(user).then(function (cloud) {
        if (!cloud) {
          container.innerHTML = '<section class="section pa-cloud"><h2>Your synced progress</h2>' +
            '<p>We could not reach the sync service right now. Your browser progress below is still available, and your synced progress will appear here when the connection returns.</p>' +
            '<p><button type="button" class="studio-btn" onclick="PALearnerSync.syncNow()">Try again</button></p></section>';
          return;
        }
        var merged = mergeProgress(cloud, data);
        renderCloud(container, merged, data, user.email);
      });
    }).catch(function () { renderSignInPrompt(container); });
  }
  function syncNow() {
    var container = document.getElementById("pa-cloud-dashboard");
    if (!container) return;
    var data = null;
    try { data = root.PA_DASH_DATA || null; } catch (e) {}
    if (!data) return;
    initDashboard("pa-cloud-dashboard", data);
  }

  root.PALearnerSync = {
    initDashboard: initDashboard,
    syncNow: syncNow,
    recordLesson: recordLesson,
    recordResult: recordResult,
    getUser: getUser
  };
})(window);
