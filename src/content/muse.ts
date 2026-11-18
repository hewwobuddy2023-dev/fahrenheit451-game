// Montag thinking aloud: the guidance that replaces the narrator's hints. Lines are his own voice, short and plain.
// Each room gives four lines, in the order a stalled player hears them: [0] a thought about the job,
// [1] where it is ("{dir}" becomes a direction from Montag's position), [2] what to press, [3] a second way to say [2].
// The engine escalates 0, 1, 2 and then alternates 2 and 3, so no line repeats twice in a row.
import type { Flags } from '../state.ts';

export type Muse = [string, string, string, string];

const dark: Muse = ['The bedroom is cold. Mildred is asleep.', 'Morning. Then the walls.', 'I have to get up for work.', 'Wait for the lights.'];

export const MUSE: Record<string, (f: Flags) => Muse> = {
  burn: (f) => !f['c01.p3'] ? [
    'Forty years of books. All of them go tonight.',
    'The books are piled on the lawn. {dir}',
    'Kerosene. Hold E and pour it on all three piles. {dir}',
    'Stand in the middle of the books and keep holding E. {dir}',
  ] : !f['c01.lit'] ? [
    'Wet as a river. Only the match is left.',
    'The igniter is in my pocket. {dir}',
    'Stand by the pile and press E to light them. {dir}',
    'Press E now. Beatty is waiting. {dir}',
  ] : [
    'It is burning. Watch it go.',
    'The fire has the books now.',
    'Nothing to do but watch.',
    'Watch it go, Montag.',
  ],

  station1: () => [
    'The shift is over. Home.',
    'The bay door is at the far end. {dir}',
    'Walk all the way right and press E at the bay door. {dir}',
    'Past the card table and the kennel. {dir}',
  ],

  corner: (f) => !f['c02.meet'] ? [
    'Home is down this street. Keep walking.',
    'Home is to the right, past the lawns.',
    'Keep walking right.',
    'Hold D, or the right arrow.',
  ] : !f['c02.asked'] ? [
    'She keeps noticing things. Maybe I should too.',
    'The moon, the grass, the highway. {dir}',
    'Keep walking right toward her house. {dir}',
    'Press E when she points at something. {dir}',
  ] : [
    'Home is at the end of the street.',
    'My door is up ahead. {dir}',
    'Walk right to my door and press E. {dir}',
    'Go inside. Get this over with. {dir}',
  ],

  rain: () => [
    'Clarisse. In the rain, of all things.',
    'The firehouse is down the street. {dir}',
    'Walk on to work. Press E. {dir}',
    'Go on, Montag. Press E. {dir}',
  ],

  home1: (f) => !f['h1.day'] ? dark : !f['c03.t1'] ? [
    'She is on the sofa. I should say something.',
    'Mildred is on the sofa. {dir}',
    'Talk to her from behind the sofa. Press E. {dir}',
    'Say something to her, Guy. Press E. {dir}',
  ] : !f['c03.t2'] ? [
    'She heard me, and kept reading.',
    'Try again. {dir}',
    'Tell her about the bottle. Press E. {dir}',
    'She will not listen. Say it anyway. {dir}',
  ] : !f['c03.t3'] ? [
    'Ask her what she is reading.',
    'Mildred. {dir}',
    'Ask about the play. Press E. {dir}',
    'Keep her talking. Press E. {dir}',
  ] : !f['c03.script'] ? [
    'I have to tell her I am leaving.',
    'Say goodbye to her. {dir}',
    'Press E to say goodbye. {dir}',
    'Goodbye, Millie. Press E. {dir}',
  ] : [
    'Work. The door is at the far end.',
    'Go to work. {dir}',
    'Walk all the way left and press E at the door. {dir}',
    'The front door. Left, all the way. {dir}',
  ],

  home2: (f) => !f['c05.done'] ? [
    'Beatty is sitting by my bed. Keep calm.',
    'Keep the book out of his sight.',
    'Answer him. Let him finish before I move.',
    'Do not move yet.',
  ] : !f['c06.chair'] ? [
    'That grill is high. I need something to stand on.',
    'The chair is on the right side of the house. {dir}',
    'Take the chair, then bring it to the hall. Press E. {dir}',
    'The grill is on the left. {dir}',
  ] : !f['c06.vent'] ? [
    'The books are in the ventilator.',
    'Hold E at the grill and pull them out. {dir}',
    'Hold E until it comes loose. {dir}',
    'Pull them out, Montag. {dir}',
  ] : [
    'Mildred is in the hall. Do not move.',
    'Hold still until she has passed.',
    'Do not touch a key.',
    'Keep still.',
  ],

  attic: (f) => !f['a.fell'] ? [
    'Something is up here. Find the way up.',
    'The stairs are in the middle of the attic.',
    'Walk right to the stairs. They climb by themselves.',
    'Walk to the stairs.',
  ] : !f['c04.book'] ? [
    'Beatty is watching the attic. Wait until he looks away.',
    'The hiding place is in the middle of the attic. {dir}',
    'Hold E there only while he looks away. {dir}',
    'If he turns, the hold resets. Wait. {dir}',
  ] : [
    'I have the book. Beatty has not seen it.',
    'The woman and the stairs are on the left. {dir}',
    'Walk left to the woman by the stairs. {dir}',
    'Down the stairs, past the woman. {dir}',
  ],

  station2: (f) => !f['s2.hound'] && !f['s2.cards'] ? [
    'The Hound is in its kennel. Keep my distance.',
    'The Hound is to the left. {dir}',
    'Touch the Hound, then sit in at cards. {dir}',
    'Walk left to the Hound and press E. {dir}',
  ] : !f['s2.hound'] ? [
    'I should look in on the Hound.',
    'The kennel is on the left. {dir}',
    'Walk left to the Hound and press E. {dir}',
    'Touch the Hound. Press E. {dir}',
  ] : !f['s2.cards'] ? [
    'Sit in at cards before Beatty asks.',
    'The card table is on the left. {dir}',
    'Walk left to the table and press E. {dir}',
    'Sit in with the others. {dir}',
  ] : [
    'Beatty wants an answer from the board.',
    'The dispatch board is on the right. {dir}',
    'Walk right to the board and press E. {dir}',
    'Answer the board. {dir}',
  ],

  home3: (f) => !f['c07.file'] ? [
    'My file-wallet. I should check it.',
    'The wallet is by the bedroom side. {dir}',
    'Stand by it and press E. {dir}',
    'Open the wallet. Press E. {dir}',
  ] : !f['c07.call'] ? [
    'Faber. I have to phone the name.',
    'The phone is at the far left. {dir}',
    'Walk left to the phone and press E. {dir}',
    'Press E at the phone. {dir}',
  ] : [
    'The subway. I have to go.',
    'The front door is at the far left. {dir}',
    'Walk left to the door and press E. {dir}',
    'Get going. Left, through the door. {dir}',
  ],

  subway: (f) => !f['c08.verse'] ? [
    'Read the verse. Hold it in my head.',
    'The Bible is on the seat ahead. {dir}',
    'Walk to it and press E. {dir}',
    'Press E and read it slowly. {dir}',
  ] : [
    'I have the verse. Hold on to it.',
    'Stay on the train until Knoll View.',
    'Hold on to it. Stay put.',
    'Not yet. Knoll View is coming.',
  ],

  faber1: (f) => !f['faber.ear'] ? [
    'Faber is afraid of me. Talk to him.',
    'Faber is ahead, in the middle of the room. {dir}',
    'Walk to Faber and press E. {dir}',
    'Answer him carefully. Press E. {dir}',
  ] : [
    'The ladies will be at the house tonight.',
    'The way out is at the far left. {dir}',
    'Walk left and press E at the door. {dir}',
    'Go home. Left, through the door. {dir}',
  ],

  home4: (f) => !f['c09.off'] ? [
    'The walls are loud. Mildred wants them on.',
    'The main switch is in the wall ahead. {dir}',
    'Press E at the switch and pull it. {dir}',
    'Pull it. Then the room goes quiet. {dir}',
  ] : !f['c09.read'] ? [
    'The ladies are waiting for me to speak.',
    'Mrs. Phelps is on the right, past Mildred. {dir}',
    'Walk right to the ladies and press E. {dir}',
    'Talk to them. Press E. {dir}',
  ] : [
    'The book is still in my coat.',
    'The incinerator is to the left. {dir}',
    'Walk left and press E to burn it. {dir}',
    'Burn it. Press E at the incinerator. {dir}',
  ],

  station3: () => [
    'Beatty is waiting for me.',
    'Listen to what he says.',
    'Nothing here needs me yet.',
    'Wait for the scene to finish.',
  ],

  lawn: () => [
    'Home is right here on the lawn.',
    'The front door is just to the right. {dir}',
    'Walk right to the door and press E. {dir}',
    'Go in with the flame thrower. Press E. {dir}',
  ],

  home5: (f) => !f['c10.beds'] ? [
    'The house has to burn, room by room. Start with the beds.',
    'The beds are on the left. {dir}',
    'Hold E at the beds until they catch. {dir}',
    'Walk left and hold E. {dir}',
  ] : !f['c10.w1'] || !f['c10.w2'] || !f['c10.w3'] ? [
    'The beds are burning. The walls are next.',
    'The nearest wall that is not burning yet. {dir}',
    'Hold E at the wall until it catches. {dir}',
    'Hold E. The flame needs time. {dir}',
  ] : [
    'The house is burning. Get out.',
    'The front door is at the far left. {dir}',
    'Walk all the way left and press E. {dir}',
    'Go, Guy. Left, and press E. {dir}',
  ],

  lawn2: (f) => !f['ch4.books'] ? [
    'The last books are by the back fence.',
    'The fence is on the right. {dir}',
    'Press E at the fence to hop it. {dir}',
    'Then press E at the books. {dir}',
  ] : [
    'I have the books. Get clear of the street.',
    'The alley is at the far left. {dir}',
    'Walk left and press E to run. {dir}',
    'Run down the alley. {dir}',
  ],

  boulevard: (f) => !f['c11.crossed'] ? [
    'Wait for each car to pass before I step out.',
    'Wait on the island. Step out when the lane ahead is dark.',
    'Cross when the lane is clear. Do not run into it.',
    'Step out only in the dark, then wait on the next island.',
  ] : !f['c11.choice'] ? [
    'Black lives in one of these houses.',
    "Black's house is ahead on the right. {dir}",
    "Walk right to Black's house and press E. {dir}",
    "Go to Black's door. Press E. {dir}",
  ] : [
    'Keep moving. Faber is waiting.',
    "The road to Faber's street is at the far right. {dir}",
    'Walk all the way right and press E. {dir}',
    'Go on to Faber. {dir}',
  ],

  faber2: (f) => !f['c12.mask'] ? [
    'Faber has a plan to hide my trail.',
    'Faber is in the middle of the room. {dir}',
    'Walk to Faber and press E. {dir}',
    'Ask him how to cover my trail. Press E. {dir}',
  ] : [
    'The plan is set. Leave before the Hound finds my scent.',
    'The back door is on the right. {dir}',
    'Walk right to the back door and press E. {dir}',
    'Run for the river. Right, then press E. {dir}',
  ],

  run: () => [
    'Keep moving. The count is running.',
    'Stay in the dark gaps between the lights.',
    'Run through a gap. Wait in the dark for a light to pass.',
    'Watch each light sweep. Move when it passes.',
  ],

  river: (f) => !f['c13.shore'] ? [
    'The current has me. Keep swimming.',
    'The far bank is ahead. Watch the lights on the water.',
    'When a light reaches me, hold DOWN to sink under it.',
    'Let go of DOWN in the dark to breathe.',
  ] : !f['c13.track'] ? [
    'The bank. Now the track.',
    'The rail runs along the bank, to the right.',
    'Walk right along the bank until the track.',
    'Find the track, then follow it.',
  ] : [
    'The track leads to the camp.',
    'Keep walking right along the rail. {dir}',
    'Walk to the end of the track and press E. {dir}',
    'Follow the track to the camp. Press E. {dir}',
  ],

  camp: (f) => !f['cp.met'] ? [
    'Someone is waiting by a fire ahead.',
    'Go toward the firelight.',
    'Walk right toward the fire and stop there.',
    'Stop by the fire and see who is there.',
  ] : !f['c14.met'] ? [
    'These people want to know what I know.',
    'Granger is by the fire, in the middle. {dir}',
    'Walk to Granger and press E. {dir}',
    'He will ask what I can offer. Press E. {dir}',
  ] : !f['c15.ending'] ? [
    'Granger is still waiting for my answer.',
    'Granger is by the fire. {dir}',
    'Walk to Granger and press E to answer. {dir}',
    'Answer him. Press E. {dir}',
  ] : [
    'The fire is warm. I have answered.',
    'Stay by the fire.',
    'Stay by the fire a while longer.',
    'Sit by the fire.',
  ],
};
