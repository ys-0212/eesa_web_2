# SPEC — sentry.io/welcome landing-page recreation

Reference: https://sentry.io/welcome/ (captured 2026-10-25, Vercel deployment `dpl_DR2L8gBtxPm6FmE82nU6MrCJB726`,
release `1e7aba5e4245eecf99b4e7f142745ef46dcaf0d3`). Scope: this one page only. Every outbound link points at its
original absolute sentry.io / external URL; no destination pages are built.

> Usage note: all imagery, logos, fonts, the Rive file and copy are the property of Functional Software, Inc. (Sentry)
> and the respective customer brands. They are stored locally **for private study of layout/motion only**. Do not
> deploy or redistribute this project with these assets; replace them via `src/content.ts` + `public/media/` first.

## 0. Evidence index

| Evidence | Path |
|---|---|
| REA target list / page inspection (DOM, scripts, resources) | `analysis/raw/rea-inspect_web_page-1440.json` (REA `inspect_web_page`, target `1271D0420D8C7759D1013D8607DBBA63`) |
| REA bundle analysis | **not obtained** — `analyze_web_bundle` ran >120 s and the REA MCP server then disconnected ("Connection closed"); replaced by Playwright + static reading of the small first-party modules (below) |
| Rendered HTML per width | `analysis/raw/rendered-{1440,1024,768,390}.html` |
| Network inventories | `analysis/raw/network-{w}.json` |
| Section markup (SVG collapsed) | `analysis/raw/sections/00..14.html`, SVGs `analysis/raw/svg-by-id/svg000..115.svg` |
| Stylesheets (study only) | `analysis/raw/css/Layout.CKBeCQbz.css` (+ `.pretty.css`), `AnimatedLogoGrid.Drn3FiRC.css`, `MarketoForm.BX_9vJpz.css`, `inline-styles.css` |
| Behaviour scripts (study only) | `analysis/raw/js/*.js` (FeatureCarousel, tabs, UFO tractor beam, Rive init, dropdowns, copy-code, snippet switch, marketing toggle) |
| Geometry + computed styles | `analysis/measurements/structure-{w}.json`, `content-1440.json`, `menus.json`, `snippets.json`, `backgrounds-1440.json`, `rive.json`, `heading-geometry.md` |
| Screenshots | `analysis/screenshots/reference/{1440,1024,768,390}/{first-load,full,vp-NN}.png` |
| Interaction states | `analysis/screenshots/interactions/reference-*.png`, `menu-*-open-1440.png`, `mobile-menu-*.png` |
| Videos | `analysis/videos/reference-desktop.webm`, `analysis/videos/reference-mobile.webm` |
| Asset manifest | `analysis/assets-manifest.json` |

## 1. Technology identified

| Layer | Finding | Evidence |
|---|---|---|
| Framework | **Astro** (islands: `astro-island`, `/_astro/*` chunks, `astro:after-swap`), React 19 renderer for one island (`MarketoForm`, `client:idle`) | REA script list; `inline-25.js` |
| Hosting | Vercel (`x-vercel-cache`, `/_vercel/image` optimizer) | response headers |
| Styling | **Tailwind CSS v4** (`@layer theme`, `--color-*`, `--text-*--line-height`), Astro-scoped component CSS (`data-astro-cid-*`), CSS-module Marketo form | Layout CSS |
| Animation | **Rive** (`@rive-app/canvas@2.38.5`, WASM from unpkg) for the hero; everything else is hand-written CSS keyframes/transitions + small vanilla JS (IntersectionObserver, rAF lerp). **No GSAP / Framer Motion / Lenis.** | `rive.CzeTxTEJ.js`, `Welcome.astro…js`, `inline-18/19.js` |
| Code highlighting | Shiki (github-dark token colours) pre-rendered at build | `snippets.json` |
| Fonts | Dammit Sans 0.3 Bold (OTF, self-hosted), Rubik 400/500/italic (woff2/woff); code stack `Monaco/IBM Plex Mono…` (IBM Plex not loaded) | `document.fonts`, @font-face |
| Third-party | Plausible, Sentry SDK, reload.getsentry.net, Marketo + reCAPTCHA (invisible) | network |

The clone uses **Next.js 16 App Router + React 19 + Tailwind v4 + TypeScript**, `@rive-app/canvas@2.38.5` (the same runtime, WASM served locally), and ports the vanilla behaviours to React hooks in `lib/animations/`. No analytics, Marketo, reCAPTCHA or Sentry SDK are included.

## 2. Design tokens

Breakpoints (Tailwind theme override): `sm 576px`, `md 768px`, `lg 992px`, `xl 1152px`. Header switches desktop↔menu at **xl (1152)**.

