/*
 * Cookie / privacy preference manager for the LINK marketing site.
 *
 * Categories:
 *   necessary  — always on (preference storage, session chrome)
 *   analytics  — GA4 page views / consented measurement
 *   marketing  — heatmaps / session replay (Clarity etc.) + marketing events
 *
 * Nothing third-party loads until the visitor accepts the matching category.
 * Preferences persist in localStorage under LINK_CONSENT_V1.
 */

const STORAGE_KEY = "LINK_CONSENT_V1";

/** @typedef {{ necessary: true, analytics: boolean, marketing: boolean, ts: number, version: 1 }} ConsentState */

/** @type {((state: ConsentState) => void)[]} */
const listeners = [];

/** @returns {ConsentState | null} */
export function getConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1) return null;
    return {
      necessary: true,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
      ts: Number(parsed.ts) || Date.now(),
      version: 1,
    };
  } catch {
    return null;
  }
}

/** @param {Partial<Pick<ConsentState, "analytics" | "marketing">>} partial */
export function setConsent(partial) {
  /** @type {ConsentState} */
  const state = {
    necessary: true,
    analytics: !!partial.analytics,
    marketing: !!partial.marketing,
    ts: Date.now(),
    version: 1,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* private mode — still apply for this session */
  }
  listeners.forEach((fn) => fn(state));
  document.dispatchEvent(new CustomEvent("link:consent", { detail: state }));
  return state;
}

/** @param {(state: ConsentState) => void} fn */
export function onConsentChange(fn) {
  listeners.push(fn);
  const current = getConsent();
  if (current) fn(current);
}

export function hasAnalyticsConsent() {
  return !!getConsent()?.analytics;
}

export function hasMarketingConsent() {
  return !!getConsent()?.marketing;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function bannerHtml() {
  return `
    <div class="consent-banner" data-consent-banner role="dialog" aria-modal="false" aria-labelledby="consent-title" aria-describedby="consent-desc">
      <div class="consent-banner__inner">
        <div class="consent-banner__copy">
          <p id="consent-title" class="consent-banner__title">Cookies &amp; measurement</p>
          <p id="consent-desc" class="consent-banner__text">
            We use necessary cookies to remember this choice. Analytics and marketing tools
            (page measurement, heatmaps) stay off until you opt in — and only load when a real
            project ID is configured. See
            <a href="/privacy.html#site-cookies">Privacy</a>.
          </p>
        </div>
        <div class="consent-banner__actions">
          <button type="button" class="btn btn--secondary" data-consent-reject>Necessary only</button>
          <button type="button" class="btn btn--secondary" data-consent-customize>Customize</button>
          <button type="button" class="btn btn--primary" data-consent-accept>Accept all</button>
        </div>
      </div>
      <form class="consent-banner__panel" data-consent-panel hidden>
        <fieldset>
          <legend>Preference categories</legend>
          <label class="consent-option">
            <input type="checkbox" checked disabled />
            <span><strong>Necessary</strong> — stores this preference; always on.</span>
          </label>
          <label class="consent-option">
            <input type="checkbox" name="analytics" data-consent-analytics />
            <span><strong>Analytics</strong> — page views via Google Analytics when configured.</span>
          </label>
          <label class="consent-option">
            <input type="checkbox" name="marketing" data-consent-marketing />
            <span><strong>Marketing</strong> — heatmaps / session analytics (e.g. Clarity) when configured.</span>
          </label>
        </fieldset>
        <div class="consent-banner__actions">
          <button type="button" class="btn btn--secondary" data-consent-cancel>Cancel</button>
          <button type="submit" class="btn btn--primary">Save preferences</button>
        </div>
      </form>
    </div>
  `;
}

function prefsLinkHtml() {
  return `<button type="button" class="consent-prefs-link" data-consent-reopen>Cookie preferences</button>`;
}

function mountBanner() {
  if (document.querySelector("[data-consent-banner]")) return;
  document.body.insertAdjacentHTML("beforeend", bannerHtml());

  const root = document.querySelector("[data-consent-banner]");
  const panel = root?.querySelector("[data-consent-panel]");
  const analyticsBox = root?.querySelector("[data-consent-analytics]");
  const marketingBox = root?.querySelector("[data-consent-marketing]");

  const hide = () => {
    if (root) root.hidden = true;
  };
  const show = () => {
    if (root) {
      root.hidden = false;
      root.querySelector("[data-consent-accept]")?.focus();
    }
  };

  root?.querySelector("[data-consent-accept]")?.addEventListener("click", () => {
    setConsent({ analytics: true, marketing: true });
    hide();
  });

  root?.querySelector("[data-consent-reject]")?.addEventListener("click", () => {
    setConsent({ analytics: false, marketing: false });
    hide();
  });

  root?.querySelector("[data-consent-customize]")?.addEventListener("click", () => {
    if (!panel) return;
    const current = getConsent();
    if (analyticsBox) analyticsBox.checked = !!current?.analytics;
    if (marketingBox) marketingBox.checked = !!current?.marketing;
    panel.hidden = false;
  });

  root?.querySelector("[data-consent-cancel]")?.addEventListener("click", () => {
    if (panel) panel.hidden = true;
  });

  panel?.addEventListener("submit", (event) => {
    event.preventDefault();
    setConsent({
      analytics: !!analyticsBox?.checked,
      marketing: !!marketingBox?.checked,
    });
    hide();
  });

  return { show, hide };
}

/**
 * Mount banner if no preference yet; always expose a footer reopen control.
 */
export function initConsent() {
  const ui = mountBanner();

  // Footer reopen control (idempotent) — after banner so click handlers can bind.
  const footerMeta = document.querySelector(".footer-meta");
  if (footerMeta && !document.querySelector("[data-consent-reopen]")) {
    footerMeta.insertAdjacentHTML("beforeend", prefsLinkHtml());
  }

  document.querySelectorAll("[data-consent-reopen]").forEach((btn) => {
    if (btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", () => {
      const panel = document.querySelector("[data-consent-panel]");
      const analyticsBox = document.querySelector("[data-consent-analytics]");
      const marketingBox = document.querySelector("[data-consent-marketing]");
      const current = getConsent();
      if (analyticsBox) analyticsBox.checked = !!current?.analytics;
      if (marketingBox) marketingBox.checked = !!current?.marketing;
      if (panel) panel.hidden = false;
      ui?.show();
    });
  });

  const existing = getConsent();
  if (existing) {
    const banner = document.querySelector("[data-consent-banner]");
    if (banner) banner.hidden = true;
  } else {
    ui?.show();
  }
}

/** For privacy page copy helpers */
export function consentSummaryText() {
  const c = getConsent();
  if (!c) return "No preference saved yet.";
  const bits = ["Necessary"];
  if (c.analytics) bits.push("Analytics");
  if (c.marketing) bits.push("Marketing");
  return `Saved preference: ${bits.join(", ")}.`;
}

// Keep unused escape for future dynamic labels
void escapeHtml;
