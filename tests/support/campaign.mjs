import assert from 'node:assert/strict';

/** Teleports only between static hotspots. Events, holds, choices, retries and chases use real game logic/input. */
export function campaign(s) {
  let wrongPicks = 0, missedHound = 0, stillResets = 0;
  const tried = new WeakSet();
  async function settle({ missHound = false, moveStill = false } = {}) {
    for (let i = 0; i < 5000; i++) {
      const r = s.scene();
      if (r.sys.settings.key === 'end') return;
      if (r.mode === 'play' && !r.stillWatch) return;
      if (r.dialogue?.open) {
        if (r.dialogue.choosing) {
          const choices = r.dialogue.choices;
          let index = choices.findIndex(c => !c.again);
          if (!tried.has(choices) && choices.some(c => c.again)) {
            tried.add(choices); index = choices.findIndex(c => c.again); wrongPicks++;
          }
          await s.render();
          const bg = r.dialogue.choiceRows[index].list[0];
          await s.tap(bg.x + 240, bg.y);
        } else await s.tap(480,450);
      } else if (r.promptWait) {
        if (missHound && !missedHound) { await s.advance(2000); missedHound++; }
        else { await s.tap(888,474); assert.ok(!r.promptWait || r.promptWait.hit, 'quick tap latched'); }
      } else if (r.stillWatch && moveStill && !stillResets) {
        const before=r.stillWatch.until;
        await s.touch('touchstart',174,478); await s.advance(200); await s.touch('touchend',174,478);
        assert.ok(r.stillWatch.until>before,'movement resets only stillness wait'); stillResets++;
        await s.tap(914,112); assert.equal(r.mode,'pause');
        await s.advance(6000); assert.equal(r.mode,'pause'); assert.ok(r.stillWatch,'pause must not finish the encounter');
        await s.tap(500,234); assert.equal(r.mode,'play'); assert.ok(r.stillWatch.until>r.activeTime);
      } else await s.advance(100);
    }
    throw new Error(`Unsettled ${s.scene().room?.id}/${s.scene().mode}/${s.scene().dialogue?.current}`);
  }
  async function visit(id, opts) {
    await settle(opts);
    const r=s.scene();
    const h=r.room.hotspots.find(h=>h.id===id);
    assert.ok(h,`${r.room.id}/${id} exists`);
    assert.ok(!h.when || h.when(r.session.flags),`${r.room.id}/${id} active`);
    s.w.__qa.go(h.x); await s.advance(50);
    if (!h.auto) {
      if (h.hold) {
        await s.touch('touchstart',888,474); await s.advance(h.hold.ms+100); await s.touch('touchend',888,474);
        assert.ok(r.session.flags[h.hold.flag],`hold completed ${h.hold.flag}`);
      } else await s.tap(888,474);
    }
    await settle(opts);
  }
  async function walkTo(target, { dive = false, avoid = true, maxMs = 180000 } = {}) {
    const roomId=s.scene().room.id;
    let pressed=false;
    const release=async()=>{ if(pressed){await s.touch('touchend',174,478,1);if(dive)await s.touch('touchend',776,474,2);pressed=false;} };
    for(let elapsed=0;elapsed<maxMs;elapsed+=100){
      const r=s.scene();
      if(r.room.id!==roomId || r.player.x>=target){await release();return;}
      if(r.mode!=='play' || r.stillWatch){await release();await settle();continue;}
      let safe=true;
      if(avoid)for(const h of r.room.hazards??[]){
        if(!h.pulse || (h.when&&!h.when(r.session.flags)))continue;
        const edge=h.from-14;
        if(r.player.x<edge && edge-r.player.x<30){
          const speed=175*(r.room.limp?0.72:1);
          const duration=(h.to+28-r.player.x)/speed*1000+150;
          for(let t=0;t<duration;t+=50){if(((r.activeTime+t)/h.period+(h.phase??0))%1*h.period<h.pulse){safe=false;break;}}
        }
      }
      if(!safe){await release();await s.advance(100);continue;}
      if(!pressed){await s.touch('touchstart',174,478,1);if(dive)await s.touch('touchstart',776,474,2);pressed=true;}
      await s.advance(100);
    }
    await release();throw new Error(`Walk timed out ${roomId} x=${s.scene().player.x}`);
  }
  return { settle,visit,walkTo,stats:()=>({wrongPicks,missedHound,stillResets}) };
}
