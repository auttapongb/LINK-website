/*
 * Heatmap / session analytics readiness (Microsoft Clarity-style stub).
 *
 * Default: no third-party scripts. Nothing phones home.
 *
 * Gating (all must be true before Clarity loads):
 *   1. A real Clarity project ID is configured
 *   2. The visitor has granted Marketing consent (cookie banner)
 *
 * To enable:
 *   1. Set CLARITY_PROJECT_ID below to your Clarity project ID, OR
 *   2. Set window.LINK_CLARITY_ID = "…" before this module runs
 *
 * Fake / placeholder IDs are rejected. See README → “Analytics & heatmaps”.
 */

import { hasMarketingConsent, onConsentChange } from "./consent.js";

/** @type {string} Placeholder — leave empty, or replace with a real Clarity ID. */
export const CLARITY_PROJECT_ID = "";

let loadedId = "";

function resolveId() {
  if (typeof window !== "undefined" && typeof window.LINK_CLARITY_ID === "string") {
    const fromWindow = window.LINK_CLARITY_ID.trim();
    if (isRealId(fromWindow)) return fromWindow;
  }
  const fromConst = (CLARITY_PROJECT_ID || "").trim();
  if (isRealId(fromConst)) return fromConst;
  return "";
}

function isRealId(id) {
  if (!id) return false;
  // Reject obvious placeholders
  if (/^(YOUR|XXX|PLACEHOLDER|CLARITY|TEST)/i.test(id)) return false;
  if (/^x+$/i.test(id)) return false;
  // Clarity IDs are typically alphanumeric, ~8–14 chars
  return /^[A-Za-z0-9]{8,20}$/.test(id);
}

function loadClarity(id) {
  if (!id || typeof document === "undefined" || loadedId === id) return;
  loadedId = id;

  // Official Clarity snippet pattern — only after real ID + marketing consent.
  (function (c, l, a, r, i, t, y) {
    c[a] =
      c[a] ||
      function () {
        // eslint-disable-next-line prefer-rest-params
        (c[a].q = c[a].q || []).push(arguments);
      };
    t = l.createElement(r);
    t.async = 1;
    t.src = "https://www.clarity.ms/tag/" + i;
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", id);
}

/**
 * Attempt to load Clarity when project ID + marketing consent are both present.
 */
export function initHeatmap() {
  const tryLoad = () => {
    if (!hasMarketingConsent()) return;
    const id = resolveId();
    if (id) loadClarity(id);
  };

  tryLoad();
  onConsentChange(tryLoad);
}
