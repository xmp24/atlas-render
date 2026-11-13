import React from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { random } from "remotion";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Box, Cyl, TX } from "../Miya3/Kit3";
import { textTex } from "../Miya3/Sets3";

const clampv = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

/* ---------------- textures ---------------- */
/** irregular dungeon masonry: blocks of varied size and tone, dark mortar, moss and damp; also used as bump map */
export const masonry = (key: string, base: [number, number, number], rx = 2, ry = 1.5, rows = 7) => {
  const t = textTex("mas" + key, 1024, 1024, (c) => {
    c.fillStyle = "#1a1714"; c.fillRect(0, 0, 1024, 1024);
    const h = 1024 / rows;
    for (let r = 0; r < rows; r++) {
      let x = -random(`mo${key}${r}`) * 120;
      while (x < 1024) {
        const w = 110 + random(`mw${key}${r}${x}`) * 150, k = 0.62 + random(`mk${key}${r}${x}`) * 0.5, hh = h - 8 - random(`mh${key}${r}${x}`) * 6;
        const g = c.createLinearGradient(x, r * h, x + w * 0.3, r * h + hh);
        g.addColorStop(0, `rgb(${base[0] * k * 1.12 | 0},${base[1] * k * 1.12 | 0},${base[2] * k * 1.12 | 0})`); g.addColorStop(1, `rgb(${base[0] * k * 0.82 | 0},${base[1] * k * 0.82 | 0},${base[2] * k * 0.82 | 0})`);
        c.fillStyle = g; c.beginPath();
        const j = (n: string) => (random(n) - 0.5) * 8;
        c.moveTo(x + 6 + j(`a${key}${r}${x}`), r * h + 5); c.lineTo(x + w - 5 + j(`b${key}${r}${x}`), r * h + 4 + j(`c${key}${r}${x}`) / 2);
        c.lineTo(x + w - 4 + j(`d${key}${r}${x}`), r * h + hh); c.lineTo(x + 5 + j(`e${key}${r}${x}`), r * h + hh + j(`f${key}${r}${x}`) / 2); c.closePath(); c.fill();
        for (let i = 0; i < 70; i++) { c.fillStyle = `rgba(${random(`q${key}${r}${x}${i}`) > 0.5 ? "255,255,255" : "0,0,0"},${random(`p${key}${r}${x}${i}`) * 0.07})`; const s = 2 + random(`z${key}${r}${x}${i}`) * 9; c.fillRect(x + random(`sx${key}${r}${x}${i}`) * w, r * h + random(`sy${key}${r}${x}${i}`) * hh, s, s); }
        c.fillStyle = "rgba(255,240,220,0.07)"; c.fillRect(x + 8, r * h + 6, w - 16, 3);
        c.fillStyle = "rgba(0,0,0,0.25)"; c.fillRect(x + 8, r * h + hh - 4, w - 16, 4);
        x += w;
      }
    }
    for (let i = 0; i < 14; i++) { const x = random(`dm${key}${i}`) * 1024, w = 12 + random(`dw${key}${i}`) * 40; const g = c.createLinearGradient(0, 0, 0, 1024); g.addColorStop(0, "rgba(30,40,25,0)"); g.addColorStop(0.3 + random(`dd${key}${i}`) * 0.3, "rgba(30,40,25,0.22)"); g.addColorStop(1, "rgba(30,40,25,0.05)"); c.fillStyle = g; c.fillRect(x, 0, w, 1024); }
    for (let i = 0; i < 30; i++) { c.fillStyle = `rgba(60,80,40,${0.1 + random(`ms${key}${i}`) * 0.15})`; c.beginPath(); c.arc(random(`mx${key}${i}`) * 1024, random(`my${key}${i}`) * 1024, 6 + random(`mr${key}${i}`) * 26, 0, 7); c.fill(); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return t;
};
const flameTex = () => textTex("flame2", 64, 128, (c) => {
  const g = c.createRadialGradient(32, 96, 2, 32, 84, 64); g.addColorStop(0, "rgba(255,255,235,1)"); g.addColorStop(0.2, "rgba(255,214,110,1)"); g.addColorStop(0.55, "rgba(255,110,25,0.75)"); g.addColorStop(1, "rgba(255,50,0,0)");
  c.fillStyle = g; c.beginPath(); c.moveTo(32, 2); c.bezierCurveTo(58, 50, 62, 96, 32, 126); c.bezierCurveTo(2, 96, 6, 50, 32, 2); c.fill();
});
export const glowTex = () => textTex("glow9", 128, 128, (c) => { const g = c.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.4, "rgba(255,255,255,0.35)"); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.fillRect(0, 0, 128, 128); });
const smokeTex2 = () => textTex("smk2", 256, 256, (c) => {
  for (let i = 0; i < 10; i++) { const x = 128 + (random("k" + i) - 0.5) * 110, y = 128 + (random("l" + i) - 0.5) * 70, r = 50 + random("m" + i) * 60; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, "rgba(255,255,255,0.4)"); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
});
const shaftTex = () => textTex("shaft", 64, 256, (c) => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, "rgba(255,255,255,0.9)"); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.fillRect(0, 0, 64, 256); const h = c.createLinearGradient(0, 0, 64, 0); h.addColorStop(0, "rgba(0,0,0,1)"); h.addColorStop(0.5, "rgba(0,0,0,0)"); h.addColorStop(1, "rgba(0,0,0,1)"); c.globalCompositeOperation = "destination-out"; c.fillStyle = h; c.fillRect(0, 0, 64, 256); });

/** environment map for glossy water (drops, puddles, wet skin) */
let ENV: THREE.Texture | null = null;
export const useEnv = () => { const { gl } = useThree(); if (!ENV) { const pm = new THREE.PMREMGenerator(gl); ENV = pm.fromScene(new RoomEnvironment(), 0.04).texture; } return ENV; };
const WMAT: Record<string, THREE.Material> = {};
export const waterMat = (env: THREE.Texture, op = 0.62, k = "d") => (WMAT[k + op] ??= new THREE.MeshPhysicalMaterial({ color: "#86c2ea", roughness: 0.02, metalness: 0.1, envMap: env, envMapIntensity: 0.9, transparent: true, opacity: op * 0.62, clearcoat: 1, clearcoatRoughness: 0, emissive: "#0a2a44", emissiveIntensity: 0.4, depthWrite: false }));

