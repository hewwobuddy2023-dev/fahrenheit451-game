// Staged composition fixtures, not proof of a playthrough. Canvas fallback ignores some WebGL tints.
import { mkdir } from 'node:fs/promises';
import { simulate } from './support/simulation.mjs';
import { campaign } from './support/campaign.mjs';
import { CHAPTER_STARTS } from '../src/content.ts';
const phase = process.argv[2] ?? 'after';
const output = `docs/qa/day2-${phase}`;
await mkdir(output, { recursive: true });
const cases = [
  ['ch1-burn','burn',1060,0,{'e.burn':true},'ignite'],
  ['ch1-clarisse','corner',1000,0,{'c02.meet':true,'c02.n1':'look'}],
  ['ch1-parlor','home1',2000,0,{'e.home1':true,'h1.day':true}],
  ['ch2-firehouse','station2',1400,1,{'e.station2':true}],
  ['ch2-attic','attic',1220,1,{'e.attic':true}],
  ['ch3-subway','subway',600,2,{'e.subway':true}],
  ['ch3-faber','faber1',1000,2,{'e.faber1':true}],
  ['ch4-house','home5',1980,3,{'e.home5':true,'c10.beds':true,'c10.w1':true,'c10.w2':true}],
  ['ch4-boulevard','boulevard',940,3,{'e.boulevard':true}],
  ['ch5-river','river',650,4,{'e.river':true}],
  ['ch5-camp','camp',1080,4,{'e.camp':true,'cp.met':true,'c13.shore':true,'c13.track':true}],
];
for (const [name,room,x,chapter,flags,fx] of cases) {
  const s=await simulate({width:1366,height:768,lowres:true,save:{v:1,room,x,flags:{...CHAPTER_STARTS[chapter].flags,...flags}}});
  try {
    await s.advance(700);await s.tap(430,282);await s.until(()=>s.scene().sys.settings.key==='room','gallery Continue');
    await campaign(s).settle();if(fx)s.scene().kit.fx[fx]();await s.advance(950);
    await s.screenshot(`${output}/${name}.webp`);
    console.log('Rendered',name);
  } finally {s.close();}
}
