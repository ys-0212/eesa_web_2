// Reads the live hero Rive instance (artboard, state machines, inputs, layout) from the page.
// Usage: node scripts/recon/rive.mjs [url]
import { chromium } from 'playwright';
import fs from 'node:fs';
const url = process.argv[2] ?? 'https://sentry.io/welcome/';
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto(url, { waitUntil: 'load', timeout: 90000 });
await page.waitForTimeout(5000);
const info = await page.evaluate(() => {
  const inst = Object.values(window.riveInstances ?? {})[0];
  if (!inst) return { error: 'no instance', hasRive: !!window.Rive };
  const sms = inst.stateMachineNames ?? [];
  return {
    artboard: inst.activeArtboard,
    animations: inst.animationNames,
    stateMachines: sms,
    inputs: sms.flatMap((n) => (inst.stateMachineInputs(n) ?? []).map((i) => ({ sm: n, name: i.name, type: i.type, value: i.value }))),
    playing: inst.isPlaying,
    bounds: inst.bounds,
    layout: inst.layout ? { fit: inst.layout.fit, alignment: inst.layout.alignment } : null,
    canvas: (() => { const c = document.querySelector('canvas[data-needs-rive]'); return { w: c.width, h: c.height, cssW: c.clientWidth, cssH: c.clientHeight, opacity: getComputedStyle(c).opacity }; })(),
  };
});
fs.writeFileSync('analysis/measurements/rive.json', JSON.stringify(info, null, 1));
console.log(JSON.stringify(info, null, 1));
await browser.close();
