// Escenas 3D de la ventana pequeña (PiP): muralla de Europa (defensa / brecha) y laboratorio de la cura
import React, {useMemo, useLayoutEffect, useRef} from 'react';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';

const cl = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const ss = (a: number, b: number, x: number) => { const u = cl((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

const Cam: React.FC<{p: [number, number, number]; look: [number, number, number]; fov?: number}> = ({p, look, fov = 45}) => {
  const cam = useThree((st) => st.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => { cam.position.set(...p); cam.lookAt(...look); cam.fov = fov; cam.near = 0.1; cam.far = 400; cam.updateProjectionMatrix(); });
  return null;
};
const Inst: React.FC<{n: number; geo: THREE.BufferGeometry; mat: THREE.Material; fill: (i: number, m: THREE.Object3D) => boolean | void; shadow?: boolean}> = ({n, geo, mat, fill, shadow = true}) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const o = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    const m = ref.current; if (!m) return;
    for (let i = 0; i < n; i++) { o.position.set(0, 0, 0); o.rotation.set(0, 0, 0); o.scale.set(1, 1, 1); const vis = fill(i, o); if (vis === false) o.scale.set(0, 0, 0); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }
    m.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, mat, n]} frustumCulled={false} castShadow={shadow} receiveShadow={false} />;
};
// figura con piernas y brazos animados (zombi o soldado) mediante instancias por parte
type Fig = {x: number; z: number; ry: number; ph: number; sp: number; on: boolean; arms: number};
const G = {
  torso: new THREE.BoxGeometry(0.34, 0.42, 0.2), head: new THREE.SphereGeometry(0.15, 12, 10), leg: new THREE.BoxGeometry(0.12, 0.4, 0.13), arm: new THREE.BoxGeometry(0.1, 0.36, 0.1),
  helmet: new THREE.SphereGeometry(0.17, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), gun: new THREE.BoxGeometry(0.06, 0.06, 0.5),
};
const Figures: React.FC<{figs: Fig[]; skin: THREE.Material; cloth: THREE.Material; pants: THREE.Material; t: number; helmet?: THREE.Material; gun?: boolean}> = ({figs, skin, cloth, pants, t, helmet, gun}) => {
  const n = figs.length;
  const place = (o: THREE.Object3D, f: Fig, lx: number, ly: number, lz: number, rx = 0) => {
    const c = Math.cos(f.ry), s = Math.sin(f.ry); o.position.set(f.x + lx * c + lz * s, ly, f.z - lx * s + lz * c); o.rotation.set(rx, f.ry, 0, 'YXZ');
  };
  const sw = (f: Fig) => Math.sin(t * 7 * f.sp + f.ph) * 0.7;
  return (<>
    <Inst n={n} geo={G.torso} mat={cloth} fill={(i, o) => { const f = figs[i]; if (!f.on) return false; place(o, f, 0, 0.66 + Math.abs(Math.sin(t * 7 * f.sp + f.ph)) * 0.03, 0, f.arms > 0.5 ? 0.18 : 0); }} />
    <Inst n={n} geo={G.head} mat={skin} fill={(i, o) => { const f = figs[i]; if (!f.on) return false; place(o, f, 0, 1.0, f.arms > 0.5 ? 0.06 : 0); }} />
    {helmet && <Inst n={n} geo={G.helmet} mat={helmet} fill={(i, o) => { const f = figs[i]; if (!f.on) return false; place(o, f, 0, 1.04, 0); }} />}
    {[-1, 1].map((sd) => <Inst key={'l' + sd} n={n} geo={G.leg} mat={pants} fill={(i, o) => { const f = figs[i]; if (!f.on) return false; place(o, f, sd * 0.09, 0.24, 0, sd * sw(f) * f.sp); }} />)}
    {[-1, 1].map((sd) => <Inst key={'a' + sd} n={n} geo={G.arm} mat={f0(figs) ? skin : cloth} fill={(i, o) => { const f = figs[i]; if (!f.on) return false; place(o, f, sd * 0.23, 0.72, f.arms * 0.18, -f.arms * 1.45 + (1 - f.arms) * -sd * sw(f) * 0.8); }} />)}
    {gun && <Inst n={n} geo={G.gun} mat={pants} fill={(i, o) => { const f = figs[i]; if (!f.on) return false; place(o, f, 0.12, 0.8, 0.28); }} />}
  </>);
};
const f0 = (figs: Fig[]) => figs.length > 0 && figs[0].arms > 0.5;

