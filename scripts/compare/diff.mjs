// Pixel diff of reference vs local screenshots (pixelmatch + pngjs).
// Usage: node scripts/compare/diff.mjs [refDir=analysis/screenshots/reference] [localDir=analysis/screenshots/local]
// Output: analysis/diffs/<w>/<name>.png (red = differing pixels) and analysis/diffs/summary.json
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const refDir = process.argv[2] ?? 'analysis/screenshots/reference';
const locDir = process.argv[3] ?? 'analysis/screenshots/local';
const outDir = 'analysis/diffs';
const widths = ['1440', '1024', '768', '390'];

const crop = (png, w, h) => {
  const out = new PNG({ width: w, height: h });
  PNG.bitblt(png, out, 0, 0, w, h, 0, 0);
  return out;
};

const summary = {};
for (const w of widths) {
  const r = path.join(refDir, w);
  const l = path.join(locDir, w);
  if (!fs.existsSync(r) || !fs.existsSync(l)) continue;
  fs.mkdirSync(path.join(outDir, w), { recursive: true });
  const names = fs.readdirSync(r).filter((f) => f.endsWith('.png') && fs.existsSync(path.join(l, f)));
  summary[w] = {};
  for (const name of names) {
    const a = PNG.sync.read(fs.readFileSync(path.join(r, name)));
    const b = PNG.sync.read(fs.readFileSync(path.join(l, name)));
    const width = Math.min(a.width, b.width);
    const height = Math.min(a.height, b.height);
    const ca = crop(a, width, height);
    const cb = crop(b, width, height);
    const diff = new PNG({ width, height });
    const n = pixelmatch(ca.data, cb.data, diff.data, width, height, { threshold: 0.15, alpha: 0.35, includeAA: false });
    fs.writeFileSync(path.join(outDir, w, name), PNG.sync.write(diff));
    summary[w][name] = { mismatchPct: +((n / (width * height)) * 100).toFixed(2), compared: `${width}x${height}`, refHeight: a.height, localHeight: b.height };
  }
}
fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 1));
for (const [w, files] of Object.entries(summary)) {
  const vps = Object.entries(files).filter(([n]) => n.startsWith('vp-'));
  const avg = vps.reduce((s, [, v]) => s + v.mismatchPct, 0) / Math.max(vps.length, 1);
  console.log(`${w}: full=${files['full.png']?.mismatchPct}% first-load=${files['first-load.png']?.mismatchPct}% viewport-avg=${avg.toFixed(2)}% | ` + vps.map(([n, v]) => `${n.slice(3, 5)}:${v.mismatchPct}`).join(' '));
}