/* ---------------- props ---------------- */
export const Torch: React.FC<{ p: [number, number, number]; ry?: number; f: number; on?: number; seed?: string; speed?: number }> = ({ p, ry = 0, f, on = 1, seed = "t", speed = 1 }) => {
  const g = f * speed, fl = 1 + Math.sin(g / 2.3 + seed.length) * 0.07 + (random(seed + Math.floor(g / 2)) - 0.5) * 0.16, sway = Math.sin(g / 5.1 + seed.length) * 0.08;
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <Box p={[0, 0, 0.04]} s={[0.1, 0.2, 0.03]} c="#2b2622" metal={0.7} rough={0.45} />
      <mesh position={[0, 0.08, 0.15]} rotation={[0.5, 0, 0]}><cylinderGeometry args={[0.03, 0.022, 0.36, 10]} /><meshStandardMaterial color="#4a3320" roughness={0.9} /></mesh>
      <mesh position={[0, 0.25, 0.24]} rotation={[0.5, 0, 0]}><cylinderGeometry args={[0.055, 0.04, 0.1, 10]} /><meshStandardMaterial color="#1a120c" roughness={1} /></mesh>
      {on > 0.02 && <>
        <sprite position={[sway * 0.1, 0.44, 0.28]} scale={[0.2 * fl * on, 0.42 * fl * on, 1]}><spriteMaterial map={flameTex()} transparent depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
        <sprite position={[sway * 0.15, 0.48, 0.285]} scale={[0.12 * fl * on, 0.3 * fl * on, 1]}><spriteMaterial map={flameTex()} transparent opacity={0.8} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
        <sprite position={[0, 0.4, 0.3]} scale={[1.1 * on, 1.1 * on, 1]}><spriteMaterial map={glowTex()} color="#ff9a40" transparent opacity={0.22 * on} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
        {Array.from({ length: 6 }).map((_, i) => { const q = ((g * 0.02 + random(seed + "e" + i)) % 1); return <sprite key={i} position={[(random(seed + "x" + i) - 0.5) * 0.12 + Math.sin(g / 7 + i) * 0.04 * q, 0.5 + q * 0.6, 0.28]} scale={[0.012, 0.012, 1]}><spriteMaterial map={glowTex()} color="#ffb060" transparent opacity={(1 - q) * on} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>; })}
        <pointLight position={[0, 0.5, 0.45]} intensity={4.6 * fl * on} distance={6} decay={1.5} color="#ff9445" />
      </>}
    </group>
  );
};
const Chain: React.FC<{ p: [number, number, number]; n?: number; f: number }> = ({ p, n = 9, f }) => (
  <group position={p} rotation={[0, 0, Math.sin(f / 31 + p[0]) * 0.03]}>{Array.from({ length: n }).map((_, i) => <mesh key={i} position={[0, -i * 0.068, 0]} rotation={[0, i % 2 ? Math.PI / 2 : 0, 0]}><torusGeometry args={[0.03, 0.009, 6, 12]} /><meshStandardMaterial color="#3d3c40" metalness={0.85} roughness={0.38} /></mesh>)}
    <mesh position={[0, -n * 0.068 - 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.065, 0.017, 8, 18]} /><meshStandardMaterial color="#3d3c40" metalness={0.85} roughness={0.38} /></mesh></group>
);
const radialTex = () => textTex("rad_d2", 128, 128, (c) => { const g = c.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, "rgba(0,0,0,0.85)"); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(0, 0, 128, 128); });
export const Contact: React.FC<{ p: [number, number, number]; s: [number, number]; o?: number }> = ({ p, s, o = 0.6 }) => <mesh position={[p[0], p[1] + 0.004, p[2]]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={s} /><meshBasicMaterial map={radialTex()} transparent opacity={o} depthWrite={false} /></mesh>;

/** a stone arch on a wall (rib + recess) */
const Arch: React.FC<{ p: [number, number, number]; ry?: number; r?: number; h?: number; tex: THREE.Texture }> = ({ p, ry = 0, r = 0.75, h = 1.6, tex }) => (
  <group position={p} rotation={[0, ry, 0]}>
    <mesh position={[0, h / 2, -0.02]}><planeGeometry args={[r * 2, h]} /><meshStandardMaterial color="#0d0b0a" roughness={1} /></mesh>
    <mesh position={[0, h, -0.02]}><circleGeometry args={[r, 24, 0, Math.PI]} /><meshStandardMaterial color="#0d0b0a" roughness={1} /></mesh>
    <mesh position={[0, h, 0.06]}><torusGeometry args={[r + 0.06, 0.1, 8, 24, Math.PI]} /><meshStandardMaterial map={tex} bumpMap={tex} bumpScale={2} roughness={0.95} /></mesh>
    {[-1, 1].map((sd) => <mesh key={sd} position={[sd * (r + 0.06), h / 2, 0.06]}><boxGeometry args={[0.2, h, 0.2]} /><meshStandardMaterial map={tex} bumpMap={tex} bumpScale={2} roughness={0.95} /></mesh>)}
  </group>
);

/* ---------------- the board ---------------- */
export const TABLE_Y = 0.86, HEAD: [number, number, number] = [-0.68, 0.945, 0], FOREHEAD: [number, number, number] = [-0.76, 1.134, 0];
/** iron cuff: fixed lower half + hinged upper half (k=0 open, 1 closed) and a short chain to a ring on the table edge */
const Cuff: React.FC<{ p: [number, number, number]; k: number; r?: number; edge: number }> = ({ p, k, r = 0.04, edge }) => {
  const iron = { color: "#3a3a40", metalness: 0.85, roughness: 0.4 };
  const open = (1 - k) * 2.0;
  return <group position={p}>
    <mesh rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[r, 0.011, 8, 20, Math.PI]} /><meshStandardMaterial {...iron} /></mesh>
    <group position={[0, 0, -r]} rotation={[-open, 0, 0]}><group position={[0, 0, r]}><mesh rotation={[0, Math.PI / 2, Math.PI]}><torusGeometry args={[r, 0.011, 8, 20, Math.PI]} /><meshStandardMaterial {...iron} /></mesh></group></group>
    <mesh position={[0, 0, r + 0.012]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.009, 0.009, 0.03, 8]} /><meshStandardMaterial {...iron} /></mesh>
    {Array.from({ length: 4 }).map((_, i) => <mesh key={i} position={[0, -0.03 - i * 0.012, edge * (0.02 + i * 0.03)]} rotation={[i % 2 ? 0 : Math.PI / 2, 0, 0]}><torusGeometry args={[0.014, 0.004, 6, 10]} /><meshStandardMaterial {...iron} /></mesh>)}
  </group>;
};
/** leather strap thrown over the body: sweep 0..1 reveals the arc from the far edge, tight 0..1 presses it down */
const Strap: React.FC<{ x: number; y: number; w?: number; sweep: number; tight: number; t?: number }> = ({ x, y, w = 0.39, sweep, tight, t = 0.09 }) => {
  if (sweep <= 0) return null;
  const n = 18, hgt = 0.16 - 0.07 * tight, segs = [];
  const pt = (q: number): [number, number] => { const a = Math.PI * q; return [-Math.cos(a) * w, y - TABLE_Y + Math.sin(a) * hgt * (q > 0.08 && q < 0.92 ? 1 : 0.6)]; };
  for (let i = 0; i < n; i++) { const q0 = i / n, q1 = (i + 1) / n; if (q0 > sweep) break; const [z0, y0] = pt(q0), [z1, y1] = pt(Math.min(q1, sweep)); const len = Math.hypot(z1 - z0, y1 - y0); segs.push(<mesh key={i} position={[0, (y0 + y1) / 2, (z0 + z1) / 2]} rotation={[-Math.atan2(y1 - y0, z1 - z0), 0, 0]}><boxGeometry args={[t, 0.02, len + 0.004]} /><meshStandardMaterial color="#3a2214" roughness={0.55} /></mesh>); }
  return <group position={[x, TABLE_Y, 0]}>
    <mesh position={[0, -0.1, -w]}><boxGeometry args={[t, 0.22, 0.02]} /><meshStandardMaterial color="#3a2214" roughness={0.55} /></mesh>
    {segs}
    {sweep >= 1 && <><mesh position={[0, -0.1, w]}><boxGeometry args={[t, 0.22, 0.02]} /><meshStandardMaterial color="#3a2214" roughness={0.55} /></mesh>
      <mesh position={[0, 0.0, w + 0.012]}><boxGeometry args={[t * 1.2, 0.06, 0.012]} /><meshStandardMaterial color="#b89a58" metalness={0.85} roughness={0.25} /></mesh>
      <mesh position={[0, -0.04 - tight * 0.06, w + 0.03]} rotation={[0.2, 0, 0]}><boxGeometry args={[t * 0.9, 0.12, 0.012]} /><meshStandardMaterial color="#3a2214" roughness={0.55} /></mesh></>}
  </group>;
};
export type Bind = { cuffs: number[]; chest: [number, number]; thigh: [number, number]; stock: number };
export const BOUND: Bind = { cuffs: [1, 1, 1, 1], chest: [1, 1], thigh: [1, 1], stock: 1 };
export const FREE: Bind = { cuffs: [0, 0, 0, 0], chest: [0, 0], thigh: [0, 0], stock: 0 };
export const Table: React.FC<{ bind: Bind }> = ({ bind }) => {
  const wood = TX.wood(1, 3, "#5e4029"), dark = TX.wood(1, 2, "#4a3220");
  const st = 0.25 + (1 - bind.stock) * 0.22;
  return (
    <group>
      <Box p={[0.3, TABLE_Y - 0.05, 0]} s={[1.5, 0.1, 0.78]} map={wood} rough={0.8} />
      {[-0.3, -0.1, 0.1, 0.3].map((z) => <Box key={z} p={[0.3, TABLE_Y + 0.001, z]} s={[1.5, 0.002, 0.006]} c="#2a1a10" />)}
      <Box p={[-0.68, TABLE_Y - 0.17, 0]} s={[0.55, 0.1, 0.62]} map={wood} rough={0.8} />
      {[[-0.85, -0.3], [-0.85, 0.3], [0.95, -0.3], [0.95, 0.3]].map(([x, z], i) => <Box key={i} p={[x, (TABLE_Y - 0.1) / 2, z]} s={[0.12, TABLE_Y - 0.1, 0.12]} map={dark} />)}
      <Box p={[0.05, 0.25, 0]} s={[1.8, 0.06, 0.06]} c="#3e2a1a" />
      {[[-0.85, 0], [0.95, 0]].map(([x], i) => <Box key={"x" + i} p={[x, 0.25, 0]} s={[0.06, 0.06, 0.6]} c="#3e2a1a" />)}
      {[[-0.45, 0.39], [-0.45, -0.39], [1.05, 0.39], [1.05, -0.39], [0.3, 0.39], [0.3, -0.39]].map(([x, z], i) => <Box key={"m" + i} p={[x, TABLE_Y - 0.05, z]} s={[0.12, 0.12, 0.02]} c="#2e2e32" metal={0.8} rough={0.35} />)}
      {[[-0.45, 0.4], [0.3, 0.4], [1.05, 0.4], [-0.45, -0.4], [0.3, -0.4], [1.05, -0.4]].map(([x, z], i) => <mesh key={"r" + i} position={[x, TABLE_Y - 0.05, z + Math.sign(z) * 0.01]}><sphereGeometry args={[0.012, 8, 6]} /><meshStandardMaterial color="#555" metalness={0.8} /></mesh>)}
      {/* head stock: two blocks that slide in and lock with an iron pin */}
      {[-1, 1].map((sd) => <group key={sd} position={[-0.68, TABLE_Y - 0.02, sd * st]}><Box p={[0, 0, 0]} s={[0.28, 0.22, 0.09]} map={dark} /><mesh position={[0, 0.02, -sd * 0.046]} rotation={[0, Math.PI / 2, 0]}><cylinderGeometry args={[0.07, 0.07, 0.006, 20, 1, false, -Math.PI / 2, Math.PI]} /><meshStandardMaterial color="#2a1a10" /></mesh></group>)}
      <mesh position={[-0.68, TABLE_Y + 0.15 - bind.stock * 0.08, 0.33]}><cylinderGeometry args={[0.01, 0.01, 0.2, 8]} /><meshStandardMaterial color="#3a3a40" metalness={0.85} roughness={0.35} /></mesh>
      <Strap x={-0.22} y={1.035} sweep={bind.chest[0]} tight={bind.chest[1]} t={0.1} />
      <Strap x={0.44} y={1.0} sweep={bind.thigh[0]} tight={bind.thigh[1]} t={0.08} />
      {[[0.12, 0.17, 0], [0.12, -0.17, 1], [0.8, 0.066, 2], [0.8, -0.066, 3]].map(([x, z, i]) => <group key={i}><Cuff p={[x, 0.945, z]} k={bind.cuffs[i] ?? 0} r={i < 2 ? 0.046 : 0.05} edge={Math.sign(z)} /><Box p={[x, TABLE_Y + 0.006, z]} s={[0.07, 0.012, 0.1]} c="#2e2e32" metal={0.8} rough={0.4} /></group>)}
      <Contact p={[0.1, 0, 0]} s={[2.6, 1.4]} o={0.75} />
    </group>
  );
};
/* ---------------- the drip rig ---------------- */
export const SPOUT: [number, number, number] = [FOREHEAD[0], 1.62, 0];
export const VALVE: [number, number, number] = [FOREHEAD[0], 1.86, 0.17];
export const DripRig: React.FC<{ valve: number; level?: number }> = ({ valve, level = 1 }) => {
  const wood = TX.wood(1, 2, "#4e3420"), env = useEnv();
  const cu = { color: "#b8703e", metalness: 0.9, roughness: 0.28, envMap: env, envMapIntensity: 0.6 };
  return (
    <group>
      {[-0.55, 0.55].map((z) => <Box key={z} p={[-1.05, 1.15, z]} s={[0.09, 2.3, 0.09]} map={wood} />)}
      <Box p={[-1.05, 2.25, 0]} s={[0.1, 0.1, 1.25]} map={wood} />
      <Box p={[-0.9, 2.25, 0]} s={[0.4, 0.06, 0.06]} map={wood} />
      {[-0.55, 0.55].map((z) => <Box key={"b" + z} p={[-1.05, 2.05, z * 0.7]} s={[0.05, 0.4, 0.05]} r={[z > 0 ? 0.75 : -0.75, 0, 0]} map={wood} />)}
      <group position={[-0.74, 2.42, 0]}>
        <mesh><cylinderGeometry args={[0.2, 0.15, 0.3, 28, 1, true]} /><meshStandardMaterial {...cu} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.2, 0.014, 8, 28]} /><meshStandardMaterial {...cu} color="#8a4e2a" /></mesh>
        {[-0.08, 0.06].map((y) => <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.18 + (0.06 - y) * 0.2, 0.008, 6, 28]} /><meshStandardMaterial color="#2e2e32" metalness={0.8} roughness={0.4} /></mesh>)}
        <mesh position={[0, -0.15, 0]}><cylinderGeometry args={[0.15, 0.15, 0.02, 28]} /><meshStandardMaterial {...cu} color="#8a4e2a" /></mesh>
        <mesh position={[0, -0.15 + 0.28 * level, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.15 + 0.05 * level, 28]} /><meshStandardMaterial color="#3d5a6c" roughness={0.05} metalness={0.4} envMap={env} envMapIntensity={1.2} /></mesh>
        <mesh position={[0, 0.17, 0]}><torusGeometry args={[0.22, 0.008, 6, 24, Math.PI]} /><meshStandardMaterial color="#3a3a3e" metalness={0.8} /></mesh>
      </group>
      <mesh position={[SPOUT[0], (2.27 + SPOUT[1]) / 2, 0]}><cylinderGeometry args={[0.018, 0.018, 2.27 - SPOUT[1], 14]} /><meshStandardMaterial {...cu} /></mesh>
      <mesh position={[SPOUT[0], VALVE[1], VALVE[2] / 2]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.014, 0.014, VALVE[2], 12]} /><meshStandardMaterial {...cu} /></mesh>
      <group position={VALVE} rotation={[0, 0, valve * Math.PI * 2]}>
        <mesh><torusGeometry args={[0.065, 0.011, 8, 24]} /><meshStandardMaterial color="#8a2a20" metalness={0.6} roughness={0.35} /></mesh>
        {[0, 1].map((i) => <mesh key={i} rotation={[0, 0, i * Math.PI / 2]}><boxGeometry args={[0.13, 0.011, 0.011]} /><meshStandardMaterial color="#8a2a20" metalness={0.6} /></mesh>)}
        <mesh position={[0.065, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.01, 0.01, 0.04, 8]} /><meshStandardMaterial color="#2a1a14" /></mesh>
      </group>
      <mesh position={[SPOUT[0], SPOUT[1] + 0.025, 0]}><cylinderGeometry args={[0.014, 0.006, 0.06, 12]} /><meshStandardMaterial {...cu} /></mesh>
    </group>
  );
};

