import React from "react";
import * as THREE from "three";
import { random } from "remotion";
import { Box, Cyl, Sph, TX } from "../Miya3/Kit3";
import { textTex, usePhotoTex } from "../Miya3/Sets3";

const TRIM = "#f1ece1";
const tex = textTex;
const Plane: React.FC<{ p: [number, number, number]; s: [number, number]; map?: THREE.Texture | null; c?: string; r?: [number, number, number]; e?: number }> = ({ p, s, map, c = "#fff", r = [0, 0, 0], e = 0 }) => (
  <mesh position={p} rotation={r} receiveShadow castShadow>
    <planeGeometry args={s} />
    <meshStandardMaterial map={map ?? undefined} color={map ? "#fff" : c} emissive={e ? "#fff" : "#000"} emissiveMap={e && map ? map : undefined} emissiveIntensity={e} roughness={0.85} side={THREE.DoubleSide} />
  </mesh>
);
const RBox: React.FC<{ p: [number, number, number]; s: [number, number, number]; c: string; r?: [number, number, number]; rough?: number }> = ({ p, s, c, r = [0, 0, 0], rough = 0.85 }) => {
  // soft cushion-like box: core + slightly inset bevel shells
  return (
    <group position={p} rotation={r}>
      <Box p={[0, 0, 0]} s={[s[0] - 0.04, s[1], s[2] - 0.04]} c={c} rough={rough} />
      <Box p={[0, 0, 0]} s={[s[0], s[1] - 0.04, s[2] - 0.04]} c={c} rough={rough} />
      <Box p={[0, 0, 0]} s={[s[0] - 0.04, s[1] - 0.04, s[2]]} c={c} rough={rough} />
    </group>
  );
};

