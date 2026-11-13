import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";

/** 3D stickman killer in the style of the user's sheet: big glossy head, angry glowing eyes, tubular limbs, black outline */
export type BP = {
  bob: number; lean: number; twist: number; headX: number; headY: number;
  lArmX: number; lArmZ: number; lElbow: number; rArmX: number; rArmZ: number; rElbow: number;
  lLegX: number; lLegZ: number; lKnee: number; rLegX: number; rLegZ: number; rKnee: number;
};
const D2R = Math.PI / 180;
export const STAND: BP = { bob: 0, lean: 3, twist: 0, headX: 4, headY: 0, lArmX: 4, lArmZ: -9, lElbow: -10, rArmX: 4, rArmZ: 9, rElbow: -10, lLegX: 0, lLegZ: -3, lKnee: 2, rLegX: 0, rLegZ: 3, rKnee: 2 };
export const mixBP = (a: BP, b: BP, k: number): BP => { const o: any = {}; for (const key of Object.keys(a)) o[key] = (a as any)[key] + ((b as any)[key] - (a as any)[key]) * k; return o; };
const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
export const bpTrack = (f: number, keys: [number, BP][]): BP => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) { const [a, A] = keys[i], [b, B] = keys[i + 1]; if (f <= b) return mixBP(A, B, ease((f - a) / (b - a))); }
  return keys[keys.length - 1][1];
};
/** breathing idle with slow weight shift and micro head motion */
export const idleBP = (f: number, base: BP = STAND): BP => ({
  ...base,
  bob: base.bob + Math.sin(f / 24) * 0.011,
  lean: base.lean + Math.sin(f / 24) * 1.6,
  headX: base.headX + Math.sin(f / 37) * 1.5,
  headY: base.headY + Math.sin(f / 53) * 3,
  lArmZ: base.lArmZ - Math.sin(f / 24) * 1.2,
  rArmZ: base.rArmZ + Math.sin(f / 24) * 1.2,
  lElbow: base.lElbow + Math.sin(f / 7) * 2.5 * (Math.sin(f / 31) > 0.3 ? 1 : 0.2),
  rElbow: base.rElbow + Math.sin(f / 6.3 + 1) * 2.5 * (Math.sin(f / 29 + 2) > 0.3 ? 1 : 0.2),
  twist: base.twist + Math.sin(f / 61) * 2,
});
export const SIT: BP = { ...STAND, bob: -0.36, lean: -4, lLegX: -88, lKnee: 86, rLegX: -86, rKnee: 84, lLegZ: -5, rLegZ: 5 };
export const TYPE: BP = { ...SIT, lean: 10, headX: 12, lArmX: -42, lArmZ: -12, lElbow: -52, rArmX: -46, rArmZ: 12, rElbow: -48 };
export const walkBP = (ph: number, amp = 1): BP => {
  const leg = (p: number) => ({ x: -24 * Math.sin(p) * amp, k: (6 + 55 * Math.pow(Math.max(0, Math.cos(p)), 1.4)) * amp });
  const A = leg(ph), B = leg(ph + Math.PI);
  return { ...STAND, bob: -0.025 * Math.abs(Math.cos(ph)) * amp, lean: 5, lLegX: A.x, lKnee: A.k, rLegX: B.x, rKnee: B.k, lArmX: 18 * Math.sin(ph) * amp, rArmX: -18 * Math.sin(ph) * amp, lElbow: -14, rElbow: -14, headY: 0, twist: 4 * Math.sin(ph) * amp };
};

