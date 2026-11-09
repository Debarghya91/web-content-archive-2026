
/* ===== Courses, bundles and access (browser demo only) ===== */
/* ACCESS ENFORCEMENT IS OFF by owner decision (5 Nov 2026). Everything is
   open for all: no sign-in, no locks, no payment needed. The lock code
   below stays parked behind PA_ENFORCE_ACCESS. Flip that one flag to true
   later to lock chapters behind their bundles. Real payment enforcement
   needs the Razorpay account plus a backend or licence check. */
var PA_ENFORCE_ACCESS = false;
var PA_OWNED_KEY = 'pa-owned-bundles-v1';
var PA_PREVIEW_KEY = 'pa-owner-preview-v1';
var PA_BUNDLE_MAP = window.PA_BUNDLE_MAP || {};
var PA_SELECTED_BUNDLE = null;
function paOwned(){
  try { var v = JSON.parse(localStorage.getItem(PA_OWNED_KEY)); if(Array.isArray(v)) return v; } catch(e){}
  return [];
}
function paSaveOwned(list){
  try { localStorage.setItem(PA_OWNED_KEY, JSON.stringify(list)); } catch(e){}
}
function paOwnerPreview(){
  try { return localStorage.getItem(PA_PREVIEW_KEY) === '1'; } catch(e){ return false; }
}
function paHasAccess(chid){
  if(!PA_ENFORCE_ACCESS) return true;
  if(paOwnerPreview()) return true;
  var owned = paOwned();
  if(owned.indexOf('full') !== -1) return true;
  var b = PA_BUNDLE_MAP[chid];
  return b && owned.indexOf(b) !== -1;
}
/* ===== 500 Payment Situations gate (9 Nov 2026) ===== */
/* This product is the ONLY gated product. It is gated independently of
   PA_ENFORCE_ACCESS, which stays false so the flagship course and all
   lessons stay open for all. A buyer owns this product when the
   'situations-500' bundle (or the flagship 'full', which includes
   everything) is in the owned list, or when owner preview is on.
   Access is granted after the owner verifies the buyer's UPI payment
   by its UTR: the buyer unlocks with the claim id from their UPI
   claim submission. The claim id is checked against the pending UPI
   claims stored in this browser for this bundle. Honest limit: this
   is a browser-side gate. It stops casual access and casual download;
   it does not stop a determined user who inspects network requests or
   takes screenshots. Real server-side enforcement needs the Supabase
   backend, which is a later step. */
