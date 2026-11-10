import Phaser from 'phaser';
import { CHAPTERS, CHAPTER_STARTS } from '../content.ts';
import { loadSave, Session } from '../state.ts';
import { MenuList, type Item } from '../ui/MenuList.ts';
import { addAtmosphere, C, FONT, H, W, onActions, setupCamera, text } from '../view.ts';


const CREDITS = [
  "An interactive adaptation of Ray Bradbury's Fahrenheit 451 (1953). Dialogue is original or paraphrased, not text from the novel; alternate endings are adaptations.",
  'Engine: Phaser 3 (MIT). Fonts: Oswald, IBM Plex Sans (SIL OFL 1.1), Special Elite (Apache 2.0).',
  'All artwork is drawn procedurally in code for this project. Student project, 2026.',
];

export class MenuScene extends Phaser.Scene {
  private list?: MenuList;
  private sub?: Phaser.GameObjects.Container;
  private busy = false;

  constructor() { super('menu'); }

  create() {
    setupCamera(this);
    this.busy = false;
    const sky = this.add.image(0, 0, 'sky').setOrigin(0);
    this.tweens.add({ targets: sky, x: -(sky.width - W), duration: 120000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    const fire = this.add.image(W * 0.62, H + 60, 'glow').setScale(9, 3).setTint(C.emberN).setAlpha(0.45).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: fire, alpha: 0.3, scaleX: 8.4, yoyo: true, repeat: -1, duration: 900, ease: 'Sine.easeInOut' });
    this.add.particles(0, 0, 'dot', {
      x: { min: 0, max: W }, y: H + 10, speedY: { min: -45, max: -18 }, speedX: { min: -12, max: 12 },
      lifespan: 11000, frequency: 160, scale: { min: 0.4, max: 1.1 }, alpha: { start: 0.65, end: 0 },
      tint: [C.emberN, C.amberN, 0x8a7f72],
    });
    this.add.graphics().fillStyle(0x000000, 0.45).fillRect(0, 0, W * 0.55, H); // calm area behind the title

    const t1 = text(this, 78, 150, 'FAHRENHEIT', { fontFamily: FONT.display, fontSize: '74px', fontStyle: '700' }).setOrigin(0, 0.5).setLetterSpacing(8);
    text(this, 78 + t1.width + 18, 150, '451', { fontFamily: FONT.display, fontSize: '74px', fontStyle: '700', color: C.ember }).setOrigin(0, 0.5);
    text(this, 82, 214, "THE FIREMAN'S CHOICE", { fontFamily: FONT.type, fontSize: '22px', color: C.creamDim }).setOrigin(0, 0.5).setLetterSpacing(4);
    this.add.rectangle(82, 248, 120, 2, C.emberN).setOrigin(0, 0.5);
    text(this, 82, H - 34, "An interactive adaptation of Ray Bradbury's novel  ·  Student project", {
      fontSize: '12px', color: C.muted,
    }).setOrigin(0, 0.5);
    text(this, W - 28, H - 34, 'ARROWS / W S  ·  ENTER', { fontFamily: FONT.display, fontSize: '11px', color: C.muted })
      .setOrigin(1, 0.5).setLetterSpacing(2);
    addAtmosphere(this);
    onActions(this, (a) => {
      if (this.busy) return;
      if (a === 'up') this.list?.move(-1);
      else if (a === 'down') this.list?.move(1);
      else if (a === 'act') this.list?.choose();
      else if ((a === 'pause' || a === 'back') && this.sub) this.main();
    });
    this.cameras.main.fadeIn(600, 0, 0, 0);
    this.main();
  }

  private show(items: Item[], y = 300, gap = 46, size = 24) {
    this.list?.destroy();
    this.list = new MenuList(this, 104, y, items, gap, size);
  }

  private main() {
    this.sub?.destroy();
    this.sub = undefined;
    const save = loadSave();
    this.show([
      { label: 'Continue', enabled: !!save, note: save ? undefined : 'no saved game', action: () => save && this.start(new Session(save)) },
      { label: 'New Game', action: () => this.start(this.fresh(false)) },
      { label: 'Presentation Mode', action: () => this.chapters() },
      { label: 'Credits', action: () => this.credits() },
    ]);
  }

  private fresh(demo: boolean, chapter = 0) {
    const st = CHAPTER_STARTS[chapter];
    return new Session({ v: 1, room: st.room, x: st.x, flags: { ...st.flags } }, demo);
  }

  private panel(title: string, lines: string[]) {
    this.sub?.destroy();
    // sits below the title block so the logo is never covered
    const x = W * 0.52, y = 270, w = W - x - 36, h = H - y - 64;
    const g = this.add.graphics().fillStyle(C.panel, 0.94).fillRect(x, y, w, h)
      .lineStyle(1, C.emberN, 0.5).strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    const t = text(this, x + 24, y + 18, title, { fontFamily: FONT.display, fontSize: '16px', color: C.amber }).setLetterSpacing(4);
    const body = text(this, x + 24, y + 48, lines.join('\n\n'), { fontSize: '12px', color: C.creamDim, lineSpacing: 4, wordWrap: { width: w - 48 } });
    this.sub = this.add.container(0, 0, [g, t, body]).setDepth(1050);
  }

  private chapters() {
    this.panel('PRESENTATION MODE', [
      'A quick demonstration route for the class share. Choices work normally, but nothing is saved and it never counts as a real playthrough.',
      'Each chapter starts with the earlier choices set to defaults.',
    ]);
    this.show([
      ...CHAPTERS.map((name, i) => ({
        label: `${i + 1}  ${name}`, enabled: i < CHAPTER_STARTS.length, action: () => this.start(this.fresh(true, i)),
      })),
      { label: 'Back', action: () => this.main() },
    ], 286, 34, 17);
  }

  private credits() {
    this.panel('CREDITS', CREDITS);
    this.show([{ label: 'Back', action: () => this.main() }], 300);
  }

  private start(session: Session) {
    if (this.busy) return;
    this.busy = true;
    if (!session.demo && !Object.keys(session.flags).length) session.checkpoint(session.room, session.x); // New Game replaces the old save
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('room', { session }));
  }
}