export type Mouth = "none" | "fear" | "scream" | "grit" | "flat" | "slack";
// ---------- clothing textures ----------
const cv = (key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => { const t = TEXC[key]; if (t) return t; const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d")!); const tx = new THREE.CanvasTexture(c); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8; return (TEXC[key] = tx); };
const TEXC: Record<string, THREE.Texture> = {};
const weave = (c: CanvasRenderingContext2D, w: number, h: number, base: string, a = 0.12) => { c.fillStyle = base; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 3) { c.fillStyle = `rgba(0,0,0,${a * (0.5 + random("wy" + y) * 0.5)})`; c.fillRect(0, y, w, 1); } for (let x = 0; x < w; x += 3) { c.fillStyle = `rgba(255,255,255,${a * 0.5 * random("wx" + x)})`; c.fillRect(x, 0, 1, h); } };
const stains = (c: CanvasRenderingContext2D, w: number, h: number, seed: string, n: number, col: string) => { for (let i = 0; i < n; i++) { const x = random(seed + "x" + i) * w, y = random(seed + "y" + i) * h, r = 8 + random(seed + "r" + i) * 40; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); } };
const linenTex = () => cv("linen", 256, 256, (c) => { weave(c, 256, 256, "#a8987a", 0.14); stains(c, 256, 256, "ln", 22, "rgba(70,50,30,0.35)"); stains(c, 256, 256, "lm", 8, "rgba(40,30,20,0.4)"); for (let i = 0; i < 6; i++) { c.fillStyle = "rgba(30,20,12,0.85)"; c.beginPath(); const x = random("th" + i) * 256, y = random("ty" + i) * 256; c.ellipse(x, y, 4 + random("tw" + i) * 9, 2 + random("tz" + i) * 5, random("ta" + i) * 3, 0, 7); c.fill(); } });
const trouserTex = () => cv("trous", 256, 256, (c) => { weave(c, 256, 256, "#5a4834", 0.18); stains(c, 256, 256, "tr", 20, "rgba(25,18,10,0.4)"); for (let i = 0; i < 5; i++) { c.strokeStyle = "rgba(20,14,8,0.5)"; c.lineWidth = 2; c.beginPath(); const x = random("pa" + i) * 256, y = random("pb" + i) * 256; c.rect(x, y, 30, 26); c.stroke(); } });
const leatherTex = (key: string, base: string) => cv("lea" + key, 256, 256, (c) => { c.fillStyle = base; c.fillRect(0, 0, 256, 256); for (let i = 0; i < 1800; i++) { c.fillStyle = `rgba(${random(key + "q" + i) > 0.5 ? "255,240,220" : "0,0,0"},${random(key + "o" + i) * 0.08})`; c.fillRect(random(key + "a" + i) * 256, random(key + "b" + i) * 256, 2 + random(key + "s" + i) * 4, 1 + random(key + "t" + i) * 3); } stains(c, 256, 256, key, 10, "rgba(0,0,0,0.25)"); c.strokeStyle = "rgba(200,170,120,0.35)"; c.setLineDash([5, 4]); c.lineWidth = 2; for (const y of [40, 216]) { c.beginPath(); c.moveTo(0, y); c.lineTo(256, y); c.stroke(); } });
const mailTex = () => cv("mail", 128, 128, (c) => { c.fillStyle = "#2a2c30"; c.fillRect(0, 0, 128, 128); for (let y = 0; y < 128; y += 6) for (let x = (y / 6) % 2 ? 3 : 0; x < 128; x += 6) { c.strokeStyle = "rgba(190,195,205,0.85)"; c.lineWidth = 1.4; c.beginPath(); c.arc(x, y, 2.6, 0, 7); c.stroke(); } });
const tabardTex = () => cv("tabard", 256, 512, (c) => { weave(c, 256, 512, "#7a1418", 0.16); stains(c, 256, 512, "tb", 14, "rgba(20,0,0,0.35)"); c.fillStyle = "#c9a227"; c.fillRect(0, 0, 256, 10); c.fillRect(0, 502, 256, 10);
  // emblem: a black key on a gold disc
  c.fillStyle = "#c9a227"; c.beginPath(); c.arc(128, 170, 62, 0, 7); c.fill(); c.fillStyle = "#151515"; c.beginPath(); c.arc(128, 132, 20, 0, 7); c.fill(); c.fillStyle = "#c9a227"; c.beginPath(); c.arc(128, 132, 9, 0, 7); c.fill(); c.fillStyle = "#151515"; c.fillRect(121, 148, 14, 66); c.fillRect(135, 192, 18, 9); c.fillRect(135, 206, 12, 8); });
