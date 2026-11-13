import React, { useLayoutEffect } from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, Sequence, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { noise2D } from "@remotion/noise";
import "@fontsource/oswald/500.css";
import "@fontsource/oswald/600.css";
import "@fontsource/oswald/700.css";
import { textTex } from "../Miya3/Sets3";
import { Bot, STAND, BP, walkBP, mixBP } from "../Miya8/Bot3";
import { Dungeon, Table, DripRig, Drop, Wet, Contact, masonry, useEnv, waterMat, glowTex, FOREHEAD, SPOUT, HEAD } from "./Dungeon2";
import WORDS from "./words2.json";

const W = 1080, H = 1920, INK = "#151517", RED = "#c8102e";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ez = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const eo = (t: number) => 1 - Math.pow(1 - t, 3);
const L3 = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k) as [number, number, number];
type Cam = { pos: [number, number, number]; look: [number, number, number]; fov: number; shift?: number };
type Shot = [number, Cam, Cam];

export const T2 = { hook: 0, drag: 150, strap: 262, stone: 360, first: 458, lapse: 552, sleep: 686, death: 752, end: 870, fin: 955 };
export const GOTA2_FRAMES = T2.fin;

/** camera rig with a vertical lens shift so a face can sit above the subtitles without tilting the camera */
const Rig2: React.FC<{ pos: [number, number, number]; look: [number, number, number]; fov: number; shift: number }> = ({ pos, look, fov, shift }) => {
  const { camera, gl } = useThree();
  useLayoutEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.25;
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...pos); c.lookAt(...look); c.fov = fov;
    if (shift) c.setViewOffset(W, H, 0, shift * H, W, H); else c.clearViewOffset();
    c.updateProjectionMatrix();
  });
  return null;
};
const Stage: React.FC<{ f: number; len: number; shots: Shot[]; fog?: [number, number]; children: React.ReactNode }> = ({ f, len, shots, fog = [7, 16], children }) => {
  let si = 0; for (let i = 0; i < shots.length; i++) if (f >= shots[i][0]) si = i;
  const [s0, a, b] = shots[si], s1 = si + 1 < shots.length ? shots[si + 1][0] : len;
  const k = ez(interpolate(f, [s0, s1], [0, 1], clamp));
  const hx = noise2D("hx", f / 60, 0) * 0.008, hy = noise2D("hy", f / 70, 0) * 0.006;
  const pos = L3(a.pos, b.pos, k); pos[0] += hx; pos[1] += hy;
  return (
    <ThreeCanvas width={W} height={H} shadows="soft" style={{ position: "absolute", background: "#000" }} camera={{ fov: a.fov, position: a.pos, near: 0.02, far: 40 }} gl={{ antialias: true, preserveDrawingBuffer: true }}>
      <Rig2 pos={pos} look={L3(a.look, b.look, k)} fov={a.fov + (b.fov - a.fov) * k} shift={(a.shift ?? 0) + ((b.shift ?? 0) - (a.shift ?? 0)) * k} />
      <fog attach="fog" args={["#08080b", fog[0], fog[1]]} />
      {children}
    </ThreeCanvas>
  );
};
const C = (pos: [number, number, number], look: [number, number, number], fov = 40, shift = 0): Cam => ({ pos, look, fov, shift });

// ---------- characters ----------
const PALE = "#d8d0c2";
const LIE: BP = { ...STAND, lean: 0, headX: 0, lArmX: 0, lArmZ: -7, lElbow: -4, rArmX: 0, rArmZ: 7, rElbow: -4, lLegX: 0, lLegZ: -2, lKnee: 1, rLegX: 0, rLegZ: 2, rKnee: 1 };
const LOOK = -1.15;
/** prisoner strapped face-up; k = tremble, flinch 0..1, struggle = pulling against the straps (smooth noise, not a sine) */
const Prisoner: React.FC<{ f: number; k?: number; flinch?: number; eyes?: "scared" | "closed" | "dead"; look?: number; struggle?: number; tired?: number; pupil?: number; xk?: number; wet?: number; sweat?: number }> = ({ f, k = 0.3, flinch = 0, eyes = "scared", look = LOOK, struggle = 0, tired = 0, pupil = 1, xk = 1, wet = 0, sweat = 0 }) => {
  const n = (s: string, sp = 1.3) => noise2D(s, f / sp, 0);
  const sn = (s: string) => noise2D(s, f / 9, 0); // slow effortful pulls
  const tr = k * 0.01;
  const p: BP = { ...LIE,
    headY: look * 30 + n("hy", 4) * 8 * k + struggle * sn("sh") * 22,
    headX: -flinch * 16 + n("hx", 2) * 4 * k - struggle * Math.abs(sn("sx")) * 10,
    lArmX: struggle * sn("la") * 14 + n("la") * 3 * k, rArmX: struggle * sn("ra") * 14 + n("ra") * 3 * k,
    lArmZ: -7 - struggle * Math.abs(sn("lz")) * 9, rArmZ: 7 + struggle * Math.abs(sn("rz")) * 9,
    lElbow: -4 - struggle * Math.abs(sn("le")) * 30, rElbow: -4 - struggle * Math.abs(sn("re")) * 30,
    lLegX: struggle * sn("ll") * 8, rLegX: struggle * sn("rl") * 8, lKnee: 1 + struggle * Math.abs(sn("lk")) * 16, rKnee: 1 + struggle * Math.abs(sn("rk")) * 16,
  };
  return <>
    <Bot pos={[0.9 + n("px", 1) * tr, 0.945 + n("py", 0.9) * tr + flinch * 0.01, n("pz", 1.1) * tr]} rot={[-Math.PI / 2, 0, Math.PI / 2]} p={p} f={f} tint={PALE} eyes={eyes} hood={false} ground={false} tired={tired} pupil={pupil} xk={xk} />
    {(wet > 0 || sweat > 0) && <Wet wet={wet} sweat={sweat} look={look} />}
  </>;
};
const Guard: React.FC<{ pos: [number, number, number]; ry: number; p: BP; f: number }> = ({ pos, ry, p, f }) => <Bot pos={pos} ry={ry} p={p} f={f} scale={1.08} helmet hood={false} />;
const flinchAt = (f: number, hits: number[]) => { let v = 0; for (const t of hits) { const q = (f - t) / 12; if (q >= 0 && q < 1) v = Math.max(v, Math.sin(Math.PI * Math.min(1, q * 2.4)) * (1 - q) * 1.2); } return Math.min(1, v); };
const randHits = (seed: string, from: number, to: number, min: number, max: number) => { const o: number[] = []; let t = from; let i = 0; while (t < to) { o.push(Math.round(t)); t += min + random(seed + i++) * (max - min); } return o; };
/** drops for a list of impact frames */
const Drops: React.FC<{ f: number; hits: number[]; slow?: number; form?: number }> = ({ f, hits, slow = 1, form = 8 }) => <>{hits.map((h, i) => <Drop key={i} f={f} t0={h - 9 * slow} slow={slow} form={Math.min(form, i > 0 ? Math.max(2, h - hits[i - 1] - 9 * slow) : form)} />)}</>;

