/* Code highlighting for Payments Training Hub (11 Nov 2026, top-20 item 19).
   Lightweight, client-side only, no library, no server call.
   Highlights XML schemas, JSON API payloads and SWIFT MT block
   structures in <pre> and <code> elements, and adds a one-click Copy
   button to every <pre> block. The Copy button is an explicit control:
   it works even though lesson text selection is disabled by the copy
   protection, because the learner asked for that block on purpose. */
(function () {
  function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function hlXml(text) {
    var out = escHtml(text);
    /* XML comments */
    out = out.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="hl-com">$1</span>');
    /* Tags: &lt;name ...&gt; and &lt;/name&gt; */
    out = out.replace(/(&lt;\/?)([A-Za-z][\w:.-]*)/g, '$1<span class="hl-tag">$2</span>');
    /* Attribute names and string values */
    out = out.replace(/([\w:.-]+)(=)("[^"]*")/g, '<span class="hl-attr">$1</span>$2<span class="hl-str">$3</span>');
    /* Namespace URNs */
    out = out.replace(/(urn:iso:std:iso:20022:[^\s"<]+)/g, '<span class="hl-ns">$1</span>');
    return out;
  }
  function hlJson(text) {
    var out = escHtml(text);
    out = out.replace(/("(?:[^"\\]|\\.)*")(\s*:)?/g, function (m, s, c) {
      return c ? '<span class="hl-key">' + s + '</span>' + c : '<span class="hl-str">' + s + '</span>';
    });
    out = out.replace(/\b(true|false|null)\b/g, '<span class="hl-kw">$1</span>');
    out = out.replace(/(?<![\w"])(-?\d[\d,]*(?:\.\d+)?)(?![\w"])/g, '<span class="hl-num">$1</span>');
    return out;
  }
  function hlMt(text) {
    var out = escHtml(text);
    /* Block markers {1:...} {2:...} {4: ... -} */
    out = out.replace(/(\{[12345]:[^}]*\})/g, '<span class="hl-block">$1</span>');
    /* MT field tags :20: :32A: :59a: */
    out = out.replace(/(:\d{2}[A-Za-z]?:)/g, '<span class="hl-field">$1</span>');
    /* Message names MT103 pacs.008 camt.029 */
    out = out.replace(/\b(MT\d{3}|pacs\.\d{3}|pain\.\d{3}|camt\.\d{3})\b/g, '<span class="hl-msg">$1</span>');
    /* BICs (8 or 11 chars, 4 letters bank, 2 letters country) */
    out = out.replace(/\b([A-Z]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?)\b/g, '<span class="hl-bic">$1</span>');
    return out;
  }
  function hlProse(text) {
    var out = escHtml(text);
    out = out.replace(/(:\d{2}[A-Za-z]?:)/g, '<span class="hl-field">$1</span>');
    out = out.replace(/\b(MT\d{3}|pacs\.\d{3}|pain\.\d{3}|camt\.\d{3})\b/g, '<span class="hl-msg">$1</span>');
    out = out.replace(/\b([A-Z]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?)\b/g, '<span class="hl-bic">$1</span>');
    return out;
  }
  function highlight(el) {
    if (el.children.length) return;
    var text = el.textContent || '';
    if (!text.trim()) return;
    var html;
    if (/&lt;!--|&lt;\/?[A-Za-z]/.test(text) || /<\/?[A-Za-z]/.test(text)) html = hlXml(text);
    else if (/^\s*[\[{]/.test(text) && /"/.test(text)) html = hlJson(text);
    else if (/\{[12345]:/.test(text) || /:\d{2}[A-Za-z]?:/.test(text)) html = hlMt(text);
    else html = hlProse(text);
    el.innerHTML = html;
    el.classList.add('codehl');
  }
  function addCopyButton(pre) {
    if (pre.querySelector('.codehl-copy')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'codehl-copy';
    btn.textContent = 'Copy';
    btn.setAttribute('aria-label', 'Copy this code block');
    btn.addEventListener('click', function () {
      var text = pre.textContent || '';
      function done(ok) {
        btn.textContent = ok ? 'Copied' : 'Copy failed';
        setTimeout(function () { btn.textContent = 'Copy'; }, 1500);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        document.body.removeChild(ta);
        done(ok);
      }
    });
    pre.classList.add('codehl-pre');
    pre.appendChild(btn);
  }
  document.addEventListener('DOMContentLoaded', function () {
    var pres = document.querySelectorAll('pre');
    pres.forEach(function (pre) {
      var code = pre.querySelector('code');
      var target = code || pre;
      highlight(target);
      addCopyButton(pre);
    });
    var codes = document.querySelectorAll('code:not(pre code)');
    codes.forEach(function (c) { highlight(c); });
    /* XML captions under diagrams carry message text too. */
    document.querySelectorAll('.xml-caption').forEach(function (el) {
      if (!el.children.length) highlight(el);
    });
  });
})();
