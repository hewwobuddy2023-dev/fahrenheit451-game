// Chapter 1 — The Hearth and the Salamander (redesigned slice).
// Montag is content; nothing here announces what comes later. Exact novel text is limited to two short
// excerpts checked against the owner's ebook ("It was a pleasure to burn." and "Are you happy?");
// every other line is original adaptation dialogue (see docs/LITERARY_FIDELITY.md).
// Flag names are unchanged so challenge rules, saves and later callbacks keep working.
import type { RoomDef, Script } from './types.ts';
import type { Flags } from '../state.ts';

const N = '';
const down = (f: Flags) => ['c03.w1', 'c03.w2', 'c03.w3'].filter((k) => f[k]).length;

export const SCRIPTS1: Record<string, Script> = {
  // ---- 01 The Burn ----
  b_open: { lines: [
    { who: 'BEATTY', text: 'Evening, gentlemen. Montag, the books are yours. Soak them through.' },
    { who: 'BLACK', text: 'Last load from upstairs!' },
  ] },
  b_locked: { lines: [{ who: 'BEATTY', text: 'Soak them first, Montag. A fire that needs lighting twice is a fire done wrong.' }] },
  b_ignite: { lines: [
    { who: 'BEATTY', text: "Wet as a river. Here. It's your fire." },
    { who: N, text: 'He presses the igniter into your glove: brass, still warm, the salamander worn bright by thumbs.' },
  ], choices: [
    { text: 'Take it. "My pleasure."', set: { 'c01.tone': 'eager', 'c01.igniter': true }, reply: [{ who: 'BEATTY', text: "That's the spirit." }] },
    { text: '"Your fire, Captain."', set: { 'c01.tone': 'deferent', 'c01.igniter': true }, reply: [{ who: 'BEATTY', text: 'No, no. You did the work. Go on.' }] },
  ] },
  b_after: { top: true, lines: [
    { who: N, text: 'It was a pleasure to burn.' },
    { who: N, text: 'The fire climbs out of the books and walks into the house. The heat presses a grin onto your face.' },
    { who: 'STONEMAN', text: 'Pretty one tonight.' },
    { who: 'BEATTY', text: 'Clean work. Back to the House, gentlemen.' },
  ] },

  // ---- firehouse, end of shift ----
  s1_time: { lines: [{ who: 'CEILING VOICE', text: 'One-oh-two A.M. One-oh-three A.M.' }] },
  s1_helmet: { set: { 's1.helmet': true }, lines: [{ who: N, text: 'You hang up the helmet and polish the 451 until it holds the lamplight.' }] },
  s1_hound: { top: true, lines: [
    { who: N, text: 'The Hound lies folded in its kennel, humming. Its eyes are dark, and then they are not.' },
    { who: N, text: 'A needle slides a quarter inch out of its muzzle, tests the air, and slides back.' },
    { who: 'BEATTY', text: "Doesn't like anybody, Montag. It's not built to." },
  ] },
  s1_cards: { lines: [{ who: 'BLACK', text: 'Good fire tonight.' }, { who: 'STONEMAN', text: 'Night, Montag. Same time tomorrow.' }] },
  s1_beatty: { lines: [{ who: 'BEATTY', text: 'Go home, Montag. Sleep. The city does its best burning in the dark.' }] },

  // ---- 02 Clarisse's Question ----
  c_meet: { set: { 'c02.meet': true }, lines: [
    { who: N, text: 'At the corner you slow down without knowing why. Leaves skate across the pavement.' },
    { who: N, text: 'A girl is standing there, very still, as if the wind had been expecting you.' },
    { who: 'CLARISSE', text: "You're the fireman. I'm the new neighbor. Clarisse McClellan." },
    { who: 'MONTAG', text: "Guy Montag. You're out late." },
    { who: 'CLARISSE', text: 'I like walking at night. You smell of kerosene. I noticed before I saw your face.' },
  ], choices: [
    { text: '"Smells like perfume to me."', set: { 'c02.k': 'perfume' }, reply: [{ who: 'CLARISSE', text: 'Does it? Really?' }, { who: 'MONTAG', text: 'Sure. Why not?' }] },
    { text: '"My wife says it never washes out."', set: { 'c02.k': 'wife' }, reply: [{ who: 'CLARISSE', text: "No. I don't suppose it does." }] },
  ] },
  c_moon: { set: { 'c02.n1': 'look' }, lines: [
    { who: 'CLARISSE', text: "There's a man in the moon tonight. When did you last look?" },
    { who: N, text: 'You look. A face, pale and patient, looking back. You cannot remember the last time.' },
  ] },
  c_dew: { set: { 'c02.n2': 'look' }, lines: [
    { who: 'CLARISSE', text: 'In the early morning there is dew on all of this. Have you ever seen it?' },
    { who: N, text: 'You try to picture a morning lawn. You cannot find one anywhere in your head. It annoys you.' },
  ] },
  c_signs: { set: { 'c02.n3': 'look' }, lines: [
    { who: 'CLARISSE', text: 'Out on the highway the billboards are two hundred feet long now, so drivers can read them at speed.' },
    { who: 'MONTAG', text: 'Two hundred feet.' },
    { who: 'CLARISSE', text: 'Nobody slows down long enough to see anything smaller.' },
  ] },
  c_house: { lines: [
    { who: N, text: 'Every light in her house is on. Voices inside, talking, laughing, at this hour.' },
    { who: 'MONTAG', text: 'What do they find to talk about, this late?' },
    { who: 'CLARISSE', text: 'Everything. Good night, Mr. Montag.' },
    { who: N, text: 'She starts up the path. Then she stops, and turns back, as if she has just remembered something.' },
  ] },
  c_happy: { set: { 'c02.asked': true }, top: true, lines: [{ who: 'CLARISSE', text: 'Are you happy?' }] },
  c_reply: { top: true, lines: [{ who: 'MONTAG', text: 'Am I what?' }] },
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

  // ---- 03 Parlor Walls: getting through to Mildred ----
  m_w1: { set: { 'c03.w1': true }, lines: [
    { who: N, text: 'On the first wall, a man and a woman shout about something that happened before you tuned in.' },
    { who: N, text: 'You turn the dial down. Their mouths keep moving.' },
  ] },
  m_w2: { set: { 'c03.w2': true }, lines: [
    { who: N, text: 'The second wall: an audience laughing on cue, the same laugh, again and again.' },
    { who: N, text: 'You turn it down. The laughter goes on without a sound, like weather.' },
  ] },
  m_w3: { set: { 'c03.w3': true }, lines: [
    { who: N, text: 'The third wall: a family at dinner. One by one they turn and smile out into the room.' },
    { who: N, text: 'You turn it down. For the first time all day you can hear the clock.' },
  ] },
  m_x1: { lines: [
    { who: 'MONTAG', text: 'Millie. About last night.' },
    { who: 'THE WALL', text: 'AND WHAT DO YOU THINK OF THAT, HELEN?' },
    { who: 'MILDRED', text: "Shh! Guy, I'm in this part." },
  ] },
  m_x2: { lines: [
    { who: 'MONTAG', text: 'Millie, the bottle was empty.' },
    { who: 'THE WALL', text: '(the audience roars)' },
    { who: 'MILDRED', text: "I can't hear you, the family's talking." },
  ] },
  m_x3: { lines: [
    { who: 'MONTAG', text: 'What are you holding?' },
    { who: 'THE WALL', text: 'Come and sit with us, dear! Come sit!' },
    { who: 'MILDRED', text: 'In a minute.' },
  ] },
  m_t1: { set: { 'c03.t1': true }, lines: [
    { who: 'MONTAG', text: 'Millie. About last night.' },
    { who: 'MILDRED', text: "I'm starving. I don't know why. Did we have people over? I feel like I went to a party." },
    { who: 'MONTAG', text: '...A few people.' },
    { who: 'MILDRED', text: "I hope I didn't do anything silly." },
  ] },
  m_t2: { set: { 'c03.t2': true }, lines: [
    { who: 'MONTAG', text: 'The bottle was empty, Millie. All of it.' },
    { who: 'MILDRED', text: "I wouldn't do a thing like that. Why would I ever do that?" },
    { who: N, text: 'She looks past you, at the dark wall, waiting for it to come back on.' },
  ] },
  m_t3: { set: { 'c03.t3': true }, lines: [
    { who: 'MILDRED', text: "They mailed me a part this morning. The play leaves one role out, and I'm the role. Isn't that fun?" },
    { who: 'MONTAG', text: "What's it about?" },
    { who: 'MILDRED', text: 'I just told you. There are these people.' },
    { who: 'MILDRED', text: "If we had a fourth wall, Guy, it would be like this room wasn't ours at all." },
  ] },
  m_done: { lines: [{ who: 'MILDRED', text: "Shh. My line's coming up." }] },
  m_script: { set: { 'c03.script': true }, lines: [
    { who: N, text: 'You take her script and turn to the last page.' },
    { who: 'MONTAG', text: 'Does it have a happy ending?' },
    { who: 'MILDRED', text: "I haven't read that far." },
  ] },
  m_leave1: { top: true, lines: [{ who: N, text: 'Behind you the walls come back on, one by one. She has turned them all the way up.' }] },
  m_leave2: { top: true, lines: [{ who: N, text: 'At the door you stop, one hand on the latch, and do not know what you are waiting for.' }] },
};