let BRICK: THREE.Texture | null = null;
const brick = () => {
  if (BRICK) return BRICK; const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d')!;
  g.fillStyle = '#5e584c'; g.fillRect(0, 0, 256, 128);
  for (let r = 0; r < 8; r++) for (let i = 0; i < 9; i++) { const x = i * 32 - (r % 2) * 16, y = r * 16; g.fillStyle = `hsl(36,${6 + rnd(r * 9 + i) * 10}%,${42 + rnd(r * 7 + i) * 16}%)`; g.fillRect(x + 1.5, y + 1.5, 29, 13); g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(x + 1.5, y + 11, 29, 3.5); }
  BRICK = new THREE.CanvasTexture(c); BRICK.wrapS = BRICK.wrapT = THREE.RepeatWrapping; BRICK.repeat.set(1, 1); BRICK.colorSpace = THREE.SRGBColorSpace; return BRICK;
};
const Dust: React.FC<{t: number; n?: number; col?: string; area?: number; y0?: number}> = ({t, n = 120, col = '#d8c8a8', area = 30, y0 = 0}) => {
  const g = useMemo(() => new THREE.SphereGeometry(0.035, 5, 4), []); const m = useMemo(() => new THREE.MeshBasicMaterial({color: col, transparent: true, opacity: 0.5}), [col]);
  return <Inst n={n} geo={g} mat={m} shadow={false} fill={(i, o) => { o.position.set((rnd(i) - 0.5) * area + Math.sin(t * 0.3 + i) * 0.5, y0 + ((rnd(i + 3) * 6 + t * 0.15 * (0.5 + rnd(i + 1))) % 6), (rnd(i + 5) - 0.5) * area * 0.6 - 4); o.scale.setScalar(0.6 + rnd(i + 7) * 1.8); }} />;
};

