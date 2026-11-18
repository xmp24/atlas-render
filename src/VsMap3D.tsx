// Piezas 3D sobre el mapa para "1 VS 500,000,000": countryballs (sprites), base militar, barcos, tanques,
// formaciones de soldados instanciadas, números 3D, país que se hunde, puente que explota, bola de polvo.
// Todo en coordenadas de mundo (z = altura). Se renderiza dentro del grupo de mundo de ZombMap3D.
import React, {useMemo, useLayoutEffect, useRef} from 'react';
import * as THREE from 'three';
import {continueRender, delayRender, staticFile} from 'remotion';
import WJ from './world.json';
import {KOF, MAINCOL, flagBmp} from './HexWorld';

const cl = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const ss = (a: number, b: number, x: number) => { const u = cl((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const back = (u: number) => { const c = 1.9; const v = u - 1; return 1 + (c + 1) * v * v * v + c * v * v; };
const pop = (t: number, t0: number, d = 0.35) => (t < t0 ? 0 : t > t0 + d ? 1 : back((t - t0) / d));

// ---------------------------------------------------------------- texturas
const TEX = new Map<string, THREE.Texture>();
// precarga de las imágenes de countryballs al importar el módulo (bloquea el primer fotograma hasta que estén)
const IMG: Record<string, HTMLImageElement> = {};
if (typeof window !== 'undefined') for (const u of ['hw/vs/drool.png', 'hw/vs/war.png', 'hw/vs/tech.png']) {
  const h = delayRender('img ' + u); const im = new Image(); im.onload = () => continueRender(h); im.onerror = () => continueRender(h); im.src = staticFile(u); IMG[u] = im;
}
const useTex = (url: string) => {
  let tx = TEX.get(url); if (tx) return tx;
  const im = IMG[url]; tx = new THREE.Texture(im); tx.needsUpdate = true; tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8; TEX.set(url, tx); return tx;
};
const canvasTex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  let tx = TEX.get(key); if (tx) return tx;
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')!);
  tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; TEX.set(key, tx); return tx;
};
const puff = () => canvasTex('puff', 128, 128, (g) => { for (let i = 0; i < 14; i++) { const x = 30 + rnd(i) * 68, y = 34 + rnd(i + 5) * 60, r = 18 + rnd(i + 2) * 26; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); } });
const tumbleTex = () => canvasTex('tumble', 256, 256, (g) => {
  g.lineCap = 'round';
  for (let i = 0; i < 70; i++) { const a0 = rnd(i) * 6.28, a1 = a0 + 1 + rnd(i + 3) * 2.5, r = 40 + rnd(i + 7) * 75; g.strokeStyle = `hsl(32,${35 + rnd(i) * 20}%,${28 + rnd(i + 1) * 22}%)`; g.lineWidth = 2 + rnd(i + 2) * 4; g.beginPath(); g.arc(128 + (rnd(i + 9) - 0.5) * 30, 128 + (rnd(i + 11) - 0.5) * 30, r, a0, a1); g.stroke(); }
});
const flagTexK = (k: number) => canvasTex('flag' + k, 192, 128, (g) => { const src = flagBmp(k) as any; if (src) g.drawImage(src, 0, 0, 192, 128); else { g.fillStyle = MAINCOL[k] || '#888'; g.fillRect(0, 0, 192, 128); } });
const ballTex = (code: string) => canvasTex('ball' + code, 256, 256, (g) => {
  const k = KOF[code]; const src = k !== undefined ? (flagBmp(k) as any) : null;
  g.save(); g.beginPath(); g.arc(128, 132, 112, 0, Math.PI * 2); g.clip();
  if (src) g.drawImage(src, -40, 20, 336, 224); else { g.fillStyle = MAINCOL[k] || '#888'; g.fillRect(0, 0, 256, 256); }
  const sh = g.createRadialGradient(90, 90, 20, 128, 132, 120); sh.addColorStop(0, 'rgba(255,255,255,0.25)'); sh.addColorStop(1, 'rgba(0,0,0,0.35)'); g.fillStyle = sh; g.fillRect(0, 0, 256, 256); g.restore();
  g.lineWidth = 9; g.strokeStyle = '#151515'; g.beginPath(); g.arc(128, 132, 112, 0, Math.PI * 2); g.stroke();
  for (const ex of [92, 164]) { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(ex, 120, 24, 30, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 6; g.stroke(); g.fillStyle = '#151515'; g.beginPath(); g.arc(ex + 4, 124, 11, 0, Math.PI * 2); g.fill(); }
  g.lineWidth = 9; g.beginPath(); g.moveTo(66, 84); g.lineTo(112, 98); g.moveTo(190, 84); g.lineTo(144, 98); g.stroke();
});
const textTex = (txt: string, col: string) => canvasTex('txt' + txt + col, 1024, 256, (g) => {
  g.font = '200px Lilita'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.lineWidth = 26; g.strokeStyle = '#151515'; g.strokeText(txt, 512, 136); g.fillStyle = col; g.fillText(txt, 512, 136);
});

// ---------------------------------------------------------------- materiales comunes
const MAT: Record<string, THREE.Material> = {};
const mat = (col: string, rough = 0.6, metal = 0.2, em?: string) => { const key = col + rough + metal + (em || ''); if (!MAT[key]) MAT[key] = new THREE.MeshStandardMaterial({color: col, roughness: rough, metalness: metal, emissive: em ? new THREE.Color(em) : undefined, emissiveIntensity: em ? 1.3 : 0}); return MAT[key]; };
const Box: React.FC<{p: number[]; s: number[]; c: string; r?: number[]; m?: number; e?: string}> = ({p, s, c, r, m = 0.25, e}) => <mesh position={p as any} rotation={(r || [0, 0, 0]) as any} scale={s as any} material={mat(c, 0.55, m, e)}><boxGeometry args={[1, 1, 1]} /></mesh>;
const Cyl: React.FC<{p: number[]; r0: number; r1: number; h: number; c: string; rot?: number[]; seg?: number; e?: string}> = ({p, r0, r1, h, c, rot, seg = 16, e}) => <mesh position={p as any} rotation={(rot || [Math.PI / 2, 0, 0]) as any} material={mat(c, 0.5, 0.35, e)}><cylinderGeometry args={[r1, r0, h, seg]} /></mesh>;
const Shadow: React.FC<{r: number; o?: number; sx?: number}> = ({r, o = 0.35, sx = 1}) => <mesh position={[0, 0, 0.3]} scale={[sx, 1, 1]}><circleGeometry args={[r, 24]} /><meshBasicMaterial color="#000" transparent opacity={o} depthWrite={false} /></mesh>;

// ---------------------------------------------------------------- props
const Tank: React.FC<{col: string; t: number; fire?: number}> = ({col, t, fire = 0}) => (
  <group>
    <Shadow r={9} sx={1.4} />
    <Box p={[0, 0, 2.2]} s={[18, 11, 4]} c="#2a2a26" />
    <Box p={[0, 0, 5]} s={[16, 10, 3.4]} c={col} />
    <Box p={[-1.5, 0, 8]} s={[8, 7, 3]} c={col} />
    <Cyl p={[8, 0, 8]} r0={0.9} r1={0.9} h={13} c="#222" rot={[0, 0, Math.PI / 2]} seg={8} />
    {fire > 0 && <mesh position={[15.5, 0, 8]}><sphereGeometry args={[2.6 * fire, 10, 8]} /><meshBasicMaterial color="#ffd27a" transparent opacity={fire} /></mesh>}
  </group>
);
const Ship: React.FC<{kind: string; col: string; t: number; i: number}> = ({kind, col, t, i}) => {
  const big = kind === 'carrier'; const L = big ? 70 : kind === 'landing' ? 22 : 46; const W = big ? 16 : kind === 'landing' ? 9 : 10;
  const bob = Math.sin(t * 2.2 + i) * 0.6;
  return (
    <group position={[0, 0, bob]} rotation={[Math.sin(t * 1.7 + i) * 0.03, 0, 0]}>
      <mesh position={[-L * 0.55, 0, 0.4]} scale={[L * 0.9, W * 1.1, 1]}><planeGeometry args={[1, 1]} /><meshBasicMaterial color="#e8f4ff" transparent opacity={0.45} depthWrite={false} /></mesh>
      <Box p={[0, 0, 2]} s={[L, W, 4]} c="#5b6672" />
      <Box p={[L * 0.47, 0, 2.6]} s={[L * 0.12, W * 0.55, 4.4]} c="#5b6672" r={[0, 0, Math.PI / 4]} />
      {big ? <>
        <Box p={[0, 0, 4.6]} s={[L * 1.02, W * 1.35, 1.2]} c="#3d444c" />
        <Box p={[L * 0.12, W * 0.45, 9]} s={[8, 4, 8]} c="#7a838d" />
        {[0, 1, 2].map((j) => <Box key={j} p={[-L * 0.3 + j * 12, -W * 0.2, 6]} s={[7, 5, 1.6]} c="#9aa3ad" />)}
        <Box p={[0, 0, 5.3]} s={[L * 0.9, 0.6, 0.2]} c="#ffd23f" />
      </> : kind === 'landing' ? <>
        <Box p={[-L * 0.35, 0, 5]} s={[4, W * 0.8, 3]} c="#59646f" />
        {Array.from({length: 6}, (_, j) => <mesh key={j} position={[-4 + (j % 3) * 4, -2 + Math.floor(j / 3) * 4, 5]}><sphereGeometry args={[1.4, 8, 6]} /><meshStandardMaterial color={col} /></mesh>)}
      </> : <>
        <Box p={[-2, 0, 6.5]} s={[12, 6, 5]} c="#7a838d" />
        <Cyl p={[-2, 0, 12]} r0={0.5} r1={0.3} h={7} c="#555" seg={6} />
        <Box p={[12, 0, 5.5]} s={[5, 4, 2.4]} c="#6c7680" />
        <Cyl p={[17, 0, 5.5]} r0={0.7} r1={0.7} h={8} c="#333" rot={[0, 0, Math.PI / 2]} seg={6} />
      </>}
      <mesh position={[-L * 0.38, 0, 9 + (big ? 6 : 0)]} rotation={[Math.PI / 2, 0, 0]} scale={[7, 4.6, 1]} material={useMemo(() => new THREE.MeshBasicMaterial({map: flagTexK(KOF[col] ?? 0), side: THREE.DoubleSide}), [col])}><planeGeometry args={[1, 1]} /></mesh>
    </group>
  );
};
const Tower: React.FC<{t: number}> = ({t}) => {
  const a = Math.sin(t * 1.6) * 0.9;
  return (
    <group>
      <Shadow r={10} />
      {[[-5, -5], [5, -5], [-5, 5], [5, 5]].map(([x, y], i) => <Cyl key={i} p={[x * 0.8, y * 0.8, 16]} r0={1} r1={0.7} h={32} c="#4a3b2a" seg={6} />)}
      <Box p={[0, 0, 33]} s={[16, 16, 2]} c="#5a4632" />
      <Box p={[0, 0, 39]} s={[14, 14, 0.6]} c="#3a2e22" />
      <Box p={[0, 0, 36]} s={[16, 16, 5]} c="#6d5638" m={0.05} />
      <mesh position={[0, 0, 44]} rotation={[0, 0, Math.PI / 4]}><coneGeometry args={[13, 8, 4]} /><meshStandardMaterial color="#3d2f22" /></mesh>
      <group position={[0, 0, 37]} rotation={[0, 0, a]}>
        <mesh position={[0, -45, -12]} rotation={[0.25, 0, 0]}><coneGeometry args={[16, 90, 20, 1, true]} /><meshBasicMaterial color="#fff6c0" transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      </group>
      <pointLight position={[0, -20, 30]} intensity={20000} distance={160} color="#fff1b0" />
    </group>
  );
};
const Radar: React.FC<{t: number}> = ({t}) => (
  <group>
    <Shadow r={9} />
    <Box p={[0, 0, 3]} s={[12, 12, 6]} c="#8b949e" />
    <Cyl p={[0, 0, 10]} r0={1.5} r1={1.2} h={10} c="#6c757d" seg={8} />
    <group position={[0, 0, 17]} rotation={[0, 0, t * 1.8]}>
      <mesh rotation={[0.9, 0, 0]}><sphereGeometry args={[11, 20, 10, 0, Math.PI * 2, 0, 1.0]} /><meshStandardMaterial color="#dfe6ee" side={THREE.DoubleSide} metalness={0.4} roughness={0.35} /></mesh>
    </group>
    <mesh position={[0, 0, 24]}><sphereGeometry args={[1.2, 8, 6]} /><meshBasicMaterial color={Math.sin(t * 8) > 0 ? '#ff3b30' : '#551010'} /></mesh>
  </group>
);
const Hangar: React.FC = () => (
  <group>
    <Shadow r={20} sx={1.3} />
    <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} scale={[1, 1, 1]}><cylinderGeometry args={[12, 12, 34, 20, 1, false, 0, Math.PI]} /><meshStandardMaterial color="#6e7a6a" side={THREE.DoubleSide} roughness={0.7} /></mesh>
    <Box p={[17.2, 0, 5]} s={[0.6, 18, 10]} c="#2b2f33" e="#ffb347" />
  </group>
);
const Silo: React.FC<{t: number; launch?: number}> = ({t, launch = 0}) => {
  const up = launch > 0 ? Math.pow(Math.max(0, t - launch), 2) * 90 : 0;
  return (
    <group>
      <Shadow r={7} />
      <Cyl p={[0, 0, 1.5]} r0={7} r1={7} h={3} c="#555b61" seg={18} />
      <group position={[0, 0, up]}>
        <Cyl p={[0, 0, 15]} r0={2.6} r1={2.6} h={24} c="#e9edf1" seg={14} />
        <mesh position={[0, 0, 29]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[2.6, 6, 14]} /><meshStandardMaterial color="#c62828" /></mesh>
        {[0, 1, 2, 3].map((j) => <Box key={j} p={[Math.cos(j * 1.57) * 3, Math.sin(j * 1.57) * 3, 5]} s={[0.6, 3, 5]} c="#c62828" r={[0, 0, j * 1.57]} />)}
        {launch > 0 && t > launch && <mesh position={[0, 0, -3]}><sphereGeometry args={[4 + Math.sin(t * 40) * 0.8, 10, 8]} /><meshBasicMaterial color="#ffc070" transparent opacity={0.9} /></mesh>}
      </group>
    </group>
  );
};
const Drone: React.FC<{t: number; i: number}> = ({t, i}) => {
  const a = t * 1.3 + i * 2.1; const r = 40 + (i % 3) * 18;
  return (
    <group position={[Math.cos(a) * r, Math.sin(a) * r, 48 + Math.sin(t * 3 + i) * 4]} rotation={[0, 0, a + Math.PI / 2]}>
      <Box p={[0, 0, 0]} s={[6, 6, 1.6]} c="#2b2f33" />
      {[[-4, -4], [4, -4], [-4, 4], [4, 4]].map(([x, y], j) => <mesh key={j} position={[x, y, 1]}><cylinderGeometry args={[2.4, 2.4, 0.2, 12]} /><meshBasicMaterial color="#9fd3ff" transparent opacity={0.45} /></mesh>)}
      <mesh position={[0, 0, -1]}><sphereGeometry args={[0.8, 8, 6]} /><meshBasicMaterial color="#ff3b30" /></mesh>
    </group>
  );
};
// puente con pilares: explota en tBoom (pedazos que saltan)
const Bridge: React.FC<{t: number; boom: number; len: number}> = ({t, boom, len}) => {
  const n = 9; const u = boom > 0 ? Math.max(0, t - boom) : 0;
  return (
    <group>
      {Array.from({length: n}, (_, i) => { const x = -len / 2 + (i + 0.5) * len / n; const fly = u > 0 ? 1 : 0; const vx = (rnd(i) - 0.5) * 60, vy = (rnd(i + 3) - 0.5) * 50, vz = 40 + rnd(i + 5) * 50;
        const px = x + vx * u, py = vy * u, pz = 14 + vz * u - 70 * u * u; if (pz < -30) return null;
        return <group key={i} position={[px, py, pz]} rotation={[fly * u * (rnd(i) * 6 - 3), fly * u * (rnd(i + 1) * 6 - 3), 0]}><Box p={[0, 0, 0]} s={[len / n * 1.02, 12, 3]} c="#9a8f80" /><Box p={[0, 5.6, 2.2]} s={[len / n, 0.8, 1.6]} c="#6d6458" /><Box p={[0, -5.6, 2.2]} s={[len / n, 0.8, 1.6]} c="#6d6458" /></group>; })}
      {[-0.3, 0, 0.3].map((f, i) => <Box key={i} p={[f * len, 0, 6]} s={[4, 8, 12 * (u > 0 ? Math.max(0.2, 1 - u) : 1)]} c="#7f766a" />)}
      {u > 0 && u < 2.2 && Array.from({length: 7}, (_, j) => <sprite key={j} position={[(rnd(j) - 0.5) * len, (rnd(j + 2) - 0.5) * 20, 10 + u * 20]} scale={[30 + u * 50, 30 + u * 50, 1]}><spriteMaterial map={puff()} color={u < 0.4 ? '#ffb060' : '#8a8580'} transparent opacity={0.9 * (1 - u / 2.2)} depthWrite={false} /></sprite>)}
      {u > 0 && u < 0.5 && <pointLight position={[0, 0, 30]} intensity={2e5} distance={400} color="#ffb060" />}
    </group>
  );
};

// ---------------------------------------------------------------- sprites de countryballs
// s = [t0, t1, x, y, size, img|'ball:CODE', o]  o: {path:[[t,x,y]], fall:t, bob:1, jump:t, flash:t}
const BallSprite: React.FC<{t: number; s: any[]}> = ({t, s}) => {
  const [t0, t1, x0, y0, size, img, o = {}] = s;
  const tex = img.startsWith('ball:') ? ballTex(img.slice(5)) : useTex(img);
  const a = pop(t, t0, 0.35) * (1 - ss(t1 - 0.25, t1, t));
  let x = x0, y = y0;
  if (o.path) { const P = o.path as number[][]; if (t <= P[0][0]) { x = P[0][1]; y = P[0][2]; } else if (t >= P[P.length - 1][0]) { x = P[P.length - 1][1]; y = P[P.length - 1][2]; } else for (let i = 1; i < P.length; i++) if (t < P[i][0]) { const u = ss(P[i - 1][0], P[i][0], t); x = P[i - 1][1] + (P[i][1] - P[i - 1][1]) * u; y = P[i - 1][2] + (P[i][2] - P[i - 1][2]) * u; break; } }
  const fall = o.fall ? ss(o.fall, o.fall + 0.45, t) : 0;
  const jump = o.jump ? Math.max(0, Math.sin(Math.min(1, Math.max(0, (t - o.jump) / 0.5)) * Math.PI)) * size * 0.5 : 0;
  const bob = (o.bob ?? 1) * Math.abs(Math.sin(t * 5 + x0)) * size * 0.04;
  const sq = 1 + 0.06 * Math.sin(t * 10 + y0) * (o.bob ?? 1);
  const w = size * a * sq * (1 + fall * 0.3), h = size * a / sq * (1 - fall * 0.75);
  const im: any = tex.image; const ar = o.ar ?? (im && (im.naturalWidth || im.width) ? (im.naturalHeight || im.height) / (im.naturalWidth || im.width) : 1);
  if (a <= 0.001) return null;
  return (
    <group position={[x, y, 0]}>
      <mesh position={[0, 0, 0.4]} scale={[w * 0.42, w * 0.18, 1]}><circleGeometry args={[1, 24]} /><meshBasicMaterial color="#000" transparent opacity={0.4 * (1 - fall * 0.5)} depthWrite={false} /></mesh>
      <sprite center={new THREE.Vector2(0.5, 0)} position={[0, 0, bob + jump]} scale={[w, h * ar, 1]}>
        <spriteMaterial map={tex} transparent depthWrite={false} rotation={fall * (o.dir ?? 1) * 1.4} color={fall > 0 ? new THREE.Color(1, 1 - fall * 0.5, 1 - fall * 0.5) : undefined} opacity={1 - ss(o.fall ? o.fall + 0.6 : 1e9, o.fall ? o.fall + 1.2 : 1e9, t)} />
      </sprite>
      {o.flash && t > o.flash && t < o.flash + 0.5 && <sprite position={[0, 0, size * 0.6]} scale={[size * 2.4 * (t - o.flash + 0.2), size * 2.4 * (t - o.flash + 0.2), 1]}><spriteMaterial map={puff()} color="#fff6c0" transparent opacity={1 - (t - o.flash) / 0.5} blending={THREE.AdditiveBlending} depthWrite={false} /></sprite>}
    </group>
  );
};

// ---------------------------------------------------------------- formación instanciada de soldados
// a = [t0, t1, x0, y0, x1, y1, w, h, n, col, o]  o: {die:[t0,t1] (caen de delante hacia atrás), head:col}
const Army: React.FC<{t: number; a: any[]}> = ({t, a}) => {
  const [t0, t1, x0, y0, x1, y1, W, H, n, col, o = {}] = a;
  const body = useRef<THREE.InstancedMesh>(null); const head = useRef<THREE.InstancedMesh>(null); const gun = useRef<THREE.InstancedMesh>(null);
  const dir = Math.atan2(y1 - y0, x1 - x0);
  const u = ss(t0, t1, t) ; const lin = cl((t - t0) / (t1 - t0), 0, 1); const mv = o.ease === 'lin' ? lin : u;
  const cx = x0 + (x1 - x0) * mv, cy = y0 + (y1 - y0) * mv;
  const fadeIn = ss(t0 - 0.3, t0 + 0.2, t);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3(); const e = new THREE.Euler();
    const cols = Math.max(1, Math.round(Math.sqrt(n * W / Math.max(1, H)))); const rows = Math.ceil(n / cols);
    for (let i = 0; i < n; i++) {
      const c = i % cols, r = Math.floor(i / cols);
      const lx = (r / Math.max(1, rows - 1) - 0.5) * H + (rnd(i) - 0.5) * 3, ly = (c / Math.max(1, cols - 1) - 0.5) * W + (rnd(i + 7) - 0.5) * 3;
      const px = cx + lx * Math.cos(dir) - ly * Math.sin(dir), py = cy + lx * Math.sin(dir) + ly * Math.cos(dir);
      let dead = 0; if (o.die) { const front = 1 - r / Math.max(1, rows - 1); const td = o.die[0] + (1 - front) * (o.die[1] - o.die[0]) + rnd(i + 3) * 0.3; dead = ss(td, td + 0.25, t); }
      const step = Math.abs(Math.sin(t * 12 + i)) * (1 - dead) * (u < 1 ? 1 : 0.2);
      e.set(dead * 1.5, 0, dir); q.setFromEuler(e); const s = fadeIn * (1 - ss(t1 + (o.hold ?? 0) - 0.2, t1 + (o.hold ?? 0), t) * (o.vanish ? 1 : 0));
      const k0 = o.sc ?? 1; sc.set(s * k0, s * k0, s * k0);
      p.set(px, py, (2.6 + step * 0.9 - dead * 1.8) * k0); m.compose(p, q, sc); body.current?.setMatrixAt(i, m);
      p.set(px + Math.sin(dead * 1.5) * 3.2 * k0 * Math.cos(dir), py + Math.sin(dead * 1.5) * 3.2 * k0 * Math.sin(dir), (6.2 + step * 0.9 - dead * 4.5) * k0); m.compose(p, q, sc); head.current?.setMatrixAt(i, m);
      p.set(px + 1.6 * k0 * Math.cos(dir), py + 1.6 * k0 * Math.sin(dir), (4 + step * 0.9 - dead * 3) * k0); m.compose(p, q, sc); gun.current?.setMatrixAt(i, m);
    }
    for (const r of [body, head, gun]) if (r.current) r.current.instanceMatrix.needsUpdate = true;
  });
  if (t < t0 - 0.3 || (o.vanish && t > t1 + (o.hold ?? 0))) return null;
  return (
    <group>
      <instancedMesh ref={body} args={[undefined, undefined, n]} frustumCulled={false}><boxGeometry args={[2.2, 2.4, 4.4]} /><meshStandardMaterial color={col} roughness={0.7} /></instancedMesh>
      <instancedMesh ref={head} args={[undefined, undefined, n]} frustumCulled={false}><sphereGeometry args={[1.5, 8, 6]} /><meshStandardMaterial color={o.head || '#3d4a2c'} roughness={0.7} /></instancedMesh>
      <instancedMesh ref={gun} args={[undefined, undefined, n]} frustumCulled={false}><boxGeometry args={[4.2, 0.5, 0.5]} /><meshStandardMaterial color="#1b1b1b" /></instancedMesh>
    </group>
  );
};