export const ROOMS1: Record<string, RoomDef> = {
  burn: {
    id: 'burn', chapter: 1, label: '', width: 1900, spawnX: 640, kit: 'street:burn', quietUi: true,
    npcs: [
      { id: 'beatty', fig: 'beatty', name: 'BEATTY', x: 520, face: 1 },
      { id: 'black', fig: 'fireman', name: 'BLACK', x: 1450, face: -1, back: true },
      { id: 'stoneman', fig: 'fireman', name: 'STONEMAN', x: 1620, face: -1, back: true },
    ],
    objective: (f) => !f['c01.p3'] ? 'Soak the books in kerosene' : !f['c01.igniter'] ? 'Take the igniter from Captain Beatty' : !f['c01.lit'] ? 'Light the kerosene' : '',
    hints: (f) => !f['c01.p3']
      ? ['The books are piled on the lawn, to your right.', 'Walk right to the piles and hold [E]. The hose sweeps across all three.', 'Stand in the middle of the books and keep holding [E] until the stream finishes.']
      : !f['c01.igniter']
        ? ['Beatty has the igniter.', 'Captain Beatty is back by the truck, to your left. Press [E] beside him.', 'Walk left to Beatty and press [E].']
        : ['The kerosene is waiting.', 'Walk back toward the soaked books and press [E] to light them.', 'Stand by the books and press [E].'],
    barks: [
      { x: 1060, range: 220, who: 'STONEMAN', text: 'Soaked to the spine. Nice work.', when: (f) => !!f['c01.p3'] && !f['c01.igniter'] },
      { x: 700, range: 160, who: 'BLACK', text: 'Come on, come on. My fingers are cold.', when: (f) => !!f['c01.igniter'] && !f['c01.lit'] },
    ],
    enter: [{ key: 'e.burn', steps: [{ title: 'PART ONE', sub: 'The Hearth and the Salamander' }, { say: 'b_open' }] }],
    hotspots: [
      // one deliberate pour: the stream sweeps across all three piles (no pressure gauge, no repeats)
      { id: 'douse', x: 1060, label: 'Soak the books', py: 330, required: true,
        hold: { flag: 'c01.p3', ms: 2200, fx: 'hose', sweep: [880, 1240], also: { 'c01.p1': true, 'c01.p2': true } } },
      // finished actions disappear instead of keeping a prompt that no longer describes anything to do
      { id: 'igniter', x: 560, label: 'Take the igniter from Beatty', required: true, requires: ['c01.p1', 'c01.p2', 'c01.p3'], lockedScript: 'b_locked',
        when: (f) => !f['c01.igniter'], script: 'b_ignite' },
      // appears only once Montag holds the igniter, so the walk to the books never shows a dead prompt
      { id: 'light', x: 980, label: 'Light the kerosene', required: true, when: (f) => !!f['c01.igniter'] && !f['c01.lit'],
        steps: [{ fx: 'click' }, { wait: 450 }, { fx: 'rush' }, { set: { 'c01.lit': true } }, { fx: 'ignite' }, { cam: 1060, ms: 1800 },
          { say: 'b_after' }, { title: 'FAHRENHEIT 451' }, { wait: 600 }, { goto: 'station1' }] },
    ],
  },

  station1: {
    id: 'station1', chapter: 1, label: '', width: 2400, spawnX: 316, kit: 'station', quietUi: true,
    npcs: [
      { id: 'beatty', fig: 'beatty', name: 'BEATTY', x: 1290, face: -1 },
      { id: 'black', fig: 'fireman', name: 'BLACK', x: 1060, face: 1, back: true },
      { id: 'stoneman', fig: 'fireman', name: 'STONEMAN', x: 1170, face: -1, back: true },
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
      { id: 'house', x: 2020, label: '', auto: true, when: (f) => !!f['c02.meet'] && !f['c02.asked'],
        steps: [{ npc: 'clarisse', x: 2090, ms: 600 }, { say: 'c_house' }, { fx: 'hush' }, { cam: 2050, ms: 900 }, { fx: 'closeIn' }, { wait: 700 }, { say: 'c_happy' }, { wait: 1600 }, { say: 'c_reply' }, { fx: 'closeOut' }, { fx: 'unhush' },
          { npc: 'clarisse', x: 2160, ms: 700 }, { npc: 'clarisse', show: false }, { set: { 'c02.gone': true } },
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
    // while any wall is still loud she keeps facing the screens, even when she answers him
    npcs: [{ id: 'mildred', fig: 'mildred', name: 'MILDRED', x: 1890, face: 1, when: (f) => !!f['h1.day'], distracted: (f) => down(f) < 3 }],
    objective: (f) => {
      if (!f['h1.day']) return '';
      if (!f['c03.t3']) {
        if (down(f) === 3) return f['c03.t2'] ? 'Keep talking to her while the room is quiet.' : 'Talk to Mildred. The room is quiet now.';
        // progress is told in the scene's terms, never as a count
        return f['c03.t2'] ? 'Almost. One wall still talks over you.' : f['c03.t1'] ? 'She half heard you. Quiet another wall.' : 'Try to reach Mildred through the walls';
      }
      if (!f['c03.script']) return 'Look at the script in her hands';
      return 'Leave for work';
    },
    hints: (f) => !f['c03.t3']
      ? ['The walls are louder than you are.', 'Each wall has a dial. Turn a wall down, then try talking to Mildred again.', 'Press [E] at a parlor wall to turn it down. The quieter the room, the further you get with her.']
      : !f['c03.script']
        ? ['She is holding something.', 'Go to Mildred on the sofa and press [E] to read what she is holding.', 'Stand next to Mildred and press [E].']
        : ['It is time to go to work.', 'The front door is at the far left.', 'Walk all the way left and press [E] at the door.'],
    enter: [{ key: 'e.home1', steps: [
      { walk: 330, ms: 900 }, { cam: 400, ms: 900 }, { wait: 500 }, { follow: true },
      { walk: 860, ms: 2400 }, { fx: 'dark' }, { say: 'h_dark' }, { fx: 'jets' }, { say: 'h_call' },
      { fade: 'out', ms: 900 }, { set: { 'h1.day': true } }, { fx: 'light' }, { walk: 1500, ms: 10 }, { fade: 'in', ms: 600 },
      { title: 'THE NEXT AFTERNOON' },
    ] }],
    hotspots: [
      { id: 'w1', x: 1660, label: 'Turn the first wall down', py: 330, when: (f) => !!f['h1.day'] && !f['c03.w1'], script: 'm_w1', steps: [{ fx: 'knob' }] },
      { id: 'w2', x: 2000, label: 'Turn the second wall down', py: 330, when: (f) => !!f['h1.day'] && !f['c03.w2'], script: 'm_w2', steps: [{ fx: 'knob' }] },
      { id: 'w3', x: 2300, label: 'Turn the third wall down', py: 330, when: (f) => !!f['h1.day'] && !f['c03.w3'], script: 'm_w3', steps: [{ fx: 'knob' }] },
      // Mildred only hears as much as the walls allow: each serious subject needs one more wall quiet
      { id: 't1', x: 1860, label: 'Talk to Mildred', required: true, when: (f) => !!f['h1.day'] && !f['c03.t1'] && down(f) >= 1, script: 'm_t1' },
      { id: 'x1', x: 1860, label: 'Talk to Mildred', when: (f) => !!f['h1.day'] && !f['c03.t1'] && down(f) < 1, script: 'm_x1' },
      { id: 't2', x: 1860, label: 'Talk to Mildred', required: true, when: (f) => !!f['c03.t1'] && !f['c03.t2'] && down(f) >= 2, script: 'm_t2' },
      { id: 'x2', x: 1860, label: 'Talk to Mildred', when: (f) => !!f['c03.t1'] && !f['c03.t2'] && down(f) < 2, script: 'm_x2' },
      { id: 't3', x: 1860, label: 'Talk to Mildred', required: true, when: (f) => !!f['c03.t2'] && !f['c03.t3'] && down(f) >= 3, script: 'm_t3' },
      { id: 'x3', x: 1860, label: 'Talk to Mildred', when: (f) => !!f['c03.t2'] && !f['c03.t3'] && down(f) < 3, script: 'm_x3' },
      { id: 'tdone', x: 1860, label: 'Mildred', when: (f) => !!f['c03.script'], script: 'm_done' },
      // the script is in her hands, so it is read where she sits
      { id: 'script', x: 1860, label: "Read Mildred's script", required: true, when: (f) => !!f['c03.t3'] && !f['c03.script'], script: 'm_script' },
      { id: 'door', x: 140, label: 'Leave for work', required: true, when: (f) => !!f['h1.day'],
        requires: ['c03.w1', 'c03.w2', 'c03.w3', 'c03.t3', 'c03.script'], lockedScript: 'm_done', exit: { room: 'station2', x: 2200 },
        steps: [{ fx: 'wallsOn' }, { cam: 1980, ms: 1400 }, { say: 'm_leave1' }, { follow: true }, { wait: 500 }, { say: 'm_leave2' }] },
    ],
  },
};
