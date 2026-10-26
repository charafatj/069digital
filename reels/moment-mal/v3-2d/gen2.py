# Moment mal?! Folge 1 — flat 2-D version. Writes index.html + compositions/*.html for HyperFrames.
# Usage: python3 gen2.py <project dir> <dir with vo_timing.json + vo_env.json>
import json, sys, os, html, math
from art import C, ole, cloud, plane, flow_paths

PROJ, PL = sys.argv[1], sys.argv[2]
VO = json.load(open(f"{PL}/vo_timing.json")); SEN = VO["sentences"]; P = VO["period"]
ENV = json.load(open(f"{PL}/vo_env.json"))
DUR, W, H = 70.4, 1080, 1920
s = lambda i: SEN[i]["s"]
e = lambda i: SEN[i]["e"]
def word(i, prefix):
    for x in SEN[i]["words"]:
        if x["w"].strip(".,:;!?'’").lower().startswith(prefix.lower()): return x["s"]
    raise KeyError(prefix)
NAVY, ORANGE, RED, MINT, MINTD = C["navy"], C["orange"], C["red"], C["mint"], "#0F9C79"

CSS = """
@font-face { font-family: "MM"; src: url("assets/fonts/mm-600.woff2") format("woff2"); font-weight: 600; }
@font-face { font-family: "MM"; src: url("assets/fonts/mm-800.woff2") format("woff2"); font-weight: 800; }
@font-face { font-family: "MM"; src: url("assets/fonts/mm-900.woff2") format("woff2"); font-weight: 900; }
#root { position: absolute; inset: 0; font-family: "MM", sans-serif; overflow: hidden; }
.full { position: absolute; inset: 0; }
.big { position: absolute; left: 0; width: 100%; text-align: center; font-weight: 900; letter-spacing: -.02em; line-height: 1.02; }
.big span { display: inline-block; }
.lbl { position: absolute; background: #fff; border-radius: 10px; padding: 20px 28px 22px; box-shadow: 0 10px 28px rgba(10,16,34,.16); display: grid; }
.lbl .sm { font-weight: 800; font-size: 28px; letter-spacing: .1em; text-transform: uppercase; }
.lbl .vals { display: grid; }
.lbl .val { grid-area: 1 / 1; font-weight: 800; font-size: 52px; color: #13203F; line-height: 1.12; white-space: nowrap; }
svg { overflow: visible; }
"""

class Scene:
    def __init__(self, cid, start, end, bg):
        self.cid, self.start, self.end, self.bg = cid, start, end, bg
        self.svg, self.html, self.js, self.n = [], [], [], 0
    @property
    def d(self): return round(self.end - self.start, 3)
    def t(self, a): return round(a - self.start, 3)
    def uid(self, k): self.n += 1; return f"{self.cid}-{k}{self.n}"
    def add(self, svg="", js=""):
        if svg: self.svg.append(svg)
        if js: self.js.append(js)
    def label(self, t0, t1, box, target, small, values, color):
        i = self.uid("lb"); bx, by = box; x1, y1 = bx + 46, by + 136; tx, ty = target
        vals = "".join(f'<div class="val" id="{i}-v{k}" style="opacity:{1 if k == 0 else 0}">{html.escape(v)}</div>' for k, (_, v) in enumerate(values))
        self.html.append(f'''<div id="{i}" class="clip full" data-start="{self.t(t0)}" data-duration="{round(t1 - t0, 3)}" data-layout-allow-overlap><div id="{i}-in" class="full">
<svg class="full" width="{W}" height="{H}" viewBox="0 0 {W} {H}"><line id="{i}-ln" x1="{x1}" y1="{y1}" x2="{tx}" y2="{ty}" stroke="{color}" stroke-width="4" stroke-linecap="round" stroke-dasharray="2400" style="stroke-dashoffset:2400"/><circle id="{i}-dot" cx="{tx}" cy="{ty}" r="10" fill="{color}" stroke="#fff" stroke-width="4" style="transform-box:fill-box;transform-origin:center"/></svg>
<div id="{i}-box" class="lbl" style="left:{bx}px;top:{by}px"><div class="sm" style="color:{color}">{html.escape(small)}</div><div class="vals">{vals}</div></div></div></div>''')
        a = self.t(t0)
        self.js += [f'tl.fromTo("#{i}-ln", {{strokeDashoffset: 2400}}, {{strokeDashoffset: 0, duration: 0.32, ease: "power2.inOut"}}, {a});',
                    f'tl.fromTo("#{i}-dot", {{scale: 0}}, {{scale: 1, duration: 0.3, ease: "back.out(2)"}}, {a + 0.2});',
                    f'tl.fromTo("#{i}-box", {{clipPath: "inset(0% 100% 0% 0%)", x: -14}}, {{clipPath: "inset(0% 0% 0% 0%)", x: 0, duration: 0.42, ease: "expo.out"}}, {a + 0.12});']
        for k in range(1, len(values)):
            ts = self.t(values[k][0])
            self.js += [f'tl.to("#{i}-v{k-1}", {{opacity: 0, filter: "blur(6px)", duration: 0.13, ease: "power3.in"}}, {ts - 0.13});',
                        f'tl.fromTo("#{i}-v{k}", {{opacity: 0, filter: "blur(6px)"}}, {{opacity: 1, filter: "blur(0px)", duration: 0.16, ease: "power4.out"}}, {ts});']
        self.js.append(f'tl.to("#{i}-in", {{opacity: 0, filter: "blur(8px)", duration: 0.18, ease: "power3.in"}}, {self.t(t1) - 0.2});')
        return i
    def words(self, t0, t1, top, lines, step=0.08, sep="&nbsp;", exit_=True):
        i = self.uid("bw"); rows, spans, y = [], [], top
        for (txt, size, color) in lines:
            ws = []
            for w in txt.split(" "):
                sid = f"{i}-w{len(spans)}"; spans.append(sid); ws.append(f'<span id="{sid}">{html.escape(w)}</span>')
            rows.append(f'<div class="big" style="top:{y}px;font-size:{size}px;color:{color}">{sep.join(ws)}</div>'); y += int(size * 1.08)
        self.html.append(f'<div id="{i}" class="clip full" data-start="{self.t(t0)}" data-duration="{round(t1 - t0, 3)}"><div id="{i}-in" class="full">{"".join(rows)}</div></div>')
        for k, sid in enumerate(spans):
            self.js.append(f'tl.fromTo("#{sid}", {{opacity: 0, filter: "blur(6px)"}}, {{opacity: 1, filter: "blur(0px)", duration: 0.14, ease: "power4.out"}}, {self.t(t0) + 0.05 + k * step:.3f});')
        if exit_: self.js.append(f'tl.to("#{i}-in", {{opacity: 0, filter: "blur(8px)", duration: 0.18, ease: "power3.in"}}, {self.t(t1) - 0.2});')
        return i, spans
    # Ole life: blinks, talking mouth from the voice envelope, optional head look
    def ole_life(self, p, talk=True, blinks=None):
        for bt in (blinks or [0.9 + 3.1 * k for k in range(int(self.d / 3.1) + 1)]):
            if bt + 0.16 < self.d:
                self.js.append(f'tl.to("#{p}-eyes", {{scaleY: 0.12, transformOrigin: "50% 50%", duration: 0.06, ease: "power2.in"}}, {bt:.2f}); tl.to("#{p}-eyes", {{scaleY: 1, transformOrigin: "50% 50%", duration: 0.09, ease: "power2.out"}}, {bt + 0.07:.2f});')
        if talk:
            prev = None
            for k in range(int(self.start * 100), int(self.end * 100), 8):
                v = ENV[k] if k < len(ENV) else 0
                tt = k / 100 - self.start
                if prev is not None: self.js.append(f'tl.to("#{p}-mouth", {{scaleY: {1 + v * 2.6:.2f}, transformOrigin: "50% 50%", duration: 0.08, ease: "none"}}, {prev:.2f});')
                prev = tt
    def render(self):
        return f'''<template>
  <style>{CSS}</style>
  <div id="root" data-composition-id="{self.cid}" data-width="{W}" data-height="{H}">
    <svg id="{self.cid}-bgsvg" class="full" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
      <rect id="{self.cid}-bg" width="{W}" height="{H}" fill="{self.bg}"/>
      <g id="{self.cid}-cam">
{chr(10).join(self.svg)}
      </g>
    </svg>
{chr(10).join(self.html)}
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
{chr(10).join("    " + j for j in self.js)}
    window.__timelines["{self.cid}"] = tl;
  </script>
</template>
'''

