import React from 'react';
import {Composition} from 'remotion';
import {makeWarX} from './WarX';
import GEO from './real-geo.json';
import BR from './x-br.json';
import EMP from './x-emp.json';

const V: [string, any][] = [['XBR', BR], ['XEMP', EMP]];
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
