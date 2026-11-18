// Chapter 2 — A Book Under the Pillow. Novel order: the Hound growls, the rule book, the old woman,
// that night (Clarisse mentioned in passing), Beatty's bedside visit, the ventilator grill.
import type { RoomDef, Script } from './types.ts';

const N = '';

export const SCRIPTS2: Record<string, Script> = {
  s2_days: { lines: [
    { who: N, text: 'All week Clarisse turns up on your way home: shaking a walnut tree, pinning a leaf to your door, offering you a jar of rainwater. Thursday, the lawn next door is empty.' },
  ] },
  s2_hound1: { lines: [{ who: N, text: "You put two fingers on the Hound's muzzle. It is warm, like a stove just turned off." }] },
  s2_hound2: { set: { 's2.hound': true }, lines: [
    { who: N, text: 'It growls. A silver needle slides out an inch, wet at the tip, and goes back in.' },
    { who: 'BEATTY', text: 'Montag?' },
    { who: 'MONTAG', text: "It doesn't like me." },
    { who: 'BEATTY', text: "Like. It doesn't like or dislike. It runs a course, we set the course. Copper wire and a few batteries; that's your devil." },
    { who: 'MONTAG', text: 'Somebody could set it to my chemistry. Just enough to growl.' },
    { who: 'BEATTY', text: "Who? Nobody here has it in for you. We'll have it looked at." },
    { who: 'BEATTY', text: "Unless there's something on your conscience, Guy?" },
  ] },
  s2_hound_done: { lines: [{ who: N, text: 'The Hound hums. Its eyes are dark.' }] },
  s2_cards: { set: { 's2.cards': true }, lines: [
    { who: 'CEILING VOICE', text: 'One thirty-five A.M. Thursday morning.' },
    { who: 'RADIO', text: '...war may be declared at any hour. The country stands ready...' },
    { who: 'MONTAG', text: 'That man last week, the one with the library. Where did they take him?' },
    { who: 'BEATTY', text: 'The asylum. A man who thinks he can outwit a fire department is already off his hinges.' },
    { who: 'MONTAG', text: 'Was it always like this? Way back, did firemen ever put fires out?' },
    { who: 'STONEMAN', text: "Ha! That's a good one." },
    { who: 'BEATTY', text: 'Page one of the rule book. Founded 1790, Benjamin Franklin the first. Look it up, Montag. Nobody can.' },
    { who: 'BLACK', text: 'Your play.' },
  ] },
  s2_cards_done: { lines: [{ who: 'BLACK', text: 'Your deal.' }] },
  s2_quiet: { lines: [{ who: N, text: 'Nothing on the board concerns you yet. The Hound first, then cards.' }] },
  s2_alarm: { set: { 's2.alarm': true }, lines: [
    { who: N, text: 'The bell. Cards go everywhere, and the chairs are empty before it finishes.' },
    { who: 'BEATTY', text: 'Montag! Helmet!' },
  ] },

  // ---- 04 The Woman's House ----
  a_open: { lines: [
    { who: N, text: 'The door gives on the first blow. In the hall an old woman is holding the banister with both hands.' },
    { who: 'THE WOMAN', text: '"Play the man, Master Ridley; we shall this day light such a candle, by God\'s grace, in England, as I trust shall never be put out."' },
    { who: 'BEATTY', text: 'Enough. Where are they?' },
    { who: 'THE WOMAN', text: "You know where they are, or you wouldn't be here." },
    { who: 'STONEMAN', text: 'Neighbor says the attic.' },
    { who: 'BEATTY', text: 'Up!' },
  ] },
  a_books: { set: { 'a.fell': true }, sub: true, lines: [
    { who: N, text: 'The stacks let go. Books slide down on you like slaughtered birds, and a spine catches you across the cheek. One drops open into your hands.' },
    { who: N, text: 'Half a line about time dozing in the afternoon sun. Then it is gone.' },
  ] },
  a_watched: { lines: [{ who: 'BEATTY', text: "Montag! Up here! What are you doing?" }, { who: N, text: 'His eyes are on you. Not yet.' }] },
  a_hide: { set: { 'c04.book': true }, lines: [
    { who: N, text: 'The book is inside your jacket, flat against your ribs, already warm.' },
  ] },
  a_woman: { lines: [
    { who: N, text: 'Kerosene up the stairs and over every shelf. The woman sits down in the middle of her books and will not get up.' },
    { who: 'THE WOMAN', text: "They're mine. You won't have them." },
    { who: 'BEATTY', text: "You know the law. Not one of these books agrees with another; you've a houseful of quarrels. Come along. The place is going up." },
    { who: 'BEATTY', text: 'One. Two.' },
  ], choices: [
    { text: 'Take her arm. "Please. Come with me."', set: { 'c04.plea': 'plead' }, next: 'a_woman2', reply: [{ who: 'THE WOMAN', text: 'No. Thank you, though.' }] },
    { text: 'Say nothing.', set: { 'c04.plea': 'silent' }, next: 'a_woman2', reply: [{ who: N, text: 'Beatty keeps counting. You study the ceiling.' }] },
  ] },
  a_woman2: { lines: [
    { who: 'BEATTY', text: 'Three. Four.' },
    { who: 'THE WOMAN', text: "Don't trouble yourself with five." },
    { who: N, text: 'She opens her hand: a kitchen match.' },
  ] },
  a_strike: { sub: true, lines: [
    { who: N, text: 'She draws the match along the banister rail. The head flares.' },
    { who: 'BEATTY', text: 'Back! Out of the house!' },
  ] },
  a_match: { lines: [
    { who: N, text: 'On the lawn you look back. She is on the porch with one hand up, and then there is a small light in it.' },
    { who: N, text: 'In the truck Beatty talks to the windshield.' },
    { who: 'BEATTY', text: 'Latimer, to Ridley, at the stake. Oxford, fifteen fifty-five. Heresy, both of them.' },
    { who: 'MONTAG', text: 'You know that.' },
    { who: 'BEATTY', text: 'Everyone ought to carry one line like it. Drive, Stoneman.' },
  ] },

  // ---- that night, and the next day ----
  h2_night: { lines: [
    { who: N, text: 'You slide the book under the pillow and lie down in the dark.' },
    { who: 'MONTAG', text: 'Millie. When did we meet? Where?' },
    { who: 'MILDRED', text: "Why, it was at... no. Isn't that funny? I can't think." },
    { who: 'MONTAG', text: 'Ten years. Only ten.' },
    { who: 'MILDRED', text: 'Oh, and that girl next door, the family moved. I think she was hit by a car. Four days ago? I forgot to tell you.' },
    { who: 'MONTAG', text: 'Four days.' },
    { who: N, text: 'The little radio goes back in her ear.' },
  ] },
  h2_sick: { lines: [
    { who: N, text: 'Morning. Fever, and the kerosene in your coat turns your stomach.' },
    { who: 'MONTAG', text: "I'm not going in tonight." },
    { who: 'MILDRED', text: "You've never been sick, not once. ...Oh! There's a car outside. It's Captain Beatty." },
  ] },

  // ---- 05 Beatty's Argument: keep the pillow book hidden ----
  p_1: { suspicion: { label: "BEATTY'S SUSPICION", caught: [
    { who: 'BEATTY', text: 'You know, Montag, I think I will have a look at that pillow.' },
    // Beatty gets up, crosses to the bed and draws the book out from under the pillow
    { steps: [{ set: { 'h2.sat': false } }, { npc: 'beatty', x: 618, ms: 1100 }, { npc: 'beatty', face: 1 }, { pose: 'beatty', p: 'reach' }, { fx: 'pillowPull' }, { wait: 450 }] },
    { who: 'BEATTY', text: 'What is this?' },
    // held beat, then black; the scene comes back at the first decision with everyone where they started
    { steps: [{ wait: 1500 }, { fade: 'out', ms: 1200 }, { fx: 'pillowReset' }, { set: { 'h2.sat': true } }, { wait: 250 }, { fade: 'in', ms: 700 }] },
  ] }, lines: [
    { who: 'BEATTY', text: "Thought I'd see how the sick man is. You were going to call in, weren't you? No, don't get up." },
    { who: N, text: 'He takes the good chair and lights his pipe.' },
    { who: 'BEATTY', text: 'Every fireman hits this wall sooner or later. He wants to know why the wheels turn. So. Listen.' },
    { who: 'BEATTY', text: 'It began with pictures. Film, radio, television. The world got bigger, so it had to get simpler. Books shrank. A classic, boiled to a paragraph.' },
    { who: 'MILDRED', text: 'Let me fix your pillow, Guy.' },
  ], choices: [
    { text: 'Let her.', again: true, suspicion: 1, reply: [{ who: N, text: "Her hand goes for the pillow. Beatty's eyes go with it." }] },
    { text: '"Not now, Millie. I\'m comfortable."', next: 'p_2' },
    { text: 'Push her hand away.', again: true, suspicion: 2, reply: [{ who: 'BEATTY', text: 'Jumpy today, Montag?' }] },
  ] },
  p_2: { lines: [
    { who: 'BEATTY', text: 'Faster. Click, flash, done. School gets shorter, the hard subjects fall away. Nobody ordered it, Montag. People wanted it.' },
    { who: 'BEATTY', text: 'More people, more groups, and every group has a toe you could tread on. So the books said less and less, and nobody minded when they stopped.' },
    { who: N, text: 'Mildred is back at the pillow.' },
    { who: 'BEATTY', text: "You like baseball, don't you?" },
  ], choices: [
    { text: '"Millie, stop it!"', again: true, suspicion: 2, reply: [{ who: 'BEATTY', text: 'Something under there bothering you?' }] },
    { text: 'Say nothing.', again: true, suspicion: 1, reply: [{ who: 'BEATTY', text: 'Montag? Baseball?' }] },
    { text: 'Pin the pillow with your elbow. "Fine game."', next: 'p_3' },
  ] },
  p_3: { lines: [
    { who: 'BEATTY', text: 'So the houses were fireproofed, and firemen got a new job: keeping the peace. Taking away the thing that makes people feel small.' },
    { who: 'BEATTY', text: 'A book is a loaded gun in the house next door.' },
    { who: 'BEATTY', text: 'Unload it, and nobody in that house ever has to feel stupid again. That is a kindness, Montag.' },
    { who: N, text: "Mildred's fingers stop on something hard." },
    { who: 'MILDRED', text: "What's this?" },
  ], choices: [
    { text: '"Sit down, Millie. We\'re talking."', next: 'p_4' },
    { text: '"It\'s nothing. Just a book."', again: true, suspicion: 1, reply: [{ who: N, text: "Too loud. Beatty's head turns." }] },
    { text: 'Grab it and hide it.', again: true, suspicion: 2, reply: [{ who: N, text: "Your hand moves. Beatty's eyes move with it." }] },
  ] },
  p_4: { set: { 'c05.done': true }, lines: [
    { who: N, text: 'She sits. Beatty relights his pipe as if nothing had happened.' },
    { who: 'MONTAG', text: 'The girl next door. Clarisse. What happened to her?' },
    { who: 'BEATTY', text: "We had a file on that family. The girl wanted to know why, about everything. That sort of question never ends well. She's better off." },
    { who: 'BEATTY', text: "One more thing. Every fireman gets curious once. Takes a book home to see what the fuss is. We don't get angry. We give him a day to burn it." },
    { who: 'BEATTY', text: 'After that, we come and help.' },
    { who: 'MONTAG', text: '...Of course.' },
    { who: 'BEATTY', text: "Get well, Montag. We'd miss you." },
  ] },

  // ---- 06 The Hidden Books ----
  h2_chair: { set: { 'c06.chair': true }, lines: [{ who: N, text: 'You drag the chair out into the hall, under the ventilator grill.' }] },
  h2_vent_locked: { lines: [{ who: N, text: 'The grill is out of reach. You need something to stand on.' }] },
  h2_millie: { lines: [
    { who: 'MONTAG', text: "Millie. I've had these a year. I don't know why. I should have told you." },
    { who: N, text: "Mildred looks at the books on the floor as she'd look at mice. Then she grabs one and runs for the kitchen incinerator." },
  ], choices: [
    { text: 'Catch her. "Wait. Give me a day. We\'re in this together."', set: { 'c06.millie': true }, reply: [{ who: 'MILDRED', text: 'Guy...' }, { who: 'MONTAG', text: "Just look at them with me. If the Captain's right, we'll burn them together." }] },
    { text: '"Go on, then. Burn it."', again: true, reply: [{ who: 'MONTAG', text: '...No. No, wait.' }] },
  ] },
  h2_door: { lines: [
    { who: 'FRONT DOOR', text: 'Mrs. Montag, Mrs. Montag, someone here, someone here...' },
    { who: N, text: 'A pause on the step. Nobody answers, and nobody opens the door.' },
    { who: 'MONTAG', text: "Don't move." },
  ] },
  h2_read: { set: { 'c06.still': true }, lines: [
    { who: N, text: 'The footsteps go away down the walk and over the lawn.' },
    { who: 'MONTAG', text: "Let's see what this is." },
    { who: N, text: 'You open a book at random and read aloud, slowly: thousands of people who chose to die rather than break their eggs at the wrong end.' },
    { who: 'MILDRED', text: "What does that even mean? It doesn't mean anything!" },
    { who: 'MONTAG', text: 'Then we read it again. Slower.' },
  ] },
};

