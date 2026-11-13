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
const STRAPS: [number, number, number][] = [[-0.22, 1.035, 0.1], [0.42, 1.0, 0.08], [0.8, 0.995, 0.08]];
export const Table: React.FC<{ straps: number[] }> = ({ straps }) => {
  const wood = TX.wood(1, 3, "#5e4029");
  return (
    <group>
      <Box p={[0.3, TABLE_Y - 0.05, 0]} s={[1.5, 0.1, 0.78]} map={wood} rough={0.8} />
      <Box p={[-0.68, TABLE_Y - 0.17, 0]} s={[0.55, 0.1, 0.62]} map={wood} rough={0.8} />
      {[[-0.85, -0.3], [-0.85, 0.3], [0.95, -0.3], [0.95, 0.3]].map(([x, z], i) => <Box key={i} p={[x, (TABLE_Y - 0.1) / 2, z]} s={[0.1, TABLE_Y - 0.1, 0.1]} map={wood} />)}
      <Box p={[0.05, 0.25, 0]} s={[1.8, 0.06, 0.06]} c="#3e2a1a" />
      {[[-0.45, 0.39], [-0.45, -0.39], [1.05, 0.39], [1.05, -0.39]].map(([x, z], i) => <Box key={"m" + i} p={[x, TABLE_Y - 0.05, z]} s={[0.12, 0.12, 0.02]} c="#2e2e32" metal={0.8} rough={0.35} />)}
      {[-1, 1].map((sd) => <Box key={sd} p={[-0.68, TABLE_Y - 0.02, sd * 0.25]} s={[0.26, 0.2, 0.08]} map={wood} />)}
      {STRAPS.map(([x, y, t], i) => {
        const k = straps[i] ?? 0; if (k <= 0) return null;
        const lift = (1 - k) * 0.09, w = 0.6;
        return <group key={i} position={[x, y + lift, 0]}>
          <mesh><boxGeometry args={[t, 0.022, w * (1 + (1 - k) * 0.2)]} /><meshStandardMaterial color="#3a2214" roughness={0.55} /></mesh>
          {[-1, 1].map((sd) => <mesh key={sd} position={[0, -0.12 - lift / 2, sd * w / 2]}><boxGeometry args={[t, 0.25 + lift, 0.022]} /><meshStandardMaterial color="#3a2214" roughness={0.55} /></mesh>)}
          <mesh position={[0, 0.016, w / 2 - 0.1]}><boxGeometry args={[t * 1.15, 0.012, 0.06]} /><meshStandardMaterial color="#b89a58" metalness={0.85} roughness={0.25} /></mesh>
          {/* loose tail being pulled */}
          <mesh position={[0, 0.02 + (1 - k) * 0.06, w / 2 + 0.04 + (1 - k) * 0.12]} rotation={[-(1 - k) * 0.9, 0, 0]}><boxGeometry args={[t * 0.9, 0.018, 0.14]} /><meshStandardMaterial color="#3a2214" roughness={0.55} /></mesh>
        </group>;
      })}
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
    {ss < 0.18 && <mesh position={[0, 0.01 + ss * 0.08, 0]}><cylinderGeometry args={[r * 1.2 + ss * 0.35, r * 0.9 + ss * 0.3, 0.02 + ss * 0.1, 20, 1, true]} /><meshStandardMaterial color="#d8f0ff" transparent opacity={(1 - ss / 0.18) * 0.35} side={THREE.DoubleSide} envMap={env} roughness={0.05} depthWrite={false} /></mesh>}
    <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[r + ss * 0.25, r * 1.3 + ss * 0.27, 28]} /><meshBasicMaterial color="#e2f4ff" transparent opacity={Math.max(0, 0.5 - ss * 1.2)} side={THREE.DoubleSide} depthWrite={false} /></mesh>
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
    {wet > 0 && <mesh position={FOREHEAD} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}><circleGeometry args={[0.012 + 0.05 * wet, 24]} /><meshPhysicalMaterial color="#9fc6e0" transparent opacity={0.35} roughness={0.02} envMap={env} envMapIntensity={2.5} clearcoat={1} depthWrite={false} polygonOffset polygonOffsetFactor={-4} /></mesh>}
    {Array.from({ length: Math.round(sweat * 9) }).map((_, i) => { const u = -0.75 + random(seed + "u" + i) * 0.45, v = a + (random(seed + "v" + i) - 0.5) * 1.3; return <mesh key={i} position={pt(u, v)} material={waterMat(env, 0.85, "sw")}><sphereGeometry args={[0.0035 + random(seed + "r" + i) * 0.003, 10, 8]} /></mesh>; })}
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
      <Contact p={[0, 0, 0]} s={[W, D]} o={0.2} />
    </group>
  );
};
