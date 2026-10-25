// Pixel-diffs matching interaction-state screenshots (reference-<name>.png vs local-<name>.png).
// Usage: node scripts/compare/interaction-diff.mjs
// Output: analysis/diffs/interactions/<name>.png and analysis/diffs/interactions/summary.json
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const dir = 'analysis/screenshots/interactions';
const out = 'analysis/diffs/interactions';
fs.mkdirSync(out, { recursive: true });
const summary = {};
for (const f of fs.readdirSync(dir).filter((n) => n.startsWith('reference-'))) {
  const name = f.slice('reference-'.length);
  const localFile = path.join(dir, `local-${name}`);
  if (!fs.existsSync(localFile)) continue;
  const a = PNG.sync.read(fs.readFileSync(path.join(dir, f)));
  const b = PNG.sync.read(fs.readFileSync(localFile));
  const w = Math.min(a.width, b.width);
  const h = Math.min(a.height, b.height);
  const ca = new PNG({ width: w, height: h });
  const cb = new PNG({ width: w, height: h });
  PNG.bitblt(a, ca, 0, 0, w, h, 0, 0);
  PNG.bitblt(b, cb, 0, 0, w, h, 0, 0);
  const diff = new PNG({ width: w, height: h });
  const n = pixelmatch(ca.data, cb.data, diff.data, w, h, { threshold: 0.15, alpha: 0.35 });
  fs.writeFileSync(path.join(out, name), PNG.sync.write(diff));
  summary[name] = { mismatchPct: +((n / (w * h)) * 100).toFixed(2), size: `${a.width}x${a.height} vs ${b.width}x${b.height}` };
}
fs.writeFileSync(path.join(out, 'summary.json'), JSON.stringify(summary, null, 1));
for (const [k, v] of Object.entries(summary).sort((x, y) => y[1].mismatchPct - x[1].mismatchPct)) console.log(`${String(v.mismatchPct).padStart(6)}%  ${k}  (${v.size})`);
