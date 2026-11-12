import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { continueRender, delayRender, random, staticFile } from "remotion";
import { Box, Cyl, Sph, HipRoof, Win3, Tree3, TX } from "./Kit3";

const ctex: Record<string, THREE.Texture> = {};
export const textTex = (key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
  if (ctex[key]) return ctex[key];
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h; draw(cv.getContext("2d")!);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; ctex[key] = t; return t;
};
const Plane: React.FC<{ p: [number, number, number]; s: [number, number]; map?: THREE.Texture; c?: string; r?: [number, number, number]; e?: number; side?: boolean }> = ({ p, s, map, c = "#fff", r = [0, 0, 0], e = 0, side }) => (
  <mesh position={p} rotation={r} receiveShadow>
    <planeGeometry args={s} />
    <meshStandardMaterial map={map} color={map ? "#fff" : c} emissive={e ? "#fff" : "#000"} emissiveMap={e ? map : undefined} emissiveIntensity={e} roughness={0.9} side={side ? THREE.DoubleSide : THREE.FrontSide} />
  </mesh>
);

export const usePhotoTex = (file: string) => {
  const [t, setT] = useState<THREE.Texture | null>(null);
  const [h] = useState(() => delayRender("photo " + file));
  useEffect(() => { new THREE.TextureLoader().loadAsync(staticFile(file)).then((x) => { x.colorSpace = THREE.SRGBColorSpace; setT(x); continueRender(h); }); }, [file, h]);
  return t;
};

// ---------- sky / city ----------
const Stars: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry(); const v: number[] = [];
    for (let i = 0; i < 500; i++) { const a = random("sa" + i) * Math.PI - Math.PI / 2, e = 0.15 + random("se" + i) * 1.2; v.push(Math.sin(a) * 90, 10 + Math.sin(e) * 80, -Math.cos(a) * 90); }
    g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3)); return g;
  }, []);
  return <points geometry={geo}><pointsMaterial color="#ffffff" size={0.35} sizeAttenuation /></points>;
};
const winTex = (lit: number) => textTex("bw" + lit, 64, 128, (c) => {
  c.fillStyle = "#151c33"; c.fillRect(0, 0, 64, 128);
  for (let r = 0; r < 10; r++) for (let q = 0; q < 4; q++) { c.fillStyle = random(`cw${lit}${r}${q}`) > 0.6 ? "#ffd27a" : "#1f2a48"; c.fillRect(4 + q * 15, 4 + r * 12, 9, 7); }
});
export const City: React.FC<{ night?: boolean }> = ({ night = true }) => (
  <group>
    {Array.from({ length: 26 }).map((_, i) => {
      const x = -60 + i * 4.8 + random("cx" + i) * 2, h = 10 + random("ch" + i) * 26, w = 3 + random("cw" + i) * 3, t = winTex(i % 4);
      return (
        <mesh key={i} position={[x, h / 2, -55 - random("cz" + i) * 15]}>
          <boxGeometry args={[w, h, 3]} />
          <meshStandardMaterial color={night ? "#ffffff" : "#9fb3c8"} map={night ? t : undefined} emissive={night ? "#ffffff" : "#000"} emissiveMap={night ? t : undefined} emissiveIntensity={night ? 0.6 : 0} />
        </mesh>
      );
    })}
  </group>
);
export const NightSky: React.FC = () => (
  <group>
    <color attach="background" args={["#0a1026"]} />
    <fog attach="fog" args={["#0e1630", 18, 80]} />
    <Stars />
    <mesh position={[22, 30, -70]}><sphereGeometry args={[3.2, 32, 16]} /><meshBasicMaterial color="#f3e9c4" /></mesh>
    <hemisphereLight args={["#5a6fa8", "#151820", 0.55]} />
    <directionalLight position={[22, 30, -20]} intensity={0.55} color="#9fb4ff" castShadow shadow-bias={-0.0008} shadow-normalBias={0.04} shadow-mapSize={[1024, 1024]} shadow-camera-left={-15} shadow-camera-right={15} shadow-camera-top={15} shadow-camera-bottom={-15} />
  </group>
);

