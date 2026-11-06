// Miniaturas "A World With" v4 — rediseño premium: bolas con volumen/brillo/contorno sticker,
// estallidos de luz por país, gradación de color, 2 variantes: con título arriba (≤3 palabras) y sin texto.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {COUNTRIES, FlagCanvas} from './HexWorld';
import {INK, Mood, font} from './lib3';
import {GOLD, WHITE} from './ThumbsFinal';
import {Icon} from './ThumbsPro';
import {CFG2, LandMap, Eyes, FX, EyeMood, ICE, FIRE, BLOOD, PURP, CYAN} from './ThumbsWorld2';
import {Bolt, LEFT, RIGHT} from './ThumbsWorld';

const W = 1280, H = 720;
const K = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- cara estática con brillos en los ojos ----------
const Face2: React.FC<{r: number; mood: Mood; look?: [number, number]}> = ({r, mood, look = [0, 0]}) => {
  const ew = r * 0.42, eh = r * 0.5 * (mood === 'shocked' ? 1.15 : 1), ex = r * 0.48, sw = r * 0.09;
  const pr = mood === 'scared' || mood === 'shocked' ? r * 0.13 : r * 0.21;
  const angry = mood === 'angry';
  let mouth: React.ReactNode;
  if (mood === 'happy') mouth = <path d={`M${-r * 0.35},${r * 0.55} Q0,${r * 1.05} ${r * 0.35},${r * 0.55} Z`} fill="#8c1d2c" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />;
  else if (mood === 'calm') mouth = <path d={`M${-r * 0.22},${r * 0.62} Q0,${r * 0.82} ${r * 0.22},${r * 0.62}`} fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />;
  else if (mood === 'smug') mouth = <path d={`M${-r * 0.3},${r * 0.62} Q${r * 0.05},${r * 0.85} ${r * 0.35},${r * 0.5}`} fill="none" stroke={INK} strokeWidth={sw * 1.1} strokeLinecap="round" />;
  else if (angry) mouth = <g><path d={`M${-r * 0.32},${r * 0.78} Q0,${r * 0.5} ${r * 0.32},${r * 0.78} Z`} fill="#5a1220" stroke={INK} strokeWidth={sw} strokeLinejoin="round" /><path d={`M${-r * 0.2},${r * 0.66} L${r * 0.2},${r * 0.66}`} stroke="#fff" strokeWidth={sw * 0.8} /></g>;
  else if (mood === 'sad') mouth = <path d={`M${-r * 0.28},${r * 0.8} Q0,${r * 0.55} ${r * 0.28},${r * 0.8}`} fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />;
  else mouth = <g><ellipse cx={0} cy={r * 0.72} rx={r * 0.15} ry={r * 0.2} fill="#5a1220" stroke={INK} strokeWidth={sw} /><ellipse cx={0} cy={r * 0.82} rx={r * 0.08} ry={r * 0.06} fill="#e0566a" /></g>;
  return (<g>
    <defs><radialGradient id="eg4" cx="40%" cy="30%" r="75%"><stop offset="0%" stopColor="#ffffff" /><stop offset="75%" stopColor="#f2f5fb" /><stop offset="100%" stopColor="#c9d2e2" /></radialGradient></defs>
    {(mood === 'happy' || mood === 'calm' || mood === 'smug') && [-1, 1].map((sd) => <ellipse key={sd} cx={sd * (ex + r * 0.15)} cy={r * 0.5} rx={r * 0.2} ry={r * 0.11} fill="#ff7fa6" opacity={0.8} />)}
    {[-1, 1].map((sd) => { const px = sd * ex + look[0] * ew * 0.35, py = look[1] * eh * 0.3 + (angry ? r * 0.06 : 0); return (
      <g key={sd}>
        <ellipse cx={sd * ex} cy={0} rx={ew} ry={eh} fill={angry ? '#fff2f0' : 'url(#eg4)'} stroke={INK} strokeWidth={sw} />
        <circle cx={px} cy={py} r={pr} fill={angry ? '#c0141a' : INK} />
        {angry && <circle cx={px} cy={py} r={pr * 0.5} fill={INK} />}
        <circle cx={px - pr * 0.35} cy={py - pr * 0.4} r={Math.max(pr * 0.36, r * 0.05)} fill="#fff" />
        <circle cx={px + pr * 0.4} cy={py + pr * 0.35} r={Math.max(pr * 0.14, r * 0.025)} fill="#fff" />
        {angry && <path d={`M${sd * (ex + ew * 1.1)},${-eh * 1.15} L${sd * (ex - ew * 0.9)},${-eh * 0.55}`} stroke={INK} strokeWidth={sw * 1.6} strokeLinecap="round" />}
        {mood === 'smug' && <rect x={sd * ex - ew * 1.05} y={-eh * 1.1} width={ew * 2.1} height={eh * 0.8} fill="#fff" />}
        {mood === 'smug' && <path d={`M${sd * (ex + ew)},${-eh * 0.32} L${sd * (ex - ew)},${-eh * 0.32}`} stroke={INK} strokeWidth={sw * 1.3} strokeLinecap="round" />}
        {mood === 'sad' && <path d={`M${sd * (ex + ew)},${-eh * 0.6} L${sd * (ex - ew * 0.8)},${-eh * 1.2}`} stroke={INK} strokeWidth={sw * 1.4} strokeLinecap="round" />}
        {(mood === 'scared' || mood === 'shocked') && <path d={`M${sd * (ex + ew * 0.9)},${-eh * 1.3} Q${sd * ex},${-eh * 1.7} ${sd * (ex - ew * 0.9)},${-eh * 1.3}`} fill="none" stroke={INK} strokeWidth={sw * 1.2} strokeLinecap="round" />}
        {mood === 'sad' && <path d={`M${sd * ex},${eh * 0.85} q${sd * r * 0.05},${r * 0.24} 0,${r * 0.34} q${-sd * r * 0.07},${-r * 0.1} 0,${-r * 0.34}`} fill="#7fd0ff" stroke={INK} strokeWidth={sw * 0.6} />}
      </g>); })}
    {mouth}
  </g>);
};

