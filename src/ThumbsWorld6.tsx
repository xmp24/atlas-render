// Miniaturas "A World With" v6 — estilo de las referencias del usuario (6 CONTINENTS 1 WINNER / EUROPE vs ASIA / WORLD BATTLE ROYALE):
// UI plana y limpia: cajas blancas con borde oscuro, píldoras de color, barra de porcentajes, ranking TOP 5, bolas planas, mapa con banderas.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {COUNTRIES, FlagCanvas} from './HexWorld';
import {PolyCanvas, proj} from './PolyWorld';
import {INK, Mood, font} from './lib3';
import {Face2} from './ThumbsWorld4';

const W = 1280, H = 720;
const K = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
const RED = '#e8262a', YEL = '#ffd23f', BLUE = '#2f6bff';
const NAME: Record<string, string> = {NG: 'Nigeria', ET: 'Ethiopia', CD: 'DR Congo', IN: 'India', PK: 'Pakistan', ID: 'Indonesia', PH: 'Philippines', JP: 'Japan', MX: 'Mexico', US: 'USA', CH: 'Switzerland', KR: 'S. Korea', DE: 'Germany'};

// ---------- mapa ----------
type Cam = {cx: number; cy: number; s: number};
const cam = (lon: number, lat: number, s: number): Cam => { const [cx, cy] = proj([lon, lat]) as [number, number]; return {cx, cy, s}; };
const scr = (c: Cam, lon: number, lat: number) => { const [x, y] = proj([lon, lat]) as [number, number]; return [(x - c.cx) * c.s + W / 2, (y - c.cy) * c.s + H / 2]; };
const Map: React.FC<{c: Cam; pal?: boolean; filter?: string}> = ({c, pal, filter = 'saturate(1.25)'}) => (
  <AbsoluteFill style={{overflow: 'hidden', background: '#1a4f9a'}}>
    <div style={{position: 'absolute', inset: -20, filter}}>
      <PolyCanvas cev={[]} t={0} tm={0} byTm={false} cam={c} W={W + 40} H={H + 40} opts={{squads: false, capitalsOff: true, war: null, empire: null, waves: true, solid: pal, pal} as any} />
    </div>
  </AbsoluteFill>
);
const WORLD = cam(10, 24, 0.24), EUROPE = cam(14, 50, 0.8), NAM = cam(-100, 45, 0.4), AMER = cam(-80, 14, 0.3);

// ---------- bola plana ----------
type BK = string | 'earth' | 'earthDark' | 'water';
const Ball: React.FC<{k: BK; s: number; x: number; y: number; m: Mood; look?: [number, number]; rot?: number}> = ({k, s, x, y, m, look = [0, 0.1], rot = 0}) => (
  <div style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, transform: `rotate(${rot}deg)`, filter: 'drop-shadow(0 6px 0 rgba(0,0,0,0.35))'}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', border: `${Math.max(4, s * 0.035)}px solid ${INK}`, background: '#123'}}>
      {k === 'earth' || k === 'earthDark' ? (() => { const IW = s * 3, IH = IW / 2; return <Img src={staticFile('hw/marble2k.jpg')} style={{position: 'absolute', left: -((15 + 180) / 360) * IW + s / 2, top: -((90 - 22) / 180) * IH + s / 2, width: IW, height: IH, filter: k === 'earth' ? 'saturate(1.5) brightness(1.15)' : 'brightness(0.35) saturate(0.5)'}} />; })()
        : k === 'water' ? <AbsoluteFill style={{background: 'linear-gradient(180deg, #7fdcff 0%, #2f9bff 50%, #0a4fc8 100%)'}} />
        : <div style={{filter: 'saturate(1.15)'}}><FlagCanvas k={K(k)} w={s} h={s} /></div>}
      <AbsoluteFill style={{borderRadius: '50%', boxShadow: `inset ${-s * 0.06}px ${-s * 0.08}px 0 rgba(0,0,0,0.18)`}} />
      <div style={{position: 'absolute', left: s * 0.16, top: s * 0.1, width: s * 0.3, height: s * 0.14, borderRadius: '50%', background: 'rgba(255,255,255,0.45)', transform: 'rotate(-25deg)'}} />
    </div>
    <svg width={s} height={s} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><g transform={`translate(${s / 2},${s * 0.45})`}><Face2 r={s * 0.3} mood={m} look={look} /></g></svg>
  </div>
);
// ojos saltones sobre el mapa
const Googly: React.FC<{x: number; y: number; s: number; m?: 'angry' | 'scared' | 'normal'; look?: number}> = ({x, y, s, m = 'normal', look = 0}) => (
  <svg width={s * 2.4} height={s * 1.6} style={{position: 'absolute', left: x - s * 1.2, top: y - s * 0.8, overflow: 'visible', filter: 'drop-shadow(0 3px 0 rgba(0,0,0,0.4))'}}>
    {[-1, 1].map((d) => <g key={d}><ellipse cx={s * 1.2 + d * s * 0.55} cy={s * 0.8} rx={s * 0.5} ry={s * 0.62} fill="#fff" stroke={INK} strokeWidth={s * 0.1} />
      <circle cx={s * 1.2 + d * s * 0.55 + look * s * 0.2} cy={s * 0.85} r={m === 'scared' ? s * 0.14 : s * 0.24} fill={INK} />
      {m === 'angry' && <path d={`M${s * 1.2 + d * s * 1.08},${s * 0.12} L${s * 1.2 + d * s * 0.1},${s * 0.5}`} stroke={INK} strokeWidth={s * 0.16} strokeLinecap="round" />}</g>)}
  </svg>
);

