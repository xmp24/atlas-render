import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { Rig } from "../Miya3/Kit3";
import { ReiRoom7, Stairs7, Living7, Bath7, Office7 } from "./Rooms7";
export const CAMS: Record<string, { pos: [number, number, number]; look: [number, number, number]; fov: number }> = {
  rei: { pos: [0.9, 1.4, 2.45], look: [-0.2, 0.85, -2.2], fov: 66 },
  stairs: { pos: [-1.35, 1.25, 3.7], look: [0.35, 1.9, 0], fov: 62 },
  living: { pos: [-1.5, 1.55, 2.5], look: [0.6, 1.15, -2.4], fov: 58 },
  bath: { pos: [1.45, 1.55, 1.75], look: [-0.2, 1.05, -1.8], fov: 62 },
  office: { pos: [1.55, 1.42, 1.15], look: [-0.1, 0.95, -1.8], fov: 60 },
};
export const Bake: React.FC<{ room: string }> = ({ room }) => {
  const c = CAMS[room];
  const R = { rei: ReiRoom7, stairs: Stairs7, living: Living7, bath: Bath7, office: Office7 }[room] as React.FC;
  return (
    <ThreeCanvas width={1080} height={1920} shadows="soft" style={{ background: "#000" }} camera={{ fov: c.fov, position: c.pos, near: 0.05, far: 60 }} gl={{ antialias: true, preserveDrawingBuffer: true }}>
      <Rig pos={c.pos} look={c.look} fov={c.fov} />
      <fog attach="fog" args={["#0b0a0c", 7, 16]} />
      <R />
    </ThreeCanvas>
  );
};
