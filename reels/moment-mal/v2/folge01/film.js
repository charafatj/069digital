// Moment mal?! Folge 1 – Warum sind Flugzeugfenster rund? Pure function of time (window.seek).
// Timing is in beats (u) on the 105 bpm grid; every shot is anchored to a VO sentence onset (B(i)).
// docs/shotlist.md is the plan this file follows.
import * as M from './lib/motion.js';
import * as G from './lib/gl.js';
import { loadOle, loadVoEnv, COL } from './sets/common.js';
import { cabinSet, skySet, tubeSet, panelSet, studioSet } from './sets/scenes.js';

const { THREE } = G;
const { W, H, FORMAT, E, prog, lerp, clamp, springU, SPRING, wobble, font, text, rrect, kf } = M;

// ---------------------------------------------------------------- brand
const C = { navy: '#13203F', navy2: '#1E2F5C', orange: '#FF6A3D', mint: '#2EE6B6', red: '#FF3B47', yellow: '#FFC94A', cream: '#FFF3E0', white: '#FFFFFF' };
const DISPLAY = 'Display', UI = 'UI';

// ---------------------------------------------------------------- voice timing (beats)
const VO = await (await fetch('vo_timing.json')).json();
const P = VO.period;
const B = (i) => VO.sentences[i].s / P;                // sentence onset in beats
const BE = (i) => VO.sentences[i].e / P;               // sentence end in beats
const WB = (i, w) => VO.sentences[i].words[w].s / P;  // word onset in beats
const lastWord = (i) => VO.sentences[i].words.length - 1;
const SPLIT = WB(6, lastWord(6));                     // "auseinander"
const TEAR = B(15) + 1.0;                              // "Bis das Metall nachgibt"

// ---------------------------------------------------------------- hits (picture + sound share one list)
const HITS = [
  [0, 'hook open', 'impact'],
  [0.5, 'title 1', 'pop', { pitch: 'A5' }], [1.0, 'title 2', 'pop', { pitch: 'C6' }], [1.5, 'title 3', 'pop', { pitch: 'E6' }],
  [B(1), 'stamp X', 'thud', { pitch: 120, to: 60 }],
  [B(2) - 0.5, 'through the window', 'whoosh', { len: 0.6 }],
  [B(2) + 2, 'dusk drone', 'swell', { len: 1.5 }],
  [B(3), '1954', 'impact'],
  [B(3) + 0.5, 'digit', 'tick'], [B(3) + 0.75, 'digit', 'tick'], [B(3) + 1.0, 'digit', 'tick'],
  [B(4) - 0.5, 'comet flyby', 'whoosh', { len: 0.9, from: 300, to: 1800 }],
  [B(4) + 1.5, 'comet card', 'pop', { pitch: 'G5' }],
  [B(5), 'hero angle', 'whoosh', { len: 0.5 }], [B(5) + 0.25, 'stamp pride', 'thud'],
  [B(6), 'dark sky', 'sub', { len: 1.2 }],
  [B(6) + 3.5, 'stat card', 'pop', { pitch: 'D5' }],
  [SPLIT, 'break-up', 'impact'], [SPLIT + 0.25, 'tear', 'crash', { len: 1.6 }],
  [B(7), 'macro', 'whoosh', { len: 0.4 }], [B(7) + 1.5, 'cause card', 'pop', { pitch: 'A5' }],
  [B(8), 'tube', 'whoosh', { len: 0.5 }], [B(8) + 1, 'pressure up', 'riser', { len: 1.6 }],
  [B(9), 'pressure down', 'swell', { len: 0.8 }],
  [B(10), 'cycles', 'tick'], [B(10) + 1, 'cycles', 'tick'], [B(10) + 1.5, 'cycles', 'tick'], [B(10) + 2, 'cycles', 'tick'], [B(10) + 2.25, 'cycles', 'tick'], [B(10) + 2.5, 'cycles', 'tick'],
  [B(11), 'panel', 'whoosh', { len: 0.5 }], [B(11) + 2, 'stress card', 'pop', { pitch: 'E5' }],
  [B(12), 'corner pulse', 'thud', { pitch: 90, to: 50 }], [B(12) + 2, 'corner pulse', 'thud', { pitch: 90, to: 50 }],
  [B(13), 'crack', 'click'], [B(13) + 0.25, 'crack', 'tick'],
  [B(14), 'crack grows', 'click'], [B(14) + 1, 'crack grows', 'click'], [B(14) + 2, 'crack grows', 'click'],
  [TEAR, 'metal gives', 'impact'],
  [B(16), 'round window', 'bell', { pitch: 'E6' }],
  [B(17), 'flow card', 'pop', { pitch: 'A5' }],
  [B(18) - 0.75, 'riser', 'riser', { len: 0.45 }], [B(18), 'Ole surprised', 'boing', { pitch: 'C5', to: 'G5' }],
  [B(19), 'to the window', 'whoosh', { len: 0.5 }],
  [B(20) + 0.5, 'hole ring', 'blip', { pitch: 'E6' }],
  [B(21), 'stamp ok', 'thud'],
  [B(22), 'panes fan out', 'whoosh', { len: 0.5, from: 2400, to: 900 }], [B(22) + 1.5, 'pane', 'click'], [B(22) + 1.75, 'pane', 'click'], [B(22) + 2, 'pane', 'click'],
  [B(23) + 1, 'fog clears', 'swell', { len: 0.8 }],
  [B(24), 'sunset', 'whoosh', { len: 0.8 }],
  [B(25), 'thumbs up', 'pop', { pitch: 'G5' }], [B(25) + 1.5, 'punchline', 'impact'],
  [B(26), 'end card', 'thud'], [B(26) + 0.5, 'logo', 'bell', { pitch: 'D6' }],
  [B(27) + 1.25, 'follow click', 'click'], [B(27) + 1.5, 'followed', 'bell', { pitch: 'A6' }],
];

