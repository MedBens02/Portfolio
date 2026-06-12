import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/*
 * The IDE-style bottom bar: active "file" (section), scroll percentage
 * and a live Casablanca clock. Also drives every [data-clock] on the page.
 */
export function initStatusbar({ lenis }) {
  const sectionEl = document.querySelector('.statusbar__section');
  const progressEl = document.querySelector('[data-progress]');

  gsap.utils.toArray('[data-section]').forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top center',
      end: 'bottom center',
      onToggle: (self) => {
        if (self.isActive) sectionEl.textContent = `// ${sec.dataset.section}`;
      },
    });
  });

  const setProgress = (p) => {
    progressEl.textContent = String(Math.round(p * 100)).padStart(3, '0');
  };

  if (lenis) {
    lenis.on('scroll', (e) => setProgress(e.progress || 0));
  } else {
    window.addEventListener(
      'scroll',
      () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? window.scrollY / max : 0);
      },
      { passive: true }
    );
  }

  const clocks = document.querySelectorAll('[data-clock]');
  const fmt = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Casablanca',
  });
  const tick = () => {
    const t = fmt.format(new Date());
    clocks.forEach((n) => (n.textContent = t));
  };
  tick();
  setInterval(tick, 20000);
}
