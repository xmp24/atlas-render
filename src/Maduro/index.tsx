// Montaje del vídeo "How the US Captured Maduro"
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {S1, S2, S3, S4, S5, S6} from './scenes1';
import {S7, S8, S9, S10, S11, S12, S13, S14} from './scenes2';
import TL from './timeline.json';

const SC: Record<string, React.FC<{t: number}>> = {S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14};
export const MADURO_FRAMES = Math.round((TL as any).total * 30);
const XF = 0.5; // fundido entre escenas

export const Maduro: React.FC<{audio?: boolean}> = ({audio = true}) => {
  const t = useCurrentFrame() / 30;
  const scenes = (TL as any).scenes as [string, number, number][];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {scenes.map(([id, a, b], i) => {
        if (t < a - XF || t > b + XF) return null;
        const C = SC[id]; const op = i === 0 ? 1 : Math.min(1, Math.max(0, (t - (a - XF)) / XF));
        return <AbsoluteFill key={id} style={{opacity: op}}><C t={Math.max(0, t - a)} /></AbsoluteFill>;
      })}
      {/* grano sutil */}
      <AbsoluteFill style={{pointerEvents: 'none', opacity: 0.06, backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '5px 5px', transform: `translate(${(Math.floor(t * 24) % 5) - 2}px, ${(Math.floor(t * 24 * 7) % 5) - 2}px)`}} />
      {audio && <Audio src={staticFile('hw/maduro.wav')} />}
    </AbsoluteFill>
  );
};
