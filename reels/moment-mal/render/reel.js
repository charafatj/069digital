import * as THREE from 'three';

const W = 1080, H = 1920, FPS = 30;
const T = await (await fetch('timing.json')).json();
const ENV = await (await fetch('env.json')).json();
const S = T.sentences;
const st = i => S[i].s, en = i => S[i].e;
const DUR = T.duration;

// ---------- brand ----------
const C = {
  navy: 0x13203f, navy2: 0x1e2f5c, orange: 0xff6a3d, orangeD: 0xd94e25,
  mint: 0x2ee6b6, mintD: 0x1fb892, cream: 0xfff3e0, skin: 0xf4c7a1, skinD: 0xe0a982,
  red: 0xff3b47, yellow: 0xffc94a, white: 0xf4f6fa, grey: 0xb8c2d6, dark: 0x2a2f3a, hair: 0x5a3a26,
};
const CSS = { navy: '#13203F', orange: '#FF6A3D', mint: '#2EE6B6', cream: '#FFF3E0', red: '#FF3B47', yellow: '#FFC94A' };

// ---------- helpers ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eo = t => 1 - Math.pow(1 - t, 3);
const back = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const prog = (t, a, b) => clamp((t - a) / (b - a));
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const lerpV = (a, b, t) => a.clone().lerp(b, t);
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: .78, metalness: 0, ...o });
const mesh = (g, m, p) => { const x = new THREE.Mesh(g, m); if (p) x.position.set(...p); return x; };

function rrPath(P, w, h, r, cx = 0, cy = 0) {
  const x = cx - w / 2, y = cy - h / 2; r = Math.min(r, w / 2, h / 2);
  P.moveTo(x + r, y); P.lineTo(x + w - r, y); P.quadraticCurveTo(x + w, y, x + w, y + r);
  P.lineTo(x + w, y + h - r); P.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  P.lineTo(x + r, y + h); P.quadraticCurveTo(x, y + h, x, y + h - r);
  P.lineTo(x, y + r); P.quadraticCurveTo(x, y, x + r, y); return P;
}
const rrShape = (w, h, r) => rrPath(new THREE.Shape(), w, h, r);

function gradTex(stops) {
  const c = document.createElement('canvas'); c.width = 4; c.height = 512;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  tex.set = (s) => {
    const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 512);
    s.forEach(([o, col]) => gr.addColorStop(o, col)); g.fillStyle = gr; g.fillRect(0, 0, 4, 512); tex.needsUpdate = true;
  };
  tex.set(stops); return tex;
}
const mixHex = (a, b, t) => {
  const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], t)).toString(16).padStart(2, '0')).join('');
};

// ---------- renderer ----------
const gl = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
gl.setPixelRatio(1); gl.setSize(W, H, false);
gl.outputColorSpace = THREE.SRGBColorSpace;
const out = document.getElementById('out'); const ctx = out.getContext('2d');
const cam = new THREE.PerspectiveCamera(40, W / H, 0.1, 400);

function lights(scene, k = 1, warm = 0xffffff) {
  scene.add(new THREE.HemisphereLight(0xffffff, 0x50608a, 1.6 * k));
  const d = new THREE.DirectionalLight(warm, 2.4 * k); d.position.set(6, 10, 8); scene.add(d);
  const f = new THREE.DirectionalLight(0xbfd4ff, 0.7 * k); f.position.set(-8, 2, 4); scene.add(f);
  return d;
}

// ---------- character: Ole ----------
function makeOle() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(.5, .72, 1.1, 9), M(C.mint), [0, .55, 0]));
  const hood = mesh(new THREE.TorusGeometry(.4, .14, 6, 10), M(C.mintD), [0, 1.08, -.05]); hood.rotation.x = Math.PI / 2; g.add(hood);
  for (const s of [-1, 1]) g.add(mesh(new THREE.CylinderGeometry(.025, .025, .34, 4), M(C.cream), [s * .13, .9, .52]));
  g.add(mesh(new THREE.BoxGeometry(.5, .16, .05), M(C.mintD), [0, .45, .66]));
  const head = new THREE.Group(); head.position.y = 1.58; g.add(head);
  const sk = mesh(new THREE.IcosahedronGeometry(.55, 1), M(C.skin)); sk.scale.set(1, 1.04, .95); head.add(sk);
  for (const s of [-1, 1]) head.add(mesh(new THREE.IcosahedronGeometry(.12, 0), M(C.skinD), [s * .54, -.02, 0]));
  for (const s of [-1, 1]) { const h = mesh(new THREE.ConeGeometry(.12, .3, 4), M(C.hair), [s * .46, .02, .12]); h.rotation.z = s * 2.6; head.add(h); }
  const dome = mesh(new THREE.SphereGeometry(.6, 9, 5, 0, Math.PI * 2, 0, Math.PI / 2), M(C.orange), [0, .2, 0]); head.add(dome);
  head.add(mesh(new THREE.CylinderGeometry(.62, .63, .22, 9), M(C.orangeD), [0, .25, 0]));
  head.add(mesh(new THREE.IcosahedronGeometry(.15, 0), M(C.cream), [0, .84, 0]));
  const eyes = [], pupils = [];
  for (const s of [-1, 1]) {
    const e = mesh(new THREE.SphereGeometry(.12, 10, 8), M(0xffffff, { flatShading: false }), [s * .2, -.04, .47]); e.scale.set(1, 1.15, .5); head.add(e); eyes.push(e);
    const p = mesh(new THREE.SphereGeometry(.065, 10, 8), M(0x1a1a24, { flatShading: false }), [s * .2, -.04, .53]); head.add(p); pupils.push(p);
    const gl_ = mesh(new THREE.TorusGeometry(.17, .03, 6, 16), M(C.navy), [s * .2, -.04, .56]); head.add(gl_);
  }
  head.add(mesh(new THREE.BoxGeometry(.1, .03, .03), M(C.navy), [0, -.01, .58]));
  head.add(mesh(new THREE.IcosahedronGeometry(.085, 0), M(C.skinD), [0, -.13, .56]));
  const smile = mesh(new THREE.TorusGeometry(.12, .026, 5, 10, Math.PI), M(0x7a2430), [0, -.27, .5]); smile.rotation.z = Math.PI; head.add(smile);
  const mouth = mesh(new THREE.SphereGeometry(.1, 10, 6), M(0x5a1a24, { flatShading: false }), [0, -.3, .49]); mouth.scale.set(1, .1, .45); head.add(mouth);
  const arms = {};
  for (const s of [-1, 1]) {
    const a = new THREE.Group(); a.position.set(s * .58, 1.0, 0);
    a.add(mesh(new THREE.CylinderGeometry(.14, .12, .72, 6), M(C.mint), [0, -.34, 0]));
    a.add(mesh(new THREE.IcosahedronGeometry(.14, 0), M(C.skin), [0, -.76, 0]));
    g.add(a); arms[s] = a;
  }
  g.userData = { head, eyes, pupils, mouth, smile, armW: arms[-1], armE: arms[1] };
  return g;
}
function animOle(o, t, { talk = true, yaw = 0, pitch = 0, armW = 0, armE = 0, wave = 0 } = {}) {
  const u = o.userData;
  const bl = (t % 3.4) < .12 ? .12 : 1;
  u.eyes.forEach(e => e.scale.y = 1.15 * bl); u.pupils.forEach(p => p.scale.y = bl);
  const f = Math.min(ENV.length - 1, Math.max(0, Math.round(t * FPS)));
  const m = talk ? ENV[f] : 0;
  u.mouth.scale.y = .08 + .75 * m; u.smile.visible = m < .25;
  u.head.rotation.y = yaw + Math.sin(t * 1.7) * .05;
  u.head.rotation.x = pitch + Math.sin(t * 2.3) * .03 - m * .05;
  u.head.position.y = 1.58 + Math.sin(t * 4) * .012;
  u.armW.rotation.z = -armW; u.armE.rotation.z = armE + Math.sin(t * 9) * wave;
}

