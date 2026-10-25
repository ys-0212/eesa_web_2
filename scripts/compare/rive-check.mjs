// Verifies the hero Rive canvas is live: canvas visible, poster removed, and pixels change over time.
// Also checks the reduced-motion fallback keeps the static poster.
// Usage: node scripts/compare/rive-check.mjs [url]
import { chromium } from 'playwright';
const url = process.argv[2] ?? 'http://localhost:3400/';
const browser = await chromium.launch();
for (const reducedMotion of ['no-preference', 'reduce']) {
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion })).newPage();
  const wasm = [];
  page.on('response', (r) => r.url().includes('.wasm') && wasm.push(`${r.status()} ${new URL(r.url()).pathname}`));
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(4000);
  const canvas = page.locator('canvas').first();
  const state = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    return { opacity: getComputedStyle(c).opacity, poster: !!document.querySelector('img.rive-poster'), drawW: c.width, drawH: c.height };
  });
  const a = await canvas.screenshot();
  await page.waitForTimeout(700);
  const b = await canvas.screenshot();
  console.log(reducedMotion, JSON.stringify(state), 'framesDiffer=', !a.equals(b), 'wasm=', wasm.join(', ') || 'none');
}
await browser.close();