/* ---------------- water ---------------- */
/** one drop: forms at the spout (t0-form .. t0), falls (t0 .. t0+T), splashes. impact = t0 + 9*slow */
export const Drop: React.FC<{ f: number; t0: number; slow?: number; form?: number; from?: [number, number, number]; to?: [number, number, number]; size?: number; skin?: boolean }> = ({ f, t0, slow = 1, form = 10, from = SPOUT, to = FOREHEAD, size = 1, skin = true }) => {
  const env = useEnv(), T = 9 * slow, H = from[1] - to[1];
  const q = (f - t0) / T;
  const r = 0.019 * size;
  if (f < t0 - form || q > 3.2) return null;
  if (q < 0) { const g = clampv(1 + q * T / form); const wob = Math.sin(f * 1.3) * 0.06 * g;
    return <group position={[from[0], from[1] - 0.005 - g * r * 0.9, from[2]]} scale={[(0.45 + g * 0.55) * (1 - wob), (0.45 + g * 0.85) * (1 + wob), (0.45 + g * 0.55) * (1 - wob)]}>
      <mesh material={waterMat(env, 0.7)}><sphereGeometry args={[r, 20, 14]} /></mesh>
      <sprite position={[-r * 0.35, r * 0.3, r]} scale={[r * 0.7, r * 0.7, 1]}><spriteMaterial map={glowTex()} transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
    </group>; }
  if (q <= 1) { const y = from[1] - H * q * q, v = 2 * q; // speed proportional
    return <group position={[from[0], y, from[2]]}>
      <mesh material={waterMat(env, 0.72)} scale={[0.9, 1.15 + v * 0.2, 0.9]}><sphereGeometry args={[r, 20, 14]} /></mesh>
      <sprite position={[-r * 0.3, r * 0.35, r]} scale={[r * 0.75, r * 0.75, 1]}><spriteMaterial map={glowTex()} transparent opacity={0.95} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
      {v > 0.5 && <mesh position={[0, r + v * r * 1.25, 0]} scale={[1, 1, 1]}><cylinderGeometry args={[r * 0.2, r * 0.6, v * r * 2.5, 10, 1, true]} /><meshBasicMaterial color="#d8f0ff" transparent opacity={0.07 * Math.min(1, v - 0.5)} depthWrite={false} /></mesh>}
    </group>; }
  // splash: crown droplets on ballistic arcs + ripple + mist
  const s = (q - 1) * T / 30; // seconds after impact
  const ss = s / slow;
  return <group position={to}>
    {Array.from({ length: 11 }).map((_, j) => {
      const a = (j / 11) * Math.PI * 2 + random("sa" + j + t0) * 0.5, sp = 0.35 + random("sv" + j + t0) * 0.35, up = 0.6 + random("su" + j + t0) * 0.6;
      const t = ss; if (t > 0.42) return null;
      const x = Math.cos(a) * sp * t, z = Math.sin(a) * sp * t, y = up * t - 4.9 * t * t;
      const vx = Math.cos(a) * sp, vy = up - 9.8 * t, ang = Math.atan2(vy, sp);
      return <mesh key={j} material={waterMat(env, 0.8, "s")} position={[x, Math.max(-0.08, y) + 0.005, z]} rotation={[0, -a, ang - Math.PI / 2]} scale={[1, 1.8, 1]}><sphereGeometry args={[r * 0.24 * (1 - t * 1.4), 8, 6]} /></mesh>;
    })}
    {ss < 0.18 && <mesh position={[0, 0.01 + ss * 0.08, 0]}><cylinderGeometry args={[r * 1.2 + ss * (skin ? 0.18 : 0.35), r * 0.9 + ss * (skin ? 0.15 : 0.3), 0.02 + ss * 0.1, 20, 1, true]} /><meshStandardMaterial color="#d8f0ff" transparent opacity={(1 - ss / 0.18) * 0.35} side={THREE.DoubleSide} envMap={env} roughness={0.05} depthWrite={false} /></mesh>}
    {skin && [0, 1].map((j) => { const t = ss * 0.8; if (t > 1.1) return null; const dir = new THREE.Vector3(to[0] - HEAD[0], to[1] - HEAD[1], to[2] - HEAD[2]).normalize(); const side = new THREE.Vector3(j ? 0.3 : -0.25, -0.35, 1).normalize();
      const v = dir.clone().lerp(side, Math.min(1, t * (0.8 + j * 0.3))).normalize().multiplyScalar(0.21); return <mesh key={"ro" + j} material={waterMat(env, 0.85, "s")} position={[HEAD[0] + v.x - to[0], HEAD[1] + v.y - to[1], HEAD[2] + v.z - to[2]]} scale={[1, 1.4, 1]}><sphereGeometry args={[r * 0.28, 8, 6]} /></mesh>; })}
    <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[r + ss * (skin ? 0.1 : 0.25), r * 1.3 + ss * (skin ? 0.11 : 0.27), 28]} /><meshBasicMaterial color="#e2f4ff" transparent opacity={Math.max(0, (skin ? 0.3 : 0.5) - ss * 1.5)} side={THREE.DoubleSide} depthWrite={false} /></mesh>
    {ss < 0.35 && <sprite position={[0, 0.03 + ss * 0.1, 0]} scale={[0.06 + ss * 0.25, 0.04 + ss * 0.15, 1]}><spriteMaterial map={smokeTex2()} transparent opacity={(1 - ss / 0.35) * 0.35} depthWrite={false} /></sprite>}
  </group>;
};
/** glossy wet patch on the forehead and sweat beads, positioned on the head sphere (world space) */
export const Wet: React.FC<{ wet: number; sweat: number; look: number; seed?: string }> = ({ wet, sweat, look, seed = "w" }) => {
  const env = useEnv(), R = 0.207, a = -look * 30 * Math.PI / 180; // face tilt toward +z
  const pt = (u: number, v: number): [number, number, number] => { // u along body (-x = top of head), v sideways on face
    const n = new THREE.Vector3(Math.sin(u), Math.cos(u) * Math.cos(v), Math.cos(u) * Math.sin(v)); return [HEAD[0] + n.x * R, HEAD[1] + n.y * R, HEAD[2] + n.z * R];
  };
  return <group>
    {wet > 0 && <mesh position={FOREHEAD} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}><circleGeometry args={[0.008 + 0.028 * wet, 24]} /><meshPhysicalMaterial color="#9fc6e0" transparent opacity={0.22} roughness={0.02} envMap={env} envMapIntensity={2.5} clearcoat={1} depthWrite={false} polygonOffset polygonOffsetFactor={-4} /></mesh>}
    {Array.from({ length: Math.round(sweat * 9) }).map((_, i) => { const u = -0.75 + random(seed + "u" + i) * 0.45, v = a + (random(seed + "v" + i) - 0.5) * 1.3; return <mesh key={i} position={pt(u, v)} material={waterMat(env, 0.85, "sw")}><sphereGeometry args={[0.0035 + random(seed + "r" + i) * 0.003, 10, 8]} /></mesh>; })}
  </group>;
};