// ---------- the Miyazawa house (front faces +z) ----------
export const House3: React.FC<{ f: number; lit?: number; night?: boolean }> = ({ f, lit = 1, night = true }) => {
  const pl = TX.plaster(night ? "#cfd2dc" : "#efede6", 3, 3);
  return (
    <group>
      {/* main block */}
      <Box p={[-1.25, 2.8, 0]} s={[5.5, 5.6, 6]} map={pl} />
      <HipRoof p={[-1.25, 5.6, 0]} w={6.3} d={6.8} h={1.7} />
      <Box p={[-1.25, 5.62, 0]} s={[6.3, 0.12, 6.8]} c="#2a2c31" />
      {[-2.6, 0.2].map((x) => <Box key={x} p={[x, 6.35, 1.4]} s={[0.35, 0.4, 0.35]} c="#7a2a1f" />)}
      {/* annex */}
      <Box p={[3.15, 2.6, -0.3]} s={[3.6, 5.2, 5]} map={TX.plaster(night ? "#c4c7d1" : "#e6e3da", 2, 3)} />
      <HipRoof p={[3.15, 5.2, -0.3]} w={4.2} d={5.6} h={1.3} />
      <Box p={[3.15, 5.22, -0.3]} s={[4.2, 0.12, 5.6]} c="#2a2c31" />
      {/* front windows (z = 3.02 / annex 2.22) */}
      <Win3 p={[-2.6, 1.6, 3.04]} w={1.9} h={1.3} lit={lit} curtain="#b4532c" f={f} />
      <Win3 p={[-2.9, 4.2, 3.04]} w={1.2} h={1.1} lit={lit} curtain="#6b3fa0" f={f} />
      <Win3 p={[-0.5, 4.2, 3.04]} w={1.6} h={1.2} lit={lit} curtain="#2f5fa8" f={f} />
      <Win3 p={[2.3, 4.0, 2.24]} w={1.1} h={1.1} lit={lit * 0} f={f} />
      <Win3 p={[4.0, 4.0, 2.24]} w={1.1} h={1.1} lit={lit} curtain="#3b6b4a" f={f} />
      {/* balcony */}
      <Box p={[3.15, 2.85, 2.75]} s={[3.4, 0.12, 1.0]} c="#f4f4f4" />
      <Box p={[3.15, 3.45, 3.24]} s={[3.4, 0.06, 0.06]} c="#f4f4f4" />
      {Array.from({ length: 18 }).map((_, i) => <Box key={i} p={[1.55 + i * 0.19, 3.15, 3.24]} s={[0.03, 0.6, 0.03]} c="#f4f4f4" cast={false} />)}
      <Box p={[3.8, 1.1, 2.24]} s={[0.95, 2.1, 0.08]} c="#4a3022" />
      {/* entrance */}
      <Box p={[0.6, 1.08, 3.04]} s={[1.0, 2.15, 0.1]} c="#3a2519" />
      <Box p={[0.35, 1.08, 3.1]} s={[0.4, 2.0, 0.02]} c="#4a3022" /><Box p={[0.85, 1.08, 3.1]} s={[0.4, 2.0, 0.02]} c="#4a3022" />
      <Box p={[0.6, 2.35, 3.4]} s={[1.6, 0.08, 0.8]} c="#2a2c31" />
      <Sph p={[1.3, 2.0, 3.12]} r={0.09} c="#fff2c2" e="#ffd27a" ei={night ? 3 * lit : 0} />
      {night && lit > 0 && <pointLight position={[1.3, 2.0, 3.5]} intensity={2.2} distance={5} color="#ffcf7a" />}
      {/* gutters & pipes */}
      <Cyl p={[-3.95, 2.8, 3.0]} r1={0.05} h={5.6} c="#5d6270" />
      <Cyl p={[4.9, 2.6, 2.2]} r1={0.05} h={5.2} c="#5d6270" />
      {/* AC unit on the side wall */}
      <Box p={[-4.25, 0.45, 1.2]} s={[0.4, 0.7, 0.9]} c="#e6e6e2" />
      <Cyl p={[-4.46, 0.45, 1.2]} r1={0.24} h={0.04} c="#9a9a96" rot={[0, 0, Math.PI / 2]} />
      {/* red car (like the aerial photo) */}
      <group position={[3.2, 0, 4.4]} rotation={[0, Math.PI / 2, 0]}>
        <Box p={[0, 0.55, 0]} s={[4.0, 0.7, 1.7]} c="#a3141a" rough={0.35} metal={0.3} />
        <Box p={[-0.2, 1.15, 0]} s={[2.1, 0.6, 1.5]} c="#7f1015" rough={0.3} metal={0.3} />
        <Box p={[-0.2, 1.15, 0]} s={[2.0, 0.5, 1.52]} c="#141a26" rough={0.1} metal={0.5} />
        {[[-1.3, 0.85], [1.3, 0.85], [-1.3, -0.85], [1.3, -0.85]].map(([x, z], i) => <Cyl key={i} p={[x, 0.32, z]} r1={0.32} h={0.25} c="#111" rot={[Math.PI / 2, 0, 0]} />)}
      </group>
      {/* block wall + gate */}
      <Box p={[-4.4, 0.65, 5.6]} s={[6.6, 1.3, 0.25]} map={TX.blocks(6, 1)} />
      <Box p={[4.6, 0.65, 5.6]} s={[3.4, 1.3, 0.25]} map={TX.blocks(3, 1)} />
      <Box p={[-4.4, 1.33, 5.6]} s={[6.6, 0.06, 0.3]} c="#9a9a96" /><Box p={[4.6, 1.33, 5.6]} s={[3.4, 0.06, 0.3]} c="#9a9a96" />
      {Array.from({ length: 10 }).map((_, i) => <Box key={i} p={[-0.9 + i * 0.22, 0.6, 5.6]} s={[0.04, 1.1, 0.04]} c="#2b2d33" cast={false} />)}
      <Box p={[-1.1, 0.95, 5.75]} s={[0.35, 0.45, 0.15]} c="#b33a2e" />
      {/* ground: garden, street, sidewalk */}
      <Box p={[0, -0.05, 0]} s={[40, 0.1, 11]} map={TX.grass()} />
      <Box p={[0, -0.04, 6.4]} s={[60, 0.1, 1.4]} c="#8d8d8d" />
      <Box p={[0, -0.05, 11]} s={[60, 0.1, 8]} map={TX.asphalt()} />
      {Array.from({ length: 10 }).map((_, i) => <Box key={i} p={[-20 + i * 4.5, 0.01, 11]} s={[2, 0.02, 0.15]} c="#e8e8e8" cast={false} />)}
      {/* utility pole + wires */}
      <Cyl p={[6.3, 4.5, 7.2]} r1={0.14} r2={0.18} h={9} c="#6d6457" />
      <Box p={[6.3, 8.4, 7.2]} s={[1.6, 0.12, 0.12]} c="#6d6457" />
      {[-0.6, 0, 0.6].map((dx, i) => <mesh key={i} position={[-8 + dx, 8.0, 7.2]} rotation={[0, 0, Math.PI / 2 - 0.03]}><cylinderGeometry args={[0.012, 0.012, 28.6, 4]} /><meshBasicMaterial color="#0b0b0e" /></mesh>)}
      <Box p={[6.05, 6.8, 7.2]} s={[0.5, 0.6, 0.4]} c="#5b554c" />
      {/* street lamp */}
      <Cyl p={[-6, 2.5, 7.0]} r1={0.07} h={5} c="#3a3d46" />
      <Box p={[-5.55, 5.0, 7.0]} s={[1.0, 0.08, 0.12]} c="#3a3d46" />
      <Box p={[-5.1, 4.9, 7.0]} s={[0.4, 0.12, 0.25]} c="#3a3d46" e={night ? "#fff1c4" : undefined} ei={night ? 2.5 * (random(`sl${Math.floor(f / 3)}`) > 0.06 ? 1 : 0.3) : 0} />
      {night && <spotLight position={[-5.1, 4.8, 7.0]} angle={0.75} penumbra={0.6} intensity={60 * (random(`sl${Math.floor(f / 3)}`) > 0.06 ? 1 : 0.3)} distance={14} color="#ffd89a" castShadow shadow-bias={-0.0008} target-position={[-5.1, 0, 7.0]} />}
      {/* park trees behind */}
      {[[-7, -6], [-3, -8], [1, -7], [5, -6.5], [8, -8], [-9, 2], [9, 1]].map(([x, z], i) => <Tree3 key={i} p={[x, 0, z]} s={1.4} f={f} seed={"pt" + i} />)}
    </group>
  );
};

