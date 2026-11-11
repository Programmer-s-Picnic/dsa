# Cartoon Speaker Studio v1.2

**Live page:** https://dsa.learnwithchampak.live/tools/cartoon-speaker/

An original, self-contained HTML/JavaScript cartoon teaching presenter created for Learn With Champak. The app runs entirely in the browser on GitHub Pages.

## Run

Visit the live page in Chrome or open `index.html` in a modern browser. Tap **Test voice** to hear an example or **Speak script** to animate the full bilingual script. A gesture can be previewed without enabling audio.

## Features

- Full-body vector cartoon teacher with animated arms, head, mouth, eyes and body
- Eight emotions and twelve gestures
- English/Hindi browser speech synthesis with editable script and language cues
- Volume, pitch (perceived voice tone), speaking speed, expressiveness and five voice presets
- Emotion-aware per-phrase delivery, with optional `soft` or `strong` cues
- Play/pause/stop, local saving, JSON import/export and reduced motion
- Responsive mobile and desktop light-blue interface

## Script cues

Each line can optionally start with `[emotion|gesture|language|delivery]`:

```text
[happy|welcome|hi-IN] नमस्ते दोस्तों!
[thinking|think|en-IN|soft] What is a loop?
[excited|celebrate|en-IN|strong] Excellent! You got it!
```


## Animated presenter (v1.2)

The default stage now displays an illustrated presenter based on the supplied character reference, using `assets/presenter.png` with transparent background. If that image fails to load, the original articulated SVG cartoon remains as a fallback.

- The presenter **moves left and right across the stage** during narration and on the **Move around** preview button.
- A simple walking-leg illustration, body tilting/bobbing, and a speech mouth overlay follow the delivery state.
- The **Move across the stage while speaking** checkbox enables/disables the movement. Reduced-motion mode also disables walking.
- Each spoken script line can move the character to a new stage position. Pause and Stop also stop talking/walking motions.
- In the Python Super Editor hosted by the `Programmer-s-Picnic/lesson-viewer` repository, **Explain Code**, **Read Output**, and **Explain Error** send prepared dialogue to the speaker. The bridge requests automatic playback, with manual **Speak script** as a fallback when browser permissions prevent autoplay.

This is an **animated 2.5D illustrated character**, not a motion-captured video. Arm poses are inherited from the supplied visual; the walking legs are stylized, and lip synchronization is approximate rather than phonetic.

## Architecture and limitations

This published version is **self-contained**: CSS, SVG and JavaScript are embedded in `index.html` so there are no external module dependencies or compilation steps. The studio can later be split into modules for character rigging, speech synthesis, script processing and animation.

It uses the Web Speech browser API rather than a hosted TTS service. Available voices, output quality, pause behavior and Hindi support vary by device. Mouth motion follows speech cadence but is not timed phoneme/viseme lip synchronization. Pitch is a relative voice control, not exact hertz; output volume still depends on the device. No audio/video recording, cloud voice cloning or AI chat is claimed in this version.

Project files are saved in the browser's local storage; export JSON for backups.

© 2026 Learn With Champak.