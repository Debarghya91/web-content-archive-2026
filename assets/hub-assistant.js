/* ===== Hub Assistant (chat assistant widget) =====
   Local only: answers come from assets/search-index.json, fetched
   lazily on first use. No server call, no AI API, no tokens, no cost.
   Nothing is invented beyond the matched course content: course
   questions get a short answer in the course's own words plus a
   tappable link to the full lesson, guide or situation. Greetings and
   small talk are answered by keyword/pattern matching only.
   Position and hidden/open state persist in localStorage
   (key pth-hub-assistant-v2) so the assistant stays as the learner
   left it across pages. */
(function(){
'use strict';

var root = document.getElementById('hub-assistant');
if(!root) return;
var prefix = root.getAttribute('data-prefix') || '';
var isHomepage = root.getAttribute('data-expanded') === 'true';
var mascot = document.getElementById('hub-mascot');
var hideBtn = document.getElementById('hub-hide');
var panel = document.getElementById('hub-panel');
var closeBtn = document.getElementById('hub-close');
var dot = document.getElementById('hub-dot');
var messagesEl = document.getElementById('hub-messages');
var form = document.getElementById('hub-form');
var input = document.getElementById('hub-input');
var startersEl = document.getElementById('hub-starters');
if(!mascot || !panel || !messagesEl || !form || !input) return;

var LS_KEY = 'pth-hub-assistant-v2';
var LS_KEY_V1 = 'pth-hub-assistant-v1';
var state = {hidden: false, x: null, y: null, open: null};
var migrated = false;
try{
  var saved = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
  if(!saved){
    /* v1 stored a bottom-left dragged position; migrate hidden/open only
       so the new bottom-right default applies to every learner. */
    var legacy = JSON.parse(localStorage.getItem(LS_KEY_V1) || 'null');
    if(legacy && typeof legacy === 'object'){
      if(legacy.hidden === true) state.hidden = true;
      if(legacy.open === true || legacy.open === false) state.open = legacy.open;
      migrated = true;
    }
  }else if(typeof saved === 'object'){
    if(saved.hidden === true) state.hidden = true;
    if(typeof saved.x === 'number') state.x = saved.x;
    if(typeof saved.y === 'number') state.y = saved.y;
    if(saved.open === true || saved.open === false) state.open = saved.open;
  }
}catch(e){ /* storage unavailable: fall back to defaults */ }
function saveState(){
  try{ localStorage.setItem(LS_KEY, JSON.stringify(state)); }catch(e){ /* ignore */ }
}
if(migrated) saveState();

/* ---------- positioning ---------- */
function clampPos(x, y){
  var w = 84, h = 120; /* mascot footprint, approx */
  x = Math.max(8, Math.min(x, Math.max(8, window.innerWidth - w)));
  y = Math.max(8, Math.min(y, Math.max(8, window.innerHeight - h)));
  return {x: x, y: y};
}
function applyPosition(){
  if(state.x === null || state.y === null){
    root.style.left = ''; root.style.top = ''; root.style.bottom = ''; root.style.right = '';
    return;
  }
  var p = clampPos(state.x, state.y);
  root.style.left = p.x + 'px';
  root.style.top = p.y + 'px';
  root.style.bottom = 'auto';
}
window.addEventListener('resize', function(){
  if(state.x !== null && state.y !== null) applyPosition();
});

/* ---------- open / close / hide ---------- */
var greeted = false;
function openPanel(){
  panel.hidden = false;
  state.open = true;
  saveState();
  if(!greeted){
    greeted = true;
    addAssistantMessage('How can I help you? Ask me about any payment topic, or try one of the starters below.');
  }
  setTimeout(function(){ input.focus(); }, 50);
}
function closePanel(){
  panel.hidden = true;
  state.open = false;
  saveState();
}
function togglePanel(){
  if(panel.hidden) openPanel(); else closePanel();
}
function hideWidget(){
  state.hidden = true;
  state.open = false;
  saveState();
  root.classList.add('hub-hidden');
  closePanel();
}
function showWidget(){
  state.hidden = false;
  saveState();
  root.classList.remove('hub-hidden');
}
if(state.hidden){
  root.classList.add('hub-hidden');
}else{
  applyPosition();
  /* Homepage: expanded by default unless the learner closed it.
     Other pages: mascot only, unless the learner left the panel open. */
  if(isHomepage ? state.open !== false : state.open === true) openPanel();
  else panel.hidden = true;
}

/* ---------- drag (mouse + touch, like a draggable bubble) ---------- */
var drag = null, justDraggedAt = 0;
mascot.addEventListener('pointerdown', function(ev){
  if(ev.target === hideBtn) return;
  var r = root.getBoundingClientRect();
  drag = {pointerId: ev.pointerId, startX: ev.clientX, startY: ev.clientY,
          grabDX: ev.clientX - r.left, grabDY: ev.clientY - r.top, moved: false};
  try{ mascot.setPointerCapture(ev.pointerId); }catch(e){ /* ignore */ }
  ev.preventDefault();
});
mascot.addEventListener('pointermove', function(ev){
  if(!drag || ev.pointerId !== drag.pointerId) return;
  var dx = ev.clientX - drag.startX, dy = ev.clientY - drag.startY;
  if(!drag.moved && Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
  if(!drag.moved){
    drag.moved = true;
    root.classList.add('hub-dragging');
    closePanel(); /* dragging with the panel open is awkward */
  }
  var p = clampPos(ev.clientX - drag.grabDX, ev.clientY - drag.grabDY);
  root.style.left = p.x + 'px';
  root.style.top = p.y + 'px';
  root.style.bottom = 'auto';
  drag.lastX = p.x; drag.lastY = p.y; drag.lastClientY = ev.clientY;
});
function endDrag(ev){
  if(!drag || (ev && ev.pointerId !== drag.pointerId)) return;
  var wasDrag = drag.moved;
  var clientY = (ev && typeof ev.clientY === 'number') ? ev.clientY : drag.lastClientY;
  root.classList.remove('hub-dragging');
  if(wasDrag){
    justDraggedAt = Date.now(); /* the click that follows a drag must not toggle */
    /* Dragged to the bottom edge: hide, like dismissing a bubble.
       The small gold dot stays so the learner can bring it back. */
    if(typeof clientY === 'number' && clientY > window.innerHeight - 70){
      state.x = null; state.y = null;
      hideWidget();
    }else if(typeof drag.lastX === 'number'){
      state.x = drag.lastX; state.y = drag.lastY;
      saveState();
    }
  }
  drag = null;
}
mascot.addEventListener('pointerup', endDrag);
mascot.addEventListener('pointercancel', endDrag);

/* Tap / click (a pointerup with no real movement) toggles the panel. */
mascot.addEventListener('click', function(ev){
  if(ev.target === hideBtn) return;
  if(Date.now() - justDraggedAt < 300) return;
  togglePanel();
});
mascot.addEventListener('keydown', function(ev){
  if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); togglePanel(); }
});
hideBtn.addEventListener('click', function(ev){ ev.stopPropagation(); hideWidget(); });
hideBtn.addEventListener('keydown', function(ev){
  if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); ev.stopPropagation(); hideWidget(); }
});
closeBtn.addEventListener('click', function(){ closePanel(); });
dot.addEventListener('click', function(){ showWidget(); });
document.addEventListener('keydown', function(ev){
  if(ev.key === 'Escape' && !panel.hidden) closePanel();
});

