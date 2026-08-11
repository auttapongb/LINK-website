/*
 * Consent-gated marketing event hooks.
 * Marks CTAs with data-track="event_name" (optional data-track-label).
 */

import { trackEvent } from "./analytics.js";
import { hasAnalyticsConsent } from "./consent.js";

/**
 * Published event schema (fires only with Analytics consent + real GA ID):
 *   hero_cta | nav_cta | plan_cta | brand_cta | consumer_cta | data_cta
 *   pilot_interest_submit
 * Product events (app / future): pool_started | consent_accepted | goal_completed
 */
export function initTracking() {
  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const el = target.closest("[data-track]");
      if (!el) return;

      const name = el.getAttribute("data-track") || "cta_click";
      const label = el.getAttribute("data-track-label") || el.textContent?.trim()?.slice(0, 80) || "";
      const href = el instanceof HTMLAnchorElement ? el.getAttribute("href") || "" : "";

      // Conversion events require Analytics consent (and a loaded gtag via trackEvent).
      if (!hasAnalyticsConsent()) return;

      trackEvent(name, {
        event_category: "engagement",
        event_label: label,
        link_url: href,
        page_path: window.location.pathname,
      });
    },
    { capture: true }
  );

  document.querySelectorAll("[data-interest-form]").forEach((form) => {
    form.addEventListener("submit", () => {
      if (!hasAnalyticsConsent()) return;
      trackEvent("pilot_interest_submit", {
        event_category: "conversion",
        page_path: window.location.pathname,
      });
    });
  });
}
