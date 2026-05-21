import { chromium } from 'playwright';
const dir = 'C:/Users/tarun/AppData/Local/Temp/finsight-v2';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });
const errs = [];
page.on('pageerror', e => errs.push(e.message));

// Dashboard
await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
await page.screenshot({ path: dir + '/01-dashboard.png' });
console.log('1. Dashboard');

// Goals
await page.locator('nav button:has-text("Goals")').first().click();
await page.waitForTimeout(500);
await page.screenshot({ path: dir + '/02-goals.png' });
console.log('2. Goals (fields alignment)');

// Modal at top
await page.click('button:has-text("Add a Goal")');
await page.waitForTimeout(300);
await page.screenshot({ path: dir + '/03-goals-modal.png' });
await page.keyboard.press('Escape');
await page.waitForTimeout(200);
console.log('3. Goals modal position');

// Insurance
await page.locator('nav button:has-text("Insurance")').first().click();
await page.waitForTimeout(500);
await page.screenshot({ path: dir + '/04-insurance-life.png' });
// Switch to health tab
await page.click('button:has-text("Health Insurance")');
await page.waitForTimeout(300);
await page.screenshot({ path: dir + '/05-insurance-health.png' });
console.log('4-5. Insurance (gap indicator)');

// Back to dashboard — should now show "Your data" badges since we navigated
await page.locator('nav button:has-text("Home")').first().click();
await page.waitForTimeout(400);
await page.screenshot({ path: dir + '/06-dashboard-filled.png' });
console.log('6. Dashboard with data badges');

if (errs.length) console.log('ERRORS:', errs);
else console.log('No JS errors');
await browser.close();
