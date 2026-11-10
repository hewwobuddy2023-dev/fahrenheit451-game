# Audio diagnosis and evidence plan

Day 2 already contains an original Web Audio engine: lazy single context, bounded voices, noise/oscillator bed, gesture resume, mute, quiet on overlays/background, local settings. Preserve it. Phaser's unused audio backend is deliberately disabled.

Source shows profile × master attenuation and a very low-frequency bed; both may make laptop speakers seem silent. That is a hypothesis until actual output samples are measured. Owner recording unavailable; wrong deployed build, browser/system mute, capture routing and device speaker response remain possible. No private recording metadata is inferred.

Implement a modest bounded mix increase, a clearly labeled sound-check control, direct volume presets, distinct subway rhythm and noise-based feedback using the existing buffer. Verify native AudioContext output through an analyser/sample capture with nonzero RMS/peak while running and near-zero after mute. Retain the sample/log as waveform evidence, not proof of physical speakers or musical quality. Owner must listen on phone and Chromebook. No external music, commercial samples or download service.
