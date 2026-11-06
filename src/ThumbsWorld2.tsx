// Miniaturas "A World With" v2 — estilo countryball: título pregunta (blanco arriba, oro abajo), héroe grande,
// bolas preocupadas a la derecha, mapa tintado con ojitos en cada país, rayos e icono central dorado.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COUNTRIES} from './HexWorld';
import {PolyCanvas, CEv} from './PolyWorld';
import {INK, Mood} from './lib3';
import {Planet} from './Logos';
import {Title3D, GOLD, WHITE} from './ThumbsFinal';
import {Glow, Rays, Icon, Ball, Embers} from './ThumbsPro';
import EY from './thumbEyes.json';

const W = 1280, H = 720;
const K = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const E0 = K('NE');
const ALL: CEv[] = COUNTRIES.map((_, i) => [-10, -10, i, E0, i, 0, 0, 0.1] as any);

const LandMap: React.FC<{land: string; ocean?: string; dark?: number}> = ({land, ocean, dark = 0}) => (
  <AbsoluteFill style={{overflow: 'hidden', background: '#2f7fd0'}}>
    <div style={{position: 'absolute', inset: -20, filter: 'blur(1.2px) saturate(1.15)'}}>
      <PolyCanvas cev={ALL} t={0} tm={0} byTm={false} cam={{cx: (EY as any).cam[0], cy: (EY as any).cam[1], s: (EY as any).cam[2]}} W={W + 40} H={H + 40}
        opts={{squads: false, capitalsOff: true, war: null, empire: E0, empireCol: land, empireFlag: false, waves: true} as any} />
    </div>
    {dark > 0 && <AbsoluteFill style={{background: `rgba(0,0,10,${dark})`}} />}
  </AbsoluteFill>
);
type EyeMood = 'scared' | 'sad' | 'angry' | 'dead' | 'sleepy' | 'happy';
const Eyes: React.FC<{mood: EyeMood; skip?: (x: number, y: number) => boolean}> = ({mood, skip}) => (
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
    {((EY as any).eyes as number[][]).filter(([x, y]) => !(skip && skip(x, y))).map(([x, y], i) => {
      const s = 1.45 + rnd(i) * 0.35, lk = (rnd(i + 7) - 0.5) * 3;
      return <g key={i} transform={`translate(${x},${y}) scale(${s})`}>
        {[-1, 1].map((d) => <g key={d}>
          {mood === 'dead' ? <path d={`M${d * 10 - 7},-7 l14,14 M${d * 10 + 7},-7 l-14,14`} stroke={INK} strokeWidth={4} strokeLinecap="round" /> : <>
            <ellipse cx={d * 10} cy={0} rx={9} ry={mood === 'sleepy' ? 6 : 11} fill="#fff" stroke={INK} strokeWidth={3} />
            <circle cx={d * 10 + lk} cy={mood === 'sad' ? 4 : 1} r={mood === 'scared' ? 3.4 : 4.6} fill={INK} />
            {mood === 'sad' && <path d={`M${d * 10 - 9},-3 Q${d * 10},-12 ${d * 10 + 9},-3 Z`} fill={INK} />}
            {mood === 'sleepy' && <path d={`M${d * 10 - 9},-1 Q${d * 10},-10 ${d * 10 + 9},-1 Z`} fill="#6a4a9a" stroke={INK} strokeWidth={2} />}
            {mood === 'angry' && <path d={`M${d * 3},-10 L${d * 19},-15`} stroke={INK} strokeWidth={4} strokeLinecap="round" />}
          </>}
        </g>)}
        {mood === 'scared' && <ellipse cx={0} cy={19} rx={4} ry={5} fill={INK} />}
      </g>;
    })}
  </svg>
);
type Side = {c: string; mood: Mood; sweat?: boolean; crown?: boolean; rot?: number; gray?: boolean};
type Cfg = {top: string; bot: string; ts: number; bs: number; land: string; ocean?: string; dark?: number; eyes: EyeMood; hero: Mood; heroRot?: number; heroCrown?: boolean; heroHelmet?: boolean;
  icon: string; ic: string; glow: string; ray: string; side: Side[]; fx?: string; heroFx?: string; botGrad?: string};