def drift(sel, dx, dur, start=0):
    return f'tl.fromTo("{sel}", {{x: 0}}, {{x: {dx}, duration: {dur}, ease: "none"}}, {start});'

S = []
# ================================================================ 1 hook: cabin, round window, Ole looks at it
sc = Scene("hook", 0, s(2), C["cream"]); S.append(sc)
win_clouds = cloud(470, 800, 1.1) + cloud(700, 960, 0.8, op=.9) + cloud(520, 1120, 1.3) + cloud(900, 860, 1.0)
sc.add(f'''<rect x="0" y="0" width="1080" height="150" fill="#EDE5D8"/><rect x="0" y="150" width="1080" height="14" fill="#E2D8C8"/>
<rect x="0" y="1640" width="1080" height="280" fill="{C['navy2']}"/>
<rect x="362" y="616" width="380" height="590" rx="190" fill="#E6DDCF"/>
<g id="hook-win"><rect x="350" y="600" width="380" height="590" rx="190" fill="#fff"/>
<clipPath id="hook-wc"><rect x="396" y="646" width="288" height="498" rx="144"/></clipPath>
<g clip-path="url(#hook-wc)"><rect x="396" y="646" width="288" height="498" fill="{C['sky']}"/><rect x="396" y="980" width="288" height="164" fill="{C['sky2']}"/><g id="hook-cl">{win_clouds}</g></g>
<rect x="396" y="646" width="288" height="64" rx="32" fill="#F2EDE4"/></g>
<rect x="30" y="1300" width="340" height="640" rx="60" fill="{C['navy2']}"/>
{ole("ho", 0.8, 210, 1915)}''')
sc.add(js=drift("#hook-cl", -260, sc.d))
sc.add(js='tl.set("#ho-eyes", {x: 22, y: -6}, 0); tl.fromTo("#ho-head", {rotation: 0, transformOrigin: "50% 100%"}, {rotation: 5, transformOrigin: "50% 100%", duration: 0.5, ease: "power2.inOut"}, 0.4);')
sc.words(0.0, s(1) - 0.05, 250, [("Warum sind", 64, NAVY), ("Flugzeugfenster", 104, NAVY), ("rund?", 150, ORANGE)], step=0.12)
# "Niemals": square window + red X, Ole shakes his head
a = sc.t(s(1) - 0.12)
sc.add(f'''<g id="hook-sq" opacity="0"><rect x="770" y="700" width="250" height="250" rx="16" fill="#fff"/><rect x="796" y="726" width="198" height="198" rx="4" fill="{C['sky']}"/>
<line id="hook-x1" x1="776" y1="706" x2="1014" y2="944" stroke="{RED}" stroke-width="28" stroke-linecap="round" stroke-dasharray="400" style="stroke-dashoffset:400"/>
<line id="hook-x2" x1="1014" y1="706" x2="776" y2="944" stroke="{RED}" stroke-width="28" stroke-linecap="round" stroke-dasharray="400" style="stroke-dashoffset:400"/></g>''',
 f'tl.fromTo("#hook-sq", {{opacity: 0, scale: 0.8, transformOrigin: "50% 50%"}}, {{opacity: 1, scale: 1, transformOrigin: "50% 50%", duration: 0.28, ease: "back.out(1.6)"}}, {a}); '
 f'tl.to("#hook-x1", {{strokeDashoffset: 0, duration: 0.15, ease: "power3.out"}}, {sc.t(s(1))}); tl.to("#hook-x2", {{strokeDashoffset: 0, duration: 0.15, ease: "power3.out"}}, {sc.t(s(1)) + 0.14}); '
 + " ".join(f'tl.to("#ho-head", {{rotation: {r}, transformOrigin: "50% 100%", duration: 0.11, ease: "sine.inOut"}}, {sc.t(s(1)) + 0.05 + k * 0.11:.2f});' for k, r in enumerate([-7, 7, -6, 5, 0])))
# zoom through the round window into the sky
sc.add(js=f'tl.to("#hook-cam", {{scale: 7, transformOrigin: "540px 895px", duration: 0.42, ease: "power3.in"}}, {sc.d - 0.42}); tl.to("#hook-sq", {{opacity: 0, duration: 0.15}}, {sc.d - 0.42});')
sc.ole_life("ho", blinks=[1.6])

