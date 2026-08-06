/* ============================================================
   Deepanshu Kapoor — portfolio interactions
   Animation via Motion (motion.dev), loaded from CDN as an ES module.
   Everything degrades gracefully: if Motion fails to load, content
   stays visible and the plain-JS interactions below still run.
   ============================================================ */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── plain interactions (no dependency on Motion) ───────── */
function initBasics() {
  // current year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // navbar background on scroll
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 20);
    // back-to-top
    const toTop = document.getElementById('to-top');
    if (toTop) toTop.classList.toggle('show', window.scrollY > 600);
    // scroll progress
    const prog = document.getElementById('scroll-progress');
    if (prog) {
      const h = document.documentElement;
      const pct = (h.scrollTop || document.body.scrollTop) / (h.scrollHeight - h.clientHeight);
      prog.style.width = (pct * 100).toFixed(2) + '%';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // mobile nav
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    navMenu.querySelectorAll('.nav-link').forEach(link =>
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      })
    );
  }

  // back to top
  const toTop = document.getElementById('to-top');
  if (toTop) toTop.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  );

  // copy email
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy || '');
        const icon = btn.querySelector('i');
        const prev = icon ? icon.className : '';
        btn.classList.add('copied');
        if (icon) icon.className = 'fa-solid fa-check';
        setTimeout(() => { btn.classList.remove('copied'); if (icon) icon.className = prev; }, 1600);
      } catch (_) { /* clipboard blocked — ignore */ }
    });
  });

  // active nav link via scroll spy
  const sections = [...document.querySelectorAll('main section[id]')];
  const links = new Map();
  document.querySelectorAll('.nav-link').forEach(l => {
    const id = l.getAttribute('href').slice(1);
    if (id) links.set(id, l);
  });
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.remove('active'));
          const active = links.get(e.target.id);
          if (active) active.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }
}

/* ── role typewriter (CSS handles the caret blink) ──────── */
function initTyper() {
  const el = document.getElementById('role-typer');
  if (!el) return;
  const roles = (el.dataset.roles || '').split('|').filter(Boolean);
  if (roles.length < 2 || reduceMotion) return;

  let roleIdx = 0, charIdx = roles[0].length, deleting = false;
  const tick = () => {
    const word = roles[roleIdx];
    charIdx += deleting ? -1 : 1;
    el.textContent = word.slice(0, charIdx);
    let delay = deleting ? 45 : 90;
    if (!deleting && charIdx === word.length) { delay = 1600; deleting = true; }
    else if (deleting && charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; delay = 400; }
    setTimeout(tick, delay);
  };
  setTimeout(tick, 1800);
}

/* ── stat counters (independent of Motion, always runs) ─── */
function initCounters() {
  const nums = document.querySelectorAll('.stat-num[data-count]');
  if (!nums.length) return;

  const run = el => {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (reduceMotion) { el.textContent = String(target); return; }
    const dur = 1400, start = performance.now();
    const step = now => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = String(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = String(target);
    };
    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => { if (e.isIntersecting) { run(e.target); obs.unobserve(e.target); } });
  }, { threshold: 0.5 });
  nums.forEach(n => io.observe(n));
}

/* ── scroll reveals ──────────────────────────────────────
   Content animates in as you scroll. Motion powers it when
   the CDN module loads; otherwise a dependency-free
   IntersectionObserver + CSS fallback does the same thing.  */
async function initAnimations() {
  const els = [...document.querySelectorAll('[data-reveal]')];
  if (!els.length) return;

  // 'js' hides reveal targets (added in <head> already; set again defensively);
  // 'anim-ready' tells the <head> safety net we took over.
  document.documentElement.classList.add('js', 'anim-ready');

  const cssReveal = () => {
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return; }
    document.documentElement.classList.add('css-reveal');
    document.querySelectorAll('[data-reveal-group]').forEach(group => {
      group.querySelectorAll('[data-reveal]').forEach((el, i) => { el.style.transitionDelay = (i * 90) + 'ms'; });
    });
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => io.observe(el));
  };

  // Reduced motion: gentle opacity fade only (no movement) via the CSS path.
  if (reduceMotion) { cssReveal(); return; }

  // Prefer Motion, but don't wait on the CDN forever — fall back after 700ms.
  let motion = null;
  try {
    motion = await Promise.race([
      import('https://cdn.jsdelivr.net/npm/motion@14.6.0/+esm'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('motion-timeout')), 700))
    ]);
  } catch (err) { console.warn('[motion] unavailable or slow — CSS reveal fallback.', err); }

  if (motion && motion.inView && motion.animate) {
    const { animate, inView, stagger } = motion;
    const up = { opacity: [0, 1], transform: ['translateY(36px)', 'translateY(0px)'] };
    const opts = { duration: .75, ease: [0.22, 1, 0.36, 1] };

    document.querySelectorAll('[data-reveal-group]').forEach(group => {
      const items = group.querySelectorAll('[data-reveal]');
      inView(group, () => animate(items, up, { ...opts, delay: stagger(0.1) }),
        { amount: 0.15, margin: '0px 0px -8% 0px' });
    });
    els.forEach(el => {
      if (el.closest('[data-reveal-group]')) return;
      inView(el, () => animate(el, up, opts), { amount: 0.2 });
    });
    return;
  }

  cssReveal();
}

