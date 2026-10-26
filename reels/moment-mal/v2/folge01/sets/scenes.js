// The five 3-D sets of episode 1. Each update(t, u, o) sets everything from its arguments.
import * as G from '../lib/gl.js';
import * as M from '../lib/motion.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { COL, makeOle, poseOle, voEnv, gradientTexture, cloudField, makeAirliner, roundRectShape, rrPath } from './common.js';
const { THREE } = G;
const v3 = (a) => new THREE.Vector3(...a);
const lerpV = (a, b, k) => a.map((x, i) => M.lerp(x, b[i], k));

function shadowKey(scene, pos, target = [0, 0, 0], intensity = 2.6, color = 0xfff1e2, size = 6) {
  const k = new THREE.DirectionalLight(color, intensity); k.position.set(...pos); k.target.position.set(...target);
  k.castShadow = true; k.shadow.mapSize.set(1024, 1024); const c = k.shadow.camera; c.left = -size; c.right = size; c.top = size; c.bottom = -size; c.near = 0.5; c.far = 40;
  k.shadow.bias = -0.0005; k.shadow.normalBias = 0.02;
  scene.add(k, k.target); return k;
}

// ================================================================== CABIN
export function cabinSet() {
  const scene = new THREE.Scene(), camera = G.camera(38);
  scene.environment = G.ENV; scene.background = new THREE.Color(0x0d1630);
  scene.add(new THREE.HemisphereLight(0xfff4e6, 0x2a3350, 0.45));
  const key = shadowKey(scene, [5, 7, 7], [0.6, 2, 0.6], 1.6, 0xfff1e2, 5);
  const win = new THREE.PointLight(0xcfe6ff, 6, 6, 1.6); win.position.set(0, 2.5, 0.6); scene.add(win);
  // outside: sky + clouds seen through the window
  const skyTex = gradientTexture();
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(60, 34), new THREE.MeshBasicMaterial({ map: skyTex, fog: false }));
  sky.position.set(0, 2, -14); scene.add(sky);
  const clouds = cloudField(scene, { n: 26, x: [-22, 22], y: [-1.5, 2.2], z: [-12, -3], s: [3, 6], seed: 11 });
  const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xfff1c4, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  sun.position.set(-6, 4.5, -13); sun.scale.set(9, 9, 1); scene.add(sun);
  // wall with a real hole
  const ws = roundRectShape(10, 5.4, 0.05); ws.holes.push(rrPath(0.92, 1.32, 0.44, 0, 0.1));
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xcbc2b4, roughness: 0.75 });
  const wall = new THREE.Mesh(new THREE.ExtrudeGeometry(ws, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.09, bevelSegments: 6, curveSegments: 40 }), wallMat);
  wall.position.set(0, 2.5, -0.28); wall.receiveShadow = true; scene.add(wall);
  const fs = roundRectShape(1.3, 1.72, 0.62); fs.holes.push(rrPath(0.94, 1.34, 0.45));
  const frame = new THREE.Mesh(new THREE.ExtrudeGeometry(fs, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 5, curveSegments: 40 }), new THREE.MeshStandardMaterial({ color: 0xf4f6f9, roughness: 0.35 }));
  frame.position.set(0, 2.6, 0.02); scene.add(frame);
  const shade = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.36, 0.03, 3, 0.012), new THREE.MeshStandardMaterial({ color: 0xece6da, roughness: 0.5 }));
  shade.position.set(0, 3.12, -0.1); scene.add(shade);
  // panes (inside the hole) and the breather hole on the middle pane
  const paneGeo = new THREE.ShapeGeometry(roundRectShape(0.88, 1.28, 0.42), 24);
  const pane = (c, o) => new THREE.MeshPhysicalMaterial({ color: c, transparent: true, opacity: o, roughness: 0.05, metalness: 0, side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 1.5, emissive: 0x000000 });
  const panes = new THREE.Group(); panes.position.set(0, 2.6, 0); scene.add(panes);
  const pOut = new THREE.Mesh(paneGeo, pane(0x9fcfff, 0.05)), pMid = new THREE.Mesh(paneGeo, pane(0xa9d4ff, 0.05)), pIn = new THREE.Mesh(paneGeo, pane(0xb9ddff, 0.04));
  const fog = new THREE.Mesh(paneGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }));
  const edge = new THREE.LineBasicMaterial({ color: 0x13203f, transparent: true, opacity: 0.9 });
  const edgeGeo = new THREE.BufferGeometry().setFromPoints(roundRectShape(0.88, 1.28, 0.42).getPoints(24));
  for (const p of [pOut, pMid, pIn]) { const l = new THREE.LineLoop(edgeGeo, edge); l.visible = false; p.add(l); p.userData.edge = l; }
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.026, 20), new THREE.MeshBasicMaterial({ color: 0x15203a })); hole.position.set(0, -0.5, 0.002); pMid.add(hole);
  panes.add(pOut, pMid, pIn, fog);
  // cabin furniture
  const fabric = new THREE.MeshStandardMaterial({ color: COL.navy2, roughness: 0.85 });
  const fabric2 = new THREE.MeshStandardMaterial({ color: 0x17244a, roughness: 0.85 });
  const seat = (x, z) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.PI / 2;
    const m = (geo, mat, p) => { const o = new THREE.Mesh(geo, mat); o.position.set(...p); o.castShadow = o.receiveShadow = true; g.add(o); return o; };
    m(new RoundedBoxGeometry(1.25, 0.3, 1.15, 4, 0.1), fabric, [0, 0.9, 0.05]);
    m(new RoundedBoxGeometry(1.25, 2.1, 0.26, 4, 0.11), fabric, [0, 1.95, -0.55]);
    m(new RoundedBoxGeometry(0.85, 0.42, 0.08, 3, 0.03), new THREE.MeshStandardMaterial({ color: 0xf2ebdf, roughness: 0.6 }), [0, 2.75, -0.4]);
    for (const s of [-1, 1]) m(new RoundedBoxGeometry(0.12, 0.1, 0.95, 3, 0.04), fabric2, [s * 0.68, 1.35, 0.05]);
    m(new RoundedBoxGeometry(0.1, 0.9, 0.9, 2, 0.04), new THREE.MeshStandardMaterial({ color: 0x8e97a8, metalness: 0.6, roughness: 0.35 }), [0, 0.45, 0.05]);
    scene.add(g); return g;
  };
  const seatA = seat(0.05, 1.0); seat(-2.5, 1.0);
  const bins = new THREE.Mesh(new RoundedBoxGeometry(10, 1.1, 1.7, 4, 0.12), new THREE.MeshStandardMaterial({ color: 0xf0eadf, roughness: 0.5 })); bins.position.set(0, 5.35, 0.7); scene.add(bins);
  const strip = new THREE.Mesh(new THREE.BoxGeometry(10, 0.05, 0.08), new THREE.MeshStandardMaterial({ color: 0xffe2b0, emissive: 0xffd08a, emissiveIntensity: 2 })); strip.position.set(0, 4.78, 1.5); scene.add(strip);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), new THREE.MeshStandardMaterial({ color: 0x2b3762, roughness: 0.95 })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 2.5); floor.receiveShadow = true; scene.add(floor);
  // Ole in the seat
  const ole = makeOle(2.05); ole.root.position.set(0, 0.8, 0.12); ole.root.rotation.y = 0; seatA.add(ole.root);
  return {
    scene, camera, ole, panes, pOut, pMid, pIn, fog, hole, seatA, bloom: 0.15, bloomThreshold: 0.95,
    // o: cam [pos, target, fov], sky [top, bottom], sunset, explode 0..1, glow 0..1, fogA, pose {...}
    update(t, u, o) {
      skyTex.set(o.sky || [[0, '#1f63d6'], [0.7, '#7fb8f5'], [1, '#a9d2ff']]);
      clouds.update(t * 2.2, o.cloudTint ?? 0xffffff);
      sun.material.color.set(o.sunset ? 0xffb070 : 0xfff1c4); sun.scale.setScalar(o.sunset ? 13 : 9);
      key.color.set(o.sunset ? 0xffc39a : 0xfff1e2); win.color.set(o.sunset ? 0xffb27a : 0xcfe6ff);
      const ex = o.explode || 0;
      panes.rotation.y = -0.55 * ex;
      pOut.position.set(0.5 * ex, 0, M.lerp(-0.2, 0.45, ex)); pMid.position.set(-0.15 * ex, 0, M.lerp(-0.12, 1.0, ex)); pIn.position.set(-0.8 * ex, 0, M.lerp(-0.04, 1.55, ex));
      fog.position.copy(pIn.position).add(new THREE.Vector3(0, 0, 0.004)); fog.material.opacity = o.fogA || 0;
      for (const p of [pOut, pMid, pIn]) { p.userData.edge.visible = ex > 0.25; p.material.opacity = M.lerp(0.05, 0.3, ex); }
      const gl = o.glow || 0; pOut.material.color.set(new THREE.Color(0x9fcfff).lerp(new THREE.Color(COL.orange), gl)); pOut.material.opacity = M.lerp(pOut.material.opacity, 0.55, gl);
      pOut.material.emissive.set(COL.orange).multiplyScalar(gl * 0.25);
      seatA.visible = o.hideOle ? false : true;
      const p = o.pose || {};
      const talk = voEnv(t) * (p.talk ?? 1);
      poseOle(ole, [['Sitting', 0.42, 1]], { morph: p.morph || {}, headYaw: (p.yaw || 0) + Math.sin(t * 1.3) * 0.04, headPitch: (p.pitch || 0) - talk * 0.08 + Math.sin(t * 2.1) * 0.02, headRoll: p.roll || 0 });
      ole.root.position.y = 0.8 + Math.sin(t * 2) * 0.005;
      const [pos, tgt, fov] = o.cam; camera.fov = fov || 38; camera.updateProjectionMatrix(); G.lookFrom(camera, pos, tgt);
    },
  };
}

