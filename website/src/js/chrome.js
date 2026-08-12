import { brandSprite } from "./brand.js";
import { getCurrentUser, initialsFor, logout, onAuthChange } from "./auth.js";

/** Primary top nav — end-consumer marketing only. */
const NAV = [
  { href: "/how-it-works.html", label: "How it works", key: "how" },
  { href: "/for-families.html", label: "For families", key: "families" },
  { href: "/partners.html", label: "Partners", key: "partners" },
  { href: "/earn-to-burn.html", label: "Earn to burn", key: "earn" },
];

/** Light footer — consumer utility, no academic syllabus dump. */
const FOOTER = [
  { href: "/how-it-works.html", label: "How it works" },
  { href: "/for-families.html", label: "For families" },
  { href: "/partners.html", label: "Partners" },
  { href: "/earn-to-burn.html", label: "Earn to burn" },
  { href: "/demo.html", label: "Demo" },
  { href: "/login.html", label: "Log in" },
  { href: "/faq.html", label: "FAQ" },
  { href: "/privacy.html", label: "Privacy" },
  { href: "/sitemap.html", label: "Sitemap" },
];

// Thai campaign line, "ruam kan khum kwa" — the support line for
// "Worth More Together." Escaped so the source stays ASCII-safe.
const THAI_TAGLINE = "\u0E23\u0E27\u0E21\u0E01\u0E31\u0E19\u0E04\u0E38\u0E49\u0E21\u0E01\u0E27\u0E48\u0E32";

const BRAND_LOCKUP =
  '<a class="brand" href="/" aria-label="LINK home">' +
  '<svg class="brand__lockup" viewBox="0 0 278 136" aria-hidden="true" focusable="false">' +
  '<use href="#link-lockup"/></svg></a>';

function currentKey() {
  const path = window.location.pathname.replace(/\\/g, "/");
  if (path.endsWith("/how-it-works.html")) return "how";
  if (path.endsWith("/earn-to-burn.html")) return "earn";
  if (path.endsWith("/for-families.html")) return "families";
  if (path.endsWith("/use-cases.html")) return "usecases";
  if (path.endsWith("/partners.html")) return "partners";
  if (path.endsWith("/data-strategy.html")) return "data";
  if (path.endsWith("/marketing-plan.html")) return "plan";
  if (path.endsWith("/brand-platform.html")) return "brand";
  if (path.endsWith("/consumer-insight.html")) return "consumer";
  if (path.endsWith("/market-evidence.html")) return "evidence";
  if (path.endsWith("/for-evaluators.html")) return "evaluators";
  if (path.endsWith("/cdp-admin.html")) return "cdp";
  if (path.endsWith("/privacy.html")) return "privacy";
  if (path.endsWith("/faq.html")) return "faq";
  if (path.endsWith("/sitemap.html")) return "sitemap";
  if (path.endsWith("/demo.html")) return "demo";
  if (path.endsWith("/login.html")) return "login";
  if (path.endsWith("/dashboard.html")) return "dashboard";
  return "home";
}