/* ---------------- set dressing ---------------- */
const webTex = () => textTex("web", 256, 256, (c) => { c.strokeStyle = "rgba(230,230,235,0.55)"; c.lineWidth = 1; const cx = 0, cy = 0;
  for (let i = 0; i <= 8; i++) { const a = (i / 8) * Math.PI / 2; c.beginPath(); c.moveTo(cx, cy); c.lineTo(Math.cos(a) * 256, Math.sin(a) * 256); c.stroke(); }
  for (let r = 20; r < 250; r += 18 + random("wr" + r) * 10) { c.beginPath(); for (let i = 0; i <= 8; i++) { const a = (i / 8) * Math.PI / 2, rr = r * (0.92 + random("wq" + r + i) * 0.12); const x = Math.cos(a) * rr, y = Math.sin(a) * rr; i ? c.quadraticCurveTo(Math.cos(a - 0.1) * rr * 0.93, Math.sin(a - 0.1) * rr * 0.93, x, y) : c.moveTo(x, y); } c.stroke(); } });
const Web: React.FC<{ p: [number, number, number]; r: [number, number, number]; s?: number }> = ({ p, r, s = 0.9 }) => <mesh position={p} rotation={r}><planeGeometry args={[s, s]} /><meshBasicMaterial map={webTex()} transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} /></mesh>;
const iron = { color: "#34343a", metalness: 0.85, roughness: 0.42 };
const ToolRack: React.FC<{ p: [number, number, number] }> = ({ p }) => {
  const wood = TX.wood(3, 1, "#4a3220");
  return <group position={p}>
    <Box p={[0, 0, 0.03]} s={[1.3, 0.12, 0.05]} map={wood} />
    {[-0.5, -0.22, 0.08, 0.36].map((x) => <mesh key={x} position={[x, 0.0, 0.07]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.008, 0.008, 0.06, 6]} /><meshStandardMaterial {...iron} /></mesh>)}
    {/* pincers */}
    <group position={[-0.5, -0.22, 0.09]}>{[-1, 1].map((sd) => <mesh key={sd} rotation={[0, 0, sd * 0.1]} position={[sd * 0.012, 0, 0]}><boxGeometry args={[0.014, 0.42, 0.012]} /><meshStandardMaterial {...iron} /></mesh>)}<mesh position={[0, 0.06, 0.008]}><sphereGeometry args={[0.012, 8, 6]} /><meshStandardMaterial {...iron} /></mesh></group>
    {/* hammer */}
    <group position={[-0.22, -0.18, 0.09]}><mesh><cylinderGeometry args={[0.012, 0.014, 0.34, 8]} /><meshStandardMaterial color="#5a3c24" /></mesh><mesh position={[0, -0.18, 0]} rotation={[0, 0, Math.PI / 2]}><boxGeometry args={[0.05, 0.12, 0.05]} /><meshStandardMaterial {...iron} /></mesh></group>
    {/* saw */}
    <group position={[0.08, -0.2, 0.08]}><mesh position={[0, -0.05, 0]}><boxGeometry args={[0.1, 0.32, 0.004]} /><meshStandardMaterial color="#6a6a70" metalness={0.9} roughness={0.3} /></mesh><mesh position={[0, 0.13, 0]}><boxGeometry args={[0.12, 0.08, 0.025]} /><meshStandardMaterial color="#4a3220" /></mesh></group>
    {/* coiled whip */}
    <group position={[0.36, -0.12, 0.09]}>{[0, 1, 2].map((i) => <mesh key={i} position={[0, -0.02 * i, 0.004 * i]}><torusGeometry args={[0.09 - i * 0.012, 0.009, 6, 24]} /><meshStandardMaterial color="#2a1a10" roughness={0.6} /></mesh>)}<mesh position={[0.02, -0.24, 0]} rotation={[0, 0, 0.15]}><cylinderGeometry args={[0.005, 0.003, 0.24, 6]} /><meshStandardMaterial color="#2a1a10" /></mesh></group>
    {/* spare shackles */}
    <group position={[0.58, -0.2, 0.08]}>{[0, 1, 2, 3, 4].map((i) => <mesh key={i} position={[0, -i * 0.05, 0]} rotation={[0, i % 2 ? Math.PI / 2 : 0, 0]}><torusGeometry args={[0.022, 0.006, 6, 10]} /><meshStandardMaterial {...iron} /></mesh>)}<mesh position={[0, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.05, 0.012, 8, 18]} /><meshStandardMaterial {...iron} /></mesh></group>
  </group>;
};
const Barrel: React.FC<{ p: [number, number, number]; s?: number; ry?: number }> = ({ p, s = 1, ry = 0 }) => {
  const geo = React.useMemo(() => { const pts = []; for (let i = 0; i <= 12; i++) { const y = i / 12; pts.push(new THREE.Vector2(0.22 + Math.sin(Math.PI * y) * 0.04, y * 0.7)); } return new THREE.LatheGeometry(pts, 28); }, []);
  return <group position={p} scale={s} rotation={[0, ry, 0]}>
    <mesh geometry={geo} castShadow receiveShadow><meshStandardMaterial map={TX.wood(4, 1, "#5a3c24")} roughness={0.85} /></mesh>
    {[0.08, 0.35, 0.62].map((y) => <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.22 + Math.sin(Math.PI * y / 0.7) * 0.04 + 0.004, 0.01, 6, 28]} /><meshStandardMaterial {...iron} /></mesh>)}
    <mesh position={[0, 0.7, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.22, 28]} /><meshStandardMaterial map={TX.wood(2, 2, "#4a3220")} /></mesh>
  </group>;
};
const Brazier: React.FC<{ p: [number, number, number]; f: number; on?: number }> = ({ p, f, on = 1 }) => <group position={p}>
  {[0, 1, 2].map((i) => <mesh key={i} position={[Math.cos(i * 2.1) * 0.16, 0.28, Math.sin(i * 2.1) * 0.16]} rotation={[Math.sin(i * 2.1) * 0.25, 0, -Math.cos(i * 2.1) * 0.25]}><cylinderGeometry args={[0.014, 0.014, 0.6, 6]} /><meshStandardMaterial {...iron} /></mesh>)}
  <mesh position={[0, 0.58, 0]}><cylinderGeometry args={[0.26, 0.16, 0.14, 24, 1, true]} /><meshStandardMaterial {...iron} side={THREE.DoubleSide} /></mesh>
  {Array.from({ length: 34 }).map((_, i) => { const a = random("ca" + i) * 6.28, rr = Math.sqrt(random("cr" + i)) * 0.2; return <mesh key={i} position={[Math.cos(a) * rr, 0.6 + random("cy" + i) * 0.04, Math.sin(a) * rr]} rotation={[random("rx" + i) * 3, random("ry" + i) * 3, 0]}><dodecahedronGeometry args={[0.018 + random("cs" + i) * 0.016, 0]} /><meshStandardMaterial color="#1a0d08" emissive={i % 3 ? "#c8300a" : "#ff7a20"} emissiveIntensity={(0.25 + 0.35 * Math.max(0, Math.sin(f / 11 + i * 1.7))) * on} roughness={1} /></mesh>; })}
  {Array.from({ length: 4 }).map((_, i) => <sprite key={"fl" + i} position={[(random("fx" + i) - 0.5) * 0.18, 0.7 + Math.sin(f / 4 + i) * 0.01, (random("fz" + i) - 0.5) * 0.18]} scale={[0.1 * on, (0.2 + 0.05 * Math.sin(f / 3 + i * 2)) * on, 1]}><spriteMaterial map={flameTex()} transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>)}
  <mesh position={[0.08, 0.72, 0]} rotation={[0, 0, -0.9]}><cylinderGeometry args={[0.008, 0.008, 0.5, 6]} /><meshStandardMaterial {...iron} /></mesh>
  <sprite position={[0, 0.72, 0]} scale={[0.6 * on, 0.4 * on, 1]}><spriteMaterial map={glowTex()} color="#ff5a1a" transparent opacity={0.4 * on} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
  {Array.from({ length: 5 }).map((_, i) => { const q = ((f * 0.012 + random("bs" + i)) % 1); return <sprite key={i} position={[Math.sin(f / 30 + i) * 0.08 * q, 0.75 + q * 1.1, Math.cos(f / 27 + i) * 0.08 * q]} scale={[0.25 + q * 0.5, 0.25 + q * 0.5, 1]}><spriteMaterial map={smokeTex2()} color="#6a6a70" transparent opacity={Math.sin(Math.PI * q) * 0.12} depthWrite={false} /></sprite>; })}
  <pointLight position={[0, 0.85, 0]} intensity={2.4 * on * (0.9 + 0.1 * Math.sin(f / 5))} distance={3.5} color="#ff6a20" />
