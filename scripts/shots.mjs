/*
 * Visual QA: screenshots the built site at desktop + mobile sizes and
 * reports console/page errors. Playwright is intentionally not a
 * dependency — run with:
 *   npm i -D --no-save playwright && npx playwright install chromium
 *   npm run preview -- --port 4173 & node scripts/shots.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:4173';
mkdirSync('.shots', { recursive: true });

const browser = await chromium.launch();

async function capture(name, { width, height, mobile = false }) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: mobile ? 2 : 1,
    isMobile: mobile,
    hasTouch: mobile,
    userAgent: mobile
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      : undefined,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`));
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

  const jump = (expr) =>
    page.evaluate((js) => {
      const y = eval(js);
      const lenis = window.__app?.lenis;
      if (lenis) lenis.scrollTo(y, { immediate: true });
      else window.scrollTo(0, y);
    }, expr);

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(5500); // stamp preloader + cover intro
  await page.screenshot({ path: `.shots/${name}-cover.png` });

  for (const sel of ['#profile', '#works', '#capabilities', '#record', '#contact']) {
    await jump(`document.querySelector('${sel}').getBoundingClientRect().top + window.scrollY - 60`);
    await page.waitForTimeout(1400);
    await page.screenshot({ path: `.shots/${name}-${sel.slice(1)}.png` });
    if (sel === '#works' && !mobile) {
      // mid-shelf: the pinned horizontal scroll in motion
      await jump(`document.querySelector('#works').getBoundingClientRect().top + window.scrollY + window.innerHeight * 1.4`);
      await page.waitForTimeout(1400);
      await page.screenshot({ path: `.shots/${name}-works-mid.png` });
    }
  }

  await jump(`document.body.scrollHeight`);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `.shots/${name}-colophon.png` });

  const toggle = page.locator('.masthead__toggle');
  if (await toggle.isVisible()) {
    await toggle.click();
    await page.waitForTimeout(900);
    await page.screenshot({ path: `.shots/${name}-drawer.png` });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(700);
  }

  console.log(`[${name}] ${errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console/page errors'}`);
  await ctx.close();
}

await capture('desktop', { width: 1440, height: 900 });
await capture('mobile', { width: 390, height: 844, mobile: true });
await browser.close();
