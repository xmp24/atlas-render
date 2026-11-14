import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { Box, Cyl } from "../Miya3/Kit3";
import { masonry, Torch, Contact, useEnv, glowTex } from "../Gota/Dungeon4";
import { Bot5 as Bot, Kind } from "./Bot5";
import { STAND, BP, idleBP } from "../Miya8/Bot3";
import { V3, Fire, Logs, Mist, Sky, Crows, Crow, House, Tower, FarCrowd, woodTex, ironTex, tx, cobbleTex, plasterTex, marbleTex, smokeTex } from "./Common";
import { Rope, Candle } from "./SetsIn";

/* ================= Tower of London, night ================= */
export const TowerExt: React.FC<{ f: number }> = ({ f }) => {
  const stone = masonry("wt", [196, 190, 176], 3, 4, 9), stoneS = masonry("wt", [196, 190, 176], 1, 3, 9), wall = masonry("cw", [140, 134, 124], 10, 1.2, 6);
  return <group>
    <Sky kind="night" f={f} stars={1} moon={[-30, 38, -70]} />
    <ambientLight intensity={0.4} color="#6a7aa8" />
    <hemisphereLight args={["#5a6aa0", "#1a1a14", 0.5]} />
    <spotLight position={[8, 3, 22]} target-position={[0, 8, -2]} angle={0.5} penumbra={0.8} intensity={260} distance={60} decay={1.4} color="#ffb070" />
    <directionalLight position={[-30, 40, 40]} intensity={1.4} color="#a8b8e8" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={20} shadow-camera-bottom={-20} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[200, 200]} /><meshStandardMaterial color="#1a1e18" roughness={1} /></mesh>
    {/* the river in front */}
    <mesh position={[0, 0.02, 16]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[200, 14]} /><meshStandardMaterial color="#0a1220" roughness={0.05} metalness={0.8} /></mesh>
    {/* curtain wall */}
    <mesh position={[0, 2.5, 8]} castShadow receiveShadow><boxGeometry args={[34, 5, 1.2]} /><meshStandardMaterial map={wall} bumpMap={wall} bumpScale={2} roughness={0.95} /></mesh>
    {Array.from({ length: 34 }).map((_, i) => <Box key={i} p={[-16.5 + i, 5.25, 8.4]} s={[0.5, 0.5, 0.4]} map={wall} />)}
    {[-12, 0, 12].map((x, i) => <Tower key={i} p={[x, 0, 8]} w={2.6} h={7} tex={stoneS} lit={i === 1 ? 0.6 : 0} />)}
    {/* the White Tower */}
    <group position={[0, 0, -2]}>
      <mesh position={[0, 7, 0]} castShadow receiveShadow><boxGeometry args={[11, 14, 9]} /><meshStandardMaterial map={stone} bumpMap={stone} bumpScale={2} roughness={0.9} /></mesh>
      {Array.from({ length: 22 }).map((_, i) => <Box key={i} p={[-5.25 + i * 0.5, 14.3, 4.4]} s={[0.3, 0.6, 0.3]} map={stoneS} />)}
      {[[-5.5, -4.5], [5.5, -4.5], [-5.5, 4.5], [5.5, 4.5]].map(([x, z], i) => <group key={i} position={[x, 0, z]}>
        <mesh position={[0, 8, 0]} castShadow><boxGeometry args={[1.8, 16, 1.8]} /><meshStandardMaterial map={stoneS} bumpMap={stoneS} bumpScale={2} roughness={0.9} /></mesh>
        <mesh position={[0, 16.3, 0]}><cylinderGeometry args={[0.95, 0.95, 0.6, 20]} /><meshStandardMaterial color="#3a4048" metalness={0.5} roughness={0.5} /></mesh>
        <mesh position={[0, 16.6, 0]} scale={[1, 1.15, 1]}><sphereGeometry args={[0.95, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#3a4048" metalness={0.55} roughness={0.45} /></mesh>
        <Cyl p={[0, 18.1, 0]} r1={0.04} h={0.9} c="#9a8a50" />
      </group>)}
      {Array.from({ length: 3 }).map((_, r) => Array.from({ length: 5 }).map((_, c) => <Box key={r + "_" + c} p={[-3.6 + c * 1.8, 4 + r * 3.4, 4.52]} s={[0.4, 1.1, 0.05]} c={(r + c) % 3 === 0 ? "#ffb060" : "#0a0a10"} e={(r + c) % 3 === 0 ? "#ff9030" : undefined} ei={0.9} />))}
    </group>
    <Mist f={f} n={18} area={[-20, 20, 6, 16]} y={0.4} col="#6a7898" o={0.12} s={4} />
    <Crows c={[0, 17, -2]} f={f} n={5} r={7} s={2} />
    <Crow p={[3, 5.1, 8.3]} f={f} perch s={1.6} ry={0.4} /><Crow p={[-4, 5.1, 8.3]} f={f + 20} perch s={1.6} ry={-0.6} seed={3} />
    <Torch p={[-1.2, 3.0, 8.62]} f={f} seed="tg1" /><Torch p={[1.2, 3.0, 8.62]} f={f} seed="tg2" />
  </group>;
};

/* ================= museum with the iron maiden ================= */
export const IronMaiden: React.FC<{ open: number; f: number }> = ({ open, f }) => {
  const env = useEnv(); const iron = ironTex();
  const pts = useMemo(() => [[0.001, 0], [0.34, 0], [0.4, 0.3], [0.42, 1.1], [0.36, 1.55], [0.22, 1.8], [0.24, 2.0], [0.2, 2.15], [0.001, 2.22]].map(([x, y]) => new THREE.Vector2(x, y)), []);
  const body = useMemo(() => new THREE.LatheGeometry(pts, 32, Math.PI / 2, Math.PI), [pts]);
  const doorR = useMemo(() => new THREE.LatheGeometry(pts, 16, 0, Math.PI / 2), [pts]);
  const doorL = useMemo(() => new THREE.LatheGeometry(pts, 16, Math.PI * 1.5, Math.PI / 2), [pts]);
  const mat = <meshStandardMaterial map={iron} metalness={0.6} roughness={0.5} envMap={env} envMapIntensity={0.4} side={THREE.DoubleSide} />;
  const spikeM = <meshStandardMaterial color="#9a958e" metalness={0.85} roughness={0.3} />;
  const spike = (key: string, a: number, y: number, r: number) => <mesh key={key} position={[Math.sin(a) * r, y, Math.cos(a) * r]} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(-Math.sin(a), 0, -Math.cos(a)))}><coneGeometry args={[0.024, 0.22, 6]} />{spikeM}</mesh>;
  return <group>
    <mesh geometry={body} castShadow>{mat}</mesh>
    {Array.from({ length: 14 }).map((_, i) => spike("b" + i, Math.PI / 2 + 0.25 + random("bs" + i) * (Math.PI - 0.5), 0.45 + random("by" + i) * 1.3, 0.34))}
    {[1, -1].map((sd) => <group key={sd} position={[sd * 0.41, 0, 0]} rotation={[0, -sd * open * 1.75, 0]}><group position={[-sd * 0.41, 0, 0]}>
      <mesh geometry={sd > 0 ? doorR : doorL} castShadow>{mat}</mesh>
      {/* the maiden's face, split across both doors */}
      <mesh position={[sd * 0.07, 1.98, 0.215]} scale={[1, 0.5, 0.3]}><sphereGeometry args={[0.025, 10, 8]} /><meshStandardMaterial color="#0a0806" /></mesh>
      {Array.from({ length: 10 }).map((_, i) => spike("d" + i, sd * (0.2 + random("ds" + sd + i) * 1.1), 0.45 + random("dy" + sd + i) * 1.3, 0.36))}
    </group></group>)}
  </group>;
};
export const MuseumSet: React.FC<{ f: number; open: number; dim?: number; spot?: number }> = ({ f, open, dim = 1, spot = 1 }) => {
  const env = useEnv(); const wallT = tx("mw", () => plasterTex("mus", "#4a1a1e"), 3, 1.5);
  const visitors: [V3, number, Kind][] = [[[-1.6, 0, 2.2], 2.6, "peasant"], [[1.4, 0, 2.6], -2.7, "peasant3"], [[2.4, 0, 1.3], -2.2, "peasant2"]];
  return <group>
    <ambientLight intensity={0.12 * dim} />
    <pointLight position={[0, 2.6, 1.6]} intensity={6 * spot} distance={6} color="#ffe0c0" />
    <pointLight position={[-2.5, 2.4, 2.5]} intensity={3 * dim} distance={8} color="#c8a080" />
    <pointLight position={[2.5, 2.4, 2.5]} intensity={3 * dim} distance={8} color="#c8a080" />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[20, 14]} /><meshStandardMaterial color="#141210" roughness={0.12} metalness={0.4} envMap={env} envMapIntensity={0.3} /></mesh>
    <mesh position={[0, 3, -3]} receiveShadow><planeGeometry args={[20, 6]} /><meshStandardMaterial map={wallT} roughness={0.9} /></mesh>
    {[-1, 1].map((sd) => <mesh key={sd} position={[sd * 7, 3, 2]} rotation={[0, -sd * Math.PI / 2, 0]}><planeGeometry args={[12, 6]} /><meshStandardMaterial map={wallT} roughness={0.9} /></mesh>)}
    <Box p={[0, 0.25, -1.2]} s={[1.6, 0.5, 1.4]} c="#1a1816" rough={0.4} />
    <group position={[0, 0.5, -1.25]}><IronMaiden open={open} f={f} /></group>
    <pointLight position={[0.6, 1.8, 0.2]} intensity={5 * spot} distance={3.5} color="#ffe2c4" />
    <pointLight position={[-0.7, 2.4, -0.3]} intensity={2.5 * spot} distance={3} color="#ffd0a0" />
    {/* rope barrier */}
    {[-1.3, 0, 1.3].map((x) => <group key={x} position={[x, 0, 0.3]}><Cyl p={[0, 0.45, 0]} r1={0.025} h={0.9} c="#b89a40" /><Cyl p={[0, 0.02, 0]} r1={0.12} h={0.04} c="#b89a40" /></group>)}
    {[[-1.3, 0], [0, 1.3]].map(([a, b], i) => <Rope key={i} a={[a, 0.85, 0.3]} b={[b, 0.85, 0.3]} r={0.018} sag={0.12} />)}
    {/* plaque */}
    <group position={[1.2, 0.9, -0.4]} rotation={[-0.5, 0, 0]}><Box p={[0, 0, 0]} s={[0.5, 0.32, 0.03]} c="#c8a850" metal={0.8} rough={0.3} /></group>
    {/* other exhibits: suit of armour silhouette, display case */}
    <group position={[-3.6, 0, -2.2]}><Box p={[0, 0.3, 0]} s={[0.8, 0.6, 0.8]} c="#1a1816" /><Bot pos={[0, 0.6, 0]} p={STAND} f={0} outfit="guard" hood={false} helmet eyes="closed" ground={false} /></group>
    <group position={[3.6, 0, -2.2]}><Box p={[0, 0.5, 0]} s={[1.2, 1.0, 0.7]} c="#1a1816" /><Box p={[0, 1.35, 0]} s={[1.2, 0.7, 0.7]} c="#8aa0b0" op={0.18} rough={0.05} metal={0.2} />
      {[-0.3, 0.05, 0.35].map((x, i) => <mesh key={i} position={[x, 1.1, 0]} rotation={[0, 0, 0.3 * i]}><torusGeometry args={[0.08, 0.015, 8, 16]} /><meshStandardMaterial map={ironTex()} metalness={0.7} /></mesh>)}</group>
    {/* spotlights */}
    <spotLight position={[0, 5.5, 1.2]} target-position={[0, 1.3, -1.25]} angle={0.32} penumbra={0.5} intensity={60 * spot} distance={12} decay={1.6} color="#ffe8c8" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
    <spotLight position={[-3.6, 5, 0.5]} target-position={[-3.6, 1.2, -2.2]} angle={0.3} penumbra={0.6} intensity={45 * dim} distance={9} decay={1.6} color="#ffe0c0" />
    <pointLight position={[-3.4, 2.2, -1.2]} intensity={3 * dim} distance={3.5} color="#ffd8b0" /><pointLight position={[3.4, 2.2, -1.2]} intensity={3 * dim} distance={3.5} color="#ffd8b0" />
    <spotLight position={[3.6, 5, 0.5]} target-position={[3.6, 1.2, -2.2]} angle={0.3} penumbra={0.6} intensity={45 * dim} distance={9} decay={1.6} color="#ffe0c0" />
    {visitors.map(([p, ry, k], i) => <Bot key={i} pos={p} ry={ry} p={idleBP(f + i * 30, { ...STAND, lArmX: i === 1 ? -50 : 4, lElbow: i === 1 ? -60 : -10, headX: -6 })} f={f + i * 30} outfit={k} hood={false} eyes="scared" pupil={0.9} scale={0.98} />)}
    <Mist f={f} n={8} area={[-5, 5, -2, 3]} y={0.2} col="#5a4a48" o={0.05} />
  </group>;
};

