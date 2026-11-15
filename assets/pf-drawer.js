/* ===== Payments Training Hub side panel, tab bar, and guided tour (app parity, 12 Nov 2026, worker 1) =====
   Mirrors the iOS app drawer: slide in panel, dim background, tap dim or
   swipe left to close, swipe right from the left edge to open. Also marks
   the active drawer row and tab from the current path, runs the Appearance
   popover (dark mode, larger text plus the sound toggle), and runs the 5 step guided
   tour started from the Start Tour row. No dependencies. Every lookup is
   guarded: on a page missing an element, the matching feature quietly
   does nothing instead of throwing. No auto start: the tour runs only
   when the learner taps Start Tour, and it is replayable. */
(function(){
'use strict';

function $(s, r){
  try{ return (r || document).querySelector(s); }catch(e){ return null; }
}
function $all(s, r){
  try{ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }catch(e){ return []; }
}
function isDesktop(){
  try{ return !!(window.matchMedia && window.matchMedia('(min-width:1024px)').matches); }catch(e){ return false; }
}
function reduceMotion(){
  try{ return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }catch(e){ return false; }
}
function lsGet(k){
  try{ return window.localStorage.getItem(k); }catch(e){ return null; }
}
function lsSet(k, v){
  try{ window.localStorage.setItem(k, v); }catch(e){ /* storage unavailable */ }
}

var drawer = null;
var scrim = null;
var lastOpener = null;

/* ---------- open, close, toggle ---------- */
function syncInert(){
  if(!drawer) return;
  try{
    if(!('inert' in drawer)) return;
    drawer.inert = !isDesktop() && !drawer.classList.contains('is-open');
  }catch(e){ /* ignore */ }
}
function setExpanded(open){
  $all('[data-pf-drawer-open]').forEach(function(b){
    try{ b.setAttribute('aria-expanded', open ? 'true' : 'false'); }catch(e){ /* ignore */ }
  });
}
function openDrawer(opener){
  if(!drawer) return;
  if(opener) lastOpener = opener;
  drawer.classList.add('is-open');
  if(scrim) scrim.classList.add('is-open');
  if(!isDesktop()){
    try{ document.body.classList.add('pf-nav-open'); }catch(e){ /* ignore */ }
  }
  setExpanded(true);
  syncInert();
  try{ drawer.focus({preventScroll:true}); }catch(e){
    try{ drawer.focus(); }catch(e2){ /* ignore */ }
  }
}
function closeDrawer(returnFocus){
  if(!drawer) return;
  drawer.classList.remove('is-open');
  if(scrim) scrim.classList.remove('is-open');
  try{ document.body.classList.remove('pf-nav-open'); }catch(e){ /* ignore */ }
  setExpanded(false);
  syncInert();
  if(returnFocus && lastOpener){
    try{ lastOpener.focus({preventScroll:true}); }catch(e){
      try{ lastOpener.focus(); }catch(e2){ /* ignore */ }
    }
  }
}
function toggleDrawer(opener){
  if(!drawer) return;
  if(drawer.classList.contains('is-open')) closeDrawer(true);
  else openDrawer(opener || null);
}

/* ---------- active row and tab from the current path ---------- */
function activeKeys(){
  var path = '';
  try{ path = window.location.pathname || ''; }catch(e){ path = ''; }
  var file = path.split('/').pop() || 'index.html';
  if(file === '' || file === 'index.html') return {drawer:'home', tab:'home'};
  if(file === 'search.html') return {drawer:'search', tab:'search'};
  if(file === 'courses.html' || file === 'curriculum-index.html' || file === 'course-map.html'
     || path.indexOf('/lessons/') !== -1 || path.indexOf('/chapters/') !== -1
     || path.indexOf('/courses/') !== -1) return {drawer:'learn', tab:'learn'};
  if(file === 'situations.html' || path.indexOf('/situations/') !== -1) return {drawer:'paymentCases', tab:'cases'};
  if(file === 'practice.html' || file === 'mission-control.html' || file === 'reconciliation-war-room.html'
     || file === 'labs-simulators.html' || file === 'tests.html' || file === 'diagnostic.html'
     || path.indexOf('/practice/') !== -1 || path.indexOf('/tests/') !== -1) return {drawer:'practice', tab:''};
  if(file === 'weekly-case.html') return {drawer:'weeklyFreeCase', tab:''};
  if(file === 'dashboard.html' || file === 'portfolio.html') return {drawer:'myProgress', tab:'progress'};
  if(file === 'simulators.html' || file === 'labs.html'
     || path.indexOf('/simulators/') !== -1 || path.indexOf('/labs/') !== -1) return {drawer:'simulator', tab:''};
  if(file === 'explorer.html' || file === 'iso-lab.html' || file === 'mapping-workbench.html') return {drawer:'isoExplorer', tab:''};
  if(file === 'investigation-lab.html' || path.indexOf('/investigation-lab.html') !== -1) return {drawer:'exceptionLab', tab:''};
  if(file === 'ba-studio.html') return {drawer:'baStudio', tab:''};
  if(file === 'signin.html') return {drawer:'profile', tab:''};
  if(file === 'pricing.html' || file === 'payment.html' || file === 'my-purchases.html') return {drawer:'myPurchases', tab:''};
  if(file === 'support.html' || file === 'contact.html') return {drawer:'helpAndSupport', tab:''};
  if(file === 'about.html') return {drawer:'about', tab:''};
  return {drawer:'', tab:''};
}
function markActive(){
  var keys = activeKeys();
  if(keys.drawer){
    $all('[data-drawer]').forEach(function(el){
      try{
        var on = el.getAttribute('data-drawer') === keys.drawer;
        el.classList.toggle('pf-drawer-active', on);
        if(el.tagName === 'A'){
          if(on) el.setAttribute('aria-current', 'page');
          else el.removeAttribute('aria-current');
        }
      }catch(e){ /* ignore */ }
    });
  }
  if(keys.tab){
    $all('.pf-tabbar-item[data-tab]').forEach(function(el){
      try{ el.classList.toggle('is-active', el.getAttribute('data-tab') === keys.tab); }catch(e){ /* ignore */ }
    });
  }
}

/* ---------- My Purchases row: point at the purchases page from any depth ----------
   The drawer markup is baked into every page at build time, so older
   deployed pages still link this row at pricing.html. Repoint it at run
   time so the row lands on my-purchases.html from every depth until the
   next full rebuild reaches all pages. Idempotent: pages whose markup
   already carries the right relative link get the same value back. */
function repointPurchasesRow(){
  var row = null;
  try{ row = document.querySelector('a[data-drawer="myPurchases"]'); }catch(e){ row = null; }
  if(!row) return;
  var path = '';
  try{ path = window.location.pathname || ''; }catch(e){ path = ''; }
  var parts = path.split('/').filter(function(p){ return p !== ''; });
  if(parts.length && parts[parts.length - 1].indexOf('.') !== -1) parts.pop();
  var href = '';
  for(var i = 0; i < parts.length; i++) href += '../';
  href += 'my-purchases.html';
  try{ row.setAttribute('href', href); }catch(e){ /* ignore */ }
}

/* ---------- Appearance popover: dark mode, larger text, sound toggle ---------- */
var DARK_MODE_KEY = 'pf.appearance.darkMode';
var LARGER_TEXT_KEY = 'pf.appearance.largerText';
function applyDarkMode(on){
  try{
    if(document.documentElement) document.documentElement.classList.toggle('pf-dark', !!on);
  }catch(e){ /* ignore */ }
}
function darkModeDefault(){
  try{
    if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return true;
  }catch(e){ /* ignore */ }
  return false;
}
function applyLargerText(on){
  try{
    if(document.documentElement) document.documentElement.classList.toggle('pf-large-text', !!on);
  }catch(e){ /* ignore */ }
}
function initAppearance(){
  /* Dark mode (15 Nov 2026, fix 8): same storage key and default rule
     as the early script in the page head, so the checkbox always
     agrees with the class already on the page. */
  var darkBox = $('#pfDarkMode');
  var storedDark = lsGet(DARK_MODE_KEY);
  var darkOn = storedDark === null ? darkModeDefault() : storedDark === 'true';
  applyDarkMode(darkOn);
  if(darkBox){
    try{ darkBox.checked = darkOn; }catch(e){ /* ignore */ }
    darkBox.addEventListener('change', function(){
      var v = false;
      try{ v = !!darkBox.checked; }catch(e){ v = false; }
      applyDarkMode(v);
      lsSet(DARK_MODE_KEY, v ? 'true' : 'false');
    });
  }
  var box = $('#pfLargerText');
  var on = lsGet(LARGER_TEXT_KEY) === 'true';
  applyLargerText(on);
  if(box){
    try{ box.checked = on; }catch(e){ /* ignore */ }
    box.addEventListener('change', function(){
      var v = false;
      try{ v = !!box.checked; }catch(e){ v = false; }
      applyLargerText(v);
      lsSet(LARGER_TEXT_KEY, v ? 'true' : 'false');
    });
  }
  $all('[data-pf-appearance-toggle]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var pop = $('#pfAppearance');
      if(!pop) return;
      var willOpen = !pop.classList.contains('is-open');
      pop.classList.toggle('is-open', willOpen);
      try{ btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false'); }catch(e){ /* ignore */ }
    });
  });
}

