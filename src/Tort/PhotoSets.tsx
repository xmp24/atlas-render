import React from "react";
import * as THREE from "three";
import { random } from "remotion";
import { Bot5 as Bot, Kind } from "./Bot5";
import { STAND, BP, idleBP } from "../Miya8/Bot3";
import { Rope, RatBody } from "./SetsIn";
import { Drop } from "../Gota/Dungeon4";
import { Wheel, Bull, IronMaiden } from "./SetsOut";
import { Fire, Logs, Crows, Crow, V3 } from "./Common";
import { Catcher, Occluder, PhotoLights } from "./Photo";

/* ============ the Tower rack chamber (ph6) ============ */
const RK_C: V3 = [0.51, 0, -4.81], RK_YAW = 0.809, RK_BED = 0.85, RK_HALF = 1.66;
export const RackPhoto3D: React.FC<{ f: number; turn: number; strain: number; empty?: boolean; viewer?: boolean; clerk?: boolean }> = ({ f, turn, strain, empty, viewer, clerk = true }) => {
  const s = strain;
  return <group>
    <PhotoLights key1={[-4, 5, -2]} tgt={RK_C} col="#ffb070" i={1.8} amb={0.45} />
    <pointLight position={[-3.5, 1.2, -4.4]} intensity={3} distance={6} color="#ff9040" />
    <pointLight position={[0.4, 2.4, -4.2]} intensity={4} distance={5} color="#ffc890" />
    <Catcher p={[0.5, 0.002, -5]} s={[10, 10]} o={0.45} />
    <group position={RK_C} rotation={[0, RK_YAW, 0]}>
      <mesh position={[0, RK_BED + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[3.2, 0.8]} /><shadowMaterial transparent opacity={0.4} /></mesh>
      {!empty && <>
        <Bot pos={[0.78 + s * 0.04, RK_BED + 0.09, 0]} rot={[-Math.PI / 2, 0, Math.PI / 2]} p={{ ...STAND, lArmX: 180, rArmX: 180, lArmZ: -10, rArmZ: 10, lElbow: 0, rElbow: 0, lLegZ: -4, rLegZ: 4, headX: -8 + Math.sin(f / 11) * 4 * s, headY: Math.sin(f / 17) * 14 * s, bob: 0 }} f={f} outfit="prisoner" hood={false} eyes={s > 0.3 ? "scared" : "calm"} mouth={s > 0.55 ? "scream" : s > 0.2 ? "grit" : "fear"} brows={1} pupil={0.8} ground={false} scale={1 + s * 0.05} />
        {[0.06, -0.06].map((z) => <Rope key={"h" + z} a={[-RK_HALF + 0.1, RK_BED + 0.12, z]} b={[-1.1 - s * 0.05, RK_BED + 0.11, z]} r={0.012} />)}
        {[0.07, -0.07].map((z) => <Rope key={"f" + z} a={[RK_HALF - 0.1, RK_BED + 0.12, z]} b={[0.82 + s * 0.08, RK_BED + 0.1, z]} r={0.012} />)}
      </>}
      {viewer && <Bot pos={[-0.6, 0, 0.9]} ry={Math.PI} p={idleBP(f, { ...STAND, headX: 12, lArmX: 30, rArmX: 30, lElbow: -10, rElbow: -10 })} f={f} outfit="fawkes" hood={false} eyes="scared" mouth="fear" brows={1} />}
    </group>
    {/* the turner at the front wheel */}
    <Bot pos={[2.35, 0, -5.55]} ry={-2.2} p={{ ...STAND, lean: 14 + Math.sin(turn * 4) * 6, lArmX: -70 + Math.sin(turn * 4) * 22, rArmX: -80 + Math.sin(turn * 4) * 22, lElbow: -30, rElbow: -30, lLegX: -20, rLegX: 14, rKnee: 20 }} f={f} outfit="guard" hood={false} eyes="calm" brows={-1} helmet />
    {clerk && <Bot pos={[2.9, 0, -7.6]} ry={-1.0} p={idleBP(f, { ...STAND, lArmX: -40, lElbow: -80, rArmX: -30, rElbow: -70 })} f={f} outfit="scholar" hood={false} eyes="calm" brows={-1} />}
  </group>;
};

/* ============ the town square (ph7): scaffold top y=1.84, front edge z=-11.4 ============ */
const SQ_TOP = 1.84, SQ_Z = -12.6;
export const SquarePhoto3D: React.FC<{ f: number; stage: "tie" | "strike" | "final" | "raised" | "judge"; dead?: number; blowAt?: number; crowd?: number }> = ({ f, stage, dead = 0, blowAt = 18, crowd = 1 }) => {
  // single blow (final) or repeated blows (strike)
  const cyc = stage === "strike" ? f % 54 : f - blowAt + 18;
  const barA = stage === "strike" || stage === "final" ? (cyc < 18 ? -150 : cyc < 26 ? -150 + ((cyc - 18) / 8) * 150 : Math.max(-150, 0 - Math.max(0, cyc - 26) / 28 * (stage === "final" ? 30 : 150))) : -10;
  const lean = stage === "strike" || stage === "final" ? (cyc >= 18 && cyc < 30 ? 30 : 10) : 10;
  return <group>
    <PhotoLights key1={[-3, 6, -20]} tgt={[0, 1, -10]} col="#ff9a50" i={2.0} amb={0.5} ambCol="#a07a7a" />
    <pointLight position={[3, 5, -6]} intensity={14} distance={16} decay={1.4} color="#ffb070" />
    <Catcher p={[0, 0.002, -9]} s={[16, 12]} o={0.45} />
    <mesh position={[0, SQ_TOP + 0.003, SQ_Z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[4, 2.6]} /><shadowMaterial transparent opacity={0.45} /></mesh>
    {stage !== "raised" && <group position={[0, SQ_TOP + 0.13, SQ_Z + 0.2]} rotation={[-Math.PI / 2, 0, 0.25]} scale={1.25}><Wheel f={f} slump={dead} dead={dead} /></group>}
    {(stage === "strike" || stage === "final") && <Bot pos={[1.25, SQ_TOP, SQ_Z + 0.7]} ry={-0.9} scale={1.15} p={{ ...STAND, lean, lArmX: barA, rArmX: barA, lArmZ: -8, rArmZ: 8, lElbow: -10, rElbow: -10, lLegX: -14, rLegX: 16, rKnee: 18 }} f={f} outfit="exec" hood={false} eyes="calm"
      rHandItem={<group rotation={[Math.PI / 2, 0, 0]}><mesh position={[0, 0.45, 0]}><cylinderGeometry args={[0.035, 0.04, 1.1, 10]} /><meshStandardMaterial color="#3a3634" metalness={0.6} roughness={0.5} /></mesh></group>} />}
    {stage === "tie" && <Bot pos={[1.0, SQ_TOP, SQ_Z + 0.3]} ry={-1.3} scale={1.15} p={{ ...STAND, lean: 40, lArmX: -70, rArmX: -60, lElbow: -30, rElbow: -30, rKnee: 20, lKnee: 20, lLegX: -20, rLegX: -10 }} f={f} outfit="exec" hood={false} eyes="calm" />}
    {stage !== "raised" && <Bot pos={[-1.5, SQ_TOP, SQ_Z - 0.5]} ry={0.5} p={idleBP(f, { ...STAND, lArmX: -40, lElbow: -80, rArmX: -40, rElbow: -80 })} f={f} outfit="scholar" hood={false} eyes="calm" brows={-1} />}
    {stage === "raised" && <group><mesh position={[0, SQ_TOP + 1.8, SQ_Z]} castShadow><cylinderGeometry args={[0.1, 0.12, 3.6, 12]} /><meshStandardMaterial color="#3a2a1a" roughness={0.9} /></mesh>
      <group position={[0, SQ_TOP + 3.65, SQ_Z]} rotation={[-Math.PI / 2 + 0.25, 0, 0]} scale={1.25}><Wheel f={f} slump={1} dead={1} /></group>
      <Crows c={[0, SQ_TOP + 5.2, SQ_Z]} f={f} n={7} r={2.6} s={1.6} /><Crow p={[0.8, SQ_TOP + 3.75, SQ_Z + 0.3]} f={f} perch s={1.6} ry={2} /></group>}
    {crowd > 0 && Array.from({ length: 22 }).map((_, i) => {
      const side = i % 2 ? 1 : -1, j = Math.floor(i / 2), x = side * (2.0 + (j % 4) * 0.85 + (random("cx" + i) - 0.5) * 0.3), z = -9.0 - Math.floor(j / 4) * 1.2 + (random("cz" + i) - 0.5) * 0.5;
      const kinds: Kind[] = ["peasant", "peasant3", "peasant", "guard", "peasant2", "peasant3"]; const k = kinds[Math.floor(random("ck" + i) * kinds.length)];
      const flinch = (stage === "final" && f > blowAt && f < blowAt + 20) ? 1 : 0, cheer = stage === "strike" ? Math.max(0, Math.sin(f / 6 + i)) : 0;
      return <Bot key={i} pos={[x, 0, z]} ry={Math.PI + Math.atan2(x, SQ_Z - z) * 0.6} p={idleBP(f + i * 17, { ...STAND, headX: -14 + flinch * 20, lean: -flinch * 8, rArmX: cheer > 0.6 && i % 3 === 0 ? -160 : 4, rElbow: -10 })} f={f + i * 17} outfit={k} hood={false} eyes="calm" helmet={k === "guard"} scale={0.95 + random("cs" + i) * 0.1} />;
    })}
    {/* a child on a parent's shoulders */}
    {crowd > 0 && <group position={[2.4, 0, -8.6]} rotation={[0, Math.PI, 0]}><Bot pos={[0, 0, 0]} p={idleBP(f, { ...STAND, lArmX: -150, rArmX: -150, lElbow: -40, rElbow: -40 })} f={f} outfit="peasant3" hood={false} eyes="calm" /><Bot pos={[0, 1.55, 0.02]} p={{ ...STAND, lLegX: -70, rLegX: -70, lLegZ: -40, rLegZ: 40, lKnee: 70, rKnee: 70, headX: -10 }} f={f} outfit="peasant2" hood={false} eyes="calm" ground={false} scale={0.6} /></group>}
  </group>;
};

/* ============ Sicily (ph8): bull on the terrace right, tyrant by the pedestal ============ */
const BULL_P: V3 = [2.3, 0, -9.2];
export const SicilyPhoto3D: React.FC<{ f: number; heat: number; door: number; roar?: number; sculptor?: boolean; victim?: "none" | "walk" | "tyrant"; walk?: number }> = ({ f, heat, door, roar = 0, sculptor, victim = "none", walk = 0 }) => {
  const walker = victim === "walk" || victim === "tyrant" ? (victim === "tyrant" ? "tyrant" : "scholar") : null;
  const wp: V3 = [BULL_P[0] - 2.8 + walk * 2.4, 0, BULL_P[2] + 2.2 - walk * 1.6];
  return <group>
    <PhotoLights key1={[8, 4, -30]} tgt={[1, 1, -8]} col="#ffb060" i={2.4} amb={0.55} ambCol="#c08a70" />
    <Catcher p={[1, 0.002, -7.5]} s={[12, 10]} o={0.5} />
    <group position={BULL_P} rotation={[0, -0.35, 0]}>
      <Bull f={f} heat={heat} door={door} roar={roar} />
      {heat > 0 && <><Logs p={[0, 0, 0]} s={1.1} /><Fire p={[0, 0.05, 0]} f={f} s={1.1 * Math.min(1, heat * 1.3)} light={4 * heat} seed="bullp" /></>}
    </group>
    {victim !== "tyrant" && <Bot pos={[-1.35, 0, -5.4]} ry={0.5} p={idleBP(f, { ...STAND, lArmX: -20, lElbow: -90, rArmX: 10, headY: 25 })} f={f} outfit="tyrant" hood={false} eyes="calm" brows={-1} scale={1.05} />}
    {[[-2.4, -6.2], [4.0, -7.0]].map(([x, z], i) => <Bot key={i} pos={[x, 0, z]} ry={i ? -0.7 : 0.4} p={idleBP(f + i * 40, { ...STAND, rArmX: -20, rElbow: -70 })} f={f + i * 40} outfit="hoplite" hood={false} eyes="calm" brows={-1}
      rHandItem={<group rotation={[Math.PI / 2 - 0.2, 0, 0]}><mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.018, 0.018, 2.2, 8]} /><meshStandardMaterial color="#4a3020" /></mesh><mesh position={[0, 1.45, 0]}><coneGeometry args={[0.05, 0.22, 4]} /><meshStandardMaterial color="#b08a50" metalness={0.9} roughness={0.3} /></mesh></group>}
      lHandItem={<mesh position={[0, 0, 0.12]} rotation={[0, 0, 0]}><cylinderGeometry args={[0.32, 0.32, 0.05, 24]} /><meshStandardMaterial color="#a8782e" metalness={0.85} roughness={0.35} /></mesh>} />)}
    {sculptor && !walker && <Bot pos={[BULL_P[0] - 1.9, 0, BULL_P[2] + 1.4]} ry={1.1} p={idleBP(f, { ...STAND, lArmX: -60, lElbow: -30, rArmX: -30, rElbow: -40 })} f={f} outfit="scholar" hood={false} eyes="calm" />}
    {walker && <Bot pos={wp} ry={0.95} p={walk > 0 && walk < 1 ? { ...STAND, lLegX: Math.sin(f / 4) * 20, rLegX: -Math.sin(f / 4) * 20, lKnee: 10, rKnee: 10, lean: -6, lArmX: -60, rArmX: -60, lArmZ: -30, rArmZ: 30 } : STAND} f={f} outfit={walker as Kind} hood={false} eyes="scared" mouth="fear" brows={1} />}
  </group>;
};

