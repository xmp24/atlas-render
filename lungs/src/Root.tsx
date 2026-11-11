import React from 'react';
import {Composition} from 'remotion';
import {Lungs} from './Lungs';
import {Lungs2} from './Lungs2';
import {Lungs3D} from './Lungs3D';
export const Root: React.FC = () => (<>
  <Composition id="Lungs" component={Lungs} durationInFrames={450} fps={30} width={720} height={1280} />
  <Composition id="Lungs2" component={Lungs2} durationInFrames={450} fps={30} width={720} height={1280} />
  <Composition id="Lungs3D" component={Lungs3D} durationInFrames={450} fps={30} width={720} height={1280} />
</>);
