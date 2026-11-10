import Phaser from 'phaser';
import { RULES } from '../content.ts';
import { completedIds, type Session } from '../state.ts';
import { addAtmosphere, C, FONT, H, W, onActions, setupCamera, text } from '../view.ts';

/** Placeholder end of the M1 slice. Milestone 2 replaces this with Clarisse (challenge 02). */
export class EndScene extends Phaser.Scene {
  private session!: Session;
  constructor() { super('end'); }

  init(d: { session: Session }) { this.session = d.session; }

  create() {
    setupCamera(this);
    const lines = [
      "The Salamander's siren climbs over the sleeping city.",
      'Somewhere ahead, a house full of books is waiting.',
      '',
      'On the walk home tonight, a girl named Clarisse',
      'will ask Montag a question he cannot answer.',
    ];
    const body = text(this, W / 2, H / 2 - 40, lines.join('\n'), {
      fontFamily: FONT.type, fontSize: '22px', align: 'center', lineSpacing: 10,
    }).setOrigin(0.5).setAlpha(0);
    const done = completedIds(RULES, this.session.flags).length;
    const foot = text(this, W / 2, H - 120, `END OF CHAPTER 1 PREVIEW  ·  JOURNAL ${done}/15`, {
      fontFamily: FONT.display, fontSize: '13px', color: C.amber,
    }).setOrigin(0.5).setLetterSpacing(4).setAlpha(0);
    const back = text(this, W / 2, H - 84, 'PRESS E OR TAP TO RETURN TO THE TITLE', {
      fontFamily: FONT.display, fontSize: '11px', color: C.muted,
    }).setOrigin(0.5).setLetterSpacing(3).setAlpha(0);
    this.tweens.add({ targets: body, alpha: 1, duration: 1400 });
    this.tweens.add({ targets: [foot, back], alpha: 1, duration: 800, delay: 1800 });
    addAtmosphere(this);
    let leaving = false;
    const leave = () => {
      if (leaving || back.alpha < 1) return; // ignore presses before the text has appeared
      leaving = true;
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('menu'));
    };
    onActions(this, (a) => { if (a === 'act') leave(); });
    this.input.on('pointerdown', leave);
    this.cameras.main.fadeIn(800, 0, 0, 0);
  }
}