// ---------------------------------------------------------------- shots (beats)
const SHOTS = [
  ['cabinHook', 0], ['jet', B(2)], ['comet', B(3)], ['wreck', B(7)], ['tube', B(8)], ['panel', B(11)],
  ['studioWow', B(18)], ['cabinMacro', B(19)], ['sunset', B(24)], ['studioThumbs', B(25)], ['end', B(26)],
];
const shotAt = (u) => { let s = SHOTS[0]; for (const x of SHOTS) if (u >= x[1]) s = x; return s; };

let CAB, SKY, TUBE, PAN, STU;

// ---------------------------------------------------------------- 2-D helpers
function card(ctx, u, u0, u1, label, value, color, y = 470) {
  const k = springU(u, u0, SPRING.bouncy), out = E.inBack(prog(u, u1 - 0.5, u1));
  if (k <= 0 || out >= 1) return;
  ctx.save();
  ctx.font = font(64, 900, DISPLAY); const w1 = ctx.measureText(value).width;
  ctx.font = font(30, 800, UI); const w0 = ctx.measureText(label).width;
  const w = Math.min(FORMAT.safe.w, Math.max(w0, w1) + 100), h = 172;
  const x = W / 2 + (1 - k) * -700 + out * 900, rot = (1 - k) * -0.12 + out * 0.1;
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.shadowColor = 'rgba(5,10,30,.45)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
  rrect(ctx, -w / 2, -h / 2, w, h, 34); ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowColor = 'transparent';
  rrect(ctx, -w / 2, -h / 2, 20, h, 10); ctx.fillStyle = color; ctx.fill();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = color === C.yellow ? '#B07A00' : color === C.mint ? '#0F9C79' : color; ctx.font = font(30, 800, UI); ctx.fillText(label, 10, -40);
  ctx.fillStyle = C.navy; ctx.font = font(64, 900, DISPLAY); ctx.fillText(value, 10, 26);
  ctx.restore();
}
function stamp(ctx, u, u0, u1, str, color, x, y, rot = -6) {
  if (u < u0 || u > u1) return;
  const p = E.outBack(prog(u, u0, u0 + 0.35), 2), s = lerp(2.2, 1, clamp(p)), out = prog(u, u1 - 0.3, u1);
  ctx.save(); ctx.globalAlpha = clamp(p * 2) * (1 - out); ctx.translate(x, y); ctx.rotate((rot * Math.PI) / 180); ctx.scale(s, s);
  ctx.font = font(80, 900, DISPLAY); const w = ctx.measureText(str).width + 70;
  ctx.lineWidth = 12; ctx.strokeStyle = color; rrect(ctx, -w / 2, -66, w, 132, 24); ctx.stroke();
  ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(str, 0, 5); ctx.restore();
}
function ring(ctx, x, y, u, a, color, r0 = 46) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.arc(x, y, r0, 0, Math.PI * 2); ctx.stroke();
  const k = (u * 0.5) % 1; ctx.globalAlpha = a * (1 - k); ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y, r0 + k * 80, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
}
function proj(cam, v) { cam.updateMatrixWorld(); const p = v.clone().project(cam); return { x: (p.x + 1) / 2 * W, y: (1 - p.y) / 2 * H }; }

