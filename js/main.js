/* ============================================================
   Deepanshu Kapoor — Portfolio
   Motion tokens mirror the stylesheet: expo.out easing,
   150–400ms micro-interactions, staggers of 40–60ms.
   Everything degrades gracefully — the page reads fine
   with JavaScript disabled.
   ============================================================ */

(function () {
  'use strict';

  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = motionQuery.matches;
  motionQuery.addEventListener('change', function (e) { reduced = e.matches; });

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* expo.out — the same curve as cubic-bezier(.16,1,.3,1) */
  var expoOut = function (t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); };


  /* ── 1. theme ──────────────────────────────────────────── */

  var root = document.documentElement;
  var themeBtn = $('#theme-toggle');

  var applyTheme = function (theme) {
    root.setAttribute('data-theme', theme);
    var dark = theme === 'dark';
    themeBtn.innerHTML = '<i class="fa-solid fa-' + (dark ? 'moon' : 'sun') + '"></i>';
    themeBtn.setAttribute('aria-label', 'Switch to ' + (dark ? 'light' : 'dark') + ' theme');
  };

  /* Dark by default for first-time visitors, regardless of OS preference —
     the glow, gradient orbs and glass surfaces are designed for it, and light
     is the accommodation rather than the equal alternative. Anyone who wants
     light gets it in one click, and that choice then wins on every visit. */
  var stored = null;
  try { stored = localStorage.getItem('theme'); } catch (e) { /* private mode */ }
  applyTheme(stored === 'light' || stored === 'dark' ? stored : 'dark');

  themeBtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
  });


  /* ── 2. navbar: scrolled state + mobile menu ───────────── */

  var navbar = $('#navbar');
  var navToggle = $('#nav-toggle');
  var navMenu = $('#nav-menu');

  var onScroll = function () {
    navbar.classList.toggle('scrolled', window.scrollY > 24);
    toTop.classList.toggle('show', window.scrollY > 500);
  };

  var closeMenu = function () {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  };

  navToggle.addEventListener('click', function () {
    var open = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  navMenu.addEventListener('click', function (e) {
    if (e.target.classList.contains('nav-link')) closeMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      closeMenu();
      navToggle.focus();
    }
  });


  /* ── 3. scroll-spy ─────────────────────────────────────── */

  var navLinks = $$('.nav-link');
  var sections = navLinks
    .map(function (a) { return $(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }


  /* ── 4. animated stat counters ─────────────────────────── */

  var countUp = function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;

    if (reduced) { el.textContent = String(target); return; }

    var duration = 1600;
    var start = null;

    var step = function (ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      el.textContent = String(Math.round(expoOut(p) * target));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = String(target);
    };
    requestAnimationFrame(step);
  };

  var statNums = $$('.stat-num');
  if ('IntersectionObserver' in window) {
    var counters = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    statNums.forEach(function (el) { counters.observe(el); });
  } else {
    statNums.forEach(countUp);
  }


  /* ── 5. scroll reveal with stagger ─────────────────────── */

  /* Groups reveal together; children inside a group stagger by 60ms
     (capped so long lists never feel sluggish). */
  var GROUPS = [
    { parent: '.section-header',    children: null },
    { parent: '.about-text',        children: null },
    { parent: '.about-cards',       children: '.about-card' },
    { parent: '.skills-grid',       children: '.skill-cat' },
    { parent: '.services-grid',     children: '.service-card' },
    { parent: '.cases',             children: '.case-card' },
    { parent: '.hof-grid',          children: '.hof-card' },
    { parent: '.trust-inner',       children: '.trust-item' },
    { parent: '.cta-band-inner',    children: null },
    { parent: '.contact-info',      children: '.info-card' },
    { parent: '.footer-inner',      children: null }
  ];

  if (!reduced && 'IntersectionObserver' in window) {
    var revealables = [];

    GROUPS.forEach(function (g) {
      $$(g.parent).forEach(function (parent) {
        if (g.children) {
          $$(g.children, parent).forEach(function (child, i) {
            child.style.setProperty('--d', Math.min(i * 60, 400) + 'ms');
            child.classList.add('reveal');
            revealables.push(child);
          });
        } else {
          parent.classList.add('reveal');
          revealables.push(parent);
        }
      });
    });

    var revealer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    revealables.forEach(function (el) { revealer.observe(el); });
  }


  /* ── 6. magnetic primary CTA ───────────────────────────── */

  /* Deliberately limited to a single focal element — more than
     one or two on a page reads as noise. */
  var magnet = $('.hero-actions .btn-primary');

  if (magnet && !reduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var mx = 0, my = 0, cx = 0, cy = 0, raf = null;

    var loop = function () {
      cx += (mx - cx) * 0.16;
      cy += (my - cy) * 0.16;
      magnet.style.transform = 'translate(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px)';

      if (Math.abs(mx - cx) > 0.1 || Math.abs(my - cy) > 0.1) {
        raf = requestAnimationFrame(loop);
      } else {
        magnet.style.transform = mx === 0 && my === 0 ? '' : magnet.style.transform;
        raf = null;
      }
    };
    var kick = function () { if (raf === null) raf = requestAnimationFrame(loop); };

    magnet.style.willChange = 'transform';

    magnet.addEventListener('mousemove', function (e) {
      var r = magnet.getBoundingClientRect();
      mx = (e.clientX - r.left - r.width / 2) * 0.28;   // clamped pull
      my = (e.clientY - r.top - r.height / 2) * 0.4;
      kick();
    });

    magnet.addEventListener('mouseleave', function () { mx = 0; my = 0; kick(); });
  }


  /* ── 7. pointer-tracked card glow ──────────────────────── */

  if (!reduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.glass-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  }


  /* ── 8. copy to clipboard ──────────────────────────────── */

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.copy-btn');
    if (!btn) return;

    var text = btn.getAttribute('data-copy');
    var done = function () {
      btn.innerHTML = '<i class="fa-solid fa-check"></i>';
      btn.classList.add('copied');
      setTimeout(function () {
        btn.innerHTML = '<i class="fa-regular fa-copy"></i>';
        btn.classList.remove('copied');
      }, 1800);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(function () { /* denied */ });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (err) { /* no clipboard */ }
      document.body.removeChild(ta);
    }
  });


  /* ── 9. back to top ───────────────────────────────────── */

  var toTop = $('#to-top');
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  /* ── 10. custom cursor ─────────────────────────────────── */

  /* Only for mouse users with motion enabled. Touch, coarse
     pointers and reduced-motion keep the native cursor —
     hiding it there would just be a worse experience. */
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (fine && !reduced) {
    var dot  = $('#cursor-dot');
    var ring = $('#cursor-ring');

    var px = window.innerWidth / 2, py = window.innerHeight / 2;   // pointer
    var rx = px, ry = py;                                          // ring (lags)
    var ticking = false;

    var render = function () {
      rx += (px - rx) * 0.18;
      ry += (py - ry) * 0.18;

      dot.style.transform  = 'translate3d(' + px + 'px,' + py + 'px,0)';
      ring.style.transform = 'translate3d(' + rx.toFixed(2) + 'px,' + ry.toFixed(2) + 'px,0)';

      // keep animating only while the ring is still catching up
      if (Math.abs(px - rx) > 0.1 || Math.abs(py - ry) > 0.1) {
        requestAnimationFrame(render);
      } else {
        ticking = false;
      }
    };

    var kickCursor = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(render); }
    };

    root.classList.add('custom-cursor');

    window.addEventListener('mousemove', function (e) {
      px = e.clientX;
      py = e.clientY;
      kickCursor();
    }, { passive: true });

    // state changes driven by what's under the pointer
    /* Only genuinely clickable things bloom the ring — if the cursor
       reacts to decorative elements it stops meaning "you can click". */
    var HOT = 'a, button, [role="button"], summary, select';
    var TEXT = 'input, textarea';

    document.addEventListener('mouseover', function (e) {
      if (!e.target.closest) return;
      root.classList.toggle('cursor-text', !!e.target.closest(TEXT));
      root.classList.toggle('cursor-hot', !e.target.closest(TEXT) && !!e.target.closest(HOT));
    });

    document.addEventListener('mousedown', function () { root.classList.add('cursor-down'); });
    document.addEventListener('mouseup',   function () { root.classList.remove('cursor-down'); });

    // hide when the pointer leaves the window, restore on return
    document.addEventListener('mouseleave', function () {
      dot.style.opacity = ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', function () {
      dot.style.opacity = ring.style.opacity = '';
    });

    kickCursor();
  }


  /* ── 11. footer year ───────────────────────────────────── */

  $('#year').textContent = new Date().getFullYear();
})();
