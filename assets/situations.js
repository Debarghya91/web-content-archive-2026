
/* ===== Payment Situations page ===== */
/* Gate first, data second: the item data file is requested only after
   paHasSituationsAccess() passes, so a plain view-source of this page
   shows no item content. Honest limit: the data file is a static
   asset, so a determined user who inspects network requests can fetch
   it, and screenshots cannot be prevented. Real server-side
   enforcement needs the Supabase backend. */
var PA_SIT_ITEMS = [];
var PA_SIT_INDEX = 0;
var PA_SIT_DEEPLINK_ID = '';
var PA_SIT_DEEPLINK_MISSING = '';
var PA_SIT_STAGE = '';
var PA_SIT_DOMAIN = '';
var PA_SIT_MESSAGE = '';
var PA_SIT_FAILURE = '';
var PA_SIT_LEVEL = '';
var PA_SIT_RESOLUTION = '';
var PA_SIT_QUERY = '';
var PA_SIT_BOOKMARKED_ONLY = false;
var PA_SIT_DASH_FILTER = '';
var PA_SIT_PROGRESS_KEY = 'pa-situations-progress-v1';
/* Mastery states (ChatGPT review P1#7, 9 Nov 2026). Opening a
   situation marks it Read only; the learner marks the deeper states
   themselves. Nothing else sets a state: opening is never proof of
   mastery. */
var PA_SIT_MASTERY_ORDER = ['read', 'understood', 'practised', 'reviewed'];
var PA_SIT_MASTERY_LABELS = {read: 'Read', understood: 'Understood', practised: 'Practised', reviewed: 'Reviewed'};
function paSitProgress(){
  try {
    var v = JSON.parse(localStorage.getItem(PA_SIT_PROGRESS_KEY));
    if(v && typeof v === 'object'){
      if(!v.completed) v.completed = {};
      if(!v.bookmarked) v.bookmarked = {};
      if(!v.notes) v.notes = {};
      if(!v.review) v.review = {};
      if(!v.mastery) v.mastery = {};
      if(!v.last_at) v.last_at = '';
      return v;
    }
  } catch(e){}
  return {completed: {}, bookmarked: {}, notes: {}, review: {}, last: '', mastery: {}, last_at: ''};
}
function paSitSaveProgress(p){
  try { localStorage.setItem(PA_SIT_PROGRESS_KEY, JSON.stringify(p)); } catch(e){}
}
function paSitMasteryOf(p, id){
  if(!p || !p.mastery) return '';
  var m = p.mastery[id];
  return PA_SIT_MASTERY_ORDER.indexOf(m) !== -1 ? m : '';
}
/* Stage statistics, computed from local progress data. Shared by the
   stage completion report and the downloadable report, so the two
   never disagree. */
function paSitStageStats(){
  var p = paSitProgress();
  var done = p.completed || {};
  var stageTotals = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0};
  var stageDone = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0};
  var stageMastery = {};
  [1, 2, 3, 4, 5, 6].forEach(function(s){
    stageMastery[s] = {read: 0, understood: 0, practised: 0, reviewed: 0, none: 0};
  });
  var domTotals = {};
  var domDone = {};
  PA_SIT_ITEMS.forEach(function(it){
    var s = it.stage || 3;
    stageTotals[s] = (stageTotals[s] || 0) + 1;
    if(done[it.id]) stageDone[s] = (stageDone[s] || 0) + 1;
    var m = paSitMasteryOf(p, it.id);
    if(m) stageMastery[s][m] += 1;
    else stageMastery[s].none += 1;
    var d = it.domain || 'Uncategorised';
    domTotals[d] = (domTotals[d] || 0) + 1;
    if(done[it.id]) domDone[d] = (domDone[d] || 0) + 1;
  });
  return {progress: p, done: done, totalDone: Object.keys(done).length,
          stageTotals: stageTotals, stageDone: stageDone, stageMastery: stageMastery,
          domTotals: domTotals, domDone: domDone};
}
/* The strongest and weakest operational areas, from the same stats.
   An area is a domain with at least 3 situations, so a single item
   cannot make an area look strong or weak. Returns null when nothing
   is completed yet. */
function paSitAreas(st){
  if(!st.totalDone) return null;
  var areas = Object.keys(st.domTotals).filter(function(d){ return st.domTotals[d] >= 3; }).map(function(d){
    var dn = st.domDone[d] || 0;
    return {name: d, total: st.domTotals[d], done: dn, rate: dn / st.domTotals[d]};
  });
  areas.sort(function(a, b){ return (b.rate - a.rate) || (b.done - a.done) || (a.name < b.name ? -1 : 1); });
  if(!areas.length) return null;
  return {best: areas[0], worst: areas[areas.length - 1]};
}
/* Stage-level mastery indicator: how much of a stage the learner has
   really worked through, not just opened. A stage counts as Mastered
   only when every situation in it is Reviewed. */
