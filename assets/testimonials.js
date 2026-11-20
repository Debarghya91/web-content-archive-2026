/* Testimonials (20 Nov 2026): homepage "What learners say".
   Reads approved testimonials from Supabase public.testimonials and
   lets a signed-in learner submit one (stored as pending until approved). */
(function(){
  function el(id){ return document.getElementById(id); }
  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function renderList(rows){
    var list = el('pa-testimonials-list');
    if(!list) return;
    if(!rows || !rows.length){
      list.innerHTML = '<p id="pa-testimonials-empty">No testimonials yet. Be the first to share yours.</p>';
      return;
    }
    var html = '';
    rows.forEach(function(r){
      var stars = '';
      var n = parseInt(r.rating, 10);
      if(n >= 1 && n <= 5){
        var s = '';
        for(var i = 0; i < 5; i++){ s += i < n ? '★' : '☆'; }
        stars = '<div class="pf-testimonial-stars" aria-label="' + n + ' out of 5 stars">' + s + '</div>';
      }
      html += '<div class="pf-testimonial">' + stars + '<p class="pf-testimonial-text">' + esc(r.text) + '</p><div class="pf-testimonial-name">' + esc(r.name) + '</div>' + (r.role ? '<div class="pf-testimonial-role">' + esc(r.role) + '</div>' : '') + '</div>';
    });
    list.innerHTML = html;
  }
  function start(){
    var list = el('pa-testimonials-list');
    var formWrap = el('pa-testimonials-form-wrap');
    var signinBox = el('pa-testimonials-signin');
    var form = el('pa-testimonials-form');
    var statusEl = el('pa-tst-status');
    if(!list) return;
    if(typeof paAuthLoadClient !== 'function'){
      if(signinBox) signinBox.hidden = false;
      return;
    }
    paAuthLoadClient(function(client){
      if(!client){
        if(signinBox) signinBox.hidden = false;
        return;
      }
      client.from('testimonials').select('name, role, text, rating, created_at').eq('status', 'approved').order('created_at', {ascending: false}).limit(20).then(function(resp){
        if(resp && !resp.error && resp.data) renderList(resp.data);
      });
      client.auth.getSession().then(function(res){
        var user = res && res.data && res.data.session && res.data.session.user;
        if(!user){
          if(signinBox) signinBox.hidden = false;
          return;
        }
        if(formWrap) formWrap.hidden = false;
        var nameInput = el('pa-tst-name');
        if(nameInput && !nameInput.value){
          var meta = user.user_metadata || {};
          nameInput.value = meta.display_name || meta.full_name || '';
        }
        if(form){
          form.addEventListener('submit', function(ev){
            ev.preventDefault();
            var name = el('pa-tst-name').value.trim();
            var role = el('pa-tst-role').value.trim();
            var text = el('pa-tst-text').value.trim();
            var ratingEl = el('pa-tst-rating');
            var rating = ratingEl ? parseInt(ratingEl.value, 10) : NaN;
            if(!name || !text) return;
            if(statusEl) statusEl.textContent = 'Submitting...';
            client.from('testimonials').insert({user_id: user.id, name: name, role: role || null, text: text, rating: (rating >= 1 && rating <= 5) ? rating : null, status: 'pending'}).then(function(resp){
              if(resp && resp.error){
                if(statusEl) statusEl.textContent = 'Could not submit your testimonial. Please try again.';
                return;
              }
              form.reset();
              if(statusEl) statusEl.textContent = 'Thank you. Your testimonial will appear here once it is reviewed.';
            });
          });
        }
      }).catch(function(){
        if(signinBox) signinBox.hidden = false;
      });
    });
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