// ---------------------------------------------------------------- MURALLA
export const WallScene: React.FC<{u: number; breach: boolean; w: number; h: number}> = ({u, breach, w, h}) => {
  const tex = useMemo(() => brick(), []);
  const wallM = useMemo(() => { const m = new THREE.MeshStandardMaterial({map: tex, roughness: 0.92}); return m; }, [tex]);
  const zSkin = useMemo(() => new THREE.MeshStandardMaterial({color: breach ? '#b0503a' : '#8fc45a', roughness: 0.7, emissive: breach ? '#400800' : '#0c2004'}), [breach]);
  const zCloth = useMemo(() => new THREE.MeshStandardMaterial({color: breach ? '#3a1410' : '#4a5a38', roughness: 0.9}), [breach]);
  const zPants = useMemo(() => new THREE.MeshStandardMaterial({color: '#2a2a30', roughness: 0.9}), []);
  const sSkin = useMemo(() => new THREE.MeshStandardMaterial({color: '#e0b090'}), []);
  const sCloth = useMemo(() => new THREE.MeshStandardMaterial({color: '#4a5a2e', roughness: 0.8}), []);
  const sHelm = useMemo(() => new THREE.MeshStandardMaterial({color: '#3a4a26', roughness: 0.5, metalness: 0.3}), []);
  const fM = useMemo(() => new THREE.MeshBasicMaterial({color: '#ffe8a0'}), []);
  const fG = useMemo(() => new THREE.SphereGeometry(0.11, 8, 6), []);
  const br = breach ? ss(1.6, 2.4, u) : 0;
  const NZ = 260;
  const zf: Fig[] = useMemo(() => [], []); zf.length = 0;
  for (let i = 0; i < NZ; i++) {
    const x = (rnd(i) - 0.5) * 30; const z0 = -5 - rnd(i + 1) * 16; const sp = 0.8 + rnd(i + 2) * 0.5;
    let z = z0 + u * sp * (breach ? 2.6 : 1.0);
    const gap = breach && Math.abs(x) < 3 + br * 1.8 && u > 2.1;
    if (!gap) z = Math.min(z, -0.9 - rnd(i + 4) * 0.7 - (i % 3) * 0.4);
    zf.push({x: gap ? x * (1 - 0.35 * ss(-1, 5, z)) : x, z, ry: (rnd(i + 8) - 0.5) * 0.5, ph: rnd(i) * 6, sp: z > z0 + 0.01 || gap ? sp : 0.25, on: z < 14, arms: 1});
  }
  const sf: Fig[] = Array.from({length: 14}, (_, i) => { const x = (i - 6.5) * 2.2; const gone = breach && Math.abs(x) < 3.6 && br > 0.25; return {x, z: 0.25, ry: Math.PI, ph: i, sp: 0, on: !gone, arms: 0.55}; });
  const camU = ss(0, 7, u);
  const flick = (i: number) => Math.sin(u * 31 + i * 2.3) > 0.55;
  return (
    <ThreeCanvas width={w} height={h} style={{position: 'absolute', inset: 0}} gl={{antialias: true}} shadows>
      <color attach="background" args={[breach ? '#3a140c' : '#2a3a5a']} />
      <fog attach="fog" args={[breach ? '#3a140c' : '#2a3a5a', 14, 42]} />
      <Cam p={[lerp(11, 5, camU) + (breach ? Math.sin(u * 40) * 0.07 * br : Math.sin(u * 1.3) * 0.08), lerp(8.5, 5.2, camU), lerp(12, 8.5, camU)]} look={[0, 1.2, -4]} fov={48} />
      <hemisphereLight args={[breach ? '#ffa080' : '#b8ccff', '#3a3020', 0.8]} />
      <directionalLight position={[8, 14, 8]} intensity={2.2} color={breach ? '#ffc0a0' : '#fff4e0'} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={20} shadow-camera-bottom={-20} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -6]} receiveShadow><planeGeometry args={[100, 80]} /><meshStandardMaterial color={breach ? '#4a2a1a' : '#4a5a32'} roughness={1} /></mesh>
      {/* muralla por bloques con almenas */}
      {Array.from({length: 18}, (_, i) => { const x = (i - 8.5) * 1.9; const gap = breach && Math.abs(x) < 3.4; const fly = gap ? br : 0;
        return <group key={i} position={[x + fly * (x > 0 ? 3 : -3) * (0.5 + rnd(i)), 0, fly * 5 * rnd(i + 2)]} rotation={[fly * 2 * rnd(i + 3), fly * rnd(i), fly * 1.6 * (rnd(i + 4) - 0.5)]}>
          <mesh material={wallM} position={[0, 1.5 + fly * 2.5 * rnd(i + 1) - fly * fly * 4, 0]} scale={[1.88, 3, 1.1]} castShadow receiveShadow><boxGeometry args={[1, 1, 1]} /></mesh>
          <mesh material={wallM} position={[-0.45, 3.2 + fly * 2.5 * rnd(i + 1) - fly * fly * 4, 0]} scale={[0.6, 0.45, 1.1]} castShadow><boxGeometry args={[1, 1, 1]} /></mesh>
          <mesh material={wallM} position={[0.5, 3.2 + fly * 2.5 * rnd(i + 1) - fly * fly * 4, 0]} scale={[0.6, 0.45, 1.1]} castShadow><boxGeometry args={[1, 1, 1]} /></mesh>
        </group>; })}
      {[-13, -6.5, 6.5, 13].map((x, i) => <group key={x} position={[x, 0, 0]}>
        <mesh material={wallM} position={[0, 2.6, 0]} scale={[1.8, 5.2, 1.8]} castShadow receiveShadow><boxGeometry args={[1, 1, 1]} /></mesh>
        <mesh position={[0, 5.5, 0]} castShadow><coneGeometry args={[1.4, 1.2, 4]} /><meshStandardMaterial color="#5a2a1a" /></mesh>
        <spotLight position={[0, 5.4, 0.5]} target-position={[x * 0.3, 0, -8]} angle={0.35} penumbra={0.6} intensity={breach ? 0 : 160 + 60 * Math.sin(u * 2 + i)} distance={30} color="#fff2c0" />
      </group>)}
      {/* escombros y polvo de la brecha */}
      {breach && br > 0 && Array.from({length: 40}, (_, i) => { const a = rnd(i) * Math.PI * 2; const v = 2 + rnd(i + 1) * 4; const tt = Math.max(0, u - 1.8); return <mesh key={'d' + i} position={[Math.cos(a) * v * tt * 0.6, Math.max(0.1, 2 + 5 * tt - 6 * tt * tt), 0.5 + Math.abs(Math.sin(a)) * v * tt * 0.6]} rotation={[tt * 4 + i, tt * 3, 0]} castShadow><boxGeometry args={[0.2 + rnd(i) * 0.3, 0.15, 0.2]} /><meshStandardMaterial color="#7a7060" /></mesh>; })}
      {/* soldados con casco, disparando */}
      <group position={[0, 3.0, 0]}><Figures figs={sf} skin={sSkin} cloth={sCloth} pants={sHelm} helmet={sHelm} gun t={u} /></group>
      <Inst n={14} geo={fG} mat={fM} shadow={false} fill={(i, o) => { const f = sf[i]; if (!f.on || !flick(i)) return false; o.position.set(f.x + 0.12, 3.8, -0.4); o.scale.setScalar(1 + rnd(i + Math.floor(u * 30)) * 1.4); }} />
      {sf.filter((f, i) => f.on && flick(i) && i % 3 === 0).map((f, i) => <pointLight key={'fl' + i} position={[f.x, 3.9, -0.6]} intensity={14} distance={6} color="#ffd070" />)}
      {/* horda */}
      <Figures figs={zf} skin={zSkin} cloth={zCloth} pants={zPants} t={u} />
      <Dust t={u} col={breach ? '#ffb090' : '#e8e0d0'} />
    </ThreeCanvas>
  );
};

