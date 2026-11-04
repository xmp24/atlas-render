// Miniaturas y capa de texto del short del vídeo de Indonesia
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {FlagCanvas, makeCam, CamKey, COUNTRIES} from './HexWorld';
import {PolyCanvas, polyState, CEv} from './PolyWorld';
import {Face, INK, YELLOW, RED, font} from './lib3';
import JB from './hw/indo2b.json';

const D = JB as any;
const camF = makeCam(D.cam as CamKey[], 0.02);
const Ball: React.FC<{k: number; size: number; mood: any}> = ({k, size, mood}) => (
  <div style={{position: 'relative', width: size, height: size}}>
    <FlagCanvas k={k} w={size} h={size} style={{borderRadius: '50%', border: `${size * 0.04}px solid ${INK}`, boxShadow: '0 10px 0 rgba(0,0,0,0.4)'}} />
    <svg width={size} height={size} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><Face x={size / 2} y={size * 0.47} r={size * 0.29} mood={mood} t={1} seed={k} /></svg>
  </div>
);
const K = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
// 1: Indonesia contra el mundo (mapa medio conquistado)  2: el láser contra EE. UU.
export const IndoThumb: React.FC<{v: number}> = ({v}) => {
  const t = v === 1 ? 200 : D.laser[2][0] + 0.15;
  const cam = v === 1 ? {cx: 4300, cy: 1750, s: 0.33} : {cx: D.laser[2][1] - 60, cy: D.laser[2][2] - 40, s: 1.6};
  return (
    <AbsoluteFill style={{background: '#0b1626', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: 'scale(0.6667)', transformOrigin: '0 0'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080}}>
          <PolyCanvas cev={D.cev as CEv[]} t={t} tm={t} byTm={false} cam={cam} W={1920} H={1080} opts={{squads: false, capitalsOff: true, war: D.war, empire: D.id, waves: true}} />
        </div>
      </div>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 30% 50%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 100%)'}} />
      {v === 2 && <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0}}>
        <line x1={900} y1={-20} x2={680} y2={387} stroke="#ff2b4a" strokeWidth={70} opacity={0.4} strokeLinecap="round" />
        <line x1={900} y1={-20} x2={680} y2={387} stroke="#ff6b7a" strokeWidth={34} strokeLinecap="round" />
        <line x1={900} y1={-20} x2={680} y2={387} stroke="#fff" strokeWidth={11} strokeLinecap="round" />
        <circle cx={680} cy={387} r={90} fill="#ffe36b" opacity={0.75} /><circle cx={680} cy={387} r={45} fill="#fff" />
      </svg>}
      <div style={{position: 'absolute', left: 36, top: 26, width: 760}}>
        <div style={{...font, fontSize: v === 1 ? 92 : 84, lineHeight: 0.95, color: '#fff', WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 8px 0 ${INK}`}}>{v === 1 ? 'INDONESIA' : 'THE SECRET'}</div>
        <div style={{...font, fontSize: v === 1 ? 92 : 84, lineHeight: 0.95, color: YELLOW, WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 8px 0 ${INK}`}}>{v === 1 ? 'VS THE WORLD' : 'WEAPON'}</div>
      </div>
      <div style={{position: 'absolute', left: 50, bottom: 40}}><Ball k={D.id} size={250} mood="angry" /></div>
      {v === 1 ? (
        <div style={{position: 'absolute', right: 40, bottom: 40, display: 'flex', gap: 12}}>
          {['US', 'CN', 'RU'].map((c) => <Ball key={c} k={K(c)} size={150} mood="scared" />)}
        </div>
      ) : (
        <div style={{position: 'absolute', right: 40, bottom: 40}}><Ball k={K('US')} size={220} mood="shocked" /></div>
      )}
      {v === 1 && <div style={{position: 'absolute', right: 40, top: 40, background: RED, border: `6px solid ${INK}`, borderRadius: 18, padding: '6px 20px 0', ...font, fontSize: 56, color: '#fff', transform: 'rotate(4deg)'}}>194 COUNTRIES?!</div>}
      {v === 2 && <div style={{position: 'absolute', right: 300, top: 60, width: 150, height: 150, borderRadius: '50%', background: '#1d2a44', border: `7px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Img src={staticFile('hw/icons/beam-satellite.svg')} style={{width: 110, height: 110}} /></div>}
    </AbsoluteFill>
  );
};
// capa de texto del short vertical (fondo transparente)
export const IndoShortOverlay: React.FC<{part: number}> = ({part}) => (
  <AbsoluteFill>
    {part === 0 && <div style={{position: 'absolute', top: 120, left: 40, right: 40, textAlign: 'center'}}>
      <div style={{...font, fontSize: 100, lineHeight: 1, color: '#fff', WebkitTextStroke: `9px ${INK}`, paintOrder: 'stroke fill'}}>CAN INDONESIA</div>
      <div style={{...font, fontSize: 112, lineHeight: 1, color: YELLOW, WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill'}}>CONQUER THE WORLD?</div>
    </div>}
    {part === 0 && <div style={{position: 'absolute', bottom: 230, left: 60, right: 60, textAlign: 'center', background: RED, border: `7px solid ${INK}`, borderRadius: 30, padding: '20px 20px 10px', ...font, fontSize: 64, color: '#fff'}}>HOW IT ENDS ➜ FULL VIDEO 🛰️</div>}
  </AbsoluteFill>
);
