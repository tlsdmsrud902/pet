const { chromium } = require('C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await context.newPage();
  const started = Date.now();
  await page.goto('http://127.0.0.1:8765/product/search.html?keyword=강아지', { waitUntil: 'commit' });
  for (const [delay, name] of [[0, '000'], [25, '025'], [75, '075'], [150, '150'], [350, '350']]) {
    const elapsed = Date.now() - started;
    if (delay > elapsed) await page.waitForTimeout(delay - elapsed);
    await page.screenshot({ path: `.recovery/first-paint-${name}.png` });
  }
  await page.waitForLoadState('domcontentloaded');
  await page.screenshot({ path: '.recovery/first-paint-dom.png' });
  console.log(await page.evaluate(() => ({
    hero: document.querySelector('.pet-menu-hero') && document.querySelector('.pet-menu-hero').className,
    image: document.querySelector('.pet-menu-hero img') && document.querySelector('.pet-menu-hero img').getAttribute('src'),
    title: document.querySelector('.pet-menu-hero h1') && document.querySelector('.pet-menu-hero h1').innerText,
    styleOrder: [...document.styleSheets].map((sheet) => sheet.href).filter(Boolean).filter((href) => /pet-|sub_style|searchdata/.test(href))
  })));
  await browser.close();
})();
