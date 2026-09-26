const { chromium } = require('C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  await page.goto('http://127.0.0.1:8765/?hero_copy_qa=1', { waitUntil: 'networkidle' });
  console.log(JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[data-world-copy]')].map((copy, index) => {
    const rect = (selector) => {
      const el = copy.querySelector(selector);
      return el && el.getBoundingClientRect().toJSON();
    };
    const display = copy.querySelector('.pe-display');
    const title = copy.querySelector('h1,h2');
    const description = copy.querySelector('.pe-description');
    const styles = (el) => el && ({ marginTop: getComputedStyle(el).marginTop, marginBottom: getComputedStyle(el).marginBottom, minHeight: getComputedStyle(el).minHeight, lineHeight: getComputedStyle(el).lineHeight });
    return { index, copy: copy.getBoundingClientRect().toJSON(), eyebrow: rect('.pe-eyebrow'), display: rect('.pe-display'), title: rect('h1,h2'), description: rect('.pe-description'), button: rect('.pe-button'), styles: { display: styles(display), title: styles(title), description: styles(description) } };
  })), null, 2));
  await browser.close();
})();
