// Miniaturas ilustradas (no capturas): fondos de mapa estilizados, countryballs con luz, explosiones, rayos y texto 3D
import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {FlagCanvas, COUNTRIES} from './HexWorld';
import {PolyCanvas, CEv} from './PolyWorld';
import {Face, Mood, INK, font} from './lib3';
import JI from './hw/indo2d.json';
import JC from './hw/cup.json';
import JU from './hw/usa.json';

const K = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- piezas ----------
const MapBg: React.FC<{d: any; t: number; cx: number; cy: number; s: number; blur?: number; tint?: string; empire?: number | null; war?: boolean}> = ({d, t, cx, cy, s, blur = 2.5, tint, empire = null, war = true}) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: -40, top: -30, width: 1920, height: 1080, transform: 'scale(0.71)', transformOrigin: '0 0', filter: `blur(${blur}px) saturate(1.25) contrast(1.1)`}}>
      <PolyCanvas cev={d.cev as CEv[]} t={t} tm={t} byTm={false} cam={{cx, cy, s}} W={1920} H={1080} opts={{squads: false, capitalsOff: true, war: war ? d.war : null, empire, waves: true}} />
    </div>
    {tint && <AbsoluteFill style={{background: tint, mixBlendMode: 'multiply'}} />}
  </AbsoluteFill>
);
export const Glow: React.FC<{x: number; y: number; r: number; c: string; a?: number}> = ({x, y, r, c, a = 1}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(circle, ${c} 0%, transparent 70%)`, opacity: a, mixBlendMode: 'screen'}} />
);
export const Rays: React.FC<{x: number; y: number; c: string; a?: number; n?: number; r?: number}> = ({x, y, c, a = 0.5, n = 18, r = 900}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', opacity: a, mixBlendMode: 'screen',
    background: `repeating-conic-gradient(from 0deg, ${c} 0deg ${180 / n}deg, transparent ${180 / n}deg ${360 / n}deg)`,
    WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 8%, rgba(0,0,0,0) 70%)'}} />
);
export const Boom: React.FC<{x: number; y: number; r: number; seed?: number; a?: number}> = ({x, y, r, seed = 1, a = 1}) => (
  <div style={{position: 'absolute', left: x - r * 1.5, top: y - r * 1.5, width: r * 3, height: r * 3, opacity: a}}>
    {[0, 1, 2, 3, 4, 5, 6].map((i) => { const an = rnd(seed * 9 + i) * 6.28, dd = r * (0.35 + 0.45 * rnd(seed * 7 + i)); const rr = r * (0.55 + 0.4 * rnd(seed * 3 + i));
      return <div key={'s' + i} style={{position: 'absolute', left: r * 1.5 + Math.cos(an) * dd - rr, top: r * 1.5 + Math.sin(an) * dd * 0.8 - rr - r * 0.25, width: rr * 2, height: rr * 2, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #6a5a58 0%, #2a2224 70%)', opacity: 0.85}} />; })}
    <div style={{position: 'absolute', left: r * 0.3, top: r * 0.3, width: r * 2.4, height: r * 2.4, borderRadius: '50%', background: 'radial-gradient(circle, #fffbe0 0%, #ffe066 22%, #ff9a1f 45%, #ff3d1f 65%, rgba(200,30,10,0) 74%)', filter: 'blur(1px)'}} />
    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => { const an = rnd(seed * 5 + i * 3) * 6.28, dd = r * (1.0 + 0.5 * rnd(seed + i)); return <div key={'d' + i} style={{position: 'absolute', left: r * 1.5 + Math.cos(an) * dd, top: r * 1.5 + Math.sin(an) * dd, width: r * 0.09, height: r * 0.09, borderRadius: 3, background: '#ffd36b', boxShadow: '0 0 10px 3px rgba(255,170,40,0.8)'}} />; })}
  </div>
);
export const Embers: React.FC<{n?: number; seed?: number; c?: string}> = ({n = 60, seed = 3, c = '#ffb347'}) => (
  <>{Array.from({length: n}).map((_, i) => { const s = 2 + rnd(seed + i * 5) * 5; return <div key={i} style={{position: 'absolute', left: rnd(seed + i) * 1280, top: rnd(seed * 3 + i * 7) * 720, width: s, height: s, borderRadius: '50%', background: c, boxShadow: `0 0 ${s * 3}px ${s}px ${c}`, opacity: 0.4 + 0.6 * rnd(i + seed * 11)}} />; })}</>
);
export const Icon: React.FC<{name: string; x: number; y: number; w: number; c: string; rot?: number; glow?: string; flip?: boolean; op?: number}> = ({name, x, y, w, c, rot = 0, glow, flip, op = 1}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - w / 2, width: w, height: w, transform: `rotate(${rot}deg) scaleX(${flip ? -1 : 1})`, filter: `drop-shadow(0 0 2px ${INK}) drop-shadow(0 0 2px ${INK}) drop-shadow(0 6px 0 rgba(0,0,0,0.5))${glow ? ` drop-shadow(0 0 18px ${glow})` : ''}`, opacity: op}}>
    <div style={{width: '100%', height: '100%', background: c, WebkitMaskImage: `url(${staticFile('hw/icons/' + name + '.svg')})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center'}} />
  </div>
);
export const Ball: React.FC<{k: number; size: number; mood: Mood; x: number; y: number; rim?: string; look?: [number, number]; helmet?: boolean; crown?: boolean; sweat?: boolean; rot?: number; gray?: boolean}> = ({k, size, mood, x, y, rim = '#ffd36b', look = [0, 0], helmet, crown, sweat, rot = 0, gray}) => (
  <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, transform: `rotate(${rot}deg)`}}>
    <div style={{position: 'absolute', inset: -size * 0.12, borderRadius: '50%', background: `radial-gradient(circle, ${rim} 0%, transparent 68%)`, opacity: 0.55}} />
    <div style={{position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', border: `${size * 0.035}px solid ${INK}`, boxShadow: `0 ${size * 0.06}px 0 rgba(0,0,0,0.55), 0 0 ${size * 0.12}px ${size * 0.02}px ${rim}`, filter: gray ? 'grayscale(1) brightness(0.8)' : undefined}}>
      <FlagCanvas k={k} w={size} h={size} />
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 34% 28%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 32%), radial-gradient(circle at 65% 75%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.5) 85%)'}} />
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: `inset ${-size * 0.05}px ${-size * 0.02}px ${size * 0.06}px ${rim}`}} />
    </div>
    <svg width={size} height={size} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><Face x={size / 2} y={size * 0.47} r={size * 0.29} mood={mood} t={1} seed={k} look={look} /></svg>
    {helmet && <div style={{position: 'absolute', left: size * 0.02, top: -size * 0.17, width: size * 0.96, height: size * 0.4, borderRadius: `${size}px ${size}px ${size * 0.08}px ${size * 0.08}px`, background: 'radial-gradient(circle at 35% 30%, #8a9a5a 0%, #4f5b2c 60%, #343c1c 100%)', border: `${size * 0.03}px solid ${INK}`, boxShadow: '0 6px 0 rgba(0,0,0,0.35)'}} />}
    {crown && <Icon name="crown" x={size / 2} y={-size * 0.12} w={size * 0.55} c="#ffd23f" glow="#ffe48a" />}
    {sweat && <div style={{position: 'absolute', right: size * 0.05, top: size * 0.12, width: size * 0.12, height: size * 0.18, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: 'linear-gradient(#bfe6ff, #4aa8ff)', border: `${size * 0.012}px solid ${INK}`}} />}
  </div>
);
export const Title: React.FC<{lines: [string, string][]; x: number; y: number; size: number; align?: 'left' | 'center' | 'right'; rot?: number; w?: number}> = ({lines, x, y, size, align = 'left', rot = 0, w = 1200}) => (
  <div style={{position: 'absolute', left: align === 'center' ? x - w / 2 : align === 'right' ? x - w : x, top: y, width: w, textAlign: align, transform: `rotate(${rot}deg)`}}>
    {lines.map(([txt, col], i) => (
      <div key={i} style={{position: 'relative', ...font, fontSize: size, lineHeight: 1.0, whiteSpace: 'nowrap'}}>
        <div style={{color: INK, WebkitTextStroke: `${size * 0.16}px ${INK}`, textShadow: `0 ${size * 0.09}px 0 ${INK}, 0 ${size * 0.12}px ${size * 0.15}px rgba(0,0,0,0.6)`}}>{txt}</div>
        <div style={{position: 'absolute', inset: 0, background: col.startsWith('linear') ? col : `linear-gradient(180deg, #ffffff 0%, ${col} 55%, ${col} 100%)`, WebkitBackgroundClip: 'text', color: 'transparent', filter: `drop-shadow(0 0 ${size * 0.12}px ${col.startsWith('linear') ? 'rgba(255,220,120,0.6)' : col + '99'})`}}>{txt}</div>
      </div>
    ))}
  </div>
);
export const Tag: React.FC<{text: string; x: number; y: number; bg: string; size?: number; rot?: number; c?: string}> = ({text, x, y, bg, size = 48, rot = -4, c = '#fff'}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg)`, background: bg, border: `6px solid ${INK}`, borderRadius: 16, padding: `${size * 0.12}px ${size * 0.4}px 0`, ...font, fontSize: size, color: c, boxShadow: '0 8px 0 rgba(0,0,0,0.5), 0 0 30px rgba(0,0,0,0.4)', whiteSpace: 'nowrap'}}>{text}</div>
);
export const Vig: React.FC<{a?: number}> = ({a = 0.75}) => <AbsoluteFill style={{background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,${a}) 100%)`}} />;
const Arrow: React.FC<{x: number; y: number; w: number; rot: number; c?: string}> = ({x, y, w, rot, c = '#ff2b2b'}) => (
  <svg width={w} height={w * 0.5} style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg)`, overflow: 'visible', filter: 'drop-shadow(0 6px 0 rgba(0,0,0,0.5))'}}>
    <path d={`M0,${w * 0.17} L${w * 0.62},${w * 0.17} L${w * 0.62},0 L${w},${w * 0.25} L${w * 0.62},${w * 0.5} L${w * 0.62},${w * 0.33} L0,${w * 0.33} Z`} fill={c} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
  </svg>
);
export const Trophy: React.FC<{x: number; y: number; h: number}> = ({x, y, h}) => (
  <div style={{position: 'absolute', left: x - h * 0.5, top: y - h * 0.5, width: h, height: h}}>
    <Glow x={h / 2} y={h / 2} r={h * 0.9} c="rgba(255,214,90,0.9)" />
    <Rays x={h / 2} y={h * 0.45} c="rgba(255,226,140,0.7)" a={0.55} r={h * 1.4} n={16} />
    <svg viewBox="0 0 200 200" width={h} height={h} style={{position: 'absolute', left: 0, top: 0, filter: 'drop-shadow(0 10px 0 rgba(0,0,0,0.5))'}}>
      <defs>
        <linearGradient id="gold" x1="0" x2="1"><stop offset="0" stopColor="#a8650d" /><stop offset="0.3" stopColor="#ffd75a" /><stop offset="0.5" stopColor="#fff6c2" /><stop offset="0.7" stopColor="#f7b928" /><stop offset="1" stopColor="#8a4f06" /></linearGradient>
      </defs>
      <path d="M50,30 L150,30 L146,80 Q140,120 100,128 Q60,120 54,80 Z" fill="url(#gold)" stroke={INK} strokeWidth="6" />
      <path d="M52,40 Q18,42 24,70 Q30,92 58,96" fill="none" stroke={INK} strokeWidth="14" /><path d="M52,40 Q18,42 24,70 Q30,92 58,96" fill="none" stroke="#f7b928" strokeWidth="7" />
      <path d="M148,40 Q182,42 176,70 Q170,92 142,96" fill="none" stroke={INK} strokeWidth="14" /><path d="M148,40 Q182,42 176,70 Q170,92 142,96" fill="none" stroke="#f7b928" strokeWidth="7" />
      <rect x="88" y="126" width="24" height="26" fill="url(#gold)" stroke={INK} strokeWidth="6" />
      <path d="M62,152 L138,152 L146,176 L54,176 Z" fill="url(#gold)" stroke={INK} strokeWidth="6" />
      <rect x="44" y="174" width="112" height="16" rx="4" fill="#3b2a1a" stroke={INK} strokeWidth="6" />
      <path d="M100,50 L106,66 L123,66 L109,76 L114,92 L100,82 L86,92 L91,76 L77,66 L94,66 Z" fill="#fff6c2" stroke="#a8650d" strokeWidth="2" />
    </svg>
  </div>
);
export const Bolt: React.FC<{x: number; y: number; h: number}> = ({x, y, h}) => (
  <svg viewBox="0 0 100 200" width={h / 2} height={h} style={{position: 'absolute', left: x - h / 4, top: y - h / 2, overflow: 'visible', filter: 'drop-shadow(0 0 22px #fff3a0) drop-shadow(0 0 40px #ffd23f)'}}>
    <path d="M60,0 L20,95 L48,95 L30,200 L85,80 L55,80 L80,0 Z" fill="#fff6b0" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
  </svg>
);
const Split: React.FC<{a: string; b: string; ang?: number}> = ({a, b, ang = 105}) => (
  <AbsoluteFill style={{background: `linear-gradient(${ang}deg, ${a} 0%, ${a} 49.6%, #fff 49.8%, #fff 50.2%, ${b} 50.4%, ${b} 100%)`, mixBlendMode: 'overlay', opacity: 0.85}} />
);
const HPBar: React.FC<{x: number; y: number; w: number; v: number; label: string}> = ({x, y, w, v, label}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, transform: 'rotate(-3deg)', background: 'rgba(10,12,20,0.92)', border: '6px solid #ff3b30', borderRadius: 18, padding: '10px 16px 14px', boxShadow: '0 0 50px 10px rgba(255,40,40,0.6), 0 10px 0 rgba(0,0,0,0.5)'}}>
    <div style={{display: 'flex', justifyContent: 'space-between', ...font, fontSize: 40, color: '#fff'}}><span>⭐ {label}</span><span style={{color: '#ff3b30'}}>{Math.round(v * 100)}%</span></div>
    <div style={{height: 44, background: '#2a2a2e', border: '4px solid #fff', borderRadius: 10, overflow: 'hidden', marginTop: 6}}><div style={{width: `${v * 100}%`, height: '100%', background: 'linear-gradient(#ff7a6b, #ff3b30)'}} /></div>
  </div>
);

