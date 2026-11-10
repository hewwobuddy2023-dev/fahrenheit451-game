# GAME SPEC v0.9 — DESIGN LOCK FOR PREFLIGHT

**Working title:** Fahrenheit 451: The Fireman's Choice (title may change only with approval).
**Audience:** high-school English, students may not know the book.
**Target duration:** 10–15 minutes, including 15 discrete meaningful challenges.
**Primary device:** low-end Chromebook Chrome on school Wi-Fi; secondary desktop Chrome and iPhone Safari.

## Gameplay essentials

- 2D cinematic side-view, short connected 2D rooms. No jumping, no large open world. Horizontal A/D or arrow movement, E/interact, Enter/Space for appropriate dialogue advancement, Esc pause; prevent double-action due to key-repeat. Touch left/right/interact and large dialogue taps for phone landscape.
- Movement slow/cinematic but responsive; don't sacrifice clarity to immersion.
- Objective -> inspect/explore -> dialogue/short logic or memory puzzle or one pursuit -> completion recorded -> checkpoint -> next scene.
- 5 narrative chapters, 3 challenge IDs each, all available sequentially in standard mode. `CHALLENGES.md` is authoritative.
- Three fully distinct ending sequences; earlier dialogue/choices influence framing or access, but all three should be testable without unrecoverable lockout. Preserve storyline's major beats; label invented alternative conclusions.
- Mechanical Hound: scripted, telegraphed, predictable, local restart/checkpoint. One separate brief detection/hiding encounter acceptable; no large AI behavior system.
- Dialogue: short original in-character text, readable boxes, strong contrast, occasional speaker portrait if inexpensive; no verbose VN wall of text.
- Brief in-engine cutscenes / illustrative story cards; no full-motion videos or labor-intensive 3D animation.
- Journal: 15 numbered objectives with completion flags and short real-book connection text. Do not falsify completion in normal mode.
- Accessibility: Story/Normal difficulty optional if inexpensive; no timed text readability pressure, mute, pause, text sizes readable at 1366x768, avoid color-only clues.
- Presentational demo: clearly separate 'Presentation Mode' demonstrating choice, short puzzle, brief pursuit and ending within 3–5 minutes; does not fake a normal playthrough or grade proof.

## Performance / runtime

- Working candidate stack: Phaser 3 + TypeScript + Vite. Verify actual stable versions and official template at implementation time; do not assume Phaser 3/4 API interchangeability.
- Client-only static app with localStorage checkpoint and state schema, safe reset, no accounts/backend, no runtime third-party API.
- Logical design around 960×540 scaling, no edge cropping of critical UI. 60fps target / 30fps acceptable; <20MB compressed initial asset goal is aspirational, must measure. Asset load/sizes must be inspected.
- Prefer sprite sheets, small reusable illustrated/scalable backgrounds, pre-rendered lighting; avoid perpetual full-screen postprocessing and massive textures. Automatically adjust *cosmetic* effects; never change gameplay collision/timing/choices.
- Github Pages hosted under owner/repo; correct Vite base and asset URLs; must handle refresh and cache invalidation; direct URL should work on Chromebook. v.gd is optional tested redirect, never sole entry point.

## Explicit non-goals

Network multiplayer, account system, leaderboards, actual external AI at runtime, full stealth AI, open-world pathfinding, voice acting, large cinematics, realistic 3D, overbuilt inventory, 60-minute campaigns. Unapproved feature additions prohibited.

## Definition of Done

All mandatory challenge IDs tested in one normal run; three endings reachable; objective journal truthful; build/test clean; no critical visual overlap on Chromebook; Pages loads via school Wi-Fi; backup/demo route tested; teacher rubric deliverables completed from actual evidence.
