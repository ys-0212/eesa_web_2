# COMPARISON — reference (sentry.io/welcome) vs local clone (localhost:3400)

Captured 2026-10-25 with Playwright 1.64.1 / Chromium 156.0.8078.4 (headless, DPR 1 unless noted).
Reproduce: `npm run build && npm start`, then `npm run capture:local`, `npm run diff`,
`node scripts/compare/geometry.mjs`, `node scripts/recon/interactions.mjs http://localhost:3400/ local`,
`node scripts/compare/interaction-diff.mjs`.

> This is a close visual recreation, **not** a pixel-identical copy. All numbers below are measured; nothing
> here claims exact fidelity.

## 1. Page-level results

| Width × height | Doc height ref → local | Full-page mismatch | Viewport avg mismatch | Horizontal overflow | Console errors (local) |
|---|---|---|---|---|---|
| 1440 × 900 | 8809 → 8809 | 0.64 % | 0.53 % | 0 | 0 |
| 1024 × 768 | 9312 → 9312 | 0.44 % | 0.49 % | 0 | 0 |
| 768 × 1024 | 8897 → 8897 | 0.49 % | 0.47 % | 0 | 0 |
| 390 × 844 | 10798 → 10798 | 0.66 % | 0.53 % | 0 | 0 |

pixelmatch threshold 0.15, anti-aliasing excluded. Per-viewport numbers: `analysis/diffs/summary.json`;
diff images: `analysis/diffs/<width>/{full,first-load,vp-NN}.png`.

Reference console showed one error at every width (`requestStorageAccess: Permission denied.`, a third-party
embed); the clone has none.

### Section geometry (heading-anchored)

`analysis/measurements/geometry-compare.json` — every H1/H2 and 12 probes (hero canvas, UFO, first feature
image, both tab images, first testimonial, select, code block, badges, email input, 404 image, footer wave)
match the reference **Δ0 px in y, x, width and height at all four widths**, except the newsletter 404
illustration at 390 px (Δ +1 px in y, sub-pixel rounding of `-bottom-[11rem]`).

### Where the remaining pixel differences are

| Area | Typical mismatch | Cause |
|---|---|---|
| Hero Rive illustration | 2–3 % of the first viewport | Live Rive timelines are at a different frame at capture time (same `.riv`, same runtime 2.38.5). Not a layout difference. |
| Logo river / UFO beam | 1–3 % of that viewport | Continuous 60 s marquee and beam lift are at different phases at capture time. |
| Text everywhere | < 0.3 % | Glyph anti-aliasing only — offset search on a 390 px paragraph found best alignment at (0, 0) with mean |Δ| 1.65/255. |
| Footer viewport | 0.2–0.3 % | Anti-aliasing on uppercase link text. |

## 2. Interaction states (`analysis/screenshots/interactions/{reference,local}-*.png`, diffs in `analysis/diffs/interactions/`)

| State | Mismatch | Notes |
|---|---|---|
| Tabs ×6 (both tabbed sections, each item active) | 0.02–0.03 % | Matching active rail, opacity and image crossfade end state |
| Snippet mid-switch (shrink phase, 600 ms) / Python active / "Copied!" | 0.02 % / 0.02 % / 0 % | Timing of the 1 s shrink + 1 s expand matches; clipboard text identical |
| Feature cards / hero "breaks," hover | 0.02 % / 0.08 % | |
| Mobile tabs accordion / security badges | 0 % / 0.01 % | |
| Newsletter focus / footer link hover | 0.21 % / 0.23 % | |
| Hero CTA hovers | 0.24–1.36 % | Gradient sweep end state matches (`background-position: 2% 0` measured on both); residual is Rive frame behind the clip |
| Logo river (two moments) | ~1 % | Animation phase |
| Desktop Platform mega menu | 2.79 % | Panel geometry/content match; diff is the moving Rive scene behind it |
| Mobile menu open | < 1 % (after fixes) | |
| Mobile carousel after 2 × Next | 15.93 % | **Harness artifact**: the recorded reference page ended at a different scroll offset. Re-running the interaction under controlled scrolling (`scripts/compare/carousel-scroll.mjs`) gives identical results on both sites: `scrollY 1272`, track `scrollLeft 708`, track height `307`. |

Behavioural checks recorded in `analysis/measurements/interactions-{reference,local}.json`: identical
`aria-expanded` transitions for the mega menu (open → Escape → closed) and mobile menu, identical hover
background positions for both CTAs, identical clipboard payload, identical carousel "Previous" state.

Videos: `analysis/videos/{reference,local}-{desktop,mobile}.webm` (load, cursor sweep over the hero, hovers,
menu, logo river, tabs, snippet switch + copy, newsletter focus, footer hover, full scroll).

