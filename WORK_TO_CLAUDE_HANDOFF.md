# Work → Claude Code handoff

**Review first. Do not merge automatically.** Work collaborated with the existing Claude project. Owner authorized implementation, tests, a separate branch and PR; no main merge or unverified release replacement.

## 1. Starting point and current branch

- Repo: https://github.com/hewwobuddy2023-dev/fahrenheit451-game
- Starting branch: `feat/m2-chapters`.
- Verified starting commit: `94c45a3d38a1ec3c562631bd33fe851357a47eee`.
- Main at inspection: `7861c3bc78c1f0d24043c9c52596ba9ec7a92d57`, earlier docs.
- M1 preservation tag `m1-complete` retained, target `55e09891b6b0fa668faa50e08928bc2f7cb05830`.
- Work branch: `work/overnight-mobile-qa`.
- Latest verified implementation commit: **`46129d63ac2b41c48581fbe91e19883dbc6827f9`**. A documentation-only descendant carries this handoff; inspect the PR’s current head or `git rev-parse origin/work/overnight-mobile-qa` for its exact SHA. Static documentation cannot contain its own commit hash.
- Earlier implementation commits: `4155f7ee96d8243f047aa8b78a49e711cf5bd272` (mobile/saves), `5d4a45006268f8c406560663ef44b96cb10960ba` (campaign/regressions).
- Draft PR: **https://github.com/hewwobuddy2023-dev/fahrenheit451-game/pull/1**, base `feat/m2-chapters`.

## 2. Completed changes

1. Repaired a reproduced scrolled-camera UI hit-test failure. Phaser’s container helper skips inherited scroll-factor properties, so rendered fixed controls had moving hit areas. Set `.setScrollFactor(0)` directly on each interactive button, menu zone, dialogue choice, journal hit target and pause blocker.
2. Added full-row touch targets, larger/wrapped choice panels, usable chapter-select spacing, DIVE, pointer-specific hold release/cancel, mobile control wording and objective wrapping. Quick ACT taps latch during Hound response windows instead of relying only on held-state polling.
3. Save boundaries now include a complete interaction/cutscene/transition. Six legacy interrupted checkpoints recover into their next rooms. Unknown room saves are rejected. localStorage getter failures are caught inside try blocks. Continue of a finished ending goes to its ending card; New Game asks before replacing an existing save.
4. Fixed an actual full-run crash: the reused RoomScene kept a destroyed spray emitter from Chapter 1, then used it again at the Chapter 2 vent. Clear that reference in `init`.
5. Stillness waits freeze behind overlays; movement restarts the wait and produces one notice per onset, rather than one per frame.
6. Eight padded smooth flame frames retain orange instead of clipping/bleeding neighboring frames. River uses a small floating surface silhouette, stroke, bob and wake; normal walking/shadow return at shore. No movement speed, collision, hazard period or timer changes.
7. Removed nonexistent title sky texture request. Font CSS is Latin-only; unused font subsets are removed from the production output. Safe areas use a real inset parent, not padding that Phaser would count in its measured size.
8. Added real Phaser DOM/native Canvas simulation suites to PR CI and created all six requested school drafts plus QA/performance evidence.

## 3. Files modified

Game: `index.html`, `src/main.ts`, `src/state.ts`, new `src/checkpoints.ts`, `src/art/fx.ts`, `src/art/figures.ts`, `src/scenes/MenuScene.ts`, `src/scenes/RoomScene.ts`, `src/ui/MenuList.ts`, `src/ui/Hud.ts`, `src/ui/Dialogue.ts`, `src/ui/Journal.ts`.

Tests/config: `package.json`, `package-lock.json`, `.github/workflows/pages.yml`, `tests/state.test.ts`, new `tests/simulation.mjs`, `tests/campaign.mjs`, `tests/regression.mjs`, `tests/visual.mjs`, `tests/support/simulation.mjs`, `tests/support/campaign.mjs`.

