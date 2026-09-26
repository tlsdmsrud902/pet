const { chromium } = require('C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://127.0.0.1:8765/?hero_uniform=20260926', { waitUntil: 'networkidle' });
  const results = [];
  for (let index = 0; index < 4; index += 1) {
    await page.evaluate((scene) => {
      const track = document.querySelector('[data-scroll-hero]');
      const hero = track.querySelector('.pe-hero');
      const top = parseFloat(getComputedStyle(hero).top) || 0;
      const start = track.getBoundingClientRect().top + scrollY - top;
      const distance = Math.max(1, track.offsetHeight - hero.offsetHeight);
      scrollTo(0, Math.max(0, start + distance * scene / 3));
    }, index);
    await page.waitForTimeout(180);
    results.push(await page.evaluate((scene) => {
      const copy = document.querySelector(`[data-world-copy="${scene}"]`);
      const display = copy.querySelector('.pe-display').getBoundingClientRect();
      const title = copy.querySelector('h1,h2').getBoundingClientRect();
      const description = copy.querySelector('.pe-description').getBoundingClientRect();
      const button = copy.querySelector('.pe-button').getBoundingClientRect();
      const eyebrow = copy.querySelector('.pe-eyebrow').getBoundingClientRect();
      return {
        scene,
        copyHeight: Math.round(button.bottom - eyebrow.top),
        displayToTitle: Math.round(title.top - display.bottom),
        titleToDescription: Math.round(description.top - title.bottom),
        descriptionToButton: Math.round(button.top - description.bottom),
        activeOpacity: getComputedStyle(copy).opacity
      };
    }, index));
    await page.screenshot({ path: `.recovery/qa-hero-uniform-${index + 1}.png` });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:8765/?hero_uniform=mobile', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  const mobile = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, heroHeight: Math.round(document.querySelector('.pe-hero').getBoundingClientRect().height) }));
  console.log(JSON.stringify({ results, mobile, errors }, null, 2));
  await browser.close();
})();