</group>;
const Bones: React.FC<{ p: [number, number, number]; ry?: number }> = ({ p, ry = 0 }) => <group position={p} rotation={[0, ry, 0]}>
  <group position={[0, 0.075, 0]} rotation={[0.2, 0.6, 0.15]}>
    <mesh scale={[1, 0.95, 1.1]}><sphereGeometry args={[0.08, 20, 14]} /><meshStandardMaterial color="#cfc3a6" roughness={0.8} /></mesh>
    {[-1, 1].map((sd) => <mesh key={sd} position={[sd * 0.03, 0.0, 0.07]} scale={[1, 1.1, 0.6]}><sphereGeometry args={[0.02, 10, 8]} /><meshStandardMaterial color="#1a1410" /></mesh>)}
    <mesh position={[0, -0.04, 0.075]}><coneGeometry args={[0.012, 0.02, 3]} /><meshStandardMaterial color="#1a1410" /></mesh>
    <mesh position={[0, -0.07, 0.035]} scale={[1, 0.4, 0.9]}><sphereGeometry args={[0.055, 14, 8]} /><meshStandardMaterial color="#c8bc9e" roughness={0.8} /></mesh>
  </group>
  {[[0.2, 0.3, 1.2], [0.12, -0.15, 0.4], [-0.15, 0.2, 2.2]].map(([x, z, r], i) => <group key={i} position={[x, 0.02, z]} rotation={[0, r, Math.PI / 2]}><mesh><cylinderGeometry args={[0.012, 0.012, 0.28, 8]} /><meshStandardMaterial color="#c8bc9e" roughness={0.8} /></mesh>{[-1, 1].map((e) => <mesh key={e} position={[0, e * 0.14, 0]}><sphereGeometry args={[0.022, 8, 6]} /><meshStandardMaterial color="#c8bc9e" roughness={0.8} /></mesh>)}</group>)}
