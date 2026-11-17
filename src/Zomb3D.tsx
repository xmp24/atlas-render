// Escenas 3D del vídeo zombi (three.js): virus, ciudad de Atlanta, muralla de Europa, laboratorio de la cura
import React, {useMemo, useLayoutEffect, useRef} from 'react';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';

const VW = 1920, VH = 1080;
const cl = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const ss = (a: number, b: number, x: number) => { const u = cl((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

// cámara controlada por tiempo
const Cam: React.FC<{p: [number, number, number]; look: [number, number, number]; fov?: number}> = ({p, look, fov = 45}) => {
  const cam = useThree((st) => st.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => { cam.position.set(...p); cam.lookAt(...look); cam.fov = fov; cam.near = 0.1; cam.far = 400; cam.updateProjectionMatrix(); });
  return null;
};
// instanced mesh con matrices calculadas en cada frame
const Inst: React.FC<{n: number; geo: THREE.BufferGeometry; mat: THREE.Material; fill: (i: number, m: THREE.Object3D) => boolean | void; colors?: (i: number) => THREE.Color}> = ({n, geo, mat, fill, colors}) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const o = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    const m = ref.current; if (!m) return;
    for (let i = 0; i < n; i++) { o.position.set(0, 0, 0); o.rotation.set(0, 0, 0); o.scale.set(1, 1, 1); const vis = fill(i, o); if (vis === false) o.scale.set(0, 0, 0); o.updateMatrix(); m.setMatrixAt(i, o.matrix); if (colors) m.setColorAt(i, colors(i)); }
    m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, mat, n]} frustumCulled={false} />;
};

