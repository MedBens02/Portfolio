import gsap from 'gsap';
import { lerp, clamp } from './utils.js';

/*
 * The journey, literally: a small pixel adventurer walks along the
 * bottom of the screen from the start of the page to the flag at the
 * end. Scroll progress is his position; he flips to face the way
 * you're scrolling and idles when you stop.
 */
export function initWalker({ reducedMotion } = {}) {
  const walker = document.querySelector('[data-walker]');
  if (!walker) return;
  const svg = walker.querySelector('svg');
  const frameA = walker.querySelector('[data-frame="a"]');
  const frameB = walker.querySelector('[data-frame="b"]');
  const flag = document.querySelector('.trail__flag');

  let x = 16;
  let dir = 1;
  let frameT = 0;
  let stepB = false;

  const span = () => {
    const start = 14;
    const end = (flag ? flag.getBoundingClientRect().left : window.innerWidth - 40) - 34;
    return { start, end: Math.max(end, start + 40) };
  };

  const progress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
  };

  if (reducedMotion) {
    const place = () => {
      const { start, end } = span();
      gsap.set(walker, { x: start + progress() * (end - start) });
    };
    place();
    window.addEventListener('scroll', place, { passive: true });
    window.addEventListener('resize', place);
    return;
  }

  gsap.ticker.add((_, deltaMS) => {
    const dt = Math.min(deltaMS, 50) / 1000;
    const { start, end } = span();
    const target = start + progress() * (end - start);
    const prev = x;
    x = lerp(x, target, 0.085);
    const dx = x - prev;
    const moving = Math.abs(dx) > 0.12;

    if (moving) {
      dir = dx >= 0 ? 1 : -1;
      frameT += dt;
      if (frameT > 0.13) {
        frameT = 0;
        stepB = !stepB;
      }
    } else {
      stepB = false;
    }
    frameA.style.display = stepB ? 'none' : '';
    frameB.style.display = stepB ? '' : 'none';
    svg.style.transform = `scaleX(${dir})`;
    gsap.set(walker, { x });
  });
}
