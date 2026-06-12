import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function splitChars(el) {
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

/*
 * Hide what the title-screen intro animates and build the (paused)
 * timeline that the loading screen's iris wipe triggers.
 */
export function prepIntro() {
  const chars = gsap.utils.toArray('[data-title]').flatMap((line) => splitChars(line));

  gsap.set(chars, { yPercent: 115 });
  gsap.set('.hud', { autoAlpha: 0, y: -46 });
  gsap.set('[data-intro]', { autoAlpha: 0, y: 16 });
  gsap.set('.hero__sun', { autoAlpha: 0, scale: 0.4, transformOrigin: '50% 100%' });
  gsap.set('.hero__mtn--far', { autoAlpha: 0, yPercent: 26 });
  gsap.set('.hero__mtn--mid', { autoAlpha: 0, yPercent: 30 });
  gsap.set('.hero__mtn--near', { autoAlpha: 0, yPercent: 36 });
  gsap.set('.trail', { autoAlpha: 0 });
  gsap.set('.hero__ver', { autoAlpha: 0 });

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
  tl.to('.hero__sun', { autoAlpha: 0.9, scale: 1, duration: 0.6, ease: 'steps(5)' }, 0.05)
    .to('.hero__mtn--far', { autoAlpha: 1, yPercent: 0, duration: 0.7 }, 0.15)
    .to('.hero__mtn--mid', { autoAlpha: 1, yPercent: 0, duration: 0.7 }, 0.28)
    .to('.hero__mtn--near', { autoAlpha: 1, yPercent: 0, duration: 0.7 }, 0.41)
    .to(chars, { yPercent: 0, duration: 0.7, stagger: 0.035, ease: 'back.out(1.7)' }, 0.45)
    .to('[data-intro]', { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.12 }, 0.95)
    .to('.hud', { autoAlpha: 1, y: 0, duration: 0.5 }, 1.35)
    .to(['.trail', '.hero__ver'], { autoAlpha: 1, duration: 0.6 }, 1.5);

  return tl;
}

export function initScrollAnimations() {
  // generic reveals
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      autoAlpha: 0,
      y: 24,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  // title screen parallax: layers drift apart, sun sets early
  const heroScrub = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('.hero__sun', { y: 170, ease: 'none', scrollTrigger: heroScrub });
  gsap.to('.hero__mtn--far', { yPercent: 22, ease: 'none', scrollTrigger: heroScrub });
  gsap.to('.hero__mtn--mid', { yPercent: 12, ease: 'none', scrollTrigger: heroScrub });
  gsap.to('.hero__content', { yPercent: -10, autoAlpha: 0.25, ease: 'none', scrollTrigger: heroScrub });

  // character stat bars fill in chunky steps
  const stats = gsap.utils.toArray('[data-stat]');
  if (stats.length) {
    ScrollTrigger.create({
      trigger: '.char__stats',
      start: 'top 80%',
      once: true,
      onEnter: () => {
        stats.forEach((bar, i) => {
          gsap.to(bar, {
            width: `${bar.dataset.stat}%`,
            duration: 0.9,
            delay: i * 0.12,
            ease: 'steps(12)',
          });
        });
      },
    });
  }

  // skill tree nodes pop in branch by branch
  gsap.utils.toArray('[data-branch]').forEach((branch) => {
    gsap.from(branch.querySelectorAll('.node'), {
      autoAlpha: 0,
      x: -14,
      duration: 0.45,
      stagger: 0.09,
      ease: 'steps(4)',
      scrollTrigger: { trigger: branch, start: 'top 82%', once: true },
    });
  });
}
