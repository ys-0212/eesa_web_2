// Scrolls the page in viewport-sized steps so lazy media and scroll-triggered reveals fire.
export async function autoScroll(page, { step, delay = 350 } = {}) {
  const vh = page.viewportSize().height;
  const inc = step ?? Math.round(vh * 0.6);
  let y = 0;
  for (let i = 0; i < 400; i++) {
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    if (y >= h) break;
    y += inc;
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(delay);
  }
  await page.waitForTimeout(800);
}
