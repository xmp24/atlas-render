// Miniaturas "Every Country Invades Its Neighbor" (3 ideas x EN/ES)
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COUNTRIES} from './HexWorld';
import {INK} from './lib3';
import {WorldBg} from './ThumbsMap';
import {Embers, Glow, Rays} from './ThumbsPro';
import {CBall} from './ThumbsCB';
import {Vign} from './ThumbsFinal';
import {PT, PGOLD, PRED, PBLUE, Puff, Anger} from './ThumbsMil';
import {PIECES_C} from './PolyWorld';

const W = 1280, H = 720;
const K = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
const ALL = COUNTRIES.map((c) => c.c);
const PWHITE = {top: 'linear-gradient(180deg,#ffffff 0%,#ffffff 55%,#d6e6ff 100%)', ext: '#3a4a6a'};
const font: React.CSSProperties = {fontFamily: 'Lilita'};
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

const Arrow: React.FC<{x0: number; y0: number; x1: number; y1: number; w?: number; c?: string}> = ({x0, y0, x1, y1, w = 26, c = '#ff2a2a'}) => {
  const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0), h = w * 1.9;
  const d = `M0,${-w / 2} L${L - h},${-w / 2} L${L - h},${-w * 1.25} L${L},0 L${L - h},${w * 1.25} L${L - h},${w / 2} L0,${w / 2} Z`;
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.55))'}}>
      <g transform={`translate(${x0},${y0}) rotate(${(a * 180) / Math.PI})`}><path d={d} fill={c} stroke="#fff" strokeWidth={w * 0.22} strokeLinejoin="round" /></g>
    </svg>
  );
};
const Dark: React.FC<{a?: number}> = ({a = 0.35}) => <AbsoluteFill style={{background: `rgba(5,10,25,${a})`}} />;

// ---------- A: Sorry Monaco ----------
const FRc = PIECES_C(K('FR'));
const CAM_EU = {cx: FRc[0] + 120, cy: FRc[1] + 40, s: 0.95};
const A: React.FC<{es: boolean}> = ({es}) => (<>
  <WorldBg cam={CAM_EU} skip={ALL} blur={3} />
  <Dark a={0.3} />
  <AbsoluteFill style={{background: 'radial-gradient(circle at 32% 62%, rgba(80,140,255,0.35) 0%, rgba(0,0,0,0) 45%)'}} />
  <Rays x={370} y={450} c="rgba(170,210,255,0.35)" a={0.45} n={20} />
  <Glow x={950} y={540} r={170} c="rgba(255,60,60,0.7)" />
  <CBall k={K('FR')} size={500} x={370} y={455} eyes="smug" look={0.5} sweat rim="rgba(120,180,255,0.9)" />
  <Arrow x0={610} y0={470} x1={880} y1={535} w={30} />
  <CBall k={K('MC')} size={120} x={955} y={545} eyes="scared" look={-0.6} tears rim="rgba(255,120,120,0.9)" />
  <Puff x={1000} y={470} s={60} />
  <PT text={es ? 'PERDÓN,' : 'SORRY,'} x={es ? 880 : 900} y={60} size={120} pal={PWHITE} rot={-4} />
  <PT text={es ? 'MÓNACO' : 'MONACO'} x={920} y={200} size={140} pal={PRED} rot={-4} />
  <Vign />
</>);

