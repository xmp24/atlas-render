import React, { useLayoutEffect } from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import FCAM from "./front_cam.json";
import SCAM from "./stairs_cam.json";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { noise2D } from "@remotion/noise";
import "@fontsource/oswald/500.css";
import "@fontsource/oswald/600.css";
import "@fontsource/oswald/700.css";
import { textTex } from "../Miya3/Sets3";
import { STAND, BP, walkBP, mixBP } from "../Miya8/Bot3";
import { Bot4 as Bot, Mouth } from "./Bot4";
import { noise3D } from "@remotion/noise";
import { Dungeon, Table, DripRig, Drop, Wet, Contact, masonry, useEnv, waterMat, glowTex, FOREHEAD, SPOUT, HEAD, Bind, BOUND, FREE, Rat } from "./Dungeon4";
import WORDS from "./words2.json";

const W = 1080, H = 1920, INK = "#151517", RED = "#c8102e";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ez = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const eo = (t: number) => 1 - Math.pow(1 - t, 3);
const L3 = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k) as [number, number, number];
type Cam = { pos: [number, number, number]; look: [number, number, number]; fov: number; shift?: number };
type Shot = [number, Cam, Cam];

export const T4 = { hook: 0, drag: 150, strap: 262, stone: 360, first: 458, lapse: 552, sleep: 686, death: 752, end: 870, fin: 955 };
export const GOTA4_FRAMES = T4.fin;

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
const LOOK = -0.35;
/** prisoner strapped face-up; k = tremble, flinch 0..1, struggle = pulling against the straps (smooth noise, not a sine) */
const Prisoner: React.FC<{ f: number; k?: number; flinch?: number; eyes?: "scared" | "closed" | "dead"; look?: number; struggle?: number; tired?: number; pupil?: number; xk?: number; wet?: number; sweat?: number; mouth?: Mouth; brows?: number; gaze?: [number, number]; lid?: number; breath?: number; still?: boolean }> = ({ f, k = 0.3, flinch = 0, eyes = "scared", look = LOOK, struggle = 0, tired = 0, pupil = 1, xk = 1, wet = 0, sweat = 0, mouth, brows = 1, gaze, lid, breath = 1, still = false }) => {
  const n = (s: string, sp = 1.3) => noise2D(s, f / sp, 0);
  const sn = (s: string) => noise2D(s, f / 9, 0); // slow effortful pulls
  const tr = k * 0.01;
  const p: BP = { ...LIE,
    headY: look * 30 + n("hy", 4) * 8 * k + struggle * sn("sh") * 22,
    headX: -flinch * 16 + n("hx", 2) * 4 * k - struggle * Math.abs(sn("sx")) * 10,
    lArmX: struggle * sn("la") * 14 + n("la") * 3 * k, rArmX: struggle * sn("ra") * 14 + n("ra") * 3 * k,
    lArmZ: -7 - struggle * Math.abs(sn("lz")) * 9, rArmZ: 7 + struggle * Math.abs(sn("rz")) * 9,
    lElbow: -4 - struggle * Math.abs(sn("le")) * 30 - flinch * 28, rElbow: -4 - struggle * Math.abs(sn("re")) * 30 - flinch * 28,
    lLegX: struggle * sn("ll") * 8, rLegX: struggle * sn("rl") * 8, lKnee: 1 + struggle * Math.abs(sn("lk")) * 16 + flinch * 12, rKnee: 1 + struggle * Math.abs(sn("rk")) * 16 + flinch * 12,
  };
  return <>
    <Bot pos={[0.9 + n("px", 1) * tr, 0.945 + n("py", 0.9) * tr + flinch * 0.01, n("pz", 1.1) * tr]} rot={[-Math.PI / 2, 0, Math.PI / 2]} p={p} f={f} outfit="prisoner" eyes={eyes} hood={false} ground={false} tired={tired} pupil={pupil} xk={xk} lid={lid ?? tired * 0.45} breath={breath} bamp={still ? 0 : 2.4} mouth={mouth ?? (flinch > 0.3 ? "scream" : eyes === "dead" ? "slack" : eyes === "closed" ? "flat" : "fear")} brows={eyes === "dead" ? 0 : brows} look={gaze ?? [noise2D("gx", f / 14, 0) * 0.8, noise2D("gy", f / 17, 0) * 0.6]} />
    {(wet > 0 || sweat > 0) && <Wet wet={wet} sweat={sweat} look={look} />}
  </>;
};
const Guard: React.FC<{ pos: [number, number, number]; ry: number; p: BP; f: number }> = ({ pos, ry, p, f }) => <Bot pos={pos} ry={ry} p={p} f={f} scale={1.08} helmet hood={false} outfit="guard" eyes="scared" brows={-1} mouth="flat" pupil={0.8} look={[0, -0.3]} />;
const flinchAt = (f: number, hits: number[]) => { let v = 0; for (const t of hits) { const q = (f - t) / 12; if (q >= 0 && q < 1) v = Math.max(v, Math.sin(Math.PI * Math.min(1, q * 2.4)) * (1 - q) * 1.2); } return Math.min(1, v); };
const randHits = (seed: string, from: number, to: number, min: number, max: number) => { const o: number[] = []; let t = from; let i = 0; while (t < to) { o.push(Math.round(t)); t += min + random(seed + i++) * (max - min); } return o; };
/** drops for a list of impact frames */
const Drops: React.FC<{ f: number; hits: number[]; slow?: number; form?: number }> = ({ f, hits, slow = 1, form = 8 }) => <>{hits.map((h, i) => <Drop key={i} f={f} t0={h - 9 * slow} slow={slow} form={Math.min(form, i > 0 ? Math.max(2, h - hits[i - 1] - 9 * slow) : form)} />)}</>;

