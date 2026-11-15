import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Stage, Shot, cam as C, clamp, ez, sm, W, H } from "./Common";
import { StrappadoSet, RatSet, RackSet } from "./SetsIn";
import { TowerExt, MuseumSet, SquareSet, SicilySet, MarshSet } from "./SetsOut";
import { Room, Prisoner, Drops, Pool, rockGeo, rockTex, caveWallGeo, randHits, flinchAt } from "../Gota/Video7";
import { Drop, FOREHEAD } from "../Gota/Dungeon4";
import { PhotoShot, PCAMS, Fire as PFire } from "./Photo";
import { RackPhoto3D, SquarePhoto3D, SicilyPhoto3D, MuseumPhoto3D, CorridorPhoto3D, DripPhoto3D, RatPhoto3D, InqPhoto3D } from "./PhotoSets";
import { Stamp, Big, Counter, Split, Signatures, Grade } from "./UI";
import { Subs3, Dossier, MiniMap, Blueprint, Ink, Tally, ECG, Poll, SubNudge, Source, Letterbox, Burn, Card3, EndScreen3 } from "./UI3";
import { Subs5, TortTitle, CrueltyMeter, RankList, GridTr, XRay, WallText, Rain, RedMood, GodRays } from "./UI5";
import { HorseSet, KeelSet } from "./SetsNew";
import TIM from "./timing5.json";

const FPS = 30;
const LS = (TIM as any).lines as { sec: string; start: number; end: number }[];
const idx = (sec: string, k: number) => { let c = 0; for (let i = 0; i < LS.length; i++) if (LS[i].sec === sec) { if (c === k) return i; c++; } throw new Error("line " + sec + k); };
const L = (sec: string, k: number) => Math.round((LS[idx(sec, k)].start - 0.1) * FPS);
const LE = (sec: string, k: number) => Math.round(LS[idx(sec, k)].end * FPS);
export const TORT5_FRAMES = Math.round(((TIM as any).dur + 0.4) * FPS);
const END = TORT5_FRAMES;
const k01 = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: ez });
type SC = { at: number; C: React.FC<{ f: number; len: number }>; tr?: "fade" | "dark" | "cut" | "flash" | "burn" };

/* ---------- photo helpers ---------- */
const FIRE: Record<string, PFire[]> = {
  p11: [[318, 85, 22], [965, 350, 8]], p12: [[180, 120, 26], [735, 300, 12], [878, 395, 7], [1250, 300, 12]], p13: [[522, 410, 7]], p14: [[1295, 150, 20]],
  p15: [[138, 250, 18], [460, 405, 10], [1278, 385, 10], [1470, 320, 16]], p16: [[225, 85, 18]], p6: [[150, 240, 14], [580, 365, 8], [818, 375, 8], [1270, 330, 10], [70, 520, 30]], p8: [[95, 600, 22], [1290, 600, 22]], p7: [], p9: [],
};
const RAYS: Record<string, { x: number; y: number; ang?: number; col?: string; k?: number }> = { p13: { x: 1270, y: 30, ang: 18, k: 0.9 }, p15: { x: 1090, y: 0, ang: 8, col: "255,200,150", k: 0.5 }, p6: { x: 420, y: 120, ang: 28, k: 0.8 }, p16: { x: 960, y: 0, ang: 2, k: 0.8 } };
const IMG: Record<string, string> = { p6: "tort/ph6.png", p7: "tort/ph7.png", p8: "tort/ph8.png", p9: "tort/ph9.png", p11: "tort/ph11.png", p12: "tort/ph12.png", p13: "tort/ph13.png", p14: "tort/ph14.png", p15: "tort/ph15.png", p16: "tort/ph16.png" };
const Ph: React.FC<{ f: number; len: number; k: string; z?: [number, number]; c0?: [number, number]; c1?: [number, number]; exp?: number; tint?: string; rot?: [number, number]; blur?: [number, number]; children?: React.ReactNode }> = ({ f, len, k, z, c0, c1, exp, tint, rot, blur, children }) => {
  const r = rot ? rot[0] + (rot[1] - rot[0]) * ez(Math.min(1, f / Math.max(1, len))) : 0;
  return <AbsoluteFill style={{ transform: r ? `rotate(${r}deg) scale(${1 + Math.abs(r) / 40})` : undefined }}>
    <PhotoShot f={f} len={len} img={IMG[k]} cam={PCAMS[k]} z={z} c0={c0} c1={c1} fire={FIRE[k]} exp={(exp ?? 1.05) * 1.25} tint={tint} blur={blur} over={RAYS[k] ? <GodRays f={f} {...RAYS[k]} /> : undefined}>{children}</PhotoShot>
  </AbsoluteFill>;
};

/* ---------- 3D helpers (from v2) ---------- */
const Strap: React.FC<{ f: number; len: number; shots: Shot[]; lift?: (f: number) => number; weight?: number; pain?: number; exp?: number; who?: any }> = ({ f, len, shots, lift = () => 0, weight = 0, pain = 0, exp = 1.2, who }) => {
  const l = lift(f); return <Stage f={f} len={len} shots={shots} exp={exp * 1.25} fog={["#08080b", 9, 22]}><StrappadoSet f={f} lift={l} weight={weight} sway={l} crank={l * 14} pain={pain * l} who={who} /></Stage>;
};
const Rat: React.FC<{ f: number; len: number; shots: Shot[]; potOn?: number; heat?: number; ratIn?: number; panic?: number; cut?: number; lit?: number; exp?: number }> = ({ f, len, shots, potOn = 0, heat = 0, ratIn = 0, panic = 0, cut = 0, lit = 1, exp = 1.25 }) =>
  <Stage f={f} len={len} shots={shots} exp={exp} fog={["#08080b", 7, 16]}><RatSet f={f} potOn={potOn} heat={heat} ratIn={ratIn} panic={panic} cut={cut} lit={lit} /></Stage>;
const Drip: React.FC<{ f: number; len: number; shots: Shot[]; hits?: number[]; k?: number; tired?: number; day?: number; fspeed?: number; eyes?: "scared" | "closed"; exp?: number }> = ({ f, len, shots, hits = [], k = 0.4, tired = 0, day = 0, fspeed = 1, eyes, exp = 1.25 }) => {
  const g = f * fspeed;
  return <Stage f={f} len={len} shots={shots} exp={exp} fog={["#08080b", 7, 16]}>
    <Room f={g} candle={0.8 - tired * 0.6} day={day}>
      <Prisoner f={g} k={k + tired} flinch={flinchAt(f, hits)} tired={tired} sweat={tired} wet={0.3 + tired * 0.6} eyes={eyes ?? (hits.some((h) => f >= h && f < h + 8) ? "closed" : "scared")} brows={0.7} gaze={[0, 1]} breath={1.5 + tired * 1.5} />
      <Drops f={f} hits={hits} />
    </Room>
  </Stage>;
};
const Rack: React.FC<{ f: number; len: number; shots: Shot[]; turn?: number; strain?: number; empty?: boolean; exp?: number }> = ({ f, len, shots, turn = 0, strain = 0, empty, exp = 1.3 }) =>
  <Stage f={f} len={len} shots={shots} exp={exp} fog={["#08080b", 9, 22]}><RackSet f={f} turn={turn} strain={strain} noPrisoner={empty} /></Stage>;
const Tow: React.FC<{ f: number; len: number; shots: Shot[] }> = ({ f, len, shots }) => <Stage f={f} len={len} shots={shots} exp={1.7} fog={["#0a0e18", 25, 90]}><TowerExt f={f} /></Stage>;
const Mus: React.FC<{ f: number; len: number; shots: Shot[]; open?: number; dim?: number; spot?: number; exp?: number }> = ({ f, len, shots, open = 0, dim = 1, spot = 1, exp = 1.2 }) =>
  <Stage f={f} len={len} shots={shots} exp={exp * 1.3} fog={["#050404", 8, 20]}><MuseumSet f={f} open={open} dim={dim} spot={spot} /></Stage>;
const Sq: React.FC<{ f: number; len: number; shots: Shot[]; stage: "tie" | "strike" | "raised" | "judge" | "final"; sky?: "dusk" | "storm" | "sunset"; exp?: number; dead?: number; blowAt?: number }> = ({ f, len, shots, stage, sky = "dusk", exp = 1.1, dead = 0, blowAt = 20 }) =>
  <Stage f={f} len={len} shots={shots} exp={exp} fog={[sky === "storm" ? "#16181e" : "#3a2430", 18, 60]}><SquareSet f={f} stage={stage} sky={sky} dead={dead} blowAt={blowAt} /></Stage>;
