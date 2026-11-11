
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
function paAuthLoadClient(callback){
  if(!PA_AUTH_CONFIG.enabled || !PA_AUTH_CONFIG.supabaseUrl || !PA_AUTH_CONFIG.supabaseAnonKey) return;
  if(paSupabase){ if(callback) callback(paSupabase); return; }
  if(window.supabase){ paSupabase = window.supabase.createClient(PA_AUTH_CONFIG.supabaseUrl, PA_AUTH_CONFIG.supabaseAnonKey); if(callback) callback(paSupabase); return; }
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  s.onload = function(){
    paSupabase = window.supabase.createClient(PA_AUTH_CONFIG.supabaseUrl, PA_AUTH_CONFIG.supabaseAnonKey);
    paAuthRefreshState();
    if(callback) callback(paSupabase);
  };
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
function paAuthSendOtp(){
  if(!PA_AUTH_CONFIG.enabled) return;
  var email = (document.getElementById('authEmail') || {}).value || '';
  if(!email || email.indexOf('@') === -1){ alert('Enter a valid email first.'); return; }
  paAuthLoadClient(function(client){
    client.auth.signInWithOtp({ email: email }).then(function(res){
      if(res.error){ alert('Could not send the code: ' + res.error.message); return; }
      var code = document.getElementById('authCode');
      var vb = document.getElementById('authVerifyBtn');
      if(code) code.style.display = 'inline-block';
      if(vb) vb.style.display = 'inline-block';
      alert('Code sent to ' + email + '. Enter it here.');
    });
  });
}
function paAuthVerifyOtp(){
  if(!PA_AUTH_CONFIG.enabled) return;
  var email = (document.getElementById('authEmail') || {}).value || '';
  var token = (document.getElementById('authCode') || {}).value || '';
  if(!token){ alert('Enter the 6-digit code first.'); return; }
  paAuthLoadClient(function(client){
    client.auth.verifyOtp({ email: email, token: token, type: 'email' }).then(function(res){
      if(res.error){ alert('Code did not work: ' + res.error.message); return; }
      paAuthRefreshState();
      if(/signin\.html$/.test(window.location.pathname || '')){
        window.location.href = 'dashboard.html';
      }
    });
  });
}
function paAuthGoogle(){
  if(!PA_AUTH_CONFIG.enabled) return;
  paAuthLoadClient(function(client){
    client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard.html' }
    });
  });
}
function paAuthSignOut(){
  if(!PA_AUTH_CONFIG.enabled) return;
  paAuthLoadClient(function(client){
    client.auth.signOut().then(function(){
      paAuthRefreshState();
      if(/dashboard\.html$/.test(window.location.pathname || '')){
        window.location.reload();
      }
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
