const { chromium } = require('C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const base = 'http://127.0.0.1:8765';
  await page.goto(`${base}/?buttons=20260926`, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    const track = document.querySelector('[data-scroll-hero]');
    const hero = track.querySelector('.pe-hero');
    const top = parseFloat(getComputedStyle(hero).top) || 0;
    const start = track.getBoundingClientRect().top + scrollY - top;
    scrollTo(0, start + (track.offsetHeight - hero.offsetHeight) / 3);
  });
  await page.waitForTimeout(250);
  const main = await page.evaluate(() => {
    const button = document.querySelector('[data-world-copy="1"] .pe-button');
    const arrow = button.querySelector('span');
    return { button: { background: getComputedStyle(button).backgroundImage, radius: getComputedStyle(button).borderRadius, height: button.getBoundingClientRect().height, width: button.getBoundingClientRect().width }, arrow: { radius: getComputedStyle(arrow).borderRadius, width: arrow.getBoundingClientRect().width }, gradient: getComputedStyle(document.querySelector('.pe-hero__visual'), '::after').backgroundImage };
  });
  await page.screenshot({ path: '.recovery/qa-buttons-main.png' });

  await page.goto(`${base}/member/login.html?buttons=1`, { waitUntil: 'networkidle' });
  const login = await page.evaluate(() => [...document.querySelectorAll('.btnSubmit,.btnNormal')].slice(0, 3).map((button) => ({ text: button.textContent.trim(), radius: getComputedStyle(button).borderRadius, background: getComputedStyle(button).backgroundColor, height: button.getBoundingClientRect().height })));
  await page.screenshot({ path: '.recovery/qa-buttons-login.png' });

  await page.goto(`${base}/product/list.html?cate_no=27&buttons=1`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(350);
  const saleButton = await page.evaluate(() => {
    const button = document.querySelector('.sl-cp__btn');
    return button && { radius: getComputedStyle(button).borderRadius, background: getComputedStyle(button).backgroundColor, height: button.getBoundingClientRect().height };
  });
  if (await page.locator('.sl-cp__btn').count()) await page.locator('.sl-cp__btn').first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: '.recovery/qa-buttons-sale.png' });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/?buttons=mobile`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(450);
  const mobile = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, button: document.querySelector('.pe-button').getBoundingClientRect().toJSON() }));
  await page.screenshot({ path: '.recovery/qa-buttons-mobile.png' });
  console.log(JSON.stringify({ main, login, saleButton, mobile, errors }, null, 2));
  await browser.close();
})();
