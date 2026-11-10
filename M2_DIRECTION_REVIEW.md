# M2 Direction Review — Cinematic 2.5D and Literary Fidelity

**Status:** review only. No gameplay code, no dependencies, nothing committed. Awaiting approval.
**Date:** 2026-11-09 (evening). Deadline 2026-11-13; human playtests needed 2026-11-12.
**Labels:** **[V]** verified (read in code, seen in M1 screenshots, or read in the novel); **[R]** recommendation; **[A]** assumption.

The novel was read in full (Parts One to Three) from the user's private MOBI. A private, searchable copy and a detailed analysis live only in `Documents/F451_PRIVATE_REFERENCE/` (outside this repo). This public file paraphrases; it quotes only M1's own lines.

---

## 0. The honest headline

1. **[V] M1's Chapter 1 is not the novel's Chapter 1.** The book opens on a burn that Montag enjoys. It does not open on an equipment check. Several M1 lines also give Montag doubts he does not have yet.
2. **[R] The biggest risk in this request is scope, not technique.** The work list is:
   - a 2.5D upgrade across roughly 8 environments
   - 14 new challenges
   - 3 endings
   - character re-animation

   That has to be playable for two human testers by Nov 12. Only about two working days remain. It is achievable **only** if:
   - the visuals come from one reusable kit that each room fills with data, not hand-built rooms;
   - every challenge has a guaranteed "simple version" that ships first;
   - we accept dated go/no-go cut-offs (Section 11).
3. **[R] No engine change and no 3D is needed.** In Phaser 3, convincing depth comes from four cheap tricks: line-scrolled perspective floors, multi-speed layers, foreground occluders and per-character light tint and shadows. All are affordable on a Chromebook.

---

## 1. Critical visual review of M1

| Finding | Evidence | Why it reads "flat" |
|---|---|---|
| **[V]** The floor is a 70 px strip (13% of the screen). The wall fills 87%. | `FLOOR = 470` in `view.ts`; the floor is painted from y 470 to 540. | There is no ground plane to stand *in*. Everything is pinned to one baseline like a shelf. |
| **[V]** Every prop and character shares the same baseline and scroll factor 1.0. Only the city behind the windows moves at 0.35. | `stage.ts`: all props use `setOrigin(0.5, 1)` at `FLOOR`. | Nothing passes in front of Montag and nothing recedes, so depth is never staged. |
| **[V]** Characters are thick stroked lines: 9–11 px limbs, a circle head, no face profile and no hands. | `figure()` in `art.ts`. | They read as icons, not people. At 162 px tall they are small against a 540 px frame. |
| **[V]** The walk cycle has 8 procedural frames with straight legs and no heel strike. Montag's idle is a single static frame. | `sheet()` / `walk` animation. | Movement feels mechanical. A still figure looks paused. |
| **[V]** All NPCs share one body; only the hat or pipe differs. The firemen are identical. | `paintAll()` | Beatty does not stand out as the most important figure on screen. |
| **[V]** Lights are flat additive trapezoids with no shadows on characters. Only Montag has a floor reflection. | `cone` texture; `refl` sprite. | Light never *touches* anyone, so the scene looks lit separately from its actors. |
| **[V]** The camera only pans horizontally. There is no zoom, no framing for dialogue and no vertical composition. | `update()` camera lerp. | Conversations look exactly like walking. There are no cinematic beats. |
| **[V]** A row of floating diamonds sits at y 196, in mid-wall, above every hotspot. | `MARK_Y = 196` | It is a UI layer floating over the world: clutter that does not belong to the space. |
| **[V]** The story is told by text cards: the chapter card over gameplay and a text-only end card. | `intro()`, `EndScene` | This is the "static text card" reliance you named. |
| **[V] Kept: what works** | Screenshots | The palette discipline (charcoal, cream, ember), the sky through the windows, the lamp cones, the Hound alcove, the readable UI and the sharp text. |

---

## 2. Literary fidelity review (grounded in the text)