// ---------- orbe: countryball o planeta, con volumen, brillo especular, rim light y contorno sticker ----------
type OrbP = {k?: string; planet?: boolean; s: number; x: number; y: number; mood: Mood; rim: string; look?: [number, number]; crown?: boolean; helmet?: boolean; sweat?: boolean; rot?: number};
export const Orb: React.FC<OrbP> = ({k, planet, s, x, y, mood, rim, look = [0, 0], crown, helmet, sweat, rot = 0}) => (
  <div style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, transform: `rotate(${rot}deg)`}}>
    <div style={{position: 'absolute', left: s * 0.08, top: s * 0.84, width: s * 0.84, height: s * 0.24, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%)'}} />
    <div style={{position: 'absolute', inset: -s * 0.055, borderRadius: '50%', background: '#fff', boxShadow: `0 ${s * 0.035}px 0 ${INK}, 0 0 0 ${s * 0.012}px ${INK}, 0 0 ${s * 0.2}px ${s * 0.04}px ${rim}`}} />
    <div style={{position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', border: `${s * 0.028}px solid ${INK}`, background: '#123'}}>
      {planet ? (() => { const IW = s * 3.0, IH = IW / 2; const lx = -((15 + 180) / 360) * IW + s / 2, ly = -((90 - 20) / 180) * IH + s / 2;
        return <Img src={staticFile('hw/marble2k.jpg')} style={{position: 'absolute', left: lx, top: ly, width: IW, height: IH, filter: 'saturate(1.5) contrast(1.15) brightness(1.15)'}} />; })()
        : <div style={{position: 'absolute', inset: 0, filter: 'saturate(1.25) contrast(1.05)'}}><FlagCanvas k={K(k!)} w={s} h={s} /></div>}
      {planet && <div style={{position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: `inset 0 0 ${s * 0.08}px ${s * 0.02}px rgba(120,200,255,0.8)`}} />}
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 34% 28%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 38%), radial-gradient(circle at 46% 42%, rgba(0,0,0,0) 52%, rgba(8,8,30,0.6) 100%)'}} />
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: `inset ${-s * 0.07}px ${-s * 0.06}px ${s * 0.05}px ${rim}, inset ${s * 0.035}px ${s * 0.04}px ${s * 0.05}px rgba(255,255,255,0.5)`}} />
      <div style={{position: 'absolute', left: s * 0.13, top: s * 0.07, width: s * 0.38, height: s * 0.2, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)', transform: 'rotate(-30deg)'}} />
      <div style={{position: 'absolute', left: s * 0.21, top: s * 0.12, width: s * 0.09, height: s * 0.055, borderRadius: '50%', background: '#fff', transform: 'rotate(-30deg)'}} />
    </div>
    <svg width={s} height={s} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.9))'}}>
      <g transform={`translate(${s / 2},${s * (planet ? 0.5 : 0.47)})`}><Face2 r={s * 0.29} mood={mood} look={look} /></g>
    </svg>
    {helmet && <div style={{position: 'absolute', left: s * 0.0, top: -s * 0.17, width: s, height: s * 0.42, borderRadius: `${s}px ${s}px ${s * 0.08}px ${s * 0.08}px`, background: 'radial-gradient(circle at 32% 25%, #a8ba6a 0%, #5a6a30 55%, #2e3618 100%)', border: `${s * 0.03}px solid ${INK}`, boxShadow: `0 ${s * 0.02}px 0 rgba(0,0,0,0.4), inset 0 ${s * 0.03}px 0 rgba(255,255,255,0.25)`}}>
      <div style={{position: 'absolute', left: '44%', top: '28%', width: s * 0.11, height: s * 0.11, background: '#ffd23f', clipPath: 'polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)'}} />
    </div>}
    {crown && <Icon name="crown" x={s / 2} y={-s * 0.14} w={s * 0.6} c="#ffd23f" glow="#fff0a0" />}
    {sweat && <svg width={s} height={s} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><path d={`M${s * 0.86},${s * 0.1} q${s * 0.06},${s * 0.12} 0,${s * 0.17} q${-s * 0.06},${-s * 0.05} 0,${-s * 0.17} Z`} fill="#8fd8ff" stroke={INK} strokeWidth={s * 0.014} /><ellipse cx={s * 0.845} cy={s * 0.2} rx={s * 0.012} ry={s * 0.02} fill="#fff" /></svg>}
  </div>
);

