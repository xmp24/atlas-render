// Montaje V2 "How the US Captured Maduro"
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {A, B, C, D, E, F} from './v2a';
import {G1, G2, G3, G4, HH, II, JJ, KK} from './v2b';
import TL from './timeline2.json';

const SC: Record<string, React.FC<{t: number}>> = {A, B, C, D, E, F, G1, G2, G3, G4, HH, II, JJ, KK};
export const MADURO2_FRAMES = Math.round((TL as any).total * 30);
const XF = 0.3;
export const Maduro2: React.FC<{audio?: boolean}> = ({audio = true}) => {
  const t = useCurrentFrame() / 30;
  const scenes = (TL as any).scenes as [string, number, number][];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {scenes.map(([id, a, b], i) => {
        if (t < a - XF || t > b + 0.05) return null;
        const C_ = SC[id]; const op = i === 0 ? 1 : Math.min(1, Math.max(0, (t - (a - XF)) / XF));
        return <AbsoluteFill key={id} style={{opacity: op}}><C_ t={Math.max(0, t - a)} /></AbsoluteFill>;
      })}
      <AbsoluteFill style={{pointerEvents: 'none', opacity: 0.05, backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '5px 5px', transform: `translate(${(Math.floor(t * 24) % 5) - 2}px, ${(Math.floor(t * 24 * 7) % 5) - 2}px)`}} />
      {audio && <Audio src={staticFile('hw/maduro2.wav')} />}
    </AbsoluteFill>
  );
};
