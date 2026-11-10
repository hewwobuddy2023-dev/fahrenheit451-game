import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { CHAPTER_STARTS } from '../../src/content.ts';

// Browser protocol taps/key presses. Read scene state for assertions, never call __qa to progress.
async function tap(page: Page, x: number, y: number, info: TestInfo) {
  const r = await page.locator('canvas').boundingBox();
  if (!r) throw new Error('No canvas bounds');
  const px = r.x + x / 960 * r.width, py = r.y + y / 540 * r.height;
  if (info.project.use.hasTouch) await page.touchscreen.tap(px, py);
  else await page.mouse.click(px, py);
}
async function hose(page: Page, info: TestInfo) {
  const cdp = info.project.name === 'chromium-touch' ? await page.context().newCDPSession(page) : undefined;
  const r = (await page.locator('canvas').boundingBox())!;
  const held = async (on: boolean) => {
    if (cdp) await cdp.send('Input.dispatchTouchEvent', { type: on ? 'touchStart' : 'touchEnd', touchPoints: on ? [{x:r.x+888/960*r.width,y:r.y+474/540*r.height,id:1}] : [] });
    else if (on) await page.keyboard.down('KeyE'); else await page.keyboard.up('KeyE');
  };
  try {
    for(let n=0;n<12 && !(await state(page)).flags['c01.p2'];n++) {
      await held(true);
      await expect.poll(()=>page.evaluate(()=>{const r=(window as any).__game.scene.getScene('room');return !!r.session.flags['c01.p2'] || r.hose.pressure>=.7;}),{timeout:30000}).toBe(true);
      await held(false);
      if(!(await state(page)).flags['c01.p2']) await expect.poll(()=>page.evaluate(()=>(window as any).__game.scene.getScene('room').hose.pressure),{timeout:15000}).toBeLessThan(.36);
    }
    expect((await state(page)).flags['c01.p2']).toBe(true);
  } finally {await held(false);await cdp?.detach();}
}
async function scene(page: Page, key: string) {
  await page.waitForFunction(k => (window as any).__game?.scene.isActive(k), key);
}
async function state(page: Page) {
  return page.evaluate(() => {
    const g = (window as any).__game, r = g.scene.getScenes(true)[0];
    return { key: r.sys.settings.key, room: r.room?.id, mode: r.mode, dialogue: !!r.dialogue?.open,
      choices: r.dialogue?.choiceRows?.map((row: any) => ({ x: row.list[0].x + 200, y: row.list[0].y })) ?? [],
      x: r.player?.x, flags: r.session?.flags };
  });
}
async function settle(page: Page, info: TestInfo) {
  const end = Date.now() + 90000;
  while (Date.now() < end) {
    const r = await state(page);
    if (r.mode === 'play') return;
    if (r.dialogue) {
      if (r.choices.length) await tap(page, r.choices[0].x, r.choices[0].y, info);
      else await tap(page, 480, 450, info);
    }
    await page.waitForTimeout(90);
  }
  throw new Error(`Opening did not finish: ${JSON.stringify(await state(page))}`);
}
async function seed(page: Page, room: string, x: number, flags: Record<string, boolean | string>) {
  await page.addInitScript(data => localStorage.setItem('f451.save', JSON.stringify(data)), { v: 1, room, x, flags });
}

test('fresh visitor: early repeated native taps, dialogue, movement, journal and pause', async ({ page, browser }, info) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/?debug&diagnostics');
  await scene(page, 'menu'); // Do not wait for the title fade to finish.
  await tap(page, 430, 346, info);
  await tap(page, 430, 346, info);
  await scene(page, 'room');
  await settle(page, info);
  const x = (await state(page)).x;
  await page.keyboard.down('KeyD');
  try { await expect.poll(async () => (await state(page)).x, { timeout: 15000 }).toBeGreaterThan(x + 25); }
  finally { await page.keyboard.up('KeyD'); }
  await tap(page, 860, 34, info); expect((await state(page)).mode).toBe('journal');
  await tap(page, 480, 300, info); expect((await state(page)).mode).toBe('play');
  await page.keyboard.press('Escape'); expect((await state(page)).mode).toBe('pause');
  await tap(page, 500, 234, info); expect((await state(page)).mode).toBe('play');
  await expect(page.locator('#diagnostics')).toContainText('Phaser downs');
  expect(errors).toEqual([]);
  await page.screenshot({ path: info.outputPath('chapter1-native.png') });
  console.log(JSON.stringify({ browser: browser.version(), project: info.project.name, viewport: page.viewportSize(), errors }));
});

