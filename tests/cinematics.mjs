import assert from 'node:assert/strict';
import { simulate } from './support/simulation.mjs';
for (const room of ['home1','station1']) {
  const s=await simulate({save:{v:1,room,x:room==='home1'?200:316,flags:{}}});
  try {
    await s.advance(700);await s.tap(430,282);await s.until(()=>s.scene().sys.settings.key==='room','cinematic start');await s.advance(150);
    const r=s.scene();
    if(room==='home1') assert.ok(r.player.anims.currentAnim.key.endsWith(':walk'),'scripted walk must retain its walking animation');
    else {assert.ok(r.player.y<400,'pole slide must remain above the floor during its descent');assert.equal(r.shadow.visible,false);}
    console.log('PASS scripted pose',room);
  } finally{s.close();}
}

{
  const s=await simulate();
  try {
    await s.advance(700);await s.tap(430,346);await s.until(()=>s.scene().sys.settings.key==='room','opening assets');
    assert.ok(s.game.textures.exists('k:truck'),'opening creates the truck before displaying it');
    assert.equal(s.scene().children.list.filter(o=>o.texture?.key==='__MISSING').length,0);
    console.log('PASS fresh opening has no missing-texture props');
  }finally{s.close();}
}
