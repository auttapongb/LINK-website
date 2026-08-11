/*
 * Privacy-conscious analytics loader for the LINK marketing site.
 *
 * Default: no third-party scripts load. Nothing phones home.
 *
 * Gating (all must be true before gtag loads):
 *   1. A real GA4 measurement ID is configured
 *   2. The visitor has granted Analytics consent (cookie banner)
 *
 * To enable Google Analytics 4 (gtag.js):
 *   1. Replace GA_MEASUREMENT_ID below with your real ID (G-XXXXXXXXXX), OR
 *   2. Set window.LINK_GA_ID = "G-XXXXXXXXXX" before this module runs
 *
 * Placeholder values such as G-XXXXXXXXXX are ignored on purpose.
 * See README.md → “Analytics & heatmaps”.
 */

import { hasAnalyticsConsent, onConsentChange } from "./consent.js";

/** @type {string} Placeholder — leave empty, or replace with a real GA4 ID. */
export const GA_MEASUREMENT_ID = "";

let loadedId = "";

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

function loadGtag(id) {
  if (!id || typeof document === "undefined" || loadedId === id) return;
  loadedId = id;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    // eslint-disable-next-line prefer-rest-params
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

/**
 * Attempt to load GA when ID + analytics consent are both present.
 * Safe to call on every page; no-ops when gated.
 */
export function initAnalytics() {
  const tryLoad = () => {
    if (!hasAnalyticsConsent()) return;
    const id = resolveId();
    if (id) loadGtag(id);
  };

  tryLoad();
  onConsentChange(tryLoad);
}

/**
 * Consent-gated custom event helper for CTA / conversion hooks.
 * No-ops unless analytics consent is granted and gtag is available.
 *
 * @param {string} name
 * @param {Record<string, unknown>} [params]
 */
export function trackEvent(name, params = {}) {
  if (!hasAnalyticsConsent()) return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}
