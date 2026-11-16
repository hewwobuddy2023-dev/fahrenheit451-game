/** Original editable set dressing. Painted once per room; no input objects or full-screen shaders. */
import Phaser from 'phaser';
import { paint, poly, radial, rng, vgrad, type Ctx } from './core.ts';
import { FLOOR_TOP } from '../view.ts';
import { atticDressing, layers, subwayDressing } from './setLayers.ts';
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
export function setDressing(s: Phaser.Scene, room: RoomDef) {
  const family=room.kit.split(':')[0], key=`k:${family}:set:${room.id}`, F=FLOOR_TOP;
  paint(s,key,room.width,F,(c)=>{
    const r=rng(room.width+room.chapter*451);
    if(family==='subway') subwayDressing(c,room.width,F,r);
    if(family==='station') {
      // pipe runs in short hand-placed lengths with valves; the kit hangs its own lamps
      for(const [x,y,w] of [[40,64,520],[620,70,380],[1120,64,640],[1830,72,500]] as const) pipe(c,x,y,w,150+(x%3)*10);
      for(const x of [560,1000,1760]) { c.fillStyle='#4a2a1c'; c.beginPath(); c.arc(x,92,7,0,Math.PI*2); c.fill(); c.fillStyle='#8a4a2a'; c.fillRect(x-1,76,2,8); }
      // Inspection panels with round meters, wires and enamel labels; every third is a fuse box with throw-switches.
      for(let x=180,n=0;x<room.width;x+=650,n++){
        if(n%3===2){c.fillStyle='#1d2523';c.fillRect(x,200,90,120);c.strokeStyle='#6a7566';c.lineWidth=1;c.strokeRect(x,200,90,120);for(let k=0;k<4;k++){c.fillStyle='#0a0f0d';c.fillRect(x+12+k*18,222,8,40);c.fillStyle=k%2?'#b86a3a':'#8a9484';c.fillRect(x+11+k*18,k%2?222:250,10,12);}continue;}c.fillStyle='#222c29';c.beginPath();c.roundRect(x,190,112,100,9);c.fill();c.strokeStyle='#7d8a77';c.lineWidth=1;c.stroke();
        c.fillStyle='#b0b29a';c.beginPath();c.arc(x+30,218,15,0,Math.PI*2);c.fill();c.strokeStyle='#252d27';c.beginPath();c.moveTo(x+30,218);c.lineTo(x+38,207);c.stroke();
        for(let n=0;n<5;n++){c.fillStyle=n===3?'#bb5934':'#4d6560';c.fillRect(x+60,202+n*14,34,6);}c.fillStyle='#7d836f';c.fillRect(x+14,255,30,4);
        c.strokeStyle='#111916';c.lineWidth=3;c.beginPath();c.moveTo(x+57,291);c.bezierCurveTo(x+40,323,x+100,315,x+91,355);c.stroke();}
    }
    if(family==='home') {
      // Actual investigation props at the content hotspots: rotary phone and file-wallet.
      // hall table with a rotary telephone: enamel body, handset across the cradle, finger dial, curling cord
      c.fillStyle='#5a4630';c.fillRect(226,352,130,8);c.fillStyle='#3a2c1e';c.fillRect(236,360,8,32);c.fillRect(338,360,8,32);c.fillStyle='rgba(255,230,180,0.18)';c.fillRect(226,352,130,1);
      c.fillStyle='#8a2c24';poly(c,[246,352,336,352,324,326,258,326]);c.fillStyle='rgba(255,255,255,0.18)';c.fillRect(260,327,62,2);
      c.fillStyle='#1a1214';c.beginPath();c.roundRect(244,312,94,13,6);c.fill();for(const x of [250,332]){c.beginPath();c.arc(x,318,9,0,Math.PI*2);c.fill();}c.fillStyle='rgba(255,255,255,0.15)';c.fillRect(256,313,70,2);
      c.fillStyle='#d8d0b8';c.beginPath();c.arc(291,340,12,0,Math.PI*2);c.fill();c.fillStyle='#4a1a16';c.beginPath();c.arc(291,340,3.5,0,Math.PI*2);c.fill();
      for(let a=0;a<10;a++){const angle=0.9+a/10*Math.PI*1.7;c.fillStyle='#2a1612';c.beginPath();c.arc(291+Math.cos(angle)*8.4,340+Math.sin(angle)*8.4,1.8,0,Math.PI*2);c.fill();}
      c.strokeStyle='#14100f';c.lineWidth=2;c.beginPath();c.moveTo(246,346);for(let y=350;y<388;y+=5)c.bezierCurveTo(232,y,254,y,242,y+5);c.stroke();
      c.fillStyle='#40372d';poly(c,[973,348,1023,343,1028,373,977,378]);c.fillStyle='#c9b995';poly(c,[980,351,1019,347,1021,367,983,372]);
      c.fillStyle='#4b5144';c.fillRect(985,355,11,10);c.fillStyle='#746b56';c.fillRect(1000,353,15,2);c.fillRect(1000,358,13,2);
      // (the parlor script now lives in Mildred's hands, drawn by her seated pose)
      // Hall arch and bevels read as recesses, not a wall-sized black block.
      for(const x of [215,1130,1460]){c.fillStyle=vgrad(c,85,F,[[0,'rgba(0,0,0,0.12)'],[1,'rgba(0,0,0,0)']]);poly(c,[x,85,x+34,102,x+34,F,x,F]);}
      c.fillStyle='#43504a';c.beginPath();c.ellipse(590,334,45,9,0,0,Math.PI*2);c.fill();c.fillRect(555,334,70,36);c.fillStyle='#141c18';c.fillRect(561,370,5,22);c.fillRect(616,370,5,22);
      const dead=room.id==='home5';for(let i=0;i<11;i++){const x=588+(r()-.5)*52,y=270-r()*(dead?40:80);c.strokeStyle=dead?'#3a2c1e':'#33473a';c.lineWidth=3;c.beginPath();c.moveTo(589,333);c.quadraticCurveTo(x,280,x,y);c.stroke();c.fillStyle=dead?'#5a4630':'#4b5e4a';c.beginPath();c.ellipse(x,y,5,dead?9:18,dead?.9:-.6,0,Math.PI*2);c.fill();}
      for(const x of [1660,1980,2300]){c.strokeStyle='#657078';c.lineWidth=5;c.beginPath();c.roundRect(x-153,57,306,256,22);c.stroke();c.strokeStyle='#1a2227';c.lineWidth=7;c.beginPath();c.roundRect(x-147,63,294,244,17);c.stroke();
        c.fillStyle='#1d252a';c.fillRect(x-110,316,220,17);for(let n=0;n<8;n++){c.fillStyle=n===3?'#a06944':'#52605c';c.beginPath();c.arc(x-90+n*25,324,3,0,Math.PI*2);c.fill();}}
    }
    if(family==='attic'||family==='faber'){
      // Differently sized bound volumes, page blocks and spine bands.
      for(let i=0;i<45;i++){const x=family==='attic'?220+r()*420:900+r()*230,y=family==='attic'?150+Math.floor(r()*5)*30:255-r()*20,w=5+r()*9,h=12+r()*20;c.save();c.translate(x,y);c.rotate((r()-.5)*.3);c.fillStyle=['#6d4030','#4d6050','#5a5c72','#8b7b51'][i%4];c.fillRect(0,-h,w,h);c.fillStyle='#b2a18a';c.fillRect(1,-h+3,w-2,1);c.fillRect(1,-3,w-2,1);c.restore();}
      c.strokeStyle='#8b7753';c.lineWidth=2;c.beginPath();c.arc(room.width-250,180,21,0,Math.PI*2);c.stroke();c.lineWidth=1;c.beginPath();c.moveTo(room.width-250,180);c.lineTo(room.width-250,167);c.lineTo(room.width-241,180);c.stroke();
    }
    if(family==='attic') atticDressing(c,room.width,F,r);
    if(family==='faber'){
      // a professor's room: every shelf stocked, a pendant lamp, the radio and a bench lamp (plus the green bead, his invention)
      for(const y of [150,198,246,294,340])for(let x=404;x<592;){const w=5+Math.floor(r()*8),h=18+Math.floor(r()*24);c.fillStyle=['#6d4030','#4d6050','#5a5c72','#8b7b51','#7a3a3a','#3f5a6a'][Math.floor(r()*6)];c.fillRect(x,y-h,w,h);c.fillStyle='rgba(255,235,200,0.35)';c.fillRect(x+1,y-h+3,w-2,1);x+=w+1;if(r()<.08)x+=12;}
      c.fillStyle='#0a0908';c.fillRect(299,40,2,118);poly(c,[270,170,330,170,316,150,284,150]);radial(c,300,172,130,'rgba(255,214,150,A)',0.3);
      c.fillStyle='#6a4a2c';c.beginPath();c.roundRect(905,224,62,36,5);c.fill();c.fillStyle='#b8a47a';c.fillRect(911,231,28,23);c.fillStyle='rgba(60,40,20,0.35)';for(let y=233;y<254;y+=4)c.fillRect(911,y,28,1);c.fillStyle='#e0d6b4';c.fillRect(944,231,17,10);c.fillStyle='#2a1e12';c.beginPath();c.arc(947,249,3,0,Math.PI*2);c.arc(958,249,3,0,Math.PI*2);c.fill();
      c.fillStyle='#3a8a5a';c.beginPath();c.ellipse(1010,257,9,4,0,0,Math.PI*2);c.fill();c.fillStyle='rgba(255,255,255,0.35)';c.fillRect(1006,255,5,1);
      c.fillStyle='#5a4630';c.beginPath();c.ellipse(1090,259,13,4,0,0,Math.PI*2);c.fill();c.fillRect(1088,234,4,25);c.fillStyle='#d8b878';poly(c,[1068,236,1112,236,1103,212,1077,212]);radial(c,1090,226,80,'rgba(255,214,140,A)',0.45);
    }
    if(family==='forest'){
      for(let i=0;i<36;i++){let x=r()*room.width,y=F-12-r()*70;c.strokeStyle='#30453a';c.lineWidth=1;c.beginPath();c.moveTo(x,F);c.quadraticCurveTo(x-12,y,x+5,y-15);c.stroke();}
      // No foreground trunks or opaque geometry across the swimmer.
    }
  });
  s.add.image(0,0,key).setOrigin(0).setDepth(1.8);
  layers(s,room,family);
  const faces: Phaser.GameObjects.Container[]=[];
  // Parlor walls play painted broadcasts from the home kit (src/art/cinema.ts).
  let elapsed=0;
  return { update(f:Flags){const off=room.id==='home3'||room.id==='home5'||!!f['c09.off']||(room.id==='home1'&&!f['h1.day']);faces.forEach(o=>o.setVisible(!off));},
    tick(dt:number){elapsed+=dt;faces.forEach((o,i)=>o.setScale(1,settings.reducedMotion?1:1+Math.sin(elapsed*.0009+i)*.015));} };
}
