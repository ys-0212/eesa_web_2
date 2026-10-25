import { expect, test, type Page } from '@playwright/test';

const SECTION_HEADINGS = [
  'Code breaks, fix it faster',
  'Developer first. Always.',
  'Everything’s connected',
  'Debugging needs context— with or without AI',
  'Loved by developers worldwide',
  'Get started in minutes',
  'Built to be secure, Designed to not get in your way',
  'Get monthly product updates from our newsletter',
  'Fix It',
];

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1440) < 1152;

test.describe('page integrity', () => {
  test('renders every section in the reference order with no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto('/');
    const headings = await page.locator('main h1, main h2').allTextContents();
    expect(headings.map((h) => h.replace(/\s+/g, ' ').trim())).toEqual(SECTION_HEADINGS);
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    await page.waitForTimeout(1500);
    expect(errors).toEqual([]);
  });

  test('loads all media locally and makes no third-party requests', async ({ page }) => {
    const foreign: string[] = [];
    const failed: string[] = [];
    page.on('request', (r) => {
      if (!r.url().startsWith('http://localhost:3400') && !r.url().startsWith('data:')) foreign.push(r.url());
    });
    page.on('response', (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url()}`));
    await page.goto('/');
    // Scroll through so lazy images load.
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 600) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(60);
    }
    await page.waitForLoadState('networkidle');
    expect(failed).toEqual([]);
    expect(foreign).toEqual([]);
    const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.offsetParent && i.naturalWidth === 0).map((i) => i.src));
    expect(broken).toEqual([]);
  });

  test('has no horizontal overflow at the audited widths', async ({ page }) => {
    for (const width of [1440, 1024, 768, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `overflow at ${width}px`).toBeLessThanOrEqual(0);
    }
  });

  test('every link is an absolute external URL or an in-page anchor', async ({ page }) => {
    await page.goto('/');
    const hrefs = await page.locator('a[href]').evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''));
    expect(hrefs.length).toBeGreaterThan(100);
    for (const h of hrefs) expect(h, h).toMatch(/^(https:\/\/|#)/);
  });
});

test.describe('navigation', () => {
  test('desktop mega menus toggle by click, Escape and outside click', async ({ page }) => {
    test.skip(isMobile(page), 'desktop only');
    await page.goto('/');
    const platform = page.getByRole('button', { name: 'Platform' });
    await platform.click();
    await expect(platform).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#menu-platform')).toBeVisible();
    await expect(page.locator('#menu-platform').getByRole('link', { name: 'Error Monitoring' })).toHaveAttribute('href', 'https://sentry.io/product/error-monitoring/');

    // Accordion: opening another closes the first.
    await page.getByRole('button', { name: 'Resources' }).click();
    await expect(page.locator('#menu-platform')).toBeHidden();
    await expect(page.locator('#menu-resources').getByRole('link', { name: 'Automate Your Debugging' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('#menu-resources')).toBeHidden();

    await page.getByRole('button', { name: 'Solutions' }).click();
    await expect(page.locator('#menu-solutions')).toBeVisible();
    await page.mouse.click(40, 600);
    await expect(page.locator('#menu-solutions')).toBeHidden();
  });

  test('desktop menus open from the keyboard', async ({ page }) => {
    test.skip(isMobile(page), 'desktop only');
    await page.goto('/');
    const platform = page.getByRole('button', { name: 'Platform' });
    await platform.focus();
    await page.keyboard.press('Enter');
    await expect(platform).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(platform).toHaveAttribute('aria-expanded', 'false');
  });

  test('mobile menu expands a nested accordion', async ({ page }) => {
    test.skip(!isMobile(page), 'mobile only');
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Menu' });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const menu = page.locator('#mobileMenu');
    await menu.getByRole('button', { name: 'Platform' }).click();
    await menu.getByRole('button', { name: 'Products' }).click();
    await expect(menu.getByRole('link', { name: 'Error Monitoring' })).toBeVisible();
    await menu.getByRole('button', { name: 'Seer' }).click();
    await expect(menu.getByRole('link', { name: 'AI Code Review' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeHidden();
  });
});

test.describe('interactions', () => {
  test('feature tabs switch the active item and image', async ({ page }) => {
    await page.goto('/');
    const tab = page.getByRole('button', { name: /Catch slow queries/ });
    await tab.click();
    await expect(tab).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: /Debug 500/ })).toHaveAttribute('aria-pressed', 'false');
    if (!isMobile(page)) await expect(page.locator('img.tab-desktop-img.active[src*="tabs-a-2"]')).toBeVisible();
    else await expect(page.locator('.tab-mobile-img-wrapper.active img[src*="tabs-a-2"]')).toBeVisible();
  });

  test('platform select swaps the snippet and copy writes the command', async ({ page, context, browserName }) => {
    await page.goto('/');
    await page.locator('select').selectOption('python');
    await expect(page.locator('#snippet-python.active')).toBeVisible({ timeout: 4000 });
    await expect(page.locator('#snippet-python')).toContainText('pip install --upgrade sentry-sdk');
    if (browserName === 'chromium') {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await page.locator('#snippet-python').getByRole('button', { name: 'Copy code' }).first().click();
      await expect(page.locator('#snippet-python').getByRole('status').first()).toHaveText('Copied!');
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('pip install --upgrade sentry-sdk');
    }
  });

  test('mobile feature carousel steps and updates button states', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 1440) >= 992, 'carousel only below 992px');
    await page.goto('/');
    const prev = page.getByRole('button', { name: 'Previous', exact: true });
    const next = page.getByRole('button', { name: 'Next', exact: true });
    await expect(prev).toBeDisabled();
    await next.click();
    await expect(prev).toBeEnabled();
    await expect(page.getByText(/Showing item 2 of 4/)).toBeAttached();
  });

  test('newsletter validates and never submits over the network', async ({ page }) => {
    const posts: string[] = [];
    page.on('request', (r) => r.method() !== 'GET' && posts.push(`${r.method()} ${r.url()}`));
    await page.goto('/');
    const email = page.getByLabel('Your Email:');
    const submit = page.getByRole('button', { name: 'Sign Up' });
    await submit.click();
    expect(await email.evaluate((e: HTMLInputElement) => e.validity.valid)).toBe(false);
    await email.fill('dev@example.com');
    await page.getByLabel(/I want to receive the monthly newsletter/).check();
    await submit.click();
    await expect(page.getByText(/Local demo/)).toBeVisible();
    expect(posts).toEqual([]);
  });
});

test.describe('accessibility & motion', () => {
  test('skip link is first in tab order and visible on focus', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skip).toBeFocused();
    const box = await skip.boundingBox();
    expect(box && box.width > 10 && box.height > 10).toBeTruthy();
  });

  test('buttons show a visible focus outline from the keyboard', async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('main').getByRole('link', { name: 'Get Started', exact: true }).first();
    await cta.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    const outline = await cta.evaluate((e) => getComputedStyle(e).outlineWidth);
    expect(parseFloat(outline)).toBeGreaterThan(0);
  });

  test('reduced motion keeps the Rive poster and pauses the logo river', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto('/');
    await page.waitForTimeout(2500);
    await expect(page.locator('img.rive-poster')).toBeVisible();
    expect(await page.locator('.logo-row').evaluate((e) => getComputedStyle(e).animationPlayState)).toBe('paused');
    expect(await page.locator('.swing-word').evaluate((e) => getComputedStyle(e).animationName)).toBe('none');
    await context.close();
  });

  test('hero Rive animation loads from local WASM and replaces the poster', async ({ page }) => {
    test.skip(isMobile(page), 'checked once on desktop');
    const wasm: string[] = [];
    page.on('response', (r) => r.url().endsWith('.wasm') && wasm.push(`${r.status()} ${new URL(r.url()).pathname}`));
    await page.goto('/');
    await expect(page.locator('canvas')).toHaveCSS('opacity', '1', { timeout: 10_000 });
    expect(wasm).toEqual(['200 /media/rive/rive.wasm']);
  });
});
