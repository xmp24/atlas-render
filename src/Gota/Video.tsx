import React from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, Sequence, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { noise2D } from "@remotion/noise";
import "@fontsource/oswald/500.css";
import "@fontsource/oswald/600.css";
import "@fontsource/oswald/700.css";
import { Rig } from "../Miya3/Kit3";
import { textTex } from "../Miya3/Sets3";
import { Bot, STAND, BP, walkBP, mixBP } from "../Miya8/Bot3";
import { Dungeon, Table, DripRig, Drops, Contact, stoneTex, FOREHEAD, SPOUT, VALVE } from "./Dungeon";
import WORDS from "./words.json";

const W = 1080, H = 1920, INK = "#151517", RED = "#c8102e";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ez = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const eo = (t: number) => 1 - Math.pow(1 - t, 3);
const L3 = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k) as [number, number, number];
type Cam = { pos: [number, number, number]; look: [number, number, number]; fov: number };
type Shot = [number, Cam, Cam];

/** scene start frames (30 fps), cut on the narration */
export const T = { hook: 0, drag: 168, strap: 296, stone: 490, valve: 640, first: 725, lapse: 885, sleep: 1065, death: 1200, end: 1330, fin: 1425 };
export const GOTA_FRAMES = T.fin;

/** camera with hard cuts between shots; each shot is one slow dolly, never a zoom in/out bounce */
const Stage: React.FC<{ f: number; len: number; shots: Shot[]; fog?: [number, number]; exposure?: number; children: React.ReactNode }> = ({ f, len, shots, fog = [6, 15], children }) => {
  let si = 0; for (let i = 0; i < shots.length; i++) if (f >= shots[i][0]) si = i;
  const [s0, a, b] = shots[si], s1 = si + 1 < shots.length ? shots[si + 1][0] : len;
  const k = ez(interpolate(f, [s0, s1], [0, 1], clamp));
  const hx = Math.sin(f / 23) * 0.006 + Math.sin(f / 9.7) * 0.002, hy = Math.sin(f / 31) * 0.005;
  const pos = L3(a.pos, b.pos, k); pos[0] += hx; pos[1] += hy;
  return (
    <ThreeCanvas width={W} height={H} shadows="soft" style={{ position: "absolute", background: "#000" }} camera={{ fov: a.fov, position: a.pos, near: 0.02, far: 40 }} gl={{ antialias: true, preserveDrawingBuffer: true }}>
      <Rig pos={pos} look={L3(a.look, b.look, k)} fov={a.fov + (b.fov - a.fov) * k} />
      <fog attach="fog" args={["#07070a", fog[0], fog[1]]} />
      {children}
    </ThreeCanvas>
  );
};
const C = (pos: [number, number, number], look: [number, number, number], fov = 40): Cam => ({ pos, look, fov });

// ---------- characters ----------
const PALE = "#d6cfc1";
const LIE: BP = { ...STAND, lean: 0, headX: 0, lArmX: 0, lArmZ: -7, lElbow: -4, rArmX: 0, rArmZ: 7, rElbow: -4, lLegX: 0, lLegZ: -2, lKnee: 1, rLegX: 0, rLegZ: 2, rKnee: 1 };
/** prisoner strapped face-up on the board; k = how hard he trembles, flinch = 0..1 after a drop */
const Prisoner: React.FC<{ f: number; k?: number; flinch?: number; eyes?: "scared" | "closed" | "dead"; look?: number; struggle?: number }> = ({ f, k = 0.3, flinch = 0, eyes = "scared", look = -1.15, struggle = 0 }) => {
  const n = (s: string, sp = 1.3) => noise2D(s, f / sp, 0);
  const tr = k * 0.012;
  const p: BP = { ...LIE,
    headY: look * 30 + n("hy", 4) * 10 * k + struggle * Math.sin(f / 3.1) * 14,
    headX: -flinch * 14 + n("hx", 2) * 4 * k,
    lArmX: struggle * Math.sin(f / 2.7) * 10 + n("la") * 3 * k, rArmX: struggle * Math.sin(f / 2.9 + 1) * 10 + n("ra") * 3 * k,
    lArmZ: -7 - struggle * Math.abs(Math.sin(f / 2.7)) * 6, rArmZ: 7 + struggle * Math.abs(Math.sin(f / 3.3)) * 6,
    lLegX: struggle * Math.sin(f / 3.4) * 6, rLegX: -struggle * Math.sin(f / 3.4) * 6, lKnee: 1 + struggle * Math.abs(Math.sin(f / 3.4)) * 10, rKnee: 1 + struggle * Math.abs(Math.cos(f / 3.4)) * 10,
  };
  return <Bot pos={[0.9 + n("px", 1) * tr, 0.945 + n("py", 0.9) * tr + flinch * 0.012, n("pz", 1.1) * tr]} rot={[-Math.PI / 2, 0, Math.PI / 2]} p={p} f={f} tint={PALE} eyes={eyes} hood={false} ground={false} />;
};
const Guard: React.FC<{ pos: [number, number, number]; ry: number; p: BP; f: number }> = ({ pos, ry, p, f }) => <Bot pos={pos} ry={ry} p={p} f={f} scale={1.08} helmet hood={false} />;

