// 3D sobre el propio mapa: inclinación de cámara + capa three.js alineada con el mapa
// (columnas de infección, hongo nuclear, murallas, cúpula de la cura, rayos, nubes, países en relieve)
import React, {useMemo, useLayoutEffect} from 'react';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import WJ from './world.json';
import {KOF, MAINCOL, flagBmp} from './HexWorld';
import {zfrac} from './ZombHud';

const VW = 1920, VH = 1080;
export const PERSP = 1600;
const cl = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const ss = (a: number, b: number, x: number) => { const u = cl((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
type Cam = {cx: number; cy: number; s: number};

// ---------------------------------------------------------------- inclinación
// Z.tilt: [[t, ax, az], ...] (grados). Interpolación suave entre claves.
export const tiltAt = (Z: any, t: number): {ax: number; az: number} => {
  const k = (Z && Z.tilt) as number[][] | undefined; if (!k || !k.length) return {ax: 0, az: 0};
  if (t <= k[0][0]) return {ax: k[0][1], az: k[0][2]};
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const a = k[i - 1], b = k[i]; const u = ss(a[0], b[0], t); return {ax: a[1] + (b[1] - a[1]) * u, az: a[2] + (b[2] - a[2]) * u}; }
  const l = k[k.length - 1]; return {ax: l[1], az: l[2]};
};
export const tiltCss = (Z: any, t: number) => { const {ax, az} = tiltAt(Z, t); if (Math.abs(ax) < 0.05 && Math.abs(az) < 0.05) return ''; return `perspective(${PERSP}px) rotateX(${ax}deg) rotateZ(${az}deg) `; };

// cámara three que reproduce la perspectiva CSS
const PCam: React.FC = () => {
  const cam = useThree((st) => st.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => { cam.position.set(0, 0, PERSP); cam.lookAt(0, 0, 0); cam.fov = 2 * Math.atan(VH / 2 / PERSP) * 180 / Math.PI; cam.near = 10; cam.far = 20000; cam.updateProjectionMatrix(); });
  return null;
};

// ---------------------------------------------------------------- geometría de países (world.json, coords x4)
const PIECES = (WJ as any).pieces as any[];
const shapesOf = (d: string): THREE.Shape[] => {
  const out: THREE.Shape[] = [];
  for (const sub of d.split('M').filter((x) => x.trim())) {
    const nums = sub.replace(/[LZz]/g, ' ').trim().split(/[\s,]+/).map(Number).filter((v) => !isNaN(v));
    if (nums.length < 8) continue;
    const sh = new THREE.Shape(); sh.moveTo(nums[0] * 4, nums[1] * 4);
    for (let i = 2; i + 1 < nums.length; i += 2) sh.lineTo(nums[i] * 4, nums[i + 1] * 4);
    out.push(sh);
  }
  return out;
};
const GEO = new Map<string, {geo: THREE.ExtrudeGeometry; bb: number[]}>();
const countryGeo = (code: string) => {
  let g = GEO.get(code); if (g) return g;
  const ps = PIECES.filter((p) => p.code === code).sort((a, b) => b.area - a.area).slice(0, 3);
  const shapes = ps.flatMap((p) => shapesOf(p.d));
  const geo = new THREE.ExtrudeGeometry(shapes, {depth: 1, bevelEnabled: false, curveSegments: 1});
  const bb = [Math.min(...ps.map((p) => p.bbox[0])) * 4, Math.min(...ps.map((p) => p.bbox[1])) * 4, Math.max(...ps.map((p) => p.bbox[2])) * 4, Math.max(...ps.map((p) => p.bbox[3])) * 4];
  g = {geo, bb}; GEO.set(code, g); return g;
};
const FLAGTEX = new Map<number, THREE.Texture>();
const flagTex = (k: number, bb: number[]) => {
  let tx = FLAGTEX.get(k); if (tx) return tx;
  const src = flagBmp(k) as any; const c = document.createElement('canvas'); c.width = 256; c.height = 170; const g = c.getContext('2d')!;
  if (src) g.drawImage(src, 0, 0, 256, 170); else { g.fillStyle = MAINCOL[k]; g.fillRect(0, 0, 256, 170); }
  tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
  const bw = bb[2] - bb[0], bh = bb[3] - bb[1]; tx.repeat.set(1 / bw, -1 / bh); tx.offset.set(-bb[0] / bw, bb[3] / bh); tx.wrapS = tx.wrapT = THREE.ClampToEdgeWrapping;
  FLAGTEX.set(k, tx); return tx;
};
const Block: React.FC<{code: string; h: number; op: number; glow: string}> = ({code, h, op, glow}) => {
  const k = KOF[code]; const {geo, bb} = useMemo(() => countryGeo(code), [code]);
  const top = useMemo(() => new THREE.MeshStandardMaterial({map: flagTex(k, bb), roughness: 0.6, side: THREE.DoubleSide, transparent: true}), [k]);
  const side = useMemo(() => new THREE.MeshStandardMaterial({color: new THREE.Color(MAINCOL[k] || '#888').multiplyScalar(0.45), roughness: 0.8, side: THREE.DoubleSide, transparent: true, emissive: new THREE.Color(glow), emissiveIntensity: 0.25}), [k, glow]);
  top.opacity = op; side.opacity = op;
  if (h < 0.5) return null;
  return <mesh geometry={geo} material={[top, side]} scale={[1, 1, h]} />;
};

// ---------------------------------------------------------------- texturas procedurales
let BRICK: THREE.Texture | null = null;
const brickTex = () => {
  if (BRICK) return BRICK; const c = document.createElement('canvas'); c.width = 128; c.height = 64; const g = c.getContext('2d')!;
  g.fillStyle = '#8d8676'; g.fillRect(0, 0, 128, 64);
  for (let r = 0; r < 4; r++) for (let i = 0; i < 5; i++) { const x = i * 32 - (r % 2) * 16, y = r * 16; g.fillStyle = `hsl(40,${8 + rnd(r * 9 + i) * 8}%,${44 + rnd(r * 7 + i) * 14}%)`; g.fillRect(x + 1.5, y + 1.5, 29, 13); }
  BRICK = new THREE.CanvasTexture(c); BRICK.wrapS = BRICK.wrapT = THREE.RepeatWrapping; BRICK.colorSpace = THREE.SRGBColorSpace; return BRICK;
};
let PUFF: THREE.Texture | null = null;
const puffTex = () => {
  if (PUFF) return PUFF; const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!;
  for (let i = 0; i < 14; i++) { const x = 30 + rnd(i) * 68, y = 34 + rnd(i + 5) * 60, r = 18 + rnd(i + 2) * 26; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
  PUFF = new THREE.CanvasTexture(c); return PUFF;
};

// ---------------------------------------------------------------- piezas
const Pillar: React.FC<{x: number; y: number; h: number; col: string; t: number; i: number}> = ({x, y, h, col, t, i}) => {
  if (h < 1) return null; const pulse = 0.85 + 0.15 * Math.sin(t * 4 + i);
  return (
    <group position={[x, y, 0]}>
      <mesh position={[0, 0, h / 2]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[7, 12, h, 16, 1, true]} /><meshBasicMaterial color={col} transparent opacity={0.85 * pulse} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 0, h / 2]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[18, 30, h * 1.02, 16, 1, true]} /><meshBasicMaterial color={col} transparent opacity={0.22 * pulse} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      <mesh position={[0, 0, h]}><sphereGeometry args={[13, 14, 10]} /><meshBasicMaterial color="#eaffc0" /></mesh>
      <mesh position={[0, 0, 0.5]}><circleGeometry args={[46 * pulse, 24]} /><meshBasicMaterial color={col} transparent opacity={0.35} depthWrite={false} /></mesh>
    </group>
  );
};
const Nuke: React.FC<{t: number; x: number; y: number; R: number}> = ({t, x, y, R}) => {
  const u = t; // segundos desde la detonación
  const grow = ss(0, 3.2, u); const fade = 1 - ss(5.5, 8, u); if (fade <= 0) return null;
  const hot = new THREE.Color('#fff2a0').lerp(new THREE.Color('#ff6a1a'), ss(0, 1.2, u)).lerp(new THREE.Color('#5a4a40'), ss(1.5, 5, u));
  const H = R * 2.2 * grow; const capR = R * (0.25 + 0.75 * grow);
  return (
    <group position={[x, y, 0]}>
      {/* onda expansiva en el suelo */}
      <mesh position={[0, 0, 1]}><ringGeometry args={[R * 3.2 * ss(0, 2.5, u) * 0.92, R * 3.2 * ss(0, 2.5, u) + 1, 64]} /><meshBasicMaterial color="#fff0c0" transparent opacity={0.8 * (1 - ss(1.5, 3, u))} side={THREE.DoubleSide} depthWrite={false} /></mesh>
      <mesh position={[0, 0, 0.8]}><circleGeometry args={[R * 1.4 * grow, 48]} /><meshBasicMaterial color="#2a1a10" transparent opacity={0.55 * fade} depthWrite={false} /></mesh>
      {/* columna */}
      <mesh position={[0, 0, H / 2]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[R * 0.16, R * 0.32, H, 20]} /><meshStandardMaterial color={hot} emissive={hot} emissiveIntensity={1.2 - ss(1, 5, u)} transparent opacity={fade} roughness={1} /></mesh>
      {/* anillo de condensación */}
      <mesh position={[0, 0, H * 0.55]}><torusGeometry args={[R * 0.5 * grow, R * 0.07, 10, 40]} /><meshStandardMaterial color="#e8e2d8" transparent opacity={0.7 * fade * ss(0.8, 2, u)} roughness={1} /></mesh>
      {/* sombrero */}
      {Array.from({length: 14}, (_, i) => { const a = (i / 14) * Math.PI * 2 + u * 0.3; const rr = capR * 0.6; return <mesh key={i} position={[Math.cos(a) * rr, Math.sin(a) * rr, H + Math.sin(i * 1.7) * capR * 0.12]}><sphereGeometry args={[capR * (0.42 + rnd(i) * 0.15), 16, 12]} /><meshStandardMaterial color={hot} emissive={hot} emissiveIntensity={1.4 - ss(1, 5, u) * 1.2} transparent opacity={fade} roughness={1} /></mesh>; })}
      <mesh position={[0, 0, H + capR * 0.15]}><sphereGeometry args={[capR * 0.75, 20, 14]} /><meshStandardMaterial color={hot} emissive={hot} emissiveIntensity={1.6 - ss(1, 5, u) * 1.3} transparent opacity={fade} roughness={1} /></mesh>
      <pointLight position={[0, 0, H]} intensity={(1 - ss(0, 3, u)) * 4e6} distance={R * 12} color="#ffb060" />
    </group>
  );
};
// muralla a lo largo de una polilínea (coords de mundo); se levanta y luego se rompe
const Wall: React.FC<{t: number; w: any[]}> = ({t, w}) => {
  const [t0, tb, t1, pts, h] = w; const tex = useMemo(() => brickTex(), []);
  const segs = useMemo(() => { const out: number[][] = []; for (let i = 0; i + 1 < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1]; const L = Math.hypot(bx - ax, by - ay); const n = Math.max(1, Math.round(L / 34)); for (let j = 0; j < n; j++) { const u0 = j / n, u1 = (j + 1) / n; out.push([ax + (bx - ax) * (u0 + u1) / 2, ay + (by - ay) * (u0 + u1) / 2, L / n, Math.atan2(by - ay, bx - ax)]); } } return out; }, [pts]);
  const mat = useMemo(() => { const m = new THREE.MeshStandardMaterial({map: tex, roughness: 0.9, side: THREE.DoubleSide}); return m; }, [tex]);
  const fade = 1 - ss(t1 - 0.6, t1, t); if (t < t0 || fade <= 0) return null;
  return (
    <group>
      {segs.map((s, i) => {
        const rise = ss(t0 + (i / segs.length) * 1.6, t0 + (i / segs.length) * 1.6 + 0.5, t);
        const br = tb > 0 ? ss(tb + rnd(i) * 0.8, tb + rnd(i) * 0.8 + 0.6, t) : 0; const fall = br * br;
        const hh = h * rise; const dx = (rnd(i + 3) - 0.5) * 60 * br, dy = (rnd(i + 5) - 0.5) * 60 * br;
        return <group key={i} position={[s[0] + dx, s[1] + dy, hh / 2 - fall * h * 0.45]} rotation={[br * (rnd(i) - 0.5) * 2.4, br * (rnd(i + 1) - 0.5) * 2.4, s[3]]}>
          <mesh material={mat} scale={[s[2] * 1.02, 9, Math.max(0.01, hh)]}><boxGeometry args={[1, 1, 1]} /></mesh>
          {i % 2 === 0 && hh > 2 && <mesh material={mat} position={[0, 0, hh / 2 + 3]} scale={[s[2] * 0.45, 10, 6]}><boxGeometry args={[1, 1, 1]} /></mesh>}
          {i % 6 === 0 && hh > 2 && <mesh material={mat} position={[0, 0, hh * 0.15]} scale={[14, 16, hh * 1.5]}><boxGeometry args={[1, 1, 1]} /></mesh>}
          {i % 6 === 0 && hh > 2 && br < 0.2 && <pointLight position={[0, 0, hh * 1.1]} intensity={9000} distance={160} color="#ffd890" />}
        </group>;
      })}
    </group>
  );
};
const Dome: React.FC<{t: number; d: any[]}> = ({t, d}) => {
  const [t0, t1, x, y, R] = d; const u = (t - t0) / (t1 - t0); if (u < 0 || u > 1) return null;
  const r = R * Math.pow(ss(0, 1, u), 0.8); const op = 1 - ss(0.75, 1, u);
  const mat = useMemo(() => new THREE.ShaderMaterial({transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, uniforms: {op: {value: 1}, tt: {value: 0}},
    vertexShader: 'varying vec3 vN; varying vec3 vP; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vP = mv.xyz; gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'uniform float op; uniform float tt; varying vec3 vN; varying vec3 vP; void main(){ float f = 1.0 - abs(dot(normalize(vN), normalize(-vP))); float rim = pow(f, 2.2); float bands = 0.5+0.5*sin(vP.y*0.05 + tt*6.0); gl_FragColor = vec4(vec3(0.45,0.85,1.0)*(0.25+rim*1.6+bands*0.12), (0.12 + rim*0.75)*op); }'}), []);
  mat.uniforms.op.value = op; mat.uniforms.tt.value = t;
  return <mesh position={[x, y, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[r, r, r]} material={mat}><sphereGeometry args={[1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>;
};
const Beam: React.FC<{t: number; b: any[]; i: number}> = ({t, b, i}) => {
  const [t0, t1, x, y] = b; const u = (t - t0) / (t1 - t0); if (u < 0 || u > 1) return null; const a = Math.sin(u * Math.PI); const H = 900;
  return <group position={[x, y, 0]}>
    <mesh position={[0, 0, H / 2]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[16, 16, H, 12, 1, true]} /><meshBasicMaterial color="#bff0ff" transparent opacity={0.65 * a} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, 0, H / 2]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[42, 42, H, 12, 1, true]} /><meshBasicMaterial color="#2fa8ff" transparent opacity={0.25 * a} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, 0, 1]}><circleGeometry args={[70 * (0.6 + u), 24]} /><meshBasicMaterial color="#7fe0ff" transparent opacity={0.4 * a} depthWrite={false} /></mesh>
  </group>;
};
const Clouds: React.FC<{t: number; c: any[]; cam: Cam}> = ({t, c, cam}) => {
  const [t0, t1, seed] = c; const a = ss(t0, t0 + 1, t) * (1 - ss(t1 - 1, t1, t)); if (a <= 0) return null;
  const tex = useMemo(() => puffTex(), []);
  const n = 26; const span = 1500 / cam.s;
  return <group>{Array.from({length: n}, (_, i) => { const x = cam.cx + (rnd(i + seed) - 0.5) * span * 1.6 + t * 14, y = cam.cy + (rnd(i + seed * 3) - 0.5) * span; const z = 120 + rnd(i + 7) * 160; const sz = (220 + rnd(i + 9) * 260) / Math.max(0.6, cam.s);
    return <group key={i}>
      <sprite position={[x, y, z]} scale={[sz, sz * 0.7, 1]}><spriteMaterial map={tex} transparent opacity={0.75 * a} depthWrite={false} /></sprite>
      <mesh position={[x + 30, y + 30, 0.6]}><circleGeometry args={[sz * 0.32, 20]} /><meshBasicMaterial color="#000" transparent opacity={0.13 * a} depthWrite={false} /></mesh>
    </group>; })}</group>;
};

// ---------------------------------------------------------------- capa
export const ZombMap3D: React.FC<{D: any; t: number; cam: Cam}> = ({D, t, cam}) => {
  const Z = D.zomb; if (!Z) return null;
  const {ax, az} = tiltAt(Z, t);
  const win = (l: any[] | undefined, pad = 0) => (l || []).filter((x) => t >= x[0] - pad && t < x[1] + pad);
  const pillars = win(Z.pillars); const nukes = (Z.nukes || []).filter((n: any) => t >= n[0] && t < n[0] + 8);
  const walls = (Z.walls || []).filter((w: any) => t >= w[0] && t < w[2]); const domes = win(Z.domes); const beams = win(Z.beams); const clouds = win(Z.clouds); const blocks = win(Z.blocks);
  if (!pillars.length && !nukes.length && !walls.length && !domes.length && !beams.length && !clouds.length && !blocks.length) return null;
  const s = cam.s;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 12, pointerEvents: 'none'}}>
      <ThreeCanvas width={VW} height={VH} style={{position: 'absolute', inset: 0}} gl={{antialias: true, alpha: true}}>
        <PCam />
        <ambientLight intensity={0.75} />
        <directionalLight position={[-600, 800, 1400]} intensity={2.2} />
        <hemisphereLight args={['#cfe4ff', '#30402a', 0.6]} />
        <group rotation={[-ax * Math.PI / 180, 0, 0]}>
          <group rotation={[0, 0, -az * Math.PI / 180]}>
            <group position={[-cam.cx * s, cam.cy * s, 0]} scale={[s, -s, s]}>
              {blocks.map((b: any, i: number) => { const [t0, t1, codes, hmax, glow] = b; const op = ss(t0, t0 + 0.8, t) * (1 - ss(t1 - 0.8, t1, t)); return (codes as string[]).map((c) => { const k = KOF[c]; const f = zfrac(D, k, t); return <Block key={i + c} code={c} h={hmax * ss(t0, t0 + 1.2, t) * (1 - f) * (1 - ss(t1 - 0.8, t1, t))} op={op} glow={glow || '#ffffff'} />; }); })}
              {pillars.map((p: any, i: number) => { const [t0, t1, x, y, hm, col] = p; const h = hm * ss(t0, t0 + 1.4, t) * (1 - ss(t1 - 0.6, t1, t)); return <Pillar key={i} x={x} y={y} h={h} col={col || '#7bd83a'} t={t} i={i} />; })}
              {nukes.map((n: any, i: number) => <Nuke key={i} t={t - n[0]} x={n[1]} y={n[2]} R={n[3]} />)}
              {walls.map((w: any, i: number) => <Wall key={i} t={t} w={w} />)}
              {domes.map((d: any, i: number) => <Dome key={i} t={t} d={d} />)}
              {beams.map((b: any, i: number) => <Beam key={i} t={t} b={b} i={i} />)}
              {clouds.map((c: any, i: number) => <Clouds key={i} t={t} c={c} cam={cam} />)}
            </group>
          </group>
        </group>
      </ThreeCanvas>
    </div>
  );
};