const Sic: React.FC<{ f: number; len: number; shots: Shot[]; heat?: number; door?: number; roar?: number; sculptor?: boolean; victim?: "none" | "walk" | "tyrant"; walk?: number; exp?: number }> = ({ f, len, shots, heat = 0, door = 0, roar = 0, sculptor, victim = "none", walk = 0, exp = 1.05 }) =>
  <Stage f={f} len={len} shots={shots} exp={exp} fog={["#5a3a3a", 18, 70]}><SicilySet f={f} heat={heat} door={door} roar={roar} sculptor={sculptor} victim={victim} walk={walk} /></Stage>;
const Mar: React.FC<{ f: number; len: number; shots: Shot[]; honey?: number; flies?: number; day?: number; night?: boolean; guards?: boolean; exp?: number }> = ({ f, len, shots, honey = 1, flies = 0, day = 0, night, guards, exp = 1.05 }) =>
  <Stage f={f} len={len} shots={shots} exp={night ? exp * 1.4 : exp} fog={[night ? "#0a0e18" : "#8a8a68", 14, 50]}><MarshSet f={f} honey={honey} flies={flies} day={day} night={night} guards={guards} /></Stage>;
const Hor: React.FC<{ f: number; len: number; shots: Shot[]; rider?: number; weights?: number; pain?: number; civil?: boolean; sky?: "dusk" | "sunset" | "haze"; exp?: number }> = ({ f, len, shots, rider = 1, weights = 0, pain = 0, civil = false, sky = "sunset", exp = 1.2 }) =>
  <Stage f={f} len={len} shots={shots} exp={exp} fog={["#6a4a3a", 18, 60]}><HorseSet f={f} rider={rider} weights={weights} pain={pain} civil={civil} sky={sky} /></Stage>;
const Kee: React.FC<{ f: number; len: number; shots: Shot[]; mode: "deck" | "side" | "under"; pull?: number; sailor?: boolean; splash?: number; struggle?: number; exp?: number }> = ({ f, len, shots, mode, pull = 0, sailor = true, splash = 0, struggle = 1, exp = 1.2 }) =>
  <Stage f={f} len={len} shots={shots} exp={exp} fog={mode === "under" ? ["#0f4050", 2, 16] : ["#7a6070", 30, 120]}><KeelSet f={f} mode={mode} pull={pull} sailor={sailor} splash={splash} struggle={struggle} /></Stage>;
const StoneShot: React.FC<{ f: number; len: number }> = ({ f, len }) => {
  const hits = randHits("tsn", 4, len, 10, 11); const rock = rockTex(), g = interpolate(f, [0, len], [0.1, 1], clamp);
  const hr = 0.03 + 0.08 * Math.round(g * 25) / 25, depth = 0.004 + 0.06 * Math.round(g * 25) / 25, top = 0.18;
  return <Stage f={f} len={len} shots={[[0, C([0.0, 0.75, 1.5], [0, 0.42, 0], 34), C([0.35, 0.7, 1.2], [0, 0.35, 0], 32)]]} fog={["#08080b", 3, 10]}>
    <ambientLight intensity={0.3} color="#6a7aa0" />
    <spotLight position={[0.9, 2.4, 1.3]} angle={0.55} penumbra={0.8} intensity={17} distance={6} color="#d4e2f6" castShadow />
    <pointLight position={[-1.2, 0.9, 0.5]} intensity={2.4} distance={3.5} color="#ff9a4a" />
    <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[8, 8]} /><meshStandardMaterial map={rock} roughness={0.8} color="#7a7268" /></mesh>
    <mesh position={[0, 1.4, -1.5]} geometry={caveWallGeo()}><meshStandardMaterial map={rock} bumpMap={rock} bumpScale={3} roughness={0.9} /></mesh>
    <mesh position={[0, 0.06, 0]} geometry={rockGeo(hr, depth)} castShadow receiveShadow><meshPhysicalMaterial map={rock} bumpMap={rock} bumpScale={3} vertexColors roughness={0.72} clearcoat={0.35} clearcoatRoughness={0.4} /></mesh>
    <Pool y={0.06 + top - depth * 0.75} r={hr * 0.62} f={f} />
    <mesh position={[0, 1.62, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.07, 0.48, 16]} /><meshStandardMaterial map={rock} roughness={0.35} /></mesh>
    {hits.map((h, i) => <Drop key={i} f={f} t0={h - 10} slow={10 / 9} form={6} from={[0, 1.38, 0]} to={[0, 0.06 + top - depth * 0.75, 0]} skin={false} />)}
  </Stage>;
};
const Black: React.FC<{ f: number; len: number }> = () => <AbsoluteFill style={{ background: "#000" }} />;
const HEADM: [number, number, number] = [1.38, 0.12, -0.43];
const FH = FOREHEAD as [number, number, number];
const STW = C([3.2, 2.0, 5.0], [0, 1.7, -0.6], 46);
const DRW = C([1.6, 2.1, 2.6], [-0.3, 1.0, 0], 44), DRW2 = C([1.3, 2.0, 2.3], [-0.35, 1.0, 0], 42);
const FACE = (a = 0) => C([-0.1 + a, 1.55, 0.95], [-0.72, 1.12, 0], 34);