const ICE = 'linear-gradient(180deg, #ffffff 0%, #dff6ff 40%, #8ad8ff 75%, #3a9aff 100%)';
const FIRE = 'linear-gradient(180deg, #fffbe0 0%, #ffe14a 30%, #ff8a1a 60%, #ff2a0a 100%)';
const BLOOD = 'linear-gradient(180deg, #ffe0e0 0%, #ff6a5a 40%, #e01a10 75%, #8a0606 100%)';
const PURP = 'linear-gradient(180deg, #ffffff 0%, #ead8ff 35%, #b98aff 70%, #7a3aff 100%)';
const CYAN = 'linear-gradient(180deg, #ffffff 0%, #d8fbff 35%, #7af0ff 70%, #1aa8d8 100%)';
export const CFG2: Record<string, Cfg> = {
  cold: {top: '-1°C EVERY MONTH', bot: 'UNTIL -273°C?', ts: 92, bs: 112, land: '#f2fbff', eyes: 'scared', hero: 'scared', icon: 'snowflake-1', ic: '#dff6ff', glow: '#9fe0ff', ray: 'rgba(220,245,255,0.9)', botGrad: ICE, fx: 'snow', heroFx: 'ice',
    side: [{c: 'RU', mood: 'smug'}, {c: 'CA', mood: 'scared', sweat: true}, {c: 'BR', mood: 'scared', sweat: true}]},
  ocean: {top: 'OCEANS RISE', bot: '1 METER A WEEK?', ts: 104, bs: 104, land: '#7ccf5a', eyes: 'scared', hero: 'scared', icon: 'big-wave', ic: '#7fd0ff', glow: '#39b6ff', ray: 'rgba(120,200,255,0.8)', botGrad: CYAN, fx: 'water',
    side: [{c: 'NL', mood: 'scared', sweat: true}, {c: 'BD', mood: 'scared', sweat: true}, {c: 'CH', mood: 'smug'}]},
  babies: {top: 'WHAT IF NOBODY', bot: 'HAD BABIES?', ts: 100, bs: 128, land: '#9ad870', eyes: 'sad', hero: 'sad', icon: 'baby-bottle', ic: '#ffd23f', glow: '#ffe680', ray: 'rgba(255,240,180,0.85)',
    side: [{c: 'JP', mood: 'sad'}, {c: 'IT', mood: 'sad'}, {c: 'KR', mood: 'shocked', sweat: true}]},
  heat: {top: '+1°C EVERY MONTH', bot: 'UNTIL EARTH BURNS?', ts: 92, bs: 96, land: '#ffb030', eyes: 'scared', hero: 'shocked', icon: 'thermometer-hot', ic: '#ffd23f', glow: '#ff8a1a', ray: 'rgba(255,190,90,0.85)', botGrad: FIRE, fx: 'fire', heroFx: 'sweat',
    side: [{c: 'CA', mood: 'smug'}, {c: 'IN', mood: 'scared', sweat: true}, {c: 'SA', mood: 'scared', sweat: true}]},
  thirty: {top: 'WHAT IF HUMANS', bot: 'DIED AT 30?', ts: 100, bs: 132, land: '#d8d8d8', eyes: 'dead', hero: 'shocked', icon: 'sands-of-time', ic: '#ffd23f', glow: '#ff6a5a', ray: 'rgba(255,200,180,0.8)',
    side: [{c: 'JP', mood: 'scared', sweat: true}, {c: 'IT', mood: 'scared', sweat: true}, {c: 'NG', mood: 'smug', crown: true}]},
  purge: {top: 'WHAT IF THE PURGE', bot: 'WAS REAL?', ts: 96, bs: 132, land: '#e0301e', dark: 0.25, eyes: 'angry', hero: 'angry', heroHelmet: true, icon: 'siren', ic: '#ff4a3a', glow: '#ff2a0a', ray: 'rgba(255,80,60,0.7)', botGrad: BLOOD, fx: 'siren',
    side: [{c: 'US', mood: 'angry'}, {c: 'JP', mood: 'calm'}, {c: 'CA', mood: 'scared', sweat: true}]},
  nosleep: {top: 'WHAT IF NOBODY', bot: 'COULD SLEEP?', ts: 100, bs: 124, land: '#b48aff', dark: 0.12, eyes: 'sleepy', hero: 'shocked', icon: 'alarm-clock', ic: '#efe0ff', glow: '#a04aff', ray: 'rgba(200,160,255,0.75)', botGrad: PURP, heroFx: 'bags',
    side: [{c: 'US', mood: 'shocked', sweat: true}, {c: 'JP', mood: 'scared', sweat: true}, {c: 'GB', mood: 'sad'}]},
  money: {top: 'WHAT IF MONEY', bot: 'DISAPPEARED?', ts: 104, bs: 116, land: '#d8c06a', eyes: 'scared', hero: 'sad', icon: 'coins', ic: '#ffd23f', glow: '#ffd23f', ray: 'rgba(255,225,120,0.85)', fx: 'bills',
    side: [{c: 'US', mood: 'shocked', sweat: true}, {c: 'CH', mood: 'scared', sweat: true}, {c: 'BR', mood: 'smug', crown: true}]},
  deathdate: {top: 'EVERYONE KNOWS', bot: 'THEIR DEATH DATE?', ts: 100, bs: 100, land: '#6ac8d8', dark: 0.15, eyes: 'scared', hero: 'scared', icon: 'burning-meteor', ic: '#ffb030', glow: '#ff8a1a', ray: 'rgba(255,190,110,0.75)', botGrad: CYAN, heroFx: 'date',
    side: [{c: 'JP', mood: 'scared', sweat: true}, {c: 'PH', mood: 'scared', sweat: true}, {c: 'US', mood: 'shocked'}]},
  memory: {top: 'EVERYONE FORGETS', bot: 'AT MIDNIGHT?', ts: 92, bs: 120, land: '#e8eef8', eyes: 'happy', hero: 'shocked', icon: 'brain', ic: '#ffb0d0', glow: '#ff8ac0', ray: 'rgba(255,220,240,0.8)', fx: 'qmarks',
    side: [{c: 'FR', mood: 'shocked'}, {c: 'IN', mood: 'shocked'}, {c: 'MX', mood: 'scared', sweat: true}]},
  gravity: {top: 'NO GRAVITY', bot: 'FOR 5 SECONDS?', ts: 110, bs: 106, land: '#c8b0ff', eyes: 'scared', hero: 'scared', heroRot: -18, icon: 'falling', ic: '#e8dcff', glow: '#b98aff', ray: 'rgba(210,190,255,0.8)', botGrad: PURP, fx: 'float',
    side: [{c: 'US', mood: 'scared', sweat: true, rot: 25}, {c: 'JP', mood: 'shocked', rot: -30}, {c: 'BR', mood: 'scared', sweat: true, rot: 40}]},
  power: {top: 'WHAT IF ELECTRICITY', bot: 'STOPPED FOREVER?', ts: 88, bs: 104, land: '#5a5a66', dark: 0.35, eyes: 'scared', hero: 'scared', icon: 'light-bulb', ic: '#ffd96a', glow: '#ffd96a', ray: 'rgba(255,220,120,0.55)', fx: 'candle',
    side: [{c: 'US', mood: 'scared', sweat: true}, {c: 'JP', mood: 'shocked'}, {c: 'DE', mood: 'scared', sweat: true}]},
  powers: {top: 'EVERY COUNTRY GETS', bot: 'A SUPERPOWER?', ts: 92, bs: 116, land: '#ffd23f', eyes: 'happy', hero: 'smug', heroCrown: true, icon: 'fist', ic: '#ffd23f', glow: '#ffd23f', ray: 'rgba(255,230,120,0.95)', fx: 'sparks',
    side: [{c: 'JP', mood: 'smug'}, {c: 'US', mood: 'smug'}, {c: 'BE', mood: 'shocked', sweat: true}]},
};
const HX = 330, HY = 430, HS = 400;
const SIDE = [[1150, 190, 140], [1100, 360, 150], [1160, 520, 130]];
const FX: Record<string, React.FC> = {
  snow: () => <>{Array.from({length: 80}, (_, i) => <div key={i} style={{position: 'absolute', left: rnd(i) * W, top: rnd(i + 50) * H, width: 3 + rnd(i + 9) * 7, height: 3 + rnd(i + 9) * 7, borderRadius: '50%', background: '#fff', opacity: 0.55 + rnd(i) * 0.45, boxShadow: '0 0 6px #bfe8ff'}} />)}</>,
  water: () => <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>{[0, 1].map((k) => <path key={k} d={`M0,${640 + k * 40} ${Array.from({length: 17}, (_, i) => `Q${40 + i * 80},${610 + k * 40 + (i % 2 ? -26 : 26)} ${80 + i * 80},${640 + k * 40}`).join(' ')} L1280,720 L0,720 Z`} fill={k ? 'rgba(10,60,160,0.85)' : 'rgba(40,130,230,0.6)'} />)}</svg>,
  fire: () => <><Embers n={70} seed={41} c="#ffd27a" /><AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(255,90,10,0.55) 0%, rgba(255,90,10,0) 30%)'}} /></>,
  siren: () => <><div style={{position: 'absolute', left: -200, top: -260, width: 640, height: 640, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,30,30,0.6), rgba(255,30,30,0) 70%)'}} /><div style={{position: 'absolute', left: 860, top: -280, width: 640, height: 640, borderRadius: '50%', background: 'radial-gradient(circle, rgba(40,90,255,0.6), rgba(40,90,255,0) 70%)'}} /></>,
  bills: () => <>{Array.from({length: 18}, (_, i) => <div key={i} style={{position: 'absolute', left: rnd(i) * W, top: rnd(i + 30) * H, width: 54, height: 26, transform: `rotate(${rnd(i + 3) * 360}deg)`, background: 'linear-gradient(90deg, #5a8a3a, #9ac86a)', border: `3px solid ${INK}`, opacity: 0.85}} />)}</>,
  qmarks: () => <>{[[560, 300, 70], [840, 560, 80], [480, 610, 56], [760, 230, 60]].map(([x, y, s], i) => <div key={i} style={{position: 'absolute', left: x, top: y, fontFamily: 'Lilita One, sans-serif', fontSize: s, color: '#fff', WebkitTextStroke: `5px ${INK}`, paintOrder: 'stroke fill', transform: `rotate(${i % 2 ? 14 : -12}deg)`}}>?</div>)}</>,
  float: () => <>{[['house', 560, 610, 80, -20], ['commercial-airplane', 700, 250, 90, 25], ['battle-tank', 860, 600, 80, 35], ['palm-tree', 520, 300, 70, -30]].map(([n, x, y, w, r], i) => <Icon key={i} name={n as string} x={x as number} y={y as number} w={w as number} c="#f0e8ff" rot={r as number} />)}</>,
  candle: () => <><Glow x={640} y={470} r={260} c="rgba(255,200,90,0.55)" /></>,
  sparks: () => <Embers n={60} seed={9} c="#fff3a0" />,
};
const HeroFx: React.FC<{k?: string}> = ({k}) => {
  if (k === 'ice') return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>{[-110, -60, -10, 40, 90, 130].map((dx, i) => <path key={i} d={`M${HX + dx - 14},${HY + 150 - Math.abs(dx) * 0.35} L${HX + dx},${HY + 205 + (i % 2) * 30 - Math.abs(dx) * 0.35} L${HX + dx + 14},${HY + 150 - Math.abs(dx) * 0.35} Z`} fill="#e6f8ff" stroke={INK} strokeWidth={4} />)}
    <path d={`M${HX - 175},${HY - 70} Q${HX},${HY - 250} ${HX + 175},${HY - 70} Q${HX + 120},${HY - 140} ${HX},${HY - 150} Q${HX - 120},${HY - 140} ${HX - 175},${HY - 70} Z`} fill="#ffffff" stroke={INK} strokeWidth={6} /></svg>;
  if (k === 'sweat' || k === 'bags') return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
    {k === 'sweat' && [[HX + 150, HY - 120], [HX - 165, HY - 60]].map(([x, y], i) => <path key={i} d={`M${x},${y} q16,34 0,48 q-16,-14 0,-48 Z`} fill="#7ad0ff" stroke={INK} strokeWidth={4} />)}
    {k === 'bags' && [-1, 1].map((d) => <path key={d} d={`M${HX + d * 64 - 46},${HY + 20} Q${HX + d * 64},${HY + 52} ${HX + d * 64 + 46},${HY + 20}`} fill="none" stroke="#6a3a9a" strokeWidth={13} strokeLinecap="round" />)}</svg>;
  if (k === 'date') return <div style={{position: 'absolute', left: HX - 120, top: HY + 175, width: 240, padding: '6px 0', textAlign: 'center', background: '#111', border: `5px solid ${INK}`, borderRadius: 14, color: '#ff4a3a', fontFamily: 'Lilita One, sans-serif', fontSize: 40, transform: 'rotate(-4deg)', boxShadow: '0 0 20px rgba(255,60,60,0.7)'}}>14·08·2033</div>;
  return null;
};
export const ThumbW2: React.FC<{k: string}> = ({k}) => {
  const c = CFG2[k]; const F = c.fx ? FX[c.fx] : null;
  const covered = (x: number, y: number) => Math.hypot(x - HX, y - HY) < 240 || SIDE.some(([sx, sy, ss]) => Math.hypot(x - sx, y - sy) < ss * 0.62) || y < 135 || (y > 580 && x > 250 && x < 1050);
  return (<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    <LandMap land={c.land} ocean={c.ocean} dark={c.dark} />
    <Rays x={HX} y={HY} c={c.ray} a={0.45} n={20} r={1100} />
    <Eyes mood={c.eyes} skip={covered} />
    {F && <F />}
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 100%)'}} />
    <Glow x={640} y={470} r={170} c={c.glow} />
    <Icon name={c.icon} x={640} y={470} w={190} c={c.ic} glow={c.glow} rot={-6} />
    <Glow x={HX} y={HY} r={300} c={c.glow} a={0.8} />
    <div style={{position: 'absolute', left: HX - HS / 2, top: HY - HS / 2, transform: `rotate(${c.heroRot ?? 0}deg)`, filter: 'brightness(1.3) saturate(1.25)'}}><Planet size={HS} mood={c.hero} lon={15} lat={20} rim={c.glow} helmet={c.heroHelmet} /></div>
    {c.heroCrown && <Icon name="crown" x={HX} y={HY - 245} w={230} c="#ffd23f" glow="#ffe48a" />}
    <HeroFx k={c.heroFx} />
    {c.side.map((s, i) => <Ball key={i} k={K(s.c)} size={SIDE[i][2]} mood={s.mood} x={SIDE[i][0]} y={SIDE[i][1]} sweat={s.sweat} crown={s.crown} rot={s.rot ?? 0} rim={c.glow} look={[-0.6, 0]} />)}
    <Title3D text={c.top} y={14} size={c.ts} grad={WHITE} glow="rgba(0,0,0,0.6)" rot={-2} />
    <Title3D text={c.bot} y={H - c.bs * 1.12 - 6} size={c.bs} grad={c.botGrad ?? GOLD} glow={c.glow} rot={-2} />
  </AbsoluteFill>);
};
