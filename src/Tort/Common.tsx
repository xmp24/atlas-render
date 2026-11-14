import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { interpolate, random } from "remotion";
import { noise2D } from "@remotion/noise";
import { textTex } from "../Miya3/Sets3";
import { Box, Cyl } from "../Miya3/Kit3";
import { glowTex } from "../Gota/Dungeon4";

export const W = 1920, H = 1080;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ez = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
export const eo = (t: number) => 1 - Math.pow(1 - t, 3);
export const sm = (a: number, b: number, x: number) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const L3 = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k) as [number, number, number];
export type V3 = [number, number, number];
export type Cam = { pos: V3; look: V3; fov: number };
/** [startFrame, from, to] — the camera glides from->to until the next shot starts */
export type Shot = [number, Cam, Cam];

const Rig: React.FC<{ pos: V3; look: V3; fov: number; exp: number }> = ({ pos, look, fov, exp }) => {
  const { camera, gl } = useThree();
  useLayoutEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = exp;
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...pos); c.lookAt(...look); c.fov = fov; c.updateProjectionMatrix();
  });
  return null;
};
/** a 3D scene with a list of camera shots; handheld drift is very small (no bouncing) */
export const Stage: React.FC<{ f: number; len: number; shots: Shot[]; fog?: [string, number, number]; exp?: number; bg?: string; children: React.ReactNode }> = ({ f, len, shots, fog = ["#08080b", 8, 22], exp = 1.2, bg = "#000", children }) => {
  let si = 0; for (let i = 0; i < shots.length; i++) if (f >= shots[i][0]) si = i;
  const [s0, a, b] = shots[si], s1 = si + 1 < shots.length ? shots[si + 1][0] : len;
  const k = ez(interpolate(f, [s0, s1], [0, 1], clamp)) * 0.85 + interpolate(f, [s0, s1], [0, 1], clamp) * 0.15;
  const pos = L3(a.pos, b.pos, k); pos[0] += noise2D("hx", f / 70, 0) * 0.01; pos[1] += noise2D("hy", f / 80, 0) * 0.007;
  return (
    <ThreeCanvas width={W} height={H} shadows="soft" style={{ position: "absolute", background: bg }} camera={{ fov: a.fov, position: a.pos, near: 0.03, far: 120 }} gl={{ antialias: true, preserveDrawingBuffer: true }}>
      <Rig pos={pos} look={L3(a.look, b.look, k)} fov={a.fov + (b.fov - a.fov) * k} exp={exp} />
      <fog attach="fog" args={[fog[0], fog[1], fog[2]]} />
      {children}
    </ThreeCanvas>
  );
};
export const cam = (pos: V3, look: V3, fov = 40): Cam => ({ pos, look, fov });

