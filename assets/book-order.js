/* Book order (15 Nov 2026, display numbering): the single place that
   returns the reading order. getBookOrder(mapData, catalogue) returns
   the map order whenever the map loads; the ONLY fallback is a map
   load failure, in which case sequential display numbers are computed
   from numeric chapter order. Internal IDs are never shown: every
   label uses the book number, the part title, or the catalogue title.
   The map file's status field is informational only: the owner order
   of 15 Nov 2026 made the map order active for display numbers,
   contents order and prev/next navigation. Editing the map changes
   the order with no template rebuild. */
(function (global) {
  'use strict';
  function chapterNum(cid) {
    var m = /^ch(\d+)$/.exec(String(cid || ''));
    return m ? parseInt(m[1], 10) : 9999;
  }
  function lessonUrl(lid) {
    return 'lessons/' + lid + '.html';
  }
  function getBookOrder(mapData, catalogue) {
    catalogue = catalogue || {};
    var chapters = catalogue.chapters || {};
    function chapterEntry(cid, bookNumber) {
      var cat = chapters[cid] || {};
      var lessons = [];
      var src = cat.lessons || {};
      Object.keys(src).sort(function (a, b) {
        var na = parseInt(String(a).split('s')[1] || '0', 10);
        var nb = parseInt(String(b).split('s')[1] || '0', 10);
        return na - nb;
      }).forEach(function (lid, i) {
        lessons.push({ id: lid, displayNumber: i + 1, heading: src[lid] || '', url: lessonUrl(lid) });
      });
      return { id: cid, bookNumber: bookNumber, title: cat.title || '', lessons: lessons };
    }
    if (mapData && Array.isArray(mapData.parts) && mapData.parts.length) {
      var parts = [];
      var seen = {};
      mapData.parts.forEach(function (part) {
        var pch = [];
        (part.chapters || []).forEach(function (ch) {
          var entry = chapterEntry(ch.id, ch.book_number);
          /* Lesson order and display numbers come from the map, never
             from the catalogue key order. */
          var cat = chapters[ch.id] || {};
          var src = cat.lessons || {};
          entry.lessons = (ch.lessons || []).map(function (les) {
            return { id: les.id, displayNumber: les.display_number, heading: src[les.id] || '', url: lessonUrl(les.id) };
          });
          pch.push(entry);
          seen[ch.id] = true;
        });
        parts.push({ part: part.part, title: part.title || '', chapters: pch });
      });
      var heldOut = [];
      (mapData.held_out || []).forEach(function (held) {
        if (chapters[held.id]) heldOut.push(chapterEntry(held.id, null));
      });
      /* Any catalogued chapter the map never mentions stays reachable
         in the held-out section, with no book number, rather than
         vanishing from the contents. */
      Object.keys(chapters).sort(function (a, b) { return chapterNum(a) - chapterNum(b); }).forEach(function (cid) {
        if (!seen[cid] && heldOut.filter(function (c) { return c.id === cid; }).length === 0) {
          heldOut.push(chapterEntry(cid, null));
        }
      });
      return { parts: parts, heldOut: heldOut, fallback: false,
               totalChapters: parts.reduce(function (n, p) { return n + p.chapters.length; }, 0),
               totalLessons: parts.reduce(function (n, p) { return n + p.chapters.reduce(function (m, c) { return m + c.lessons.length; }, 0); }, 0) };
    }
    /* Load-failure fallback: sequential numbers from numeric order. */
    var ordered = Object.keys(chapters).sort(function (a, b) { return chapterNum(a) - chapterNum(b); });
    var fbChapters = ordered.map(function (cid, i) { return chapterEntry(cid, i + 1); });
    return { parts: [{ part: 1, title: 'All chapters', chapters: fbChapters }], heldOut: [],
             fallback: true, totalChapters: fbChapters.length,
             totalLessons: fbChapters.reduce(function (n, c) { return n + c.lessons.length; }, 0) };
  }
  function loadBookOrder(prefix, catalogue) {
    prefix = prefix || '';
    return fetch(prefix + 'assets/reading-order.json').then(function (r) {
      if (!r.ok) throw new Error('reading-order map not available');
      return r.json();
    }).then(function (mapData) {
      return getBookOrder(mapData, catalogue);
    }).catch(function () {
      return getBookOrder(null, catalogue);
    });
  }
  var api = { getBookOrder: getBookOrder, loadBookOrder: loadBookOrder };
  if (global) global.PFBookOrder = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