/* ============ museum (ph9): maiden on the plinth ============ */
export const MuseumPhoto3D: React.FC<{ f: number; open: number; visitors?: boolean }> = ({ f, open, visitors = true }) => <group>
  <ambientLight intensity={0.2} color="#a08070" />
  <pointLight position={[0.1, 2.4, -4.4]} intensity={4} distance={3} color="#ffe2c0" />
  <spotLight position={[0, 4.2, -5.0]} angle={0.4} penumbra={0.6} intensity={60} distance={10} decay={1.5} color="#ffe2c0" castShadow />
  <pointLight position={[0.8, 2.2, -4.0]} intensity={3} distance={4} color="#ffd8b0" />
  <Catcher p={[0, 0.002, -4.5]} s={[8, 6]} o={0.4} />
  <group position={[0.05, 1.11, -5.6]} scale={0.78}><IronMaiden open={open} f={f} /></group>
  {visitors && ([[-1.6, -3.9, 2.6, "peasant"], [1.5, -3.6, -2.6, "peasant3"]] as [number, number, number, Kind][]).map(([x, z, ry, k], i) => <Bot key={i} pos={[x, 0, z]} ry={ry} p={idleBP(f + i * 30, { ...STAND, lArmX: i ? -50 : 4, lElbow: i ? -60 : -10, headX: -8 })} f={f + i * 30} outfit={k} hood={false} eyes="calm" pupil={0.9} />)}