Documentation/art evidence: `AGENTS.md`, `CLAUDE.md`, `README.md`, `PROGRESS.md`, `TESTING.md`, `ART_DIRECTION.md`, `ASSET_MANIFEST.md`, `QA_REPORT.md`, `PERFORMANCE_AUDIT.md`, `RULEBOOK.md`, `CONNECTION_STATEMENT_DRAFT.md`, `PRESENTATION_SCRIPT.md`, `DEMO_ROUTE.md`, `PLAYTEST_FORM.md`, `RUBRIC_AUDIT.md`, this handoff, `CLAUDE_RESUME_PROMPT.md`, four comparison WebP fixtures in `docs/qa`.

Use `git diff --name-status 94c45a3..origin/work/overnight-mobile-qa` for the authoritative list at review time.

## 4. Tests actually executed

- Initial inherited baseline: 7 tests, typecheck, build passed independently.
- Final local unit suite: **9/9 passed**.
- TypeScript and Vite production build: **passed**; existing large-chunk warning remains.
- Touch simulation: **844×390, 667×375, 390×844 and 1366×768/lowres passed** New Game, dialogue, movement, journal, pause/resume.
- Campaign simulation: **01–15 sequential normal run, 15/15, Preservation**. Fifteen wrong-answer attempts retried; watched theft blocked then succeeded; stillness reset and six-second pause; Hound miss/retry; boulevard capture/crossing; count-of-ten timeout/reset/escape; river capture and two-finger dive crossing.
- **Defiance and Submission completed independently** from the legitimate 14/15 checkpoint with actual Continue/choice inputs. Full epilogues, shared bombing and final cards completed.
- Chapter 2–5 Continue checkpoints passed. Ending Continue and return to title passed.
- Regression: corrupt and unknown-room saves, blocked localStorage getter through boot/checkpoint, all five Presentation starts and quits without changing normal save, multitouch release/cancel/blur, keyboard movement/repeat suppression, mid-ignition reload/atomic save, cancel-first restart confirmation and flame-edge transparency passed.
- Comparison fixtures rendered and visually inspected. These are synthetic Canvas captures using fallback fonts.
- PR CI initial run `42749692291` passed; full-campaign run `42750416512` passed. Inspect current PR head’s completed check before approving. Final implementation CI `42751743738` at `46129d6` also passed every suite and build.

## 5. Mobile result and limitations

A real input defect was reproduced and repaired in the scrolled room. Missing DIVE and lost quick touches are also fixed. **The owner’s physical iPhone title-screen “cannot tap anything” report is not conclusively closed.** Baseline title synthetic taps already worked, so do not equate that separate symptom with the camera-scroll finding.

Simulation runs the actual bundled Phaser engine and actual TouchManager/hit tests under jsdom + native Canvas. It uses deterministic time and fallback fonts. It is **not Chromium, WebKit, Safari or a phone** and does not prove native viewport/gesture behavior or GPU rendering.

Local Chromium could not launch because socket creation was denied. WebKit was not installed. Cloud Chrome could not reach local dev server. The **existing deployed baseline** did render its title and reached the opening after mouse/Enter actions in cloud Chrome at 1363×936; it did not contain Work changes. No real iPhone or Chromebook test occurred. No hardware FPS claim is valid from the simulation or throttled cloud view.

## 6. Visual, narrative and dependency changes

Visuals: shared flames and river surface presentation above; no full 3D, downloaded art or extra dense particles. About 729 KiB calculated additional raw RGBA texture pixels (not measured GPU cost). JS about 388.84 kB gzip, CSS about 0.37 kB gzip in final local build; dist about 2.0 MiB including fallback fonts. See `PERFORMANCE_AUDIT.md`.

Narrative: original event order, satisfaction-first opening, choices, three outcomes and shared bombing preserved. Only runtime control instructions changed (Down/E → DIVE/ACT on touch). Alternate endings stay labeled adaptations. No ebook accessed, extracted or distributed by Work.

One inherited documentation mismatch: STORY says `faber.tear` changes an ending detail, but that flag currently has no ending-specific branch. Other earlier flags affect framing/details. Review whether to add a small approved consequence or revise the claim; all endings remain reachable.

Dependencies: no production/runtime package upgrades. Added pinned **dev-only** `jsdom@31.0.0`, `@napi-rs/canvas@1.1.0`, and direct `esbuild@0.25.12` (already Vite’s transitive version) for reproducible integration simulation. Node 24 required as before. No separate browser framework was added.

## 7. GitHub Pages and merge status

