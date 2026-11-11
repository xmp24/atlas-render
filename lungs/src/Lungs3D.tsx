import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, interpolateColors, random, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';

const FPS = 30;
const W = 720, H = 1280;
const FONT = '"DejaVu Sans", Arial, sans-serif';
const END_T = 14.3;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
type V3 = [number, number, number];

const TUMOR: V3 = [0.66, 1.12, 0.3];
const STAGES: {t: number; label: string; cap: string[]; cigs: number; d: number; pos: V3; tgt: V3; pills: {p: V3; dx: number; dy: number; text: string; c: string}[]}[] = [
  {t: 0, label: 'Mes 1', cap: ['el humo', 'paraliza', 'tus cilios'], cigs: 600, d: 0.05, pos: [0.8, 1.7, 8.6], tgt: [0, 0.55, 0],
    pills: [{p: [0, 2.0, 0.1], dx: -150, dy: -40, text: 'TRÁQUEA', c: '#2f6fe0'}]},
  {t: 2, label: 'Mes 3', cap: ['el moco', 'se acumula', 'y llega la tos'], cigs: 1800, d: 0.15, pos: [-3.1, 1.4, 5.4], tgt: [0, 0.75, 0],
    pills: [{p: [-0.55, 1.0, 0.36], dx: -60, dy: -170, text: 'MOCO', c: '#3c9a2e'}, {p: [0.3, 1.42, 0.05], dx: 90, dy: -150, text: 'BRONQUIOS', c: '#d23a3a'}]},
  {t: 4, label: 'Mes 6', cap: ['el alquitrán', 'se pega', 'a tus pulmones'], cigs: 3600, d: 0.27, pos: [3.3, 1.0, 5.6], tgt: [0.05, 0.7, 0],
    pills: [{p: [0.55, 0.85, 0.4], dx: 40, dy: -230, text: 'ALQUITRÁN', c: '#5a3d2b'}]},
  {t: 6, label: 'Año 1', cap: ['bronquitis:', 'tus bronquios', 'siempre inflamados'], cigs: 7300, d: 0.4, pos: [1.2, 2.3, 4.5], tgt: [0, 1.1, 0],
    pills: [{p: [-0.25, 1.48, 0.08], dx: -110, dy: -190, text: 'BRONQUITIS', c: '#d23a3a'}]},
  {t: 8, label: 'Año 5', cap: ['enfisema:', 'los alvéolos', 'se rompen'], cigs: 36500, d: 0.58, pos: [-3.4, 0.9, 5.3], tgt: [0, 0.7, 0],
    pills: [{p: [-0.6, 0.75, 0.32], dx: 40, dy: -260, text: 'ALVÉOLOS ROTOS', c: '#7b3fd0'}]},
  {t: 10, label: 'Año 10', cap: ['EPOC:', 'te ahogas', 'subiendo escaleras'], cigs: 73000, d: 0.78, pos: [2.3, 1.3, 9.0], tgt: [0, 0.3, 0],
    pills: [{p: [-0.55, 1.05, 0.35], dx: -70, dy: -210, text: 'EPOC', c: '#e07a1f'}, {p: [0.14, 0.52, 0.45], dx: 130, dy: -60, text: 'CORAZÓN', c: '#d23a3a'}]},
  {t: 12, label: 'Año 20', cap: ['cáncer de pulmón:', 'hasta 30 veces', 'más riesgo'], cigs: 146000, d: 0.97, pos: [3.2, 1.5, 4.0], tgt: [0.45, 0.85, 0.15],
    pills: [{p: TUMOR, dx: -40, dy: -220, text: 'TUMOR', c: '#c2185b'}]},
];
const START = {pos: [0.0, 2.2, 16] as V3, tgt: [0, 0.3, 0] as V3};
const ENDCAM = {pos: [0.0, 1.2, 15] as V3, tgt: [0, 0.3, 0] as V3};

const stageAt = (s: number) => STAGES.reduce((a, st, k) => (s >= st.t ? k : a), 0);
const damageAt = (s: number) => interpolate(s, STAGES.flatMap((st) => [st.t, st.t + 0.8]), STAGES.flatMap((st, k) => [k ? STAGES[k - 1].d : 0, st.d]), {extrapolateRight: 'clamp'});

// ---------- camera
const camAt = (s: number) => {
  const si = stageAt(s);
  const st = STAGES[si];
  const ls = s - st.t;
  const from = si ? STAGES[si - 1] : START;
  const k = interpolate(ls, [0, 0.9], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const lerp3 = (a: V3, b: V3, t: number) => a.map((v, i) => v + (b[i] - v) * t) as V3;
  let pos = lerp3(from.pos, st.pos, k), tgt = lerp3(from.tgt, st.tgt, k);
  // slow orbit + dolly within the stage
  const ang = ls * 0.06 * (si % 2 ? -1 : 1);
  const dx = pos[0] - tgt[0], dz = pos[2] - tgt[2];
  const dolly = 1 - Math.min(ls, 2.3) * 0.035;
  pos = [tgt[0] + (dx * Math.cos(ang) - dz * Math.sin(ang)) * dolly, pos[1], tgt[2] + (dx * Math.sin(ang) + dz * Math.cos(ang)) * dolly];
  if (s >= END_T) {
    const e = interpolate(s, [END_T, END_T + 0.6], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
    pos = lerp3(pos, ENDCAM.pos, e); tgt = lerp3(tgt, ENDCAM.tgt, e);
  }
  return {pos, tgt};
};
const makeCam = (pos: V3, tgt: V3) => {
  const c = new THREE.PerspectiveCamera(32, W / H, 0.05, 100);
  c.position.set(...pos); c.lookAt(...tgt); c.updateMatrixWorld(); c.updateProjectionMatrix();
  return c;
};

// ---------- procedural helpers
const nz = (x: number, y: number, z: number) =>
  Math.sin(x * 3.1 + Math.sin(y * 2.7) * 1.3) * Math.sin(y * 3.7 + Math.sin(z * 2.3)) * Math.sin(z * 2.9 + Math.sin(x * 3.3)) +
  0.5 * Math.sin(x * 7.3 + y * 5.1) * Math.sin(z * 6.7 - y * 4.3);

const deformSphere = (seg: number, fn: (v: THREE.Vector3) => void) => {
  const g = new THREE.SphereGeometry(1, seg, seg);
  const p = g.attributes.position; const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); }
  g.computeVertexNormals();
  return g;
};