</group>;

/* ============ Floor -1 corridor (ph12): the jailer walks toward us with a lantern ============ */
export const Lantern: React.FC<{ f: number; on?: number }> = ({ f, on = 1 }) => <group position={[0, -0.18, 0.04]}>
  <mesh position={[0, 0.12, 0]}><torusGeometry args={[0.04, 0.006, 6, 12, Math.PI]} /><meshStandardMaterial color="#2a2624" metalness={0.8} /></mesh>
  <mesh><cylinderGeometry args={[0.055, 0.065, 0.16, 8, 1, true]} /><meshStandardMaterial color="#ffcf80" emissive="#ffa040" emissiveIntensity={2.2 * on} transparent opacity={0.8} side={THREE.DoubleSide} /></mesh>
  <mesh position={[0, 0.09, 0]}><coneGeometry args={[0.07, 0.06, 8]} /><meshStandardMaterial color="#2a2624" metalness={0.8} /></mesh>
  <pointLight intensity={2.6 * on * (1 + Math.sin(f / 3) * 0.06)} distance={5} decay={1.6} color="#ffaa50" castShadow shadow-mapSize-width={512} shadow-mapSize-height={512} />
</group>;
export const Jailer: React.FC<{ f: number; pos: V3; ry: number; walk?: number; look?: number }> = ({ f, pos, ry, walk = 0, look = 0 }) => {
  const ph = f / 5.5, w = walk;
  return <Bot pos={pos} ry={ry} p={{ ...STAND, lLegX: Math.sin(ph) * 24 * w, rLegX: -Math.sin(ph) * 24 * w, lKnee: Math.max(0, -Math.sin(ph)) * 30 * w, rKnee: Math.max(0, Math.sin(ph)) * 30 * w, bob: Math.abs(Math.sin(ph)) * 0.02 * w, lArmX: -40, lElbow: -60, rArmX: -Math.sin(ph) * 16 * w, headY: look, headX: 4 }}
    f={f} outfit="jailer" hood={false} eyes="calm" brows={-1} lHandItem={<Lantern f={f} />} />;
};
/** a rat scurrying along the floor between two points, looping */
export const Scurry: React.FC<{ f: number; a: V3; b: V3; period?: number; seed?: number }> = ({ f, a, b, period = 90, seed = 0 }) => {
  const q = ((f + seed * 37) % period) / period; if (q > 0.55) return null; const t = q / 0.55;
  const p: V3 = [a[0] + (b[0] - a[0]) * t, 0.03, a[2] + (b[2] - a[2]) * t]; const ry = Math.atan2(b[0] - a[0], b[2] - a[2]);
  return <group position={p} rotation={[0, ry, 0]}><group position={[0, Math.abs(Math.sin(f * 1.4)) * 0.01, 0]}><RatBody f={f} s={1.3} /></group></group>;
};
export const CorridorPhoto3D: React.FC<{ f: number; len: number; prisoner?: boolean }> = ({ f, len, prisoner }) => {
  const k = Math.min(1, f / Math.max(1, len)), z = -14 + k * 8.5;
  return <group>
    <PhotoLights key1={[-3, 3, -8]} tgt={[0, 0, -10]} col="#ff9a50" i={0.8} amb={0.35} />
    <Catcher p={[0, 0.002, -10]} s={[4, 20]} o={0.5} />
    <Jailer f={f} pos={[-0.35, 0, z]} ry={0} walk={1} look={Math.sin(f / 40) * 10} />
    <Scurry f={f} a={[1.5, 0, -5]} b={[1.2, 0, -12]} period={120} />
    {prisoner && <Bot pos={[0.45, 0, z - 1.0]} ry={0} p={{ ...STAND, lLegX: Math.sin(f / 5.5 + 1) * 18, rLegX: -Math.sin(f / 5.5 + 1) * 18, lean: 12, headX: 22, lArmX: 30, rArmX: 30 }} f={f} outfit="prisoner" hood={false} eyes="scared" mouth="fear" brows={1} />}
  </group>;
};

