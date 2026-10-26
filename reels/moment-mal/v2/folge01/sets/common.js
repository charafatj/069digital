// Shared builders: Ole (rigged robot, posed as a pure function of time), sky, clouds, airliners.
import * as G from '../lib/gl.js';
import * as M from '../lib/motion.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
const { THREE } = G;

export const COL = {
  navy: 0x13203f, navy2: 0x1e2f5c, orange: 0xff6a3d, mint: 0x2ee6b6, cream: 0xfff3e0, red: 0xff3b47, yellow: 0xffc94a,
};

// ------------------------------------------------------------------ Ole
let OLE_SRC = null;
export async function loadOle() {
  OLE_SRC = await new GLTFLoader().loadAsync('assets/ole.glb');
}
const OLE_MAT = { Main: COL.orange, Grey: COL.mint, Black: COL.navy };
export function makeOle(height = 1.8) {
  const root = new THREE.Group();
  const body = SkeletonUtils.clone(OLE_SRC.scene);
  let head = null, headBone = null, neck = null;
  body.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      const n = o.material.name;
      o.material = new THREE.MeshStandardMaterial({ color: OLE_MAT[n] ?? 0xffffff, roughness: n === 'Black' ? 0.22 : 0.48, metalness: 0, envMapIntensity: 0.9 });
      if (o.morphTargetDictionary) head = o;
    }
    if (o.isBone && o.name === 'Head') headBone = o;
    if (o.isBone && o.name === 'Neck') neck = o;
  });
  const s = height / 4.6; // the rig is ~4.6 units tall in its bind pose
  body.scale.setScalar(s);
  root.add(body);
  const rest = [];
  body.traverse((o) => { if (o.isBone) rest.push([o, o.position.clone(), o.quaternion.clone(), o.scale.clone()]); });
  const mixer = new THREE.AnimationMixer(body);
  const acts = {};
  for (const clip of OLE_SRC.animations) { const a = mixer.clipAction(clip); a.play(); a.setEffectiveWeight(0); acts[clip.name] = a; }
  return { root, body, mixer, acts, head, headBone, neck, rest, scale: s };
}
// layers: [[clipName, timeSeconds, weight], ...]; morph: {Surprised: 0..1, ...}; headYaw/headPitch add on top
export function poseOle(o, layers, { morph = {}, headYaw = 0, headPitch = 0, headRoll = 0 } = {}) {
  for (const a of Object.values(o.acts)) { a.setEffectiveWeight(0); a.enabled = false; }
  let wsum = layers.reduce((s, l) => s + l[2], 0) || 1;
  for (const [name, time, w] of layers) {
    const a = o.acts[name]; if (!a) continue;
    a.enabled = true; a.setEffectiveWeight(w / wsum);
    const d = a.getClip().duration; a.time = Math.min(time, d - 1e-4);
  }
  for (const [bn, p, q, sc] of o.rest) { bn.position.copy(p); bn.quaternion.copy(q); bn.scale.copy(sc); } // bones no clip drives must not keep last frame's pose
  o.mixer.update(0);
  if (o.headBone) { o.headBone.rotation.y += headYaw; o.headBone.rotation.x += headPitch; o.headBone.rotation.z += headRoll; }
  if (o.head) {
    o.head.morphTargetInfluences.fill(0);
    for (const [k, v] of Object.entries(morph)) { const i = o.head.morphTargetDictionary[k]; if (i !== undefined) o.head.morphTargetInfluences[i] = v; }
  }
}
// talking: a small nod driven by the VO envelope (100 Hz)
let VOENV = [];
export async function loadVoEnv() { VOENV = await (await fetch('vo_env.json')).json(); }
export const voEnv = (t) => VOENV[Math.max(0, Math.min(VOENV.length - 1, Math.round(t * 100)))] || 0;

