/* ============================================================
   WHEN Blog — Hero Slideshow
   Moves a flex-row track with transform: translateX
============================================================ */

(function() {
  'use strict';

  function init(slideshow) {
    if (slideshow.dataset.whenInited === 'true') return;
    slideshow.dataset.whenInited = 'true';

    var track = slideshow.querySelector('[data-when-track]');
    if (!track) return;

    var slides = track.children;
    if (slides.length < 2) return;

    var current = 0;
    var autoplay = slideshow.dataset.autoplay === 'true';
    var speedSec = parseInt(slideshow.dataset.autoplaySpeed, 10);
    var speed = (isNaN(speedSec) ? 6 : speedSec) * 1000;
    var timer = null;

    function goTo(idx) {
      current = (idx + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
    }
    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }
    function start() {
      stop();
      if (autoplay) timer = setInterval(next, speed);
    }

    var nextBtn = slideshow.querySelector('[data-when-next]');
    var prevBtn = slideshow.querySelector('[data-when-prev]');

    if (nextBtn) {
      nextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        next();
        start();
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        prev();
        start();
      });
    }

    slideshow.addEventListener('mouseenter', stop);
    slideshow.addEventListener('mouseleave', start);

    start();
  }

  function initAll(root) {
    var scope = root || document;
    var slideshows = scope.querySelectorAll('[data-when-slideshow]');
    for (var i = 0; i < slideshows.length; i++) {
      init(slideshows[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { initAll(); });
  } else {
    initAll();
  }

  // Shopify theme editor
  document.addEventListener('shopify:section:load', function(e) {
    if (e.target) initAll(e.target);
  });
  document.addEventListener('shopify:section:unload', function(e) {
    if (!e.target) return;
    var slideshows = e.target.querySelectorAll('[data-when-slideshow]');
    for (var i = 0; i < slideshows.length; i++) {
      delete slideshows[i].dataset.whenInited;
    }
  });
})();