import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/*
 * Editorial chrome: the red reading-progress rule under the masthead,
 * the running chapter label, the page folio chip, and every
 * [data-clock] on the page (Casablanca time).
 */
export function initProgress() {
  gsap.to('.progress__bar', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.3, invalidateOnRefresh: true },
  });

  const chLabel = document.querySelector('[data-chapter-label]');
  const folioNo = document.querySelector('[data-folio-no]');
  const folioLabel = document.querySelector('[data-folio-label]');

  const setChapter = (sec) => {
    chLabel.textContent = sec.dataset.chapter;
    folioNo.textContent = sec.dataset.folio;
    folioLabel.textContent = sec.dataset.chapter;
  };

  // Live-rect spy: the active chapter is the last section whose top has
  // crossed the viewport center. Reading rects every frame stays correct
  // through the pinned works shelf, where ScrollTrigger start positions
  // (computed pre-spacer) would drift.
  const secs = gsap.utils.toArray('[data-chapter]');
  let current = null;
  gsap.ticker.add(() => {
    const center = window.innerHeight * 0.5;
    let active = secs[0];
    for (const sec of secs) {
      if (sec.getBoundingClientRect().top <= center) active = sec;
      else break;
    }
    if (active !== current) {
      current = active;
      setChapter(active);
    }
  });

  const clocks = document.querySelectorAll('[data-clock]');
  if (clocks.length) {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Casablanca',
    });
    const tick = () => clocks.forEach((n) => (n.textContent = fmt.format(new Date())));
    tick();
    setInterval(tick, 20000);
  }
}