/* ── repo slider (native scroll + arrows + drag) ────────── */
function initSlider() {
  const track = document.getElementById('repo-track');
  if (!track) return;
  const section = track.closest('.section') || document;
  const prev = section.querySelector('.slider-btn.prev');
  const next = section.querySelector('.slider-btn.next');

  // Duplicate the cards once so the auto-scroll can loop seamlessly.
  const originals = [...track.children];
  const n = originals.length;
  originals.forEach(node => {
    const clone = node.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.tabIndex = -1;
    track.appendChild(clone);
  });

  // Width of one full set of cards = distance to the first clone.
  const loopWidth = () => {
    const first = track.children[0], marker = track.children[n];
    return marker ? marker.offsetLeft - first.offsetLeft : track.scrollWidth / 2;
  };
  const wrap = () => {
    const w = loopWidth();
    if (w > 0) {
      if (track.scrollLeft >= w) track.scrollLeft -= w;
      else if (track.scrollLeft < 0) track.scrollLeft += w;
    }
  };
  const stepSize = () => {
    const card = track.querySelector('.repo-card');
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 18;
    return card ? card.getBoundingClientRect().width + gap : 320;
  };

  let paused = false, down = false;
  const pauseFor = ms => {
    paused = true;
    clearTimeout(pauseFor._t);
    if (ms) pauseFor._t = setTimeout(() => { if (!down && !track.matches(':hover')) paused = false; }, ms);
  };

  if (prev) prev.addEventListener('click', () => { track.scrollBy({ left: -stepSize(), behavior: reduceMotion ? 'auto' : 'smooth' }); pauseFor(2500); });
  if (next) next.addEventListener('click', () => { track.scrollBy({ left: stepSize(), behavior: reduceMotion ? 'auto' : 'smooth' }); pauseFor(2500); });
  track.addEventListener('scroll', wrap, { passive: true });

  // Drag / swipe to scroll; suppress the click if the user actually dragged.
  let startX = 0, startScroll = 0, moved = false;
  track.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch') return; // native touch scrolling handles touch
    down = true; moved = false; paused = true; startX = e.clientX; startScroll = track.scrollLeft;
    track.classList.add('grabbing');
  });
  track.addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 5) moved = true;
    track.scrollLeft = startScroll - dx;
  });
  const endDrag = () => { if (down) { down = false; track.classList.remove('grabbing'); pauseFor(1500); } };
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);
  track.querySelectorAll('.repo-card').forEach(a =>
    a.addEventListener('click', e => { if (moved) { e.preventDefault(); moved = false; } })
  );

  if (reduceMotion) return; // no auto-scroll under reduced motion

  // Auto-scroll — pauses on hover, focus, touch, drag, and when the tab is hidden.
  const SPEED = 0.6; // px per frame
  const loop = () => { if (!paused) { track.scrollLeft += SPEED; wrap(); } requestAnimationFrame(loop); };
  track.addEventListener('pointerenter', () => { paused = true; });
  track.addEventListener('pointerleave', () => { if (!down) paused = false; });
  track.addEventListener('focusin', () => { paused = true; });
  track.addEventListener('focusout', () => { if (!track.matches(':hover')) paused = false; });
  track.addEventListener('touchstart', () => { paused = true; }, { passive: true });
  track.addEventListener('touchend', () => pauseFor(2500), { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) paused = true; else if (!track.matches(':hover')) paused = false; });
  requestAnimationFrame(loop);
}

/* ── smooth (inertia) scrolling via Lenis ───────────────── */
async function initSmoothScroll() {
  if (reduceMotion) return; // respect reduced motion — keep native scrolling
  let Lenis;
  try { Lenis = (await import('https://cdn.jsdelivr.net/npm/lenis@1.1.20/+esm')).default; }
  catch (err) { console.warn('[lenis] unavailable — native scrolling.', err); return; }

  const lenis = new Lenis({
    duration: 1.05,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
  });
  const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);

  // Smooth in-page anchor navigation, offset for the fixed navbar.
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const hash = a.getAttribute('href');
      if (hash.length < 2) return;
      const target = document.querySelector(hash);
      if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -70 }); }
    });
  });

  window.__lenis = lenis;
}

/* ── boot ───────────────────────────────────────────────── */
function boot() {
  initBasics();
  initCounters();
  initTyper();
  initSlider();
  initAnimations();
  initSmoothScroll();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
