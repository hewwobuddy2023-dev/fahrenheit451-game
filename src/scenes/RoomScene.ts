import Phaser from 'phaser';
import { setDressing } from '../art/set.ts';
import { cinematicSet, paintCinema } from '../art/cinema.ts';
import { diveStep, type Breath } from '../gameplay/breath.ts';
import { BAND, hoseStep, inBand, type HoseState } from '../gameplay/pressure.ts';
import { crossMs, inLane, laneState, WARN_MS } from '../gameplay/lanes.ts';
import { controls, inputMode, isTouch } from '../input.ts';
import { sound } from '../audio.ts';
import { settings, setSetting } from '../settings.ts';
import { freeTextures } from '../art/core.ts';
import { FIG_H, POSE_NAMES } from '../art/figures.ts';
import { KITS, resetKitOnce, type KitParts } from '../art/kits.ts';
import { CHALLENGES, CHAPTERS, ROOMS, RULES, SCRIPTS } from '../content.ts';
import type { Bark, Hotspot, Light, Line, Npc, RoomDef, Script, Step } from '../content/types.ts';
import { MUSE } from '../content/muse.ts';
import { laneReadout, placeLine, reachDistance } from '../guidance.ts';
import { completedIds, type Flags, type Session } from '../state.ts';
import { Dialogue } from '../ui/Dialogue.ts';
import { Hud } from '../ui/Hud.ts';
import { openJournal } from '../ui/Journal.ts';
import { MenuList } from '../ui/MenuList.ts';
import { buildFloor, darkness, lightTint, scrollFloor, shadowFor, stageDetails } from '../world/stage.ts';
import { addAtmosphere, BACK_Y, C, FONT, GROUND_Y, H, K, W, WALK_Y, onActions, params, setupCamera, text, type Act } from '../view.ts';
import { LIMP, LIMP_SPRINT, SPEED, SPRINT, crossedFoot, snapScroll, stepCamera, stepVelocity, walkTimeScale, type CamState } from '../movement.ts';

type Mode = 'play' | 'dialogue' | 'cutscene' | 'journal' | 'pause' | 'exit';

const REACH = 70;
/** First-use keycaps: each control is taught the first time it is needed, then never again (per browser). */
const tipsSeen = new Set<string>();
try { for (const k of JSON.parse(localStorage.getItem('f451.tips') ?? '[]')) tipsSeen.add(String(k)); } catch { /* storage may be blocked */ }
function markTip(k: string) {
  if (tipsSeen.has(k)) return;
  tipsSeen.add(k);
  try { localStorage.setItem('f451.tips', JSON.stringify([...tipsSeen])); } catch { /* seen for this visit only */ }
}
const TIPS: Record<string, [string, string]> = {
  move: ['A / D', 'move'],
  interact: ['E', 'interact'],
  hold: ['HOLD E', 'keep holding'],
  vault: ['SPACE', 'vault the fence'],
  journal: ['J', 'journal: your tasks'],
};
const sleep = (s: Phaser.Scene, ms: number) => new Promise<void>((r) => s.time.delayedCall(ms, r));

interface NpcView { def: Npc; spr: Phaser.GameObjects.Sprite; sh: Phaser.GameObjects.Image; rim: Phaser.GameObjects.Image; y: number }

export class RoomScene extends Phaser.Scene {
  private session!: Session;
  private room!: RoomDef;
  private kit!: KitParts;
  private set!: ReturnType<typeof setDressing>;
  private roomLights: Light[] = [];
  private floor!: ReturnType<typeof buildFloor>;
  private player!: Phaser.GameObjects.Sprite;
  private shadow!: Phaser.GameObjects.Image;
  private wake?: Phaser.GameObjects.Image;
  private npcs: NpcView[] = [];
  private keys!: { left: Phaser.Input.Keyboard.Key[]; right: Phaser.Input.Keyboard.Key[]; act: Phaser.Input.Keyboard.Key[]; down: Phaser.Input.Keyboard.Key[]; run: Phaser.Input.Keyboard.Key[] };
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
  private scriptedWalk = false;
  private scriptedPose = false;
  private facing = 1;
  private near?: Hotspot;
  private breath: Breath = { air: 1, exhausted: false };
  private breathText!: Phaser.GameObjects.Text;
  private holdMs = 0;
  private sputter = false;
  private hose: HoseState = { pressure: 0, progress: 0, overheated: false };
  private hazardReadout!: Phaser.GameObjects.Text;
  private laneStrips = new Map<string, Phaser.GameObjects.Rectangle>();
  private promptMode = inputMode();
  private hintBtn?: Phaser.GameObjects.Text;
  private bars?: Phaser.GameObjects.Rectangle[];
  private rim?: Phaser.GameObjects.Image;
  private linePosed?: Phaser.GameObjects.Sprite;
  private barkTexts: Phaser.GameObjects.Text[] = [];
  private barked = new Set<Bark>();
  private playMs = 0;
  private idleMs = 0;
  private lastObjective = '';
  private thinkLevel = 0;
  private lastThought = '';
  private tipKind = '';
  private tipBox?: Phaser.GameObjects.Container;
  private journalDue = false;                  // a stall has happened: J is now worth knowing
  /** The thing behind each hazard's light: an approaching car or a helicopter. */
  private rigs = new Map<string, Phaser.GameObjects.Image>();
  private caughtScene = false;
  private caughtHz = '';                          // the hazard whose light/car is held on screen during the caught scene
  private failScenes = 0;                          // full caught scenes played this visit (the first two; then just the quick fade)
  private pressureLabel!: Phaser.GameObjects.Text;
  private controlHint!: Phaser.GameObjects.Text;
  private camTarget: number | null = null;
  private cam: CamState = { cx: 0, look: 0 };
  private camWritten = NaN;   // last scroll we set; anything else moved the camera behind our back (scripted jumps)
  private footFrame = new WeakMap<Phaser.GameObjects.Sprite, number>();
  private done = new Set<number>();
  private get touch() { return isTouch(); }
  private overlay?: { destroy: () => void; list?: MenuList };
  private caughtAt = 0;
  private countShown = 0;
  private holdMoveUntil = 0;                    // active time before which a still-held key does not move Montag (the screen is fading back in)
  private timerStart = 0;
  // Scene Clock.now is wall time and jumps after suspension. Encounter deadlines
  // use accumulated active deltas, so a background tab cannot consume a retry.
  private activeTime = 0;
  private stillWatch?: { until: number; x: number; ms: number; moving?: boolean };
  private promptWait?: { until: number; hit: boolean };
  private tome?: Phaser.GameObjects.Image;        // the book that travels from the heap into Montag's hands
  private carrying = false;
  private pillowBook?: Phaser.GameObjects.Image;  // the book Beatty draws from under the pillow
  private catches = new Map<string, number>();    // how often each watcher caught Montag mid-hold (this visit only)

  constructor() { super('room'); }

  init(d: { session: Session }) {
    this.session = d.session;
    this.mode = 'play';
    this.thinkLevel = 0; this.lastThought = ''; this.lastObjective = ''; this.tipKind = ''; this.tipBox = undefined; this.journalDue = false; this.breath = { air: 1, exhausted: false };
    this.hose = { pressure: 0, progress: 0, overheated: false };
    this.scriptedWalk = false; this.scriptedPose = false;
    this.vx = 0; this.facing = 1; this.near = undefined; this.holdMs = 0;
    this.camTarget = null; this.overlay = undefined; this.caughtAt = 0; this.holdMoveUntil = 0;
    this.activeTime = 0;
    this.linePosed = undefined; this.barkTexts = [];
    this.npcs = []; this.glows = new Map(); this.laneStrips = new Map(); this.rigs = new Map(); this.barked = new Set(); this.bars = undefined; this.playMs = 0; this.idleMs = 0; this.caughtScene = false; this.caughtHz = ''; this.failScenes = 0; this.beams = new Map(); this.eyes = new Map();
    // Scene restarts destroy its objects, but retain class fields. Never reuse a
    // destroyed emitter when a later chapter starts its next hold interaction.
    this.spray = undefined;
    this.wake = undefined;
    this.stillWatch = undefined; this.promptWait = undefined;
    this.tome = undefined; this.carrying = false; this.pillowBook = undefined; this.catches = new Map();
  }

