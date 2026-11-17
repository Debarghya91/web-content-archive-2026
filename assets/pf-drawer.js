/* ===== Payments Training Hub side panel and tab bar (app parity, 12 Nov 2026, worker 1) =====
   Mirrors the iOS app drawer: slide in panel, dim background, tap dim or
   swipe left to close, swipe right from the left edge to open. Also marks
   the active drawer row and tab from the current path, runs the Appearance
   popover (dark mode, larger text plus the sound toggle). No dependencies. Every lookup is
   guarded: on a page missing an element, the matching feature quietly
   does nothing instead of throwing. */
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
  if(file === 'tests.html' || path.indexOf('/tests/') !== -1) return {drawer:'testSeries', tab:''};
  if(file === 'practice.html' || file === 'mission-control.html' || file === 'reconciliation-war-room.html'
     || file === 'labs-simulators.html'  || file === 'diagnostic.html'
     || path.indexOf('/practice/') !== -1 ) return {drawer:'practice', tab:''};
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
  $all('.pf-drawer-row').forEach(function(row){
    if(row.tagName === 'A'){
      row.addEventListener('click', function(){ closeDrawer(false); });
    }
  });
  document.addEventListener('keydown', function(ev){
    if(!ev || ev.key !== 'Escape') return;
    if(drawer.classList.contains('is-open') && !isDesktop()) closeDrawer(true);
  });
  window.addEventListener('resize', function(){ syncInert(); });
  initSwipe();
  syncInert();
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

window.PFDrawer = {
  open: openDrawer,
  close: closeDrawer,
  toggle: toggleDrawer
};

})();