const Room: React.FC<{ f: number; bind?: Bind; valve?: number; torch?: number; day?: number; candle?: number; door?: number; sun?: number; tspeed?: number; kl?: number; children?: React.ReactNode }> = ({ f, bind = BOUND, valve = 1, torch = 1, day = 0, candle = 1, door = 0, sun = 0.5, tspeed = 1, kl = 1, children }) => (
  <group>
    <Dungeon f={f} torch={torch} day={day} candle={candle} door={door} sun={sun} tspeed={tspeed} />
    <Table bind={bind} />
    <DripRig valve={valve} f={f} />
    <pointLight position={[-0.2, 2.5, 1.3]} intensity={2.2 * kl * (0.45 + 0.55 * torch)} distance={4.5} color="#ffc896" />
    <pointLight position={[-1.2, 1.9, -0.9]} intensity={1.0 * kl} distance={3} color="#7f9fe0" />
    <pointLight position={[-1.7, 2.1, 0.9]} intensity={1.3 * kl} distance={3.2} color="#86a6e8" />
    {children}
  </group>
);

// ---------- photo shots: the user's reference images as real sets, 3D characters matched to their perspective ----------
type PCam = { pos: number[]; quat: number[]; fov: number; size: number[] };
const PhotoCam: React.FC<{ c: PCam }> = ({ c }) => {
  const { camera, gl } = useThree();
  useLayoutEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05;
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(c.pos[0], c.pos[1], c.pos[2]); cam.quaternion.set(c.quat[0], c.quat[1], c.quat[2], c.quat[3]); cam.fov = c.fov; cam.clearViewOffset(); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  });
  return null;
};
/** flickering fire painted over the photo's own torches + their light breathing on the walls */
const PhotoFire: React.FC<{ f: number; pts: [number, number, number][]; sc: number; speed?: number; on?: number }> = ({ f, pts, sc, speed = 1, on = 1 }) => <>{pts.map(([x, y, s], i) => {
  const g = f * speed, fl = 1 + Math.sin(g / 2.1 + i * 2) * 0.08 + (random("pf" + i + Math.floor(g / 2)) - 0.5) * 0.16;
  const X = x * sc, Y = y * sc, S = s * sc;
  return <React.Fragment key={i}>
    <div style={{ position: "absolute", left: X - S * 6, top: Y - S * 6, width: S * 12, height: S * 12, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,170,80,0.32), rgba(255,120,40,0.08) 45%, transparent 70%)", mixBlendMode: "screen", opacity: (0.75 + 0.25 * fl) * on }} />
    <div style={{ position: "absolute", left: X - S * 0.55 * fl, top: Y - S * 1.9 * fl, width: S * 1.1 * fl, height: S * 2.2 * fl, borderRadius: "50% 50% 45% 45% / 65% 65% 35% 35%", background: "radial-gradient(ellipse at 50% 72%, #fff8dc 0%, #ffd070 30%, rgba(255,120,30,0.85) 60%, rgba(255,80,0,0) 78%)", mixBlendMode: "screen", transform: `skewX(${Math.sin(g / 3.3 + i) * 8}deg)`, opacity: on, filter: "blur(1px)" }} />
  </React.Fragment>;
})}</>;
const PhotoShot: React.FC<{ f: number; len: number; img: string; cam: PCam; z: [number, number]; c0: [number, number]; c1?: [number, number]; fire?: [number, number, number][]; fireSpeed?: number; fireOn?: number; tint?: string; children?: React.ReactNode }> = ({ f, len, img, cam, z, c0, c1, fire = [], fireSpeed = 1, fireOn = 1, tint, children }) => {
  const H0 = H, W0 = Math.round(H0 * cam.size[0] / cam.size[1]), sc = H0 / cam.size[1];
  const k = ez(interpolate(f, [0, len], [0, 1], clamp)), zz = z[0] + (z[1] - z[0]) * k;
  const cc = c1 ? [c0[0] + (c1[0] - c0[0]) * k, c0[1] + (c1[1] - c0[1]) * k] : c0;
  let left = W / 2 - cc[0] * W0 * zz, top = H / 2 - cc[1] * H0 * zz;
  left = Math.min(0, Math.max(W - W0 * zz, left)); top = Math.min(0, Math.max(H - H0 * zz, top));
  return <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
    <div style={{ position: "absolute", left, top, width: W0, height: H0, transform: `scale(${zz})`, transformOrigin: "0 0" }}>
      <Img src={staticFile(img)} style={{ position: "absolute", width: W0, height: H0 }} />
      <PhotoFire f={f} pts={fire} sc={sc} speed={fireSpeed} on={fireOn} />
      <ThreeCanvas width={W0} height={H0} shadows="soft" style={{ position: "absolute" }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} camera={{ fov: cam.fov, near: 0.05, far: 60 }}>
        <PhotoCam c={cam} />
        {children}
      </ThreeCanvas>
      {tint && <AbsoluteFill style={{ background: tint, mixBlendMode: "multiply" }} />}
    </div>
  </AbsoluteFill>;
};
const Catcher: React.FC<{ p: [number, number, number]; s: [number, number]; o?: number }> = ({ p, s: sz, o = 0.5 }) => <mesh position={p} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={sz} /><shadowMaterial transparent opacity={o} /></mesh>;
/** front view of the torture room: table-top centre is the origin; our sets sit in a group shifted so the forehead lands under the photo's bucket */
const FRONT_FIRE: [number, number, number][] = [[175, 352, 13], [1041, 372, 11]];
const FRONT_DX = -0.652 - FOREHEAD[0];
const FrontRoom: React.FC<{ f: number; len: number; z?: [number, number]; c0?: [number, number]; c1?: [number, number]; light?: number; tint?: string; fireSpeed?: number; children?: React.ReactNode }> = ({ f, len, z = [1, 1.06], c0 = [0.5, 0.55], c1, light = 1, tint, fireSpeed, children }) => (
  <PhotoShot f={f} len={len} img="gota/room_front.png" cam={FCAM as PCam} z={z} c0={c0} c1={c1} fire={FRONT_FIRE} fireSpeed={fireSpeed} tint={tint}>
    <ambientLight intensity={0.32 * light} color="#b08a68" />
    <hemisphereLight args={["#6a5a4a", "#1a120a", 0.3 * light]} />
    <pointLight position={[-2.0, 1.05, 0.2]} intensity={5 * light} distance={7} decay={1.4} color="#ffa050" />
    <pointLight position={[0.15, 1.15, -1.9]} intensity={3 * light} distance={6} decay={1.4} color="#ff9a48" />
    <pointLight position={[2.5, 1.6, 3.0]} intensity={0.9 * light} distance={8} color="#8aa0d0" />
    <directionalLight position={[-1.8, 3.5, 0.6]} intensity={0.5 * light} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} />
    <Catcher p={[0, 0.003, 0]} s={[2.15, 0.75]} o={0.55} />
    <Catcher p={[0, -0.858, 0]} s={[8, 8]} o={0.45} />
    <group position={[FRONT_DX, -0.86, 0]}>{children}</group>
  </PhotoShot>
);
/** stairs: floor at y=0 at the foot of the stairs (z=0), 9 steps of 0.17 x 0.30 going back to the gate */
const SR = 0.17, STR = 0.3;
const stairY = (z: number) => { if (z >= 0) return 0; const u = -z / STR; if (u >= 9) return 9 * SR; const fl = Math.floor(u), fr = u - fl; const sm = Math.min(1, fr / 0.25); return SR * (fl + sm * sm * (3 - 2 * sm)); };
const STAIRS_FIRE: [number, number, number][] = [[90, 345, 13], [221, 268, 8], [797, 282, 8], [1046, 452, 13]];
const StairsRoom: React.FC<{ f: number; len: number; z: [number, number]; c0: [number, number]; c1?: [number, number]; children?: React.ReactNode }> = ({ f, len, z, c0, c1, children }) => (
  <PhotoShot f={f} len={len} img="gota/stairs.png" cam={SCAM as PCam} z={z} c0={c0} c1={c1} fire={STAIRS_FIRE}>
    <ambientLight intensity={0.3} color="#b08a68" />
    <hemisphereLight args={["#6a5a4a", "#1a120a", 0.3]} />
    {[[-1.8, 2.2, 1.6, 5], [-1.6, 2.5, -1.8, 3], [1.6, 2.5, -1.8, 3], [1.8, 2.0, 2.2, 5]].map(([x, y, zz, i], k) => <pointLight key={k} position={[x, y, zz]} intensity={i} distance={6} decay={1.4} color="#ffa050" />)}
    <directionalLight position={[0.4, 4, 3]} intensity={0.45} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4} />
    <Catcher p={[0, 0.002, 2]} s={[6, 4]} o={0.5} />
    {Array.from({ length: 9 }).map((_, k) => <Catcher key={k} p={[0, (k + 1) * SR + 0.002, -(k + 0.5) * STR]} s={[2.9, STR]} o={0.5} />)}
    <Catcher p={[0, 9 * SR + 0.002, -2.4 - 1]} s={[2.9, 2]} o={0.5} />
    {children}
  </PhotoShot>
);

