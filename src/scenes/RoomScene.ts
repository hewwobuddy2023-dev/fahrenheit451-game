import Phaser from 'phaser';
import { freeTextures } from '../art/core.ts';
import { FIG_H } from '../art/figures.ts';
import { KITS, resetKitOnce, type KitParts } from '../art/kits.ts';
import { CHALLENGES, CHAPTERS, ROOMS, RULES, SCRIPTS } from '../content.ts';
import type { Hotspot, Light, Npc, RoomDef, Script, Step } from '../content/types.ts';
import { completedIds, type Flags, type Session } from '../state.ts';
import { Dialogue } from '../ui/Dialogue.ts';
import { Hud } from '../ui/Hud.ts';
import { openJournal } from '../ui/Journal.ts';
import { MenuList } from '../ui/MenuList.ts';
import { buildFloor, darkness, lightTint, scrollFloor, shadowFor } from '../world/stage.ts';
import { addAtmosphere, C, FONT, H, W, WALK_Y, lowerK, onActions, params, setupCamera, text, type Act } from '../view.ts';

type Mode = 'play' | 'dialogue' | 'cutscene' | 'journal' | 'pause' | 'exit';

const SPEED = 175;
const REACH = 70;
const sleep = (s: Phaser.Scene, ms: number) => new Promise<void>((r) => s.time.delayedCall(ms, r));

interface NpcView { def: Npc; spr: Phaser.GameObjects.Sprite; sh: Phaser.GameObjects.Image; y: number }

export class RoomScene extends Phaser.Scene {
  private session!: Session;
  private room!: RoomDef;
  private kit!: KitParts;
  private roomLights: Light[] = [];
  private floor!: ReturnType<typeof buildFloor>;
  private player!: Phaser.GameObjects.Sprite;
  private shadow!: Phaser.GameObjects.Image;
  private npcs: NpcView[] = [];
  private keys!: { left: Phaser.Input.Keyboard.Key[]; right: Phaser.Input.Keyboard.Key[]; act: Phaser.Input.Keyboard.Key[]; down: Phaser.Input.Keyboard.Key[] };
  private dialogue!: Dialogue;
  private hud!: Hud;
  private prompt!: Phaser.GameObjects.Container;
  private promptText!: Phaser.GameObjects.Text;
  private promptBg!: Phaser.GameObjects.Graphics;
  private meter!: Phaser.GameObjects.Graphics;
  private glows = new Map<string, Phaser.GameObjects.Image>();
  private beams = new Map<string, Phaser.GameObjects.Image>();
  private eyes = new Map<string, Phaser.GameObjects.Container>();
  private spray?: Phaser.GameObjects.Particles.ParticleEmitter;
  private dark?: ReturnType<typeof darkness>;
  private mode: Mode = 'play';
  private before: Mode = 'play';
  private vx = 0;
  private facing = 1;
  private near?: Hotspot;
  private holdMs = 0;
  private camTarget: number | null = null;
  private done = new Set<number>();
  private touch = false;
  private overlay?: { destroy: () => void; list?: MenuList };
  private caughtAt = 0;
  private timerStart = 0;
  private fps: number[] = [];
  private governed = false;
  private stillWatch?: { until: number; x: number; ms: number };
  private promptWait?: { until: number; hit: boolean };

  constructor() { super('room'); }

  init(d: { session: Session }) {
    this.session = d.session;
    this.mode = 'play';
    this.vx = 0; this.facing = 1; this.near = undefined; this.holdMs = 0;
    this.camTarget = null; this.overlay = undefined; this.caughtAt = 0;
    this.npcs = []; this.glows = new Map(); this.beams = new Map(); this.eyes = new Map();
    this.fps = []; this.governed = false; this.stillWatch = undefined; this.promptWait = undefined;
  }

