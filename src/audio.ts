import { settings, setSetting } from './settings.ts';

type Cue = 'ui' | 'page' | 'step' | 'interact' | 'complete' | 'hound' | 'caught' | 'ignite' | 'ending' | 'wrong' | 'engine' | 'alarm';
/** noise bed level/cutoff, drone Hz/level, fire crackle, tension pad, slow filter swell (water, wind). */
interface Profile { noise: number; cutoff: number; hum: number; tone: number; crackle: number; pad: number; swell: number }
const PROFILES: Record<string, Profile> = {
  menu: { noise: 0.07, cutoff: 240, hum: 55, tone: 0.045, crackle: 0.25, pad: 0.03, swell: 0.2 },
  industrial: { noise: 0.13, cutoff: 460, hum: 62, tone: 0.06, crackle: 0, pad: 0.025, swell: 0.1 },
  television: { noise: 0.1, cutoff: 1400, hum: 110, tone: 0.025, crackle: 0, pad: 0.012, swell: 0.05 },
  fire: { noise: 0.22, cutoff: 1800, hum: 48, tone: 0.03, crackle: 0.9, pad: 0.03, swell: 0.25 },
  subway: { noise: 0.38, cutoff: 1900, hum: 82, tone: 0.06, crackle: 0, pad: 0.02, swell: 0.15 },
  pursuit: { noise: 0.16, cutoff: 780, hum: 73, tone: 0.06, crackle: 0, pad: 0.06, swell: 0.1 },
  river: { noise: 0.24, cutoff: 900, hum: 92, tone: 0.008, crackle: 0, pad: 0.03, swell: 0.7 },
  camp: { noise: 0.12, cutoff: 2200, hum: 146, tone: 0.018, crackle: 0.55, pad: 0.015, swell: 0.2 },
  ending: { noise: 0.05, cutoff: 480, hum: 130, tone: 0.025, crackle: 0.2, pad: 0.04, swell: 0.3 },
};

// A cue is one or more parts. tone: oscillator sweep; burst: filtered noise sweep. [at s, length s, level]
type Part = { tone: OscillatorType; f: [number, number]; lp?: number; at?: number; len: number; vol: number }
  | { burst: BiquadFilterType; f: [number, number]; q?: number; at?: number; len: number; vol: number };
const CUES: Record<Cue, { gap: number; parts: Part[] }> = {
  ui: { gap: 85, parts: [{ tone: 'sine', f: [520, 390], len: 0.05, vol: 0.2 }] },
  page: { gap: 140, parts: [{ burst: 'bandpass', f: [3200, 1700], q: 0.9, len: 0.09, vol: 0.45 }] },
  step: { gap: 280, parts: [{ burst: 'lowpass', f: [420, 200], len: 0.07, vol: 0.55 }, { tone: 'sine', f: [72, 40], len: 0.06, vol: 0.22 }] },
  interact: { gap: 200, parts: [{ tone: 'triangle', f: [300, 460], len: 0.09, vol: 0.24 }, { burst: 'bandpass', f: [1800, 1200], len: 0.04, vol: 0.25 }] },
  complete: { gap: 900, parts: [{ tone: 'triangle', f: [523, 523], len: 0.5, vol: 0.22 }, { tone: 'triangle', f: [784, 784], at: 0.12, len: 0.7, vol: 0.2 }] },
  // the Hound: two detuned saws beating against each other, a needle click, a low servo whine
  hound: { gap: 1000, parts: [{ tone: 'sawtooth', f: [112, 52], lp: 700, len: 0.85, vol: 0.3 }, { tone: 'sawtooth', f: [118, 55], lp: 700, len: 0.85, vol: 0.24 },
    { burst: 'bandpass', f: [5200, 4800], q: 4, len: 0.03, vol: 0.4 }, { tone: 'sine', f: [1900, 2400], at: 0.1, len: 0.5, vol: 0.04 }] },
  caught: { gap: 900, parts: [{ tone: 'sine', f: [96, 38], len: 0.55, vol: 0.55 }, { burst: 'lowpass', f: [1100, 180], len: 0.45, vol: 0.55 }] },
  ignite: { gap: 1500, parts: [{ burst: 'bandpass', f: [280, 2600], q: 0.6, len: 0.95, vol: 0.75 }, { tone: 'sine', f: [62, 34], len: 0.6, vol: 0.45 }] },
  ending: { gap: 2000, parts: [{ tone: 'triangle', f: [196, 196], len: 2.2, vol: 0.14 }, { tone: 'triangle', f: [294, 294], at: 0.35, len: 2, vol: 0.12 }, { tone: 'triangle', f: [392, 392], at: 0.7, len: 1.8, vol: 0.1 }] },
  wrong: { gap: 250, parts: [{ tone: 'square', f: [233, 220], lp: 1100, len: 0.26, vol: 0.1 }, { tone: 'square', f: [247, 233], lp: 1100, len: 0.26, vol: 0.1 }] },
  // a beetle car coming fast: rising engine saw plus tyre roar
  engine: { gap: 1400, parts: [{ tone: 'sawtooth', f: [42, 120], lp: 520, len: 1.2, vol: 0.3 }, { burst: 'lowpass', f: [220, 1200], len: 1.2, vol: 0.5 }] },
  alarm: { gap: 900, parts: [{ tone: 'square', f: [880, 880], lp: 2200, len: 0.22, vol: 0.08 }, { tone: 'square', f: [660, 660], lp: 2200, at: 0.25, len: 0.22, vol: 0.08 }] },
};