test('prior checkpoint: rotation, scrolled hit targets and a real held interaction', async ({ page }, info) => {
  await seed(page, 'burn', 1060, { 'e.burn': true });
  await page.goto('/?debug'); await scene(page, 'menu');
  await tap(page, 430, 282, info); await scene(page, 'room'); await settle(page, info);
  for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport); await page.waitForTimeout(350);
    await tap(page, 860, 34, info); expect((await state(page)).mode).toBe('journal');
    await tap(page, 480, 300, info); expect((await state(page)).mode).toBe('play');
  }
  await hose(page, info);
  expect((await state(page)).flags['c01.p2']).toBe(true);
});

test('slow fonts never block the title; native chapter choices preserve normal saves', async ({ page }, info) => {
  test.setTimeout(180000);
  await seed(page, 'burn', 650, { 'c01.tone': 'deferent' });
  await page.route('**/*.woff2', async route => { await new Promise(r => setTimeout(r, 4500)); await route.continue(); });
  await page.goto('/?debug', { waitUntil: 'domcontentloaded' }); await scene(page, 'menu');
  const before = await page.evaluate(() => localStorage.getItem('f451.save'));
  // Each starts through the visible menu, then uses native dialogue input.
  for (let i = 0; i < 5; i++) {
    await tap(page, 430, 410, info);
    await tap(page, 430, 154 + 64 * i, info);
    await scene(page, 'room'); await settle(page, info);
    expect((await state(page)).room).toBe(CHAPTER_STARTS[i].room);
    expect(await page.evaluate(() => localStorage.getItem('f451.save'))).toBe(before);
    await page.screenshot({ path: info.outputPath(`chapter${i + 1}-native.png`) });
    await page.keyboard.press('Escape');
    await tap(page, 500, 338, info); await scene(page, 'menu');
    expect(await page.evaluate(() => localStorage.getItem('f451.save'))).toBe(before);
  }
});

test('audio unlock/mute, local offline play and browser frame sample', async ({ page, context, browser }, info) => {
  await seed(page, 'burn', 1060, { 'e.burn': true });
  const requests: string[] = [];
  page.on('request', r => requests.push(r.url()));
  await page.goto('/?debug&lowres'); await scene(page, 'menu');
  expect(await page.evaluate(() => (window as any).__audio.status.state)).toBe('locked');
  expect(await page.evaluate(() => !!(window as any).__game.sound.context)).toBe(false); // unused Phaser backend stays off
  await tap(page, 430, 282, info); await scene(page, 'room'); await settle(page, info);
  await expect.poll(() => page.evaluate(() => (window as any).__audio.status.state)).toBe('running');
  await expect.poll(()=>page.evaluate(()=>(window as any).__audio.sampleOutput().rms),{timeout:10000}).toBeGreaterThan(.0001);
  const signal=await page.evaluate(()=>(window as any).__audio.sampleOutput());
  console.log(JSON.stringify({label:'Actual Web Audio analyser signal, not a speaker listening test',signal}));
  expect(signal.peak).toBeLessThan(.95);
  await page.keyboard.press('KeyM'); expect(await page.evaluate(() => (window as any).__audio.status.muted)).toBe(true);
  await expect.poll(()=>page.evaluate(()=>(window as any).__audio.sampleOutput().rms),{timeout:10000}).toBeLessThan(.00005);
  await page.keyboard.press('KeyM'); expect(await page.evaluate(() => (window as any).__audio.status.muted)).toBe(false);
  await page.evaluate(() => document.fonts.ready);
  await context.setOffline(true);
  await hose(page, info);
  expect((await state(page)).flags['c01.p2']).toBe(true);
  await context.setOffline(false);
  const timing = await page.evaluate(async () => {
    const frames: number[] = []; let last = performance.now();
    await new Promise<void>(resolve => {
      const sample = (now: number) => { frames.push(now - last); last = now; if (frames.length < 120) requestAnimationFrame(sample); else resolve(); };
      requestAnimationFrame(sample);
    });
    frames.sort((a, b) => a - b);
    const g = (window as any).__game;
    return { p50ms: frames[60], p95ms: frames[114], renderer: g.renderer.type, canvas: [g.canvas.width, g.canvas.height], resources: performance.getEntriesByType('resource').map((e: any) => ({ name: new URL(e.name).pathname, transfer: e.transferSize, body: e.encodedBodySize })) };
  });
  console.log(JSON.stringify({ label: 'CI browser sample, NOT Chromebook benchmark', browser: browser.version(), viewport: page.viewportSize(), timing, requestCount: requests.length }));
  expect(requests.every(url => url.startsWith('http://127.0.0.1:4173/'))).toBe(true);
});