/* ---------------- the timeline ---------------- */
const RAW: SC[] = [
  /* HOOK (fast montage) */
  { at: 0, tr: "cut", C: ({ f, len }) => <Drip f={f} len={len} hits={[12]} exp={1.3} shots={[[0, C([-0.3, 1.36, 0.62], [-0.76, 1.2, 0], 30), C([-0.36, 1.33, 0.55], [-0.76, 1.2, 0], 28)]]} /> },
  { at: L("hook", 0) + 34, tr: "cut", C: ({ f, len }) => <Ph f={f} len={len} k="p13" z={[1.25, 1.4]} c0={[0.5, 0.45]}><DripPhoto3D f={f} hits={[8, 34, 60]} /></Ph> },
  { at: L("hook", 1), tr: "flash", C: ({ f, len }) => { const ph = Math.floor(f / 10); return <Mar f={f} len={len} flies={1} day={Math.min(1, f / len)} night={ph % 2 === 1} exp={1.3} shots={[[0, C([4.2, 1.5, 3.0], [0.5, 0.2, 0], 36), C([3.4, 1.2, 2.4], [0.6, 0.2, 0], 32)]]} />; } },
  { at: L("hook", 2), tr: "cut", C: ({ f, len }) => <Mar f={f} len={len} night flies={0.3} day={1} exp={1.9} shots={[[0, C([5.5, 2.0, 4.5], [0.5, 0.2, 0], 38), C([6.5, 2.6, 5.5], [0.5, 0.2, 0], 40)]]} /> },
  { at: L("hook", 3), tr: "dark", C: ({ f, len }) => <Ph f={f} len={len} k="p12" z={[1.0, 1.3]} c0={[0.5, 0.5]} exp={1.2}><CorridorPhoto3D f={f} len={len} prisoner /></Ph> },
  /* CONTEXT */
  { at: L("ctx", 0), tr: "dark", C: ({ f, len }) => <Tow f={f} len={len} shots={[[0, C([14, 3, 30], [0, 8, 0], 40), C([9, 2.6, 25], [0, 8.5, 0], 40)]]} /> },
  { at: L("ctx", 2), tr: "dark", C: ({ f, len }) => <Ph f={f} len={len} k="p15" z={[1.0, 1.12]} c0={[0.5, 0.6]} blur={[6, 0]}><InqPhoto3D f={f} lift={0} /></Ph> },
  /* 1. WATER DROP */
  { at: L("t5", 1), tr: "dark", C: ({ f, len }) => <Ph f={f} len={len} k="p13" z={[1.0, 1.1]} c0={[0.5, 0.5]} c1={[0.55, 0.5]}><DripPhoto3D f={f} hits={[40, 95, 150]} /></Ph> },
  { at: L("t5", 3), C: ({ f, len }) => <Ph f={f} len={len} k="p13" z={[1.15, 1.3]} c0={[0.5, 0.42]}><DripPhoto3D f={f} hits={[30, 80]} /></Ph> },
  { at: L("t5", 4), tr: "dark", C: StoneShot },
  { at: L("t5", 6), tr: "dark", C: ({ f, len }) => <Ph f={f} len={len} k="p13" z={[1.3, 1.45]} c0={[0.5, 0.45]}><DripPhoto3D f={f} hits={[70]} /></Ph> },
  { at: L("t5", 7), C: ({ f, len }) => <Drip f={f} len={len} hits={[52]} shots={[[0, C([0.2, 1.75, 1.3], [-0.7, 1.15, 0], 36), C([-0.1, 1.6, 0.85], [-0.75, 1.15, 0], 32)]]} /> },
  { at: L("t5", 8), tr: "cut", C: ({ f, len }) => <Drip f={f} len={len} hits={[14]} shots={[[0, C([FH[0] + 0.02, FH[1] + 0.08, 0.06], [FH[0] + 0.02, 2.2, 0.0], 60), C([FH[0] + 0.02, FH[1] + 0.08, 0.06], [FH[0], 2.2, 0.02], 56)]]} /> },
  { at: L("t5", 9), C: ({ f, len }) => <Ph f={f} len={len} k="p13" z={[1.0, 1.06]} c0={[0.35, 0.5]}><DripPhoto3D f={f} hits={randHits("t5l", 7, len, 7, 16)} tired={k01(f, 0, len) * 0.7} /></Ph> },
  { at: L("t5", 13), C: ({ f, len }) => <Drip f={f} len={len} hits={randHits("lq", 10, len, 14, 22)} tired={0.8} shots={[[0, FACE(), FACE(0.04)]]} /> },
  { at: L("t5", 15), C: ({ f, len }) => <Ph f={f} len={len} k="p13" z={[1.1, 1.0]} c0={[0.5, 0.5]} exp={0.7}><DripPhoto3D f={f} hits={randHits("tv", 4, len, 20, 30)} tired={0.6} /></Ph> },
  { at: L("t5", 19), tr: "dark", C: ({ f, len }) => <Drip f={f} len={len} tired={0.95} eyes="closed" exp={0.9} shots={[[0, FACE(0.02), FACE(-0.02)]]} /> },
  /* 2. WOODEN HORSE */
  { at: L("wh", 1), tr: "dark", C: ({ f, len }) => <Hor f={f} len={len} rider={0} shots={[[0, C([7, 3.2, 8], [0, 1.0, 0], 40), C([5.6, 2.7, 6.6], [0, 1.1, 0], 40)]]} /> },
  { at: L("wh", 2), C: ({ f, len }) => <Hor f={f} len={len} rider={0} shots={[[0, C([1.6, 1.75, 1.5], [0, 1.42, 0], 32), C([0.9, 1.7, 1.6], [-0.4, 1.42, 0], 32)]]} /> },
  { at: L("wh", 3), C: ({ f, len }) => <Hor f={f} len={len} pain={0.2} shots={[[0, C([0.3, 1.7, 4.2], [0, 1.4, 0], 38), C([0.6, 1.6, 3.5], [0, 1.4, 0], 36)]]} /> },
  { at: L("wh", 4), C: ({ f, len }) => <Hor f={f} len={len} pain={0.3} shots={[[0, C([-1.8, 1.7, 1.3], [0, 1.4, 0], 36), C([-1.6, 1.65, 1.0], [0, 1.4, 0], 34)]]} /> },
  { at: L("wh", 5), tr: "cut", C: ({ f, len }) => <Hor f={f} len={len} weights={k01(f, 8, 30)} pain={k01(f, 20, 40) * 0.7} shots={[[0, C([1.4, 0.7, 2.2], [0, 0.5, 0], 38), C([1.2, 0.8, 1.9], [0, 0.6, 0], 36)]]} /> },
  { at: L("wh", 6), tr: "cut", C: ({ f, len }) => <Hor f={f} len={len} weights={1} pain={1} shots={[[0, C([1.5, 1.85, 1.1], [0, 1.68, 0], 32), C([1.25, 1.82, 0.9], [0, 1.68, 0], 30)]]} /> },
  { at: L("wh", 7), tr: "dark", C: ({ f, len }) => <Hor f={f} len={len} weights={1} pain={0.7} sky="dusk" shots={[[0, C([-7, 4, 8], [0, 1.1, 0], 38), C([-5.8, 3.4, 6.8], [0, 1.1, 0], 38)]]} /> },
  { at: L("wh", 9), tr: "dark", C: ({ f, len }) => <Hor f={f} len={len} civil weights={1} pain={0.6} sky="haze" exp={1.1} shots={[[0, C([5.2, 2.3, 6.2], [0, 1.3, 0], 40), C([4.3, 2.1, 5.2], [0, 1.3, 0], 38)]]} /> },
  { at: L("wh", 10), C: ({ f, len }) => <Hor f={f} len={len} civil weights={1} pain={0.8} sky="haze" exp={1.1} shots={[[0, C([-1.3, 1.7, 2.3], [0, 1.5, 0], 36), C([-1.0, 1.7, 1.9], [0, 1.55, 0], 34)]]} /> },
  { at: L("wh", 11), tr: "dark", C: ({ f, len }) => <Hor f={f} len={len} weights={0} pain={0.9} sky="dusk" exp={1.0} shots={[[0, C([10, 3, 10], [0, 1.2, 0], 34), C([11.5, 3.4, 11.5], [0, 1.2, 0], 34)]]} /> },
  /* 2. THE RAT */
  { at: L("t6", 1), tr: "dark", C: ({ f, len }) => <Ph f={f} len={len} k="p14" z={[1.0, 1.1]} c0={[0.5, 0.55]}><RatPhoto3D f={f} potOn={0} heat={0} panic={0} /></Ph> },
  { at: L("t6", 2), C: ({ f, len }) => <Rat f={f} len={len} shots={[[0, C([2.2, 1.15, 1.8], [1.45, 0.62, 0.85], 30), C([2.05, 1.1, 1.65], [1.45, 0.62, 0.85], 28)]]} /> },
  { at: L("t6", 3), C: ({ f, len }) => <Ph f={f} len={len} k="p14" z={[1.15, 1.25]} c0={[0.48, 0.58]}><RatPhoto3D f={f} potOn={k01(f, 12, 50)} heat={0} panic={0.2} /></Ph> },
  { at: L("t6", 4), C: ({ f, len }) => <Rat f={f} len={len} ratIn={1} potOn={1} heat={k01(f, 10, 70)} panic={k01(f, 50, 90)} shots={[[0, C([0.9, 1.75, 1.5], [-0.1, 1.0, 0], 36), C([0.8, 1.7, 1.35], [-0.1, 1.0, 0], 34)]]} /> },
  { at: L("t6", 5), tr: "cut", C: ({ f, len }) => <Rat f={f} len={len} ratIn={1} potOn={1} heat={1} panic={1} cut={1} shots={[[0, C([0.7, 1.45, 0.9], [-0.1, 1.05, 0], 32), C([0.62, 1.42, 0.8], [-0.1, 1.05, 0], 30)]]} /> },
  { at: L("t6", 8), tr: "dark", C: ({ f, len }) => <Ph f={f} len={len} k="p14" z={[1.1, 1.0]} c0={[0.5, 0.5]} exp={0.75}><RatPhoto3D f={f} potOn={1} heat={0.7} panic={0.6} /></Ph> },
  { at: L("t6", 11), C: ({ f, len }) => <Rat f={f} len={len} ratIn={1} potOn={1} lit={0} shots={[[0, C([1.0, 1.6, 1.3], [-0.1, 1.05, 0], 34), C([0.2, 1.65, 1.45], [-0.1, 1.05, 0], 34)]]} /> },
  { at: L("t6", 14), C: ({ f, len }) => <Rat f={f} len={len} ratIn={1} potOn={1} panic={0.3} lit={0} shots={[[0, C([-0.9, 1.6, 1.2], [-0.5, 1.0, 0], 34), C([-0.85, 1.55, 1.1], [-0.5, 1.0, 0], 32)]]} /> },
  /* 3. STRAPPADO */
  { at: L("t7", 1), tr: "dark", C: ({ f, len }) => <Ph f={f} len={len} k="p15" z={[1.0, 1.1]} c0={[0.5, 0.55]}><InqPhoto3D f={f} lift={0} /></Ph> },
  { at: L("t7", 3), C: ({ f, len }) => <Strap f={f} len={len} shots={[[0, C([1.4, 1.3, 2.0], [0, 1.2, 0], 40), C([1.2, 1.6, 1.8], [0, 3.4, 0], 40)]]} /> },
  { at: L("t7", 4), C: ({ f, len }) => <Strap f={f} len={len} shots={[[0, C([-1.4, 1.4, -2.0], [0, 1.0, 0], 38), C([-1.2, 1.4, -1.8], [0, 1.0, 0], 36)]]} /> },
  { at: L("t7", 5), C: ({ f, len }) => <Strap f={f} len={len} lift={(g) => k01(g, 12, 110)} pain={1} shots={[[0, C([2.6, 1.5, 1.9], [0, 1.6, 0], 42), C([2.3, 1.7, 1.7], [0, 1.9, 0], 42)]]} /> },
  { at: L("t7", 8), C: ({ f, len }) => <Strap f={f} len={len} lift={() => 1} weight={1} pain={1} shots={[[0, C([0.9, 0.9, 1.3], [0, 0.9, 0], 38), C([0.8, 1.4, 1.2], [0, 1.7, 0], 38)]]} /> },
  { at: L("t7", 9), C: ({ f, len }) => <Strap f={f} len={len} lift={(g) => g < 40 ? 1 : g < 48 ? 1 - 0.85 * sm(40, 48, g) : 0.15 + 0.05 * Math.exp(-(g - 48) / 6) * Math.cos((g - 48) / 2)} weight={1} pain={1} shots={[[0, C([-3.4, 1.4, 2.6], [0, 1.5, 0], 44), C([-3.1, 1.4, 2.3], [0, 1.4, 0], 44)]]} /> },
  { at: L("t7", 10), C: ({ f, len }) => <Ph f={f} len={len} k="p15" z={[1.25, 1.4]} c0={[0.55, 0.5]}><InqPhoto3D f={f} lift={0.8} /></Ph> },
  { at: L("t7", 11), tr: "dark", C: ({ f, len }) => <Strap f={f} len={len} lift={() => 0.9} exp={0.6} shots={[[0, C([0, 1.9, 2.4], [0, 1.9, 0], 44), C([0, 2.0, 3.2], [0, 1.9, 0], 44)]]} /> },
  { at: L("t7", 13), tr: "dark", C: ({ f, len }) => <Strap f={f} len={len} who="machiavelli" lift={() => 0.85} pain={0.5} shots={[[0, C([-2.4, 2.0, 3.4], [0, 1.8, 0], 40), C([-2.0, 1.9, 2.9], [0, 1.8, 0], 38)]]} /> },
  { at: L("t7", 15), C: ({ f, len }) => <Strap f={f} len={len} who="machiavelli" lift={() => 0.85} pain={0.3} shots={[[0, C([1.0, 2.1, 1.2], [0, 2.0, 0], 34), C([0.9, 2.05, 1.05], [0, 2.0, 0], 32)]]} /> },
  { at: L("t7", 16), C: ({ f, len }) => <Strap f={f} len={len} exp={0.85} shots={[[0, C([-2.8, 2.6, -0.6], [-4, 2.9, -1.2], 50), C([-2.6, 2.6, -0.8], [-4, 2.9, -1.2], 48)]]} /> },
  /* 5. KEELHAULING */
  { at: L("kh", 1), tr: "dark", C: ({ f, len }) => <Kee f={f} len={len} mode="side" shots={[[0, C([14, 4.5, 17], [0, 2.4, 0], 38), C([11, 3.8, 13.5], [0, 2.2, 0], 38)]]} /> },
  { at: L("kh", 2), C: ({ f, len }) => <Kee f={f} len={len} mode="deck" shots={[[0, C([3.4, 3.2, 6.2], [0, 0.9, 0], 40), C([2.6, 2.9, 5.2], [0, 0.9, 0], 40)]]} /> },
  { at: L("kh", 3), C: ({ f, len }) => <Kee f={f} len={len} mode="side" shots={[[0, C([3.0, 0.9, 6.0], [0.6, -0.1, 2.2], 36), C([2.6, 0.5, 5.2], [0.6, -0.3, 2.3], 36)]]} /> },
  { at: L("kh", 4), C: ({ f, len }) => <Kee f={f} len={len} mode="deck" shots={[[0, C([2.0, 1.9, 3.8], [0.6, 1.0, 1.4], 34), C([1.6, 1.8, 3.3], [0.6, 1.0, 1.4], 32)]]} /> },
  { at: L("kh", 5), tr: "cut", C: ({ f, len }) => <Kee f={f} len={len} mode="side" sailor={false} splash={k01(f, 4, 40)} shots={[[0, C([5.4, 1.4, 7.4], [0.6, -0.4, 2.5], 36), C([5.0, 1.2, 6.8], [0.6, -0.5, 2.5], 34)]]} /> },
  { at: L("kh", 6), tr: "cut", C: ({ f, len }) => <Kee f={f} len={len} mode="under" pull={k01(f, 0, len) * 0.35} shots={[[0, C([4.2, -2.6, 3.4], [0, -2.0, 0.6], 44), C([3.6, -2.4, 2.4], [0, -2.0, 0.4], 42)]]} /> },
  { at: L("kh", 7), C: ({ f, len }) => <Kee f={f} len={len} mode="under" pull={0.35 + k01(f, 0, len) * 0.1} shots={[[0, C([1.6, -1.9, 1.9], [0, -2.0, 0.3], 40), C([1.3, -1.9, 1.3], [0, -2.0, 0.0], 38)]]} /> },
  { at: L("kh", 8), tr: "cut", C: ({ f, len }) => <Kee f={f} len={len} mode="under" pull={0.45 + k01(f, 0, len) * 0.2} shots={[[0, C([1.6, -2.3, 1.6], [-0.3, -2.2, 0], 36), C([1.4, -2.3, 0.6], [-0.3, -2.2, -0.6], 34)]]} /> },
  { at: L("kh", 9), C: ({ f, len }) => <Kee f={f} len={len} mode="under" pull={0.65 + k01(f, 0, len) * 0.05} struggle={1 - k01(f, 0, len) * 0.6} shots={[[0, C([1.2, -2.0, -0.8], [-0.3, -2.3, -0.8], 34), C([1.0, -2.05, -0.9], [-0.3, -2.3, -0.9], 32)]]} /> },
  { at: L("kh", 10), tr: "cut", C: ({ f, len }) => <Kee f={f} len={len} mode="under" pull={0.7 + k01(f, 0, len) * 0.1} struggle={0} exp={1.0} shots={[[0, C([3.6, -3.6, 1.6], [-0.3, -2.4, -1.0], 44), C([4.4, -4.0, 2.4], [-0.3, -2.4, -1.0], 46)]]} /> },
  { at: L("kh", 11), tr: "dark", C: ({ f, len }) => <Kee f={f} len={len} mode="side" sailor={false} exp={1.05} shots={[[0, C([-12, 5, 14], [0, 2.4, 0], 38), C([-10, 4.4, 12], [0, 2.4, 0], 38)]]} /> },
  { at: L("kh", 12), C: ({ f, len }) => <Kee f={f} len={len} mode="deck" sailor={false} shots={[[0, C([-2.2, 2.4, -4.2], [0, 0.8, -1.0], 40), C([-1.6, 2.2, -3.6], [0, 0.8, -1.0], 38)]]} /> },
  /* 4. THE RACK */
  { at: L("t4", 1), tr: "dark", C: ({ f, len }) => <Ph f={f} len={len} k="p6" z={[1.0, 1.1]} c0={[0.5, 0.62]}><RackPhoto3D f={f} turn={0} strain={0} /></Ph> },
  { at: L("t4", 2), C: ({ f, len }) => <Rack f={f} len={len} shots={[[0, C([-2.0, 1.4, 1.6], [0, 0.85, 0.2], 38), C([-1.4, 1.5, 2.0], [0.2, 0.85, 0.2], 38)]]} /> },
  { at: L("t4", 4), C: ({ f, len }) => <Ph f={f} len={len} k="p6" z={[1.15, 1.3]} c0={[0.48, 0.62]}><RackPhoto3D f={f} turn={k01(f, 5, len) * 3} strain={k01(f, 10, len)} /></Ph> },
  { at: L("t4", 5), C: ({ f, len }) => <Rack f={f} len={len} turn={3} strain={1} shots={[[0, C([0.5, 1.45, 1.3], [-0.4, 0.9, 0.2], 36), C([0.4, 1.4, 1.15], [-0.5, 0.9, 0.2], 34)]]} /> },
  { at: L("t4", 6), tr: "dark", C: ({ f, len }) => <Tow f={f} len={len} shots={[[0, C([-8, 1.6, 24], [0, 8, 0], 38), C([-5, 1.8, 20], [0, 9, 0], 40)]]} /> },
  { at: L("t4", 7), C: ({ f, len }) => <Ph f={f} len={len} k="p6" z={[1.0, 1.08]} c0={[0.7, 0.35]} c1={[0.6, 0.45]}><RackPhoto3D f={f} turn={2} strain={0.8} /></Ph> },
  { at: L("t4", 8), C: ({ f, len }) => <Rack f={f} len={len} turn={3} strain={0.9} exp={0.9} shots={[[0, C([-2.6, 1.9, 2.6], [0, 0.9, 0.2], 40), C([-2.2, 1.8, 2.2], [0, 0.9, 0.2], 38)]]} /> },
  { at: L("t4", 9), C: ({ f, len }) => <Ph f={f} len={len} k="p6" z={[1.1, 1.0]} c0={[0.5, 0.6]} exp={0.7}><RackPhoto3D f={f} turn={3} strain={0.9} /></Ph> },
  { at: L("t4", 11), C: ({ f, len }) => <Rack f={f} len={len} turn={3} strain={0.9} exp={0.6} shots={[[0, C([1.8, 2.0, 3.3], [0, 0.9, 0.2], 40), C([2.2, 2.2, 3.8], [0, 0.9, 0.2], 42)]]} /> },
  { at: L("t4", 14), tr: "dark", C: ({ f, len }) => <Ph f={f} len={len} k="p6" z={[1.05, 1.2]} c0={[0.45, 0.6]}><RackPhoto3D f={f} turn={0} strain={0} empty viewer /></Ph> },
  { at: L("t4", 17), tr: "dark", C: ({ f, len }) => <Ph f={f} len={len} k="p7" z={[1.0, 1.1]} c0={[0.5, 0.5]}><SquarePhoto3D f={f} stage="tie" /></Ph> },
  /* 5. THE WHEEL */
  { at: L("t3", 1), tr: "dark", C: ({ f, len }) => <Ph f={f} len={len} k="p7" z={[1.0, 1.1]} c0={[0.5, 0.55]}><SquarePhoto3D f={f} stage="tie" /></Ph> },
  { at: L("t3", 4), C: ({ f, len }) => <Ph f={f} len={len} k="p7" z={[1.3, 1.45]} c0={[0.58, 0.78]} c1={[0.62, 0.74]}><SquarePhoto3D f={f} stage="tie" /></Ph> },
  { at: L("t3", 7), C: ({ f, len }) => <Sq f={f} len={len} stage="tie" shots={[[0, C([1.6, 3.2, 2.4], [0, 1.1, 0], 38), C([1.3, 3.0, 2.0], [0, 1.1, 0], 36)]]} /> },
  { at: L("t3", 8), C: ({ f, len }) => <Sq f={f} len={len} stage="strike" shots={[[0, C([-4.2, 3.6, 7.2], [0, 1.4, 0], 34), C([-3.6, 3.4, 6.4], [0, 1.4, 0], 32)]]} /> },
  { at: L("t3", 9), C: ({ f, len }) => <Ph f={f} len={len} k="p7" z={[1.15, 1.3]} c0={[0.5, 0.35]}><SquarePhoto3D f={f} stage="raised" /></Ph> },
  { at: L("t3", 12), tr: "dark", C: ({ f, len }) => <Sq f={f} len={len} stage="judge" shots={[[0, C([0.2, 2.6, 1.8], [-1.5, 2.1, -1.0], 38), C([0.0, 2.55, 1.6], [-1.5, 2.15, -1.0], 36)]]} /> },
  { at: L("t3", 15), C: ({ f, len }) => <Ph f={f} len={len} k="p7" z={[1.0, 1.12]} c0={[0.5, 0.45]} tint="rgba(120,110,140,1)"><SquarePhoto3D f={f} stage="raised" crowd={0} /></Ph> },
  /* 6. THE BRAZEN BULL */
  { at: L("t2", 1), tr: "dark", C: ({ f, len }) => <Ph f={f} len={len} k="p8" z={[1.0, 1.1]} c0={[0.55, 0.55]}><SicilyPhoto3D f={f} heat={0} door={0} /></Ph> },
  { at: L("t2", 4), C: ({ f, len }) => <Ph f={f} len={len} k="p8" z={[1.25, 1.4]} c0={[0.35, 0.6]}><SicilyPhoto3D f={f} heat={0} door={0} /></Ph> },
  { at: L("t2", 6), C: ({ f, len }) => <Ph f={f} len={len} k="p8" z={[1.15, 1.3]} c0={[0.65, 0.55]}><SicilyPhoto3D f={f} heat={0} door={0} sculptor /></Ph> },
  { at: L("t2", 7), C: ({ f, len }) => <Sic f={f} len={len} door={k01(f, 4, 30)} shots={[[0, C([0.6, 1.7, 3.4], [0.3, 1.4, 0.4], 36), C([0.5, 1.65, 3.0], [0.3, 1.4, 0.4], 34)]]} /> },
  { at: L("t2", 8), C: ({ f, len }) => <Sic f={f} len={len} door={1} heat={k01(f, 0, 30)} shots={[[0, C([-1.6, 0.4, 2.6], [0, 0.6, 0], 40), C([-1.4, 0.45, 2.3], [0, 0.65, 0], 38)]]} /> },
  { at: L("t2", 9), C: ({ f, len }) => <Sic f={f} len={len} door={1} heat={1} roar={k01(f, 60, 100)} shots={[[0, C([3.2, 1.8, 1.9], [1.5, 1.4, 0], 36), C([2.9, 1.75, 1.6], [1.5, 1.4, 0], 34)]]} /> },
  { at: L("t2", 11), tr: "dark", C: ({ f, len }) => <Ph f={f} len={len} k="p8" z={[1.1, 1.25]} c0={[0.62, 0.55]}><SicilyPhoto3D f={f} heat={k01(f, 200, 260)} door={1 - k01(f, 190, 215)} victim="walk" walk={k01(f, 10, 190)} /></Ph> },
  { at: L("t2", 15), tr: "dark", C: ({ f, len }) => <Ph f={f} len={len} k="p8" z={[1.05, 1.2]} c0={[0.6, 0.55]} exp={1.0}><SicilyPhoto3D f={f} heat={0} door={1} victim="tyrant" walk={k01(f, 20, len)} /></Ph> },
  /* 7. SCAPHISM */
  { at: L("t1", 2), tr: "dark", C: ({ f, len }) => <Mar f={f} len={len} honey={0} shots={[[0, C([4.2, 1.6, 3.6], [0.5, 0.3, 0], 40), C([3.5, 1.4, 3.0], [0.6, 0.25, 0], 38)]]} /> },
  { at: L("t1", 3), C: ({ f, len }) => <Mar f={f} len={len} honey={0} shots={[[0, C([-8, 3, 9], [0, 0.5, 0], 40), C([-6, 2.6, 8], [0, 0.4, 0], 40)]]} /> },
  { at: L("t1", 4), C: ({ f, len }) => <Mar f={f} len={len} honey={0} shots={[[0, C([3.6, 1.9, -2.6], [0.2, 0.15, 0], 38), C([-1.6, 2.0, 3.6], [0.4, 0.15, 0], 38)]]} /> },
  { at: L("t1", 6), C: ({ f, len }) => <Mar f={f} len={len} honey={k01(f, 20, 120)} shots={[[0, C([HEADM[0] + 0.32, 1.0, HEADM[2] + 0.28], HEADM, 32), C([HEADM[0] + 0.27, 0.92, HEADM[2] + 0.24], HEADM, 30)]]} /> },
  { at: L("t1", 8), C: ({ f, len }) => <Mar f={f} len={len} shots={[[0, C([0, 6, 9], [0, 0, 0], 40), C([0, 5, 8], [0, 0, 0], 38)]]} /> },
  { at: L("t1", 9), tr: "cut", C: ({ f, len }) => <Mar f={f} len={len} flies={k01(f, 0, 30)} day={0.3} shots={[[0, C([HEADM[0] + 0.45, 0.9, HEADM[2] + 0.35], HEADM, 32), C([HEADM[0] + 0.38, 0.82, HEADM[2] + 0.3], HEADM, 30)]]} /> },
  { at: L("t1", 10), C: ({ f, len }) => <Mar f={f} len={len} flies={1} day={0.4} guards shots={[[0, C([-5.5, 1.8, 6.5], [0, 0.6, 0], 40), C([-4.6, 1.7, 5.6], [0, 0.6, 0], 38)]]} /> },
  { at: L("t1", 13), C: ({ f, len }) => { const ph = Math.floor(f / 24); return <Mar f={f} len={len} flies={1} day={Math.min(1, f / len)} night={ph % 2 === 1} shots={[[0, C([4.2, 1.5, 3.0], [0.5, 0.2, 0], 36), C([3.6, 1.3, 2.6], [0.6, 0.2, 0], 34)]]} />; } },
  { at: L("t1", 15), tr: "dark", C: ({ f, len }) => <Mar f={f} len={len} night flies={0.4} day={1} shots={[[0, C([5.5, 2.0, 4.5], [0.5, 0.2, 0], 38), C([6.5, 2.6, 5.5], [0.5, 0.2, 0], 40)]]} /> },
  /* END */
];
const SCENES = [...RAW].sort((a, b) => a.at - b.at);

