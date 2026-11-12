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
  bob: base.bob + Math.sin(f / 24) * 0.006,
  lean: base.lean + Math.sin(f / 24) * 0.8,
  headX: base.headX + Math.sin(f / 37) * 1.5,
  headY: base.headY + Math.sin(f / 53) * 3,
  lArmZ: base.lArmZ - Math.sin(f / 24) * 1.2,
  rArmZ: base.rArmZ + Math.sin(f / 24) * 1.2,
  twist: base.twist + Math.sin(f / 61) * 2,
});
export const SIT: BP = { ...STAND, bob: -0.36, lean: -4, lLegX: -88, lKnee: 86, rLegX: -86, rKnee: 84, lLegZ: -5, rLegZ: 5 };
export const TYPE: BP = { ...SIT, lean: 10, headX: 12, lArmX: -42, lArmZ: -12, lElbow: -52, rArmX: -46, rArmZ: 12, rElbow: -48 };
export const walkBP = (ph: number, amp = 1): BP => {
  const leg = (p: number) => ({ x: -24 * Math.sin(p) * amp, k: (6 + 55 * Math.pow(Math.max(0, Math.cos(p)), 1.4)) * amp });
  const A = leg(ph), B = leg(ph + Math.PI);
  return { ...STAND, bob: -0.025 * Math.abs(Math.cos(ph)) * amp, lean: 5, lLegX: A.x, lKnee: A.k, rLegX: B.x, rKnee: B.k, lArmX: 18 * Math.sin(ph) * amp, rArmX: -18 * Math.sin(ph) * amp, lElbow: -14, rElbow: -14, headY: 0, twist: 4 * Math.sin(ph) * amp };
};

// shared materials
let MAT: { body: THREE.Material; line: THREE.Material; eye: THREE.Material } | null = null;
const mats = () => (MAT ??= {
  body: new THREE.MeshPhysicalMaterial({ color: "#232327", roughness: 0.48, metalness: 0.05, clearcoat: 0.3, clearcoatRoughness: 0.45 }),
  line: new THREE.MeshBasicMaterial({ color: "#000000", side: THREE.BackSide }),
  eye: new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#ffffff", emissiveIntensity: 1.6 }),
});
const Part: React.FC<{ geo: THREE.BufferGeometry; p?: [number, number, number]; r?: [number, number, number]; s?: [number, number, number]; outline?: number }> = ({ geo, p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1], outline = 1.07 }) => {
  const m = mats();
  return (
    <group position={p} rotation={r} scale={s}>
      <mesh geometry={geo} material={m.body} castShadow receiveShadow />
      <mesh geometry={geo} material={m.line} scale={[outline, outline, outline]} />
    </group>
  );
};

export const Bot: React.FC<{ pos: [number, number, number]; ry?: number; p: BP; f?: number; scale?: number; extra?: React.ReactNode; rHandItem?: React.ReactNode; lHandItem?: React.ReactNode }> = ({ pos, ry = 0, p, f = 0, scale = 1, extra, rHandItem, lHandItem }) => {
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
        <Part geo={G.upper} p={[0, -0.14, 0]} />
        <group position={[0, -0.29, 0]} rotation={R(el)}>
          <Part geo={G.fore} p={[0, -0.13, 0]} />
          <Part geo={G.hand} p={[0, -0.28, 0]} />
          <group position={[0, -0.29, 0]}>{side < 0 ? lHandItem : rHandItem}</group>
        </group>
      </group>
    );
  };
  const leg = (side: -1 | 1) => {
    const lx = side < 0 ? p.lLegX : p.rLegX, lz = side < 0 ? p.lLegZ : p.rLegZ, kn = side < 0 ? p.lKnee : p.rKnee;
    return (
      <group position={[side * 0.065, 0, 0]} rotation={R(lx, 0, lz)}>
        <Part geo={G.thigh} p={[0, -0.21, 0]} />
        <group position={[0, -0.42, 0]} rotation={R(kn)}>
          <Part geo={G.shin} p={[0, -0.2, 0]} />
          <group position={[0, -0.4, 0]} rotation={R(-kn - lx)}><Part geo={G.foot} p={[0, -0.01, 0.06]} r={[Math.PI / 2, 0, 0]} /></group>
        </group>
      </group>
    );
  };
  return (
    <group position={pos} rotation={[0, ry, 0]} scale={scale}>
      <group position={[0, 0.86 + p.bob, 0]} rotation={R(0, p.twist, 0)}>
        {leg(-1)}{leg(1)}
        <group rotation={R(p.lean)}>
          <Part geo={G.torso} p={[0, 0.25, 0]} s={[1.25, 1, 0.9]} />
          {arm(-1)}{arm(1)}
          <group position={[0, 0.5, 0]} rotation={R(p.headX, p.headY, 0)}>
            <Part geo={G.torso} p={[0, 0.0, 0]} s={[0.35, 0.18, 0.35]} outline={1.12} />
            <group position={[0, 0.22, 0]}>
              <Part geo={G.head} outline={1.04} />
              {/* angry glowing eyes */}
              {[-1, 1].map((sd) => (
                <mesh key={sd} geometry={G.eye} material={m.eye} position={[sd * 0.072, 0.0, 0.188]} rotation={[0, sd * 0.35, sd * 0.42]} scale={[0.052, 0.019 * blink, 0.02]} />
              ))}
              {/* glossy highlight arc */}
              <mesh position={[-0.09, 0.11, 0.14]} rotation={[0, -0.4, 0.6]}><torusGeometry args={[0.07, 0.006, 6, 24, 1.6]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.75} /></mesh>
            </group>
          </group>
        </group>
      </group>
      {extra}
    </group>
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
