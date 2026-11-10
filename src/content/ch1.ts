// Chapter 1 — The Hearth and the Salamander. Montag is content; nothing here announces what comes later.
import type { RoomDef, Script } from './types.ts';

const N = '';

export const SCRIPTS1: Record<string, Script> = {
  // ---- 01 The Burn ----
  b_open: { lines: [
    { who: 'BEATTY', text: 'Porch first, Montag. Then the lawn. Spread it thick.' },
    { who: 'BLACK', text: 'Heads up below!' },
  ] },
  b_locked: { lines: [{ who: 'BEATTY', text: 'Every pile, Montag. A fire you have to light twice is a fire done wrong.' }] },
  b_ignite: { lines: [
    { who: 'BEATTY', text: 'Wet enough to swim in. Here.' },
    { who: N, text: 'Beatty holds out the igniter, the salamander on its disc catching the streetlight.' },
  ], choices: [
    { text: 'Take it. "My pleasure."', set: { 'c01.tone': 'eager', 'c01.lit': true }, reply: [{ who: 'BEATTY', text: "That's the spirit." }] },
    { text: '"Your fire, Captain."', set: { 'c01.tone': 'deferent', 'c01.lit': true }, reply: [{ who: 'BEATTY', text: 'No, no. You did the work. Go on.' }] },
  ] },
  b_after: { lines: [
    { who: N, text: 'The house goes up all at once, orange and black, roaring into the sky.' },
    { who: N, text: 'The heat pushes your face into a grin you can feel in your teeth.' },
    { who: 'STONEMAN', text: 'Pretty one tonight.' },
    { who: 'BEATTY', text: 'Clean. Back to the House, gentlemen.' },
  ] },

  // ---- firehouse, end of shift ----
  s1_time: { lines: [{ who: 'CEILING VOICE', text: 'One-oh-two A.M. One-oh-three A.M.' }] },
  s1_helmet: { set: { 's1.helmet': true }, lines: [{ who: N, text: 'You hang up the helmet and shine it until the numerals catch the lamplight.' }] },
  s1_hound: { lines: [{ who: N, text: 'The Hound lies folded in its kennel, humming softly. Asleep, and not asleep.' }] },
  s1_cards: { lines: [{ who: 'BLACK', text: 'Good fire tonight.' }, { who: 'STONEMAN', text: 'Night, Montag.' }] },
  s1_beatty: { lines: [{ who: 'BEATTY', text: 'Go home, Montag. Sleep. The city does its best burning in the dark.' }] },

  // ---- 02 Clarisse's Question ----
  c_meet: { set: { 'c02.meet': true }, lines: [
    { who: N, text: 'At the corner you slow down without knowing why. Leaves skate across the pavement.' },
    { who: N, text: 'A girl is standing there, very still, as if she has been waiting.' },
    { who: 'CLARISSE', text: "You're the fireman. I'm the new neighbor. Clarisse McClellan." },
    { who: 'MONTAG', text: "Guy Montag. You're out late." },
    { who: 'CLARISSE', text: 'I like walking at night. I could smell the kerosene on you before I saw you.' },
  ], choices: [
    { text: '"Smells like perfume to me."', set: { 'c02.k': 'perfume' }, reply: [{ who: 'CLARISSE', text: 'Does it? Really?' }, { who: 'MONTAG', text: 'Sure. Why not?' }] },
    { text: '"My wife says it never washes out."', set: { 'c02.k': 'wife' }, reply: [{ who: 'CLARISSE', text: "No. I don't suppose it does." }] },
  ] },
  c_moon: { lines: [
    { who: 'CLARISSE', text: 'Look. There\'s a man in the moon tonight. When did you last look?' },
  ], choices: [
    { text: 'Stop and look up', set: { 'c02.n1': 'look' }, reply: [{ who: 'MONTAG', text: '...Huh.' }, { who: 'CLARISSE', text: "He's always there. Hardly anyone checks." }] },
    { text: 'Keep walking', set: { 'c02.n1': 'walk' }, reply: [{ who: 'CLARISSE', text: "You didn't even look." }, { who: 'MONTAG', text: 'I know what the moon looks like.' }] },
  ] },
  c_dew: { lines: [
    { who: 'CLARISSE', text: 'Do you ever read the books you burn?' },
    { who: 'MONTAG', text: "That's against the law!" },
    { who: 'CLARISSE', text: 'Oh. Of course.' },
    { who: 'CLARISSE', text: 'There\'s dew on the grass in the mornings. Did you know that?' },
  ], choices: [
    { text: 'Stop and think about it', set: { 'c02.n2': 'look' }, reply: [{ who: N, text: "You can't remember whether you knew it or not. It annoys you." }] },
    { text: 'Laugh it off', set: { 'c02.n2': 'walk' }, reply: [{ who: 'CLARISSE', text: 'You laugh before you think. You answer before I finish asking.' }] },
  ] },
  c_signs: { lines: [
    { who: 'CLARISSE', text: 'Is it true firemen used to put fires out, a long time ago?' },
    { who: 'MONTAG', text: 'Houses have always been fireproof. Take my word for it.' },
    { who: 'CLARISSE', text: 'My uncle says the billboards out past town are two hundred feet long now. The cars go too fast for anything shorter.' },
  ], choices: [
    { text: 'Stop. Picture it.', set: { 'c02.n3': 'look' }, reply: [{ who: 'MONTAG', text: 'Two hundred feet.' }, { who: 'CLARISSE', text: 'So people can read them without slowing down.' }] },
    { text: 'Walk on', set: { 'c02.n3': 'walk' }, reply: [{ who: 'MONTAG', text: 'You think too many things.' }, { who: 'CLARISSE', text: 'Someone has to.' }] },
  ] },
  c_happy: { set: { 'c02.asked': true }, lines: [
    { who: N, text: 'Every light in her house is on. Voices inside, talking, laughing.' },
    { who: 'MONTAG', text: 'What do they talk about in there, this late?' },
    { who: 'CLARISSE', text: 'Good night!' },
    { who: N, text: 'She starts up the walk, then turns back, curious.' },
    { who: 'CLARISSE', text: 'Are you happy?' },
    { who: 'MONTAG', text: 'Am I what?' },
  ] },
  c_after: { lines: [{ who: N, text: 'She is already gone. The door closes softly.' }, { who: 'MONTAG', text: 'Happy. Of all the nonsense.' }] },

  // ---- home: the night (restrained, not playable) ----
  h_dark: { lines: [
    { who: N, text: 'The bedroom is dark and cold. You flick the igniter for a little light.' },
    { who: N, text: 'Mildred lies on her bed with her eyes open. The little radios hum in her ears.' },
    { who: N, text: 'Something small and glass rolls from under your foot. The bottle is empty.' },
  ] },
  h_call: { lines: [
    { who: 'MONTAG', text: 'Emergency hospital.' },
    { who: N, text: 'Two men come with their machines and their cigarettes, and are gone within the hour. They do nine or ten of these a night, they say.' },
  ] },

  // ---- 03 Parlor Walls ----
  m_w1: { set: { 'c03.w1': true }, lines: [{ who: N, text: 'On the first wall, a man and a woman shout at each other about something that happened before you tuned in.' }] },
  m_w2: { set: { 'c03.w2': true }, lines: [{ who: N, text: 'The second wall: an audience laughing on cue, the same laugh, again and again.' }] },
  m_w3: { set: { 'c03.w3': true }, lines: [{ who: N, text: 'The third wall: a family at dinner. They all turn and smile out into the room, waiting for someone to speak.' }] },
  m_t1: { set: { 'c03.t1': true }, lines: [
    { who: 'MONTAG', text: 'Millie. About last night.' },
    { who: 'MILDRED', text: "I'm starving. I don't know why. Did we have people over? I feel like I went to a party." },
    { who: 'MONTAG', text: '...A few people.' },
    { who: 'MILDRED', text: "I hope I didn't do anything silly." },
  ] },
  m_t2: { set: { 'c03.t2': true }, lines: [
    { who: 'MONTAG', text: 'The bottle was empty, Millie. All of the pills.' },
    { who: 'MILDRED', text: "I wouldn't do a thing like that. Why would I?" },
    { who: 'THE WALL', text: 'What do you think, Helen?' },
    { who: 'MILDRED', text: "I think that's fine!" },
  ] },
  m_t3: { set: { 'c03.t3': true }, lines: [
    { who: 'MILDRED', text: "They mailed me a part this morning. The play has one role left out, and I'm the role. Isn't that fun, Guy?" },
    { who: 'MONTAG', text: "What's it about?" },
    { who: 'MILDRED', text: 'I just told you. There are these people.' },
    { who: 'MILDRED', text: "If we had the fourth wall, it'd be like this room wasn't ours at all." },
  ] },
  m_done: { lines: [{ who: 'MILDRED', text: "Shh. My line's coming up." }] },
  m_script: { set: { 'c03.script': true }, lines: [
    { who: N, text: "You pick up her script and turn to the last page." },
    { who: 'MONTAG', text: 'Does it have a happy ending?' },
    { who: 'MILDRED', text: "I haven't read that far." },
  ] },
  m_leave: { lines: [{ who: N, text: 'You fold the script, hand it back, and go out into the rain.' }] },
};