// hook title: three lines, one word group per beat
function hookTitle(ctx, u) {
  const out = E.inBack(prog(u, B(1) - 0.5, B(1)));
  if (out >= 1) return;
  const lines = [['Warum sind', 0.25, 76, '#fff'], ['Flugzeugfenster', 0.75, 92, '#fff'], ['rund?', 1.25, 120, C.orange]];
  let y = 330;
  ctx.save(); ctx.translate(0, -out * 700);
  for (const [str, u0, size, col] of lines) {
    const k = springU(u, u0, SPRING.bouncy);
    if (k > 0) {
      ctx.save(); ctx.translate(W / 2, y + (1 - k) * 80); ctx.scale(k, k);
      ctx.font = font(size, 900, DISPLAY); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (col === C.orange) { const w = ctx.measureText(str).width + 70; rrect(ctx, -w / 2, -size * 0.66, w, size * 1.32, 30); ctx.fillStyle = C.orange; ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillText(str, 0, 6); }
      else { ctx.lineJoin = 'round'; ctx.lineWidth = 18; ctx.strokeStyle = C.navy; ctx.strokeText(str, 0, 0); ctx.fillStyle = col; ctx.fillText(str, 0, 0); }
      ctx.restore();
    }
    y += size * 1.12 + 10;
  }
  ctx.restore();
}
// "Niemals": a square window with a red X stamped over it
function squareX(ctx, u) {
  if (u < B(1) - 0.25 || u > B(2)) return;
  const k = springU(u, B(1) - 0.25, SPRING.bouncy), x = W * 0.5, y = 560;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate(-0.06);
  ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 30; rrect(ctx, -150, -150, 300, 300, 26); ctx.fillStyle = '#E9EEF5'; ctx.fill(); ctx.shadowColor = 'transparent';
  const g = ctx.createLinearGradient(0, -115, 0, 115); g.addColorStop(0, '#3d8bff'); g.addColorStop(1, '#d4ecff'); rrect(ctx, -115, -115, 230, 230, 6); ctx.fillStyle = g; ctx.fill();
  const xp = E.outCubic(prog(u, B(1), B(1) + 0.3)), xq = E.outCubic(prog(u, B(1) + 0.25, B(1) + 0.55));
  ctx.strokeStyle = C.red; ctx.lineWidth = 34; ctx.lineCap = 'round';
  if (xp > 0) { ctx.beginPath(); ctx.moveTo(-130, -130); ctx.lineTo(lerp(-130, 130, xp), lerp(-130, 130, xp)); ctx.stroke(); }
  if (xq > 0) { ctx.beginPath(); ctx.moveTo(130, -130); ctx.lineTo(lerp(130, -130, xq), lerp(-130, 130, xq)); ctx.stroke(); }
  ctx.restore();
}
function year1954(ctx, u) {
  const u0 = B(3), out = prog(u, B(4) - 0.6, B(4) - 0.1);
  if (u < u0 - 0.25 || out >= 1) return;
  const digits = '1954'.split(''), size = 300;
  ctx.save(); ctx.font = font(size, 900, DISPLAY); ctx.textBaseline = 'middle';
  const widths = digits.map((d) => ctx.measureText(d).width), total = widths.reduce((a, b) => a + b, 0);
  let x = W / 2 - total / 2;
  digits.forEach((d, i) => {
    const k = springU(u, u0 + i * 0.25 - 0.25, SPRING.bouncy);
    if (k > 0) {
      const y = 640 - (1 - k) * 260 - out * 400;
      for (let z = 14; z > 0; z--) { ctx.fillStyle = `rgba(92,58,24,${0.12 + 0.03 * (14 - z)})`; ctx.fillText(d, x + z * 1.6, y + z * 2.2); }
      ctx.fillStyle = C.cream; ctx.fillText(d, x, y);
    }
    x += widths[i];
  });
  ctx.restore();
}
function pressureGraph(ctx, u, p, n) {
  const a = E.outCubic(prog(u, B(8), B(8) + 0.75)) * (1 - prog(u, B(11) - 0.5, B(11)));
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * -60);
  const x0 = 150, x1 = 930, y0 = 600, y1 = 360;
  rrect(ctx, 110, 290, 860, 360, 34); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fill();
  ctx.font = font(30, 800, UI); ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.textAlign = 'left'; ctx.fillText('KABINENDRUCK', x0, 345);
  ctx.textAlign = 'right'; ctx.font = font(30, 800, UI); ctx.fillText(`ZYKLUS ${n.toLocaleString('de-DE')}`, x1, 345);
  ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
  // a trace of the last cycles, scrolling: pressure as a function of time
  ctx.strokeStyle = C.orange; ctx.lineWidth = 8; ctx.lineJoin = 'round'; ctx.beginPath();
  for (let i = 0; i <= 80; i++) { const uu = u - (80 - i) * 0.06; const pp = pressureAt(uu).p; const x = lerp(x0, x1, i / 80), y = lerp(y0, y1, pp); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x1, lerp(y0, y1, p), 16, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function pressureAt(u) {
  if (u < B(8)) return { p: 0, n: 1 };
  if (u < B(9)) return { p: E.inOutCubic(prog(u, B(8) + 0.5, BE(8))), n: 1 };
  if (u < B(10)) return { p: 1 - E.inOutCubic(prog(u, B(9), BE(9))), n: 1 };
  const k = (u - B(10)) * P; const ph = k * k * 1.6 + k * 0.9;
  return { p: 0.5 - 0.5 * Math.cos(ph * Math.PI * 2), n: 1 + Math.floor(ph + 0.5) * (1 + Math.floor(k * k * 6)) };
}

// panel: potential flow around the hole (square = superellipse), traced once
function traceField(kind) {
  const a = 0.8, b = kind === 'sq' ? 0.8 : 1.05, pw = kind === 'sq' ? 9 : 2;
  const psi = (x, y) => { const X = x / a, Y = y / b, r = Math.pow(Math.abs(X) ** pw + Math.abs(Y) ** pw, 1 / pw); return r < 1.0001 ? 0 : Y * (1 - 1 / (r * r)) * b; };
  const h = 1e-3, vel = (x, y) => [(psi(x, y + h) - psi(x, y - h)) / (2 * h), -(psi(x + h, y) - psi(x - h, y)) / (2 * h)];
  const lines = [];
  for (let y0 = -3.6; y0 <= 3.61; y0 += 0.34) {
    if (Math.abs(y0) < 0.15) continue;
    let x = -3.0, y = y0; const pts = [];
    for (let i = 0; i < 700 && x < 3.0; i++) {
      const [u1, v1] = vel(x, y), m = Math.hypot(u1, v1) || 1; pts.push([x, y, m * b]);
      const s = 0.025, mx = x + (u1 / m) * s * 0.5, my = y + (v1 / m) * s * 0.5; const [u2, v2] = vel(mx, my), m2 = Math.hypot(u2, v2) || 1;
      x += (u2 / m2) * s; y += (v2 / m2) * s;
    }
    lines.push(pts);
  }
  return lines;
}
const FLOW = { sq: traceField('sq'), rd: traceField('rd') };
const CRACK = (() => { const r = M.mulberry32(9), pts = [[0.8, 0.8]]; let x = 0.8, y = 0.8; for (let i = 0; i < 34; i++) { x += 0.08 + r() * 0.05; y += 0.075 + (r() - 0.4) * 0.12; pts.push([x, y]); } return pts; })();
function panelOverlay(ctx, u) {
  const cam = PAN.camera, round = u >= B(16) - 0.1;
  const pp = (x, y) => proj(cam, new THREE.Vector3(x, y, 0.16));
  const L = round ? FLOW.rd : FLOW.sq;
  const show = round ? E.outCubic(prog(u, B(16) + 0.25, B(17) + 0.5)) : E.outCubic(prog(u, B(11) + 0.25, B(11) + 3));
  const heat = round ? 0 : clamp(prog(u, B(11) + 2, B(12) + 1)) * (1 - prog(u, B(16) - 0.6, B(16) - 0.1));
  ctx.save(); ctx.lineCap = 'round';
  for (const ln of L) {
    const n = Math.floor(ln.length * show); if (n < 2) continue;
    const Pp = ln.slice(0, n).map(([x, y, m]) => ({ ...pp(x, y), m }));
    ctx.setLineDash([]); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,255,255,.16)';
    ctx.beginPath(); Pp.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.stroke();
    ctx.setLineDash([26, 34]); ctx.lineDashOffset = -u * 70; ctx.lineWidth = 6;
    for (let i = 1; i < Pp.length; i++) {
      const k = round ? 0 : clamp((Pp[i].m - 1.25) / 1.6) * heat;
      ctx.strokeStyle = k > 0.05 ? `rgb(255,${Math.round(lerp(236, 59, k))},${Math.round(lerp(226, 71, k))})` : round ? '#7CF5D6' : '#E8F1FF';
      ctx.beginPath(); ctx.moveTo(Pp[i - 1].x, Pp[i - 1].y); ctx.lineTo(Pp[i].x, Pp[i].y); ctx.stroke();
    }
  }
  ctx.restore();
  if (heat > 0) for (const [x, y] of [[0.8, 0.8], [-0.8, 0.8], [0.8, -0.8], [-0.8, -0.8]]) {
    const q = pp(x, y), pulse = M.bump(u % 2, 0.15, 0.6) * (u > B(12) ? 1 : 0.4), R = 60 + 70 * heat + 30 * pulse;
    const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, R); g.addColorStop(0, `rgba(255,59,71,${0.85 * heat})`); g.addColorStop(1, 'rgba(255,59,71,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(q.x, q.y, R, 0, Math.PI * 2); ctx.fill();
  }
  // crack: grows in steps on beats
  let cp = 0;
  if (!round && u >= B(13)) {
    if (u < B(14)) cp = 0.15 * E.outCubic(prog(u, B(13), B(13) + 0.5));
    else if (u < TEAR) { const step = Math.floor((u - B(14)) + 1e-6), f = E.outCubic(prog(u - B(14) - step, 0, 0.35)); cp = Math.min(0.62, 0.15 + (step + f) * 0.09); }
    else cp = lerp(0.62, 1, E.outExpo(prog(u, TEAR, TEAR + 0.5)));
  }
  if (cp > 0) {
    const n = Math.max(2, Math.round(CRACK.length * cp)), Q = CRACK.slice(0, n).map(([x, y]) => pp(x, y));
    ctx.save(); ctx.lineJoin = 'round'; ctx.shadowColor = C.red; ctx.shadowBlur = 26; ctx.strokeStyle = '#140a0e'; ctx.lineWidth = 8;
    ctx.beginPath(); Q.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.stroke(); ctx.restore();
  }
  if (!round) {
    card(ctx, u, B(11) + 2, B(13), 'SPANNUNG', u < B(12) ? 'kann nicht ausweichen' : 'staut sich an den Ecken', C.red, 430);
    if (u >= B(13)) { const flights = u < B(14) ? 1 : Math.round(1 + Math.pow(prog(u, B(14), TEAR), 1.7) * 1300); card(ctx, u, B(13), B(16), 'RISS WÄCHST', `Flug ${flights.toLocaleString('de-DE')}`, C.red, 430); }
  } else card(ctx, u, B(16) + 0.5, B(18), 'KEINE ECKEN', u < B(17) ? 'nichts staut sich' : 'Kraft fließt drumherum', C.mint, 430);
}

