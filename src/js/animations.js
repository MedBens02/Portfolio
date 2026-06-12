import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { finePointer, lerp, clamp } from './utils.js';

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);

const SCRAMBLE_CHARS = '01<>/#{}_-';

/*
 * Hide everything that animates in, and build the (paused) hero intro
 * timeline. The preloader curtain triggers .play(). Called before first
 * paint matters — the preloader covers the page while states are set.
 */
export function prepIntro() {
  document.querySelectorAll('[data-scramble]').forEach((el) => {
    el.dataset.text = el.textContent.trim();
    el.textContent = '';
  });

  const split = new SplitText('[data-title]', { type: 'chars' });
  gsap.set(split.chars, { yPercent: 120 });
  gsap.set('.header', { autoAlpha: 0, y: -16 });
  gsap.set('.hero__canvas', { autoAlpha: 0 });
  gsap.set(['.hero__scroll', '.hero__tag', '.hero__coords'], { autoAlpha: 0, y: 18 });

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });

  tl.to('.hero__canvas', { autoAlpha: 1, duration: 2.4, ease: 'power2.inOut' }, 0)
    .to(split.chars, { yPercent: 0, duration: 1.15, stagger: { each: 0.03 } }, 0.15)
    .to('.header', { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.7);

  document.querySelectorAll('.hero [data-scramble]').forEach((el, i) => {
    tl.to(
      el,
      { duration: 1, ease: 'none', scrambleText: { text: el.dataset.text, chars: SCRAMBLE_CHARS, speed: 0.4 } },
      0.55 + i * 0.12
    );
  });

  tl.to(
    ['.hero__scroll', '.hero__tag', '.hero__coords'],
    { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.09, ease: 'power3.out' },
    0.9
  );

  // Once revealed, let chars escape their clip rows and react to hover.
  tl.add(() => {
    document.querySelectorAll('.hero__row').forEach((r) => (r.style.overflow = 'visible'));
    initHeroCharHover(split.chars);
  });

  return tl;
}

function initHeroCharHover(chars) {
  if (!finePointer) return;
  chars.forEach((char) => {
    char.addEventListener('mouseenter', () => {
      gsap
        .timeline()
        .to(char, { yPercent: -16, color: '#c9f73a', duration: 0.18, ease: 'power2.out', overwrite: true })
        .to(char, { yPercent: 0, duration: 0.85, ease: 'elastic.out(1.2, 0.45)' })
        .to(char, { color: 'inherit', clearProps: 'color', duration: 0.3 }, 0.3);
    });
  });
}

export function initScrollAnimations({ glApi }) {
  // Generic fade-up reveals
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      autoAlpha: 0,
      y: 30,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  // Mono labels decode themselves on entry (hero ones run in the intro)
  gsap.utils.toArray('[data-scramble]').forEach((el) => {
    if (el.closest('.hero')) return;
    gsap.to(el, {
      duration: 0.9,
      ease: 'none',
      scrambleText: { text: el.dataset.text, chars: SCRAMBLE_CHARS, speed: 0.4 },
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });

  // Section heads: masked line reveal, then restore the clean DOM
  document.querySelectorAll('.s-head').forEach((head) => {
    const title = head.querySelector('.s-head__title');
    const note = head.querySelector('.s-head__note');
    const split = new SplitText(title, { type: 'lines', mask: 'lines' });
    const tl = gsap.timeline({
      scrollTrigger: { trigger: head, start: 'top 85%', once: true },
      onComplete: () => split.revert(),
    });
    tl.from(split.lines, { yPercent: 115, duration: 0.95, stagger: 0.09, ease: 'power4.out' });
    if (note) tl.from(note, { autoAlpha: 0, duration: 0.7, ease: 'none' }, 0.25);
  });

  // About statement: words ink themselves in as you scroll (scrubbed)
  const stmt = document.querySelector('[data-scrub]');
  if (stmt) {
    const split = new SplitText(stmt, { type: 'words' });
    gsap.set(split.words, { color: '#3c3f33' });
    const tl = gsap.timeline({
      scrollTrigger: { trigger: stmt, start: 'top 80%', end: 'bottom 45%', scrub: 0.4 },
    });
    split.words.forEach((word, i) => {
      tl.to(word, { color: word.closest('em') ? '#c9f73a' : '#e9ebe1', duration: 1, ease: 'none' }, i * 0.35);
    });
  }

  // Work rows surface one by one
  gsap.utils.toArray('.work-row').forEach((row) => {
    gsap.from(row, {
      autoAlpha: 0,
      y: 44,
      duration: 0.85,
      ease: 'power3.out',
      scrollTrigger: { trigger: row, start: 'top 92%', once: true },
    });
  });

  // Contact headline
  gsap.from('[data-title-c]', {
    yPercent: 130,
    duration: 1.05,
    stagger: 0.09,
    ease: 'expo.out',
    scrollTrigger: { trigger: '.contact', start: 'top 72%', once: true },
  });

  // Hero parallax + the WebGL field fading away as it scrolls off
  gsap.to('.hero__name', {
    yPercent: -18,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to(['.hero__top', '.hero__foot'], {
    autoAlpha: 0,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: '5% top', end: '45% top', scrub: true },
  });
  ScrollTrigger.create({
    trigger: '.hero',
    start: 'top top',
    end: 'bottom 15%',
    onUpdate: (self) => glApi.setProgress(self.progress),
  });

  initWorkPreview();
}

/*
 * Floating project preview that chases the cursor over the work list.
 * Desktop / fine pointers only — mobile shows inline artwork instead.
 */
function initWorkPreview() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 64rem)').matches) return;
  const preview = document.querySelector('.work-preview');
  const list = document.querySelector('.work__list');
  if (!preview || !list) return;

  const imgs = preview.querySelectorAll('img');
  gsap.set(preview, { scale: 0.92, autoAlpha: 0 });

  const xTo = gsap.quickTo(preview, 'x', { duration: 0.5, ease: 'power3.out' });
  const yTo = gsap.quickTo(preview, 'y', { duration: 0.5, ease: 'power3.out' });

  let rot = 0;
  let rotTarget = 0;
  let lastX = null;
  let visible = false;

  window.addEventListener(
    'pointermove',
    (e) => {
      if (lastX !== null) rotTarget = clamp(rotTarget + (e.clientX - lastX) * 0.1, -9, 9);
      lastX = e.clientX;
      xTo(Math.min(e.clientX + 36, window.innerWidth - preview.offsetWidth - 24));
      yTo(e.clientY - preview.offsetHeight / 2);
    },
    { passive: true }
  );

  gsap.ticker.add(() => {
    rotTarget = lerp(rotTarget, 0, 0.1);
    rot = lerp(rot, rotTarget, 0.15);
    if (visible) gsap.set(preview, { rotation: rot });
  });

  gsap.utils.toArray('.work-row').forEach((row) => {
    row.addEventListener('mouseenter', () => {
      const idx = Number(row.dataset.preview) || 0;
      imgs.forEach((img, i) => img.classList.toggle('is-active', i === idx));
      visible = true;
      gsap.to(preview, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'power3.out' });
    });
  });

  list.addEventListener('mouseleave', () => {
    visible = false;
    gsap.to(preview, { autoAlpha: 0, scale: 0.92, duration: 0.45, ease: 'power2.out' });
  });
}
