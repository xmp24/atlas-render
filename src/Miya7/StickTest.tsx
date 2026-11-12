import React from "react";
import { useCurrentFrame } from "remotion";
import { Stick, walkSP, idleSP, sitSP, STRIDE_PER_RAD } from "./Stick";
export const StickTest: React.FC = () => {
  const f = useCurrentFrame();
  const ph = f * (2 * Math.PI / 33);
  return (
    <svg width={1080} height={1920} style={{ background: "#d9d3c4" }}>
      <line x1={0} y1={700} x2={1080} y2={700} stroke="#999" strokeWidth={3} />
      <Stick x={150 + ph * STRIDE_PER_RAD * (400 / 585)} y={700} h={400} p={walkSP(ph)} f={f} />
      <Stick x={300} y={1300} h={400} p={idleSP(f)} view="front" f={f} />
      <Stick x={560} y={1300} h={400} p={idleSP(f)} view="three" f={f} />
      <Stick x={820} y={1300} h={400} p={idleSP(f)} view="back" f={f} />
      <Stick x={300} y={1850} h={400} p={sitSP} f={f} />
      <Stick x={700} y={1850} h={400} p={walkSP(ph, 1, 1)} f={f} flip />
    </svg>
  );
};