</group>;
/** a rat scurrying along a floor path between frames a..b */
export const Rat: React.FC<{ f: number; a: number; b: number; from: [number, number]; to: [number, number] }> = ({ f, a, b, from, to }) => {
  if (f < a || f > b) return null;
  const q = (f - a) / (b - a), x = from[0] + (to[0] - from[0]) * q, z = from[1] + (to[1] - from[1]) * q, ry = Math.atan2(to[0] - from[0], to[1] - from[1]);
  const hop = Math.abs(Math.sin(f * 1.6)) * 0.012;
  return <group position={[x, 0.035 + hop, z]} rotation={[0, ry, 0]}>
    <mesh scale={[0.045, 0.04, 0.085]}><sphereGeometry args={[1, 14, 10]} /><meshStandardMaterial color="#4a4038" roughness={0.9} /></mesh>
    <mesh position={[0, 0.005, 0.09]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.8]}><coneGeometry args={[0.026, 0.06, 10]} /><meshStandardMaterial color="#4a4038" roughness={0.9} /></mesh>
    {[-1, 1].map((sd) => <mesh key={sd} position={[sd * 0.02, 0.03, 0.075]}><sphereGeometry args={[0.012, 8, 6]} /><meshStandardMaterial color="#8a6a60" /></mesh>)}
    <mesh position={[0, -0.002, 0.12]}><sphereGeometry args={[0.006, 6, 4]} /><meshStandardMaterial color="#d08a8a" /></mesh>
    {[-1, 1].map((sd) => <mesh key={"e" + sd} position={[sd * 0.012, 0.016, 0.1]}><sphereGeometry args={[0.004, 6, 4]} /><meshBasicMaterial color="#000" /></mesh>)}
    {Array.from({ length: 8 }).map((_, i) => <mesh key={"t" + i} position={[Math.sin(f / 3 + i * 0.6) * 0.01 * i, -0.02, -0.085 - i * 0.022]}><sphereGeometry args={[0.006 - i * 0.0005, 6, 4]} /><meshStandardMaterial color="#9a7a70" /></mesh>)}
    {[[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz], i) => <mesh key={"l" + i} position={[sx * 0.03, -0.03, sz * 0.045 + Math.sin(f * 1.6 + i * 1.7) * 0.012]}><sphereGeometry args={[0.009, 6, 4]} /><meshStandardMaterial color="#8a6a60" /></mesh>)}
  </group>;
};
/** periodic ceiling drip into a puddle with ripples */
const CeilingDrip: React.FC<{ f: number; p: [number, number]; per?: number; off?: number }> = ({ f, p, per = 47, off = 0 }) => {
  const env = useEnv(); const ph = ((f + off) % per), q = ph / 14;
  return <group>
    {q <= 1 && <mesh position={[p[0], 3.25 - 3.24 * q * q, p[1]]} material={waterMat(env, 0.7)} scale={[0.8, 1.3, 0.8]}><sphereGeometry args={[0.012, 10, 8]} /></mesh>}
    {[0, 1].map((k) => { const s = (ph - 14 + k * per) / 30; if (s < 0 || s > 1) return null; return <mesh key={k} position={[p[0], 0.007, p[1]]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.01 + s * 0.3, 0.016 + s * 0.31, 32]} /><meshBasicMaterial color="#cfe6f2" transparent opacity={(1 - s) * 0.35} depthWrite={false} /></mesh>; })}
  </group>;
};

