import { Miya8, V8_FRAMES } from "../Miya8/Video8";
import { Miya13, V13_FRAMES } from "../Miya8/Video13";
import { Miya12, V12_FRAMES } from "../Miya8/Video12";
import { Miya11, V11_FRAMES } from "../Miya8/Video11";
import { Miya10, V10_FRAMES } from "../Miya8/Video10";
import { Miya9, V9_FRAMES } from "../Miya8/Video9";
import { RoomTest } from "../Miya8/Scenes8";
import { BotTest } from "../Miya8/BotTest";
import { Miya7, V7_FRAMES } from "../Miya7/Video7";
import { Bake } from "../Miya7/Bake";
import { StickTest } from "../Miya7/StickTest";
import { Miya3D, Q3_FRAMES } from "../Miya3/Video3";
import { Test3 } from "../Miya3/Test3";
import { MiyaQuiet, Q_FRAMES } from "../Miya2/ShortQ";
import { MiyaPicto } from "../Miya2/ShortP";
import React from "react";
import { Composition } from "remotion";
import { MiyaTest } from "./Test";
import { Miyazawa, MIYA_FRAMES } from "./Video";
import { MiyaShort, SHORT_FRAMES } from "../Miya2/Short";
export const MiyaRoot: React.FC = () => (<>
  <Composition id="MiyaTest" component={MiyaTest} durationInFrames={30} fps={30} width={1080} height={1920} />
  <Composition id="MiyaN" component={Miyazawa} durationInFrames={MIYA_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: false }} />
    <Composition id="MiyaPictoN" component={MiyaPicto} durationInFrames={SHORT_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: false }} />
  <Composition id="MiyaQuietN" component={MiyaQuiet} durationInFrames={Q_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: false }} />
<Composition id="MiyaShortN" component={MiyaShort} durationInFrames={SHORT_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: false }} />
  <Composition id="Test3" component={Test3} durationInFrames={60} fps={30} width={1080} height={1920} />
  <Composition id="Miya3DN" component={Miya3D} durationInFrames={Q3_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: false }} />
  <Composition id="StickTest" component={StickTest} durationInFrames={66} fps={30} width={1080} height={1920} />
  {["rei","stairs","living","bath","office"].map((r) => <Composition key={r} id={"Bake-" + r} component={Bake} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{ room: r }} />)}
  <Composition id="Miya7N" component={Miya7} durationInFrames={V7_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: false }} />
  <Composition id="BotTest" component={BotTest} durationInFrames={60} fps={30} width={1080} height={1920} />
  {["rei","stairs","living","bath","office"].map((r) => <Composition key={"rt"+r} id={"RT-" + r} component={RoomTest} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{ room: r }} />)}
  <Composition id="Miya13N" component={Miya13} durationInFrames={V13_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: false, subs: true }} />
  <Composition id="Miya13NS" component={Miya13} durationInFrames={V13_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: false, subs: false }} />
  <Composition id="Miya12N" component={Miya12} durationInFrames={V12_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: false, subs: true }} />
  <Composition id="Miya12NS" component={Miya12} durationInFrames={V12_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: false, subs: false }} />
  <Composition id="Miya11N" component={Miya11} durationInFrames={V11_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: false, subs: true }} />
  <Composition id="Miya11NS" component={Miya11} durationInFrames={V11_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: false, subs: false }} />
  <Composition id="Miya10N" component={Miya10} durationInFrames={V10_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: false }} />
  <Composition id="Miya9N" component={Miya9} durationInFrames={V9_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: false }} />
  <Composition id="Miya8N" component={Miya8} durationInFrames={V8_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: false }} />
</>);
