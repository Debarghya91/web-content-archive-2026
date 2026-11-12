
/* ===== Supabase Auth (dashboard sign-in only) ===== */
/* Sign-in exists only for the learner dashboard: it saves progress to
   the learner's account so it syncs across devices. Lessons and the
   homepage stay open to everyone. No access enforcement, no paywall. */
var PA_AUTH_CONFIG = {
  enabled: true,
  supabaseUrl: 'https://eofsotgclhwsdwvbbtib.supabase.co',
  supabaseAnonKey: 'sb_publishable_4d5gOEpkTOMp7NadcV9ErA_Ujcc2ahU'
};
var paSupabase = null;
/* One Supabase script load, shared by every caller. Callers that arrive
   while the script is loading queue up instead of appending a second
   script tag (the old code appended one per caller, creating several
   clients on the post-login dashboard load). On any failure the queued
   callbacks get null, so no caller waits forever: the dashboard falls
   back to its sign-in prompt instead of hanging on "Checking your
   sign-in status." */
var paAuthLoadQueue = null;
function paAuthLoadClient(callback){
  if(!PA_AUTH_CONFIG.enabled || !PA_AUTH_CONFIG.supabaseUrl || !PA_AUTH_CONFIG.supabaseAnonKey){ if(callback) callback(null); return; }
  if(paSupabase){ if(callback) callback(paSupabase); return; }
  if(window.supabase && window.supabase.createClient){
    try { paSupabase = window.supabase.createClient(PA_AUTH_CONFIG.supabaseUrl, PA_AUTH_CONFIG.supabaseAnonKey); }
    catch(e){ if(callback) callback(null); return; }
    if(callback) callback(paSupabase); return;
  }
  if(paAuthLoadQueue){ if(callback) paAuthLoadQueue.push(callback); return; }
  paAuthLoadQueue = callback ? [callback] : [];
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  function paAuthLoadFinish(client){
    var q = paAuthLoadQueue; paAuthLoadQueue = null;
    if(client) paAuthRefreshState();
    q.forEach(function(cb){ try { cb(client); } catch(e){} });
  }
  s.onload = function(){
    if(!window.supabase || !window.supabase.createClient){ paAuthLoadFinish(null); return; }
    try { paSupabase = window.supabase.createClient(PA_AUTH_CONFIG.supabaseUrl, PA_AUTH_CONFIG.supabaseAnonKey); }
    catch(e){ paSupabase = null; paAuthLoadFinish(null); return; }
    paAuthLoadFinish(paSupabase);
  };
  s.onerror = function(){ paAuthLoadFinish(null); };
  document.head.appendChild(s);
}
function paAuthHasStoredSession(){
  try {
    var raw = localStorage.getItem('sb-eofsotgclhwsdwvbbtib-auth-token');
    if(!raw) return false;
    var data = JSON.parse(raw);
    return !!(data && data.access_token);
  } catch(e){ return false; }
}
function paAuthShowUI(){
  if(!PA_AUTH_CONFIG.enabled) return;
  var box = document.getElementById('authBox');
  if(box) box.style.display = 'inline-block';
}
function paAuthShowSignedOut(){
  var st = document.getElementById('authState');
  var inLink = document.getElementById('authSignInLink');
  var dash = document.getElementById('authDashLink');
  var out = document.getElementById('authSignOutBtn');
  if(st) st.textContent = 'Not signed in';
  if(inLink) inLink.style.display = 'inline';
  if(dash) dash.style.display = 'none';
  if(out) out.style.display = 'none';
}
function paAuthRefreshState(){
  if(!PA_AUTH_CONFIG.enabled) return;
  paAuthLoadClient(function(client){
    if(!client){ paAuthShowSignedOut(); return; }
    client.auth.getSession().then(function(res){
      var user = res.data && res.data.session && res.data.session.user;
      var st = document.getElementById('authState');
      var inLink = document.getElementById('authSignInLink');
      var dash = document.getElementById('authDashLink');
      var out = document.getElementById('authSignOutBtn');
      if(user){
        if(st) st.textContent = 'Signed in: ' + (user.email || '');
        if(inLink) inLink.style.display = 'none';
        if(dash) dash.style.display = 'inline';
        if(out) out.style.display = 'inline-block';
      } else {
        paAuthShowSignedOut();
      }
    }).catch(function(){ paAuthShowSignedOut(); });
  });
}
/* One OTP request at a time: a double tap used to send two codes, and
   only the newest code worked, so the first code the learner typed
   failed. The flag clears on every outcome, success or failure. */
