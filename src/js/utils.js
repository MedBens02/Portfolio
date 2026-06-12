export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export const lerp = (a, b, t) => a + (b - a) * t;

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
