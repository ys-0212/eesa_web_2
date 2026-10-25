// Compares computed typography for elements located by their text on reference vs local.
// Usage: node scripts/compare/fonts.mjs <width> "<text1>" "<text2>" ...
import { chromium } from 'playwright';
const [width, ...needles] = process.argv.slice(2);
const urls = [['ref', 'https://sentry.io/welcome/'], ['loc', 'http://localhost:3400/']];
const browser = await chromium.launch();
const res = {};
for (const [label, url] of urls) {
  const page = await (await browser.newContext({ viewport: { width: Number(width), height: 900 } })).newPage();
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await page.waitForTimeout(1000);
  res[label] = await page.evaluate((needles) => needles.map((n) => {
    const all = [...document.querySelectorAll('body *')].filter((e) => e.offsetParent && e.children.length === 0 && e.textContent.trim().startsWith(n));
    const e = all[0];
    if (!e) return null;
    const c = getComputedStyle(e);
    return `${c.fontWeight} ${c.fontSize}/${c.lineHeight} ${c.fontFamily.split(',')[0]} ${c.fontStyle} ls=${c.letterSpacing} color=${c.color} tt=${c.textTransform} smooth=${c.webkitFontSmoothing}`;
  }), needles);
}
needles.forEach((n, i) => console.log(`${n.slice(0, 30).padEnd(30)}\n  ref ${res.ref[i]}\n  loc ${res.loc[i]}`));
await browser.close();