**Work deployed nothing and merged nothing.** Draft PR #1 is for Claude review. Do not infer owner approval from authorization to develop.

The existing workflow deploys pushes to `feat/m2-chapters`, as well as main/M1. Thus merging this PR into M2 may deploy immediately. Review and get owner approval for integration/release before doing so. Preserve GitHub Pages hosting; school blocks the alternatives the owner rejected.

Merge recommendation: **review candidate, not automatic approval**. Automated evidence is strong for covered logic; real browser/iPhone/Chromebook verification remains the highest-priority acceptance gap. Main is not the current game branch. Never force-push, delete branches/tags, or discard Claude’s working changes.

## 8. Exact PC review commands

Use PowerShell. First inspect the existing PC checkout; do not overwrite it. Prefer a separate review worktree. If the destination already exists, inspect it instead of recreating it.

```powershell
git -C "C:\Users\gabe\Documents\Fahrenheit451Game" status --short
git -C "C:\Users\gabe\Documents\Fahrenheit451Game" fetch origin
git -C "C:\Users\gabe\Documents\Fahrenheit451Game" worktree add --detach "C:\Users\gabe\Documents\Fahrenheit451Game-WorkReview" origin/work/overnight-mobile-qa
Set-Location "C:\Users\gabe\Documents\Fahrenheit451Game-WorkReview"
git rev-parse HEAD
git log --oneline 94c45a3..HEAD
git diff --stat 94c45a3..HEAD
npm ci
npm test
npm run typecheck
npm run test:simulation
npm run test:campaign
npm run test:regression
npm run build
npm run dev -- --host 127.0.0.1
```

Open the URL Vite prints, with `?debug`, then separately `?debug&lowres`. Test actual browser keyboard and touch emulation, then true WebKit where supported. An emulated iPhone viewport in Chrome still is not Safari. Use a Mac/iPhone or an owner-approved preview served from the reviewed source for actual iPhone acceptance. Do not silently deploy Work just to make it reachable.

Inspect the PR via GitHub or, if GitHub CLI is installed/authenticated:

```powershell
gh pr view 1 --repo hewwobuddy2023-dev/fahrenheit451-game
gh pr checks 1 --repo hewwobuddy2023-dev/fahrenheit451-game
gh pr diff 1 --repo hewwobuddy2023-dev/fahrenheit451-game
```

If you need fixes, create a review branch from the isolated worktree after checking branch-name availability. Never run reset/clean against the owner’s original checkout. If M2 advanced, compare both heads, resolve conflicts on a review branch, rerun checks and ask the owner before integration.

## 9. Next milestone and unresolved work

1. **Browser/device acceptance:** patched build in Chromium and true WebKit; owner’s real iPhone. Test New/Continue, all chapter-select rows and Back, movement/hold/quick tap, choices, journal, pause/quit, river two fingers, Hound retry, all endings and rotation/toolbar/safe areas. Capture failures with exact commit/viewport.
2. Actual Chromebook/school-Wi-Fi launch, demanding scene FPS, lowres comparison, five-minute scene and reduced-FPS escape fairness. No benchmark has been fabricated.
3. Two real people playtest; record actual answers in `PLAYTEST_FORM.md`.
4. Owner verifies three short quotations/pages against one paginated edition; revise the approximately 309-word essay body before quotations, then count final 300–400 words. MOBI locations are not print pages.
5. Review the rulebook; rehearse `DEMO_ROUTE.md` in 3–5 minutes. No rehearsal/recording has been claimed.
6. Owner/Claude approve a release, then integrate deliberately with Pages deployment behavior understood.

## 10. Continuity and conflicts

Windows PC’s uncommitted state is **unobserved**. No local PC work was touched. Only the remote M2 checkpoint was available. Work commits are isolated and fast-forwarded through connected GitHub operations because shell push lacked credentials. Final source/art checkpoints are pushed; the documentation commit carries this handoff. Check remote branch and local status before starting a new writer.

When the owner says **“I’m on PC”**, read this handoff and the current PR state first. Explain what passed, the remaining real-device uncertainty, and that Claude must review before the owner decides whether to merge. Begin the browser/device acceptance milestone, not another redesign.

No automatic continuation or five-hour usage reset has been scheduled. Resume manually from this branch/PR and prompt; do not promise unattended restarts.
