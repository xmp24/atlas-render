// Composición genérica de los vídeos "A World With": lee src/World/data/<v>.json
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {VCtx, Grain} from './kit';
import {GENERIC, Overlays} from './scenes';
import {VIDS, CUSTOM} from './vids';

const XF = 0.3;
// barra de progreso por capítulos (abajo del todo): ayuda a la retención
const Progress: React.FC<{D: any; T: number}> = ({D, T}) => {
  const ch = (D.scenes as any[]).filter((s) => s[3].chap).map((s) => s[1]); if (!ch.length || T < ch[0]) return null;
  const tot = D.total; const a = Math.min(1, (T - ch[0]) / 0.6);
  return <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 7, background: 'rgba(0,0,0,0.45)', opacity: a}}>
    <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(T / tot) * 100}%`, background: 'linear-gradient(90deg, #ffd23f, #ff9a3a)', boxShadow: '0 0 10px rgba(255,200,60,0.8)'}} />
    {ch.map((c, i) => <div key={i} style={{position: 'absolute', left: `${(c / tot) * 100}%`, top: -3, width: 4, height: 13, background: T >= c ? '#fff' : 'rgba(255,255,255,0.45)', borderRadius: 2}} />)}
  </div>;
};
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
          const pk = (p.kind === 'map' || p.kind === 'balls' || p.kind === 'call' || p.kind === 'rank') ? Math.pow(1 - Math.min(1, t / 0.45), 2) : 0;
          return <AbsoluteFill key={id + i} style={{opacity: op, transform: pk ? `scale(${1 + 0.04 * pk})` : undefined}}><C_ t={t} T={T} p={{...p, dur: b - a}} /><Overlays t={t} T={T} p={p} id={id} /></AbsoluteFill>;
        })}
        <Grain t={T} a={0.035} />
        <Progress D={D} T={T} />
        {audio && <Audio src={staticFile(`world/${v}.wav`)} />}
      </AbsoluteFill>
    </VCtx.Provider>
  );
};
