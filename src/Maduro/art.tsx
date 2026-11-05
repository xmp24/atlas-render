// Arte detallado de la V3: barcos vistos desde arriba, buque de asalto, villa, coche, torre con foco, salas
import React from 'react';
import {INK, font} from '../lib3';
import {rnd} from './lib';

// bandera de EE. UU. mini
const USFlag: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => (
  <g transform={`translate(${x},${y})`}>
    <rect width={w} height={w * 0.55} fill="#fff" stroke={INK} strokeWidth={w * 0.06} />
    {[0, 2, 4, 6].map((i) => <rect key={i} y={(i * w * 0.55) / 7} width={w} height={(w * 0.55) / 7} fill="#c3100a" />)}
    <rect width={w * 0.42} height={w * 0.3} fill="#1f3a8a" />
  </g>
);
// ---------- destructor (vista cenital, proa a la derecha) ----------
export const ShipTop: React.FC<{x: number; y: number; len: number; ang?: number; wake?: number; label?: string}> = ({x, y, len, ang = 0, wake = 1, label}) => {
  const s = len / 200;
  return (
    <g transform={`translate(${x},${y}) rotate(${ang}) scale(${s})`}>
      {wake > 0 && <path d="M-100,0 L-260,-34 L-250,0 L-260,34 Z" fill="rgba(255,255,255,0.35)" opacity={wake} />}
      <path d="M-100,-18 L60,-18 Q100,-16 110,0 Q100,16 60,18 L-100,18 Q-108,0 -100,-18 Z" fill="#7d8894" stroke={INK} strokeWidth={4} />
      <path d="M-92,-12 L58,-12 Q90,-10 98,0 Q90,10 58,12 L-92,12 Z" fill="#9aa5b1" />
      {/* helipuerto de popa */}
      <rect x={-96} y={-11} width={30} height={22} fill="#5c6670" stroke={INK} strokeWidth={2} /><text x={-81} y={6} textAnchor="middle" fontSize={16} fill="#fff" style={{...font}}>H</text>
      {/* superestructura */}
      <rect x={-50} y={-10} width={46} height={20} rx={3} fill="#d9dee4" stroke={INK} strokeWidth={3} />
      <rect x={-10} y={-8} width={26} height={16} rx={3} fill="#c4cbd3" stroke={INK} strokeWidth={3} />
      <circle cx={-26} cy={0} r={5} fill="#3a4450" stroke={INK} strokeWidth={2} />
      {/* celdas de misiles */}
      {Array.from({length: 8}, (_, i) => <rect key={i} x={24 + (i % 4) * 6} y={-7 + Math.floor(i / 4) * 7} width={5} height={6} fill="#5a646e" />)}
      {/* torreta de proa */}
      <circle cx={68} cy={0} r={8} fill="#c4cbd3" stroke={INK} strokeWidth={3} /><rect x={72} y={-2} width={24} height={4} fill={INK} />
      <USFlag x={-46} y={-30} w={22} />
      {label && <text transform={`scale(${1 / s}) rotate(${-ang}) scale(${s})`} x={0} y={-44} textAnchor="middle" fontSize={22} fill="#fff" stroke={INK} strokeWidth={5} paintOrder="stroke" style={{...font}}>{label}</text>}
    </g>
  );
};
// ---------- buque de asalto anfibio USS Iwo Jima (vista cenital, proa a la derecha) ----------
export const LHD_SPOTS: [number, number][] = [[-130, 4], [-70, 4], [-10, 4], [50, 4], [110, 4]];
export const Amphib: React.FC<{x: number; y: number; len: number; ang?: number; wake?: number; label?: string; children?: React.ReactNode}> = ({x, y, len, ang = 0, wake = 1, label, children}) => {
  const s = len / 400;
  return (
    <g transform={`translate(${x},${y}) rotate(${ang}) scale(${s})`}>
      {wake > 0 && <path d="M-200,0 L-420,-60 L-400,0 L-420,60 Z" fill="rgba(255,255,255,0.35)" opacity={wake} />}
      <path d="M-200,-36 L150,-36 Q195,-34 210,0 Q195,34 150,36 L-200,36 Z" fill="#6c7782" stroke={INK} strokeWidth={5} />
      <path d="M-194,-30 L150,-30 Q186,-28 198,0 Q186,28 150,30 L-194,30 Z" fill="#4a535d" />
      {/* línea central y puntos de aterrizaje */}
      <line x1={-190} y1={4} x2={190} y2={4} stroke="#ffd23f" strokeWidth={2.5} strokeDasharray="14 10" />
      {LHD_SPOTS.map(([px, py], i) => <g key={i}><circle cx={px} cy={py} r={14} fill="none" stroke="#fff" strokeWidth={2.5} /><text x={px} y={py + 5} textAnchor="middle" fontSize={14} fill="#fff" style={{...font}}>{i + 1}</text></g>)}
      {/* isla (superestructura a estribor) */}
      <rect x={-20} y={-56} width={90} height={26} rx={4} fill="#d9dee4" stroke={INK} strokeWidth={4} />
      <rect x={0} y={-66} width={36} height={14} rx={3} fill="#c4cbd3" stroke={INK} strokeWidth={3} />
      <circle cx={52} cy={-44} r={6} fill="#3a4450" stroke={INK} strokeWidth={2} />
      <USFlag x={14} y={-92} w={26} />
      <text x={-150} y={28} fontSize={20} fill="rgba(255,255,255,0.8)" style={{...font}}>7</text>
      {children}
      {label && <text transform={`scale(${1 / s}) rotate(${-ang}) scale(${s})`} x={0} y={-104} textAnchor="middle" fontSize={26} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke" style={{...font}}>{label}</text>}
    </g>
  );
};
// helicóptero cenital pequeño (en coordenadas locales), morro hacia arriba
export const HeliMini: React.FC<{x: number; y: number; s: number; rot?: number; t: number; col?: string; tail?: string}> = ({x, y, s, rot = 0, t, col = '#3a4630', tail}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s / 100})`}>
    <ellipse cx={6} cy={10} rx={30} ry={46} fill="rgba(0,0,0,0.3)" />
    <rect x={-4} y={10} width={8} height={46} fill={col} stroke={INK} strokeWidth={3} />
    <rect x={-14} y={50} width={28} height={6} fill={col} stroke={INK} strokeWidth={2} />
    <ellipse cx={0} cy={0} rx={16} ry={28} fill={col} stroke={INK} strokeWidth={3} />
    <ellipse cx={0} cy={-16} rx={10} ry={8} fill="#9fd4ff" stroke={INK} strokeWidth={2} />
    {tail && <rect x={-9} y={18} width={18} height={12} fill={tail} stroke={INK} strokeWidth={2} />}
    <circle cx={0} cy={0} r={46} fill="rgba(220,225,230,0.2)" />
    {[0, 1, 2, 3].map((i) => <line key={i} x1={0} y1={0} x2={46 * Math.cos(t * 28 + (i * Math.PI) / 2)} y2={46 * Math.sin(t * 28 + (i * Math.PI) / 2)} stroke="rgba(25,25,25,0.6)" strokeWidth={5} />)}
  </g>
);

// ---------- villa de Maduro (vista frontal 3/4; 800×520) ----------
export const VILLA_DOOR: [number, number] = [400, 372];
export const Villa: React.FC<{t: number; lit?: number; alarm?: boolean; flash?: number}> = ({t, lit = 1, alarm, flash = 0}) => (
  <svg viewBox="0 0 800 520" width="100%" height="100%" style={{overflow: 'visible'}}>
    <defs>
      <linearGradient id="vroof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d9643a" /><stop offset="1" stopColor="#8f3518" /></linearGradient>
      <linearGradient id="vwall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fbf3df" /><stop offset="1" stopColor="#ddcba4" /></linearGradient>
      <radialGradient id="vwin"><stop offset="0" stopColor="#fff6c0" /><stop offset="1" stopColor="#ffb84a" /></radialGradient>
    </defs>
    {/* césped y caminos */}
    <path d="M40,300 L760,300 L800,520 L0,520 Z" fill="#3f7a35" stroke={INK} strokeWidth={5} />
    <path d="M370,520 L380,380 L420,380 L430,520 Z" fill="#d9c9a0" />
    {Array.from({length: 26}, (_, i) => <circle key={i} cx={60 + rnd(i) * 680} cy={420 + rnd(i + 5) * 90} r={6} fill="#4f8f43" />)}
    {/* muro trasero */}
    <rect x={40} y={240} width={720} height={60} fill="#cfc3a6" stroke={INK} strokeWidth={5} />
    {/* piscina */}
    <path d="M560,400 L720,400 L740,460 L580,460 Z" fill="#4fd0ff" stroke={INK} strokeWidth={5} />
    <path d="M590,420 Q620,410 650,422 T710,420" fill="none" stroke="#c8f4ff" strokeWidth={4} />
    {/* casa: planta baja + primera */}
    <rect x={190} y={170} width={420} height={210} fill="url(#vwall)" stroke={INK} strokeWidth={6} />
    <rect x={270} y={100} width={260} height={80} fill="url(#vwall)" stroke={INK} strokeWidth={6} />
    {/* tejados de teja */}
    <path d="M170,176 L630,176 L600,130 L200,130 Z" fill="url(#vroof)" stroke={INK} strokeWidth={6} />
    <path d="M250,106 L550,106 L515,58 L285,58 Z" fill="url(#vroof)" stroke={INK} strokeWidth={6} />
    {Array.from({length: 14}, (_, i) => <line key={i} x1={210 + i * 30} y1={174} x2={220 + i * 28} y2={134} stroke="rgba(0,0,0,0.25)" strokeWidth={3} />)}
    {/* columnas y balcón */}
    {[250, 330, 470, 550].map((x, i) => <rect key={i} x={x} y={250} width={16} height={130} fill="#fff" stroke={INK} strokeWidth={3} />)}
    <rect x={200} y={240} width={400} height={14} fill="#efe4c8" stroke={INK} strokeWidth={4} />
    {/* ventanas */}
    {[[220, 190], [300, 190], [460, 190], [540, 190], [300, 118], [370, 118], [440, 118]].map(([x, y], i) => <rect key={i} x={x} y={y} width={44} height={40} rx={4} fill={rnd(i + 3) < 0.75 * lit ? 'url(#vwin)' : '#2a3550'} stroke={INK} strokeWidth={4} />)}
    {[[220, 290], [540, 290]].map(([x, y], i) => <rect key={'b' + i} x={x} y={y} width={44} height={60} rx={4} fill={lit > 0.5 ? 'url(#vwin)' : '#2a3550'} stroke={INK} strokeWidth={4} />)}
    {/* puerta principal */}
    <rect x={372} y={290} width={56} height={90} rx={6} fill={flash > 0 ? `rgba(255,220,120,${0.4 + flash * 0.6})` : '#6a4424'} stroke={INK} strokeWidth={5} />
    <circle cx={418} cy={338} r={4} fill="#ffd23f" />
    {/* bandera */}
    <line x1={400} y1={58} x2={400} y2={0} stroke={INK} strokeWidth={5} />
    <g transform={`translate(400,2) skewY(${Math.sin(t * 3) * 6})`}><rect width={60} height={14} fill="#ffd21a" stroke={INK} strokeWidth={2} /><rect y={14} width={60} height={14} fill="#1f4fbf" stroke={INK} strokeWidth={2} /><rect y={28} width={60} height={14} fill="#d61f26" stroke={INK} strokeWidth={2} /></g>
    {/* palmeras */}
    {[[120, 330, 1], [690, 320, -1], [150, 470, 1]].map(([x, y, d], i) => <g key={i} transform={`translate(${x},${y})`}>
      <path d={`M0,0 Q${d * 10},-60 ${d * 4},-120`} fill="none" stroke="#6a4a2a" strokeWidth={12} strokeLinecap="round" />
      {[0, 1, 2, 3, 4].map((j) => <path key={j} d={`M${d * 4},-120 q${Math.cos(j * 1.25 + Math.sin(t * 2) * 0.05) * 70},${-20 + Math.sin(j * 1.25) * 40} ${Math.cos(j * 1.25) * 110},${30 + Math.sin(j * 1.25) * 40}`} fill="none" stroke="#2f7a2a" strokeWidth={16} strokeLinecap="round" />)}
    </g>)}
    {/* muro delantero bajo, puerta de entrada y torres de guardia */}
    <rect x={20} y={480} width={330} height={40} fill="#cfc3a6" stroke={INK} strokeWidth={5} />
    <rect x={450} y={480} width={330} height={40} fill="#cfc3a6" stroke={INK} strokeWidth={5} />
    {[[30, 220], [730, 220]].map(([x, y], i) => <g key={'tw' + i}>
      <rect x={x} y={y} width={46} height={100} fill="#bdb196" stroke={INK} strokeWidth={5} />
      <rect x={x - 8} y={y - 30} width={62} height={34} fill="#8a8070" stroke={INK} strokeWidth={5} />
      <rect x={x} y={y - 22} width={46} height={16} fill={alarm && Math.floor(t * 4 + i) % 2 ? '#ff3b30' : '#2a2a2a'} />
    </g>)}
  </svg>
);
// ---------- coche (vista lateral, mira a la derecha) ----------
export const Car: React.FC<{x: number; y: number; w: number; t: number; col?: string; moving?: boolean}> = ({x, y, w, t, col = '#2a3a4a', moving = true}) => {
  const s = w / 300; const spin = moving ? t * 600 : 0; const bump = moving ? Math.sin(t * 22) * 2 : 0;
  return (
    <svg width={w} height={w * 0.45} viewBox="0 0 300 135" style={{position: 'absolute', left: x - w / 2, top: y - w * 0.36 + bump * s, overflow: 'visible'}}>
      <ellipse cx={150} cy={128} rx={140} ry={8} fill="rgba(0,0,0,0.35)" />
      <path d="M20,90 L30,60 L80,56 L110,22 L210,22 L245,56 L285,64 L290,96 L20,100 Z" fill={col} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M120,30 L150,30 L150,56 L92,56 Z" fill="#9fd4ff" stroke={INK} strokeWidth={4} />
      <path d="M160,30 L205,30 L232,56 L160,56 Z" fill="#9fd4ff" stroke={INK} strokeWidth={4} />
      <rect x={270} y={66} width={18} height={10} fill="#fff6c0" stroke={INK} strokeWidth={3} />
      <rect x={18} y={70} width={12} height={10} fill="#ff3b30" stroke={INK} strokeWidth={3} />
      {[75, 235].map((cx, i) => <g key={i} transform={`translate(${cx},100) rotate(${spin})`}><circle r={26} fill="#1d1d1d" stroke={INK} strokeWidth={4} /><circle r={11} fill="#9aa0aa" /><line x1={-11} y1={0} x2={11} y2={0} stroke={INK} strokeWidth={3} /></g>)}
    </svg>
  );
};
// ---------- torre de vigilancia con foco ----------
export const Tower: React.FC<{x: number; y: number; t: number; ang: number; alert?: boolean}> = ({x, y, t, ang, alert}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 1, height: 1}}>
    <div style={{position: 'absolute', left: 0, top: 50, width: 1400, height: 260, transformOrigin: '0 0', transform: `rotate(${ang}deg) translateY(-130px)`, background: `linear-gradient(90deg, ${alert ? 'rgba(255,90,70,0.55)' : 'rgba(255,250,210,0.45)'} 0%, rgba(255,250,210,0) 85%)`, clipPath: 'polygon(0 45%, 100% 0, 100% 100%, 0 55%)'}} />
    <div style={{position: 'absolute', left: -50, top: 40, width: 100, height: 380, background: 'linear-gradient(90deg, #4a4438, #6a6252)', border: `6px solid ${INK}`}} />
    <div style={{position: 'absolute', left: -70, top: -10, width: 140, height: 60, background: '#5a5244', border: `6px solid ${INK}`}} />
    <div style={{position: 'absolute', left: -80, top: -40, width: 160, height: 34, background: '#3a3428', border: `6px solid ${INK}`, clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0 100%)'}} />
    <div style={{position: 'absolute', left: -14, top: 26, width: 28, height: 28, borderRadius: '50%', background: alert ? '#ff3b30' : '#fff6c0', boxShadow: `0 0 30px ${alert ? '#ff3b30' : '#fff6c0'}`}} />
  </div>
);
