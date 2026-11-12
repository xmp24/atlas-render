import React from "react";
import * as THREE from "three";
import { random } from "remotion";
import { Box, Cyl, Sph, TX } from "../Miya3/Kit3";
import { textTex } from "../Miya3/Sets3";
import { ReiRoom7, Stairs7, Living7, Office7, Pendant7 } from "../Miya7/Rooms7";

const tex = textTex;
// ---------- realism helpers ----------
/** bathroom mirror: reflected tiles + light bar + the killer's own face looking back (front view, glowing eyes) */
const mirrorTex = () => tex("mirror9", 380, 400, (c) => {
  const g = c.createLinearGradient(0, 0, 0, 400); g.addColorStop(0, "#7d8f99"); g.addColorStop(0.5, "#56656d"); g.addColorStop(1, "#3c464c"); c.fillStyle = g; c.fillRect(0, 0, 380, 400);
  c.strokeStyle = "rgba(255,255,255,0.12)"; c.lineWidth = 2; for (let i = 0; i < 12; i++) { c.beginPath(); c.moveTo(i * 34, 0); c.lineTo(i * 34, 400); c.stroke(); c.beginPath(); c.moveTo(0, i * 34); c.lineTo(380, i * 34); c.stroke(); }
  const lb = c.createLinearGradient(0, 0, 0, 40); lb.addColorStop(0, "rgba(255,244,220,0.9)"); lb.addColorStop(1, "rgba(255,244,220,0)"); c.fillStyle = lb; c.fillRect(30, 0, 320, 40);
  c.globalAlpha = 0.85; c.fillStyle = "#1c1c22"; c.beginPath(); c.ellipse(255, 400, 95, 55, 0, Math.PI, 0); c.fill(); c.fillRect(225, 320, 60, 40);
  c.beginPath(); c.arc(255, 260, 70, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  c.strokeStyle = "rgba(255,255,255,0.35)"; c.lineWidth = 4; c.beginPath(); c.arc(255, 260, 66, Math.PI * 1.05, Math.PI * 1.45); c.stroke();
  const eye = (x: number, d: number) => { c.fillStyle = "#fff"; c.shadowColor = "#fff"; c.shadowBlur = 12; c.beginPath(); c.moveTo(x - 24 * d, 222); c.quadraticCurveTo(x, 214, x + 24 * d, 206); c.quadraticCurveTo(x + 6 * d, 244, x - 24 * d, 222); c.fill(); c.shadowBlur = 0; };
  c.save(); c.translate(255, 262); c.scale(0.72, 0.72); c.translate(-190, -230); eye(158, -1); eye(222, 1); c.restore();
  const sh = c.createLinearGradient(0, 0, 380, 400); sh.addColorStop(0.3, "rgba(255,255,255,0)"); sh.addColorStop(0.45, "rgba(255,255,255,0.12)"); sh.addColorStop(0.55, "rgba(255,255,255,0)"); c.fillStyle = sh; c.fillRect(0, 0, 380, 400);
});
const radial = () => tex("radial8", 128, 128, (c) => { const g = c.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, "rgba(0,0,0,0.75)"); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(0, 0, 128, 128); });
/** soft contact shadow under furniture so nothing floats */
export const Contact: React.FC<{ p: [number, number, number]; s: [number, number]; o?: number }> = ({ p, s, o = 0.6 }) => (
  <mesh position={[p[0], p[1] + 0.004, p[2]]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={s} /><meshBasicMaterial map={radial()} transparent opacity={o} depthWrite={false} /></mesh>
);
const edge = () => tex("edge8", 8, 128, (c) => { const g = c.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, "rgba(0,0,0,0.55)"); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(0, 0, 8, 128); });
/** fake ambient occlusion along floor/wall and wall/wall seams */
export const AO: React.FC<{ w: number; d: number; h: number }> = ({ w, d, h }) => {
  const m = <meshBasicMaterial map={edge()} transparent depthWrite={false} />;
  return (
    <group>
      <mesh position={[0, 0.006, -d / 2 + 0.25]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[w, 0.5]} />{m}</mesh>
      <mesh position={[-w / 2 + 0.25, 0.006, 0]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]}><planeGeometry args={[d, 0.5]} />{m}</mesh>
      <mesh position={[w / 2 - 0.25, 0.006, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}><planeGeometry args={[d, 0.5]} />{m}</mesh>
      <mesh position={[0, 0.3, -d / 2 + 0.056]}><planeGeometry args={[w, 0.6]} /><meshBasicMaterial map={edge()} transparent depthWrite={false} opacity={0.6} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, h - 0.25, -d / 2 + 0.056]} rotation={[0, 0, Math.PI]}><planeGeometry args={[w, 0.5]} /><meshBasicMaterial map={edge()} transparent depthWrite={false} opacity={0.7} /></mesh>
    </group>
  );
};
const shaftTex = () => tex("shaft8", 64, 256, (c) => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, "rgba(255,236,200,0.5)"); g.addColorStop(1, "rgba(255,236,200,0)"); c.fillStyle = g; c.fillRect(0, 0, 64, 256); });
/** volumetric light cone from a lamp or window */
export const Shaft: React.FC<{ p: [number, number, number]; r?: [number, number, number]; top: number; bottom: number; h: number; color?: string; o?: number }> = ({ p, r = [0, 0, 0], top, bottom, h, color = "#ffe6b8", o = 0.35 }) => (
  <mesh position={p} rotation={r}>
    <cylinderGeometry args={[top, bottom, h, 32, 1, true]} />
    <meshBasicMaterial map={shaftTex()} color={color} transparent opacity={o} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
  </mesh>
);
export const DustPts: React.FC<{ f: number; c: [number, number, number]; s: [number, number, number]; n?: number }> = ({ f, c, s, n = 120 }) => {
  const geo = React.useMemo(() => new THREE.BufferGeometry(), []);
  const v: number[] = [];
  for (let i = 0; i < n; i++) {
    const x = ((random("px" + i) + f * 0.0008 * (1 + random("pv" + i))) % 1) - 0.5, y = ((random("py" + i) + 1 - f * 0.0006 * (1 + random("pw" + i))) % 1) - 0.5, z = random("pz" + i) - 0.5;
    v.push(c[0] + x * s[0], c[1] + y * s[1], c[2] + z * s[2]);
  }
  geo.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
  return <points geometry={geo}><pointsMaterial color="#fff2d6" size={0.012} transparent opacity={0.7} depthWrite={false} /></points>;
};
const drawing = (k: string, kind: number) => tex("dr8" + k, 128, 96, (c) => {
  c.fillStyle = "#fbf8ee"; c.fillRect(0, 0, 128, 96); c.lineWidth = 3; c.lineCap = "round";
  c.strokeStyle = "#3a9a3a"; c.beginPath(); c.moveTo(0, 82); c.lineTo(128, 82); c.stroke();
  c.fillStyle = "#f2c94c"; c.beginPath(); c.arc(108, 18, 10, 0, 7); c.fill();
  const fig = (x: number, h: number, col: string) => { c.strokeStyle = col; c.beginPath(); c.arc(x, 82 - h, h * 0.18, 0, 7); c.stroke(); c.beginPath(); c.moveTo(x, 82 - h * 0.82); c.lineTo(x, 82 - h * 0.35); c.lineTo(x - 6, 82); c.moveTo(x, 82 - h * 0.35); c.lineTo(x + 6, 82); c.moveTo(x - 9, 82 - h * 0.65); c.lineTo(x + 9, 82 - h * 0.65); c.stroke(); };
  if (kind === 0) { fig(26, 52, "#2f5e9e"); fig(48, 48, "#d8352a"); fig(68, 34, "#e88aa6"); fig(86, 30, "#2f7ad6"); }
  else if (kind === 1) { c.strokeStyle = "#d8352a"; c.strokeRect(30, 40, 60, 42); c.beginPath(); c.moveTo(25, 40); c.lineTo(60, 14); c.lineTo(95, 40); c.stroke(); c.fillStyle = "#2f7ad6"; c.fillRect(52, 58, 14, 24); }
  else { c.strokeStyle = "#2f7ad6"; c.strokeRect(14, 44, 86, 22); [30, 60, 86].forEach((x) => { c.beginPath(); c.arc(x, 72, 7, 0, 7); c.stroke(); }); c.fillStyle = "#d8352a"; c.font = "bold 12px sans-serif"; c.fillText("REI", 40, 38); }
});
const Taped: React.FC<{ p: [number, number, number]; s: [number, number]; k: string; kind: number; rz?: number; ry?: number }> = ({ p, s, k, kind, rz = 0, ry = 0 }) => (
  <group position={p} rotation={[0, ry, rz]}>
    <mesh><planeGeometry args={s} /><meshStandardMaterial map={drawing(k, kind)} roughness={0.95} /></mesh>
    <mesh position={[0, s[1] / 2, 0.002]}><planeGeometry args={[0.06, 0.025]} /><meshStandardMaterial color="#e9e0b8" transparent opacity={0.8} /></mesh>
  </group>
);
const Paper: React.FC<{ p: [number, number, number]; r: number; s?: number; c?: string }> = ({ p, r, s = 1, c = "#f4f1e8" }) => (
  <mesh position={p} rotation={[-Math.PI / 2, 0, r]} receiveShadow><planeGeometry args={[0.21 * s, 0.297 * s]} /><meshStandardMaterial color={c} roughness={1} side={THREE.DoubleSide} /></mesh>
);
const clockTex = (hh: number, mm: number) => tex(`clk${hh}${mm}`, 128, 128, (c) => {
  c.fillStyle = "#f6f2e8"; c.beginPath(); c.arc(64, 64, 62, 0, 7); c.fill(); c.strokeStyle = "#3b2b20"; c.lineWidth = 8; c.stroke();
  c.fillStyle = "#222"; for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6; c.fillRect(64 + Math.sin(a) * 48 - 2, 64 - Math.cos(a) * 48 - 2, 4, 4); }
  c.strokeStyle = "#111"; c.lineCap = "round"; const ah = ((hh % 12) + mm / 60) * Math.PI / 6, am = (mm / 60) * Math.PI * 2;
  c.lineWidth = 6; c.beginPath(); c.moveTo(64, 64); c.lineTo(64 + Math.sin(ah) * 28, 64 - Math.cos(ah) * 28); c.stroke();
  c.lineWidth = 4; c.beginPath(); c.moveTo(64, 64); c.lineTo(64 + Math.sin(am) * 42, 64 - Math.cos(am) * 42); c.stroke();
});
export const WallClock8: React.FC<{ p: [number, number, number]; hh: number; mm: number; ry?: number; r?: number; f?: number }> = ({ p, hh, mm, ry = 0, r = 0.2, f = 0 }) => (
  <group position={p} rotation={[0, ry, 0]}><Cyl p={[0, 0, -0.01]} r1={r + 0.02} h={0.04} c="#3b2b20" rot={[Math.PI / 2, 0, 0]} /><mesh position={[0, 0, 0.012]}><circleGeometry args={[r, 40]} /><meshStandardMaterial map={clockTex(hh, mm)} /></mesh>
    <group position={[0, 0, 0.02]} rotation={[0, 0, -Math.floor(f / 15) * Math.PI / 30]}><mesh position={[0, r * 0.4, 0]}><boxGeometry args={[r * 0.03, r * 0.85, 0.004]} /><meshBasicMaterial color="#c8102e" /></mesh></group></group>
);
const calTex8 = () => tex("cal8", 128, 170, (c) => { c.fillStyle = "#fff"; c.fillRect(0, 0, 128, 170); c.fillStyle = "#d8352a"; c.fillRect(0, 0, 128, 36); c.fillStyle = "#fff"; c.font = "bold 22px sans-serif"; c.textAlign = "center"; c.fillText("DEC 2000", 64, 26); c.font = "12px sans-serif"; for (let d = 1; d <= 31; d++) { const q = (d + 4) % 7, r = Math.floor((d + 4) / 7); const x = 12 + q * 17, y = 58 + r * 22; c.fillStyle = "#333"; c.fillText(String(d), x, y); if (d < 30) { c.strokeStyle = "#d8352a"; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 6, y - 9); c.lineTo(x + 6, y + 2); c.stroke(); } if (d === 30) { c.strokeStyle = "#d8352a"; c.beginPath(); c.arc(x, y - 4, 9, 0, 7); c.stroke(); } } });
export const Calendar8: React.FC<{ p: [number, number, number]; ry?: number }> = ({ p, ry = 0 }) => <mesh position={p} rotation={[0, ry, 0]}><planeGeometry args={[0.32, 0.42]} /><meshStandardMaterial map={calTex8()} /></mesh>;

