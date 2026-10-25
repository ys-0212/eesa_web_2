// Full-page + per-viewport screenshots at the four audit widths.
// Usage: node scripts/shared/capture.mjs <url> <outDir> [widths=1440,1024,768,390]
// Output: <outDir>/<w>/full.png, <outDir>/<w>/vp-00.png ... and <outDir>/<w>/meta.json
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { autoScroll } from './scroll.mjs';

const [url, outDir, widthArg] = process.argv.slice(2);
if (!url || !outDir) throw new Error('usage: capture.mjs <url> <outDir> [widths]');
const widths = (widthArg ?? '1440,1024,768,390').split(',').map(Number);
const heights = { 1440: 900, 1024: 768, 768: 1024, 390: 844 };

const browser = await chromium.launch();
for (const width of widths) {
  const height = heights[width] ?? 900;
  const dir = path.join(outDir, String(width));
  fs.mkdirSync(dir, { recursive: true });
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    isMobile: width < 500,
    hasTouch: width < 500,
    reducedMotion: process.env.REDUCED_MOTION ? 'reduce' : 'no-preference',
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 300)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 300)));
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(dir, 'first-load.png') });
  await autoScroll(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1500);
  // Hide third-party overlays that are not part of the page design.
  await page.addStyleTag({ content: '.grecaptcha-badge{visibility:hidden!important}' });
  const docHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const steps = Math.ceil(docHeight / height);
  for (let i = 0; i < steps; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * height);
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(dir, `vp-${String(i).padStart(2, '0')}.png`) });
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(dir, 'full.png'), fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify({ url, width, height, docHeight, steps, overflow, errors }, null, 1));
  console.log(`${width}: docHeight=${docHeight} steps=${steps} overflow=${overflow} errors=${errors.length}`);
  await context.close();
}
await browser.close();