// ---------- scenes ----------
// 1. hook: the spoiler — day 3, drops hammering, close on the face (face sits above the subtitles)
const HOOK_HITS = [3, ...randHits("hk2", 24, 96, 15, 24), 140];
// 1. hook (3 shots, loop-ready: opens on an impact): face close -> the room (photo) -> the drop hitting in slow detail
const FACE_A = C([0.3, 1.95, 0.2], [-0.72, 1.0, 0.03], 38, 0.1), FACE_B = C([0.18, 1.88, 0.17], [-0.73, 1.0, 0.03], 36, 0.1);
const SIDE_A = C([0.5, 1.66, 0.14], [-0.75, 1.2, 0.02], 42, 0.13), SIDE_B = C([0.4, 1.63, 0.12], [-0.75, 1.2, 0.02], 41, 0.13);
const HookScene: React.FC<{ f: number }> = ({ f }) => {
  const fl = flinchAt(f, HOOK_HITS);
  if (f >= 52 && f < 100) return <FrontRoom f={f - 52} len={48} z={[1.12, 1.2]} c0={[0.42, 0.45]}>
    <Prisoner f={f} k={1.5} flinch={fl} tired={1} sweat={1} wet={1} pupil={0.75} breath={2} />
    {HOOK_HITS.map((h, i) => <Drop key={i} f={f} t0={h - 9} form={8} from={[FOREHEAD[0], 1.511, 0]} size={1.6} />)}
  </FrontRoom>;
  const shots: Shot[] = f < 52 ? [[0, FACE_A, FACE_B]] : [[0, SIDE_A, SIDE_B]];
  return <Stage f={f < 52 ? f : f - 100} len={f < 52 ? 52 : 50} shots={shots}>
    <Room f={f + 3000} candle={0.3}>
      <Prisoner f={f} k={1.5} flinch={fl} tired={1} sweat={1} wet={1} pupil={0.75} breath={2} />
      <Drops f={f} hits={HOOK_HITS.slice(0, -1)} />
      <Drop f={f} t0={HOOK_HITS[HOOK_HITS.length - 1] - 20} slow={20 / 9} form={22} />
    </Room>
  </Stage>;
};
// 2. dragged down the stairs (user's stairs image): two shots, he resists, stumbles on a step
const STRIDE = 0.235;
const DragScene: React.FC<{ f: number }> = ({ f }) => {
  const zf = interpolate(f, [0, 112], [-2.75, 1.25], { ...clamp, easing: (t) => t * (1.1 - 0.1 * t) });
  const ph = (zf + 2.75) / STRIDE, stumble = interpolate(f, [30, 34, 44], [0, 1, 0], clamp);
  const res = noise2D("rs", f / 12, 0);
  const pw = walkBP(ph * 1.5, 0.35);
  const pp: BP = { ...pw, lean: -10 + res * 6 + stumble * 26, headX: 14 + res * 8 + stumble * 20, headY: noise2D("hy", f / 10, 0) * 30, lArmX: -14, lArmZ: -46, lElbow: -14, rArmX: -14, rArmZ: 46, rElbow: -14, lKnee: pw.lKnee + 16 + stumble * 30, rKnee: pw.rKnee + 16, bob: pw.bob - 0.05 - stumble * 0.08 };
  const g = (side: -1 | 1, o: number): BP => { const w = walkBP(ph + o, 0.9); return side < 0 ? { ...w, lean: 4, rArmX: -24, rArmZ: 40, rElbow: -30 - stumble * 20 } : { ...w, lean: 4, lArmX: -24, lArmZ: -40, lElbow: -30 - stumble * 20 }; };
  const d = 0.56, y = stairY(zf);
  const shotA = f < 58;
  return <StairsRoom f={shotA ? f : f - 58} len={shotA ? 58 : 54} z={shotA ? [1.12, 1.16] : [1.3, 1.36]} c0={shotA ? [0.46, 0.36] : [0.47, 0.4]} c1={shotA ? [0.46, 0.38] : [0.47, 0.43]}>
    <Bot pos={[0, stairY(zf + 0.05), zf + 0.05]} ry={res * 0.12} p={pp} f={f} outfit="prisoner" eyes="scared" hood={false} mouth={stumble > 0.3 ? "scream" : "fear"} brows={1} look={[noise2D("lx", f / 8, 0), 0.4]} breath={2.5} />
    <Guard pos={[-d, stairY(zf - 0.08), zf - 0.08]} ry={0} p={g(-1, 0.3)} f={f} />
    <Guard pos={[d, stairY(zf - 0.04), zf - 0.04]} ry={0} p={g(1, 0.3 + Math.PI)} f={f + 50} />
  </StairsRoom>;
};
// 3. bound: pushed onto the board (photo) -> wrist cuff snaps -> straps thrown and cinched -> head stock + pin
export const BIND_EV = { cuff: 36, cuff2: 40, thigh: [46, 52], chest: [52, 58], tight: [58, 63], stock: [70, 80], pin: [82, 86] };
const StrapScene: React.FC<{ f: number }> = ({ f }) => {
  const E = BIND_EV, I = (a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: ez });
  const bind: Bind = { cuffs: [I(E.cuff - 5, E.cuff), I(E.cuff2 - 5, E.cuff2), I(36, 40), I(36, 40)], thigh: [I(E.thigh[0], E.thigh[1]), I(E.tight[0] - 4, E.tight[1] - 4)], chest: [I(E.chest[0], E.chest[1]), I(E.tight[0], E.tight[1])], stock: I(E.stock[0], E.stock[1]) };
  const toss = Math.max(interpolate(f, [E.thigh[0] - 6, E.thigh[0], E.thigh[1]], [0, 1, 0.2], clamp), interpolate(f, [E.chest[0] - 6, E.chest[0], E.chest[1]], [0, 1, 0.2], clamp));
  const pull = interpolate(f, [E.tight[0] - 2, E.tight[0] + 3, E.tight[1] + 4], [0, 1, 0], clamp);
  const press = f < 30 ? 1 : 0;
  const A: BP = { ...STAND, lean: 30 + toss * 8 - pull * 12, headX: 26, lArmX: -62 - toss * 46, lArmZ: -10, lElbow: -24 + toss * 18, rArmX: -64 - toss * 44, rArmZ: 10, rElbow: -24 + toss * 18 - pull * 40, lKnee: 14 + pull * 10, rKnee: 14 + pull * 10, bob: -0.04 - press * 0.02 };
  const B: BP = { ...STAND, lean: 34, headX: 28, lArmX: -66, lArmZ: -8, lElbow: -24, rArmX: -66, rArmZ: 8, rElbow: -24, lKnee: 16, rKnee: 16, bob: -0.05 };
  const C2: BP = { ...STAND, lean: 22, headX: 20, lArmX: -55, lArmZ: -14, lElbow: -40 + interpolate(f, [E.stock[0], E.stock[1]], [0, 30], clamp), rArmX: -55, rArmZ: 14, rElbow: -40 + interpolate(f, [E.stock[0], E.stock[1]], [0, 30], clamp) };
  const pr = <Prisoner f={f} k={0.9} struggle={interpolate(f, [0, 60, 90], [1, 0.8, 0.3], clamp)} look={-0.3 + noise2D("sl", f / 11, 0) * 0.45} mouth={f < E.stock[1] ? (f % 40 < 26 ? "scream" : "fear") : "fear"} gaze={[noise2D("g1", f / 6, 0), noise2D("g2", f / 7, 0) * 0.5]} breath={2.6} />;
  if (f < 30) return <FrontRoom f={f} len={30} z={[1.18, 1.25]} c0={[0.48, 0.55]}>
    {pr}<Guard pos={[0.1, 0, -0.62]} ry={0} p={A} f={f} /><Guard pos={[1.55, 0, 0.1]} ry={-Math.PI / 2} p={B} f={f + 30} />
  </FrontRoom>;
  return <Stage f={f} len={T4.stone - T4.strap} shots={[[30, C([0.42, 1.32, 0.72], [0.1, 0.95, 0.17], 36, 0.06), C([0.38, 1.3, 0.66], [0.1, 0.95, 0.17], 35, 0.06)], [44, C([0.95, 2.05, 2.4], [-0.15, 0.95, 0], 42, 0.12), C([0.75, 2.0, 2.25], [-0.2, 0.97, 0], 42, 0.12)], [66, C([0.3, 1.95, 0.25], [-0.72, 1.0, 0.03], 40, 0.1), C([0.2, 1.9, 0.22], [-0.73, 1.0, 0.03], 39, 0.1)]]}>
    <Room f={f + 900} bind={bind} valve={0} candle={0.9}>
      {pr}
      <Guard pos={[-0.1, 0, -0.72]} ry={0} p={A} f={f} />
      <Guard pos={[1.62, 0, 0.05]} ry={-Math.PI / 2} p={B} f={f + 30} />
      {f >= 66 && <Guard pos={[-1.5, 0, 0.35]} ry={Math.PI / 2 - 0.3} p={C2} f={f + 60} />}
    </Room>
  </Stage>;
};

