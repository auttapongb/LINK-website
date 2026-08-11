/*
 * Local QA harness: loads every page in a real Chromium, records console
 * errors and failed requests, and checks for content that never became
 * visible, broken images and horizontal overflow. Not part of the build.
 *
 *   node scripts/verify.mjs [baseUrl]
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import puppeteer from "puppeteer-core";

const PORT = 5174;
const BASE = process.argv[2] || `http://localhost:${PORT}`;
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT = resolve(process.cwd(), "..", "qa-shots");

const PAGES = [
  ["home", "/"],
  ["how-it-works", "/how-it-works.html"],
  ["earn-to-burn", "/earn-to-burn.html"],
  ["for-families", "/for-families.html"],
  ["use-cases", "/use-cases.html"],
  ["partners", "/partners.html"],
  ["privacy", "/privacy.html"],
  ["faq", "/faq.html"],
  ["demo", "/demo.html"],
  ["data-strategy", "/data-strategy.html"],
  ["marketing-plan", "/marketing-plan.html"],
  ["brand-platform", "/brand-platform.html"],
  ["consumer-insight", "/consumer-insight.html"],
  ["sitemap", "/sitemap.html"],
];

const VIEWPORTS = [
  ["desktop", { width: 1440, height: 900, deviceScaleFactor: 1 }],
  ["mobile", { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
  // Same desktop metrics, but every animation must degrade to a static page.
  ["reduced", { width: 1440, height: 900, deviceScaleFactor: 1 }],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const reachable = async (url) => {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok || res.status === 405;
  } catch {
    return false;
  }
};

/*
 * The harness used to assume somebody had already started `vite preview` on the
 * right port, which meant a green run and a connection-refused crash looked
 * identical from the outside. It now starts its own server when nothing is
 * listening, and shuts it down again on the way out.
 */
async function ensureServer() {
  if (await reachable(BASE)) return null;
  if (BASE !== `http://localhost:${PORT}`) {
    console.error(`nothing serving ${BASE}, and it is not the port this script manages`);
    process.exit(1);
  }
  console.log(`starting vite preview on ${PORT}`);
  // Vite's own entry rather than npx, so this needs no shell and stays quiet.
  const child = spawn(
    process.execPath,
    [resolve("node_modules", "vite", "bin", "vite.js"), "preview", "--port", String(PORT), "--strictPort"],
    { stdio: "ignore" }
  );
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    if (await reachable(BASE)) return child;
  }
  child.kill();
  console.error("vite preview never came up");
  process.exit(1);
}

const AUDIT = `(() => {
  const hidden = [];
  document.querySelectorAll('main *').forEach((el) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const offscreen = r.bottom < -200 || r.top > window.innerHeight + 200;
    const carriesContent = el.textContent.trim() || el.tagName === 'IMG' || el.querySelector('img');
    if (offscreen || !carriesContent) return;
    if (el.closest('[hidden]') || el.hasAttribute('hidden')) return;
    // Decorative / layout-only nodes (duplicate tile labels kept for row height).
    if (el.closest('[aria-hidden="true"]') || el.getAttribute('aria-hidden') === 'true') return;

    // A clip-path wipe that never ran leaves the element fully clipped away.
    const clip = cs.clipPath;
    const fullyClipped = clip.indexOf('inset(') === 0 && clip.indexOf('100%') > -1;

    if (parseFloat(cs.opacity) < 0.15 || cs.visibility === 'hidden' || fullyClipped) {
      hidden.push({
        tag: el.tagName,
        cls: String(el.className).slice(0, 44),
        opacity: cs.opacity,
        visibility: cs.visibility,
        clipPath: clip === 'none' ? undefined : clip,
        text: el.textContent.trim().slice(0, 40) || '(media)',
      });
    }
  });
  /*
   * Two separate image failures, because they look nothing alike:
   *
   *   broken  — the byte stream never decoded. naturalWidth is 0.
   *   collapsed — the file decoded perfectly but lays out at zero size. This is
   *     what an SVG with a viewBox and no width/height does inside a flex or
   *     grid item, and naturalWidth reports a healthy 300 the whole time, so the
   *     old check waved it through. Five partner logos once shipped invisible
   *     this way. Anything under 4px in either axis counts, since 1px tracking
   *     pixels and spacer gifs are not something this site uses.
   */
  const broken = [...document.images]
    .filter((i) => !(i.complete && i.naturalWidth > 0))
    .map((i) => ({ src: i.currentSrc || i.src, complete: i.complete, w: i.naturalWidth }));

  const collapsed = [...document.images]
    .filter((i) => {
      if (!(i.complete && i.naturalWidth > 0)) return false;
      const cs = getComputedStyle(i);
      if (cs.display === 'none' || cs.visibility === 'hidden') return false;
      if (i.closest('[hidden]')) return false;
      const r = i.getBoundingClientRect();
      return r.width < 4 || r.height < 4;
    })
    .map((i) => {
      const r = i.getBoundingClientRect();
      return {
        src: (i.currentSrc || i.src).split('/').pop(),
        box: r.width.toFixed(1) + 'x' + r.height.toFixed(1),
        natural: i.naturalWidth + 'x' + i.naturalHeight,
      };
    });
  return {
    hidden: hidden.slice(0, 12),
    hiddenCount: hidden.length,
    images: broken,
    collapsedImages: collapsed,
    scrollW: document.documentElement.scrollWidth,
    winW: window.innerWidth,
    docH: document.documentElement.scrollHeight,
    gradientReady: !!document.querySelector('[data-gradient][data-gradient-ready]'),
    icons: document.querySelectorAll('[data-icon] svg').length,
    iconHosts: document.querySelectorAll('[data-icon]').length,
  };
})()`;