Container: `width:100%; margin:auto; padding:0 2rem; max-width: 576 / 768 / 992 / 1152px` at sm/md/lg/xl.

| Token | Value | Use |
|---|---|---|
| rich-black | `#1f1633` | body/header/footer bg |
| utility-black | `#181225` | section fade colour |
| logo-fade | `#191328` (≥992), `#1c162e` (<992) | logo river edge gradients |
| alt-dk-blurple | `#422082` | select, newsletter form panel |
| code bg | `#150f23` | snippet code wrapper |
| blurple | `#6a5fc1` | pills, focus, subnav hover, dropdown links |
| dk-blurple | `#4e2a9a` | nested bullet |
| inactive rail | `#7553ff` | tab rails |
| hot-pink | `#fd44b0` | accent words, footer headings |
| lime | `#c2ef4e` | gradient end, newsletter legal text |
| lt-pink `#fa7faa`, salmon `#ff9691`, lt-orange `#ffb287` | primary-dark sweep / secondary border |
| dk-pink `#c83852`, magenta `#b44092`, md-violet `#584674`, lt-violet `#79628c` | gradients, toggle |
| gray-3 | `#cfcfdb` | footer copyright |
| featured-light | `#f9f8ff` | dropdown right column |
| text-primary (light surfaces) | `#362d59` | dropdown headings, default btn |

Typography

| Role | Family | Size / line-height (mobile → md+) | Weight |
|---|---|---|---|
| H1 hero | Dammit Sans | 3.13688rem/1.2 → 5.5rem/1.2 (50.19 → 88px) | 700 |
| H2 section | Dammit Sans | 2.8125rem/1.15 → 3.75rem/1.1 (45 → 60px), `mb-[2.178rem]` | 700 → 500 |
| Section subtitle | Rubik | 1.6875rem/1.25 (27px) medium (getting-started 1.375rem → 1.6875rem) | 500 |
| Hero subtitle | Rubik | 1.25rem → 1.875rem (text-xl → text-3xl) | 400 |
| Card H3 | Rubik | 1.5rem/1.25 | 500 |
| Tab text | Rubik | 1.275rem → 1.5rem (lg) /1.25 | 400 |
| Testimonial quote | Rubik italic | 1.25rem / leading-tight | 400 |
| Nav / footer links | Rubik | 14px/18px uppercase | 500 |
| Buttons (`btn-new`) | Rubik | 14px/16px uppercase, h 40px, px 16, radius 8 | 700 |
| Code | Monaco, "IBM Plex Mono", Consolas, monospace | 16px/24px | 400 |

Body default: Rubik 16px/1.5 white on rich-black (`--text-primary:#fff` in dark scope).

## 3. Section inventory (original order) & component hierarchy

Desktop y/height at 1440 (doc height **8809**); 1024 = 9312, 768 = 8897, 390 = 10798.

