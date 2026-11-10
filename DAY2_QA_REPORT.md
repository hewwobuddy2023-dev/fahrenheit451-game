# Day 2 development and review report — November 10, 2026

This is evidence of development, not a claim that the school assignment or physical-device acceptance is complete. Deadline: Friday, November 13.

## Starting state and source history

PR #1 was independently checked through GitHub: open, draft, unmerged, head `19b9328313510be02d6b017639bba746c0a5dfbf`, base `feat/m2-chapters` at `94c45a3d38a1ec3c562631bd33fe851357a47eee`. Main remains the earlier `7861c3b` documentation branch. M1 annotated tag still resolves to `55e09891b6b0fa668faa50e08928bc2f7cb05830`.

Day 2 branch: `work/day2-quality-sprint`, created from that exact Work head. Draft PR #2: https://github.com/hewwobuddy2023-dev/fahrenheit451-game/pull/2, **base `work/overnight-mobile-qa`**. No merge, force push, branch/tag deletion, hosting change or live deployment was performed.

| Checkpoint | Scope |
|---|---|
| `baa0771` | Focus suspension, active encounter clock, optional diagnostics and native browser CI |
| `af4a49c` | Synthesized audio, settings, stage/cast polish, cinematic ownership, fresh-boot truck fix, broader tests |
| `7691f07` | Sustained cosmetic resolution fallback across title and cinematics |
| `885ea32` | Visible mute/preferences, television state and explicit audio return |
| `80f1cb0` | Disable unused Phaser audio context; native pre-gesture assertion |
| `09bb8c8` | Freeze paused/journal hazard phases; native explicit-return extension |
| `95837d3` | Repair movement/countdown consistency below 20 FPS |

Later descendants document browser findings and handoff. `git log 19b9328..origin/work/day2-quality-sprint` is authoritative. The local PC's uncommitted state is unobserved and untouched.

## Source changes

New runtime modules: `src/audio.ts`, `settings.ts`, `focus.ts`, `diagnostics.ts`. Updated `main.ts`, `view.ts`, `scenes/{MenuScene,RoomScene,EndScene}.ts`, `ui/{MenuList,Dialogue}.ts`, `art/{figures,kits}.ts`, `world/stage.ts`, `content/{ch1,ch5}.ts` and `index.html`. Runtime state/checkpoint/schema code from Sprint 1 is preserved. Tests/config: Playwright config and browser suite, audio tests, cinematic/Day 2/gallery/full-ending runners, simulation/campaign helpers, package lock and PR workflow. Notices: `public/licenses/*`. Documentation: progress, story/art/assets/testing/performance, all school drafts and both Claude handoff files. The archive contains the exact changed-file list and diffs.

## Bugs reproduced and repaired

**Focus loss consumed encounters.** In a timed-escape regression, emitting blur and advancing 40 seconds moved the scene clock from 2250 to 42250 ms before the fix. The complete scene now pauses behind an explicit HTML return button. Timers, tweens, dialogue and scripted waits suspend together. Encounter deadlines use accumulated active deltas rather than wall-clock `Clock.now`, which jumps on resume. The returning Enter/tap is consumed by the curtain instead of also advancing the story; that same gesture can unlock/resume the independent audio context. Backgrounding and window focus on physical mobile browsers still require device acceptance.

**Cinematics were overridden by the frame loop.** A home-entry walk immediately changed to idle, and pole-slide/fall Y positions were overwritten by the floor update. Scripted walks/poses now explicitly own animation/position while their tweens run. Regression failed on the inherited walk and passes on walk, pole slide and fresh-opening props. Normal movement resumes afterward.

**Fresh opening referenced an unpainted truck.** Actual Chromium capture showed Phaser's missing-texture marker. The texture had only been created when entering the firehouse. Extracted its shared painter and call it before street use. Fresh New Game now asserts zero `__MISSING` objects.

**Low-FPS movement could become unfair.** A 10 FPS deterministic escape timed out repeatedly before the fix: position used a second 50 ms delta cap while the countdown used the full supplied delta. Use the same Phaser delta for movement and deadlines, with exponential velocity easing. Base speed and timer limits remain unchanged. The 10/20/30 FPS escape regressions and all three complete campaigns pass after this correction.

**Pause did not freeze hazard phase.** A five-second pause moved the river beam from x=556.92 to x=518.46. Stop encounter/world updates during pause/journal and verify unchanged phase, then resumed progression. Added a native test using real pause/return inputs and injected DOM blur/focus signals; it does not simulate physical tab/lock UI.

