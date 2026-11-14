import React from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Stage, Shot, cam as C, clamp, ez, sm, W, H } from "./Common";
import { StrappadoSet, RatSet, RackSet } from "./SetsIn";
import { TowerExt, MuseumSet, SquareSet, SicilySet, MarshSet } from "./SetsOut";
import { Room, Prisoner, Drops, Pool, rockGeo, rockTex, caveWallGeo, randHits, flinchAt } from "../Gota/Video7";
import { Drop, FOREHEAD } from "../Gota/Dungeon4";
import { Subs, ChapterBar, TitleCard, RankBoard, Tag, Card, Stamp, Big, Counter, Split, Signatures, EndScreen, Grade } from "./UI";
import TIM from "./timing.json";

const FPS = 30;
const LS = (TIM as any).lines as { start: number; end: number }[];
const L = (i: number) => Math.round((LS[i].start - 0.12) * FPS); // frame a line starts
const LE = (i: number) => Math.round(LS[i].end * FPS);
export const TORT_FRAMES = Math.round(((TIM as any).dur + 3.4) * FPS);
const k01 = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: ez });

type SC = { at: number; C: React.FC<{ f: number; len: number }>; tr?: "fade" | "dark" | "cut" | "flash" };

/* ---------------- 3D shots ---------------- */
const Strap: React.FC<{ f: number; len: number; shots: Shot[]; lift?: (f: number) => number; weight?: number; pain?: number; exp?: number }> = ({ f, len, shots, lift = () => 0, weight = 0, pain = 0, exp = 1.2 }) => {
  const l = lift(f); exp *= 1.25;
  return <Stage f={f} len={len} shots={shots} exp={exp} fog={["#08080b", 9, 22]}><StrappadoSet f={f} lift={l} weight={weight} sway={l} crank={l * 14} pain={pain * l} /></Stage>;
};
const Rat: React.FC<{ f: number; len: number; shots: Shot[]; potOn?: number; heat?: number; ratIn?: number; panic?: number; cut?: number; lit?: number; exp?: number }> = ({ f, len, shots, potOn = 0, heat = 0, ratIn = 0, panic = 0, cut = 0, lit = 1, exp = 1.2 }) =>
  <Stage f={f} len={len} shots={shots} exp={exp} fog={["#08080b", 7, 16]}><RatSet f={f} potOn={potOn} heat={heat} ratIn={ratIn} panic={panic} cut={cut} lit={lit} /></Stage>;
const Drip: React.FC<{ f: number; len: number; shots: Shot[]; hits?: number[]; k?: number; tired?: number; day?: number; fspeed?: number; eyes?: "scared" | "closed"; exp?: number }> = ({ f, len, shots, hits = [], k = 0.4, tired = 0, day = 0, fspeed = 1, eyes, exp = 1.2 }) => {
  const g = f * fspeed;
  return <Stage f={f} len={len} shots={shots} exp={exp} fog={["#08080b", 7, 16]}>
    <Room f={g} candle={0.8 - tired * 0.6} day={day}>
      <Prisoner f={g} k={k + tired} flinch={flinchAt(f, hits)} tired={tired} sweat={tired} wet={0.3 + tired * 0.6} eyes={eyes ?? (hits.some((h) => f >= h && f < h + 8) ? "closed" : "scared")} brows={0.7} gaze={[0, 1]} breath={1.5 + tired * 1.5} />
      <Drops f={f} hits={hits} />
    </Room>
  </Stage>;
};
const Rack: React.FC<{ f: number; len: number; shots: Shot[]; turn?: number; strain?: number; empty?: boolean; exp?: number }> = ({ f, len, shots, turn = 0, strain = 0, empty, exp = 1.2 }) =>
  <Stage f={f} len={len} shots={shots} exp={exp} fog={["#08080b", 9, 22]}><RackSet f={f} turn={turn} strain={strain} noPrisoner={empty} /></Stage>;
const Tow: React.FC<{ f: number; len: number; shots: Shot[] }> = ({ f, len, shots }) => <Stage f={f} len={len} shots={shots} exp={1.25} fog={["#0a0e18", 25, 90]}><TowerExt f={f} /></Stage>;
const Mus: React.FC<{ f: number; len: number; shots: Shot[]; open?: number; dim?: number; spot?: number; exp?: number }> = ({ f, len, shots, open = 0, dim = 1, spot = 1, exp = 1.2 }) =>
  <Stage f={f} len={len} shots={shots} exp={exp * 1.3} fog={["#050404", 8, 20]}><MuseumSet f={f} open={open} dim={dim} spot={spot} /></Stage>;
const Sq: React.FC<{ f: number; len: number; shots: Shot[]; stage: "tie" | "strike" | "raised" | "judge"; sky?: "dusk" | "storm" | "sunset"; exp?: number }> = ({ f, len, shots, stage, sky = "dusk", exp = 1.1 }) =>
  <Stage f={f} len={len} shots={shots} exp={exp} fog={[sky === "storm" ? "#16181e" : "#3a2430", 18, 60]}><SquareSet f={f} stage={stage} sky={sky} /></Stage>;
const Sic: React.FC<{ f: number; len: number; shots: Shot[]; heat?: number; door?: number; roar?: number; sculptor?: boolean; victim?: "none" | "walk" | "tyrant"; walk?: number; exp?: number }> = ({ f, len, shots, heat = 0, door = 0, roar = 0, sculptor, victim = "none", walk = 0, exp = 1.05 }) =>
  <Stage f={f} len={len} shots={shots} exp={exp} fog={["#5a3a3a", 18, 70]}><SicilySet f={f} heat={heat} door={door} roar={roar} sculptor={sculptor} victim={victim} walk={walk} /></Stage>;
