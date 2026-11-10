# ART & AUDIO DIRECTION — LIGHTWEIGHT ANALOG DYSTOPIA

**Motif:** oppressive retro-futuristic 1950s city; charcoal and desaturated gray, muted cream UI, ember orange/red propaganda and fire; later forest/campfire introduces warmer, organic values. More cinematic than overt VHS.

- Game view: 2D side-view, striking silhouettes, layered illustrated backgrounds, a few subtle looped environmental animations. Designed for Chromebook readability at common 1366×768 viewport, adapted to 960×540 logical view.
- Typography: readable sans for objectives/dialogue, restrained period-inspired display typography for title and broadcasts. Licensed fonts only; system fonts are acceptable.
- UI: clean main menu (Play, Continue, Settings, Credits, Presentation Mode), high-contrast dialogue; small objective label, interaction prompt and optional journal with clear 1–15 progress.
- Analog artifacts: occasional CRT television scanline/static during **transitions or televised scenes**, subtle vignette/film grain optional. Don't continuously obscure gameplay or text.
- Camera: gentle movement and scene transition, no excessive shake/motion blur. Keep motion accessible and predictable.
- Characters: minimal but identifiable silhouettes and purposeful expressive poses; no laborious full skeletal cutscenes. No jumping animations.
- Hound: threatening readable silhouette and warning cues; 2D scripted speed/range; avoid expensive pathfinding and photorealistic assets.
- Asset quality: one coherent art style; never combine mismatched low-res pixel art, photo backgrounds, 3D renders and inconsistent character drawings.
- Audio: muted ambient machinery, page rustle, fire, broadcast distortion, rhythmic chase pulse, hopeful natural ambience. User must be able to mute. Respect autoplay restrictions: start audio only on user gesture.
- License: create original or clearly licensed assets; record URL, creator, license and modifications in `ASSET_MANIFEST.md`. No copyrighted commercial-game screenshots, samples, or songs included as distributed assets.

## Asset budgets (targets, not verified)

- Initial compressed download <=20 MB ideal, measure build output before asserting.
- Favor modest static/webp/png assets, small sprite sheets; avoid high-res video and ambient WAV loops.
- Create placeholder art matching final palette during M1; do not spend an entire milestone polishing one backdrop while 14 challenges remain.

## QA checklist

Check against low-effect preset; check menus/dialogue at Chromebook size; inspect contrast with/without grain; ensure text doesn't touch edges or overlap; touch hit targets usable on iPhone landscape; validate all font fallback and licensed assets.

## Work reusable polish pass — November 9

- Flame atlas: 8 smooth phase frames, 96×144 padded cells (previously 6×64×112). Transparent cell edges avoid clipped tongues and neighboring-frame bleed. Source-over painted bodies retain orange; separate emissive glows, embers and smoke remain additive where appropriate. Regression checks verify side padding in every generated frame.
- River: a small 8-frame surface silhouette, arm stroke, bob and wake replaces the upright walk cycle until the shore flag. Contact shadow returns on land. Movement speed, hazard rules, timers and collision positions are unchanged.
- Wider touch rows, wrapped choices, explicit per-target fixed scroll factors, DIVE and mobile-specific control wording. Title no longer asks for a nonexistent room sky texture. Latin-only font CSS reduces unused font output.
- Comparison captures in `docs/qa/` are Canvas simulations using fallback fonts, not browser/WebGL or iPhone screenshots. Real-device visual approval is outstanding.


## Day 2 composition pass

Reusable baked cast details and interior trim, static ground planes/reflections, branching tree silhouettes and a distant forest layer improve separation across five chapters. Foreground fades use both sprite widths so the swimmer remains visible. Scripted walk/pole-slide/fall poses own their animation/position instead of being overwritten by normal frame updates. Fresh opening now creates its truck texture before display. Existing flame atlas and float/wake remain intact.

No interactive decorative layers, new particle density, full 3D or external art. Reduced motion suppresses decorative grain, camera shake/flash and fast subway background scrolling. Original synthesized room ambience and bounded interaction cues follow this palette without a loud soundtrack. Review native WebGL color captures; Canvas fixtures ignore some tints.
