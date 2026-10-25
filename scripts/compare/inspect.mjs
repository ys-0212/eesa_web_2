// Prints computed box info for elements matching a CSS selector on reference and local.
// Usage: node scripts/compare/inspect.mjs <width> "<selector>" [refUrl] [localUrl]
import { chromium } from 'playwright';
const [width, selector, refUrl = 'https://sentry.io/welcome/', locUrl = 'http://localhost:3400/'] = process.argv.slice(2);
const browser = await chromium.launch();
for (const [label, url] of [['ref', refUrl], ['loc', locUrl]]) {
  const page = await (await browser.newContext({ viewport: { width: Number(width), height: 900 } })).newPage();
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await page.waitForTimeout(1200);
  const out = await page.evaluate((sel) => [...document.querySelectorAll(sel)].filter((e) => e.offsetParent || getComputedStyle(e).position === 'fixed').slice(0, 6).map((e) => {
    const r = e.getBoundingClientRect(); const c = getComputedStyle(e);
    return { cls: (e.getAttribute('class') || '').slice(0, 90), x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height), pad: c.padding, margin: c.margin, bg: c.backgroundImage.slice(0, 80) || c.backgroundColor, opacity: c.opacity, display: c.display, scrollW: e.scrollWidth };
  }), selector);
  console.log(label, JSON.stringify(out, null, 0));
}
await browser.close();