**Slow-render fallback could arrive too late.** The inherited governor waited for 180 gameplay frames and lowered resolution once; it never sampled the title/cinematics. The global check now waits for sustained low-FPS time windows and repeatedly lowers only render zoom to the existing 960×540 floor. Regression verifies both steps, unchanged save contents, and touch mapping afterward. Gameplay speeds, collisions, deadlines, challenge flags and enemy rules are not quality settings.

## Mobile investigation and diagnostic mode

Inherited scrolled-target, quick-Hound, DIVE, cancellation, row-size and atomic-save fixes were preserved and retested. Source review included Phaser input initialization, its scene/keyboard lifecycle, FIT coordinates, the safe-area parent, touch detection, font startup and scroll factors.

`?diagnostics` adds a non-interactive HTML panel with initialization, scene/input state, DOM event counts, Phaser pointer counts/coordinates, viewport/visual viewport, canvas dimensions/rectangle, DPR, scale, orientation, renderer/FPS, audio status and four bounded recent errors. It makes no requests, writes no diagnostic data and exposes no saves, names, accounts or private data. Normal play has no diagnostic overlay. `?debug` separately exposes the existing test hooks; both are opt-in.

The first native run started the title and reached gameplay in Chromium and WebKit. All rotation/journal checks reached their later hold assertion. WebKit completed all five demo starts and normal-save isolation in both orientations. This narrows the original report; **it does not reproduce or conclusively close the owner's physical iPhone “nothing taps” failure**. The live site has not received either Work branch.

Initial native suite (`42802233199`, `baa0771`): **3 passed / 9 failed**. Captures showed roughly 3 FPS Chromium and 7 FPS WebKit while tracing. Failures included a title cinematic exceeding a 30-second wall-time budget, too little movement during a fixed 600 ms wait, and uncompleted holds during a fixed 2200 ms wait. Continuous trace screenshots were removed from routine CI, and tests now hold native input until observed completion with bounded deadlines. No internal game function is called to advance native tests. Do not relabel the initial failures as passes or physical-device benchmarks.

<!-- BROWSER_RESULTS -->
**Final implementation at `95837d3`: 20/20 native tests PASS**, run `42808394871`, browser job `129803329207`. Build job `129803329804` also PASS (11 unit tests, all simulation/regression suites, three full 15/15 campaigns, typecheck and production build); deploy job `129803775011` SKIPPED. Playwright 1.65.0 on Ubuntu 26.04.1, Chromium 158.0.8127.18 and WebKit 27.2. Desktop 1366×768; touch Chromium/WebKit landscape 844×390 at DPR 3; WebKit portrait 390×844 at DPR 3. Captures and result JSON are in the review archive.

Passed: early/repeated native title taps, dialogue, keyboard movement, journal, pause/resume, rotation and scrolled targets, real Chromium touch hold, WebKit keyboard holds with native touch UI, delayed fonts, all five demo starts/quits preserving the normal save, audio unlock/mute, offline play after load, and origin-only runtime requests. No page errors in the fresh-visitor checks.

| Final `95837d3` CI sample (120 RAF intervals) | Median frame interval | 95th percentile | Renderer / canvas |
|---|---:|---:|---|
| Chromium desktop | 83.3 ms | 100.0 ms | WebGL (2), 960×540 |
| Chromium touch landscape | 66.7 ms | 83.4 ms | WebGL (2), 960×540 |
| WebKit landscape | 30 ms | 35 ms | WebGL (2), 960×540 |
| WebKit portrait | 23 ms | 25 ms | WebGL (2), 960×540 |

These are slow headless CI measurements, **not Chromebook/iPhone benchmarks** and not proof of a 30/60 FPS hardware target. The governor reached base resolution. Each sample observed 10 same-origin requests (HTML/JS/CSS/seven fonts), with no external runtime/audio request. Native context-state checks prove unlock/mute control flow, not audible quality on speakers.

**Extended native suite at `09bb8c8`: 20/20 PASS**, run `42807639158`, browser job `129800800754`; build/simulations also PASS and deploy SKIPPED. This includes the no-unused-Phaser-audio-context assertion and native pause/searchlight plus injected DOM blur/focus/explicit-return cases on all four projects. Final run `42808394871` repeats all 20 successfully after the low-FPS correction. The review ZIP retains initial failures, intermediate reruns and final screenshots/JSON/logs. A later documentation-only commit changes no runtime/test/build source.
<!-- END_BROWSER_RESULTS -->

