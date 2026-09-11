// Usage: node scripts/shoot.js <url-path> <out-name>
// Requires a running server at http://localhost:4000 (bundle exec jekyll serve)
const path = process.argv[2] || '/';
const name = process.argv[3] || 'shot';
const pptrPath = '/opt/homebrew/lib/node_modules/fast-cli/node_modules/puppeteer';
const puppeteer = require(pptrPath);
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  // desktop
  let page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  await page.goto('http://localhost:4000' + path, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: `/tmp/rr_${name}_desktop.png`, fullPage: true });
  await page.close();
  // mobile + overflow check
  page = await browser.newPage();
  await page.setViewport({ width: 390, height: 800, deviceScaleFactor: 2, isMobile: true });
  await page.goto('http://localhost:4000' + path, { waitUntil: 'networkidle0' });
  const m = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
  }));
  await page.screenshot({ path: `/tmp/rr_${name}_mobile.png`, fullPage: true });
  await browser.close();
  console.log(`overflow: scrollW=${m.scrollW} clientW=${m.clientW} ` +
    (m.scrollW === m.clientW ? 'OK' : 'FAIL (horizontal overflow)'));
})();
