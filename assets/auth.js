
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
  var cd = paResendStatus('emailcode', email);
  if(cd.limitReached){ alert('Too many codes sent to this email address. Try again later.'); return; }
  if(!cd.canSend){ return; }
  paAuthOtpBusy = true;
  paAuthLoadClient(function(client){
    if(!client){ paAuthOtpBusy = false; alert('The sign-in service could not be reached. Check your connection and try again.'); return; }
    client.auth.signInWithOtp({ email: email }).then(function(res){
      paAuthOtpBusy = false;
      paResendRecord('emailcode', email);
      if(res.error){ alert('Could not send the code: ' + res.error.message); return; }
      var code = document.getElementById('authCode');
      var vb = document.getElementById('authVerifyBtn');
      if(code) code.style.display = 'inline-block';
      if(vb) vb.style.display = 'inline-block';
      alert('Code sent to ' + email + '. Enter it here.');
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
  EMAIL_NOT_VERIFIED: 'Verify your email address first.',
  EMAIL_INVALID: 'Enter a valid email address.',
  REFERRAL_INVALID: 'That referral code is not valid.',
  REFERRAL_SELF: 'You cannot use your own referral code.',
  REFERRAL_ALREADY_USED: 'A referral discount was already used on this account.',
  TERMS_NOT_ACCEPTED: 'Accept the terms and conditions to continue.',
  CREDENTIALS_INVALID: 'Email or password does not match our records.',
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
  RESET_LINK_INVALID: 'This password reset link has expired or was already used. Request a new one.'
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
  if(!email || email.indexOf('@') === -1){ paSignupShowError('signupError', 'EMAIL_INVALID'); return; }
  if(pw1.length < 8){ paSignupShowError('signupError', 'PASSWORD_TOO_SHORT'); return; }
  if(pw1 !== pw2){ paSignupShowError('signupError', 'PASSWORD_MISMATCH'); return; }
  if(!terms || !terms.checked){ paSignupShowError('signupError', 'TERMS_NOT_ACCEPTED'); return; }
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
function paResetPasswordInit(){
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
    if(checking) checking.style.display = 'none';
    if(invalid) invalid.style.display = 'none';
    if(form) form.style.display = 'block';
    var pw = document.getElementById('resetPassword');
    if(pw) pw.focus();
  }
  paAuthLoadClient(function(client){
    if(!client){ showInvalid('UNKNOWN_ERROR'); return; }
    function checkSession(){
      client.auth.getSession().then(function(res){
        var session = res.data && res.data.session;
        if(session){ showForm(); }
        else { showInvalid('RESET_LINK_INVALID'); }
      }).catch(function(){ showInvalid('RESET_LINK_INVALID'); });
    }
    var code = null;
    try { code = new URLSearchParams(window.location.search).get('code'); } catch(e){ code = null; }
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
    client.auth.updateUser({ password: pw1 }).then(function(res){
      paSignupState.busy = false;
      if(res.error){
        paSignupShowError('resetError', paResetMapError(res.error.message));
        return;
      }
      var form = document.getElementById('resetForm');
      var done = document.getElementById('resetDone');
      if(form) form.style.display = 'none';
      if(done) done.style.display = 'block';
      paAuthRefreshState();
    }).catch(function(err){
      paSignupState.busy = false;
      paSignupShowError('resetError', paResetMapError(err && err.message));
    });
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
  browse.href = 'courses.html';
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
/* Load the Supabase client only when it is needed: on the sign-in and
   dashboard pages, or when a session is already stored. Guests reading
   lessons never load it, so lesson pages stay as fast as before. */
(function(){
  if(!PA_AUTH_CONFIG.enabled) return;
  var path = window.location.pathname || '';
  var needsAuth = /signin\.html$/.test(path) || /dashboard\.html$/.test(path) || /reset-password\.html$/.test(path);
  if(needsAuth || paAuthHasStoredSession()){ paAuthShowUI(); paAuthRefreshState(); }
  else { paAuthShowSignedOut(); }
})();
