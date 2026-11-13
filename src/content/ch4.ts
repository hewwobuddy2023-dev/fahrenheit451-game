// Chapter 4 — Burning Bright (Part Three, first half). Montag's house; Beatty's death as a brief, non-graphic cut;
// the Hound; the boulevard; Faber's sprinklers; the count of ten.
import type { RoomDef, Script } from './types.ts';

const N = '';
const EAR = 'FABER (IN YOUR EAR)';
const both = (txt: string) => [{ who: 'FABER', text: txt }, { who: N, text: 'Think again.' }];

export const SCRIPTS4: Record<string, Script> = {
  lw_1: { lines: [
    { who: 'BEATTY', text: "Well, Montag. You flew too close, and now you're surprised the wings burn. Didn't I hint enough when I sent the Hound around?" },
    { who: 'BEATTY', text: "And you weren't fooled by that girl next door, were you? Flowers, leaves, the moon. It's all in her file." },
    { who: 'MONTAG', text: 'She never hurt anyone. She just looked at things.' },
  ] },
  lw_2: { lines: [
    { who: 'MONTAG', text: "Mildred! ...You didn't. You didn't turn in the alarm." },
    { who: N, text: "She doesn't look at you. A taxi takes her away, fast, down the long street." },
    { who: 'BEATTY', text: 'Your house, Montag. Your clean-up. Not with kerosene. With the flame thrower.' },
    { who: EAR, text: 'Montag? Can you run?' },
    { who: 'MONTAG', text: "The Hound's out there somewhere. I can't." },
  ] },
  h5_open: { lines: [
    { who: N, text: 'The books lie spilled across the floor where Mildred left them.' },
    { who: 'BEATTY', text: '(from the doorway) All of it, Montag.' },
  ] },
  h5_out: { lines: [{ who: N, text: 'The walls hiss and go dark one by one. The house begins to shudder.' }] },
  h5_out_locked: { lines: [{ who: 'BEATTY', text: '(from the doorway) Not finished, Montag.' }] },

  lw_arrest: { lines: [
    { who: 'BEATTY', text: "When you're quite finished: you're under arrest." },
    { who: N, text: "Beatty strikes you across the head. The green bullet falls out of your ear onto the grass. He picks it up, smiling." },
    { who: 'BEATTY', text: "Well, well. A friend. We'll trace this and drop in on him." },
    { who: 'MONTAG', text: 'No.' },
    { who: 'BEATTY', text: 'Look at you. Point a gun at a man so he has to listen to your speech. Go on, then. Quote something at me.' },
  ], choices: [
    { text: '"Leave him alone."', set: { 'c10.words': 'leave' } },
    { text: '"You wanted this. Didn\'t you?"', set: { 'c10.words': 'wanted' } },
    { text: 'Say nothing.', set: { 'c10.words': 'silent' } },
  ] },
  lw_after: { set: { 'c10.beatty': true }, lines: [
    { who: N, text: 'When you can see again, the grass is burning and Captain Beatty is gone.' },
    { who: N, text: 'The other two firemen lie stunned on the lawn.' },
  ] },
  lw_hound: { lines: [{ who: N, text: 'Something drifts across the lawn like a cloud of grey smoke, without a sound. The Mechanical Hound.' }] },
  lw_miss: { lines: [{ who: N, text: 'Too late. It veers off, circles, and comes again.' }] },
  lw_hound2: { set: { 'c10.hound': true }, lines: [
    { who: N, text: 'Fire catches the Hound in mid-leap. Its needle stabs your leg as it falls apart in the air.' },
    { who: N, text: 'Your leg goes numb. Lights are coming on down the street.' },
    { who: N, text: 'Later you will understand it: Beatty wanted this. He stood there, joking, needling, until you did it.' },
  ] },
  lw_books: { set: { 'ch4.books': true }, lines: [{ who: N, text: 'By the back fence, four books Mildred missed. You take them.' }] },
  lw_run_locked: { lines: [{ who: N, text: 'The books by the back fence. Take them.' }] },

  // ---- 11 The Boulevard ----
  bv_open: { lines: [
    { who: 'SEASHELL RADIO', text: 'Police alert. Wanted: Guy Montag, fireman. Watch for a man alone, on foot.' },
    { who: N, text: 'Ten lanes of empty road under white arc lamps. A police beetle sweeps its lights up and down.' },
  ] },
  bv_kids: { set: { 'c11.kids': true }, lines: [
    { who: N, text: 'Headlights swing at you out of nowhere, faster, faster. Laughter.' },
    { who: N, text: 'You fall flat. The car swerves at the last moment and is gone. Kids, out for a night of it.' },
    { who: 'MONTAG', text: 'They would have killed me. For nothing at all.' },
    { who: N, text: 'You wonder, suddenly, whether it was a car like that one. Clarisse.' },
  ] },
  bv_cross: { set: { 'c11.crossed': true }, lines: [{ who: N, text: 'The far curb. You breathe.' }] },
  bv_black: { lines: [
    { who: N, text: "Fireman Black's house. Dark. His wife asleep inside." },
  ], choices: [
    { text: 'Hide the books in the kitchen. Phone in the alarm.', set: { 'c11.choice': 'plant', 'c11.plant': true }, reply: [
      { who: N, text: 'You leave the books, find a phone booth, and call it in. Far off, the sirens start.' }] },
    { text: 'Walk on.', set: { 'c11.choice': 'walk' }, reply: [{ who: N, text: 'You keep the books, and keep walking.' }] },
  ] },
  bv_locked: { lines: [{ who: N, text: 'Not yet.' }] },

  // ---- 12 Faber's sprinklers / the count of ten ----
  fb2_open: { lines: [
    { who: 'FABER', text: 'Montag! I heard the Captain, and then nothing. I thought you were dead.' },
    { who: 'MONTAG', text: "Beatty's dead. I did it. I can't stay." },
    { who: N, text: 'Faber switches on a television the size of a postcard, hidden behind a picture.' },
    { who: 'ANNOUNCER', text: 'A new Mechanical Hound has been flown in. It has never failed. We follow it live, by helicopter.' },
  ] },
  m1: { lines: [{ who: 'FABER', text: 'Tell me what to do. Quickly.' }], choices: [
    { text: 'Hide me in your cellar.', again: true, reply: both('It would find you in a minute, and me with you.') },
    { text: 'When I go, burn what I touched. Wipe the doorknobs.', next: 'm2' },
    { text: "I'll turn myself in.", again: true, reply: both('No. Not after all this.') },
  ] },
  m2: { lines: [{ who: 'FABER', text: 'Yes. And then?' }], choices: [
    { text: 'Shut the windows and wait.', again: true, reply: both("It doesn't need windows.") },
    { text: 'Leave the lights on so it looks normal.', again: true, reply: both('It follows your smell, not the lights.') },
    { text: 'Turn on your sprinklers, full. Wash the walks.', next: 'm3' },
  ] },
  m3: { lines: [{ who: 'FABER', text: 'And you? It knows your scent.' }], choices: [
    { text: 'Give me your oldest clothes. And the whiskey.', next: 'm4' },
    { text: 'Lend me your car.', again: true, reply: both('Cars are tracked. On foot. To the river.') },
    { text: 'Give me another earpiece.', again: true, reply: both('I only made the one. I am sorry.') },
  ] },
  m4: { set: { 'c12.mask': true }, lines: [
    { who: 'FABER', text: "I'm taking the five o'clock bus to St. Louis. A printer there. If we both live, write to me." },
    { who: 'FABER', text: 'Go. The river first, then the old railroad tracks. Go!' },
  ] },
  fb2_locked: { lines: [{ who: 'FABER', text: 'Wait! Not yet. Tell me what to do first.' }] },
  rn_open: { lines: [
    { who: N, text: 'In every lit window, the parlor walls show the same thing: the Hound, running.' },
    { who: 'SEASHELL RADIO', text: 'Everyone in the Elm Terrace area: on the count of ten, open your front door and look out. He cannot hide if everyone looks.' },
  ] },
  rn_river: { set: { 'c12.river': true }, lines: [
    { who: N, text: 'The river. Cold and black and moving.' },
    { who: N, text: "You scrub yourself with the whiskey, change into Faber's old clothes, and walk out until there is no bottom." },
  ] },
};

