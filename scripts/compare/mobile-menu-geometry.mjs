// Opens the mobile menu on reference and local (390px) and prints item/chevron geometry.
// Usage: node scripts/compare/mobile-menu-geometry.mjs
import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const [label, url] of [['ref', 'https://sentry.io/welcome/'], ['loc', 'http://localhost:3400/']]) {
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await page.waitForTimeout(800);
  await page.locator('header').getByRole('button', { name: /menu/i }).first().tap();
  await page.waitForTimeout(400);
  const rows = await page.evaluate(() => [...document.querySelectorAll('#mobileMenu button, #mobileMenu a')].filter((e) => e.offsetParent).slice(0, 9).map((e) => {
    const r = e.getBoundingClientRect(); const ch = e.querySelector('.chevron'); const cr = ch?.getBoundingClientRect(); const lab = e.querySelector('.label')?.getBoundingClientRect();
    return `${e.innerText.trim().slice(0, 12).padEnd(12)} box ${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)} label.y=${lab ? Math.round(lab.y) : '-'} chev=${cr ? `${Math.round(cr.x)},${Math.round(cr.y)} ${Math.round(cr.width)}` : '-'}`;
  }));
  console.log(label); rows.forEach((r) => console.log('  ' + r));
}
await browser.close();