  create() {
    const cam = setupCamera(this);
    this.room = ROOMS[this.session.room] ?? ROOMS.burn;
    sound.useScene(this.room.id);
    sound.setQuiet(false);
    const family = this.room.kit.split(':')[0];
    for (const other of ['station', 'home', 'attic', 'faber', 'subway', 'street', 'forest']) if (other !== family) freeTextures(this, `k:${other}:`);
    resetKitOnce();
    paintCinema(this);
    this.kit = KITS[this.room.kit](this, this.room);
    const cine = cinematicSet(this, this.room);
    Object.assign(this.kit.fx, cine.fx);
    this.set = setDressing(this, this.room);
    this.floor = buildFloor(this, this.kit.floor);
    this.roomLights = [...this.kit.lights, ...(this.room.lights ?? [])];
    stageDetails(this, this.room, this.kit.floor, this.roomLights);
    if (this.room.dark) this.dark = darkness(this); else this.dark = undefined;

    const x = Phaser.Math.Clamp(this.session.x, 40, this.room.width - 40);
    const swimming = this.room.id === 'river' && !this.session.flags['c13.shore'];
    const fig = swimming ? 'fig:montagFloat' : this.room.chapter >= 5 ? 'fig:montagCivil' : 'fig:montag';
    this.shadow = shadowFor(this, x, WALK_Y);
    this.player = this.add.sprite(x, GROUND_Y, fig, 0).setOrigin(0.5, 1).setDepth(5);
    this.player.play(fig + ':idle');
    this.rim = this.rimFor(this.player);
    if (this.room.id === 'river') this.wake = this.add.image(x, WALK_Y + 3, 'wake').setDepth(5.1);
    for (const n of this.room.npcs ?? []) {
      const y = n.back ? BACK_Y : WALK_Y;
      const spr = this.add.sprite(n.x, y + (GROUND_Y - WALK_Y), 'fig:' + n.fig, 0).setOrigin(0.5, 1).setDepth(n.back ? 4.5 : 5 - 0.01).setFlipX(n.face === -1);
      const size = n.scale ?? (n.back ? 0.9 : 1);
      if (size !== 1) spr.setScale(size);
      spr.play({ key: 'fig:' + n.fig + ':idle', startFrame: Math.floor(Math.random() * 4) });
      this.npcs.push({ def: n, spr, sh: shadowFor(this, n.x, y, size), rim: this.rimFor(spr), y });
    }
    for (const pr of this.room.props ?? []) {
      const im = this.add.image(pr.x, pr.y, pr.tex).setOrigin(0.5, 1).setDepth(pr.depth ?? 4.4);
      if (pr.tint) im.setTint(pr.tint);
    }

    const kb = this.input.keyboard!;
    this.keys = {
      left: [kb.addKey('LEFT'), kb.addKey('A')], right: [kb.addKey('RIGHT'), kb.addKey('D')],
      act: [kb.addKey('E'), kb.addKey('ENTER'), kb.addKey('SPACE')], down: [kb.addKey('DOWN'), kb.addKey('S')], run: [kb.addKey('SHIFT')],
    };
    const release = () => { kb.resetKeys(); this.hud?.resetTouch(); this.vx = 0; sound.setSpray(0); sound.setMuffle(false); };
    this.game.events.on('blur', release);
    // the hose loop is driven from update(); silence it whenever update stops running
    this.events.on('pause', release);
    this.events.once('shutdown', () => { this.game.events.off('blur', release); sound.setSpray(0); });

    for (const h of this.room.hotspots) {
      if (h.required) this.glows.set(h.id, this.add.image(h.x, WALK_Y - 4, 'glow').setScale(1.4, 0.28).setTint(C.amberN).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD).setDepth(4.1));
    }
    for (const hz of this.room.hazards ?? []) {
      const img = hz.look === 'searchlight'
        ? this.add.image(hz.from, -10, 'cone').setOrigin(0.5, 0).setScale(hz.width / 200, 1.5).setTint(0xdfefff).setAlpha(0.55)
        : this.add.image(hz.from, WALK_Y - 60, 'beam').setScale(hz.width / 160, 1.4).setTint(hz.look === 'doorlight' ? 0xffd8a0 : 0xfff2d0).setAlpha(0.75);
      if (hz.pulse) {
        const marks = this.add.graphics().setDepth(4.15).lineStyle(1, 0x78968c, 0.45);
        marks.strokeRect(hz.from - 14, WALK_Y + 7, hz.to - hz.from + 28, 20);
        // live danger strip under the lane: dim = clear, amber = coming, white-hot = lit
        this.laneStrips.set(hz.id, this.add.rectangle(hz.from - 14, WALK_Y + 7, hz.to - hz.from + 28, 20, 0xffffff, 0).setOrigin(0).setDepth(4.16).setBlendMode(Phaser.BlendModes.ADD));
        // the safe island just before the lane
        this.add.rectangle(hz.from - 70, WALK_Y + 9, 44, 16, 0x78a68b, 0.18).setOrigin(0).setDepth(4.14);
        for (let x = hz.from - 8; x < hz.to + 12; x += 16) marks.lineBetween(x, WALK_Y + 8, x + 10, WALK_Y + 26);
      }
      if (hz.look === 'headlights') this.rigs.set(hz.id, this.add.image((hz.from + hz.to) / 2, WALK_Y, 'car').setOrigin(0.5, 1).setVisible(false));
      if (hz.look === 'searchlight') this.rigs.set(hz.id, this.add.image(hz.to + 40, 34, 'heli').setScale(0.8).setDepth(5.6));
      this.beams.set(hz.id, img.setBlendMode(Phaser.BlendModes.ADD).setDepth(5.5));
    }
    for (const n of this.npcs) if (n.def.watch) {
      const bg = this.add.graphics(), eye = this.add.graphics();
      const label = text(this, 0, 0, '', { fontFamily: FONT.display, fontSize: '15px', fontStyle: '600' }).setOrigin(0, 0.5).setLetterSpacing(3);
      const box = this.add.container(n.def.x, n.y - FIG_H - 34, [bg, eye, label]).setDepth(8).setVisible(false);
      box.setData('paint', (on: boolean) => {
        label.setText(on ? `${n.def.name} IS WATCHING` : 'LOOKING AWAY').setColor(on ? C.ember : C.creamDim);
        const w = label.width + 66, x0 = -w / 2;
        bg.clear().fillStyle(0x0d0a09, 0.92).fillRoundedRect(x0, -17, w, 34, 5).lineStyle(on ? 2 : 1, on ? C.emberN : C.creamN, on ? 0.95 : 0.3).strokeRoundedRect(x0, -17, w, 34, 5);
        eye.clear();
        if (on) eye.fillStyle(C.creamN, 1).fillEllipse(x0 + 28, 0, 34, 18).fillStyle(C.emberN, 1).fillCircle(x0 + 28, 0, 7).fillStyle(0x0d0a09, 1).fillCircle(x0 + 28, 0, 3.2);
        else eye.lineStyle(2, C.creamN, 0.6).beginPath().arc(x0 + 28, -3, 12, 0.35, Math.PI - 0.35).strokePath();
        label.setX(x0 + 52);
      });
      this.eyes.set(n.def.id, box);
    }
    this.promptBg = this.add.graphics();
    this.promptText = text(this, 0, 0, '', { fontFamily: FONT.display, fontSize: '14px' }).setOrigin(0, 0.5).setLetterSpacing(2);
    this.prompt = this.add.container(0, 0, [this.promptBg, this.promptText]).setDepth(8).setVisible(false);
    this.meter = this.add.graphics().setDepth(8);
    this.breathText = text(this, W / 2, 165, '', { fontFamily: FONT.display, fontSize: '16px', color: C.cream, backgroundColor: '#0a1620', padding: { x: 12, y: 6 } }).setOrigin(0.5).setScrollFactor(0).setDepth(1003);
    this.hazardReadout = text(this, W / 2, 126, '', { fontFamily: FONT.display, fontSize: '17px', color: C.cream, backgroundColor: '#101819', padding: { x: 12, y: 7 } }).setOrigin(0.5).setScrollFactor(0).setDepth(1003);
    this.pressureLabel = text(this, 0, 0, 'LOW     FLOW     HIGH', { fontFamily: FONT.display, fontSize: '11px', color: C.cream }).setDepth(8).setVisible(false);

    this.dialogue = new Dialogue(this);
    this.dialogue.onPause = () => this.onAction('pause');
    this.dialogue.onSpeaker = (who) => this.frameSpeaker(who);
    this.dialogue.onSteps = async (steps) => { await this.runSteps(steps); if (!this.isExit()) this.mode = 'dialogue'; };
    this.dialogue.subtitles = () => !!this.bars;
    this.hud = new Hud(this, `CHAPTER ${this.room.chapter}  ·  ${CHAPTERS[this.room.chapter - 1].toUpperCase()}`, {
      demo: this.session.demo,
      onJournal: () => this.onAction('journal'), onPause: () => this.onAction('pause'), onAct: () => this.onAction('act'),
    });
    this.controlHint = text(this, W / 2, 104, '', { fontFamily: FONT.display, fontSize: '15px', color: C.cream, backgroundColor: '#111315', padding: { x: 12, y: 8 }, wordWrap: { width: 620 } }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1003);
    this.hintBtn = (this.room.quietUi
      ? text(this, W - 22, this.touch ? 158 : 96, controls(this.touch ? 'HINT' : 'H  HINT'), { fontFamily: FONT.display, fontSize: '12px', color: C.creamDim, backgroundColor: 'rgba(13,10,9,0.7)', padding: { x: 10, y: 5 } }).setOrigin(1, 0).setLetterSpacing(2)
      : text(this, W - 50, 176, '?', { fontFamily: FONT.display, fontSize: '22px', backgroundColor: '#111315', padding: { x: 18, y: 10 } }).setOrigin(0.5)).setScrollFactor(0).setDepth(1001).setInteractive({ useHandCursor: true }).on('pointerdown', () => { if (this.mode === 'play') this.think(); });
    addAtmosphere(this, this.room.chapter >= 5 ? 0.45 : 1);
    onActions(this, (a) => this.onAction(a));

