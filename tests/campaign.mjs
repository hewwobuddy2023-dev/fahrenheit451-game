import assert from 'node:assert/strict';
import { simulate } from './support/simulation.mjs';
import { campaign } from './support/campaign.mjs';

const s=await simulate();
const d=campaign(s);
const chapters=[];
function expect(room,done){assert.equal(s.scene().room.id,room);assert.equal(s.w.__qa.done().length,done);console.log(`PASS campaign ${room}: ${done}/15`);}
try{
  await s.advance(700);await s.tap(430,346);await s.until(()=>s.scene().sys.settings.key==='room','start');await d.settle();
  for(const id of ['pile1','pile2','pile3','ignite'])await d.visit(id);
  expect('station1',1);await d.visit('out');
  for(const id of ['meet','moon','dew','signs','house','home'])await d.visit(id);
  for(const id of ['w1','w2','w3','t1','t2','t3','script','door'])await d.visit(id);
  expect('station2',3);chapters.push(s.save());
  for(const id of ['hound','cards','dispatch','stairs'])await d.visit(id);
  // Beatty can block the attempt, then looks away. The blocked dialogue must not set the book flag.
  const attic=s.scene();s.w.__qa.go(1140);await s.advance(50);
  await s.until(()=>attic.isWatching(attic.npcs.find(n=>n.def.id==='beatty').def),'watching');
  await s.tap(888,474);await d.settle();assert.ok(!attic.session.flags['c04.book']);
  await s.until(()=>!attic.isWatching(attic.npcs.find(n=>n.def.id==='beatty').def),'look away');
  await d.visit('hide');assert.ok(attic.session.flags['c04.book']);await d.visit('woman');
  await d.visit('chair');await d.visit('vent',{moveStill:true});
  expect('home3',6);chapters.push(s.save());
  for(const id of ['file','phone','door','read','faber','out','switch','ladies','incin'])await d.visit(id);
  expect('lawn',9);chapters.push(s.save());
  for(const id of ['door','beds','w1','w2','w3'])await d.visit(id);
  await d.visit('out',{missHound:true});await d.visit('books');await d.visit('run');
  // Force one capture, then cross the actual lanes with touch movement and safe-gap waits.
  const bv=s.scene();s.w.__qa.go(650);await s.until(()=>bv.caughtAt>0,'boulevard capture');assert.equal(Math.round(bv.player.x),540);
  await d.walkTo(1700);await d.settle();assert.ok(bv.session.flags['c11.crossed']);
  await d.visit('black');await d.visit('on');await d.visit('faber');await d.visit('back');
  const run=s.scene();await s.advance(34500);assert.ok(run.caughtAt>0,'count-of-ten reset');
  await d.walkTo(2500);await d.settle();expect('river',12);chapters.push(s.save());
  const river=s.scene();s.w.__qa.go(650);await s.until(()=>river.caughtAt>0,'river capture');
  await d.walkTo(1600,{dive:true});await d.settle();assert.ok(river.session.flags['c13.shore']);
  await d.walkTo(2040);await d.settle();await d.visit('on');expect('camp',13);
  await d.walkTo(800);await d.settle();await d.visit('granger');expect('camp',14);
  const finalCheckpoint=s.save();
  await d.visit('choice');assert.equal(s.scene().sys.settings.key,'end');
  assert.equal(s.scene().session.flags['c15.ending'],'preservation');assert.equal(s.scene().session.flags['c15.seen'],true);
  console.log('PASS full normal sequential campaign 01–15 + Preservation',d.stats());
  // Each alternate ending starts at the legitimate completed-campaign checkpoint, never forged flags.
  for(const ending of ['defiance','submission']){
    const t=await simulate({save:JSON.parse(finalCheckpoint)});const e=campaign(t);
    try{
      await t.advance(700);await t.tap(430,282);await t.until(()=>t.scene().sys.settings.key==='room','continue final checkpoint');await e.settle();
      const r=t.scene();t.w.__qa.go(1000);await t.advance(50);await t.tap(888,474);
      for(let n=0;n<100 && !r.dialogue.options.some(x=>x.startsWith('Stay.'));n++){if(r.dialogue.open)await t.tap(480,450);else await t.advance(100);} assert.ok(r.dialogue.options.some(x=>x.startsWith('Stay.')),'final choice');
      await t.render();const i=r.dialogue.choices.findIndex(c=>c.set?.['c15.ending']===ending);const bg=r.dialogue.choiceRows[i].list[0];
      assert.ok(i>=0);await t.tap(bg.x+240,bg.y);await e.settle();
      assert.equal(t.scene().sys.settings.key,'end');assert.equal(t.scene().session.flags['c15.ending'],ending);
      assert.equal(t.scene().session.flags['c15.seen'],true);console.log(`PASS independent ending ${ending}`);
    }finally{t.close();}
  }
  // Reload each chapter's saved boundary using actual Continue menu touch input.
  for(const raw of chapters){const saved=JSON.parse(raw);const t=await simulate({save:saved});try{await t.advance(700);await t.tap(430,282);await t.until(()=>t.scene().sys.settings.key==='room','chapter Continue');assert.equal(t.scene().room.id,saved.room);assert.deepEqual({...t.scene().session.flags},saved.flags);console.log('PASS Continue',saved.room);}finally{t.close();}}
  const completed=JSON.parse(s.save());assert.ok(completed.flags['c15.seen']);
  const t=await simulate({save:completed});try{await t.advance(700);await t.tap(430,282);await t.until(()=>t.scene().sys.settings.key==='end','completed ending Continue');await t.advance(3000);await t.tap(480,450);await t.until(()=>t.scene().sys.settings.key==='menu','ending title');console.log('PASS completed ending Continue and return to title');}finally{t.close();}
}finally{s.close();}
