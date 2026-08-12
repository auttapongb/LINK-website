import { isCdpAuthenticated, loginCdpAdmin, safeNextUrl } from "./cdp-auth.js";

export function initCdpLoginPage() {
  const root = document.querySelector("[data-cdp-login]");
  if (!root) return;

  if (isCdpAuthenticated()) {
    window.location.replace(safeNextUrl());
    return;
  }

  const status = root.querySelector("[data-cdp-login-status]");
  const form = root.querySelector("[data-cdp-login-form]");

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = form.querySelector("#cdp-username")?.value;
    const password = form.querySelector("#cdp-password")?.value;
    if (status) {
      status.hidden = true;
      status.textContent = "";
    }
    try {
      loginCdpAdmin(username, password);
      window.location.assign(safeNextUrl());
    } catch (err) {
      if (status) {
        status.hidden = false;
        status.textContent = err?.message || "Could not sign in.";
        status.dataset.kind = "error";
      }
    }
  });
}
