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
 * The issue gets stamped before it ships: masthead fades up, the red
 * roundel slams in with a paper recoil, then the page wipes in
 * sideways. `onReveal` fires as the wipe starts.
 */
export async function runPreloader({ reducedMotion, onReveal }) {
  const el = document.querySelector('.preloader');
  const ready = assetsReady();

  if (reducedMotion) {
    await ready;
    onReveal?.();
    await gsap.to(el, { autoAlpha: 0, duration: 0.3 });
    el.remove();
    return;
  }

  gsap.set(el, { clipPath: 'inset(0 0% 0 0)' });

  const tl = gsap.timeline();
  tl.from('.preloader__over', { autoAlpha: 0, y: -10, duration: 0.5, ease: 'power2.out' }, 0.05);
  tl.from('.preloader__title', { autoAlpha: 0, y: 18, duration: 0.65, ease: 'power3.out' }, 0.15);
  tl.from('.preloader__sub', { autoAlpha: 0, duration: 0.5, ease: 'none' }, 0.4);
  tl.fromTo(
    '.preloader__stamp',
    { scale: 3.2, autoAlpha: 0, rotation: 12 },
    { scale: 1, autoAlpha: 1, rotation: -14, duration: 0.34, ease: 'power4.in' },
    0.8
  );
  tl.to('.preloader__inner', { y: 6, duration: 0.07, ease: 'power1.in' }, '>-0.04');
  tl.to('.preloader__inner', { y: 0, duration: 0.45, ease: 'elastic.out(1.4, 0.5)' });
  await tl;
  await ready;
  await gsap.to({}, { duration: 0.2 }); // a beat, ink drying

  onReveal?.();
  await gsap.to(el, { clipPath: 'inset(0 100% 0 0)', duration: 0.8, ease: 'power4.inOut' });
  el.remove();
}