/* ============ water-drop cell (ph13): table top 0.85, bucket bottom (-0.03, 1.70, -5.51) ============ */
export const DRIP_HEAD: V3 = [-0.02, 1.07, -5.51];
export const DripPhoto3D: React.FC<{ f: number; hits: number[]; tired?: number; flinch?: number; outfit?: Kind }> = ({ f, hits, tired = 0, flinch = 0, outfit = "prisoner" }) => {
  const shut = hits.some((h) => f >= h && f < h + 8);
  return <group>
    <PhotoLights key1={[1.5, 4, -3]} tgt={[0, 0.85, -5.5]} col="#9ab0e0" i={1.0} amb={0.3} ambCol="#6a7aa0" />
    <pointLight position={[-1.35, 1.25, -5.0]} intensity={1.6} distance={3} color="#ffb060" />
    <Scurry f={f} a={[1.9, 0, -4.2]} b={[2.1, 0, -6.6]} period={150} seed={2} />
    <mesh position={[0, 0.852, -5.51]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[2.8, 1.0]} /><shadowMaterial transparent opacity={0.45} /></mesh>
    <Bot pos={[1.53, 0.945, -5.51]} rot={[-Math.PI / 2, 0, Math.PI / 2]} p={{ ...STAND, lArmZ: -12, rArmZ: 12, headX: -6 + flinch * 10, headY: Math.sin(f / 23) * 6 * (1 - tired) }} f={f} outfit={outfit} hood={false} eyes={shut ? "closed" : tired > 0.75 ? "closed" : "scared"} mouth={tired > 0.5 ? "slack" : "fear"} brows={1} tired={tired} lid={tired * 0.6} pupil={0.8} ground={false} />
    {/* straps over chest, wrists and the head stock */}
    {[0.75, 1.1, 1.5].map((x, i) => <mesh key={i} position={[x - 1.53 + 1.53 - 0.55, 1.0, -5.51]} rotation={[0, 0, 0]}><boxGeometry args={[0.07, 0.03, 0.62]} /><meshStandardMaterial color="#3a2414" roughness={0.6} /></mesh>)}
    <mesh position={[-0.12, 1.02, -5.51]}><boxGeometry args={[0.05, 0.12, 0.5]} /><meshStandardMaterial color="#4a3020" roughness={0.8} /></mesh>
    {hits.map((h, i) => <Drop key={i} f={f} t0={h - 10} slow={10 / 9} form={8} from={[-0.03, 1.69, -5.51]} to={DRIP_HEAD} />)}
  </group>;
};

