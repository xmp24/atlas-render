import React from "react";
import * as THREE from "three";
import { random } from "remotion";
import { Box, Cyl } from "../Miya3/Kit3";
import { masonry, Torch, Contact, useEnv, glowTex } from "../Gota/Dungeon4";
import { Bot5 as Bot } from "./Bot5";
import { STAND, BP, idleBP, mixBP } from "../Miya8/Bot3";
import { V3, Fire, Mist, woodTex, ironTex, tx, flameTex } from "./Common";

/* ---------------- generic stone chamber ---------------- */
export const Chamber: React.FC<{ f: number; w?: number; d?: number; h?: number; tone?: [number, number, number]; floorTone?: [number, number, number]; torches?: [V3, number][]; pillars?: boolean; arches?: boolean; vault?: boolean; seed?: string; amb?: number; window?: boolean }> = ({ f, w = 8, d = 8, h = 4.2, tone = [128, 114, 98], floorTone = [96, 88, 78], torches = [], pillars = true, arches = true, vault = true, seed = "c", amb = 1, window = false }) => {
  const wall = masonry(seed + "w", tone, w / 3.2, h / 2.4), wallD = masonry(seed + "w", tone, d / 3.2, h / 2.4), floor = masonry(seed + "f", floorTone, w / 2, d / 2, 6), beam = tx("bm" + seed, () => woodTex("bm", [70, 48, 30]), 1, 3);
  return <group>
    <ambientLight intensity={0.1 * amb} color="#55638a" />
    <hemisphereLight args={["#3a4a6a", "#1a120a", 0.22 * amb]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[w, d]} /><meshStandardMaterial map={floor} bumpMap={floor} bumpScale={3} roughness={0.85} /></mesh>
    <mesh position={[0, h / 2, -d / 2]} receiveShadow><planeGeometry args={[w, h]} /><meshStandardMaterial map={wall} bumpMap={wall} bumpScale={3.5} roughness={0.92} /></mesh>
    <mesh position={[0, h / 2, d / 2]} rotation={[0, Math.PI, 0]} receiveShadow><planeGeometry args={[w, h]} /><meshStandardMaterial map={wall} bumpMap={wall} bumpScale={3.5} roughness={0.92} /></mesh>
    <mesh position={[-w / 2, h / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow><planeGeometry args={[d, h]} /><meshStandardMaterial map={wallD} bumpMap={wallD} bumpScale={3.5} roughness={0.92} /></mesh>
    <mesh position={[w / 2, h / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow><planeGeometry args={[d, h]} /><meshStandardMaterial map={wallD} bumpMap={wallD} bumpScale={3.5} roughness={0.92} /></mesh>
    {vault ? <mesh position={[0, h - 0.6, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, w / 2 / 1.0, 1]}><cylinderGeometry args={[0.6, 0.6, d, 24, 1, true, 0, Math.PI]} /><meshStandardMaterial map={wallD} roughness={0.95} side={THREE.BackSide} /></mesh>
      : <mesh position={[0, h, 0]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[w, d]} /><meshStandardMaterial color="#1a1612" roughness={1} /></mesh>}
    {vault && <mesh position={[0, h - 0.6, 0]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[w, d]} /><meshStandardMaterial color="#0a0908" side={THREE.DoubleSide} /></mesh>}
    {pillars && [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => <group key={i} position={[sx * (w / 2 - 0.35), 0, sz * (d / 2 - 0.35)]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow><boxGeometry args={[0.7, h, 0.7]} /><meshStandardMaterial map={wallD} bumpMap={wallD} bumpScale={3} roughness={0.92} /></mesh>
      <Box p={[0, 0.12, 0]} s={[0.84, 0.24, 0.84]} map={floor} /><Box p={[0, h - 0.7, 0]} s={[0.84, 0.18, 0.84]} map={floor} />
    </group>)}
    {arches && [-1, 1].map((sz) => <mesh key={sz} position={[0, h - 0.75, sz * (d / 2 - 0.35)]} rotation={[0, 0, 0]}><torusGeometry args={[w / 2 - 0.7, 0.22, 8, 32, Math.PI]} /><meshStandardMaterial map={floor} roughness={0.9} /></mesh>)}
    {torches.map(([p, ry], i) => <Torch key={i} p={p} ry={ry} f={f} seed={seed + i} />)}
    {window && <group position={[-w / 2 + 0.02, 2.9, -1.2]} rotation={[0, Math.PI / 2, 0]}>
      <Box p={[0, 0, -0.05]} s={[0.5, 0.8, 0.06]} c="#1a2a48" e="#1d3766" ei={0.6} />
      {[-0.12, 0, 0.12].map((x) => <Box key={x} p={[x, 0, 0.02]} s={[0.026, 0.82, 0.03]} c="#1e1e20" metal={0.7} />)}
    </group>}
    <Mist f={f} area={[-w / 2, w / 2, -d / 2, d / 2]} o={0.06} />
    <Contact p={[0, 0, 0]} s={[w, d]} o={0.2} />
  </group>;
};
const ropeM = new THREE.MeshStandardMaterial({ color: "#a08a5a", roughness: 1 });
/** a straight rope between two world points */
export const Rope: React.FC<{ a: V3; b: V3; r?: number; sag?: number }> = ({ a, b, r = 0.014, sag = 0 }) => {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  if (sag > 0) { const M = A.clone().add(B).multiplyScalar(0.5); M.y -= sag; const c = new THREE.QuadraticBezierCurve3(A, M, B); return <mesh material={ropeM}><tubeGeometry args={[c, 16, r, 6, false]} /></mesh>; }
  const m = A.clone().add(B).multiplyScalar(0.5), len = A.distanceTo(B), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  return <mesh position={m} quaternion={q} material={ropeM}><cylinderGeometry args={[r, r, len, 6]} /></mesh>;
};
export const Candle: React.FC<{ p: V3; f: number; h?: number; seed?: string; light?: number }> = ({ p, f, h = 0.2, seed = "cd", light = 0.6 }) => <group position={p}>
  <mesh position={[0, h / 2, 0]}><cylinderGeometry args={[0.025, 0.028, h, 12]} /><meshStandardMaterial color="#efe2c4" roughness={0.6} emissive="#ffb060" emissiveIntensity={0.15} /></mesh>
  <sprite position={[0, h + 0.035 + Math.sin(f / 4 + seed.length) * 0.003, 0]} scale={[0.035, 0.08, 1]}><spriteMaterial map={flameTex()} transparent depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
  <sprite position={[0, h + 0.03, 0]} scale={[0.3, 0.3, 1]}><spriteMaterial map={glowTex()} color="#ffa040" transparent opacity={0.25} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
  {light > 0 && <pointLight position={[0, h + 0.06, 0]} intensity={light * (1 + (random(seed + Math.floor(f / 3)) - 0.5) * 0.15)} distance={2.6} color="#ffb060" />}
</group>;

/* ================= 7. STRAPPADO — inquisition chamber ================= */
/** lift 0..1 = hoisted height; the prisoner hangs from wrists tied behind his back */
export const STRAP_PULLEY: V3 = [0, 3.55, 0];
export const StrappadoSet: React.FC<{ f: number; lift: number; weight?: number; sway?: number; crank?: number; pain?: number }> = ({ f, lift, weight = 0, sway = 0, crank = 0, pain = 0 }) => {
  const wood = tx("bw", () => woodTex("bw", [62, 42, 26]), 1, 3);
  // prisoner: wrists tied behind, hoisted; arms end up vertical above the shoulders, body pitched forward
  const k = lift, y = k * 0.62, sw = Math.sin(f / 22) * 0.04 * sway, m = Math.min(1, k * 1.6);
  const lean = 8 + 37 * m, arm = 40 + (180 - 45 - 40) * m, D = Math.PI / 180;
  const pose: BP = { ...STAND, bob: 0, lean, headX: 14 - 50 * m, lArmX: arm, rArmX: arm, lArmZ: -6, rArmZ: 6, lElbow: -6, rElbow: -6, lLegX: 6 * m + Math.sin(f / 15) * 4 * pain, rLegX: 2 * m - Math.sin(f / 15) * 4 * pain, lKnee: 4 + 12 * m, rKnee: 4 + 8 * m, lLegZ: -3, rLegZ: 4 };
  const T = (lean + arm) * D, hipY = 0.86 + y, shY = hipY + 0.43 * Math.cos(lean * D), shZ = 0.43 * Math.sin(lean * D);
  const hy = shY - 0.6 * Math.cos(T), hzl = shZ - 0.6 * Math.sin(T), bz = -hzl * m, hx = 0, hz = hzl + bz;
  return <group>
    <Chamber f={f} seed="inq" tone={[120, 104, 90]} torches={[[[-3.98, 2.1, -1.6], Math.PI / 2], [[3.98, 2.1, -1.6], -Math.PI / 2], [[-1.8, 2.1, -3.98], 0], [[1.8, 2.1, -3.98], 0]]} window />
    <pointLight position={[1.2, 2.8, 2.2]} intensity={3.5} distance={7} color="#ffc08a" />
    <pointLight position={[-1.6, 2.2, 1.6]} intensity={1.4} distance={6} color="#8aa0e0" />
    {/* ceiling beam, pulley, rope down to wrists and across to the windlass */}
    <Box p={[0, 3.72, 0]} s={[8, 0.3, 0.32]} map={wood} rough={0.9} />
    <group position={STRAP_PULLEY}><mesh rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.11, 0.035, 10, 24]} /><meshStandardMaterial map={ironTex()} metalness={0.7} roughness={0.5} /></mesh><Box p={[0, 0.1, 0]} s={[0.05, 0.2, 0.2]} c="#2a2624" metal={0.7} /></group>
    <Rope a={[STRAP_PULLEY[0] + sw, STRAP_PULLEY[1] - 0.11, STRAP_PULLEY[2]]} b={[hx + sw, hy, hz]} />
    <Rope a={[0.11, STRAP_PULLEY[1], 0]} b={[2.55, 1.15, -0.2]} />
    {/* windlass with handle */}
    <group position={[2.6, 0, -0.2]}>
      {[-0.35, 0.35].map((z) => <Box key={z} p={[0, 0.6, z]} s={[0.14, 1.2, 0.14]} map={wood} />)}
      <group position={[0, 1.15, 0]} rotation={[0, 0, 0]}><mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.1, 0.1, 0.62, 16]} /><meshStandardMaterial map={wood} roughness={0.9} /></mesh>
        {[0, 1].map((i) => <group key={i} rotation={[0, 0, crank + i * Math.PI]}><Box p={[0, 0.3, 0.36]} s={[0.05, 0.6, 0.05]} c="#3a2a1c" /></group>)}
        <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.115, 0.115, 0.3, 16]} /><meshStandardMaterial color="#9a8458" roughness={1} /></mesh></group>
    </group>
    <group position={[sw * 0.6, y, bz]} rotation={[0, 0, sw]}>
      <Bot pos={[0, 0, 0]} p={pose} f={f} outfit="prisoner" hood={false} eyes="scared" mouth={pain > 0.5 ? "scream" : "fear"} brows={1} pupil={0.8} ground={false} />
      {weight > 0 && <group position={[0, 0.05 - weight * 0.0, 0.05]}><Rope a={[-0.07, 0.1, 0.05]} b={[0, -0.18, 0.05]} r={0.008} /><Rope a={[0.07, 0.1, 0.05]} b={[0, -0.18, 0.05]} r={0.008} /><mesh position={[0, -0.32, 0.05]} castShadow><cylinderGeometry args={[0.16, 0.18, 0.26, 16]} /><meshStandardMaterial map={ironTex()} metalness={0.6} roughness={0.55} /></mesh></group>}
    </group>
    <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.35 - y * 0.12, 24]} /><meshBasicMaterial color="#000" transparent opacity={0.4 - y * 0.15} depthWrite={false} /></mesh>
    {/* the tribunal: inquisitor behind a table with candles and a scribe */}
    <group position={[0, 0, -2.8]}>
      <Box p={[0, 0.78, 0]} s={[2.6, 0.08, 0.9]} map={wood} /><Box p={[0, 0.4, 0.42]} s={[2.6, 0.74, 0.05]} map={wood} />
      <Box p={[0, 0.82, 0]} s={[2.62, 0.02, 0.92]} c="#2a0a0e" rough={0.95} />
      <Candle p={[-0.9, 0.82, 0.1]} f={f} seed="c1" /><Candle p={[0.9, 0.82, 0.1]} f={f} seed="c2" h={0.16} /><Candle p={[-0.75, 0.82, 0.2]} f={f} seed="c3" h={0.12} light={0} />
      <Box p={[0.4, 0.84, 0.1]} s={[0.4, 0.015, 0.3]} c="#e8dcc0" r={[0, 0.2, 0]} />
      <Bot pos={[-0.3, 0, -0.65]} p={{ ...idleBP(f, { ...STAND, bob: -0.36, lean: 4, lLegX: -88, lKnee: 86, rLegX: -86, rKnee: 84, lArmX: -40, rArmX: -46, lElbow: -50, rElbow: -46 }), headX: 8 }} f={f} outfit="monk" hood={false} eyes="angry" ground={false} />
      <Bot pos={[0.75, 0, -0.6]} p={{ ...idleBP(f + 40, { ...STAND, bob: -0.36, lean: 16, lLegX: -88, lKnee: 86, rLegX: -86, rKnee: 84, rArmX: -52, rElbow: -60 + Math.sin(f / 4) * 6, lArmX: -40, lElbow: -50 }), headX: 24 }} f={f} outfit="monk" hood={false} eyes="angry" ground={false} scale={0.92} />
      <group position={[0, 2.6, -0.95]}><Box p={[0, 0, 0]} s={[0.08, 1.0, 0.06]} map={wood} /><Box p={[0, 0.2, 0]} s={[0.55, 0.08, 0.06]} map={wood} /></group>
      {[-1.6, 1.6].map((x) => <group key={x} position={[x, 0, -0.9]}><Box p={[0, 2.2, 0]} s={[0.9, 2.4, 0.03]} c="#3a0a10" rough={1} /><Box p={[0, 3.42, 0]} s={[1.0, 0.06, 0.06]} c="#2a1a10" /></group>)}
    </group>
    {/* executioner at the windlass */}
    <Bot pos={[2.15, 0, 0.15]} ry={Math.PI / 2 + 0.3} p={{ ...STAND, lean: 14, lArmX: -60 + Math.sin(crank) * 18, rArmX: -60 - Math.sin(crank) * 18, lElbow: -40, rElbow: -40, lLegX: -12, rLegX: 10, rKnee: 14 }} f={f} outfit="exec" hood={false} eyes="angry" scale={1.08} />
    {/* brazier + tools on the side */}
    <group position={[-2.6, 0, 1.6]}><Cyl p={[0, 0.35, 0]} r1={0.05} h={0.7} c="#222" /><mesh position={[0, 0.75, 0]}><cylinderGeometry args={[0.32, 0.2, 0.18, 20, 1, true]} /><meshStandardMaterial map={ironTex()} metalness={0.6} side={THREE.DoubleSide} /></mesh><Fire p={[0, 0.78, 0]} f={f} s={0.6} light={2.2} seed="brz" smoke={0.6} /></group>
    {[[-3.4, 0.2], [-3.4, 0.6], [-3.4, 1.0]].map(([x, z], i) => <group key={i} position={[x, 0, z]}><mesh position={[0, 0.06, 0]}><cylinderGeometry args={[0.12, 0.14, 0.12, 12]} /><meshStandardMaterial map={ironTex()} metalness={0.6} /></mesh></group>)}
  </group>;
};

