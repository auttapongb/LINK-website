import { initAuth, getAuthMode, getCurrentUser, loginWithEmail, registerWithEmail, loginWithGoogle } from "./auth.js";

function nextUrl() {
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next") || "/dashboard.html";
  if (!next.startsWith("/") || next.startsWith("//")) return "/dashboard.html";
  return next;
}

function setStatus(el, message, kind = "info") {
  if (!el) return;
  el.hidden = !message;
  el.textContent = message || "";
  el.dataset.kind = kind;
}

function wireTabs(root) {
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = [...root.querySelectorAll("[data-auth-panel]")];
  const activate = (id) => {
    tabs.forEach((tab) => {
      const selected = tab.getAttribute("aria-controls") === id;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((panel) => {
      panel.hidden = panel.id !== id;
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(tab.getAttribute("aria-controls")));
    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const next =
        event.key === "ArrowRight"
          ? (index + 1) % tabs.length
          : (index - 1 + tabs.length) % tabs.length;
      tabs[next].focus();
      activate(tabs[next].getAttribute("aria-controls"));
    });
  });
}

export async function initLoginPage() {
  const root = document.querySelector("[data-login]");
  if (!root) return;

  await initAuth();
  if (getCurrentUser()) {
    window.location.replace(nextUrl());
    return;
  }

  const mode = getAuthMode();
  const modeBadge = root.querySelector("[data-auth-mode]");
  const status = root.querySelector("[data-auth-status]");
  const googleBtn = root.querySelector("[data-google-login]");
  const googleHint = root.querySelector("[data-google-hint]");

  if (modeBadge) {
    modeBadge.textContent =
      mode === "firebase"
        ? "Firebase Auth connected"
        : "Local demo auth — Firebase env not set";
    modeBadge.dataset.mode = mode;
  }

  if (googleBtn) {
    if (mode === "firebase") {
      googleBtn.textContent = "Continue with Google";
      if (googleHint) googleHint.hidden = true;
    } else {
      googleBtn.textContent = "Continue with demo Google account";
      if (googleHint) {
        googleHint.hidden = false;
        googleHint.textContent =
          "Demo mode only — this does not contact Google. Configure Firebase (see README) for real Google sign-in.";
      }
    }
  }

  wireTabs(root);

  root.querySelector("[data-login-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const email = form.querySelector("#login-email")?.value;
    const password = form.querySelector("#login-password")?.value;
    setStatus(status, "Signing in…");
    try {
      await loginWithEmail(email, password);
      window.location.assign(nextUrl());
    } catch (err) {
      setStatus(status, err?.message || "Could not sign in.", "error");
    }
  });

  root.querySelector("[data-register-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = form.querySelector("#register-name")?.value;
    const email = form.querySelector("#register-email")?.value;
    const password = form.querySelector("#register-password")?.value;
    setStatus(status, "Creating account…");
    try {
      await registerWithEmail(email, password, name);
      window.location.assign(nextUrl());
    } catch (err) {
      setStatus(status, err?.message || "Could not register.", "error");
    }
  });

  googleBtn?.addEventListener("click", async () => {
    setStatus(status, mode === "firebase" ? "Opening Google…" : "Starting demo Google session…");
    try {
      await loginWithGoogle({ allowDemo: true });
      window.location.assign(nextUrl());
    } catch (err) {
      setStatus(status, err?.message || "Google sign-in failed.", "error");
    }
  });
}
