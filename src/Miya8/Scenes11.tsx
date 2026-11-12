import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { interpolate, random } from "remotion";
import { Rig } from "../Miya3/Kit3";
import { Bot, Aura, STAND, TYPE, idleBP, mixBP, BP, walkBP } from "./Bot3";
import { ReiRoom7, Stairs7, Living7, Office7, ReiExtras, StairsExtras, LivingExtras, OfficeExtras, Bath8 } from "./Rooms8";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ez = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const sm = (t: number) => t * t * (3 - 2 * t);
const L3 = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k) as [number, number, number];
type Cam = { pos: [number, number, number]; look: [number, number, number]; fov: number };
type Shot = [number, Cam, Cam];

/** camera with hard cuts between shots; each shot is a slow one-direction dolly (no zoom in/out) */
const Stage: React.FC<{ f: number; len: number; shots: Shot[]; children: React.ReactNode }> = ({ f, len, shots, children }) => {
  let si = 0; for (let i = 0; i < shots.length; i++) if (f >= shots[i][0]) si = i;
  const [s0, a, b] = shots[si], s1 = si + 1 < shots.length ? shots[si + 1][0] : len;
  const k = ez(interpolate(f, [s0, s1], [0, 1], clamp));
  const hx = Math.sin(f / 23) * 0.01 + Math.sin(f / 9.7) * 0.003, hy = Math.sin(f / 31) * 0.008;
  const pos = L3(a.pos, b.pos, k); pos[0] += hx; pos[1] += hy;
  return (
    <ThreeCanvas width={1080} height={1920} shadows="soft" style={{ position: "absolute", background: "#000" }} camera={{ fov: a.fov, position: a.pos, near: 0.05, far: 60 }} gl={{ antialias: true, preserveDrawingBuffer: true }}>
      <Rig pos={pos} look={L3(a.look, b.look, k)} fov={a.fov + (b.fov - a.fov) * k} />
      <fog attach="fog" args={["#0b0a0c", 7, 16]} />
      {children}
    </ThreeCanvas>
  );
};
/** faint red shoe prints along his path */
const Steps: React.FC<{ pts: [number, number, number][]; f: number; t0?: number }> = ({ pts, f, t0 = 0 }) => (
  <group>{pts.map(([x, z, r], i) => <mesh key={i} position={[x + (i % 2 ? 0.07 : -0.07), 0.004, z]} rotation={[-Math.PI / 2, 0, r]}><planeGeometry args={[0.09, 0.2]} /><meshBasicMaterial color="#7a0a12" transparent opacity={interpolate(f, [t0 + i * 3, t0 + i * 3 + 4], [0, 0.55], clamp)} depthWrite={false} /></mesh>)}</group>
);
/** small dust puffs where his feet land */
const Puffs: React.FC<{ f: number; at: [number, number, number, number][] }> = ({ f, at }) => (
  <group>{at.map(([t, x, z, s], i) => { const q = (f - t) / 14; if (q < 0 || q > 1) return null; return [0, 1, 2].map((j) => <mesh key={i + "-" + j} position={[x + (j - 1) * 0.06 * (1 + q), 0.03 + q * 0.06, z + (random("pz" + i + j) - 0.5) * 0.08]}><sphereGeometry args={[0.03 + q * 0.05 * s, 8, 6]} /><meshBasicMaterial color="#cbbfa8" transparent opacity={(1 - q) * 0.25} depthWrite={false} /></mesh>); })}</group>
);

