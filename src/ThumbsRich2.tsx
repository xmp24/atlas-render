// 13 miniaturas "$1 vs $1,000,000" sobre la plantilla pobre/rica (Canva aparte)
import React from 'react';
import {AbsoluteFill, Img, staticFile, delayRender, continueRender} from 'remotion';
import {COUNTRIES} from './HexWorld';
import {INK} from './lib3';
import {WorldBg} from './ThumbsMap';
import {Embers, Glow, Rays} from './ThumbsPro';
import {CBall} from './ThumbsCB';
import {Title3D, GOLD, WHITE, REDG, Tracers, Muzzle, Vign, Smoke} from './ThumbsFinal';
import {PT, PGREEN, PGOLD, PRED, PBLUE, Puff, Earth, Speed, Grunge, Anger} from './ThumbsMil';

const W = 1280, H = 720;
const K = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const ALL = COUNTRIES.map((c) => c.c);
const GREENG = 'linear-gradient(180deg, #f2ffe0 0%, #9dff6a 38%, #33d14a 70%, #128a2a 100%)';
const GOLDC = 'linear-gradient(180deg,#fff6b0,#ffc21a 55%,#c27a00)';
const font: React.CSSProperties = {fontFamily: 'Lilita'};

// ---------------- rayo ----------------
const BX = 640;
const BOLT = [[BX + 50, -20], [BX - 10, 302], [BX + 40, 318], [BX - 50, H + 20]];
const boltD = BOLT.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
const LEFT = `polygon(0px 0px, ${BOLT.map((p) => `${p[0]}px ${p[1]}px`).join(', ')}, 0px ${H}px)`;
const RIGHT = `polygon(${BOLT.map((p) => `${p[0]}px ${p[1]}px`).join(', ')}, ${W}px ${H}px, ${W}px 0px)`;
const Bolt: React.FC<{seed?: number}> = ({seed = 3}) => {
  const branch = (i: number) => { const t = 0.12 + rnd(seed * 10 + i) * 0.8; const seg = t < 0.43 ? 0 : t < 0.45 ? 1 : 2; const a = BOLT[seg], b = BOLT[seg + 1]; const u = seg === 1 ? 0.5 : seg === 0 ? t / 0.43 : (t - 0.45) / 0.55;
    const x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u; const d = i % 2 ? 1 : -1; const L = 40 + rnd(i + 30) * 50;
    return `M${x},${y} l${d * L * 0.5},${-L * 0.25} l${d * L * 0.15},${L * 0.3} l${d * L * 0.45},${-L * 0.2}`; };
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <defs><filter id="xbl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter><filter id="xbs" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" /></filter></defs>
      <path d={boltD} transform="translate(-14,0)" stroke="#5fd0ff" strokeWidth={60} fill="none" filter="url(#xbl)" opacity={0.85} />
      <path d={boltD} transform="translate(14,0)" stroke="#ffb030" strokeWidth={60} fill="none" filter="url(#xbl)" opacity={0.85} />
      {Array.from({length: 7}, (_, i) => <path key={i} d={branch(i)} stroke="#e8f8ff" strokeWidth={4} fill="none" strokeLinejoin="round" filter="url(#xbs)" />)}
      {Array.from({length: 7}, (_, i) => <path key={'b' + i} d={branch(i)} stroke="#ffffff" strokeWidth={2} fill="none" strokeLinejoin="round" />)}
      <path d={boltD} stroke={INK} strokeWidth={30} fill="none" strokeLinejoin="miter" />
      <path d={boltD} stroke="#ffffff" strokeWidth={17} fill="none" strokeLinejoin="miter" />
      <path d={boltD} stroke="#bff0ff" strokeWidth={6} fill="none" strokeLinejoin="miter" filter="url(#xbs)" />
      {Array.from({length: 26}, (_, i) => { const y = rnd(i + seed * 3) * H; const x = BX + 30 - (y / H) * 70 + (rnd(i + 7) - 0.5) * 90; return <circle key={'s' + i} cx={x} cy={y} r={1.5 + rnd(i + 3) * 3} fill={i % 2 ? '#c8f2ff' : '#fff6c0'} opacity={0.9} />; })}
    </svg>
  );
};