const Room: React.FC<{ f: number; straps?: number[]; valve?: number; torch?: number; day?: number; candle?: number; door?: number; sun?: number; tspeed?: number; kl?: number; children?: React.ReactNode }> = ({ f, straps = [1, 1, 1], valve = 1, torch = 1, day = 0, candle = 1, door = 0, sun = 0.5, tspeed = 1, kl = 1, children }) => (
  <group>
    <Dungeon f={f} torch={torch} day={day} candle={candle} door={door} sun={sun} tspeed={tspeed} />
    <Table straps={straps} />
    <DripRig valve={valve} />
    <pointLight position={[-0.2, 2.5, 1.3]} intensity={2.2 * kl * (0.45 + 0.55 * torch)} distance={4.5} color="#ffc896" />
    <pointLight position={[-1.2, 1.9, -0.9]} intensity={1.0 * kl} distance={3} color="#7f9fe0" />
    <pointLight position={[-1.7, 2.1, 0.9]} intensity={1.3 * kl} distance={3.2} color="#86a6e8" />
    {children}
  </group>
);

// ---------- scenes ----------
// 1. hook: the spoiler — day 3, drops hammering, close on the face (face sits above the subtitles)
const HOOK_HITS = randHits("hk2", 8, 160, 15, 26);
const HookScene: React.FC<{ f: number }> = ({ f }) => (
  <Stage f={f} len={T2.drag} shots={[[0, C([-0.18, 1.62, 1.18], [-0.72, 1.06, 0], 36, 0.1), C([-0.3, 1.56, 1.02], [-0.73, 1.07, 0], 34, 0.1)]]}>
    <Room f={f + 3000} candle={0.3}>
      <Prisoner f={f} k={1.5} flinch={flinchAt(f, HOOK_HITS)} tired={1} sweat={1} wet={1} pupil={0.75} />
      <Drops f={f} hits={HOOK_HITS} />
    </Room>
  </Stage>
);
// 2. the guards drag him in through the door to the board
const DOOR: [number, number] = [1.9, -2.6], NEAR: [number, number] = [0.75, 0.95];
const STRIDE = 0.235; // metres per radian of walk phase (leg 0.84 m, ±24°)
const DragScene: React.FC<{ f: number }> = ({ f }) => {
  const q = interpolate(f, [0, 112], [0.06, 0.88], { ...clamp, easing: (t) => t * (1.15 - 0.15 * t) });
  const len = Math.hypot(NEAR[0] - DOOR[0], NEAR[1] - DOOR[1]), dist = q * len;
  const x = DOOR[0] + (NEAR[0] - DOOR[0]) * q, z = DOOR[1] + (NEAR[1] - DOOR[1]) * q;
  const ry = Math.atan2(NEAR[0] - DOOR[0], NEAR[1] - DOOR[1]);
  const rx = Math.cos(ry), rz = -Math.sin(ry), d = 0.56, ph = dist / STRIDE;
  const pw = walkBP(ph * 1.6, 0.35); // he stumbles with short dragging steps
  const res = noise2D("rs", f / 12, 0);
  const pp: BP = { ...pw, lean: -6 + res * 6, headX: 18 + res * 10, headY: noise2D("hy", f / 10, 0) * 30, lArmX: -12, lArmZ: -48, lElbow: -12, rArmX: -12, rArmZ: 48, rElbow: -12, lKnee: pw.lKnee + 18, rKnee: pw.rKnee + 18, bob: pw.bob - 0.05 };
  const g = (side: -1 | 1, o: number): BP => { const w = walkBP(ph + o, 0.9); return side < 0 ? { ...w, lean: 8, rArmX: -26, rArmZ: 40, rElbow: -34 } : { ...w, lean: 8, lArmX: -26, lArmZ: -40, lElbow: -34 }; };
  return (
    <Stage f={f} len={T2.strap - T2.drag} shots={[[0, C([2.85, 1.6, 3.2], [1.3, 1.05, -1.4], 42), C([2.5, 1.55, 2.95], [0.95, 1.05, -0.4], 42)]]}>
      <Room f={f + 400} straps={[0, 0, 0]} valve={0} candle={0.95} door={interpolate(f, [0, 14], [0.55, 1], { ...clamp, easing: eo })}>
        <Bot pos={[x + rx * Math.sin(ph) * 0.02, 0, z]} ry={ry + res * 0.12} p={pp} f={f} tint={PALE} eyes="scared" hood={false} />
        <Guard pos={[x - rx * d, 0, z - rz * d]} ry={ry} p={g(-1, 0.3)} f={f} />
        <Guard pos={[x + rx * d, 0, z + rz * d]} ry={ry} p={g(1, 0.3 + Math.PI)} f={f + 50} />
        <pointLight position={[x - 0.7, 2.3, z - 1.2]} intensity={3.2} distance={4} color="#9db6ff" />
        <pointLight position={[x + 0.9, 1.6, z + 1.2]} intensity={1.8} distance={3.5} color="#ffb070" />
      </Room>
    </Stage>
  );
};
// 3. strapped down; each strap is pulled tight (loose tail lifts, then cinches)
const BUCKLES = [10, 26, 42];
const StrapScene: React.FC<{ f: number }> = ({ f }) => {
  const st = BUCKLES.map((b) => interpolate(f, [b - 10, b - 3, b], [0.05, 0.55, 1], { ...clamp }));
  const reach = (b: number) => interpolate(f, [b - 14, b - 6, b + 4, b + 14], [0.2, 1, 1, 0.2], clamp);
  const ra = Math.max(reach(BUCKLES[0]), reach(BUCKLES[1])), rb = reach(BUCKLES[2]);
  const tug = (b: number) => (f > b - 6 && f < b + 2 ? Math.sin((f - b + 6) / 8 * Math.PI) : 0);
  const A: BP = mixBP({ ...STAND, lArmX: -10, rArmX: -10 }, { ...STAND, lean: 30 - tug(BUCKLES[0]) * 8 - tug(BUCKLES[1]) * 8, headX: 26, lArmX: -60, lArmZ: -10, lElbow: -30 - tug(BUCKLES[1]) * 30, rArmX: -62, rArmZ: 10, rElbow: -30 - tug(BUCKLES[0]) * 30, lKnee: 14, rKnee: 14, bob: -0.04 }, ra);
  const B: BP = mixBP({ ...STAND }, { ...STAND, lean: 32 - tug(BUCKLES[2]) * 8, headX: 28, lArmX: -64, lArmZ: -8, lElbow: -24 - tug(BUCKLES[2]) * 30, rArmX: -64, rArmZ: 8, rElbow: -24 - tug(BUCKLES[2]) * 30, lKnee: 16, rKnee: 16, bob: -0.05 }, rb);
  const ax = interpolate(f, [0, 16, 26], [-0.25, -0.25, 0.38], { ...clamp, easing: ez });
  return (
    <Stage f={f} len={T2.stone - T2.strap} shots={[[0, C([0.75, 2.05, 2.45], [-0.3, 0.98, 0], 42, 0.12), C([0.55, 2.0, 2.3], [-0.35, 1.0, 0], 42, 0.12)]]}>
      <Room f={f + 900} straps={st} valve={0} candle={0.9}>
        <Prisoner f={f} k={0.8} struggle={interpolate(f, [0, 50, 80], [1, 0.7, 0.2], clamp)} look={-0.7} />
        <Guard pos={[ax, 0, -0.72]} ry={0} p={A} f={f} />
        <Guard pos={[1.62, 0, 0.05]} ry={-Math.PI / 2} p={B} f={f + 30} />
      </Room>
    </Stage>
  );
};
// 4. the stone the lawyer watched: a drip hollowing rock as years pass
const STONE_HITS = randHits("sn2", 4, 100, 9, 10);
const rockTex = () => { const t = textTex("rock2", 512, 512, (c) => {
  c.fillStyle = "#77706a"; c.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 3200; i++) { const v = 70 + random("rk" + i) * 80; c.fillStyle = `rgba(${v},${v - 5},${v - 12},${0.2 + random("ra" + i) * 0.4})`; const r = 2 + random("rr" + i) * 16; c.beginPath(); c.arc(random("rx" + i) * 512, random("ry" + i) * 512, r, 0, 7); c.fill(); }
  for (let i = 0; i < 18; i++) { c.strokeStyle = "rgba(25,22,20,0.55)"; c.lineWidth = 1.5 + random("lw" + i) * 1.5; c.beginPath(); let x = random("cx" + i) * 512, y = random("cy" + i) * 512; c.moveTo(x, y); for (let k = 0; k < 7; k++) { x += (random(`c${i}${k}`) - 0.5) * 70; y += (random(`d${i}${k}`) - 0.5) * 70; c.lineTo(x, y); } c.stroke(); }
  for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(70,95,50,${0.15 + random("mo" + i) * 0.2})`; c.beginPath(); c.arc(random("mx" + i) * 512, 380 + random("my" + i) * 132, 6 + random("mr" + i) * 20, 0, 7); c.fill(); }
}); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 1); return t; };
const Pool: React.FC<{ y: number; r: number }> = ({ y, r }) => { const env = useEnv(); return <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[r, 40]} /><meshStandardMaterial color="#20323e" roughness={0.02} metalness={0.5} envMap={env} envMapIntensity={1.4} /></mesh>; };
const StoneScene: React.FC<{ f: number }> = ({ f }) => {
  const rock = rockTex(), g = interpolate(f, [0, 98], [0.1, 1], { ...clamp, easing: (t) => t * t * 0.6 + t * 0.4 });
  const hr = 0.025 + 0.075 * g, depth = 0.01 + 0.07 * g;
  return (
    <Stage f={f} len={T2.first - T2.stone} fog={[3, 10]} shots={[[0, C([0.0, 0.92, 1.25], [0, 0.5, 0], 38, 0.1), C([0.1, 0.84, 1.08], [0, 0.48, 0], 38, 0.1)]]}>
      <ambientLight intensity={0.16} color="#5a6a90" />
      <spotLight position={[0.9, 2.4, 1.3]} target-position={[0, 0.3, 0]} angle={0.55} penumbra={0.8} intensity={9} distance={6} color="#d4e2f6" castShadow />
      <pointLight position={[-1.2, 0.9, 0.4]} intensity={2} distance={3.5} color="#ff9a4a" />
      <pointLight position={[0.4, 2.0, -0.5]} intensity={2.4} distance={3} color="#ffa860" />
      <mesh position={[-0.9, 1.5, -1.36]}><planeGeometry args={[0.5, 0.5]} /><meshBasicMaterial map={glowTex()} color="#ff9040" transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[8, 8]} /><meshStandardMaterial map={masonry("f", [80, 74, 66], 6, 6, 6)} roughness={0.9} /></mesh>
      <mesh position={[0, 1.4, -1.4]}><planeGeometry args={[6, 3.2]} /><meshStandardMaterial map={masonry("w", [128, 114, 98], 3, 1.6)} bumpMap={masonry("w", [128, 114, 98], 3, 1.6)} bumpScale={3} roughness={0.95} /></mesh>
      <mesh position={[0, 0.1, 0]} scale={[1, 0.46, 0.85]} castShadow receiveShadow><sphereGeometry args={[0.5, 48, 28]} /><meshStandardMaterial map={rock} bumpMap={rock} bumpScale={4} roughness={0.85} /></mesh>
      {/* the hollow: a dark bowl sunk into the top, filled with a glossy pool */}
      <mesh position={[0, 0.33 - depth * 0.5, 0]} scale={[1, depth / hr, 1]}><sphereGeometry args={[hr, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} /><meshStandardMaterial color="#1c1915" roughness={0.6} side={THREE.BackSide} /></mesh>
      <mesh position={[0, 0.331, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[hr * 0.98, hr * 1.25, 40]} /><meshStandardMaterial color="#4a443c" roughness={0.5} transparent opacity={0.7} /></mesh>
      <Pool y={0.329 - depth * 0.35} r={hr * 0.82} />
      <mesh position={[0, 1.62, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.06, 0.44, 16]} /><meshStandardMaterial map={rock} roughness={0.5} /></mesh>
      {STONE_HITS.map((h, i) => <Drop key={i} f={f} t0={h - 10} slow={10 / 9} form={6} from={[0, 1.38, 0]} to={[0, 0.33 - depth * 0.35, 0]} skin={false} />)}
    </Stage>
  );
};
// 5. valve opens, then the first drop forms and falls in slow motion onto his forehead
const FIRST_HIT = 65;
const FirstScene: React.FC<{ f: number }> = ({ f }) => {
  const v = interpolate(f, [2, 22], [0, 0.6], { ...clamp, easing: ez });
  const hand = interpolate(f, [0, 4, 22, 28], [0.6, 1, 1, 0.6], clamp);
  const G: BP = mixBP({ ...STAND }, { ...STAND, headX: -14, lArmX: -150, lArmZ: -14, lElbow: -14 + Math.sin(f / 2.5) * 8 * (f > 2 && f < 22 ? 1 : 0) }, hand);
  const wet = interpolate(f, [FIRST_HIT, FIRST_HIT + 8], [0, 0.35], clamp);
  return (
    <Stage f={f} len={T2.lapse - T2.first} shots={[[0, C([-0.72, 1.95, -1.35], [-0.84, 1.6, 0.35], 42), C([-0.8, 1.92, -1.25], [-0.84, 1.6, 0.35], 42)], [26, C([-0.42, 1.4, 0.98], [-0.76, 1.38, 0], 30, 0.04), C([-0.46, 1.36, 0.9], [-0.76, 1.33, 0], 30, 0.04)]]}>
      <Room f={f + 1800} valve={v} candle={0.85}>
        <Prisoner f={f} k={0.4} flinch={flinchAt(f, [FIRST_HIT])} eyes={f >= FIRST_HIT && f < FIRST_HIT + 7 ? "closed" : "scared"} wet={wet} />
        {f < 26 && <Guard pos={[-0.95, 0, 0.62]} ry={Math.PI + 0.25} p={G} f={f} />}
        <Drop f={f} t0={FIRST_HIT - 22} slow={22 / 9} form={34} />
      </Room>
    </Stage>
  );
};
// 6. time-lapse: day/night sweeps, sun patch travels, candle burns down, drops become a rhythm, he degrades
const LAPSE_HITS = randHits("lp2", 0, 134, 3, 8);
const LapseScene: React.FC<{ f: number }> = ({ f }) => {
  const q = interpolate(f, [0, 134], [0, 1], clamp);
  const cyc = q * 2.5, day = Math.pow(Math.max(0, Math.sin(cyc * Math.PI * 2 - Math.PI / 2) * 0.5 + 0.5), 0.8), sun = cyc % 1;
  return (
    <Stage f={f} len={T2.sleep - T2.lapse} shots={[[0, C([1.9, 2.2, 2.1], [-0.3, 0.95, 0], 42, 0.08), C([0.7, 2.15, 2.75], [-0.4, 0.98, 0], 42, 0.08)]]}>
      <Room f={f * 9} candle={interpolate(q, [0, 1], [0.95, 0.08])} day={day} sun={sun} torch={0.5 + 0.5 * (1 - day)} tspeed={1}>
        <Prisoner f={f * 2.2} k={0.5 + q * 1.4} flinch={flinchAt(f, LAPSE_HITS) * 0.7} struggle={q * 0.5} tired={q} sweat={q} wet={0.4 + q * 0.6} pupil={1 - q * 0.3} />
        <Drops f={f} hits={LAPSE_HITS} form={3} />
      </Room>
    </Stage>
  );
};
// 7. can't sleep (eyes close, a drop snaps them open) / can't move (pulls against the straps)
const SLEEP_HIT = 20;
const SleepScene: React.FC<{ f: number }> = ({ f }) => (
  <Stage f={f} len={T2.death - T2.sleep} shots={[[0, C([-0.2, 1.6, 1.12], [-0.72, 1.06, 0], 35, 0.1), C([-0.27, 1.56, 1.02], [-0.73, 1.07, 0], 34, 0.1)], [31, C([0.75, 1.62, 1.35], [0.0, 0.98, 0], 40, 0.06), C([0.6, 1.6, 1.25], [-0.05, 0.98, 0], 40, 0.06)]]}>
    <Room f={f + 2600} candle={0.1} torch={0.85}>
      <pointLight position={[0.3, 1.9, 1.1]} intensity={f >= 31 ? 2.5 : 0} distance={2.6} color="#ffc896" />
      <Prisoner f={f} k={1.3} flinch={flinchAt(f, [SLEEP_HIT])} eyes={f < SLEEP_HIT ? "closed" : "scared"} struggle={f >= 31 ? 1 : 0} tired={1} sweat={1} wet={1} pupil={0.7} />
      <Drop f={f} t0={SLEEP_HIT - 9} form={10} />
      <Drop f={f} t0={58} form={10} />
    </Room>
  </Stage>
);
// 8. madness and death: twitching, ECG racing, final slow drop, flatline, torches shrink, X eyes grow in
const DEATH_HITS = [10, 26, 38, 48, 56];
const LAST = 91;
const DeathScene: React.FC<{ f: number }> = ({ f }) => {
  const still = interpolate(f, [LAST, LAST + 16], [1, 0], clamp), xk = interpolate(f, [LAST + 3, LAST + 12], [0, 1], { ...clamp, easing: eo });
  const torch = interpolate(f, [LAST, LAST + 26], [0.85, 0.3], clamp);
  return (
    <Stage f={f} len={T2.end - T2.death} shots={[[0, C([-0.2, 1.62, 1.12], [-0.72, 1.06, 0], 35, 0.1), C([-0.12, 1.66, 1.2], [-0.71, 1.05, 0], 36, 0.1)], [66, C([-0.36, 1.46, 0.95], [-0.76, 1.3, 0], 31, 0.03), C([-0.3, 1.5, 1.0], [-0.75, 1.28, 0], 31, 0.03)], [LAST + 6, C([-0.25, 1.6, 1.1], [-0.72, 1.05, 0], 35, 0.1), C([-0.12, 1.95, 1.35], [-0.7, 1.0, 0], 38, 0.1)]]}>
      <Room f={f + 3300} candle={0.06} torch={torch}>
        <Prisoner f={f} k={2.2 * still} flinch={flinchAt(f, [...DEATH_HITS, LAST]) * Math.max(still, f < LAST + 8 ? 1 : 0)} eyes={f >= LAST + 3 ? "dead" : "scared"} xk={xk} struggle={f < 60 ? 0.7 : 0} tired={1} sweat={1} wet={1} pupil={0.55} look={LOOK + interpolate(f, [LAST + 4, LAST + 26], [0, 0.35], clamp)} />
        <Drops f={f} hits={DEATH_HITS} />
        <Drop f={f} t0={LAST - 22} slow={22 / 9} form={18} />
      </Room>
    </Stage>
  );
};
// 9. end: high wide shot, the drip goes on
const END_HITS = [14, 40, 66, 92];
const EndScene: React.FC<{ f: number }> = ({ f }) => (
  <Stage f={f} len={T2.fin - T2.end} shots={[[0, C([0.75, 2.95, 1.75], [-0.3, 0.95, 0], 40, -0.04), C([0.4, 2.65, 1.4], [-0.4, 0.95, 0], 40, -0.04)]]}>
    <Room f={f + 3500} candle={0.05} torch={0.32}>
      <Prisoner f={f} k={0} eyes="dead" tired={1} wet={1} look={LOOK + 0.35} />
      <Drops f={f} hits={END_HITS} />
    </Room>
  </Stage>
);

// ---------- 2D overlays ----------
const font: React.CSSProperties = { fontFamily: "Oswald", fontWeight: 700, textTransform: "uppercase", color: "#fff", WebkitTextStroke: `8px ${INK}`, paintOrder: "stroke fill", textShadow: "0 6px 18px rgba(0,0,0,0.8)" };
const Chip: React.FC<{ f: number; s: number; top: number; children: React.ReactNode; size?: number }> = ({ f, s, top, children, size = 56 }) => {
  const p = interpolate(f, [s, s + 7], [0, 1], { ...clamp, easing: eo });
  if (p <= 0) return null;
  return <div style={{ position: "absolute", top, width: "100%", display: "flex", justifyContent: "center", opacity: p, transform: `translateY(${(1 - p) * -24}px)` }}>
    <div style={{ padding: "10px 32px 14px", borderRadius: 16, background: "rgba(12,12,14,0.84)", border: "2px solid rgba(255,255,255,0.14)", boxShadow: "0 10px 30px rgba(0,0,0,0.6)", fontFamily: "Oswald", fontWeight: 600, fontSize: size, letterSpacing: 3, color: "#fff", textTransform: "uppercase" }}>{children}</div>
  </div>;
};
const fmt = (n: number) => Math.floor(n).toLocaleString("en-US");
const HookHUD: React.FC<{ f: number }> = ({ f }) => {
  const n = HOOK_HITS.filter((t) => f >= t).length, hit = HOOK_HITS.find((t) => f >= t && f < t + 6);
  const bump = hit !== undefined ? 1 + 0.06 * (1 - (f - hit) / 6) : 1;
  return <>
    <Chip f={f} s={2} top={170} size={60}><span style={{ color: "#ff4848" }}>DAY 3</span>&nbsp;&nbsp;·&nbsp;&nbsp;<span style={{ display: "inline-block", transform: `scale(${bump})` }}>DROP #{fmt(21604 + n)}</span></Chip>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 55%, rgba(120,0,10,0.45) 100%)", opacity: hit !== undefined ? 1 - (f - hit) / 6 * 0.7 : 0.3 }} />
  </>;
};
const DragHUD: React.FC<{ f: number }> = ({ f }) => {
  const p = interpolate(f, [2, 10], [0, 1], { ...clamp, easing: eo }), sk = interpolate(f, [80, 88], [0, 1], { ...clamp, easing: eo });
  const not = interpolate(f, [88, 95], [0, 1], { ...clamp, easing: eo });
  return <div style={{ position: "absolute", top: 180, width: "100%", textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * -30}px)` }}>
    <div style={{ ...font, fontSize: 84, lineHeight: 1.04, letterSpacing: 2 }}>
      <span style={{ position: "relative", display: "inline-block", color: sk > 0.5 ? "#8a8a90" : "#fff" }}>CHINESE
        <div style={{ position: "absolute", left: -12, right: -12, top: "50%", height: 14, background: RED, transform: `scaleX(${sk}) rotate(-4deg)`, transformOrigin: "left", borderRadius: 7, boxShadow: "0 2px 8px rgba(0,0,0,0.6)" }} />
      </span>
      <br />WATER TORTURE</div>
    {not > 0 && <div style={{ display: "inline-block", marginTop: 16, padding: "6px 26px 10px", background: RED, borderRadius: 12, fontFamily: "Oswald", fontWeight: 700, fontSize: 50, color: "#fff", letterSpacing: 2, opacity: not, transform: `scale(${0.88 + 0.12 * not})` }}>NOT FROM CHINA</div>}
  </div>;
};
const OriginCard: React.FC<{ f: number }> = ({ f }) => {
  const p = interpolate(f, [16, 26], [0, 1], { ...clamp, easing: eo }), name = "Hippolytus de Marsiliis";
  if (p <= 0) return null;
  const n = Math.max(0, Math.min(name.length, Math.floor(f - 34)));
  return <div style={{ position: "absolute", top: 150, left: 110, right: 110, opacity: p, transform: `translateY(${(1 - p) * -40}px) rotate(-1.5deg)` }}>
    <div style={{ position: "relative", padding: "30px 40px 34px", borderRadius: 8, background: "radial-gradient(ellipse at 40% 30%, #efe0bb, #d3bc8a 70%, #a98a55)", boxShadow: "0 24px 60px rgba(0,0,0,0.7), inset 0 0 60px rgba(90,60,20,0.45)", fontFamily: "Oswald", color: "#2a1c10", textAlign: "center" }}>
      <div style={{ fontWeight: 500, fontSize: 32, letterSpacing: 8, opacity: 0.75 }}>FIRST DESCRIBED IN</div>
      <div style={{ fontWeight: 700, fontSize: 84, lineHeight: 1.05, letterSpacing: 2 }}>ITALY · c. 1500</div>
      <div style={{ height: 3, background: "rgba(60,35,15,0.4)", margin: "14px 40px" }} />
      <div style={{ fontWeight: 700, fontSize: 52, minHeight: 66 }}>{name.slice(0, n)}<span style={{ opacity: n < name.length ? 1 : 0 }}>|</span></div>
      <div style={{ fontWeight: 500, fontSize: 32, opacity: interpolate(f, [56, 64], [0, 0.75], clamp) }}>LAWYER FROM BOLOGNA</div>
      <div style={{ position: "absolute", right: -24, bottom: -28, width: 110, height: 110, borderRadius: 55, background: "radial-gradient(circle at 40% 35%, #c8302a, #7a120e)", boxShadow: "0 6px 16px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 30, color: "#f0c8b0", transform: `scale(${interpolate(f, [28, 35], [2.2, 1], { ...clamp, easing: eo })})`, opacity: interpolate(f, [28, 31], [0, 1], clamp) }}>1500</div>
    </div>
  </div>;
};
const StoneHUD: React.FC<{ f: number }> = ({ f }) => {
  const yrs = interpolate(f, [4, 96], [1, 100], { ...clamp, easing: (t) => t * t });
  return <Chip f={f} s={2} top={190}>DROP BY DROP&nbsp;·&nbsp;<span style={{ color: "#8fd0ff" }}>{Math.round(yrs)} {Math.round(yrs) === 1 ? "YEAR" : "YEARS"}</span></Chip>;
};
const FirstHUD: React.FC<{ f: number }> = ({ f }) => f >= FIRST_HIT ? <Chip f={f} s={FIRST_HIT} top={190} size={64}>DROP #1</Chip> : null;
const Clock: React.FC<{ f: number }> = ({ f }) => {
  const q = interpolate(f, [0, 134], [0, 1], clamp), hrs = q * 66 + 1;
  const day = Math.floor(hrs / 24) + 1, label = hrs < 24 ? `HOUR ${Math.floor(hrs)}` : `DAY ${day}`;
  const drops = Math.floor(Math.pow(q, 1.3) * 21600) + 2;
  const p = interpolate(f, [0, 8], [0, 1], { ...clamp, easing: eo });
  const flip = hrs >= 24 ? interpolate((hrs % 24), [0, 2], [1, 0], clamp) : 0;
  return <div style={{ position: "absolute", top: 140, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", opacity: p }}>
    <svg width={250} height={250} viewBox="-100 -100 200 200" style={{ filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.7))" }}>
      <circle r={92} fill="#121214" stroke="#e8e2d4" strokeWidth={7} />
      {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={0} y1={-80} x2={0} y2={i % 3 ? -72 : -62} stroke="#e8e2d4" strokeWidth={i % 3 ? 3 : 6} transform={`rotate(${i * 30})`} />)}
      {Array.from({ length: 6 }).map((_, i) => <line key={"m" + i} x1={0} y1={0} x2={0} y2={-74} stroke="#ffffff" strokeOpacity={0.08 * (6 - i)} strokeWidth={5} transform={`rotate(${hrs * 360 - i * 10})`} />)}
      <line x1={0} y1={0} x2={0} y2={-48} stroke="#e8e2d4" strokeWidth={8} strokeLinecap="round" transform={`rotate(${hrs * 30})`} />
      <line x1={0} y1={0} x2={0} y2={-74} stroke={RED} strokeWidth={5} strokeLinecap="round" transform={`rotate(${hrs * 360})`} />
      <circle r={7} fill="#e8e2d4" />
    </svg>
    <div style={{ ...font, fontSize: 104, marginTop: 4, color: hrs >= 24 ? "#ff4848" : "#fff", transform: `scale(${1 + flip * 0.15})` }}>{label}</div>
    <div style={{ fontFamily: "Oswald", fontWeight: 600, fontSize: 48, color: "#cfe6f2", letterSpacing: 2, textShadow: "0 4px 12px #000" }}>{fmt(drops)} DROPS</div>
  </div>;
};
const Heart: React.FC<{ f: number; bpm: number; o?: number }> = ({ f, bpm, o = 0.5 }) => {
  const per = 1800 / bpm, q = (f % per) / per, b = Math.max(Math.exp(-q * 14), Math.exp(-Math.abs(q - 0.22) * 18) * 0.7);
  return <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 42%, transparent 45%, rgba(150,0,16,${o * b}) 100%)`, pointerEvents: "none" }} />;
};
/** ECG strip: beats racing, then flatline */
const ECG: React.FC<{ f: number; flatAt: number }> = ({ f, flatAt }) => {
  const wN = 760, pts: string[] = [];
  for (let x = 0; x <= wN; x += 4) {
    const tf = f - (wN - x) / 9; // older samples on the left
    let y = 0;
    if (tf < flatAt) { const bpm = interpolate(tf, [0, flatAt], [130, 190], clamp), per = 1800 / bpm, ph = ((tf % per) + per) % per / per;
      y = ph < 0.05 ? -ph * 400 : ph < 0.09 ? -20 + (ph - 0.05) * 2200 : ph < 0.13 ? 68 - (ph - 0.09) * 1700 : Math.sin((ph - 0.2) * 12) * (ph > 0.2 && ph < 0.46 ? 9 : 0); }
    pts.push(`${x},${60 + y}`);
  }
  const flat = f >= flatAt;
  return <div style={{ position: "absolute", top: 170, left: (W - wN) / 2, width: wN, height: 130, borderRadius: 16, background: "rgba(6,10,8,0.75)", border: "2px solid rgba(80,255,140,0.25)", overflow: "hidden" }}>
    <svg width={wN} height={130}><polyline points={pts.join(" ")} fill="none" stroke={flat ? "#ff3b3b" : "#5cff98"} strokeWidth={5} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${flat ? "#ff3b3b" : "#5cff98"})` }} /></svg>
  </div>;
};
const DeathHUD: React.FC<{ f: number }> = ({ f }) => {
  const g = (f > 22 && f < 25) || (f > 44 && f < 47) || (f > 60 && f < 62);
  return <>
    {g && <AbsoluteFill style={{ background: "rgba(200,16,46,0.2)", mixBlendMode: "screen", transform: `translateX(${(random("gl" + f) - 0.5) * 34}px)` }} />}
    {f < LAST + 3 && <Heart f={f} bpm={interpolate(f, [0, LAST], [130, 190], clamp)} o={0.6} />}
    <ECG f={f} flatAt={LAST + 3} />
    <AbsoluteFill style={{ background: "#000", opacity: interpolate(f, [LAST + 3, LAST + 20], [0, 0.22], clamp) }} />
  </>;
};
const EndHUD: React.FC<{ f: number }> = ({ f }) => {
  const a = interpolate(f, [0, 9], [0, 1], { ...clamp, easing: eo }), b = interpolate(f, [44, 54], [0, 1], { ...clamp, easing: eo });
  return <>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 32%, transparent 72%, rgba(0,0,0,0.55) 100%)" }} />
    <div style={{ position: "absolute", top: 190, width: "100%", textAlign: "center", opacity: a, transform: `translateY(${(1 - a) * -30}px)` }}>
      <div style={{ ...font, fontSize: 118, lineHeight: 1.02, letterSpacing: 2 }}>DID YOU KNOW<br /><span style={{ color: "#ff4848" }}>THIS TORTURE?</span></div>
    </div>
    <div style={{ position: "absolute", top: 1450, width: "100%", textAlign: "center", opacity: b, transform: `translateY(${(1 - b) * 30}px)` }}>
      <span style={{ display: "inline-block", padding: "12px 38px 16px", borderRadius: 14, background: RED, fontFamily: "Oswald", fontWeight: 700, fontSize: 62, color: "#fff", letterSpacing: 3, boxShadow: "0 10px 30px rgba(0,0,0,0.6)" }}>COMMENT BELOW 👇</span>
    </div>
  </>;
};
const SleepHUD: React.FC<{ f: number }> = ({ f }) => <Heart f={f} bpm={120} o={0.55} />;
const LapseFX: React.FC<{ f: number }> = ({ f }) => <><Clock f={f} /><AbsoluteFill style={{ background: "#fff", opacity: (f % 3 === 0 ? 0.025 : 0), mixBlendMode: "overlay" }} /></>;