// ---------------------------------------------------------------- VIRUS
const SPK = 42;
const fib = (i: number, n: number) => { const y = 1 - (i / (n - 1)) * 2; const r = Math.sqrt(1 - y * y); const th = i * 2.39996; return new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r); };
const VirusBody: React.FC<{t: number; mut: number; pos?: [number, number, number]; sc?: number; seed?: number}> = ({t, mut, pos = [0, 0, 0], sc = 1, seed = 0}) => {
  const col = new THREE.Color('#5fd13a').lerp(new THREE.Color('#d41e1e'), mut);
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 4), []);
  const spG = useMemo(() => new THREE.CylinderGeometry(0.05, 0.08, 1, 8), []);
  const tipG = useMemo(() => new THREE.SphereGeometry(0.15, 12, 10), []);
  const spM = useMemo(() => new THREE.MeshStandardMaterial({roughness: 0.5}), []); spM.color = col.clone().multiplyScalar(0.8);
  const tipM = useMemo(() => new THREE.MeshStandardMaterial({roughness: 0.3, emissiveIntensity: 1}), []); tipM.color = new THREE.Color(mut > 0.5 ? '#ff6a3a' : '#e8ff8a'); tipM.emissive = new THREE.Color(mut > 0.5 ? '#ff2000' : '#7bd83a'); tipM.emissiveIntensity = 0.6 + mut * 0.8;
  const n = Math.round(SPK + mut * 30);
  const rot = t * 0.5 + seed;
  const len = (i: number) => 0.55 + 0.1 * Math.sin(t * 3 + i) + mut * (0.35 + 0.25 * Math.sin(t * 9 + i * 1.7));
  return (
    <group position={pos} scale={sc} rotation={[rot * 0.6, rot, 0]}>
      <mesh geometry={geo}><meshStandardMaterial color={col} roughness={0.55} metalness={0.05} emissive={col} emissiveIntensity={0.15} /></mesh>
      <mesh scale={1.04}><icosahedronGeometry args={[1, 2]} /><meshStandardMaterial color={col.clone().multiplyScalar(0.6)} wireframe transparent opacity={0.25} /></mesh>
      <Inst n={n} geo={spG} mat={spM} fill={(i, o) => { const d = fib(i, n); const L = len(i); o.position.copy(d.clone().multiplyScalar(1 + L / 2)); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d); o.scale.set(1, L, 1); }} />
      <Inst n={n} geo={tipG} mat={tipM} fill={(i, o) => { const d = fib(i, n); const L = len(i); o.position.copy(d.clone().multiplyScalar(1 + L)); }} />
    </group>
  );
};
const Particles: React.FC<{t: number; n?: number; col?: string; spread?: number}> = ({t, n = 160, col = '#9fe07a', spread = 14}) => {
  const g = useMemo(() => new THREE.SphereGeometry(0.04, 6, 4), []);
  const m = useMemo(() => new THREE.MeshBasicMaterial({transparent: true, opacity: 0.6}), []); m.color = new THREE.Color(col);
  return <Inst n={n} geo={g} mat={m} fill={(i, o) => { o.position.set((rnd(i) - 0.5) * spread, ((rnd(i + 9) - 0.5) * spread * 0.6 + t * 0.2 * (0.5 + rnd(i + 3))) % (spread * 0.3), (rnd(i + 5) - 0.5) * spread - 3); o.scale.setScalar(0.5 + rnd(i + 7) * 2); }} />;
};
// u: tiempo local (s). kind 'virus' = se divide; 'mut' = muta
export const VirusScene: React.FC<{u: number; mode: string}> = ({u, mode}) => {
  const mut = mode === 'mut' ? ss(0.6, 3.2, u) : 0;
  const split = mode === 'virus' ? ss(2.6, 4.8, u) : 0;
  const shake = mode === 'mut' ? Math.sin(u * 60) * 0.04 * mut : 0;
  const dist = lerp(4.2, 5.6, ss(0, 5, u)) + (mode === 'mut' ? -1.2 * ss(1, 4, u) : 0);
  const copies = mode === 'virus' ? [[-1, -1], [1, -1], [-1, 1], [1, 1]] : [];
  return (
    <ThreeCanvas width={VW} height={VH} style={{position: 'absolute', inset: 0}} gl={{antialias: true}}>
      <color attach="background" args={[mode === 'mut' ? '#140404' : '#040a08']} />
      <fog attach="fog" args={[mode === 'mut' ? '#140404' : '#040a08', 6, 18]} />
      <Cam p={[Math.sin(u * 0.3) * 0.8 + shake, 0.4 + shake, dist]} look={[0, 0, 0]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} color="#ffffff" />
      <pointLight position={[-4, -2, 2]} intensity={30} color={mode === 'mut' ? '#ff2a1a' : '#4fe07a'} />
      {split < 0.01 ? <VirusBody t={u} mut={mut} /> : copies.map(([a, b], i) => <VirusBody key={i} t={u} mut={0} seed={i} sc={lerp(1, 0.62, split)} pos={[a * 1.5 * split, b * 1.0 * split, -split * (i % 2)]} />)}
      {mode === 'virus' && split > 0.5 && Array.from({length: 10}, (_, i) => <VirusBody key={'s' + i} t={u} mut={0} seed={i + 5} sc={0.3 * ss(4.0, 5.2, u)} pos={[(rnd(i) - 0.5) * 9, (rnd(i + 4) - 0.5) * 5, -3 - rnd(i + 2) * 4]} />)}
      <Particles t={u} col={mode === 'mut' ? '#ff6040' : '#9fe07a'} />
    </ThreeCanvas>
  );
};