| Topic | What the novel actually does [V] | M1 / current spec status |
|---|---|---|
| Opening | A night burn; Montag fiercely enjoys it. Afterwards he whistles, polishes his helmet and takes the subway home. | M1 opens on a gear inspection and an alarm. **Wrong beat.** |
| Montag's state | He is content and proud, with an unnamed unease. **He has already hidden about 20 books behind the hall ventilator grill over the past year**, and he met Faber in a park a year ago without reporting him. On the first night he only *glances* at the grill and looks away. | M1 gives him open doubt on the first night ("Maybe that should worry me", "Haven't they?"). **Too early, and stated aloud.** |
| Kerosene | He tells Clarisse it is like perfume to him. | M1: "I don't even smell it anymore" **contradicts the text.** |
| Firemen's history and rules | Stoneman and Black lay out the rule book (founded 1790, Franklin, five rules) at the firehouse card table. This comes later, the night of the old woman's alarm. | M1 has it as a wall plaque on night one, plus a doubting line. Wrong time and wrong voice. |
| The Hound | It growls at Montag about a week into the story, at 1 a.m. Beatty says it doesn't like or dislike anyone, it simply "functions", then asks whether Montag has a guilty conscience. | M1 gives Montag that idea ("A machine shouldn't care") on night one. **The line belongs to Beatty, later.** |
| Beatty | Witty, warm and fluent. He quotes literature to beat literature. He argues the censorship **grew from below**: mass media, speed, the pressure of minorities, the public's appetite. It was not imposed from above. He knows about the stolen book and allows "24 hours". | M1's Beatty sounds like a villain ("A fireman with idle hands starts to think", "No questions, no worries"). **The book directly supports your "no evil government" request.** |
| The old woman | Neighbor's tip; attic full of books; she recites Latimer's 1555 words. Montag's *hand* steals a book. He pleads with her to come. **She strikes the match herself.** | The spec's "Woman's House" is close; the theft and the pleading need to be the mechanic. |
| Beatty's argument | Delivered **at Montag's bedside** on his sick day. Meanwhile Mildred, fixing the pillow, feels the hidden book. | The spec puts "Beatty's Argument" as a claims-matching puzzle in Chapter 2, after "Hidden Books". **Order is reversed, and the puzzle is a quiz.** |
| The hidden books | After Beatty leaves, Montag climbs a chair and pulls about 20 books from the vent. Mildred runs one to the incinerator; he stops her. Later the Hound sniffs at the door. | The spec's "suspicion meter while hiding" is close; the vent reveal is the stronger beat. |
| Clarisse | 17. Concrete and playful, says "My uncle says…", apologizes when she upsets him. Present for about a week, then gone. **Mildred mentions her death in passing, four days late.** Beatty later says her family was watched. | The spec treats her well. The M1 end card announces her in advance. |
| Faber | Fear and shame. Three missing things: quality, leisure, the right to act. Montag **rips pages from the Bible** to force his help. The green earpiece follows. | The spec's "two clues and two ideas" is generic. The earpiece is the best mechanic in Part Two and should drive Chapter 3. |
| Sieve and sand | Montag tries to memorize scripture (the lilies) while a toothpaste jingle blares; he snaps and leaves the train. | The spec is close; must be **untimed** (see Section 7). |
| Dover Beach | With Faber begging in his ear, Mildred invents a cover story, Montag reads. Mrs. Phelps cries, Mrs. Bowles is furious. He drops the book in the incinerator. | The spec is close; add the earpiece tension. |
| The climax | **Mildred turned in the alarm.** Montag burns his own house, beds first, then the three parlor walls. Beatty finds the earpiece. **Montag kills Beatty with the flame thrower**, then destroys the Hound, which wounds his leg. Later he thinks Beatty wanted to die. | The spec says "confront Beatty, no combat". **The canonical event is a killing.** That is a decision for you (Section 12). |
| Flight | Ten-lane boulevard; joyriding teenagers nearly run him down for fun. He plants books in fireman Black's house and calls in the alarm. Faber's sprinklers mask his scent. The city counts to ten while every door opens. He reaches the river and drifts. | The spec's "spotlight evasion" is invented. The book has better set pieces. |
| Ending | Granger's fire, which warms instead of burning. Police fake his capture on TV. The book people. Bombs flatten the city in seconds. The Phoenix. They walk back toward the city to help. | The spec's three endings must keep **the bombing in all three** to stay faithful. |

**Fair foreshadowing versus announcing [R].** The book's own method is *unexplained detail*: the glance at the grill, the perfume he believes in, the lit-up house next door. The game should show these without comment and never say what they mean. M1's end card ("a house full of books is waiting") is the counter-example.

---

## 3. M1 lines to revise

All quoted lines are M1's own text. The replacements are original drafts, offered as tone samples.

