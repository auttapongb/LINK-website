const PAGES = [
  { href: "/how-it-works.html", label: "How it works", key: "how" },
  { href: "/for-families.html", label: "For families", key: "families" },
  { href: "/use-cases.html", label: "Use cases", key: "usecases" },
  { href: "/partners.html", label: "Partners", key: "partners" },
  { href: "/privacy.html", label: "Privacy", key: "privacy" },
  { href: "/faq.html", label: "FAQ", key: "faq" },
];

function currentKey() {
  const path = window.location.pathname.replace(/\\/g, "/");
  if (path.endsWith("/how-it-works.html")) return "how";
  if (path.endsWith("/for-families.html")) return "families";
  if (path.endsWith("/use-cases.html")) return "usecases";
  if (path.endsWith("/partners.html")) return "partners";
  if (path.endsWith("/privacy.html")) return "privacy";
  if (path.endsWith("/faq.html")) return "faq";
  if (path.endsWith("/sitemap.html")) return "sitemap";
  if (path.endsWith("/demo.html")) return "demo";
  return "home";
}

function linkAttrs(key, pageKey) {
  return key === pageKey ? ' aria-current="page"' : "";
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

  const navLinks = PAGES.map(
    (p) => `<li><a href="${p.href}"${linkAttrs(key, p.key)}>${p.label}</a></li>`
  ).join("");

  headerHost.innerHTML = `
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header" data-site-header>
      <div class="shell nav">
        <a class="brand" href="/">
          <img class="brand__mark" src="/assets/logo.svg" width="64" height="32" alt="" />
          <span class="brand__word">LINK</span>
        </a>
        <nav aria-label="Primary">
          <ul class="nav__links">${navLinks}</ul>
        </nav>
        <a class="btn btn--primary nav__cta" href="/demo.html">Explore LINK<span data-icon="arrow-right"></span></a>
        <button class="nav__toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu">
          <span class="nav__toggle-bars" aria-hidden="true"><span></span><span></span><span></span></span>
        </button>
      </div>
      <div class="scroll-progress" data-scroll-progress aria-hidden="true"></div>
    </header>
    <div class="nav-drawer" data-nav-drawer hidden>
      <div class="nav-drawer__backdrop" data-nav-close></div>
      <div class="nav-drawer__panel" id="mobile-nav" role="dialog" aria-modal="true" aria-label="Menu">
        <a class="brand" href="/">
          <img class="brand__mark" src="/assets/logo.svg" width="64" height="32" alt="" />
          <span class="brand__word">LINK</span>
        </a>
        <ul class="nav-drawer__links">${navLinks}</ul>
        <a class="btn btn--primary" href="/demo.html" data-nav-close>Explore LINK</a>
        <button class="btn btn--secondary" type="button" data-nav-close>Close</button>
      </div>
    </div>
  `;

  footerHost.innerHTML = `
    <footer class="site-footer">
      <div class="shell footer-grid">
        <div class="footer-brand">
          <a class="brand" href="/">
            <img class="brand__mark" src="/assets/logo.svg" width="64" height="32" alt="" />
            <span class="brand__word">LINK</span>
          </a>
          <p class="footer-lockup">
            Worth More Together.
            <span>รวมกันคุ้มกว่า</span>
          </p>
        </div>
        <ul class="footer-nav">
          ${PAGES.map((p) => `<li><a href="${p.href}">${p.label}</a></li>`).join("")}
          <li><a href="/demo.html">Demo</a></li>
          <li><a href="/sitemap.html">Sitemap</a></li>
        </ul>
      </div>
      <div class="shell footer-meta">
        <p>© 2026 LINK. All rights reserved.</p>
        <p>LINK is a fictional pilot created for academic/illustrative purposes. Partner names and trademarks belong to their respective owners; no endorsement or affiliation is implied.</p>
      </div>
    </footer>
  `;
}