// ---------------------------------------------------------------- LABORATORIO
export const LabScene: React.FC<{u: number; p: number; fail?: boolean; done?: number; w: number; h: number}> = ({u, p, fail, done = 0, w, h}) => {
  const pp = cl(p / 100, 0, 1); const nh = 26;
  const sG = useMemo(() => new THREE.SphereGeometry(0.13, 14, 10), []);
  const aM = useMemo(() => new THREE.MeshStandardMaterial({color: '#2fa8ff', emissive: '#1a5fd0', emissiveIntensity: 0.6, roughness: 0.3}), []);
  const bM = useMemo(() => new THREE.MeshStandardMaterial({color: '#ff4fa0', emissive: '#a01a5a', emissiveIntensity: 0.5, roughness: 0.3}), []);
  const rG = useMemo(() => new THREE.CylinderGeometry(0.03, 0.03, 1, 6), []);
  const rM = useMemo(() => new THREE.MeshStandardMaterial({color: '#dfe8ff'}), []);
  const rot = u * 0.9;
  const helix = (i: number, s: number) => { const y = (i - nh / 2) * 0.16; const a = i * 0.45 + rot + s * Math.PI; return new THREE.Vector3(Math.cos(a) * 0.6, y, Math.sin(a) * 0.6); };
  const alarm = fail && Math.sin(u * 10) > 0;
  const liquid = done > 0 ? '#9fe8ff' : '#2fa8ff';
  const scr = (i: number) => (Math.sin(u * 3 + i * 1.3) > 0 ? '#2fa8ff' : '#7bd83a');
  return (
    <ThreeCanvas width={w} height={h} style={{position: 'absolute', inset: 0}} gl={{antialias: true}} shadows>
      <color attach="background" args={[alarm ? '#2a0608' : '#081422']} />
      <fog attach="fog" args={[alarm ? '#2a0608' : '#081422', 8, 22]} />
      <Cam p={[Math.sin(u * 0.25) * 1.2 + 0.4, 2.1 + Math.sin(u * 0.7) * 0.05, 7.2 - Math.min(1, u / 20) * 0.6]} look={[0.1, 1.3, 0]} fov={40} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 7, 5]} intensity={1.8} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <pointLight position={[-1.6, 1.9, 0.9]} intensity={14 + done * 90 + pp * 10} color="#4fc0ff" distance={9} />
      {alarm && <pointLight position={[0, 4, 1]} intensity={70} color="#ff1a1a" distance={14} />}
      {/* sala */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.3, 0]} receiveShadow><planeGeometry args={[40, 40]} /><meshStandardMaterial color="#1c2432" roughness={0.6} metalness={0.2} /></mesh>
      <mesh position={[0, 3, -3]} receiveShadow><planeGeometry args={[40, 12]} /><meshStandardMaterial color="#141e2e" /></mesh>
      {/* monitores en la pared */}
      {[-3.2, -1.2, 2.6].map((x, i) => <group key={i} position={[x, 2.9, -2.95]}>
        <mesh><boxGeometry args={[1.7, 1.0, 0.08]} /><meshStandardMaterial color="#0c1018" /></mesh>
        <mesh position={[0, 0, 0.05]}><planeGeometry args={[1.55, 0.86]} /><meshBasicMaterial color={alarm ? '#ff3030' : '#0e2a44'} /></mesh>
        {Array.from({length: 6}, (_, j) => <mesh key={j} position={[-0.6 + j * 0.24, -0.3 + (0.15 + 0.5 * Math.abs(Math.sin(u * 2 + j + i))) / 2, 0.06]} scale={[0.14, 0.15 + 0.5 * Math.abs(Math.sin(u * 2 + j + i)), 1]}><planeGeometry args={[1, 1]} /><meshBasicMaterial color={scr(j + i)} /></mesh>)}
      </group>)}
      {/* mesa */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow><boxGeometry args={[7, 0.2, 3]} /><meshStandardMaterial color="#d8dee8" roughness={0.35} metalness={0.4} /></mesh>
      <mesh position={[0, -1.2, 0]} receiveShadow><boxGeometry args={[6.6, 2.2, 2.6]} /><meshStandardMaterial color="#7a8396" roughness={0.6} /></mesh>
      {/* luces de estado */}
      {Array.from({length: 8}, (_, i) => <mesh key={'led' + i} position={[-2.8 + i * 0.25, -0.5, 1.31]}><sphereGeometry args={[0.05, 8, 6]} /><meshBasicMaterial color={alarm ? '#ff2020' : i / 8 < pp ? '#4fff8a' : '#334'} /></mesh>)}
      {/* probeta grande */}
      <group position={[-1.6, 0.1, 0.4]}>
        <mesh position={[0, 1.3, 0]}><cylinderGeometry args={[0.5, 0.5, 2.6, 40, 1, true]} /><meshPhysicalMaterial color="#cfe9ff" transparent opacity={0.25} roughness={0.05} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, 0.05 + 1.25 * pp, 0]} scale={[1, Math.max(0.001, pp), 1]}><cylinderGeometry args={[0.46, 0.46, 2.5, 40]} /><meshStandardMaterial color={liquid} emissive={liquid} emissiveIntensity={0.6 + done * 0.6} transparent opacity={0.88} /></mesh>
        <mesh position={[0, 2.7, 0]} castShadow><cylinderGeometry args={[0.56, 0.56, 0.18, 32]} /><meshStandardMaterial color="#556070" metalness={0.7} roughness={0.3} /></mesh>
        {Array.from({length: 12}, (_, i) => { const yy = ((u * 0.6 + rnd(i)) % 1) * 2.4 * pp; return <mesh key={i} position={[(rnd(i + 3) - 0.5) * 0.6, 0.1 + yy, (rnd(i + 5) - 0.5) * 0.5]}><sphereGeometry args={[0.03 + rnd(i) * 0.04, 8, 6]} /><meshBasicMaterial color="#e8faff" transparent opacity={0.7} /></mesh>; })}
        {/* vapor */}
        {Array.from({length: 8}, (_, i) => { const k = (u * 0.4 + rnd(i)) % 1; return <mesh key={'v' + i} position={[Math.sin(i + u) * 0.2, 2.9 + k * 1.4, Math.cos(i) * 0.2]} scale={0.2 + k * 0.5}><sphereGeometry args={[0.5, 10, 8]} /><meshBasicMaterial color="#cfefff" transparent opacity={0.18 * (1 - k)} depthWrite={false} /></mesh>; })}
        {done > 0 && <mesh position={[0, 1.3, 0]} scale={1 + done * 0.6}><sphereGeometry args={[1.2, 24, 16]} /><meshBasicMaterial color="#7fe0ff" transparent opacity={0.22 * done} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>}
      </group>
      {/* ADN */}
      <group position={[1.4, 1.6, 0]}>
        <Inst n={nh} geo={sG} mat={aM} fill={(i, o) => { o.position.copy(helix(i, 0)); }} />
        <Inst n={nh} geo={sG} mat={bM} fill={(i, o) => { o.position.copy(helix(i, 1)); }} />
        <Inst n={nh} geo={rG} mat={rM} fill={(i, o) => { const a = helix(i, 0), b = helix(i, 1); o.position.copy(a.clone().add(b).multiplyScalar(0.5)); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); o.scale.set(1, a.distanceTo(b), 1); }} />
      </group>
      {[-3, -2.6, 2.7, 3.1].map((x, i) => <mesh key={i} position={[x, 0.45, 0.6]} castShadow><cylinderGeometry args={[0.1, 0.1, 0.7, 16]} /><meshStandardMaterial color={['#7bd83a', '#ff4fa0', '#2fa8ff', '#ffd23f'][i]} emissive={['#3a7a18', '#a01a5a', '#1a5fd0', '#a07a10'][i]} emissiveIntensity={0.6} /></mesh>)}
      <Dust t={u} col="#9fd8ff" area={14} y0={-1} n={60} />
    </ThreeCanvas>
  );
};