/** drop schedule helpers: impact frame list -> frames each drop leaves the spout (falls take 9 frames) */
const fallsFrom = (impacts: number[], slow = 1) => impacts.map((t) => t - 9 * slow);
const flinchAt = (f: number, impacts: number[]) => { let v = 0; for (const t of impacts) { const q = (f - t) / 10; if (q >= 0 && q < 1) v = Math.max(v, Math.sin(Math.PI * Math.min(1, q * 2.2)) * (1 - q)); } return v; };
const randImpacts = (seed: string, from: number, to: number, min: number, max: number) => { const o: number[] = []; let t = from; let i = 0; while (t < to) { o.push(Math.round(t)); t += min + random(seed + i++) * (max - min); } return o; };

const Room: React.FC<{ f: number; straps?: number[]; valve?: number; torch?: number; day?: number; candle?: number; children?: React.ReactNode }> = ({ f, straps = [1, 1, 1], valve = 1, torch = 1, day = 0, candle = 1, children }) => (
  <group>
    <Dungeon f={f} torch={torch} day={day} candle={candle} />
    <Table straps={straps} />
    <DripRig valve={valve} />
    {/* soft key from above the board so the faces read, warm like the torches */}
    <pointLight position={[-0.3, 2.6, 1.2]} intensity={2.4 * (0.4 + 0.6 * torch)} distance={4.5} color="#ffc896" />
    <pointLight position={[-0.9, 1.7, -0.8]} intensity={0.7} distance={2.5} color="#7a9ad8" />
    {children}
  </group>
);