// ---------- plane ----------
function makePlane({ comet = false } = {}) {
  const g = new THREE.Group(), front = new THREE.Group(), rear = new THREE.Group(); g.add(front, rear);
  const body = comet ? 0xdfe4ec : C.white, acc = comet ? 0x2c5aa0 : C.orange;
  const cyl = (len) => new THREE.CylinderGeometry(1, 1, len, 14);
  const f1 = mesh(cyl(5), M(body), [2.5, 0, 0]); f1.rotation.z = Math.PI / 2; front.add(f1);
  const r1 = mesh(cyl(5), M(body), [-2.5, 0, 0]); r1.rotation.z = Math.PI / 2; rear.add(r1);
  const nose = mesh(new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(body), [5, 0, 0]);
  nose.rotation.z = -Math.PI / 2; nose.scale.set(1, 1.9, 1); front.add(nose);
  const tail = mesh(new THREE.CylinderGeometry(1, .22, 4, 14), M(body), [-7, .25, 0]); tail.rotation.z = Math.PI / 2 - .06; rear.add(tail);
  for (const s of [-1, 1]) { const w = mesh(new THREE.BoxGeometry(.5, .2, .3), M(0x1b2540), [5.9, .42, s * .45]); w.rotation.y = s * .5; front.add(w); }
  for (const [grp, x0, x1] of [[front, 0, 5], [rear, -5, 0]]) {
    const strip = mesh(new THREE.CylinderGeometry(1.012, 1.012, x1 - x0, 14, 1, true, Math.PI - .42, .16), M(acc, { side: THREE.DoubleSide }), [(x0 + x1) / 2, 0, 0]);
    strip.rotation.z = Math.PI / 2; grp.add(strip);
    const strip2 = strip.clone(); strip2.geometry = new THREE.CylinderGeometry(1.012, 1.012, x1 - x0, 14, 1, true, -.42 - .16 + 0, .16); grp.add(strip2);
  }
  const winMat = M(0x22314f, { emissive: 0x000000, flatShading: false });
  const wGeo = comet ? new THREE.ShapeGeometry(rrShape(.36, .36, .04)) : new THREE.ShapeGeometry(rrShape(.3, .42, .15), 12);
  const windows = [];
  for (let x = -4.4; x <= 4.0; x += .62) {
    for (const s of [1, -1]) {
      const w = mesh(wGeo, winMat, [x, .16, s * 1.004]); w.rotation.y = s > 0 ? 0 : Math.PI; w.rotation.x = s > 0 ? -.16 : .16;
      (x > 0 ? front : rear).add(w); if (s > 0) windows.push(w);
    }
  }
  const wing = new THREE.Shape(); wing.moveTo(1.4, 0); wing.lineTo(-1.6, 0); wing.lineTo(-3.4, 6.2); wing.lineTo(-2.3, 6.2); wing.lineTo(1.4, 0);
  const wg = new THREE.ExtrudeGeometry(wing, { depth: .16, bevelEnabled: false });
  for (const s of [1, -1]) {
    const w = mesh(wg, M(body, { side: THREE.DoubleSide }), [comet ? .6 : .9, -.5, 0]); w.rotation.x = s * -Math.PI / 2; w.rotation.y = s * .06; front.add(w);
    if (!comet) {
      const e = mesh(new THREE.CylinderGeometry(.42, .38, 1.7, 12), M(0xd3d9e4), [1.5, -1.1, s * 2.5]); e.rotation.z = Math.PI / 2; front.add(e);
      const ei = mesh(new THREE.CircleGeometry(.34, 12), M(0x2a2f3a), [2.36, -1.1, s * 2.5]); ei.rotation.y = Math.PI / 2; front.add(ei);
      front.add(mesh(new THREE.BoxGeometry(.8, .5, .12), M(0xd3d9e4), [1.3, -.75, s * 2.5]));
    } else {
      const ei = mesh(new THREE.BoxGeometry(.2, .2, 1.3), M(0x3a4150), [1.95, -.42, s * 1.6]); front.add(ei);
    }
  }
  const fin = new THREE.Shape(); fin.moveTo(0, 0); fin.lineTo(-2.4, 0); fin.lineTo(-3.4, 2.8); fin.lineTo(-2.5, 2.8); fin.lineTo(0, 0);
  const finM = mesh(new THREE.ExtrudeGeometry(fin, { depth: .16, bevelEnabled: false }), M(comet ? body : acc), [-5.6, .7, -.08]); rear.add(finM);
  if (comet) rear.add(mesh(new THREE.BoxGeometry(2.6, .25, .2), M(acc), [-7.4, 2.3, 0]));
  const hs = new THREE.Shape(); hs.moveTo(.6, 0); hs.lineTo(-.9, 0); hs.lineTo(-1.8, 2.6); hs.lineTo(-1.2, 2.6); hs.lineTo(.6, 0);
  const hg = new THREE.ExtrudeGeometry(hs, { depth: .1, bevelEnabled: false });
  for (const s of [1, -1]) { const h = mesh(hg, M(body, { side: THREE.DoubleSide }), [-7.2, .45, 0]); h.rotation.x = s * -Math.PI / 2; rear.add(h); }
  g.userData = { front, rear, windows, winMat };
  return g;
}

function makeCloud(r, grey = 0xffffff) {
  const g = new THREE.Group(); const n = 4 + Math.floor(r() * 4);
  const mat = M(grey, { roughness: 1, emissive: 0x2a2a30 });
  for (let i = 0; i < n; i++) {
    const s = .9 + r() * 1.5; const m = mesh(new THREE.IcosahedronGeometry(s, 0), mat, [i * 1.3 - n * .6 + r() * .6, r() * .7 + (i % 2) * .4, r() * 1.2]);
    m.rotation.set(r() * 3, r() * 3, r() * 3); g.add(m);
  }
  g.userData.mat = mat; return g;
}
function cloudField(scene, seed, n, box) {
  const r = rng(seed), arr = [];
  for (let i = 0; i < n; i++) {
    const c = makeCloud(r); c.position.set(lerp(box[0], box[1], r()), lerp(box[2], box[3], r()), lerp(box[4], box[5], r()));
    const s = .6 + r() * 1.0; c.scale.setScalar(s); scene.add(c); arr.push({ c, x0: c.position.x });
  }
  return arr;
}
const moveClouds = (arr, dx, span, minX) => arr.forEach(o => { o.c.position.x = minX + ((((o.x0 - minX - dx) % span) + span) % span); });

// =================== SCENES ===================
// --- Exterior (modern plane) ---
const ext = new THREE.Scene();
const extSky = gradTex([[0, '#3d8bff'], [1, '#bfe3ff']]); ext.background = extSky;
const extLight = lights(ext, 1);
const plane = makePlane(); ext.add(plane);
const extClouds = cloudField(ext, 7, 50, [-60, 60, -12, -8, -50, 12]);
const extCloudsHi = cloudField(ext, 11, 8, [-60, 60, 3, 7, -40, -18]);
ext.fog = new THREE.Fog(0xbfe3ff, 30, 90);

