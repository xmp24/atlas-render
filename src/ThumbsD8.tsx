// Miniaturas v8: estilo de la referencia (rojo/azul saturado, líneas de velocidad, trama de puntos, rayo central, bolas tipo pegatina, título grueso blanco + palabra clave roja)
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {COUNTRIES} from './HexWorld';
import {INK, Face} from './lib3';
import {WorldBg, CountryChar, VS} from './ThumbsMap';
import {FLAG_OVR} from './HexWorld';
import {PIECES, PIECES_OF, CAREA} from './PolyWorld';
import {CBall, AK, EyesSvg} from './ThumbsCB';
import SJ from './hw/states.json';
import {WarHelmet, Muzzle} from './ThumbsFinal';
import {EarthBall, MysteryBall, StatesMap} from './ThumbsD6';

const K = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
const W = 1280, H = 720;
const ALL = COUNTRIES.map((c) => c.c);
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const RED = {c0: '#ff1a0a', c1: '#c8000c', c2: '#4a0003', line: 'rgba(255,90,60,0.45)'};
const BLUE = {c0: '#1466ff', c1: '#0630d0', c2: '#010a45', line: 'rgba(70,140,255,0.45)'};
const GOLD = {c0: '#ffbf00', c1: '#e07000', c2: '#5a1e00', line: 'rgba(255,200,60,0.45)'};
type Side = typeof RED;

// ---------- fondo: lado con degradado radial + líneas de velocidad + trama de puntos ----------
const Half: React.FC<{s: Side; cx: number; clip?: string}> = ({s, cx, clip}) => (
  <AbsoluteFill style={{clipPath: clip}}>
    <AbsoluteFill style={{background: `radial-gradient(circle at ${cx}px 400px, ${s.c0} 0%, ${s.c1} 38%, ${s.c2} 100%)`}} />
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      {Array.from({length: 70}, (_, i) => { const a = (i / 70) * Math.PI * 2 + rnd(i) * 0.05; const r0 = 260 + rnd(i + 3) * 120, r1 = 1100; const w = 0.012 + rnd(i + 7) * 0.02;
        const p = (r: number, da: number) => `${cx + Math.cos(a + da) * r},${400 + Math.sin(a + da) * r}`;
        return <polygon key={i} points={`${p(r0, 0)} ${p(r1, -w)} ${p(r1, w)}`} fill={s.line} />; })}
    </svg>
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(0,0,0,0.28) 28%, transparent 30%)', backgroundSize: '14px 14px', WebkitMaskImage: `radial-gradient(circle at ${cx}px 400px, transparent 30%, rgba(0,0,0,0.9) 75%)`}} />
    <SideFx s={s} />
  </AbsoluteFill>
);

// ---------- detalles extra: brasas + resplandor de fuego (rojo), lluvia (azul), polvo dorado, chispas eléctricas ----------
const Embers: React.FC<{n?: number; seed?: number; col?: string; x0?: number; x1?: number}> = ({n = 45, seed = 1, col = '#ffc24a', x0 = 0, x1 = W}) => (
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
    <defs><filter id={`eb${seed}`}><feGaussianBlur stdDeviation="1.6" /></filter></defs>
    {Array.from({length: n}, (_, i) => { const x = x0 + rnd(i * 3 + seed) * (x1 - x0), y = rnd(i * 7 + seed * 2) * H, r = 1.5 + rnd(i * 11 + seed) * 3.5;
      return <g key={i}><circle cx={x} cy={y} r={r * 2.6} fill={col} opacity={0.25} filter={`url(#eb${seed})`} /><circle cx={x} cy={y} r={r} fill="#fff6d0" opacity={0.85} /></g>; })}
  </svg>
);
const Rain: React.FC<{seed?: number}> = ({seed = 5}) => (
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
    {Array.from({length: 70}, (_, i) => { const x = rnd(i * 5 + seed) * (W + 200), y = rnd(i * 13 + seed) * H, l = 26 + rnd(i * 17) * 40;
      return <line key={i} x1={x} y1={y} x2={x - l * 0.28} y2={y + l} stroke="rgba(210,235,255,0.42)" strokeWidth={2.2} strokeLinecap="round" />; })}
  </svg>
);
const FireGlow: React.FC = () => (<>
  <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(255,190,20,0.75) 0%, rgba(255,120,0,0.45) 18%, rgba(255,60,0,0) 45%)'}} />
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, filter: 'blur(10px)'}}>
    {Array.from({length: 14}, (_, i) => { const x = i * 95 + rnd(i) * 40, h = 120 + rnd(i * 3) * 170, w = 50 + rnd(i * 5) * 40;
      return <path key={i} d={`M${x - w},${H} Q${x - w * 0.3},${H - h * 0.5} ${x},${H - h} Q${x + w * 0.3},${H - h * 0.5} ${x + w},${H} Z`} fill="rgba(255,200,40,0.35)" />; })}
  </svg>