/** rear (park side) of the house, bathroom window upstairs, AC unit below, block fence */
export const Rear3: React.FC<{ f: number; open: number }> = ({ f, open }) => (
  <group>
    <Box p={[0, 2.8, 0]} s={[8, 5.6, 0.3]} map={TX.plaster("#c9ccd6", 4, 3)} />
    <HipRoof p={[0, 5.6, 1.5]} w={8.8} d={3.6} h={1.4} ridge={0.6} />
    <Win3 p={[-1.6, 4.05, -0.17]} w={1.0} h={1.0} ry={Math.PI} open={open} frame="#eeeeea" f={f} />
    <Win3 p={[1.6, 4.05, -0.17]} w={1.5} h={1.1} ry={Math.PI} lit={0} f={f} />
    <Win3 p={[1.5, 1.5, -0.17]} w={1.8} h={1.2} ry={Math.PI} lit={1} curtain="#c9542c" f={f} />
    <Cyl p={[3.9, 2.8, -0.2]} r1={0.05} h={5.6} c="#5d6270" />
    {/* AC unit (the step up) */}
    <group position={[-1.6, 0, -0.75]}>
      <Box p={[0, 0.55, 0]} s={[1.0, 0.75, 0.4]} c="#e8e8e4" />
      <Cyl p={[-0.12, 0.55, -0.21]} r1={0.26} h={0.03} c="#8f8f8b" rot={[Math.PI / 2, 0, 0]} />
      <group position={[-0.12, 0.55, -0.23]} rotation={[0, 0, f * 0.3]}>{[0, 1, 2].map((i) => <Box key={i} p={[0, 0.1, 0]} s={[0.06, 0.2, 0.01]} c="#555" r={[0, 0, (i * 2 * Math.PI) / 3]} cast={false} />)}</group>
      <Box p={[0, 0.08, 0]} s={[1.0, 0.16, 0.4]} c="#666" />
      <Cyl p={[0.42, 1.6, 0.05]} r1={0.04} h={2.1} c="#eeeeea" />
    </group>
    {/* fly screen on the ground */}
    {open > 0.5 && <Box p={[-1.9, 0.03, -1.4]} s={[0.9, 0.02, 0.9]} c="#8a939c" r={[0, 0.4, 0]} op={0.8} />}
    {/* fence */}
    <Box p={[0, 0.8, -2.2]} s={[14, 1.6, 0.22]} map={TX.blocks(10, 2)} />
    <Box p={[0, 1.62, -2.2]} s={[14, 0.06, 0.28]} c="#9a9a96" />
    <Box p={[0, -0.05, 0]} s={[40, 0.1, 40]} map={TX.grass()} />
    <Box p={[0, -0.03, -4.2]} s={[40, 0.08, 1.6]} c="#4a4540" />
    {[[-6, -7], [-2, -9], [3, -7.5], [7, -9], [10, -6]].map(([x, z], i) => <Tree3 key={i} p={[x, 0, z]} s={1.3} f={f} seed={"rt" + i} />)}
    <Cyl p={[4.5, 1.6, -4.0]} r1={0.05} h={3.2} c="#2a2e38" />
    <Sph p={[4.5, 3.25, -4.0]} r={0.18} c="#fff3c8" e="#fff1c4" ei={2} />
    <pointLight position={[4.5, 3.1, -4.0]} intensity={8} distance={9} color="#ffe2a8" />
  </group>
);