// ---------- piezas de interfaz ----------
const Box: React.FC<{parts: [string, string?][]; y: number; size: number; bg?: string; children?: React.ReactNode; rot?: number}> = ({parts, y, size, bg = '#fff', children, rot = 0}) => (
  <div style={{position: 'absolute', left: 0, width: W, top: y, display: 'flex', justifyContent: 'center'}}>
    <div style={{background: bg, border: `${size * 0.09}px solid ${INK}`, borderRadius: size * 0.3, padding: `${size * 0.06}px ${size * 0.38}px ${size * 0.1}px`, boxShadow: `0 ${size * 0.1}px 0 ${INK}, 0 ${size * 0.2}px ${size * 0.3}px rgba(0,0,0,0.45)`, display: 'flex', alignItems: 'center', gap: size * 0.22, transform: `rotate(${rot}deg)`}}>
      <div style={{...font, fontSize: size, lineHeight: 1.1, color: INK, whiteSpace: 'nowrap'}}>{parts.map(([t, c], i) => <span key={i} style={{color: c || INK}}>{t}</span>)}</div>
      {children}
    </div>
  </div>
);
const Ico: React.FC<{n: string; w: number; c: string}> = ({n, w, c}) => (
  <div style={{width: w, height: w, background: c, WebkitMaskImage: `url(${staticFile(`hw/icons/${n}.svg`)})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', filter: `drop-shadow(0 0 1.5px ${INK}) drop-shadow(0 0 1.5px ${INK})`}} />
);
const Pill: React.FC<{text: string; x: number; y: number; bg?: string; size?: number}> = ({text, x, y, bg = RED, size = 40}) => (
  <div style={{position: 'absolute', left: x, top: y, background: bg, borderRadius: size * 0.35, border: `${size * 0.1}px solid ${INK}`, padding: `${size * 0.1}px ${size * 0.45}px ${size * 0.16}px`, boxShadow: `0 ${size * 0.12}px 0 ${INK}`, ...font, fontSize: size, color: '#fff', whiteSpace: 'nowrap', lineHeight: 1.1}}>{text}</div>
);
const Big: React.FC<{lines: string[]; x: number; y: number; size: number; accent?: number}> = ({lines, x, y, size, accent}) => (
  <div style={{position: 'absolute', left: x, top: y}}>
    {lines.map((l, i) => <div key={i} style={{position: 'relative', ...font, fontSize: size, lineHeight: 0.98, whiteSpace: 'nowrap'}}>
      <div style={{color: INK, WebkitTextStroke: `${size * 0.16}px ${INK}`, textShadow: `0 ${size * 0.07}px 0 ${INK}`}}>{l}</div>
      <div style={{position: 'absolute', left: 0, top: 0, color: i === accent ? YEL : '#fff'}}>{l}</div>
    </div>)}
  </div>
);
const Vig: React.FC<{a?: number}> = ({a = 0.45}) => <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,${a}) 100%)`}} />;

// ---------- L1 · fila de bolas ----------
type L1 = {l: 1; title: [string, string?][]; balls: [BK, Mood, number?][]; q: string; icon: string; ic: string; c: Cam; tint?: string; filter?: string};
const Row: React.FC<{v: L1}> = ({v}) => {
  const sz = [176, 186, 196, 196, 212, 186];
  return (<>
    <Map c={v.c} filter={v.filter ?? 'saturate(1.2) brightness(0.62) blur(1.5px)'} />
    {v.tint && <AbsoluteFill style={{background: v.tint}} />}
    <Vig />
    <Box parts={v.title} y={34} size={74} />
    {v.balls.map(([k, m, r], i) => <Ball key={i} k={k} m={m} rot={r ?? 0} s={sz[i]} x={640 + (i - 2.5) * 200} y={372 - (sz[i] - 172) * 0.15} look={[i < 3 ? 0.4 : -0.4, 0.1]} />)}
    <Box parts={[[v.q]]} y={548} size={74} bg={YEL}><Ico n={v.icon} w={84} c={v.ic} /></Box>
  </>);
};

// ---------- L2 · barra de porcentajes ----------
type L2 = {l: 2; a: [BK, Mood, string, number]; b: [BK, Mood, string]; label: string; c: Cam; eyes: [number, number, number, 'angry' | 'scared' | 'normal'][]; filter?: string; over?: 'water' | 'night'};
const Versus: React.FC<{v: L2}> = ({v}) => {
  const p = v.a[3], x0 = 150, x1 = 1130, xm = x0 + (x1 - x0) * p / 100;
  return (<>
    <Map c={v.c} filter={v.filter} />
    {v.over === 'water' && <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>{[0, 1].map((k) => <path key={k} d={`M0,${470 + k * 60} ${Array.from({length: 9}, (_, i) => `Q${i * 160 + 80},${450 + k * 60 + (i % 2 ? -22 : 22)} ${i * 160 + 160},${470 + k * 60}`).join(' ')} L1280,720 L0,720 Z`} fill={k ? 'rgba(10,70,190,0.8)' : 'rgba(50,150,255,0.55)'} stroke={k ? 'none' : '#e6f6ff'} strokeWidth={5} />)}</svg>}
    {v.over === 'night' && <>{Array.from({length: 60}, (_, i) => { const r = Math.sin(i * 91.3) * 43758.5; const fx = r - Math.floor(r), fy = Math.sin(i * 17.7) * 9999 % 1; return <div key={i} style={{position: 'absolute', left: 60 + fx * 1160, top: 180 + Math.abs(fy) * 360, width: 6, height: 6, borderRadius: '50%', background: '#ffd96a', boxShadow: '0 0 10px 3px #ffb030', opacity: i % 3 ? 0.25 : 0.9}} />; })}</>}
    <Vig a={0.35} />
    {v.eyes.map(([x, y, s, m], i) => <Googly key={i} x={x} y={y} s={s} m={m} look={x < 640 ? 0.5 : -0.5} />)}
    <div style={{position: 'absolute', left: 16, top: 14, width: W - 32, height: 116, borderRadius: 26, background: 'rgba(12,22,48,0.9)', border: `5px solid ${INK}`, boxShadow: '0 8px 20px rgba(0,0,0,0.5)'}} />
    <div style={{position: 'absolute', left: x0, top: 30, ...font, fontSize: 40, color: '#8fc0ff'}}>{v.a[2]} <span style={{color: '#fff'}}>{p}%</span></div>
    <div style={{position: 'absolute', right: W - x1, top: 30, ...font, fontSize: 40, color: '#ff9a8a', textAlign: 'right'}}><span style={{color: '#fff'}}>{100 - p}%</span> {v.b[2]}</div>
    <div style={{position: 'absolute', left: x0, top: 84, width: x1 - x0, height: 30, borderRadius: 15, overflow: 'hidden', border: `4px solid ${INK}`, background: RED}}>
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: xm - x0, background: `linear-gradient(180deg, #6aa0ff, ${BLUE})`}} />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 50%)'}} />
    </div>
    <Ball k={v.a[0]} m={v.a[1]} s={96} x={78} y={72} look={[0.5, 0]} />
    <Ball k={v.b[0]} m={v.b[1]} s={96} x={W - 78} y={72} look={[-0.5, 0]} />
  </>);
};
// Box con texto blanco para la etiqueta roja
const RedLabel: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', left: 0, width: W, top: 584, display: 'flex', justifyContent: 'center'}}>
    <div style={{background: `linear-gradient(180deg, #ff4a3a, ${RED} 55%, #b8141a)`, border: `6px solid ${INK}`, borderRadius: 22, padding: '6px 34px 10px', boxShadow: `0 8px 0 ${INK}, 0 14px 24px rgba(0,0,0,0.5)`, ...font, fontSize: 72, color: '#fff', whiteSpace: 'nowrap', lineHeight: 1.08, transform: 'rotate(-1deg)', textShadow: `0 4px 0 rgba(0,0,0,0.35)`}}>{text}</div>
  </div>
);