| # | Section | y / h @1440 | Component(s) | Notes |
|---|---|---|---|---|
| 0 | Skip link | – | `ui/SkipLink` | sr-only until focus |
| 1 | Header (sticky, 72px) | 0 / 72 | `sections/SiteHeader`, `ui/MegaMenu`, `ui/MobileMenu`, `ui/SentryLogo` | 3 click-dropdowns (Platform, Solutions, Resources) + Docs/Pricing/Sign In + Get Demo (secondary-dark) + Get Started (primary-dark). <1152: MENU button + nested accordion |
| 2 | Marketing-mode toggle (fixed) | top 6.25rem right .75rem | `ui/MarketingToggle` | ≥768: label + ON track; <768: 24×48 pill with bot icon. Navigates to `https://sentry.io/no-marketing-mode/` |
| 3 | Hero | 72 / 1135 | `sections/Hero`, `ui/RiveCanvas` | promo snackbar → H1 with swinging "breaks," → subtitle → 2 CTAs → Rive canvas 1366×540 (`xl:w-[1366px]`, aspect 1366/540) with poster crossfade |
| 4 | Logo river + UFO | 1207 / 672 | `sections/LogoRiver` | 22 inline-SVG customer logos, duplicated row, `scroll-x` 60 s reverse, UFO image 15rem, tractor-beam lift |
| — | BG wrapper A (hero+logos) | 72 / 1807 | `ui/BackgroundLayer` | `welcome-bg.webp` 65rem top-center, fade-bottom 30% → `#181225` |
| 5 | Developer first. Always. | 1879 / 947 | `sections/DeveloperFirst`, `ui/FeatureCard`, `ui/FeatureCarousel` | 2×2 grid (≥992), snap carousel + prev/next (<992). BG: gradient `#1F1633→#30145F` over 200px tiled `middle-bg-texture` (darken), fade top+bottom 30% |
| 6 | Everything's connected | 2826 / 999 | `sections/TabbedFeature` | subtitle with 6 links, h3 "Go from Issue → Context → Fix.", 3 tabs + 3 images (`tabs-a-*`) |
| 7 | Debugging needs context — with or without AI | 3825 / 989 | `sections/TabbedFeature` | Seer subtitle, 3 tabs + `tabs-b-*` |
| — | BG wrapper B (6+7) | 2826 / 1988 | `ui/BackgroundLayer` | welcome-bg, fade top+bottom 25% |
| 8 | Loved by developers worldwide | 4814 / 655 | `sections/Testimonials` | 3 columns ≥1152 (stacked below), quote mark png, white circular logo chips. Wrapper fade-top 30% |
| 9 | Get started in minutes | 5469 / 834 | `sections/GettingStarted`, `ui/CodeBlock` | subtitle, `<select>` (23 platforms), animated snippet swap, copy button, left/right illustrations. BG radial glow |
| 10 | Built to be secure | 6304 / 603 | `sections/Security` | paragraph, 4 compliance SVG badges (drag-scroll + fades <1024), 2 buttons (default, secondary-dark) |
| 11 | Newsletter | 6907 / 461 | `sections/Newsletter` | dark form panel `#422082`, email + consent + legal (lime italic) + Sign Up; 404 cartoon overlapping bottom-right. **Submit is intercepted locally (no network)** |
| 12 | Fix It (final CTA) | 7528 / 538 | `sections/FinalCta` | centered H2, 27px copy, Try Sentry for Free + Get a Demo |
| 13 | Footer | 8066 / 743 | `sections/SiteFooter` | 4 link columns (pink headings), wavy divider SVG, legal links, Sentry + Open Source Pledge marks, 4 social icons, © line |

## 4. Asset manifest

All files were downloaded from their original URLs (see `analysis/assets-manifest.json` for source URL, bytes, sha256).
Vercel-optimized images were fetched as their **un-resized `/_astro/` originals**.

| Local path (`public/media/…`) | Original | Used in | Dimensions |
|---|---|---|---|
| `rive/home-hero-scanner-animation.riv` | `/astro-assets/rive-files/…riv` | Hero | artboard 1366×540 |
| `rive/rive.wasm` | `@rive-app/canvas@2.38.5/rive.wasm` (npm package; reference loads from unpkg) | Hero runtime | – |
| `images/hero-animation-poster.webp` | `/_astro/hero-animation-poster.lNyp05dq.webp` | Hero poster before Rive loads | 1366×540 |
| `images/welcome-bg.webp` | `/_astro/welcome-bg.BcYKCM6C.webp` | BG wrappers A/B | 1366×2732 |
| `images/middle-bg-texture.webp` | `/_astro/middle-bg-texture.Bj4JNsdD.webp` | Developer-first BG tile | tiled 200px |
| `images/ufo-abduction-image.webp` | `/_astro/ufo-abduction-image…` | Logo river | 900×1151 → 15rem |
| `images/install-1-line.webp`, `automatic-rca.webp`, `agent-tracing.webp`, `mcp-integration.webp` | `/_astro/*` | Feature cards | 800×267 |
| `images/tabs-a-{1,2,3}.webp`, `tabs-b-{1,2,3}.webp` | `/_astro/*` | Tabbed sections | 1200×800 |
| `images/quotemark.png` | `/_astro/quotemark…png` | Testimonials | 46×26 |
| `images/Frame_1__2_.webp` (Anthropic), `logo.png` (Disney+), `logo-instacart.webp` | `/_astro/*` | Testimonial chips | – |
| `images/getting-started-img-left.webp`, `-right.webp` | `/_astro/*` | Getting started | 466×410, 456×392 |
| `images/home-spot-404.webp` | `/_astro/home-spot-404…` | Newsletter | 640×341 |
| `images/automated-debugging.webp` | `/astro-assets/nav-icons/…` | Resources dropdown card | 672×284 |
| `images/github.png`, `slack.png`, `x-twitter.png`, `linkedin.png`, `discord.png` | `/astro-assets/nav-icons/*` | Platform menu, footer social (`brightness-0 invert`) | 48/16 px |
| `images/home-hero-meta.webp` | `/_astro/home-hero-meta…` | OpenGraph image | 1200×630 |
| `fonts/dammitsansv0.3-bold.otf`, `rubik-latin-{regular,500,italic,500italic}.woff2/.woff` | `/astro-assets/fonts/*` | `@font-face` | – |
| Inline SVGs (logo, chevrons, 22 customer logos, 4 compliance badges, wave divider, OSP mark, copy icon, carousel arrows, bot icon) | inline in HTML | `components/ui/icons/*.tsx` (generated from `analysis/raw/svg-by-id/`) | – |