# ================================================================ 2 jet over clouds, dusk falls
sc = Scene("jet", s(2), s(3), C["sky"]); S.append(sc)
sc.add(f'''<rect id="jet-b2" y="760" width="1080" height="1160" fill="{C['sky2']}"/><rect id="jet-b3" y="1180" width="1080" height="740" fill="{C['sky3']}"/>
<circle id="jet-sun" cx="830" cy="430" r="90" fill="#FFF3D6"/>
<g id="jet-far">{cloud(150, 600, 1.0, op=.9)}{cloud(900, 700, 0.8, op=.8)}{cloud(1300, 560, 0.9, op=.85)}</g>
<g id="jet-pl" transform="translate(40 820)">{plane("jp")}</g>
<g id="jet-near">{cloud(200, 1330, 2.0)}{cloud(620, 1400, 2.4)}{cloud(980, 1320, 1.8)}{cloud(1400, 1360, 2.2)}<rect x="-200" y="1420" width="1900" height="500" fill="#fff"/></g>''')
sc.add(js=drift("#jet-far", -160, sc.d) + drift("#jet-near", -420, sc.d) + f'tl.fromTo("#jet-pl", {{x: 40, y: 820}}, {{x: 70, y: 800, duration: {sc.d}, ease: "sine.inOut"}}, 0);'
       f'tl.fromTo("#jet-cam", {{scale: 1.6, transformOrigin: "540px 900px"}}, {{scale: 1, transformOrigin: "540px 900px", duration: 0.5, ease: "expo.out"}}, 0);'
       f'tl.to("#jet-bg", {{attr: {{fill: "{C["dusk"]}"}}, duration: 1.6, ease: "power2.inOut"}}, 1.4); tl.to("#jet-b2", {{attr: {{fill: "{C["dusk2"]}"}}, duration: 1.6, ease: "power2.inOut"}}, 1.4); tl.to("#jet-b3", {{attr: {{fill: "#A9A7C9"}}, duration: 1.6, ease: "power2.inOut"}}, 1.4); tl.to("#jet-sun", {{attr: {{cy: 820, fill: "#F7C9A8"}}, duration: 2.0, ease: "power2.in"}}, 1.2);')

# ================================================================ 3 1954
sc = Scene("y54", s(3), s(4), C["sand"]); S.append(sc)
sc.add(f'<rect y="1250" width="1080" height="670" fill="{C["sand2"]}"/>{cloud(250, 1260, 1.6, fill="#F8EEDD")}{cloud(820, 1230, 1.3, fill="#F8EEDD")}')
i, sp = sc.words(s(3) - 0.05, s(4), 560, [("1 9 5 4", 320, NAVY)], step=0.1, sep="", exit_=False)
sc.add(js=f'gsap.set("#{i}-in .big", {{letterSpacing: "-0.04em"}}); tl.fromTo("#y54-cam", {{y: 0}}, {{y: 0, duration: 0.01}}, 0); tl.to("#{i}-in", {{y: -900, duration: 0.4, ease: "power3.in"}}, {sc.d - 0.4});')
sc.add(js=f'tl.fromTo("#y54-bg", {{attr: {{fill: "{C["dusk"]}"}}}}, {{attr: {{fill: "{C["sand"]}"}}, duration: 0.35, ease: "power2.inOut"}}, 0);')

# ================================================================ 4 comet: first jet airliner
sc = Scene("comet", s(4), s(6), C["sand"]); S.append(sc)
sc.add(f'''<rect y="1250" width="1080" height="670" fill="{C['sand2']}"/>
<g id="co-far">{cloud(200, 520, 1.0, fill="#F8EEDD")}{cloud(860, 640, 0.9, fill="#F8EEDD")}{cloud(1300, 560, 1.1, fill="#F8EEDD")}</g>
<g id="co-pl" transform="translate(40 820)">{plane("cp", comet=True)}</g>
<g id="co-near">{cloud(240, 1290, 1.9, fill="#F8EEDD")}{cloud(700, 1340, 2.3, fill="#F8EEDD")}{cloud(1150, 1300, 2.0, fill="#F8EEDD")}</g>''')
sc.add(js=drift("#co-far", -200, sc.d) + drift("#co-near", -520, sc.d) + f'tl.fromTo("#co-pl", {{x: -1100, y: 840}}, {{x: 40, y: 820, duration: 0.9, ease: "expo.out"}}, 0); tl.to("#co-pl", {{y: 806, duration: {sc.d - 1}, ease: "sine.inOut"}}, 0.9);'
       f'tl.to("#comet-cam", {{scale: 1.12, transformOrigin: "560px 960px", duration: 1.2, ease: "power2.inOut"}}, {sc.t(s(5)) - 0.2});')
sc.label(s(4) + 0.6, s(6) - 0.05, (72, 300), (640, 950), "De Havilland Comet", [(0, "Erster Düsen-Passagierjet"), (s(5), "Stolz der Luftfahrt")], "#B07A00")

# ================================================================ 5 crash: two Comets in three months
sc = Scene("crash", s(6), s(7), C["sand"]); S.append(sc)
split = word(6, "auseinander")
debris = "".join(f'<path class="cr-deb" d="M{500 + k * 9} {960 + (k % 3) * 8} l{14 + k % 4 * 4} {-10 - k % 3 * 5} l{6 + k % 2 * 6} {18 + k % 3 * 4} z" fill="{C["grey2"]}"/>' for k in range(10))
sc.add(f'''<rect id="cr-b2" y="1250" width="1080" height="670" fill="{C['sand2']}"/>
<g id="cr-near">{cloud(240, 1290, 1.9, fill="#F8EEDD", idp="cr-c1")}{cloud(700, 1340, 2.3, fill="#F8EEDD", idp="cr-c2")}{cloud(1150, 1300, 2.0, fill="#F8EEDD", idp="cr-c3")}</g>
<g id="cr-pl" transform="translate(40 806) scale(1.12)">{plane("rp", comet=True)}</g><g id="cr-debris">{debris}</g>''')
sc.add(js=drift("#cr-near", -520, sc.d) +
       f'tl.to("#crash-bg", {{attr: {{fill: "{C["dusk"]}"}}, duration: 1.4, ease: "power2.inOut"}}, 0.2); tl.to("#cr-b2", {{attr: {{fill: "#2E3560"}}, duration: 1.4, ease: "power2.inOut"}}, 0.2);'
       f'tl.to(["#cr-c1", "#cr-c2", "#cr-c3"], {{attr: {{fill: "#6E6F9E"}}, duration: 1.4, ease: "power2.inOut"}}, 0.2);'
       f'tl.to("#rp-rear", {{rotation: -16, x: -60, y: 260, transformOrigin: "100% 60%", duration: 2.2, ease: "power2.in"}}, {sc.t(split)});'
       f'tl.to("#rp-front", {{rotation: 8, x: 40, y: 90, transformOrigin: "0% 60%", duration: 2.2, ease: "power2.in"}}, {sc.t(split)});'
       + "".join(f'tl.fromTo("#cr-debris .cr-deb:nth-child({k + 1})", {{x: 0, y: 0, rotation: 0, opacity: 1}}, {{x: {math.cos(k * 1.7) * 260:.0f}, y: {abs(math.sin(k * 1.3)) * 380 + 60:.0f}, rotation: {k * 70}, opacity: 0, duration: 1.8, ease: "power1.out"}}, {sc.t(split)});' for k in range(10))
       + f'gsap.set("#cr-debris", {{opacity: 0}}); tl.set("#cr-debris", {{opacity: 1}}, {sc.t(split)});'
       + "".join(f'tl.to("#crash-cam", {{x: {dx}, y: {dy}, duration: 0.05, ease: "none"}}, {sc.t(split) + k * 0.05:.2f});' for k, (dx, dy) in enumerate([(14, -8), (-12, 10), (10, 6), (-6, -4), (3, 2), (0, 0)])))
