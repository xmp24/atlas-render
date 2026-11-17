import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {VirusScene, CityScene, WallScene, LabScene} from './Zomb3D';
export const Z3DTest: React.FC = () => { const f = useCurrentFrame(); const s = Math.floor(f / 300); const u = (f % 300) / 30;
  return <AbsoluteFill style={{background: '#000'}}>{s === 0 ? <VirusScene u={u} mode="virus" /> : s === 1 ? <VirusScene u={u} mode="mut" /> : s === 2 ? <CityScene u={u} /> : s === 3 ? <WallScene u={u} breach={false} /> : s === 4 ? <WallScene u={u} breach /> : <LabScene u={u} p0={40} p1={70} dur={8} fail={s === 6} done={s === 7} />}</AbsoluteFill>; };
