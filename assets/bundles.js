
/* ===== Courses, bundles and access (browser demo only) ===== */
/* ACCESS ENFORCEMENT IS OFF by owner decision (5 Nov 2026). Everything is
   open to signed-in learners: no locks, no payment needed. The lock code
   below stays parked behind PA_ENFORCE_ACCESS. Flip that one flag to true
   later to lock chapters behind their bundles. Real payment enforcement
   needs the Razorpay account plus a backend or licence check.
   Lesson gating (17 Nov 2026) is separate and lives in the paGate
   section at the end of this file: it is Supabase-backed and does not
   use this flag. */
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
  if(owned.indexOf('integrated') !== -1) return true;
  var b = PA_BUNDLE_MAP[chid];
  return b && owned.indexOf(b) !== -1;
}
/* ===== Payment Situations gate (9 Nov 2026; Supabase-backed 17 Nov 2026) ===== */
/* Practice Experiences holds the Payment Situations. It is gated
   independently of PA_ENFORCE_ACCESS, which stays false so the
   flagship course lessons stay governed by the lesson gate below.
   Ownership is read from the same Supabase entitlement state as the
   lesson gate (paGateState): an admin (app_metadata.is_admin), or an
   active unexpired user_purchases row for 'practice' or 'integrated'.
   The 9 Nov 2026 temporary unlock (PA_SITUATIONS_GATED = false) and
   the localStorage demo list are gone: the temporary flag is what
   left every situation open to every signed-in visitor, and the demo
   list cannot express per-course Supabase ownership.
   These checks are synchronous over the resolved state, because the
   situations renderer and the investigation experience call them
   during render. Until paGateState() resolves, every check fails
   closed (false); callers re-render when the promise resolves.
   Honest limit: this is a browser-side gate. It stops casual access;
   it does not stop a determined user who inspects network requests
   or takes screenshots. Real server-side enforcement is a later
   step. */
var PA_SITUATIONS_BUNDLE = 'practice';
var PA_GATE_RESOLVED_STATE = null;
function paHasSituationsAccess(){
  var st = PA_GATE_RESOLVED_STATE;
  if(st) return st.isAdmin || !!(st.owned && (st.owned[PA_SITUATIONS_BUNDLE] || st.owned.integrated));
  if(typeof paGateState === 'function'){ try { paGateState(); } catch(e){} }
  return false;
}
/* ===== Investigation Lab gate (17 Nov 2026) ===== */
/* The 7-case lab on investigation-lab.html unlocks with the
   Investigation Lab product, with Practice Experiences (whose own
   website copy says it includes labs, matching the apps'
   EntryAccessRules lab mapping), or with the Integrated Course.
   Admins see everything. Same fail-closed-until-resolved rule as
   the situations gate above. */
