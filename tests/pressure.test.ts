import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hoseStep } from '../src/gameplay/pressure.ts';
test('hose must be vented; progress survives release and excessive pressure does not grant completion', () => {
 let s=hoseStep({pressure:0,progress:0,overheated:false},true,8,1500);
 assert.ok(s.overheated);assert.ok(s.progress<1500);
 const progress=s.progress;s=hoseStep(s,false,2,1500);assert.equal(s.progress,progress);assert.equal(s.overheated,false);
 for(let n=0;n<8;n++){s=hoseStep(s,true,1,1500);s=hoseStep(s,false,.25,1500);}
 assert.equal(s.progress,1500);
});
test('hose response is delta-consistent at 10–60 FPS, and assisted hold remains available',()=>{
 const run=(dt:number)=>{let s={pressure:0,progress:0,overheated:false};for(let time=0;time<6;time+=dt)s=hoseStep(s,(time%1.25)<1,dt,1500);return s;};
 for(const dt of [1/60,1/30,1/10])assert.equal(run(dt).progress,1500);
 assert.equal(hoseStep({pressure:0,progress:0,overheated:false},true,2,1500,true).progress,1500);
});