// --- Comet 1954 ---
const com = new THREE.Scene();
const comSky = gradTex([[0, '#c99a62'], [1, '#f3dcb4']]); com.background = comSky;
lights(com, 1, 0xfff0d8);
const comet = makePlane({ comet: true }); com.add(comet);
const comClouds = cloudField(com, 3, 50, [-60, 60, -12, -8, -50, 12]);
com.fog = new THREE.Fog(0xf3dcb4, 30, 90);
const debris = []; { const r = rng(5); for (let i = 0; i < 16; i++) { const d = mesh(new THREE.TetrahedronGeometry(.12 + r() * .18), M(0xc5ccd8)); d.userData.v = v3(r() * 2 - 1, r() * 2 - .4, r() * 2 - 1).multiplyScalar(2.2); d.userData.w = v3(r() * 6, r() * 6, r() * 6); d.visible = false; com.add(d); debris.push(d); } }

// --- Pressure cross-section ---
const prs = new THREE.Scene();
prs.background = gradTex([[0, '#1e2f5c'], [1, '#0d1630']]);
lights(prs, 1.05);
const tube = new THREE.Group(); prs.add(tube);
const tubeOut = mesh(new THREE.CylinderGeometry(1.6, 1.6, 3.4, 18, 1, true), M(C.white, { side: THREE.FrontSide })); tubeOut.rotation.z = Math.PI / 2; tube.add(tubeOut);
const tubeIn = mesh(new THREE.CylinderGeometry(1.52, 1.52, 3.4, 18, 1, true), M(0xffe2c4, { side: THREE.BackSide })); tubeIn.rotation.z = Math.PI / 2; tube.add(tubeIn);
const rim = mesh(new THREE.RingGeometry(1.52, 1.6, 18), M(C.orange, { side: THREE.DoubleSide }), [1.7, 0, 0]); rim.rotation.y = Math.PI / 2; tube.add(rim);
tube.add(mesh(new THREE.BoxGeometry(3.4, .08, 2.6), M(0x8a93a8), [0, -.75, 0]));
for (let x = -1.2; x <= 1.2; x += .8) for (const z of [-.8, -.35, .35, .8]) {
  tube.add(mesh(new THREE.BoxGeometry(.35, .28, .36), M(C.navy2), [x, -.55, z]));
  tube.add(mesh(new THREE.BoxGeometry(.1, .5, .36), M(C.navy2), [x - .17, -.3, z]));
}
const prsArrows = [];
for (let i = 0; i < 12; i++) {
  const a = i / 12 * Math.PI * 2; const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(.04, .04, .5, 6), M(C.orange, { emissive: 0x7a2a10 }), [0, .25, 0]));
  g.add(mesh(new THREE.ConeGeometry(.11, .22, 8), M(C.orange, { emissive: 0x7a2a10 }), [0, .58, 0]));
  g.position.set(0, Math.cos(a) * .35, Math.sin(a) * .35); g.rotation.x = a; tube.add(g); prsArrows.push(g);
}

// --- Skin panel with window ---
const pan = new THREE.Scene();
pan.background = gradTex([[0, '#1e2f5c'], [1, '#0d1630']]);
lights(pan, 1.1);
function makePanel(kind) {
  const g = new THREE.Group();
  const s = rrShape(6, 7.6, .2);
  const hole = kind === 'sq' ? rrPath(new THREE.Path(), 1.6, 1.6, .05) : rrPath(new THREE.Path(), 1.6, 2.1, .8);
  s.holes.push(hole);
  g.add(mesh(new THREE.ExtrudeGeometry(s, { depth: .2, bevelEnabled: false, curveSegments: 20 }), M(0xc9d1de, { metalness: .25, roughness: .55 })));
  const rv = M(0x9aa5b8);
  const rg = new THREE.SphereGeometry(.05, 6, 4);
  for (let x = -2.7; x <= 2.71; x += .45) for (const y of [-3.5, 3.5]) g.add(mesh(rg, rv, [x, y, .2]));
  for (let y = -3.05; y <= 3.06; y += .45) for (const x of [-2.75, 2.75]) g.add(mesh(rg, rv, [x, y, .2]));
  const N = 28;
  for (let i = 0; i < N; i++) {
    const a = i / N * Math.PI * 2;
    let x, y;
    if (kind === 'sq') { const p = 10, c = Math.cos(a), sn = Math.sin(a); const r = 1 / Math.pow(Math.pow(Math.abs(c), p) + Math.pow(Math.abs(sn), p), 1 / p); x = c * r * 1.15; y = sn * r * 1.15; }
    else { x = Math.cos(a) * 1.15; y = Math.sin(a) * 1.4; }
    g.add(mesh(rg, rv, [x, y, .2]));
  }
  return g;
}
const panSq = makePanel('sq'), panRd = makePanel('rd'); pan.add(panSq, panRd);
const panSky = mesh(new THREE.PlaneGeometry(3, 3), new THREE.MeshBasicMaterial({ map: gradTex([[0, '#3d8bff'], [1, '#cfeaff']]) }), [0, 0, -.6]); pan.add(panSky);

// --- Cabin ---
const cab = new THREE.Scene();
const cabSkyTex = gradTex([[0, '#3d8bff'], [1, '#cfeaff']]);
cab.background = new THREE.Color(0x0d1630);
const cabL = lights(cab, 1.05, 0xfff3e0);
const wallS = rrShape(9, 5.2, .1); wallS.holes.push(rrPath(new THREE.Path(), .9, 1.25, .42, 0, .1));
const wall = mesh(new THREE.ExtrudeGeometry(wallS, { depth: .3, bevelEnabled: false, curveSegments: 20 }), M(0xf3ead9), [0, 2.5, -.15]); cab.add(wall);
const frameS = rrShape(1.25, 1.62, .58); frameS.holes.push(rrPath(new THREE.Path(), .9, 1.25, .42));
const frame = mesh(new THREE.ExtrudeGeometry(frameS, { depth: .08, bevelEnabled: false, curveSegments: 20 }), M(0xd9dee6), [0, 2.6, .15]); cab.add(frame);
const shade = mesh(new THREE.BoxGeometry(.92, .32, .03), M(0xe8e2d4), [0, 3.1, .02]); cab.add(shade);
cab.add(mesh(new THREE.BoxGeometry(9, 1.1, 1.6), M(0xe9e3d6), [0, 5.4, .65]));
cab.add(mesh(new THREE.BoxGeometry(9, .2, 1.6), M(0xcfd5df), [0, 4.85, .65]));
cab.add(mesh(new THREE.BoxGeometry(9, .1, 6), M(0x3b4a73), [0, -.05, 2.5]));
const cabSky = mesh(new THREE.PlaneGeometry(30, 18), new THREE.MeshBasicMaterial({ map: cabSkyTex, fog: false }), [0, 2, -8]); cab.add(cabSky);
const cabClouds = cloudField(cab, 21, 14, [-14, 14, -2, 1.5, -7, -2.5]);
// panes (in place + exploded)
const paneGeo = new THREE.ShapeGeometry(rrShape(.86, 1.21, .4), 16);
const paneMat = (c, o) => new THREE.MeshStandardMaterial({ color: c, transparent: true, opacity: o, roughness: .1, side: THREE.DoubleSide, depthWrite: false });
const panes = new THREE.Group(); panes.position.set(0, 2.6, 0); cab.add(panes);
const pOuter = mesh(paneGeo, paneMat(0x9fd3ff, .18), [0, 0, -.12]);
const pMid = mesh(paneGeo, paneMat(0xbfe6ff, .16), [0, 0, -.04]);
const pInner = mesh(paneGeo, paneMat(0xffffff, .1), [0, 0, .06]);
const fog = mesh(paneGeo, paneMat(0xffffff, 0), [0, 0, .065]);
const holeM = mesh(new THREE.CircleGeometry(.028, 14), new THREE.MeshBasicMaterial({ color: 0x1a2236 }), [0, -.47, .001]); pMid.add(holeM);
const edgeMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .8 });
for (const p of [pOuter, pMid, pInner]) { p.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(rrShape(.86, 1.21, .4).getPoints(16)), edgeMat)); }
panes.add(pOuter, pMid, pInner, fog);
const seat = new THREE.Group(); seat.position.set(1.05, 0, 1.05); seat.rotation.y = .5; cab.add(seat);
seat.add(mesh(new THREE.BoxGeometry(1.3, .3, 1.2), M(C.navy2), [0, .85, 0]));
seat.add(mesh(new THREE.BoxGeometry(1.3, .7, .2), M(C.navy), [0, .35, .1]));
seat.add(mesh(new THREE.BoxGeometry(1.3, 2.2, .28), M(C.navy2), [0, 1.9, -.6]));
seat.add(mesh(new THREE.BoxGeometry(.9, .45, .1), M(0xf3ead9), [0, 2.8, -.43]));
for (const s of [-1, 1]) seat.add(mesh(new THREE.BoxGeometry(.14, .12, 1.0), M(C.navy), [s * .72, 1.35, 0]));
const ole = makeOle(); ole.position.set(0, .98, .05); seat.add(ole);
const seat2 = seat.clone(); seat2.position.set(3.4, 0, 1.4); seat2.remove(seat2.children.at(-1)); cab.add(seat2);