var PA_SITUATIONS_BUNDLE = 'situations-500';
var PA_SITUATIONS_GATED = false; /* TEMPORARY owner unlock 9 Nov 2026: user testing the situations product; re-lock to true when he says so. */
function paHasSituationsAccess(){
  if(!PA_SITUATIONS_GATED) return true;
  if(paOwnerPreview()) return true;
  var owned = paOwned();
  return owned.indexOf('full') !== -1 || owned.indexOf(PA_SITUATIONS_BUNDLE) !== -1;
}
function paGrantSituationsAccess(claimId){
  if(!claimId) return false;
  var claims = paUpiClaims();
  var match = null;
  for(var i = 0; i < claims.length; i++){
    if(claims[i].id === claimId && claims[i].bundle === PA_SITUATIONS_BUNDLE){ match = claims[i]; break; }
  }
  if(!match) return false;
  var owned = paOwned();
  if(owned.indexOf(PA_SITUATIONS_BUNDLE) === -1){
    owned.push(PA_SITUATIONS_BUNDLE);
    paSaveOwned(owned);
  }
  return true;
}
function paApplyLocks(){
  paUpdatePayArea();
  var owned = paOwned();
  document.querySelectorAll('.chapter-card').forEach(function(card){
    var chid = card.getAttribute('data-chapter');
    var locked = chid && !paHasAccess(chid);
    card.classList.toggle('locked', !!locked);
    var badge = card.querySelector('.lock-badge');
    if(locked && !badge){
      var s = document.createElement('span');
      s.className = 'lock-badge'; s.textContent = 'Locked';
      card.appendChild(s);
    }
    if(!locked && badge) badge.remove();
  });
  document.querySelectorAll('.bundle-owned').forEach(function(el){
    var bid = el.id.replace('owned-', '');
    el.style.display = owned.indexOf(bid) !== -1 ? 'inline-block' : 'none';
  });
  var pb = document.getElementById('ownerPreviewBtn');
  if(pb){
    pb.textContent = !PA_ENFORCE_ACCESS
      ? 'Access enforcement: Off (everything open for now)'
      : (paOwnerPreview() ? 'Owner preview: On (everything unlocked for review)' : 'Owner preview: Off (chapters locked until bought)');
  }
}
function toggleOwnerPreview(){
  try { localStorage.setItem(PA_PREVIEW_KEY, paOwnerPreview() ? '0' : '1'); } catch(e){}
  paApplyLocks();
}
function showCourses(){
  if(typeof pauseAllAudio === 'function') pauseAllAudio();
  document.querySelectorAll('.bundle-detail').forEach(function(d){ d.style.display = 'none'; });
  var el = document.getElementById('courses');
  if(el){
    if(document.getElementById('homePage')) document.getElementById('homePage').style.display = 'block';
    el.scrollIntoView({behavior: 'smooth'});
  }
  paApplyLocks();
}
function showBundle(bid){
  if(typeof pauseAllAudio === 'function') pauseAllAudio();
  document.querySelectorAll('.bundle-detail').forEach(function(d){ d.style.display = 'none'; });
  var el = document.getElementById('bundle-' + bid);
  if(el){
    el.style.display = 'block';
    el.scrollIntoView({behavior: 'smooth'});
  }
  PA_SELECTED_BUNDLE = bid;
}
function showBundleForChapter(chid){
  var b = PA_BUNDLE_MAP[chid] || 'full';
  showBundle(b);
}
function paRenderOrderSummary(bid){
  var data = null;
  try { data = JSON.parse(document.getElementById('bundle-data').textContent); } catch(e){}
  var sum = document.getElementById('order-summary');
  if(sum && data && data[bid]){
    var b = data[bid];
    var size = (b.items && b.items > 0) ? (b.items + ' situations') : (b.chapters + ' chapters, ' + b.lessons + ' lessons');
    var priceNote = b.price_placeholder ? ' (placeholder price, until the owner sets final prices)' : '';
    sum.innerHTML = '<h3>Order summary</h3><p><b>' + b.name + '</b><br>' +
      size + '<br>' +
      'Price: \u20B9' + b.price.toLocaleString('en-IN') + priceNote + '<br>' +
      'Pay by UPI below, then submit your payment reference.</p>';
  }
  paUpdatePayArea();
}
function enrolBundle(bid){
  PA_SELECTED_BUNDLE = bid;
  paRenderOrderSummary(bid);
  var el = document.getElementById('payment');
  if(el) el.scrollIntoView({behavior: 'smooth'});
}
/* ===== Razorpay checkout (PREPARED, NOT LIVE) ===== */
/* Live buying needs the owner to fill in content/bundles.json payment
   config first: razorpay_key_id, create_order_function_url, and one
   razorpay_payment_link per bundle. Until then every value below is
   empty, the Pay button stays disabled, and no money can move.
   Flow: sign in -> create-order Edge Function mints a Razorpay order
   with notes {supabase_user_id, bundle_id} (price checked server-side
   against bundles.json, never trusted from the client) -> Razorpay
   Checkout opens -> on capture the webhook grants bundle_access.
   UPI is a required method: Checkout shows UPI first (intent opens the
   UPI app on mobile, QR on desktop). UPI Collect (typing a UPI ID) was
   deprecated by NPCI on 28 Feb 2026, so only intent and QR are offered.
   No separate UPI gateway is needed; the merchant account must have
   UPI enabled (on by default for Indian merchants). */
var PA_RAZORPAY_CONFIG = (function(){
  try {
    var el = document.getElementById('payment-config');
    if(el) return JSON.parse(el.textContent);
  } catch(e){}
  return {provider: 'razorpay', keyId: '', createOrderUrl: '',
          upiRequired: true, methods: ['upi', 'card', 'netbanking', 'wallet'], links: {}};
})();
function paRazorpayReady(){
  var c = PA_RAZORPAY_CONFIG;
  return !!(c && (c.keyId || (c.links && Object.keys(c.links).some(function(k){ return !!c.links[k]; }))));
}
/* ===== Direct UPI (LIVE, owner decision 8 Nov 2026) ===== */
/* Payments go straight to the owner's UPI ID (deb.arghya@ptyes).
   No payment gateway, no merchant account. The buyer pays by QR or
   UPI intent, then submits the UTR on this page. The claim is stored
   in this browser (localStorage) with status "pending"; the owner
   verifies the payment by its UTR and grants access manually.
   The Razorpay checkout below stays dormant and is never called. */