</>);
const Sparks: React.FC<{pts: [number, number][]}> = ({pts}) => (
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    {pts.map(([x, y], i) => { const d = i % 2 ? 1 : -1; const path = `M${x},${y} l${d * 22},-8 l-8,14 l${d * 26},-6 l-6,12 l${d * 20},-4`;
      return <g key={i}><path d={path} stroke="rgba(160,220,255,0.9)" strokeWidth={7} fill="none" style={{filter: 'blur(4px)'}} /><path d={path} stroke="#fff" strokeWidth={2.5} fill="none" strokeLinejoin="round" /></g>; })}
  </svg>
);
const SPARKS: [number, number][] = [[640, 150], [700, 300], [620, 420], [660, 600], [600, 80], [650, 520]];
const SideFx: React.FC<{s: Side}> = ({s}) => s === RED ? <><FireGlow /><Embers seed={3} /></> : s === BLUE ? <><Rain /><Embers seed={9} n={30} col="#9fd2ff" /></> : <Embers seed={4} n={55} col="#ffe27a" />;
const ZIG = [[700, -20], [640, 250], [700, 270], [610, 520], [665, 535], [600, H + 20]];
const zigPath = ZIG.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
const LEFTC = `polygon(0 0, ${ZIG.map((p) => `${p[0]}px ${p[1]}px`).join(', ')}, 0 ${H}px)`;
const RIGHTC = `polygon(${ZIG.map((p) => `${p[0]}px ${p[1]}px`).join(', ')}, ${W}px ${H}px, ${W}px 0)`;
const SplitBurst: React.FC<{l?: Side; r?: Side}> = ({l = RED, r = BLUE}) => (<>
  <Half s={l} cx={330} clip={LEFTC} />
  <Half s={r} cx={950} clip={RIGHTC} />
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
    <path d={zigPath} stroke="rgba(255,255,255,0.55)" strokeWidth={38} fill="none" strokeLinejoin="miter" style={{filter: 'blur(12px)'}} />
    <path d={zigPath} stroke="#fff" strokeWidth={14} fill="none" strokeLinejoin="miter" />
  </svg>
  <Sparks pts={SPARKS} />
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)'}} />
</>);
const FullBurst: React.FC<{s: Side; cx?: number}> = ({s, cx = 640}) => (<><Half s={s} cx={cx} /><AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)'}} /></>);
// líneas de velocidad + trama encima de un mapa (para mantener la base de mapa)
const MapBurst: React.FC<{cx?: number; tint?: string}> = ({cx = 640, tint = 'rgba(255,255,255,0.12)'}) => (<>
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
    {Array.from({length: 60}, (_, i) => { const a = (i / 60) * Math.PI * 2; const r0 = 300, r1 = 1100, w = 0.015 + rnd(i) * 0.02;
      const p = (r: number, da: number) => `${cx + Math.cos(a + da) * r},${430 + Math.sin(a + da) * r}`;
      return <polygon key={i} points={`${p(r0, 0)} ${p(r1, -w)} ${p(r1, w)}`} fill={tint} />; })}
  </svg>
  <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(0,0,0,0.3) 28%, transparent 30%)', backgroundSize: '14px 14px', WebkitMaskImage: `radial-gradient(circle at ${cx}px 430px, transparent 35%, rgba(0,0,0,0.85) 80%)`}} />
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 100%)'}} />
  <Embers seed={21} n={40} col="#ffd27a" />
</>);