const lungGeo = (side: number) => deformSphere(140, (v) => {
  let {x, y, z} = v;
  const w = y > 0 ? Math.sqrt(Math.max(0.05, 1 - 0.5 * y * y)) : 1 - 0.06 * y * y;
  x *= w; z *= w;
  if (x * side < 0) x *= 0.5; // flat medial face
  if (side > 0 && x * side < 0.15 && y < 0.05 && z > 0) x += side * 0.28 * (1 - Math.abs(y + 0.4)) * z; // cardiac notch
  if (y < -0.55) y = -0.55 + (y + 0.55) * 0.35 + 0.12 * (1 - Math.min(1, x * x + z * z));
  const r = 1 + 0.035 * nz(x * 2, y * 2, z * 2);
  v.set(x * 0.5 * r, y * 0.8 * r, z * 0.46 * r);
});

const lumpy = (amp: number, freq: number, sx: number, sy: number, sz: number, seg = 64) =>
  deformSphere(seg, (v) => { const r = 1 + amp * nz(v.x * freq, v.y * freq, v.z * freq); v.set(v.x * sx * r, v.y * sy * r, v.z * sz * r); });

const heartGeo = () => deformSphere(96, (v) => {
  let {x, y, z} = v;
  const top = y > 0.2 ? 1 + 0.25 * Math.sin(Math.abs(x) * 6) * (y - 0.2) : 1; // two atria lobes
  const taper = y < 0 ? 1 + y * 0.45 : 1; // pointy apex
  x *= taper * top; z *= taper * 0.85;
  const r = 1 + 0.025 * nz(x * 3, y * 3, z * 3);
  v.set(x * 0.24 * r, y * 0.3 * r, z * 0.22 * r);
});

const bumpyTube = (pts: V3[], radius: number, segs: number, bumps: number, amp: number, radial = 20) => {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
  const g = new THREE.TubeGeometry(curve, segs, radius, radial, false);
  const p = g.attributes.position; const v = new THREE.Vector3();
  for (let i = 0; i <= segs; i++) {
    const u = i / segs; const c = curve.getPointAt(u);
    const f = 1 + amp * Math.pow(Math.abs(Math.sin(u * bumps * Math.PI)), 0.6) - amp * 0.5;
    for (let j = 0; j <= radial; j++) {
      const idx = i * (radial + 1) + j; v.fromBufferAttribute(p, idx);
      v.sub(c).multiplyScalar(f).add(c); p.setXYZ(idx, v.x, v.y, v.z);
    }
  }
  g.computeVertexNormals();
  return g;
};
const tube = (pts: V3[], r: number, segs = 64) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), segs, r, 14, false);

const canvasTex = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  draw(cv.getContext('2d')!);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return {cv, t};
};
const bumpTex = (seed: string, cells: number) => canvasTex(512, 512, (c) => {
  c.fillStyle = '#808080'; c.fillRect(0, 0, 512, 512);
  for (let i = 0; i < cells; i++) {
    const x = random(`${seed}x${i}`) * 512, y = random(`${seed}y${i}`) * 512, r = 4 + random(`${seed}r${i}`) * 16;
    const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0.0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(40,40,40,0.25)'; c.lineWidth = 1.2; c.stroke();
  }
}).t;
const softSprite = () => canvasTex(128, 128, (c) => {
  const g = c.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(0.4, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g; c.fillRect(0, 0, 128, 128);
}).t;

const Env: React.FC = () => {
  const {gl, scene} = useThree();
  useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; gl.outputColorSpace = THREE.SRGBColorSpace;
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  }, [gl, scene]);
  return null;
};
const CamRig: React.FC<{pos: V3; tgt: V3; shake: V3}> = ({pos, tgt, shake}) => {
  const {camera} = useThree();
  camera.position.set(pos[0] + shake[0], pos[1] + shake[1], pos[2]);
  camera.lookAt(tgt[0] + shake[0] * 0.5, tgt[1] + shake[1] * 0.5, tgt[2]);
  (camera as THREE.PerspectiveCamera).fov = 32; camera.updateProjectionMatrix();
  return null;
};