var PA_UPI_CLAIMS_KEY = 'pa-upi-claims-v1';
function paUpiConfig(){
  try {
    var el = document.getElementById('upi-config');
    if(el) return JSON.parse(el.textContent);
  } catch(e){}
  return {provider: 'direct', payee_id: '', payee_name: '', uris: {}};
}
function paUpiClaims(){
  try { var v = JSON.parse(localStorage.getItem(PA_UPI_CLAIMS_KEY)); if(Array.isArray(v)) return v; } catch(e){}
  return [];
}
function paSaveUpiClaims(list){
  try { localStorage.setItem(PA_UPI_CLAIMS_KEY, JSON.stringify(list)); return true; } catch(e){ return false; }
}
function paUpdatePayArea(){
  var area = document.getElementById('pay-area');
  if(!area) return;
  var bid = PA_SELECTED_BUNDLE;
  if(!bid){ area.style.display = 'none'; return; }
  area.style.display = 'block';
  document.querySelectorAll('.upi-panel').forEach(function(p){
    p.style.display = (p.getAttribute('data-bundle') === bid) ? 'block' : 'none';
  });
  paRenderUpiClaims();
}
function paRenderUpiClaims(){
  var box = document.getElementById('upi-claims');
  if(!box) return;
  var claims = paUpiClaims();
  if(!claims.length){ box.innerHTML = ''; return; }
  var html = '<h4>Your submitted payments</h4><ul class="upi-claim-list">';
  claims.forEach(function(c){
    html += '<li><b>' + c.bundle_name + '</b> (\u20B9' + Number(c.amount).toLocaleString('en-IN') + ')<br>' +
      'UTR: ' + c.utr + '<br>' +
      'Submitted: ' + c.created_at + '<br>' +
      'Status: <b>' + c.status + '</b> (the owner verifies the payment, then grants access)</li>';
  });
  html += '</ul><p class="bundle-meta">These records live in this browser only. '
    + 'If you clear this browser, keep your UTR: it is the proof of your payment.</p>';
  box.innerHTML = html;
}
function paUpiShotPreview(input){
  var prev = document.getElementById('upi-shot-preview');
  if(!prev) return;
  var f = input && input.files && input.files[0];
  if(!f){ prev.style.display = 'none'; prev.removeAttribute('src'); return; }
  if(f.size > 2 * 1024 * 1024){
    var st = document.getElementById('upi-claim-status');
    if(st) st.textContent = 'Screenshot is over 2 MB. Please use a smaller image.';
    input.value = '';
    prev.style.display = 'none';
    return;
  }
  var r = new FileReader();
  r.onload = function(){ prev.src = r.result; prev.style.display = 'block'; };
  r.readAsDataURL(f);
}
function paSubmitUpiClaim(ev){
  if(ev) ev.preventDefault();
  var st = document.getElementById('upi-claim-status');
  function fail(msg){ if(st) st.textContent = msg; return false; }
  var bid = PA_SELECTED_BUNDLE;
  if(!bid) return fail('Pick a course first.');
  var name = (document.getElementById('upi-name').value || '').trim();
  var email = (document.getElementById('upi-email').value || '').trim();
  var utr = (document.getElementById('upi-utr').value || '').trim();
  if(!name) return fail('Please enter your name.');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Please enter a valid email address.');
  if(utr.replace(/[^A-Za-z0-9]/g, '').length < 6) return fail('Please enter the UTR / transaction reference from your UPI app (at least 6 characters).');
  var data = null;
  try { data = JSON.parse(document.getElementById('bundle-data').textContent); } catch(e){}
  var b = (data && data[bid]) ? data[bid] : {name: bid, price: 0};
  var shotInput = document.getElementById('upi-shot');
  var file = shotInput && shotInput.files && shotInput.files[0];
  function storeClaim(shotDataUrl){
    var claim = {
      id: 'UPIC-' + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36),
      bundle: bid,
      bundle_name: b.name,
      amount: b.price,
      name: name,
      email: email,
      utr: utr,
      screenshot: shotDataUrl || null,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    var claims = paUpiClaims();
    claims.push(claim);
    if(!paSaveUpiClaims(claims)){
      return fail('Could not save the claim in this browser (storage full or blocked). Please keep your UTR and try again, or contact the owner.');
    }
    var conf = document.getElementById('pay-confirm');
    if(conf){
      conf.style.display = 'block';
      conf.innerHTML = '<b>Payment received, access will be granted after verification.</b><br>' +
        'Course: ' + b.name + '<br>' +
        'Amount: \u20B9' + Number(b.price).toLocaleString('en-IN') + '<br>' +
        'UTR: ' + utr + '<br>' +
        'Claim id: ' + claim.id + '<br>' +
        'The owner verifies your payment against this UTR, then grants access to the course. '
        + 'Keep your claim id and UTR safe.';
    }
    if(st) st.textContent = '';
    var form = document.getElementById('upi-claim-form');
    if(form) form.reset();
    var prev = document.getElementById('upi-shot-preview');
    if(prev){ prev.style.display = 'none'; prev.removeAttribute('src'); }
    paRenderUpiClaims();
    return false;
  }
  if(file){
    if(file.size > 2 * 1024 * 1024) return fail('Screenshot is over 2 MB. Please use a smaller image.');
    var reader = new FileReader();
    reader.onload = function(){ storeClaim(reader.result); };
    reader.onerror = function(){ storeClaim(null); };
    reader.readAsDataURL(file);
  } else {
    storeClaim(null);
  }
  return false;
}
function paLoadRazorpayScript(callback){
  if(window.Razorpay){ callback(); return; }
  var s = document.createElement('script');
  s.src = 'https://checkout.razorpay.com/v1/checkout.js';
  s.onload = callback;
  s.onerror = function(){
    var st = document.getElementById('pay-status');
    if(st) st.textContent = 'Could not load the payment window. Check your connection and try again.';
  };
  document.head.appendChild(s);
}
function paStartRazorpayCheckout(bid){
  var st = document.getElementById('pay-status');
  function fail(msg){ if(st) st.textContent = msg; }
  if(!bid){ fail('Pick a course first.'); return; }
  var cfg = PA_RAZORPAY_CONFIG;
  if(!cfg || (!cfg.keyId && !(cfg.links && cfg.links[bid]))){
    fail('Payments are not configured yet. The owner is setting up the Razorpay merchant account.');
    return;
  }
  if(typeof paAuthCurrentUserId !== 'function'){
    fail('Sign-in is not available yet. Auth is still dormant.');
    return;
  }
  paAuthCurrentUserId().then(function(uid){
    if(!uid){
      fail('Sign in first (email code or Google, top of the page) so the payment is linked to your account.');
      return;
    }
    if(cfg.links && cfg.links[bid]){
      window.location.href = cfg.links[bid];
      return;
    }
    if(!cfg.createOrderUrl){
      fail('Payments are not configured yet: no order service. The owner is setting it up.');
      return;
    }
    paAuthAccessToken().then(function(token){
      fetch(cfg.createOrderUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (token || '')},
        body: JSON.stringify({bundle_id: bid})
      }).then(function(r){ return r.json(); }).then(function(data){
        if(!data || !data.order_id || !data.key_id){
          fail('Could not start the payment. Please try again.');
          return;
        }
        paAuthCurrentUserEmail().then(function(email){
          paLoadRazorpayScript(function(){
            var data2 = null;
            try { data2 = JSON.parse(document.getElementById('bundle-data').textContent); } catch(e){}
            var bname = (data2 && data2[bid]) ? data2[bid].name : bid;
            var options = {
              key: data.key_id,
              order_id: data.order_id,
              amount: data.amount,
              currency: data.currency || 'INR',
              name: 'Payments Training Hub',
              description: bname,
              prefill: { email: email || '' },
              config: { display: {
                blocks: {
                  upi: { name: 'Pay using UPI', instruments: [
                    { method: 'upi', flows: ['intent', 'qr'], apps: ['google_pay', 'phonepe', 'paytm', 'bhim'] }
                  ] },
                  card: { name: 'Pay using Card', instruments: [ { method: 'card' } ] },
                  netbanking: { name: 'Pay using NetBanking', instruments: [ { method: 'netbanking' } ] },
                  wallet: { name: 'Pay using Wallet', instruments: [ { method: 'wallet' } ] }
                },
                sequence: ['block.upi', 'block.card', 'block.netbanking', 'block.wallet'],
                preferences: { show_default_blocks: false }
              } },
              handler: function(resp){
                var conf = document.getElementById('pay-confirm');
                if(conf){
                  conf.style.display = 'block';
                  conf.innerHTML = '<b>Payment received.</b> Your access unlocks automatically once the payment is confirmed. ' +
                    'Refresh the page in a few seconds, then start learning. Payment id: ' + (resp.razorpay_payment_id || '');
                }
                if(st) st.textContent = '';
              },
              modal: { ondismiss: function(){ if(st) st.textContent = 'Payment window closed. Nothing was charged.'; } }
            };
            new Razorpay(options).open();
          });
        });
      }).catch(function(){ fail('Could not start the payment. Please try again.'); });
    });
  });
}
/* Guard chapter opening: locked chapters open their bundle instead. */
if(typeof openChapter === 'function'){
  var __paOpenChapterOrig = openChapter;
  openChapter = function(id){
    if(!paHasAccess(id)){ showBundleForChapter(id); return; }
    __paOpenChapterOrig(id);
  };
}
document.addEventListener('DOMContentLoaded', function(){
  paApplyLocks();
  if(!PA_ENFORCE_ACCESS) return;
  var mute = document.getElementById('muteToggle');
  if(mute && !document.getElementById('ownerPreviewHeaderBtn')){
    var b = document.createElement('button');
    b.className = 'mute-btn'; b.id = 'ownerPreviewHeaderBtn';
    b.textContent = 'Owner preview: Off';
    b.onclick = function(){
      toggleOwnerPreview();
      b.textContent = paOwnerPreview() ? 'Owner preview: On' : 'Owner preview: Off';
    };
    b.textContent = paOwnerPreview() ? 'Owner preview: On' : 'Owner preview: Off';
    mute.parentNode.insertBefore(b, mute.nextSibling);
  }
});
paApplyLocks();
