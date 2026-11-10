# Performance audit — evidence and remaining measurements

## Measured build output

Linux workspace, Node 24.22.1, npm 11.9, Vite 6.4.6, Phaser 3.90.0. Production output after polish:

| Item | Raw | Gzip |
|---|---:|---:|
| JavaScript | about 1,624.68 kB | about 388.84 kB |
| CSS | about 1.54 kB | about 0.37 kB |

The final tiny HTML safe-area correction does not change JS/CSS hashes. Dist is about 2.0 MiB including WOFF fallbacks. Vite’s size units are decimal kB. These are build artifacts, **not measured cold-load transfer over school Wi-Fi**. No new runtime image downloads were added. Test-fixture pictures in `docs/qa` are not bundled runtime assets. Latin-only CSS removes unused font subsets; browser font selection/network transfer remains to be measured.

## Source review

- Existing procedural room painting and family texture cleanup retained. No 3D renderer, new runtime framework, fluid simulation, or network API.
- Flame raw atlas grows from 384×112 to 768×144: approximately 264 KiB additional RGBA storage. The floating sheet is 1408×80 (~440 KiB), wake 160×40 (~25 KiB). About **729 KiB** additional raw pixel storage, excluding browser/GPU copies, padding and driver overhead. This is calculated, not a GPU-memory measurement.
- Existing particle rates retained; no dense new particle system. Float/wake are two small draw objects in the river. Character shadows hide over water.
- Stillness movement notices now allocate once at movement onset instead of every frame. Fixed scene-held destroyed particle reference.
- Render zoom remains capped at 1.5; existing governor may lower it. No governor changes to speed, timers, hazard periods or logic were introduced.

## Not measured

No real Chromebook FPS, GPU memory, school-network transfer, sustained thermal behavior, browser reduced-FPS chase fairness, or five-minute stability result is claimed. The deterministic simulation supplies a nominal FPS; its timings cannot be used as performance results. Cloud Chrome baseline displayed very low/throttled FPS during tool operation and is not representative school hardware.

## Owner measurement procedure

1. On the school Chromebook and school Wi-Fi, cold-load the reviewed Pages build with `?debug`. Record device/Chrome/version/viewport and commit.
2. Sample burn, parlor walls, boulevard, river and camp for at least 30 seconds each; record sustained lowest FPS and control responsiveness.
3. Repeat with `?debug&lowres`; complete the timed escape and dive crossing at both resolutions.
4. Leave one demanding scene active five minutes and retest movement, pause, journal and Continue.
5. If below 30 FPS or the timer becomes unfair, prioritize effect/render cost and actual elapsed-time movement review before more decorative work. Do not change challenge timing as an undocumented quality setting.
