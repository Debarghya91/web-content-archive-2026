
/* ================= NAVIGATION ================= */
function showHome(){
  pauseAllAudio();
  document.querySelectorAll('.chapter-page').forEach(function(p){p.classList.remove('active')});
  document.getElementById('homePage').style.display='block';
  window.scrollTo(0,0);
  document.getElementById('progressBar').style.width='0%';
}
function openChapter(id){
  pauseAllAudio();
  document.getElementById('homePage').style.display='none';
  document.querySelectorAll('.chapter-page').forEach(function(p){p.classList.remove('active')});
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
  if(!soundMuted){
    var first = document.querySelector('#' + id + ' audio');
    if(first){ first.muted = false; first.play().catch(function(e){ console.warn('Autoplay blocked, tap Play to start the narration:', e); });
      if(typeof setPlayLabel === 'function') setPlayLabel(id + 's1', true); }
  }
}
/* ================= AUDIO (pre-recorded MP3, no speech synthesis) ================= */
var soundMuted = false;
function pauseAllAudio(){
  document.querySelectorAll('audio').forEach(function(a){ a.pause(); });
  document.querySelectorAll('[id^="play-"]').forEach(function(b){ b.textContent = 'Play'; });
}
function toggleMute(){
  soundMuted = !soundMuted;
  document.querySelectorAll('audio').forEach(function(a){ a.muted = soundMuted; });
  var b = document.getElementById('muteToggle');
  if(b) b.textContent = soundMuted ? 'Sound: Off' : 'Sound: On';
  if(soundMuted) pauseAllAudio();
}
function playSectionAudio(id){
  if(soundMuted) return;
  var a = document.getElementById('audio-' + id);
  if(!a) return;
  pauseAllAudio();
  a.muted = false;
  a.play().then(function(){ if(typeof setPlayLabel === 'function') setPlayLabel(id, true); }).catch(function(e){
    if(typeof setPlayLabel === 'function') setPlayLabel(id, false);
    console.warn('Playback could not start, tap Play again:', e);
  });
}
/* Forge tips (text only, no speech) */
var forgeTips = [
  'Hi, I am Forge. Open any section and the narration plays automatically. Use the sound toggle in the header to mute me.',
  'In cross-border payments, always check the settlement code first. It tells you where the money actually goes.',
  'The UETR is your best friend. If a payment goes missing, the UETR is how you find it.',
  'Remember: clearing calculates, settlement moves money. They are two different steps.',
  'Idempotency is not optional. If a payment times out, check by UETR before you retry.'
];
var forgeTipIdx = 0;
function forgeTip(){
  var tip = forgeTips[forgeTipIdx % forgeTips.length];
  forgeTipIdx++;
  var b = document.getElementById('forgeBubble');
  b.textContent = tip;
  b.classList.add('show');
  clearTimeout(b._t);
  b._t = setTimeout(function(){ b.classList.remove('show'); }, 8000);
}
/* Forge blinking */
setInterval(function(){
  var l = document.getElementById('forgeEyeL');
  var r = document.getElementById('forgeEyeR');
  if(l && r){
    l.setAttribute('ry', 0.5); r.setAttribute('ry', 0.5);
    setTimeout(function(){ l.setAttribute('ry', 2.5); r.setAttribute('ry', 2.5); }, 150);
  }
}, 4000);
/* ================= PROGRESS BAR ================= */
window.addEventListener('scroll', function(){
  var h = document.documentElement;
  var max = h.scrollHeight - h.clientHeight;
  var pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
  document.getElementById('progressBar').style.width = pct + '%';
});
/* Reveal on scroll */
var revealObserver = new IntersectionObserver(function(entries){
  entries.forEach(function(e){ if(e.isIntersecting) e.target.classList.add('visible'); });
}, {threshold: 0.1});
document.querySelectorAll('.reveal').forEach(function(el){ revealObserver.observe(el); });
/* ================= QUIZ ================= */
document.querySelectorAll('.quiz-q').forEach(function(q){
  var correct = q.getAttribute('data-answer');
  q.querySelectorAll('input[type=radio]').forEach(function(radio){
    radio.addEventListener('change', function(){
      q.querySelectorAll('label').forEach(function(l){ l.classList.remove('correct','wrong'); });
      var chosen = radio.closest('label');
      if(radio.value === correct){ chosen.classList.add('correct'); }
      else { chosen.classList.add('wrong'); }
      q.querySelector('.expl').classList.add('show');
    });
  });
});
/* ================= DIAGRAM ANIMATIONS ================= */
var animTimers = {};
function stopAnim(key){
  if(animTimers[key]){ clearTimeout(animTimers[key]); delete animTimers[key]; }
}
function pauseAnim(key){
  stopAnim(key);
  
  if(key === 'serial' || key === 'cover' || key === 'life'){
    var dot = document.getElementById(key === 'serial' ? 'serialDot' : key === 'cover' ? 'coverMsgDot' : 'lifeDot');
    if(dot) dot.style.display = 'none';
  }
}
/* --- Serial diagram --- */
var serialStages = [
  {x:80, label:'Debtor instructs Bank A to pay 100,000 euros.', info:'Debtor instructs Bank A. Bank A debits the debtor account and prepares the payment.', bal:'sBal0', balText:'EUR 0'},
  {x:240, label:'Bank A sends the payment to Bank B.', info:'Bank A debits its euro nostro account at Bank B by 100,000. Message and funds move together.', bal:'sBal1', balText:'Debited 100,000'},
  {x:400, label:'Bank B forwards to Bank C.', info:'Bank B screens the payment, debits Bank A vostro account, and forwards to Bank C in Tokyo.', bal:'sBal2', balText:'Debited 100,000'},
  {x:560, label:'Bank C forwards to Bank D.', info:'Bank C screens, debits Bank B, and forwards to Bank D, the creditor bank.', bal:'sBal3', balText:'Debited 100,000'},
  {x:720, label:'Creditor receives 100,000 euros.', info:'Bank D credits the supplier account with 100,000 euros. Payment complete.', bal:'sBal4', balText:'EUR 100,000'}
];
function playSerial(){
  stopAnim('serial');
  var dot = document.getElementById('serialDot');
  var label = document.getElementById('serialLabel');
  var info = document.getElementById('serialInfo');
  dot.style.display = 'block';
  var i = 0;
  function step(){
    if(i >= serialStages.length){  return; }
    var s = serialStages[i];
    dot.setAttribute('cx', s.x);
    dot.setAttribute('cy', 100);
    label.textContent = s.label;
    info.innerHTML = '<b>Stage ' + (i+1) + ' of 5:</b> ' + s.info;
    document.querySelectorAll('#serialSvg .diag-node').forEach(function(n){ n.classList.remove('active'); });
    var node = document.querySelector('#serialSvg .diag-node[data-stage="' + i + '"]');
    if(node) node.classList.add('active');
    var balEl = document.getElementById(s.bal);
    if(balEl && s.balText) balEl.textContent = s.balText;
    i++; animTimers['serial'] = setTimeout(step, 2200);
  }
  step();
}
function resetSerial(){
  stopAnim('serial');
  
  var dot = document.getElementById('serialDot');
  dot.style.display = 'none';
  document.getElementById('serialLabel').textContent = 'Press Play to watch the payment travel through each bank';
  document.getElementById('serialInfo').textContent = 'The payment message and the funds move together, bank by bank. Each bank debits the previous bank and credits the next.';
  document.querySelectorAll('#serialSvg .diag-node').forEach(function(n){ n.classList.remove('active'); });
  document.getElementById('sBal0').textContent = 'GBP 100,000';
  document.getElementById('sBal1').textContent = 'London';
  document.getElementById('sBal2').textContent = 'Frankfurt';
  document.getElementById('sBal3').textContent = 'Tokyo';
  document.getElementById('sBal4').textContent = 'EUR 0';
}
/* --- Cover diagram --- */
var coverStages = [
  {msgX:80, fundX:80, label:'Bank A prepares two messages.', info:'Bank A debits the debtor. It prepares a payment message for Bank D and a cover message for Bank B.'},
  {msgX:400, fundX:240, label:'Message goes direct. Funds go via Bank B.', info:'The payment message travels directly to Bank D in Tokyo. The cover funds move through Bank B in Frankfurt.'},
  {msgX:720, fundX:400, label:'Message arrives at Bank D. Funds reach Bank C.', info:'Bank D now has the full payment details. The cover funds are at Bank C, on their way to Bank D.'},
  {msgX:720, fundX:720, label:'Funds arrive. Bank D matches and credits.', info:'Bank D receives the cover funds, matches them to the direct message by reference, and credits the supplier.'}
];
function playCover(){
  stopAnim('cover');
  var msgDot = document.getElementById('coverMsgDot');
  var fundDot = document.getElementById('coverFundDot');
  var info = document.getElementById('coverInfo');
  msgDot.style.display = 'block';
  fundDot.style.display = 'block';
  var i = 0;
  function step(){
    if(i >= coverStages.length){  return; }
    var s = coverStages[i];
    msgDot.setAttribute('cx', s.msgX);
    msgDot.setAttribute('cy', 60);
    fundDot.setAttribute('cx', s.fundX);
    fundDot.setAttribute('cy', 200);
    info.innerHTML = '<b>Stage ' + (i+1) + ' of 4:</b> ' + s.info;
    i++; animTimers['cover'] = setTimeout(step, 2200);
  }
  step();
}
function resetCover(){
  stopAnim('cover');
  
  document.getElementById('coverMsgDot').style.display = 'none';
  document.getElementById('coverFundDot').style.display = 'none';
  document.getElementById('coverInfo').textContent = 'The teal dot is the payment message going direct. The amber dot is the funds settling through correspondents. Watch them arrive at Bank D separately.';
}
/* --- Lifecycle simulator --- */
var lifeScenarios = {
  happy: [
    {x:65, label:'Customer initiates the payment.', info:'The customer taps send in the app. The payment enters the system.'},
    {x:185, label:'Validation passes.', info:'Format, funds, and limits all check out. No errors.'},
    {x:305, label:'Sanctions screening clears.', info:'No match on any sanctions list. The payment proceeds.'},
    {x:425, label:'Routing selects the best path.', info:'The payment is routed via the correspondent bank to the destination.'},
    {x:545, label:'Clearing calculates the net position.', info:'The payment is included in the clearing cycle. Net position calculated.'},
    {x:665, label:'Settlement completes.', info:'The payment settles in central bank money. Final and irrevocable.'},
    {x:785, label:'Creditor receives the payment.', info:'The creditor bank credits the account and confirms. Payment complete.'}
  ],
  sanctions: [
    {x:65, label:'Customer initiates the payment.', info:'The customer taps send. The payment enters the system.'},
    {x:185, label:'Validation passes.', info:'Format, funds, and limits all check out.'},
    {x:305, label:'Sanctions screening hits. Payment stopped.', info:'The creditor name matches a sanctions list entry. The payment is blocked and sent to compliance for review. This is a hard stop.'}
  ],
  timeout: [
    {x:65, label:'Customer initiates the payment.', info:'The customer taps send. The payment enters the system.'},
    {x:185, label:'Validation passes.', info:'Format, funds, and limits all check out.'},
    {x:305, label:'Sanctions screening clears.', info:'No match. The payment proceeds.'},
    {x:425, label:'Routing sends the payment.', info:'The payment is sent to the correspondent bank.'},
    {x:425, label:'No confirmation received. Timeout.', info:'The expected confirmation did not arrive in time. The sender does not know if the payment went through. Check by UETR before retrying, never retry blindly.'}
  ],
  reject: [
    {x:65, label:'Customer initiates the payment.', info:'The customer taps send. The payment enters the system.'},
    {x:185, label:'Validation fails. Payment rejected.', info:'The account number is invalid. The payment is rejected immediately and the customer is told why. The funds stay with the debtor.'}
  ],
  return: [
    {x:65, label:'Customer initiates the payment.', info:'The customer taps send.'},
    {x:185, label:'Validation passes.', info:'All checks pass.'},
    {x:305, label:'Sanctions screening clears.', info:'No match.'},
    {x:425, label:'Routing and clearing complete.', info:'The payment clears and settles.'},
    {x:665, label:'Settlement completes.', info:'The payment settles. The creditor bank credits the account.'},
    {x:785, label:'Creditor bank returns the payment.', info:'The creditor account was closed. The creditor bank returns the funds. A return after credit requires the money to be moved back.'}
  ]
};
function playLife(scenario){
  stopAnim('life');
  var stages = lifeScenarios[scenario];
  var dot = document.getElementById('lifeDot');
  var label = document.getElementById('lifeLabel');
  var info = document.getElementById('lifeInfo');
  dot.style.display = 'block';
  var i = 0;
  function step(){
    if(i >= stages.length){  return; }
    var s = stages[i];
    dot.setAttribute('cx', s.x);
    dot.setAttribute('cy', 110);
    label.textContent = s.label;
    info.innerHTML = '<b>Step ' + (i+1) + ' of ' + stages.length + ':</b> ' + s.info;
    document.querySelectorAll('#lifeSvg .diag-node').forEach(function(n){ n.classList.remove('active'); });
    var idx = Math.min(i, 6);
    var node = document.querySelector('#lifeSvg .diag-node[data-stage="' + idx + '"]');
    if(node) node.classList.add('active');
    i++; animTimers['life'] = setTimeout(step, 2200);
  }
  step();
}
function resetLife(){
  stopAnim('life');
  
  document.getElementById('lifeDot').style.display = 'none';
  document.getElementById('lifeLabel').textContent = 'Choose a scenario below and press Play';
  document.getElementById('lifeInfo').textContent = 'Each scenario shows what happens at every stage, and where the payment stops if it fails.';
  document.querySelectorAll('#lifeSvg .diag-node').forEach(function(n){ n.classList.remove('active'); });
}
/* --- pacs.008 tree --- */
var treeData = {
  root: '<b>Document (pacs.008):</b> The root element. Contains one FIToFICstmrCdtTrf block, which is the customer credit transfer message.',
  hdr: '<b>Group Header:</b> Information about the message itself. MsgId (unique message reference), CreDtTm (creation time), NbOfTxs (number of transactions), CtrlSum (total amount).',
  pmt: '<b>Payment Information:</b> Data shared by all transactions. Debtor, debtor account, debtor agent (bank), charge bearer (OUR/SHA/BEN), settlement method (INDA/INGA/COVE/CLRG).',
  tx: '<b>Credit Transfer Transaction:</b> Details of each individual payment. EndToEndId (UETR), creditor, creditor account, amount, remittance information, purpose code.',
  msgid: '<b>MsgId:</b> Unique message reference. If a bank receives two messages with the same MsgId, the second is a duplicate and is rejected. This is idempotency.',
  credtm: '<b>CreDtTm:</b> Creation date and time in ISO 8601 format. Used for tracking and for detecting stale messages.',
  nbtx: '<b>NbOfTxs:</b> Number of transactions in this message. The receiver checks this against the actual count. Mismatch means rejection.',
  dbtr: '<b>Dbtr (Debtor):</b> Name and structured address of the sender. Used for sanctions screening.',
  dbtragt: '<b>DbtrAgt (Debtor Agent):</b> The bank holding the debtor account, identified by BIC.',
  cdtr: '<b>Cdtr (Creditor):</b> Name and structured address of the receiver.',
  amt: '<b>Amt (Amount):</b> The instructed amount and currency. The amount the debtor instructed, before charges and FX.'
};
function selectTreeNode(key){
  document.querySelectorAll('#pacsTree .tree-node').forEach(function(n){ n.classList.remove('sel'); });
  var el = document.querySelector('#pacsTree .tree-node[data-node="' + key + '"]');
  if(el) el.classList.add('sel');
  var detail = document.getElementById('treeDetail');
  detail.innerHTML = treeData[key] || '';
  i++; animTimers['serial'] = setTimeout(step, 600); 
}
/* --- Settlement simulator --- */
var simBalances = {A:1000, B:1000, C:1000};
var simQueue = [];
var simMode = 'rtgs';
function simSetMode(m){ simMode = m; simLog('Mode set to ' + m + '.', 'info'); }
function simLog(msg, cls){
  var log = document.getElementById('simLog');
  var div = document.createElement('div');
  div.className = cls || 'info';
  div.textContent = msg;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}
