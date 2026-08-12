/**
 * Illustrative CDP Admin interactions (professor demo only).
 * No real ad, CRM, or partner APIs are called.
 */

import { logoutCdpAdmin, requireCdpAuth } from "./cdp-auth.js";

function wireLogout() {
  document.querySelectorAll("[data-cdp-logout]").forEach((btn) => {
    btn.addEventListener("click", () => {
      logoutCdpAdmin();
      window.location.replace("/cdp-login.html");
    });
  });
}

export function initCdpAdminPage() {
  const isCdpPage =
    Boolean(document.querySelector("[data-cdp-activate]")) ||
    Boolean(document.querySelector(".cdp-banner"));
  if (!isCdpPage) return;

  if (!requireCdpAuth("/cdp-login.html")) return;

  wireLogout();

  const root = document.querySelector("[data-cdp-activate]");
  if (!root) return;

  const btn = root.querySelector("[data-cdp-activate-btn]");
  const chip = root.querySelector("[data-cdp-queue-chip]");
  const queue = root.querySelector("[data-cdp-queue]");
  const toast = document.querySelector("[data-cdp-toast]");
  if (!btn || !chip || !queue || !toast) return;

  let hideTimer = 0;

  const showToast = (message) => {
    toast.textContent = message;
    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add("is-visible"));
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
      window.setTimeout(() => {
        toast.hidden = true;
      }, 280);
    }, 4200);
  };

  btn.addEventListener("click", () => {
    if (root.classList.contains("is-queued")) {
      showToast("Already queued (simulated) — Kent is in Ad audience · 1 profile.");
      return;
    }

    root.classList.add("is-queued");
    btn.textContent = "Queued for ads";
    btn.setAttribute("aria-disabled", "true");
    chip.hidden = false;
    queue.hidden = false;

    showToast(
      "Simulated: Kent OldKiwi queued to LINE, Meta (hashed), and IHG partner offer. No real ads sent."
    );
  });
}
