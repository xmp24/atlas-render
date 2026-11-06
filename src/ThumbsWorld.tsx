// Miniaturas "A World With": antes / después con rayo, título 3D y una Tierra con cara (13 temas)
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK} from './lib3';
import {Embers, Glow} from './ThumbsPro';
import {Planet} from './Logos';
import {Title3D, Smoke} from './ThumbsFinal';
import {Earth} from './ThumbsBurn';
import {Icon} from './World/kit';

const W = 1280, H = 720, BX = 640, EX = 965, EY = 420, ER = 212;
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const BOLT = [[BX + 50, -20], [BX - 10, 302], [BX + 40, 318], [BX - 50, H + 20]];
const boltD = BOLT.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
export const LEFT = `polygon(0px 0px, ${BOLT.map((p) => `${p[0]}px ${p[1]}px`).join(', ')}, 0px ${H}px)`;
export const RIGHT = `polygon(${BOLT.map((p) => `${p[0]}px ${p[1]}px`).join(', ')}, ${W}px ${H}px, ${W}px 0px)`;
const SKY = 'linear-gradient(180deg, #ffffff 0%, #e8fbff 45%, #7fe0ff 75%, #2fa8ff 100%)';

export const Bolt: React.FC<{rc: string}> = ({rc}) => (
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <defs><filter id="bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter><filter id="bs"><feGaussianBlur stdDeviation="4" /></filter></defs>
    <path d={boltD} transform="translate(-14,0)" stroke="#5fd0ff" strokeWidth={60} fill="none" filter="url(#bl)" opacity={0.85} />
    <path d={boltD} transform="translate(14,0)" stroke={rc} strokeWidth={60} fill="none" filter="url(#bl)" opacity={0.85} />
    <path d={boltD} stroke={INK} strokeWidth={30} fill="none" />
    <path d={boltD} stroke="#fff" strokeWidth={17} fill="none" />
    <path d={boltD} stroke="#fff3c0" strokeWidth={6} fill="none" filter="url(#bs)" />
  </svg>);