// ---------- L3 · ranking ----------
type L3 = {l: 3; lines: string[]; accent: number; pill: string; card: string; top: [string, number][]; hero: [BK, Mood]; c: Cam; filter?: string};
const Rank: React.FC<{v: L3}> = ({v}) => (<>
  <Map c={v.c} pal filter={v.filter ?? 'saturate(1.15) brightness(0.92)'} />
  <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(5,15,40,0.55) 0%, rgba(5,15,40,0) 55%)'}} />
  <Vig a={0.35} />
  <Big lines={v.lines} x={42} y={40} size={118} accent={v.accent} />
  <Pill text={v.pill} x={46} y={292} size={42} />
  <Ball k={v.hero[0]} m={v.hero[1]} s={250} x={250} y={540} look={[0.5, 0]} />
  <div style={{position: 'absolute', left: 800, top: 108, width: 450, background: '#fff', border: `6px solid ${INK}`, borderRadius: 26, boxShadow: `0 10px 0 ${INK}, 0 18px 30px rgba(0,0,0,0.5)`, padding: '14px 22px 18px'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 12}}><Ico n="trophy-cup" w={52} c={YEL} /><div style={{...font, fontSize: 52, color: INK, lineHeight: 1}}>TOP 5</div></div>
    <div style={{...font, fontSize: 24, color: '#6a7080', margin: '2px 0 10px'}}>{v.card}</div>
    {v.top.map(([k, p], i) => <div key={k} style={{display: 'flex', alignItems: 'center', height: 82, borderTop: i ? '3px solid #e6e9f0' : 'none'}}>
      <div style={{...font, fontSize: 40, color: INK, width: 42}}>{i + 1}</div>
      <div style={{width: 74, height: 50, borderRadius: 8, overflow: 'hidden', border: `3px solid ${INK}`, marginRight: 14}}><FlagCanvas k={K(k)} w={68} h={44} /></div>
      <div style={{...font, fontSize: 34, color: INK, flex: 1, whiteSpace: 'nowrap'}}>{NAME[k] ?? k}</div>
      <div style={{...font, fontSize: 40, color: i === 0 ? RED : '#3a4050'}}>{p}%</div>
    </div>)}
  </div>
