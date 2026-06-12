import gsap from 'gsap';

export function initDrawer({ lenis, scrollTo, reducedMotion }) {
  const drawer = document.querySelector('.drawer');
  const toggle = document.querySelector('.masthead__toggle');
  const scrim = document.querySelector('.scrim');
  const links = drawer.querySelectorAll('a[data-scrollto]');
  const html = document.documentElement;

  let isOpen = false;
  let tw = null;

  // Clear the CSS translateX (gsap reads it as a px offset) and own the
  // transform via xPercent from here on.
  gsap.set(drawer, { x: 0, xPercent: 104 });

  const open = () => {
    isOpen = true;
    tw?.kill();
    html.classList.add('drawer-open');
    drawer.style.visibility = 'visible';
    drawer.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    lenis?.stop();
    tw = gsap.to(drawer, { xPercent: 0, duration: reducedMotion ? 0 : 0.6, ease: 'power4.out' });
  };

  const close = (after) => {
    isOpen = false;
    tw?.kill();
    toggle.setAttribute('aria-expanded', 'false');
    tw = gsap.to(drawer, {
      xPercent: 104,
      duration: reducedMotion ? 0 : 0.45,
      ease: 'power3.in',
      onComplete: () => {
        html.classList.remove('drawer-open');
        drawer.style.visibility = 'hidden';
        drawer.setAttribute('aria-hidden', 'true');
        lenis?.start();
        after?.();
      },
    });
  };

  toggle.addEventListener('click', () => (isOpen ? close() : open()));
  scrim.addEventListener('click', () => isOpen && close());
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) close();
  });

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      close(() => scrollTo(link.getAttribute('href')));
    });
  });
}