const Sparkle: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => <div style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, background: '#fff', clipPath: 'polygon(50% 0, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0 50%, 40% 40%)', filter: 'drop-shadow(0 0 8px #bff0ff)'}} />;
const Bright = () => (<AbsoluteFill style={{clipPath: LEFT, background: 'radial-gradient(ellipse at 30% 40%, #c8f0ff 0%, #6cc4ff 22%, #2f7fe0 50%, #133a9a 80%, #0a1f5a 100%)'}}>
  <div style={{position: 'absolute', left: -300, top: -300, width: 1200, height: 1200, opacity: 0.35, background: 'repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,0.9) 0deg 7deg, transparent 7deg 20deg)', WebkitMaskImage: 'radial-gradient(circle, #000 10%, transparent 65%)', transform: 'translate(20px, 40px)'}} />
  {[[90, 120, 170], [470, 80, 140], [80, 610, 190], [520, 640, 150]].map(([x, y, r], i) => <div key={i} style={{position: 'absolute', left: x - r, top: y - r * 0.45, width: r * 2, height: r * 0.9, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,255,255,0.85), rgba(255,255,255,0) 70%)', filter: 'blur(4px)'}} />)}
  {[[110, 260, 26], [560, 230, 20], [150, 520, 18], [540, 540, 30], [460, 160, 14]].map(([x, y, s], i) => <Sparkle key={i} x={x} y={y} s={s} />)}
  <div style={{position: 'absolute', left: 320 - 380, top: 420 - 380, width: 760, height: 760, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(220,245,255,0.45) 30%, rgba(160,220,255,0) 65%)'}} />
</AbsoluteFill>);

type Face = 'sad' | 'angry' | 'scared' | 'dead' | 'tired' | 'blank' | 'laser' | 'frozen' | 'evil';
const FaceSVG: React.FC<{f: Face; acc?: string}> = ({f, acc = '#fff'}) => {
  const eye = (d: number) => {
    const cx = d * 80;
    if (f === 'dead') return <g key={d}><path d={`M${cx - 34},-24 L${cx + 34},34 M${cx + 34},-24 L${cx - 34},34`} stroke={INK} strokeWidth={16} strokeLinecap="round" /></g>;
    if (f === 'laser') return <g key={d}><ellipse cx={cx} cy={8} rx={50} ry={40} fill="#fff6c0" stroke={INK} strokeWidth={9} /><circle cx={cx} cy={10} r={22} fill="#ff2a0a" /><circle cx={cx} cy={10} r={10} fill="#fff" /></g>;
    const big = f === 'scared' || f === 'frozen' || f === 'tired' || f === 'blank';
    const rx = big ? 54 : 50, ry = big ? 54 : 44;
    return <g key={d}>
      <ellipse cx={cx} cy={10} rx={rx} ry={ry} fill={f === 'tired' ? '#ffd8d8' : '#fff'} stroke={INK} strokeWidth={9} />
      {f === 'tired' && [0, 1, 2].map((j) => <path key={j} d={`M${cx - 40 + j * 10},${30 - j * 8} l${18},${-6}`} stroke="#d01a08" strokeWidth={3} />)}
      <circle cx={cx + (f === 'blank' ? 0 : d * -4)} cy={f === 'blank' ? 10 : f === 'scared' || f === 'frozen' ? 12 : 26} r={f === 'scared' || f === 'frozen' ? 13 : f === 'blank' ? 8 : 17} fill={f === 'evil' ? '#ff2a0a' : INK} />
      {f !== 'blank' && <circle cx={cx + d * -4 - 6} cy={f === 'scared' || f === 'frozen' ? 6 : 20} r={5} fill="#fff" />}
      {f === 'sad' && <path d={`M${cx - 54},6 Q${cx},-48 ${cx + 54},6 Q${cx},-8 ${cx - 54},6 Z`} fill="#3a1a10" stroke={INK} strokeWidth={8} strokeLinejoin="round" />}
      {f === 'tired' && <path d={`M${cx - 54},64 Q${cx},92 ${cx + 54},64`} fill="none" stroke="#5a2a7a" strokeWidth={14} strokeLinecap="round" />}
      {(f === 'angry' || f === 'evil') && <path d={`M${d * 20},-30 L${d * 135},-72`} stroke={INK} strokeWidth={18} strokeLinecap="round" />}
      {f === 'sad' && <path d={`M${d * 30},-62 Q${d * 75},-60 ${d * 130},-30`} fill="none" stroke={INK} strokeWidth={17} strokeLinecap="round" />}
      {(f === 'scared' || f === 'frozen') && <path d={`M${d * 40},-74 Q${d * 85},-96 ${d * 130},-70`} fill="none" stroke={INK} strokeWidth={14} strokeLinecap="round" />}
    </g>;
  };
  const mouth = {sad: 'M-62,120 Q0,82 62,120', angry: 'M-70,118 Q0,96 70,118', evil: 'M-80,96 Q0,150 80,96', dead: 'M-50,110 L50,110', tired: 'M-40,112 Q0,100 40,112', blank: 'M-30,110 L30,110', laser: 'M-70,96 Q0,140 70,96', scared: '', frozen: ''}[f];
  return <g transform={`translate(${EX},${EY - 10})`}>
    {[-1, 1].map(eye)}
    {mouth && <path d={mouth} fill={f === 'evil' ? '#2a0a06' : 'none'} stroke={INK} strokeWidth={13} strokeLinecap="round" />}
    {f === 'evil' && [-55, -25, 5, 35].map((x, i) => <path key={i} d={`M${x},${100 + Math.abs(x) * 0.12} l12,22 l12,-22`} fill="#fff" stroke={INK} strokeWidth={3} />)}
    {(f === 'scared' || f === 'frozen') && <ellipse cx={0} cy={118} rx={36} ry={44} fill="#2a0a06" stroke={INK} strokeWidth={11} />}
    {f === 'frozen' && [-40, -15, 12, 38].map((x, i) => <path key={i} d={`M${x - 9},${150} L${x},${190 + (i % 2) * 18} L${x + 9},${150} Z`} fill="#dff6ff" stroke={INK} strokeWidth={3} />)}
    {f === 'scared' && <path d="M140,-60 q12,28 0,40 q-12,-12 0,-40 Z" fill="#7ad0ff" stroke={INK} strokeWidth={4} />}
    {f === 'laser' && [-1, 1].map((d) => <g key={'lz' + d}><path d={`M${d * 80},10 L${d * 80 + d * 260},${260}`} stroke="#ff2a0a" strokeWidth={22} strokeLinecap="round" opacity={0.85} /><path d={`M${d * 80},10 L${d * 80 + d * 260},${260}`} stroke="#fff6c0" strokeWidth={8} strokeLinecap="round" /></g>)}
  </g>;
};

type Cfg = {wash?: string; l: string; r: string; rgrad: string; rbg: string; glow: string; bolt: string; earth: string; rim: string; face: Face; lon?: number; burn?: number; fx: string; rsize?: number};
const RIGHT_FX: Record<string, React.FC> = {
  snow: () => <>{Array.from({length: 70}, (_, i) => <div key={i} style={{position: 'absolute', left: 600 + rnd(i) * 700, top: rnd(i + 50) * 720, width: 4 + rnd(i + 9) * 8, height: 4 + rnd(i + 9) * 8, borderRadius: '50%', background: '#fff', opacity: 0.6 + rnd(i) * 0.4, boxShadow: '0 0 8px #bfe8ff'}} />)}
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 75% 50%, rgba(0,0,0,0) 40%, rgba(220,245,255,0.45) 100%)'}} /></>,
  water: () => <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>{[0, 1, 2].map((k) => <path key={k} d={`M600,${470 + k * 70} ${Array.from({length: 9}, (_, i) => `Q${640 + i * 80},${440 + k * 70 + (i % 2 ? -30 : 30)} ${680 + i * 80},${470 + k * 70}`).join(' ')} L1300,720 L600,720 Z`} fill={['rgba(40,120,220,0.55)', 'rgba(20,80,180,0.65)', 'rgba(8,40,120,0.8)'][k]} />)}
    {Array.from({length: 24}, (_, i) => <circle key={i} cx={640 + rnd(i) * 620} cy={rnd(i + 5) * 700} r={4 + rnd(i + 3) * 10} fill="none" stroke="rgba(200,240,255,0.8)" strokeWidth={3} />)}</svg>,
  vines: () => <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>{Array.from({length: 9}, (_, i) => { const x = 650 + i * 75; return <g key={i}><path d={`M${x},720 C${x - 40},${560 - rnd(i) * 100} ${x + 50},${420 - rnd(i + 2) * 120} ${x - 10},${260 - rnd(i + 4) * 160}`} fill="none" stroke="#1f6a1a" strokeWidth={10} />
    {[0, 1, 2, 3].map((j) => <ellipse key={j} cx={x + (j % 2 ? 22 : -22)} cy={640 - j * 110 - rnd(i + j) * 40} rx={22} ry={12} fill="#3bd16f" stroke="#0e3a0a" strokeWidth={3} transform={`rotate(${j % 2 ? 30 : -30} ${x} ${640 - j * 110})`} />)}</g>; })}</svg>,
  fire: () => <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, filter: 'blur(3px)'}}>{Array.from({length: 16}, (_, i) => { const x = 610 + i * 44 + (rnd(i + 5) - 0.5) * 20, h = 260 + rnd(i + 40) * 380, w = 70 + rnd(i + 9) * 50;
    return <path key={i} d={`M${x - w / 2},${H + 10} Q${x - w * 0.6},${H - h * 0.45} ${x + (rnd(i) - 0.5) * 40},${H - h} Q${x + w * 0.55},${H - h * 0.5} ${x + w / 2},${H + 10} Z`} fill={i % 3 === 0 ? 'rgba(255,170,30,0.8)' : i % 3 === 1 ? 'rgba(235,70,10,0.8)' : 'rgba(150,15,5,0.85)'} />; })}</svg>,
  ecg: () => <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><path d="M600,640 L760,640 L790,600 L820,690 L850,560 L880,640 L1300,640" fill="none" stroke="#ff3b30" strokeWidth={10} style={{filter: 'drop-shadow(0 0 10px #ff3b30)'}} /></svg>,
  siren: () => <><div style={{position: 'absolute', left: 560, top: -200, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,30,30,0.8), rgba(255,30,30,0) 70%)'}} /><div style={{position: 'absolute', left: 980, top: -220, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(40,90,255,0.75), rgba(40,90,255,0) 70%)'}} /></>,
  psy: () => <div style={{position: 'absolute', left: 300, top: -300, width: 1400, height: 1400, opacity: 0.45, background: 'repeating-conic-gradient(from 0deg at 50% 50%, rgba(190,110,255,0.9) 0deg 10deg, rgba(40,0,80,0.2) 10deg 22deg)', WebkitMaskImage: 'radial-gradient(circle, #000 20%, transparent 70%)'}} />,
  coins: () => <>{Array.from({length: 26}, (_, i) => <div key={i} style={{position: 'absolute', left: 620 + rnd(i) * 640, top: rnd(i + 30) * 700, width: 46, height: 22, transform: `rotate(${rnd(i + 3) * 360}deg)`, background: i % 3 ? 'linear-gradient(90deg, #3a5a2a, #6a8a4a)' : 'linear-gradient(90deg, #5a3a1a, #ff8a1a)', border: '3px solid #111', opacity: 0.85}} />)}</>,
  rock: () => <><div style={{position: 'absolute', left: 1190, top: 125, width: 520, height: 120, transform: 'rotate(-140deg)', transformOrigin: '0 50%', background: 'linear-gradient(90deg, rgba(255,120,30,0), rgba(255,180,60,0.9))', filter: 'blur(8px)'}} />
    <div style={{position: 'absolute', left: 1100, top: 40, width: 170, height: 170, borderRadius: '45% 55% 50% 50%', background: 'radial-gradient(circle at 35% 35%, #8a7a6a, #3a2a20 70%)', border: `6px solid ${INK}`, boxShadow: '0 0 40px 10px rgba(255,140,40,0.8)'}} /></>,
  fog: () => <>{Array.from({length: 8}, (_, i) => <div key={i} style={{position: 'absolute', left: 560 + rnd(i) * 600, top: rnd(i + 4) * 620, width: 420, height: 160, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,255,255,0.55), rgba(255,255,255,0) 70%)', filter: 'blur(6px)'}} />)}
    {[[760, 170, 70], [1180, 230, 90], [1150, 600, 60], [740, 600, 50]].map(([x, y, s], i) => <div key={'q' + i} style={{position: 'absolute', left: x, top: y, fontFamily: 'Lilita One, sans-serif', fontSize: s, color: '#fff', WebkitTextStroke: `4px ${INK}`, transform: `rotate(${i % 2 ? 12 : -10}deg)`}}>?</div>)}</>,
  float: () => <>{[['house', 720, 160, 90, -18], ['commercial-airplane', 1180, 120, 100, 20], ['tank', 760, 620, 80, 30], ['palm-tree', 1200, 600, 90, -25], ['person', 1230, 360, 60, 40], ['castle', 700, 400, 70, 15]].map(([n, x, y, w, r], i) =>
    <div key={i} style={{position: 'absolute', left: 0, top: 0, transform: `rotate(${r}deg)`, transformOrigin: `${x}px ${y}px`}}><Icon name={n as string} x={x as number} y={y as number} w={w as number} c="#e8dcff" /></div>)}</>,
  dark: () => <><div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)'}} /><div style={{position: 'absolute', left: 1080 - 90, top: 610 - 90, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,200,90,0.9), rgba(255,140,30,0) 70%)'}} />
    <div style={{position: 'absolute', left: 1068, top: 600, width: 24, height: 70, background: '#f0e6c8', border: `3px solid ${INK}`}} /><div style={{position: 'absolute', left: 1072, top: 570, width: 16, height: 30, borderRadius: '50% 50% 50% 50% / 70% 70% 30% 30%', background: '#ffd04a', boxShadow: '0 0 20px #ffb030'}} /></>,
  rays: () => <div style={{position: 'absolute', left: 365, top: -180, width: 1200, height: 1200, opacity: 0.6, background: 'repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,220,80,0.95) 0deg 6deg, transparent 6deg 18deg)', WebkitMaskImage: 'radial-gradient(circle, #000 15%, transparent 65%)'}} />,
};
export const CFG: Record<string, Cfg> = {
  cold: {wash: 'rgba(215,242,255,0.55)', l: '+15°C', r: '-273°C', rgrad: 'linear-gradient(180deg, #ffffff 0%, #dff6ff 40%, #8ad8ff 75%, #3a9aff 100%)', rbg: 'radial-gradient(ellipse at 70% 110%, #ffffff 0%, #bfe8ff 18%, #4a9ad8 42%, #123a6a 70%, #04121e 100%)', glow: 'rgba(190,235,255,0.75)', bolt: '#bfe8ff', earth: 'grayscale(0.7) brightness(1.5) hue-rotate(170deg) saturate(1.6)', rim: '#dff6ff', face: 'frozen', fx: 'snow'},
  ocean: {wash: 'rgba(30,110,230,0.35)', l: 'WEEK 1', r: 'WEEK 300', rgrad: 'linear-gradient(180deg, #e8fbff 0%, #7fd0ff 40%, #2a7ad8 75%, #0a3a9a 100%)', rbg: 'radial-gradient(ellipse at 70% 30%, #4ab0ff 0%, #1a5ab8 30%, #0a2a6a 65%, #020a1e 100%)', glow: 'rgba(80,170,255,0.7)', bolt: '#3a9aff', earth: 'grayscale(0.6) sepia(0.4) hue-rotate(170deg) saturate(2.6) brightness(0.9)', rim: '#7fd0ff', face: 'scared', fx: 'water'},
  babies: {l: '2030', r: '2130', rgrad: 'linear-gradient(180deg, #f0ffe8 0%, #a8ff8a 40%, #3bd16f 75%, #1a7a2a 100%)', rbg: 'radial-gradient(ellipse at 70% 100%, #8aff5a 0%, #2f8a2a 28%, #0e3a0a 62%, #020a02 100%)', glow: 'rgba(120,255,120,0.55)', bolt: '#7aff5a', earth: 'sepia(0.5) hue-rotate(60deg) saturate(1.6) brightness(0.95)', rim: '#b8ff9a', face: 'sad', fx: 'vines'},
  heat: {l: '+15°C', r: '+460°C', rgrad: 'linear-gradient(180deg, #fffbe0 0%, #ffe14a 30%, #ff8a1a 60%, #ff2a0a 100%)', rbg: 'radial-gradient(ellipse at 70% 110%, #ffcf3a 0%, #ff6a0a 14%, #c8160a 34%, #6a0604 58%, #1e0202 85%, #0a0101 100%)', glow: 'rgba(255,110,30,0.75)', bolt: '#ffb030', earth: '', rim: '#ffb060', face: 'angry', burn: 1.3, fx: 'fire'},
  thirty: {l: 'AGE 1', r: 'AGE 30', rgrad: 'linear-gradient(180deg, #ffe8e8 0%, #ff9a8a 40%, #ff3b30 75%, #8a0a06 100%)', rbg: 'radial-gradient(ellipse at 70% 50%, #4a0606 0%, #1e0202 55%, #000 100%)', glow: 'rgba(255,60,60,0.55)', bolt: '#ff3b30', earth: 'grayscale(1) brightness(0.8)', rim: '#ff6a5a', face: 'dead', fx: 'ecg'},
  purge: {wash: 'rgba(120,0,0,0.3)', l: 'DAY', r: 'NIGHT', rgrad: 'linear-gradient(180deg, #ffe8e8 0%, #ff6a5a 40%, #c3100a 75%, #5a0202 100%)', rbg: 'radial-gradient(ellipse at 70% 80%, #8a0a06 0%, #3a0202 45%, #0a0000 100%)', glow: 'rgba(255,30,30,0.6)', bolt: '#ff2a0a', earth: 'brightness(0.6) sepia(0.6) hue-rotate(-30deg) saturate(2.5)', rim: '#ff3b30', face: 'evil', fx: 'siren'},
  nosleep: {l: 'NIGHT 1', r: 'NIGHT 30', rgrad: 'linear-gradient(180deg, #f8eaff 0%, #d0a0ff 40%, #9a4aff 75%, #4a0a8a 100%)', rbg: 'radial-gradient(ellipse at 70% 50%, #5a1a9a 0%, #2a0a5a 45%, #08001a 100%)', glow: 'rgba(170,90,255,0.65)', bolt: '#b98aff', earth: 'hue-rotate(220deg) saturate(1.6) contrast(1.2)', rim: '#d0a0ff', face: 'tired', fx: 'psy'},
  money: {l: '$48,210', r: '$0', rgrad: 'linear-gradient(180deg, #fffbe0 0%, #ffe680 35%, #d8a020 70%, #7a4a06 100%)', rbg: 'radial-gradient(ellipse at 70% 60%, #3a3a3a 0%, #1a1a1a 55%, #050505 100%)', glow: 'rgba(255,210,60,0.45)', bolt: '#ffd23f', earth: 'grayscale(1) contrast(1.1)', rim: '#cfd8e8', face: 'sad', fx: 'coins', rsize: 150},
  deathdate: {l: '2031', r: '2033', rgrad: 'linear-gradient(180deg, #e8fdff 0%, #9af0ff 40%, #3ac0e8 75%, #0a5a8a 100%)', rbg: 'radial-gradient(ellipse at 80% 15%, #ff9a3a 0%, #6a2a1a 20%, #0a1a3a 55%, #01040e 100%)', glow: 'rgba(120,240,255,0.5)', bolt: '#7af0ff', earth: 'brightness(0.85)', rim: '#7af0ff', face: 'scared', fx: 'rock'},
  memory: {wash: 'rgba(255,255,255,0.25)', l: '11:59', r: '00:00', rgrad: 'linear-gradient(180deg, #ffffff 0%, #e8f0ff 45%, #a8c8ff 75%, #5a7ad8 100%)', rbg: 'radial-gradient(ellipse at 70% 50%, #c8d8f0 0%, #6a7a9a 45%, #1a2030 100%)', glow: 'rgba(220,235,255,0.7)', bolt: '#c8d8ff', earth: 'grayscale(0.85) brightness(1.25) contrast(0.8)', rim: '#e8f0ff', face: 'blank', fx: 'fog'},
  gravity: {l: '0 SEC', r: '5 SEC', rgrad: 'linear-gradient(180deg, #faf0ff 0%, #d8b8ff 40%, #9a6aff 75%, #3a1a8a 100%)', rbg: 'radial-gradient(ellipse at 70% 50%, #3a2a7a 0%, #140a3a 50%, #02010a 100%)', glow: 'rgba(185,138,255,0.6)', bolt: '#b98aff', earth: 'saturate(1.2)', rim: '#d8b8ff', face: 'scared', fx: 'float'},
  power: {l: 'ON', r: 'OFF', rgrad: 'linear-gradient(180deg, #fffbe0 0%, #ffe680 40%, #ffb030 75%, #8a5a06 100%)', rbg: 'radial-gradient(ellipse at 70% 80%, #1a1408 0%, #050402 55%, #000 100%)', glow: 'rgba(255,200,90,0.25)', bolt: '#ffd96a', earth: 'brightness(0.3) saturate(0.5)', rim: '#5a5040', face: 'scared', fx: 'dark'},
  powers: {l: 'NORMAL', r: 'POWERS', rgrad: 'linear-gradient(180deg, #fffbe0 0%, #ffe14a 35%, #ffb020 70%, #c86a06 100%)', rbg: 'radial-gradient(ellipse at 70% 50%, #ffd23f 0%, #c86a06 30%, #5a1a02 65%, #120400 100%)', glow: 'rgba(255,210,60,0.8)', bolt: '#ffd23f', earth: 'saturate(1.4) contrast(1.1)', rim: '#ffe680', face: 'laser', fx: 'rays', rsize: 120},
};