// ---------- interiors ----------
export const Room3: React.FC<{ w?: number; d?: number; h?: number; wall: string; stripe: string; floor?: THREE.Texture; children?: React.ReactNode; noBack?: boolean }> = ({ w = 5, d = 5, h = 2.6, wall, stripe, floor, children, noBack }) => {
  const wp = TX.wallpaper(wall, stripe, 6, 3);
  return (
    <group>
      <Box p={[0, -0.05, 0]} s={[w, 0.1, d]} map={floor ?? TX.wood(3, 3)} />
      <Box p={[0, h + 0.05, 0]} s={[w, 0.1, d]} c="#e9e5dc" />
      {!noBack && <Box p={[0, h / 2, -d / 2]} s={[w, h, 0.1]} map={wp} />}
      <Box p={[-w / 2, h / 2, 0]} s={[0.1, h, d]} map={wp} />
      <Box p={[w / 2, h / 2, 0]} s={[0.1, h, d]} map={wp} />
      {/* skirting + crown moulding + wainscot rail */}
      {!noBack && <><Box p={[0, 0.06, -d / 2 + 0.06]} s={[w, 0.12, 0.03]} c="#efe9dc" /><Box p={[0, h - 0.05, -d / 2 + 0.06]} s={[w, 0.1, 0.05]} c="#efe9dc" /><Box p={[0, 0.9, -d / 2 + 0.06]} s={[w, 0.04, 0.03]} c="#efe9dc" /></>}
      <Box p={[-w / 2 + 0.06, 0.06, 0]} s={[0.03, 0.12, d]} c="#efe9dc" /><Box p={[w / 2 - 0.06, 0.06, 0]} s={[0.03, 0.12, d]} c="#efe9dc" />
      {children}
    </group>
  );
};
const nightView = () => textTex("nv", 256, 256, (c) => {
  const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, "#0a1230"); g.addColorStop(1, "#1b2a55"); c.fillStyle = g; c.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 9; i++) { const h = 60 + random("nh" + i) * 110; c.fillStyle = "#16234a"; c.fillRect(i * 30, 256 - h, 26, h); for (let r = 0; r < 8; r++) if (random(`nw${i}${r}`) > 0.55) { c.fillStyle = "#ffd27a"; c.fillRect(i * 30 + 6, 256 - h + 8 + r * 14, 6, 6); } }
  c.fillStyle = "#efe6c4"; c.beginPath(); c.arc(196, 50, 16, 0, 7); c.fill();
});
export const WallWindow: React.FC<{ p: [number, number, number]; w?: number; h?: number; ry?: number; curtain?: string; f: number; open?: boolean }> = ({ p, w = 1.4, h = 1.3, ry = 0, curtain = "#2f5fa8", f, open }) => (
  <group position={p} rotation={[0, ry, 0]}>
    <Plane p={[0, 0, 0.06]} s={[w, h]} map={nightView()} e={0.9} />
    <Box p={[0, h / 2 + 0.05, 0.08]} s={[w + 0.14, 0.1, 0.08]} c="#f2ede3" /><Box p={[0, -h / 2 - 0.05, 0.1]} s={[w + 0.3, 0.06, 0.18]} c="#f2ede3" />
    <Box p={[-w / 2 - 0.05, 0, 0.08]} s={[0.1, h + 0.2, 0.08]} c="#f2ede3" /><Box p={[w / 2 + 0.05, 0, 0.08]} s={[0.1, h + 0.2, 0.08]} c="#f2ede3" />
    {!open && <><Box p={[0, 0, 0.09]} s={[0.05, h, 0.04]} c="#f2ede3" /><Box p={[0, 0, 0.09]} s={[w, 0.05, 0.04]} c="#f2ede3" /></>}
    <Box p={[-w / 2 - 0.15, -0.05, 0.16 + Math.sin(f / 15) * (open ? 0.08 : 0.01)]} s={[0.35, h + 0.4, 0.04]} c={curtain} r={[open ? Math.sin(f / 9) * 0.12 : 0, 0, 0]} />
    <Box p={[w / 2 + 0.15, -0.05, 0.16]} s={[0.35, h + 0.4, 0.04]} c={curtain} />
    <Cyl p={[0, h / 2 + 0.3, 0.2]} r1={0.025} h={w + 0.9} c="#6b4a33" rot={[0, 0, Math.PI / 2]} />
    <spotLight position={[0, 0.2, -0.6]} angle={0.7} penumbra={0.8} intensity={6} distance={6} color="#8fa6e8" target-position={[0, -1.2, 2.5]} />
  </group>
);
export const Pendant: React.FC<{ p: [number, number, number]; f: number; flicker?: boolean; on?: number }> = ({ p, f, flicker, on = 1 }) => {
  const k = flicker ? (random(`pf${Math.floor(f / 3)}`) > 0.1 ? 1 : 0.2) : 1;
  return (
    <group position={p}>
      <Cyl p={[0, 0.35, 0]} r1={0.01} h={0.7} c="#111" />
      <Cyl p={[0, 0, 0]} r1={0.08} r2={0.28} h={0.22} c="#151515" seg={24} />
      <Sph p={[0, -0.1, 0]} r={0.06} c="#fff" e="#ffe2a8" ei={3 * k * on} />
      <pointLight position={[0, -0.25, 0]} intensity={3.5 * k * on} distance={6} decay={2} color="#ffd9a0" castShadow shadow-mapSize={[512, 512]} />
    </group>
  );
};
const FrameOnWall: React.FC<{ p: [number, number, number]; s: [number, number]; map?: THREE.Texture | null; c?: string; ry?: number }> = ({ p, s, map, c = "#cfcfcf", ry = 0 }) => (
  <group position={p} rotation={[0, ry, 0]}>
    <Box p={[0, 0, 0]} s={[s[0] + 0.1, s[1] + 0.1, 0.04]} c="#3b2b20" />
    <Plane p={[0, 0, 0.025]} s={s} map={map ?? undefined} c={c} />
  </group>
);
const posterTex = () => textTex("poster", 128, 180, (c) => { c.fillStyle = "#11264d"; c.fillRect(0, 0, 128, 180); c.fillStyle = "#e3e3e3"; c.beginPath(); c.moveTo(64, 30); c.lineTo(84, 100); c.lineTo(64, 140); c.lineTo(44, 100); c.fill(); c.fillStyle = "#ff8a1e"; c.beginPath(); c.moveTo(56, 140); c.lineTo(72, 140); c.lineTo(64, 168); c.fill(); for (let i = 0; i < 14; i++) { c.fillStyle = "#fff"; c.fillRect(random("ps" + i) * 128, random("pt" + i) * 180, 2, 2); } });
const calTex = () => textTex("cal", 128, 170, (c) => { c.fillStyle = "#fff"; c.fillRect(0, 0, 128, 170); c.fillStyle = "#d8352a"; c.fillRect(0, 0, 128, 40); c.fillStyle = "#fff"; c.font = "bold 28px sans-serif"; c.textAlign = "center"; c.fillText("DEC", 64, 30); c.fillStyle = "#222"; c.font = "bold 70px sans-serif"; c.fillText("30", 64, 130); });
const screenTex = () => textTex("scr", 256, 192, (c) => { c.fillStyle = "#0a246a"; c.fillRect(0, 0, 256, 192); c.fillStyle = "#1f4bb5"; c.fillRect(0, 0, 256, 26); c.fillStyle = "#fff"; c.font = "bold 22px monospace"; c.textAlign = "center"; c.fillText("CONNECTED", 128, 80); c.fillStyle = "#ffd25a"; c.font = "bold 56px monospace"; c.fillText("01:18", 128, 150); });
const markerTex = () => textTex("mk1", 64, 64, (c) => { c.fillStyle = "#f2c94c"; c.fillRect(0, 0, 64, 64); c.fillStyle = "#111"; c.font = "bold 48px sans-serif"; c.textAlign = "center"; c.fillText("1", 32, 50); });
const kitTex = () => textTex("kit", 64, 64, (c) => { c.fillStyle = "#fafafa"; c.fillRect(0, 0, 64, 64); c.fillStyle = "#d8262b"; c.fillRect(24, 10, 16, 44); c.fillRect(10, 24, 44, 16); });

