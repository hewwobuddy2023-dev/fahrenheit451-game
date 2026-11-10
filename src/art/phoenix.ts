/** Original editable set dressing. Painted once per room; no input objects or full-screen shaders. */
import Phaser from 'phaser';
import { paint, poly, rng, vgrad, type Ctx } from './core.ts';
import { FLOOR_TOP } from '../view.ts';
import { settings } from '../settings.ts';
import type { RoomDef } from '../content/types.ts';
import type { Flags } from '../state.ts';

function pipe(c: Ctx, x: number, y: number, width: number, height: number) {
  c.lineCap = 'round';c.lineJoin = 'round';
  for (const [line, col] of [[10, '#080c0b'], [6, '#3b4440'], [1, '#79827a']] as const) {
    c.strokeStyle = col;c.lineWidth = line;c.beginPath();c.moveTo(x, y + height);c.lineTo(x, y + 15);c.quadraticCurveTo(x, y, x + 15, y);c.lineTo(x + width, y);c.stroke();
  }
  c.fillStyle='#1b211f';for(let a=25;a<width;a+=70)c.fillRect(x+a,y-7,5,14);
}
function ovalLamp(c: Ctx, x: number, y: number) {
  c.fillStyle='#080b0a';c.fillRect(x-2,y-65,4,60);c.beginPath();c.ellipse(x,y,28,9,0,Math.PI,0);c.fill();
  c.fillStyle='#c7c8a0';c.beginPath();c.ellipse(x,y,20,3,0,0,Math.PI*2);c.fill();
}
export function phoenixSet(s: Phaser.Scene, room: RoomDef) {
  const family=room.kit.split(':')[0], key=`k:${family}:phoenix:${room.id}`, F=FLOOR_TOP;
  paint(s,key,room.width,F,(c)=>{
    const r=rng(room.width+room.chapter*451);
    if(['station','subway','faber'].includes(family)) {
      pipe(c,40,64,room.width-100,160);pipe(c,170,84,Math.min(700,room.width-200),150);
      for(let x=140;x<room.width;x+=420){ovalLamp(c,x,100);c.fillStyle='rgba(105,137,118,0.12)';poly(c,[x-16,106,x+16,106,x+110,F,x-100,F]);}
      // Inspection panels with round meters, wires and enamel labels.
      for(let x=180;x<room.width;x+=650){c.fillStyle='#222c29';c.beginPath();c.roundRect(x,190,112,100,9);c.fill();c.strokeStyle='#7d8a77';c.lineWidth=1;c.stroke();
        c.fillStyle='#b0b29a';c.beginPath();c.arc(x+30,218,15,0,Math.PI*2);c.fill();c.strokeStyle='#252d27';c.beginPath();c.moveTo(x+30,218);c.lineTo(x+38,207);c.stroke();
        for(let n=0;n<5;n++){c.fillStyle=n===3?'#bb5934':'#4d6560';c.fillRect(x+60,202+n*14,34,6);}c.fillStyle='#7d836f';c.fillRect(x+14,255,30,4);
        c.strokeStyle='#111916';c.lineWidth=3;c.beginPath();c.moveTo(x+57,291);c.bezierCurveTo(x+40,323,x+100,315,x+91,355);c.stroke();}
    }
    if(family==='home') {
      // Actual investigation props at the content hotspots: rotary phone, file-wallet and script.
      c.fillStyle='#28302b';c.beginPath();c.roundRect(247,337,85,26,[12,12,3,3]);c.fill();
      c.fillStyle='#101714';c.beginPath();c.roundRect(245,318,89,15,7);c.fill();
      c.strokeStyle='#899081';c.lineWidth=2;c.beginPath();c.arc(291,347,13,0,Math.PI*2);c.stroke();
      for(let a=0;a<10;a++){const angle=a/10*Math.PI*2;c.fillStyle='#151d19';c.beginPath();c.arc(291+Math.cos(angle)*9,347+Math.sin(angle)*9,2,0,Math.PI*2);c.fill();}
      c.strokeStyle='#121916';c.lineWidth=2;c.beginPath();c.moveTo(251,327);for(let y=331;y<378;y+=4)c.bezierCurveTo(238,y,259,y,248,y+4);c.stroke();
      c.fillStyle='#40372d';poly(c,[973,348,1023,343,1028,373,977,378]);c.fillStyle='#c9b995';poly(c,[980,351,1019,347,1021,367,983,372]);
      c.fillStyle='#4b5144';c.fillRect(985,355,11,10);c.fillStyle='#746b56';c.fillRect(1000,353,15,2);c.fillRect(1000,358,13,2);
      c.fillStyle='#c8c5ab';poly(c,[1724,355,1758,351,1763,380,1728,385]);c.fillStyle='#676f67';for(let y=360;y<378;y+=4)c.fillRect(1732,y,20,1);
      // Hall arch and bevels read as recesses, not a wall-sized black block.
      for(const x of [215,1130,1460]){c.fillStyle='rgba(0,0,0,0.2)';poly(c,[x,85,x+34,102,x+34,F,x,F]);c.strokeStyle='#515460';c.lineWidth=2;c.beginPath();c.moveTo(x,85);c.lineTo(x+34,102);c.lineTo(x+34,F);c.stroke();}
      c.fillStyle='#43504a';c.beginPath();c.ellipse(590,334,45,9,0,0,Math.PI*2);c.fill();c.fillRect(555,334,70,36);c.fillStyle='#141c18';c.fillRect(561,370,5,22);c.fillRect(616,370,5,22);
      for(let i=0;i<11;i++){const x=588+(r()-.5)*52,y=270-r()*80;c.strokeStyle='#33473a';c.lineWidth=3;c.beginPath();c.moveTo(589,333);c.quadraticCurveTo(x,280,x,y);c.stroke();c.fillStyle='#4b5e4a';c.beginPath();c.ellipse(x,y,5,18,-.6,0,Math.PI*2);c.fill();}
      for(const x of [1660,1980,2300]){c.strokeStyle='#657078';c.lineWidth=5;c.beginPath();c.roundRect(x-153,57,306,256,22);c.stroke();c.strokeStyle='#1a2227';c.lineWidth=7;c.beginPath();c.roundRect(x-147,63,294,244,17);c.stroke();
        c.fillStyle='#1d252a';c.fillRect(x-110,316,220,17);for(let n=0;n<8;n++){c.fillStyle=n===3?'#a06944':'#52605c';c.beginPath();c.arc(x-90+n*25,324,3,0,Math.PI*2);c.fill();}}
      // Soft curved sofa back, seams and cylindrical feet behind the live cast.
      c.fillStyle=vgrad(c,336,391,[[0,'#5b4550'],[1,'#241f29']]);c.beginPath();c.roundRect(1770,340,160,49,[20,20,5,5]);c.fill();c.strokeStyle='#78636b';c.lineWidth=1;c.stroke();c.beginPath();c.moveTo(1850,345);c.lineTo(1850,384);c.stroke();
    }
    if(family==='attic'||family==='faber'){
      // Differently sized bound volumes, page blocks and spine bands.
      for(let i=0;i<45;i++){const x=family==='attic'?220+r()*420:900+r()*230,y=family==='attic'?150+Math.floor(r()*5)*30:255-r()*20,w=5+r()*9,h=12+r()*20;c.save();c.translate(x,y);c.rotate((r()-.5)*.3);c.fillStyle=['#6d4030','#4d6050','#5a5c72','#8b7b51'][i%4];c.fillRect(0,-h,w,h);c.fillStyle='#b2a18a';c.fillRect(1,-h+3,w-2,1);c.fillRect(1,-3,w-2,1);c.restore();}
      c.strokeStyle='#8b7753';c.lineWidth=2;c.beginPath();c.arc(room.width-250,180,21,0,Math.PI*2);c.stroke();c.lineWidth=1;c.beginPath();c.moveTo(room.width-250,180);c.lineTo(room.width-250,167);c.lineTo(room.width-241,180);c.stroke();
    }
    if(family==='forest'){
      for(let i=0;i<36;i++){let x=r()*room.width,y=F-12-r()*70;c.strokeStyle='#30453a';c.lineWidth=1;c.beginPath();c.moveTo(x,F);c.quadraticCurveTo(x-12,y,x+5,y-15);c.stroke();}
      // No foreground trunks or opaque geometry across the swimmer.
    }
  });
  s.add.image(0,0,key).setOrigin(0).setDepth(1.8);
  const faces: Phaser.GameObjects.Container[]=[];
  if(family==='home') for(const [i,x] of [1660,1980,2300].entries()) {
    const g=s.add.graphics().fillStyle([0x7c9290,0x798e9b,0x9b8582][i],.75);
    g.fillEllipse(0,-12,66,88).fillRoundedRect(-54,30,108,74,22).fillStyle(0x17232b,1).fillEllipse(-14,-22,12,5).fillEllipse(14,-22,12,5);
    g.lineStyle(2,0xd7d8ba,.6).beginPath().arc(0,-10,23,.2,Math.PI-.2).strokePath();
    const face=s.add.container(x,176,[g]).setDepth(1.65);faces.push(face);
  }
  let elapsed=0;
  return { update(f:Flags){const off=room.id==='home3'||room.id==='home5'||!!f['c09.off']||(room.id==='home1'&&!f['h1.day']);faces.forEach(o=>o.setVisible(!off));},
    tick(dt:number){elapsed+=dt;faces.forEach((o,i)=>o.setScale(1,settings.reducedMotion?1:1+Math.sin(elapsed*.0009+i)*.015));} };
}
