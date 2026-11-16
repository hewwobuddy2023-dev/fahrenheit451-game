// Chapter 1 — The Hearth and the Salamander.
// Montag is content; nothing here announces what comes later (the Hound's menace belongs to Chapter 2).
// Exact novel text is limited to a few short excerpts: "It was a pleasure to burn.", "Are you happy?", "Am I what?",
// "Well, goodbye, dear.", "Does it have a happy ending?" and "I haven't read that far."
// Every other line is original adaptation dialogue.
// Flag names are unchanged so challenge rules, saves and later callbacks keep working.
import type { RoomDef, Script } from './types.ts';
import type { Flags } from '../state.ts';

const N = '';
const down = (f: Flags) => ['c03.w1', 'c03.w2', 'c03.w3'].filter((k) => f[k]).length;
const talk = (key: string) => [{ if: (f: Flags) => down(f) === 0, then: [{ say: key + '_loud' }], else: [{ say: key }] }];

export const SCRIPTS1: Record<string, Script> = {
  // ---- 01 The Burn ----
  b_open: { lines: [
    { who: 'BEATTY', text: "Evening. Montag, you've the hose. Be generous, it saves a lot of arguing later.", pose: 'reach' },
    { who: 'BLACK', text: 'Last of the attic!' },
  ] },
  // the igniter is Montag's own (in the novel he flicks it himself); Beatty only gives the nod
  b_light: { lines: [
    { who: 'BEATTY', text: "Well? They won't light themselves." },
    { who: N, text: 'Your thumb has worn the salamander on the igniter smooth.', pose: 'hold' },
  ], choices: [
    { text: 'Flick it, grinning. "My pleasure."', set: { 'c01.tone': 'eager', 'c01.igniter': true }, reply: [{ who: 'BEATTY', text: 'Ha. Good lad.' }] },
    { text: '"On your word, Captain."', set: { 'c01.tone': 'deferent', 'c01.igniter': true }, reply: [{ who: 'BEATTY', text: "Don't wait on me. It's your fire.", pose: 'reach' }] },
  ] },
  b_after: { sub: true, lines: [
    { who: N, text: 'It was a pleasure to burn.', pose: 'recoil' },
    { who: N, text: 'Pages lift off the lawn, flapping, and come down on fire.' },
    { who: 'STONEMAN', text: 'Pretty.' },
    { who: 'BEATTY', text: "Tidy. Home, gentlemen, before the coffee's cold." },
  ] },

  // ---- firehouse, end of shift ----
  s1_time: { lines: [{ who: 'CEILING VOICE', text: 'One-oh-two A.M. One-oh-three A.M.' }] },
  s1_helmet: { set: { 's1.helmet': true }, lines: [{ who: N, text: 'You rub the 451 on your sleeve and hang the helmet up.', pose: 'reach' }] },
  // ambient only: the needle and Beatty's "it doesn't like anybody" are Chapter 2's scene (novel order)
  s1_hound: { top: true, lines: [{ who: N, text: 'Something in the kennel hums, one note, over and over.' }] },
  s1_cards: { lines: [{ who: 'BLACK', text: 'Good fire.', pose: 'reach' }, { who: 'STONEMAN', text: "Pair of sevens. Don't look so pleased, Black." }] },
  s1_beatty: { lines: [{ who: 'BEATTY', text: "Go home, Montag. You've the look of a man who's been enjoying himself, and nothing is more tiring." }] },

  // ---- 02 Clarisse's Question ----
  c_meet: { set: { 'c02.meet': true }, lines: [
    { who: N, text: "A girl is standing at the corner where the sidewalk widens. She doesn't step aside." },
    { who: 'CLARISSE', text: "Oh, you're the fireman. I'm next door, since Tuesday. Clarisse McClellan." },
    { who: 'MONTAG', text: "Guy Montag. Shouldn't you be in bed?" },
    { who: 'CLARISSE', text: "I like walking at night. You smell of kerosene, did you know? I noticed before I saw your face. Is it your hands or your hair?" },
  ], choices: [
    { text: '"Smells like perfume to me."', set: { 'c02.k': 'perfume' }, reply: [{ who: 'CLARISSE', text: 'Does it?' }, { who: 'MONTAG', text: 'Sure. Why not?' }] },
    { text: '"My wife says it never washes out."', set: { 'c02.k': 'wife' }, reply: [{ who: 'CLARISSE', text: "Mm. I suppose it wouldn't." }] },
  ] },
  c_moon: { set: { 'c02.n1': 'look' }, lines: [
    { who: 'CLARISSE', text: "There's a man in the moon tonight. Have you looked? I mean really?", pose: 'pointUp' },
    { who: 'MONTAG', text: 'Huh. So there is.', pose: 'pointUp' },
  ] },
  c_dew: { set: { 'c02.n2': 'look' }, lines: [
    { who: 'CLARISSE', text: "In the mornings there's dew on all of this. Grass, fences. You can taste it, if you're early.", pose: 'reach' },
    { who: 'MONTAG', text: 'Taste it.' },
    { who: 'CLARISSE', text: 'Well, I do.' },
  ] },
  c_signs: { set: { 'c02.n3': 'look' }, lines: [
    { who: 'CLARISSE', text: 'The billboards on the highway are two hundred feet long now. For the speed.', pose: 'reach' },
    { who: 'MONTAG', text: 'So?' },
    { who: 'CLARISSE', text: "So nothing smaller gets seen. That's all I mean." },
  ] },
  c_house: { lines: [
    { who: 'MONTAG', text: 'Your whole house is lit up. What do they find to talk about, this late?' },
    { who: 'CLARISSE', text: 'Everything, mostly with their mouths full. Good night, Mr. Montag.' },
  ] },
  // the pivotal question plays as subtitles inside the letterbox, so nothing covers the two of them
  c_happy: { set: { 'c02.asked': true }, sub: true, lines: [{ who: 'CLARISSE', text: 'Are you happy?' }] },
  c_reply: { sub: true, lines: [{ who: 'MONTAG', text: 'Am I what?', pose: 'recoil' }] },
  c_after: { lines: [{ who: 'MONTAG', text: 'Happy. What a thing to ask a stranger.' }] },

  // ---- home: the night (restrained, not playable) ----
  h_dark: { lines: [
    { who: N, text: 'Mildred is on top of the covers with her eyes open, a little radio in each ear. Something glass rolls off the sheet and against your foot.' },
    { who: 'MONTAG', text: 'Millie? ...Millie.' },
  ] },
  h_call: { lines: [
    { who: 'MONTAG', text: "Emergency hospital. It's my wife. Please, hurry." },
    { who: 'TECHNICIAN', text: "That's the ninth tonight. Hold her head, would you?" },
  ] },

  // ---- 03 Parlor Walls: she hears every word and does not listen ----
  // Turning a wall off is optional. It changes the room and her reactions, never whether the talk goes on.
  m_w1: { set: { 'c03.w1': true }, lines: [
    { who: N, text: 'The mouths on the first wall go on opening for a second after the sound is gone.' },
    { who: 'MILDRED', text: 'Guy! That was my family. They were just getting to the good part.', pose: 'seatedLook' },
  ] },
  m_w2: { set: { 'c03.w2': true }, lines: [
    { who: 'MILDRED', text: 'Honestly, Guy. I was about to laugh.', pose: 'seatedLook' },
  ] },
  m_w3: { set: { 'c03.w3': true }, lines: [
    { who: N, text: 'The third wall dies. Somewhere in the room a clock is going.' },
  ] },
  m_t1_loud: { set: { 'c03.t1': true }, lines: [
    { who: 'MONTAG', text: 'Millie. About last night.' },
    { who: 'THE WALL', text: 'Helen? Helen, darling, what do you think?' },
    { who: 'MILDRED', text: "I think it's wonderful!", pose: 'seatedLook' },
    { who: 'MILDRED', text: "Last night? Is there any toast? I feel as if I've been to a party, I'm that hungry." },
    { who: 'MONTAG', text: 'Something like that.' },
    { who: 'MILDRED', text: "Well. I hope I wasn't silly." },
  ] },
  m_t1: { set: { 'c03.t1': true }, lines: [
    { who: 'MONTAG', text: 'Millie. About last night.' },
    { who: 'MILDRED', text: "Last night? Is there any toast? I feel as if I've been to a party, I'm that hungry." },
    { who: 'MONTAG', text: 'Something like that.' },
    { who: 'MILDRED', text: "Well. I hope I wasn't silly." },
  ] },
  m_t2_loud: { set: { 'c03.t2': true }, lines: [
    { who: 'MONTAG', text: 'The bottle was empty, Millie. Every pill in—' },
    { who: 'MILDRED', text: "Me? I'd never. That would be so silly." },
    { who: 'THE WALL', text: 'Helen? Are you with us?' },
    { who: 'MILDRED', text: 'Always!', pose: 'seatedLook' },
  ] },
  m_t2: { set: { 'c03.t2': true }, lines: [
    { who: 'MONTAG', text: 'The bottle was empty, Millie. Every pill in—' },
    { who: 'MILDRED', text: "Me? I'd never. That would be so silly." },
    { who: N, text: 'She turns a page of the script with a wet fingertip.' },
  ] },
  m_t3_loud: { set: { 'c03.t3': true }, lines: [
    { who: 'MONTAG', text: 'What are you reading?' },
    { who: 'MILDRED', text: "My part! They mailed it this morning. The play leaves one person out, and I'm the one." },
    { who: 'MONTAG', text: "What's it about?" },
    { who: 'MILDRED', text: "I told you. There's a family, and me. Shh, here's my line.", pose: 'seatedLook' },
    { who: 'MILDRED', text: "If we had a fourth wall, Guy, it would be like living inside the play. Wouldn't that be fun?" },
  ] },
  m_t3: { set: { 'c03.t3': true }, lines: [
    { who: 'MONTAG', text: 'What are you reading?' },
    { who: 'MILDRED', text: "My part! They mailed it this morning. The play leaves one person out, and I'm the one." },
    { who: 'MONTAG', text: "What's it about?" },
    { who: 'MILDRED', text: "I told you. There's a family, and me." },
    { who: 'MILDRED', text: "If we had a fourth wall, Guy, it would be like living inside the play. Wouldn't that be fun?" },
  ] },
  m_quiet: { lines: [{ who: 'MILDRED', text: 'What? Why are you standing like that?' }] },
  // novel order: goodbye, then the question, then he reads the last page, folds the script and hands it back
  m_script: { set: { 'c03.script': true }, lines: [
    { who: 'MILDRED', text: 'Well, goodbye, dear.' },
    { who: 'MONTAG', text: 'Goodbye.' },
    { who: 'MONTAG', text: 'Does it have a happy ending?' },
    { who: 'MILDRED', text: "I haven't read that far." },
  ] },
  m_after: { lines: [{ who: N, text: 'You read the last page standing up, fold it in three, and put it back in her hand.' }] },
  m_done: { lines: [{ who: 'MILDRED', text: "Shh. Shh, it's my line." }] },
  m_notyet: { lines: [{ who: N, text: "Your hand is on the latch and you haven't said goodbye." }] },
  m_leave_on: { lines: [{ who: N, text: 'The walls come back on behind you, louder than before.' }] },
  m_leave2: { sub: true, lines: [{ who: N, text: 'The latch is cold. You stand there holding it.' }] },
};