const PBall: React.FC<{sd: number; size: number; mood: Mood; x: number; y: number; look?: [number, number]; gray?: boolean; rot?: number}> = ({sd, size, mood, x, y, look = [0, 0], gray, rot = 0}) => {
  const c = sd ? ['#ff7a7f', '#e0393e', '#6b0f14'] : ['#7fb0ff', '#2f6fe0', '#0f2a6b'];
  return (
    <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, transform: `rotate(${rot}deg)`, filter: gray ? 'grayscale(1) brightness(0.75)' : undefined}}>
      <div style={{position: 'absolute', inset: -size * 0.12, borderRadius: '50%', background: `radial-gradient(circle, ${c[1]} 0%, transparent 68%)`, opacity: 0.6}} />
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle at 34% 28%, #ffffff 0%, ${c[0]} 18%, ${c[1]} 55%, ${c[2]} 100%)`, border: `${size * 0.035}px solid ${INK}`, boxShadow: `0 ${size * 0.06}px 0 rgba(0,0,0,0.55)`}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: size * 0.06, textAlign: 'center', fontSize: size * 0.2, color: '#fff'}}>★</div>
      <svg width={size} height={size} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><Face x={size / 2} y={size * 0.45} r={size * 0.29} mood={mood} t={1} seed={sd + 2} look={look} /></svg>
    </div>
  );
};
// ---------- presets ----------
const US = K('US'), CN = K('CN'), RU = K('RU'), ID = K('ID'), IN = K('IN'), BR = K('BR'), GB = K('GB'), FR = K('FR'), ES = K('ES'), IT = K('IT'), AU = K('AU'), JP = K('JP');
const iT = 420; // Indonesia ya domina casi todo
const T: Record<string, React.ReactNode> = {
  // ===== INDONESIA =====
  i1: (<>
    <MapBg d={JI} t={iT} cx={4600} cy={2300} s={0.3} empire={(JI as any).id} tint="linear-gradient(90deg, #ff9a5a, #5a1010)" />
    <Rays x={330} y={430} c="rgba(255,190,90,0.8)" a={0.5} />
    <Glow x={330} y={440} r={420} c="rgba(255,120,40,0.85)" />
    <Boom x={1080} y={560} r={150} seed={3} /><Boom x={900} y={660} r={90} seed={7} />
    <Ball k={ID} size={380} mood="angry" x={330} y={460} rim="#ff9a3a" look={[0.6, 0]} helmet />
    {[[US, 870, 300, 190], [CN, 1060, 250, 170], [RU, 1180, 400, 150], [IN, 980, 450, 140], [BR, 820, 500, 130], [GB, 1150, 560, 110]].map(([k, x, y, s], i) => <Ball key={i} k={k} size={s} mood="scared" x={x} y={y} rim="#7fb2ff" look={[-0.7, 0]} sweat={i < 2} />)}
    <Bolt x={640} y={420} h={300} />
    <Title lines={[['1 VS 194', '#ffd23f']]} x={640} y={22} size={130} align="center" />
    <Embers n={50} seed={4} /><Vig a={0.55} />
  </>),
  i2: (<>
    <MapBg d={JI} t={iT} cx={3900} cy={2100} s={0.24} empire={(JI as any).id} blur={1.5} tint="linear-gradient(180deg, #ffffff, #c86040)" />
    <Glow x={640} y={360} r={600} c="rgba(255,60,60,0.35)" />
    <Title lines={[['IT CONQUERED', '#ffffff'], ['EVERYTHING', '#ff4d4d']]} x={640} y={40} size={112} align="center" />
    <Ball k={ID} size={260} mood="smug" x={1080} y={520} rim="#ffcf4a" crown />
    <Ball k={US} size={150} mood="shocked" x={230} y={590} rim="#7fb2ff" sweat />
    <Arrow x={360} y={470} w={300} rot={-8} c="#ffd23f" />
    <Tag text="ALMOST 100%" x={430} y={600} bg="#e5322d" size={50} rot={-4} />
    <Vig a={0.6} />
  </>),
  i3: (<>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 70% 0%, #3a2a6a 0%, #0b0a1e 60%, #05050e 100%)'}} />
    <Embers n={90} seed={8} c="#cfe3ff" />
    <MapBg d={JI} t={455} cx={1900} cy={1650} s={0.9} empire={(JI as any).id} blur={2} tint="linear-gradient(180deg, rgba(40,40,80,1), rgba(255,140,120,1))" />
    <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0}}>
      <defs><linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff2b6a" /><stop offset="1" stopColor="#ffdd55" /></linearGradient></defs>
      <line x1={1010} y1={110} x2={640} y2={560} stroke="#ff2b4a" strokeWidth={110} opacity={0.28} strokeLinecap="round" />
      <line x1={1010} y1={110} x2={640} y2={560} stroke="url(#beam)" strokeWidth={50} strokeLinecap="round" />
      <line x1={1010} y1={110} x2={640} y2={560} stroke="#fff" strokeWidth={16} strokeLinecap="round" />
    </svg>
    <Glow x={640} y={560} r={260} c="rgba(255,240,170,1)" />
    <Boom x={640} y={570} r={120} seed={11} />
    <Icon name="beam-satellite" x={1050} y={100} w={190} c="#d8e2ff" glow="#9fb8ff" rot={-20} />
    <Ball k={US} size={230} mood="shocked" x={290} y={520} rim="#ff4d4d" sweat />
    <Ball k={ID} size={170} mood="smug" x={1150} y={300} rim="#ff9a3a" />
    <Title lines={[['SECRET', '#ffffff'], ['WEAPON', '#ff3b5c']]} x={40} y={26} size={118} />
    <Vig a={0.5} />
  </>),
  i4: (<>
    <MapBg d={JI} t={440} cx={2600} cy={1800} s={0.35} empire={(JI as any).id} blur={3} />
    <Split a="#ff2b2b" b="#1f4fff" />
    <Glow x={300} y={420} r={420} c="rgba(255,70,50,0.8)" /><Glow x={980} y={420} r={420} c="rgba(60,120,255,0.8)" />
    <Ball k={ID} size={360} mood="angry" x={300} y={450} rim="#ff6a4a" look={[0.8, 0]} helmet />
    <Ball k={US} size={360} mood="angry" x={980} y={450} rim="#6aa2ff" look={[-0.8, 0]} helmet />
    <Bolt x={640} y={420} h={360} />
    <Title lines={[['THE FINAL WAR', '#ffd23f']]} x={640} y={24} size={104} align="center" />
    <Boom x={640} y={690} r={110} seed={5} />
    <Embers n={40} seed={9} /><Vig a={0.55} />
  </>),
  i5: (<>
    <MapBg d={JI} t={270} cx={3600} cy={1500} s={0.85} empire={(JI as any).id} blur={2.5} tint="linear-gradient(180deg, #ffd0a0, #4a1a10)" />
    <Rays x={760} y={330} c="rgba(255,220,140,0.7)" a={0.45} />
    <Glow x={700} y={480} r={260} c="rgba(255,150,60,0.9)" />
    <Icon name="battleship" x={700} y={470} w={360} c="#ffd23f" glow="#ff8a3a" rot={-6} />
    <Boom x={940} y={330} r={80} seed={21} /><Boom x={560} y={260} r={60} seed={22} />
    <Ball k={ID} size={260} mood="angry" x={1070} y={520} rim="#ff9a3a" helmet look={[-0.6, 0]} />
    <Ball k={ES} size={170} mood="shocked" x={200} y={560} rim="#ffd23f" sweat />
    <Ball k={FR} size={120} mood="scared" x={330} y={420} rim="#7fb2ff" />
    <Title lines={[['SURPRISE', '#ffffff'], ['LANDING!', '#ffd23f']]} x={40} y={24} size={120} />
    <Embers n={45} seed={14} /><Vig a={0.6} />
  </>),
  // ===== USA VS THE WORLD =====
  u1: (<>
    <MapBg d={JU} t={300} cx={4400} cy={1900} s={0.28} empire={(JU as any).id} tint="linear-gradient(90deg, #8ab4ff, #3a0a0a)" />
    <Split a="#1f4fff" b="#ff2b2b" ang={100} />
    <Glow x={300} y={430} r={430} c="rgba(70,130,255,0.85)" />
    <Rays x={300} y={420} c="rgba(150,190,255,0.7)" a={0.45} />
    <Ball k={US} size={360} mood="angry" x={300} y={450} rim="#6aa2ff" look={[0.7, 0]} helmet />
    {[[CN, 860, 300, 210], [RU, 1100, 330, 190], [IN, 960, 520, 160], [K('IR'), 1170, 560, 120], [K('KP'), 780, 560, 110]].map(([k, x, y, sz], i) => <Ball key={i} k={k} size={sz} mood="angry" x={x} y={y} rim="#ff6a4a" look={[-0.7, 0]} />)}
    <Bolt x={600} y={430} h={300} />
    <Title lines={[['USA VS THE WORLD', '#ffffff']]} x={640} y={22} size={100} align="center" />
    <Embers n={50} seed={21} /><Vig a={0.55} />
  </>),
  u2: (<>
    <MapBg d={JU} t={208} cx={1450} cy={1420} s={1.0} empire={(JU as any).id} blur={3} tint="linear-gradient(180deg, #2a3050, #0a0a14)" />
    <Glow x={760} y={330} r={500} c="rgba(120,170,255,0.45)" />
    {[[760, 300, 340, -12], [470, 420, 170, -12], [1040, 430, 170, -12]].map(([x, y, w, r], i) => <Icon key={i} name="jet-fighter" x={x} y={y} w={w} c="#1c2230" glow="#8fb8ff" rot={r} />)}
    <Boom x={330} y={640} r={110} seed={51} /><Boom x={1120} y={650} r={90} seed={52} />
    <Ball k={US} size={230} mood="smug" x={1110} y={520} rim="#6aa2ff" />
    <Ball k={CN} size={150} mood="shocked" x={170} y={560} rim="#ff6a4a" sweat />
    <Title lines={[['STEALTH', '#ffffff'], ['BOMBERS', '#8fc0ff']]} x={40} y={24} size={104} />
    <Embers n={40} seed={22} c="#cfe3ff" /><Vig a={0.6} />
  </>),
  // ===== RED VS BLUE =====
  v1: (<>
    <MapBg d={JU} t={30} cx={1990} cy={1560} s={1.3} blur={4} war={false} tint="linear-gradient(180deg, #b0b0b0, #303030)" />
    <Split a="#1f4fff" b="#ff2b2b" ang={95} />
    <Glow x={300} y={440} r={440} c="rgba(60,120,255,0.9)" /><Glow x={980} y={440} r={440} c="rgba(255,60,60,0.9)" />
    <PBall sd={0} size={340} mood="angry" x={300} y={460} look={[0.8, 0]} />
    <PBall sd={1} size={340} mood="angry" x={980} y={460} look={[-0.8, 0]} />
    <Bolt x={640} y={450} h={340} />
    <Title lines={[['RED VS BLUE', '#ffffff']]} x={640} y={22} size={120} align="center" />
    <Tag text="AMERICA SPLITS IN TWO" x={360} y={630} bg="#1d1d1d" size={46} rot={-2} />
    <Embers n={50} seed={31} /><Vig a={0.55} />
  </>),
  v2: (<>
    <MapBg d={JU} t={30} cx={1990} cy={1560} s={1.3} blur={3} war={false} tint="linear-gradient(180deg, #8a8a8a, #1a1a1a)" />
    <AbsoluteFill style={{background: 'rgba(40,40,44,0.45)', mixBlendMode: 'saturation'}} />
    <Boom x={220} y={600} r={130} seed={61} /><Boom x={1080} y={580} r={140} seed={62} /><Boom x={640} y={690} r={90} seed={63} />
    <PBall sd={0} size={250} mood="sad" x={430} y={440} gray rot={-14} />
    <PBall sd={1} size={250} mood="sad" x={850} y={440} gray rot={14} />
    <Title lines={[['NOBODY WON.', '#e8e8e8']]} x={640} y={30} size={128} align="center" />
    <Embers n={70} seed={33} c="#ffb347" /><Vig a={0.7} />
  </>),
  // ===== WORLD WAR CUP =====
  c1: (<>
    <MapBg d={JC} t={300} cx={3840} cy={2150} s={0.27} blur={3} tint="linear-gradient(180deg, #ffe7a0, #3a1a04)" />
    <Trophy x={640} y={380} h={420} />
    <Ball k={US} size={280} mood="angry" x={190} y={480} rim="#6aa2ff" look={[0.7, 0]} helmet />
    <Ball k={CN} size={280} mood="angry" x={1090} y={480} rim="#ff6a4a" look={[-0.7, 0]} />
    <Title lines={[['WORLD WAR CUP', 'linear-gradient(180deg, #fff6c2 0%, #ffd75a 45%, #e59a12 100%)']]} x={640} y={20} size={108} align="center" />
    <Tag text="128 COUNTRIES · 1 WINNER" x={300} y={630} bg="#e5322d" size={44} rot={-2} />
    <Embers n={55} seed={2} c="#ffd76a" /><Vig a={0.55} />
  </>),
  c2: (<>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #1e2c54 0%, #070b18 75%)'}} />
    {Array.from({length: 40}).map((_, i) => { const col = i % 10, row = Math.floor(i / 10); const ks = (JC as any).r16 ? null : null; const k = [US, CN, RU, IN, BR, GB, FR, JP, ID, IT, K('MX'), K('TR'), K('KR'), K('PK'), K('NG'), K('BD'), K('DE'), K('CA'), AU, ES, K('AR'), K('EG'), K('SA'), K('IR'), K('VN'), K('TH'), K('PL'), K('ZA'), K('NL'), K('UA'), K('CO'), K('PH'), K('MY'), K('KZ'), K('MM'), K('ET'), K('CD'), K('DZ'), K('PE'), K('IQ')][i];
      const out = i !== 0 && i !== 1;
      return <div key={i} style={{position: 'absolute', left: 30 + col * 123, top: 150 + row * 132, width: 110, height: 110, opacity: out ? 0.75 : 1}}>
        <Ball k={k} size={100} mood={out ? 'sad' : 'angry'} x={55} y={55} rim={out ? '#333' : '#ffd23f'} gray={out} />
        {out && <svg width={110} height={110} style={{position: 'absolute', left: 0, top: 0}}><path d="M18,18 L92,92 M92,18 L18,92" stroke="#ff2b2b" strokeWidth={14} strokeLinecap="round" /><path d="M18,18 L92,92 M92,18 L18,92" stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={0.4} /></svg>}
      </div>; })}
    <Glow x={90} y={205} r={140} c="rgba(255,220,100,0.9)" /><Glow x={213} y={205} r={140} c="rgba(255,220,100,0.9)" />
    <Title lines={[['ONLY 1 SURVIVES', '#ffd23f']]} x={640} y={14} size={104} align="center" />
    <Trophy x={1130} y={600} h={190} />
    <Vig a={0.5} />
  </>),
  c3: (<>
    <MapBg d={JC} t={410.5} cx={1820} cy={1400} s={1.6} blur={2.5} tint="linear-gradient(180deg, #ff9a7a, #3a0606)" />
    <Glow x={640} y={500} r={500} c="rgba(255,40,30,0.55)" />
    <Boom x={980} y={560} r={130} seed={31} /><Boom x={1170} y={430} r={80} seed={33} />
    <Icon name="battle-tank" x={1040} y={640} w={170} c="#ffcc1a" glow="#ff6a3a" flip />
    <Icon name="jet-fighter" x={1080} y={150} w={150} c="#ffcc1a" rot={200} glow="#ff6a3a" />
    <Ball k={US} size={300} mood="scared" x={260} y={470} rim="#ff4d4d" sweat />
    <HPBar x={430} y={190} w={560} v={0.09} label="WASHINGTON" />
    <Title lines={[['9% LEFT...', '#ff4d4d']]} x={40} y={20} size={118} />
    <Embers n={60} seed={17} /><Vig a={0.55} />
  </>),
  c4: (<>
    <MapBg d={JC} t={380} cx={4400} cy={1700} s={0.42} blur={4} tint="linear-gradient(180deg, #8a8aa0, #2a2030)" />
    <Split a="#2a4fff" b="#ffcc1a" ang={100} />
    <Boom x={150} y={150} r={70} seed={41} /><Boom x={1150} y={170} r={80} seed={42} />
    <Glow x={280} y={430} r={420} c="rgba(60,120,255,0.8)" /><Glow x={1000} y={430} r={420} c="rgba(255,200,40,0.8)" />
    <Ball k={US} size={340} mood="angry" x={280} y={460} rim="#6aa2ff" look={[0.8, 0]} helmet />
    <Ball k={CN} size={340} mood="angry" x={1000} y={460} rim="#ffcf4a" look={[-0.8, 0]} />
    <Trophy x={640} y={470} h={240} />
    <Title lines={[['THE FINAL', '#ffffff']]} x={640} y={20} size={118} align="center" />
    <Embers n={50} seed={6} c="#ffd76a" /><Vig a={0.55} />
  </>),
  c5: (<>
    <MapBg d={JC} t={195} cx={4900} cy={2300} s={0.4} blur={4} tint="linear-gradient(180deg, #b0a0a0, #3a1a10)" />
    <Rays x={760} y={360} c="rgba(255,255,255,0.7)" a={0.4} />
    <Ball k={ID} size={330} mood="smug" x={820} y={420} rim="#ffffff" crown />
    <Ball k={IT} size={200} mood="shocked" x={300} y={520} rim="#ff5a5a" gray rot={-18} />
    <Ball k={BR} size={150} mood="shocked" x={160} y={330} rim="#ff5a5a" gray rot={12} />
    <Tag text="UPSET!" x={420} y={250} bg="#e5322d" size={92} rot={-10} />
    <Title lines={[['NOBODY SAW', '#ffffff'], ['THIS COMING', '#ffd23f']]} x={1240} y={22} size={86} align="right" />
    <Embers n={40} seed={12} c="#fff3c0" /><Vig a={0.55} />
  </>),
};
export const ThumbPro: React.FC<{id: string}> = ({id}) => (
  <AbsoluteFill style={{background: '#0b1626', overflow: 'hidden'}}>{T[id]}</AbsoluteFill>
);
export const THUMB_IDS = Object.keys(T);
