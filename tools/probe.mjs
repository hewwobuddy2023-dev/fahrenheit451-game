// Debug probe: list large visible display objects in a room (usage: node tools/probe.mjs <room> <x>).
import { chromium } from '@playwright/test';
const [room = 'burn', x = '1060'] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
await page.goto('http://localhost:5173/?debug');
await page.evaluate(([room, x]) => {
  localStorage.setItem('f451.save', JSON.stringify({ v: 1, room, x: Number(x), flags: { ['e.' + room]: true } }));
  localStorage.setItem('f451.options', JSON.stringify({ muted: true, inputMode: 'keyboard' }));
}, [room, x]);
await page.reload();
await page.waitForFunction(() => window.__game?.scene.isActive('menu'));
await page.waitForTimeout(600);
await page.keyboard.press('Enter');
await page.waitForFunction(() => window.__game.scene.isActive('room'));
await page.waitForTimeout(2500);
console.log(JSON.stringify(await page.evaluate(() => {
  const s = window.__game.scene.getScene('room');
  return s.children.list.filter((o) => o.visible && o.displayWidth >= 700 && o.displayHeight >= 300).map((o) => ({ t: o.type, d: o.depth, a: +o.alpha.toFixed(2), w: Math.round(o.displayWidth), h: Math.round(o.displayHeight), tex: o.texture?.key, fill: o.fillColor?.toString(16), fa: o.fillAlpha, blend: o.blendMode, tint: o.tintTopLeft?.toString(16), sf: o.scrollFactorX }));
}), null, 0));
await browser.close();
