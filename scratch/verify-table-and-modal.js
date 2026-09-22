const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await context.newPage();

  console.log('Navigating to login...');
  await page.goto('http://localhost:5174/login');
  await page.fill('input[type="email"]', 'presenting@snb.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/presenting');
  await page.waitForTimeout(1000);

  // 1. Scroll down to Cheques Presented in Clearing
  console.log('Capturing presented cheques table...');
  const tableHeading = page.locator('text=Cheques Presented in Clearing');
  await tableHeading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  await page.screenshot({
    path: 'C:/Users/Admin/.gemini/antigravity-ide/brain/3e8fa80d-ff4f-48b5-abba-27047cf0cce1/cheques_presented_table.png',
    fullPage: false
  });
  console.log('Captured cheques_presented_table.png');

  // 2. Click "View" or the thumbnail to open modal
  console.log('Clicking cheque view button to inspect...');
  const viewButton = page.locator('button:has-text("View")').first();
  await viewButton.click();
  await page.waitForTimeout(1000);

  await page.screenshot({
    path: 'C:/Users/Admin/.gemini/antigravity-ide/brain/3e8fa80d-ff4f-48b5-abba-27047cf0cce1/cheque_inspector_modal.png',
    fullPage: false
  });
  console.log('Captured cheque_inspector_modal.png');

  // 3. Drawee Bank Dashboard
  console.log('Navigating to Drawee Bank Dashboard...');
  await page.goto('http://localhost:5174/login');
  await page.fill('input[type="email"]', 'drawee@hdb.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/drawee');
  await page.waitForTimeout(1000);

  await page.screenshot({
    path: 'C:/Users/Admin/.gemini/antigravity-ide/brain/3e8fa80d-ff4f-48b5-abba-27047cf0cce1/drawee_workbench_cards.png',
    fullPage: false
  });
  console.log('Captured drawee_workbench_cards.png');

  await browser.close();
  console.log('All verification screenshots captured successfully!');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