export const ROOMS4: Record<string, RoomDef> = {
  lawn: {
    id: 'lawn', chapter: 4, label: '', width: 1900, spawnX: 640, kit: 'street:lawn',
    npcs: [
      { id: 'beatty', fig: 'beatty', name: 'BEATTY', x: 520, face: 1 },
      { id: 'mildred', fig: 'mildred', name: 'MILDRED', x: 960, face: -1, when: (f) => !f['lw.gone'] },
      { id: 'black', fig: 'fireman', name: 'BLACK', x: 300, face: 1, back: true },
    ],
    objective: () => 'Go into your house',
    enter: [{ key: 'e.lawn', steps: [
      { title: 'CHAPTER FOUR', sub: 'Burning Bright' }, { say: 'lw_1' }, { npc: 'mildred', x: 160, ms: 2600 },
      { set: { 'lw.gone': true } }, { say: 'lw_2' },
    ] }],
    hotspots: [{ id: 'door', x: 950, label: 'Go in with the flame thrower', required: true, exit: { room: 'home5', x: 1500 } }],
  },

  home5: {
    id: 'home5', chapter: 4, label: '', width: 2600, spawnX: 1500, kit: 'home',
    objective: (f) => {
      const w = ['c10.w1', 'c10.w2', 'c10.w3'].filter((k) => f[k]).length;
      return w < 3 || !f['c10.beds'] ? `Burn it all: the beds ${f['c10.beds'] ? 1 : 0}/1, the parlor walls ${w}/3` : 'Go back outside';
    },
    enter: [{ key: 'e.home5', steps: [{ say: 'h5_open' }] }],
    hotspots: [
      { id: 'beds', x: 900, label: 'Burn the beds', required: true, hold: { flag: 'c10.beds', ms: 1300, fx: 'flame' } },
      { id: 'w1', x: 1660, label: 'Burn the wall', py: 330, required: true, hold: { flag: 'c10.w1', ms: 1300, fx: 'flame' } },
      { id: 'w2', x: 1980, label: 'Burn the wall', py: 330, required: true, hold: { flag: 'c10.w2', ms: 1300, fx: 'flame' } },
      { id: 'w3', x: 2300, label: 'Burn the wall', py: 330, required: true, hold: { flag: 'c10.w3', ms: 1300, fx: 'flame' } },
      { id: 'out', x: 140, label: 'Go back outside', required: true, requires: ['c10.beds', 'c10.w1', 'c10.w2', 'c10.w3'], lockedScript: 'h5_out_locked',
        script: 'h5_out', exit: { room: 'lawn2', x: 900 } },
    ],
  },

  lawn2: {
    id: 'lawn2', chapter: 4, label: '', width: 1900, spawnX: 900, kit: 'street:lawn', limp: true,
    npcs: [
      { id: 'beatty', fig: 'beatty', name: 'BEATTY', x: 760, face: 1, when: (f) => !f['c10.beatty'] },
      { id: 'black', fig: 'fireman', name: 'BLACK', x: 560, face: 1, back: true },
      { id: 'stoneman', fig: 'fireman', name: 'STONEMAN', x: 640, face: 1, back: true },
    ],
    objective: (f) => !f['ch4.books'] ? 'Take the books by the back fence' : 'Run. The alley, to the left',
    enter: [{ key: 'e.lawn2', steps: [
      { say: 'lw_arrest' }, { wait: 300 },
      { flash: 0xffffff, ms: 900 }, { fade: 'out', ms: 250 }, { npc: 'beatty', show: false }, { wait: 1100 }, { fade: 'in', ms: 900 },
      { say: 'lw_after' }, { say: 'lw_hound' }, { fx: 'houndLeap' }, { prompt: 'PRESS [E]  ·  FIRE', ms: 1800, miss: 'lw_miss' }, { fx: 'houndBurn' }, { flash: 0xff8040, ms: 400 },
      { say: 'lw_hound2' },
    ] }],
    hotspots: [
      { id: 'books', x: 1420, label: 'The books by the fence', required: true, when: (f) => !f['ch4.books'], script: 'lw_books' },
      { id: 'run', x: 120, label: 'Run down the alley', required: true, requires: ['ch4.books'], lockedScript: 'lw_run_locked', exit: { room: 'boulevard', x: 150 } },
    ],
  },

  boulevard: {
    id: 'boulevard', chapter: 4, label: '', width: 2200, spawnX: 150, kit: 'street:boulevard', limp: true,
    // One shared rhythm: each lane lights 0.6 s after the one before it, a wave moving the way you walk.
    // Caught = back to the island just before that lane, not the kerb.
    hazards: [620, 820, 1020, 1220, 1420].map((x, i) => ({
      id: 'lane' + i, from: x, to: x + 90, width: 110, period: 3600, pulse: 1000, phase: -i * 0.165,
      look: 'headlights' as const, reset: x - 48, when: (f: Record<string, boolean | string>) => !f['c11.crossed'],
    })),
    objective: (f) => !f['c11.crossed'] ? 'Cross the boulevard. Wait in the gaps between the passing cars' : !f['c11.choice'] ? "Fireman Black's house" : 'Keep going to Faber',
    enter: [{ key: 'e.boulevard', steps: [{ say: 'bv_open' }] }],
    hotspots: [
      { id: 'kids', x: 965, label: '', auto: true, when: (f) => !f['c11.kids'], steps: [{ flash: 0xfff0d0, ms: 300 }, { fx: 'fall' }, { say: 'bv_kids' }] },
      { id: 'curb', x: 1640, label: '', auto: true, when: (f) => !f['c11.crossed'], script: 'bv_cross' },
      { id: 'black', x: 1900, label: "Black's house", required: true, when: (f) => !f['c11.choice'], requires: ['c11.crossed'], lockedScript: 'bv_locked', script: 'bv_black' },
      { id: 'on', x: 2140, label: "On to Faber's", required: true, requires: ['c11.choice'], lockedScript: 'bv_locked', exit: { room: 'faber2', x: 220 } },
    ],
  },

  faber2: {
    id: 'faber2', chapter: 4, label: '', width: 1500, spawnX: 220, kit: 'faber', limp: true,
    npcs: [{ id: 'faber', fig: 'faber', name: 'FABER', x: 640, face: -1 }],
    objective: (f) => !f['c12.mask'] ? 'Tell Faber how to hide your trail' : 'Out the back door, to the river',
    enter: [{ key: 'e.faber2', steps: [{ fx: 'tvOn' }, { say: 'fb2_open' }] }],
    hotspots: [
      { id: 'faber', x: 640, label: 'Talk to Faber', required: true, when: (f) => !f['c12.mask'], script: 'm1' },
      { id: 'back', x: 1400, label: 'The back door', required: true, requires: ['c12.mask'], lockedScript: 'fb2_locked', exit: { room: 'run', x: 150 } },
    ],
  },

  run: {
    id: 'run', chapter: 4, label: '', width: 2600, spawnX: 150, kit: 'street:alley', limp: true,
    timer: { ms: 34000, reset: 150, label: 'THE COUNT', when: (f) => !!f['e.run'] && !f['c12.river'] },
    hazards: [
      // Doors open and searchlights pass on one readable beat; caught = back to the last safe gap.
      ...[520, 900, 1280, 1660, 2040].map((x, i) => ({
        id: 'door' + i, from: x, to: x + 70, width: 90, period: 3400, pulse: 1000, phase: -i * 0.2,
        look: 'doorlight' as const, reset: x - 48, when: (f: Record<string, boolean | string>) => !f['c12.river'],
      })),
      ...[700, 1450, 2200].map((x, i) => ({
        id: 'heli' + i, from: x, to: x + 100, width: 130, period: 4000, pulse: 1200, phase: -0.1 - i * 0.3,
        look: 'searchlight' as const, reset: x - 48, when: (f: Record<string, boolean | string>) => !f['c12.river'],
      })),
    ],
    objective: (f) => !f['c12.river'] ? 'Reach the river before the count reaches ten. Avoid the lit doorways and searchlights' : '',
    enter: [{ key: 'e.run', steps: [{ say: 'rn_open' }] }],
    hotspots: [
      { id: 'river', x: 2480, label: '', auto: true, when: (f) => !f['c12.river'], script: 'rn_river', steps: [{ fade: 'out', ms: 1100 }, { goto: 'river', x: 200 }] },
    ],
  },
};
