# Game spec

**Working title:** Fahrenheit 451: The Fireman's Choice.
**Primary device:** low-end Chromebook Chrome; secondary desktop Chrome and iPhone Safari.
**Target length:** about 25-30 minutes for a first run, with 15 discrete challenges.

## Gameplay

- 2D cinematic side-view, short connected rooms. No jumping, no open world. A/D or arrow movement, E to interact, Enter/Space to advance dialogue, Esc pause; key-repeat never double-fires an action. Touch has left/right/interact buttons and large dialogue taps for phone landscape.
- Slow, cinematic but responsive movement. Clarity comes before immersion.
- Flow: objective, explore, dialogue or short logic/memory puzzle or one pursuit, completion recorded, checkpoint, next scene.
- 5 chapters, 3 challenges each, played in order. `CHALLENGES.md` is authoritative.
- Three distinct endings. Earlier choices influence framing, and all three are reachable without lockout. Invented endings are labelled as such.
- Mechanical Hound: scripted, telegraphed, predictable, with a local restart. No large AI system.
- Dialogue: short original in-character text in readable boxes with strong contrast.
- In-engine cutscenes and story cards only; no video or 3D.
- Journal: 15 numbered objectives with completion flags. Completion is never faked in a normal run.
- Accessibility: no timed reading, mute, pause, text readable at 1366x768, no colour-only clues, reduced motion, assisted hose.
- Chapter Select: jump to any chapter. It never writes the normal save.

## Performance and runtime

- Phaser 3 + TypeScript + Vite. Client-only static app with a localStorage checkpoint, no accounts, backend or runtime third-party API.
- Logical view 960x540, scaled, with no critical UI cropped at the edges. 60 fps target, 30 fps acceptable.
- Small sprite sheets and baked backgrounds; no perpetual full-screen post-processing or huge textures. Cosmetic effects scale down automatically; gameplay timing and choices never change.
- Hosted on GitHub Pages with the correct Vite base path; refresh and direct URLs work.

## Non-goals

Multiplayer, accounts, leaderboards, runtime AI services, full stealth AI, open-world pathfinding, voice acting, large cinematics, realistic 3D, inventory systems.

## Done means

All 15 challenges completable in one normal run, three endings reachable, journal truthful, build and tests clean, no critical visual overlap at Chromebook size.