/* ============ rat cell (ph14): table top 0.85 at (0.08, 0.85, -4.5) ============ */
export const RatPhoto3D: React.FC<{ f: number; potOn: number; heat: number; panic: number; exec?: boolean }> = ({ f, potOn, heat, panic, exec = true }) => {
  const shake = panic * (Math.sin(f * 2.1) * 0.006 + Math.sin(f * 3.3) * 0.004);
  return <group>
    <PhotoLights key1={[2.5, 3, -2.5]} tgt={[0, 0.85, -4.5]} col="#ffa050" i={1.2} amb={0.4} />
    <mesh position={[0.08, 0.852, -4.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[1.7, 0.9]} /><shadowMaterial transparent opacity={0.45} /></mesh>
    <Bot pos={[0.85, 0.945, -4.42]} rot={[-Math.PI / 2, 0, Math.PI / 2]} p={{ ...STAND, lArmZ: -14 + panic * Math.sin(f / 3) * 4, rArmZ: 14 - panic * Math.sin(f / 3.3) * 4, headX: -10 + panic * Math.sin(f / 4) * 6, headY: panic * Math.sin(f / 7) * 18 }} f={f} outfit="prisoner" hood={false} eyes="scared" mouth={panic > 0.4 ? "scream" : "fear"} brows={1} ground={false} />
    {potOn > 0 && <group position={[-0.15, 1.04 + (1 - potOn) * 0.6 + shake, -4.42]}>
      <mesh castShadow><cylinderGeometry args={[0.13, 0.16, 0.2, 24, 1, true]} /><meshStandardMaterial color="#3a3634" metalness={0.65} roughness={0.5} side={THREE.DoubleSide} emissive="#ff3000" emissiveIntensity={heat * 0.08} /></mesh>
      <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.13, 0.13, 0.015, 24]} /><meshStandardMaterial color="#3a3634" metalness={0.65} roughness={0.5} /></mesh>
      {heat > 0 && <group position={[0, 0.11, 0]}>{Array.from({ length: 12 }).map((_, i) => <mesh key={i} position={[(random("co" + i) - 0.5) * 0.18, 0.02 + random("cy" + i) * 0.03, (random("cz" + i) - 0.5) * 0.18]} rotation={[random("cr" + i) * 3, random("cs" + i) * 3, 0]}><dodecahedronGeometry args={[0.028 + random("cq" + i) * 0.018, 0]} /><meshStandardMaterial color="#1a0a04" emissive="#ff4a10" emissiveIntensity={heat * (0.7 + Math.sin(f / 5 + i) * 0.25)} roughness={1} /></mesh>)}
        <pointLight position={[0, 0.15, 0]} intensity={heat * 1.6} distance={3} color="#ff7030" /></group>}
    </group>}
    {exec && <Bot pos={[0.3, 0, -5.4]} ry={0} p={{ ...idleBP(f, STAND), lean: 22, headX: 30, rArmX: -70, rElbow: -30, lArmX: -30, lElbow: -40 }} f={f} outfit="exec" hood={false} eyes="calm" scale={1.05} />}
  </group>;
};