/* ---------- Guided tour: 5 steps, navy card, gold progress, never blocks ---------- */
var TOUR_KEY = 'pf.tour.done';
var TOUR_STEP_KEY = 'pf.tour.step';
var tourIndex = 0;
var tourActive = false;
var tourScrim = null;
var tourCard = null;
var tourHighlightEl = null;
var tourTimer = null;

/* Every step carries the page it belongs to (15 Nov 2026 review
   wave): stepping through the tour NAVIGATES to each target page,
   instead of only highlighting the side panel. The menu step has no
   route: it opens the panel on whatever page the tour started. */
var TOUR_STEPS = [
  {title:'Your menu', body:'Open the side panel any time to reach every area of the hub: courses, cases, practice tools, and your account.', drawer:'open', route:null, targets:['#pfDrawer']},
  {title:'Home', body:'Home shows where to continue, what is recommended for you, and your route through the course.', drawer:'close', route:'index.html', targets:['.hero-video', '#hero', '.pf-hero', 'main h1', '.pf-tabbar-item[data-tab="home"]']},
  {title:'Search', body:'Search finds lessons, guides, cases, and questions across the whole catalogue.', drawer:'open', route:'search.html', targets:['[data-drawer="search"]']},
  {title:'Payment Cases', body:'Payment Cases are real world payment situations to practise, with the working explained.', drawer:'open', route:'situations.html', targets:['[data-drawer="paymentCases"]']},
  {title:'My Progress', body:'My Progress shows your learning analytics, streak, and quiz scores.', drawer:'auto', route:'dashboard.html', targets:[]}
];
function tourCurrentFile(){
  var path = '';
  try{ path = window.location.pathname || ''; }catch(e){ path = ''; }
  var file = path.split('/').pop() || '';
  return file === '' ? 'index.html' : file;
}
function tourPrefix(){
  /* Same depth computation as repointPurchasesRow: one ../ per
     directory below the site root, so a tour step navigates from a
     lesson or chapter page as well as from the root. */
  var path = '';
  try{ path = window.location.pathname || ''; }catch(e){ path = ''; }
  var parts = path.split('/').filter(function(p){ return p !== ''; });
  if(parts.length && parts[parts.length - 1].indexOf('.') !== -1) parts.pop();
  var href = '';
  for(var i = 0; i < parts.length; i++) href += '../';
  return href;
}
function tourGoTo(index){
  if(index < 0 || index >= TOUR_STEPS.length) return;
  var step = TOUR_STEPS[index];
  if(step.route && step.route !== tourCurrentFile()){
    try{ window.sessionStorage.setItem(TOUR_STEP_KEY, String(index)); }catch(e){}
    window.location.href = tourPrefix() + step.route;
    return;
  }
  tourIndex = index;
  renderTourStep();
}