// ---------- estallido de luz con rayos irregulares, núcleo caliente y destellos ----------
const conic = (seed: number, n: number, c: string, wmin: number, wmax: number) => {
  const st: string[] = [];
  for (let i = 0; i < n; i++) { const a = i * 360 / n + (rnd(seed + i) - 0.5) * 8, w = wmin + rnd(seed * 3 + i) * (wmax - wmin);
    st.push(`transparent ${a.toFixed(1)}deg`, `${c} ${(a + 0.8).toFixed(1)}deg`, `${c} ${(a + w).toFixed(1)}deg`, `transparent ${(a + w + 0.8).toFixed(1)}deg`); }
  return `conic-gradient(from 0deg at 50% 50%, ${st.join(', ')})`;
};
export const Burst: React.FC<{x: number; y: number; c: string; core: string; r?: number; seed?: number; a?: number}> = ({x, y, c, core, r = 1000, seed = 1, a = 0.6}) => (<>
  <div style={{position: 'absolute', left: x - r * 0.6, top: y - r * 0.6, width: r * 1.2, height: r * 1.2, borderRadius: '50%', background: `radial-gradient(circle, ${core} 0%, ${c} 22%, rgba(0,0,0,0) 62%)`, mixBlendMode: 'screen', opacity: 0.6}} />
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, background: conic(seed, 16, c, 5, 12), mixBlendMode: 'screen', opacity: a, filter: 'blur(1.5px)',
    WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 6%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0) 72%)'}} />
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, background: conic(seed + 50, 24, 'rgba(255,255,255,0.9)', 0.8, 2.2), mixBlendMode: 'screen', opacity: a * 0.55,
    WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 5%, rgba(0,0,0,0) 48%)'}} />
  <div style={{position: 'absolute', left: x - r * 0.22, top: y - r * 0.22, width: r * 0.44, height: r * 0.44, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 65%)', mixBlendMode: 'screen'}} />
</>);
const Spark: React.FC<{x: number; y: number; s: number; c?: string}> = ({x, y, s, c = '#fff'}) => (
  <div style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, background: c, clipPath: 'polygon(50% 0,58% 42%,100% 50%,58% 58%,50% 100%,42% 58%,0 50%,42% 42%)', filter: `drop-shadow(0 0 ${s * 0.25}px ${c})`}} />
);
const Sparks: React.FC<{x: number; y: number; R: number; seed: number; c?: string; n?: number}> = ({x, y, R, seed, c, n = 7}) => (<>
  {Array.from({length: n}, (_, i) => { const an = rnd(seed + i * 7) * 6.28, d = R * (0.85 + rnd(seed + i) * 0.5); return <Spark key={i} x={x + Math.cos(an) * d} y={y + Math.sin(an) * d} s={14 + rnd(seed * 2 + i) * 26} c={c} />; })}
</>);

