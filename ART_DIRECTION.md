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