// ---------- room extras ----------
export const ReiExtras: React.FC<{ f: number }> = ({ f }) => (
  <group>
    <AO w={5.2} d={5.2} h={2.6} />
    <Contact p={[-1.55, 0, -0.9]} s={[1.5, 2.5]} /><Contact p={[1.75, 0, -2.15]} s={[1.6, 1.0]} /><Contact p={[-0.65, 0, -2.2]} s={[0.7, 0.6]} /><Contact p={[2.35, 0, -0.6]} s={[0.6, 1.2]} />
    {/* kids' drawings taped on the wall */}
    <Taped p={[0.2, 1.95, -2.54]} s={[0.36, 0.27]} k="a" kind={0} rz={0.05} />
    <Taped p={[-0.05, 1.55, -2.54]} s={[0.3, 0.22]} k="b" kind={2} rz={-0.06} />
    <Taped p={[2.54, 1.6, -1.6]} s={[0.36, 0.27]} k="c" kind={1} ry={-Math.PI / 2} rz={0.04} />
    {/* moon night light */}
    <group position={[-2.5, 0.35, 0.2]} rotation={[0, Math.PI / 2, 0]}><mesh><circleGeometry args={[0.08, 24, 0, Math.PI * 1.3]} /><meshStandardMaterial color="#fff2b0" emissive="#ffe08a" emissiveIntensity={f < 30 ? 1.4 : f < 36 ? (Math.floor(f) % 2 ? 1.4 : 0.1) : 0.05} /></mesh></group>
    <pointLight position={[-2.3, 0.35, 0.2]} intensity={f < 30 ? 0.8 : f < 36 ? (Math.floor(f) % 2 ? 0.8 : 0) : 0} distance={1.5} color="#ffe08a" />
    {/* toy cars on the shelf, slippers, open drawer with clothes, papers on the floor (the house was ransacked) */}
    {[0, 1, 2, 3].map((i) => <Box key={i} p={[2.2, 1.43, -0.95 + i * 0.16]} s={[0.06, 0.05, 0.12]} c={["#d8262b", "#2f7ad6", "#f2c94c", "#3f9a4a"][i]} rough={0.35} />)}
    <Box p={[-0.85, 0.03, 0.35]} s={[0.1, 0.04, 0.22]} c="#4a7fd0" r={[0, 0.3, 0]} /><Box p={[-0.68, 0.03, 0.3]} s={[0.1, 0.04, 0.22]} c="#4a7fd0" r={[0, -0.2, 0]} />
    <group position={[1.75, 0, -2.15]}>
      <Box p={[0.35, 0.35, 0.42]} s={[0.4, 0.16, 0.3]} c="#9c6a42" />
      <Box p={[0.3, 0.44, 0.45]} s={[0.25, 0.05, 0.2]} c="#e88aa6" r={[0, 0.3, 0.1]} />
    </group>
    <Paper p={[0.9, 0.003, 0.2]} r={0.4} /><Paper p={[1.2, 0.004, 0.55]} r={-0.7} /><Paper p={[0.6, 0.005, 1.2]} r={1.2} c="#efe9d0" />
    <WallClock8 p={[1.6, 2.15, -2.54]} hh={12} mm={5} r={0.14} f={f} />
    <Calendar8 p={[2.54, 1.25, -2.2]} ry={-Math.PI / 2} />
    <Shaft p={[0.9, 0.9, -1.8]} r={[0.55, 0, 0]} top={0.5} bottom={1.0} h={2.2} color="#9fb4ff" o={0.16} />
    <DustPts f={f} c={[0.4, 1.0, -1.0]} s={[2.5, 1.8, 2]} />
  </group>
);
const bloodTex = () => tex("blood8", 128, 128, (c) => { c.fillStyle = "rgba(90,10,12,0.55)"; for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(30 + i * 22, 50 + Math.sin(i) * 10, 14, 42, 0.2, 0, 7); c.fill(); } });
export const StairsExtras: React.FC<{ f: number }> = ({ f }) => (
  <group>
    <AO w={4.2} d={6} h={5.2} />
    {/* phone table with the receiver off the hook */}
    <group position={[-1.75, 0, 0.9]}>
      <Box p={[0, 0.38, 0]} s={[0.45, 0.04, 0.35]} c="#6b4428" />{[[-0.18, -0.13], [0.18, -0.13], [-0.18, 0.13], [0.18, 0.13]].map(([x, z], i) => <Box key={i} p={[x, 0.18, z]} s={[0.03, 0.36, 0.03]} c="#5a3820" />)}
      <Box p={[0, 0.44, 0]} s={[0.2, 0.08, 0.16]} c="#e8e4d8" rough={0.4} />
      <group position={[0.18, 0.38, 0.1]} rotation={[Math.sin(f / 9) * 0.25, 0, Math.sin(f / 11) * 0.12]}>
        <mesh position={[0, -0.12, 0]}><cylinderGeometry args={[0.005, 0.005, 0.24, 6]} /><meshStandardMaterial color="#d8d4c8" /></mesh>
        <Box p={[0, -0.26, 0]} s={[0.05, 0.18, 0.04]} c="#e8e4d8" />
      </group>
      <Contact p={[0, 0, 0]} s={[0.7, 0.6]} />
    </group>
    {/* the snapped kitchen knife: blade and handle apart on the floor */}
    <group position={[-0.4, 0.012, 2.35]} rotation={[0, 0.6, 0]}>
      <Box p={[0, 0, 0]} s={[0.15, 0.006, 0.035]} c="#d9dde2" metal={0.9} rough={0.2} />
      <Box p={[0.2, 0, 0.09]} s={[0.11, 0.022, 0.028]} c="#3a2618" r={[0, 0.5, 0]} /><Box p={[0.14, 0, 0.06]} s={[0.04, 0.006, 0.03]} c="#d9dde2" metal={0.9} rough={0.2} r={[0, 0.5, 0]} />
      {[[-0.05, 0.07], [0.08, -0.06], [0.25, 0.02]].map(([x, z], i) => <mesh key={i} position={[x, 0.001, z]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.015 + i * 0.008, 12]} /><meshBasicMaterial color="#5a0a0e" /></mesh>)}
    </group>
    {/* kadomatsu-style new year decoration and shimekazari by the entrance */}
    <group position={[-1.8, 0, 2.6]}><Cyl p={[0, 0.2, 0]} r1={0.16} h={0.4} c="#8a6a3a" />{[0, 1, 2].map((i) => <Cyl key={i} p={[(i - 1) * 0.07, 0.55 + i * 0.06, 0]} r1={0.035} h={0.7 + i * 0.1} c="#5f8f3e" />)}<Sph p={[0, 0.45, 0.1]} r={0.1} c="#2f5a2a" s={[1.6, 0.6, 1]} /></group>
    {/* faint smear on the wall (out of focus) */}
    <mesh position={[0.92, 1.6, 0.3]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[0.6, 0.5]} /><meshBasicMaterial map={bloodTex()} transparent opacity={0.55} depthWrite={false} /></mesh>
    <Taped p={[0.92, 1.25, 1.9]} s={[0.36, 0.27]} k="s" kind={1} ry={-Math.PI / 2} rz={0.03} />
    <WallClock8 p={[-2.04, 1.95, 0.0]} hh={12} mm={10} ry={Math.PI / 2} r={0.16} f={f} />
    <Shaft p={[0.35, 3.4, -2.2]} r={[-0.9, 0, 0]} top={0.3} bottom={0.9} h={2.4} color="#ffd59a" o={0.18} />
    <DustPts f={f} c={[0.3, 2.0, 0.5]} s={[2, 3, 3]} />
  </group>
);
export const LivingExtras: React.FC<{ f: number }> = ({ f }) => (
  <group>
    <AO w={5.4} d={5.4} h={2.6} />
    <Contact p={[1.15, 0, -0.5]} s={[2.6, 1.4]} /><Contact p={[-0.3, 0, 0.75]} s={[1.7, 1.5]} /><Contact p={[-1.6, 0, -2.3]} s={[1.6, 0.8]} />
    {/* kerosene heater glowing */}
    <group position={[-2.2, 0, 0.6]}><Box p={[0, 0.25, 0]} s={[0.35, 0.5, 0.3]} c="#d9d4c8" rough={0.4} /><Box p={[0.18, 0.25, 0]} s={[0.01, 0.3, 0.22]} c="#ff6a20" e="#ff5a10" ei={2.5} /><pointLight position={[0.4, 0.3, 0]} intensity={1.6} distance={2.2} color="#ff7a30" /></group>
    {/* half-finished tea, homework open, toy half-built */}
    <Cyl p={[-0.45, 0.47, 0.5]} r1={0.04} h={0.08} c="#e9e4d8" /><Cyl p={[-0.45, 0.5, 0.5]} r1={0.034} h={0.01} c="#7a8a3a" />
    {[0, 1, 2, 3].map((i) => { const q = ((f + i * 9) % 36) / 36; return <mesh key={"st" + i} position={[-0.45 + Math.sin(q * 6 + i) * 0.02, 0.53 + q * 0.22, 0.5]}><sphereGeometry args={[0.02 + q * 0.03, 8, 6]} /><meshBasicMaterial color="#ffffff" transparent opacity={Math.sin(Math.PI * q) * 0.18 * Math.max(0.2, 1 - f / 60)} depthWrite={false} /></mesh>; })}
    {/* sheer curtain moving in the draft from the open window upstairs */}
    <mesh position={[0.15, 1.45, -2.48]} rotation={[Math.sin(f / 13) * 0.06, Math.sin(f / 17) * 0.05, 0]}><planeGeometry args={[0.7, 1.3, 1, 8]} /><meshStandardMaterial color="#e8eef8" transparent opacity={0.22} side={THREE.DoubleSide} depthWrite={false} /></mesh>
    <spotLight position={[0.5, 2.15, -2.5]} target-position={[0.3, 0, 0.9]} angle={0.6} penumbra={0.6} intensity={6} distance={7} color="#9fb4ff" castShadow />
    <Box p={[0.05, 0.43, 0.95]} s={[0.3, 0.01, 0.21]} c="#f4f1e8" r={[0, 0.2, 0]} /><Box p={[0.12, 0.44, 0.9]} s={[0.12, 0.012, 0.012]} c="#d8352a" r={[0, 0.8, 0]} />
    <group position={[0.9, 0.02, 1.4]}>{[0, 1, 2, 3, 4].map((i) => <Box key={i} p={[i * 0.05, 0.03 + (i > 2 ? 0.05 : 0), (i % 2) * 0.05]} s={[0.05, 0.05, 0.05]} c={["#d8262b", "#2f7ad6", "#f2c94c", "#3f9a4a", "#ffffff"][i]} />)}</group>
    {/* drawers pulled out, papers scattered */}
    <Paper p={[0.4, 0.004, 1.6]} r={0.3} /><Paper p={[0.75, 0.005, 1.85]} r={-0.6} /><Paper p={[-1.0, 0.004, 1.7]} r={1.0} c="#efe9d0" />
    <WallClock8 p={[-1.3, 2.15, -2.64]} hh={12} mm={30} f={f} />
    <Calendar8 p={[2.69, 1.6, -1.2]} ry={-Math.PI / 2} />
    <Shaft p={[0.9, 0.85, -1.9]} r={[0.6, 0, 0]} top={0.6} bottom={1.1} h={2.3} color="#9fb4ff" o={0.14} />
    <DustPts f={f} c={[0.6, 1.0, -1.2]} s={[2.5, 1.8, 2]} />
  </group>
);
const winUI = (stage: number) => tex("ui8" + stage, 320, 240, (c) => {
  c.fillStyle = "#008080"; c.fillRect(0, 0, 320, 240);
  c.fillStyle = "#c0c0c0"; c.fillRect(0, 222, 320, 18); c.fillStyle = "#000"; c.font = "bold 11px sans-serif"; c.fillText("Start", 6, 235); c.fillText("1:18 AM", 266, 235);
  c.fillStyle = "#c0c0c0"; c.fillRect(40, 50, 240, 130); c.fillStyle = "#000080"; c.fillRect(42, 52, 236, 18); c.fillStyle = "#fff"; c.font = "bold 11px sans-serif"; c.fillText(stage ? "Connected to Internet" : "Dial-up Networking", 48, 65);
  c.fillStyle = "#000"; c.font = "12px sans-serif"; c.fillText(stage ? "Connected at 56,000 bps" : "Dialing...", 60, 100); c.fillText(stage ? "Duration: 000:00:41" : "Verifying user name...", 60, 122);
  c.fillStyle = "#fff"; c.fillRect(60, 140, 200, 14); c.fillStyle = "#000080"; c.fillRect(62, 142, stage ? 196 : 90, 10);
  if (stage >= 2) {   // browser window opening and loading a page
    c.fillStyle = "#c0c0c0"; c.fillRect(14, 14, 292, 204); c.fillStyle = "#000080"; c.fillRect(16, 16, 288, 16); c.fillStyle = "#fff"; c.font = "bold 10px sans-serif"; c.fillText("Microsoft Internet Explorer", 20, 28);
    c.fillStyle = "#fff"; c.fillRect(18, 36, 284, 14); c.fillStyle = "#000"; c.font = "10px monospace"; c.fillText("http://www.", 22, 47);
    c.fillStyle = "#ffffff"; c.fillRect(18, 54, 284, 150); const rows = Math.min(9, (stage - 2) * 3);
    for (let i = 0; i < rows; i++) { c.fillStyle = i === 0 ? "#1a3a9a" : "#9a9a9a"; c.fillRect(26, 62 + i * 15, i === 0 ? 160 : 120 + ((i * 37) % 140), i === 0 ? 10 : 6); }
    c.fillStyle = "#c0c0c0"; c.fillRect(16, 206, 288, 12); c.fillStyle = "#000"; c.fillText(stage < 5 ? "Opening page..." : "Done", 20, 215); c.fillStyle = "#000080"; c.fillRect(200, 208, Math.min(100, (stage - 1) * 25), 8);
  }
});
export const OfficeExtras: React.FC<{ f: number; stage: number }> = ({ f, stage }) => (
  <group>
    <AO w={4.6} d={4.6} h={2.6} />
    <Contact p={[0, 0, -1.85]} s={[2.0, 1.1]} /><Contact p={[-1.65, 0, -2.05]} s={[1.3, 0.6]} /><Contact p={[1.85, 0, -0.8]} s={[0.8, 0.9]} /><Contact p={[0, 0, -1.05]} s={[0.8, 0.8]} o={0.5} />
    {/* windows 98 style screen over the old one */}
    <mesh position={[-0.05, 1.07, -1.724]}><planeGeometry args={[0.44, 0.33]} /><meshStandardMaterial map={winUI(stage)} emissive="#fff" emissiveMap={winUI(stage)} emissiveIntensity={1.25} /></mesh>
    {/* ransacked: open filing drawer, papers everywhere */}
    <Box p={[1.53, 0.65, -0.8]} s={[0.4, 0.22, 0.5]} c="#8e949c" metal={0.4} rough={0.5} />
    <Paper p={[0.9, 0.004, -0.2]} r={0.5} /><Paper p={[1.2, 0.005, 0.1]} r={-0.4} /><Paper p={[-0.5, 0.004, 0.2]} r={1.2} c="#efe9d0" /><Paper p={[0.3, 0.006, 0.45]} r={-1.1} />
    <Calendar8 p={[-0.6, 1.8, -2.24]} />
    <WallClock8 p={[0.9, 2.15, -2.24]} hh={1} mm={18} r={0.15} f={f} />
    <Shaft p={[-0.05, 0.9, -1.2]} r={[-1.2, 0, 0]} top={0.12} bottom={0.7} h={1.3} color="#8fbfff" o={0.22} />
    <DustPts f={f} c={[0, 1.0, -1.2]} s={[1.6, 1.2, 1.2]} n={80} />
  </group>
);

