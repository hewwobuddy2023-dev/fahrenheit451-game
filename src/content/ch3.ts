// Chapter 3 — The Sieve and the Sand (Part Two). Faber, the subway, Dover Beach, Beatty's duel of quotations.
// Public-domain texts: KJV Matthew 6:28; Matthew Arnold, "Dover Beach" (1867); Alexander Pope (1711).
import type { RoomDef, Script } from './types.ts';

const N = '';
const EAR = 'FABER (IN YOUR EAR)';

export const SCRIPTS3: Record<string, Script> = {
  f_open: { lines: [
    { who: N, text: 'Rain all afternoon. You read in the hall; Mildred keeps glancing through the door at the grey parlor wall.' },
    { who: 'MILDRED', text: "Books aren't people, Guy. You read, and I look round the room, and there's nobody in it." },
  ] },
  f_file: { set: { 'c07.file': true }, lines: [
    { who: N, text: 'In the wallet, under FUTURE INVESTIGATIONS, one name you never turned in. A man on a bench in a green park a year ago, one hand flat over his coat pocket.' },
    { who: N, text: 'He wrote his address on a slip. "For your file," he said, "in case you decide to be angry with me." Faber.' },
  ] },
  f_phone_locked: { lines: [{ who: N, text: 'You have no name to call yet. Check your file-wallet first.' }] },
  f_call: { lines: [
    { who: 'FABER', text: '...Hello? Who is this, please?' },
  ], choices: [
    { text: '"How many copies of the Bible are left in the country?"', set: { 'c07.call': 'bible' }, reply: [
      { who: 'FABER', text: "I don't know what you're talking about! This is a trap. I can't talk to just anyone!" },
      { who: N, text: 'A click, then the tone.' }] },
    { text: '"I need to ask you about a book."', set: { 'c07.call': 'book' }, reply: [
      { who: 'FABER', text: 'A book? I have no books. Not one. You know that as well as I do.' },
      { who: N, text: 'A click, then the tone.' }] },
  ] },
  f_leave: { lines: [
    { who: 'MILDRED', text: "The ladies are coming tonight! And you have to give that book back to the Captain, don't you? He knows you took one." },
    { who: 'MONTAG', text: "He doesn't know which one. I'll need a copy first." },
  ] },
  f_leave_locked: { lines: [{ who: N, text: 'Not yet. You have not phoned the name in the hall.' }] },
  fb_out_locked: { lines: [{ who: 'FABER', text: "No—wait. You haven't heard what I can do. Sit." }] },

  // ---- 08 The Sieve and the Sand (untimed recall) ----
  sb_1: { lines: [
    { who: N, text: 'The Bible open on your knee. Over the top of it, the train radio is shouting about toothpaste.' },
  ], puzzle: { title: 'The sieve and the sand', source: 'KJV Matthew 6:28 · Study the passage before the broadcast returns.',
    fragments: ['Consider the lilies of the field,', 'how they grow;', 'they toil not,', 'neither do they spin.'],
    distractions: ["Denham's Dentifrice!", 'Dandy dental detergent!'], interference: true },
    choices: [{ text: 'Hold on to the words.', next: 'sb_end' }] },
  sb_end: { set: { 'c08.verse': true }, lines: [
    { who: N, text: '"Consider the lilies of the field, how they grow; they toil not, neither do they spin."' },
    { who: 'TRAIN RADIO', text: "DENHAM'S DENTIFRICE!" },
  ], choices: [
    { text: '"Shut up! Shut up!"', set: { 'c08.shout': true }, reply: [{ who: N, text: 'Heads turn all down the carriage. Somebody says "guard".' }, { who: 'TRAIN', text: 'Knoll View!' }] },
    { text: 'Hold the line, silently.', set: { 'c08.shout': false }, reply: [{ who: 'TRAIN', text: 'Knoll View!' }] },
  ] },

  // ---- Faber's house ----
  fb_door: { lines: [
    { who: 'FABER', text: 'Who is it?' },
    { who: 'MONTAG', text: "Montag. Let me in. I'm alone, I swear." },
    { who: N, text: "The door opens on its chain. An old man, white as his own plaster, looking at the book under your arm and not at you." },
    { who: 'FABER', text: 'Is that... is that real paper?' },
  ] },
  fb_talk: { lines: [
    { who: 'FABER', text: "May I? ...It's been so long. Do you know they smell of nutmeg? Or some spice from a country far away." },
    { who: 'FABER', text: 'I am a coward, Mr. Montag. I saw where things were going and said nothing. Now. Why did you come? Be exact.' },
    { who: 'MONTAG', text: "Nobody listens. I can't talk to the walls because they talk back, and my wife listens to the walls. I want someone to teach me to understand what I read." },
    { who: 'FABER', text: "It isn't books you want. It's what used to be in them." },
    { who: 'MONTAG', text: "Then help me. We could print more. Hide copies in firemen's houses, call in the alarms, let them burn each other." },
    { who: 'FABER', text: 'Go home, Montag. That kind of talk gets people burned. Good night.' },
  ], choices: [
    { text: 'Start tearing pages from the Bible.', set: { 'faber.tear': 'tear' }, next: 'fb_three1', reply: [
      { who: N, text: 'You rip out a page. Another. Faber makes a sound as if you had hit him.' },
      { who: 'FABER', text: "Don't—stop. All right. All right! What do you want from me?" },
      { who: 'MONTAG', text: 'Teach me.' }] },
    { text: '"Please. There is no one else."', set: { 'faber.tear': 'plead' }, next: 'fb_three1', reply: [
      { who: 'FABER', text: "...I nearly let you walk out of here. That's how afraid I am. Come in. Mind the step." }] },
  ] },
  fb_three1: { lines: [
    { who: 'FABER', text: 'Then listen. Three things are missing from the world. Think before you answer. What is the first?' },
  ], choices: [
    { text: '"More books. Millions of them."', again: true, reply: [{ who: 'FABER', text: 'Numbers. The walls give us more every hour, and every hour is the same nothing. Think about what is IN a book.' }] },
    { text: '"Detail. Things written so you can see the pores in them."', next: 'fb_three2', reply: [{ who: 'FABER', text: 'Yes. Quality of information. Texture. Life you can actually see.' }] },
    { text: '"Faster reading. Summaries."', again: true, reply: [{ who: 'FABER', text: 'Speed is how they emptied us. Slower. What is in a good book that the walls leave out?' }] },
  ] },
  fb_three2: { lines: [{ who: 'FABER', text: 'And the second? Detail is useless if...' }], choices: [
    { text: '"...if the walls are louder than the book. Quieter walls."', again: true, reply: [{ who: 'FABER', text: 'A quiet wall is still a wall. It still will not let you argue back. What do you need, yourself?' }] },
    { text: '"...if someone just tells me what it means."', again: true, reply: [{ who: 'FABER', text: "Then you'd be borrowing my thinking, and I am a coward. No." }] },
    { text: '"...if you never get time to think it over."', next: 'fb_three3', reply: [{ who: 'FABER', text: 'Leisure to digest it. Time. Not the time they give us at a hundred miles an hour.' }] },
  ] },
  fb_three3: { lines: [{ who: 'FABER', text: 'And the third. The one I never had.' }], choices: [
    { text: '"The right to act on what the first two teach us."', set: { 'faber.three': true }, next: 'fb_ear', reply: [{ who: 'FABER', text: 'The right to carry out actions, based on the first two. That is where an old coward stops, Montag. That is where you begin.' }] },
    { text: '"Permission. From the Captain."', again: true, reply: [{ who: 'FABER', text: 'Beatty grants nothing but matches. Again.' }] },
    { text: '"Courage."', again: true, reply: [{ who: 'FABER', text: 'Courage comes after. What do you DO with what you have understood?' }] },
  ] },
  fb_ear: { set: { 'faber.ear': true }, lines: [
    { who: 'FABER', text: 'I know a printer who has been out of work forty years. That much I can do. And this.' },
    { who: N, text: 'In a back room of coils and crystals he gives you something green, no bigger than a bullet.' },
    { who: 'FABER', text: "In your ear. I'll hear what you hear, and I'll talk to you. Go to the firehouse tonight; we'll listen to your Captain together." },
    { who: 'FABER', text: "You held the verse on the train: that was the first. Tonight, with your wife's friends, take your time: that's the second. The third will cost you. Choose it carefully." },
  ] },

  // ---- 09 Dover Beach ----
  l_open: { lines: [
    { who: N, text: "The doorbell, then perfume. Mrs. Phelps and Mrs. Bowles, both talking before they're through the door." },
    { who: 'MILDRED', text: "Doesn't everyone look nice!" },
    { who: EAR, text: 'Easy. Let them sit.' },
  ] },
  l_off: { set: { 'c09.off': true }, lines: [
    { who: N, text: 'You reach behind the wall and pull the main switch. The colour runs out of the room.' },
    { who: 'MRS. BOWLES', text: 'Well! I was watching that.' },
    { who: 'MILDRED', text: 'Guy!' },
  ] },
  l_talk: { lines: [
    { who: 'MONTAG', text: "When do you suppose the war starts? I notice your husbands aren't here tonight." },
    { who: 'MRS. PHELPS', text: 'Oh, Pete was called up yesterday. Quick war, they said. Forty-eight hours and everybody home.' },
    { who: 'MRS. BOWLES', text: "It's always somebody else's husband, isn't it." },
    { who: EAR, text: 'Careful.' },
  ], choices: [
    { text: '"Have you ever known anyone who died in a war?"', set: { 'c09.b1': 'press' }, next: 'l_2', reply: [{ who: 'MRS. PHELPS', text: 'Jumping off buildings, yes. In a war? No. Nobody I know.' }] },
    { text: 'Say nothing.', set: { 'c09.b1': 'quiet' }, next: 'l_2' },
  ] },
  l_2: { lines: [
    { who: 'MRS. BOWLES', text: 'I voted for the tall one, last time. Such a nice-looking man.' },
    { who: 'MRS. PHELPS', text: 'Oh, but the other one mumbled. And he was short.' },
  ], choices: [
    { text: 'Go and get a book.', set: { 'c09.book': 'outburst' }, remember: 'Mildred', next: 'l_3', reply: [{ who: EAR, text: 'Montag, no! You will ruin everything!' }, { who: 'MILDRED', text: "Guy! ...Ladies, every fireman is allowed one book a year, to show how silly the old days were. Isn't that so, dear?" }] },
    { text: 'Bite your tongue.', set: { 'c09.book': 'restraint' }, next: 'l_3', reply: [{ who: EAR, text: 'Good. Hold it there.' }, { who: 'MILDRED', text: "Guy has a surprise! Every fireman gets one old book a year, to show how silly it all was. Read us something, dear." }] },
  ] },
  l_3: { set: { 'c09.read': true }, lines: [
    { who: EAR, text: 'Read, then. Slowly.' },
    { who: N, text: '"Dover Beach." Your mouth is numb; the first lines come out like gravel.' },
    { who: 'MONTAG', text: 'Ah, love, let us be true\nTo one another! for the world, which seems\nTo lie before us like a land of dreams,' },
    { who: 'MONTAG', text: 'So various, so beautiful, so new,\nHath really neither joy, nor love, nor light,\nNor certitude, nor peace, nor help for pain;' },
    { who: 'MONTAG', text: 'And we are here as on a darkling plain\nSwept with confused alarms of struggle and flight,\nWhere ignorant armies clash by night.' },
    { who: N, text: 'Mrs. Phelps has a handkerchief out. She looks surprised to find it in her hand.' },
    { who: 'MRS. BOWLES', text: 'You see? Poetry and tears, I always said so. You are a cruel man, Mr. Montag.' },
  ], choices: [
    { text: '"Go home. Think about your husbands, your children, how any of this happened."', set: { 'c09.outburst': true }, reply: [{ who: N, text: 'Two doors slam, one after the other.' }] },
    { text: 'Apologise and let them go.', set: { 'c09.outburst': false }, reply: [{ who: 'MONTAG', text: "I'm sorry. I don't know what I'm doing tonight." }, { who: 'MRS. PHELPS', text: "We'll let ourselves out." }] },
  ] },
  l_burn: { set: { 'c09.burned': true }, lines: [
    { who: EAR, text: 'Now. The incinerator. Put the book in.' },
    { who: N, text: 'The book goes down the brass slot. The rest you carry out to the bushes by the back fence. In the bathroom a tap runs and runs.' },
  ] },
  l_burn_locked: { lines: [{ who: N, text: 'Not yet. Read to the ladies first. The book is still in your coat.' }] },

  // ---- the firehouse: Beatty's duel of quotations ----
  st_duel: { lines: [
    { who: N, text: 'The kennel downstairs is empty tonight.' },
    { who: 'BEATTY', text: 'Well. The sheep returns to the fold.' },
    { who: N, text: 'You hand over the substitute book. He drops it in the wastebasket without looking at the title.' },
    { who: 'BEATTY', text: "Sit in on a hand. And hands on the table, Montag. Not that we don't trust you." },
    { who: 'BEATTY', text: 'I dreamed about you. We argued about books, you and I. You threw quotations at me and I threw them right back. "A little learning is a dangerous thing; drink deep, or taste not the Pierian spring."' },
    { who: 'BEATTY', text: 'Pope. You see? Books say anything. They turn on whoever trusts them.' },
    { who: EAR, text: "He wants you to argue. Don't." },
  ], choices: [
    { text: 'Keep quiet.', set: { 'st.reply': 'quiet' } },
    { text: '"Then why did you read them?"', set: { 'st.reply': 'ask' }, remember: 'Beatty', reply: [{ who: 'BEATTY', text: "To know what I'm burning. I read enough to be sure." }] },
  ] },
  st_alarm: { lines: [
    { who: 'BEATTY', text: 'What a pulse! Like the day after a war.' },
    { who: N, text: 'He reads the address off the slip, folds it small, and puts it in his breast pocket.' },
    { who: 'BEATTY', text: "Special case. I'll drive." },
    { who: N, text: 'Beatty drives, one elbow out in the wind, whistling. The Salamander slows. Stops.' },
    { who: 'MONTAG', text: '...This is my house.' },
  ] },
};