export const ReiScene3: React.FC<{ f: number; len: number }> = ({ f, len }) => {
  const look = interpolate(f, [26, 70], [0, 1], { ...clamp, easing: sm });
  const wk = interpolate(f, [0, 22], [0, 1], clamp), stop = interpolate(f, [16, 26], [1, 0], clamp);
  const idle = idleBP(f, { ...STAND, headX: 14 + 8 * look, headY: -28 * look, lean: 6, twist: -6 * look });
  const p = stop > 0 ? mixBP(idle, walkBP(wk * Math.PI * 2.2, 1), stop) : idle;
  const e = (x: number) => 1 - (x < 1 ? 1 - Math.pow(1 - x, 2) : 1);
  const bx = 0.05 + e(wk) * 0.38, bz = -0.05 + e(wk) * 0.3, lag = Math.max(0, wk - 0.15);
  const boost = interpolate(f, [28, 36, 60], [0, 1, 0.3], clamp);   // aura swells on "strangled"
  return (
    <Stage f={f} len={len} shots={[
      [0, { pos: [1.45, 1.55, 3.0], look: [-0.45, 0.9, -1.4], fov: 66 }, { pos: [1.3, 1.52, 2.7], look: [-0.5, 0.92, -1.4], fov: 64 }],
      [46, { pos: [-2.25, 1.75, 2.75], look: [0.2, 0.85, -0.8], fov: 64 }, { pos: [-2.15, 1.72, 2.6], look: [0.2, 0.87, -0.8], fov: 63 }],
    ]}>
      <ReiRoom7 /><ReiExtras f={f} />
      <Steps f={f} pts={[[0.45, 0.32, -2.1], [0.32, 0.22, -2.1], [0.2, 0.1, -2.1], [0.08, -0.02, -2.1]]} />
      <Puffs f={f} at={[[4, 0.38, 0.27, 1], [11, 0.26, 0.17, 1], [18, 0.14, 0.05, 1]]} />
      <Bot pos={[bx, 0, bz]} ry={-2.1} p={p} f={f} />
      <Aura f={f} pos={[0.05 + e(lag) * 0.38, 0, -0.05 + e(lag) * 0.3]} seed="rei" k={0.9 + boost * 0.6} n={50} />
      <pointLight position={[0.1, 1.9, 1.0]} intensity={1.6} distance={2.5} color="#9fb4ff" />
    </Stage>
  );
};
export const StairsScene3: React.FC<{ f: number; len: number }> = ({ f, len }) => {
  // walks in two steps, turns his head at the creak, then looks down at the snapped blade
  const wk = interpolate(f, [0, 18], [0, 1], clamp), stop = interpolate(f, [12, 20], [1, 0], clamp);
  const creak = interpolate(f, [22, 30, 44], [0, 1, 0], { ...clamp, easing: sm });
  const down = interpolate(f, [50, 90], [0, 1], { ...clamp, easing: sm });
  const idle = idleBP(f, { ...STAND, headX: -14 + 40 * down, headY: 18 * down - 35 * creak, lean: 4 * down });
  const p = stop > 0 ? mixBP(idle, walkBP(wk * Math.PI * 2, 1), stop) : idle;
  const z = 1.75 + (1 - (wk < 1 ? 1 - Math.pow(1 - wk, 2) : 1)) * 0.45, x = -0.55 - (1 - (wk < 1 ? 1 - Math.pow(1 - wk, 2) : 1)) * 0.12;
  const boost = interpolate(f, [48, 56, 80], [0, 1, 0.3], clamp);   // swells on "stabbed"
  return (
    <Stage f={f} len={len} shots={[
      [0, { pos: [-1.9, 1.15, 4.9], look: [0.45, 1.75, 0], fov: 62 }, { pos: [-1.65, 1.22, 4.5], look: [0.45, 2.0, 0], fov: 60 }],
      [62, { pos: [0.9, 0.55, 4.6], look: [-0.45, 1.25, 1.75], fov: 58 }, { pos: [0.8, 0.6, 4.3], look: [-0.45, 1.3, 1.75], fov: 56 }],
    ]}>
      <Stairs7 /><StairsExtras f={f} />
      <Steps f={f} pts={[[-0.67, 2.2, 2.6], [-0.6, 1.95, 2.6], [-0.55, 1.75, 2.6]]} />
      <Puffs f={f} at={[[5, -0.64, 2.05, 1], [13, -0.58, 1.85, 1]]} />
      <Bot pos={[x, 0, z]} ry={Math.PI * 0.82} p={p} f={f} />
      <Aura f={f} pos={[x, 0, z]} seed="st" k={0.7 + boost * 0.6} n={44} />
      <pointLight position={[-0.4, 1.9, 3.3]} intensity={1.4} distance={2.5} color="#9fb4ff" />
    </Stage>
  );
};
export const LivingScene3: React.FC<{ f: number; len: number }> = ({ f, len }) => {
  const turn = interpolate(f, [6, 30], [0, 1], { ...clamp, easing: sm });
  const p = idleBP(f, { ...STAND, headY: -150 * turn, headX: 2, twist: -12 * turn });
  return (
    <Stage f={f} len={len} shots={[[0, { pos: [-1.5, 1.55, 2.5], look: [0.6, 1.2, -2.3], fov: 56 }, { pos: [-1.25, 1.52, 2.0], look: [0.6, 1.28, -2.3], fov: 54 }]]}>
      <Living7 /><LivingExtras f={f} />
      <Steps f={f} pts={[[0.2, -0.6, 3.1], [0.35, -1.1, 3.1], [0.5, -1.6, 3.1]]} />
      <Bot pos={[0.55, 0, -2.0]} ry={Math.PI} p={p} f={f} glow={interpolate(f, [28, 34], [0, 1], clamp)} />
      <pointLight position={[0.0, 1.8, -1.2]} intensity={1.3} distance={2.5} color="#9fb4ff" />
    </Stage>
  );
};
export const BathScene3: React.FC<{ f: number; len: number }> = ({ f, len }) => {
  const w = f / 3.2;
  const p: BP = { ...idleBP(f, STAND), headX: 28, lArmX: -62, lArmZ: 28, lElbow: -64, rArmX: -55 + Math.sin(w) * 10, rArmZ: -18 + Math.cos(w) * 12, rElbow: -70 + Math.sin(w) * 14 };
  const wrap = interpolate(f, [0, len], [0.25, 1], clamp);
  return (
    <Stage f={f} len={len} shots={[[0, { pos: [1.85, 1.6, 0.95], look: [0.5, 1.28, -1.85], fov: 54 }, { pos: [1.7, 1.58, 0.7], look: [0.5, 1.3, -1.85], fov: 52 }]]}>
      <Bath8 f={f} />
      <Bot pos={[0.75, 0, -1.08]} ry={Math.PI} p={p} f={f} lHandItem={<mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.055, 0.026, 8, 24, Math.PI * 2 * wrap]} /><meshStandardMaterial color="#f7f6f0" /></mesh>} />
      <pointLight position={[1.4, 1.9, -0.3]} intensity={1.2} distance={2.5} color="#9fb4ff" />
    </Stage>
  );
};
export const OfficeScene3: React.FC<{ f: number; len: number }> = ({ f, len }) => {
  const typing = f < 60 || (f > 130 && f < 165);
  const tap = typing ? Math.sin(f * 1.1) * 4 : 0, tap2 = typing ? Math.sin(f * 1.3 + 1) * 4 : 0;
  const p: BP = { ...TYPE, rElbow: TYPE.rElbow + tap, lElbow: TYPE.lElbow + tap2, headX: TYPE.headX + Math.sin(f / 20) * 2, bob: TYPE.bob + Math.sin(f / 24) * 0.004, twist: Math.sin(f / 40) * 3 };
  const stage = f < 12 ? 0 : f < 36 ? 1 : 2 + Math.min(4, Math.floor((f - 36) / 14));
  return (
    <Stage f={f} len={len} shots={[
      [0, { pos: [1.6, 1.42, 1.1], look: [-0.1, 0.95, -1.7], fov: 58 }, { pos: [1.4, 1.4, 0.8], look: [-0.1, 0.98, -1.7], fov: 56 }],
      [60, { pos: [2.05, 1.4, -0.25], look: [-0.15, 1.0, -1.45], fov: 46 }, { pos: [1.95, 1.4, -0.35], look: [-0.15, 1.01, -1.45], fov: 45 }],
      [130, { pos: [-1.4, 1.7, 1.6], look: [0, 1.0, -1.4], fov: 56 }, { pos: [-1.2, 1.66, 1.25], look: [0, 1.02, -1.4], fov: 55 }],
    ]}>
      <Office7 /><OfficeExtras f={f} stage={stage} />
      <Bot pos={[0, 0, -1.08]} ry={Math.PI + Math.sin(f / 40) * 0.04} p={p} f={f} />
      <pointLight position={[-0.05, 1.15, -1.45]} intensity={2.4 + Math.sin(f / 2) * 0.35 + (Math.floor(f / 3) % 5 === 0 ? 0.8 : 0)} distance={2.6} color="#8fbfff" />
    </Stage>
  );
};

