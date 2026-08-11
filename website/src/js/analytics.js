/*
 * Privacy-conscious analytics loader for the LINK marketing site.
 *
 * Default: no third-party scripts load. Nothing phones home.
 *
 * To enable Google Analytics 4 (gtag.js):
 *   1. Replace GA_MEASUREMENT_ID below with your real ID (G-XXXXXXXXXX), OR
 *   2. Set window.LINK_GA_ID = "G-XXXXXXXXXX" before this module runs
 *      (e.g. a small inline script in HTML for staging/prod only).
 *
 * Until a real ID is configured, initAnalytics() is a no-op.
 * See README.md → “Analytics”.
 */

/** @type {string} Placeholder — leave empty, or replace with a real GA4 ID. */
export const GA_MEASUREMENT_ID = "";

function resolveId() {
  if (typeof window !== "undefined" && typeof window.LINK_GA_ID === "string") {
    const fromWindow = window.LINK_GA_ID.trim();
    if (fromWindow && !/^G-X+$/i.test(fromWindow) && fromWindow !== "G-XXXXXXXXXX") {
      return fromWindow;
    }
  }
  const fromConst = (GA_MEASUREMENT_ID || "").trim();
  if (fromConst && !/^G-X+$/i.test(fromConst) && fromConst !== "G-XXXXXXXXXX") {
    return fromConst;
  }
  return "";
}

/**
 * Load gtag only when a real measurement ID is configured.
 * Safe to call on every page; no-ops when unset.
 */
export function initAnalytics() {
  const id = resolveId();
  if (!id || typeof document === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = window.gtag || gtag;

  gtag("js", new Date());
  gtag("config", id, {
    anonymize_ip: true,
    send_page_view: true,
  });

  const src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  if (document.querySelector(`script[src="${src}"]`)) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}
