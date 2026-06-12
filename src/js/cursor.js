import gsap from 'gsap';

export function initCursor() {
  const root = document.querySelector('.cursor');
  if (!root) return;
  document.documentElement.classList.add('has-cursor');

  const dot = root.querySelector('.cursor__dot');
  const ring = root.querySelector('.cursor__ring');

  gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -100, y: -100 });

  const dotX = gsap.quickTo(dot, 'x', { duration: 0.06, ease: 'power2.out' });
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.06, ease: 'power2.out' });
  const ringX = gsap.quickTo(ring, 'x', { duration: 0.4, ease: 'power3.out' });
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.4, ease: 'power3.out' });

  window.addEventListener(
    'pointermove',
    (e) => {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    },
    { passive: true }
  );

  // Hover states via delegation so dynamically-built elements work too.
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('.work-row')) {
      root.classList.add('is-view');
    } else if (e.target.closest('a, button, [data-magnetic]')) {
      root.classList.add('is-link');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('.work-row')) root.classList.remove('is-view');
    if (e.target.closest('a, button, [data-magnetic]')) root.classList.remove('is-link');
  });

  window.addEventListener('pointerdown', () => gsap.to(ring, { scale: 0.78, duration: 0.25 }));
  window.addEventListener('pointerup', () => gsap.to(ring, { scale: 1, duration: 0.4, ease: 'power3.out' }));

  document.documentElement.addEventListener('mouseleave', () => gsap.to(root, { autoAlpha: 0, duration: 0.25 }));
  document.documentElement.addEventListener('mouseenter', () => gsap.to(root, { autoAlpha: 1, duration: 0.25 }));
}
