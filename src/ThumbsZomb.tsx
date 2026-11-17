// Miniaturas "WHAT IF A ZOMBIE OUTBREAK HIT?" (1280x720)
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COUNTRIES, FlagCanvas} from './HexWorld';
import {Embers, Glow} from './ThumbsPro';
import {CBall} from './ThumbsCB';
import {WarHelmet, Title3D, WHITE, REDG, Smoke, Vign} from './ThumbsFinal';
import {WorldBg} from './ThumbsMap';
import {Bolt} from './ThumbsRich';
import {INK, font} from './lib3';

const W = 1280, H = 720;
const K = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const ZGREEN = 'linear-gradient(180deg,#f4ffd8 0%,#b6ff5a 38%,#5ed42a 70%,#1f7a10 100%)';
const CUREG = 'linear-gradient(180deg,#f0fbff 0%,#9fe8ff 40%,#2fa8ff 75%,#1258b8 100%)';

// mundo infectado: todos los países en verde zombi salvo los indicados
const ALLK = COUNTRIES.map((_, i) => i);
const zombieWorld = (keep: string[] = [], col = '#4f9a22') => { const o: Record<number, string> = {}; for (const k of ALLK) if (!keep.includes(COUNTRIES[k].c)) o[k] = rnd(k) > 0.5 ? col : '#3d7d18'; return o; };
const mutantWorld = (keep: string[] = []) => { const o: Record<number, string> = {}; for (const k of ALLK) if (!keep.includes(COUNTRIES[k].c)) o[k] = rnd(k) > 0.5 ? '#7a1e12' : '#5a140c'; return o; };