function paSitStageMasteryLabel(totals, m){
  var t = totals || 0;
  if(!t) return 'No situations';
  var deep = (m.practised || 0) + (m.reviewed || 0);
  if((m.reviewed || 0) === t) return 'Mastered';
  if(deep / t >= 0.75) return 'Strong';
  if(deep / t >= 0.5) return 'Solid';
  if(deep / t >= 0.25) return 'Building';
  if((m.read || 0) + (m.understood || 0) + deep > 0) return 'Getting started';
  return 'Not started';
}
function paSitVisibleItems(){
  /* Progress is parsed once per render, not once per item: the old
     code called paSitProgress() inside the filter, re-parsing
     localStorage up to 3 times per item on every render. */
  var prog = null;
  function progOnce(){ if(!prog) prog = paSitProgress(); return prog; }
  return PA_SIT_ITEMS.filter(function(it){
    if(PA_SIT_STAGE && String(it.stage || '') !== String(PA_SIT_STAGE)) return false;
    if(PA_SIT_DOMAIN && (it.domain || '') !== PA_SIT_DOMAIN) return false;
    if(PA_SIT_MESSAGE && ((it.messages || []).indexOf(PA_SIT_MESSAGE) === -1)) return false;
    if(PA_SIT_FAILURE && (it.failure_category || '') !== PA_SIT_FAILURE) return false;
    if(PA_SIT_LEVEL && (it.level || '') !== PA_SIT_LEVEL) return false;
    if(PA_SIT_RESOLUTION && (it.resolution || '') !== PA_SIT_RESOLUTION) return false;
    if(PA_SIT_BOOKMARKED_ONLY){
      if(!progOnce().bookmarked[it.id]) return false;
    }
    if(PA_SIT_DASH_FILTER === 'incomplete'){
      if(progOnce().completed[it.id]) return false;
    }
    if(PA_SIT_DASH_FILTER === 'review'){
      var pr = progOnce();
      if(!pr.completed[it.id]) return false;
      if(paSitMasteryOf(pr, it.id) === 'reviewed') return false;
    }
    if(PA_SIT_QUERY){
      var hay = ((it.id || '') + ' ' + (it.title || '') + ' ' + (it.explain || '') + ' ' + (it.takeaway || '') + ' ' + ((it.messages || []).join(' '))).toLowerCase();
      if(hay.indexOf(PA_SIT_QUERY) === -1) return false;
    }
    return true;
  });
}
/* Stage 6 completion review (ChatGPT review P2#10, 9 Nov 2026).
   A reflection checklist, never a test: this product has no multiple
   choice by design, so there are no questions, no score and no pass
   mark. Each prompt is grounded in a real Stage 6 situation: root
   cause tracing, wrong rule versus wrong data, reject or repair,
   reason codes, incident versus problem, scheme rules into
   requirements, the control that should have caught it, and design
   for failure. The learner ticks a prompt when they can do it from
   their own work through the situations. */
var PA_SIT_REVIEW_PROMPTS = [
  {id: 'r1', text: 'Trace a payment failure from the symptom upstream to the root cause, hop by hop, with timestamps and message copies.'},
  {id: 'r2', text: 'Tell whether a wrong outcome came from a wrong rule or wrong data, by tracing the chain before blaming one component.'},
  {id: 'r3', text: 'Decide reject or repair from the business context, not from the error alone.'},
  {id: 'r4', text: 'Read a reason code and say what to investigate first.'},
  {id: 'r5', text: 'Separate restoring service from finding the cause, and report both timelines.'},
  {id: 'r6', text: 'Turn a scheme rule into a buildable requirement a developer can implement.'},
  {id: 'r7', text: 'Name the control that should have caught a failure, and what changes so it catches it next time.'},
  {id: 'r8', text: 'Explain a design choice by its failure modes, not only by its happy path.'}
];
function paSitRenderReview(){
  var box = document.getElementById('sit-review');
  if(!box || box.getAttribute('data-sit-rendered')) return;
  box.setAttribute('data-sit-rendered', '1');
  var p = paSitProgress();
  var html = '<h3>Stage 6 completion review</h3>'
    + '<p class="sit-note">No test, no score. Work through the prompts below and tick each one you can do from your own experience of the situations. They cover what Stage 6 asks of you: root cause, competing resolutions, and the control that should have caught it.</p>'
    + '<p class="sit-review-count" id="sit-review-count" aria-live="polite"></p>'
    + '<ul class="sit-review-list">';
  PA_SIT_REVIEW_PROMPTS.forEach(function(pr){
    var on = p.review && p.review[pr.id];
    html += '<li><label class="sit-review-item"><input type="checkbox" data-sit-review="' + pr.id + '"' + (on ? ' checked' : '') + ' onchange="paSitToggleReview(this)"> ' + escHtml(pr.text) + '</label></li>';
  });
  html += '</ul>';
  box.innerHTML = html;
  paSitUpdateReviewCount();
}
function paSitToggleReview(cb){
  var p = paSitProgress();
  if(!p.review) p.review = {};
  var id = cb.getAttribute('data-sit-review');
  if(cb.checked) p.review[id] = true;
  else delete p.review[id];
  paSitSaveProgress(p);
  paSitUpdateReviewCount();
}
function paSitUpdateReviewCount(){
  var el = document.getElementById('sit-review-count');
  if(!el) return;
  var p = paSitProgress();
  var n = Object.keys(p.review || {}).length;
  el.textContent = n > 0 ? ('You have reflected on ' + n + ' of ' + PA_SIT_REVIEW_PROMPTS.length + ' prompts.') : 'No prompts reflected on yet. Tick a prompt when you can do it from your own work.';
}
/* Stage-completion report (ChatGPT review P2#10, 9 Nov 2026; mastery
   indicator added by review P1#7): per-stage completed counts, a
   stage-level mastery indicator from the Read, Understood, Practised
   and Reviewed states, and the strongest and weakest operational
   areas, all computed from local progress data. */