// --- Outro ---
const outS = new THREE.Scene();
outS.background = gradTex([[0, '#1e2f5c'], [1, '#0b1226']]);
lights(outS, 1.1);
const ole2 = makeOle(); outS.add(ole2);

// =================== TIMELINE ===================
const cuts = [st(2), st(3), st(8), st(11), st(18), st(24), st(25), st(26)].map(x => x - .05);
function sceneAt(t) {
  if (t < cuts[0]) return 'cabA';
  if (t < cuts[1]) return 'ext';
  if (t < cuts[2]) return 'com';
  if (t < cuts[3]) return 'prs';
  if (t < cuts[4]) return 'pan';
  if (t < cuts[5]) return 'cabB';
  if (t < cuts[6]) return 'extSun';
  if (t < cuts[7]) return 'cabC';
  return 'out';
}
const camSet = (p, l, fov = 40) => { cam.position.copy(p); cam.fov = fov; cam.updateProjectionMatrix(); cam.lookAt(l); };

let overlay = []; // 2D draw callbacks for this frame
function setupFrame(t) {
  overlay = [];
  const sc = sceneAt(t);
  const punch = Math.min(...cuts.map(c => t >= c ? t - c : 99));
  const punchF = 1 - .06 * Math.exp(-punch * 9);
  let scene;
  if (sc === 'cabA' || sc === 'cabB' || sc === 'cabC') { scene = cab; setupCabin(t, sc); }
  else if (sc === 'ext' || sc === 'extSun') { scene = ext; setupExt(t, sc); }
  else if (sc === 'com') { scene = com; setupComet(t); }
  else if (sc === 'prs') { scene = prs; setupPressure(t); }
  else if (sc === 'pan') { scene = pan; setupPanel(t); }
  else { scene = outS; setupOutro(t); }
  cam.fov *= punchF; cam.updateProjectionMatrix();
  return { scene, punch };
}

function proj(v) { cam.updateMatrixWorld(); const p = v.clone().project(cam); return { x: (p.x + 1) / 2 * W, y: (1 - p.y) / 2 * H, z: p.z }; }

// ---- cabin ----
function setSky(tex, top, bot) { tex.set([[0, top], [1, bot]]); }
function setupCabin(t, sc) {
  moveClouds(cabClouds, t * 3.2, 28, -14);
  const sunset = sc === 'cabC';
  setSky(cabSkyTex, sunset ? '#ff8a5c' : '#3d8bff', sunset ? '#ffd27a' : '#cfeaff');
  cabClouds.forEach(o => o.c.userData && o.c.children.forEach(m => m.material.color.set(sunset ? 0xffd9c2 : 0xffffff)));
  cabL.color.set(sunset ? 0xffc89a : 0xfff3e0);
  shade.position.y = 3.1; fog.material.opacity = 0;
  panes.position.set(0, 2.6, 0); panes.rotation.set(0, 0, 0);
  pOuter.position.set(0, 0, -.12); pMid.position.set(0, 0, -.04); pInner.position.set(0, 0, .06); fog.position.set(0, 0, .065);
  pOuter.material.color.set(0x9fd3ff); pOuter.material.emissive?.set(0x000000); pOuter.material.opacity = .18;
  [pOuter, pMid, pInner].forEach(p => p.children.forEach(c => { if (c.isLineLoop) c.visible = false; }));
  holeM.scale.setScalar(1); seat2.visible = true; seat.visible = true;
  const wide = [v3(4.6, 3.3, 9.0), v3(.45, 2.3, .4)];
  if (sc === 'cabA') {
    const p = ease(prog(t, 0, 2.4));
    camSet(lerpV(v3(5.4, 3.5, 10.4), wide[0], p), wide[1], 40);
    const look = prog(t, .3, .9) - prog(t, 1.6, 2.2);
    animOle(ole, t, { yaw: lerp(.1, -1.1, ease(look)), armW: lerp(.1, 1.75, ease(prog(t, .4, .9))) });
  } else if (sc === 'cabB') {
    const a = st(18), b = st(19), c = st(20), d = st(22), e2 = st(23), f = st(24);
    if (t < b) { // Achtung: punch on Ole
      const p = eo(prog(t, a, a + .5));
      camSet(lerpV(wide[0], v3(2.6, 2.95, 5.2), p), lerpV(wide[1], v3(.85, 2.45, 1.0), p), 40);
      animOle(ole, t, { yaw: .05, armW: lerp(.1, 2.7, back(prog(t, a, a + .4))) });
    } else if (t < c) { // look at window
      const p = ease(prog(t, b, b + 1.6));
      camSet(lerpV(v3(2.6, 2.95, 5.2), v3(-1.5, 2.8, 3.8), p), lerpV(v3(.85, 2.45, 1.0), v3(-.05, 2.5, 0), p), 40);
      animOle(ole, t, { yaw: lerp(.05, -1.15, ease(prog(t, b, b + .6))), armW: lerp(2.7, 1.8, ease(prog(t, b, b + .6))) });
    } else if (t < d) { // close-up hole
      const p = ease(prog(t, c, c + 1.0));
      camSet(lerpV(v3(-1.5, 2.8, 3.8), v3(-.12, 2.3, 1.6), p), lerpV(v3(0, 2.55, 0), v3(0, 2.18, -.05), p), 40);
      animOle(ole, t, { yaw: -1.15, armW: 1.8 });
      const hp = proj(v3(0, 2.6 - .47, -.04));
      const pulse = prog(t, c + .3, c + .8);
      overlay.push(() => {
        ringPulse(hp.x, hp.y, t, pulse, CSS.orange);
        card(W / 2, 520, 'WINZIG, ABER WICHTIG', 'Entlüftungsloch', prog(t, c + .5, c + .9), { pointer: hp });
        if (t > st(21)) stamp(W / 2, 1180, 'KEIN FEHLER', CSS.mint, prog(t, st(21), st(21) + .25), -6);
      });
    } else { // exploded panes
      const p = ease(prog(t, d, d + 1.1));
      seat2.visible = false; seat.visible = p < .35; camSet(lerpV(v3(-.12, 2.3, 1.6), v3(-.65, 2.85, 6.9), p), lerpV(v3(0, 2.18, -.05), v3(-.65, 2.5, .75), p), 40);
      animOle(ole, t, { yaw: -.4, armW: .2 });
      panes.position.set(0, 2.6, 0); panes.rotation.y = lerp(0, -.55, p);
      pOuter.position.set(lerp(0, .5, p), 0, lerp(-.12, .45, p)); pMid.position.set(lerp(0, -.15, p), 0, lerp(-.04, 1.0, p)); pInner.position.set(lerp(0, -.8, p), 0, lerp(.06, 1.55, p)); fog.position.copy(pInner.position).add(v3(0, 0, .005));
      [pOuter, pMid, pInner].forEach(q => q.children.forEach(c => { if (c.isLineLoop) c.visible = p > .3; }));
      const glow = prog(t, d + 1.0, d + 1.6) * (1 - prog(t, f - .2, f));
      pOuter.material.color.set(new THREE.Color(0x9fd3ff).lerp(new THREE.Color(C.orange), glow)); pOuter.material.opacity = .18 + glow * .5;
      const fogA = t < e2 ? .62 * p : .62 * (1 - eo(prog(t, e2 + .2, e2 + 1.3)));
      fog.material.opacity = fogA;
      const wp = (o) => { const v = new THREE.Vector3(); o.getWorldPosition(v); return v; };
      const po = proj(wp(pOuter).add(v3(0, .78, 0))), pm = proj(wp(pMid).add(v3(0, .78, 0))), pi = proj(wp(pInner).add(v3(0, .78, 0)));
      pMid.updateWorldMatrix(true, false); const hp = proj(new THREE.Vector3(0, -.47, 0).applyMatrix4(pMid.matrixWorld));
      overlay.push(() => {
        const a1 = prog(t, d + .9, d + 1.3);
        tag(po.x, po.y, 'AUSSEN', glow > .3 ? CSS.orange : '#ffffff', a1);
        tag(pm.x, pm.y, 'MITTE', '#ffffff', a1);
        tag(pi.x, pi.y, 'INNEN', '#ffffff', a1);
        ringPulse(hp.x, hp.y, t, a1 * .8, CSS.orange, 34);
        card(W / 2, 1270, 'DRUCK LIEGT AUF', 'äußerer Scheibe', prog(t, d + 1.1, d + 1.5) * (1 - prog(t, e2 - .1, e2 + .1)), { color: CSS.orange });
        card(W / 2, 1270, 'INNEN', 'beschlägt nicht', prog(t, e2 + .3, e2 + .7), { color: CSS.mint });
      });
    }
  } else { // cabC sunset, thumbs up
    const a = st(25);
    const p = ease(prog(t, a, a + 2));
    camSet(lerpV(v3(3.0, 3.0, 5.6), v3(4.0, 3.2, 7.6), p), v3(.6, 2.35, .7), 40);
    animOle(ole, t, { yaw: .1, armE: lerp(.1, 2.5, back(prog(t, a + .2, a + .6))) });
    overlay.push(() => punchline(t, a));
  }
}