// bola zombi: bandera teñida de verde, ojos rojos desparejados, boca con dientes, babas y grietas
const ZBall: React.FC<{c: string; x: number; y: number; s: number; rot?: number; mut?: boolean; flip?: boolean}> = ({c, x, y, s, rot = 0, mut, flip}) => {
  const k = K(c); const tint = mut ? 'rgba(140,20,10,0.55)' : 'rgba(80,190,40,0.58)';
  return (
    <div style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, transform: `rotate(${rot}deg) scaleX(${flip ? -1 : 1})`}}>
      <div style={{position: 'absolute', inset: -s * 0.06, borderRadius: '50%', background: `radial-gradient(circle, ${mut ? 'rgba(255,40,20,0.55)' : 'rgba(150,255,80,0.55)'} 40%, rgba(0,0,0,0) 72%)`, filter: 'blur(6px)'}} />
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', border: `${s * 0.035}px solid ${INK}`, boxShadow: `0 ${s * 0.04}px 0 ${INK}`}}>
        <FlagCanvas k={k} w={s} h={s} />
        <div style={{position: 'absolute', inset: 0, background: tint, mixBlendMode: 'multiply'}} />
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 35% 28%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 35%), radial-gradient(circle at 60% 75%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.45) 100%)'}} />
      </div>
      <svg width={s} height={s} viewBox="0 0 100 100" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {/* grietas */}
        <path d="M18,30 L28,36 L24,44 L32,50" stroke={INK} strokeWidth={1.6} fill="none" opacity={0.7} />
        <path d="M78,62 L70,66 L74,74" stroke={INK} strokeWidth={1.6} fill="none" opacity={0.7} />
        {/* ojos */}
        <ellipse cx={34} cy={42} rx={13} ry={14} fill="#fffbe8" stroke={INK} strokeWidth={2.6} />
        <circle cx={36} cy={44} r={5.2} fill={mut ? '#ff1a00' : '#e81a1a'} />
        <circle cx={36} cy={44} r={2} fill={INK} />
        <ellipse cx={66} cy={40} rx={9} ry={10} fill="#fffbe8" stroke={INK} strokeWidth={2.6} />
        <circle cx={64} cy={42} r={3.6} fill={mut ? '#ff1a00' : '#e81a1a'} />
        <path d="M22,26 L46,32" stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <path d="M56,30 L76,25" stroke={INK} strokeWidth={4} strokeLinecap="round" />
        {/* boca con dientes */}
        <path d="M28,66 Q50,58 74,64 Q70,84 50,84 Q30,84 28,66 Z" fill="#3a0a0a" stroke={INK} strokeWidth={2.6} />
        {[32, 40, 48, 56, 64].map((tx, i) => <path key={i} d={`M${tx},${64 - (i % 2)} l4,0 l-2,${6 + (i % 2) * 2} Z`} fill="#fffbe8" stroke={INK} strokeWidth={1} />)}
        {[36, 46, 58].map((tx, i) => <path key={'b' + i} d={`M${tx},83 l4,0 l-2,-5 Z`} fill="#fffbe8" stroke={INK} strokeWidth={1} />)}
        {/* babas */}
        <path d="M60,82 Q61,92 59,97 Q57,92 58,82 Z" fill={mut ? '#ff8a6a' : '#b8ff7a'} stroke={INK} strokeWidth={1} opacity={0.9} />
      </svg>
    </div>
  );
};
// jeringuilla brillante
const Syringe: React.FC<{x: number; y: number; s: number; rot?: number}> = ({x, y, s, rot = -30}) => (
  <div style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, transform: `rotate(${rot}deg)`}}>
    <div style={{position: 'absolute', inset: -s * 0.2, borderRadius: '50%', background: 'radial-gradient(circle, rgba(120,220,255,0.75) 0%, rgba(120,220,255,0) 65%)', filter: 'blur(8px)'}} />
    <svg width={s} height={s} viewBox="0 0 100 100" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <rect x={44} y={6} width={12} height={8} rx={2} fill="#dfe8f0" stroke={INK} strokeWidth={2.5} />
      <rect x={48} y={14} width={4} height={12} fill="#b8c4d0" stroke={INK} strokeWidth={2} />
      <rect x={36} y={24} width={28} height={6} rx={2} fill="#dfe8f0" stroke={INK} strokeWidth={2.5} />
      <rect x={40} y={30} width={20} height={46} rx={3} fill="#e8f8ff" stroke={INK} strokeWidth={3} />
      <rect x={42.5} y={46} width={15} height={28} rx={2} fill="#2fd0ff" />
      <rect x={44} y={48} width={3} height={22} rx={1.5} fill="#ffffff" opacity={0.8} />
      {[36, 42, 52, 62].map((yy, i) => <line key={i} x1={40} y1={yy} x2={46} y2={yy} stroke={INK} strokeWidth={1.5} />)}
      <rect x={46} y={76} width={8} height={6} fill="#b8c4d0" stroke={INK} strokeWidth={2} />
      <path d="M49,82 L51,82 L50.4,98 L49.6,98 Z" fill="#e8eef4" stroke={INK} strokeWidth={1.2} />
    </svg>
  </div>
);
const Hand: React.FC<{x: number; y: number; s: number; rot?: number; mut?: boolean}> = ({x, y, s, rot = 0, mut}) => (
  <svg width={s} height={s * 1.6} viewBox="0 0 60 96" style={{position: 'absolute', left: x - s / 2, top: y, transform: `rotate(${rot}deg)`, overflow: 'visible'}}>
    <path d="M22,96 L22,52 Q14,48 12,38 L10,18 Q10,13 14,14 L18,34 L18,10 Q19,5 23,6 L25,32 L27,4 Q28,0 32,1 L32,32 L36,8 Q37,3 41,5 L39,36 Q44,30 49,30 Q53,32 50,37 L42,52 L42,96 Z" fill={mut ? '#9a3a2a' : '#7fbf4a'} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M24,70 L30,74 M34,62 L38,66" stroke={INK} strokeWidth={2} opacity={0.6} />
  </svg>
);
const Pill: React.FC<{x: number; y: number; text: string; bg: string; size?: number; rot?: number}> = ({x, y, text, bg, size = 40, rot = -3}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,0) rotate(${rot}deg)`, background: bg, border: `5px solid ${INK}`, borderRadius: 14, padding: `${size * 0.12}px ${size * 0.45}px ${size * 0.04}px`, boxShadow: `0 6px 0 ${INK}`, ...font, fontSize: size, color: '#fff', whiteSpace: 'nowrap', textShadow: `2px 3px 0 ${INK}`}}>{text}</div>
);
const greenFog = (a = 0.35) => <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 100%, rgba(120,255,60,${a}) 0%, rgba(0,0,0,0) 60%)`}} />;