/* ============ inquisition hall (ph15): pulley at (1.48, 8.38, -20) ============ */
export const INQ_P: V3 = [1.48, 8.38, -20];
export const InqPhoto3D: React.FC<{ f: number; lift: number; weight?: number; who?: Kind; monks?: boolean }> = ({ f, lift, weight = 0, who = "prisoner", monks = true }) => <group>
  <PhotoLights key1={[-4, 6, -12]} tgt={[1.4, 1, -20]} col="#ffb070" i={1.4} amb={0.5} />
  <Catcher p={[1.4, 0.002, -20]} s={[6, 6]} o={0.45} />
  <group position={[INQ_P[0], 0, INQ_P[2]]}><StrapRig f={f} lift={lift} weight={weight} who={who} ropeTop={INQ_P[1]} /></group>
  {monks && <Bot pos={[-1.2, 0, -21.5]} ry={0.3} p={idleBP(f, { ...STAND, lArmX: -40, lElbow: -80, rArmX: -40, rElbow: -80 })} f={f} outfit="monk" hood={false} eyes="calm" brows={-1} />}
  {monks && <Bot pos={[3.4, 0, -19.4]} ry={-0.9} p={{ ...STAND, lean: 14, lArmX: -60, rArmX: -60, lElbow: -40, rElbow: -40 }} f={f} outfit="exec" hood={false} eyes="calm" scale={1.08} />}
