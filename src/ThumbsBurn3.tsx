// Antes / después de la Tierra, con el acabado de "USA VS THE ENTIRE WORLD" (fondos ricos, rayo, título 3D)
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, Face} from './lib3';
import {Embers, Glow} from './ThumbsPro';
import {Planet} from './Logos';
import {Title3D, GOLD, WHITE, Smoke} from './ThumbsFinal';
import {Earth} from './ThumbsBurn';

const W = 1280, H = 720, BX = 640;
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const BOLT = [[BX + 50, -20], [BX - 10, 302], [BX + 40, 318], [BX - 50, H + 20]];
const boltD = BOLT.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
const LEFT = `polygon(0px 0px, ${BOLT.map((p) => `${p[0]}px ${p[1]}px`).join(', ')}, 0px ${H}px)`;
const RIGHT = `polygon(${BOLT.map((p) => `${p[0]}px ${p[1]}px`).join(', ')}, ${W}px ${H}px, ${W}px 0px)`;
const FIRE = 'linear-gradient(180deg, #fffbe0 0%, #ffd84a 30%, #ff8a1a 62%, #e0300a 100%)';

const Bolt: React.FC<{rc?: string}> = ({rc = '#ffb030'}) => {
  const branch = (i: number) => { const t = 0.12 + rnd(30 + i) * 0.8; const seg = t < 0.43 ? 0 : t < 0.45 ? 1 : 2; const a = BOLT[seg], b = BOLT[seg + 1]; const u = seg === 1 ? 0.5 : seg === 0 ? t / 0.43 : (t - 0.45) / 0.55;
    const x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u; const d = i % 2 ? 1 : -1; const L = 40 + rnd(i + 30) * 50;
    return `M${x},${y} l${d * L * 0.5},${-L * 0.25} l${d * L * 0.15},${L * 0.3} l${d * L * 0.45},${-L * 0.2}`; };
  return (<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <defs><filter id="bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter><filter id="bs" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" /></filter></defs>
    <path d={boltD} transform="translate(-14,0)" stroke="#5fd0ff" strokeWidth={60} fill="none" filter="url(#bl)" opacity={0.85} />
    <path d={boltD} transform="translate(14,0)" stroke={rc} strokeWidth={60} fill="none" filter="url(#bl)" opacity={0.85} />
    {Array.from({length: 7}, (_, i) => <path key={i} d={branch(i)} stroke="#e8f8ff" strokeWidth={4} fill="none" filter="url(#bs)" />)}
    {Array.from({length: 7}, (_, i) => <path key={'b' + i} d={branch(i)} stroke="#fff" strokeWidth={2} fill="none" />)}
    <path d={boltD} stroke={INK} strokeWidth={30} fill="none" />
    <path d={boltD} stroke="#fff" strokeWidth={17} fill="none" />
    <path d={boltD} stroke="#fff3c0" strokeWidth={6} fill="none" filter="url(#bs)" />
    {Array.from({length: 26}, (_, i) => { const y = rnd(i + 3) * H; const x = BX + 30 - (y / H) * 70 + (rnd(i + 7) - 0.5) * 90; return <circle key={'s' + i} cx={x} cy={y} r={1.5 + rnd(i + 3) * 3} fill={i % 2 ? '#fff6c0' : '#c8f2ff'} />; })}
  </svg>);
};
const Sparkle: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => <div style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, background: '#fff', clipPath: 'polygon(50% 0, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0 50%, 40% 40%)', filter: 'drop-shadow(0 0 8px #bff0ff)'}} />;
const Mini: React.FC<{x: number; y: number; h: number; rot: number}> = ({x, y, h, rot}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, transform: `rotate(${rot}deg)`}}>
    <div style={{position: 'absolute', left: -h * 0.09, top: -h * 0.75, width: h * 0.18, height: h * 0.75, background: 'linear-gradient(90deg, #8a3a14, #ffb060 50%, #8a3a14)', clipPath: 'polygon(25% 0, 75% 0, 100% 100%, 0 100%)', border: 'none'}} />
    <div style={{position: 'absolute', left: -h * 0.36, top: -h * 1.0, width: h * 0.72, height: h * 0.42, borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 70%, #fffbe0 0%, #ffbe48 30%, #e8601e 60%, #5a3a2a 92%)', border: `3px solid ${INK}`}} />
  </div>
);

const BA = () => (<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
  {/* izquierda: cielo brillante */}
  <AbsoluteFill style={{clipPath: LEFT, background: 'radial-gradient(ellipse at 30% 40%, #c8f0ff 0%, #6cc4ff 22%, #2f7fe0 50%, #133a9a 80%, #0a1f5a 100%)'}}>
    <div style={{position: 'absolute', left: -300, top: -300, width: 1200, height: 1200, opacity: 0.35, background: 'repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,0.9) 0deg 7deg, transparent 7deg 20deg)', WebkitMaskImage: 'radial-gradient(circle, #000 10%, transparent 65%)', transform: 'translate(20px, 40px)'}} />
    {[[90, 120, 170], [470, 80, 140], [80, 610, 190], [520, 640, 150]].map(([x, y, r], i) => <div key={i} style={{position: 'absolute', left: x - r, top: y - r * 0.45, width: r * 2, height: r * 0.9, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,255,255,0.85), rgba(255,255,255,0) 70%)', filter: 'blur(4px)'}} />)}
    {[[110, 260, 26], [560, 230, 20], [150, 520, 18], [540, 540, 30], [460, 160, 14]].map(([x, y, s], i) => <Sparkle key={i} x={x} y={y} s={s} />)}
    {/* luz: bloom central y destello */}
    <div style={{position: 'absolute', left: 320 - 380, top: 420 - 380, width: 760, height: 760, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(220,245,255,0.45) 30%, rgba(160,220,255,0) 65%)'}} />
    <div style={{position: 'absolute', left: -40, top: 405, width: 720, height: 30, borderRadius: '50%', background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.8), rgba(255,255,255,0))', filter: 'blur(6px)'}} />
    {Array.from({length: 30}, (_, i) => <div key={'p' + i} style={{position: 'absolute', left: rnd(i + 70) * 620, top: rnd(i + 90) * 720, width: 4 + rnd(i) * 6, height: 4 + rnd(i) * 6, borderRadius: '50%', background: '#fff', boxShadow: '0 0 10px 4px rgba(200,240,255,0.8)', opacity: 0.5 + rnd(i + 3) * 0.5}} />)}
  </AbsoluteFill>
  {/* derecha: infierno */}
  <AbsoluteFill style={{clipPath: RIGHT, background: 'radial-gradient(ellipse at 70% 110%, #ffcf3a 0%, #ff6a0a 14%, #c8160a 34%, #6a0604 58%, #1e0202 85%, #0a0101 100%)', filter: 'contrast(1.25) saturate(1.35)'}}>
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: 0.55, filter: 'blur(5px)'}}>
      {Array.from({length: 10}, (_, i) => { const x = 600 + i * 72, h = 170 + rnd(i) * 240; return <path key={i} d={`M${x},${H} Q${x + 30},${H - h * 0.6} ${x + 45},${H - h} Q${x + 70},${H - h * 0.55} ${x + 95},${H} Z`} fill="#ffd25a" />; })}
    </svg>
    <div style={{position: 'absolute', left: 620, right: -40, top: -90, height: 240, background: 'radial-gradient(ellipse at 30% 60%, rgba(30,8,4,0.85) 0%, rgba(30,8,4,0) 55%), radial-gradient(ellipse at 75% 50%, rgba(30,8,4,0.8) 0%, rgba(30,8,4,0) 55%)', filter: 'blur(8px)'}} />
    <Smoke list={[[760, 650, 110], [1180, 680, 120], [1250, 120, 90]]} />
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 75% 45%, rgba(0,0,0,0) 30%, rgba(15,0,0,0.7) 100%)'}} />
    {/* infierno: lenguas de fuego que suben por todo el lado */}
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, filter: 'blur(3px)'}}>
      {Array.from({length: 16}, (_, i) => { const x = 610 + i * 44 + (rnd(i + 5) - 0.5) * 20, h = 260 + rnd(i + 40) * 380, w = 70 + rnd(i + 9) * 50;
        return <path key={i} d={`M${x - w / 2},${H + 10} Q${x - w * 0.6},${H - h * 0.45} ${x + (rnd(i) - 0.5) * 40},${H - h} Q${x + w * 0.55},${H - h * 0.5} ${x + w / 2},${H + 10} Z`} fill={i % 3 === 0 ? 'rgba(255,170,30,0.8)' : i % 3 === 1 ? 'rgba(235,70,10,0.8)' : 'rgba(150,15,5,0.85)'} />; })}
    </svg>
    <div style={{position: 'absolute', left: 600, right: 0, bottom: 0, height: 260, background: 'linear-gradient(0deg, rgba(255,150,30,0.75), rgba(200,40,10,0.35) 50%, rgba(120,10,0,0))'}} />
  </AbsoluteFill>
  <Embers n={60} seed={41} c="#ffd27a" />
  {/* Tierra feliz */}
  <Glow x={320} y={420} r={320} c="rgba(170,235,255,0.6)" />
  <div style={{position: 'absolute', left: 320 - 220, top: 420 - 220}}><Planet size={440} mood="happy" lon={10} lat={22} rim="#c8f2ff" /></div>
  {/* Tierra malvada: carbonizada, lava, humo y cara enfadada */}
  <Glow x={965} y={420} r={360} c="rgba(255,110,30,0.75)" />
  {Array.from({length: 7}, (_, i) => { const x = 820 + i * 48 + (rnd(i) - 0.5) * 30, r = 50 + rnd(i + 4) * 50; return <div key={'sm' + i} style={{position: 'absolute', left: x - r, top: 150 - i % 3 * 40 - r - rnd(i + 2) * 60, width: r * 2, height: r * 2, borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, rgba(70,50,45,0.9), rgba(30,20,18,0.75) 60%, rgba(20,12,10,0) 72%)', filter: 'blur(2px)'}} />; })}
  <Earth x={965} y={420} size={440} lon={15} lat={22} burn={1.3} />
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <defs>
      <radialGradient id="rim" cx="50%" cy="50%" r="50%"><stop offset="0.82" stopColor="rgba(255,120,30,0)" /><stop offset="0.95" stopColor="rgba(255,140,40,0.85)" /><stop offset="1" stopColor="rgba(255,220,120,1)" /></radialGradient>
      <filter id="gl"><feGaussianBlur stdDeviation="5" /></filter>
      <radialGradient id="eye" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#fff6a0" /><stop offset="0.35" stopColor="#ffb020" /><stop offset="1" stopColor="#d01a08" /></radialGradient>
    </defs>
    <circle cx={965} cy={420} r={220} fill="url(#rim)" />
    <circle cx={965} cy={420} r={212} fill="none" stroke={INK} strokeWidth={17} />
    {/* cráteres incandescentes */}
    {[[870, 330, 26], [1070, 520, 30], [1060, 300, 18], [880, 545, 20], [1120, 410, 16]].map(([x, y, r], i) => <g key={'c' + i}><ellipse cx={x} cy={y} rx={r} ry={r * 0.7} fill="#1a0a06" stroke="#ff8a20" strokeWidth={3} /><ellipse cx={x} cy={y + r * 0.15} rx={r * 0.55} ry={r * 0.32} fill="#ff6a10" filter="url(#gl)" /></g>)}
    {/* cara triste y seria */}
    <g transform="translate(965,410)">
      {[-1, 1].map((d) => <g key={d}>
        <ellipse cx={d * 80} cy={10} rx={50} ry={44} fill="#fff" stroke={INK} strokeWidth={9} />
        <circle cx={d * 80 + d * -4} cy={30} r={17} fill={INK} />
        <circle cx={d * 80 + d * -4 - 6} cy={24} r={5} fill="#fff" />
        {/* párpado caído */}
        <path d={`M${d * 80 - 54},6 Q${d * 80},-48 ${d * 80 + 54},6 Q${d * 80},-8 ${d * 80 - 54},6 Z`} fill="#3a1a10" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        {/* ceja triste: el lado interior sube */}
        <path d={`M${d * 30},-62 Q${d * 75},-60 ${d * 130},-30`} fill="none" stroke={INK} strokeWidth={17} strokeLinecap="round" />
      </g>)}
      <path d="M-62,120 Q0,82 62,120" fill="none" stroke={INK} strokeWidth={13} strokeLinecap="round" />
    </g>
  </svg>
  <Bolt />
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)'}} />
  <Title3D text="BEFORE" x={320} y={6} size={132} grad="linear-gradient(180deg, #ffffff 0%, #e8fbff 45%, #7fe0ff 75%, #2fa8ff 100%)" glow="rgba(120,220,255,1)" rot={-4} />
  <Title3D text="AFTER" x={965} y={6} size={132} grad="linear-gradient(180deg, #fffbe0 0%, #ffe14a 30%, #ff8a1a 60%, #ff2a0a 100%)" glow="rgba(255,90,20,1)" rot={4} />
</AbsoluteFill>);
export const ThumbBurn3: React.FC = () => <BA />;

// ---------- WHAT IF A ZOMBIE OUTBREAK STARTED TODAY: día 1 / día 30 ----------
const ZOMB = () => (<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
  {/* izquierda: cielo brillante */}
  <AbsoluteFill style={{clipPath: LEFT, background: 'radial-gradient(ellipse at 30% 40%, #c8f0ff 0%, #6cc4ff 22%, #2f7fe0 50%, #133a9a 80%, #0a1f5a 100%)'}}>
    <div style={{position: 'absolute', left: -300, top: -300, width: 1200, height: 1200, opacity: 0.35, background: 'repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,0.9) 0deg 7deg, transparent 7deg 20deg)', WebkitMaskImage: 'radial-gradient(circle, #000 10%, transparent 65%)', transform: 'translate(20px, 40px)'}} />
    {[[90, 120, 170], [470, 80, 140], [80, 610, 190], [520, 640, 150]].map(([x, y, r], i) => <div key={i} style={{position: 'absolute', left: x - r, top: y - r * 0.45, width: r * 2, height: r * 0.9, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,255,255,0.85), rgba(255,255,255,0) 70%)', filter: 'blur(4px)'}} />)}
    {[[110, 260, 26], [560, 230, 20], [150, 520, 18], [540, 540, 30], [460, 160, 14]].map(([x, y, s], i) => <Sparkle key={i} x={x} y={y} s={s} />)}
    {/* luz: bloom central y destello */}
    <div style={{position: 'absolute', left: 320 - 380, top: 420 - 380, width: 760, height: 760, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(220,245,255,0.45) 30%, rgba(160,220,255,0) 65%)'}} />
    <div style={{position: 'absolute', left: -40, top: 405, width: 720, height: 30, borderRadius: '50%', background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.8), rgba(255,255,255,0))', filter: 'blur(6px)'}} />
    {Array.from({length: 30}, (_, i) => <div key={'p' + i} style={{position: 'absolute', left: rnd(i + 70) * 620, top: rnd(i + 90) * 720, width: 4 + rnd(i) * 6, height: 4 + rnd(i) * 6, borderRadius: '50%', background: '#fff', boxShadow: '0 0 10px 4px rgba(200,240,255,0.8)', opacity: 0.5 + rnd(i + 3) * 0.5}} />)}
  </AbsoluteFill>
  {/* derecha: brote tóxico */}
  <AbsoluteFill style={{clipPath: RIGHT, background: 'radial-gradient(ellipse at 70% 112%, #d8ff4a 0%, #7ad11a 12%, #2f7a0e 32%, #0f3206 56%, #041204 82%, #000 100%)', filter: 'contrast(1.25) saturate(1.3)'}}>
    {Array.from({length: 9}, (_, i) => <div key={i} style={{position: 'absolute', left: 600 + rnd(i + 3) * 700 - 160, top: 60 + rnd(i + 8) * 600 - 90, width: 320, height: 180, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(150,255,80,0.22), rgba(150,255,80,0) 70%)', filter: 'blur(10px)'}} />)}
    <div style={{position: 'absolute', left: 620, right: -40, top: -90, height: 240, background: 'radial-gradient(ellipse at 30% 60%, rgba(4,16,4,0.9) 0%, rgba(4,16,4,0) 55%), radial-gradient(ellipse at 75% 50%, rgba(4,16,4,0.85) 0%, rgba(4,16,4,0) 55%)', filter: 'blur(8px)'}} />
    {/* manos que salen del suelo */}
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      {[[700, 1.0, -8], [800, 0.8, 6], [1150, 1.1, 10], [1240, 0.85, -6], [1040, 0.7, 2]].map(([x, k, r], i) => <g key={i} transform={`translate(${x},${H + 10}) rotate(${r}) scale(${k})`}>
        <path d="M-22,0 L-20,-120 L-30,-150 L-34,-200 Q-34,-210 -26,-208 L-18,-160 L-16,-215 Q-14,-226 -6,-222 L-4,-165 L2,-222 Q6,-232 14,-226 L12,-162 L22,-205 Q28,-212 32,-204 L22,-140 L26,-118 L22,0 Z" fill="#1c2a12" stroke="#000" strokeWidth={6} strokeLinejoin="round" />
      </g>)}
    </svg>
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 75% 45%, rgba(0,0,0,0) 30%, rgba(0,10,0,0.7) 100%)'}} />
  </AbsoluteFill>
  <Embers n={40} seed={44} c="#c8ff7a" />
  {/* Tierra feliz */}
  <Glow x={320} y={420} r={320} c="rgba(170,235,255,0.6)" />
  <div style={{position: 'absolute', left: 320 - 220, top: 420 - 220}}><Planet size={440} mood="happy" lon={10} lat={22} rim="#c8f2ff" /></div>
  {/* Tierra zombi */}
  <Glow x={965} y={420} r={360} c="rgba(150,255,60,0.55)" />
  <div style={{position: 'absolute', left: 0, top: 0, filter: 'grayscale(0.35) sepia(0.65) hue-rotate(48deg) saturate(1.9) brightness(1.15) contrast(1.1)'}}><Earth x={965} y={420} size={440} lon={-60} lat={15} /></div>
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <defs>
      <radialGradient id="zr" cx="50%" cy="50%" r="50%"><stop offset="0.8" stopColor="rgba(120,220,40,0)" /><stop offset="0.96" stopColor="rgba(140,255,60,0.7)" /><stop offset="1" stopColor="rgba(200,255,120,0.9)" /></radialGradient>
      <filter id="zg"><feGaussianBlur stdDeviation="4" /></filter>
      <clipPath id="zc"><circle cx={965} cy={420} r={212} /></clipPath>
    </defs>
    <g clipPath="url(#zc)">
      {/* manchas podridas y venas */}
      {[[860, 300, 60], [1080, 520, 70], [1110, 300, 40], [880, 560, 50]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.7} fill="rgba(40,70,10,0.55)" />)}
      {[[790, 380, 900, 330, 960, 360], [1150, 360, 1060, 410, 1020, 380], [980, 600, 1000, 530, 1060, 560]].map(([a, b, c, d, e, f], i) => <path key={'v' + i} d={`M${a},${b} Q${c},${d} ${e},${f}`} fill="none" stroke="#1a3a06" strokeWidth={6} strokeLinecap="round" />)}
      {/* cicatriz cosida */}
      <path d="M1040,250 L1150,345" stroke={INK} strokeWidth={7} strokeLinecap="round" />
      {[0, 1, 2, 3, 4].map((j) => { const x = 1050 + j * 22, y = 259 + j * 19; return <path key={j} d={`M${x - 12},${y + 12} L${x + 12},${y - 12}`} stroke={INK} strokeWidth={5} strokeLinecap="round" />; })}
    </g>
    <circle cx={965} cy={420} r={220} fill="url(#zr)" />
    <circle cx={965} cy={420} r={212} fill="none" stroke={INK} strokeWidth={17} />
    {/* cara zombi: ojos desiguales y boca abierta con babas */}
    <g transform="translate(965,410)">
      <circle cx={-80} cy={0} r={58} fill="#f2f5d0" stroke={INK} strokeWidth={9} />
      <circle cx={-72} cy={10} r={9} fill={INK} />
      <ellipse cx={80} cy={12} rx={42} ry={30} fill="#e6ec9a" stroke={INK} strokeWidth={9} />
      <path d="M38,0 Q80,-30 122,0 Q80,-8 38,0 Z" fill="#3a5a1a" stroke={INK} strokeWidth={7} />
      <circle cx={90} cy={18} r={7} fill="#c3100a" />
      <path d="M-30,-70 L-130,-55" stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <path d="M40,-48 L130,-70" stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <path d="M-95,85 Q0,70 95,92 Q70,170 0,165 Q-80,160 -95,85 Z" fill="#2a0a06" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      {[-70, -35, 5, 40, 72].map((x, i) => <rect key={i} x={x - 11} y={84 + (i % 2) * 4} width={22} height={18 + (i % 3) * 6} fill="#e8e0b0" stroke={INK} strokeWidth={3} />)}
      <path d="M-30,160 Q-26,200 -34,225 Q-22,232 -18,205 Q-16,182 -14,162 Z" fill="#a8ff3a" stroke={INK} strokeWidth={4} />
      <path d="M50,150 Q56,180 50,198 Q62,204 64,180 Q64,164 62,148 Z" fill="#a8ff3a" stroke={INK} strokeWidth={4} />
    </g>
  </svg>
  <Bolt rc="#8aff3a" />
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)'}} />
  <Title3D text="DAY 1" x={320} y={6} size={132} grad="linear-gradient(180deg, #ffffff 0%, #e8fbff 45%, #7fe0ff 75%, #2fa8ff 100%)" glow="rgba(120,220,255,1)" rot={-4} />
  <Title3D text="DAY 30" x={965} y={6} size={132} grad="linear-gradient(180deg, #f8ffe0 0%, #d8ff5a 30%, #7ad11a 62%, #2f7a0e 100%)" glow="rgba(140,255,60,1)" rot={4} />
</AbsoluteFill>);
export const ThumbZombie: React.FC = () => <ZOMB />;
