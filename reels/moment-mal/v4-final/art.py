# Flat vector art for Moment mal?! (2-D). Every builder returns SVG markup; ids are prefixed so scenes can animate parts.
import math

C = dict(
    navy="#13203F", navy2="#24365F", orange="#FF6A3D", orange2="#E2552B", orange3="#FF8A63",
    mint="#2EE6B6", mint2="#1FB892", cream="#F6F1E8", sand="#F3E3C6", sand2="#E9D2A8",
    sky="#9CCBFF", sky2="#CFE6FF", sky3="#EAF4FF", white="#FFFFFF", grey="#DDE3EC", grey2="#C3CCD9", grey3="#A9B4C4",
    red="#E8333F", dusk="#3D4677", dusk2="#6E6F9E", sun="#FFB28A", sun2="#FFE0C2",
)

def ole(p, scale=1.0, x=0, y=0, mouth=True):
    """Ole, front view, ~660 units tall. Origin = between the feet.
    Parts: {p}-body, {p}-head (pivot at the neck), {p}-eyes, {p}-browL/R, {p}-armL/R (pivot at the shoulder), {p}-mouth."""
    c = C
    return f'''<g id="{p}"><g transform="translate({x} {y}) scale({scale})">
  <ellipse cx="0" cy="4" rx="150" ry="18" fill="{c['navy']}" opacity=".13"/>
  <g id="{p}-body">
    <rect x="-66" y="-118" width="44" height="100" rx="20" fill="{c['orange2']}"/><rect x="22" y="-118" width="44" height="100" rx="20" fill="{c['orange2']}"/>
    <rect x="-96" y="-34" width="80" height="36" rx="16" fill="{c['mint']}"/><rect x="16" y="-34" width="80" height="36" rx="16" fill="{c['mint']}"/>
    <g transform="translate(-104 -280)"><g id="{p}-armL"><rect x="-24" y="-10" width="46" height="150" rx="23" fill="{c['orange2']}"/><circle cx="-1" cy="146" r="30" fill="{c['mint']}"/></g></g>
    <g transform="translate(104 -280)"><g id="{p}-armR"><rect x="-22" y="-10" width="46" height="150" rx="23" fill="{c['orange2']}"/><circle cx="1" cy="146" r="30" fill="{c['mint']}"/></g></g>
    <rect x="-100" y="-306" width="200" height="200" rx="54" fill="{c['orange']}"/>
    <path d="M40 -306 L46 -306 Q100 -306 100 -252 L100 -160 Q100 -106 46 -106 L40 -106 Z" fill="{c['orange2']}" opacity=".45"/>
    <rect x="-100" y="-168" width="200" height="24" fill="{c['mint']}"/>
    <rect x="-30" y="-338" width="60" height="40" rx="12" fill="{c['mint2']}"/>
  </g>
  <g transform="translate(0 -330)"><g id="{p}-head">
    <path d="M-200 -90 Q-200 -330 0 -330 Q200 -330 200 -90 L200 -50 Q200 0 150 0 L-150 0 Q-200 0 -200 -50 Z" fill="{c['orange']}"/>
    <path d="M70 -318 Q200 -280 200 -90 L200 -50 Q200 0 150 0 L70 0 Z" fill="{c['orange2']}" opacity=".4"/>
    <rect x="-204" y="-262" width="408" height="28" rx="14" fill="{c['mint']}"/>
    <rect x="-202" y="-34" width="404" height="36" rx="18" fill="{c['mint2']}"/>
    <g id="{p}-brows"><rect id="{p}-browL" x="-150" y="-212" width="112" height="22" rx="11" fill="{c['navy']}"/><rect id="{p}-browR" x="38" y="-212" width="112" height="22" rx="11" fill="{c['navy']}"/></g>
    <g id="{p}-eyes"><circle cx="-82" cy="-128" r="60" fill="{c['navy']}"/><circle cx="82" cy="-128" r="60" fill="{c['navy']}"/>
      <circle cx="-100" cy="-152" r="18" fill="#fff"/><circle cx="64" cy="-152" r="18" fill="#fff"/><circle cx="-64" cy="-108" r="7" fill="#fff" opacity=".7"/><circle cx="100" cy="-108" r="7" fill="#fff" opacity=".7"/></g>
    {'<rect id="'+p+'-mouth" x="-30" y="-62" width="60" height="14" rx="7" fill="'+c['navy']+'"/>' if mouth else ''}
  </g></g>
</g></g>'''

def cloud(cx, cy, s=1.0, fill="#FFFFFF", op=1.0, idp=""):
    circles = [(-60, 10, 42), (-20, -18, 56), (34, -8, 48), (72, 14, 36), (0, 20, 44)]
    body = "".join(f'<circle cx="{cx + dx * s:.1f}" cy="{cy + dy * s:.1f}" r="{r * s:.1f}"/>' for dx, dy, r in circles)
    base = f'<rect x="{cx - 100 * s:.1f}" y="{cy + 10 * s:.1f}" width="{200 * s:.1f}" height="{40 * s:.1f}" rx="{20 * s:.1f}"/>'
    i = f' id="{idp}"' if idp else ""
    return f'<g{i} fill="{fill}" opacity="{op}">{body}{base}</g>'

