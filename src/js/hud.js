import gsap from 'gsap';
import { clamp } from './utils.js';

/*
 * Game HUD: scroll progress is XP (segmented bar + percent), the
 * current section is the AREA, and [data-clock] elements tick in
 * Casablanca time. Live DOM rects keep the area spy honest.
 */
export function initHud() {
  const bar = document.querySelector('[data-xpbar]');
  const xpEl = document.querySelector('[data-xp]');
  const areaEl = document.querySelector('[data-area]');
  const zones = gsap.utils.toArray('[data-area-name]');

  const SEGS = 20;
  const segs = Array.from({ length: SEGS }, () => {
    const i = document.createElement('i');
    bar.appendChild(i);
    return i;
  });

  let lastFill = -1;
  let lastPct = -1;
  let currentZone = null;

  gsap.ticker.add(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;

    const pct = Math.round(p * 100);
    if (pct !== lastPct) {
      lastPct = pct;
      xpEl.textContent = String(pct);
    }
    const fill = Math.round(p * SEGS);
    if (fill !== lastFill) {
      lastFill = fill;
      segs.forEach((s, i) => s.classList.toggle('on', i < fill));
    }

    const center = window.innerHeight * 0.5;
    let active = zones[0];
    for (const z of zones) {
      if (z.getBoundingClientRect().top <= center) active = z;
      else break;
    }
    if (active !== currentZone) {
      currentZone = active;
      areaEl.textContent = active.dataset.areaName;
    }
  });

  const clocks = document.querySelectorAll('[data-clock]');
  if (clocks.length) {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Casablanca',
    });
    const tick = () => clocks.forEach((n) => (n.textContent = fmt.format(new Date())));
    tick();
    setInterval(tick, 20000);
  }
}