## 3. Animation comparison

| Animation | Status |
|---|---|
| Hero Rive (`home-hero-scanner-animation.riv`, State Machine 1, 7 timelines, play/pause at 25 % visibility, 500 ms poster crossfade) | Same file and runtime version; verified live locally (canvas opacity 1, poster removed, frames change, WASM from `/media/rive/rive.wasm`). Load is deferred to `requestIdleCallback` (≤1.5 s), like Astro's `client:idle`. |
| "breaks," swingDown / pushUp + 1.5 s cooldown | Same keyframes and timing |
| Logo river `scroll-x` 60 s reverse | Same |
| UFO tractor beam (90 px beam, 90 px lift, lerp 0.09, 1200 ms easeOutCubic descent, logo-rock) | Ported 1:1; phase differs by start time |
| Button gradient sweeps, NEW pill, snackbar hover | Same values |
| Tabs: opacity .3 s, rail gradient, mobile max-height .6 s, float 1 s | Same; float replay uses the reference's remove → reflow → add technique |
| Snippet shrink/expand (1 s + 1 s) | Same, including interrupted-transition handling |
| Copy feedback 2 s | Same |
| Scroll-triggered reveals | None exist on the reference; none added |

**Deliberate divergence:** with `prefers-reduced-motion: reduce` the clone keeps the static Rive poster,
pauses the logo river, disables the tractor beam, the "breaks," swing, tab float and snippet keyframes. The
reference only pauses the logo row, disables the beam and carousel smooth scroll — its Rive hero still plays.

## 4. Assets

All 38 visual/font/animation assets on the page were downloaded from their original URLs and are served
locally (`analysis/assets-manifest.json`, 38 entries, 0 failures, 1.47 MB); 14 images were fetched as the
un-resized `/_astro/` originals rather than Vercel-resized copies. The Rive WASM comes from the npm package of the same version
the reference loads from unpkg. All 116 inline SVGs were reused (deduplicated to 13 named + 22 customer logos
in `src/svgs.ts`). The Playwright test suite asserts that the local page makes **no requests to any other
origin**.

Substitutions / omissions (not visual assets):

| Item | Handling |
|---|---|
| Marketo newsletter form + reCAPTCHA | Rebuilt as a static form with identical dark styling; native validation runs; submit is intercepted and nothing is sent. reCAPTCHA badge omitted (the reference hides it too). |
| Analytics (Plausible, Sentry SDK, reload.getsentry.net), WebMCP telemetry | Omitted |
| Logo right-click → /branding/ redirect | Omitted (navigation side effect) |
| Marketing Mode toggle | Visual + link to the original `/no-marketing-mode/` URL; that page is not built (out of scope) |
| IBM Plex Mono | Not loaded by the reference either; same fallback stack used |

## 5. Known remaining differences

1. **Mobile feature carousel initial height quirk is reproduced on purpose.** The reference's off-screen
   carousel images are lazy and their frames collapse to 4×4 px until swiped into view, so the track starts
   at the first card's height (253 px) and grows later. The clone keeps the same markup, so it behaves the
   same; this is a layout shift inherited from the original.
2. **Focus ring after tapping carousel arrows**: in the recording the reference showed a ring on the tapped
   Next button (it has no custom focus style, so this is Chrome's default heuristic) and the clone did not.
   Not investigated further. Keyboard focus outlines are present in the clone and covered by a test.
3. **Mega-menu panels use measured fixed widths** (545 / 336 / 768 px) instead of the reference's
   shrink-to-fit flex columns. Identical at the measured font metrics; could diverge if copy is edited to be
   much longer.
4. **Desktop dropdowns have no open/close animation** — none exists on the reference either (class toggle).
5. Only Chromium was used for comparison; Firefox and WebKit are installed but were not run against the
   reference.

## 6. Checks

| Check | Result |
|---|---|
| `npm run lint` (ESLint 9, eslint-config-next 16.4.3) | Pass, 0 problems |
| `npm run typecheck` (TypeScript 5.9.3) | Pass |
| `npm run build` (Next.js 16.4.3, Turbopack) | Pass, `/` prerendered static |
| `npx playwright test` (desktop 1440 + mobile 390 projects) | 25 passed, 5 skipped (viewport-specific tests skip on the other project), 0 failed |
| REA `list_browser_targets`, `inspect_web_page` | Ran successfully (evidence `analysis/raw/rea-inspect_web_page-1440.json`) |
| REA `analyze_web_bundle` | **Failed** — ran >120 s, then the REA MCP server disconnected ("Connection closed"); its tools were unavailable for the rest of the session. Bundle facts were derived with Playwright + direct reading of the small first-party modules instead. |
