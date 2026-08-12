import "lenis/dist/lenis.css";
import { initAnalytics } from "./analytics.js";
import { initConsent } from "./consent.js";
import { initHeatmap } from "./heatmap.js";
import { mountMarks } from "./brand.js";
import { mountChrome } from "./chrome.js";
import { mountIcons } from "./icons.js";
import { initInteractions } from "./main.js";
import { initMotion } from "./motion.js";
import { initTracking } from "./tracking.js";
import { initAuth } from "./auth.js";
import { initLoginPage } from "./login-page.js";
import { initDashboardPage } from "./dashboard-page.js";

async function boot() {
  await initAuth();
  mountChrome();
  initConsent();
  initAnalytics();
  initHeatmap();
  mountMarks();
  mountIcons();
  initInteractions();
  initTracking();
  initMotion();
  await initLoginPage();
  await initDashboardPage();
}

boot();