Substitutions: **none planned for imagery**. Rubik 700 is not served by the reference (browser synthesises bold from 500); same in clone. The code font stack is kept (IBM Plex Mono is not loaded by the reference either). Marketo form is replaced by a static, non-submitting equivalent; reCAPTCHA omitted.

## 5. Animation catalog

| Element | Trigger | Spec |
|---|---|---|
| Hero Rive | WASM ready + canvas ≥25% in viewport (IO threshold 0.25) | `new Rive({src, canvas, stateMachines:'State Machine 1', autoplay:false})`; play/pause on intersection; `resizeDrawingSurfaceToCanvas()` on load; canvas `opacity 0 → 1` `500ms ease` while poster fades out (`.rive-poster--hidden`, 500ms) and is removed; pointer events only ≥992 (`lg:pointer-events-auto`). 7 looping timelines (body movin, arm movin, gadget movin, sparks1/2, jetpack flame…). Requires WebGL; otherwise poster stays |
| "breaks," | page load | `swingDown` 0.75s ease: hold 0→60%, then rotate to −8°, settle −7.5° with damped wobble; `transform-origin:100% 100%`, rests at −7.5° |
| "breaks," | mouseenter (1500 ms cooldown) | `.push-up` → `pushUp` 0.5s rotate(−7.5°→0); mouseleave removes class → `swingDown` replays |
| Buttons primary-dark / secondary-dark / new-pill | hover | gradient `background-size:250% 100%`, `background-position 98% 0 → 2% 0`, `transition .2s`; secondary-dark border (`::before` masked gradient) fades `opacity .2s`; focus: solid `#ffb287`, 2px outline offset 2px |
| Snackbar | hover | bg `#6a5fc1 → #554c9a` `.2s ease-out` |
| Logo river | continuous | `scroll-x` linear infinite `60s`, direction **reverse**, translate `-50% - gap/2`, gap 3.5rem; paused under reduced motion |
| UFO tractor beam | IO (0.25) on `#logo-river`, starts 1.5 s after DOM ready | rAF loop: beam centre = UFO centre −15px, width 90px; lift = (1−d/90)·90px; ascend lerp `1-(1-0.09)^dt`; descend `easeOutCubic` 1200 ms; `.lifting` → `logo-rock` 2s cubic-bezier(.25,.46,.45,.94) .4s infinite (±1°); un-lift transition `transform .8s ease-out`; paused off-screen; disabled under reduced motion |
| Feature carousel (<992) | prev/next click / scroll | scroll-snap x mandatory, smooth; item `calc(100% + 3rem)` (<768) / `calc(50% + 1rem)`; edge gradients 5rem `#1f1633f2→0` fade `.3s`; button disabled state opacity .25; aria-live "Showing item n of 4" |
| Tabs | click | active item: text opacity .4 → 1 (`.3s`), gradient rail (`#FD44B0→#C2EF4E`) opacity 0→1 over `#7553FF` rail; desktop images crossfade opacity `.3s ease-in-out` (inactive absolute); mobile: `max-height 0→20rem .6s`, margin `.6s`, opacity `.4s`; container `.float-active` → `float` 1s ease-in-out (translateY −0.75rem) |
| Snippet switch | select `input` | current `.shrinking` → `shrinkSnippet` 1s ease-in-out (opacity 1→0, max-height 100rem→0) → after 1000 ms next `.active` → `expandSnippet` 1s; first render `.initial-load` without animation |
| Copy code | click | clipboard write; "Copied!" fades in (`opacity .15s`) for 2000 ms while button hidden; focus restored |
| Mega menu | click / Enter / Space | toggles `hidden`; accordion (one open); Escape and outside click close; trigger `aria-expanded`; chevron rotates 90° |
| Mobile menu | MENU click | `#mobileMenu.nav-expanded` display block; header `max-height:100vh; overflow-y:auto`; nested collapsibles (chevron 90°); Escape closes |
| Marketing toggle | hover | bg `#ffffff2e → #ffffff47`, shadow grow `.2s`; wrapper `scale(1.02)` |
| Footer / nav links | hover | underline; `transition-colors .2s` |
| Header | – | sticky `top:0`, `transition-all .2s` (no scroll-state change observed) |
| Scroll reveals | – | **none observed** (no IO-based fade-ups on this page) |
| Reduced motion | `prefers-reduced-motion: reduce` | logo row paused, tractor beam off, carousel `scroll-behavior:auto`; clone additionally stops "breaks," swing, Rive autoplay (poster shown), tab float, snippet keyframes |

