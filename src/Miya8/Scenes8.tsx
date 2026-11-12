import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { interpolate } from "remotion";
import { Rig } from "../Miya3/Kit3";
import { Bot, Aura, STAND, TYPE, idleBP, mixBP, BP, walkBP } from "./Bot3";
import { ReiRoom7, Stairs7, Living7, Office7, ReiExtras, StairsExtras, LivingExtras, OfficeExtras, Bath8 } from "./Rooms8";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ez = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const L3 = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k) as [number, number, number];
type Cam = { pos: [number, number, number]; look: [number, number, number]; fov: number };

const Stage: React.FC<{ f: number; len: number; a: Cam; b: Cam; children: React.ReactNode; cut?: [number, Cam, Cam] }> = ({ f, len, a: a0, b: b0, children, cut }) => {
  let a = a0, b = b0, k = ez(interpolate(f, [0, len], [0, 1], clamp));
  if (cut && f >= cut[0]) { a = cut[1]; b = cut[2]; k = ez(interpolate(f, [cut[0], len], [0, 1], clamp)); }
  // subtle handheld breathing of the camera operator
  const hx = Math.sin(f / 23) * 0.012 + Math.sin(f / 9.7) * 0.004, hy = Math.sin(f / 31) * 0.01;
  const pos = L3(a.pos, b.pos, k); pos[0] += hx; pos[1] += hy;
  return (
    <ThreeCanvas width={1080} height={1920} shadows="soft" style={{ position: "absolute", background: "#000" }} camera={{ fov: a.fov, position: a.pos, near: 0.05, far: 60 }} gl={{ antialias: true, preserveDrawingBuffer: true }}>
      <Rig pos={pos} look={L3(a.look, b.look, k)} fov={a.fov + (b.fov - a.fov) * k} />
      <fog attach="fog" args={["#0b0a0c", 7, 16]} />
      {children}
    </ThreeCanvas>
  );
};

