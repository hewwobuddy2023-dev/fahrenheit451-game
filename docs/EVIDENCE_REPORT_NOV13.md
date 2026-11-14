# Evidence report — final sprint, Nov 13, 2026 (branch `work/final-sprint`, draft PR #4)

Every claim below is filed under the kind of evidence behind it. **Nothing here comes from a human playtest or a physical device.**

## 1. Automated simulation (real bundled game in jsdom, deterministic time, Canvas renderer)
Run with `npm run verify`, which exits non-zero if any step fails.

| Suite | Result | What it proves |
|---|---|---|
| typecheck, unit (24) | PASS | Content references, line lengths, lane timing, hose never stalls, audio graph has a fixed node count, every "will remember" choice is read later |
| input (17) | PASS | Desktop has no touch UI and shows E labels. Hold, early release, blur, pause and room change leave no stuck keys. Mashing E never solves puzzles. Sprint works. The fence blocks walking and is vaulted with Space. The first E on a touch device interacts. Beatty's suspicion reaches 3/3 and restarts the scene. |
| simulation, regression, day2, cinematics, phoenix | PASS | Viewports; corrupt or blocked storage; Presentation Mode never writes the save; low-FPS timing; settings |
| campaign:all | PASS | All 15 challenges in order, all **3 endings**, Continue at each chapter, and ending replay without touching the save |

## 2. Native browser tests (Playwright; Chromium + WebKit, production build)
`npm run verify -- --browser`: **32/32 passed**, covering Chromium desktop, Chromium touch, WebKit landscape and WebKit portrait.

Limits, stated plainly:
- Playwright's Windows WebKit build has **no Web Audio**. There the audio test asserts that the game degrades to "unavailable" and stays playable. Real Safari or iPad audio is **untested**.
- WebKit can serve the backdrop image from cache without the test's fault injection. The spec records this and still checks that the title is never held.

**Real bugs found by the native runs and fixed:**
1. WebKit ignored the backdrop's 4-second request timeout, so a network that never answers could hold the boot screen indefinitely. The backdrop now loads outside the boot path.
2. A tap to close the journal right after opening it was ignored. Phaser skips input on objects still fading in from transparent, and slow WebKit frames made the window long enough to hit. The close zone is now live immediately. Repeated 4 times on all four projects: 16/16.

## 3. Visually inspected screenshots (real Chromium, WebGL, 1366×768)
- `docs/qa/review-nov13/*.jpg`: 17 scenes across all 5 chapters, captured with `node tools/capture.mjs`.
- Inspected by me (Claude) from the images; I didn't watch a person play.
- Fixed after inspection:
  - Characters had **the same brightness as the walls** (measured: figure median ≈34 against walls ≈29), so coats and faces were invisible. Now the cast is readable.
  - Faber's room had a black placeholder box; it's now a small TV set, as in the novel.
  - The attic stairs and book heap looked like noise; they're redrawn as real stairs, book mounds with page edges, and a window light shaft.
  - The river was near-black; it now has a moon, moonlit water and a lit bank.
  - The run scene's timer overlapped the objective panel.
  - The Settings "Back" row sat at the frame edge.
- Before/after comparison: `docs/qa/sprint-before/*.png` (Phoenix base) against `docs/qa/review-nov13/*.jpg`.
- **Not done:** inspection at Chromebook resolution on real hardware.

## 4. Recorded and measured audio (real Chromium Web Audio)
- `docs/qa/audio/final-mix.webm` was recorded from the final mix after the compressor; `levels.md` has the measured levels.
  - Cue peaks are 0.36–0.55, ambience peaks about 0.2–0.3, with no clipping.
  - Muting gave a peak of 0.00001, effectively silence.
- `node tools/audio-gameplay.mjs`: **8/8**, driven by real key presses in gameplay:
  - The audio context unlocks on a real key press.
  - Walking triggers footsteps. The logger counts calls; the engine rate-limits them to about 3 audible per second.
  - The hose loop sounds while E is held and stops on release.
  - Diving muffles the mix (20 kHz down to about 450 Hz). Surfacing restores it, and so does a scene change mid-dive.
  - Touching the Hound plays its cue.
- **Not established:** whether it *sounds good*. Nobody has listened through headphones yet. Please listen to `final-mix.webm`, and to the game, on headphones.

## 5. Physical devices
**None.** The game has not been run on a school Chromebook, an iPad or a phone. This is required before Tuesday (see `docs/TEACHER_GUIDE.md`).

## 6. Human playtests
**Pending, both of them.** `PLAYTEST_FORM.md` is ready. No observations, participants or times have been recorded or invented.

## Play length
- `node tools/pacing.ts` estimates about **38 minutes** of active first play on the correct path, from the content alone:
  - reading at 180 wpm (about 24 minutes of the total);
  - walking, choices, holds and hazard waits.
- Mistakes, retries, the journal, exploration and replaying other endings add time.
- **This is not a measurement.** Time your two playtesters, start to ending, and record the median and range.

## Book accuracy
`docs/LITERARY_FIDELITY.md` has a 32-event matrix covering the novel's three parts against the game's five chapters.

- **Fixed this pass:**
  - the exact "loaded gun" sentence;
  - the Franklin "history" framed as rule-book propaganda;
  - Beatty recognising Latimer;
  - Faber's three necessities as a playable inference;
  - the mirror factory;
  - the novel's final line.
- **Endings:** Preservation is labelled closest to the novel; the other two are labelled invented.
- **Quotations:** the three short quotes in `CONNECTION_STATEMENT_DRAFT.md` were checked word for word in your ebook. **Page numbers are blank on purpose**; the ebook has none.

## Still open (not done, not claimed)
| Item | Owner |
|---|---|
| Two human playtests and measured play time | You |
| Print-edition page numbers (or teacher OK for ebook part/chapter) | You |
| Approval to publish this build to the GitHub Pages link | You |
| Test the published link on a school Chromebook behind the filter | You, on Monday |
| Listening test on headphones | You |
| Long-dialogue chapters 2–3 (about 1,100 words each): candidates to trim after the playtests show where players skim | After playtests |