function simRender(){
  ['A','B','C'].forEach(function(b){
    var el = document.getElementById('bal'+b);
    el.textContent = simBalances[b].toLocaleString();
    el.classList.toggle('neg', simBalances[b] < 0);
  });
}
function simAdd(from, to, amt){
  if(simMode === 'rtgs'){
    if(simBalances[from] < amt){
      simLog('RTGS: Bank ' + from + ' has insufficient funds (' + simBalances[from] + ') for ' + amt + '. Payment queued.', 'out');
      simQueue.push({from:from, to:to, amt:amt});
      return;
    }
    simBalances[from] -= amt;
    simBalances[to] += amt;
    simRender();
    simLog('RTGS: Bank ' + from + ' pays Bank ' + to + ' ' + amt + '. Settled immediately in central bank money.', 'in');
    i++; animTimers['serial'] = setTimeout(step, 600); 
  } else {
    simQueue.push({from:from, to:to, amt:amt});
    simLog('Queued: Bank ' + from + ' to Bank ' + to + ', ' + amt + '. ' + simQueue.length + ' payment(s) waiting for settlement.', 'info');
  }
}
function simSettle(){
  if(simMode === 'rtgs'){
    simLog('RTGS: each payment already settled. Nothing to settle.', 'info');
    return;
  }
  if(!simQueue.length){ simLog('No payments queued.', 'info'); return; }
  var net = {A:0, B:0, C:0};
  simQueue.forEach(function(p){ net[p.from] -= p.amt; net[p.to] += p.amt; });
  if(simMode === 'net'){
    simLog('Deferred net: netting ' + simQueue.length + ' payments. Net positions: A ' + net.A + ', B ' + net.B + ', C ' + net.C + '.', 'info');
    var fail = null;
    ['A','B','C'].forEach(function(b){ if(net[b] < 0 && simBalances[b] + net[b] < 0) fail = b; });
    if(fail){
      simLog('Settlement FAILED: Bank ' + fail + ' cannot cover its net debit. Settlement risk realised.', 'out');
      i++; animTimers['serial'] = setTimeout(step, 600); 
      return;
    }
    ['A','B','C'].forEach(function(b){ simBalances[b] += net[b]; });
    simRender();
    simLog('Settled. Balances now: A ' + simBalances.A + ', B ' + simBalances.B + ', C ' + simBalances.C + '.', 'in');
    i++; animTimers['serial'] = setTimeout(step, 600); 
  } else {
    simLog('Prefunded: settling ' + simQueue.length + ' payments from prefunded balances.', 'info');
    var ok = true;
    simQueue.forEach(function(p){
      if(simBalances[p.from] < p.amt){ simLog('Prefunded: Bank ' + p.from + ' has insufficient prefunded balance. Payment fails.', 'out'); ok = false; }
    });
    if(!ok) return;
    simQueue.forEach(function(p){ simBalances[p.from] -= p.amt; simBalances[p.to] += p.amt; });
    simRender();
    simLog('Settled from prefunded balances. Balances now: A ' + simBalances.A + ', B ' + simBalances.B + ', C ' + simBalances.C + '.', 'in');
    i++; animTimers['serial'] = setTimeout(step, 600); 
  }
  simQueue = [];
}
function simReset(){
  simBalances = {A:1000, B:1000, C:1000};
  simQueue = [];
  simRender();
  document.getElementById('simLog').innerHTML = '<div class="info">Reset. Three banks, each with 1,000. Add payments, then run settlement.</div>';
}

