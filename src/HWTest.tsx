import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {MapCanvas, HWD, makeCam} from './HexWorld';
import './lib3';
import TD from './hw/test.json';
const D = TD as unknown as HWD;
const cam = makeCam([[0, 3840, 2100, 0.25], [10, 4000, 1300, 0.9, 3], [20, 4300, 1900, 1.6, 3], [30, 2300, 2300, 0.6, 3]]);
export const HWTest: React.FC = () => {
  const f = useCurrentFrame(); const t = f / 30;
  return <AbsoluteFill><MapCanvas d={D} t={t} cam={cam(t)} W={1920} H={1080} /></AbsoluteFill>;
};
