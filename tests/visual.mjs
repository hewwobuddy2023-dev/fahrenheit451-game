// Canvas simulation visual fixtures. These are not browser or iPhone screenshots.
import { simulate } from './support/simulation.mjs';
import { campaign } from './support/campaign.mjs';
const phase=process.argv[2]??'after';
for(const room of ['burn','river']){
 const s=await simulate({width:1366,height:768,lowres:true,save:{v:1,room,x:room==='burn'?1060:650,flags:{[`e.${room}`]:true}}});
 try{await s.advance(700);await s.tap(430,282);await s.until(()=>s.scene().sys.settings.key==='room','visual fixture');await campaign(s).settle();
  if(room==='burn')s.scene().kit.fx.ignite();
  await s.advance(1000);await s.screenshot(`docs/qa/${room}-${phase}-simulation.webp`);
 }finally{s.close();}
}