let GLOW = null;
function glowTexture() {
  if (GLOW) return GLOW;
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const c = cv.getContext('2d');
  const g = c.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.15, 'rgba(255,250,230,0.8)'); g.addColorStop(0.5, 'rgba(255,230,180,0.15)'); g.addColorStop(1, 'rgba(255,220,160,0)');
  c.fillStyle = g; c.fillRect(0, 0, 256, 256); GLOW = new THREE.CanvasTexture(cv); GLOW.colorSpace = THREE.SRGBColorSpace; return GLOW;
}

// ================================================================== SKY (airliner + comet)
export function skySet() {
  const scene = new THREE.Scene(), camera = G.camera(36, 0.1, 600);
  scene.environment = G.ENV;
  const bg = gradientTexture(); scene.background = bg;
  scene.fog = new THREE.Fog(0xcfe6ff, 40, 160);
  const hemi = new THREE.HemisphereLight(0xdfefff, 0x6a7896, 1.0); scene.add(hemi);
  const sunL = new THREE.DirectionalLight(0xfff4e0, 3.0); sunL.position.set(-20, 30, 25); scene.add(sunL);
  const rim = new THREE.DirectionalLight(0xbfe0ff, 1.2); rim.position.set(20, 5, -20); scene.add(rim);
  const clouds = cloudField(scene, { n: 140, x: [-120, 120], y: [-16, -9], z: [-140, 30], s: [14, 30], seed: 5 });
  const high = cloudField(scene, { n: 18, x: [-120, 120], y: [8, 16], z: [-160, -60], s: [20, 40], seed: 9 });
  const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
  sun.position.set(-60, 18, -150); sun.scale.set(70, 70, 1); scene.add(sun);
  const jet = makeAirliner(); scene.add(jet.root);
  const comet = makeAirliner({ comet: true }); scene.add(comet.root);
  // debris for the break-up, precomputed
  const r = M.mulberry32(21), deb = [];
  const dm = new THREE.MeshStandardMaterial({ color: 0xd8dee6, metalness: 0.5, roughness: 0.4, side: THREE.DoubleSide });
  for (let i = 0; i < 26; i++) {
    const m = new THREE.Mesh(new THREE.TetrahedronGeometry(0.08 + r() * 0.16), dm);
    m.userData = { v: new THREE.Vector3(r() * 2 - 1, r() * 1.6 - 0.4, r() * 2 - 1).multiplyScalar(2.4), w: [r() * 8, r() * 8, r() * 8] };
    m.visible = false; scene.add(m); deb.push(m);
  }
  const mix = (a, b, k) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString();
  return {
    scene, camera, jet, comet, bloom: 0.3, bloomThreshold: 0.9,
    // o: mode 'jet'|'comet', dusk 0..1, sepia 0..1, sunset 0..1, dark 0..1, split (seconds since break, <0 none), cam [pos,tgt,fov], winGlow
    update(t, u, o) {
      const dusk = o.dusk || 0, sep = o.sepia || 0, ss = o.sunset || 0, dk = o.dark || 0;
      let top = '#2f7cf0', bot = '#cfe8ff';
      top = mix(top, '#231a3d', dusk); bot = mix(bot, '#5a4a6e', dusk);
      top = mix(top, '#b98a55', sep); bot = mix(bot, '#f1d8ad', sep);
      top = mix(top, '#3b1d3a', dk); bot = mix(bot, '#8a3b3b', dk);
      top = mix(top, '#ff7a59', ss); bot = mix(bot, '#ffd68a', ss);
      bg.set([[0, top], [0.62, bot], [1, bot]]);
      scene.fog.color.set(bot);
      const ct = new THREE.Color(0xffffff).lerp(new THREE.Color(0x8a7d99), dusk).lerp(new THREE.Color(0xf5dfba), sep).lerp(new THREE.Color(0xa07070), dk).lerp(new THREE.Color(0xffd9bf), ss);
      clouds.update(t * 26, ct); high.update(t * 6, ct);
      sunL.color.set(new THREE.Color(0xfff4e0).lerp(new THREE.Color(0xffb27a), ss).lerp(new THREE.Color(0xffd9a8), sep));
      sunL.intensity = 3.0 * (1 - 0.55 * dusk) * (1 - 0.5 * dk);
      sun.material.color.set(new THREE.Color(0xfff6d8).lerp(new THREE.Color(0xffa060), ss)); sun.material.opacity = 1 - 0.8 * dusk - 0.8 * dk;
      sun.position.y = M.lerp(18, 4, ss);
      jet.root.visible = o.mode === 'jet'; comet.root.visible = o.mode === 'comet';
      const bob = Math.sin(t * 1.1) * 0.25;
      for (const p of [jet, comet]) { p.root.position.set(0, bob, 0); p.root.rotation.set(Math.sin(t * 0.8) * 0.03, 0, Math.sin(t * 0.7) * 0.015); }
      jet.winMat.emissive.set(COL.yellow).multiplyScalar((o.winGlow || 0) * 0.9);
      // break-up: front pitches, rear falls away; debris from the split
      const k = o.split ?? -1, sp = M.E.inOutCubic(M.clamp(k / 2.6));
      comet.front.position.set(0.9 * sp, -0.5 * sp, 0); comet.front.rotation.set(0, 0, -0.25 * sp);
      comet.rear.position.set(-1.4 * sp, -1.8 * sp, 0.3 * sp); comet.rear.rotation.set(0.3 * sp, 0, 0.6 * sp);
      deb.forEach((d) => {
        d.visible = o.mode === 'comet' && k > 0 && k < 5;
        if (!d.visible) return;
        d.position.copy(d.userData.v).multiplyScalar(k).add(new THREE.Vector3(comet.split, bob - 0.6 * k * k * 0.4, 0));
        d.rotation.set(d.userData.w[0] * k, d.userData.w[1] * k, d.userData.w[2] * k);
      });
      const [pos, tgt, fov] = o.cam; camera.fov = fov || 36; camera.updateProjectionMatrix(); G.lookFrom(camera, pos, tgt, o.roll || 0);
    },
  };
}

