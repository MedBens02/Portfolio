import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { splitKinetic, initKinetic } from './kinetic.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

/*
 * Hide everything the cover intro animates, and build the (paused)
 * timeline the preloader wipe triggers. The preloader covers the page
 * while initial states are set.
 */
export function prepIntro() {
  const kineticEl = document.querySelector('[data-kinetic]');
  const chars = splitKinetic(kineticEl);

  gsap.set(chars, { yPercent: 112 });
  gsap.set('.masthead', { autoAlpha: 0, y: -12 });
  gsap.set(['.cover__date', '.cover__kicker', '.cover__deck', '.cover__hint'], { autoAlpha: 0, y: 14 });
  gsap.set('.cover__ital', { autoAlpha: 0, x: 30 });
  gsap.set('.toc', { autoAlpha: 0, y: 22 });
  gsap.set('.cover__stamp', { autoAlpha: 0, scale: 1.5, rotation: 14 });
  gsap.set('.cover__contours', { autoAlpha: 0 });

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
  tl.to('.cover__contours', { autoAlpha: 1, duration: 1.8, ease: 'power2.inOut' }, 0)
    .to('.masthead', { autoAlpha: 1, y: 0, duration: 0.7 }, 0.1)
    .to('.cover__date', { autoAlpha: 1, y: 0, duration: 0.7 }, 0.18)
    .to('.cover__kicker', { autoAlpha: 1, y: 0, duration: 0.7 }, 0.3)
    .to(chars, { yPercent: 0, duration: 1.05, stagger: 0.045, ease: 'expo.out' }, 0.35)
    .to('.cover__ital', { autoAlpha: 1, x: 0, duration: 0.8 }, 0.95)
    .to('.cover__deck', { autoAlpha: 1, y: 0, duration: 0.8 }, 1.05)
    .to('.toc', { autoAlpha: 1, y: 0, duration: 0.8 }, 1.15)
    .to('.cover__stamp', { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(2.2)' }, 1.25)
    .set('.cover__stamp', { clearProps: 'opacity,visibility' }) // restore CSS opacity
    .to('.cover__hint', { autoAlpha: 1, y: 0, duration: 0.6 }, 1.45);

  tl.add(() => initKinetic(kineticEl, chars));
  return tl;
}

export function initScrollAnimations() {
  // Generic fade-up reveals
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      autoAlpha: 0,
      y: 26,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  // Chapter heads: masked title lines + ghost numeral sliding in
  document.querySelectorAll('.ch-head').forEach((head) => {
    const split = new SplitText(head.querySelector('.ch-head__title'), { type: 'lines', mask: 'lines' });
    const tl = gsap.timeline({
      scrollTrigger: { trigger: head, start: 'top 86%', once: true },
      onComplete: () => split.revert(),
    });
    tl.from(split.lines, { yPercent: 115, duration: 0.9, stagger: 0.08, ease: 'power4.out' });
    const no = head.querySelector('.ch-head__no');
    if (no) tl.from(no, { autoAlpha: 0, x: 46, duration: 0.9, ease: 'power3.out' }, 0.1);
    const note = head.querySelector('.ch-head__note');
    if (note) tl.from(note, { autoAlpha: 0, duration: 0.6, ease: 'none' }, 0.35);
  });

  // Pull quote: masked line reveal
  const quote = document.querySelector('[data-quote]');
  if (quote) {
    const split = new SplitText(quote, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 110,
      duration: 0.95,
      stagger: 0.09,
      ease: 'power4.out',
      scrollTrigger: { trigger: quote, start: 'top 82%', once: true },
      onComplete: () => split.revert(),
    });
  }

  // Correspondence headline
  gsap.from('.post__bigin', {
    yPercent: 120,
    duration: 1.05,
    ease: 'expo.out',
    scrollTrigger: { trigger: '.post__titlerow', start: 'top 78%', once: true },
  });

  // Cover parallax: the word drifts up, the stamp rolls away
  gsap.to('.cover__main', {
    yPercent: -9,
    ease: 'none',
    scrollTrigger: { trigger: '.cover', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.cover__stamp', {
    rotation: 120,
    ease: 'none',
    scrollTrigger: { trigger: '.cover', start: 'top top', end: 'bottom top', scrub: 0.5 },
  });

  initWorksShelf();
}

/*
 * Selected Works: on desktop (and only when motion is welcome) the
 * section pins and the shelf of plates slides horizontally; the foot
 * counter tracks the visible plate. Elsewhere the plates stack and the
 * counter follows vertical scroll.
 */
function initWorksShelf() {
  const track = document.querySelector('.works__track');
  const plates = gsap.utils.toArray('.plate');
  const counter = document.querySelector('[data-plate]');
  if (!track || !plates.length) return;
  const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

  const mm = gsap.matchMedia();

  mm.add('(min-width: 64em) and (prefers-reduced-motion: no-preference)', () => {
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const tween = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: '.works',
        start: 'top top',
        end: () => '+=' + (dist() + window.innerHeight * 0.2),
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const idx = Math.min(plates.length - 1, Math.floor(self.progress * plates.length));
          counter.textContent = NUMERALS[idx];
        },
      },
    });

    // plate artwork pans gently as it crosses the viewport
    plates.forEach((plate) => {
      gsap.fromTo(
        plate.querySelector('img'),
        { xPercent: -6 },
        {
          xPercent: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: plate,
            containerAnimation: tween,
            start: 'left right',
            end: 'right left',
            scrub: true,
          },
        }
      );
    });
  });

  mm.add('(max-width: 63.99em), (prefers-reduced-motion: reduce)', () => {
    plates.forEach((plate, i) => {
      ScrollTrigger.create({
        trigger: plate,
        start: 'top 60%',
        end: 'bottom 60%',
        onToggle: (self) => {
          if (self.isActive) counter.textContent = NUMERALS[i];
        },
      });
    });
  });
}