var paAuthOtpBusy = false;
function paAuthSendOtp(){
  if(!PA_AUTH_CONFIG.enabled || paAuthOtpBusy) return;
  var email = ((document.getElementById('authEmail') || {}).value || '').trim();
  if(!email || email.indexOf('@') === -1){ alert('Enter a valid email first.'); return; }
  paAuthOtpBusy = true;
  paAuthLoadClient(function(client){
    if(!client){ paAuthOtpBusy = false; alert('The sign-in service could not be reached. Check your connection and try again.'); return; }
    client.auth.signInWithOtp({ email: email }).then(function(res){
      paAuthOtpBusy = false;
      if(res.error){ alert('Could not send the code: ' + res.error.message); return; }
      var code = document.getElementById('authCode');
      var vb = document.getElementById('authVerifyBtn');
      if(code) code.style.display = 'inline-block';
      if(vb) vb.style.display = 'inline-block';
      alert('Code sent to ' + email + '. Enter it here.');
    }).catch(function(err){
      paAuthOtpBusy = false;
      alert('Could not send the code: ' + (err && err.message ? err.message : 'check your connection and try again.'));
    });
  });
}
function paAuthVerifyOtp(){
  if(!PA_AUTH_CONFIG.enabled || paAuthOtpBusy) return;
  var email = ((document.getElementById('authEmail') || {}).value || '').trim();
  var token = ((document.getElementById('authCode') || {}).value || '').trim();
  if(!email || email.indexOf('@') === -1){ alert('Enter the email address the code was sent to.'); return; }
  if(!token){ alert('Enter the 6-digit code first.'); return; }
  paAuthOtpBusy = true;
  paAuthLoadClient(function(client){
    if(!client){ paAuthOtpBusy = false; alert('The sign-in service could not be reached. Check your connection and try again.'); return; }
    client.auth.verifyOtp({ email: email, token: token, type: 'email' }).then(function(res){
      paAuthOtpBusy = false;
      if(res.error){ alert('Code did not work: ' + res.error.message); return; }
      /* Redirect only once a session really exists. Redirecting on a
         success response with no session would land the learner on a
         dashboard showing the sign-in prompt, looking like the
         post-login breakage the app hit. */
      if(!res.data || !res.data.session){ alert('The code was accepted but no sign-in session was created. Please try again.'); return; }
      paAuthRefreshState();
      if(/signin\.html$/.test(window.location.pathname || '')){
        window.location.href = 'dashboard.html';
      }
    }).catch(function(err){
      paAuthOtpBusy = false;
      alert('The code could not be checked: ' + (err && err.message ? err.message : 'check your connection and try again.'));
    });
  });
}
function paAuthGoogle(){
  if(!PA_AUTH_CONFIG.enabled) return;
  paAuthLoadClient(function(client){
    if(!client){ alert('The sign-in service could not be reached. Check your connection and try again.'); return; }
    var p = client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard.html' }
    });
    if(p && p.catch){ p.catch(function(err){ alert('Google sign-in could not start: ' + (err && err.message ? err.message : 'please try again.')); }); }
  });
}
function paAuthSignOut(){
  if(!PA_AUTH_CONFIG.enabled) return;
  if(!confirm('Sign out of Payments Training Hub? Your progress in this browser stays here, and your synced progress stays in your account.')) return;
  paAuthLoadClient(function(client){
    if(!client){ alert('Sign out did not complete. The sign-in service could not be reached. Please try again.'); return; }
    client.auth.signOut().then(function(res){
      if(res && res.error){ alert('Sign out did not complete: ' + res.error.message); paAuthRefreshState(); return; }
      paAuthRefreshState();
      alert('You have signed out of Payments Training Hub.');
      if(/dashboard\.html$/.test(window.location.pathname || '')){
        window.location.reload();
      }
    }).catch(function(err){
      alert('Sign out did not complete: ' + (err && err.message ? err.message : 'please try again.'));
      paAuthRefreshState();
    });
  });
}
/* Identity helpers for the dashboard sync (learner-sync.js uses the
   shared client through paAuthLoadClient). They resolve to null while
   signed out, so guests degrade to the browser-only dashboard. */
function paAuthCurrentSession(){
  return new Promise(function(resolve){
    if(!PA_AUTH_CONFIG.enabled){ resolve(null); return; }
    paAuthLoadClient(function(client){
      if(!client){ resolve(null); return; }
      client.auth.getSession().then(function(res){
        resolve(res.data && res.data.session ? res.data.session : null);
      }).catch(function(){ resolve(null); });
    });
  });
}
function paAuthCurrentUserId(){
  return paAuthCurrentSession().then(function(s){
    return (s && s.user) ? s.user.id : null;
  });
}
function paAuthCurrentUserEmail(){
  return paAuthCurrentSession().then(function(s){
    return (s && s.user) ? (s.user.email || '') : '';
  });
}
function paAuthAccessToken(){
  return paAuthCurrentSession().then(function(s){
    return s ? (s.access_token || '') : '';
  });
}
/* Audio through signed URLs (dormant). While auth is off this returns the
   public path unchanged. When auth is on, it asks the audio-url Edge
   Function for a short-lived signed URL and falls back to the public path
   only if that function is unreachable, so the site keeps working during
   the transition. */
function paAudioUrl(publicPath, callback){
  if(!PA_AUTH_CONFIG.enabled || !paSupabase){
    callback(publicPath);
    return;
  }
  var sid = publicPath.split('/').pop();
  paSupabase.functions.invoke('audio-url', { body: { sid: sid } }).then(function(res){
    if(res.data && res.data.url) callback(res.data.url);
    else callback(publicPath);
  }).catch(function(){ callback(publicPath); });
}
/* Copy deterrents on paid lesson content (dormant). They apply only when
   access enforcement is on AND the lesson is paid content. Enforcement is
   off, so they never apply today. */
function paApplyDeterrents(){
  if(typeof PA_ENFORCE_ACCESS === 'undefined' || !PA_ENFORCE_ACCESS) return;
  document.querySelectorAll('.studio').forEach(function(el){
    el.addEventListener('contextmenu', function(e){ e.preventDefault(); });
    el.style.userSelect = 'none';
    el.style.webkitUserSelect = 'none';
  });
}
/* Load the Supabase client only when it is needed: on the sign-in and
   dashboard pages, or when a session is already stored. Guests reading
   lessons never load it, so lesson pages stay as fast as before. */
(function(){
  if(!PA_AUTH_CONFIG.enabled) return;
  var path = window.location.pathname || '';
  var needsAuth = /signin\.html$/.test(path) || /dashboard\.html$/.test(path);
  if(needsAuth || paAuthHasStoredSession()){ paAuthShowUI(); paAuthRefreshState(); }
  else { paAuthShowSignedOut(); }
})();
