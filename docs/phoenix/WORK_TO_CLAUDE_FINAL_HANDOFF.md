# Phoenix candidate handoff — read before integration

## Preserve the stack

- Claude M2 `94c45a3` → Sprint 1 `19b9328` (draft #1 into M2) → Day 2 `74f0b2c` (draft #2 into Sprint 1) → Phoenix `work/cinematic-gameplay-rebuild` (draft #3 into Day 2).
- Exact Phoenix base: `74f0b2c78294b6dbbe94f1069a7f347654fb0f18`. Remote backup **branch** `backup/pre-cinematic-rebuild-20261110` points there. Matching local tag is in the Git bundle; no remote tag publication is claimed.
- Phoenix audit `5867dca`; first implementation `dea9294`; second mechanic checkpoint `2efd881`; visual correction `509f723`; access checkpoint `c98d127`; startup follow-up `8a70ce3` and typed XHR correction `98e5aa2`. Fetch current head; later QA/documentation fixes are recorded in PROGRESS and the final report.
- No prior PR was merged, no production deployment or force push occurred. Owner PC work is unobserved. Use a fresh worktree; never reset the owner's checkout.

## Implemented, not just designed

Opening hose has finite pressure, a FLOW band, vent/release recovery and retained partial progress. Assisted hose can be enabled from title Settings → Audio & accessibility. Clarisse's three observations are deliberate interactions. Subway/camp use source-first ordered reconstruction of existing public-domain passages, with local wrong-order retry, optional reference, graduated hints and pause. Old woman's book concealment requires a safe short hold; its story flag commits after the story beat. Her death remains a fixed restrained event, never a scored action. River diving has finite breath and release-to-recover; hold-down-forever no longer bypasses the searchlights. Pursuit hazards show explicit exposed/approaching/clear cues and marked ground zones; original speeds/deadlines/collision rules remain.

Original generated city layer (44,774-byte WebP, one shared ~3 MiB decoded texture) plus editable facades, interior set details, broadcast faces, book spines, curved screen/sofa shapes, pipework and a hose-working pose. Existing fire/river art is retained. Analog effects are below UI, adjustable and scaled down with quality/reduced motion. This remains stylized code art; the cast and some rooms still need owner/artist judgment. Do not mistake a generated panorama for evidence of an implemented whole scene.

Existing audio engine retained: stronger bounded mix, brighter noise bed, noise-based step/ignite/capture feedback, distinct subway profile, volume presets and sound-check control. Original synthesis only, no audio downloads. Analyser QA proves actual graph samples; native OfflineAudioContext capture produces a short listenable WAV. Neither proves physical speakers/iOS or the owner's recording chain. No recording was available to review. Build identity appears on the title and diagnostics. A missing/stalled optional city image falls back after a bounded 4-second request; source ZIPs without .git use a truthful source-archive metadata label (or explicit F451_BUILD_SHA) and build successfully.

## Tests and limitations

Fresh local baseline checks passed before changes. Candidate local tests: 14 units, typecheck/build, four synthetic viewports, all three separate New Game→15/15 ending simulations, inherited save/focus/checkpoint/demo/cinematic regressions, new wrong-order/reference/pause/pressure/stealth/breath cases. Tests use actual Phaser, deterministic time and static-hotspot teleportation; do not call them human/browser full campaigns.

Native first candidate run `42868739775` at `dea9294`: 6 passed/2 failed, then remaining cases not run. Fresh input, desktop pressure, five chapter starts, pause and native subway reconstruction passed. A double touchEnd in harness cleanup and rejection of Phaser's same-origin decoder blob caused the failures. Both were corrected; HTTP and blob origins remain explicitly restricted. Actual Chromium analyser RMS .03034 / peak .06920. Reruns at `2efd881` (42869995234) and visual descendant `509f723` (42871113523) each passed 32/32 native tests with build PASS and deploy SKIPPED. Access checkpoint `c98d127` also passed 32/32 (42872448765). Intermediate `8a70ce3` failed build/typecheck because the image XHR config omitted its required response type; `98e5aa2` corrects it and has a passing complete CI build/regression job. Keep initial failures and final reruns separately; the last startup native result is in QA_RESULTS.md and artifact logs.

Physical iPhone, Chromebook/model/GPU/network, subjective sound, two human playtests and first-time play duration remain unverified. A 25–30-minute experience is a pacing target, not an observed result. Baseline functionality alone does not establish fun or adequate difficulty.

## Dependencies and likely conflicts

New dev-only `@types/node@24.19.2`, matching `undici-types@7.24.6`, for typed build metadata. No new runtime framework. Existing Playwright/Phaser/fonts unchanged. Story save schema v1 and earned flags preserved. Hose pressure/breath/puzzle attempts are transient and reset safely from the last event checkpoint. New options live in `f451.options` only.

Overlap hotspots: RoomScene's active clock/input/modal/hold/hazard logic; Dialogue's puzzle ownership; content scripts and test drivers; art kits/cast; audio gain/buffer/cue lifecycle; Vite metadata/workflow; Menu settings. Keep hold pressure and timers delta-based, camera hit targets explicit, and flags atomic. Do not reintroduce a perpetual dive exploit or save half a memory panel. No hidden completion flags should be granted in normal mode.

## Reproduce in a separate worktree

```sh
git status --short
git fetch origin
git worktree add --detach ../F451-PhoenixReview origin/work/cinematic-gameplay-rebuild
cd ../F451-PhoenixReview
npm ci
npm test
npm run typecheck
npm run test:simulation
npm run test:campaign:all
npm run test:regression
npm run test:day2
npm run test:cinematics
npm run test:phoenix
npm run build
npx playwright install chromium webkit
npm run test:browser
npm run dev -- --host 0.0.0.0
```

Use `npx playwright install --with-deps chromium webkit` on supported Linux if system libraries are missing. Do not claim real iOS from Linux WebKit. Compare all eleven baseline/candidate fixtures and native captures, then personally play without QA hooks.

## Release and next task

Separate preview not deployed: no repository/Pages action in the connector, cloud GitHub UI signed out. Do not deploy the candidate into the original Pages job as a workaround. Follow PREVIEW_SETUP.md in an owner-authenticated environment, verify actual URL/build/inputs, then create only a labeled preview short link. No official release link yet.

Owner still supplies two human playtests, verified printed quotation pages and a timed classroom rehearsal. School drafts reflect the changed controls; quotation placeholders are unmistakable. Fable/Opus are intended planner/reviewer/implementer roles subject to actual availability; no slash command was verified. Fable may reject, cherry-pick or ask Opus to rewrite this work.

Read QA_RESULTS.md first for current blockers. Next: owner/Fable judges actual candidate screenshots/audio/gameplay against the baseline, resolves any remaining native failures, tests physical devices and pacing, then authorizes an isolated preview. Only after all reviews may the owner approve integration Phoenix→Day 2→Sprint 1→M2. The last step can deploy production. Rollback/selective steps are in docs/PROJECT_PHOENIX_ROLLBACK.md. No automatic resumption is configured.

## Final archive recovery

The local workspace became unavailable before the assembled ZIP could be uploaded. A branch-limited review-archive workflow reconstructs the package on GitHub without any Pages permission or deployment step. Download its 30-day artifact and verify its MANIFEST and actual native stats. Original full generated PNG/scratch-only logs were not recovered; game WebP and CI recordings are included. All runtime source was already pushed; the prepared documentation is preserved in this commit. Do not call an unfinished native run successful. See QA_RESULTS.md for exact checkpoint distinctions.

## Final native review priority

98e5aa2 finished at 29 passed / 2 WebKit stalled-image assertion failures / 1 skipped, plus an outside-test error retained in logs. Title was reached with the city texture loaded; no blocked-menu result is claimed. Investigate real-server delayed-response timing versus Playwright interception semantics before modifying game input. c98d127 is the last fully native-verified Phoenix checkpoint (32/32) and is included prebuilt on 4175 for deadline review. The newest archive includes hidden tracked workflow files; reject the earlier incomplete artifact. Source remains fully reviewable and nothing was deployed.
