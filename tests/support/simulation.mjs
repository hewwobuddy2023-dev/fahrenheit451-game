// Deterministic DOM + native Canvas simulation running the actual bundled Phaser game.
// This exercises Phaser's TouchManager/hit tests, NOT a browser, WebKit, or a physical phone.
import { JSDOM } from 'jsdom';
import * as canvas from '@napi-rs/canvas';
import { build } from 'esbuild';
import { writeFile } from 'node:fs/promises';

const bundle = await build({ entryPoints: ['src/main.ts'], bundle: true, write: false,
  format: 'esm', loader: { '.css': 'empty' }, define: { 'process.env.NODE_ENV': '"test"' } });

export async function simulate({ width = 844, height = 390, dpr = 3, lowres = false, save, blocked = false } = {}) {
  const dom = new JSDOM('<!doctype html><div id="boot"></div><div id="game"></div>', {
    url: `https://simulation.invalid/?debug${lowres ? '&lowres' : ''}`, pretendToBeVisual: true, runScripts: 'outside-only',
  });
  const w = dom.window;
  let now = 1000;
  w.Date.now = () => 1800000000000 + now;
  for (const [k, value] of Object.entries({ innerWidth: width, innerHeight: height, devicePixelRatio: dpr })) {
    Object.defineProperty(w, k, { value, writable: true });
  }
  Object.defineProperty(w.navigator, 'maxTouchPoints', { value: 5 });
  w.focus = () => {};
  w.document.fonts = { load: async () => [] }; // System fonts; font/Safari loading is outside this simulation.
  w.CanvasRenderingContext2D = canvas.CanvasRenderingContext2D || function () {};
  const backing = new WeakMap();
  const native = (el) => {
    if (!backing.has(el)) backing.set(el, canvas.createCanvas(el.width || 300, el.height || 150));
    return backing.get(el);
  };
  for (const prop of ['width', 'height']) {
    const desc = Object.getOwnPropertyDescriptor(w.HTMLCanvasElement.prototype, prop);
    Object.defineProperty(w.HTMLCanvasElement.prototype, prop, { get: desc.get, set(v) {
      desc.set.call(this, v); if (backing.has(this)) backing.get(this)[prop] = this[prop];
    } });
  }
  w.HTMLCanvasElement.prototype.getContext = function (type) {
    if (type !== '2d') return null; // Exercise Phaser's Canvas fallback, not fake WebGL.
    const ctx = native(this).getContext('2d');
    if (!ctx.__patched) {
      for (const method of ['drawImage', 'createPattern']) {
        const original = ctx[method].bind(ctx);
        ctx[method] = (img, ...args) => original(img instanceof w.HTMLCanvasElement ? native(img) : img, ...args);
      }
      ctx.__patched = true;
    }
    return ctx;
  };
  w.HTMLCanvasElement.prototype.toDataURL = function () { return native(this).toDataURL('image/png'); };
  w.Image = canvas.Image;
  const fit = Math.min(width / 960, height / 540);
  const rect = { x: (width - 960 * fit) / 2, y: (height - 540 * fit) / 2, width: 960 * fit, height: 540 * fit };
  w.HTMLCanvasElement.prototype.getBoundingClientRect = () => ({ ...rect, left: rect.x, top: rect.y, right: rect.x + rect.width, bottom: rect.y + rect.height });
  w.HTMLElement.prototype.getBoundingClientRect = () => ({ x: 0, y: 0, top: 0, left: 0, right: width, bottom: height, width, height });
  Object.defineProperties(w.HTMLElement.prototype, { clientWidth: { get: () => width }, clientHeight: { get: () => height } });
  if (save !== undefined) w.localStorage.setItem('f451.save', typeof save === 'string' ? save : JSON.stringify(save));
  if (blocked) Object.defineProperty(w, 'localStorage', { get() { throw new w.DOMException('Blocked', 'SecurityError'); } });
  await w.eval(`(async()=>{${bundle.outputFiles[0].text}})()`);
  for (let i = 0; i < 100 && !w.__game?.scene.isActive('menu'); i++) await new Promise((r) => setTimeout(r, 5));
  const game = w.__game;
  if (!game?.scene.isActive('menu')) throw new Error('Simulation did not boot');
  game.loop.stop();
  game.loop.actualFps = 60;
  const scene = () => game.scene.getScenes(true)[0];
  const frame = async (ms = 1000 / 60, render = false) => {
    now += ms; game.loop.delta = ms;
    (render ? game.step : game.headlessStep).call(game, now, ms);
    await Promise.resolve(); await Promise.resolve();
  };
  const advance = async (ms) => { for (let left = ms; left > 0; left -= 1000 / 60) await frame(Math.min(1000 / 60, left)); };
  const render = () => frame(0, true);
  const until = async (predicate, label, ms = 60000) => {
    for (let elapsed = 0; elapsed < ms; elapsed += 50) { if (predicate()) return; await advance(50); }
    throw new Error(`Timeout: ${label}; ${scene()?.sys.settings.key}/${scene()?.room?.id}/${scene()?.mode}; ${scene()?.dialogue?.current}; ${scene()?.dialogue?.options}`);
  };
  const touch = async (type, x, y, id = 1) => {
    await render();
    const e = new w.Event(type, { bubbles: true, cancelable: true });
    const point = { identifier: id, pageX: rect.x + x * fit, pageY: rect.y + y * fit, clientX: rect.x + x * fit, clientY: rect.y + y * fit, target: game.canvas };
    Object.defineProperty(e, 'changedTouches', { value: [point] });
    game.canvas.dispatchEvent(e);
    await Promise.resolve();
  };
  const tap = async (x, y, id = 1) => { await touch('touchstart', x, y, id); await touch('touchend', x, y, id); await advance(50); };
  const key = async (code, down = true, repeat = false) => {
    const keyCode = { KeyE: 69, Enter: 13, Space: 32, KeyD: 68, KeyA: 65, ArrowDown: 40, ArrowUp: 38, Escape: 27, KeyJ: 74 }[code];
    w.dispatchEvent(new w.KeyboardEvent(down ? 'keydown' : 'keyup', { code, key: code, keyCode, which: keyCode, repeat, bubbles: true }));
    await advance(20);
  };
  return { w, game, scene, advance, until, touch, tap, key, render,
    save: () => w.localStorage.getItem('f451.save'),
    screenshot: async (path) => { await render(); await writeFile(path, native(game.canvas).toBuffer(path.endsWith('.webp') ? 'image/webp' : 'image/png')); },
    close: () => { game.destroy(true); game.runDestroy(); w.close(); },
  };
}