| Where | M1 line | Problem | Direction / sample replacement |
|---|---|---|---|
| `pump` | "I don't even smell it anymore. Maybe that should worry me." | Contradicts the book; announces doubt. | He likes it. *MONTAG: "Smells like a clean night's work."* |
| `plaque` | "Firemen have always started fires. Haven't they?" | Doubt comes too early. | Cut from Ch1. Move the rule-book history to Stoneman and Black in Ch2, spoken as routine, e.g. *BLACK: "Page one. Read it to the rookie in your head, Montag."* |
| `hound` | "It doesn't like me. A machine shouldn't care either way." | It takes Beatty's idea and gives it to Montag too early. | Ch1: the Hound hums asleep; no prompt line. Ch2: Montag says it doesn't like him. *BEATTY: "It doesn't like. It doesn't dislike. It runs."* |
| `beatty` | "A fireman with idle hands starts to think." | Cartoon villain telegraph. | Warm captain: *BEATTY: "Go home, Montag. Sleep. The city does its best burning in the dark."* |
| `beatty_done` / dispatch reply | "Duty is a kind of comfort, isn't it? No questions, no worries." | States the theme aloud. | Cut. Beatty's philosophy belongs to the Ch2 bedside scene, where he argues it well. |
| dispatch choice | "What's in those books, Captain?" | Montag in Part One would not ask this aloud. | Replace the choice with tone only, at the burn: *"Light it." / "Your fire, Captain."* |
| `rack` | "Four hundred fifty-one degrees. Hot enough for paper to burn." | Explaining his own helmet to the player. | Show it: Montag polishes the helmet; the camera holds on "451". No narration. |
| `rack_done` | "Everything is always ready." | Artificially ominous. | Cut. |
| `EndScene` | "Somewhere ahead, a house full of books is waiting." / "…a girl named Clarisse will ask Montag a question he cannot answer." | Spoils discovery and announces Clarisse and the change. | Removed; the end card is replaced by the actual next scene. |

**Writing rules for M2 [R]:**
- No narrator interpretation; narration states only what is seen or done.
- At most 2 lines per dialogue box and about 1–3 boxes per beat.
- Montag's early answers are quick and deflecting; later ones get shorter and rawer, not more eloquent.
- Beatty is always the smartest voice in the room.
- Clarisse asks and observes but never explains the theme.

---

## 4. Proposed opening sequence (Chapter 1, about 3 minutes)

**Scene A — "The Burn" (exterior street at night; Challenge 01, rewritten).**
- **Opening:** cold open on the street. Montag already has the hose. Stoneman and Black throw books from the upper windows.
- **Player task:** soak three book piles. Stand at a pile and hold ACT; a kerosene arc pours and the pile darkens.
- **Ignition:** Beatty offers the igniter with a two-option tone choice. The player ignites (ACT) and the fire blooms.
- **Camera:** slow push-in on Montag's silhouette against the flames. The title "FAHRENHEIT 451" rises in the smoke, in-engine rather than on a card.
- **Tone:** no doubt, no narration.
- **Complete when:** 3 piles soaked and the fire lit.

**Scene B — Firehouse return (the M1 station, reused; about 30 s, no challenge).**
- Hang and shine the helmet at the rack (one inspect), then head for the exit.
- The Hound hums in its kennel. No interaction, no growl yet.
- A low "time-voice" reads the hour, which is a detail from the book.

**Scene C — The corner (suburban street at night; Challenge 02 "Clarisse's Question").**
- **Arrival:** an escalator transition into a leafy street. At the corner Montag slows on his own (a scripted half-step) and leaves swirl. Clarisse is there.
- **Walk-and-talk:** the camera frames both of them and she keeps pace. Three times she stops at something: the moon, dew on the lawn, the long billboard glow.
- **Player choice at each stop:** stop and look (release the movement keys near her) or keep walking. Her next line reacts. She notices when he answers without thinking.
- **One dialogue choice** about the kerosene: *"Perfume, to me."* (canon) / a shrug.
- **At her lit house** she asks if he is happy and runs before he answers.
- **Complete when:** the walk is finished, with 3 stop-or-continue choices recorded.

