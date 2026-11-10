import Phaser from 'phaser';
import { CHALLENGES, ROOMS, RULES, SCRIPTS, type Hotspot, type RoomDef, type Script } from '../content.ts';
import { completedIds, type Session } from '../state.ts';
import { stageStation, type Stage } from '../stage.ts';
import { Dialogue } from '../ui/Dialogue.ts';
import { Hud } from '../ui/Hud.ts';
import { openJournal } from '../ui/Journal.ts';
import { MenuList } from '../ui/MenuList.ts';
import { addAtmosphere, C, FLOOR, FONT, H, W, onActions, setupCamera, text, type Act } from '../view.ts';

type Mode = 'intro' | 'play' | 'dialogue' | 'journal' | 'pause' | 'exit';

const SPEED = 175;       // px/s: deliberate, not sluggish
const REACH = 78;        // how close Montag must be to interact
const MARK_Y = 196;      // one row for all hotspot markers keeps them aligned

export class RoomScene extends Phaser.Scene {
  private session!: Session;
  private room!: RoomDef;
  private stage!: Stage;
  private player!: Phaser.GameObjects.Sprite;
  private refl!: Phaser.GameObjects.Sprite;
  private keys!: { left: Phaser.Input.Keyboard.Key[]; right: Phaser.Input.Keyboard.Key[] };
  private dialogue!: Dialogue;
  private hud!: Hud;
  private prompt!: Phaser.GameObjects.Container;
  private promptText!: Phaser.GameObjects.Text;
  private promptBg!: Phaser.GameObjects.Graphics;
  private markers!: Map<string, Phaser.GameObjects.Graphics>;
  private mode: Mode = 'play';
  private before: Mode = 'play';
  private vx = 0;
  private facing = 1;
  private near?: Hotspot;
  private done!: Set<number>;
  private touch = false;
  private overlay?: { destroy: () => void; list?: MenuList };

  constructor() { super('room'); }

  init(d: { session: Session }) {
    // Phaser reuses scene instances, so every field is reset here.
    this.session = d.session;
    this.mode = 'play';
    this.vx = 0;
    this.facing = 1;
    this.near = undefined;
    this.overlay = undefined;
    this.markers = new Map();
  }

  create() {
    const cam = setupCamera(this);
    this.room = ROOMS[this.session.room] ?? ROOMS.station;
    this.touch = this.sys.game.device.input.touch;
    this.stage = stageStation(this);

    if (!this.anims.exists('walk')) {
      this.anims.create({ key: 'walk', frames: [1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({ key: 'montag', frame: i })), frameRate: 11, repeat: -1 });
    }
    const x = Phaser.Math.Clamp(this.session.x, 40, this.room.width - 40);
    this.refl = this.add.sprite(x, FLOOR - 4, 'montag', 0).setOrigin(0.5, 0).setFlipY(true).setAlpha(0.13).setTint(0xf2c890).setDepth(4);
    this.player = this.add.sprite(x, FLOOR + 4, 'montag', 0).setOrigin(0.5, 1).setDepth(5);

    const kb = this.input.keyboard!;
    this.keys = { left: [kb.addKey('LEFT'), kb.addKey('A')], right: [kb.addKey('RIGHT'), kb.addKey('D')] };
    const release = () => kb.resetKeys(); // no phantom walking after alt-tab
    this.game.events.on('blur', release);
    this.events.once('shutdown', () => this.game.events.off('blur', release));

    for (const h of this.room.hotspots) this.markers.set(h.id, this.add.graphics().setDepth(7));
    this.promptBg = this.add.graphics();
    this.promptText = text(this, 0, 0, '', { fontFamily: FONT.display, fontSize: '14px', color: C.cream }).setOrigin(0, 0.5).setLetterSpacing(2);
    this.prompt = this.add.container(0, MARK_Y - 30, [this.promptBg, this.promptText]).setDepth(8).setVisible(false);

    this.dialogue = new Dialogue(this, this.touch);
    this.hud = new Hud(this, this.room.chapter, {
      touch: this.touch, demo: this.session.demo,
      onJournal: () => this.onAction('journal'), onPause: () => this.onAction('pause'), onAct: () => this.onAction('act'),
    });
    addAtmosphere(this);
    onActions(this, (a) => this.onAction(a));

    this.done = new Set(completedIds(RULES, this.session.flags));
    this.refresh(false);
    cam.scrollX = Phaser.Math.Clamp(x - W / 2, 0, this.room.width - W);
    cam.fadeIn(700, 0, 0, 0);
    if (!this.session.flags['seen.' + this.room.id]) this.intro();
  }