export const ROOMS2: Record<string, RoomDef> = {
  station2: {
    id: 'station2', chapter: 2, label: '', width: 2400, spawnX: 2200, kit: 'station',
    npcs: [
      { id: 'beatty', fig: 'beatty', name: 'BEATTY', x: 1250, face: -1 },
      { id: 'black', fig: 'fireman', name: 'BLACK', x: 1060, face: 1, back: true },
      { id: 'stoneman', fig: 'fireman', name: 'STONEMAN', x: 1170, face: -1, back: true },
    ],
    quietUi: true,
    objective: (f) => !f['s2.hound'] && !f['s2.cards'] ? 'Look in on the Hound and sit in at cards' : !f['s2.hound'] ? 'Look in on the Hound' : !f['s2.cards'] ? 'Sit in at cards' : 'Answer the dispatch board',
    hints: (f) => {
      if (f['s2.hound'] && f['s2.cards']) return ['The shift is covered. Beatty wants an answer.', 'The dispatch board is on the right, near where you came in.', 'Walk to the dispatch board and press [E].'];
      if (f['s2.hound']) return ['One job is left on this shift.', 'The card table is in the middle of the room, to your left.', 'Walk left to the card table and press [E] to sit in.'];
      if (f['s2.cards']) return ['One job is left on this shift.', 'The Hound is in its kennel, to your left, past the dispatch board.', 'Walk left to the Hound and press [E] to touch it.'];
      return ['The night shift has started. Look around the firehouse.', 'The Hound is in its kennel to your left. The card table is further left.', 'Walk left to the Hound and press [E]. Then walk on to the card table and press [E].'];
    },
    enter: [{ key: 'e.station2', steps: [{ title: 'CHAPTER TWO', sub: 'A Book Under the Pillow' }, { say: 's2_days' }] }],
    hotspots: [
      { id: 'hound', x: 1770, label: 'Touch the Hound', required: true, script: 's2_hound1', doneFlag: 's2.hound', doneScript: 's2_hound_done',
        steps: [{ fx: 'houndGrowl' }, { fx: 'shake' }, { say: 's2_hound2' }] },
      { id: 'cards', x: 1110, label: 'Sit in at cards', required: true, script: 's2_cards', doneFlag: 's2.cards', doneScript: 's2_cards_done' },
      { id: 'dispatch', x: 2010, label: 'The dispatch board', required: true, requires: ['s2.hound', 's2.cards'], lockedScript: 's2_quiet',
        script: 's2_alarm', steps: [{ fx: 'alarm' }, { wait: 600 }, { goto: 'attic', x: 110 }] },
    ],
  },

  attic: {
    failTip: 'He turns on a beat. I can count it.',
    id: 'attic', chapter: 2, label: '', width: 1800, spawnX: 220, kit: 'attic',
    npcs: [
      { id: 'woman', fig: 'woman', name: 'THE WOMAN', x: 430, face: -1, scale: 1.2 }, // drawn stooped and small; this brings her up to Montag's height
      { id: 'beatty', fig: 'beatty', name: 'BEATTY', x: 1380, face: -1, watch: { period: 4200, on: 1800 }, when: (f) => !f['c04.book'] },
      { id: 'stoneman', fig: 'fireman', name: 'STONEMAN', x: 1580, face: -1, back: true, when: (f) => !f['a.down'] },
      // downstairs again: the men wait by the front door while the old woman makes her stand
      { id: 'beatty_h', fig: 'beatty', name: 'BEATTY', x: 300, face: 1, when: (f) => !!f['a.down'] },
      { id: 'stoneman_h', fig: 'fireman', name: 'STONEMAN', x: 235, face: 1, back: true, when: (f) => !!f['a.down'] },
    ],
    quietUi: true,
    // the hall is below the partition at x 1062, the attic above it
    walk: (f) => f['a.down'] ? [40, 1000] : f['a.fell'] ? [1070, 1760] : [40, 760],
    objective: (f) => !f['a.fell'] ? 'Climb the stairs to the attic' : !f['c04.book'] ? 'Hide the book under your coat' : 'Go back downstairs',
    hints: (f) => {
      if (!f['a.fell']) return ['Something is up here with you. Find the way up.', 'The stairs are to the right of the old woman.', 'Walk right to the stairs. You climb by yourself.'];
      if (!f['c04.book']) return ['Beatty is watching the attic. Wait until he looks away.', 'The hiding spot is in the middle of the attic, close to Beatty.', 'Hold [E] there only while Beatty looks away. If he turns, the attempt resets.'];
      return ['You have the book, and Beatty has not seen it.', 'The stairs down are at the left end of the attic.', 'Walk left to the stairs. You go down by yourself.'];
    },
    enter: [{ key: 'e.attic', steps: [{ fx: 'knob' }, { walk: 380, ms: 1300 }, { say: 'a_open' }] }], // in through the broken door
    hotspots: [
      // up: a framed climb, the attic opens empty, then the books come down on him
      { id: 'stairs', x: 700, label: '', auto: true, when: (f) => !f['a.fell'],
        steps: [{ fx: 'closeIn' }, { fx: 'climb' }, { fx: 'atticOpen' }, { wait: 500 }, { fx: 'bookfall' }, { say: 'a_books' }, { fx: 'bookDown' }, { fx: 'closeOut' }] },
      // down: he walks the stairs; Beatty and Stoneman wait in the hall
      { id: 'down', x: 1080, label: '', auto: true, when: (f) => !!f['c04.book'] && !f['a.down'], steps: [{ fx: 'descend' }] },
      { id: 'hide', x: 1140, label: 'Hide the book', py: 290, required: true, when: (f) => !!f['a.fell'] && !f['c04.book'],
        watcher: 'beatty', watchedScript: 'a_watched', script: 'a_hide', hold: { flag: 'c04.book', ms: 650, fx: 'pull', carry: { x: 1160, y: 300 } },
        // the held book is tucked under the coat, then the line plays
        steps: [{ pose: 'montag', p: 'hold' }, { fx: 'tuckBook' }, { pose: 'montag' }] },
      { id: 'woman', x: 520, label: '', auto: true, when: (f) => !!f['c04.book'] && !f['c04.plea'], script: 'a_woman',
        // her last stand, framed: she strikes the match, the men back out, the hall catches
        steps: [{ fx: 'closeIn' }, { wait: 800 }, { say: 'a_strike' }, { fx: 'strike' }, { wait: 500 },
          { npc: 'beatty_h', x: 120, ms: 900 }, { npc: 'stoneman_h', x: 170, ms: 800 }, { fx: 'hallFire' }, { fx: 'shake' }, { wait: 1300 },
          { walk: 190, ms: 1400 }, { fade: 'out', ms: 800 }, { fx: 'closeOut' }, { fx: 'glowOrange' }, { say: 'a_match' }, { wait: 700 }, { goto: 'home2', x: 900 }] },
    ],
  },

  home2: {
    failTip: 'Slow breaths. Hands still.',
    id: 'home2', chapter: 2, label: '', width: 2600, spawnX: 900, kit: 'home',
    dark: (f) => !f['h2.day'],
    props: [{ tex: 'k:chair', x: 905, y: 478, depth: 4.4, tint: 0xd8c8d0 }], // the bedside chair Beatty takes
    npcs: [
      { id: 'mildred', fig: 'mildred', name: 'MILDRED', x: 790, face: -1, when: (f) => !!f['h2.day'] },
      { id: 'beatty', fig: 'beatty', name: 'BEATTY', x: 150, face: 1, when: (f) => !!f['h2.beatty'] && !f['c05.done'], pose: (f) => f['h2.sat'] && !f['c05.done'] ? 'seatedLook' : undefined },
    ],
    quietUi: true,
    objective: (f) => {
      if (!f['c05.done']) return 'Answer Beatty.';
      if (!f['c06.chair']) return 'Bring the chair to the hall ventilator';
      if (!f['c06.vent']) return 'Pull the books out of the ventilator';
      return 'Stay still until she has passed.';
    },
    hints: (f) => {
      if (!f['c05.done']) return ['Beatty is sitting by your bed. Keep your answers calm.', 'Keep the book out of Beatty\'s sight.', 'Let Beatty finish before you move.'];
      if (!f['c06.chair']) return ['The ventilator grill is high on the hall wall. You need something to stand on.', 'The parlor chair is toward the right side of the house.', 'Walk right and press [E] to take the chair, then walk left to the grill.'];
      return ['The chair is in place. Now the grill.', 'The grill is toward the left side of the hall.', 'Walk left to the grill and hold [E] until it comes loose.'];
    },
    enter: [{ key: 'e.home2', steps: [
      { fx: 'dark' }, { walk: 836 }, { fx: 'toBed' }, { say: 'h2_night' }, { fade: 'out', ms: 900 }, { set: { 'h2.day': true } }, { fx: 'light' }, { fade: 'in', ms: 600 },
      { title: 'THE NEXT DAY' }, { say: 'h2_sick' }, { set: { 'h2.beatty': true } }, { npc: 'beatty', x: 905, ms: 2400 }, { npc: 'beatty', face: -1 }, { set: { 'h2.sat': true } },
      { say: 'p_1' }, { npc: 'beatty', x: 150, ms: 2400 }, { fx: 'bedUp' },
    ] }],
    hotspots: [
      { id: 'chair', x: 1830, label: 'Take the chair', required: true, when: (f) => !!f['c05.done'] && !f['c06.chair'], script: 'h2_chair' },
      { id: 'vent', x: 400, label: 'Pull out what you hid', py: 180, required: true, when: (f) => !!f['c05.done'],
        requires: ['c06.chair'], lockedScript: 'h2_vent_locked', hold: { flag: 'c06.vent', ms: 2400, fx: 'pull' } },
      { id: 'millie', x: 420, label: '', auto: true, when: (f) => !!f['c06.vent'] && !f['c06.still'], doneFlag: 'c06.still',
        steps: [{ npc: 'mildred', x: 560, ms: 1600 }, { say: 'h2_millie' }, { wait: 500 }, { say: 'h2_door' },
          { still: 5000, label: 'STAY STILL' }, { say: 'h2_read' }, { fade: 'out', ms: 900 }, { goto: 'home3', x: 900 }] },
    ],
  },
};
