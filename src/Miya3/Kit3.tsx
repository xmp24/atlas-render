import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { useThree } from "@react-three/fiber";
import { continueRender, delayRender, random, staticFile, useCurrentFrame } from "remotion";

// ---------- procedural textures (deterministic) ----------
const cache: Record<string, THREE.Texture> = {};
const mk = (key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, rx = 1, ry = 1) => {
  if (cache[key]) return cache[key];
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const c = cv.getContext("2d")!; draw(c);
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  cache[key] = t; return t;
};
export const TX = {
  wallpaper: (base: string, stripe: string, rx = 4, ry = 2) => mk(`wp${base}${stripe}${rx}${ry}`, 256, 256, (c) => {
    c.fillStyle = base; c.fillRect(0, 0, 256, 256);
    c.fillStyle = stripe; for (let i = 0; i < 4; i++) c.fillRect(i * 64 + 8, 0, 18, 256);
    for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(0,0,0,${random("wpn" + i) * 0.04})`; c.fillRect(random("wx" + i) * 256, random("wy" + i) * 256, 2, 2); }
  }, rx, ry),
  wood: (rx = 3, ry = 3, tone = "#8a6446") => mk(`wood${rx}${ry}${tone}`, 512, 512, (c) => {
    c.fillStyle = tone; c.fillRect(0, 0, 512, 512);
    for (let r = 0; r < 8; r++) {
      const sh = (random("wr" + r) - 0.5) * 30;
      c.fillStyle = `rgb(${138 + sh},${100 + sh},${70 + sh})`; c.fillRect(0, r * 64, 512, 62);
      for (let k = 0; k < 18; k++) { c.strokeStyle = `rgba(60,35,20,${0.08 + random(`g${r}${k}`) * 0.1})`; c.lineWidth = 1.5; c.beginPath(); const y = r * 64 + random(`gy${r}${k}`) * 60; c.moveTo(0, y); c.bezierCurveTo(170, y + 4, 340, y - 4, 512, y); c.stroke(); }
      c.fillStyle = "rgba(40,25,15,0.6)"; c.fillRect(0, r * 64 + 62, 512, 2);
      const sx = (random("sx" + r) * 512) | 0; c.fillRect(sx, r * 64, 2, 62);
    }
  }, rx, ry),
  tiles: (base = "#e8ebe6", grout = "#c3c8c0", rx = 6, ry = 4) => mk(`tl${base}${rx}${ry}`, 128, 128, (c) => {
    c.fillStyle = grout; c.fillRect(0, 0, 128, 128); c.fillStyle = base;
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) c.fillRect(i * 64 + 3, j * 64 + 3, 58, 58);
    c.fillStyle = "rgba(255,255,255,0.25)"; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) c.fillRect(i * 64 + 6, j * 64 + 6, 20, 4);
  }, rx, ry),
  roof: (rx = 6, ry = 4) => mk(`roof${rx}${ry}`, 256, 256, (c) => {
    c.fillStyle = "#2b2d33"; c.fillRect(0, 0, 256, 256);
    for (let r = 0; r < 8; r++) for (let q = 0; q < 9; q++) {
      const x = q * 32 - (r % 2) * 16, y = r * 32; const s = (random(`rf${r}${q}`) - 0.5) * 18;
      c.fillStyle = `rgb(${58 + s},${60 + s},${68 + s})`; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 30, y); c.lineTo(x + 30, y + 26); c.quadraticCurveTo(x + 15, y + 32, x, y + 26); c.fill();
      c.fillStyle = "rgba(0,0,0,0.35)"; c.fillRect(x, y + 26, 30, 4);
    }
  }, rx, ry),
  plaster: (base = "#e9e6de", rx = 3, ry = 3) => mk(`pl${base}${rx}${ry}`, 256, 256, (c) => {
    c.fillStyle = base; c.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1400; i++) { const v = random("pn" + i); c.fillStyle = v > 0.5 ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"; c.fillRect(random("px" + i) * 256, random("py" + i) * 256, 2, 2); }
    c.fillStyle = "rgba(0,0,0,0.05)"; for (let i = 0; i < 8; i++) c.fillRect(0, i * 32, 256, 1);
  }, rx, ry),
  blocks: (rx = 8, ry = 2) => mk(`bk${rx}${ry}`, 256, 128, (c) => {
    c.fillStyle = "#6d6d6d"; c.fillRect(0, 0, 256, 128);
    for (let r = 0; r < 2; r++) for (let q = 0; q < 3; q++) { const s = (random(`b${r}${q}`) - 0.5) * 20; c.fillStyle = `rgb(${150 + s},${150 + s},${146 + s})`; c.fillRect(q * 128 - (r % 2) * 64 + 3, r * 64 + 3, 122, 58); }
    for (let i = 0; i < 500; i++) { c.fillStyle = "rgba(0,0,0,0.07)"; c.fillRect(random("bx" + i) * 256, random("by" + i) * 128, 2, 2); }
  }, rx, ry),
  tatami: () => mk("tatami", 256, 256, (c) => {
    c.fillStyle = "#b8b07a"; c.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 128; i++) { c.fillStyle = i % 2 ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.04)"; c.fillRect(0, i * 2, 256, 2); }
    c.fillStyle = "#3d3a2a"; c.fillRect(0, 0, 256, 10); c.fillRect(0, 246, 256, 10);
  }, 2, 2),
  asphalt: () => mk("asph", 256, 256, (c) => {
    c.fillStyle = "#2f3033"; c.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 3000; i++) { c.fillStyle = random("as" + i) > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.1)"; c.fillRect(random("ax" + i) * 256, random("ay" + i) * 256, 1.5, 1.5); }
  }, 10, 10),
  grass: () => mk("grass", 256, 256, (c) => {
    c.fillStyle = "#3d5a33"; c.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2500; i++) { const v = random("gr" + i); c.fillStyle = v > 0.5 ? "rgba(120,170,90,0.25)" : "rgba(20,40,15,0.25)"; c.fillRect(random("gx" + i) * 256, random("gy" + i) * 256, 1.5, 4); }
  }, 12, 12),
};

export const M = (o: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0, ...o });

// ---------- primitives ----------
export const Box: React.FC<{ p: [number, number, number]; s: [number, number, number]; c?: string; map?: THREE.Texture; e?: string; ei?: number; r?: [number, number, number]; rough?: number; metal?: number; cast?: boolean; recv?: boolean; op?: number }> = ({ p, s, c = "#ccc", map, e, ei = 1, r = [0, 0, 0], rough = 0.8, metal = 0, cast = true, recv = true, op }) => (
  <mesh position={p} rotation={r} castShadow={cast} receiveShadow={recv}>
    <boxGeometry args={s} />
    <meshStandardMaterial color={map ? "#ffffff" : c} map={map} emissive={e ?? "#000"} emissiveIntensity={e ? ei : 0} roughness={rough} metalness={metal} transparent={op !== undefined} opacity={op ?? 1} />
  </mesh>
);
export const Cyl: React.FC<{ p: [number, number, number]; r1: number; r2?: number; h: number; c?: string; e?: string; ei?: number; rot?: [number, number, number]; seg?: number }> = ({ p, r1, r2, h, c = "#ccc", e, ei = 1, rot = [0, 0, 0], seg = 20 }) => (
  <mesh position={p} rotation={rot} castShadow receiveShadow><cylinderGeometry args={[r1, r2 ?? r1, h, seg]} /><meshStandardMaterial color={c} emissive={e ?? "#000"} emissiveIntensity={e ? ei : 0} roughness={0.7} /></mesh>
);
export const Sph: React.FC<{ p: [number, number, number]; r: number; c?: string; e?: string; ei?: number; s?: [number, number, number] }> = ({ p, r, c = "#ccc", e, ei = 1, s = [1, 1, 1] }) => (
  <mesh position={p} scale={s} castShadow receiveShadow><sphereGeometry args={[r, 24, 16]} /><meshStandardMaterial color={c} emissive={e ?? "#000"} emissiveIntensity={e ? ei : 0} roughness={0.85} /></mesh>
);

/** hipped roof as a 4-sided frustum */
export const HipRoof: React.FC<{ p: [number, number, number]; w: number; d: number; h: number; ridge?: number }> = ({ p, w, d, h, ridge = 0.35 }) => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const hw = w / 2, hd = d / 2, rw = hw * ridge;
    const v = [-hw, 0, -hd, hw, 0, -hd, hw, 0, hd, -hw, 0, hd, -rw, h, 0, rw, h, 0];
    const idx = [0, 4, 1, 1, 4, 5, 1, 5, 2, 2, 5, 3, 3, 5, 4, 3, 4, 0];
    const uv = [0, 0, 1, 0, 1, 1, 0, 1, 0.5 - ridge / 2, 0.5, 0.5 + ridge / 2, 0.5];
    g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv.map((x) => x * 4), 2)); g.setIndex(idx); g.computeVertexNormals();
    return g;
  }, [w, d, h, ridge]);
  return <mesh geometry={geo} position={p} castShadow receiveShadow><meshStandardMaterial map={TX.roof(3, 3)} side={THREE.DoubleSide} roughness={0.85} /></mesh>;
};

/** window: frame + mullions + glass (emissive when lit) + optional curtains */
export const Win3: React.FC<{ p: [number, number, number]; w: number; h: number; lit?: number; ry?: number; curtain?: string; open?: number; f?: number; frame?: string }> = ({ p, w, h, lit = 0, ry = 0, curtain, open = 0, f = 0, frame = "#f1efe8" }) => (
  <group position={p} rotation={[0, ry, 0]}>
    <Box p={[0, 0, 0]} s={[w + 0.12, h + 0.12, 0.08]} c={frame} />
    <Box p={[open * w * 0.5, 0, 0.045]} s={[w, h, 0.01]} c={lit ? "#ffd27a" : "#16203a"} e={lit ? "#ffb54a" : undefined} ei={lit * 1.4} rough={0.15} metal={0.2} />
    {open > 0 && <Box p={[-w / 2 + (w / 2) * open / 2, 0, 0.062]} s={[(w / 2) * open, h - 0.02, 0.006]} c="#05070c" cast={false} />}
    <Box p={[0, 0, 0.05]} s={[0.04, h, 0.03]} c={frame} /><Box p={[0, 0, 0.05]} s={[w, 0.04, 0.03]} c={frame} />
    <Box p={[0, -h / 2 - 0.08, 0.08]} s={[w + 0.24, 0.05, 0.16]} c={frame} />
    {curtain && <>
      <Box p={[-w / 2 + 0.12, 0.02, 0.07]} s={[0.22, h - 0.02, 0.03]} c={curtain} e={lit ? curtain : undefined} ei={lit * 0.35} r={[0, 0, Math.sin(f / 25) * 0.02]} />
      <Box p={[w / 2 - 0.12, 0.02, 0.07]} s={[0.22, h - 0.02, 0.03]} c={curtain} e={lit ? curtain : undefined} ei={lit * 0.35} r={[0, 0, -Math.sin(f / 27) * 0.02]} />
    </>}
  </group>
);

export const Tree3: React.FC<{ p: [number, number, number]; s?: number; f: number; seed?: string }> = ({ p, s = 1, f, seed = "t" }) => (
  <group position={p} scale={s} rotation={[0, 0, Math.sin(f / 40 + p[0]) * 0.015]}>
    <Cyl p={[0, 1.2, 0]} r1={0.12} r2={0.18} h={2.4} c="#3b2c20" />
    {[[0, 3, 0, 1.3], [-0.7, 2.5, 0.2, 0.9], [0.7, 2.6, -0.2, 0.95], [0, 2.4, 0.7, 0.85], [0.2, 3.6, -0.3, 0.8]].map(([x, y, z, r], i) => <Sph key={i} p={[x, y, z]} r={r} c={random(seed + i) > 0.5 ? "#1f3a26" : "#284a2f"} />)}
  </group>
);

/** camera rig driven by the frame */
export const Rig: React.FC<{ pos: [number, number, number]; look: [number, number, number]; fov?: number }> = ({ pos, look, fov = 45 }) => {
  const { camera, gl } = useThree();
  useLayoutEffect(() => {
    gl.toneMappingExposure = 1.55;
    camera.position.set(...pos); camera.lookAt(...look);
    (camera as THREE.PerspectiveCamera).fov = fov; (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  });
  return null;
};

// ---------- the killer: Xbot mannequin with mocap clips driven by frame ----------
let gltfPromise: Promise<any> | null = null;
const loadBot = () => (gltfPromise ??= new GLTFLoader().loadAsync(staticFile("miya3/Xbot.glb")));
export const useBot = () => {
  const [g, setG] = useState<any>(null);
  const [h] = useState(() => delayRender("xbot"));
  useEffect(() => { loadBot().then((x) => { setG(x); continueRender(h); }); }, [h]);
  return g;
};

export type BotPose = "none" | "reachUp" | "reachR" | "sit" | "lean" | "hold";
export const Killer: React.FC<{ gltf: any; clip: "idle" | "walk" | "run"; t: number; p: [number, number, number]; ry?: number; pose?: BotPose; poseK?: number; blendTo?: "idle" | "walk"; blend?: number }> = ({ gltf, clip, t, p, ry = 0, pose = "none", poseK = 1, blendTo, blend = 0 }) => {
  const { obj, mixer, actions, bones } = useMemo(() => {
    const obj = SkeletonUtils.clone(gltf.scene) as THREE.Object3D;
    const bones: Record<string, THREE.Bone> = {};
    obj.traverse((o: any) => {
      if (o.isMesh) {
        o.frustumCulled = false;
        o.castShadow = true; o.receiveShadow = true;
        o.material = new THREE.MeshStandardMaterial({ color: o.name.includes("Joints") ? "#16171b" : "#2a2d35", roughness: 0.6, metalness: 0.1 });
      }
      if (o.isBone) bones[o.name] = o;
    });
    if (bones.mixamorigSpine2) bones.mixamorigSpine2.scale.set(1.12, 1, 1.05);
    if (bones.mixamorigHips) bones.mixamorigHips.scale.set(0.95, 1, 0.95);
    // clothes: straight jacket torso + trousers hide the mannequin's curves
    const cloth = (c: string) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 });
    const addCap = (bn: string, r: number, len: number, y: number, sx: number, sz: number, c: string) => { const b = bones[bn]; if (!b) return; const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 16), cloth(c)); m.position.set(0, y, 0); m.scale.set(sx, 1, sz); m.castShadow = true; m.frustumCulled = false; b.add(m); };
    addCap("mixamorigSpine1", 15.5, 26, 8, 1.32, 0.95, "#22252d");
    addCap("mixamorigSpine2", 15, 6, 10, 1.42, 0.98, "#22252d");
    addCap("mixamorigHips", 14.5, 6, 2, 1.22, 0.9, "#1b1d24");
    for (const side of ["Left", "Right"]) { addCap(`mixamorig${side}UpLeg`, 8.5, 30, 20, 1, 1, "#1b1d24"); addCap(`mixamorig${side}Leg`, 6.8, 30, 20, 1, 1, "#1b1d24"); }
    // beanie on the head
    const head = bones["mixamorigHead"];
    if (head) {
      const hat = new THREE.Mesh(new THREE.SphereGeometry(11, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: "#121318", roughness: 0.95 }));
      hat.frustumCulled = false; hat.position.set(0, 12, 0); hat.scale.set(1, 1.05, 1.08); head.add(hat);
      const band = new THREE.Mesh(new THREE.TorusGeometry(11, 1.8, 10, 32), new THREE.MeshStandardMaterial({ color: "#25262c", roughness: 1 }));
      band.position.set(0, 12, 0); band.rotation.x = Math.PI / 2; head.add(band);
    }
    const mixer = new THREE.AnimationMixer(obj);
    const actions: Record<string, THREE.AnimationAction> = {};
    for (const c of gltf.animations) if (["idle", "walk", "run"].includes(c.name)) { const a = mixer.clipAction(c); a.play(); a.setEffectiveWeight(0); actions[c.name] = a; }
    return { obj, mixer, actions, bones };
  }, [gltf]);
  // deterministic: set clip times & weights, evaluate, then layer manual poses
  for (const [n, a] of Object.entries(actions)) {
    const w = n === clip ? 1 - blend : n === blendTo ? blend : 0;
    a.setEffectiveWeight(w); a.time = t % a.getClip().duration;
  }
  mixer.update(0);
  const rot = (b: string, x: number, y: number, z: number) => { const bn = bones[b]; if (!bn) return; const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(x * poseK, y * poseK, z * poseK)); bn.quaternion.multiply(q); };
  if (pose === "reachUp") { rot("mixamorigRightArm", 0, 0, -1.25); rot("mixamorigLeftArm", 0, 0, 1.9); rot("mixamorigRightForeArm", 0, 0, -0.2); rot("mixamorigLeftForeArm", 0, 0, 0.2); rot("mixamorigSpine1", -0.15, 0, 0); rot("mixamorigHead", -0.35, 0, 0); }
  if (pose === "reachR") { rot("mixamorigHead", -0.4, 0, 0); rot("mixamorigRightArm", 0, 0, -1.9); rot("mixamorigRightForeArm", 0, 0, -0.25); }
  if (pose === "sit") { rot("mixamorigLeftUpLeg", -1.45, 0, 0); rot("mixamorigRightUpLeg", -1.45, 0, 0); rot("mixamorigLeftLeg", 1.45, 0, 0); rot("mixamorigRightLeg", 1.45, 0, 0); rot("mixamorigRightArm", 0.9, 0, 0.6); rot("mixamorigLeftArm", 0.9, 0, -0.6); rot("mixamorigRightForeArm", 0, -0.9, 0); rot("mixamorigLeftForeArm", 0, 0.9, 0); rot("mixamorigSpine", 0.15, 0, 0); }
  if (pose === "lean") { rot("mixamorigSpine", 0.25, 0, 0); rot("mixamorigHead", 0.25, 0, 0); rot("mixamorigRightArm", 0.9, 0, 0.5); rot("mixamorigRightForeArm", 0, -1.1, 0); }
  if (pose === "hold") { rot("mixamorigRightArm", 0.5, 0, 0.35); rot("mixamorigRightForeArm", 0, -1.6, 0); rot("mixamorigLeftArm", 0.5, 0, -0.35); rot("mixamorigLeftForeArm", 0, 1.6, 0); rot("mixamorigHead", 0.35, 0, 0); }
  const y = pose === "sit" ? p[1] - 0.42 * poseK : p[1];
  const bx = p[0] - Math.sin(ry) * 0.9, bz = p[2] - Math.cos(ry) * 0.9;
  return (
    <group>
      <primitive object={obj} position={[p[0], y, p[2]]} rotation={[0, ry, 0]} />
      <pointLight position={[bx, y + 2.0, bz]} intensity={3.5} distance={3.2} color="#9fb4ff" />
    </group>
  );
};

export const useF = () => useCurrentFrame();
