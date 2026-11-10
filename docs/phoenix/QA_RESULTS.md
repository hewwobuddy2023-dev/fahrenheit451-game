# Phoenix QA and delivery evidence — November 10, 2026

This is a reversible development candidate, not a declaration of school-submission readiness. The original owner recording was unavailable. No physical iPhone, Chromebook or human tester was present.

## Repository and preserved baseline

Verified starting head: `74f0b2c78294b6dbbe94f1069a7f347654fb0f18` on Day 2. PRs #1/#2 were independently rechecked open/draft/unmerged. New branch `work/cinematic-gameplay-rebuild`; draft PR #3 targets Day 2. Remote backup branch `backup/pre-cinematic-rebuild-20261110` preserves the exact base. A matching local lightweight tag is in the Git bundle; remote tag publication is not claimed. Existing main/M2/M1 preservation tag remain untouched. No merge, force push or production deployment.

Checkpoints: `5867dca` audit; `dea9294` active hose/ordered recall/hybrid art/mix; `2efd881` watched hold, finite breath, hazard cues and expanded native QA; `509f723` visual horizon/props/readability; `c98d127` visible touch puzzle pause, sound-check unmute and independent baseline launch. Startup follow-up `8a70ce3` bounds the new optional backdrop request and makes source archives buildable outside Git; that intermediate failed typecheck because its image XHR settings omitted a required response type. Successor `98e5aa2` supplies the explicit blob type and passed local typecheck/build plus the complete CI build/regression job. No history was rewritten and neither intermediate was deployed. Manifest/Git log identify the exact packaged head.

## Implemented changes

- **Gameplay:** hose pressure/vent control with assist; deliberate Clarisse observations; safe-window held book concealment with atomic narrative commit; ordered source-first subway/camp reconstruction, reference, three optional hints and local wrong-order retry; finite river breath with release-to-recover; exposed/approaching/clear hazard labels and ground zones. All fifteen earned gates and three endings remain. Beatty/poetry/social scenes retain their existing choice structures; they are not advertised as new complex puzzles.
- **Art/animation:** one original generated 44,774-byte city backdrop integrated behind editable facades; brickwork, window/door returns, roofs, downpipes, industrial fittings, curved screen/sofa forms, broadcast figures, bound volumes, recognizable phone/file/script props and a hose-working silhouette. Gentler forest analog treatment and cast tint. Mirrored opening truck lettering fixed. Generated city explicitly excluded from forest so it cannot survive the bombing horizon. Existing flame/water/wake retained.
- **Audio:** Day 2 engine retained; stronger bounded mix and brighter seeded noise, shaped noise footsteps/fire/capture, distinct subway profile, gesture-created context, mute/volume and labeled sound check. No audio downloads or external service. Analyser inspection and a native offline-rendered WAV provide actual sample evidence, separate from listening.
- **UX:** opening instructions, contextual H/? hints, reading-source-first panels, touch puzzle PAUSE, assisted hose, reduced motion/analog toggle, sound test and build identity. Existing safe-area/input-scroll/cancel/focus/save fixes preserved.

## Fresh local checks

All original baseline suites were rerun before major edits. Candidate complete local checks at `c98d127`: **14/14 unit tests**, TypeScript, production build, four viewport simulations, three separate full New Game→15/15 simulated campaigns (Preservation/Defiance/Submission), prior save/checkpoint/ending/demo/focus/pause/cinematic regressions and Phoenix mechanic suite PASS. Exact combined output is `local-final-c98d127.log` in the archive.

New mechanic cases deliberately fail/retry wrong fragment order, read source again, request hints, pause by touch, overpressure a hose, vent/recover, try a watched concealment hold, conceal safely, exhaust dive breath, release and cross the river. Missing-image fallback is covered natively. Existing low-delta escape checks remain at deterministic 10/20/30 FPS. Deterministic deltas are not hardware throughput.

Full campaigns use actual Phaser under DOM/native Canvas, accelerated deterministic time and teleports between static hotspots. Chases/crossings use input. They never grant normal completion flags. This is not a full native-browser campaign or a human playtest; no exhaustive earlier-choice/timing enumeration is claimed.

A packaged-source portability failure was reproduced: Vite metadata called Git unconditionally, so a source ZIP without `.git` could not build. The build-only fallback now labels `source-archive` (or uses explicit F451_BUILD_SHA) instead of crashing/guessing. A complete source tree without `.git`, using installed exact-lock dependencies, built successfully. The actual provisional packaged source was rebuilt without `.git` and its honest `source-archive` metadata asserted. The provisional ZIP passed CRC, 393-file hash/length and Git bundle checks; separate supplied-build servers passed GET/HEAD/root-confinement checks. Separate candidate/baseline static servers passed HTTP smoke checks on 4173/4174. Windows double-click and physical LAN/firewall remain owner checks.

## Native browser evidence

