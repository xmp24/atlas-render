// 5 miniaturas "1$ vs 1.000.000$" — estilo Indonesia vs The World + división en rayo (Latin America)
import React from 'react';
import {AbsoluteFill, staticFile, delayRender, continueRender} from 'remotion';
import {COUNTRIES, FlagCanvas} from './HexWorld';
import {INK} from './lib3';
import {WorldBg} from './ThumbsMap';

const W = 1280, H = 720;
const K = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- división en rayo ----------
const BOLT = [[735, -20], [680, 235], [728, 252], [628, 468], [672, 486], [600, 740]];
const bp = BOLT.map((p) => `${p[0]}px ${p[1]}px`).join(', ');
const LCLIP = `polygon(0px 0px, ${bp}, 0px ${H}px)`;
const RCLIP = `polygon(${bp}, ${W}px ${H}px, ${W}px 0px)`;
const boltD = BOLT.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
const Bolt: React.FC = () => (
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <path d={boltD} fill="none" stroke="#bfe6ff" strokeWidth={34} opacity={0.35} style={{filter: 'blur(10px)'}} />
    <path d={boltD} fill="none" stroke={INK} strokeWidth={20} strokeLinejoin="miter" />
    <path d={boltD} fill="none" stroke="#ffffff" strokeWidth={10} strokeLinejoin="miter" />
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const j = Math.floor(rnd(i + 3) * 4); const [x0, y0] = BOLT[j], [x1, y1] = BOLT[j + 1]; const f = rnd(i + 9); const x = x0 + (x1 - x0) * f, y = y0 + (y1 - y0) * f; const dx = (rnd(i) > 0.5 ? 1 : -1) * (25 + rnd(i + 5) * 45);
      return <path key={i} d={`M${x},${y} l${dx * 0.5},${-8 - rnd(i) * 10} l${-dx * 0.15},${6} l${dx * 0.6},${-6 - rnd(i + 2) * 10}`} fill="none" stroke="#e8f7ff" strokeWidth={3} opacity={0.9} />; })}
  </svg>
);