export const ReiRoom3: React.FC<{ f: number }> = ({ f }) => (
  <Room3 wall="#7c8faa" stripe="#71849f">
    <WallWindow p={[0.8, 1.5, -2.45]} curtain="#2f5fa8" f={f} />
    <FrameOnWall p={[-1.3, 1.7, -2.44]} s={[0.55, 0.75]} map={posterTex()} />
    {/* bed with blanket pulled off */}
    <group position={[-1.2, 0, -0.9]}>
      <Box p={[0, 0.22, 0]} s={[1.0, 0.18, 2.0]} c="#7a4a2a" /><Box p={[0, 0.5, -1.0]} s={[1.0, 0.8, 0.08]} c="#7a4a2a" />
      <Box p={[0, 0.38, 0.02]} s={[0.94, 0.16, 1.92]} c="#efefef" />
      <Box p={[0, 0.5, -0.75]} s={[0.6, 0.12, 0.35]} c="#ffffff" r={[0, 0.15, 0.05]} />
      <Box p={[0.55, 0.25, 0.6]} s={[0.15, 0.5, 1.0]} c="#3e5fa0" r={[0, 0, 0.2]} />
      <Box p={[0.85, 0.03, 0.9]} s={[0.7, 0.05, 0.8]} c="#3e5fa0" r={[0, 0.3, 0]} />
    </group>
    {/* desk + randoseru */}
    <Box p={[1.5, 0.72, -2.1]} s={[1.2, 0.05, 0.6]} c="#8a5a35" />
    {[[1.0, -2.3], [2.0, -2.3], [1.0, -1.9], [2.0, -1.9]].map(([x, z], i) => <Box key={i} p={[x, 0.36, z]} s={[0.05, 0.72, 0.05]} c="#5a3520" />)}
    <Box p={[1.3, 0.95, -2.15]} s={[0.36, 0.42, 0.24]} c="#1b1b1d" rough={0.4} />
    <Box p={[1.3, 1.02, -2.02]} s={[0.36, 0.2, 0.04]} c="#2a2a2e" rough={0.4} />
    <Cyl p={[1.85, 0.85, -2.2]} r1={0.06} h={0.25} c="#f2b22a" />
    {/* toys on a low shelf + floor */}
    <Box p={[-2.25, 0.4, 0.8]} s={[0.4, 0.8, 1.2]} c="#8a5a35" />
    {[[-2.2, 0.95, 0.5, "#e3262b"], [-2.2, 0.95, 0.9, "#2f7ad6"], [-2.2, 0.95, 1.2, "#f2b22a"]].map(([x, y, z, c], i) => <Box key={i} p={[x as number, y as number, z as number]} s={[0.2, 0.25, 0.2]} c={c as string} />)}
    <group position={[0.6, 0.06, 0.8]} rotation={[0, 0.5, 0]}><Sph p={[0, 0.1, 0]} r={0.12} c="#3f9a4a" s={[1.6, 1, 1]} /><Sph p={[0.2, 0.2, 0]} r={0.07} c="#3f9a4a" /></group>
    <group position={[-0.2, 0.05, 1.3]} rotation={[0, -0.3, 0]}><Box p={[0, 0.06, 0]} s={[0.3, 0.1, 0.15]} c="#d8262b" />{[-0.1, 0.1].map((x) => <Cyl key={x} p={[x, 0.04, 0.08]} r1={0.04} h={0.03} c="#111" rot={[Math.PI / 2, 0, 0]} />)}</group>
    {/* door ajar (dark gap) */}
    <Box p={[2.45, 1.0, 1.2]} s={[0.05, 2.0, 0.9]} c="#05070c" /><Box p={[2.2, 1.0, 0.95]} s={[0.05, 2.0, 0.9]} c="#a77a52" r={[0, -0.6, 0]} />
    <Pendant p={[0, 2.2, 0]} f={f} flicker on={0.75} />
  </Room3>
);

export const Stairs3: React.FC<{ f: number; photo: THREE.Texture | null }> = ({ f, photo }) => (
  <Room3 wall="#9c9282" stripe="#928878">
    {Array.from({ length: 12 }).map((_, i) => <group key={i}><Box p={[-2.0 + i * 0.36, 0.1 + i * 0.2, -1.9]} s={[0.36, 0.2 + i * 0.4, 1.0]} c="#8a6446" /><Box p={[-2.0 + i * 0.36, 0.2 + i * 0.2 + 0.005, -1.9]} s={[0.38, 0.02, 1.02]} c="#a97c58" /></group>)}
    {Array.from({ length: 12 }).map((_, i) => <Cyl key={i} p={[-2.0 + i * 0.36, 0.2 + i * 0.2 + 0.45, -1.42]} r1={0.02} h={0.9} c="#efe9dc" />)}
    <mesh position={[0.0, 1.95, -1.42]} rotation={[0, 0, Math.atan2(0.2, 0.36)]}><cylinderGeometry args={[0.035, 0.035, 5.0, 10]} /><meshStandardMaterial color="#6b4a33" /></mesh>
    {[[-1.6, 1.4], [-0.5, 1.9], [0.6, 2.2]].map(([x, y], i) => <FrameOnWall key={i} p={[x, y, -2.44]} s={[0.5, 0.38]} map={i === 1 ? photo : null} c={["#8fa3b8", "#ccc", "#b8a58f"][i]} />)}
    {/* broken blade tip + evidence marker */}
    <Box p={[-0.6, 1.02, -1.75]} s={[0.12, 0.012, 0.025]} c="#cfd6dc" metal={0.8} rough={0.25} r={[0, 0.4, 0]} />
    <mesh position={[-0.35, 1.08, -1.75]}><boxGeometry args={[0.12, 0.14, 0.1]} /><meshStandardMaterial map={markerTex()} /></mesh>
    <pointLight position={[1.8, 2.4, -1.6]} intensity={6} distance={6} color="#ffd59a" />
    <Pendant p={[-1.2, 2.2, 0.2]} f={f} flicker on={0.7} />
  </Room3>
);