// ---------- 3D scenes ----------
const HOOK_HITS = randImpacts("hk", 6, 175, 17, 30);
const HookScene: React.FC<{ f: number }> = ({ f }) => (
  <Stage f={f} len={T.drag} shots={[[0, C([-0.2, 1.7, 1.25], [-0.7, 1.0, 0], 38), C([-0.3, 1.66, 1.1], [-0.72, 1.0, 0], 37)]]}>
    <Room f={f + 3000} day={0} candle={0.3}>
      <Prisoner f={f} k={1.6} flinch={flinchAt(f, HOOK_HITS)} />
      <Drops f={f} falls={fallsFrom(HOOK_HITS)} />
    </Room>
  </Stage>
);
const DOOR: [number, number] = [1.9, -2.7], NEAR: [number, number] = [0.55, 0.95];
const DragScene: React.FC<{ f: number }> = ({ f }) => {
  const q = interpolate(f, [0, 128], [0.18, 0.82], clamp);
  const x = DOOR[0] + (NEAR[0] - DOOR[0]) * q, z = DOOR[1] + (NEAR[1] - DOOR[1]) * q;
  const ry = Math.atan2(NEAR[0] - DOOR[0], NEAR[1] - DOOR[1]);
  const rx = Math.cos(ry), rz = -Math.sin(ry), ph = f * 0.3, d = 0.6;
  const pw = walkBP(ph * 0.9, 0.45);
  const pp: BP = { ...pw, lean: 14, headX: 26 + Math.sin(f / 4) * 4, headY: Math.sin(f / 9) * 18, lArmX: -18, lArmZ: -58, lElbow: -8, rArmX: -18, rArmZ: 58, rElbow: -8, lKnee: pw.lKnee + 14, rKnee: pw.rKnee + 14 };
  const g = (side: -1 | 1, o: number): BP => { const w = walkBP(ph + o, 1); return side < 0 ? { ...w, rArmX: -22, rArmZ: 52, rElbow: -18 } : { ...w, lArmX: -22, lArmZ: -52, lElbow: -18 }; };
  return (
    <Stage f={f} len={T.strap - T.drag} shots={[[0, C([2.75, 1.55, 3.3], [1.1, 1.05, -1.2], 42), C([2.45, 1.5, 3.05], [0.95, 1.05, -0.6], 42)]]}>
      <Room f={f + 400} straps={[0, 0, 0]} valve={0} candle={0.95}>
        <Bot pos={[x, 0, z]} ry={ry} p={pp} f={f} tint={PALE} eyes="scared" hood={false} />
        <Guard pos={[x - rx * d, 0, z - rz * d]} ry={ry} p={g(-1, 0.4)} f={f} />
        <Guard pos={[x + rx * d, 0, z + rz * d]} ry={ry} p={g(1, 0.4 + Math.PI)} f={f + 50} />
        <Contact p={[x, 0, z]} s={[1.8, 1.0]} o={0.35} />
        <pointLight position={[x - 0.6, 2.3, z - 1.2]} intensity={3.5} distance={4} color="#9db6ff" />
        <pointLight position={[x + 0.8, 1.6, z + 1.2]} intensity={1.6} distance={3.5} color="#ffb070" />
      </Room>
    </Stage>
  );
};
const BUCKLES = [10, 30, 52];
const StrapScene: React.FC<{ f: number }> = ({ f }) => {
  const st = BUCKLES.map((b) => interpolate(f, [b - 8, b], [0, 1], { ...clamp, easing: eo }));
  const reach = (b: number) => interpolate(f, [b - 18, b - 6, b + 6, b + 18], [0, 1, 1, 0], clamp);
  const ra = Math.max(reach(BUCKLES[0]), reach(BUCKLES[1]) * 0.8), rb = reach(BUCKLES[2]);
  const A: BP = mixBP({ ...STAND, lArmX: -10, rArmX: -10 }, { ...STAND, lean: 32, headX: 26, lArmX: -62, lArmZ: -10, lElbow: -30, rArmX: -64, rArmZ: 10, rElbow: -30, lKnee: 14, rKnee: 14, bob: -0.04 }, ra);
  const B: BP = mixBP({ ...STAND }, { ...STAND, lean: 34, headX: 28, lArmX: -66, lArmZ: -8, lElbow: -24, rArmX: -66, rArmZ: 8, rElbow: -24, lKnee: 16, rKnee: 16, bob: -0.05 }, rb);
  const ax = interpolate(f, [0, 25, 40], [-0.2, -0.2, 0.42], { ...clamp, easing: ez });
  return (
    <Stage f={f} len={T.stone - T.strap} shots={[[0, C([0.9, 2.0, 2.5], [-0.25, 0.98, 0], 42), C([0.7, 1.95, 2.35], [-0.3, 1.0, 0], 42)]]}>
      <Room f={f + 900} straps={st} valve={0} candle={0.9}>
        <Prisoner f={f} k={0.8} struggle={interpolate(f, [0, 60, 90], [1, 0.6, 0.15], clamp)} look={-0.6 + Math.sin(f / 17) * 0.6} />
        <Guard pos={[ax, 0, -0.72]} ry={0} p={A} f={f} />
        <Guard pos={[1.62, 0, 0.05]} ry={-Math.PI / 2} p={B} f={f + 30} />
      </Room>
    </Stage>
  );
};
/** the stone the lawyer watched: a drip hollowing a rock over the years */
const STONE_HITS = randImpacts("sn", 8, 160, 15, 16);
const StoneScene: React.FC<{ f: number }> = ({ f }) => {
  const rock = rockTex(), g = interpolate(f, [0, 150], [0.15, 1], clamp);
  return (
    <Stage f={f} len={T.valve - T.stone} fog={[3, 9]} shots={[[0, C([0.0, 0.7, 1.05], [0, 0.4, 0], 38), C([0.1, 0.66, 0.92], [0, 0.4, 0], 38)]]}>
      <ambientLight intensity={0.12} color="#5a6a90" />
      <spotLight position={[0.8, 2.2, 1.2]} target-position={[0, 0.3, 0]} angle={0.5} penumbra={0.8} intensity={11} distance={6} color="#cfdcf2" castShadow />
      <pointLight position={[-1.0, 0.8, 0.4]} intensity={1.2} distance={3} color="#ff9a4a" />
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[8, 8]} /><meshStandardMaterial map={stoneTex("f2", [70, 66, 60], 6, 6)} roughness={0.9} /></mesh>
      <mesh position={[0, 0.1, 0]} scale={[1, 0.45, 0.85]} castShadow receiveShadow><sphereGeometry args={[0.5, 40, 24]} /><meshStandardMaterial map={rock} roughness={0.85} /></mesh>
      {/* the hollow, deeper as the years pass */}
      <mesh position={[0, 0.322, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.03 + 0.07 * g, 32]} /><meshStandardMaterial color="#1a1612" roughness={0.3} /></mesh>
      <mesh position={[0, 0.323, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.03 + 0.07 * g, 0.045 + 0.085 * g, 32]} /><meshStandardMaterial color="#3a332c" roughness={0.6} transparent opacity={0.8} /></mesh>
      <mesh position={[0, 0.3235, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[(0.03 + 0.07 * g) * 0.75, 32]} /><meshStandardMaterial color="#4e6c80" roughness={0.05} metalness={0.4} transparent opacity={0.75} /></mesh>
      <mesh position={[0, 1.2, -1.6]}><planeGeometry args={[6, 3]} /><meshStandardMaterial map={stoneTex("w", [120, 110, 98], 3, 1.5)} roughness={0.95} /></mesh>
      {/* stalactite */}
      <mesh position={[0, 1.55, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.07, 0.5, 14]} /><meshStandardMaterial map={rock} roughness={0.6} /></mesh>
      <DropsAt f={f} falls={STONE_HITS} top={1.3} bottom={0.324} />
    </Stage>
  );
};
const rockTex = () => { const t = textTex("rock", 512, 512, (c) => {
  c.fillStyle = "#6e665c"; c.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2600; i++) { const v = 60 + random("rk" + i) * 70; c.fillStyle = `rgba(${v},${v - 6},${v - 14},${0.25 + random("ra" + i) * 0.4})`; const r = 2 + random("rr" + i) * 14; c.beginPath(); c.arc(random("rx" + i) * 512, random("ry" + i) * 512, r, 0, 7); c.fill(); }
  for (let i = 0; i < 14; i++) { c.strokeStyle = "rgba(30,26,22,0.5)"; c.lineWidth = 1.5; c.beginPath(); let x = random("cx" + i) * 512, y = random("cy" + i) * 512; c.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (random(`c${i}${k}`) - 0.5) * 80; y += (random(`d${i}${k}`) - 0.5) * 80; c.lineTo(x, y); } c.stroke(); }
}); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 1); return t; };
/** simple drops between two heights at x=z=0 (used for the stone) */
const DropsAt: React.FC<{ f: number; falls: number[]; top: number; bottom: number }> = ({ f, falls, top, bottom }) => (
  <group>
    {falls.map((t, i) => { const q = (f - t + 12) / 12; if (q < 0 || q > 2) return null;
      if (q <= 1) return <mesh key={i} position={[0, top - (top - bottom) * q * q, 0]} scale={[0.85, 1.35, 0.85]}><sphereGeometry args={[0.018, 12, 10]} /><meshPhysicalMaterial color="#d8eef8" roughness={0.05} transmission={0.6} transparent opacity={0.92} emissive="#335566" emissiveIntensity={0.3} /></mesh>;
      const s = q - 1; return <mesh key={i} position={[0, bottom + 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.01 + s * 0.09, 0.016 + s * 0.1, 24]} /><meshBasicMaterial color="#d8eef8" transparent opacity={(1 - s) * 0.7} side={THREE.DoubleSide} /></mesh>; })}
  </group>
);
const ValveScene: React.FC<{ f: number }> = ({ f }) => {
  const v = interpolate(f, [18, 58], [0, 0.75], { ...clamp, easing: ez });
  const hand = interpolate(f, [4, 16, 60, 72], [0, 1, 1, 0], clamp);
  const G: BP = mixBP({ ...STAND }, { ...STAND, headX: -16, rArmX: -148, rArmZ: 4, rElbow: -14 + Math.sin(f / 3) * 6 * (f > 18 && f < 58 ? 1 : 0) }, hand);
  return (
    <Stage f={f} len={T.first - T.valve} shots={[[0, C([0.4, 1.55, 2.2], [-0.72, 1.38, 0.1], 40), C([0.28, 1.53, 2.05], [-0.74, 1.38, 0.1], 40)]]}>
      <Room f={f + 1400} valve={v} candle={0.88}>
        <Prisoner f={f} k={0.9} look={-0.9} />
        <Guard pos={[-0.95, 0, 0.62]} ry={Math.PI + 0.25} p={G} f={f} />
        <Drops f={f} falls={[78]} />
      </Room>
    </Stage>
  );
};
const FIRST_HITS = [99, 141];
const FirstScene: React.FC<{ f: number }> = ({ f }) => (
  <Stage f={f} len={T.lapse - T.first} shots={[[0, C([-0.2, 1.38, 1.8], [-0.74, 1.12, 0], 36), C([-0.27, 1.36, 1.65], [-0.75, 1.12, 0], 36)]]}>
    <Room f={f + 1800} candle={0.85}>
      <Prisoner f={f} k={0.35} flinch={flinchAt(f, FIRST_HITS)} eyes={FIRST_HITS.some((t) => f >= t && f < t + 5) ? "closed" : "scared"} />
      <Drops f={f} falls={[FIRST_HITS[0] - 20]} slow={2.2} />
      <Drops f={f} falls={[FIRST_HITS[1] - 9]} />
    </Room>
  </Stage>
);
const LAPSE_HITS = randImpacts("lp", 0, 182, 2, 7);
const LapseScene: React.FC<{ f: number }> = ({ f }) => {
  const q = interpolate(f, [0, 180], [0, 1], clamp);
  const day = 0.5 - 0.5 * Math.cos(q * Math.PI * 2 * 2.5);
  return (
    <Stage f={f} len={T.sleep - T.lapse} shots={[[0, C([1.55, 2.25, 2.5], [-0.25, 0.95, 0], 40), C([1.35, 2.15, 2.3], [-0.3, 0.98, 0], 40)]]}>
      <Room f={f * 7} candle={interpolate(q, [0, 1], [0.85, 0.12])} day={day} torch={0.55 + 0.45 * (1 - day)}>
        <Prisoner f={f * 2} k={0.6 + q * 1.4} flinch={flinchAt(f, LAPSE_HITS) * 0.6} struggle={q * 0.4} />
        <Drops f={f} falls={fallsFrom(LAPSE_HITS)} />
      </Room>
    </Stage>
  );
};
const SLEEP_HITS = [34, 112];
const SleepScene: React.FC<{ f: number }> = ({ f }) => {
  const drowsy = f < SLEEP_HITS[0];
  return (
    <Stage f={f} len={T.death - T.sleep} shots={[[0, C([-0.28, 1.72, 1.1], [-0.7, 1.0, 0], 37), C([-0.34, 1.68, 1.0], [-0.71, 1.0, 0], 36)], [42, C([0.7, 1.6, 1.3], [0.05, 0.98, 0], 38), C([0.62, 1.58, 1.22], [0.0, 0.98, 0], 38)], [80, C([-0.2, 1.38, 1.8], [-0.74, 1.12, 0], 36), C([-0.26, 1.37, 1.7], [-0.75, 1.12, 0], 36)]]}>
      <Room f={f + 2600} candle={0.15} torch={0.8}>
        <pointLight position={[0.3, 1.8, 1.0]} intensity={f >= 42 && f < 80 ? 2.5 : 0} distance={2.5} color="#ffc896" />
        <Prisoner f={f} k={1.4} flinch={flinchAt(f, SLEEP_HITS)} eyes={drowsy && f > 8 && f < 32 ? "closed" : "scared"} struggle={f >= 42 && f < 80 ? 1 : 0} />
        <Drops f={f} falls={fallsFrom(SLEEP_HITS)} />
        <Drops f={f} falls={[SLEEP_HITS[1] + 60]} />
      </Room>
    </Stage>
  );
};
const DEATH_HITS = [16, 38, 54, 66];
const LAST = 100;
const DeathScene: React.FC<{ f: number }> = ({ f }) => {
  const dead = f >= LAST + 4, still = interpolate(f, [LAST, LAST + 14], [1, 0], clamp);
  const torch = interpolate(f, [70, 125], [0.8, 0.28], clamp);
  return (
    <Stage f={f} len={T.end - T.death} shots={[[0, C([-0.25, 1.74, 1.1], [-0.7, 1.0, 0], 37), C([-0.3, 1.7, 1.0], [-0.71, 1.0, 0], 36)], [76, C([-0.32, 1.42, 1.0], [-0.74, 1.3, 0], 32), C([-0.2, 1.75, 1.3], [-0.7, 1.15, 0], 34)]]}>
      <Room f={f + 3300} candle={0.12} torch={torch}>
        <Prisoner f={f} k={2.2 * still} flinch={flinchAt(f, DEATH_HITS) * still + (f >= LAST && f < LAST + 8 ? 0.4 : 0)} eyes={dead ? "dead" : "scared"} struggle={f < 60 ? 0.5 : 0} />
        <Drops f={f} falls={fallsFrom(DEATH_HITS)} />
        <Drops f={f} falls={[LAST - 24]} slow={2.7} />
      </Room>
    </Stage>
  );
};
const END_HITS = randImpacts("en", 20, 100, 26, 26);
const EndScene: React.FC<{ f: number }> = ({ f }) => (
  <Stage f={f} len={T.fin - T.end} shots={[[0, C([0.6, 2.9, 1.7], [-0.3, 0.92, 0], 40), C([0.48, 3.0, 1.55], [-0.32, 0.9, 0], 40)]]}>
    <Room f={f + 3500} candle={0.1} torch={0.3}>
      <Prisoner f={f} k={0} eyes="dead" />
      <Drops f={f} falls={fallsFrom(END_HITS)} />
    </Room>
  </Stage>
);

