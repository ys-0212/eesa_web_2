// Heading-anchored geometry comparison between reference and local at the four widths.
// Usage: node scripts/compare/geometry.mjs [refUrl] [localUrl]
// Output: analysis/measurements/geometry-compare.json + a delta table on stdout.
import { chromium } from 'playwright';
import fs from 'node:fs';
import { autoScroll } from '../shared/scroll.mjs';

const refUrl = process.argv[2] ?? 'https://sentry.io/welcome/';
const locUrl = process.argv[3] ?? 'http://localhost:3400/';
const sizes = [[1440, 900], [1024, 768], [768, 1024], [390, 844]];

const probe = () => {
  const abs = (el) => { const r = el.getBoundingClientRect(); return { y: Math.round(r.y + scrollY), x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height) }; };
  const headings = [...document.querySelectorAll('main h1, main h2')].filter((h) => h.offsetParent).map((h) => ({ text: h.textContent.trim().replace(/\s+/g, ' ').slice(0, 24), ...abs(h) }));
  const pick = (sel, re) => { const el = [...document.querySelectorAll(sel)].find((e) => e.offsetParent && re.test(e.textContent)); return el ? abs(el) : null; };
  return {
    docHeight: document.documentElement.scrollHeight,
    header: abs(document.querySelector('header')),
    footer: abs(document.querySelector('footer')),
    headings,
    probes: {
      heroCanvas: (() => { const c = document.querySelector('canvas'); return c ? abs(c) : null; })(),
      ufo: (() => { const i = document.querySelector('img[src*="ufo-abduction"]'); return i ? abs(i) : null; })(),
      firstCardImg: (() => { const i = [...document.querySelectorAll('img[src*="install-1-line"]')].find((e) => e.offsetParent); return i ? abs(i) : null; })(),
      tabsImgA: (() => { const i = [...document.querySelectorAll('img[src*="tabs-a-1"]')].find((e) => e.offsetParent); return i ? abs(i) : null; })(),
      tabsImgB: (() => { const i = [...document.querySelectorAll('img[src*="tabs-b-1"]')].find((e) => e.offsetParent); return i ? abs(i) : null; })(),
      firstQuote: pick('main div, main p', /^\s*We wouldn.t have scaled/),
      select: (() => { const s = document.querySelector('main select'); return s ? abs(s) : null; })(),
      codeBlock: (() => { const c = [...document.querySelectorAll('.code-wrapper')].find((e) => e.offsetParent && e.getBoundingClientRect().height > 20); return c ? abs(c) : null; })(),
      badges: (() => { const b = document.querySelector('[aria-label="GDPR"]'); return b ? abs(b) : null; })(),
      emailInput: (() => { const i = document.querySelector('main input[type=email]'); return i ? abs(i) : null; })(),
      img404: (() => { const i = [...document.querySelectorAll('img[src*="home-spot-404"]')].find((e) => e.offsetParent); return i ? abs(i) : null; })(),
      footerWave: (() => { const s = [...document.querySelectorAll('footer svg')].find((e) => e.getAttribute('height') === '8'); return s ? abs(s) : null; })(),
    },
  };
};

const browser = await chromium.launch();
const result = {};
for (const [width, height] of sizes) {
  result[width] = {};
  for (const [label, url] of [['ref', refUrl], ['loc', locUrl]]) {
    const ctx = await browser.newContext({ viewport: { width, height } });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'load', timeout: 90000 });
    await page.waitForTimeout(1500);
    await autoScroll(page, { delay: 150 });
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(500);
    result[width][label] = await page.evaluate(probe);
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync('analysis/measurements/geometry-compare.json', JSON.stringify(result, null, 1));

for (const [w, { ref, loc }] of Object.entries(result)) {
  console.log(`\n== ${w}px  docHeight ref=${ref.docHeight} loc=${loc.docHeight} (Δ${loc.docHeight - ref.docHeight})  footer.y Δ${loc.footer.y - ref.footer.y}`);
  ref.headings.forEach((h, i) => {
    const l = loc.headings[i];
    console.log(`  ${h.text.padEnd(24)} y ${h.y}→${l?.y} (Δ${l ? l.y - h.y : '?'})  h ${h.h}→${l?.h}  x ${h.x}→${l?.x}  w ${h.w}→${l?.w}`);
  });
  for (const [k, v] of Object.entries(ref.probes)) {
    const l = loc.probes[k];
    if (!v || !l) { console.log(`  [${k}] ref=${JSON.stringify(v)} loc=${JSON.stringify(l)}`); continue; }
    console.log(`  [${k}] y Δ${l.y - v.y} x Δ${l.x - v.x} w ${v.w}→${l.w} h ${v.h}→${l.h}`);
  }
}