// ---------- título: relleno degradado, contorno negro + borde blanco exterior, sombra ----------
const WHITE_G = 'linear-gradient(180deg, #ffffff 0%, #ffffff 48%, #c9ecff 52%, #9fd8ff 100%)';
const RED_G = 'linear-gradient(180deg, #ff8a2a 0%, #ff4a1a 45%, #e0100f 55%, #b30008 100%)';
const GOLD_G = 'linear-gradient(180deg, #fff6a8 0%, #ffd23a 48%, #ffa400 52%, #e07000 100%)';
const GREEN_G = 'linear-gradient(180deg, #d6ffb0 0%, #6bf04a 48%, #22c23a 52%, #108a26 100%)';
type Part = [string, string];
const Title: React.FC<{parts: Part[]; y: number; size: number; x?: number; rot?: number}> = ({parts, y, size, x = W / 2, rot = -2}) => {
  const base: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: '100%', textAlign: 'center', fontFamily: 'Luckiest', fontSize: size, lineHeight: 1, whiteSpace: 'nowrap', letterSpacing: size * 0.01};
  const row = (fn: (g: string, t: string, i: number) => React.ReactNode) => parts.map(([t, g], i) => fn(g, t, i));
  return (
    <div style={{position: 'absolute', left: x - 900, width: 1800, top: y, height: size * 1.2, transform: `rotate(${rot}deg)`}}>
      <div style={{...base, color: '#fff', WebkitTextStroke: `${size * 0.3}px #fff`, filter: `drop-shadow(0 ${size * 0.06}px ${size * 0.04}px rgba(0,0,0,0.6))`}}>{row((g, t, i) => <span key={i}>{t}</span>)}</div>
      <div style={{...base, color: INK, WebkitTextStroke: `${size * 0.17}px ${INK}`}}>{row((g, t, i) => <span key={i}>{t}</span>)}</div>
      <div style={{...base}}>{row((g, t, i) => <span key={i} style={{background: g, WebkitBackgroundClip: 'text', color: 'transparent'}}>{t}</span>)}</div>
      <div style={{...base}}>{row((g, t, i) => <span key={i} style={{background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 30%)', WebkitBackgroundClip: 'text', color: 'transparent'}}>{t}</span>)}</div>
    </div>
  );
};

// ---------- bola tipo pegatina: borde blanco exterior, luz de borde, sombra, casco y arma ----------
const Ball: React.FC<{c: string; x: number; y: number; s: number; eyes?: any; look?: number; helmet?: boolean; gun?: 'r' | 'l'; fire?: boolean; sweat?: boolean; crown?: boolean; flagBg?: string; rim?: string}> = ({c, x, y, s, eyes = 'angry', look = 0, helmet, gun, fire, sweat, crown, flagBg, rim = '#fff'}) => (<>
  <div style={{position: 'absolute', left: x - s * 0.44, top: y + s * 0.43, width: s * 0.88, height: s * 0.12, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', filter: 'blur(6px)'}} />
  <div style={{position: 'absolute', left: x - s / 2 - s * 0.03, top: y - s / 2 - s * 0.03, width: s * 1.06, height: s * 1.06, borderRadius: '50%', background: '#fff', boxShadow: `0 0 ${s * 0.12}px ${rim}`}} />
  <CBall k={K(c)} size={s} x={x} y={y} eyes={eyes} look={look} sweat={sweat} crown={crown} flagBg={flagBg} />
  <div style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: '50%', boxShadow: `inset ${-s * 0.05}px ${-s * 0.04}px ${s * 0.06}px rgba(255,255,255,0.45), inset ${s * 0.04}px ${s * 0.05}px ${s * 0.08}px rgba(0,0,0,0.25)`, pointerEvents: 'none'}} />
  <div style={{position: 'absolute', left: x - s * 0.34, top: y - s * 0.4, width: s * 0.28, height: s * 0.14, borderRadius: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0))', transform: 'rotate(-28deg)', pointerEvents: 'none'}} />
  {helmet && <WarHelmet x={x} y={y + s * 0.03} size={s * 0.98} />}
  {gun === 'r' && <AK x={x + s * 0.38} y={y + s * 0.2} w={s * 0.78} rot={40} />}
  {gun === 'l' && <AK x={x - s * 0.38} y={y + s * 0.2} w={s * 0.78} rot={-40} flip />}
  {gun === 'r' && fire && <><Muzzle x={x + s * 0.76} y={y + s * 0.12} s={s * 0.22} /><svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><line x1={x + s * 0.85} y1={y + s * 0.1} x2={x + s * 1.45} y2={y - s * 0.02} stroke="#ffe066" strokeWidth={6} strokeDasharray="22 14" /></svg></>}
  {gun === 'l' && fire && <Muzzle x={x - s * 0.76} y={y + s * 0.12} s={s * 0.22} />}
</>);
// Tierra con borde de pegatina
const Earth: React.FC<{x: number; y: number; s: number; mood: 'serious' | 'sad'; hat?: boolean; helmet?: boolean}> = ({x, y, s, mood, hat, helmet}) => (<>
  <div style={{position: 'absolute', left: x - s / 2 - s * 0.03, top: y - s / 2 - s * 0.03, width: s * 1.06, height: s * 1.06, borderRadius: '50%', background: '#fff', boxShadow: `0 0 ${s * 0.15}px rgba(170,230,255,0.9)`}} />
  <AbsoluteFill style={{filter: helmet ? 'brightness(1.22) saturate(1.25)' : undefined}}><EarthBall x={x} y={y} s={s} mood={mood} hat={hat} /></AbsoluteFill>
  {helmet && <div style={{position: 'absolute', left: x - s * 0.34, top: y - s * 0.4, width: s * 0.28, height: s * 0.14, borderRadius: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,255,255,0))', transform: 'rotate(-28deg)'}} />}
  {helmet && <WarHelmet x={x} y={y + s * 0.03} size={s * 0.98} />}
</>);
const NEUT: Record<number, string> = {}; COUNTRIES.forEach((_, i) => { NEUT[i] = '#d9cfb4'; });
const PAL = ['#ff4a3a', '#ffc21a', '#3fd04f', '#2f8bff', '#b45cff', '#ff8a1e', '#1fd0c8', '#ff4fae', '#9be03a', '#5a6aff', '#ffe02e', '#e0603a'];
const distinct = (list: string[]) => { const o: Record<number, string> = {...NEUT}; list.forEach((c, i) => { const k = K(c); if (k >= 0) o[k] = PAL[(i * 5 + (i >> 2)) % PAL.length]; }); return o; };
const Map: React.FC<{cam: {cx: number; cy: number; s: number}; col?: Record<number, string>}> = ({cam, col}) => <WorldBg cam={cam} skip={ALL} blur={0} colOver={col} />;
const EU = 'PT ES FR BE NL LU DE CH AT IT SI HR BA RS ME AL MK GR BG RO MD UA BY PL CZ SK HU LT LV EE FI SE NO DK IE GB IS RU CY MT TR'.split(' ');
const AF = 'MA DZ TN LY EG SD SS ET ER DJ SO KE UG TZ RW BI CD CG GA GQ CM CF TD NE NG BJ TG GH CI LR SL GN GW SN GM ML MR BF AO ZM MW MZ ZW BW NA ZA LS SZ MG'.split(' ');
const AS = 'TR SY IQ IR SA YE OM AE QA KW JO IL LB AF PK IN NP BD MM TH LA VN KH MY ID PH CN MN KP KR JP TW KZ UZ TM KG TJ LK GE AM AZ BT'.split(' ');


// bola con 4 banderas (cuadrantes) del continente
const MultiBall: React.FC<{x: number; y: number; s: number; flags: string[]; glow: string}> = ({x, y, s, flags, glow}) => (<>
  <div style={{position: 'absolute', left: x - s * 0.44, top: y + s * 0.43, width: s * 0.88, height: s * 0.12, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', filter: 'blur(8px)'}} />
  <div style={{position: 'absolute', left: x - s * 0.55, top: y - s * 0.55, width: s * 1.1, height: s * 1.1, borderRadius: '50%', background: '#fff', boxShadow: `0 0 ${s * 0.18}px ${glow}, 0 0 ${s * 0.05}px #fff`}} />
  <div style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: '50%', overflow: 'hidden', border: `${s * 0.03}px solid ${INK}`}}>
    {flags.map((f, i) => <Img key={f} src={staticFile(`wflags/${f}.svg`)} style={{position: 'absolute', left: (i % 2) * s / 2 - s * 0.02, top: Math.floor(i / 2) * s / 2 - s * 0.02, width: s / 2 + s * 0.02, height: s / 2 + s * 0.02, objectFit: 'cover', filter: 'saturate(1.25)'}} />)}
    <div style={{position: 'absolute', left: s / 2 - s * 0.012, top: 0, width: s * 0.024, height: s, background: INK}} />
    <div style={{position: 'absolute', top: s / 2 - s * 0.012, left: 0, height: s * 0.024, width: s, background: INK}} />
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 32% 26%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 22%, rgba(255,255,255,0) 40%), radial-gradient(circle at 62% 70%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 92%)'}} />
    <div style={{position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: `inset ${-s * 0.05}px ${-s * 0.04}px ${s * 0.07}px rgba(255,255,255,0.45), inset ${s * 0.04}px ${s * 0.05}px ${s * 0.08}px rgba(0,0,0,0.3)`}} />
  </div>
  <div style={{position: 'absolute', left: x - s * 0.34, top: y - s * 0.4, width: s * 0.28, height: s * 0.14, borderRadius: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0))', transform: 'rotate(-28deg)'}} />
  <svg width={s} height={s} style={{position: 'absolute', left: x - s / 2, top: y - s / 2, overflow: 'visible'}}><EyesSvg e="angry" s={s} look={0} /></svg>
  <div style={{position: 'absolute', left: x - s * 0.24, top: y - s * 0.86, width: s * 0.48, height: s * 0.48, filter: `drop-shadow(0 0 4px ${INK}) drop-shadow(0 0 4px ${INK}) drop-shadow(0 0 22px #ffd86a)`}}><div style={{width: '100%', height: '100%', background: 'linear-gradient(180deg, #fff3a0, #ffc21a 60%, #d48a00)', WebkitMaskImage: `url(${staticFile('hw/icons/crown.svg')})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center'}} /></div>
</>);
// EE.UU. entero pintado con su bandera, sobre océano con líneas de velocidad
const STS = (SJ as any).states as any[];
const USFlagMap: React.FC = () => (
  <svg width={W} height={H} viewBox="318 290 360 202" preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', left: 0, top: 0}}>
    <defs>
      <radialGradient id="oc" cx="50%" cy="55%" r="70%"><stop offset="0%" stopColor="#1f6ff0" /><stop offset="60%" stopColor="#0b2f9a" /><stop offset="100%" stopColor="#020b3a" /></radialGradient>
      <clipPath id="usc">{STS.filter((t) => t.n !== 'Alaska' && t.n !== 'Hawaii').map((t, i) => <path key={i} d={t.d} />)}</clipPath>
      <filter id="usg" x="-20%" y="-20%" width="140%" height="140%"><feMorphology operator="dilate" radius="1.6" in="SourceAlpha" result="d" /><feFlood floodColor="#fff" /><feComposite in2="d" operator="in" result="w" /><feGaussianBlur in="w" stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="w" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    </defs>
    <rect x={0} y={0} width={2000} height={2000} fill="url(#oc)" />
    <g filter="url(#usg)">
      <g clipPath="url(#usc)"><image href={staticFile('wflags/us.svg')} x={352} y={313} width={292} height={156} preserveAspectRatio="none" /></g>
    </g>
    <g fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={0.35}>{STS.filter((t) => t.n !== 'Alaska' && t.n !== 'Hawaii').map((t, i) => <path key={i} d={t.d} />)}</g>
  </svg>
);
// foto satélite de Latinoamérica con silueta luminosa
const LatamPhoto: React.FC<{x: number; y: number; h: number}> = ({x, y, h}) => { const w = h * 856 / 1129; return (<>
  <div style={{position: 'absolute', left: x - w * 0.55, top: y - h * 0.5, width: w * 1.1, height: h, background: 'radial-gradient(ellipse, rgba(255,230,140,0.55) 0%, rgba(255,180,60,0.2) 40%, rgba(255,160,40,0) 70%)'}} />
  <Img src={staticFile('hw/latflags.png')} style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, filter: `saturate(1.25) contrast(1.1) brightness(1.08) drop-shadow(0 0 3px #fff) drop-shadow(0 0 3px #fff) drop-shadow(0 0 2px #fff) drop-shadow(0 0 18px #ffd54a) drop-shadow(0 0 40px #ff9a1a)`}} />
</>); };

const BRt: React.FC<{cam: any; list: string[]; region: string; col: [string, string, string]; flags: string[]}> = ({cam, list, region, col, flags}) => (<>
  <Map cam={cam} col={distinct(list)} />
  <MapBurst />
  <MultiBall x={640} y={450} s={380} flags={flags} glow={col[2]} />
  <Title parts={[[region + ' ', WHITE_G], ['BATTLE ROYALE', RED_G]]} y={34} size={100} />
</>);

const T: Record<string, React.ReactNode> = {
  ww2: (<>
    <SplitBurst />
    <Ball c="DE" x={340} y={470} s={410} helmet gun="r" fire look={0.5} />
    <Earth x={960} y={470} s={380} mood="serious" hat />
    <Title parts={[['WW', WHITE_G], ['2', RED_G]]} y={50} size={200} />
  </>),
  survive: (<>
    <Map cam={{cx: 3900, cy: 1750, s: 0.3}} />
    <AbsoluteFill style={{clipPath: LEFTC, background: 'linear-gradient(90deg, rgba(200,0,12,0.55), rgba(200,0,12,0.25))'}} />
    <AbsoluteFill style={{clipPath: RIGHTC, background: 'linear-gradient(270deg, rgba(6,48,208,0.55), rgba(6,48,208,0.25))'}} />
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><path d={zigPath} stroke="rgba(255,255,255,0.55)" strokeWidth={38} fill="none" style={{filter: 'blur(12px)'}} /><path d={zigPath} stroke="#fff" strokeWidth={14} fill="none" /></svg>
    <Sparks pts={SPARKS} />
    <AbsoluteFill style={{clipPath: LEFTC}}><FireGlow /><Embers seed={3} x1={700} /></AbsoluteFill>
    <AbsoluteFill style={{clipPath: RIGHTC}}><Rain /></AbsoluteFill>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 100%)'}} />
    <Ball c="IS" x={320} y={460} s={380} eyes="scared" helmet sweat look={0.4} />
    <Ball c="US" x={960} y={460} s={390} helmet look={-0.4} />
    <Title parts={[['1 DAY', RED_G]]} x={320} y={36} size={124} rot={-3} />
    <Title parts={[['365 DAYS', GREEN_G]]} x={960} y={36} size={112} rot={2} />
  </>),
  brus: (<>
    <USFlagMap />
    <MapBurst />
    <Ball c="US" x={640} y={455} s={380} helmet gun="r" fire look={0.2} />
    <Title parts={[['BATTLE ', WHITE_G], ['ROYALE', RED_G]]} y={34} size={124} />
  </>),
  breu: <BRt cam={{cx: 4150, cy: 1260, s: 0.92}} list={EU} region="EUROPE" col={['#1f5fe0', '#06205e', '#8fc2ff']} flags={['fr', 'de', 'gb', 'es']} />,
  braf: <BRt cam={{cx: 4262, cy: 2330, s: 0.47}} list={AF} region="AFRICA" col={['#1e9e48', '#063a18', '#8ff0a8']} flags={['eg', 'za', 'ng', 'ma']} />,
  bras: <BRt cam={{cx: 5700, cy: 1760, s: 0.5}} list={AS} region="ASIA" col={['#d6202a', '#4a0006', '#ff9a8a']} flags={['cn', 'jp', 'in', 'sa']} />,
  cqes: (<>
    <Img src={staticFile('hw/esbg.jpg')} style={{position: 'absolute', left: 0, top: 0, width: W, height: H, filter: 'saturate(1.3) contrast(1.1)'}} />
    <AbsoluteFill style={{background: 'radial-gradient(circle at 640px 450px, rgba(255,200,40,0.55) 0%, rgba(255,160,0,0.25) 28%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)'}} />
    <Embers seed={4} n={55} col="#ffe27a" />
    <Ball c="ES" x={640} y={450} s={440} eyes="smug" crown rim="#ffe58a" flagBg="linear-gradient(180deg, #c60b1e 0%, #c60b1e 25%, #ffc400 25%, #ffc400 75%, #c60b1e 75%, #c60b1e 100%)" />
    <Title parts={[['SPANISH ', WHITE_G], ['EMPIRE', RED_G]]} y={20} size={116} />
  </>),
  ukr: (<>
    <SplitBurst l={BLUE} r={RED} />
    <Ball c="UA" x={330} y={450} s={420} helmet gun="r" fire look={0.5} />
    <Ball c="RU" x={950} y={450} s={420} gun="l" look={-0.5} />
    <Title parts={[['UKRAINE ', WHITE_G], ['IN NATO?', GOLD_G]]} y={34} size={116} />
  </>),
  usla: (<>
    <SplitBurst />
    <Ball c="US" x={310} y={450} s={370} helmet gun="r" fire look={0.6} />
    <LatamPhoto x={975} y={415} h={590} />
    <Title parts={[['USA ', WHITE_G], ['VS ', GOLD_G], ['LATAM', RED_G]]} y={34} size={124} />
  </>),
  ww3: (<>
    <SplitBurst l={BLUE} r={RED} />
    <Ball c="US" x={330} y={470} s={410} helmet gun="r" fire look={0.6} />
    <Ball c="RU" x={950} y={470} s={410} helmet gun="l" fire look={-0.6} />
    <Title parts={[['WW', WHITE_G], ['3', RED_G]]} y={50} size={200} />
  </>),
};
for (const [k, c, n] of [['cqru', 'RU', 'RUSSIA'], ['cqcn', 'CN', 'CHINA'], ['cqbr', 'BR', 'BRAZIL']] as const) {
  T[k] = (<>
    <SplitBurst />
    <Ball c={c} x={330} y={450} s={410} helmet gun="r" fire look={0.6} />
    <Earth x={955} y={450} s={410} mood="serious" helmet />
    <Title parts={[[n + ' ', WHITE_G], ['VS ', GOLD_G], ['WORLD', RED_G]]} y={34} size={120} />
  </>);
}
const LA = 'MX GT BZ SV HN NI CR PA CU JM HT DO PR BS TT CO VE GY SR GF EC PE BO BR PY UY AR CL'.split(' ');
const LACAM = {cx: 2330, cy: 2860, s: 0.26};
const LAMASK: Record<number, string> = {}; COUNTRIES.forEach((c, i) => { LAMASK[i] = LA.includes(c.c) ? '#ffffff' : '#000000'; });
T['latflag'] = <Map cam={LACAM} />;
T['latmask'] = <Map cam={LACAM} col={LAMASK} />;
T['grl'] = (<>
  <SplitBurst l={BLUE} r={RED} />
  <Ball c="US" x={330} y={460} s={410} helmet gun="r" fire look={0.6} />
  <Ball c="DK" x={950} y={460} s={410} helmet gun="l" look={-0.6} />
  <Title parts={[['GREENLAND ', WHITE_G], ['WAR', RED_G]]} y={34} size={124} />
</>);
T['tw27'] = (<>
  <SplitBurst l={RED} r={BLUE} />
  <Ball c="CN" x={330} y={460} s={410} helmet gun="r" fire look={0.6} />
  <Ball c="TW" x={950} y={460} s={410} helmet gun="l" fire look={-0.6} />
  <Title parts={[['TAIWAN ', WHITE_G], ['2027', RED_G]]} y={34} size={140} />
</>);
T['nato'] = (<>
  <SplitBurst l={RED} r={BLUE} />
  <Ball c="RU" x={330} y={460} s={410} helmet gun="r" fire look={0.6} />
  <Ball c="PL" x={950} y={460} s={410} helmet gun="l" eyes="scared" sweat look={-0.6} />
  <Title parts={[['USA ', WHITE_G], ['LEAVES ', GOLD_G], ['NATO', RED_G]]} y={34} size={118} />
</>);
T['ilir'] = (<>
  <SplitBurst l={BLUE} r={RED} />
  <Ball c="IL" x={330} y={460} s={410} helmet gun="r" fire look={0.6} />
  <Ball c="IR" x={950} y={460} s={410} helmet gun="l" fire look={-0.6} />
  <Title parts={[['ISRAEL ', WHITE_G], ['VS ', GOLD_G], ['IRAN', RED_G]]} y={34} size={124} />
</>);
T['cart'] = (<>
  <SplitBurst l={BLUE} r={RED} />
  <Ball c="US" x={330} y={460} s={410} helmet gun="r" fire look={0.6} />
  <Ball c="MX" x={950} y={460} s={410} eyes="shades" gun="l" fire look={-0.6} />
  <Title parts={[['USA ', WHITE_G], ['VS ', GOLD_G], ['CARTELS', RED_G]]} y={34} size={124} />
</>);
const GREEN = {c0: '#2fe07a', c1: '#0b8f3e', c2: '#022a12', line: 'rgba(90,255,150,0.4)'};
const ORANGE = {c0: '#ffb347', c1: '#f07800', c2: '#5a2400', line: 'rgba(255,190,90,0.45)'};
const LRED = {c0: '#ffffff', c1: '#ff9d8c', c2: '#c8281e', line: 'rgba(255,255,255,0.45)'};
const LBLUE = {c0: '#ffffff', c1: '#9cc4ff', c2: '#1f55c8', line: 'rgba(255,255,255,0.45)'};
const EUBG = `url(${staticFile('wflags/eu.svg')}) center / cover`;
// estilo B: escena de countryballs (fondo claro, varias bolas, sin texto)
type BB = {c: string; x: number; y: number; s: number; helmet?: boolean; gun?: 'r' | 'l'; fire?: boolean; eyes?: any; look?: number; crown?: boolean; sweat?: boolean; flagBg?: string};
const SceneB: React.FC<{l: Side; r: Side; back: BB[]; front: BB[]}> = ({l, r, back, front}) => (<>
  <SplitBurst l={l} r={r} />
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 60%)'}} />
  {back.map((b, i) => <Ball key={'b' + i} {...b} />)}
  {front.map((b, i) => <Ball key={'f' + i} {...b} />)}
</>);
T['kor'] = <SceneB l={LRED} r={LBLUE} back={[{c: 'CN', x: 150, y: 230, s: 250, eyes: 'smug', look: 0.4}, {c: 'RU', x: 470, y: 150, s: 180, eyes: 'shades', look: 0.3}, {c: 'JP', x: 820, y: 150, s: 180, helmet: true, look: -0.3}, {c: 'US', x: 1130, y: 220, s: 260, helmet: true, gun: 'l', look: -0.4}]}
  front={[{c: 'KP', x: 380, y: 470, s: 440, helmet: true, gun: 'r', fire: true, look: 0.6}, {c: 'KR', x: 920, y: 480, s: 420, helmet: true, gun: 'l', fire: true, look: -0.6}]} />;
T['inpk'] = (<>
  <SplitBurst l={ORANGE} r={GREEN} />
  <Ball c="IN" x={330} y={460} s={410} helmet gun="r" fire look={0.6} />
  <Ball c="PK" x={950} y={460} s={410} helmet gun="l" fire look={-0.6} />
  <Title parts={[['INDIA ', WHITE_G], ['VS ', GOLD_G], ['PAKISTAN', GREEN_G]]} y={34} size={108} />
</>);
T['rare'] = (<>
  <SplitBurst l={BLUE} r={RED} />
  <Ball c="US" x={330} y={460} s={410} helmet gun="r" fire look={0.6} />
  <Ball c="CN" x={950} y={460} s={410} helmet gun="l" fire look={-0.6} />
  <Title parts={[['RARE ', WHITE_G], ['EARTH ', GOLD_G], ['WAR', RED_G]]} y={34} size={124} />
</>);
T['euarmy'] = (<>
  <SplitBurst l={BLUE} r={RED} />
  <Ball c="FR" x={330} y={450} s={410} helmet gun="r" fire look={0.6} flagBg={EUBG} />
  <Earth x={955} y={450} s={410} mood="serious" helmet />
  <Title parts={[['EUROPE ', WHITE_G], ['VS ', GOLD_G], ['WORLD', RED_G]]} y={34} size={120} />
</>);
// estilo A: mapa con siluetas-personaje (texto arriba y abajo)
const SetFlag: React.FC<{c: string; to: string}> = ({c, to}) => { FLAG_OVR[K(c)] = to; return null; };
const MapA: React.FC<{cam: any; skip: string[]; mood?: any; col?: Record<number, string>}> = ({cam, skip, mood = 'scared', col}) => (<>
  <WorldBg cam={cam} skip={skip} blur={1.2} mood={mood} colOver={col} />
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)'}} />
  <Embers seed={51} n={30} col="#ffe08a" />
</>);
T['ussr'] = (<>
  <SetFlag c="RU" to="SU" />
  <MapA cam={{cx: 5300, cy: 1500, s: 0.24}} skip={['RU', 'KZ', 'UA']} col={Object.fromEntries('RU UA BY KZ UZ TM KG TJ GE AM AZ MD LT LV EE'.split(' ').map((c) => [K(c), '#d4141c']))} />
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: 'drop-shadow(0 0 6px #fff) drop-shadow(0 6px 0 rgba(0,0,0,0.5))'}}><Face x={700} y={330} r={150} mood="angry" t={1} seed={3} /></svg>
  <Ball c="RU" x={1090} y={470} s={250} helmet gun="l" fire look={-0.5} flagBg={`url(${staticFile('wflags/su.svg')}) 18% center / cover`} />
  <Title parts={[['THE ', WHITE_G], ['USSR', RED_G]]} y={16} size={120} rot={0} />
  <Title parts={[['RETURNS', RED_G]]} y={586} size={120} rot={0} />
