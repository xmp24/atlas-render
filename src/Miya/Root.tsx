import React from "react";
import { Composition } from "remotion";
import { MiyaTest } from "./Test";
import { Miyazawa, MIYA_FRAMES } from "./Video";
import { MiyaShort, SHORT_FRAMES } from "../Miya2/Short";
export const MiyaRoot: React.FC = () => (<>
  <Composition id="MiyaTest" component={MiyaTest} durationInFrames={30} fps={30} width={1080} height={1920} />
  <Composition id="MiyaN" component={Miyazawa} durationInFrames={MIYA_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: false }} />
  <Composition id="MiyaShortN" component={MiyaShort} durationInFrames={SHORT_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: false }} />
</>);
