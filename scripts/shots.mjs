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

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000); // preloader + hero intro
  await page.screenshot({ path: `.shots/${name}-hero.png` });

  for (const sel of ['#about', '#work', '#stack', '#experience', '#contact']) {
    await page.evaluate((s) => {
      const el = document.querySelector(s);
      const y = el.getBoundingClientRect().top + window.scrollY - 30;
      const lenis = window.__app?.lenis;
      if (lenis) lenis.scrollTo(y, { immediate: true });
      else window.scrollTo(0, y);
    }, sel);
    await page.waitForTimeout(1400);
    await page.screenshot({ path: `.shots/${name}-${sel.slice(1)}.png` });
  }

  await page.click('.burger');
  await page.waitForTimeout(1300);
  await page.screenshot({ path: `.shots/${name}-menu.png` });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  if (!mobile) {
    await page.evaluate(() => {
      const y = document.querySelector('#work').getBoundingClientRect().top + window.scrollY;
      window.__app?.lenis?.scrollTo(y, { immediate: true });
    });
    await page.waitForTimeout(1300);
    const row = await page.locator('.work-row').nth(1).boundingBox();
    if (row) {
      await page.mouse.move(row.x + row.width * 0.4, row.y + row.height / 2, { steps: 10 });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `.shots/${name}-work-hover.png` });
    }
  }

  console.log(`[${name}] ${errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console/page errors'}`);
  await ctx.close();
}

await capture('desktop', { width: 1440, height: 900 });
await capture('mobile', { width: 390, height: 844, mobile: true });
await browser.close();