// ================================================================== PRESSURE TUBE
export function tubeSet() {
  const scene = new THREE.Scene(), camera = G.camera(34);
  scene.environment = G.ENV;
  scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x1a2244, 0.8));
  shadowKey(scene, [-5, 8, 7], [0, 0, 0], 2.4, 0xfff1e2, 4);
  const rim = new THREE.DirectionalLight(COL.mint, 1.4); rim.position.set(6, 2, -6); scene.add(rim);
  const tube = new THREE.Group(); scene.add(tube);
  const rs = new THREE.Shape(); rs.absarc(0, 0, 1.7, 0, Math.PI * 2, false); const hp = new THREE.Path(); hp.absarc(0, 0, 1.56, 0, Math.PI * 2, true); rs.holes.push(hp);
  const ring = new THREE.Mesh(new THREE.ExtrudeGeometry(rs, { depth: 3.4, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 4, curveSegments: 72 }),
    [new THREE.MeshPhysicalMaterial({ color: 0xf6f7fa, roughness: 0.3, clearcoat: 0.6 }), new THREE.MeshStandardMaterial({ color: 0xffe9d2, roughness: 0.7 })]);
  ring.rotation.y = Math.PI / 2; ring.position.x = -1.7; ring.castShadow = ring.receiveShadow = true; tube.add(ring);
  const rimEdge = new THREE.Mesh(new THREE.TorusGeometry(1.63, 0.035, 12, 96), new THREE.MeshStandardMaterial({ color: COL.orange, emissive: COL.orange, emissiveIntensity: 0.6 }));
  rimEdge.rotation.y = Math.PI / 2; rimEdge.position.x = 1.74; tube.add(rimEdge);
  const floorM = new THREE.Mesh(new RoundedBoxGeometry(3.4, 0.08, 2.7, 2, 0.03), new THREE.MeshStandardMaterial({ color: 0x8792a8, roughness: 0.8 })); floorM.position.y = -0.78; floorM.receiveShadow = true; tube.add(floorM);
  const seatMat = new THREE.MeshStandardMaterial({ color: COL.navy2, roughness: 0.85 });
  for (let x = -1.25; x <= 1.3; x += 0.85) for (const z of [-0.95, -0.5, 0.5, 0.95]) {
    const s1 = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.14, 0.38, 2, 0.04), seatMat); s1.position.set(x, -0.6, z); tube.add(s1);
    const s2 = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.5, 0.38, 2, 0.04), seatMat); s2.position.set(x - 0.18, -0.38, z); tube.add(s2);
  }
  const ole = makeOle(0.62); ole.root.position.set(0.95, -0.74, 0.3); ole.root.rotation.y = Math.PI / 2 - 0.5; tube.add(ole.root);
  // pressure arrows
  const arrows = [];
  const am = new THREE.MeshStandardMaterial({ color: COL.orange, emissive: COL.orange, emissiveIntensity: 0.5, roughness: 0.4 });
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2, g = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1, 10), am); shaft.position.y = 0.5; g.add(shaft);
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.2, 14), am); g.add(head);
    g.position.set(1.0, Math.cos(a) * 0.45, Math.sin(a) * 0.45); g.rotation.x = a; tube.add(g); arrows.push({ g, shaft, head });
  }
  scene.background = new THREE.Color(0x111c3a);
  return {
    scene, camera, bloom: 0.35, bloomThreshold: 0.85,
    update(t, u, o) {
      const p = o.p || 0;
      tube.scale.set(1, 1 + 0.07 * p, 1 + 0.07 * p);
      tube.rotation.y = -0.7 + Math.sin(t * 0.25) * 0.05;
      for (const a of arrows) { const L = 0.15 + 0.85 * p; a.shaft.scale.y = L; a.shaft.position.y = L / 2; a.head.position.y = L + 0.08; a.g.visible = p > 0.03; }
      poseOle(ole, [['Sitting', 0.42, 1]], { headYaw: Math.sin(t * 0.9) * 0.3, headPitch: -voEnv(t) * 0.06, morph: { Surprised: p * 0.6 } });
      const [pos, tgt, fov] = o.cam; camera.fov = fov || 34; camera.updateProjectionMatrix(); G.lookFrom(camera, pos, tgt);
    },
  };
}