function paHasInvestigationLabAccess(){
  var st = PA_GATE_RESOLVED_STATE;
  if(st) return st.isAdmin || !!(st.owned && (st.owned['investigation-lab'] || st.owned[PA_SITUATIONS_BUNDLE] || st.owned.integrated));
  if(typeof paGateState === 'function'){ try { paGateState(); } catch(e){} }
  return false;
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
  var b = PA_BUNDLE_MAP[chid] || 'integrated';
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
/* ===== Website checkout: PayU and PayPal (PayPal live 17 Nov 2026; PayU still in test setup) ===== */
/* Website checkout with PayU (Indian buyers, INR, still in test
   setup) and PayPal (international buyers, USD, live since 17 Nov
   2026: the live functions paypal-create-order and
   paypal-capture-order are deployed and the live secrets are set).
   The PayPal buttons render only when the page config carries
   paypal_enabled plus a client id: with an empty client id the
   section says PayPal is not available. Payment requires sign-in:
   the server needs the Supabase JWT. Prices are never trusted from
   the client: the server reads them from its own price table. Direct UPI payment
   lives in its own section below (17 Nov 2026): the buyer pays the
   owner's UPI ID and submits the UPI reference, and the claim is
   verified by hand. UPI is also offered inside PayU hosted checkout
   once PayU is live. No purchase is ever marked in
   localStorage and no access is granted from this page: access is
   granted only after the server verifies the payment. */
var PA_CHECKOUT_CONFIG = (function(){
  try {
    var el = document.getElementById('payment-config');
    if(el) return JSON.parse(el.textContent);
  } catch(e){}
  return {payu_create_payment_url: '', cashfree_create_order_url: '', paypal_client_id: '',
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
function paCashfreeReady(){
  var c = PA_CHECKOUT_CONFIG;
  return !!(c && c.cashfree_create_order_url);
}
function paPaypalReady(){
  var c = PA_CHECKOUT_CONFIG;
  /* PayPal hidden (15 Nov 2026, fix 10): the flag defaults to off when
     the config block is absent, so the buttons can never render
     without an explicit re-enable. */
  return !!(c && c.paypal_enabled && c.paypal_client_id && c.paypal_create_order_url && c.paypal_capture_order_url);
}
/* USD display prices (17 Nov 2026, owner-decided, $25 cap). DISPLAY
   ONLY: the line in the PayPal section shows the USD price. No INR
   mention belongs in the PayPal section (owner order, 17 Nov 2026). The amount
   actually charged always comes from the server response in
   paRenderPaypalButtons. Never change these without the owner's
   approval, and keep them in step with the server price table. */
var PA_USD_PRICES = {'group-1': '8.99', 'group-2': '8.99', 'group-3': '8.99', 'group-4': '8.99', 'group-5': '8.99', 'simulator': '5.99', 'investigation-lab': '5.99', 'studio': '9.99', 'practice': '11.99', 'interview': '18.99', 'integrated': '24.99', 'test-series': '5.99'};
function paRenderPaypalAmount(bid){
  var amt = document.getElementById('pa-paypal-amount');
  if(!amt) return;
  var b = bid ? paCheckoutBundle(bid) : null;
  if(!b || b.price_placeholder || !PA_USD_PRICES[bid]){
    amt.textContent = '';
    return;
  }
  amt.textContent = '$' + PA_USD_PRICES[bid];
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
    /* No bundle in the URL. The cart (localStorage) may still hold
       courses, so say so instead of contradicting it: the old text
       claimed nothing was selected while the cart showed an item. */
    var cartIds = (typeof paCartGet === 'function') ? paCartGet() : [];
    var p0 = document.createElement('p');
    if(cartIds.length){
      var names = [];
      cartIds.forEach(function(id){
        var cb = paCheckoutBundle(id);
        if(cb) names.push(cb.name + ' (Rs. ' + Number(cb.price_inr).toLocaleString('en-IN') + ')');
      });
      p0.textContent = 'No course selected for checkout yet. Your cart has ' + names.join(', ') + '. Use the Pay button in your cart to pay for one, or pick a course from the catalogue below.';
    } else {
      p0.textContent = 'No course selected. Pick a course from the catalogue below to see its price and pay.';
    }
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
  if(b.price_placeholder){
    var na = document.createElement('b');
    na.textContent = 'Pricing to be announced';
    p2.appendChild(na);
  } else {
    if(b.list_price_inr && Number(b.list_price_inr) > Number(b.price_inr)){
      var struck = document.createElement('s');
      struck.textContent = 'Rs. ' + Number(b.list_price_inr).toLocaleString('en-IN');
      p2.appendChild(struck);
      p2.appendChild(document.createTextNode(' '));
    }
    var strong = document.createElement('b');
    strong.textContent = 'Rs. ' + Number(b.price_inr).toLocaleString('en-IN');
    p2.appendChild(strong);
  }
  box.appendChild(p2);
  if(!b.price_placeholder){
    var p2b = document.createElement('p');
    var terms = (b.validity_label || '1 year of access') + '. Launch offer.';
    if(b.renewal_price_inr){
      terms += ' Renewal: Rs. ' + Number(b.renewal_price_inr).toLocaleString('en-IN') + ' for a further year.';
    }
    p2b.textContent = terms;
    box.appendChild(p2b);
  }
  var p3 = document.createElement('p');
  var a = document.createElement('a');
  a.href = 'payment';
  a.textContent = 'Choose a different course';
  p3.appendChild(a);
  box.appendChild(p3);
  return bid;
}
/* ===== Cart (19 Nov 2026, owner order: "Add to cart") ===== */
/* A buyer adds courses to a cart instead of paying for one course and
   then hunting for the next one. The cart lives in localStorage, so it
   survives the trip to sign-in and back: after signing in, the buyer
   lands on the payment page with the same cart waiting. Checkout stays
   one course at a time, because each gateway order is a single
   product, so the cart is a holding place: pick a cart item to pay
   for it, then come back for the next one. */
var PA_CART_KEY = 'pth_cart';
function paCartValidId(bid){
  return typeof bid === 'string' && /^[a-z0-9][a-z0-9-]*$/.test(bid);
}
function paCartGet(){
  var ids = [];
  try {
    var raw = window.localStorage.getItem(PA_CART_KEY);
    var arr = raw ? JSON.parse(raw) : [];
    if(Array.isArray(arr)) ids = arr.filter(function(id){ return paCartValidId(id); });
  } catch(e){ ids = []; }
  /* On the payment page the bundle table is the authority: drop any
     id it does not know, so a stale cart never shows a dead course. */
  try {
    var data = paCheckoutBundleData();
    if(data && data.length){
      var known = {};
      data.forEach(function(b){ known[b.id] = true; });
      ids = ids.filter(function(id){ return known[id]; });
    }
  } catch(e){}
  return ids;
}
function paCartSave(ids){
  try { window.localStorage.setItem(PA_CART_KEY, JSON.stringify(ids)); } catch(e){}
  paCartRender();
  paCartRefreshButtons();
}
function paCartAdd(bid){
  if(!paCartValidId(bid)) return false;
  var ids = paCartGet();
  if(ids.indexOf(bid) === -1){ ids.push(bid); paCartSave(ids); }
  return true;
}
function paCartRemove(bid){
  var ids = paCartGet();
  var i = ids.indexOf(bid);
  if(i !== -1){ ids.splice(i, 1); paCartSave(ids); }
}
function paCartTotal(){
  var total = 0;
  paCartGet().forEach(function(id){
    var b = paCheckoutBundle(id);
    if(b && !b.price_placeholder) total += Number(b.price_inr) || 0;
  });
  return total;
}
function paCartRefreshButtons(){
  /* Keep every "Add to cart" button in step with the cart, so a
     Remove (or an add from another spot) does not leave a stale
     "Added to cart" button on the page until a reload. */
  var btns = document.querySelectorAll('.pa-cart-btn');
  for(var i = 0; i < btns.length; i++){
    var bid = btns[i].dataset.paCartBid;
    if(!bid) continue;
    var inCart = paCartGet().indexOf(bid) !== -1;
    btns[i].textContent = inCart ? 'Added to cart' : 'Add to cart';
    btns[i].disabled = inCart;
  }
}
function paCartRender(){
  var host = document.getElementById('pa-cart');
  if(!host) return;
  var ids = paCartGet();
  host.innerHTML = '';
  var h = document.createElement('h3');
  h.textContent = ids.length ? 'Your cart (' + ids.length + ')' : 'Your cart';
  host.appendChild(h);
  if(!ids.length){
    var p0 = document.createElement('p');
    p0.textContent = 'Your cart is empty. Add a course below and it stays here, even if you sign in and come back.';
    host.appendChild(p0);
    return;
  }
  var ul = document.createElement('ul');
  ul.className = 'pa-cart-list';
  ids.forEach(function(id){
    var b = paCheckoutBundle(id);
    if(!b) return;
    var li = document.createElement('li');
    li.className = 'pa-cart-item';
    var name = document.createElement('span');
    name.textContent = b.name + ' — Rs. ' + Number(b.price_inr).toLocaleString('en-IN');
    li.appendChild(name);
    var pay = document.createElement('a');
    pay.href = 'payment?bundle=' + encodeURIComponent(id);
    pay.className = 'studio-btn pa-cart-pay';
    pay.textContent = 'Pay for this';
    li.appendChild(pay);
    var rm = document.createElement('button');
    rm.type = 'button';
    rm.className = 'studio-btn pa-cart-remove';
    rm.textContent = 'Remove';
    rm.addEventListener('click', function(){ paCartRemove(id); });
    li.appendChild(rm);
    ul.appendChild(li);
  });
  host.appendChild(ul);
  var total = document.createElement('p');
  var tb = document.createElement('b');
  tb.textContent = 'Total: Rs. ' + Number(paCartTotal()).toLocaleString('en-IN');
  total.appendChild(tb);
  total.appendChild(document.createTextNode(' — pay for one course at a time, starting with any item above.'));
  host.appendChild(total);
}
function paCartAddButtons(){
  /* "Add to cart" beside every Buy link that names a bundle: the
     payment page picker, the course cards, and the pricing page.
     The button carries the bundle id from the link it sits beside. */
  var links = document.querySelectorAll('a[href^="payment?bundle="]');
  for(var i = 0; i < links.length; i++){
    (function(link){
      if(link.dataset.paCartBound) return;
      link.dataset.paCartBound = '1';
      var m = /[?&]bundle=([^&#]*)/.exec(link.getAttribute('href') || '');
      var bid = '';
      try { bid = m ? decodeURIComponent(m[1]) : ''; } catch(e){ bid = m ? m[1] : ''; }
      if(!paCartValidId(bid)) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'studio-btn pa-cart-btn';
      btn.dataset.paCartBid = bid;
      var inCart = paCartGet().indexOf(bid) !== -1;
      btn.textContent = inCart ? 'Added to cart' : 'Add to cart';
      if(inCart) btn.disabled = true;
      btn.addEventListener('click', function(){
        if(paCartAdd(bid)){ btn.textContent = 'Added to cart'; btn.disabled = true; }
      });
      if(link.parentNode) link.parentNode.insertBefore(btn, link.nextSibling);
    })(links[i]);
  }
}
document.addEventListener('DOMContentLoaded', paCartAddButtons);
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
  var payuTimedOut = false;
  var payuTimer = setTimeout(function(){
    payuTimedOut = true;
    paCheckoutFail('Could not start the PayU payment. Check your connection and try again.');
    if(btn) btn.disabled = false;
  }, 20000);
  paAuthAccessToken().then(function(token){
    if(payuTimedOut){ return; }
    if(!token){
      clearTimeout(payuTimer);
      paCheckoutFail('Sign in first so the payment is linked to your account.');
      if(btn) btn.disabled = false;
      return;
    }
    paCheckoutStatus('Contacting the payment server...');
    fetch(PA_CHECKOUT_CONFIG.payu_create_payment_url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'apikey': PA_AUTH_CONFIG.supabaseAnonKey, 'Authorization': 'Bearer ' + token},
      body: JSON.stringify({bundle_id: bid})
    }).then(function(r){
      return r.json().then(function(data){ return {ok: r.ok, data: data}; });
    }).then(function(res){
      clearTimeout(payuTimer);
      if(payuTimedOut){ return; }
      var data = res.data || {};
      if(!res.ok || !data.action_url || !data.fields || typeof data.fields !== 'object'){
        var msg = (data.code === 'amount_zero') ? 'The discount covers the full price of this course. Please choose another course or contact support.' : '';
        paCheckoutFail(msg || 'Could not start the PayU payment. Please try again.');
        if(btn) btn.disabled = false;
        return;
      }
      /* PayU hosted checkout: build the hidden form from the server
         fields and auto-submit it to the server action URL. */
      var payuHost = '';
      try { payuHost = String(data.action_url).split('/')[2] || ''; } catch(e){ payuHost = ''; }
      paCheckoutStatus('Payment started. Taking you to PayU' + (payuHost ? ' (' + payuHost + ')' : '') + '.');
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
      clearTimeout(payuTimer);
      if(payuTimedOut){ return; }
      paCheckoutFail('Could not start the PayU payment. Check your connection and try again.');
      if(btn) btn.disabled = false;
    });
  });
}
/* Cashfree checkout (19 Nov 2026): mirrors paStartPayuCheckout. The
   server creates the order and returns a payment_session_id plus the
   mode (sandbox or production); the browser opens the Cashfree
   Checkout JS drop-in with that session id. Cards, wallets, UPI,
   netbanking and EMI are all offered inside Cashfree checkout, so
   no method is built separately here. The buyer leaves this page
   for Cashfree's hosted checkout (redirectTarget _self) and returns
   to payment.html?cashfree_return=1, which is UX only: access is
   granted by the cashfree-webhook function after it verifies the
   payment server side. The section stays pa-pay-disabled until the
   live keys are set, so this code is inert until then. */
var paCashfreeSdkState = 'idle';
var paCashfreeSdkQueue = [];
function paLoadCashfreeSdk(callback){
  if(window.Cashfree){ if(callback) callback(true); return; }
  if(paCashfreeSdkState === 'ready'){ if(callback) callback(true); return; }
  if(paCashfreeSdkState === 'failed'){ if(callback) callback(false); return; }
  if(callback) paCashfreeSdkQueue.push(callback);
  if(paCashfreeSdkState === 'loading') return;
  paCashfreeSdkState = 'loading';
  var s = document.createElement('script');
  s.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
  s.async = true;
  s.onload = function(){
    paCashfreeSdkState = 'ready';
    var q = paCashfreeSdkQueue; paCashfreeSdkQueue = [];
    q.forEach(function(cb){ cb(true); });
  };
  s.onerror = function(){
    paCashfreeSdkState = 'failed';
    var q = paCashfreeSdkQueue; paCashfreeSdkQueue = [];
    q.forEach(function(cb){ cb(false); });
  };
  document.head.appendChild(s);
}
/* Discount code WELCOME24 (20 Nov 2026, invitation mail): 25% off
   the Integrated Course only, until 21 Nov 2026, 3:00 PM IST. The
   code is checked on the server when the order is created; the
   preview below is display only and the server amount is what is
   charged. The code never applies to any other course and never
   stacks with a referral code. */
var PA_PROMO_WELCOME24 = 'WELCOME24';
var PA_PROMO_WELCOME24_EXPIRY_LABEL = '21 Nov 2026, 3:00 PM IST';
function paPromoCode(){
  var el = document.getElementById('pa-promo-code');
  if(!el) return '';
  return String(el.value || '').trim().toUpperCase();
}
function paPromoPreviewAmount(bid){
  var b = paCheckoutBundle(bid);
  if(!b || b.price_placeholder || bid !== 'integrated') return null;
  return Math.round(Number(b.price_inr) * 75 / 100);
}
function paApplyPromoCode(){
  var st = document.getElementById('pa-promo-status');
  var code = paPromoCode();
  var bid = paCheckoutBundleId();
  var b = bid ? paCheckoutBundle(bid) : null;
  if(!code){
    if(st) st.textContent = 'Enter a discount code first.';
    return;
  }
  if(code !== PA_PROMO_WELCOME24){
    if(st) st.textContent = 'That code is not valid for this checkout.';
    return;
  }
  if(!b || bid !== 'integrated'){
    if(st) st.textContent = 'WELCOME24 applies to the Integrated Course only. Pick the Integrated Course to use it.';
    return;
  }
  var discounted = paPromoPreviewAmount(bid);
  if(discounted == null){
    if(st) st.textContent = 'That code does not apply to this course.';
    return;
  }
  if(st) st.textContent = 'WELCOME24 applied: Rs. ' + Number(discounted).toLocaleString('en-IN') + ' (was Rs. ' + Number(b.price_inr).toLocaleString('en-IN') + '). Valid until ' + PA_PROMO_WELCOME24_EXPIRY_LABEL + '. The price is confirmed on the payment server before you pay.';
  paRenderPromoSummary(discounted);
}
function paRenderPromoSummary(discounted){
  /* Show the discounted price in the order summary so the buyer
     sees it before paying. The server amount is authoritative;
     this only updates the display. */
  var box = document.getElementById('pa-order-summary');
  if(!box) return;
  var bid = paCheckoutBundleId();
  var b = bid ? paCheckoutBundle(bid) : null;
  if(!b) return;
  var line = document.getElementById('pa-promo-summary-line');
  if(!line){
    line = document.createElement('p');
    line.id = 'pa-promo-summary-line';
    box.appendChild(line);
  }
  line.innerHTML = '';
  var s = document.createElement('s');
  s.textContent = 'Rs. ' + Number(b.price_inr).toLocaleString('en-IN');
  line.appendChild(s);
  line.appendChild(document.createTextNode(' '));
  var strong = document.createElement('b');
  strong.textContent = 'Rs. ' + Number(discounted).toLocaleString('en-IN') + ' with WELCOME24';
  line.appendChild(strong);
}
function paStartCashfreeCheckout(bid){
  bid = bid || paCheckoutBundleId();
  if(!bid){ paCheckoutFail('Pick a course first.'); return; }
  if(!paCashfreeReady()){
    paCheckoutFail('Cashfree checkout is not set up yet. Website checkout is in test setup.');
    return;
  }
  if(typeof paAuthAccessToken !== 'function'){
    paCheckoutFail('Sign-in is not available. Please try again later.');
    return;
  }
  var btn = document.getElementById('pa-cashfree-pay');
  if(btn) btn.disabled = true;
  paCheckoutStatus('Starting Cashfree checkout. You will be taken to the Cashfree payment page.');
  var cfTimedOut = false;
  var cfTimer = setTimeout(function(){
    cfTimedOut = true;
    paCheckoutFail('Could not start the Cashfree payment. Check your connection and try again.');
    if(btn) btn.disabled = false;
  }, 20000);
  paAuthAccessToken().then(function(token){
    if(cfTimedOut){ return; }
    if(!token){
      clearTimeout(cfTimer);
      paCheckoutFail('Sign in first so the payment is linked to your account.');
      if(btn) btn.disabled = false;
      return;
    }
    paCheckoutStatus('Contacting the payment server...');
    fetch(PA_CHECKOUT_CONFIG.cashfree_create_order_url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'apikey': PA_AUTH_CONFIG.supabaseAnonKey, 'Authorization': 'Bearer ' + token},
      body: JSON.stringify({product_id: paUpiProductId(bid), promo_code: paPromoCode() || undefined})
    }).then(function(r){
      return r.json().then(function(data){ return {ok: r.ok, data: data}; });
    }).then(function(res){
      clearTimeout(cfTimer);
      if(cfTimedOut){ return; }
      var data = res.data || {};
      if(!res.ok || !data.payment_session_id){
        var pmsg = '';
        if(data && typeof data.code === 'string' && data.code.indexOf('promo_') === 0){
          pmsg = data.error || 'That discount code could not be applied.';
        }
        paCheckoutFail(pmsg || 'Could not start the Cashfree payment. Please try again.');
        if(btn) btn.disabled = false;
        return;
      }
      /* The amount shown is the server-returned amount only: it is
         the price actually charged, including any applied discount. */
      if(data.amount != null){
        paCheckoutStatus('Total: Rs. ' + Number(data.amount).toLocaleString('en-IN') + (data.promo_code ? ' with code ' + String(data.promo_code) : '') + '. Opening Cashfree checkout.');
      } else {
        paCheckoutStatus('Payment started. Opening Cashfree checkout.');
      }
      paLoadCashfreeSdk(function(loaded){
        if(!loaded){
          paCheckoutFail('Could not load the Cashfree payment page. Check your connection and try again.');
          if(btn) btn.disabled = false;
          return;
        }
        try{
          var cf = window.Cashfree({mode: (data.mode === 'sandbox' ? 'sandbox' : 'production')});
          cf.checkout({paymentSessionId: data.payment_session_id, redirectTarget: '_self'});
        }catch(e){
          paCheckoutFail('Could not open the Cashfree payment page. Please try again.');
          if(btn) btn.disabled = false;
        }
      });
    }).catch(function(){
      clearTimeout(cfTimer);
      if(cfTimedOut){ return; }
      paCheckoutFail('Could not start the Cashfree payment. Check your connection and try again.');
      if(btn) btn.disabled = false;
    });
  });
}
/* Cashfree return (19 Nov 2026): the buyer lands back here after
   Cashfree checkout. UX only: access is granted by the webhook
   after server-side verification, never by this page. */
function paCashfreeReturnNotice(){
  try{
    var m = /[?&]cashfree_return=1/.exec(window.location.search || '');
    if(!m) return;
    paCheckoutStatus('Payment received by Cashfree. Access is granted after the payment is verified, usually within a few minutes. Check My Purchases or your dashboard.');
  }catch(e){}
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
          headers: {'Content-Type': 'application/json', 'apikey': PA_AUTH_CONFIG.supabaseAnonKey, 'Authorization': 'Bearer ' + token},
          body: JSON.stringify({bundle_id: bid})
        });
      }).then(function(r){
        return r.json().then(function(data){ return {ok: r.ok, data: data}; });
      }).then(function(res){
        var data = res.data || {};
        if(!res.ok || !data.order_id){
          var msg = (data.code === 'amount_zero') ? 'The discount covers the full price of this course. Please choose another course or contact support.' : '';
          paCheckoutFail(msg || 'Could not start the PayPal payment. Please try again.');
          throw new Error('order failed');
        }
        /* The amount shown is the server-returned amount only. No USD
           amount is hardcoded anywhere on this page. */
        var amt = document.getElementById('pa-paypal-amount');
        if(amt && data.amount != null){
          amt.textContent = 'Total: ' + String(data.amount) + ' ' + (data.currency || 'USD');
        }
        return data.order_id;
      });
    },
    onApprove: function(data){
      return paAuthAccessToken().then(function(token){
        return fetch(PA_CHECKOUT_CONFIG.paypal_capture_order_url, {
          method: 'POST',
          headers: {'Content-Type': 'application/json', 'apikey': PA_AUTH_CONFIG.supabaseAnonKey, 'Authorization': 'Bearer ' + token},
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
        window.location.href = 'payment-result?status=success&txnid=' + encodeURIComponent(txn);
      }).catch(function(){
        paCheckoutFail('The PayPal payment could not be confirmed. Please contact support with the PayPal order id.');
      });
    },
    onCancel: function(){ paCheckoutStatus('PayPal checkout cancelled. Nothing was charged.'); },
    onError: function(){ paCheckoutFail('The PayPal payment failed. Please try again.'); }
  }).render(host);
}
/* ===== Direct UPI payment (live, 17 Nov 2026) ===== */
/* The buyer pays the exact course price straight to the owner's UPI
   ID, from any UPI app, then submits the UTR on this page. The claim
   is stored in Supabase (payment_claims, status pending) under the
   buyer's own account: nothing is stored only in the browser, and
   submitting a UTR NEVER unlocks anything. Only the admin, after
   checking the payment in their UPI app or bank statement, verifies
   the claim through the verify-upi-claim Edge Function, which is
   what records the purchase. The admin reviews claims on claims.html.
   No screenshot is asked for and none is sent anywhere: the UTR is
   the proof. Product ids sent here are the full store ids
   (com.paymentstraininghub.app.<bundle>), matching App Store and
   Play purchases, so one purchase row means the same product on
   every surface. */
