// assets/js/parallax.js
// Drives parallax translateY on .blob[data-speed] elements.
// Uses requestAnimationFrame + a ticking flag to avoid jank.

(function () {
  'use strict';

  // Respect prefers-reduced-motion
  var motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!motionOK) return;

  var blobs = document.querySelectorAll('.blob[data-speed]');
  if (!blobs.length) return;

  var ticking = false;

  function update() {
    var y = window.scrollY;
    blobs.forEach(function (b) {
      var speed = parseFloat(b.dataset.speed) || 0;
      b.style.transform = 'translateY(' + (y * speed).toFixed(1) + 'px)';
    });
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
})();
