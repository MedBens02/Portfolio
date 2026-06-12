import '@fontsource/chakra-petch/500.css';
import '@fontsource/chakra-petch/600.css';
import '@fontsource/chakra-petch/700.css';
import '@fontsource/silkscreen';
import '@fontsource-variable/outfit';
import './styles/main.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { reducedMotion } from './js/utils.js';
import { initSky } from './js/sky.js';
import { initWalker } from './js/walker.js';
import { initHud } from './js/hud.js';
import { initDialogue } from './js/dialogue.js';
import { initAchievements } from './js/achievements.js';
import { initFitText } from './js/fit.js';
import { runPreloader } from './js/preloader.js';
import { prepIntro, initScrollAnimations } from './js/animations.js';

gsap.registerPlugin(ScrollTrigger);

// New game always starts at the title screen.
history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// --- Smooth scroll -------------------------------------------------
let lenis = null;
if (!reducedMotion) {
  lenis = new Lenis({
    duration: 1.0,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop(); // locked on the loading screen
}

const scrollTo = (target) => {
  if (lenis) {
    lenis.scrollTo(target === '#top' ? 0 : target, {
      offset: -56, // clear the HUD
      duration: 1.25,
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
    scrollTo(el.dataset.scrollto || el.getAttribute('href'));
  });
});

// --- Modules --------------------------------------------------------
initSky(document.querySelector('.stars'), { reducedMotion });
initHud();
initWalker({ reducedMotion });
initDialogue({ reducedMotion });
initAchievements({ reducedMotion });

const intro = reducedMotion ? null : prepIntro();

runPreloader({
  reducedMotion,
  onReveal: () => {
    initFitText(); // fonts loaded — size the title lockup
    lenis?.start();
    intro?.play();
  },
}).then(() => {
  if (!reducedMotion) initScrollAnimations();
  ScrollTrigger.refresh();
});

// eslint-disable-next-line no-console
console.info(
  '%c PRESS START %c psst… ↑↑↓↓←→←→BA works. — MB, junior dev, open to quests ',
  'background:#ffb454;color:#262b45;padding:6px 8px;font-weight:bold;',
  'background:#262b45;color:#e9ecf8;padding:6px 8px;'
);

// Exposed for visual QA tooling.
window.__app = { lenis, gsap, ScrollTrigger };
