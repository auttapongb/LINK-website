/**
 * Capture report-ready screenshots of live LINK marketing + CDP Admin.
 * Prefer https://link.afolio.co ; fall back to local preview if needed.
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = __dirname;
const PNG = path.join(OUT, 'png');
const BASE_LIVE = 'https://link.afolio.co';
const FAILED = [];
const CAPTURED = [];

fs.mkdirSync(PNG, { recursive: true });

const MANIFEST = [];

function addShot(file, title, caption, section) {
  MANIFEST.push({ file, title, caption, section });
}

async function settle(page, ms = 900) {
  await page.waitForTimeout(ms);
  await Promise.race([
    page.evaluate(async () => {
      try {
        if (document.fonts?.ready) {
          await Promise.race([
            document.fonts.ready,
            new Promise((r) => setTimeout(r, 2500)),
          ]);
        }
      } catch {}
      const imgs = [...document.images].slice(0, 40);
      await Promise.all(
        imgs.map(
          (img) =>
            img.complete
              ? Promise.resolve()
              : new Promise((res) => {
                  const done = () => res();
                  img.addEventListener('load', done, { once: true });
                  img.addEventListener('error', done, { once: true });
                  setTimeout(done, 3000);
                })
        )
      );
    }),
    new Promise((r) => setTimeout(r, 5000)),
  ]).catch(() => {});
  await page.waitForTimeout(250);
}

async function dismissConsent(page, { captureFirst = false, name = null } = {}) {
  const banner = page.locator('[data-consent-banner]');
  const visible = await banner.isVisible().catch(() => false);
  if (!visible) return false;
  if (captureFirst && name) {
    await page.screenshot({ path: path.join(PNG, name), fullPage: false, type: 'png' });
    CAPTURED.push(name);
  }
  const accept = page.locator('[data-consent-accept]');
  if (await accept.isVisible().catch(() => false)) {
    await accept.click();
    await page.waitForTimeout(300);
  }
  return true;
}

async function shotViewport(page, name) {
  const dest = path.join(PNG, name);
  await page.screenshot({ path: dest, fullPage: false, type: 'png' });
  CAPTURED.push(name);
  return dest;
}

async function shotElement(page, selector, name) {
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await settle(page, 500);
  const box = await el.boundingBox();
  if (!box) {
    FAILED.push(`${name} (missing ${selector})`);
    return null;
  }
  // Prefer clipping to viewport-sized frame around element when tall
  const vp = page.viewportSize();
  const clipY = Math.max(0, box.y - 24);
  const clipH = Math.min(vp.height - 40, Math.max(box.height + 48, 420));
  await page.screenshot({
    path: path.join(PNG, name),
    type: 'png',
    clip: {
      x: 0,
      y: clipY,
      width: vp.width,
      height: Math.min(clipH, vp.height),
    },
  });
  CAPTURED.push(name);
  return name;
}

async function gotoSafe(page, url, label) {
  try {
    console.log('→', label, url);
    // Avoid networkidle — analytics/Clarity can keep the network busy forever.
    const res = await page.goto(url, { waitUntil: 'commit', timeout: 30000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 20000 }).catch(() => {});
    if (!res || (res.status() >= 400 && res.status() !== 404)) {
      // soft-fail only if we truly got nothing
      if (!res) {
        FAILED.push(`${label}: no response`);
        return false;
      }
      if (res.status() >= 500) {
        FAILED.push(`${label}: HTTP ${res.status()}`);
        return false;
      }
    }
    await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {});
    await settle(page, 1600);
    console.log('✓', label, 'status', res?.status());
    return true;
  } catch (e) {
    FAILED.push(`${label}: ${e.message}`);
    console.log('✗', label, e.message);
    return false;
  }
}

async function probeBase() {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12000);
    const r = await fetch(BASE_LIVE + '/', { method: 'HEAD', signal: ctrl.signal });
    clearTimeout(t);
    if (r.ok) return BASE_LIVE;
  } catch {
    /* fall through */
  }
  return null;
}