k_two = word(6, "zwei")
i, sp = sc.words(k_two - 0.05, s(7) - 0.05, 300, [("2 Comets", 130, "#FFFFFF"), ("in 3 Monaten", 64, "#FFFFFF")], step=0.1)
sc.add(js=f'gsap.set("#{sp[0]}", {{color: "#FF7A70"}});')

# ================================================================ 6 wreck: the magnifier finds the cause
sc = Scene("wreck", s(7), s(8), C["dusk"]); S.append(sc)
crack_lens = "M640 820 L668 788 L684 778 L704 748 L730 736 L748 704"
sc.add(f'''<rect y="1250" width="1080" height="670" fill="#2E3560"/>
<g id="wr-lens"><clipPath id="wr-cl"><circle cx="540" cy="960" r="250"/></clipPath>
<g clip-path="url(#wr-cl)"><rect x="280" y="700" width="520" height="520" fill="#E9EDF2"/><rect x="280" y="1080" width="520" height="140" fill="#D6DDE6"/><rect x="280" y="1040" width="520" height="16" fill="#2C5AA0"/>
<rect x="400" y="820" width="240" height="240" rx="8" fill="{NAVY}"/><path id="wr-crack" d="{crack_lens}" fill="none" stroke="{RED}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="200" style="stroke-dashoffset:200"/>
<circle id="wr-hot" cx="640" cy="820" r="70" fill="{RED}" opacity=".35"/></g>
<circle cx="540" cy="960" r="262" fill="none" stroke="{NAVY}" stroke-width="34"/><circle cx="540" cy="960" r="240" fill="none" stroke="{ORANGE}" stroke-width="10"/>
<rect x="700" y="1150" width="70" height="300" rx="35" fill="{NAVY}" transform="rotate(-45 735 1300)"/></g>''')
sc.add(js='tl.fromTo("#wr-lens", {scale: 0.5, opacity: 0, transformOrigin: "540px 960px"}, {scale: 1, opacity: 1, transformOrigin: "540px 960px", duration: 0.45, ease: "back.out(1.4)"}, 0.05);'
          'tl.to("#wr-crack", {strokeDashoffset: 0, duration: 0.5, ease: "power2.out"}, 0.5); tl.fromTo("#wr-hot", {scale: 0, transformOrigin: "50% 50%"}, {scale: 1, transformOrigin: "50% 50%", duration: 0.4, ease: "back.out(2)"}, 0.45);')
sc.label(s(7) + 0.55, s(8) - 0.02, (72, 300), (748, 704), "Ursache", [(0, "Metallermüdung")], RED)

# ================================================================ 7 tube: the cabin is pumped up every flight
sc = Scene("tube", s(8), s(11), C["sky3"]); S.append(sc)
seats = "".join(f'<rect x="{410 + k * 60}" y="1060" width="44" height="54" rx="10" fill="{C["navy2"]}"/><rect x="{410 + k * 60}" y="1030" width="14" height="70" rx="7" fill="{C["navy2"]}"/>' for k in range(5) if k != 2)
arrows = "".join(f'<g class="tb-ar" transform="rotate({k * 30} 540 1000)"><g class="tb-arl"><rect x="536" y="{1000 - 240}" width="8" height="70" fill="{ORANGE}"/><path d="M526 {1000 - 240} L540 {1000 - 268} L554 {1000 - 240} Z" fill="{ORANGE}"/></g></g>' for k in range(12))
sc.add(f'''<g id="tb-ring"><circle cx="540" cy="1000" r="300" fill="#FFF1E4"/><circle cx="540" cy="1000" r="300" fill="none" stroke="#fff" stroke-width="44"/><circle cx="540" cy="1000" r="324" fill="none" stroke="{ORANGE}" stroke-width="6"/>
<rect x="300" y="1112" width="480" height="14" rx="7" fill="{C['grey3']}"/>{seats}
{ole("tbo", 0.17, 540, 1112, mouth=False)}{arrows}</g>''')
sc.add(f'''<rect x="72" y="250" width="936" height="440" rx="14" fill="#fff"/><text x="112" y="310" font-family="MM" font-weight="800" font-size="28" letter-spacing="2.8" fill="{ORANGE}">KABINENDRUCK</text>
<text id="tb-cyc" x="968" y="310" text-anchor="end" font-family="MM" font-weight="800" font-size="28" letter-spacing="2.8" fill="{NAVY}">ZYKLUS 1</text>
<line x1="112" y1="650" x2="968" y2="650" stroke="#C9D0DA" stroke-width="3"/><path id="tb-path" d="M112 650" fill="none" stroke="{ORANGE}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/><circle id="tb-dot" cx="968" cy="650" r="12" fill="{NAVY}"/>''')
sc.html.append(f'''<div id="tb-st" class="clip full" data-start="0" data-duration="{sc.d}"><div style="position:absolute;left:112px;top:326px;display:grid">
<div id="tb-s0" style="grid-area:1/1;font-weight:800;font-size:52px;color:{NAVY}">Start: aufpumpen</div><div id="tb-s1" style="grid-area:1/1;font-weight:800;font-size:52px;color:{NAVY};opacity:0">Landung: Druck raus</div><div id="tb-s2" style="grid-area:1/1;font-weight:800;font-size:52px;color:{NAVY};opacity:0">Immer wieder</div></div></div>''')
sc.add(js=f'''const P0 = {s(8)}, P1 = {s(9)}, P2 = {s(10)}, E8 = {e(8)}, E9 = {e(9)};
    const io = (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2, cl = (x) => Math.min(1, Math.max(0, x));
    function pr(t) {{ if (t < P0) return [0, 1]; if (t < P1) return [io(cl((t - P0 - 0.28) / (E8 - P0 - 0.28))), 1]; if (t < P2) return [1 - io(cl((t - P1) / (E9 - P1))), 1];
      const k = t - P2, ph = k * k * 1.6 + k * 0.9; return [0.5 - 0.5 * Math.cos(ph * Math.PI * 2), 1 + Math.floor(ph + 0.5) * (1 + Math.floor(k * k * 6))]; }}
    const path = document.getElementById("tb-path"), dot = document.getElementById("tb-dot"), cyc = document.getElementById("tb-cyc"), ring = document.getElementById("tb-ring");
    const arl = Array.from(document.querySelectorAll(".tb-arl"));
    const clock = {{ t: 0 }};
    function draw() {{ const t = P0 + clock.t; let d = ""; for (let i = 0; i <= 90; i++) {{ const p = pr(t - (90 - i) * 0.035)[0]; d += (i ? " L" : "M") + (112 + 856 * i / 90).toFixed(1) + " " + (650 - 190 * p).toFixed(1); }}
      path.setAttribute("d", d); const [p, n] = pr(t); dot.setAttribute("cy", (650 - 190 * p).toFixed(1)); cyc.textContent = "ZYKLUS " + n.toLocaleString("de-DE");
      const sc = 1 + 0.07 * p; ring.setAttribute("transform", `translate(540 1060) scale(${{sc.toFixed(4)}}) translate(-540 -1000)`);
      arl.forEach((a) => a.setAttribute("transform", `translate(0 ${{(-40 * p).toFixed(1)}})`) ); arl.forEach((a) => a.setAttribute("opacity", (0.15 + 0.85 * p).toFixed(3))); }}
    tl.fromTo(clock, {{ t: 0 }}, {{ t: {sc.d}, duration: {sc.d}, ease: "none", onUpdate: draw, immediateRender: true }}, 0);
    tl.to("#tb-s0", {{ opacity: 0, filter: "blur(6px)", duration: 0.13 }}, {sc.t(s(9)) - 0.13}); tl.fromTo("#tb-s1", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.16 }}, {sc.t(s(9))});
    tl.to("#tb-s1", {{ opacity: 0, filter: "blur(6px)", duration: 0.13 }}, {sc.t(s(10)) - 0.13}); tl.fromTo("#tb-s2", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.16 }}, {sc.t(s(10))});
    tl.fromTo("#tube-cam", {{ scale: 0.7, opacity: 0, transformOrigin: "540px 1000px" }}, {{ scale: 1, opacity: 1, transformOrigin: "540px 1000px", duration: 0.5, ease: "expo.out" }}, 0);''')

