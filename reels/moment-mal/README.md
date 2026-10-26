# Moment mal?! – Reel-Produktion

Projektdateien für die Instagram-Reels von „Moment mal?!“ (Charakter Ole). Unabhängig von der Website.

- `brand/`: Branding-Guide und Profilbild
- `audio/vo_raw.mp3`: Originalstimme Folge 1 (vidIQ/ElevenLabs, Voice-ID `TX3LPaxmHKxFdv7VOQHJ`), `timing.json` = Wort-Zeitpunkte
- `render/`: Three.js-Szenen (`reel.js`), Renderer (`render.js`)
- `tools/`: `align.py` (Pausen kürzen, Untertitel-Timing), `music.py` (Musik + SFX), `mix.sh` (Endmischung)

## Folge 1 neu bauen
```
cd reels/moment-mal/render && npm install
mkdir -p ../work/audio ../work/render ../work/out && cp ../audio/vo_raw.mp3 ../work/audio/
python3 ../tools/align.py ../work            # erzeugt work/audio/vo.wav + timing.json
node render.js video 0 68.3 ../work/out/p1.mp4
```
Stand: erste Version, wirkte zu billig. Nächster Schritt: Neuaufbau mit den Plugins Motion Reel, SoundWeaver, Social Media Skills, Remotion, video-shotcraft.