    this.done = new Set(completedIds(RULES, this.session.flags));
    this.refresh(false);
    cam.scrollX = Phaser.Math.Clamp(x - W / 2, 0, this.room.width - W);
    cam.fadeIn(600, 0, 0, 0);
    this.timerStart = this.activeTime;
    const onSpeaker = (who: string) => this.react(who);
    const onLine = (line: Line | null) => this.onLine(line);
    this.events.on('speaker', onSpeaker);
    this.events.on('line', onLine);
    this.events.once('shutdown', () => { this.events.off('speaker', onSpeaker); this.events.off('line', onLine); });
    this.startGestures();
    if (params.has('debug')) Object.assign(window, { __qa: this.qa() });
    void this.runEnter();
  }

  // ---------- frame loop ----------

  update(_time: number, dtMs: number) {
    sound.setQuiet(this.mode === 'pause' || this.mode === 'journal');
    if (this.mode === 'pause') this.overlay?.list?.setLabel(3, `Sound: ${settings.muted ? 'OFF' : 'ON'} [M]`);
    if (this.mode === 'pause' || this.mode === 'journal') return;
    if (this.mode === 'play') {
      const h = this.near;
      const moveHelp = this.touch ? 'Arrows: move  ·  RUN: hold to run  ·  ACT: interact' : 'A / D or arrows: move  ·  Shift: run  ·  E: interact  ·  J: journal  ·  Esc: pause  ·  H: hint';
      if (this.room.quietUi) this.controlHint.setText(''); // first-use keycaps teach the controls now (updateTip)
      else this.controlHint.setText(controls(this.room.id === 'burn' ? h?.hold?.pressure
        ? (this.hose.overheated || this.hose.pressure > BAND[1] ? 'PRESSURE HIGH. The hose sputters. Release [E] for a moment, then hold again.' : 'Hold [E] to spray. Keep the needle in FLOW for full pressure.')
        : moveHelp : h?.watcher ? 'Watch his turn. Hold [E] only while he looks away. If he turns, the attempt resets.' : ''));
    }
    this.controlHint.setVisible(this.mode === 'play' && this.controlHint.text !== ''); // an empty hint would show as a stray box
    if (this.mode === 'play') { this.playMs += dtMs; this.updateBarks(); this.updateIdle(dtMs); }
    this.updateTip();
    if (this.room.quietUi) this.hintBtn?.setVisible(this.mode === 'play');
    // the objective steps aside while a conversation or cutscene owns the screen (rendered comparison: it stacked with the panel)
    if (this.room.quietUi) this.hud.setFocus(this.mode === 'dialogue' || this.mode === 'cutscene' || this.mode === 'exit');
    this.activeTime += dtMs;
    const time = this.activeTime;
    // Phaser already supplies a smoothed/capped delta. A second 50 ms cap
    // slowed movement relative to encounter clocks below 20 FPS.
    const dt = dtMs / 1000;
    const f = this.session.flags;
    const p = this.player;
    let dir = 0;
    const playing = this.mode === 'play';
    if (playing && time >= this.holdMoveUntil) { // a held key waits half a second after a caught scene, while the screen fades back in
      if (this.keys.left.some((k) => k.isDown) || this.hud.touchLeft) dir -= 1;
      if (this.keys.right.some((k) => k.isDown) || this.hud.touchRight) dir += 1;
    }
    if (this.stillWatch) {
      if (!playing) this.stillWatch.until += dtMs;
      else if (dir) {
        this.stillWatch.until = time + this.stillWatch.ms;
        if (!this.stillWatch.moving) {
          // the Hound reacts: growl, red pulse, a jolt; the count restarts
          this.flashNote('YOU MOVED. STAY STILL.'); sound.cue('hound');
          if (!settings.reducedMotion) { this.cameras.main.flash(200, 140, 20, 10); this.cameras.main.shake(160, 0.004); }
        }
      }
      this.stillWatch.moving = !!dir;
      dir = 0;
    }
    // Shift / RUN sprints on land; the numbed leg after the lawn only manages a hobbling run
    const sprint = playing && !this.stillWatch && !(this.room.id === 'river' && !f['c13.shore']) && (this.keys.run.some((k) => k.isDown) || this.hud.touchRun);
    const speed = SPEED * (this.room.limp ? LIMP : 1) * (sprint ? (this.room.limp ? LIMP_SPRINT : SPRINT) : 1);
    this.vx = stepVelocity(this.vx, dir, speed, dt);
    let nx = p.x + this.vx * dt;
    for (const v of this.room.hotspots) {
      // low fences stop walking (never teleports or scripted moves); vault() carries Montag over
      if (!v.vault || !this.active(v)) continue;
      if (p.x <= v.x - 18 && nx > v.x - 18) { nx = v.x - 18; this.vx = 0; }
      if (p.x >= v.x + 18 && nx < v.x + 18) { nx = v.x + 18; this.vx = 0; }
    }
    p.x = Phaser.Math.Clamp(nx, 40, this.room.width - 40);
    if (dir) this.facing = dir;
    const swimming = this.room.id === 'river' && !f['c13.shore'];
    if (!this.scriptedWalk && p.getData('pose') !== 'lying' && !this.carrying) this.animate(p, this.vx, this.facing, swimming ? 'fig:montagFloat' : this.near?.hold && (this.keys.act.some(k => k.isDown) || this.hud.touchAct) ? 'fig:montagWork' : this.room.chapter >= 5 ? 'fig:montagCivil' : 'fig:montag');
    const diveHeld = playing && (this.keys.down.some((k) => k.isDown) || this.hud.touchDown) && (this.room.hazards ?? []).some((h) => h.dive);
    const dive = swimming && playing ? diveStep(this.breath, diveHeld, dt) : { ...this.breath, diving: false };
    this.breath = dive; const diving = dive.diving; sound.setMuffle(diving);
    this.breathText.setVisible(swimming && playing).setText(this.breath.exhausted ? controls('OUT OF BREATH: release [DOWN] to recover') : `BREATH ${Math.round(this.breath.air * 100)}% · dive only as the light reaches you`);

    this.hud.showDive(this.room.id === 'river' && !f['c13.shore']);
    if (!this.scriptedPose) p.setAlpha(diving ? 0.35 : 1).setY(GROUND_Y + (diving ? 14 : swimming ? Math.sin(time * 0.002) * 2 : 0));
    this.shadow.setX(p.x).setVisible(!swimming && !this.scriptedPose);
    this.rim?.setPosition(p.x, p.y - 78).setVisible(!swimming && p.alpha > 0.5 && !p.getData('norim'));
    this.wake?.setX(p.x).setVisible(swimming).setAlpha(diving ? 0.18 : 0.6).setScale(1 + Math.sin(time * 0.003) * 0.08, 1);
    p.setTint(lightTint(p.x, this.roomLights, this.room.chapter >= 5 ? 0xdde8e2 : 0xe8ded2));
    this.dark?.follow(p.x - this.cameras.main.scrollX, p.y);

    // npcs: follow, face, tint
    for (const n of this.npcs) {
      if (n.def.follow?.(f) && n.spr.visible && this.mode === 'play') { // she stands still while she talks, so her gestures hold
        const target = p.x + this.facing * 70;
        const nvx = Phaser.Math.Clamp((target - n.spr.x) * 4, -speed, speed);
        n.spr.x += nvx * dt;
        this.animate(n.spr, nvx, nvx ? Math.sign(nvx) : (p.x > n.spr.x ? 1 : -1), 'fig:' + n.def.fig);
      }
      n.sh.setX(n.spr.x).setVisible(n.spr.visible);
      n.rim.setPosition(n.spr.x, n.spr.y - 78).setVisible(n.spr.visible && n.spr.alpha > 0.5);
      n.spr.setTint(lightTint(n.spr.x, this.roomLights));
    }

    // camera: framing target or follow with look-ahead
    const cam = this.cameras.main;
    if (cam.scrollX !== this.camWritten) this.cam.cx = cam.scrollX + W / 2; // a scripted jump moved it
    this.cam = stepCamera(this.cam, p.x, this.vx, dt, this.room.width, W, this.camTarget);
    this.camWritten = cam.scrollX = snapScroll(this.cam.cx - W / 2, K);
    scrollFloor(this.floor, cam.scrollX, time);
    this.kit.tick?.(dtMs, cam.scrollX);
    this.set.tick(dtMs);
    this.children.list.forEach((o) => {
      const fct = o.getData?.('occluder') as number | undefined;
      if (!fct) return;
      const img = o as Phaser.GameObjects.Image;
      const sx = img.x - cam.scrollX * fct, overlap = (img.displayWidth + p.displayWidth) / 2 + 8;
      // fades for Montag and for anyone on screen (a lamppost hid Clarisse pointing at the moon)
      const hides = [p, ...this.npcs.filter((n) => n.spr.visible).map((n) => n.spr)].some((a) => Math.abs(sx - (a.x - cam.scrollX)) < overlap);
      img.setAlpha(hides ? 0.22 : 1);
    });

    this.updateWatchers(time);
    this.updateHazards(time, diving);
    this.updateTimer(time);
    if (playing && !this.stillWatch) { this.updateNear(); this.updateHold(dtMs); } else { this.meter.clear(); this.pressureLabel.setVisible(false); this.spray?.stop(); }
    sound.setSpray(this.spray?.emitting ? (this.sputter ? 0.4 : 1) : 0);
    if (this.promptWait && this.keys.act.some((k) => Phaser.Input.Keyboard.JustDown(k))) this.promptWait.hit = true;
  }

  private animate(s: Phaser.GameObjects.Sprite, vx: number, face: number, key: string) {
    s.setFlipX(face < 0);
    if (Math.abs(vx) > 15) {
      if (s.anims.currentAnim?.key !== key + ':walk') s.play(key + ':walk');
      const anim = s.anims.currentAnim!;
      s.anims.timeScale = walkTimeScale(vx, anim.duration / 1000, s.displayHeight);
      const frame = s.anims.currentFrame?.index ?? 0; // footfall on the stride, only for Montag (npcs are silent)
      if (s === this.player && this.room.id !== 'river' && crossedFoot(this.footFrame.get(s) ?? -1, frame - 1, anim.getTotalFrames())) sound.cue('step');
      this.footFrame.set(s, frame - 1);
    } else if (s.anims.currentAnim?.key !== key + ':idle') {
      s.play(key + ':idle');
      s.anims.timeScale = 1;
    }
  }

  private isExit() { return this.mode === 'exit'; }
  private active(h: Hotspot) { return !h.when || h.when(this.session.flags); }
  private locked(h: Hotspot) { return !!h.requires && !h.requires.every((k) => this.session.flags[k]); }
  private promptX(h: Hotspot) { return h.span ? Phaser.Math.Clamp(this.player.x, h.span[0], h.span[1]) : h.x; }

  private updateNear() {
    let best: Hotspot | undefined;
    for (const h of this.room.hotspots) {
      if (!this.active(h)) continue;
      if (h.hold && this.session.flags[h.hold.flag]) continue;
      const d = reachDistance(this.player.x, h);
      if (h.auto) { if (d < 26 && !this.locked(h)) { this.near = h; this.interact(); return; } continue; }
      if (d < REACH && (!best || d < reachDistance(this.player.x, best))) best = h;
    }
    // a new input mode only relabels the prompt; it must not drop the hotspot the same key press is about to use
    if (best === this.near && this.promptMode === inputMode()) { if (best?.span) this.prompt.setX(this.promptX(best)); return; }
    if (best !== this.near) { this.holdMs = 0; this.hose = { pressure: 0, progress: 0, overheated: false }; }
    this.near = best;
    this.promptMode = inputMode();
    if (!best) return void this.prompt.setVisible(false);
    const key = controls(best.vault ? '[SPACE]' : '[E]');
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
    this.prompt.setPosition(this.promptX(best), best.py ?? 300).setVisible(true).setAlpha(0);
    this.tweens.add({ targets: this.prompt, alpha: 1, duration: 120 });
  }

  /** T3: hold ACT near a hold-hotspot to fill its meter. */
  private updateHold(dtMs: number) {
    const h = this.near;
    this.meter.clear();
    this.pressureLabel.setVisible(false);
    if (!h?.hold || this.locked(h) || this.session.flags[h.hold.flag]) { this.spray?.stop(); this.carryOff(); return; }
    const held = this.keys.act.some((k) => k.isDown) || this.hud.touchAct;
    if (held) markTip('hold');
    if (h.watcher) {
      const watcher = this.npcs.find(n => n.def.id === h.watcher);
      if (watcher && this.isWatching(watcher.def)) {
        if (held && this.holdMs > 0) {
          // caught mid-act: a visible, audible beat before the attempt resets
          const n = (this.catches.get(watcher.def.id) ?? 0) + 1; this.catches.set(watcher.def.id, n);
          this.flashNote(n >= 2 ? `${watcher.def.name} WATCHES CLOSER NOW. YOUR WINDOW IS SHORTER.` : `${watcher.def.name} LOOKS UP. WAIT UNTIL THEY LOOK AWAY.`); sound.cue('caught');
          this.bubble(watcher.spr, 'Montag?');
          if (!settings.reducedMotion) this.cameras.main.flash(220, 120, 30, 20);
          this.tweens.add({ targets: watcher.spr, scaleY: watcher.spr.scaleY * 1.05, yoyo: true, duration: 140 });
        }
        this.holdMs = 0; this.spray?.stop(); this.carryOff();
        this.pressureLabel.setText('WATCHING — WAIT').setPosition(h.x - 60, (h.py ?? 300) + 24).setVisible(true);
        return;
      }
    }
    let flowing = held;
    if (h.hold.pressure) {
      this.hose = hoseStep(this.hose, held, dtMs / 1000, h.hold.ms, settings.assistedHose);
      this.holdMs = this.hose.progress;
      flowing = held; // always sprays; outside the band it sputters (see pressure.ts)
      this.sputter = held && !settings.assistedHose && !inBand(this.hose);
    } else if (held) this.holdMs += dtMs;
    const k = Math.min(1, this.holdMs / h.hold.ms);
    if (h.hold.carry) this.carryBook(h, k);
    const bx = h.x - 50, by = (h.py ?? 300) + (h.hold.pressure ? 60 : 24);
    this.meter.fillStyle(C.panel, 0.85).fillRect(bx - 2, by - 2, 104, 12).fillStyle(C.amberN, 1).fillRect(bx, by, 100 * k, 8);
    if (h.hold.pressure) {
      const state = !held ? 'HOLD [E] TO SPRAY' : this.sputter ? (this.hose.pressure < BAND[0] ? 'BUILDING PRESSURE…' : 'TOO HIGH: RELEASE [E]') : 'FULL FLOW';
      this.pressureLabel.setText(controls(state)).setColor(this.sputter && this.hose.pressure >= BAND[0] ? C.ember : C.cream).setPosition(bx - 6, by - 50).setVisible(true);
      this.meter.fillStyle(C.panel, 0.95).fillRect(bx - 4, by - 31, 108, 22).fillStyle(0x78a68b, 0.65).fillRect(bx + 32, by - 28, 50, 15)
        .lineStyle(2, C.creamN).lineBetween(bx + this.hose.pressure * 100, by - 30, bx + this.hose.pressure * 100, by - 10);
    }
    if (flowing && h.hold.fx) {
      this.facing = Math.sign(h.x - this.player.x) || this.facing;
      this.spray ??= this.add.particles(0, 0, 'dot', { lifespan: 520, frequency: 18, scale: { start: 1.2, end: 0.4 }, alpha: { start: 0.9, end: 0 }, gravityY: 300, blendMode: Phaser.BlendModes.ADD, emitting: false }).setDepth(6);
      const fire = h.hold.fx === 'flame';
      this.spray.setPosition(this.player.x + this.facing * 26, WALK_Y - 100);
      this.spray.setParticleTint(fire ? 0xff7a30 : 0xe8e0a0);
      const tx = (h.hold.sweep ? h.hold.sweep[0] + (h.hold.sweep[1] - h.hold.sweep[0]) * k : h.hold.target ?? h.x) - this.player.x;
      this.spray.speedX = { min: tx * 1.5, max: tx * 1.9 } as never;
      this.spray.speedY = { min: -160, max: -110 } as never;
      this.spray.frequency = this.sputter ? 90 : 18; // thin, broken spray outside the band
      if (h.hold.fx !== 'pull') this.spray.start();
    } else this.spray?.stop();
    if (k >= 1) {
      this.spray?.stop();
      if (h.watcher && h.script) {
        this.mode = 'cutscene'; this.vx = 0; this.hud.showTouch(false);
        if (h.hold.carry) this.carryBook(h, 1);
        void (async () => { if (h.steps) await this.runSteps(h.steps); await this.say(h.script!); })().then(() => { if (!this.isExit()) this.endCutscene(); });
      } else this.session.set({ ...(h.hold.also ?? {}), [h.hold.flag]: true });
      this.holdMs = 0;
      sound.cue('interact');
      this.near = undefined;
      this.prompt.setVisible(false);
      this.refresh(true);
    }
  }

  /** The book leaves the heap and arrives in Montag's hands as the hold fills (he stands in the `hold` pose meanwhile). */
  private carryBook(h: Hotspot, k: number) {
    const c = h.hold!.carry!, p = this.player;
    if (k <= 0) return this.carryOff();
    this.carrying = true;
    this.facing = Math.sign(h.x - p.x) || this.facing;
    if (p.getData('pose') !== 'hold') this.setPose(p, 'hold');
    p.setFlipX(this.facing < 0);
    const t = Phaser.Math.Easing.Sine.Out(Math.min(1, k)), hand = { x: p.x + this.facing * 38, y: p.y - 125 };
    this.tome ??= this.add.image(c.x, c.y, 'tome').setDepth(5.3);
    this.tome.setVisible(true).setAlpha(1).setScale(1).setPosition(Phaser.Math.Linear(c.x, hand.x, t), Phaser.Math.Linear(c.y, hand.y, t) - Math.sin(Math.PI * t) * 26).setAngle((1 - t) * 24 * this.facing);
  }

  private carryOff() {
    if (!this.carrying) return;
    this.carrying = false;
    this.tome?.setVisible(false);
    if (this.player.getData('pose') === 'hold') this.setPose(this.player);
  }

  /** T2: watchers look at Montag on a fixed, readable rhythm (a labelled eye above the watcher, red while he looks). */
  private updateWatchers(time: number) {
    for (const n of this.npcs) {
      const w = n.def.watch;
      if (!w) continue;
      const on = this.isWatching(n.def, time) && n.spr.visible;
      const box = this.eyes.get(n.def.id)!;
      box.setVisible(n.spr.visible).setX(n.spr.x);
      if (box.getData('on') !== on) { box.setData('on', on); (box.getData('paint') as (on: boolean) => void)(on); }
      n.rim.setTint(on ? 0xff6a3a : 0xd8c8b0).setAlpha(on ? 0.55 : 0.2); // he glows hot while he looks
      n.spr.setFlipX(on ? this.player.x < n.spr.x : this.player.x > n.spr.x);
    }
  }

  private isWatching(n: Npc, time = this.activeTime) {
    const w = n.watch!;
    const on = w.on + Math.min(1000, Math.max(0, (this.catches.get(n.id) ?? 0) - 1) * 600); // caught twice: he looks longer, so the window to act shrinks
    return ((time + (w.phase ?? 0) * w.period) % w.period) < on;
  }

  /**
   * T4: telegraphed hazards. Sweep: a beam patrols between from and to (only fair where diving hides you).
   * Pulse (lane): the stretch [from, to] is lit for `pulse` ms each period; the gaps between lanes are safe.
   */
  private updateHazards(time: number, diving: boolean) {
    let nearest = Infinity, label = '';
    for (const hz of this.room.hazards ?? []) {
      const img = this.beams.get(hz.id)!;
      const on = !hz.when || hz.when(this.session.flags);
      const rig = this.rigs.get(hz.id);
      if (this.caughtScene && this.caughtHz === hz.id) continue; // its light stays on Montag until the fade
      if (!on) { img.setVisible(false); rig?.setVisible(false); continue; }
      const t = ((time / hz.period) + (hz.phase ?? 0)) % 1;
      let hit = false;
      if (hz.pulse) {
        const st = laneState(hz, time);
        const distance = hz.from - this.player.x;
        if (this.mode === 'play' && distance > -100 && distance < 360 && Math.abs(distance) < nearest) {
          nearest = Math.abs(distance);
          label = laneReadout(hz, st.lit, st.untilLit < crossMs(hz, SPEED * (this.room.limp ? LIMP : 1)) + 150);
        }
        // the glare grows through the warning, then sweeps across the lane while lit
        const glow = st.lit ? 0.85 : st.warn ? 0.12 + 0.5 * (1 - st.untilLit / WARN_MS) : 0;
        img.setVisible(glow > 0).setAlpha(glow).setX(st.lit ? hz.from + (hz.to - hz.from) * st.progress : hz.to + 40);
        if (hz.look === 'headlights' && rig) {
          // the car comes up the boulevard toward the camera: small and far in the warning, through the lane while lit
          const k = st.lit ? 1 + st.progress : st.warn ? 1 - st.untilLit / WARN_MS : -1;
          rig.setVisible(k >= 0).setScale(k < 1 ? 0.16 + k * 0.44 : 0.6 + (k - 1) * 0.9).setY(k < 1 ? WALK_Y - 70 + k * 62 : WALK_Y - 8 + (k - 1) * 130)
            .setAlpha(k > 1.7 ? (2 - k) / 0.3 : 1).setDepth(k < 1 ? 4.05 : 5.25);
          img.setX((hz.from + hz.to) / 2);
        }
        if (hz.look === 'searchlight' && rig) rig.setX(img.x).setFlipX(st.lit);
        this.laneStrips.get(hz.id)?.setFillStyle(st.lit ? 0xfff2d0 : 0xffa040, st.lit ? 0.32 : st.warn ? 0.1 + 0.18 * (1 - st.untilLit / WARN_MS) : 0);
        if (st.warn && st.untilLit < 400 && Math.abs(distance) < 500) sound.cue(hz.look === 'headlights' ? 'engine' : 'alarm');
        hit = st.lit && inLane(hz, this.player.x);
      } else {
        img.setVisible(true);
        const bx = hz.from + (hz.to - hz.from) * (t < 0.5 ? t * 2 : 2 - t * 2);
        img.setX(bx);
        // out of breath, the splash and gasp carry: the light finds you from further off
        hit = Math.abs(this.player.x - bx) < hz.width / 2 + (this.breath.exhausted ? 120 : 0);
      }
      if (hit && this.mode === 'play' && !this.caughtScene && time - this.caughtAt > 900 && !(hz.dive && diving)) {
        const msg = hz.look === 'headlights' ? 'CAUGHT IN THE HEADLIGHTS' : hz.look === 'doorlight' ? 'A NEIGHBOUR SEES YOU' : this.breath.exhausted ? 'OUT OF BREATH. YOU BREAK THE SURFACE' : 'THE SEARCHLIGHT FINDS YOU';
        void this.caughtCinematic(hz.reset, msg, { id: hz.id, light: img, rig, horn: hz.look === 'headlights', back: hz.look === 'headlights' ? 'BACK TO THE KERB. WAIT FOR A GAP.' : undefined, steps: hz.fail });
      }
    }
    this.hazardReadout.setText(label).setVisible(!!label && this.mode === 'play');
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
    if (n !== this.countShown) { this.countShown = n; if (n > 1) sound.cue(n >= 9 ? 'alarm' : 'click'); } // a tick for every number; the last two ring
    if (el >= tm.ms && !this.caughtScene) void this.caughtCinematic(tm.reset, 'TEN. EVERY DOOR OPENS', { steps: tm.fail });
  }

  private caught(x: number, msg: string, back = 'BACK TO THE LAST SAFE SPOT') {
    this.caughtAt = this.activeTime;
    this.timerStart = this.activeTime; this.countShown = 0; this.holdMoveUntil = this.activeTime + 500;
    sound.cue('caught');
    if (!settings.reducedMotion) this.cameras.main.flash(300, 240, 240, 255);
    this.player.x = x;
    this.breath = { air: 1, exhausted: false };
    this.vx = 0;
    if (msg) this.flashNote(msg + '  TRY AGAIN.');
    else this.hud.note(back);
  }

  /**
   * Readable failure: the light (or the car) snaps onto Montag with a horn or alarm, an optional short scene (`steps`,
   * first two times per visit), a fade to black, then the checkpoint. Held movement keys are NOT reset: the cutscene
   * ignores them, and a key still held afterwards keeps walking. Reduced motion skips the flash and the car's rush.
   */
  private async caughtCinematic(x: number, msg: string, o: { id?: string; light?: Phaser.GameObjects.Image; rig?: Phaser.GameObjects.Image; horn?: boolean; back?: string; steps?: Step[] } = {}) {
    this.caughtScene = true; this.caughtHz = o.id ?? '';
    this.caughtAt = this.activeTime;
    this.mode = 'cutscene'; this.vx = 0;
    this.hud.showTouch(false); this.spray?.stop();
    const cam = this.cameras.main, still = settings.reducedMotion;
    try {
      sound.cue(o.horn ? 'horn' : 'alarm'); sound.cue('caught');
      o.light?.setVisible(true).setAlpha(1).setX(this.player.x);
      this.player.setTint(0xffffff);
      if (o.rig) { // the car is on top of him: right at the camera, filling the lane
        o.rig.setVisible(true).setAlpha(1).setX(this.player.x).setDepth(9).setOrigin(0.5, 1).setY(WALK_Y + 130);
        if (still) o.rig.setScale(1.9); else this.tweens.add({ targets: o.rig, scale: 2.6, y: WALK_Y + 190, duration: 380, ease: 'Quad.easeIn' });
      }
      if (!still) { cam.flash(220, 255, 250, 235); this.camTarget = this.player.x; }
      this.flashNote(msg);
      await sleep(this, 650);
      if (o.steps && this.failScenes++ < 2) {
        await this.runSteps(o.steps);
      }
      cam.fadeOut(260, 0, 0, 0);
      await sleep(this, 420);   // a held black: the consequence lands before the retry
      this.caught(x, '', o.back);
      this.caughtHz = ''; o.rig?.setScale(0.6);
      this.camTarget = null;
      cam.scrollX = Phaser.Math.Clamp(x - W / 2, 0, this.room.width - W);
      cam.fadeIn(320, 0, 0, 0);
    } finally {
      this.caughtScene = false; this.caughtHz = '';
      if (!this.isExit()) { this.mode = 'play'; this.hud.showTouch(true); }
    }
  }

  /** Montag thinks aloud (the `?` button, H, and the stall bark all use this): each ask goes one step further. */
  private think() {
    const lines = MUSE[this.room.id]?.(this.session.flags);
    if (!lines) return;
    const n = this.thinkLevel++;
    const i = n < 2 ? n : n % 2 ? 3 : 2;               // 0, 1, 2, then alternate 2 and 3
    const t = this.guideTarget(), px = this.player.x;
    const tx = t ? this.promptX(t) : undefined, near = !!t && reachDistance(this.player.x, t) < REACH;
    let line = placeLine(lines[i], px, tx, near);
    if (line === this.lastThought) line = placeLine(lines[i === 2 ? 3 : 2], px, tx, near);
    this.lastThought = line;
    this.barkTexts.forEach((x) => { this.tweens.killTweensOf(x); x.destroy(); }); this.barkTexts = []; // one voice at a time
    this.bubble(this.player, line);
  }

  /** The thing Montag should go to next: the first open required hotspot, else the first open labelled one. */
  private guideTarget(): Hotspot | undefined {
    const f = this.session.flags;
    const open = (h: Hotspot) => this.active(h) && !this.locked(h) && !(h.doneFlag && f[h.doneFlag]) && !(h.hold && f[h.hold.flag]);
    return this.room.hotspots.find((h) => open(h) && h.required) ?? this.room.hotspots.find((h) => open(h) && !h.auto && !!h.label);
  }

  /** Ambient lines: spoken as Montag passes, above the speaker, without stopping play. */
  private updateBarks() {
    for (const b of this.room.barks ?? []) {
      if (this.barked.has(b) || Math.abs(this.player.x - b.x) > (b.range ?? 70) || (b.when && !b.when(this.session.flags))) continue;
      this.barked.add(b);
      this.bubble(this.npcs.find((n) => n.def.name === b.who && n.spr.visible)?.spr ?? this.player, b.text);
      if (b.cue) sound.cue(b.cue as never);
      if (b.fx) void this.fx(b.fx);
      this.react(b.who);
    }
  }

  /** A short in-world line above a speaker, without stopping play. */
  private bubble(who: Phaser.GameObjects.Sprite, line: string) {
    const cx = this.cameras.main.scrollX, bx = Phaser.Math.Clamp(who.x, cx + 170, cx + W - 170); // never clipped at a screen edge
    const t = text(this, bx, who.y - 214, line, { fontSize: '15px', fontStyle: 'italic', color: C.cream, backgroundColor: 'rgba(13,10,9,0.78)', padding: { x: 10, y: 6 }, align: 'center', wordWrap: { width: 300 } })
      .setOrigin(0.5, 1).setDepth(1004).setAlpha(0);
    this.barkTexts.push(t);
    this.tweens.add({ targets: t, alpha: 1, y: t.y - 6, duration: 220, hold: 2600 + line.length * 35, yoyo: true, onComplete: () => { t.destroy(); this.barkTexts = this.barkTexts.filter((x) => x !== t); } });
  }

  /** Stalled for 8 s (standing or wandering; walking alone is not progress): Montag thinks aloud, one step further each time. */
  private updateIdle(dtMs: number) {
    const obj = this.room.objective(this.session.flags);
    if (obj !== this.lastObjective) { this.lastObjective = obj; this.thinkLevel = 0; this.idleMs = 0; }
    this.idleMs += dtMs;
    if (this.idleMs < 8000) return;
    this.idleMs = 0;
    this.journalDue = true;
    this.think();
  }

  /** The keycap for the one control the player needs next (never shown twice: see markTip). */
  private updateTip() {
    const h = this.near, moving = this.keys.left.some((k) => k.isDown) || this.keys.right.some((k) => k.isDown) || this.hud.touchLeft || this.hud.touchRight;
    if (moving && this.mode === 'play') markTip('move');
    const want = this.stillWatch || this.mode !== 'play' ? ''
      : !tipsSeen.has('move') ? (this.playMs > 1200 ? 'move' : '') // the first thing a new player needs, once the room has settled
      : h?.hold && !h.vault && !tipsSeen.has('hold') && !this.locked(h) ? 'hold'
      : h?.vault && !tipsSeen.has('vault') ? 'vault'
      : h && !h.hold && !h.vault && !h.auto && !tipsSeen.has('interact') ? 'interact'
      : this.journalDue && !tipsSeen.has('journal') ? 'journal' : '';
    if (want !== this.tipKind) {
      this.tipBox?.destroy(); this.tipBox = undefined; this.tipKind = want;
      if (want) {
        const [keys0, label] = TIPS[want], keys = want === 'move' && this.touch ? 'ARROWS' : keys0;
        const k = text(this, 0, 0, keys, { fontFamily: FONT.display, fontSize: '13px', fontStyle: '700', color: C.ink }).setOrigin(0, 0.5);
        const l = text(this, 0, 0, label, { fontFamily: FONT.display, fontSize: '13px', color: C.cream }).setOrigin(0, 0.5);
        const kw = k.width + 14, w = kw + 10 + l.width + 14;
        const bg = this.add.graphics().fillStyle(C.panel, 0.88).fillRoundedRect(-w / 2, -15, w, 30, 4).fillStyle(C.creamN, 0.95).fillRoundedRect(-w / 2 + 7, -10, kw, 20, 3);
        k.setX(-w / 2 + 14); l.setX(-w / 2 + kw + 17);
        this.tipBox = this.add.container(W / 2, H - 64, [bg, k, l]).setScrollFactor(0).setDepth(1100);
      }
    }
  }

  private spriteFor(id: string) { return id === 'montag' ? this.player : this.npcs.find((n) => n.def.id === id)?.spr; }

  /** Hold a gesture frame (16+), or with no pose return to the character's resting pose (seated, or breathing idle). */
  private setPose(spr: Phaser.GameObjects.Sprite, p?: string) {
    const want = p ?? this.npcs.find((v) => v.spr === spr)?.def.pose?.(this.session.flags);
    const i = want ? POSE_NAMES.indexOf(want) : -1;
    if (i >= 0 && spr === this.player && !spr.texture.has(String(16 + i))) spr.setTexture('fig:montag');
    const key = spr.texture.key, was = spr.getData('pose');
    if (i < 0 || !spr.texture.has(String(16 + i))) {
      if (was) { spr.setData('pose', undefined); spr.play(`${key}:unpose:${was}`).chain(key + ':idle'); } // eases out through the in-between frames
      return;
    }
    if (was === want) return;
    spr.setData('pose', want).play(`${key}:pose:${want}`); // eases in through two in-between frames and holds the pose frame
  }

  /** A line's gesture lasts for that line only; the next line (or the end of the talk) returns the actor to rest. */
  private onLine(line: Line | null) {
    if (this.linePosed) { this.setPose(this.linePosed); this.linePosed = undefined; }
    if (line?.who === 'THE WALL' && this.kit.fx.wallCue) void this.fx('wallCue');
    if (!line?.pose) return;
    const spr = line.by ? this.spriteFor(line.by)
      : line.who && line.who !== 'MONTAG' ? this.npcs.find((n) => n.def.name === line.who && n.spr.visible)?.spr : this.player;
    if (!spr) return;
    this.setPose(spr, line.pose);
    this.linePosed = spr;
  }

  /** Background life: small repeated actions (dealing cards) and Beatty's pipe smoke, only while the player is free. */
  private startGestures() {
    for (const n of this.npcs) {
      const g = n.def.gesture;
      if (g) this.time.addEvent({ delay: g.every, loop: true, startAt: Math.random() * g.every, callback: () => {
        if (this.mode !== 'play' || !n.spr.visible || n.spr.getData('pose')) return;
        this.setPose(n.spr, g.p);
        this.time.delayedCall(600, () => { if (n.spr.getData('pose') === g.p) this.setPose(n.spr); });
      } });
      if (this.room.quietUi && n.def.fig === 'beatty') {
        const puff = this.add.particles(0, 0, 'smoke', { lifespan: 2600, speedY: { min: -26, max: -14 }, speedX: { min: -4, max: 8 }, scale: { start: 0.12, end: 0.5 }, alpha: { start: 0.35, end: 0 }, tint: 0xb8aa98, emitting: false }).setDepth(5.2);
        this.time.addEvent({ delay: 4200, loop: true, callback: () => { if (n.spr.visible) puff.emitParticleAt(n.spr.x + (n.spr.flipX ? -26 : 26), n.spr.y - 190, 2); } });
      }
    }
  }

  /** A speaking character turns toward Montag and shifts weight, so conversations are not statues. */
  private react(who: string) {
    const spr = who === 'MONTAG' ? this.player : this.npcs.find((n) => n.def.name === who && n.spr.visible)?.spr;
    if (!spr || this.tweens.isTweening(spr)) return;
    const npc = this.npcs.find((n) => n.spr === spr);
    if (npc?.def.distracted?.(this.session.flags)) { if (!spr.getData('turned')) spr.setFlipX(false); } // answers without looking away from the walls
    else if (spr !== this.player) spr.setFlipX(this.player.x < spr.x);
    if (!settings.reducedMotion) this.tweens.add({ targets: spr, scaleY: spr.scaleY * 1.025, y: spr.y - 2, duration: 170, yoyo: true, ease: 'Sine.easeOut' });
  }

  private flashNote(s: string) {
    const t = text(this, W / 2, 150, s, { fontFamily: FONT.display, fontSize: '16px', wordWrap: { width: W - 130 }, align: 'center', color: C.amber, backgroundColor: 'rgba(13,10,9,0.85)', padding: { x: 14, y: 8 } })
      .setOrigin(0.5).setLetterSpacing(3).setScrollFactor(0).setDepth(1150);
    this.tweens.add({ targets: t, alpha: 0, delay: 1300, duration: 500, onComplete: () => t.destroy() });
  }

  // ---------- input ----------

  private onAction(a: Act) {
    // A quick touch may start and end between two frames. Latch it on the event,
    // rather than requiring the Hound prompt's polling loop to observe a held finger.
    if (a === 'act' && this.promptWait) { this.promptWait.hit = true; return; }
    switch (this.mode) {
      case 'dialogue':
        if (a === 'act') this.dialogue.advance();
        else if (a === 'up') this.dialogue.move(-1);
        else if (a === 'down') this.dialogue.move(1);
        else if (this.dialogue.puzzle && (a === 'hint' || a === 'back')) this.dialogue.puzzle.action(a);
        else if (a === 'pause' && (this.before !== 'cutscene' || this.dialogue.puzzle)) this.openPause();
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
        else if (a === 'journal') { markTip('journal'); this.showJournal('play'); }
        else if (a === 'pause') this.openPause();
        else if (a === 'hint') this.think();
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
    this.idleMs = 0;
    if (h.vault) markTip('vault'); else if (!h.hold) markTip('interact');
    let key = locked ? h.lockedScript : h.doneFlag && f[h.doneFlag] && h.doneScript ? h.doneScript : h.script;
    if (!locked && h.watcher) {
      const w = this.npcs.find((n) => n.def.id === h.watcher);
      if (w && this.isWatching(w.def)) key = h.watchedScript;
    }
    this.prompt.setVisible(false);
    this.near = undefined;
    const blocked = key !== h.script && key !== h.doneScript;
    const firstTime = !(h.doneFlag && f[h.doneFlag]);
    if (h.vault && !locked) return this.vault(h);
    sound.cue(h.id === 'hound' ? 'hound' : 'interact');
    this.mode = 'cutscene';
    this.vx = 0;
    this.hud.showTouch(false);
    if (key) await this.say(key);
    if (!locked && !blocked && firstTime && h.steps) await this.runSteps(h.steps);
    if (this.isExit()) return;
    if (!locked && !blocked && h.exit) return this.transition(h.exit.room, h.exit.x);
    this.endCutscene();
  }

  /** Contextual vault: a short arc over a low obstacle, input-locked for under half a second. */
  private async vault(h: Hotspot) {
    this.mode = 'cutscene'; this.vx = 0; this.hud.showTouch(false);
    const p = this.player, to = p.x < h.x ? h.x + 46 : h.x - 46, y0 = GROUND_Y;
    this.facing = to > p.x ? 1 : -1;
    this.scriptedPose = true; sound.cue('step');
    this.tweens.add({ targets: p, y: y0 - (settings.reducedMotion ? 20 : 44), duration: 200, yoyo: true, ease: 'Quad.easeOut' });
    await this.tween({ targets: p, x: to, duration: 400 });
    p.setY(y0); this.scriptedPose = false; sound.cue('step');
    if (this.isExit()) return;
    this.endCutscene();
  }

  /** Soft backlight behind a figure so dark coats separate from dark rooms (one additive image, no shader). */
  private rimFor(spr: Phaser.GameObjects.Sprite) {
    return this.add.image(spr.x, spr.y - 78, 'glow').setScale(0.95, 1.7).setTint(0xd8c8b0).setAlpha(0.2)
      .setBlendMode(Phaser.BlendModes.ADD).setDepth(spr.depth - 0.03);
  }

  private endCutscene() {
    this.mode = 'play';
    this.camTarget = null;
    this.hud.showTouch(true);
    this.checkpoint();
  }

  /** Play one script; resolves when it closes. Flags apply at the end only. */
  private say(key: string): Promise<void> {
    const script: Script | undefined = SCRIPTS[key];
    if (!script) { console.warn('missing script', key); return Promise.resolve(); }
    this.before = this.mode;
    this.mode = 'dialogue';
    this.hud.showTouch(false);
    this.barkTexts.forEach((t) => { this.tweens.killTweensOf(t); t.destroy(); }); this.barkTexts = []; // one voice at a time
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
    // a distracted character keeps facing the walls unless a scripted step turned her toward Montag
    if (!n.def.distracted?.(this.session.flags) || n.spr.getData('turned')) n.spr.setFlipX(this.player.x < n.spr.x);
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
      this.scriptedWalk = true;
      this.player.play(key + ':walk').setFlipX(d < 0);
      await this.tween({ targets: this.player, x: s.walk, duration: s.ms ?? Math.abs(d) / SPEED * 1000 });
      this.scriptedWalk = false;
      this.player.play(key + ':idle');
      return;
    }
    if ('npc' in s) {
      const n = this.npcs.find((v) => v.def.id === s.npc);
      if (!n) return;
      if (s.show !== undefined) n.spr.setVisible(s.show);
      if (s.face) n.spr.setFlipX(s.face === -1).setData('turned', true);
      if (s.x !== undefined) {
        const key = 'fig:' + n.def.fig;
        n.spr.play(key + ':walk').setFlipX(s.x < n.spr.x);
        await this.tween({ targets: n.spr, x: s.x, duration: s.ms ?? 900 });
        n.spr.play(key + ':idle');
        n.spr.setData('pose', undefined);
        this.setPose(n.spr);
      }
      return;
    }
    if ('pose' in s) { const spr = this.spriteFor(s.pose); if (spr) this.setPose(spr, s.p); return; }
    if ('cam' in s) { this.camTarget = s.cam; return sleep(this, s.ms ?? 900); }
    if ('follow' in s) { this.camTarget = null; return; }
    if ('wait' in s) return sleep(this, s.wait);
    if ('fade' in s) {
      const c = s.color ?? 0;
      if (s.fade === 'out') cam.fadeOut(s.ms ?? 700, (c >> 16) & 255, (c >> 8) & 255, c & 255);
      else cam.fadeIn(s.ms ?? 700, (c >> 16) & 255, (c >> 8) & 255, c & 255);
      return sleep(this, s.ms ?? 700);
    }
    if ('flash' in s) { if (!settings.reducedMotion) cam.flash(s.ms ?? 300, (s.flash >> 16) & 255, (s.flash >> 8) & 255, s.flash & 255); return sleep(this, s.ms ?? 300); }
    if ('fx' in s) return this.fx(s.fx);
    if ('set' in s) { this.session.set(s.set); this.refresh(true); return; }
    if ('title' in s) return this.title(s.title, s.sub);
    if ('still' in s) {
      this.mode = 'play';
      this.hud.showTouch(true);
      this.hud.setTimer(s.label);
      this.flashNote(`Stand still for ${Math.round(s.still / 1000)} seconds. Any step starts the count over.`);
      this.stillWatch = { until: this.activeTime + s.still, x: this.player.x, ms: s.still };
      while (this.activeTime < this.stillWatch.until) await sleep(this, 100);
      this.stillWatch = undefined;
      this.hud.setTimer(null);
      this.mode = 'cutscene';
      return;
    }
    if ('prompt' in s) {
      let misses = 0, ms = s.ms;
      for (;;) {
        const t = text(this, W / 2, 210, controls(s.prompt), { fontFamily: FONT.display, fontSize: '30px', color: C.amber, backgroundColor: 'rgba(13,10,9,0.85)', padding: { x: 18, y: 10 } })
          .setOrigin(0.5).setLetterSpacing(6).setScrollFactor(0).setDepth(1150);
        sound.cue('hound');
        this.hud.showTouch(true);
        this.promptWait = { until: this.activeTime + ms, hit: false };
        while (this.activeTime < this.promptWait.until && !this.promptWait.hit && !this.hud.touchAct) await sleep(this, 30);
        const hit = this.promptWait.hit || this.hud.touchAct;
        this.promptWait = undefined;
        t.destroy();
        this.hud.showTouch(false);
        if (hit) return;
        if (s.strike && ++misses % 2 === 0) {
          // the second miss costs: the needle lands, the world goes red then black, and the next window is shorter
          sound.cue('hound'); sound.cue('caught');
          if (!settings.reducedMotion) { this.cameras.main.flash(240, 200, 30, 20); this.cameras.main.shake(180, 0.006); }
          this.flashNote('THE NEEDLE HITS. IT GETS HARDER.');
          await sleep(this, 700);
          await this.say(s.strike);
          this.cameras.main.fadeOut(360, 0, 0, 0); await sleep(this, 520); // the dialogue panel shares the camera, so fade only after it closes
          this.cameras.main.fadeIn(420, 0, 0, 0); await sleep(this, 460); // the shorter window opens only once the screen is back
          ms = Math.max(1300, ms - 200);
        } else await this.say(s.miss);
      }
    }
    if ('goto' in s) return this.transition(s.goto, s.x);
    if ('ending' in s) {
      this.checkpoint();
      this.mode = 'exit';
      cam.fadeOut(900, 0, 0, 0);
      await sleep(this, 950);
      this.scene.start('end', { session: this.session });
      return;
    }
    if ('if' in s) return this.runSteps(s.if(this.session.flags) ? s.then : (s.else ?? []));
  }

  private async fx(name: string) {
    const cam = this.cameras.main;
    if (name === 'ignite') sound.cue('ignite');
    if (name === 'ignite') this.roomLights.push({ x: 1100, y: 300, color: 0xff8a40, r: 780 }); // the fire lights the crew
    if (name === 'click') return sound.cue('click');
    if (name === 'knob') return sound.cue('knob');
    if (name === 'rush') return sound.cue('rush');
    if (name === 'hush') return sound.setDuck(true);
    if (name === 'closeIn') {
      // letterbox bars frame a held story moment (camera zoom would also scale the UI, which shares the camera)
      this.bars?.forEach((b) => b.destroy());
      this.bars = [0, 1].map((i) => this.add.rectangle(0, i ? H : -48, W, 48, 0x000000, 1).setOrigin(0).setScrollFactor(0).setDepth(990));
      this.bars.forEach((b, i) => this.tweens.add({ targets: b, y: i ? H - 48 : 0, duration: settings.reducedMotion ? 0 : 900, ease: 'Sine.easeInOut' }));
      return;
    }
    if (name === 'closeOut') {
      const bars = this.bars; this.bars = undefined;
      bars?.forEach((b, i) => this.tweens.add({ targets: b, y: i ? H : -48, duration: settings.reducedMotion ? 0 : 700, ease: 'Sine.easeInOut', onComplete: () => b.destroy() }));
      return;
    }
    if (name === 'houndStir') sound.cue('servo');
    if (name === 'wallsOn') sound.setTelevision(true);
    if (name === 'rainDoor') sound.setProfile('rain');
    if (name === 'leave') { this.scriptedPose = true; return this.tween({ targets: this.player, alpha: 0, duration: 700 }); } // update() would reset alpha otherwise
    if (name === 'unhush') return sound.setDuck(false);
    const k = this.kit.fx[name];
    if (k) return k();
    switch (name) {
      case 'poleSlide': {
        this.scriptedPose = true;
        this.player.setPosition(316, 120).setAlpha(0);
        this.tweens.add({ targets: this.player, alpha: 1, duration: 200 });
        await this.tween({ targets: this.player, y: GROUND_Y, duration: 900, ease: 'Quad.easeIn' });
        this.scriptedPose = false;
        this.tweens.add({ targets: this.player, scaleY: 0.95, yoyo: true, duration: 110 });
        return;
      }
      case 'climb': {
        // up the drawn staircase: in from the floor to the foot, diagonally along the treads (smaller as he recedes), into the dark doorway at the top
        const p = this.player, foot = { x: 718, y: 392 }, top = { x: 1000, y: 170 }, treads = 10;
        this.scriptedPose = true; this.scriptedWalk = true; p.setData('norim', true);
        this.facing = 1; p.play('fig:montag:walk').setFlipX(false);
        await this.tween({ targets: p, x: foot.x, y: foot.y, scale: 0.9, duration: 650 });
        const run = { t: 0 }; let last = -1;
        await this.tween({ targets: run, t: 1, duration: settings.reducedMotion ? 1400 : 2900, onUpdate: () => {
          const t = run.t, i = Math.min(treads - 1, Math.floor(t * treads));
          if (i !== last) { last = i; sound.cue('step'); }
          p.setPosition(foot.x + (top.x - foot.x) * t, foot.y + (top.y - foot.y) * t - Math.abs(Math.sin(t * treads * Math.PI)) * 4).setScale(0.9 - 0.32 * t).setAlpha(t > 0.74 ? (1 - t) / 0.26 : 1);
        } });
        cam.fadeOut(450, 0, 0, 0); await sleep(this, 520);
        p.setAlpha(1).setScale(1).setPosition(1100, GROUND_Y).play('fig:montag:idle');
        cam.scrollX = Phaser.Math.Clamp(1100 + 70 - W / 2, 0, this.room.width - W);
        this.scriptedPose = false; this.scriptedWalk = false; p.setData('norim', false);
        cam.fadeIn(600, 0, 0, 0); await sleep(this, 640);
        return;
      }
      case 'toBed': { // sick: Montag lies down on the left bed, helmet off (the lying frame is bare-headed)
        const p = this.player;
        this.scriptedPose = true; p.setData('norim', true).setDepth(4.7).setFlipX(false); // behind the people standing at the bed
        await this.tween({ targets: p, angle: -40, y: 446, duration: 380, ease: 'Sine.easeIn' });
        this.setPose(p, 'lying');
        await this.tween({ targets: p, angle: -90, y: 382, duration: 420, ease: 'Sine.easeOut' });
        return;
      }
      case 'bedUp': {
        const p = this.player;
        await this.tween({ targets: p, angle: -40, y: 446, duration: 420, ease: 'Sine.easeIn' });
        this.setPose(p);
        await this.tween({ targets: p, angle: 0, y: GROUND_Y, duration: 380, ease: 'Sine.easeOut' });
        p.setDepth(5).setData('norim', false); this.scriptedPose = false;
        return;
      }
      case 'tuckBook': { // the book goes inside the coat
        const t = this.tome, p = this.player;
        if (!t) return;
        await this.tween({ targets: t, x: p.x + this.facing * 8, y: p.y - 108, scale: 0.5, alpha: 0, duration: 380, ease: 'Sine.easeIn' });
        t.setVisible(false); sound.cue('page');
        return;
      }
      case 'pillowPull': { // Beatty reaches over the bed and draws the book out from under the pillow
        const b = this.npcs.find((n) => n.def.id === 'beatty')!.spr;
        sound.cue('page');
        this.pillowBook ??= this.add.image(676, 396, 'tome').setDepth(5.3).setAngle(-8);
        await this.tween({ targets: this.pillowBook, x: b.x + 62, y: b.y - 132, angle: -14, duration: 600, ease: 'Sine.easeOut' });
        return;
      }
      case 'pillowReset': { // black screen: the book goes back under the pillow and Beatty back to his chair
        const b = this.npcs.find((n) => n.def.id === 'beatty')!.spr;
        this.pillowBook?.destroy(); this.pillowBook = undefined;
        b.setX(905).setFlipX(true);
        return;
      }
      case 'jets': if (!settings.reducedMotion) { cam.shake(500, 0.004); cam.flash(200, 40, 40, 60); } return sleep(this, 600);
      case 'fall': {
        this.scriptedPose = true;
        await this.tween({ targets: this.player, angle: -80 * this.facing, y: WALK_Y + 20, duration: 220 });
        await sleep(this, 900);
        await this.tween({ targets: this.player, angle: 0, y: GROUND_Y, duration: 400 });
        this.scriptedPose = false;
        return;
      }
      case 'shake': if (!settings.reducedMotion) cam.shake(400, 0.006); return;
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
    const go = () => {
      this.cameras.main.fadeOut(700, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.restart({ session: this.session }));
    };
    const n = this.room.chapter;
    if (ROOMS[room].chapter <= n) return go();
    // chapter completion card: what was finished, then the fade
    sound.cue('complete');
    const card = this.add.container(0, 0, [
      this.add.rectangle(0, 170, W, 150, 0x0d0a09, 0.86).setOrigin(0),
      text(this, W / 2, 204, `CHAPTER ${n} COMPLETE`, { fontFamily: FONT.display, fontSize: '16px', color: C.amber }).setOrigin(0.5).setLetterSpacing(8),
      text(this, W / 2, 242, CHAPTERS[n - 1], { fontFamily: FONT.type, fontSize: '30px', color: C.cream }).setOrigin(0.5),
      this.room.coda
        ? text(this, W / 2, 288, this.room.coda, { fontFamily: FONT.type, fontSize: '17px', color: C.creamDim, align: 'center', wordWrap: { width: 640 } }).setOrigin(0.5)
        : text(this, W / 2, 284, `JOURNAL ${this.done.size}/15  ·  PROGRESS SAVED`, { fontFamily: FONT.display, fontSize: '13px', color: C.creamDim }).setOrigin(0.5).setLetterSpacing(4),
    ]).setScrollFactor(0, 0, true).setDepth(1100).setAlpha(0);
    this.tweens.add({ targets: card, alpha: 1, duration: 400 });
    this.time.delayedCall(1900, go);
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
      sound.cue('complete');
      if (this.room.quietUi) this.hud.note(`JOURNAL  ·  ${ch.title.toUpperCase()}`);
      else this.hud.toast(`CHALLENGE ${String(id).padStart(2, '0')} COMPLETE`, `${ch.title}  ·  journal updated`);
    }
    this.done = new Set(now);
    this.hud.setObjective(this.room.objective(f), now.length);
    this.kit.update?.(f);
    this.set.update(f);
    if (this.room.id === 'burn') sound.setProfile(f['c01.lit'] ? 'fire' : 'night');
    if (this.room.id === 'home1') sound.setTelevision(!!f['h1.day'] && !(f['c03.w1'] && f['c03.w2'] && f['c03.w3'])); // all walls down: the house goes quiet
    if (this.room.id === 'home4') sound.setTelevision(!f['c09.off']);
    if (this.room.dark) this.dark?.set(this.room.dark(f), 0);
    for (const n of this.npcs) if (n.def.when) n.spr.setVisible(n.def.when(f));
    for (const n of this.npcs) if (n.def.pose && n.spr !== this.linePosed) this.setPose(n.spr);
    for (const n of this.npcs) if (n.def.distracted) n.spr.setData('turned', false).setFlipX(n.def.distracted(f) ? false : this.player.x < n.spr.x);
    for (const h of this.room.hotspots) {
      const g = this.glows.get(h.id);
      if (!g) continue;
      const finished = (h.doneFlag && f[h.doneFlag]) || (h.hold && f[h.hold.flag]);
      const want = this.active(h) && !finished && !this.locked(h);
      if (want && !g.getData('on')) { g.setData('on', true); g.setData('tw', this.tweens.add({ targets: g, alpha: { from: 0.15, to: 0.5 }, yoyo: true, repeat: -1, duration: 900 })); }
      if (!want && g.getData('on')) { g.setData('on', false); (g.getData('tw') as Phaser.Tweens.Tween).remove(); g.setAlpha(0); }
    }
    // Flags and their following steps form one event. Saving halfway through can
    // hide the hotspot on reload before its transition has happened.
    if (announce && this.mode === 'play' && !this.stillWatch) this.checkpoint();
  }

  // ---------- overlays ----------

  private openPause() {
    this.vx = 0;
    this.before = this.mode;
    this.mode = 'pause';
    this.hud.showTouch(false);
    const g = this.add.graphics().fillStyle(0x000000, 0.72).fillRect(0, 0, W, H)
      .fillStyle(C.panel, 0.95).fillRect(W / 2 - 220, 110, 440, 420)
      .lineStyle(1, C.emberN, 0.5).strokeRect(W / 2 - 219.5, 110.5, 439, 419);
    const block = this.add.zone(0, 0, W, H).setOrigin(0).setScrollFactor(0).setInteractive();
    const title = text(this, W / 2, 150, 'PAUSED', { fontFamily: FONT.display, fontSize: '30px', fontStyle: '600' }).setOrigin(0.5).setLetterSpacing(8);
    const help = text(this, W / 2, 192, this.touch ? 'TAP A ROW TO CHOOSE' : 'ARROWS / W S TO CHOOSE · ENTER OR E TO CONFIRM', {
      fontFamily: FONT.display, fontSize: '11px', color: C.creamDim,
    }).setOrigin(0.5).setLetterSpacing(1);
    const root = this.add.container(0, 0, [g, block, title, help]).setScrollFactor(0, 0, true).setDepth(1290);
    const list = new MenuList(this, W / 2 - 110, 234, [
      { label: 'Resume', action: () => this.resume() },
      { label: 'Journal', action: () => { this.overlay?.destroy(); this.showJournal(this.before); } },
      { label: this.session.demo ? 'Quit to title' : 'Save & quit to title', action: () => this.quit() },
      { label: `Sound: ${settings.muted ? 'OFF' : 'ON'} [M]`, action: () => { sound.toggleMute(); this.overlay?.destroy(); this.mode = this.before; this.openPause(); this.overlay?.list?.select(3); } },
      { label: `Reduced motion: ${settings.reducedMotion ? 'ON' : 'OFF'}`, action: () => { setSetting('reducedMotion', !settings.reducedMotion); this.overlay?.destroy(); this.mode = this.before; this.openPause(); this.overlay?.list?.select(4); } },
    ], 64, 22);
    list.root.setDepth(1295);
    this.overlay = { list, destroy: () => { root.destroy(); list.destroy(); this.overlay = undefined; } };
  }

  private resume() {
    this.overlay?.destroy();
    this.mode = this.before;
    this.hud.showTouch(this.mode === 'play');
  }

  private showJournal(back: Mode) {
    this.vx = 0;
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