// ---------- the 3D body
const Body: React.FC<{s: number; d: number; si: number; ls: number}> = ({s, d, si, ls}) => {
  const A = useMemo(() => {
    const lungTex = canvasTex(1024, 512, () => {});
    const pattern = canvasTex(1024, 512, (c) => {
      c.clearRect(0, 0, 1024, 512);
      for (let i = 0; i < 900; i++) { // lobules
        const x = random(`px${i}`) * 1024, y = random(`py${i}`) * 512, r = 6 + random(`pr${i}`) * 14;
        c.strokeStyle = `rgba(120,20,40,${0.12 + random(`pa${i}`) * 0.15})`; c.lineWidth = 1.4; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.stroke();
      }
      for (let i = 0; i < 40; i++) { // veins
        let x = random(`vx${i}`) * 1024, y = random(`vy${i}`) * 512;
        c.strokeStyle = i % 3 ? 'rgba(110,60,200,0.45)' : 'rgba(200,40,60,0.45)'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x, y);
        for (let k = 0; k < 9; k++) { x += (random(`vdx${i}${k}`) - 0.5) * 60; y += (random(`vdy${i}${k}`) - 0.3) * 40; c.lineTo(x, y); }
        c.stroke();
      }
    });
    const tissueBump = bumpTex('lung', 1400);
    const organBump = bumpTex('org', 500);
    const sprite = softSprite();
    const geo = {
      lungR: lungGeo(-1), lungL: lungGeo(1), heart: heartGeo(),
      liver: deformSphere(80, (v) => { const t = 1 - (v.x + 1) * 0.28; const r = 1 + 0.03 * nz(v.x * 3, v.y * 3, v.z * 3); v.set(v.x * 0.72 * r, v.y * 0.3 * t * r, v.z * 0.45 * t * r); }),
      stomach: deformSphere(80, (v) => { const b = Math.sin((v.x + 1) * 1.6) * 0.35; const r = 1 + 0.03 * nz(v.x * 3, v.y * 3, v.z * 3); v.set(v.x * 0.36 * r, (v.y * 0.24 - b * 0.4 + v.x * 0.15) * r, v.z * 0.22 * r); }),
      kidney: deformSphere(48, (v) => { const dent = v.x < -0.5 ? (v.x + 0.5) * 0.6 * (1 - Math.abs(v.y)) : 0; v.set((v.x - dent) * 0.15, v.y * 0.27, v.z * 0.12); }),
      spleen: lumpy(0.03, 3, 0.13, 0.27, 0.11, 48),
      gall: lumpy(0.02, 3, 0.07, 0.12, 0.07, 32),
      bladder: lumpy(0.02, 3, 0.22, 0.19, 0.18, 48),
      tumor: lumpy(0.22, 2.4, 0.15, 0.13, 0.13, 72),
      ilium: lumpy(0.04, 3, 0.42, 0.36, 0.08, 48),
      diaphragm: (() => { const g = new THREE.SphereGeometry(1, 64, 24, 0, Math.PI * 2, 0, Math.PI * 0.42); g.scale(0.9, 0.38, 0.56); return g; })(),
      torso: (() => {
        const prof: [number, number][] = [[0.01, -2.85], [0.7, -2.8], [1.0, -2.55], [1.04, -2.15], [0.95, -1.6], [0.8, -1.0], [0.76, -0.55], [0.86, 0.0], [0.96, 0.6], [1.03, 1.15], [1.12, 1.55], [1.05, 1.82], [0.7, 2.0], [0.34, 2.1], [0.3, 2.45], [0.01, 2.5]];
        const g = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 96); g.scale(1, 1, 0.6); g.computeVertexNormals(); return g;
      })(),
      head: (() => { const g = new THREE.SphereGeometry(1, 80, 80); g.scale(0.52, 0.64, 0.56); return g; })(),
      cranium: lumpy(0.01, 3, 0.4, 0.42, 0.44, 64),
      arm: new THREE.CapsuleGeometry(0.2, 2.6, 12, 32),
      rib: [] as THREE.BufferGeometry[],
      intestineL: bumpyTube([[-0.55, -1.95, 0.2], [-0.62, -1.4, 0.28], [-0.58, -0.98, 0.32], [-0.2, -0.9, 0.4], [0.2, -0.92, 0.4], [0.58, -0.98, 0.32], [0.63, -1.45, 0.28], [0.55, -1.95, 0.22], [0.2, -2.1, 0.2]], 0.14, 260, 34, 0.32),
      intestineS: (() => {
        const pts: V3[] = [];
        for (let row = 0; row < 6; row++) for (let k = 0; k <= 8; k++) {
          const t = row % 2 ? 1 - k / 8 : k / 8;
          pts.push([-0.36 + t * 0.72, -1.12 - row * 0.13 + Math.sin(k * 1.7 + row) * 0.03, 0.36 + Math.sin(k * 1.3 + row * 2) * 0.07]);
        }
        return bumpyTube(pts, 0.065, 500, 60, 0.12, 14);
      })(),
      pancreas: bumpyTube([[-0.25, -0.72, 0.08], [0.1, -0.7, 0.12], [0.45, -0.62, 0.05], [0.68, -0.55, -0.05]], 0.07, 80, 18, 0.25),
      trachea: tube([[0, 2.35, 0.08], [0, 1.95, 0.08], [0, 1.62, 0.05]], 0.072),
      bronchiR: tube([[0, 1.64, 0.05], [-0.18, 1.5, 0.04], [-0.36, 1.32, 0.02]], 0.05),
      bronchiL: tube([[0, 1.64, 0.05], [0.18, 1.52, 0.04], [0.38, 1.35, 0.02]], 0.05),
      aorta: tube([[0.06, 0.7, 0.22], [0.08, 1.12, 0.12], [-0.06, 1.15, -0.15], [-0.06, 0.6, -0.36], [-0.06, -2.0, -0.36]], 0.075, 90),
      cava: tube([[-0.2, 0.62, 0.12], [-0.22, 0.2, -0.05], [-0.22, -2.0, -0.25]], 0.07),
      esoph: tube([[0.02, 2.35, -0.08], [0.06, 1.0, -0.2], [0.1, 0.0, -0.12], [0.3, -0.25, 0.05]], 0.05),
      pubis: tube([[-0.5, -2.35, 0.15], [-0.2, -2.55, 0.32], [0.2, -2.55, 0.32], [0.5, -2.35, 0.15]], 0.07),
      clavR: tube([[-0.1, 1.97, 0.4], [-0.55, 2.0, 0.3], [-1.0, 1.86, 0.0]], 0.045),
      clavL: tube([[0.1, 1.97, 0.4], [0.55, 2.0, 0.3], [1.0, 1.86, 0.0]], 0.045),
      ureterR: tube([[-0.45, -1.05, -0.25], [-0.3, -1.8, 0.0], [-0.1, -2.2, 0.25]], 0.018),
      ureterL: tube([[0.45, -1.05, -0.25], [0.3, -1.8, 0.0], [0.1, -2.2, 0.25]], 0.018),
      jaw: (() => { const g = new THREE.TorusGeometry(0.23, 0.045, 16, 48, Math.PI); g.rotateX(Math.PI / 2); g.rotateY(Math.PI); return g; })(),
    };
    const fac = [0.55, 0.72, 0.84, 0.91, 0.96, 0.99, 1.0, 0.98, 0.93, 0.86];
    for (let i = 0; i < 10; i++) for (const sd of [-1, 1]) {
      const y0 = 1.78 - i * 0.165, f = fac[i], frontEnd = i < 7 ? 1 : 0.55;
      const pts: V3[] = [[sd * 0.09, y0, -0.47], [sd * 0.6 * f, y0 - 0.04, -0.4], [sd * 0.95 * f, y0 - 0.16, 0.0], [sd * 0.78 * f, y0 - 0.3, 0.36 * frontEnd]];
      if (i < 7) pts.push([sd * 0.17, y0 - 0.38 - i * 0.03, 0.5]);
      geo.rib.push(tube(pts, 0.024, 48));
    }
    // mucus + lung surface spots (front-facing vertices)
    const mucusPts: V3[] = [];
    for (const [g, ox] of [[geo.lungR, -0.47], [geo.lungL, 0.47]] as [THREE.BufferGeometry, number][]) {
      const p = g.attributes.position, n = g.attributes.normal;
      for (let k = 0; k < 7; k++) { const i = Math.floor(random(`mu${ox}${k}`) * p.count); if (n.getZ(i) > 0.2) mucusPts.push([p.getX(i) + ox, p.getY(i) + 0.95, p.getZ(i)]); }
    }
    const M = {
      glass: new THREE.MeshPhysicalMaterial({color: '#ffe0b0', transmission: 1, roughness: 0.05, thickness: 0.45, ior: 1.33, attenuationColor: new THREE.Color('#f0b060'), attenuationDistance: 2.6, clearcoat: 1, clearcoatRoughness: 0.08, specularIntensity: 1}),
      lung: new THREE.MeshPhysicalMaterial({map: lungTex.t, bumpMap: tissueBump, bumpScale: 2.2, roughness: 0.5, clearcoat: 0.55, clearcoatRoughness: 0.3, sheen: 0.6, sheenColor: new THREE.Color('#ffd0d8')}),
      heart: new THREE.MeshPhysicalMaterial({color: '#c42a2a', bumpMap: organBump, bumpScale: 1.5, roughness: 0.32, clearcoat: 0.9, emissive: '#400000'}),
      liver: new THREE.MeshPhysicalMaterial({color: '#7d2a1f', bumpMap: organBump, bumpScale: 1, roughness: 0.35, clearcoat: 0.8}),
      stomach: new THREE.MeshPhysicalMaterial({color: '#e79a80', bumpMap: organBump, bumpScale: 1.5, roughness: 0.4, clearcoat: 0.6}),
      intestine: new THREE.MeshPhysicalMaterial({color: '#e7907a', bumpMap: organBump, bumpScale: 1, roughness: 0.38, clearcoat: 0.7}),
      kidney: new THREE.MeshPhysicalMaterial({color: '#7e2c46', roughness: 0.3, clearcoat: 0.9}),
      spleen: new THREE.MeshPhysicalMaterial({color: '#6b2a5c', roughness: 0.3, clearcoat: 0.8}),
      gall: new THREE.MeshPhysicalMaterial({color: '#3f9a2e', roughness: 0.25, clearcoat: 1}),
      pancreas: new THREE.MeshPhysicalMaterial({color: '#e8a83c', bumpMap: organBump, bumpScale: 2, roughness: 0.45, clearcoat: 0.5}),
      bladder: new THREE.MeshPhysicalMaterial({color: '#f0a050', roughness: 0.25, clearcoat: 1}),
      bone: new THREE.MeshPhysicalMaterial({color: '#eadab2', roughness: 0.42, clearcoat: 0.4, bumpMap: organBump, bumpScale: 0.4}),
      artery: new THREE.MeshPhysicalMaterial({color: '#b81c22', roughness: 0.3, clearcoat: 0.8}),
      vein: new THREE.MeshPhysicalMaterial({color: '#2a4fb8', roughness: 0.3, clearcoat: 0.8}),
      trachea: new THREE.MeshPhysicalMaterial({color: '#f0cfc4', roughness: 0.35, clearcoat: 0.7, emissive: '#000000'}),
      esoph: new THREE.MeshPhysicalMaterial({color: '#d98a7c', roughness: 0.4, clearcoat: 0.6}),
      muscle: new THREE.MeshPhysicalMaterial({color: '#b2402f', roughness: 0.45, clearcoat: 0.5, bumpMap: organBump, bumpScale: 1, side: THREE.DoubleSide}),
      ureter: new THREE.MeshPhysicalMaterial({color: '#e8c060', roughness: 0.4}),
      mucus: new THREE.MeshPhysicalMaterial({color: '#c3d23c', roughness: 0.1, clearcoat: 1, transmission: 0.3, thickness: 0.1}),
      tumor: new THREE.MeshPhysicalMaterial({color: '#5e1530', roughness: 0.45, clearcoat: 0.6, emissive: '#ff1040', emissiveIntensity: 0.4, bumpMap: tissueBump, bumpScale: 3}),
      eye: new THREE.MeshPhysicalMaterial({color: '#ffffff', roughness: 0.1, clearcoat: 1}),
      iris: new THREE.MeshPhysicalMaterial({color: '#3a7bb0', roughness: 0.2}),
      pupil: new THREE.MeshBasicMaterial({color: '#050505'}),
      socket: new THREE.MeshStandardMaterial({color: '#3a2a1c', roughness: 0.9}),
      paper: new THREE.MeshStandardMaterial({color: '#f6f3ec', roughness: 0.7}),
      filter: new THREE.MeshStandardMaterial({color: '#d9944a', roughness: 0.8}),
      ember: new THREE.MeshStandardMaterial({color: '#ff5a1f', emissive: '#ff4a10', emissiveIntensity: 3}),
      smoke: new THREE.SpriteMaterial({map: sprite, color: '#dcdcdc', transparent: true, depthWrite: false, depthTest: false, opacity: 0.5}),
      smokeOut: new THREE.SpriteMaterial({map: sprite, color: '#e8e8e8', transparent: true, depthWrite: false, opacity: 0.4}),
      glow: new THREE.SpriteMaterial({map: sprite, color: '#ff3060', transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending}),
      emberGlow: new THREE.SpriteMaterial({map: sprite, color: '#ff8030', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending}),
      shadow: new THREE.MeshBasicMaterial({map: canvasTex(256, 256, (c) => { const g = c.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 256, 256); }).t, transparent: true, depthWrite: false}),
    };
    return {lungTex, pattern, geo, M, mucusPts};
  }, []);
  const {geo, M} = A;

  // ---- per-frame lung texture (damage)
  {
    const c = A.lungTex.cv.getContext('2d')!;
    const base = interpolateColors(d, [0, 0.3, 0.6, 1], ['#f2a0ad', '#d7959a', '#7a6862', '#2a2220']);
    const deep = interpolateColors(d, [0, 0.3, 0.6, 1], ['#d4566f', '#a65a5e', '#4b3d38', '#120d0c']);
    const g = c.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, base); g.addColorStop(1, deep);
    c.fillStyle = g; c.fillRect(0, 0, 1024, 512);
    c.globalAlpha = 1 - d * 0.6; c.drawImage(A.pattern.cv, 0, 0); c.globalAlpha = 1;
    for (let i = 0; i < 420; i++) {
      const th = i / 420; const vis = interpolate(d, [th * 0.85 + 0.12, th * 0.85 + 0.2], [0, 1], clamp);
      if (vis <= 0) continue;
      const x = random(`tx${i}`) * 1024, y = 60 + random(`ty${i}`) * 400, r = (3 + random(`tr${i}`) * 16) * vis;
      const gg = c.createRadialGradient(x, y, 0, x, y, r); gg.addColorStop(0, `rgba(18,10,6,${0.75 + random(`to${i}`) * 0.2})`); gg.addColorStop(1, 'rgba(18,10,6,0)');
      c.fillStyle = gg; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    }
    for (let i = 0; i < 46; i++) { // emphysema holes
      const vis = interpolate(s, [8.1 + i * 0.07, 8.45 + i * 0.07], [0, 1], clamp); if (vis <= 0) continue;
      const x = random(`hx${i}`) * 1024, y = 90 + random(`hy${i}`) * 330, r = (6 + random(`hr${i}`) * 16) * vis;
      c.fillStyle = interpolateColors(d, [0.5, 1], ['#9a7f78', '#4a3a36']); c.beginPath(); c.arc(x, y, r + 4, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#080404'; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    }
    A.lungTex.t.needsUpdate = true;
  }

  const coughing = si === 1 && ls > 0.5 && ls < 1.7;
  const breath = Math.sin(s * Math.PI * 2 * 0.7) * 0.055 * (1 - d * 0.7) + (coughing ? -0.07 * Math.abs(Math.sin(ls * 13)) : 0);
  const beatHz = 1.15 + d * 0.9;
  const beat = Math.max(0, Math.sin(s * Math.PI * 2 * beatHz)) ** 8;
  const inflame = interpolate(s, [6.1, 6.6, 7.8, 8.4], [0, 1, 1, 0.3], clamp);
  M.trachea.emissive.set(interpolateColors(inflame, [0, 1], ['#000000', '#ff1a1a'])); M.trachea.emissiveIntensity = 0.9;
  M.trachea.color.set(interpolateColors(d, [0, 1], ['#f0cfc4', '#7a6660']));
  M.glass.color.set(interpolateColors(d, [0, 1], ['#ffe6c0', '#b8a888']));
  M.glass.roughness = 0.05 + d * 0.25;
  M.glass.attenuationColor.set(interpolateColors(d, [0, 1], ['#f0b060', '#6a5a40']));
  M.lung.sheen = 0.6 * (1 - d);
  M.lung.roughness = 0.5 + d * 0.3;
  M.heart.emissiveIntensity = 0.4 + beat * 1.2;
  const tumV = interpolate(s, [12.15, 13.0], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.8))});
  M.tumor.emissiveIntensity = 0.3 + beat * 1.4;
  M.eye.color.set(interpolateColors(d, [0, 0.5, 1], ['#ffffff', '#f6d2c8', '#e89088']));
  const mucusV = (i: number) => interpolate(s, [2.2 + i * 0.08, 2.55 + i * 0.08], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))}) * (1 - interpolate(d, [0.6, 1], [0, 0.4], clamp));
  const jawOpen = coughing ? 0.35 * Math.abs(Math.sin(ls * 13)) : 0.06;
  const cigOn = !coughing && s < END_T;

  const smoke = new Array(26).fill(0).map((_, i) => {
    const p = (s * 0.45 + i / 26) % 1; const sd = i % 2 ? 1 : -1;
    let x = 0, y = 0, z = 0.06;
    if (p < 0.4) { y = interpolate(p, [0, 0.4], [2.6, 1.62]); x = Math.sin(p * 18 + i) * 0.02; }
    else { const q = (p - 0.4) / 0.6; x = sd * (0.1 + q * (0.2 + random(`sm${i}`) * 0.25)); y = 1.62 - q * (0.25 + random(`sn${i}`) * 0.9); z = 0.05 + q * 0.25; }
    return {x, y, z, sc: 0.12 + p * 0.28, o: 0.55 * Math.sin(p * Math.PI) * (s < END_T ? 1 : 0)};
  });
  const lungS = 1 + breath;

  return (
    <group position={[0, -0.25, 0]}>
      {/* floor contact shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.95, 0]} material={M.shadow}><planeGeometry args={[4.5, 3]} /></mesh>
      {/* spine */}
      {new Array(36).fill(0).map((_, i) => (
        <group key={i} position={[0, -2.2 + i * 0.128, -0.5 + Math.sin(i * 0.18) * 0.04]}>
          <mesh material={M.bone}><cylinderGeometry args={[0.075, 0.08, 0.09, 20]} /></mesh>
          <mesh material={M.bone} position={[0, -0.01, -0.09]} rotation={[0.5, 0, 0]}><boxGeometry args={[0.035, 0.05, 0.12]} /></mesh>
        </group>
      ))}
      {geo.rib.map((g, i) => <mesh key={i} geometry={g} material={M.bone} />)}
      <mesh material={M.bone} position={[0, 1.33, 0.5]}><boxGeometry args={[0.13, 0.95, 0.05]} /></mesh>
      <mesh geometry={geo.clavR} material={M.bone} /><mesh geometry={geo.clavL} material={M.bone} />
      {/* vessels, airway, esophagus */}
      <mesh geometry={geo.aorta} material={M.artery} /><mesh geometry={geo.cava} material={M.vein} />
      <mesh geometry={geo.esoph} material={M.esoph} />
      <mesh geometry={geo.trachea} material={M.trachea} />
      {new Array(10).fill(0).map((_, i) => <mesh key={i} position={[0, 2.3 - i * 0.065, 0.08]} rotation={[Math.PI / 2, 0, 0]} material={M.trachea}><torusGeometry args={[0.075, 0.014, 8, 24]} /></mesh>)}
      <mesh geometry={geo.bronchiR} material={M.trachea} /><mesh geometry={geo.bronchiL} material={M.trachea} />
      {/* lungs */}
      <group position={[-0.47, 0.95, 0]} scale={[lungS, 1 + breath * 0.6, lungS]}><mesh geometry={geo.lungR} material={M.lung} /></group>
      <group position={[0.47, 0.95, 0]} scale={[lungS, 1 + breath * 0.6, lungS]}><mesh geometry={geo.lungL} material={M.lung} /></group>
      {A.mucusPts.map((p, i) => mucusV(i) > 0.01 && (
        <mesh key={i} position={[p[0] * lungS + (p[0] > 0 ? 0.47 : -0.47) * (1 - lungS), 0.95 + (p[1] - 0.95) * (1 + breath * 0.6), p[2] * lungS + 0.01]} scale={mucusV(i) * (0.035 + (i % 3) * 0.012)} material={M.mucus}><sphereGeometry args={[1, 20, 20]} /></mesh>
      ))}
      {tumV > 0.01 && (
        <group position={TUMOR} scale={tumV * (1 + beat * 0.1)}>
          <mesh geometry={geo.tumor} material={M.tumor} />
          {[[0.1, 0.06, 0.08], [-0.08, -0.07, 0.09], [0.04, -0.1, 0.06]].map((q, i) => <mesh key={i} position={q as V3} scale={0.05 + i * 0.01} material={M.tumor}><sphereGeometry args={[1, 24, 24]} /></mesh>)}
          <sprite material={M.glow} scale={0.7 + beat * 0.25} />
        </group>
      )}
      {/* heart */}
      <group position={[0.13, 0.5, 0.26]} rotation={[0.2, 0, -0.45]} scale={1.15 * (1 + beat * 0.08)}><mesh geometry={geo.heart} material={M.heart} /></group>
      {/* diaphragm */}
      <mesh geometry={geo.diaphragm} material={M.muscle} position={[0, -0.32 - breath * 1.2, 0]} />
      {/* abdomen */}
      <mesh geometry={geo.liver} material={M.liver} position={[-0.32, -0.32, 0.12]} rotation={[0, 0, -0.18]} />
      <mesh geometry={geo.gall} material={M.gall} position={[-0.2, -0.56, 0.42]} rotation={[0, 0, 0.4]} />
      <mesh geometry={geo.stomach} material={M.stomach} position={[0.38, -0.42, 0.2]} rotation={[0, 0, -0.35]} />
      <mesh geometry={geo.spleen} material={M.spleen} position={[0.76, -0.38, -0.12]} rotation={[0, 0, 0.3]} />
      <mesh geometry={geo.kidney} material={M.kidney} position={[-0.47, -0.88, -0.3]} rotation={[0, 0, 0.15]} />
      <mesh geometry={geo.kidney} material={M.kidney} position={[0.47, -0.84, -0.3]} rotation={[0, Math.PI, -0.15]} />
      <mesh geometry={geo.ureterR} material={M.ureter} /><mesh geometry={geo.ureterL} material={M.ureter} />
      <mesh geometry={geo.pancreas} material={M.pancreas} />
      <mesh geometry={geo.intestineL} material={M.intestine} />
      <mesh geometry={geo.intestineS} material={M.intestine} />
      <mesh geometry={geo.bladder} material={M.bladder} position={[0, -2.25, 0.28]} />
      {/* pelvis */}
      <mesh geometry={geo.ilium} material={M.bone} position={[-0.6, -2.05, 0.0]} rotation={[0.1, 0.65, 0.35]} />
      <mesh geometry={geo.ilium} material={M.bone} position={[0.6, -2.05, 0.0]} rotation={[0.1, -0.65, -0.35]} />
      <mesh material={M.bone} position={[0, -2.25, -0.38]} rotation={[0.4, 0, 0]}><coneGeometry args={[0.2, 0.45, 20]} /></mesh>
      <mesh geometry={geo.pubis} material={M.bone} />
      {[-1, 1].map((sd) => <mesh key={sd} material={M.bone} position={[sd * 0.78, -2.5, 0.05]}><sphereGeometry args={[0.13, 24, 24]} /></mesh>)}
      {/* skull + face */}
      <group position={[0, 2.97, 0]}>
        <mesh geometry={geo.cranium} material={M.bone} position={[0, 0.08, -0.02]} />
        {[-1, 1].map((sd) => (
          <group key={sd} position={[sd * 0.15, 0.0, 0.33]}>
            <mesh material={M.socket} scale={[1, 0.9, 0.5]}><sphereGeometry args={[0.11, 24, 24]} /></mesh>
            <mesh material={M.eye} position={[0, 0, 0.03]}><sphereGeometry args={[0.085, 32, 32]} /></mesh>
            <mesh material={M.iris} position={[sd * -0.005, 0, 0.112]}><circleGeometry args={[0.04, 32]} /></mesh>
            <mesh material={M.pupil} position={[sd * -0.005, 0, 0.114]}><circleGeometry args={[0.018, 24]} /></mesh>
          </group>
        ))}
        <mesh material={M.socket} position={[0, -0.13, 0.4]} scale={[0.6, 1, 0.5]}><coneGeometry args={[0.05, 0.1, 3]} /></mesh>
        {new Array(10).fill(0).map((_, i) => <mesh key={i} material={M.eye} position={[-0.11 + i * 0.025, -0.27, 0.37 - Math.abs(i - 4.5) * 0.008]}><boxGeometry args={[0.022, 0.05, 0.03]} /></mesh>)}
        <group position={[0, -0.25, 0.1]} rotation={[jawOpen, 0, 0]}>
          <mesh geometry={geo.jaw} material={M.bone} position={[0, -0.1, 0.02]} />
          {new Array(10).fill(0).map((_, i) => <mesh key={i} material={M.eye} position={[-0.11 + i * 0.025, -0.07, 0.27 - Math.abs(i - 4.5) * 0.008]}><boxGeometry args={[0.022, 0.045, 0.03]} /></mesh>)}
        </group>
        {cigOn && (
          <group position={[0.09, -0.28, 0.38]} rotation={[0.15, 0.55, -0.25]}>
            <mesh material={M.filter} position={[0, 0, 0.07]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.026, 0.026, 0.14, 20]} /></mesh>
            <mesh material={M.paper} position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.025, 0.025, 0.32, 20]} /></mesh>
            <mesh material={M.ember} position={[0, 0, 0.47]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.025, 0.025, 0.025, 20]} /></mesh>
            <sprite material={M.emberGlow} position={[0, 0, 0.48]} scale={0.18 + 0.04 * Math.sin(s * 9)} />
            {[0, 1, 2, 3].map((w) => { const p = (s * 0.5 + w / 4) % 1; return <sprite key={w} material={M.smokeOut} position={[Math.sin(p * 8 + w) * 0.06, p * 0.9, 0.48 + p * 0.1]} scale={0.1 + p * 0.45} />; })}
          </group>
        )}
      </group>
      {/* inhaled smoke */}
      {smoke.map((p, i) => p.o > 0.01 && <sprite key={i} material={M.smoke} position={[p.x, p.y, p.z]} scale={p.sc} />)}
      {/* glass shell */}
      <mesh geometry={geo.torso} material={M.glass} />
      <mesh geometry={geo.head} material={M.glass} position={[0, 2.97, 0.02]} />
      <mesh geometry={geo.arm} material={M.glass} position={[-1.28, 0.1, 0]} rotation={[0, 0, -0.1]} />
      <mesh geometry={geo.arm} material={M.glass} position={[1.28, 0.1, 0]} rotation={[0, 0, 0.1]} />
    </group>
  );
};

