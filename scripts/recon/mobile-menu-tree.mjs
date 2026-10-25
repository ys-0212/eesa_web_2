// Extracts the nested mobile-menu tree (collapsible sections, groups, links) at 390px.
// Usage: node scripts/recon/mobile-menu-tree.mjs [url]  -> analysis/measurements/mobile-menu.json
import { chromium } from 'playwright';
import fs from 'node:fs';
const url = process.argv[2] ?? 'https://sentry.io/welcome/';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
await page.goto(url, { waitUntil: 'load', timeout: 90000 });
const tree = await page.evaluate(() => {
  const walk = (section) => {
    const trigger = section.querySelector(':scope > button');
    const content = section.querySelector(':scope > [id^="content-"]');
    const node = { label: trigger?.innerText.trim(), children: [] };
    if (!content) return node;
    const visit = (el) => {
      for (const c of el.children) {
        if (c.matches('[data-collapsible-section]')) node.children.push(walk(c));
        else if (c.tagName === 'LI' || c.tagName === 'A') {
          const a = c.tagName === 'A' ? c : c.querySelector(':scope > a');
          if (a && !c.querySelector('[data-collapsible-section]')) node.children.push({ text: a.childNodes[0]?.textContent.trim() || a.innerText.trim(), href: a.getAttribute('href'), pill: a.querySelector('.new-pill')?.textContent.trim(), nested: c.classList?.contains('nested-item') || undefined });
          else visit(c);
        } else if (!c.classList.contains("hidden")) {
          // Desktop duplicates are wrapped in `hidden xl:block`; mobile copies are visible.
          visit(c);
        }
      }
    };
    visit(content);
    return node;
  };
  const top = [...document.querySelectorAll('#mobileMenu [data-collapsible-section]')].filter((s) => /^mobile-\d+$/.test(s.dataset.collapsibleSection));
  return top.map(walk);
});
fs.writeFileSync('analysis/measurements/mobile-menu.json', JSON.stringify(tree, null, 1));
const print = (n, d = 0) => { console.log('  '.repeat(d) + (n.label ? `[${n.label}]` : `${n.text}${n.pill ? ' (' + n.pill + ')' : ''}${n.nested ? ' *' : ''} -> ${n.href}`)); (n.children || []).forEach((c) => print(c, d + 1)); };
tree.forEach((t) => print(t));
await browser.close();
