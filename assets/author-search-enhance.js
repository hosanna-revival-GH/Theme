(function () {
  var SECTION = 'author-search-results';
  var BLOCK = '[data-author-results]';

  function debounce(fn, wait) {
    var t;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }

  function setup(ps) {
    var input = ps.querySelector('input[type="search"]');
    var results = ps.querySelector('#predictive-search') || ps.querySelector('[id="predictive-search"]');
    if (!input || !results) return;

    var cachedHtml = '';

    function clear() {
      cachedHtml = '';
      var ex = results.querySelector(BLOCK);
      if (ex) ex.remove();
    }

    function inject() {
      if (!cachedHtml) return;
      if (results.style.display === 'none') return;
      if (results.querySelector(BLOCK)) return;

      var container = results.querySelector('#predictive-search-results') || results;
      var group = container.querySelector('.results__group-1');

      if (group) {
        group.style.display = '';                 // native hides col-1 when it has no results
        group.insertAdjacentHTML('afterbegin', cachedHtml);
      } else {
        container.classList.remove('predictive-search-results--none');
        var none = container.querySelector('.predictive-search__no-results');
        if (none) none.closest('.results').style.display = 'none';
        container.insertAdjacentHTML('afterbegin', cachedHtml);
      }
      if (window.AOS) AOS.refreshHard();
    }

    var run = debounce(function () {
      var term = input.value.trim();
      if (term.length < 2) { clear(); return; }
      cachedHtml = '';
      var url = '/search?q=' + encodeURIComponent(term) +
                '&type=article&options[prefix]=last&section_id=' + SECTION;
      fetch(url)
        .then(function (r) { return r.text(); })
        .then(function (text) {
          if (input.value.trim() !== term) return;                 // stale, kept typing
          var block = new DOMParser().parseFromString(text, 'text/html').querySelector(BLOCK);
          cachedHtml = (block && block.children.length) ? block.outerHTML : '';
          inject();
        })
        .catch(function () {});
    }, 350);

    input.addEventListener('input', run);
    document.addEventListener('predictive-search:close-all', clear);

    // Native code repaints #predictive-search on every keystroke — re-inject after each.
    new MutationObserver(inject).observe(results, { childList: true });
  }

  function init() { document.querySelectorAll('predictive-search').forEach(setup); }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();