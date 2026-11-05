// Miniaturas "antes / después" para What If Earth Burned in 24 Hours? (1280x720)
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COUNTRIES} from './HexWorld';
import {INK, font} from './lib3';
import {CBall} from './ThumbsCB';
import {Glow, Embers, Title, Vig} from './ThumbsPro';
import {Planet} from './Logos';
import {Earth} from './ThumbsBurn';
import {D, Map, TintLayer, NukeLayer} from './Burn/kit';

const W = 1280, H = 720;
const K = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const AFTER = D.t_launch + 60;
const RUIN = (a: number) => (D.burned as number[]).map((k) => ({k, col: '#47423d', a, crack: true}));
// mitad izquierda / derecha con corte diagonal y etiquetas
const Split: React.FC<{L: React.ReactNode; R: React.ReactNode; l: string; r: string; lc?: string; rc?: string}> = ({L, R, l, r, lc = '#3bd16f', rc = '#ff3b30'}) => (<AbsoluteFill>
  <AbsoluteFill style={{clipPath: 'polygon(0 0, 54% 0, 46% 100%, 0 100%)'}}>{L}</AbsoluteFill>
  <AbsoluteFill style={{clipPath: 'polygon(54% 0, 100% 0, 100% 100%, 46% 100%)'}}>{R}</AbsoluteFill>
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><line x1={W * 0.54} y1={-10} x2={W * 0.46} y2={H + 10} stroke="#fff" strokeWidth={14} /><line x1={W * 0.54} y1={-10} x2={W * 0.46} y2={H + 10} stroke={INK} strokeWidth={5} /></svg>
  <div style={{position: 'absolute', left: 30, top: 26, padding: '6px 26px', borderRadius: 16, background: lc, border: `6px solid ${INK}`, ...font, fontSize: 64, color: '#fff', textShadow: `0 4px 0 ${INK}`, transform: 'rotate(-3deg)'}}>{l}</div>
  <div style={{position: 'absolute', right: 30, top: 26, padding: '6px 26px', borderRadius: 16, background: rc, border: `6px solid ${INK}`, ...font, fontSize: 64, color: '#fff', textShadow: `0 4px 0 ${INK}`, transform: 'rotate(3deg)'}}>{r}</div>
</AbsoluteFill>);
const MapView: React.FC<{ruin?: boolean; cam?: any}> = ({ruin, cam = {cx: 3900, cy: 2050, s: 0.36}}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${W / 1920})`, transformOrigin: '0 0'}}>
    <Map T={ruin ? AFTER : 0} cam={cam} warOn={false} filter={ruin ? 'grayscale(0.75) brightness(0.8) contrast(1.1)' : 'saturate(1.25) brightness(1.05)'} />
    {ruin && <><TintLayer cam={cam} items={RUIN(0.8)} /><NukeLayer T={AFTER} cam={cam} arcs={false} blasts={false} rad={1.4} glow={1} /></>}
  </div>
);
const Mush: React.FC<{x: number; y: number; h: number}> = ({x, y, h}) => {
  const cw = h * 0.6, ch = h * 0.33, cy = y - h * 0.8;
  return (<>
    <Glow x={x} y={cy} r={h * 0.8} c="rgba(255,140,40,0.55)" />
    <div style={{position: 'absolute', left: x - cw * 0.16, top: cy, width: cw * 0.32, height: y - cy, background: 'linear-gradient(90deg, #7a3a1a, #ffb060 50%, #7a3a1a)', clipPath: 'polygon(28% 0, 72% 0, 100% 100%, 0 100%)'}} />
    <div style={{position: 'absolute', left: x - cw * 0.55, top: cy - ch * 0.55, width: cw * 1.1, height: ch * 1.1, borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 70%, #fffbe0 0%, #ffbe48 28%, #e8601e 55%, #6a3a2a 88%)'}} />
    <div style={{position: 'absolute', left: x - cw * 0.45, top: cy - ch * 0.7, width: cw * 0.9, height: ch * 0.6, borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 80%, rgba(255,190,100,0.4), #6a5048 70%)'}} />
  </>);
};
const City: React.FC<{ruin?: boolean}> = ({ruin}) => (
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
    {Array.from({length: 18}, (_, i) => { const x = i * 75 - 10, h = 160 + rnd(i) * 300, w = 64; const top = 600 - h;
      const d = ruin ? `M${x},600 L${x},${top + 40 + rnd(i + 1) * 60} L${x + w * 0.3},${top + rnd(i + 2) * 50} L${x + w * 0.55},${top + 70 + rnd(i + 3) * 60} L${x + w * 0.8},${top + 20 + rnd(i + 4) * 80} L${x + w},${top + 90} L${x + w},600 Z` : `M${x},600 L${x},${top} L${x + w},${top} L${x + w},600 Z`;
      return <g key={i}><path d={d} fill={ruin ? '#2a2422' : ['#3a5a8a', '#4a6a9a', '#2e4c7a'][i % 3]} stroke={INK} strokeWidth={4} />
        {!ruin && Array.from({length: Math.floor(h / 40)}, (_, j) => [0, 1, 2].map((c) => <rect key={j + '-' + c} x={x + 8 + c * 19} y={top + 14 + j * 40} width={12} height={18} fill={rnd(i * 40 + j * 3 + c) > 0.35 ? '#ffe28a' : '#1e3050'} />))}</g>; })}
    <rect x={0} y={600} width={W} height={120} fill={ruin ? '#1a1412' : '#4a8a3a'} />
  </svg>
);

// 1: mapa del mundo, día 1 / día 365
const B1 = () => <Split l="DAY 1" r="DAY 365" L={<MapView />} R={<><MapView ruin /><Mush x={900} y={330} h={230} /><Mush x={1130} y={430} h={190} /><Embers n={40} seed={3} /></>} />;
// 2: planeta feliz / planeta destrozado
const B2 = () => <Split l="BEFORE" r="AFTER"
  L={<AbsoluteFill style={{background: 'radial-gradient(ellipse at 30% 50%, #1a4a9a, #06102a 75%)'}}><div style={{position: 'absolute', left: 330 - 230, top: 380 - 230}}><Planet size={460} mood="happy" lon={10} lat={20} rim="#9fe0ff" /></div></AbsoluteFill>}
  R={<AbsoluteFill style={{background: 'radial-gradient(ellipse at 70% 50%, #5a1006, #0a0204 75%)'}}><Glow x={950} y={380} r={360} c="rgba(255,80,20,0.6)" /><div style={{position: 'absolute', left: 0, top: 0}}><Earth x={950} y={390} size={460} lon={20} lat={25} burn={1} /></div>
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><g transform="translate(950,370)"><circle cx={-70} cy={-20} r={34} fill="#fff" stroke={INK} strokeWidth={8} /><circle cx={70} cy={-20} r={34} fill="#fff" stroke={INK} strokeWidth={8} />
      <path d="M-92,-42 L-48,2 M-48,-42 L-92,2 M48,-42 L92,2 M92,-42 L48,2" stroke={INK} strokeWidth={9} strokeLinecap="round" /><path d="M-60,80 Q0,40 60,80" fill="none" stroke={INK} strokeWidth={12} strokeLinecap="round" /></g></svg><Embers n={50} seed={7} /></AbsoluteFill>} />;
// 3: la ciudad, día 1 / día 365
const B3 = () => <Split l="DAY 1" r="DAY 365"
  L={<AbsoluteFill style={{background: 'linear-gradient(180deg, #6ab8ff, #cfeaff 70%)'}}><div style={{position: 'absolute', left: 120, top: 70, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, #fffbe0, #ffd860)', boxShadow: '0 0 80px 30px rgba(255,230,140,0.7)'}} /><City /></AbsoluteFill>}
  R={<AbsoluteFill style={{background: 'linear-gradient(180deg, #2a0a06, #a8320e 60%, #ff8a2a)'}}><City ruin /><Mush x={1010} y={470} h={430} /><Embers n={60} seed={2} /></AbsoluteFill>} />;
// 4: la superpotencia, antes y después
const B4 = () => <Split l="2048" r="2049" lc="#2a6ad8"
  L={<AbsoluteFill style={{background: 'radial-gradient(ellipse at 30% 50%, #ffd86a, #c98a10 70%)'}}><CBall k={K('US')} size={400} x={330} y={410} eyes="shades" crown rim="#fff3a0" /></AbsoluteFill>}
  R={<AbsoluteFill style={{background: 'radial-gradient(ellipse at 70% 50%, #3a3a3e, #0a0a0c 75%)'}}><Glow x={950} y={420} r={300} c="rgba(255,60,20,0.35)" /><CBall k={K('US')} size={400} x={950} y={430} eyes="dead" gray />
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><path d="M860,250 L900,330 L870,390 L930,460 L905,540 M1010,260 L990,330 L1040,400" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" /></svg><Embers n={40} seed={5} c="#aaa" /></AbsoluteFill>} />;
// 5: 0 horas / 24 horas, la gente
const B5 = () => <Split l="0 H" r="24 H"
  L={<AbsoluteFill style={{background: 'linear-gradient(180deg, #7ac4ff, #d8f0ff 60%, #6ab04a 61%, #4a8a3a)'}}>{['US', 'FR', 'BR', 'JP', 'DE', 'IN'].map((c, i) => <CBall key={c} k={K(c)} size={150 + (i % 2) * 30} x={130 + (i % 3) * 160} y={370 + Math.floor(i / 3) * 170} eyes="normal" />)}</AbsoluteFill>}
  R={<AbsoluteFill style={{background: 'radial-gradient(ellipse at 75% 55%, #4a3a2a, #0e0a08 75%)'}}>
    <div style={{position: 'absolute', left: 700, top: 160, width: 520, height: 470, borderRadius: 30, background: '#2a2622', border: `10px solid ${INK}`}} />
    <div style={{position: 'absolute', left: 900, top: 150, width: 120, height: 40, borderRadius: '0 0 30px 30px', background: '#ffe7a0', boxShadow: '0 0 90px 40px rgba(255,220,140,0.35)'}} />
    {['FR', 'DE'].map((c, i) => <CBall key={c} k={K(c)} size={190} x={860 + i * 220} y={500} eyes="scared" sweat tears={i === 0} />)}
    <div style={{position: 'absolute', left: 980, top: 300, padding: '4px 16px', background: '#ffc531', border: `5px solid ${INK}`, ...font, fontSize: 30, color: INK}}>☢ SHELTER</div></AbsoluteFill>} />;

const T: Record<string, React.FC> = {b1: B1, b2: B2, b3: B3, b4: B4, b5: B5};
export const BURN_THUMBS2 = Object.keys(T);
export const ThumbBurn2: React.FC<{id: string}> = ({id}) => { const C_ = T[id]; return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><C_ /><Vig a={0.3} /></AbsoluteFill>; };