**Scene D — Home (Challenge 03 "Parlor Walls").**
- **Entry:** the door recognises his hand. In the hall the camera tilts briefly up to the ventilator grill and back. No prompt, no text. This is fair foreshadowing.
- **Bedroom, a non-interactive beat (about 10 s, non-graphic):**
  - The bedroom is dark; his igniter's small flame shows Mildred lying still and a glint under the bed.
  - Jets howl overhead; Montag reaches for the phone; cut.
  - **No fail state, no score.**
- **Afternoon: the challenge.** Mildred is in the parlor; three walls of colour show the "family".
  - The player must get through to her: inspect each wall, speak to her three times (each attempt is cut off by a wall cue), read the last page of her script, then ask whether it ends happily.
  - **Complete when:** 3 walls inspected, 3 attempts to talk, and the script page read.
- **Exit:** walk out into the rain. Optionally, Clarisse is in the rain with the dandelion. That is a short scene, not a challenge, and the first thing to cut.

---

## 5. Technical plan for 2.5D depth (Phaser 3.90, no new dependencies)

| Technique | Visual payoff | Cost | Verdict |
|---|---|---|---|
| **Line-scrolled perspective floor:** split the floor (now ~30% of the screen, y ≈ 360–540) into 6 horizontal strips with scroll factors from 1.0 at the back to 1.35 at the front. Each strip is a tileSprite of painted planks, tiles or asphalt with converging lines. | Real perspective: the floor shears as the camera moves, the single strongest 2.5D cue. | 6 quads; texture 1 × width. | **Adopt.** |
| **Layer stack per room:** far (0.15–0.3), mid (0.5–0.8), back wall (0.9–1.0), playfield (1.0), near occluders (1.2–1.5). Far layers are tinted toward a fog colour (atmospheric perspective). | Distinct near, mid and far; depth haze. | 4–6 images per room. | **Adopt.** |
| **Foreground occluders:** pillars, railings, door frames, parked beetles and banisters at scroll 1.25–1.4. They fade to 35% alpha while overlapping Montag. | Objects pass *in front* of the player; occlusion without hiding him. | Bounds check per occluder per frame. | **Adopt.** |
| **Receding architecture painted in perspective:** corridors, the attic stairwell, the subway tunnel and the street vanishing point, painted with a vanishing point and given scroll 0.9. | Spaces that lead back into the frame. | Painting only. | **Adopt.** |
| **Contact and cast shadows:** a blurred ellipse at the feet plus the same frame tinted black at 30% alpha, squashed and skewed away from the key light. | Characters sit on the ground and the light touches them. | +2 sprites per character. | **Adopt.** |
| **Light-driven rim tint:** each frame, tint characters from the nearest of up to 6 light points (warm under lamps, cold near windows and TV walls). | People walk *through* light. | About 6 distance checks per character. | **Adopt.** |
| Baked light pools on floors and walls, plus additive glow sprites (as in M1). | Controlled amber and red pools. | Existing. | **Keep.** |
| Slow drifting smoke: 6–10 large soft sprites per scene, alpha ≤ 0.15. | Air and atmosphere. | Low. | **Adopt.** |
| **Camera framing:** zoom ×1.0 → ×1.12 tween on dialogue, centred between speakers; scripted pans; a 1–2 px idle drift (can be turned off). | Cinematic beats. | Tweens only. | **Adopt.** |
| Phaser Light2D with normal maps | Per-pixel lights. | Per-pixel shading, needs normal maps for every texture; heavy on Chromebook GPUs. | **Reject.** |
| Continuous full-screen post effects (bloom, CRT shader) | Glow / CRT. | Full-screen shader every frame. | **Reject.** Static scanlines only, plus CRT effects on TV transitions only. |
| Real 3D (meshes, Three.js) | True depth. | New engine, new pipeline. | **Reject** (also your constraint). |
| Optional depth lane (walk up and down within the floor band) | More 2.5D freedom. | Collision, depth sorting, more touch controls; changes the approved movement. | **Reject for M2.** Keep strict horizontal movement on a mid-floor walk line. |

---

## 6. Reusable systems for every chapter

1. **Room kit (data-driven):** each room is a data entry listing:
   - its layers (texture painter, scroll factor, fog tint)
   - its floor strip style
   - props (back or front)
   - lights (position, colour, radius)
   - smoke and weather
   - hotspots, cutscene triggers and the walk-line height

   Painting happens **lazily when a chapter starts**, and the textures are freed when the player leaves (see Section 9).
