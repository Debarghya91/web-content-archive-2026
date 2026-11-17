

/* ===== Visual Learning Engine: audio-driven synchronisation ===== */
/* The audio element currentTime is the ONLY source of truth. No timers. */
/* Beat timestamps are ESTIMATED (proportional allocation of narration */
/* text against the real audio duration). Never claimed as precise. */
var PA_STUDIO_DATA = {};
var PA_STUDIOS = {};
/* Lock-first gating (17 Nov 2026): samples whose init the lesson gate
   held back because the page's lesson starts locked. studioInit
   records them here instead of initialising; studioStartPending runs
   them once the entitlement check resolves to access. */
var PA_STUDIO_PENDING = {};
/* Audio failover (10 Nov 2026): the mirror audio host. ONE constant, in
   this one place, so the fallback URL changes in a single spot if the
   mirror host moves. The player tries the primary audio URL first; on a
   load error or an 8-second load timeout it switches the audio source to
   AUDIO_FALLBACK_HOST + '/audio/<lesson>.mp3' and retries automatically.
   Only when both hosts fail does the error box appear. */
var AUDIO_FALLBACK_HOST = 'https://paymentforge-audio-backup.pages.dev';
var AUDIO_LOAD_TIMEOUT_MS = 8000;
/* Detailed explanations render as separate paragraphs, never one wall
   of text (website parity, item 6, 12 Nov 2026). These mirrors follow
   the same rules as the Python helpers in studio_html: the source
   paragraphs array when it is exactly the transcript, else blank lines,
   else sentence boundaries grouped into paragraphs of three to five
   sentences. Wording is never changed. No lookbehind regex: older
   Safari would reject the whole script block on a syntax error. */
