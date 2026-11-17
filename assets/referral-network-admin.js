/* ===== Referral network opt-ins review (site owner only) ===== */
/* Lists the learners who opted in to the referral network
   WhatsApp group, with the contact details each one shared, so
   the owner can reach out to them. The page shows nothing to
   anyone but the admin: the signed-in user must carry
   app_metadata.is_admin, and the list reads through PostgREST
   under the admin-read RLS policy; without that policy the list
   comes back empty. Only opted-in rows are shown. */
var PA_REFNET_ADMIN_TOKEN = '';
var PA_REFNET_ADMIN_ROWS = [];
function paRefnetAdminSetStatus(msg){
  var el = document.getElementById('pa-refnet-admin-status');
  if(el) el.textContent = msg || '';
}
function paRefnetAdminEl(tag, text, cls){
  var el = document.createElement(tag);
  if(cls) el.className = cls;
  if(text != null) el.textContent = text;
  return el;
}
function paRefnetAdminDate(iso){
  var d = iso ? new Date(iso) : null;
  return (d && !isNaN(d.getTime())) ? d.toLocaleString('en-IN') : '';
}
function paRefnetAdminCsvValue(value){
  var s = String(value == null ? '' : value);
  if(/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}
function paRefnetAdminDownloadCsv(){
  var lines = ['email,whatsapp_number,linkedin_id,mobile_number,opted_in_at,user_id'];
  PA_REFNET_ADMIN_ROWS.forEach(function(row){
    lines.push([
      paRefnetAdminCsvValue(row.email),
      paRefnetAdminCsvValue(row.whatsapp_number),
      paRefnetAdminCsvValue(row.linkedin_id),
      paRefnetAdminCsvValue(row.mobile_number),
      paRefnetAdminCsvValue(row.created_at),
      paRefnetAdminCsvValue(row.user_id)
    ].join(','));
  });
  var blob = new Blob([lines.join('\n')], {type: 'text/csv'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'referral-network-optins.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function(){ URL.revokeObjectURL(a.href); }, 1000);
}
function paRefnetAdminRender(rows){
  var host = document.getElementById('pa-refnet-admin-list');
  var countEl = document.getElementById('pa-refnet-admin-count');
  var csvBtn = document.getElementById('pa-refnet-admin-csv');
  if(!host) return;
  host.innerHTML = '';
  PA_REFNET_ADMIN_ROWS = rows || [];
  if(countEl) countEl.textContent = PA_REFNET_ADMIN_ROWS.length + (PA_REFNET_ADMIN_ROWS.length === 1 ? ' opt-in' : ' opt-ins');
  if(csvBtn) csvBtn.style.display = PA_REFNET_ADMIN_ROWS.length ? 'inline-block' : 'none';
  if(!PA_REFNET_ADMIN_ROWS.length){
    host.appendChild(paRefnetAdminEl('p', 'No opt-ins yet.', 'pa-pay-note'));
    return;
  }
  PA_REFNET_ADMIN_ROWS.forEach(function(row){
    var div = paRefnetAdminEl('div', null, 'pa-upi-claim');
    div.appendChild(paRefnetAdminEl('p', String(row.email || '')));
    var details = [];
    if(row.whatsapp_number) details.push('WhatsApp: ' + String(row.whatsapp_number));
    if(row.linkedin_id) details.push('LinkedIn: ' + String(row.linkedin_id));
    if(row.mobile_number) details.push('Mobile: ' + String(row.mobile_number));
    div.appendChild(paRefnetAdminEl('p', details.length ? details.join('  ') : 'No contact details shared.', 'pa-pay-note'));
    div.appendChild(paRefnetAdminEl('p', 'Opted in ' + paRefnetAdminDate(row.created_at), 'pa-pay-note'));
    host.appendChild(div);
  });
}
function paRefnetAdminLoad(){
  paRefnetAdminSetStatus('Loading opt-ins.');
  var url = String(PA_AUTH_CONFIG.supabaseUrl).replace(/\/+$/, '') + '/rest/v1/referral_network_optins?select=id,user_id,email,opted_in,whatsapp_number,linkedin_id,mobile_number,created_at&opted_in=eq.true&order=created_at.asc';
  fetch(url, {headers: {'apikey': PA_AUTH_CONFIG.supabaseAnonKey, 'Authorization': 'Bearer ' + PA_REFNET_ADMIN_TOKEN, 'Accept': 'application/json'}})
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(rows){
      paRefnetAdminRender(rows);
      paRefnetAdminSetStatus('');
    })
    .catch(function(){ paRefnetAdminSetStatus('Could not load opt-ins. Check your connection and try again.'); });
}
function paRefnetAdminInit(){
  if(!document.getElementById('pa-refnet-admin-list')) return;
  var csvBtn = document.getElementById('pa-refnet-admin-csv');
  if(csvBtn) csvBtn.addEventListener('click', paRefnetAdminDownloadCsv);
  if(typeof paAuthLoadClient !== 'function' || typeof PA_AUTH_CONFIG === 'undefined'){
    paRefnetAdminSetStatus('Sign-in is not available. Please try again later.');
    return;
  }
  paRefnetAdminSetStatus('Checking your sign-in.');
  paAuthLoadClient(function(client){
    if(!client){ paRefnetAdminSetStatus('Could not load sign-in. Check your connection and try again.'); return; }
    client.auth.getSession().then(function(res){
      var session = res && res.data && res.data.session;
      var user = session && session.user;
      if(!user){
        paRefnetAdminSetStatus('Sign in first.');
        var link = document.getElementById('pa-refnet-admin-signin');
        if(link) link.style.display = 'block';
        return;
      }
      var meta = user.app_metadata || {};
      if(meta.is_admin !== true){
        paRefnetAdminSetStatus('This page is for the site owner only.');
        return;
      }
      PA_REFNET_ADMIN_TOKEN = session.access_token || '';
      paRefnetAdminLoad();
    }).catch(function(){ paRefnetAdminSetStatus('Could not check your sign-in. Please try again.'); });
  });
}
document.addEventListener('DOMContentLoaded', paRefnetAdminInit);