const pile = (n: number, x: number) => ({
  id: `pile${n}`, x, label: 'Soak the books', py: 330, required: true,
  hold: { flag: `c01.p${n}`, ms: 1500, fx: 'hose' as const, target: x },
});

export const ROOMS1: Record<string, RoomDef> = {
  burn: {
    id: 'burn', chapter: 1, label: '', width: 1900, spawnX: 640, kit: 'street:burn',
    npcs: [
      { id: 'beatty', fig: 'beatty', name: 'BEATTY', x: 520, face: 1 },
      { id: 'black', fig: 'fireman', name: 'BLACK', x: 1450, face: -1, back: true },
      { id: 'stoneman', fig: 'fireman', name: 'STONEMAN', x: 1620, face: -1, back: true },
    ],
    objective: (f) => {
      const n = ['c01.p1', 'c01.p2', 'c01.p3'].filter((k) => f[k]).length;
      return n === 0 ? 'Move right. Hold E at each book pile (0/3)' : n < 3 ? `Soak the book piles with kerosene (${n}/3)` : f['c01.lit'] ? '' : 'Take the igniter from Captain Beatty';
    },
    enter: [{ key: 'e.burn', steps: [{ title: 'PART ONE', sub: 'The Hearth and the Salamander' }, { say: 'b_open' }] }],
    hotspots: [
      pile(1, 900), pile(2, 1060), pile(3, 1220),
      { id: 'ignite', x: 600, label: 'Captain Beatty', required: true, requires: ['c01.p1', 'c01.p2', 'c01.p3'], lockedScript: 'b_locked',
        script: 'b_ignite', doneFlag: 'c01.lit', doneScript: 'b_after',
        steps: [{ fx: 'ignite' }, { cam: 1060, ms: 1500 }, { say: 'b_after' }, { title: 'FAHRENHEIT 451' }, { wait: 800 }, { goto: 'station1' }] },
    ],
  },

  station1: {
    id: 'station1', chapter: 1, label: '', width: 2400, spawnX: 316, kit: 'station',
    npcs: [
      { id: 'beatty', fig: 'beatty', name: 'BEATTY', x: 1290, face: -1 },
      { id: 'black', fig: 'fireman', name: 'BLACK', x: 1060, face: 1, back: true },
      { id: 'stoneman', fig: 'fireman', name: 'STONEMAN', x: 1170, face: -1, back: true },
    ],
    objective: () => 'Head home through the bay door',
    enter: [{ key: 'e.station1', steps: [{ fx: 'poleSlide' }, { say: 's1_time' }] }],
    hotspots: [
      { id: 'rack', x: 620, label: 'Hang up your helmet', script: 's1_helmet', doneFlag: 's1.helmet', doneScript: 's1_helmet' },
      { id: 'cards', x: 1110, label: 'The card table', script: 's1_cards' },
      { id: 'beatty', x: 1290, label: 'Captain Beatty', script: 's1_beatty' },
      { id: 'hound', x: 1770, label: 'The kennel', script: 's1_hound' },
      { id: 'out', x: 2250, label: 'Walk home', required: true, exit: { room: 'corner' } },
    ],
  },

  corner: {
    id: 'corner', chapter: 1, label: '', width: 2300, spawnX: 160, kit: 'street:corner',
    npcs: [{ id: 'clarisse', fig: 'clarisse', name: 'CLARISSE', x: 760, face: -1, when: (f) => !!f['c02.meet'] && !f['c02.gone'], follow: (f) => !!f['c02.meet'] && !f['c02.asked'] }],
    objective: (f) => !f['c02.meet'] ? 'Walk home' : !f['c02.asked'] ? 'Walk home with Clarisse' : 'Go inside',
    hotspots: [
      { id: 'meet', x: 640, label: '', auto: true, when: (f) => !f['c02.meet'], steps: [], script: 'c_meet' },
      { id: 'moon', x: 1000, label: '', auto: true, when: (f) => !!f['c02.meet'] && !f['c02.n1'], script: 'c_moon' },
      { id: 'dew', x: 1380, label: '', auto: true, when: (f) => !!f['c02.n1'] && !f['c02.n2'], script: 'c_dew' },
      { id: 'signs', x: 1760, label: '', auto: true, when: (f) => !!f['c02.n2'] && !f['c02.n3'], script: 'c_signs' },
      { id: 'house', x: 2020, label: '', auto: true, when: (f) => !!f['c02.n3'] && !f['c02.asked'], script: 'c_happy',
        steps: [{ npc: 'clarisse', x: 2140, ms: 700 }, { npc: 'clarisse', show: false }, { set: { 'c02.gone': true } }, { say: 'c_after' }] },
      { id: 'home', x: 2240, label: 'Go home', required: true, requires: ['c02.asked'], exit: { room: 'home1', x: 200 } },
    ],
  },

  home1: {
    id: 'home1', chapter: 1, label: '', width: 2600, spawnX: 200, kit: 'home',
    dark: (f) => !f['h1.day'],
    npcs: [{ id: 'mildred', fig: 'mildred', name: 'MILDRED', x: 1830, face: 1, when: (f) => !!f['h1.day'] }],
    objective: (f) => {
      if (!f['h1.day']) return '';
      const w = ['c03.w1', 'c03.w2', 'c03.w3'].filter((k) => f[k]).length;
      const t = ['c03.t1', 'c03.t2', 'c03.t3'].filter((k) => f[k]).length;
      if (w < 3 || t < 3 || !f['c03.script']) return `Get through to Mildred: walls ${w}/3 · talk ${t}/3 · her script ${f['c03.script'] ? '1' : '0'}/1`;
      return 'Leave for the firehouse';
    },
    enter: [{ key: 'e.home1', steps: [
      { walk: 330, ms: 900 }, { cam: 400, ms: 900 }, { wait: 500 }, { follow: true },
      { walk: 860, ms: 2400 }, { fx: 'dark' }, { say: 'h_dark' }, { fx: 'jets' }, { say: 'h_call' },
      { fade: 'out', ms: 900 }, { set: { 'h1.day': true } }, { fx: 'light' }, { walk: 1500, ms: 10 }, { fade: 'in', ms: 600 },
      { title: 'THE NEXT AFTERNOON' },
    ] }],
    hotspots: [
      { id: 'w1', x: 1660, label: 'The first wall', py: 330, required: true, when: (f) => !!f['h1.day'], script: 'm_w1', doneFlag: 'c03.w1', doneScript: 'm_w1' },
      { id: 'w2', x: 2000, label: 'The second wall', py: 330, required: true, when: (f) => !!f['h1.day'], script: 'm_w2', doneFlag: 'c03.w2', doneScript: 'm_w2' },
      { id: 'w3', x: 2300, label: 'The third wall', py: 330, required: true, when: (f) => !!f['h1.day'], script: 'm_w3', doneFlag: 'c03.w3', doneScript: 'm_w3' },
      { id: 't1', x: 1830, label: 'Talk to Mildred', required: true, when: (f) => !!f['h1.day'] && !f['c03.t1'], script: 'm_t1' },
      { id: 't2', x: 1830, label: 'Talk to Mildred', required: true, when: (f) => !!f['c03.t1'] && !f['c03.t2'], script: 'm_t2' },
      { id: 't3', x: 1830, label: 'Talk to Mildred', required: true, when: (f) => !!f['c03.t2'] && !f['c03.t3'], script: 'm_t3' },
      { id: 'tdone', x: 1830, label: 'Mildred', when: (f) => !!f['c03.t3'], script: 'm_done' },
      { id: 'script', x: 1740, label: "Mildred's script", required: true, when: (f) => !!f['c03.t1'], script: 'm_script', doneFlag: 'c03.script', doneScript: 'm_done' },
      { id: 'door', x: 140, label: 'Leave for work', required: true, when: (f) => !!f['h1.day'],
        requires: ['c03.w1', 'c03.w2', 'c03.w3', 'c03.t3', 'c03.script'], lockedScript: 'm_done', script: 'm_leave', exit: { room: 'station2', x: 2200 } },
    ],
  },
};
