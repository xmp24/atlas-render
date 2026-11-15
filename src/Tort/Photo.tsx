import React, { useLayoutEffect } from "react";
import * as THREE from "three";
import { AbsoluteFill, Img, interpolate, random, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { W, H, clamp, ez } from "./Common";
import PC from "./photocams.json";

export type PCam = { pos: number[]; quat: number[]; fov: number; size: number[]; f: number; shiftY: number; hy: number };
export const PCAMS = PC as unknown as Record<string, PCam>;

const PhotoCam: React.FC<{ c: PCam; exp: number }> = ({ c, exp }) => {
  const { camera, gl } = useThree();
  useLayoutEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = exp;
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(c.pos[0], c.pos[1], c.pos[2]); cam.quaternion.set(c.quat[0], c.quat[1], c.quat[2], c.quat[3]); cam.fov = c.fov;
    if (c.shiftY) cam.setViewOffset(c.size[0], c.size[1], 0, c.shiftY, c.size[0], c.size[1]); else cam.clearViewOffset();
    cam.aspect = c.size[0] / c.size[1]; cam.updateProjectionMatrix();
  });
  return null;
};
const flick = (f: number, i: number) => 1 + Math.sin(f / 2.1 + i * 2) * 0.08 + (random("pf" + i + Math.floor(f / 2)) - 0.5) * 0.16;

/** px = photo pixel coords of torches/fires [x, y, size] to animate */
export type Fire = [number, number, number];

/**
 * A photo used as a set: scaled to cover the frame (width-based), slow 2.5D drift (z zoom + pan c0->c1 in photo-normalised coords),
 * a transparent three.js canvas with the calibrated camera on top for the stickmen, flame flicker on the photo's torches, drifting mist and dust.
 */
export const PhotoShot: React.FC<{ f: number; len: number; img: string; cam: PCam; z?: [number, number]; c0?: [number, number]; c1?: [number, number]; fire?: Fire[]; exp?: number; tint?: string; mist?: number; dust?: number; floorY?: number; children?: React.ReactNode; over?: React.ReactNode }> = ({ f, len, img, cam, z = [1.05, 1.12], c0 = [0.5, 0.55], c1, fire = [], exp = 1.05, tint, mist = 1, dust = 1, floorY = 0.7, children, over }) => {
  const W0 = W * 1.0, H0 = Math.round(W0 * cam.size[1] / cam.size[0]), sc = W0 / cam.size[0];
  const k = ez(interpolate(f, [0, Math.max(1, len)], [0, 1], clamp)), zz = z[0] + (z[1] - z[0]) * k;
  const cc = c1 ? [c0[0] + (c1[0] - c0[0]) * k, c0[1] + (c1[1] - c0[1]) * k] : c0;
  let left = W / 2 - cc[0] * W0 * zz, top = H / 2 - cc[1] * H0 * zz;
  left = Math.min(0, Math.max(W - W0 * zz, left)); top = Math.min(0, Math.max(H - H0 * zz, top));
  return <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
    <div style={{ position: "absolute", left, top, width: W0, height: H0, transform: `scale(${zz})`, transformOrigin: "0 0" }}>
      <Img src={staticFile(img)} style={{ position: "absolute", width: W0, height: H0 }} />
      {/* light breathing from the photo's own fires */}
      {fire.map(([x, y, s], i) => { const fl = flick(f, i), X = x * sc, Y = y * sc, S = s * sc; return <React.Fragment key={i}>
        <div style={{ position: "absolute", left: X - S * 8, top: Y - S * 8, width: S * 16, height: S * 16, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,170,80,0.28), rgba(255,120,40,0.07) 45%, transparent 70%)", mixBlendMode: "screen", opacity: 0.6 + (fl - 1) * 3 }} />
        <div style={{ position: "absolute", left: X - S * 0.5 * fl, top: Y - S * 1.7 * fl, width: S * fl, height: S * 2 * fl, borderRadius: "50% 50% 45% 45% / 65% 65% 35% 35%", background: "radial-gradient(ellipse at 50% 72%, rgba(255,248,220,0.9) 0%, rgba(255,208,112,0.7) 30%, rgba(255,120,40,0.25) 60%, transparent 75%)", mixBlendMode: "screen", filter: "blur(1px)" }} />
      </React.Fragment>; })}
      <ThreeCanvas width={W0} height={H0} shadows="soft" style={{ position: "absolute" }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} camera={{ fov: cam.fov, near: 0.05, far: 80 }}>
        <PhotoCam c={cam} exp={exp} />
        {children}
      </ThreeCanvas>
      {/* mist along the floor + dust motes in the light */}
      {mist > 0 && Array.from({ length: 6 }).map((_, i) => { const x = ((random("mg" + i) * 1.6 - 0.3 + f * 0.0008 * (0.6 + random("mv" + i))) % 1.6) - 0.3; return <div key={"m" + i} style={{ position: "absolute", left: x * W0, top: (floorY + random("my" + i) * 0.2) * H0, width: W0 * 0.5, height: H0 * 0.14, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(180,170,160,0.12), transparent 70%)", filter: "blur(12px)", opacity: mist }} />; })}
      {dust > 0 && Array.from({ length: 26 }).map((_, i) => { const q = (f * 0.0015 * (0.5 + random("dv" + i)) + random("dq" + i)) % 1; return <div key={"d" + i} style={{ position: "absolute", left: (random("dx" + i) * W0 + Math.sin(f / 50 + i) * 20), top: (random("dy" + i) * 0.8 + 0.1 - q * 0.1) * H0, width: 3, height: 3, borderRadius: 2, background: "rgba(255,230,190,0.55)", opacity: Math.sin(q * Math.PI) * dust * 0.8 }} />; })}
      {tint && <AbsoluteFill style={{ background: tint, mixBlendMode: "multiply" }} />}
      {over}
    </div>
  </AbsoluteFill>;
};
/** soft shadow catcher on the photo's floor */
export const Catcher: React.FC<{ p: [number, number, number]; s: [number, number]; o?: number }> = ({ p, s, o = 0.5 }) => <mesh position={p} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={s} /><shadowMaterial transparent opacity={o} /></mesh>;
/** an invisible box that hides 3D parts behind real photo objects */
export const Occluder: React.FC<{ p: [number, number, number]; s: [number, number, number]; r?: [number, number, number] }> = ({ p, s, r }) => <mesh position={p} rotation={r} renderOrder={-1}><boxGeometry args={s} /><meshBasicMaterial colorWrite={false} /></mesh>;
const DirLight: React.FC<{ p: [number, number, number]; t: [number, number, number]; i: number; col: string }> = ({ p, t, i, col }) => {
  const ref = React.useRef<THREE.DirectionalLight>(null);
  useLayoutEffect(() => { const l = ref.current; if (!l) return; l.target.position.set(t[0], t[1], t[2]); l.target.updateMatrixWorld(); l.shadow.camera.updateProjectionMatrix(); });
  return <directionalLight ref={ref} position={p} intensity={i} color={col} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} shadow-camera-far={60} shadow-bias={-0.0004} />;
};
/** key light matched to the photo + fill */
export const PhotoLights: React.FC<{ key1: [number, number, number]; tgt: [number, number, number]; col?: string; i?: number; amb?: number; ambCol?: string }> = ({ key1, tgt, col = "#ffb070", i = 1.6, amb = 0.35, ambCol = "#8a7a90" }) => <>
  <ambientLight intensity={amb} color={ambCol} />
  <hemisphereLight args={["#c8a888", "#1a120a", 0.35]} />
  <DirLight p={key1} t={tgt} i={i} col={col} />
</>;
