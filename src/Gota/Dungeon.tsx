import React from "react";
import * as THREE from "three";
import { random } from "remotion";
import { Box, Cyl, Sph, TX } from "../Miya3/Kit3";
import { textTex } from "../Miya3/Sets3";

/** stone block wall texture */
export const stoneTex = (key: string, base: [number, number, number], rx = 3, ry = 2) => {
  const t = textTex("stone" + key, 512, 512, (c) => {
    c.fillStyle = `rgb(${base[0] - 30},${base[1] - 30},${base[2] - 30})`; c.fillRect(0, 0, 512, 512);
    const rows = 8;
    for (let r = 0; r < rows; r++) {
      const h = 512 / rows, off = (r % 2) * 40; let x = -off;
      while (x < 512) {
        const w = 70 + random(`sw${key}${r}${x}`) * 70, k = 0.75 + random(`sk${key}${r}${x}`) * 0.4;
        c.fillStyle = `rgb(${base[0] * k | 0},${base[1] * k | 0},${base[2] * k | 0})`;
        c.beginPath(); (c as any).roundRect ? (c as any).roundRect(x + 3, r * h + 3, w - 6, h - 6, 8) : c.rect(x + 3, r * h + 3, w - 6, h - 6); c.fill();
        for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(0,0,0,${random(`sn${key}${r}${x}${i}`) * 0.12})`; c.fillRect(x + random(`sx${key}${r}${x}${i}`) * w, r * h + random(`sy${key}${r}${x}${i}`) * h, 3, 3); }
        c.fillStyle = "rgba(255,255,255,0.06)"; c.fillRect(x + 5, r * h + 5, w - 10, 4);
        x += w;
      }
    }
    // damp streaks
    for (let i = 0; i < 9; i++) { const g = c.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, "rgba(20,30,20,0)"); g.addColorStop(0.5, "rgba(20,30,20,0.18)"); g.addColorStop(1, "rgba(20,30,20,0)"); c.fillStyle = g; c.fillRect(random(`dm${key}${i}`) * 512, 0, 10 + random(`dw${key}${i}`) * 25, 512); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return t;
};
const flameTex = () => textTex("flame", 64, 128, (c) => {
  const g = c.createRadialGradient(32, 90, 2, 32, 80, 60); g.addColorStop(0, "rgba(255,250,220,1)"); g.addColorStop(0.25, "rgba(255,190,80,0.95)"); g.addColorStop(0.6, "rgba(255,90,20,0.6)"); g.addColorStop(1, "rgba(255,60,0,0)");
  c.fillStyle = g; c.beginPath(); c.moveTo(32, 4); c.quadraticCurveTo(60, 70, 32, 124); c.quadraticCurveTo(4, 70, 32, 4); c.fill();
});
const glowTex = () => textTex("glow8", 128, 128, (c) => { const g = c.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, "rgba(255,200,120,0.9)"); g.addColorStop(1, "rgba(255,120,40,0)"); c.fillStyle = g; c.fillRect(0, 0, 128, 128); });
const radial = () => textTex("rad_d", 128, 128, (c) => { const g = c.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, "rgba(0,0,0,0.8)"); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(0, 0, 128, 128); });

export const Torch: React.FC<{ p: [number, number, number]; ry?: number; f: number; on?: number; seed?: string }> = ({ p, ry = 0, f, on = 1, seed = "t" }) => {
  const fl = 1 + Math.sin(f / 2.3 + seed.length) * 0.08 + (random(seed + Math.floor(f / 2)) - 0.5) * 0.18;
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <Box p={[0, 0, 0.06]} s={[0.08, 0.16, 0.04]} c="#2b2622" metal={0.6} rough={0.5} />
      <mesh position={[0, 0.08, 0.16]} rotation={[0.5, 0, 0]}><cylinderGeometry args={[0.035, 0.025, 0.36, 10]} /><meshStandardMaterial color="#4a3320" /></mesh>
      <mesh position={[0, 0.25, 0.25]} rotation={[0.5, 0, 0]}><cylinderGeometry args={[0.05, 0.04, 0.08, 10]} /><meshStandardMaterial color="#2a1a10" /></mesh>
      {on > 0.02 && <>
        <sprite position={[0, 0.42, 0.29]} scale={[0.22 * fl * on, 0.42 * fl * on, 1]}><spriteMaterial map={flameTex()} transparent depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
        <sprite position={[0, 0.36, 0.3]} scale={[0.9 * on, 0.9 * on, 1]}><spriteMaterial map={glowTex()} transparent opacity={0.35 * on} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
        <pointLight position={[0, 0.45, 0.45]} intensity={4.2 * fl * on} distance={5.5} decay={1.6} color="#ff9a4a" castShadow={false} />
      </>}
    </group>
  );
};
const Chain: React.FC<{ p: [number, number, number]; n?: number; f: number; sway?: number }> = ({ p, n = 9, f, sway = 0 }) => (
  <group position={p} rotation={[0, 0, Math.sin(f / 23) * 0.04 * sway]}>{Array.from({ length: n }).map((_, i) => <mesh key={i} position={[0, -i * 0.07, 0]} rotation={[0, i % 2 ? Math.PI / 2 : 0, 0]}><torusGeometry args={[0.03, 0.009, 6, 12]} /><meshStandardMaterial color="#3a3a3e" metalness={0.8} roughness={0.4} /></mesh>)}
    <mesh position={[0, -n * 0.07 - 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.06, 0.016, 8, 16]} /><meshStandardMaterial color="#3a3a3e" metalness={0.8} roughness={0.4} /></mesh></group>
);
export const Contact: React.FC<{ p: [number, number, number]; s: [number, number]; o?: number }> = ({ p, s, o = 0.6 }) => <mesh position={[p[0], p[1] + 0.004, p[2]]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={s} /><meshBasicMaterial map={radial()} transparent opacity={o} depthWrite={false} /></mesh>;

/** the table ("the board") with a lower head-rest, straps animated by k (0..1 each) */
export const TABLE_Y = 0.86, HEAD: [number, number, number] = [-0.68, 0.94, 0], FOREHEAD: [number, number, number] = [-0.76, 1.13, 0];
export const Table: React.FC<{ straps: number[] }> = ({ straps }) => {
  const wood = TX.wood(1, 3, "#6b4a30");
  const S: [number, number, number, number][] = [[-0.22, 1.035, 0.6, 0.1], [0.42, 1.0, 0.5, 0.08], [0.8, 0.995, 0.46, 0.08]];
  return (
    <group>
      <Box p={[0.3, TABLE_Y - 0.05, 0]} s={[1.5, 0.1, 0.78]} map={wood} rough={0.75} />
      <Box p={[-0.68, TABLE_Y - 0.17, 0]} s={[0.55, 0.1, 0.62]} map={wood} rough={0.75} />
      {[[-0.85, -0.3], [-0.85, 0.3], [0.95, -0.3], [0.95, 0.3]].map(([x, z], i) => <Box key={i} p={[x, (TABLE_Y - 0.1) / 2, z]} s={[0.1, TABLE_Y - 0.1, 0.1]} map={wood} />)}
      <Box p={[0.05, 0.25, 0]} s={[1.8, 0.06, 0.06]} c="#4a3220" />
      {S.map(([x, y, w, t], i) => { const k = straps[i] ?? 0; if (k <= 0) return null; const sc = 1 + (1 - k) * 0.4;
        return <group key={i} position={[x, y, 0]} scale={[1, 1, sc]}>
          <mesh rotation={[0, 0, 0]}><boxGeometry args={[t, 0.03, w]} /><meshStandardMaterial color="#3b2416" roughness={0.6} /></mesh>
          {[-1, 1].map((sd) => <mesh key={sd} position={[0, -0.12, sd * w / 2]}><boxGeometry args={[t, 0.26, 0.03]} /><meshStandardMaterial color="#3b2416" roughness={0.6} /></mesh>)}
          <mesh position={[0, 0.02, w / 2 - 0.08]}><boxGeometry args={[t * 0.9, 0.012, 0.05]} /><meshStandardMaterial color="#b8a060" metalness={0.8} roughness={0.3} /></mesh>
        </group>; })}
      {/* head clamp blocks */}
      {[-1, 1].map((sd) => <Box key={sd} p={[-0.68, TABLE_Y - 0.02, sd * 0.25]} s={[0.26, 0.2, 0.08]} map={wood} />)}
      <Contact p={[0.1, 0, 0]} s={[2.5, 1.3]} o={0.7} />
    </group>
  );
};
/** water rig: two posts, cross beam, copper bucket, pipe, side valve, spout above the forehead */
export const SPOUT: [number, number, number] = [FOREHEAD[0], 1.62, 0];
export const VALVE: [number, number, number] = [FOREHEAD[0], 1.86, 0.17];
export const DripRig: React.FC<{ valve: number; level?: number }> = ({ valve, level = 1 }) => {
  const wood = TX.wood(1, 2, "#5a3c26");
  return (
    <group>
      {[-0.55, 0.55].map((z) => <Box key={z} p={[-1.05, 1.15, z]} s={[0.09, 2.3, 0.09]} map={wood} />)}
      <Box p={[-1.05, 2.25, 0]} s={[0.1, 0.1, 1.25]} map={wood} />
      <Box p={[-0.9, 2.25, 0]} s={[0.4, 0.06, 0.06]} map={wood} />
      <group position={[-0.74, 2.42, 0]}>
        <mesh><cylinderGeometry args={[0.2, 0.15, 0.3, 24, 1, true]} /><meshStandardMaterial color="#b0683a" metalness={0.85} roughness={0.32} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.2, 0.014, 8, 24]} /><meshStandardMaterial color="#8a4e2a" metalness={0.85} roughness={0.3} /></mesh>
        <mesh position={[0, -0.15, 0]}><cylinderGeometry args={[0.15, 0.15, 0.02, 24]} /><meshStandardMaterial color="#8a4e2a" metalness={0.85} roughness={0.3} /></mesh>
        <mesh position={[0, -0.15 + 0.28 * level, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.15 + 0.05 * level, 24]} /><meshStandardMaterial color="#5c7f94" roughness={0.1} metalness={0.3} transparent opacity={0.85} /></mesh>
        <mesh position={[0, 0.16, 0]}><torusGeometry args={[0.22, 0.008, 6, 24, Math.PI]} /><meshStandardMaterial color="#3a3a3e" metalness={0.8} /></mesh>
      </group>
      <Cyl p={[SPOUT[0], (2.27 + SPOUT[1]) / 2, 0]} r1={0.018} h={2.27 - SPOUT[1]} c="#9a6a3a" />
      <Cyl p={[SPOUT[0], VALVE[1], VALVE[2] / 2]} r1={0.014} h={VALVE[2]} rot={[Math.PI / 2, 0, 0]} c="#9a6a3a" />
      <group position={VALVE} rotation={[0, 0, valve * Math.PI * 2]}>
        <mesh><torusGeometry args={[0.06, 0.009, 6, 20]} /><meshStandardMaterial color="#8a2a20" metalness={0.5} roughness={0.4} /></mesh>
        {[0, 1].map((i) => <mesh key={i} rotation={[0, 0, i * Math.PI / 2]}><boxGeometry args={[0.12, 0.009, 0.009]} /><meshStandardMaterial color="#8a2a20" /></mesh>)}
      </group>
      <Cyl p={[SPOUT[0], SPOUT[1] + 0.02, 0]} r1={0.013} r2={0.006} h={0.06} c="#9a6a3a" />
    </group>
  );
};
/** water drops: falls[] are the frames each drop leaves the spout; splash on impact */
export const Drops: React.FC<{ f: number; falls: number[]; slow?: number }> = ({ f, falls, slow = 1 }) => {
  const H = SPOUT[1] - FOREHEAD[1], T = 9 * slow;
  return (
    <group>
      {falls.map((t0, i) => {
        const q = (f - t0) / T;
        if (q < -0.6 || q > 2.2) return null;
        if (q < 0) { const g = 1 + q / 0.6; return <mesh key={i} position={[SPOUT[0], SPOUT[1] - 0.012 - g * 0.012, 0]} scale={[0.6 + g * 0.4, 0.6 + g * 0.7, 0.6 + g * 0.4]}><sphereGeometry args={[0.016, 12, 10]} /><meshPhysicalMaterial color="#cfe6f2" roughness={0.05} transmission={0.6} thickness={0.02} transparent opacity={0.9} /></mesh>; }
        if (q <= 1) { const y = SPOUT[1] - H * q * q; return <mesh key={i} position={[SPOUT[0], y, 0]} scale={[0.85, 1.35, 0.85]}><sphereGeometry args={[0.016, 12, 10]} /><meshPhysicalMaterial color="#d8eef8" roughness={0.05} transmission={0.6} thickness={0.02} transparent opacity={0.92} emissive="#335566" emissiveIntensity={0.3} /></mesh>; }
        const s = (q - 1) / 1.2;
        return <group key={i} position={FOREHEAD}>
          {Array.from({ length: 7 }).map((_, j) => { const a = (j / 7) * Math.PI * 2 + i; const r = 0.02 + s * 0.12; return <mesh key={j} position={[Math.cos(a) * r, 0.01 + Math.sin(Math.PI * Math.min(1, s * 1.3)) * 0.06, Math.sin(a) * r]}><sphereGeometry args={[0.006 * (1 - s) + 0.002, 6, 5]} /><meshBasicMaterial color="#d8eef8" transparent opacity={1 - s} /></mesh>; })}
          <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.01 + s * 0.08, 0.016 + s * 0.09, 24]} /><meshBasicMaterial color="#d8eef8" transparent opacity={(1 - s) * 0.7} side={THREE.DoubleSide} /></mesh>
        </group>;
      })}
    </group>
  );
};
/** the dungeon cell */
export const Dungeon: React.FC<{ f: number; torch?: number; day?: number; candle?: number }> = ({ f, torch = 1, day = 0, candle = 1 }) => {
  const W = 6.4, D = 6.4, Hh = 3.4;
  const wall = stoneTex("w", [120, 110, 98], 3, 2), floor = stoneTex("f", [92, 86, 78], 4, 4);
  return (
    <group>
      <ambientLight intensity={0.12 + day * 0.35} color={day > 0.5 ? "#c8d4e0" : "#5a6a90"} />
      <hemisphereLight args={["#3a4a6a", "#1a120a", 0.25 + day * 0.4]} />
      <Box p={[0, -0.05, 0]} s={[W, 0.1, D]} map={floor} rough={0.95} />
      <Box p={[0, Hh / 2, -D / 2]} s={[W, Hh, 0.2]} map={wall} rough={0.95} />
      <Box p={[-W / 2, Hh / 2, 0]} s={[0.2, Hh, D]} map={wall} rough={0.95} />
      <Box p={[W / 2, Hh / 2, 0]} s={[0.2, Hh, D]} map={wall} rough={0.95} />
      <Box p={[0, Hh, 0]} s={[W, 0.2, D]} c="#2a2622" />
      {/* arched wooden door in the back wall */}
      <group position={[1.9, 0, -D / 2 + 0.12]}>
        <Box p={[0, 1.05, 0]} s={[1.0, 2.1, 0.08]} map={TX.wood(3, 1, "#4a3220")} />
        <mesh position={[0, 2.1, 0]}><cylinderGeometry args={[0.5, 0.5, 0.08, 24, 1, false, 0, Math.PI]} /><meshStandardMaterial color="#4a3220" /></mesh>
        {[0.5, 1.5].map((y) => <Box key={y} p={[0, y, 0.05]} s={[1.0, 0.07, 0.02]} c="#2a2a2e" metal={0.7} rough={0.4} />)}
        <Box p={[0.3, 1.0, 0.07]} s={[0.05, 0.12, 0.03]} c="#2a2a2e" metal={0.7} />
        <Box p={[0, 1.5, 0.05]} s={[0.3, 0.25, 0.02]} c="#120c08" />
      </group>
      {/* barred window, high on the left wall, with its light shaft */}
      <group position={[-W / 2 + 0.11, 2.55, -0.9]} rotation={[0, Math.PI / 2, 0]}>
        <Box p={[0, 0, 0]} s={[0.7, 0.45, 0.04]} c={day > 0.5 ? "#e8eef4" : "#1a2a48"} e={day > 0.5 ? "#c8d8e8" : "#203a6a"} ei={0.6 + day * 1.4} />
        {[-0.22, -0.07, 0.07, 0.22].map((x) => <Box key={x} p={[x, 0, 0.04]} s={[0.025, 0.47, 0.03]} c="#222" metal={0.7} />)}
      </group>
      <spotLight position={[-W / 2 + 0.3, 2.6, -0.9]} target-position={[0.2, 0, -0.4]} angle={0.45} penumbra={0.7} intensity={2 + day * 9} distance={8} color={day > 0.5 ? "#fff1d8" : "#7a96d0"} castShadow />
      <Torch p={[-2.6, 1.9, -D / 2 + 0.11]} f={f} on={torch} seed="a" />
      <Torch p={[W / 2 - 0.11, 1.9, -0.4]} ry={-Math.PI / 2} f={f} on={torch} seed="bb" />
      {/* chains and shackles on the back wall */}
      <Chain p={[-0.6, 2.6, -D / 2 + 0.14]} f={f} /><Chain p={[-0.15, 2.6, -D / 2 + 0.14]} f={f} n={11} />
      <Chain p={[2.95, 2.4, 1.2]} f={f} n={12} />
      {/* bucket, straw, stool with candle, puddles */}
      <group position={[2.2, 0, 1.3]}><Cyl p={[0, 0.2, 0]} r1={0.2} r2={0.17} h={0.4} c="#5a3c26" /><mesh position={[0, 0.39, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.18, 20]} /><meshStandardMaterial color="#2a3a44" roughness={0.1} /></mesh><Contact p={[0, 0, 0]} s={[0.7, 0.7]} /></group>
      {Array.from({ length: 40 }).map((_, i) => <Box key={i} p={[-2.3 + random("st" + i) * 0.9, 0.012, 1.4 + random("sz" + i) * 1.2]} s={[0.25, 0.012, 0.012]} r={[0, random("sr" + i) * 3, 0]} c="#b49a5a" />)}
      <group position={[-1.6, 0, -1.6]}>
        <Cyl p={[0, 0.25, 0]} r1={0.18} h={0.06} c="#4a3220" />{[0, 1, 2].map((i) => <Cyl key={i} p={[Math.cos(i * 2.1) * 0.12, 0.11, Math.sin(i * 2.1) * 0.12]} r1={0.02} h={0.22} c="#3a2618" />)}
        <Cyl p={[0, 0.28 + 0.12 * candle, 0]} r1={0.035} h={0.24 * candle} c="#e8dcc0" />
        {candle > 0.03 && <><sprite position={[0, 0.42 * (0.25 + 0.75 * candle) + 0.1 * (1 - candle) + 0.03, 0]} scale={[0.05, 0.1, 1]}><spriteMaterial map={flameTex()} transparent depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
          <pointLight position={[0, 0.5, 0]} intensity={0.9 * torch} distance={2.2} color="#ffb060" /></>}
      </group>
      <mesh position={[-0.74, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.35, 28]} /><meshStandardMaterial color="#2a3036" roughness={0.05} metalness={0.4} /></mesh>
      <Contact p={[0, 0, 0]} s={[W, D]} o={0.25} />
    </group>
  );
};
