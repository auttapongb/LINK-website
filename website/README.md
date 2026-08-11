# LINK marketing website

Consumer-facing marketing site for **LINK** — a loyalty-point aggregation and family pooling service (academic/fictional Year-1 pilot).

## Stack

- Vite 6 (multi-page static site)
- Vanilla HTML / CSS / JS — no framework
- Hallmark-informed custom theme (“LINK Connection”) with Split Studio + Narrative Workflow patterns
- [GSAP](https://gsap.com) 3 with ScrollTrigger and SplitText for scroll reveals, the hero timeline and section transitions
- [Lenis](https://github.com/darkroomengineering/lenis) for smooth scrolling (desktop, fine pointers only)
- [Lucide](https://lucide.dev) icons, imported individually so only the icons in use are bundled
- A hand-written WebGL shader (`src/js/gradient.js`) for the animated hero gradient

Licences and photo credits: [`ASSET-CREDITS.md`](./ASSET-CREDITS.md).

### Motion

All motion is opt-out. `prefers-reduced-motion: reduce` disables Lenis, skips
every GSAP timeline, and renders the page in its final state — nothing is left
waiting on a scroll to become visible. Smooth scrolling is also skipped on
coarse pointers so native touch scrolling is untouched.

The earn-to-burn loop takes this one step further: its diagram is authored in
markup in its *finished* state (pool full, window spent, boundary drawn, loop
closed), and `src/js/flow.js` rewinds that to zero only when the sticky desktop
layout is in play and reduced motion is off. With JavaScript disabled, on a
narrow screen, or with reduced motion, the page is a complete static explanation.

### Brand assets

`node scripts/brand-assets.mjs` regenerates the favicons and the social card from
the SVG sources in `public/assets/brand/`. Run it by hand after editing any of
those SVGs and commit the results; it is not part of `npm run build`. The LINK
mark's path data is shared between the SVG files and `src/js/brand.js`, which is
what the header, footer and animated marks render from.

## Pages

| Page | Path |
| --- | --- |
| Home | `/` |
| How it works | `/how-it-works.html` |
| Earn to burn | `/earn-to-burn.html` |
| For families | `/for-families.html` |
| Use cases | `/use-cases.html` |
| Partners | `/partners.html` |
| Data strategy | `/data-strategy.html` |
| Privacy | `/privacy.html` |
| FAQ | `/faq.html` |
| Demo | `/demo.html` |
| Sitemap (HTML) | `/sitemap.html` |
| Sitemap (XML) | `/sitemap.xml` |

## Analytics

Site analytics are **off by default**. `src/js/analytics.js` loads Google Analytics 4
(`gtag.js`) only when a real measurement ID is configured:

1. Set `GA_MEASUREMENT_ID` in `src/js/analytics.js` to your `G-…` ID, **or**
2. Define `window.LINK_GA_ID = "G-…"` before the app module runs (useful for
   environment-specific deploys).

Placeholder values such as `G-XXXXXXXXXX` are ignored on purpose so a half-filled
config cannot phone home. Until a real ID is set, `initAnalytics()` is a no-op and
no third-party analytics script is requested. The privacy page notes this stance.

## Run locally

```bash
cd website
npm install
npm run dev
```

Then open the URL Vite prints (default `http://localhost:5173`).

### Production build

```bash
npm run build
npm run preview
```

Output lands in `website/dist/`.

### Visual QA

`npm run verify` drives a real Chromium (via `puppeteer-core`, using the
locally installed Chrome) across every page at desktop, mobile and
reduced-motion settings. It fails on console errors, failed requests,
broken images, horizontal overflow, unmounted icons, and any content left
invisible or clipped after scrolling — the class of bug that scroll
animations tend to introduce.

```bash
npm run dev            # in one terminal
npm run verify -- http://localhost:5174
```

Screenshots are written to `qa-shots/` at the repository root (git-ignored).
The Chrome path is hard-coded near the top of `scripts/verify.mjs`; adjust it
if Chrome lives somewhere else on your machine.
