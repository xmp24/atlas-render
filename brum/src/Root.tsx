import React from 'react';
import {Composition} from 'remotion';
import {Ep1} from './Ep1';
import {Ep2} from './Ep2';
export const Root: React.FC = () => (
  <>
    <Composition id="BrumEp1Prev" component={Ep1} durationInFrames={1800} fps={30} width={1280} height={720} />
    <Composition id="BrumEp1HD" component={Ep1} durationInFrames={1800} fps={30} width={1920} height={1080} />
    <Composition id="BrumEp1V2" component={Ep2} durationInFrames={1905} fps={30} width={1280} height={720} />
  </>
);