/* ================= 6. THE RAT — a cell with a table, a pot, coals ================= */
export const RatSet: React.FC<{ f: number; potOn: number; heat: number; ratIn: number; panic: number; cut?: number; lit?: number }> = ({ f, potOn, heat, ratIn, panic, cut = 0, lit = 1 }) => {
  const wood = tx("rw", () => woodTex("rw", [74, 50, 30]), 2, 1);
  const shake = panic * (Math.sin(f * 2.1) * 0.006 + Math.sin(f * 3.3) * 0.004);
  const pTop = 1.04; // top of the belly
  return <group>
    <Chamber f={f} w={6.5} d={6.5} h={3.4} seed="rat" tone={[110, 100, 88]} vault={false} arches={false} torches={[[[-3.23, 1.9, -1.2], Math.PI / 2], [[1.6, 1.9, -3.23], 0]]} amb={0.9} />
    {/* table */}
    <group position={[0, 0, 0]}>
      <Box p={[0, 0.82, 0]} s={[2.1, 0.09, 0.85]} map={wood} />
      {[[-0.95, -0.36], [0.95, -0.36], [-0.95, 0.36], [0.95, 0.36]].map(([x, z], i) => <Box key={i} p={[x, 0.4, z]} s={[0.1, 0.8, 0.1]} map={wood} />)}
      {[-0.7, 0.75].map((x) => <group key={x}><Box p={[x, 0.95, 0]} s={[0.06, 0.035, 0.9]} c="#9a8458" rough={1} /></group>)}
    </group>
    <Bot pos={[0.9, 0.95, 0]} rot={[-Math.PI / 2, 0, Math.PI / 2]} p={{ ...STAND, lArmZ: -14 + panic * Math.sin(f / 3) * 4, rArmZ: 14 - panic * Math.sin(f / 3.3) * 4, headX: -10 + panic * Math.sin(f / 4) * 6, headY: panic * Math.sin(f / 7) * 18 }} f={f} outfit="prisoner" hood={false} eyes="scared" mouth={panic > 0.4 ? "scream" : "fear"} brows={1} pupil={0.7 + 0.3 * (1 - panic)} ground={false} />
    {/* pot on the belly, coals on top */}
    {potOn > 0 && <group position={[-0.08, pTop + (1 - potOn) * 0.6 + shake, 0]}>
      <mesh castShadow><cylinderGeometry args={[0.13, 0.16, 0.2, 24, 1, true]} /><meshStandardMaterial map={ironTex()} metalness={0.65} roughness={0.5} side={THREE.DoubleSide} emissive="#ff3000" emissiveIntensity={heat * 0.08} /></mesh>
      <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.13, 0.13, 0.015, 24]} /><meshStandardMaterial map={ironTex()} metalness={0.65} roughness={0.5} emissive="#ff3000" emissiveIntensity={heat * 0.12} /></mesh>
      {heat > 0 && <group position={[0, 0.11, 0]}>{Array.from({ length: 12 }).map((_, i) => <mesh key={i} position={[(random("co" + i) - 0.5) * 0.18, 0.02 + random("cy" + i) * 0.03, (random("cz" + i) - 0.5) * 0.18]} rotation={[random("cr" + i) * 3, random("cs" + i) * 3, 0]}><dodecahedronGeometry args={[0.028 + random("cq" + i) * 0.018, 0]} /><meshStandardMaterial color="#1a0a04" emissive="#ff4a10" emissiveIntensity={heat * (0.7 + Math.sin(f / 5 + i) * 0.25)} roughness={1} /></mesh>)}
        <sprite position={[0, 0.06, 0]} scale={[0.7, 0.5, 1]}><spriteMaterial map={glowTex()} color="#ff6020" transparent opacity={heat * 0.3} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
        <pointLight position={[0, 0.15, 0]} intensity={heat * 1.6} distance={3} color="#ff7030" />
        {Array.from({ length: 5 }).map((_, i) => { const ph = (f / 70 + i / 5) % 1; return <sprite key={i} position={[Math.sin(f / 20 + i) * 0.06, 0.1 + ph * 1.2, 0]} scale={[0.15 + ph * 0.5, 0.15 + ph * 0.5, 1]}><spriteMaterial map={glowTex()} color="#6a5a50" transparent opacity={heat * Math.sin(Math.PI * ph) * 0.18} depthWrite={false} /></sprite>; })}
      </group>}
      {/* cut-away x-ray of the rat inside */}
      {cut > 0 && ratIn > 0 && <group position={[Math.sin(f / 3) * 0.02 * panic, -0.06, 0]} rotation={[0, f / 6 * panic, 0]}><RatBody f={f} s={0.9} op={cut} /></group>}
    </group>}
    {/* rat in a small cage before */}
    {ratIn <= 0 && <group position={[0.75, 0.87, 0.28]}>{[-0.1, -0.05, 0, 0.05, 0.1].map((x) => <Box key={x} p={[x, 0.09, 0]} s={[0.008, 0.18, 0.008]} c="#222" metal={0.7} />)}<Box p={[0, 0.18, 0]} s={[0.24, 0.015, 0.16]} map={wood} /><Box p={[0, 0, 0]} s={[0.24, 0.015, 0.16]} map={wood} /><group position={[0, 0.03, 0]} rotation={[0, Math.sin(f / 9) * 0.6, 0]}><RatBody f={f} s={0.8} /></group></group>}
    <Box p={[-0.8, 0.88, 0.25]} s={[0.25, 0.04, 0.2]} c="#2a2624" metal={0.6} />
    {/* coal bucket and tongs */}
    <group position={[1.4, 0, 0.6]}><mesh position={[0, 0.22, 0]}><cylinderGeometry args={[0.2, 0.17, 0.44, 20, 1, true]} /><meshStandardMaterial map={ironTex()} metalness={0.6} side={THREE.DoubleSide} /></mesh>{lit > 0 && <Fire p={[0, 0.36, 0]} f={f} s={0.35} light={1.4} seed="cb" smoke={0.4} />}</group>
    <Bot pos={[0.25, 0, -0.85]} ry={0} p={{ ...idleBP(f, STAND), lean: 22, headX: 30, rArmX: -70, rElbow: -30, lArmX: -30, lElbow: -40 }} f={f} outfit="exec" hood={false} eyes="angry" scale={1.05} />
  </group>;
};
export const RatBody: React.FC<{ f: number; s?: number; op?: number }> = ({ f, s = 1, op = 1 }) => {
  const m = <meshStandardMaterial color="#4a4038" roughness={0.9} transparent={op < 1} opacity={op} />;
  return <group scale={s}>
    <mesh scale={[0.045, 0.04, 0.085]}><sphereGeometry args={[1, 14, 10]} />{m}</mesh>
    <mesh position={[0, 0.005, 0.09]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.026, 0.06, 10]} />{m}</mesh>
    {[-1, 1].map((sd) => <mesh key={sd} position={[sd * 0.02, 0.03, 0.075]}><sphereGeometry args={[0.012, 8, 6]} /><meshStandardMaterial color="#8a6a60" /></mesh>)}
    {[-1, 1].map((sd) => <mesh key={"e" + sd} position={[sd * 0.012, 0.016, 0.1]}><sphereGeometry args={[0.005, 6, 4]} /><meshBasicMaterial color="#c01818" /></mesh>)}
    {Array.from({ length: 8 }).map((_, i) => <mesh key={"t" + i} position={[Math.sin(f / 3 + i * 0.6) * 0.01 * i, -0.02, -0.085 - i * 0.022]}><sphereGeometry args={[0.006 - i * 0.0005, 6, 4]} /><meshStandardMaterial color="#9a7a70" /></mesh>)}
  </group>;
};