// ---------- B: 194 -> 1 ----------
const DEAD = ['US', 'CN', 'RU', 'BR', 'IN', 'FR', 'DE', 'GB', 'JP', 'MX', 'AU', 'NG', 'EG', 'TR', 'AR', 'CA', 'ES', 'IT', 'SA', 'ZA'];
const B: React.FC<{es: boolean}> = ({es}) => (<>
  <div style={{position: 'absolute', inset: 0, filter: 'grayscale(0.55) brightness(0.8)'}}><WorldBg skip={ALL} blur={3.2} /></div>
  <Dark a={0.35} />
  <Rays x={940} y={330} c="rgba(255,215,90,0.55)" a={0.6} n={22} />
  <Glow x={940} y={330} r={330} c="rgba(255,190,40,0.8)" />
  <Embers n={45} seed={9} c="#ffd36a" />
  {DEAD.map((c, i) => <CBall key={c} k={K(c)} size={92} x={60 + (i % 10) * 118 + (i >= 10 ? 59 : 0)} y={i < 10 ? 612 : 688} eyes="dead" gray rot={(rnd(i) - 0.5) * 30} />)}
  <div style={{position: 'absolute', left: 70, top: 120, ...font, fontSize: 250, lineHeight: 1, color: '#fff', WebkitTextStroke: `30px ${INK}`, paintOrder: 'stroke fill', filter: 'drop-shadow(0 12px 10px rgba(0,0,0,0.6))'}}>194</div>
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><line x1={60} y1={350} x2={500} y2={170} stroke="#fff" strokeWidth={46} strokeLinecap="round" /><line x1={60} y1={350} x2={500} y2={170} stroke="#ff2020" strokeWidth={30} strokeLinecap="round" /></svg>
  <Arrow x0={560} y0={270} x1={700} y1={270} w={34} c="#ffd21f" />
  <div style={{position: 'absolute', left: 920, top: 330, transform: 'translate(-50%,-50%)', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #4a4a58 0%, #15151c 70%)', border: `8px solid ${INK}`, boxShadow: '0 0 0 6px #ffd21f, 0 20px 30px rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: 230, color: '#ffd21f', WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill'}}>?</div>
  <svg width={230} height={150} viewBox="0 0 230 150" style={{position: 'absolute', left: 805, top: 50, transform: 'rotate(8deg)', filter: 'drop-shadow(0 8px 6px rgba(0,0,0,0.6))'}}>
    <path d="M15,135 L5,30 L65,80 L115,10 L165,80 L225,30 L215,135 Z" fill="#ffc21a" stroke={INK} strokeWidth={9} strokeLinejoin="round" /><circle cx={115} cy={95} r={14} fill="#ff3b3b" stroke={INK} strokeWidth={5} />
  </svg>
  <PT text={es ? 'SOLO 1 SOBREVIVE' : 'ONLY 1 SURVIVES'} x={es ? 905 : 915} y={480} size={es ? 70 : 78} pal={PGOLD} rot={-3} />
  <Vign />
</>);

// ---------- C: Invade your neighbor ----------
const CAM_W = {cx: 3840, cy: 1640, s: 0.19};
const scr = (c: string) => { const p = PIECES_C(K(c)); return [(p[0] - CAM_W.cx) * CAM_W.s + W / 2, (p[1] - CAM_W.cy) * CAM_W.s + H / 2]; };
const PAIRS: [string, string][] = [['US', 'CA'], ['BR', 'AR'], ['CN', 'IN'], ['RU', 'KZ'], ['DZ', 'LY'], ['FR', 'ES'], ['AU', 'ID'], ['EG', 'SD'], ['MX', 'GT']];
const C: React.FC<{es: boolean}> = ({es}) => (<>
  <WorldBg cam={CAM_W} skip={ALL} blur={1.6} />
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%, rgba(255,40,20,0.0) 30%, rgba(90,0,0,0.5) 100%)'}} />
  <Embers n={40} seed={17} c="#ff9a4a" />
  {PAIRS.map(([a, b], i) => { const [x0, y0] = scr(a), [x1, y1] = scr(b); const l = Math.hypot(x1 - x0, y1 - y0); const ux = (x1 - x0) / l, uy = (y1 - y0) / l; return <Arrow key={i} x0={x0 + ux * 8} y0={y0 + uy * 8} x1={x1 - ux * 6} y1={y1 - uy * 6} w={19} />; })}
  <CBall k={K('US')} size={230} x={185} y={500} eyes="angry" look={0.6} helmet rim="rgba(255,120,60,0.9)" />
  <Anger x={260} y={370} s={60} />
  <CBall k={K('CA')} size={150} x={395} y={590} eyes="scared" look={-0.6} sweat />
  <CBall k={K('CN')} size={230} x={1095} y={500} eyes="angry" look={-0.6} helmet rim="rgba(255,120,60,0.9)" />
  <Anger x={1010} y={370} s={60} rot={10} />
  <CBall k={K('IN')} size={150} x={885} y={590} eyes="scared" look={0.6} sweat />
  <PT text={es ? '¡INVADE A' : 'INVADE YOUR'} x={640} y={40} size={es ? 100 : 96} pal={PWHITE} rot={-2} />
  <PT text={es ? 'TU VECINO!' : 'NEIGHBOR!'} x={640} y={160} size={120} pal={PRED} rot={-2} />
  <Vign />
</>);

const F: Record<string, React.FC<{es: boolean}>> = {a: A, b: B, c: C};
export const NAREC_IDS = ['a-en', 'a-es', 'b-en', 'b-es', 'c-en', 'c-es'];
export const ThumbNarEC: React.FC<{id: string}> = ({id}) => { const [v, l] = id.split('-'); const X = F[v]; return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><X es={l === 'es'} /></AbsoluteFill>; };