// ---------- fondo con textura + líneas de velocidad ----------
export const Grunge: React.FC<{id: string}> = ({id}) => (
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
    <filter id={`gb${id}`}><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={4} seed={7} /><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.3 -0.55" /></filter>
    <filter id={`gf${id}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={3} /><feColorMatrix type="saturate" values="0" /></filter>
    <rect width={W} height={H} filter={`url(#gb${id})`} opacity={0.22} />
    <rect width={W} height={H} filter={`url(#gf${id})`} opacity={0.16} style={{mixBlendMode: 'overlay'}} />
  </svg>
);
export const Speed: React.FC<{cx: number; cy: number; seed?: number}> = ({cx, cy, seed = 1}) => (
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
    {Array.from({length: 34}, (_, i) => { const a = (i / 34) * Math.PI * 2 + rnd(i + seed) * 0.12; const r0 = 400 + rnd(i * 3 + seed) * 90; const len = 90 + rnd(i * 7 + seed) * 120; const w = 5 + rnd(i * 5 + seed) * 7;
      const ux = Math.cos(a), uy = Math.sin(a), px = -uy, py = ux; const x0 = cx + ux * r0, y0 = cy + uy * r0, x1 = cx + ux * (r0 + len), y1 = cy + uy * (r0 + len);
      return <path key={i} d={`M${x0},${y0} L${x1 + px * w},${y1 + py * w} L${x1 - px * w},${y1 - py * w} Z`} fill="#ffffff" opacity={0.8} />; })}
  </svg>
);
const Half: React.FC<{side: 'l' | 'r'; bg: string; children?: React.ReactNode}> = ({side, bg, children}) => (
  <div style={{position: 'absolute', inset: 0, clipPath: side === 'l' ? LCLIP : RCLIP, background: bg}}>{children}</div>
);
const RED_BG = 'radial-gradient(circle at 30% 55%, #f0643a 0%, #c9301f 45%, #6e120c 100%)';
const BLUE_BG = 'radial-gradient(circle at 70% 50%, #4b97e6 0%, #2a69bd 50%, #123a78 100%)';
const GREY_BG = 'radial-gradient(circle at 30% 55%, #8b939c 0%, #5b626b 50%, #2a2e34 100%)';
const GOLD_BG = 'radial-gradient(circle at 70% 50%, #ffe27a 0%, #f0a516 45%, #8a4a00 100%)';

// ---------- texto pixel 3D (estilo INDONESIA VS THE WORLD) ----------
type Pal = {top: string; ext: string};
export const PGREEN: Pal = {top: 'linear-gradient(180deg,#c9ff9a 0%,#5fe85a 40%,#22b13a 100%)', ext: '#0b5a1e'};
export const PGOLD: Pal = {top: 'linear-gradient(180deg,#fff7b8 0%,#ffd21f 45%,#ff9a0a 100%)', ext: '#9a4b00'};
export const PRED: Pal = {top: 'linear-gradient(180deg,#ff9a8a 0%,#ff3b2e 45%,#d9140c 100%)', ext: '#7a0a06'};
export const PBLUE: Pal = {top: 'linear-gradient(180deg,#bfe9ff 0%,#3fb0ff 45%,#1a72e0 100%)', ext: '#0a3570'};
export const PT: React.FC<{text: string; x: number; y: number; size: number; pal: Pal; rot?: number; ls?: number}> = ({text, x, y, size, pal, rot = 0, ls = 0.02}) => {
  const d = Math.max(4, Math.round(size * 0.1));
  const st = size * 0.16;
  const base: React.CSSProperties = {position: 'absolute', left: 0, top: 0, fontFamily: 'Silk', fontSize: size, lineHeight: 1, letterSpacing: size * ls, whiteSpace: 'nowrap'};
  const ext = Array.from({length: d}, (_, i) => `0 ${i + 1}px 0 ${pal.ext}`).join(',');
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,0) rotate(${rot}deg)`, filter: `drop-shadow(0 ${size * 0.06}px ${size * 0.06}px rgba(0,0,0,0.55))`}}>
      <div style={{position: 'relative', fontFamily: 'Silk', fontSize: size, lineHeight: 1, letterSpacing: size * ls, whiteSpace: 'nowrap', color: 'transparent'}}>{text}
        <div style={{...base, top: d, color: INK, WebkitTextStroke: `${st}px ${INK}`}}>{text}</div>
        <div style={{...base, color: INK, WebkitTextStroke: `${st}px ${INK}`}}>{text}</div>
        <div style={{...base, color: pal.ext, textShadow: ext}}>{text}</div>
        <div style={{...base, background: pal.top, WebkitBackgroundClip: 'text', color: 'transparent'}}>{text}</div>
        <div style={{...base, top: -size * 0.04, color: 'transparent', WebkitTextStroke: `${size * 0.012}px rgba(255,255,255,0.55)`}}>{text}</div>
      </div>
    </div>
  );
};

// ---------- ojos rojos enfadados ----------
type Mood = 'angry' | 'scared' | 'smug';
const Eyes: React.FC<{s: number; mood: Mood; look?: number; id: string}> = ({s, mood, look = 0, id}) => {
  const cy = s * 0.47;
  return (
    <svg width={s} height={s} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <defs>
        <radialGradient id={`ir${id}`} cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#ffd23a" /><stop offset="35%" stopColor="#ff7a1a" /><stop offset="75%" stopColor="#ff2a1a" /><stop offset="100%" stopColor="#a30d08" /></radialGradient>
      </defs>
      {[-1, 1].map((sd) => {
        const ex = s * 0.5 + sd * s * 0.2;
        const rx = s * (mood === 'scared' ? 0.15 : 0.16), ry = s * (mood === 'scared' ? 0.17 : 0.14);
        // línea de la ceja: interior baja (enfadado), exterior baja (asustado)
        const ox = ex + sd * s * 0.2, ix = ex - sd * s * 0.17;
        const oy = mood === 'angry' ? cy - s * 0.15 : mood === 'smug' ? cy - s * 0.02 : cy - s * 0.17;
        const iy = mood === 'angry' ? cy - s * 0.01 : mood === 'smug' ? cy - s * 0.02 : cy - s * 0.25;
        const clip = `${id}c${sd}`;
        const ir = s * (mood === 'scared' ? 0.05 : 0.075);
        const ixx = ex + look * s * 0.05, iyy = cy + (mood === 'smug' ? s * 0.035 : s * 0.01);
        return (
          <g key={sd}>
            <clipPath id={clip}><path d={mood === 'scared' ? `M${ex - s * 0.3},${cy - s * 0.4} h${s * 0.6} v${s * 0.8} h${-s * 0.6} Z` : `M${ox + sd * s * 0.1},${oy - (iy - oy) * 0.27} L${ix - sd * s * 0.1},${iy + (iy - oy) * 0.27} L${ix - sd * s * 0.1},${cy + s * 0.4} L${ox + sd * s * 0.1},${cy + s * 0.4} Z`} /></clipPath>
            <g clipPath={`url(#${clip})`}>
              <ellipse cx={ex} cy={cy} rx={rx} ry={ry} fill="#fff" stroke={INK} strokeWidth={s * 0.022} />
              <circle cx={ixx} cy={iyy} r={ir} fill={`url(#ir${id})`} stroke="#5a0604" strokeWidth={s * 0.008} />
              <circle cx={ixx} cy={iyy} r={ir * 0.32} fill="#ffe46a" />
              <circle cx={ixx - ir * 0.35} cy={iyy - ir * 0.4} r={ir * 0.22} fill="#fff" opacity={0.9} />
            </g>
            {mood !== 'scared' ? <line x1={ox + sd * s * 0.04} y1={oy - (iy - oy) * 0.1} x2={ix - sd * s * 0.02} y2={iy + (iy - oy) * 0.06} stroke={INK} strokeWidth={s * 0.06} strokeLinecap="round" />
              : <path d={`M${ox},${oy + s * 0.02} Q${ex},${iy - s * 0.02} ${ix},${iy + s * 0.05}`} fill="none" stroke={INK} strokeWidth={s * 0.035} strokeLinecap="round" />}
          </g>
        );
      })}
    </svg>
  );
};
const Ball: React.FC<{k?: number; x: number; y: number; s: number; mood: Mood; look?: number; rim?: string; img?: string; id: string; sweat?: boolean; tears?: boolean; gray?: boolean}> = ({k = 0, x, y, s, mood, look, rim, img, id, sweat, tears, gray}) => (
  <div style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', border: `${Math.max(3, s * 0.025)}px solid ${INK}`, boxShadow: `${rim ? `0 0 0 ${s * 0.025}px ${rim}, 0 0 ${s * 0.18}px ${rim},` : ''} 0 ${s * 0.05}px ${s * 0.07}px rgba(0,0,0,0.55)`, filter: gray ? 'grayscale(0.6) brightness(0.85)' : 'saturate(1.15)'}}>
      {img ? <div style={{position: 'absolute', inset: 0, backgroundImage: `url(${staticFile(img)})`, backgroundSize: `${s * 2.1}px ${s * 1.05}px`, backgroundPosition: `${-s * 0.62}px ${-s * 0.06}px`}} /> : <FlagCanvas k={k} w={s} h={s} />}
      <svg width={s} height={s} style={{position: 'absolute', left: 0, top: 0, mixBlendMode: 'multiply', opacity: 0.35}}><filter id={`bt${id}`}><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves={3} seed={2} /><feColorMatrix type="saturate" values="0" /></filter><rect width={s} height={s} filter={`url(#bt${id})`} /></svg>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 32% 26%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 22%, rgba(255,255,255,0) 40%), radial-gradient(circle at 62% 70%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.5) 92%)'}} />
    </div>
    <Eyes s={s} mood={mood} look={look} id={id} />
    {sweat && <div style={{position: 'absolute', right: s * 0.04, top: s * 0.12, width: s * 0.11, height: s * 0.17, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: 'linear-gradient(#d6f0ff, #4aa8ff)', border: `${s * 0.014}px solid ${INK}`}} />}
    {tears && <svg width={s} height={s} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{[0.3, 0.7].map((fx, i) => <path key={i} d={`M${s * fx},${s * 0.6} q${s * 0.02},${s * 0.12} ${s * 0.03},${s * 0.22} a${s * 0.035},${s * 0.035} 0 1 1 ${-s * 0.06},0 q${s * 0.01},${-s * 0.12} ${s * 0.03},${-s * 0.22} z`} fill="#7cc8ff" stroke={INK} strokeWidth={s * 0.012} />)}</svg>}
  </div>
);
const Pot: React.FC<{x: number; y: number; s: number; rot?: number}> = ({x, y, s, rot = -6}) => (
  <svg width={s} height={s} style={{position: 'absolute', left: x - s / 2, top: y - s / 2, overflow: 'visible', transform: `rotate(${rot}deg)`}}>
    <path d={`M ${s * 0.1} ${s * 0.2} A ${s * 0.41} ${s * 0.34} 0 0 1 ${s * 0.9} ${s * 0.2} Z`} fill="#a7b0ba" stroke={INK} strokeWidth={s * 0.03} />
    <path d={`M ${s * 0.22} ${s * 0.08} Q ${s * 0.5} ${-s * 0.06} ${s * 0.78} ${s * 0.08}`} fill="none" stroke="#e8eef4" strokeWidth={s * 0.03} strokeLinecap="round" opacity={0.8} />
    <rect x={s * 0.02} y={s * 0.17} width={s * 0.96} height={s * 0.075} rx={s * 0.03} fill="#7d8790" stroke={INK} strokeWidth={s * 0.024} />
    <rect x={s * 0.93} y={s * 0.15} width={s * 0.26} height={s * 0.06} rx={s * 0.02} fill="#5a636b" stroke={INK} strokeWidth={s * 0.02} />
  </svg>
);
const Broom: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <svg width={s} height={s * 1.4} style={{position: 'absolute', left: x, top: y, overflow: 'visible'}}><g transform={`rotate(-20 ${s * 0.2} ${s * 0.9})`}><rect x={s * 0.18} y={0} width={s * 0.08} height={s * 1.05} rx={s * 0.03} fill="#a0662c" stroke={INK} strokeWidth={s * 0.025} /><path d={`M ${s * 0.04} ${s * 1.0} L ${s * 0.39} ${s * 1.0} L ${s * 0.48} ${s * 1.34} L ${s * -0.05} ${s * 1.34} Z`} fill="#e8c35a" stroke={INK} strokeWidth={s * 0.025} /></g></svg>
);
const MC = K('MC');
const Marco: React.FC<{x: number; y: number; s: number; mood?: Mood; look?: number; broom?: boolean; sweat?: boolean; tears?: boolean; crown?: boolean; rim?: string; id: string}> = ({x, y, s, mood = 'angry', look = 0.5, broom, sweat, tears, crown, rim = '#ff3b30', id}) => (<>
  {broom && <Broom x={x + s * 0.22} y={y - s * 0.5} s={s} />}
  <Ball k={MC} x={x} y={y} s={s} mood={mood} look={look} rim={rim} id={id} sweat={sweat} tears={tears} />
  {crown ? <Crown x={x} y={y - s * 0.56} s={s * 0.5} /> : <Pot x={x} y={y - s * 0.15} s={s * 1.04} />}
</>);
const Crown: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <div style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, filter: `drop-shadow(0 0 3px ${INK}) drop-shadow(0 0 3px ${INK}) drop-shadow(0 0 22px #ffd86a)`}}><div style={{width: '100%', height: '100%', background: 'linear-gradient(180deg, #fff3a0, #ffc21a 60%, #d48a00)', WebkitMaskImage: `url(${staticFile('hw/icons/crown.svg')})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center'}} /></div>
);
const Ico: React.FC<{n: string; x: number; y: number; w: number; c: string; rot?: number; flip?: boolean}> = ({n, x, y, w, c, rot = 0, flip}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - w / 2, width: w, height: w, transform: `rotate(${rot}deg) scaleX(${flip ? -1 : 1})`, filter: `drop-shadow(0 0 2px ${INK}) drop-shadow(0 0 2px ${INK}) drop-shadow(0 0 2px ${INK}) drop-shadow(0 8px 8px rgba(0,0,0,0.55))`}}>
    <div style={{width: '100%', height: '100%', background: c, WebkitMaskImage: `url(${staticFile(`hw/icons/${n}.svg`)})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center'}} />
  </div>
);
// humo de dibujo animado (como en la de Indonesia)
export const Puff: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => {
  const cs: [number, number, number][] = [[0, 0, 0.32], [0.28, -0.12, 0.26], [-0.26, -0.08, 0.24], [0.08, -0.42, 0.24], [-0.12, -0.68, 0.18], [0.12, -0.86, 0.13]];
  return (
    <svg width={s} height={s * 1.6} style={{position: 'absolute', left: x - s / 2, top: y - s * 1.3, overflow: 'visible'}}>
      {cs.map(([a, b, r], i) => <circle key={'o' + i} cx={s / 2 + a * s} cy={s * 1.3 + b * s} r={r * s} fill={INK} stroke={INK} strokeWidth={s * 0.08} />)}
      {cs.map(([a, b, r], i) => <circle key={'f' + i} cx={s / 2 + a * s} cy={s * 1.3 + b * s} r={r * s} fill="#d9dde2" />)}
      {cs.map(([a, b, r], i) => <circle key={'h' + i} cx={s / 2 + a * s - r * s * 0.25} cy={s * 1.3 + b * s - r * s * 0.3} r={r * s * 0.5} fill="#fff" opacity={0.85} />)}
      {cs.map(([a, b, r], i) => <circle key={'s' + i} cx={s / 2 + a * s + r * s * 0.3} cy={s * 1.3 + b * s + r * s * 0.35} r={r * s * 0.35} fill="#9aa1a8" opacity={0.7} />)}
    </svg>
  );
};
export const Anger: React.FC<{x: number; y: number; s: number; rot?: number}> = ({x, y, s, rot = 0}) => (
  <svg width={s} height={s} style={{position: 'absolute', left: x - s / 2, top: y - s / 2, overflow: 'visible', transform: `rotate(${rot}deg)`}}>
    {[-30, 0, 30].map((a, i) => <g key={i} transform={`rotate(${a} ${s / 2} ${s})`}><path d={`M${s / 2 - s * 0.07},${s * 0.05} L${s / 2 + s * 0.07},${s * 0.05} L${s / 2 + s * 0.03},${s * 0.55} L${s / 2 - s * 0.03},${s * 0.55} Z`} fill="#ff2a1a" stroke={INK} strokeWidth={s * 0.03} /></g>)}
  </svg>
);
const Burst: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => {
  const pts = Array.from({length: 24}, (_, i) => { const a = (i / 24) * Math.PI * 2; const rr = i % 2 ? r * 0.55 : r * (0.9 + rnd(i) * 0.25); return `${x + Math.cos(a) * rr * 1.5},${y + Math.sin(a) * rr * 0.75}`; }).join(' ');
  return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><polygon points={pts} fill="#ffcf1f" stroke={INK} strokeWidth={6} strokeLinejoin="round" /><polygon points={pts} fill="#fff27a" transform={`translate(${x * 0.15},${y * 0.15}) scale(0.85)`} opacity={0.7} /></svg>;
};
const VSB: React.FC<{x?: number; y?: number}> = ({x = 655, y = 360}) => (<><Burst x={x} y={y + 52} r={92} /><PT text="VS" x={x} y={y} size={110} pal={PGOLD} /></>);
const Coin: React.FC<{x: number; y: number; r: number; rot?: number}> = ({x, y, r, rot = 0}) => (
  <svg width={r * 2} height={r * 2} style={{position: 'absolute', left: x - r, top: y - r, overflow: 'visible', transform: `rotate(${rot}deg)`, filter: 'drop-shadow(0 6px 5px rgba(0,0,0,0.5))'}}><circle cx={r} cy={r} r={r * 0.95} fill="#ffcf2e" stroke={INK} strokeWidth={r * 0.12} /><circle cx={r} cy={r} r={r * 0.68} fill="none" stroke="#c98a00" strokeWidth={r * 0.08} /><text x={r} y={r * 1.36} textAnchor="middle" fontSize={r * 1.05} style={{fontFamily: 'Silk'}} fill="#a86b00">$</text></svg>
);
const Bill: React.FC<{x: number; y: number; w: number; rot?: number}> = ({x, y, w, rot = 0}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - w * 0.24, width: w, height: w * 0.48, transform: `rotate(${rot}deg)`, background: 'linear-gradient(180deg,#a8e8a0,#5cbf5a)', border: `${w * 0.035}px solid ${INK}`, borderRadius: w * 0.04, boxShadow: '0 6px 8px rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <div style={{width: w * 0.32, height: w * 0.32, borderRadius: '50%', border: `${w * 0.025}px solid #2d7a2c`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Silk', fontSize: w * 0.22, color: '#2d7a2c'}}>$</div>
  </div>
);
const GOLDC = 'linear-gradient(180deg,#fff6b0,#ffc21a 55%,#c27a00)';
const DARKC = 'linear-gradient(180deg,#3a3f46,#15181c)';