export const ReiScene3: React.FC<{ f: number; len: number }> = ({ f, len }) => {
  const look = interpolate(f, [26, 70], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const wk = interpolate(f, [0, 22], [0, 1], clamp), stop = interpolate(f, [16, 26], [1, 0], clamp);
  const ph = wk * Math.PI * 2.2;
  const idle = idleBP(f, { ...STAND, headX: 14 + 8 * look, headY: -28 * look, lean: 6, twist: -6 * look });
  const p = stop > 0 ? mixBP(idle, walkBP(ph, 1), stop) : idle;
  const bx = 0.05 + (1 - (wk < 1 ? 1 - Math.pow(1 - wk, 2) : 1)) * 0.38, bz = -0.05 + (1 - (wk < 1 ? 1 - Math.pow(1 - wk, 2) : 1)) * 0.3;
  const lag = Math.max(0, wk - 0.15);
  const ax = 0.05 + (1 - (lag < 1 ? 1 - Math.pow(1 - lag, 2) : 1)) * 0.38, az = -0.05 + (1 - (lag < 1 ? 1 - Math.pow(1 - lag, 2) : 1)) * 0.3;
  return (
    <Stage f={f} len={len} a={{ pos: [1.45, 1.55, 3.0], look: [-0.45, 0.9, -1.4], fov: 66 }} b={{ pos: [1.2, 1.5, 2.5], look: [-0.5, 0.92, -1.4], fov: 63 }}>
      <ReiRoom7 /><ReiExtras f={f} />
      <Bot pos={[bx, 0, bz]} ry={-2.1} p={p} f={f} />
      <Aura f={f} pos={[ax, 0, az]} seed="rei" k={1.1} n={56} />
      <pointLight position={[0.1, 1.9, 1.0]} intensity={1.6} distance={2.5} color="#9fb4ff" />
    </Stage>
  );
};
export const StairsScene3: React.FC<{ f: number; len: number }> = ({ f, len }) => {
  const down = interpolate(f, [30, 80], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const p = idleBP(f, { ...STAND, headX: -14 + 40 * down, headY: 18 * down, lean: 4 * down });
  return (
    <Stage f={f} len={len} cut={[62, { pos: [0.9, 0.55, 4.6], look: [-0.45, 1.25, 1.75], fov: 58 }, { pos: [0.8, 0.6, 4.3], look: [-0.45, 1.3, 1.75], fov: 56 }]} a={{ pos: [-1.9, 1.15, 4.9], look: [0.45, 1.75, 0], fov: 62 }} b={{ pos: [-1.55, 1.25, 4.4], look: [0.45, 2.05, 0], fov: 60 }}>
      <Stairs7 /><StairsExtras f={f} />
      <Bot pos={[-0.55, 0, 1.75]} ry={Math.PI * 0.82} p={p} f={f} />
      <Aura f={f} pos={[-0.55, 0, 1.75]} seed="st" k={0.75} n={44} />
      <pointLight position={[-0.4, 1.9, 3.3]} intensity={1.4} distance={2.5} color="#9fb4ff" />
    </Stage>
  );
};
/** "And the killer stayed": behind the sofa, by the window; slowly turns his head to the camera */
export const LivingScene3: React.FC<{ f: number; len: number }> = ({ f, len }) => {
  const turn = interpolate(f, [6, 32], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const base: BP = { ...STAND, headY: 0, headX: 2 };
  const p = idleBP(f, { ...base, headY: -150 * turn, twist: -12 * turn });
  return (
    <Stage f={f} len={len} a={{ pos: [-1.5, 1.55, 2.5], look: [0.6, 1.2, -2.3], fov: 56 }} b={{ pos: [-1.1, 1.5, 1.7], look: [0.6, 1.3, -2.3], fov: 52 }}>
      <Living7 /><LivingExtras f={f} />
      <Bot pos={[0.55, 0, -2.0]} ry={Math.PI} p={p} f={f} />
      <pointLight position={[0.0, 1.8, -1.2]} intensity={1.3} distance={2.5} color="#9fb4ff" />
    </Stage>
  );
};
/** bandaging his hand at the sink */
export const BathScene3: React.FC<{ f: number; len: number }> = ({ f, len }) => {
  const w = f / 3.2;
  const p: BP = { ...idleBP(f, STAND), headX: 28, lArmX: -62, lArmZ: 28, lElbow: -64, rArmX: -55 + Math.sin(w) * 10, rArmZ: -18 + Math.cos(w) * 12, rElbow: -70 + Math.sin(w) * 14 };
  const wrap = interpolate(f, [0, len], [0.25, 1], clamp);
  return (
    <Stage f={f} len={len} a={{ pos: [1.55, 1.6, 1.25], look: [0.62, 1.2, -1.7], fov: 54 }} b={{ pos: [1.35, 1.55, 0.75], look: [0.65, 1.25, -1.7], fov: 50 }}>
      <Bath8 f={f} />
      <Bot pos={[0.75, 0, -1.08]} ry={Math.PI} p={p} f={f} lHandItem={<mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.055, 0.026, 8, 24, Math.PI * 2 * wrap]} /><meshStandardMaterial color="#f7f6f0" /></mesh>} />
      <pointLight position={[1.4, 1.9, -0.3]} intensity={1.2} distance={2.5} color="#9fb4ff" />
    </Stage>
  );
};
export const OfficeScene3: React.FC<{ f: number; len: number }> = ({ f, len }) => {
  const tap = Math.sin(f * 1.1) * 4, tap2 = Math.sin(f * 1.3 + 1) * 4;
  const p: BP = { ...TYPE, rElbow: TYPE.rElbow + tap, lElbow: TYPE.lElbow + tap2, headX: TYPE.headX + Math.sin(f / 20) * 2, bob: TYPE.bob + Math.sin(f / 24) * 0.004 };
  return (
    <Stage f={f} len={len} a={{ pos: [1.6, 1.42, 1.1], look: [-0.1, 0.95, -1.7], fov: 58 }} b={{ pos: [1.25, 1.38, 0.55], look: [-0.1, 1.0, -1.7], fov: 54 }}>
      <Office7 /><OfficeExtras f={f} stage={f > 12 ? 1 : 0} />
      <Bot pos={[0, 0, -1.08]} ry={Math.PI} p={p} f={f} />
      <pointLight position={[-0.05, 1.15, -1.45]} intensity={2.4 + Math.sin(f / 2) * 0.35 + (Math.floor(f / 3) % 5 === 0 ? 0.8 : 0)} distance={2.6} color="#8fbfff" />
    </Stage>
  );
};
export const RoomTest: React.FC<{ room: string }> = ({ room }) => {
  const f = 30;
  const C = { rei: ReiScene3, stairs: StairsScene3, living: LivingScene3, bath: BathScene3, office: OfficeScene3 }[room]!;
  return <C f={f} len={60} />;
};
