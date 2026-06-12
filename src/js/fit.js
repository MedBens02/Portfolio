import { ScrollTrigger } from 'gsap/ScrollTrigger';

/*
 * Fit-to-width lockup: scales each [data-fit] element so its single line
 * exactly spans its parent. Syne ExtraBold is a very extended face, so
 * vw-based sizes can't guarantee a fit — this can. Width scales linearly
 * with font-size (em-based tracking included), so one pass is exact.
 */
export function initFitText() {
  const els = Array.from(document.querySelectorAll('[data-fit]'));
  if (!els.length) return;

  const fit = () => {
    els.forEach((el) => {
      el.style.fontSize = '100px';
      const w = el.getBoundingClientRect().width;
      const avail = el.parentElement.clientWidth;
      if (w <= 0 || avail <= 0) return;
      let size = (100 * avail * 0.995) / w;
      // optional cap in vh units so very wide viewports stay balanced
      const cap = parseFloat(el.dataset.fitCap);
      if (cap) size = Math.min(size, (window.innerHeight * cap) / 100);
      el.style.fontSize = `${size}px`;
    });
  };

  fit();

  let t;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      fit();
      ScrollTrigger.refresh();
    }, 150);
  });
}
