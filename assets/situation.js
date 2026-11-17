/* ===== Payment Situation case page ===== */
/* One case per page (17 Nov 2026, owner order): opening a case from
   the Situations list navigates here with ?id=CASE-ID, and Back to
   dashboard returns to the list. The in-page detail on
   situations.html is gone, with it the focus mode that collapsed
   the panels around the detail.
   The case renders through the same PFSituations renderers as the
   old in-page detail, with the same related cases, note box,
   mastery box, bookmark and complete controls, and the same
   investigation entry point (investigation-experience.js scans
   #sit-content, which this page keeps). Previous and Next move to
   the neighbouring case in the data order.
   Gating is unchanged and single-sourced in bundles.js: a case
   shows in full only when it is a free sample (ABH-01, JEB-C01, the
   same list as situations.js) or paHasSituationsAccess() passes
   (admin, or an active unexpired practice or integrated purchase).
   Every other case shows the locked view only, and until the
   Supabase entitlement check resolves every non-sample case
   renders locked (fail closed), then the page re-renders with the
   true state. The data file is a static asset, so the honest limit
   from the list page applies here too: this is a browser-side gate.
   Scroll rule: a fresh page load opens at the top, and the
   site-wide rule in site.js keeps it there on Back restores. */
var PA_CASE_ITEMS = [];
var PA_CASE_INDEX = -1;
var PA_CASE_ID = '';
var PA_CASE_MISSING = '';
var PA_SIT_PROGRESS_KEY = 'pa-situations-progress-v1';
var PA_SIT_MASTERY_ORDER = ['read', 'understood', 'practised', 'reviewed'];
var PA_SIT_MASTERY_LABELS = {read: 'Read', understood: 'Understood', practised: 'Practised', reviewed: 'Reviewed'};
/* Free samples (settled access model, mirrors the apps and the list
   page): ABH-01 and JEB-C01 only. Keep this list identical to
   PA_SIT_FREE_SAMPLES in situations.js. */
