// Miniaturas día 6: 13 vídeos x 2 modelos (A: relieve dorado/blanco, B: pegatina con fuego y luz fuerte)
import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {COUNTRIES} from './HexWorld';
import {INK, font} from './lib3';
import {WorldBg} from './ThumbsMap';
import {Embers, Glow, Rays} from './ThumbsPro';
import {CBall, AK} from './ThumbsCB';
import {SplitBg as SplitBgOld, BoltFX, WarHelmet, Title3D, GOLD, WHITE, REDG, Muzzle, Tracers, Smoke, Vign, SadEarth, Indo} from './ThumbsFinal';
import SJ from './hw/states.json';
import {Img} from 'remotion';

const K = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
const W = 1280, H = 720;
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const fit = (t: string, base: number) => Math.min(base * 1.12, 2250 / Math.max(4, t.length));

// ---------- título B: pegatina (borde blanco + negro) con degradado de fuego y brillo ----------
const FIRE = 'linear-gradient(180deg, #fffbd0 0%, #ffe14a 30%, #ff9a1a 62%, #ff3d00 100%)';
const ICE = 'linear-gradient(180deg, #ffffff 0%, #e6f4ff 45%, #8fd0ff 100%)';
const TitleB: React.FC<{text: string; y: number; size: number; grad?: string; glow?: string; x?: number; rot?: number}> = ({text, y, size, grad = FIRE, glow = 'rgba(255,120,0,0.95)', x = W / 2, rot = -3}) => {
  const base: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: '100%', textAlign: 'center', ...font, fontSize: size, lineHeight: 1, whiteSpace: 'nowrap'};
  const depth = Array.from({length: 8}, (_, i) => `${(i + 1) * size * 0.008}px ${(i + 1) * size * 0.012}px 0 #000`).join(', ');
  return (
    <div style={{position: 'absolute', left: x - 700, width: 1400, top: y, height: size * 1.25, transform: `rotate(${rot}deg) skewX(-6deg)`}}>
      <div style={{...base, color: '#fff', WebkitTextStroke: `${size * 0.34}px #fff`, filter: `drop-shadow(0 0 ${size * 0.25}px ${glow})`}}>{text}</div>
      <div style={{...base, color: INK, WebkitTextStroke: `${size * 0.2}px ${INK}`, textShadow: depth}}>{text}</div>
      <div style={{...base, background: grad, WebkitBackgroundClip: 'text', color: 'transparent'}}>{text}</div>
      <div style={{...base, background: 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 38%)', WebkitBackgroundClip: 'text', color: 'transparent'}}>{text}</div>
    </div>
  );
};
// título A mejorado: relieve 3D + banda de luz detrás
const TitleA: React.FC<{text: string; y: number; size: number; grad?: string; glow?: string; x?: number; rot?: number; band?: string}> = ({text, y, size, grad = GOLD, glow = 'rgba(255,190,40,0.9)', x = W / 2, rot = -2, band}) => (<>
  {band && <div style={{position: 'absolute', left: x - 640, width: 1280, top: y + size * 0.1, height: size * 1.05, background: `linear-gradient(90deg, transparent 0%, ${band} 18%, ${band} 82%, transparent 100%)`, transform: `rotate(${rot}deg)`, filter: 'blur(2px)'}} />}
  <Title3D text={text} y={y} size={size} grad={grad} glow={glow} x={x} rot={rot} />
</>);
const T2: React.FC<{v: 'a' | 'b'; top?: string; bot?: string; tc?: 'w' | 'g' | 'r'; bc?: 'w' | 'g' | 'r'; ts?: number; bs?: number; ty?: number; by?: number}> = ({v, top, bot, tc = 'w', bc = 'g', ts = 104, bs = 104, ty = 10, by = 588}) => {
  const A = {w: WHITE, g: GOLD, r: REDG}; const B = {w: ICE, g: FIRE, r: 'linear-gradient(180deg,#ffe0d6 0%,#ff5a3a 45%,#b8000a 100%)'};
  const GL = {w: 'rgba(160,210,255,0.9)', g: 'rgba(255,150,20,0.95)', r: 'rgba(255,40,30,0.95)'};
  return <>
    {top && (v === 'a' ? <TitleA text={top} y={ty} size={fit(top, ts)} grad={A[tc]} glow={GL[tc]} band="rgba(0,0,0,0.35)" /> : <TitleB text={top} y={ty + 6} size={fit(top, ts) * 0.94} grad={B[tc]} glow={GL[tc]} />)}
    {bot && (v === 'a' ? <TitleA text={bot} y={by} size={fit(bot, bs)} grad={A[bc]} glow={GL[bc]} band="rgba(0,0,0,0.35)" /> : <TitleB text={bot} y={by} size={fit(bot, bs) * 0.94} grad={B[bc]} glow={GL[bc]} rot={-2} />)}
  </>;
};
const Light: React.FC<{v: 'a' | 'b'; x: number; y: number; c: string; r?: number}> = ({v, x, y, c, r = 320}) => v === 'b' ? <><Rays x={x} y={y} c={c} a={0.55} /><Glow x={x} y={y} r={r * 1.15} c={c} /></> : <Glow x={x} y={y} r={r} c={c} />;
const Bright: React.FC<{v: 'a' | 'b'}> = ({v}) => v === 'b' ? <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(255,240,200,0.18) 0%, rgba(0,0,0,0) 60%)', mixBlendMode: 'screen'}} /> : null;
const all = (col: string, except: string[]) => { const o: Record<number, string> = {}; COUNTRIES.forEach((c, i) => { if (!except.includes(c.c)) o[i] = col; }); return o; };
const some = (col: string, list: string[]) => { const o: Record<number, string> = {}; list.forEach((c) => { const k = K(c); if (k >= 0) o[k] = col; }); return o; };