// tierra con ojos (del estilo de "THE WORLD")
export const Earth: React.FC<{x: number; y: number; s: number; id: string}> = ({x, y, s, id}) => (<>
  <Ball x={x} y={y} s={s} mood="angry" look={-0.6} img="hw/marble2k.jpg" rim="#7cc8ff" id={id} />
  {[['US', -0.3, -0.3, 0.2], ['CN', 0.3, -0.33, 0.19], ['RU', 0.05, -0.43, 0.16], ['FR', -0.37, 0.12, 0.17], ['GB', 0.36, 0.15, 0.16], ['IN', 0.02, 0.34, 0.17]].map(([c, dx, dy, r]: any, i) =>
    <Ball key={c} k={K(c)} x={x + dx * s} y={y + dy * s} s={s * r} mood="angry" look={-0.5} id={`${id}m${i}`} />)}
</>);

const Map: React.FC<{cam?: {cx: number; cy: number; s: number}}> = ({cam}) => (
  <div style={{position: 'absolute', inset: 0, opacity: 0.38, filter: 'hue-rotate(-8deg) saturate(0.4) brightness(1.2)', mixBlendMode: 'screen'}}><WorldBg cam={cam} blur={3} /></div>
);

const T: Record<string, (id: string) => React.ReactNode> = {
  // 1 · Marco (1$) vs el mundo entero (1.000.000$)
  world: (id) => (<>
    <Half side="l" bg={RED_BG}><Grunge id={id + 'l'} /><Speed cx={330} cy={400} /></Half>
    <Half side="r" bg={BLUE_BG}><Map /><Grunge id={id + 'r'} /><Speed cx={960} cy={400} seed={4} /></Half>
    <Bolt />
    <Puff x={160} y={260} s={80} />
    <Marco x={320} y={430} s={330} mood="angry" look={0.6} broom id={id + 'a'} />
    <Anger x={130} y={250} s={90} rot={-25} />
    <PT text="1$" x={330} y={20} size={170} pal={PGREEN} rot={-3} />
    <Puff x={1180} y={250} s={90} />
    <Earth x={985} y={430} s={380} id={id + 'e'} />
    <PT text="1.000.000$" x={960} y={585} size={100} pal={PGOLD} rot={-2} />
    <VSB x={650} y={300} />
  </>),
  // 2 · Marco pobre vs Marco rico con ejército de oro
  rich: (id) => (<>
    <Half side="l" bg={GREY_BG}><Grunge id={id + 'l'} /><Speed cx={330} cy={400} /></Half>
    <Half side="r" bg={GOLD_BG}><Grunge id={id + 'r'} /><Speed cx={960} cy={400} seed={7} /></Half>
    <Bolt />
    <Marco x={320} y={450} s={320} mood="scared" look={0.3} broom sweat id={id + 'a'} />
    <PT text="1$" x={320} y={30} size={170} pal={PGREEN} rot={-3} />
    {[[820, 590, 190, 'battle-tank', 0, false], [1150, 600, 210, 'battle-tank', 0, true], [1180, 250, 150, 'jet-fighter', -20, false], [790, 260, 130, 'jet-fighter', -10, true]].map(([x, y, w, n, r, f]: any, i) => <Ico key={i} n={n} x={x} y={y} w={w} c={GOLDC} rot={r} flip={f} />)}
    <Marco x={985} y={420} s={330} mood="smug" look={-0.3} crown rim="#fff2a0" id={id + 'b'} />
    <PT text="1.000.000$" x={965} y={30} size={100} pal={PGREEN} rot={-2} />
    <VSB x={655} y={330} />
  </>),
  // 3 · Marco solo vs un muro de tanques/aviones/barcos
  army: (id) => (<>
    <Half side="l" bg={RED_BG}><Grunge id={id + 'l'} /><Speed cx={330} cy={400} /></Half>
    <Half side="r" bg={BLUE_BG}><Map cam={{cx: 3900, cy: 1300, s: 1.6}} /><Grunge id={id + 'r'} /><Speed cx={960} cy={400} seed={2} /></Half>
    <Bolt />
    <Marco x={330} y={440} s={340} mood="angry" look={0.7} broom id={id + 'a'} />
    <Anger x={560} y={230} s={90} rot={25} />
    <PT text="1$" x={300} y={20} size={170} pal={PGREEN} rot={-3} />
    {[[1180, 180, 140, 'jet-fighter', -18], [960, 150, 120, 'jet-fighter', -14], [800, 210, 100, 'helicopter', 0], [1110, 330, 150, 'helicopter', 0], [870, 360, 170, 'battle-tank', 0], [1120, 470, 200, 'battle-tank', 0], [830, 500, 170, 'battleship', 0]].map(([x, y, w, n, r]: any, i) => <Ico key={i} n={n} x={x} y={y} w={w} c={DARKC} rot={r} flip={n !== 'helicopter'} />)}
    <Puff x={1010} y={300} s={70} /><Puff x={1220} y={420} s={60} />
    <PT text="1.000.000$" x={965} y={585} size={100} pal={PGOLD} rot={-2} />
  </>),
  // 4 · Marco vs Francia: el millón entero se le cae encima
  money: (id) => (<>
    <Half side="l" bg={GREY_BG}><Grunge id={id + 'l'} /><Speed cx={330} cy={400} /></Half>
    <Half side="r" bg={BLUE_BG}><Map /><Grunge id={id + 'r'} /><Speed cx={960} cy={400} seed={9} /></Half>
    <Bolt />
    <Marco x={320} y={460} s={300} mood="angry" look={0.4} broom id={id + 'a'} />
    <Coin x={140} y={600} r={52} rot={-12} />
    <PT text="1$" x={320} y={40} size={170} pal={PGREEN} rot={-3} />
    {Array.from({length: 18}, (_, i) => <Bill key={i} x={760 + rnd(i) * 480} y={140 + rnd(i + 30) * 520} w={110 + rnd(i + 7) * 50} rot={-40 + rnd(i + 11) * 80} />)}
    {Array.from({length: 10}, (_, i) => <Coin key={'c' + i} x={780 + rnd(i + 50) * 450} y={560 + rnd(i + 70) * 140} r={34 + rnd(i + 90) * 16} rot={rnd(i) * 60} />)}
    <Marco x={985} y={400} s={300} mood="smug" look={-0.4} crown rim="#fff2a0" id={id + 'b'} />
    <PT text="1.000.000$" x={970} y={30} size={100} pal={PGREEN} rot={-2} />
    <VSB x={655} y={330} />
  </>),
  // 5 · Marco vs Francia (rival principal) con 1.000.000$
  france: (id) => (<>
    <Half side="l" bg={RED_BG}><Grunge id={id + 'l'} /><Speed cx={330} cy={400} /></Half>
    <Half side="r" bg={BLUE_BG}><Map cam={{cx: 3830, cy: 1150, s: 3.2}} /><Grunge id={id + 'r'} /><Speed cx={960} cy={400} seed={5} /></Half>
    <Bolt />
    <Puff x={500} y={250} s={80} />
    <Marco x={320} y={450} s={330} mood="angry" look={0.8} broom id={id + 'a'} />
    <Anger x={130} y={260} s={90} rot={-25} />
    <PT text="1$" x={320} y={25} size={170} pal={PGREEN} rot={-3} />
    <Ball k={K('FR')} x={1010} y={420} s={330} mood="angry" look={-0.7} rim="#7cc8ff" id={id + 'f'} />
    {[[790, 600, 150, 'battle-tank', 0, true], [1200, 610, 160, 'battle-tank', 0, false], [1190, 220, 130, 'jet-fighter', -18, false]].map(([x, y, w, n, r, f]: any, i) => <Ico key={i} n={n} x={x} y={y} w={w} c={DARKC} rot={r} flip={f} />)}
    <Puff x={1200} y={330} s={70} />
    <PT text="1.000.000$" x={965} y={30} size={100} pal={PGOLD} rot={-2} />
    <VSB x={655} y={330} />
  </>),
};
export const MIL_THUMBS = Object.keys(T);
export const ThumbMil: React.FC<{id: string}> = ({id}) => {
  const [h] = React.useState(() => delayRender('silk'));
  React.useEffect(() => { const f = new FontFace('Silk', `url(${staticFile('pix700.woff2')})`); f.load().then((ff) => { (document as any).fonts.add(ff); continueRender(h); }); }, []);
  return <AbsoluteFill style={{overflow: 'hidden', background: '#123'}}>{T[id](id)}<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.35) 100%)'}} /></AbsoluteFill>;
};