export const Kitchen3: React.FC<{ f: number; ring?: number; fridgeOpen?: boolean }> = ({ f, ring = 0, fridgeOpen }) => (
  <Room3 wall="#9fac99" stripe="#9fac99" floor={TX.wood(3, 3, "#9b8a74")}>
    <Box p={[0, 1.2, -2.43]} s={[5, 0.6, 0.02]} map={TX.tiles("#e7e9e4", "#c3c8c0", 10, 2)} />
    {/* lower cabinets + counter */}
    <Box p={[-0.6, 0.45, -2.15]} s={[3.6, 0.9, 0.6]} c="#efe9dc" />
    {Array.from({ length: 6 }).map((_, i) => <group key={i}><Box p={[-2.25 + i * 0.6, 0.45, -1.84]} s={[0.56, 0.84, 0.02]} c="#f4efe4" /><Box p={[-2.05 + i * 0.6, 0.75, -1.82]} s={[0.12, 0.02, 0.02]} c="#999" /></group>)}
    <Box p={[-0.6, 0.92, -2.15]} s={[3.7, 0.05, 0.65]} c="#55595f" rough={0.4} />
    {/* upper cabinets */}
    {[0, 1, 2].map((i) => <group key={i}><Box p={[-2.0 + i * 0.75, 1.95, -2.28]} s={[0.72, 0.7, 0.35]} c="#efe9dc" /><Box p={[-1.7 + i * 0.75, 1.75, -2.1]} s={[0.02, 0.12, 0.02]} c="#999" /></group>)}
    <WallWindow p={[0.4, 1.75, -2.45]} w={0.9} h={0.7} curtain="#d6c27a" f={f} />
    {/* sink, tap */}
    <Box p={[0.4, 0.93, -2.1]} s={[0.7, 0.03, 0.45]} c="#c5c9cf" metal={0.6} rough={0.3} />
    <Cyl p={[0.4, 1.08, -2.32]} r1={0.02} h={0.28} c="#c5c9cf" />
    {/* rice cooker, kettle */}
    <Cyl p={[-1.9, 1.06, -2.15]} r1={0.16} h={0.24} c="#f4f1ea" />
    <Cyl p={[-1.3, 1.04, -2.15]} r1={0.1} r2={0.14} h={0.2} c="#b9bfc8" />
    {/* knife block with one empty slot */}
    <group position={[-0.7, 0.95, -2.2]} rotation={[0.25, 0, 0]}>
      <Box p={[0, 0.14, 0]} s={[0.2, 0.28, 0.14]} c="#6b4630" />
      {[-0.06, 0.06].map((x) => <Box key={x} p={[x, 0.33, 0]} s={[0.035, 0.12, 0.035]} c="#1a1a1a" />)}
      <Box p={[0, 0.285, 0]} s={[0.03, 0.01, 0.025]} c="#000" />
    </group>
    {ring > 0 && <mesh position={[-0.7, 1.25, -2.05]}><torusGeometry args={[0.24, 0.012, 8, 40]} /><meshBasicMaterial color="#ff2a2a" transparent opacity={ring * (0.6 + 0.4 * Math.sin(f / 4))} /></mesh>}
    {/* fridge */}
    <Box p={[2.0, 0.95, -2.1]} s={[0.75, 1.9, 0.7]} c="#ececec" rough={0.35} />
    {fridgeOpen ? (<>
      <Box p={[2.0, 0.95, -1.74]} s={[0.68, 1.82, 0.02]} c="#fff4c0" e="#fff1b0" ei={1.6} />
      {[0.5, 0.95, 1.4].map((y) => <Box key={y} p={[2.0, y, -1.8]} s={[0.66, 0.02, 0.6]} c="#e5ddb0" />)}
      <Box p={[2.55, 0.95, -1.4]} s={[0.04, 1.9, 0.72]} c="#e6e6e6" r={[0, -1.2, 0]} />
      <pointLight position={[2.0, 1.0, -1.3]} intensity={6} distance={4} color="#fff1c4" />
    </>) : <Box p={[1.72, 1.2, -1.74]} s={[0.03, 0.4, 0.03]} c="#bbb" />}
    <mesh position={[-2.44, 1.7, -1.2]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[0.32, 0.42]} /><meshStandardMaterial map={calTex()} /></mesh>
    <Pendant p={[-0.4, 2.2, -0.8]} f={f} flicker on={0.4} />
  </Room3>
);

export const Loft3: React.FC<{ f: number }> = ({ f }) => (
  <group>
    <Box p={[0, -0.05, 0]} s={[6, 0.1, 5]} map={TX.tatami()} />
    <mesh position={[-1.6, 1.3, 0]} rotation={[0, 0, -0.9]}><planeGeometry args={[4.2, 5]} /><meshStandardMaterial map={TX.wood(2, 4, "#6b543f")} side={THREE.DoubleSide} /></mesh>
    <mesh position={[1.6, 1.3, 0]} rotation={[0, 0, 0.9]}><planeGeometry args={[4.2, 5]} /><meshStandardMaterial map={TX.wood(2, 4, "#6b543f")} side={THREE.DoubleSide} /></mesh>
    {[-1.5, 0, 1.5].map((z) => <Box key={z} p={[0, 2.5, z]} s={[0.15, 0.15, 0.15]} c="#3a2d22" />)}
    <Box p={[0, 1.4, -2.5]} s={[6, 2.8, 0.1]} c="#7a6650" />
    <Cyl p={[0, 1.7, -2.44]} r1={0.38} h={0.04} c="#efe6d6" rot={[Math.PI / 2, 0, 0]} />
    <mesh position={[0, 1.7, -2.41]}><circleGeometry args={[0.32, 32]} /><meshStandardMaterial map={nightView()} emissive="#fff" emissiveMap={nightView()} emissiveIntensity={0.9} /></mesh>
    <spotLight position={[0, 1.7, -2.3]} angle={0.5} penumbra={0.7} intensity={22} distance={7} color="#9fb4ff" target-position={[0.3, 0, 0.8]} castShadow shadow-bias={-0.001} />
    <pointLight position={[0, 1.6, 1.6]} intensity={2.5} distance={5} color="#6f7fae" />
    {[-0.75, 0.75].map((x, i) => <group key={i} position={[x, 0, 0.3]}>
      <Box p={[0, 0.05, 0]} s={[0.9, 0.1, 2.0]} c="#f2f2f2" />
      <Box p={[0, 0.13, -0.8]} s={[0.55, 0.1, 0.3]} c="#ffffff" />
      <Box p={[0.15 + i * 0.1, 0.13, 0.4]} s={[0.85, 0.06, 1.1]} c={i ? "#e88aa6" : "#c9a36a"} r={[0, 0.3 - i * 0.5, 0]} />
    </group>)}
    <group position={[0.2, 0.12, 1.6]} rotation={[0, 0, 1.3]}><Sph p={[0, 0, 0]} r={0.12} c="#a26b3c" /><Sph p={[0, 0.16, 0]} r={0.09} c="#a26b3c" /></group>
    <Box p={[1.9, 0.0, 1.8]} s={[0.8, 0.02, 0.7]} c="#05070c" />
    <hemisphereLight args={["#40507a", "#0a0a0a", 0.9]} />
    <Cyl p={[1.6, 0.25, -1.2]} r1={0.12} h={0.5} c="#f4ead2" e="#ffcf8a" ei={0.6} />
    <pointLight position={[1.6, 0.45, -1.0]} intensity={3} distance={4} color="#ffc98a" />
  </group>
);

