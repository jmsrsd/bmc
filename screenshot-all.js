const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const outputDir = '/home/jmsrsd/src/workspace/bmc/screenshots';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Pages to screenshot (without overlay)
  const pages = [
    { url: '/', name: 'home' },
    { url: '/building', name: 'building' },
    { url: '/building/hvac', name: 'hvac' },
    { url: '/building/lighting', name: 'lighting' },
    { url: '/building/security', name: 'security' },
    { url: '/energy', name: 'energy' },
    { url: '/alarms', name: 'alarms' },
    { url: '/fire', name: 'fire' },
    { url: '/elevators', name: 'elevators' },
  ];

  // Login first
  await page.goto('http://localhost:3001/login');
  await page.fill('input[type="password"]', 'bmc2024');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);

  // Screenshot each page
  for (const { url, name } of pages) {
    await page.goto(`http://localhost:3001${url}`);
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(outputDir, `${name}.png`),
      fullPage: true
    });
    console.log(`Screenshot saved: ${name}.png`);
  }

  await browser.close();
  console.log('All screenshots complete');
})();