/*
 * The LINK mark, in one place.
 *
 * The geometry is the same vector redraw that ships as
 * public/assets/brand/link-mark.svg: a single closed mobius ribbon of uniform
 * 13-unit width, mirror symmetric about both axes through (138.9, 44.5), plus
 * the wordmark's four straight-edged glyphs. Keeping the path data here as
 * well lets the header, footer and the animated hero motif share exactly one
 * definition instead of three that drift.
 */

/** Whole ribbon, closed. Starts at the left tip and runs over the left loop. */
export const RIBBON_FULL =
  "M6.5 44.5C6.5 37 15.4 6.5 57.9 6.5c30.8 0 51 15.5 81 38 30 22.5 50.3 38 81 38 " +
  "42.5 0 51.4-30.5 51.4-38s-8.9-38-51.4-38c-30.7 0-51 15.5-81 38-30 22.5-50.2 38-81 38" +
  "C15.4 82.5 6.5 52 6.5 44.5Z";

/** The half that reads cool: right tip, over the right loop, through the crossing. */
export const RIBBON_COOL =
  "M271.3 44.5c0-7.5-8.9-38-51.4-38-30.7 0-51 15.5-81 38-30 22.5-50.2 38-81 38" +
  "C15.4 82.5 6.5 52 6.5 44.5";

/** The warm half, as its own open path, for motion that needs the two separately. */
export const RIBBON_WARM =
  "M6.5 44.5C6.5 37 15.4 6.5 57.9 6.5c30.8 0 51 15.5 81 38 30 22.5 50.3 38 81 38 " +
  "42.5 0 51.4-30.5 51.4-38";

export const WORDMARK_PATHS = [
  "M79.9 101.5h10v27h15v7h-25Z",
  "M108.9 101.5h10v34h-10Z",
  "M125.9 101.5h9l12 21.4v-21.4h10v34h-11.6l-10.4-18.5v18.5h-9Z",
  "M162.9 101.5h10v11l11-11h11l-16 16.5 17.5 17.5h-11.5l-12-13v13h-10Z",
];

const WARM_STOPS = [
  [0, "#83757F"],
  [0.145, "#96786A"],
  [0.296, "#A47C5A"],
  [0.447, "#BA8344"],
  [0.56, "#CB8634"],
  [0.711, "#DC8B24"],
  [0.862, "#EC8F12"],
  [1, "#FB9304"],
];

const COOL_STOPS = [
  [0, "#83757F"],
  [0.069, "#74708B"],
  [0.221, "#626B9D"],
  [0.372, "#5267AD"],
  [0.447, "#4A64B5"],
  [0.56, "#3B61C4"],
  [0.711, "#235ADD"],
  [0.862, "#1357EB"],
  [1, "#0854F4"],
];

const stops = (list) =>
  list.map(([offset, color]) => `<stop offset="${offset}" stop-color="${color}"/>`).join("");

/**
 * The two ribbon gradients. `spread` widens the gradient beyond the mark so a
 * travelling `gradientTransform` still has colour to bring in from off-stage.
 */
function gradients(prefix, spread = 0) {
  const x1 = 6.5 - spread;
  const x2 = 271.3 + spread;
  return (
    `<linearGradient id="${prefix}Warm" gradientUnits="userSpaceOnUse" x1="${x1}" y1="0" x2="${x2}" y2="0">${stops(WARM_STOPS)}</linearGradient>` +
    `<linearGradient id="${prefix}Cool" gradientUnits="userSpaceOnUse" x1="${x1}" y1="0" x2="${x2}" y2="0">${stops(COOL_STOPS)}</linearGradient>`
  );
}