/* ================= FAQ SEARCH ================= */
function filterFAQ(){
  var term = document.getElementById('faqSearch').value.toLowerCase().trim();
  var items = document.querySelectorAll('.faq-item');
  var visible = 0;
  items.forEach(function(it){
    var text = it.textContent.toLowerCase();
    var show = !term || text.indexOf(term) !== -1;
    it.classList.toggle('faq-hidden', !show);
    if(show) visible++;
  });
  document.querySelectorAll('.faq-cat').forEach(function(cat){
    var anyVisible = cat.querySelector('.faq-item:not(.faq-hidden)');
    cat.classList.toggle('faq-hidden', !anyVisible);
  });
  document.getElementById('faqNoResult').style.display = visible ? 'none' : 'block';
}
/* ================= TRACE TABS ================= */
function showTrace(which){
  document.getElementById('trace-chai').style.display = which === 'chai' ? 'block' : 'none';
  document.getElementById('trace-xborder').style.display = which === 'xborder' ? 'block' : 'none';
  document.querySelectorAll('.trace-tab').forEach(function(t){ t.classList.remove('active'); });
  event.target.classList.add('active');
}


















































































































































/* ===== Payments Academy interactive features ===== */
function showMode(anchor, btn){
  document.querySelectorAll('.mode-tab').forEach(function(b){b.classList.remove('active')});
  if(btn) btn.classList.add('active');
  var el = document.getElementById(anchor);
  if(el){ document.getElementById('homePage').style.display='block'; el.scrollIntoView({behavior:'smooth'}); }
}
function paSetActive(scopeSel, btnSel, i){
  var scope = scopeSel ? document.querySelector(scopeSel) : document;
  if(!scope) return;
  scope.querySelectorAll(btnSel).forEach(function(b){b.classList.remove('active')});
  var btns = scope.querySelectorAll(btnSel);
  if(btns[i]) btns[i].classList.add('active');
}
function explorerTab(i){
  document.querySelectorAll('[id^="explorer-"]').forEach(function(d){
    if(d.id.match(/^explorer-\d+$/)) d.style.display='none';
  });
  var el = document.getElementById('explorer-' + i);
  if(el){ el.style.display='block'; if(typeof pfRevealDetail==='function') pfRevealDetail(el); }
  paSetActive('#explorer', '.explorer-tab', i);
}
function explorerSearch(){
  var q = (document.getElementById('explorerSearch').value || '').toLowerCase().trim();
  var tabs = document.querySelectorAll('#explorer .explorer-tab');
  var shown = 0, firstShown = -1;
  tabs.forEach(function(b, i){
    var hit = !q || (b.getAttribute('data-name') || '').indexOf(q) >= 0;
    b.style.display = hit ? '' : 'none';
    if(hit){ shown += 1; if(firstShown < 0) firstShown = i; }
  });
  var c = document.getElementById('explorerCount');
  if(c) c.textContent = q ? ('Showing ' + shown + ' of ' + tabs.length + ' messages matching "' + q + '".')
    : ('Showing ' + tabs.length + ' messages. Pick one to see every field, the valid and invalid examples, and the processing and accounting implications.');
  if(q && firstShown >= 0){
    var cur = document.querySelector('#explorer .explorer-tab.active');
    if(!cur || cur.style.display === 'none') explorerTab(firstShown);
  }
}
function explorerVersion(sel, i){
  var el = document.getElementById('explorer-ver-' + i);
  if(el) el.textContent = 'Selected version: ' + sel.value + '. Field rules are for the base message; scheme rules may add or restrict elements.';
}
function playgroundTab(i){
  document.querySelectorAll('[id^="playground-"]').forEach(function(d){
    if(d.id.match(/^playground-\d+$/)) d.style.display='none';
  });
  var el = document.getElementById('playground-' + i);
  if(el){ el.style.display='block'; if(typeof pfRevealDetail==='function') pfRevealDetail(el); }
  paSetActive('#playground', '.explorer-tab', i);
}
var paPlaygroundTimer = null;
function playgroundSend(i, valid){
  var ok = document.getElementById('playground-ok-' + i);
  var err = document.getElementById('playground-err-' + i);
  var st = document.getElementById('playground-status-' + i);
  var bOk = document.getElementById('playground-send-ok-' + i);
  var bErr = document.getElementById('playground-send-err-' + i);
  if(ok) ok.style.display = 'none';
  if(err) err.style.display = 'none';
  if(bOk) bOk.disabled = true;
  if(bErr) bErr.disabled = true;
  if(st){ st.className = 'api-status'; st.textContent = 'Sending request, waiting for the API to respond...'; }
  if(paPlaygroundTimer) clearTimeout(paPlaygroundTimer);
  paPlaygroundTimer = setTimeout(function(){
    if(bOk) bOk.disabled = false;
    if(bErr) bErr.disabled = false;
    if(valid){
      if(ok) ok.style.display = 'block';
      if(st){ st.className = 'api-status ok'; st.textContent = 'Response received in about 0.7 seconds: 202 Accepted. The request was accepted for processing.'; }
    } else {
      if(err) err.style.display = 'block';
      if(st){ st.className = 'api-status err'; st.textContent = 'Response received in about 0.7 seconds: 400 Bad Request. The API rejected the request, see the error below.'; }
    }
    var shown = valid ? ok : err;
    if(shown && shown.scrollIntoView) shown.scrollIntoView({behavior:'smooth',block:'nearest'});
  }, 700);
}
function simulatorTab(i){
  document.querySelectorAll('[id^="simulator-"]').forEach(function(d){
    if(d.id.match(/^simulator-\d+$/)) d.style.display='none';
  });
  var el = document.getElementById('simulator-' + i);
  if(el){ el.style.display='block'; if(typeof pfRevealDetail==='function') pfRevealDetail(el); }
  paSetActive('#simulator', '.explorer-tab', i);
}
function simulatorStep(i){
  var list = document.getElementById('sim-timeline-' + i);
  if(!list) return;
  var hidden = list.querySelectorAll('.sim-step-hidden');
  if(!hidden.length) return;
  hidden[0].classList.remove('sim-step-hidden');
  if(hidden[0].scrollIntoView) hidden[0].scrollIntoView({behavior:'smooth',block:'nearest'});
  simulatorStepCount(i);
  var btn = document.getElementById('sim-next-' + i);
  if(!list.querySelectorAll('.sim-step-hidden').length && btn){
    btn.disabled = true;
    btn.textContent = 'Full timeline shown';
  }
}
function simulatorShowAll(i){
  var list = document.getElementById('sim-timeline-' + i);
  if(!list) return;
  list.querySelectorAll('.sim-step-hidden').forEach(function(li){ li.classList.remove('sim-step-hidden'); });
  simulatorStepCount(i);
  var btn = document.getElementById('sim-next-' + i);
  if(btn){ btn.disabled = true; btn.textContent = 'Full timeline shown'; }
}
function simulatorStepCount(i){
  var list = document.getElementById('sim-timeline-' + i);
  var c = document.getElementById('sim-count-' + i);
  if(!list || !c) return;
  var total = list.querySelectorAll('li').length;
  var shown = total - list.querySelectorAll('.sim-step-hidden').length;
  c.textContent = 'Step ' + shown + ' of ' + total + ' shown';
}
var traceCurrent = 0;
var traceTimer = null;
function traceStage(i){
  traceStopAuto();
  var btns = document.querySelectorAll('.trace-btn');
  if(!btns.length) return;
  if(i < 0) i = 0;
  if(i >= btns.length) i = btns.length - 1;
  traceCurrent = i;
  document.querySelectorAll('.trace-detail').forEach(function(d){d.style.display='none'});
  var el = document.getElementById('trace-' + i);
  if(el){ el.style.display='block'; if(typeof pfRevealDetail==='function') pfRevealDetail(el); }
  btns.forEach(function(b){b.classList.remove('active')});
  if(btns[i]) btns[i].classList.add('active');
  var c = document.getElementById('traceCounter');
  if(c) c.textContent = 'Stage ' + (i + 1) + ' of ' + btns.length;
  var fill = document.getElementById('traceProgressFill');
  if(fill) fill.style.width = Math.round((i + 1) / btns.length * 100) + '%';
  var prev = document.getElementById('tracePrev');
  var next = document.getElementById('traceNext');
  if(prev) prev.disabled = (i === 0);
  if(next) next.disabled = (i === btns.length - 1);
}
function tracePrev(){ traceStage(traceCurrent - 1); }
function traceNext(){ traceStage(traceCurrent + 1); }
function traceStopAuto(){
  if(traceTimer){ clearInterval(traceTimer); traceTimer = null; }
  var play = document.getElementById('tracePlay');
  if(play) play.textContent = 'Play the trace';
}
function tracePlayToggle(){
  var play = document.getElementById('tracePlay');
  if(traceTimer){
    traceStopAuto();
    return;
  }
  var btns = document.querySelectorAll('.trace-btn');
  if(traceCurrent >= btns.length - 1) traceStage(0);
  if(play) play.textContent = 'Pause the trace';
  traceTimer = setInterval(function(){
    if(traceCurrent >= btns.length - 1){
      traceStopAuto();
      return;
    }
    var next = traceCurrent + 1;
    document.querySelectorAll('.trace-detail').forEach(function(d){d.style.display='none'});
    var el = document.getElementById('trace-' + next);
    if(el){ el.style.display='block'; if(typeof pfRevealDetail==='function') pfRevealDetail(el); }
    btns.forEach(function(b){b.classList.remove('active')});
    if(btns[next]) btns[next].classList.add('active');
    traceCurrent = next;
    var c = document.getElementById('traceCounter');
    if(c) c.textContent = 'Stage ' + (next + 1) + ' of ' + btns.length;
    var fill = document.getElementById('traceProgressFill');
    if(fill) fill.style.width = Math.round((next + 1) / btns.length * 100) + '%';
    var prev = document.getElementById('tracePrev');
    var nxt = document.getElementById('traceNext');
    if(prev) prev.disabled = false;
    if(nxt) nxt.disabled = (next === btns.length - 1);
  }, 2600);
}
/* ===== Lab checklists: per-step progress saved in this browser ===== */
var PA_LABS_KEY = 'payments-academy-labs-v1';
function paLabsLoad(){
  try { var p = JSON.parse(localStorage.getItem(PA_LABS_KEY)); if(p) return p; } catch(e){}
  return {};
}
function paLabsSave(p){ try { localStorage.setItem(PA_LABS_KEY, JSON.stringify(p)); } catch(e){} }
function paLabUpdate(labId){
  var p = paLabsLoad();
  var done = p[labId] || {};
  var boxes = document.querySelectorAll('.lab-step-check[data-lab="' + labId + '"]');
  var n = 0;
  boxes.forEach(function(b){
    var on = !!done[b.getAttribute('data-step')];
    b.checked = on;
    var li = b.closest('li');
    if(li) li.classList.toggle('done', on);
    if(on) n += 1;
  });
  var fill = document.getElementById('lab-fill-' + labId);
  if(fill && boxes.length) fill.style.width = Math.round(n / boxes.length * 100) + '%';
  var txt = document.getElementById('lab-text-' + labId);
  if(txt) txt.textContent = n + ' of ' + boxes.length + ' steps done.' +
    (n === boxes.length && boxes.length ? ' Lab complete, well done.' : ' Tick each step as you finish it, your progress is saved in this browser.');
}
function paLabToggle(box){
  var labId = box.getAttribute('data-lab');
  var step = box.getAttribute('data-step');
  var p = paLabsLoad();
  if(!p[labId]) p[labId] = {};
  if(box.checked) p[labId][step] = true;
  else delete p[labId][step];
  paLabsSave(p);
  paLabUpdate(labId);
}
function paLabReset(labId){
  var p = paLabsLoad();
  delete p[labId];
  paLabsSave(p);
  paLabUpdate(labId);
}
function paLabsRestore(){
  var ids = {};
  document.querySelectorAll('.lab-step-check').forEach(function(b){ ids[b.getAttribute('data-lab')] = true; });
  Object.keys(ids).forEach(function(id){ paLabUpdate(id); });
  paIsoRestore();
}
/* ===== ISO lab: reveal toggles, copy, mark done ===== */
var PA_ISO_KEY = 'payments-academy-isolab-v1';
function paIsoToggle(id, btn){
  var el = document.getElementById(id);
  if(!el) return;
  /* Reveal in the shared detail drawer (beside the item on desktop,
     bottom sheet on mobile) instead of expanding below the button. The
     hidden div stays in the DOM so Copy still reads from it. */
  var title = 'Details';
  var b = el.querySelector('b');
  if(b) title = b.textContent;
  if(typeof pfOpenDetail === 'function') pfOpenDetail(title, el.innerHTML);
  else el.style.display = 'block';
}
function paIsoCopy(id, btn){
  var el = document.getElementById(id);
  if(!el) return;
  var pre = el.querySelector('pre');
  var text = pre ? pre.textContent : el.textContent;
  function done(ok){
    if(btn) btn.textContent = ok ? 'Copied' : 'Copy failed';
    setTimeout(function(){ if(btn) btn.textContent = 'Copy valid XML'; }, 2000);
  }
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(function(){ done(true); }, function(){ done(false); });
  } else {
    var ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch(e){}
    document.body.removeChild(ta);
    done(ok);
  }
}
function paIsoLoad(){
  try { var p = JSON.parse(localStorage.getItem(PA_ISO_KEY)); if(p) return p; } catch(e){}
  return {};
}
function paIsoDone(box){
  var ex = box.getAttribute('data-ex');
  var p = paIsoLoad();
  if(box.checked) p[ex] = true;
  else delete p[ex];
  try { localStorage.setItem(PA_ISO_KEY, JSON.stringify(p)); } catch(e){}
  paIsoRestore();
}
function paIsoRestore(){
  var p = paIsoLoad();
  var boxes = document.querySelectorAll('.iso-done-check');
  var n = 0;
  boxes.forEach(function(b){
    var on = !!p[b.getAttribute('data-ex')];
    b.checked = on;
    if(on) n += 1;
  });
  var txt = document.getElementById('isoProgressText');
  if(txt && boxes.length) txt.textContent = n + ' of ' + boxes.length + ' exercises marked done.';
}
var quizAnswered = {};
var quizScoreCorrect = 0;
function quizAnswer(btn, isCorrect, qid){
  if(quizAnswered[qid]) return;
  quizAnswered[qid] = true;
  var box = document.getElementById(qid);
  if(box){
    box.querySelectorAll('.quiz-opt').forEach(function(b){b.disabled = true;});
    var expl = box.querySelector('.quiz-expl');
    if(expl) expl.style.display='block';
  }
  btn.classList.add(isCorrect ? 'correct' : 'wrong');
  if(isCorrect) quizScoreCorrect += 1;
  paQuizRecord(qid, isCorrect);
  var total = Object.keys(quizAnswered).length;
  var s = document.getElementById('quizScore'); if(s) s.textContent = total;
  var c = document.getElementById('quizCorrect'); if(c) c.textContent = quizScoreCorrect + ' correct';
}
/* ===== Progress tracking: real state in localStorage, nothing pre-filled ===== */
var PA_KEY = 'payments-academy-progress-v1';
function paLoad(){
  try { var p = JSON.parse(localStorage.getItem(PA_KEY)); if(p && p.lessons && p.quiz && p.capstone) return p; } catch(e){}
  return {lessons:{}, quiz:{}, capstone:{}};
}
function paSave(p){ try { localStorage.setItem(PA_KEY, JSON.stringify(p)); } catch(e){} }
function paQuizRecord(qid, isCorrect){
  var p = paLoad(); p.quiz[qid] = !!isCorrect; paSave(p); updateDashboard();
}
function paCapstone(pid){
  var p = paLoad(); p.capstone[pid] = true; paSave(p); updateDashboard();
}
function paReset(){
  try { localStorage.removeItem(PA_KEY); } catch(e){}
  /* Lesson buttons are id="done-<lesson>", class "studio-btn primary",
     text "Mark lesson complete" (lessonDone sets them to "Completed"
     with class "done"). Reset those, not the old .player-btn selector,
     which matches nothing on any page. */
  document.querySelectorAll('[id^="done-"]').forEach(function(b){ b.textContent = 'Mark lesson complete'; b.classList.remove('done'); });
  updateDashboard();
}
function lessonDone(sid){
  var p = paLoad(); p.lessons[sid] = true; paSave(p);
  var b = document.getElementById('done-' + sid);
  if(b){ b.textContent = 'Completed'; b.classList.add('done'); }
  setPlayLabel(sid, false);
  updateDashboard();
}
function fmtTime(t){
  if(!isFinite(t) || t < 0) t = 0;
  var m = Math.floor(t / 60), s = Math.floor(t % 60);
  return m + ':' + (s < 10 ? '0' : '') + s;
}
function setPlayLabel(sid, playing){
  var b = document.getElementById('play-' + sid);
  if(b) b.textContent = playing ? 'Pause' : 'Play';
}
function togglePlay(sid){
  var a = document.getElementById('audio-' + sid);
  if(!a) return;
  if(a.paused){
    pauseAllAudio();
    a.muted = soundMuted;
    a.play().then(function(){ setPlayLabel(sid, true); }).catch(function(e){
      setPlayLabel(sid, false);
      console.warn('Playback could not start, tap Play again:', e);
    });
  } else {
    a.pause();
    setPlayLabel(sid, false);
  }
}
function replaySection(sid){
  var a = document.getElementById('audio-' + sid);
  if(!a) return;
  pauseAllAudio();
  a.currentTime = 0;
  a.muted = soundMuted;
  a.play().then(function(){ setPlayLabel(sid, true); }).catch(function(e){
    setPlayLabel(sid, false);
    console.warn('Playback could not start, tap Play again:', e);
  });
}
function setSpeed(sid, v){
  var a = document.getElementById('audio-' + sid);
  if(a) a.playbackRate = parseFloat(v) || 1;
}
function seekAudio(sid, el){
  var a = document.getElementById('audio-' + sid);
  if(a && isFinite(a.duration) && a.duration > 0) a.currentTime = (parseFloat(el.value) || 0) / 100 * a.duration;
}
function updProg(sid, a){
  var bar = document.getElementById('prog-' + sid);
  var tm = document.getElementById('time-' + sid);
  if(bar && isFinite(a.duration) && a.duration > 0) bar.value = Math.round(a.currentTime / a.duration * 100);
  if(tm) tm.textContent = fmtTime(a.currentTime) + ' / ' + fmtTime(a.duration);
  setPlayLabel(sid, !a.paused);
}
function updateDashboard(){
  var p = paLoad();
  var totalLessons = document.querySelectorAll('.ch-sec').length;
  var doneLessons = Object.keys(p.lessons).length;
  var l = document.getElementById('dashLessons');
  if(l) l.textContent = doneLessons + ' / ' + totalLessons;
  var lb = document.getElementById('dashLessonsBar');
  if(lb && totalLessons > 0) lb.style.width = Math.round(doneLessons / totalLessons * 100) + '%';
  var qids = Object.keys(p.quiz);
  var correct = qids.filter(function(k){ return p.quiz[k]; }).length;
  var totalQuiz = document.querySelectorAll('.quiz-q').length;
  var q = document.getElementById('dashQuiz');
  if(q) q.textContent = qids.length + ' / ' + totalQuiz + ' answered';
  var qb = document.getElementById('dashQuizBar');
  if(qb && totalQuiz > 0) qb.style.width = Math.round(qids.length / totalQuiz * 100) + '%';
  var c = document.getElementById('dashCorrect');
  if(c) c.textContent = correct + ' correct';
  var weak = qids.filter(function(k){ return !p.quiz[k]; }).map(function(k){
    var box = document.getElementById('quiz-' + k);
    if(!box) return null;
    var ch = box.querySelector('.quiz-ch');
    return ch ? ch.textContent : k;
  }).filter(function(x){ return !!x; });
  var w = document.getElementById('dashWeak');
  if(w) w.textContent = weak.length ? weak.slice(0, 3).join(', ') + (weak.length > 3 ? ' (+' + (weak.length - 3) + ' more)' : '') : 'None yet';
  var cap = document.getElementById('dashCap');
  var totalCap = document.querySelectorAll('.project-card').length;
  if(cap) cap.textContent = Object.keys(p.capstone).length + ' / ' + totalCap;
  Object.keys(p.lessons).forEach(function(sid){
    var b = document.getElementById('done-' + sid);
    if(b){ b.textContent = 'Completed'; b.classList.add('done'); }
  });
}
function filterGlossary(){
  var q = (document.getElementById('glossSearch').value || '').toLowerCase();
  document.querySelectorAll('.gloss-item').forEach(function(el){
    el.style.display = el.textContent.toLowerCase().indexOf(q) >= 0 ? 'block' : 'none';
  });
}
function filterMessages(){
  var q = (document.getElementById('msgSearch').value || '').toLowerCase();
  document.querySelectorAll('.msg-row').forEach(function(el){
    el.style.display = el.textContent.toLowerCase().indexOf(q) >= 0 ? '' : 'none';
  });
}
document.addEventListener('DOMContentLoaded', function(){
  updateDashboard();
  paLabsRestore();
  if(document.querySelector('.trace-btn')) traceStage(0);
  document.addEventListener('keydown', function(ev){
    if(!document.querySelector('.trace-btn')) return;
    var tag = (ev.target && ev.target.tagName) || '';
    if(tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    if(ev.key === 'ArrowRight'){ traceNext(); }
    else if(ev.key === 'ArrowLeft'){ tracePrev(); }
  });
});