// ------------------------------------------------------------------ sky + clouds
export function gradientTexture() {
  const cv = document.createElement('canvas'); cv.width = 4; cv.height = 512;
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  let key = '';
  tex.set = (stops) => {
    const k = JSON.stringify(stops); if (k === key) return; key = k;
    const c = cv.getContext('2d'), g = c.createLinearGradient(0, 0, 0, 512);
    stops.forEach(([o, col]) => g.addColorStop(o, col)); c.fillStyle = g; c.fillRect(0, 0, 4, 512); tex.needsUpdate = true;
  };
  return tex;
}
let CLOUDTEX = null;
export function cloudTexture() {
  if (CLOUDTEX) return CLOUDTEX;
  const cv = document.createElement('canvas'); cv.width = cv.height = 256;
  const c = cv.getContext('2d'), r = M.mulberry32(7);
  for (let i = 0; i < 26; i++) {
    const x = 128 + (r() - 0.5) * 150, y = 140 + (r() - 0.5) * 60 - Math.abs(x - 128) * 0.15, rad = 30 + r() * 45;
    const g = c.createRadialGradient(x, y - rad * 0.25, 0, x, y, rad);
    g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.55, 'rgba(250,250,255,0.7)'); g.addColorStop(1, 'rgba(235,240,250,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, rad, 0, Math.PI * 2); c.fill();
  }
  // soft grey belly
  c.globalCompositeOperation = 'source-atop';
  const b = c.createLinearGradient(0, 120, 0, 220); b.addColorStop(0, 'rgba(160,170,200,0)'); b.addColorStop(1, 'rgba(150,160,190,0.45)');
  c.fillStyle = b; c.fillRect(0, 0, 256, 256);
  CLOUDTEX = new THREE.CanvasTexture(cv); CLOUDTEX.colorSpace = THREE.SRGBColorSpace;
  return CLOUDTEX;
}
// a field of cloud sprites; update(dx, tint) wraps them along x
export function cloudField(scene, { n = 90, x = [-90, 90], y = [-9, -5], z = [-90, 10], s = [10, 22], seed = 3 } = {}) {
  const r = M.mulberry32(seed), mat = new THREE.SpriteMaterial({ map: cloudTexture(), depthWrite: false, transparent: true, fog: true, color: 0xffffff });
  const list = [];
  for (let i = 0; i < n; i++) {
    const sp = new THREE.Sprite(mat); const sc = M.lerp(s[0], s[1], r());
    sp.scale.set(sc * 1.6, sc * 0.8, 1);
    sp.position.set(M.lerp(x[0], x[1], r()), M.lerp(y[0], y[1], r()), M.lerp(z[0], z[1], r()));
    sp.userData.x0 = sp.position.x; scene.add(sp); list.push(sp);
  }
  const span = x[1] - x[0];
  return {
    mat, list,
    update(dx, tint = 0xffffff) {
      mat.color.set(tint);
      for (const sp of list) sp.position.x = x[0] + ((((sp.userData.x0 - x[0] - dx) % span) + span) % span);
    },
  };
}

// ------------------------------------------------------------------ airliners
function roundRectShape(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2; r = Math.min(r, w / 2, h / 2);
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
}
export { roundRectShape };
export function rrPath(w, h, r, cx = 0, cy = 0) {
  const p = new THREE.Path(), x = cx - w / 2, y = cy - h / 2; r = Math.min(r, w / 2, h / 2);
  p.moveTo(x + r, y); p.lineTo(x + w - r, y); p.quadraticCurveTo(x + w, y, x + w, y + r); p.lineTo(x + w, y + h - r);
  p.quadraticCurveTo(x + w, y + h, x + w - r, y + h); p.lineTo(x + r, y + h); p.quadraticCurveTo(x, y + h, x, y + h - r);
  p.lineTo(x, y + r); p.quadraticCurveTo(x, y, x + r, y); return p;
}

// fuselage radius profile along the axis (x from tail to nose)
const PROFILE = [[-6.6, 0.0], [-6.5, 0.16], [-6.0, 0.36], [-5.0, 0.68], [-4.0, 0.9], [-3.0, 0.99], [-2.0, 1.0], [4.0, 1.0], [4.8, 0.96], [5.4, 0.85], [5.9, 0.66], [6.25, 0.42], [6.45, 0.18], [6.52, 0.0]];
const radiusAt = (x) => { for (let i = 1; i < PROFILE.length; i++) if (x <= PROFILE[i][0]) { const [x0, r0] = PROFILE[i - 1], [x1, r1] = PROFILE[i]; const k = (x - x0) / (x1 - x0); const s = k * k * (3 - 2 * k); return M.lerp(r0, r1, (x1 - x0) > 1.5 ? k : s); } return 0; };
const upsweep = (x) => (x < -3 ? 0.11 * (-3 - x) ** 1.4 : 0);

function fuselagePart(x0, x1, paint) {
  const pts = [];
  const n = Math.max(8, Math.round((x1 - x0) * 10));
  for (let i = 0; i <= n; i++) { const x = M.lerp(x0, x1, i / n); pts.push(new THREE.Vector2(Math.max(0.001, radiusAt(x)), x)); }
  const g = new THREE.LatheGeometry(pts, 64);
  g.rotateZ(-Math.PI / 2); // lathe axis y -> world +x
  const pos = g.attributes.position, colors = [];
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const r = Math.hypot(y, z) || 1, ny = y / r;
    pos.setY(i, y + upsweep(x));
    paint(c, x, ny, z / r); colors.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
}

