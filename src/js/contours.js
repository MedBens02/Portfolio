import gsap from 'gsap';
import { createNoise3D } from 'simplex-noise';

/*
 * Cover backdrop: drifting topographic contour lines drawn on a 2D
 * canvas — ink on paper, one line picked out in vermilion. Pauses when
 * the cover scrolls away; renders a single static frame under
 * prefers-reduced-motion.
 */
export function initContours(canvas, { reducedMotion } = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const noise3D = createNoise3D();
  const section = canvas.parentElement;
  let w = 0;
  let h = 0;
  let t = 0;
  let inView = true;

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    const rows = w < 768 ? 12 : 17;
    const redRow = Math.floor(rows * 0.62);
    const amp = Math.min(46, h * 0.055);
    const step = 9;
    for (let r = 0; r < rows; r++) {
      const baseY = ((r + 0.6) * h) / (rows + 0.4);
      ctx.beginPath();
      for (let x = 0; x <= w + step; x += step) {
        const y = baseY + noise3D(x * 0.0014, r * 0.42, t) * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      if (r === redRow) {
        ctx.strokeStyle = 'rgba(201, 58, 20, 0.35)';
        ctx.lineWidth = 1.2;
      } else {
        ctx.strokeStyle = 'rgba(33, 29, 21, 0.09)';
        ctx.lineWidth = 1;
      }
      ctx.stroke();
    }
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = section.clientWidth;
    h = section.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  };

  resize();
  window.addEventListener('resize', resize);

  if (reducedMotion) {
    t = 2.4;
    draw();
    return;
  }

  const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting));
  io.observe(section);

  gsap.ticker.add((_, deltaMS) => {
    if (!inView || document.hidden) return;
    t += (Math.min(deltaMS, 50) / 1000) * 0.12;
    draw();
  });
}
