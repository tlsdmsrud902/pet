const { chromium } = require('C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://127.0.0.1:8765/?video_first=20260926', { waitUntil: 'domcontentloaded' });
  const samples = [];
  for (const delay of [0, 250, 750, 1500]) {
    if (delay) await page.waitForTimeout(delay - (samples.at(-1)?.delay || 0));
    samples.push(await page.evaluate((sampleDelay) => {
      const video = document.querySelector('.pe-world-video');
      return { delay: sampleDelay, readyState: video.readyState, paused: video.paused, currentTime: Number(video.currentTime.toFixed(3)), poster: video.getAttribute('poster'), preload: video.preload, src: video.currentSrc };
    }, delay));
  }
  await page.screenshot({ path: '.recovery/qa-video-first.png' });
  console.log(JSON.stringify({ samples, errors }, null, 2));
  await browser.close();
})();
