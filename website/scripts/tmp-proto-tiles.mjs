import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";

const src = `${homedir()}/OneDrive/\u0E40\u0E14\u0E2A\u0E01\u0E4C\u0E17\u0E47\u0E2D\u0E1B/link_website_1/link_website_1.html`;
let html = readFileSync(src, "utf8");

// Strip the base64 payloads so the rest is greppable.
html = html.replace(/data:image\/[a-z+]+;base64,[A-Za-z0-9+/=]+/g, "data:BASE64");

mkdirSync("../.tmp-tiles", { recursive: true });
writeFileSync("../.tmp-tiles/proto.html", html, "utf8");

// The touchpoint cards, with the logo SVGs collapsed to a marker.
const start = html.indexOf('id="touchpoints"');
const end = html.indexOf("</section>", start);
let block = html.slice(start, end);
block = block.replace(/<svg[\s\S]*?<\/svg>/g, "[SVG]");
writeFileSync("../.tmp-tiles/touchpoints.html", block, "utf8");

// Every hover / transform rule, so the tile motion can be adapted rather than guessed.
const css = html.match(/<style[\s\S]*?<\/style>/g)?.join("\n") ?? "";
const rules = css
  .split("}")
  .filter((r) => /logo-card|tooltip|touchpoint|vendor|tp-chip|wiggle/i.test(r))
  .map((r) => r.trim() + "\n}");
writeFileSync("../.tmp-tiles/tile-css.txt", rules.join("\n\n"), "utf8");

console.log("touchpoints block", block.length, "css rules", rules.length);