# ================================================================ 8 panel: stress piles up at corners, crack, round window
sc = Scene("panel", s(11), s(18), C["grey"]); S.append(sc)
cx, cy, scl = 540, 900, 230
ys = [y / 10 for y in range(-34, 35, 4) if abs(y) > 1]
sq = flow_paths("sq", cx, cy, scl, ys); rd = flow_paths("rd", cx, cy, scl, ys)
riv = "".join(f'<circle cx="{x}" cy="{y}" r="9" fill="{C["grey3"]}"/>' for x in range(90, 1000, 82) for y in (260, 1560)) + "".join(f'<circle cx="{x}" cy="{y}" r="9" fill="{C["grey3"]}"/>' for y in range(342, 1500, 82) for x in (90, 990))
crack_pts = [(cx + 184, cy - 184), (cx + 214, cy - 222), (cx + 232, cy - 238), (cx + 262, cy - 280), (cx + 300, cy - 300), (cx + 322, cy - 346), (cx + 352, cy - 372), (cx + 380, cy - 410), (cx + 410, cy - 432), (cx + 470, cy - 520)]
crack_d = "M" + " L".join(f"{x} {y}" for x, y in crack_pts)
crack_len = sum(math.dist(crack_pts[k], crack_pts[k + 1]) for k in range(len(crack_pts) - 1))
sc.add(f'''<rect x="0" y="1620" width="1080" height="300" fill="{C['grey2']}"/>{riv}
<g id="pn-sq" opacity="0">{"".join(f'<path class="pn-fl" d="{d}" fill="none" stroke="{NAVY}" stroke-width="5" stroke-linecap="round" stroke-dasharray="26 22" opacity=".8"/>' for d, h in sq)}</g>
<g id="pn-rd" opacity="0">{"".join(f'<path class="pn-fr" d="{d}" fill="none" stroke="{MINTD}" stroke-width="5" stroke-linecap="round" stroke-dasharray="26 22"/>' for d, h in rd)}</g>
<rect id="pn-frame" x="{cx - 196}" y="{cy - 196}" width="392" height="392" rx="14" fill="{C['grey3']}"/>
<clipPath id="pn-wc"><rect id="pn-wcr" x="{cx - 184}" y="{cy - 184}" width="368" height="368" rx="8"/></clipPath>
<rect id="pn-win" x="{cx - 184}" y="{cy - 184}" width="368" height="368" rx="8" fill="{C['sky']}"/><g clip-path="url(#pn-wc)">{cloud(cx - 40, cy + 60, 1.0)}</g>
<g id="pn-hot">{"".join(f'<circle class="pn-h" cx="{cx + sx * 184}" cy="{cy + sy * 184}" r="64" fill="{RED}" opacity=".85"/>' for sx in (-1, 1) for sy in (-1, 1))}</g>
<path id="pn-crack" d="{crack_d}" fill="none" stroke="{NAVY}" stroke-width="9" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="{crack_len + 20:.0f}" style="stroke-dashoffset:{crack_len + 20:.0f}"/>
<rect id="pn-flash" x="-200" y="-200" width="1480" height="2320" fill="#fff" opacity="0"/>''')
CL = crack_len + 20
tear = s(15) + P
js = [f'tl.fromTo("#pn-sq", {{opacity: 0}}, {{opacity: 1, duration: 0.6, ease: "power2.out"}}, 0.3);',
      f'tl.fromTo(".pn-fl", {{strokeDashoffset: 0}}, {{strokeDashoffset: -640, duration: {sc.d}, ease: "none"}}, 0);',
      f'tl.fromTo(".pn-fr", {{strokeDashoffset: 0}}, {{strokeDashoffset: -640, duration: {sc.d}, ease: "none"}}, 0);',
      f'tl.fromTo(".pn-h", {{scale: 0, transformOrigin: "50% 50%"}}, {{scale: 1, transformOrigin: "50% 50%", duration: 0.45, ease: "back.out(1.8)", stagger: 0.06}}, {sc.t(s(11)) + 1.6});']
for bt in [s(12), s(12) + 2 * P]:
    js.append(f'tl.to(".pn-h", {{scale: 1.18, transformOrigin: "50% 50%", duration: 0.12, ease: "power2.out"}}, {sc.t(bt)}); tl.to(".pn-h", {{scale: 1, transformOrigin: "50% 50%", duration: 0.3, ease: "power2.inOut"}}, {sc.t(bt) + 0.12});')
js.append(f'tl.to("#pn-crack", {{strokeDashoffset: {CL * 0.85:.0f}, duration: 0.35, ease: "power3.out"}}, {sc.t(s(13))});')
for k in range(5):
    js.append(f'tl.to("#pn-crack", {{strokeDashoffset: {CL * (0.85 - 0.1 * (k + 1)):.0f}, duration: 0.2, ease: "power3.out"}}, {sc.t(s(14)) + k * P:.3f});')
js += [f'tl.to("#pn-crack", {{strokeDashoffset: 0, duration: 0.25, ease: "expo.out"}}, {sc.t(tear)});',
       f'tl.fromTo("#pn-flash", {{opacity: 0.85}}, {{opacity: 0, duration: 0.45, ease: "power2.out", immediateRender: false}}, {sc.t(tear)});']
