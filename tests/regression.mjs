import assert from 'node:assert/strict';
import { simulate } from './support/simulation.mjs';
import { campaign } from './support/campaign.mjs';
import { CHAPTER_STARTS } from '../src/content.ts';

for(const raw of ['{bad',JSON.stringify({v:1,room:'missing',x:1,flags:{}})]){
 const s=await simulate({save:raw});try{assert.equal(s.scene().list.rows[0].item.enabled,false);await s.advance(700);await s.tap(430,346);await s.until(()=>s.scene().sys.settings.key==='room','corrupt save New Game');console.log('PASS invalid save disabled Continue');}finally{s.close();}
}
{
 const s=await simulate({blocked:true});try{await s.advance(700);await s.tap(430,346);await s.until(()=>s.scene().sys.settings.key==='room','blocked storage');await campaign(s).settle();assert.equal(s.scene().mode,'play');console.log('PASS blocked localStorage getter: boot, New Game, checkpoint');}finally{s.close();}
}
for(let i=0;i<5;i++){
 const sentinel={v:1,room:'burn',x:650,flags:{'c01.tone':'deferent'}};
 const s=await simulate({save:sentinel});try{
  const before=s.save();await s.advance(700);await s.tap(430,410);assert.equal(s.scene().list.rows.length,6);
  await s.tap(430,154+64*i);await s.until(()=>s.scene().sys.settings.key==='room','chapter selection');
  assert.equal(s.scene().session.demo,true);assert.equal(s.scene().room.id,CHAPTER_STARTS[i].room);
  await campaign(s).settle();assert.equal(s.save(),before);
  await s.tap(914,112);await s.tap(500,338);await s.until(()=>s.scene().sys.settings.key==='menu','demo quit');assert.equal(s.save(),before);
  console.log(`PASS touch Presentation chapter ${i+1} and quit never alter normal save`);
 }finally{s.close();}
}
{
 const start=CHAPTER_STARTS[4];const s=await simulate({save:{v:1,...start}});try{
  await s.advance(700);await s.tap(430,282);await s.until(()=>s.scene().sys.settings.key==='room','river Continue');await campaign(s).settle();
  const r=s.scene();await s.touch('touchstart',174,478,1);await s.touch('touchstart',776,474,2);await s.advance(100);
  assert.ok(r.hud.touchRight&&r.hud.touchDown);assert.equal(r.player.alpha,0.35);
  await s.touch('touchend',776,474,2);assert.ok(r.hud.touchRight&&!r.hud.touchDown);
  await s.touch('touchcancel',174,478,1);assert.ok(!r.hud.touchRight&&!r.hud.touchDown);
  const x=r.player.x;await s.key('KeyD');await s.advance(800);await s.key('KeyD',false);assert.ok(r.player.x>x+80);
  s.game.events.emit('blur');assert.ok(!r.hud.touchRight);assert.ok(!r.keys.right.some(k=>k.isDown));
  console.log('PASS multitouch DIVE + movement, individual release, cancel, keyboard hold and blur');
 }finally{s.close();}
}
{
 const s=await simulate({save:{v:1,room:'burn',x:600,flags:{'e.burn':true,'c01.p1':true,'c01.p2':true,'c01.p3':true}}});try{
  await s.advance(700);await s.tap(430,282);await s.until(()=>s.scene().sys.settings.key==='room','event boundary');await campaign(s).settle();
  const r=s.scene();await s.advance(50);await s.tap(888,474);const line=r.dialogue.current;
  for(let i=0;i<5;i++)await s.key('Enter',true,true);assert.equal(r.dialogue.current,line);await s.key('Enter',false);
  for(let i=0;i<20&&!r.dialogue.choosing;i++)await s.tap(480,450);
  const before=s.save();assert.ok(r.dialogue.choosing);await s.render();await s.tap(400,r.dialogue.choiceRows[0].list[0].y);
  for(let i=0;i<20&&!r.session.flags['c01.lit'];i++)await s.tap(480,450);
  assert.ok(r.session.flags['c01.lit']);assert.equal(s.save(),before,'no partial completed flag checkpoint');
  const reload=await simulate({save:JSON.parse(before)});try{await reload.advance(700);await reload.tap(430,282);await reload.until(()=>reload.scene().sys.settings.key==='room','mid-event reload');assert.ok(!reload.scene().session.flags['c01.lit']);}finally{reload.close();}
  await campaign(s).settle();assert.equal(JSON.parse(s.save()).room,'station1');
  console.log('PASS repeated keys ignored, mid-dialogue reload rolls back safely, event commits at next room');
 }finally{s.close();}
}