Actual Playwright protocol taps/keys/CDP held touches serve the production build. State reads are assertions; no internal QA progression calls. Seeded checkpoint tests are labeled; they do not claim earned full campaigns.

| Source / Actions run | Build | Native suite | Deployment |
|---|---|---|---|
| Baseline `74f0b2c`, 42825512316 | PASS, independently inspected inherited result | PASS, inherited Day 2 result | SKIPPED |
| Audit `5867dca`, 42866613182 | PASS | PASS, baseline runtime unchanged | SKIPPED |
| First candidate `dea9294`, 42868739775 | PASS | 6 passed / 2 failed; remaining cases stopped | SKIPPED |
| Mechanics `2efd881`, 42869995234 | PASS | **32/32 PASS**, browser job 130018375805 | SKIPPED |
| Visual descendant `509f723`, 42871113523 | PASS | **32/32 PASS**, browser job 130022335558 | SKIPPED |
| Access checkpoint `c98d127`, 42872448765 | PASS | **32/32 PASS**, browser job 130026935226 | SKIPPED |
| Startup intermediate `8a70ce3`, 42874990407 | FAIL: required image XHR response type omitted | Not run: build failed | SKIPPED |
| Corrected runtime `98e5aa2`, 42875205788 | PASS, job 130036548760 | **29 passed / 2 failed / 1 skipped**, job 130036548385 | SKIPPED |

Initial failures were test defects: CDP cleanup sent touchEnd twice, and origin enforcement rejected Phaser's same-origin image decoder blob. Fixed held-state cleanup and allow only same-origin HTTP plus same-origin blob URLs; actual request origins are logged. Initial failure screenshots/results are retained, not relabeled as passes.

The 32-case suite spans eight cases across Chromium desktop 1366×768, Chromium touch landscape 844×390 DPR3, Linux WebKit landscape 844×390 DPR3, and Linux WebKit portrait 390×844 DPR3. Chromium 158.0.8127.18; WebKit 27.2. Tests include early/repeated title taps, dialogue/movement/journal/pause, rotated/scrolled held pressure, delayed fonts/five demo starts/save isolation, native audio/mute/offline use, phase suspension/explicit return, ordered recall failure/reread/success, absent decorative-image fallback and watched concealment.

<!-- FINAL_NATIVE_RESULTS -->
`c98d127` completed 32/32 native passes, including the visible puzzle PAUSE and unmuting sound-check controls. The corrected startup runtime `98e5aa2` is being inspected separately; its additional case tests both an aborted image and a stalled image with the 4-second bound.
<!-- END_FINAL_NATIVE_RESULTS -->

## Sound output and performance observations

At `2efd881`: real running-browser analyser RMS .0273–.0397 and peaks .0795–.1094 across four projects. Mute output fell below the test threshold. Native OfflineAudioContext rendered the original fire graph: RMS .0366042, peak .158775, 48 kHz mono, two seconds. Its WAV is included for listening. These measurements prove a signal exists and that measured output is bounded; they do not prove sound from a real device, capture routing, balance of every overlap, or why the owner's earlier recording was silent.

| `2efd881`, 120 RAF intervals, WebGL / 960×540 | Median | p95 |
|---|---:|---:|
| Chromium desktop | 66.7 ms | 83.4 ms |
| Chromium touch | 66.7 ms | 83.4 ms |
| WebKit landscape | 32 ms | 34 ms |
| WebKit portrait | 26 ms | 30 ms |

These are slow headless CI samples, not phone/Chromebook benchmarks or proof of 30/60 FPS. Observed encoded resource bodies total approximately 608.4–608.7 kB for ten same-origin assets (JS/CSS/seven fonts/city layer), plus HTML; one additional local decoder blob is not a network service. No external runtime/audio request. Per-resource/frame data are in the archive. Actual cold load over school Wi-Fi, GPU memory, thermals and five-minute hardware stability remain unmeasured.

Build bytes are recorded in BUILD_METRICS.json after the final local build. Baseline dist 2,008,030 bytes; candidate roughly 2.07 MB. Existing Vite large-chunk warning remains. One city image adds ~3 MiB decoded RGBA before copies; extra working-figure sheet about 1.16 MiB. Room decoration uses family texture cleanup. No full-screen shader pass or new runtime package. New dev-only @types/node 24.19.2 / undici-types 7.24.6 support metadata typing. `npm audit --omit=dev --json` reports zero production advisories on this date; unknown vulnerabilities are not excluded.

## Visual evidence, pacing and remaining weaknesses

Eleven before/after fixtures cover burn, Clarisse, parlor, station, attic, subway, Faber, own house, boulevard, river and camp, using comparable staged positions. These fixtures use supplied staging flags and Canvas, which omits some WebGL tint; they do not prove earned progress. Native captures identify exact source/browser/project and cover all five chapter starts and redesigned interactions. Source-generated illustration alone is not renderer evidence.