// ---------------- mapa teñido ----------------
type Cam = {cx: number; cy: number; s: number};
const WCAM: Cam = {cx: 3900, cy: 1700, s: 0.32};
const TINT = {
  blue: {mul: 'radial-gradient(ellipse at 35% 40%, #9fd2ff 0%, #3c86e6 40%, #163f9a 75%, #081a4a 100%)', hi: 'radial-gradient(circle at 28% 52%, rgba(140,210,255,0.55) 0%, rgba(140,210,255,0) 45%)'},
  fire: {mul: 'radial-gradient(ellipse at 70% 100%, #fff3a8 0%, #ffbe1f 18%, #ff6a12 42%, #c3170c 70%, #4a0604 100%)', hi: 'radial-gradient(circle at 74% 55%, rgba(255,200,90,0.55) 0%, rgba(255,200,90,0) 45%)'},
  gold: {mul: 'radial-gradient(ellipse at 50% 50%, #fff2a0 0%, #ffc21a 40%, #b36a00 80%, #4a2a00 100%)', hi: 'radial-gradient(circle at 50% 50%, rgba(255,240,170,0.5) 0%, rgba(255,240,170,0) 50%)'},
  vblue: {mul: 'radial-gradient(ellipse at 32% 48%, #e4f6ff 0%, #6cc6ff 30%, #1f7bff 60%, #0b36c8 85%, #061a6e 100%)', hi: 'radial-gradient(circle at 28% 50%, rgba(170,235,255,0.75) 0%, rgba(120,210,255,0) 48%)'},
  vfire: {mul: 'radial-gradient(ellipse at 74% 70%, #ffe680 0%, #ffa21a 16%, #ff5a10 40%, #e81c0a 66%, #6e0603 100%)', hi: 'radial-gradient(circle at 76% 58%, rgba(255,190,60,0.6) 0%, rgba(255,120,30,0) 40%)'},
  night: {mul: 'radial-gradient(ellipse at 50% 40%, #5a6b8a 0%, #2a3550 50%, #0c1020 100%)', hi: 'radial-gradient(circle at 50% 45%, rgba(160,190,255,0.25) 0%, rgba(160,190,255,0) 50%)'},
} as const;
const TMap: React.FC<{cam?: Cam; tint: keyof typeof TINT; blur?: number; br?: number}> = ({cam = WCAM, tint, blur = 1.4, br = 1.05}) => (
  <AbsoluteFill>
    <div style={{position: 'absolute', inset: 0, filter: `grayscale(1) contrast(1.45) brightness(${br})`}}><WorldBg cam={cam} skip={ALL} blur={blur} /></div>
    <AbsoluteFill style={{background: TINT[tint].mul, mixBlendMode: 'multiply'}} />
    <AbsoluteFill style={{background: TINT[tint].hi, mixBlendMode: 'screen'}} />
    <Grain id={tint + (cam.cx | 0)} />
  </AbsoluteFill>
);
const Grain: React.FC<{id: string}> = ({id}) => (
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, mixBlendMode: 'overlay', opacity: 0.35}}>
    <filter id={`gr${id}`}><feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves={4} seed={5} /><feColorMatrix type="saturate" values="0" /></filter>
    <rect width={W} height={H} filter={`url(#gr${id})`} />
  </svg>
);
const Rain: React.FC<{x0?: number; x1?: number}> = ({x0 = -20, x1 = 680}) => <>{Array.from({length: 32}, (_, i) => <div key={i} style={{position: 'absolute', left: x0 + rnd(i) * (x1 - x0), top: rnd(i + 50) * 720, width: 3, height: 26 + rnd(i + 9) * 18, background: 'rgba(210,235,255,0.45)', transform: 'rotate(16deg)', borderRadius: 3}} />)}</>;
const Flames: React.FC<{x0?: number; n?: number}> = ({x0 = 560, n = 10}) => (
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: 0.5, filter: 'blur(6px)'}}>
    {Array.from({length: n}, (_, i) => { const x = x0 + i * 75, h = 160 + rnd(i + 3) * 240; return <path key={i} d={`M${x},${H} Q${x + 30},${H - h * 0.6} ${x + 45},${H - h} Q${x + 70},${H - h * 0.55} ${x + 95},${H} Z`} fill="#ffd25a" />; })}
  </svg>
);
// fondo partido: mapa azul | mapa fuego
const SplitMap: React.FC<{cam?: Cam}> = ({cam}) => (<>
  <AbsoluteFill style={{clipPath: LEFT}}><TMap cam={cam} tint="blue" /><Rain />
    <div style={{position: 'absolute', left: -40, right: 560, top: -90, height: 220, background: 'radial-gradient(ellipse at 30% 60%, rgba(10,20,50,0.75) 0%, rgba(10,20,50,0) 55%), radial-gradient(ellipse at 75% 50%, rgba(10,20,50,0.7) 0%, rgba(10,20,50,0) 55%)', filter: 'blur(6px)'}} />
  </AbsoluteFill>
  <AbsoluteFill style={{clipPath: RIGHT}}><TMap cam={cam} tint="fire" /><Flames /></AbsoluteFill>
</>);

