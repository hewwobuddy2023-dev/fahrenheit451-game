import { settings, setSetting } from './settings.ts';

type Cue = 'ui' | 'page' | 'step' | 'interact' | 'complete' | 'hound' | 'caught' | 'ignite' | 'ending';
interface Profile { noise: number; cutoff: number; hum: number; tone: number }
const PROFILES: Record<string, Profile> = {
  menu: { noise: 0.07, cutoff: 240, hum: 55, tone: 0.045 },
  industrial: { noise: 0.13, cutoff: 460, hum: 62, tone: 0.06 },
  television: { noise: 0.1, cutoff: 1400, hum: 110, tone: 0.025 },
  fire: { noise: 0.22, cutoff: 1800, hum: 48, tone: 0.03 },
  pursuit: { noise: 0.16, cutoff: 780, hum: 73, tone: 0.06 },
  river: { noise: 0.2, cutoff: 1000, hum: 92, tone: 0.008 },
  camp: { noise: 0.12, cutoff: 2200, hum: 146, tone: 0.018 },
  ending: { noise: 0.05, cutoff: 480, hum: 130, tone: 0.025 },
};
const CUES: Record<Cue, [number, number, number, number]> = {
  // start Hz, end Hz, seconds, minimum spacing ms
  ui: [440, 330, 0.045, 85], page: [650, 420, 0.035, 140], step: [90, 45, 0.07, 280],
  interact: [280, 420, 0.08, 200], complete: [330, 660, 0.35, 900],
  hound: [125, 48, 0.65, 1000], caught: [150, 70, 0.3, 900], ignite: [80, 160, 0.5, 1500], ending: [196, 294, 1.2, 2000],
};

/** Original Web Audio synthesis: one reusable noise buffer, two ambient sources, <=8 cue voices.
 * No download, network, timers, commercial samples or dependency on Phaser's audio backend.
 */
export class Soundscape {
  private context?: AudioContext;
  private master?: GainNode;
  private noiseGain?: GainNode;
  private toneGain?: GainNode;
  private filter?: BiquadFilterNode;
  private drone?: OscillatorNode;
  private noise?: AudioBufferSourceNode;
  private voices = new Set<OscillatorNode>();
  private last = new Map<Cue, number>();
  private profile = 'menu';
  private scene = 'menu';
  private quiet = false;
  private failed = false;
  private pending?: Promise<boolean>;
  private makeContext: () => AudioContext;

  constructor(makeContext = () => {
    const ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    return new ctor();
  }) { this.makeContext = makeContext; }

  get status() {
    return { scene: this.scene, profile: this.profile, muted: settings.muted, state: this.context?.state ?? (this.failed ? 'unavailable' : 'locked'), voices: this.voices.size };
  }

  /** Called only from a gesture listener. Rejections never block game initialization/input. */
  unlock(): Promise<boolean> {
    if (this.failed) return Promise.resolve(false);
    if (this.pending) return this.pending;
    try {
      if (!this.context) this.create();
      const ctx = this.context!;
      // Invoke resume synchronously inside the gesture, before an await loses activation on iOS.
      this.pending = ctx.resume().then(() => { this.apply(); return ctx.state === 'running'; }).catch(() => false).finally(() => { this.pending = undefined; });
      return this.pending;
    } catch { this.failed = true; return Promise.resolve(false); }
  }

