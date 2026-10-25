// Section inventory + computed styles + asset inventory for one viewport width.
// Usage: node scripts/recon/structure.mjs [url] [width] [height]
// Writes analysis/measurements/structure-<w>.json, analysis/raw/rendered-<w>.html,
// analysis/raw/network-<w>.json
import { chromium } from 'playwright';
import fs from 'node:fs';
import { autoScroll } from '../shared/scroll.mjs';

const url = process.argv[2] ?? 'https://sentry.io/welcome/';
const width = Number(process.argv[3] ?? 1440);
const height = Number(process.argv[4] ?? 900);
fs.mkdirSync('analysis/measurements', { recursive: true });
fs.mkdirSync('analysis/raw', { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
const page = await context.newPage();
const network = [];
page.on('response', async (r) => {
  const req = r.request();
  network.push({
    url: r.url(),
    status: r.status(),
    type: req.resourceType(),
    mime: r.headers()['content-type'] ?? '',
    size: Number(r.headers()['content-length'] ?? 0),
  });
});
await page.goto(url, { waitUntil: 'load', timeout: 90000 });
await page.waitForTimeout(2500);
await autoScroll(page);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(1500);

const data = await page.evaluate(() => {
  const pick = (el) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      id: el.id || undefined,
      cls: (el.getAttribute('class') || '').slice(0, 200),
      rect: { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) },
      style: {
        display: cs.display, position: cs.position,
        bg: cs.backgroundColor, bgImage: cs.backgroundImage.slice(0, 300),
        color: cs.color, font: cs.fontFamily, size: cs.fontSize, weight: cs.fontWeight,
        lh: cs.lineHeight, ls: cs.letterSpacing, pad: cs.padding, margin: cs.margin,
        radius: cs.borderRadius, border: cs.border, shadow: cs.boxShadow, gap: cs.gap,
        maxW: cs.maxWidth, transform: cs.transform, transition: cs.transition.slice(0, 200),
        animation: cs.animationName !== 'none' ? `${cs.animationName} ${cs.animationDuration} ${cs.animationTimingFunction} ${cs.animationIterationCount}` : undefined,
        opacity: cs.opacity, zIndex: cs.zIndex, overflow: cs.overflow,
      },
    };
  };
  const tree = (el, depth, max) => {
    const node = pick(el);
    const text = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
    if (text) node.text = text.slice(0, 200);
    if (el.tagName === 'IMG') { node.src = el.currentSrc || el.src; node.alt = el.alt; node.srcset = el.srcset?.slice(0, 400); node.natural = [el.naturalWidth, el.naturalHeight]; node.loading = el.loading; }
    if (el.tagName === 'VIDEO') { node.src = el.currentSrc || el.src; node.poster = el.poster; node.attrs = { autoplay: el.autoplay, loop: el.loop, muted: el.muted, playsinline: el.playsInline }; }
    if (el.tagName === 'A') node.href = el.getAttribute('href');
    if (el.tagName === 'CANVAS') node.canvas = { w: el.width, h: el.height, data: { ...el.dataset } };
    if (el.tagName.toLowerCase() === 'svg') { node.svgViewBox = el.getAttribute('viewBox'); return node; }
    if (depth < max) node.children = [...el.children].filter((c) => !['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT'].includes(c.tagName)).map((c) => tree(c, depth + 1, max));
    return node;
  };
  const body = document.body;
  const top = [...body.children].filter((c) => !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(c.tagName));
  const headings = [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => ({ tag: h.tagName, text: h.textContent.trim().replace(/\s+/g, ' ').slice(0, 160), y: Math.round(h.getBoundingClientRect().y + scrollY), font: getComputedStyle(h).fontFamily, size: getComputedStyle(h).fontSize, weight: getComputedStyle(h).fontWeight, lh: getComputedStyle(h).lineHeight, ls: getComputedStyle(h).letterSpacing, color: getComputedStyle(h).color }));
  const imgs = [...document.images].map((i) => ({ src: i.currentSrc || i.src, srcset: i.srcset, sizes: i.sizes, alt: i.alt, w: i.width, h: i.height, natural: [i.naturalWidth, i.naturalHeight], y: Math.round(i.getBoundingClientRect().y + scrollY) }));
  const videos = [...document.querySelectorAll('video')].map((v) => ({ src: v.currentSrc || v.src, sources: [...v.querySelectorAll('source')].map((s) => s.src), poster: v.poster, autoplay: v.autoplay, loop: v.loop, muted: v.muted }));
  const iframes = [...document.querySelectorAll('iframe')].map((f) => ({ src: f.src, w: f.width, h: f.height }));
  const canvases = [...document.querySelectorAll('canvas')].map((c) => ({ w: c.width, h: c.height, cls: c.className, parentCls: c.parentElement?.className?.slice?.(0, 200), data: { ...c.dataset }, parentData: { ...c.parentElement?.dataset }, y: Math.round(c.getBoundingClientRect().y + scrollY), rect: c.getBoundingClientRect().toJSON() }));
  const bgImages = [];
  for (const el of document.querySelectorAll('*')) {
    const bi = getComputedStyle(el).backgroundImage;
    if (bi && bi !== 'none' && bi.includes('url(')) bgImages.push({ cls: (el.getAttribute('class') || '').slice(0, 120), bi: bi.slice(0, 400) });
  }
  const svgCount = document.querySelectorAll('svg').length;
  const fonts = [...document.fonts].map((f) => ({ family: f.family, weight: f.weight, style: f.style, status: f.status }));
  const rootVars = {};
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule.selectorText === ':root' || rule.selectorText === ':root,:host' || rule.selectorText === 'html') {
          for (const p of rule.style) if (p.startsWith('--')) rootVars[p] = rule.style.getPropertyValue(p).trim();
        }
      }
    } catch {}
  }
  const keyframes = [];
  for (const sheet of document.styleSheets) {
    try { for (const rule of sheet.cssRules) if (rule.type === 7) keyframes.push(rule.cssText.slice(0, 600)); } catch {}
  }
  const mediaQueries = new Set();
  for (const sheet of document.styleSheets) {
    try { for (const rule of sheet.cssRules) if (rule.media) mediaQueries.add(rule.media.mediaText); } catch {}
  }
  return {
    docHeight: document.documentElement.scrollHeight,
    title: document.title,
    meta: [...document.querySelectorAll('meta[name],meta[property]')].map((m) => [m.getAttribute('name') || m.getAttribute('property'), m.content]),
    top: top.map((el) => tree(el, 0, 7)),
    headings, imgs, videos, iframes, canvases, bgImages, svgCount, fonts, rootVars, keyframes,
    mediaQueries: [...mediaQueries],
  };
});

fs.writeFileSync(`analysis/measurements/structure-${width}.json`, JSON.stringify(data, null, 1));
fs.writeFileSync(`analysis/raw/rendered-${width}.html`, await page.content());
fs.writeFileSync(`analysis/raw/network-${width}.json`, JSON.stringify(network, null, 1));
console.log(`width=${width} docHeight=${data.docHeight} headings=${data.headings.length} imgs=${data.imgs.length} videos=${data.videos.length} canvases=${data.canvases.length} svgs=${data.svgCount} network=${network.length}`);
await browser.close();