  create() {
    const cam = setupCamera(this);
    this.room = ROOMS[this.session.room] ?? ROOMS.burn;
    const family = this.room.kit.split(':')[0];
    for (const other of ['station', 'home', 'attic', 'faber', 'subway', 'street', 'forest']) if (other !== family) freeTextures(this, `k:${other}:`);
    resetKitOnce();
    this.touch = this.sys.game.device.input.touch;
    this.kit = KITS[this.room.kit](this, this.room);
    this.floor = buildFloor(this, this.kit.floor);
    this.roomLights = [...this.kit.lights, ...(this.room.lights ?? [])];
    if (this.room.dark) this.dark = darkness(this); else this.dark = undefined;

    const x = Phaser.Math.Clamp(this.session.x, 40, this.room.width - 40);
    const fig = this.room.chapter >= 5 ? 'fig:montagCivil' : 'fig:montag';
    this.shadow = shadowFor(this, x, WALK_Y);
    this.player = this.add.sprite(x, WALK_Y + 6, fig, 0).setOrigin(0.5, 1).setDepth(5);
    this.player.play(fig + ':idle');
    for (const n of this.room.npcs ?? []) {
      const y = n.back ? 452 : WALK_Y;
      const spr = this.add.sprite(n.x, y + 6, 'fig:' + n.fig, 0).setOrigin(0.5, 1).setDepth(n.back ? 4.5 : 5 - 0.01).setFlipX(n.face === -1);
      if (n.back) spr.setScale(0.9);
      spr.play({ key: 'fig:' + n.fig + ':idle', startFrame: Math.floor(Math.random() * 4) });
      this.npcs.push({ def: n, spr, sh: shadowFor(this, n.x, y, n.back ? 0.9 : 1), y });
    }

    const kb = this.input.keyboard!;
    this.keys = {
      left: [kb.addKey('LEFT'), kb.addKey('A')], right: [kb.addKey('RIGHT'), kb.addKey('D')],
      act: [kb.addKey('E'), kb.addKey('ENTER'), kb.addKey('SPACE')], down: [kb.addKey('DOWN'), kb.addKey('S')],
    };
    const release = () => kb.resetKeys();
    this.game.events.on('blur', release);
    this.events.once('shutdown', () => this.game.events.off('blur', release));

    for (const h of this.room.hotspots) {
      if (h.required) this.glows.set(h.id, this.add.image(h.x, WALK_Y - 4, 'glow').setScale(1.4, 0.28).setTint(C.amberN).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD).setDepth(4.1));
    }
    for (const hz of this.room.hazards ?? []) {
      const img = hz.look === 'searchlight'
        ? this.add.image(hz.from, -10, 'cone').setOrigin(0.5, 0).setScale(hz.width / 200, 1.5).setTint(0xdfefff).setAlpha(0.55)
        : this.add.image(hz.from, WALK_Y - 60, 'beam').setScale(hz.width / 160, 1.4).setTint(hz.look === 'doorlight' ? 0xffd8a0 : 0xfff2d0).setAlpha(0.75);
      this.beams.set(hz.id, img.setBlendMode(Phaser.BlendModes.ADD).setDepth(5.5));
    }
    for (const n of this.npcs) if (n.def.watch) {
      const g = this.add.graphics().fillStyle(C.creamN, 1).fillEllipse(0, 0, 18, 10).fillStyle(C.panel, 1).fillCircle(0, 0, 3.5);
      const t = text(this, 14, 0, 'WATCHING', { fontFamily: FONT.display, fontSize: '11px', color: C.cream }).setOrigin(0, 0.5).setLetterSpacing(2);
      this.eyes.set(n.def.id, this.add.container(n.def.x - 30, n.y - FIG_H - 8, [g, t]).setDepth(8).setVisible(false));
    }
    this.promptBg = this.add.graphics();
    this.promptText = text(this, 0, 0, '', { fontFamily: FONT.display, fontSize: '14px' }).setOrigin(0, 0.5).setLetterSpacing(2);
    this.prompt = this.add.container(0, 0, [this.promptBg, this.promptText]).setDepth(8).setVisible(false);
    this.meter = this.add.graphics().setDepth(8);

    this.dialogue = new Dialogue(this, this.touch);
    this.dialogue.onSpeaker = (who) => this.frameSpeaker(who);
    this.hud = new Hud(this, `CHAPTER ${this.room.chapter}  ·  ${CHAPTERS[this.room.chapter - 1].toUpperCase()}`, {
      touch: this.touch, demo: this.session.demo,
      onJournal: () => this.onAction('journal'), onPause: () => this.onAction('pause'), onAct: () => this.onAction('act'),
    });
    addAtmosphere(this);
    onActions(this, (a) => this.onAction(a));