js += [f'tl.to("#panel-cam", {{x: {dx}, y: {dy}, duration: 0.05, ease: "none"}}, {sc.t(tear) + k * 0.05:.2f});' for k, (dx, dy) in enumerate([(16, -10), (-14, 12), (10, 8), (-8, -6), (4, 2), (0, 0)])]
# the round window: the square morphs, stress lines swap
r0 = sc.t(s(16))
js += [f'tl.to(["#pn-sq", "#pn-hot", "#pn-crack"], {{opacity: 0, duration: 0.25, ease: "power2.in"}}, {r0 - 0.25});',
       f'tl.to("#pn-win", {{attr: {{x: {cx - 190}, y: {cy - 250}, width: 380, height: 500, rx: 190}}, duration: 0.5, ease: "power3.inOut"}}, {r0 - 0.15});',
       f'tl.to("#pn-wcr", {{attr: {{x: {cx - 190}, y: {cy - 250}, width: 380, height: 500, rx: 190}}, duration: 0.5, ease: "power3.inOut"}}, {r0 - 0.15});',
       f'tl.to("#pn-frame", {{attr: {{x: {cx - 204}, y: {cy - 264}, width: 408, height: 528, rx: 204}}, duration: 0.5, ease: "power3.inOut"}}, {r0 - 0.15});',
       f'tl.fromTo("#pn-rd", {{opacity: 0}}, {{opacity: 1, duration: 0.6, ease: "power2.out"}}, {r0 + 0.3});']
sc.add(js=" ".join(js))
sc.label(s(11) + 0.8, s(13) - 0.05, (72, 260), (cx + 184, cy - 184), "Spannung", [(0, "kann nicht ausweichen"), (s(12), "staut sich an den Ecken")], RED)
lid = sc.label(s(13) + 0.05, s(16) - 0.25, (72, 260), crack_pts[3], "Riss wächst", [(0, "Flug 1")], RED)
sc.add(js=f'const fl = {{ v: 1 }}, fv = document.getElementById("{lid}-v0"); tl.fromTo(fl, {{ v: 1 }}, {{ v: 1300, duration: {round(tear - s(14), 3)}, ease: "power2.in", immediateRender: true, onUpdate: () => {{ fv.textContent = "Flug " + Math.round(fl.v).toLocaleString("de-DE"); }} }}, {sc.t(s(14))});')
sc.label(s(16) + 0.35, s(18) - 0.05, (72, 220), (cx, cy - 250), "Keine Ecken", [(0, "nichts staut sich"), (s(17), "Kraft fließt drumherum")], MINTD)

# ================================================================ 9 wow: Achtung!
sc = Scene("wow", s(18), s(19), C["mint"]); S.append(sc)
sc.add(f'<rect y="1500" width="1080" height="420" fill="{C["mint2"]}"/>{ole("wo", 1.15, 540, 1560)}')
sc.add(js='tl.fromTo("#wo", {y: 0}, {y: -170, duration: 0.28, ease: "power2.out"}, 0.05); tl.to("#wo", {y: 0, duration: 0.24, ease: "power2.in"}, 0.33);'
          'tl.fromTo("#wo-brows", {y: 0}, {y: -34, duration: 0.2, ease: "back.out(2)"}, 0.05); tl.fromTo("#wo-eyes", {scale: 1, transformOrigin: "50% 50%"}, {scale: 1.15, transformOrigin: "50% 50%", duration: 0.2, ease: "back.out(2)"}, 0.05);'
          'tl.fromTo("#wo-armL", {rotation: 0, transformOrigin: "50% 4%"}, {rotation: 150, transformOrigin: "50% 4%", duration: 0.25, ease: "back.out(1.6)"}, 0.05); tl.fromTo("#wo-armR", {rotation: 0, transformOrigin: "50% 4%"}, {rotation: -150, transformOrigin: "50% 4%", duration: 0.25, ease: "back.out(1.6)"}, 0.08);'
          'tl.fromTo("#wow-cam", {scale: 1.25, transformOrigin: "540px 1100px"}, {scale: 1, transformOrigin: "540px 1100px", duration: 0.5, ease: "expo.out"}, 0);')
sc.ole_life("wo", blinks=[])
sc.html.append(f'<div id="wow-t" class="clip full" data-start="0.12" data-duration="{sc.d - 0.12:.3f}"><div id="wow-in" class="big" style="top:280px;font-size:160px;color:{NAVY}">Achtung!</div></div>')
sc.add(js=f'tl.fromTo("#wow-in", {{scale: 1.35, opacity: 0, filter: "blur(10px)"}}, {{scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.32, ease: "back.out(1.4)"}}, 0.12); tl.to("#wow-in", {{opacity: 0, filter: "blur(8px)", duration: 0.16, ease: "power3.in"}}, {sc.d - 0.18});')

# ================================================================ 10 hole: look at the bottom of the window
sc = Scene("hole", s(19), s(22), C["cream"]); S.append(sc)
hx, hy = 540, 1050
sc.add(f'''<rect x="232" y="292" width="640" height="890" rx="320" fill="#E6DDCF"/>
<rect x="220" y="276" width="640" height="890" rx="320" fill="#fff"/>
<clipPath id="ho-wc"><rect x="262" y="318" width="556" height="806" rx="278"/></clipPath>
<g clip-path="url(#ho-wc)"><rect x="262" y="318" width="556" height="806" fill="{C['sky']}"/><rect x="262" y="880" width="556" height="244" fill="{C['sky2']}"/><g id="ho-cl">{cloud(420, 600, 1.4)}{cloud(760, 760, 1.1)}{cloud(520, 980, 1.6)}{cloud(980, 900, 1.3)}</g>
<rect x="262" y="318" width="556" height="806" rx="278" fill="none" stroke="#fff" stroke-width="10" opacity=".55"/></g>
<circle cx="{hx}" cy="{hy}" r="13" fill="{NAVY}"/>
<circle id="ho-ring" cx="{hx}" cy="{hy}" r="44" fill="none" stroke="{ORANGE}" stroke-width="7" opacity="0"/>
{ole("hoo", 0.62, 110, 2040)}''')
sc.add(js=drift("#ho-cl", -240, sc.d) + 'tl.set("#hoo-eyes", {x: 26, y: -18}, 0);'
       f'tl.fromTo("#hole-cam", {{scale: 1, transformOrigin: "{hx}px {hy}px"}}, {{scale: 1.18, transformOrigin: "{hx}px {hy}px", duration: 1.4, ease: "power2.inOut"}}, {sc.t(s(20)) - 0.2});'
       f'tl.fromTo("#ho-ring", {{opacity: 0, scale: 0.6, transformOrigin: "50% 50%"}}, {{opacity: 1, scale: 1, transformOrigin: "50% 50%", duration: 0.35, ease: "back.out(2)"}}, {sc.t(s(20)) + 0.3});'
       f'tl.fromTo("#hoo", {{y: 380}}, {{y: 0, duration: 0.5, ease: "expo.out"}}, 0.2);')
sc.ole_life("hoo")
sc.label(s(20) + 0.45, s(22) - 0.05, (72, 250), (hx * 1.0, hy), "Winzig, aber wichtig", [(0, "Entlüftungsloch"), (s(21), "kein Fehler ✓")], ORANGE)

