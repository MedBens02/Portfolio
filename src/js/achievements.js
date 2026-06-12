import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/*
 * Achievement toasts (queued, one at a time) for scroll milestones,
 * plus the obligatory Konami code → retro CRT mode.
 */
export function initAchievements({ reducedMotion } = {}) {
  const wrap = document.querySelector('.toasts');
  const queue = [];
  let busy = false;

  const pump = () => {
    if (busy || !queue.length) return;
    busy = true;
    const t = queue.shift();
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<div class="toast__in"><i class="toast__icon">${t.icon}</i><div><b>${t.title}</b><span>${t.sub}</span></div></div>`;
    wrap.appendChild(el);

    const tl = gsap.timeline({
      onComplete: () => {
        el.remove();
        busy = false;
        pump();
      },
    });
    if (reducedMotion) {
      tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 });
      tl.to(el, { autoAlpha: 0, duration: 0.2 }, '+=2.6');
    } else {
      tl.from(el, { xPercent: -115, duration: 0.4, ease: 'steps(6)' });
      tl.to(el, { xPercent: -115, duration: 0.35, ease: 'steps(5)' }, '+=2.5');
    }
  };

  const unlock = (title, sub, icon = '★') => {
    queue.push({ title, sub, icon });
    pump();
  };

  const milestone = (sel, title, sub, icon) =>
    ScrollTrigger.create({
      trigger: sel,
      start: 'top 70%',
      once: true,
      onEnter: () => unlock(title, sub, icon),
    });

  milestone('#character', 'achievement: journey begun', '+10 xp · met the character', '⚑');
  milestone('#quests', 'achievement: quest log opened', '+25 xp · receipts inspected', '✦');
  milestone('#contact', 'achievement: final zone', '+100 xp · party invite available', '★');

  // ↑↑↓↓←→←→BA
  const SEQ = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let i = 0;
  window.addEventListener('keydown', (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    i = k === SEQ[i] ? i + 1 : k === SEQ[0] ? 1 : 0;
    if (i === SEQ.length) {
      i = 0;
      const on = document.documentElement.classList.toggle('retro');
      unlock(
        on ? 'achievement: 30 lives' : 'crt powered down',
        on ? 'cheat accepted · retro mode on' : 'thanks for playing',
        on ? '✚' : '▣'
      );
    }
  });

  return { unlock };
}
