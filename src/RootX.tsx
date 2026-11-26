import React from 'react';
import {Composition} from 'remotion';
import {makeWarX} from './WarX';
import GEO from './real-geo.json';
import BR from './x-br.json';
import EMP from './x-emp.json';
import R1 from './x-r1.json';
import R2 from './x-r2.json';
import R3 from './x-r3.json';
import FIFA from './x-fifa.json';
import ASIA from './x-asia.json';
import R4 from './x-r4.json';
import R8 from './x-r8.json';

const V: [string, any][] = [['XBR', BR], ['XEMP', EMP], ['XR1', R1], ['XR2', R2], ['XR3', R3], ['XFIFA', FIFA], ['XASIA', ASIA], ['XR4', R4], ['XR8', R8]];
const BUILT = V.map(([id, tl]) => [id, makeWarX(tl, GEO)] as const);
export const XComps: React.FC = () => (
  <>
    {BUILT.map(([id, x]) => (
      <React.Fragment key={id}>
        <Composition id={id} component={x.Comp720} durationInFrames={x.frames} fps={30} width={1280} height={720} />
        <Composition id={id + 'HD'} component={x.Comp} durationInFrames={x.frames} fps={30} width={1920} height={1080} />
      </React.Fragment>
    ))}
  </>
);
