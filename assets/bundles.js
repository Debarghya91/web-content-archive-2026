
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
/* ===== Payment Situations gate (9 Nov 2026) ===== */
/* This product is the ONLY gated product. It is gated independently of
   PA_ENFORCE_ACCESS, which stays false so the flagship course and all
   lessons stay open for all. A buyer owns this product when the
   'situations-500' bundle (or the flagship 'full', which includes
   everything) is in the owned list, or when owner preview is on.
   Purchases are made in the iOS app (owner decision 11 Nov 2026); the
   manual UPI payment flow and its claim-id unlock were removed with it.
   Honest limit: this is a browser-side gate. It stops casual access and
   casual download; it does not stop a determined user who inspects
   network requests or takes screenshots. Real server-side enforcement
   needs the Supabase backend, which is a later step. */
var PA_SITUATIONS_BUNDLE = 'situations-500';
var PA_SITUATIONS_GATED = false; /* TEMPORARY owner unlock 9 Nov 2026: user testing the situations product; re-lock to true when he says so. */
function paHasSituationsAccess(){
  if(!PA_SITUATIONS_GATED) return true;
  if(paOwnerPreview()) return true;
  var owned = paOwned();
  return owned.indexOf('full') !== -1 || owned.indexOf(PA_SITUATIONS_BUNDLE) !== -1;
}
function paApplyLocks(){
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
/* ===== Chapter-coverage matrix filters (P2#7) ===== */
/* Narrows the matrix by domain (hides other columns) and by bundle
   (hides other rows). Both filters combine. */
function paFilterCoverage(){
  var dt = document.getElementById('cov-domain-filter');
  var bt = document.getElementById('cov-bundle-filter');
  var d = dt ? dt.value : '';
  var b = bt ? bt.value : '';
  var tbl = document.getElementById('cov-matrix');
  if(!tbl) return;
  var rows = tbl.getElementsByTagName('tr');
  for(var i = 0; i < rows.length; i++){
    var r = rows[i];
    var rb = r.getAttribute('data-bundle');
    if(rb){ r.style.display = (!b || rb === b) ? '' : 'none'; }
    var cells = r.children;
    for(var j = 0; j < cells.length; j++){
      var cd = cells[j].getAttribute('data-domain');
      if(cd){ cells[j].style.display = (!d || cd === d) ? '' : 'none'; }
    }
  }
}
function paResetCoverage(){
  var dt = document.getElementById('cov-domain-filter');
  var bt = document.getElementById('cov-bundle-filter');
  if(dt) dt.value = '';
  if(bt) bt.value = '';
  paFilterCoverage();
}
/* Website checkout lives on payment.html. enrolBundle takes the
   learner there with the bundle id. The multipage build overrides
   this with navigation to payment.html?bundle=<id>. */
function enrolBundle(bid){
  PA_SELECTED_BUNDLE = bid;
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
            var bname = bid;
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
/* ===== Website checkout: PayU and PayPal (test setup, 13 Nov 2026) ===== */
/* Website checkout is being set up with PayU (Indian buyers, INR) and
   PayPal (international buyers, USD). No live buying until the payment
   keys arrive: with empty or missing config every button stays disabled
   and the page says so in plain words. Payment requires sign-in: the
   server needs the Supabase JWT. Prices are never trusted from the
   client: the server reads them from bundles.json. There is no manual
   UPI flow here: UPI is offered only inside PayU hosted checkout (UPI
   apps, cards, netbanking). No purchase is ever marked in
   localStorage and no access is granted from this page: access is
   granted only after the server verifies the payment. */
var PA_CHECKOUT_CONFIG = (function(){
  try {
    var el = document.getElementById('payment-config');
    if(el) return JSON.parse(el.textContent);
  } catch(e){}
  return {payu_create_payment_url: '', paypal_client_id: '',
          paypal_create_order_url: '', paypal_capture_order_url: ''};
})();
function paCheckoutBundleData(){
  try {
    var el = document.getElementById('pa-bundle-data');
    if(el) return JSON.parse(el.textContent);
  } catch(e){}
  return [];
}
function paCheckoutBundle(bid){
  var data = paCheckoutBundleData();
  for(var i = 0; i < data.length; i++){ if(data[i].id === bid) return data[i]; }
  return null;
}
function paCheckoutBundleId(){
  var m = /[?&]bundle=([^&#]*)/.exec(window.location.search || '');
  var bid = '';
  try { bid = m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : ''; } catch(e){ bid = m ? m[1] : ''; }
  return paCheckoutBundle(bid) ? bid : '';
}
function paPayuReady(){
  var c = PA_CHECKOUT_CONFIG;
  return !!(c && c.payu_create_payment_url);
}
function paPaypalReady(){
  var c = PA_CHECKOUT_CONFIG;
  /* PayPal hidden (15 Nov 2026, fix 10): the flag defaults to off when
     the config block is absent, so the buttons can never render
     without an explicit re-enable. */
  return !!(c && c.paypal_enabled && c.paypal_client_id && c.paypal_create_order_url && c.paypal_capture_order_url);
}
function paCheckoutFail(msg){
  var st = document.getElementById('pay-status');
  var er = document.getElementById('pa-checkout-error');
  if(st) st.textContent = '';
  if(er){ er.style.display = 'block'; er.textContent = msg; }
}
function paCheckoutStatus(msg){
  var st = document.getElementById('pay-status');
  var er = document.getElementById('pa-checkout-error');
  if(er){ er.style.display = 'none'; er.textContent = ''; }
  if(st) st.textContent = msg;
}
/* ===== Referral codes and credit (13 Nov 2026) ===== */
/* The referral code and the use-credit choice are sent to the
   server with the checkout request; the server validates the
   code, applies Rs 200 (PayU) or $2.50 (PayPal) off, and spends
   credit. Nothing is computed in the browser: the discount shown
   always comes from the server response. Error codes come from
   the server catalog (REFERRAL_INVALID, REFERRAL_SELF,
   REFERRAL_ALREADY_USED); each maps to one
   plain message below. A referral_status of "unavailable" means
   the referral tables are not set up yet: checkout continues at
   full price and the page says so, instead of blocking. */
function paReferralCode(){
  try {
    var el = document.getElementById('pa-referral-code');
    return el ? String(el.value || '').trim().toUpperCase() : '';
  } catch(e){ return ''; }
}
function paUseCredit(){
  try {
    var el = document.getElementById('pa-use-credit');
    return !!(el && el.checked);
  } catch(e){ return false; }
}
function paReferralErrorMessage(code){
  if(code === 'REFERRAL_INVALID') return 'That referral code is not valid. Check the code and try again, or continue without a code.';
  if(code === 'REFERRAL_SELF') return 'You cannot use your own referral code.';
  if(code === 'REFERRAL_ALREADY_USED') return 'Your account has already used a referral discount. Only one referral discount is allowed per account.';
  if(code === 'REFERRAL_CHECK_FAILED') return 'The referral code could not be checked. Please try again.';
  if(code === 'amount_zero') return 'The discount covers the full price of this course. Please choose another course or contact support.';
  return '';
}
function paReferralStatus(msg){
  var el = document.getElementById('pa-referral-status');
  if(el) el.textContent = msg || '';
}
function paLoadCheckoutCredit(uid){
  /* Show the signed-in buyer's referral credit balance, read
     directly from referral_credits (own rows only, under RLS).
     Any failure hides the line: the tables may not exist yet,
     and a missing balance must never block checkout. */
  var line = document.getElementById('pa-credit-balance');
  if(!line || !uid) return;
  if(typeof paAuthAccessToken !== 'function') return;
  if(typeof PA_AUTH_CONFIG === 'undefined' || !PA_AUTH_CONFIG.supabaseUrl || !PA_AUTH_CONFIG.supabaseAnonKey) return;
  paAuthAccessToken().then(function(token){
    if(!token) return;
    var url = String(PA_AUTH_CONFIG.supabaseUrl).replace(/\/+$/, '') +
      '/rest/v1/referral_credits?select=amount_minor,currency,status,hold_expires_at&user_id=eq.' + encodeURIComponent(uid);
    fetch(url, {headers: {'apikey': PA_AUTH_CONFIG.supabaseAnonKey, 'Authorization': 'Bearer ' + token, 'Accept': 'application/json'}})
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(rows){
        if(!rows || !rows.length) return;
        var now = Date.now(), inr = 0, usd = 0;
        rows.forEach(function(row){
          if(!row) return;
          var spendable = row.status === 'available' ||
            (row.status === 'held' && row.hold_expires_at && Date.parse(row.hold_expires_at) <= now);
          if(!spendable) return;
          if(row.currency === 'INR') inr += Number(row.amount_minor) || 0;
          if(row.currency === 'USD') usd += Number(row.amount_minor) || 0;
        });
        var parts = [];
        if(inr > 0) parts.push('Rs ' + (inr / 100).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}));
        if(usd > 0) parts.push('$' + (usd / 100).toFixed(2));
        if(parts.length){
          line.style.display = 'block';
          line.textContent = 'Your referral credit: ' + parts.join(' and ') + '. Tick the box to use it on this purchase.';
        }
      }).catch(function(){});
  }).catch(function(){});
}
function paRenderCheckoutSummary(){
  var box = document.getElementById('pa-order-summary');
  if(!box) return '';
  var bid = paCheckoutBundleId();
  var picker = document.getElementById('pa-bundle-picker');
  PA_SELECTED_BUNDLE = bid || null;
  box.innerHTML = '';
  var h = document.createElement('h3');
  h.textContent = 'Order summary';
  box.appendChild(h);
  if(!bid){
    var p0 = document.createElement('p');
    p0.textContent = 'No course selected. Pick a course below to see its price and pay.';
    box.appendChild(p0);
    if(picker) picker.style.display = 'block';
    return '';
  }
  var b = paCheckoutBundle(bid);
  if(!b) return '';
  if(picker) picker.style.display = 'none';
  var p1 = document.createElement('p');
  p1.textContent = b.name + ' (' + (b.meta || '') + ')';
  box.appendChild(p1);
  var p2 = document.createElement('p');
  p2.appendChild(document.createTextNode('Price: '));
  var strong = document.createElement('b');
  strong.textContent = b.price_placeholder ? 'Pricing to be announced'
    : 'Rs. ' + Number(b.price_inr).toLocaleString('en-IN');
  p2.appendChild(strong);
  box.appendChild(p2);
  var p3 = document.createElement('p');
  var a = document.createElement('a');
  a.href = 'payment.html';
  a.textContent = 'Choose a different course';
  p3.appendChild(a);
  box.appendChild(p3);
  return bid;
}
function paStartPayuCheckout(bid){
  bid = bid || paCheckoutBundleId();
  if(!bid){ paCheckoutFail('Pick a course first.'); return; }
  if(!paPayuReady()){
    paCheckoutFail('PayU checkout is not set up yet. Website checkout is in test setup.');
    return;
  }
  if(typeof paAuthAccessToken !== 'function'){
    paCheckoutFail('Sign-in is not available. Please try again later.');
    return;
  }
  var btn = document.getElementById('pa-payu-pay');
  if(btn) btn.disabled = true;
  paCheckoutStatus('Starting PayU checkout. You will be taken to the PayU payment page.');
  paAuthAccessToken().then(function(token){
    if(!token){
      paCheckoutFail('Sign in first so the payment is linked to your account.');
      if(btn) btn.disabled = false;
      return;
    }
    fetch(PA_CHECKOUT_CONFIG.payu_create_payment_url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token},
      body: JSON.stringify({bundle_id: bid, referral_code: paReferralCode(), use_credit: paUseCredit()})
    }).then(function(r){
      return r.json().then(function(data){ return {ok: r.ok, data: data}; });
    }).then(function(res){
      var data = res.data || {};
      if(!res.ok || !data.action_url || !data.fields || typeof data.fields !== 'object'){
        var msg = paReferralErrorMessage(data.code);
        paCheckoutFail(msg || 'Could not start the PayU payment. Please try again.');
        if(btn) btn.disabled = false;
        return;
      }
      /* The discount shown comes from the server response only.
         It is set before the form submits so the buyer sees it
         while the PayU page loads. */
      if(data.referral_applied){
        paCheckoutStatus('Referral discount applied: Rs ' + Number(data.referral_discount_inr || 0).toFixed(2) +
          ' off. Total Rs ' + String(data.charged_amount || '') + '. Taking you to the PayU payment page.');
        paReferralStatus('Referral code ' + String(data.referral_code || '') + ' applied.');
      } else if(data.referral_status === 'unavailable' && paReferralCode()){
        paReferralStatus('Referral codes are not available right now. Continuing at full price.');
      }
      /* PayU hosted checkout: build the hidden form from the server
         fields and auto-submit it to the server action URL. */
      var form = document.createElement('form');
      form.method = 'POST';
      form.action = data.action_url;
      Object.keys(data.fields).forEach(function(k){
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = k;
        input.value = String(data.fields[k]);
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    }).catch(function(){
      paCheckoutFail('Could not start the PayU payment. Check your connection and try again.');
      if(btn) btn.disabled = false;
    });
  });
}
var paPaypalSdkLoading = false;
function paLoadPaypalSdk(callback){
  if(window.paypal && window.paypal.Buttons){ callback(); return; }
  if(paPaypalSdkLoading) return;
  paPaypalSdkLoading = true;
  var s = document.createElement('script');
  s.src = 'https://www.paypal.com/sdk/js?client-id='
    + encodeURIComponent(PA_CHECKOUT_CONFIG.paypal_client_id)
    + '&currency=USD&intent=capture';
  s.onload = function(){ paPaypalSdkLoading = false; callback(); };
  s.onerror = function(){
    paPaypalSdkLoading = false;
    paCheckoutFail('Could not load the PayPal buttons. Check your connection and try again.');
  };
  document.head.appendChild(s);
}
function paRenderPaypalButtons(bid){
  var host = document.getElementById('pa-paypal-buttons');
  if(!host || !window.paypal || !window.paypal.Buttons) return;
  host.innerHTML = '';
  window.paypal.Buttons({
    createOrder: function(){
      return paAuthAccessToken().then(function(token){
        if(!token){
          paCheckoutFail('Sign in first so the payment is linked to your account.');
          throw new Error('not signed in');
        }
        return fetch(PA_CHECKOUT_CONFIG.paypal_create_order_url, {
          method: 'POST',
          headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token},
          body: JSON.stringify({bundle_id: bid, referral_code: paReferralCode(), use_credit: paUseCredit()})
        });
      }).then(function(r){
        return r.json().then(function(data){ return {ok: r.ok, data: data}; });
      }).then(function(res){
        var data = res.data || {};
        if(!res.ok || !data.order_id){
          var msg = paReferralErrorMessage(data.code);
          paCheckoutFail(msg || 'Could not start the PayPal payment. Please try again.');
          throw new Error('order failed');
        }
        /* The amount shown is the server-returned amount only. No USD
           amount is hardcoded anywhere on this page. The discount
           breakdown comes from the server response. */
        var amt = document.getElementById('pa-paypal-amount');
        if(amt && data.amount != null){
          var line = 'Total: ' + String(data.amount) + ' ' + (data.currency || 'USD');
          if(data.referral_applied){
            line += ' (list ' + String(data.list_amount || '') + ', $' +
              Number(data.referral_discount || 0).toFixed(2) + ' referral discount applied';
            if(Number(data.credit_applied || 0) > 0){
              line += ', $' + Number(data.credit_applied || 0).toFixed(2) + ' credit applied';
            }
            line += ')';
            paReferralStatus('Referral code ' + String(data.referral_code || '') + ' applied.');
          } else if(Number(data.credit_applied || 0) > 0){
            line += ' (list ' + String(data.list_amount || '') + ', $' +
              Number(data.credit_applied || 0).toFixed(2) + ' credit applied)';
          } else if(data.referral_status === 'unavailable' && paReferralCode()){
            paReferralStatus('Referral codes are not available right now. Continuing at full price.');
          }
          amt.textContent = line;
        }
        return data.order_id;
      });
    },
    onApprove: function(data){
      return paAuthAccessToken().then(function(token){
        return fetch(PA_CHECKOUT_CONFIG.paypal_capture_order_url, {
          method: 'POST',
          headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token},
          body: JSON.stringify({order_id: data.orderID, bundle_id: bid})
        });
      }).then(function(r){
        return r.json().then(function(d){ return {ok: r.ok, data: d}; });
      }).then(function(res){
        if(!res.ok){
          paCheckoutFail('The PayPal payment could not be confirmed. Please contact support with the PayPal order id.');
          return;
        }
        var txn = (res.data && (res.data.capture_id || res.data.id)) || data.orderID;
        window.location.href = 'payment-result.html?status=success&txnid=' + encodeURIComponent(txn);
      }).catch(function(){
        paCheckoutFail('The PayPal payment could not be confirmed. Please contact support with the PayPal order id.');
      });
    },
    onCancel: function(){ paCheckoutStatus('PayPal checkout cancelled. Nothing was charged.'); },
    onError: function(){ paCheckoutFail('The PayPal payment failed. Please try again.'); }
  }).render(host);
}
function paInitCheckout(){
  /* P0 fix 13 Nov 2026: the gate must name the id payment_html
     actually puts on the checkout section (id="payment"). It
     used to check for id="pa-checkout", which exists nowhere,
     so this function returned early on every page and checkout
     never initialised. id="payment" stays: enrolBundle scrolls
     to it and the homepage stylesheet styles it. */
  if(!document.getElementById('payment')) return;
  var bid = paRenderCheckoutSummary();
  var payuBtn = document.getElementById('pa-payu-pay');
  var payuNote = document.getElementById('pa-payu-note');
  var paypalNote = document.getElementById('pa-paypal-note');
  if(!bid){
    if(payuBtn) payuBtn.disabled = true;
    if(payuNote) payuNote.textContent = 'Pick a course first.';
    if(paypalNote) paypalNote.textContent = 'Pick a course first.';
    return;
  }
  var b = paCheckoutBundle(bid);
  if(b && b.price_placeholder){
    if(payuBtn) payuBtn.disabled = true;
    if(payuNote) payuNote.textContent = 'This course is not on sale yet, so there is no payment step.';
    if(paypalNote) paypalNote.textContent = 'This course is not on sale yet, so there is no payment step.';
    return;
  }
  if(typeof paAuthCurrentUserId !== 'function'){
    if(payuBtn) payuBtn.disabled = true;
    if(payuNote) payuNote.textContent = 'Sign-in is not available. Please try again later.';
    if(paypalNote) paypalNote.textContent = 'Sign-in is not available. Please try again later.';
    return;
  }
  paAuthCurrentUserId().then(function(uid){
    var signin = document.getElementById('pa-checkout-signin');
    if(!uid){
      if(signin) signin.style.display = 'block';
      if(payuBtn) payuBtn.disabled = true;
      if(payuNote) payuNote.textContent = 'Sign in to pay. The payment is linked to your account.';
      if(paypalNote) paypalNote.textContent = 'Sign in to pay with PayPal.';
      return;
    }
    if(signin) signin.style.display = 'none';
    paLoadCheckoutCredit(uid);
    if(paPayuReady()){
      if(payuBtn) payuBtn.disabled = false;
      if(payuNote) payuNote.textContent = 'You will be taken to the PayU payment page to complete the payment.';
    } else {
      if(payuBtn) payuBtn.disabled = true;
      if(payuNote) payuNote.textContent = 'PayU checkout is not set up yet. Website checkout is in test setup.';
    }
    if(paPaypalReady()){
      if(paypalNote) paypalNote.textContent = '';
      paLoadPaypalSdk(function(){ paRenderPaypalButtons(bid); });
    } else {
      if(paypalNote) paypalNote.textContent = 'PayPal checkout is not set up yet. Website checkout is in test setup.';
    }
  });
}
document.addEventListener('DOMContentLoaded', paInitCheckout);
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