export const Living3: React.FC<{ f: number }> = ({ f }) => (
  <Room3 wall="#8d8577" stripe="#867e70">
    <WallWindow p={[0.9, 1.5, -2.45]} curtain="#c9542c" f={f} />
    {/* shelf + kagami mochi */}
    <Box p={[-1.4, 1.6, -2.35]} s={[1.4, 0.04, 0.25]} c="#6b4a33" />
    <Cyl p={[-1.7, 1.67, -2.35]} r1={0.12} h={0.07} c="#fbf8f1" /><Cyl p={[-1.7, 1.75, -2.35]} r1={0.09} h={0.07} c="#fbf8f1" /><Sph p={[-1.7, 1.83, -2.35]} r={0.045} c="#f2a53a" />
    {[0, 1, 2].map((i) => <Box key={i} p={[-1.2 + i * 0.12, 1.75, -2.35]} s={[0.08, 0.26, 0.18]} c={["#2f5fa8", "#e3262b", "#f2b22a"][i]} />)}
    {/* wall clock */}
    <group position={[-1.4, 2.1, -2.42]}>
      <Cyl p={[0, 0, 0]} r1={0.2} h={0.04} c="#f4f1ea" rot={[Math.PI / 2, 0, 0]} />
      <Box p={[Math.sin(f / 40) * 0.05, Math.cos(f / 40) * 0.05, 0.03]} s={[0.02, 0.11, 0.01]} c="#111" r={[0, 0, -f / 40]} />
      <Box p={[Math.sin(f / 4) * 0.07, Math.cos(f / 4) * 0.07, 0.035]} s={[0.012, 0.15, 0.01]} c="#d32" r={[0, 0, -f / 4]} />
    </group>
    {/* CRT TV */}
    <Box p={[-1.5, 0.3, -2.1]} s={[1.2, 0.6, 0.5]} c="#5a3d27" />
    <Box p={[-1.5, 0.88, -2.1]} s={[0.75, 0.56, 0.55]} c="#2c2c30" />
    <Box p={[-1.55, 0.88, -1.82]} s={[0.55, 0.42, 0.01]} c="#0d1016" rough={0.1} metal={0.3} />
    {/* sofa */}
    <group position={[1.1, 0, -0.6]} rotation={[0, -0.25, 0]}>
      <Box p={[0, 0.25, 0]} s={[1.9, 0.5, 0.85]} c="#6e2c26" />
      <Box p={[0, 0.7, -0.35]} s={[1.9, 0.6, 0.2]} c="#5c241f" />
      <Box p={[-0.95, 0.45, 0]} s={[0.2, 0.5, 0.85]} c="#5c241f" /><Box p={[0.95, 0.45, 0]} s={[0.2, 0.5, 0.85]} c="#5c241f" />
    </group>
    {/* kotatsu */}
    <Box p={[-0.2, 0.36, 0.6]} s={[1.0, 0.04, 0.8]} c="#7a4a2a" />
    <Box p={[-0.2, 0.2, 0.6]} s={[1.2, 0.3, 1.0]} c="#b4532c" />
    {[[-0.35, 0.55], [-0.2, 0.62], [-0.05, 0.55]].map(([x, z], i) => <Sph key={i} p={[x, 0.43, z]} r={0.06} c="#f39a2b" />)}
    {/* plant */}
    <Cyl p={[2.1, 0.2, -2.0]} r1={0.16} r2={0.12} h={0.4} c="#b4532c" />
    {[0, 1, 2, 3, 4].map((i) => <Sph key={i} p={[2.1 + Math.sin(i * 1.3) * 0.18, 0.6 + (i % 3) * 0.12, -2.0 + Math.cos(i * 1.3) * 0.18]} r={0.14} c="#3f7a3a" s={[1.4, 0.5, 0.8]} />)}
    <Pendant p={[0, 2.2, 0]} f={f} on={0} />
  </Room3>
);