// ---------------------------------------------------------------- personaje low-poly (zombi o soldado)
const bodyG = new THREE.CylinderGeometry(0.16, 0.2, 0.7, 7); const headG = new THREE.SphereGeometry(0.2, 10, 8); const armG = new THREE.BoxGeometry(0.5, 0.09, 0.09);
// ---------------------------------------------------------------- CIUDAD (Atlanta de noche, sale la horda del hospital)
const NB = 140;
export const CityScene: React.FC<{u: number}> = ({u}) => {
  const bG = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const bM = useMemo(() => new THREE.MeshStandardMaterial({color: '#3a4466', roughness: 0.8}), []);
  const wM = useMemo(() => new THREE.MeshBasicMaterial({color: '#ffd77a'}), []);
  const zM = useMemo(() => new THREE.MeshStandardMaterial({color: '#6fbf3a', roughness: 0.7, emissive: '#2a5a10', emissiveIntensity: 0.4}), []);
  const hM = useMemo(() => new THREE.MeshStandardMaterial({color: '#8fd85a', roughness: 0.6, emissive: '#3a7a18', emissiveIntensity: 0.4}), []);
  const blds = useMemo(() => { const a: number[][] = []; for (let i = 0; i < NB; i++) { const gx = (i % 14) - 7, gz = Math.floor(i / 14) - 5; if (Math.abs(gx) < 2 && Math.abs(gz) < 2) continue; const dc = Math.abs(gx) + Math.abs(gz); a.push([gx * 3.2 + (rnd(i) - 0.5) * 0.4, gz * 3.2, 1.4 + rnd(i + 1) * 1, (dc < 5 ? 1.2 : 1.8) + rnd(i + 2) * (dc < 5 ? 1.6 : gz < 0 ? 7 : 3), 1.4 + rnd(i + 3)]); } return a; }, []);
  const nz = Math.round(cl(ss(2.0, 9, u), 0, 1) * 220) + 1;
  // zombis salen del hospital (0,0) por las calles
  const ZS = 1.5;
  const zpos = (i: number): [number, number] => { const st = 1.2 + rnd(i) * 9; const dir = Math.floor(rnd(i + 1) * 4); const age = u - 2 - (i / 220) * 7; const d = Math.max(0, age) * (0.9 + rnd(i + 2) * 0.6); const lane = (rnd(i + 3) - 0.5) * 1.1; const along = Math.min(d, st * 3); const x = [along, -along, lane, lane][dir], z = [lane, lane, along, -along][dir]; return [x + (dir < 2 ? 0 : 0), z]; };
  const camU = ss(0, 10, u);
  const sir = Math.sin(u * 12) > 0;
  return (
    <ThreeCanvas width={VW} height={VH} style={{position: 'absolute', inset: 0}} gl={{antialias: true}}>
      <color attach="background" args={['#070a18']} />
      <fog attach="fog" args={['#070a18', 14, 46]} />
      <Cam p={[lerp(-16, -6.5, camU), lerp(17, 5.2, camU), lerp(20, 9, camU)]} look={[0, 0.6, 0.6]} fov={44} />
      <ambientLight intensity={0.9} color="#8f9cff" />
      <directionalLight position={[-10, 20, 10]} intensity={1.6} color="#b4c4ff" />
      {[[-4.8, -4.8], [4.8, -4.8], [-4.8, 4.8], [4.8, 4.8]].map(([x, z], i) => <pointLight key={'sl' + i} position={[x, 2.6, z]} intensity={25} color="#ffc070" distance={9} />)}
      <pointLight position={[2.2, 1.2, 2.2]} intensity={sir ? 60 : 8} color="#ff2a2a" distance={14} />
      <pointLight position={[-2.2, 1.2, 2.2]} intensity={sir ? 8 : 60} color="#2a6aff" distance={14} />
      <pointLight position={[0, 6, 0]} intensity={40} color="#ffffff" distance={12} />
      {/* suelo y calles */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[90, 90]} /><meshStandardMaterial color="#262c40" /></mesh>
      {Array.from({length: 15}, (_, i) => <mesh key={'x' + i} rotation={[-Math.PI / 2, 0, 0]} position={[(i - 7) * 3.2 + 1.6, 0.01, 0]}><planeGeometry args={[1.2, 90]} /><meshStandardMaterial color="#1b1f2c" /></mesh>)}
      {Array.from({length: 12}, (_, i) => <mesh key={'z' + i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, (i - 5) * 3.2 + 1.6]}><planeGeometry args={[90, 1.2]} /><meshStandardMaterial color="#1b1f2c" /></mesh>)}
      {/* edificios + ventanas */}
      <Inst n={blds.length} geo={bG} mat={bM} fill={(i, o) => { const b = blds[i]; o.position.set(b[0], b[3] / 2, b[1]); o.scale.set(b[2], b[3], b[4]); }} />
      <Inst n={blds.length * 6} geo={bG} mat={wM} fill={(i, o) => { const b = blds[Math.floor(i / 6)]; const j = i % 6; const lit = rnd(i * 3.1) > 0.45 - ss(3, 10, u) * 0.3 * 0; if (!lit) return false; o.position.set(b[0] + (rnd(i) - 0.5) * b[2] * 0.7, 0.6 + rnd(i + 1) * (b[3] - 1), b[1] + b[4] / 2 + 0.01); o.scale.set(0.22, 0.28, 0.02); void j; }} />
      {/* hospital */}
      <mesh position={[0, 1.6, 0]}><boxGeometry args={[3.4, 3.2, 3.4]} /><meshStandardMaterial color="#d9dde8" roughness={0.8} /></mesh>
      <mesh position={[0, 2.4, 1.71]}><boxGeometry args={[0.9, 0.28, 0.02]} /><meshBasicMaterial color="#ff2a2a" /></mesh>
      <mesh position={[0, 2.4, 1.71]}><boxGeometry args={[0.28, 0.9, 0.02]} /><meshBasicMaterial color="#ff2a2a" /></mesh>
      {/* ambulancias */}
      {[[2.2, 2.4], [-2.2, 2.6]].map(([x, z], i) => <group key={i} position={[x, 0.3, z]}><mesh><boxGeometry args={[0.8, 0.55, 1.4]} /><meshStandardMaterial color="#f2f2f2" /></mesh><mesh position={[0, 0.34, 0]}><boxGeometry args={[0.6, 0.1, 0.2]} /><meshBasicMaterial color={(sir ? i : 1 - i) ? '#ff2a2a' : '#2a6aff'} /></mesh></group>)}
      {/* zombis */}
      <Inst n={nz} geo={bodyG} mat={zM} fill={(i, o) => { const [x, z] = zpos(i); o.position.set(x, 0.35 * ZS + Math.abs(Math.sin(u * 8 + i)) * 0.05, z); o.rotation.set(0.25, rnd(i) * 6, Math.sin(u * 6 + i) * 0.15); o.scale.setScalar(ZS); }} />
      <Inst n={nz} geo={headG} mat={hM} fill={(i, o) => { const [x, z] = zpos(i); o.position.set(x + 0.05, 0.85 * ZS, z + 0.12); o.scale.setScalar(ZS); }} />
      <Inst n={nz} geo={armG} mat={zM} fill={(i, o) => { const [x, z] = zpos(i); o.position.set(x, 0.6 * ZS, z + 0.25); o.rotation.set(0, Math.PI / 2 + rnd(i) * 6, 0); o.scale.setScalar(ZS); }} />
    </ThreeCanvas>
  );
};

