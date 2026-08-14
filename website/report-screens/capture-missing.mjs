/**
 * Capture missing CDP panels that sit further down the page.
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PNG = path.join(__dirname, 'png');
const BASE = 'https://link.afolio.co';

async function settle(page, ms = 1000) {
  await page.waitForTimeout(ms);
}

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'reduce',
});
const page = await ctx.newPage();
await page.route(/googletagmanager|google-analytics|clarity\.ms|doubleclick|facebook\.net/i, (r) =>
  r.abort()
);

await page.goto(BASE + '/cdp-login.html', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.fill('#cdp-username', 'kent');
await page.fill('#cdp-password', '2026');
await Promise.all([
  page.waitForURL(/cdp-admin/, { timeout: 15000 }),
  page.click('button[type="submit"]'),
]);
await settle(page, 1800);

// Dump section ids present
const ids = await page.evaluate(() =>
  [...document.querySelectorAll('[id]')].map((el) => el.id).filter(Boolean)
);
console.log('ids sample:', ids.filter((id) => /propensity|partner|unify|funnel|ai|activate/i.test(id)));

const texts = await page.evaluate(() => {
  const body = document.body.innerText;
  return {
    hasPartners: /Partner-sourced|Lotus/i.test(body),
    hasPropensity: /propensity|Q4 2026|Likely to travel/i.test(body),
    hasPartnersClass: Boolean(document.querySelector('.cdp-partners')),
    hasPropensityId: Boolean(document.querySelector('#propensity')),
  };
});
console.log(texts);

async function shotNear(selectorOrText, name, { byText = false } = {}) {
  let loc = byText
    ? page.getByText(selectorOrText, { exact: false }).first()
    : page.locator(selectorOrText).first();
  if (!(await loc.count())) {
    console.log('missing', name, selectorOrText);
    return false;
  }
  await loc.scrollIntoViewIfNeeded();
  await settle(page, 900);
  await page.screenshot({ path: path.join(PNG, name), fullPage: false, type: 'png' });
  console.log('saved', name);
  return true;
}

await shotNear('.cdp-partners', '14-cdp-partner-tiles.png');
if (!fs.existsSync(path.join(PNG, '14-cdp-partner-tiles.png'))) {
  await shotNear('Partner-sourced attributes', '14-cdp-partner-tiles.png', { byText: true });
}
if (!fs.existsSync(path.join(PNG, '14-cdp-partner-tiles.png'))) {
  // scroll through unify panel
  await page.locator('#unify').scrollIntoViewIfNeeded().catch(() => {});
  await page.evaluate(() => window.scrollBy(0, 520));
  await settle(page, 800);
  await page.screenshot({ path: path.join(PNG, '14-cdp-partner-tiles.png'), fullPage: false });
  console.log('saved 14 via scroll');
}

await shotNear('#propensity', '16-cdp-ai-propensity.png');
if (!fs.existsSync(path.join(PNG, '16-cdp-ai-propensity.png'))) {
  await shotNear('AI propensity', '16-cdp-ai-propensity.png', { byText: true });
}
if (!fs.existsSync(path.join(PNG, '16-cdp-ai-propensity.png'))) {
  await shotNear('Likely to travel', '16-cdp-ai-propensity.png', { byText: true });
}

// Improve mid-home if needed: scroll to partners strip on home
await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
await page.locator('[data-consent-accept]').click({ timeout: 3000 }).catch(() => {});
await settle(page, 1200);
const partnerSection = page.locator('section').filter({ hasText: /Lotus|partners|earn together/i }).first();
if (await partnerSection.count()) {
  await partnerSection.scrollIntoViewIfNeeded();
  await settle(page, 700);
  await page.screenshot({ path: path.join(PNG, '03-home-partners-cta.png'), fullPage: false });
  console.log('refreshed 03-home-partners-cta');
}

await browser.close();
console.log('done');
