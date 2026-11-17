/* ===== Referral network opt-in (dashboard) ===== */
/* Lets a signed-in learner join the referral network WhatsApp
   group: one tickbox, then the contact details they are
   comfortable sharing (WhatsApp number, LinkedIn ID, mobile
   number). Every field is optional; the login email is stored
   with the row so the owner can always reach the learner.
   One row per learner in public.referral_network_optins, written
   through PostgREST under the own-row RLS policies. Unticking
   and saving withdraws: opted_in becomes false and the contact
   fields are cleared. Only the site owner can read the list
   (referral-network-admin.html, admin policy). */
var PA_REFNET_HAS_ROW = false;
var PA_REFNET_TOKEN = '';
var PA_REFNET_USER_ID = '';
var PA_REFNET_EMAIL = '';
function paRefnetSetStatus(msg){
  var el = document.getElementById('pa-refnet-status');
  if(el) el.textContent = msg || '';
}
function paRefnetClean(value){
  var v = String(value == null ? '' : value).trim();
  if(v.length > 100) v = v.slice(0, 100);
  return v || null;
}
function paRefnetToggleFields(){
  var box = document.getElementById('pa-refnet-optin');
  var fields = document.getElementById('pa-refnet-fields');
  if(fields) fields.style.display = (box && box.checked) ? 'block' : 'none';
}
function paRefnetShowForm(show){
  var form = document.getElementById('pa-refnet-form');
  var note = document.getElementById('pa-refnet-signin');
  if(form) form.style.display = show ? 'block' : 'none';
  if(note) note.style.display = show ? 'none' : 'block';
}
function paRefnetFill(row){
  var box = document.getElementById('pa-refnet-optin');
  var wa = document.getElementById('pa-refnet-whatsapp');
  var li = document.getElementById('pa-refnet-linkedin');
  var mo = document.getElementById('pa-refnet-mobile');
  if(box) box.checked = !!(row && row.opted_in);
  if(wa) wa.value = (row && row.whatsapp_number) || '';
  if(li) li.value = (row && row.linkedin_id) || '';
  if(mo) mo.value = (row && row.mobile_number) || '';
  paRefnetToggleFields();
}
function paRefnetLoad(){
  var url = String(PA_AUTH_CONFIG.supabaseUrl).replace(/\/+$/, '') +
    '/rest/v1/referral_network_optins?select=opted_in,whatsapp_number,linkedin_id,mobile_number&user_id=eq.' + encodeURIComponent(PA_REFNET_USER_ID);
  fetch(url, {headers: {'apikey': PA_AUTH_CONFIG.supabaseAnonKey, 'Authorization': 'Bearer ' + PA_REFNET_TOKEN, 'Accept': 'application/json'}})
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(rows){
      if(rows && rows.length){
        PA_REFNET_HAS_ROW = true;
        paRefnetFill(rows[0]);
      } else {
        paRefnetFill(null);
      }
      paRefnetSetStatus('');
    })
    .catch(function(){ paRefnetSetStatus('Could not load your current choice. You can still save below.'); });
}
function paRefnetSave(){
  var btn = document.getElementById('pa-refnet-save');
  var box = document.getElementById('pa-refnet-optin');
  if(btn) btn.disabled = true;
  paRefnetSetStatus('Saving.');
  var opted = !!(box && box.checked);
  var body = {
    user_id: PA_REFNET_USER_ID,
    email: PA_REFNET_EMAIL,
    opted_in: opted,
    whatsapp_number: opted ? paRefnetClean(document.getElementById('pa-refnet-whatsapp').value) : null,
    linkedin_id: opted ? paRefnetClean(document.getElementById('pa-refnet-linkedin').value) : null,
    mobile_number: opted ? paRefnetClean(document.getElementById('pa-refnet-mobile').value) : null,
    updated_at: new Date().toISOString()
  };
  var base = String(PA_AUTH_CONFIG.supabaseUrl).replace(/\/+$/, '') + '/rest/v1/referral_network_optins';
  var headers = {'apikey': PA_AUTH_CONFIG.supabaseAnonKey, 'Authorization': 'Bearer ' + PA_REFNET_TOKEN, 'Content-Type': 'application/json', 'Accept': 'application/json'};
  function done(ok){
    if(btn) btn.disabled = false;
    if(ok){
      PA_REFNET_HAS_ROW = true;
      paRefnetSetStatus(opted ? 'Saved. You are on the list for the referral network WhatsApp group.' : 'Saved. You are withdrawn and your details were cleared.');
    } else {
      paRefnetSetStatus('Could not save. Check your connection and try again.');
    }
  }
  function patch(){
    return fetch(base + '?user_id=eq.' + encodeURIComponent(PA_REFNET_USER_ID), {method: 'PATCH', headers: headers, body: JSON.stringify(body)})
      .then(function(r){ done(r.ok); }).catch(function(){ done(false); });
  }
  if(PA_REFNET_HAS_ROW){
    patch();
  } else {
    fetch(base, {method: 'POST', headers: headers, body: JSON.stringify(body)})
      .then(function(r){
        if(r.ok){ done(true); return; }
        if(r.status === 409){ patch(); return; }
        done(false);
      }).catch(function(){ done(false); });
  }
}
function paRefnetInit(){
  if(!document.getElementById('pa-refnet-card')) return;
  var box = document.getElementById('pa-refnet-optin');
  var btn = document.getElementById('pa-refnet-save');
  if(box) box.addEventListener('change', paRefnetToggleFields);
  if(btn) btn.addEventListener('click', paRefnetSave);
  paRefnetShowForm(false);
  if(typeof paAuthHasStoredSession !== 'function' || !paAuthHasStoredSession()) return;
  if(typeof paAuthLoadClient !== 'function' || typeof PA_AUTH_CONFIG === 'undefined') return;
  paAuthLoadClient(function(client){
    if(!client) return;
    client.auth.getSession().then(function(res){
      var session = res && res.data && res.data.session;
      var user = session && session.user;
      if(!user) return;
      PA_REFNET_TOKEN = session.access_token || '';
      PA_REFNET_USER_ID = user.id || '';
      PA_REFNET_EMAIL = user.email || '';
      if(!PA_REFNET_USER_ID) return;
      paRefnetShowForm(true);
      paRefnetSetStatus('Loading your current choice.');
      paRefnetLoad();
    }).catch(function(){});
  });
}
document.addEventListener('DOMContentLoaded', paRefnetInit);
