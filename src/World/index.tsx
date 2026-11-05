// Composición genérica de los vídeos "A World With": lee src/World/data/<v>.json
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {VCtx, Grain} from './kit';
import {GENERIC, Overlays} from './scenes';
import {VIDS, CUSTOM} from './vids';

const XF = 0.3;
export const framesOf = (v: string) => Math.round((VIDS[v] as any).total * 30);
export const WorldVid: React.FC<{v: string; audio?: boolean; off?: number}> = ({v, audio = false, off = 0}) => {
  const D = VIDS[v] as any; const T = (useCurrentFrame() + off) / 30;
  const scenes = D.scenes as [string, number, number, any][];
  return (
    <VCtx.Provider value={D}>
      <AbsoluteFill style={{background: '#000'}}>
        {scenes.map(([id, a, b, p], i) => {
          const hard = i === 0 || p.hard; const nxt = scenes[i + 1]; const st = hard ? a : a - XF;
          if (T < st || T >= b + (nxt && !nxt[3].hard ? 0.02 : 0)) return null;
          const C_ = (CUSTOM[v] && CUSTOM[v][p.kind]) || GENERIC[p.kind]; if (!C_) return null;
          const op = hard ? 1 : Math.min(1, Math.max(0, (T - st) / XF)); const t = Math.max(0, T - a);
          return <AbsoluteFill key={id + i} style={{opacity: op}}><C_ t={t} T={T} p={{...p, dur: b - a}} /><Overlays t={t} T={T} p={p} id={id} /></AbsoluteFill>;
        })}
        <Grain t={T} a={0.035} />
        {audio && <Audio src={staticFile(`world/${v}.wav`)} />}
      </AbsoluteFill>
    </VCtx.Provider>
  );
};
