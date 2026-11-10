# TEST MATRIX & ACCEPTANCE CRITERIA

## Hard acceptance (must be demonstrated, not assumed)

- [ ] Browser loads without installing anything on school Chromebook Chrome, on the **actual school Wi-Fi**.
- [ ] All 15 numbered challenges complete in one normal full run; journal displays 15/15 accurately.
- [ ] Three endings viewed via legitimate gameplay paths or clearly separate Presentation Mode; no dead endings or choice lockout.
- [ ] Keyboard E/Enter/Space inputs do not double-advance; WASD/arrow movement responsive; no jumping.
- [ ] Dialogue readable at 1366x768 and small Chromebook window; user can pause; menu always reachable.
- [ ] Capture in chase/Hound returns to nearby checkpoint; game resumes without state corruption.
- [ ] New Game and Continue behave consistently; browser storage can be reset; versioned save handles corrupted data.
- [ ] GitHub Pages correctly loads assets under `/<repo>/`, not root-only local URLs; game works on cache-cleared visit.
- [ ] iPhone landscape controls do not overlap text/dialogue (secondary target).
- [ ] No crucial gameplay relies on audio; mute works. No mandatory API/backend.
- [ ] Measured performance on actual or representative low-end Chromebook; log hardware/browser and FPS, and any quality profile changes.
- [ ] At least TWO OTHER REAL PEOPLE physically or remotely playtest; record genuine results, do not invent.
- [ ] 300–400 word statement has three verified short novel quotations and exact matching edition page numbers; otherwise explicitly unresolved.
- [ ] Rulebook and 3–5-minute presentation script/demonstration are ready.

## Agent tests after authorization

M1: build/typecheck; launch in real browser; movement screenshot; one challenge interaction; dialogue progression; reload; Pages asset-path test.
M2: sequential smoke test all 15; branches/endings; checkpoint persistence; normal/Story if implemented.
M3: screenshot comparisons on Chromebook-sized viewport; mobile landscape; frame-rate measurement; sprite/audio asset audit.
M4: clean-browser hosted test on school Chromebook, real playtest records, oral presentation rehearsal.

## Actual human playtests form

Tester alias / date / device / actual duration / number of challenges reached / 1 confusing instruction / 1 problem or bug / what they understood of censorship theme / whether ending made sense / changes made afterward. Leave blank until performed.

## Visual bug template

Device + viewport + URL + commit + reproduction steps + expected + actual + screenshot/video path + severity + fixed commit.

## Work evidence and repeatable commands — November 9

Run on Node 24 after `npm ci`:

```sh
npm test
npm run typecheck
npm run test:simulation
npm run test:campaign
npm run test:regression
npm run build
```

All commands passed locally at implementation checkpoint `46129d6`. The PR workflow runs the simulation suites as well as unit/build checks. `tests/support/simulation.mjs` runs the actual bundled Phaser game under jsdom/native Canvas, with synthetic TouchManager events and deterministic time. It is not a real browser, WebKit, iPhone, human playtest or hardware benchmark. Campaign tests teleport between static hotspots, not through chase crossings; they do not set completion flags. `QA_REPORT.md` contains the per-challenge results and limitations.

Do not tick the hardware/browser/human/citation hard-acceptance items above from these simulation results. Use `PLAYTEST_FORM.md`, `PERFORMANCE_AUDIT.md` and `WORK_TO_CLAUDE_HANDOFF.md` for the remaining acceptance work. Existing deployed Pages was observed rendering its title and opening in cloud Chrome; that Sprint 1 historical checkpoint had not been browser-tested or deployed. Day 2 native results below supersede the browser gap; no deployment has occurred.


## Day 2 browser and extended regressions

```sh
npm ci
npm test
npm run typecheck
npm run test:simulation
npm run test:campaign:all
npm run test:regression
npm run test:day2
npm run test:cinematics
npm run build
npx playwright install chromium webkit
npm run test:browser
```

Linux CI installs browser system dependencies with `npx playwright install --with-deps chromium webkit`. The browser suite serves the production build with Vite preview on 127.0.0.1:4173. It uses browser-protocol mouse/touch/keyboard input and reads state for assertions; no __qa progression calls. Chromium uses CDP for a held native touch; WebKit uses native touch taps plus keyboard holds. This is Linux WebKit, not physical Safari/iOS.

Continuous trace screenshots can stall software WebGL readback. Routine CI tracing is off; failures retain PNGs/results. For a focused diagnosis: set `F451_TRACE=1` to retain a trace without screencast screenshots. Do not treat traced CI FPS as school hardware performance. Waits for holds/movement assert observed completion with bounded deadlines rather than assuming a fixed wall-time delay means the engine processed that much game time.

`npm run test:gallery` produces staged eleven-scene after captures in `docs/qa/day2-after/` (ignored generated files). They are Canvas fixtures, not human progress. `DAY2_QA_REPORT.md` records the inherited versus newly reproduced bugs and real browser results. Follow the physical device checklist in `PLAYTEST_FORM.md` before declaring iPhone/Chromebook acceptance.


Final Day 2 implementation `95837d3`, CI `42808394871`: **20/20 native tests and 11/11 unit tests PASS**, with all three complete simulated ending campaigns and remaining regression/typecheck/build checks PASS. Deployment SKIPPED. Physical-device acceptance remains open; use the explicit checklist in `DAY2_QA_REPORT.md`.


## Phoenix candidate

Read `docs/phoenix/QA_RESULTS.md` for exact new head/run results; Day 2 results are inherited history. Add `npm run test:phoenix` to the prior sequence. Native tests exercise source-first recall failure/reread/success, missing-image fallback, watched hold, finite dive/recovery, actual audio analyser/mute output and a short native offline-rendered sound sample. None proves a physical phone, actual speakers, a real Chromebook, enjoyment or measured first-time duration. See the Phoenix handoff and device checklist.