function ribbon(prefix, { nodeRadius = 9.5, dot = true } = {}) {
  return (
    '<g fill="none" stroke-width="13" stroke-linecap="butt">' +
    `<path stroke="url(#${prefix}Warm)" d="${RIBBON_FULL}"/>` +
    `<path stroke="url(#${prefix}Cool)" d="${RIBBON_COOL}"/>` +
    `<circle cx="138.9" cy="44.5" r="${nodeRadius}" fill="#0A53F6" stroke="none"/>` +
    "</g>" +
    (dot ? '<circle cx="258.5" cy="44.5" r="3.4" fill="#F0900F"/>' : "")
  );
}

/**
 * Hidden sprite holding the mark and the full lockup as symbols, so every
 * chrome instance on the page shares one copy of the path and gradient data.
 * The wordmark is `currentColor` so the same symbol works on the pearl header
 * and the navy footer.
 */
export function brandSprite() {
  return (
    '<svg class="brand-sprite" aria-hidden="true" focusable="false" ' +
    'style="position:absolute;width:0;height:0;overflow:hidden">' +
    `<defs>${gradients("linkSprite")}</defs>` +
    '<symbol id="link-mark" viewBox="0 0 278 89">' +
    ribbon("linkSprite") +
    "</symbol>" +
    '<symbol id="link-lockup" viewBox="0 0 278 136">' +
    ribbon("linkSprite") +
    '<g fill="currentColor">' +
    WORDMARK_PATHS.map((d) => `<path d="${d}"/>`).join("") +
    "</g>" +
    "</symbol>" +
    "</svg>"
  );
}

/**
 * A standalone, animatable copy of the mark. Separate from the sprite because
 * GSAP cannot reach into a `<use>` shadow tree: the hero and the earn-to-burn
 * loop need real elements to stroke-dash and re-gradient.
 *
 * `lockup` adds the wordmark; `flow` adds an unpainted duplicate of each half
 * for a travelling dash.
 */
export function inlineMark(prefix, { lockup = false, flow = false, className = "" } = {}) {
  const height = lockup ? 136 : 89;
  return (
    `<svg class="${className}" viewBox="0 0 278 ${height}" aria-hidden="true" focusable="false">` +
    `<defs>${gradients(prefix, 90)}</defs>` +
    '<g fill="none" stroke-width="13" stroke-linecap="butt">' +
    `<path data-ribbon="warm" stroke="url(#${prefix}Warm)" d="${RIBBON_FULL}"/>` +
    `<path data-ribbon="cool" stroke="url(#${prefix}Cool)" d="${RIBBON_COOL}"/>` +
    `<circle data-ribbon-node cx="138.9" cy="44.5" r="9.5" fill="#0A53F6" stroke="none"/>` +
    "</g>" +
    '<circle data-ribbon-dot cx="258.5" cy="44.5" r="3.4" fill="#F0900F"/>' +
    (flow
      ? '<g fill="none" stroke-width="4.5" stroke-linecap="round">' +
        `<path data-ribbon-flow="warm" stroke="#FB9304" d="${RIBBON_WARM}"/>` +
        `<path data-ribbon-flow="cool" stroke="#0A53F6" d="${RIBBON_COOL}"/>` +
        "</g>"
      : "") +
    (lockup
      ? '<g fill="currentColor">' + WORDMARK_PATHS.map((d) => `<path d="${d}"/>`).join("") + "</g>"
      : "") +
    "</svg>"
  );
}

/**
 * Fills every `[data-brand-mark]` host with its own inline copy. The attribute
 * value names the instance, which becomes the gradient id prefix so two marks
 * on one page never share (and therefore never fight over) a gradient.
 *
 * `data-brand-mark-flow` asks for the travelling-dash duplicate paths.
 */
export function mountMarks(root = document) {
  root.querySelectorAll("[data-brand-mark]").forEach((host, i) => {
    if (host.firstElementChild) return;
    const name = host.dataset.brandMark || `mark${i}`;
    host.innerHTML = inlineMark(`link-${name}`, {
      lockup: host.hasAttribute("data-brand-mark-lockup"),
      flow: host.hasAttribute("data-brand-mark-flow"),
    });
  });
}