test('native pause freezes searchlight phase; DOM focus loss waits for explicit return', async ({ page }, info) => {
  await seed(page, 'river', 200, { 'e.river': true });
  await page.goto('/?debug&lowres'); await scene(page, 'menu');
  await tap(page, 430, 282, info); await scene(page, 'room'); await settle(page, info);
  await page.keyboard.press('Escape');
  const phase = await page.evaluate(() => (window as any).__game.scene.getScene('room').beams.get('sl1').x);
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => (window as any).__game.scene.getScene('room').beams.get('sl1').x)).toBe(phase);
  await tap(page, 500, 234, info);
  await expect.poll(() => page.evaluate(() => (window as any).__game.scene.getScene('room').beams.get('sl1').x)).not.toBe(phase);
  // Inject the DOM lifecycle signal, not an internal Phaser call. Physical tab/lock behavior is a device check.
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  const button = page.getByRole('button', { name: 'Game paused · Tap or press Enter to return' });
  await expect(button).toBeVisible();
  const active = await page.evaluate(() => (window as any).__game.scene.getScene('room').activeTime);
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => (window as any).__game.scene.getScene('room').activeTime)).toBe(active);
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(button).toBeVisible(); // focus alone does not resume the encounter
  if (info.project.use.hasTouch) await button.tap(); else await page.keyboard.press('Enter');
  await expect(button).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => (window as any).__game.scene.getScene('room').activeTime)).toBeGreaterThan(active);
});


test('subway: source-first reconstruction fails locally, supports rereading and succeeds through native cards', async ({page}, info) => {
  await seed(page,'subway',620,{});await page.goto('/?debug&lowres');await scene(page,'menu');await tap(page,430,282,info);await scene(page,'room');await settle(page,info);
  await page.keyboard.press('KeyE');
  for(let n=0;n<8;n++){if(await page.evaluate(()=>!!(window as any).__game.scene.getScene('room').dialogue.puzzle))break;await tap(page,480,450,info);}
  await expect.poll(()=>page.evaluate(()=>(window as any).__game.scene.getScene('room').dialogue.puzzle?.state.phase)).toBe('study');
  await page.screenshot({path:info.outputPath('subway-study-native.png')});
  await tap(page,480,450,info);
  for(const i of [1,0,2,3])await tap(page,220+(i%2)*425,231+Math.floor(i/2)*75,info);
  expect(await page.evaluate(()=>(window as any).__game.scene.getScene('room').dialogue.puzzle.state.attempts)).toBe(1);
  expect((await state(page)).flags['c08.verse']).toBeUndefined();
  await tap(page,180,470,info);await tap(page,480,450,info);
  for(const i of [2,5,0,4])await tap(page,220+(i%2)*425,231+Math.floor(i/2)*75,info);
  await settle(page,info);expect((await state(page)).room).toBe('faber1');expect((await state(page)).flags['c08.verse']).toBe(true);
  await page.screenshot({path:info.outputPath('subway-complete-native.png')});
});
