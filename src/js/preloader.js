import gsap from 'gsap';

const assetsReady = () =>
  Promise.race([
    Promise.all([
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise((res) => window.addEventListener('load', res, { once: true })),
      document.fonts ? document.fonts.ready : Promise.resolve(),
    ]),
    new Promise((res) => setTimeout(res, 3500)),
  ]);

/*
 * Counts to 100 (pacing tied to real load state), then lifts the curtain.
 * `onReveal` fires the moment the curtain starts moving so the hero
 * intro can overlap with it.
 */
export async function runPreloader({ reducedMotion, onReveal }) {
  const el = document.querySelector('.preloader');
  const counter = el.querySelector('[data-counter]');
  const ready = assetsReady();

  if (reducedMotion) {
    await ready;
    counter.textContent = '100';
    onReveal?.();
    await gsap.to(el, { autoAlpha: 0, duration: 0.3 });
    el.remove();
    return;
  }

  const state = { v: 0 };
  const render = () => {
    counter.textContent = String(Math.round(state.v)).padStart(3, '0');
  };

  await gsap.to(state, { v: 82, duration: 1.5, ease: 'power2.inOut', onUpdate: render });
  await ready;
  await gsap.to(state, { v: 100, duration: 0.4, ease: 'power1.in', onUpdate: render });

  const out = gsap.timeline();
  out.to('.preloader__center, .preloader__foot', {
    yPercent: -60,
    autoAlpha: 0,
    duration: 0.45,
    ease: 'power2.in',
  });
  out.add(() => onReveal?.(), '-=0.1');
  out.to(el, { clipPath: 'inset(0 0 100% 0)', duration: 0.85, ease: 'power4.inOut' });
  await out;
  el.remove();
}
