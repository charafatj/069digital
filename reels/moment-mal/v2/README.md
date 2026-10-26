# Folge 1 – Version 2 (Motion Reel)

Neuaufbau mit dem kostenlosen Plugin **Motion Reel**: echtes three.js-3D, Ole als rigged Roboter (RobotExpressive, CC0), Musik/Stimme auf 105-bpm-Grid.

- `folge01/film.js` – Timeline, Overlays, Untertitel, Hits (Sound = Bild)
- `folge01/sets/` – Kabine, Himmel (Jet + Comet), Druckröhre, Rumpfblech, Studio
- `folge01/docs/` – Shot-Liste, Model Sheet, Critique-Log
- `vo_grid.py` – legt die Sätze der Stimme auf den Beat

## Rendern
Plugin installieren: `claude plugin install motion-reel@anthropic-plugin-directory`, dann im Ordner `v2/`:
```
npm i three@0.160.0 opentype.js@1.3.4 && npm i -D playwright
python3 vo_grid.py <ordner mit audio/vo_raw.mp3 und audio/timing.json> folge01
uv run <skill>/scripts/beats.py folge01 --synth --flavor lofi --bpm 105 --tonic A --mode dorian --drop 2 --duration 70.394
node <skill>/scripts/render.mjs --film folge01 --format 9x16 --video-only --fps 30
node <skill>/scripts/render.mjs --film folge01 --format 9x16 --hits && node <skill>/scripts/sfx.mjs folge01 && node <skill>/scripts/mix.mjs folge01
```