// ================================================================== SKIN PANEL
export function panelSet() {
  const scene = new THREE.Scene(), camera = G.camera(36);
  scene.environment = G.ENV; scene.background = new THREE.Color(0x0e1734);
  scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x1a2244, 0.5));
  const key = new THREE.DirectionalLight(0xfff1e2, 2.4); key.position.set(-4, 6, 8); scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fd8ff, 1.6); rim.position.set(6, -2, 4); scene.add(rim);
  const metal = new THREE.MeshPhysicalMaterial({ color: 0xc7cfdb, metalness: 0.85, roughness: 0.34, clearcoat: 0.2, envMapIntensity: 1.2 });
  const rivetGeo = new THREE.SphereGeometry(0.045, 10, 6), rivetMat = new THREE.MeshStandardMaterial({ color: 0xaab4c4, metalness: 0.9, roughness: 0.3 });
  const make = (kind) => {
    const g = new THREE.Group();
    const s = roundRectShape(6.4, 8.6, 0.12);
    s.holes.push(kind === 'sq' ? rrPath(1.6, 1.6, 0.05) : rrPath(1.6, 2.1, 0.8));
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3, curveSegments: 48 }), metal);
    g.add(m);
    const pts = [];
    for (let x = -2.9; x <= 2.91; x += 0.42) pts.push([x, -4.0], [x, 4.0]);
    for (let y = -3.6; y <= 3.61; y += 0.42) pts.push([-3.0, y], [3.0, y]);
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2;
      if (kind === 'sq') { const c = Math.cos(a), sn = Math.sin(a), q = 1 / Math.pow(Math.abs(c) ** 10 + Math.abs(sn) ** 10, 0.1); pts.push([c * q * 1.18, sn * q * 1.18]); }
      else pts.push([Math.cos(a) * 1.18, Math.sin(a) * 1.45]);
    }
    const inst = new THREE.InstancedMesh(rivetGeo, rivetMat, pts.length), mt = new THREE.Matrix4();
    pts.forEach(([x, y], i) => { mt.makeTranslation(x, y, 0.15); inst.setMatrixAt(i, mt); });
    g.add(inst);
    scene.add(g); return g;
  };
  const sq = make('sq'), rd = make('rd');
  const skyTex = gradientTexture(); skyTex.set([[0, '#3d8bff'], [1, '#d4ecff']]);
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ map: skyTex })); sky.position.z = -0.8; scene.add(sky);
  return {
    scene, camera, bloom: 0.2, bloomThreshold: 0.9,
    update(t, u, o) {
      sq.visible = !o.round; rd.visible = !!o.round;
      const s = o.pop ?? 1; (o.round ? rd : sq).scale.setScalar(s);
      const [pos, tgt, fov] = o.cam; camera.fov = fov || 36; camera.updateProjectionMatrix(); G.lookFrom(camera, pos, tgt);
    },
  };
}

// ================================================================== STUDIO (Ole on navy)
export function studioSet() {
  const scene = new THREE.Scene(), camera = G.camera(30);
  scene.environment = G.ENV; scene.background = null;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x223355, 0.6));
  shadowKey(scene, [-4, 9, 6], [0, 1, 0], 2.4, 0xfff4ea, 3);
  const rim = new THREE.DirectionalLight(0x9fe8ff, 2.2); rim.position.set(5, 4, -6); scene.add(rim);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(4, 64), new THREE.ShadowMaterial({ opacity: 0.4 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const ole = makeOle(2.6); scene.add(ole.root);
  return {
    scene, camera, ole,
    // o.layers [[clip, time, w]], morph, yaw (body), cam
    update(t, u, o) {
      poseOle(ole, o.layers, { morph: o.morph || {}, headPitch: -voEnv(t) * 0.08 * (o.talk ?? 1), headYaw: o.headYaw || 0 });
      ole.root.rotation.y = o.yaw || 0; ole.root.position.set(o.x || 0, o.y || 0, 0);
      const [pos, tgt, fov] = o.cam; camera.fov = fov || 30; camera.updateProjectionMatrix(); G.lookFrom(camera, pos, tgt);
    },
  };
}
