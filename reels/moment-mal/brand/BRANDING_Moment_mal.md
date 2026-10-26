# Moment mal?! – Branding & Formel

Instagram-Reels/TikTok/Shorts im Stil von „Warum eigentlich…?“: 3D-Low-Poly-Erklärvideos zu Alltagsfragen, ca. 60 Sekunden, deutsch. Eigene Marke, eigener Charakter, eigene Stimme, damit das Profil wiedererkennbar ist und keine Kopie.

---

## 1. Profil

| | |
|---|---|
| **Name** | Moment mal?! |
| **Handle** | @momentmal.erklaert (Alternativen: @momentmal.wissen, @moment.mal.ole) |
| **Kategorie** | Bildung / Wissenschaft & Technik |
| **Profilbild** | Ole-Kopf frontal auf Navy-Hintergrund (`profilbild_ole.png`) |

**Bio (max. 150 Zeichen):**
```
Alltag. In 60 Sekunden erklärt. 🧠
Ich bin Ole & stelle die Fragen, die du dir nie gestellt hast.
Neue Folge jeden Tag ↓
```

**Story-Highlights:** „Technik“, „Körper“, „Essen“, „Verkehr“, „Eure Fragen“ (Cover: orangefarbener Kreis, weißes Icon).

---

## 2. Der Charakter: Ole

Ole ist in **jedem** Video zu sehen und **er ist die Stimme**. Der Erzähler ist also kein anonymer Sprecher, sondern Ole selbst (Lippen bewegen sich synchron zur Stimme).