// ---------- 2D overlays ----------
const font: React.CSSProperties = { fontFamily: "Oswald", fontWeight: 700, textTransform: "uppercase", color: "#fff", WebkitTextStroke: `8px ${INK}`, paintOrder: "stroke fill", textShadow: "0 6px 18px rgba(0,0,0,0.8)" };
const Chip: React.FC<{ f: number; s: number; top: number; children: React.ReactNode; red?: boolean }> = ({ f, s, top, children, red }) => {
  const p = interpolate(f, [s, s + 7], [0, 1], { ...clamp, easing: eo });
  if (p <= 0) return null;
  return <div style={{ position: "absolute", top, width: "100%", display: "flex", justifyContent: "center", opacity: p, transform: `translateY(${(1 - p) * -24}px)` }}>
    <div style={{ padding: "10px 30px 14px", borderRadius: 14, background: red ? RED : "rgba(12,12,14,0.82)", border: "2px solid rgba(255,255,255,0.15)", boxShadow: "0 10px 30px rgba(0,0,0,0.6)", fontFamily: "Oswald", fontWeight: 600, fontSize: 52, letterSpacing: 3, color: "#fff", textTransform: "uppercase" }}>{children}</div>
  </div>;
};
const fmt = (n: number) => Math.floor(n).toLocaleString("en-US");
const HookHUD: React.FC<{ f: number }> = ({ f }) => {
  const drops = 21604 + HOOK_HITS.filter((t) => f >= t).length;
  const flash = HOOK_HITS.some((t) => f >= t && f < t + 3);
  return <>
    <Chip f={f} s={4} top={210}><span style={{ color: "#ff4848" }}>DAY 3</span>&nbsp;&nbsp;·&nbsp;&nbsp;DROP #{fmt(drops)}</Chip>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(120,0,10,0.35) 100%)", opacity: flash ? 1 : 0.35 }} />
  </>;
};
const DragHUD: React.FC<{ f: number }> = ({ f }) => {
  const p = interpolate(f, [8, 18], [0, 1], { ...clamp, easing: eo }), sk = interpolate(f, [96, 106], [0, 1], { ...clamp, easing: eo });
  const not = interpolate(f, [104, 112], [0, 1], { ...clamp, easing: eo });
  if (p <= 0) return null;
  return <div style={{ position: "absolute", top: 200, width: "100%", textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * -30}px)` }}>
    <div style={{ ...font, fontSize: 70, lineHeight: 1.05, letterSpacing: 2 }}>
      <span style={{ position: "relative", display: "inline-block", color: sk > 0.5 ? "#9a9aa0" : "#fff" }}>CHINESE
        <div style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 12, background: RED, transform: `scaleX(${sk}) rotate(-4deg)`, transformOrigin: "left", borderRadius: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.6)" }} />
      </span>
      <br />WATER TORTURE</div>
    {not > 0 && <div style={{ display: "inline-block", marginTop: 18, padding: "6px 24px 10px", background: RED, borderRadius: 10, fontFamily: "Oswald", fontWeight: 700, fontSize: 46, color: "#fff", letterSpacing: 2, opacity: not, transform: `scale(${0.9 + 0.1 * not})` }}>NOT FROM CHINA</div>}
  </div>;
};
const OriginCard: React.FC<{ f: number }> = ({ f }) => {
  const p = interpolate(f, [62, 74], [0, 1], { ...clamp, easing: eo }), name = "Hippolytus de Marsiliis";
  if (p <= 0) return null;
  const n = Math.max(0, Math.min(name.length, Math.floor((f - 108) / 1.3)));
  return <div style={{ position: "absolute", top: 170, left: 120, right: 120, opacity: p, transform: `translateY(${(1 - p) * -40}px) rotate(-1.5deg)` }}>
    <div style={{ position: "relative", padding: "34px 40px 38px", borderRadius: 8, background: "radial-gradient(ellipse at 40% 30%, #efe0bb, #d3bc8a 70%, #a98a55)", boxShadow: "0 24px 60px rgba(0,0,0,0.7), inset 0 0 60px rgba(90,60,20,0.45)", fontFamily: "Oswald", color: "#2a1c10", textAlign: "center" }}>
      <div style={{ fontWeight: 500, fontSize: 34, letterSpacing: 8, opacity: 0.75 }}>FIRST DESCRIBED IN</div>
      <div style={{ fontWeight: 700, fontSize: 82, lineHeight: 1.05, letterSpacing: 2 }}>BOLOGNA, ITALY</div>
      <div style={{ fontWeight: 600, fontSize: 48, color: "#8a1a14" }}>c. 1500</div>
      <div style={{ height: 3, background: "rgba(60,35,15,0.4)", margin: "18px 40px" }} />
      <div style={{ fontWeight: 700, fontSize: 52, minHeight: 66 }}>{name.slice(0, n)}<span style={{ opacity: n < name.length && f % 14 < 7 ? 1 : 0 }}>|</span></div>
      <div style={{ fontWeight: 500, fontSize: 32, opacity: interpolate(f, [150, 160], [0, 0.75], clamp) }}>LAWYER · 1451 – 1529</div>
      <div style={{ position: "absolute", right: -26, bottom: -30, width: 110, height: 110, borderRadius: 55, background: "radial-gradient(circle at 40% 35%, #c8302a, #7a120e)", boxShadow: "0 6px 16px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 30, color: "#f0c8b0", transform: `scale(${interpolate(f, [80, 88], [2.2, 1], { ...clamp, easing: eo })})`, opacity: interpolate(f, [80, 84], [0, 1], clamp) }}>1500</div>
    </div>
  </div>;
};
const StoneHUD: React.FC<{ f: number }> = ({ f }) => {
  const yrs = interpolate(f, [10, 150], [1, 100], { ...clamp, easing: (t) => t * t });
  return <Chip f={f} s={6} top={210}>DROP BY DROP&nbsp;·&nbsp;<span style={{ color: "#8fd0ff" }}>{Math.round(yrs)} {Math.round(yrs) === 1 ? "YEAR" : "YEARS"}</span></Chip>;
};
const FirstHUD: React.FC<{ f: number }> = ({ f }) => {
  const n = FIRST_HITS.filter((t) => f >= t).length;
  return n > 0 ? <Chip f={f} s={FIRST_HITS[0]} top={210}>DROP #{n}</Chip> : null;
};
const Clock: React.FC<{ f: number }> = ({ f }) => {
  const q = interpolate(f, [0, 180], [0, 1], clamp), hrs = q * 72;
  const label = hrs < 24 ? `HOUR ${Math.max(1, Math.floor(hrs) + 1)}` : `DAY ${Math.floor(hrs / 24) + 1}`;
  const drops = Math.floor(Math.pow(q, 1.4) * 24000) + 2;
  const p = interpolate(f, [0, 8], [0, 1], { ...clamp, easing: eo });
  return <div style={{ position: "absolute", top: 170, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", opacity: p }}>
    <svg width={190} height={190} viewBox="-100 -100 200 200" style={{ filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.7))" }}>
      <circle r={92} fill="#121214" stroke="#e8e2d4" strokeWidth={8} />
      {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={0} y1={-78} x2={0} y2={i % 3 ? -70 : -62} stroke="#e8e2d4" strokeWidth={i % 3 ? 3 : 6} transform={`rotate(${i * 30})`} />)}
      <line x1={0} y1={0} x2={0} y2={-46} stroke="#e8e2d4" strokeWidth={8} strokeLinecap="round" transform={`rotate(${hrs * 30})`} />
      <line x1={0} y1={0} x2={0} y2={-70} stroke={RED} strokeWidth={5} strokeLinecap="round" transform={`rotate(${hrs * 360})`} />
      <circle r={7} fill="#e8e2d4" />
    </svg>
    <div style={{ ...font, fontSize: 92, marginTop: 6, color: hrs >= 24 ? "#ff4848" : "#fff" }}>{label}</div>
    <div style={{ fontFamily: "Oswald", fontWeight: 600, fontSize: 44, color: "#cfe6f2", letterSpacing: 2, textShadow: "0 4px 12px #000" }}>{fmt(drops)} DROPS</div>
  </div>;
};
const Heart: React.FC<{ f: number; bpm: number; o?: number }> = ({ f, bpm, o = 0.45 }) => {
  const per = 1800 / bpm, q = (f % per) / per, b = Math.max(Math.exp(-q * 14), Math.exp(-Math.abs(q - 0.22) * 18) * 0.7);
  return <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(140,0,14,${o * b}) 100%)`, pointerEvents: "none" }} />;
};
const DeathHUD: React.FC<{ f: number }> = ({ f }) => {
  const g = (f > 30 && f < 34) || (f > 58 && f < 61) || (f > 88 && f < 92);
  const flat = interpolate(f, [LAST + 4, LAST + 10], [0, 1], clamp);
  return <>
    {g && <AbsoluteFill style={{ background: "rgba(200,16,46,0.18)", mixBlendMode: "screen", transform: `translateX(${(random("gl" + f) - 0.5) * 30}px)` }} />}
    {f < LAST + 4 && <Heart f={f} bpm={interpolate(f, [0, LAST], [120, 175], clamp)} o={0.6} />}
    <AbsoluteFill style={{ background: "#000", opacity: flat * 0.25 }} />
  </>;
};
const EndHUD: React.FC<{ f: number }> = ({ f }) => {
  const a = interpolate(f, [4, 14], [0, 1], { ...clamp, easing: eo }), b = interpolate(f, [50, 60], [0, 1], { ...clamp, easing: eo });
  return <>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 35%, transparent 70%, rgba(0,0,0,0.5) 100%)" }} />
    <div style={{ position: "absolute", top: 230, width: "100%", textAlign: "center", opacity: a, transform: `translateY(${(1 - a) * -30}px)` }}>
      <div style={{ ...font, fontSize: 112, lineHeight: 1.02, letterSpacing: 2 }}>DID YOU KNOW<br /><span style={{ color: "#ff4848" }}>THIS TORTURE?</span></div>
    </div>
    <div style={{ position: "absolute", top: 1320, width: "100%", textAlign: "center", opacity: b, transform: `translateY(${(1 - b) * 30}px)` }}>
      <span style={{ display: "inline-block", padding: "12px 36px 16px", borderRadius: 14, background: RED, fontFamily: "Oswald", fontWeight: 700, fontSize: 60, color: "#fff", letterSpacing: 3, boxShadow: "0 10px 30px rgba(0,0,0,0.6)" }}>COMMENT BELOW 👇</span>
    </div>
  </>;
};