// ================== día 6b: fondo intenso, bolas detalladas, Tierra nueva ==================
const BX = 640;
const BOLT = [[BX + 50, -20], [BX - 10, 302], [BX + 40, 318], [BX - 50, H + 20]];
const LEFTC = `polygon(0px 0px, ${BOLT.map((p) => `${p[0]}px ${p[1]}px`).join(', ')}, 0px ${H}px)`;
const RIGHTC = `polygon(${BOLT.map((p) => `${p[0]}px ${p[1]}px`).join(', ')}, ${W}px ${H}px, ${W}px 0px)`;
const SplitBg: React.FC<{dark?: boolean}> = () => (<>
  <AbsoluteFill style={{clipPath: LEFTC, background: 'radial-gradient(ellipse at 28% 55%, #ff6a3a 0%, #ff1f1f 28%, #d10012 55%, #7a0008 82%, #2e0003 100%)'}}>
    <AbsoluteFill style={{opacity: 0.55, background: 'repeating-conic-gradient(from 0deg at 25% 55%, rgba(255,210,120,0.35) 0deg 6deg, transparent 6deg 15deg)', WebkitMaskImage: 'radial-gradient(circle at 25% 55%, rgba(0,0,0,1) 5%, rgba(0,0,0,0) 65%)'}} />
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: 0.55, filter: 'blur(5px)'}}>
      {Array.from({length: 9}, (_, i) => { const x = i * 75 - 20, h = 160 + rnd(i) * 220; return <path key={i} d={`M${x},${H} Q${x + 30},${H - h * 0.6} ${x + 45},${H - h} Q${x + 70},${H - h * 0.55} ${x + 95},${H} Z`} fill="#ffb03a" />; })}
    </svg>
  </AbsoluteFill>
  <AbsoluteFill style={{clipPath: RIGHTC, background: 'radial-gradient(ellipse at 72% 50%, #6fe0ff 0%, #1fa4ff 25%, #0a5bff 52%, #0628a8 80%, #020c45 100%)'}}>
    <AbsoluteFill style={{opacity: 0.5, background: 'repeating-conic-gradient(from 0deg at 76% 52%, rgba(190,240,255,0.35) 0deg 6deg, transparent 6deg 15deg)', WebkitMaskImage: 'radial-gradient(circle at 76% 52%, rgba(0,0,0,1) 5%, rgba(0,0,0,0) 65%)'}} />
    {Array.from({length: 30}, (_, i) => <div key={i} style={{position: 'absolute', left: 600 + rnd(i) * 700, top: rnd(i + 50) * 720, width: 3, height: 26 + rnd(i + 9) * 18, background: 'rgba(220,245,255,0.55)', transform: 'rotate(16deg)', borderRadius: 2}} />)}
  </AbsoluteFill>
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
    <path d={BOLT.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ')} stroke="rgba(255,255,255,0.6)" strokeWidth={34} fill="none" style={{filter: 'blur(10px)'}} />
    <path d={BOLT.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ')} stroke="#fff" strokeWidth={12} fill="none" strokeLinejoin="miter" />
  </svg>
</>);
// bola de país con acabado brillante (contorno grueso, luz de borde de color, reflejo)
export const Shine: React.FC<{x: number; y: number; s: number; rim: string}> = ({x, y, s, rim}) => (<>
  <div style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: '50%', boxShadow: `inset ${s * 0.05}px ${-s * 0.03}px ${s * 0.07}px ${rim}, inset ${-s * 0.02}px ${s * 0.03}px ${s * 0.05}px rgba(255,255,255,0.25)`, pointerEvents: 'none'}} />
  <div style={{position: 'absolute', left: x - s * 0.36, top: y - s * 0.42, width: s * 0.3, height: s * 0.16, borderRadius: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0))', transform: 'rotate(-28deg)', pointerEvents: 'none'}} />
