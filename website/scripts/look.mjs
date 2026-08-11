/*
 * Ad-hoc visual inspection: screenshot named viewport/scroll positions so the
 * retheme can be judged on what renders rather than on what the CSS says.
 *
 * Usage: node scripts/look.mjs [name=/path[@selector]] ...
 *        node scripts/look.mjs            (default sweep)
 */
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:4174";
const OUT = "../qa-shots";

const args = process.argv.slice(2);
const targets = args.length
  ? args.map((a) => {
      const [name, rest] = a.split("=");
      // name=/path@scroll-to-selector!click-selector
      const [before, click] = rest.split("!");
      const [path, selector] = before.split("@");
      return { name, path, selector, click };
    })
  : [
      { name: "home-hero", path: "/" },
      { name: "home-problem", path: "/", selector: "#problem" },
      { name: "home-how", path: "/", selector: "#how" },
      { name: "home-cta", path: "/", selector: ".final-cta" },
      { name: "partners", path: "/partners.html", selector: ".partner-blocks" },
      { name: "how", path: "/how-it-works.html", selector: ".steps" },
      { name: "families", path: "/for-families.html", selector: ".personas" },
      { name: "demo", path: "/demo.html", selector: ".device" },
      { name: "faq", path: "/faq.html", selector: ".faq" },
      { name: "privacy", path: "/privacy.html", selector: ".privacy-band" },
      { name: "usecases", path: "/use-cases.html", selector: ".usecase-list" },
      { name: "earn", path: "/earn-to-burn.html" },
    ];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--force-device-scale-factor=1"],
});

for (const vp of [
  { key: "d", width: 1440, height: 900 },
  { key: "m", width: 390, height: 844 },
]) {
  const page = await browser.newPage();
  await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
  // Emulation otherwise still reports a mouse at phone widths, which hides every
  // bug that lives behind a `hover: hover` query. Puppeteer's own
  // emulateMediaFeatures rejects `hover`, so this goes through raw CDP.
  if (vp.key === "m") {
    const client = await page.createCDPSession();
    await client.send("Emulation.setEmulatedMedia", {
      features: [
        { name: "hover", value: "none" },
        { name: "any-hover", value: "none" },
        { name: "pointer", value: "coarse" },
        { name: "any-pointer", value: "coarse" },
      ],
    });
  }
  for (const t of targets) {
    if (vp.key === "m" && args.length === 0 && !/home-hero|partners|earn/.test(t.name)) continue;
    await page.goto(`${BASE}${t.path}`, { waitUntil: "networkidle2" });
    await page.evaluate(() => document.fonts.ready);
    if (t.selector) {
      const found = await page.evaluate((s) => {
        const el = document.querySelector(s);
        if (!el) return false;
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 110, behavior: "instant" });
        return true;
      }, t.selector);
      if (!found) console.log(`  (no ${t.selector} on ${t.path})`);
    }
    await new Promise((r) => setTimeout(r, 1400));
    if (t.click) {
      // Dispatched in-page rather than with page.click so the scroll position set
      // above survives: a real click scrolls the target into view first.
      const hit = await page.evaluate((s) => {
        const el = document.querySelector(s);
        if (!el) return false;
        el.click();
        return true;
      }, t.click);
      if (!hit) console.log(`  (no ${t.click} to click on ${t.path})`);
      await new Promise((r) => setTimeout(r, 900));
    }
    await page.screenshot({ path: `${OUT}/look-${vp.key}-${t.name}.png` });
    console.log(`look-${vp.key}-${t.name}.png`);
  }
  await page.close();
}

await browser.close();
