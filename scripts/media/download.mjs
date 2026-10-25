// Downloads the landing page's original media into public/media and writes
// analysis/assets-manifest.json (source URL -> local path, bytes, sha256).
// For Vercel-optimized images it first tries the un-resized /_astro/ original.
// Usage: node scripts/media/download.mjs
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ORIGIN = 'https://sentry.io';
const widths = [1440, 1024, 768, 390];
const urls = new Set();
for (const w of widths) {
  for (const r of JSON.parse(fs.readFileSync(`analysis/raw/network-${w}.json`, 'utf8'))) {
    const u = new URL(r.url);
    if (u.hostname !== 'sentry.io') continue;
    if (!['image', 'font', 'fetch', 'media'].includes(r.type)) continue;
    urls.add(r.url.replace(/[?&]dpl=[^&]*/, ''));
  }
}
// Extra assets referenced by the DOM/CSS but not always requested at capture time.
for (const extra of (process.env.EXTRA_ASSETS ?? '').split(',').filter(Boolean)) urls.add(extra);

const folderFor = (file, mime) => {
  if (/\.(woff2?|otf|ttf)$/.test(file)) return 'fonts';
  if (/\.riv$/.test(file)) return 'rive';
  if (/nav-icons/.test(file)) return 'icons';
  if (/\.svg$/.test(file) || mime.includes('svg')) return 'svg';
  return 'images';
};

const manifest = [];
for (const raw of urls) {
  const u = new URL(raw);
  let candidates = [raw];
  let file = path.basename(u.pathname);
  if (u.pathname === '/_vercel/image') {
    const inner = u.searchParams.get('url');
    file = path.basename(inner);
    candidates = [`${ORIGIN}/${inner.replace(/^\//, '')}`, raw];
  }
  // Strip Astro content hash: tabs-a-1.3EhRDHX9.webp -> tabs-a-1.webp
  const clean = file.replace(/\.[A-Za-z0-9_-]{8}(\.[a-z0-9]+)$/, '$1');
  let ok = null;
  for (const c of candidates) {
    const res = await fetch(c);
    if (res.ok) { ok = { url: c, res }; break; }
  }
  if (!ok) { manifest.push({ source: raw, error: 'not downloadable' }); console.log('FAIL', raw); continue; }
  const mime = ok.res.headers.get('content-type') ?? '';
  const buf = Buffer.from(await ok.res.arrayBuffer());
  const rel = path.posix.join('media', folderFor(clean, mime), clean);
  fs.mkdirSync(path.dirname(path.join('public', rel)), { recursive: true });
  fs.writeFileSync(path.join('public', rel), buf);
  manifest.push({
    source: raw,
    fetchedFrom: ok.url,
    local: '/' + rel,
    mime,
    bytes: buf.length,
    sha256: crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16),
  });
  console.log('OK  ', String(buf.length).padStart(8), '/' + rel, ok.url === raw ? '' : '(original)');
}
fs.writeFileSync('analysis/assets-manifest.json', JSON.stringify(manifest, null, 1));