// ---------------------------------------------------------------- MURALLA DE EUROPA (defensa / brecha)
export const WallScene: React.FC<{u: number; breach: boolean}> = ({u, breach}) => {
  const zM = useMemo(() => new THREE.MeshStandardMaterial({color: '#6fbf3a', emissive: '#203a10', emissiveIntensity: 0.4}), []);
  const zmM = useMemo(() => new THREE.MeshStandardMaterial({color: '#7a2a1a', emissive: '#5a0a00', emissiveIntensity: 0.6}), []);
  const hM = useMemo(() => new THREE.MeshStandardMaterial({color: '#9fe06a'}), []);
  const hmM = useMemo(() => new THREE.MeshStandardMaterial({color: '#b84a2a', emissive: '#ff2000', emissiveIntensity: 0.4}), []);
  const sM = useMemo(() => new THREE.MeshStandardMaterial({color: '#2f5fd0'}), []);
  const fM = useMemo(() => new THREE.MeshBasicMaterial({color: '#ffe27a'}), []);
  const wG = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const wM = useMemo(() => new THREE.MeshStandardMaterial({color: '#8a8478', roughness: 0.95}), []);
  const fG = useMemo(() => new THREE.SphereGeometry(0.12, 6, 5), []);
  const NZ = 420; const zm = breach ? zmM : zM, hm = breach ? hmM : hM;
  // brecha en x∈[-3,3] a partir de u=2
  const br = breach ? ss(1.6, 2.4, u) : 0;
  const zp = (i: number): [number, number] => {
    const x = (rnd(i) - 0.5) * 34; const z0 = -6 - rnd(i + 1) * 18; const sp = 1.2 + rnd(i + 2) * 0.8;
    let z = z0 + u * sp * (breach ? 2.2 : 1.1);
    const inGap = breach && Math.abs(x) < 3.2 + br * 1.5 && u > 2.2;
    if (!inGap) z = Math.min(z, -0.9 - rnd(i + 4) * 0.6 - (i % 3) * 0.35);
    return [inGap ? x * (1 - 0.3 * ss(-1, 4, z)) : x, z];
  };
  const camU = ss(0, 7, u);
  return (
    <ThreeCanvas width={VW} height={VH} style={{position: 'absolute', inset: 0}} gl={{antialias: true}}>
      <color attach="background" args={[breach ? '#2a0e0a' : '#1a2440']} />
      <fog attach="fog" args={[breach ? '#2a0e0a' : '#1a2440', 16, 50]} />
      <Cam p={[lerp(14, 6, camU) + (breach ? Math.sin(u * 40) * 0.08 * br : 0), lerp(11, 7, camU), lerp(15, 10, camU)]} look={[0, 1, -5]} fov={46} />
      <hemisphereLight args={[breach ? '#ff8a6a' : '#b8c8ff', '#2a2018', 0.9]} />
      <directionalLight position={[8, 14, 6]} intensity={1.6} color={breach ? '#ffb08a' : '#ffffff'} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -6]}><planeGeometry args={[100, 80]} /><meshStandardMaterial color={breach ? '#3a2418' : '#3a4a2a'} /></mesh>
      {/* muralla en segmentos; los centrales salen volando en la brecha */}
      {Array.from({length: 20}, (_, i) => { const x = (i - 9.5) * 1.8; const gap = breach && Math.abs(x) < 3.3; const fly = gap ? br : 0;
        return <mesh key={i} geometry={wG} material={wM} position={[x + fly * (x > 0 ? 3 : -3) * rnd(i), 1.5 + fly * 3 * rnd(i + 1) - fly * fly * 4.5, 0 + fly * 4 * rnd(i + 2)]} rotation={[fly * 2 * rnd(i + 3), fly * rnd(i), fly * 1.5]} scale={[1.75, 3, 1]} />; })}
      {[-14, -6, 6, 14].map((x) => <mesh key={x} position={[x, 2.4, 0]} geometry={wG} material={wM} scale={[1.6, 4.8, 1.6]} />)}
      {/* soldados sobre la muralla con fogonazos */}
      <Inst n={16} geo={bodyG} mat={sM} fill={(i, o) => { const x = (i - 7.5) * 2.1; if (breach && Math.abs(x) < 3.4 && br > 0.2) return false; o.position.set(x, 3.4, 0.2); }} />
      <Inst n={16} geo={headG} mat={sM} fill={(i, o) => { const x = (i - 7.5) * 2.1; if (breach && Math.abs(x) < 3.4 && br > 0.2) return false; o.position.set(x, 3.95, 0.2); }} />
      <Inst n={16} geo={fG} mat={fM} fill={(i, o) => { const x = (i - 7.5) * 2.1; const on = Math.sin(u * 30 + i * 2.3) > 0.55; if (!on || (breach && Math.abs(x) < 3.4 && br > 0.2)) return false; o.position.set(x, 3.6, -0.5); o.scale.setScalar(1 + rnd(i + Math.floor(u * 30)) * 1.2); }} />
      <pointLight position={[0, 4, -1]} intensity={breach ? 6 : 14 + 10 * Math.max(0, Math.sin(u * 23))} color="#ffcf6a" distance={20} />
      {/* horda */}
      <Inst n={NZ} geo={bodyG} mat={zm} fill={(i, o) => { const [x, z] = zp(i); o.position.set(x, 0.35, z); o.rotation.set(0.3, Math.PI + (rnd(i) - 0.5), Math.sin(u * 7 + i) * 0.2); }} />
      <Inst n={NZ} geo={headG} mat={hm} fill={(i, o) => { const [x, z] = zp(i); o.position.set(x, 0.85, z + 0.12); }} />
      <Inst n={NZ} geo={armG} mat={zm} fill={(i, o) => { const [x, z] = zp(i); o.position.set(x, 0.62, z + 0.28); o.rotation.set(0, Math.PI / 2, 0); }} />
    </ThreeCanvas>
  );
};

