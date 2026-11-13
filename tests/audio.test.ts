import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Soundscape } from '../src/audio.ts';
import { settings, setSetting } from '../src/settings.ts';

function fakeContext({ blocked = false } = {}) {
  let sources = 0, oscillators = 0, closed = false;
  const param = () => ({ value: 0, setTargetAtTime() {}, setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} });
  const node = () => ({ connect() {}, disconnect() {}, start() {}, stop() {}, gain: param(), frequency: param(), Q: param(), onended: null });
  const ctx = {
    currentTime: 0, sampleRate: 22050, state: 'suspended', destination: {},
    createGain: node, createBiquadFilter: node,
    createBuffer: (_: number, length: number) => ({ getChannelData: () => new Float32Array(length) }),
    createBufferSource: () => { sources++; return node(); },
    createOscillator: () => { oscillators++; return node(); },
    resume: async () => { if (blocked) throw new Error('autoplay blocked'); ctx.state = 'running'; },
    close: async () => { closed = true; },
  };
  return { ctx: ctx as unknown as AudioContext, counts: () => ({ sources, oscillators, closed }), advance: () => { ctx.currentTime++; } };
}

test('audio remains lazy, survives blocked autoplay, and creates only one context/ambient bed', async () => {
  const f = fakeContext(); let created = 0;
  const sound = new Soundscape(() => { created++; return f.ctx; });
  sound.useScene('camp'); sound.cue('step'); assert.equal(created, 0);
  assert.equal(await sound.unlock(), true); assert.equal(await sound.unlock(), true);
  const ambient = f.counts();
  assert.equal(ambient.sources, 3); assert.equal(ambient.oscillators, 4); // bed, crackle, hose; drone, swell LFO, two pad tones
  for (const room of ['burn', 'home1', 'river', 'camp', 'end', 'menu']) sound.useScene(room);
  sound.setSpray(1); sound.setSpray(0.4); sound.setSpray(0);
  assert.equal(created, 1); assert.deepEqual(f.counts(), ambient, 'scene changes and the hose loop never add ambient nodes');
  sound.dispose(); assert.ok(f.counts().closed);
  const blocked = new Soundscape(() => fakeContext({ blocked: true }).ctx);
  assert.equal(await blocked.unlock(), false); blocked.dispose();
  const unsupported = new Soundscape(() => { throw new Error('unsupported'); });
  assert.equal(await unsupported.unlock(), false);
});

test('audio rate-limits rapid input, caps voices, and mute/quiet prevent new effects', async () => {
  setSetting('muted', false);
  const f = fakeContext(), sound = new Soundscape(() => f.ctx);
  await sound.unlock();
  for (let i = 0; i < 30; i++) sound.cue('ui');
  assert.equal(sound.status.voices, 1, 'rapid taps make one cue');
  for (let i = 0; i < 20; i++) { f.advance(); sound.cue('ui'); }
  assert.equal(sound.status.voices, 8, 'at most eight active voices even if audio backend stalls');
  sound.toggleMute(); assert.equal(settings.muted, true);
  const count = f.counts().oscillators; sound.cue('ending'); assert.equal(f.counts().oscillators, count);
  sound.toggleMute(); sound.setQuiet(true); sound.cue('ending'); assert.equal(f.counts().oscillators, count);
  sound.dispose(); assert.equal(sound.status.voices, 0);
});
