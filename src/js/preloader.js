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
 * Loading screen: a chunky segmented bar paced by real load state,
 * then an iris wipe into the title screen. `onReveal` fires as the
 * iris starts closing over the loader.
 */
export async function runPreloader({ reducedMotion, onReveal }) {
  const el = document.querySelector('.preloader');
  const bar = el.querySelector('[data-loadbar]');
  const pct = el.querySelector('[data-load-pct]');
  const label = el.querySelector('.preloader__label');
  const ready = assetsReady();

  if (reducedMotion) {
    await ready;
    bar.style.width = '100%';
    pct.textContent = '100';
    onReveal?.();
    await gsap.to(el, { autoAlpha: 0, duration: 0.3 });
    el.remove();
    return;
  }

  gsap.set(el, { clipPath: 'circle(120% at 50% 50%)' });

  const state = { v: 0 };
  const render = () => {
    bar.style.width = `${state.v}%`;
    pct.textContent = String(Math.round(state.v));
  };

  await gsap.to(state, { v: 72, duration: 1.3, ease: 'steps(14)', onUpdate: render });
  await ready;
  await gsap.to(state, { v: 100, duration: 0.4, ease: 'steps(6)', onUpdate: render });
  label.innerHTML = 'World loaded — <b>press start</b>';
  await gsap.to({}, { duration: 0.45 });

  onReveal?.();
  await gsap.to(el, { clipPath: 'circle(0% at 50% 50%)', duration: 0.75, ease: 'power3.inOut' });
  el.remove();
}
