import gsap from 'gsap';
import { finePointer } from './utils.js';

export function initMagnetic() {
  if (!finePointer) return;

  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const strength = 0.35;

    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, {
        x: (e.clientX - (r.left + r.width / 2)) * strength,
        y: (e.clientY - (r.top + r.height / 2)) * strength,
        duration: 0.6,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    });

    el.addEventListener('pointerleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1.1, 0.4)', overwrite: 'auto' });
    });
  });
}