export const ROOMS1: Record<string, RoomDef> = {
  burn: {
    id: 'burn', chapter: 1, label: '', width: 1900, spawnX: 640, kit: 'street:burn', quietUi: true,
    npcs: [
      { id: 'beatty', fig: 'beatty', name: 'BEATTY', x: 520, face: 1 },
      { id: 'black', fig: 'fireman', name: 'BLACK', x: 1450, face: -1, back: true },
      { id: 'stoneman', fig: 'fireman', name: 'STONEMAN', x: 1620, face: -1, back: true },
    ],
    objective: (f) => !f['c01.p3'] ? 'Soak the books in kerosene' : !f['c01.lit'] ? 'Light the kerosene' : '',
    hints: (f) => !f['c01.p3']
      ? ['The books are piled on the lawn, to your right.', 'Walk right to the piles and hold [E]. The hose sweeps across all three.', 'Stand in the middle of the books and keep holding [E] until the stream finishes.']
      : ['The kerosene is waiting. Your igniter is in your pocket.', 'Stand by the soaked books and press [E] to light them.', 'Stand by the books and press [E].'],
    barks: [
      { x: 1060, range: 220, who: 'STONEMAN', text: 'Soaked to the spine. Nice work.', when: (f) => !!f['c01.p3'] && !f['c01.lit'] },
    ],
    enter: [{ key: 'e.burn', steps: [{ title: 'PART ONE', sub: 'The Hearth and the Salamander' }, { say: 'b_open' }] }],
    hotspots: [
      // one deliberate pour: the stream sweeps across all three piles (no pressure gauge, no repeats)
      { id: 'douse', x: 1060, label: 'Soak the books', py: 330, required: true,
        hold: { flag: 'c01.p3', ms: 2200, fx: 'hose', sweep: [880, 1240], also: { 'c01.p1': true, 'c01.p2': true } } },
      // Montag lights his own fire where the pour left him (at 980 it was out of reach after soaking: the playthrough walked past it)
      { id: 'light', x: 1060, label: 'Light the kerosene', required: true, when: (f) => !!f['c01.p3'] && !f['c01.lit'], script: 'b_light',
        steps: [{ pose: 'montag', p: 'reach' }, { fx: 'click' }, { wait: 450 }, { fx: 'rush' }, { set: { 'c01.lit': true } }, { fx: 'ignite' }, { fx: 'pages' },
          { cam: 1060, ms: 1400 }, { pose: 'montag' }, { fx: 'closeIn' }, { wait: 700 },
          { say: 'b_after' }, { title: 'FAHRENHEIT 451' }, { wait: 600 }, { goto: 'station1' }] },
    ],
  },

  station1: {
    id: 'station1', chapter: 1, label: '', width: 2400, spawnX: 316, kit: 'station', quietUi: true,
    npcs: [
      { id: 'beatty', fig: 'beatty', name: 'BEATTY', x: 1290, face: -1 },
      { id: 'black', fig: 'fireman', name: 'BLACK', x: 1060, face: 1, back: true, gesture: { p: 'reach', every: 2300 } },
      { id: 'stoneman', fig: 'fireman', name: 'STONEMAN', x: 1170, face: -1, back: true, gesture: { p: 'reach', every: 3100 } },
    ],
    objective: () => 'Your shift is over. Go home.',
    hints: () => ['The bay door is at the far end of the firehouse.', 'Walk right, past the card table and the kennel, to the bay door.', 'Walk all the way right and press [E] at the bay door.'],
    barks: [
      { x: 980, who: 'STONEMAN', text: 'Your deal, Black.' },
      { x: 1110, who: 'BLACK', text: 'Montag had a grin on him tonight like a jack-o\'-lantern.' },
      { x: 1480, range: 100, who: 'MONTAG', text: 'Inside the kennel, something clicks awake.', cue: 'servo', fx: 'houndStir' }, // well before the Watch prompt, so the two never stack
    ],
    enter: [{ key: 'e.station1', steps: [{ fx: 'poleSlide' }, { say: 's1_time' }] }],
    hotspots: [
      { id: 'rack', x: 620, label: 'Hang up your helmet', script: 's1_helmet', doneFlag: 's1.helmet', doneScript: 's1_helmet' },
      { id: 'cards', x: 1110, label: 'Listen to the card game', script: 's1_cards' },
      { id: 'beatty', x: 1290, label: 'Talk to Beatty', script: 's1_beatty' },
      { id: 'hound', x: 1630, label: 'Watch the Hound', steps: [{ cam: 1740, ms: 700 }, { fx: 'houndStir' }, { say: 's1_hound' }, { follow: true }] },
      { id: 'out', x: 2250, label: 'Leave for home', required: true, exit: { room: 'corner' } },
    ],
  },

  corner: {
    id: 'corner', chapter: 1, label: '', width: 2300, spawnX: 160, kit: 'street:corner', quietUi: true,
    npcs: [{ id: 'clarisse', fig: 'clarisse', name: 'CLARISSE', x: 760, face: -1, when: (f) => !!f['c02.meet'] && !f['c02.gone'], follow: (f) => !!f['c02.meet'] && !f['c02.asked'] }],
    objective: (f) => !f['c02.meet'] ? 'Walk home' : !f['c02.asked'] ? 'Walk with Clarisse. Notice what she notices.' : 'Go inside',
    hints: (f) => !f['c02.meet']
      ? ['Home is to the right.', 'Keep walking right along the street.', 'Hold D or the right arrow.']
      : !f['c02.asked']
        ? ['She keeps looking at things. You could look too, or just keep walking.', 'Look for the moon, the grass and the far billboards as you walk; each is optional.', 'Walk right toward her house. Press [E] wherever she points something out.']
        : ['Your house is at the end of the street.', 'Walk right to your door.', 'Walk all the way right and press [E] at your door.'],
    barks: [
      { x: 880, who: 'CLARISSE', text: 'Do you ever read any of them? Before they burn?', when: (f) => !!f['c02.meet'] && !f['c02.asked'] },
      { x: 960, who: 'MONTAG', text: "Reading them is against the law.", when: (f) => !!f['c02.meet'] && !f['c02.asked'] },
      { x: 1300, who: 'CLARISSE', text: 'Is it true firemen used to put fires out? A long time ago?', when: (f) => !!f['c02.meet'] && !f['c02.asked'] },
      { x: 1380, who: 'MONTAG', text: 'Houses have always been fireproof. Take my word for it.', when: (f) => !!f['c02.meet'] && !f['c02.asked'] },
      { x: 1660, who: 'CLARISSE', text: "You answer before I finish asking. You never stop to think.", when: (f) => !!f['c02.meet'] && !f['c02.asked'] },
    ],
    hotspots: [
      { id: 'meet', x: 640, label: '', auto: true, when: (f) => !f['c02.meet'], steps: [], script: 'c_meet' },
      // optional observations, in any order; skipping one is a real choice the Preservation epilogue remembers
      { id: 'moon', x: 1120, label: 'Look up at the moon', py: 260, when: (f) => !!f['c02.meet'] && !f['c02.n1'] && !f['c02.asked'], script: 'c_moon', steps: [{ fx: 'moonUp' }] },
      { id: 'dew', x: 1490, label: 'Look at the grass', py: 330, when: (f) => !!f['c02.meet'] && !f['c02.n2'] && !f['c02.asked'], script: 'c_dew', steps: [{ fx: 'dew' }] },
      { id: 'signs', x: 1830, label: 'Look toward the highway', py: 260, when: (f) => !!f['c02.meet'] && !f['c02.n3'] && !f['c02.asked'], script: 'c_signs', steps: [{ fx: 'billboard' }] },
      // staged, not narrated: she goes up the path, stops, turns back and comes one step toward him
      { id: 'house', x: 2020, label: '', auto: true, when: (f) => !!f['c02.meet'] && !f['c02.asked'],
        steps: [{ npc: 'clarisse', x: 2090, ms: 600 }, { say: 'c_house' }, { npc: 'clarisse', x: 2165, ms: 800 }, { wait: 500 }, { fx: 'hush' },
          { npc: 'clarisse', face: -1 }, { wait: 450 }, { npc: 'clarisse', x: 2135, ms: 500 }, { cam: 2075, ms: 600 }, { fx: 'closeIn' }, { wait: 800 },
          { say: 'c_happy' }, { wait: 1600 }, { say: 'c_reply' }, { wait: 500 }, { fx: 'closeOut' }, { fx: 'unhush' },
          { npc: 'clarisse', x: 2190, ms: 700 }, { npc: 'clarisse', show: false }, { set: { 'c02.gone': true } },
          { if: (f) => !f['c02.n1'], then: [{ set: { 'c02.n1': 'walk' } }] },
          { if: (f) => !f['c02.n2'], then: [{ set: { 'c02.n2': 'walk' } }] },
          { if: (f) => !f['c02.n3'], then: [{ set: { 'c02.n3': 'walk' } }] },
          { follow: true }, { say: 'c_after' }] },
      { id: 'home', x: 2240, label: 'Go inside', required: true, requires: ['c02.asked'], exit: { room: 'home1', x: 200 } },
    ],
  },

  home1: {
    id: 'home1', chapter: 1, label: '', width: 2600, spawnX: 200, kit: 'home', quietUi: true,
    coda: 'Happy. The word follows you all the way to the firehouse.',
    dark: (f) => !f['h1.day'],
    // seated center stage on the sofa, back to the door. Loud walls: she watches them. Any wall off: she reads her part.
    // She turns to Montag only for the goodbye (a scripted step), then goes back to the walls.
    npcs: [{ id: 'mildred', fig: 'mildred', name: 'MILDRED', x: 1824, face: 1, back: true, when: (f) => !!f['h1.day'],
      pose: (f) => down(f) ? 'seated' : 'seatedLook', distracted: () => true }],
    objective: (f) => {
      if (!f['h1.day']) return '';
      if (!f['c03.t1']) return 'Talk to Mildred';
      if (!f['c03.t2']) return 'She heard you. She kept reading. Try again.';
      if (!f['c03.t3']) return 'Ask Mildred what she is reading';
      if (!f['c03.script']) return 'Tell Mildred you are leaving for work';
      return 'Leave for work';
    },
    hints: (f) => !f['c03.t3']
      ? ['Mildred is on the sofa in the parlor.', 'Talk to Mildred from behind the sofa. You can turn the walls off, or leave them on; she hears you either way.', 'Stand behind the sofa and press [E].']
      : !f['c03.script']
        ? ['It is time to go to work.', 'Talk to Mildred once more before you leave.', 'Stand behind the sofa and press [E].']
        : ['It is time to go to work.', 'The front door is at the far left.', 'Walk all the way left and press [E] at the door.'],
    enter: [{ key: 'e.home1', steps: [
      { walk: 330, ms: 900 }, { cam: 400, ms: 900 }, { wait: 500 }, { follow: true },
      { walk: 860, ms: 2400 }, { fx: 'dark' }, { say: 'h_dark' }, { fx: 'jets' }, { say: 'h_call' },
      { fade: 'out', ms: 900 }, { set: { 'h1.day': true } }, { fx: 'light' }, { walk: 1500, ms: 10 }, { fade: 'in', ms: 600 },
      { title: 'THE NEXT AFTERNOON' },
    ] }],
    hotspots: [
      { id: 'w1', x: 1660, label: 'Turn the first wall off', py: 330, when: (f) => !!f['h1.day'] && !f['c03.w1'], script: 'm_w1', steps: [{ fx: 'knob' }] },
      { id: 'w2', x: 1980, label: 'Turn the second wall off', py: 330, when: (f) => !!f['h1.day'] && !f['c03.w2'], script: 'm_w2', steps: [{ fx: 'knob' }] },
      { id: 'w3', x: 2300, label: 'Turn the third wall off', py: 330, when: (f) => !!f['h1.day'] && !f['c03.w3'], script: 'm_w3', steps: [{ fx: 'knob' }] },
      // one conversation in three beats; the walls change how it sounds, never whether it continues
      { id: 't1', x: 1760, label: 'Talk to Mildred', required: true, when: (f) => !!f['h1.day'] && !f['c03.t1'], steps: talk('m_t1') },
      { id: 't2', x: 1760, label: 'Talk to Mildred', required: true, when: (f) => !!f['c03.t1'] && !f['c03.t2'], steps: talk('m_t2') },
      { id: 't3', x: 1760, label: 'Talk to Mildred', required: true, when: (f) => !!f['c03.t2'] && !f['c03.t3'],
        steps: [...talk('m_t3'), { if: (f) => down(f) === 3, then: [{ say: 'm_quiet' }] }] },
      { id: 'script', x: 1760, label: 'Say goodbye to Mildred', required: true, when: (f) => !!f['c03.t3'] && !f['c03.script'],
        steps: [{ npc: 'mildred', face: -1 }, { wait: 900 }, { say: 'm_script' },
          { pose: 'montag', p: 'reach' }, { wait: 500 }, { pose: 'montag', p: 'hold' }, { wait: 1300 }, { pose: 'montag', p: 'reach' }, { wait: 450 }, { pose: 'montag' },
          { say: 'm_after' }] },
      { id: 'tdone', x: 1760, label: 'Mildred', when: (f) => !!f['c03.script'], script: 'm_done' },
      { id: 'door', x: 140, label: 'Leave for work', required: true, when: (f) => !!f['h1.day'],
        requires: ['c03.t3', 'c03.script'], lockedScript: 'm_notyet', exit: { room: 'station2', x: 2200 },
        steps: [
          { if: (f) => down(f) > 0, then: [{ fx: 'wallsOn' }, { cam: 1980, ms: 1400 }, { say: 'm_leave_on' }, { follow: true }, { wait: 500 }] },
          { fx: 'closeIn' }, { wait: 600 }, { say: 'm_leave2' }, { fx: 'rainDoor' }, { wait: 700 }, { walk: 115, ms: 500 }, { fx: 'leave' }, { wait: 300 },
        ] },
    ],
  },
};
