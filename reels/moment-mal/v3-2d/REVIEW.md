# REVIEW – Moment mal?! Folge 1 (flat 2-D, HyperFrames)

## Creative calls
- Switched from code-rendered 3-D to flat vector motion design after the 3-D versions read as cheap. Every scene is SVG + GSAP inside HyperFrames; no 3-D plate.
- Ole redrawn as a flat character (orange body, mint bands, navy eyes and brows) with a rig: blink, brows, head turn, arms, jump, and a mouth driven by the voice envelope.
- Explainer devices: zoom through the cabin window into the sky; the square window morphs into the round one while the stress lines swap from navy/red to mint; exploded panes with the hole on the middle pane; a pressure chart that traces each cycle.
- One flat ground per scene (cream cabin, sky, sand for 1954, dusk for the crash, grey metal, mint for Ole beats). The only full flash is the tear.

## Measured
- `lint`: 0 errors. `check`: ok; kept warnings: captions file length (one host for all 62 groups by design), one 10 ms mouth-tween overlap, contrast of the decorative "?!" on the plane fin.
- Snapshots at 0.3, 2.9, 4.5, 7.6, 11, 18.2, 19.6, 20.3, 21.9, 25, 33, 38.5, 41.2, 45.5, 48.2, 50.5, 52.8, 57, 59.6, 61.8, 64.8, 68.5 s looked at.
- Sound: voice + lofi bed (ducked) + 20 cues from the HyperFrames SFX library. Measured, not heard.

## Not checked / weakest
- Word timings for captions and the mouth are estimated from the voice's pauses (no local transcription available), so single words can be ~0.1–0.2 s off.
- Weakest shot: the crash (15.4–20.9 s) – the break-up is small in frame; with more time the camera would push in on the split.
- The voice is still an English ElevenLabs voice reading German.