// captions: max 3 words / 18 chars, the spoken word in orange
const CHUNKS = [];
VO.sentences.forEach((s) => { let cur = []; s.words.forEach((w) => { cur.push(w); const len = cur.map((x) => x.w).join(' ').length; if (cur.length >= 3 || len > 15) { CHUNKS.push(cur); cur = []; } }); if (cur.length) CHUNKS.push(cur); });
function captions(ctx, t) {
  if (t > VO.sentences[26].s - 0.05) return;
  let ch = null; for (const c of CHUNKS) if (t >= c[0].s - 0.05 && t <= c.at(-1).e + 0.12) ch = c;
  if (!ch) return;
  ctx.save(); ctx.font = font(66, 900, DISPLAY); ctx.textBaseline = 'middle';
  const sp = 18, wd = ch.map((w) => ctx.measureText(w.w).width), tw = wd.reduce((a, b) => a + b, 0) + sp * (ch.length - 1);
  const y = 1390, k = E.outBack(prog(t, ch[0].s - 0.05, ch[0].s + 0.12), 1.6);
  ctx.translate(W / 2, y); ctx.scale(lerp(0.85, 1, k), lerp(0.85, 1, k));
  rrect(ctx, -tw / 2 - 36, -60, tw + 72, 120, 60); ctx.fillStyle = 'rgba(12,18,38,.9)'; ctx.fill();
  let x = -tw / 2;
  ch.forEach((w, i) => { const on = t >= w.s && t < w.e + 0.04; ctx.fillStyle = on ? C.orange : '#fff'; ctx.fillText(w.w, x, 4); x += wd[i] + sp; });
  ctx.restore();
}
function navyBg(ctx) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#22356A'); g.addColorStop(1, '#0B1226'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
function punchline(ctx, u) {
  const u0 = B(25) + 1.5;
  const words = [['Du kommst', 0, '#fff', 104], ['heil an.', 0.5, C.orange, 132]];
  let y = 430;
  for (const [s, d, col, size] of words) {
    const k = springU(u, u0 + d, SPRING.bouncy);
    if (k > 0) {
      ctx.save(); ctx.translate(W / 2, y + (1 - k) * 90); ctx.scale(k, k); ctx.font = font(size, 900, DISPLAY); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (col === C.orange) { const w = ctx.measureText(s).width + 80; rrect(ctx, -w / 2, -size * 0.66, w, size * 1.32, 32); ctx.fillStyle = C.orange; ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillText(s, 0, 8); }
      else { ctx.fillStyle = col; ctx.fillText(s, 0, 0); }
      ctx.restore();
    }
    y += size * 1.3;
  }
}
function endCard(ctx, u) {
  const u0 = B(26), s = FORMAT.safe;
  ctx.save(); ctx.font = font(124, 900, DISPLAY); ctx.textBaseline = 'alphabetic';
  const L = 'Moment mal?!'.split(''); const wd = L.map((c) => ctx.measureText(c).width); const tw = wd.reduce((a, b) => a + b, 0);
  let x = W / 2 - tw / 2;
  L.forEach((c, i) => { const k = springU(u, u0 + i * 0.06, SPRING.bouncy); if (k > 0) M.glyph(ctx, c, x + wd[i] / 2, 420 + (1 - k) * 120, font(124, 900, DISPLAY), i >= 10 ? C.orange : '#fff', k, k); x += wd[i]; });
  ctx.restore();
  const tk = E.outCubic(prog(u, u0 + 0.75, u0 + 1.25));
  if (tk > 0) { ctx.save(); ctx.globalAlpha = tk; text(ctx, 'Alltag. In 60 Sekunden erklärt.', W / 2, 500 + (1 - tk) * 30, font(42, 600, UI), 'rgba(255,255,255,.82)', 'center'); ctx.restore(); }
  const bk = springU(u, u0 + 1.25, SPRING.bouncy); if (bk <= 0) return;
  const done = u >= B(27) + 1.5, press = M.bump(u, B(27) + 1.35, 0.25);
  ctx.save(); ctx.translate(W / 2, 640); const sc = bk * (1 - 0.08 * press); ctx.scale(sc, sc);
  rrect(ctx, -250, -72, 500, 144, 72); ctx.fillStyle = done ? C.mint : C.orange; ctx.fill();
  ctx.fillStyle = done ? C.navy : '#fff'; ctx.font = font(60, 900, DISPLAY); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (done) {
    ctx.fillText('Gefolgt', 34, 4); ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = C.navy;
    const ck = E.outCubic(prog(u, B(27) + 1.5, B(27) + 1.9)); ctx.beginPath(); ctx.moveTo(-160, 2); ctx.lineTo(lerp(-160, -134, clamp(ck * 2)), lerp(2, 28, clamp(ck * 2))); if (ck > 0.5) ctx.lineTo(lerp(-134, -92, (ck - 0.5) * 2), lerp(28, -26, (ck - 0.5) * 2)); ctx.stroke();
  } else ctx.fillText('Folgen', 0, 4);
  ctx.restore();
  const hk = E.outCubic(prog(u, u0 + 1.75, u0 + 2.25));
  if (hk > 0) { ctx.save(); ctx.globalAlpha = hk; text(ctx, '@momentmal.erklaert', W / 2, 785, font(44, 800, UI), '#fff', 'center'); ctx.restore(); }
}