</>);
export const Hero: React.FC<{x: number; y: number; s: number; k: number; look?: number; rim?: string; helmet?: boolean; eyes?: any; flip?: boolean}> = ({x, y, s, k, look = 0.6, rim = '#ffd36b', helmet = true, eyes = 'angry'}) => (<>
  <div style={{position: 'absolute', left: x - s * 0.42, top: y + s * 0.4, width: s * 0.84, height: s * 0.12, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', filter: 'blur(8px)'}} />
  <Glow x={x} y={y} r={s * 0.75} c={rim} />
  <CBall k={k} size={s} x={x} y={y} eyes={eyes} look={look} rim={rim} />
  <Shine x={x} y={y} s={s} rim={rim} />
  {helmet && <WarHelmet x={x} y={y + s * 0.03} size={s * 0.98} />}
</>);
// la Tierra: atmósfera, relieve, reflejo, cara (seria o triste) y casco opcional distinto (acero gris-azulado tipo Brodie)
export const EarthBall: React.FC<{x: number; y: number; s: number; mood: 'serious' | 'sad'; hat?: boolean; cracks?: boolean}> = ({x, y, s, mood, hat, cracks}) => {
  const IW = s * 3.0, IH = IW / 2; const lon = 15, lat = 10; const ix = -((lon + 180) / 360) * IW + s / 2, iy = -((90 - lat) / 180) * IH + s / 2;
  const ex = s * 0.17, ey = s * 0.44, rx = s * 0.1, ry = s * 0.12, sw = s * 0.024;
  return (<>
    <div style={{position: 'absolute', left: x - s * 0.42, top: y + s * 0.42, width: s * 0.84, height: s * 0.12, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', filter: 'blur(8px)'}} />
    <div style={{position: 'absolute', left: x - s * 0.66, top: y - s * 0.66, width: s * 1.32, height: s * 1.32, borderRadius: '50%', background: 'radial-gradient(circle, rgba(120,220,255,0.75) 35%, rgba(90,180,255,0.35) 50%, rgba(60,140,255,0) 70%)'}} />
    <div style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: '50%', overflow: 'hidden', border: `${s * 0.035}px solid ${INK}`, boxShadow: `0 0 0 ${s * 0.012}px #bff0ff, 0 ${s * 0.04}px ${s * 0.06}px rgba(0,0,0,0.6)`}}>
      <Img src={staticFile('hw/marble2k.jpg')} style={{position: 'absolute', left: ix, top: iy, width: IW, height: IH, filter: 'saturate(1.6) contrast(1.2) brightness(1.12)'}} />
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 34% 28%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.08) 22%, rgba(255,255,255,0) 40%), radial-gradient(circle at 64% 72%, rgba(0,0,0,0) 40%, rgba(0,10,40,0.65) 92%)'}} />
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: `inset ${-s * 0.05}px ${-s * 0.03}px ${s * 0.07}px rgba(120,230,255,0.9), inset ${s * 0.02}px ${s * 0.02}px ${s * 0.05}px rgba(255,255,255,0.3)`}} />
      {cracks && <svg width={s} height={s} style={{position: 'absolute', left: 0, top: 0}}><g stroke={INK} strokeWidth={s * 0.014} fill="none" strokeLinecap="round"><path d={`M${s * 0.08},${s * 0.62} l${s * 0.12},${s * 0.02} l${s * 0.05},${s * 0.08} l${s * 0.1},-${s * 0.02}`} /><path d={`M${s * 0.92},${s * 0.3} l-${s * 0.1},${s * 0.06} l-${s * 0.03},${s * 0.1}`} /></g></svg>}
    </div>
    <svg width={s} height={s} style={{position: 'absolute', left: x - s / 2, top: y - s / 2, overflow: 'visible'}}>
      {[-1, 1].map((d) => { const cx = s / 2 + d * ex;
        if (mood === 'serious') return <g key={d}>
          <path d={`M${cx - rx},${ey - ry * 0.25} L${cx + rx},${ey - ry * 0.25} A${rx},${ry * 0.85} 0 0 1 ${cx - rx},${ey - ry * 0.25} Z`} fill="#fff" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
          <circle cx={cx - d * rx * 0.15} cy={ey + ry * 0.15} r={rx * 0.32} fill={INK} />
          <path d={`M${cx - rx * 1.25},${ey - ry * (d > 0 ? 0.5 : 0.85)} L${cx + rx * 1.25},${ey - ry * (d > 0 ? 0.85 : 0.5)}`} stroke={INK} strokeWidth={sw * 2.1} strokeLinecap="round" /></g>;
        return <g key={d}>
          <ellipse cx={cx} cy={ey} rx={rx} ry={ry} fill="#fff" stroke={INK} strokeWidth={sw} />
          <circle cx={cx} cy={ey + ry * 0.25} r={rx * 0.38} fill={INK} /><circle cx={cx - rx * 0.15} cy={ey + ry * 0.08} r={rx * 0.13} fill="#fff" />
          <path d={`M${cx - rx * 1.1},${ey - ry * (d > 0 ? 1.5 : 1.0)} L${cx + rx * 1.1},${ey - ry * (d > 0 ? 1.0 : 1.5)}`} stroke={INK} strokeWidth={sw * 1.6} strokeLinecap="round" /></g>; })}
      {mood === 'serious' ? <path d={`M${s * 0.42},${s * 0.66} L${s * 0.58},${s * 0.66}`} stroke={INK} strokeWidth={sw * 1.4} strokeLinecap="round" />
        : <><path d={`M${s * 0.41},${s * 0.7} Q${s * 0.5},${s * 0.63} ${s * 0.59},${s * 0.7}`} stroke={INK} strokeWidth={sw * 1.3} fill="none" strokeLinecap="round" /><path d={`M${s * 0.69},${s * 0.52} q${s * 0.015},${s * 0.06} ${s * 0.02},${s * 0.1} a${s * 0.022},${s * 0.022} 0 1 1 ${-s * 0.04},0 q${s * 0.005},${-s * 0.05} ${s * 0.02},${-s * 0.1} z`} fill="#8fdcff" stroke={INK} strokeWidth={sw * 0.6} /></>}
    </svg>
    {hat && <div style={{position: 'absolute', left: x - s * 0.62, top: y - s * 0.72, width: s * 1.24, height: s * 0.5, transform: 'rotate(8deg)'}}>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: s * 0.09, borderRadius: '50%', background: 'linear-gradient(180deg, #7d8a99, #3b4552)', border: `${s * 0.022}px solid ${INK}`}} />
      <div style={{position: 'absolute', left: s * 0.24, right: s * 0.24, bottom: s * 0.045, height: s * 0.34, borderRadius: `${s}px ${s}px ${s * 0.04}px ${s * 0.04}px`, background: 'radial-gradient(circle at 35% 28%, #c7d2de 0%, #7d8a99 35%, #4a5563 75%, #2c343e 100%)', border: `${s * 0.022}px solid ${INK}`}}>
        <div style={{position: 'absolute', left: '15%', top: '12%', width: '28%', height: '26%', borderRadius: '50%', background: 'rgba(255,255,255,0.45)', filter: 'blur(2px)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, bottom: s * 0.03, height: s * 0.05, background: 'rgba(20,24,30,0.55)'}} />
      </div>
    </div>}
  </>);
};
// bola misteriosa de un solo color, detallada
export const MysteryBall: React.FC<{x: number; y: number; s: number; col: string; dark: string; light: string; v: 'a' | 'b'}> = ({x, y, s, col, dark, light, v}) => (<>
  <Glow x={x} y={y} r={s * (v === 'b' ? 1.25 : 1.0)} c={v === 'b' ? 'rgba(255,220,90,0.8)' : 'rgba(255,215,70,0.55)'} />
  {v === 'b' && <Rays x={x} y={y} c="rgba(255,225,120,0.7)" a={0.6} />}
  <div style={{position: 'absolute', left: x - s * 0.42, top: y + s * 0.42, width: s * 0.84, height: s * 0.12, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', filter: 'blur(8px)'}} />
  <div style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: '50%', overflow: 'hidden', border: `${s * 0.035}px solid ${INK}`, boxShadow: `0 0 ${s * 0.22}px ${light}, 0 ${s * 0.05}px 0 rgba(0,0,0,0.5)`, background: `radial-gradient(circle at 36% 30%, ${light} 0%, ${col} 38%, ${dark} 88%)`}}>
    <div style={{position: 'absolute', inset: 0, opacity: 0.16, background: `repeating-linear-gradient(135deg, ${dark} 0 ${s * 0.02}px, transparent ${s * 0.02}px ${s * 0.06}px)`}} />
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 64% 74%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 95%)'}} />
    <div style={{position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: `inset ${-s * 0.05}px ${-s * 0.04}px ${s * 0.08}px rgba(255,230,140,0.8), inset ${s * 0.03}px ${s * 0.03}px ${s * 0.06}px rgba(255,255,255,0.35)`}} />
    <div style={{position: 'absolute', left: '14%', top: '10%', width: '34%', height: '18%', borderRadius: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0))', transform: 'rotate(-28deg)'}} />
  </div>
  <svg width={s} height={s} style={{position: 'absolute', left: x - s / 2, top: y - s / 2, overflow: 'visible'}}>
    {[-1, 1].map((d) => { const cx = s / 2 + d * s * 0.17, ey = s * 0.42, rx = s * 0.1, ry = s * 0.12, sw = s * 0.025;
      return <g key={d}><path d={`M${cx - rx},${ey - ry * (d < 0 ? 0.75 : 0.15)} L${cx + rx},${ey - ry * (d < 0 ? 0.15 : 0.75)} A${rx},${ry} 0 0 1 ${cx - rx},${ey - ry * (d < 0 ? 0.75 : 0.15)} Z`} fill="#fff" stroke={INK} strokeWidth={sw} strokeLinejoin="round" transform={`translate(0,${ry * 0.3})`} /><circle cx={cx} cy={ey + ry * 0.45} r={rx * 0.3} fill={INK} /></g>; })}
  </svg>
  <div style={{position: 'absolute', left: x - s * 0.27, top: y - s * 0.88, width: s * 0.54, height: s * 0.54, filter: `drop-shadow(0 0 4px ${INK}) drop-shadow(0 0 4px ${INK}) drop-shadow(0 0 22px #ffd86a)`}}><div style={{width: '100%', height: '100%', background: 'linear-gradient(180deg, #fff3a0, #ffc21a 60%, #d48a00)', WebkitMaskImage: `url(${staticFile('hw/icons/crown.svg')})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat'}} /></div>
</>);
// ---------- formato "USA VS THE ENTIRE WORLD": bola armada vs Tierra llorando ----------
const VsWorld: React.FC<{v: 'a' | 'b'; k: string; top: string; bot?: string; seed: number; dark?: boolean; earth?: 'serious' | 'sad'; hat?: boolean}> = ({v, k, top, bot, seed, earth = 'sad', hat}) => (<>
  <SplitBg />
  <Embers n={70} seed={seed} c="#ffe08a" />
  <Smoke list={[[120, 640, 90], [300, 700, 110], [520, 660, 80]]} />
  <Tracers from={[640, 465]} to={[860, 410]} />
  <Hero x={320} y={420} s={400} k={K(k)} rim="#ffcf6a" />
  <AK x={475} y={500} w={310} rot={40} />
  <Muzzle x={632} y={480} s={95} />
  <EarthBall x={975} y={hat ? 440 : 410} s={hat ? 360 : 380} mood={earth} hat={hat} cracks={v === 'b' && earth === 'sad'} />
  <Vign />
  <Bright v={v} />
  <T2 v={v} top={top} bot={bot} />
</>);
// ---------- formato duelo (WW3): dos potencias armadas ----------
const Duel: React.FC<{v: 'a' | 'b'; a: string; b: string; top: string; bot: string; seed: number}> = ({v, a, b, top, bot, seed}) => (<>
  <SplitBg />
  <Embers n={70} seed={seed} c="#ffe08a" />
  <Hero x={320} y={420} s={380} k={K(a)} look={0.6} rim="#ffcf6a" />
  <AK x={470} y={500} w={280} rot={40} />
  <Muzzle x={612} y={480} s={85} />
  <Hero x={960} y={420} s={380} k={K(b)} look={-0.6} rim="#9fe4ff" />
  <AK x={810} y={500} w={280} rot={-40} flip />
  {v === 'b' && <div style={{position: 'absolute', left: 640 - 110, top: 310, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, #fff 0%, #fff3a0 25%, #ff9a1a 55%, rgba(255,60,0,0) 72%)', filter: 'blur(2px)'}} />}
  <Vign />
  <Bright v={v} />
  <T2 v={v} top={top} bot={bot} tc="r" />
</>);
// ---------- battle royale: solo título + bola misteriosa pixelada gigante ----------
const PIXCOL = ['#e0262b', '#ffcf1a', '#1f6fe0', '#2fae4e', '#ffffff', '#ff7a1e', '#8a3fb8', '#111111', '#12b3c8', '#c81e1e'];
const PixelBall: React.FC<{x: number; y: number; s: number; seed: number; v: 'a' | 'b'}> = ({x, y, s, seed, v}) => {
  const n = 14; const c = s / n;
  return (<>
    <Glow x={x} y={y} r={s * (v === 'b' ? 1.25 : 1.0)} c={v === 'b' ? 'rgba(255,220,90,0.8)' : 'rgba(255,215,70,0.6)'} />
    {v === 'b' && <Rays x={x} y={y} c="rgba(255,225,120,0.7)" a={0.6} />}
    <div style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: '50%', overflow: 'hidden', border: `${s * 0.035}px solid ${INK}`, boxShadow: `0 0 ${s * 0.25}px rgba(255,215,70,0.9), 0 ${s * 0.05}px 0 rgba(0,0,0,0.5)`}}>
      <svg width={s} height={s} style={{position: 'absolute', left: 0, top: 0}} shapeRendering="crispEdges">
        {Array.from({length: n * n}, (_, i) => { const gx = i % n, gy = Math.floor(i / n); const band = Math.floor((gx + gy * 0.6 + rnd(seed + gy) * 3) / 3.2); return <rect key={i} x={gx * c} y={gy * c} width={c + 0.5} height={c + 0.5} fill={PIXCOL[(band + seed + Math.floor(rnd(i + seed * 7) * 1.6)) % PIXCOL.length]} />; })}
        {Array.from({length: n * n}, (_, i) => rnd(i * 3 + seed) < 0.25 ? <rect key={'s' + i} x={(i % n) * c} y={Math.floor(i / n) * c} width={c} height={c} fill="rgba(0,0,0,0.18)" /> : null)}
      </svg>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 32% 26%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 24%, rgba(255,255,255,0) 42%), radial-gradient(circle at 62% 70%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.5) 95%)'}} />
    </div>
    {[[-0.17, 0], [0.17, 0]].map(([dx], i) => <div key={i} style={{position: 'absolute', left: x + dx * s - s * 0.11, top: y - s * 0.16, width: s * 0.22, height: s * 0.22, background: '#fff', border: `${s * 0.025}px solid ${INK}`, imageRendering: 'pixelated'}}><div style={{position: 'absolute', left: '30%', top: '30%', width: '40%', height: '40%', background: INK}} /></div>)}
    <div style={{position: 'absolute', left: x - s * 0.26, top: y - s * 0.86, width: s * 0.52, height: s * 0.52, filter: `drop-shadow(0 0 4px ${INK}) drop-shadow(0 0 4px ${INK}) drop-shadow(0 0 22px #ffd86a)`}}><div style={{width: '100%', height: '100%', background: 'linear-gradient(180deg, #fff3a0, #ffc21a 60%, #d48a00)', WebkitMaskImage: `url(${staticFile('hw/icons/crown.svg')})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat'}} /></div>
  </>);
};
const BR: React.FC<{v: 'a' | 'b'; cam: {cx: number; cy: number; s: number}; top: string; seed: number; c: [string, string, string]}> = ({v, cam, top, seed, c}) => (<>
  <WorldBg cam={cam} skip={COUNTRIES.map((c) => c.c)} blur={3.2} />
  <AbsoluteFill style={{background: `radial-gradient(circle at 50% 58%, rgba(0,0,0,0) 15%, rgba(0,0,0,${v === 'b' ? 0.45 : 0.62}) 85%)`}} />
  <MysteryBall x={W / 2} y={440} s={v === 'b' ? 400 : 380} col={c[0]} dark={c[1]} light={c[2]} v={v} />
  <Embers n={60} seed={seed} c="#ffd27a" />
  <Vign />
  <Bright v={v} />
  <T2 v={v} top={top} ts={108} />
</>);
// ---------- mapa de estados ----------
const STS = (SJ as any).states as any[];
const Pal = (i: number) => `hsl(${(i * 222.5) % 360},${[75, 65, 85][(Math.floor(i / 3)) % 3]}%,${[52, 42, 62][i % 3]}%)`;
export const StatesMap: React.FC = () => (
  <svg width={W} height={H} viewBox="285 262 420 236" preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', left: 0, top: 0}}>
    <rect x={0} y={0} width={4000} height={3000} fill="#1f5fa8" />
    {STS.map((s, i) => <path key={i} d={s.d} fill={Pal(i)} stroke="#fff" strokeWidth={0.7} />)}
  </svg>
);
// ---------- reloj gigante ----------
export const BigClock: React.FC<{v: 'a' | 'b'}> = ({v}) => {
  const s = 400, cx = W / 2, cy = 380;
  return (<>
    <Light v={v} x={cx} y={cy} c={v === 'b' ? 'rgba(255,60,40,0.65)' : 'rgba(255,215,70,0.55)'} r={330} />
    <div style={{position: 'absolute', left: cx - s / 2, top: cy - s / 2, width: s, height: s, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #ffffff, #efe6cf 65%, #c9b98f)', border: `20px solid ${INK}`, boxShadow: `0 0 0 10px ${v === 'b' ? '#ff3b2f' : '#ffcf1a'}, 0 0 0 22px ${INK}, 0 0 90px ${v === 'b' ? 'rgba(255,60,40,0.9)' : 'rgba(255,215,70,0.9)'}`}}>
      <svg width={s - 40} height={s - 40} style={{position: 'absolute', left: 0, top: 0}}>
        {Array.from({length: 60}, (_, i) => { const a = (i * 6 * Math.PI) / 180; const r0 = i % 5 ? 160 : 140; return <line key={i} x1={180 + Math.sin(a) * r0} y1={180 - Math.cos(a) * r0} x2={180 + Math.sin(a) * 172} y2={180 - Math.cos(a) * 172} stroke={INK} strokeWidth={i % 5 ? 3 : 9} />; })}
        <path d="M180 180 L180 20 A160 160 0 1 1 50 86 Z" fill="rgba(229,50,45,0.5)" />
        <line x1={180} y1={180} x2={180} y2={60} stroke={INK} strokeWidth={18} strokeLinecap="round" />
        <line x1={180} y1={180} x2={270} y2={230} stroke="#e5322d" strokeWidth={12} strokeLinecap="round" />
        <circle cx={180} cy={180} r={16} fill={INK} />
      </svg>
    </div>
    {[[-0.9, -0.82], [0.9, -0.82]].map(([dx, dy], i) => <div key={i} style={{position: 'absolute', left: cx + dx * s * 0.42 - 55, top: cy + dy * s * 0.5 - 40, width: 110, height: 70, borderRadius: '50% 50% 20% 20%', background: v === 'b' ? '#ff3b2f' : '#ffcf1a', border: `10px solid ${INK}`, transform: `rotate(${i ? 30 : -30}deg)`}} />)}
  </>);
};
const DayTag: React.FC<{text: string; x: number; y: number; bg: string; rot: number; v: 'a' | 'b'}> = ({text, x, y, bg, rot, v}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg)`, background: bg, border: `8px solid ${INK}`, borderRadius: 22, padding: '6px 26px 0', ...font, fontSize: 82, color: '#fff', WebkitTextStroke: `4px ${INK}`, paintOrder: 'stroke fill', boxShadow: v === 'b' ? `0 0 40px ${bg}, 0 10px 0 rgba(0,0,0,0.5)` : '0 10px 0 rgba(0,0,0,0.5)', whiteSpace: 'nowrap'}}>{text}</div>
);
const ES_FLAG = 'linear-gradient(180deg, #c60b1e 0%, #c60b1e 25%, #ffc400 25%, #ffc400 75%, #c60b1e 75%, #c60b1e 100%)';

const SC: Record<string, (v: 'a' | 'b') => React.ReactNode> = {
  ww2: (v) => <VsWorld v={v} k="DE" top="WORLD WAR 2" seed={71} earth="serious" hat />,
  survive: (v) => (<>
    <WorldBg cam={{cx: 3900, cy: 1900, s: 0.36}} skip={COUNTRIES.map((c) => c.c)} blur={3.2} />
    <AbsoluteFill style={{background: v === 'b' ? 'radial-gradient(circle at 50% 50%, rgba(80,0,0,0.25), rgba(10,0,0,0.7) 85%)' : 'rgba(8,6,20,0.6)'}} />
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: 'scale(0.78)', transformOrigin: '640px 330px'}}><BigClock v={v} /></div>
    <Glow x={215} y={400} r={230} c="rgba(255,70,50,0.55)" />
    <CBall k={K('IS')} size={270} x={215} y={400} eyes="scared" look={0.4} rim="#ffb0a0" sweat />
    <Shine x={215} y={400} s={270} rim="#ff8a7a" />
    <Hero x={1065} y={410} s={290} k={K('US')} look={-0.4} rim="#9fe4ff" />
    <AK x={950} y={480} w={220} rot={-40} flip />
    {v === 'a' ? <><TitleA text="1 DAY" x={225} y={555} size={110} grad={REDG} glow="rgba(255,40,30,0.9)" rot={-5} /><TitleA text="365 DAYS" x={1030} y={570} size={90} grad={GOLD} glow="rgba(255,190,40,0.9)" rot={4} /></>
      : <><TitleB text="1 DAY" x={225} y={555} size={104} grad="linear-gradient(180deg,#ffe0d6 0%,#ff5a3a 45%,#b8000a 100%)" glow="rgba(255,40,30,0.95)" rot={-6} /><TitleB text="365 DAYS" x={1030} y={570} size={86} glow="rgba(255,150,20,0.95)" rot={4} /></>}
    <Embers n={60} seed={72} c="#ffd27a" />
    <Vign />
    <Bright v={v} />
  </>),
  brus: (v) => (<>
    <StatesMap />
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 55%, rgba(0,0,0,0) 20%, rgba(0,0,0,${v === 'b' ? 0.5 : 0.65}) 90%)`}} />
    <Light v={v} x={W / 2} y={420} c="rgba(255,190,70,0.6)" r={330} />
    <Indo x={W / 2 - 60} y={430} s={460} k={K('US')} look={0.3} />
    <AK x={W / 2 + 130} y={530} w={360} rot={35} />
    <Muzzle x={W / 2 + 320} y={505} s={110} />
    <Tracers from={[W / 2 + 330, 495]} to={[1270, 400]} n={5} />
    <Embers n={60} seed={73} c="#ffd27a" />
    <Vign />
    <Bright v={v} />
    <T2 v={v} top={v === 'a' ? 'BATTLE ROYALE' : '50 STATES BATTLE ROYALE'} ts={130} tc="g" />
  </>),
  breu: (v) => <BR v={v} cam={{cx: 4150, cy: 1250, s: 0.9}} top={v === 'a' ? 'EUROPE BATTLE ROYALE' : 'EUROPE: ONLY 1 SURVIVES'} seed={3} c={['#1f5fe0', '#06205e', '#8fc2ff']} />,
  braf: (v) => <BR v={v} cam={{cx: 4262, cy: 2347, s: 0.45}} top={v === 'a' ? 'AFRICA BATTLE ROYALE' : '54 ENTER. 1 SURVIVES.'} seed={5} c={['#1e9e48', '#063a18', '#8ff0a8']} />,
  bras: (v) => <BR v={v} cam={{cx: 5763, cy: 1733, s: 0.5}} top={v === 'a' ? 'ASIA BATTLE ROYALE' : 'ASIA: ONLY 1 SURVIVES'} seed={8} c={['#d6202a', '#4a0006', '#ff9a8a']} />,
  cqes: (v) => (<>
    <WorldBg cam={{cx: 3900, cy: 1900, s: 0.36}} skip={COUNTRIES.map((c) => c.c)} blur={2.4} colOver={all('#d4a017', ['US', 'CN', 'GB', 'RU'])} />
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 20%, rgba(0,0,0,0.5) 85%)'}} />
    <Light v={v} x={W / 2} y={400} c="rgba(255,205,60,0.75)" r={360} />
    {v === 'b' && <Rays x={W / 2} y={400} c="rgba(255,60,40,0.4)" a={0.45} n={24} />}
    <CBall k={K('ES')} size={420} x={W / 2} y={410} eyes="smug" look={0} rim="#fff2a0" crown flagBg={ES_FLAG} />
    <Embers n={70} seed={74} c="#ffd27a" />
    <Vign />
    <Bright v={v} />
    <T2 v={v} top={v === 'a' ? 'SPANISH EMPIRE' : 'THE SPANISH EMPIRE RETURNS'} ty={v === 'a' ? 590 : 596} ts={v === 'a' ? 130 : 96} tc="g" />
  </>),
  ukr: (v) => (<>
    <WorldBg cam={{cx: 4430, cy: 1270, s: 1.35}} skip={['UA', 'RU']} blur={2.4} colOver={some('#c0262d', ['RU', 'BY'])} />
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 20%, rgba(0,0,0,0.6) 90%)'}} />
    <Light v={v} x={320} y={430} c="rgba(255,220,60,0.55)" r={330} />
    <CBall k={K('UA')} size={420} x={310} y={440} eyes="angry" look={0.6} rim="#fff3a0" />
    <WarHelmet x={310} y={452} size={412} />
    <Light v={v} x={980} y={430} c="rgba(255,60,40,0.45)" r={300} />
    <CBall k={K('RU')} size={420} x={980} y={440} eyes="angry" look={-0.6} rim="#ffb0a0" />
    <AK x={830} y={520} w={300} rot={-40} flip />
    <Muzzle x={650} y={490} s={90} />
    <Tracers from={[640, 490]} to={[460, 450]} n={4} />
    <BoltFX seed={11} />
    <Embers n={50} seed={75} c="#ffd27a" />
    <Vign />
    <Bright v={v} />
    <T2 v={v} top={v === 'a' ? 'WHAT IF UKRAINE' : 'UKRAINE JOINS NATO'} bot={v === 'a' ? 'JOINED NATO?' : 'RUSSIA WAS NOT READY'} tc="w" bc="g" ty={6} by={600} bs={v === 'a' ? 116 : 90} />
  </>),
  usla: (v) => (<>
    <SplitBg />
    <Embers n={60} seed={54} c="#ffd27a" />
    <Light v={v} x={300} y={410} c="rgba(140,180,255,0.5)" r={300} />
    <CBall k={K('US')} size={350} x={290} y={420} eyes="angry" look={0.6} rim="#9fc0ff" />
    <WarHelmet x={290} y={430} size={344} />
    <AK x={440} y={500} w={260} rot={40} />
    <Muzzle x={575} y={480} s={80} />
    {[['BR', 1000, 300, 230], ['MX', 820, 480, 170], ['CO', 1150, 520, 170], ['VE', 980, 560, 150], ['AR', 1180, 230, 140], ['CU', 820, 250, 130]].map(([c, x, y, s]: any) => <CBall key={c} k={K(c)} size={s} x={x} y={y} eyes="angry" look={-0.6} />)}
    <BoltFX seed={12} />
    <Vign />
    <Bright v={v} />
    <T2 v={v} top={v === 'a' ? 'USA VS' : 'USA INVADES'} bot="LATIN AMERICA" tc="w" bc="g" />
  </>),
  ww3: (v) => <Duel v={v} a="US" b="RU" top={v === 'a' ? 'WORLD WAR 3' : 'WW3 HAS BEGUN'} bot={v === 'a' ? 'HOW IT REALLY STARTS' : 'ONE BOMB. ONE ANSWER.'} seed={76} />,
  cqru: (v) => <VsWorld v={v} k="RU" top={v === 'a' ? 'RUSSIA VS' : 'CAN RUSSIA CONQUER'} bot={v === 'a' ? 'THE ENTIRE WORLD' : 'THE WORLD?'} seed={77} />,
  cqcn: (v) => <VsWorld v={v} k="CN" top={v === 'a' ? 'CHINA VS' : 'CAN CHINA CONQUER'} bot={v === 'a' ? 'THE ENTIRE WORLD' : 'THE WORLD?'} seed={78} />,
  cqbr: (v) => <VsWorld v={v} k="BR" top={v === 'a' ? 'BRAZIL VS' : 'CAN BRAZIL CONQUER'} bot={v === 'a' ? 'THE ENTIRE WORLD' : 'THE WORLD?'} seed={79} />,
};
const T: Record<string, React.ReactNode> = {};
for (const k of Object.keys(SC)) { T[`${k}-a`] = SC[k]('a'); T[`${k}-b`] = SC[k]('b'); }
export const ThumbD6: React.FC<{id: string}> = ({id}) => <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>{T[id]}</AbsoluteFill>;
export const D6_IDS = Object.keys(T);