</>);
T['tri'] = <SceneB l={LBLUE} r={LRED} back={[{c: 'JP', x: 170, y: 200, s: 200, helmet: true, look: 0.3}, {c: 'KP', x: 1110, y: 190, s: 210, eyes: 'smug', look: -0.3}]}
  front={[{c: 'US', x: 250, y: 480, s: 380, helmet: true, gun: 'r', fire: true, look: 0.5}, {c: 'CN', x: 1030, y: 480, s: 380, helmet: true, gun: 'l', fire: true, look: -0.5}, {c: 'RU', x: 640, y: 330, s: 400, helmet: true, gun: 'r', fire: true, look: 0}]} />;
T['ww1'] = <SceneB l={LRED} r={LBLUE} back={[{c: 'TR', x: 140, y: 230, s: 230, look: 0.4}, {c: 'AT', x: 430, y: 150, s: 190, helmet: true, look: 0.3}, {c: 'IT', x: 840, y: 150, s: 190, eyes: 'smug', look: -0.3}, {c: 'US', x: 1140, y: 230, s: 230, helmet: true, look: -0.4}]}
  front={[{c: 'DE', x: 370, y: 480, s: 430, helmet: true, gun: 'r', fire: true, look: 0.6}, {c: 'FR', x: 920, y: 480, s: 420, helmet: true, gun: 'l', fire: true, look: -0.6}, {c: 'GB', x: 1130, y: 560, s: 230, helmet: true, look: -0.5}]} />;
