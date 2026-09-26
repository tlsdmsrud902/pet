const { chromium } = require('C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1264, height: 868 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://127.0.0.1:8765/product/search.html?keyword=강아지&qa=menu-search', { waitUntil: 'networkidle' });
  const result = await page.evaluate(() => {
    const sale = document.querySelector('.pet-sale-menu>a');
    const before = sale && sale.parentElement.previousElementSibling.querySelector('a');
    const bubble = document.querySelector('.pet-sale-bubble');
    const field = document.querySelector('.xans-product-searchdata .searchField fieldset');
    const title = document.querySelector('#contents>.titleArea');
    const rect = (el) => el && el.getBoundingClientRect().toJSON();
    return {
      menu: { before: rect(before), sale: rect(sale), sameBaseline: !!before && !!sale && Math.abs(before.getBoundingClientRect().top - sale.getBoundingClientRect().top) < 1 },
      bubble: rect(bubble),
      title: rect(title),
      field: rect(field),
      overflow: document.documentElement.scrollWidth > innerWidth
    };
  });
  await page.screenshot({ path: '.recovery/qa-menu-search.png' });
  console.log(JSON.stringify({ result, errors }, null, 2));
  await browser.close();
})();
