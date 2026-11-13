import assert from 'node:assert/strict';
import { simulate } from './support/simulation.mjs';
import { campaign } from './support/campaign.mjs';
import { mkdir } from 'node:fs/promises';
await mkdir('docs/qa/phoenix-mechanics',{recursive:true});
for(const [room,id,flag] of [['subway','read','c08.verse'],['camp','granger','c14.recall']]) {
 const flags=room==='camp'?{'e.camp':true,'cp.met':true,'c13.shore':true,'c13.track':true}:{};
 const s=await simulate({save:{v:1,room,x:room==='camp'?1080:620,flags},lowres:true});
 try{
  await s.advance(700);await s.tap(430,282);await s.until(()=>s.scene().sys.settings.key==='room','memory Continue');await campaign(s).settle();
  const r=s.scene();if(room==='camp')assert.equal(r.children.list.some(o=>o.name==='phoenix-city-layer'),false,'city panorama must not survive the bombing horizon');const h=r.room.hotspots.find(h=>h.id===id);s.w.__qa.go(h.x);await s.advance(50);await s.tap(888,474);
  for(let n=0;n<40&&!r.dialogue.puzzle;n++)await s.tap(480,450);
  assert.equal(r.dialogue.puzzle.state.phase,'study');assert.ok(!r.session.flags[flag]);
  await s.screenshot(`docs/qa/phoenix-mechanics/${room}-study.webp`);
  await s.tap(480,450);
  for(const i of [1,0,2,3])await s.tap(220+(i%2)*425,231+Math.floor(i/2)*75);
  assert.equal(r.dialogue.puzzle.state.attempts,1);assert.equal(r.dialogue.puzzle.state.selected.length,0);assert.ok(!r.session.flags[flag]);
  await s.tap(850,63);assert.equal(r.mode,'pause');await s.advance(10000);assert.ok(!r.session.flags[flag]);await s.tap(500,234);assert.equal(r.mode,'dialogue');
  await s.tap(490,470);await s.tap(490,470);await s.tap(490,470); // graduated optional hints
  await s.screenshot(`docs/qa/phoenix-mechanics/${room}-retry.webp`);
  await s.tap(180,470);assert.equal(r.dialogue.puzzle.state.phase,'study');await s.tap(480,450);
  for(const i of [2,5,0,4])await s.tap(220+(i%2)*425,231+Math.floor(i/2)*75);
  await campaign(s).settle();assert.equal(r.session.flags[flag],true);
  console.log('PASS source-first sequence, wrong order, optional hints/reference, pause, earned flag:',room);
 }finally{s.close();}
}
{
 const s=await simulate({save:{v:1,room:'burn',x:1060,flags:{'e.burn':true}},lowres:true});
 try{
  await s.advance(700);await s.tap(430,282);await s.until(()=>s.scene().sys.settings.key==='room','hose Continue');await campaign(s).settle();
  const r=s.scene();await s.touch('touchstart',888,474);await s.advance(2000);assert.ok(r.sputter,'above the band the hose sputters');assert.ok(r.hose.progress>1000,'but a held hose keeps making progress');await s.touch('touchend',888,474);assert.ok(!r.session.flags['c01.p2']);
  await s.screenshot('docs/qa/phoenix-mechanics/hose-overpressure.webp');
  const before=r.hose.progress;await s.tap(914,112);await s.advance(5000);assert.equal(r.hose.progress,before);await s.tap(500,234);
  await s.advance(1800);assert.equal(r.hose.overheated,false);await campaign(s).visit('pile2');assert.equal(r.session.flags['c01.p2'],true);
  assert.equal(s.game.textures.exists('phoenix:city'),true);
  console.log('PASS held hose sputters above the band but never stalls; release keeps progress, pause freezes, city texture loaded');
 }finally{s.close();}
}
{
 const s=await simulate({save:{v:1,room:'attic',x:1140,flags:{'e.attic':true,'a.fell':true}},lowres:true});
 try{
  await s.advance(700);await s.tap(430,282);await s.until(()=>s.scene().sys.settings.key==='room','stealth Continue');await campaign(s).settle();
  const r=s.scene(),w=r.npcs.find(n=>n.def.id==='beatty').def;
  await s.until(()=>r.isWatching(w),'watching');await s.touch('touchstart',888,474);await s.advance(500);await s.touch('touchend',888,474);assert.ok(!r.session.flags['c04.book']);assert.equal(r.holdMs,0);
  await s.until(()=>!r.isWatching(w),'turn away');await campaign(s).visit('hide');assert.equal(r.session.flags['c04.book'],true);
  console.log('PASS watched concealment resets attempt; held safe window commits book after its story beat');
 }finally{s.close();}
}
{
 const s=await simulate({save:{v:1,room:'river',x:200,flags:{'e.river':true}},lowres:true});
 try{
  await s.advance(700);await s.tap(430,282);await s.until(()=>s.scene().sys.settings.key==='room','breath Continue');await campaign(s).settle();
  const r=s.scene();await s.touch('touchstart',776,474);await s.advance(5000);assert.ok(r.breath.exhausted);assert.equal(r.player.alpha,1);await s.touch('touchend',776,474);await s.advance(2200);assert.equal(r.breath.air,1);assert.equal(r.breath.exhausted,false);
  await campaign(s).walkTo(1600,{dive:true});await campaign(s).settle();assert.equal(r.session.flags['c13.shore'],true);
  console.log('PASS no permanent-dive bypass; recover and cross river using timed native-sized touch controls');
 }finally{s.close();}
}