- **Look:** Low-Poly-3D, orange Beanie mit cremefarbenem Bommel, runde Navy-Brille, mintgrüner Hoodie mit Bändeln, braune Haarspitzen, große runde Augen
- **Persönlichkeit:** neugierig, leicht nerdig, ehrlich verblüfft. Er weiß es nicht besser als du, er hat nur nachgeschaut.
- **Feste Gesten:** zeigt auf das Thema (Hook), Finger hoch („Achtung, jetzt kommt's“), Daumen hoch (Pointe), Winken (Outro)
- **Regeln:** Beanie und Hoodie ändern sich nie. Nur Hintergrund und Requisiten wechseln je Thema.

Das Modell ist im Code definiert (`render/reel.js` → `makeOle()`) und sieht deshalb in jedem Video exakt gleich aus.

---

## 3. Stimme

| | |
|---|---|
| **Stimme** | „Liam – Energetic, Social Media Creator“ (ElevenLabs, über vidIQ) |
| **Voice-ID** | `TX3LPaxmHKxFdv7VOQHJ` (immer genau diese verwenden) |
| **Nachbearbeitung** | Pausen auf 0,12 s / 0,22 s kürzen, Tempo ×1,08, Loudness −15 LUFS |
| **Kosten** | ca. 14 vidIQ-Credits pro 1.000 Zeichen (ein 60-s-Skript ≈ 1.000 Zeichen) |

Tipp für später: Eine eigene geklonte Stimme (oder ein „Voice Design“) macht die Marke noch eindeutiger. Dann einfach die neue Voice-ID hier eintragen.

---

## 4. Look & Feel

**Farben**

| Rolle | Hex |
|---|---|
| Navy (Hintergrund, Text) | `#13203F` |
| Signal-Orange (Marke, aktives Wort) | `#FF6A3D` |
| Mint (positiv, „gelöst“) | `#2EE6B6` |
| Rot (Problem, Gefahr) | `#FF3B47` |
| Gelb (Geschichte, Fakten) | `#FFC94A` |
| Creme | `#FFF3E0` |

**Schrift:** Montserrat 900 (Headlines, Untertitel), 800 (Labels), 600 (Fließtext).

**Untertitel:** max. 3 Wörter, dunkle Pille, weiße Schrift, das gerade gesprochene Wort in Orange. Position: unteres Drittel (y ≈ 1460 px), damit die Instagram-Buttons nichts verdecken.

**Info-Karten:** weiße abgerundete Karte, Farbstreifen links (Farbe = Bedeutung), kleines Label oben in Versalien, großer Wert darunter.

**Logo:** „Moment mal“ in Weiß + „?!“ in Orange. Kleiner orangefarbener Badge „MOMENT MAL?!“ oben links in jedem Video.

---

## 5. Die Video-Formel (60–70 s)

| Zeit | Baustein | Beispiel (Folge 1) |
|---|---|---|
| 0–3 s | **Hook:** verblüffende Behauptung + Frage als Titel | „Fenster im Flugzeug sind nie eckig. Niemals.“ |
| 3–7 s | **Spannung:** es gibt einen Grund, den kaum einer kennt | „…und dafür gibt es einen ziemlich düsteren Grund.“ |
| 7–22 s | **Story:** echtes Ereignis mit Jahr und Zahl | 1954, Comet, 2 Abstürze in 3 Monaten |
| 22–47 s | **Erklärung:** ein Bild pro Satz, Problem in Rot, Lösung in Mint | Druckzyklen → Spannung an Ecken → Riss → runde Fenster |
| 47–60 s | **Twist:** „Achtung, jetzt kommt's:“ + Detail, das man selbst prüfen kann | Das kleine Loch im Fenster |
| 60–66 s | **Pointe:** ein kurzer Satz zum Mitnehmen | „Sie sind der Grund, warum du heil ankommst.“ |
| 66–68 s | **Outro:** „Moment mal. Folg mir für mehr.“ + Folgen-Button | |

**Feste Sätze (Wiedererkennung):**
- Twist-Einleitung: „Achtung, jetzt kommt's:“
- Abschluss: „Moment mal. Folg mir für mehr.“

**Warum das viral gehen kann:** Alltagsfrage, die jeder kennt → echte, überprüfbare Geschichte → Detail, das man beim nächsten Mal selbst entdeckt (wird geteilt: „Schau mal!“) → kurzer Schlusssatz für die Kommentare.

---

## 6. Folge 1: Caption zum Posten

```
Warum sind Flugzeugfenster eigentlich rund? ✈️
1954 hat die Antwort zwei Flugzeuge gekostet.

Und schau beim nächsten Flug mal unten ins Fenster 👀

Wusstest du das? Schreib's in die Kommentare 👇

#flugzeug #fliegen #wissen #lernenmitinstagram #wusstestdu #fakten #technik #luftfahrt #erklärt #momentmal
```
Cover-Text (für das Raster): **„Warum sind Flugzeugfenster rund?“**

Faktencheck Folge 1: De Havilland Comet = erstes Düsen-Passagierflugzeug (Linienbetrieb ab 1952). 1954: BOAC Flug 781 (Januar) und South African Airways Flug 201 (April). Die Untersuchung ergab Metallermüdung, ausgehend von Ecken der Ausschnitte im Rumpf. Das Entlüftungsloch sitzt in der mittleren Scheibe: Die äußere Scheibe trägt den Druck, und es beschlägt nicht zwischen den Scheiben.

---

## 7. Die nächsten 12 Themen

1. Warum hat Brot ein Haltbarkeitsdatum, Salz aber auch? (Gesetz vs. Chemie)
2. Woher weiß dein Handy, wo du bist, ohne Internet?
3. Warum ist die Banane krumm?
4. Warum gibt es bei Autobahnen keine „Kurven“, sondern Klothoiden?
5. Warum sind Schulbusse in den USA gelb?
6. Wohin fließt das Wasser aus dem Flugzeug-Klo?
7. Warum steht auf Mineralwasser ein Haltbarkeitsdatum?
8. Warum haben Steckdosen in Deutschland zwei Löcher (und was macht der Bügel)?
9. Warum gähnen wir, wenn andere gähnen?
10. Warum ist der Himmel blau, aber der Sonnenuntergang rot?
11. Warum klebt Tesafilm, aber nicht an der eigenen Rolle?
12. Warum stehen Flugzeuge vor dem Start so lange auf dem Rollfeld?

Jedes Thema vor dem Dreh kurz gegenchecken. Eine einzige falsche Zahl kostet in den Kommentaren mehr Vertrauen, als ein Video Reichweite bringt.

---

## 8. Posting-Plan

- **Frequenz:** täglich 1 Reel in den ersten 30 Tagen (mind. 4 pro Woche)
- **Uhrzeit:** 18–20 Uhr
- **Plattformen:** Instagram Reels + TikTok + YouTube Shorts (gleiche Datei)
- **Erste Stunde:** jeden Kommentar beantworten, Fragen der Community als nächste Folge ankündigen („Folge 7 kommt von @…“)

---

## 9. Produktion der nächsten Folgen

Alles liegt im Ordner `render/`:
- `reel.js`: Szenen, Charakter, Untertitel, Karten (Three.js)
- `render.js`: rendert die Bilder in Chromium und erzeugt das MP4
- `tools/align.py`: kürzt Pausen der Stimme und berechnet die Wort-Zeitpunkte für die Untertitel
- `tools/music.py`: Musikbett + Soundeffekte

Ablauf pro Folge: Skript schreiben → Stimme mit Voice-ID generieren → `align.py` → Szenen in `reel.js` anpassen (Ole, Farben, Untertitel bleiben gleich) → rendern → mischen.