var PA_UPI_ID = 'deb.arghya@ptyes';
var PA_UPI_PRODUCT_PREFIX = 'com.paymentstraininghub.app.';
function paUpiUri(bid, amount){
  return 'upi://pay?pa=' + PA_UPI_ID + '&pn=Payments%20Training%20Hub' +
    '&am=' + String(amount) + '&cu=INR&tn=' + encodeURIComponent(bid);
}
/* App-targeted UPI links (17 Nov 2026): on Android the PhonePe and
   GPay buttons use intent:// URLs pinned to the app package, with a
   browser fallback to the plain upi:// link so a tap never
   dead-ends when the app is not installed. On iOS and desktop the
   same buttons use the plain upi:// link. The payload is the exact
   string paUpiUri builds for the QR code and the generic link: a
   deep link returns no confirmation to the page, so the UTR step
   remains the only proof. */
function paUpiIsAndroid(){
  try { return /android/i.test(navigator.userAgent || ''); } catch(e){ return false; }
}
function paUpiAppUri(uri, pkg){
  if(!paUpiIsAndroid()) return uri;
  var query = String(uri).replace(/^upi:\/\//, '');
  return 'intent://' + query + '#Intent;scheme=upi;package=' + pkg +
    ';S.browser_fallback_url=' + encodeURIComponent(uri) + ';end';
}
function paUpiProductId(bid){ return PA_UPI_PRODUCT_PREFIX + bid; }
function paUpiShortProduct(pid){
  return String(pid || '').replace(PA_UPI_PRODUCT_PREFIX, '');
}
function paUpiStatusText(status){
  if(status === 'verified') return 'Verified: access granted.';
  if(status === 'rejected') return 'Rejected: the payment could not be matched. Check the UTR and submit again, or contact support.';
  return 'Pending verification: the payment is being checked by hand.';
}
function paUpiRender(bid, uid){
  var area = document.getElementById('pa-upi-pay-area');
  var note = document.getElementById('pa-upi-note');
  var claims = document.getElementById('pa-upi-claims');
  if(!area) return;
  if(!bid){
    area.style.display = 'none';
    if(note) note.textContent = 'Pick a course first.';
    if(claims) claims.innerHTML = '';
    return;
  }
  var b = paCheckoutBundle(bid);
  if(!b || b.price_placeholder){
    area.style.display = 'none';
    if(note) note.textContent = 'This course is not on sale yet, so there is no payment step.';
    if(claims) claims.innerHTML = '';
    return;
  }
  if(!uid){
    area.style.display = 'none';
    if(note) note.textContent = 'Sign in to pay with UPI. The payment is linked to your account.';
    if(claims) claims.innerHTML = '';
    return;
  }
  var qr = document.getElementById('pa-upi-qr');
  if(qr) qr.src = 'assets/upi-qr/' + bid + '.png';
  var uri = paUpiUri(bid, b.price_inr);
  var intent = document.getElementById('pa-upi-intent');
  if(intent) intent.href = uri;
  var phonepe = document.getElementById('pa-upi-phonepe');
  if(phonepe) phonepe.href = paUpiAppUri(uri, 'com.phonepe.app');
  var gpay = document.getElementById('pa-upi-gpay');
  if(gpay) gpay.href = paUpiAppUri(uri, 'com.google.android.apps.nbu.paisa.user');
  var amt = document.getElementById('pa-upi-amount-note');
  if(amt) amt.textContent = 'Pay exactly Rs ' + Number(b.price_inr).toLocaleString('en-IN') + ' to ' + PA_UPI_ID + '. Scan the code or tap the button above; the amount and course are already filled in.';
  if(note) note.textContent = '';
  area.style.display = 'block';
  paUpiLoadClaims(uid);
}
function paUpiLoadClaims(uid){
  var host = document.getElementById('pa-upi-claims');
  if(!host || !uid) return;
  if(typeof paAuthAccessToken !== 'function') return;
  if(typeof PA_AUTH_CONFIG === 'undefined' || !PA_AUTH_CONFIG.supabaseUrl || !PA_AUTH_CONFIG.supabaseAnonKey) return;
  paAuthAccessToken().then(function(token){
    if(!token) return;
    var url = String(PA_AUTH_CONFIG.supabaseUrl).replace(/\/+$/, '') +
      '/rest/v1/payment_claims?select=id,product_id,amount,utr,status,submitted_at&user_id=eq.' + encodeURIComponent(uid) +
      '&order=submitted_at.desc&limit=5';
    fetch(url, {headers: {'apikey': PA_AUTH_CONFIG.supabaseAnonKey, 'Authorization': 'Bearer ' + token, 'Accept': 'application/json'}})
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(rows){
        host.innerHTML = '';
        if(!rows || !rows.length) return;
        var h = document.createElement('h4');
        h.textContent = 'Your payment submissions';
        host.appendChild(h);
        rows.forEach(function(row){
          var div = document.createElement('div');
          div.className = 'pa-upi-claim';
          var p1 = document.createElement('p');
          var b = paCheckoutBundle(paUpiShortProduct(row.product_id));
          p1.textContent = (b ? b.name : paUpiShortProduct(row.product_id)) + '  Rs ' + Number(row.amount).toLocaleString('en-IN');
          div.appendChild(p1);
          var p2 = document.createElement('p');
          p2.textContent = 'UTR: ' + String(row.utr || '') + '  ' + paUpiStatusText(row.status);
          div.appendChild(p2);
          var p3 = document.createElement('p');
          var d = row.submitted_at ? new Date(row.submitted_at) : null;
          p3.textContent = 'Submitted ' + (d && !isNaN(d.getTime()) ? d.toLocaleString('en-IN') : '');
          div.appendChild(p3);
          host.appendChild(div);
        });
      }).catch(function(){});
  }).catch(function(){});
}
function paUpiSubmit(){
  var st = document.getElementById('pa-upi-status');
  function say(msg){ if(st) st.textContent = msg; }
  var bid = paCheckoutBundleId();
  if(!bid){ say('Pick a course first.'); return; }
  var b = paCheckoutBundle(bid);
  if(!b || b.price_placeholder){ say('This course is not on sale yet.'); return; }
  var utrEl = document.getElementById('pa-upi-utr');
  var utr = utrEl ? String(utrEl.value || '').replace(/\s+/g, '') : '';
  if(utr.length < 6 || utr.length > 32){ say('Enter the transaction reference (UTR) from your UPI app. It is usually 12 digits.'); return; }
  var nameEl = document.getElementById('pa-upi-name');
  var payerName = nameEl ? String(nameEl.value || '').trim().slice(0, 80) : '';
  if(typeof paAuthCurrentUserId !== 'function' || typeof paAuthAccessToken !== 'function'){
    say('Sign-in is not available. Please try again later.'); return;
  }
  var btn = document.getElementById('pa-upi-submit');
  if(btn) btn.disabled = true;
  say('Submitting your payment proof.');
  paAuthCurrentUserId().then(function(uid){
    if(!uid){ say('Sign in first so the payment is linked to your account.'); if(btn) btn.disabled = false; return; }
    return paAuthAccessToken().then(function(token){
      if(!token){ say('Sign in first so the payment is linked to your account.'); if(btn) btn.disabled = false; return; }
      var url = String(PA_AUTH_CONFIG.supabaseUrl).replace(/\/+$/, '') + '/rest/v1/payment_claims';
      return fetch(url, {
        method: 'POST',
        headers: {'apikey': PA_AUTH_CONFIG.supabaseAnonKey, 'Authorization': 'Bearer ' + token,
                  'Content-Type': 'application/json', 'Prefer': 'return=representation'},
        body: JSON.stringify({user_id: uid, product_id: paUpiProductId(bid),
          amount: Number(b.price_inr), utr: utr, payer_name: payerName || null, status: 'pending'})
      }).then(function(r){
        return r.json().then(function(data){ return {ok: r.ok, data: data}; }).catch(function(){ return {ok: r.ok, data: null}; });
      }).then(function(res){
        if(!res.ok){
          say('Could not submit your payment proof. Please try again.');
          if(btn) btn.disabled = false;
          return;
        }
        var row = Array.isArray(res.data) ? res.data[0] : res.data;
        var cid = row && row.id ? String(row.id) : '';
        say('Payment received, access will be granted after verification.' + (cid ? ' Claim id: ' + cid + '. Keep your UTR safe.' : ''));
        if(utrEl) utrEl.value = '';
        if(btn) btn.disabled = false;
        paUpiLoadClaims(uid);
      });
    });
  }).catch(function(){
    say('Could not submit your payment proof. Check your connection and try again.');
    if(btn) btn.disabled = false;
  });
}
function paUpiCopyId(){
  var done = document.getElementById('pa-upi-copy-status');
  function ok(){ if(done) done.textContent = 'Copied.'; }
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(PA_UPI_ID).then(ok, function(){ if(done) done.textContent = ''; });
  } else {
    var ta = document.createElement('textarea');
    ta.value = PA_UPI_ID;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); ok(); } catch(e){}
    document.body.removeChild(ta);
  }
}
function paInitCheckout(){
  /* P0 fix 13 Nov 2026: the gate must name the id payment_html
     actually puts on the checkout section (id="payment"). It
     used to check for id="pa-checkout", which exists nowhere,
     so this function returned early on every page and checkout
     never initialised. id="payment" stays: enrolBundle scrolls
     to it and the homepage stylesheet styles it. */
  if(!document.getElementById('payment')) return;
  paCashfreeReturnNotice();
  /* Cart (19 Nov 2026): the cart section lives on this page, and the
     "Add to cart" buttons are wired here too, so a reload always
     shows the current cart. */
  paCartRender();
  paCartAddButtons();
  /* Sign-in lands back on this checkout page (19 Nov 2026, owner
     order): the sign-in link carries ?next= with this exact page, so
     after signing in the buyer returns here with the cart intact
     instead of landing on the dashboard and searching again. */
  var signinNote = document.getElementById('pa-checkout-signin');
  if(signinNote){
    var signinLink = signinNote.querySelector('a');
    if(signinLink){
      var here = window.location.pathname + window.location.search;
      signinLink.href = '/signin?next=' + encodeURIComponent(here);
    }
  }
  var upiSubmit = document.getElementById('pa-upi-submit');
  if(upiSubmit && !upiSubmit.dataset.paBound){ upiSubmit.dataset.paBound = '1'; upiSubmit.addEventListener('click', paUpiSubmit); }
  var upiCopy = document.getElementById('pa-upi-copy');
  if(upiCopy && !upiCopy.dataset.paBound){ upiCopy.dataset.paBound = '1'; upiCopy.addEventListener('click', paUpiCopyId); }
  var bid = paRenderCheckoutSummary();
  paRenderPaypalAmount(bid);
  var payuBtn = document.getElementById('pa-payu-pay');
  var payuNote = document.getElementById('pa-payu-note');
  var cfBtn = document.getElementById('pa-cashfree-pay');
  var cfNote = document.getElementById('pa-cashfree-note');
  var paypalNote = document.getElementById('pa-paypal-note');
  if(!bid){
    if(payuBtn) payuBtn.disabled = true;
    if(payuNote) payuNote.textContent = 'Pick a course first.';
    if(cfBtn) cfBtn.disabled = true;
    if(cfNote) cfNote.textContent = 'Pick a course first.';
    if(paypalNote) paypalNote.textContent = 'Pick a course first.';
    paUpiRender('', null);
    return;
  }
  var b = paCheckoutBundle(bid);
  if(b && b.price_placeholder){
    if(payuBtn) payuBtn.disabled = true;
    if(payuNote) payuNote.textContent = 'This course is not on sale yet, so there is no payment step.';
    if(cfBtn) cfBtn.disabled = true;
    if(cfNote) cfNote.textContent = 'This course is not on sale yet, so there is no payment step.';
    if(paypalNote) paypalNote.textContent = 'This course is not on sale yet, so there is no payment step.';
    paUpiRender(bid, null);
    return;
  }
  if(typeof paAuthCurrentUserId !== 'function'){
    if(payuBtn) payuBtn.disabled = true;
    if(payuNote) payuNote.textContent = 'Sign-in is not available. Please try again later.';
    if(cfBtn) cfBtn.disabled = true;
    if(cfNote) cfNote.textContent = 'Sign-in is not available. Please try again later.';
    if(paypalNote) paypalNote.textContent = 'Sign-in is not available. Please try again later.';
    paUpiRender(bid, null);
    return;
  }
  paAuthCurrentUserId().then(function(uid){
    var signin = document.getElementById('pa-checkout-signin');
    if(!uid){
      if(signin) signin.style.display = 'block';
      if(payuBtn) payuBtn.disabled = true;
      if(payuNote) payuNote.textContent = 'Sign in to pay. The payment is linked to your account.';
      if(cfBtn) cfBtn.disabled = true;
      if(cfNote) cfNote.textContent = 'Sign in to pay. The payment is linked to your account.';
      if(paypalNote) paypalNote.textContent = 'Sign in to pay with PayPal.';
      paUpiRender(bid, null);
      return;
    }
    if(signin) signin.style.display = 'none';
    paUpiRender(bid, uid);
    if(paPayuReady()){
      if(payuBtn) payuBtn.disabled = false;
      if(payuNote) payuNote.textContent = 'You will be taken to the PayU payment page to complete the payment.';
    } else {
      if(payuBtn) payuBtn.disabled = true;
      if(payuNote) payuNote.textContent = 'PayU checkout is not set up yet. Website checkout is in test setup.';
    }
    if(paCashfreeReady()){
      if(cfBtn) cfBtn.disabled = false;
      if(cfNote) cfNote.textContent = 'You will be taken to the Cashfree payment page to complete the payment.';
    } else {
      if(cfBtn) cfBtn.disabled = true;
      if(cfNote) cfNote.textContent = 'Cashfree checkout is not set up yet. Website checkout is in test setup.';
    }
    if(paPaypalReady()){
      if(paypalNote) paypalNote.textContent = '';
      paLoadPaypalSdk(function(){ paRenderPaypalButtons(bid); });
    } else {
      if(paypalNote) paypalNote.textContent = 'PayPal checkout is not available right now. Please try again later.';
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

/* ===== Buy-only sign-in prompt (17 Nov 2026) ===== */
/* No page redirects to sign-in and no content is hidden. Only a tap
   on a Buy or purchase link while signed out shows this prompt: a
   blurred overlay asking the visitor to sign in or create an
   account, returning to the tapped purchase after sign-in through
   the existing ?next= flow (paAuthNextTarget validates the target
   on the sign-in page). Signed-in visitors, including the admin
   account, go straight to checkout as before, so no admin check is
   needed here: the prompt only fires when there is no stored
   session at all. Links inside payment.html itself are left alone:
   they switch bundles, and the checkout wiring above already
   disables the pay controls while signed out. */
var PA_BUY_PROMPT_LAST_FOCUS = null;
function paBuyPromptHasSession(){
  try{
    if(typeof paAuthHasStoredSession === 'function') return paAuthHasStoredSession();
    var raw = localStorage.getItem('sb-eofsotgclhwsdwvbbtib-auth-token');
    if(!raw) return false;
    var data = JSON.parse(raw);
    return !!(data && data.access_token);
  }catch(e){ return false; }
}
function paBuyPromptResolve(href){
  try{
    var url = new URL(href, window.location.href);
    if(url.origin !== window.location.origin) return null;
    var path = url.pathname + url.search;
    if(path.charAt(0) !== '/' || path.length > 500) return null;
    return path;
  }catch(e){ return null; }
}
function paBuyPromptStyles(){
  if(document.getElementById('pa-buy-prompt-styles')) return;
  var css = [
    '.pa-buy-prompt-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(5,16,36,0.55);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);}',
    '.pa-buy-prompt-card{background:#ffffff;color:#0b1b30;border-radius:14px;padding:24px;max-width:420px;width:100%;box-shadow:0 18px 48px rgba(0,0,0,0.35);text-align:center;}',
    '.pa-buy-prompt-card h2{margin:0 0 10px;font-size:22px;line-height:1.3;color:#0b1b30;}',
    '.pa-buy-prompt-card p{margin:0 0 18px;font-size:15px;line-height:1.55;color:#334155;}',
    '.pa-buy-prompt-btn{display:block;width:100%;box-sizing:border-box;margin:0 0 10px;padding:12px 16px;border-radius:10px;font-size:16px;font-weight:700;text-decoration:none;text-align:center;cursor:pointer;}',
    '.pa-buy-prompt-btn-primary{background:#0b1b30;color:#ffffff;border:2px solid #0b1b30;}',
    '.pa-buy-prompt-btn-secondary{background:#ffffff;color:#0b1b30;border:2px solid #0b1b30;}',
    '.pa-buy-prompt-dismiss{margin:6px 0 0;padding:8px 12px;border:0;background:transparent;color:#475569;font-size:14px;cursor:pointer;text-decoration:underline;}'
  ].join('\n');
  var st = document.createElement('style');
  st.id = 'pa-buy-prompt-styles';
  st.type = 'text/css';
  if(st.styleSheet){ st.styleSheet.cssText = css; } else { st.appendChild(document.createTextNode(css)); }
  document.head.appendChild(st);
}
function paBuyPromptHide(){
  var ov = document.getElementById('pa-buy-prompt-overlay');
  if(ov && ov.parentNode) ov.parentNode.removeChild(ov);
  try{ document.body.style.overflow = ''; }catch(e){}
  if(PA_BUY_PROMPT_LAST_FOCUS && PA_BUY_PROMPT_LAST_FOCUS.focus){
    try{ PA_BUY_PROMPT_LAST_FOCUS.focus(); }catch(e){}
  }
  PA_BUY_PROMPT_LAST_FOCUS = null;
  document.removeEventListener('keydown', paBuyPromptOnKey);
}
function paBuyPromptOnKey(ev){
  if(ev && (ev.key === 'Escape' || ev.keyCode === 27)) paBuyPromptHide();
}
function paBuyPromptShow(href){
  var returnPath = paBuyPromptResolve(href) || '/payment';
  try{
    paBuyPromptStyles();
    paBuyPromptHide();
    PA_BUY_PROMPT_LAST_FOCUS = document.activeElement;
    var signinBase = '/signin?next=' + encodeURIComponent(returnPath);
    var ov = document.createElement('div');
    ov.id = 'pa-buy-prompt-overlay';
    ov.className = 'pa-buy-prompt-overlay';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-labelledby', 'pa-buy-prompt-title');
    var card = document.createElement('div');
    card.className = 'pa-buy-prompt-card';
    var h = document.createElement('h2');
    h.id = 'pa-buy-prompt-title';
    h.textContent = 'Sign in to buy';
    card.appendChild(h);
    var p = document.createElement('p');
    p.textContent = 'Create a free account or sign in to buy this course. Your purchase is linked to your account, and you return straight to checkout.';
    card.appendChild(p);
    var signin = document.createElement('a');
    signin.className = 'pa-buy-prompt-btn pa-buy-prompt-btn-primary';
    signin.href = signinBase;
    signin.textContent = 'Sign in';
    card.appendChild(signin);
    var signup = document.createElement('a');
    signup.className = 'pa-buy-prompt-btn pa-buy-prompt-btn-secondary';
    signup.href = signinBase + '#signupCard';
    signup.textContent = 'Create an account';
    card.appendChild(signup);
    var dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.className = 'pa-buy-prompt-dismiss';
    dismiss.textContent = 'Keep browsing';
    dismiss.addEventListener('click', paBuyPromptHide);
    card.appendChild(dismiss);
    ov.appendChild(card);
    ov.addEventListener('click', function(ev){ if(ev.target === ov) paBuyPromptHide(); });
    document.body.appendChild(ov);
    try{ document.body.style.overflow = 'hidden'; }catch(e){}
    document.addEventListener('keydown', paBuyPromptOnKey);
    try{ signin.focus(); }catch(e){}
    return true;
  }catch(e){ return false; }
}
function paBuyPromptGuard(href){
  if(paBuyPromptHasSession()) return true;
  return !paBuyPromptShow(href);
}
function paBuyPromptOnClick(ev){
  if(!ev || ev.defaultPrevented) return;
  if(typeof ev.button === 'number' && ev.button !== 0) return;
  if(ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
  var t = ev.target;
  var a = null;
  while(t && t !== document){
    if(t.tagName === 'A'){ a = t; break; }
    t = t.parentNode;
  }
  if(!a) return;
  var href = a.getAttribute ? a.getAttribute('href') : null;
  if(!href || (a.hasAttribute && a.hasAttribute('download'))) return;
  if(a.getAttribute && String(a.getAttribute('target') || '').toLowerCase() === '_blank') return;
  var url;
  try{ url = new URL(href, window.location.href); }catch(e){ return; }
  if(url.origin !== window.location.origin) return;
  if(!/(^|\/)payment\.html$/.test(url.pathname)) return;
  if(/(^|\/)payment\.html$/.test(window.location.pathname)) return;
  if(!paBuyPromptGuard(href)) ev.preventDefault();
}
document.addEventListener('click', paBuyPromptOnClick);

/* ===== Lesson gating: first lesson free, the rest paywall view + buy (17 Nov 2026) ===== */
/* The first lesson of every chapter is free to read in full. Every other
   lesson shows only what to expect from the lesson (the lesson outline
   and objectives) and then a lock panel with the owning course price and
   a Buy button. No transcript words, no player, no audio. Signed-in
   owners of the owning course, owners of the Integrated Course, and
   admins see the full lesson.
   Lock-first: the lock decision that needs no sign-in state is made at
   bundles.js execution time (this file runs before studio.js), so a
   lesson that starts locked is hidden and its player never initialises
   before the async entitlement check resolves. There is no flash of
   content and no audio path before the check. See PA_GATE_EARLY below
   and studioInit in studio.js.
   This is PRESENTATIONAL gating only: the full lesson stays in the
   served HTML, so search engines keep indexing it, and no page
   redirects to sign-in. It stops casual reading past what to expect; it
   does not stop a determined visitor who reads page source or fetches
   the audio file directly. Real server-side enforcement is a later
   step. This system is separate from PA_ENFORCE_ACCESS above, which
   stays false: that flag drives a localStorage demo list that cannot
   express per-course Supabase ownership, so ownership here is read
   from user_purchases, the same table the My Purchases page reads,
   and the admin check matches claims.js (app_metadata.is_admin).
   PA_LESSON_GATE below is generated from assets/reading-order.json
   (first lesson per chapter, chapter to course map) and the
   pa-bundle-data prices on payment.html. Regenerate it if the book
   order or prices change; never hand-edit the mapping. Held-out
   chapter ch37 has no course and no entry here, so its lessons stay
   fully open: no purchase could unlock them. */
var PA_LESSON_GATE = {"first":{"ch1":"ch1s1","ch2":"ch2s1","ch3":"ch3s1","ch4":"ch4s1","ch64":"ch64s1","ch69":"ch69s1","ch70":"ch70s1","ch9":"ch9s1","ch10":"ch10s1","ch11":"ch11s1","ch12":"ch12s1","ch33":"ch33s1","ch56":"ch56s1","ch57":"ch57s1","ch59":"ch59s1","ch61":"ch61s1","ch62":"ch62s1","ch74":"ch74s1","ch91":"ch91s1","ch92":"ch92s1","ch93":"ch93s1","ch5":"ch5s1","ch6":"ch6s1","ch7":"ch7s1","ch8":"ch8s1","ch38":"ch38s1","ch54":"ch54s1","ch39":"ch39s1","ch50":"ch50s1","ch51":"ch51s1","ch52":"ch52s1","ch53":"ch53s1","ch58":"ch58s1","ch60":"ch60s1","ch67":"ch67s1","ch13":"ch13s1","ch14":"ch14s1","ch15":"ch15s1","ch16":"ch16s1","ch94":"ch94s1","ch49":"ch49s1","ch66":"ch66s1","ch75":"ch75s1","ch17":"ch17s1","ch18":"ch18s1","ch21":"ch21s1","ch71":"ch71s1","ch90":"ch90s1","ch19":"ch19s1","ch20":"ch20s1","ch40":"ch40s1","ch44":"ch44s1","ch76":"ch76s1","ch77":"ch77s1","ch88":"ch88s1","ch89":"ch89s1","ch72":"ch72s1","ch23":"ch23s1","ch24":"ch24s1","ch41":"ch41s1","ch86":"ch86s1","ch87":"ch87s1","ch95":"ch95s1","ch73":"ch73s1","ch78":"ch78s1","ch81":"ch81s1","ch99":"ch99s1","ch22":"ch22s1","ch31":"ch31s1","ch32":"ch32s1","ch34":"ch34s1","ch63":"ch63s1","ch25":"ch25s1","ch26":"ch26s1","ch30":"ch30s1","ch35":"ch35s1","ch36":"ch36s1","ch42":"ch42s1","ch43":"ch43s1","ch46":"ch46s1","ch47":"ch47s1","ch48":"ch48s1","ch65":"ch65s1","ch80":"ch80s1","ch68":"ch68s1","ch79":"ch79s1","ch28":"ch28s1","ch45":"ch45s1","ch82":"ch82s1","ch83":"ch83s1","ch84":"ch84s1","ch29":"ch29s1","ch96":"ch96s1","ch97":"ch97s1","ch98":"ch98s1","ch100":"ch100s1","ch55":"ch55s1","ch27":"ch27s1","ch85":"ch85s1"},"part":{"ch1":"group-1","ch2":"group-1","ch3":"group-1","ch4":"group-1","ch64":"group-1","ch69":"group-1","ch70":"group-1","ch9":"group-1","ch10":"group-1","ch11":"group-1","ch12":"group-1","ch33":"group-1","ch56":"group-1","ch57":"group-1","ch59":"group-1","ch61":"group-1","ch62":"group-1","ch74":"group-1","ch91":"group-1","ch92":"group-1","ch93":"group-1","ch5":"group-2","ch6":"group-2","ch7":"group-2","ch8":"group-2","ch38":"group-2","ch54":"group-2","ch39":"group-2","ch50":"group-2","ch51":"group-2","ch52":"group-2","ch53":"group-2","ch58":"group-2","ch60":"group-2","ch67":"group-2","ch13":"group-2","ch14":"group-2","ch15":"group-2","ch16":"group-2","ch94":"group-2","ch49":"group-2","ch66":"group-2","ch75":"group-2","ch17":"group-3","ch18":"group-3","ch21":"group-3","ch71":"group-3","ch90":"group-3","ch19":"group-3","ch20":"group-3","ch40":"group-3","ch44":"group-3","ch76":"group-3","ch77":"group-3","ch88":"group-3","ch89":"group-3","ch72":"group-3","ch23":"group-3","ch24":"group-3","ch41":"group-3","ch86":"group-3","ch87":"group-3","ch95":"group-3","ch73":"group-3","ch78":"group-3","ch81":"group-3","ch99":"group-3","ch22":"group-4","ch31":"group-4","ch32":"group-4","ch34":"group-4","ch63":"group-4","ch25":"group-4","ch26":"group-4","ch30":"group-4","ch35":"group-4","ch36":"group-4","ch42":"group-4","ch43":"group-4","ch46":"group-4","ch47":"group-4","ch48":"group-4","ch65":"group-4","ch80":"group-4","ch68":"group-4","ch79":"group-4","ch28":"group-5","ch45":"group-5","ch82":"group-5","ch83":"group-5","ch84":"group-5","ch29":"group-5","ch96":"group-5","ch97":"group-5","ch98":"group-5","ch100":"group-5","ch55":"group-5","ch27":"group-5","ch85":"group-5"},"parts":{"group-1":{"name":"Group 1: Payments Foundations","sale":699,"list":999,"chapters":21,"lessons":186},"group-2":{"name":"Group 2: Messages and Cross-Border Payments","sale":699,"list":999,"chapters":22,"lessons":220},"group-3":{"name":"Group 3: Clearing, Settlement and Exceptions","sale":699,"list":999,"chapters":24,"lessons":208},"group-4":{"name":"Group 4: Cards, Architecture and Engineering","sale":699,"list":999,"chapters":19,"lessons":155},"group-5":{"name":"Group 5: The BA at Work and Emerging Payments","sale":699,"list":999,"chapters":13,"lessons":105}},"integrated":{"name":"The Integrated Course","sale":2999,"list":4499,"chapters":99,"lessons":874}};
var PA_GATE_STATE_PROMISE = null;
/* Lock-first (17 Nov 2026): this block runs synchronously at bundles.js
   execution time, before studio.js runs. From PA_LESSON_GATE alone it
   decides whether the page's lesson starts locked: any lesson that is
   not its chapter's first and belongs to a course. A locked lesson
   gets its sample marked in PA_GATE_EARLY_LOCKED (studioInit refuses
   to run for it: no state, no listeners, no autoplay, no background
   fetch, no audio source) and an injected style hiding the studio
   block, player card, tab card, tool rail, floating audio button and
   now-playing bar before anything can paint or play. The async
   entitlement check in paGateInit then either unlocks (flag cleared,
   style removed, pending studio started) or keeps the page locked.
   First lessons and held-out ch37 never lock. */
window.PA_GATE_EARLY_LOCKED = {};
var PA_GATE_EARLY = (function(){
  var lessonId = null;
  try {
    var m = /\/lessons\/(ch\d+s\d+)/.exec(window.location.pathname || '');
    if(m) lessonId = m[1];
  } catch(e){}
  if(!lessonId) return null;
  var ch = paGateChapterOf(lessonId);
  if(!ch) return null;
  if(PA_LESSON_GATE.first[ch] === lessonId) return null;
  if(!PA_LESSON_GATE.part[ch]) return null;
  return lessonId;
})();
if(PA_GATE_EARLY){
  window.PA_GATE_EARLY_LOCKED['studio-' + PA_GATE_EARLY] = true;
  (function(){
    var css = '#studio-studio-' + PA_GATE_EARLY + ',.studio,.pf-player-card,.pf-tab-card,nav.tool-rail,.tool-rail,.pf-float-audio,.pa-ui-now-playing{display:none !important;}';
    var st = document.createElement('style');
    st.id = 'pa-gate-early-styles';
    st.type = 'text/css';
    if(st.styleSheet){ st.styleSheet.cssText = css; } else { st.appendChild(document.createTextNode(css)); }
    document.head.appendChild(st);
  })();
}
function paGateEarlyUnlock(){
  if(!PA_GATE_EARLY) return;
  try { delete window.PA_GATE_EARLY_LOCKED['studio-' + PA_GATE_EARLY]; } catch(e){}
  var st = document.getElementById('pa-gate-early-styles');
  if(st && st.parentNode) st.parentNode.removeChild(st);
  try { if(typeof studioStartPending === 'function') studioStartPending(); } catch(e){}
}
function paGateEarlyDiscard(){
  /* Locked outcome: the gate's own hides and markers take over, so the
     early style is removed to leave one source of truth. Called only
     after paGateHide has marked the studio block. */
  var st = document.getElementById('pa-gate-early-styles');
  if(st && st.parentNode) st.parentNode.removeChild(st);
}
function paGateChapterOf(lessonId){
  var m = /^(ch\d+)s\d+$/.exec(String(lessonId || ''));
  return m ? m[1] : null;
}
function paGateCanRead(lessonId, state){
  var ch = paGateChapterOf(lessonId);
  if(!ch) return true;
  if(PA_LESSON_GATE.first[ch] === lessonId) return true;
  if(!PA_LESSON_GATE.part[ch]) return true;
  if(state && state.isAdmin) return true;
  if(state && state.owned && state.owned.integrated) return true;
  if(state && state.owned && state.owned[PA_LESSON_GATE.part[ch]]) return true;
  return false;
}
function paGateState(){
  if(PA_GATE_STATE_PROMISE) return PA_GATE_STATE_PROMISE;
  PA_GATE_STATE_PROMISE = new Promise(function(resolve){
    var sawUser = false;
    function done(isAdmin, owned, signedIn){
      var st = {isAdmin: !!isAdmin, owned: owned || {}, signedIn: !!signedIn};
      PA_GATE_RESOLVED_STATE = st;
      resolve(st);
    }
    if(typeof paAuthLoadClient !== 'function'){ done(false, {}, false); return; }
    try {
      paAuthLoadClient(function(client){
        if(!client){ done(false, {}, false); return; }
        client.auth.getSession().then(function(res){
          var user = res && res.data && res.data.session && res.data.session.user;
          if(!user){ done(false, {}, false); return; }
          sawUser = true;
          var meta = user.app_metadata || {};
          if(meta.is_admin === true){ done(true, {}, true); return; }
          return client.from('user_purchases')
            .select('product_id, expires_at, status')
            .eq('user_id', user.id)
            .then(function(resp){
              var owned = {};
              var rows = (resp && !resp.error && resp.data) || [];
              var now = Date.now();
              for(var i = 0; i < rows.length; i++){
                var row = rows[i] || {};
                if(String(row.status) !== 'active') continue;
                if(row.expires_at && Date.parse(row.expires_at) <= now) continue;
                var pid = String(row.product_id || '')
                  .replace(/^com\.paymentstraininghub\.app\./, '')
                  .replace(/\.renewal$/, '');
                if(pid) owned[pid] = true;
              }
              done(false, owned, true);
            });
        }).catch(function(){ done(false, {}, sawUser); });
      });
    } catch(e){ done(false, {}, sawUser); }
  });
  return PA_GATE_STATE_PROMISE;
}
function paGateStyles(){
  if(document.getElementById('pa-gate-styles')) return;
  var css = [
    '.pa-gate-badge{display:inline-block;flex:0 0 auto;font-size:12px;font-weight:700;line-height:1.4;padding:2px 8px;border-radius:999px;margin-left:8px;vertical-align:middle;white-space:nowrap;}',
    '.li-text .pa-gate-badge{margin:6px 0 0 0;}',
    '.pa-gate-free{background:#DCFCE7;color:#166534;border:1px solid #86EFAC;}',
    '.pa-gate-locked{background:#FEF3C7;color:#92400E;border:1px solid #FCD34D;}',
    '.pa-gate-panel{background:#0B1B30;color:#E2E8F0;border:1px solid #1E3A5F;border-radius:12px;padding:20px 24px;margin:20px 0;}',
    '.pa-gate-panel h2{color:#5EEAD4;margin:0 0 10px;font-size:20px;}',
    '.pa-gate-panel p{color:#E2E8F0;line-height:1.6;margin:0 0 12px;}',
    '.pa-gate-panel a{color:#5EEAD4;}',
    '.pa-gate-panel s{color:#94A3B8;}',
    '.pa-gate-panel .pa-gate-price b{color:#FFFFFF;font-size:19px;}',
    '.pa-gate-panel .pa-gate-buy{display:inline-block;background:#FBBF24;color:#0B1B30;border-radius:10px;padding:12px 20px;font-size:16px;font-weight:700;text-decoration:none;margin:4px 0 14px;}',
    '.pa-gate-panel .pa-gate-foot{font-size:14px;color:#CBD5E1;margin:0;}',
    '.pa-gate-panel .pa-gate-foot a{color:#5EEAD4;}'
  ].join('\n');
  var st = document.createElement('style');
  st.id = 'pa-gate-styles';
  st.type = 'text/css';
  if(st.styleSheet){ st.styleSheet.cssText = css; } else { st.appendChild(document.createTextNode(css)); }
  document.head.appendChild(st);
}
function paGateHide(el){
  try { el.style.display = 'none'; } catch(e){}
  try { el.setAttribute('data-pa-gate-hidden', '1'); } catch(e){}
}
function paGateInsertPanelAfterVisible(container, panel){
  var anchor = null;
  for(var j = container.children.length - 1; j >= 0; j--){
    var c = container.children[j];
    if(c.tagName === 'SCRIPT' || c.tagName === 'STYLE') continue;
    if(!c.getAttribute('data-pa-gate-hidden')){ anchor = c; break; }
  }
  if(anchor && anchor.nextSibling) container.insertBefore(panel, anchor.nextSibling);
  else container.appendChild(panel);
}
function paGateSilence(sampleId){
  try { if(typeof pauseAllAudio === 'function') pauseAllAudio(); } catch(e){}
  /* studioCancelAutoplay clears wantAutoplay and audioPlayWanted as
     well as disarming the retry: pausing alone lets the async setSrc
     callback and the failover path restart playback. */
  try { if(typeof studioCancelAutoplay === 'function') studioCancelAutoplay(sampleId); } catch(e){}
  try { if(typeof studioDisarmAutoplayRetry === 'function') studioDisarmAutoplayRetry(sampleId); } catch(e){}
  try {
    var a = document.getElementById('studio-audio-' + sampleId);
    if(a && a.pause) a.pause();
  } catch(e){}
}
function paGateLockPanel(lessonId, chapterId, partId, state, main){
  var part = (partId && PA_LESSON_GATE.parts[partId]) || null;
  var integ = PA_LESSON_GATE.integrated;
  var panel = document.createElement('div');
  panel.id = 'pa-gate-panel';
  panel.className = 'pa-gate-panel';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', 'Unlock the full lesson');
  var h = document.createElement('h2');
  h.textContent = 'Unlock the full lesson';
  panel.appendChild(h);
  var p1 = document.createElement('p');
  if(part){
    p1.textContent = 'This lesson is part of ' + part.name + '. Buying the course unlocks all ' + part.lessons + ' lessons in ' + part.chapters + ' chapters, with full text and audio narration, for 1 year.';
  } else {
    p1.textContent = 'This lesson is part of a course. Buying the course unlocks the full lesson, with full text and audio narration, for 1 year.';
  }
  panel.appendChild(p1);
  if(part){
    var price = document.createElement('p');
    price.className = 'pa-gate-price';
    var struck = document.createElement('s');
    struck.textContent = 'Rs. ' + Number(part.list).toLocaleString('en-IN');
    price.appendChild(struck);
    price.appendChild(document.createTextNode(' '));
    var sale = document.createElement('b');
    sale.textContent = 'Rs. ' + Number(part.sale).toLocaleString('en-IN');
    price.appendChild(sale);
    price.appendChild(document.createTextNode(' for 1 year of access.'));
    panel.appendChild(price);
  }
  var p2 = document.createElement('p');
  p2.appendChild(document.createTextNode('Want the whole library? ' + integ.name + ' unlocks all ' + integ.chapters + ' chapters and ' + integ.lessons + ' lessons for '));
  var struck2 = document.createElement('s');
  struck2.textContent = 'Rs. ' + Number(integ.list).toLocaleString('en-IN');
  p2.appendChild(struck2);
  p2.appendChild(document.createTextNode(' '));
  var sale2 = document.createElement('b');
  sale2.textContent = 'Rs. ' + Number(integ.sale).toLocaleString('en-IN');
  p2.appendChild(sale2);
  p2.appendChild(document.createTextNode('. '));
  var integLink = document.createElement('a');
  integLink.href = '/payment?bundle=integrated';
  integLink.textContent = 'See the Integrated Course';
  p2.appendChild(integLink);
  panel.appendChild(p2);
  if(part){
    var buy = document.createElement('a');
    buy.className = 'pa-gate-buy';
    buy.href = '/payment?bundle=' + encodeURIComponent(partId);
    buy.textContent = 'Buy Course ' + String(partId).replace('part-', '') + ' for Rs. ' + Number(part.sale).toLocaleString('en-IN');
    panel.appendChild(buy);
  }
  var foot = document.createElement('p');
  foot.className = 'pa-gate-foot';
  foot.appendChild(document.createTextNode('The first lesson of every chapter is free to read in full. '));
  var chLink = null;
  if(main){
    var anchors = main.querySelectorAll('a[href*="/chapters/"]');
    if(anchors && anchors.length) chLink = anchors[0].getAttribute('href');
  }
  if(chLink){
    var back = document.createElement('a');
    back.href = chLink;
    back.textContent = 'Back to the chapter';
    foot.appendChild(back);
    foot.appendChild(document.createTextNode('. '));
  }
  if(!state.signedIn){
    foot.appendChild(document.createTextNode('Already bought this course? '));
    var signin = document.createElement('a');
    var ret = '/payment';
    try {
      if(typeof paBuyPromptResolve === 'function'){ ret = paBuyPromptResolve(window.location.href) || ret; }
      else { ret = window.location.pathname + window.location.search; }
    } catch(e){}
    signin.href = '/signin?next=' + encodeURIComponent(ret);
    signin.textContent = 'Sign in to unlock it';
    foot.appendChild(signin);
    foot.appendChild(document.createTextNode('.'));
  }
  panel.appendChild(foot);
  return panel;
}
function paGateApplyToLessonPage(lessonId, state){
  var main = document.querySelector('.lesson-main');
  if(!main) return;
  if(document.getElementById('pa-gate-panel')) return;
  var chapterId = paGateChapterOf(lessonId);
  var partId = chapterId ? PA_LESSON_GATE.part[chapterId] : null;
  var contentEl = document.getElementById('pf-content-' + lessonId);
  if(!contentEl) contentEl = main.querySelector('[id^="pf-content-"]');
  var studioEl = document.getElementById('studio-studio-' + lessonId);
  if(!studioEl) studioEl = main.querySelector('.studio');
  var beatsEl = main.querySelector('ol.pf-beats');
  var beatsCard = null;
  if(beatsEl){
    beatsCard = beatsEl.parentNode;
    while(beatsCard && beatsCard !== main && !(beatsCard.classList && beatsCard.classList.contains('pf-card'))) beatsCard = beatsCard.parentNode;
    if(beatsCard === main) beatsCard = beatsEl.parentNode;
  }
  var kids = [];
  for(var i = 0; i < main.children.length; i++) kids.push(main.children[i]);
  var seenH2 = false;
  var navKeep = false;
  for(var k = 0; k < kids.length; k++){
    var el = kids[k];
    var tag = el.tagName;
    if(tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEMPLATE' || tag === 'NOSCRIPT') continue;
    if(el === contentEl) continue;
    if(el === beatsCard) continue;
    if(el === studioEl) continue;
    var cls = el.classList;
    if(cls && (cls.contains('pf-player-card') || cls.contains('pf-tab-card') || cls.contains('flow-embed') || cls.contains('rail-tool'))){
      paGateHide(el);
      continue;
    }
    if(tag === 'H2'){
      seenH2 = true;
      var next = kids[k + 1];
      var txt = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if(next === contentEl || next === beatsCard){ navKeep = false; continue; }
      if(txt === 'More in this chapter' || txt === 'Next lesson'){ navKeep = true; continue; }
      navKeep = false;
      paGateHide(el);
      continue;
    }
    if(!seenH2) continue;
    if(navKeep) continue;
    paGateHide(el);
  }
  paGateSilence('studio-' + lessonId);
  /* The tool rail sits outside .lesson-main and holds the Open
     transcript button, so hide it explicitly for locked lessons. */
  var rails = document.querySelectorAll('nav.tool-rail, .tool-rail');
  for(var r = 0; r < rails.length; r++) paGateHide(rails[r]);
  /* No transcript preview: the whole studio block (transcript, player,
     scenes, exercises, quiz, notes) stays hidden. Only the agenda
     card (which now carries the pf-content-<lesson> id) and the beats
     outline above remain visible. */
  if(studioEl) paGateHide(studioEl);
  /* The beats outline stays as what to expect, but its items must not
     act as audio jump controls: strip the seek affordance the inline
     page script binds to, so a click or keypress on a beat does
     nothing. The outline text stays visible. */
  if(beatsCard){
    var seekables = beatsCard.querySelectorAll('[data-pf-seek]');
    for(var s = 0; s < seekables.length; s++){
      var b = seekables[s];
      b.removeAttribute('data-pf-seek');
      b.removeAttribute('role');
      b.removeAttribute('tabindex');
      b.removeAttribute('aria-label');
    }
    /* Titles only: each beat description is the opening sentence of
       the narration, so remove it on locked lessons. The beat title
       stays as the outline. Hidden marker spans are left alone. */
    var beatItems = beatsCard.querySelectorAll('.pf-beat');
    for(var bi = 0; bi < beatItems.length; bi++){
      var titleEl = beatItems[bi].querySelector('.pf-beat-title');
      if(!titleEl || !titleEl.parentNode) continue;
      var beatParent = titleEl.parentNode;
      var beatKids = [];
      for(var ci = 0; ci < beatParent.childNodes.length; ci++) beatKids.push(beatParent.childNodes[ci]);
      var pastTitle = false;
      for(var cj = 0; cj < beatKids.length; cj++){
        var n = beatKids[cj];
        if(n === titleEl){ pastTitle = true; continue; }
        if(!pastTitle) continue;
        if(n.nodeType === 1 && n.tagName === 'BR'){ beatParent.removeChild(n); continue; }
        if(n.nodeType === 1 && n.tagName === 'SPAN' && !n.hasAttribute('hidden')){ beatParent.removeChild(n); }
        break;
      }
    }
  }
  paGateEarlyDiscard();
  var panel = paGateLockPanel(lessonId, chapterId, partId, state, main);
  if(studioEl && studioEl.parentNode) studioEl.parentNode.insertBefore(panel, studioEl);
  else if(contentEl) paGateInsertPanelAfterVisible(contentEl, panel);
  else main.appendChild(panel);
}
function paGateBadgeLessonLinks(state){
  paGateStyles();
  var links = document.querySelectorAll('a[href]');
  for(var i = 0; i < links.length; i++){
    var a = links[i];
    if(a.getAttribute('data-pa-gate')) continue;
    var href = a.getAttribute('href') || '';
    if(!href || href.charAt(0) === '#') continue;
    var lessonId = null;
    var dl = a.getAttribute('data-lesson');
    if(dl && /^ch\d+s\d+$/.test(dl)) lessonId = dl;
    if(!lessonId){
      try {
        var u = new URL(href, window.location.href);
        if(u.protocol !== 'http:' && u.protocol !== 'https:') continue;
        var m = /\/lessons\/(ch\d+s\d+)(?:\.html)?$/.exec(u.pathname);
        if(m) lessonId = m[1];
      } catch(e){ continue; }
    }
    if(!lessonId) continue;
    var ch = paGateChapterOf(lessonId);
    if(!ch || !PA_LESSON_GATE.first[ch]) continue;
    var locked = !paGateCanRead(lessonId, state);
    var badge = null, cls = null;
    if(locked){ badge = 'Locked'; cls = 'pa-gate-locked'; }
    else if(PA_LESSON_GATE.first[ch] === lessonId){ badge = 'Free'; cls = 'pa-gate-free'; }
    else continue;
    a.setAttribute('data-pa-gate', locked ? 'locked' : 'free');
    var s = document.createElement('span');
    s.className = 'pa-gate-badge ' + cls;
    s.textContent = badge;
    /* Badge placement (17 Nov 2026, badge layout fix): the badge must
       never be a flex item competing with the lesson title. In the
       side panel and sidebar rows the link is display:flex and the
       title block shrinks to min-width 0 with overflow-wrap anywhere,
       so a nowrap badge appended to the link starved the title to one
       letter per line. The badge goes inside the title block instead
       (.li-text in the side panel, .t in the sidebar), where it flows
       under or after the title without taking row width. Links with
       no title block (chapter rows, search results, More in this
       chapter) are not flex rows, so the link itself stays the host. */
    var host = a.querySelector('.li-text') || a.querySelector('.t') || a;
    host.appendChild(s);
  }
}
function paGateInit(){
  var lessonId = null;
  try {
    var m = /\/lessons\/(ch\d+s\d+)/.exec(window.location.pathname || '');
    if(m) lessonId = m[1];
  } catch(e){}
  function apply(state){
    paGateStyles();
    var unlocked = !lessonId || paGateCanRead(lessonId, state);
    if(lessonId && !unlocked) paGateApplyToLessonPage(lessonId, state);
    else if(lessonId) paGateEarlyUnlock();
    paGateBadgeLessonLinks(state);
    setTimeout(function(){ try { paGateBadgeLessonLinks(state); } catch(e){} }, 1500);
    try { paStyleAfterGate(lessonId, unlocked); } catch(e){}
  }
  var signedOut = false;
  try {
    if(typeof paBuyPromptHasSession === 'function') signedOut = !paBuyPromptHasSession();
    else {
      var raw = null;
      try { raw = localStorage.getItem('sb-eofsotgclhwsdwvbbtib-auth-token'); } catch(e2){}
      signedOut = !raw;
    }
  } catch(e){ signedOut = false; }
  if(signedOut){ apply({isAdmin: false, owned: {}, signedIn: false}); return; }
  paGateState().then(apply);
}
document.addEventListener('DOMContentLoaded', paGateInit);

/* ===== Learner-chosen lesson style (17 Nov 2026) ===== */
/* The learner picks List or Canvas once, with an example preview of each
   style, at the start of a chapter. The choice is kept in localStorage
   (no server change) and the toggle at the top of every lesson page
   switches styles at any time. Only visibility classes change: the
   audio element is never touched, so playback and position survive a
   style switch. Locked lessons never see this UI: the style class and
   the toggle/picker appear only after the gate resolves to unlocked
   (see paStyleAfterGate, called from paGateInit). Before the gate
   resolves, lesson pages provisionally show the safe default (list),
   which matches the locked outline; a saved canvas preference applies
   only after access is confirmed. No lesson content is changed here.
   The side panel option shares the playback-hide contract with
   assets/pf-enhance.js: the key pa-ui-hide-panel-while-playing and the
   body marker class pa-ui-rail-playback-hidden. */
var PA_STYLE_KEY = 'pa-ui-lesson-style';
var PA_STYLE_PANEL_KEY = 'pa-ui-hide-panel-while-playing';
function paStyleLsGet(k){ try { return window.localStorage.getItem(k); } catch(e){ return null; } }
function paStyleLsSet(k, v){ try { window.localStorage.setItem(k, v); } catch(e){} }
function paStyleGet(){ var v = paStyleLsGet(PA_STYLE_KEY); return (v === 'canvas' || v === 'list') ? v : null; }
function paStylePath(){ try { return window.location.pathname || ''; } catch(e){ return ''; } }
function paStyleIsLesson(){ return paStylePath().indexOf('/lessons/') !== -1; }
function paStyleIsChapter(){ return paStylePath().indexOf('/chapters/') !== -1; }
function paStyleEl(tag, cls, text){ var el = document.createElement(tag); if(cls) el.className = cls; if(text) el.textContent = text; return el; }
function paStyleMarkFlows(){
  try {
    var main = document.querySelector('.lesson-main');
    if(!main) return;
    var beats = main.querySelector('ol.pf-beats');
    if(beats){
      var card = beats.parentNode;
      while(card && card !== main && !(card.classList && card.classList.contains('pf-card'))) card = card.parentNode;
      if(card && card !== main) card.classList.add('pf-flows-card');
    }
    var heads = main.querySelectorAll('h2');
    for(var i = 0; i < heads.length; i++){
      if(heads[i].textContent === 'How it flows') heads[i].classList.add('pf-flows-header');
    }
  } catch(e){}
}
function paStyleRefreshStudio(){
  try {
    if(typeof studioRefresh !== 'function') return;
    var el = document.querySelector('.lesson-main .studio');
    if(!el || !el.id) return;
    var id = el.id;
    if(id.indexOf('studio-') === 0) id = id.substring(7);
    studioRefresh(id);
  } catch(e){}
}
function paStyleApply(style){
  try {
    document.body.classList.remove('pf-style-list', 'pf-style-canvas');
    document.body.classList.add(style === 'canvas' ? 'pf-style-canvas' : 'pf-style-list');
    var btns = document.querySelectorAll('.pf-style-toggle button');
    for(var i = 0; i < btns.length; i++){
      btns[i].setAttribute('aria-pressed', btns[i].getAttribute('data-pf-style') === style ? 'true' : 'false');
    }
    if(style === 'canvas') paStyleRefreshStudio();
  } catch(e){}
}
function paStyleChoose(style){
  paStyleLsSet(PA_STYLE_KEY, style);
  paStyleApply(style);
  try {
    var picker = document.querySelector('.pf-style-picker');
    if(picker && picker.parentNode) picker.parentNode.removeChild(picker);
  } catch(e){}
}
function paStyleAnyMediaPlaying(){
  try {
    var m = document.querySelectorAll('audio, video');
    for(var i = 0; i < m.length; i++){ if(!m[i].paused && !m[i].ended) return true; }
  } catch(e){}
  return false;
}
function paStylePanelOptChanged(on){
  paStyleLsSet(PA_STYLE_PANEL_KEY, on ? '1' : '0');
  try {
    if(!on){
      if(document.body.classList.contains('pa-ui-rail-playback-hidden')){
        document.body.classList.remove('pa-ui-rail-playback-hidden');
        document.body.classList.remove('pa-ui-rail-hidden');
      }
    } else if(paStyleAnyMediaPlaying() && paStyleLsGet('pa-ui-rail-hidden') !== '1'){
      document.body.classList.add('pa-ui-rail-hidden');
      document.body.classList.add('pa-ui-rail-playback-hidden');
    }
  } catch(e){}
}
function paStyleBuildBar(){
  try {
    if(document.querySelector('.pf-style-bar')) return;
    var main = document.querySelector('.lesson-main');
    if(!main) return;
    var bar = paStyleEl('div', 'pf-style-bar');
    var toggle = paStyleEl('div', 'pf-style-toggle');
    toggle.setAttribute('role', 'group');
    toggle.setAttribute('aria-label', 'Lesson style');
    var cur = paStyleGet() || 'list';
    var listBtn = paStyleEl('button', null, 'List');
    listBtn.type = 'button';
    listBtn.setAttribute('data-pf-style', 'list');
    listBtn.setAttribute('aria-pressed', cur === 'list' ? 'true' : 'false');
    listBtn.addEventListener('click', function(){ paStyleChoose('list'); });
    var canvasBtn = paStyleEl('button', null, 'Canvas');
    canvasBtn.type = 'button';
    canvasBtn.setAttribute('data-pf-style', 'canvas');
    canvasBtn.setAttribute('aria-pressed', cur === 'canvas' ? 'true' : 'false');
    canvasBtn.addEventListener('click', function(){ paStyleChoose('canvas'); });
    toggle.appendChild(listBtn);
    toggle.appendChild(canvasBtn);
    bar.appendChild(toggle);
    var opt = paStyleEl('label', 'pf-panel-hide-opt');
    var box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = paStyleLsGet(PA_STYLE_PANEL_KEY) !== '0';
    box.addEventListener('change', function(){ paStylePanelOptChanged(box.checked); });
    opt.appendChild(box);
    opt.appendChild(document.createTextNode('Hide side panel while playing'));
    bar.appendChild(opt);
    main.insertBefore(bar, main.firstChild);
  } catch(e){}
}
function paStyleBuildOption(style, name, desc){
  var btn = paStyleEl('button', 'pf-style-option');
  btn.type = 'button';
  var prev;
  var i;
  if(style === 'list'){
    prev = paStyleEl('div', 'pf-style-preview-list');
    for(i = 0; i < 4; i++) prev.appendChild(paStyleEl('span', i === 1 ? 'pf-on' : null));
  } else {
    prev = paStyleEl('div', 'pf-style-preview-canvas');
    for(i = 0; i < 3; i++) prev.appendChild(paStyleEl('span', i === 0 ? 'pf-on' : null));
  }
  prev.setAttribute('aria-hidden', 'true');
  btn.appendChild(prev);
  btn.appendChild(paStyleEl('div', 'pf-style-option-name', name));
  btn.appendChild(paStyleEl('div', 'pf-style-option-desc', desc));
  btn.addEventListener('click', function(){ paStyleChoose(style); });
  return btn;
}
function paStyleBuildPicker(host, beforeNode){
  try {
    if(document.querySelector('.pf-style-picker')) return;
    if(paStyleGet()) return;
    var picker = paStyleEl('div', 'pf-style-picker');
    picker.appendChild(paStyleEl('h2', 'pf-style-picker-title', 'How would you like to view lessons?'));
    picker.appendChild(paStyleEl('p', 'pf-style-picker-sub', 'Pick a style. You can switch any time with the List and Canvas toggle at the top of a lesson.'));
    var opts = paStyleEl('div', 'pf-style-options');
    opts.appendChild(paStyleBuildOption('list', 'List', 'The lesson steps in a list, with the player card and the full text below.'));
    opts.appendChild(paStyleBuildOption('canvas', 'Canvas', 'Visual scenes that follow the narration, in the Studio player.'));
    picker.appendChild(opts);
    if(beforeNode) host.insertBefore(picker, beforeNode);
    else host.appendChild(picker);
  } catch(e){}
}
function paStyleChapterPicker(){
  try {
    if(!paStyleIsChapter()) return;
    if(paStyleGet()) return;
    var main = document.querySelector('main');
    if(!main) return;
    var before = main.firstChild;
    var h1 = main.querySelector('h1');
    if(h1){
      var card = h1.parentNode;
      while(card && card !== main && !(card.classList && card.classList.contains('pf-card'))) card = card.parentNode;
      if(card && card !== main && card.nextSibling) before = card.nextSibling;
    }
    paStyleBuildPicker(main, before);
  } catch(e){}
}
function paStyleLessonPicker(){
  try {
    if(paStyleGet()) return;
    var main = document.querySelector('.lesson-main');
    if(!main) return;
    var bar = main.querySelector('.pf-style-bar');
    paStyleBuildPicker(main, bar ? bar.nextSibling : main.firstChild);
  } catch(e){}
}
function paStyleAfterGate(lessonId, unlocked){
  if(!lessonId) return;
  paStyleMarkFlows();
  if(!unlocked){
    try { document.body.classList.remove('pf-style-list', 'pf-style-canvas'); } catch(e){}
    return;
  }
  paStyleApply(paStyleGet() || 'list');
  paStyleBuildBar();
  paStyleLessonPicker();
}
(function paStyleProvisional(){
  try {
    if(paStyleIsLesson()){
      paStyleMarkFlows();
      if(paStyleGet() !== 'canvas') document.body.classList.add('pf-style-list');
    } else if(paStyleIsChapter()){
      paStyleChapterPicker();
    }
  } catch(e){}
})();
