import assert from 'node:assert/strict';
import { simulate } from './support/simulation.mjs';

for (const size of [{width:844,height:390}, {width:667,height:375}, {width:390,height:844}, {width:1366,height:768,lowres:true}]) {
  const s = await simulate(size);
  try {
    await s.advance(700);
    await s.tap(430,346); // Blank right side of NEW GAME row, outside the old glyph-only hit area.
    await s.until(()=>s.scene().sys.settings.key==='room','tap New Game');
    await s.until(()=>s.scene().dialogue?.open,'opening dialogue');
    const room=s.scene();
    for(let i=0;i<10 && room.mode==='dialogue';i++){await s.tap(480,450);}
    await s.until(()=>room.mode==='play','tap through opening');
    const x=room.player.x;
    await s.touch('touchstart',174,478); await s.advance(800); await s.touch('touchend',174,478);
    assert.ok(room.player.x>x+80,'touch movement');
    await s.tap(900,34); assert.equal(room.mode,'journal'); await s.tap(480,270); assert.equal(room.mode,'play');
    await s.tap(914,112); assert.equal(room.mode,'pause'); await s.tap(500,234); assert.equal(room.mode,'play');
    console.log(`PASS simulated touch: New Game, dialogue, movement, journal, pause ${JSON.stringify(size)}`);
  } finally { s.close(); }
}
