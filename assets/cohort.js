/* ===== Free cohort session registration ===== */
/* Registers a signed-in learner for the free live cohort
   session through the record-cohort-registration Edge Function.
   Registration requires sign-in: the sign-in prompt appears
   only when the Register button is tapped, never before. The
   function records the login email from the verified JWT, so
   joining details can be emailed before the session. The
   session is free and grants no course access. */
var PA_COHORT_ID = 'intro-payments-ba-2026-11-28';
var PA_COHORT_REGISTER_URL = 'https://eofsotgclhwsdwvbbtib.supabase.co/functions/v1/record-cohort-registration';
function paCohortSetStatus(msg){
  var el = document.getElementById('pa-cohort-status');
  if(el) el.textContent = msg || '';
}
function paCohortShowRegistered(email){
  var btn = document.getElementById('pa-cohort-register');
  if(btn){ btn.disabled = true; btn.textContent = 'You are registered'; }
  paCohortSetStatus('You are registered. Joining details will be emailed to ' + String(email || 'your login email') + ' before the session.');
}
function paCohortCall(token, method){
  var url = PA_COHORT_REGISTER_URL;
  var opts = {method: method, headers: {'apikey': PA_AUTH_CONFIG.supabaseAnonKey, 'Authorization': 'Bearer ' + token, 'Accept': 'application/json'}};
  if(method === 'POST'){
    url = url;
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify({cohort_id: PA_COHORT_ID});
  } else {
    url = url + '?cohort_id=' + encodeURIComponent(PA_COHORT_ID);
  }
  return fetch(url, opts).then(function(r){
    return r.json().then(function(data){ return {ok: r.ok, data: data}; }).catch(function(){ return {ok: r.ok, data: null}; });
  });
}
function paCohortRegister(){
  var btn = document.getElementById('pa-cohort-register');
  if(typeof paAuthLoadClient !== 'function' || typeof PA_AUTH_CONFIG === 'undefined'){
    paCohortSetStatus('Sign-in is not available. Please try again later.');
    return;
  }
  if(btn) btn.disabled = true;
  paCohortSetStatus('Checking your sign-in.');
  paAuthLoadClient(function(client){
    if(!client){
      paCohortSetStatus('Could not load sign-in. Check your connection and try again.');
      if(btn) btn.disabled = false;
      return;
    }
    client.auth.getSession().then(function(res){
      var session = res && res.data && res.data.session;
      var user = session && session.user;
      if(!user){
        paCohortSetStatus('Sign in to reserve your free seat.');
        window.location.href = '/signin?next=' + encodeURIComponent('/cohort');
        return;
      }
      paCohortSetStatus('Reserving your free seat.');
      return paCohortCall(session.access_token || '', 'POST').then(function(res2){
        if(!res2.ok){
          paCohortSetStatus('Could not reserve your seat: ' + ((res2.data && res2.data.error) || 'please try again.'));
          if(btn) btn.disabled = false;
          return;
        }
        paCohortShowRegistered(user.email || '');
      });
    }).catch(function(){
      paCohortSetStatus('Could not check your sign-in. Please try again.');
      if(btn) btn.disabled = false;
    });
  });
}
function paCohortCheckStatus(){
  /* Signed-in visitors only: if a stored session exists, ask
     the function whether this learner is already registered,
     so the button shows the right state. Signed-out visitors
     get no prompt and no call. */
  if(typeof paAuthHasStoredSession !== 'function' || !paAuthHasStoredSession()) return;
  if(typeof paAuthLoadClient !== 'function' || typeof PA_AUTH_CONFIG === 'undefined') return;
  paAuthLoadClient(function(client){
    if(!client) return;
    client.auth.getSession().then(function(res){
      var session = res && res.data && res.data.session;
      var user = session && session.user;
      if(!user) return;
      return paCohortCall(session.access_token || '', 'GET').then(function(res2){
        if(res2.ok && res2.data && res2.data.registered){
          paCohortShowRegistered(user.email || '');
        }
      });
    }).catch(function(){});
  });
}
function paCohortInit(){
  var btn = document.getElementById('pa-cohort-register');
  if(!btn) return;
  btn.addEventListener('click', paCohortRegister);
  paCohortCheckStatus();
}
document.addEventListener('DOMContentLoaded', paCohortInit);