    this.done = new Set(completedIds(RULES, this.session.flags));
    this.refresh(false);
    cam.scrollX = Phaser.Math.Clamp(x - W / 2, 0, this.room.width - W);
    cam.fadeIn(600, 0, 0, 0);
    this.timerStart = this.time.now;
    if (params.has('debug')) Object.assign(window, { __qa: this.qa() });
    void this.runEnter();
  }

  // ---------- frame loop ----------

  update(time: number, dtMs: number) {
    const dt = Math.min(dtMs, 50) / 1000;
    const f = this.session.flags;
    const p = this.player;
    let dir = 0;
    const playing = this.mode === 'play';
    if (playing || this.stillWatch) {
      if (this.keys.left.some((k) => k.isDown) || this.hud.touchLeft) dir -= 1;
      if (this.keys.right.some((k) => k.isDown) || this.hud.touchRight) dir += 1;
    }
    if (this.stillWatch) {
      if (dir) { this.stillWatch.until = time + this.stillWatch.ms; this.flashNote('YOU MOVED. STAY STILL.'); }
      dir = 0;
    }
    const speed = SPEED * (this.room.limp ? 0.72 : 1);
    this.vx += (dir * speed - this.vx) * Math.min(1, dt * (dir ? 9 : 12));
    if (Math.abs(this.vx) < 3) this.vx = 0;
    p.x = Phaser.Math.Clamp(p.x + this.vx * dt, 40, this.room.width - 40);
    if (dir) this.facing = dir;
    this.animate(p, this.vx, this.facing, this.room.chapter >= 5 ? 'fig:montagCivil' : 'fig:montag');
    const diving = playing && (this.keys.down.some((k) => k.isDown)) && (this.room.hazards ?? []).some((h) => h.dive);
    p.setAlpha(diving ? 0.35 : 1).setY(WALK_Y + 6 + (diving ? 14 : 0));
    this.shadow.setX(p.x);
    p.setTint(lightTint(p.x, this.roomLights));
    this.dark?.follow(p.x - this.cameras.main.scrollX, p.y);

    // npcs: follow, face, tint
    for (const n of this.npcs) {
      if (n.def.follow?.(f) && n.spr.visible) {
        const target = p.x + this.facing * 70;
        const nvx = Phaser.Math.Clamp((target - n.spr.x) * 4, -speed, speed);
        n.spr.x += nvx * dt;
        this.animate(n.spr, nvx, nvx ? Math.sign(nvx) : (p.x > n.spr.x ? 1 : -1), 'fig:' + n.def.fig);
      }
      n.sh.setX(n.spr.x).setVisible(n.spr.visible);
      n.spr.setTint(lightTint(n.spr.x, this.roomLights));
    }

    // camera: framing target or follow with look-ahead
    const cam = this.cameras.main;
    const goal = this.camTarget ?? p.x + this.facing * 70;
    const tx = Phaser.Math.Clamp(goal - W / 2, 0, this.room.width - W);
    cam.scrollX += (tx - cam.scrollX) * (1 - Math.exp(-dt * 3));
    scrollFloor(this.floor, cam.scrollX, time);
    this.kit.tick?.(dtMs, cam.scrollX);
    this.children.list.forEach((o) => {
      const fct = o.getData?.('occluder') as number | undefined;
      if (!fct) return;
      const img = o as Phaser.GameObjects.Image;
      const sx = img.x - cam.scrollX * fct, px = p.x - cam.scrollX;
      img.setAlpha(Math.abs(sx - px) < 40 ? 0.35 : 1);
    });

    this.updateWatchers(time);
    this.updateHazards(time, diving);
    this.updateTimer(time);
    if (playing && !this.stillWatch) { this.updateNear(); this.updateHold(dtMs); } else { this.meter.clear(); this.spray?.stop(); }
    if (this.promptWait && this.keys.act.some((k) => Phaser.Input.Keyboard.JustDown(k))) this.promptWait.hit = true;
    if (playing && !this.governed) this.govern(time);
  }

  private animate(s: Phaser.GameObjects.Sprite, vx: number, face: number, key: string) {
    s.setFlipX(face < 0);
    if (Math.abs(vx) > 15) {
      if (s.anims.currentAnim?.key !== key + ':walk') s.play(key + ':walk');
      s.anims.timeScale = Math.max(0.5, Math.abs(vx) / SPEED);
    } else if (s.anims.currentAnim?.key !== key + ':idle') {
      s.play(key + ':idle');
      s.anims.timeScale = 1;
    }
  }

  private isExit() { return this.mode === 'exit'; }
  private active(h: Hotspot) { return !h.when || h.when(this.session.flags); }
  private locked(h: Hotspot) { return !!h.requires && !h.requires.every((k) => this.session.flags[k]); }

  private updateNear() {
    let best: Hotspot | undefined;
    for (const h of this.room.hotspots) {
      if (!this.active(h)) continue;
      if (h.hold && this.session.flags[h.hold.flag]) continue;
      const d = Math.abs(h.x - this.player.x);
      if (h.auto) { if (d < 26 && !this.locked(h)) { this.near = h; this.interact(); return; } continue; }
      if (d < REACH && (!best || d < Math.abs(best.x - this.player.x))) best = h;
    }
    if (best === this.near) return;
    this.near = best;
    this.holdMs = 0;
    if (!best) return void this.prompt.setVisible(false);
    const key = this.touch ? 'ACT' : 'E';
    const holdable = best.hold && !this.locked(best);
    this.promptText.setText((holdable ? 'HOLD  ' : '') + best.label.toUpperCase());
    const kw = key.length * 9 + 14, w = this.promptText.width + kw + 26;
    this.promptBg.clear()
      .fillStyle(C.panel, 0.88).fillRoundedRect(-w / 2, -15, w, 30, 4)
      .lineStyle(1, C.creamN, 0.25).strokeRoundedRect(-w / 2 + 0.5, -14.5, w - 1, 29, 4)
      .fillStyle(C.creamN, 0.95).fillRoundedRect(-w / 2 + 7, -10, kw, 20, 3);
    this.promptText.setX(-w / 2 + kw + 17);
    this.prompt.list.filter((o) => o.name === 'key').forEach((o) => o.destroy());
    const kt = text(this, -w / 2 + 7 + kw / 2, 0, key, { fontFamily: FONT.display, fontSize: '13px', fontStyle: '700', color: C.ink }).setOrigin(0.5);
    kt.name = 'key';
    this.prompt.add(kt);
    this.prompt.setPosition(best.x, best.py ?? 300).setVisible(true).setAlpha(0);
    this.tweens.add({ targets: this.prompt, alpha: 1, duration: 120 });
  }

  /** T3: hold ACT near a hold-hotspot to fill its meter. */
  private updateHold(dtMs: number) {
    const h = this.near;
    this.meter.clear();
    if (!h?.hold || this.locked(h) || this.session.flags[h.hold.flag]) { this.spray?.stop(); return; }
    const held = this.keys.act.some((k) => k.isDown) || this.hud.touchAct;
    if (held) this.holdMs += dtMs;
    const k = Math.min(1, this.holdMs / h.hold.ms);
    const bx = h.x - 50, by = (h.py ?? 300) + 24;
    this.meter.fillStyle(C.panel, 0.85).fillRect(bx - 2, by - 2, 104, 12).fillStyle(C.amberN, 1).fillRect(bx, by, 100 * k, 8);
    if (held && h.hold.fx) {
      this.facing = Math.sign(h.x - this.player.x) || this.facing;
      this.spray ??= this.add.particles(0, 0, 'dot', { lifespan: 520, frequency: 18, scale: { start: 1.2, end: 0.4 }, alpha: { start: 0.9, end: 0 }, gravityY: 300, blendMode: Phaser.BlendModes.ADD, emitting: false }).setDepth(6);
      const fire = h.hold.fx === 'flame';
      this.spray.setPosition(this.player.x + this.facing * 26, WALK_Y - 100);
      this.spray.setParticleTint(fire ? 0xff7a30 : 0xe8e0a0);
      const tx = (h.hold.target ?? h.x) - this.player.x;
      this.spray.speedX = { min: tx * 1.5, max: tx * 1.9 } as never;
      this.spray.speedY = { min: -160, max: -110 } as never;
      if (h.hold.fx !== 'pull') this.spray.start();
    } else this.spray?.stop();
    if (k >= 1) {
      this.spray?.stop();
      this.session.set({ [h.hold.flag]: true });
      this.holdMs = 0;
      this.near = undefined;
      this.refresh(true);
    }
  }

  /** T2: watchers look at Montag on a fixed, readable rhythm (eye icon + "WATCHING"). */
  private updateWatchers(time: number) {
    for (const n of this.npcs) {
      const w = n.def.watch;
      if (!w) continue;
      const on = this.isWatching(n.def, time) && n.spr.visible;
      this.eyes.get(n.def.id)?.setVisible(on).setX(n.spr.x - 30);
      n.spr.setFlipX(on ? this.player.x < n.spr.x : this.player.x > n.spr.x);
    }
  }

  private isWatching(n: Npc, time = this.time.now) {
    const w = n.watch!;
    return ((time + (w.phase ?? 0) * w.period) % w.period) < w.on;
  }

  /** T4: telegraphed sweeps. Inside a beam = caught (unless diving where allowed). */
  private updateHazards(time: number, diving: boolean) {
    for (const hz of this.room.hazards ?? []) {
      const img = this.beams.get(hz.id)!;
      const on = !hz.when || hz.when(this.session.flags);
      img.setVisible(on);
      if (!on) continue;
      const t = ((time / hz.period) + (hz.phase ?? 0)) % 1;
      const bx = hz.from + (hz.to - hz.from) * (t < 0.5 ? t * 2 : 2 - t * 2);
      img.setX(bx);
      if (this.mode === 'play' && time - this.caughtAt > 1200 && Math.abs(this.player.x - bx) < hz.width / 2 && !(hz.dive && diving)) {
        this.caught(hz.reset, hz.look === 'headlights' ? 'THE HEADLIGHTS FIND YOU.' : 'THE LIGHT FINDS YOU.');
      }
    }
  }

  private updateTimer(time: number) {
    const tm = this.room.timer;
    if (!tm || (tm.when && !tm.when(this.session.flags)) || this.mode !== 'play') {
      if (tm && this.mode === 'play') this.hud.setTimer(null);
      if (this.mode !== 'play') this.timerStart += this.game.loop.delta; // pause the count during dialogue
      return;
    }
    const el = time - this.timerStart;
    const n = Math.min(10, 1 + Math.floor((el / tm.ms) * 10));
    this.hud.setTimer(`${tm.label}  ${n} / 10`);
    if (el >= tm.ms) this.caught(tm.reset, 'THE DOORS OPEN. THEY SEE YOU.');
  }

  private caught(x: number, msg: string) {
    this.caughtAt = this.time.now;
    this.timerStart = this.time.now;
    this.cameras.main.flash(300, 240, 240, 255);
    this.player.x = x;
    this.vx = 0;
    this.flashNote(msg + '  TRY AGAIN.');
  }

  private flashNote(s: string) {
    const t = text(this, W / 2, 150, s, { fontFamily: FONT.display, fontSize: '18px', color: C.amber, backgroundColor: 'rgba(13,10,9,0.85)', padding: { x: 14, y: 8 } })
      .setOrigin(0.5).setLetterSpacing(3).setScrollFactor(0).setDepth(1150);
    this.tweens.add({ targets: t, alpha: 0, delay: 1300, duration: 500, onComplete: () => t.destroy() });
  }

  /** Performance governor: if the frame rate stays low, render at a lower resolution (cosmetic only). */
  private govern(time: number) {
    if (time - this.timerStart < 4000) return;
    this.fps.push(this.game.loop.actualFps);
    if (this.fps.length < 180) return;
    const avg = this.fps.reduce((a, b) => a + b, 0) / this.fps.length;
    this.governed = true;
    if (avg < 45 && lowerK(this.game)) this.hud.note('LOWER RESOLUTION FOR SMOOTHER PLAY');
  }

  // ---------- input ----------

  private onAction(a: Act) {
    switch (this.mode) {
      case 'dialogue':
        if (a === 'act') this.dialogue.advance();
        else if (a === 'up') this.dialogue.move(-1);
        else if (a === 'down') this.dialogue.move(1);
        else if (a === 'pause' && this.before !== 'cutscene') this.openPause();
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
      default:
    }
  }

  private async interact() {
    const h = this.near;
    if (!h || this.mode !== 'play' || this.stillWatch) return;
    if (h.hold && !this.locked(h)) return; // filled by holding, not pressing
    const f = this.session.flags;
    const locked = this.locked(h);
    let key = locked ? h.lockedScript : h.doneFlag && f[h.doneFlag] && h.doneScript ? h.doneScript : h.script;
    if (!locked && h.watcher) {
      const w = this.npcs.find((n) => n.def.id === h.watcher);
      if (w && this.isWatching(w.def)) key = h.watchedScript;
    }
    this.prompt.setVisible(false);
    this.near = undefined;
    const blocked = key !== h.script && key !== h.doneScript;
    const firstTime = !(h.doneFlag && f[h.doneFlag]);
    this.mode = 'cutscene';
    if (key) await this.say(key);
    if (!locked && !blocked && firstTime && h.steps) await this.runSteps(h.steps);
    if (this.isExit()) return;
    if (!locked && !blocked && h.exit) return this.transition(h.exit.room, h.exit.x);
    this.endCutscene();
  }

  private endCutscene() {
    this.mode = 'play';
    this.camTarget = null;
    this.hud.showTouch(true);
  }

  /** Play one script; resolves when it closes. Flags apply at the end only. */
  private say(key: string): Promise<void> {
    const script: Script | undefined = SCRIPTS[key];
    if (!script) { console.warn('missing script', key); return Promise.resolve(); }
    this.before = this.mode;
    this.mode = 'dialogue';
    this.hud.showTouch(false);
    return new Promise((res) => this.dialogue.play(script, this.session.flags, (k) => SCRIPTS[k], (acc) => {
      this.session.set(acc);
      this.mode = this.before === 'play' ? 'cutscene' : this.before;
      this.refresh(true);
      res();
    }));
  }

  /** Point the camera between Montag and whoever is speaking; turn them toward each other. */
  private frameSpeaker(who: string) {
    const n = this.npcs.find((v) => v.def.name === who && v.spr.visible);
    if (!n) return;
    this.camTarget = (n.spr.x + this.player.x) / 2;
    n.spr.setFlipX(this.player.x < n.spr.x);
    this.facing = n.spr.x > this.player.x ? 1 : -1;
  }

  // ---------- cutscenes ----------

  private async runEnter() {
    for (const e of this.room.enter ?? []) {
      if (this.session.flags[e.key] || (e.when && !e.when(this.session.flags))) continue;
      this.mode = 'cutscene';
      this.hud.showTouch(false);
      await this.runSteps(e.steps);
      if (this.isExit()) return;
      this.session.set({ [e.key]: true });
      this.endCutscene();
      this.refresh(false);
    }
    this.checkpoint();
  }

  private async runSteps(steps: Step[]): Promise<void> {
    for (const s of steps) {
      if (this.isExit()) return;
      this.mode = 'cutscene';
      await this.step(s);
    }
  }

  private tween(cfg: Phaser.Types.Tweens.TweenBuilderConfig) {
    return new Promise<void>((res) => this.tweens.add({ ...cfg, onComplete: () => res() }));
  }

  private async step(s: Step): Promise<void> {
    const cam = this.cameras.main;
    if ('say' in s) return this.say(s.say);
    if ('walk' in s) {
      const d = s.walk - this.player.x;
      this.facing = Math.sign(d) || this.facing;
      this.vx = 0;
      const key = this.room.chapter >= 5 ? 'fig:montagCivil' : 'fig:montag';
      this.player.play(key + ':walk').setFlipX(d < 0);
      await this.tween({ targets: this.player, x: s.walk, duration: s.ms ?? Math.abs(d) / SPEED * 1000 });
      this.player.play(key + ':idle');
      return;
    }
    if ('npc' in s) {
      const n = this.npcs.find((v) => v.def.id === s.npc);
      if (!n) return;
      if (s.show !== undefined) n.spr.setVisible(s.show);
      if (s.face) n.spr.setFlipX(s.face === -1);
      if (s.x !== undefined) {
        const key = 'fig:' + n.def.fig;
        n.spr.play(key + ':walk').setFlipX(s.x < n.spr.x);
        await this.tween({ targets: n.spr, x: s.x, duration: s.ms ?? 900 });
        n.spr.play(key + ':idle');
      }
      return;
    }
    if ('cam' in s) { this.camTarget = s.cam; return sleep(this, s.ms ?? 900); }
    if ('follow' in s) { this.camTarget = null; return; }
    if ('wait' in s) return sleep(this, s.wait);
    if ('fade' in s) {
      const c = s.color ?? 0;
      if (s.fade === 'out') cam.fadeOut(s.ms ?? 700, (c >> 16) & 255, (c >> 8) & 255, c & 255);
      else cam.fadeIn(s.ms ?? 700, (c >> 16) & 255, (c >> 8) & 255, c & 255);
      return sleep(this, s.ms ?? 700);
    }
    if ('flash' in s) { cam.flash(s.ms ?? 300, (s.flash >> 16) & 255, (s.flash >> 8) & 255, s.flash & 255); return sleep(this, s.ms ?? 300); }
    if ('fx' in s) return this.fx(s.fx);
    if ('set' in s) { this.session.set(s.set); this.refresh(true); return; }
    if ('title' in s) return this.title(s.title, s.sub);
    if ('still' in s) {
      this.mode = 'play';
      this.hud.showTouch(true);
      this.hud.setTimer(s.label);
      this.stillWatch = { until: this.time.now + s.still, x: this.player.x, ms: s.still };
      while (this.time.now < this.stillWatch.until) await sleep(this, 100);
      this.stillWatch = undefined;
      this.hud.setTimer(null);
      this.mode = 'cutscene';
      return;
    }
    if ('prompt' in s) {
      for (;;) {
        const t = text(this, W / 2, 210, s.prompt, { fontFamily: FONT.display, fontSize: '30px', color: C.amber, backgroundColor: 'rgba(13,10,9,0.85)', padding: { x: 18, y: 10 } })
          .setOrigin(0.5).setLetterSpacing(6).setScrollFactor(0).setDepth(1150);
        this.hud.showTouch(true);
        this.promptWait = { until: this.time.now + s.ms, hit: false };
        while (this.time.now < this.promptWait.until && !this.promptWait.hit && !this.hud.touchAct) await sleep(this, 30);
        const hit = this.promptWait.hit || this.hud.touchAct;
        this.promptWait = undefined;
        t.destroy();
        this.hud.showTouch(false);
        if (hit) return;
        await this.say(s.miss);
      }
    }
    if ('goto' in s) return this.transition(s.goto, s.x);
    if ('ending' in s) {
      this.mode = 'exit';
      this.checkpoint();
      cam.fadeOut(900, 0, 0, 0);
      await sleep(this, 950);
      this.scene.start('end', { session: this.session });
      return;
    }
    if ('if' in s) return this.runSteps(s.if(this.session.flags) ? s.then : (s.else ?? []));
  }

  private async fx(name: string) {
    const cam = this.cameras.main;
    const k = this.kit.fx[name];
    if (k) return k();
    switch (name) {
      case 'poleSlide': {
        this.player.setPosition(316, 120).setAlpha(0);
        this.tweens.add({ targets: this.player, alpha: 1, duration: 200 });
        await this.tween({ targets: this.player, y: WALK_Y + 6, duration: 900, ease: 'Quad.easeIn' });
        this.tweens.add({ targets: this.player, scaleY: 0.95, yoyo: true, duration: 110 });
        return;
      }
      case 'jets': cam.shake(500, 0.004); cam.flash(200, 40, 40, 60); return sleep(this, 600);
      case 'fall': {
        await this.tween({ targets: this.player, angle: -80 * this.facing, y: WALK_Y + 20, duration: 220 });
        await sleep(this, 900);
        await this.tween({ targets: this.player, angle: 0, y: WALK_Y + 6, duration: 400 });
        return;
      }
      case 'shake': cam.shake(400, 0.006); return;
      case 'dark': this.dark?.set(true); return;
      case 'light': this.dark?.set(false); return;
      default: console.warn('unknown fx', name);
    }
  }

  private async title(t: string, sub?: string) {
    const a = text(this, W / 2, sub ? 220 : 240, t, { fontFamily: sub ? FONT.display : FONT.type, fontSize: sub ? '14px' : '40px', color: sub ? C.amber : C.cream })
      .setOrigin(0.5).setLetterSpacing(sub ? 8 : 4);
    const b = sub ? text(this, W / 2, 256, sub, { fontFamily: FONT.type, fontSize: '32px' }).setOrigin(0.5) : undefined;
    const card = this.add.container(0, 0, b ? [a, b] : [a]).setScrollFactor(0, 0, true).setDepth(1100).setAlpha(0);
    await this.tween({ targets: card, alpha: 1, duration: 700 });
    await sleep(this, 1600);
    this.tweens.add({ targets: card, alpha: 0, duration: 700, onComplete: () => card.destroy() });
  }

  private transition(room: string, x?: number) {
    if (!ROOMS[room]) { console.warn('missing room', room); return; }
    this.mode = 'exit';
    this.hud.showTouch(false);
    this.session.checkpoint(room, x ?? ROOMS[room].spawnX);
    this.cameras.main.fadeOut(700, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.restart({ session: this.session }));
  }

  private checkpoint() {
    if (this.isExit()) return;
    const ok = this.session.checkpoint(this.room.id, this.player.x);
    if (!this.session.demo) this.hud.note(ok ? 'CHECKPOINT SAVED' : 'SAVE UNAVAILABLE IN THIS BROWSER');
  }

  /** Re-derive objective, journal count, npc and glow visibility; announce completions; checkpoint. */
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
    this.kit.update?.(f);
    if (this.room.dark) this.dark?.set(this.room.dark(f), 0);
    for (const n of this.npcs) if (n.def.when) n.spr.setVisible(n.def.when(f));
    for (const h of this.room.hotspots) {
      const g = this.glows.get(h.id);
      if (!g) continue;
      const finished = (h.doneFlag && f[h.doneFlag]) || (h.hold && f[h.hold.flag]);
      const want = this.active(h) && !finished && !this.locked(h);
      if (want && !g.getData('on')) { g.setData('on', true); g.setData('tw', this.tweens.add({ targets: g, alpha: { from: 0.15, to: 0.5 }, yoyo: true, repeat: -1, duration: 900 })); }
      if (!want && g.getData('on')) { g.setData('on', false); (g.getData('tw') as Phaser.Tweens.Tween).remove(); g.setAlpha(0); }
    }
    if (announce && this.mode !== 'exit') this.checkpoint();
  }

  // ---------- overlays ----------

  private openPause() {
    this.before = this.mode;
    this.mode = 'pause';
    this.hud.showTouch(false);
    const g = this.add.graphics().fillStyle(0x000000, 0.72).fillRect(0, 0, W, H)
      .fillStyle(C.panel, 0.95).fillRect(W / 2 - 200, 130, 400, 280)
      .lineStyle(1, C.emberN, 0.5).strokeRect(W / 2 - 199.5, 130.5, 399, 279);
    const block = this.add.zone(0, 0, W, H).setOrigin(0).setInteractive();
    const title = text(this, W / 2, 168, 'PAUSED', { fontFamily: FONT.display, fontSize: '30px', fontStyle: '600' }).setOrigin(0.5).setLetterSpacing(8);
    const help = text(this, W / 2, 460, 'MOVE  A / D OR ARROWS     INTERACT  E / ENTER / SPACE (HOLD WHERE ASKED)     JOURNAL  J     PAUSE  ESC', {
      fontFamily: FONT.display, fontSize: '11px', color: C.creamDim,
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
    const wasPlay = this.before === 'play';
    this.mode = 'exit';
    // mid-conversation progress is never saved: the checkpoint keeps only completed conversations
    if (wasPlay) this.session.checkpoint(this.room.id, this.player.x);
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('menu'));
  }

  // ---------- QA hook (?debug only): drives the same game logic a player would ----------

  private qa() {
    return {
      scene: this,
      get room() { return (this.scene as RoomScene).room.id; },
      flags: () => ({ ...this.session.flags }),
      mode: () => this.mode,
      go: (x: number) => { this.player.x = x; },
      act: () => this.onAction('act'),
      adv: () => this.dialogue.advance(),
      choose: (i: number) => this.dialogue.choose(i),
      line: () => this.dialogue.current,
      options: () => this.dialogue.options,
      done: () => [...this.done],
      objective: () => this.room.objective(this.session.flags),
      fill: () => { const h = this.near; if (h?.hold) { this.holdMs = h.hold.ms; } },
      hit: () => { if (this.promptWait) this.promptWait.hit = true; },
    };
  }
}

export type { Flags };