2. **Character painter v2 (Canvas 2D, no files):**
   - **Proportions:** about 170 px tall, with head profile (nose, jaw), shoulders, hands and coat tails.
   - **Walk:** 12 frames with contact, down, pass and up positions, arm bend, and coat-tail lag.
   - **Idle:** 4 frames of breathing and weight shift.
   - **Other:** 2 talk-gesture frames and 1 three-quarter "look" frame.
   - **One painter, varied by parameters:**
     - Montag: helmet with a long rear brim, coat with a salamander patch.
     - Beatty: taller, captain's hat, pipe, heavy slicker.
     - Clarisse: the only white figure, with loose hair and a dress that moves.
     - Mildred: thin, straw hair, robe, a small glowing Seashell.
     - Faber: stooped, black suit.
     - Granger: beard, denim.
     - Firemen: helmets in varied poses.
3. **Lighting helpers:** light points per room drive the character tint, shadow direction and floor glow.
4. **FX kit:**
   - **Fire:** an 8-frame procedurally painted flame sheet in 3 sizes, plus embers (≤ 40) and glow flicker. Two palettes: *destroying* (red-orange, fast) and *warming* (amber, slow) for Granger's fire.
   - **Other:** smoke, rain (≤ 60 streaks), leaves (≤ 25), sparks and a CRT power-off wipe.
   - **Reuse:** the fire kit is used **four times** (opening burn, the old woman's house, Montag's house, the campfire).
5. **Cutscene runner:** a list of data steps: move to, face, say, camera pan or zoom, wait, flash, fade, sound cue, set flag. It replaces text cards and handles all scripted beats. It also positions characters for dialogue: Montag walks to a mark facing the speaker and the non-speakers are dimmed.
6. **Five challenge mechanic types** (each challenge in Section 7 maps to one; all use only left, right, up, down and act; none rely on colour alone):
   - **T1 Inspect & choose:** the M1 system.
   - **T2 Act while watched:** an observer with a visible "watching" eye icon plus the text "WATCHING"; act only while unobserved; being seen resets to a checkpoint.
   - **T3 Fill / target:** hold ACT at targets to fill a meter shown as a bar plus a percentage.
   - **T4 Telegraphed crossing:** sweeps (lights, cars, the Hound) on a fixed, readable timeline; move, wait or stand still; being caught resets to a checkpoint.
   - **T5 Recall:** choose the next fragment from 3 options with up/down/act, **untimed**, with distractor fragments taken from the ads or noise.
7. **UI changes:**
   - Remove the floating diamond row. Objects in reach brighten (an additive copy) and the prompt anchors at the object's top edge.
   - The objective panel shrinks and fades after 6 s, coming back when the objective changes.
   - Toasts move into the objective area so they never collide with prompts.
   - The dialogue box keeps a 2-line maximum.
8. **Performance governor:** see Section 9.

---

## 7. Challenge design: the new 01 plus the remaining 14

Novel order is preserved. **Changes from `CHALLENGES.md`** are marked ✱ and need approval. Every challenge has a **simple version** (inspect plus choice) that ships first, and a **full version** where time allows.

