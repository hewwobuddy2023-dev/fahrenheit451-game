import assert from 'node:assert/strict';
import { simulate } from './support/simulation.mjs';
import { campaign } from './support/campaign.mjs';

const s = await simulate({ save: { v: 1, room: 'run', x: 150, flags: { 'e.run': true } } });
try {
  await s.advance(700); await s.tap(430, 282); await s.until(() => s.scene().sys.settings.key === 'room', 'run Continue');
  await campaign(s).settle();
  const r = s.scene();
  s.game.events.emit('blur');
  const start = r.time.now;
  await s.advance(40000);
  assert.equal(r.time.now, start, 'backgrounding must freeze the scene clock and timed escape');
  assert.equal(r.caughtAt, 0);
  assert.ok(s.w.document.querySelector('#focus-resume'));
  s.w.document.querySelector('#focus-resume').click();
  await s.advance(500);
  assert.equal(r.mode, 'play');
  assert.equal(r.caughtAt, 0);
  console.log('PASS focus loss freezes timers, explicit resume cannot skip an encounter');
} finally { s.close(); }

// Quota failures after an existing checkpoint must leave that checkpoint intact.
{
  const checkpoint = { v:1, room:'burn', x:1060, flags:{'e.burn':true} };
  const s=await simulate({save:checkpoint});
  try {
    await s.advance(700);await s.tap(430,282);await s.until(()=>s.scene().sys.settings.key==='room','quota Continue');await campaign(s).settle();
    const before=s.save();
    s.w.Storage.prototype.setItem=function(){throw new s.w.DOMException('Quota exceeded','QuotaExceededError');};
    await s.touch('touchstart',888,474);await s.advance(1700);await s.touch('touchend',888,474);
    assert.ok(s.scene().session.flags['c01.p2']);assert.equal(s.save(),before);
    assert.ok(s.scene().children.list.some(o=>o.text==='SAVE UNAVAILABLE IN THIS BROWSER'));
    console.log('PASS quota failure preserves prior save, warning appears, live gameplay progresses');
  } finally{s.close();}
}
// Explicit pause in a timed room never consumes its deadline.
for(const fps of [30,20]) {
  const s=await simulate({frameMs:1000/fps,save:{v:1,room:'run',x:150,flags:{'e.run':true}}});
  try {
    await s.advance(700);await s.tap(430,282);await s.until(()=>s.scene().sys.settings.key==='room','low-FPS run');await campaign(s).settle();
    await s.tap(914,112);assert.equal(s.scene().mode,'pause');await s.advance(40000);assert.equal(s.scene().caughtAt,0);
    await s.tap(500,234);await campaign(s).walkTo(2500);await campaign(s).settle();
    assert.equal(s.scene().room.id,'river');assert.equal(s.scene().session.flags['c12.river'],true);
    console.log(`PASS ${fps} FPS deterministic deltas: pause > deadline then full timed escape`);
  } finally{s.close();}
}

// The governor must respond even when a slow scene remains behind its opening cinematic.
{
  const s=await simulate({save:{v:1,room:'burn',x:1060,flags:{'e.burn':true}}});
  try {
    await s.advance(700);await s.tap(430,282);await s.until(()=>s.scene().sys.settings.key==='room','quality governor');await campaign(s).settle();
    const before=s.save();s.game.loop.actualFps=20;await s.advance(16000);
    assert.equal(s.game.canvas.width,960);assert.equal(s.scene().cameras.main.zoom,1);assert.equal(s.save(),before);
    const x=s.scene().player.x;await s.touch('touchstart',174,478);await s.advance(700);await s.touch('touchend',174,478);
    assert.ok(s.scene().player.x>x+70,'touch coordinates still map correctly after two cosmetic resolution steps');
    console.log('PASS sustained-low-FPS governor reaches base resolution without changing saves/input');
  }finally{s.close();}
}

{
  const sentinel={v:1,room:'burn',x:640,flags:{'e.burn':true}};
  const s=await simulate({save:sentinel});
  try {
    const before=s.save();await s.advance(700);await s.tap(430,474);
    await s.key('KeyM');await s.key('KeyM',false);
    assert.match(s.scene().list.rows[0].item.label,/OFF/,'keyboard mute updates the visible settings label');
    await s.tap(430,346);assert.equal(JSON.parse(s.w.localStorage.getItem('f451.options')).reducedMotion,true);
    assert.equal(s.save(),before,'preferences do not replace the story checkpoint');
    await s.tap(430,282);assert.match(s.scene().list.rows[0].item.label,/ON/);
    console.log('PASS touch/keyboard settings, visible mute state, separate persistent preferences');
  }finally{s.close();}
}
