import gsap from 'gsap';
import { lerp } from './utils.js';

/*
 * Infinite marquees. The track holds N identical groups; we tween one
 * group-width and let repeat:-1 wrap seamlessly. Scroll velocity (from
 * Lenis) momentarily speeds the belt up.
 */
export function initMarquees({ lenis, reducedMotion }) {
  const items = [];

  document.querySelectorAll('[data-marquee], [data-marquee-slow]').forEach((el) => {
    const track = el.querySelector('.marquee__track');
    const group = track.children[0];

    const build = () => {
      while (track.children.length > 1) track.lastChild.remove();
      const copies = Math.max(2, Math.ceil((window.innerWidth * 2) / Math.max(group.offsetWidth, 1)));
      for (let i = 0; i < copies; i++) track.appendChild(group.cloneNode(true));
      if (reducedMotion) return;
      const w = group.getBoundingClientRect().width;
      const speed = el.hasAttribute('data-marquee-slow') ? 40 : 110; // px/s
      return gsap.fromTo(track, { x: 0 }, { x: -w, duration: w / speed, ease: 'none', repeat: -1 });
    };

    const item = { el, tween: build() };
    items.push(item);

    let lastW = window.innerWidth;
    window.addEventListener('resize', () => {
      if (Math.abs(window.innerWidth - lastW) < 120) return;
      lastW = window.innerWidth;
      item.tween?.kill();
      item.tween = build();
    });
  });

  if (reducedMotion || !items.length) return;

  // Scroll velocity → belt speed.
  let target = 1;
  let current = 1;
  lenis?.on('scroll', (e) => {
    target = 1 + Math.min(Math.abs(e.velocity) * 0.045, 2.6);
  });
  gsap.ticker.add(() => {
    target = lerp(target, 1, 0.045);
    current = lerp(current, target, 0.08);
    items.forEach((m) => m.tween?.timeScale(current));
  });
}