// ---------------------------------------------------------------- número 3D (capas de sprites)
const Num3D: React.FC<{t: number; n: any[]}> = ({t, n}) => {
  const [t0, t1, x, y, txt, size, col] = n; const a = pop(t, t0, 0.45) * (1 - ss(t1 - 0.3, t1, t)); if (a <= 0) return null;
  const front = textTex(txt, col || '#ffd23f'); const side = textTex(txt, '#4a0a06');
  const rise = ss(t0, t0 + 0.6, t);
  const H = size * 0.25;
  return <group position={[x, y, 0]}>
    <mesh position={[0, 0, 0.5]} scale={[size * 0.55 * a, size * 0.09 * a, 1]}><circleGeometry args={[1, 32]} /><meshBasicMaterial color="#000" transparent opacity={0.4} depthWrite={false} /></mesh>
    {Array.from({length: 10}, (_, i) => <sprite key={i} center={new THREE.Vector2(0.5, 0)} position={[0, i * size * 0.004, (H * 0.2 + rise * H * 0.6) - i * size * 0.0022]} scale={[size * a, size * 0.25 * a, 1]}><spriteMaterial map={i === 0 ? front : side} transparent depthWrite={false} /></sprite>).reverse()}
  </group>;
};

// ---------------------------------------------------------------- país que se hunde (bloque con bandera)
const PIECES = (WJ as any).pieces as any[];
const shapesOf = (d: string): THREE.Shape[] => { const out: THREE.Shape[] = []; for (const sub of d.split('M').filter((x) => x.trim())) { const nums = sub.replace(/[LZz]/g, ' ').trim().split(/[\s,]+/).map(Number).filter((v) => !isNaN(v)); if (nums.length < 8) continue; const sh = new THREE.Shape(); sh.moveTo(nums[0] * 4, nums[1] * 4); for (let i = 2; i + 1 < nums.length; i += 2) sh.lineTo(nums[i] * 4, nums[i + 1] * 4); out.push(sh); } return out; };
const SG = new Map<string, any>();
const sinkGeo = (code: string) => { let g = SG.get(code); if (g) return g; const ps = PIECES.filter((p) => p.code === code).sort((a, b) => b.area - a.area).slice(0, 6); const geo = new THREE.ExtrudeGeometry(ps.flatMap((p) => shapesOf(p.d)), {depth: 1, bevelEnabled: false, curveSegments: 1}); const bb = [Math.min(...ps.map((p) => p.bbox[0])) * 4, Math.min(...ps.map((p) => p.bbox[1])) * 4, Math.max(...ps.map((p) => p.bbox[2])) * 4, Math.max(...ps.map((p) => p.bbox[3])) * 4]; g = {geo, bb}; SG.set(code, g); return g; };
const Sink: React.FC<{t: number; s: any[]}> = ({t, s}) => {
  const [t0, t1, code, H, tSink] = s; const k = KOF[code];
  const {geo, bb} = useMemo(() => sinkGeo(code), [code]);
  const mats = useMemo(() => { const tx = flagTexK(k).clone(); const bw = bb[2] - bb[0], bh = bb[3] - bb[1]; tx.repeat.set(1 / bw, -1 / bh); tx.offset.set(-bb[0] / bw, bb[3] / bh); tx.needsUpdate = true;
    return [new THREE.MeshStandardMaterial({map: tx, roughness: 0.6, transparent: true}), new THREE.MeshStandardMaterial({color: new THREE.Color(MAINCOL[k] || '#888').multiplyScalar(0.4), roughness: 0.9, transparent: true, emissive: new THREE.Color('#ff3b1a'), emissiveIntensity: 0})]; }, [code]);
  const rise = ss(t0, t0 + 0.6, t); const sink = ss(tSink, tSink + 1.4, t); const op = 1 - ss(t1 - 0.4, t1, t);
  const shake = sink > 0 && sink < 1 ? Math.sin(t * 60) * 0.004 : 0;
  (mats[0] as any).opacity = op; (mats[1] as any).opacity = op; (mats[1] as any).emissiveIntensity = sink * 0.9;
  if (t < t0 || op <= 0) return null;
  const cx = (bb[0] + bb[2]) / 2, cy = (bb[1] + bb[3]) / 2; const span = Math.max(bb[2] - bb[0], bb[3] - bb[1]);
  return <group>
    <group position={[cx, cy, 0]} rotation={[shake + sink * 0.08, sink * 0.05, 0]}><mesh geometry={geo} material={mats} position={[-cx, -cy, H * (rise - sink * 1.6)]} scale={[1, 1, H]} /></group>
    {sink > 0 && sink < 1 && Array.from({length: 10}, (_, j) => { const a2 = j / 10 * 6.28; return <sprite key={j} position={[cx + Math.cos(a2) * span * 0.45, cy + Math.sin(a2) * span * 0.35, 6 + sink * 20]} scale={[span * 0.35 * (0.5 + sink), span * 0.35 * (0.5 + sink), 1]}><spriteMaterial map={puff()} color="#9a8a7a" transparent opacity={0.8 * (1 - sink)} depthWrite={false} /></sprite>; })}
  </group>;
};