// ---- exterior ----
function setupExt(t, sc) {
  moveClouds(extClouds, t * 14, 120, -60); moveClouds(extCloudsHi, t * 6, 120, -60);
  plane.position.y = Math.sin(t * 1.1) * .25; plane.rotation.x = Math.sin(t * .8) * .04; plane.rotation.z = Math.sin(t * .7) * .02;
  if (sc === 'ext') {
    const a = st(2), b = cuts[1]; const p = prog(t, a, b); const dk = ease(prog(t, a + .4, b - .3));
    setSky(extSky, mixHex('#3d8bff', '#1b1533', dk), mixHex('#bfe3ff', '#4a3a5e', dk));
    ext.fog.color.set(mixHex('#bfe3ff', '#4a3a5e', dk));
    extLight.intensity = lerp(2.4, .9, dk);
    extClouds.forEach(o => o.c.children.forEach(m => m.material.color.set(mixHex('#ffffff', '#6d6684', dk))));
    plane.userData.winMat.emissive.set(0x000000);
    camSet(lerpV(v3(17, 4, 20), v3(11, 2, 17), ease(p)), v3(-.5, 0, 0), 40);
    const flash = Math.exp(-Math.max(0, t - (en(2) - .7)) * 10) * (t > en(2) - .7 ? 1 : 0);
    overlay.push(() => { if (flash > .02) { ctx.fillStyle = `rgba(230,225,255,${flash * .55})`; ctx.fillRect(0, 0, W, H); } });
  } else {
    const a = st(24), p = prog(t, a, cuts[6]);
    setSky(extSky, '#ff7a59', '#ffd47e'); ext.fog.color.set('#ffd47e'); extLight.intensity = 2.6; extLight.color.set(0xffc08a);
    extClouds.forEach(o => o.c.children.forEach(m => m.material.color.set('#ffe2cc')));
    plane.userData.winMat.emissive.set(new THREE.Color(C.yellow).multiplyScalar(.9 * eo(prog(t, a + .3, a + .9))));
    camSet(lerpV(v3(-14, 2.5, 19), v3(-9, 1.5, 17), ease(p)), v3(0, -.3, 0), 40);
    overlay.push(() => card(W / 2, 520, 'RUND STATT ECKIG', 'kein Design', prog(t, a + .4, a + .8), { color: CSS.orange }));
  }
}

// ---- comet ----
function setupComet(t) {
  moveClouds(comClouds, t * 14, 120, -60);
  const a = st(3), b = st(4), c = st(6), d = st(7), e = cuts[2];
  const splitT = st(6) + 2.6;
  const dk = ease(prog(t, c, c + 1.5));
  setSky(comSky, mixHex('#c99a62', '#2a1420', dk), mixHex('#f3dcb4', '#7a3a3a', dk));
  com.fog.color.set(mixHex('#f3dcb4', '#7a3a3a', dk));
  comClouds.forEach(o => o.c.children.forEach(m => m.material.color.set(mixHex('#fff4e2', '#8a6a70', dk))));
  const { front, rear } = comet.userData;
  const sp = ease(prog(t, splitT, splitT + 2.2));
  comet.position.y = Math.sin(t * 1.1) * .25;
  front.position.set(.7 * sp, -.4 * sp, 0); front.rotation.set(0, 0, -.22 * sp);
  rear.position.set(-1.1 * sp, -1.3 * sp, .2 * sp); rear.rotation.set(.25 * sp, 0, .55 * sp);
  debris.forEach(dd => { dd.visible = sp > 0 && sp < 1; const k = (t - splitT); dd.position.copy(dd.userData.v.clone().multiplyScalar(Math.max(0, k))).add(v3(0, comet.position.y - k * k * .3, 0)); dd.rotation.set(dd.userData.w.x * k, dd.userData.w.y * k, 0); });
  if (t < b) { // 1954
    camSet(lerpV(v3(18, 2, 24), v3(14, 1, 21), ease(prog(t, a, b))), v3(0, -1.5, 0), 40);
    overlay.push(() => bigYear(t, a));
  } else if (t < c) {
    if (t < st(5)) camSet(lerpV(v3(20, 3, 18), v3(15, 1.5, 16), ease(prog(t, b, st(5)))), v3(0, -.5, 0), 40);
    else camSet(lerpV(v3(10, -6, 16), v3(6, -5, 16), ease(prog(t, st(5), c))), v3(0, .5, 0), 40);
    overlay.push(() => {
      card(W / 2, 470, 'DE HAVILLAND COMET', 'erster Düsen-Passagierjet', prog(t, b + .2, b + .6), { color: CSS.yellow });
      if (t > st(5)) stamp(W / 2, 650, 'STOLZ DER LUFTFAHRT', CSS.yellow, prog(t, st(5), st(5) + .25), -4);
    });
  } else if (t < d) {
    camSet(lerpV(v3(6, 2, 26), v3(3, 1, 22), ease(prog(t, c, d))), v3(-.5, -.8, 0), 40);
    overlay.push(() => {
      card(W / 2, 470, '1954', '2 Comets · 3 Monate', prog(t, c + .5, c + .9), { color: CSS.red });
      ctx.fillStyle = `rgba(255,40,60,${.18 * Math.exp(-Math.max(0, t - splitT) * 2) * (t > splitT ? 1 : 0)})`; ctx.fillRect(0, 0, W, H);
    });
  } else { // investigators: zoom on rear window
    const w = comet.userData.windows.find(x => x.position.x < -.3 && x.position.x > -1.1) || comet.userData.windows[0];
    w.updateWorldMatrix(true, false); const wp = new THREE.Vector3(.18, .18, 0).applyMatrix4(w.matrixWorld);
    const p = ease(prog(t, d, d + 1.0));
    camSet(lerpV(v3(3, 1, 22), wp.clone().add(v3(.4, .3, 3.2)), p), lerpV(v3(-.5, -.8, 0), wp, p), 40);
    overlay.push(() => { magnifier(W / 2, H * .5, prog(t, d + .3, d + .7)); card(W / 2, 470, 'URSACHE', 'Metallermüdung', prog(t, d + .6, d + 1.0), { color: CSS.orange }); });
  }
}

