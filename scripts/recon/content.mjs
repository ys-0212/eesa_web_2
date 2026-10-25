// Per-section text, links, controls and inline SVG markup at one width.
// Usage: node scripts/recon/content.mjs [url] [width]
// Writes analysis/measurements/content-<w>.json and analysis/raw/svg/<section>-<n>.svg
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

const sections = await page.evaluate(() => {
  const blocks = [document.querySelector('header'), ...document.querySelectorAll('main section'), document.querySelector('footer')].filter(Boolean);
  return blocks.map((el, i) => {
    const r = el.getBoundingClientRect();
    return {
      index: i,
      tag: el.tagName.toLowerCase(),
      cls: el.getAttribute('class'),
      rect: { y: Math.round(r.y + scrollY), h: Math.round(r.height) },
      text: el.innerText.replace(/\n{2,}/g, '\n').slice(0, 6000),
      links: [...el.querySelectorAll('a')].map((a) => ({ text: a.innerText.trim().replace(/\s+/g, ' ').slice(0, 120), href: a.getAttribute('href'), aria: a.getAttribute('aria-label') })),
      controls: [...el.querySelectorAll('button,[role=tab],[role=button],input,select,textarea')].map((b) => ({ tag: b.tagName.toLowerCase(), role: b.getAttribute('role'), text: (b.innerText || b.value || '').trim().slice(0, 80), aria: b.getAttribute('aria-label'), type: b.getAttribute('type'), name: b.getAttribute('name'), placeholder: b.getAttribute('placeholder'), selected: b.getAttribute('aria-selected'), expanded: b.getAttribute('aria-expanded') })),
      svgs: [...el.querySelectorAll('svg')].filter((s) => !s.parentElement.closest('svg')).map((s) => ({ w: Math.round(s.getBoundingClientRect().width), h: Math.round(s.getBoundingClientRect().height), cls: s.getAttribute('class'), parentCls: s.parentElement.getAttribute('class')?.slice(0, 100), label: s.getAttribute('aria-label') || s.querySelector('title')?.textContent, markup: s.outerHTML })),
    };
  });
});
fs.mkdirSync('analysis/raw/svg', { recursive: true });
for (const s of sections) {
  s.svgs.forEach((svg, n) => {
    fs.writeFileSync(`analysis/raw/svg/s${String(s.index).padStart(2, '0')}-${String(n).padStart(2, '0')}.svg`, svg.markup);
    svg.file = `analysis/raw/svg/s${String(s.index).padStart(2, '0')}-${String(n).padStart(2, '0')}.svg`;
    svg.bytes = svg.markup.length;
    delete svg.markup;
  });
}
fs.writeFileSync(`analysis/measurements/content-${width}.json`, JSON.stringify(sections, null, 1));
for (const s of sections) console.log(s.index, s.tag, s.rect.y, s.rect.h, 'links', s.links.length, 'controls', s.controls.length, 'svgs', s.svgs.length, '|', s.text.split('\n')[0].slice(0, 70));
await browser.close();