const Mar: React.FC<{ f: number; len: number; shots: Shot[]; honey?: number; flies?: number; day?: number; night?: boolean; guards?: boolean; exp?: number }> = ({ f, len, shots, honey = 1, flies = 0, day = 0, night, guards, exp = 1.05 }) =>
  <Stage f={f} len={len} shots={shots} exp={exp} fog={[night ? "#0a0e18" : "#8a8a68", 14, 50]}><MarshSet f={f} honey={honey} flies={flies} day={day} night={night} guards={guards} /></Stage>;
const StoneShot: React.FC<{ f: number; len: number }> = ({ f, len }) => {
  const hits = randHits("tsn", 4, len, 10, 11); const rock = rockTex(), g = interpolate(f, [0, len], [0.1, 1], clamp);
  const hr = 0.03 + 0.08 * Math.round(g * 25) / 25, depth = 0.004 + 0.06 * Math.round(g * 25) / 25, top = 0.18;
  return <Stage f={f} len={len} shots={[[0, C([0.0, 0.75, 1.5], [0, 0.42, 0], 34), C([0.35, 0.7, 1.2], [0, 0.35, 0], 32)]]} fog={["#08080b", 3, 10]}>
    <ambientLight intensity={0.3} color="#6a7aa0" />
    <spotLight position={[0.9, 2.4, 1.3]} target-position={[0, 0.3, 0]} angle={0.55} penumbra={0.8} intensity={17} distance={6} color="#d4e2f6" castShadow />
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

/* camera presets */
const STW = C([3.2, 2.0, 5.0], [0, 1.7, -0.6], 46), STW2 = C([2.6, 1.8, 4.2], [0, 1.6, -0.6], 44);
const RATW = C([2.4, 2.1, 2.6], [0, 0.9, 0], 42), RATW2 = C([2.0, 1.9, 2.2], [0, 0.95, 0], 40);
const DRW = C([1.6, 2.1, 2.6], [-0.3, 1.0, 0], 44), DRW2 = C([1.3, 2.0, 2.3], [-0.35, 1.0, 0], 42);
const RKW = C([2.2, 2.2, 3.8], [0, 0.9, 0.2], 42), RKW2 = C([1.8, 2.0, 3.3], [0, 0.9, 0.2], 40);
const SQW = C([9, 4.5, 12], [0, 1.6, 0], 42), SQW2 = C([7.5, 3.8, 10.5], [0, 1.6, 0], 40);
const SIW = C([-5.5, 2.4, 7.5], [0.6, 1.5, 0], 42), SIW2 = C([-4.6, 2.1, 6.4], [0.6, 1.5, 0], 40);
const MAW = C([4.2, 1.6, 3.6], [0.5, 0.3, 0], 40), MAW2 = C([3.5, 1.4, 3.0], [0.6, 0.25, 0], 38);
const HEADM: [number, number, number] = [1.38, 0.12, -0.43]; // approx world position of the head out of the boats

/* ---------------- the timeline ---------------- */
const SCENES: SC[] = [
  // HOOK
  { at: 0, tr: "cut", C: ({ f, len }) => <Mar f={f} len={len} flies={0.8} day={0.4} exp={0.85} shots={[[0, C([2.4, 0.7, 1.2], HEADM, 30), C([2.1, 0.6, 1.05], HEADM, 26)]]} /> },
  { at: L(1), C: ({ f, len }) => <Mar f={f} len={len} flies={1} day={0.7} shots={[[0, C([6.5, 3.2, 5.5], [0.5, 0.2, 0], 36), C([5.2, 2.4, 4.4], [0.6, 0.2, 0], 34)]]} /> },
  { at: L(3), tr: "flash", C: ({ f, len }) => <Sic f={f} len={len} heat={1} roar={1} exp={0.8} shots={[[0, C([-3.8, 1.2, 4.2], [0.6, 1.5, 0], 40), C([-3.2, 1.1, 3.6], [0.6, 1.5, 0], 38)]]} /> },
  { at: L(3) + 58, tr: "flash", C: ({ f, len }) => <Sq f={f} len={len} stage="raised" sky="storm" shots={[[0, C([5, 3.0, 8.5], [0, 4.6, 0], 40), C([4.2, 3.0, 7.6], [0, 4.8, 0], 38)]]} /> },
  { at: L(4), tr: "flash", C: ({ f, len }) => <Rack f={f} len={len} turn={1 + f / 20} strain={0.9} shots={[[0, C([0.4, 1.5, 1.3], [-0.2, 0.9, 0.2], 36), C([0.2, 1.45, 1.1], [-0.3, 0.9, 0.2], 34)]]} /> },
  { at: L(5), tr: "dark", C: ({ f, len }) => <Mus f={f} len={len} open={k01(f, 30, 120)} shots={[[0, C([0, 1.5, 5.5], [0, 1.4, -1.2], 36), C([0, 1.55, 3.6], [0, 1.5, -1.2], 34)]]} /> },
  { at: L(7), tr: "dark", C: ({ f, len }) => <Strap f={f} len={len} exp={0.75} shots={[[0, C([-3.2, 2.2, 3.6], [0.4, 1.6, -1], 46), C([-2.8, 2.1, 3.2], [0.5, 1.6, -1], 46)]]} /> },
  // CONTEXT
  { at: L(8), tr: "dark", C: ({ f, len }) => <Tow f={f} len={len} shots={[[0, C([14, 3, 30], [0, 8, 0], 40), C([9, 2.6, 25], [0, 8.5, 0], 40)]]} /> },
  { at: L(10), C: ({ f, len }) => <Strap f={f} len={len} shots={[[0, C([0.4, 1.6, 0.6], [0, 1.3, -2.8], 40), C([0.2, 1.6, 0.0], [0, 1.4, -2.8], 40)]]} /> },
  { at: L(11), C: ({ f, len }) => <Sq f={f} len={len} stage="raised" shots={[[0, SQW, SQW2]]} /> },
  { at: L(13), C: ({ f, len }) => <Rack f={f} len={len} empty turn={f / 40} shots={[[0, C([-1.6, 1.3, 1.4], [-1.2, 0.85, 0.2], 34), C([-1.0, 1.25, 1.4], [-1.0, 0.85, 0.2], 34)]]} /> },
  { at: L(14), C: ({ f, len }) => <Sic f={f} len={len} shots={[[0, C([1.5, 1.6, 4.0], [4.2, 1.2, 1.2], 34), C([2.0, 1.6, 3.6], [4.2, 1.3, 1.2], 32)]]} /> },
  { at: L(15), C: ({ f, len }) => <Drip f={f} len={len} k={0.5} shots={[[0, DRW, DRW2]]} /> },
  { at: L(16), tr: "dark", C: ({ f, len }) => <Strap f={f} len={len} exp={0.9} shots={[[0, C([1.2, 1.4, -1.0], [-0.2, 1.3, -3.4], 38), C([0.8, 1.45, -1.3], [-0.3, 1.35, -3.4], 36)]]} /> },
  // #7 STRAPPADO
  { at: L(18), tr: "dark", C: ({ f, len }) => <Strap f={f} len={len} shots={[[0, STW, STW2]]} /> },
  { at: L(21), C: ({ f, len }) => <Strap f={f} len={len} shots={[[0, C([1.4, 1.3, 2.0], [0, 1.2, 0], 40), C([1.2, 1.6, 1.8], [0, 3.4, 0], 40)]]} /> },
  { at: L(22), C: ({ f, len }) => <Strap f={f} len={len} shots={[[0, C([-1.4, 1.4, -2.0], [0, 1.0, 0], 38), C([-1.2, 1.4, -1.8], [0, 1.0, 0], 36)]]} /> },
  { at: L(23), C: ({ f, len }) => <Strap f={f} len={len} lift={(g) => k01(g, 12, 110)} pain={1} shots={[[0, C([2.6, 1.5, 1.9], [0, 1.6, 0], 42), C([2.3, 1.7, 1.7], [0, 1.9, 0], 42)]]} /> },
  { at: L(25), C: ({ f, len }) => <Strap f={f} len={len} lift={() => 1} weight={1} pain={1} shots={[[0, C([0.9, 0.9, 1.3], [0, 0.9, 0], 38), C([0.8, 1.4, 1.2], [0, 1.7, 0], 38)]]} /> },
  { at: L(26), C: ({ f, len }) => <Strap f={f} len={len} lift={(g) => g < 40 ? 1 : g < 48 ? 1 - 0.85 * sm(40, 48, g) : 0.15 + 0.05 * Math.exp(-(g - 48) / 6) * Math.cos((g - 48) / 2)} weight={1} pain={1} shots={[[0, C([-3.4, 1.4, 2.6], [0, 1.5, 0], 44), C([-3.1, 1.4, 2.3], [0, 1.4, 0], 44)]]} /> },
  { at: L(27), C: ({ f, len }) => <Strap f={f} len={len} lift={() => 0.6} pain={0.6} shots={[[0, C([0.6, 1.5, -0.9], [-0.3, 1.25, -3.2], 34), C([0.3, 1.5, -1.3], [-0.3, 1.3, -3.2], 32)]]} /> },
  { at: L(28), tr: "dark", C: ({ f, len }) => <Strap f={f} len={len} lift={() => 0.9} pain={0.6} exp={0.8} shots={[[0, C([-2.4, 2.2, 3.6], [0, 1.8, 0], 40), C([-2.0, 2.0, 3.1], [0, 1.8, 0], 38)]]} /> },
  { at: L(31), C: ({ f, len }) => <Strap f={f} len={len} exp={0.85} shots={[[0, C([-2.8, 2.6, -0.6], [-4, 2.9, -1.2], 50), C([-2.6, 2.6, -0.8], [-4, 2.9, -1.2], 48)]]} /> },
  { at: L(33), tr: "dark", C: ({ f, len }) => <Strap f={f} len={len} lift={() => 0.95} exp={0.9} shots={[[0, C([0, 1.9, 2.4], [0, 1.9, 0], 44), C([0, 2.3, 5.0], [0, 2.0, 0], 46)]]} /> },
  // #6 RAT
  { at: L(35), tr: "dark", C: ({ f, len }) => <Rat f={f} len={len} shots={[[0, RATW, RATW2]]} /> },
  { at: L(37), C: ({ f, len }) => <Rat f={f} len={len} shots={[[0, C([0.95, 1.35, 1.25], [0.75, 0.95, 0.28], 32), C([0.88, 1.3, 1.1], [0.75, 0.95, 0.28], 30)]]} /> },
  { at: L(38), C: ({ f, len }) => <Rat f={f} len={len} ratIn={1} potOn={k01(f, 10, 50)} shots={[[0, C([1.1, 1.8, 1.7], [-0.1, 1.0, 0], 38), C([1.0, 1.7, 1.5], [-0.1, 1.0, 0], 36)]]} /> },
  { at: L(39), C: ({ f, len }) => <Rat f={f} len={len} ratIn={1} potOn={1} heat={k01(f, 10, 70)} panic={k01(f, 50, 90)} shots={[[0, C([0.9, 1.75, 1.5], [-0.1, 1.0, 0], 36), C([0.8, 1.7, 1.35], [-0.1, 1.0, 0], 34)]]} /> },
  { at: L(40), C: ({ f, len }) => <Rat f={f} len={len} ratIn={1} potOn={1} heat={1} panic={1} cut={1} shots={[[0, C([0.7, 1.45, 0.9], [-0.1, 1.05, 0], 32), C([0.62, 1.42, 0.8], [-0.1, 1.05, 0], 30)]]} /> },
  { at: L(42), tr: "dark", C: ({ f, len }) => <Rat f={f} len={len} ratIn={1} potOn={1} heat={0.8} panic={0.8} exp={0.75} shots={[[0, C([-1.8, 1.7, 1.6], [0, 1.0, 0], 38), C([-1.5, 1.6, 1.3], [0, 1.0, 0], 36)]]} /> },
  { at: L(45), C: ({ f, len }) => <Rat f={f} len={len} ratIn={1} potOn={1} lit={0} shots={[[0, C([1.0, 1.6, 1.3], [-0.1, 1.05, 0], 34), C([0.2, 1.65, 1.45], [-0.1, 1.05, 0], 34)]]} /> },
  { at: L(48), C: ({ f, len }) => <Rat f={f} len={len} ratIn={1} potOn={1} panic={0.3} lit={0} shots={[[0, C([-0.9, 1.6, 1.2], [-0.5, 1.0, 0], 34), C([-0.85, 1.55, 1.1], [-0.5, 1.0, 0], 32)]]} /> },
  { at: L(50), C: ({ f, len }) => <Drip f={f} len={len} hits={[20]} shots={[[0, C([-0.1, 1.55, 0.95], [-0.72, 1.12, 0], 34), C([-0.15, 1.52, 0.88], [-0.72, 1.12, 0], 32)]]} /> },
  // #5 WATER DROP
  { at: L(51), tr: "dark", C: ({ f, len }) => <Drip f={f} len={len} shots={[[0, DRW, DRW2]]} /> },
  { at: L(53), C: ({ f, len }) => <Drip f={f} len={len} shots={[[0, C([-2.2, 2.2, 2.2], [-0.2, 1.0, 0], 44), C([-1.9, 2.0, 1.9], [-0.2, 1.0, 0], 42)]]} /> },
  { at: L(55), tr: "dark", C: StoneShot },
  { at: L(57), tr: "dark", C: ({ f, len }) => <Drip f={f} len={len} hits={[L(58) - L(57) + 40, L(59) - L(57) + 6]} shots={[[0, C([0.2, 1.75, 1.3], [-0.7, 1.15, 0], 36), C([-0.1, 1.6, 0.85], [-0.75, 1.15, 0], 32)]]} /> },
  { at: L(60), C: ({ f, len }) => <Drip f={f} len={len} hits={randHits("lp", 6, len, 6, 14)} tired={k01(f, 0, len) * 0.7} fspeed={1.3} day={Math.max(0, Math.sin(f / 40))} shots={[[0, C([1.0, 3.3, 1.8], [-0.2, 0.8, -0.2], 44), C([0.8, 3.25, 2.0], [-0.2, 0.8, -0.2], 44)]]} /> },
  { at: L(64), C: ({ f, len }) => <Drip f={f} len={len} hits={randHits("lq", 10, len, 12, 20)} tired={0.8} shots={[[0, C([-0.1, 1.55, 0.95], [-0.72, 1.12, 0], 34), C([-0.15, 1.52, 0.88], [-0.72, 1.12, 0], 32)]]} /> },
  { at: L(65), C: ({ f, len }) => <Drip f={f} len={len} tired={0.6} exp={0.7} shots={[[0, DRW2, DRW]]} /> },
  { at: L(69), tr: "dark", C: ({ f, len }) => <Drip f={f} len={len} hits={randHits("lr", 10, len, 14, 22)} tired={0.9} exp={0.85} shots={[[0, C([0.6, 1.6, 1.4], [-0.6, 1.1, 0], 38), C([0.2, 1.45, 0.9], [-0.7, 1.1, 0], 34)]]} /> },
  // #4 RACK
  { at: L(71), tr: "dark", C: ({ f, len }) => <Rack f={f} len={len} shots={[[0, RKW, RKW2]]} /> },
  { at: L(73), C: ({ f, len }) => <Rack f={f} len={len} shots={[[0, C([-2.0, 1.4, 1.6], [0, 0.85, 0.2], 38), C([-1.4, 1.5, 2.0], [0.2, 0.85, 0.2], 38)]]} /> },
  { at: L(75), C: ({ f, len }) => <Rack f={f} len={len} turn={k01(f, 5, len) * 3} strain={k01(f, 10, len)} shots={[[0, C([1.2, 1.7, 2.2], [0, 0.9, 0.2], 40), C([0.5, 1.45, 1.3], [-0.4, 0.9, 0.2], 36)]]} /> },
  { at: L(77), tr: "dark", C: ({ f, len }) => <Tow f={f} len={len} shots={[[0, C([-8, 1.6, 24], [0, 8, 0], 38), C([-5, 1.8, 20], [0, 9, 0], 40)]]} /> },
  { at: L(79), C: ({ f, len }) => <Rack f={f} len={len} turn={3} strain={0.9} exp={0.75} shots={[[0, C([-2.6, 1.9, 2.6], [0, 0.9, 0.2], 40), C([-2.2, 1.8, 2.2], [0, 0.9, 0.2], 38)]]} /> },
  { at: L(82), C: ({ f, len }) => <Rack f={f} len={len} turn={3} strain={0.9} exp={0.5} shots={[[0, RKW2, RKW]]} /> },
  { at: L(84), tr: "dark", C: ({ f, len }) => <Rack f={f} len={len} empty turn={0.3} exp={0.95} shots={[[0, C([0.0, 1.6, 3.4], [0, 0.85, 0.2], 36), C([0.0, 1.3, 2.4], [0, 0.8, 0.2], 34)]]} /> },
  // TWIST: IRON MAIDEN
  { at: L(87), tr: "cut", C: Black },
  { at: L(88), tr: "fade", C: ({ f, len }) => <Mus f={f} len={len} dim={0.5} spot={k01(f, 20, 60)} shots={[[0, C([0, 1.7, 6.5], [0, 1.4, -1.2], 38), C([0, 1.6, 4.6], [0, 1.4, -1.2], 36)]]} /> },
  { at: L(90), C: ({ f, len }) => <Mus f={f} len={len} open={k01(f, 5, 60)} shots={[[0, C([1.1, 1.8, 2.6], [0, 1.5, -1.25], 36), C([0.8, 1.75, 2.2], [0, 1.5, -1.25], 34)]]} /> },
  { at: L(92), C: ({ f, len }) => <Mus f={f} len={len} open={1} dim={0.5} shots={[[0, C([-0.9, 1.9, 1.9], [0, 1.5, -1.25], 34), C([-0.7, 1.85, 1.6], [0, 1.5, -1.25], 32)]]} /> },
  { at: L(94), C: ({ f, len }) => <Mus f={f} len={len} open={1} shots={[[0, C([2.5, 1.4, 3.6], [0, 1.3, -1.2], 38), C([1.8, 1.5, 3.2], [0, 1.3, -1.2], 38)]]} /> },
  { at: L(96), C: ({ f, len }) => <Mus f={f} len={len} open={1} shots={[[0, C([-1.5, 1.4, 1.5], [-3.6, 1.2, -2.2], 40), C([1.5, 1.4, 1.5], [3.6, 1.2, -2.2], 40)]]} /> },
  { at: L(97), C: ({ f, len }) => <Mus f={f} len={len} open={1} dim={0.4} shots={[[0, C([0, 1.5, 3.0], [0, 1.4, -1.2], 34), C([0, 1.55, 2.6], [0, 1.45, -1.2], 32)]]} /> },
  // #3 WHEEL
  { at: L(99), tr: "dark", C: ({ f, len }) => <Sq f={f} len={len} stage="tie" shots={[[0, SQW, SQW2]]} /> },
  { at: L(101), C: ({ f, len }) => <Sq f={f} len={len} stage="tie" shots={[[0, C([0, 14, 14], [0, 0, -1], 40), C([3, 11, 12], [0, 0, -1], 40)]]} /> },
  { at: L(103), C: ({ f, len }) => <Sq f={f} len={len} stage="tie" shots={[[0, C([3.0, 2.6, 8.8], [0, 1.3, 4], 40), C([-2.0, 2.6, 8.8], [0, 1.3, 4], 40)]]} /> },
  { at: L(106), C: ({ f, len }) => <Sq f={f} len={len} stage="tie" shots={[[0, C([1.6, 3.2, 2.4], [0, 1.1, 0], 38), C([1.3, 3.0, 2.0], [0, 1.1, 0], 36)]]} /> },
  { at: L(107), C: ({ f, len }) => <Sq f={f} len={len} stage="strike" shots={[[0, C([-4.2, 3.6, 7.2], [0, 1.4, 0], 34), C([-3.6, 3.4, 6.4], [0, 1.4, 0], 32)]]} /> },
  { at: L(108), tr: "dark", C: ({ f, len }) => <Sq f={f} len={len} stage="raised" sky="storm" shots={[[0, C([3, 1.6, 4.6], [0, 4.8, 0], 44), C([2.4, 1.7, 3.9], [0, 5.1, 0], 42)]]} /> },
  { at: L(110), C: ({ f, len }) => <Sq f={f} len={len} stage="judge" shots={[[0, C([0.2, 2.6, 1.8], [-1.5, 2.1, -1.0], 38), C([0.0, 2.55, 1.6], [-1.5, 2.15, -1.0], 36)]]} /> },
  { at: L(113), tr: "dark", C: ({ f, len }) => <Sq f={f} len={len} stage="raised" sky="storm" exp={0.9} shots={[[0, C([-7, 3.4, 13.5], [0, 4.2, 0], 40), C([-6, 3.4, 12.5], [0, 4.3, 0], 40)]]} /> },
  { at: L(114), C: ({ f, len }) => <Sq f={f} len={len} stage="raised" sky="sunset" exp={0.8} shots={[[0, C([0, 2.6, 14], [0, 4.4, 0], 36), C([0, 2.8, 12.5], [0, 4.6, 0], 36)]]} /> },
  // #2 BRAZEN BULL
  { at: L(116), tr: "dark", C: ({ f, len }) => <Sic f={f} len={len} shots={[[0, SIW, SIW2]]} /> },
  { at: L(118), C: ({ f, len }) => <Sic f={f} len={len} shots={[[0, C([-2, 6, 16], [0, 2.5, -4], 40), C([1, 5, 14], [0, 2.5, -4], 40)]]} /> },
  { at: L(120), C: ({ f, len }) => <Sic f={f} len={len} shots={[[0, C([2.3, 1.5, 3.4], [4.2, 1.25, 1.2], 32), C([2.6, 1.5, 3.0], [4.2, 1.3, 1.2], 30)]]} /> },
  { at: L(122), C: ({ f, len }) => <Sic f={f} len={len} sculptor shots={[[0, C([-3.8, 1.8, 5.2], [0, 1.4, 0.4], 40), C([-3.0, 1.7, 4.4], [0, 1.4, 0.4], 38)]]} /> },
  { at: L(123), C: ({ f, len }) => <Sic f={f} len={len} door={k01(f, 4, 30)} shots={[[0, C([0.6, 1.7, 3.4], [0.3, 1.4, 0.4], 36), C([0.5, 1.65, 3.0], [0.3, 1.4, 0.4], 34)]]} /> },
  { at: L(124), C: ({ f, len }) => <Sic f={f} len={len} door={1} heat={k01(f, 0, 30)} shots={[[0, C([-1.6, 0.4, 2.6], [0, 0.6, 0], 40), C([-1.4, 0.45, 2.3], [0, 0.65, 0], 38)]]} /> },
  { at: L(125), C: ({ f, len }) => <Sic f={f} len={len} door={1} heat={1} roar={k01(f, 60, 100)} shots={[[0, C([3.2, 1.8, 1.9], [1.5, 1.4, 0], 36), C([2.9, 1.75, 1.6], [1.5, 1.4, 0], 34)]]} /> },
  { at: L(127), tr: "dark", C: ({ f, len }) => <Sic f={f} len={len} sculptor victim="walk" walk={k01(f, 20, 200)} door={1 - k01(f, 210, 240)} heat={k01(f, 200, 250)} exp={0.9} shots={[[0, C([-4.4, 1.9, 5.8], [-0.4, 1.3, 0.6], 40), C([-3.6, 1.8, 4.8], [-0.2, 1.3, 0.6], 38)]]} /> },
  { at: L(130), tr: "dark", C: ({ f, len }) => <Sic f={f} len={len} victim="tyrant" walk={k01(f, 30, len)} door={1} heat={0} exp={0.75} shots={[[0, C([-5, 1.7, 6.5], [0, 1.3, 0.6], 40), C([-4.2, 1.7, 5.5], [0, 1.3, 0.6], 38)]]} /> },
  { at: L(133), tr: "dark", C: ({ f, len }) => <Sic f={f} len={len} heat={1} roar={1} exp={0.6} shots={[[0, C([-2.6, 0.8, 4.8], [0.4, 1.6, 0], 38), C([-2.2, 0.8, 4.2], [0.4, 1.6, 0], 36)]]} /> },
  // #1 SCAPHISM
  { at: L(134), tr: "dark", C: ({ f, len }) => <Mar f={f} len={len} honey={0} shots={[[0, MAW, MAW2]]} /> },
  { at: L(136), C: ({ f, len }) => <Mar f={f} len={len} honey={0} shots={[[0, C([-8, 3, 9], [0, 0.5, 0], 40), C([-6, 2.6, 8], [0, 0.4, 0], 40)]]} /> },
  { at: L(137), C: ({ f, len }) => <Mar f={f} len={len} honey={0} shots={[[0, C([3.6, 1.9, -2.6], [0.2, 0.15, 0], 38), C([-1.6, 2.0, 3.6], [0.4, 0.15, 0], 38)]]} /> },
  { at: L(139), C: ({ f, len }) => <Mar f={f} len={len} honey={k01(f, 60, 120)} shots={[[0, C([2.3, 0.75, 1.3], HEADM, 30), C([2.1, 0.7, 1.15], HEADM, 28)]]} /> },
  { at: L(141), C: ({ f, len }) => <Mar f={f} len={len} shots={[[0, C([0, 6, 9], [0, 0, 0], 40), C([0, 5, 8], [0, 0, 0], 38)]]} /> },
  { at: L(142), C: ({ f, len }) => <Mar f={f} len={len} flies={k01(f, 0, 40)} day={0.3} shots={[[0, C([2.2, 0.65, 1.1], HEADM, 28), C([2.05, 0.62, 1.0], HEADM, 26)]]} /> },
  { at: L(143), C: ({ f, len }) => <Mar f={f} len={len} flies={1} day={0.4} guards shots={[[0, C([-5.5, 1.8, 6.5], [0, 0.6, 0], 40), C([-4.6, 1.7, 5.6], [0, 0.6, 0], 38)]]} /> },
  { at: L(146), C: ({ f, len }) => { const ph = Math.floor(f / 13); return <Mar f={f} len={len} flies={1} day={Math.min(1, f / len)} night={ph % 2 === 1} exp={ph % 2 ? 1.6 : 1} shots={[[0, C([4.2, 1.5, 3.0], [0.5, 0.2, 0], 36), C([3.6, 1.3, 2.6], [0.6, 0.2, 0], 34)]]} />; } },
  { at: L(148), tr: "dark", C: ({ f, len }) => <Mar f={f} len={len} night flies={0.4} day={1} exp={1.5} shots={[[0, C([5.5, 2.0, 4.5], [0.5, 0.2, 0], 38), C([6.5, 2.6, 5.5], [0.5, 0.2, 0], 40)]]} /> },
  // END
  { at: L(150), tr: "dark", C: ({ f, len }) => <Strap f={f} len={len} exp={0.6} shots={[[0, C([-3.2, 2.0, 3.6], [0.6, 1.6, -1], 46), C([-2.6, 1.9, 3.0], [0.6, 1.6, -1], 44)]]} /> },
];
const CH = [18, 35, 51, 71, 99, 116, 134].map(L); // chapter starts (#7..#1)

/* ---------------- overlays on the global timeline ---------------- */
const Overlays: React.FC = () => {
  const g = useCurrentFrame();
  const at = (a: number, len: number, el: (f: number) => React.ReactNode) => (g >= a && g < a + len ? el(g - a) : null);
  const titles: [number, number, string, string][] = [[0, 7, "The Strappado", "INQUISITION · EUROPE"], [1, 6, "The Rat", "DUTCH REVOLT · 1570s"], [2, 5, "The Water Drop", "ITALY · c. 1500"], [3, 4, "The Rack", "TOWER OF LONDON"], [4, 3, "The Breaking Wheel", "HOLY ROMAN EMPIRE"], [5, 2, "The Brazen Bull", "SICILY · c. 550 BC"], [6, 1, "Scaphism", "ANCIENT PERSIA"]];
  return <>
    {/* hook */}
    {at(L(1), L(3) - L(1), (f) => <Counter f={f} len={L(3) - L(1)} label="DAYS ALIVE" value={Math.min(17, 1 + Math.floor(Math.pow(f / 90, 0.8) * 16))} icon="sun" />)}
    {at(L(2) - 4, L(3) - L(2) + 4, (f) => <Big f={f} len={L(3) - L(2) + 4} text="17 DAYS" sub="ALIVE" color="#ff3a4a" />)}
    {at(L(3) + 4, L(5) - L(3) - 4, (f) => <Big f={f} len={L(5) - L(3) - 4} text="7 TORTURES" sub="EACH ONE WORSE THAN THE LAST" y={360} />)}
    {at(L(6) + 6, L(7) - L(6), (f) => <Stamp f={f} len={L(7) - L(6) - 6} text="REAL?" color="#ff3a4a" />)}
    {at(L(7), L(8) - L(7) + 6, (f) => <RankBoard f={f} reveal={0} len={L(8) - L(7) + 6} x={660} />)}
    {/* context */}
    {at(L(16) + 10, L(18) - L(16) - 10, (f) => <Card f={f} len={L(18) - L(16) - 16} kicker="MEDIEVAL LAW" title="“The queen of proofs”" body="A confession counted more than any witness. Courts were allowed to use pain to get one." icon="scroll" />)}
    {/* chapter titles */}
    {titles.map(([i, n, name, sub]) => <React.Fragment key={n}>{at(CH[i] + 4, 110, (f) => <TitleCard f={f} n={n} name={name} sub={sub} len={104} />)}</React.Fragment>)}
    {/* #7 */}
    {at(L(27) + 20, L(28) - L(27) - 20, (f) => <Stamp f={f} len={L(28) - L(27) - 26} text="NO MARKS" size={130} rot={-6} />)}
    {at(L(29), L(31) - L(29), (f) => <Card f={f} len={L(31) - L(29) - 4} kicker="FLORENCE · 1513" title="Niccolò Machiavelli" body="Hoisted by the rope six times. He confessed nothing." icon="eye" />)}
    {at(L(31) + 10, L(33) - L(31), (f) => <Card f={f} len={L(33) - L(31) - 6} kicker="WRITTEN THE SAME YEAR" title="The Prince" body="One of the most famous books on power ever written." icon="book" side="l" />)}
    {/* #6 */}
    {at(L(42), L(43) - L(42) + 20, (f) => <Tag f={f} len={L(43) - L(42) + 14} place="The Dutch Revolt" date="NETHERLANDS · 1500s" />)}
    {at(L(43) + 10, L(45) - L(43) - 10, (f) => <Card f={f} len={L(45) - L(43) - 16} kicker="GEORGE ORWELL · 1949" title="Nineteen Eighty-Four" body="Room 101: “the worst thing in the world.” A cage of rats." icon="book" />)}
    {at(L(48) + 20, L(49) - L(48), (f) => <Stamp f={f} len={L(49) - L(48) - 14} text="CONFESSED" size={120} rot={-5} />)}
    {/* #5 */}
    {at(L(54) - 2, L(55) - L(54) + 6, (f) => <Stamp f={f} len={L(55) - L(54) + 2} text="NOT CHINESE" size={130} />)}
    {at(L(55) + 8, L(57) - L(55) - 8, (f) => <Card f={f} len={L(57) - L(55) - 14} kicker="BOLOGNA, ITALY · c. 1500" title="Hippolytus de Marsiliis" body="A lawyer who saw water carve a hole in solid stone." icon="drop" side="l" />)}
    {at(L(60), L(64) - L(60), (f) => <Counter f={f} len={L(64) - L(60)} label={f < 110 ? "HOURS" : "DAYS"} value={f < 110 ? 1 + Math.floor(f / 5) : 1 + Math.floor((f - 110) / 45)} icon="clock" />)}
    {at(L(65), L(69) - L(65), (f) => <Split f={f} len={L(69) - L(65) - 4} l={["drop", "FREE TO MOVE", "Just annoying."]} r={["lock", "STRAPPED DOWN", "Panic within hours."]} at={L(67) - L(65)} />)}
    {/* #4 */}
    {at(L(77) + 6, L(78) - L(77) + 10, (f) => <Tag f={f} len={L(78) - L(77)} place="Tower of London" date="ENGLAND" />)}
    {at(L(78) + 6, L(79) - L(78), (f) => <Card f={f} len={L(79) - L(78) - 4} kicker="THE RACK'S NICKNAME" title="The Duke of Exeter's Daughter" icon="crown" />)}
    {at(L(79) + 6, L(80) - L(79), (f) => <Card f={f} len={L(80) - L(79) - 4} kicker="LONDON · 1605" title="Guy Fawkes" body="Caught guarding 36 barrels of gunpowder under Parliament." icon="skull" />)}
    {at(L(80) + 6, L(82) - L(80), (f) => <Card f={f} len={L(82) - L(80) - 6} kicker="KING JAMES I · 1605" title="“The gentler tortures first…”" body="“…and so, by degrees, to the worst.”" icon="crown" side="l" />)}
    {at(L(82), L(84) - L(82), (f) => <Signatures f={f} len={L(84) - L(82) - 4} at={L(83) - L(82) + 10} />)}
    {/* twist */}
    {at(L(87), L(88) - L(87) + 10, (f) => <Big f={f} len={L(88) - L(87) + 10} text="BUT WAIT…" y={430} size={150} />)}
    {at(L(93) + 4, L(94) - L(93), (f) => <Big f={f} len={L(94) - L(93) - 2} text="NO EVIDENCE" sub="IT WAS EVER USED" color="#ff3a4a" y={330} size={150} />)}
    {at(L(94) + 6, L(96) - L(94), (f) => <Card f={f} len={L(96) - L(94) - 6} kicker="NUREMBERG · 1800s" title="Built for tourists" body="Assembled from old pieces, long after the Middle Ages." icon="q" />)}
    {at(L(97), L(99) - L(97), (f) => <Stamp f={f} len={L(99) - L(97) - 6} text="MYTH" size={220} />)}
    {/* #3 */}
    {at(L(111), L(113) - L(111), (f) => <Card f={f} len={L(113) - L(111) - 6} kicker="FRENCH · “THE BLOW OF MERCY”" title="Coup de grâce" body="One final blow first, so the condemned would not suffer." icon="skull" />)}
    {at(L(113) + 4, L(114) - L(113), (f) => <Tag f={f} len={L(114) - L(113) - 4} place="Prussia" date="STILL USED IN 1841" icon="clock" />)}
    {/* #2 */}
    {at(L(118) + 6, L(120) - L(118), (f) => <Tag f={f} len={L(120) - L(118) - 4} place="Sicily" date="c. 550 BC" />)}
    {at(L(121), L(122) - L(121), (f) => <Card f={f} len={L(122) - L(121) - 4} kicker="TYRANT OF AKRAGAS" title="Phalaris" body="Akragas is today the city of Agrigento, in Sicily." icon="crown" side="l" />)}
    {at(L(129), L(130) - L(129), (f) => <Card f={f} len={L(130) - L(129) - 4} kicker="THE INVENTOR" title="Perillos" body="According to legend, its first victim." icon="skull" />)}
    {/* #1 */}
    {at(L(136) + 4, L(137) - L(136), (f) => <Tag f={f} len={L(137) - L(136) - 4} place="Ancient Persia" date="DESCRIBED BY PLUTARCH" icon="scroll" />)}
    {at(L(146), L(148) - L(146), (f) => <Counter f={f} len={L(148) - L(146)} label="DAY" value={Math.min(17, 1 + Math.floor(f / 13 / 2) + Math.floor(Math.max(0, f - 120) / 6))} icon={Math.floor(f / 13) % 2 ? "moon" : "sun"} />)}
    {at(L(146) + 10, L(148) - L(146), (f) => <Card f={f} len={L(148) - L(146) - 16} kicker="ACCORDING TO PLUTARCH" title="Mithridates" body="A Persian soldier condemned by the king. He lasted 17 days." icon="scroll" />)}
    {/* end */}
    {at(L(150), TORT_FRAMES - L(150), (f) => <RankBoard f={f} reveal={7} len={L(155) - L(150) + 6} hl={f > 60 ? 6 : -1} x={f < L(153) - L(150) ? 650 : 1180} title="THE FINAL RANKING" />)}
    {at(L(150), TORT_FRAMES - L(150), (f) => <EndScreen f={f} len={TORT_FRAMES - L(150)} askAt={L(153) - L(150)} nextAt={L(155) - L(150)} />)}
  </>;
};

/* ---------------- assembly ---------------- */
const XF = 10;
const SceneWrap: React.FC<{ i: number }> = ({ i }) => {
  const g = useCurrentFrame(); const s = SCENES[i], C2 = s.C, a = s.at, b = i + 1 < SCENES.length ? SCENES[i + 1].at : TORT_FRAMES;
  const tr = s.tr ?? "fade"; const f = g - (i > 0 && tr !== "cut" ? XF : 0); const k = interpolate(g, [0, XF], [0, 1], clamp);
  const op = i === 0 || tr === "cut" ? 1 : tr === "flash" ? 1 : k;
  return <AbsoluteFill style={{ opacity: op }}><C2 f={Math.max(0, f)} len={b - a} /></AbsoluteFill>;
};
const Dips: React.FC = () => { const g = useCurrentFrame(); let o = 0, w = 0; SCENES.forEach((s, i) => { if (i === 0) return; const d = Math.abs(g - s.at); if (s.tr === "dark") o = Math.max(o, 1 - d / 9); if (s.tr === "flash" && g >= s.at && g < s.at + 6) w = Math.max(w, 1 - (g - s.at) / 6); });
  return <>{o > 0 && <AbsoluteFill style={{ background: "#000", opacity: Math.min(1, o * 1.1) }} />}{w > 0 && <AbsoluteFill style={{ background: "#fff", opacity: w * 0.5, mixBlendMode: "screen" }} />}</>; };
const hideSubs: [number, number][] = CH.map((c) => [c, c + 80]);
export const Tort: React.FC<{ audio?: boolean; from?: number }> = ({ audio = false }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    {SCENES.map((s, i) => { const b = i + 1 < SCENES.length ? SCENES[i + 1].at : TORT_FRAMES; const pre = i > 0 && s.tr !== "cut" ? XF : 0; return <Sequence key={i} from={s.at - pre} durationInFrames={b - s.at + pre}><SceneWrap i={i} /></Sequence>; })}
    <Grade />
    <Dips />
    <Overlays />
    <ChapterBar marks={CH} total={TORT_FRAMES} show={[L(8), L(150)]} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 75%, rgba(0,0,0,0.45))", pointerEvents: "none" }} />
    <Subs hide={hideSubs} />
    {audio && <Audio src={staticFile("tort/mix.wav")} />}
  </AbsoluteFill>
);
