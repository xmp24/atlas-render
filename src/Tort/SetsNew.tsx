import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { Box, Cyl } from "../Miya3/Kit3";
import { useEnv } from "../Gota/Dungeon4";
import { Bot5 as Bot, Kind } from "./Bot5";
import { STAND, idleBP } from "../Miya8/Bot3";
import { V3, Fire, Logs, Mist, Sky, Crow, woodTex, tx } from "./Common";
import { textTex } from "../Miya3/Sets3";
const waveBase = () => textTex("waves3", 1024, 1024, (c) => {
  c.fillStyle = "#808080"; c.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 260; i++) { const x = random("wx" + i) * 1024, y = random("wy" + i) * 1024, w = 60 + random("ww" + i) * 160; const g = c.createLinearGradient(x, y - 10, x, y + 10); g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.5, `rgba(255,255,255,${0.25 + random("wa" + i) * 0.35})`); g.addColorStop(1, "rgba(0,0,0,0.2)"); c.fillStyle = g; c.beginPath(); c.ellipse(x, y, w, 7 + random("wh" + i) * 6, (random("wr" + i) - 0.5) * 0.3, 0, 7); c.fill(); }
});
const WAVES: Record<number, THREE.Texture> = {};
const waveTex = (f: number) => { const k = Math.floor(f) % 600; const t = (WAVES[k] ??= (() => { const c = waveBase().clone(); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.repeat.set(40, 40); c.offset.set(k / 600 * 0.6, k / 600 * 0.25); c.anisotropy = 16; c.needsUpdate = true; return c; })()); return t; };
import { Rope } from "./SetsIn";