  /** New game: Montag slides down the brass pole, then the chapter card plays. */
  private intro() {
    this.mode = 'intro';
    this.hud.showTouch(false);
    this.player.setPosition(this.room.spawnX + 14, 230).setAlpha(0);
    this.refl.setVisible(false);
    this.tweens.add({ targets: this.player, alpha: 1, duration: 250 });
    this.tweens.add({
      targets: this.player, y: FLOOR + 4, duration: 950, ease: 'Quad.easeIn',
      onComplete: () => {
        this.refl.setVisible(true);
        this.tweens.add({ targets: this.player, scaleY: 0.95, yoyo: true, duration: 110 });
        this.mode = 'play';
        this.hud.showTouch(true);
        this.session.set({ ['seen.' + this.room.id]: true });
        this.session.checkpoint(this.room.id, this.player.x);
      },
    });
    const t1 = text(this, W / 2, H / 2 - 30, 'CHAPTER ONE', { fontFamily: FONT.display, fontSize: '14px', color: C.amber })
      .setOrigin(0.5).setLetterSpacing(8);
    const t2 = text(this, W / 2, H / 2 + 6, 'The Hearth and the Salamander', { fontFamily: FONT.type, fontSize: '34px' }).setOrigin(0.5);
    const card = this.add.container(0, 0, [t1, t2]).setScrollFactor(0, 0, true).setDepth(1100).setAlpha(0);
    this.tweens.chain({ targets: card, tweens: [
      { alpha: 1, duration: 700, delay: 300 }, { alpha: 1, duration: 1800 }, { alpha: 0, duration: 700, onComplete: () => card.destroy() },
    ] });
  }

  update(_t: number, dtMs: number) {
    const dt = Math.min(dtMs, 50) / 1000; // clamp so a stalled frame can't teleport Montag
    let dir = 0;
    if (this.mode === 'play') {
      if (this.keys.left.some((k) => k.isDown) || this.hud.touchLeft) dir -= 1;
      if (this.keys.right.some((k) => k.isDown) || this.hud.touchRight) dir += 1;
    }
    this.vx += (dir * SPEED - this.vx) * Math.min(1, dt * (dir ? 9 : 12));
    if (Math.abs(this.vx) < 3) this.vx = 0;
    const p = this.player;
    p.x = Phaser.Math.Clamp(p.x + this.vx * dt, 40, this.room.width - 40);
    if (dir) this.facing = dir;
    p.setFlipX(this.facing < 0);
    if (Math.abs(this.vx) > 15) {
      p.play('walk', true);
      p.anims.timeScale = Math.abs(this.vx) / SPEED;
    } else if (p.anims.isPlaying) {
      p.stop();
      p.setFrame(0);
    }
    this.refl.setFrame(p.frame.name).setFlipX(p.flipX).setX(p.x);

    const cam = this.cameras.main;
    const tx = Phaser.Math.Clamp(p.x - W / 2 + this.facing * 70, 0, this.room.width - W);
    cam.scrollX += (tx - cam.scrollX) * (1 - Math.exp(-dt * 3.2));

    if (this.mode === 'play') this.updateNear();
  }

