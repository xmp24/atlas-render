import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {WallScene, LabScene} from './Zomb3D';
export const Z3DTest: React.FC = () => { const f = useCurrentFrame(); const s = Math.floor(f / 300); const u = (f % 300) / 30;
  return <AbsoluteFill style={{background: '#000'}}>{s === 0 ? <WallScene u={u} breach={false} w={1920} h={1080} /> : s === 1 ? <WallScene u={u} breach w={1920} h={1080} /> : <LabScene u={u} p={40 + u * 4} fail={s === 3} done={s === 4 ? Math.min(1, u / 2) : 0} w={1920} h={1080} />}</AbsoluteFill>; };