/* ================= army camp with the wooden horse ================= */
const Tent: React.FC<{ p: V3; ry?: number; s?: number; c?: string }> = ({ p, ry = 0, s = 1, c = "#d8ccb0" }) => {
  const g = useMemo(() => { const sh = new THREE.Shape(); sh.moveTo(-1.1, 0); sh.lineTo(0, 1.5); sh.lineTo(1.1, 0); sh.lineTo(-1.1, 0); const e = new THREE.ExtrudeGeometry(sh, { depth: 2.4, bevelEnabled: false }); e.translate(0, 0, -1.2); return e; }, []);
  return <group position={p} rotation={[0, ry, 0]} scale={s}>
    <mesh geometry={g} castShadow receiveShadow><meshStandardMaterial color={c} roughness={0.95} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, 0.5, 1.205]}><planeGeometry args={[0.7, 1.0]} /><meshBasicMaterial color="#1a1208" /></mesh>
  </group>;
};
export const HorseBeam: React.FC = () => {
  const wood = tx("hb", () => woodTex("hb", [110, 76, 44]), 3, 1);
  return <group>
    <mesh position={[0, 1.42, 0]} rotation={[Math.PI / 4, 0, 0]} castShadow receiveShadow><boxGeometry args={[2.6, 0.2, 0.2]} /><meshStandardMaterial map={wood} roughness={0.85} /></mesh>
    <mesh position={[0, 1.33, 0]} castShadow><boxGeometry args={[2.6, 0.08, 0.2]} /><meshStandardMaterial map={wood} roughness={0.85} /></mesh>
    {[[-1.1, 1], [-1.1, -1], [1.1, 1], [1.1, -1]].map(([x, z], i) => <mesh key={i} position={[x, 0.66, z * 0.3]} rotation={[z * 0.42, 0, 0]} castShadow><boxGeometry args={[0.12, 1.45, 0.12]} /><meshStandardMaterial map={wood} roughness={0.9} /></mesh>)}
    {[-1.1, 1.1].map((x, i) => <mesh key={"c" + i} position={[x, 0.45, 0]}><boxGeometry args={[0.08, 0.08, 0.66]} /><meshStandardMaterial map={wood} /></mesh>)}
    {/* head and tail so it reads as a "horse" */}
    <mesh position={[1.38, 1.62, 0]} rotation={[0, 0, -0.5]} castShadow><boxGeometry args={[0.18, 0.55, 0.16]} /><meshStandardMaterial map={wood} /></mesh>
    <mesh position={[1.56, 1.84, 0]} rotation={[0, 0, 0.25]} castShadow><boxGeometry args={[0.4, 0.18, 0.15]} /><meshStandardMaterial map={wood} /></mesh>
    <mesh position={[-1.4, 1.3, 0]} rotation={[0, 0, 0.9]}><cylinderGeometry args={[0.02, 0.05, 0.5, 6]} /><meshStandardMaterial color="#2a1e14" /></mesh>
  </group>;
};
export const HorseSet: React.FC<{ f: number; rider?: number; weights?: number; pain?: number; crowd?: number; civil?: boolean; sky?: "dusk" | "sunset" | "haze" }> = ({ f, rider = 1, weights = 0, pain = 0, crowd = 1, civil = false, sky = "sunset" }) => {
  const sway = Math.sin(f / 22) * 2 * pain;
  const wy = 0.55 - weights * 0.0;
  const uni: Kind = civil ? "guard" : "hoplite";
  return <group>
    <Sky kind={sky} f={f} sun={[-30, 7, -80]} sunCol="#ffb070" clouds={8} cloudCol="#9a6a5a" />
    <ambientLight intensity={0.75} color="#c0a898" />
    <hemisphereLight args={["#ffd0a0", "#3a3020", 0.9]} />
    <directionalLight position={[-12, 9, -14]} intensity={2.6} color="#ffbe80" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} />
    <directionalLight position={[8, 6, 10]} intensity={0.9} color="#a8b8e8" />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[90, 90]} /><meshStandardMaterial color="#5a5a32" roughness={1} /></mesh>
    {Array.from({ length: 120 }).map((_, i) => { const x = (random("gx" + i) - 0.5) * 30, z = (random("gz" + i) - 0.5) * 30; return <mesh key={i} position={[x, 0.12, z]} rotation={[0, random("gr" + i) * 3, 0]}><coneGeometry args={[0.05, 0.25, 3]} /><meshStandardMaterial color={random("gc" + i) > 0.5 ? "#6e6a38" : "#4e5a2a"} /></mesh>; })}
    {/* tents */}
    {[[-6, -7, 0.2], [-2.5, -8.5, 0], [1.5, -8.8, -0.1], [5.5, -7.5, -0.3], [9, -5, -0.8], [-9.5, -4, 0.9], [-12, -9, 0.3], [12, -10, -0.2]].map(([x, z, r], i) => <Tent key={i} p={[x, 0, z]} ry={r} s={0.95 + random("ts" + i) * 0.2} c={i % 3 ? "#d8ccb0" : "#c2b494"} />)}
    {/* flag */}
    <group position={[-3.6, 0, -4]}><Cyl p={[0, 2.4, 0]} r1={0.04} h={4.8} c="#3a2a1a" /><mesh position={[0.5, 4.4, 0]} rotation={[0, Math.sin(f / 18) * 0.25, 0]}><planeGeometry args={[1.0, 0.65]} /><meshStandardMaterial color={civil ? "#2a3a7a" : "#8a1a18"} side={THREE.DoubleSide} /></mesh></group>
    {/* campfire */}
    <group position={[3.4, 0, 2.2]}><Logs p={[0, 0, 0]} s={0.8} /><Fire p={[0, 0.12, 0]} f={f} s={0.8} light={6} seed="hcf" /></group>
    <pointLight position={[0, 3.2, 2.5]} intensity={6} distance={10} decay={1.4} color="#ffd2a0" />
    {/* the horse */}
    <group scale={0.68}><HorseBeam /></group>
    {rider > 0 && <group position={[0, 0, 0]} rotation={[sway * 0.01, 0, 0]}>
      <Bot pos={[0.05, 0.36, 0]} ry={Math.PI / 2} p={{ ...STAND, lean: 6 + pain * 10, headX: 8 + pain * 18 + Math.sin(f / 14) * 4 * pain, headY: Math.sin(f / 40) * 8, lArmX: 28, rArmX: 28, lArmZ: -6, rArmZ: 6, lElbow: -70, rElbow: -70, lLegX: -12, rLegX: -12, lLegZ: -38, rLegZ: 38, lKnee: 22, rKnee: 22 }}
        f={f} outfit={civil ? "peasant2" : "prisoner"} hood={false} eyes={pain > 0.6 ? "closed" : "scared"} mouth="fear" brows={1} ground={false} />
      {weights > 0 && [-1, 1].map((s, i) => <group key={i}>
        <Rope a={[0.05, 0.56, s * 0.42]} b={[0.05, 0.3 + (1 - weights) * 0.2, s * 0.44]} r={0.008} />
        <mesh position={[0.05, 0.22 + (1 - weights) * 0.2, s * 0.44]} castShadow><boxGeometry args={[0.16, 0.18, 0.16]} /><meshStandardMaterial color="#3a3a3e" metalness={0.7} roughness={0.4} /></mesh>
      </group>)}
    </group>}
    {/* soldiers watching */}
    {crowd > 0 && Array.from({ length: 11 }).map((_, i) => { const a = -Math.PI * 0.05 + (i / 10) * Math.PI * 0.75, r = 3.3 + random("hr" + i) * 1.4, x = Math.cos(a + Math.PI) * r, z = -Math.sin(a) * r * 0.9 - 0.8;
      return <Bot key={i} pos={[x, 0, z]} ry={Math.atan2(-x, -z)} p={idleBP(f + i * 13, { ...STAND, headX: -4 })} f={f + i * 13} outfit={i % 4 === 0 ? "peasant" : uni} hood={false} eyes="calm" helmet={uni === "guard" && i % 4 !== 0} scale={0.95 + random("hs" + i) * 0.1} />; })}
    {/* an officer with a stick */}
    <Bot pos={[1.6, 0, 1.1]} ry={-2.2} p={{ ...STAND, rArmX: -40, rElbow: -60, lArmX: 10, lArmZ: -40, lElbow: -90 }} f={f} outfit={civil ? "guard" : "tyrant"} hood={false} eyes="calm" brows={-1} helmet={civil}
      rHandItem={<mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.012, 0.012, 0.7, 6]} /><meshStandardMaterial color="#2a1a10" /></mesh>} />
    <Mist f={f} n={8} area={[-14, 14, -12, -3]} y={0.4} col="#e8b890" o={0.05} s={5} />
  </group>;
};

