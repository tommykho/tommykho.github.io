/* Ink strokes: p5.brush (standalone build, no p5.js) paints the ensō and the
   Sun Tzu hills on a canvas once; anime.js reveals them with a mask.
   Progressive enhancement: the SVG artwork stays if WebGL2 or the libraries
   are unavailable. Libraries load only when an ink element nears the viewport.

   Markup:
     data-ink="enso"   on the box that holds the 64x64 ensō SVG
     data-ink="hills"  on the panel art that holds the 600x400 hills SVG
*/
(() => {
  const BRUSH_SRC = 'https://cdn.jsdelivr.net/npm/p5.brush@2.2.3/dist/brush.js';
  const ANIME_SRC = 'https://cdn.jsdelivr.net/npm/animejs@4.5.0/dist/bundles/anime.umd.min.js';

  const targets = [...document.querySelectorAll('[data-ink]')];
  if (!targets.length || !('IntersectionObserver' in window)) return;
  try { if (!document.createElement('canvas').getContext('webgl2')) return; } catch (e) { return; }

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const ENSO_D = 'M41 9.5C30 5.5 15 10 10.5 23c-4.6 13.3 3.6 28 17.4 31 13.6 3 25.6-5.8 27-19 .9-8.4-2.7-15.6-8.6-20.2';
  const HILLS = [
    'M0 300 C80 220 140 250 200 190 C260 130 320 210 380 170 C440 130 520 200 600 160',
    'M0 340 C60 300 120 320 180 280 C250 230 300 300 370 260 C430 230 500 290 600 250',
    'M0 370 C90 340 160 360 240 330 C320 300 390 350 470 320 C530 300 570 330 600 320',
  ];

  /* ---------- helpers ---------- */
  const loadScript = (src) => new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.async = true; s.crossOrigin = 'anonymous';
    s.onload = resolve; s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
  let libs = null;
  const getLibs = () => (libs ||= Promise.all([
    window.brush ? null : loadScript(BRUSH_SRC),
    reduce || window.anime ? null : loadScript(ANIME_SRC),
  ]));

  function sample(d, n) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    const path = document.createElementNS(SVG_NS, 'path');
    svg.style.cssText = 'position:absolute;width:0;height:0;visibility:hidden';
    path.setAttribute('d', d);
    svg.appendChild(path); document.body.appendChild(svg);
    const L = path.getTotalLength(), pts = [];
    for (let i = 0; i <= n; i++) { const q = path.getPointAtLength((L * i) / n); pts.push([q.x, q.y]); }
    svg.remove();
    return pts;
  }

  function mix(a, b, t) {
    const hex = (c) => [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16));
    const A = hex(a), B = hex(b);
    return '#' + A.map((v, k) => Math.round(v + (B[k] - v) * t).toString(16).padStart(2, '0')).join('');
  }

  // scaleBrushes() multiplies the current scale, so track it and apply ratios.
  let brushScale = 1;
  function setBrushScale(s) { brush.scaleBrushes(s / brushScale); brushScale = s; }

  function makeCanvas(host, w, h, left, top) {
    // cap pixel density, and lower it for very large canvases to keep painting cheap
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (w * h * dpr * dpr > 2.4e6) dpr = Math.max(1, Math.sqrt(2.4e6 / (w * h)));
    const canvas = brush.createCanvas(w, h, { parent: host, pixelDensity: dpr, id: `ink-${Math.random().toString(36).slice(2, 8)}` });
    canvas.classList.add('ink-canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText += `;position:absolute;left:${left}px;top:${top}px;pointer-events:none;`;
    host.insertBefore(canvas, host.firstChild);
    return canvas;
  }

  /* ---------- painters ---------- */
  function paintEnso(host) {
    const B = Math.min(host.clientWidth, host.clientHeight);
    if (B < 20) return null;
    const pad = 0.16, C = Math.round(B * (1 + 2 * pad)), off = -B * pad;
    const canvas = makeCanvas(host, C, C, off, off);
    setBrushScale(B * 0.0143);
    const color = host.dataset.inkColor || '#ece4d2';
    const N = 64;
    const raw = sample(ENSO_D, N);
    const pts = raw.map(([x, y]) => [(x / 64) * B + B * pad - C / 2, (y / 64) * B + B * pad - C / 2]);
    brush.set('marker', color, 2.2);
    brush.spline(pts.map(([x, y], i) => [x, y, 1.5 - (i / N) * 1.1]), 0.5);
    brush.set('charcoal', color, 2.6);
    brush.spline(pts.map(([x, y], i) => [x, y, 1.2 - (i / N) * 0.6]), 0.5);
    brush.render();

    // conic mask that sweeps counter-clockwise from the stroke's start point
    const cx = raw.reduce((s, p) => s + p[0], 0) / raw.length;
    const cy = raw.reduce((s, p) => s + p[1], 0) / raw.length;
    const start = (Math.atan2(raw[0][0] - cx, -(raw[0][1] - cy)) * 180) / Math.PI;
    const px = ((cx / 64) * B + B * pad) / C * 100, py = ((cy / 64) * B + B * pad) / C * 100;
    const mask = `conic-gradient(from ${start.toFixed(1)}deg at ${px.toFixed(1)}% ${py.toFixed(1)}%, transparent 0deg, transparent calc(360deg - var(--ink-a) - 10deg), #000 calc(360deg - var(--ink-a)), #000 360deg)`;
    canvas.style.setProperty('mask-image', mask);
    canvas.style.setProperty('-webkit-mask-image', mask);
    return { canvas, prop: '--ink-a', from: 0, to: 380, unit: 'deg', duration: 2200 };
  }

  function paintHills(host) {
    const W = host.clientWidth, H = host.clientHeight;
    if (W < 20 || H < 20) return null;
    const canvas = makeCanvas(host, W, H, 0, 0);
    setBrushScale(W / 300);
    const bg = host.dataset.inkBg || '#17140f', paper = host.dataset.inkColor || '#efe5cf';
    // same placement as the SVG's preserveAspectRatio="xMidYMax slice"
    const s = Math.max(W / 600, H / 400), ox = (W - 600 * s) / 2 - W / 2, oy = H - 400 * s - H / 2;
    const PALETTE = ['#efe5cf', '#c8a35a', '#d9442f', '#7fa08a']; // paper, gold, cinnabar, jade
    const N = 50, LINES = 10;
    [0.07, 0.12, 0.19].forEach((a, k) => {
      const base = sample(HILLS[k], N);
      const r = base.map(([x, y]) => [ox + x * s, oy + y * s]);
      // ink-wash body (pre-mixed: opacity on a transparent canvas reads as solid)
      brush.noStroke();
      brush.wash(mix(bg, paper, a), 255);
      brush.polygon([...r, [ox + 600 * s + 4, oy + 404 * s], [ox - 4, oy + 404 * s]]);
      brush.noWash();
      // dry-brush ridgeline
      brush.set('charcoal', mix(bg, paper, Math.min(1, a + 0.25)), 1.6);
      brush.spline(r.map(([x, y], i) => [x, y, 0.4 + 0.9 * Math.sin((i / N) * Math.PI)]), 0.5);
      // bundle of fine coloured lines following the ridge
      for (let j = 0; j < LINES; j++) {
        const strength = [0.9, 0.65, 0.8][j % 3];
        const off = (j + 1) * 2.4, phase = j * 1.7 + k;
        brush.set('rotring', mix(bg, PALETTE[(j + k) % PALETTE.length], strength), 0.45);
        brush.spline(base.map(([x, y], i) => {
          const u = i / N;
          return [ox + x * s, oy + (y + off + Math.sin(u * 9 + phase) * 4) * s, 0.5 + 0.6 * Math.sin(u * Math.PI)];
        }), 0.5);
      }
    });
    brush.render();
    const mask = 'linear-gradient(90deg, #000 calc(var(--ink-w) - 14%), transparent var(--ink-w))';
    canvas.style.setProperty('mask-image', mask);
    canvas.style.setProperty('-webkit-mask-image', mask);
    return { canvas, prop: '--ink-w', from: 0, to: 116, unit: '%', duration: 2600 };
  }

  const PAINTERS = { enso: paintEnso, hills: paintHills };

  /* ---------- paint, reveal, repaint on resize ---------- */
  function paint(host, animate) {
    host.querySelector(':scope > .ink-canvas')?.remove();
    const job = PAINTERS[host.dataset.ink]?.(host);
    if (!job) return;
    host.classList.add('inked');
    host._inkSize = `${host.clientWidth}x${host.clientHeight}`;
    const set = (v) => job.canvas.style.setProperty(job.prop, `${v}${job.unit}`);
    if (!animate || reduce || !window.anime) { set(job.to); return; }
    set(job.from);
    const state = { v: job.from };
    window.anime.animate(state, {
      v: job.to,
      duration: job.duration,
      delay: 150,
      ease: 'inOutSine',
      onUpdate: () => set(state.v),
    });
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      getLibs()
        .then(() => paint(e.target, true))
        .catch(() => { /* keep the SVG fallback */ });
    });
  }, { threshold: 0.35 });
  targets.forEach((t) => io.observe(t));

  let timer = 0;
  addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      targets.forEach((t) => {
        if (t.classList.contains('inked') && t._inkSize !== `${t.clientWidth}x${t.clientHeight}`) {
          try { paint(t, false); } catch (err) { /* keep what is on screen */ }
        }
      });
    }, 250);
  });
})();
