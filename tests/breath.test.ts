import {test} from 'node:test';
import assert from 'node:assert/strict';
import {diveStep} from '../src/gameplay/breath.ts';
test('diving has finite breath and requires release to recover; equivalent elapsed time is equivalent',()=>{
 const start={air:1,exhausted:false};
 const empty=diveStep(start,true,5);assert.equal(empty.diving,false);assert.equal(empty.exhausted,true);
 assert.equal(diveStep(empty,true,10).diving,false);
 const ready=diveStep(empty,false,2);assert.equal(ready.air,1);assert.equal(ready.exhausted,false);assert.equal(diveStep(ready,true,.5).diving,true);
 let slow=start;for(let i=0;i<30;i++)slow=diveStep(slow,true,.1);
 assert.ok(Math.abs(slow.air-diveStep(start,true,3).air)<1e-6);
});
