import Phaser from 'phaser';
import { LAMPS, WINDOWS } from './art.ts';
import type { Flags } from './state.ts';
import { C, FLOOR } from './view.ts';

export interface Stage {
  fx: Record<string, () => void>;
  update: (f: Flags) => void;
}

const ADD = Phaser.BlendModes.ADD;

/** Places the fire station's painted layers, props, lights and ambient motion. */
export function stageStation(s: Phaser.Scene): Stage {
  s.add.image(0, 0, 'sky').setOrigin(0).setScrollFactor(0.35).setDepth(0);
  s.add.image(0, 0, 'wall').setOrigin(0).setDepth(1);

  for (const x of WINDOWS) {
    s.add.image(x + 40, 120, 'cone').setOrigin(0.5, 0).setRotation(-0.3).setScale(0.55, 1.05)
      .setTint(0x9ab8c4).setAlpha(0.16).setBlendMode(ADD).setDepth(2);
  }
  const cones = LAMPS.map((x) => s.add.image(x, 126, 'cone').setOrigin(0.5, 0).setTint(C.amberN).setAlpha(0.5).setBlendMode(ADD).setDepth(2));
  // one tired lamp over the kerosene tanks stutters now and then
  const tired = cones[2];
  const stutter = () => {
    s.tweens.chain({ targets: tired, tweens: [
      { alpha: 0.08, duration: 60 }, { alpha: 0.5, duration: 80 }, { alpha: 0.12, duration: 50 }, { alpha: 0.5, duration: 120 },
    ] });
    s.time.delayedCall(2500 + Math.random() * 4000, stutter);
  };
  s.time.delayedCall(3000, stutter);

  s.add.image(300, 52, 'pole').setOrigin(0.5, 0).setDepth(3);
  s.add.image(600, FLOOR, 'rack').setOrigin(0.5, 1).setDepth(3);
  s.add.image(860, 370, 'plaque').setDepth(3);
  s.add.sprite(1056, FLOOR + 4, 'fireman', 0).setOrigin(0.5, 1).setDepth(3);
  s.add.sprite(1166, FLOOR + 4, 'fireman', 0).setOrigin(0.5, 1).setDepth(3).setFlipX(true);
  s.add.image(1110, FLOOR, 'table').setOrigin(0.5, 1).setDepth(4);
  const beatty = s.add.sprite(1290, FLOOR + 4, 'beatty', 0).setOrigin(0.5, 1).setDepth(4).setFlipX(true);
  s.tweens.add({ targets: beatty, scaleY: 1.012, yoyo: true, repeat: -1, duration: 1800, ease: 'Sine.easeInOut' });
  s.add.image(1520, FLOOR, 'pump').setOrigin(0.5, 1).setDepth(3);
  s.add.image(1770, FLOOR, 'kennel').setOrigin(0.5, 1).setDepth(3);
  const hound = s.add.image(1770, FLOOR - 6, 'hound').setOrigin(0.5, 1).setDepth(3);
  const eye = s.add.image(1724, 418, 'glow').setScale(0.12).setTint(C.coldN).setAlpha(0.8).setBlendMode(ADD).setDepth(3);
  s.tweens.add({ targets: eye, alpha: 0.35, yoyo: true, repeat: -1, duration: 1300, ease: 'Sine.easeInOut' });
  s.add.image(2010, FLOOR, 'dispatch').setOrigin(0.5, 1).setDepth(3);
  const bulb = s.add.image(2065, 266, 'glow').setScale(0.55).setTint(C.redN).setAlpha(0).setBlendMode(ADD).setDepth(3);
  s.add.image(2290, FLOOR + 8, 'truck').setOrigin(0.5, 1).setDepth(3);

  s.add.particles(0, 0, 'dot', {
    x: { min: 0, max: 2400 }, y: { min: 130, max: 460 },
    speedX: { min: -5, max: 5 }, speedY: { min: -3, max: 3 },
    lifespan: 8000, frequency: 220, scale: { min: 0.4, max: 0.9 },
    alpha: { start: 0.35, end: 0 }, tint: C.amberN, blendMode: ADD,
  }).setDepth(6);

  let alarm: Phaser.Tweens.Tween | undefined;
  return {
    fx: {
      houndGrowl: () => {
        eye.setTint(C.redN);
        s.tweens.add({ targets: hound, x: '+=1.5', yoyo: true, repeat: 7, duration: 40 });
        s.tweens.add({ targets: eye, scale: 0.22, yoyo: true, duration: 400, onComplete: () => eye.setTint(C.coldN) });
      },
      alarm: () => s.tweens.add({ targets: bulb, alpha: 0.9, yoyo: true, repeat: 5, duration: 160 }),
    },
    // the dispatch bulb pulses while it is the next thing to do
    update: (f) => {
      const want = !!f['c01.rack'] && !!f['c01.pump'] && !f['c01.ack'];
      if (want && !alarm) alarm = s.tweens.add({ targets: bulb, alpha: { from: 0.1, to: 0.7 }, yoyo: true, repeat: -1, duration: 700 });
      if (!want && alarm) { alarm.remove(); alarm = undefined; bulb.setAlpha(0); }
    },
  };
}
