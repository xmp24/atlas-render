import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame } from "remotion";
import { Killer, useBot, Rig, Box, TX } from "./Kit3";
export const Test3: React.FC = () => {
  const f = useCurrentFrame(); const g = useBot();
  return (
    <ThreeCanvas width={1080} height={1920} shadows style={{ background: "#334" }} camera={{ fov: 40, position: [0, 1.4, 7] }}>
      <Rig pos={[0, 1.6, 9.5]} look={[0, 1.0, 0]} fov={42} />
      <ambientLight intensity={0.5} /><directionalLight position={[3, 6, 4]} intensity={2} castShadow />
      <Box p={[0, -0.05, 0]} s={[12, 0.1, 12]} map={TX.wood(4, 4)} />
      <Box p={[0, 2, -2]} s={[12, 4, 0.1]} map={TX.wallpaper("#9aa5b8", "#8f9aad")} />
      {g && <>
        <Killer gltf={g} clip="walk" t={f / 30} p={[-1.5, 0, -1]} ry={0.6} />
        <Killer gltf={g} clip="idle" t={f / 30} p={[-0.7, 0, 0]} />
        <Killer gltf={g} clip="idle" t={f / 30} p={[0.7, 0, 0]} pose="reachUp" />
        <Killer gltf={g} clip="idle" t={f / 30} p={[1.5, 0.45, 1]} pose="sit" ry={-0.5} />
        <Killer gltf={g} clip="idle" t={f / 30} p={[0, 0, 2]} pose="hold" poseK={0.8} />
      </>}
    </ThreeCanvas>
  );
};