/* ---------------- the cell ---------------- */
export const Dungeon: React.FC<{ f: number; torch?: number; day?: number; candle?: number; door?: number; sun?: number; tspeed?: number }> = ({ f, torch = 1, day = 0, candle = 1, door = 0, sun = 0.5, tspeed = 1 }) => {
  const W = 6.4, D = 6.4, Hh = 3.4;
  const wall = masonry("w", [128, 114, 98], 2, 1.4), floor = masonry("f", [96, 88, 78], 3, 3, 6), env = useEnv();
  const beam = TX.wood(1, 4, "#3e2a1a");
  const dayK = day;
  const shaftO = 0.05 + dayK * 0.16;
  const sx = 0.2 + (sun - 0.5) * 1.6; // sun patch moves across the floor during the day
  return (
    <group>
      <ambientLight intensity={0.1 + dayK * 0.3} color={dayK > 0.5 ? "#c8d4e0" : "#55638a"} />
      <hemisphereLight args={["#3a4a6a", "#1a120a", 0.22 + dayK * 0.35]} />
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[W, D]} /><meshStandardMaterial map={floor} bumpMap={floor} bumpScale={3} roughness={0.85} /></mesh>
      {[[0, Hh / 2, -D / 2, 0], [-W / 2, Hh / 2, 0, Math.PI / 2], [W / 2, Hh / 2, 0, -Math.PI / 2], [0, Hh / 2, D / 2, Math.PI]].map(([x, y, z, r], i) => <mesh key={i} position={[x, y, z]} rotation={[0, r, 0]} receiveShadow><planeGeometry args={[W, Hh]} /><meshStandardMaterial map={wall} bumpMap={wall} bumpScale={3.5} roughness={0.92} /></mesh>)}
      <mesh position={[0, Hh, 0]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[W, D]} /><meshStandardMaterial color="#1a1612" roughness={1} /></mesh>
      {[-2.2, -0.6, 1.0, 2.6].map((z) => <Box key={z} p={[0, Hh - 0.12, z]} s={[W, 0.22, 0.24]} map={beam} rough={0.9} />)}
      <Arch p={[-1.0, 0, -D / 2 + 0.01]} tex={wall} />
      <Arch p={[-W / 2 + 0.01, 0, 1.6]} ry={Math.PI / 2} tex={wall} />
      {/* heavy door with iron straps; door = 0 closed .. 1 open */}
      <group position={[1.9, 0, -D / 2 + 0.05]}>
        <Arch p={[0, 0, 0]} r={0.58} h={2.0} tex={wall} />
        <group position={[-0.5, 0, 0.06]} rotation={[0, -door * 1.7, 0]}>
          <group position={[0.5, 0, 0]}>
            <Box p={[0, 1.0, 0]} s={[1.0, 2.0, 0.08]} map={TX.wood(3, 1, "#3e2a1a")} />
            <mesh position={[0, 2.0, 0]}><cylinderGeometry args={[0.5, 0.5, 0.08, 24, 1, false, -Math.PI / 2, Math.PI]} /><meshStandardMaterial color="#3e2a1a" roughness={0.9} /></mesh>
            {[0.45, 1.5].map((y) => <Box key={y} p={[0, y, 0.05]} s={[1.0, 0.07, 0.02]} c="#26262a" metal={0.75} rough={0.4} />)}
            <Box p={[0.32, 1.0, 0.07]} s={[0.05, 0.14, 0.03]} c="#26262a" metal={0.75} />
            <Box p={[0, 1.55, 0.05]} s={[0.3, 0.24, 0.02]} c="#0a0806" />
            {[-0.08, 0, 0.08].map((x) => <Box key={x} p={[x, 1.55, 0.065]} s={[0.018, 0.24, 0.018]} c="#26262a" metal={0.7} />)}
          </group>
        </group>
        {door > 0.02 && <pointLight position={[0, 1.2, -0.6]} intensity={2.5 * door} distance={3} color="#ffb070" />}
      </group>
      {/* barred window with light shaft and dust in it */}
      <group position={[-W / 2 + 0.02, 2.6, -0.9]} rotation={[0, Math.PI / 2, 0]}>
        <Box p={[0, 0, -0.05]} s={[0.72, 0.48, 0.06]} c={dayK > 0.5 ? "#f2f6fa" : "#1a2a48"} e={dayK > 0.5 ? "#d8e6f4" : "#1d3766"} ei={0.6 + dayK * 2} />
        {[-0.22, -0.07, 0.07, 0.22].map((x) => <Box key={x} p={[x, 0, 0.02]} s={[0.028, 0.5, 0.03]} c="#1e1e20" metal={0.7} />)}
      </group>
      <spotLight position={[-W / 2 + 0.25, 2.6, -0.9]} target-position={[sx, 0, -0.5]} angle={0.4} penumbra={0.6} intensity={1.6 + dayK * 14} distance={9} color={dayK > 0.5 ? "#fff1d8" : "#7a96d0"} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      {(() => { const a = new THREE.Vector3(-W / 2 + 0.1, 2.6, -0.9), b = new THREE.Vector3(sx, 0, -0.5), m = a.clone().add(b).multiplyScalar(0.5), len = a.distanceTo(b); const dir = b.clone().sub(a).normalize(); const qn = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
        return <group position={m} quaternion={qn}><mesh><cylinderGeometry args={[0.28, 0.75, len, 24, 1, true]} /><meshBasicMaterial map={shaftTex()} color={dayK > 0.5 ? "#fff3d8" : "#9bb4e8"} transparent opacity={shaftO} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
          {Array.from({ length: 34 }).map((_, i) => { const t = (random("dt" + i) + f * 0.0015 * (0.5 + random("ds" + i))) % 1; return <sprite key={i} position={[(random("dx" + i) - 0.5) * (0.3 + t * 0.6) + Math.sin(f / 40 + i) * 0.04, len / 2 - t * len, (random("dz" + i) - 0.5) * (0.3 + t * 0.6)]} scale={[0.008, 0.008, 1]}><spriteMaterial map={glowTex()} transparent opacity={(0.25 + dayK * 0.55) * Math.sin(Math.PI * t)} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>; })}
        </group>; })()}
      <Torch p={[-2.4, 1.95, -D / 2 + 0.02]} f={f} on={torch} seed="a" speed={tspeed} />
      <Torch p={[W / 2 - 0.02, 1.95, -0.6]} ry={-Math.PI / 2} f={f} on={torch} seed="bb" speed={tspeed} />
      <Torch p={[0.6, 1.95, D / 2 - 0.02]} ry={Math.PI} f={f} on={torch} seed="ccc" speed={tspeed} />
      <Chain p={[-0.55, 2.7, -D / 2 + 0.05]} f={f} /><Chain p={[-0.15, 2.7, -D / 2 + 0.05]} f={f} n={11} />
      <Chain p={[W / 2 - 0.05, 2.5, 1.3]} f={f} n={12} />
      {/* bucket, straw, stool with candle near the head, puddles, low mist */}
      <group position={[2.2, 0, 1.4]}><Cyl p={[0, 0.2, 0]} r1={0.2} r2={0.17} h={0.4} c="#4e3420" />{[0.08, 0.32].map((y) => <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.19, 0.01, 6, 24]} /><meshStandardMaterial color="#26262a" metalness={0.7} /></mesh>)}<Contact p={[0, 0, 0]} s={[0.7, 0.7]} /></group>
      {Array.from({ length: 60 }).map((_, i) => <Box key={i} p={[-2.4 + random("st" + i) * 1.1, 0.01, 1.6 + random("sz" + i) * 1.3]} s={[0.25, 0.012, 0.012]} r={[0, random("sr" + i) * 3, 0]} c="#9c844a" />)}
      <group position={[-1.25, 0, 0.78]}>
        <Cyl p={[0, 0.45, 0]} r1={0.16} h={0.05} c="#3e2a1a" />{[0, 1, 2].map((i) => <mesh key={i} position={[Math.cos(i * 2.1) * 0.1, 0.21, Math.sin(i * 2.1) * 0.1]} rotation={[Math.sin(i * 2.1) * 0.15, 0, -Math.cos(i * 2.1) * 0.15]}><cylinderGeometry args={[0.018, 0.022, 0.44, 8]} /><meshStandardMaterial color="#33221a" /></mesh>)}
        <mesh position={[0, 0.48, 0]}><cylinderGeometry args={[0.06, 0.07, 0.015, 16]} /><meshStandardMaterial color="#2a2a2e" metalness={0.7} roughness={0.4} /></mesh>
        <mesh position={[0, 0.49 + 0.12 * candle, 0]}><cylinderGeometry args={[0.03, 0.032, 0.24 * candle, 14]} /><meshStandardMaterial color="#efe2c4" roughness={0.6} emissive="#ffb060" emissiveIntensity={0.15} /></mesh>
        <mesh position={[0.02, 0.49, 0.01]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.035 + (1 - candle) * 0.04, 16]} /><meshStandardMaterial color="#e8d8b8" roughness={0.6} /></mesh>
        {candle > 0.03 && <><sprite position={[0, 0.49 + 0.24 * candle + 0.04, 0]} scale={[0.04, 0.09, 1]}><spriteMaterial map={flameTex()} transparent depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
          <sprite position={[0, 0.49 + 0.24 * candle + 0.03, 0]} scale={[0.35, 0.35, 1]}><spriteMaterial map={glowTex()} color="#ffa040" transparent opacity={0.25} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
          <pointLight position={[0, 0.55 + 0.24 * candle, 0.05]} intensity={1.1} distance={2.4} color="#ffb060" /></>}
      </group>
      {[[-0.74, 0.0, 0.42], [1.4, -1.6, 0.6], [-1.9, 1.0, 0.35]].map(([x, z, r], i) => <mesh key={i} position={[x, 0.004, z]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.7, 1]}><circleGeometry args={[r, 32]} /><meshStandardMaterial color="#141a1e" roughness={0.03} metalness={0.6} envMap={env} envMapIntensity={0.5} /></mesh>)}
      {Array.from({ length: 12 }).map((_, i) => { const x = -3 + ((random("mx" + i) * 6 + f * 0.002 * (0.5 + random("mv" + i))) % 6); return <sprite key={i} position={[x, 0.15 + random("my" + i) * 0.2, -2.8 + random("mz" + i) * 5.6]} scale={[1.6, 0.5, 1]}><spriteMaterial map={smokeTex2()} color="#8a9ab8" transparent opacity={0.07} depthWrite={false} /></sprite>; })}
      <ToolRack p={[0.35, 1.95, -D / 2 + 0.02]} />
      <Barrel p={[2.65, 0, -2.6]} /><Barrel p={[2.2, 0, -2.85]} s={0.9} ry={1} /><Barrel p={[2.75, 0, -2.0]} s={0.85} ry={2} />
      <Brazier p={[2.6, 0, -1.25]} f={f * tspeed} on={torch} />
      <Bones p={[-2.75, 0, -2.75]} ry={0.7} />
      <Web p={[-W / 2 + 0.35, Hh - 0.35, -D / 2 + 0.02]} r={[0, 0, Math.PI]} /><Web p={[W / 2 - 0.02, Hh - 0.4, -D / 2 + 0.4]} r={[0, -Math.PI / 2, Math.PI]} s={1.1} /><Web p={[-W / 2 + 0.02, Hh - 0.4, D / 2 - 0.5]} r={[0, Math.PI / 2, Math.PI / 2]} />
      {[[1.9, -D / 2 + 0.35, 0.18], [1.9, -D / 2 + 0.7, 0.09]].map(([x, z, h], i) => <Box key={"st" + i} p={[x, h / 2, z]} s={[1.3, h, 0.36]} map={floor} rough={0.9} />)}
      <CeilingDrip f={f} p={[1.4, -1.6]} /><CeilingDrip f={f} p={[-1.9, 1.0]} per={61} off={20} />
      {[[-W / 2 + 0.05, 1.2, -2.2], [W / 2 - 0.05, 1.2, 2.2]].map(([x, y, z], i) => <mesh key={"ring" + i} position={[x, y, z]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.07, 0.014, 8, 18]} /><meshStandardMaterial color="#34343a" metalness={0.85} roughness={0.4} /></mesh>)}
      <Contact p={[0, 0, 0]} s={[W, D]} o={0.2} />
    </group>
  );
};