/** the 3D killer rendered alone (transparent background) so it can stand inside the 2D photo scenes.
 *  Canvas 600x900; with camera below, feet land at (300, ~840) in canvas px and the head top near ~20 px. */
export const BotLayer: React.FC<{ f: number; p: BP; ry?: number; rim?: string; key2?: string; lHandItem?: React.ReactNode; rHandItem?: React.ReactNode; light?: number }> = ({ f, p, ry = Math.PI, rim = "#fff1cc", key2 = "#ffd9a0", lHandItem, rHandItem, light = 1 }) => (
  <ThreeCanvas width={600} height={900} style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", background: "transparent" }} camera={{ fov: 30, position: [0, 1.0, 4.2], near: 0.05, far: 30 }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}>
    <Rig pos={[0, 1.0, 4.2]} look={[0, 1.0, 0]} fov={30} />
    <ambientLight intensity={0.35 * light} />
    <directionalLight position={[1.5, 2.5, 3]} intensity={1.1 * light} color={key2} />
    <directionalLight position={[-2, 2.2, -2.5]} intensity={2.4 * light} color={rim} />
    <pointLight position={[0.8, 1.6, -1.2]} intensity={1.6 * light} distance={4} color={rim} />
    <Bot pos={[0, 0, 0]} ry={ry} p={p} f={f} lHandItem={lHandItem} rHandItem={rHandItem} />
  </ThreeCanvas>
);