# ================================================================ 11 panes: three panes, the outer one carries the load
sc = Scene("panes", s(22), s(24), C["cream"]); S.append(sc)
def pane(pid, x, fill, op):
    return f'<g id="{pid}" transform="translate({x} 0)"><g transform="translate(390 860) skewY(-12) translate(-390 -860)"><rect x="240" y="620" width="300" height="470" rx="150" fill="{fill}" opacity="{op}"/><rect x="240" y="620" width="300" height="470" rx="150" fill="none" stroke="{NAVY}" stroke-width="7"/></g></g>'
sc.add(f'''{pane("pa-in", 0, C['sky2'], .55)}<g id="pa-fog"><g transform="translate(390 860) skewY(-12) translate(-390 -860)"><rect x="244" y="624" width="292" height="462" rx="146" fill="#fff" opacity=".9"/></g></g>
{pane("pa-mid", 0, C['sky2'], .55)}<circle id="pa-hole" cx="390" cy="1040" r="12" fill="{NAVY}"/>
{pane("pa-out", 0, C['sky2'], .55)}
<g id="pa-push" opacity="0">{"".join(f'<g transform="translate({840} {760 + k * 110})"><rect x="0" y="-6" width="90" height="12" fill="{ORANGE}"/><path d="M0 -22 L-30 0 L0 22 Z" fill="{ORANGE}"/></g>' for k in range(3))}</g>''')
x0 = 0.15
sc.add(js=f'tl.fromTo("#pa-in", {{x: 160}}, {{x: -40, duration: 0.8, ease: "expo.out"}}, {x0}); tl.fromTo("#pa-fog", {{x: 160}}, {{x: -40, duration: 0.8, ease: "expo.out"}}, {x0});'
          f'tl.fromTo("#pa-mid", {{x: 160}}, {{x: 160, duration: 0.8, ease: "expo.out"}}, {x0}); tl.fromTo("#pa-hole", {{x: 160}}, {{x: 160, duration: 0.8}}, {x0});'
          f'tl.fromTo("#pa-out", {{x: 160}}, {{x: 360, duration: 0.8, ease: "expo.out"}}, {x0});'
          f'tl.fromTo("#pa-fog", {{opacity: 0}}, {{opacity: 1, duration: 0.3}}, {x0 + 0.5});'
          f'tl.to("#pa-out rect:first-child", {{attr: {{fill: "{ORANGE}"}}, duration: 0.4, ease: "power2.inOut"}}, 2.0);'
          f'tl.fromTo("#pa-push", {{opacity: 0, x: 60}}, {{opacity: 1, x: 0, duration: 0.4, ease: "expo.out"}}, 2.0);'
          f'tl.to("#pa-fog", {{opacity: 0, duration: 0.9, ease: "power2.inOut"}}, {sc.t(s(23)) + 0.6});')
for name, col, px, t0 in [("INNEN", NAVY, 310, 1.0), ("MITTE", NAVY, 510, 1.15), ("AUSSEN", ORANGE, 710, 1.3)]:
    tid = sc.uid("tag")
    sc.html.append(f'<div id="{tid}" class="clip full" data-start="{t0}" data-duration="{sc.d - t0:.3f}"><div id="{tid}-c" style="position:absolute;left:{px - 95}px;top:500px;width:190px;text-align:center;background:{col};color:#fff;font-weight:800;font-size:30px;letter-spacing:.08em;padding:12px 0;border-radius:8px">{name}</div></div>')
    sc.add(js=f'tl.fromTo("#{tid}-c", {{opacity: 0, y: 20}}, {{opacity: 1, y: 0, duration: 0.35, ease: "expo.out"}}, {t0}); tl.to("#{tid}-c", {{opacity: 0, filter: "blur(8px)", duration: 0.18, ease: "power3.in"}}, {sc.d - 0.2});')
i, sp = sc.words(s(22) + 2.0, s(23) - 0.05, 260, [("Den Druck trägt", 64, NAVY), ("die äußere Scheibe", 64, ORANGE)], step=0.07)
sc.words(s(23) + 0.3, s(24) - 0.05, 260, [("Die innere", 64, NAVY), ("beschlägt nicht", 64, MINTD)], step=0.07)

# ================================================================ 12 sunset: round is no design choice
sc = Scene("sunset", s(24), s(25), C["sun"]); S.append(sc)
sc.add(f'''<rect y="820" width="1080" height="1100" fill="{C['sun2']}"/><circle cx="760" cy="900" r="150" fill="#FFF1D8"/>
<g id="su-pl" transform="translate(40 860)">{plane("sp")}</g>
<g id="su-near">{cloud(220, 1340, 2.0, fill="#FFF4E8")}{cloud(640, 1400, 2.4, fill="#FFF4E8")}{cloud(1050, 1330, 1.9, fill="#FFF4E8")}<rect x="-200" y="1420" width="1900" height="500" fill="#FFF4E8"/></g>''')
sc.add(js=drift("#su-near", -380, sc.d) + 'tl.fromTo("#su-pl", {x: -60}, {x: 80, duration: ' + str(sc.d) + ', ease: "none"}, 0); tl.to("#sp rect[fill=\'' + NAVY + '\']", {attr: {fill: "#FFC94A"}, duration: 0.5, stagger: 0.01}, 0.3);')
i, sp = sc.words(s(24) + 0.3, s(25) - 0.05, 300, [("Rund ist kein", 72, NAVY), ("Design", 150, NAVY)], step=0.1)
k_design = word(24, "Design")
sc.html.append(f'<div id="su-strike" class="clip full" data-start="{sc.t(k_design + 0.25)}" data-duration="{round(s(25) - k_design - 0.3, 3)}"><svg class="full" width="{W}" height="{H}" viewBox="0 0 {W} {H}"><line id="su-l" x1="300" y1="460" x2="780" y2="460" stroke="{RED}" stroke-width="18" stroke-linecap="round" stroke-dasharray="500" style="stroke-dashoffset:500"/></svg></div>')
sc.add(js=f'tl.to("#su-l", {{strokeDashoffset: 0, duration: 0.22, ease: "power3.out"}}, {sc.t(k_design + 0.25)});')

# ================================================================ 13 punchline: thumbs up
sc = Scene("punch", s(25), s(26), C["mint"]); S.append(sc)
sc.add(f'<rect y="1500" width="1080" height="420" fill="{C["mint2"]}"/>{ole("po", 1.15, 540, 1580)}')
sc.add(js='tl.fromTo("#po-armR", {rotation: 0, transformOrigin: "50% 4%"}, {rotation: -160, transformOrigin: "50% 4%", duration: 0.4, ease: "back.out(1.6)"}, 0.5); tl.fromTo("#po-head", {rotation: 0, transformOrigin: "50% 100%"}, {rotation: -4, transformOrigin: "50% 100%", duration: 0.4, ease: "power2.out"}, 0.5);'
          'tl.fromTo("#punch-cam", {scale: 1.12, transformOrigin: "540px 1200px"}, {scale: 1, transformOrigin: "540px 1200px", duration: 0.6, ease: "expo.out"}, 0);')
sc.ole_life("po")
sc.words(word(25, "heil") - 0.35, s(26) - 0.02, 250, [("Du kommst", 96, NAVY), ("heil an.", 150, "#FFFFFF")], step=0.12)