// ---------------------------------------------------------------- bola de polvo del oeste
const Tumble: React.FC<{t: number; d: any[]}> = ({t, d}) => {
  const [t0, t1, x0, y0, x1, y1, size] = d; if (t < t0 || t > t1) return null; const u = (t - t0) / (t1 - t0);
  const x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u; const hop = Math.abs(Math.sin(u * Math.PI * 5)) * size * 0.35;
  return <group position={[x, y, 0]}>
    <mesh position={[0, 0, 0.4]} scale={[size * 0.4, size * 0.16, 1]}><circleGeometry args={[1, 20]} /><meshBasicMaterial color="#000" transparent opacity={0.3} depthWrite={false} /></mesh>
    <sprite center={new THREE.Vector2(0.5, 0.5)} position={[0, 0, size * 0.5 + hop]} scale={[size, size, 1]}><spriteMaterial map={tumbleTex()} transparent depthWrite={false} rotation={-u * 14} /></sprite>
    {[0, 1, 2].map((j) => <sprite key={j} position={[-(x1 - x0) * 0.04 * (j + 1), -(y1 - y0) * 0.04 * (j + 1), 3]} scale={[size * (0.5 + j * 0.3), size * (0.35 + j * 0.2), 1]}><spriteMaterial map={puff()} color="#c9a978" transparent opacity={0.45 - j * 0.12} depthWrite={false} /></sprite>)}
  </group>;
};