| # | Chapter / scene (novel source) | Player physically does | Decision | Why meaningful | Completion check | Fun? | Risk | Simple version |
|---|---|---|---|---|---|---|---|---|
| 01 ✱ | Ch1 · the opening burn (Part 1, opening) | **T3:** soak 3 piles, then ignite | Tone at the igniter | Shows the pleasure of the work before any doubt | 3 piles soaked + ignition | High: kinetic, fire payoff | Low–med | Inspect 3 piles + choose |
| 02 | Ch1 · the first walk with Clarisse | Walk-and-talk; stop or keep walking at 3 things she notices | 3 stop/continue choices + kerosene reply | Clarisse's whole method is noticing; the player literally chooses whether to look | Walk finished; 3 choices recorded | Med–high | Med (staging) | Dialogue with 3 choices |
| 03 | Ch1 · the parlor play and Mildred | Inspect 3 walls, try to speak 3 times through the noise, read the script's last page | What he asks her | Shows her dependence through surroundings, not commentary | 3 walls + 3 attempts + script | Med | Low | Same, without wall animation |
| 04 | Ch2 · firehouse night → the old woman's house | Hound growl and rule book at the station (scripted). In the attic, books fall; **T2:** hide one under the coat while Beatty is not watching; then plead or stay silent | Plead or not (the woman's choice is fixed: she lights the match) | The hand stealing the book is the novel's turning point; her death is witnessed, never scored | Book hidden + response chosen | High | Med | Choice-only: take the book / leave it (canon fixes it as taken) |
| 05 ✱ "Beatty's Argument" (was 06) | Ch2 · the sick day: Beatty at the bedside | Turn-based: each beat Beatty speaks (condensed, original) while Mildred edges toward the pillow. Choose: answer Beatty / shift the pillow / snap at Mildred. If Beatty notices, retry. | How to keep the book hidden | Beatty's real argument heard under pressure: the scene's actual tension | Lecture finished without Beatty noticing | High | Med | Lecture as dialogue + 2 choices |
| 06 ✱ "The Hidden Books" (was 05) | Ch2 · the vent reveal | Drag a chair, open the grill, pull books out (repeated ACT); stop Mildred at the incinerator (move to block); the Hound sniffs at the door: stay completely still for 5 s while the shadow passes (T4) | Plead with Mildred: two original options | The secret becomes shared, then threatened | Books out + Mildred stopped + Hound passed | High | Med | Inspect vent + choice |
| 07 | Ch3 · finding Faber | Search the bedroom closet file-wallet for the "future investigations" entry; phone Faber (he hangs up); leave for the subway | What to ask on the phone | Montag reaching out for the first time; Faber's fear | Address found + call made | Med | Low | Same |
| 08 | Ch3 · the subway | **T5:** rebuild the "lilies" verse (public-domain KJV) word group by word group. The toothpaste jingle offers distractor options; wrong picks make the sand-sieve visual drain but never fail. Then he leaves the train at Knoll View. | Optional outburst in the carriage | The sieve and sand made playable | Verse completed | Med–high | Low | 3-step recall |
| 09 | Ch3 · Faber's house → Dover Beach | Faber's house as a scene, with one choice: tear the Bible pages (canon) or plead. Then the ladies: Faber whispers advice at the top of the screen while Montag acts; 3 beats of follow Faber or follow the impulse; read Dover Beach (public-domain lines shown); see Phelps cry; drop the book in the incinerator | Restraint vs. outburst, recorded as a flag | The earpiece tension; poetry's effect on people | Poem read + reaction seen | High | Med | Choices + poem |
| 10 | Ch4 · Montag's house | **T3:** burn his own house: beds, then the three parlor walls. Beatty confrontation as a cutscene: choose Montag's words. **The killing is depicted per your decision (Section 12).** Hound leap: press ACT inside a generous telegraphed window; a miss resets that beat only. | What he says to Beatty | The book's climax; the walls burning is Mildred's world ending | Walls burned + confrontation + Hound | High | Med–high (sensitive) | Burn targets + cutscene |
| 11 | Ch4 · the boulevard and Black's house | **T4:** cross ten lanes under arc lamps; walking is slower and safer, running is faster but draws headlights; the joyriders' car is a scripted near-miss (falling flat). Then at Black's house: plant books or walk on. | Plant books (canon) or not, recorded | Breaking with authority, and the indifference that killed Clarisse | Boulevard crossed | High | Med | Crossing only |
| 12 | Ch4 · Faber's sprinklers → the count of ten | **T1:** pick 3 correct scent-masking steps at Faber's. Then **T4:** run to the river while a public count of ten opens doors; lit doorways are hazards and the Hound is shown on parlor walls through windows | Which masking steps | The city itself becomes the Hound | River reached without capture | High | Med–high | Masking choice + short run |
| 13 | Ch5 · the river and the land | Drift: helicopter searchlights sweep the water; hold DOWN to submerge (T4). Ashore: the deer scare (scripted); find the rusting track in the dark | — | The quiet after the chase; "stop burning" realised | Track reached | Med | Low–med | Walk + scripted beats |
| 14 | Ch5 · Granger's fire | Watch the faked capture on Granger's portable TV (cutscene). Granger asks what he can offer: **T5** recall Ecclesiastes 3 (public domain) from fragments. Meet people who *are* books (pairing in dialogue). | — | Preservation by memory: the novel's answer | Recall complete + introductions | Med | Low | Recall only |
| 15 | Ch5 · the choice and the bombing | At the fire Granger asks which way Montag will walk. The **choice** comes before the bombs. Then the war (shared, canon) and that ending's epilogue. | 3 endings | Consequence, not reward | One ending viewed + game completion | High | Med | Choice + 3 short epilogues |