export const ROOMS3: Record<string, RoomDef> = {
  home3: {
    id: 'home3', chapter: 3, label: '', width: 2600, spawnX: 900, kit: 'home',
    npcs: [{ id: 'mildred', fig: 'mildred', name: 'MILDRED', x: 1830, face: -1 }],
    quietUi: true,
    objective: (f) => !f['c07.file'] ? 'Check your file-wallet in the bedroom' : !f['c07.call'] ? 'Phone the name in the hall' : 'Take the subway to Faber',
    hints: (f) => {
      if (!f['c07.file']) return ['The bedroom is where you left your things. Look for your file-wallet.', 'The file-wallet is right beside you, on the bedroom side.', 'Stand by the wallet and press [E] to open it.'];
      if (!f['c07.call']) return ['You have a name now. Use the phone.', 'The phone is at the far left of the hall.', 'Walk left to the phone and press [E].'];
      return ['It is time to leave for the subway.', 'The front door is at the far left.', 'Walk left to the door and press [E].'];
    },
    enter: [{ key: 'e.home3', steps: [{ title: 'CHAPTER THREE', sub: 'The Sieve and the Sand' }, { say: 'f_open' }] }],
    hotspots: [
      { id: 'file', x: 1000, label: 'Your file-wallet', required: true, script: 'f_file', doneFlag: 'c07.file', doneScript: 'f_file' },
      { id: 'phone', x: 290, label: 'The phone', required: true, requires: ['c07.file'], lockedScript: 'f_phone_locked', script: 'f_call', doneFlag: 'c07.call', doneScript: 'f_leave' },
      { id: 'door', x: 140, label: 'Leave for the subway', required: true, requires: ['c07.call'], lockedScript: 'f_leave_locked', script: 'f_leave', exit: { room: 'subway', x: 220 } },
    ],
  },

  subway: {
    id: 'subway', chapter: 3, label: '', width: 1400, spawnX: 220, kit: 'subway',
    npcs: [],
    quietUi: true,
    objective: (f) => !f['c08.verse'] ? 'Memorize the verse on the train' : 'Get off at Knoll View',
    hints: (f) => !f['c08.verse']
      ? ['The train is loud. Find a quiet moment to read.', 'The Bible is ahead to the right, on your seat.', 'Walk right to the Bible and press [E]. Study the verse first, then rebuild it from memory.']
      : ['The verse is yours now. Hold on to it.', 'The train is nearly at Knoll View.', 'Stay on the train until the station comes.'],
    hotspots: [
      { id: 'read', x: 620, label: 'Open the Bible', required: true, script: 'sb_1', doneFlag: 'c08.verse', doneScript: 'sb_end',
        steps: [{ fx: 'shake' }, { wait: 400 }, { goto: 'faber1', x: 220 }] },
    ],
  },

  faber1: {
    id: 'faber1', chapter: 3, label: '', width: 1500, spawnX: 220, kit: 'faber',
    npcs: [{ id: 'faber', fig: 'faber', name: 'FABER', x: 640, face: -1 }],
    quietUi: true,
    objective: (f) => !f['faber.ear'] ? 'Talk to Faber' : 'Go home before the ladies arrive',
    hints: (f) => !f['faber.ear']
      ? ['Faber is afraid of you. Find out what he knows.', 'Faber is ahead to the right, in the middle of the room.', 'Walk right to Faber and press [E]. Answer carefully when he asks.']
      : ['The ladies will be at the house tonight.', 'The way out is at the far left of this room.', 'Walk left and press [E] at the door to go home.'],
    enter: [{ key: 'e.faber1', steps: [{ say: 'fb_door' }] }],
    hotspots: [
      { id: 'faber', x: 640, label: 'Talk to Faber', required: true, script: 'fb_talk', doneFlag: 'faber.ear', doneScript: 'fb_ear' },
      { id: 'out', x: 140, label: 'Go home', required: true, requires: ['faber.ear'], lockedScript: 'fb_out_locked', exit: { room: 'home4', x: 1450 } },
    ],
  },

  home4: {
    id: 'home4', chapter: 3, label: '', width: 2600, spawnX: 1450, kit: 'home',
    npcs: [
      { id: 'mildred', fig: 'mildred', name: 'MILDRED', x: 1830, face: 1 },
      { id: 'phelps', fig: 'lady1', name: 'MRS. PHELPS', x: 1990, face: -1, when: (f) => !f['c09.read'] },
      { id: 'bowles', fig: 'lady2', name: 'MRS. BOWLES', x: 2150, face: -1, when: (f) => !f['c09.read'] },
    ],
    quietUi: true,
    objective: (f) => !f['c09.off'] ? 'Switch off the parlor walls' : !f['c09.read'] ? 'Talk to the ladies' : !f['c09.burned'] ? 'Burn the book in the incinerator' : '',
    hints: (f) => {
      if (!f['c09.off']) return ['The walls are loud. Mildred wants them left on.', 'The main switch is in the wall just ahead of you, to the right.', 'Stand by the wall switch and press [E] to pull it.'];
      if (!f['c09.read']) return ['The ladies are waiting. Say something to them.', 'Mrs. Phelps and Mrs. Bowles are on the right, past Mildred.', 'Walk right to the ladies and press [E] to talk.'];
      return ['The book is still in your coat.', 'The incinerator is just to your left.', 'Walk left to the incinerator and press [E] to burn the book.'];
    },
    enter: [{ key: 'e.home4', steps: [{ say: 'l_open' }] }],
    hotspots: [
      { id: 'switch', x: 1560, label: 'Switch off the walls', required: true, when: (f) => !f['c09.off'], script: 'l_off' },
      { id: 'ladies', x: 1990, label: 'Talk to the ladies', required: true, when: (f) => !!f['c09.off'] && !f['c09.read'], script: 'l_talk' },
      { id: 'incin', x: 1330, label: 'The incinerator', required: true, requires: ['c09.read'], lockedScript: 'l_burn_locked', script: 'l_burn',
        when: (f) => !f['c09.burned'], steps: [{ fade: 'out', ms: 900 }, { goto: 'station3', x: 316 }] },
    ],
  },

  station3: {
    id: 'station3', chapter: 3, label: '', width: 2400, spawnX: 316, kit: 'station',
    npcs: [
      { id: 'beatty', fig: 'beatty', name: 'BEATTY', x: 560, face: -1 },
      { id: 'black', fig: 'fireman', name: 'BLACK', x: 1060, face: 1, back: true },
      { id: 'stoneman', fig: 'fireman', name: 'STONEMAN', x: 1170, face: -1, back: true },
    ],
    quietUi: true,
    objective: () => '',
    hints: () => ['Beatty is waiting for you at the firehouse.', 'Listen to what he says. Nothing here needs you yet.', 'Wait for the scene to finish.'],
    enter: [{ key: 'e.station3', steps: [
      { fx: 'poleSlide' }, { say: 'st_duel' }, { fx: 'alarm' }, { say: 'st_alarm' }, { fade: 'out', ms: 900 }, { goto: 'lawn', x: 640 },
    ] }],
    hotspots: [],
  },
};
