/**
 * Capture newer CDP panels from local preview (live site is behind).
 */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PNG = path.join(__dirname, 'png');
const BASE = 'http://127.0.0.1:4177';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'reduce',
});
const page = await ctx.newPage();

await page.goto(BASE + '/cdp-login.html', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.fill('#cdp-username', 'kent');
await page.fill('#cdp-password', '2026');
await Promise.all([
  page.waitForURL(/cdp-admin/, { timeout: 15000 }),
  page.click('button[type="submit"]'),
]);
await page.waitForTimeout(1800);
await page.locator('[data-consent-accept]').click({ timeout: 2000 }).catch(() => {});

const partners = page.locator('.cdp-partners').first();
await partners.scrollIntoViewIfNeeded();
await page.waitForTimeout(900);
await page.screenshot({ path: path.join(PNG, '14-cdp-partner-tiles.png'), fullPage: false });
console.log('14 partner tiles OK');

const ai = page.locator('#propensity').first();
await ai.scrollIntoViewIfNeeded();
await page.waitForTimeout(1100);
await page.screenshot({ path: path.join(PNG, '16-cdp-ai-propensity.png'), fullPage: false });
console.log('16 propensity OK');

// Also grab a cleaner flag-for-ads without cookie banner if needed
const flag = page.locator('[data-cdp-activate]').first();
await flag.scrollIntoViewIfNeeded();
await page.locator('[data-cdp-activate-btn]').click().catch(() => {});
await page.waitForTimeout(700);
await page.screenshot({ path: path.join(PNG, '15-cdp-flag-for-ads.png'), fullPage: false });
console.log('15 flag refreshed');

await browser.close();