/** final scene: he comes down the stairs toward us (leads back into the kitchen of the opening -> loop) */
export const DownScene3: React.FC<{ f: number; len: number }> = ({ f, len }) => {
  const prog = interpolate(f, [0, len], [0, 1], clamp);
  const iF = 10.5 - prog * 11.2;                       // step index (13 steps, rise .2, run .26)
  const i0 = Math.floor(iF), fr = iF - i0;
  const stepY = (i: number) => (i < 0 ? 0 : (i + 1) * 0.2);
  const y = stepY(i0) + (stepY(i0 + 1) - stepY(i0)) * Math.max(0, fr * 2 - 1) + Math.sin(Math.PI * fr) * 0.03;
  const z = 1.8 - iF * 0.26 + (iF < 0 ? 0 : 0);
  const p = { ...walkBP(prog * Math.PI * 2 * 5.5, 0.75), lean: 8, headX: 14, lLegX: walkBP(prog * Math.PI * 11, 0.75).lLegX - 12, rLegX: walkBP(prog * Math.PI * 11, 0.75).rLegX - 12 };
  return (
    <Stage f={f} len={len} shots={[[0, { pos: [-1.35, 1.05, 4.6], look: [0.35, 1.55, 0.6], fov: 54 }, { pos: [-1.25, 1.0, 4.9], look: [0.35, 1.2, 1.2], fov: 54 }]]}>
      <Stairs7 /><StairsExtras f={f} />
      <Bot pos={[0.35, y, z]} ry={0} p={p} f={f} glow={0.6} />
      <Aura f={f} pos={[0.35, y, z]} seed="dn" k={0.8} n={40} />
      <pointLight position={[0.35, y + 2.0, z + 0.4]} intensity={1.0} distance={2.5} color="#9fb4ff" />
    </Stage>
  );
};

/** opening version of the living room: other angle, he turns his head to us while the hours tick by */
export const LivingOpen3: React.FC<{ f: number; len: number }> = ({ f, len }) => {
  const turn = interpolate(f, [20, 50], [0, 1], { ...clamp, easing: sm });
  const p = idleBP(f, { ...STAND, headY: 150 * turn, headX: 2, twist: 12 * turn });
  return (
    <Stage f={f} len={len} shots={[[0, { pos: [1.7, 1.45, 1.7], look: [0.45, 1.3, -2.2], fov: 54 }, { pos: [1.5, 1.45, 1.35], look: [0.45, 1.32, -2.2], fov: 53 }]]}>
      <Living7 /><LivingExtras f={f + 60} />
      <Bot pos={[0.55, 0, -2.0]} ry={Math.PI} p={p} f={f} glow={interpolate(f, [46, 54], [0, 1], clamp)} />
      <Aura f={f} pos={[0.55, 0, -2.0]} seed="lo" k={0.7} n={36} />
      <pointLight position={[0.9, 1.8, -1.2]} intensity={1.3} distance={2.5} color="#9fb4ff" />
    </Stage>
  );
};