## Campaign, saves and regressions

| Coverage | Result |
|---|---|
| New Game → Preservation | PASS, all 01–15 in order, 15/15 |
| New Game → Defiance | PASS, separate full run, 15/15 |
| New Game → Submission | PASS, separate full run, 15/15 |
| Wrong answers / watched theft / Hound miss | PASS, local retry rather than progression bypass |
| Stillness movement and pause | PASS, wait resets on movement and does not finish behind pause |
| Boulevard, timed escape and river | PASS, deliberate capture/retry and input-driven crossings |
| Chapter boundaries and completed-ending Continue | PASS |
| Corrupt/foreign/unknown-room/legacy interrupted saves | PASS |
| Blocked storage getter and quota failure | PASS; quota failure retains prior save, warns, live play continues |
| Presentation Mode | Five chapter starts/quits preserve the normal save |
| Touch, cancellation, two fingers, key repeat and blur | PASS covered simulation routes |
| Slow-delta escape | PASS at deterministic 30 FPS, 20 FPS and 10 FPS, including pause longer than the deadline |
| Cinematic pose and fresh-opening textures | PASS |
| Cosmetic render reduction | PASS; 1.5 → 1.25 → 1, save and touch preserved |

Simulation bundles the actual Phaser game under jsdom/native Canvas, advances deterministic deltas, and teleports between static hotspots. It uses real game flags, scripts, holds and hazard logic; it never grants normal completion flags. It is not a human playtest, hardware benchmark or exhaustive enumeration of every earlier choice/timing. Full native-browser campaign playthroughs are not claimed.

Unit suite: **11/11 pass** (nine inherited state/content tests plus two audio lifecycle tests). TypeScript and production build pass. Existing Vite large-chunk warning remains visible. `npm audit --omit=dev --json`: zero reported production advisories on this date. This does not guarantee the absence of unknown vulnerabilities.

## Visual and interaction work

Reviewed eleven staged compositions spanning burn, Clarisse, parlor, firehouse, attic, subway, Faber, home burning, boulevard, river and camp. Highest-impact fixes: avoid foreground props hiding Montag; repair cinematic movement and missing assets; improve cast/ground separation; add architectural/forest depth.

Implemented baked collars, lapels, seams and buttons; restrained cheek/profile highlights; steadier walk-plane contact; interior ceiling/baseboard/seam trim; static ground planes and light reflections; varied branching tree silhouettes and a distant forest layer. Foreground fade uses character/prop extents, including the wider floating sprite. Duplicate sky layers were removed. All added decoration is non-interactive.

The first sprint's padded fire and float/wake remain. They were not rewritten. Before/after staged Canvas images and representative native captures are in the review archive. Canvas does not support every WebGL tint; its white-looking additive glows are not reliable color approval. Staged images use supplied flags/effect triggers and are **art fixtures, not proof of earned challenges**. `npm run test:gallery` regenerates the after fixtures.

Opening objective explicitly says move right and hold E/ACT. Portrait text recommends landscape. Title and pause offer sound/reduced-motion settings; pause rows are 64 logical pixels apart. No reading is timed. Existing retry mechanics and journal counts remain.

## Audio and reduced motion

`src/audio.ts`: original Web Audio synthesis. One generated mono noise buffer and one sine ambience source are retuned for menu, industrial rooms, television rooms, fire, pursuit, river, camp and ending. Soft UI/page/footstep/interaction/completion/Hound/capture/ignition/ending cues are rate-limited and capped at eight active voices. No audio files, commercial music, external IDs or runtime audio network service.

Phaser's unused sound backend is disabled; Soundscape creates its context only after a tap/key gesture. Resume rejection or unsupported Web Audio leaves the game playable silently. M toggles mute; title/pause offer touch controls. Preferences use `f451.options`, separate from story saves and demo progress. Scene changes stop old cue voices; background/focus suspension silences the bus until explicit return; overlays silence ambience. Unit tests verify lazy single-context creation, blocked/unsupported fallback, bounded voices, mute and quiet behavior. Native context-state tests are distinct from listening tests; **audible balance and real iOS audio still need owner review**.

Reduced motion defaults to the OS preference, can be changed locally, suppresses moving grain/camera shake/flashes and slows the subway background. Essential hazard motion, walking and story fades remain. This is a small direct preference, not a replacement rendering engine.

## Narrative and gameplay review

