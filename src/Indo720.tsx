import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Indo2} from './Indo2';
export const Indo720: React.FC<any> = (p) => (
  <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: 'scale(0.666667)', transformOrigin: '0 0'}}><Indo2 {...p} /></div>
  </AbsoluteFill>
);