**Dropped from the spec [R]:**
- the Beatty claims-matching puzzle, which is a quiz rather than gameplay;
- the generic "spotlight evasion", replaced by the boulevard, the count of ten and the river from the book;
- Story/Normal difficulty. All failures already reset to a nearby checkpoint, and T5 is untimed.

**Runtime check [A]:** the 15 challenges at 40–70 s each, plus 8–10 short scenes, comes to about 14–18 minutes. Trim with the optional Clarisse rain scene and by shortening walks.

---

## 8. Three endings: believable narrative logic

**The choice point:** Challenge 15, at Granger's fire, after the faked-capture broadcast and before the bombs. Every run therefore completes 01–14 first. **The bombing happens in every ending (canon).** The two alternate endings are labelled in-game as adaptations, with the line "In the novel, Montag stays with the book people."

| Ending | What Montag chooses | Why it's believable | What the epilogue shows |
|---|---|---|---|
| **Preservation** (novel-aligned) | Stay; offer the verse he recovered | The book's ending | Bombs, dust, his memory returning; the fire that warms; walking upstream toward the city to help |
| **Submission** (adaptation) | Walk back toward the city: officially "dead", he can disappear into the crowd and the noise (he puts the Seashell back in) | The broadcast just erased him; going back means he never has to be anyone. This is conformity as relief, the pull Beatty described. | He reaches the city's edge as the bombs fall; the jingle replaces the verse in his head; the Seashell goes silent. Non-graphic. |
| **Defiance** (adaptation) | Leave alone to carry on Faber's plan: plant books and strike at the firehouses | His own plan, planted at Black's house; Faber predicted angry survivors "gathering stones" | The war lands before his act matters; he stands in the ruins reciting to people who don't listen; unresolved |

**How earlier choices matter without locking anything out:**
- **Flags:**
  - the 01 tone;
  - stop/continue with Clarisse;
  - pleaded with the woman;
  - tore the Bible or pleaded;
  - restraint at Dover Beach;
  - planted books at Black's.
- **What the flags change:**
  - Granger's question;
  - Montag's inner line before the choice;
  - which option is **listed first and how it is worded**.
- **What stays the same:** all three options are always offered.

---

## 9. Chromebook performance risks

| Risk | Detail | Mitigation |
|---|---|---|
| **Unmeasured hardware** | No Chromebook reading exists yet. | **Before M2 visuals lock:** open `…/fahrenheit451-game/?debug` and `?debug&lowres` on the school Chromebook and note the fps. |
| Render resolution | Zoom (K) can reach 2× on high-DPI Chromebooks, which means about 2 MP of fill. | Default K cap **1.5**. A **governor** measures 3 s after each scene loads; if the average is under 50 fps it steps K down (1.5 → 1.25 → 1.0) and never steps up mid-scene. Only cosmetic quality changes. This meets the auto-scaling requirement. |
| Overdraw | Full-screen layers: sky, wall, vignette, scanlines, grain, plus additive cones. | Merge scanlines into the vignette texture (one fewer full-screen pass). Budget ≤ 4 full-screen passes + partial lights. Floor strips cover only 30% of the screen. |
| Texture memory | A 2400×540 wall is about 5 MB; 8 rooms painted at boot is ~40–80 MB, and Chromebook GPUs share memory. | Paint per **chapter**, free the textures (`textures.remove`) on exit, budget ≤ 64 MB live. |
| Boot or paint time | Canvas painting is CPU-bound; slower on a Chromebook. | Paint during the chapter-transition fade; log the paint time in `?debug`. |
| Typewriter text | M1 re-renders the text texture for every character (55 times/s). | Reveal 3 characters per tick (~18 re-renders/s); finish instantly on a key press. |
| Particles and FX | Fire, embers, rain and leaves at once. | Hard caps per emitter (Section 6); the governor also halves particles at K 1.0. |
| Per-frame allocations | New objects every frame cause garbage-collection stutter. | Reuse vectors and objects; no array building in `update`. |

---

## 10. Complexity estimate and fallbacks

Estimates are in focused agent-hours [A] and exclude human review time.