var PARA_ABBREV = {mr:1, mrs:1, ms:1, dr:1, st:1, vs:1, etc:1, no:1, fig:1, approx:1, dept:1, est:1, jr:1, sr:1, prof:1, capt:1, lt:1, col:1, gen:1, sgt:1};
function studioEscHtml(s){
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function studioNormWs(s){
  return String(s == null ? '' : s).replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
}
function studioSplitSentences(text){
  var norm = studioNormWs(text);
  if(!norm) return [];
  var parts = [];
  var start = 0;
  for(var i = 0; i < norm.length; i++){
    var ch = norm.charAt(i);
    if(ch !== '.' && ch !== '!' && ch !== '?') continue;
    var j = i + 1;
    if(j < norm.length && (norm.charAt(j) === '"' || norm.charAt(j) === "'" || norm.charAt(j) === ')' || norm.charAt(j) === ']')) j++;
    if(j < norm.length && norm.charAt(j) === ' '){
      parts.push(norm.substring(start, j).replace(/^\s+|\s+$/g, ''));
      start = j + 1;
      i = j;
    }
  }
  var tail = norm.substring(start).replace(/^\s+|\s+$/g, '');
  if(tail) parts.push(tail);
  var out = [];
  for(var k = 0; k < parts.length; k++){
    var part = parts[k];
    if(!part) continue;
    if(out.length){
      var prev = out[out.length - 1];
      var m = prev.match(/([A-Za-z]+)\.["')\]]?$/);
      if(m && (m[1].length === 1 || PARA_ABBREV[m[1].toLowerCase()])){
        out[out.length - 1] = prev + ' ' + part;
        continue;
      }
    }
    out.push(part);
  }
  return out;
}
function studioGroupSentences(sentences){
  var paras = [];
  var cur = [];
  var curLen = 0;
  for(var i = 0; i < sentences.length; i++){
    var s = sentences[i];
    if(cur.length && (cur.length >= 5 || (cur.length >= 3 && curLen >= 500))){
      paras.push(cur.join(' '));
      cur = [];
      curLen = 0;
    }
    cur.push(s);
    curLen += s.length + 1;
  }
  if(cur.length) paras.push(cur.join(' '));
  return paras;
}
function studioSplitTextParagraphs(text){
  var raw = (text == null ? '' : String(text));
  if(!studioNormWs(raw)) return [];
  var chunks = raw.split(/\n\s*\n/);
  var paras = [];
  for(var i = 0; i < chunks.length; i++){
    var sents = studioSplitSentences(chunks[i]);
    if(sents.length) paras = paras.concat(studioGroupSentences(sents));
  }
  if(!paras.length) paras = [studioNormWs(raw)];
  return paras;
}
function studioTranscriptParagraphs(transcript, paragraphs){
  var items = [];
  if(paragraphs){
    for(var i = 0; i < paragraphs.length; i++){
      var p = studioNormWs(paragraphs[i]);
      if(p) items.push(p);
    }
  }
  if(items.length && studioNormWs(transcript) === studioNormWs(items.join(' '))) return items;
  return studioSplitTextParagraphs(transcript);
}
function studioParagraphsHtml(text){
  var paras = studioSplitTextParagraphs(text);
  var html = '';
  for(var i = 0; i < paras.length; i++){ html += '<p>' + studioEscHtml(paras[i]) + '</p>'; }
  return html;
}
function studioInit(sampleId){
  /* Lock-first gating (17 Nov 2026): bundles.js runs before this file
     and marks the sample of a lesson that starts locked in
     PA_GATE_EARLY_LOCKED. Do not initialise at all: no state, no
     listeners, no scene load, no autoplay flag, no background fetch,
     no audio source. The gate calls studioStartPending() when the
     entitlement check resolves to access. */
  if(typeof window.PA_GATE_EARLY_LOCKED === 'object' && window.PA_GATE_EARLY_LOCKED &&
     window.PA_GATE_EARLY_LOCKED[sampleId]){
    PA_STUDIO_PENDING[sampleId] = true;
    return;
  }
  var data = PA_STUDIO_DATA[sampleId];
  var root = document.getElementById('studio-' + sampleId);
  if(!root || !data){ studioShowError(sampleId, 'This lesson player could not start: the lesson data is missing. Try reloading the page.'); return; }
  var audio = document.getElementById('studio-audio-' + sampleId);
  if(!audio){ studioShowError(sampleId, 'This lesson player could not start: the narration audio is missing. Try reloading the page.'); return; }
  var st = {data: data, audio: audio, scene: 0, beat: -1, captions: true,
            total: 0, starts: [], doneScenes: {}, seenStages: {}, endTimer: null,
            wantAutoplay: true, visualTimer: null, visualT: 0, visualMode: false,
            audioProgressAt: 0, audioLoadKicked: false, pendingSeek: null,
            seekFrom: 0, seekVerifyTimer: null, seekGateTimer: null,
            seekGateActive: false, seekGateMuted: false,
            seekGateSavedMuted: false, seekGateWantPaused: false,
            blobSeq: 0, blobUrl: null, blobFile: null, blobFetching: null};
  var t = 0;
  data.scenes.forEach(function(s){ st.starts.push(t); t += s.duration_sec; });
  st.total = t;
  PA_STUDIOS[sampleId] = st;
  /* Restore the persisted mute choice (set by the player mute button on
     this or an earlier lesson) before the first scene loads, so a reload
     or an auto-advance to the next lesson does not turn the sound back
     on. studioLoadScene applies the global below. */
  try {
    var savedMute = sessionStorage.getItem('pa-sound-muted');
    if(savedMute !== null && typeof soundMuted !== 'undefined') soundMuted = (savedMute === '1');
  } catch(e){}
  audio.addEventListener('timeupdate', function(){ studioRefresh(sampleId); });
  audio.addEventListener('timeupdate', function(){
    /* Fix round 3: advancing playback is proof of life. The error box
       can be shown by a stale failure signal after loadeddata and
       canplay already fired, so those hide paths never run again and
       the box stays up while the narration plays. Only a moving
       playhead proves the error stale. A genuinely dead source never
       advances currentTime, so this cannot hide a real failure. */
    if(st.audioFailed && !audio.paused && audio.readyState >= 2 && audio.currentTime > 0){
      st.audioFailed = false;
      studioHideError(sampleId);
    }
  });
  audio.addEventListener('ended', function(){ studioSceneEnded(sampleId); });
  audio.addEventListener('play', function(){ studioSetPlayLabel(sampleId); studioDisarmAutoplayRetry(sampleId); });
  audio.addEventListener('pause', function(){ studioSetPlayLabel(sampleId); studioStopVisual(sampleId); });
  /* First-play buffering: show a loading state until the audio can
     actually play, so a slow connection does not look like a dead
     player. 'waiting' covers stalls mid-lesson; 'playing' is the proof
     sound started, so it hides the loading state and forces a caption
     refresh from the real audio position. */
  audio.addEventListener('waiting', function(){ studioShowLoading(sampleId, true); });
  audio.addEventListener('canplay', function(){ studioShowLoading(sampleId, false); });
  audio.addEventListener('playing', function(){ studioShowLoading(sampleId, false); studioRefresh(sampleId); studioSetPlayLabel(sampleId); });
  /* Audio failover (10 Nov 2026): a load error, or no playable data
     within AUDIO_LOAD_TIMEOUT_MS, switches the source to the mirror host
     automatically. 'loadeddata'/'canplay' from either host clears the
     timer, so a working clip never trips the failover. */
  audio.addEventListener('error', function(){
    /* Fix batch 2, fix 3: only a live error counts. A stale error
       signal from a superseded load must not fail over (or show the
       error box) while the current source is still loading: changing
       src resets audio.error, so a stale event sees no error here.
       Fix round 3: only a FATAL error fails over. While the browser
       reports seeking, the error belongs to the seek's re-download
       and the seek verify owns the position; failing over would
       discard the buffer and reset playback to 0:00. With playable
       data present (readyState 2 or more) a mid-stream download
       error must not discard a working buffer either: the buffered
       narration keeps playing and the fetch resumes on continued
       playback, while failing over resets the position for a
       transient snag. Only an error with no playable data is a
       genuine load failure. */
    if(!audio.error) return;
    if(audio.seeking) return;
    if(audio.readyState >= 2) return;
    studioAudioFailed(sampleId);
  });
  audio.addEventListener('loadeddata', function(){ studioAudioLoaded(sampleId); });
  audio.addEventListener('canplay', function(){ studioAudioLoaded(sampleId); });
  /* Load liveness (15 Nov 2026, polish round): progress events prove
     bytes are arriving, which the load timer uses to tell a slow fetch
     from a stalled one. networkState alone cannot: it reads IDLE while
     a request waits for its first byte and while a paused element's
     fetch is suspended. */
  audio.addEventListener('progress', function(){
    st.audioProgressAt = Date.now();
    /* Fix round 3: bytes arriving after a failure prove the current
       source alive, so a shown error box is stale. A genuinely dead
       source delivers no bytes, so this cannot hide a real failure. */
    if(st.audioFailed){ st.audioFailed = false; studioHideError(sampleId); }
  });
  /* After any seek completes, re-sync the display from the real audio
     position, so a seek the browser applied late (or not at all) cannot
     leave the timeline showing a stale time. */
  audio.addEventListener('seeked', function(){ studioRefresh(sampleId); });
  var slider = document.getElementById('studio-slider-' + sampleId);
  if(slider){
    slider.addEventListener('input', function(){
      studioSeekVirtual(sampleId, parseFloat(slider.value));
    });
    /* Scrub state: while the reader drags the slider, timeupdate must not
       fight the thumb. The old code used document.activeElement, but a
       clicked slider keeps focus forever, so the slider froze at the
       clicked value while playback advanced. A drag flag plus a blur on
       release fixes both. */
    var scrubStart = function(){ st.sliderScrubbing = true; };
    var scrubEnd = function(){
      st.sliderScrubbing = false;
      try { slider.blur(); } catch(e){}
      studioRefresh(sampleId);
    };
    slider.addEventListener('pointerdown', scrubStart);
    slider.addEventListener('mousedown', scrubStart);
    slider.addEventListener('touchstart', scrubStart, {passive: true});
    slider.addEventListener('pointerup', scrubEnd);
    slider.addEventListener('mouseup', scrubEnd);
    slider.addEventListener('touchend', scrubEnd);
    slider.addEventListener('change', scrubEnd);
  }
  /* Tapping the canvas toggles play/pause (standard video behaviour).
     The old big play overlay is gone; the control-bar play button is the
     main control, and a tap on the canvas itself also toggles. */
  var canvas = root.querySelector('.studio-canvas');
  if(canvas) canvas.addEventListener('click', function(ev){
    var tgt = ev.target;
    if(tgt && tgt.closest && tgt.closest('button, input, select, a')) return;
    studioTogglePlay(sampleId);
  });
  /* Netflix-style controls (Nov 2026): the bar lives inside the video and
     shows only on hover, on mouse move, or when paused. While playing it
     hides after 3s of stillness; moving the mouse brings it back.
     Touch devices have no hover: auto-hiding the bar after 3s leaves the
     reader tapping once just to reveal the controls, so on coarse
     pointers the bar stays visible and never auto-hides. */
  var coarsePointer = false;
  try { coarsePointer = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches); } catch(e){}
  st.coarsePointer = coarsePointer;
  var player = root.querySelector('.player');
  var hideTimer = null;
  function showControls(){
    if(!player) return;
    player.classList.add('show-controls');
    if(hideTimer){ clearTimeout(hideTimer); hideTimer = null; }
    if(!coarsePointer && audio && !audio.paused){
      hideTimer = setTimeout(function(){
        /* Never hide the bar while a settings popover is open: the
           popover lives inside the bar, so hiding it would make the
           settings unclickable mid-adjustment (15 Nov 2026, fix 3). */
        var popOpen = false;
        if(player) player.querySelectorAll('.ctrl-popover').forEach(function(p){
          if(p.style.display === 'block') popOpen = true;
        });
        if(player && !popOpen) player.classList.remove('show-controls');
      }, 3000);
    }
  }
  if(player){
    player.addEventListener('mousemove', showControls);
    player.addEventListener('mouseenter', showControls);
    player.addEventListener('click', showControls);
    player.addEventListener('mouseleave', function(){
      if(hideTimer){ clearTimeout(hideTimer); hideTimer = null; }
      if(!coarsePointer && audio && !audio.paused) player.classList.remove('show-controls');
    });
    player.addEventListener('touchstart', showControls, {passive: true});
  }
  audio.addEventListener('play', showControls);
  audio.addEventListener('pause', function(){
    if(hideTimer){ clearTimeout(hideTimer); hideTimer = null; }
    if(player) player.classList.add('show-controls');
  });
  showControls();
  studioRenderMarkers(sampleId);
  studioLoadScene(sampleId, 0, false);
  /* The big Play button must be visible from the start when the narration
     is not playing (for example autoplay blocked): the 'play' event hides
     it as soon as sound starts, so it never covers a playing lesson. */
  if(audio.paused) studioShowPlayOverlay(sampleId, true);
  studioSyncMuteButton(sampleId);
  studioRestoreBookmark(sampleId);
}
/* Start any studio inits the lock-first gate held back. Called by the
   lesson gate after the entitlement check resolves to access. Safe to
   call repeatedly: initialised samples are skipped, and a sample that
   is still locked stays pending. */
function studioStartPending(){
  var ids = Object.keys(PA_STUDIO_PENDING);
  for(var i = 0; i < ids.length; i++){
    var id = ids[i];
    delete PA_STUDIO_PENDING[id];
    if(PA_STUDIOS[id]) continue;
    if(window.PA_GATE_EARLY_LOCKED && window.PA_GATE_EARLY_LOCKED[id]){
      PA_STUDIO_PENDING[id] = true;
      continue;
    }
    try { studioInit(id); }
    catch(e){ if(window.console) console.error('studio init failed', id, e); }
  }
}
/* Central playback attempt. fromUser=true shows a visible error when the
   browser refuses playback (for example iOS Safari blocking autoplay);
   fromUser=false (the open-page autoplay attempt) shows no error; the
   user taps the control-bar play button. The old big play overlay was
   removed (Nov 2026) because it overlapped the caption. */
function studioPlayAudio(sampleId, fromUser){
  var st = PA_STUDIOS[sampleId];
  if(!st || !st.audio) return;
  if(st.audio.readyState === 0){ try { st.audio.load(); } catch(e){} }
  /* First-play buffering: show a loading state until the audio can
     actually play. It hides on the 'playing' event. */
  if(st.audio.readyState < 2) studioShowLoading(sampleId, true);
  var p = st.audio.play();
  if(p && p.catch){
    p.catch(function(){
      studioShowLoading(sampleId, false);
      /* A failed load goes through failover, not the autoplay path:
         retrying play on a dead source never helps, and the mirror
         host may answer where the primary did not. Only a live media
         error with no playable data counts: networkState alone can
         read NO_SOURCE transiently right after load(), before resource
         selection runs, and failing over on it discards a healthy
         load (15 Nov 2026, fix round 3). A genuine source failure
         always sets audio.error, so nothing real is missed. */
      if(st.audio && st.audio.error && st.audio.readyState < 2){
        studioAudioFailed(sampleId);
        return;
      }
      if(fromUser){
        studioShowError(sampleId, 'Playback could not start. Tap Play again.');
      } else {
        /* iOS Safari blocks autoplay with sound before the first tap.
           HOLD at beat 0: do not advance the visuals on their own
           timeline, or the diagram runs ahead of the narration and the
           reader taps Play to find the opening already skipped. The
           sound is retried automatically on the first interaction
           anywhere on the page (any tap, scroll touch or key press),
           not only on the Play button, so the narration starts from 0
           by itself as soon as the browser allows it. */
        studioArmAutoplayRetry(sampleId);
      }
      studioShowPlayOverlay(sampleId, true);
    });
  }
}
/* Autoplay retry: when the browser blocks autoplay with sound, keep trying
   to start the narration on the first interaction anywhere on the page.
   The listener removes itself once the audio is playing, so it never
   fires again. No tap on the Play button is required. */
function studioArmAutoplayRetry(sampleId){
  var st = PA_STUDIOS[sampleId];
  if(!st || st.autoplayRetryArmed) return;
  /* Lock-first defence in depth (17 Nov 2026): never arm the retry
     for a sample the lesson gate has marked locked. */
  if(window.PA_GATE_EARLY_LOCKED && window.PA_GATE_EARLY_LOCKED[sampleId]) return;
  st.autoplayRetryArmed = true;
  var retry = function(ev){
    /* Fix round 4: an interaction that began on a control must not
       start playback here. pointerdown fires before click in the same
       gesture, so a tap on a Play button used to play here and then
       immediately pause in the button's click toggle, and the first
       tap appeared to do nothing. Taps on controls own their click
       handlers, so the retry skips them and stays armed for the next
       interaction elsewhere. The canvas is a toggle surface too (its
       click handler toggles play), so it is skipped as well. Taps on
       plain content, scroll touches and key presses with no control
       focused still start the narration, as before. A call with no
       event (the visibility handler) is unaffected. */
    if(ev && ev.target && ev.target.closest &&
       ev.target.closest('button, input, select, textarea, a, .studio-canvas')) return;
    var s2 = PA_STUDIOS[sampleId];
    if(!s2 || !s2.audio || !s2.audio.paused){
      studioDisarmAutoplayRetry(sampleId);
      return;
    }
    studioTryPlay(sampleId, false);
    var s3 = PA_STUDIOS[sampleId];
    if(s3 && s3.audio && !s3.audio.paused) studioDisarmAutoplayRetry(sampleId);
  };
  st.autoplayRetryHandler = retry;
  st.autoplayRetryVisHandler = function(){
    if(!document.hidden) retry();
  };
  document.addEventListener('pointerdown', retry, {passive: true});
  document.addEventListener('keydown', retry);
  document.addEventListener('touchstart', retry, {passive: true});
  document.addEventListener('visibilitychange', st.autoplayRetryVisHandler);
}
function studioDisarmAutoplayRetry(sampleId){
  var st = PA_STUDIOS[sampleId];
  if(!st) return;
  if(st.autoplayRetryHandler){
    document.removeEventListener('pointerdown', st.autoplayRetryHandler);
    document.removeEventListener('keydown', st.autoplayRetryHandler);
    document.removeEventListener('touchstart', st.autoplayRetryHandler);
    st.autoplayRetryHandler = null;
  }
  if(st.autoplayRetryVisHandler){
    document.removeEventListener('visibilitychange', st.autoplayRetryVisHandler);
    st.autoplayRetryVisHandler = null;
  }
  st.autoplayRetryArmed = false;
}
/* Hard stop for a locked lesson (17 Nov 2026): clear every flag that
   can restart playback after a pause, disarm the retry, and pause.
   paGateSilence calls this; pausing alone is not enough, because the
   async setSrc callback and the failover path re-read these flags. */
function studioCancelAutoplay(sampleId){
  var st = PA_STUDIOS[sampleId];
  if(st){ st.wantAutoplay = false; st.audioPlayWanted = false; }
  studioDisarmAutoplayRetry(sampleId);
  try {
    var a = document.getElementById('studio-audio-' + sampleId);
    if(a && a.pause) a.pause();
  } catch(e){}
}
function studioStopVisual(sampleId){
  var st = PA_STUDIOS[sampleId];
  if(!st) return;
  if(st.visualTimer){ clearInterval(st.visualTimer); st.visualTimer = null; }
  st.visualMode = false;
}
function studioTryPlay(sampleId, fromUser){
  var st = PA_STUDIOS[sampleId];
  if(!st) return;
  if(typeof pauseAllAudio === 'function') pauseAllAudio();
  /* Start the narration from the audio position (0 after a blocked
     autoplay). Never jump to a visual clock: the visuals no longer run
     ahead of the audio, so there is nothing to catch up to. */
  studioStopVisual(sampleId);
  st.audio.muted = (typeof soundMuted !== 'undefined') ? soundMuted : st.audio.muted;
  /* A user-initiated play is a play the failover must resume after a
     host switch, so the mirror picks up where the primary stopped. */
  st.audioPlayWanted = true;
  studioPlayAudio(sampleId, fromUser);
}
function studioShowError(sampleId, msg){
  var e = document.getElementById('studio-error-' + sampleId);
  if(e){ e.textContent = msg; e.style.display = 'block'; }
}
function studioShowLoading(sampleId, show){
  var l = document.getElementById('studio-loading-' + sampleId);
  if(l) l.style.display = show ? 'block' : 'none';
}
function studioHideError(sampleId){
  var e = document.getElementById('studio-error-' + sampleId);
  if(e) e.style.display = 'none';
}
function studioShowPlayOverlay(sampleId, show){
  var o = document.getElementById('studio-overlay-' + sampleId);
  if(!o) return;
  /* Once both audio hosts have failed, the Play button stays hidden: the
     error box with Retry is the way back, and a Play button that can
     never produce sound would be a dead end. */
  if(show){
    var st = PA_STUDIOS[sampleId];
    if(st && st.audioFailed) return;
  }
  o.style.display = show ? 'flex' : 'none';
}
/* ---- Audio failover (10 Nov 2026) ---- */
/* The player tries the primary audio URL first. On a load error or an
   8-second load timeout it switches to the mirror host automatically and
   retries, without the learner doing anything. Only when both hosts fail
   does the error box appear, with Retry and a link to the transcript. */
function studioAudioFileName(sampleId){
  var st = PA_STUDIOS[sampleId];
  var src = (st && st.audio) ? (st.audio.currentSrc || st.audio.src || '') : '';
  /* Fix round 5: after the blob swap the element source is a blob: URL
     whose last path segment is an opaque id, not the lesson file. The
     cached blob file name is the real file, so failover builds the
     mirror URL from it instead of a bogus id. */
  if(src.indexOf('blob:') === 0 && st && st.blobFile) return st.blobFile;
  var parts = src.split('/');
  return parts[parts.length - 1] || '';
}
function studioFallbackAudioUrl(sampleId){
  return AUDIO_FALLBACK_HOST + '/audio/' + studioAudioFileName(sampleId);
}
function studioArmAudioLoadTimer(sampleId){
  var st = PA_STUDIOS[sampleId];
  if(!st) return;
  studioDisarmAudioLoadTimer(sampleId);
  st.audioLoadTimer = setTimeout(function(){
    var s2 = PA_STUDIOS[sampleId];
    if(!s2 || !s2.audio || s2.audioFailed) return;
    /* Metadata arrived: the host answered and the file is real, so the
       timer stands down. A paused, never-played element can sit at
       readyState 1 with its fetch suspended indefinitely; failing over
       would discard a healthy load and show the error box for audio
       that plays fine on tap (15 Nov 2026, polish round: the retest
       showed the error on first load on all three sampled lessons
       although Play started the narration at once). From here only a
       genuine error event fails over. */
    if(s2.audio.readyState >= 1) return;
    /* Bytes arrived within this window: the download is alive, however
       slow, so re-arm for another full window. A progressing download
       is never a failure, no matter how many windows it needs: the old
       capped re-arm budget failed over a slow-but-alive cold-cache
       fetch and showed the error box for audio that plays fine
       (15 Nov 2026, fix round 3). Only a full silent window counts. */
    var progressed = s2.audioProgressAt &&
      (Date.now() - s2.audioProgressAt < AUDIO_LOAD_TIMEOUT_MS);
    if(progressed){
      studioArmAudioLoadTimer(sampleId);
      return;
    }
    /* Nothing arrived and no metadata: the browser may never have
       started the fetch (deferred preload of a paused element). Kick
       it once with load() before giving up on this host. */
    if(!s2.audioLoadKicked){
      s2.audioLoadKicked = true;
      try { s2.audio.load(); } catch(e){}
      studioArmAudioLoadTimer(sampleId);
      return;
    }
    /* Paused with no error: the browser may have suspended the fetch
       or never started it (autoplay blocked on a reload, deferred
       preload). Failing over here discards a healthy load and, on the
       mirror, shows the error box for audio that plays fine on tap
       (15 Nov 2026, fix round 2: the reload error on two sampled
       lessons). Stand down instead: tapping Play kicks the load, and
       a genuine failure surfaces through the error event, which fails
       over on its own. Only a lesson actually trying to play with
       nothing arriving fails over from this timer. */
    if(s2.audio.paused && !s2.audio.error) return;
    studioAudioFailed(sampleId);
  }, AUDIO_LOAD_TIMEOUT_MS);
}
function studioDisarmAudioLoadTimer(sampleId){
  var st = PA_STUDIOS[sampleId];
  if(st && st.audioLoadTimer){ clearTimeout(st.audioLoadTimer); st.audioLoadTimer = null; }
}
/* ---- Background fetch + blob swap (15 Nov 2026, fix round 5) ---- */
/* Both audio hosts ignore Range requests (verified: a Range request
   returns the whole file with 200 OK and no Content-Range), so the
   browser media pipeline cannot fetch the middle of a file and seeks
   past the downloaded frontier fail no matter what the seek code
   does: a paused seek resets to 0:00, a playing seek does nothing,
   while a fully downloaded lesson seeks fine. The fix removes the
   pipeline's dependence on Range entirely. In parallel with normal
   progressive playback, the whole MP3 is fetched in the background
   (the hosts send Access-Control-Allow-Origin *, so the bytes are
   readable cross-origin); when the fetch completes, the element
   source swaps to a blob: URL built from those bytes. A blob: URL
   seeks locally with no network request, so every seek works on
   every lesson length. The swap is not a scene load: it never goes
   through studioLoadScene/setSrc, never zeroes the position, never
   clears a pending seek, never re-arms the load timer and never
   re-triggers the autoplay attempt. A failed background fetch
   degrades silently to today's progressive behaviour. The seek
   verify and the gated seek stay untouched as backstops: after the
   swap every target reads as buffered, so the gate never waits. */
/* Cache key for a fetched file: the file name only. The mirror host
   serves the same file under the same name, so a blob fetched from
   the primary is the same narration after a failover, and file names
   are unique per lesson, so the key cannot mistake one lesson for
   another. Query strings (signed URLs) are stripped. */
function studioBlobFileKey(url){
  try {
    var p = String(url || '').split('?')[0].split('#')[0];
    return p.split('/').pop() || '';
  } catch(e){ return ''; }
}
/* Start (or reuse) the background full-file fetch for a source URL.
   Called from setSrc on every scene load, from the failover branch
   with the mirror URL, and from Retry with the primary URL; every
   caller assigns the progressive source first. Idempotent: a cached
   blob swaps in at once, an in-flight fetch owns the swap, and a
   newer call supersedes an older fetch through the blobSeq token. */
function studioStartBlobFetch(sampleId, url){
  var st = PA_STUDIOS[sampleId];
  if(!st || !st.audio || !url) return;
  if(typeof fetch !== 'function') return;
  if(typeof URL === 'undefined' || !URL.createObjectURL) return;
  var file = studioBlobFileKey(url);
  if(!file) return;
  if(st.blobFile === file && st.blobUrl){
    studioSwapToBlob(sampleId, st.blobUrl);
    return;
  }
  if(st.blobFetching === file) return;
  /* A different file: drop the old cached blob. Every caller assigns
     the new progressive source before calling here, so the element
     no longer uses the old blob. */
  if(st.blobUrl){
    try { URL.revokeObjectURL(st.blobUrl); } catch(e){}
    st.blobUrl = null;
    st.blobFile = null;
  }
  st.blobSeq = (st.blobSeq || 0) + 1;
  var mySeq = st.blobSeq;
  st.blobFetching = file;
  var settled = false;
  var finish = function(blob){
    if(settled) return;
    settled = true;
    if(st.blobFetching === file) st.blobFetching = null;
    if(!blob) return;
    if(mySeq !== st.blobSeq) return;
    var blobUrl = null;
    try { blobUrl = URL.createObjectURL(blob); } catch(e){}
    if(!blobUrl) return;
    st.blobUrl = blobUrl;
    st.blobFile = file;
    studioSwapToBlob(sampleId, blobUrl);
  };
  function fetchOne(u, thenMirror){
    var p = null;
    try { p = fetch(u); } catch(e){ p = null; }
    if(!p || !p.then){
      if(thenMirror) fetchMirror();
      else finish(null);
      return;
    }
    p.then(function(res){
      if(!res || !res.ok) throw new Error('audio fetch failed');
      return res.blob();
    }).then(function(blob){
      if(!blob || !blob.size) throw new Error('audio fetch empty');
      finish(blob);
    }).catch(function(){
      if(thenMirror) fetchMirror();
      else finish(null);
    });
  }
  function fetchMirror(){
    /* One retry on the mirror host, then give up silently:
       progressive playback continues exactly as today. */
    if(mySeq !== st.blobSeq){ finish(null); return; }
    fetchOne(AUDIO_FALLBACK_HOST + '/audio/' + file, false);
  }
  var isMirror = String(url).indexOf(AUDIO_FALLBACK_HOST) === 0;
  fetchOne(url, !isMirror);
}
/* Swap the element source to a fetched blob, preserving the exact
   position and paused/playing state. The element itself never
   changes, so the Listen card displays, the wire script, the
   timeupdate refresh and every listener keep working from the same
   clock. The restore runs on whichever of loadedmetadata/canplay
   fires first, and a newer scene load or a superseding fetch aborts
   it through the loadSeq/blobUrl guards. */
function studioSwapToBlob(sampleId, blobUrl){
  var st = PA_STUDIOS[sampleId];
  if(!st || !st.audio || !blobUrl) return;
  /* Never swap over a shown failure: the error box and Retry own a
     genuinely failed load. Retry clears the failure and restarts the
     fetch, so a cached blob still helps on the retry. */
  if(st.audioFailed) return;
  var a = st.audio;
  try { if(a.src === blobUrl) return; } catch(e){}
  var myLoadSeq = st.loadSeq;
  var pos = 0;
  var wasPlaying = false;
  var wasMuted = false;
  var rate = 1;
  try { pos = a.currentTime || 0; } catch(e){}
  try { wasPlaying = !a.paused; } catch(e){}
  try { wasMuted = !!a.muted; } catch(e){}
  try { rate = a.playbackRate || 1; } catch(e){}
  var restored = false;
  var restore = function(){
    if(restored) return;
    restored = true;
    var s2 = PA_STUDIOS[sampleId];
    if(!s2 || !s2.audio) return;
    if(s2.loadSeq !== myLoadSeq || s2.blobUrl !== blobUrl) return;
    var a2 = s2.audio;
    /* A pending seek owns the position: it is the newest user intent,
       and the seek path settles it from here. Otherwise restore the
       exact captured position, so the swap is inaudible and the
       displays, captions and beats do not jump. */
    var target = pos;
    if(s2.pendingSeek !== null && isFinite(s2.pendingSeek)) target = s2.pendingSeek;
    try { a2.muted = wasMuted; } catch(e){}
    try { a2.playbackRate = rate; } catch(e){}
    try { a2.currentTime = target; } catch(e){}
    if(wasPlaying){
      try {
        var p = a2.play();
        if(p && p.catch){ p.catch(function(){}); }
      } catch(e){}
    }
    studioRefresh(sampleId);
  };
  a.addEventListener('loadedmetadata', restore, {once: true});
  a.addEventListener('canplay', restore, {once: true});
  try { a.src = blobUrl; } catch(e){ return; }
  try { a.load(); } catch(e){}
}
function studioAudioLoaded(sampleId){
  /* First playable data from either host: the load worked, so stop the
     failover timer, clear any earlier failure state, and hide the error
     box if a spurious failover showed it. Data arriving proves the
     error display stale; without this the box stays up until Play,
     even though the audio is ready (15 Nov 2026, polish round). */
  studioDisarmAudioLoadTimer(sampleId);
  var st = PA_STUDIOS[sampleId];
  if(st) st.audioFailed = false;
  studioHideError(sampleId);
}
function studioAudioFailed(sampleId){
  var st = PA_STUDIOS[sampleId];
  if(!st || !st.audio || st.audioFailed) return;
  studioDisarmAudioLoadTimer(sampleId);
  studioShowLoading(sampleId, false);
  if(!st.audioFailedOver){
    /* First failure: switch silently to the mirror host and retry. The
       learner sees only a brief loading state. Resume from the same
       position when the failure happened mid-lesson. */
    st.audioFailedOver = true;
    var mirror = studioFallbackAudioUrl(sampleId);
    var wasPlaying = !st.audio.paused;
    var wantPlay = st.wantAutoplay || wasPlaying || !!st.audioPlayWanted;
    var pos = st.audio.currentTime || 0;
    st.audioLoadKicked = false;
    st.audioProgressAt = 0;
    /* A seek verify pending from the old source must not re-assert its
       target onto the fresh load: drop it (15 Nov 2026, fix round 3). */
    if(st.seekVerifyTimer){ clearTimeout(st.seekVerifyTimer); st.seekVerifyTimer = null; }
    st.pendingSeek = null;
    studioClearSeekGate(sampleId);
    st.audio.src = mirror;
    /* Fix round 5: the background fetch follows the failover to the
       mirror host; a blob cached from the primary (same file) swaps
       in at once. */
    studioStartBlobFetch(sampleId, mirror);
    if(pos > 1){
      /* Restore the position through the verified seek helper, on
         whichever of loadedmetadata/canplay fires first, and only
         while the element is still near the start: a bare
         currentTime assignment here can be silently ignored, which
         reads as a reset to 0:00 (15 Nov 2026, polish round). */
      var restored = false;
      var restore = function(){
        if(restored) return;
        restored = true;
        if(st.audio && st.audio.currentTime < 1) studioSeekAudio(sampleId, pos);
      };
      st.audio.addEventListener('loadedmetadata', restore, {once: true});
      st.audio.addEventListener('canplay', restore, {once: true});
    }
    try { st.audio.load(); } catch(e){}
    studioArmAudioLoadTimer(sampleId);
    studioShowLoading(sampleId, true);
    if(wantPlay) studioPlayAudio(sampleId, false);
    return;
  }
  /* Both hosts failed: show the fallback box with Retry and a link to
     the transcript. Nothing else to try automatically. Never show it
     while sound is actually playing: a stale failure signal must not
     cover a working lesson (15 Nov 2026, fix round 2). */
  if(!st.audio.paused && st.audio.readyState >= 2) return;
  st.audioFailed = true;
  studioShowAudioError(sampleId);
}
function studioShowAudioError(sampleId){
  var e = document.getElementById('studio-error-' + sampleId);
  if(!e) return;
  var st = PA_STUDIOS[sampleId];
  e.innerHTML = '';
  var t = document.createElement('span');
  t.className = 'studio-error-title';
  t.textContent = 'Audio could not be loaded';
  e.appendChild(t);
  e.appendChild(document.createTextNode('The narration did not load from either audio host. You can still read the full lesson below.'));
  var row = document.createElement('span');
  row.className = 'studio-error-actions';
  var retry = document.createElement('button');
  retry.type = 'button';
  retry.className = 'studio-btn';
  retry.textContent = 'Retry audio';
  retry.setAttribute('onclick', "studioRetryAudio('" + sampleId + "')");
  row.appendChild(retry);
  var tr = document.createElement('a');
  tr.href = '#studio-transcript-details-' + sampleId;
  tr.textContent = 'Read the transcript';
  tr.setAttribute('onclick', "studioOpenTranscript('" + sampleId + "');return false;");
  row.appendChild(tr);
  e.appendChild(row);
  e.style.display = 'block';
  studioShowPlayOverlay(sampleId, false);
}
function studioRetryAudio(sampleId){
  var st = PA_STUDIOS[sampleId];
  if(!st || !st.audio) return;
  /* Start over from the primary host: the failover chain runs again
     (primary, then mirror) if the problem is still there. */
  st.audioFailed = false;
  st.audioFailedOver = false;
  st.audioLoadKicked = false;
  st.audioProgressAt = 0;
  st.pendingSeek = null;
  if(st.seekVerifyTimer){ clearTimeout(st.seekVerifyTimer); st.seekVerifyTimer = null; }
  studioClearSeekGate(sampleId);
  studioHideError(sampleId);
  var primary = st.primaryAudioUrl || ((st.data.scenes[0] || {}).audio || '');
  if(!primary) return;
  st.audio.src = primary;
  try { st.audio.load(); } catch(e){}
  studioArmAudioLoadTimer(sampleId);
  studioShowLoading(sampleId, true);
  /* Fix round 5: restart the background fetch before playing, so a
     cached blob swaps in before playback starts. */
  studioStartBlobFetch(sampleId, primary);
  studioPlayAudio(sampleId, true);
}
function studioOpenTranscript(sampleId){
  var d = document.getElementById('studio-transcript-details-' + sampleId);
  if(d){
    d.open = true;
    d.scrollIntoView({behavior: 'smooth', block: 'nearest'});
  }
}
function studioClearEndTimer(sampleId){
  var st = PA_STUDIOS[sampleId];
  if(st && st.endTimer){ clearTimeout(st.endTimer); st.endTimer = null; }
}
function studioHideUpNext(sampleId){
  var u = document.getElementById('studio-upnext-' + sampleId);
  if(u) u.style.display = 'none';
}
function studioShowUpNext(sampleId){
  var u = document.getElementById('studio-upnext-' + sampleId);
  if(u){
    u.style.display = 'block';
    u.scrollIntoView({behavior: 'smooth', block: 'nearest'});
  }
}
function studioReplayLesson(sampleId){
  var st = PA_STUDIOS[sampleId];
  if(!st) return;
  studioClearEndTimer(sampleId);
  studioHideUpNext(sampleId);
  studioLoadScene(sampleId, 0, true);
}
function studioRenderMarkers(sampleId){
  var st = PA_STUDIOS[sampleId];
  var wrap = document.getElementById('studio-markers-' + sampleId);
  if(!wrap) return;
  wrap.innerHTML = '';
  st.starts.forEach(function(s, i){
    if(i === 0) return;
    var m = document.createElement('span');
    m.className = 'studio-marker';
    m.style.left = (s / st.total * 100) + '%';
    m.title = 'Scene ' + (i + 1) + ': ' + st.data.scenes[i].title;
    wrap.appendChild(m);
  });
}
function studioLoadScene(sampleId, idx, autoplay){
  var st = PA_STUDIOS[sampleId];
  if(!st || idx < 0 || idx >= st.data.scenes.length) return;
  /* Load-sequence token (15 Nov 2026, fix 1): a stale async setSrc from
     an earlier scene load can never reset a newer scene or position. */
  st.loadSeq = (st.loadSeq || 0) + 1;
  var mySeq = st.loadSeq;
  studioStopVisual(sampleId);
  var scene = st.data.scenes[idx];
  st.scene = idx; st.beat = -1; st.seenStages = {};
  studioClearEndTimer(sampleId);
  studioHideUpNext(sampleId);
  var audio = st.audio;
  var wasPlaying = !audio.paused;
  var setSrc = function(url){
    /* Stale-load guard: if a newer scene load has started, this
       callback belongs to the old one and must not touch the audio. */
    if(mySeq !== st.loadSeq) return;
    /* Remember the primary URL for Retry, clear any earlier failure
       state, and start the load timer: if nothing is playable within
       8 seconds the player fails over to the mirror host on its own. */
    var wasFailed = st.audioFailed || !!audio.error;
    st.primaryAudioUrl = url;
    st.audioFailedOver = false;
    st.audioFailed = false;
    st.audioLoadWaits = 0;
    st.audioLoadKicked = false;
    st.audioProgressAt = 0;
    st.pendingSeek = null;
    if(st.seekVerifyTimer){ clearTimeout(st.seekVerifyTimer); st.seekVerifyTimer = null; }
    studioClearSeekGate(sampleId);
    studioHideError(sampleId);
    /* Fix batch 2, fix 3: reassigning the URL the element is already
       loading restarts the load and discards in-flight progress, which
       can turn a slow load into a failure. When the resolved target
       matches the current source, the load is in flight or has data,
       and the previous load did not fail, keep the in-flight load and
       only reset the position; a different URL, or a failed load,
       still reassigns. The lesson URL redirects to the audio host, so
       currentSrc (the post-redirect URL) never equals the resolved
       scene URL and the old comparison always restarted the load.
       Compare the file name too: the same file already loading or
       loaded on either host is the same narration. File names are
       unique per lesson, so this cannot mistake one lesson for
       another (15 Nov 2026, polish round). */
    var sameUrl = false;
    try {
      var curSrc = audio.currentSrc || audio.src || '';
      var targetHref = new URL(url, document.baseURI).href;
      sameUrl = (curSrc === targetHref) ||
        (curSrc !== '' && curSrc.split('/').pop().split('?')[0] ===
          targetHref.split('/').pop().split('?')[0]);
    } catch(e){}
    var loadLive = audio.readyState > 0 || audio.networkState === 2;
    if(!(sameUrl && loadLive && !wasFailed)){
      audio.src = url;
    }
    audio.currentTime = 0;
    studioArmAudioLoadTimer(sampleId);
    /* Fix round 5: start the background full-file fetch now, before the
       autoplay attempt, so a cached blob swaps in before playback
       starts and a fresh fetch gets the longest possible head start. */
    studioStartBlobFetch(sampleId, url);
    /* The open-page autoplay attempt: studioInit sets wantAutoplay, and
       this runs once the source is set, whether paAudioUrl answered
       synchronously or not. A refusal here is expected on iOS Safari
       before the first tap, so it shows the big play overlay, not an error. */
    if(st.wantAutoplay){
      st.wantAutoplay = false;
      st.audioPlayWanted = true;
      studioPlayAudio(sampleId, false);
    } else if(autoplay || wasPlaying) {
      studioPlayAudio(sampleId, true);
    }
  };
  /* Signed audio URLs when auth is on (dormant: paAudioUrl falls back to
     the public path while auth is off). */
  if(typeof paAudioUrl === 'function'){ paAudioUrl(scene.audio, setSrc); }
  else { setSrc(scene.audio); }
  if(typeof soundMuted !== 'undefined') audio.muted = soundMuted;
  var speed = document.getElementById('studio-speed-' + sampleId);
  if(speed) audio.playbackRate = parseFloat(speed.value) || 1;
  document.querySelectorAll('#studio-' + sampleId + ' .studio-scene-vis').forEach(function(el){
    el.classList.remove('active');
  });
  var vis = document.getElementById('studio-vis-' + sampleId + '-' + idx);
  if(vis) vis.classList.add('active');
  var tag = document.getElementById('studio-tag-' + sampleId);
  if(tag) tag.textContent = 'Scene ' + (idx + 1) + ' / ' + st.data.scenes.length;
  var prog = document.getElementById('studio-prog-' + sampleId);
  if(prog) prog.textContent = 'Scene ' + (idx + 1) + ' of ' + st.data.scenes.length;
  var bar = document.getElementById('studio-bar-' + sampleId);
  if(bar){
    var done = Object.keys(st.doneScenes).length;
    bar.style.width = Math.round(done / st.data.scenes.length * 100) + '%';
  }
  var concept = document.getElementById('studio-concept-' + sampleId);
  if(concept) concept.textContent = scene.title;
  var pts = document.getElementById('studio-points-' + sampleId);
  if(pts){
    pts.innerHTML = '';
    studioPointLabels(scene).forEach(function(p){
      var li = document.createElement('li'); li.textContent = p; pts.appendChild(li);
    });
  }
  var terms = document.getElementById('studio-terms-' + sampleId);
  if(terms){
    terms.innerHTML = '';
    (scene.terms || []).forEach(function(tm){
      var p = document.createElement('p');
      p.className = 'keyterm';
      var b = document.createElement('b'); b.textContent = tm.term + ': ';
      p.appendChild(b); p.appendChild(document.createTextNode(tm.def));
      terms.appendChild(p);
    });
  }
  var tr = document.getElementById('studio-transcript-' + sampleId);
  if(tr){
    tr.innerHTML = '';
    studioTranscriptParagraphs(scene.transcript || '', scene.paragraphs || []).forEach(function(p){
      var pe = document.createElement('p'); pe.className = 'transcript'; pe.textContent = p; tr.appendChild(pe);
    });
  }
  var tp = document.getElementById('studio-transcript-full-' + sampleId);
  if(tp){
    tp.innerHTML = '';
    st.data.scenes.forEach(function(s){
      var h = document.createElement('h4'); h.textContent = s.title; tp.appendChild(h);
      studioTranscriptParagraphs(s.transcript || '', s.paragraphs || []).forEach(function(tp2){
        var pe2 = document.createElement('p'); pe2.textContent = tp2; tp.appendChild(pe2);
      });
    });
  }
  studioRefresh(sampleId, 0);
  studioSyncStepButtons(sampleId);
}
function studioRefresh(sampleId, tOverride){
  var st = PA_STUDIOS[sampleId];
  if(!st || !st.audio) return;
  var scene = st.data.scenes[st.scene];
  if(!scene) return;
  var t = (typeof tOverride === 'number') ? tOverride : st.audio.currentTime;
  if(!isFinite(t) || t < 0) t = 0;
  if(t > scene.duration_sec) t = scene.duration_sec;
  var beatIdx = 0;
  (scene.beats || []).forEach(function(b, i){
    if(t >= b.t0) beatIdx = i;
  });
  if(beatIdx !== st.beat) studioApplyBeat(sampleId, beatIdx);
  var V = st.starts[st.scene] + t;
  var slider = document.getElementById('studio-slider-' + sampleId);
  if(slider && !st.sliderScrubbing) slider.value = Math.round(V / st.total * 1000);
  var tm = document.getElementById('studio-time-' + sampleId);
  if(tm && typeof fmtTime === 'function') tm.textContent = fmtTime(V) + ' / ' + fmtTime(st.total);
  /* Listen card display (15 Nov 2026, fix round 2): this refresh writes
     it as well as the lesson-page wire script. The polish round made
     the wire script the sole writer, and the live retest then showed
     the Listen display stuck at 0:00 on all three sampled lessons
     while this timeline advanced, although the wire script is valid
     and listens to the same element. Both writers read the same audio
     clock and, on a single-scene lesson, the same position, so they
     agree; the redundancy means the display moves even if one writer
     is ever silenced. The slider write keeps the focus guard: the
     wire script owns the slider while it is being dragged. */
  var lt = document.getElementById('pf-audio-time-' + sampleId);
  if(lt && typeof fmtTime === 'function') lt.textContent = fmtTime(V) + ' / ' + fmtTime(st.total);
  var ls = document.getElementById('pf-audio-slider-' + sampleId);
  if(ls && document.activeElement !== ls) ls.value = V;
  studioSyncStepButtons(sampleId);
}
function studioApplyBeat(sampleId, beatIdx){
  var st = PA_STUDIOS[sampleId];
  var scene = st.data.scenes[st.scene];
  var beat = (scene.beats || [])[beatIdx];
  if(!beat) return;
  st.beat = beatIdx;
  studioSyncStepButtons(sampleId);
  /* Single-lesson page: the stage tag shows the step, not "Scene 1 of 1". */
  var tag = document.getElementById('studio-tag-' + sampleId);
  if(tag && st.data.scenes.length === 1){
    var nb = (scene.beats || []).length;
    if(nb > 1) tag.textContent = 'Step ' + (beatIdx + 1) + ' of ' + nb;
  }
  var root = document.getElementById('studio-' + sampleId);
  var vis = document.getElementById('studio-vis-' + sampleId + '-' + st.scene);
  if(vis){
    /* Beat frames (Nov 2026): show only the frame for this beat, so the
       visual changes in sync with the narration. */
    vis.querySelectorAll('.beat-frame').forEach(function(fr){
      var fi = parseInt(fr.getAttribute('data-frame'), 10);
      if(fi === beatIdx) fr.classList.add('active');
      else fr.classList.remove('active');
    });
    vis.querySelectorAll('[data-node]').forEach(function(el){ el.classList.remove('node-active'); });
    vis.querySelectorAll('[data-conn]').forEach(function(el){ el.classList.remove('conn-active'); });
    vis.querySelectorAll('[data-field]').forEach(function(el){ el.classList.remove('field-active'); });
    try {
      (beat.highlight_nodes || []).forEach(function(id){
        vis.querySelectorAll('[data-node="' + id + '"]').forEach(function(el){ el.classList.add('node-active'); });
      });
      (beat.highlight_conns || []).forEach(function(id){
        vis.querySelectorAll('[data-conn="' + id + '"]').forEach(function(el){ el.classList.add('conn-active'); });
      });
      (beat.highlight_fields || []).forEach(function(id){
        vis.querySelectorAll('[data-field="' + id + '"]').forEach(function(el){ el.classList.add('field-active'); });
      });
    } catch(e){ if(window.console) console.error('studio highlight failed', sampleId, e); }
    vis.querySelectorAll('[data-beat]').forEach(function(el){
      /* Beat frames carry their own done/now/dim state per frame; the
         generic beat-on/beat-off toggle would fight it, so skip any
         element inside a .beat-frame. Other visuals still use it. */
      if(el.closest && el.closest('.beat-frame')) return;
      var k = parseInt(el.getAttribute('data-beat'), 10);
      if(k <= beatIdx){ el.classList.add('beat-on'); el.classList.remove('beat-off'); }
      else { el.classList.add('beat-off'); el.classList.remove('beat-on'); }
    });
    vis.querySelectorAll('[data-stage]').forEach(function(el){
      var key = el.getAttribute('data-stage');
      el.classList.remove('done', 'now');
      if((beat.highlight_nodes || []).indexOf(key) !== -1) el.classList.add('now');
      else if(st.seenStages[key]) el.classList.add('done');
    });
    (beat.highlight_nodes || []).forEach(function(id){ st.seenStages[id] = true; });
    /* Payment dot: every layout (desktop and mobile SVG) has its own dot,
       and each dot is placed in the top-right corner of its own node, clear
       of the centred label text. The old code moved only the first dot to
       the node centre, where it sat on top of the label. */
    var dots = vis.querySelectorAll('[data-node="payment-dot"]');
    var target = (beat.highlight_nodes || [])[0];
    dots.forEach(function(dot){
      if(!target) return;
      try {
        var svg = dot.closest ? dot.closest('svg') : null;
        var node = svg ? svg.querySelector('[data-node="' + target + '"]')
                       : vis.querySelector('[data-node="' + target + '"]');
        if(node && node.getBBox){
          var bb = node.getBBox();
          dot.setAttribute('cx', bb.x + bb.width - 14);
          dot.setAttribute('cy', bb.y + 14);
        }
      } catch(e){}
    });
  }
  var cap = document.getElementById('studio-caption-' + sampleId);
  if(cap){
    cap.innerHTML = '';
    var b = document.createElement('b'); b.textContent = beat.title + ': ';
    cap.appendChild(b); cap.appendChild(document.createTextNode(beat.note || ''));
    cap.style.display = st.captions ? 'block' : 'none';
  }
  var concept = document.getElementById('studio-concept-' + sampleId);
  if(concept) concept.textContent = beat.title;
}
function studioSceneEnded(sampleId){
  var st = PA_STUDIOS[sampleId];
  var scene = st.data.scenes[st.scene];
  st.doneScenes[scene.id] = true;
  if(typeof lessonDone === 'function') lessonDone(scene.id);
  var bar = document.getElementById('studio-bar-' + sampleId);
  if(bar) bar.style.width = Math.round(Object.keys(st.doneScenes).length / st.data.scenes.length * 100) + '%';
  if(st.scene + 1 < st.data.scenes.length){
    studioLoadScene(sampleId, st.scene + 1, true);
  } else {
    studioSetPlayLabel(sampleId, false);
    /* End of the lesson. Show the end state at once (the up-next prompt
       with the next lesson), then auto-advance to the next lesson within
       1 second. If this is the final lesson there is no next lesson, so
       the end state simply stays visible. */
    studioShowUpNext(sampleId);
    studioClearEndTimer(sampleId);
    st.endTimer = setTimeout(function(){
      var nx = st.data.next_id;
      if(nx && typeof goLessonAuto === 'function'){ goLessonAuto(nx); }
      else if(nx && typeof goLesson === 'function'){ goLesson(nx); }
    }, 1000);
  }
}
function studioSeekVirtual(sampleId, permille){
  var st = PA_STUDIOS[sampleId];
  if(!st) return;
  var V = permille / 1000 * st.total;
  /* A non-finite seek (bad slider value or missing durations) must never
     reset the display to 0:00; ignore it instead. */
  if(!isFinite(V) || V < 0) return;
  if(V >= st.total) V = st.total - 0.1;
  var idx = 0;
  st.starts.forEach(function(s, i){ if(V >= s) idx = i; });
  var offset = V - st.starts[idx];
  var audio = st.audio;
  var apply = function(){
    studioSeekAudio(sampleId, offset);
  };
  if(idx !== st.scene){
    var wasPlaying = !audio.paused;
    studioLoadScene(sampleId, idx, false);
    if(audio.readyState >= 1) apply();
    else audio.addEventListener('loadedmetadata', apply, {once: true});
    if(wasPlaying) studioPlayAudio(sampleId, true);
  } else {
    apply();
  }
}
function studioSetPlayLabel(sampleId, playing){
  var st = PA_STUDIOS[sampleId];
  /* Derive the state from the audio element when the caller does not say:
     a source change can fire a stray pause event after playback started,
     and the label must always match what the reader hears. */
  if(typeof playing === 'undefined' && st && st.audio) playing = !st.audio.paused;
  var b = document.getElementById('studio-play-' + sampleId);
  if(b){
    var icPlay = b.querySelector('.ctrl-ic-play');
    var icPause = b.querySelector('.ctrl-ic-pause');
    if(icPlay) icPlay.style.display = playing ? 'none' : '';
    if(icPause) icPause.style.display = playing ? '' : 'none';
    b.setAttribute('aria-label', playing ? 'Pause lesson' : 'Play lesson');
  }
  /* The big play overlay is the video-player state: shown whenever the
     narration is not really playing, hidden while it plays. A 'play'
     event alone is not proof of sound: it fires when play() is invoked,
     even for a dead source with no data yet, so hiding the overlay and
     the error box on it left a failed load with no visible Play button
     and no error. Only readyState 2 or more (real audio data, confirmed
     by the 'playing' event below) counts as playing. Until then the Play
     button stays visible, so a stalled or failed load never leaves the
     learner with no way to start the audio. */
  var reallyPlaying = !!(playing && st && st.audio && st.audio.readyState >= 2);
  studioShowPlayOverlay(sampleId, !reallyPlaying);
  if(reallyPlaying){
    /* Real sound proves any shown error stale: the failover timer can
       show the box after the load events already fired, and nothing
       else clears it, so it stayed up while the narration played
       (15 Nov 2026, fix round 2). Clear the failure state outright. */
    if(st) st.audioFailed = false;
    studioHideError(sampleId);
    studioHideUpNext(sampleId);
    /* Refresh the caption from the current beat, so a stale caption
       from a blocked autoplay never survives into playback. */
    if(st) studioApplyBeat(sampleId, st.beat < 0 ? 0 : st.beat);
  }
}
function studioTogglePlay(sampleId){
  var st = PA_STUDIOS[sampleId];
  if(!st) return;
  var a = st.audio;
  if(a.paused){
    studioClearEndTimer(sampleId);
    studioTryPlay(sampleId, true);
  } else {
    a.pause();
  }
}
function studioReplayScene(sampleId){
  var st = PA_STUDIOS[sampleId];
  if(!st) return;
  studioClearEndTimer(sampleId);
  studioHideUpNext(sampleId);
  st.audio.currentTime = 0;
  studioTryPlay(sampleId, true);
  studioRefresh(sampleId, 0);
}
/* Step buttons: on a multi-scene sample they move between scenes (the
   original behaviour); on a single-lesson page there is only one scene,
   so they step between the beats of that lesson instead. */
function studioPrevScene(sampleId){
  var st = PA_STUDIOS[sampleId];
  if(!st) return;
  if(st.data.scenes.length > 1){
    if(st.scene > 0) studioLoadScene(sampleId, st.scene - 1, true);
  } else {
    studioStepBeat(sampleId, -1);
  }
}
function studioNextScene(sampleId){
  var st = PA_STUDIOS[sampleId];
  if(!st) return;
  if(st.data.scenes.length > 1){
    if(st.scene + 1 < st.data.scenes.length) studioLoadScene(sampleId, st.scene + 1, true);
  } else {
    studioStepBeat(sampleId, 1);
  }
}
/* Seek the audio to the previous or next beat start, so the frame,
   highlight and caption follow. A paused lesson stays paused; a playing
   one keeps playing from the new position. */
function studioStepBeat(sampleId, dir){
  var st = PA_STUDIOS[sampleId];
  if(!st) return;
  var scene = st.data.scenes[st.scene];
  if(!scene) return;
  var beats = scene.beats || [];
  if(!beats.length) return;
  /* Derive the current step from the audio position, not from the
     cached beat index, so a step taken right after a seek lands on
     the step the narration is actually in (15 Nov 2026, fix 2). */
  var pos = st.audio.currentTime || 0;
  var cur = 0;
  beats.forEach(function(b, i){ if(pos >= (b.t0 || 0)) cur = i; });
  var target = cur + dir;
  if(target < 0 || target >= beats.length) return;
  var t = beats[target].t0 || 0;
  studioClearEndTimer(sampleId);
  studioHideUpNext(sampleId);
  studioSeekAudio(sampleId, t + 0.01);
}
function studioSyncStepButtons(sampleId){
  var st = PA_STUDIOS[sampleId];
  if(!st) return;
  var prev = document.getElementById('studio-prevscene-' + sampleId);
  var next = document.getElementById('studio-nextscene-' + sampleId);
  if(!prev && !next) return;
  var scene = st.data.scenes[st.scene];
  if(st.data.scenes.length > 1){
    if(prev) prev.disabled = st.scene === 0;
    if(next) next.disabled = st.scene === st.data.scenes.length - 1;
  } else {
    var n = (scene && scene.beats ? scene.beats.length : 0);
    var pos = (st.audio && st.audio.currentTime) || 0;
    var b = 0;
    ((scene && scene.beats) || []).forEach(function(bt, i){ if(pos >= (bt.t0 || 0)) b = i; });
    if(prev) prev.disabled = b === 0;
    if(next) next.disabled = b >= n - 1;
  }
}
/* Short step labels for "Key learning points": the beat titles, not the
   narration sentences, so the list does not repeat the transcript. */
function studioPointLabels(scene){
  var beats = scene.beats || [];
  if(beats.length){
    return beats.map(function(b){
      var t = (b.title || '').replace(/^\s+|\s+$/g, '');
      return t || studioShortLabel(b.note || '');
    });
  }
  return (scene.points || []).map(function(p){ return studioShortLabel(p); });
}
function studioShortLabel(text){
  var t = String(text || '').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '').replace(/[.?!]+$/, '');
  var cut = t.split(/[,;:]/)[0];
  var words = cut.split(' ').filter(function(w){ return w; });
  if(words.length > 8) cut = words.slice(0, 8).join(' ');
  return cut;
}
function studioSetSpeed(sampleId, v){
  var st = PA_STUDIOS[sampleId];
  if(st) st.audio.playbackRate = parseFloat(v) || 1;
  var b = document.getElementById('studio-speedbtn-' + sampleId);
  if(b) b.textContent = (parseFloat(v) || 1) + 'x';
}
/* Playback speed cycles 0.75x, 1x, 1.25x, 1.5x (Coursera-style "1x" button). */
var PA_SPEEDS = [0.75, 1, 1.25, 1.5];
function studioCycleSpeed(sampleId){
  var st = PA_STUDIOS[sampleId];
  if(!st) return;
  var cur = st.audio.playbackRate || 1;
  var i = PA_SPEEDS.indexOf(cur);
  var nxt = PA_SPEEDS[(i + 1) % PA_SPEEDS.length];
  studioSetSpeed(sampleId, nxt);
}
/* Seek helper (15 Nov 2026, fix round 4): a seek target past the
   downloaded frontier must never be set directly. Both audio hosts
   ignore Range requests, so setting currentTime beyond the buffered
   range restarts the download from the start and the position reads
   as a reset to 0:00; when paused, the fetch can also stall and
   freeze the frontier. So a target inside the buffered range seeks
   immediately with a settled-position verify as backstop, while a
   target past the frontier waits (gated) until the download reaches
   it, driving the fetch with muted playback when paused, and only
   then applies. The polish round clamped to the seekable range,
   which dragged seeks back toward the start; there is still no
   seekable clamp, the gate waits for the buffer instead of
   clamping to it. Setting currentTime before metadata has loaded
   is silently ignored, so an unready element defers to
   loadedmetadata/canplay first, then gates. */
/* Is the target inside (or within half a second of) a downloaded
   range? The tolerance covers rounding at range ends. */
function studioSeekBuffered(a, t){
  try {
    var b = a.buffered;
    for(var i = 0; i < b.length; i++){
      if(b.start(i) <= t + 0.5 && b.end(i) >= t - 0.5) return true;
    }
  } catch(e){}
  return false;
}
/* Tear down a gated-seek wait: stop the poll timer, restore the muted
   state the gate changed, hide the buffering indicator, and stop the
   muted fetch-driver playback when the gate started it for a user who
   was paused. Safe to call when no gate is active. Called when a newer
   seek supersedes the wait, and when failover, retry or a scene load
   drops the pending seek, so no stale gate can touch a fresh load. */
function studioClearSeekGate(sampleId){
  var st = PA_STUDIOS[sampleId];
  if(!st) return;
  if(st.seekGateTimer){ clearTimeout(st.seekGateTimer); st.seekGateTimer = null; }
  if(!st.seekGateActive) return;
  st.seekGateActive = false;
  if(st.seekGateMuted && st.audio){
    try { st.audio.muted = (typeof soundMuted !== 'undefined') ? soundMuted : st.seekGateSavedMuted; } catch(e){}
  }
  st.seekGateMuted = false;
  if(st.seekGateWantPaused && st.audio && !st.audio.paused){
    try { st.audio.pause(); } catch(e){}
  }
  studioShowLoading(sampleId, false);
}
/* Arm the settled-position verify after a seek is applied: a seek can
   take a moment to settle, so re-assert only a SETTLED position behind
   the target (a lost seek) or, when paused, off the target in either
   direction. A playing lesson that has advanced past the target must
   never be yanked back. While the browser reports seeking, the seek is
   still in flight: re-asserting currentTime then aborts it and
   restarts the download, so wait instead (up to five extra checks). A
   newer seek supersedes this one through the pendingSeek token. */
function studioSeekArmVerify(sampleId, t){
  var st = PA_STUDIOS[sampleId];
  if(!st || !st.audio) return;
  var a = st.audio;
  if(st.seekVerifyTimer) clearTimeout(st.seekVerifyTimer);
  var verify = function(left, waits){
    st.seekVerifyTimer = null;
    if(st.pendingSeek !== t) return;
    if(a.seeking){
      if(waits > 0){
        st.seekVerifyTimer = setTimeout(function(){ verify(left, waits - 1); }, 1200);
      } else {
        st.pendingSeek = null;
      }
      return;
    }
    var cur = a.currentTime;
    var behind = isFinite(cur) && (cur < t - 1.5);
    var offWhilePaused = isFinite(cur) && a.paused && (Math.abs(cur - t) > 1.5);
    if((behind || offWhilePaused) && left > 0){
      try { a.currentTime = t; } catch(e){}
      studioRefresh(sampleId, t);
      st.seekVerifyTimer = setTimeout(function(){ verify(left - 1, waits); }, 1800);
    } else {
      st.pendingSeek = null;
    }
  };
  st.seekVerifyTimer = setTimeout(function(){ verify(2, 5); }, 1200);
}
/* Apply a seek whose target is buffered: set the position, refresh the
   displays, and arm the settled-position verify. */
function studioSeekApply(sampleId, t){
  var st = PA_STUDIOS[sampleId];
  if(!st || !st.audio) return;
  try { st.audio.currentTime = t; } catch(e){}
  studioRefresh(sampleId, t);
  studioSeekArmVerify(sampleId, t);
}
/* Gated seek: the target is past the downloaded frontier. Wait for the
   frontier to pass the target, driving the fetch with muted playback
   when paused (a paused element's download can stall), then apply the
   seek and restore the state the user expects: a paused seek ends
   paused at the target, a playing seek keeps playing from it. After
   about 20 seconds the seek applies anyway as a last resort, so a
   stalled download degrades to the old behaviour instead of hanging.
   A newer seek supersedes the wait through the pendingSeek token. */
function studioSeekGate(sampleId, t){
  var st = PA_STUDIOS[sampleId];
  if(!st || !st.audio) return;
  var a = st.audio;
  st.seekGateActive = true;
  st.seekGateWantPaused = a.paused;
  st.seekGateSavedMuted = a.muted;
  /* Mute while the fetch catches up: the narration must not play aloud
     from the old position while the user waits for the target. */
  if(!a.muted){
    try { a.muted = true; } catch(e){}
    st.seekGateMuted = true;
  }
  studioShowLoading(sampleId, true);
  if(a.paused){
    try {
      var p = a.play();
      if(p && p.catch){ p.catch(function(){}); }
    } catch(e){}
  }
  var deadline = Date.now() + 20000;
  var tick = function(){
    if(st.pendingSeek !== t || !st.seekGateActive) return;
    var reached = false;
    try { reached = studioSeekBuffered(a, t); } catch(e){}
    if(!reached && Date.now() < deadline){
      st.seekGateTimer = setTimeout(tick, 400);
      return;
    }
    /* Frontier reached, or last resort after the timeout: tear the
       gate down (restoring mute and the paused state) and apply. */
    studioClearSeekGate(sampleId);
    if(st.pendingSeek !== t) return;
    studioSeekApply(sampleId, t);
  };
  st.seekGateTimer = setTimeout(tick, 400);
}
function studioSeekAudio(sampleId, t){
  var st = PA_STUDIOS[sampleId];
  if(!st || !st.audio) return;
  var a = st.audio;
  if(!isFinite(t) || t < 0) t = 0;
  var dur = a.duration;
  if(isFinite(dur) && dur > 0 && t > dur) t = Math.max(0, dur - 0.05);
  /* One pending seek at a time: a newer seek supersedes any gated wait
     or verify from an earlier one. */
  studioClearSeekGate(sampleId);
  if(st.seekVerifyTimer){ clearTimeout(st.seekVerifyTimer); st.seekVerifyTimer = null; }
  st.pendingSeek = t;
  var start = function(){
    if(st.pendingSeek !== t) return;
    if(studioSeekBuffered(a, t)){ studioSeekApply(sampleId, t); return; }
    studioSeekGate(sampleId, t);
  };
  if(a.readyState >= 1){ start(); return; }
  var onceMeta = function(){
    try { a.removeEventListener('loadedmetadata', onceMeta); } catch(e){}
    try { a.removeEventListener('canplay', oncePlay); } catch(e){}
    start();
  };
  var oncePlay = function(){
    try { a.removeEventListener('canplay', oncePlay); } catch(e){}
    try { a.removeEventListener('loadedmetadata', onceMeta); } catch(e){}
    start();
  };
  a.addEventListener('loadedmetadata', onceMeta);
  a.addEventListener('canplay', oncePlay);
}
/* Skip forward or back by a number of seconds; the frame, highlight and
   caption follow because the audio position is the source of truth. */
function studioSkip(sampleId, secs){
  var st = PA_STUDIOS[sampleId];
  if(!st) return;
  var a = st.audio;
  var scene = st.data.scenes[st.scene];
  var sceneDur = (scene && scene.duration_sec) || 0;
  var dur = a.duration || st.total || 0;
  var cap = dur;
  if(sceneDur && (!cap || sceneDur < cap)) cap = sceneDur;
  /* The audio position is the only clock: skip from where the narration
     actually is, never from a visual timer. */
  var cur = a.currentTime;
  if(!isFinite(cur) || cur < 0) cur = 0;
  var t = cur + secs;
  if(t < 0) t = 0;
  /* Stop a fraction short of the end: seeking to exactly the duration
     fires 'ended' and auto-advances, which reads as a reset. */
  if(cap && t > cap - 0.05) t = Math.max(0, cap - 0.05);
  studioClearEndTimer(sampleId);
  studioHideUpNext(sampleId);
  studioSeekAudio(sampleId, t);
}
/* Fullscreen the whole player (canvas plus control bar). */
function studioFullscreen(sampleId){
  var root = document.getElementById('studio-' + sampleId);
  var player = root ? root.querySelector('.player') : null;
  if(!player) return;
  if(document.fullscreenElement){
    document.exitFullscreen();
  } else if(player.requestFullscreen){
    player.requestFullscreen();
  }
}
/* Settings popover (volume, captions, replay). One open at a time; a click
   anywhere else closes it. */
function studioToggleSettings(sampleId, ev){
  if(ev) ev.stopPropagation();
  var p = document.getElementById('studio-settings-' + sampleId);
  if(!p) return;
  var open = p.style.display === 'block';
  studioCloseAllSettings();
  p.style.display = open ? 'none' : 'block';
}
function studioCloseAllSettings(){
  var pops = document.querySelectorAll('.ctrl-popover');
  for(var i = 0; i < pops.length; i++){ pops[i].style.display = 'none'; }
}
document.addEventListener('click', function(ev){
  /* Clicks inside the popover (or its settings button wrapper) must not
     close it; the popover itself also stops propagation, so this is a
     second guard for any popover without the inline handler. */
  var t = ev && ev.target;
  if(t && t.closest && (t.closest('.ctrl-popover') || t.closest('.ctrl-settings-wrap'))) return;
  studioCloseAllSettings();
});
/* Open the (collapsed) transcript from the right tool rail. */
function pfOpenTranscript(sampleId){
  var d = document.getElementById('studio-transcript-details-' + sampleId);
  if(d){ d.open = true; d.scrollIntoView({behavior:'smooth', block:'start'}); }
}
/* Like / dislike / flag under a lesson. Visual only; like and dislike are
   mutually exclusive. */
function pfFeedback(btn, kind){
  if(!btn) return;
  var row = btn.parentNode;
  if(kind === 'like' || kind === 'dislike'){
    var sibs = row ? row.querySelectorAll('.fb-btn') : [];
    for(var i = 0; i < sibs.length; i++){
      var k = sibs[i].getAttribute('data-kind');
      if(k === 'like' || k === 'dislike'){
        sibs[i].classList.remove('active');
        sibs[i].setAttribute('aria-pressed', 'false');
      }
    }
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
  } else {
    var on = btn.classList.toggle('active');
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
}
/* Dive deeper card collapse (the chevron at its top right). */
function pfToggleDive(btn){
  var card = btn ? btn.closest('.dive-deeper') : null;
  if(!card) return;
  var collapsed = card.classList.toggle('collapsed');
  btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
}
/* Dive deeper buttons (post-audit): show the panel for simple, summary or
   example; practice questions scrolls to the Check your understanding card. */
function pfDive(sampleId, kind){
  var card = document.getElementById('studio-' + sampleId);
  if(!card) return;
  var panel = document.getElementById('dive-panel-' + sampleId);
  var btns = card.querySelectorAll('.dive-btn');
  for(var i = 0; i < btns.length; i++){ btns[i].classList.remove('active'); }
  if(kind === 'practice'){
    var quiz = document.getElementById('pf-quiz-' + sampleId);
    if(panel) panel.classList.remove('open');
    if(quiz){
      quiz.scrollIntoView({behavior:'smooth', block:'start'});
      quiz.classList.add('fw-flash');
      setTimeout(function(){ quiz.classList.remove('fw-flash'); }, 1800);
    }
    return;
  }
  var btn = card.querySelector('.dive-btn[data-kind="' + kind + '"]');
  if(btn) btn.classList.add('active');
  if(!panel) return;
  var body = panel.querySelector('.dive-panel-body');
  if(!body) return;
  var data = null;
  try { data = JSON.parse(document.getElementById('pf-dive-data-' + sampleId).textContent); } catch(e){}
  if(!data) return;
  var html = '';
  if(kind === 'simple' && data.simple){
    html = '<h3>In simple terms</h3>' + studioParagraphsHtml(data.simple);
  } else if(kind === 'summary' && data.summary){
    html = '<h3>Summary</h3>' + studioParagraphsHtml(data.summary);
  } else if(kind === 'example' && data.example){
    html = '<h3>Real-life example</h3>' + studioParagraphsHtml(data.example);
  }
  body.innerHTML = html;
  panel.classList.add('open');
}
/* Check your understanding: one tap per option, immediate feedback. */
function pfCheckAnswer(sampleId, btn){
  var card = document.getElementById('pf-quiz-' + sampleId);
  if(!card || !btn) return;
  var opts = card.querySelectorAll('.quiz-opt');
  var answer = parseInt(card.getAttribute('data-answer'), 10);
  var chosen = parseInt(btn.getAttribute('data-idx'), 10);
  var fb = document.getElementById('pf-quiz-fb-' + sampleId);
  for(var i = 0; i < opts.length; i++){
    opts[i].disabled = true;
    if(i === answer) opts[i].classList.add('correct');
    if(i === chosen && chosen !== answer) opts[i].classList.add('wrong');
  }
  if(fb){
    var expl = '';
    var why = '';
    try {
      var data = JSON.parse(document.getElementById('pf-quiz-data-' + sampleId).textContent);
      expl = data.explanation || '';
      why = data.why_wrong && data.why_wrong[chosen] ? data.why_wrong[chosen] : '';
    } catch(e){}
    /* The generic why_wrong ('This is not correct for this question.' +
       a restatement of the explanation) adds nothing: it repeats the
       answer. Show the 'why wrong' block only when it says something
       specific, e.g. 'This describes a different concept...'. */
    var whyUseful = false;
    if(why){
      var w = why.trim();
      if(w.indexOf('This is not correct for this question') !== 0 && w !== 'This is the correct answer.'){
        whyUseful = true;
      }
    }
    var head = (chosen === answer)
      ? '<b>Correct.</b> '
      : '<b>Not quite.</b> ';
    var html = head;
    if(expl) html += '<h4 class="quiz-fb-h">Why this is the answer</h4>' + studioParagraphsHtml(expl);
    if(whyUseful) html += '<h4 class="quiz-fb-h">Why your choice was wrong</h4>' + studioParagraphsHtml(why);
    html += '<button type="button" class="studio-btn" onclick="pfDismissQuiz(this)">Got it, hide this</button>';
    fb.innerHTML = html;
    fb.classList.add('open');
  }
}
/* Dismiss the quiz feedback once the reader has read it. The feedback
   collapses to a small 'Show the explanation' link so it can be reopened. */
function pfDismissQuiz(btn){
  if(!btn) return;
  var fb = btn.closest ? btn.closest('.quiz-feedback') : null;
  if(!fb) return;
  var card = fb.closest ? fb.closest('.fw-card') : null;
  fb.style.display = 'none';
  if(card && !card.querySelector('.pf-quiz-show')){
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'studio-btn pf-quiz-show';
    b.textContent = 'Show the explanation';
    b.onclick = function(){
      fb.style.display = '';
      b.remove();
    };
    card.appendChild(b);
  }
}
/* Multi-question lesson quiz (10 Nov 2026): one tap per option,
   instant feedback per question, and a score line for the whole quiz.
   When every question is answered, the result is saved in this
   browser under payments-academy-progress-v1 (quiz: lesson id mapped
   to true when every answer was correct), which is the store the
   dashboard already reads for its quiz totals. A quiz answer also
   counts as learning activity for the day, for the dashboard streak. */
function pfCheckQuizAnswer(sampleId, qidx, btn){
  var q = document.getElementById('pf-quiz-q-' + sampleId + '-' + qidx);
  if(!q || !btn) return;
  var opts = q.querySelectorAll('.quiz-opt');
  var answer = parseInt(q.getAttribute('data-answer'), 10);
  var chosen = parseInt(btn.getAttribute('data-idx'), 10);
  for(var i = 0; i < opts.length; i++){
    opts[i].disabled = true;
    if(i === answer) opts[i].classList.add('correct');
    if(i === chosen && chosen !== answer) opts[i].classList.add('wrong');
  }
  var fb = document.getElementById('pf-quiz-fb-' + sampleId + '-' + qidx);
  if(fb){
    var expl = '';
    try { expl = JSON.parse(document.getElementById('pf-quiz-data-' + sampleId + '-' + qidx).textContent).explanation || ''; } catch(e){}
    var head = (chosen === answer) ? '<b>Correct.</b> ' : '<b>Not quite.</b> ';
    fb.innerHTML = head + (expl ? '<h4 class="quiz-fb-h">Why this is the answer</h4>' + studioParagraphsHtml(expl) : '');
    fb.classList.add('open');
  }
  var card = document.getElementById('pf-quiz-' + sampleId);
  if(!card) return;
  var total = parseInt(card.getAttribute('data-total'), 10) || 0;
  var qs = card.querySelectorAll('.pf-quiz-q');
  var done = 0, correct = 0;
  for(var j = 0; j < qs.length; j++){
    var picked = qs[j].querySelector('.quiz-opt.wrong');
    var right = qs[j].querySelector('.quiz-opt.correct');
    var anyDisabled = qs[j].querySelector('.quiz-opt:disabled');
    if(anyDisabled){ done++; if(!picked && right) correct++; }
  }
  var score = document.getElementById('pf-quiz-score-' + sampleId);
  if(score){
    score.textContent = done >= total
      ? ('You scored ' + correct + ' out of ' + total + '. ' + (correct === total ? 'All correct, well done.' : 'Re-read the lesson and try again on your next visit.'))
      : ('Answered ' + done + ' of ' + total + ' questions.');
  }
  if(done >= total && total > 0){
    var lid = sampleId.replace(/^studio-/, '');
    try {
      var p = JSON.parse(localStorage.getItem('payments-academy-progress-v1')) || {};
      if(!p.quiz) p.quiz = {};
      p.quiz[lid] = (correct === total);
      localStorage.setItem('payments-academy-progress-v1', JSON.stringify(p));
    } catch(e){}
    if(typeof paRecordActivity === 'function'){ try { paRecordActivity('quizzes'); } catch(e){} }
  }
}
/* Reveal the exercise answer. */
function pfRevealExercise(sampleId){
  var ans = document.getElementById('pf-ex-answer-' + sampleId);
  if(!ans) return;
  ans.classList.toggle('open');
  var btn = document.getElementById('pf-ex-btn-' + sampleId);
  if(btn) btn.textContent = ans.classList.contains('open') ? 'Hide the answer' : 'Show the answer';
}
/* Save note: a small editor under the title, stored in localStorage per
   lesson. No server. */
function pfToggleNote(sampleId){
  var ed = document.getElementById('studio-note-editor-' + sampleId);
  if(!ed) return;
  var open = ed.style.display === 'block';
  ed.style.display = open ? 'none' : 'block';
  if(!open){
    var ta = document.getElementById('studio-note-text-' + sampleId);
    if(ta){
      try { ta.value = localStorage.getItem('pa-note-' + sampleId) || ''; } catch(e){}
      ta.focus();
    }
  }
}
function pfSaveNote(sampleId){
  var ta = document.getElementById('studio-note-text-' + sampleId);
  if(!ta) return;
  try { localStorage.setItem('pa-note-' + sampleId, ta.value); } catch(e){}
  var msg = document.getElementById('studio-note-saved-' + sampleId);
  if(msg) msg.style.display = '';
  var ed = document.getElementById('studio-note-editor-' + sampleId);
  if(ed) ed.style.display = 'none';
}
function studioToggleCaptions(sampleId){
  var st = PA_STUDIOS[sampleId];
  if(!st) return;
  st.captions = !st.captions;
  var cap = document.getElementById('studio-caption-' + sampleId);
  if(cap) cap.style.display = st.captions ? 'block' : 'none';
  var b = document.getElementById('studio-captions-' + sampleId);
  if(b) b.textContent = st.captions ? 'Captions: On' : 'Captions: Off';
}
function studioSetVolume(sampleId, v){
  var st = PA_STUDIOS[sampleId];
  if(st) st.audio.volume = parseFloat(v);
}
/* Keep the player mute button in step with the audio element. Called on
   init (after restoring the persisted choice) and on every toggle. */
function studioSyncMuteButton(sampleId){
  var st = PA_STUDIOS[sampleId];
  if(!st) return;
  var muted = !!st.audio.muted;
  var b = document.getElementById('studio-mute-' + sampleId);
  if(!b) return;
  var lab = b.querySelector('.studio-mute-label');
  if(lab) lab.textContent = muted ? 'Unmute' : 'Mute';
  b.setAttribute('aria-label', muted ? 'Unmute narration' : 'Mute narration');
  b.classList.toggle('muted', muted);
  var waves = b.querySelectorAll('.studio-mute-waves');
  for(var i = 0; i < waves.length; i++){ waves[i].style.display = muted ? 'none' : ''; }
  var x = b.querySelector('.studio-mute-x');
  if(x) x.style.display = muted ? '' : 'none';
}
function studioToggleMute(sampleId){
  var st = PA_STUDIOS[sampleId];
  if(!st) return;
  st.audio.muted = !st.audio.muted;
  var muted = st.audio.muted;
  /* Carry the choice across scenes and lessons: the player reloads its
     audio on every scene change and navigation loads a new page, and both
     used to reset the sound to On because studioLoadScene re-applied the
     global (false) mute flag. Persist the choice and keep the global and
     the header toggle in step. */
  try {
    if(typeof soundMuted !== 'undefined') soundMuted = muted;
    sessionStorage.setItem('pa-sound-muted', muted ? '1' : '0');
  } catch(e){}
  var hb = document.getElementById('muteToggle');
  if(hb) hb.textContent = muted ? 'Sound: Off' : 'Sound: On';
  studioSyncMuteButton(sampleId);
}
function studioBookmark(sampleId){
  var st = PA_STUDIOS[sampleId];
  if(!st) return;
  try {
    localStorage.setItem('pa-studio-bookmark-' + sampleId, JSON.stringify({
      scene: st.scene, time: st.audio.currentTime
    }));
    var b = document.getElementById('studio-bookmark-' + sampleId);
    if(b) b.textContent = 'Bookmarked Scene ' + (st.scene + 1);
  } catch(e){}
}
function studioRestoreBookmark(sampleId){
  var btn = document.getElementById('studio-resume-' + sampleId);
  if(!btn) return;
  var raw = null;
  try { raw = localStorage.getItem('pa-studio-bookmark-' + sampleId); } catch(e){}
  if(!raw){ btn.style.display = 'none'; return; }
  try {
    var bm = JSON.parse(raw);
    btn.style.display = 'inline-block';
    btn.textContent = 'Resume: Scene ' + (bm.scene + 1);
    btn.onclick = function(){
      var st = PA_STUDIOS[sampleId];
      studioLoadScene(sampleId, bm.scene, false);
      var apply = function(){
        try { st.audio.currentTime = bm.time || 0; } catch(e){}
        studioRefresh(sampleId, bm.time || 0);
      };
      if(st.audio.readyState >= 1) apply();
      else st.audio.addEventListener('loadedmetadata', apply, {once: true});
      studioPlayAudio(sampleId, true);
    };
  } catch(e){ btn.style.display = 'none'; }
}
function studioMarkSceneDone(sampleId){
  var st = PA_STUDIOS[sampleId];
  if(!st) return;
  var scene = st.data.scenes[st.scene];
  st.doneScenes[scene.id] = true;
  if(typeof lessonDone === 'function') lessonDone(scene.id);
  var bar = document.getElementById('studio-bar-' + sampleId);
  if(bar) bar.style.width = Math.round(Object.keys(st.doneScenes).length / st.data.scenes.length * 100) + '%';
}
/* Global previous / next lesson navigation (fixes the missing buttons). */
function goLesson(sid){
  var m = sid.match(/^(ch\d+)s(\d+)$/);
  if(!m) return;
  var chid = m[1], sidx = parseInt(m[2], 10) - 1;
  if(typeof pauseAllAudio === 'function') pauseAllAudio();
  var page = document.getElementById(chid);
  if(!page) return;
  if(!page.classList.contains('active')){
    if(typeof openChapter === 'function') openChapter(chid);
  }
  var sampleId = null;
  Object.keys(PA_STUDIO_DATA).forEach(function(k){
    if(PA_STUDIO_DATA[k].chapter_id === chid) sampleId = k;
  });
  if(sampleId && PA_STUDIOS[sampleId]){
    studioLoadScene(sampleId, sidx, true);
    var st = document.getElementById('studio-' + sampleId);
    if(st) st.scrollIntoView({behavior: 'smooth'});
  } else {
    var el = document.getElementById(sid);
    if(el){
      el.scrollIntoView({behavior: 'smooth'});
      if(typeof playSectionAudio === 'function') playSectionAudio(sid);
    }
  }
}
/* Go to a lesson and autoplay its narration on arrival. Single-page
   behaviour: open the lesson inside the page. The multi-page build
   overrides this in nav.js to load lessons/<id>.html?autoplay=1. */
function goLessonAuto(sid){
  goLesson(sid);
}
function goChapterContents(chid){
  var toc = document.getElementById('toc-' + chid);
  if(toc) toc.scrollIntoView({behavior: 'smooth'});
}
/* Initialise every studio queued by the chapter pages above. This block
   runs after the function definitions, so the queue is drained here.
   Each init is guarded so one bad scene can never abort the rest. */
(window.__PA_STUDIO_QUEUE || []).forEach(function(item){
  PA_STUDIO_DATA[item[0]] = item[1];
  try { studioInit(item[0]); }
  catch(e){ if(window.console) console.error('studio init failed', item[0], e); }
});