/** warm pendant like the kitchen reference */
export const Pendant7: React.FC<{ p: [number, number, number]; k?: number; shadow?: boolean }> = ({ p, k = 1, shadow = true }) => (
  <group position={p}>
    <Cyl p={[0, 0.45, 0]} r1={0.012} h={0.9} c="#111" />
    <mesh position={[0, 0, 0]} castShadow={false}><coneGeometry args={[0.34, 0.26, 32, 1, true]} /><meshStandardMaterial color="#121214" side={THREE.DoubleSide} roughness={0.5} /></mesh>
    <Sph p={[0, -0.1, 0]} r={0.07} c="#fff" e="#fff1cc" ei={4 * k} />
    <pointLight position={[0, -0.18, 0]} intensity={7 * k} distance={9} decay={1.6} color="#ffd9a0" castShadow={shadow} shadow-mapSize={[2048, 2048]} shadow-bias={-0.0005} shadow-radius={6} />
  </group>
);
const Walls: React.FC<{ w: number; d: number; h: number; wall: string; wall2?: string; floor?: THREE.Texture; wains?: boolean; pattern?: "stripe" | "stars" | "plain" | "tile" }> = ({ w, d, h, wall, wall2, floor, wains = true, pattern = "stripe" }) => {
  const wp = pattern === "stars" ? tex(`wps${wall}`, 256, 256, (c) => { c.fillStyle = wall; c.fillRect(0, 0, 256, 256); c.fillStyle = "rgba(255,255,255,0.22)"; for (let i = 0; i < 14; i++) { const x = random("sx" + i) * 256, y = random("sy" + i) * 256; c.beginPath(); for (let k = 0; k < 10; k++) { const a = (k * Math.PI) / 5, r = k % 2 ? 4 : 9; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.fill(); } })
    : pattern === "tile" ? TX.tiles("#eef1ee", "#c9cfcb", 14, 8) : pattern === "plain" ? TX.plaster(wall, 4, 3) : TX.wallpaper(wall, wall2 ?? wall, 7, 3);
  if (wp instanceof THREE.CanvasTexture && pattern === "stars") { wp.wrapS = wp.wrapT = THREE.RepeatWrapping; wp.repeat.set(4, 2); }
  return (
    <group>
      <Box p={[0, -0.05, 0]} s={[w, 0.1, d]} map={floor ?? TX.wood(4, 4, "#8a6446")} rough={0.55} />
      <Box p={[0, h + 0.05, 0]} s={[w, 0.1, d]} c="#e9e2d2" />
      <Box p={[0, h / 2, -d / 2]} s={[w, h, 0.1]} map={wp} />
      <Box p={[-w / 2, h / 2, 0]} s={[0.1, h, d]} map={wp} />
      <Box p={[w / 2, h / 2, 0]} s={[0.1, h, d]} map={wp} />
      {/* trims */}
      <Box p={[0, 0.07, -d / 2 + 0.07]} s={[w, 0.14, 0.04]} c={TRIM} /><Box p={[-w / 2 + 0.07, 0.07, 0]} s={[0.04, 0.14, d]} c={TRIM} /><Box p={[w / 2 - 0.07, 0.07, 0]} s={[0.04, 0.14, d]} c={TRIM} />
      <Box p={[0, h - 0.06, -d / 2 + 0.07]} s={[w, 0.12, 0.06]} c={TRIM} /><Box p={[-w / 2 + 0.07, h - 0.06, 0]} s={[0.06, 0.12, d]} c={TRIM} /><Box p={[w / 2 - 0.07, h - 0.06, 0]} s={[0.06, 0.12, d]} c={TRIM} />
      {wains && <>
        <Box p={[0, 0.48, -d / 2 + 0.06]} s={[w, 0.96, 0.02]} c="#efe9dc" />
        <Box p={[0, 0.97, -d / 2 + 0.08]} s={[w, 0.04, 0.04]} c={TRIM} />
        {Array.from({ length: Math.floor(w / 0.6) }).map((_, i) => <Box key={i} p={[-w / 2 + 0.35 + i * 0.6, 0.52, -d / 2 + 0.075]} s={[0.46, 0.66, 0.01]} c="#e6dfd0" />)}
        <Box p={[-w / 2 + 0.06, 0.48, 0]} s={[0.02, 0.96, d]} c="#efe9dc" /><Box p={[w / 2 - 0.06, 0.48, 0]} s={[0.02, 0.96, d]} c="#efe9dc" />
      </>}
    </group>
  );
};
const nightTex = () => tex("nv7", 256, 256, (c) => {
  const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, "#071140"); g.addColorStop(1, "#14287a"); c.fillStyle = g; c.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 9; i++) { const h = 70 + random("nh7" + i) * 120; c.fillStyle = "#0d1a4a"; c.fillRect(i * 30, 256 - h, 27, h); for (let r = 0; r < 9; r++) for (let q = 0; q < 2; q++) if (random(`n7${i}${r}${q}`) > 0.5) { c.fillStyle = "#ffe08a"; c.fillRect(i * 30 + 5 + q * 10, 256 - h + 8 + r * 14, 6, 7); } }
  c.fillStyle = "#f3efe0"; c.beginPath(); c.arc(200, 48, 17, 0, 7); c.fill();
});
const Window7: React.FC<{ p: [number, number, number]; w?: number; h?: number; curtain?: string; ry?: number; blinds?: boolean; open?: boolean; frosted?: boolean }> = ({ p, w = 1.3, h = 1.25, curtain, ry = 0, blinds, open, frosted }) => (
  <group position={p} rotation={[0, ry, 0]}>
    <Plane p={[0, 0, 0.06]} s={[w, h]} map={nightTex()} e={1} />
    {frosted && <Plane p={[open ? -w / 4 : 0, 0, 0.075]} s={[open ? w / 2 : w, h]} c="#c9d7de" />}
    <Box p={[0, h / 2 + 0.05, 0.09]} s={[w + 0.16, 0.1, 0.1]} c={TRIM} /><Box p={[0, -h / 2 - 0.05, 0.12]} s={[w + 0.34, 0.07, 0.22]} c={TRIM} />
    <Box p={[-w / 2 - 0.05, 0, 0.09]} s={[0.1, h + 0.2, 0.1]} c={TRIM} /><Box p={[w / 2 + 0.05, 0, 0.09]} s={[0.1, h + 0.2, 0.1]} c={TRIM} />
    {!open && <><Box p={[0, 0, 0.1]} s={[0.05, h, 0.05]} c={TRIM} /><Box p={[0, 0, 0.1]} s={[w, 0.05, 0.05]} c={TRIM} /></>}
    {blinds && Array.from({ length: 14 }).map((_, i) => <Box key={i} p={[0, h / 2 - 0.05 - i * 0.075, 0.13]} s={[w, 0.04, 0.02]} c="#efe9dc" r={[0.6, 0, 0]} cast={false} />)}
    {curtain && <>
      {Array.from({ length: 5 }).map((_, i) => <Box key={"l" + i} p={[-w / 2 - 0.22 + i * 0.07, -0.05, 0.2 + (i % 2) * 0.03]} s={[0.08, h + 0.45, 0.03]} c={curtain} />)}
      {Array.from({ length: 5 }).map((_, i) => <Box key={"r" + i} p={[w / 2 - 0.06 + i * 0.07, -0.05, 0.2 + (i % 2) * 0.03]} s={[0.08, h + 0.45, 0.03]} c={curtain} />)}
      <Cyl p={[0, h / 2 + 0.28, 0.22]} r1={0.02} h={w + 1.0} c="#5a3b26" rot={[0, 0, Math.PI / 2]} />
    </>}
    <spotLight position={[0, 0.3, -0.8]} angle={0.75} penumbra={0.9} intensity={9} distance={7} color="#7f9ae8" target-position={[0, -1.4, 2.8]} />
  </group>
);
const Frame7: React.FC<{ p: [number, number, number]; s: [number, number]; map?: THREE.Texture | null; c?: string; ry?: number; rz?: number }> = ({ p, s, map, c = "#bbb", ry = 0, rz = 0 }) => (
  <group position={p} rotation={[0, ry, rz]}>
    <Box p={[0, 0, 0]} s={[s[0] + 0.08, s[1] + 0.08, 0.035]} c="#2f241c" />
    <Box p={[0, 0, 0.012]} s={[s[0] + 0.01, s[1] + 0.01, 0.02]} c="#efe9dc" />
    <Plane p={[0, 0, 0.024]} s={[s[0] - 0.06, s[1] - 0.06]} map={map} c={c} />
  </group>
);
const Books: React.FC<{ p: [number, number, number]; n: number; w?: number; seed: string; r?: [number, number, number] }> = ({ p, n, w = 0.05, seed, r = [0, 0, 0] }) => (
  <group position={p} rotation={r}>{Array.from({ length: n }).map((_, i) => { const h = 0.18 + random(seed + i) * 0.1; return <Box key={i} p={[i * (w + 0.006), h / 2, 0]} s={[w, h, 0.17 + random(seed + "d" + i) * 0.05]} c={["#a8433a", "#2f5e9e", "#d9a640", "#3f7a52", "#e8e0cc", "#6b4a8a", "#c2683a"][Math.floor(random(seed + "c" + i) * 7)]} rough={0.7} />; })}</group>
);
const Ball: React.FC<{ p: [number, number, number]; r: number; c: string }> = ({ p, r, c }) => <Sph p={p} r={r} c={c} />;