// ---------- gradación, viñeta y fondo ----------
const Grade: React.FC<{tone: string; top?: boolean}> = ({tone, top}) => (<>
  <AbsoluteFill style={{background: `linear-gradient(180deg, ${tone}${top ? 'ee' : 'aa'} 0%, ${tone}00 ${top ? 30 : 26}%, ${tone}00 70%, ${tone}bb 100%)`}} />
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 52%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.62) 100%)'}} />
</>);
const Map4: React.FC<{land: string; dark?: number; eyes: EyeMood; skip: (x: number, y: number) => boolean}> = ({land, dark, eyes, skip}) => (
  <AbsoluteFill style={{filter: 'saturate(1.35) contrast(1.12) brightness(0.95) blur(0.8px)'}}>
    <LandMap land={land} dark={dark} />
    <Eyes mood={eyes} skip={skip} />
  </AbsoluteFill>
);

// ---------- título superior (≤3 palabras, dos tonos) ----------
const TitleTop: React.FC<{parts: [string, string][]; glow: string}> = ({parts, glow}) => {
  const n = parts.map((p) => p[0]).join(' ').length; const size = Math.min(148, 1150 / (n * 0.56));
  const depth = Array.from({length: 7}, (_, i) => `0 ${(i + 1) * size * 0.012}px 0 #141414`).join(', ');
  return (<div style={{position: 'absolute', left: 0, width: W, top: Math.max(8, 70 - size * 0.55), display: 'flex', justifyContent: 'center', gap: size * 0.24, transform: 'rotate(-2deg)'}}>
    {parts.map(([t, g], i) => <div key={i} style={{position: 'relative', ...font, fontSize: size, lineHeight: 1.08, whiteSpace: 'nowrap'}}>
      <div style={{color: INK, WebkitTextStroke: `${size * 0.2}px ${INK}`, textShadow: `${depth}, 0 0 ${size * 0.5}px ${glow}`}}>{t}</div>
      <div style={{position: 'absolute', inset: 0, background: g, WebkitBackgroundClip: 'text', color: 'transparent'}}>{t}</div>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 42%)', WebkitBackgroundClip: 'text', color: 'transparent'}}>{t}</div>
    </div>)}
  </div>);
};
const Lbl4: React.FC<{text: string; x: number; bg: string; rot: number; glow: string}> = ({text, x, bg, rot, glow}) => (
  <div style={{position: 'absolute', left: x, top: 34, transform: `translate(-50%,0) rotate(${rot}deg)`, background: bg, border: `8px solid ${INK}`, borderRadius: 22, padding: '4px 30px 8px',
    boxShadow: `0 10px 0 ${INK}, 0 0 40px ${glow}, inset 0 6px 0 rgba(255,255,255,0.6), inset 0 -8px 0 rgba(0,0,0,0.18)`, ...font, fontSize: text.length > 6 ? 66 : 82, color: INK, whiteSpace: 'nowrap', lineHeight: 1.05}}>{text}</div>
);