/* ---------- chat rendering ---------- */
function el(tag, cls, text){
  var n = document.createElement(tag);
  if(cls) n.className = cls;
  if(text !== undefined && text !== null) n.textContent = text;
  return n;
}
function scrollToBottom(){ messagesEl.scrollTop = messagesEl.scrollHeight; }
function addUserMessage(text){
  messagesEl.appendChild(el('div', 'hub-msg user', text));
  scrollToBottom();
}
function addAssistantMessage(text){
  var m = el('div', 'hub-msg assistant');
  var p = el('p', null, text);
  m.appendChild(p);
  messagesEl.appendChild(m);
  scrollToBottom();
  return m;
}
function showTyping(){
  var m = el('div', 'hub-msg assistant hub-typing', 'Hub Assistant is thinking…');
  messagesEl.appendChild(m);
  scrollToBottom();
  return m;
}

/* ---------- local search (search-index.json) ---------- */
var entries = null, loading = false, loadQueue = [];
function ensureIndex(cb){
  if(entries){ cb(); return; }
  loadQueue.push(cb);
  if(loading) return;
  loading = true;
  fetch(prefix + 'assets/search-index.json').then(function(r){ return r.json(); }).then(function(data){
    entries = (data && data.entries) || [];
    loading = false;
    var q = loadQueue; loadQueue = [];
    q.forEach(function(f){ f(); });
  }).catch(function(){
    loading = false;
    entries = [];
    var q = loadQueue; loadQueue = [];
    q.forEach(function(f){ f(); });
  });
}
var STOPWORDS = {};
['what','is','the','a','an','how','does','do','did','can','could','would','should',
 'tell','me','about','explain','in','of','and','or','to','for','please','i','want','know',
 'work','works','mean','means','difference','between','why','when','where','who','which',
 'it','its','this','that','with','on','at','by','from','as','are','was','were','be','been',
 'have','has','use','used','using','get','getting','your','my','give','show','find',
 'hello','hi','hey','there'].forEach(function(w){ STOPWORDS[w] = true; });
