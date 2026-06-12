# The Index — Issue Nº 01

> Mohamed Bensaddik's portfolio, designed as a printed field journal of
> software engineering. Paper, ink and one vermilion accent.

This branch is one of two complete designs in this repo:

- **`claude/the-index-editorial`** (this branch) — warm editorial print design:
  Fraunces variable serif, stamps, plates, ledgers and dotted leaders.
- **`claude/dreamy-dirac-ewm5s9`** — dark "acid brutalist" design: WebGL
  particle wave, chartreuse accent, IDE status bar.

**Stack:** [Vite](https://vitejs.dev) · [GSAP](https://gsap.com)
(ScrollTrigger, SplitText) · [Lenis](https://lenis.darkroom.engineering) ·
[simplex-noise](https://github.com/jwagner/simplex-noise.js) · vanilla JS & CSS.

## Features

- **Kinetic cover word** — "Engineer" set in Fraunces; each glyph's weight and
  optical size swell toward the cursor (a slow breathing wave on touch),
  fitted edge-to-edge at any viewport by a JS lockup sizer.
- **Stamp preloader** — the issue literally gets stamped (red roundel slam +
  paper recoil) before a sideways page wipe.
- **Contour-line canvas** — drifting topographic ink lines behind the cover,
  drawn on a 2D canvas with simplex noise; pauses off-screen.
- **Horizontal plate shelf** — Selected Works pins and slides sideways through
  five "scientific plates" (hand-coded SVG engravings) with parallax panning
  and a roman-numeral counter; stacks vertically on mobile/reduced-motion.
- **Editorial chrome** — double-rule masthead with a live chapter label, red
  reading-progress rule, running folio chip (`p.03 — Selected Works`),
  crop marks, paper grain, drop caps, dotted leader lines, a colophon with
  barcode, and a postage-stamp mailto button.
- **Accessible & responsive** — `prefers-reduced-motion` support throughout
  (including a vertical works fallback), semantic HTML, keyboard-closable
  drawer, fluid type, `100svh` cover, safe-area insets.

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # serve the production build
```

## Customise

All content lives in `index.html` (plates, ledger, capabilities, contact).
Colors and type are CSS custom properties at the top of
`src/styles/main.css` — swap `--red` and `--paper` to re-skin the issue.
Plate artworks are hand-coded SVGs in `public/projects/`; replace them with
real screenshots when ready.

## Deploy

The build is fully static (`dist/`) with a relative base path, so it works
as-is on GitHub Pages, Netlify, Vercel or any static host:

- **GitHub Pages:** Settings → Pages → "GitHub Actions", or push `dist/` to a
  `gh-pages` branch.
- **Netlify / Vercel:** build command `npm run build`, output directory `dist`.
