export function initInteractions() {
  const header = document.querySelector("[data-site-header]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const drawer = document.querySelector("[data-nav-drawer]");
  const drawerCloseTargets = document.querySelectorAll("[data-nav-close]");

  function setDrawer(open) {
    if (!drawer || !toggle) return;
    drawer.hidden = !open;
    drawer.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      const firstLink = drawer.querySelector("a, button");
      firstLink?.focus();
    }
  }

  toggle?.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    setDrawer(open);
  });

  drawerCloseTargets.forEach((el) => {
    el.addEventListener("click", () => setDrawer(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setDrawer(false);
  });

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  document.querySelectorAll("[data-compare]").forEach((root) => {
    const buttons = root.querySelectorAll("[data-compare-btn]");
    const panels = root.querySelectorAll("[data-compare-panel]");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-compare-btn");
        buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        panels.forEach((panel) => {
          panel.classList.toggle("is-active", panel.getAttribute("data-compare-panel") === target);
        });
      });
    });
  });

  document.querySelectorAll("[data-steps]").forEach((root) => {
    const tabs = [...root.querySelectorAll("[role='tab']")];
    const panels = root.querySelectorAll("[data-step-panel]");
    const devices = document.querySelectorAll("[data-device-state]");

    const activate = (id) => {
      tabs.forEach((tab) => {
        const selected = tab.getAttribute("aria-controls") === id;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      panels.forEach((panel) => {
        panel.hidden = panel.id !== id;
      });
      devices.forEach((device) => {
        device.classList.toggle("is-active", device.getAttribute("data-device-state") === id);
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
  });

  const lightbox = document.querySelector("[data-lightbox]");
  const openLightbox = document.querySelector("[data-lightbox-open]");
  const closeLightbox = document.querySelectorAll("[data-lightbox-close]");

  openLightbox?.addEventListener("click", () => {
    if (!lightbox) return;
    lightbox.hidden = false;
    lightbox.querySelector("button")?.focus();
  });

  closeLightbox.forEach((el) => {
    el.addEventListener("click", () => {
      if (!lightbox) return;
      lightbox.hidden = true;
      openLightbox?.focus();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox && !lightbox.hidden) {
      lightbox.hidden = true;
      openLightbox?.focus();
    }
  });

  const demoModal = document.querySelector("[data-demo-modal]");
  // Remembered so closing can hand focus back to whatever opened the modal,
  // instead of dropping the keyboard user at the top of the document.
  let demoOpener = null;

  const closeDemoModal = () => {
    if (!demoModal || demoModal.hidden) return;
    demoModal.hidden = true;
    demoOpener?.focus();
    demoOpener = null;
  };

  document.querySelectorAll("[data-demo-modal-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!demoModal) return;
      demoOpener = btn;
      demoModal.hidden = false;
      demoModal.querySelector("button")?.focus();
    });
  });

  document.querySelectorAll("[data-demo-modal-close]").forEach((btn) => {
    btn.addEventListener("click", closeDemoModal);
  });

  // Escape is how everyone expects to leave a modal, and without it a keyboard
  // user was stuck inside this one.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDemoModal();
  });
}
