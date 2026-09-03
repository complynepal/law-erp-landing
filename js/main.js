/* ==========================================================================
   Tarikh — Landing page interactions
   Vanilla JS only. Deferred in the document head.
   ========================================================================== */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------- Sticky header ---------------------------- */
  var header = document.getElementById('siteHeader');

  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------- Mobile menu ---------------------------- */
  var menuBtn = document.getElementById('menuBtn');
  var mobileNav = document.getElementById('mobileNav');

  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileNav.classList.toggle('is-open', open);
    if (open) {
      // wait for the visibility transition so the panel is focusable
      var first = mobileNav.querySelector('a');
      if (first) window.setTimeout(function () { first.focus(); }, 60);
    }
  }

  menuBtn.addEventListener('click', function () {
    setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
  });

  mobileNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { setMenu(false); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuBtn.focus();
    }
  });

  /* ---------------------------- Scroll reveal ---------------------------- */
  var reveals = document.querySelectorAll('[data-reveal]');

  function showInView() {
    var vh = window.innerHeight;
    reveals.forEach(function (el) {
      if (el.classList.contains('is-visible')) return;
      var rect = el.getBoundingClientRect();
      if (rect.top < vh - 48 && rect.bottom > 0) {
        el.classList.add('is-visible');
      }
    });
  }

  if (!reducedMotion) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

      reveals.forEach(function (el) { io.observe(el); });
    }

    // Fallback for environments where IntersectionObserver never fires
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        showInView();
        ticking = false;
      });
    }, { passive: true });

    window.addEventListener('load', showInView);
    showInView();
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ------------------------------ Feature tabs ------------------------------ */
  var tablist = document.querySelector('[role="tablist"]');

  function activateTab(tab) {
    if (!tablist) return;
    var tabs = tablist.querySelectorAll('[role="tab"]');
    var panels = document.querySelectorAll('[role="tabpanel"]');

    tabs.forEach(function (t) {
      var active = t === tab;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
      t.tabIndex = active ? 0 : -1;
    });

    panels.forEach(function (p) {
      p.classList.toggle('is-active', p.id === tab.getAttribute('aria-controls'));
    });
  }

  if (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () { activateTab(tab); });

      tab.addEventListener('keydown', function (e) {
        var idx = tabs.indexOf(tab);
        var next = null;

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(idx + 1) % tabs.length];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(idx - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];

        if (next) {
          e.preventDefault();
          activateTab(next);
          next.focus();
        }
      });
    });
  }

  /* --------------------- Footer links that jump to a tab --------------------- */
  document.querySelectorAll('[data-tab-target]').forEach(function (link) {
    link.addEventListener('click', function () {
      var tab = document.getElementById('tab-' + link.getAttribute('data-tab-target'));
      if (tab) activateTab(tab);
    });
  });

  /* -------------------------------- FAQ accordion -------------------------------- */
  var faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    var btn = item.querySelector('.faq-q');

    btn.addEventListener('click', function () {
      var willOpen = !item.classList.contains('is-open');

      faqItems.forEach(function (other) {
        other.classList.remove('is-open');
        other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });

      if (willOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();
