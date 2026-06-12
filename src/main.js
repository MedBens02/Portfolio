import '@fontsource-variable/fraunces/full.css';
import '@fontsource-variable/fraunces/full-italic.css';
import '@fontsource-variable/archivo';
import '@fontsource/space-mono/400.css';
import './styles/main.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

import { reducedMotion } from './js/utils.js';
import { initContours } from './js/contours.js';
import { runPreloader } from './js/preloader.js';
import { initDrawer } from './js/drawer.js';
import { initProgress } from './js/progress.js';
import { initFitText } from './js/fit.js';
import { prepIntro, initScrollAnimations } from './js/animations.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

// Always open the issue at the cover.
history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// --- Smooth scroll -------------------------------------------------
let lenis = null;
if (!reducedMotion) {
  lenis = new Lenis({
    duration: 1.05,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop(); // locked while the issue is being stamped
}

const scrollTo = (target) => {
  if (lenis) {
    lenis.scrollTo(target === '#top' ? 0 : target, {
      offset: -70, // clear the fixed masthead
      duration: 1.3,
      easing: (t) => 1 - Math.pow(1 - t, 4),
    });
  } else if (target === '#top') {
    window.scrollTo({ top: 0 });
  } else {
    document.querySelector(target)?.scrollIntoView();
  }
};

document.querySelectorAll('[data-scrollto]').forEach((el) => {
  // drawer links manage their own close-then-scroll sequence
  if (el.closest('.drawer')) return;
  el.addEventListener('click', (e) => {
    e.preventDefault();
    scrollTo(el.dataset.scrollto || el.getAttribute('href'));
  });
});

// --- Modules --------------------------------------------------------
initContours(document.querySelector('.cover__contours'), { reducedMotion });
initProgress();
initDrawer({ lenis, scrollTo, reducedMotion });

const intro = reducedMotion ? null : prepIntro();

runPreloader({
  reducedMotion,
  onReveal: () => {
    initFitText(); // fonts are loaded by now — size the display lockups
    lenis?.start();
    intro?.play();
  },
}).then(() => {
  if (!reducedMotion) initScrollAnimations();
  ScrollTrigger.refresh();
});

// eslint-disable-next-line no-console
console.info(
  '%c THE INDEX — Issue Nº 01 %c set in Fraunces · no templates were harmed ',
  'background:#c93a14;color:#f4f0e6;padding:6px 0 6px 10px;font-weight:bold;',
  'background:#211d15;color:#f4f0e6;padding:6px 10px 6px 6px;'
);

// Exposed for visual QA tooling.
window.__app = { lenis, gsap, ScrollTrigger };