var PA_SIT_FREE_SAMPLES = ['ABH-01', 'JEB-C01'];
function paSitHasAccess(){
  try {
    if(typeof paHasSituationsAccess === 'function') return !!paHasSituationsAccess();
  } catch(e){}
  return false;
}
function paSitIsFreeSample(item){
  if(!item) return false;
  if(item.isFreeSample === true) return true;
  return PA_SIT_FREE_SAMPLES.indexOf(item.id) !== -1;
}
function paSitIsLocked(item){
  if(paSitIsFreeSample(item)) return false;
  return !paSitHasAccess();
}
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
function escHtml(s){
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function paSitCaseItem(){
  if(PA_CASE_INDEX < 0 || PA_CASE_INDEX >= PA_CASE_ITEMS.length) return null;
  return PA_CASE_ITEMS[PA_CASE_INDEX];
}
function paSitCaseUrl(id){
  return 'situation?id=' + encodeURIComponent(id);
}
function paSitRelated(item){
  var rel = [];
  if(!item) return rel;
  PA_CASE_ITEMS.forEach(function(it){
    if(it.id === item.id || rel.length >= 3) return;
    var sameStage = it.stage === item.stage;
    var sharedMsg = (it.messages || []).some(function(m){ return (item.messages || []).indexOf(m) !== -1; });
    var sameDomain = it.domain && item.domain && it.domain === item.domain;
    if((sameStage && (sharedMsg || sameDomain)) || (sharedMsg && sameDomain)) rel.push(it);
  });
  if(rel.length < 3){
    PA_CASE_ITEMS.forEach(function(it){
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
    html += '<a href="' + escHtml(paSitCaseUrl(it.id)) + '">' + escHtml(it.title || it.id) + ' (Stage ' + (it.stage || '') + ')</a>';
  });
  box.innerHTML = html;
}
function paSitSyncActionButtons(item, locked){
  var p = paSitProgress();
  var bm = document.getElementById('sit-bookmark');
  if(bm){
    bm.setAttribute('aria-pressed', item && p.bookmarked[item.id] ? 'true' : 'false');
    bm.textContent = (item && p.bookmarked[item.id]) ? 'Bookmarked \u2605' : 'Bookmark';
  }
  var dn = document.getElementById('sit-done');
  if(dn){
    /* A locked case can be bookmarked (a discovery marker) but never
       marked complete: the learner has not seen its content. */
    dn.disabled = !!locked;
    dn.setAttribute('aria-pressed', item && !locked && p.completed[item.id] ? 'true' : 'false');
    dn.textContent = (item && !locked && p.completed[item.id]) ? 'Completed \u2713' : 'Mark complete';
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
  var item = paSitCaseItem();
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
  var item = paSitCaseItem();
  if(!item) return;
  if(paSitIsLocked(item)) return;
  if(PA_SIT_MASTERY_ORDER.indexOf(state) === -1) return;
  var p = paSitProgress();
  if(!p.mastery) p.mastery = {};
  p.mastery[item.id] = state;
  paSitSaveProgress(p);
  paSitRenderCase();
}
function paSitToggleBookmark(){
  var item = paSitCaseItem();
  if(!item) return;
  var p = paSitProgress();
  if(p.bookmarked[item.id]) delete p.bookmarked[item.id];
  else p.bookmarked[item.id] = true;
  paSitSaveProgress(p);
  paSitRenderCase();
}
function paSitToggleDone(){
  var item = paSitCaseItem();
  if(!item) return;
  if(paSitIsLocked(item)) return;
  var p = paSitProgress();
  if(p.completed[item.id]) delete p.completed[item.id];
  else p.completed[item.id] = true;
  paSitSaveProgress(p);
  paSitRenderCase();
}
function paSitPrev(){
  if(PA_CASE_INDEX > 0){
    window.location.href = paSitCaseUrl(PA_CASE_ITEMS[PA_CASE_INDEX - 1].id);
  }
}
function paSitNext(){
  if(PA_CASE_INDEX >= 0 && PA_CASE_INDEX < PA_CASE_ITEMS.length - 1){
    window.location.href = paSitCaseUrl(PA_CASE_ITEMS[PA_CASE_INDEX + 1].id);
  }
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
function paSitRenderCase(){
  var box = document.getElementById('sit-content');
  if(!box) return;
  if(!PA_CASE_ITEMS.length){
    box.innerHTML = '<p class="sit-note">The situations are being prepared.</p>';
    return;
  }
  var item = paSitCaseItem();
  if(!item){
    box.innerHTML = '<p class="sit-note">No situation with code ' + escHtml(PA_CASE_MISSING || PA_CASE_ID) + ' was found. <a href="situations">Back to the situations list</a>.</p>';
    paSitRenderRelated(null);
    paSitRenderNote(null);
    paSitRenderMastery(null);
    paSitSyncActionButtons(null, true);
    var prev0 = document.getElementById('sit-prev');
    var next0 = document.getElementById('sit-next');
    if(prev0) prev0.disabled = true;
    if(next0) next0.disabled = true;
    return;
  }
  var locked = paSitIsLocked(item);
  var prog = document.getElementById('sit-progress');
  if(prog) prog.textContent = 'Situation ' + (PA_CASE_INDEX + 1) + ' of ' + PA_CASE_ITEMS.length;
  var prev = document.getElementById('sit-prev');
  var next = document.getElementById('sit-next');
  if(prev) prev.disabled = PA_CASE_INDEX <= 0;
  if(next) next.disabled = PA_CASE_INDEX >= PA_CASE_ITEMS.length - 1;
  if(locked){
    box.innerHTML = (window.PFSituations && window.PFSituations.renderLocked) ? window.PFSituations.renderLocked(item) : '';
  } else {
    box.innerHTML = window.PFSituations ? window.PFSituations.render(item) : '';
    if(window.PFSituations) window.PFSituations.renderAll(box);
  }
  if(locked){
    /* A locked case shows no related cases, no note box and no
       mastery box: nothing beyond the paywall view. */
    paSitRenderRelated(null);
    paSitRenderNote(null);
    paSitRenderMastery(null);
  } else {
    paSitRenderRelated(item);
    paSitRenderNote(item);
    paSitRenderMastery(item);
  }
  paSitSyncActionButtons(item, locked);
  paSitApplyDeterrents();
  /* A locked case records nothing: no last visit, no Read state.
     The learner has not seen the content. */
  if(!locked){
    var p = paSitProgress();
    p.last = item.id;
    p.last_at = new Date().toISOString();
    if(!p.mastery) p.mastery = {};
    /* Opening a situation marks it Read only. Deeper states are set by
       the learner through the mastery controls, never here. */
    if(!p.mastery[item.id]) p.mastery[item.id] = 'read';
    paSitSaveProgress(p);
  }
}
function paSitLoadData(){
  if(window.PA_SITUATIONS && window.PA_SITUATIONS.length){
    PA_CASE_ITEMS = window.PA_SITUATIONS;
    paSitResolveAndRender();
    return;
  }
  var s = document.createElement('script');
  s.src = 'assets/situations-data.js';
  s.onload = function(){
    PA_CASE_ITEMS = window.PA_SITUATIONS || [];
    paSitResolveAndRender();
  };
  s.onerror = function(){
    var box = document.getElementById('sit-content');
    if(box) box.innerHTML = '<p class="sit-note">The situations data could not be loaded. Please refresh the page.</p>';
  };
  document.head.appendChild(s);
}
function paSitResolveAndRender(){
  var found = -1;
  for(var i = 0; i < PA_CASE_ITEMS.length; i++){
    if(PA_CASE_ITEMS[i].id === PA_CASE_ID){ found = i; break; }
  }
  if(found === -1){
    PA_CASE_MISSING = PA_CASE_ID;
    PA_CASE_INDEX = -1;
  } else {
    PA_CASE_INDEX = found;
    var item = PA_CASE_ITEMS[found];
    try { document.title = (item.title || item.id) + ' | Payments Training Hub'; } catch(e){}
    var crumb = document.getElementById('sit-crumb-case');
    if(crumb) crumb.textContent = 'Case ' + item.id;
  }
  paSitRenderCase();
}
document.addEventListener('DOMContentLoaded', function(){
  var box = document.getElementById('sit-content');
  if(!box) return;
  var id = '';
  try { id = new URLSearchParams(window.location.search).get('id') || ''; } catch(e){ id = ''; }
  PA_CASE_ID = (id || '').trim();
  if(!PA_CASE_ID){
    box.innerHTML = '<p class="sit-note">No situation was selected. <a href="situations">Back to the situations list</a>.</p>';
    var prev = document.getElementById('sit-prev');
    var next = document.getElementById('sit-next');
    if(prev) prev.disabled = true;
    if(next) next.disabled = true;
    paSitSyncActionButtons(null, true);
    return;
  }
  paSitLoadData();
  /* Entitlement resolves async: re-render with the true gate state
     when it lands. Until then every non-sample case renders locked. */
  if(typeof paGateState === 'function'){
    paGateState().then(function(){
      paSitRenderCase();
    });
  }
});