T['napo'] = (<>
  <SplitBurst l={BLUE} r={RED} />
  <Ball c="FR" x={330} y={460} s={410} gun="r" fire crown look={0.6} />
  <Ball c="GB" x={950} y={460} s={410} helmet gun="l" fire look={-0.6} />
  <Title parts={[['NAPOLEON ', WHITE_G], ['2026', RED_G]]} y={34} size={124} />
</>);
T['brit'] = <SceneB l={LBLUE} r={LRED} back={[{c: 'AU', x: 150, y: 220, s: 220, helmet: true, look: 0.4}, {c: 'CA', x: 430, y: 140, s: 180, helmet: true, look: 0.3}, {c: 'IN', x: 860, y: 150, s: 190, eyes: 'scared', sweat: true, look: -0.3}, {c: 'US', x: 1140, y: 220, s: 230, helmet: true, gun: 'l', look: -0.4}]}
  front={[{c: 'GB', x: 400, y: 470, s: 450, crown: true, gun: 'r', fire: true, look: 0.6}, {c: 'FR', x: 930, y: 480, s: 410, helmet: true, eyes: 'scared', sweat: true, look: -0.6}]} />;
T['cnin'] = (<>
  <SplitBurst l={RED} r={ORANGE} />
  <Ball c="CN" x={330} y={460} s={410} helmet gun="r" fire look={0.6} />
  <Ball c="IN" x={950} y={460} s={410} helmet gun="l" fire look={-0.6} />
  <Title parts={[['CHINA ', RED_G], ['VS ', WHITE_G], ['INDIA', GOLD_G]]} y={34} size={130} />
</>);
T['brme'] = (<>
  <MapA cam={{cx: 4900, cy: 1880, s: 0.62}} skip={['TR', 'IR', 'SA']} col={distinct('TR SY LB IL JO IQ IR SA YE OM AE QA KW BH EG LY SD AF PK CY GE AM AZ TM'.split(' '))} />
  <CountryChar k={K('TR')} x={330} y={300} w={460} h={230} mood="angry" faceY={0.5} faceR={0.42} look={[0.4, 0.4]} redEyes />
  <CountryChar k={K('IR')} x={900} y={380} w={420} h={380} mood="angry" faceY={0.45} faceR={0.36} look={[-0.6, 0]} redEyes />
  <CountryChar k={K('SA')} x={520} y={560} w={430} h={340} mood="angry" faceY={0.45} faceR={0.36} look={[0.3, -0.5]} />
  <Title parts={[['MIDDLE EAST ', WHITE_G], ['BATTLE ROYALE', RED_G]]} y={16} size={92} rot={0} />
</>);
T['euus'] = (<>
  <MapA cam={{cx: 3000, cy: 1350, s: 0.3}} skip={['US', 'FR', 'DE']} />
  <CountryChar k={K('US')} x={300} y={400} w={560} h={340} mood="angry" faceY={0.5} faceR={0.4} look={[0.7, 0]} redEyes />
  <CountryChar k={K('FR')} x={930} y={400} w={360} h={360} mood="angry" faceY={0.5} faceR={0.4} look={[-0.7, 0]} redEyes />
  <CountryChar k={K('DE')} x={1150} y={250} w={220} h={260} mood="angry" faceY={0.5} faceR={0.38} look={[-0.7, 0]} />
  <VS x={640} y={410} r={78} />
  <Title parts={[['EUROPE ', GOLD_G], ['VS ', WHITE_G], ['USA', RED_G]]} y={16} size={120} rot={0} />
</>);
T['swap'] = (<>
  <MapA cam={{cx: 3000, cy: 1500, s: 0.26}} skip={['US', 'LU']} mood="shocked" />
  <CountryChar k={K('US')} x={330} y={420} w={500} h={300} mood="scared" faceY={0.5} faceR={0.42} look={[0.6, 0]} />
  <CountryChar k={K('LU')} x={930} y={410} w={360} h={420} mood="angry" faceY={0.45} faceR={0.42} look={[-0.6, 0]} redEyes />
  <AK x={760} y={470} w={300} rot={-40} flip />
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
    <path d="M520,330 C600,250 700,250 760,320" stroke="#fff" strokeWidth={22} fill="none" strokeLinecap="round" />
    <path d="M520,330 C600,250 700,250 760,320" stroke="#ffcc00" strokeWidth={12} fill="none" strokeLinecap="round" />
    <path d="M760,520 C700,590 600,590 520,520" stroke="#fff" strokeWidth={22} fill="none" strokeLinecap="round" />
    <path d="M760,520 C700,590 600,590 520,520" stroke="#ffcc00" strokeWidth={12} fill="none" strokeLinecap="round" />
    <polygon points="745,290 790,340 735,345" fill="#ffcc00" stroke="#fff" strokeWidth={5} />
    <polygon points="535,550 490,500 545,495" fill="#ffcc00" stroke="#fff" strokeWidth={5} />
  </svg>
  <Title parts={[['ARMY ', WHITE_G], ['SWAP', RED_G]]} y={16} size={130} rot={0} />
</>);
// estilo C (referencia "Battle Royale Asia"): cada país como pegatina con cara sobre agua de dibujo
const stickerBox = (k: number, minFrac = 0.004, near = 0.9) => {
  const all = PIECES_OF[k].map((i) => PIECES[i]).filter((p) => p.path && p.bbox[2] - p.bbox[0] < 2500);
  if (!all.length) return null;
  const mp = all.reduce((a, p) => (p.area > a.area ? p : a), all[0]);
  const mr = Math.max(mp.bbox[2] - mp.bbox[0], mp.bbox[3] - mp.bbox[1]);
  const ps = all.filter((p) => p.area >= CAREA[k] * minFrac && Math.hypot(p.c[0] - mp.c[0], p.c[1] - mp.c[1]) <= mr * near);
  const b = [1e9, 1e9, -1e9, -1e9];
  for (const p of ps) { b[0] = Math.min(b[0], p.bbox[0]); b[1] = Math.min(b[1], p.bbox[1]); b[2] = Math.max(b[2], p.bbox[2]); b[3] = Math.max(b[3], p.bbox[3]); }
  return b;
};
const WaterBg: React.FC = () => (<>
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #3fd7f0 0%, #1aa9dd 55%, #0b6fb0 100%)'}} />
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: 0.35}}>
    {Array.from({length: 26}, (_, i) => Array.from({length: 12}, (_, j) => { const x = j * 120 + (i % 2) * 60 - 20, y = i * 30 + 10;
      return <path key={i + '-' + j} d={`M${x},${y} q15,-10 30,0 t30,0`} stroke="#d8fbff" strokeWidth={3} fill="none" strokeLinecap="round" />; }))}
  </svg>
