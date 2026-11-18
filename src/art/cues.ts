// Mini-game cue art. One colour language everywhere: cool cream/teal = safe, amber = it is coming, hot red-white = danger now.
// Everything is painted once into textures at boot; the scene only moves, tints and crops these images.
import Phaser from 'phaser';
import { paint, radial, type Ctx } from './core.ts';

const INK = '#0d0a09';

function eye(c: Ctx, st: 0 | 1 | 2) {
  const col = st === 2 ? '#e8452a' : st === 1 ? '#f0a838' : '#cdbfa6';
  radial(c, 36, 36, 36, st === 2 ? 'rgba(255,80,40,A)' : st === 1 ? 'rgba(255,170,60,A)' : 'rgba(0,0,0,A)', st ? 0.55 : 0.2);
  c.fillStyle = INK; c.beginPath(); c.arc(36, 36, 27, 0, Math.PI * 2); c.fill();
  c.lineWidth = st ? 3 : 1.5; c.strokeStyle = col; c.globalAlpha = st ? 1 : 0.45; c.beginPath(); c.arc(36, 36, 27, 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1;
  const open = st === 2 ? 15 : st === 1 ? 7 : 0;
  if (open) {
    c.fillStyle = '#f3e8d0'; c.beginPath(); c.ellipse(36, 36, 21, open, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = col; c.beginPath(); c.arc(36, 36, Math.min(9, open), 0, Math.PI * 2); c.fill();
    c.fillStyle = INK; c.beginPath(); c.arc(36, 36, Math.min(4, open / 2), 0, Math.PI * 2); c.fill();
    if (st === 2) { c.strokeStyle = '#f3e8d0'; c.lineWidth = 2; c.beginPath(); c.moveTo(14, 26); c.quadraticCurveTo(36, 12, 58, 26); c.stroke(); } // a lowered brow
  } else { // a shut eye: the lid line and two lashes
    c.strokeStyle = col; c.globalAlpha = 0.6; c.lineWidth = 3; c.lineCap = 'round';
    c.beginPath(); c.arc(36, 30, 15, 0.4, Math.PI - 0.4); c.stroke();
    c.lineWidth = 2; c.beginPath(); c.moveTo(24, 44); c.lineTo(21, 49); c.moveTo(36, 46); c.lineTo(36, 52); c.moveTo(48, 44); c.lineTo(51, 49); c.stroke(); c.globalAlpha = 1;
  }
}

export function paintCues(s: Phaser.Scene) {
  ([0, 1, 2] as const).forEach((st) => paint(s, `cue:eye${st}`, 72, 72, (c) => eye(c, st)));
  // an air bubble with a highlight
  paint(s, 'cue:bubble', 28, 28, (c) => {
    c.fillStyle = 'rgba(150,215,255,0.28)'; c.beginPath(); c.arc(14, 14, 11, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(210,240,255,0.95)'; c.lineWidth = 2; c.beginPath(); c.arc(14, 14, 11, 0, Math.PI * 2); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.9)'; c.beginPath(); c.ellipse(10, 9.5, 3.2, 2, -0.6, 0, Math.PI * 2); c.fill();
  });
  // hazard chevrons for a lane's road surface, white so the scene can tint it amber or hot
  paint(s, 'cue:stripe', 64, 24, (c) => {
    c.fillStyle = 'rgba(255,255,255,0.14)'; c.fillRect(0, 0, 64, 24);
    c.fillStyle = 'rgba(255,255,255,0.9)';
    for (let x = -24; x < 72; x += 32) { c.beginPath(); c.moveTo(x, 24); c.lineTo(x + 12, 0); c.lineTo(x + 24, 0); c.lineTo(x + 12, 24); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,0.9)'; c.fillRect(0, 0, 64, 2); c.fillRect(0, 22, 64, 2);
  });
  // the safe kerb pad: a cool lit slab with a bright lip
  paint(s, 'cue:island', 76, 28, (c) => {
    radial(c, 38, 14, 44, 'rgba(150,230,190,A)', 0.5);
    c.fillStyle = 'rgba(110,190,150,0.55)'; c.beginPath(); c.roundRect(4, 4, 68, 20, 5); c.fill();
    c.strokeStyle = 'rgba(200,255,225,0.95)'; c.lineWidth = 2; c.beginPath(); c.roundRect(4, 4, 68, 20, 5); c.stroke();
    c.fillStyle = 'rgba(220,255,235,0.8)'; c.beginPath(); c.moveTo(38, 8); c.lineTo(48, 18); c.lineTo(28, 18); c.fill();
  });
  // the closing-in edge for the count of ten
  paint(s, 'cue:edge', 128, 8, (c) => {
    const g = c.createLinearGradient(0, 0, 128, 0);
    g.addColorStop(0, 'rgba(190,24,12,1)'); g.addColorStop(0.35, 'rgba(160,20,10,0.55)'); g.addColorStop(1, 'rgba(120,10,6,0)');
    c.fillStyle = g; c.fillRect(0, 0, 128, 8);
  });
  // a big key cap for the Hound's moment and one pip of its draining ring
  paint(s, 'cue:key', 84, 80, (c) => {
    c.fillStyle = 'rgba(0,0,0,0.55)'; c.beginPath(); c.roundRect(6, 12, 72, 64, 14); c.fill();
    c.fillStyle = '#b9ad98'; c.beginPath(); c.roundRect(6, 6, 72, 64, 14); c.fill();
    const g = c.createLinearGradient(0, 6, 0, 66); g.addColorStop(0, '#f6ecd6'); g.addColorStop(1, '#d9cbb0');
    c.fillStyle = g; c.beginPath(); c.roundRect(10, 8, 64, 54, 11); c.fill();
  });
  paint(s, 'cue:pip', 16, 16, (c) => { radial(c, 8, 8, 8, 'rgba(255,255,255,A)', 0.45); c.fillStyle = '#fff'; c.beginPath(); c.arc(8, 8, 5, 0, Math.PI * 2); c.fill(); });
  // the stillness ring at Montag's feet, a dashed ellipse wiped in as the count runs
  paint(s, 'cue:stillring', 150, 44, (c) => {
    c.strokeStyle = '#fff'; c.lineWidth = 5; c.lineCap = 'round'; c.setLineDash([14, 8]);
    c.beginPath(); c.ellipse(75, 22, 68, 17, 0, 0, Math.PI * 2); c.stroke();
  });
  // a held-action bar: dark slot and a warm fill with a hot edge
  paint(s, 'cue:barbg', 112, 16, (c) => {
    c.fillStyle = 'rgba(13,10,9,0.88)'; c.beginPath(); c.roundRect(0, 0, 112, 16, 8); c.fill();
    c.strokeStyle = 'rgba(240,226,200,0.35)'; c.lineWidth = 1; c.beginPath(); c.roundRect(0.5, 0.5, 111, 15, 8); c.stroke();
  });
  paint(s, 'cue:barfill', 100, 8, (c) => {
    const g = c.createLinearGradient(0, 0, 100, 0); g.addColorStop(0, '#c8702a'); g.addColorStop(1, '#ffc060');
    c.fillStyle = g; c.beginPath(); c.roundRect(0, 0, 100, 8, 4); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(4, 1, 92, 2);
  });
  // the gauge for the hose, if a room asks for one
  paint(s, 'cue:glowdot', 64, 64, (c) => radial(c, 32, 32, 32, 'rgba(255,190,90,A)', 0.9));
}
