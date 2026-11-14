// Chapter 2 — A Book Under the Pillow. Novel order: the Hound growls, the rule book, the old woman,
// that night (Clarisse mentioned in passing), Beatty's bedside visit, the ventilator grill.
import type { RoomDef, Script } from './types.ts';

const N = '';

export const SCRIPTS2: Record<string, Script> = {
  s2_days: { lines: [
    { who: N, text: 'For a week, Clarisse is somewhere along your way home every evening. Shaking a walnut tree. Pinning leaves to your door.' },
    { who: N, text: 'Then one evening the lawn next door is empty, and it stays empty.' },
  ] },
  s2_hound1: { lines: [{ who: N, text: 'The Hound lies in its kennel, humming. You reach out and touch its muzzle.' }] },
  s2_hound2: { set: { 's2.hound': true }, lines: [
    { who: N, text: 'It growls: a dry electric sizzle, like gears grinding. A silver needle slides out an inch, then back.' },
    { who: N, text: 'You back away and grab the brass pole.' },
    { who: 'BEATTY', text: 'Montag?' },
    { who: 'MONTAG', text: "It doesn't like me." },
    { who: 'BEATTY', text: "Like? It doesn't like or dislike anybody. It runs. We set the course, it follows through. Copper and batteries." },
    { who: 'MONTAG', text: 'Somebody could set it to my chemistry. Just a little. Enough to growl.' },
    { who: 'BEATTY', text: "Who'd do that? You don't have enemies here, Guy. We'll have it looked at." },
    { who: 'BEATTY', text: '...Unless something is weighing on you?' },
    { who: N, text: 'He watches you for a long moment. Then he laughs, very softly.' },
  ] },
  s2_hound_done: { lines: [{ who: N, text: 'The Hound hums. Its eyes stay dark.' }] },
  s2_cards: { set: { 's2.cards': true }, lines: [
    { who: 'CEILING VOICE', text: 'One thirty-five A.M. Thursday morning.' },
    { who: 'RADIO', text: '...war may be declared at any hour. The country stands ready...' },
    { who: 'MONTAG', text: 'That man last week. The one with the library. Where did they take him?' },
    { who: 'BEATTY', text: 'The asylum. A man who thinks he can hide from us is not thinking straight.' },
    { who: 'MONTAG', text: 'Was it always like this? I mean, way back. Did firemen ever put fires out?' },
    { who: 'STONEMAN', text: "Now that's rich." },
    { who: N, text: "Stoneman and Black slide their rule books across the table. The rule book's own history: firemen founded in 1790 to burn English-influenced books, Benjamin Franklin the first. Nobody checks it. Nobody can." },
    { who: 'BEATTY', text: 'Your play, Montag.' },
  ] },
  s2_cards_done: { lines: [{ who: 'BLACK', text: 'Your deal.' }] },
  s2_quiet: { lines: [{ who: N, text: 'The dispatch board is quiet. For now.' }] },
  s2_alarm: { set: { 's2.alarm': true }, lines: [
    { who: N, text: 'The bell in the ceiling kicks itself two hundred times. The cards fall like snow. The chairs are empty.' },
    { who: 'BEATTY', text: 'Montag! Your helmet!' },
  ] },

  // ---- 04 The Woman's House ----
  a_open: { lines: [
    { who: N, text: 'A flaking three-story house in the old part of the city. The door gives at the first blow.' },
    { who: N, text: 'An old woman stands in the hall, swaying, as if remembering something.' },
    { who: 'THE WOMAN', text: '"Play the man, Master Ridley; we shall this day light such a candle, by God\'s grace, in England, as I trust shall never be put out."' },
    { who: 'BEATTY', text: 'Enough of that. Where are they?' },
    { who: 'THE WOMAN', text: "You know where they are, or you wouldn't be here." },
    { who: 'STONEMAN', text: 'Neighbor says the attic.' },
    { who: 'BEATTY', text: 'Up!' },
  ] },
  a_books: { set: { 'a.fell': true }, lines: [
    { who: N, text: 'Books come down on you like a flock: on your shoulders, your arms, your face. One drops open into your hands.' },
    { who: N, text: 'In the dim light you catch a single line about time falling asleep in the afternoon sun. Then the page is gone.' },
  ] },
  a_watched: { lines: [{ who: 'BEATTY', text: "Montag! Up here! Don't just stand there!" }, { who: N, text: 'Not while he is looking.' }] },
  a_hide: { set: { 'c04.book': true }, lines: [
    { who: N, text: 'Your hand closes on the book and slides it under your coat.' },
    { who: N, text: 'You did not decide to. Your hand did.' },
  ] },
  a_woman: { lines: [
    { who: N, text: 'Kerosene everywhere. The woman kneels among her books, touching their spines.' },
    { who: 'THE WOMAN', text: "They're mine. You won't have them." },
    { who: 'BEATTY', text: "You know the law. Not one of these books agrees with another. Come on. The house is going up." },
    { who: N, text: 'She does not move.' },
    { who: 'BEATTY', text: 'One. Two.' },
  ], choices: [
    { text: 'Take her arm. "Please. Come with me."', set: { 'c04.plea': 'plead' }, next: 'a_woman2', reply: [{ who: 'THE WOMAN', text: 'No. Thank you, though.' }] },
    { text: 'Say nothing.', set: { 'c04.plea': 'silent' }, next: 'a_woman2', reply: [{ who: N, text: 'You stand there. Beatty keeps counting.' }] },
  ] },
  a_woman2: { lines: [
    { who: 'BEATTY', text: 'Three. Four.' },
    { who: 'THE WOMAN', text: 'You can stop counting.' },
    { who: N, text: 'She opens her hand. In it is a single kitchen match.' },
  ] },
  a_match: { lines: [
    { who: N, text: 'Outside, you turn back. She is standing on the porch, perfectly still.' },
    { who: N, text: 'She strikes the match herself.' },
    { who: N, text: 'In the truck, nobody speaks. Then Beatty does, without looking up.' },
    { who: 'BEATTY', text: 'Hugh Latimer. To Nicholas Ridley, at the stake in Oxford. Burned for heresy, fifteen fifty-five.' },
    { who: N, text: 'He knows. He has read it. He burned her anyway.' },
  ] },

  // ---- that night, and the next day ----
  h2_night: { lines: [
    { who: N, text: 'You slide the book under your pillow and lie down without turning on the light.' },
    { who: 'MONTAG', text: 'Millie. When did we meet? Where?' },
    { who: 'MILDRED', text: "Why, it was at... I don't know. Isn't that funny? It's been so long." },
    { who: 'MONTAG', text: 'Ten years. Only ten.' },
    { who: 'MILDRED', text: 'Oh. That girl next door. The family moved away. I think she got hit by a car. Four days ago. I forgot to tell you.' },
    { who: 'MONTAG', text: 'Four days.' },
    { who: N, text: 'Mildred puts the little radio back in her ear.' },
  ] },
  h2_sick: { lines: [
    { who: N, text: 'In the morning you have a fever. The smell of kerosene on your coat turns your stomach.' },
    { who: 'MONTAG', text: "I'm not going in tonight." },
    { who: 'MILDRED', text: "You've never been sick a day in your life. ...Oh. There's a car outside. It's Captain Beatty." },
  ] },

  // ---- 05 Beatty's Argument: keep the pillow book hidden ----
  p_1: { suspicion: { label: "BEATTY'S SUSPICION", caught: [
    { who: 'BEATTY', text: 'You know, Montag, I think I will have a look at that pillow.' },
    { who: N, text: 'You laugh, too loudly, and roll onto it. He watches you for a long moment, then waves his pipe. Not today.' },
    { who: N, text: 'He settles back and starts again from the beginning, slower. He is watching now.' },
  ] }, lines: [
    { who: 'BEATTY', text: 'Thought I would see how the sick man is. You were going to call in, weren\'t you?' },
    { who: N, text: 'He takes the best chair, lights his pipe, and takes his time.' },
    { who: 'BEATTY', text: 'Every fireman hits this sooner or later. He needs to know how the wheels turn. So listen.' },
    { who: 'BEATTY', text: 'It started with pictures. Film, radio, television. Things got big, so they got simple. Books got shorter. A classic, boiled down to a paragraph.' },
    { who: 'MILDRED', text: 'Let me fix your pillow, Guy.' },
  ], choices: [
    { text: 'Let her.', again: true, suspicion: 1, reply: [{ who: N, text: "Her hand slides toward the book. Beatty's eyes follow her hand." }] },
    { text: '"Not now, Millie. I\'m comfortable."', next: 'p_2' },
    { text: 'Push her hand away.', again: true, suspicion: 1, reply: [{ who: 'BEATTY', text: 'Jumpy today, Montag?' }] },
  ] },
  p_2: { lines: [
    { who: 'BEATTY', text: 'Speed it all up. Click, flash, done. School gets shorter, the hard subjects drop away. Nobody ordered that, Montag. People wanted it.' },
    { who: 'BEATTY', text: 'More people, more groups, and every group with a toe you could step on. So the books said less and less, and nobody minded when they stopped.' },
    { who: N, text: 'Mildred is tugging at the pillow again.' },
    { who: 'BEATTY', text: "You like baseball, don't you?" },
  ], choices: [
    { text: 'Pin the pillow with your elbow. "Fine game."', next: 'p_3' },
    { text: '"Millie, stop it!"', again: true, suspicion: 1, reply: [{ who: 'BEATTY', text: 'Something under there bothering you?' }] },
    { text: 'Say nothing.', again: true, suspicion: 1, reply: [{ who: 'BEATTY', text: 'Montag? Baseball?' }] },
  ] },
  p_3: { lines: [
    { who: 'BEATTY', text: 'So the houses were fireproofed and the firemen got a new job. Keeping the peace. Taking away the thing that makes people feel small.' },
    { who: 'BEATTY', text: 'A book is a loaded gun in the house next door.' },
    { who: 'BEATTY', text: 'Unload it, and nobody in that house ever has to feel stupid again. That is a kindness, Montag.' },
    { who: N, text: "Mildred's fingers have found the shape under the pillow. Her eyes go wide." },
    { who: 'MILDRED', text: "What's this?" },
  ], choices: [
    { text: '"Sit down, Millie. We\'re talking."', next: 'p_4' },
    { text: '"It\'s nothing. Just a book."', again: true, suspicion: 1, reply: [{ who: N, text: "Too loud. Beatty's head turns." }] },
    { text: 'Grab it and hide it.', again: true, suspicion: 1, reply: [{ who: N, text: "Your hand moves. Beatty's eyes move with it." }] },
  ] },
  p_4: { set: { 'c05.done': true }, lines: [
    { who: N, text: 'She sits, empty-handed. Beatty goes on as if nothing happened.' },
    { who: 'MONTAG', text: 'The girl next door. Clarisse. How did she... happen?' },
    { who: 'BEATTY', text: 'We had a file on that family. The girl wanted to know why about everything. That kind of question never ends well. She is better off.' },
    { who: 'BEATTY', text: 'One more thing. Every fireman gets curious once. Takes a book home, just to see. We don\'t get angry. We give him a day to burn it.' },
    { who: 'BEATTY', text: 'After that, we come and help.' },
    { who: 'MONTAG', text: '...Of course.' },
    { who: 'BEATTY', text: "Get well, Montag. We'd miss you." },
  ] },

  // ---- 06 The Hidden Books ----
  h2_chair: { set: { 'c06.chair': true }, lines: [{ who: N, text: 'You drag the chair out into the hall, under the ventilator grill.' }] },
  h2_vent_locked: { lines: [{ who: N, text: 'The grill is out of reach. You need something to stand on.' }] },
  h2_millie: { lines: [
    { who: 'MONTAG', text: "Millie. I've been hiding these for a year. I don't know why. I should have told you." },
    { who: N, text: 'Mildred stares at the books on the floor as if they were mice. Then she snatches one and runs for the kitchen incinerator.' },
  ], choices: [
    { text: 'Catch her. "Wait. Give me a day. We\'re in this together."', set: { 'c06.millie': true }, reply: [{ who: 'MILDRED', text: 'Guy...' }, { who: 'MONTAG', text: "Just look at them with me. If the Captain's right, we'll burn them together." }] },
    { text: '"Go on, then. Burn it."', again: true, reply: [{ who: 'MONTAG', text: '...No. No, wait.' }] },
  ] },
  h2_door: { lines: [
    { who: 'FRONT DOOR', text: 'Mrs. Montag, Mrs. Montag, someone here, someone here...' },
    { who: N, text: 'Footsteps on the walk. Then a slow, probing sniff under the door, and a smell like hot wiring.' },
    { who: 'MONTAG', text: "Don't move." },
  ] },
  h2_read: { set: { 'c06.still': true }, lines: [
    { who: N, text: 'The sniffing stops. Whatever it was moves off across the lawn.' },
    { who: 'MONTAG', text: "Let's see what this is." },
    { who: N, text: 'You open a book at random and read aloud, slowly: thousands of people who chose to die rather than break their eggs at the wrong end.' },
    { who: 'MILDRED', text: "What does that even mean? It doesn't mean anything!" },
    { who: 'MONTAG', text: "Then we start again. From the beginning." },
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
    objective: (f) => {
      const n = Number(!!f['s2.hound']) + Number(!!f['s2.cards']);
      return n < 2 ? `The night shift: look in on the Hound and sit in at cards (${n}/2)` : 'Answer the dispatch board';
    },
    enter: [{ key: 'e.station2', steps: [{ title: 'CHAPTER TWO', sub: 'A Book Under the Pillow' }, { say: 's2_days' }] }],
    hotspots: [
      { id: 'hound', x: 1770, label: 'Touch the Hound', required: true, script: 's2_hound1', doneFlag: 's2.hound', doneScript: 's2_hound_done',
        steps: [{ fx: 'houndGrowl' }, { fx: 'shake' }, { say: 's2_hound2' }] },
      { id: 'cards', x: 1110, label: 'Sit in at cards', required: true, script: 's2_cards', doneFlag: 's2.cards', doneScript: 's2_cards_done' },
      { id: 'dispatch', x: 2010, label: 'The dispatch board', required: true, requires: ['s2.hound', 's2.cards'], lockedScript: 's2_quiet',
        script: 's2_alarm', steps: [{ fx: 'alarm' }, { wait: 600 }, { goto: 'attic', x: 220 }] },
    ],
  },

  attic: {
    id: 'attic', chapter: 2, label: '', width: 1800, spawnX: 220, kit: 'attic',
    npcs: [
      { id: 'woman', fig: 'woman', name: 'THE WOMAN', x: 430, face: -1 },
      { id: 'beatty', fig: 'beatty', name: 'BEATTY', x: 1380, face: -1, watch: { period: 4200, on: 1800 }, when: (f) => !f['c04.book'] },
      { id: 'stoneman', fig: 'fireman', name: 'STONEMAN', x: 1580, face: -1, back: true },
    ],
    objective: (f) => !f['a.fell'] ? 'Climb the stairs to the attic' : !f['c04.book'] ? 'Hide the book under your coat, while Beatty is not watching' : 'Go back downstairs',
    enter: [{ key: 'e.attic', steps: [{ say: 'a_open' }] }],
    hotspots: [
      { id: 'stairs', x: 960, label: '', auto: true, when: (f) => !f['a.fell'], steps: [{ fx: 'books' }, { say: 'a_books' }] },
      { id: 'hide', x: 1140, label: 'Hide the book', py: 290, required: true, when: (f) => !!f['a.fell'] && !f['c04.book'],
        watcher: 'beatty', watchedScript: 'a_watched', script: 'a_hide', hold: { flag: 'c04.book', ms: 650, fx: 'pull' } },
      { id: 'woman', x: 520, label: '', auto: true, when: (f) => !!f['c04.book'] && !f['c04.plea'], script: 'a_woman',
        steps: [{ fade: 'out', ms: 800 }, { fx: 'glowOrange' }, { say: 'a_match' }, { wait: 700 }, { goto: 'home2', x: 900 }] },
    ],
  },

  home2: {
    id: 'home2', chapter: 2, label: '', width: 2600, spawnX: 900, kit: 'home',
    dark: (f) => !f['h2.day'],
    npcs: [
      { id: 'mildred', fig: 'mildred', name: 'MILDRED', x: 1180, face: -1, when: (f) => !!f['h2.day'] },
      { id: 'beatty', fig: 'beatty', name: 'BEATTY', x: 150, face: 1, when: (f) => !!f['h2.beatty'] && !f['c05.done'] },
    ],
    objective: (f) => {
      if (!f['c05.done']) return '';
      if (!f['c06.chair']) return 'Bring the parlor chair to the hall ventilator';
      if (!f['c06.vent']) return 'Hold [E] at the ventilator grill';
      return '';
    },
    enter: [{ key: 'e.home2', steps: [
      { fx: 'dark' }, { say: 'h2_night' }, { fade: 'out', ms: 900 }, { set: { 'h2.day': true } }, { fx: 'light' }, { fade: 'in', ms: 600 },
      { title: 'THE NEXT DAY' }, { say: 'h2_sick' }, { set: { 'h2.beatty': true } }, { npc: 'beatty', x: 1010, ms: 2400 },
      { say: 'p_1' }, { npc: 'beatty', x: 150, ms: 2400 },
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
