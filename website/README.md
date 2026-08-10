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

## Pages

| Page | Path |
| --- | --- |
| Home | `/` |
| How it works | `/how-it-works.html` |
| For families | `/for-families.html` |
| Use cases | `/use-cases.html` |
| Partners | `/partners.html` |
| Privacy | `/privacy.html` |
| FAQ | `/faq.html` |
| Demo | `/demo.html` |
| Sitemap (HTML) | `/sitemap.html` |
| Sitemap (XML) | `/sitemap.xml` |

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