// ---------------------------------------------------------------- prop genérico con trayecto
// p = [t0, t1, kind, x, y, scale, rot, o]  o: {path:[[t,x,y]], col:'US', boom:t, fire:[t0,t1], launch:t, len}
const pathAt = (P: number[][] | undefined, t: number, x: number, y: number): number[] => {
  if (!P || !P.length) return [x, y, 0];
  if (t <= P[0][0]) { const d = P.length > 1 ? Math.atan2(P[1][2] - P[0][2], P[1][1] - P[0][1]) : 0; return [P[0][1], P[0][2], d]; }
  for (let i = 1; i < P.length; i++) if (t < P[i][0]) { const u = (t - P[i - 1][0]) / (P[i][0] - P[i - 1][0]); return [P[i - 1][1] + (P[i][1] - P[i - 1][1]) * u, P[i - 1][2] + (P[i][2] - P[i - 1][2]) * u, Math.atan2(P[i][2] - P[i - 1][2], P[i][1] - P[i - 1][1])]; }
  const l = P[P.length - 1], m = P[Math.max(0, P.length - 2)]; return [l[1], l[2], Math.atan2(l[2] - m[2], l[1] - m[1])];
};
const Prop: React.FC<{t: number; p: any[]; i: number}> = ({t, p, i}) => {
  const [t0, t1, kind, x, y, sc, rot, o = {}] = p;
  const a = pop(t, t0 + (o.delay ?? 0), 0.4) * (1 - ss(t1 - 0.3, t1, t)); if (a <= 0.001) return null;
  const [px, py, d] = pathAt(o.path, t, x, y); const r = o.path ? d : (rot || 0);
  const fire = o.fire ? Math.max(0, Math.sin(((t - o.fire[0]) * 3) % 1 * Math.PI)) * (t > o.fire[0] && t < o.fire[1] ? 1 : 0) : 0;
  const col = o.col ? (MAINCOL[KOF[o.col]] || '#556b2f') : '#556b2f';
  let body: React.ReactNode = null;
  if (kind === 'tank') body = <Tank col={col} t={t} fire={fire} />;
  else if (kind === 'ship' || kind === 'carrier' || kind === 'landing') body = <Ship kind={kind} col={o.col || 'US'} t={t} i={i} />;
  else if (kind === 'tower') body = <Tower t={t} />;
  else if (kind === 'radar') body = <Radar t={t + i} />;
  else if (kind === 'hangar') body = <Hangar />;
  else if (kind === 'silo') body = <Silo t={t} launch={o.launch || 0} />;
  else if (kind === 'drones') body = <>{Array.from({length: o.n || 4}, (_, j) => <Drone key={j} t={t} i={j + i} />)}</>;
  else if (kind === 'bridge') body = <Bridge t={t} boom={o.boom || 0} len={o.len || 120} />;
  else if (kind === 'flag') body = <group><Cyl p={[0, 0, 15]} r0={0.6} r1={0.5} h={30} c="#ddd" seg={6} /><mesh position={[6, 0, 26]} rotation={[Math.PI / 2, 0, 0]} scale={[12, 8, 1]} material={useMemo(() => new THREE.MeshBasicMaterial({map: flagTexK(KOF[o.col || 'US'] ?? 0), side: THREE.DoubleSide}), [o.col])}><planeGeometry args={[1, 1, 8, 1]} /></mesh></group>;
  return <group position={[px, py, 0]} rotation={[0, 0, r]} scale={[sc * a, sc * a, sc * a]}>{body}</group>;
};

