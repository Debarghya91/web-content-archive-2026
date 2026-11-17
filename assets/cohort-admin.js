/* ===== Cohort registrations review (site owner only) ===== */
/* Lists the learners registered for the free live cohort
   session, with the login email each one signed in with, so
   joining details and course offers can reach them. The page
   shows nothing to anyone but the admin: the signed-in user
   must carry app_metadata.is_admin, and the list reads through
   PostgREST under the admin-read RLS policy; without that
   policy the list comes back empty. */
var PA_COHORT_ADMIN_TOKEN = '';
var PA_COHORT_ADMIN_ROWS = [];
function paCohortAdminSetStatus(msg){
  var el = document.getElementById('pa-cohort-admin-status');
  if(el) el.textContent = msg || '';
}
function paCohortAdminEl(tag, text, cls){
  var el = document.createElement(tag);
  if(cls) el.className = cls;
  if(text != null) el.textContent = text;
  return el;
}
function paCohortAdminDate(iso){
  var d = iso ? new Date(iso) : null;
  return (d && !isNaN(d.getTime())) ? d.toLocaleString('en-IN') : '';
}
function paCohortAdminCsvValue(value){
  var s = String(value == null ? '' : value);
  if(/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}
function paCohortAdminDownloadCsv(){
  var lines = ['email,cohort_id,registered_at,user_id'];
  PA_COHORT_ADMIN_ROWS.forEach(function(row){
    lines.push([
      paCohortAdminCsvValue(row.email),
      paCohortAdminCsvValue(row.cohort_id),
      paCohortAdminCsvValue(row.registered_at),
      paCohortAdminCsvValue(row.user_id)
    ].join(','));
  });
  var blob = new Blob([lines.join('\n')], {type: 'text/csv'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'cohort-registrations-2026-11-28.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function(){ URL.revokeObjectURL(a.href); }, 1000);
}
function paCohortAdminRender(rows){
  var host = document.getElementById('pa-cohort-admin-list');
  var countEl = document.getElementById('pa-cohort-admin-count');
  var csvBtn = document.getElementById('pa-cohort-admin-csv');
  if(!host) return;
  host.innerHTML = '';
  PA_COHORT_ADMIN_ROWS = rows || [];
  if(countEl) countEl.textContent = PA_COHORT_ADMIN_ROWS.length + (PA_COHORT_ADMIN_ROWS.length === 1 ? ' registration' : ' registrations');
  if(csvBtn) csvBtn.style.display = PA_COHORT_ADMIN_ROWS.length ? 'inline-block' : 'none';
  if(!PA_COHORT_ADMIN_ROWS.length){
    host.appendChild(paCohortAdminEl('p', 'No registrations yet.', 'pa-pay-note'));
    return;
  }
  PA_COHORT_ADMIN_ROWS.forEach(function(row){
    var div = paCohortAdminEl('div', null, 'pa-upi-claim');
    div.appendChild(paCohortAdminEl('p', String(row.email || '')));
    div.appendChild(paCohortAdminEl('p', 'Registered ' + paCohortAdminDate(row.registered_at) + '  Cohort: ' + String(row.cohort_id || ''), 'pa-pay-note'));
    host.appendChild(div);
  });
}
function paCohortAdminLoad(){
  paCohortAdminSetStatus('Loading registrations.');
  var url = String(PA_AUTH_CONFIG.supabaseUrl).replace(/\/+$/, '') + '/rest/v1/cohort_registrations?select=id,user_id,email,cohort_id,registered_at&order=registered_at.asc';
  fetch(url, {headers: {'apikey': PA_AUTH_CONFIG.supabaseAnonKey, 'Authorization': 'Bearer ' + PA_COHORT_ADMIN_TOKEN, 'Accept': 'application/json'}})
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(rows){
      paCohortAdminRender(rows);
      paCohortAdminSetStatus('');
    })
    .catch(function(){ paCohortAdminSetStatus('Could not load registrations. Check your connection and try again.'); });
}
function paCohortAdminInit(){
  if(!document.getElementById('pa-cohort-admin-list')) return;
  var csvBtn = document.getElementById('pa-cohort-admin-csv');
  if(csvBtn) csvBtn.addEventListener('click', paCohortAdminDownloadCsv);
  if(typeof paAuthLoadClient !== 'function' || typeof PA_AUTH_CONFIG === 'undefined'){
    paCohortAdminSetStatus('Sign-in is not available. Please try again later.');
    return;
  }
  paCohortAdminSetStatus('Checking your sign-in.');
  paAuthLoadClient(function(client){
    if(!client){ paCohortAdminSetStatus('Could not load sign-in. Check your connection and try again.'); return; }
    client.auth.getSession().then(function(res){
      var session = res && res.data && res.data.session;
      var user = session && session.user;
      if(!user){
        paCohortAdminSetStatus('Sign in first.');
        var link = document.getElementById('pa-cohort-admin-signin');
        if(link) link.style.display = 'block';
        return;
      }
      var meta = user.app_metadata || {};
      if(meta.is_admin !== true){
        paCohortAdminSetStatus('This page is for the site owner only.');
        return;
      }
      PA_COHORT_ADMIN_TOKEN = session.access_token || '';
      paCohortAdminLoad();
    }).catch(function(){ paCohortAdminSetStatus('Could not check your sign-in. Please try again.'); });
  });
}
document.addEventListener('DOMContentLoaded', paCohortAdminInit);
