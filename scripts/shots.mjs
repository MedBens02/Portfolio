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
  await page.waitForTimeout(5200); // loading screen + title intro
  await page.screenshot({ path: `.shots/${name}-hero.png` });

  for (const sel of ['#character', '#skills', '#quests', '#journey', '#side', '#contact']) {
    await jump(`document.querySelector('${sel}').getBoundingClientRect().top + window.scrollY - 56`);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `.shots/${name}-${sel.slice(1)}.png` });
  }

  await jump(`document.body.scrollHeight`);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `.shots/${name}-footer.png` });

  if (!mobile) {
    // Konami code → retro mode + achievement toast
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('b');
    await page.keyboard.press('a');
    await page.waitForTimeout(700);
    await page.screenshot({ path: `.shots/${name}-konami.png` });
  }

  console.log(`[${name}] ${errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console/page errors'}`);
  await ctx.close();
}

await capture('desktop', { width: 1440, height: 900 });
await capture('mobile', { width: 390, height: 844, mobile: true });
await browser.close();
