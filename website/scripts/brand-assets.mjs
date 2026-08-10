/*
 * Renders the raster brand assets from the SVG sources so they never drift
 * apart. Not part of `npm run build` -- run it by hand after editing anything
 * in public/assets/brand/, then commit the PNGs.
 *
 *   node scripts/brand-assets.mjs
 *
 * Produces:
 *   favicon-32.png          classic tab icon
 *   favicon-192.png         Android home screen
 *   apple-touch-icon.png    180px, opaque canvas (iOS composites on black)
 *   og-image.jpg            1200x630 social card
 */
import { readFileSync, statSync, writeFileSync } from "node:fs";
import puppeteer from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const DIR = "public/assets/brand";

const inline = (file) => readFileSync(`${DIR}/${file}`, "utf8").replace(/<\?xml[^>]*\?>/, "");

const favicon = inline("favicon.svg");
const lockup = inline("link-lockup.svg");

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--force-device-scale-factor=1", "--hide-scrollbars", "--font-render-hinting=none"],
});

async function shot(html, width, height, file, omitBackground = true) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 250));
  // The social card carries a noise texture that costs ~600 KB as PNG and
  // ~60 KB as JPEG, so anything named .jpg goes out lossy.
  const jpeg = file.endsWith(".jpg");
  await page.screenshot({
    path: `${DIR}/${file}`,
    omitBackground: jpeg ? false : omitBackground,
    ...(jpeg ? { type: "jpeg", quality: 88 } : {}),
  });
  await page.close();
  const kb = (statSync(`${DIR}/${file}`).size / 1024).toFixed(1);
  console.log(`wrote ${DIR}/${file}  ${width}x${height}  ${kb} KB`);
}

const bare = (svg, size, background = "transparent") => `
<style>
  html,body{margin:0;padding:0;background:${background}}
  svg{display:block;width:${size}px;height:${size}px}
</style>${svg}`;

await shot(bare(favicon, 32), 32, 32, "favicon-32.png");
await shot(bare(favicon, 192), 192, 192, "favicon-192.png");

// iOS ignores transparency and composites on black, so this one gets the
// pearl canvas baked in.
await shot(
  `<style>
     html,body{margin:0;padding:0}
     .plate{width:180px;height:180px;display:grid;place-items:center;
       background:radial-gradient(120% 120% at 30% 20%, #ffffff, #e7efed 70%, #dce7e4)}
     svg{display:block;width:150px;height:150px}
   </style>
   <div class="plate">${favicon}</div>`,
  180,
  180,
  "apple-touch-icon.png",
  false
);

// Social card. Brand-first: the lockup carries it, one line of support copy.
await shot(
  `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Noto+Sans+Thai:wght@500&display=swap">
   <style>
     html,body{margin:0;padding:0}
     .card{
       position:relative;width:1200px;height:630px;overflow:hidden;
       display:flex;flex-direction:column;justify-content:center;
       padding:0 96px;box-sizing:border-box;
       background:
         radial-gradient(720px 520px at 84% 16%, rgba(31,168,138,.26), transparent 68%),
         radial-gradient(620px 460px at 6% 84%, rgba(35,96,232,.22), transparent 66%),
         linear-gradient(168deg, #ffffff 0%, #f2f6f5 58%);
     }
     .card::after{
       content:"";position:absolute;inset:0;pointer-events:none;opacity:.05;
       mix-blend-mode:multiply;
       background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E");
     }
     svg{display:block;width:400px;height:auto}
     h1{
       margin:56px 0 0;font-family:Fraunces,Georgia,serif;font-weight:600;
       font-size:76px;line-height:1.06;letter-spacing:-.02em;color:#102E3A;max-width:15ch;
     }
     p{
       margin:28px 0 0;font-family:"Noto Sans Thai",system-ui,sans-serif;font-weight:500;
       font-size:28px;color:#35535C;letter-spacing:.01em;
     }
   </style>
   <div class="card">
     ${lockup}
     <h1>Your points are worth more together.</h1>
     <p>&#3619;&#3623;&#3617;&#3585;&#3633;&#3609;&#3588;&#3640;&#3657;&#3617;&#3585;&#3623;&#3656;&#3634; &#183; Worth More Together.</p>
   </div>`,
  1200,
  630,
  "og-image.jpg",
  false
);

await browser.close();
writeFileSync(
  `${DIR}/README.txt`,
  [
    "Brand assets for the LINK site.",
    "",
    "link-logo.png      the logo file supplied by the brand owner (source of truth)",
    "link-mark.svg      vector redraw of the mobius mark alone",
    "link-lockup.svg    vector redraw of mark + wordmark",
    "favicon.svg        square icon cut, ribbon boldened for small sizes",
    "favicon-32.png     generated by scripts/brand-assets.mjs",
    "favicon-192.png    generated by scripts/brand-assets.mjs",
    "apple-touch-icon.png  generated by scripts/brand-assets.mjs",
    "og-image.jpg       generated by scripts/brand-assets.mjs",
    "partners/          third-party partner marks, see ../../../ASSET-CREDITS.md",
    "",
    "Regenerate the PNGs with: node scripts/brand-assets.mjs",
  ].join("\n"),
  "utf8"
);