export const Bath3: React.FC<{ f: number }> = ({ f }) => (
  <Room3 wall="#9fb7c2" stripe="#9fb7c2" floor={TX.tiles("#8aa2ad", "#71878f", 6, 6)}>
    <Box p={[0, 1.0, -2.43]} s={[5, 2.0, 0.02]} map={TX.tiles("#cfe0e6", "#a9bcc3", 12, 5)} />
    <WallWindow p={[-1.5, 1.7, -2.45]} w={0.8} h={0.8} curtain="#e9eef0" f={f} open />
    {/* mirror cabinet, sink */}
    <Box p={[0.6, 1.65, -2.4]} s={[0.9, 0.9, 0.1]} c="#c9d6db" />
    <Box p={[0.6, 1.65, -2.34]} s={[0.8, 0.8, 0.01]} c="#a9c4d0" metal={0.9} rough={0.05} />
    <Box p={[0.6, 0.85, -2.2]} s={[0.8, 0.12, 0.45]} c="#ffffff" rough={0.2} />
    <Box p={[0.6, 0.4, -2.3]} s={[0.25, 0.8, 0.25]} c="#f4f4f4" />
    <Cyl p={[0.6, 1.0, -2.36]} r1={0.02} h={0.2} c="#c5c9cf" />
    {/* first aid kit open on the counter */}
    <mesh position={[1.25, 0.98, -2.15]}><boxGeometry args={[0.32, 0.2, 0.22]} /><meshStandardMaterial map={kitTex()} /></mesh>
    <Box p={[1.25, 1.12, -2.3]} s={[0.32, 0.02, 0.22]} c="#f0f0f0" r={[-1.1, 0, 0]} />
    <Box p={[1.0, 0.93, -2.0]} s={[0.12, 0.02, 0.05]} c="#ffffff" />
    <Box p={[2.3, 1.3, -1.5]} s={[0.05, 0.7, 0.4]} c="#f2b22a" />
    <Pendant p={[0.4, 2.2, -1.2]} f={f} flicker on={0.6} />
  </Room3>
);

export const Office3: React.FC<{ f: number }> = ({ f }) => (
  <Room3 wall="#7f8a76" stripe="#76816d">
    <WallWindow p={[1.4, 1.6, -2.45]} curtain="#3b6b4a" f={f} />
    {/* bookshelf */}
    <Box p={[-1.9, 1.0, -2.25]} s={[0.9, 2.0, 0.35]} c="#6b4a33" />
    {[0, 1, 2, 3].map((r) => Array.from({ length: 6 }).map((_, i) => <Box key={`${r}${i}`} p={[-2.25 + i * 0.13, 0.35 + r * 0.45, -2.2]} s={[0.1, 0.3, 0.22]} c={["#b8473a", "#3d6fb5", "#e3b04b", "#4d8a57", "#e9e1d0"][(i + r) % 5]} />))}
    {/* desk, CRT, keyboard, chair */}
    <Box p={[0, 0.74, -1.9]} s={[1.6, 0.05, 0.7]} c="#8a5a35" />
    {[[-0.7, -2.15], [0.7, -2.15], [-0.7, -1.65], [0.7, -1.65]].map(([x, z], i) => <Box key={i} p={[x, 0.37, z]} s={[0.05, 0.74, 0.05]} c="#5a3520" />)}
    <Box p={[0, 1.06, -2.05]} s={[0.55, 0.45, 0.45]} c="#ddd6c3" />
    <mesh position={[0, 1.08, -1.82]}><planeGeometry args={[0.44, 0.33]} /><meshStandardMaterial map={screenTex()} emissive="#fff" emissiveMap={screenTex()} emissiveIntensity={1.2} /></mesh>
    <pointLight position={[0, 1.1, -1.5]} intensity={2.5 + 0.3 * Math.sin(f / 2)} distance={3.5} color="#8fbfff" />
    <Box p={[0, 0.78, -1.65]} s={[0.5, 0.03, 0.16]} c="#e9e3d2" />
    <Box p={[0.65, 0.9, -2.05]} s={[0.2, 0.42, 0.42]} c="#d9d2c0" />
    <Box p={[0, 0.46, -1.15]} s={[0.5, 0.06, 0.5]} c="#2a2d35" />
    <Cyl p={[0, 0.23, -1.15]} r1={0.03} h={0.46} c="#222" />
    <Pendant p={[-1.2, 2.2, 0]} f={f} on={0} />
  </Room3>
);

/** police car with flashing light bar */
export const Police3: React.FC<{ p: [number, number, number]; ry?: number; f: number }> = ({ p, ry = 0, f }) => {
  const on = Math.floor(f / 5) % 2;
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <Box p={[0, 0.55, 0]} s={[4.2, 0.7, 1.75]} c="#f4f4f4" rough={0.35} metal={0.2} />
      <Box p={[0, 0.5, 0.88]} s={[4.2, 0.25, 0.02]} c="#111" /><Box p={[0, 0.5, -0.88]} s={[4.2, 0.25, 0.02]} c="#111" />
      <Box p={[-0.2, 1.15, 0]} s={[2.2, 0.6, 1.55]} c="#111" rough={0.2} metal={0.4} />
      <Box p={[-0.2, 1.5, -0.25]} s={[0.4, 0.12, 0.3]} c="#ff2020" e="#ff2020" ei={on ? 4 : 0.3} />
      <Box p={[-0.2, 1.5, 0.25]} s={[0.4, 0.12, 0.3]} c="#2050ff" e="#2050ff" ei={on ? 0.3 : 4} />
      <pointLight position={[-0.2, 1.8, 0]} intensity={on ? 12 : 3} distance={10} color={on ? "#ff3030" : "#3060ff"} />
      {[[-1.4, 0.88], [1.4, 0.88], [-1.4, -0.88], [1.4, -0.88]].map(([x, z], i) => <Cyl key={i} p={[x, 0.32, z]} r1={0.32} h={0.25} c="#111" rot={[Math.PI / 2, 0, 0]} />)}
    </group>
  );
};
export const Tape3: React.FC<{ p: [number, number, number]; len: number }> = ({ p, len }) => {
  const t = textTex("tape", 512, 48, (c) => { c.fillStyle = "#f2c94c"; c.fillRect(0, 0, 512, 48); c.fillStyle = "#111"; c.font = "bold 30px sans-serif"; for (let i = 0; i < 4; i++) c.fillText("POLICE LINE", 10 + i * 130, 35); });
  t.wrapS = THREE.RepeatWrapping; t.repeat.set(len / 3, 1);
  return <mesh position={p}><planeGeometry args={[len, 0.14]} /><meshStandardMaterial map={t} side={THREE.DoubleSide} /></mesh>;
};
