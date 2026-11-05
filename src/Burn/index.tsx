// Montaje "What If Earth Burned in 24 Hours?"
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {Caption, Chapter} from '../Maduro/lib';
import * as A from './scenes1';
import * as B from './scenes2';
import {D, Countdown, YearBadge, Chip, kfv, Grain} from './kit';

const SC: Record<string, React.FC<any>> = {...(A as any), ...(B as any)};
export const BURN_FRAMES = Math.round(D.total * 30);
const HARD = new Set(['COLD1', 'COLD2', 'COLD3', 'COLD4', 'FALL1', 'COUNT', 'NUKE', 'OUT']);
const XF = 0.35;
const Overlays: React.FC<{t: number; p: any; id: string}> = ({t, p, id}) => (<>
  {p.year && <YearBadge year={kfv(p.year, t)} t={t} t0={0.1} bw={!!p.bw} />}
  {p.cd && id !== 'COUNT' && <Countdown sec={kfv(p.cd, t)} t={t} />}
  {p.chip && <Chip t={t} t0={p.chip[0]} t1={p.chip[1]} text={p.chip[2]} />}
  {(p.caps || []).map((c: any, i: number) => <Caption key={i} t={t} t0={c[0]} t1={c[1]} text={c[2]} hl={c[3] || undefined} y={930} size={48} />)}
  {p.chap && <Chapter t={t} t0={p.chap[0]} t1={p.chap[1]} top={p.chap[2]} main={p.chap[3]} />}
</>);
export const Burn: React.FC<{audio?: boolean}> = ({audio = true}) => {
  const T = useCurrentFrame() / 30;
  const scenes = D.scenes as [string, number, number, any][];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {scenes.map(([id, a, b, p], i) => {
        const hard = i === 0 || HARD.has(id);
        const st = hard ? a : a - XF;
        if (T < st || T >= b + (scenes[i + 1] && !HARD.has(scenes[i + 1][0]) ? 0.02 : 0)) return null;
        const C_ = SC[id]; if (!C_) return null;
        const op = hard ? 1 : Math.min(1, Math.max(0, (T - st) / XF));
        const t = Math.max(0, T - a);
        return <AbsoluteFill key={id} style={{opacity: op}}><C_ t={t} T={T} p={p} /><Overlays t={t} p={p} id={id} /></AbsoluteFill>;
      })}
      <Grain t={T} a={0.04} />
      {audio && <Audio src={staticFile('hw/burn.wav')} />}
    </AbsoluteFill>
  );
};