</>);
const StickerMap: React.FC<{cam: {cx: number; cy: number; s: number}; codes: string[]; big?: string[]; grow?: number}> = ({cam, codes, big = [], grow = 1.12}) => (<>
  <WaterBg />
  {[...codes.filter((c) => !big.includes(c)), ...big].map((c) => { const k = K(c); if (k < 0) return null; const b = stickerBox(k); if (!b) return null;
    const g = big.includes(c) ? grow : 1;
    const x = ((b[0] + b[2]) / 2 - cam.cx) * cam.s + W / 2, y = ((b[1] + b[3]) / 2 - cam.cy) * cam.s + H / 2;
    const w = ((b[2] - b[0]) * cam.s / 0.9) * g, h = ((b[3] - b[1]) * cam.s / 0.9) * g;
    if (x + w / 2 < -40 || x - w / 2 > W + 40 || y + h / 2 < -40 || y - h / 2 > H + 40 || Math.max(w, h) < 14) return null;
    const cap = big.includes(c) ? 78 : 44; const fr = Math.min(big.includes(c) ? 0.3 : 0.34, cap / Math.min(w, h));
    return <CountryChar key={c} k={k} x={x} y={y} w={w} h={h} mood="angry" faceY={0.5} faceR={fr} stroke={big.includes(c) ? 0.5 : Math.min(1, 160 / Math.max(w, h)) * 0.6 + 0.25} />; })}
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,20,60,0.35) 100%)'}} />
</>);
const ASIA = 'TR SY IQ IR SA YE OM AE QA KW JO IL LB AF PK IN NP BT BD LK MM TH LA KH VN MY ID PH CN MN KP KR JP TW KZ UZ TM KG TJ AZ AM GE RU EG'.split(' ');
const BigTitle: React.FC<{l1: string; l2: string; y?: number; s1?: number; s2?: number}> = ({l1, l2, y = 210, s1 = 110, s2 = 170}) => (<>
  <Title parts={[[l1, GOLD_G]]} y={y} size={s1} rot={-3} />
  <Title parts={[[l2, RED_G]]} y={y + s1 * 0.95} size={s2} rot={-3} />
</>);
// réplica del modelo "BATTLE ROYALE ASIA"
const Title3D: React.FC<{text: string; y: number; size: number; fill: string; edge: string; ext: string; rot?: number}> = ({text, y, size, fill, edge, ext, rot = -2}) => {
  const base: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: '100%', textAlign: 'center', fontFamily: 'Luckiest', fontSize: size, lineHeight: 1, whiteSpace: 'nowrap', letterSpacing: size * 0.02};
  const depth = Math.round(size * 0.09);
  return (
    <div style={{position: 'absolute', left: -300, width: W + 600, top: y, height: size * 1.25, transform: `rotate(${rot}deg)`}}>
      <div style={{...base, top: depth + size * 0.04, color: 'rgba(0,0,0,0.45)', WebkitTextStroke: `${size * 0.2}px rgba(0,0,0,0.45)`, filter: `blur(${size * 0.04}px)`}}>{text}</div>
      {Array.from({length: depth}, (_, d) => <div key={d} style={{...base, top: depth - d, color: ext, WebkitTextStroke: `${size * 0.16}px ${ext}`}}>{text}</div>)}
      <div style={{...base, color: edge, WebkitTextStroke: `${size * 0.16}px ${edge}`}}>{text}</div>
      <div style={{...base, background: fill, WebkitBackgroundClip: 'text', color: 'transparent'}}>{text}</div>
      <div style={{...base, background: 'linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.15) 38%, rgba(255,255,255,0) 50%)', WebkitBackgroundClip: 'text', color: 'transparent'}}>{text}</div>
    </div>
  );
};
const YEL = 'linear-gradient(180deg, #fffbd0 0%, #fff23a 35%, #ffd200 60%, #ff9a00 100%)';
const ORG = 'linear-gradient(180deg, #ffd23a 0%, #ff8a10 30%, #ff3a10 58%, #d40a0a 100%)';
const ASIA_ALL = 'TR SY IQ IR SA YE OM AE QA KW JO IL LB CY GE AM AZ AF PK IN NP BT BD LK MM TH LA KH VN MY ID PH CN MN KP KR JP TW KZ UZ TM KG TJ RU'.split(' ');
const ExplodedAsia: React.FC<{big?: string[]; fy?: Record<string, number>; fx?: Record<string, number>; cx?: number}> = ({big = [], fy = {}, fx = {}, cx = 5520}) => {
  const cam = {cx, cy: 1720, s: 0.72};
  return (<>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 48%, #3ae6ef 0%, #16bfd3 45%, #0b9ab3 80%, #06708a 100%)'}} />
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: 0.22}}>
      {Array.from({length: 26}, (_, i) => Array.from({length: 12}, (_, j) => { const x = j * 120 + (i % 2) * 60 - 20, y = i * 30 + 10;
        return <path key={i + '-' + j} d={`M${x},${y} q15,-10 30,0 t30,0`} stroke="#bff6ff" strokeWidth={3} fill="none" strokeLinecap="round" />; }))}
    </svg>
    {[...ASIA_ALL.filter((c) => !big.includes(c)), ...big].map((c) => { const k = K(c); if (k < 0) return null; const b = stickerBox(k); if (!b) return null;
      const g = (big.includes(c) ? 1.0 : 0.9);
      const x = ((b[0] + b[2]) / 2 - cam.cx) * cam.s + W / 2, y = ((b[1] + b[3]) / 2 - cam.cy) * cam.s + H / 2;
      const w = ((b[2] - b[0]) * cam.s / 0.9) * g, h = ((b[3] - b[1]) * cam.s / 0.9) * g;
      if (x + w / 2 < -60 || x - w / 2 > W + 60 || y + h / 2 < -60 || y - h / 2 > H + 60 || Math.max(w, h) < 22) return null;
      const fr = Math.min(0.3, (big.includes(c) ? 62 : 36) / Math.min(w, h), 0.42);
      return <CountryChar key={c} k={k} x={x} y={y} w={w} h={h} mood="angry" faceY={fy[c] ?? 0.5} faceX={fx[c] ?? 0.5} faceR={Math.max(fr, 0.12)} stroke={1.0} plain outline={big.includes(c) ? 5 : 3} />; })}
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,15,25,0.4) 100%)'}} />
  </>);
};
T['cnin'] = (<>
  <ExplodedAsia big={['CN', 'IN']} fy={{IN: 0.66, CN: 0.5}} fx={{CN: 0.74}} />
  <Title3D text="CHINA VS" y={196} size={96} fill={YEL} edge="#0d0603" ext="#4a2200" />
  <Title3D text="INDIA" y={276} size={200} fill={ORG} edge="#0d0302" ext="#5a0a02" />
</>);
T['inpk'] = (<>
  <ExplodedAsia big={['IN', 'PK']} fy={{IN: 0.66, PK: 0.55}} fx={{PK: 0.5}} cx={5880} />
  <Title3D text="INDIA VS" y={196} size={96} fill={YEL} edge="#0d0603" ext="#4a2200" />
  <Title3D text="PAKISTAN" y={284} size={156} fill={ORG} edge="#0d0302" ext="#5a0a02" />
</>);
export const ThumbD8: React.FC<{id: string}> = ({id}) => <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>{T[id]}</AbsoluteFill>;
export const D8_IDS = Object.keys(T);