/* ================= town square with the breaking wheel ================= */
export const Wheel: React.FC<{ spin?: number; tied?: boolean; f: number; slump?: number }> = ({ spin = 0, tied = true, f, slump = 0 }) => {
  const wood = tx("wh", () => woodTex("wh", [96, 66, 40]), 1, 1);
  return <group rotation={[0, 0, spin]}>
    <mesh><torusGeometry args={[0.85, 0.06, 10, 40]} /><meshStandardMaterial map={wood} roughness={0.9} /></mesh>
    <mesh><torusGeometry args={[0.85, 0.065, 4, 40]} /><meshStandardMaterial color="#2a2624" metalness={0.6} roughness={0.5} wireframe={false} transparent opacity={0.0} /></mesh>
    {Array.from({ length: 10 }).map((_, i) => <group key={i} rotation={[0, 0, i * Math.PI / 5]}><Box p={[0, 0.42, 0]} s={[0.05, 0.8, 0.04]} map={wood} /></group>)}
    <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.13, 0.13, 0.2, 16]} /><meshStandardMaterial map={wood} /></mesh>
    {tied && <Bot pos={[0, -0.7, 0.13]} p={{ ...STAND, lArmZ: -78, rArmZ: 78, lArmX: 0, rArmX: 0, lElbow: -4 - slump * 10, rElbow: -4 - slump * 10, lLegZ: -22, rLegZ: 22, lKnee: 4, rKnee: 4, headX: 10 + slump * 30, headY: Math.sin(f / 40) * 6 * (1 - slump), lean: 0 }} f={f} outfit="prisoner" hood={false} eyes={slump > 0.7 ? "closed" : "scared"} mouth={slump > 0.7 ? "slack" : "fear"} brows={1} ground={false} scale={0.82} />}
  </group>;
};
export const SquareSet: React.FC<{ f: number; stage: "tie" | "strike" | "raised" | "judge"; hit?: number; crowd?: number; sky?: "dusk" | "storm" | "sunset" }> = ({ f, stage, hit = 0, crowd = 1, sky = "dusk" }) => {
  const env = useEnv(); const cob = tx("cob", cobbleTex, 14, 14), wood = tx("sc", () => woodTex("sc", [80, 56, 34]), 3, 1), stone = masonry("ch", [150, 136, 116], 2, 6, 8);
  const houses: [V3, number, number, number, number][] = [[[-7, 0, -9], 0, 3.2, 3, 5], [[-3.4, 0, -9.4], 0, 3.4, 3, 4.6], [[0.4, 0, -9.6], 0, 3.6, 3, 5.4], [[4.2, 0, -9.2], 0, 3.2, 3, 4.4], [[7.6, 0, -8.6], -0.2, 3.4, 3, 5], [[-10.5, 0, -5], 1.2, 3.4, 3, 5], [[10.8, 0, -4.4], -1.25, 3.4, 3, 4.8], [[-11, 0, 0.5], 1.5, 3.2, 3, 4.4], [[11.2, 0, 1], -1.5, 3.4, 3, 5]];
  const blow = stage === "strike" ? Math.max(0, Math.sin(Math.min(1, ((f % 54) / 18)) * Math.PI)) : 0;
  const barA = stage === "strike" ? (f % 54 < 18 ? -150 + (f % 54) / 18 * 0 : f % 54 < 26 ? -150 + ((f % 54 - 18) / 8) * 150 : 0 - Math.min(1, (f % 54 - 26) / 28) * 150) : -10;
  return <group>
    <Sky kind={sky} f={f} sun={sky === "storm" ? undefined : [-20, 6, -80]} sunCol="#ff9a50" clouds={10} cloudCol={sky === "storm" ? "#3a3e48" : "#8a5a6a"} />
    <ambientLight intensity={0.25} color="#8a7a9a" />
    <hemisphereLight args={["#e8a080", "#2a1e18", 0.4]} />
    <directionalLight position={[-14, 10, -18]} intensity={1.8} color="#ffb070" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-16} shadow-camera-right={16} shadow-camera-top={16} shadow-camera-bottom={-16} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[60, 60]} /><meshStandardMaterial map={cob} bumpMap={cob} bumpScale={2} roughness={0.8} /></mesh>
    {houses.map(([p, ry, w, d, h], i) => <House key={i} p={p} ry={ry} w={w} d={d} h={h} seed={"sq" + i} lit={1} />)}
    {/* church tower */}
    <Tower p={[-2, 0, -14]} w={3.2} h={12} tex={stone} cap="spire" capCol="#2e3236" />
    <pointLight position={[2.5, 4.5, 4]} intensity={9} distance={14} decay={1.5} color="#ffb880" />
    <pointLight position={[-3, 3.5, 2]} intensity={4} distance={10} decay={1.5} color="#9aa8d8" />
    {/* scaffold */}
    <group position={[0, 0, 0]}>
      <Box p={[0, 0.9, 0]} s={[4.2, 0.14, 3.2]} map={wood} />
      {[[-2, -1.5], [2, -1.5], [-2, 1.5], [2, 1.5], [0, -1.5], [0, 1.5]].map(([x, z], i) => <Box key={i} p={[x, 0.42, z]} s={[0.16, 0.84, 0.16]} map={wood} />)}
      {[0, 1, 2, 3].map((i) => <Box key={"st" + i} p={[2.35 + i * 0.28, 0.75 - i * 0.22, 0.6]} s={[0.28, 0.08, 1.0]} map={wood} />)}
      {stage !== "raised" && <group position={[0, 1.07, 0]} rotation={[-Math.PI / 2, 0, 0]}><Wheel f={f} slump={stage === "strike" ? 0.2 : 0} /></group>}
      {stage === "strike" && <Bot pos={[0.7, 0.97, 0.95]} ry={-0.6} p={{ ...STAND, lean: 10 + blow * 25, lArmX: barA, rArmX: barA, lArmZ: -8, rArmZ: 8, lElbow: -10, rElbow: -10, lLegX: -14, rLegX: 16, rKnee: 18 }} f={f} outfit="exec" hood={false} eyes="angry" scale={1.1}
        rHandItem={<group rotation={[Math.PI / 2, 0, 0]}><mesh position={[0, 0.45, 0]}><cylinderGeometry args={[0.035, 0.04, 1.1, 10]} /><meshStandardMaterial map={ironTex()} metalness={0.6} roughness={0.5} /></mesh></group>} />}
      {stage === "tie" && <Bot pos={[0.9, 0.97, 0.5]} ry={-1.2} p={{ ...STAND, lean: 40, lArmX: -70, rArmX: -60, lElbow: -30, rElbow: -30, rKnee: 20, lKnee: 20, lLegX: -20, rLegX: -10 }} f={f} outfit="exec" hood={false} eyes="angry" scale={1.1} />}
      {stage !== "raised" && <Bot pos={[-1.5, 0.97, -1.0]} ry={0.5} p={idleBP(f, { ...STAND, lArmX: -40, lElbow: -80, rArmX: -40, rElbow: -80 })} f={f} outfit="scholar" hood={false} eyes="angry" />}
    </group>
    {stage === "raised" && <group position={[0, 0, 0]}><Cyl p={[0, 2.5, 0]} r1={0.1} h={5} c="#3a2a1a" /><group position={[0, 5.05, 0]} rotation={[-Math.PI / 2 + 0.15, 0, 0]}><Wheel f={f} slump={1} /></group>
      <Crows c={[0, 6.5, 0]} f={f} n={7} r={2.4} s={1.4} />
      <Crow p={[0.6, 5.2, 0.4]} f={f} perch s={1.4} ry={2} /></group>}
    {/* crowd: close ring of stickmen + far rows */}
    {crowd > 0 && <>
      {Array.from({ length: 16 }).map((_, i) => { const a = Math.PI * 0.15 + (i / 15) * Math.PI * 0.7, r = 4.2 + random("cr" + i) * 1.6, x = Math.cos(a) * r * 1.3, z = Math.sin(a) * r; const kinds: Kind[] = ["peasant", "peasant2", "peasant3", "guard", "peasant2"]; const k = kinds[Math.floor(random("ck" + i) * kinds.length)];
        const cheer = stage === "strike" ? Math.max(0, Math.sin(f / 6 + i)) : 0;
        return <Bot key={i} pos={[x, 0, z]} ry={Math.atan2(-x, -z)} p={idleBP(f + i * 17, { ...STAND, headX: -10, rArmX: cheer > 0.5 && i % 3 === 0 ? -160 : 4, rElbow: cheer > 0.5 && i % 3 === 0 ? -20 : -10 })} f={f + i * 17} outfit={k} hood={false} eyes={i % 4 === 0 ? "scared" : "angry"} helmet={k === "guard"} scale={0.92 + random("cs" + i) * 0.14} />; })}
      <FarCrowd f={f} n={70} area={[-9, 9, 6.5, 10]} face={[0, 1, 0]} cheer={stage === "strike" ? 1 : 0} />
      <FarCrowd f={f} n={40} area={[-9, -5.5, -6, 5]} face={[0, 1, 0]} seed="fl" />
      <FarCrowd f={f} n={40} area={[5.5, 9, -6, 5]} face={[0, 1, 0]} seed="fr" />
    </>}
    {/* banners and a well */}
    {[-6, 6].map((x, i) => <group key={i} position={[x, 0, -6]}><Cyl p={[0, 2, 0]} r1={0.05} h={4} c="#2a1a10" /><mesh position={[0.45, 3.4, 0]} rotation={[0, Math.sin(f / 30 + i) * 0.15, 0]}><planeGeometry args={[0.8, 1.2]} /><meshStandardMaterial color="#7a1418" side={THREE.DoubleSide} roughness={0.9} /></mesh></group>)}
    <Mist f={f} n={10} area={[-12, 12, -10, 10]} y={0.3} col="#8a6a6a" o={0.05} s={4} />
  </group>;
};

