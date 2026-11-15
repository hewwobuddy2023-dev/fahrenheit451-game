// Chromebook approximation: CPU-throttled Chromium (CDP) measuring frame rate and how fast the game clock runs.
// It is NOT a real Chromebook: GPU, memory and thermal limits are not emulated.
// Usage: node tools/perf-throttle.mjs <url> [rates=1,4,6] [width height]
import { chromium } from '@playwright/test';

const [url = 'https://hewwobuddy2023-dev.github.io/fahrenheit451-game/', rates = '1,4,6', w = '1366', h = '768'] = process.argv.slice(2);
const browser = await chromium.launch();
for (const rate of rates.split(',').map(Number)) {
  const ctx = await browser.newContext({ viewport: { width: Number(w), height: Number(h) } });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate });
  const t0 = Date.now();
  await page.goto(url + (url.includes('?') ? '&' : '?') + 'debug');
  await page.waitForFunction(() => window.__game?.scene.isActive('menu'), null, { timeout: 120000 });
  const boot = Date.now() - t0;
  await page.evaluate(() => localStorage.setItem('f451.options', JSON.stringify({ muted: true })));
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__game.scene.isActive('room'), null, { timeout: 60000 });
  await page.waitForTimeout(1500);
  // sample real frames and game-clock advance for 6 s while the opening plays
  const r = await page.evaluate(() => new Promise((done) => {
    const scene = window.__game.scene.getScene('room');
    const frames = []; let last = performance.now();
    const g0 = scene.time.now, w0 = last;
    const tick = (t) => { frames.push(t - last); last = t; if (t - w0 < 6000) requestAnimationFrame(tick); else {
      const s = frames.slice(1).sort((a, b) => a - b);
      done({ median: 1000 / s[Math.floor(s.length / 2)], p5: 1000 / s[Math.floor(s.length * 0.95)], clock: (scene.time.now - g0) / (t - w0) });
    } };
    requestAnimationFrame(tick);
  }));
  console.log(`CPU ${rate}x  boot ${boot} ms  median ${r.median.toFixed(1)} fps  5th-pct ${r.p5.toFixed(1)} fps  game clock ${(r.clock * 100).toFixed(0)}% of real time`);
  await ctx.close();
}
await browser.close();
