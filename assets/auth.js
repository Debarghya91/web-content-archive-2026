
/* ===== Supabase Auth (sign-in is the first step) ===== */
/* Sign-in is mandatory before any content page: each content page
   carries a gate script in its head that sends a visit with no
   stored session to the sign-in page first, then returns it to the
   requested page. Signing in also saves progress to the learner's
   account so it syncs across devices. No paywall: purchases are not
   currently available. */
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
/* Where a fresh sign-in lands: the page the gate recorded in ?next=,
   or the dashboard. Only same-site paths are accepted, so a crafted
   link cannot bounce a fresh sign-in to another site. Auth pages are
   never a target: landing back on sign-in after signing in would
   strand the learner. */
function paAuthNextTarget(){
  var fallback = '/dashboard.html';
  try{
    var m = /[?&]next=([^&]*)/.exec(window.location.search || '');
    if(!m) return fallback;
    var target = decodeURIComponent(m[1].replace(/\+/g, ' '));
    if(!target || target.length > 500) return fallback;
    if(target.charAt(0) !== '/' || target.charAt(1) === '/') return fallback;
    if(target.indexOf('\\') !== -1) return fallback;
    if(/[\s\x00-\x1f\x7f]/.test(target)) return fallback;
    var path = target.split(/[?#]/)[0];
    if(path === '/signin.html' || path === '/signin' ||
       path === '/reset-password.html' || path === '/reset-password') return fallback;
    return target;
  }catch(e){ return fallback; }
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
function paAuthShowSignedIn(user){
  var st = document.getElementById('authState');
  var inLink = document.getElementById('authSignInLink');
  var dash = document.getElementById('authDashLink');
  var out = document.getElementById('authSignOutBtn');
  if(st) st.textContent = 'Signed in: ' + (user.email || '');
  if(inLink) inLink.style.display = 'none';
  if(dash) dash.style.display = 'inline';
  if(out) out.style.display = 'inline-block';
}
function paAuthRefreshState(){
  if(!PA_AUTH_CONFIG.enabled) return;
  paAuthValidatedSession().then(function(session){
    var user = session && session.user;
    if(user){ paAuthShowSignedIn(user); }
    else { paAuthShowSignedOut(); }
  }).catch(function(){ paAuthShowSignedOut(); });
}
/* One OTP request at a time: a double tap used to send two codes, and
   only the newest code worked, so the first code the learner typed
   failed. The flag clears on every outcome, success or failure. */
var paAuthOtpBusy = false;
function paAuthSendOtp(){
  if(!PA_AUTH_CONFIG.enabled || paAuthOtpBusy) return;
  var email = ((document.getElementById('authEmail') || {}).value || '').trim();
  if(!email || email.indexOf('@') === -1){ alert('Enter a valid email first.'); return; }
  var cd = paResendStatus('emailcode', email);
  if(cd.limitReached){ alert('Too many codes sent to this email address. Try again later.'); return; }
  if(!cd.canSend){ return; }
  paAuthOtpBusy = true;
  paAuthLoadClient(function(client){
    if(!client){ paAuthOtpBusy = false; alert('The sign-in service could not be reached. Check your connection and try again.'); return; }
    /* The emailed link must land on a page that loads the Supabase
       client, or the session in the link is never stored: the landing
       page never loads the client for a guest, so a link landing
       there signs nobody in. Dashboard is the proven target (the
       signup and resume flows already use it). */
    client.auth.signInWithOtp({ email: email, options: { emailRedirectTo: window.location.origin + '/dashboard.html', shouldCreateUser: true } }).then(function(res){
      paAuthOtpBusy = false;
      paResendRecord('emailcode', email);
      if(res.error){ alert('Could not send the code: ' + res.error.message); return; }
      var code = document.getElementById('authCode');
      var vb = document.getElementById('authVerifyBtn');
      if(code) code.style.display = 'inline-block';
      if(vb) vb.style.display = 'inline-block';
      alert('Code sent to ' + email + '. Enter the code here, or tap the sign-in link in the email.');
    }).catch(function(err){
      paAuthOtpBusy = false;
      paResendRecord('emailcode', email);
      alert('Could not send the code: ' + (err && err.message ? err.message : 'check your connection and try again.'));
    });
  });
}
function paAuthVerifyOtp(){
  if(!PA_AUTH_CONFIG.enabled || paAuthOtpBusy) return;
  var email = ((document.getElementById('authEmail') || {}).value || '').trim();
  /* Pasted codes often carry spaces or dashes; strip them before
     checking, or a correct code fails. The project issues 8-digit
     codes (Email OTP length 8, 3600 second expiry); 6 to 8 digits
     are accepted as a tolerance. */
  var token = ((document.getElementById('authCode') || {}).value || '').replace(/[\s-]+/g, '');
  if(!email || email.indexOf('@') === -1){ alert('Enter the email address the code was sent to.'); return; }
  if(!token){ alert('Enter the 8-digit code first.'); return; }
  if(!/^\d{6,8}$/.test(token)){ alert('Enter the 8-digit code from your email.'); return; }
  paAuthOtpBusy = true;
  paAuthLoadClient(function(client){
    if(!client){ paAuthOtpBusy = false; alert('The sign-in service could not be reached. Check your connection and try again.'); return; }
    /* A code mailed for a new address comes from the confirm-signup
       template and is a signup token; a code mailed for an existing
       confirmed address is an email token. The code alone does not
       say which, so try email first, then signup. */
    client.auth.verifyOtp({ email: email, token: token, type: 'email' }).then(function(res){
      if(!res.error && res.data && res.data.session){ paAuthVerifyOtpDone(); return; }
      client.auth.verifyOtp({ email: email, token: token, type: 'signup' }).then(function(res2){
        paAuthOtpBusy = false;
        if(res2.error){ alert('Code did not work: ' + res2.error.message); return; }
        /* Redirect only once a session really exists. Redirecting on a
           success response with no session would land the learner on a
           dashboard showing the sign-in prompt, looking like the
           post-login breakage the app hit. */
        if(!res2.data || !res2.data.session){ alert('The code was accepted but no sign-in session was created. Please try again.'); return; }
        paAuthVerifyOtpDone();
      }).catch(function(err){
        paAuthOtpBusy = false;
        alert('The code could not be checked: ' + (err && err.message ? err.message : 'check your connection and try again.'));
      });
    }).catch(function(err){
      /* A network failure on the first attempt is not a wrong code;
         do not spend the fallback attempt on it. */
      paAuthOtpBusy = false;
      alert('The code could not be checked: ' + (err && err.message ? err.message : 'check your connection and try again.'));
    });
  });
}
function paAuthVerifyOtpDone(){
  paAuthOtpBusy = false;
  paAuthRefreshState();
  if(/signin(\.html)?$/.test(window.location.pathname || '')){
    window.location.href = paAuthNextTarget();
  }
}
/* Email and password sign-in (13 Nov 2026, live-test defect): the
   sign-in page offered only an emailed code, so a password set at
   signup or through a reset could never be used. This is the
   password path, alongside the code path. Wrong credentials show
   the generic catalog message, which never says whether the email
   address has an account. */
function paAuthSignInPassword(){
  if(!PA_AUTH_CONFIG.enabled || paSignupState.busy) return;
  paSignupClearError('passwordError');
  var email = ((document.getElementById('passwordEmail') || {}).value || '').trim();
  var pw = (document.getElementById('passwordPassword') || {}).value || '';
  if(!email || email.indexOf('@') === -1){ paSignupShowError('passwordError', 'EMAIL_INVALID'); return; }
  if(!pw){ paSignupShowError('passwordError', 'CREDENTIALS_INVALID'); return; }
  paSignupState.busy = true;
  paAuthLoadClient(function(client){
    if(!client){
      paSignupState.busy = false;
      paSignupShowError('passwordError', 'UNKNOWN_ERROR');
      return;
    }
    client.auth.signInWithPassword({ email: email, password: pw }).then(function(res){
      paSignupState.busy = false;
      if(res.error){
        paSignupShowError('passwordError', paSignupMapSupabaseError(res.error.message));
        return;
      }
      if(!res.data || !res.data.session){
        paSignupShowError('passwordError', 'CREDENTIALS_INVALID');
        return;
      }
      paAuthRefreshState();
      window.location.href = paAuthNextTarget();
    }).catch(function(err){
      paSignupState.busy = false;
      paSignupShowError('passwordError', paSignupMapSupabaseError(err && err.message));
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
/* Sign-out (13 Nov 2026, live-test defect): the old version gated
   on confirm() and reported with alert(). Both dialogs auto-dismiss
   in automated browsers and on some mobile web views, so the button
   looked dead while the session survived reloads. There are no
   dialogs now: sign-out always clears the local session, even if
   the sign-in service cannot be reached, and the dashboard and
   sign-in pages reload onto their signed-out views. The learner's
   progress in this browser stays here, and synced progress stays
   in the account; signing out changes neither. */
function paAuthClearLocalSession(){
  try {
    var keys = [];
    for(var i = 0; i < localStorage.length; i++){ keys.push(localStorage.key(i)); }
    for(var j = 0; j < keys.length; j++){
      if(keys[j] && keys[j].indexOf('sb-eofsotgclhwsdwvbbtib-') === 0){ localStorage.removeItem(keys[j]); }
    }
  } catch(e){}
  paSupabase = null;
}
function paAuthSignOut(){
  if(!PA_AUTH_CONFIG.enabled) return;
  function finish(){
    paAuthClearLocalSession();
    paAuthShowSignedOut();
    var path = window.location.pathname || '';
    if(window.__pthGate){
      /* A gated page needs a session, so a signed-out visit belongs
         on the sign-in page rather than staying on content. */
      window.location.href = '/signin';
    } else if(/dashboard(\.html)?$/.test(path) || /signin(\.html)?$/.test(path)){
      window.location.reload();
    }
  }
  paAuthLoadClient(function(client){
    if(!client){ finish(); return; }
    try {
      var p = client.auth.signOut();
      if(p && p.then){ p.then(function(){ finish(); }).catch(function(){ finish(); }); }
      else { finish(); }
    } catch(e){ finish(); }
  });
}
/* Identity helpers for the dashboard sync (learner-sync.js uses the
   shared client through paAuthLoadClient). They resolve to null while
   signed out, so callers fall back to browser-only data. */
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
/* A session the server still accepts (13 Nov 2026, live-test
   defect): getSession alone trusts the stored token, so a token
   left over after the account was deleted server-side still
   looked signed in. This resolves to the session only when
   getUser confirms it with the server; a token the server
   rejects is dropped and the result is null. A network failure
   resolves to the stored session, so a lost connection does not
   sign the learner out of the UI. */
function paAuthValidatedSession(){
  return paAuthCurrentSession().then(function(session){
    if(!session) return null;
    return new Promise(function(resolve){
      paAuthLoadClient(function(client){
        if(!client){ resolve(session); return; }
        client.auth.getUser().then(function(res){
          if(res.error){
            paAuthClearLocalSession();
            resolve(null);
            return;
          }
          resolve(session);
        }).catch(function(){ resolve(session); });
      });
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
/* ===== Resend cooldown (bot protection, Phase 1, 13 Nov 2026) ===== */
/* Client-side throttle on every control that sends an auth email:
   the email-code send, the confirmation-link resend, and the
   password-reset send. After each send the control stays disabled
   for 60 seconds with a countdown, and no more than 5 sends per
   hour go to one email address. The send record lives in
   localStorage, keyed by a hash of the email address, never the
   raw address, so the cooldown survives a reload. This is a first
   line of defence only: Supabase Auth enforces its own
   server-side email rate limits behind it. The generic
   no-enumeration replies are unchanged: the cap message describes
   local send attempts only and never says whether an account
   exists. No CAPTCHA: that is Phase 2, after a settings check. */
var PA_RESEND_COOLDOWN_MS = 60 * 1000;
var PA_RESEND_HOURLY_LIMIT = 5;
var PA_RESEND_HOUR_MS = 3600 * 1000;
var PA_RESEND_CAP_MESSAGE = 'Too many emails sent to this address. Try again later.';
/* FNV-1a 32-bit hash, hex. The key must not hold the raw email
   address; a short hash is enough for a local throttle key, and a
   rare collision only shares a cooldown between two addresses. */
function paResendEmailHash(email){
  var h = 0x811c9dc5;
  var s = String(email || '').trim().toLowerCase();
  for(var i = 0; i < s.length; i++){
    h ^= s.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return ('0000000' + h.toString(16)).slice(-8);
}
function paResendKey(kind, email){
  return 'pth.resend.' + kind + '.' + paResendEmailHash(email);
}
function paResendLoad(kind, email){
  try {
    var raw = localStorage.getItem(paResendKey(kind, email));
    if(!raw) return [];
    var stamps = JSON.parse(raw);
    if(!stamps || stamps.length === undefined) return [];
    var out = [];
    for(var i = 0; i < stamps.length; i++){
      var t = Number(stamps[i]);
      if(isFinite(t) && t > 0) out.push(t);
    }
    return out;
  } catch(e){ return []; }
}
function paResendSave(kind, email, stamps){
  try { localStorage.setItem(paResendKey(kind, email), JSON.stringify(stamps)); } catch(e){}
}
/* Send status for one address: canSend, seconds left on the 60
   second cooldown, whether the hourly cap is hit, and minutes
   until the oldest send ages out. Sends older than one hour are
   ignored, so the cap slides instead of resetting on the hour. */
function paResendStatus(kind, email){
  var now = Date.now();
  var stamps = [];
  var loaded = paResendLoad(kind, email);
  for(var i = 0; i < loaded.length; i++){
    if(now - loaded[i] < PA_RESEND_HOUR_MS) stamps.push(loaded[i]);
  }
  if(stamps.length >= PA_RESEND_HOURLY_LIMIT){
    var oldest = stamps[0];
    for(var j = 1; j < stamps.length; j++){ if(stamps[j] < oldest) oldest = stamps[j]; }
    var retryMs = oldest + PA_RESEND_HOUR_MS - now;
    return { canSend: false, cooldownSeconds: 0, limitReached: true,
             limitRetryMinutes: Math.max(1, Math.ceil(retryMs / 60000)) };
  }
  var last = 0;
  for(var k = 0; k < stamps.length; k++){ if(stamps[k] > last) last = stamps[k]; }
  if(last > 0){
    var left = Math.ceil((last + PA_RESEND_COOLDOWN_MS - now) / 1000);
    if(left > 0){
      return { canSend: false, cooldownSeconds: left, limitReached: false, limitRetryMinutes: 0 };
    }
  }
  return { canSend: true, cooldownSeconds: 0, limitReached: false, limitRetryMinutes: 0 };
}
/* Record one send attempt, pruning sends older than one hour first
   so the stored list never grows past the hourly cap plus one.
   Attempts count, not just successes: the point is that rapid
   repeat taps cannot queue email after email. */
function paResendRecord(kind, email){
  var now = Date.now();
  var stamps = [];
  var loaded = paResendLoad(kind, email);
  for(var i = 0; i < loaded.length; i++){
    if(now - loaded[i] < PA_RESEND_HOUR_MS) stamps.push(loaded[i]);
  }
  stamps.push(now);
  paResendSave(kind, email, stamps);
  paResendRefreshControls();
}
/* Show the hourly-cap message in a signup-form error slot. It is a
   plain string, not a catalog code: it describes local send
   attempts only and is shared by every resend control. */
function paResendShowCap(elId){
  var el = document.getElementById(elId);
  if(!el) return;
  el.textContent = PA_RESEND_CAP_MESSAGE;
  el.style.display = 'block';
}
/* Controls that send an auth email. The label must match the button
   text in build-multipage.py: refresh rewrites the label with the
   countdown, then restores it from here. */
var paResendControls = [
  { btnId: 'authSendCodeBtn', inputId: 'authEmail', kind: 'emailcode', label: 'Send code' },
  { btnId: 'authResendCodeBtn', inputId: 'authEmail', kind: 'emailcode', label: 'Send a new code' },
  { btnId: 'resumeResendBtn', inputId: 'resumeEmail', kind: 'confirmation', label: 'Resend confirmation link' },
  { btnId: 'forgotSendBtn', inputId: 'forgotEmail', kind: 'reset', label: 'Send reset link' }
];
function paResendRefreshControls(){
  for(var i = 0; i < paResendControls.length; i++){
    var c = paResendControls[i];
    var btn = document.getElementById(c.btnId);
    if(!btn) continue;
    var input = document.getElementById(c.inputId);
    var email = input ? (input.value || '').trim() : '';
    if(!email || email.indexOf('@') === -1){
      btn.disabled = false;
      btn.textContent = c.label;
      continue;
    }
    var st = paResendStatus(c.kind, email);
    if(st.limitReached){
      btn.disabled = true;
      btn.textContent = c.label + ' (try again in ' + st.limitRetryMinutes + 'm)';
    } else if(st.cooldownSeconds > 0){
      btn.disabled = true;
      btn.textContent = c.label + ' (' + st.cooldownSeconds + 's)';
    } else {
      btn.disabled = false;
      btn.textContent = c.label;
    }
  }
}
/* Start the one-second refresh only on pages that carry a resend
   control (the sign-in page). The email inputs refresh the labels
   as the learner types, so a typed address picks up its own
   stored cooldown at once. */
function paResendInitControls(){
  var present = false;
  for(var i = 0; i < paResendControls.length; i++){
    if(document.getElementById(paResendControls[i].btnId)){ present = true; break; }
  }
  if(!present) return;
  var bound = {};
  for(var j = 0; j < paResendControls.length; j++){
    var inputId = paResendControls[j].inputId;
    if(bound[inputId]) continue;
    bound[inputId] = true;
    var input = document.getElementById(inputId);
    if(input) input.addEventListener('input', paResendRefreshControls);
  }
  paResendRefreshControls();
  setInterval(paResendRefreshControls, 1000);
}
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', paResendInitControls);
} else {
  paResendInitControls();
}
/* ===== Email and password signup (13 Nov 2026, OTP removal) ===== */
/* Signup order: email, password, terms acceptance, account creation.
   Supabase sends an email confirmation link; that link is the only
   verification. No phone number is collected, no text message code is sent,
   and no second factor is needed. The case ID is generated here, in
   the browser, at account creation, stored in the account metadata
   (signup_case_id), and shown on the done step, in the welcome
   popup, and in the profile. It is an identifier, not a credential:
   an unfinished signup resumes through the email confirmation link,
   never through the case ID on its own. Error text comes from
   PA_ERROR_MESSAGES, a copy of the canonical catalog in
   audit/ERROR-CODE-CATALOG.md. The email code sign-in above is
   untouched, and paAuthGoogle() stays dormant and uncalled. */
var PA_ERROR_MESSAGES = {
  EMAIL_ALREADY_REGISTERED: 'This email already has an account. Sign in instead.',
  EMAIL_NOT_VERIFIED: 'Verify your email address first. Check your inbox for the confirmation link, or use Resume signup to send it again.',
  EMAIL_INVALID: 'Enter a valid email address.',
  TERMS_NOT_ACCEPTED: 'Accept the terms and conditions to continue.',
  CREDENTIALS_INVALID: 'Email or password does not match our records. The same message appears when your email is not confirmed yet: use Resume signup to resend the confirmation, sign in with an emailed code, or reset your password.',
  SESSION_EXPIRED: 'Your session expired. Sign in again.',
  UNKNOWN_ERROR: 'Something went wrong. Try again, and contact support if it keeps happening.',
  REQUEST_INVALID: 'That request does not look right. Check the details and try again.',
  UNAUTHENTICATED: 'Your sign-in has expired. Sign in again and try once more.',
  SERVER_NOT_CONFIGURED: 'This service is not available right now. Please try again later.',
  DELETION_FAILED: 'Your account could not be deleted. Nothing was changed. Please try again.',
  CASCADE_FAILED: 'Your account could not be fully deleted, so nothing was changed. Please try again or contact support.',
  METHOD_NOT_ALLOWED: 'That request is not allowed.',
  PASSWORD_TOO_SHORT: 'Your password must be at least 8 characters.',
  PASSWORD_MISMATCH: 'The two passwords do not match. Type the same password twice.',
  EMAIL_CONFIRMATION_RESENT: 'If that email address has an unfinished signup, a confirmation link is on its way. Check your inbox.',
  PASSWORD_RESET_SENT: 'If an account exists for that email address, a password reset link is on its way. Check your inbox.',
  RESET_LINK_INVALID: 'This password reset link has expired or was already used. Request a new one.',
  LINK_INVALID: 'That sign-in link has expired or was already used. Request a new emailed code.'
};
var PA_SIGNUP_WELCOME_PENDING_KEY = 'pth.welcome.pending.v1';
var PA_SIGNUP_WELCOME_SHOWN_KEY = 'pth.welcome.shown.v1';
var paSignupState = { caseId: '', busy: false };
var PA_SIGNUP_CASE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
/* Case IDs are generated in the browser at account creation: "PF-"
   plus 6 characters from the catalog alphabet, which drops I, L, O,
   0, and 1 so an ID read aloud cannot be confused. There is no
   server case store, so uniqueness is best effort; the ID is an
   identifier shown to the learner, never a credential. */
function paSignupGenerateCaseId(){
  var out = 'PF-';
  try {
    var bytes = new Uint8Array(6);
    if(window.crypto && window.crypto.getRandomValues){
      window.crypto.getRandomValues(bytes);
      for(var i = 0; i < 6; i++){ out += PA_SIGNUP_CASE_ALPHABET[bytes[i] % PA_SIGNUP_CASE_ALPHABET.length]; }
      return out;
    }
  } catch(e){}
  for(var j = 0; j < 6; j++){ out += PA_SIGNUP_CASE_ALPHABET[Math.floor(Math.random() * PA_SIGNUP_CASE_ALPHABET.length)]; }
  return out;
}
function paSignupErrorMessage(code, serverMessage){
  return PA_ERROR_MESSAGES[code] || serverMessage || PA_ERROR_MESSAGES.UNKNOWN_ERROR;
}
function paSignupShowError(elId, code, serverMessage){
  var el = document.getElementById(elId);
  if(!el) return;
  el.textContent = paSignupErrorMessage(code, serverMessage);
  el.style.display = 'block';
}
/* Show every failing check at once (15 Nov 2026, fix 13): the form
   used to stop at the first failure, so a learner fixed one problem
   only to be told about the next. Each message comes from
   PA_ERROR_MESSAGES, rendered as a list. */
function paSignupShowErrors(elId, codes){
  var el = document.getElementById(elId);
  if(!el) return;
  el.innerHTML = '';
  var ul = document.createElement('ul');
  codes.forEach(function(code){
    var li = document.createElement('li');
    li.textContent = paSignupErrorMessage(code);
    ul.appendChild(li);
  });
  el.appendChild(ul);
  el.style.display = 'block';
}
function paSignupClearError(elId){
  var el = document.getElementById(elId);
  if(el){ el.textContent = ''; el.style.display = 'none'; }
}
/* Generic status text for the resume and forgot-password forms. The
   message is the same whether or not the email has an account, so
   the response cannot be used to probe for accounts. */
function paSignupShowStatus(elId, code){
  var el = document.getElementById(elId);
  if(!el) return;
  el.textContent = PA_ERROR_MESSAGES[code] || PA_ERROR_MESSAGES.UNKNOWN_ERROR;
  el.style.display = 'block';
}
function paSignupHideStatus(elId){
  var el = document.getElementById(elId);
  if(el){ el.textContent = ''; el.style.display = 'none'; }
}
function paSignupShowStep(stepId){
  var steps = document.querySelectorAll('.pa-signup-step');
  for(var i = 0; i < steps.length; i++){ steps[i].style.display = 'none'; }
  var el = document.getElementById(stepId);
  if(el) el.style.display = 'block';
}
function paSignupShowCaseId(boxId, textId){
  var box = document.getElementById(boxId);
  var text = document.getElementById(textId);
  if(text) text.textContent = paSignupState.caseId;
  if(box) box.style.display = 'block';
}
function paSignupMapSupabaseError(message){
  var text = String(message || '');
  if(/already registered/i.test(text) || /already exists/i.test(text)) return 'EMAIL_ALREADY_REGISTERED';
  if(/invalid login credentials/i.test(text)) return 'CREDENTIALS_INVALID';
  if(/email not confirmed/i.test(text)) return 'EMAIL_NOT_VERIFIED';
  if(/expired/i.test(text)) return 'SESSION_EXPIRED';
  return 'UNKNOWN_ERROR';
}
function paSignupCreateAccount(){
  if(paSignupState.busy) return;
  paSignupClearError('signupError');
  var email = ((document.getElementById('signupEmail') || {}).value || '').trim();
  var pw1 = (document.getElementById('signupPassword') || {}).value || '';
  var pw2 = (document.getElementById('signupPassword2') || {}).value || '';
  var terms = document.getElementById('signupTerms');
  var problems = [];
  if(!email || email.indexOf('@') === -1) problems.push('EMAIL_INVALID');
  if(pw1.length < 8) problems.push('PASSWORD_TOO_SHORT');
  if(pw1 !== pw2) problems.push('PASSWORD_MISMATCH');
  if(!terms || !terms.checked) problems.push('TERMS_NOT_ACCEPTED');
  if(problems.length){ paSignupShowErrors('signupError', problems); return; }
  paSignupState.busy = true;
  paSignupState.caseId = paSignupGenerateCaseId();
  paAuthLoadClient(function(client){
    if(!client){
      paSignupState.busy = false;
      paSignupShowError('signupError', 'UNKNOWN_ERROR');
      return;
    }
    client.auth.signUp({
      email: email,
      password: pw1,
      options: {
        data: {
          signup_case_id: paSignupState.caseId,
          terms_accepted_at: new Date().toISOString()
        },
        emailRedirectTo: window.location.origin + '/dashboard.html'
      }
    }).then(function(res){
      paSignupState.busy = false;
      if(res.error){
        paSignupShowError('signupError', paSignupMapSupabaseError(res.error.message));
        return;
      }
      var newUser = res.data && res.data.user;
      /* GoTrue returns a bare user with no session when Confirm email
         is ON: that is a successful signup, and the done step below
         is the right state. If a session came back (confirmation
         off), the learner is already signed in, so go straight to
         the target instead of showing check-your-email. */
      if(res.data && res.data.session){
        paAuthRefreshState();
        if(/signin(\.html)?$/.test(window.location.pathname || '')){
          window.location.href = paAuthNextTarget();
        }
        return;
      }
      /* Duplicate detection from server timestamps. The empty
         identities signal is disproved: genuine new signups carry
         an empty identities list too. A confirmed address, or a
         confirmation sent more than 120 seconds after creation,
         proves the account already existed. Never show the done
         step for a duplicate: claiming the account was created
         and an email was sent, when neither happened, is wrong
         information. Show the already-registered message on the
         form instead, pointing at sign-in. */
      var isDuplicate = false;
      if(newUser){
        if(newUser.email_confirmed_at || newUser.confirmed_at){
          isDuplicate = true;
        } else {
          var createdMs = Date.parse(newUser.created_at || '');
          var sentMs = Date.parse(newUser.confirmation_sent_at || '');
          if(!isNaN(createdMs) && !isNaN(sentMs) && (sentMs - createdMs) > 120000){
            isDuplicate = true;
          }
        }
      }
      if(isDuplicate){
        paSignupShowError('signupError', 'EMAIL_ALREADY_REGISTERED');
        return;
      }
      paWelcomeArm(paSignupState.caseId);
      paResendRecord('confirmation', email);
      paSignupShowCaseId('signupDoneCaseBox', 'signupDoneCaseIdText');
      paSignupShowStep('signupDone');
      paAuthRefreshState();
    }).catch(function(err){
      paSignupState.busy = false;
      paSignupShowError('signupError', paSignupMapSupabaseError(err && err.message));
    });
  });
}
/* Resume: resend the email confirmation link. An unfinished signup
   is one whose email was never confirmed; the confirmation link in
   the learner's inbox is the resume path. The reply is the same
   generic message whether or not the email has an unfinished
   signup, so it cannot be used to probe for accounts. Only a
   sign-in service failure shows an error instead. */
function paResumeResendConfirmation(){
  if(paSignupState.busy) return;
  paSignupClearError('resumeError');
  paSignupHideStatus('resumeStatus');
  var email = ((document.getElementById('resumeEmail') || {}).value || '').trim();
  if(!email || email.indexOf('@') === -1){ paSignupShowError('resumeError', 'EMAIL_INVALID'); return; }
  var resumeCd = paResendStatus('confirmation', email);
  if(resumeCd.limitReached){ paResendShowCap('resumeError'); return; }
  if(!resumeCd.canSend){ return; }
  paSignupState.busy = true;
  paAuthLoadClient(function(client){
    if(!client){
      paSignupState.busy = false;
      paSignupShowError('resumeError', 'UNKNOWN_ERROR');
      return;
    }
    client.auth.resend({
      type: 'signup',
      email: email,
      options: { emailRedirectTo: window.location.origin + '/dashboard.html' }
    }).then(function(){
      paSignupState.busy = false;
      paResendRecord('confirmation', email);
      paSignupShowStatus('resumeStatus', 'EMAIL_CONFIRMATION_RESENT');
    }).catch(function(){
      paSignupState.busy = false;
      paResendRecord('confirmation', email);
      paSignupShowStatus('resumeStatus', 'EMAIL_CONFIRMATION_RESENT');
    });
  });
}
/* Forgot password: send a Supabase password-reset email with a reset
   link to the reset-password page. The reply is the same generic
   message for a valid email and an unknown one, so it cannot be
   used to probe for accounts. No text message, no code. Only a sign-in
   service failure shows an error instead. */
function paForgotSendReset(){
  if(paSignupState.busy) return;
  paSignupClearError('forgotError');
  paSignupHideStatus('forgotStatus');
  var email = ((document.getElementById('forgotEmail') || {}).value || '').trim();
  if(!email || email.indexOf('@') === -1){ paSignupShowError('forgotError', 'EMAIL_INVALID'); return; }
  var forgotCd = paResendStatus('reset', email);
  if(forgotCd.limitReached){ paResendShowCap('forgotError'); return; }
  if(!forgotCd.canSend){ return; }
  paSignupState.busy = true;
  paAuthLoadClient(function(client){
    if(!client){
      paSignupState.busy = false;
      paSignupShowError('forgotError', 'UNKNOWN_ERROR');
      return;
    }
    client.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password.html'
    }).then(function(){
      paSignupState.busy = false;
      paResendRecord('reset', email);
      paSignupShowStatus('forgotStatus', 'PASSWORD_RESET_SENT');
    }).catch(function(){
      paSignupState.busy = false;
      paResendRecord('reset', email);
      paSignupShowStatus('forgotStatus', 'PASSWORD_RESET_SENT');
    });
  });
}
/* Reset-password page: the reset link opens reset-password.html with
   a recovery session (URL hash tokens, or a ?code= PKCE code). The
   form shows only when a recovery session exists; otherwise the
   learner sees the expired-link message and a way back to request
   a new link. The new password follows the signup rules: at least
   8 characters, typed twice. */
function paResetMapError(message){
  var text = String(message || '');
  if(/expired/i.test(text) || /invalid/i.test(text)) return 'RESET_LINK_INVALID';
  return 'UNKNOWN_ERROR';
}
/* Strict recovery gating (13 Nov 2026, live-test defect): the form
   shows ONLY when this page was opened through a password-reset
   link and a session was established for it. The old check trusted
   any stored session, so on an expired or already used link the
   form still opened (a session left over from an earlier sign-in)
   and a password change was claimed as a success. Now a recovery
   signal in the URL is required, a URL error always shows the
   invalid state, and the submit handler refuses to run without
   the flag set here. */
var paResetRecoveryValid = false;
function paResetPasswordInit(){
  paResetRecoveryValid = false;
  var checking = document.getElementById('resetChecking');
  var form = document.getElementById('resetForm');
  var invalid = document.getElementById('resetInvalid');
  var invalidText = document.getElementById('resetInvalidText');
  function showInvalid(code){
    if(checking) checking.style.display = 'none';
    if(form) form.style.display = 'none';
    if(invalidText) invalidText.textContent = PA_ERROR_MESSAGES[code] || PA_ERROR_MESSAGES.UNKNOWN_ERROR;
    if(invalid) invalid.style.display = 'block';
  }
  function showForm(){
    paResetRecoveryValid = true;
    if(checking) checking.style.display = 'none';
    if(invalid) invalid.style.display = 'none';
    if(form) form.style.display = 'block';
    var pw = document.getElementById('resetPassword');
    if(pw) pw.focus();
  }
  /* Read the recovery signal before touching the client: an error
     in the URL means Supabase already rejected the link, and a
     visit with no recovery signal at all (no type=recovery hash,
     no PKCE code) is not a reset, even for a signed-in learner. */
  var hashParams = null;
  var queryParams = null;
  try { hashParams = new URLSearchParams((window.location.hash || '').replace(/^#/, '')); } catch(e){ hashParams = null; }
  try { queryParams = new URLSearchParams(window.location.search || ''); } catch(e){ queryParams = null; }
  var urlError = (hashParams && (hashParams.get('error') || hashParams.get('error_code'))) ||
                 (queryParams && (queryParams.get('error') || queryParams.get('error_code')));
  if(urlError){ showInvalid('RESET_LINK_INVALID'); return; }
  var code = queryParams ? queryParams.get('code') : null;
  var isRecovery = (hashParams && hashParams.get('type') === 'recovery') || !!code;
  if(!isRecovery){ showInvalid('RESET_LINK_INVALID'); return; }
  paAuthLoadClient(function(client){
    if(!client){ showInvalid('UNKNOWN_ERROR'); return; }
    function checkSession(){
      client.auth.getSession().then(function(res){
        var session = res.data && res.data.session;
        if(session){ showForm(); }
        else { showInvalid('RESET_LINK_INVALID'); }
      }).catch(function(){ showInvalid('RESET_LINK_INVALID'); });
    }
    if(code){
      client.auth.exchangeCodeForSession(code).then(function(res){
        if(res.error){ showInvalid('RESET_LINK_INVALID'); return; }
        checkSession();
      }).catch(function(){ showInvalid('RESET_LINK_INVALID'); });
      return;
    }
    checkSession();
  });
}
function paResetPasswordSubmit(){
  if(paSignupState.busy) return;
  /* The gate: without a validated recovery session the submit is
     refused outright, so an invalid link can never claim success. */
  if(!paResetRecoveryValid){
    paSignupShowError('resetError', 'RESET_LINK_INVALID');
    return;
  }
  paSignupClearError('resetError');
  var pw1 = (document.getElementById('resetPassword') || {}).value || '';
  var pw2 = (document.getElementById('resetPassword2') || {}).value || '';
  if(pw1.length < 8){ paSignupShowError('resetError', 'PASSWORD_TOO_SHORT'); return; }
  if(pw1 !== pw2){ paSignupShowError('resetError', 'PASSWORD_MISMATCH'); return; }
  paSignupState.busy = true;
  paAuthLoadClient(function(client){
    if(!client){
      paSignupState.busy = false;
      paSignupShowError('resetError', 'UNKNOWN_ERROR');
      return;
    }
    /* Re-check the session at submit time: the flag alone is not
       trusted if the session went away since the form opened. */
    client.auth.getSession().then(function(sessRes){
      var session = sessRes.data && sessRes.data.session;
      if(!session){
        paSignupState.busy = false;
        paSignupShowError('resetError', 'RESET_LINK_INVALID');
        return null;
      }
      return client.auth.updateUser({ password: pw1 });
    }).then(function(res){
      if(!res) return;
      paSignupState.busy = false;
      if(res.error){
        paSignupShowError('resetError', paResetMapError(res.error.message));
        return;
      }
      var form = document.getElementById('resetForm');
      var done = document.getElementById('resetDone');
      if(form) form.style.display = 'none';
      if(done) done.style.display = 'block';
      paResetRecoveryValid = false;
      paAuthRefreshState();
    }).catch(function(err){
      paSignupState.busy = false;
      paSignupShowError('resetError', paResetMapError(err && err.message));
    });
  });
}
/* ===== My Purchases (13 Nov 2026, live-test defect) ===== */
/* The drawer "My Purchases" row used to link to pricing.html, the
   sales page, so a completed purchase never surfaced in the
   account UI. This page reads the signed-in learner's own
   user_purchases rows (product, store, purchase date, access-until date, status) and
   renders them, with an empty state and a signed-out prompt. The
   product names match content/bundles.json; an unknown product id
   is shown as stored, never dropped. */
var PA_PURCHASE_PRODUCT_NAMES = {
  'com.paymentstraininghub.app.part-1': 'Part 1: Foundations of Money and Payments',
  'com.paymentstraininghub.app.part-2': 'Part 2: How Payments Move',
  'com.paymentstraininghub.app.part-3': 'Part 3: Messages: SWIFT MT, ISO 20022 and Standards',
  'com.paymentstraininghub.app.part-4': 'Part 4: Cross-Border Payments and Correspondent Banking',
  'com.paymentstraininghub.app.part-5': 'Part 5: Clearing, Settlement, Liquidity and Reconciliation',
  'com.paymentstraininghub.app.part-6': 'Part 6: Exceptions, Investigations, Returns and Claims',
  'com.paymentstraininghub.app.part-7': 'Part 7: Cards and Customer Payments',
  'com.paymentstraininghub.app.part-8': 'Part 8: Architecture, APIs, Hubs and Engineering',
  'com.paymentstraininghub.app.part-9': 'Part 9: The Business Analyst at Work',
  'com.paymentstraininghub.app.part-10': 'Part 10: Emerging Payments and the Future',
  'com.paymentstraininghub.app.group-1': 'Group 1: Payments Foundations',
  'com.paymentstraininghub.app.group-2': 'Group 2: Messages and Cross-Border Payments',
  'com.paymentstraininghub.app.group-3': 'Group 3: Clearing, Settlement and Exceptions',
  'com.paymentstraininghub.app.group-4': 'Group 4: Cards, Architecture and Engineering',
  'com.paymentstraininghub.app.group-5': 'Group 5: The BA at Work and Emerging Payments',
  'com.paymentstraininghub.app.studio': 'BA/PO Studio',
  'com.paymentstraininghub.app.simulator': 'Payment Simulator',
  'com.paymentstraininghub.app.investigation-lab': 'Investigation Lab',
  'com.paymentstraininghub.app.practice': 'Practice Experiences',
  'com.paymentstraininghub.app.interview': 'Interview Ready',
  'com.paymentstraininghub.app.integrated': 'The Integrated Course',
  'com.paymentstraininghub.app.part-1.renewal': 'Part 1: Foundations of Money and Payments (renewal)',
  'com.paymentstraininghub.app.part-2.renewal': 'Part 2: How Payments Move (renewal)',
  'com.paymentstraininghub.app.part-3.renewal': 'Part 3: Messages: SWIFT MT, ISO 20022 and Standards (renewal)',
  'com.paymentstraininghub.app.part-4.renewal': 'Part 4: Cross-Border Payments and Correspondent Banking (renewal)',
  'com.paymentstraininghub.app.part-5.renewal': 'Part 5: Clearing, Settlement, Liquidity and Reconciliation (renewal)',
  'com.paymentstraininghub.app.part-6.renewal': 'Part 6: Exceptions, Investigations, Returns and Claims (renewal)',
  'com.paymentstraininghub.app.part-7.renewal': 'Part 7: Cards and Customer Payments (renewal)',
  'com.paymentstraininghub.app.part-8.renewal': 'Part 8: Architecture, APIs, Hubs and Engineering (renewal)',
  'com.paymentstraininghub.app.part-9.renewal': 'Part 9: The Business Analyst at Work (renewal)',
  'com.paymentstraininghub.app.part-10.renewal': 'Part 10: Emerging Payments and the Future (renewal)',
  'com.paymentstraininghub.app.group-1.renewal': 'Group 1: Payments Foundations (renewal)',
  'com.paymentstraininghub.app.group-2.renewal': 'Group 2: Messages and Cross-Border Payments (renewal)',
  'com.paymentstraininghub.app.group-3.renewal': 'Group 3: Clearing, Settlement and Exceptions (renewal)',
  'com.paymentstraininghub.app.group-4.renewal': 'Group 4: Cards, Architecture and Engineering (renewal)',
  'com.paymentstraininghub.app.group-5.renewal': 'Group 5: The BA at Work and Emerging Payments (renewal)',
  'com.paymentstraininghub.app.studio.renewal': 'BA/PO Studio (renewal)',
  'com.paymentstraininghub.app.simulator.renewal': 'Payment Simulator (renewal)',
  'com.paymentstraininghub.app.investigation-lab.renewal': 'Investigation Lab (renewal)',
  'com.paymentstraininghub.app.practice.renewal': 'Practice Experiences (renewal)',
  'com.paymentstraininghub.app.interview.renewal': 'Interview Ready (renewal)',
  'com.paymentstraininghub.app.integrated.renewal': 'The Integrated Course (renewal)'
};
var PA_PURCHASE_STORE_NAMES = {
  'payu': 'PayU',
  'paypal': 'PayPal',
  'apple': 'Apple',
  'play': 'Google Play',
  'upi': 'UPI'
};
function paPurchasesProductName(productId){
  var id = String(productId || '');
  if(PA_PURCHASE_PRODUCT_NAMES[id]) return PA_PURCHASE_PRODUCT_NAMES[id];
  if(PA_PURCHASE_PRODUCT_NAMES['com.paymentstraininghub.app.' + id]) return PA_PURCHASE_PRODUCT_NAMES['com.paymentstraininghub.app.' + id];
  return id || 'Course bundle';
}
function paPurchasesEscape(text){
  return String(text == null ? '' : text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function paPurchasesDate(iso){
  try {
    var d = new Date(iso);
    if(isNaN(d.getTime())) return String(iso || '');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch(e){ return String(iso || ''); }
}
function paPurchasesInit(){
  var checking = document.getElementById('paPurchasesChecking');
  var signedOut = document.getElementById('paPurchasesSignedOut');
  var content = document.getElementById('paPurchasesContent');
  var empty = document.getElementById('paPurchasesEmpty');
  var table = document.getElementById('paPurchasesTable');
  var rows = document.getElementById('paPurchasesRows');
  function showSignedOut(){
    if(checking) checking.style.display = 'none';
    if(content) content.style.display = 'none';
    if(signedOut) signedOut.style.display = 'block';
  }
  function showError(){
    if(checking) checking.style.display = 'none';
    if(signedOut) signedOut.style.display = 'none';
    if(content) content.style.display = 'block';
    paSignupShowError('paPurchasesError', 'UNKNOWN_ERROR');
  }
  paAuthLoadClient(function(client){
    if(!client){ showError(); return; }
    client.auth.getSession().then(function(res){
      var user = res.data && res.data.session && res.data.session.user;
      if(!user){ showSignedOut(); return null; }
      return client.from('user_purchases')
        .select('product_id, store, purchased_at, expires_at, status')
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false });
    }).then(function(resp){
      if(!resp) return;
      if(resp.error){ showError(); return; }
      var list = resp.data || [];
      if(checking) checking.style.display = 'none';
      if(content) content.style.display = 'block';
      if(!list.length){
        if(table) table.style.display = 'none';
        if(empty) empty.style.display = 'block';
        return;
      }
      if(empty) empty.style.display = 'none';
      var h = '';
      for(var i = 0; i < list.length; i++){
        var row = list[i] || {};
        var status = String(row.status || '');
        var badge = status === 'active' ? 'pa-badge' : 'pa-badge pa-badge-muted';
        h += '<tr><td>' + paPurchasesEscape(paPurchasesProductName(row.product_id)) + '</td>'
          + '<td>' + paPurchasesEscape(PA_PURCHASE_STORE_NAMES[String(row.store || '').toLowerCase()] || row.store || '') + '</td>'
          + '<td>' + paPurchasesEscape(paPurchasesDate(row.purchased_at)) + '</td>'
          + '<td>' + paPurchasesEscape(row.expires_at ? paPurchasesDate(row.expires_at) : '') + '</td>'
          + '<td><span class="' + badge + '">' + paPurchasesEscape(status) + '</span></td></tr>';
      }
      if(rows) rows.innerHTML = h;
      if(table) table.style.display = 'table';
    }).catch(function(){ showError(); });
  });
}
/* ===== Welcome popup (owner addition, 13 Nov 2026) ===== */
/* Armed at registration only, shown once on the first signed-in
   dashboard landing, auto-dismissing after about 3 seconds. The
   shown flag is set and the pending marker cleared BEFORE the
   popup renders, so it cannot show twice. Per-browser by design:
   localStorage does not follow the learner to another device. */
function paWelcomeArm(caseId){
  try {
    if(localStorage.getItem(PA_SIGNUP_WELCOME_SHOWN_KEY)) return;
    if(caseId) localStorage.setItem(PA_SIGNUP_WELCOME_PENDING_KEY, caseId);
  } catch(e){}
}
function paWelcomeMaybeShow(){
  var pending = null;
  try {
    if(localStorage.getItem(PA_SIGNUP_WELCOME_SHOWN_KEY)) return;
    pending = localStorage.getItem(PA_SIGNUP_WELCOME_PENDING_KEY);
    if(!pending) return;
    localStorage.setItem(PA_SIGNUP_WELCOME_SHOWN_KEY, '1');
    localStorage.removeItem(PA_SIGNUP_WELCOME_PENDING_KEY);
  } catch(e){ return; }
  if(document.getElementById('paWelcomeOverlay')) return;
  var overlay = document.createElement('div');
  overlay.id = 'paWelcomeOverlay';
  overlay.className = 'pa-welcome-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', 'Welcome to Payments Training Hub');
  var card = document.createElement('div');
  card.className = 'pa-welcome-card';
  var heading = document.createElement('div');
  heading.className = 'pa-welcome-heading';
  heading.textContent = 'Congratulations, and welcome to Payments Training Hub!';
  var caseLine = document.createElement('div');
  caseLine.className = 'pa-welcome-line';
  caseLine.textContent = 'Your case ID is ';
  var caseStrong = document.createElement('strong');
  caseStrong.textContent = pending;
  caseLine.appendChild(caseStrong);
  caseLine.appendChild(document.createTextNode(' Keep it for future reference.'));
  var next = document.createElement('div');
  next.className = 'pa-welcome-line';
  next.textContent = 'Next step: browse courses, or finish your profile from the dashboard.';
  var actions = document.createElement('div');
  actions.className = 'pa-welcome-actions';
  var browse = document.createElement('a');
  browse.className = 'pa-welcome-btn';
  browse.href = 'courses';
  browse.textContent = 'Browse courses';
  var cont = document.createElement('button');
  cont.type = 'button';
  cont.className = 'pa-welcome-btn pa-welcome-continue';
  cont.textContent = 'Continue';
  actions.appendChild(browse);
  actions.appendChild(cont);
  card.appendChild(heading);
  card.appendChild(caseLine);
  card.appendChild(next);
  card.appendChild(actions);
  overlay.appendChild(card);
  document.body.appendChild(overlay);
  var dismissed = false;
  function dismiss(){
    if(dismissed) return;
    dismissed = true;
    if(timer) clearTimeout(timer);
    if(overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }
  var timer = setTimeout(dismiss, 3000);
  overlay.addEventListener('click', dismiss);
}
/* ===== Email confirmation dialog (13 Nov 2026, owner request) ===== */
/* After the learner clicks the email confirmation link, the landing
   must say so clearly. When dashboard.html loads with a fresh
   session from a confirmation link (the URL hash carries
   type=signup or type=invite with an access token), a one-time
   dialog shows a checkmark, "Your email is confirmed", one line
   saying the account is active, and a Continue button. The dialog
   carries no access: it only reports the landing, and the Supabase
   client still validates the token itself.
   Show-once: the hash is cleared with history.replaceState and a
   session flag is set, but ONLY after the client confirms a
   session was established. Clearing the hash first would stop the
   Supabase client reading it, so the session would never be
   established. The flag is the second guard, for a return through
   the back button with the hash intact. A reload never shows the
   dialog again: the hash is gone and the flag is set.
   Sequencing with the welcome popup: the dialog goes first and
   the welcome popup shows only after the dialog is dismissed, so
   the two never overlap. This function always calls afterDismiss
   exactly once: on dialog dismissal, or at once when no dialog
   will show. If the dialog is left open, the welcome popup stays
   pending for the next dashboard load, because its pending flag
   is cleared only when it actually shows. */
var PA_CONFIRM_DIALOG_FLAG_KEY = 'pth.confirmDialog.shown.v1';
/* Sign-in page callback recovery (16 Nov 2026): an emailed sign-in
   link can arrive at the sign-in page with its callback buried inside
   the ?next= target (the gate redirects a gated landing carrying
   ?code= or a hash into ?next=), where the Supabase client never
   looks. Recover it here: complete the callback on this page, then
   go to the target without the callback params. Direct hash and
   ?code= callbacks on this page are handled by the client itself and
   the signed-in check; only error callbacks and buried callbacks
   need this handler. Returns true when a callback was found and
   handled (the caller must skip its normal signed-in check). */
function paAuthCallbackTarget(raw){
  /* Same validation as paAuthNextTarget, applied to a decoded inner
     target: same-site path only, auth pages never targets. */
  try {
    if(!raw || raw.length > 500) return null;
    if(raw.charAt(0) !== '/' || raw.charAt(1) === '/' || raw.indexOf('\\') !== -1) return null;
    if(/^(https?:)?\/\//i.test(raw)) return null;
    var pathOnly = raw.split('#')[0].split('?')[0];
    if(/(^|\/)signin(\.html)?$/.test(pathOnly) || /(^|\/)reset-password(\.html)?$/.test(pathOnly) || /(^|\/)verify(\.html)?$/.test(pathOnly)) return null;
    return raw;
  } catch(e){ return null; }
}
function paAuthHandleSigninCallback(){
  var handled = false;
  var showLinkError = false;
  try {
    var hashParams = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
    if(hashParams.get('error')) showLinkError = true;
    var query = new URLSearchParams(window.location.search || '');
    if(query.get('error')) showLinkError = true;
    var nextRaw = query.get('next');
    var inner = null;
    var innerCode = null;
    var innerTokens = null;
    if(nextRaw){
      /* URLSearchParams already percent-decoded the value once, which
         undoes the gate's single encoding; do not decode again. */
      var decoded = nextRaw;
      var fragAt = decoded.indexOf('#');
      if(fragAt !== -1){
        var fragParams = new URLSearchParams(decoded.slice(fragAt + 1));
        if(fragParams.get('access_token')){
          innerTokens = { access_token: fragParams.get('access_token'), refresh_token: fragParams.get('refresh_token') || '' };
          inner = decoded.slice(0, fragAt) || '/';
        } else if(fragParams.get('error')){
          showLinkError = true;
          inner = decoded.slice(0, fragAt) || '/';
        }
      }
      if(!innerTokens && !inner){
        var qAt = decoded.indexOf('?');
        if(qAt !== -1){
          var innerQuery = new URLSearchParams(decoded.slice(qAt + 1));
          if(innerQuery.get('code')){
            innerCode = innerQuery.get('code');
            innerQuery.delete('code');
            var rest = innerQuery.toString();
            inner = decoded.slice(0, qAt) + (rest ? '?' + rest : '');
          } else if(innerQuery.get('error')){
            showLinkError = true;
            inner = decoded.slice(0, qAt) || '/';
          }
        }
      }
    }
    if(innerTokens || innerCode){
      handled = true;
      var target = paAuthCallbackTarget(inner) || '/dashboard.html';
      paAuthLoadClient(function(client){
        if(!client){ paSignupShowError('passwordError', 'LINK_INVALID'); return; }
        function finish(res){
          if(res && !res.error && res.data && res.data.session){
            paAuthRefreshState();
            window.location.href = target;
          } else {
            paSignupShowError('passwordError', 'LINK_INVALID');
          }
        }
        if(innerTokens){
          client.auth.setSession(innerTokens).then(finish).catch(function(){ paSignupShowError('passwordError', 'LINK_INVALID'); });
        } else {
          client.auth.exchangeCodeForSession(innerCode).then(finish).catch(function(){ paSignupShowError('passwordError', 'LINK_INVALID'); });
        }
      });
      return true;
    }
    if(showLinkError){
      paSignupShowError('passwordError', 'LINK_INVALID');
      handled = true;
    }
  } catch(e){}
  return handled;
}
function paConfirmDialogMaybeShow(afterDismiss){
  function done(){
    if(afterDismiss){ try { afterDismiss(); } catch(e){} }
  }
  try {
    if(sessionStorage.getItem(PA_CONFIRM_DIALOG_FLAG_KEY)){ done(); return; }
  } catch(e){}
  var hashParams = null;
  try { hashParams = new URLSearchParams((window.location.hash || '').replace(/^#/, '')); } catch(e){ hashParams = null; }
  var type = hashParams ? hashParams.get('type') : null;
  var hasToken = !!(hashParams && hashParams.get('access_token'));
  /* Signup and invite links show the confirmation dialog. Magiclink
     and email links (emailed-code sign-in) sign the learner in with
     no dialog, but the hash must still be cleared once the session
     is confirmed, or a refresh replays the link. Other hash types
     are left alone. */
  var isConfirm = (type === 'signup' || type === 'invite');
  var isSigninLink = (type === 'magiclink' || type === 'email');
  if(!hasToken || (!isConfirm && !isSigninLink)){ done(); return; }
  if(document.getElementById('paConfirmOverlay')){ done(); return; }
  paAuthLoadClient(function(client){
    if(!client){ done(); return; }
    client.auth.getSession().then(function(res){
      var session = res.data && res.data.session;
      if(!session){ done(); return; }
      try { history.replaceState(null, '', window.location.pathname + window.location.search); } catch(e){}
      try { sessionStorage.setItem(PA_CONFIRM_DIALOG_FLAG_KEY, '1'); } catch(e){}
      if(!isConfirm){ done(); return; }
      var overlay = document.createElement('div');
      overlay.id = 'paConfirmOverlay';
      overlay.className = 'pa-confirm-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-label', 'Email confirmed');
      var card = document.createElement('div');
      card.className = 'pa-confirm-card';
      var check = document.createElement('div');
      check.className = 'pa-confirm-check';
      check.setAttribute('aria-hidden', 'true');
      check.textContent = '✓';
      var heading = document.createElement('div');
      heading.className = 'pa-confirm-heading';
      heading.textContent = 'Your email is confirmed';
      var line = document.createElement('div');
      line.className = 'pa-confirm-line';
      line.textContent = 'Your account is now active and ready to use.';
      var actions = document.createElement('div');
      actions.className = 'pa-confirm-actions';
      var cont = document.createElement('button');
      cont.type = 'button';
      cont.className = 'pa-confirm-btn';
      cont.textContent = 'Continue';
      actions.appendChild(cont);
      card.appendChild(check);
      card.appendChild(heading);
      card.appendChild(line);
      card.appendChild(actions);
      overlay.appendChild(card);
      document.body.appendChild(overlay);
      var dismissed = false;
      function dismiss(){
        if(dismissed) return;
        dismissed = true;
        if(overlay.parentNode) overlay.parentNode.removeChild(overlay);
        done();
      }
      cont.addEventListener('click', dismiss);
      overlay.addEventListener('click', function(e){ if(e.target === overlay) dismiss(); });
      try { cont.focus(); } catch(e){}
    }).catch(function(){ done(); });
  });
}
/* Load the Supabase client only when it is needed: on the sign-in and
   dashboard pages, or when a session is already stored. Visitors on
   public pages without a session never load it, so those pages stay
   as fast as before. */
(function(){
  if(!PA_AUTH_CONFIG.enabled) return;
  var path = window.location.pathname || '';
  var needsAuth = /signin\.html$/.test(path) || /dashboard\.html$/.test(path) || /reset-password\.html$/.test(path);
  if(needsAuth || paAuthHasStoredSession()){ paAuthShowUI(); paAuthRefreshState(); }
  else { paAuthShowSignedOut(); }
})();