/** Original Web Audio synthesis. Fixed ambient graph (3 looping noise sources, 4 oscillators) built once,
 * a compressor on the master, <=8 cue voices. No download, network, timers, samples or Phaser audio backend.
 */
export class Soundscape {
  private context?: AudioContext;
  private master?: GainNode;
  private out?: AudioNode;
  private analyser?: AnalyserNode;
  private amb?: GainNode;
  private sfx?: GainNode;
  private noiseGain?: GainNode;
  private toneGain?: GainNode;
  private crackleGain?: GainNode;
  private padGain?: GainNode;
  private sprayGain?: GainNode;
  private swellDepth?: GainNode;
  private filter?: BiquadFilterNode;
  private drone?: OscillatorNode;
  private pads: OscillatorNode[] = [];
  private lfo?: OscillatorNode;
  private loops: AudioBufferSourceNode[] = [];
  private noiseBuffer?: AudioBuffer;
  private voices = new Set<AudioScheduledSourceNode>();
  private last = new Map<Cue, number>();
  private profile = 'menu';
  private scene = 'menu';
  private quiet = false;
  private spray = 0;
  private muffled = false;
  private muffle?: BiquadFilterNode;
  private failed = false;
  private pending?: Promise<boolean>;
  private makeContext: () => AudioContext;

  constructor(makeContext = () => {
    const ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    return new ctor();
  }) { this.makeContext = makeContext; }