// 4. the stone the lawyer watched: a drip hollowing rock as years pass
const STONE_HITS = randHits("sn2", 4, 100, 9, 10);
const rockTex = () => { const t = textTex("rock3", 1024, 512, (c) => {
  c.fillStyle = "#6c655d"; c.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 6000; i++) { const v = 60 + random("rk" + i) * 90; c.fillStyle = `rgba(${v},${v - 4},${v - 10},${0.15 + random("ra" + i) * 0.35})`; const r = 1 + random("rr" + i) * 12; c.beginPath(); c.arc(random("rx" + i) * 1024, random("ry" + i) * 512, r, 0, 7); c.fill(); }
  for (let i = 0; i < 26; i++) { c.strokeStyle = "rgba(22,20,18,0.6)"; c.lineWidth = 1 + random("lw" + i) * 2; c.beginPath(); let x = random("cx" + i) * 1024, y = random("cy" + i) * 512; c.moveTo(x, y); for (let k = 0; k < 9; k++) { x += (random(`c${i}${k}`) - 0.5) * 60; y += (random(`d${i}${k}`) - 0.3) * 50; c.lineTo(x, y); } c.stroke(); }
  for (let i = 0; i < 90; i++) { c.fillStyle = `rgba(${60 + random("mg" + i) * 30},${90 + random("mh" + i) * 40},${40},${0.12 + random("mo" + i) * 0.22})`; c.beginPath(); c.arc(random("mx" + i) * 1024, 300 + random("my" + i) * 212, 4 + random("mr" + i) * 22, 0, 7); c.fill(); }
  for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(230,225,210,${0.08 + random("ql" + i) * 0.1})`; c.fillRect(random("qx" + i) * 1024, random("qy" + i) * 512, 2 + random("qw" + i) * 10, 1 + random("qh" + i) * 3); }
}); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 1); return t; };
/** a real boulder: displaced icosphere, flattened, with a hollow carved by the drip (depth animated) */
const ROCKG: Record<string, THREE.BufferGeometry> = {};
const rockGeo = (hr: number, depth: number) => { const key = `${hr.toFixed(3)}_${depth.toFixed(3)}`; if (ROCKG[key]) return ROCKG[key];
  const g = new THREE.IcosahedronGeometry(0.5, 40); const pos = g.attributes.position as THREE.BufferAttribute, col = new Float32Array(pos.count * 3); const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i); const n = v.clone().normalize();
    let r = 0.5 * (1 + 0.13 * noise3D("r1", n.x * 1.6, n.y * 1.6, n.z * 1.6) + 0.05 * noise3D("r2", n.x * 5, n.y * 5, n.z * 5) + 0.018 * noise3D("r3", n.x * 14, n.y * 14, n.z * 14));
    let x = n.x * r * 1.05, y = n.y * r * 0.5, z = n.z * r * 0.9;
    if (y > 0.1) { y = 0.1 + (y - 0.1) * 0.55 + 0.012 * noise3D("r4", x * 9, 0, z * 9); }
    const d2 = (x * x + z * z) / (hr * hr); let wet = 0;
    if (y > 0.12 && d2 < 1.6) { const k = Math.max(0, 1 - d2); y -= depth * k * k * (3 - 2 * k) ; wet = Math.max(0, 1 - d2 / 1.6); }
    pos.setXYZ(i, x, y, z);
    const moss = Math.max(0, Math.min(1, (-y + 0.02) * 6)) * (0.5 + 0.5 * noise3D("mo", x * 6, y * 6, z * 6));
    col[i * 3] = (1 - wet * 0.45) * (1 - moss * 0.45); col[i * 3 + 1] = (1 - wet * 0.4) * (1 - moss * 0.15); col[i * 3 + 2] = (1 - wet * 0.3) * (1 - moss * 0.55);
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3)); g.computeVertexNormals(); return (ROCKG[key] = g); };
const caveWallGeo = (() => { let G: THREE.BufferGeometry | null = null; return () => { if (G) return G; const g = new THREE.PlaneGeometry(7, 3.6, 90, 50); const p = g.attributes.position as THREE.BufferAttribute; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, 0.35 * noise3D("cw", x * 0.6, y * 0.6, 0) + 0.08 * noise3D("cw2", x * 2.5, y * 2.5, 0)); } g.computeVertexNormals(); return (G = g); }; })();
const Pool: React.FC<{ y: number; r: number; f: number }> = ({ y, r, f }) => { const env = useEnv(); return <group position={[0, y, 0]}><mesh rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[r, 40]} /><meshStandardMaterial color="#1a2a34" roughness={0.02} metalness={0.6} envMap={env} envMapIntensity={1.6} /></mesh>
  {STONE_HITS.map((h, i) => { const s = (f - h) / 24; if (s < 0 || s > 1) return null; return <mesh key={i} position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.005 + s * r * 0.95, 0.009 + s * r, 32]} /><meshBasicMaterial color="#d8eef8" transparent opacity={(1 - s) * 0.6} depthWrite={false} /></mesh>; })}</group>; };
const StoneScene: React.FC<{ f: number }> = ({ f }) => {
  const rock = rockTex(), g = interpolate(f, [0, 98], [0.1, 1], { ...clamp, easing: (t) => t * t * 0.6 + t * 0.4 });
  const hr = 0.03 + 0.08 * Math.round(g * 25) / 25, depth = 0.004 + 0.06 * Math.round(g * 25) / 25;
  const top = 0.18;
  return (
    <Stage f={f} len={T4.first - T4.stone} fog={[3, 10]} shots={[[0, C([0.0, 0.85, 1.2], [0, 0.42, 0], 38, 0.1), C([0.1, 0.8, 1.08], [0, 0.4, 0], 38, 0.1)], [50, C([0.45, 0.95, 0.75], [0, 0.2, 0], 36, 0.08), C([0.4, 0.9, 0.68], [0, 0.2, 0], 35, 0.08)]]}>
      <ambientLight intensity={0.3} color="#6a7aa0" />
      <spotLight position={[0.9, 2.4, 1.3]} target-position={[0, 0.3, 0]} angle={0.55} penumbra={0.8} intensity={17} distance={6} color="#d4e2f6" castShadow />
      <pointLight position={[-1.2, 0.9, 0.5]} intensity={2.4} distance={3.5} color="#ff9a4a" />
      <pointLight position={[0.6, 1.6, -0.6]} intensity={2.2} distance={3.2} color="#ffa860" />
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[8, 8]} /><meshStandardMaterial map={rock} roughness={0.8} color="#7a7268" /></mesh>
      <mesh position={[0, 1.4, -1.5]} geometry={caveWallGeo()}><meshStandardMaterial map={rock} bumpMap={rock} bumpScale={3} roughness={0.9} /></mesh>
      <mesh position={[0, 0.06, 0]} geometry={rockGeo(hr, depth)} castShadow receiveShadow><meshPhysicalMaterial map={rock} bumpMap={rock} bumpScale={3} vertexColors roughness={0.72} clearcoat={0.35} clearcoatRoughness={0.4} /></mesh>
      <Pool y={0.06 + top - depth * 0.75} r={hr * 0.62} f={f} />
      {[[-0.6, 0.25, 0.35], [0.5, -0.3, 0.25], [0.15, -0.6, 0.3], [-0.35, -0.5, 0.2]].map(([x, z, h], i) => <mesh key={i} position={[x, 2.0 - h / 2, z - 0.4]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.05 + h * 0.08, h, 10]} /><meshStandardMaterial map={rock} roughness={0.5} /></mesh>)}
      <mesh position={[0, 1.62, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.07, 0.48, 16]} /><meshStandardMaterial map={rock} roughness={0.35} /></mesh>
      {STONE_HITS.map((h, i) => <Drop key={i} f={f} t0={h - 10} slow={10 / 9} form={6} from={[0, 1.38, 0]} to={[0, 0.06 + top - depth * 0.75, 0]} skin={false} />)}
    </Stage>
  );
};
// 5. the guard pulls the plug from the bucket -> the first drop forms and falls in slow motion
const FIRST_HIT = 65;
const FirstScene: React.FC<{ f: number }> = ({ f }) => {
  const v = interpolate(f, [8, 18], [0, 1], { ...clamp, easing: ez });
  const hand = interpolate(f, [0, 6, 18, 26], [0.5, 1, 1, 0.4], clamp);
  const G: BP = mixBP({ ...STAND }, { ...STAND, headX: -18, lean: 6, lArmX: -122, lArmZ: -6, lElbow: -18 - v * 30 }, hand);
  const wet = interpolate(f, [FIRST_HIT, FIRST_HIT + 8], [0, 0.35], clamp);
  return (
    <Stage f={f} len={T4.lapse - T4.first} shots={[[0, C([0.15, 1.8, 1.45], [-0.78, 1.55, -0.1], 40), C([0.08, 1.78, 1.36], [-0.78, 1.55, -0.1], 39)], [26, C([0.5, 1.66, 0.14], [-0.75, 1.2, 0.02], 42, 0.13), C([0.4, 1.63, 0.12], [-0.75, 1.2, 0.02], 41, 0.13)]]}>
      <Room f={f + 1800} valve={v} candle={0.85}>
        <Prisoner f={f} k={0.4} flinch={flinchAt(f, [FIRST_HIT])} eyes={f >= FIRST_HIT && f < FIRST_HIT + 9 ? "closed" : "scared"} wet={wet} mouth={f < FIRST_HIT ? "flat" : undefined} brows={0.6} gaze={[0, 1]} breath={1.6} />
        {f < 26 && <Guard pos={[-0.8, 0, -0.5]} ry={0} p={G} f={f} />}
        <Drop f={f} t0={FIRST_HIT - 22} slow={22 / 9} form={30} />
      </Room>
    </Stage>
  );
};
// 6. time-lapse in three fast angles: the real room going day/night, overhead, his face falling apart
const LAPSE_HITS = randHits("lp2", 0, 134, 3, 8);
const LapseScene: React.FC<{ f: number }> = ({ f }) => {
  const q = interpolate(f, [0, 134], [0, 1], clamp);
  const cyc = q * 2.5, day = Math.pow(Math.max(0, Math.sin(cyc * Math.PI * 2 - Math.PI / 2) * 0.5 + 0.5), 0.8), sun = cyc % 1;
  const pr = <Prisoner f={f * 2.2} k={0.5 + q * 1.4} flinch={flinchAt(f, LAPSE_HITS) * 0.7} struggle={q * 0.5} tired={q} sweat={q} wet={0.4 + q * 0.6} pupil={1 - q * 0.3} breath={1.5 + q * 2} />;
  if (f < 45) { const night = 1 - day; const c = (a: number, b: number) => Math.round(a + (b - a) * night);
    return <FrontRoom f={f} len={45} z={[1.05, 1.12]} c0={[0.45, 0.5]} light={0.7 + 0.5 * day} fireSpeed={6} tint={`rgb(${c(255, 120)},${c(245, 135)},${c(235, 175)})`}>
      {pr}{LAPSE_HITS.filter((h) => h < 50).map((h, i) => <Drop key={i} f={f} t0={h - 9} form={3} from={[FOREHEAD[0], 1.511, 0]} size={1.6} />)}
    </FrontRoom>; }
  const shots: Shot[] = f < 90 ? [[45, C([1.1, 3.2, 1.9], [-0.15, 0.7, -0.3], 44), C([0.8, 3.15, 2.1], [-0.2, 0.7, -0.3], 44)]] : [[90, C([0.3, 1.95, 0.2], [-0.72, 1.0, 0.03], 38, 0.1), C([0.2, 1.9, 0.18], [-0.73, 1.0, 0.03], 37, 0.1)]];
  return (
    <Stage f={f} len={f < 90 ? 90 : 134} shots={shots}>
      <Room f={f * 9} candle={interpolate(q, [0, 1], [0.95, 0.08])} day={day} sun={sun} torch={0.5 + 0.5 * (1 - day)} tspeed={1}>
        {pr}<Drops f={f} hits={LAPSE_HITS} form={3} />
      </Room>
    </Stage>
  );
};
// 7. can't sleep (lids sink, a drop snaps them open) / can't move (pulls against the straps)
const SLEEP_HIT = 20;
const SleepScene: React.FC<{ f: number }> = ({ f }) => (
  <Stage f={f} len={T4.death - T4.sleep} shots={[[0, C([0.3, 1.95, 0.2], [-0.72, 1.0, 0.03], 38, 0.1), C([0.18, 1.88, 0.17], [-0.73, 1.0, 0.03], 36, 0.1)], [31, C([0.75, 1.62, 1.35], [0.0, 0.98, 0], 40, 0.06), C([0.6, 1.6, 1.25], [-0.05, 0.98, 0], 40, 0.06)]]}>
    <Room f={f + 2600} candle={0.1} torch={0.85}>
      <pointLight position={[0.3, 1.9, 1.1]} intensity={f >= 31 ? 2.5 : 0} distance={2.6} color="#ffc896" />
      <Prisoner f={f} k={1.3} flinch={flinchAt(f, [SLEEP_HIT])} eyes={f < SLEEP_HIT - 4 ? "closed" : "scared"} lid={f < SLEEP_HIT ? interpolate(f, [0, 12], [0.5, 1], clamp) : interpolate(f, [SLEEP_HIT, SLEEP_HIT + 3], [0, 0.4], clamp)} struggle={f >= 31 ? 1 : 0} tired={1} sweat={1} wet={1} pupil={0.7} breath={3} />
      <Drop f={f} t0={SLEEP_HIT - 9} form={10} />
      <Drop f={f} t0={58} form={10} />
    </Room>
  </Stage>
);
// 8. madness and death: twitching, ECG racing, last slow drop, breathing stops, lids half close, eyes go still; X only at the very end
const DEATH_HITS = [10, 26, 38, 48, 56];
const LAST = 91;
const DeathScene: React.FC<{ f: number }> = ({ f }) => {
  const still = interpolate(f, [LAST, LAST + 16], [1, 0], clamp), xk = interpolate(f, [LAST + 18, LAST + 26], [0, 1], { ...clamp, easing: eo });
  const torch = interpolate(f, [LAST, LAST + 26], [0.85, 0.3], clamp), dead = f >= LAST + 18;
  return (
    <Stage f={f} len={T4.end - T4.death} shots={[[0, C([0.18, 1.88, 0.17], [-0.73, 1.0, 0.03], 36, 0.1), C([0.3, 1.95, 0.22], [-0.72, 1.0, 0.03], 38, 0.1)], [48, SIDE_A, SIDE_B], [66, C([0.45, 1.64, 0.13], [-0.75, 1.2, 0.02], 41, 0.13), C([0.37, 1.62, 0.12], [-0.75, 1.2, 0.02], 40, 0.13)], [LAST + 6, C([0.2, 1.9, 0.18], [-0.72, 1.0, 0.03], 36, 0.1), C([0.55, 2.3, 0.35], [-0.66, 0.98, 0.03], 42, 0.1)]]}>
      <Room f={f + 3300} candle={0.06} torch={torch}>
        <Prisoner f={f} k={2.2 * still} flinch={flinchAt(f, [...DEATH_HITS, LAST]) * Math.max(still, f < LAST + 8 ? 1 : 0)} eyes={dead ? "dead" : "scared"} xk={xk} lid={f >= LAST ? interpolate(f, [LAST + 2, LAST + 14], [0, 0.65], clamp) : undefined} pupil={f >= LAST ? 0.45 : 0.55} gaze={f >= LAST ? [0, 0.2] : undefined} mouth={f >= LAST + 4 ? "slack" : undefined} struggle={f < 60 ? 0.7 : 0} tired={1} sweat={1} wet={1} still={f > LAST + 10} breath={interpolate(f, [0, LAST], [3.5, 1.2], clamp)} look={LOOK + interpolate(f, [LAST + 4, LAST + 26], [0, 0.35], clamp)} />
        <Drops f={f} hits={DEATH_HITS} />
        <Drop f={f} t0={LAST - 22} slow={22 / 9} form={18} />
      </Room>
    </Stage>
  );
};
// 9. end: the real room, the drip goes on; the last drop is still falling when the video loops to the first impact
const END_HITS = [14, 40, 66];
const EndScene: React.FC<{ f: number }> = ({ f }) => (
  <FrontRoom f={f} len={T4.fin - T4.end} z={[1.0, 1.1]} c0={[0.45, 0.52]} c1={[0.42, 0.5]} light={0.7}>
    <Prisoner f={f} k={0} eyes="dead" tired={1} wet={1} look={LOOK + 0.35} still mouth="slack" />
    {[...END_HITS, 87].map((h, i) => <Drop key={i} f={f} t0={h - 9} form={10} from={[FOREHEAD[0], 1.511, 0]} size={1.6} />)}
  </FrontRoom>
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
  [T4.hook, T4.drag, Sc(HookScene, HookHUD)], [T4.drag, T4.strap, Sc(DragScene, DragHUD)], [T4.strap, T4.stone, Sc(StrapScene, OriginCard)], [T4.stone, T4.first, Sc(StoneScene, StoneHUD)],
  [T4.first, T4.lapse, Sc(FirstScene, FirstHUD)], [T4.lapse, T4.sleep, Sc(LapseScene, LapseFX)], [T4.sleep, T4.death, Sc(SleepScene, SleepHUD)],
  [T4.death, T4.end, Sc(DeathScene, DeathHUD)], [T4.end, T4.fin, Sc(EndScene, EndHUD)],
];
export const GOTA4_SFX = {
  T: T4,
  skin: [...HOOK_HITS.map((h) => T4.hook + h), T4.first + FIRST_HIT, T4.sleep + SLEEP_HIT, T4.sleep + 67, ...DEATH_HITS.map((h) => T4.death + h), T4.death + LAST, ...END_HITS.map((h) => T4.end + h)],
  lapse: LAPSE_HITS.map((h) => T4.lapse + h), stone: STONE_HITS.map((h) => T4.stone + h), last: T4.death + LAST,
  bind: Object.fromEntries(Object.entries(BIND_EV).map(([k, v]) => [k, Array.isArray(v) ? v.map((x) => x + T4.strap) : v + T4.strap])),
  plug: T4.first + 8, stumble: T4.drag + 32, flashes: [T4.strap + 18, T4.death + LAST],
};
const PUSH = [...GOTA4_SFX.skin, ...GOTA4_SFX.lapse].sort((a, b) => a - b);
const XF = 4;
const Scene: React.FC<{ C: React.FC<{ f: number }>; i: number }> = ({ C: Comp, i }) => {
  const g = useCurrentFrame(), f = g - (i > 0 ? XF : 0);
  const op = i > 0 ? interpolate(g, [0, XF], [0, 1], clamp) : 1;
  const st = LIST[i][0], n = PUSH.filter((t) => t >= st && t <= st + f).length; // small cumulative push on each impact, never springs back
  return <AbsoluteFill style={{ opacity: op, transform: `scale(${1 + Math.min(0.05, n * 0.006)})`, transformOrigin: "50% 40%" }}><Comp f={f} /></AbsoluteFill>;
};
const Subs: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= T4.end - 4) return null;
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
const Flash: React.FC = () => { const g = useCurrentFrame(); const o = Math.max(0, ...GOTA4_SFX.flashes.map((t) => (g >= t && g < t + 5 ? (1 - (g - t) / 5) * 0.35 : 0))); return o > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: o, mixBlendMode: "screen" }} /> : null; };
const Grade: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={W} height={H} style={{ position: "absolute", opacity: 0.07, mixBlendMode: "overlay" }}><filter id="gn2"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 11} /></filter><rect width={W} height={H} filter="url(#gn2)" /></svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, transparent 58%, rgba(0,0,0,0.38) 100%)" }} />
    </AbsoluteFill>
  );
};
export const Gota4: React.FC<{ audio?: boolean; subs?: boolean }> = ({ audio = false, subs = true }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    {LIST.map(([a, b, Comp], i) => <Sequence key={i} from={i > 0 ? a - XF : a} durationInFrames={b - a + (i > 0 ? XF : 0)}><Scene C={Comp} i={i} /></Sequence>)}
    <Grade />
    <Flash />
    {subs && <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 64%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.35) 80%, transparent 88%)", pointerEvents: "none" }} />}
    {subs && <Subs />}
    {audio && <Audio src={staticFile("gota/mix4.wav")} />}
  </AbsoluteFill>
);