export const ThumbW: React.FC<{k: string}> = ({k}) => {
  const c = CFG[k]; const FX = RIGHT_FX[c.fx];
  return (<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    <Bright />
    <AbsoluteFill style={{clipPath: RIGHT, background: c.rbg, filter: 'contrast(1.2) saturate(1.3)'}}><FX /><div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 75% 45%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.6) 100%)'}} /></AbsoluteFill>
    {c.fx === 'fire' && <Embers n={60} seed={41} c="#ffd27a" />}
    {c.fx === 'fire' && <Smoke list={[[760, 650, 110], [1180, 680, 120], [1250, 120, 90]]} />}
    <Glow x={320} y={420} r={320} c="rgba(170,235,255,0.6)" />
    <div style={{position: 'absolute', left: 320 - 220, top: 420 - 220}}><Planet size={440} mood="happy" lon={10} lat={22} rim="#c8f2ff" /></div>
    <Glow x={EX} y={EY} r={360} c={c.glow} />
    <div style={{position: 'absolute', left: 0, top: 0, filter: c.earth || undefined}}><Earth x={EX} y={EY} size={440} lon={c.lon ?? 15} lat={22} burn={c.burn ?? 0} /></div>
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <defs><radialGradient id="rimw" cx="50%" cy="50%" r="50%"><stop offset="0.82" stopColor="rgba(0,0,0,0)" /><stop offset="0.95" stopColor={c.rim} stopOpacity={0.8} /><stop offset="1" stopColor={c.rim} /></radialGradient></defs>
      {c.wash && <circle cx={EX} cy={EY} r={ER} fill={c.wash} />}
      <circle cx={EX} cy={EY} r={220} fill="url(#rimw)" />
      <circle cx={EX} cy={EY} r={ER} fill="none" stroke={INK} strokeWidth={17} />
      <FaceSVG f={c.face} />
    </svg>
    <Bolt rc={c.bolt} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)'}} />
    <Title3D text={c.l} x={320} y={6} size={132} grad={SKY} glow="rgba(120,220,255,1)" rot={-4} />
    <Title3D text={c.r} x={965} y={6} size={c.rsize ?? 132} grad={c.rgrad} glow={c.bolt} rot={4} />
  </AbsoluteFill>);
};
