/*
 * Local QA harness: loads every page in a real Chromium, records console
 * errors and failed requests, and checks for content that never became
 * visible, broken images and horizontal overflow. Not part of the build.
 *
 *   node scripts/verify.mjs [baseUrl]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import puppeteer from "puppeteer-core";

const BASE = process.argv[2] || "http://localhost:5174";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT = resolve(process.cwd(), "..", "qa-shots");

const PAGES = [
  ["home", "/"],
  ["how-it-works", "/how-it-works.html"],
  ["for-families", "/for-families.html"],
  ["use-cases", "/use-cases.html"],
  ["partners", "/partners.html"],
  ["privacy", "/privacy.html"],
  ["faq", "/faq.html"],
  ["demo", "/demo.html"],
  ["sitemap", "/sitemap.html"],
];

const VIEWPORTS = [
  ["desktop", { width: 1440, height: 900, deviceScaleFactor: 1 }],
  ["mobile", { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
  // Same desktop metrics, but every animation must degrade to a static page.
  ["reduced", { width: 1440, height: 900, deviceScaleFactor: 1 }],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const AUDIT = `(() => {
  const hidden = [];
  document.querySelectorAll('main *').forEach((el) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const offscreen = r.bottom < -200 || r.top > window.innerHeight + 200;
    const carriesContent = el.textContent.trim() || el.tagName === 'IMG' || el.querySelector('img');
    if (offscreen || !carriesContent) return;
    if (el.closest('[hidden]') || el.hasAttribute('hidden')) return;

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
  const images = [...document.images]
    .filter((i) => !(i.complete && i.naturalWidth > 0))
    .map((i) => ({ src: i.currentSrc || i.src, complete: i.complete, w: i.naturalWidth }));
  return {
    hidden: hidden.slice(0, 12),
    hiddenCount: hidden.length,
    images,
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

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--force-device-scale-factor=1", "--hide-scrollbars"],
});

mkdirSync(OUT, { recursive: true });

for (const [vpName, viewport] of VIEWPORTS) {
  for (const [name, path] of PAGES) {
    if (vpName === "mobile" && !["home", "for-families", "use-cases", "faq"].includes(name)) continue;
    if (vpName === "reduced" && !["home", "for-families", "use-cases"].includes(name)) continue;

    const page = await browser.newPage();
    await page.setViewport(viewport);

    if (vpName === "reduced") {
      await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
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
      gradientReady: audit.gradientReady,
      icons: `${audit.icons}/${audit.iconHosts}`,
      docH: audit.docH,
    });

    await page.close();
  }
}

await browser.close();

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