// ---------- configuración por vídeo ----------
type Side = [string, Mood, boolean?, number?];
type V = {t: 'A'; lab: [string, string]; tone: string; core: string} | {t: 'B'; hero: string; mood: Mood; crown?: boolean; helmet?: boolean; sweat?: boolean; rot?: number; icon: string; side: Side[]; title: [string, string][]; tone: string; core: string};
export const V4: Record<string, V> = {
  cold: {t: 'A', lab: ['+15°C', '-273°C'], tone: '#03224a', core: '#ffffff'},
  ocean: {t: 'B', hero: 'NL', mood: 'scared', sweat: true, icon: 'big-wave', side: [['BD', 'scared', true], ['US', 'shocked', true], ['CH', 'smug']], title: [['NETHERLANDS', WHITE], ['UNDERWATER?', CYAN]], tone: '#021a4a', core: '#d8f6ff'},
  babies: {t: 'B', hero: 'JP', mood: 'sad', icon: 'baby-bottle', side: [['IT', 'sad'], ['KR', 'shocked', true], ['NG', 'calm']], title: [['THE LAST', WHITE], ['HUMAN?', GOLD]], tone: '#1a2e0a', core: '#fff6d0'},
  heat: {t: 'A', lab: ['+15°C', '+460°C'], tone: '#4a0e00', core: '#fff3c0'},
  thirty: {t: 'B', hero: 'US', mood: 'shocked', sweat: true, icon: 'sands-of-time', side: [['JP', 'scared', true], ['IT', 'scared', true], ['NG', 'smug']], title: [['DEAD AT', WHITE], ['30?', GOLD]], tone: '#2a1414', core: '#ffe0d0'},
  purge: {t: 'B', hero: 'US', mood: 'angry', helmet: true, icon: 'siren', side: [['CA', 'scared', true], ['MX', 'angry'], ['JP', 'scared', true]], title: [['PURGE', WHITE], ['NIGHT', BLOOD]], tone: '#2a0000', core: '#ffd0c0'},
  nosleep: {t: 'B', hero: 'GB', mood: 'shocked', sweat: true, icon: 'alarm-clock', side: [['US', 'scared', true], ['RU', 'angry'], ['IN', 'scared', true]], title: [['NEVER', WHITE], ['SLEEP AGAIN?', PURP]], tone: '#1a0640', core: '#f0e0ff'},
  money: {t: 'A', lab: ['$48,210', '$0'], tone: '#3a2a00', core: '#fff6c0'},
  deathdate: {t: 'B', hero: 'JP', mood: 'scared', sweat: true, icon: 'burning-meteor', side: [['PH', 'scared', true], ['CL', 'scared', true], ['US', 'shocked']], title: [['EVERYONE', WHITE], ['DIES?', FIRE]], tone: '#03202e', core: '#fff0d0'},
  memory: {t: 'A', lab: ['11:59 PM', '00:00'], tone: '#2e0a30', core: '#ffe8f4'},
  gravity: {t: 'B', hero: 'JP', mood: 'scared', sweat: true, rot: -22, icon: 'falling', side: [['US', 'scared', true, 25], ['BR', 'shocked', false, -30], ['IN', 'scared', true, 35]], title: [['ZERO', WHITE], ['GRAVITY', PURP]], tone: '#160a48', core: '#f0e8ff'},
  power: {t: 'A', lab: ['ON', 'OFF'], tone: '#05050c', core: '#fff3c0'},
  powers: {t: 'B', hero: 'US', mood: 'smug', crown: true, icon: 'fist', side: [['JP', 'shocked'], ['CN', 'angry'], ['BE', 'smug']], title: [['195', GOLD], ['SUPERPOWERS', WHITE]], tone: '#4a2a00', core: '#fffbe0'},
};
const GREEN = '#7ccf5a';

// ---------- A · antes / después ----------
const Th4A: React.FC<{k: string; nt: boolean}> = ({k, nt}) => {
  const c = CFG2[k], v = V4[k] as Extract<V, {t: 'A'}>; const F = c.fx ? FX[c.fx] : null;
  const y = nt ? 375 : 440, s = nt ? 470 : 400, lx = 320, rx = 965;
  const sk = (cx: number) => (x: number, yy: number) => Math.hypot(x - cx, yy - y) < s * 0.62 || (!nt && yy < 150);
  return (<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    <AbsoluteFill style={{clipPath: LEFT}}>
      <Map4 land={GREEN} eyes="happy" skip={sk(lx)} />
      <Grade tone="#0a3a10" top={!nt} />
      <Burst x={lx} y={y} c="rgba(255,240,170,0.9)" core="#ffffff" r={1000} seed={3} />
      <Sparks x={lx} y={y} R={s * 0.68} seed={11} c="#fffbe0" n={5} />
      <Orb planet s={s} x={lx} y={y} mood="happy" rim="#fff0a0" look={[0.2, -0.2]} />
    </AbsoluteFill>
    <AbsoluteFill style={{clipPath: RIGHT}}>
      <Map4 land={c.land} dark={c.dark} eyes={c.eyes} skip={sk(rx)} />
      {F && <F />}
      <Grade tone={v.tone} top={!nt} />
      <Burst x={rx} y={y} c={c.ray} core={v.core} r={1000} seed={7} a={0.65} />
      <Sparks x={rx} y={y} R={s * 0.68} seed={23} c={v.core} n={6} />
      <Orb planet s={s} x={rx} y={y} mood={c.hero} rim={c.glow} rot={c.heroRot ?? 0} helmet={c.heroHelmet} sweat look={[-0.2, -0.2]} />
      <Icon name={c.icon} x={nt ? 1165 : 1160} y={nt ? 600 : 610} w={nt ? 170 : 150} c={c.ic} glow={c.glow} rot={10} />
    </AbsoluteFill>
    <Bolt rc={c.glow} />
    {!nt && <Lbl4 text={v.lab[0]} x={lx} bg="linear-gradient(180deg,#ffffff,#e6efe0)" rot={-3} glow="rgba(255,255,255,0.6)" />}
    {!nt && <Lbl4 text={v.lab[1]} x={rx} bg={`linear-gradient(180deg,#ffffff 0%, ${c.glow} 70%)`} rot={3} glow={c.glow} />}
  </AbsoluteFill>);
};