## 6. Interaction inventory

| Interaction | Behaviour to reproduce | Side effects avoided |
|---|---|---|
| Header dropdowns (3) | click-to-toggle panels (white, radius 0.75rem, shadow-lg, anchored at nav list left, top 3rem) | – |
| DOCS / PRICING / SIGN IN / GET DEMO / GET STARTED | plain links to original URLs | not followed in tests |
| MENU (<1152) | expands full-width accordion: PLATFORM / SOLUTIONS / RESOURCES (collapsible) + DOCS, PRICING, SIGN IN, GET DEMO, GET STARTED | – |
| Logo right-click | original redirects to /branding/ — **not reproduced** (navigation side effect) | – |
| Marketing toggle | link to no-marketing-mode (external) | not followed |
| Promo snackbar | external link (mcp.sentry.dev, new tab) | – |
| Feature carousel | prev/next + swipe | – |
| Tabs (×2) | click / keyboard | – |
| Platform select | 23 options; swaps snippet with shrink/expand | – |
| Copy code | copies `<pre>` text | clipboard only |
| Security badges | horizontal drag-scroll + fade masks <1024 | – |
| Newsletter | HTML5 validation (email required, consent required); submit **prevented**, shows inline local confirmation; nothing sent | no Marketo/reCAPTCHA |
| Footer | links only | – |

## 7. Key measurements (1440 unless noted)

- Header 72px (py-4, logo h-8 = 32px tall, 200×44 viewBox). Nav item buttons 40px tall; DOCS x=741 w=75, PRICING 825/94, SIGN IN 927/88, GET DEMO 1023/103, GET STARTED 1134/130.
- Dropdown panels at x=321, y=64: Platform 545×590, Solutions 336×588, Resources 768×403 (featured image 336×142).
- Hero: container `pt-16 pb-16` (md), snackbar `mb-2rem` (+ gap-4), H1 `mb-6`, subtitle `md:max-w-[60%] md:mb-[2.8125rem]`; CTA row gap-4; Rive box `xl:w-[1366px]`, aspect 1366/540 (top at y≈603 inside section).
- Logo section `pt-32 pb-32` (lg), wrapper `padding:2.5rem 0`, UFO 15rem wide with `margin-bottom:-2.17647rem`, logo items 4rem tall; per-logo `--logo-max-height` (1.25–3rem).
- Feature cards: grid 2 cols, gap 3rem; image frame `p-[0.125rem]` gradient, inner radius 0.6625rem, aspect 3/1; card H3 pt-6.
- Tabs: subtitle `md:max-w-[70%] md:mb-[5.1875rem]`; columns 41.67% / 58.33% with `md:gap-[4rem]`, list gap 2.5rem, rail 4px, button pl-4; images radius 1.125rem, 597×398 at 1440.
- Getting started: select `md:max-w-[21.8125rem]` 349×40, radius 8px, bg `#422082`; snippet max-w 59.3125rem (949px); code header 41px, pre padding `24px 24px 24px 44px`; illustrations 15.5rem / 14.4375rem at `top-[10rem]`, `md:-left-[14rem] xl:-left-[10rem]`, `md:-right-[13.5rem] xl:-right-[9.5rem]`.
- Security: badges max-h 6.25rem, gap 2rem; text column lg 58.33%.
- Newsletter: form max-w 41rem, `p-6`, radius .5rem; 404 image lg `max-w-[50.18rem]` absolute `xl:right-[15rem] xl:-bottom-[15rem] translate-x-[calc(50%-1rem)]`; wrapper `mb-[10rem]`.
- Footer: columns `py-16 md:pb-12 lg:gap-[3rem]`, list `gap-y-5`, wave SVG, bottom row `py-8`.
- Heading y-positions per width: `analysis/measurements/heading-geometry.md`.

## 8. Implementation notes

- Content (copy, links, alt text, asset paths, menus, snippets) lives in `src/content.ts`; snippets are generated from `analysis/measurements/snippets.json` into `src/snippets.ts` (token colours preserved).
- Inline SVGs are converted to React components (attribute camel-casing) by `scripts/media/svg-to-tsx.mjs`.
- The reference's Tailwind class lists are re-authored by hand in JSX; component CSS (buttons, keyframes, logo river, tabs) is rewritten in `app/globals.css` from the measured values — no compiled bundle or stylesheet is copied.
