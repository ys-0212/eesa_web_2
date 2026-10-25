// Writes a readable outerHTML per section (scripts/styles removed, SVG bodies collapsed to a
// reference id, Astro data-attrs stripped) to analysis/raw/sections/NN.html for structural study.
// SVG markup is saved separately to analysis/raw/svg-by-id/<id>.svg.
import { chromium } from 'playwright';
import fs from 'node:fs';
import { autoScroll } from '../shared/scroll.mjs';

const url = process.argv[2] ?? 'https://sentry.io/welcome/';
const width = Number(process.argv[3] ?? 1440);
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width, height: 900 } })).newPage();
await page.goto(url, { waitUntil: 'load', timeout: 90000 });
await page.waitForTimeout(2000);
await autoScroll(page);

const out = await page.evaluate(() => {
  const blocks = [document.querySelector('header'), document.querySelector('.toggle-container'), ...document.querySelectorAll('main section'), document.querySelector('footer')].filter(Boolean);
  const svgs = {};
  let n = 0;
  const html = blocks.map((el) => {
    const c = el.cloneNode(true);
    c.querySelectorAll('script,style,noscript,template').forEach((s) => s.remove());
    c.querySelectorAll('svg').forEach((s) => {
      if (s.parentElement && s.parentElement.closest('svg')) return;
      const id = `svg${String(n++).padStart(3, '0')}`;
      svgs[id] = s.outerHTML;
      const ph = document.createElement('svg-ref');
      ph.setAttribute('id', id);
      for (const a of ['class', 'width', 'height', 'viewBox', 'aria-label', 'aria-hidden', 'fill']) if (s.getAttribute(a)) ph.setAttribute(a, s.getAttribute(a));
      s.replaceWith(ph);
    });
    c.querySelectorAll('*').forEach((e) => {
      for (const a of [...e.attributes]) if (a.name.startsWith('data-astro-cid') || a.name === 'data-astro-source-file' || a.name === 'data-astro-source-loc') e.removeAttribute(a.name);
    });
    return c.outerHTML;
  });
  return { html, svgs };
});
fs.mkdirSync('analysis/raw/sections', { recursive: true });
fs.mkdirSync('analysis/raw/svg-by-id', { recursive: true });
out.html.forEach((h, i) => {
  const pretty = h.replace(/></g, '>\n<');
  fs.writeFileSync(`analysis/raw/sections/${String(i).padStart(2, '0')}.html`, pretty);
  console.log(i, pretty.length);
});
for (const [id, s] of Object.entries(out.svgs)) fs.writeFileSync(`analysis/raw/svg-by-id/${id}.svg`, s);
console.log('svgs', Object.keys(out.svgs).length);
await browser.close();
