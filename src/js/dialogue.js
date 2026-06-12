import { ScrollTrigger } from 'gsap/ScrollTrigger';

/*
 * RPG dialogue boxes: [data-type] text types itself when scrolled into
 * view. Clicking the box mid-type completes it instantly — as is
 * tradition. Reduced-motion users get the full text immediately.
 */
export function initDialogue({ reducedMotion } = {}) {
  document.querySelectorAll('[data-type]').forEach((el) => {
    if (reducedMotion) return;

    const full = el.textContent.replace(/\s+/g, ' ').trim();
    const box = el.closest('.dialog') || el;
    let started = false;
    let done = false;
    let timer = null;

    const begin = () => {
      if (started) return;
      started = true;
      el.style.minHeight = `${el.offsetHeight}px`; // no layout jump
      el.textContent = '';
      let idx = 0;
      timer = setInterval(() => {
        idx += 2;
        el.textContent = full.slice(0, idx);
        if (idx >= full.length) {
          clearInterval(timer);
          done = true;
        }
      }, 24);
    };

    ScrollTrigger.create({ trigger: el, start: 'top 80%', once: true, onEnter: begin });

    box.addEventListener('click', () => {
      if (started && !done) {
        clearInterval(timer);
        el.textContent = full;
        done = true;
      }
    });
  });
}
