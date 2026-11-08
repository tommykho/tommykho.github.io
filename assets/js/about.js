/* About · Tommy Ho — theme, reveals, callouts, cursor readout (vanilla) */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* Theme: blueprint (dark, default) <-> paper (light), remembered */
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('th-theme', next); } catch (e) {}
  });

  /* Reveal on scroll, staggered within each group */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal]').forEach((el) => {
    const sibs = [...el.parentElement.children].filter((c) => c.hasAttribute('data-reveal'));
    el.style.transitionDelay = `${Math.min(sibs.indexOf(el), 6) * 70}ms`;
    io.observe(el);
  });

  /* Callout balloons <-> legend, linked both ways */
  const balloons = $$('.balloon');
  const items = $$('.legend li');
  const mark = (n) => {
    balloons.forEach((b) => b.classList.toggle('on', b.dataset.n === n));
    items.forEach((li) => li.classList.toggle('on', li.dataset.n === n));
  };
  [...balloons, ...items].forEach((el) => {
    el.addEventListener('pointerenter', () => mark(el.dataset.n));
    el.addEventListener('pointerleave', () => mark(null));
    el.addEventListener('focus', () => mark(el.dataset.n));
    el.addEventListener('blur', () => mark(null));
  });
  balloons.forEach((b) => b.addEventListener('click', () => mark(b.classList.contains('on') ? null : b.dataset.n)));

  /* CAD-style cursor readout */
  const coords = document.getElementById('coords');
  if (coords && !reduce && matchMedia('(hover: hover)').matches) {
    const [x, y] = coords.querySelectorAll('span');
    let raf = 0;
    addEventListener('pointermove', (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        x.textContent = (e.clientX / 2).toFixed(1).padStart(6, '0');
        y.textContent = ((e.clientY + scrollY) / 2).toFixed(1).padStart(6, '0');
      });
    }, { passive: true });
  }

  /* Hide the top bar while scrolling down */
  const bar = document.getElementById('topbar');
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    if (y > lastY + 4 && y > innerHeight * 0.6) bar.classList.add('is-hidden');
    else if (y < lastY - 4) bar.classList.remove('is-hidden');
    lastY = y;
  }, { passive: true });
})();