  private updateNear() {
    let best: Hotspot | undefined;
    for (const h of this.room.hotspots) {
      const d = Math.abs(h.x - this.player.x);
      if (d < REACH && (!best || d < Math.abs(best.x - this.player.x))) best = h;
    }
    if (best === this.near) return;
    this.near = best;
    if (!best) return void this.prompt.setVisible(false);
    const key = this.touch ? 'ACT' : 'E';
    this.promptText.setText(best.label.toUpperCase());
    const kw = key.length * 9 + 14, w = this.promptText.width + kw + 26;
    this.promptBg.clear()
      .fillStyle(C.panel, 0.85).fillRoundedRect(-w / 2, -15, w, 30, 4)
      .lineStyle(1, C.creamN, 0.25).strokeRoundedRect(-w / 2 + 0.5, -14.5, w - 1, 29, 4)
      .fillStyle(C.creamN, 0.95).fillRoundedRect(-w / 2 + 7, -10, kw, 20, 3);
    this.promptText.setX(-w / 2 + kw + 17);
    this.prompt.list.filter((o) => o.name === 'key').forEach((o) => o.destroy());
    const keyText = text(this, -w / 2 + 7 + kw / 2, 0, key, { fontFamily: FONT.display, fontSize: '13px', fontStyle: '700', color: C.ink }).setOrigin(0.5);
    keyText.name = 'key';
    this.prompt.add(keyText);
    this.prompt.setX(best.x).setVisible(true).setAlpha(0);
    this.tweens.add({ targets: this.prompt, alpha: 1, duration: 120 });
  }

  private onAction(a: Act) {
    switch (this.mode) {
      case 'dialogue':
        if (a === 'act') this.dialogue.advance();
        else if (a === 'up') this.dialogue.move(-1);
        else if (a === 'down') this.dialogue.move(1);
        else if (a === 'pause') this.openPause();
        return;
      case 'pause':
        if (a === 'up') this.overlay?.list?.move(-1);
        else if (a === 'down') this.overlay?.list?.move(1);
        else if (a === 'act') this.overlay?.list?.choose();
        else if (a === 'pause' || a === 'back') this.resume();
        return;
      case 'journal':
        if (a !== 'up' && a !== 'down') this.overlay?.destroy();
        return;
      case 'play':
        if (a === 'act') this.interact();
        else if (a === 'journal') this.showJournal('play');
        else if (a === 'pause') this.openPause();
        return;
      default: // intro / exit: input waits
    }
  }

  private interact() {
    const h = this.near;
    if (!h) return;
    const f = this.session.flags;
    const locked = !!h.requires && !h.requires.every((k) => f[k]);
    const key = locked ? h.lockedScript! : h.doneFlag && f[h.doneFlag] && h.doneScript ? h.doneScript : h.script;
    this.run(SCRIPTS[key], () => { if (h.exit && !locked) this.exitTo(h.exit, h.x); });
  }

  private run(script: Script, after?: () => void) {
    this.mode = 'dialogue';
    this.prompt.setVisible(false);
    this.near = undefined;
    this.hud.showTouch(false);
    if (script.fx) this.stage.fx[script.fx]?.();
    this.dialogue.play(script, (chosen) => {
      // flags apply only when the conversation finishes, so quitting mid-dialogue never half-completes a challenge
      if (script.set) this.session.set(script.set);
      if (chosen) this.session.set(chosen.set);
      this.mode = 'play';
      this.hud.showTouch(true);
      this.refresh(true);
      after?.();
    });
  }

