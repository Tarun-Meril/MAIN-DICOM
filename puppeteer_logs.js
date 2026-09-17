const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
        console.log(`[BROWSER ${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    console.log(`[BROWSER UNCAUGHT] ${error.message}`);
  });

  await page.goto('http://localhost:5174/viewer/1.3.46.670589.33.1.63920660937429831000001.5462275000837404300');
  
  // wait for it to load
  await new Promise(r => setTimeout(r, 5000));
  
  // Click MPR button
  // the toolbar button has id="mpr" or we can find it by text "MPR"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const mprBtn = btns.find(b => b.innerText.includes('MPR'));
    if (mprBtn) {
        console.log('[PUPPETEER] Clicking MPR button');
        mprBtn.click();
    } else {
        console.log('[PUPPETEER] MPR button not found');
    }
  });

  await new Promise(r => setTimeout(r, 10000));
  
  await browser.close();
})();