function tourTargets(step){
  if(step.drawer === 'auto'){
    if(isDesktop()) return ['[data-drawer="myProgress"]'];
    return ['.pf-tabbar-item[data-tab="progress"]', '[data-drawer="myProgress"]'];
  }
  return step.targets || [];
}
function clearHighlight(){
  if(tourTimer){ try{ clearTimeout(tourTimer); }catch(e){} tourTimer = null; }
  if(tourHighlightEl){
    try{ tourHighlightEl.classList.remove('pf-tour-highlight'); }catch(e){ /* ignore */ }
    try{ tourHighlightEl.classList.remove('pf-tour-raised'); }catch(e){ /* ignore */ }
    tourHighlightEl = null;
  }
}
function highlightTarget(selectors){
  var el = null;
  for(var i = 0; i < selectors.length; i++){
    el = $(selectors[i]);
    if(el) break;
  }
  if(!el) return;
  tourHighlightEl = el;
  try{ el.classList.add('pf-tour-highlight'); }catch(e){ /* ignore */ }
  var inDrawer = false;
  try{ inDrawer = (typeof drawer !== 'undefined' && drawer) && (el === drawer || drawer.contains(el)); }catch(e){ inDrawer = false; }
  if(!inDrawer){
    /* Non-drawer targets need their own raise above the tour scrim; the
       drawer itself is raised by body.pf-tour-active in pf-theme.css. */
    try{ el.classList.add('pf-tour-raised'); }catch(e){ /* ignore */ }
  }
  if(typeof drawer !== 'undefined' && drawer && el === drawer){
    /* Step 1 targets the whole panel: reset the row list to the top so
       the first row is never left half-clipped by an earlier scroll. */
    var list = $('.pf-drawer-list', drawer);
    if(list){ try{ list.scrollTop = 0; }catch(e){ /* ignore */ } }
    return;
  }
  var pos = '';
  try{ pos = window.getComputedStyle(el).position; }catch(e){ pos = ''; }
  if(pos === 'fixed') return;
  try{
    el.scrollIntoView({behavior: reduceMotion() ? 'auto' : 'smooth', block: 'center'});
  }catch(e){
    try{ el.scrollIntoView(); }catch(e2){ /* ignore */ }
  }
}
function el(tag, cls, text){
  var n = document.createElement(tag);
  if(cls){ try{ n.className = cls; }catch(e){} }
  if(text !== undefined && text !== null){ n.textContent = text; }
  return n;
}
function renderTourStep(){
  if(!tourCard || !tourActive) return;
  var step = TOUR_STEPS[tourIndex];
  if(!step){ endTour(); return; }
  clearHighlight();
  if(step.drawer === 'open') openDrawer(null);
  else if(step.drawer === 'close') closeDrawer(false);
  else if(step.drawer === 'auto'){
    if(isDesktop()) openDrawer(null);
    else closeDrawer(false);
  }
  var drawerStep = step.drawer === 'open' || (step.drawer === 'auto' && isDesktop());
  try{ tourCard.classList.toggle('pf-tour-card-drawer', !!drawerStep); }catch(e){ /* ignore */ }
  var title = $('.pf-tour-title', tourCard);
  var count = $('.pf-tour-count', tourCard);
  var fill = $('.pf-tour-progress-fill', tourCard);
  var body = $('.pf-tour-body', tourCard);
  var back = $('.pf-tour-back', tourCard);
  var next = $('.pf-tour-next', tourCard);
  if(title) title.textContent = step.title;
  if(count) count.textContent = (tourIndex + 1) + ' of ' + TOUR_STEPS.length;
  if(fill){ try{ fill.style.width = Math.round(((tourIndex + 1) / TOUR_STEPS.length) * 100) + '%'; }catch(e){} }
  if(body) body.textContent = step.body;
  if(back){ try{ back.disabled = tourIndex === 0; }catch(e){} }
  if(next) next.textContent = tourIndex === TOUR_STEPS.length - 1 ? 'Done' : 'Next';
  var selectors = tourTargets(step);
  var delay = reduceMotion() ? 0 : 380;
  tourTimer = setTimeout(function(){ highlightTarget(selectors); }, delay);
  if(next){ try{ next.focus({preventScroll:true}); }catch(e){ try{ next.focus(); }catch(e2){} } }
}
function endTour(){
  tourActive = false;
  try{ document.body.classList.remove('pf-tour-active'); }catch(e){ /* ignore */ }
  clearHighlight();
  if(tourScrim){ try{ tourScrim.remove(); }catch(e){} tourScrim = null; }
  if(tourCard){ try{ tourCard.remove(); }catch(e){} tourCard = null; }
  lsSet(TOUR_KEY, 'true');
  try{ window.sessionStorage.removeItem(TOUR_STEP_KEY); }catch(e){}
  if(!isDesktop()) closeDrawer(false);
  var startBtn = $('[data-pf-tour-start]');
  if(startBtn){ try{ startBtn.focus({preventScroll:true}); }catch(e){ try{ startBtn.focus(); }catch(e2){} } }
}
function startTour(){
  startTourAt(0);
}
function startTourAt(index){
  if(tourActive) return;
  if(!document.body) return;
  tourActive = true;
  tourIndex = index;
  try{ document.body.classList.add('pf-tour-active'); }catch(e){ /* ignore */ }
  tourScrim = el('button', 'pf-tour-scrim', '');
  try{ tourScrim.type = 'button'; }catch(e){}
  try{ tourScrim.setAttribute('aria-label', 'Skip tour'); }catch(e){}
  tourScrim.addEventListener('click', function(){ endTour(); });
  tourCard = el('div', 'pf-tour-card', null);
  try{ tourCard.setAttribute('role', 'dialog'); }catch(e){}
  try{ tourCard.setAttribute('aria-label', 'Guided tour'); }catch(e){}
  var head = el('div', 'pf-tour-head', null);
  head.appendChild(el('h2', 'pf-tour-title', ''));
  head.appendChild(el('span', 'pf-tour-count', ''));
  var prog = el('div', 'pf-tour-progress', null);
  prog.appendChild(el('span', 'pf-tour-progress-fill', ''));
  var body = el('p', 'pf-tour-body', '');
  var actions = el('div', 'pf-tour-actions', null);
  var back = el('button', 'pf-tour-back', 'Back');
  try{ back.type = 'button'; }catch(e){}
  back.addEventListener('click', function(){
    if(tourIndex > 0){ tourGoTo(tourIndex - 1); }
  });
  var next = el('button', 'pf-tour-next', 'Next');
  try{ next.type = 'button'; }catch(e){}
  next.addEventListener('click', function(){
    if(tourIndex < TOUR_STEPS.length - 1){ tourGoTo(tourIndex + 1); }
    else { endTour(); }
  });
  actions.appendChild(back);
  actions.appendChild(next);
  var skip = el('button', 'pf-tour-skip', 'Skip Tour');
  try{ skip.type = 'button'; }catch(e){}
  skip.addEventListener('click', function(){ endTour(); });
  tourCard.appendChild(head);
  tourCard.appendChild(prog);
  tourCard.appendChild(body);
  tourCard.appendChild(actions);
  tourCard.appendChild(skip);
  try{
    document.body.appendChild(tourScrim);
    document.body.appendChild(tourCard);
  }catch(e){ tourActive = false; try{ document.body.classList.remove('pf-tour-active'); }catch(e2){} return; }
  renderTourStep();
}