// ---------- assembly ----------
const Sc = (S3: React.FC<{ f: number }>, HUD?: React.FC<{ f: number }>): React.FC<{ f: number }> => ({ f }) => <><S3 f={f} />{HUD && <HUD f={f} />}</>;
const LIST: [number, number, React.FC<{ f: number }>][] = [
  [T2.hook, T2.drag, Sc(HookScene, HookHUD)], [T2.drag, T2.strap, Sc(DragScene, DragHUD)], [T2.strap, T2.stone, Sc(StrapScene, OriginCard)], [T2.stone, T2.first, Sc(StoneScene, StoneHUD)],
  [T2.first, T2.lapse, Sc(FirstScene, FirstHUD)], [T2.lapse, T2.sleep, Sc(LapseScene, LapseFX)], [T2.sleep, T2.death, Sc(SleepScene, SleepHUD)],
  [T2.death, T2.end, Sc(DeathScene, DeathHUD)], [T2.end, T2.fin, Sc(EndScene, EndHUD)],
];
const XF = 4;
const Scene: React.FC<{ C: React.FC<{ f: number }>; i: number }> = ({ C: Comp, i }) => {
  const g = useCurrentFrame(), f = g - (i > 0 ? XF : 0);
  const op = i > 0 ? interpolate(g, [0, XF], [0, 1], clamp) : 1;
  return <AbsoluteFill style={{ opacity: op }}><Comp f={f} /></AbsoluteFill>;
};
const Subs: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= T2.end - 4) return null;
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
      <svg width={W} height={H} style={{ position: "absolute", opacity: 0.07, mixBlendMode: "overlay" }}><filter id="gn2"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 11} /></filter><rect width={W} height={H} filter="url(#gn2)" /></svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, transparent 58%, rgba(0,0,0,0.38) 100%)" }} />
    </AbsoluteFill>
  );
};
export const Gota2: React.FC<{ audio?: boolean; subs?: boolean }> = ({ audio = false, subs = true }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    {LIST.map(([a, b, Comp], i) => <Sequence key={i} from={i > 0 ? a - XF : a} durationInFrames={b - a + (i > 0 ? XF : 0)}><Scene C={Comp} i={i} /></Sequence>)}
    <Grade />
    {subs && <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 64%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.35) 80%, transparent 88%)", pointerEvents: "none" }} />}
    {subs && <Subs />}
    {audio && <Audio src={staticFile("gota/mix2.wav")} />}
  </AbsoluteFill>
);
