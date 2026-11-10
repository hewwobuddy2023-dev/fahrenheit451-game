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

## Day 2 — November 10

Measured local production output at `7691f07`: about **2,007,352 bytes** total (22 files, including license notices). Main JS **1,637,967 bytes**; Vite reports about **394.07 kB gzip**. A separate Python gzip level-9 calculation yields 389,193 bytes; compression settings differ. These are file measurements, not a school-Wi-Fi transfer measurement. No audio files or runtime audio requests are added.

Audio: one two-second mono Float32 buffer (~172 KiB at 22.05 kHz / 375 KiB at 48 kHz), one ambience oscillator and at most eight short cue oscillators. Buffer generated once after first gesture. Settings, diagnostics and sound add no framework. Cast/trim changes reuse existing texture dimensions; the distant forest adds roughly 2.4 MiB raw RGBA for the larger river scene, excluding browser/GPU copies. Static ground geometry adds no per-frame allocations or particles. Duplicate sky draws removed.

Initial actual CI browser captures at `baa0771` showed about **3 FPS Chromium** and **7 FPS WebKit** with trace screencast enabled, at 1366×768 or 844×390 / DPR 3, WebGL renderer type 2, render zoom 1.5. WebKit version reported 27.2. This instrumentation/headless environment is not a physical Chromebook or iPhone benchmark. GPU ReadPixels stall warnings appeared in the Chromium trace. Routine tracing is now off; input assertions wait for observed engine progress. Native rerun frame distributions are recorded in `DAY2_QA_REPORT.md` after inspection.

The original governor only sampled room play after 180 frames and reduced resolution once. It now checks sustained time windows across title and cinematics and can step down to 960×540. A deterministic regression forces low reported FPS and verifies both cosmetic reductions, unchanged save data and correct touch input afterward. Timed escape passes at 30 and 20 FPS deterministic deltas. Neither result measures hardware throughput. No claim is made for fair gameplay at the initial traced CI's 3 FPS.

Still required: real Chromebook cold-load, school Wi-Fi, browser/version/model, 30-second scene samples, one five-minute session, lowres comparison, timed chase and actual presentation rehearsal.

Final audio/config code checkpoint `80f1cb0`: main JS 1,638,602 bytes; Python gzip level 9 389,385 bytes; full dist 2,007,987 bytes including notices. Vite reports approximately 394.26 kB gzip. Earlier figures above are retained with their exact checkpoint.


Low-FPS fairness correction at `95837d3`: the previous 50 ms movement cap made the 10 FPS timed escape repeatedly time out, while its timer used full delta. Movement now uses the supplied Phaser delta and exponential velocity easing. The 10, 20 and 30 FPS deterministic escape cases pass without changing base speed, hazard periods or timer limit. This addresses fairness, not a 10 FPS quality target.

Completed native run `42805025544` at `7691f07`: 16/16 PASS. Median/95th-percentile frame intervals for 120-frame WebGL samples at 960×540 were 150.0/166.7 ms Chromium desktop, 150.1/166.7 ms Chromium touch, 41/48 ms WebKit landscape and 34/43 ms WebKit portrait. Runtime observed 10 same-origin requests and no external/audio requests. These are headless CI data; actual Chromebook hardware remains unmeasured. Exact resource timing arrays are in the review archive.

Final implementation `95837d3`: main JS 1,638,645 bytes; Python gzip level 9 389,385 bytes; dist 2,008,030 bytes. Vite estimates about 394.26 kB gzip. Build-metrics JSON in the archive identifies these exact bytes and source SHA.


Final native run `42808394871` at `95837d3`: 20/20 PASS. The 120-RAF median/p95 intervals were Chromium desktop 83.3/100.0 ms, Chromium touch 66.7/83.4 ms, WebKit landscape 30/35 ms, WebKit portrait 23/25 ms. Browser versions/viewports match the Day 2 QA report; WebGL, canvas 960×540. The variation between CI runs is another reason not to infer school-device throughput. Full resource and frame arrays are included in the archive.


## Phoenix candidate

See `docs/phoenix/QA_RESULTS.md` and the review archive for source-specific native frame/resource arrays. At `2efd881` all 32 Chromium/WebKit checks passed; median/p95 RAF intervals were 66.7/83.4 ms (both Chromium views), 32/34 ms (WebKit landscape), 26/30 ms (WebKit portrait), WebGL / canvas 960×540. This is slow headless CI, not actual Chromebook throughput. Ten same-origin asset bodies totaled ~608.4–608.7 kB plus HTML; an extra same-origin decoder blob is not an external service. Actual school Wi-Fi/GPU/thermal behavior remains unknown.

Final runtime local build at `98e5aa2`: JS 1,656,112 bytes, Python gzip9 396,166 bytes, full dist 2,070,271 bytes, generated city WebP 44,774 bytes. Vite reports about 401.10 kB gzip with different compression. The city adds ~3 MiB decoded texture, working cast sheet ~1.16 MiB, excluding driver copies. Room set textures follow existing family cleanup; no new full-screen shader. Audio remains one generated buffer/two ambient sources and bounded cue voices, now including short filtered buffer cues. Finite breath and hose regulation depend on elapsed deltas, not frame count.

New dev-only @types/node 24.19.2 and undici-types 7.24.6; runtime packages unchanged. Source archives without Git can build with an honest metadata fallback. No claim of physical speakers, real-iOS audio, 30/60 FPS hardware acceptance or measured 25–30-minute first-time duration.