/* ---------- swipe: left on the panel closes, right from the left edge opens ---------- */
function initSwipe(){
  if(!drawer) return;
  var startX = null, startY = null;
  drawer.addEventListener('touchstart', function(ev){
    try{
      var t = ev.changedTouches && ev.changedTouches[0];
      if(!t) return;
      startX = t.clientX; startY = t.clientY;
    }catch(e){ startX = null; }
  }, {passive:true});
  drawer.addEventListener('touchend', function(ev){
    if(startX === null) return;
    try{
      var t = ev.changedTouches && ev.changedTouches[0];
      if(!t) return;
      var dx = t.clientX - startX;
      var dy = t.clientY - startY;
      if(dx < -60 && Math.abs(dx) > Math.abs(dy)) closeDrawer(true);
    }catch(e){ /* ignore */ }
    startX = null; startY = null;
  }, {passive:true});
  var edgeX = null, edgeY = null;
  document.addEventListener('touchstart', function(ev){
    try{
      var t = ev.changedTouches && ev.changedTouches[0];
      if(!t) return;
      if(t.clientX < 24 && drawer && !drawer.classList.contains('is-open')){
        edgeX = t.clientX; edgeY = t.clientY;
      } else { edgeX = null; }
    }catch(e){ edgeX = null; }
  }, {passive:true});
  document.addEventListener('touchend', function(ev){
    if(edgeX === null) return;
    try{
      var t = ev.changedTouches && ev.changedTouches[0];
      if(!t) return;
      var dx = t.clientX - edgeX;
      var dy = t.clientY - edgeY;
      if(dx > 60 && Math.abs(dx) > Math.abs(dy) * 2 && !isDesktop()) openDrawer(null);
    }catch(e){ /* ignore */ }
    edgeX = null; edgeY = null;
  }, {passive:true});
}