export function makeAirliner({ comet = false } = {}) {
  const root = new THREE.Group(), front = new THREE.Group(), rear = new THREE.Group(); root.add(front, rear);
  const white = new THREE.Color(comet ? 0xe9edf2 : 0xf7f8fa), belly = new THREE.Color(comet ? 0xb9c2cf : 0xc9d0da);
  const accent = new THREE.Color(comet ? 0x2c5aa0 : COL.orange), accent2 = new THREE.Color(comet ? 0x2c5aa0 : COL.navy);
  const paint = (c, x, ny, nz) => {
    if (ny < -0.42) c.copy(belly);
    else if (ny > -0.16 && ny < -0.04 && x > -4.6 && x < 5.6) c.copy(accent);
    else if (!comet && ny > -0.28 && ny <= -0.16 && x > -4.6 && x < 5.4) c.copy(accent2);
    else c.copy(white);
  };
  const skin = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: comet ? 0.28 : 0.32, metalness: comet ? 0.45 : 0.05, clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: 1.0 });
  const split = -1.6;
  const fF = new THREE.Mesh(fuselagePart(split, 6.52, paint), skin), fR = new THREE.Mesh(fuselagePart(-6.6, split, paint), skin);
  fF.castShadow = fR.castShadow = true; front.add(fF); rear.add(fR);
  // windows
  const winMat = new THREE.MeshPhysicalMaterial({ color: 0x18233f, roughness: 0.12, metalness: 0.2, clearcoat: 1, emissive: 0x000000, envMapIntensity: 1.2 });
  const wg = comet ? new THREE.ShapeGeometry(roundRectShape(0.3, 0.3, 0.035), 4) : new THREE.ShapeGeometry(roundRectShape(0.2, 0.3, 0.1), 10);
  const ny = 0.3, nz = Math.sqrt(1 - ny * ny);
  const windows = [];
  for (let x = -4.0; x <= 4.6; x += comet ? 0.58 : 0.42) {
    if (!comet && Math.abs(x - 3.95) < 0.25) continue; // door gap
    for (const side of [1, -1]) {
      const w = new THREE.Mesh(wg, winMat);
      w.position.set(x, ny * 1.004 + upsweep(x), side * nz * 1.004);
      w.lookAt(x, ny * 3, side * nz * 3); // face outward along the normal
      (x > split ? front : rear).add(w); if (side > 0) windows.push(w);
    }
  }
  // cockpit windows
  const cg = new THREE.ShapeGeometry(roundRectShape(0.34, 0.2, 0.05), 4);
  for (const [dx, side] of [[0, 1], [0, -1], [0.32, 1], [0.32, -1]]) {
    const x = 5.55 + dx, r = radiusAt(x), a = side * (0.42 + dx * 0.8);
    const w = new THREE.Mesh(cg, winMat); w.position.set(x, r * 0.62, Math.sin(a) * r * 0.78);
    w.lookAt(x + 0.6, r * 2.0, Math.sin(a) * r * 2.5); front.add(w);
  }
  // door outline (modern)
  if (!comet) {
    const dg = new THREE.EdgesGeometry(new THREE.PlaneGeometry(0.42, 0.8));
    for (const side of [1, -1]) { const d = new THREE.LineSegments(dg, new THREE.LineBasicMaterial({ color: 0x9aa4b5 })); d.position.set(3.95, 0.05, side * 1.004); d.rotation.y = side > 0 ? 0 : Math.PI; front.add(d); }
  }
  // wings
  const wing = new THREE.Shape();
  wing.moveTo(1.7, 0); wing.lineTo(-1.5, 0); wing.lineTo(-3.6, 6.4); wing.lineTo(-2.7, 6.4); wing.lineTo(1.7, 0);
  const wingGeo = new THREE.ExtrudeGeometry(wing, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2, curveSegments: 4 });
  const wingMat = new THREE.MeshPhysicalMaterial({ color: comet ? 0xdfe5ec : 0xe8ecf2, roughness: 0.35, metalness: comet ? 0.4 : 0.1, clearcoat: 0.3, side: THREE.DoubleSide });
  for (const side of [1, -1]) {
    const w = new THREE.Mesh(wingGeo, wingMat); w.castShadow = true;
    w.rotation.x = side * -Math.PI / 2 + side * 0.07; w.position.set(0.9, -0.55, -side * 0.6); w.scale.z = 1;
    front.add(w);
    if (!comet) {
      const wl = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.05), new THREE.MeshStandardMaterial({ color: COL.orange, roughness: 0.4 }));
      wl.position.set(-2.35, -0.25, side * 7.0); wl.rotation.z = 0.35; front.add(wl);
      // engine nacelle
      const prof = [[0.36, -1.0], [0.47, -0.8], [0.5, -0.2], [0.48, 0.5], [0.43, 0.9], [0.34, 1.0]].map(([r, y]) => new THREE.Vector2(r, y));
      const nac = new THREE.Mesh(new THREE.LatheGeometry(prof, 40), new THREE.MeshPhysicalMaterial({ color: 0xdfe4ea, roughness: 0.3, metalness: 0.2, clearcoat: 0.5, side: THREE.DoubleSide }));
      nac.rotation.z = -Math.PI / 2; nac.position.set(1.35, -1.25, side * 2.55); nac.castShadow = true; front.add(nac);
      const lip = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.06, 10, 40), new THREE.MeshStandardMaterial({ color: 0xb7c0cc, metalness: 0.7, roughness: 0.25 }));
      lip.rotation.y = Math.PI / 2; lip.position.set(2.36, -1.25, side * 2.55); front.add(lip);
      const fan = new THREE.Mesh(new THREE.CircleGeometry(0.4, 32), new THREE.MeshStandardMaterial({ color: 0x1d2433, roughness: 0.6 }));
      fan.rotation.y = Math.PI / 2; fan.position.set(2.2, -1.25, side * 2.55); front.add(fan);
      const spin = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 20), new THREE.MeshStandardMaterial({ color: 0xc9d0da, metalness: 0.6, roughness: 0.3 }));
      spin.rotation.z = -Math.PI / 2; spin.position.set(2.32, -1.25, side * 2.55); front.add(spin);
      const pyl = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.45, 0.12), wingMat); pyl.position.set(1.1, -0.85, side * 2.55); front.add(pyl);
    } else {
      for (const k of [0.95, 1.55]) {
        const intake = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.28, 4, 12), new THREE.MeshStandardMaterial({ color: 0x232a36, roughness: 0.5 }));
        intake.rotation.x = Math.PI / 2; intake.position.set(1.62, -0.5, side * k); front.add(intake);
      }
    }
  }
  // tail
  const hs = new THREE.Shape(); hs.moveTo(0.7, 0); hs.lineTo(-0.9, 0); hs.lineTo(-1.9, 2.5); hs.lineTo(-1.3, 2.5); hs.lineTo(0.7, 0);
  const hg = new THREE.ExtrudeGeometry(hs, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.035, bevelSegments: 2 });
  for (const side of [1, -1]) { const h = new THREE.Mesh(hg, wingMat); h.rotation.x = side * -Math.PI / 2; h.position.set(-5.2, 0.35 + upsweep(-5.2), side * 0.2); rear.add(h); }
  const fin = new THREE.Shape(); fin.moveTo(0.4, 0); fin.lineTo(-2.2, 0); fin.lineTo(-3.4, 3.1); fin.lineTo(-2.45, 3.1); fin.lineTo(0.4, 0);
  const fg = new THREE.ExtrudeGeometry(fin, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 });
  const finMat = new THREE.MeshPhysicalMaterial({ color: comet ? 0xe9edf2 : COL.orange, roughness: 0.32, clearcoat: 0.6 });
  const finM = new THREE.Mesh(fg, finMat); finM.position.set(-3.4, 0.62 + upsweep(-3.4), -0.065); finM.castShadow = true; rear.add(finM);
  // brand mark on the fin: "?!" (modern) / blue stripe (comet)
  const tex = G.canvasTexture(256, 256);
  tex.draw((c, w, h) => {
    if (comet) { c.fillStyle = '#2c5aa0'; c.fillRect(0, 110, w, 36); return; }
    c.fillStyle = '#ffffff'; c.font = '900 170px Display'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?!', w / 2, h / 2 + 6);
  });
  for (const side of [1, -1]) {
    const dec = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    dec.position.set(-5.0, 2.25 + upsweep(-5.0) * 0.4, side * 0.08); dec.rotation.y = side > 0 ? 0 : Math.PI; rear.add(dec);
  }
  return { root, front, rear, windows, winMat, split };
}
