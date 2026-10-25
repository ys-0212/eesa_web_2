// Measures desktop/mobile header item geometry and wrapper classes.
// Usage: node scripts/recon/header-geometry.mjs [url] [width]
import { chromium } from 'playwright';
const url = process.argv[2] ?? 'https://sentry.io/welcome/';
const width = Number(process.argv[3] ?? 1440);
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width, height: 900 } })).newPage();
await page.goto(url, { waitUntil: 'load', timeout: 90000 });
const out = await page.evaluate(() => {
  const nav = document.querySelector('header nav');
  const items = [...nav.querySelectorAll('a, button')].filter((e) => e.offsetParent && e.getBoundingClientRect().y < 80);
  const chain = (el) => { const c = []; let p = el.parentElement; while (p && p !== nav) { c.push(`${p.tagName.toLowerCase()}.${(p.getAttribute('class') || '').trim().replace(/\s+/g, '.')}`); p = p.parentElement; } return c; };
  return items.map((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { text: e.innerText.trim(), x: Math.round(r.x), w: Math.round(r.width), y: Math.round(r.y), h: Math.round(r.height), pad: cs.padding, ml: cs.marginLeft, bg: cs.backgroundColor, color: cs.color, border: cs.borderColor, chain: chain(e).slice(0, 4) }; });
});
for (const o of out) console.log(JSON.stringify(o));
await browser.close();
