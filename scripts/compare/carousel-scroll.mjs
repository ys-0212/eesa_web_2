// Reproduces the mobile carousel interaction and reports page scrollY + track state on both sites.
// Usage: node scripts/compare/carousel-scroll.mjs
import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const [label, url] of [['ref', 'https://sentry.io/welcome/'], ['loc', 'http://localhost:3400/']]) {
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })).newPage();
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await page.waitForTimeout(2000);
  const h = page.getByRole('heading', { name: /Developer first/ }).first();
  const top = await h.evaluate((el) => el.getBoundingClientRect().top + scrollY);
  await page.evaluate((y) => scrollTo(0, y), top - 60);
  await page.waitForTimeout(500);
  const before = await page.evaluate(() => scrollY);
  const next = page.getByRole('button', { name: 'Next', exact: true }).first();
  for (let i = 0; i < 2; i++) { await next.tap(); await page.waitForTimeout(700); }
  const after = await page.evaluate(() => ({ scrollY, track: (() => { const t = [...document.querySelectorAll('.carousel-item')][0]?.parentElement; return t ? { left: Math.round(t.scrollLeft), h: Math.round(t.getBoundingClientRect().height) } : null; })() }));
  console.log(label, 'scrollY before', before, 'after', JSON.stringify(after));
}
await browser.close();