def plane(p, comet=False, body=None, accent=None):
    """Side view, nose right, 1000 x 300 box. Parts: {p}-front, {p}-rear (split behind the wing), {p}-win."""
    c = C
    body = body or ("#EEF1F5" if comet else c["white"])
    shade = "#D6DDE6" if comet else "#E4EAF2"
    acc = accent or ("#2C5AA0" if comet else c["orange"])
    split = 470
    fus = "M70 150 Q70 112 130 108 L800 102 Q905 102 962 142 Q978 156 958 170 Q930 188 860 190 L150 192 Q86 192 70 172 Z"
    belly = "M70 160 L962 160 Q950 176 900 184 Q880 190 860 190 L150 192 Q86 192 70 172 Z"
    wins = []
    for k in range(24 if not comet else 15):
        x = 190 + k * (25 if not comet else 40)
        if x > 790: break
        if comet: wins.append(f'<rect x="{x - 9}" y="{122}" width="18" height="18" rx="2" fill="{c["navy"]}"/>')
        else: wins.append(f'<rect x="{x - 6}" y="{120}" width="12" height="20" rx="6" fill="{c["navy"]}"/>')
    front_w = "".join(w for w in wins if float(w.split('x="')[1].split('"')[0]) > split)
    rear_w = "".join(w for w in wins if float(w.split('x="')[1].split('"')[0]) <= split)
    engines = "" if comet else f'''<rect x="420" y="196" width="150" height="50" rx="25" fill="{c['grey']}"/><rect x="420" y="196" width="150" height="20" rx="10" fill="#fff" opacity=".6"/><ellipse cx="568" cy="221" rx="10" ry="22" fill="{c['navy2']}"/>'''
    fin = f'<path d="M120 110 L64 18 L132 18 L214 108 Z" fill="{acc if not comet else body}"/>' + (f'<rect x="78" y="44" width="80" height="12" fill="{acc}" transform="skewX(-30)"/>' if comet else f'<text x="112" y="88" font-family="MM" font-weight="900" font-size="52" fill="#fff" transform="skewX(-14)">?!</text>')
    return f'''<g id="{p}">
  <g id="{p}-rear">
    {fin}
    <path d="M86 156 L18 186 L128 182 Z" fill="{c['grey2']}"/>
    <clipPath id="{p}-cr"><rect x="0" y="0" width="{split}" height="300"/></clipPath>
    <g clip-path="url(#{p}-cr)"><path d="{fus}" fill="{body}"/><path d="{belly}" fill="{shade}"/><rect x="140" y="148" width="770" height="7" fill="{acc}"/>{'' if comet else f'<rect x="140" y="155" width="770" height="5" fill="{c["navy"]}"/>'}</g>
    {rear_w}
  </g>
  <g id="{p}-front">
    <path d="M440 178 L350 262 L420 266 L590 180 Z" fill="{c['grey2']}"/>
    <clipPath id="{p}-cf"><rect x="{split}" y="0" width="600" height="300"/></clipPath>
    <g clip-path="url(#{p}-cf)"><path d="{fus}" fill="{body}"/><path d="{belly}" fill="{shade}"/><rect x="140" y="148" width="770" height="7" fill="{acc}"/>{'' if comet else f'<rect x="140" y="155" width="770" height="5" fill="{c["navy"]}"/>'}</g>
    {front_w}
    <path d="M905 122 Q935 126 952 142 L922 142 Q912 130 905 122 Z" fill="{c['navy']}"/>
    {engines}
    <path d="M470 172 L560 172 L620 300 L560 300 Z" fill="none"/>
  </g>
</g>'''

def flow_paths(kind, cx, cy, sc, y_lines):
    """Streamlines of potential flow around the window (square = superellipse), in screen coordinates."""
    a, b, pw = (0.8, 0.8, 9) if kind == "sq" else (0.8, 1.05, 2)
    def psi(x, y):
        X, Y = x / a, y / b
        r = (abs(X) ** pw + abs(Y) ** pw) ** (1 / pw)
        return 0 if r < 1.0001 else Y * (1 - 1 / (r * r)) * b
    def vel(x, y):
        h = 1e-3
        return (psi(x, y + h) - psi(x, y - h)) / (2 * h), -(psi(x + h, y) - psi(x - h, y)) / (2 * h)
    out = []
    for y0 in y_lines:
        x, y, pts = -3.2, y0, []
        for _ in range(900):
            if x > 3.2: break
            u, v = vel(x, y); m = math.hypot(u, v) or 1
            pts.append((x, y, m * b))
            st = 0.02; mx, my = x + u / m * st / 2, y + v / m * st / 2
            u2, v2 = vel(mx, my); m2 = math.hypot(u2, v2) or 1
            x += u2 / m2 * st; y += v2 / m2 * st
        d = "M" + " L".join(f"{cx + px * sc:.1f} {cy - py * sc:.1f}" for px, py, _ in pts[::2])
        hot = max(m for _, _, m in pts)
        out.append((d, hot))
    return out