// ---------- Japanese bathroom, rebuilt with far more detail ----------
const tileRelief = () => TX.tiles("#e7eef0", "#b9c8cd", 16, 9);
export const Bath8: React.FC<{ f: number }> = ({ f }) => (
  <group>
    {/* shell */}
    <Box p={[0, -0.05, 0]} s={[4, 0.1, 4]} map={TX.tiles("#a9bcc4", "#869aa2", 9, 9)} rough={0.18} metal={0.15} />
    {[0, 1].map((i) => { const q = ((f + i * 14) % 28) / 28; return <mesh key={"dr" + i} position={[0.45 + i * 0.1, 0.84 * (1 - q * q), -1.42]}><sphereGeometry args={[0.012, 8, 6]} /><meshStandardMaterial color="#7a0a10" roughness={0.2} /></mesh>; })}
    {[0, 1, 2].map((i) => <mesh key={"pd" + i} position={[0.48 + i * 0.05, 0.003, -1.4 + i * 0.03]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.02 + i * 0.012 + Math.min(0.02, f * 0.0006), 14]} /><meshBasicMaterial color="#5a0a0e" /></mesh>)}
    <Box p={[0, 2.55, 0]} s={[4, 0.1, 4]} c="#eef0ec" />
    <Box p={[0, 1.25, -2]} s={[4, 2.5, 0.1]} map={tileRelief()} rough={0.3} />
    <Box p={[-2, 1.25, 0]} s={[0.1, 2.5, 4]} map={tileRelief()} rough={0.3} />
    <Box p={[2, 1.25, 0]} s={[0.1, 2.5, 4]} map={tileRelief()} rough={0.3} />
    <AO w={4} d={4} h={2.5} />
    {/* frosted window, open, with fluttering curtain */}
    <group position={[-1.15, 1.85, -1.94]}>
      <Box p={[0, 0, 0]} s={[0.9, 0.75, 0.04]} c="#0b1630" e="#1d2c5a" ei={0.5} />
      <Box p={[0.22, 0, 0.03]} s={[0.45, 0.72, 0.02]} c="#c9d7de" op={0.85} />
      <Box p={[0, 0.42, 0.04]} s={[1.0, 0.08, 0.06]} c="#f1ece1" /><Box p={[0, -0.42, 0.06]} s={[1.05, 0.06, 0.12]} c="#f1ece1" />
      <mesh position={[-0.3, -0.05, 0.12]} geometry={(() => { const g = new THREE.PlaneGeometry(0.4, 0.8, 16, 1); const v = g.attributes.position; for (let i = 0; i < v.count; i++) v.setZ(i, Math.sin(v.getX(i) * 40 + f / 5) * 0.03 + (v.getY(i) < 0 ? Math.sin(f / 7) * 0.05 : 0)); g.computeVertexNormals(); return g; })()}><meshStandardMaterial color="#eef2f3" side={THREE.DoubleSide} /></mesh>
      <spotLight position={[0, 0, -0.4]} angle={0.7} penumbra={0.9} intensity={6} distance={5} color="#8fa6e8" target-position={[0.5, -1.8, 2.5]} />
    </group>
    {/* deep ofuro tub with roll lid, stool, bucket, shower */}
    <group position={[-1.2, 0, -1.25]}>
      <Box p={[0, 0.3, 0]} s={[1.4, 0.6, 1.4]} c="#f6f8f8" rough={0.2} />
      <Box p={[0, 0.56, 0]} s={[1.24, 0.06, 1.24]} c="#9ec4d2" rough={0.05} metal={0.1} />
      {Array.from({ length: 6 }).map((_, i) => <Cyl key={i} p={[-0.45 + i * 0.05, 0.66, -0.5]} r1={0.03} h={1.3} c="#d9e2e6" rot={[0, 0, Math.PI / 2]} />)}
      <Box p={[0.55, 0.15, 1.05]} s={[0.32, 0.25, 0.25]} c="#e8ecef" rough={0.3} /><Cyl p={[0.0, 0.12, 1.1]} r1={0.15} r2={0.12} h={0.24} c="#f2c94c" />
      <Cyl p={[0.55, 1.4, -0.66]} r1={0.012} h={0.9} c="#c5c9cf" /><Cyl p={[0.55, 1.88, -0.62]} r1={0.05} h={0.03} c="#c5c9cf" rot={[0.4, 0, 0]} />
      <Box p={[0.55, 0.95, -0.67]} s={[0.24, 0.06, 0.06]} c="#c5c9cf" metal={0.7} rough={0.25} />
    </group>
    {/* vanity with mirror cabinet and light bar */}
    <group position={[0.75, 0, -1.72]}>
      <Box p={[0, 0.4, 0]} s={[0.95, 0.8, 0.5]} c="#efe9dc" /><Box p={[-0.23, 0.4, 0.26]} s={[0.42, 0.66, 0.02]} c="#f4efe4" /><Box p={[0.23, 0.4, 0.26]} s={[0.42, 0.66, 0.02]} c="#f4efe4" />
      <Box p={[-0.05, 0.45, 0.28]} s={[0.02, 0.1, 0.02]} c="#999" /><Box p={[0.05, 0.45, 0.28]} s={[0.02, 0.1, 0.02]} c="#999" />
      <Box p={[0, 0.84, 0]} s={[1.0, 0.08, 0.56]} c="#ffffff" rough={0.18} />
      <Box p={[0, 0.86, 0.02]} s={[0.5, 0.04, 0.36]} c="#dfe6e8" rough={0.1} />
      {[[-0.1, 0.05], [0.08, -0.02], [0.02, 0.08]].map(([x, z], i) => <mesh key={i} position={[x, 0.885, z]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.012 + i * 0.006, 12]} /><meshBasicMaterial color="#6a0a0e" /></mesh>)}
      <Box p={[0, 1.62, -0.2]} s={[0.85, 0.9, 0.14]} c="#e6e2d8" /><mesh position={[0, 1.62, -0.118]}><planeGeometry args={[0.76, 0.8]} /><meshBasicMaterial map={mirrorTex()} toneMapped={false} /></mesh>
      <Box p={[0, 2.12, -0.15]} s={[0.85, 0.07, 0.12]} c="#f4f4f2" e="#fff2d8" ei={1.4} />
      <pointLight position={[0, 2.0, 0.2]} intensity={2.2 * (random(`bl${Math.floor(f / 3)}`) > 0.1 ? 1 : 0.2)} distance={3} color="#fff2d8" />
      <Cyl p={[0, 0.99, -0.2]} r1={0.022} h={0.22} c="#c5c9cf" /><Box p={[0, 1.09, -0.12]} s={[0.04, 0.03, 0.14]} c="#c5c9cf" />
      <mesh position={[0, 0.98, -0.06]}><cylinderGeometry args={[0.007 + Math.sin(f * 1.7) * 0.001, 0.009, 0.2, 8]} /><meshStandardMaterial color="#e8b0b0" transparent opacity={0.6} roughness={0.05} emissive="#802020" emissiveIntensity={0.3} /></mesh>
      <mesh position={[0, 0.875, -0.06]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.03 + Math.abs(Math.sin(f / 2)) * 0.01, 14]} /><meshBasicMaterial color="#c86a6a" transparent opacity={0.5} /></mesh>
      <Cyl p={[-0.36, 0.95, -0.14]} r1={0.04} h={0.13} c="#8fd0e0" />{[0, 1, 2].map((i) => <Cyl key={i} p={[-0.37 + i * 0.015, 1.06, -0.14]} r1={0.006} h={0.15} c={["#e84a5f", "#3f7fd0", "#f2c94c"][i]} />)}
      {[["#f2c94c", 0.24], ["#e88aa6", 0.32], ["#ffffff", 0.4]].map(([c, x], i) => <Cyl key={i} p={[x as number, 0.97, -0.16]} r1={0.03} h={0.17 + i * 0.02} c={c as string} />)}
      {/* first aid kit open: bandage roll, cotton, scissors */}
      <mesh position={[0.36, 0.98, 0.14]} rotation={[0, -0.3, 0]}><boxGeometry args={[0.3, 0.17, 0.2]} /><meshStandardMaterial map={tex("kit8", 64, 64, (c) => { c.fillStyle = "#fafafa"; c.fillRect(0, 0, 64, 64); c.fillStyle = "#d8262b"; c.fillRect(24, 10, 16, 44); c.fillRect(10, 24, 44, 16); })} /></mesh>
      <Box p={[0.34, 1.12, 0.02]} s={[0.3, 0.02, 0.2]} c="#f0f0f0" r={[-1.1, -0.3, 0]} />
      <Cyl p={[-0.15, 0.91, 0.18]} r1={0.035} h={0.05} c="#ffffff" rot={[0, 0, Math.PI / 2]} />
      <Sph p={[0.1, 0.9, 0.2]} r={0.03} c="#ffffff" s={[1.4, 0.8, 1]} />
      <Box p={[0.15, 0.885, 0.08]} s={[0.12, 0.008, 0.02]} c="#b9c0c8" metal={0.8} r={[0, 0.6, 0]} />
    </group>
    {/* towel shelf, washing machine with laundry basket, mat, slippers */}
    <Box p={[1.85, 1.75, -0.6]} s={[0.25, 0.03, 0.7]} c="#c5c9cf" metal={0.5} />
    {[0, 1, 2].map((i) => <Box key={i} p={[1.83, 1.81 + i * 0.07, -0.6]} s={[0.22, 0.06, 0.5]} c={["#f2b22a", "#e8eef0", "#9fd0e0"][i]} />)}
    <Box p={[1.65, 0.45, 0.8]} s={[0.6, 0.9, 0.6]} c="#f4f4f2" rough={0.3} /><Cyl p={[1.34, 0.5, 0.8]} r1={0.2} h={0.03} c="#7f9eb0" rot={[0, 0, Math.PI / 2]} /><Box p={[1.65, 0.86, 0.95]} s={[0.4, 0.04, 0.12]} c="#c9cdd2" />
    <Cyl p={[1.0, 0.18, 1.3]} r1={0.22} r2={0.18} h={0.36} c="#b99a6a" /><Sph p={[1.0, 0.36, 1.3]} r={0.17} c="#7f9eb0" s={[1, 0.4, 1]} />
    <Box p={[0.6, 0.008, -0.95]} s={[0.7, 0.012, 0.45]} c="#5b8fb0" />
    <Box p={[0.3, 0.025, -0.55]} s={[0.1, 0.04, 0.24]} c="#7aa0c0" r={[0, 0.2, 0]} /><Box p={[0.45, 0.025, -0.5]} s={[0.1, 0.04, 0.24]} c="#7aa0c0" r={[0, -0.1, 0]} />
    <Contact p={[0.75, 0, -1.72]} s={[1.3, 0.8]} /><Contact p={[-1.2, 0, -1.25]} s={[1.8, 1.8]} /><Contact p={[1.65, 0, 0.8]} s={[0.9, 0.9]} />
    <WallClock8 p={[1.94, 2.05, 0.6]} hh={12} mm={52} ry={-Math.PI / 2} r={0.13} f={f} />
    <Pendant7 p={[0.2, 1.95, -0.2]} k={0.55} />
    <hemisphereLight args={["#6b7aa8", "#1a1a1a", 0.4]} />
    <DustPts f={f} c={[0.4, 1.3, -0.8]} s={[2, 1.6, 1.5]} n={70} />
  </group>
);

export { ReiRoom7, Stairs7, Living7, Office7 };
