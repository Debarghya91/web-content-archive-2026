/* py-runner: in-browser Python runner for lesson demos.
   Loads the self-hosted Pyodide runtime (assets/pyodide/) on first Run.
   Wraps every <pre class="pf-runnable-python"> block with a Run button
   and an output pane. No account, no install, no network beyond this site. */
(function () {
  var pyodideReady = null;

  function indexURL() {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].src || '';
      if (src.indexOf('py-runner.js') !== -1) {
        return src.replace('py-runner.js', 'pyodide/');
      }
    }
    return '../assets/pyodide/';
  }

  function loadRuntime(out) {
    if (pyodideReady) return pyodideReady;
    out.textContent = 'Loading Python runtime (about 12 MB, first run only)...';
    pyodideReady = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = indexURL() + 'pyodide.js';
      s.onload = function () {
        loadPyodide({ indexURL: indexURL() }).then(resolve, reject);
      };
      s.onerror = function () { reject(new Error('Could not load the Python runtime.')); };
      document.head.appendChild(s);
    });
    return pyodideReady;
  }

  function wrap(block) {
    var wrapEl = document.createElement('div');
    wrapEl.className = 'pf-runner';
    block.parentNode.insertBefore(wrapEl, block);
    wrapEl.appendChild(block);
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pf-btn-gold';
    btn.textContent = 'Run this code';
    var out = document.createElement('pre');
    out.className = 'pf-runner-output';
    out.textContent = 'Press Run to execute this code in your browser. No account, no install.';
    wrapEl.appendChild(btn);
    wrapEl.appendChild(out);
    btn.addEventListener('click', function () {
      btn.disabled = true;
      btn.textContent = 'Running...';
      out.textContent = '';
      var lines = [];
      loadRuntime(out).then(function (py) {
        py.setStdout({ batched: function (s) { lines.push(s); out.textContent = lines.join('\n'); } });
        py.setStderr({ batched: function (s) { lines.push(s); out.textContent = lines.join('\n'); } });
        return py.runPythonAsync(block.textContent);
      }).then(function () {
        btn.disabled = false;
        btn.textContent = 'Run again';
      }).catch(function (e) {
        out.textContent += '\nError: ' + (e && e.message ? e.message : e);
        btn.disabled = false;
        btn.textContent = 'Run again';
      });
    });
  }

  function init() {
    var blocks = document.querySelectorAll('pre.pf-runnable-python');
    for (var i = 0; i < blocks.length; i++) wrap(blocks[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