// ---- pressure ----
let cycles = 0;
function setupPressure(t) {
  const a = st(8), b = st(9), c = st(10), e = cuts[3];
  let p, n;
  if (t < b) { p = ease(prog(t, a + .3, b - .3)); n = 1; }
  else if (t < c) { p = 1 - ease(prog(t, b, c - .2)); n = 1; }
  else { const k = t - c; const ph = k * k * 3.2 + k * 1.6; p = .5 - .5 * Math.cos(ph * Math.PI * 2); n = 1 + Math.floor(ph + .5); }
  cycles = n;
  const s = 1 + .07 * p;
  tube.scale.set(1, s, s);
  prsArrows.forEach(g => g.scale.set(1, .35 + p * 1.6, 1));
  tube.rotation.y = -.75 + Math.sin(t * .3) * .05;
  const cp = ease(prog(t, a, a + 1.5));
  camSet(lerpV(v3(2, 2, 9.5), v3(1.5, 1.5, 7.6), cp), v3(0, -.1, 0), 40);
  overlay.push(() => {
    altGraph(t, p, n, prog(t, a + .1, a + .5));
    card(W / 2, 1180, t < b ? 'START' : (t < c ? 'LANDUNG' : 'IMMER WIEDER'), t < b ? 'Kabine wird aufgepumpt' : (t < c ? 'Druck wieder raus' : `Zyklus ${Math.min(n, 9999).toLocaleString('de-DE')}`), 1, { color: p > .5 ? CSS.orange : CSS.mint });
  });
}

// ---- panel ----
function field(kind) {
  const a = .8, b = kind === 'sq' ? .8 : 1.05, p = kind === 'sq' ? 9 : 2;
  const psi = (x, y) => { const X = x / a, Y = y / b; const r = Math.pow(Math.pow(Math.abs(X), p) + Math.pow(Math.abs(Y), p), 1 / p); if (r < 1.0001) return 0; return Y * (1 - 1 / (r * r)) * b; };
  const h = 1e-3;
  const vel = (x, y) => [(psi(x, y + h) - psi(x, y - h)) / (2 * h), -(psi(x + h, y) - psi(x - h, y)) / (2 * h)];
  const lines = [];
  for (let y0 = -3.2; y0 <= 3.21; y0 += .36) {
    if (Math.abs(y0) < .15) continue;
    let x = -2.85, y = y0; const pts = [];
    for (let i = 0; i < 600 && x < 2.85; i++) {
      const [u, v] = vel(x, y); const m = Math.hypot(u, v) || 1;
      pts.push([x, y, m]);
      const st_ = .025; const mx = x + u / m * st_ * .5, my = y + v / m * st_ * .5;
      const [u2, v2] = vel(mx, my); const m2 = Math.hypot(u2, v2) || 1;
      x += u2 / m2 * st_; y += v2 / m2 * st_;
    }
    lines.push(pts);
  }
  return lines;
}
const FL = { sq: field('sq'), rd: field('rd') };
const crack = (() => { const r = rng(9); const pts = [[.8, .8]]; let x = .8, y = .8; for (let i = 0; i < 26; i++) { x += .09 + r() * .05; y += .08 + (r() - .4) * .12; pts.push([x, y]); } return pts; })();
function setupPanel(t) {
  const a = st(11), b = st(12), c = st(13), d = st(14), e = st(15), f = st(16), g = st(17), end = cuts[4];
  const round = t >= f - .05;
  panSq.visible = !round; panRd.visible = round;
  const pop = round ? back(prog(t, f - .05, f + .3)) : 1;
  const grp = round ? panRd : panSq; grp.scale.setScalar(lerp(.85, 1, pop));
  let shake = 0; if (t > e + .2 && t < f) shake = Math.exp(-(t - e - .2) * 3) * .08;
  const sx = Math.sin(t * 71) * shake, sy = Math.cos(t * 59) * shake;
  const drift = Math.sin(t * .4) * .25;
  camSet(v3(1.2 + drift + sx, .6 + sy, 9.6), v3(sx * .5, .1 + sy * .5, 0), 40);
  const L = round ? FL.rd : FL.sq;
  const showP = round ? eo(prog(t, f + .1, g + .3)) : eo(prog(t, a + .2, a + 1.6));
  const heat = round ? 0 : clamp(prog(t, a + .8, b + .8) + 0) * (1 - prog(t, f - .4, f));
  const crackP = round ? 0 : (t < c ? 0 : (t < d ? .18 * eo(prog(t, c + .1, c + .5)) : (t < e ? lerp(.18, .55, prog(t, d, e)) : lerp(.55, 1, eo(prog(t, e + .1, e + .7))))));
  const pp = (x, y) => proj(v3(x, y, .21));
  overlay.push(() => {
    const dash = t * 140;
    ctx.save(); ctx.lineCap = 'round';
    for (const ln of L) {
      const n = Math.floor(ln.length * showP); if (n < 2) continue;
      const P = ln.slice(0, n).map(([x, y, m]) => ({ ...pp(x, y), m }));
      ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.setLineDash([]);
      ctx.beginPath(); P.forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.stroke();
      ctx.setLineDash([26, 34]); ctx.lineDashOffset = -dash; ctx.lineWidth = 6;
      for (let i = 1; i < P.length; i++) {
        const k = round ? 0 : clamp((P[i].m - 1.25) / 1.6) * heat;
        ctx.strokeStyle = k > .05 ? `rgb(255,${Math.round(lerp(230, 59, k))},${Math.round(lerp(220, 71, k))})` : (round ? '#7CF5D6' : '#E8F1FF');
        ctx.beginPath(); ctx.moveTo(P[i - 1].x, P[i - 1].y); ctx.lineTo(P[i].x, P[i].y); ctx.stroke();
      }
    }
    ctx.restore();
    if (heat > 0) for (const [x, y] of [[.8, .8], [-.8, .8], [.8, -.8], [-.8, -.8]]) {
      const q = pp(x, y); const R = 70 + 60 * heat + Math.sin(t * 10) * 8 * heat;
      const gr = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, R); gr.addColorStop(0, `rgba(255,59,71,${.85 * heat})`); gr.addColorStop(1, 'rgba(255,59,71,0)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(q.x, q.y, R, 0, Math.PI * 2); ctx.fill();
    }
    if (crackP > 0) {
      const n = Math.max(2, Math.round(crack.length * crackP)); const P = crack.slice(0, n).map(([x, y]) => pp(x, y));
      ctx.save(); ctx.lineJoin = 'round'; ctx.shadowColor = CSS.red; ctx.shadowBlur = 24; ctx.strokeStyle = '#1a0d12'; ctx.lineWidth = 7;
      ctx.beginPath(); P.forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.stroke(); ctx.restore();
    }
    if (!round && t > a + .6 && t < c) card(W / 2, 430, 'SPANNUNG', t < b ? 'kann nicht ausweichen' : 'staut sich an den Ecken', prog(t, a + .6, a + 1.0), { color: CSS.red });
    if (!round && t >= c) {
      const flights = t < d ? 1 : Math.round(1 + Math.pow(prog(t, d, f - .2), 1.6) * 1200);
      card(W / 2, 430, 'RISS', `Flug ${flights.toLocaleString('de-DE')}`, prog(t, c, c + .3), { color: CSS.red });
    }
    if (t > e + .2 && t < f) { const k = Math.exp(-(t - e - .2) * 4); ctx.fillStyle = `rgba(255,30,50,${.35 * k})`; ctx.fillRect(0, 0, W, H); }
    if (round) card(W / 2, 430, 'KEINE ECKEN', t < g ? 'nichts staut sich' : 'Kraft fließt drumherum', prog(t, f + .1, f + .5), { color: CSS.mint });
  });
}

