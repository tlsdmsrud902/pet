const { chromium } = require('C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:8765/', { waitUntil: 'networkidle' });
  console.log(JSON.stringify(await page.evaluate(() => {
    const li = document.querySelector('.pet-sale-menu');
    const bubble = document.querySelector('.pet-sale-bubble');
    const parents = [];
    let current = bubble;
    while (current && parents.length < 8) {
      const s = getComputedStyle(current);
      parents.push({ tag: current.tagName, cls: current.className, rect: current.getBoundingClientRect().toJSON(), display: s.display, overflow: s.overflow, opacity: s.opacity, visibility: s.visibility, position: s.position, zIndex: s.zIndex });
      current = current.parentElement;
    }
    const all = [...document.querySelectorAll('.pet-sale-bubble')].map((el) => ({
      rect: el.getBoundingClientRect().toJSON(),
      color: getComputedStyle(el).color,
      background: getComputedStyle(el).backgroundColor,
      display: getComputedStyle(el).display,
      text: el.textContent
    }));
    return { count: all.length, html: li && li.outerHTML, all, parents };
  }), null, 2));
  await page.screenshot({ path: '.recovery/qa-sale-bubble.png', clip: { x: 400, y: 0, width: 640, height: 120 } });
  await page.goto('http://127.0.0.1:8765/member/login.html', { waitUntil: 'networkidle' });
  console.log(JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.titleArea')].map((el) => ({ html: el.outerHTML.slice(0, 500), parent: el.parentElement && el.parentElement.className, rect: el.getBoundingClientRect().toJSON() }))), null, 2));
  await browser.close();
})();
