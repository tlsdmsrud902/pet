const { chromium } = require('C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });

  const base = 'http://127.0.0.1:8765';
  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(900);
  const main = await page.evaluate(() => {
    const video = document.querySelector('.pe-world-video');
    const bubble = document.querySelector('.pet-sale-bubble');
    return {
      media: document.querySelectorAll('[data-world-image]').length,
      copies: document.querySelectorAll('[data-world-copy]').length,
      routes: document.querySelectorAll('[data-world-jump]').length,
      video: video && { readyState: video.readyState, paused: video.paused, src: video.currentSrc },
      brand: getComputedStyle(document.querySelector('.top_logo a'), '::before').content,
      bubble: bubble && { text: bubble.textContent.trim(), rect: bubble.getBoundingClientRect().toJSON() },
      account: [...document.querySelectorAll('.top_member_links a')].filter((a) => getComputedStyle(a).display !== 'none').map((a) => a.textContent.trim()),
      overflow: document.documentElement.scrollWidth > innerWidth
    };
  });

  await page.goto(`${base}/product/search.html?keyword=강아지`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  const search = await page.evaluate(() => {
    const title = document.querySelector('#contents .titleArea');
    const input = document.querySelector('.searchField input[name=keyword]');
    const grid = document.querySelector('.xans-search-result .prdList');
    return {
      titleLeft: title && Math.round(title.getBoundingClientRect().left),
      titleAlign: title && getComputedStyle(title.querySelector('h2')).textAlign,
      input: input && { background: getComputedStyle(input).backgroundColor, border: getComputedStyle(input).borderTopWidth },
      grid: grid && { left: Math.round(grid.getBoundingClientRect().left), width: Math.round(grid.getBoundingClientRect().width), columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length },
      overflow: document.documentElement.scrollWidth > innerWidth
    };
  });
  await page.locator('.xans-search-result').scrollIntoViewIfNeeded();
  await page.screenshot({ path: '.recovery/qa-final-search-products.png' });

  await page.goto(`${base}/product/list.html?cate_no=27`, { waitUntil: 'domcontentloaded' });
  const saleFirstPaint = await page.evaluate(() => ({
    earlyClass: document.documentElement.classList.contains('st-sale-preload') || document.documentElement.classList.contains('st-sale-on'),
    nativeTitle: document.querySelector('#contents>.titleArea') && getComputedStyle(document.querySelector('#contents>.titleArea')).display
  }));
  await page.waitForTimeout(500);
  const sale = await page.evaluate(() => ({
    active: document.documentElement.classList.contains('st-sale-on'),
    customVisible: !!document.querySelector('#stSaleEvent') && getComputedStyle(document.querySelector('#stSaleEvent')).display !== 'none',
    nativeTitle: document.querySelector('#contents>.titleArea') && getComputedStyle(document.querySelector('#contents>.titleArea')).display,
    condition: document.querySelector('.normalpackage_box .condition') && getComputedStyle(document.querySelector('.normalpackage_box .condition')).display,
    overflow: document.documentElement.scrollWidth > innerWidth
  }));

  await page.goto(`${base}/member/login.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(350);
  const login = await page.evaluate(() => {
    const title = document.querySelector('#contents .titleArea h2');
    const form = document.querySelector('.xans-member-login');
    return {
      titleAlign: title && getComputedStyle(title).textAlign,
      formBackground: form && getComputedStyle(form).backgroundColor,
      account: [...document.querySelectorAll('.top_member_links a')].filter((a) => getComputedStyle(a).display !== 'none').map((a) => a.textContent.trim())
    };
  });

  const pages = ['/', '/product/search.html?keyword=강아지', '/product/search.html?keyword=고양이', '/product/search.html?keyword=산책', '/product/list.html?cate_no=27', '/board/product/list.html?board_no=4', '/member/login.html'];
  await page.setViewportSize({ width: 390, height: 844 });
  const mobile = [];
  for (const path of pages) {
    const response = await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(220);
    mobile.push({ path, status: response && response.status(), overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) });
  }

  console.log(JSON.stringify({ main, search, saleFirstPaint, sale, login, mobile, errors: [...new Set(errors)] }, null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