// ---------------------------------------------------------------- capa
export const vsActive = (Z: any, t: number) => {
  const w = (l: any[] | undefined, p = 0.5) => (l || []).some((x) => t >= x[0] - p && t < x[1] + p);
  return w(Z.sprites) || w(Z.props) || w(Z.armies, 1) || w(Z.nums) || w(Z.sinks) || w(Z.tumble);
};
export const VsLayer: React.FC<{Z: any; t: number}> = ({Z, t}) => {
  const win = (l: any[] | undefined, pad = 0.5) => (l || []).map((x, i) => [x, i] as [any, number]).filter(([x]) => t >= x[0] - pad && t < x[1] + pad);
  return <>
    {win(Z.sinks).map(([s, i]) => <Sink key={'k' + i} t={t} s={s} />)}
    {win(Z.props).map(([p, i]) => <Prop key={'p' + i} t={t} p={p} i={i} />)}
    {win(Z.armies, 1).map(([a, i]) => <Army key={'a' + i} t={t} a={a} />)}
    {win(Z.tumble).map(([d, i]) => <Tumble key={'w' + i} t={t} d={d} />)}
    {win(Z.sprites).map(([s, i]) => <BallSprite key={'s' + i} t={t} s={s} />)}
    {win(Z.nums).map(([n, i]) => <Num3D key={'n' + i} t={t} n={n} />)}
  </>;
};
