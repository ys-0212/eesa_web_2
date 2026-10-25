// Long-lived host: launches the cached Playwright Chromium with a dedicated profile
// (D:\EESA_WEB_2\.rea-browser) and a loopback CDP port so REA can attach to it.
// Usage: node scripts/recon/cdp-host.mjs [url] [width] [height] [port]
import { chromium } from 'playwright';
import path from 'node:path';

const url = process.argv[2] ?? 'https://sentry.io/welcome/';
const width = Number(process.argv[3] ?? 1440);
const height = Number(process.argv[4] ?? 900);
const port = Number(process.argv[5] ?? 9222);
const profile = path.resolve('.rea-browser');

const context = await chromium.launchPersistentContext(profile, {
  headless: true,
  viewport: { width, height },
  args: [`--remote-debugging-port=${port}`, '--remote-debugging-address=127.0.0.1'],
});
const page = context.pages()[0] ?? (await context.newPage());
page.on('console', (m) => console.log(`[console.${m.type()}] ${m.text().slice(0, 300)}`));
const res = await page.goto(url, { waitUntil: 'load', timeout: 90000 });
await page.waitForTimeout(4000);
console.log(`READY port=${port} status=${res?.status()} url=${page.url()} title=${await page.title()}`);

const shutdown = async () => { await context.close(); process.exit(0); };
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
setInterval(() => {}, 1 << 30);
