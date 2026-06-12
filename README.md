# Mohamed Bensaddik — Portfolio

A dark, type-driven portfolio for a software engineer. Built from scratch — no
templates — with a WebGL particle field, scroll-choreographed typography and an
IDE-flavoured UI.

**Stack:** [Vite](https://vitejs.dev) · [GSAP](https://gsap.com) (ScrollTrigger,
SplitText, ScrambleText) · [Three.js](https://threejs.org) ·
[Lenis](https://lenis.darkroom.engineering) · vanilla JS & CSS.

## Features

- **WebGL hero** — ~30k points displaced by simplex noise in a custom shader,
  with a gaussian ripple that trails the pointer and amplitude that reacts to
  scroll velocity. Degrades gracefully (static frame for reduced-motion, hidden
  if WebGL is unavailable).
- **Preloader** — load-aware counter, curtain reveal, overlapping hero intro
  with per-character title animation.
- **Scroll choreography** — Lenis smooth scroll + ScrollTrigger: masked line
  reveals, a word-by-word "ink in" statement, parallax, scramble-decoding mono
  labels.
- **Work list** — full-bleed acid-fill hover rows with a floating artwork
  preview that chases the cursor (desktop); inline artwork cards on touch.
- **Acid menu** — full-screen chartreuse overlay with staggered oversized links.
- **IDE status bar** — live section indicator (`// work`), scroll percentage and
  a Casablanca clock, like a code editor's footer.
- **Custom cursor, magnetic CTA, infinite marquees** that speed up with scroll
  velocity, film grain, easter-egg console banner.
- **Accessible & responsive** — `prefers-reduced-motion` support throughout,
  semantic HTML, keyboard-closable menu, fluid type via `clamp()`, mobile
  layouts for every section, `100svh` hero, safe-area insets.

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # serve the production build
```

## Customise

All content lives in `index.html` (projects, experience, capabilities, contact
links). Colors and type are CSS custom properties at the top of
`src/styles/main.css` — change `--accent` to re-skin the whole site. Project
artworks are hand-coded SVGs in `public/projects/`; swap them for real
screenshots when ready.

## Deploy

The build is fully static (`dist/`) with a relative base path, so it works
as-is on GitHub Pages, Netlify, Vercel or any static host:

- **GitHub Pages:** Settings → Pages → "GitHub Actions", or push `dist/` to a
  `gh-pages` branch.
- **Netlify / Vercel:** build command `npm run build`, output directory `dist`.