/* ---------------- overlays ---------------- */
const Overlays: React.FC = () => {
  const g = useCurrentFrame();
  const at = (a: number, len: number, el: (f: number) => React.ReactNode) => (g >= a && g < a + len ? el(g - a) : null);
  const span = (s1: string, k1: number, s2: string, k2: number, pad = 0) => L(s2, k2) - L(s1, k1) - pad;
  return <>
    {/* hook */}
    {at(L("hook", 1) + 6, L("hook", 3) - L("hook", 1) - 6, (f) => <Counter f={f} len={L("hook", 3) - L("hook", 1) - 6} label="DAY" value={Math.min(17, 1 + Math.floor(Math.pow(f / 60, 0.8) * 16))} icon={Math.floor(f / 10) % 2 ? "moon" : "sun"} />)}
    {at(L("hook", 3), span("hook", 3, "hook", 4) + 8, (f) => <Big f={f} len={span("hook", 3, "hook", 4) + 8} text="THE 9 WORST TORTURES" sub="IN HISTORY · EACH ONE WORSE" y={250} size={130} />)}
    {at(L("hook", 4), span("hook", 4, "ctx", 0), (f) => <RankList f={f} len={span("hook", 4, "ctx", 0)} reveal={0} hl={f > 24 ? 8 : -1} x={640} title="" />)}
    {/* context */}
    {at(L("ctx", 2) + 6, span("ctx", 2, "t5", 0) - 20, (f) => <Card3 f={f} len={span("ctx", 2, "t5", 0) - 26} kicker="MEDIEVAL LAW" title="“The queen of proofs”" body="A confession counted more than any witness. Courts were allowed to use pain to get one." pill="REAL" />)}
    {/* numbered titles + grid transitions between tortures */}
    {SECS.map((sc, i) => <React.Fragment key={sc}>
      {at(L(sc, 0) - 40, 56, (f) => <GridTr f={f} len={56} from={Math.max(0, i - 1)} to={i} />)}
      {at(L(sc, 0) + 16, 72, (f) => <TortTitle f={f} n={i + 1} sub={SUBS[i]} len={70} />)}
    </React.Fragment>)}
    {/* x-rays */}
    {at(L("t5", 13), 120, (f) => <XRay f={f} len={120} kind="head" label="NO SLEEP" />)}
    {at(L("t6", 7), 120, (f) => <XRay f={f} len={120} kind="belly" label="THE STOMACH" side="l" />)}
    {at(L("t7", 8), 130, (f) => <XRay f={f} len={130} kind="shoulders" label="SHOULDERS" />)}
    {at(L("t4", 6), 120, (f) => <XRay f={f} len={120} kind="joints" label="EVERY JOINT" side="l" />)}
    {at(L("t3", 9), 100, (f) => <XRay f={f} len={100} kind="limbs" label="ARMS & LEGS" side="l" />)}
    {at(L("t2", 9), 110, (f) => <XRay f={f} len={110} kind="heat" label="THE HEAT" side="l" />)}
    {at(L("t1", 10), 120, (f) => <XRay f={f} len={120} kind="skin" label="EXPOSED" side="l" />)}
    {/* dates written on the walls */}
    {at(L("t5", 4) + 10, 110, (f) => <WallText f={f} len={110} text="Bologna, c. 1500" x={980} y={720} rotY={-8} size={70} />)}
    {at(L("t7", 13) + 10, 110, (f) => <WallText f={f} len={110} text="Florence · 1513" x={140} y={760} rotY={10} size={70} />)}
    {at(L("t4", 8) + 10, 100, (f) => <WallText f={f} len={100} text="London · 1605" x={1050} y={760} rotY={-10} size={70} />)}
    {/* new facts */}
    {at(L("t4", 13), span("t4", 13, "t4", 14) + 10, (f) => <Card3 f={f} len={span("t4", 13, "t4", 14) + 6} kicker="JANUARY 1606" title="Too weak to climb" body="At his execution, Guy Fawkes could barely climb the ladder." portrait="hat" pill="REAL" side="l" />)}
    {at(L("t2", 14), span("t2", 14, "t2", 15), (f) => <Card3 f={f} len={span("t2", 14, "t2", 15) - 4} kicker="ACCORDING TO LEGEND" title="Bracelets of bone" body="The victims' bones were polished and worn as jewellery." portrait="laurel" pill="LEGEND" />)}
    {/* 1. water drop */}
    {at(L("t5", 0) + 120, 120, (f) => <Dossier f={f} len={120} floor={0} idx={1} name="The Water Drop" era="c. 1500" place="Italy" dur="Days" surv={70} used="Courts & jailers" />)}
    {at(L("t5", 3) - 2, span("t5", 2, "t5", 3) + 4, (f) => <Stamp f={f} len={span("t5", 2, "t5", 3)} text="NOT CHINESE" size={130} />)}
    {at(L("t5", 4) + 4, span("t5", 3, "t5", 5), (f) => <MiniMap f={f} len={span("t5", 3, "t5", 5)} lon={11.34} lat={44.49} label="Bologna" year="c. 1500" zoom={1100} />)}
    {at(L("t5", 4) + 20, span("t5", 3, "t5", 5) - 20, (f) => <Card3 f={f} len={span("t5", 3, "t5", 5) - 26} kicker="ITALIAN LAWYER" title="Hippolytus de Marsiliis" body="Saw water carve a hole in solid stone." portrait="cap" pill="REAL" side="l" y={420} />)}
    {at(L("t5", 6) + 10, span("t5", 5, "t5", 6) - 6, (f) => <Ink f={f} len={span("t5", 5, "t5", 6) - 6} shapes={[{ t: "circle", x: 960, y: 270, r: 90, label: "the bucket", at: 4 }, { t: "arrow", x: 640, y: 720, x2: 900, y2: 560, label: "head locked", at: 18 }]} />)}
    {at(L("t5", 9) + 10, span("t5", 8, "t5", 12), (f) => <Blueprint f={f} len={span("t5", 8, "t5", 12)} kind="drip" title="THE WATER DROP" />)}
    {at(L("t5", 15), span("t5", 13, "t5", 17), (f) => <Split f={f} len={span("t5", 13, "t5", 17) - 4} l={["drop", "FREE TO MOVE", "Just annoying."]} r={["lock", "STRAPPED DOWN", "Panic within hours."]} at={span("t5", 13, "t5", 15)} />)}
    {/* wooden horse */}
    {at(L("wh", 0) + 120, 120, (f) => <Dossier f={f} len={120} floor={0} idx={2} name="The Wooden Horse" era="1500s – 1860s" place="Europe & America" dur="Hours" surv={85} used="Armies" />)}
    {at(L("wh", 2) + 14, span("wh", 2, "wh", 3) - 10, (f) => <Ink f={f} len={span("wh", 2, "wh", 3) - 10} shapes={[{ t: "arrow", x: 1320, y: 300, x2: 1040, y2: 470, label: "the sharp edge", at: 0 }]} />)}
    {at(L("wh", 6), 110, (f) => <XRay f={f} len={110} kind="joints" label="HIPS & LEGS" side="l" />)}
    {at(L("wh", 9) + 4, span("wh", 9, "wh", 10), (f) => <MiniMap f={f} len={span("wh", 9, "wh", 10) - 4} lon={-77.0} lat={38.9} label="American Civil War" year="1861 – 1865" zoom={700} left />)}
    {at(L("wh", 10) + 4, span("wh", 10, "wh", 12), (f) => <Card3 f={f} len={span("wh", 10, "wh", 12) - 6} kicker="1861 – 1865" title="Riding the wooden horse" body="A punishment still used in army camps during the American Civil War." pill="REAL" />)}
    {/* 2. rat */}
    {at(L("t6", 0) + 120, 120, (f) => <Dossier f={f} len={120} floor={0} idx={3} name="The Rat" era="1570s" place="Netherlands" dur="Minutes" surv={60} used="Soldiers & jailers" />)}
    {at(L("t6", 4) + 20, span("t6", 3, "t6", 6) - 10, (f) => <Blueprint f={f} len={span("t6", 3, "t6", 6) - 16} kind="rat" title="THE RAT" />)}
    {at(L("t6", 5), span("t6", 4, "t6", 6), (f) => <ECG f={f} len={span("t6", 4, "t6", 6)} bpm={150} />)}
    {at(L("t6", 8) + 4, span("t6", 6, "t6", 7) + 10, (f) => <MiniMap f={f} len={span("t6", 6, "t6", 7) + 6} lon={4.9} lat={52.1} label="The Dutch Revolt" year="1570s" zoom={1300} />)}
    {at(L("t6", 9) + 6, span("t6", 7, "t6", 9), (f) => <Card3 f={f} len={span("t6", 7, "t6", 9) - 6} kicker="GEORGE ORWELL · 1949" title="Nineteen Eighty-Four" body="Room 101: “the worst thing in the world.”" portrait="man" pill="REAL" side="l" />)}
    {at(L("t6", 14) + 20, span("t6", 12, "t6", 13), (f) => <Stamp f={f} len={span("t6", 12, "t6", 13) - 10} text="CONFESSED" size={120} rot={-5} />)}
    {/* 3. strappado */}
    {at(L("t7", 0) + 120, 120, (f) => <Dossier f={f} len={120} floor={0} idx={4} name="The Strappado" era="1400s – 1600s" place="Europe" dur="Minutes" surv={75} used="The Inquisition" />)}
    {at(L("t7", 3) + 30, span("t7", 2, "t7", 3), (f) => <Ink f={f} len={span("t7", 2, "t7", 3) - 30} shapes={[{ t: "circle", x: 980, y: 210, r: 80, label: "pulley", at: 0 }]} />)}
    {at(L("t7", 8) + 10, span("t7", 6, "t7", 7), (f) => <Ink f={f} len={span("t7", 6, "t7", 7) - 10} shapes={[{ t: "arrow", x: 1300, y: 760, x2: 1040, y2: 640, label: "weights", at: 0 }]} />)}
    {at(L("t7", 10), span("t7", 8, "t7", 9), (f) => <Blueprint f={f} len={span("t7", 8, "t7", 9)} kind="strap" title="THE STRAPPADO" />)}
    {at(L("t7", 11) + 20, span("t7", 9, "t7", 11), (f) => <Poll f={f} len={span("t7", 9, "t7", 11)} q="Would you have confessed?" ans="MOST PEOPLE DID" />)}
    {at(L("t7", 15) + 6, span("t7", 15, "t7", 17), (f) => <MiniMap f={f} len={span("t7", 15, "t7", 17) - 6} lon={11.25} lat={43.77} label="Florence" year="1513" zoom={1100} />)}
    {at(L("t7", 15), span("t7", 13, "t7", 15), (f) => <Card3 f={f} len={span("t7", 13, "t7", 15) - 4} kicker="FLORENCE · 1513" title="Niccolò Machiavelli" body="Hoisted six times. He confessed nothing." portrait="cap" pill="REAL" side="l" />)}
    {at(L("t7", 17) + 6, span("t7", 15, "t7", 16), (f) => <Card3 f={f} len={span("t7", 15, "t7", 16) - 4} kicker="WRITTEN THE SAME YEAR" title="The Prince" body="One of the most famous books on power ever written." portrait="cap" side="r" />)}
    {/* keelhauling */}
    {at(L("kh", 0) + 120, 120, (f) => <Dossier f={f} len={120} floor={0} idx={5} name="Keelhauling" era="1500s – 1850s" place="At sea" dur="Minutes" surv={40} used="Navies" />)}
    {at(L("kh", 3) + 14, span("kh", 3, "kh", 4) - 6, (f) => <Ink f={f} len={span("kh", 3, "kh", 4) - 6} shapes={[{ t: "arrow", x: 1350, y: 260, x2: 1120, y2: 560, label: "the rope", at: 0 }]} />)}
    {at(L("kh", 8), 110, (f) => <XRay f={f} len={110} kind="skin" label="BARNACLES" side="l" />)}
    {at(L("kh", 9), span("kh", 9, "kh", 11), (f) => <ECG f={f} len={span("kh", 9, "kh", 11)} bpm={140} flat={span("kh", 9, "kh", 10) + 30} />)}
    {at(L("kh", 11) + 4, span("kh", 11, "kh", 12), (f) => <MiniMap f={f} len={span("kh", 11, "kh", 12) - 4} lon={4.9} lat={52.37} label="Dutch Navy" year="1560s" zoom={1100} left />)}
    {at(L("kh", 11) + 10, span("kh", 11, "kh", 13), (f) => <Card3 f={f} len={span("kh", 11, "kh", 13) - 6} kicker="DUTCH NAVY · 1560s" title="Kielhalen" body="Recorded as an official punishment at sea." pill="REAL" />)}
    {at(L("kh", 13), span("kh", 13, "kh", 14), (f) => <Stamp f={f} len={span("kh", 13, "kh", 14) - 4} text="FEW SURVIVED" size={120} rot={-5} />)}
    {/* 4. rack */}
    {at(L("t4", 0) + 120, 120, (f) => <Dossier f={f} len={120} floor={0} idx={6} name="The Rack" era="1400s – 1600s" place="England" dur="Hours" surv={50} used="The English Crown" />)}
    {at(L("t4", 2) + 10, span("t4", 1, "t4", 3), (f) => <Blueprint f={f} len={span("t4", 1, "t4", 3)} kind="rack" title="THE RACK" />)}
    {at(L("t4", 3) + 20, 90, (f) => <SubNudge f={f} len={90} />)}
    {at(L("t4", 4), span("t4", 3, "t4", 5), (f) => <ECG f={f} len={span("t4", 3, "t4", 5)} bpm={130} />)}
    {at(L("t4", 6) + 4, span("t4", 5, "t4", 6) + 10, (f) => <MiniMap f={f} len={span("t4", 5, "t4", 6) + 6} lon={-0.08} lat={51.5} label="Tower of London" year="1605" zoom={1300} />)}
    {at(L("t4", 7) + 6, span("t4", 6, "t4", 7), (f) => <Card3 f={f} len={span("t4", 6, "t4", 7) - 4} kicker="THE RACK'S NICKNAME" title="The Duke of Exeter's Daughter" pill="REAL" side="l" />)}
    {at(L("t4", 8) + 6, span("t4", 7, "t4", 8), (f) => <Card3 f={f} len={span("t4", 7, "t4", 8) - 4} kicker="LONDON · 1605" title="Guy Fawkes" body="Caught guarding 36 barrels of gunpowder under Parliament." portrait="hat" pill="REAL" />)}
    {at(L("t4", 9) + 6, span("t4", 8, "t4", 10), (f) => <Card3 f={f} len={span("t4", 8, "t4", 10) - 6} kicker="KING JAMES I · 1605" title="“The gentler tortures first…”" body="“…and so, by degrees, to the worst.”" portrait="crown" pill="REAL" side="l" />)}
    {at(L("t4", 11), span("t4", 10, "t4", 12), (f) => <Signatures f={f} len={span("t4", 10, "t4", 12) - 4} at={span("t4", 10, "t4", 11) + 10} />)}
    {/* 5. wheel */}
    {at(L("t3", 0) + 120, 120, (f) => <Dossier f={f} len={120} floor={0} idx={7} name="The Breaking Wheel" era="1200s – 1841" place="Holy Roman Empire" dur="Hours" surv={0} used="Public executioners" />)}
    {at(L("t3", 8) + 10, span("t3", 7, "t3", 8), (f) => <Blueprint f={f} len={span("t3", 7, "t3", 8)} kind="wheel" title="THE BREAKING WHEEL" />)}
    {at(L("t3", 12) + 6, span("t3", 10, "t3", 13), (f) => <Card3 f={f} len={span("t3", 10, "t3", 13) - 6} kicker="FRENCH · “THE BLOW OF MERCY”" title="Coup de grâce" body="One final blow first, so the condemned would not suffer." pill="REAL" />)}
    {at(L("t3", 15) + 4, span("t3", 13, "t3", 14), (f) => <MiniMap f={f} len={span("t3", 13, "t3", 14) - 4} lon={13.4} lat={52.5} label="Prussia" year="1841" zoom={1000} left />)}
    {/* 6. bull */}
    {at(L("t2", 0) + 120, 120, (f) => <Dossier f={f} len={120} floor={0} idx={8} name="The Brazen Bull" era="c. 550 BC" place="Sicily" dur="Minutes" surv={0} used="Phalaris of Akragas" />)}
    {at(L("t2", 0) + 292, span("t2", 3, "t2", 5), (f) => <MiniMap f={f} len={span("t2", 3, "t2", 5) - 4} lon={13.58} lat={37.31} label="Akragas, Sicily" year="c. 550 BC" zoom={1100} left />)}
    {at(L("t2", 4) + 6, span("t2", 3, "t2", 5), (f) => <Card3 f={f} len={span("t2", 3, "t2", 5) - 4} kicker="TYRANT OF AKRAGAS" title="Phalaris" body="Akragas is today Agrigento, in Sicily." portrait="laurel" pill="REAL" side="r" />)}
    {at(L("t2", 9) + 10, span("t2", 8, "t2", 10), (f) => <Blueprint f={f} len={span("t2", 8, "t2", 10)} kind="bull" title="THE BRAZEN BULL" />)}
    {at(L("t2", 13), span("t2", 12, "t2", 13) + 20, (f) => <Card3 f={f} len={span("t2", 12, "t2", 13) + 16} kicker="THE INVENTOR" title="Perillos" body="Its first victim." portrait="laurel" pill="LEGEND" />)}
    {at(L("t2", 17), span("t2", 15, "t2", 16), (f) => <Card3 f={f} len={span("t2", 15, "t2", 16) - 4} kicker="ACCORDING TO LEGEND" title="Phalaris" body="Overthrown by his own people." portrait="laurel" pill="LEGEND" side="l" />)}
    {/* 7. scaphism */}
    {at(L("t1", 0) + 120, 120, (f) => <Dossier f={f} len={120} floor={0} idx={9} name="Scaphism" era="c. 400 BC" place="Ancient Persia" dur="17 days" surv={0} used="Persian kings" />)}
    {at(L("t1", 3) + 4, span("t1", 1, "t1", 2), (f) => <MiniMap f={f} len={span("t1", 1, "t1", 2)} lon={52.9} lat={30.5} label="Persia" year="c. 400 BC" zoom={500} />)}
    {at(L("t1", 3), span("t1", 1, "t1", 4), (f) => <Source f={f} len={span("t1", 1, "t1", 4)} t="Plutarch, Life of Artaxerxes" />)}
    {at(L("t1", 9), span("t1", 7, "t1", 13), (f) => <ECG f={f} len={span("t1", 7, "t1", 13)} bpm={95} flat={span("t1", 7, "t1", 12) + 40} />)}
    {at(L("t1", 13), span("t1", 11, "t1", 13), (f) => <Tally f={f} len={span("t1", 11, "t1", 13)} n={Math.min(17, 1 + Math.floor(f / 48 * 2) + Math.floor(Math.max(0, f - 90) / 5))} />)}
    {at(L("t1", 13) + 10, span("t1", 11, "t1", 12), (f) => <Card3 f={f} len={span("t1", 11, "t1", 12) - 6} kicker="ACCORDING TO PLUTARCH" title="Mithridates" body="A Persian soldier condemned by the king." portrait="turban" pill="REAL" />)}
    {at(L("t1", 14), span("t1", 12, "t1", 13) + 10, (f) => <Big f={f} len={span("t1", 12, "t1", 13) + 6} text="17 DAYS" color="#ff3a4a" y={380} size={200} />)}
    {/* closing question (3 s) */}
    {at(L("end", 0) - 4, END - L("end", 0) + 4, (f) => <Big f={f} len={END - L("end", 0) + 10} text="WHICH ONE WOULD YOU NEVER SURVIVE?" sub="TELL ME IN THE COMMENTS" color="#fff" y={400} size={96} />)}
  </>;
};