// ---- outro ----
function setupOutro(t) {
  const a = st(26);
  camSet(v3(0, 1.4, 6.2), v3(0, 1.0, 0), 40);
  ole2.position.set(0, -1.6 + .4 * back(prog(t, a, a + .5)), 0); ole2.rotation.y = Math.sin(t * .8) * .12;
  animOle(ole2, t, { armE: lerp(.1, 2.5, back(prog(t, a + .2, a + .6))), wave: prog(t, a + .6, a + .8) * .25 });
  overlay.push(() => outroCard(t, a));
}

// =================== 2D OVERLAY ===================
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function card(cx, cy, label, value, a, o = {}) {
  if (a <= 0) return;
  const s = back(clamp(a)); ctx.save(); ctx.globalAlpha = clamp(a * 2);
  ctx.translate(cx, cy); ctx.scale(s, s);
  ctx.font = '900 64px M'; const w1 = ctx.measureText(value).width; ctx.font = '800 30px M'; const w0 = ctx.measureText(label).width;
  const w = Math.max(w1, w0) + 90, h = 170;
  if (o.pointer) { ctx.restore(); ctx.save(); ctx.globalAlpha = clamp(a * 2); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx, cy + h / 2 * s); ctx.lineTo(o.pointer.x, o.pointer.y - 40); ctx.stroke(); ctx.translate(cx, cy); ctx.scale(s, s); }
  ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
  ctx.fillStyle = '#ffffff'; rr(-w / 2, -h / 2, w, h, 34); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = o.color || CSS.orange; rr(-w / 2, -h / 2, 18, h, 9); ctx.fill();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = o.color === CSS.yellow ? '#B8860B' : (o.color || CSS.orange); ctx.font = '800 30px M'; ctx.fillText(label, 8, -38);
  ctx.fillStyle = CSS.navy; ctx.font = '900 64px M'; ctx.fillText(value, 8, 28);
  ctx.restore();
}
function tag(x, y, text, col, a) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = '900 38px M'; const w = ctx.measureText(text).width + 40;
  ctx.fillStyle = col === '#ffffff' ? CSS.navy : col; rr(x - w / 2, y - 30, w, 60, 30); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y + 2); ctx.restore();
}
function stamp(x, y, text, col, a, rot) {
  if (a <= 0) return; const s = lerp(1.8, 1, eo(clamp(a))); ctx.save(); ctx.globalAlpha = clamp(a * 1.5); ctx.translate(x, y); ctx.rotate(rot * Math.PI / 180); ctx.scale(s, s);
  ctx.font = '900 76px M'; const w = ctx.measureText(text).width + 60; ctx.lineWidth = 10; ctx.strokeStyle = col; rr(-w / 2, -62, w, 124, 22); ctx.stroke();
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 4); ctx.restore();
}
function ringPulse(x, y, t, a, col, r0 = 46) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.arc(x, y, r0, 0, Math.PI * 2); ctx.stroke();
  const k = (t * 1.4) % 1; ctx.globalAlpha = a * (1 - k); ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y, r0 + k * 70, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
}
function magnifier(x, y, a) {
  if (a <= 0) return; const s = back(a); ctx.save(); ctx.globalAlpha = clamp(a * 2); ctx.translate(x, y); ctx.scale(s, s);
  ctx.lineWidth = 26; ctx.strokeStyle = CSS.navy; ctx.beginPath(); ctx.arc(0, 0, 230, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 10; ctx.strokeStyle = CSS.orange; ctx.beginPath(); ctx.arc(0, 0, 214, 0, Math.PI * 2); ctx.stroke();
  ctx.lineCap = 'round'; ctx.lineWidth = 50; ctx.strokeStyle = CSS.navy; ctx.beginPath(); ctx.moveTo(170, 170); ctx.lineTo(330, 330); ctx.stroke();
  ctx.restore();
}
function bigYear(t, a) {
  const p = clamp((t - a) / .4); const s = lerp(1.6, 1, eo(p));
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(214,170,110,.35)'; ctx.fillRect(0, 0, W, H); ctx.restore();
  ctx.save(); ctx.globalAlpha = p; ctx.translate(W / 2, 620); ctx.scale(s, s); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '900 300px M'; ctx.lineWidth = 18; ctx.strokeStyle = CSS.navy; ctx.strokeText('1954', 0, 0); ctx.fillStyle = CSS.cream; ctx.fillText('1954', 0, 0); ctx.restore();
}
function altGraph(t, p, n, a) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a;
  const x0 = 140, x1 = 940, y0 = 560, y1 = 330;
  ctx.fillStyle = 'rgba(255,255,255,.08)'; rr(100, 270, 880, 340, 30); ctx.fill();
  ctx.font = '800 28px M'; ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.textAlign = 'left'; ctx.fillText('KABINENDRUCK', 140, 315);
  ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
  const px = x0 + (x1 - x0) * .5, py = lerp(y0, y1 + 40, p);
  ctx.strokeStyle = CSS.orange; ctx.lineWidth = 8; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(px - 120, y0);
  ctx.bezierCurveTo(px - 60, y0, px - 40, py, px, py); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px, py, 16, 0, Math.PI * 2); ctx.fill();
  ctx.textAlign = 'right'; ctx.font = '900 44px M'; ctx.fillStyle = '#fff'; ctx.fillText(`${Math.round(p * 100)} %`, x1, 335);
  ctx.restore();
}
function punchline(t, a) {
  const p = back(prog(t, a + .1, a + .5)); if (p <= 0) return;
  ctx.save(); ctx.translate(W / 2, 560); ctx.scale(p, p); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '900 92px M'; ctx.lineWidth = 16; ctx.strokeStyle = CSS.navy; ctx.lineJoin = 'round';
  ctx.strokeText('Du kommst', 0, -60); ctx.fillStyle = '#fff'; ctx.fillText('Du kommst', 0, -60);
  const w = ctx.measureText('heil an.').width + 60; ctx.fillStyle = CSS.orange; rr(-w / 2, 0, w, 120, 26); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.fillText('heil an.', 0, 64); ctx.restore();
}
function logo(x, y, s = 1, a = 1) {
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '900 120px M'; const w1 = ctx.measureText('Moment mal').width, w2 = ctx.measureText('?!').width;
  ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.fillText('Moment mal', -(w1 + w2) / 2, 0);
  ctx.fillStyle = CSS.orange; ctx.fillText('?!', -(w1 + w2) / 2 + w1, 0); ctx.restore();
}
function outroCard(t, a) {
  const p = eo(prog(t, a, a + .4)); logo(W / 2, lerp(280, 330, p), .9, p);
  ctx.save(); ctx.globalAlpha = prog(t, a + .2, a + .6); ctx.font = '600 44px M'; ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.textAlign = 'center';
  ctx.fillText('Alltag. In 60 Sekunden erklärt.', W / 2, 430); ctx.restore();
  const b = st(27); const done = t > b + .55; const bp = back(prog(t, a + .4, a + .8)); if (bp <= 0) return;
  const press = t > b + .4 && t < b + .55 ? .92 : 1;
  ctx.save(); ctx.translate(W / 2, 600); ctx.scale(bp * press, bp * press);
  ctx.fillStyle = done ? CSS.mint : CSS.orange; rr(-250, -70, 500, 140, 70); ctx.fill();
  ctx.fillStyle = done ? CSS.navy : '#fff'; ctx.font = '900 58px M'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (done) {
    ctx.fillText('Gefolgt', 30, 4); ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = CSS.navy;
    ctx.beginPath(); ctx.moveTo(-150, 2); ctx.lineTo(-125, 28); ctx.lineTo(-85, -24); ctx.stroke();
  } else ctx.fillText('+ Folgen', 0, 4);
  ctx.restore();
  ctx.save(); ctx.globalAlpha = prog(t, a + .6, a + 1); ctx.font = '800 40px M'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText('@momentmal.erklaert', W / 2, 730); ctx.restore();
}
function hook(t) {
  const out_ = prog(t, cuts[1] - .3, cuts[1] - .02); if (t > cuts[1]) return;
  const p = back(prog(t, 0, .35));
  ctx.save(); ctx.globalAlpha = 1 - out_; ctx.translate(W / 2, 400); ctx.scale(p, p); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '900 76px M'; ctx.lineJoin = 'round'; ctx.lineWidth = 18; ctx.strokeStyle = CSS.navy;
  ctx.strokeText('Warum sind Flugzeug-', 0, -70); ctx.fillStyle = '#fff'; ctx.fillText('Warum sind Flugzeug-', 0, -70);
  ctx.font = '900 96px M'; const w = ctx.measureText('fenster rund?').width + 64;
  ctx.fillStyle = CSS.orange; rr(-w / 2, -6, w, 128, 28); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillText('fenster rund?', 0, 60);
  ctx.restore();
}
function never(t) {
  const a = st(1), b = st(2) - .05; if (t < a || t > b) return;
  const p = back(prog(t, a, a + .25)); ctx.save(); ctx.translate(W * .26, 1120); ctx.scale(p, p);
  ctx.fillStyle = '#fff'; rr(-170, -170, 340, 340, 30); ctx.fill();
  const g = ctx.createLinearGradient(0, -130, 0, 130); g.addColorStop(0, '#3d8bff'); g.addColorStop(1, '#cfeaff'); ctx.fillStyle = g; rr(-130, -130, 260, 260, 10); ctx.fill();
  const xp = eo(prog(t, a + .15, a + .4)); ctx.strokeStyle = CSS.red; ctx.lineWidth = 34; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-150, -150); ctx.lineTo(lerp(-150, 150, xp), lerp(-150, 150, xp)); ctx.stroke();
  if (xp > .5) { const x2 = (xp - .5) * 2; ctx.beginPath(); ctx.moveTo(150, -150); ctx.lineTo(lerp(150, -150, x2), lerp(-150, 150, x2)); ctx.stroke(); }
  ctx.restore();
}
// captions: chunked, active word highlighted
const CHUNKS = [];
S.forEach(s => { let cur = []; s.words.forEach(w => { cur.push(w); const len = cur.map(x => x.w).join(' ').length; if (cur.length >= 3 || len > 16) { CHUNKS.push(cur); cur = []; } }); if (cur.length) CHUNKS.push(cur); });
function captions(t) {
  if (t > cuts[7]) return;
  let ch = null; for (const c of CHUNKS) if (t >= c[0].s - .05 && t <= c.at(-1).e + .15) ch = c;
  if (!ch) return;
  ctx.save(); ctx.font = '900 66px M'; ctx.textBaseline = 'middle';
  const words = ch.map(w => w.w); const sp = 18; const widths = words.map(w => ctx.measureText(w).width);
  const tw = widths.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  const x0 = W / 2 - tw / 2, y = 1460; const p = eo(prog(t, ch[0].s - .05, ch[0].s + .1));
  ctx.globalAlpha = p; ctx.fillStyle = 'rgba(13,18,36,.88)'; rr(x0 - 34, y - 58, tw + 68, 116, 58); ctx.fill();
  let x = x0;
  words.forEach((w, i) => {
    const on = t >= ch[i].s && t < ch[i].e + .05;
    ctx.fillStyle = on ? CSS.orange : '#fff'; ctx.fillText(w, x, y + lerp(8, 3, p)); x += widths[i] + sp;
  });
  ctx.restore();
}
function vignette() {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.35)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function brandBug(t) { if (t > cuts[7]) return; ctx.save(); ctx.globalAlpha = .9; ctx.font = '900 30px M'; const w = ctx.measureText('MOMENT MAL?!').width + 36; ctx.fillStyle = CSS.orange; rr(54, 150, w, 54, 27); ctx.fill(); ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.fillText('MOMENT MAL?!', 72, 179); ctx.restore(); }

