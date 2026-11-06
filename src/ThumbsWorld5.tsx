// Miniaturas "A World With" v5 — estilo de las referencias del usuario (UKRAINE IN NATO? / USA VS LATAM / EUROPE BATTLE ROYALE):
// título pegatina blanca arriba (≤3 palabras), fondos saturados con líneas de velocidad, corte en zigzag con chispas,
// countryballs clásicas con brillo y aro blanco, mapas de colores o con banderas.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {COUNTRIES, FlagCanvas} from './HexWorld';
import {PolyCanvas, proj} from './PolyWorld';
import {INK, font} from './lib3';
import {EyesSvg, AK} from './ThumbsCB';
import {WarHelmet} from './ThumbsFinal';

const W = 1280, H = 720;
const K = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
type Eyes = 'angry' | 'normal' | 'scared' | 'shades' | 'dead' | 'smug';

// ---------- degradados del título ----------
const WB = 'linear-gradient(180deg, #ffffff 0%, #ffffff 52%, #cdeaff 54%, #9fd6ff 100%)';
const GD = 'linear-gradient(180deg, #fff6a0 0%, #ffd21f 50%, #ffb000 52%, #ff8400 100%)';
const RD = 'linear-gradient(180deg, #ffc08a 0%, #ff6a2a 50%, #f0321a 52%, #c4120a 100%)';
const IC = 'linear-gradient(180deg, #ffffff 0%, #d8f6ff 50%, #8ae0ff 52%, #2fb0ff 100%)';
const PU = 'linear-gradient(180deg, #f6e8ff 0%, #d0a0ff 50%, #b070ff 52%, #7a2cff 100%)';
const GR = 'linear-gradient(180deg, #e8ffb0 0%, #9ae84a 50%, #5ccc2a 52%, #2a9a10 100%)';