function paSitRenderReport(){
  var box = document.getElementById('sit-report');
  if(!box) return;
  var st = paSitStageStats();
  var stageNames = {1: 'Payment mechanics', 2: 'Processing decisions', 3: 'Operational exceptions', 4: 'Cross-system consequences', 5: 'Complex banking scenarios', 6: 'Senior SME judgement'};
  var html = '<h3>Your stage completion report</h3>';
  if(!st.totalDone){
    html += '<p class="sit-note">Not started yet. Complete a situation to see your stage report here.</p>';
  } else {
  [1, 2, 3, 4, 5, 6].forEach(function(s){
    var t = st.stageTotals[s] || 0;
    var dn = st.stageDone[s] || 0;
    var pct = t ? Math.round(dn / t * 100) : 0;
    var m = st.stageMastery[s];
    var label = paSitStageMasteryLabel(t, m);
    html += '<div class="sit-report-row"><span>Stage ' + s + ': ' + escHtml(stageNames[s]) + '</span>'
      + '<span class="sit-report-bar"><span class="sit-report-fill" style="width:' + pct + '%"></span></span>'
      + '<span>' + dn + ' of ' + t + '</span></div>'
      + '<p class="sit-report-mastery">Mastery: ' + escHtml(label) + ' (' + (m.read || 0) + ' read, ' + (m.understood || 0) + ' understood, ' + (m.practised || 0) + ' practised, ' + (m.reviewed || 0) + ' reviewed).</p>';
  });
  }
  html += '<div class="sit-report-areas">';
  if(!st.totalDone){
    html += '<p>Complete a few situations and your strongest and weakest areas will appear here.</p>';
  } else {
    var ar = paSitAreas(st);
    if(ar){
      if(ar.best.rate > 0){
        html += '<p><strong>Strongest area:</strong> ' + escHtml(ar.best.name) + ' (' + ar.best.done + ' of ' + ar.best.total + ' complete).</p>';
      }
      if(ar.worst !== ar.best){
        html += '<p><strong>Weakest area:</strong> ' + escHtml(ar.worst.name) + ' (' + ar.worst.done + ' of ' + ar.worst.total + ' complete). Work through its situations next.</p>';
      }
    } else {
      html += '<p>Complete a few situations and your strongest and weakest areas will appear here.</p>';
    }
  }
  html += '</div>';
  box.innerHTML = html;
}
/* Personal dashboard (ChatGPT review P1#7, 9 Nov 2026): last
   visited, bookmarked, incomplete and review queue, all from local
   progress data. The review queue holds situations already marked
   complete whose mastery state is not yet Reviewed, so the learner
   revisits finished work instead of only opening new items. Lists
   show the first 8 entries with the remaining count; the buttons
   filter the catalogue to the full list. */
function paSitDashListItems(list, cap){
  var html = '<ul class="sit-dash-list">';
  list.slice(0, cap).forEach(function(it){
    var pos = PA_SIT_ITEMS.indexOf(it);
    html += '<li><button type="button" onclick="paSitOpenByIndex(' + pos + ')">' + escHtml(it.title || it.id) + ' (Stage ' + (it.stage || '') + ')</button></li>';
  });
  html += '</ul>';
  if(list.length > cap) html += '<p class="sit-dash-more">And ' + (list.length - cap) + ' more.</p>';
  return html;
}
function paSitRenderDashboard(){
  var box = document.getElementById('sit-dashboard');
  if(!box) return;
  var p = paSitProgress();
  var html = '<h3>Your dashboard</h3><div class="sit-dash-grid">';
  html += '<div class="sit-dash-card"><h4>Continue where you left off</h4>';
  if(p.last){
    var li = PA_SIT_ITEMS.filter(function(it){ return it.id === p.last; })[0];
    if(li){
      var when = '';
      if(p.last_at){
        try { when = 'Last visited ' + new Date(p.last_at).toLocaleString() + '.'; } catch(e){ when = ''; }
      }
      var pos = PA_SIT_ITEMS.indexOf(li);
      html += '<p><strong>' + escHtml(li.title || li.id) + '</strong> (Stage ' + (li.stage || '') + ')</p>'
        + (when ? '<p class="sit-note">' + escHtml(when) + '</p>' : '')
        + '<p><button type="button" class="sit-btn sit-btn-primary" onclick="paSitOpenByIndex(' + pos + ')">Continue</button></p>';
    } else {
      html += '<p>Your last situation is no longer in the product. Open any situation to start again.</p>';
    }
  } else {
    html += '<p>Open a situation and it will appear here as your last-visited item.</p>';
  }
  html += '</div>';
  var bm = PA_SIT_ITEMS.filter(function(it){ return p.bookmarked[it.id]; });
  html += '<div class="sit-dash-card"><h4>Bookmarked' + (bm.length ? ' (' + bm.length + ')' : '') + '</h4>';
  if(bm.length) html += paSitDashListItems(bm, 8);
  else html += '<p>Nothing bookmarked yet. Use Bookmark on any situation to keep it here.</p>';
  html += '</div>';
  var inc = PA_SIT_ITEMS.filter(function(it){ return !p.completed[it.id]; });
  html += '<div class="sit-dash-card"><h4>Not yet complete' + (inc.length ? ' (' + inc.length + ')' : '') + '</h4>';
  if(inc.length){
    html += paSitDashListItems(inc, 8);
    html += '<p><button type="button" class="sit-btn sit-btn-secondary" onclick="paSitDashFilter(\'incomplete\')">Show incomplete in the catalogue</button></p>';
  } else {
    html += '<p>Every situation is marked complete.</p>';
  }
  html += '</div>';
  var queue = PA_SIT_ITEMS.filter(function(it){
    return p.completed[it.id] && paSitMasteryOf(p, it.id) !== 'reviewed';
  });
  html += '<div class="sit-dash-card"><h4>Review queue' + (queue.length ? ' (' + queue.length + ')' : '') + '</h4>';
  if(queue.length){
    html += '<p>Complete, but not yet Reviewed. Revisit one and mark it Reviewed when you have worked through it again.</p>';
    html += paSitDashListItems(queue, 8);
    html += '<p><button type="button" class="sit-btn sit-btn-secondary" onclick="paSitDashFilter(\'review\')">Show review queue in the catalogue</button></p>';
  } else if(p.completed && Object.keys(p.completed).length){
    html += '<p>Nothing to review. Every completed situation is Reviewed.</p>';
  } else {
    html += '<p>Complete a situation first. Finished situations that are not yet Reviewed will wait here.</p>';
  }
  html += '</div></div>';
  html += '<div class="sit-dash-actions">'
    + '<button type="button" class="sit-btn sit-btn-secondary" onclick="paSitDownloadReport()">Download stage completion report</button> '
    + '<span class="sit-dash-status" id="sit-report-status" aria-live="polite"></span></div>';
  if(PA_SIT_DASH_FILTER === 'incomplete' || PA_SIT_DASH_FILTER === 'review'){
    var label = PA_SIT_DASH_FILTER === 'incomplete' ? 'incomplete situations' : 'situations waiting for review';
    html += '<p class="sit-note">The catalogue is showing ' + label + ' only. <button type="button" class="sit-btn sit-btn-secondary" onclick="paSitDashFilter(\'\')">Show all situations</button></p>';
  }
  box.innerHTML = html;
}
function paSitDashFilter(f){
  PA_SIT_DASH_FILTER = f || '';
  PA_SIT_INDEX = 0;
  paSitRender();
}
/* Mastery controls for the open situation. Opening marks it Read;
   the learner marks the deeper states themselves by clicking. */