function tokenize(s){
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ').filter(Boolean);
}
function normHay(e){
  return (' ' + ((e.title || '') + ' ' + (e.text || '')).toLowerCase().replace(/[^a-z0-9]+/g, ' ') + ' ');
}
function searchIndex(q){
  var words = tokenize(q).filter(function(w){ return !STOPWORDS[w] && w.length > 1; });
  if(!words.length || !entries) return {words: words, results: []};
  var andResults = [], orResults = [];
  entries.forEach(function(e){
    var hay = normHay(e);
    var title = (' ' + (e.title || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ') + ' ');
    var hits = 0, titleHits = 0;
    words.forEach(function(w){
      if(hay.indexOf(' ' + w + ' ') !== -1){ hits++; if(title.indexOf(' ' + w + ' ') !== -1) titleHits++; }
    });
    if(!hits) return;
    var score = hits * 1 + titleHits * 2;
    /* Title density: a lesson whose title is mostly the query (e.g.
       "What pacs.008 is") beats a lesson that only mentions it in
       passing (e.g. a comparison lesson). */
    var titleWords = title.split(' ').filter(function(w){ return w && !STOPWORDS[w] && w.length > 1; });
    if(titleWords.length) score += (titleHits / titleWords.length) * 4;
    if(hay.indexOf(' ' + words.join(' ') + ' ') !== -1) score += 3; /* exact phrase */
    var rec = {e: e, score: score, hits: hits};
    if(hits === words.length) andResults.push(rec);
    orResults.push(rec);
  });
  andResults.sort(function(a, b){ return b.score - a.score; });
  orResults.sort(function(a, b){ return b.score - a.score; });
  var results = (andResults.length ? andResults : orResults).slice(0, 3);
  return {words: words, results: results};
}
function excerptFor(e, words, maxLen){
  var t = String(e.text || '').replace(/\s+/g, ' ').trim();
  var title = String(e.title || '').trim();
  if(title && t.toLowerCase().indexOf(title.toLowerCase()) === 0){
    t = t.slice(title.length).replace(/^\s+/, '');
  }
  var sentences = t.match(/[^.!?]+[.!?]+["']?\s*/g) || [t];
  var start = 0;
  for(var i = 0; i < sentences.length; i++){
    var s = sentences[i].toLowerCase();
    var hit = false;
    for(var k = 0; k < words.length; k++){ if(s.indexOf(words[k]) !== -1){ hit = true; break; } }
    if(hit){ start = i; break; }
  }
  var out = '';
  for(var j = start; j < sentences.length && out.length < maxLen; j++){ out += sentences[j]; }
  out = out.trim();
  /* Lesson text opens with a "<Chapter> Part N: <Domain>" header glued
     to the first sentence. The domain is title-case words; the body
     sentence starts at the first word whose NEXT word starts lowercase
     or is all-caps (e.g. "Standards The MT103 is..." -> "The MT103
     is..."; "Payments Nostro and vostro are..." -> "Nostro and vostro
     are..."). Drop the header so the excerpt starts with the real
     sentence. */
  function stripPartHeader(s){
    var m = s.match(/^(.*?Part \d+: )([\s\S]*)$/);
    if(!m) return s;
    var words = m[2].split(' ');
    for(var i = 0; i < words.length - 1; i++){
      var next = words[i + 1];
      if(/^[a-z]/.test(next) || /^[A-Z0-9]{2,}$/.test(next)){
        return words.slice(i).join(' ');
      }
    }
    return s;
  }
  out = stripPartHeader(out);
  /* Hard cap: never overshoot maxLen by a whole trailing sentence. */
  if(out.length > maxLen){
    var cut = out.slice(0, maxLen);
    var sb = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
    if(sb > maxLen * 0.5) out = cut.slice(0, sb + 1);
    else { var sp = cut.lastIndexOf(' '); out = sp > 0 ? cut.slice(0, sp) : cut; }
  }
  out = out.trim();
  var total = t.length;
  if(out.length < total && out.length > 0) out += ' …';
  return out || t.slice(0, maxLen);
}

/* ---------- conversational handling (keyword/pattern matching only) ---------- */
var REPLIES = {
  greeting: "Hello! I'm the Hub Assistant, the Payments Training Hub chat assistant. I can help you with payments, banking, ISO 20022, SWIFT and your course content. What would you like to learn about?",
  howAreYou: "I'm doing well, thanks for asking! I'm here to help you learn payments and banking. What would you like to ask about?",
  whoAreYou: "I'm the Hub Assistant, the Payments Training Hub chat assistant. I help with payments, banking, ISO 20022, SWIFT and the course content. Ask me anything from your lessons.",
  thanks: "You're welcome! Happy to help. Ask me anything else about payments and banking.",
  bye: "Goodbye! Good luck with your learning. I'm here whenever you need help with payments and banking.",
  financialAdvice: "I can't give personal financial advice or advice about your money. I can help you learn how payments and banking work, though. What would you like to learn about?",
  offTopic: "I can only help with the Payments Training Hub course content, payments and banking. Try asking about a lesson, or open a lesson from the Courses page.",
  notCovered: "The course does not cover that yet. Try asking about a lesson topic, or browse the Courses page for the closest lesson."
};
var DOMAIN_WORDS = ['payment','payments','bank','banking','swift','iso','mt103','mt202','pacs','pain','camt','nostro','vostro','settlement','clearing','card','cards','sepa','fedwire','chips','rtgs','liquidity','reconciliation','fraud','compliance','aml','kyc','treasury','correspondent','rail','rails','api','ledger','invoice','transfer','remittance','forex','fx','upi','faster','chaps','bacs','target','tips','cbpr','migration','message','messages','account','debit','credit','chargeback','interchange','scheme','currency','cross-border','cross border','ba','po','product owner','business analyst','brd','fsd','user stor'];
function hasDomainWord(q){
  for(var i = 0; i < DOMAIN_WORDS.length; i++){
    if(q.indexOf(DOMAIN_WORDS[i]) !== -1) return true;
  }
  return false;
}
function isOffTopic(q){
  return /\b(weather|news|joke|funny|football|cricket|movie|film|song|music|sport|politics|election|horoscope|recipe|celebrity|actor|who won|score today)\b/.test(q)
    || /\b(stock price|share price|bitcoin price|crypto price)\b/.test(q)
    || /tell me a joke/.test(q);
}
function isFinancialAdvice(q){
  return /\bshould i (invest|buy|sell)\b/.test(q)
    || /\binvest (in|my)\b/.test(q)
    || /\bbest (bank|credit card|savings account|account)\b/.test(q)
    || /\bwhich bank (should|to)\b/.test(q)
    || /\bmy money\b/.test(q)
    || /\b(financial|investment) advice\b/.test(q)
    || /\bstock (tip|to buy)\b/.test(q)
    || /\bwhat (stock|crypto|share) (should|to)\b/.test(q);
}
function matchIntent(q){
  var t = q.trim().toLowerCase();
  if(/^(hi|hii+|hello|hey|hiya|yo|namaste|hola|good\s(morning|afternoon|evening))\b/.test(t)) return 'greeting';
  if(/how are you|how'?s it going|what'?s up|how are things|how do you feel/.test(t)) return 'howAreYou';
  if(/who are you|what are you|are you (a )?(human|robot|real|ai\b)|your name|what'?s your name/.test(t)) return 'whoAreYou';
  if(/\b(thank you|thanks|thx|thankyou)\b/.test(t)) return 'thanks';
  if(/^(bye|goodbye|good night|see you|take care)\b/.test(t)) return 'bye';
  if(isFinancialAdvice(t)) return 'financialAdvice';
  if(isOffTopic(t)) return 'offTopic';
  return null;
}

var lastAnswer = null; /* {entry, words} for "Tell me more" */
function renderAnswer(msgEl, top, others, words){
  msgEl.classList.remove('hub-typing');
  msgEl.textContent = '';
  var intro = el('p', null, "Here's what the course says:");
  msgEl.appendChild(intro);
  var titleP = el('p', null, '');
  var b = el('b', null, top.e.title || top.e.id);
  titleP.appendChild(b);
  msgEl.appendChild(titleP);
  var bodyP = el('p', 'hub-answer-body', excerptFor(top.e, words, 650));
  msgEl.appendChild(bodyP);
  var src = el('span', 'hub-src', '');
  var a = el('a', null, 'Open the full lesson: ' + (top.e.title || top.e.id));
  a.href = prefix + top.e.url;
  src.appendChild(a);
  var type = el('span', 'hub-type', (top.e.type || 'lesson') + ' · Payments Training Hub');
  src.appendChild(type);
  msgEl.appendChild(src);
  others.forEach(function(r){
    var s2 = el('span', 'hub-src', '');
    var a2 = el('a', null, r.e.title || r.e.id);
    a2.href = prefix + r.e.url;
    s2.appendChild(a2);
    s2.appendChild(el('span', 'hub-type', (r.e.type || 'lesson')));
    msgEl.appendChild(s2);
  });
  var more = el('button', 'hub-more', 'Tell me more');
  more.type = 'button';
  more.addEventListener('click', function(){
    bodyP.textContent = excerptFor(top.e, words, 1500);
    more.remove();
    scrollToBottom();
  });
  msgEl.appendChild(more);
  scrollToBottom();
}
function answerQuestion(q){
  var typing = showTyping();
  ensureIndex(function(){
    setTimeout(function(){
      var intent = matchIntent(q);
      if(intent){
        typing.classList.remove('hub-typing');
        typing.textContent = '';
        typing.appendChild(el('p', null, REPLIES[intent]));
        scrollToBottom();
        return;
      }
      /* "Tell me more" expands the last answer instead of searching. */
      if(lastAnswer && /tell me more|more (please|info|details)?$|give me an example|explain (more|further)|elaborate|^more$|go on/.test(q.trim().toLowerCase())){
        renderAnswer(typing, {e: lastAnswer.entry}, [], lastAnswer.words);
        lastAnswer = null;
        return;
      }
      var res = searchIndex(q);
      if(!res.results.length){
        typing.classList.remove('hub-typing');
        typing.textContent = '';
        typing.appendChild(el('p', null, hasDomainWord(q.toLowerCase()) ? REPLIES.notCovered : REPLIES.offTopic));
        scrollToBottom();
        return;
      }
      var top = res.results[0];
      lastAnswer = {entry: top.e, words: res.words};
      renderAnswer(typing, top, res.results.slice(1), res.words);
    }, 450);
  });
}
function sendQuestion(q){
  q = (q || '').trim();
  if(!q) return;
  addUserMessage(q);
  input.value = '';
  answerQuestion(q);
}
form.addEventListener('submit', function(ev){
  ev.preventDefault();
  sendQuestion(input.value);
});
startersEl.addEventListener('click', function(ev){
  var chip = ev.target.closest ? ev.target.closest('.hub-chip') : null;
  if(chip && chip.getAttribute('data-q')) sendQuestion(chip.getAttribute('data-q'));
});

/* Exposed for local verification only: pure search/intent logic. */
window.__hubAssistantTest = {
  tokenize: tokenize,
  searchIndex: function(q){ return searchIndex(q); },
  matchIntent: matchIntent,
  excerptFor: excerptFor,
  loadIndex: function(data){ entries = (data && data.entries) || []; },
  replies: REPLIES
};
})();
