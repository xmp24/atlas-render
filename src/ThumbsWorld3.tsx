// Miniaturas "A World With" v3 — tres formatos por vídeo:
//  A: antes/después (rayo)   B: countryball protagonista   C: dato gigante
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COUNTRIES} from './HexWorld';
import {INK, Mood, font} from './lib3';
import {Planet} from './Logos';
import {Title3D, GOLD, WHITE} from './ThumbsFinal';
import {Glow, Rays, Icon, Ball} from './ThumbsPro';
import {CFG2, LandMap, Eyes, FX, EyeMood} from './ThumbsWorld2';
import {Bolt, LEFT, RIGHT} from './ThumbsWorld';

const W = 1280, H = 720;
const K = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
const GREEN = '#7ccf5a';
const Lbl: React.FC<{text: string; x: number; y: number; bg: string; c?: string; size?: number; rot?: number}> = ({text, x, y, bg, c = INK, size = 64, rot = -3}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,0) rotate(${rot}deg)`, background: bg, border: `7px solid ${INK}`, borderRadius: 18, padding: '2px 26px 6px',
    boxShadow: '0 9px 0 rgba(0,0,0,0.55)', ...font, fontSize: size, color: c, whiteSpace: 'nowrap', lineHeight: 1.05}}>{text}</div>
);

// ---------------- A · antes / después ----------------
const BA: Record<string, [string, string]> = {
  cold: ['+15°C', '-273°C'], ocean: ['WEEK 1', 'WEEK 300'], babies: ['2030', '2130'], heat: ['MONTH 1', 'MONTH 447'], thirty: ['AGE 29', 'AGE 30'], purge: ['6:59 PM', '7:00 PM'],
  nosleep: ['NIGHT 1', 'NIGHT 30'], money: ['$48,210', '$0'], deathdate: ['2031', '14·08·2033'], memory: ['11:59 PM', '00:00'], gravity: ['0 SEC', '5 SEC'], power: ['ON', 'OFF'], powers: ['DAY 1', 'YEAR 10'],
};
export const ThumbA: React.FC<{k: string}> = ({k}) => {
  const c = CFG2[k]; const F = c.fx ? FX[c.fx] : null; const [l, r] = BA[k];
  return (<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    <AbsoluteFill style={{clipPath: LEFT}}><LandMap land={GREEN} /><Rays x={320} y={440} c="rgba(255,255,230,0.9)" a={0.45} n={20} r={900} /><Eyes mood="happy" skip={(x, y) => Math.hypot(x - 320, y - 440) < 220 || y < 150} />
      <Glow x={320} y={440} r={300} c="rgba(255,250,200,0.8)" /><div style={{position: 'absolute', left: 320 - 190, top: 440 - 190, filter: 'brightness(1.3) saturate(1.25)'}}><Planet size={380} mood="happy" lon={15} lat={20} rim="#fff6c0" /></div></AbsoluteFill>
    <AbsoluteFill style={{clipPath: RIGHT}}><LandMap land={c.land} dark={c.dark} /><Rays x={960} y={440} c={c.ray} a={0.4} n={20} r={900} /><Eyes mood={c.eyes} skip={(x, y) => Math.hypot(x - 960, y - 440) < 220 || y < 150} />
      {F && <F />}<AbsoluteFill style={{background: 'radial-gradient(ellipse at 75% 55%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)'}} />
      <Glow x={960} y={440} r={320} c={c.glow} /><div style={{position: 'absolute', left: 960 - 190, top: 440 - 190, transform: `rotate(${c.heroRot ?? 0}deg)`, filter: 'brightness(1.2) saturate(1.2)'}}><Planet size={380} mood={c.hero} lon={15} lat={20} rim={c.glow} helmet={c.heroHelmet} /></div>
      <Icon name={c.icon} x={1150} y={600} w={150} c={c.ic} glow={c.glow} rot={10} /></AbsoluteFill>
    <Bolt rc={c.glow} />
    <Lbl text={l} x={320} y={40} bg="#ffffff" size={l.length > 8 ? 58 : 70} rot={-3} />
    <Lbl text={r} x={960} y={40} bg={c.glow} size={r.length > 8 ? 58 : 70} rot={3} />
  </AbsoluteFill>);
};

// ---------------- B · countryball protagonista ----------------
type BC = {hero: string; mood: Mood; crown?: boolean; helmet?: boolean; sweat?: boolean; rot?: number; top: string; bot: string; ts: number; bs: number; icon: string; side: [string, Mood, boolean?][]};
const BCFG: Record<string, BC> = {
  cold: {hero: 'RU', mood: 'smug', crown: true, top: 'CAN RUSSIA SURVIVE', bot: '-273°C?', ts: 92, bs: 140, icon: 'thermometer-cold', side: [['CA', 'scared', true], ['NO', 'scared', true], ['US', 'shocked']]},
  ocean: {hero: 'NL', mood: 'scared', sweat: true, top: 'CAN THE DUTCH', bot: 'BEAT THE OCEAN?', ts: 104, bs: 104, icon: 'drowning', side: [['BD', 'scared', true], ['US', 'scared', true], ['CH', 'smug']]},
  babies: {hero: 'JP', mood: 'sad', top: 'WHO WILL BE', bot: 'THE LAST HUMAN?', ts: 104, bs: 108, icon: 'baby-bottle', side: [['IT', 'sad'], ['KR', 'shocked', true], ['NG', 'calm']]},
  heat: {hero: 'CA', mood: 'smug', crown: true, top: 'WHO SURVIVES', bot: '+460°C?', ts: 110, bs: 140, icon: 'flame', side: [['IN', 'scared', true], ['SA', 'scared', true], ['BR', 'shocked', true]]},
  thirty: {hero: 'NG', mood: 'smug', crown: true, top: 'NOBODY OVER 30', bot: 'WHO RULES NOW?', ts: 100, bs: 108, icon: 'heart-beats', side: [['JP', 'scared', true], ['IT', 'scared', true], ['US', 'shocked']]},
  purge: {hero: 'US', mood: 'angry', helmet: true, top: 'AMERICA DURING', bot: 'THE PURGE', ts: 104, bs: 132, icon: 'kitchen-knives', side: [['CA', 'calm'], ['MX', 'scared', true], ['JP', 'calm']]},
  nosleep: {hero: 'GB', mood: 'shocked', sweat: true, top: 'DAY 11', bot: 'WITHOUT SLEEP', ts: 130, bs: 116, icon: 'alarm-clock', side: [['US', 'scared', true], ['RU', 'angry'], ['IN', 'scared', true]]},
  money: {hero: 'BR', mood: 'smug', crown: true, top: 'WHO GETS RICH', bot: 'WITHOUT MONEY?', ts: 108, bs: 104, icon: 'money-stack', side: [['US', 'scared', true], ['CH', 'shocked', true], ['JP', 'sad']]},
  deathdate: {hero: 'JP', mood: 'scared', sweat: true, top: 'WHY DO 2 BILLION', bot: 'DIE THE SAME DAY?', ts: 96, bs: 96, icon: 'burning-meteor', side: [['PH', 'scared', true], ['CL', 'scared', true], ['US', 'shocked']]},
  memory: {hero: 'KR', mood: 'smug', top: 'WHO REMEMBERS', bot: 'AFTER MIDNIGHT?', ts: 104, bs: 104, icon: 'brain', side: [['FR', 'shocked'], ['US', 'shocked'], ['IN', 'scared', true]]},
  gravity: {hero: 'JP', mood: 'scared', sweat: true, rot: -22, top: 'GRAVITY TURNS OFF', bot: 'FOR 5 SECONDS', ts: 94, bs: 110, icon: 'falling', side: [['US', 'scared', true], ['BR', 'shocked'], ['IN', 'scared', true]]},
  power: {hero: 'CN', mood: 'smug', crown: true, top: 'WHO RULES A WORLD', bot: 'WITHOUT POWER?', ts: 94, bs: 106, icon: 'candle-light', side: [['US', 'scared', true], ['JP', 'shocked'], ['DE', 'scared', true]]},
  powers: {hero: 'BE', mood: 'smug', crown: true, top: 'BELGIUM GOT', bot: 'THE BEST POWER?', ts: 116, bs: 108, icon: 'light-bulb', side: [['JP', 'shocked'], ['US', 'shocked', true], ['CN', 'angry']]},
};
const HX = 330, HY = 420, SIDE = [[1150, 190, 140], [1100, 360, 150], [1160, 520, 130]];
export const ThumbB: React.FC<{k: string}> = ({k}) => {
  const c = CFG2[k], b = BCFG[k]; const F = c.fx ? FX[c.fx] : null;
  const covered = (x: number, y: number) => Math.hypot(x - HX, y - HY) < 240 || SIDE.some(([sx, sy, ss]) => Math.hypot(x - sx, y - sy) < ss * 0.62) || y < 135 || (y > 580 && x > 250 && x < 1050);
  return (<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    <LandMap land={c.land} dark={c.dark} />
    <Rays x={HX} y={HY} c={c.ray} a={0.45} n={20} r={1100} />
    <Eyes mood={c.eyes as EyeMood} skip={covered} />
    {F && <F />}
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 100%)'}} />
    <Glow x={640} y={460} r={170} c={c.glow} />
    <Icon name={b.icon} x={650} y={460} w={190} c={c.ic} glow={c.glow} rot={-6} />
    <Glow x={HX} y={HY} r={300} c={c.glow} a={0.8} />
    <Ball k={K(b.hero)} size={380} mood={b.mood} x={HX} y={HY} crown={b.crown} helmet={b.helmet} sweat={b.sweat} rot={b.rot ?? 0} rim={c.glow} look={[0.5, 0]} />
    {b.side.map((s, i) => <Ball key={i} k={K(s[0])} size={SIDE[i][2]} mood={s[1]} x={SIDE[i][0]} y={SIDE[i][1]} sweat={s[2]} rim={c.glow} look={[-0.6, 0]} rot={k === 'gravity' ? (i - 1) * 30 : 0} />)}
    <Title3D text={b.top} y={14} size={b.ts} grad={WHITE} glow="rgba(0,0,0,0.6)" rot={-2} />
    <Title3D text={b.bot} y={H - b.bs * 1.12 - 6} size={b.bs} grad={c.botGrad ?? GOLD} glow={c.glow} rot={-2} />
  </AbsoluteFill>);
};

// ---------------- C · dato gigante ----------------
type CC = {pre: string; big: string; bs: number; ball: string; bm: Mood; post?: string};
const CCFG: Record<string, CC> = {
  cold: {pre: 'EARTH REACHES', big: '-273°C', bs: 200, ball: 'RU', bm: 'scared'},
  ocean: {pre: 'SEA LEVEL', big: '+300M', bs: 215, ball: 'NL', bm: 'scared'},
  babies: {pre: 'BABIES BORN THIS YEAR', big: '0', bs: 420, ball: 'JP', bm: 'sad'},
  heat: {pre: 'EARTH REACHES', big: '+460°C', bs: 200, ball: 'IN', bm: 'scared'},
  thirty: {pre: 'EVERYONE DIES AT', big: '30', bs: 400, ball: 'IT', bm: 'scared'},
  purge: {pre: 'ALL CRIME IS LEGAL FOR', big: '12H', bs: 340, ball: 'US', bm: 'angry'},
  nosleep: {pre: 'HOURS WITHOUT SLEEP', big: '264', bs: 340, ball: 'GB', bm: 'shocked'},
  money: {pre: 'YOUR BANK ACCOUNT', big: '$0', bs: 400, ball: 'US', bm: 'sad'},
  deathdate: {pre: '2 BILLION PEOPLE DIE ON', big: '14/08', bs: 235, ball: 'JP', bm: 'scared'},
  memory: {pre: 'YOUR MEMORY RESETS AT', big: '00:00', bs: 225, ball: 'FR', bm: 'shocked'},
  gravity: {pre: 'NO GRAVITY FOR', big: '5 SEC', bs: 235, ball: 'BR', bm: 'scared'},
  power: {pre: 'ELECTRICITY', big: 'OFF', bs: 360, ball: 'DE', bm: 'scared'},
  powers: {pre: 'EVERY COUNTRY GETS A', big: 'POWER', bs: 205, ball: 'JP', bm: 'smug'},
};
const Arrow: React.FC<{x: number; y: number; rot: number; col: string}> = ({x, y, rot, col}) => (
  <svg width={260} height={160} style={{position: 'absolute', left: x - 130, top: y - 80, transform: `rotate(${rot}deg)`, overflow: 'visible'}}>
    <path d="M10,95 Q110,20 200,70 L190,30 L250,95 L175,130 L190,95 Q110,55 30,115 Z" fill={col} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
  </svg>
);
export const ThumbC: React.FC<{k: string}> = ({k}) => {
  const c = CFG2[k], d = CCFG[k]; const F = c.fx ? FX[c.fx] : null;
  return (<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, filter: 'blur(5px) brightness(0.75)'}}><LandMap land={c.land} dark={c.dark} /></div>
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 66% 50%, ${c.glow}55 0%, rgba(0,0,0,0) 55%), radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)`}} />
    <Rays x={830} y={380} c={c.ray} a={0.35} n={24} r={1100} />
    {F && <F />}
    <Title3D text={d.pre} x={830} y={80} size={66} grad={WHITE} glow="rgba(0,0,0,0.7)" rot={-2} />
    <Title3D text={d.big} x={870} y={Math.max(165, 390 - d.bs * 0.6)} size={d.bs} grad={c.botGrad ?? GOLD} glow={c.glow} rot={-3} />
    <Glow x={250} y={470} r={300} c={c.glow} />
    <div style={{position: 'absolute', left: 250 - 210, top: 470 - 210, transform: `rotate(${c.heroRot ?? -6}deg)`, filter: 'brightness(1.3) saturate(1.25)'}}><Planet size={420} mood={c.hero} lon={15} lat={20} rim={c.glow} helmet={c.heroHelmet} look={[0.6, -0.3]} /></div>
    <Arrow x={470} y={250} rot={-18} col="#ff3b30" />
    <Ball k={K(d.ball)} size={170} mood={d.bm} x={1130} y={600} rim={c.glow} sweat={d.bm === 'scared'} look={[-0.6, -0.4]} />
    <Icon name={c.icon} x={560} y={620} w={120} c={c.ic} glow={c.glow} rot={12} />
  </AbsoluteFill>);
};
export const W3_KEYS = Object.keys(BA);