/* ================= Sicily: temple court with the brazen bull ================= */
export const Bull: React.FC<{ f: number; heat: number; door: number; roar?: number }> = ({ f, heat, door, roar = 0 }) => {
  const env = useEnv();
  const br = <meshPhysicalMaterial color="#5e3e1e" metalness={0.9} roughness={0.42} envMap={env} envMapIntensity={0.9} emissive="#ff3008" emissiveIntensity={heat * 0.035} clearcoat={0.3} />;
  const horn = <meshPhysicalMaterial color="#c8b48a" metalness={0.6} roughness={0.35} envMap={env} />;
  return <group>
    {/* barrel body, deep chest and shoulder hump */}
    <mesh position={[-0.05, 1.32, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.82]} castShadow><capsuleGeometry args={[0.52, 1.25, 12, 24]} />{br}</mesh>
    <mesh position={[0.55, 1.42, 0]} scale={[0.85, 1.0, 0.78]} castShadow><sphereGeometry args={[0.62, 24, 18]} />{br}</mesh>
    <mesh position={[0.45, 1.86, 0]} scale={[0.75, 0.42, 0.55]} castShadow><sphereGeometry args={[0.5, 20, 14]} />{br}</mesh>
    <mesh position={[0.55, 1.0, 0]} scale={[0.6, 0.5, 0.5]}><sphereGeometry args={[0.45, 16, 12]} />{br}</mesh>
    {/* neck going forward-down, head low and long like a charging bull */}
    <mesh position={[1.1, 1.5, 0]} rotation={[0, 0, -1.1]} scale={[1, 1, 0.9]} castShadow><capsuleGeometry args={[0.34, 0.35, 8, 16]} />{br}</mesh>
    <group position={[1.42, 1.32, 0]} rotation={[0, 0, -0.55]}>
      <mesh rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.92]} castShadow><capsuleGeometry args={[0.2, 0.42, 10, 18]} />{br}</mesh>
      <mesh position={[0.36, -0.02, 0]} scale={[0.75, 0.82, 1.1]}><sphereGeometry args={[0.2, 20, 14]} />{br}</mesh>
      {[-1, 1].map((sd) => <group key={sd}>
        <mesh position={[0.5, 0.02, sd * 0.09]}><sphereGeometry args={[0.035, 10, 8]} /><meshStandardMaterial color="#120804" emissive="#ff4010" emissiveIntensity={heat * 0.9} /></mesh>
        <mesh position={[0.02, 0.14, sd * 0.17]}><sphereGeometry args={[0.035, 10, 8]} /><meshStandardMaterial color="#120a04" /></mesh>
        <mesh position={[0.02, 0.12, sd * 0.172]} scale={[1.3, 0.25, 0.4]}><sphereGeometry args={[0.04, 10, 8]} />{br}</mesh>
        {/* horns sweep out then forward and up */}
        <group position={[-0.12, 0.2, sd * 0.16]} rotation={[sd * 0.25, 0, 0]}>
          <mesh position={[0, 0, sd * 0.12]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.025, 0.05, 0.26, 10]} />{horn}</mesh>
          <mesh position={[0.06, 0.1, sd * 0.25]} rotation={[sd * -0.6, 0, -0.5]}><coneGeometry args={[0.028, 0.26, 10]} />{horn}</mesh>
        </group>
        <mesh position={[-0.18, 0.08, sd * 0.22]} rotation={[sd * 0.6, 0, 0]} scale={[0.5, 0.18, 0.9]}><sphereGeometry args={[0.12, 10, 8]} />{br}</mesh>
      </group>)}
      {heat > 0.3 && Array.from({ length: 8 }).map((_, i) => { const ph = (f / 26 + i / 8) % 1; return <sprite key={i} position={[0.58 + ph * 0.8, ph * 0.5, Math.sin(i * 2) * 0.1 * ph]} scale={[0.12 + ph * 0.6, 0.12 + ph * 0.6, 1]}><spriteMaterial map={smokeTex()} color="#c8c0b8" transparent opacity={Math.sin(Math.PI * ph) * 0.35 * (0.4 + roar)} depthWrite={false} /></sprite>; })}
    </group>
    {/* legs with knees + hooves */}
    {[[-0.7, -0.27], [-0.7, 0.27], [0.62, -0.27], [0.62, 0.27]].map(([x, z], i) => <group key={i} position={[x, 0, z]}>
      <mesh position={[0, 0.78, 0]} castShadow><cylinderGeometry args={[0.15, 0.11, 0.5, 14]} />{br}</mesh>
      <mesh position={[0, 0.52, 0]}><sphereGeometry args={[0.1, 12, 10]} />{br}</mesh>
      <mesh position={[0, 0.3, 0]} castShadow><cylinderGeometry args={[0.09, 0.08, 0.45, 12]} />{br}</mesh>
      <mesh position={[0.02, 0.05, 0]}><cylinderGeometry args={[0.09, 0.11, 0.1, 12]} /><meshStandardMaterial color="#2a1a0c" metalness={0.8} roughness={0.4} /></mesh></group>)}
    <group position={[-0.95, 1.55, 0]} rotation={[0, 0, 0.35 + Math.sin(f / 30) * 0.05]}><mesh position={[-0.05, -0.4, 0]}><cylinderGeometry args={[0.022, 0.035, 0.85, 8]} />{br}</mesh><mesh position={[-0.05, -0.86, 0]} scale={[0.6, 1.2, 0.6]}><sphereGeometry args={[0.06, 8, 6]} />{br}</mesh></group>
    {/* side door */}
    <group position={[-0.07, 1.32, 0.44]} rotation={[0, -door * 1.6, 0]}><group position={[0.27, 0, 0.0]}><mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.27, 0.27, 0.05, 24]} />{br}</mesh><mesh position={[0.15, 0, 0.03]}><sphereGeometry args={[0.03, 8, 6]} /><meshStandardMaterial color="#3a2010" metalness={0.9} /></mesh></group></group>
    <mesh position={[0.2, 1.32, 0.43]}><torusGeometry args={[0.28, 0.03, 8, 24]} /><meshStandardMaterial color="#3a2410" metalness={0.9} roughness={0.35} /></mesh>
    {door > 0.1 && <mesh position={[0.2, 1.32, 0.42]}><circleGeometry args={[0.27, 24]} /><meshBasicMaterial color="#000" /></mesh>}
    {heat > 0 && <mesh position={[0, 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.7, 24]} /><meshBasicMaterial color="#ff5010" transparent opacity={heat * 0.15} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} /></mesh>}
  </group>;
};
export const SicilySet: React.FC<{ f: number; heat: number; door: number; roar?: number; tyrant?: boolean; victim?: "none" | "walk" | "tyrant"; sculptor?: boolean; walk?: number }> = ({ f, heat, door, roar = 0, tyrant = true, victim = "none", sculptor = false, walk = 0 }) => {
  const env = useEnv(); const mar = tx("mar", () => marbleTex("tp", "#d8c8a8"), 1, 1), flag = tx("flg", () => marbleTex("fl", "#c8b48c"), 8, 8), col = tx("col", () => marbleTex("tc", "#dccca8"), 1, 1);
  return <group>
    <Sky kind="sunset" f={f} sun={[10, 4, -80]} sunCol="#ffcc70" clouds={8} cloudCol="#c87a6a" />
    <ambientLight intensity={0.3} color="#a08aa0" />
    <hemisphereLight args={["#ffb88a", "#3a2a1a", 0.5]} />
    <directionalLight position={[8, 8, -18]} intensity={2.6} color="#ffb070" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[40, 40]} /><meshStandardMaterial map={flag} roughness={0.6} /></mesh>
    {/* sea in the distance */}
    <mesh position={[0, -0.5, -45]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[200, 60]} /><meshStandardMaterial color="#3a4a6a" roughness={0.1} metalness={0.7} /></mesh>
    {/* temple colonnade behind */}
    <group position={[0, 0, -6]}>
      {[0, 1, 2].map((i) => <Box key={i} p={[0, 0.15 + i * 0.3, -i * 0.3]} s={[14 - i * 0.6, 0.3, 4 - i * 0.6]} map={mar} />)}
      {Array.from({ length: 8 }).map((_, i) => <group key={i} position={[-5.6 + i * 1.6, 0.9, -0.6]}><mesh position={[0, 2.3, 0]} castShadow><cylinderGeometry args={[0.3, 0.36, 4.6, 20]} /><meshStandardMaterial map={col} roughness={0.7} /></mesh><Box p={[0, 4.68, 0]} s={[0.84, 0.16, 0.84]} map={mar} /></group>)}
      <Box p={[0, 5.95, -0.6]} s={[13, 0.7, 1.4]} map={mar} />
      <mesh position={[0, 6.3, -0.6]} rotation={[0, 0, 0]} scale={[6.6, 1.1, 0.7]}><cylinderGeometry args={[0, 1, 1, 3, 1]} /><meshStandardMaterial map={mar} /></mesh>
    </group>
    {/* cypresses */}
    {[-9.5, -8.2, 8.6, 9.8].map((x, i) => <group key={i} position={[x, 0, -4 + (i % 2) * 1.2]}><Cyl p={[0, 0.5, 0]} r1={0.1} h={1} c="#3a2a1a" /><mesh position={[0, 3.2, 0]} castShadow><coneGeometry args={[0.6, 5, 14]} /><meshStandardMaterial color="#2a3a22" roughness={0.9} /></mesh></group>)}
    {/* bull on a stone base with a fire under it */}
    <group position={[0, 0, 0]}>
      <Box p={[0, 0.12, 0]} s={[3.6, 0.24, 2.2]} map={mar} />
      <group position={[0, 0.24, 0]}><Bull f={f} heat={heat} door={door} roar={roar} /></group>
      {heat > 0 && <><Logs p={[0, 0.24, 0]} s={1.1} /><Fire p={[0, 0.3, 0]} f={f} s={1.15 * Math.min(1, heat * 1.3)} light={4 * heat} seed="bull" /></>}
    </group>
    {/* the tyrant on a throne, guards with spears */}
    {tyrant && <group position={[4.2, 0, 1.2]} rotation={[0, -1.2, 0]}>
      <Box p={[0, 0.25, 0]} s={[1.4, 0.5, 1.2]} map={mar} /><Box p={[0, 1.0, -0.45]} s={[1.0, 1.4, 0.15]} map={mar} /><Box p={[0, 0.62, 0]} s={[1.0, 0.22, 0.8]} c="#5a1a5a" rough={0.8} />
      {victim !== "tyrant" && <Bot pos={[0, 0.3, 0]} p={{ ...idleBP(f, { ...STAND, bob: -0.36, lean: -6, lLegX: -88, lKnee: 86, rLegX: -86, rKnee: 84, lArmX: -30, rArmX: -40, lElbow: -40, rElbow: -30 }), headX: 0 }} f={f} outfit="tyrant" hood={false} eyes="angry" ground={false} />}
    </group>}
    {[[-2.8, 1.6], [2.8, -1.4]].map(([x, z], i) => <Bot key={i} pos={[x, 0, z]} ry={i ? -0.9 : 0.9} p={idleBP(f + i * 40, { ...STAND, rArmX: -20, rElbow: -70 })} f={f + i * 40} outfit="guard" hood={false} helmet eyes="angry"
      rHandItem={<group rotation={[Math.PI / 2 - 0.2, 0, 0]}><mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.018, 0.018, 2.2, 8]} /><meshStandardMaterial color="#4a3020" /></mesh><mesh position={[0, 1.45, 0]}><coneGeometry args={[0.05, 0.22, 4]} /><meshStandardMaterial color="#b08a50" metalness={0.9} roughness={0.3} /></mesh></group>} />)}
    {sculptor && <Bot pos={[-1.6 + walk * 0.9, 0, 1.2 - walk * 0.4]} ry={1.6 - walk * 0.6} p={walk > 0 && walk < 1 ? { ...STAND, lLegX: Math.sin(f / 4) * 20, rLegX: -Math.sin(f / 4) * 20, lKnee: 10, rKnee: 10, lean: -6, lArmX: -60, rArmX: -60, lArmZ: -30, rArmZ: 30 } : idleBP(f, { ...STAND, lArmX: -40, lElbow: -60, rArmX: -30, rElbow: -40 })} f={f} outfit="scholar" hood={false} eyes={walk > 0 ? "scared" : "angry"} mouth={walk > 0 ? "fear" : "none"} brows={walk > 0 ? 1 : 0} />}
    {victim === "tyrant" && <Bot pos={[-1.6 + walk * 0.9, 0, 1.2 - walk * 0.4]} ry={1.6 - walk * 0.6} p={{ ...STAND, lLegX: Math.sin(f / 4) * 20, rLegX: -Math.sin(f / 4) * 20, lKnee: 10, rKnee: 10, lean: -6, lArmX: -60, rArmX: -60, lArmZ: -30, rArmZ: 30 }} f={f} outfit="tyrant" hood={false} eyes="scared" mouth="fear" brows={1} />}
    <Mist f={f} n={8} area={[-8, 8, -3, 4]} y={0.3} col="#c8a080" o={0.05} s={3} />
  </group>;
};

