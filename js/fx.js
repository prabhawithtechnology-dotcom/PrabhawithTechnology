// Visual effects only (no Firebase). Safe if it fails: content stays visible.
(() => {
  const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pg = document.querySelector('.pg');
  const upd = () => { const h = document.documentElement; pg.style.transform = `scaleX(${(h.scrollTop / ((h.scrollHeight - h.clientHeight) || 1)).toFixed(3)})`; };
  addEventListener('scroll', upd, { passive: true }); upd();
  if (!rm && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
    document.querySelectorAll('.svc,.dark .card,.steps,.step,#team .card,#faq details,#contact form,#work h2,#reviews h2').forEach((el, i) => { el.classList.add('rv'); el.style.transitionDelay = (i % 4) * 80 + 'ms'; io.observe(el); });
    document.querySelectorAll('#team .card').forEach(c => { c.classList.add('tilt');
      c.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; const r = c.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`; });
      c.addEventListener('pointerleave', () => c.style.transform = ''); });
  }
})();
