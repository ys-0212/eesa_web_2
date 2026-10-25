// Extracts the Getting Started installation snippets (prose + Shiki-highlighted token lines)
// and the section's footer CTA into analysis/measurements/snippets.json.
// Usage: node scripts/recon/snippets.mjs [url]
import { chromium } from 'playwright';
import fs from 'node:fs';

const url = process.argv[2] ?? 'https://sentry.io/welcome/';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto(url, { waitUntil: 'load', timeout: 90000 });
await page.waitForTimeout(1500);
const data = await page.evaluate(() => {
  const select = document.querySelector('select[id^="installation-dropdown"]');
  const options = [...select.options].map((o) => ({ value: o.value, label: o.textContent.trim() }));
  const snippets = [...document.querySelectorAll('.installation-snippet')].map((s) => {
    const blocks = [];
    for (const child of s.children) {
      if (child.classList.contains('code-wrapper')) {
        const lines = [...child.querySelectorAll('code .line')].map((line) => [...line.childNodes].map((n) => ({
          text: n.textContent,
          color: n.nodeType === 1 ? n.style.color || undefined : undefined,
        })).filter((t) => t.text.length));
        blocks.push({ type: 'code', lang: child.querySelector('.code-language')?.textContent.trim(), lines });
      } else {
        blocks.push({ type: 'html', tag: child.tagName.toLowerCase(), html: child.innerHTML.trim() });
      }
    }
    return { id: s.id, docsUrl: s.dataset.docsUrl, blocks };
  });
  const cta = document.querySelector('.footer-cta');
  const sec = select.closest('section');
  const cs = (el) => { const c = getComputedStyle(el); return { bg: c.backgroundColor, color: c.color, font: `${c.fontWeight} ${c.fontSize}/${c.lineHeight} ${c.fontFamily.split(',')[0]}`, padding: c.padding, radius: c.borderRadius, border: c.border, maxW: c.maxWidth, rect: el.getBoundingClientRect().toJSON() }; };
  const active = document.querySelector('.installation-snippet.active');
  return {
    options,
    snippets,
    footerCta: cta ? { html: cta.innerHTML.trim().replace(/\s+/g, ' ') } : null,
    styles: {
      select: cs(select),
      snippet: cs(active),
      snippetP: cs(active.querySelector('p')),
      codeWrapper: cs(active.querySelector('.code-wrapper')),
      codeHeader: cs(active.querySelector('.code-header')),
      codeLang: cs(active.querySelector('.code-language')),
      pre: cs(active.querySelector('pre')),
      code: cs(active.querySelector('code')),
      copyBtn: cs(active.querySelector('.copyCodeButton')),
      imgLeft: cs(sec.querySelector('img[src*="getting-started-img-left"]:not(.md\\:hidden)') ?? sec.querySelector('img')),
      imgRight: cs(sec.querySelector('img[src*="getting-started-img-right"]')),
    },
    imgClasses: [...sec.querySelectorAll('img')].map((i) => ({ src: i.getAttribute('src'), cls: i.className, parentCls: i.parentElement.className })),
  };
});
fs.writeFileSync('analysis/measurements/snippets.json', JSON.stringify(data, null, 1));
console.log('options', data.options.length, 'snippets', data.snippets.length, 'cta', !!data.footerCta);
console.log(JSON.stringify(data.styles, null, 0).slice(0, 3000));
console.log(JSON.stringify(data.imgClasses));
console.log(data.footerCta?.html.slice(0, 600));
await browser.close();