  get status() {
    return { scene: this.scene, profile: this.profile, muted: settings.muted, volume: settings.volume, state: this.context?.state ?? (this.failed ? 'unavailable' : 'locked'), voices: this.voices.size };
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

  private loop(buffer: AudioBuffer, to: AudioNode) {
    const s = this.context!.createBufferSource(); s.buffer = buffer; s.loop = true; s.connect(to); s.start(); this.loops.push(s);
  }

  private create() {
    const c = this.context = this.makeContext();
    this.master = c.createGain(); this.master.gain.value = 0;
    // The compressor keeps stacked cues from clipping and lifts quiet ambience on small speakers.
    // underwater: the whole mix goes through one low-pass that only closes while Montag is diving
    this.muffle = c.createBiquadFilter(); this.muffle.type = 'lowpass'; this.muffle.frequency.value = 20000;
    this.master.connect(this.muffle);
    const comp = c.createDynamicsCompressor?.();
    if (comp) { comp.threshold.value = -20; comp.knee.value = 12; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2; this.muffle.connect(comp); comp.connect(c.destination); this.out = comp; }
    else { this.muffle.connect(c.destination); this.out = this.muffle; }
    if (c.createAnalyser) { this.analyser = c.createAnalyser(); this.analyser.fftSize = 2048; this.out.connect(this.analyser); }
    this.amb = c.createGain(); this.amb.gain.value = 0.45; this.amb.connect(this.master);
    this.sfx = c.createGain(); this.sfx.gain.value = 1; this.sfx.connect(this.master);

    // Brown-ish noise (bed, cue bursts, hose) and a sparse click buffer (fire crackle). Generated once.
    const len = c.sampleRate * 2;
    const noise = this.noiseBuffer = c.createBuffer(1, len, c.sampleRate), data = noise.getChannelData(0);
    const crackle = c.createBuffer(1, len, c.sampleRate), pops = crackle.getChannelData(0);
    let previous = 0, seed = 451, pop = 0;
    for (let i = 0; i < len; i++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const white = seed / 0xffffffff * 2 - 1;
      previous = (previous + white * 0.08) / 1.025;
      data[i] = previous * 0.65 + white * 0.12 + (seed % 11003 < 4 ? white * 0.3 : 0);
      if (seed % 2400 < 1) pop = 0.5 + (seed % 100) / 200; // a pop roughly every 2400 samples
      pops[i] = white * pop; pop *= 0.992;
    }
    this.filter = c.createBiquadFilter(); this.filter.type = 'lowpass'; this.filter.Q.value = 0.45;
    this.noiseGain = c.createGain(); this.noiseGain.gain.value = 0;
    this.filter.connect(this.noiseGain); this.noiseGain.connect(this.amb);
    this.loop(noise, this.filter);
    // slow swell on the bed's filter: waves on the river, wind elsewhere
    this.lfo = c.createOscillator(); this.lfo.frequency.value = 0.13;
    this.swellDepth = c.createGain(); this.swellDepth.gain.value = 0;
    this.lfo.connect(this.swellDepth); this.swellDepth.connect(this.filter.frequency); this.lfo.start();

    const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 900;
    this.crackleGain = c.createGain(); this.crackleGain.gain.value = 0;
    hp.connect(this.crackleGain); this.crackleGain.connect(this.amb);
    this.loop(crackle, hp);

    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2600; bp.Q.value = 0.8;
    this.sprayGain = c.createGain(); this.sprayGain.gain.value = 0;
    bp.connect(this.sprayGain); this.sprayGain.connect(this.sfx);
    this.loop(noise, bp);

    this.drone = c.createOscillator(); this.drone.type = 'sine';
    this.toneGain = c.createGain(); this.toneGain.gain.value = 0;
    this.drone.connect(this.toneGain); this.toneGain.connect(this.amb); this.drone.start();
    // tension pad: two triangles a semitone apart, low-passed; their beating is the unease
    const padLp = c.createBiquadFilter(); padLp.type = 'lowpass'; padLp.frequency.value = 700;
    this.padGain = c.createGain(); this.padGain.gain.value = 0;
    padLp.connect(this.padGain); this.padGain.connect(this.amb);
    this.pads = [0, 1].map(() => { const o = c.createOscillator(); o.type = 'triangle'; o.connect(padLp); o.start(); return o; });
    this.apply();
  }

  useScene(scene: string) {
    if (this.scene === scene && this.context) return;
    this.scene = scene;
    this.profile = scene === 'menu' ? 'menu' : scene === 'end' ? 'ending' : scene === 'river' ? 'river'
      : scene === 'camp' ? 'camp' : scene === 'subway' ? 'subway' : ['lawn2', 'boulevard', 'run'].includes(scene) ? 'pursuit'
      : ['home1', 'home4'].includes(scene) ? 'television' : ['burn', 'attic', 'home5'].includes(scene) ? 'fire' : 'industrial';
    for (const voice of this.voices) { try { voice.stop(); } catch { /* already ended */ } }
    this.spray = 0;
    this.setMuffle(false);
    this.apply();
  }

  setTelevision(on: boolean) {
    if (!['home1', 'home4'].includes(this.scene)) return;
    const profile = on ? 'television' : 'industrial';
    if (this.profile !== profile) { this.profile = profile; this.apply(); }
  }

  /** Underwater muffling while diving; cheap to call every frame. */
  setMuffle(on: boolean) {
    if (on === this.muffled) return;
    this.muffled = on;
    if (this.context && this.muffle) this.muffle.frequency.setTargetAtTime(on ? 450 : 20000, this.context.currentTime, 0.08);
  }

  /** Hose loop: 0 = off, ~0.4 = sputtering, 1 = full flow. Cheap to call every frame. */
  setSpray(level: number) {
    if (level === this.spray) return;
    this.spray = level;
    if (this.context && this.sprayGain) this.sprayGain.gain.setTargetAtTime(level * 0.55, this.context.currentTime, 0.04);
  }

  refresh() { this.apply(); }

  /** Local, explicit sample inspection for QA/sound check; no recording or transmission. */
  sampleOutput() {
    if (!this.analyser) return { rms: 0, peak: 0 };
    const data = new Float32Array(this.analyser.fftSize); this.analyser.getFloatTimeDomainData(data);
    let sum = 0, peak = 0;
    for (const n of data) { sum += n * n; peak = Math.max(peak, Math.abs(n)); }
    return { rms: Math.sqrt(sum / data.length), peak };
  }

  /** QA only (?debug): a MediaStream of the final mix, so a local tool can record what the player hears. */
  tap() {
    const c = this.context;
    if (!c || !this.out || !('createMediaStreamDestination' in c)) return undefined;
    const d = c.createMediaStreamDestination(); this.out.connect(d); return d.stream;
  }

  toggleMute() { setSetting('muted', !settings.muted); this.apply(); }
  setQuiet(quiet: boolean) { if (quiet !== this.quiet) { this.quiet = quiet; this.apply(); } }

  private apply() {
    if (!this.context || !this.master) return;
    const now = this.context.currentTime, p = PROFILES[this.profile];
    this.master.gain.setTargetAtTime(settings.muted || this.quiet ? 0 : 0.8 * settings.volume, now, 0.06);
    this.filter!.frequency.setTargetAtTime(p.cutoff, now, 0.3);
    this.swellDepth!.gain.setTargetAtTime(p.cutoff * p.swell, now, 0.5);
    this.noiseGain!.gain.setTargetAtTime(p.noise * 3, now, 0.3);
    this.drone!.frequency.setTargetAtTime(p.hum, now, 0.4);
    this.toneGain!.gain.setTargetAtTime(p.tone, now, 0.3);
    this.crackleGain!.gain.setTargetAtTime(p.crackle * 0.5, now, 0.4);
    this.padGain!.gain.setTargetAtTime(p.pad, now, 1.2);
    this.pads.forEach((o, i) => o.frequency.setTargetAtTime(p.hum * 2 * (i ? 1.0595 : 1), now, 0.8));
    this.sprayGain!.gain.setTargetAtTime(this.spray * 0.55, now, 0.04);
  }

  cue(kind: Cue) {
    const c = this.context;
    if (!c || c.state !== 'running' || settings.muted || this.quiet || this.voices.size >= 8) return;
    const { gap, parts } = CUES[kind], now = c.currentTime;
    if ((now - (this.last.get(kind) ?? -100)) * 1000 < gap) return;
    this.last.set(kind, now);
    for (const p of parts) this.part(c, p, now + (p.at ?? 0));
  }

  private part(c: AudioContext, p: Part, t: number) {
    const gain = c.createGain(), nodes: AudioNode[] = [gain];
    let src: AudioScheduledSourceNode, head: AudioNode = gain;
    if ('tone' in p) {
      const o = c.createOscillator(); o.type = p.tone;
      o.frequency.setValueAtTime(p.f[0], t); o.frequency.exponentialRampToValueAtTime(p.f[1], t + p.len); src = o;
      if (p.lp) { const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = p.lp; lp.connect(gain); head = lp; nodes.push(lp); }
    } else {
      const b = c.createBufferSource(); b.buffer = this.noiseBuffer!; src = b;
      const f = c.createBiquadFilter(); f.type = p.burst; f.Q.value = p.q ?? 0.7;
      f.frequency.setValueAtTime(p.f[0], t); f.frequency.exponentialRampToValueAtTime(p.f[1], t + p.len);
      f.connect(gain); head = f; nodes.push(f);
    }
    src.connect(head);
    gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(p.vol, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + p.len);
    gain.connect(this.sfx!); this.voices.add(src);
    src.onended = () => { this.voices.delete(src); src.disconnect(); nodes.forEach((n) => n.disconnect()); };
    src.start(t); src.stop(t + p.len + 0.015);
  }

  dispose() {
    for (const voice of this.voices) { try { voice.stop(); } catch { /* ended */ } }
    this.voices.clear();
    for (const s of [...this.loops, this.drone, this.lfo, ...this.pads]) { try { s?.stop(); } catch { /* ended */ } }
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
