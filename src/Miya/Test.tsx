import React from "react";
import { useCurrentFrame } from "remotion";
import { Toon, ToonDefs, P, walk } from "./Toon";
export const MiyaTest: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <svg width={1080} height={1920} style={{ background: "#3a4466" }}>
      <ToonDefs />
      <Toon x={200} y={800} kind="mikio" pose={P.stand} face="smile" f={f} />
      <Toon x={520} y={800} kind="yasuko" pose={P.hold} face="neutral" f={f} />
      <Toon x={800} y={800} kind="niina" pose={walk(1)} face="smile" f={f} />
      <Toon x={980} y={800} kind="rei" pose={P.play} face="smile" f={f} />
      <Toon x={250} y={1700} kind="killer" pose={P.stand} f={f} bandage />
      <Toon x={620} y={1700} kind="grandma" pose={P.grief} face="cry" f={f} />
      <Toon x={900} y={1700} kind="mikio" pose={P.type} face="focus" f={f} />
    </svg>
  );
};
