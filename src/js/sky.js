import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/*
 * The world clock: scrolling moves time. The fixed sky gradient is
 * scrubbed dusk → night → dawn via CSS variables, and a canvas of
 * pixel stars twinkles hardest at midnight (the middle of the page).
 */

const DUSK = { a: '#4d5378', b: '#8e6a80', stars: 0.55 };
const NIGHT = { a: '#30365a', b: '#4d5378', stars: 1 };
const DAWN = { a: '#3f4a74', b: '#c08a6a', stars: 0.15 };

export function initSky(canvas, { reducedMotion } = {}) {
  // gradient scrub across the whole page
  if (!reducedMotion) {
    const tl = gsap.timeline({
      scrollTrigger: { start: 0, end: 'max', scrub: 0.6, invalidateOnRefresh: true },
    });
    tl.to('.sky', { '--sky-a': NIGHT.a, '--sky-b': NIGHT.b, ease: 'none', duration: 0.45 });
    tl.to('.sky', { '--sky-a': DAWN.a, '--sky-b': DAWN.b, ease: 'none', duration: 0.55 });
  }

  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let w = 0;
  let h = 0;
  let stars = [];
  let meteor = null;
  let nextMeteor = 5;
  let t = 0;

  const seed = () => {
    const count = Math.round((w * h) / 11000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h * 0.8,
      s: Math.random() < 0.82 ? 2 : 3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.6,
      base: 0.35 + Math.random() * 0.65,
    }));
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
    if (reducedMotion) draw(0.6);
  };

  // page progress → star intensity (dusk .55 / night 1 / dawn .15)
  const intensity = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    return p < 0.45
      ? DUSK.stars + (NIGHT.stars - DUSK.stars) * (p / 0.45)
      : NIGHT.stars + (DAWN.stars - NIGHT.stars) * ((p - 0.45) / 0.55);
  };

  const draw = (glow) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#e9ecf8';
    for (const s of stars) {
      const tw = reducedMotion ? 1 : 0.55 + 0.45 * Math.sin(t * s.speed + s.phase);
      ctx.globalAlpha = s.base * tw * glow;
      ctx.fillRect(s.x, s.y, s.s, s.s);
    }
    if (meteor) {
      const k = meteor.life / 0.7;
      ctx.globalAlpha = Math.max(0, 1 - k) * glow;
      ctx.fillStyle = '#ffd9a0';
      const mx = meteor.x + meteor.vx * meteor.life;
      const my = meteor.y + meteor.vy * meteor.life;
      for (let i = 0; i < 7; i++) ctx.fillRect(mx - i * 6, my - i * 3, 3 - i * 0.3, 2);
      ctx.fillStyle = '#e9ecf8';
    }
    ctx.globalAlpha = 1;
  };

  resize();
  window.addEventListener('resize', resize);
  if (reducedMotion) return;

  gsap.ticker.add((_, deltaMS) => {
    if (document.hidden) return;
    const dt = Math.min(deltaMS, 50) / 1000;
    t += dt;
    const glow = intensity();

    nextMeteor -= dt;
    if (meteor) {
      meteor.life += dt;
      if (meteor.life > 0.7) meteor = null;
    } else if (nextMeteor <= 0 && glow > 0.5) {
      nextMeteor = 6 + Math.random() * 7;
      meteor = {
        x: w * (0.25 + Math.random() * 0.6),
        y: h * (0.05 + Math.random() * 0.25),
        vx: 320,
        vy: 160,
        life: 0,
      };
    }
    draw(glow);
  });
}