const SECS = ["t5", "wh", "t6", "t7", "kh", "t4", "t3", "t2", "t1"];
const SUBS = ["ITALY · c. 1500", "EUROPE & AMERICA", "DUTCH REVOLT · 1570s", "THE INQUISITION", "DUTCH NAVY", "TOWER OF LONDON", "HOLY ROMAN EMPIRE", "SICILY · c. 550 BC", "ANCIENT PERSIA"];
const curN = (g: number) => SECS.filter((sc) => g >= L(sc, 0)).length;
const MOOD: [number, number][] = [[L("t3", 8), L("t3", 10)], [L("t2", 12), L("t2", 14)], [L("t1", 15), L("end", 0)], [L("t6", 5), L("t6", 7)], [L("t7", 7), L("t7", 9)], [L("wh", 6), L("wh", 7)], [L("kh", 9), L("kh", 11)]];
const RAIN: [number, number][] = [[L("t3", 9), L("t3", 11)], [L("t3", 15), L("t3", 15) + 100]];
const IMPACTS: number[] = [12, L("t7", 8) + 48, L("t3", 8) + 26, L("t3", 8) + 80, L("t2", 8), L("t5", 7) + 52, L("wh", 5) + 30, L("kh", 5) + 4];
const winK = (g: number, w: [number, number][]) => Math.max(0, ...w.map(([a, b]) => interpolate(g, [a, a + 12, b - 12, b], [0, 1, 1, 0], clamp)));
const shakeAt = (g: number) => { let x = 0, y = 0; IMPACTS.forEach((t) => { const d = g - t; if (d >= 0 && d < 8) { const k = (1 - d / 8); x += Math.sin(d * 2.3) * 9 * k; y += Math.cos(d * 3.1) * 6 * k; } }); return [x, y]; };
const XF = 8;
const SceneWrap: React.FC<{ i: number }> = ({ i }) => {
  const g = useCurrentFrame(); const s = SCENES[i], C2 = s.C, b = i + 1 < SCENES.length ? SCENES[i + 1].at : END;
  const tr = s.tr ?? "fade"; const pre = i > 0 && tr !== "cut" && tr !== "flash" ? XF : 0; const f = g - pre; const k = interpolate(g, [0, XF], [0, 1], clamp);
  return <AbsoluteFill style={{ opacity: pre ? k : 1 }}><C2 f={Math.max(0, f)} len={b - s.at} /></AbsoluteFill>;
};
const Dips: React.FC = () => {
  const g = useCurrentFrame(); let o = 0, burn = -1;
  SCENES.forEach((s, i) => { if (i === 0) return; const d = Math.abs(g - s.at); if (s.tr === "dark") o = Math.max(o, 1 - d / 6); if (s.tr === "burn" && g >= s.at - 12 && g < s.at + 14) burn = g - (s.at - 12); });
  return <>{o > 0 && <AbsoluteFill style={{ background: "#000", opacity: Math.min(1, o * 1.1) }} />}{burn >= 0 && <Burn f={burn} len={26} />}</>;
};
const Chrome: React.FC = () => {
  const g = useCurrentFrame();
  const show = interpolate(g, [L("t5", 0) + 120, L("t5", 0) + 140, L("end", 0), L("end", 0) + 15], [0, 1, 1, 0], clamp);
  const n = curN(g), fill = Math.max(0, 1 - Math.abs(g - (n ? L(SECS[n - 1], 0) + 60 : 0)) / 40);
  const lb = Math.max(0, interpolate(g, [L("t1", 15), L("t1", 15) + 12, L("end", 0) - 6, L("end", 0) + 6], [0, 1, 1, 0], clamp));
  return <>
    <RedMood k={winK(g, MOOD)} f={g} />
    <Rain f={g} k={winK(g, RAIN) * 0.8} />
    <Letterbox k={lb} />
    <CrueltyMeter n={n} show={show} fill={fill} />
  </>;
};
const hideSubs: [number, number][] = [...SECS.map((sc) => [L(sc, 0) - 40, L(sc, 0) + 24] as [number, number]), [L("t7", 11) + 20, L("t7", 13)], [L("end", 0) - 4, END + 1]];
const Shaker: React.FC<{ children: React.ReactNode }> = ({ children }) => { const g = useCurrentFrame(); const [x, y] = shakeAt(g); return <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) scale(${x || y ? 1.02 : 1})`, filter: "brightness(1.17) contrast(1.04) saturate(1.06)" }}>{children}</AbsoluteFill>; };
export const Tort5: React.FC<{ audio?: boolean; clean?: boolean }> = ({ audio = false, clean = false }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Shaker>{SCENES.map((s, i) => { const b = i + 1 < SCENES.length ? SCENES[i + 1].at : END; const pre = i > 0 && s.tr !== "cut" && s.tr !== "flash" ? XF : 0; return <Sequence key={i} from={s.at - pre} durationInFrames={b - s.at + pre}><SceneWrap i={i} /></Sequence>; })}</Shaker>
    <Grade />
    <Dips />
    {!clean && <><Chrome />
    <Overlays />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 84%, rgba(0,0,0,0.3))", pointerEvents: "none" }} />
    <Subs5 hide={hideSubs} /></>}
    {audio && <Audio src={staticFile("tort/mix5.wav")} />}
  </AbsoluteFill>
);