  private create() {
    const c = this.context = this.makeContext();
    this.master = c.createGain(); this.master.gain.value = 0;
    this.master.connect(c.destination);
    this.filter = c.createBiquadFilter(); this.filter.type = 'lowpass'; this.filter.Q.value = 0.45;
    this.noiseGain = c.createGain(); this.noiseGain.gain.value = 0;
    this.filter.connect(this.noiseGain); this.noiseGain.connect(this.master);
    // A quiet brown-noise bed with sparse crackles. Generated once; no per-frame allocation.
    const buffer = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), data = buffer.getChannelData(0);
    let previous = 0, seed = 451;
    for (let i = 0; i < data.length; i++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const white = seed / 0xffffffff * 2 - 1;
      previous = (previous + white * 0.08) / 1.025;
      data[i] = previous * 0.55 + (seed % 11003 < 4 ? white * 0.3 : 0);
    }
    this.noise = c.createBufferSource(); this.noise.buffer = buffer; this.noise.loop = true; this.noise.connect(this.filter); this.noise.start();
    this.drone = c.createOscillator(); this.drone.type = 'sine';
    this.toneGain = c.createGain(); this.toneGain.gain.value = 0;
    this.drone.connect(this.toneGain); this.toneGain.connect(this.master); this.drone.start();
    this.apply();
  }

  useScene(scene: string) {
    if (this.scene === scene && this.context) return;
    this.scene = scene;
    this.profile = scene === 'menu' ? 'menu' : scene === 'end' ? 'ending' : scene === 'river' ? 'river'
      : scene === 'camp' ? 'camp' : ['lawn2', 'boulevard', 'run'].includes(scene) ? 'pursuit'
      : ['home1', 'home4'].includes(scene) ? 'television' : ['burn', 'attic', 'home5'].includes(scene) ? 'fire' : 'industrial';
    for (const voice of this.voices) { try { voice.stop(); } catch { /* already ended */ } }
    this.apply();
  }

  setTelevision(on: boolean) {
    if (!['home1', 'home4'].includes(this.scene)) return;
    const profile = on ? 'television' : 'industrial';
    if (this.profile !== profile) { this.profile = profile; this.apply(); }
  }

  toggleMute() { setSetting('muted', !settings.muted); this.apply(); }
  setQuiet(quiet: boolean) { if (quiet !== this.quiet) { this.quiet = quiet; this.apply(); } }

  private apply() {
    if (!this.context || !this.master) return;
    const now = this.context.currentTime, p = PROFILES[this.profile];
    this.master.gain.setTargetAtTime(settings.muted || this.quiet ? 0 : 0.18, now, 0.06);
    this.filter!.frequency.setTargetAtTime(p.cutoff, now, 0.3);
    this.noiseGain!.gain.setTargetAtTime(p.noise, now, 0.3);
    this.drone!.frequency.setTargetAtTime(p.hum, now, 0.4);
    this.toneGain!.gain.setTargetAtTime(p.tone, now, 0.3);
  }

  cue(kind: Cue) {
    const c = this.context;
    if (!c || c.state !== 'running' || settings.muted || this.quiet || this.voices.size >= 8) return;
    const [start, end, duration, gap] = CUES[kind], now = c.currentTime;
    if ((now - (this.last.get(kind) ?? -100)) * 1000 < gap) return;
    this.last.set(kind, now);
    const osc = c.createOscillator(), gain = c.createGain();
    osc.type = kind === 'hound' || kind === 'caught' ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(start, now); osc.frequency.exponentialRampToValueAtTime(end, now + duration);
    gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(kind === 'step' ? 0.1 : 0.18, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain); gain.connect(this.master!); this.voices.add(osc);
    osc.onended = () => { this.voices.delete(osc); osc.disconnect(); gain.disconnect(); };
    osc.start(now); osc.stop(now + duration + 0.015);
  }

  dispose() {
    for (const voice of this.voices) { try { voice.stop(); } catch { /* ended */ } }
    this.voices.clear(); this.noise?.stop(); this.drone?.stop();
    void this.context?.close().catch(() => undefined);
  }
}

export const sound = new Soundscape();

export function installAudio() {
  const gesture = () => { void sound.unlock(); };
  const key = (e: KeyboardEvent) => { if (e.code === 'KeyM' && !e.repeat) sound.toggleMute(); };
  const visibility = () => { if (document.hidden) sound.setQuiet(true); };
  document.addEventListener('pointerdown', gesture, true);
  document.addEventListener('touchend', gesture, true);
  window.addEventListener('keydown', gesture, true);
  window.addEventListener('keydown', key);
  document.addEventListener('visibilitychange', visibility);
  return () => {
    document.removeEventListener('pointerdown', gesture, true); document.removeEventListener('touchend', gesture, true);
    window.removeEventListener('keydown', gesture, true); window.removeEventListener('keydown', key);
    document.removeEventListener('visibilitychange', visibility); sound.dispose();
  };
}
