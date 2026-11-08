/* tommykho.github.io — home interactions (vanilla, no dependencies) */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  window.addEventListener('load', () => document.body.classList.remove('is-preload'));
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---- Theme toggle: dark (default) <-> light, shared with About ---- */
  $('#theme-toggle')?.addEventListener('click', () => {
    const root = document.documentElement;
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('th-theme', next); } catch (e) {}
  });

  /* ---- Split the hero name into letters ---- */
  $$('[data-split]').forEach((el) => {
    const text = el.textContent;
    el.setAttribute('aria-label', text);
    el.textContent = '';
    [...text].forEach((c, n) => {
      const s = document.createElement('span');
      s.className = c === ' ' ? 'ch sp' : 'ch';
      s.textContent = c === ' ' ? ' ' : c;
      s.style.setProperty('--n', n);
      s.setAttribute('aria-hidden', 'true');
      el.appendChild(s);
    });
  });

  /* ---- Split the manifesto into words ---- */
  const statement = $('[data-words]');
  let words = [];
  if (statement) {
    const walk = (node, out) => {
      [...node.childNodes].forEach((ch) => {
        if (ch.nodeType === 3) {
          ch.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) out.appendChild(document.createTextNode(part));
            else {
              const w = document.createElement('span');
              w.className = 'w';
              w.textContent = part;
              out.appendChild(w);
            }
          });
        } else {
          const clone = ch.cloneNode(false);
          walk(ch, clone);
          out.appendChild(clone);
        }
      });
    };
    const frag = document.createDocumentFragment();
    walk(statement, frag);
    statement.textContent = '';
    statement.appendChild(frag);
    words = $$('.w', statement);
  }

  /* ---- Reveal on scroll ---- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      countUp(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  $$('[data-reveal], .panel').forEach((el) => io.observe(el));

  /* ---- Number count-up ---- */
  function countUp(root) {
    $$('[data-count]', root).forEach((el) => {
      const end = +el.dataset.count;
      if (reduce || end === 0) { el.textContent = end; return; }
      const t0 = performance.now(), dur = 1200;
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  /* ---- Cursor spotlight on cards ---- */
  $$('.spot').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* ---- Scroll-driven: top bar, manifesto words, stacking panels ---- */
  const bar = $('#topbar');
  const panels = $$('.panel');
  const stackable = () => matchMedia('(min-width: 981px)').matches && !reduce;
  let lastY = scrollY, ticking = false;

  function onScroll() {
    const y = scrollY, vh = innerHeight;

    bar.classList.toggle('is-solid', y > vh * 0.6);
    bar.classList.toggle('is-hidden', y > lastY && y > vh && y - lastY > 4);
    if (y < lastY - 4 || y < vh) bar.classList.remove('is-hidden');
    lastY = y;

    if (statement && words.length) {
      const r = statement.getBoundingClientRect();
      const p = reduce ? 1 : Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const lit = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < lit));
    }

    if (stackable()) {
      panels.forEach((p, i) => {
        const next = panels[i + 1];
        if (!next) { p.style.setProperty('--p', 0); return; }
        const pr = p.getBoundingClientRect(), nr = next.getBoundingClientRect();
        const k = Math.min(1, Math.max(0, (pr.bottom - nr.top) / pr.height));
        p.style.setProperty('--p', k.toFixed(3));
      });
    } else panels.forEach((p) => p.style.setProperty('--p', 0));

    ribbonScroll = y;
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);

  /* ---- Ribbon canvas: a silk band of strands in the three site colours ---- */
  const cv = $('#ribbon');
  let ribbonScroll = 0;
  if (cv) {
    const ctx = cv.getContext('2d');
    let w = 0, h = 0, dpr = 1, running = false, t = 0, raf = 0;
    const STRANDS = 46;
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };
    function draw() {
      ctx.clearRect(0, 0, w, h);
      const g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, '#d9442f');
      g.addColorStop(0.5, '#5b93c7');
      g.addColorStop(1, '#ffc93c');
      ctx.strokeStyle = g;
      const phase = t * 0.00035 + ribbonScroll * 0.0012;
      const cy = h * 0.55, amp = h * 0.18, step = Math.max(6, w / 140);
      for (let i = 0; i < STRANDS; i++) {
        const f = i / (STRANDS - 1) - 0.5;
        ctx.globalAlpha = 0.08 + 0.5 * (1 - Math.abs(f) * 2) ** 2;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = -20; x <= w + 20; x += step) {
          const u = x / w;
          const twist = Math.sin(u * 5.2 - phase * 1.7);
          const y = cy
            + Math.sin(u * 3.1 + phase) * amp
            + Math.sin(u * 7.3 - phase * 1.3) * amp * 0.25
            + f * twist * h * 0.22;
          x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    const loop = (now) => { t = now; draw(); if (running) raf = requestAnimationFrame(loop); };
    new IntersectionObserver(([e]) => {
      if (reduce) return;
      running = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (running) raf = requestAnimationFrame(loop);
    }).observe(cv);
    new ResizeObserver(resize).observe(cv);
    resize();
  }

  onScroll();
})();