async function main() {
  let base = await probeBase();
  if (!base) {
    console.error('Live site unreachable; aborting (start local preview and re-run with BASE override).');
    process.exit(1);
  }
  console.log('Base URL:', base);

  const browser = await chromium.launch({ headless: true });
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    colorScheme: 'light',
  });
  // Hide cursor artifacts
  await desktop.addInitScript(() => {
    const style = document.createElement('style');
    style.textContent = `*, *::before, *::after { cursor: none !important; }`;
    document.documentElement.appendChild(style);
  });

  const page = await desktop.newPage();
  // Block noisy third-party trackers that can delay settle / hang network
  await page.route(/googletagmanager|google-analytics|clarity\.ms|doubleclick|facebook\.net/i, (route) =>
    route.abort()
  );

  // ——— Consumer: Home ———
  if (await gotoSafe(page, base + '/', 'Home')) {
    const hadBanner = await dismissConsent(page, {
      captureFirst: true,
      name: '00-cookie-banner.png',
    });
    if (hadBanner) {
      addShot(
        '00-cookie-banner.png',
        'Cookie / consent banner',
        'Consent gate on first visit — documents privacy posture for the course report.',
        'Consumer site'
      );
    }
    await settle(page, 1200);
    await shotViewport(page, '01-home-hero.png');
    addShot(
      '01-home-hero.png',
      'Home hero',
      'Brand-led first viewport with Family Pool phone — the core “worth more together” promise.',
      'Consumer site'
    );

    // Lower sell sections
    const pool = page.locator('#problem, .pooled, [data-pooled], section').filter({ hasText: /pool|together|points/i }).first();
    await page.evaluate(() => window.scrollTo(0, Math.round(document.body.scrollHeight * 0.28)));
    await settle(page, 700);
    await shotViewport(page, '02-home-concept-mid.png');
    addShot(
      '02-home-concept-mid.png',
      'Home · concept mid-page',
      'Problem/pool storytelling that sells why scattered loyalty balances need LINK.',
      'Consumer site'
    );

    await page.evaluate(() => window.scrollTo(0, Math.round(document.body.scrollHeight * 0.55)));
    await settle(page, 700);
    await shotViewport(page, '03-home-partners-cta.png');
    addShot(
      '03-home-partners-cta.png',
      'Home · partners / CTA band',
      'Partner ecosystem and conversion CTAs that close the marketing narrative.',
      'Consumer site'
    );
  }

  // ——— How it works ———
  if (await gotoSafe(page, base + '/how-it-works.html', 'How it works')) {
    await dismissConsent(page);
    await settle(page, 1000);
    await shotViewport(page, '04-how-it-works-piggy.png');
    addShot(
      '04-how-it-works-piggy.png',
      'How it works · piggy hero',
      'Connect → Pool → Use together, anchored by the piggy/partner visual.',
      'Consumer site'
    );
  }

  // ——— For families ———
  if (await gotoSafe(page, base + '/for-families.html', 'For families')) {
    await dismissConsent(page);
    await settle(page, 900);
    await shotViewport(page, '05-for-families.png');
    addShot(
      '05-for-families.png',
      'For families',
      'Household roles (Nan, Wit, Ploy) — who earns, who pools, who burns.',
      'Consumer site'
    );
  }

  // ——— Partners ———
  if (await gotoSafe(page, base + '/partners.html', 'Partners')) {
    await dismissConsent(page);
    await settle(page, 900);
    await shotViewport(page, '06-partners.png');
    addShot(
      '06-partners.png',
      'Partners',
      'Partner value proposition for Lotus’s, AIS, BTS, iBerry, IHG — ecosystem proof.',
      'Consumer site'
    );
  }

  // ——— Earn to burn ———
  if (await gotoSafe(page, base + '/earn-to-burn.html', 'Earn to burn')) {
    await dismissConsent(page);
    await settle(page, 900);
    await shotViewport(page, '07-earn-to-burn.png');
    addShot(
      '07-earn-to-burn.png',
      'Earn to burn',
      'Earn→pool→goal→burn loop that links everyday spend to a family getaway.',
      'Consumer site'
    );
  }

  // ——— Demo ———
  if (await gotoSafe(page, base + '/demo.html', 'Demo')) {
    await dismissConsent(page);
    await settle(page, 1000);
    await shotViewport(page, '08-demo.png');
    addShot(
      '08-demo.png',
      'Demo',
      'Interactive product demo surface for evaluators and partners.',
      'Consumer site'
    );
  }

  // ——— Mobile hero ———
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  await mobile.addInitScript(() => {
    const style = document.createElement('style');
    style.textContent = `*, *::before, *::after { cursor: none !important; }`;
    document.documentElement.appendChild(style);
  });
  const mpage = await mobile.newPage();
  await mpage.route(/googletagmanager|google-analytics|clarity\.ms|doubleclick|facebook\.net/i, (route) =>
    route.abort()
  );
  if (await gotoSafe(mpage, base + '/', 'Home mobile')) {
    await dismissConsent(mpage);
    await settle(mpage, 1200);
    await mpage.screenshot({ path: path.join(PNG, '09-home-hero-mobile.png'), fullPage: false, type: 'png' });
    CAPTURED.push('09-home-hero-mobile.png');
    addShot(
      '09-home-hero-mobile.png',
      'Home hero · mobile',
      '390px frame showing phone-first Family Pool presentation.',
      'Consumer site'
    );
  }
  if (await gotoSafe(mpage, base + '/how-it-works.html', 'How it works mobile')) {
    await dismissConsent(mpage);
    await settle(mpage, 900);
    await mpage.screenshot({ path: path.join(PNG, '10-how-it-works-mobile.png'), fullPage: false, type: 'png' });
    CAPTURED.push('10-how-it-works-mobile.png');
    addShot(
      '10-how-it-works-mobile.png',
      'How it works · mobile',
      'Mobile piggy hero — report-ready proof of responsive storytelling.',
      'Consumer site'
    );
  }
  await mobile.close();

  // ——— CDP Admin ———
  // Seed session before navigation so we land on admin, not login
  await page.addInitScript(() => {
    sessionStorage.setItem(
      'link_cdp_admin_session',
      JSON.stringify({ user: 'kent', at: Date.now() })
    );
  });

  // Also capture login screen once (fresh context without session)
  const loginCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const loginPage = await loginCtx.newPage();
  await loginPage.route(/googletagmanager|google-analytics|clarity\.ms|doubleclick|facebook\.net/i, (route) =>
    route.abort()
  );
  if (await gotoSafe(loginPage, base + '/cdp-login.html', 'CDP login')) {
    await dismissConsent(loginPage);
    await settle(loginPage, 700);
    await loginPage.screenshot({ path: path.join(PNG, '11-cdp-login.png'), fullPage: false, type: 'png' });
    CAPTURED.push('11-cdp-login.png');
    addShot(
      '11-cdp-login.png',
      'CDP Admin login',
      'Professor gate (demo credentials) before the simulated CDP workspace.',
      'CDP Admin'
    );
    // Real login path
    await loginPage.fill('#cdp-username', 'kent');
    await loginPage.fill('#cdp-password', '2026');
    await Promise.all([
      loginPage.waitForURL(/cdp-admin/, { timeout: 15000 }).catch(() => null),
      loginPage.click('button[type="submit"]'),
    ]);
    await settle(loginPage, 1400);
  }

  // Use authenticated page for CDP shots
  const cdp = loginPage.url().includes('cdp-admin') ? loginPage : page;
  if (!loginPage.url().includes('cdp-admin')) {
    if (!(await gotoSafe(page, base + '/cdp-admin.html', 'CDP admin'))) {
      // try login flow on page
      await page.goto(base + '/cdp-login.html', { waitUntil: 'domcontentloaded' });
      await page.fill('#cdp-username', 'kent');
      await page.fill('#cdp-password', '2026');
      await page.click('button[type="submit"]');
      await page.waitForURL(/cdp-admin/, { timeout: 15000 });
      await settle(page, 1400);
    }
  }

  const admin = loginPage.url().includes('cdp-admin') ? loginPage : page;
  await dismissConsent(admin);
  await settle(admin, 1500);

  // Overview / KPI strip (+ course rail)
  await admin.evaluate(() => window.scrollTo(0, 0));
  await settle(admin, 600);
  await admin.screenshot({ path: path.join(PNG, '12-cdp-overview-kpis.png'), fullPage: false, type: 'png' });
  CAPTURED.push('12-cdp-overview-kpis.png');
  addShot(
    '12-cdp-overview-kpis.png',
    'CDP overview · KPI strip',
    'Pilot KPIs with course rail visible — unify → segment → activate → measure framing.',
    'CDP Admin'
  );

  // Identity Kent
  const idPanel = admin.locator('#unify, .cdp-panel--id').first();
  if (await idPanel.count()) {
    await idPanel.scrollIntoViewIfNeeded();
    await settle(admin, 800);
    await admin.screenshot({ path: path.join(PNG, '13-cdp-identity-kent.png'), fullPage: false, type: 'png' });
    CAPTURED.push('13-cdp-identity-kent.png');
    addShot(
      '13-cdp-identity-kent.png',
      'Identity graph · Kent OldKiwi',
      'Golden-record profile with photo, traits, and resolved partner IDs.',
      'CDP Admin'
    );
  } else {
    FAILED.push('13-cdp-identity-kent.png');
  }

  // Partner tiles
  const partners = admin.locator('.cdp-partners, .cdp-partners__grid').first();
  if (await partners.count()) {
    await partners.scrollIntoViewIfNeeded();
    await settle(admin, 700);
    await admin.screenshot({ path: path.join(PNG, '14-cdp-partner-tiles.png'), fullPage: false, type: 'png' });
    CAPTURED.push('14-cdp-partner-tiles.png');
    addShot(
      '14-cdp-partner-tiles.png',
      'Partner mock data tiles',
      'Lotus’s, AIS, and other partner-sourced attributes on Kent’s profile.',
      'CDP Admin'
    );
  } else {
    FAILED.push('14-cdp-partner-tiles.png');
  }

  // Flag for ads
  const flagBtn = admin.locator('[data-cdp-activate-btn]');
  if (await flagBtn.count()) {
    await flagBtn.scrollIntoViewIfNeeded();
    await settle(admin, 400);
    await flagBtn.click();
    await settle(admin, 600);
    await admin.screenshot({ path: path.join(PNG, '15-cdp-flag-for-ads.png'), fullPage: false, type: 'png' });
    CAPTURED.push('15-cdp-flag-for-ads.png');
    addShot(
      '15-cdp-flag-for-ads.png',
      'Flag for ads · activation',
      'Activation moment: queue Kent to LINE / Meta / IHG offer destinations.',
      'CDP Admin'
    );
  } else {
    FAILED.push('15-cdp-flag-for-ads.png');
  }

  // AI propensity
  const ai = admin.locator('#propensity').first();
  if (await ai.count()) {
    await ai.scrollIntoViewIfNeeded();
    await settle(admin, 900);
    await admin.screenshot({ path: path.join(PNG, '16-cdp-ai-propensity.png'), fullPage: false, type: 'png' });
    CAPTURED.push('16-cdp-ai-propensity.png');
    addShot(
      '16-cdp-ai-propensity.png',
      'AI propensity · Q4 2026 travel',
      'Travel propensity panel — predictive segment that drives partner offers.',
      'CDP Admin'
    );
  } else {
    FAILED.push('16-cdp-ai-propensity.png');
  }

  // Funnel
  const funnel = admin.locator('#funnel').first();
  if (await funnel.count()) {
    await funnel.scrollIntoViewIfNeeded();
    await settle(admin, 700);
    await admin.screenshot({ path: path.join(PNG, '17-cdp-funnel.png'), fullPage: false, type: 'png' });
    CAPTURED.push('17-cdp-funnel.png');
    addShot(
      '17-cdp-funnel.png',
      'Conversion funnel',
      'Join → Earn → Pool → Goal → Burn measurement for the earn-to-burn loop.',
      'CDP Admin'
    );
  } else {
    FAILED.push('17-cdp-funnel.png');
  }

  // Course rail emphasis (scroll top, ensure rail in frame)
  await admin.evaluate(() => window.scrollTo(0, 0));
  await settle(admin, 400);
  const rail = admin.locator('.course-rail, [data-course-rail]').first();
  if (await rail.count()) {
    await admin.screenshot({ path: path.join(PNG, '18-cdp-course-rail.png'), fullPage: false, type: 'png' });
    CAPTURED.push('18-cdp-course-rail.png');
    addShot(
      '18-cdp-course-rail.png',
      'Course materials rail',
      'Sidebar course rail — academic framing alongside the live CDP demo.',
      'CDP Admin'
    );
  }

  await browser.close();

  const manifestPath = path.join(OUT, 'manifest.json');
  fs.writeFileSync(
    manifestPath,
    JSON.stringify({ base, captured: CAPTURED, failed: FAILED, shots: MANIFEST }, null, 2)
  );
  console.log('Captured:', CAPTURED.length);
  console.log('Failed:', FAILED);
  console.log('Manifest:', manifestPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