// ---------------- personajes ----------------
const POOR = 'hw/mil/poor.png', RICH = 'hw/mil/rich.png';
const Cut: React.FC<{src: string; x: number; y: number; w: number; flip?: boolean; rim: string; rot?: number; gray?: boolean}> = ({src, x, y, w, flip, rim, rot = 0, gray}) => (
  <Img src={staticFile(src)} style={{position: 'absolute', left: x - w / 2, top: y, width: w, transform: `rotate(${rot}deg) ${flip ? 'scaleX(-1)' : ''}`, filter: `${gray ? 'grayscale(0.7) brightness(0.8) ' : ''}drop-shadow(0 0 3px ${INK}) drop-shadow(0 0 14px ${rim}) drop-shadow(0 14px 14px rgba(0,0,0,0.55))`}} />
);
const Poor: React.FC<{x: number; y: number; w: number; rot?: number; gray?: boolean}> = (p) => <Cut src={POOR} rim="rgba(150,210,255,0.8)" {...p} />;
const Rich: React.FC<{x: number; y: number; w: number; flip?: boolean; rot?: number}> = ({flip = true, ...p}) => <Cut src={RICH} rim="rgba(255,200,90,0.9)" flip={flip} {...p} />;
// fogonazo en la punta del fusil de la rica (girada) según su posición/ancho
const Shot: React.FC<{x: number; y: number; w: number; to?: [number, number]}> = ({x, y, w, to}) => { const mx = x - w / 2 + w * 0.0, my = y + w * 0.6; return (<><Muzzle x={mx - 6} y={my} s={w * 0.15} />{to && <Tracers from={[mx - 10, my]} to={to} n={3} />}</>); };
const Ico: React.FC<{n: string; x: number; y: number; w: number; c?: string; rot?: number; flip?: boolean}> = ({n, x, y, w, c = GOLDC, rot = 0, flip}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - w / 2, width: w, height: w, transform: `rotate(${rot}deg) scaleX(${flip ? -1 : 1})`, filter: `drop-shadow(0 0 2px ${INK}) drop-shadow(0 0 2px ${INK}) drop-shadow(0 0 2px ${INK}) drop-shadow(0 8px 8px rgba(0,0,0,0.55))`}}>
    <div style={{width: '100%', height: '100%', background: c, WebkitMaskImage: `url(${staticFile(`hw/icons/${n}.svg`)})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center'}} />
  </div>
);
const Coin: React.FC<{x: number; y: number; r: number; rot?: number; t?: string}> = ({x, y, r, rot = 0, t = '$'}) => (
  <svg width={r * 2} height={r * 2} style={{position: 'absolute', left: x - r, top: y - r, overflow: 'visible', transform: `rotate(${rot}deg)`, filter: 'drop-shadow(0 6px 5px rgba(0,0,0,0.5))'}}><circle cx={r} cy={r} r={r * 0.95} fill="#ffcf2e" stroke={INK} strokeWidth={r * 0.1} /><circle cx={r} cy={r} r={r * 0.7} fill="none" stroke="#c98a00" strokeWidth={r * 0.07} /><text x={r} y={r * 1.33} textAnchor="middle" fontSize={r * (t.length > 1 ? 0.75 : 1.0)} style={font} fill="#a86b00">{t}</text></svg>
);
const Bill: React.FC<{x: number; y: number; w: number; rot?: number}> = ({x, y, w, rot = 0}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - w * 0.24, width: w, height: w * 0.48, transform: `rotate(${rot}deg)`, background: 'linear-gradient(180deg,#a8e8a0,#5cbf5a)', border: `${w * 0.035}px solid ${INK}`, borderRadius: w * 0.04, boxShadow: '0 6px 8px rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <div style={{width: w * 0.32, height: w * 0.32, borderRadius: '50%', border: `${w * 0.025}px solid #2d7a2c`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: w * 0.22, color: '#2d7a2c'}}>$</div>
  </div>
);
const Stack: React.FC<{x: number; y: number; w: number; n: number}> = ({x, y, w, n}) => <>{Array.from({length: n}, (_, i) => <div key={i} style={{position: 'absolute', left: x - w / 2, top: y - i * w * 0.09, width: w, height: w * 0.16, background: 'linear-gradient(180deg,#a8e8a0,#4fae4d)', border: `${w * 0.025}px solid ${INK}`, borderRadius: w * 0.03}} />)}</>;
const GoldBar: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => (
  <svg width={w} height={w * 0.5} style={{position: 'absolute', left: x - w / 2, top: y, overflow: 'visible', filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.5))'}}><path d={`M${w * 0.15},0 L${w * 0.85},0 L${w},${w * 0.42} L0,${w * 0.42} Z`} fill="#ffc21a" stroke={INK} strokeWidth={w * 0.04} /><path d={`M${w * 0.2},${w * 0.05} L${w * 0.8},${w * 0.05} L${w * 0.86},${w * 0.17} L${w * 0.14},${w * 0.17} Z`} fill="#fff2a0" /></svg>
);
const Arrow: React.FC<{x: number; y: number; w: number; rot: number; c?: string}> = ({x, y, w, rot, c = '#ff2a2a'}) => (
  <svg width={w} height={w * 0.6} style={{position: 'absolute', left: x, top: y, overflow: 'visible', transform: `rotate(${rot}deg)`, transformOrigin: '0 50%', filter: 'drop-shadow(0 8px 8px rgba(0,0,0,0.5))'}}>
    <path d={`M 0 ${w * 0.22} L ${w * 0.62} ${w * 0.22} L ${w * 0.62} ${w * 0.04} L ${w} ${w * 0.3} L ${w * 0.62} ${w * 0.56} L ${w * 0.62} ${w * 0.38} L 0 ${w * 0.38} Z`} fill={c} stroke="#fff" strokeWidth={w * 0.035} strokeLinejoin="round" />
  </svg>
);
const Ring: React.FC<{x: number; y: number; rx: number; ry: number; rot?: number}> = ({x, y, rx, ry, rot = -8}) => (
  <svg width={rx * 2 + 40} height={ry * 2 + 40} style={{position: 'absolute', left: x - rx - 20, top: y - ry - 20, overflow: 'visible', transform: `rotate(${rot}deg)`, filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.6))'}}>
    <ellipse cx={rx + 20} cy={ry + 20} rx={rx} ry={ry} fill="none" stroke="#fff" strokeWidth={22} /><ellipse cx={rx + 20} cy={ry + 20} rx={rx} ry={ry} fill="none" stroke="#ff2020" strokeWidth={13} />
  </svg>
);
// píldora de texto (estilo MrBeast)
const Txt: React.FC<{t: string; x: number; y: number; s: number; c?: string; rot?: number; anchor?: 'c' | 'l'}> = ({t, x, y, s, c = '#fff', rot = 0, anchor = 'c'}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(${anchor === 'c' ? '-50%' : '0'},0) rotate(${rot}deg)`, ...font, fontSize: s, lineHeight: 1, color: c, whiteSpace: 'nowrap', WebkitTextStroke: `${s * 0.12}px ${INK}`, paintOrder: 'stroke fill', filter: `drop-shadow(0 ${s * 0.06}px 0 ${INK}) drop-shadow(0 ${s * 0.08}px ${s * 0.1}px rgba(0,0,0,0.6))`}}>{t}</div>
);
const MCB: React.FC<{x: number; y: number; s: number; eyes: any; look?: number; crown?: boolean; helmet?: boolean; sweat?: boolean; rim?: string; tears?: boolean; gray?: boolean}> = ({x, y, s, ...p}) => <CBall k={K('MC')} size={s} x={x} y={y} {...p} />;


// ---------- f1 con colores llamativos ----------
const PopSplit: React.FC<{lv: number}> = ({lv}) => (<>
  <AbsoluteFill style={{clipPath: LEFT, filter: `saturate(${1.2 + lv * 0.15}) contrast(1.08)`}}><TMap tint="vblue" br={1.25 + lv * 0.1} /><Rain />
    <AbsoluteFill style={{background: 'radial-gradient(circle at 28% 55%, rgba(255,255,255,0.0) 0%, rgba(0,20,90,0.0) 40%, rgba(0,10,60,0.55) 100%)'}} /></AbsoluteFill>
  <AbsoluteFill style={{clipPath: RIGHT, filter: `saturate(${1.25 + lv * 0.15}) contrast(1.08)`}}><TMap tint="vfire" br={1.25 + lv * 0.1} /><Flames n={10} />
    <AbsoluteFill style={{background: 'radial-gradient(circle at 76% 55%, rgba(255,255,255,0) 0%, rgba(90,0,0,0) 40%, rgba(70,0,0,0.5) 100%)'}} /></AbsoluteFill>
</>);
const PopF1: React.FC<{lv: number; rays?: boolean; money?: boolean}> = ({lv, rays, money}) => (<>
  <PopSplit lv={lv} />
  {rays && <Rays x={985} y={420} c="rgba(255,220,150,0.45)" a={0.5} n={22} />}
  {rays && <Rays x={315} y={420} c="rgba(200,240,255,0.4)" a={0.5} n={22} />}
  <Embers n={50} seed={42} c="#ffe27a" />
  <Glow x={315} y={420} r={300} c={`rgba(140,225,255,${0.55 + lv * 0.1})`} />
  <Glow x={985} y={410} r={300} c={`rgba(255,150,40,${0.55 + lv * 0.1})`} />
  {money && <>{Array.from({length: 8}, (_, i) => <Bill key={i} x={760 + rnd(i + 2) * 470} y={140 + rnd(i + 21) * 520} w={80 + rnd(i + 5) * 40} rot={-40 + rnd(i + 13) * 80} />)}<GoldBar x={1170} y={620} w={130} /><GoldBar x={800} y={630} w={120} /></>}
  <div style={{position: 'absolute', inset: 0, filter: 'saturate(1.2) contrast(1.06) drop-shadow(0 0 4px #ffffff) drop-shadow(0 0 22px #6fd6ff)'}}><Poor x={315} y={170} w={440} /></div>
  <div style={{position: 'absolute', inset: 0, filter: 'saturate(1.25) contrast(1.08) brightness(1.08) drop-shadow(0 0 4px #fff3b0) drop-shadow(0 0 24px #ffb02a)'}}><Rich x={985} y={170} w={520} /></div>
  <Shot x={985} y={170} w={520} to={[560, 430]} />
  <Bolt />
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 62%, rgba(0,0,0,0.35) 100%)'}} />
  <Title3D text="$1" x={315} y={8} size={168} grad="linear-gradient(180deg,#ffffff 0%,#b8ff6a 30%,#2dff4a 62%,#00b02a 100%)" glow="rgba(60,255,100,0.95)" />
  <Title3D text="$1,000,000" x={985} y={28} size={94} grad="linear-gradient(180deg,#ffffff 0%,#fff36a 30%,#ffc000 62%,#ff7a00 100%)" glow="rgba(255,210,40,1)" rot={-1} />
</>);

// ---------- fondo estilo "Indonesia vs The World": color plano + textura + mapa suave + líneas de velocidad ----------
const FlatSide: React.FC<{c1: string; c2: string; cx: number; id: string; mapOp?: number; img?: {op: number; blend: any}}> = ({c1, c2, cx, id, mapOp = 0.32, img}) => (
  <AbsoluteFill style={{background: `radial-gradient(circle at ${cx}px 380px, ${c1} 0%, ${c2} 105%)`}}>
    {img ? <Img src={staticFile('hw/mil/eurasia.png')} style={{position: 'absolute', left: 0, top: 0, width: W, height: H, objectFit: 'cover', opacity: img.op, mixBlendMode: img.blend}} />
      : <div style={{position: 'absolute', inset: 0, opacity: mapOp, mixBlendMode: 'soft-light', filter: 'grayscale(1) contrast(1.6) brightness(1.3)'}}><WorldBg cam={{cx: 3880, cy: 1850, s: 0.3}} skip={ALL} blur={1.6} /></div>}
    <Grunge id={id} />
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, mixBlendMode: 'multiply', opacity: 0.35}}>
      <filter id={`bl${id}`}><feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves={3} seed={11} /><feColorMatrix type="matrix" values="0 0 0 0 0.2  0 0 0 0 0.2  0 0 0 0 0.3  0 0 0 1.4 -0.45" /></filter>
      <rect width={W} height={H} filter={`url(#bl${id})`} />
    </svg>
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      {Array.from({length: 30}, (_, i) => { const a = (i / 30) * Math.PI * 2 + rnd(i + cx) * 0.15; const r0 = 300 + rnd(i * 3 + cx) * 80; const len = 160 + rnd(i * 7 + cx) * 160; const w = 6 + rnd(i * 5 + cx) * 7;
        const ux = Math.cos(a) * 1.25, uy = Math.sin(a), px = -Math.sin(a), py = Math.cos(a); const x0 = cx + ux * r0, y0 = 380 + uy * r0, x1 = cx + ux * (r0 + len), y1 = 380 + uy * (r0 + len);
        return <path key={i} d={`M${x0},${y0} L${x1 + px * w},${y1 + py * w} L${x1 - px * w},${y1 - py * w} Z`} fill="#ffffff" opacity={0.75} />; })}
    </svg>
  </AbsoluteFill>
);
const IndoF1: React.FC<{v: number; img?: {op: number; blend: any}}> = ({v, img}) => {
  const L = v === 2 ? ['#56b4ff', '#1446a8'] : ['#4aa2f0', '#1a4fa0'];
  const R = v === 1 ? ['#ffb02a', '#d4280c'] : ['#ff7a2a', '#b81a0a'];
  return (<>
    <AbsoluteFill style={{clipPath: LEFT}}><FlatSide c1={L[0]} c2={L[1]} cx={315} id={'fl' + v + (img ? 'e' : '')} img={img} /></AbsoluteFill>
    <AbsoluteFill style={{clipPath: RIGHT}}><FlatSide c1={R[0]} c2={R[1]} cx={985} id={'fr' + v + (img ? 'e' : '')} img={img} /></AbsoluteFill>
    <Embers n={30} seed={42} c="#ffe27a" />
    <Glow x={315} y={420} r={280} c="rgba(170,230,255,0.45)" />
    <Glow x={985} y={410} r={290} c="rgba(255,200,80,0.5)" />
    {v >= 1 && <><Puff x={110} y={300} s={80} /><Puff x={1200} y={260} s={85} /><Puff x={760} y={230} s={70} /></>}
    {v >= 1 && <Anger x={1210} y={150} s={90} rot={25} />}
    <div style={{position: 'absolute', inset: 0, filter: 'saturate(1.15) drop-shadow(0 0 4px #ffffff) drop-shadow(0 0 20px #8fdcff)'}}><Poor x={315} y={170} w={440} /></div>
    <div style={{position: 'absolute', inset: 0, filter: 'saturate(1.2) brightness(1.06) drop-shadow(0 0 4px #ffe9a0) drop-shadow(0 0 22px #ff4a2a)'}}><Rich x={985} y={170} w={520} /></div>
    <Shot x={985} y={170} w={520} to={[560, 430]} />
    <Bolt />
    <Title3D text="$1" x={315} y={8} size={168} grad="linear-gradient(180deg,#ffffff 0%,#b8ff6a 30%,#2dff4a 62%,#00b02a 100%)" glow="rgba(60,255,100,0.8)" />
    <Title3D text="$1,000,000" x={985} y={28} size={94} grad="linear-gradient(180deg,#ffffff 0%,#fff36a 30%,#ffc000 62%,#ff7a00 100%)" glow="rgba(255,210,40,0.9)" rot={-1} />
  </>);
};
// ===================================================================
const T: Record<string, React.ReactNode> = {
  // ---------- FIELES (plantilla + mapa) ----------
  e1: <IndoF1 v={0} img={{op: 0.22, blend: 'normal'}} />,
  e2: <IndoF1 v={0} img={{op: 0.32, blend: 'normal'}} />,
  e3: <IndoF1 v={0} img={{op: 0.45, blend: 'luminosity'}} />,
  i1: <IndoF1 v={0} />,
  i2: <IndoF1 v={1} />,
  i3: <IndoF1 v={2} />,
  p1: <PopF1 lv={0} />,
  p2: <PopF1 lv={1} rays />,
  p3: <PopF1 lv={2} rays money />,
  f1: (<>
    <SplitMap />
    <Embers n={34} seed={42} c="#ffd27a" />
    <Glow x={315} y={420} r={280} c="rgba(140,200,255,0.35)" /><Glow x={975} y={400} r={300} c="rgba(255,190,70,0.5)" />
    <Smoke list={[[1160, 660, 110], [820, 670, 90]]} />
    <Poor x={315} y={170} w={430} />
    <Rich x={985} y={170} w={510} />
    <Shot x={985} y={170} w={510} to={[560, 430]} />
    <Bolt /><Vign />
    <Title3D text="$1" x={315} y={10} size={160} grad={GREENG} glow="rgba(80,255,120,0.7)" />
    <Title3D text="$1,000,000" x={985} y={30} size={92} grad={GOLD} glow="rgba(255,190,40,0.85)" rot={-1} />
  </>),
  f2: (<>
    <SplitMap cam={{cx: 3960, cy: 1420, s: 1.1}} />
    <Embers n={40} seed={7} c="#ffd27a" />
    <Glow x={300} y={430} r={300} c="rgba(140,200,255,0.4)" /><Glow x={990} y={420} r={320} c="rgba(255,190,70,0.55)" />
    <Poor x={300} y={190} w={450} />
    <Rich x={990} y={190} w={540} />
    <Shot x={990} y={190} w={540} to={[540, 440]} />
    <Bolt seed={6} /><Vign />
    <Title3D text="$1 ARMY" x={300} y={18} size={110} grad={GREENG} glow="rgba(80,255,120,0.7)" />
    <Title3D text="$1,000,000" x={985} y={24} size={92} grad={GOLD} glow="rgba(255,190,40,0.85)" rot={-1} />
    <Title3D text="ARMY" x={1070} y={600} size={96} grad={REDG} glow="rgba(255,60,40,0.85)" rot={-3} />
  </>),
  f3: (<>
    <SplitMap />
    <Embers n={44} seed={11} c="#ffd27a" />
    <Rays x={990} y={440} c="rgba(255,236,160,0.45)" a={0.5} n={20} />
    <Glow x={990} y={430} r={330} c="rgba(255,200,80,0.6)" />
    {[[1180, 230, 140, 'jet-fighter', -22, false], [790, 220, 120, 'jet-fighter', -12, true]].map(([x, y, w, n, r, f]: any, i) => <Ico key={i} n={n} x={x} y={y} w={w} rot={r} flip={f} />)}
    <Stack x={1180} y={640} w={120} n={7} /><GoldBar x={810} y={630} w={130} /><GoldBar x={880} y={660} w={120} />
    <Ico n="battle-tank" x={1185} y={520} w={150} />
    <Poor x={315} y={200} w={410} gray />
    <Coin x={140} y={640} r={44} rot={-14} t="1" />
    <Rich x={990} y={190} w={500} />
    <Shot x={990} y={190} w={500} />
    <Bolt seed={9} /><Vign />
    <Title3D text="$1" x={315} y={20} size={160} grad={GREENG} glow="rgba(80,255,120,0.7)" />
    <Title3D text="$1,000,000" x={985} y={30} size={92} grad={GOLD} glow="rgba(255,190,40,0.85)" rot={-1} />
  </>),

  // ---------- IDEAS PROPIAS ----------
  // escalera del dinero: la pobre abajo, la rica arriba del todo
  o1: (<>
    <TMap tint="night" cam={{cx: 3900, cy: 1500, s: 0.6}} />
    <Rays x={1090} y={260} c="rgba(255,226,140,0.35)" a={0.45} />
    <Glow x={1090} y={260} r={320} c="rgba(255,200,80,0.5)" />
    {[['$1', '#9aa3ad'], ['$1,000', '#5fc35a'], ['$100K', '#3aa0ff'], ['$1,000,000', '#ffc21a']].map(([l, c], i) => (
      <React.Fragment key={l}>
        <div style={{position: 'absolute', left: 40 + i * 300, top: 600 - i * 130, width: 300, height: 140 + i * 130, background: `linear-gradient(180deg, ${c}, rgba(0,0,0,0.35))`, border: `6px solid ${INK}`, borderRadius: 10, boxShadow: '0 10px 20px rgba(0,0,0,0.5)'}} />
        <Txt t={l} x={190 + i * 300} y={640} s={i === 3 ? 54 : 62} c={i === 3 ? '#fff6b0' : '#fff'} />
      </React.Fragment>))}
    <Poor x={180} y={430} w={210} />
    <MCB x={500} y={410} s={130} eyes="normal" look={0.4} helmet />
    <MCB x={810} y={280} s={140} eyes="angry" look={0.4} helmet />
    <Ico n="battle-tank" x={900} y={400} w={100} c="linear-gradient(#cfe6ff,#3a7bd5)" />
    <Rich x={1090} y={150} w={290} />
    <Arrow x={110} y={170} w={260} rot={-22} c="#2ee05a" />
    <Vign />
    <Title3D text="$1 → $1,000,000" x={430} y={40} size={84} grad={WHITE} glow="rgba(255,255,255,0.5)" />
  </>),
  // mapa real: Mónaco diminuto señalado vs la rica gigante sobre Francia
  o2: (<>
    <AbsoluteFill style={{clipPath: LEFT}}><TMap tint="blue" cam={{cx: 3940, cy: 1340, s: 3.4}} blur={0.6} /></AbsoluteFill>
    <AbsoluteFill style={{clipPath: RIGHT}}><TMap tint="fire" cam={{cx: 3940, cy: 1340, s: 3.4}} blur={0.6} /><Flames /></AbsoluteFill>
    <Embers n={30} seed={13} c="#ffd27a" />
    <Ring x={330} y={520} rx={120} ry={90} />
    <Poor x={330} y={440} w={150} />
    <Txt t="MONACO" x={330} y={630} s={44} />
    <Arrow x={70} y={250} w={220} rot={40} />
    <Glow x={980} y={420} r={330} c="rgba(255,190,70,0.55)" />
    <Rich x={985} y={170} w={540} />
    <Shot x={985} y={170} w={540} to={[470, 500]} />
    <Bolt seed={5} /><Vign />
    <Title3D text="$1" x={330} y={20} size={170} grad={GREENG} glow="rgba(80,255,120,0.7)" />
    <Title3D text="$1,000,000" x={985} y={30} size={92} grad={GOLD} glow="rgba(255,190,40,0.85)" rot={-1} />
  </>),
  // etiquetas de precio colgando + "WHO WINS?"
  o3: (<>
    <SplitMap />
    <Embers n={30} seed={21} c="#ffd27a" />
    <Glow x={300} y={420} r={280} c="rgba(140,200,255,0.35)" /><Glow x={990} y={400} r={300} c="rgba(255,190,70,0.5)" />
    <Poor x={300} y={150} w={430} />
    <Rich x={990} y={140} w={520} />
    <Shot x={990} y={140} w={520} />
    {[[300, 90, '$1', '#e9f3ff', -10], [990, 80, '$1,000,000', '#fff2b0', 8]].map(([x, y, t, bg, r]: any) => (
      <div key={t} style={{position: 'absolute', left: x - (t.length > 3 ? 250 : 110), top: y, transform: `rotate(${r}deg)`, transformOrigin: '50% 0'}}>
        <div style={{position: 'relative', padding: '10px 34px 10px 64px', background: bg, border: `7px solid ${INK}`, borderRadius: '18px 18px 18px 18px', clipPath: 'polygon(14% 0,100% 0,100% 100%,14% 100%,0 50%)', ...font, fontSize: t.length > 3 ? 68 : 96, lineHeight: 1, color: t.length > 3 ? '#c27a00' : '#1a9a32'}}>
          <div style={{position: 'absolute', left: 30, top: '50%', width: 22, height: 22, marginTop: -11, borderRadius: '50%', background: INK}} />{t}
        </div>
      </div>))}
    <Bolt seed={2} /><Vign />
    <Title3D text="WHO WINS?" y={598} size={100} grad={REDG} glow="rgba(255,60,40,0.85)" />
  </>),

  // ---------- REFERENCIAS DE OTROS CANALES ----------
  // R1 · MrBeast "$1 vs $1,000,000": fondo limpio y saturado, texto blanco grueso, flecha roja
  r1: (<>
    <AbsoluteFill style={{clipPath: LEFT, background: 'linear-gradient(160deg,#5ab0ff,#1a5fd0)'}} />
    <AbsoluteFill style={{clipPath: RIGHT, background: 'linear-gradient(200deg,#ffd84a,#ff8a00)'}} />
    <Rays x={990} y={420} c="rgba(255,255,255,0.35)" a={0.5} />
    <Poor x={310} y={200} w={450} />
    {Array.from({length: 9}, (_, i) => <Bill key={i} x={760 + rnd(i) * 480} y={120 + rnd(i + 3) * 520} w={90 + rnd(i + 7) * 40} rot={-40 + rnd(i + 11) * 80} />)}
    <Rich x={990} y={190} w={540} />
    <Arrow x={540} y={560} w={200} rot={-25} />
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H}}><svg width={W} height={H}><path d={boltD} stroke="#fff" strokeWidth={16} fill="none" /></svg></div>
    <Txt t="$1" x={310} y={24} s={150} />
    <Txt t="$1,000,000" x={985} y={36} s={104} c="#fff" />
  </>),
  // R2 · MrBeast niveles (cuadrícula de 4: $1 → $1M)
  r2: (<>
    {[['#3a6fd6', 0], ['#2a9a4a', 1], ['#8a3ad6', 2], ['#ff9a0a', 3]].map(([c, i]: any) => (
      <div key={i} style={{position: 'absolute', left: (i % 2) * 640, top: Math.floor(i / 2) * 360, width: 640, height: 360, background: `radial-gradient(circle at 50% 55%, ${c}, #111 120%)`, overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, filter: 'grayscale(1) brightness(0.6)', opacity: 0.35, mixBlendMode: 'screen'}}><WorldBg cam={{cx: 3900 + i * 60, cy: 1500, s: 0.6}} skip={ALL} blur={2} /></div>
      </div>))}
    <Poor x={320} y={20} w={250} />
    {[0, 1, 2, 3, 4].map((j) => <CBall key={j} k={K('MC')} size={105} x={760 + j * 95} y={175 - (j % 2) * 40} eyes="angry" look={0.3} helmet />)}
    {[0, 1, 2].map((j) => <CBall key={'c' + j} k={K('MC')} size={95} x={110 + j * 85} y={540 - (j % 2) * 30} eyes="angry" look={0.3} helmet />)}
    <Ico n="battle-tank" x={430} y={540} w={170} c="linear-gradient(#cfe6ff,#3a7bd5)" /><Ico n="jet-fighter" x={540} y={430} w={110} c="linear-gradient(#cfe6ff,#3a7bd5)" rot={-20} />
    <Glow x={960} y={520} r={220} c="rgba(255,220,90,0.6)" />
    <Ico n="carrier" x={1170} y={600} w={150} /><Ico n="jet-fighter" x={1190} y={430} w={110} rot={-20} /><Ico n="battle-tank" x={750} y={600} w={130} />
    <Rich x={960} y={375} w={290} />
    <div style={{position: 'absolute', left: 636, top: 0, width: 8, height: H, background: INK}} /><div style={{position: 'absolute', left: 0, top: 356, width: W, height: 8, background: INK}} />
    {[['$1', 320, 282], ['$1,000', 960, 282], ['$100,000', 320, 642], ['$1,000,000', 960, 642]].map(([t, x, y]: any) => <Txt key={t} t={t} x={x} y={y} s={64} />)}
  </>),
  // R3 · Ryan Trahan (reto del penique): moneda gigante + ruta punteada sobre el mapa
  r3: (<>
    <TMap tint="blue" cam={{cx: 3920, cy: 1330, s: 1.6}} blur={0.8} />
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><path d="M260,560 C420,520 520,360 700,330 S1000,200 1130,150" fill="none" stroke="#fff" strokeWidth={12} strokeDasharray="4 26" strokeLinecap="round" style={{filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.7))'}} /></svg>
    <Ico n="crown" x={1140} y={140} w={130} />
    <Coin x={260} y={430} r={150} t="$1" />
    <Poor x={430} y={360} w={260} rot={6} />
    <div style={{position: 'absolute', left: 640, top: 380, width: 600, padding: '14px 26px', background: '#fff', border: `7px solid ${INK}`, borderRadius: 20, transform: 'rotate(-3deg)', ...font, fontSize: 64, lineHeight: 1.05, color: INK, boxShadow: '0 12px 0 rgba(0,0,0,0.35)'}}>STARTING WITH <span style={{color: '#1a9a32'}}>$1</span>,<br />CONQUER THE WORLD?</div>
    <Vign />
  </>),
  // R4 · Johnny Harris (mapa explicado): mapa oscuro, círculos rojos, líneas y fichas
  r4: (<>
    <TMap tint="night" cam={{cx: 3920, cy: 1310, s: 4}} blur={0.4} />
    <AbsoluteFill style={{background: 'radial-gradient(circle at 46% 58%, rgba(0,0,0,0) 15%, rgba(0,0,0,0.6) 80%)'}} />
    <Ring x={600} y={470} rx={60} ry={45} rot={0} />
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><path d="M600,470 L330,250" stroke="#ff3030" strokeWidth={6} /><path d="M600,470 L940,250" stroke="#ffc21a" strokeWidth={6} /><circle cx={600} cy={470} r={10} fill="#ff3030" /></svg>
    {[[200, 70, '#2f7fd6', POOR, '$1'], [800, 70, '#e8a33a', RICH, '$1,000,000']].map(([x, y, c, src, t]: any) => (
      <div key={t} style={{position: 'absolute', left: x, top: y, width: 300, height: 300, background: '#f3efe6', border: `8px solid ${INK}`, boxShadow: '0 14px 24px rgba(0,0,0,0.6)', transform: `rotate(${x < 500 ? -4 : 4}deg)`, overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 55%, ${c}, #222 130%)`}} />
        <Img src={staticFile(src)} style={{position: 'absolute', left: 30, top: 20, width: 240, transform: src === RICH ? 'scaleX(-1)' : undefined}} />
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, background: INK, color: '#fff', ...font, fontSize: 48, textAlign: 'center', padding: '4px 0'}}>{t}</div>
      </div>))}
    <Txt t="MONACO" x={600} y={540} s={40} c="#ffecec" />
    <Txt t="WHICH ARMY WINS?" x={640} y={600} s={88} c="#fff" />
  </>),
  // R5 · simuladores de batalla (TABS/Epic Battle): 1 soldado frente a un enjambre
  r5: (<>
    <TMap tint="fire" cam={{cx: 3900, cy: 1420, s: 2.4}} blur={1} />
    <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(10,40,120,0.85) 0%, rgba(10,40,120,0.4) 35%, rgba(0,0,0,0) 55%)'}} />
    {Array.from({length: 50}, (_, i) => { const x = 620 + (i % 10) * 64 + (Math.floor(i / 10) % 2) * 30, y = 210 + Math.floor(i / 10) * 92; return <CBall key={i} k={K('MC')} size={64} x={x} y={y} eyes="angry" look={-0.6} helmet />; })}
    {[[700, 160, 'jet-fighter'], [1220, 640, 'jet-fighter'], [720, 660, 'helicopter']].map(([x, y, n]: any, i) => <Ico key={i} n={n} x={x} y={y} w={110} c="linear-gradient(#555,#111)" flip={n !== 'helicopter'} rot={n === 'jet-fighter' ? -20 : 0} />)}
    <Poor x={250} y={250} w={330} />
    <Tracers from={[620, 420]} to={[420, 430]} n={4} />
    <Txt t="1" x={250} y={30} s={170} c="#7cff7c" />
    <Txt t="1,000,000$" x={960} y={14} s={100} c="#ffd21f" />
    <Txt t="VS" x={520} y={140} s={90} c="#ff3b30" rot={-8} />
    <Vign />
  </>),
  // R6 · estilo "Bright Side": círculo rojo, signo de interrogación, texto amarillo
  r6: (<>
    <SplitMap />
    <Poor x={300} y={190} w={440} />
    <Rich x={990} y={180} w={520} />
    <Ring x={300} y={420} rx={240} ry={230} rot={0} />
    <div style={{position: 'absolute', left: 520, top: 110, ...font, fontSize: 300, color: '#ffd21f', WebkitTextStroke: `20px ${INK}`, paintOrder: 'stroke fill', transform: 'rotate(10deg)', filter: 'drop-shadow(0 12px 10px rgba(0,0,0,0.6))'}}>?</div>
    <Bolt seed={8} />
    <Txt t="CAN $1 BEAT $1,000,000?" x={640} y={18} s={78} c="#ffe14a" />
    <Vign />
  </>),
  // R7 · ticket de compra (estilo "I spent $1,000,000 on..."): recibo largo + la rica
  r7: (<>
    <TMap tint="gold" cam={{cx: 3900, cy: 1500, s: 0.8}} />
    <Rays x={960} y={420} c="rgba(255,255,255,0.35)" a={0.4} />
    <div style={{position: 'absolute', left: 70, top: 40, width: 430, height: 700, background: '#fbfbf6', transform: 'rotate(-6deg)', boxShadow: '0 20px 30px rgba(0,0,0,0.5)', border: `6px solid ${INK}`, padding: '20px 26px', fontFamily: 'monospace', fontSize: 34, color: '#222', lineHeight: 1.35}}>
      <div style={{...font, fontSize: 46, textAlign: 'center', marginBottom: 8}}>MONACO ARMY</div>
      {[['TANKS', '$420K'], ['JETS', '$310K'], ['SHIPS', '$180K'], ['SOLDIERS', '$89K'], ['BROOM', '$1']].map(([a, b]) => <div key={a} style={{display: 'flex', justifyContent: 'space-between'}}><span>{a}</span><span>{b}</span></div>)}
      <div style={{borderTop: '4px dashed #222', marginTop: 10, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 40}}><span>TOTAL</span><span style={{color: '#c00'}}>$1,000,001</span></div>
    </div>
    <Rich x={930} y={150} w={560} />
    <Poor x={1170} y={480} w={200} rot={8} />
    <Txt t="$1" x={1200} y={430} s={64} c="#7cff7c" />
    <Txt t="I SPENT $1,000,000" x={900} y={20} s={80} c="#fff" />
    <Vign />
  </>),

  // ---------- CALAVERA VS EL MUNDO (sin texto, como "Indonesia vs The World") ----------
  w1: (<>
    <TMap tint="blue" cam={{cx: 3900, cy: 1700, s: 0.42}} blur={1.6} />
    <Grunge id="w1" /><Speed cx={640} cy={360} seed={3} />
    <Glow x={330} y={400} r={300} c="rgba(255,60,40,0.55)" />
    <Puff x={140} y={240} s={90} /><Puff x={520} y={170} s={80} />
    <Anger x={110} y={170} s={110} rot={-30} />
    <Rich x={330} y={150} w={560} flip={false} />
    <Puff x={760} y={200} s={90} /><Puff x={880} y={120} s={70} />
    <Earth x={1000} y={380} s={520} id="w1e" />
  </>),
  w2: (<>
    <AbsoluteFill style={{clipPath: LEFT}}><TMap tint="fire" /><Flames x0={-40} /></AbsoluteFill>
    <AbsoluteFill style={{clipPath: RIGHT}}><TMap tint="blue" /><Rain x0={620} x1={1300} /></AbsoluteFill>
    <Embers n={40} seed={5} c="#ffd27a" />
    <Glow x={320} y={420} r={300} c="rgba(255,190,70,0.5)" />
    <Rich x={320} y={160} w={540} flip={false} />
    <Muzzle x={610} y={460} s={90} /><Tracers from={[620, 455]} to={[760, 400]} />
    <Glow x={990} y={380} r={320} c="rgba(120,200,255,0.45)" />
    <Earth x={990} y={370} s={500} id="w2e" />
    <Bolt seed={4} /><Vign />
  </>),
  w3: (<>
    <AbsoluteFill style={{background: 'radial-gradient(circle at 70% 45%, #1b2a55 0%, #070a18 70%)'}} />
    {Array.from({length: 120}, (_, i) => <div key={i} style={{position: 'absolute', left: rnd(i) * W, top: rnd(i + 99) * H, width: 2 + rnd(i + 7) * 3, height: 2 + rnd(i + 7) * 3, borderRadius: '50%', background: '#fff', opacity: 0.4 + rnd(i + 3) * 0.6}} />)}
    <Glow x={960} y={380} r={420} c="rgba(90,170,255,0.45)" />
    <Earth x={960} y={380} s={600} id="w3e" />
    <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(120,0,0,0.65) 0%, rgba(120,0,0,0.25) 40%, rgba(0,0,0,0) 60%)'}} />
    <Glow x={330} y={430} r={330} c="rgba(255,40,30,0.6)" />
    <Rich x={330} y={170} w={580} flip={false} />
    <Muzzle x={640} y={480} s={110} /><Tracers from={[650, 470]} to={[760, 420]} n={4} />
    <Smoke list={[[200, 690, 140], [520, 700, 120]]} />
    <Vign />
  </>),
};
export const RICH2 = Object.keys(T);
export const ThumbRich2: React.FC<{id: string}> = ({id}) => {
  const [h] = React.useState(() => delayRender('silk'));
  React.useEffect(() => { const f = new FontFace('Silk', `url(${staticFile('pix700.woff2')})`); f.load().then((ff) => { (document as any).fonts.add(ff); continueRender(h); }); }, []);
  return <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>{T[id]}</AbsoluteFill>;
};