  /** Re-derive objective, journal count and markers from flags; announce new completions and checkpoint. */
  private refresh(announce: boolean) {
    const f = this.session.flags;
    const now = completedIds(RULES, f);
    for (const id of now) {
      if (this.done.has(id) || !announce) continue;
      const ch = CHALLENGES.find((c) => c.id === id)!;
      this.hud.toast(`CHALLENGE ${String(id).padStart(2, '0')} COMPLETE`, `${ch.title}  ·  journal updated`);
    }
    this.done = new Set(now);
    this.hud.setObjective(this.room.objective(f), now.length);
    this.stage.update(f);
    for (const h of this.room.hotspots) {
      const g = this.markers.get(h.id)!.clear();
      const finished = h.doneFlag ? !!f[h.doneFlag] : false;
      const locked = !!h.requires && !h.requires.every((k) => f[k]);
      const pts = (r: number) => [[0, -r], [r, 0], [0, r], [-r, 0]].map(([dx, dy]) => new Phaser.Math.Vector2(h.x + dx, MARK_Y + dy));
      const pulse = g.getData('pulse') as Phaser.Tweens.Tween | undefined;
      if (h.required && !finished && !locked) {
        g.fillStyle(C.emberN, 1).fillPoints(pts(7), true);
        if (!pulse) g.setData('pulse', this.tweens.add({ targets: g, alpha: 0.45, yoyo: true, repeat: -1, duration: 700 }));
      } else {
        pulse?.remove();
        g.setData('pulse', undefined).setAlpha(1);
        const dim = finished || locked;
        g.lineStyle(1.5, dim ? 0x6f6457 : C.creamN, dim ? 0.8 : 0.6).strokePoints(pts(5), true);
      }
    }
    if (announce && !this.session.demo) {
      this.hud.note(this.session.checkpoint(this.room.id, this.player.x) ? 'CHECKPOINT SAVED' : 'SAVE UNAVAILABLE IN THIS BROWSER');
    }
  }

  private openPause() {
    this.before = this.mode;
    this.mode = 'pause';
    this.hud.showTouch(false);
    const g = this.add.graphics().fillStyle(0x000000, 0.72).fillRect(0, 0, W, H)
      .fillStyle(C.panel, 0.95).fillRect(W / 2 - 200, 130, 400, 280)
      .lineStyle(1, C.emberN, 0.5).strokeRect(W / 2 - 199.5, 130.5, 399, 279);
    const block = this.add.zone(0, 0, W, H).setOrigin(0).setInteractive();
    const title = text(this, W / 2, 168, 'PAUSED', { fontFamily: FONT.display, fontSize: '30px', fontStyle: '600' }).setOrigin(0.5).setLetterSpacing(8);
    const help = text(this, W / 2, 460, 'MOVE  A / D OR ARROWS     INTERACT  E / ENTER / SPACE     JOURNAL  J     PAUSE  ESC', {
      fontFamily: FONT.display, fontSize: '12px', color: C.creamDim,
    }).setOrigin(0.5).setLetterSpacing(1);
    const root = this.add.container(0, 0, [g, block, title, help]).setScrollFactor(0, 0, true).setDepth(1290);
    const list = new MenuList(this, W / 2 - 110, 234, [
      { label: 'Resume', action: () => this.resume() },
      { label: 'Journal', action: () => { this.overlay?.destroy(); this.showJournal(this.before); } },
      { label: this.session.demo ? 'Quit to title' : 'Save & quit to title', action: () => this.quit() },
    ], 52, 22);
    list.root.setDepth(1295);
    this.overlay = { list, destroy: () => { root.destroy(); list.destroy(); this.overlay = undefined; } };
  }

  private resume() {
    this.overlay?.destroy();
    this.mode = this.before;
    this.hud.showTouch(this.mode === 'play');
  }

  private showJournal(back: Mode) {
    this.mode = 'journal';
    this.hud.showTouch(false);
    const close = openJournal(this, this.session.flags, () => {
      this.overlay = undefined;
      this.mode = back;
      this.hud.showTouch(back === 'play');
    });
    this.overlay = { destroy: close };
  }

  private quit() {
    this.overlay?.destroy();
    this.mode = 'exit';
    this.session.checkpoint(this.room.id, this.player.x);
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('menu'));
  }

  private exitTo(target: string, x: number) {
    this.mode = 'exit';
    this.hud.showTouch(false);
    this.session.checkpoint(this.room.id, x);
    this.stage.fx.alarm?.();
    this.cameras.main.fadeOut(1100, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(target, { session: this.session }));
  }
}