function paSitRenderMastery(item){
  var box = document.getElementById('sit-mastery-box');
  if(!box) return;
  if(!item){ box.innerHTML = ''; return; }
  var p = paSitProgress();
  var cur = paSitMasteryOf(p, item.id) || 'read';
  var html = '<h4>How well do you know this situation?</h4>'
    + '<p class="sit-note">Opening a situation marks it Read. Mark the deeper states yourself when you have worked through it.</p>'
    + '<div class="sit-mastery-btns" role="group" aria-label="Mastery state">';
  PA_SIT_MASTERY_ORDER.forEach(function(m){
    html += '<button type="button" class="sit-btn' + (cur === m ? ' sit-btn-primary' : ' sit-btn-secondary') + '" aria-pressed="' + (cur === m) + '" onclick="paSitSetMastery(\'' + m + '\')">'+ PA_SIT_MASTERY_LABELS[m] + '</button> ';
  });
  html += '</div><p class="sit-mastery-state" aria-live="polite">Current state: <strong>' + escHtml(PA_SIT_MASTERY_LABELS[cur]) + '</strong>.</p>';
  box.innerHTML = html;
}
function paSitSetMastery(state){
  var list = paSitVisibleItems();
  var item = list[PA_SIT_INDEX];
  if(!item) return;
  if(PA_SIT_MASTERY_ORDER.indexOf(state) === -1) return;
  var p = paSitProgress();
  if(!p.mastery) p.mastery = {};
  p.mastery[item.id] = state;
  paSitSaveProgress(p);
  paSitRender();
}
/* Downloadable stage completion report (ChatGPT review P1#7, 9 Nov
   2026). User data only: per-stage completed counts and mastery,
   strongest and weakest areas, bookmarks, notes and review prompts.
   Situation content is never included. This is a learning record,
   not a certificate. */
