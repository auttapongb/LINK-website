/**
 * CDP Admin demo auth — separate from Family Admin (`auth.js`).
 * Client-side credentials for academic professor demo only.
 */

export const CDP_SESSION_KEY = "link_cdp_admin_session";

const DEMO_USER = "kent";
const DEMO_PASS = "2026";

/** @typedef {{ user: string, at: number }} CdpSession */

export function readCdpSession() {
  try {
    const raw = sessionStorage.getItem(CDP_SESSION_KEY);
    if (!raw) return null;
    const session = /** @type {CdpSession} */ (JSON.parse(raw));
    if (!session?.user) return null;
    return session;
  } catch {
    return null;
  }
}

export function isCdpAuthenticated() {
  return Boolean(readCdpSession());
}

export function loginCdpAdmin(username, password) {
  const user = String(username || "").trim().toLowerCase();
  const pass = String(password || "");
  if (user !== DEMO_USER || pass !== DEMO_PASS) {
    throw new Error("Incorrect username or password.");
  }
  const session = /** @type {CdpSession} */ ({ user: DEMO_USER, at: Date.now() });
  sessionStorage.setItem(CDP_SESSION_KEY, JSON.stringify(session));
  return session;
}

export function logoutCdpAdmin() {
  sessionStorage.removeItem(CDP_SESSION_KEY);
}

export function requireCdpAuth(redirectTo = "/cdp-login.html") {
  if (isCdpAuthenticated()) return readCdpSession();
  const next = encodeURIComponent(
    `${window.location.pathname}${window.location.search}${window.location.hash}`
  );
  window.location.replace(`${redirectTo}?next=${next}`);
  return null;
}

export function safeNextUrl(fallback = "/cdp-admin.html") {
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next") || fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}
