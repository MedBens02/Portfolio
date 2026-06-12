import gsap from 'gsap';

export function initMenu({ lenis, scrollTo, reducedMotion }) {
  const menu = document.querySelector('.menu');
  const burger = document.querySelector('.burger');
  const links = gsap.utils.toArray('.menu__link');
  const foot = document.querySelector('.menu__foot');
  const html = document.documentElement;

  let isOpen = false;
  let tl = null;

  gsap.set(menu, { clipPath: 'inset(0 0 100% 0)' });

  const open = () => {
    isOpen = true;
    tl?.kill();
    html.classList.add('menu-open');
    menu.style.visibility = 'visible';
    menu.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    lenis?.stop();

    if (reducedMotion) {
      gsap.set(menu, { clipPath: 'inset(0 0 0% 0)' });
      gsap.set([links, foot], { clearProps: 'all' });
      return;
    }
    tl = gsap.timeline();
    tl.to(menu, { clipPath: 'inset(0 0 0% 0)', duration: 0.75, ease: 'power4.inOut' });
    tl.fromTo(
      links,
      { yPercent: 130, rotate: 5, autoAlpha: 1 },
      { yPercent: 0, rotate: 0, duration: 0.9, stagger: 0.07, ease: 'power4.out' },
      '-=0.3'
    );
    tl.fromTo(foot, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.55');
  };

  const close = (after) => {
    isOpen = false;
    tl?.kill();
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');

    const finish = () => {
      html.classList.remove('menu-open');
      menu.style.visibility = 'hidden';
      menu.setAttribute('aria-hidden', 'true');
      lenis?.start();
      after?.();
    };

    if (reducedMotion) {
      gsap.set(menu, { clipPath: 'inset(0 0 100% 0)' });
      finish();
      return;
    }
    tl = gsap.timeline({ onComplete: finish });
    tl.to([foot, ...links], { autoAlpha: 0, duration: 0.25, ease: 'power1.in' });
    tl.to(menu, { clipPath: 'inset(0 0 100% 0)', duration: 0.65, ease: 'power4.inOut' }, '-=0.05');
  };

  burger.addEventListener('click', () => (isOpen ? close() : open()));

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) close();
  });

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (!isOpen) return;
      const target = link.getAttribute('href');
      close(() => scrollTo(target));
    });
  });
}