/* ================= keelhauling: ship at sea + underwater ================= */
const hullGeo = () => { const g = new THREE.SphereGeometry(1, 48, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2); g.scale(6, 1.9, 1.8); return g; };
export const Ship: React.FC<{ f: number; barn?: boolean }> = ({ f, barn = false }) => {
  const wood = tx("sh", () => woodTex("sh", [86, 58, 34]), 6, 2), deck = tx("sd", () => woodTex("sd", [140, 104, 66]), 6, 2);
  const hull = useMemo(hullGeo, []);
  const barns = useMemo(() => Array.from({ length: 520 }).map((_, i) => { const u = random("bu" + i) * Math.PI * 2, v = 0.15 + random("bv" + i) * 0.85; const x = Math.cos(u) * Math.sin(v * Math.PI / 2), z = Math.sin(u) * Math.sin(v * Math.PI / 2), y = -Math.cos(v * Math.PI / 2); return [x * 6, y * 1.9, z * 1.8, 0.03 + random("bs" + i) * 0.05] as [number, number, number, number]; }), []);
  return <group>
    <mesh geometry={hull} castShadow receiveShadow><meshStandardMaterial map={wood} roughness={0.85} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[6, 1.8, 1]}><circleGeometry args={[1, 48]} /><meshStandardMaterial map={deck} roughness={0.8} /></mesh>
    <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[6, 1.8, 1]}><torusGeometry args={[1, 0.04, 6, 64]} /><meshStandardMaterial color="#3a2414" /></mesh>
    {/* stern castle */}
    <Box p={[-4.6, 0.7, 0]} s={[1.8, 1.4, 2.2]} map={wood} />
    <Box p={[-4.6, 1.45, 0]} s={[1.9, 0.08, 2.3]} map={deck} />
    {/* masts + sails */}
    {[[-1.5, 8.5], [2.2, 7.5]].map(([x, h], i) => <group key={i} position={[x, 0, 0]}>
      <Cyl p={[0, h / 2, 0]} r1={0.09} r2={0.12} h={h} c="#4a3220" />
      <Cyl p={[0, h * 0.78, 0]} r1={0.04} h={3.6} rot={[Math.PI / 2, 0, 0]} c="#4a3220" />
      <mesh position={[0.06, h * 0.6, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[3.4, h * 0.36, 8, 4]} /><meshStandardMaterial color="#e8dcc0" roughness={0.95} side={THREE.DoubleSide} /></mesh>
    </group>)}
    {barn && barns.map(([x, y, z, s], i) => <mesh key={i} position={[x * 0.995, y * 0.995, z * 0.995]} scale={[1, 0.55, 1]}><sphereGeometry args={[s * 0.8, 8, 6]} /><meshStandardMaterial color={i % 3 ? "#b8b4a4" : "#7a7a68"} roughness={0.7} /></mesh>)}
    {barn && Array.from({ length: 40 }).map((_, i) => { const u = random("wu" + i) * Math.PI * 2; return <mesh key={"w" + i} position={[Math.cos(u) * 5.2 * random("wr" + i), -1.6 - random("wy" + i) * 0.2, Math.sin(u) * 1.2]} rotation={[0, 0, Math.sin(f / 20 + i) * 0.2]}><planeGeometry args={[0.025, 0.22]} /><meshStandardMaterial color="#1e3a1a" side={THREE.DoubleSide} /></mesh>; })}
  </group>;
};
export const KeelSet: React.FC<{ f: number; mode: "deck" | "side" | "under"; pull?: number; sailor?: boolean; crew?: number; splash?: number; struggle?: number }> = ({ f, mode, pull = 0, sailor = true, crew = 1, splash = 0, struggle = 1 }) => {
  const env = useEnv();
  const bob = Math.sin(f / 45) * 0.06, roll = Math.sin(f / 60) * 0.025;
  if (mode === "under") {
    const sx = -0.3 + 0.0, sz = 2.6 - pull * 5.2, sy = -2.2 - Math.sin(pull * Math.PI) * 0.15;
    return <group>
      <color attach="background" args={["#0d3a4a"]} />
      <fog attach="fog" args={["#0f4050", 2, 16]} />
      <ambientLight intensity={1.1} color="#6ac0c8" />
      <hemisphereLight args={["#9ae8e8", "#062028", 1.0]} />
      <directionalLight position={[2, 12, 3]} intensity={2.4} color="#c8f8f0" />
      <group position={[0, -0.2, 0]} rotation={[0, Math.PI / 2, 0]}><Ship f={f} barn /></group>
      {/* surface from below */}
      <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[80, 80]} /><meshBasicMaterial color="#5ac8d0" transparent opacity={0.55} side={THREE.DoubleSide} /></mesh>
      {/* light shafts */}
      {Array.from({ length: 9 }).map((_, i) => <mesh key={i} position={[-6 + i * 1.6 + Math.sin(f / 50 + i) * 0.3, -4, -3 + random("ls" + i) * 3]} rotation={[0, 0, 0.25]}><planeGeometry args={[0.5 + random("lw" + i) * 0.6, 12]} /><meshBasicMaterial color="#c8fff8" transparent opacity={0.07} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} /></mesh>)}
      {/* the rope under the keel */}
      <Rope a={[sx, 1, 4.5]} b={[sx, sy, sz]} r={0.02} />
      <Rope a={[sx, sy, sz]} b={[sx, 1, -4.5]} r={0.02} />
      {sailor && <Bot pos={[sx, sy - 0.05, sz]} rot={[Math.PI / 2 + Math.sin(f / 9) * 0.15 * struggle, 0, Math.PI]} p={{ ...STAND, headX: -20, lArmX: -170, rArmX: -170, lArmZ: -8, rArmZ: 8, lElbow: -5, rElbow: -5, lLegX: Math.sin(f / 6) * 20 * struggle, rLegX: -Math.sin(f / 6) * 20 * struggle, lKnee: 20, rKnee: 20 }} f={f} outfit="prisoner" hood={false} eyes={struggle > 0.3 ? "scared" : "closed"} mouth="fear" brows={1} ground={false} scale={0.9} />}
      {/* bubbles */}
      {Array.from({ length: 60 }).map((_, i) => { const t = ((f / (40 + random("bt" + i) * 40) + random("b0" + i)) % 1); return <mesh key={"b" + i} position={[sx + (random("bx" + i) - 0.5) * 0.8 + Math.sin(f / 8 + i) * 0.05, sy + t * 2.2, sz + (random("bz" + i) - 0.5) * 0.8]}><sphereGeometry args={[0.015 + random("bs" + i) * 0.03, 8, 6]} /><meshBasicMaterial color="#e8ffff" transparent opacity={0.6 * (1 - t)} /></mesh>; })}
      {Array.from({ length: 50 }).map((_, i) => <mesh key={"p" + i} position={[(random("px" + i) - 0.5) * 16, -1 - random("py" + i) * 6, (random("pz" + i) - 0.5) * 12]}><sphereGeometry args={[0.012, 4, 3]} /><meshBasicMaterial color="#bfeee8" transparent opacity={0.5} /></mesh>)}
    </group>;
  }
  const crewN = Math.round(8 * crew), heave = Math.sin(f / 12) * 0.5 + 0.5;
  return <group>
    <Sky kind="sunset" f={f} sun={[-30, 6, -80]} sunCol="#ffc070" clouds={10} cloudCol="#9a7a7a" />
    <ambientLight intensity={0.8} color="#b8b0c8" />
    <hemisphereLight args={["#ffd8b0", "#203040", 0.9]} />
    <directionalLight position={[-14, 10, -16]} intensity={2.8} color="#ffc080" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} />
    <directionalLight position={[10, 5, 12]} intensity={0.8} color="#9ab8e8" />
    {/* sea */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow><planeGeometry args={[300, 300]} /><meshPhysicalMaterial color="#123a4c" roughness={0.38} metalness={0.1} envMap={env} envMapIntensity={0.28} bumpMap={waveTex(f)} bumpScale={0.6} clearcoat={0.4} clearcoatRoughness={0.3} /></mesh>
    {Array.from({ length: 5 }).map((_, i) => <Crow key={"g" + i} p={[-8 + i * 4 + Math.sin(f / 90 + i) * 2, 5 + random("gy" + i) * 2, -6 - random("gz" + i) * 6]} f={f + i * 9} ry={0.6} s={0.9} col="#f2f2f0" seed={i} />)}
    {Array.from({ length: 80 }).map((_, i) => { const x = (random("sx" + i) - 0.5) * 50, z = (random("sz" + i) - 0.5) * 50, s = ((f / 70 + random("so" + i)) % 1); return <mesh key={i} position={[x, -0.58, z]} rotation={[-Math.PI / 2, 0, random("sr" + i) * 3]}><planeGeometry args={[0.8 + s, 0.05]} /><meshBasicMaterial color="#d8f0f0" transparent opacity={0.35 * Math.sin(s * Math.PI)} /></mesh>; })}
    <group position={[0, bob, 0]} rotation={[roll, 0, 0]}>
      <Ship f={f} />
      {/* rope from deck over the side */}
      <Rope a={[0.6, 0.35, 1.85]} b={[0.6, -0.6, 2.4]} r={0.02} />
      <Rope a={[0.6, 0.35, -1.85]} b={[0.6, -0.6, -2.4]} r={0.02} />
      {/* crew hauling on the far side */}
      {Array.from({ length: crewN }).map((_, i) => { const x = -1.6 + i * 0.42; return <Bot key={i} pos={[x, 0.02, -1.05]} ry={Math.PI / 2} p={{ ...STAND, lean: 22 + heave * 12, lArmX: -70 + heave * 20, rArmX: -60 + heave * 20, lElbow: -30, rElbow: -30, lLegX: 20, rLegX: -18, lKnee: 18, rKnee: 6 }} f={f + i * 7} outfit={i % 3 ? "peasant2" : "peasant"} hood={false} eyes="calm" brows={-1} scale={0.82} />; })}
      {/* captain */}
      <Bot pos={[-4.4, 1.48, 0.3]} ry={Math.PI / 2 - 0.4} p={{ ...STAND, rArmX: -70, rElbow: -10, rArmZ: 20 }} f={f} outfit="tyrant" hood={false} eyes="calm" brows={-1} scale={0.85} />
      {/* sailor on deck before being thrown */}
      {sailor && mode === "deck" && <Bot pos={[0.6, 0.02, 1.4]} ry={Math.PI} p={{ ...STAND, lArmX: 30, rArmX: 30, lElbow: -70, rElbow: -70, headX: 10 }} f={f} outfit="prisoner" hood={false} eyes="scared" mouth="fear" brows={1} scale={0.82} />}
    </group>
    {splash > 0 && Array.from({ length: 30 }).map((_, i) => { const a = random("pa" + i) * Math.PI * 2, t = splash; return <mesh key={"sp" + i} position={[0.6 + Math.cos(a) * t * 0.8, -0.5 + Math.sin(t * Math.PI) * (0.6 + random("ph" + i)), 2.5 + Math.sin(a) * t * 0.8]}><sphereGeometry args={[0.04, 6, 4]} /><meshBasicMaterial color="#e8f8ff" transparent opacity={1 - t} /></mesh>; })}
    {[0, 1, 2].map((k) => { const s = ((f / 80 + k / 3) % 1); return <mesh key={"r" + k} position={[0.6, -0.57, 2.5]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.3 + s * 1.6, 0.34 + s * 1.6, 40]} /><meshBasicMaterial color="#e0f4f4" transparent opacity={(1 - s) * 0.25 * (mode === "side" ? 1 : 0)} depthWrite={false} /></mesh>; })}
  </group>;
};