const Title: React.FC<{parts: [string, string][]}> = ({parts}) => {
  const n = parts.map((p) => p[0]).join(' ').length; const size = Math.min(132, 1080 / (n * 0.6));
  const L = (extra: React.CSSProperties, t: string) => <div style={{position: 'absolute', left: 0, top: 0, whiteSpace: 'nowrap', ...extra}}>{t}</div>;
  return (<div style={{position: 'absolute', left: 0, width: W, top: 26 + (132 - size) * 0.3, display: 'flex', justifyContent: 'center', gap: size * 0.2, transform: 'rotate(-1.5deg)'}}>
    {parts.map(([t, g], i) => <div key={i} style={{position: 'relative', ...font, fontSize: size, lineHeight: 1.05, letterSpacing: size * 0.02}}>
      <div style={{visibility: 'hidden', whiteSpace: 'nowrap'}}>{t}</div>
      {L({color: INK, WebkitTextStroke: `${size * 0.34}px ${INK}`, transform: `translateY(${size * 0.07}px)`, opacity: 0.85, filter: `blur(${size * 0.02}px)`}, t)}
      {L({color: '#fff', WebkitTextStroke: `${size * 0.32}px #ffffff`}, t)}
      {L({color: INK, WebkitTextStroke: `${size * 0.085}px ${INK}`}, t)}
      {L({background: g, WebkitBackgroundClip: 'text', color: 'transparent'}, t)}
      {L({background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 30%)', WebkitBackgroundClip: 'text', color: 'transparent'}, t)}
    </div>)}
  </div>);
};

// ---------- fondos ----------
const BG: Record<string, string> = {
  blue: 'radial-gradient(ellipse at 50% 45%, #3a7cff 0%, #1646e0 45%, #0a2496 100%)',
  red: 'radial-gradient(ellipse at 50% 40%, #ff3a22 0%, #e4120c 45%, #a00806 100%)',
  ice: 'radial-gradient(ellipse at 50% 45%, #c8f4ff 0%, #5cc8ff 40%, #1a6ad8 100%)',
  fire: 'radial-gradient(ellipse at 50% 100%, #ffe066 0%, #ff8a12 35%, #e0280a 70%, #8a0804 100%)',
  gold: 'radial-gradient(ellipse at 50% 45%, #fff3a0 0%, #ffcc1f 40%, #e08a00 100%)',
  gray: 'radial-gradient(ellipse at 50% 45%, #8f95a6 0%, #565c6e 50%, #23262f 100%)',
  night: 'radial-gradient(ellipse at 50% 45%, #2a3070 0%, #121640 50%, #04050f 100%)',
  pink: 'radial-gradient(ellipse at 50% 45%, #ffb0e0 0%, #e04aa8 45%, #7a1070 100%)',
  green: 'radial-gradient(ellipse at 50% 45%, #7ae05a 0%, #2aa83a 50%, #0a5a1a 100%)',
};
const Speed: React.FC<{cx: number; cy: number; seed: number; col?: string}> = ({cx, cy, seed, col = 'rgba(255,255,255,0.55)'}) => (
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
    {Array.from({length: 46}, (_, i) => { const a = rnd(seed + i) * 6.283, r0 = 260 + rnd(seed * 2 + i) * 260, len = 50 + rnd(seed * 3 + i) * 120;
      return <line key={i} x1={cx + Math.cos(a) * r0} y1={cy + Math.sin(a) * r0} x2={cx + Math.cos(a) * (r0 + len)} y2={cy + Math.sin(a) * (r0 + len)} stroke={col} strokeWidth={1.5 + rnd(i + seed) * 2.5} strokeLinecap="round" />; })}
  </svg>
);
const Bokeh: React.FC<{seed: number; c: string; x0?: number; x1?: number; n?: number}> = ({seed, c, x0 = 0, x1 = W, n = 26}) => (<>
  {Array.from({length: n}, (_, i) => { const s = 3 + rnd(seed + i * 3) * 7; return <div key={i} style={{position: 'absolute', left: x0 + rnd(seed + i) * (x1 - x0), top: rnd(seed * 5 + i) * H, width: s, height: s, borderRadius: '50%', background: c, boxShadow: `0 0 ${s * 2.5}px ${s * 0.8}px ${c}`, opacity: 0.5 + rnd(i) * 0.5}} />; })}
</>);
const Panel: React.FC<{bg: string; cx: number; seed: number; children?: React.ReactNode}> = ({bg, cx, seed, children}) => (<>
  <AbsoluteFill style={{background: BG[bg]}} />
  {bg === 'red' || bg === 'fire' ? <AbsoluteFill style={{background: 'radial-gradient(ellipse at 85% 110%, rgba(255,170,40,0.85) 0%, rgba(255,120,20,0) 45%)'}} /> : null}
  <Speed cx={cx} cy={380} seed={seed} />
  {children}
  <Bokeh seed={seed} c={bg === 'red' || bg === 'fire' || bg === 'gold' ? '#ffc070' : '#d8eeff'} />
</>);

// ---------- corte zigzag con chispas ----------
const ZZ = [[700, -20], [652, 238], [706, 262], [640, 540], [672, 556], [618, 740]];
const zl = `polygon(0px 0px, ${ZZ.map((p) => `${p[0]}px ${p[1]}px`).join(', ')}, 0px ${H}px)`;
const zr = `polygon(${ZZ.map((p) => `${p[0]}px ${p[1]}px`).join(', ')}, ${W}px ${H}px, ${W}px 0px)`;
const zd = 'M' + ZZ.map((p) => p.join(',')).join(' L');
const Zig: React.FC = () => (
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <defs><filter id="zg" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9" /></filter></defs>
    <path d={zd} stroke="#bfe6ff" strokeWidth={30} fill="none" filter="url(#zg)" opacity={0.9} />
    <path d={zd} stroke="#fff" strokeWidth={11} fill="none" strokeLinejoin="miter" />
    {[[600, 160, 1], [760, 300, -1], [600, 420, 1], [720, 600, -1], [770, 140, -1]].map(([x, y, d], i) =>
      <g key={i}><path d={`M${x},${y} l${d * 14},-10 l${d * 10},12 l${d * 14},-12 l${d * 10},12 l${d * 14},-10`} stroke="#bff0ff" strokeWidth={7} fill="none" filter="url(#zg)" />
        <path d={`M${x},${y} l${d * 14},-10 l${d * 10},12 l${d * 14},-12 l${d * 10},12 l${d * 14},-10`} stroke="#fff" strokeWidth={3} fill="none" strokeLinejoin="round" /></g>)}
  </svg>
);

// ---------- countryball clásica con aro blanco, brillo y sombra ----------
type BP = {k?: string; quad?: string[]; earth?: string; s: number; x: number; y: number; e: Eyes; look?: number; rot?: number; helmet?: boolean; crown?: boolean; sweat?: boolean; tears?: boolean; tint?: string; glow?: string};
const Ball: React.FC<BP> = ({k, quad, earth, s, x, y, e, look = 0, rot = 0, helmet, crown, sweat, tears, tint, glow = 'rgba(255,255,255,0.7)'}) => (<>
  <div style={{position: 'absolute', left: x - s * 0.45, top: y + s * 0.42, width: s * 0.9, height: s * 0.2, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 70%)'}} />
  <div style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, transform: `rotate(${rot}deg)`}}>
    <div style={{position: 'absolute', inset: -s * 0.045, borderRadius: '50%', background: 'linear-gradient(160deg, #ffffff 0%, #e8eef6 60%, #b8c4d4 100%)', boxShadow: `0 0 ${s * 0.16}px ${s * 0.03}px ${glow}, 0 ${s * 0.03}px ${s * 0.05}px rgba(0,0,0,0.5)`}} />
    <div style={{position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', border: `${Math.max(3, s * 0.014)}px solid ${INK}`, background: '#123'}}>
      {earth ? (() => { const IW = s * 3.0, IH = IW / 2; const lx = -((15 + 180) / 360) * IW + s / 2, ly = -((90 - 22) / 180) * IH + s / 2;
          return <Img src={staticFile('hw/marble2k.jpg')} style={{position: 'absolute', left: lx, top: ly, width: IW, height: IH, filter: earth}} />; })()
        : quad ? quad.map((c, i) => <div key={i} style={{position: 'absolute', left: (i % 2) * s / 2, top: Math.floor(i / 2) * s / 2, width: s / 2, height: s / 2, overflow: 'hidden'}}><div style={{marginLeft: -(i % 2) * s / 4, marginTop: 0}}><FlagCanvas k={K(c)} w={s * 0.75} h={s / 2} /></div></div>)
        : <div style={{filter: 'saturate(1.2)'}}><FlagCanvas k={K(k!)} w={s} h={s} /></div>}
      {quad && <svg width={s} height={s} style={{position: 'absolute', left: 0, top: 0}}><path d={`M${s / 2},0 V${s} M0,${s / 2} H${s}`} stroke={INK} strokeWidth={s * 0.018} /></svg>}
      {tint && <AbsoluteFill style={{background: tint}} />}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 42%, rgba(0,0,0,0) 55%, rgba(0,0,20,0.5) 100%)'}} />
      <div style={{position: 'absolute', left: s * 0.12, top: s * 0.05, width: s * 0.5, height: s * 0.28, borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.45) 45%, rgba(255,255,255,0) 72%)', transform: 'rotate(-24deg)'}} />
    </div>
    <svg width={s} height={s} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: earth ? 'drop-shadow(0 0 4px rgba(0,0,0,0.5))' : undefined}}><EyesSvg e={e} s={s} look={look} /></svg>
    {crown && <div style={{position: 'absolute', left: s * 0.24, top: -s * 0.36, width: s * 0.52, height: s * 0.52, filter: `drop-shadow(0 0 3px ${INK}) drop-shadow(0 0 3px ${INK}) drop-shadow(0 0 22px #ffd86a)`}}><div style={{width: '100%', height: '100%', background: 'linear-gradient(180deg, #fff3a0, #ffc21a 60%, #d48a00)', WebkitMaskImage: `url(${staticFile('hw/icons/crown.svg')})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center'}} /></div>}
    {sweat && <svg width={s} height={s} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><path d={`M${s * 0.84},${s * 0.12} q${s * 0.06},${s * 0.12} 0,${s * 0.17} q${-s * 0.06},${-s * 0.05} 0,${-s * 0.17} Z`} fill="#9adcff" stroke={INK} strokeWidth={s * 0.012} /></svg>}
    {tears && <svg width={s} height={s} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{[0.33, 0.67].map((fx, i) => <path key={i} d={`M${s * fx},${s * 0.5} q${s * 0.02},${s * 0.1} ${s * 0.03},${s * 0.2} a${s * 0.035},${s * 0.035} 0 1 1 ${-s * 0.06},0 q${s * 0.01},${-s * 0.1} ${s * 0.03},${-s * 0.2} z`} fill="#7cc8ff" stroke={INK} strokeWidth={s * 0.012} />)}</svg>}
  </div>
  {helmet && <WarHelmet x={x} y={y + s * 0.02} size={s * 1.02} />}
</>);

// ---------- iconos ----------
const Ico: React.FC<{n: string; x: number; y: number; w: number; c: string; rot?: number; glow?: string}> = ({n, x, y, w, c, rot = 0, glow}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - w / 2, width: w, height: w, transform: `rotate(${rot}deg)`, filter: `drop-shadow(0 0 2px ${INK}) drop-shadow(0 0 2px ${INK}) drop-shadow(0 6px 4px rgba(0,0,0,0.5))${glow ? ` drop-shadow(0 0 20px ${glow})` : ''}`}}>
    <div style={{width: '100%', height: '100%', background: c, WebkitMaskImage: `url(${staticFile(`hw/icons/${n}.svg`)})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center'}} />
  </div>
);
const Flash: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <div style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, background: 'radial-gradient(circle, #fffbe0 0%, #ffd23f 35%, #ff9a1a 60%, rgba(255,120,20,0) 72%)', clipPath: 'polygon(50% 0,58% 40%,100% 50%,58% 60%,50% 100%,42% 60%,0 50%,42% 40%)', filter: 'drop-shadow(0 0 10px #ffc040)'}} />
);
const Tracer: React.FC<{x0: number; y0: number; x1: number; y1: number}> = ({x0, y0, x1, y1}) => (
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><line x1={x0} y1={y0} x2={x1} y2={y1} stroke="#ffd36a" strokeWidth={6} strokeDasharray="26 18" strokeLinecap="round" style={{filter: 'drop-shadow(0 0 6px #ffb030)'}} /></svg>
);
const Snow: React.FC<{x0: number; x1: number}> = ({x0, x1}) => <>{Array.from({length: 50}, (_, i) => { const s = 3 + rnd(i + 9) * 7; return <div key={i} style={{position: 'absolute', left: x0 + rnd(i) * (x1 - x0), top: rnd(i + 50) * H, width: s, height: s, borderRadius: '50%', background: '#fff', opacity: 0.6 + rnd(i) * 0.4, boxShadow: '0 0 6px #bfe8ff'}} />; })}</>;
const Flames: React.FC<{x0: number; x1: number}> = ({x0, x1}) => (
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: 0.55, filter: 'blur(5px)'}}>
    {Array.from({length: 10}, (_, i) => { const x = x0 + i * (x1 - x0) / 9 - 40, h = 160 + rnd(i + 3) * 200; return <path key={i} d={`M${x},${H} Q${x + 30},${H - h * 0.6} ${x + 45},${H - h} Q${x + 70},${H - h * 0.55} ${x + 95},${H} Z`} fill="#ffd25a" />; })}
  </svg>
);
const QM: React.FC<{x: number; y: number; s: number; r: number}> = ({x, y, s, r}) => (
  <div style={{position: 'absolute', left: x, top: y, ...font, fontSize: s, color: '#fff', WebkitTextStroke: `${s * 0.12}px ${INK}`, paintOrder: 'stroke fill', transform: `rotate(${r}deg)`, filter: 'drop-shadow(0 4px 0 rgba(0,0,0,0.4))'}}>?</div>
);