/* ================= 4. THE RACK — Tower of London chamber ================= */
export const RackSet: React.FC<{ f: number; turn: number; strain: number; shown?: number; noPrisoner?: boolean }> = ({ f, turn, strain, noPrisoner }) => {
  const wood = tx("rk", () => woodTex("rk", [86, 60, 36]), 3, 1);
  const L = 2.6, s = strain; // stretch 0..1
  return <group>
    <Chamber f={f} seed="tow" tone={[118, 116, 112]} floorTone={[88, 86, 82]} torches={[[[-3.98, 2.1, 1.2], Math.PI / 2], [[3.98, 2.1, 1.2], -Math.PI / 2], [[0, 2.1, -3.98], 0]]} window />
    <group position={[0, 0, 0.2]}>
      {/* frame */}
      {[-0.42, 0.42].map((z) => <Box key={z} p={[0, 0.72, z]} s={[L, 0.14, 0.12]} map={wood} />)}
      {[[-1.2, -0.42], [1.2, -0.42], [-1.2, 0.42], [1.2, 0.42]].map(([x, z], i) => <Box key={i} p={[x, 0.36, z]} s={[0.14, 0.72, 0.14]} map={wood} />)}
      {[-0.6, 0, 0.6].map((x) => <Box key={x} p={[x, 0.74, 0]} s={[0.1, 0.06, 0.84]} map={wood} />)}
      {/* rollers with spoked handles */}
      {[-1, 1].map((sd) => <group key={sd} position={[sd * 1.2, 0.82, 0]} rotation={[0, 0, 0]}>
        <group rotation={[0, 0, 0]}><mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.09, 0.09, 1.0, 16]} /><meshStandardMaterial map={wood} roughness={0.9} /></mesh>
          <group rotation={[0, 0, sd * turn]}>{[0, 1, 2, 3].map((i) => <group key={i} rotation={[0, 0, i * Math.PI / 2]}><Box p={[0, 0.32, 0.56]} s={[0.06, 0.55, 0.06]} c="#3a2614" /></group>)}<mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.56]}><cylinderGeometry args={[0.07, 0.07, 0.08, 12]} /><meshStandardMaterial color="#2a1a10" /></mesh></group>
          <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.1, 0.1, 0.26, 16]} /><meshStandardMaterial color="#9a8458" roughness={1} /></mesh>
        </group>
      </group>)}
      {!noPrisoner && <>
        {/* prisoner lying on his back, arms over his head toward -x */}
        <Bot pos={[0.9 + s * 0.04, 0.9, 0]} rot={[-Math.PI / 2, 0, Math.PI / 2]} p={{ ...STAND, lArmX: 180, rArmX: 180, lArmZ: -10, rArmZ: 10, lElbow: 0, rElbow: 0, lLegZ: -4, rLegZ: 4, lKnee: 0, rKnee: 0, headX: -8 + Math.sin(f / 11) * 4 * s, headY: Math.sin(f / 17) * 12 * s, bob: 0 }} f={f} outfit="prisoner" hood={false} eyes="scared" mouth={s > 0.55 ? "scream" : s > 0.2 ? "grit" : "fear"} brows={1} pupil={0.8} ground={false} scale={1 + s * 0.06} />
        {/* ropes: wrists -> left roller, ankles -> right roller */}
        <Rope a={[-1.2, 0.86, 0.05]} b={[-0.98 - s * 0.05, 0.9, 0.06]} r={0.012} /><Rope a={[-1.2, 0.86, -0.05]} b={[-0.98 - s * 0.05, 0.9, -0.06]} r={0.012} />
        <Rope a={[1.2, 0.86, 0.07]} b={[0.95 + s * 0.08, 0.9, 0.07]} r={0.012} /><Rope a={[1.2, 0.86, -0.07]} b={[0.95 + s * 0.08, 0.9, -0.07]} r={0.012} />
      </>}
    </group>
    {/* turner */}
    <Bot pos={[1.65, 0, 0.95]} ry={-Math.PI / 2 - 0.4} p={{ ...STAND, lean: 18 + Math.sin(turn * 4) * 6, lArmX: -70 + Math.sin(turn * 4) * 20, rArmX: -80 + Math.sin(turn * 4) * 20, lElbow: -30, rElbow: -30, lLegX: -20, rLegX: 14, rKnee: 20 }} f={f} outfit="guard" hood={false} eyes="angry" helmet />
    <Bot pos={[-1.3, 0, -1.25]} ry={0.5} p={idleBP(f, { ...STAND, lArmX: -30, lElbow: -70, rArmX: -20, rElbow: -60 })} f={f} outfit="scholar" hood={false} eyes="angry" />
    <group position={[-1.95, 0, -1.6]}><Box p={[0, 0.5, 0]} s={[0.6, 1.0, 0.5]} map={wood} /><Candle p={[0.1, 1.0, 0]} f={f} seed="rk1" /><Box p={[-0.1, 1.01, 0.05]} s={[0.25, 0.01, 0.32]} c="#e8dcc0" /></group>
    <pointLight position={[0.3, 2.6, 1.4]} intensity={4} distance={6} color="#ffc896" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
    <pointLight position={[-1.5, 2.0, 2.0]} intensity={1.6} distance={5} color="#8aa0e0" />
    <Contact p={[0, 0, 0.2]} s={[3.4, 1.6]} o={0.5} />
  </group>;
};
