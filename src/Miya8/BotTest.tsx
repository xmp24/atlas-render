import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame } from "remotion";
import { Rig, Box, TX } from "../Miya3/Kit3";
import { Bot, Aura, STAND, TYPE, idleBP, walkBP } from "./Bot3";
export const BotTest: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <ThreeCanvas width={1080} height={1920} shadows="soft" style={{ background: "#333" }} camera={{ fov: 40, position: [0, 1.2, 6.5] }}>
      <Rig pos={[0, 1.3, 6.8]} look={[0, 0.95, 0]} fov={40} />
      <ambientLight intensity={0.4} /><directionalLight position={[2, 5, 4]} intensity={2.5} castShadow />
      <pointLight position={[0, 2, -2]} intensity={4} color="#9fb4ff" />
      <Box p={[0, -0.05, 0]} s={[10, 0.1, 10]} map={TX.wood(4, 4)} />
      <Box p={[0, 1.5, -2.5]} s={[10, 3, 0.1]} map={TX.wallpaper("#8f9a86", "#86917d")} />
      <Bot pos={[-1.1, 0, 0.6]} p={idleBP(f)} f={f} />
      <Bot pos={[0, 0, -0.6]} ry={Math.PI} p={idleBP(f)} f={f} />
      <Aura f={f} pos={[0, 0, -0.6]} />
      <Box p={[1.1, 0.48, 0.2]} s={[0.5, 0.06, 0.5]} c="#2a2d35" /><Box p={[1.1, 0.24, 0.2]} s={[0.06, 0.48, 0.06]} c="#222" /><Box p={[1.1, 0.85, -0.03]} s={[0.46, 0.6, 0.06]} c="#2a2d35" />
      <Bot pos={[1.1, 0, 0.18]} ry={0} p={TYPE} f={f} />
      <Bot pos={[0, 0, 1.9]} ry={Math.PI / 2} p={walkBP(f / 4)} f={f} scale={0.9} />
    </ThreeCanvas>
  );
};