</group>;

/* the hoisted prisoner + rope, reusable in any set. origin = floor under the pulley */
export const StrapRig: React.FC<{ f: number; lift: number; weight?: number; who?: Kind; ropeTop: number; sway?: number; pain?: number }> = ({ f, lift, weight = 0, who = "prisoner", ropeTop, sway = 1, pain = 1 }) => {
  const k = lift, y = k * 0.62, sw = Math.sin(f / 22) * 0.04 * sway * k, m = Math.min(1, k * 1.6);
  const lean = 8 + 37 * m, arm = 40 + (180 - 45 - 40) * m, D = Math.PI / 180;
  const pose: BP = { ...STAND, bob: 0, lean, headX: 14 - 50 * m, lArmX: arm, rArmX: arm, lArmZ: -6, rArmZ: 6, lElbow: -6, rElbow: -6, lLegX: 6 * m + Math.sin(f / 15) * 4 * pain * k, rLegX: 2 * m - Math.sin(f / 15) * 4 * pain * k, lKnee: 4 + 12 * m, rKnee: 4 + 8 * m, lLegZ: -3, rLegZ: 4 };
  const T = (lean + arm) * D, hipY = 0.86 + y, shY = hipY + 0.43 * Math.cos(lean * D), shZ = 0.43 * Math.sin(lean * D);
  const hy = shY - 0.6 * Math.cos(T), hzl = shZ - 0.6 * Math.sin(T), bz = -hzl * m;
  return <group>
    <Rope a={[sw, ropeTop, 0]} b={[sw, hy, hzl + bz]} />
    <group position={[sw * 0.6, y, bz]} rotation={[0, 0, sw]}>
      <Bot pos={[0, 0, 0]} p={pose} f={f} outfit={who} hood={false} eyes="scared" mouth={k > 0.5 ? "scream" : "fear"} brows={1} pupil={0.8} ground={false} />
      {weight > 0 && <group position={[0, 0.05, 0.05]}><Rope a={[-0.07, 0.1, 0.05]} b={[0, -0.18, 0.05]} r={0.008} /><Rope a={[0.07, 0.1, 0.05]} b={[0, -0.18, 0.05]} r={0.008} /><mesh position={[0, -0.32, 0.05]} castShadow><cylinderGeometry args={[0.16, 0.18, 0.26, 16]} /><meshStandardMaterial color="#3a3634" metalness={0.6} roughness={0.55} /></mesh></group>}
    </group>
  </group>;
};
