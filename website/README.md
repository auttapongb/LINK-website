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
| Marketing plan | `/marketing-plan.html` |
| Brand platform | `/brand-platform.html` |
| Consumer insight | `/consumer-insight.html` |
| Privacy | `/privacy.html` |
| FAQ | `/faq.html` |
| Demo | `/demo.html` |
| Log in | `/login.html` |
| Family Admin dashboard | `/dashboard.html` (auth required) |
| Sitemap (HTML) | `/sitemap.html` |
| Sitemap (XML) | `/sitemap.xml` |

## Auth (Family Admin)

The marketing site is still static (Vite). Auth is client-side:

1. **Firebase Auth** (preferred) — email/password + Google, when env vars are set
2. **Local demo auth** (fallback) — register/login stored in `localStorage`; the Google button becomes **Continue with demo Google account** and does **not** call Google’s servers

### Enable Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
2. Add a **Web** app and copy the config
3. Authentication → Sign-in method → enable **Email/Password** and **Google**
4. For local Vite, add your domain (and `localhost`) under Authentication → Settings → Authorized domains
5. In `website/`, copy `.env.example` → `.env` and fill:

```bash
VITE_FIREBASE_API_KEY=…
VITE_FIREBASE_AUTH_DOMAIN=…
VITE_FIREBASE_PROJECT_ID=…
VITE_FIREBASE_APP_ID=…
VITE_FIREBASE_STORAGE_BUCKET=…   # optional
VITE_FIREBASE_MESSAGING_SENDER_ID=…  # optional
```

6. Restart `npm run dev`. The login page badge should read **Firebase Auth connected**.

Without `.env`, the site stays in demo auth so evaluators can still register, open the dashboard, and try the goal simulator.

### Dashboard demo rates

Illustrative only (shown on-page):

| Partner | Demo rate |
| --- | --- |
| Lotus’s | **1 THB → 100 points** |
| BTS | 1 ride → 120 points |
| AIS | 1 THB bill → 10 points |
| IHG | 1 THB stay spend → 15 points |

Seeded pool matches the site narrative (~48,260 toward a 71,000 IHG getaway). At the Lotus rate, the points shortfall is a few hundred baht of groceries — not six figures.

## Analytics & heatmaps

Third-party measurement is **off by default** and **consent-gated**.

### Cookie banner

`src/js/consent.js` shows a real preference UI (Necessary / Analytics / Marketing).
Choices persist in `localStorage` (`LINK_CONSENT_V1`). Footer → “Cookie preferences”
reopens the panel. Privacy copy: `/privacy.html#site-cookies`.

### Google Analytics 4

`src/js/analytics.js` loads `gtag.js` only when **both** are true:

1. A real measurement ID is configured — set `GA_MEASUREMENT_ID` or `window.LINK_GA_ID = "G-…"`, and
2. The visitor granted **Analytics** consent.

Placeholder values such as `G-XXXXXXXXXX` are ignored so a half-filled config cannot phone home.

### Microsoft Clarity (heatmaps / session)

`src/js/heatmap.js` loads Clarity only when **both** are true:

1. A real Clarity project ID — set `CLARITY_PROJECT_ID` or `window.LINK_CLARITY_ID`, and
2. The visitor granted **Marketing** consent.

Fake / placeholder IDs are rejected. No Clarity script is requested until then.

### CTA event hooks

Elements may use `data-track="event_name"` (optional `data-track-label`). Events fire via
`gtag` only after Analytics or Marketing consent — and only if GA actually loaded.

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