// ---------------------------------------------------------------- draw
function draw(ctx, u, t) {
  const [name, u0] = shotAt(u);
  const since = u - u0;
  if (name === 'cabinHook') {
    const p = E.inOutCubic(prog(u, 0, B(2)));
    const look = E.inOutCubic(prog(u, 0.4, 1.4)) - E.inOutCubic(prog(u, 3.2, 4.2));
    const no = u >= B(1) && u < B(2) ? Math.sin((u - B(1)) * Math.PI * 2.4) * 0.35 * (1 - prog(u, B(1), B(2))) : 0;
    G.renderSet(ctx, CAB, t, u, {
      cam: [lerpA([5.8, 3.5, 7.0], [4.6, 3.25, 5.6], p), lerpA([-0.05, 2.5, 0.35], [0.05, 2.45, 0.4], p), 38],
      pose: { yaw: lerp(-0.25, 1.15, look) + no, pitch: 0.05 },
    });
    hookTitle(ctx, u); squareX(ctx, u);
  } else if (name === 'jet') {
    const p = prog(u, B(2), B(3));
    G.renderSet(ctx, SKY, t, u, { mode: 'jet', dusk: E.inOutCubic(prog(u, B(2) + 1, B(3) - 0.5)), cam: [lerpA([20, 3, 22], [12, 1, 17], E.inOutSine(p)), [lerp(1, -1, p), 0, 0], 36] });
  } else if (name === 'comet') {
    const sep = 1 - E.inOutCubic(prog(u, B(6), B(6) + 3));
    const dark = E.inOutCubic(prog(u, B(6), B(6) + 3));
    const split = u >= SPLIT ? (u - SPLIT) * P : -1;
    let cam;
    if (u < B(4)) cam = [lerpA([22, 3, 26], [17, 2, 22], prog(u, B(3), B(4))), [0, -2, 0], 36];
    else if (u < B(5)) cam = [lerpA([26, 2.5, 14], [14, 1, 16], E.inOutSine(prog(u, B(4), B(5)))), [lerp(2, -1, prog(u, B(4), B(5))), 0, 0], 36];
    else if (u < B(6)) cam = [lerpA([9, -7, 15], [5, -6, 15], E.inOutSine(prog(u, B(5), B(6)))), [0, 0.5, 0], 36];
    else cam = [lerpA([8, 2, 26], [4, 0.5, 21], E.inOutSine(prog(u, B(6), B(7)))), [-0.6, -0.8, 0], 36];
    const sh = u >= SPLIT ? Math.exp(-(u - SPLIT) * 1.4) * 0.35 : 0;
    cam[0] = cam[0].map((v, i) => v + sh * M.noise1(u * 9 + i * 11, 3));
    G.renderSet(ctx, SKY, t, u, { mode: 'comet', sepia: sep, dark, split, cam });
    year1954(ctx, u);
    card(ctx, u, B(4) + 1.5, B(6), 'DE HAVILLAND COMET', 'erster Düsen-Passagierjet', C.yellow, 470);
    stamp(ctx, u, B(5) + 0.25, B(6), 'STOLZ DER LUFTFAHRT', C.yellow, W / 2, 1120, -4);
    card(ctx, u, B(6) + 3.5, B(7), '1954', '2 Comets · 3 Monate', C.red, 470);
    if (u >= SPLIT) { const f = Math.exp(-(u - SPLIT) * 2.2); ctx.fillStyle = `rgba(255,40,60,${0.16 * f})`; ctx.fillRect(0, 0, W, H); }
  } else if (name === 'wreck') {
    SKY.update(t, u, { mode: 'comet', dark: 1, split: 30, cam: [[0, 0, 20], [0, 0, 0], 36] });
    SKY.comet.front.updateWorldMatrix(true, false); const wp = new THREE.Vector3(0.95, 0.3, 1.0).applyMatrix4(SKY.comet.front.matrixWorld);
    const p = E.outCubic(prog(u, B(7), B(7) + 1.5));
    const d = 22 * (3.2 / 22) ** p; // log-space dolly
    G.renderSet(ctx, SKY, t, u, { mode: 'comet', dark: 1, split: 30, cam: [[wp.x + d * 0.3, wp.y + d * 0.12, wp.z + d], wp.toArray(), 36] });
    const k = springU(u, B(7) + 0.5, SPRING.bouncy);
    if (k > 0) { ctx.save(); ctx.translate(W / 2, H * 0.5); ctx.scale(k, k); ctx.lineWidth = 26; ctx.strokeStyle = C.navy; ctx.beginPath(); ctx.arc(0, 0, 240, 0, Math.PI * 2); ctx.stroke(); ctx.lineWidth = 10; ctx.strokeStyle = C.orange; ctx.beginPath(); ctx.arc(0, 0, 222, 0, Math.PI * 2); ctx.stroke(); ctx.lineCap = 'round'; ctx.lineWidth = 52; ctx.strokeStyle = C.navy; ctx.beginPath(); ctx.moveTo(176, 176); ctx.lineTo(330, 330); ctx.stroke(); ctx.restore(); }
    if (k > 0) {
      ctx.save(); ctx.translate(W / 2, H * 0.5); ctx.scale(k, k); ctx.beginPath(); ctx.arc(0, 0, 212, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = '#D9DEE6'; ctx.fillRect(-220, -220, 440, 440);
      rrect(ctx, -105, -105, 210, 210, 10); ctx.fillStyle = '#1B2540'; ctx.fill();
      const cr = E.outCubic(prog(u, B(7) + 1, B(7) + 2));
      ctx.strokeStyle = '#140a0e'; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.shadowColor = C.red; ctx.shadowBlur = 20; ctx.beginPath(); ctx.moveTo(105, -105);
      [[130, -128], [146, -122], [168, -150], [190, -158], [215, -190]].forEach(([x, y], i) => { if (i / 5 < cr) ctx.lineTo(x, y); }); ctx.stroke();
      ctx.shadowBlur = 0; const g = ctx.createRadialGradient(105, -105, 0, 105, -105, 90); g.addColorStop(0, `rgba(255,59,71,${0.7 * cr})`); g.addColorStop(1, 'rgba(255,59,71,0)'); ctx.fillStyle = g; ctx.fillRect(0, -220, 220, 220);
      ctx.restore();
      ctx.save(); ctx.translate(W / 2, H * 0.5); ctx.scale(k, k); ctx.lineWidth = 26; ctx.strokeStyle = C.navy; ctx.beginPath(); ctx.arc(0, 0, 240, 0, Math.PI * 2); ctx.stroke(); ctx.lineWidth = 10; ctx.strokeStyle = C.orange; ctx.beginPath(); ctx.arc(0, 0, 222, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    card(ctx, u, B(7) + 1.5, B(8), 'URSACHE', 'Metallermüdung', C.orange, 470);
  } else if (name === 'tube') {
    const { p, n } = pressureAt(u);
    const cp = E.inOutCubic(prog(u, B(8), B(8) + 3));
    G.renderSet(ctx, TUBE, t, u, { p, cam: [lerpA([3.5, 2.6, 10.5], [2.4, 1.6, 8.2], cp), [0.1, -0.15, 0], 34] });
    pressureGraph(ctx, u, p, n);
    card(ctx, u, B(8) + 1.5, B(11), u < B(9) ? 'START' : u < B(10) ? 'LANDUNG' : 'IMMER WIEDER', u < B(9) ? 'Kabine wird aufgepumpt' : u < B(10) ? 'Druck wieder raus' : 'aufpumpen · entleeren', p > 0.5 ? C.orange : C.mint, 1120);
  } else if (name === 'panel') {
    const round = u >= B(16) - 0.1;
    const shake = u >= TEAR && !round ? Math.exp(-(u - TEAR) * 2.5) * 0.12 : 0;
    const sx = shake * M.noise1(u * 14, 1), sy = shake * M.noise1(u * 14, 2);
    const push = round ? 1 : E.inOutCubic(prog(u, B(12) + 2, B(13) + 0.5));
    const ctr = lerpA([0, 0.1, 0], [0.55, 0.6, 0], push * (round ? 0 : 1));
    const dist = lerp(10.5, 7.2, round ? 0 : push);
    G.renderSet(ctx, PAN, t, u, { round, pop: round ? lerp(0.85, 1, E.outBack(prog(u, B(16) - 0.1, B(16) + 0.4), 2)) : 1, cam: [[ctr[0] + 1.0 + Math.sin(u * 0.15) * 0.3 + sx, ctr[1] + 0.4 + sy, dist], [ctr[0] + sx * 0.5, ctr[1] + sy * 0.5, 0], 36] });
    panelOverlay(ctx, u);
    if (u >= TEAR && u < TEAR + 1.5) { const f = Math.exp(-(u - TEAR) * 3); ctx.fillStyle = `rgba(255,255,255,${0.75 * f})`; ctx.fillRect(0, 0, W, H); ctx.fillStyle = `rgba(255,30,50,${0.3 * f})`; ctx.fillRect(0, 0, W, H); }
  } else if (name === 'studioWow') {
    navyBg(ctx);
    const jt = (u - B(18)) * P; const z = E.outExpo(prog(u, B(18), B(18) + 0.6));
    G.renderSet(ctx, STU, t, u, { layers: [['Jump', clamp(jt * 1.1, 0, 0.7), 1]], morph: { Surprised: 1 }, yaw: 0.15, cam: [[0.4, lerp(2.4, 2.9, z), lerp(13, 8.2, z)], [0, 2.1, 0], 30] });
    stamp(ctx, u, B(18) + 0.25, B(19), 'ACHTUNG!', C.orange, W / 2, 470, -5);
  } else if (name === 'cabinMacro') {
    const u1 = B(22);
    let cam;
    if (u < B(20)) { const p = E.inOutCubic(prog(u, B(19), B(20))); cam = [lerpA([4.6, 3.25, 5.6], [2.2, 3.1, 3.3], p), lerpA([0.05, 2.45, 0.4], [0.0, 2.55, 0.2], p), 38]; }
    else if (u < u1) { const p = E.outCubic(prog(u, B(20), B(20) + 1.5)); const d = 3.4 * (1.7 / 3.4) ** p; cam = [[-0.1 * d / 3.4 - 0.05, 2.12 + 0.18 * d / 3.4, d], [0, 2.1, 0], 38]; }
    else { const p = E.inOutCubic(prog(u, u1, u1 + 2)); cam = [lerpA([-0.06, 2.14, 1.7], [-1.4, 2.9, 7.6], p), lerpA([0, 2.1, 0], [-0.55, 2.55, 0.8], p), 38]; }
    const ex = u < u1 ? 0 : E.outBack(prog(u, u1, u1 + 2.2), 1.2);
    const glow = E.inOutCubic(prog(u, u1 + 2.5, u1 + 3.5));
    const fogA = u < B(23) ? 0.6 * clamp(ex) : 0.6 * (1 - E.inOutCubic(prog(u, B(23) + 1, B(23) + 3)));
    G.renderSet(ctx, CAB, t, u, { cam, explode: clamp(ex, 0, 1.08), glow, fogA, hideOle: u >= B(20), pose: { yaw: 1.15, pitch: 0.1 } });
    if (u >= B(20) && u < u1) {
      CAB.pMid.updateWorldMatrix(true, false); const hp = proj(CAB.camera, new THREE.Vector3(0, -0.5, 0).applyMatrix4(CAB.pMid.matrixWorld));
      ring(ctx, hp.x, hp.y, u, E.outCubic(prog(u, B(20) + 0.5, B(20) + 1)), C.orange, 54);
      card(ctx, u, B(20) + 1, u1, 'WINZIG, ABER WICHTIG', 'Entlüftungsloch', C.orange, 470);
      stamp(ctx, u, B(21), u1, 'KEIN FEHLER', C.mint, W / 2, 1120, -5);
    }
    if (u >= u1) {
      const tags = [[CAB.pOut, 'AUSSEN', glow > 0.3 ? C.orange : C.navy], [CAB.pMid, 'MITTE', C.navy], [CAB.pIn, 'INNEN', u > B(23) ? C.mint : C.navy]];
      const a = E.outCubic(prog(u, u1 + 1.5, u1 + 2));
      for (const [pn, s, col] of tags) {
        pn.updateWorldMatrix(true, false); const q = proj(CAB.camera, new THREE.Vector3(0, 0.82, 0).applyMatrix4(pn.matrixWorld));
        if (a > 0) { ctx.save(); ctx.globalAlpha = a; ctx.font = font(38, 900, UI); const w = ctx.measureText(s).width + 44; rrect(ctx, q.x - w / 2, q.y - 32, w, 64, 32); ctx.fillStyle = col; ctx.fill(); ctx.fillStyle = col === C.mint ? C.navy : '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, q.x, q.y + 2); ctx.restore(); }
      }
      card(ctx, u, u1 + 2.5, B(23), 'DEN DRUCK TRÄGT', 'die äußere Scheibe', C.orange, 1130);
      card(ctx, u, B(23) + 0.75, B(24), 'DIE INNERE', 'beschlägt nicht', C.mint, 1130);
    }
  } else if (name === 'sunset') {
    const p = prog(u, B(24), B(25));
    G.renderSet(ctx, SKY, t, u, { mode: 'jet', sunset: 1, winGlow: E.outCubic(prog(u, B(24) + 0.5, B(24) + 1.5)), cam: [lerpA([-16, 3, 20], [-10, 1.5, 17], E.inOutSine(p)), [0, -0.3, 0], 36] });
    card(ctx, u, B(24) + 1, B(25), 'RUND STATT ECKIG', 'kein Design', C.orange, 470);
  } else if (name === 'studioThumbs') {
    navyBg(ctx);
    const tt = (u - B(25)) * P;
    G.renderSet(ctx, STU, t, u, { layers: [['ThumbsUp', clamp(tt, 0, 0.8), 1]], yaw: 0.1, cam: [[0.3, 2.2, 10.5], [0, 1.6, 0], 30] });
    punchline(ctx, u);
  } else { // end card
    navyBg(ctx);
    const tt = (u - B(26)) * P;
    const enter = springU(u, B(26), SPRING.gentle);
    G.renderSet(ctx, STU, t, u, { layers: [['Wave', (tt % 1.83), 1]], yaw: 0.1, y: lerp(-1.5, 0, enter), cam: [[0, 2.4, 11], [0, 2.4, 0], 30] });
    endCard(ctx, u);
  }
  captions(ctx, t);
}
const lerpA = (a, b, k) => a.map((x, i) => lerp(x, b[i], k));

M.film({
  fonts: [font(100, 900, DISPLAY), font(40, 600, UI), font(40, 800, UI)],
  hits: HITS,
  // motion blur where things move fast (fly-bys, dollies, pressure cycles); single sample elsewhere keeps the CPU render affordable
  samples: (t) => { const u = M.U(t), [n] = shotAt(u); return ['jet', 'comet', 'wreck', 'sunset', 'studioWow'].includes(n) || (n === 'tube' && u > B(10)) ? 2 : 1; },
  async init() {
    await G.initGL({});
    await loadOle(); await loadVoEnv();
    CAB = cabinSet(); SKY = skySet(); TUBE = tubeSet(); PAN = panelSet(); STU = studioSet();
  },
  draw,
  post(ctx, u, t) {
    // film grain only on the 1954 sepia section
    const [name] = shotAt(u);
    if (name !== 'comet' || u > B(6) + 2) return;
    const r = M.mulberry32(Math.floor(t * 30) + 1); ctx.save(); ctx.globalAlpha = 0.07;
    for (let i = 0; i < 1400; i++) { ctx.fillStyle = r() > 0.5 ? '#000' : '#fff'; ctx.fillRect(r() * W, r() * H, 2, 2); }
    ctx.restore();
  },
});