// ---------------------------------------------------------------- LABORATORIO DE LA CURA
// p0->p1 progreso de la cura (0..100) durante la escena; fail = alarma roja; done = brillo final
export const LabScene: React.FC<{u: number; p0: number; p1: number; fail?: boolean; done?: boolean; dur: number}> = ({u, p0, p1, fail, done, dur}) => {
  const p = lerp(p0, p1, ss(0.3, dur - 0.6, u)) / 100;
  const nh = 26;
  const sG = useMemo(() => new THREE.SphereGeometry(0.13, 12, 10), []);
  const aM = useMemo(() => new THREE.MeshStandardMaterial({color: '#2fa8ff', emissive: '#1a5fd0', emissiveIntensity: 0.6}), []);
  const bM = useMemo(() => new THREE.MeshStandardMaterial({color: '#ff4fa0', emissive: '#a01a5a', emissiveIntensity: 0.5}), []);
  const rG = useMemo(() => new THREE.CylinderGeometry(0.03, 0.03, 1, 6), []);
  const rM = useMemo(() => new THREE.MeshStandardMaterial({color: '#dfe8ff'}), []);
  const rot = u * 0.9;
  const helix = (i: number, s: number) => { const y = (i - nh / 2) * 0.16; const a = i * 0.45 + rot + s * Math.PI; return new THREE.Vector3(Math.cos(a) * 0.6, y, Math.sin(a) * 0.6); };
  const alarm = fail && Math.sin(u * 10) > 0;
  const glow = done ? ss(0.2, 1.2, u) : 0;
  const liquid = done ? '#7fe0ff' : '#2fa8ff';
  return (
    <ThreeCanvas width={VW} height={VH} style={{position: 'absolute', inset: 0}} gl={{antialias: true}}>
      <color attach="background" args={[alarm ? '#2a0608' : '#06101c']} />
      <Cam p={[Math.sin(u * 0.25) * 1.2 + 0.6, 2.0, 7.4 - ss(0, dur, u) * 0.9]} look={[0.2, 1.4, 0]} fov={40} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 6, 4]} intensity={1.5} />
      <pointLight position={[-1.6, 1.8, 0.8]} intensity={20 + glow * 120} color="#4fc0ff" distance={10} />
      {alarm && <pointLight position={[0, 4, 1]} intensity={80} color="#ff1a1a" distance={14} />}
      {/* mesa */}
      <mesh position={[0, 0.0, 0]}><boxGeometry args={[7, 0.2, 3]} /><meshStandardMaterial color="#d8dee8" roughness={0.4} metalness={0.3} /></mesh>
      <mesh position={[0, -1.2, 0]}><boxGeometry args={[6.6, 2.2, 2.6]} /><meshStandardMaterial color="#8a93a6" /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.3, 0]}><planeGeometry args={[40, 40]} /><meshStandardMaterial color="#1a2230" /></mesh>
      <mesh position={[0, 3, -3]}><planeGeometry args={[40, 12]} /><meshStandardMaterial color="#121c2c" /></mesh>
      {/* probeta grande con líquido que sube */}
      <group position={[-1.6, 0.1, 0.4]}>
        <mesh position={[0, 1.3, 0]}><cylinderGeometry args={[0.5, 0.5, 2.6, 32, 1, true]} /><meshPhysicalMaterial color="#cfe9ff" transparent opacity={0.28} roughness={0.05} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, 0.05 + 1.25 * p, 0]} scale={[1, Math.max(0.001, p), 1]}><cylinderGeometry args={[0.46, 0.46, 2.5, 32]} /><meshStandardMaterial color={liquid} emissive={liquid} emissiveIntensity={0.7 + glow * 0.8} transparent opacity={0.9} /></mesh>
        <mesh position={[0, 2.7, 0]}><cylinderGeometry args={[0.56, 0.56, 0.18, 32]} /><meshStandardMaterial color="#556070" metalness={0.6} /></mesh>
        {Array.from({length: 8}, (_, i) => { const yy = ((u * 0.6 + rnd(i)) % 1) * 2.4 * p; return <mesh key={i} position={[(rnd(i + 3) - 0.5) * 0.6, 0.1 + yy, (rnd(i + 5) - 0.5) * 0.5]}><sphereGeometry args={[0.04 + rnd(i) * 0.04, 8, 6]} /><meshBasicMaterial color="#e8faff" transparent opacity={0.7} /></mesh>; })}
      </group>
      {/* ADN */}
      <group position={[1.4, 1.6, 0]} scale={1}>
        <Inst n={nh} geo={sG} mat={aM} fill={(i, o) => { o.position.copy(helix(i, 0)); }} />
        <Inst n={nh} geo={sG} mat={bM} fill={(i, o) => { o.position.copy(helix(i, 1)); }} />
        <Inst n={nh} geo={rG} mat={rM} fill={(i, o) => { const a = helix(i, 0), b = helix(i, 1); o.position.copy(a.clone().add(b).multiplyScalar(0.5)); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); o.scale.set(1, a.distanceTo(b), 1); }} />
      </group>
      {/* tubos pequeños */}
      {[-3, -2.6, 2.7, 3.1].map((x, i) => <mesh key={i} position={[x, 0.45, 0.6]}><cylinderGeometry args={[0.1, 0.1, 0.7, 16]} /><meshStandardMaterial color={['#7bd83a', '#ff4fa0', '#2fa8ff', '#ffd23f'][i]} emissive={['#3a7a18', '#a01a5a', '#1a5fd0', '#a07a10'][i]} emissiveIntensity={0.6} /></mesh>)}
    </ThreeCanvas>
  );
};