// =================== FRAME ===================
window.frame = (t) => {
  const { scene, punch } = setupFrame(t);
  gl.render(scene, cam);
  ctx.drawImage(gl.domElement, 0, 0);
  vignette();
  overlay.forEach(f => f());
  hook(t);
  never(t);
  brandBug(t);
  captions(t);
  if (punch < .2) { ctx.fillStyle = `rgba(255,255,255,${.28 * Math.exp(-punch * 18)})`; ctx.fillRect(0, 0, W, H); }
  return out.toDataURL('image/jpeg', .9).slice(23);
};
window.avatar = () => {
  ole2.position.set(0, 0, 0); ole2.rotation.y = .25;
  animOle(ole2, 0.5, { talk: false, armE: .1 });
  ole2.userData.head.rotation.y = -.1;
  camSet(v3(0, 1.85, 4.9), v3(0, 1.72, 0), 40);
  gl.render(outS, cam);
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1080; const x = c.getContext('2d');
  x.drawImage(gl.domElement, 0, 420, 1080, 1080, 0, 0, 1080, 1080);
  return c.toDataURL('image/png').slice(22);
};
window.DUR = DUR; window.CUES = { cuts, s: S.map(x => [x.s, x.e]) };
await document.fonts.load('900 80px M'); await document.fonts.load('800 30px M'); await document.fonts.load('600 40px M');
window.READY = true;
