// Chapter 4 — Burning Bright (Part Three, first half). Montag's house; Beatty's death as a brief, non-graphic cut;
// the Hound; the boulevard; Faber's sprinklers; the count of ten.
import type { RoomDef, Script } from './types.ts';

const N = '';
const EAR = 'FABER (IN YOUR EAR)';
const both = (txt: string) => [{ who: 'FABER', text: txt + ' Think again.' }];

export const SCRIPTS4: Record<string, Script> = {
  lw_1: { lines: [
    { who: 'BEATTY', text: "Ah, Montag. Fly too near the sun and then act amazed at the wings. I sent the Hound round as a hint, you know. Subtlety was never your gift." },
    { who: 'BEATTY', text: "And that girl next door didn't fool you either. Flowers, leaves, the moon. It's all in her file; I could recite it." },
    { who: 'MONTAG', text: 'She never hurt anyone. She looked at things.' },
  ] },
  lw_2: { lines: [
    { who: 'MONTAG', text: "Mildred! ...You didn't. You turned in the alarm." },
    { who: N, text: "Mildred doesn't look back. A taxi takes her down the long street, a suitcase on her knees." },
    { who: 'BEATTY', text: 'Your house, Montag. Your clean-up. Not kerosene. The flame thrower.' },
    { who: EAR, text: 'Montag? Can you run?' },
    { who: 'MONTAG', text: 'Not with the Hound out there.' },
  ] },
  h5_open: { lines: [
    { who: N, text: 'The books lie spilled across the floor where Mildred left them.' },
    { who: 'BEATTY', text: '(from the doorway) All of it, Montag.' },
  ] },
  h5_out: { lines: [{ who: N, text: 'The walls hiss out one by one. A picture drops off its nail.' }] },
  h5_out_locked: { lines: [{ who: 'BEATTY', text: '(from the doorway) The beds and every parlor wall first, Montag.' }] },

  lw_cb_ask: { lines: [{ who: 'BEATTY', text: 'You asked me once why I read them. Now you know. So I would be ready for a night like this one.' }] },
  lw_cb_book: { lines: [{ who: 'BEATTY', text: "Your wife turned in the alarm, you know. After her friends and that book, she didn't wait long." }] },
  lw_arrest: { lines: [
    { who: 'BEATTY', text: "Finished? You're under arrest." },
    { who: N, text: 'The blow lands on your ear. The green bullet drops into the grass, and Beatty picks it up, smiling.' },
    { who: 'BEATTY', text: "Well. A friend. We'll trace it and call on him." },
    { who: 'MONTAG', text: 'No.' },
    { who: 'BEATTY', text: 'Look at you. A weapon in your hand so a man will hear you out. Go on, then. Belch some Shakespeare at me.' },
  ], choices: [
    { text: '"Leave him alone."', set: { 'c10.words': 'leave' } },
    { text: '"You wanted this. Didn\'t you?"', set: { 'c10.words': 'wanted' } },
    { text: 'Say nothing.', set: { 'c10.words': 'silent' } },
  ] },
  lw_trig: { sub: true, lines: [
    { who: 'BEATTY', text: 'Go on. Pull the trigger.' },
    { who: 'MONTAG', text: 'We never burned right.' },
  ] },
  lw_hand: { sub: true, lines: [{ who: 'BEATTY', text: 'Hand it over, Guy.' }] },
  lw_shut: { sub: true, lines: [{ who: N, text: 'You shut your eyes and shout, and the shouting does not cover the sound.' }] },
  lw_turn: { sub: true, lines: [{ who: 'MONTAG', text: 'Turn around.' }] },
  lw_after: { set: { 'c10.beatty': true }, lines: [
    { who: N, text: 'When your eyes clear, the grass is still burning where he lay. Black and Stoneman have not moved.' },
  ] },
  lw_hound: { lines: [{ who: N, text: 'The Hound is crossing the lawn. It makes no sound at all.' }] },
  lw_miss: { lines: [{ who: N, text: 'Too late. It veers off, circles, and comes again.' }] },
  lw_needle: { lines: [{ who: N, text: "The needle grazes your thigh. Cold, like a coin pressed there. It is already turning for another pass." }] },
  lw_hound2: { set: { 'c10.hound': true }, lines: [
    { who: N, text: 'Fire catches the Hound mid-leap. The needle gets your leg as it comes apart in the air.' },
    { who: N, text: 'Your leg goes numb. Lights are coming on down the street.' },
  ] },
  lw_books: { set: { 'ch4.books': true }, lines: [{ who: N, text: 'Four books in the bushes by the back fence, missed. You take them.' }] },
  lw_run_locked: { lines: [{ who: N, text: "You won't leave without them. The books are by the back fence." }] },

  // ---- 11 The Boulevard ----
  bv_open: { lines: [
    { who: 'SEASHELL RADIO', text: 'Police alert. Wanted: Guy Montag, fireman. Watch for a man alone, on foot.' },
    { who: N, text: 'Ten lanes of empty road under arc lamps. Somewhere a police beetle is idling.' },
  ] },
  bv_kids: { set: { 'c11.kids': true }, lines: [
    { who: N, text: 'Headlights, from nowhere, climbing. Laughter inside. You drop flat; the car swerves at the last second and howls off.' },
    { who: 'MONTAG', text: "They'd have killed me. For fun." },
    { who: N, text: 'Clarisse, you think. Four days. A car.' },
  ] },
  bv_cross: { set: { 'c11.crossed': true }, lines: [{ who: N, text: 'The far curb. Your knees are shaking.' }] },
  bv_black: { lines: [
    { who: N, text: "Fireman Black's house. Dark. His wife asleep inside." },
  ], choices: [
    { text: 'Hide the books in the kitchen. Phone in the alarm.', set: { 'c11.choice': 'plant', 'c11.plant': true }, reply: [
      { who: N, text: 'The books stay in the kitchen. From the booth on the corner you give the address. Far off, sirens.' }] },
    { text: 'Walk on.', set: { 'c11.choice': 'walk' }, reply: [{ who: N, text: 'You keep the books, and keep walking.' }] },
  ] },
  bv_locked: { lines: [{ who: N, text: "Cross the boulevard first. Black's house is on the far side." }] },
  bv_on_locked: { lines: [{ who: N, text: "Not yet. Decide what to do at Black's house first." }] },

  // ---- 12 Faber's sprinklers / the count of ten ----
  fb2_open: { lines: [
    { who: 'FABER', text: 'Montag! I heard the Captain in my ear and then nothing. I thought you were dead.' },
    { who: 'MONTAG', text: "Beatty's dead. I did it. I can't stay." },
    { who: N, text: 'Faber switches on a television the size of a postcard, hidden behind a picture.' },
    { who: 'ANNOUNCER', text: 'A new Mechanical Hound has been flown in. It has never failed. We follow it live, by helicopter.' },
  ] },
  m1: { lines: [{ who: 'FABER', text: 'Quickly. What do we do first?' }], choices: [
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
    { who: 'FABER', text: "I'm taking the five o'clock bus to St. Louis. There's a printer there. If we both live, write to me." },
    { who: 'FABER', text: 'Go. The river first, then the old railroad tracks. Go!' },
  ] },
  fb2_locked: { lines: [{ who: 'FABER', text: 'Wait! First, how will you hide your trail?' }] },
  rn_open: { lines: [
    { who: N, text: 'In every lit window, the parlor walls show the same thing: the Hound, running.' },
    { who: 'SEASHELL RADIO', text: 'Elm Terrace residents: on the count of ten, open your front door and look out. He cannot hide if everyone looks.' },
  ] },
  rn_caught: { lines: [
    { who: N, text: 'Ten. Every door on the street opens at once, and a hundred faces look out.' },
    { who: 'SEASHELL RADIO', text: "There he is! Lock on! Don't let him leave the street." },
    { who: N, text: 'Hands in your coat. White, then nothing.' },
  ] },
  rn_river: { set: { 'c12.river': true }, lines: [
    { who: N, text: "The river is colder than anything you have touched. Whiskey on your neck and arms, Faber's old clothes, and you walk in until your feet stop finding the bottom." },
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
    quietUi: true,
    objective: () => 'Go into your house',
    hints: () => ['Your house is right here on the lawn.', 'The front door is just to your right.', 'Walk right to the door and press [E] to go in with the flame thrower.'],
    enter: [{ key: 'e.lawn', steps: [
      { title: 'CHAPTER FOUR', sub: 'Burning Bright' }, { say: 'lw_1' }, { npc: 'mildred', x: 160, ms: 2600 },
      { set: { 'lw.gone': true } }, { say: 'lw_2' },
    ] }],
    hotspots: [{ id: 'door', x: 950, label: 'Go in with the flame thrower', required: true, exit: { room: 'home5', x: 1500 } }],
  },

  home5: {
    id: 'home5', chapter: 4, label: '', width: 2600, spawnX: 1500, kit: 'home',
    quietUi: true,
    objective: (f) => {
      const walls = ['c10.w1', 'c10.w2', 'c10.w3'].some((k) => !f[k]);
      return walls || !f['c10.beds'] ? 'Burn the house' : 'Go back outside';
    },
    hints: (f) => {
      if (!f['c10.beds']) return ['The house has to burn, room by room. Start with the beds.', 'The beds are toward the left side of the room.', 'Walk left to the beds and hold [E] until they catch fire.'];
      if (!f['c10.w1'] || !f['c10.w2'] || !f['c10.w3']) return ['The beds are burning. The parlor walls are next.', 'The walls are on the right, one after another.', 'Stand at the nearest wall that is not burning yet and hold [E] until it catches.'];
      return ['The house is burning. Get out.', 'The front door is at the far left.', 'Walk all the way left and press [E] to go back outside.'];
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
    quietUi: true,
    objective: (f) => !f['ch4.books'] ? 'Take the books by the back fence' : 'Run down the alley',
    hints: (f) => !f['ch4.books']
      ? ['The last books are out here, by the back fence.', 'They are past the garden fence, to the right.', 'Press [E] at the fence to hop it, then press [E] at the books.']
      : ['You have the books. Get clear of the street.', 'The alley is at the far left of the street.', 'Walk all the way left and press [E] to run down the alley.'],
    enter: [{ key: 'e.lawn2', steps: [
      { if: (f) => f['c09.book'] === 'outburst', then: [{ say: 'lw_cb_book' }] },
      { say: 'lw_arrest' }, { if: (f) => f['st.reply'] === 'ask', then: [{ say: 'lw_cb_ask' }] }, { wait: 300 },
      // the novel's death scene: letterbox, the nozzle comes up, Beatty steps in, is burned, falls; then the other two
      { fx: 'closeIn' }, { cam: 830, ms: 800 }, { walk: 890, ms: 200 }, { pose: 'montag', p: 'hose' }, { wait: 500 },
      { say: 'lw_trig' }, { npc: 'beatty', x: 815, ms: 700 }, { wait: 350 }, { say: 'lw_hand' }, { wait: 700 },
      { fx: 'beattyBurn' }, { wait: 2600 }, { say: 'lw_shut' }, { pose: 'montag' }, { wait: 400 },
      { say: 'lw_turn' }, { pose: 'montag', p: 'hose' }, { fx: 'firemenDown' }, { wait: 900 }, { pose: 'montag' }, { fx: 'closeOut' }, { follow: true },
      { fade: 'out', ms: 600 }, { npc: 'beatty', show: false }, { wait: 900 }, { fade: 'in', ms: 900 },
      { say: 'lw_after' }, { say: 'lw_hound' }, { fx: 'houndLeap' }, { prompt: 'PRESS [E]  ·  FIRE', ms: 1800, miss: 'lw_miss', strike: 'lw_needle' }, { fx: 'houndBurn' }, { flash: 0xff8040, ms: 400 },
      { say: 'lw_hound2' },
    ] }],
    hotspots: [
      { id: 'fence', x: 1190, label: 'Vault the garden fence', vault: true },
      { id: 'books', x: 1420, label: 'The books by the fence', required: true, when: (f) => !f['ch4.books'], script: 'lw_books' },
      { id: 'run', x: 120, label: 'Run down the alley', required: true, requires: ['ch4.books'], lockedScript: 'lw_run_locked', exit: { room: 'boulevard', x: 150 } },
    ],
  },

  boulevard: {
    id: 'boulevard', chapter: 4, label: '', width: 2200, spawnX: 150, kit: 'street:boulevard', limp: true,
    // One shared rhythm: each lane lights 0.6 s after the one before it, a wave moving the way you walk. A car is lit for 1.3 s,
    // dark for 2 s (a crossing takes under 1 s); the glare builds for 1.2 s first. A hit cuts to black and sends you back to the near kerb.
    hazards: [620, 820, 1020, 1220, 1420].map((x, i) => ({
      id: 'lane' + i, from: x, to: x + 90, width: 110, period: 3300, pulse: 1300, phase: -i * 0.18,
      look: 'headlights' as const, reset: 572, when: (f: Record<string, boolean | string>) => !f['c11.crossed'],
    })),
    quietUi: true,
    objective: (f) => !f['c11.crossed'] ? 'Cross the boulevard' : !f['c11.choice'] ? "Go to Black's house" : "Go on to Faber's",
    barks: [{ x: 520, range: 90, who: 'MONTAG', text: 'Wait for each car to pass before you step out.', when: (f) => !f['c11.crossed'] }],
    hints: (f) => {
      if (!f['c11.crossed']) return ['Cars pass in waves, one lane at a time.', 'Wait on the island until the lane in front of you is clear.', 'Step out only when the lane ahead is dark, then wait on the next island.'];
      if (!f['c11.choice']) return ['You are across. Black lives in one of these houses.', "Black's house is ahead on the right.", "Walk right to Black's house and press [E] to decide what to do."];
      return ['Keep moving. Faber is waiting.', "The road to Faber's street is at the far right.", 'Walk all the way right and press [E] at the end of the road.'];
    },
    enter: [{ key: 'e.boulevard', steps: [{ say: 'bv_open' }] }],
    hotspots: [
      { id: 'kids', x: 965, label: '', auto: true, when: (f) => !f['c11.kids'], steps: [{ flash: 0xfff0d0, ms: 300 }, { fx: 'fall' }, { say: 'bv_kids' }] },
      { id: 'curb', x: 1640, label: '', auto: true, when: (f) => !f['c11.crossed'], script: 'bv_cross' },
      { id: 'black', x: 1900, label: "Black's house", required: true, when: (f) => !f['c11.choice'], requires: ['c11.crossed'], lockedScript: 'bv_locked', script: 'bv_black' },
      { id: 'on', x: 2140, label: "On to Faber's", required: true, requires: ['c11.choice'], lockedScript: 'bv_on_locked', exit: { room: 'faber2', x: 220 } },
    ],
  },

  faber2: {
    id: 'faber2', chapter: 4, label: '', width: 1500, spawnX: 220, kit: 'faber', limp: true,
    npcs: [{ id: 'faber', fig: 'faber', name: 'FABER', x: 640, face: -1 }],
    quietUi: true,
    objective: (f) => !f['c12.mask'] ? 'Ask Faber how to hide your trail' : 'Leave by the back door',
    hints: (f) => !f['c12.mask']
      ? ['Faber has a plan. Ask him how to cover your trail.', 'Faber is in the middle of the room.', 'Walk to Faber and press [E]. Cover your trail: burn what you touched, wash the walks, take his old clothes.']
      : ['The plan is set. Get moving before the Hound finds your scent.', 'The back door is at the right side of the room.', 'Walk right to the back door and press [E]. Then run for the river.'],
    enter: [{ key: 'e.faber2', steps: [{ fx: 'tvOn' }, { say: 'fb2_open' }] }],
    hotspots: [
      { id: 'faber', x: 640, label: 'Talk to Faber', required: true, when: (f) => !f['c12.mask'], script: 'm1' },
      { id: 'back', x: 1400, label: 'The back door', required: true, requires: ['c12.mask'], lockedScript: 'fb2_locked', exit: { room: 'run', x: 150 } },
    ],
  },

  run: {
    id: 'run', chapter: 4, label: '', width: 2600, spawnX: 150, kit: 'street:alley', limp: true,
    timer: { ms: 34000, reset: 150, label: 'THE COUNT', when: (f) => !!f['e.run'] && !f['c12.river'], fail: [{ flash: 0xfff4d8, ms: 280 }, { say: 'rn_caught' }] },
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
    quietUi: true,
    objective: (f) => !f['c12.river'] ? 'Reach the river before the count ends' : 'Reach the river.',
    barks: [{ x: 430, range: 80, who: 'MONTAG', text: 'Lit doorway ahead. Wait for it to pass.', when: (f) => !f['c12.river'] }],
    hints: () => ['Keep moving. The count is running.', 'Stay in the dark gaps between the lit doorways and the searchlights.', 'Watch each light sweep. Run through a gap, and wait in the dark until a light passes.'],
    enter: [{ key: 'e.run', steps: [{ say: 'rn_open' }] }],
    hotspots: [
      { id: 'river', x: 2480, label: '', auto: true, when: (f) => !f['c12.river'], script: 'rn_river', steps: [{ fade: 'out', ms: 1100 }, { goto: 'river', x: 200 }] },
    ],
  },
};