| Work item | Estimate | Fallback if late |
|---|---|---|
| Room kit + floor strips + occluders + fog | 3–4 h | M1 rooms with a deeper floor band only |
| Character painter v2 + animations + shadows/tint | 3–4 h | M1 figures + shadows + tint |
| Cutscene runner + dialogue staging + camera framing | 2–3 h | Dialogue-only beats with a fixed camera |
| FX kit (fire, smoke, rain, leaves, CRT wipe) | 2–3 h | Glow + embers only |
| Mechanic types T2–T5 | 4–5 h | T1 simple versions |
| Environments (≈ 5 kits: street, house interior, firehouse, subway, river/forest; reused for 9 locations) | 6–8 h | Fewer props; shared layers |
| Content: 15 challenges, scripts, 3 endings | 6–8 h | Simple versions |
| Testing, deploy, docs | 3–4 h | — |
| **Total** | **≈ 29–39 h** | **Simple-version path: ≈ 14–18 h** |

**[R] Conclusion:** the full vision does **not** fit before Nov 12 with margin. The simple-version path plus the kit applied as far as time allows **does** fit. Hence the go/no-go points below.

---

## 11. Proposed milestone sequence

| Milestone | When | Exit criteria (verified, not assumed) |
|---|---|---|
| **M2a — Kit + Chapter 1** | Nov 10, morning → ~14:00 | Room kit, character v2, cutscene runner and fire kit exist; Ch1 (01–03) playable in the new style; deployed; build, typecheck and tests green. |
| **Go/no-go 1** | Nov 10, 14:00 | If M2a is not done: **freeze the kit as it is.** Remaining chapters use whatever kit pieces work, with no new visual systems. |
| **M2b — Chapters 2–3 (04–09)** | Nov 10 evening → Nov 11 morning | All six challenges completable (simple or full); flags recorded; checkpoints. |
| **M2c — Chapters 4–5 + endings (10–15)** | Nov 11 | All 15 in one normal run; 3 endings reachable; Presentation Mode chapter select for all 5 chapters. |
| **Go/no-go 2** | Nov 11, 18:00 | If any challenge is missing: switch it to its simple version **immediately**. Deploy a release candidate tonight regardless. |
| **M3 — Playtest build** | Nov 12 | Chromebook fps logged; governor verified; 2 human playtests recorded by you; blocker fixes only. |
| **M4 — Submission** | Nov 12 evening → Nov 13 | Rulebook, connection statement (your page numbers), presentation script, final deploy. |

**Next development session (on approval) = M2a only**, then stop for your review, as with M1.

---

## 12. Decisions requiring your approval

1. **Replace Challenge 01** with the opening burn. The M1 station becomes a brief Ch1 return scene and the Ch2 firehouse (growl, rule book, alarm). *Recommended.*
2. **Reorder and retitle to the novel's sequence:** 05 becomes "Beatty's Argument" (bedside) and 06 becomes "The Hidden Books" (vent reveal). Other challenge contents change per Section 7 (✱ rows). *Recommended.*
3. **Beatty's death** (canonical: Montag kills him). Options:
   - **(a) Recommended:** a cutscene where the player chooses Montag's words but never performs the act. A cut to the white flare and the empty lawn, no burning figure on screen; afterwards, Montag's realisation that Beatty wanted to die.
   - (b) Implied only: the screen goes white and the aftermath is shown.
   - (c) Altered (Beatty survives): unfaithful; not recommended.
4. **Mildred's overdose and Clarisse's death:** non-interactive, non-graphic short beats; no fail state, no score. Clarisse's death is mentioned by Mildred in one line, as in the book. *Recommended.*
5. **Endings:** the choice comes at Granger's fire after 14, the bombing is in all three, and Submission and Defiance follow Section 8. *Recommended.*
6. **Public-domain texts shown verbatim in game:** Dover Beach (a few lines), KJV Matthew 6:28 and Ecclesiastes 3:1–8 (excerpts), Latimer (1555), and one Gulliver line. No Bradbury sentences in the game. *Recommended.*
7. **Movement stays strictly horizontal** (no depth lane). *Recommended.*
8. **Drop** the Beatty quiz puzzle and Story/Normal difficulty. **Auto-scaling = the resolution governor** in Section 9. *Recommended.*
9. **The go/no-go cut-offs** in Section 11, including shipping simple versions when needed. *Recommended.*
10. **Your action:** the Chromebook `?debug` reading before M2a's visuals lock, if possible on Nov 10.

**Not yet decided anywhere, and blocking only the submission write-up:** printed page numbers. Candidate short quotations are listed in the private analysis for you to look up in a printed copy.