// ---------- 2D overlays
const Stroke: React.FC<{children: React.ReactNode; size: number; color: string; stroke: string}> = ({children, size, color, stroke}) => (
  <div style={{fontFamily: FONT, fontWeight: 900, fontSize: size, color, WebkitTextStroke: `${size * 0.1}px ${stroke}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.07}px 0 ${stroke}, 0 0 24px rgba(0,0,0,0.45)`, letterSpacing: -1, textAlign: 'center', lineHeight: 1.05}}>{children}</div>
);

export const Lungs3D: React.FC = () => {
  const f = useCurrentFrame();
  const s = f / FPS;
  const si = stageAt(s);
  const st = STAGES[si];
  const ls = s - st.t;
  const d = damageAt(s);
  const ending = s >= END_T;
  const coughing = si === 1 && ls > 0.5 && ls < 1.7;
  const {pos, tgt} = camAt(s);
  const beat = Math.max(0, Math.sin(s * Math.PI * 2 * (1.15 + d * 0.9))) ** 8;
  let shake: V3 = [0, 0, 0];
  if (coughing) { const a = Math.abs(Math.sin(ls * 13)); shake = [(random(f) - 0.5) * 0.08 * a, (random(f + 3) - 0.5) * 0.07 * a, 0]; }
  if (si === 6) shake = [(random(f) - 0.5) * 0.03 * beat, 0, 0];
  const cam = makeCam([pos[0] + shake[0], pos[1] + shake[1], pos[2]], tgt);
  const proj = (p: V3) => { const v = new THREE.Vector3(p[0], p[1] - 0.25, p[2]).project(cam); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H]; };

  const segLen = (si === 6 ? END_T - 12 : 2) / st.cap.length;
  const ci = Math.min(st.cap.length - 1, Math.floor(ls / segLen));
  const capPop = interpolate(ls % segLen, [0, 0.14], [0.7, 1], {...clamp, easing: Easing.out(Easing.back(3))});
  const labelPop = interpolate(ls, [0, 0.22], [0.3, 1], {...clamp, easing: Easing.out(Easing.back(3))});
  const cigs = Math.round(interpolate(ls, [0, 0.6], [si ? STAGES[si - 1].cigs : 0, st.cigs], clamp));
  const flash = interpolate(ls, [0, 0.14], [0.45, 0], clamp);
  const pillK = interpolate(ls, [0.85, 1.3], [0, 1], clamp) * (ending ? 0 : 1);

  const wallTop = interpolateColors(d, [0, 0.5, 1], ['#cfeefa', '#9fb8c2', '#4d4a47']);
  const wallMid = interpolateColors(d, [0, 0.5, 1], ['#5fb6e3', '#45799a', '#25211f']);
  const floorC = interpolateColors(d, [0, 1], ['#3b86b8', '#161312']);

  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Audio src={staticFile('audio3d.wav')} />
      {/* studio background */}
      <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 45% at 50% 40%, ${wallTop} 0%, ${wallMid} 70%, ${floorC} 100%)`}} />
      <AbsoluteFill style={{background: `linear-gradient(180deg, transparent 70%, ${floorC} 88%)`}} />
      <AbsoluteFill>
        <svg width={W} height={H}>
          <defs><filter id="bk"><feGaussianBlur stdDeviation="18" /></filter><filter id="bk2"><feGaussianBlur stdDeviation="40" /></filter></defs>
          {new Array(16).fill(0).map((_, i) => (
            <circle key={i} cx={((random(`bx${i}`) * 900 + s * (6 + i) - pos[0] * 40) % 900) - 90} cy={60 + random(`by${i}`) * 900 + pos[1] * 10} r={20 + random(`br${i}`) * 55}
              fill={i % 3 ? '#ffffff' : '#ffe2a0'} opacity={(0.1 + random(`bo${i}`) * 0.16) * (1 - d * 0.55)} filter="url(#bk)" />
          ))}
          <path d={`M ${-100 + pos[0] * 20} -50 L ${260 + pos[0] * 20} -50 L ${760} ${900} L ${420} ${980} Z`} fill="#ffffff" opacity={0.07 * (1 - d * 0.6)} filter="url(#bk)" />
          {new Array(8).fill(0).map((_, i) => (
            <circle key={i} cx={(random(`hx${i}`) * 1000 + s * 22 * (i % 2 ? 1 : -1)) % 1000 - 140} cy={140 + random(`hy${i}`) * 900} r={150 + random(`hr${i}`) * 140} fill="#c9c2bb" opacity={d * 0.32} filter="url(#bk2)" />
          ))}
        </svg>
      </AbsoluteFill>

      <ThreeCanvas width={W} height={H} camera={{fov: 32, position: pos, near: 0.05, far: 100}} gl={{antialias: true, alpha: true, preserveDrawingBuffer: true}} style={{position: 'absolute'}}>
        <Env />
        <CamRig pos={pos} tgt={tgt} shake={shake} />
        <ambientLight intensity={0.25} />
        <directionalLight position={[-3, 5, 6]} intensity={2.4} color="#fff4e6" />
        <directionalLight position={[4, 2, -4]} intensity={2.2} color={interpolateColors(d, [0, 1], ['#7fd4ff', '#ff6a3a'])} />
        <directionalLight position={[2, -3, 4]} intensity={0.6} color="#c8e6ff" />
        <pointLight position={[0, 1.0, 1.4]} intensity={2.5 + beat * 2 * d} distance={4} color={interpolateColors(d, [0, 1], ['#ffd8c8', '#ff4a4a'])} />
        <Body s={s} d={d} si={si} ls={ls} />
      </ThreeCanvas>

      {/* labels projected from 3D */}
      {!ending && st.pills.map((p, i) => {
        const k = interpolate(pillK, [i * 0.25, Math.min(1, i * 0.25 + 0.75)], [0, 1], clamp);
        if (k <= 0) return null;
        const [x, y] = proj(p.p);
        const w = p.text.length * 15 + 34;
        const tx = Math.max(w / 2 + 14, Math.min(W - w / 2 - 14, x + p.dx)), ty = Math.max(160, Math.min(800, y + p.dy));
        const lk = Math.min(1, k * 1.6);
        return (
          <React.Fragment key={i}>
            <svg width={W} height={H} style={{position: 'absolute'}}>
              <line x1={x} y1={y} x2={x + (tx - x) * lk} y2={y + (ty - y) * lk} stroke="#fff" strokeWidth={6} strokeLinecap="round" />
              <line x1={x} y1={y} x2={x + (tx - x) * lk} y2={y + (ty - y) * lk} stroke={p.c} strokeWidth={3} strokeLinecap="round" />
              <circle cx={x} cy={y} r={8 + 2 * Math.sin(s * 8)} fill={p.c} stroke="#fff" strokeWidth={3} />
            </svg>
            <div style={{position: 'absolute', left: tx - w / 2, top: ty - 22, width: w, height: 44, borderRadius: 12, background: `linear-gradient(180deg, ${p.c}, ${p.c}dd)`, border: '3px solid white', boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 24, color: 'white', transform: `scale(${interpolate(k, [0.4, 1], [0, 1], {...clamp, easing: Easing.out(Easing.back(2.5))})})`}}>{p.text}</div>
          </React.Fragment>
        );
      })}

      {/* cilia inset */}
      {si === 0 && ls > 0.6 && (
        <div style={{position: 'absolute', right: 26, top: 300, width: 210, height: 210, borderRadius: 105, overflow: 'hidden', border: '6px solid white', boxShadow: '0 12px 30px rgba(0,0,0,0.4)', transform: `scale(${interpolate(ls, [0.6, 0.85], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))})})`}}>
          <svg width={210} height={210}>
            <defs><radialGradient id="cg" cx="50%" cy="20%"><stop offset="0%" stopColor="#ffd1db" /><stop offset="100%" stopColor="#e88aa0" /></radialGradient></defs>
            <rect width={210} height={210} fill="url(#cg)" />
            <rect y={140} width={210} height={70} fill="#c94462" />
            {new Array(8).fill(0).map((_, i) => <ellipse key={i} cx={13 + i * 26} cy={172} rx={12} ry={22} fill="#e2708a" stroke="#9e2f4c" strokeWidth={2} />)}
            {new Array(15).fill(0).map((_, i) => {
              const stop = interpolate(ls, [1.1, 1.6], [1, 0], clamp);
              const sw = Math.sin(s * 14 + i * 0.6) * 22 * stop + (1 - stop) * 28 * (random(`c${i}`) - 0.3);
              return <path key={i} d={`M ${12 + i * 13} 142 Q ${12 + i * 13 + sw / 2} 104 ${12 + i * 13 + sw} 66`} stroke={interpolateColors(1 - stop, [0, 1], ['#fff0f3', '#8b7a74'])} strokeWidth={5} strokeLinecap="round" fill="none" />;
            })}
            {ls > 1.2 && new Array(9).fill(0).map((_, i) => <circle key={i} cx={18 + i * 22} cy={50 + (i % 3) * 18} r={7} fill="#3a2a20" opacity={interpolate(ls, [1.2, 1.6], [0, 0.85], clamp)} />)}
          </svg>
          <div style={{position: 'absolute', bottom: 8, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 20, color: 'white', WebkitTextStroke: '1px #000'}}>CILIOS</div>
        </div>
      )}

      {!ending && (
        <div style={{position: 'absolute', top: 60, width: '100%', display: 'flex', justifyContent: 'center'}}>
          <div style={{background: 'rgba(10,14,20,0.62)', border: '2px solid rgba(255,255,255,0.25)', borderRadius: 40, padding: '12px 26px', display: 'flex', alignItems: 'center', gap: 14, backdropFilter: 'blur(6px)'}}>
            <svg width={60} height={16}><rect width={60} height={16} rx={3} fill="#f7f4ee" /><rect width={18} height={16} rx={3} fill="#e0a052" /><rect x={54} width={6} height={16} fill="#ff5a1f" /></svg>
            <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 34, color: 'white'}}>{cigs.toLocaleString('es-ES')}</span>
            <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 24, color: '#ddd'}}>cigarrillos</span>
          </div>
        </div>
      )}
      {!ending && (
        <>
          <div style={{position: 'absolute', top: 860, width: '100%', transform: `scale(${labelPop})`}}><Stroke size={100} color="#5ef07a" stroke="#0d3b17">{st.label}</Stroke></div>
          <div style={{position: 'absolute', top: 990, width: '100%', transform: `scale(${capPop})`}}><Stroke size={52} color="#ffffff" stroke="#000000">{st.cap[ci]}</Stroke></div>
        </>
      )}
      {ending && (
        <AbsoluteFill style={{background: `rgba(0,0,0,${interpolate(s, [END_T, END_T + 0.3], [0, 0.5], clamp)})`, justifyContent: 'center', alignItems: 'center'}}>
          <div style={{transform: `scale(${interpolate(s, [END_T, END_T + 0.22], [0.4, 1], {...clamp, easing: Easing.out(Easing.back(3))})})`}}><Stroke size={88} color="#5ef07a" stroke="#0d3b17">¿Y si<br />lo dejas?</Stroke></div>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{background: 'white', opacity: flash}} />
      <AbsoluteFill style={{background: `radial-gradient(circle, transparent 55%, rgba(0,0,0,${0.32 + d * 0.25}))`}} />
    </AbsoluteFill>
  );
};