# ================================================================ 14 end card
sc = Scene("endc", s(26), DUR, C["cream"]); S.append(sc)
sc.add(f'<rect y="1560" width="1080" height="360" fill="#EDE5D8"/>{ole("eo", 0.95, 540, 1600)}')
wave_t0 = 0.6
sc.add(js=f'tl.fromTo("#eo", {{y: 500}}, {{y: 0, duration: 0.6, ease: "expo.out"}}, 0.15); tl.fromTo("#eo-armR", {{rotation: 0, transformOrigin: "50% 4%"}}, {{rotation: -150, transformOrigin: "50% 4%", duration: 0.3, ease: "back.out(1.6)"}}, {wave_t0});'
          + "".join(f'tl.to("#eo-armR", {{rotation: {-125 if k % 2 == 0 else -165}, transformOrigin: "50% 4%", duration: 0.22, ease: "sine.inOut"}}, {wave_t0 + 0.3 + k * 0.22:.2f});' for k in range(8)))
sc.ole_life("eo")
letters = "Moment mal?!"
spans = "".join(f'<span id="end-c{k}" style="display:inline-block;color:{ORANGE if k >= 10 else NAVY}">{"&nbsp;" if ch == " " else html.escape(ch)}</span>' for k, ch in enumerate(letters))
click = s(27) + 0.75
sc.html.append(f'''<div id="end-all" class="clip full" data-start="0" data-duration="{sc.d}"><div class="full">
<div class="big" style="top:250px;font-size:128px">{spans}</div>
<div id="end-tag" class="big" style="top:410px;font-size:44px;font-weight:600;color:{NAVY};letter-spacing:0">Alltag. In 60 Sekunden erklärt.</div>
<div id="end-btn" style="position:absolute;left:290px;top:520px;width:500px;height:128px;border-radius:16px;background:{ORANGE};display:grid;place-items:center">
  <div id="end-b0" style="grid-area:1/1;font-weight:900;font-size:56px;color:#fff">Folgen</div>
  <div id="end-b1" style="grid-area:1/1;font-weight:900;font-size:56px;color:#fff;opacity:0;display:flex;align-items:center;gap:18px"><svg width="54" height="54" viewBox="0 0 54 54"><path id="end-chk" d="M8 28 L22 42 L46 12" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="70" style="stroke-dashoffset:70"/></svg>Gefolgt</div>
</div>
<div id="end-h" class="big" style="top:690px;font-size:44px;font-weight:800;color:{NAVY};letter-spacing:0">@momentmal.erklaert</div></div></div>''')
for k in range(len(letters)):
    sc.add(js=f'tl.fromTo("#end-c{k}", {{opacity: 0, filter: "blur(6px)", y: 30}}, {{opacity: 1, filter: "blur(0px)", y: 0, duration: 0.3, ease: "expo.out"}}, {0.05 + k * 0.045:.3f});')
sc.add(js=f'tl.fromTo("#end-tag", {{opacity: 0, filter: "blur(6px)"}}, {{opacity: 1, filter: "blur(0px)", duration: 0.2, ease: "power4.out"}}, 0.6); tl.fromTo("#end-btn", {{opacity: 0, y: 40}}, {{opacity: 1, y: 0, duration: 0.45, ease: "expo.out"}}, 0.8); tl.fromTo("#end-h", {{opacity: 0, filter: "blur(6px)"}}, {{opacity: 1, filter: "blur(0px)", duration: 0.2, ease: "power4.out"}}, 1.1);'
          f'tl.to("#end-btn", {{scale: 0.94, duration: 0.08, ease: "power2.in"}}, {sc.t(click) - 0.08}); tl.to("#end-btn", {{scale: 1, backgroundColor: "{MINTD}", duration: 0.35, ease: "back.out(2)"}}, {sc.t(click)});'
          f'tl.to("#end-b0", {{opacity: 0, duration: 0.1}}, {sc.t(click)}); tl.to("#end-b1", {{opacity: 1, duration: 0.12}}, {sc.t(click)}); tl.to("#end-chk", {{strokeDashoffset: 0, duration: 0.3, ease: "power3.out"}}, {sc.t(click) + 0.08});')

# ================================================================ write
os.makedirs(f"{PROJ}/compositions", exist_ok=True)
for f in os.listdir(f"{PROJ}/compositions"):
    if f.endswith(".html") and f != "captions.html": os.remove(f"{PROJ}/compositions/{f}")
for sc in S: open(f"{PROJ}/compositions/{sc.cid}.html", "w").write(sc.render())
for a_, b_ in zip(S, S[1:]): assert abs(a_.end - b_.start) < 1e-6, (a_.cid, b_.cid)
hosts = "\n".join(f'      <div id="{sc.cid}" data-composition-id="{sc.cid}" data-composition-src="compositions/{sc.cid}.html" data-start="{sc.start:.3f}" data-duration="{sc.d:.3f}" data-track-index="{1 + k % 2}" data-track-kind="graphics" data-width="{W}" data-height="{H}" style="z-index:{10 + k}"></div>' for k, sc in enumerate(S))
SFX = json.load(open(f"{PROJ}/sfx_cues.json"))
aud = [f'      <audio id="vo" class="clip" src="assets/audio/vo.wav" data-start="0" data-duration="{DUR}" data-track-index="10" data-volume="1"></audio>',
       f'      <audio id="bed" class="clip" src="assets/audio/bed.wav" data-start="0" data-duration="{DUR}" data-track-index="11" data-volume="1"></audio>']
for k, c in enumerate(SFX):
    extra = f' data-media-start="{c["mstart"]}"' if c.get("mstart") else ""
    aud.append(f'      <audio id="sfx{k}" class="clip" src="assets/sfx/{c["file"]}" data-start="{c["t"]:.3f}" data-duration="{c["dur"]}"{extra} data-track-index="{12 + k % 3}" data-volume="{c["vol"]}"></audio>')
open(f"{PROJ}/index.html", "w").write(f'''<!doctype html>
<html lang="de" data-resolution="portrait" data-composition-variables='[{{"id":"color-ink","type":"color","label":"Text","default":"{NAVY}"}},{{"id":"color-accent","type":"color","label":"Akzent","default":"{ORANGE}"}}]'>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width={W}, height={H}" />
    <script src="assets/lib/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ margin: 0; width: {W}px; height: {H}px; overflow: hidden; background: {C['cream']}; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{DUR}" data-width="{W}" data-height="{H}">
{hosts}
      <div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="{DUR}" data-track-index="5" data-track-kind="captions" data-width="{W}" data-height="{H}" style="z-index:50"></div>
{chr(10).join(aud)}
    </div>
    <script>
      window.__timelines["main"] = gsap.timeline({{ paused: true }});
    </script>
  </body>
</html>
''')
print("scenes", [(sc.cid, round(sc.start, 2), round(sc.end, 2)) for sc in S])