// ---------------- Rei's room ----------------
const posterTex = () => tex("p7r", 128, 180, (c) => { c.fillStyle = "#0e1f45"; c.fillRect(0, 0, 128, 180); for (let i = 0; i < 30; i++) { c.fillStyle = "#fff"; c.fillRect(random("pp" + i) * 128, random("pq" + i) * 180, 2, 2); } c.fillStyle = "#e9e9e9"; c.beginPath(); c.moveTo(64, 25); c.lineTo(86, 95); c.lineTo(64, 132); c.lineTo(42, 95); c.fill(); c.fillStyle = "#d8352a"; c.beginPath(); c.arc(64, 72, 9, 0, 7); c.fill(); c.fillStyle = "#ff9a1e"; c.beginPath(); c.moveTo(54, 132); c.lineTo(74, 132); c.lineTo(64, 168); c.fill(); });
const trainTex = () => tex("p7t", 180, 120, (c) => { c.fillStyle = "#f4e6c4"; c.fillRect(0, 0, 180, 120); c.fillStyle = "#2f6fd0"; c.fillRect(20, 50, 140, 40); c.fillStyle = "#fff"; c.fillRect(30, 58, 22, 16); c.fillRect(62, 58, 22, 16); c.fillRect(94, 58, 22, 16); c.fillStyle = "#222"; [40, 80, 120, 150].forEach((x) => { c.beginPath(); c.arc(x, 92, 8, 0, 7); c.fill(); }); c.fillStyle = "#d8352a"; c.font = "bold 18px sans-serif"; c.fillText("SHINKANSEN", 26, 30); });
const rugTex = () => tex("rug7", 256, 256, (c) => { c.fillStyle = "#3e6fb0"; c.beginPath(); c.arc(128, 128, 126, 0, 7); c.fill(); c.strokeStyle = "#f2c94c"; c.lineWidth = 10; c.beginPath(); c.arc(128, 128, 100, 0, 7); c.stroke(); c.fillStyle = "#e8eef8"; for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; c.beginPath(); c.arc(128 + Math.cos(a) * 60, 128 + Math.sin(a) * 60, 12, 0, 7); c.fill(); } });
export const ReiRoom7: React.FC = () => (
  <group>
    <Walls w={5.2} d={5.2} h={2.6} wall="#9fb3c8" pattern="stars" />
    <Window7 p={[0.9, 1.55, -2.55]} curtain="#3a6bb5" />
    <Frame7 p={[-1.35, 1.75, -2.53]} s={[0.5, 0.7]} map={posterTex()} />
    <Frame7 p={[-0.55, 1.95, -2.53]} s={[0.55, 0.37]} map={trainTex()} rz={0.03} />
    {/* bed: frame, mattress, pillow, duvet half on the floor */}
    <group position={[-1.55, 0, -0.9]}>
      <Box p={[0, 0.2, 0]} s={[1.05, 0.14, 2.05]} c="#8a5a35" />
      {[[-0.48, -0.98], [0.48, -0.98], [-0.48, 0.98], [0.48, 0.98]].map(([x, z], i) => <Box key={i} p={[x, 0.1, z]} s={[0.07, 0.2, 0.07]} c="#6b4428" />)}
      <Box p={[0, 0.55, -1.02]} s={[1.08, 0.85, 0.07]} c="#8a5a35" /><Box p={[0, 0.98, -1.02]} s={[1.12, 0.05, 0.1]} c="#9c6a42" />
      <Box p={[0, 0.38, 1.02]} s={[1.08, 0.4, 0.06]} c="#8a5a35" />
      <RBox p={[0, 0.36, 0]} s={[0.98, 0.2, 1.95]} c="#f4f4f2" />
      <RBox p={[-0.05, 0.53, -0.72]} s={[0.62, 0.13, 0.36]} c="#ffffff" r={[0.12, 0.2, 0.06]} />
      <RBox p={[0.12, 0.49, 0.25]} s={[0.92, 0.08, 1.0]} c="#4a78c2" r={[0, 0.12, 0.03]} />
      <RBox p={[0.62, 0.25, 0.55]} s={[0.08, 0.5, 0.95]} c="#4a78c2" r={[0, 0.1, 0.18]} />
      <RBox p={[0.95, 0.03, 0.8]} s={[0.75, 0.06, 0.9]} c="#4a78c2" r={[0, 0.35, 0]} />
      {/* plush bear on the bed */}
      <group position={[0.25, 0.55, -0.55]}><Sph p={[0, 0.1, 0]} r={0.11} c="#a8713f" /><Sph p={[0, 0.27, 0]} r={0.085} c="#a8713f" /><Sph p={[-0.07, 0.34, 0]} r={0.03} c="#a8713f" /><Sph p={[0.07, 0.34, 0]} r={0.03} c="#a8713f" /><Sph p={[0, 0.25, 0.07]} r={0.035} c="#e2c29a" /></group>
    </group>
    {/* nightstand + lamp + alarm clock */}
    <Box p={[-0.65, 0.27, -2.2]} s={[0.45, 0.54, 0.4]} c="#9c6a42" /><Box p={[-0.65, 0.4, -1.99]} s={[0.36, 0.14, 0.02]} c="#8a5a35" /><Box p={[-0.65, 0.4, -1.97]} s={[0.08, 0.02, 0.02]} c="#d9c38a" />
    <Cyl p={[-0.75, 0.63, -2.25]} r1={0.05} h={0.18} c="#e9e2d0" /><mesh position={[-0.75, 0.82, -2.25]}><coneGeometry args={[0.13, 0.17, 24, 1, true]} /><meshStandardMaterial color="#f6eccf" emissive="#ffd38a" emissiveIntensity={0.7} side={THREE.DoubleSide} /></mesh>
    <pointLight position={[-0.75, 0.82, -2.15]} intensity={1.6} distance={2.5} color="#ffcf88" />
    <Cyl p={[-0.52, 0.6, -2.12]} r1={0.06} h={0.05} c="#d8352a" rot={[Math.PI / 2, 0, 0]} />
    {/* desk + chair + randoseru + globe + lamp + books */}
    <group position={[1.75, 0, -2.15]}>
      <Box p={[0, 0.72, 0]} s={[1.25, 0.05, 0.62]} c="#a8774c" />
      <Box p={[-0.55, 0.36, 0]} s={[0.05, 0.72, 0.58]} c="#8a5a35" /><Box p={[0.35, 0.36, 0]} s={[0.45, 0.72, 0.58]} c="#9c6a42" />
      {[0.15, 0.4, 0.6].map((y) => <Box key={y} p={[0.35, y, 0.3]} s={[0.4, 0.02, 0.02]} c="#d9c38a" />)}
      <Books p={[-0.5, 0.745, -0.18]} n={7} seed="rb" />
      <Sph p={[0.38, 1.0, -0.1]} r={0.12} c="#3f7fd0" /><Cyl p={[0.38, 0.8, -0.1]} r1={0.05} h={0.05} c="#5a3b26" /><Cyl p={[0.38, 0.86, -0.1]} r1={0.008} h={0.15} c="#c9a24a" />
      <Box p={[-0.1, 0.75, 0.05]} s={[0.35, 0.01, 0.25]} c="#f8f6ef" r={[0, 0.2, 0]} />
      <Cyl p={[0.05, 0.8, 0.18]} r1={0.035} h={0.1} c="#d8352a" />{[0, 1, 2].map((i) => <Cyl key={i} p={[0.04 + i * 0.012, 0.88, 0.18]} r1={0.005} h={0.12} c={["#2f5e9e", "#f2c94c", "#3f7a52"][i]} />)}
      {/* randoseru on the chair */}
      <Box p={[0, 0.45, 0.55]} s={[0.42, 0.04, 0.42]} c="#5a3b26" /><Box p={[0, 0.7, 0.75]} s={[0.42, 0.5, 0.04]} c="#5a3b26" />
      {[[-0.18, 0.38], [0.18, 0.38], [-0.18, 0.72], [0.18, 0.72]].map(([x, z], i) => <Box key={i} p={[x, 0.22, z]} s={[0.03, 0.45, 0.03]} c="#4a3020" />)}
      <RBox p={[0.02, 0.66, 0.62]} s={[0.3, 0.36, 0.2]} c="#1c1c20" rough={0.35} /><RBox p={[0.02, 0.76, 0.52]} s={[0.3, 0.2, 0.04]} c="#26262b" rough={0.35} /><Box p={[0.02, 0.62, 0.5]} s={[0.05, 0.05, 0.01]} c="#d9c38a" />
    </group>
    {/* bookshelf with toys */}
    <group position={[2.35, 0, -0.6]} rotation={[0, -Math.PI / 2, 0]}>
      <Box p={[0, 0.7, 0]} s={[0.9, 1.4, 0.32]} c="#9c6a42" />
      {[0.32, 0.72, 1.12].map((y, i) => <group key={y}><Box p={[0, y - 0.1, 0.02]} s={[0.84, 0.36, 0.3]} c="#6b4428" /><Books p={[-0.38, y - 0.27, 0.04]} n={i === 1 ? 5 : 8} seed={"sh" + i} /></group>)}
      <group position={[0.22, 0.47, 0.04]}><Box p={[0, 0.1, 0]} s={[0.12, 0.16, 0.1]} c="#c9ccd4" /><Box p={[0, 0.24, 0]} s={[0.09, 0.1, 0.09]} c="#c9ccd4" /><Sph p={[0, 0.3, 0.05]} r={0.012} c="#ff3030" e="#ff3030" ei={2} /></group>
      <group position={[0.2, 0.9, 0.04]}><Sph p={[0, 0.08, 0]} r={0.09} c="#3f9a4a" s={[1.5, 1, 1]} /><Sph p={[0.12, 0.15, 0]} r={0.05} c="#3f9a4a" /></group>
    </group>
    {/* rug, toys on the floor */}
    <mesh position={[0, 0.005, 0.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[1.0, 48]} /><meshStandardMaterial map={rugTex()} roughness={1} /></mesh>
    <Ball p={[0.7, 0.11, 0.9]} r={0.11} c="#f2f2f2" />
    <group position={[-0.2, 0.03, 0.95]} rotation={[0, -0.4, 0]}><Box p={[0, 0.05, 0]} s={[0.3, 0.08, 0.13]} c="#d8262b" rough={0.4} /><Box p={[-0.02, 0.11, 0]} s={[0.15, 0.06, 0.11]} c="#a71c20" rough={0.4} />{[-0.1, 0.1].map((x) => [0.07, -0.07].map((z) => <Cyl key={`${x}${z}`} p={[x, 0.03, z]} r1={0.035} h={0.025} c="#111" rot={[Math.PI / 2, 0, 0]} />))}</group>
    {[[0.2, 0.3, "#f2c94c"], [0.32, 0.38, "#3f7fd0"], [0.27, 0.22, "#d8352a"], [0.4, 0.27, "#3f9a4a"]].map(([x, z, c], i) => <Box key={i} p={[x as number, 0.04, z as number]} s={[0.08, 0.08, 0.08]} c={c as string} r={[0, i * 0.4, 0]} />)}
    {/* door ajar on the left wall, dark hallway */}
    <group position={[-2.55, 0, 1.2]}>
      <Box p={[0.02, 1.05, 0]} s={[0.04, 2.1, 0.95]} c="#05070c" />
      <Box p={[0.06, 2.15, 0]} s={[0.08, 0.1, 1.1]} c={TRIM} /><Box p={[0.06, 1.05, -0.52]} s={[0.08, 2.1, 0.08]} c={TRIM} /><Box p={[0.06, 1.05, 0.52]} s={[0.08, 2.1, 0.08]} c={TRIM} />
      <Box p={[0.45, 1.03, 0.28]} s={[0.04, 2.05, 0.9]} c="#b8895c" r={[0, -1.0, 0]} />
    </group>
    <Pendant7 p={[-0.7, 2.3, -0.9]} k={0.9} />
    <hemisphereLight args={["#56658f", "#1a140f", 0.45]} />
  </group>
);

// ---------------- Stairs (straight run, seen from the hallway) ----------------
const runnerTex = () => tex("run7", 64, 64, (c) => { c.fillStyle = "#7a2a2a"; c.fillRect(0, 0, 64, 64); c.fillStyle = "#c9a24a"; c.fillRect(0, 0, 6, 64); c.fillRect(58, 0, 6, 64); });
export const Stairs7: React.FC = () => {
  const photo = usePhotoTex("miya2/steps.jpg");
  const N = 13, rise = 0.2, run = 0.26, W = 1.0, x0 = 0.35;
  return (
    <group>
      <Walls w={4.2} d={6} h={2.6 + N * rise} wall="#b7ae9c" wall2="#ada492" wains={false} />
      {/* steps rising toward the back (-z), along the right wall */}
      {Array.from({ length: N }).map((_, i) => {
        const y = (i + 1) * rise, z = 1.8 - i * run;
        return (
          <group key={i}>
            <Box p={[x0, y - rise / 2, z]} s={[W, rise, run]} c="#efe9dc" />
            <Box p={[x0, y + 0.015, z - 0.012]} s={[W + 0.04, 0.03, run + 0.04]} c="#9a6a40" rough={0.45} />
            <Box p={[x0, y + 0.032, z - 0.01]} s={[0.55, 0.008, run + 0.03]} map={runnerTex()} />
            <Cyl p={[x0, y + 0.03, z + run / 2 - 0.01]} r1={0.008} h={0.62} c="#c9a24a" rot={[0, 0, Math.PI / 2]} />
          </group>
        );
      })}
      {/* solid underside + stringer */}
      <mesh position={[x0 - W / 2 - 0.03, 1.4, 0.25]} rotation={[Math.atan2(rise, run), 0, 0]}><boxGeometry args={[0.06, 0.32, 4.6]} /><meshStandardMaterial color="#efe9dc" /></mesh>
      {/* balusters + handrail + newel posts */}
      {Array.from({ length: N }).map((_, i) => { const y = (i + 1) * rise, z = 1.8 - i * run; return <group key={i}><Cyl p={[x0 - W / 2 + 0.05, y + 0.45, z]} r1={0.018} h={0.88} c="#f4f0e6" /><Cyl p={[x0 - W / 2 + 0.05, y + 0.45, z - run / 2]} r1={0.018} h={0.88} c="#f4f0e6" /></group>; })}
      <mesh position={[x0 - W / 2 + 0.05, 0.2 + (N * rise) / 2 + 0.92, 1.8 - ((N - 1) * run) / 2]} rotation={[Math.atan2(rise, run), 0, 0]}><boxGeometry args={[0.07, 0.06, Math.hypot(N * rise, N * run) + 0.2]} /><meshStandardMaterial color="#6b4428" roughness={0.45} /></mesh>
      <Box p={[x0 - W / 2 + 0.05, 0.6, 2.05]} s={[0.12, 1.2, 0.12]} c="#6b4428" /><Box p={[x0 - W / 2 + 0.05, 1.24, 2.05]} s={[0.16, 0.08, 0.16]} c="#5a3820" /><Sph p={[x0 - W / 2 + 0.05, 1.32, 2.05]} r={0.06} c="#5a3820" />
      {/* landing + glow from the upstairs room */}
      <Box p={[x0, N * rise - 0.05, 1.8 - N * run - 0.5]} s={[W + 0.6, 0.1, 1.0]} c="#9a6a40" />
      <Box p={[x0, N * rise + 1.05, -2.95]} s={[0.95, 2.1, 0.02]} c="#ffd99a" e="#ffcf80" ei={1.2} />
      <pointLight position={[x0, N * rise + 1.2, -2.4]} intensity={6} distance={6} color="#ffcf8a" castShadow shadow-mapSize={[1024, 1024]} />
      {/* family photos going up the wall */}
      {[0, 1, 2, 3].map((i) => <Frame7 key={i} p={[x0 + W / 2 + 0.37, 1.45 + i * 0.42, 1.5 - i * 0.85]} s={[0.42, 0.32]} map={i === 1 ? photo : null} c={["#8fa3b8", "#ccc", "#b8a58f", "#9fb08f"][i]} ry={-Math.PI / 2} rz={i % 2 ? 0.02 : -0.02} />)}
      {/* wall sconce */}
      <group position={[x0 + W / 2 + 0.38, 1.9, 2.3]}><Box p={[0, 0, 0]} s={[0.04, 0.16, 0.1]} c="#2a2a2a" /><mesh position={[-0.08, 0.06, 0]}><cylinderGeometry args={[0.07, 0.1, 0.14, 16, 1, true]} /><meshStandardMaterial color="#f6eccf" emissive="#ffcf88" emissiveIntensity={0.8} side={THREE.DoubleSide} /></mesh><pointLight position={[-0.15, 0.05, 0]} intensity={2.2} distance={4} color="#ffcf88" castShadow shadow-mapSize={[1024, 1024]} /></group>
      {/* hallway: shoes, mat, umbrella stand */}
      <Box p={[-0.6, 0.01, 2.4]} s={[0.8, 0.02, 0.5]} c="#5a5f6e" />
      {[[-0.85, 2.35, 0.2, "#222"], [-0.7, 2.35, 0.25, "#222"], [-0.45, 2.42, -0.1, "#c94e3a"], [-0.32, 2.42, -0.1, "#c94e3a"]].map(([x, z, r, c], i) => <Box key={i} p={[x as number, 0.05, z as number]} s={[0.1, 0.07, 0.24]} c={c as string} r={[0, r as number, 0]} />)}
      <Cyl p={[-1.7, 0.25, 2.0]} r1={0.12} h={0.5} c="#3a3d46" /><Cyl p={[-1.68, 0.6, 2.0]} r1={0.015} h={0.7} c="#1e3a6e" rot={[0, 0, 0.1]} />
      {/* evidence: broken blade tip on the 5th step + marker */}
      <Box p={[x0 - 0.1, 5 * rise + 0.045, 1.8 - 4 * run]} s={[0.13, 0.008, 0.028]} c="#d6dde2" metal={0.9} rough={0.2} r={[0, 0.5, 0]} />
      <group position={[x0 + 0.25, 5 * rise + 0.03, 1.8 - 4 * run]}><mesh rotation={[0, 0.3, 0]}><boxGeometry args={[0.12, 0.13, 0.1]} /><meshStandardMaterial map={tex("mk7", 64, 64, (c) => { c.fillStyle = "#f2c94c"; c.fillRect(0, 0, 64, 64); c.fillStyle = "#111"; c.font = "bold 46px sans-serif"; c.textAlign = "center"; c.fillText("1", 32, 50); })} /></mesh></group>
      <pointLight position={[-1.0, 2.3, 1.0]} intensity={2.5} distance={6} color="#ffd9a0" />
      <hemisphereLight args={["#56658f", "#1a140f", 0.5]} />
    </group>
  );
};

// ---------------- Living room ----------------
export const Living7: React.FC = () => (
  <group>
    <Walls w={5.4} d={5.4} h={2.6} wall="#9a917f" wall2="#928974" />
    <Window7 p={[0.9, 1.5, -2.65]} w={1.5} h={1.35} curtain="#b4532c" />
    {/* shelf with kagami mochi, books, clock */}
    <Box p={[-1.4, 1.62, -2.55]} s={[1.5, 0.04, 0.26]} c="#6b4428" />
    <group position={[-1.9, 1.64, -2.55]}><Box p={[0, 0.02, 0]} s={[0.26, 0.04, 0.26]} c="#d8352a" /><Cyl p={[0, 0.09, 0]} r1={0.11} h={0.09} c="#fbf8f1" /><Cyl p={[0, 0.17, 0]} r1={0.085} h={0.08} c="#fbf8f1" /><Sph p={[0, 0.25, 0]} r={0.045} c="#f2a53a" /></group>
    <Books p={[-1.55, 1.64, -2.55]} n={6} seed="lv" />
    <group position={[-1.3, 2.15, -2.6]}><Cyl p={[0, 0, 0]} r1={0.22} h={0.05} c="#f4f1ea" rot={[Math.PI / 2, 0, 0]} /><Cyl p={[0, 0, -0.01]} r1={0.24} h={0.04} c="#5a3820" rot={[Math.PI / 2, 0, 0]} /><Box p={[0.04, 0.06, 0.03]} s={[0.02, 0.13, 0.01]} c="#111" r={[0, 0, -0.6]} /><Box p={[-0.05, 0.07, 0.035]} s={[0.012, 0.17, 0.01]} c="#111" r={[0, 0, 0.7]} /></group>
    {/* CRT TV on cabinet */}
    <Box p={[-1.6, 0.3, -2.3]} s={[1.3, 0.6, 0.5]} c="#6b4428" />{[-0.3, 0.3].map((x) => <Box key={x} p={[-1.6 + x, 0.3, -2.04]} s={[0.56, 0.48, 0.02]} c="#5a3820" />)}
    <RBox p={[-1.6, 0.9, -2.3]} s={[0.8, 0.6, 0.6]} c="#2c2c30" rough={0.5} />
    <Box p={[-1.65, 0.9, -1.995]} s={[0.58, 0.44, 0.01]} c="#0d1016" rough={0.08} metal={0.3} />
    {/* sofa with cushions and a throw */}
    <group position={[1.15, 0, -0.5]} rotation={[0, -0.3, 0]}>
      <RBox p={[0, 0.22, 0]} s={[2.0, 0.44, 0.9]} c="#6e2c26" />
      <RBox p={[0, 0.66, -0.36]} s={[2.0, 0.55, 0.2]} c="#5c241f" />
      <RBox p={[-1.0, 0.42, 0]} s={[0.2, 0.42, 0.9]} c="#5c241f" /><RBox p={[1.0, 0.42, 0]} s={[0.2, 0.42, 0.9]} c="#5c241f" />
      <RBox p={[-0.45, 0.5, 0.05]} s={[0.85, 0.14, 0.72]} c="#7a332c" /><RBox p={[0.45, 0.5, 0.05]} s={[0.85, 0.14, 0.72]} c="#7a332c" />
      <RBox p={[-0.65, 0.72, -0.18]} s={[0.4, 0.36, 0.12]} c="#e8c66a" r={[-0.2, 0.2, 0.1]} /><RBox p={[0.7, 0.72, -0.18]} s={[0.4, 0.36, 0.12]} c="#2f5e9e" r={[-0.2, -0.2, -0.1]} />
      <RBox p={[0.3, 0.55, 0.15]} s={[0.7, 0.05, 0.6]} c="#c9b98f" r={[0, 0.4, 0]} />
    </group>
    {/* kotatsu with futon skirt and mikan */}
    <group position={[-0.3, 0, 0.75]}>
      <RBox p={[0, 0.2, 0]} s={[1.3, 0.36, 1.1]} c="#b4532c" />
      {Array.from({ length: 10 }).map((_, i) => <Box key={i} p={[-0.6 + i * 0.13, 0.2, 0.56]} s={[0.02, 0.32, 0.01]} c="#9a4424" />)}
      <Box p={[0, 0.4, 0]} s={[1.05, 0.04, 0.85]} c="#8a5a35" rough={0.4} />
      <Cyl p={[0.1, 0.44, 0]} r1={0.16} r2={0.12} h={0.05} c="#e9e4d8" />
      {[[0.05, -0.04], [0.15, 0.04], [0.12, -0.08], [0.06, 0.07], [0.1, 0]].map(([x, z], i) => <Sph key={i} p={[x, 0.5 + (i === 4 ? 0.05 : 0), z]} r={0.05} c="#f39a2b" />)}
      <Cyl p={[-0.3, 0.46, 0.15]} r1={0.04} h={0.08} c="#e9e4d8" /><Cyl p={[-0.35, 0.46, -0.1]} r1={0.04} h={0.08} c="#e9e4d8" />
    </group>
    {/* floor lamp (off), plant, rug */}
    <Cyl p={[2.2, 0.75, 0.6]} r1={0.015} h={1.5} c="#222" /><mesh position={[2.2, 1.55, 0.6]}><cylinderGeometry args={[0.16, 0.22, 0.3, 24, 1, true]} /><meshStandardMaterial color="#e9dfc6" side={THREE.DoubleSide} /></mesh>
    <Cyl p={[2.25, 0.22, -2.2]} r1={0.18} r2={0.14} h={0.44} c="#b4532c" />{[0, 1, 2, 3, 4, 5].map((i) => <Sph key={i} p={[2.25 + Math.sin(i * 1.1) * 0.2, 0.62 + (i % 3) * 0.14, -2.2 + Math.cos(i * 1.1) * 0.2]} r={0.15} c={i % 2 ? "#3f7a3a" : "#4f8f48"} s={[1.4, 0.5, 0.8]} />)}
    <Box p={[0, 0.006, 0.5]} s={[3.0, 0.01, 2.0]} c="#7d6a55" />
    <Pendant7 p={[-0.6, 2.3, -0.8]} k={0.45} />
    <pointLight position={[2.2, 1.5, 0.6]} intensity={1.4} distance={3} color="#ffcf88" />
    <hemisphereLight args={["#56658f", "#1a140f", 0.5]} />
  </group>
);

// ---------------- Bathroom ----------------
const kitTex7 = () => tex("kit7", 64, 64, (c) => { c.fillStyle = "#fafafa"; c.fillRect(0, 0, 64, 64); c.fillStyle = "#d8262b"; c.fillRect(24, 10, 16, 44); c.fillRect(10, 24, 44, 16); });
export const Bath7: React.FC = () => (
  <group>
    <Walls w={4} d={4} h={2.5} wall="#dfe6e8" pattern="tile" floor={TX.tiles("#9fb1b8", "#7f9097", 8, 8)} wains={false} />
    <Window7 p={[-1.05, 1.75, -1.95]} w={0.8} h={0.75} curtain="#eef2f3" open frosted />
    {/* bathtub + shower curtain */}
    <group position={[-1.2, 0, -1.2]}>
      <RBox p={[0, 0.3, 0]} s={[1.5, 0.6, 0.75]} c="#f6f8f8" rough={0.25} />
      <Box p={[0, 0.58, 0]} s={[1.36, 0.04, 0.6]} c="#b9d3dc" rough={0.1} />
      <Cyl p={[0.2, 2.1, 0.4]} r1={0.012} h={1.6} c="#c5c9cf" rot={[0, 0, Math.PI / 2]} />
      <mesh position={[0.85, 1.35, 0.4]} geometry={(() => { const g = new THREE.PlaneGeometry(0.55, 1.5, 24, 1); const v = g.attributes.position; for (let i = 0; i < v.count; i++) v.setZ(i, Math.sin(v.getX(i) * 38) * 0.035); g.computeVertexNormals(); return g; })()} castShadow><meshStandardMaterial color="#e3ecef" side={THREE.DoubleSide} roughness={0.9} /></mesh>
    </group>
    {/* vanity, mirror cabinet, toiletries */}
    <group position={[0.75, 0, -1.72]}>
      <Box p={[0, 0.4, 0]} s={[0.9, 0.8, 0.5]} c="#efe9dc" /><Box p={[-0.22, 0.4, 0.26]} s={[0.4, 0.66, 0.02]} c="#f4efe4" /><Box p={[0.22, 0.4, 0.26]} s={[0.4, 0.66, 0.02]} c="#f4efe4" />
      <RBox p={[0, 0.84, 0]} s={[0.95, 0.08, 0.55]} c="#ffffff" rough={0.2} />
      <Box p={[0, 1.6, -0.2]} s={[0.8, 0.85, 0.12]} c="#e6e2d8" /><Box p={[0, 1.6, -0.13]} s={[0.72, 0.77, 0.01]} c="#9fb7c4" metal={0.95} rough={0.04} />
      <Box p={[0, 2.08, -0.15]} s={[0.8, 0.06, 0.12]} c="#f2f2f2" e="#fff6dc" ei={1.2} />
      <Cyl p={[0, 0.98, -0.18]} r1={0.02} h={0.22} c="#c5c9cf" />
      <Cyl p={[-0.32, 0.95, -0.12]} r1={0.04} h={0.13} c="#8fd0e0" />{[0, 1].map((i) => <Cyl key={i} p={[-0.33 + i * 0.02, 1.06, -0.12]} r1={0.006} h={0.14} c={i ? "#e84a5f" : "#3f7fd0"} />)}
      <Cyl p={[0.3, 0.97, -0.12]} r1={0.035} h={0.18} c="#f2c94c" />
      {/* first aid kit, open, bandages out */}
      <mesh position={[0.32, 0.98, 0.12]} rotation={[0, -0.3, 0]}><boxGeometry args={[0.3, 0.18, 0.22]} /><meshStandardMaterial map={kitTex7()} /></mesh>
      <Box p={[0.3, 1.12, 0.0]} s={[0.3, 0.02, 0.22]} c="#f0f0f0" r={[-1.1, -0.3, 0]} />
      <Box p={[0.05, 0.89, 0.15]} s={[0.12, 0.015, 0.05]} c="#fff" r={[0, 0.5, 0]} /><Cyl p={[-0.1, 0.9, 0.18]} r1={0.03} h={0.03} c="#fff" rot={[Math.PI / 2, 0, 0]} />
    </group>
    {/* towels + washing machine + mat */}
    <Cyl p={[1.95, 1.4, -0.6]} r1={0.012} h={0.8} c="#c5c9cf" rot={[Math.PI / 2, 0, 0]} />
    <Box p={[1.93, 1.15, -0.8]} s={[0.04, 0.5, 0.32]} c="#f2b22a" /><Box p={[1.93, 1.18, -0.42]} s={[0.04, 0.44, 0.3]} c="#e8eef0" />
    <Box p={[1.65, 0.45, 0.6]} s={[0.6, 0.9, 0.6]} c="#f4f4f2" rough={0.3} /><Cyl p={[1.34, 0.5, 0.6]} r1={0.2} h={0.03} c="#9fb7c4" rot={[0, 0, Math.PI / 2]} />
    <Box p={[0.4, 0.008, -0.9]} s={[0.7, 0.01, 0.45]} c="#5b8fb0" />
    <Pendant7 p={[0.2, 1.95, -0.4]} k={0.7} />
    <hemisphereLight args={["#6b7aa8", "#1a1a1a", 0.45]} />
  </group>
);

// ---------------- Office ----------------
const screen7 = () => tex("scr7", 256, 192, (c) => { c.fillStyle = "#0a246a"; c.fillRect(0, 0, 256, 192); c.fillStyle = "#1f4bb5"; c.fillRect(0, 0, 256, 24); c.fillStyle = "#fff"; c.font = "bold 13px sans-serif"; c.fillText("Dial-Up Connection", 8, 17); c.fillStyle = "#d4d0c8"; c.fillRect(30, 50, 196, 110); c.fillStyle = "#111"; c.font = "bold 18px monospace"; c.textAlign = "center"; c.fillText("CONNECTED", 128, 85); c.fillStyle = "#0a246a"; c.font = "bold 38px monospace"; c.fillText("01:18", 128, 135); });
export const Office7: React.FC = () => (
  <group>
    <Walls w={4.6} d={4.6} h={2.6} wall="#8e9a85" wall2="#86927d" />
    <Window7 p={[1.25, 1.6, -2.25]} w={1.2} h={1.2} blinds />
    {/* bookshelf with binders */}
    <group position={[-1.65, 0, -2.05]}><Box p={[0, 1.0, 0]} s={[1.0, 2.0, 0.36]} c="#6b4428" />{[0.25, 0.7, 1.15, 1.6].map((y, i) => <group key={y}><Box p={[0, y + 0.13, 0.02]} s={[0.92, 0.38, 0.32]} c="#4d3220" /><Books p={[-0.42, y - 0.05, 0.05]} n={i % 2 ? 9 : 6} w={i % 2 ? 0.045 : 0.075} seed={"of" + i} /></group>)}</group>
    {/* desk: CRT, tower, keyboard, mouse, papers, mug, phone, lamp */}
    <group position={[0, 0, -1.85]}>
      <Box p={[0, 0.74, 0]} s={[1.7, 0.05, 0.75]} c="#8a5a35" rough={0.45} />
      <Box p={[-0.78, 0.37, 0]} s={[0.05, 0.74, 0.7]} c="#6b4428" /><Box p={[0.55, 0.37, 0]} s={[0.55, 0.74, 0.7]} c="#7a4e30" />
      {[0.2, 0.45, 0.66].map((y) => <Box key={y} p={[0.55, y, 0.36]} s={[0.4, 0.02, 0.02]} c="#d9c38a" />)}
      <RBox p={[-0.05, 1.05, -0.12]} s={[0.56, 0.46, 0.48]} c="#ddd6c3" rough={0.5} />
      <mesh position={[-0.05, 1.07, 0.125]}><planeGeometry args={[0.44, 0.33]} /><meshStandardMaterial map={screen7()} emissive="#fff" emissiveMap={screen7()} emissiveIntensity={1.3} /></mesh>
      <pointLight position={[-0.05, 1.05, 0.5]} intensity={3} distance={3.5} color="#8fbfff" />
      <Box p={[-0.05, 0.79, 0.25]} s={[0.48, 0.03, 0.16]} c="#e9e3d2" /><Box p={[0.3, 0.775, 0.25]} s={[0.06, 0.025, 0.1]} c="#e9e3d2" />
      <Box p={[0.6, 0.98, -0.1]} s={[0.2, 0.42, 0.42]} c="#d9d2c0" /><Box p={[0.6, 1.1, 0.115]} s={[0.12, 0.02, 0.01]} c="#555" /><Sph p={[0.65, 0.85, 0.115]} r={0.008} c="#6cff6c" e="#6cff6c" ei={3} />
      <Box p={[-0.6, 0.77, 0.15]} s={[0.25, 0.01, 0.32]} c="#f8f6ef" r={[0, 0.2, 0]} /><Box p={[-0.62, 0.78, 0.12]} s={[0.25, 0.01, 0.32]} c="#f2efe6" r={[0, -0.1, 0]} />
      <Cyl p={[-0.45, 0.82, -0.2]} r1={0.04} h={0.1} c="#d8352a" /><Box p={[0.32, 0.78, -0.25]} s={[0.18, 0.06, 0.2]} c="#2a2a2e" />
    </group>
    {/* office chair (empty: the killer is drawn on top) */}
    <group position={[0.0, 0, -1.05]}>
      <RBox p={[0, 0.48, 0]} s={[0.5, 0.08, 0.48]} c="#2a2d35" /><RBox p={[0, 0.85, 0.24]} s={[0.46, 0.6, 0.08]} c="#2a2d35" />
      <Cyl p={[0, 0.25, 0]} r1={0.03} h={0.42} c="#222" />{[0, 1, 2, 3, 4].map((i) => <Box key={i} p={[Math.sin(i * 1.256) * 0.18, 0.05, Math.cos(i * 1.256) * 0.18]} s={[0.05, 0.04, 0.36]} c="#222" r={[0, i * 1.256, 0]} />)}
    </group>
    {/* filing cabinet + wall calendar + printer */}
    <group position={[1.85, 0, -0.8]}><Box p={[0, 0.55, 0]} s={[0.5, 1.1, 0.6]} c="#9aa0a8" metal={0.4} rough={0.5} />{[0.3, 0.65, 0.95].map((y) => <Box key={y} p={[-0.26, y, 0]} s={[0.02, 0.03, 0.2]} c="#333" />)}<Box p={[0, 1.18, 0]} s={[0.42, 0.16, 0.36]} c="#e3e0d8" /></group>
    <mesh position={[-0.6, 1.8, -2.24]}><planeGeometry args={[0.32, 0.42]} /><meshStandardMaterial map={tex("cal7", 128, 170, (c) => { c.fillStyle = "#fff"; c.fillRect(0, 0, 128, 170); c.fillStyle = "#d8352a"; c.fillRect(0, 0, 128, 40); c.fillStyle = "#fff"; c.font = "bold 26px sans-serif"; c.textAlign = "center"; c.fillText("DEC 2000", 64, 29); c.fillStyle = "#333"; c.font = "13px sans-serif"; for (let r = 0; r < 5; r++) for (let q = 0; q < 7; q++) c.fillText(String(r * 7 + q + 1 > 31 ? "" : r * 7 + q + 1), 12 + q * 17, 62 + r * 22); })} /></mesh>
    <Pendant7 p={[-0.9, 2.15, -0.3]} k={0.25} />
    <hemisphereLight args={["#56658f", "#1a140f", 0.35]} />
  </group>
);
