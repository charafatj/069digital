# REVIEW – Moment mal?! Folge 1 (3-D paper diorama, HyperFrames)

## What changed against the flat final
- Same script, voice, captions, music, SFX and timing as the flat final.
- Every scene is split into depth planes (back wall/sky -800, ground -200..-400, main object 0, frames +16..+40, Ole/near clouds +110..+220), each a real CSS-3D plane with a paper-cut shadow.
- Windows are real holes: the sky sits 800 px behind the fuselage/cabin wall and shifts against the frame (parallax).
- A slow per-scene camera orbit (±3.2° yaw, 2.4→-1.6° pitch, small truck and dolly, alternating direction) makes the depth visible; the existing push-ins and the zoom through the cabin window run on top of it.
- Exploded window panes sit on three depths (inner, middle, outer).
- Soft paper grain over the frame (below the captions).

## Measured
- `lint` 0 errors; `check` passed (KABINENDRUCK raised to 30 px because the card plane is scaled by its depth).
- `snapshot --review`: 25 beat frames and 12 seams looked at; no edge reveals, labels still hit their targets.

## Not checked / weakest
- Word timing of captions and Ole's mouth is estimated (no offline transcription).
- English ElevenLabs voice reading German.