async function scrollThrough(page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = 700;
  for (let y = 0; y < height; y += step) {
    await page.evaluate((to) => window.scrollTo(0, to), y);
    await sleep(220);
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await sleep(900);
}

const report = [];
const server = await ensureServer();

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--force-device-scale-factor=1", "--hide-scrollbars"],
});

mkdirSync(OUT, { recursive: true });

for (const [vpName, viewport] of VIEWPORTS) {
  for (const [name, path] of PAGES) {
    // Partners is in both narrow lists now: 27 sub-brand tiles make it the
    // densest grid on the site, and its logo treatment is the thing that behaves
    // differently on a touch pointer.
    if (vpName === "mobile" && !["home", "earn-to-burn", "for-families", "use-cases", "faq", "partners"].includes(name))
      continue;
    if (vpName === "reduced" && !["home", "earn-to-burn", "for-families", "use-cases", "partners"].includes(name))
      continue;

    const page = await browser.newPage();
    await page.setViewport(viewport);

    /*
     * Chromium's device emulation leaves the hover and pointer media features
     * reporting a mouse, so a `hover: hover` rule still applies at 390px wide and
     * anything gated behind it looks fine in the harness while being wrong on a
     * real phone. Stating them explicitly is what makes the mobile pass mean
     * something. Puppeteer's emulateMediaFeatures rejects anything outside a
     * small allow-list, so this goes through raw CDP — which replaces the whole
     * feature set at once, hence reduced-motion being set here too.
     */
    const features = [];
    if (vpName === "reduced") features.push({ name: "prefers-reduced-motion", value: "reduce" });
    if (vpName === "mobile") {
      features.push(
        { name: "hover", value: "none" },
        { name: "any-hover", value: "none" },
        { name: "pointer", value: "coarse" },
        { name: "any-pointer", value: "coarse" }
      );
    }
    if (features.length) {
      const client = await page.createCDPSession();
      await client.send("Emulation.setEmulatedMedia", { features });
    }

    const consoleErrors = [];
    const failedRequests = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(`UNCAUGHT: ${err.message}`));
    page.on("requestfailed", (req) => failedRequests.push(`${req.url()} — ${req.failure()?.errorText}`));
    page.on("response", (res) => {
      if (res.status() >= 400) failedRequests.push(`${res.url()} — HTTP ${res.status()}`);
    });

    await page.goto(BASE + path, { waitUntil: "networkidle2", timeout: 45000 });
    await sleep(1600);

    await page.screenshot({ path: `${OUT}/${vpName}-${name}-top.png` });

    // With reduced motion nothing should be waiting on a scroll to appear.
    const preScroll = vpName === "reduced" ? await page.evaluate(AUDIT) : null;

    await scrollThrough(page);
    await page.screenshot({ path: `${OUT}/${vpName}-${name}-bottom.png` });

    const audit = await page.evaluate(AUDIT);

    // A second full-page capture is the most useful artefact for review.
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(500);
    await page.screenshot({ path: `${OUT}/${vpName}-${name}-full.png`, fullPage: true });

    report.push({
      page: `${vpName}/${name}`,
      consoleErrors,
      failedRequests: [...new Set(failedRequests)],
      overflow: audit.scrollW > audit.winW + 2 ? `${audit.scrollW} > ${audit.winW}` : null,
      hiddenCount: audit.hiddenCount,
      hidden: audit.hidden,
      hiddenBeforeScroll: preScroll ? preScroll.hidden : [],
      brokenImages: audit.images,
      collapsedImages: audit.collapsedImages,
      gradientReady: audit.gradientReady,
      icons: `${audit.icons}/${audit.iconHosts}`,
      docH: audit.docH,
    });

    await page.close();
  }
}

await browser.close();
server?.kill();

writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));

let problems = 0;
for (const r of report) {
  const issues = [];
  if (r.consoleErrors.length) issues.push(`console: ${JSON.stringify(r.consoleErrors)}`);
  if (r.failedRequests.length) issues.push(`requests: ${JSON.stringify(r.failedRequests)}`);
  if (r.overflow) issues.push(`overflow: ${r.overflow}`);
  if (r.hiddenCount) issues.push(`hidden(${r.hiddenCount}): ${JSON.stringify(r.hidden)}`);
  if (r.hiddenBeforeScroll?.length)
    issues.push(`reduced-motion hid content before scroll: ${JSON.stringify(r.hiddenBeforeScroll)}`);
  if (r.brokenImages.length) issues.push(`images: ${JSON.stringify(r.brokenImages)}`);
  if (r.collapsedImages?.length)
    issues.push(`images laid out at zero size: ${JSON.stringify(r.collapsedImages)}`);
  if (r.icons.split("/")[0] !== r.icons.split("/")[1]) issues.push(`icons unmounted: ${r.icons}`);

  if (issues.length) {
    problems += 1;
    console.log(`\n[FAIL] ${r.page}  (h=${r.docH}, gradient=${r.gradientReady})`);
    issues.forEach((i) => console.log("   - " + i));
  } else {
    console.log(`[ok]   ${r.page}  (h=${r.docH}, gradient=${r.gradientReady}, icons=${r.icons})`);
  }
}

console.log(`\n${problems} page(s) with issues. Screenshots in ${OUT}`);
process.exit(problems ? 1 : 0);
