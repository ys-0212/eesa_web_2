// Records every .background-layer (and its wrapper) with computed background + fade settings
// at one width. Usage: node scripts/recon/backgrounds.mjs [url] [width]
import { chromium } from 'playwright';
import fs from 'node:fs';
const url = process.argv[2] ?? 'https://sentry.io/welcome/';
const width = Number(process.argv[3] ?? 1440);
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width, height: 900 } })).newPage();
await page.goto(url, { waitUntil: 'load', timeout: 90000 });
await page.waitForTimeout(1500);
const data = await page.evaluate(() => [...document.querySelectorAll('main > div.relative, main > section')].map((w) => {
  const r = w.getBoundingClientRect();
  const layer = w.querySelector(':scope > .background-layer');
  const out = { tag: w.tagName.toLowerCase(), y: Math.round(r.y + scrollY), h: Math.round(r.height), firstHeading: w.querySelector('h1,h2')?.textContent.trim().slice(0, 40), wrapperStyle: w.getAttribute('style'), wrapperData: { ...w.dataset } };
  if (layer) {
    const cs = getComputedStyle(layer);
    out.layer = { style: layer.getAttribute('style'), data: { ...layer.dataset }, bgImage: cs.backgroundImage.replace(/\?dpl=[^")]*/g, ''), bgSize: cs.backgroundSize, bgPos: cs.backgroundPosition, bgRepeat: cs.backgroundRepeat, bgColor: cs.backgroundColor, opacity: cs.opacity, before: getComputedStyle(layer, '::before').background.slice(0, 200), beforeH: getComputedStyle(layer, '::before').height, after: getComputedStyle(layer, '::after').background.slice(0, 200), afterH: getComputedStyle(layer, '::after').height, children: [...layer.children].map((c) => ({ cls: c.className, style: c.getAttribute('style'), bg: getComputedStyle(c).background.slice(0, 200) })) };
  }
  return out;
}));
fs.writeFileSync(`analysis/measurements/backgrounds-${width}.json`, JSON.stringify(data, null, 1));
console.log(JSON.stringify(data, null, 1));
await browser.close();
