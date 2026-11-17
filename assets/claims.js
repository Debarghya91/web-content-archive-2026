/* ===== Payment claims review (site owner only) ===== */
/* Lists pending UPI payment claims and lets the admin verify or
   reject each one through the verify-upi-claim Edge Function.
   Verifying records the purchase (1 year of access). The page
   shows nothing to anyone but the admin: the signed-in user must
   carry app_metadata.is_admin, and the server re-checks it. The
   pending list reads through PostgREST under the admin-read RLS
   policy; without that policy the list comes back empty. */
var PA_CLAIMS_VERIFY_URL = 'https://eofsotgclhwsdwvbbtib.supabase.co/functions/v1/verify-upi-claim';
var PA_CLAIMS_TOKEN = '';
function paClaimsSetStatus(msg){
  var el = document.getElementById('pa-claims-status');
  if(el) el.textContent = msg || '';
}
function paClaimsEl(tag, text, cls){
  var el = document.createElement(tag);
  if(cls) el.className = cls;
  if(text != null) el.textContent = text;
  return el;
}
function paClaimsRest(path){
  var url = String(PA_AUTH_CONFIG.supabaseUrl).replace(/\/+$/, '') + path;
  return fetch(url, {headers: {'apikey': PA_AUTH_CONFIG.supabaseAnonKey, 'Authorization': 'Bearer ' + PA_CLAIMS_TOKEN, 'Accept': 'application/json'}})
    .then(function(r){ return r.ok ? r.json() : null; });
}
function paClaimsShortProduct(pid){
  return String(pid || '').replace('com.paymentstraininghub.app.', '');
}
function paClaimsDate(iso){
  var d = iso ? new Date(iso) : null;
  return (d && !isNaN(d.getTime())) ? d.toLocaleString('en-IN') : '';
}
function paClaimsDecide(claimId, decision, refInput, btn){
  var ref = refInput ? String(refInput.value || '').trim().slice(0, 120) : '';
  if(btn) btn.disabled = true;
  paClaimsSetStatus(decision === 'verified' ? 'Verifying the claim.' : 'Rejecting the claim.');
  fetch(PA_CLAIMS_VERIFY_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + PA_CLAIMS_TOKEN},
    body: JSON.stringify({claim_id: claimId, decision: decision, admin_reference: ref || undefined})
  }).then(function(r){
    return r.json().then(function(data){ return {ok: r.ok, data: data}; }).catch(function(){ return {ok: r.ok, data: null}; });
  }).then(function(res){
    if(!res.ok){
      paClaimsSetStatus('Could not decide the claim: ' + ((res.data && res.data.error) || 'please try again.'));
      if(btn) btn.disabled = false;
      return;
    }
    var msg = decision === 'verified' ? 'Claim verified. The purchase is recorded.' : 'Claim rejected. Nothing was recorded.';
    if(res.data && res.data.warning) msg += ' ' + res.data.warning;
    paClaimsSetStatus(msg);
    paClaimsLoad();
  }).catch(function(){
    paClaimsSetStatus('Could not decide the claim. Check your connection and try again.');
    if(btn) btn.disabled = false;
  });
}
function paClaimsRenderPending(rows){
  var host = document.getElementById('pa-claims-list');
  if(!host) return;
  host.innerHTML = '';
  if(!rows || !rows.length){
    host.appendChild(paClaimsEl('p', 'No pending claims.', 'pa-pay-note'));
    return;
  }
  rows.forEach(function(row){
    var card = paClaimsEl('div', null, 'pa-pay-section');
    card.appendChild(paClaimsEl('h3', paClaimsShortProduct(row.product_id) + '  Rs ' + Number(row.amount).toLocaleString('en-IN')));
    card.appendChild(paClaimsEl('p', 'UTR: ' + String(row.utr || '')));
    if(row.payer_name) card.appendChild(paClaimsEl('p', 'Payer name: ' + String(row.payer_name)));
    card.appendChild(paClaimsEl('p', 'Submitted ' + paClaimsDate(row.submitted_at) + '  Claim id: ' + String(row.id || ''), 'pa-pay-note'));
    var refLabel = paClaimsEl('label', 'Admin reference (optional, e.g. bank reference)');
    refLabel.setAttribute('for', 'pa-claim-ref-' + String(row.id));
    card.appendChild(refLabel);
    var ref = document.createElement('input');
    ref.type = 'text';
    ref.id = 'pa-claim-ref-' + String(row.id);
    ref.className = 'pa-claim-ref';
    ref.placeholder = 'Bank reference or note';
    card.appendChild(ref);
    var rowBtns = paClaimsEl('p', null, null);
    var verifyBtn = paClaimsEl('button', 'Verify payment', 'pf-btn-gold studio-btn primary');
    verifyBtn.type = 'button';
    var rejectBtn = paClaimsEl('button', 'Reject', 'studio-btn');
    rejectBtn.type = 'button';
    (function(claimId, refEl, vBtn, rBtn){
      vBtn.addEventListener('click', function(){ paClaimsDecide(claimId, 'verified', refEl, vBtn); });
      rBtn.addEventListener('click', function(){ paClaimsDecide(claimId, 'rejected', refEl, rBtn); });
    })(row.id, ref, verifyBtn, rejectBtn);
    rowBtns.appendChild(verifyBtn);
    rowBtns.appendChild(document.createTextNode(' '));
    rowBtns.appendChild(rejectBtn);
    card.appendChild(rowBtns);
    host.appendChild(card);
  });
}
function paClaimsRenderDecided(rows){
  var host = document.getElementById('pa-claims-decided');
  if(!host) return;
  host.innerHTML = '';
  if(!rows || !rows.length) return;
  host.appendChild(paClaimsEl('h2', 'Recently decided', 'pf-section-header'));
  rows.forEach(function(row){
    var div = paClaimsEl('div', null, 'pa-upi-claim');
    div.appendChild(paClaimsEl('p', paClaimsShortProduct(row.product_id) + '  Rs ' + Number(row.amount).toLocaleString('en-IN') + '  ' + String(row.status || '')));
    div.appendChild(paClaimsEl('p', 'UTR: ' + String(row.utr || '') + '  Submitted ' + paClaimsDate(row.submitted_at), 'pa-pay-note'));
    host.appendChild(div);
  });
}
function paClaimsLoad(){
  paClaimsSetStatus('Loading claims.');
  paClaimsRest('/rest/v1/payment_claims?select=id,user_id,product_id,amount,utr,payer_name,status,submitted_at&status=eq.pending&order=submitted_at.asc')
    .then(function(rows){
      paClaimsRenderPending(rows);
      return paClaimsRest('/rest/v1/payment_claims?select=id,product_id,amount,utr,status,submitted_at&status=in.(verified,rejected)&order=submitted_at.desc&limit=20');
    })
    .then(function(rows){
      paClaimsRenderDecided(rows);
      paClaimsSetStatus('');
    })
    .catch(function(){ paClaimsSetStatus('Could not load claims. Check your connection and try again.'); });
}
function paClaimsInit(){
  if(!document.getElementById('pa-claims-list')) return;
  if(typeof paAuthLoadClient !== 'function' || typeof PA_AUTH_CONFIG === 'undefined'){
    paClaimsSetStatus('Sign-in is not available. Please try again later.');
    return;
  }
  paClaimsSetStatus('Checking your sign-in.');
  paAuthLoadClient(function(client){
    if(!client){ paClaimsSetStatus('Could not load sign-in. Check your connection and try again.'); return; }
    client.auth.getSession().then(function(res){
      var session = res && res.data && res.data.session;
      var user = session && session.user;
      if(!user){
        paClaimsSetStatus('Sign in first.');
        var link = document.getElementById('pa-claims-signin');
        if(link) link.style.display = 'block';
        return;
      }
      var meta = user.app_metadata || {};
      if(meta.is_admin !== true){
        paClaimsSetStatus('This page is for the site owner only.');
        return;
      }
      PA_CLAIMS_TOKEN = session.access_token || '';
      paClaimsLoad();
    }).catch(function(){ paClaimsSetStatus('Could not check your sign-in. Please try again.'); });
  });
}
document.addEventListener('DOMContentLoaded', paClaimsInit);
