// Chapter 1 — The Hearth and the Salamander (v2).
// Montag is content; nothing here announces what comes later (the Hound's menace belongs to Chapter 2).
// Exact novel text is limited to short excerpts verified against the owner's ebook and listed in
// docs/LITERARY_FIDELITY.md: "It was a pleasure to burn.", "Are you happy?", "Am I what?",
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
    { who: 'BEATTY', text: 'Evening, gentlemen. Montag, the books are yours. Soak them through.', pose: 'reach' },
    { who: 'BLACK', text: 'Last load from upstairs!' },
  ] },
  // the igniter is Montag's own (in the novel he flicks it himself); Beatty only gives the nod
  b_light: { lines: [
    { who: 'BEATTY', text: "Wet as a river. All yours, Montag." },
    { who: N, text: 'You thumb your igniter. The salamander on its silver face is worn bright.', pose: 'hold' },
  ], choices: [
    { text: 'Flick it, grinning. "My pleasure."', set: { 'c01.tone': 'eager', 'c01.igniter': true }, reply: [{ who: 'BEATTY', text: "That's the spirit." }] },
    { text: '"On your word, Captain."', set: { 'c01.tone': 'deferent', 'c01.igniter': true }, reply: [{ who: 'BEATTY', text: 'You did the work. Burn it.', pose: 'reach' }] },
  ] },
  b_after: { sub: true, lines: [
    { who: N, text: 'It was a pleasure to burn.', pose: 'recoil' },
    { who: N, text: 'The books rise like startled birds, wings beating, and fall burning on the lawn.' },
    { who: N, text: 'Your face aches from grinning.' },
    { who: 'STONEMAN', text: 'Pretty one tonight.' },
    { who: 'BEATTY', text: 'Clean work. Back to the House, gentlemen.' },
  ] },

  // ---- firehouse, end of shift ----
  s1_time: { lines: [{ who: 'CEILING VOICE', text: 'One-oh-two A.M. One-oh-three A.M.' }] },
  s1_helmet: { set: { 's1.helmet': true }, lines: [{ who: N, text: 'You hang up the helmet and polish the 451 until it holds the lamplight.', pose: 'reach' }] },
  // ambient only: the needle and Beatty's "it doesn't like anybody" are Chapter 2's scene (novel order)
  s1_hound: { top: true, lines: [{ who: N, text: 'In its kennel the Hound lies folded, humming, neither asleep nor awake.' }] },
  s1_cards: { lines: [{ who: 'BLACK', text: 'Good fire tonight.', pose: 'reach' }, { who: 'STONEMAN', text: 'Night, Montag. Same time tomorrow.' }] },
  s1_beatty: { lines: [{ who: 'BEATTY', text: 'Go home, Montag. Sleep. The city does its best burning in the dark.' }] },

  // ---- 02 Clarisse's Question ----
  c_meet: { set: { 'c02.meet': true }, lines: [
    { who: N, text: 'At the corner you slow down without knowing why. Leaves skate across the pavement.' },
    { who: N, text: 'A girl stands very still, as if the wind had been expecting you.' },
    { who: 'CLARISSE', text: "You're the fireman. I'm the new neighbor. Clarisse McClellan." },
    { who: 'MONTAG', text: "Guy Montag. You're out late." },
    { who: 'CLARISSE', text: 'I like walking at night. You smell of kerosene. I noticed before I saw your face.' },
  ], choices: [
    { text: '"Smells like perfume to me."', set: { 'c02.k': 'perfume' }, reply: [{ who: 'CLARISSE', text: 'Does it? Really?' }, { who: 'MONTAG', text: 'Sure. Why not?' }] },
    { text: '"My wife says it never washes out."', set: { 'c02.k': 'wife' }, reply: [{ who: 'CLARISSE', text: "No. I don't suppose it does." }] },
  ] },
  c_moon: { set: { 'c02.n1': 'look' }, lines: [
    { who: 'CLARISSE', text: "There's a man in the moon tonight. When did you last look?", pose: 'pointUp' },
    { who: N, text: 'You look. A face, pale and patient, looking back. You cannot remember the last time.', pose: 'pointUp' },
  ] },
  c_dew: { set: { 'c02.n2': 'look' }, lines: [
    { who: 'CLARISSE', text: 'In the early morning there is dew on all of this. Have you ever seen it?', pose: 'reach' },
    { who: N, text: 'You try to picture a morning lawn. You cannot find one anywhere in your head. It annoys you.' },
  ] },
  c_signs: { set: { 'c02.n3': 'look' }, lines: [
    { who: 'CLARISSE', text: 'Out on the highway the billboards are two hundred feet long now, so drivers can read them at speed.', pose: 'reach' },
    { who: 'MONTAG', text: 'Two hundred feet.' },
    { who: 'CLARISSE', text: 'Nobody slows down long enough to see anything smaller.' },
  ] },
  c_house: { lines: [
    { who: N, text: 'Every light in her house is on. Voices inside, talking, laughing, at this hour.' },
    { who: 'MONTAG', text: 'What do they find to talk about, this late?' },
    { who: 'CLARISSE', text: 'Everything. Good night, Mr. Montag.' },
  ] },
  // the pivotal question plays as subtitles inside the letterbox, so nothing covers the two of them
  c_happy: { set: { 'c02.asked': true }, sub: true, lines: [{ who: 'CLARISSE', text: 'Are you happy?' }] },
  c_reply: { sub: true, lines: [{ who: 'MONTAG', text: 'Am I what?', pose: 'recoil' }] },
  c_after: { lines: [{ who: N, text: 'But she is gone, and the door is closing softly on the light.' }, { who: 'MONTAG', text: 'Happy. Of all the nonsense.' }] },

  // ---- home: the night (restrained, not playable) ----
  h_dark: { lines: [
    { who: N, text: 'The bedroom is cold and dark. You thumb the igniter for a little light.' },
    { who: N, text: "Mildred lies on her bed with her eyes open. Tiny radios hum in her ears." },
    { who: N, text: 'Something small and glass rolls away from your foot. The bottle is empty.' },
  ] },
  h_call: { lines: [
    { who: 'MONTAG', text: 'Emergency hospital. Please. Hurry.' },
    { who: N, text: 'Two technicians arrive with their machines, do their work without looking at her, and are gone within the hour.' },
    { who: N, text: 'They say they get calls like this every night now. You sit up until morning.' },
  ] },

  // ---- 03 Parlor Walls (Option A): she hears every word and does not listen ----
  // Turning a wall off is optional. It changes the room and her reactions, never whether the talk goes on.
  m_w1: { set: { 'c03.w1': true }, lines: [
    { who: N, text: 'You turn the first wall off. A man and a woman go on shouting without a sound.' },
    { who: 'MILDRED', text: 'Guy! That was my family.', pose: 'seatedLook' },
  ] },
  m_w2: { set: { 'c03.w2': true }, lines: [
    { who: N, text: 'The second wall: an audience laughing on cue. You turn it off mid-laugh.' },
    { who: 'MILDRED', text: "You'll make me miss my cue.", pose: 'seatedLook' },
  ] },
  m_w3: { set: { 'c03.w3': true }, lines: [
    { who: N, text: 'The third wall goes dark. You can hear the clock. She waits for the walls, not for you.' },
  ] },
  m_t1_loud: { set: { 'c03.t1': true }, lines: [
    { who: 'MONTAG', text: 'Millie. About last night.' },
    { who: 'THE WALL', text: 'Helen? Helen, darling, what do you think?' },
    { who: 'MILDRED', text: "I think it's wonderful!", pose: 'seatedLook' },
    { who: 'MILDRED', text: "Last night? I'm starving, Guy. Did we have people over? I feel like I've been to a party." },
    { who: 'MONTAG', text: 'Something like that.' },
    { who: 'MILDRED', text: "Well. I hope I wasn't silly." },
  ] },
  m_t1: { set: { 'c03.t1': true }, lines: [
    { who: 'MONTAG', text: 'Millie. About last night.' },
    { who: 'MILDRED', text: "Last night? I'm starving, Guy. Did we have people over? I feel like I've been to a party." },
    { who: 'MONTAG', text: 'Something like that.' },
    { who: 'MILDRED', text: "Well. I hope I wasn't silly." },
  ] },
  m_t2_loud: { set: { 'c03.t2': true }, lines: [
    { who: 'MONTAG', text: 'The bottle was empty, Millie. You took every pill in it.' },
    { who: 'MILDRED', text: 'Me? I would never do something that silly.' },
    { who: 'THE WALL', text: 'Helen? Are you with us?' },
    { who: 'MILDRED', text: 'Always!', pose: 'seatedLook' },
    { who: N, text: 'She has already decided the conversation is over.' },
  ] },
  m_t2: { set: { 'c03.t2': true }, lines: [
    { who: 'MONTAG', text: 'The bottle was empty, Millie. You took every pill in it.' },
    { who: 'MILDRED', text: 'Me? I would never do something that silly.' },
    { who: N, text: 'She turns a page. In the quiet room she heard every word. She has already decided the conversation is over.' },
  ] },
  m_t3_loud: { set: { 'c03.t3': true }, lines: [
    { who: 'MONTAG', text: 'What are you reading?' },
    { who: 'MILDRED', text: "My part! They mailed it this morning. The play leaves one person out, and I'm the one." },
    { who: 'MONTAG', text: "What's it about?" },
    { who: 'MILDRED', text: "I told you. There's a family, and me. Shh, here's my line.", pose: 'seatedLook' },
    { who: 'MILDRED', text: "With a fourth wall, Guy, it would be like living in somebody else's house. Wouldn't that be fun?" },
  ] },
  m_t3: { set: { 'c03.t3': true }, lines: [
    { who: 'MONTAG', text: 'What are you reading?' },
    { who: 'MILDRED', text: "My part! They mailed it this morning. The play leaves one person out, and I'm the one." },
    { who: 'MONTAG', text: "What's it about?" },
    { who: 'MILDRED', text: "I told you. There's a family, and me." },
    { who: 'MILDRED', text: "With a fourth wall, Guy, it would be like living in somebody else's house. Wouldn't that be fun?" },
  ] },
  m_quiet: { lines: [{ who: N, text: 'In the silence she looks at you for a long moment, the way she looks at a dark wall.' }] },
  // novel order: goodbye, then the question, then he reads the last page, folds the script and hands it back
  m_script: { set: { 'c03.script': true }, lines: [
    { who: 'MILDRED', text: 'Well, goodbye, dear.' },
    { who: 'MONTAG', text: 'Goodbye.' },
    { who: 'MONTAG', text: 'Does it have a happy ending?' },
    { who: 'MILDRED', text: "I haven't read that far." },
  ] },
  m_after: { lines: [{ who: N, text: 'You read the last page, fold it, and hand it back. She does not ask how it ends.' }] },
  m_done: { lines: [{ who: 'MILDRED', text: "Shh. My line's coming up." }] },
  m_notyet: { lines: [{ who: N, text: 'You stop at the door. You have not said goodbye.' }] },
  m_leave_on: { lines: [{ who: N, text: 'Behind you the walls come back on, one by one. She has turned them all the way up.' }] },
  m_leave2: { sub: true, lines: [{ who: N, text: 'At the door you stop, hand on the latch, not knowing what you wait for.' }] },
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
      // Montag lights his own fire; the tone choice happens on Beatty's nod
      { id: 'light', x: 980, label: 'Light the kerosene', required: true, when: (f) => !!f['c01.p3'] && !f['c01.lit'], script: 'b_light',
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
      { x: 1640, range: 150, who: 'MONTAG', text: 'Inside the kennel, something clicks awake.', cue: 'servo', fx: 'houndStir' },
    ],
    enter: [{ key: 'e.station1', steps: [{ fx: 'poleSlide' }, { say: 's1_time' }] }],
    hotspots: [
      { id: 'rack', x: 620, label: 'Hang up your helmet', script: 's1_helmet', doneFlag: 's1.helmet', doneScript: 's1_helmet' },
      { id: 'cards', x: 1110, label: 'Listen to the card game', script: 's1_cards' },
      { id: 'beatty', x: 1290, label: 'Talk to Beatty', script: 's1_beatty' },
      { id: 'hound', x: 1770, label: 'Watch the Hound', steps: [{ cam: 1770, ms: 700 }, { fx: 'houndStir' }, { say: 's1_hound' }, { follow: true }] },
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
    // She turns to Montag only for the goodbye, then goes back to the walls.
    npcs: [{ id: 'mildred', fig: 'mildred', name: 'MILDRED', x: 1824, face: 1, back: true, when: (f) => !!f['h1.day'],
      pose: (f) => down(f) ? 'seated' : 'seatedLook', distracted: (f) => !f['c03.t3'] || !!f['c03.script'] }],
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