const skinTex = () => cv("skin", 128, 128, (c) => { c.fillStyle = "#d9c3a6"; c.fillRect(0, 0, 128, 128); stains(c, 128, 128, "sk", 16, "rgba(120,80,60,0.12)"); stains(c, 128, 128, "sd", 10, "rgba(60,45,35,0.18)"); });
const OUT: Record<string, Record<string, THREE.Material>> = {};
const cloth = (map: THREE.Texture, rep: [number, number], rough = 0.95, extra: any = {}) => { const m = map.clone(); m.needsUpdate = true; m.repeat.set(rep[0], rep[1]); return new THREE.MeshStandardMaterial({ map: m, roughness: rough, bumpMap: m, bumpScale: 1.5, ...extra }); };
const OUTFITS = (k: "prisoner" | "guard") => (OUT[k] ??= k === "prisoner" ? (() => {
  const skin = new THREE.MeshPhysicalMaterial({ map: skinTex(), roughness: 0.55, clearcoat: 0.2, clearcoatRoughness: 0.5, sheen: 0.4, sheenColor: new THREE.Color("#ffd8c0") });
  return { head: skin, neck: skin, fore: skin, hand: skin, foot: skin, torso: cloth(linenTex(), [1.5, 1]), upper: cloth(linenTex(), [0.8, 0.8]), thigh: cloth(trouserTex(), [1, 1]), shin: cloth(trouserTex(), [1, 1]) };
})() : (() => {
  const dark = new THREE.MeshPhysicalMaterial({ color: "#232327", roughness: 0.48, clearcoat: 0.3, clearcoatRoughness: 0.45 });
  const boot = cloth(leatherTex("bt", "#3a2618"), [1, 1], 0.6, { metalness: 0.05 });
  return { head: dark, neck: cloth(mailTex(), [2, 1], 0.4, { metalness: 0.8 }), torso: cloth(leatherTex("jk", "#4a3220"), [1, 1], 0.7), upper: cloth(mailTex(), [2, 2], 0.4, { metalness: 0.8, color: "#bbbbbb" }), fore: cloth(leatherTex("br", "#5a3c24"), [1, 1], 0.65), hand: cloth(leatherTex("gl", "#2a1c12"), [1, 1], 0.6), thigh: cloth(trouserTex(), [1, 1]), shin: boot, foot: boot };
})());
/** clothing pieces that are not body parts: rope belt / torn hem (prisoner); tabard, belt, buckle, keys (guard) */
const Outfit: React.FC<{ kind: "prisoner" | "guard" }> = ({ kind }) => {
  if (kind === "prisoner") return <group>
    <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.28, 0.95, 1]}><torusGeometry args={[0.1, 0.012, 8, 28]} /><meshStandardMaterial color="#8a7448" roughness={1} /></mesh>
    <mesh position={[0.06, 0.03, 0.09]} rotation={[0.2, 0, 0.3]}><cylinderGeometry args={[0.008, 0.006, 0.09, 6]} /><meshStandardMaterial color="#8a7448" roughness={1} /></mesh>
    {Array.from({ length: 14 }).map((_, i) => { const a = (i / 14) * Math.PI * 2; return <mesh key={i} position={[Math.sin(a) * 0.118, -0.02 - random("hm" + i) * 0.03, Math.cos(a) * 0.088]} rotation={[Math.cos(a) * 0.3, 0, -Math.sin(a) * 0.3]}><coneGeometry args={[0.02, 0.06 + random("hl" + i) * 0.05, 4]} /><meshStandardMaterial map={linenTex()} roughness={1} side={THREE.DoubleSide} /></mesh>; })}
    <mesh position={[0, 0.43, 0.075]} rotation={[0.3, 0, 0]}><torusGeometry args={[0.045, 0.01, 6, 16, Math.PI]} /><meshStandardMaterial color="#7a6a4e" roughness={1} /></mesh>
  </group>;
  return <group>
    {[1, -1].map((sd) => <mesh key={sd} position={[0, 0.2, sd * 0.088]} rotation={[0, sd < 0 ? Math.PI : 0, 0]}><planeGeometry args={[0.2, 0.5]} /><meshStandardMaterial map={tabardTex()} roughness={0.9} side={THREE.DoubleSide} /></mesh>)}
    <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.3, 0.98, 1]}><torusGeometry args={[0.104, 0.016, 8, 28]} /><meshStandardMaterial color="#2a1a10" roughness={0.6} /></mesh>
    <mesh position={[0, 0.06, 0.103]}><boxGeometry args={[0.05, 0.04, 0.012]} /><meshStandardMaterial color="#b8973e" metalness={0.85} roughness={0.25} /></mesh>
    <group position={[0.12, 0.02, 0.03]}><mesh rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.03, 0.005, 6, 16]} /><meshStandardMaterial color="#6a6a70" metalness={0.9} roughness={0.3} /></mesh>{[0, 1, 2].map((i) => <mesh key={i} position={[0.005, -0.04 - i * 0.004, (i - 1) * 0.015]} rotation={[0, 0, 0.2 * (i - 1)]}><boxGeometry args={[0.008, 0.05, 0.004]} /><meshStandardMaterial color="#8a7a50" metalness={0.85} roughness={0.3} /></mesh>)}</group>
    {[-1, 1].map((sd) => <mesh key={"p" + sd} position={[sd * 0.13, 0.42, 0]} scale={[1, 0.5, 1]}><sphereGeometry args={[0.07, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#55595f" metalness={0.8} roughness={0.32} /></mesh>)}
  </group>;
};
/** face: brows (angle -1 angry .. +1 worried) and mouth shapes */
const Face: React.FC<{ mouth: Mouth; brows: number; eyes: string; f: number; G: any }> = ({ mouth, brows, eyes, f, G }) => {
  const ink = <meshBasicMaterial color="#141010" />;
  return <group>
    {brows !== 0 && eyes !== "dead" && [-1, 1].map((sd) => <mesh key={sd} position={[sd * 0.075, 0.078 + Math.abs(brows) * 0.006, 0.17]} rotation={[-0.35, sd * 0.38, Math.PI / 2 - sd * brows * 0.45]}><capsuleGeometry args={[0.011, 0.045, 4, 8]} />{ink}</mesh>)}
    {mouth !== "none" && <group position={[0, -0.105, 0.172]} rotation={[0.55, 0, 0]} scale={1.35}>
      {mouth === "fear" && <><mesh scale={[0.034, 0.024 + Math.sin(f / 4) * 0.003, 0.01]} geometry={G.eye}><meshBasicMaterial color="#1a0808" /></mesh><mesh position={[0, -0.006, 0.003]} scale={[0.02, 0.01, 0.01]} geometry={G.eye}><meshBasicMaterial color="#7a2a2a" /></mesh></>}
      {mouth === "scream" && <><mesh scale={[0.045, 0.05 + Math.sin(f / 2) * 0.004, 0.01]} geometry={G.eye}><meshBasicMaterial color="#1a0808" /></mesh><mesh position={[0, -0.018, 0.003]} scale={[0.028, 0.016, 0.01]} geometry={G.eye}><meshBasicMaterial color="#8a2a2a" /></mesh><mesh position={[0, 0.036, 0.004]} scale={[0.03, 0.007, 0.01]} geometry={G.eye}><meshBasicMaterial color="#f2eee6" /></mesh></>}
      {mouth === "grit" && <><mesh scale={[0.048, 0.018, 0.01]} geometry={G.eye}><meshBasicMaterial color="#1a0808" /></mesh><mesh position={[0, 0, 0.004]} scale={[0.04, 0.009, 0.01]} geometry={G.eye}><meshBasicMaterial color="#f2eee6" /></mesh>{[-2, -1, 0, 1, 2].map((i) => <mesh key={i} position={[i * 0.014, 0, 0.007]}><boxGeometry args={[0.0018, 0.018, 0.002]} /><meshBasicMaterial color="#555" /></mesh>)}</>}
      {mouth === "flat" && <mesh rotation={[0, 0, 0.1 * Math.PI]} position={[0, -0.018, 0]}><torusGeometry args={[0.03, 0.005, 6, 16, Math.PI * 0.8]} />{ink}</mesh>}
      {mouth === "slack" && <mesh scale={[0.026, 0.012, 0.01]} geometry={G.eye}><meshBasicMaterial color="#1a0808" /></mesh>}
    </group>}
  </group>;
};
// shared materials
let MAT: { body: THREE.Material; line: THREE.Material; eye: THREE.Material } | null = null;
const mats = () => (MAT ??= {
  body: new THREE.MeshPhysicalMaterial({ color: "#232327", roughness: 0.48, metalness: 0.05, clearcoat: 0.3, clearcoatRoughness: 0.45 }),
  line: new THREE.MeshBasicMaterial({ color: "#000000", side: THREE.BackSide }),
  eye: new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#ffffff", emissiveIntensity: 1.6 }),
});
const TINTS: Record<string, THREE.Material> = {};
const tintMat = (c: string) => (TINTS[c] ??= new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.55, metalness: 0.02, clearcoat: 0.15, clearcoatRoughness: 0.6 }));
const PUPIL = new THREE.MeshBasicMaterial({ color: "#111111" });
const BotStyle = React.createContext<{ body?: THREE.Material; parts?: Record<string, THREE.Material> }>({});
const Part: React.FC<{ geo: THREE.BufferGeometry; p?: [number, number, number]; r?: [number, number, number]; s?: [number, number, number]; outline?: number; k?: string }> = ({ geo, p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1], outline = 1.07, k }) => {
  const m = mats(); const st = React.useContext(BotStyle);
  const mat = (k && st.parts?.[k]) || st.body || m.body;
  return (
    <group position={p} rotation={r} scale={s}>
      <mesh geometry={geo} material={mat} castShadow receiveShadow />
      <mesh geometry={geo} material={m.line} scale={[outline, outline, outline]} />
    </group>
  );
};

