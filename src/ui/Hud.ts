import Phaser from 'phaser';
import { C, FONT, W, H, text } from '../view.ts';
import { controls, isTouch, onInputMode } from '../input.ts';

/** Objective panel, journal chip, toasts and (on touch devices) on-screen buttons. */
export class Hud {
  touchLeft = false;
  touchRight = false;
  touchAct = false;
  touchDown = false;
  touchRun = false;
  private held = new Map<number, 'left' | 'right' | 'act' | 'down' | 'run'>();
  private diveUi?: Phaser.GameObjects.Container;
  private timer?: Phaser.GameObjects.Text;
  private scene: Phaser.Scene;
  private wantTouch = true;
  private lastObjective = '';
  private lastDone = 0;
  private panel: Phaser.GameObjects.Graphics;
  private chapter: Phaser.GameObjects.Text;
  private objective: Phaser.GameObjects.Text;
  private journal: Phaser.GameObjects.Text;
  private touchUi?: Phaser.GameObjects.Container;
  private toastRoot?: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, chapter: string, opts: { demo: boolean; onJournal: () => void; onPause: () => void; onAct: () => void }) {
    this.scene = scene;
    this.panel = scene.add.graphics().setScrollFactor(0).setDepth(1000);
    this.chapter = text(scene, 34, 24, chapter, { fontFamily: FONT.display, fontSize: '11px', color: C.creamDim })
      .setLetterSpacing(2).setScrollFactor(0).setDepth(1001);
    this.objective = text(scene, 34, 42, '', { fontSize: '18px', fontStyle: '600' }).setScrollFactor(0).setDepth(1001);

    this.journal = text(scene, W - 24, 34, '', { fontFamily: FONT.display, fontSize: '14px', color: C.cream })
      .setOrigin(1, 0.5).setLetterSpacing(2).setScrollFactor(0).setDepth(1001)
      .setPadding(14, 18, 14, 18).setBackgroundColor('rgba(13,10,9,0.8)')
      .setInteractive({ useHandCursor: true }).on('pointerdown', opts.onJournal);

    if (opts.demo) {
      text(scene, W - 24, 58, 'PRESENTATION MODE  ·  NOT SAVED', { fontFamily: FONT.display, fontSize: '11px', color: C.ember })
        .setOrigin(1, 0).setLetterSpacing(2).setScrollFactor(0).setDepth(1001);
    }

    {
      const btn = (x: number, y: number, r: number, label: string) => {
        const c = scene.add.circle(x, y, r, 0x0d0a09, 0.55).setStrokeStyle(1.5, C.creamN, 0.45);
        // arrows are drawn shapes: the display font has no arrow glyphs
        const dir = label === '<' ? -1 : label === '>' ? 1 : 0;
        const t = dir
          ? (dir > 0 ? scene.add.triangle(x + 2, y, 0, 0, 0, 22, 16, 11, C.creamN, 0.9) : scene.add.triangle(x - 2, y, 16, 0, 16, 22, 0, 11, C.creamN, 0.9))
          : text(scene, x, y, label, { fontFamily: FONT.display, fontSize: '15px' }).setOrigin(0.5).setLetterSpacing(1);
        // Phaser's Container.setScrollFactor(..., true) skips inherited default
        // properties. Set this on each hit target explicitly or it drifts by cam.scrollX.
        c.setScrollFactor(0).setInteractive();
        return [c, t] as const;
      };
      const [l, lt] = btn(66, H - 62, 47, '<');
      const [r, rt] = btn(174, H - 62, 47, '>');
      const [a, at] = btn(W - 72, H - 66, 47, 'ACT');
      const [p, pt] = btn(W - 46, 112, 32, 'II');
      const [d, dt] = btn(W - 184, H - 66, 47, 'DIVE');
      const [u, ut] = btn(272, H - 62, 38, 'RUN');
      const release = (p: Phaser.Input.Pointer) => { this.held.delete(p.id); this.syncTouch(); };
      for (const [obj, action] of [[l, 'left'], [r, 'right'], [a, 'act'], [d, 'down'], [u, 'run']] as const) {
        obj.on('pointerdown', (p: Phaser.Input.Pointer) => {
          this.held.set(p.id, action); this.syncTouch();
          if (action === 'act') opts.onAct();
        });
        obj.on('pointerout', release);
      }
      scene.input.on('pointerup', release);
      scene.input.on('pointerupoutside', release);
      const cancel = () => this.resetTouch();
      scene.game.canvas.addEventListener('touchcancel', cancel);
      scene.events.once('shutdown', () => {
        scene.input.off('pointerup', release);
        scene.input.off('pointerupoutside', release);
        scene.game.canvas.removeEventListener('touchcancel', cancel);
      });
      p.on('pointerdown', opts.onPause);
      this.diveUi = scene.add.container(0, 0, [d, dt]).setVisible(false);
      this.touchUi = scene.add.container(0, 0, [l, lt, r, rt, u, ut, a, at, p, pt, this.diveUi]).setScrollFactor(0, 0, true).setDepth(1001);
    }
    this.syncVisibility();
    const off = onInputMode(() => { this.syncVisibility(); this.setObjective(this.lastObjective, this.lastDone); });
    scene.events.once('shutdown', off);
  }

  /** Touch buttons show only in touch mode, and never while dialogue or menus own the screen. */
  private syncVisibility() {
    const on = this.wantTouch && isTouch();
    this.touchUi?.setVisible(on);
    if (!on) this.resetTouch();
  }

  setObjective(s: string, done: number) {
    this.lastObjective = s; this.lastDone = done;
    this.objective.setText(controls(s));
    this.objective.setWordWrapWidth(W - 340);
    const w = Math.max(this.objective.width, this.chapter.width) + 40;
    this.panel.clear()
      .fillStyle(C.panel, 0.78).fillRect(18, 14, w, Math.max(56, this.objective.height + 40))
      .fillStyle(C.emberN, 1).fillRect(18, 14, 3, Math.max(56, this.objective.height + 40));
    this.journal.setText(`JOURNAL  ${done}/15  [J]`);
  }

  /** Hide touch buttons while dialogue or menus own the screen, so they never overlap text. */
  showTouch(on: boolean) {
    this.wantTouch = on;
    this.syncVisibility();
  }

  showDive(on: boolean) { this.diveUi?.setVisible(on); }

  resetTouch() { this.held.clear(); this.syncTouch(); }

  private syncTouch() {
    const actions = new Set(this.held.values());
    this.touchLeft = actions.has('left'); this.touchRight = actions.has('right');
    this.touchAct = actions.has('act'); this.touchDown = actions.has('down'); this.touchRun = actions.has('run');
  }

  toast(title: string, sub: string) {
    this.toastRoot?.destroy();
    const s = this.scene;
    const t1 = text(s, W / 2, 104, title, { fontFamily: FONT.display, fontSize: '22px', color: C.amber }).setOrigin(0.5).setLetterSpacing(4);
    const t2 = text(s, W / 2, 134, sub, { fontSize: '14px', color: C.creamDim }).setOrigin(0.5);
    const w = Math.max(t1.width, t2.width) + 80;
    const bg = s.add.graphics().fillStyle(C.panel, 0.88).fillRect(W / 2 - w / 2, 84, w, 70)
      .lineStyle(1, C.emberN, 0.6).lineBetween(W / 2 - w / 2, 84.5, W / 2 + w / 2, 84.5).lineBetween(W / 2 - w / 2, 153.5, W / 2 + w / 2, 153.5);
    const root = s.add.container(0, 0, [bg, t1, t2]).setScrollFactor(0, 0, true).setDepth(1150).setAlpha(0);
    this.toastRoot = root;
    s.tweens.chain({ targets: root, tweens: [
      { alpha: 1, duration: 300 }, { alpha: 1, duration: 2600 }, { alpha: 0, duration: 500, onComplete: () => root.destroy() },
    ] });
  }

  /** Countdown or meter readout under the objective panel (text, so never colour-only). */
  setTimer(s: string | null) {
    if (s === null) { this.timer?.setVisible(false); return; }
    this.timer ??= text(this.scene, 18, 82, '', { fontFamily: FONT.display, fontSize: '18px', color: C.amber, backgroundColor: 'rgba(13,10,9,0.78)', padding: { x: 16, y: 6 } })
      .setLetterSpacing(3).setScrollFactor(0).setDepth(1001);
    // sit just under the objective panel, whose height grows when the objective wraps
    this.timer.setVisible(true).setText(s).setY(14 + Math.max(56, this.objective.height + 40) + 8);
  }

  note(s: string) {
    const t = text(this.scene, W - 24, 64, s, { fontFamily: FONT.display, fontSize: '11px', color: C.muted })
      .setOrigin(1, 0.5).setLetterSpacing(2).setScrollFactor(0).setDepth(1001);
    this.scene.tweens.add({ targets: t, alpha: 0, delay: 1400, duration: 600, onComplete: () => t.destroy() });
  }
}