/* ---------------- textures ---------------- */
const rep = (t: THREE.Texture, x: number, y: number) => { const c = t.clone(); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.repeat.set(x, y); c.anisotropy = 8; c.needsUpdate = true; return c; };
const RC: Record<string, THREE.Texture> = {};
export const tx = (key: string, base: () => THREE.Texture, x: number, y: number) => (RC[key + x + "_" + y] ??= rep(base(), x, y));
export const cobbleTex = () => textTex("cobble", 1024, 1024, (c) => {
  c.fillStyle = "#2a2622"; c.fillRect(0, 0, 1024, 1024);
  for (let r = 0; r < 16; r++) for (let q = 0; q < 16; q++) {
    const x = q * 64 + (r % 2) * 32 + (random(`cx${r}${q}`) - 0.5) * 10, y = r * 64 + (random(`cy${r}${q}`) - 0.5) * 10, k = 0.6 + random(`ck${r}${q}`) * 0.5;
    const g = c.createRadialGradient(x + 26, y + 22, 2, x + 30, y + 30, 36); g.addColorStop(0, `rgb(${150 * k | 0},${140 * k | 0},${126 * k | 0})`); g.addColorStop(1, `rgb(${80 * k | 0},${74 * k | 0},${66 * k | 0})`);
    c.fillStyle = g; c.beginPath(); c.ellipse(x + 30, y + 30, 27 + random(`cw${r}${q}`) * 4, 25 + random(`ch${r}${q}`) * 4, random(`ca${r}${q}`), 0, 7); c.fill();
  }
  for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(20,16,12,${0.1 + random("cd" + i) * 0.2})`; c.beginPath(); c.arc(random("cdx" + i) * 1024, random("cdy" + i) * 1024, 20 + random("cdr" + i) * 80, 0, 7); c.fill(); }
});
export const plasterTex = (key: string, base: string) => textTex("pl" + key, 512, 512, (c) => {
  c.fillStyle = base; c.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(${random(key + "p" + i) > 0.5 ? "255,250,240" : "40,30,20"},${random(key + "o" + i) * 0.06})`; c.fillRect(random(key + "x" + i) * 512, random(key + "y" + i) * 512, 3 + random(key + "s" + i) * 10, 2 + random(key + "t" + i) * 8); }
  for (let i = 0; i < 10; i++) { const x = random(key + "dx" + i) * 512, w = 10 + random(key + "dw" + i) * 40; const g = c.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, "rgba(60,50,40,0)"); g.addColorStop(1, "rgba(60,50,40,0.25)"); c.fillStyle = g; c.fillRect(x, 200, w, 312); }
});
export const marbleTex = (key: string, base: string) => textTex("mb" + key, 512, 512, (c) => {
  c.fillStyle = base; c.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 26; i++) { c.strokeStyle = `rgba(120,100,80,${0.05 + random(key + "v" + i) * 0.1})`; c.lineWidth = 1 + random(key + "l" + i) * 3; c.beginPath(); let x = random(key + "a" + i) * 512, y = 0; c.moveTo(x, y); while (y < 512) { y += 30; x += (random(key + "b" + i + y) - 0.5) * 60; c.lineTo(x, y); } c.stroke(); }
  for (let x = 0; x < 512; x += 32) { const g = c.createLinearGradient(x, 0, x + 32, 0); g.addColorStop(0, "rgba(0,0,0,0.12)"); g.addColorStop(0.5, "rgba(255,255,255,0.05)"); g.addColorStop(1, "rgba(0,0,0,0.12)"); c.fillStyle = g; c.fillRect(x, 0, 32, 512); }
});
export const woodTex = (key: string, base: [number, number, number]) => textTex("wd" + key, 512, 512, (c) => {
  c.fillStyle = `rgb(${base.join(",")})`; c.fillRect(0, 0, 512, 512);
  for (let k = 0; k < 90; k++) { const y = random(key + "g" + k) * 512; c.strokeStyle = `rgba(30,18,8,${0.08 + random(key + "a" + k) * 0.15})`; c.lineWidth = 1 + random(key + "w" + k) * 2.5; c.beginPath(); c.moveTo(0, y); c.bezierCurveTo(170, y + (random(key + "b" + k) - 0.5) * 20, 340, y + (random(key + "c" + k) - 0.5) * 20, 512, y + (random(key + "d" + k) - 0.5) * 10); c.stroke(); }
  for (let i = 0; i < 6; i++) { const x = random(key + "kx" + i) * 512, y = random(key + "ky" + i) * 512; c.fillStyle = "rgba(30,16,8,0.5)"; c.beginPath(); c.ellipse(x, y, 10, 5, 0, 0, 7); c.fill(); }
  for (let i = 0; i < 12; i++) { c.fillStyle = `rgba(0,0,0,${random(key + "st" + i) * 0.2})`; c.beginPath(); c.arc(random(key + "sx" + i) * 512, random(key + "sy" + i) * 512, 20 + random(key + "sr" + i) * 60, 0, 7); c.fill(); }
});
export const ironTex = () => textTex("iron", 256, 256, (c) => {
  c.fillStyle = "#3a3634"; c.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 40; i++) { const g = c.createRadialGradient(random("ix" + i) * 256, random("iy" + i) * 256, 0, random("ix" + i) * 256, random("iy" + i) * 256, 10 + random("ir" + i) * 40); g.addColorStop(0, `rgba(${110 + random("ic" + i) * 40},50,20,${0.25 + random("io" + i) * 0.3})`); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(0, 0, 256, 256); }
  for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(${random("in" + i) > 0.5 ? "200,190,180" : "0,0,0"},${random("ia" + i) * 0.1})`; c.fillRect(random("iq" + i) * 256, random("iw" + i) * 256, 2, 2); }
});
const skyTex = (key: string, stops: [number, string][]) => textTex("sky" + key, 16, 512, (c) => { const g = c.createLinearGradient(0, 0, 0, 512); stops.forEach(([p, col]) => g.addColorStop(p, col)); c.fillStyle = g; c.fillRect(0, 0, 16, 512); });
const cloudTex = () => textTex("cloud3", 512, 256, (c) => {
  for (let i = 0; i < 26; i++) { const x = 60 + random("cl" + i) * 390, y = 90 + random("cm" + i) * 80, r = 30 + random("cn" + i) * 70; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, "rgba(255,255,255,0.5)"); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
});
export const smokeTex = () => textTex("smk3", 256, 256, (c) => {
  for (let i = 0; i < 12; i++) { const x = 128 + (random("k3" + i) - 0.5) * 110, y = 128 + (random("l3" + i) - 0.5) * 90, r = 40 + random("m3" + i) * 60; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, "rgba(255,255,255,0.4)"); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
});
export const flameTex = () => textTex("flame3", 64, 128, (c) => {
  const g = c.createRadialGradient(32, 96, 2, 32, 84, 64); g.addColorStop(0, "rgba(255,255,235,1)"); g.addColorStop(0.2, "rgba(255,214,110,1)"); g.addColorStop(0.55, "rgba(255,110,25,0.75)"); g.addColorStop(1, "rgba(255,50,0,0)");
  c.fillStyle = g; c.beginPath(); c.moveTo(32, 2); c.bezierCurveTo(58, 50, 62, 96, 32, 126); c.bezierCurveTo(2, 96, 6, 50, 32, 2); c.fill();
});

/* ---------------- sky ---------------- */
export const SKIES: Record<string, [number, string][]> = {
  night: [[0, "#03050c"], [0.42, "#0b1430"], [0.5, "#1a2340"], [0.56, "#0a0c14"], [1, "#050505"]],
  dusk: [[0, "#120c1c"], [0.3, "#3a2036"], [0.45, "#a2463a"], [0.5, "#e88a46"], [0.53, "#2a1a14"], [1, "#100a08"]],
  sunset: [[0, "#2a2a52"], [0.28, "#8a4a5a"], [0.42, "#f08a4a"], [0.5, "#ffd27a"], [0.52, "#6a4030"], [1, "#2a1a10"]],
  haze: [[0, "#6a7a6a"], [0.35, "#b8b890"], [0.48, "#f0e2a8"], [0.52, "#8a8a60"], [1, "#3a3a28"]],
  storm: [[0, "#0a0c10"], [0.4, "#262a32"], [0.5, "#4a4e56"], [0.54, "#16181c"], [1, "#08080a"]],
};
export const Sky: React.FC<{ kind: keyof typeof SKIES; f: number; stars?: number; moon?: V3; sun?: V3; sunCol?: string; clouds?: number; cloudCol?: string }> = ({ kind, f, stars = 0, moon, sun, sunCol = "#ffd890", clouds = 0, cloudCol = "#8a8aa0" }) => {
  const st = useMemo(() => { const g = new THREE.BufferGeometry(); const n = 900, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const th = random("sa" + i) * Math.PI * 2, ph = Math.acos(0.05 + random("sb" + i) * 0.95); a[i * 3] = Math.sin(ph) * Math.cos(th) * 90; a[i * 3 + 1] = Math.cos(ph) * 90; a[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * 90; } g.setAttribute("position", new THREE.BufferAttribute(a, 3)); return g; }, []);
  return <group>
    <mesh><sphereGeometry args={[100, 32, 24]} /><meshBasicMaterial map={skyTex(kind, SKIES[kind])} side={THREE.BackSide} fog={false} depthWrite={false} /></mesh>
    {stars > 0 && <points geometry={st}><pointsMaterial color="#dfe6ff" size={0.22} sizeAttenuation transparent opacity={stars * (0.7 + Math.sin(f / 9) * 0.05)} fog={false} depthWrite={false} /></points>}
    {moon && <group position={moon}><mesh><sphereGeometry args={[2.2, 32, 24]} /><meshBasicMaterial color="#e8ecf4" fog={false} /></mesh><sprite scale={[18, 18, 1]}><spriteMaterial map={glowTex()} color="#8aa0d0" transparent opacity={0.45} fog={false} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite></group>}
    {sun && <group position={sun}><mesh><sphereGeometry args={[3.2, 32, 24]} /><meshBasicMaterial color={sunCol} fog={false} /></mesh><sprite scale={[40, 40, 1]}><spriteMaterial map={glowTex()} color={sunCol} transparent opacity={0.6} fog={false} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite></group>}
    {Array.from({ length: clouds }).map((_, i) => { const a = random("ca" + i) * Math.PI * 2 + f * 0.0004 * (0.5 + random("cv" + i)); const r = 70; return <sprite key={i} position={[Math.cos(a) * r, 12 + random("cy" + i) * 22, Math.sin(a) * r]} scale={[40 + random("cs" + i) * 30, 14 + random("ct" + i) * 8, 1]}><spriteMaterial map={cloudTex()} color={cloudCol} transparent opacity={0.35 + random("co" + i) * 0.3} fog={false} depthWrite={false} /></sprite>; })}
  </group>;
};

/* ---------------- fire / smoke / embers ---------------- */
export const Fire: React.FC<{ p: V3; f: number; s?: number; n?: number; light?: number; seed?: string; smoke?: number }> = ({ p, f, s = 1, n = 9, light = 3, seed = "fi", smoke = 1 }) => <group position={p} scale={s}>
  {Array.from({ length: n }).map((_, i) => { const ph = (f * (0.9 + random(seed + "v" + i) * 0.4) / 9 + random(seed + i)) % 1, x = (random(seed + "x" + i) - 0.5) * 0.5, z = (random(seed + "z" + i) - 0.5) * 0.5;
    const h = 0.35 + random(seed + "h" + i) * 0.35; return <sprite key={i} position={[x * (1 - ph * 0.6) + Math.sin(f / 5 + i) * 0.03, ph * h * 1.2, z * (1 - ph * 0.6)]} scale={[0.22 * (1 - ph * 0.5), 0.45 * (1 - ph * 0.3), 1]}><spriteMaterial map={flameTex()} transparent opacity={Math.sin(Math.PI * Math.min(1, ph * 1.3)) * 0.95} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>; })}
  <sprite position={[0, 0.25, 0]} scale={[1.6, 1.4, 1]}><spriteMaterial map={glowTex()} color="#ff8030" transparent opacity={0.4 + Math.sin(f / 3) * 0.05} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
  {Array.from({ length: 10 }).map((_, i) => { const ph = (f / (50 + random(seed + "e" + i) * 40) + random(seed + "eo" + i)) % 1; return <sprite key={"e" + i} position={[(random(seed + "ex" + i) - 0.5) * 0.4 + Math.sin(f / 13 + i) * 0.1 * ph, ph * 1.8, (random(seed + "ez" + i) - 0.5) * 0.4]} scale={[0.025, 0.025, 1]}><spriteMaterial map={glowTex()} color="#ffb050" transparent opacity={(1 - ph)} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>; })}
  {smoke > 0 && Array.from({ length: 6 }).map((_, i) => { const ph = (f / 120 + i / 6) % 1; return <sprite key={"s" + i} position={[Math.sin(f / 30 + i) * 0.2 * ph, 0.8 + ph * 2.6, 0]} scale={[0.6 + ph * 1.6, 0.6 + ph * 1.6, 1]}><spriteMaterial map={smokeTex()} color="#3a3430" transparent opacity={Math.sin(Math.PI * ph) * 0.25 * smoke} depthWrite={false} /></sprite>; })}
  <pointLight position={[0, 0.5, 0]} intensity={light * (1 + Math.sin(f / 2.7) * 0.08 + (random(seed + Math.floor(f / 2)) - 0.5) * 0.12)} distance={9 * s} decay={1.6} color="#ff9040" castShadow={light > 2} shadow-mapSize-width={512} shadow-mapSize-height={512} />
</group>;
export const Logs: React.FC<{ p: V3; s?: number }> = ({ p, s = 1 }) => <group position={p} scale={s}>
  {[0, 1, 2, 3, 4].map((i) => <mesh key={i} position={[0, 0.06, 0]} rotation={[0, i * 1.26, Math.PI / 2 - 0.25]}><cylinderGeometry args={[0.05, 0.06, 0.6, 8]} /><meshStandardMaterial color="#2a1a10" roughness={0.9} emissive="#ff4010" emissiveIntensity={0.25} /></mesh>)}
  <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.38, 20]} /><meshStandardMaterial color="#1a0a04" emissive="#ff5010" emissiveIntensity={0.6} roughness={1} /></mesh>
</group>;
export const Mist: React.FC<{ f: number; n?: number; area: [number, number, number, number]; y?: number; col?: string; o?: number; s?: number }> = ({ f, n = 14, area, y = 0.2, col = "#8a9ab8", o = 0.08, s = 2 }) => <group>
  {Array.from({ length: n }).map((_, i) => { const w = area[1] - area[0]; const x = area[0] + ((random("mx" + i) * w + f * 0.004 * (0.5 + random("mv" + i))) % w); return <sprite key={i} position={[x, y + random("my" + i) * 0.4, area[2] + random("mz" + i) * (area[3] - area[2])]} scale={[s * 2, s * 0.6, 1]}><spriteMaterial map={smokeTex()} color={col} transparent opacity={o} depthWrite={false} /></sprite>; })}
</group>;
/** a crow: body + flapping wings */
export const Crow: React.FC<{ p: V3; f: number; ry?: number; s?: number; perch?: boolean; seed?: number }> = ({ p, f, ry = 0, s = 1, perch, seed = 0 }) => {
  const fl = perch ? 0.15 + Math.sin(f / 30 + seed) * 0.05 : Math.sin(f / 2.2 + seed) * 0.8;
  const m = <meshStandardMaterial color="#0c0c10" roughness={0.5} />;
  return <group position={p} rotation={[0, ry, 0]} scale={s}>
    <mesh scale={[0.06, 0.06, 0.16]}><sphereGeometry args={[1, 12, 8]} />{m}</mesh>
    <mesh position={[0, 0.04, 0.13]}><sphereGeometry args={[0.045, 10, 8]} />{m}</mesh>
    <mesh position={[0, 0.035, 0.19]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.014, 0.06, 6]} /><meshStandardMaterial color="#222" /></mesh>
    <mesh position={[0, 0, -0.17]} rotation={[0.2, 0, 0]} scale={[0.07, 0.01, 0.08]}><boxGeometry args={[1, 1, 1]} />{m}</mesh>
    {[-1, 1].map((sd) => <group key={sd} position={[sd * 0.04, 0.02, 0]} rotation={[0, 0, sd * (perch ? 1.3 : fl)]}><mesh position={[sd * 0.13, 0, 0]} scale={[0.26, 0.008, 0.12]}><boxGeometry args={[1, 1, 1]} />{m}</mesh></group>)}
  </group>;
};
/** crows circling a point */
export const Crows: React.FC<{ c: V3; f: number; n?: number; r?: number; s?: number }> = ({ c, f, n = 6, r = 4, s = 1 }) => <group>
  {Array.from({ length: n }).map((_, i) => { const a = f / (90 + i * 13) + i * 1.3, rr = r * (0.7 + random("cr" + i) * 0.6); return <Crow key={i} p={[c[0] + Math.cos(a) * rr, c[1] + Math.sin(f / 50 + i) * 0.5 + random("ch" + i) * 1.5, c[2] + Math.sin(a) * rr]} ry={-a} f={f} s={s} seed={i} />; })}
</group>;

/* ---------------- architecture ---------------- */
/** timber-framed medieval house with gable roof, windows, chimney */
export const House: React.FC<{ p: V3; ry?: number; w?: number; d?: number; h?: number; seed?: string; lit?: number }> = ({ p, ry = 0, w = 3, d = 3, h = 4, seed = "h", lit = 0 }) => {
  const tones = ["#d8cdb6", "#cbbc9c", "#e0d6c2", "#c4b08c"]; const pl = tx("pl" + seed, () => plasterTex(seed, tones[Math.floor(random(seed) * 4)]), 1, 1);
  const beam = "#2a1a10", rh = 1.4 + random(seed + "r") * 0.6, stories = h > 3.5 ? 2 : 1;
  const roof = useMemo(() => { const g = new THREE.BufferGeometry(); const hw = w / 2 + 0.25, hd = d / 2 + 0.2; const v = [-hw, 0, -hd, hw, 0, -hd, hw, 0, hd, -hw, 0, hd, 0, rh, -hd, 0, rh, hd]; g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3)); g.setIndex([0, 4, 1, 3, 2, 5, 0, 3, 5, 0, 5, 4, 1, 4, 5, 1, 5, 2]); g.computeVertexNormals(); return g; }, [w, d, rh]);
  const gable = useMemo(() => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, rh - 0.1); s.closePath(); return new THREE.ShapeGeometry(s); }, [w, rh]);
  return <group position={p} rotation={[0, ry, 0]}>
    <mesh position={[0, h / 2, 0]} castShadow receiveShadow><boxGeometry args={[w, h, d]} /><meshStandardMaterial map={pl} roughness={0.95} /></mesh>
    {[-1, 1].map((sd) => <mesh key={sd} geometry={gable} position={[0, h, sd * d / 2]} rotation={[0, sd < 0 ? Math.PI : 0, 0]}><meshStandardMaterial map={pl} roughness={0.95} side={THREE.DoubleSide} /></mesh>)}
    <mesh geometry={roof} position={[0, h, 0]} castShadow><meshStandardMaterial color={random(seed + "rc") > 0.5 ? "#4a2a20" : "#3a3030"} roughness={0.9} side={THREE.DoubleSide} /></mesh>
    {/* timber frame on the front (+z) face */}
    {[-w / 2 + 0.06, -w / 6, w / 6, w / 2 - 0.06].map((x, i) => <Box key={"v" + i} p={[x, h / 2, d / 2 + 0.02]} s={[0.12, h, 0.05]} c={beam} />)}
    {Array.from({ length: stories + 1 }).map((_, i) => <Box key={"hb" + i} p={[0, (h / stories) * i + 0.05, d / 2 + 0.03]} s={[w, 0.13, 0.06]} c={beam} />)}
    {Array.from({ length: stories }).map((_, i) => <Box key={"x" + i} p={[-w / 3, (h / stories) * (i + 0.5), d / 2 + 0.03]} s={[0.09, h / stories * 1.05, 0.04]} r={[0, 0, 0.6]} c={beam} />)}
    {Array.from({ length: stories }).map((_, i) => [-w / 4, w / 4].map((x, j) => (i === 0 && j === 0) ? null : <group key={"w" + i + j} position={[x, (h / stories) * (i + 0.55), d / 2 + 0.04]}>
      <Box p={[0, 0, 0]} s={[0.55, 0.7, 0.04]} c={lit && random(seed + "l" + i + j) > 0.4 ? "#ffb860" : "#1a1a20"} e={lit && random(seed + "l" + i + j) > 0.4 ? "#ff9a40" : undefined} ei={lit * 1.2} rough={0.3} />
      <Box p={[0, 0, 0.02]} s={[0.05, 0.7, 0.03]} c={beam} /><Box p={[0, 0, 0.02]} s={[0.55, 0.05, 0.03]} c={beam} /><Box p={[0, -0.38, 0.04]} s={[0.66, 0.06, 0.1]} c={beam} />
    </group>))}
    <group position={[-w / 4, 0, d / 2 + 0.04]}><Box p={[0, 0.85, 0]} s={[0.8, 1.7, 0.05]} c="#2e1e12" /><Box p={[0.28, 0.85, 0.03]} s={[0.05, 0.05, 0.04]} c="#111" metal={0.8} /></group>
    <Box p={[w / 3, h + rh * 0.6, -d / 4]} s={[0.35, 1.2, 0.35]} c="#3a302a" />
  </group>;
};
/** square stone tower with crenellations */
export const Tower: React.FC<{ p: V3; w: number; h: number; tex: THREE.Texture; cap?: "flat" | "dome" | "spire"; capCol?: string; slits?: boolean; lit?: number }> = ({ p, w, h, tex, cap = "flat", capCol = "#3a3e44", slits = true, lit = 0 }) => <group position={p}>
  <mesh position={[0, h / 2, 0]} castShadow receiveShadow><boxGeometry args={[w, h, w]} /><meshStandardMaterial map={tex} bumpMap={tex} bumpScale={2} roughness={0.92} /></mesh>
  {cap === "flat" && Array.from({ length: 4 }).map((_, s) => Array.from({ length: 5 }).map((_, i) => { const t = -w / 2 + (i + 0.5) * (w / 5); const pos: V3 = s === 0 ? [t, h + 0.18, w / 2 - 0.1] : s === 1 ? [t, h + 0.18, -w / 2 + 0.1] : s === 2 ? [w / 2 - 0.1, h + 0.18, t] : [-w / 2 + 0.1, h + 0.18, t]; return <Box key={s + "_" + i} p={pos} s={[w / 10, 0.36, w / 10]} map={tex} />; }))}
  {cap === "dome" && <group position={[0, h, 0]}><Cyl p={[0, 0.3, 0]} r1={w * 0.42} h={0.6} c={capCol} /><mesh position={[0, 0.6, 0]} scale={[1, 0.9, 1]}><sphereGeometry args={[w * 0.42, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={capCol} metalness={0.5} roughness={0.5} /></mesh><Cyl p={[0, w * 0.42 * 0.9 + 0.9, 0]} r1={0.04} h={0.8} c="#8a7a50" /></group>}
  {cap === "spire" && <mesh position={[0, h + w * 0.9, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><coneGeometry args={[w * 0.72, w * 1.8, 4]} /><meshStandardMaterial color={capCol} roughness={0.8} /></mesh>}
  {slits && [0.35, 0.6, 0.82].map((y, i) => <Box key={i} p={[0, h * y, w / 2 + 0.01]} s={[0.14, 0.5, 0.02]} c={lit ? "#ffb060" : "#0a0a0c"} e={lit ? "#ff9030" : undefined} ei={lit} />)}
</group>;

/** a crowd of stickmen-like silhouettes rendered as cheap low-poly figures (for far rows) */
export const FarCrowd: React.FC<{ f: number; n: number; area: [number, number, number, number]; face: V3; seed?: string; cheer?: number }> = ({ f, n, area, face, seed = "fc", cheer = 0 }) => {
  const cols = ["#3a3226", "#4a3a2a", "#2a3040", "#3a2a22", "#2e3a28", "#40302a"];
  return <group>{Array.from({ length: n }).map((_, i) => {
    const x = area[0] + random(seed + "x" + i) * (area[1] - area[0]), z = area[2] + random(seed + "z" + i) * (area[3] - area[2]); const ry = Math.atan2(face[0] - x, face[2] - z);
    const s = 0.9 + random(seed + "s" + i) * 0.2, bob = Math.sin(f / (14 + random(seed + "b" + i) * 10) + i) * 0.01 + cheer * Math.max(0, Math.sin(f / 5 + i * 1.7)) * 0.05;
    const col = cols[Math.floor(random(seed + "c" + i) * cols.length)];
    return <group key={i} position={[x, bob, z]} rotation={[0, ry + Math.sin(f / 60 + i) * 0.1, 0]} scale={s}>
      <mesh position={[0, 0.62, 0]} castShadow><capsuleGeometry args={[0.15, 0.6, 4, 8]} /><meshStandardMaterial color={col} roughness={0.95} /></mesh>
      <mesh position={[0, 1.32, 0]} castShadow><sphereGeometry args={[0.17, 12, 10]} /><meshStandardMaterial color={random(seed + "k" + i) > 0.5 ? "#c8a888" : "#a88468"} roughness={0.8} /></mesh>
      {random(seed + "h" + i) > 0.55 && <mesh position={[0, 1.43, 0]}><cylinderGeometry args={[0.14, 0.19, 0.08, 12]} /><meshStandardMaterial color="#2a2018" roughness={1} /></mesh>}
      {cheer > 0 && random(seed + "a" + i) > 0.6 && <mesh position={[0.15, 1.35 + Math.max(0, Math.sin(f / 5 + i)) * 0.1, 0]} rotation={[0, 0, -0.3]}><capsuleGeometry args={[0.04, 0.4, 4, 6]} /><meshStandardMaterial color={col} /></mesh>}
    </group>;
  })}</group>;
};
