# PRESS START — a junior developer's journey

> Mohamed Bensaddik's portfolio as a playable-feeling game world: twilight
> mid-tones, pixel UI, honest junior-developer positioning — quest log,
> skill tree, XP road and open party invites.

This branch is one of three complete designs in this repo:

- **`claude/press-start-quest`** (this branch) — game-world design: dusk sky,
  pixel adventurer, HUD, achievements, Konami code.
- **`claude/the-index-editorial`** — paper-and-ink editorial print issue
  (Fraunces serif, stamps, plates, ledgers).
- **`claude/dreamy-dirac-ewm5s9`** — dark acid-brutalist design (WebGL
  particle wave, chartreuse, IDE status bar).

**Stack:** [Vite](https://vitejs.dev) · [GSAP](https://gsap.com)
(ScrollTrigger) · [Lenis](https://lenis.darkroom.engineering) · canvas 2D ·
vanilla JS & CSS.

## Features

- **Scroll = time** — the fixed sky scrubs dusk → night → dawn across the
  page; pixel stars twinkle hardest at "midnight" with the occasional
  shooting star.
- **The walker** — a hand-pixelled adventurer walks along the bottom strip
  toward the flag as you scroll: page progress made literal. Flips to face
  your scroll direction, idles when you stop.
- **Game HUD** — scroll progress as a segmented XP bar + percent, the current
  section as `AREA:`, all live.
- **Honest junior framing** — a skill tree with `unlocked / in progress /
  future quest` nodes, quest-log projects with difficulty stars and XP
  rewards, an XP-road timeline ending at "LVL 5 — you are here", and a
  recruitment zone that reads like an LFG post.
- **RPG details** — typewriter dialogue box (click to skip, as is tradition),
  achievement toasts at milestones, stat bars with intentionally low Ego,
  a "what gaming taught me" tavern, loading screen with iris wipe, and
  ↑↑↓↓←→←→BA for CRT retro mode.
- **Accessible & responsive** — `prefers-reduced-motion` support throughout
  (instant text, static walker, single-frame stars), semantic HTML, fluid
  type, `100svh` hero, mobile layouts for every zone.

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # serve the production build
```

## Customise

All content lives in `index.html` (quests, skill nodes, XP road, stats,
contact). Colors are CSS custom properties at the top of
`src/styles/main.css` — `--amber`, `--mint` and the `--sky-*` pairs in
`src/js/sky.js` re-skin the world. Quest art is hand-pixelled SVG in
`public/projects/`; swap in real screenshots (keep `image-rendering:
pixelated` or remove it).

## Deploy

The build is fully static (`dist/`) with a relative base path, so it works
as-is on GitHub Pages, Netlify, Vercel or any static host:

- **GitHub Pages:** Settings → Pages → "GitHub Actions", or push `dist/` to a
  `gh-pages` branch.
- **Netlify / Vercel:** build command `npm run build`, output directory `dist`.