const T: Record<string, React.ReactNode> = {
  // 1 · LAS 2 ÚLTIMAS: India e Indonesia espalda con espalda, rodeadas de zombis
  a: (<>
    <AbsoluteFill style={{background: '#0a1a10'}} />
    <WorldBg cam={{cx: 4900, cy: 2300, s: 0.36}} colOver={zombieWorld(['IN', 'ID'])} mood="scared" blur={1.5} />
    <AbsoluteFill style={{background: 'rgba(10,30,8,0.35)'}} />
    {greenFog(0.4)}
    {([['US', 110, 600, 190, -8], ['CN', 1170, 600, 200, 8], ['BR', 110, 250, 150, -6], ['RU', 1170, 240, 160, 6], ['GB', 330, 690, 130, -4], ['JP', 950, 700, 130, 4]] as const).map(([c, x, y, s, r]) => <ZBall key={c} c={c} x={x} y={y} s={s} rot={r} flip={x > 640} />)}
    <Hand x={250} y={430} s={90} rot={25} /><Hand x={1030} y={430} s={90} rot={-25} />
    <Glow x={640} y={430} r={330} c="rgba(120,210,255,0.55)" />
    <CBall k={K('IN')} size={270} x={500} y={440} eyes="angry" look={0.5} rim="rgba(140,220,255,0.8)" helmet />
    <CBall k={K('ID')} size={270} x={780} y={440} eyes="scared" look={-0.5} sweat rim="rgba(140,220,255,0.8)" helmet />
    <Syringe x={640} y={300} s={190} rot={0} />
    <Title3D text="ONLY 2 LEFT" y={18} size={118} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Vign />
  </>),
  // 2 · PACIENTE CERO: bola zombi de EE. UU. gigante + mapa con Atlanta marcada
  b: (<>
    <AbsoluteFill style={{background: '#06120a'}} />
    <WorldBg cam={{cx: 1900, cy: 1600, s: 0.42}} colOver={{[K('US')]: '#4f9a22'}} mood="scared" blur={1.2} />
    <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(6,18,10,0.85) 0%, rgba(6,18,10,0.35) 45%, rgba(6,18,10,0) 70%)'}} />
    {greenFog(0.35)}
    <Glow x={330} y={420} r={360} c="rgba(140,255,80,0.5)" />
    <ZBall c="US" x={330} y={430} s={430} rot={-6} />
    <Hand x={600} y={420} s={110} rot={30} />
    {/* marcador de Atlanta */}
    <div style={{position: 'absolute', left: 746 - 70, top: 377 - 70, width: 140, height: 140, borderRadius: '50%', border: `8px solid #ff2a2a`, boxShadow: '0 0 30px #ff2a2a, inset 0 0 20px #ff2a2a'}} />
    <div style={{position: 'absolute', left: 746 - 14, top: 377 - 14, width: 28, height: 28, borderRadius: '50%', background: '#ff2a2a', border: `5px solid ${INK}`}} />
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}><path d="M916,177 Q846,247 801,312" stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" /><path d="M916,177 Q846,247 801,312" stroke="#ff2a2a" strokeWidth={12} fill="none" strokeLinecap="round" /><path d="M776,292 L796,327 L831,307" stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d="M776,292 L796,327 L831,307" stroke="#ff2a2a" strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
    <Pill x={946} y={107} text="DAY 1" bg="#e8352b" size={46} rot={4} />
    <Title3D text="PATIENT ZERO" x={640} y={590} size={112} grad={ZGREEN} glow="rgba(150,255,80,0.8)" />
    <Vign />
  </>),
  // 3 · 99 % INFECTADO: mundo zombi + jeringuilla y cifra enorme
  c: (<>
    <AbsoluteFill style={{background: '#08140a'}} />
    <WorldBg cam={{cx: 3840, cy: 2150, s: 0.2}} colOver={mutantWorld(['IN', 'ID'])} mood="scared" blur={1.6} />
    <AbsoluteFill style={{background: 'rgba(30,6,4,0.3)'}} />
    <Embers n={50} seed={4} c="#ff6a3a" />
    <Glow x={640} y={350} r={420} c="rgba(255,60,30,0.35)" />
    <Title3D text="99%" y={90} size={300} grad={REDG} glow="rgba(255,60,30,0.9)" rot={-3} />
    <Title3D text="INFECTED" y={420} size={130} grad={WHITE} glow="rgba(255,255,255,0.5)" rot={-2} />
    <ZBall c="CN" x={150} y={560} s={210} mut rot={-10} />
    <ZBall c="RU" x={1130} y={560} s={210} mut rot={10} flip />
    <Syringe x={1110} y={190} s={210} rot={35} />
    <Vign />
  </>),
  // 4 · ANTES / DESPUÉS: mundo sano azul vs mundo zombi, con rayo divisor
  d: (<>
    <AbsoluteFill style={{background: '#000'}} />
    <AbsoluteFill style={{clipPath: 'polygon(0 0, 690px 0, 590px 720px, 0 720px)'}}>
      <WorldBg cam={{cx: 2600, cy: 1900, s: 0.3}} mood="happy" blur={1.2} />
      <AbsoluteFill style={{background: 'rgba(30,90,200,0.25)'}} />
    </AbsoluteFill>
    <AbsoluteFill style={{clipPath: 'polygon(690px 0, 1280px 0, 1280px 720px, 590px 720px)'}}>
      <WorldBg cam={{cx: 2600, cy: 1900, s: 0.3}} colOver={zombieWorld()} mood="scared" blur={1.2} />
      <AbsoluteFill style={{background: 'rgba(20,60,10,0.35)'}} />
      {greenFog(0.45)}
    </AbsoluteFill>
    <Bolt seed={5} />
    <Glow x={330} y={440} r={280} c="rgba(140,200,255,0.5)" />
    <CBall k={K('US')} size={330} x={320} y={450} eyes="scared" look={0.6} sweat rim="rgba(140,200,255,0.7)" />
    <ZBall c="US" x={960} y={450} s={360} rot={5} flip />
    <Hand x={760} y={470} s={100} rot={-35} />
    <Title3D text="DAY 1" x={320} y={30} size={96} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Title3D text="DAY 100" x={960} y={30} size={96} grad={ZGREEN} glow="rgba(150,255,80,0.8)" />
    <Vign />
  </>),
  // 5 · LA ÚLTIMA ESPERANZA: horda mutante cargando contra India con la cura
  e: (<>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 70% 55%, #3a0c08 0%, #160404 70%)'}} />
    <WorldBg cam={{cx: 5000, cy: 2050, s: 0.3}} colOver={mutantWorld(['IN'])} mood="scared" blur={2} />
    <AbsoluteFill style={{background: 'rgba(40,6,4,0.45)'}} />
    <Smoke list={[[300, 650, 160], [700, 680, 140], [1100, 660, 160]]} />
    <Embers n={45} seed={9} c="#ff7a3a" />
    {Array.from({length: 11}, (_, i) => { const cs = ['CN', 'PK', 'RU', 'BD', 'MM', 'TH', 'SA', 'IR', 'TR', 'JP', 'KR']; const x = 40 + (i % 6) * 120 + (i >= 6 ? 60 : 0); const y = i >= 6 ? 610 : 300 + (i % 3) * 110; return <ZBall key={i} c={cs[i]} x={x} y={y} s={i >= 6 ? 170 : 130 + (i % 3) * 20} mut rot={(rnd(i) - 0.5) * 20} />; })}
    <Hand x={600} y={430} s={110} rot={40} mut /><Hand x={520} y={250} s={90} rot={50} mut />
    <Glow x={1000} y={410} r={330} c="rgba(120,210,255,0.6)" />
    <CBall k={K('IN')} size={360} x={1010} y={420} eyes="angry" look={-0.7} helmet rim="rgba(140,220,255,0.9)" />
    <WarHelmet x={1010} y={420 + 360 * 0.03} size={360 * 0.98} rot={6} />
    <Syringe x={1200} y={250} s={200} rot={-25} />
    <Title3D text="THE LAST HOPE" x={640} y={14} size={104} grad={CUREG} glow="rgba(120,210,255,0.85)" />
    <Vign />
  </>),
};
export const ZOMB_THUMBS = Object.keys(T);
export const ThumbZomb: React.FC<{id: string}> = ({id}) => <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>{T[id]}</AbsoluteFill>;