// ---------------------------------------------------------------- BÚNKER (fl: '' aguanta · 'fall' cae · 'close' se cierra con los últimos)
export const BunkerScene: React.FC<{u: number; fl: string; w: number; h: number; n?: number}> = ({u, fl, w, h, n = 14}) => {
  const conc = useMemo(() => new THREE.MeshStandardMaterial({color: '#6a6e74', roughness: 0.95}), []);
  const steel = useMemo(() => new THREE.MeshStandardMaterial({color: '#8a9098', roughness: 0.35, metalness: 0.85}), []);
  const hSkin = useMemo(() => new THREE.MeshStandardMaterial({color: '#e0b090'}), []);
  const hCloth = useMemo(() => new THREE.MeshStandardMaterial({color: '#4a5a6e', roughness: 0.8}), []);
  const hPants = useMemo(() => new THREE.MeshStandardMaterial({color: '#2a2a30'}), []);
  const zSkin = useMemo(() => new THREE.MeshStandardMaterial({color: '#8fc45a', emissive: '#0c2004'}), []);
  const zCloth = useMemo(() => new THREE.MeshStandardMaterial({color: '#4a5a38'}), []);
  const bang = fl === 'close' ? 0 : Math.max(0, Math.sin(u * 5.5)) ** 8;
  const open = fl === 'fall' ? ss(2.4, 3.2, u) : 0;            // la compuerta revienta
  const shut = fl === 'close' ? ss(0.6, 3.4, u) : 1;            // la compuerta se cierra
  const doorRot = fl === 'close' ? (1 - shut) * 1.6 : -open * 1.9;
  const alarm = Math.sin(u * 7) > 0;
  const hf: Fig[] = Array.from({length: n}, (_, i) => { const x = -3.2 + (i % 7) * 1.05 + (rnd(i) - 0.5) * 0.3, z = 0.6 + Math.floor(i / 7) * 1.1 + rnd(i + 2) * 0.3; const flee = open > 0.3 ? Math.min(1, (u - 2.8) * 0.8) : 0; return {x: x + flee * (rnd(i + 5) - 0.5) * 2, z: z + flee * 1.5, ry: Math.PI + (rnd(i + 3) - 0.5) * 0.8 + flee * Math.PI, ph: rnd(i) * 6, sp: flee > 0 ? 1.2 : 0, on: !(fl === 'fall' && u > 4.2 && i % 2 === 0), arms: rnd(i + 1) > 0.8 ? 0.5 : 0}; });
  const zf: Fig[] = Array.from({length: 18}, (_, i) => { const t0 = 3.0 + i * 0.12; const k = Math.max(0, u - t0); return {x: (rnd(i) - 0.5) * 1.6 + (k > 0 ? (rnd(i + 4) - 0.5) * k * 1.4 : 0), z: -3.6 + Math.min(4.5, k * 2.2), ry: (rnd(i + 2) - 0.5) * 0.6, ph: rnd(i) * 6, sp: 1, on: fl === 'fall' && k > 0, arms: 1}; });
  return (
    <ThreeCanvas width={w} height={h} style={{position: 'absolute', inset: 0}} gl={{antialias: true}} shadows>
      <color attach="background" args={['#120c0c']} />
      <fog attach="fog" args={['#120c0c', 8, 20]} />
      <Cam p={[Math.sin(u * 0.3) * 0.6 + bang * 0.05, 2.6 + bang * 0.04, 6.4]} look={[0, 1.3, -2]} fov={50} />
      <ambientLight intensity={0.18} />
      <pointLight position={[0, 3.4, 1]} intensity={fl === 'close' ? 18 : 10} distance={12} color="#ffe2b0" castShadow />
      <pointLight position={[2.6, 3.2, -2.4]} intensity={alarm ? 40 : 6} distance={10} color="#ff2a1a" />
      {/* sala */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={conc}><planeGeometry args={[14, 14]} /></mesh>
      <mesh position={[0, 2, -3.6]} receiveShadow material={conc}><boxGeometry args={[10, 4.4, 0.4]} /></mesh>
      <mesh position={[-4.6, 2, 0]} receiveShadow material={conc}><boxGeometry args={[0.4, 4.4, 9]} /></mesh>
      <mesh position={[4.6, 2, 0]} receiveShadow material={conc}><boxGeometry args={[0.4, 4.4, 9]} /></mesh>
      <mesh position={[0, 4.2, 0]} material={conc}><boxGeometry args={[10, 0.3, 9]} /></mesh>
      {/* literas y cajas */}
      {[-3.6, 3.6].map((x, i) => <group key={i} position={[x, 0, 0.8]}><mesh position={[0, 0.5, 0]} castShadow material={steel}><boxGeometry args={[0.9, 0.08, 2.2]} /></mesh><mesh position={[0, 1.5, 0]} castShadow material={steel}><boxGeometry args={[0.9, 0.08, 2.2]} /></mesh></group>)}
      {Array.from({length: 6}, (_, i) => <mesh key={'c' + i} position={[-2.4 + (i % 3) * 0.7, 0.3 + Math.floor(i / 3) * 0.6, -3.0]} castShadow><boxGeometry args={[0.6, 0.55, 0.6]} /><meshStandardMaterial color={i % 2 ? '#5a6a3a' : '#7a6a4a'} /></mesh>)}
      {/* compuerta blindada circular */}
      <group position={[1.6, 1.7, -3.35]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={steel}><torusGeometry args={[1.25, 0.16, 12, 40]} /></mesh>
        <group position={[-1.2, 0, 0]} rotation={[0, doorRot, 0]}>
          <group position={[1.2, 0, 0.12 + bang * 0.08]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} material={steel} castShadow><cylinderGeometry args={[1.12, 1.12, 0.26, 40]} /></mesh>
            {Array.from({length: 8}, (_, i) => { const a = (i / 8) * Math.PI * 2; return <mesh key={i} position={[Math.cos(a) * 0.85, Math.sin(a) * 0.85, 0.15]} material={steel}><sphereGeometry args={[0.07, 10, 8]} /></mesh>; })}
            <mesh position={[0, 0, 0.2]} rotation={[0, 0, u * (fl === 'close' ? 2 : 0)]} material={steel}><torusGeometry args={[0.36, 0.05, 8, 24]} /></mesh>
            {[0, 1, 2].map((i) => <mesh key={'s' + i} position={[0, 0, 0.2]} rotation={[0, 0, (i * Math.PI) / 3 + u * (fl === 'close' ? 2 : 0)]} material={steel}><boxGeometry args={[0.8, 0.06, 0.06]} /></mesh>)}
          </group>
        </group>
        {bang > 0.3 && Array.from({length: 10}, (_, i) => <mesh key={'d' + i} position={[(rnd(i + Math.floor(u * 5.5)) - 0.5) * 2.4, (rnd(i + 3) - 0.5) * 2.4, 0.4 + rnd(i) * 0.6]}><sphereGeometry args={[0.04, 6, 4]} /><meshBasicMaterial color="#c8c0b0" transparent opacity={0.7} /></mesh>)}
      </group>
      <Figures figs={hf} skin={hSkin} cloth={hCloth} pants={hPants} t={u} />
      <group position={[1.6, 0, -3.2]}><Figures figs={zf} skin={zSkin} cloth={zCloth} pants={hPants} t={u} /></group>
      <Dust t={u} col="#d8c8b0" area={9} n={50} />
    </ThreeCanvas>
  );
};
