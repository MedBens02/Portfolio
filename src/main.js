import '@fontsource-variable/syne';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/jetbrains-mono';
import './styles/main.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import Lenis from 'lenis';

import { reducedMotion, finePointer } from './js/utils.js';
import { initGL } from './js/gl.js';
import { runPreloader } from './js/preloader.js';
import { initCursor } from './js/cursor.js';
import { initMenu } from './js/menu.js';
import { initMarquees } from './js/marquee.js';
import { initMagnetic } from './js/magnetic.js';
import { initStatusbar } from './js/statusbar.js';
import { initFitText } from './js/fit.js';
import { prepIntro, initScrollAnimations } from './js/animations.js';

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);

// Always start at the top — the preloader/intro assumes it.
history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// --- Smooth scroll -------------------------------------------------
let lenis = null;
if (!reducedMotion) {
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop(); // locked while the preloader runs
}

const scrollTo = (target) => {
  if (lenis) {
    lenis.scrollTo(target === '#top' ? 0 : target, {
      duration: 1.4,
      easing: (t) => 1 - Math.pow(1 - t, 4),
    });
  } else if (target === '#top') {
    window.scrollTo({ top: 0 });
  } else {
    document.querySelector(target)?.scrollIntoView();
  }
};

document.querySelectorAll('[data-scrollto]').forEach((el) => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    scrollTo(el.dataset.scrollto);
  });
});

// --- Modules --------------------------------------------------------
const glApi = initGL(document.querySelector('[data-gl]'), { reducedMotion });
if (lenis) lenis.on('scroll', (e) => glApi.setBoost(Math.min(Math.abs(e.velocity) / 60, 1)));

if (finePointer && !reducedMotion) initCursor();
initStatusbar({ lenis });
initMenu({ lenis, scrollTo, reducedMotion });

const intro = reducedMotion ? null : prepIntro();

runPreloader({
  reducedMotion,
  onReveal: () => {
    initFitText(); // fonts are loaded by now — size the display lockups
    lenis?.start();
    intro?.play();
  },
}).then(() => {
  if (!reducedMotion) initScrollAnimations({ glApi });
  initMarquees({ lenis, reducedMotion });
  initMagnetic();
  ScrollTrigger.refresh();
});

// eslint-disable-next-line no-console
console.info(
  '%c MB © 2026 — designed & built from scratch. Vite · GSAP · Three.js ',
  'background:#c9f73a;color:#0e0f0c;padding:6px 10px;border-radius:4px;font-weight:bold;'
);

// Exposed for visual QA tooling.
window.__app = { lenis, gsap, ScrollTrigger };