Reviewed the major script data and approved story/challenge documents. Preserved satisfaction-first opening, gradual Clarisse discomfort, Beatty's confident public-conformity argument, Mildred's distraction, Faber's caution and Granger's memory preservation. No full novel was fetched, extracted or included. No quotations/pages were invented.

Only story-content addition is a brief original Defiance consequence when `faber.tear === 'tear'`: Montag remembers forcing Faber to listen and waits for a survivor's response. Full Defiance simulation asserts the line was encountered. This resolves the earlier documented unused consequence. All three choices remain offered and share the city bombing. Corrected STORY documentation that had claimed changing option order/Granger questions and an earlier Defiance departure; the documented behavior now matches the existing stable choice order and shared pre-departure bombing.

The campaign already combines held actions, watching/stillness, environmental investigation, choices, recall, pursuit and navigation. Added clarity/feedback instead of a new unrelated system. Whether unassisted classmates enjoy the balance remains a human-playtest question.

## Performance, privacy and dependencies

See updated `PERFORMANCE_AUDIT.md`. No actual Chromebook model, GPU, school-Wi-Fi transfer, five-minute hardware stability or thermal measurement is known. Headless CI frame data are labeled with browser/version/viewport/renderer and are not school-hardware claims.

Runtime dependencies remain Phaser 3.90.0 and the same font packages. New dependency: pinned **dev-only `@playwright/test@1.65.0`** and its matching Playwright/core packages. Audio is native synthesis. Font/Phaser license notices are included in `public/licenses/` and production output. No production package migration.

Source audit found no runtime external URLs/services, source ebook files, environment secrets/private keys or browser telemetry. Local absolute paths in historical setup/handoff documents are intentional instructions, not runtime file access. GitHub PR jobs have contents-read permissions; Pages token permissions stay on the existing deployment job. PR deployment and Pages artifact steps are skipped. The workflow still deploys pushes to M2/main/M1: owner approval is required before such integration.

## School delivery and merge conditions

All six school drafts are updated for actual controls/audio/focus behavior. Statement prose has **308 words before quotations**, excluding marked placeholders; final 300–400-word count must include the owner's verified quotations/citations. The quoted presentation speaking text has **331 words**, with separate demo actions. Proposed 3–5-minute timing is not a rehearsal result.

Still required: two actual people playtest; three accurate short quotations with matching printed page numbers/edition; personal review; actual iPhone acceptance; Chromebook/network/performance checks; timed demonstration and an approved release. The game is a stronger review candidate, **not submission-ready**.

Review PR #2's incremental diff against PR #1, then review the cumulative result against M2. If approved, merge #2 into the Work branch first; that branch is outside the push-deploy list. Only after owner release approval should #1 integrate into M2, which can deploy. Never blindly merge either PR. See `WORK_TO_CLAUDE_HANDOFF.md` and `CLAUDE_RESUME_PROMPT.md`.


## Real-device acceptance checklist — not yet performed

Use the reviewed Day 2 build served from the PC LAN address in the handoff; the unchanged live Pages game is an older build. Record commit, device/model, iOS/Chrome version, orientation, storage state and pass/fail for each step.

1. Fresh Safari private tab: open portrait, tap New Game immediately, then rotate landscape. Verify title/settings/confirmation targets and visible movement/ACT controls. Repeat ten taps during startup and scene transitions; no duplicate story skips or stuck overlay.
2. Walk both directions, hold ACT to burn, release/cancel by moving away, and use two fingers for movement plus ACT/DIVE. Tap dialogue choices, journal, pause, sound and return-to-title controls after scrolling.
3. With an existing checkpoint, close/reopen Safari, Continue, rotate both ways, expand/collapse browser toolbars and revisit settings. Save must persist and taps must match displayed targets.
4. During dialogue, Hound, timed escape and river, background the browser or lock for 40 seconds. Return explicitly; no consumed deadline, automatic story selection, stuck key or unexpected sound. Repeat with manual pause/journal.
5. Enable sound after a tap, listen at low volume, mute/unmute, change rooms, lock/return, and test with device silent mode. Record audio separately from input. Audio failure must not block play.
6. If any input fails, reopen with `?diagnostics`, record the panel and the exact last action (DOM versus Phaser counts, canvas/viewport/scale, current scene/errors). Do not erase the normal save to conceal a failure.
7. On the actual Chromebook, complete the demonstration route, sample demanding rooms, test lowres and a five-minute session, and record load/frames/input. Run two real unassisted playtests and a timed 3–5-minute rehearsal.