</>);

// ---------- configuración por vídeo ----------
type V = L1 | L2 | L3;
const ec = (c: Cam, lon: number, lat: number, s: number, m: 'angry' | 'scared' | 'normal'): [number, number, number, 'angry' | 'scared' | 'normal'] => { const [x, y] = scr(c, lon, lat); return [x, y, s, m]; };
export const V6: Record<string, V> = {
  cold: {l: 1, title: [['1°C COLDER, '], ['EVERY MONTH', '#1a8ae8']], balls: [['RU', 'scared'], ['CA', 'scared'], ['US', 'shocked'], ['CN', 'sad'], ['BR', 'calm'], ['NG', 'smug']], q: 'WHO SURVIVES?', icon: 'snowflake-1', ic: '#2fb0ff', c: WORLD, tint: 'rgba(80,180,255,0.18)'},
  heat: {l: 1, title: [['1°C HOTTER, '], ['EVERY MONTH', RED]], balls: [['IN', 'scared'], ['BR', 'shocked'], ['US', 'scared'], ['AU', 'sad'], ['RU', 'smug'], ['CA', 'happy']], q: 'WHO SURVIVES?', icon: 'flame', ic: '#ff5a2a', c: WORLD, tint: 'rgba(255,90,20,0.18)'},
  thirty: {l: 1, title: [['EVERYONE OVER '], ['30 DIES', RED]], balls: [['JP', 'scared'], ['IT', 'scared'], ['DE', 'sad'], ['US', 'shocked'], ['NG', 'smug'], ['ET', 'happy']], q: 'WHO SURVIVES?', icon: 'sands-of-time', ic: '#e8a000', c: WORLD},
  gravity: {l: 1, title: [['GRAVITY OFF '], ['FOR 5 SECONDS', '#7a2cff']], balls: [['US', 'scared', -25], ['BR', 'shocked', 30], ['JP', 'scared', -40], ['IN', 'shocked', 20], ['GB', 'scared', -15], ['EG', 'shocked', 35]], q: 'WHAT BREAKS?', icon: 'falling', ic: '#7a2cff', c: WORLD, tint: 'rgba(120,60,255,0.15)'},
  powers: {l: 1, title: [['195 COUNTRIES, '], ['195 POWERS', RED]], balls: [['US', 'smug'], ['CN', 'angry'], ['BR', 'happy'], ['AR', 'angry'], ['AU', 'happy'], ['BE', 'shocked']], q: 'WHO WINS?', icon: 'trophy-cup', ic: '#e8a000', c: WORLD},
  purge: {l: 2, a: ['CA', 'scared', 'SAFE', 27], b: ['US', 'angry', 'PURGE'], label: 'THE PURGE IS REAL', c: NAM, eyes: [ec(NAM, -100, 39, 70, 'angry'), ec(NAM, -105, 60, 62, 'scared'), ec(NAM, -102, 24, 46, 'scared')]},
  ocean: {l: 2, a: ['NL', 'scared', 'LAND', 31], b: ['water', 'smug', 'WATER'], label: 'EUROPE UNDERWATER', c: EUROPE, over: 'water', eyes: [ec(EUROPE, 5.3, 52.2, 34, 'scared'), ec(EUROPE, 2.5, 46.6, 48, 'scared'), ec(EUROPE, 10.4, 51.1, 44, 'scared')]},
  power: {l: 2, a: ['earth', 'calm', 'LIGHT', 12], b: ['earthDark', 'scared', 'DARK'], label: 'WORLD BLACKOUT', c: WORLD, over: 'night', filter: 'saturate(0.6) brightness(0.32)', eyes: [ec(WORLD, -100, 40, 46, 'scared'), ec(WORLD, 95, 40, 52, 'scared'), ec(WORLD, 20, 5, 46, 'scared')]},
  memory: {l: 2, a: ['earth', 'calm', 'MEMORY', 8], b: ['earth', 'scared', 'ERASED'], label: 'MEMORY WIPED AT 00:00', c: WORLD, filter: 'saturate(1.2) brightness(0.9) hue-rotate(-20deg)', eyes: [ec(WORLD, -100, 40, 46, 'scared'), ec(WORLD, 95, 38, 52, 'normal'), ec(WORLD, 20, 5, 44, 'scared')]},
  money: {l: 2, a: ['US', 'sad', 'CASH', 3], b: ['BR', 'smug', 'FOOD'], label: 'MONEY DISAPPEARED', c: AMER, eyes: [ec(AMER, -100, 40, 52, 'scared'), ec(AMER, -52, -10, 56, 'normal'), ec(AMER, -65, -35, 36, 'normal')]},
  babies: {l: 3, lines: ['THE LAST', 'HUMANS'], accent: 1, pill: '0 BIRTHS SINCE 2030', card: 'WHERE THE LAST HUMANS LIVE', top: [['NG', 31], ['ET', 22], ['CD', 18], ['IN', 12], ['PK', 9]], hero: ['JP', 'sad'], c: WORLD},
  deathdate: {l: 3, lines: ['DOOMSDAY', '2033'], accent: 1, pill: '2.1 BILLION · 1 DAY', card: 'WHO DIES ON 14 AUG 2033', top: [['ID', 21], ['PH', 17], ['JP', 15], ['MX', 12], ['US', 9]], hero: ['JP', 'scared'], c: WORLD},
  nosleep: {l: 3, lines: ['NO MORE', 'SLEEP'], accent: 1, pill: '8 BILLION · 0 HOURS', card: 'STILL WORKING · DAY 30', top: [['CH', 61], ['KR', 54], ['JP', 49], ['DE', 44], ['US', 38]], hero: ['GB', 'scared'], c: WORLD, filter: 'saturate(1.1) brightness(0.7) hue-rotate(25deg)'},
};
export const Thumb6: React.FC<{k: string}> = ({k}) => { const v = V6[k];
  return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>{v.l === 1 ? <Row v={v} /> : v.l === 2 ? <><Versus v={v} /><RedLabel text={v.label} /></> : <Rank v={v} />}</AbsoluteFill>; };
export const V6_KEYS = ['cold', 'ocean', 'babies', 'heat', 'thirty', 'purge', 'nosleep', 'money', 'deathdate', 'memory', 'gravity', 'power', 'powers'];