/* ---------- wire up ---------- */
function init(){
  drawer = $('#pfDrawer');
  scrim = $('#pfDrawerScrim');
  markActive();
  repointPurchasesRow();
  initAppearance();
  if(!drawer) return;
  $all('[data-pf-drawer-open]').forEach(function(btn){
    btn.addEventListener('click', function(){ toggleDrawer(btn); });
  });
  if(scrim) scrim.addEventListener('click', function(){ closeDrawer(true); });
  $all('[data-pf-tour-start]').forEach(function(btn){
    btn.addEventListener('click', function(){
      closeDrawer(false);
      setTimeout(function(){ startTour(); }, 120);
    });
  });
  $all('.pf-drawer-row').forEach(function(row){
    if(row.tagName === 'A'){
      row.addEventListener('click', function(){ closeDrawer(false); });
    }
  });
  document.addEventListener('keydown', function(ev){
    if(!ev || ev.key !== 'Escape') return;
    if(tourActive){ endTour(); return; }
    if(drawer.classList.contains('is-open') && !isDesktop()) closeDrawer(true);
  });
  window.addEventListener('resize', function(){ syncInert(); });
  initSwipe();
  syncInert();
  /* Tour resume (15 Nov 2026 review wave): a tour step that
     navigated here stored its index in session storage. Consume it
     (so an ordinary later visit never resurrects the tour) and
     reopen the tour at that step. */
  var resumeStep = null;
  try{ resumeStep = window.sessionStorage.getItem(TOUR_STEP_KEY); }catch(e){ resumeStep = null; }
  if(resumeStep !== null && resumeStep !== ''){
    try{ window.sessionStorage.removeItem(TOUR_STEP_KEY); }catch(e){}
    var resumeIndex = parseInt(resumeStep, 10);
    if(!isNaN(resumeIndex) && resumeIndex >= 0 && resumeIndex < TOUR_STEPS.length){
      setTimeout(function(){ startTourAt(resumeIndex); }, 150);
    }
  }
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

window.PFDrawer = {
  open: openDrawer,
  close: closeDrawer,
  toggle: toggleDrawer,
  startTour: startTour
};

})();
