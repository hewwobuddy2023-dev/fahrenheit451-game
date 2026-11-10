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