// ---------- assembly ----------
const Sc = (S3: React.FC<{ f: number }>, HUD?: React.FC<{ f: number }>): React.FC<{ f: number }> => ({ f }) => <>{<S3 f={f} />}{HUD && <HUD f={f} />}</>;
const SleepHUD: React.FC<{ f: number }> = ({ f }) => <Heart f={f} bpm={110} />;
const LIST: [number, number, React.FC<{ f: number }>][] = [
  [T.hook, T.drag, Sc(HookScene, HookHUD)], [T.drag, T.strap, Sc(DragScene, DragHUD)], [T.strap, T.stone, Sc(StrapScene, OriginCard)], [T.stone, T.valve, Sc(StoneScene, StoneHUD)],
  [T.valve, T.first, Sc(ValveScene)], [T.first, T.lapse, Sc(FirstScene, FirstHUD)], [T.lapse, T.sleep, Sc(LapseScene, Clock)], [T.sleep, T.death, Sc(SleepScene, SleepHUD)],
  [T.death, T.end, Sc(DeathScene, DeathHUD)], [T.end, T.fin, Sc(EndScene, EndHUD)],
];
const XF = 5;
const Scene: React.FC<{ C: React.FC<{ f: number }>; i: number }> = ({ C: Comp, i }) => {
  const g = useCurrentFrame(), f = g - (i > 0 ? XF : 0);
  const op = i > 0 ? interpolate(g, [0, XF], [0, 1], clamp) : 1;
  return <AbsoluteFill style={{ opacity: op }}><Comp f={f} /></AbsoluteFill>;
};
const Subs: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= T.end) return null;
  const words = WORDS as { w: string; a: number; b: number; k: boolean; g: number }[];
  const i = words.findIndex((x) => f >= x.a - 2 && f < x.b + 5);
  if (i < 0) return null;
  const grp = words.filter((x) => x.g === words[i].g);
  const appear = interpolate(f, [grp[0].a - 2, grp[0].a + 2], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", top: 1290, width: "100%", textAlign: "center", padding: "0 90px", boxSizing: "border-box", opacity: appear }}>
      {grp.map((x, j) => {
        let ci = -1; grp.forEach((y, k) => { if (f >= y.a) ci = k; });
        const on = f >= x.a, cur = j === ci && f < x.b + 4;
        return (
          <span key={j} style={{ display: "inline-block", margin: "6px 10px", padding: "2px 14px 6px", borderRadius: 10, background: cur ? RED : "transparent", boxShadow: cur ? "0 6px 16px rgba(0,0,0,0.55)" : "none",
            fontFamily: "Oswald", fontWeight: 700, fontSize: 88, lineHeight: 1.1, letterSpacing: 1, textTransform: "uppercase",
            color: cur ? "#fff" : x.k ? "#ff4848" : "#fff", opacity: on ? 1 : 0.45, WebkitTextStroke: cur ? "0px" : `9px ${INK}`, paintOrder: "stroke fill", textShadow: "0 4px 14px rgba(0,0,0,0.85)" }}>{x.w}</span>
        );
      })}
    </div>
  );
};
const Grade: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={W} height={H} style={{ position: "absolute", opacity: 0.12, mixBlendMode: "overlay" }}><filter id="gng"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 11} /></filter><rect width={W} height={H} filter="url(#gng)" /></svg>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,30,50,0.14), rgba(50,25,10,0.10))", mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 52%, rgba(0,0,0,0.5) 100%)" }} />
    </AbsoluteFill>
  );
};
export const Gota: React.FC<{ audio?: boolean; subs?: boolean }> = ({ audio = false, subs = true }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    {LIST.map(([a, b, Comp], i) => <Sequence key={i} from={i > 0 ? a - XF : a} durationInFrames={b - a + (i > 0 ? XF : 0)}><Scene C={Comp} i={i} /></Sequence>)}
    <Grade />
    {subs && <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 64%, rgba(0,0,0,0.38) 70%, rgba(0,0,0,0.38) 80%, transparent 88%)", pointerEvents: "none" }} />}
    {subs && <Subs />}
    {audio && <Audio src={staticFile("gota/mix.wav")} />}
  </AbsoluteFill>
);