// ---------- B · countryball protagonista ----------
const Th4B: React.FC<{k: string; nt: boolean}> = ({k, nt}) => {
  const c = CFG2[k], v = V4[k] as Extract<V, {t: 'B'}>; const F = c.fx ? FX[c.fx] : null;
  const hero = nt ? {x: 400, y: 385, s: 510} : {x: 370, y: 450, s: 400};
  const side = nt ? [[1115, 135, 180], [1045, 370, 205], [1130, 600, 180]] : [[1135, 255, 145], [1070, 440, 170], [1150, 620, 140]];
  const ic = nt ? {x: 790, y: 560, w: 230} : {x: 750, y: 530, w: 200};
  const skip = (x: number, y: number) => Math.hypot(x - hero.x, y - hero.y) < hero.s * 0.62 || side.some(([sx, sy, ss]) => Math.hypot(x - sx, y - sy) < ss * 0.7) || Math.hypot(x - ic.x, y - ic.y) < ic.w * 0.6 || (!nt && y < 160);
  return (<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    <Map4 land={c.land} dark={c.dark} eyes={c.eyes as EyeMood} skip={skip} />
    {F && <F />}
    <Grade tone={v.tone} top={!nt} />
    <Burst x={hero.x} y={hero.y} c={c.ray} core={v.core} r={1150} seed={k.length * 7} a={0.65} />
    {side.map(([x, y, s], i) => <Burst key={i} x={x} y={y} c={c.ray} core={v.core} r={s * 1.9} seed={i * 13 + 5} a={0.5} />)}
    <Sparks x={hero.x} y={hero.y} R={hero.s * 0.66} seed={k.length * 3} c={v.core} n={6} />
    <div style={{position: 'absolute', left: ic.x - ic.w * 0.7, top: ic.y - ic.w * 0.7, width: ic.w * 1.4, height: ic.w * 1.4, borderRadius: '50%', background: `radial-gradient(circle, ${c.glow} 0%, rgba(0,0,0,0) 65%)`, mixBlendMode: 'screen'}} />
    <Icon name={v.icon} x={ic.x} y={ic.y} w={ic.w} c={c.ic} glow={c.glow} rot={-8} />
    {side.map(([x, y, s], i) => { const sd = v.side[i]; return <Orb key={i} k={sd[0]} s={s} x={x} y={y} mood={sd[1]} sweat={sd[2]} rot={sd[3] ?? 0} rim={c.glow} look={[-0.6, 0]} />; })}
    <Orb k={v.hero} s={hero.s} x={hero.x} y={hero.y} mood={v.mood} crown={v.crown} helmet={v.helmet} sweat={v.sweat} rot={v.rot ?? 0} rim={c.glow} look={[0.5, 0]} />
    {!nt && <TitleTop parts={v.title} glow={c.glow} />}
  </AbsoluteFill>);
};

export const Thumb4: React.FC<{k: string; nt?: boolean}> = ({k, nt = false}) => V4[k].t === 'A' ? <Th4A k={k} nt={nt} /> : <Th4B k={k} nt={nt} />;
export const V4_KEYS = Object.keys(V4);
