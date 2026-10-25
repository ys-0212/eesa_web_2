// Computed styles inside each open desktop mega-menu panel (columns, headings, links, card).
// Usage: node scripts/recon/panel-styles.mjs [url]  -> analysis/measurements/panel-styles.json
import { chromium } from 'playwright';
import fs from 'node:fs';
const url = process.argv[2] ?? 'https://sentry.io/welcome/';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto(url, { waitUntil: 'load', timeout: 90000 });
const res = {};
for (const key of ['platform', 'solutions', 'resources']) {
  await page.click(`[data-menu-trigger="${key}"]`);
  await page.waitForTimeout(300);
  res[key] = await page.evaluate((key) => {
    const d = document.querySelector(`[data-menu-dropdown="${key}"]`);
    const s = (el) => { if (!el) return null; const c = getComputedStyle(el); const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), color: c.color, bg: c.backgroundColor, font: `${c.fontWeight} ${c.fontSize}/${c.lineHeight}`, pad: c.padding, margin: c.margin, gap: c.gap, radius: c.borderRadius, shadow: c.boxShadow }; };
    const vis = (sel) => [...d.querySelectorAll(sel)].filter((e) => e.offsetParent);
    return {
      panel: s(d),
      inner: s(d.firstElementChild),
      columns: vis('.self-stretch').map(s),
      h3: s(vis('h3')[0]),
      ul: s(vis('ul')[0]),
      li: s(vis('li')[0]),
      a: s(vis('a')[0]),
      pill: s(vis('.new-pill')[0]),
      img: s(vis('img')[0]),
      cardTitle: s(vis('h4, .text-xl, p')[0]),
      cta: s(vis('a.btn-new')[0]),
      allText: vis('p, h4, h5').map((e) => ({ tag: e.tagName, text: e.innerText.slice(0, 80), ...s(e) })),
    };
  }, key);
  await page.keyboard.press('Escape');
}
fs.writeFileSync('analysis/measurements/panel-styles.json', JSON.stringify(res, null, 1));
for (const [k, v] of Object.entries(res)) { console.log('==', k); for (const [n, x] of Object.entries(v)) console.log(n, JSON.stringify(x)); }
await browser.close();
