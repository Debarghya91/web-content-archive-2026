
/* ===== Supabase Auth (DORMANT) ===== */
/* By owner decision the site stays open for all. This code does nothing
   until PA_AUTH_CONFIG.enabled is set to true AND the Supabase URL and
   anon key below are filled in. No client loads, no network calls happen. */
var PA_AUTH_CONFIG = {
  enabled: false, /* TO BE FILLED when auth is activated */
  supabaseUrl: '', /* TO BE FILLED: https://<project-ref>.supabase.co */
  supabaseAnonKey: '' /* TO BE FILLED: Supabase anon public key */
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
function paAuthShowUI(){
  if(!PA_AUTH_CONFIG.enabled) return;
  var box = document.getElementById('authBox');
  if(box) box.style.display = 'inline-block';
  var form = document.getElementById('authForm');
  if(form) form.style.display = 'inline-block';
}
function paAuthRefreshState(){
  if(!PA_AUTH_CONFIG.enabled) return;
  paAuthLoadClient(function(client){
    client.auth.getSession().then(function(res){
      var user = res.data && res.data.session && res.data.session.user;
      var st = document.getElementById('authState');
      var out = document.getElementById('authSignOutBtn');
      var form = document.getElementById('authForm');
      if(user){
        if(st) st.textContent = 'Signed in: ' + (user.email || '');
        if(out) out.style.display = 'inline-block';
        if(form) form.style.display = 'none';
      } else {
        if(st) st.textContent = 'Not signed in';
        if(out) out.style.display = 'none';
        if(form) form.style.display = 'inline-block';
      }
    });
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
    });
  });
}
function paAuthGoogle(){
  if(!PA_AUTH_CONFIG.enabled) return;
  paAuthLoadClient(function(client){
    client.auth.signInWithOAuth({ provider: 'google' });
  });
}
function paAuthSignOut(){
  if(!PA_AUTH_CONFIG.enabled) return;
  paAuthLoadClient(function(client){
    client.auth.signOut().then(function(){ paAuthRefreshState(); });
  });
}
/* Identity helpers for checkout (dormant-safe: resolve to null while
   auth is off). The Razorpay create-order call needs the signed-in
   learner's Supabase user id and access token so the order notes carry
   {supabase_user_id, bundle_id} and the webhook can grant access. */
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
if(PA_AUTH_CONFIG.enabled){ paAuthShowUI(); paAuthRefreshState(); }
