import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the build works on GitHub Pages project sites,
  // Netlify, Vercel or any static host without configuration.
  base: './',
  build: {
    target: 'es2020',
    assetsInlineLimit: 2048,
  },
});
