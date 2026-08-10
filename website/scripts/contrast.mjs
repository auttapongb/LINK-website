/*
 * Contrast audit for the clay palette.
 *
 * Claymorphism lives on pastels, and pastels fail WCAG quietly: a colour that
 * looks like "the brand blue" at 100% is usually a 2:1 tint once it is light
 * enough to sit behind text. So every pairing the site actually renders is
 * checked here rather than eyeballed, and each token carries a documented role:
 * `ink` pairs are text and must clear 4.5, `large` pairs are display type at
 * 24px+/19px-bold and must clear 3.0, `ui` pairs are borders and icons and must
 * clear 3.0.
 *
 * Run: node scripts/contrast.mjs
 */

const hex = (h) => {
  const s = h.replace("#", "");
  const n = s.length === 3 ? s.split("").map((c) => c + c).join("") : s;
  return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16));
};

const lum = (h) => {
  const [r, g, b] = hex(h).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

/** Flattens a translucent overlay onto a known backdrop. */
const over = (fg, alpha, bg) => {
  const [r1, g1, b1] = hex(fg);
  const [r2, g2, b2] = hex(bg);
  const mix = (a, b) => Math.round(a * alpha + b * (1 - alpha));
  return `#${[mix(r1, r2), mix(g1, g2), mix(b1, b2)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};

const T = {
  canvas: "#e6eff7",
  canvasWarm: "#f7ebdd",
  surface: "#ffffff",
  surfaceSky: "#e6eff7",
  surfaceSand: "#f7ebdd",
  ink: "#40312a",
  ink2: "#635045",
  muted: "#7d685c",
  sky: "#aee2f6",
  skyDeep: "#0f6b9d",
  brand: "#2360e8",
  brandDeep: "#1a48be",
  coral: "#ff8a5b",
  coralDeep: "#ad3b16",
  green: "#7ec466",
  greenDeep: "#256b38",
  mustard: "#ffc93c",
  mustardDeep: "#8a5a06",
  amber: "#f0900f",
  amberDeep: "#8f5105",
  brownDeep: "#4a3b32",
  cocoa: "#2f241e",
  navy: "#26313a",
  navyInk: "#f2ece4",
};

const CHECKS = [
  ["ink", "body text on canvas", T.ink, T.canvas, 4.5],
  ["ink", "body text on surface", T.ink, T.surface, 4.5],
  ["ink", "body text on sky surface", T.ink, T.surfaceSky, 4.5],
  ["ink", "body text on sand surface", T.ink, T.surfaceSand, 4.5],
  ["ink", "body text on full sky", T.ink, T.sky, 4.5],
  ["ink", "secondary text on canvas", T.ink2, T.canvas, 4.5],
  ["ink", "secondary text on surface", T.ink2, T.surface, 4.5],
  ["ink", "muted text on canvas", T.muted, T.canvas, 4.5],
  ["ink", "muted text on surface", T.muted, T.surface, 4.5],
  ["large", "display heading on canvas", T.ink, T.canvas, 3],
  ["ink", "eyebrow green on canvas", T.greenDeep, T.canvas, 4.5],
  ["ink", "eyebrow green on surface", T.greenDeep, T.surface, 4.5],
  ["ink", "link blue on canvas", T.brandDeep, T.canvas, 4.5],
  ["ink", "link blue on surface", T.brandDeep, T.surface, 4.5],
  ["ink", "sky deep on canvas", T.skyDeep, T.canvas, 4.5],
  ["ink", "coral deep on canvas", T.coralDeep, T.canvas, 4.5],
  ["ink", "coral deep on surface", T.coralDeep, T.surface, 4.5],
  ["ink", "amber deep on canvas", T.amberDeep, T.canvas, 4.5],
  ["ink", "mustard deep on canvas", T.mustardDeep, T.canvas, 4.5],
  ["ink", "white on cocoa button", T.surface, T.cocoa, 4.5],
  ["ink", "ink on coral button", T.cocoa, T.coral, 4.5],
  ["ink", "ink on mustard button", T.cocoa, T.mustard, 4.5],
  ["ink", "ink on green chip", T.cocoa, T.green, 4.5],
  ["ink", "ink on sky chip", T.cocoa, T.sky, 4.5],
  ["ink", "navy-ink text on navy band", T.navyInk, T.navy, 4.5],
  // Hairlines are decorative separators, not controls or meaningful graphics, so
  // 1.4.11's 3:1 does not apply. The bar here is only "perceivable".
  ["ui", "line on canvas", over(T.ink, 0.2, T.canvas), T.canvas, 1.35],
  ["ui", "strong line on surface", over(T.ink, 0.34, T.surface), T.surface, 1.9],
  ["ui", "coral graphic on canvas", T.coral, T.canvas, 1.6],
  ["ui", "focus ring on canvas", T.brandDeep, T.canvas, 3],
];

let fails = 0;
const width = Math.max(...CHECKS.map((c) => c[1].length));
for (const [kind, label, fg, bg, min] of CHECKS) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) fails++;
  const tag = ok ? "pass" : "FAIL";
  console.log(
    `${tag}  ${label.padEnd(width)}  ${r.toFixed(2)}:1  (need ${min}, ${kind})  ${fg} on ${bg}`
  );
}
console.log(`\n${CHECKS.length - fails}/${CHECKS.length} pass, ${fails} fail`);
process.exit(fails ? 1 : 0);
