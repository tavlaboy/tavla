/**
 * Tavla — Lenis smooth scroll (safe defaults)
 * - Native touch scroll on mobile (no syncTouch lag)
 * - Skips when user prefers reduced motion
 * - Stops during mobile nav / modal locks
 */
(function () {
  'use strict';

  var SCROLL_CLASS_THRESHOLD = 20;

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function isScrollLocked() {
    return (
      document.body.classList.contains('mob-lock') ||
      document.body.style.overflow === 'hidden'
    );
  }

  function getScrollY() {
    return window.tavlaLenis ? window.tavlaLenis.scroll : window.scrollY;
  }

  function syncLenisLock() {
    if (!window.tavlaLenis) return;
    if (isScrollLocked()) window.tavlaLenis.stop();
    else window.tavlaLenis.start();
  }

  function bindNavbarScroll() {
    var nav = document.getElementById('navbar');
    if (!nav) return;

    var threshold = Number(nav.getAttribute('data-scroll-threshold')) || SCROLL_CLASS_THRESHOLD;

    function updateNavState() {
      nav.classList.toggle('scrolled', getScrollY() > threshold);
    }

    if (window.tavlaLenis) {
      window.tavlaLenis.on('scroll', updateNavState);
    } else {
      window.addEventListener('scroll', updateNavState, { passive: true });
    }

    updateNavState();
  }

  function initLenis() {
    if (typeof Lenis === 'undefined' || prefersReducedMotion()) return;

    window.tavlaLenis = new Lenis({
      lerp: 0.1,
      duration: 1.1,
      smoothWheel: true,
      syncTouch: false,
      autoRaf: true,
    });

    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var hash = link.getAttribute('href');
      if (!hash || hash === '#') return;
      var target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      window.tavlaLenis.scrollTo(target, { offset: -96, duration: 1.1 });
    });

    window.tavlaScrollY = getScrollY;

    window.tavlaLenisStop = function () {
      if (window.tavlaLenis) window.tavlaLenis.stop();
    };

    window.tavlaLenisStart = function () {
      if (window.tavlaLenis && !isScrollLocked()) window.tavlaLenis.start();
    };

    new MutationObserver(syncLenisLock).observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    syncLenisLock();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initLenis();
      bindNavbarScroll();
    });
  } else {
    initLenis();
    bindNavbarScroll();
  }
})();
