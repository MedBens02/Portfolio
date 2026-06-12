import gsap from 'gsap';
import { lerp, finePointer, reducedMotion } from './utils.js';

/*
 * The cover word is set in Fraunces — a variable font with weight and
 * optical-size axes. Each glyph swells toward the cursor (or breathes
 * in a slow wave on touch devices), like ink responding to pressure.
 */

export function splitKinetic(el) {
  const text = el.textContent;
  el.textContent = '';
  el.setAttribute('aria-label', text);
  return [...text].map((ch) => {
    const s = document.createElement('span');
    s.className = 'k-char';
    s.textContent = ch;
    s.setAttribute('aria-hidden', 'true');
    el.appendChild(s);
    return s;
  });
}

export function initKinetic(el, chars) {
  if (reducedMotion || !el || !chars.length) return;

  const states = chars.map(() => ({ p: 0 }));
  let mx = -1e4;
  let my = -1e4;
  let time = 0;

  if (finePointer) {
    window.addEventListener(
      'pointermove',
      (e) => {
        mx = e.clientX;
        my = e.clientY;
      },
      { passive: true }
    );
  }

  gsap.ticker.add((_, deltaMS) => {
    time += deltaMS / 1000;
    const rect = el.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    chars.forEach((c, i) => {
      let target;
      if (finePointer) {
        const r = c.getBoundingClientRect();
        const d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2));
        target = Math.max(0, 1 - d / 380);
      } else {
        target = (0.5 + 0.5 * Math.sin(time * 1.5 - i * 0.6)) * 0.55;
      }
      const s = states[i];
      s.p = lerp(s.p, target, 0.11);
      const wght = 470 + s.p * 230;
      const opsz = 90 + s.p * 54;
      c.style.fontVariationSettings = `'opsz' ${opsz.toFixed(1)}, 'wght' ${wght.toFixed(1)}, 'SOFT' 0, 'WONK' 1`;
    });
  });
}