function paSitDownloadReport(){
  var st = paSitStageStats();
  var stageNames = {1: 'Payment mechanics', 2: 'Processing decisions', 3: 'Operational exceptions', 4: 'Cross-system consequences', 5: 'Complex banking scenarios', 6: 'Senior SME judgement'};
  var lines = [];
  lines.push('Payment Situations: stage completion report');
  lines.push('Exported: ' + new Date().toISOString());
  lines.push('');
  lines.push('You have completed ' + st.totalDone + ' of ' + PA_SIT_ITEMS.length + ' situations.');
  lines.push('');
  [1, 2, 3, 4, 5, 6].forEach(function(s){
    var t = st.stageTotals[s] || 0;
    var dn = st.stageDone[s] || 0;
    var m = st.stageMastery[s];
    lines.push('Stage ' + s + ': ' + stageNames[s] + ' - ' + dn + ' of ' + t + ' complete. Mastery: ' + paSitStageMasteryLabel(t, m)
      + ' (' + (m.read || 0) + ' read, ' + (m.understood || 0) + ' understood, ' + (m.practised || 0) + ' practised, ' + (m.reviewed || 0) + ' reviewed, ' + (m.none || 0) + ' not opened).');
  });
  lines.push('');
  var ar = paSitAreas(st);
  if(ar){
    if(ar.best.rate > 0) lines.push('Strongest area: ' + ar.best.name + ' (' + ar.best.done + ' of ' + ar.best.total + ' complete).');
    if(ar.worst !== ar.best) lines.push('Weakest area: ' + ar.worst.name + ' (' + ar.worst.done + ' of ' + ar.worst.total + ' complete). Work through its situations next.');
  } else {
    lines.push('No strongest or weakest area yet: complete a few situations first.');
  }
  var p = st.progress;
  var marks = Object.keys(p.bookmarked || {}).length;
  var notes = Object.keys(p.notes || {}).filter(function(k){ return (p.notes[k] || '').trim(); }).length;
  var rev = Object.keys(p.review || {}).length;
  lines.push('');
  lines.push('Bookmarked: ' + marks + '. Situations with notes: ' + notes + '. Stage 6 review prompts reflected on: ' + rev + ' of ' + PA_SIT_REVIEW_PROMPTS.length + '.');
  lines.push('');
  lines.push('This report is your own learning record from this browser. It is not a certificate or an accredited qualification.');
  var blob = new Blob([lines.join('\n')], {type: 'text/plain'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'payment-situations-stage-report.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
  var stEl = document.getElementById('sit-report-status');
  if(stEl) stEl.textContent = 'Report downloaded. Situation content is never included.';
}
function paSitUpdateProgressLine(){
  var line = document.getElementById('sit-progress-line');
  if(!line) return;
  var p = paSitProgress();
  var done = Object.keys(p.completed || {}).length;
  var marks = Object.keys(p.bookmarked || {}).length;
  var notes = Object.keys(p.notes || {}).filter(function(k){ return (p.notes[k] || '').trim(); }).length;
  var rev = Object.keys(p.mastery || {}).filter(function(k){ return p.mastery[k] === 'reviewed'; }).length;
  var last = '';
  if(p.last){
    var li = PA_SIT_ITEMS.filter(function(it){ return it.id === p.last; })[0];
    if(li) last = ' Continue where you left off: ' + li.title + '.';
  }
  if(!done && !marks && !notes && !rev && !p.last){
    line.textContent = 'Open a situation to start. Your progress, bookmarks and notes will show here as you work through the situations.';
    return;
  }
  line.textContent = 'You have completed ' + done + ' of ' + PA_SIT_ITEMS.length + ' situations. ' + marks + ' bookmarked. ' + notes + ' with notes. ' + rev + ' reviewed.' + last;
}
function paSitRenderCatalogue(list){
  var cat = document.getElementById('sit-catalogue');
  if(!cat) return;
  var cur = list[PA_SIT_INDEX];
  var p = paSitProgress();
  var html = '<p class="sit-catalogue-count">' + list.length + ' of ' + PA_SIT_ITEMS.length + ' situations</p>';
  list.forEach(function(it, i){
    var pos = PA_SIT_ITEMS.indexOf(it) + 1;
    var mark = p.bookmarked[it.id] ? ' \u2605 ' : '';
    var done = p.completed[it.id] ? ' \u2713 ' : '';
    var mast = paSitMasteryOf(p, it.id);
    var mastTag = (mast === 'understood' || mast === 'practised' || mast === 'reviewed') ? ' \u00b7 ' + PA_SIT_MASTERY_LABELS[mast] : '';
    var thumb = it.thumbnail ? '<img class="pf-thumb pf-thumb-sm" src="' + escHtml(it.thumbnail) + '" alt="" loading="lazy"> ' : '';
    var agenda = it.agenda ? '<span class="pf-row-agenda">' + escHtml(it.agenda) + '</span>' : '';
    html += '<button type="button" class="sit-catalogue-item' + (it === cur ? ' active' : '') + '" data-sit-cat="' + i + '" onclick="paSitJump(' + i + ')">'
      + '<span class="sit-cat-stage">Stage ' + (it.stage || '') + ' &middot; ' + escHtml(it.id || '') + ' &middot; ' + pos + ' of ' + PA_SIT_ITEMS.length + mark + done + mastTag + '</span>'
      + thumb + escHtml(it.title || it.id || '') + agenda + '</button>';
  });
  cat.innerHTML = html;
}
function escHtml(s){
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function paSitRelated(item){
  var rel = [];
  if(!item) return rel;
  PA_SIT_ITEMS.forEach(function(it){
    if(it.id === item.id || rel.length >= 3) return;
    var sameStage = it.stage === item.stage;
    var sharedMsg = (it.messages || []).some(function(m){ return (item.messages || []).indexOf(m) !== -1; });
    var sameDomain = it.domain && item.domain && it.domain === item.domain;
    if((sameStage && (sharedMsg || sameDomain)) || (sharedMsg && sameDomain)) rel.push(it);
  });
  if(rel.length < 3){
    PA_SIT_ITEMS.forEach(function(it){
      if(it.id === item.id || rel.length >= 3) return;
      if(it.stage === item.stage && rel.indexOf(it) === -1) rel.push(it);
    });
  }
  return rel;
}
function paSitRenderRelated(item){
  var box = document.getElementById('sit-related');
  if(!box) return;
  var rel = paSitRelated(item);
  if(!rel.length){ box.innerHTML = ''; return; }
  var html = '<h4>Related situations</h4>';
  rel.forEach(function(it){
    var pos = PA_SIT_ITEMS.indexOf(it);
    html += '<button type="button" onclick="paSitOpenByIndex(' + pos + ')">' + escHtml(it.title || it.id) + ' (Stage ' + (it.stage || '') + ')</button>';
  });
  box.innerHTML = html;
}
function paSitSyncActionButtons(item){
  var p = paSitProgress();
  var bm = document.getElementById('sit-bookmark');
  if(bm){
    bm.setAttribute('aria-pressed', item && p.bookmarked[item.id] ? 'true' : 'false');
    bm.textContent = (item && p.bookmarked[item.id]) ? 'Bookmarked \u2605' : 'Bookmark';
  }
  var dn = document.getElementById('sit-done');
  if(dn){
    dn.setAttribute('aria-pressed', item && p.completed[item.id] ? 'true' : 'false');
    dn.textContent = (item && p.completed[item.id]) ? 'Completed \u2713' : 'Mark complete';
  }
}
function paSitRenderNote(item){
  var box = document.getElementById('sit-note-box');
  if(!box) return;
  if(!item){ box.innerHTML = ''; return; }
  var p = paSitProgress();
  var saved = (p.notes && p.notes[item.id]) || '';
  box.innerHTML = '<h4>Your note on this situation</h4>'
    + '<p class="sit-note">Private to this browser. Notes are stored with your bookmarks and progress, and clearing browser data wipes them.</p>'
    + '<textarea id="sit-note-text" rows="3" aria-label="Your note on this situation">' + escHtml(saved) + '</textarea>'
    + '<p><button type="button" class="sit-btn sit-btn-primary" onclick="paSitSaveNote()">Save note</button> '
    + '<span class="sit-note-status" id="sit-note-status"></span></p>';
}
function paSitSaveNote(){
  var list = paSitVisibleItems();
  var item = list[PA_SIT_INDEX];
  if(!item) return;
  var ta = document.getElementById('sit-note-text');
  var st = document.getElementById('sit-note-status');
  var text = ta ? ta.value : '';
  var p = paSitProgress();
  if(!p.notes) p.notes = {};
  if(text.trim()) p.notes[item.id] = text;
  else delete p.notes[item.id];
  paSitSaveProgress(p);
  if(st) st.textContent = 'Note saved.';
  paSitUpdateProgressLine();
}
function paSitRender(){
  var box = document.getElementById('sit-content');
  if(!box) return;
  var list = paSitVisibleItems();
  paSitUpdateProgressLine();
  paSitRenderReport();
  paSitRenderReview();
  paSitRenderDashboard();
  if(!PA_SIT_ITEMS.length){
    box.innerHTML = '<p class="sit-note">The situations are being prepared.</p>';
    return;
  }
  if(!list.length){
    box.innerHTML = '<p class="sit-note">No situations match this filter. Clear a filter to see more.</p>';
    paSitRenderCatalogue(list);
    paSitRenderRelated(null);
    paSitRenderNote(null);
    paSitRenderMastery(null);
    return;
  }
  if(PA_SIT_DEEPLINK_ID){
    var _dl = PA_SIT_DEEPLINK_ID;
    PA_SIT_DEEPLINK_ID = '';
    var _found = -1;
    for(var _i = 0; _i < PA_SIT_ITEMS.length; _i++){ if(PA_SIT_ITEMS[_i].id === _dl){ _found = _i; break; } }
    if(_found !== -1){
      PA_SIT_STAGE = ''; PA_SIT_DOMAIN = ''; PA_SIT_MESSAGE = ''; PA_SIT_FAILURE = '';
      PA_SIT_LEVEL = ''; PA_SIT_RESOLUTION = ''; PA_SIT_QUERY = ''; PA_SIT_BOOKMARKED_ONLY = false;
      PA_SIT_DASH_FILTER = '';
      paSitSyncFilterControls();
      list = paSitVisibleItems();
      PA_SIT_INDEX = list.indexOf(PA_SIT_ITEMS[_found]);
      setTimeout(function(){ var _box = document.getElementById('sit-content'); if(_box) _box.scrollIntoView({behavior: 'smooth', block: 'start'}); }, 50);
    } else {
      PA_SIT_DEEPLINK_MISSING = _dl;
    }
  }
  if(PA_SIT_INDEX >= list.length) PA_SIT_INDEX = list.length - 1;
  if(PA_SIT_INDEX < 0) PA_SIT_INDEX = 0;
  var item = list[PA_SIT_INDEX];
  var pos = PA_SIT_ITEMS.indexOf(item) + 1;
  var prog = document.getElementById('sit-progress');
  if(prog) prog.textContent = 'Situation ' + pos + ' of ' + PA_SIT_ITEMS.length + (list.length !== PA_SIT_ITEMS.length ? ' (filtered)' : '');
  var prev = document.getElementById('sit-prev');
  var next = document.getElementById('sit-next');
  if(prev) prev.disabled = PA_SIT_INDEX <= 0;
  if(next) next.disabled = PA_SIT_INDEX >= list.length - 1;
  box.innerHTML = window.PFSituations ? window.PFSituations.render(item) : '';
  if(window.PFSituations) window.PFSituations.renderAll(box);
  if(PA_SIT_DEEPLINK_MISSING){
    var _note = document.createElement('p');
    _note.className = 'sit-note';
    _note.textContent = 'No situation with code ' + PA_SIT_DEEPLINK_MISSING + ' was found. Showing the first situation instead.';
    box.insertBefore(_note, box.firstChild);
    PA_SIT_DEEPLINK_MISSING = '';
  }
  paSitRenderCatalogue(list);
  paSitRenderRelated(item);
  paSitRenderNote(item);
  paSitRenderMastery(item);
  paSitSyncActionButtons(item);
  paSitApplyDeterrents();
  var p = paSitProgress();
  p.last = item.id;
  p.last_at = new Date().toISOString();
  if(!p.mastery) p.mastery = {};
  /* Opening a situation marks it Read only. Deeper states are set by
     the learner through the mastery controls, never here. */
  if(!p.mastery[item.id]) p.mastery[item.id] = 'read';
  paSitSaveProgress(p);
  /* Refresh the progress line, dashboard and report with the newly
     recorded visit and Read state; they rendered above before this
     item was recorded. */
  paSitUpdateProgressLine();
  paSitRenderDashboard();
  paSitRenderReport();
}
function paSitOpenByIndex(i){
  var idx = parseInt(i, 10);
  if(isNaN(idx)) return;
  var list = paSitVisibleItems();
  var item = PA_SIT_ITEMS[idx];
  var at = list.indexOf(item);
  if(at === -1){
    PA_SIT_STAGE = ''; PA_SIT_DOMAIN = ''; PA_SIT_MESSAGE = ''; PA_SIT_FAILURE = '';
    PA_SIT_LEVEL = ''; PA_SIT_RESOLUTION = ''; PA_SIT_QUERY = ''; PA_SIT_BOOKMARKED_ONLY = false;
    PA_SIT_DASH_FILTER = '';
    paSitSyncFilterControls();
    PA_SIT_INDEX = idx;
  } else {
    PA_SIT_INDEX = at;
  }
  paSitRender();
}
function paSitSyncFilterControls(){
  var map = [['sit-domain-filter', PA_SIT_DOMAIN], ['sit-message-filter', PA_SIT_MESSAGE],
             ['sit-failure-filter', PA_SIT_FAILURE], ['sit-level-filter', PA_SIT_LEVEL],
             ['sit-resolution-filter', PA_SIT_RESOLUTION]];
  map.forEach(function(pair){
    var el = document.getElementById(pair[0]);
    if(el) el.value = pair[1];
  });
  var q = document.getElementById('sit-search');
  if(q) q.value = PA_SIT_QUERY;
  var bo = document.getElementById('sit-bookmarked-only');
  if(bo) bo.checked = PA_SIT_BOOKMARKED_ONLY;
  document.querySelectorAll('.sit-stage-tab').forEach(function(t){
    var on = String(t.getAttribute('data-stage') || '') === String(PA_SIT_STAGE || '');
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  paSitSyncDrawer();
}
function paSitPrev(){
  if(PA_SIT_INDEX > 0){ PA_SIT_INDEX -= 1; paSitRender(); }
}
function paSitNext(){
  if(PA_SIT_INDEX < paSitVisibleItems().length - 1){ PA_SIT_INDEX += 1; paSitRender(); }
}
function paSitJump(v){
  var i = parseInt(v, 10);
  if(!isNaN(i)){ PA_SIT_INDEX = i; paSitRender(); }
}
function paSitStageTab(stage, btn){
  PA_SIT_STAGE = stage || '';
  PA_SIT_INDEX = 0;
  paSitSyncFilterControls();
  paSitRender();
}
/* Category drawer (15 Nov 2026 review wave): one tap picks a whole
   category. Picking a stage clears the bookmarked-only filter and
   vice versa, so the drawer always shows exactly one active
   category. */
function paSitCategory(stage, bookmarked){
  PA_SIT_STAGE = stage || '';
  PA_SIT_BOOKMARKED_ONLY = !!bookmarked;
  PA_SIT_INDEX = 0;
  paSitSyncFilterControls();
  paSitRender();
}
function paSitToggleDrawer(){
  var d = document.getElementById('sit-cases-drawer');
  if(!d) return;
  var open = d.classList.toggle('is-open');
  var t = document.querySelector('.pf-cases-drawer-toggle');
  if(t) t.setAttribute('aria-expanded', open ? 'true' : 'false');
}
function paSitSyncDrawer(){
  var cat = PA_SIT_BOOKMARKED_ONLY ? 'bookmarked' : (PA_SIT_STAGE ? 'stage-' + PA_SIT_STAGE : 'all');
  var p = null;
  document.querySelectorAll('.pf-cases-drawer-item').forEach(function(b){
    var key = b.getAttribute('data-sit-category');
    b.classList.toggle('is-active', key === cat);
    if(key === 'bookmarked'){
      if(!p) p = paSitProgress();
      var n = Object.keys(p.bookmarked || {}).length;
      var c = b.querySelector('.pf-cases-drawer-count');
      if(c) c.textContent = n > 0 ? String(n) : '';
    }
  });
}
function paSitFilterDomain(v){ PA_SIT_DOMAIN = v || ''; PA_SIT_INDEX = 0; paSitRender(); }
function paSitFilterMessage(v){ PA_SIT_MESSAGE = v || ''; PA_SIT_INDEX = 0; paSitRender(); }
function paSitFilterFailure(v){ PA_SIT_FAILURE = v || ''; PA_SIT_INDEX = 0; paSitRender(); }
function paSitFilterLevel(v){ PA_SIT_LEVEL = v || ''; PA_SIT_INDEX = 0; paSitRender(); }
function paSitFilterResolution(v){ PA_SIT_RESOLUTION = v || ''; PA_SIT_INDEX = 0; paSitRender(); }
function paSitFilterBookmarked(on){ PA_SIT_BOOKMARKED_ONLY = !!on; PA_SIT_INDEX = 0; paSitSyncDrawer(); paSitRender(); }
function paSitSearch(q){
  PA_SIT_QUERY = (q || '').trim().toLowerCase();
  PA_SIT_INDEX = 0;
  paSitRender();
}
function paSitToggleBookmark(){
  var list = paSitVisibleItems();
  var item = list[PA_SIT_INDEX];
  if(!item) return;
  var p = paSitProgress();
  if(p.bookmarked[item.id]) delete p.bookmarked[item.id];
  else p.bookmarked[item.id] = true;
  paSitSaveProgress(p);
  paSitRender();
}
function paSitToggleDone(){
  var list = paSitVisibleItems();
  var item = list[PA_SIT_INDEX];
  if(!item) return;
  var p = paSitProgress();
  if(p.completed[item.id]) delete p.completed[item.id];
  else p.completed[item.id] = true;
  paSitSaveProgress(p);
  paSitRender();
}
/* Copy deterrents on protected content. The same protection applies
   to the unlocked paid content and to the free samples: no
   right-click menu, no text selection, no drag, no copy or cut keys
   inside the protected area. */
var PA_SIT_KEYS_WIRED = false;
function paSitProtectElement(box){
  if(!box || box.getAttribute('data-sit-protected')) return;
  box.setAttribute('data-sit-protected', '1');
  box.classList.add('sit-protected');
  box.addEventListener('contextmenu', function(e){ e.preventDefault(); });
  box.addEventListener('dragstart', function(e){ e.preventDefault(); });
  box.addEventListener('copy', function(e){ e.preventDefault(); });
  box.addEventListener('cut', function(e){ e.preventDefault(); });
  if(!PA_SIT_KEYS_WIRED){
    PA_SIT_KEYS_WIRED = true;
    document.addEventListener('keydown', function(e){
      var t = e.target;
      var inside = (t && t.closest) ? t.closest('.sit-protected') : null;
      if(!inside) return;
      if((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'x' || e.key === 'a' || e.key === 's' || e.key === 'p')){
        e.preventDefault();
      }
    });
  }
}
function paSitApplyDeterrents(){
  var box = document.getElementById('sit-content');
  paSitProtectElement(box);
}
/* Export and restore of the buyer own data (ChatGPT review P1#4,
   9 Nov 2026). The export is user data only: completed, bookmarked,
   notes, mastery states, the Stage 6 review and where they left off.
   Situation content is never included. Restore replaces the stored
   progress in this browser with the imported file after validation,
   and reports the result in the workspace bar. Format version 2 adds
   mastery states and the last-visited time; version 1 files still
   import, with mastery left empty. */
function paSitExportData(){
  var st = document.getElementById('sit-data-status');
  var p = paSitProgress();
  var payload = {
    format: 'payment-situations-user-data',
    version: 2,
    exported_at: new Date().toISOString(),
    product: 'practice',
    data: {
      completed: p.completed || {},
      bookmarked: p.bookmarked || {},
      notes: p.notes || {},
      last: p.last || '',
      last_at: p.last_at || '',
      review: p.review || {},
      mastery: p.mastery || {}
    }
  };
  var blob = new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'payment-situations-my-data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
  if(st) st.textContent = 'Exported your notes, bookmarks, progress and mastery states. Situation content is never included.';
}
function paSitImportFile(input){
  var st = document.getElementById('sit-data-status');
  var file = input && input.files && input.files[0];
  if(!file) return;
  var reader = new FileReader();
  reader.onload = function(){
    var ok = false;
    try {
      var parsed = JSON.parse(reader.result);
      if(parsed && parsed.format && parsed.format !== 'payment-situations-user-data') throw new Error('wrong file');
      var d = (parsed && parsed.data) ? parsed.data : parsed;
      if(!d || typeof d !== 'object' || Array.isArray(d)) throw new Error('bad shape');
      var clean = {completed: {}, bookmarked: {}, notes: {}, last: '', last_at: '', review: {}, mastery: {}};
      ['completed', 'bookmarked'].forEach(function(k){
        var v = d[k];
        if(v && typeof v === 'object' && !Array.isArray(v)){
          Object.keys(v).forEach(function(id){ if(v[id]) clean[k][id] = true; });
        }
      });
      if(d.notes && typeof d.notes === 'object' && !Array.isArray(d.notes)){
        Object.keys(d.notes).forEach(function(id){
          if(typeof d.notes[id] === 'string' && d.notes[id].trim()) clean.notes[id] = d.notes[id];
        });
      }
      if(typeof d.last === 'string') clean.last = d.last;
      if(typeof d.last_at === 'string') clean.last_at = d.last_at;
      if(d.review && typeof d.review === 'object' && !Array.isArray(d.review)){
        Object.keys(d.review).forEach(function(id){ if(d.review[id]) clean.review[id] = true; });
      }
      if(d.mastery && typeof d.mastery === 'object' && !Array.isArray(d.mastery)){
        Object.keys(d.mastery).forEach(function(id){
          if(PA_SIT_MASTERY_ORDER.indexOf(d.mastery[id]) !== -1) clean.mastery[id] = d.mastery[id];
        });
      }
      paSitSaveProgress(clean);
      ok = true;
    } catch(e){
      ok = false;
    }
    if(ok){
      var rv = document.getElementById('sit-review');
      if(rv) rv.removeAttribute('data-sit-rendered');
      if(st) st.textContent = 'Imported. Your notes, bookmarks, progress, mastery states and review are restored in this browser.';
      paSitRender();
    } else {
      if(st) st.textContent = 'That file is not a Payment Situations export. Nothing was changed.';
    }
    input.value = '';
  };
  reader.readAsText(file);
}
/* Free samples (ChatGPT review P1#2, 9 Nov 2026). The samples file
   holds ONLY the 10 sample items and loads ungated, unlike the full
   data file, which loads only after the access gate passes. Each
   sample renders through the same PFSituations component as the paid
   items, and the samples area carries the same copy protection. */
function paSitLoadSamples(){
  var box = document.getElementById('sit-samples-list');
  if(!box) return;
  /* 10 Nov 2026 (ChatGPT review 5 priority 6): the samples are now
     server-rendered as static HTML, so when they are already in the
     page, just render the visuals from the embedded JSON and skip the
     samples file entirely. */
  if(box.querySelectorAll('.sit-sample-item').length){
    if(window.PFSituations){
      window.PFSituations.renderAll(box);
      if(window.PFSituations.init) window.PFSituations.init();
    }
    paSitProtectElement(box);
    return;
  }
  if(window.PA_SITUATION_SAMPLES && window.PA_SITUATION_SAMPLES.length){
    paSitRenderSamples(window.PA_SITUATION_SAMPLES);
    return;
  }
  var s = document.createElement('script');
  s.src = 'assets/situations-samples.js';
  s.onload = function(){
    paSitRenderSamples(window.PA_SITUATION_SAMPLES || []);
  };
  s.onerror = function(){
    box.innerHTML = '<p class="sit-note">The free samples could not be loaded. Please refresh the page.</p>';
  };
  document.head.appendChild(s);
}
function paSitRenderSamples(samples){
  var box = document.getElementById('sit-samples-list');
  if(!box) return;
  if(!samples.length){
    box.innerHTML = '<p class="sit-note">The free samples are being prepared.</p>';
    return;
  }
  var html = '';
  samples.forEach(function(it){
    var payload = JSON.stringify(it).replace(/</g, '\u003c').replace(/>/g, '\u003e');
    html += '<div class="sit-sample-item" data-sit-visual><script type="application/json">' + payload + '<\/script></div>';
  });
  box.innerHTML = html;
  if(window.PFSituations){
    window.PFSituations.renderAll(box);
    if(window.PFSituations.init) window.PFSituations.init();
  }
  paSitProtectElement(box);
}
function paSitShowContent(){
  var wall = document.getElementById('sit-paywall');
  var owned = document.getElementById('sit-owned');
  var browser = document.getElementById('sit-browser');
  if(wall) wall.style.display = 'none';
  if(owned) owned.style.display = 'block';
  if(browser) browser.style.display = 'block';
  if(window.PA_SITUATIONS && window.PA_SITUATIONS.length){
    PA_SIT_ITEMS = window.PA_SITUATIONS;
    paSitRender();
  } else {
    paSitLoadData();
  }
}
function paSitLoadData(){
  if(window.PA_SITUATIONS && window.PA_SITUATIONS.length){
    PA_SIT_ITEMS = window.PA_SITUATIONS;
    paSitRender();
    return;
  }
  var s = document.createElement('script');
  s.src = 'assets/situations-data.js';
  s.onload = function(){
    PA_SIT_ITEMS = window.PA_SITUATIONS || [];
    paSitRender();
  };
  s.onerror = function(){
    var box = document.getElementById('sit-content');
    if(box) box.innerHTML = '<p class="sit-note">The situations data could not be loaded. Please refresh the page.</p>';
  };
  document.head.appendChild(s);
}
function paSitReadUrlParams(){
  var params = {};
  try { params = new URLSearchParams(window.location.search); } catch(e){ return; }
  var stage = params.get('stage');
  if(stage && ['1','2','3','4','5','6'].indexOf(stage) !== -1) PA_SIT_STAGE = stage;
  var msg = params.get('message');
  if(msg) PA_SIT_MESSAGE = msg;
  var q = params.get('q');
  if(q) PA_SIT_QUERY = q.trim().toLowerCase();
  var domain = params.get('domain');
  if(domain) PA_SIT_DOMAIN = domain;
  var failure = params.get('failure');
  if(failure) PA_SIT_FAILURE = failure;
  var level = params.get('level');
  if(level && ['foundation', 'core', 'advanced'].indexOf(level) !== -1) PA_SIT_LEVEL = level;
  var resolution = params.get('resolution');
  if(resolution) PA_SIT_RESOLUTION = resolution;
  /* Deep link (15 Nov 2026, fix 4): a search result links to
     situations.html?id=<ID>. The id is resolved in paSitRender once
     the data has loaded, so a gated visitor still sees the wall. */
  var dl = params.get('id');
  if(dl) PA_SIT_DEEPLINK_ID = dl;
  paSitSyncFilterControls();
}
document.addEventListener('DOMContentLoaded', function(){
  var wall = document.getElementById('sit-paywall');
  var browser = document.getElementById('sit-browser');
  if(!wall || !browser) return;
  paSitReadUrlParams();
  paSitLoadSamples();
  var hasAccess = (typeof paHasSituationsAccess === 'function') ? paHasSituationsAccess() : false;
  if(hasAccess){
    paSitShowContent();
  } else {
    wall.style.display = 'block';
    browser.style.display = 'none';
  }
});