function linkAttrs(key, pageKey) {
  return key === pageKey ? ' aria-current="page"' : "";
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderAuthUtils(user, key) {
  if (!user) {
    return `
      <div class="nav__utils" data-nav-auth>
        <a class="nav__auth-link" href="/login.html"${linkAttrs(key, "login")} data-track="nav_auth" data-track-label="login">Log in</a>
      </div>`;
  }
  const name = escapeHtml(user.displayName || user.email || "Member");
  const initials = escapeHtml(initialsFor(user));
  return `
    <div class="nav__utils" data-nav-auth>
      <a class="nav__auth-link" href="/dashboard.html"${linkAttrs(key, "dashboard")} data-track="nav_auth" data-track-label="dashboard">Dashboard</a>
      <div class="nav__user" title="${name}">
        <span class="nav__avatar" aria-hidden="true">${initials}</span>
        <span class="nav__user-name">${name}</span>
      </div>
      <button class="btn btn--secondary nav__logout" type="button" data-logout data-track="nav_auth" data-track-label="logout">Log out</button>
    </div>`;
}

function renderDrawerAuth(user) {
  if (!user) {
    return `
      <div class="nav-drawer__auth" data-drawer-auth>
        <a class="btn btn--secondary" href="/login.html" data-nav-close data-track="nav_auth" data-track-label="login_drawer">Log in</a>
      </div>`;
  }
  return `
    <div class="nav-drawer__auth" data-drawer-auth>
      <a class="btn btn--secondary" href="/dashboard.html" data-nav-close data-track="nav_auth" data-track-label="dashboard_drawer">Dashboard</a>
      <button class="btn btn--ghost" type="button" data-logout data-nav-close data-track="nav_auth" data-track-label="logout_drawer">Log out</button>
    </div>`;
}

function wireLogout(root = document) {
  root.querySelectorAll("[data-logout]").forEach((btn) => {
    if (btn.dataset.logoutBound) return;
    btn.dataset.logoutBound = "1";
    btn.addEventListener("click", async () => {
      const drawer = document.querySelector("[data-nav-drawer]");
      const toggle = document.querySelector("[data-nav-toggle]");
      if (drawer && !drawer.hidden) {
        drawer.hidden = true;
        drawer.classList.remove("is-open");
        toggle?.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
      await logout();
      if (window.location.pathname.replace(/\\/g, "/").endsWith("/dashboard.html")) {
        window.location.assign("/login.html");
      }
    });
  });
}

function refreshAuthChrome(user) {
  const key = currentKey();
  const utilsHost = document.querySelector("[data-nav-auth]");
  const drawerHost = document.querySelector("[data-drawer-auth]");
  if (utilsHost) {
    utilsHost.outerHTML = renderAuthUtils(user, key).trim();
  }
  if (drawerHost) {
    drawerHost.outerHTML = renderDrawerAuth(user).trim();
  }
  wireLogout();
}

export function mountChrome() {
  const key = currentKey();
  const headerHost = document.querySelector("[data-chrome-header]");
  const footerHost = document.querySelector("[data-chrome-footer]");
  if (!headerHost || !footerHost) return;

  if (!document.querySelector(".grain")) {
    const grain = document.createElement("div");
    grain.className = "grain";
    grain.setAttribute("aria-hidden", "true");
    document.body.appendChild(grain);
  }

  if (!document.querySelector(".brand-sprite")) {
    document.body.insertAdjacentHTML("afterbegin", brandSprite());
  }

  const navLinks = NAV.map(
    (p) => `<li><a href="${p.href}"${linkAttrs(key, p.key)}>${p.label}</a></li>`
  ).join("");

  // On the demo page, the primary CTA should not re-sell "Explore the demo".
  const primaryCta =
    key === "demo"
      ? `<a class="btn btn--primary nav__cta" href="/how-it-works.html" data-track="nav_cta" data-track-label="how_it_works">How it works<span data-icon="arrow-right"></span></a>`
      : key === "dashboard" || key === "login"
        ? `<a class="btn btn--primary nav__cta" href="/demo.html" data-track="nav_cta" data-track-label="explore_demo">Explore the demo<span data-icon="arrow-right"></span></a>`
        : `<a class="btn btn--primary nav__cta" href="/demo.html" data-track="nav_cta" data-track-label="explore_demo">Explore the demo<span data-icon="arrow-right"></span></a>`;
  const drawerCta =
    key === "demo"
      ? `<a class="btn btn--primary" href="/how-it-works.html" data-nav-close data-track="nav_cta" data-track-label="how_it_works_drawer">How it works</a>`
      : `<a class="btn btn--primary" href="/demo.html" data-nav-close data-track="nav_cta" data-track-label="explore_demo_drawer">Explore the demo</a>`;

  const user = getCurrentUser();

  headerHost.innerHTML = `
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header" data-site-header>
      <div class="shell nav">
        ${BRAND_LOCKUP}
        <nav aria-label="Primary">
          <ul class="nav__links">${navLinks}</ul>
        </nav>
        ${renderAuthUtils(user, key)}
        ${primaryCta}
        <button class="nav__toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu">
          <span class="nav__toggle-bars" aria-hidden="true"><span></span><span></span><span></span></span>
        </button>
      </div>
      <div class="scroll-progress" data-scroll-progress aria-hidden="true"></div>
    </header>
    <div class="nav-drawer" data-nav-drawer hidden>
      <div class="nav-drawer__backdrop" data-nav-close></div>
      <div class="nav-drawer__panel" id="mobile-nav" role="dialog" aria-modal="true" aria-label="Menu">
        ${BRAND_LOCKUP}
        <ul class="nav-drawer__links">${navLinks}</ul>
        ${renderDrawerAuth(user)}
        ${drawerCta}
        <button class="btn btn--secondary" type="button" data-nav-close>Close</button>
      </div>
    </div>
  `;

  footerHost.innerHTML = `
    <footer class="site-footer">
      <div class="shell footer-grid">
        <div class="footer-brand">
          ${BRAND_LOCKUP}
          <p class="footer-lockup">
            <span class="script">Worth More Together</span>
            <span class="footer-thai">${THAI_TAGLINE}</span>
          </p>
        </div>
        <ul class="footer-nav">
          ${FOOTER.map((p) => `<li><a href="${p.href}">${p.label}</a></li>`).join("")}
        </ul>
      </div>
      <div class="shell footer-meta">
        <p>© 2026 LINK. All rights reserved.</p>
        <p>LINK is a fictional pilot created for academic/illustrative purposes. Partner names and trademarks belong to their respective owners; no endorsement or affiliation is implied.</p>
      </div>
    </footer>
  `;

  wireLogout(headerHost);
  onAuthChange((nextUser) => refreshAuthChrome(nextUser));
}
