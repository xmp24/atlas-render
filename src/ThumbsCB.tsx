// Miniaturas estilo "Countryballs España": bolas clásicas con sombreado 3D, ojos sin pupila o gafas, armas, sin apenas texto
import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {COUNTRIES, FlagCanvas} from './HexWorld';
import {INK, font} from './lib3';
import {WorldBg} from './ThumbsMap';
import {Embers, Glow} from './ThumbsPro';
import {Planet} from './Logos';

const K = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
const W = 1280, H = 720;
type Eyes = 'angry' | 'normal' | 'scared' | 'shades' | 'dead' | 'smug';

// ojos clásicos de countryball (blancos, sin pupila), en coordenadas de la bola (0..1)
export const EyesSvg: React.FC<{e: Eyes; s: number; look: number}> = ({e, s, look}) => {
  const lx = look * 0.06 * s, cy = 0.4 * s, dx = 0.17 * s, sw = s * 0.022;
  const xs = [0.5 * s - dx + lx, 0.5 * s + dx + lx];
  if (e === 'shades') {
    const lens = (x: number, d: number) => { const o = -d; // d=1 ojo izquierdo
      const pts = [[x + o * 0.17, cy - 0.1], [x - o * 0.13, cy - 0.02], [x - o * 0.11, cy + 0.08], [x + o * 0.14, cy + 0.06]].map(([px, py]) => [px, py]);
      return pts; };
    return (<g>
      <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff4a3a" /><stop offset="1" stopColor="#a8080d" /></linearGradient></defs>
      <path d={`M${xs[0] + 0.1 * s},${cy - 0.035 * s} Q${0.5 * s + lx},${cy - 0.06 * s} ${xs[1] - 0.1 * s},${cy - 0.035 * s}`} fill="none" stroke={INK} strokeWidth={sw * 2} />
      {xs.map((x, i) => { const d = i === 0 ? 1 : -1; const o = -d * s;
        const P = [[x + o * 0.17, cy - 0.1 * s], [x - o * 0.12, cy - 0.025 * s], [x - o * 0.1, cy + 0.085 * s], [x + o * 0.13, cy + 0.065 * s]];
        return <g key={i}><path d={`M${P[0][0]},${P[0][1]} L${P[1][0]},${P[1][1]} Q${P[2][0]},${P[2][1] + 0.01 * s} ${P[2][0]},${P[2][1]} Q${(P[2][0] + P[3][0]) / 2},${cy + 0.12 * s} ${P[3][0]},${P[3][1]} Z`} fill="url(#lg)" stroke={INK} strokeWidth={sw * 1.3} strokeLinejoin="round" />
          <path d={`M${x + o * 0.1},${cy - 0.055 * s} L${x - o * 0.02},${cy - 0.03 * s}`} stroke="rgba(255,255,255,0.75)" strokeWidth={sw * 1.1} strokeLinecap="round" /></g>; })}
    </g>);
  }
  if (e === 'dead') return (<g>{xs.map((x, i) => <g key={i} stroke={INK} strokeWidth={sw * 1.6} strokeLinecap="round"><path d={`M${x - 0.06 * s},${cy - 0.06 * s} L${x + 0.06 * s},${cy + 0.06 * s}`} /><path d={`M${x + 0.06 * s},${cy - 0.06 * s} L${x - 0.06 * s},${cy + 0.06 * s}`} /></g>)}</g>);
  return (<g>{xs.map((x, i) => {
    const d = i === 0 ? 1 : -1; const rx = 0.085 * s, ry = e === 'scared' ? 0.12 * s : 0.1 * s;
    if (e === 'angry') return <path key={i} d={`M${x - rx},${cy - ry * (d > 0 ? 0.8 : 0.15)} L${x + rx},${cy - ry * (d > 0 ? 0.15 : 0.8)} A${rx},${ry} 0 0 1 ${x - rx},${cy - ry * (d > 0 ? 0.8 : 0.15)} Z`} fill="#fff" stroke={INK} strokeWidth={sw} strokeLinejoin="round" transform={`translate(0,${ry * 0.3})`} />;
    if (e === 'smug') return <path key={i} d={`M${x - rx},${cy} L${x + rx},${cy} A${rx},${ry * 0.8} 0 0 1 ${x - rx},${cy} Z`} fill="#fff" stroke={INK} strokeWidth={sw} />;
    return <g key={i}><ellipse cx={x} cy={cy} rx={rx} ry={ry} fill="#fff" stroke={INK} strokeWidth={sw} />{e === 'scared' && <circle cx={x + lx * 0.5} cy={cy + ry * 0.2} r={rx * 0.28} fill={INK} />}</g>;
  })}</g>);
};
export const CBall: React.FC<{k: number; size: number; x: number; y: number; eyes: Eyes; look?: number; rot?: number; sweat?: boolean; gray?: boolean; rim?: string; helmet?: boolean; crown?: boolean; tears?: boolean}> = ({k, size, x, y, eyes, look = 0, rot = 0, sweat, gray, rim, helmet, crown, tears}) => (
  <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, transform: `rotate(${rot}deg)`}}>
    {rim && <div style={{position: 'absolute', inset: -size * 0.08, borderRadius: '50%', background: `radial-gradient(circle, ${rim} 0%, transparent 70%)`, opacity: 0.6}} />}
    <div style={{position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', border: `${Math.max(3, size * 0.018)}px solid ${INK}`, boxShadow: `0 ${size * 0.04}px ${size * 0.06}px rgba(0,0,0,0.55)`, filter: gray ? 'grayscale(1) brightness(0.75)' : 'saturate(1.15)'}}>
      <FlagCanvas k={k} w={size} h={size} />
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 32% 26%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 22%, rgba(255,255,255,0) 40%), radial-gradient(circle at 62% 70%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 92%)'}} />
    </div>
    <svg width={size} height={size} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><EyesSvg e={eyes} s={size} look={look} /></svg>
    {tears && <svg width={size} height={size} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{[0.33, 0.67].map((fx, i) => <path key={i} d={`M${size * fx},${size * 0.5} q${size * 0.02},${size * 0.12} ${size * 0.03},${size * 0.24} a${size * 0.035},${size * 0.035} 0 1 1 ${-size * 0.06},0 q${size * 0.01},${-size * 0.12} ${size * 0.03},${-size * 0.24} z`} fill="#7cc8ff" stroke={INK} strokeWidth={size * 0.012} />)}</svg>}
    {helmet && <div style={{position: 'absolute', left: size * 0.02, top: -size * 0.13, width: size * 0.96, height: size * 0.38, borderRadius: `${size}px ${size}px ${size * 0.06}px ${size * 0.06}px`, background: 'radial-gradient(circle at 35% 30%, #8a9a5a 0%, #4f5b2c 60%, #343c1c 100%)', border: `${size * 0.022}px solid ${INK}`, boxShadow: '0 6px 0 rgba(0,0,0,0.35)'}} />}
    {crown && <div style={{position: 'absolute', left: size * 0.27, top: -size * 0.3, width: size * 0.46, height: size * 0.46, filter: `drop-shadow(0 0 3px ${INK}) drop-shadow(0 0 3px ${INK}) drop-shadow(0 0 18px #ffd86a)`}}><div style={{width: '100%', height: '100%', background: 'linear-gradient(180deg, #fff3a0, #ffc21a 60%, #d48a00)', WebkitMaskImage: `url(${staticFile('hw/icons/crown.svg')})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center'}} /></div>}
    {sweat && <div style={{position: 'absolute', right: size * 0.06, top: size * 0.14, width: size * 0.1, height: size * 0.16, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: 'linear-gradient(#d6f0ff, #4aa8ff)', border: `${size * 0.012}px solid ${INK}`}} />}
  </div>
);
// AK-47 en dos tonos (metal + madera) a partir del icono
export const AK: React.FC<{x: number; y: number; w: number; rot?: number; flip?: boolean}> = ({x, y, w, rot = 0, flip}) => {
  const m = {WebkitMaskImage: `url(${staticFile('hw/icons/ak47.svg')})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center'} as React.CSSProperties;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - w / 2, width: w, height: w, transform: `rotate(${rot}deg) scaleX(${flip ? -1 : 1})`, filter: `drop-shadow(0 0 2px ${INK}) drop-shadow(0 0 2px ${INK}) drop-shadow(0 ${w * 0.03}px ${w * 0.03}px rgba(0,0,0,0.6))`}}>
      <div style={{width: '100%', height: '100%', ...m, background: 'linear-gradient(115deg, #3a3a3a 0%, #555 40%, #8a4a1c 41%, #b8682a 55%, #3a3a3a 56%, #4a4a4a 70%, #8a4a1c 71%, #a65c22 100%)'}} />
    </div>
  );
};
const Big: React.FC<{text: string; x: number; y: number; size: number; col?: string; rot?: number}> = ({text, x, y, size, col = '#fff', rot = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,0) rotate(${rot}deg)`, ...font, fontSize: size, color: col, WebkitTextStroke: `${size * 0.16}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.06}px 0 ${INK}`, whiteSpace: 'nowrap', lineHeight: 1}}>{text}</div>
);

const ID = K('ID'), US = K('US'), CN = K('CN'), RU = K('RU'), AU = K('AU'), BR = K('BR'), IN_ = K('IN'), JP = K('JP'), GB = K('GB'), FR = K('FR'), DE = K('DE'), MY = K('MY'), MX = K('MX');
const RED = 'radial-gradient(ellipse at 60% 40%, #c2271c 0%, #7a0f0a 60%, #3a0504 100%)';

const C: Record<string, React.ReactNode> = {
  // 1 · "La venganza": Indonesia gigante con gafas y AK, el mundo asustado
  c1: (<>
    <AbsoluteFill style={{background: 'linear-gradient(135deg, #e9eef5 0%, #b9c6d6 100%)'}} />
    <CBall k={US} size={230} x={150} y={130} eyes="scared" look={1} sweat />
    <CBall k={CN} size={200} x={140} y={360} eyes="scared" look={1} />
    <CBall k={RU} size={190} x={160} y={590} eyes="scared" look={1} sweat />
    <CBall k={BR} size={150} x={330} y={640} eyes="scared" look={1} />
    <CBall k={AU} size={150} x={1150} y={110} eyes="scared" look={-1} sweat />
    <CBall k={ID} size={720} x={760} y={390} eyes="shades" look={-0.6} />
    <AK x={560} y={500} w={460} rot={-8} flip />
    <AK x={1130} y={580} w={330} rot={20} />
  </>),
  // 2 · Indonesia apunta a EE. UU. (rojo oscuro, primer plano)
  c2: (<>
    <AbsoluteFill style={{background: RED}} />
    <Glow x={640} y={360} r={520} c="rgba(255,90,40,0.35)" />
    <CBall k={ID} size={760} x={720} y={330} eyes="shades" look={-0.3} />
    <AK x={560} y={470} w={520} rot={-14} flip />
    <CBall k={US} size={300} x={420} y={560} eyes="scared" look={0.6} sweat />
  </>),
  // 3 · "Recopilación": Indonesia contra todos, con título
  c3: (<>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #2fa3ff 0%, #8fd3ff 100%)'}} />
    {[[US, 150, 330, 230, -1], [CN, 1120, 330, 230, 1], [RU, 330, 560, 210, -1], [IN_, 950, 570, 210, 1], [GB, 100, 620, 160, -1], [JP, 1190, 620, 160, 1], [FR, 1180, 150, 140, 1], [DE, 110, 150, 140, -1]].map(([k, x, y, s, l], i) => <CBall key={i} k={k as number} size={s as number} x={x as number} y={y as number} eyes="angry" look={-(l as number)} />)}
    <AK x={260} y={400} w={200} rot={10} />
    <AK x={1010} y={400} w={200} rot={-10} flip />
    <CBall k={ID} size={430} x={640} y={420} eyes="shades" />
    <AK x={640} y={560} w={360} rot={0} />
    <Big text="INDONESIA VS" x={W / 2} y={18} size={96} />
    <Big text="THE WORLD" x={W / 2} y={118} size={96} col="#ffd23f" />
  </>),
  // 4 · espacio, estilo Plutón: la Tierra aterrada ante Indonesia
  c4: (<>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 30% 40%, #3a2a5a 0%, #120a22 60%, #05030a 100%)'}} />
    {Array.from({length: 70}, (_, i) => <div key={i} style={{position: 'absolute', left: (i * 173) % W, top: (i * 97) % H, width: 3, height: 3, borderRadius: 2, background: '#fff', opacity: 0.4 + ((i * 7) % 6) / 10}} />)}
    <div style={{position: 'absolute', left: -110, top: 240}}><Planet size={560} mood="scared" lon={110} lat={0} rim="#7ab8ff" /></div>
    <CBall k={ID} size={620} x={900} y={330} eyes="angry" look={-1} rim="#ff6a4a" />
    <CBall k={MY} size={150} x={1200} y={640} eyes="scared" look={-1} />
    <CBall k={AU} size={170} x={560} y={640} eyes="scared" look={1} sweat />
  </>),
  // 5 · el último en pie: Indonesia con gafas sobre el mapa en llamas, los demás derrotados
  c5: (<>
    <WorldBg cam={{cx: 4300, cy: 2150, s: 0.21}} mood="scared" blur={5} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(120,10,5,0.55), rgba(40,0,0,0.75))'}} />
    <Embers n={80} seed={11} c="#ffb35a" />
    {[[US, 170, 620, 220, -30], [CN, 400, 660, 190, 20], [RU, 1100, 630, 220, 30], [BR, 880, 680, 170, -15], [JP, 1240, 470, 140, 60], [MX, 60, 470, 150, -50]].map(([k, x, y, s, r], i) => <CBall key={i} k={k as number} size={s as number} x={x as number} y={y as number} eyes="dead" rot={r as number} gray />)}
    <CBall k={ID} size={460} x={640} y={330} eyes="shades" rim="#ffb35a" />
    <AK x={820} y={420} w={330} rot={-30} />
    <Big text="LAST ONE STANDING" x={W / 2} y={22} size={84} col="#ffd23f" />
  </>),
};
export const ThumbCB: React.FC<{id: string}> = ({id}) => <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>{C[id]}</AbsoluteFill>;
export const CB_IDS = Object.keys(C);