export const Bot4: React.FC<{ pos: [number, number, number]; ry?: number; p: BP; f?: number; scale?: number; extra?: React.ReactNode; rHandItem?: React.ReactNode; lHandItem?: React.ReactNode; glow?: number; tint?: string; eyes?: "angry" | "scared" | "dead" | "closed"; helmet?: boolean; hood?: boolean; ground?: boolean; rot?: [number, number, number]; tired?: number; pupil?: number; xk?: number; outfit?: "prisoner" | "guard"; mouth?: Mouth; brows?: number; look?: [number, number] }> = ({ pos, ry = 0, p, f = 0, scale = 1, extra, rHandItem, lHandItem, glow = 0, tint, eyes = "angry", helmet, hood = true, ground = true, rot, tired = 0, pupil = 1, xk = 1, outfit, mouth = "none", brows = 0, look = [0, 0] }) => {
  const G = useMemo(() => ({
    torso: new THREE.CapsuleGeometry(0.075, 0.36, 8, 16),
    upper: new THREE.CapsuleGeometry(0.036, 0.22, 6, 12),
    fore: new THREE.CapsuleGeometry(0.033, 0.2, 6, 12),
    thigh: new THREE.CapsuleGeometry(0.046, 0.33, 6, 12),
    shin: new THREE.CapsuleGeometry(0.042, 0.31, 6, 12),
    head: new THREE.SphereGeometry(0.205, 40, 28),
    hand: new THREE.SphereGeometry(0.046, 16, 12),
    foot: new THREE.CapsuleGeometry(0.045, 0.1, 6, 12),
    eye: new THREE.SphereGeometry(1, 20, 12),
  }), []);
  const blink = (f + 17) % 113 < 3 ? 0.15 : 1;
  const m = mats();
  const R = (x: number, y = 0, z = 0): [number, number, number] => [x * D2R, y * D2R, z * D2R];
  const arm = (side: -1 | 1) => {
    const ax = side < 0 ? p.lArmX : p.rArmX, az = side < 0 ? p.lArmZ : p.rArmZ, el = side < 0 ? p.lElbow : p.rElbow;
    return (
      <group position={[side * 0.1, 0.43, 0]} rotation={R(ax, 0, az)}>
        <Part geo={G.upper} p={[0, -0.14, 0]} k="upper" s={[outfit ? 1.12 : 1, 1, outfit ? 1.12 : 1]} />
        <group position={[0, -0.29, 0]} rotation={R(el)}>
          <Part geo={G.fore} p={[0, -0.13, 0]} k="fore" />
          <Part geo={G.hand} p={[0, -0.28, 0]} k="hand" />
          <group position={[0, -0.29, 0]}>{side < 0 ? lHandItem : rHandItem}</group>
        </group>
      </group>
    );
  };
  const leg = (side: -1 | 1) => {
    const lx = side < 0 ? p.lLegX : p.rLegX, lz = side < 0 ? p.lLegZ : p.rLegZ, kn = side < 0 ? p.lKnee : p.rKnee;
    return (
      <group position={[side * 0.065, 0, 0]} rotation={R(lx, 0, lz)}>
        <Part geo={G.thigh} p={[0, -0.21, 0]} k="thigh" s={[outfit ? 1.12 : 1, 1, outfit ? 1.12 : 1]} />
        <group position={[0, -0.42, 0]} rotation={R(kn)}>
          <Part geo={G.shin} p={[0, -0.2, 0]} k="shin" s={[outfit === "guard" ? 1.18 : outfit ? 1.06 : 1, 1, outfit === "guard" ? 1.18 : outfit ? 1.06 : 1]} />
          <group position={[0, -0.4, 0]} rotation={R(-kn - lx)}><Part geo={G.foot} p={[0, -0.01, 0.06]} r={[Math.PI / 2, 0, 0]} k="foot" s={outfit === "guard" ? [1.15, 1.2, 1.15] : [1, 1, 1]} /></group>
        </group>
      </group>
    );
  };
  return (
    <BotStyle.Provider value={{ body: tint ? tintMat(tint) : undefined, parts: outfit ? OUTFITS(outfit) : undefined }}>
    <group position={pos} rotation={rot ?? [0, ry, 0]} scale={scale}>
      <group position={[0, 0.86 + p.bob, 0]} rotation={R(0, p.twist, 0)}>
        {leg(-1)}{leg(1)}
        <group rotation={R(p.lean)}>
          <group scale={[1 + Math.sin(f / 24) * 0.02, 1, 1 + Math.sin(f / 24) * 0.03]}><Part geo={G.torso} p={[0, 0.25, 0]} s={outfit ? [1.38, 1.02, 1.05] : [1.25, 1, 0.9]} k="torso" />
            {outfit && <Outfit kind={outfit} />}</group>
          {/* hood of his sweatshirt, folded on the back of the neck, and drawstrings */}
          {hood && <group position={[0, 0.47, -0.095]} rotation={R(22)}><Part geo={G.head} s={[0.5, 0.26, 0.3]} outline={1.05} /></group>}
          {hood && [-1, 1].map((sd) => <mesh key={"ds" + sd} position={[sd * 0.03, 0.4, 0.085]}><cylinderGeometry args={[0.006, 0.006, 0.14, 6]} /><meshStandardMaterial color="#9a9aa2" /></mesh>)}
          {arm(-1)}{arm(1)}
          <group position={[0, 0.5, 0]} rotation={R(p.headX, p.headY, 0)}>
            <Part geo={G.torso} p={[0, 0.0, 0]} s={[0.35, 0.18, 0.35]} outline={1.12} k="neck" />
            <group position={[0, 0.22, 0]}>
              <Part geo={G.head} outline={1.04} k="head" />
              <Face mouth={mouth} brows={brows} eyes={eyes} f={f} G={G} />
              {/* angry glowing eyes */}
              {eyes === "angry" && [-1, 1].map((sd) => (
                <mesh key={sd} geometry={G.eye} material={m.eye} position={[sd * 0.072, 0.0, 0.188]} rotation={[0, sd * 0.35, sd * 0.42]} scale={[0.052 * (1 + glow * 0.25), 0.019 * blink * (1 + glow * 0.3), 0.02]} />
              ))}
              {eyes === "scared" && [-1, 1].map((sd) => (
                <group key={sd} position={[sd * 0.075, 0.02, 0.18]} rotation={[0, sd * 0.38, 0]}>
                  <mesh geometry={G.eye} material={m.eye} scale={[0.045, 0.05 * blink, 0.02]} />
                  <mesh geometry={G.eye} material={PUPIL} position={[sd * -0.008 + look[0] * 0.01 + Math.sin(f / 3) * 0.004, -0.004 + look[1] * 0.01, 0.016]} scale={[0.014 * pupil, 0.016 * blink * pupil, 0.01]} />
                </group>
              ))}
              {eyes === "closed" && [-1, 1].map((sd) => <mesh key={sd} position={[sd * 0.075, 0.012, 0.192]} rotation={[0, sd * 0.38, Math.PI]}><torusGeometry args={[0.03, 0.0055, 6, 16, Math.PI]} /><meshBasicMaterial color="#111" /></mesh>)}
              {tired > 0 && [-1, 1].map((sd) => <mesh key={"t" + sd} position={[sd * 0.075, -0.012, 0.18]} rotation={[0, sd * 0.38, 0]} scale={[0.05, 0.045, 0.02]} geometry={G.eye}><meshBasicMaterial color="#4a2c24" transparent opacity={0.3 * tired} depthWrite={false} /></mesh>)}
              {eyes === "dead" && [-1, 1].map((sd) => <group key={sd} position={[sd * 0.075, 0.0, 0.195]} rotation={[0, sd * 0.38, 0]} scale={[xk, xk, 1]}>{[1, -1].map((k) => <mesh key={k} rotation={[0, 0, k * 0.75]}><boxGeometry args={[0.075, 0.012, 0.01]} /><meshBasicMaterial color="#111" /></mesh>)}</group>)}
              {helmet && <group position={[0, 0.07, 0]}><mesh scale={[1, 0.62, 1]}><sphereGeometry args={[0.225, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#5a5e66" metalness={0.75} roughness={0.35} /></mesh><mesh position={[0, 0.005, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.235, 0.022, 8, 32]} /><meshStandardMaterial color="#44474e" metalness={0.8} roughness={0.3} /></mesh><mesh position={[0, -0.02, 0.21]}><boxGeometry args={[0.03, 0.14, 0.02]} /><meshStandardMaterial color="#44474e" metalness={0.8} roughness={0.3} /></mesh></group>}
              {glow > 0 && <pointLight position={[0, 0, 0.32]} intensity={glow * 1.6} distance={0.9} color="#ffffff" />}
              {/* glossy highlight arc */}
              <mesh position={[-0.09, 0.11, 0.14]} rotation={[0, -0.4, 0.6]}><torusGeometry args={[0.07, 0.006, 6, 24, 1.6]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.75} /></mesh>
            </group>
          </group>
        </group>
      </group>
      {ground && <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.32, 32]} /><meshBasicMaterial color="#000" transparent opacity={0.38} depthWrite={false} /></mesh>}
      {extra}
    </group>
    </BotStyle.Provider>
  );
};

// ---------- dark smoke aura ----------
let SMOKE: THREE.Texture | null = null;
const smokeTex = () => {
  if (SMOKE) return SMOKE;
  const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d")!;
  for (let i = 0; i < 7; i++) {
    const x = 64 + (random("sm" + i) - 0.5) * 40, y = 64 + (random("sn" + i) - 0.5) * 40, r = 30 + random("so" + i) * 30;
    const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, "rgba(255,255,255,0.55)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  }
  SMOKE = new THREE.CanvasTexture(c); return SMOKE;
};
export const Aura: React.FC<{ f: number; pos: [number, number, number]; n?: number; k?: number; seed?: string }> = ({ f, pos, n = 64, k = 1.25, seed = "a" }) => {
  const t = smokeTex();
  return (
    <group position={pos}>
      {Array.from({ length: n }).map((_, i) => {
        const L = 70 + random(seed + "l" + i) * 50, age = (f + random(seed + "o" + i) * L) % L, q = age / L;
        const ang = random(seed + "a" + i) * Math.PI * 2, rad = 0.12 + random(seed + "r" + i) * 0.22;
        const y0 = 0.15 + random(seed + "y" + i) * 1.55;
        const x = Math.cos(ang + q * 1.5) * (rad + q * 0.25), z = Math.sin(ang + q * 1.5) * (rad + q * 0.25);
        const s = (0.28 + 0.55 * q) * (0.7 + random(seed + "s" + i) * 0.6);
        return (
          <sprite key={i} position={[x, y0 + q * 0.7, z]} scale={[s, s, s]}>
            <spriteMaterial map={t} color={i % 4 === 0 ? "#3a060c" : "#050507"} transparent opacity={Math.min(0.85, Math.sin(Math.PI * q) * 0.42 * k)} depthWrite={false} rotation={q * 2 + i} />
          </sprite>
        );
      })}
      {Array.from({ length: Math.round(8 * k) + 4 }).map((_, i) => {
        const L = 60, age = (f + i * 7) % L, q = age / L, ang = random(seed + "e" + i) * 6.28;
        return (
          <sprite key={"e" + i} position={[Math.cos(ang) * 0.3, 0.3 + q * 1.6, Math.sin(ang) * 0.3]} scale={[0.05, 0.05, 0.05]}>
            <spriteMaterial map={t} color="#ff5a1f" transparent opacity={Math.sin(Math.PI * q) * 0.7 * k} blending={THREE.AdditiveBlending} depthWrite={false} />
          </sprite>
        );
      })}
    </group>
  );
};
