// Records desktop + mobile interaction videos and state screenshots. Locators are role/text based
// so the same script runs against the reference and the local clone.
// Usage: node scripts/recon/interactions.mjs <url> <label>   (label: reference | local)
// Output: analysis/videos/<label>-{desktop,mobile}.webm, analysis/screenshots/interactions/<label>-*.png,
//         analysis/measurements/interactions-<label>.json
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const url = process.argv[2] ?? 'https://sentry.io/welcome/';
const label = process.argv[3] ?? 'reference';
const shots = 'analysis/screenshots/interactions';
const videos = 'analysis/videos';
fs.mkdirSync(shots, { recursive: true });
fs.mkdirSync(videos, { recursive: true });
const log = { url, label, steps: [] };
const step = (name, extra = {}) => { log.steps.push({ name, t: Date.now(), ...extra }); console.log(label, name, JSON.stringify(extra)); };
const hideRecaptcha = '.grecaptcha-badge{visibility:hidden!important}';

const smoothScrollTo = async (page, target, ms = 1200) => {
  await page.evaluate(async ({ target, ms }) => {
    const start = scrollY; const t0 = performance.now();
    await new Promise((res) => {
      const tick = (now) => {
        const p = Math.min((now - t0) / ms, 1);
        scrollTo(0, start + (target - start) * (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2));
        if (p < 1) requestAnimationFrame(tick);
        else res();
      };
      requestAnimationFrame(tick);
    });
  }, { target, ms });
};
const scrollToEl = async (page, locator, offset = 120) => {
  const box = await locator.evaluate((el) => el.getBoundingClientRect().top + scrollY);
  await smoothScrollTo(page, Math.max(0, box - offset));
  await page.waitForTimeout(500);
};
const clipOf = async (locator, pad = 24) => {
  const b = await locator.boundingBox();
  return b && { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - pad), width: b.width + pad * 2, height: b.height + pad * 2 };
};

const browser = await chromium.launch();

