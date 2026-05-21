const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  const dir = 'C:\\\\Users\\\\tarun\\\\AppData\\\\Local\\\\Temp\\\\finsight-screenshots';
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push('PAGE ERROR: ' + err.message));

  await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
  await page.screenshot({ path: dir + '/01-dashboard.png' });
  console.log('1. Dashboard: ' + await page.title());

  await page.click('button:has-text("Goals")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: dir + '/02-goals.png' });
  console.log('2. Goals captured');

  await page.click('button:has-text("Calculators")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: dir + '/03-calculators.png' });
  console.log('3. Calculators captured');

  await page.click('button:has-text("FIRE")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: dir + '/04-fire.png' });
  console.log('4. FIRE captured');

  await page.click('button:has-text("Insurance")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: dir + '/05-insurance.png' });
  console.log('5. Insurance captured');

  const efBtn = page.locator('button:has-text("Emergency Fund")').first();
  await efBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: dir + '/06-emergency.png' });
  console.log('6. Emergency Fund captured');

  if (errors.length) console.log('ERRORS:', JSON.stringify(errors, null, 2));
  else console.log('No JS errors detected');
  
  await browser.close();
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