/* ================= Persian marsh: scaphism ================= */
export const Boats: React.FC<{ f: number; honey: number; flies: number; day: number }> = ({ f, honey, flies, day }) => {
  const wood = tx("bt", () => woodTex("bt", [92, 64, 38]), 2, 1);
  const hull = useMemo(() => { const g = new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2); g.scale(1.35, 0.3, 0.42); return g; }, []);
  const bob = Math.sin(f / 40) * 0.012, roll = Math.sin(f / 55) * 0.015;
  return <group position={[0, bob, 0]} rotation={[roll, 0, 0]}>
    <mesh geometry={hull} position={[0, 0.06, 0]} castShadow receiveShadow><meshStandardMaterial map={wood} roughness={0.9} side={THREE.DoubleSide} /></mesh>
    <mesh geometry={hull} position={[0, 0.1, 0]} rotation={[Math.PI, 0, 0]} castShadow receiveShadow><meshStandardMaterial map={wood} roughness={0.9} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.25, 0.42, 1]}><torusGeometry args={[1, 0.02, 6, 40]} /><meshStandardMaterial color="#3a2414" roughness={0.9} /></mesh>
    {/* head sticking out, face up */}
    <group position={[0, 0.1, 0]} rotation={[0, Math.PI, 0]}>
      <Bot pos={[0.15, 0, 0]} rot={[-Math.PI / 2, 0, Math.PI / 2]} p={{ ...STAND, headX: -4, headY: Math.sin(f / 30) * 10 * (1 - day), lArmZ: -18, rArmZ: 18 }} f={f} outfit="prisoner" hood={false} eyes={day > 0.85 ? "closed" : "scared"} mouth={day > 0.6 ? "slack" : "fear"} brows={1} tired={day} lid={day * 0.7} pupil={0.8} ground={false} />
    </group>
    {honey > 0 && Array.from({ length: 14 }).map((_, i) => { const a = random("ha" + i) * Math.PI * 2, b = random("hb" + i) * 1.2; return <mesh key={"h" + i} position={[1.44 + Math.cos(a) * Math.sin(b) * 0.2, 0.12 + Math.cos(b) * 0.2, Math.sin(a) * Math.sin(b) * 0.2]} scale={[1, 1.6, 1]}><sphereGeometry args={[0.018 * honey, 10, 8]} /><meshPhysicalMaterial color="#e09a20" roughness={0.05} clearcoat={1} emissive="#5a3000" emissiveIntensity={0.3} /></mesh>; })}
    {/* hands and feet out of the sides */}
    {[[-1.0, 0.36], [-1.0, -0.36], [0.6, 0.36], [0.6, -0.36]].map(([x, z], i) => <mesh key={i} position={[x, 0.09, z * 1.12]}><sphereGeometry args={[0.045, 12, 10]} /><meshStandardMaterial color="#d9c3a6" roughness={0.6} /></mesh>)}
    {/* flies */}
    {flies > 0 && Array.from({ length: Math.round(40 * flies) }).map((_, i) => { const c: V3 = random("fc" + i) > 0.4 ? [1.45, 0.2, 0] : [-0.2 + random("fx" + i) * 1.2, 0.2, 0]; const a = f / (5 + random("fv" + i) * 6) + i, r = 0.12 + random("fr" + i) * 0.35;
      return <mesh key={i} position={[c[0] + Math.cos(a) * r, c[1] + 0.05 + Math.sin(a * 1.7) * 0.12 + random("fy" + i) * 0.2, c[2] + Math.sin(a) * r]}><sphereGeometry args={[0.012, 6, 4]} /><meshBasicMaterial color="#0a0a08" /></mesh>; })}
  </group>;
};
export const MarshSet: React.FC<{ f: number; honey: number; flies: number; day: number; sunK?: number; guards?: boolean; night?: boolean }> = ({ f, honey, flies, day, sunK = 1, guards = false, night = false }) => {
  const env = useEnv();
  return <group>
    <Sky kind={night ? "night" : "haze"} f={f} stars={night ? 0.8 : 0} sun={night ? undefined : [-14, 26, -70]} sunCol="#fff0b0" moon={night ? [-20, 30, -70] : undefined} clouds={6} cloudCol={night ? "#2a3048" : "#c8c0a0"} />
    <ambientLight intensity={night ? 0.35 : 0.35} color={night ? "#5a6a9a" : "#d8d0a8"} />
    <hemisphereLight args={[night ? "#3a4a7a" : "#fff0c0", "#2a2a18", night ? 0.25 : 0.6]} />
    <directionalLight position={[-14, 26, -20]} intensity={night ? 1.6 : 3.2 * sunK} color={night ? "#9aa8d8" : "#fff2c8"} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} />
    {/* stagnant water + muddy banks */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow><planeGeometry args={[80, 80]} /><meshStandardMaterial color="#2a2e1a" roughness={0.98} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0, 0]}><circleGeometry args={[9, 48]} /><meshPhysicalMaterial color="#2a3a22" roughness={0.12} metalness={0.3} envMap={env} envMapIntensity={0.5} transparent opacity={0.92} /></mesh>
    {Array.from({ length: 30 }).map((_, i) => { const a = random("la" + i) * Math.PI * 2, r = 2 + random("lr" + i) * 6; return <mesh key={i} position={[Math.cos(a) * r, 0.005, Math.sin(a) * r]} rotation={[-Math.PI / 2, 0, random("lt" + i) * 6]}><circleGeometry args={[0.15 + random("ls" + i) * 0.4, 12]} /><meshStandardMaterial color="#4a5a2a" roughness={0.8} transparent opacity={0.7} /></mesh>; })}
    {/* reeds around the edge */}
    {Array.from({ length: 160 }).map((_, i) => { const a = random("ra" + i) * Math.PI * 2, r = 8.2 + random("rr" + i) * 3, h = 0.8 + random("rh" + i) * 1.4; return <mesh key={i} position={[Math.cos(a) * r, h / 2, Math.sin(a) * r]} rotation={[Math.sin(f / 40 + i) * 0.06, 0, Math.cos(f / 47 + i) * 0.06]}><coneGeometry args={[0.025, h, 4]} /><meshStandardMaterial color={random("rc" + i) > 0.5 ? "#6a6a3a" : "#4a5428"} roughness={0.9} /></mesh>; })}
    {/* dead trees */}
    {[[-6, -7], [7, -6.5], [-9, 2]].map(([x, z], i) => <group key={i} position={[x, 0, z]}><Cyl p={[0, 1.6, 0]} r1={0.08} r2={0.16} h={3.2} c="#2a2218" />{[0, 1, 2].map((j) => <mesh key={j} position={[0, 2.2 + j * 0.4, 0]} rotation={[0, j * 2.1, 0.9]}><cylinderGeometry args={[0.025, 0.05, 1.3, 6]} /><meshStandardMaterial color="#2a2218" /></mesh>)}</group>)}
    <group position={[0, 0, 0]} rotation={[0, 0.3, 0]}><Boats f={f} honey={honey} flies={flies} day={day} /></group>
    {/* ripples */}
    {[0, 1, 2].map((k) => { const s = ((f / 90 + k / 3) % 1); return <mesh key={k} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.3, 0.55, 1]}><ringGeometry args={[1.4 + s * 1.5, 1.43 + s * 1.5, 48]} /><meshBasicMaterial color="#9aa880" transparent opacity={(1 - s) * 0.15} depthWrite={false} /></mesh>; })}
    {guards && [[-3.2, 3], [3.4, 2.6]].map(([x, z], i) => <Bot key={i} pos={[x, 0, z]} ry={Math.atan2(-x, -z)} p={idleBP(f + i * 30, { ...STAND, rArmX: -20, rElbow: -70 })} f={f + i * 30} outfit="guard" hood={false} helmet eyes="angry"
      rHandItem={<group rotation={[Math.PI / 2 - 0.2, 0, 0]}><mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.018, 0.018, 2.2, 8]} /><meshStandardMaterial color="#4a3020" /></mesh><mesh position={[0, 1.45, 0]}><coneGeometry args={[0.05, 0.22, 4]} /><meshStandardMaterial color="#b08a50" metalness={0.9} roughness={0.3} /></mesh></group>} />)}
    {/* heat haze dust */}
    <Mist f={f} n={8} area={[-10, 10, -8, -2]} y={0.4} col={night ? "#5a6a8a" : "#e8e0b0"} o={0.04} s={4} />
  </group>;
};