The cast remains stylized silhouette art and some environments/dialogue staging remain simple. Faber trust/inference and social scenes can be improved further after review; avoid unrelated minigames or rebuilding everything before Friday. Pacing budget targets 25–30 minutes without slowed walking. **No first-time human duration or enjoyment result exists.** Owner/Fable must compare against the preserved baseline and reject weaker changes. No automatic acceptance based on test counts.

## Real-device acceptance — not yet performed

1. Use the reviewed source/build ID, not the old live website. Fresh Safari tab: New Game immediately, repeated taps during startup, portrait→landscape, expanded/collapsed toolbars and safe areas. Confirm targets track their display after scrolling.
2. Walk, pulse/vent, try overpressure and assisted hose, inspect observations, tap response rows. Open/close journal, pause/settings and quit/Continue with an existing save.
3. At concealment, attempt a watched hold then a safe hold. At recall, fail an order, reread, request hints and use the visible PAUSE button. Reading stays untimed.
4. In river, move+DIVE with two fingers, exhaust breath safely near the start, release/recover and navigate lights. No stuck held controls after cancel or rotation.
5. Background or lock for 40 seconds during dialogue, recall, Hound, timed escape and river. Explicit return must not consume a deadline, move a hazard, choose a story response or create unexpected sound.
6. Set low media volume, use labeled sound check, mute/unmute, change rooms and lock/return. Record silent-switch state and device audio behavior separately. A running context/waveform is not a speaker test.
7. On actual Chromebook record model/browser/viewport/build/network, cold load, demanding-scene 30-second samples, lowres comparison and one five-minute session. Complete a normal campaign, all fifteen and an ending.
8. Record two genuine unassisted human playtests and first-time duration, verify three short printed-page quotations, personally revise/count the statement and rehearse the 3–5-minute demonstration.

If tapping fails, capture ?diagnostics plus last action, storage state, iOS/browser/version and orientation. No automatic telemetry is sent. The original real-iPhone launch defect remains unconfirmed; Linux WebKit is not physical iOS.

## Release and handoff

No separate public preview or v.gd link exists. GitHub preview repository could not be resolved through available access; repository creation/Pages administration actions are absent and cloud UI is signed out. PREVIEW_SETUP.md contains an owner-authenticated isolated setup route and safe Kali shortening command after actual verification. Production is unchanged; never deploy there as a workaround.

School drafts are updated for real mechanics. Connection prose remains 308 words before three unmistakable quotation/page placeholders; final 300–400-word count needs owner verification after insertion. Playtest forms remain blank; presentation timing is not a rehearsal result. The game is not declared submission-ready.

Fable/Opus review and continuation prompts plus full handoff, rollback instructions, complete current/baseline source/builds, Git bundle/diffs, screenshots and logs are in the ZIP. Model availability and any advisor command were not verified. Owner controls production integration and official final short link.

## Workspace interruption and archive recovery

The local execution environment became unavailable during final upload. The assembled 31.8 MB local ZIP could not be uploaded; do not treat its scratch path as a durable download. All runtime commits are safe on GitHub. The documentation tree was also preserved before the interruption. A dedicated branch-limited, read-only Actions workflow now reconstructs the review archive from committed current/baseline source, fresh builds, regenerated eleven-pair composition fixtures, and recorded native artifacts/logs. It never invokes Pages or publishes the game. Its artifact is retained for 30 days; download it promptly.

The recovered archive includes the exact compressed generated game asset, but the full original PNG and scratch-only local logs could not be recovered. Independent source-specific CI build/regression logs and native evidence replace those local logs. The actual final native result is recorded by the packager in FINAL_NATIVE_RUN.json, FINAL_NATIVE_STATS.json and MANIFEST.json (including the report source). If final native evidence is unavailable, the preserved c98d127 report is explicitly labeled instead. The last complete native checkpoint known when this document was committed was c98d127, 32/32; 98e5aa2 had a successful build/full simulation job and a still-running native rerun. Never relabel that pending rerun as a pass.

## Final observed native outcome

Run 42875205788 at 98e5aa2 completed with **29 passes, two failures, one skipped case**, and an error outside an individual test. Both failed cases were WebKit landscape/portrait in the new stalled decorative-image test: the title was reached, but the city texture existed where the test expected it absent. A blocked menu was not demonstrated; reliable forced-fallback timing under this intercepted request remains unproven. Full source-specific logs/results are retained. Do not erase the failures or call this 32/32. The earlier c98d127 checkpoint had 32/32 native passes and includes all new gameplay/art/audio; it is supplied as a separate prebuilt choice on port 4175. Current build/unit/all three 15/15 simulations still pass.

The first recovered archive omitted hidden tracked files due to the upload action default. The follow-up explicitly includes them; all package paths originate from tracked source or named evidence, never credentials or .git. Use the newest complete archive. The packaging manifest is verified before upload.
