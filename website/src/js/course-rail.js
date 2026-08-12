/**
 * Sticky left rail for evaluator / course materials only.
 * Opt-in via [data-course-rail] — never injected into consumer marketing pages.
 */

const COURSE_LINKS = [
  { href: "/for-evaluators.html", label: "Course hub", key: "evaluators" },
  { href: "/marketing-plan.html", label: "Marketing plan", key: "plan" },
  { href: "/brand-platform.html", label: "Brand platform", key: "brand" },
  { href: "/consumer-insight.html", label: "Consumer insight", key: "consumer" },
  { href: "/market-evidence.html", label: "Market evidence", key: "evidence" },
  { href: "/data-strategy.html", label: "Data strategy", key: "data" },
  { href: "/cdp-admin.html", label: "CDP Admin", key: "cdp" },
  { href: "/demo.html", label: "Live demo", key: "demo" },
  { href: "/sitemap.html", label: "Sitemap", key: "sitemap" },
];

function pageKey() {
  const path = window.location.pathname.replace(/\\/g, "/");
  if (path.endsWith("/for-evaluators.html")) return "evaluators";
  if (path.endsWith("/marketing-plan.html")) return "plan";
  if (path.endsWith("/brand-platform.html")) return "brand";
  if (path.endsWith("/consumer-insight.html")) return "consumer";
  if (path.endsWith("/market-evidence.html")) return "evidence";
  if (path.endsWith("/data-strategy.html")) return "data";
  if (path.endsWith("/cdp-admin.html")) return "cdp";
  if (path.endsWith("/demo.html")) return "demo";
  if (path.endsWith("/sitemap.html")) return "sitemap";
  return "";
}

export function mountCourseRail() {
  const host = document.querySelector("[data-course-rail]");
  if (!host) return;

  const key = pageKey();
  const lite = host.hasAttribute("data-course-rail-lite");
  if (lite) host.classList.add("course-rail--lite");

  const items = COURSE_LINKS.map((link) => {
    const current = key && link.key === key ? ' aria-current="page"' : "";
    return `<li><a href="${link.href}"${current}>${link.label}</a></li>`;
  }).join("");

  const logout =
    key === "cdp"
      ? `<button type="button" class="course-rail__logout" data-cdp-logout>Log out of CDP</button>`
      : "";

  host.innerHTML = `
    <p class="course-rail__label">Course pack</p>
    <ul class="course-rail__nav">${items}</ul>
    ${logout}
  `;
}
