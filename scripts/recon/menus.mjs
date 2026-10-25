// Opens each desktop mega-menu and the mobile menu, extracts structured content + geometry,
// and screenshots every open state.
// Usage: node scripts/recon/menus.mjs [url]
// Writes analysis/measurements/menus.json and analysis/screenshots/interactions/menu-*.png
import { chromium } from 'playwright';
import fs from 'node:fs';

const url = process.argv[2] ?? 'https://sentry.io/welcome/';
const shots = 'analysis/screenshots/interactions';
fs.mkdirSync(shots, { recursive: true });
const browser = await chromium.launch();

const extract = (root) => {
  const cols = [];
  // Desktop variants live in .hidden.xl:block wrappers; fall back to the dropdown itself.
  const groups = root.querySelectorAll('h3');
  groups.forEach((h) => {
    if (!h.offsetParent) return;
    const list = h.parentElement.querySelector('ul');
    cols.push({
      heading: h.textContent.trim(),
      headingColor: getComputedStyle(h).color,
      links: list ? [...list.querySelectorAll(':scope > li')].map((li) => {
        const a = li.querySelector('a');
        return {
          text: a?.childNodes[0]?.textContent.trim() || a?.textContent.trim(),
          href: a?.getAttribute('href'),
          pill: a?.querySelector('.new-pill')?.textContent.trim() || undefined,
          icon: a?.querySelector('img')?.getAttribute('src') || undefined,
          nested: li.classList.contains('nested-item') || undefined,
        };
      }) : [],
    });
  });
  const featured = [...root.querySelectorAll('img')].filter((i) => i.offsetParent && i.width > 100).map((i) => {
    const card = i.closest('a') ?? i.parentElement;
    return { src: i.getAttribute('src'), alt: i.alt, href: card.getAttribute('href'), text: card.innerText.trim(), rect: i.getBoundingClientRect().toJSON() };
  });
  const r = root.getBoundingClientRect();
  const cs = getComputedStyle(root);
  return { rect: { x: r.x, y: r.y, w: r.width, h: r.height }, bg: cs.backgroundColor, radius: cs.borderRadius, shadow: cs.boxShadow, padding: cs.padding, cols, featured };
};

const result = { desktop: {}, mobile: {} };
{
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await page.waitForTimeout(1500);
  result.desktop.topLinks = await page.evaluate(() => [...document.querySelectorAll('header nav > div a, header nav > div button, header nav a.btn-new')].filter((e) => e.offsetParent).map((e) => {
    const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
    return { tag: e.tagName.toLowerCase(), text: e.innerText.trim(), href: e.getAttribute('href'), trigger: e.getAttribute('data-menu-trigger'), cls: e.className, rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, font: `${cs.fontWeight} ${cs.fontSize}/${cs.lineHeight} ${cs.fontFamily.split(',')[0]}`, color: cs.color, ls: cs.letterSpacing };
  }));
  // DOCS / PRICING carry data-menu-trigger too but have no dropdown panel.
  const keys = await page.evaluate(() => [...document.querySelectorAll('[data-menu-trigger]')].filter((e) => e.offsetParent && document.querySelector(`[data-menu-dropdown="${e.getAttribute('data-menu-trigger')}"]`)).map((e) => e.getAttribute('data-menu-trigger')));
  for (const key of keys) {
    const trigger = page.locator(`[data-menu-trigger="${key}"]`).first();
    await trigger.hover();
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${shots}/menu-${key}-hover-1440.png`, clip: { x: 0, y: 0, width: 1440, height: 80 } });
    await trigger.click();
    await page.waitForTimeout(500);
    const data = await page.evaluate(`(${extract.toString()})(document.querySelector('[data-menu-dropdown="${key}"]'))`);
    data.triggerExpanded = await trigger.getAttribute('aria-expanded');
    result.desktop[key] = data;
    await page.screenshot({ path: `${shots}/menu-${key}-open-1440.png` });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
  // Hover states for header CTAs.
  for (const label of ['GET DEMO', 'GET STARTED']) {
    const btn = page.locator('header a.btn-new', { hasText: new RegExp(`^${label}$`, 'i') }).first();
    if (await btn.count()) {
      await btn.hover();
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${shots}/header-${label.replace(' ', '-').toLowerCase()}-hover.png`, clip: { x: 900, y: 0, width: 540, height: 80 } });
    }
  }
}
{
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${shots}/mobile-menu-closed-390.png` });
  await page.tap('#menu-toggle-button');
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${shots}/mobile-menu-open-390.png` });
  result.mobile.sections = await page.evaluate(() => [...document.querySelectorAll('#mobileMenu [data-collapsible-section^="mobile-"]')].filter((s) => /^mobile-\d+$/.test(s.dataset.collapsibleSection)).map((s) => ({ id: s.dataset.collapsibleSection, label: s.querySelector('button')?.innerText.trim(), rect: s.getBoundingClientRect().toJSON() })));
  result.mobile.ctas = await page.evaluate(() => [...document.querySelectorAll('#mobileMenu a')].filter((a) => a.offsetParent && !a.closest('[data-collapsible-section]')).map((a) => ({ text: a.innerText.trim(), href: a.getAttribute('href'), cls: a.className })));
  const first = page.locator('#trigger-mobile-0');
  if (await first.count()) {
    await first.tap();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${shots}/mobile-menu-platform-expanded-390.png` });
    const sub = page.locator('#trigger-mobile-0-col-0-group');
    if (await sub.count()) { await sub.tap(); await page.waitForTimeout(500); await page.screenshot({ path: `${shots}/mobile-menu-products-expanded-390.png` }); }
  }
  result.mobile.headerHeight = await page.evaluate(() => document.querySelector('header').getBoundingClientRect().height);
}
fs.writeFileSync('analysis/measurements/menus.json', JSON.stringify(result, null, 1));
for (const [k, v] of Object.entries(result.desktop)) if (v.cols) console.log(k, JSON.stringify(v.rect), v.bg, 'cols', v.cols.map((c) => `${c.heading}(${c.links.length})`).join(', '), 'featured', v.featured.length);
console.log('mobile sections', result.mobile.sections?.map((s) => s.label).join(' | '));
console.log('mobile ctas', result.mobile.ctas?.map((s) => s.text).join(' | '));
await browser.close();