// ---------- Desktop ----------
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: videos, size: { width: 1440, height: 900 } } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await page.addStyleTag({ content: hideRecaptcha });
  await page.waitForTimeout(3500);
  step('loaded');

  // Cursor sweep over the hero illustration (Rive state machine listens to pointer).
  for (const [x, y] of [[200, 760], [500, 720], [720, 780], [960, 740], [1200, 760], [720, 860]]) {
    await page.mouse.move(x, y, { steps: 18 });
    await page.waitForTimeout(250);
  }
  await page.screenshot({ path: `${shots}/${label}-hero-cursor.png` });
  step('hero-cursor');

  const breaks = page.locator('h1 span').first();
  await breaks.hover();
  await page.waitForTimeout(350);
  await page.screenshot({ path: `${shots}/${label}-hero-breaks-hover.png`, clip: await clipOf(page.locator('h1').first()) });
  await page.mouse.move(40, 400);
  await page.waitForTimeout(900);
  step('breaks-hover');

  for (const name of ['Get Started', 'Get Demo']) {
    const btn = page.locator('main').getByRole('link', { name, exact: true }).first();
    await btn.hover();
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${shots}/${label}-hero-${name.replace(' ', '-').toLowerCase()}-hover.png`, clip: await clipOf(btn, 16) });
    step(`hero-${name}-hover`, { bg: await btn.evaluate((e) => getComputedStyle(e).backgroundPosition) });
  }

  const platform = page.locator('header').getByRole('button', { name: /platform/i }).first();
  await platform.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${shots}/${label}-menu-platform.png` });
  step('menu-open', { expanded: await platform.getAttribute('aria-expanded') });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  step('menu-escape', { expanded: await platform.getAttribute('aria-expanded') });

  // Logo river + UFO tractor beam.
  const ufo = page.locator('img[src*="ufo-abduction"]').first();
  await scrollToEl(page, ufo, 250);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${shots}/${label}-logos-a.png` });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${shots}/${label}-logos-b.png` });
  step('logos');

  // Feature cards.
  const card = page.getByRole('heading', { name: 'Monitor in five lines' }).last();
  await scrollToEl(page, page.getByRole('heading', { name: /Developer first/ }).first(), 100);
  await card.hover();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${shots}/${label}-features.png` });
  step('features');

  // Tabbed sections.
  const tabSets = [
    { heading: /Everything.s/, tabs: [/Catch slow queries/, /Map every incident/, /Debug 500/] },
    { heading: /Debugging needs context/, tabs: [/Fixes what.s broken/, /Stops bad code/, /Analyzes every signal/] },
  ];
  for (const [i, set] of tabSets.entries()) {
    await scrollToEl(page, page.getByRole('heading', { name: set.heading }).first(), 80);
    for (const [j, t] of set.tabs.entries()) {
      const btn = page.getByRole('button', { name: t }).first();
      await btn.click();
      await page.waitForTimeout(1100);
      await page.screenshot({ path: `${shots}/${label}-tabs${i}-${j}.png` });
      step(`tabs${i}-${j}`);
    }
  }

  // Getting started: switch platform (1s shrink + 1s expand) and copy.
  const select = page.locator('select').first();
  await scrollToEl(page, select, 300);
  await select.selectOption('python');
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${shots}/${label}-snippet-switching.png` });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${shots}/${label}-snippet-python.png` });
  step('snippet-python');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  // Collapsed snippets keep their copy buttons in the DOM; pick the one that is hit-testable.
  const copyIndex = await page.getByRole('button', { name: 'Copy code' }).evaluateAll((els) => els.findIndex((el) => {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return hit && (hit === el || el.contains(hit));
  }));
  const copy = page.getByRole('button', { name: 'Copy code' }).nth(Math.max(copyIndex, 0));
  if (copyIndex >= 0) {
    const wrapper = copy.locator('xpath=ancestor::*[contains(@class,"code-wrapper")][1]');
    await copy.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${shots}/${label}-snippet-copied.png`, clip: await clipOf(wrapper, 8) });
    step('copied', { clipboard: (await page.evaluate(() => navigator.clipboard.readText().catch(() => ''))).slice(0, 60) });
  }
  await select.selectOption('nextjs');
  await page.waitForTimeout(2300);

  // Newsletter: focus only, never submit.
  const email = page.getByLabel(/your email/i).first();
  await scrollToEl(page, email, 300);
  await email.focus();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${shots}/${label}-newsletter-focus.png` });
  step('newsletter-focus');

  // Footer link hover.
  const footerLink = page.locator('footer').getByRole('link', { name: 'Blog', exact: true }).first();
  await scrollToEl(page, footerLink, 400);
  await footerLink.hover();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${shots}/${label}-footer-hover.png` });
  step('footer-hover');

  // Full slow scroll back to top for the video.
  await smoothScrollTo(page, 0, 4000);
  await page.waitForTimeout(800);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  await smoothScrollTo(page, total, 12000);
  await page.waitForTimeout(500);
  log.desktopErrors = errors;
  const video = page.video();
  await context.close();
  if (video) fs.renameSync(await video.path(), path.join(videos, `${label}-desktop.webm`));
}

// ---------- Mobile ----------
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, recordVideo: { dir: videos, size: { width: 390, height: 844 } } });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await page.addStyleTag({ content: hideRecaptcha });
  await page.waitForTimeout(3000);
  const toggle = page.locator('header').getByRole('button', { name: /menu/i }).first();
  await toggle.tap();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${shots}/${label}-m-menu-open.png` });
  step('m-menu-open', { expanded: await toggle.getAttribute('aria-expanded') });
  await toggle.tap();
  await page.waitForTimeout(500);

  const next = page.getByRole('button', { name: 'Next' }).first();
  await scrollToEl(page, page.getByRole('heading', { name: /Developer first/ }).first(), 60);
  for (let i = 0; i < 2; i++) { await next.tap(); await page.waitForTimeout(700); }
  await page.screenshot({ path: `${shots}/${label}-m-carousel.png` });
  step('m-carousel', { prevDisabled: await page.getByRole('button', { name: 'Previous' }).first().isDisabled() });

  const tab = page.getByRole('button', { name: /Catch slow queries/ }).first();
  await scrollToEl(page, tab, 200);
  await tab.tap();
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${shots}/${label}-m-tabs.png` });
  step('m-tabs');

  const badges = page.getByRole('img', { name: 'HIPAA compliant' }).first();
  await scrollToEl(page, page.getByRole('heading', { name: /Built to be secure/ }).first(), 60);
  await badges.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${shots}/${label}-m-badges.png` });
  step('m-badges');

  await smoothScrollTo(page, 0, 3000);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  await smoothScrollTo(page, total, 14000);
  const video = page.video();
  await context.close();
  if (video) fs.renameSync(await video.path(), path.join(videos, `${label}-mobile.webm`));
}

fs.writeFileSync(`analysis/measurements/interactions-${label}.json`, JSON.stringify(log, null, 1));
await browser.close();
