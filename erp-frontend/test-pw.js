const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.text().includes('Resolver result:') || msg.text().includes('Raw values')) {
      console.log('BROWSER LOG:', msg.text());
    }
  });

  await page.goto('http://localhost:3001/login');
  await page.fill('input[name="email"]', 'admin@example.com'); // guess
  await page.fill('input[type="password"]', 'password123'); // guess
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  
  await page.goto('http://localhost:3001/admin');
  await page.waitForTimeout(2000);
  
  const editButtons = await page.$$('a[href*="/admin/edit/"]');
  if (editButtons.length > 0) {
    await editButtons[0].click();
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Update User")');
    await page.waitForTimeout(1000);
  } else {
    console.log('No edit buttons found');
  }
  
  await browser.close();
})();
