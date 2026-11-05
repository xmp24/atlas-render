// Miniaturas "What If Earth Burned in 24 Hours?" — 1280x720, poco texto, un foco por miniatura
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {COUNTRIES} from './HexWorld';
import {INK, font} from './lib3';
import {CBall} from './ThumbsCB';
import {Glow, Rays, Embers, Title, Vig} from './ThumbsPro';

const W = 1280, H = 720;
const K = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- piezas ----------
const Stars: React.FC<{n?: number}> = ({n = 140}) => <>{Array.from({length: n}, (_, i) => { const s = 1 + rnd(i + 3) * 2.4; return <div key={i} style={{position: 'absolute', left: rnd(i) * W, top: rnd(i + 99) * H, width: s, height: s, borderRadius: '50%', background: '#fff', opacity: 0.3 + rnd(i + 7) * 0.7}} />; })}</>;
// grietas de lava en coordenadas 0..1 del disco
const lavaPaths = (seed: number, n: number) => Array.from({length: n}, (_, i) => {
  let x = 0.3 + rnd(seed + i) * 0.7, y = 0.1 + rnd(seed + i * 3) * 0.8, a = rnd(seed + i * 7) * 6.28; let d = `M${x},${y}`;
  for (let j = 0; j < 9; j++) { a += (rnd(seed + i * 11 + j) - 0.5) * 1.4; x += Math.cos(a) * 0.045; y += Math.sin(a) * 0.045; d += ` L${x.toFixed(3)},${y.toFixed(3)}`; }
  return d;
});
// Tierra realista: textura + sombreado; burn 0..1 = parte derecha en llamas
const Earth: React.FC<{x: number; y: number; size: number; lon?: number; lat?: number; burn?: number; split?: boolean}> = ({x, y, size, lon = 20, lat = 25, burn = 0, split}) => {
  const IW = size * 3.0, IH = IW / 2; const ix = -((lon + 180) / 360) * IW + size / 2, iy = -((90 - lat) / 180) * IH + size / 2;
  const mask = split ? 'linear-gradient(90deg, transparent 47%, #000 53%)' : `radial-gradient(circle at 85% 40%, #000 ${burn * 55}%, transparent ${burn * 80}%)`;
  return (
    <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size}}>
      <div style={{position: 'absolute', inset: -size * 0.08, borderRadius: '50%', background: 'radial-gradient(circle, rgba(120,190,255,0.55) 58%, transparent 72%)'}} />
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden'}}>
        <Img src={staticFile('hw/marble2k.jpg')} style={{position: 'absolute', left: ix, top: iy, width: IW, height: IH, filter: 'saturate(1.3) contrast(1.1)'}} />
        {burn > 0 && <div style={{position: 'absolute', inset: 0, WebkitMaskImage: mask, maskImage: mask}}>
          <Img src={staticFile('hw/marble2k.jpg')} style={{position: 'absolute', left: ix, top: iy, width: IW, height: IH, filter: 'grayscale(1) brightness(0.28) sepia(0.6) contrast(1.4)'}} />
          <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 45%, rgba(255,120,20,0.45), rgba(120,20,0,0.25) 60%, rgba(0,0,0,0) 80%)', mixBlendMode: 'screen'}} />
          <svg viewBox="0 0 1 1" width={size} height={size} style={{position: 'absolute', left: 0, top: 0}}>
            <defs><filter id="lv"><feGaussianBlur stdDeviation="0.006" /></filter></defs>
            {lavaPaths(5, 26).map((d, i) => <g key={i}><path d={d} fill="none" stroke="#ff6a00" strokeWidth={0.014} filter="url(#lv)" opacity={0.9} /><path d={d} fill="none" stroke="#ffe08a" strokeWidth={0.0045} /></g>)}
          </svg>
        </div>}
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 30%), radial-gradient(circle at 60% 60%, rgba(0,0,0,0) 45%, rgba(0,0,20,0.75) 100%)'}} />
      </div>
    </div>
  );
};
// hongo nuclear detallado
const Mushroom: React.FC<{x: number; y: number; h: number; hot?: number}> = ({x, y, h, hot = 1}) => {
  const cw = h * 0.62, ch = h * 0.34, cy = y - h * 0.78;
  const puffs = Array.from({length: 22}, (_, i) => { const a = (i / 22) * Math.PI * 2; return [Math.cos(a) * cw * (0.42 + 0.12 * rnd(i)), Math.sin(a) * ch * 0.42 - ch * 0.05, cw * (0.2 + 0.12 * rnd(i + 5))]; });
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, pointerEvents: 'none'}}>
      <Glow x={x} y={cy} r={h * 0.9} c={`rgba(255,140,40,${0.55 * hot})`} />
      {/* falda de polvo */}
      <div style={{position: 'absolute', left: x - cw * 1.1, top: y - ch * 0.35, width: cw * 2.2, height: ch * 0.7, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,170,90,0.95) 0%, rgba(160,80,40,0.85) 45%, rgba(70,40,30,0) 75%)', filter: 'blur(2px)'}} />
      {/* tallo */}
      <div style={{position: 'absolute', left: x - cw * 0.17, top: cy, width: cw * 0.34, height: y - cy, background: 'linear-gradient(90deg, rgba(110,50,25,0.9), rgba(255,170,80,1) 45%, rgba(255,210,140,1) 55%, rgba(120,55,25,0.9))', clipPath: 'polygon(28% 0, 72% 0, 100% 100%, 0 100%)', filter: 'blur(1.5px)'}} />
      {/* anillo de condensación */}
      <div style={{position: 'absolute', left: x - cw * 0.55, top: cy + (y - cy) * 0.45, width: cw * 1.1, height: ch * 0.28, borderRadius: '50%', border: `${h * 0.025}px solid rgba(235,225,215,0.75)`, filter: 'blur(2px)'}} />
      {/* sombrero */}
      {puffs.map(([dx, dy, r], i) => <div key={i} style={{position: 'absolute', left: x + dx - r, top: cy + dy - r, width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(circle at 45% 35%, rgba(140,110,95,1), rgba(80,55,45,1) 70%)`}} />)}
      <div style={{position: 'absolute', left: x - cw * 0.55, top: cy - ch * 0.5, width: cw * 1.1, height: ch, borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 70%, rgba(255,250,210,1) 0%, rgba(255,190,70,1) 28%, rgba(240,100,30,0.95) 55%, rgba(120,60,40,0.9) 85%)'}} />
      <div style={{position: 'absolute', left: x - cw * 0.45, top: cy - ch * 0.58, width: cw * 0.9, height: ch * 0.55, borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 80%, rgba(255,200,110,0.5), rgba(120,90,80,0.95) 70%)'}} />
      <div style={{position: 'absolute', left: x - cw * 0.3, top: cy + ch * 0.05, width: cw * 0.6, height: ch * 0.35, borderRadius: '50%', background: `radial-gradient(ellipse, rgba(255,255,230,${hot}), rgba(255,200,90,0) 70%)`}} />
    </div>
  );
};
const Ground: React.FC<{y: number; col?: string}> = ({y, col = '#1a0e0a'}) => (
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
    <path d={`M0,${y} ${Array.from({length: 33}, (_, i) => `L${i * 40},${y - 10 - rnd(i) * 40 * (i % 3 === 0 ? 2.2 : 1)}`).join(' ')} L${W},${y} L${W},${H} L0,${H} Z`} fill={col} />
  </svg>
);
const Txt: React.FC<{t: string; col: string; x: number; y: number; size: number; align?: any; rot?: number}> = ({t, col, x, y, size, align = 'center', rot = 0}) =>
  <Title lines={[[t, col]]} x={x} y={y} size={size} align={align} rot={rot} w={1400} />;

// ---------- 1: 24 HOURS — hongo gigante, EE. UU. aterrado ----------
const T1 = () => (<AbsoluteFill style={{background: 'linear-gradient(180deg, #2a0606 0%, #7a1a08 55%, #ff7a1a 100%)'}}>
  <Rays x={860} y={300} c="rgba(255,190,90,0.5)" a={0.35} n={22} r={900} />
  <Mushroom x={860} y={650} h={600} />
  <Ground y={650} />
  <Embers n={70} seed={4} />
  <CBall k={K('US')} size={330} x={250} y={520} eyes="scared" sweat rim="#ff8a2a" />
  <Txt t="24 HOURS" col="#ffd23f" x={1250} y={545} size={140} align="right" />
  <Vig a={0.5} />
</AbsoluteFill>);
// ---------- 2: LAST DAY — planeta mitad sano, mitad ardiendo ----------
const T2 = () => (<AbsoluteFill style={{background: 'radial-gradient(ellipse at 60% 50%, #2a0c06, #05060c 70%)'}}>
  <Stars />
  <Glow x={720} y={380} r={480} c="rgba(255,90,20,0.55)" />
  <Earth x={640} y={390} size={560} lon={15} lat={25} split burn={1} />
  {[[790, 250, 110], [860, 420, 90], [740, 520, 70]].map(([x, y, h], i) => <div key={i} style={{position: 'absolute', left: 0, top: 0, transform: `rotate(${-15 + i * 20}deg)`, transformOrigin: `${x}px ${y}px`}}><Mushroom x={x} y={y} h={h} /></div>)}
  <Embers n={50} seed={9} />
  <Txt t="LAST DAY" col="#ff7a1f" x={640} y={560} size={140} />
  <Vig a={0.55} />
</AbsoluteFill>);
// ---------- 3: TOO LATE — puerta del búnker y el hongo detrás ----------
const T3 = () => (<AbsoluteFill style={{background: 'linear-gradient(180deg, #ffb060 0%, #ff6a1a 40%, #5a1a0a 75%, #1a0a06 100%)'}}>
  <Mushroom x={330} y={680} h={500} />
  <Ground y={610} col="#140a07" />
  {/* búnker */}
  <div style={{position: 'absolute', left: 800, top: 140, width: 560, height: 620, background: 'linear-gradient(90deg, #2a2c30, #4a4e54)', border: `10px solid ${INK}`, borderRadius: '40px 0 0 0'}} />
  <div style={{position: 'absolute', left: 860, top: 220, width: 380, height: 380, borderRadius: '50%', background: '#0a0a0c', border: `12px solid ${INK}`}} />
  <div style={{position: 'absolute', left: 990, top: 210, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #a8acb2, #5a5e64 60%, #2e3034)', border: `12px solid ${INK}`, boxShadow: '-20px 10px 40px rgba(0,0,0,0.7)'}}>
    {Array.from({length: 10}, (_, i) => { const a = (i / 10) * Math.PI * 2; return <div key={i} style={{position: 'absolute', left: 200 + Math.cos(a) * 160 - 14, top: 200 + Math.sin(a) * 160 - 14, width: 28, height: 28, borderRadius: '50%', background: '#2a2c30', border: `5px solid ${INK}`}} />; })}
    <div style={{position: 'absolute', left: 150, top: 150, width: 100, height: 100, borderRadius: '50%', border: `14px solid ${INK}`, background: '#7a7e84'}} />
  </div>
  <div style={{position: 'absolute', left: 870, top: 110, padding: '6px 18px', background: '#ffc531', border: `6px solid ${INK}`, ...font, fontSize: 38, color: INK, transform: 'rotate(-3deg)'}}>☢ SHELTER</div>
  <CBall k={K('FR')} size={210} x={700} y={560} eyes="scared" tears rim="#ff8a2a" />
  <CBall k={K('DE')} size={180} x={540} y={600} eyes="scared" sweat rim="#ff8a2a" />
  <CBall k={K('IT')} size={150} x={400} y={630} eyes="scared" rim="#ff8a2a" />
  <Txt t="TOO LATE" col="#ff3b30" x={40} y={30} size={140} align="left" rot={-3} />
  <Vig a={0.45} />
</AbsoluteFill>);
// ---------- 4: 24H — el botón rojo entre EE. UU. y Rusia+China ----------
const T4 = () => (<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 60%, #5a0a06, #120304 75%)'}}>
  <Rays x={640} y={470} c="rgba(255,60,40,0.55)" a={0.45} n={20} r={800} />
  <Glow x={640} y={500} r={330} c="rgba(255,40,20,0.8)" />
  {/* botón */}
  <div style={{position: 'absolute', left: 640 - 190, top: 520, width: 380, height: 110, borderRadius: '50%', background: 'linear-gradient(180deg, #3a3c40, #16171a)', border: `8px solid ${INK}`}} />
  <div style={{position: 'absolute', left: 640 - 140, top: 450, width: 280, height: 140, borderRadius: '50%', background: 'radial-gradient(ellipse at 40% 30%, #ff8a7a, #e01a10 45%, #8a0a06 90%)', border: `8px solid ${INK}`, boxShadow: '0 0 60px 20px rgba(255,40,20,0.6)'}} />
  <div style={{position: 'absolute', left: 640 - 60, top: 470, width: 120, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.45)', filter: 'blur(4px)'}} />
  <div style={{position: 'absolute', left: 640 - 70, top: 618, ...font, fontSize: 46, color: '#ffd23f', textShadow: '0 4px 0 #000'}}>☢ ☢ ☢</div>
  <CBall k={K('US')} size={300} x={220} y={470} eyes="angry" rim="#3a8bff" helmet />
  <CBall k={K('RU')} size={260} x={1000} y={430} eyes="angry" rim="#ff3b1a" helmet />
  <CBall k={K('CN')} size={240} x={1150} y={560} eyes="angry" rim="#ff3b1a" />
  <Txt t="24:00:00" col="#ff3b30" x={640} y={40} size={170} />
  <Vig a={0.55} />
</AbsoluteFill>);
// ---------- 5: THE LAST ONES — Australia sale al mundo en ruinas ----------
const T5 = () => (<AbsoluteFill style={{background: 'linear-gradient(180deg, #4a4e5a 0%, #9a8a7a 55%, #d8a060 100%)'}}>
  <Glow x={1010} y={190} r={330} c="rgba(255,240,180,0.9)" />
  <Rays x={1010} y={190} c="rgba(255,240,190,0.7)" a={0.5} n={16} r={900} />
  <div style={{position: 'absolute', left: 940, top: 120, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, #fffbe8, #ffe08a 70%)'}} />
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
    {Array.from({length: 14}, (_, i) => { const x = i * 95 - 20, h = 90 + rnd(i) * 230; return <path key={i} d={`M${x},500 L${x},${500 - h} L${x + 25},${500 - h - rnd(i + 2) * 35} L${x + 55},${500 - h + 18} L${x + 80},${500 - h - 8} L${x + 80},500 Z`} fill="#3a3a40" opacity={0.85} />; })}
    <rect x={0} y={500} width={W} height={220} fill="#5a4a40" />
    {Array.from({length: 26}, (_, i) => <ellipse key={i} cx={rnd(i + 3) * W} cy={540 + rnd(i + 8) * 170} rx={30 + rnd(i) * 50} ry={10 + rnd(i) * 8} fill="#6ab04a" opacity={0.8} />)}
  </svg>
  <div style={{position: 'absolute', left: 260, top: 560, width: 380, height: 110, borderRadius: '50%', background: '#1a1a1e', border: `10px solid ${INK}`, boxShadow: 'inset 0 0 40px rgba(255,240,200,0.4)'}} />
  <CBall k={K('AU')} size={330} x={450} y={450} eyes="normal" look={0.6} rim="#ffe08a" />
  <Txt t="THE LAST ONES" col="#ffd23f" x={40} y={34} size={110} align="left" />
  <Vig a={0.4} />
</AbsoluteFill>);

const T: Record<string, React.FC> = {t1: T1, t2: T2, t3: T3, t4: T4, t5: T5};
export const BURN_THUMBS = Object.keys(T);
export const ThumbBurn: React.FC<{id: string}> = ({id}) => { const C_ = T[id]; return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><C_ /></AbsoluteFill>; };