// ---------- mapa ----------
const cam = (lon: number, lat: number, s: number) => { const [cx, cy] = proj([lon, lat]) as [number, number]; return {cx, cy, s}; };
const Map: React.FC<{c: {cx: number; cy: number; s: number}; solid?: boolean; flagSet?: string[]; filter?: string}> = ({c, solid, flagSet, filter = 'saturate(1.45) contrast(1.08) brightness(1.05)'}) => (
  <AbsoluteFill style={{overflow: 'hidden', background: '#1f6fd8'}}>
    <div style={{position: 'absolute', inset: -20, filter}}>
      <PolyCanvas cev={[]} t={0} tm={0} byTm={false} cam={c} W={W + 40} H={H + 40} opts={{squads: false, capitalsOff: true, war: null, empire: null, waves: true, solid, pal: solid, flagSet: flagSet?.map(K)} as any} />
    </div>
  </AbsoluteFill>
);
const Vig: React.FC<{a?: number}> = ({a = 0.5}) => <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 50%, rgba(0,0,0,${a}) 100%)`}} />;

// ---------- escenas ----------
const S1 = (L: string, R: string, left: React.ReactNode, right: React.ReactNode, title: [string, string][], over?: React.ReactNode) => (<>
  <AbsoluteFill style={{clipPath: zl}}><Panel bg={L} cx={330} seed={3}>{left}</Panel></AbsoluteFill>
  <AbsoluteFill style={{clipPath: zr}}><Panel bg={R} cx={960} seed={8}>{right}</Panel></AbsoluteFill>
  <Vig a={0.35} />
  <Zig />
  {over}
  <Title parts={title} />
</>);
const EARTH = 'saturate(1.5) contrast(1.15) brightness(1.15)';
const EUROPE = cam(15, 50, 0.8), EUROPE_R = cam(-2, 50, 0.8), WORLD = cam(10, 22, 0.24), WORLD_R = cam(-45, 22, 0.2);

const T: Record<string, React.ReactNode> = {
  cold: S1('fire', 'ice',
    <><Flames x0={0} x1={700} /><Ball earth={EARTH} s={390} x={330} y={445} e="smug" look={0.4} glow="rgba(255,220,120,0.8)" /><Ico n="flame" x={130} y={210} w={120} c="#ffd23f" glow="#ffb030" /></>,
    <><Snow x0={640} x1={1280} /><Ball earth="saturate(0.4) brightness(1.5) hue-rotate(160deg)" tint="linear-gradient(180deg, rgba(220,245,255,0.55), rgba(140,210,255,0.35))" s={390} x={965} y={445} e="scared" look={-0.4} sweat glow="rgba(200,240,255,0.9)" /><Ico n="snowflake-1" x={1160} y={620} w={130} c="#e6f8ff" glow="#8ae0ff" rot={12} /></>,
    [['FROZEN', WB], ['EARTH?', IC]]),
  heat: S1('blue', 'fire',
    <><Ball earth={EARTH} s={390} x={330} y={445} e="normal" look={0.4} /></>,
    <><Flames x0={640} x1={1280} /><Ball earth="saturate(1.6) sepia(0.5) hue-rotate(-20deg) brightness(1.1)" tint="radial-gradient(circle at 50% 100%, rgba(255,90,10,0.6), rgba(255,60,0,0.15))" s={390} x={965} y={445} e="scared" look={-0.4} sweat glow="rgba(255,170,60,0.9)" /><Ico n="thermometer-hot" x={1170} y={600} w={140} c="#ff5a2a" glow="#ffb030" rot={10} /></>,
    [['EARTH', WB], ['+460°C?', RD]]),
  thirty: S1('blue', 'red',
    <><Ball k="NG" s={380} x={330} y={455} e="smug" look={0.5} crown /></>,
    <><Ball k="JP" s={380} x={965} y={455} e="scared" look={-0.5} sweat /><Ico n="sands-of-time" x={1170} y={250} w={130} c="#ffd23f" glow="#ffb030" rot={12} /></>,
    [['DEAD', WB], ['AT 30?', GD]]),
  purge: S1('blue', 'red',
    <><Ball k="MX" s={380} x={320} y={450} e="angry" look={0.5} helmet /><AK x={490} y={540} w={270} rot={42} /></>,
    <><Ball k="US" s={380} x={970} y={450} e="angry" look={-0.5} helmet /><AK x={800} y={540} w={270} rot={-42} flip /></>,
    [['PURGE', WB], ['NIGHT', RD]], <><Flash x={645} y={520} s={90} /></>),
  money: S1('gold', 'gray',
    <><Ball k="US" s={380} x={330} y={455} e="shades" look={0.4} crown /><Ico n="coins" x={120} y={600} w={150} c="#ffd23f" glow="#fff0a0" rot={-10} /><Ico n="money-stack" x={560} y={250} w={120} c="#7ad85a" glow="#d0ffa0" rot={14} /></>,
    <><Ball k="US" s={380} x={965} y={455} e="normal" look={-0.3} tears tint="rgba(60,60,80,0.35)" glow="rgba(200,210,230,0.6)" /><QM x={1130} y={170} s={110} r={14} /></>,
    [['MONEY', WB], ['GONE?', GD]]),
  memory: S1('blue', 'pink',
    <><Ball earth={EARTH} s={390} x={330} y={445} e="normal" look={0.3} /><Ico n="alarm-clock" x={120} y={240} w={120} c="#fff" glow="#bfe6ff" rot={-12} /></>,
    <><Ball earth={EARTH} s={390} x={965} y={445} e="scared" look={-0.3} sweat glow="rgba(255,190,230,0.9)" /><QM x={1120} y={160} s={120} r={14} /><QM x={760} y={560} s={90} r={-16} /><Ico n="brain" x={1170} y={610} w={130} c="#ffb0d8" glow="#ff6ac0" rot={10} /></>,
    [['MEMORY', WB], ['RESET?', PU]]),
  power: S1('gold', 'night',
    <><Ball earth={EARTH} s={390} x={330} y={445} e="smug" look={0.3} glow="rgba(255,240,150,0.9)" /><Ico n="light-bulb" x={120} y={230} w={130} c="#fff3a0" glow="#ffd23f" rot={-12} /></>,
    <><Ball earth="brightness(0.45) saturate(0.6)" s={390} x={965} y={445} e="scared" look={-0.3} sweat glow="rgba(120,140,255,0.5)" /><Ico n="candle-light" x={1170} y={600} w={130} c="#ffd96a" glow="#ffb030" rot={8} /></>,
    [['WORLD', WB], ['BLACKOUT', GD]]),
  // ---- bola contra mapa ----
  ocean: (<>
    <AbsoluteFill style={{clipPath: zl}}><Panel bg="red" cx={330} seed={4}><Ball k="NL" s={380} x={320} y={455} e="scared" look={0.6} sweat /><Ico n="big-wave" x={120} y={610} w={140} c="#8ae0ff" glow="#2fb0ff" rot={-8} /></Panel></AbsoluteFill>
    <AbsoluteFill style={{clipPath: zr}}>
      <Map c={EUROPE_R} />
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>{[0, 1, 2].map((k) => <path key={k} d={`M600,${500 + k * 50} ${Array.from({length: 9}, (_, i) => `Q${640 + i * 80},${470 + k * 50 + (i % 2 ? -24 : 24)} ${680 + i * 80},${500 + k * 50}`).join(' ')} L1280,720 L600,720 Z`} fill={['rgba(70,170,255,0.45)', 'rgba(30,110,230,0.6)', 'rgba(10,60,170,0.75)'][k]} stroke="#e6f6ff" strokeWidth={k === 0 ? 5 : 0} />)}</svg>
      <Bokeh seed={9} c="#d8eeff" x0={640} />
    </AbsoluteFill>
    <Vig a={0.35} /><Zig />
    <Title parts={[['EUROPE', WB], ['UNDERWATER?', IC]]} />
  </>),
  deathdate: (<>
    <AbsoluteFill style={{clipPath: zl}}><Panel bg="red" cx={330} seed={5}><Ball k="JP" s={380} x={320} y={455} e="scared" look={0.6} sweat /></Panel></AbsoluteFill>
    <AbsoluteFill style={{clipPath: zr}}><Map c={WORLD_R} /><AbsoluteFill style={{background: 'radial-gradient(circle at 75% 45%, rgba(255,120,30,0.0) 20%, rgba(80,0,0,0.45) 100%)'}} /><Bokeh seed={10} c="#ffc070" x0={640} /></AbsoluteFill>
    <Vig a={0.35} /><Zig />
    <Ico n="burning-meteor" x={1000} y={330} w={230} c="#ff8a1a" glow="#ffd23f" rot={0} />
    <Title parts={[['DOOMSDAY', RD], ['2033?', GD]]} />
  </>),
  // ---- mapa de colores con bola central ----
  babies: (<>
    <Map c={WORLD} solid /><Speed cx={640} cy={420} seed={12} col="rgba(255,255,255,0.35)" /><Bokeh seed={12} c="#fff6c0" /><Vig />
    <div style={{position: 'absolute', left: 340, top: 120, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,240,180,0.7) 0%, rgba(255,240,180,0) 65%)'}} />
    <Ball k="JP" s={400} x={640} y={450} e="normal" look={0} tears />
    <Ico n="baby-bottle" x={930} y={540} w={160} c="#ffd23f" glow="#fff0a0" rot={18} />
    <Title parts={[['THE LAST', WB], ['HUMAN?', GD]]} />
  </>),
  nosleep: (<>
    <Map c={EUROPE} solid filter="saturate(1.3) brightness(0.8) hue-rotate(20deg)" /><AbsoluteFill style={{background: 'rgba(60,10,120,0.35)', mixBlendMode: 'multiply'}} /><Speed cx={640} cy={420} seed={13} col="rgba(230,210,255,0.35)" /><Bokeh seed={13} c="#e8d8ff" /><Vig />
    <div style={{position: 'absolute', left: 340, top: 120, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,150,255,0.75) 0%, rgba(200,150,255,0) 65%)'}} />
    <Ball k="GB" s={400} x={640} y={450} e="scared" look={0} sweat />
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>{[-1, 1].map((d) => <path key={d} d={`M${640 + d * 68 - 40},${470} Q${640 + d * 68},${500} ${640 + d * 68 + 40},${470}`} fill="none" stroke="#5a2a8a" strokeWidth={12} strokeLinecap="round" />)}</svg>
    <Ico n="alarm-clock" x={930} y={330} w={160} c="#f0e0ff" glow="#b070ff" rot={16} />
    <Title parts={[['NO MORE', WB], ['SLEEP', PU]]} />
  </>),
  gravity: (<>
    <Map c={WORLD} solid /><Speed cx={640} cy={420} seed={14} col="rgba(255,255,255,0.35)" /><Bokeh seed={14} c="#e8e0ff" /><Vig />
    {[['US', 180, 560, 150, 35], ['BR', 1100, 560, 150, -40], ['IN', 1120, 260, 130, 60], ['FR', 170, 270, 120, -50]].map(([c, x, y, s, r]) => <Ball key={c as string} k={c as string} s={s as number} x={x as number} y={y as number} e="scared" rot={r as number} sweat />)}
    <Ball k="JP" s={380} x={640} y={440} e="scared" rot={-24} sweat />
    <Ico n="falling" x={880} y={610} w={140} c="#f0e8ff" glow="#b070ff" rot={20} />
    <Title parts={[['ZERO', WB], ['GRAVITY', PU]]} />
  </>),
  powers: (<>
    <Map c={WORLD} solid /><Speed cx={640} cy={420} seed={15} col="rgba(255,255,255,0.35)" /><Bokeh seed={15} c="#fff3a0" /><Vig />
    <div style={{position: 'absolute', left: 330, top: 130, width: 620, height: 620, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,230,120,0.8) 0%, rgba(255,230,120,0) 65%)'}} />
    <Ball quad={['US', 'CN', 'RU', 'JP']} s={390} x={640} y={460} e="angry" crown />
    <Ico n="fist" x={930} y={560} w={150} c="#ffd23f" glow="#fff0a0" rot={14} />
    <Title parts={[['195', GD], ['SUPERPOWERS', WB]]} />
  </>),
};
export const Thumb5: React.FC<{k: string}> = ({k}) => <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>{T[k]}</AbsoluteFill>;
export const V5_KEYS = ['cold', 'ocean', 'babies', 'heat', 'thirty', 'purge', 'nosleep', 'money', 'deathdate', 'memory', 'gravity', 'power', 'powers'];
