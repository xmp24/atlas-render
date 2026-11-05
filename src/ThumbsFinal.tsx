// Versión final "Indonesia vs The World": fuego vs tormenta, Indonesia armada contra la Tierra llorando
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COUNTRIES} from './HexWorld';
import {INK, font} from './lib3';
import {CBall, AK} from './ThumbsCB';
import {Embers, Glow} from './ThumbsPro';
import {Planet} from './Logos';

const K = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
const W = 1280, H = 720;
const ID = K('ID'), CN = K('CN'), RU = K('RU'), US = K('US');
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- rayo y fondo partido exactamente por el rayo ----------
const BX = 640;
const BOLT = [[BX + 50, -20], [BX - 10, 302], [BX + 40, 318], [BX - 50, H + 20]];
const boltD = BOLT.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
const LEFT = `polygon(0px 0px, ${BOLT.map((p) => `${p[0]}px ${p[1]}px`).join(', ')}, 0px ${H}px)`;
const RIGHT = `polygon(${BOLT.map((p) => `${p[0]}px ${p[1]}px`).join(', ')}, ${W}px ${H}px, ${W}px 0px)`;
export const SplitBg: React.FC<{dark?: boolean}> = ({dark}) => (<>
  <AbsoluteFill style={{clipPath: LEFT, background: 'radial-gradient(ellipse at 30% 105%, #fff3a8 0%, #ffbe1f 16%, #ff6a12 40%, #c3170c 68%, #4a0604 100%)'}}>
    {/* llamas suaves al fondo */}
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: 0.45, filter: 'blur(6px)'}}>
      {Array.from({length: 9}, (_, i) => { const x = i * 75 - 20, h = 180 + rnd(i) * 220; return <path key={i} d={`M${x},${H} Q${x + 30},${H - h * 0.6} ${x + 45},${H - h} Q${x + 70},${H - h * 0.55} ${x + 95},${H} Z`} fill="#ffd25a" />; })}
    </svg>
    {dark && <AbsoluteFill style={{background: 'rgba(0,0,0,0.25)'}} />}
  </AbsoluteFill>
  <AbsoluteFill style={{clipPath: RIGHT, background: 'radial-gradient(ellipse at 70% 30%, #74b9ff 0%, #2f6fd6 40%, #12307a 75%, #07153d 100%)'}}>
    {Array.from({length: 34}, (_, i) => <div key={i} style={{position: 'absolute', left: 600 + rnd(i) * 700, top: rnd(i + 50) * 720, width: 3, height: 26 + rnd(i + 9) * 18, background: 'rgba(210,235,255,0.5)', transform: 'rotate(16deg)', borderRadius: 3}} />)}
    {/* nubes de tormenta arriba */}
    <div style={{position: 'absolute', left: 620, right: -40, top: -90, height: 220, background: 'radial-gradient(ellipse at 30% 60%, rgba(10,20,50,0.75) 0%, rgba(10,20,50,0) 55%), radial-gradient(ellipse at 75% 50%, rgba(10,20,50,0.7) 0%, rgba(10,20,50,0) 55%)', filter: 'blur(6px)'}} />
  </AbsoluteFill>
</>);
export const BoltFX: React.FC<{seed?: number}> = ({seed = 1}) => {
  const branch = (i: number) => { const t = 0.12 + rnd(seed * 10 + i) * 0.8; const seg = t < 0.43 ? 0 : t < 0.45 ? 1 : 2; const a = BOLT[seg], b = BOLT[seg + 1]; const u = seg === 1 ? 0.5 : seg === 0 ? t / 0.43 : (t - 0.45) / 0.55;
    const x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u; const d = i % 2 ? 1 : -1; const L = 40 + rnd(i + 30) * 50;
    return `M${x},${y} l${d * L * 0.5},${-L * 0.25} l${d * L * 0.15},${L * 0.3} l${d * L * 0.45},${-L * 0.2}`; };
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <defs><filter id="bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter><filter id="bs" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" /></filter></defs>
      {/* resplandor a cada lado: naranja a la izquierda, cian a la derecha */}
      <path d={boltD} transform="translate(-14,0)" stroke="#ffb030" strokeWidth={60} fill="none" filter="url(#bl)" opacity={0.85} />
      <path d={boltD} transform="translate(14,0)" stroke="#5fd0ff" strokeWidth={60} fill="none" filter="url(#bl)" opacity={0.85} />
      {Array.from({length: 7}, (_, i) => <path key={i} d={branch(i)} stroke="#e8f8ff" strokeWidth={4} fill="none" strokeLinejoin="round" filter="url(#bs)" />)}
      {Array.from({length: 7}, (_, i) => <path key={'b' + i} d={branch(i)} stroke="#ffffff" strokeWidth={2} fill="none" strokeLinejoin="round" />)}
      <path d={boltD} stroke={INK} strokeWidth={30} fill="none" strokeLinejoin="miter" />
      <path d={boltD} stroke="#ffffff" strokeWidth={17} fill="none" strokeLinejoin="miter" />
      <path d={boltD} stroke="#bff0ff" strokeWidth={6} fill="none" strokeLinejoin="miter" filter="url(#bs)" />
      {/* chispas */}
      {Array.from({length: 26}, (_, i) => { const y = rnd(i + seed * 3) * H; const x = BX + 30 - (y / H) * 70 + (rnd(i + 7) - 0.5) * 90; return <circle key={'s' + i} cx={x} cy={y} r={1.5 + rnd(i + 3) * 3} fill={i % 2 ? '#fff6c0' : '#c8f2ff'} opacity={0.9} />; })}
    </svg>
  );
};

// ---------- casco de guerra (sustituye a la corona) ----------
export const WarHelmet: React.FC<{x: number; y: number; size: number; rot?: number}> = ({x, y, size, rot = -6}) => (
  <div style={{position: 'absolute', left: x - size * 0.5, top: y - size * 0.62, width: size, height: size, transform: `rotate(${rot}deg)`, pointerEvents: 'none'}}>
    <div style={{position: 'absolute', left: -size * 0.02, top: 0, width: size * 1.04, height: size * 0.4, borderRadius: `${size}px ${size}px ${size * 0.05}px ${size * 0.05}px`, background: 'radial-gradient(circle at 32% 25%, #a9b873 0%, #6b7a3a 40%, #3f4a1f 80%, #2a3214 100%)', border: `${size * 0.022}px solid ${INK}`, boxShadow: `0 ${size * 0.02}px 0 rgba(0,0,0,0.4), inset 0 -${size * 0.03}px 0 rgba(0,0,0,0.3)`, overflow: 'hidden'}}>
      {/* manchas de camuflaje */}
      {[[0.15, 0.35, 0.22], [0.5, 0.15, 0.18], [0.72, 0.5, 0.2], [0.35, 0.65, 0.16]].map(([a, b, r], i) => <div key={i} style={{position: 'absolute', left: `${a * 100}%`, top: `${b * 100}%`, width: size * r, height: size * r * 0.6, borderRadius: '50%', background: i % 2 ? 'rgba(40,48,20,0.55)' : 'rgba(120,96,50,0.45)'}} />)}
      {/* banda + estrella */}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: size * 0.04, height: size * 0.055, background: 'rgba(30,36,14,0.7)'}} />
      <div style={{position: 'absolute', left: '43%', top: '24%', width: size * 0.14, height: size * 0.14, background: 'linear-gradient(#fff6a0, #ffc21a)', clipPath: 'polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)', filter: 'drop-shadow(0 0 4px #ffe58a)'}} />
      <div style={{position: 'absolute', left: '12%', top: '10%', width: '30%', height: '22%', borderRadius: '50%', background: 'rgba(255,255,255,0.28)', filter: 'blur(2px)'}} />
    </div>
  </div>
);

// ---------- la Tierra llorando (como la adjunta) ----------
export const SadEarth: React.FC<{x: number; y: number; size: number; cracks?: boolean; fires?: boolean}> = ({x, y, size, cracks, fires}) => (
  <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size}}>
    <div style={{position: 'absolute', inset: -size * 0.12, borderRadius: '50%', background: 'radial-gradient(circle, rgba(120,200,255,0.55) 0%, rgba(120,200,255,0) 70%)'}} />
    <Planet size={size} mood="sad" lon={110} lat={5} rim="#9fd8ff" />
    <svg width={size} height={size} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      {cracks && <g stroke={INK} strokeWidth={size * 0.012} fill="none" strokeLinecap="round"><path d={`M${size * 0.1},${size * 0.35} l${size * 0.12},${size * 0.05} l${size * 0.04},${size * 0.1} l${size * 0.1},${size * 0.02}`} /><path d={`M${size * 0.85},${size * 0.7} l${-size * 0.1},${-size * 0.04} l${-size * 0.03},${size * 0.09}`} /></g>}
      {[0.36, 0.64].map((fx, i) => <path key={i} d={`M${size * fx},${size * 0.52} q${size * 0.015},${size * 0.13} ${size * 0.03},${size * 0.25} a${size * 0.04},${size * 0.04} 0 1 1 ${-size * 0.06},0 q${size * 0.01},${-size * 0.12} ${size * 0.03},${-size * 0.25} z`} fill="#8fd2ff" stroke={INK} strokeWidth={size * 0.012} />)}
      {[0.36, 0.64].map((fx, i) => <ellipse key={'h' + i} cx={size * fx - size * 0.008} cy={size * 0.72} rx={size * 0.008} ry={size * 0.02} fill="#fff" opacity={0.8} />)}
    </svg>
    {fires && [[0.18, 0.2], [0.78, 0.3], [0.7, 0.82]].map(([a, b], i) => <div key={i} style={{position: 'absolute', left: size * a - size * 0.08, top: size * b - size * 0.12, width: size * 0.16, height: size * 0.2, borderRadius: '50% 50% 45% 45% / 65% 65% 35% 35%', background: 'radial-gradient(ellipse at 50% 75%, #fff3a0 0%, #ffb21a 40%, #ff4a12 70%, rgba(255,40,10,0) 100%)', filter: 'drop-shadow(0 0 10px #ff7a1a)'}} />)}
  </div>
);

// ---------- título con relieve 3D, degradado y brillo ----------
export const Title3D: React.FC<{text: string; y: number; size: number; grad: string; glow: string; x?: number; rot?: number; ls?: number}> = ({text, y, size, grad, glow, x = W / 2, rot = -2, ls = 0}) => {
  const depth = Array.from({length: 7}, (_, i) => `0 ${(i + 1) * size * 0.012}px 0 #1d1d1d`).join(', ');
  const base: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: '100%', textAlign: 'center', ...font, fontSize: size, lineHeight: 1, letterSpacing: ls, whiteSpace: 'nowrap'};
  return (
    <div style={{position: 'absolute', left: x - 700, width: 1400, top: y, height: size * 1.2, transform: `rotate(${rot}deg)`}}>
      <div style={{...base, color: INK, WebkitTextStroke: `${size * 0.2}px ${INK}`, textShadow: `${depth}, 0 0 ${size * 0.45}px ${glow}`}}>{text}</div>
      <div style={{...base, background: grad, WebkitBackgroundClip: 'text', color: 'transparent'}}>{text}</div>
      <div style={{...base, background: 'linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 45%)', WebkitBackgroundClip: 'text', color: 'transparent'}}>{text}</div>
    </div>
  );
};
export const GOLD = 'linear-gradient(180deg, #fffbe0 0%, #ffe14a 38%, #ffb21a 70%, #ff7a00 100%)';
export const WHITE = 'linear-gradient(180deg, #ffffff 0%, #ffffff 55%, #cfe3ff 100%)';
export const REDG = 'linear-gradient(180deg, #ffd0c0 0%, #ff4a3a 40%, #c3100a 100%)';

// ---------- detalles ----------
export const Muzzle: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <div style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, background: 'radial-gradient(circle, #fffbe0 0%, #ffe14a 25%, #ff8a1a 50%, rgba(255,100,20,0) 72%)', clipPath: 'polygon(50% 0,58% 38%,100% 50%,58% 62%,50% 100%,42% 62%,0 50%,42% 38%)', filter: 'drop-shadow(0 0 12px #ffb030)'}} />
);
export const Tracers: React.FC<{from: [number, number]; to: [number, number]; n?: number}> = ({from, to, n = 4}) => (
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
    {Array.from({length: n}, (_, i) => { const t0 = 0.1 + i * 0.22, t1 = t0 + 0.1; const off = (rnd(i + 40) - 0.5) * 50;
      const a = [from[0] + (to[0] - from[0]) * t0, from[1] + (to[1] - from[1]) * t0 + off], b = [from[0] + (to[0] - from[0]) * t1, from[1] + (to[1] - from[1]) * t1 + off];
      return <g key={i}><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#ffb030" strokeWidth={10} strokeLinecap="round" opacity={0.5} style={{filter: 'blur(3px)'}} /><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#fff6c0" strokeWidth={4} strokeLinecap="round" /></g>; })}
  </svg>
);
export const Smoke: React.FC<{list: [number, number, number][]}> = ({list}) => <>{list.map(([x, y, r], i) => <div key={i} style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: 'radial-gradient(circle, rgba(60,40,30,0.45) 0%, rgba(60,40,30,0) 70%)', filter: 'blur(4px)'}} />)}</>;
const Shadow: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => <div style={{position: 'absolute', left: x - w / 2, top: y, width: w, height: w * 0.12, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 70%)'}} />;
export const Vign: React.FC = () => <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)'}} />;
const Indo: React.FC<{x: number; y: number; s: number; look?: number; k?: number}> = ({x, y, s, look = 0.6, k = ID}) => (<>
  <Shadow x={x} y={y + s * 0.44} w={s * 0.9} />
  <CBall k={k} size={s} x={x} y={y} eyes="angry" look={look} rim="#ffcf6a" />
  <WarHelmet x={x} y={y + s * 0.03} size={s * 0.98} />
</>);

const F: Record<string, React.ReactNode> = {
  // ===== 3 modelos con los cambios pedidos =====
  f1: (<>
    <SplitBg />
    <Embers n={70} seed={31} c="#ffd27a" />
    <Smoke list={[[120, 640, 90], [300, 700, 110], [520, 660, 80]]} />
    <Glow x={320} y={410} r={300} c="rgba(255,190,70,0.45)" />
    <Tracers from={[640, 465]} to={[880, 410]} />
    <Indo x={320} y={410} s={390} />
    <AK x={470} y={490} w={300} rot={40} />
    <Muzzle x={622} y={470} s={90} />
    <SadEarth x={975} y={400} size={380} />
    <BoltFX seed={1} />
    <Vign />
    <Title3D text="INDONESIA VS" y={10} size={98} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Title3D text="THE ENTIRE WORLD" y={592} size={100} grad={GOLD} glow="rgba(255,190,40,0.8)" />
  </>),
  f2: (<>
    <SplitBg />
    <Embers n={70} seed={32} c="#ffd27a" />
    <Smoke list={[[100, 660, 100], [330, 700, 120]]} />
    <Glow x={330} y={420} r={300} c="rgba(255,190,70,0.45)" />
    <Tracers from={[650, 475]} to={[880, 420]} n={5} />
    <Indo x={330} y={420} s={400} />
    <AK x={480} y={500} w={300} rot={40} />
    <Muzzle x={632} y={480} s={95} />
    <SadEarth x={975} y={410} size={380} />
    <BoltFX seed={2} />
    <Vign />
    <Title3D text="INDONESIA DECLARED" y={12} size={86} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Title3D text="WAR ON EARTH" y={588} size={112} grad={REDG} glow="rgba(255,60,40,0.85)" />
  </>),
  f3: (<>
    <SplitBg />
    <Embers n={70} seed={33} c="#ffd27a" />
    <Smoke list={[[140, 650, 100], [420, 690, 110]]} />
    <Glow x={320} y={410} r={300} c="rgba(255,190,70,0.45)" />
    <Tracers from={[640, 465]} to={[880, 410]} />
    <Indo x={320} y={410} s={390} />
    <AK x={470} y={490} w={300} rot={40} />
    <Muzzle x={622} y={470} s={90} />
    <SadEarth x={975} y={395} size={380} />
    <BoltFX seed={3} />
    <Vign />
    <Title3D text="1 COUNTRY" y={10} size={104} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Title3D text="VS 194 COUNTRIES" y={590} size={100} grad={GOLD} glow="rgba(255,190,40,0.8)" />
  </>),
  u1: (<>
    <SplitBg />
    <Embers n={70} seed={31} c="#ffd27a" />
    <Smoke list={[[120, 640, 90], [300, 700, 110], [520, 660, 80]]} />
    <Glow x={320} y={410} r={300} c="rgba(255,190,70,0.45)" />
    <Tracers from={[640, 465]} to={[880, 410]} />
    <Indo x={320} y={410} s={390} k={US} />
    <AK x={470} y={490} w={300} rot={40} />
    <Muzzle x={622} y={470} s={90} />
    <SadEarth x={975} y={400} size={380} />
    <BoltFX seed={1} />
    <Vign />
    <Title3D text="USA VS" y={10} size={104} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Title3D text="THE ENTIRE WORLD" y={592} size={100} grad={GOLD} glow="rgba(255,190,40,0.8)" />
  </>),
  // ===== 3 modelos con cambios grandes =====
  // primer plano extremo: Indonesia gigante cortada, la Tierra pequeña y agrietada
  g1: (<>
    <SplitBg />
    <Embers n={80} seed={41} c="#ffd27a" />
    <Glow x={260} y={460} r={420} c="rgba(255,190,70,0.5)" />
    <CBall k={ID} size={760} x={250} y={520} eyes="angry" look={0.8} rim="#ffcf6a" />
    <WarHelmet x={250} y={520 + 760 * 0.03} size={760 * 0.98} />
    <AK x={540} y={580} w={420} rot={30} />
    <Muzzle x={720} y={520} s={110} />
    <Tracers from={[720, 520]} to={[1010, 330]} n={5} />
    <SadEarth x={1020} y={330} size={260} cracks />
    <BoltFX seed={4} />
    <Vign />
    <Title3D text="1 VS 194" x={1000} y={520} size={130} grad={GOLD} glow="rgba(255,190,40,0.9)" rot={-4} />
  </>),
  // ataque: misiles cruzando el rayo, la Tierra ardiendo y llorando
  g2: (<>
    <SplitBg />
    <Embers n={70} seed={42} c="#ffd27a" />
    <Indo x={290} y={440} s={360} />
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      {[[430, 260, 860, 250], [450, 340, 900, 430], [420, 190, 980, 180]].map(([x0, y0, x1, y1], i) => <g key={i}>
        <path d={`M${x0},${y0} Q${(x0 + x1) / 2},${Math.min(y0, y1) - 120} ${x1},${y1}`} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={18} strokeLinecap="round" style={{filter: 'blur(3px)'}} />
        <path d={`M${x0},${y0} Q${(x0 + x1) / 2},${Math.min(y0, y1) - 120} ${x1},${y1}`} fill="none" stroke="#fff3c8" strokeWidth={5} strokeDasharray="18 12" strokeLinecap="round" />
      </g>)}
    </svg>
    <SadEarth x={990} y={400} size={330} fires cracks />
    {[[845, 255, 46], [880, 470, 52], [1120, 240, 40]].map(([x, y, r], i) => <div key={i} style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: 'radial-gradient(circle, #fffbe0 0%, #ffe14a 22%, #ff8a1a 48%, #ff3d1f 62%, rgba(200,30,10,0) 72%)'}} />)}
    <BoltFX seed={5} />
    <Vign />
    <Title3D text="INDONESIA ATTACKS" y={12} size={88} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Title3D text="THE WHOLE PLANET" y={592} size={98} grad={REDG} glow="rgba(255,60,40,0.85)" />
  </>),
  // videojuego: barras de vida, Indonesia 100% y la Tierra 1%
  g3: (<>
    <SplitBg />
    <Embers n={70} seed={43} c="#ffd27a" />
    <Glow x={320} y={430} r={300} c="rgba(255,190,70,0.45)" />
    <Indo x={320} y={430} s={380} />
    <AK x={470} y={510} w={290} rot={40} />
    <SadEarth x={980} y={420} size={330} cracks />
    <BoltFX seed={6} />
    {/* barras de vida */}
    {[[60, 'INDONESIA', 1, '#3ad16a'], [700, 'EARTH', 0.01, '#ff3b30']].map(([x, n, v, c], i) => (
      <div key={i} style={{position: 'absolute', left: x as number, top: 150, width: 520}}>
        <div style={{...font, fontSize: 40, color: '#fff', WebkitTextStroke: `7px ${INK}`, paintOrder: 'stroke fill', marginBottom: 6, textAlign: i ? 'right' : 'left'}}>{n as string} <span style={{color: c as string}}>{Math.round((v as number) * 100)}%</span></div>
        <div style={{height: 34, border: `6px solid ${INK}`, borderRadius: 10, background: '#2a1010', overflow: 'hidden', boxShadow: '0 4px 0 rgba(0,0,0,0.5)'}}>
          <div style={{width: `${Math.max(2.5, (v as number) * 100)}%`, height: '100%', marginLeft: i ? 'auto' : 0, background: `linear-gradient(180deg, ${c}, ${c}aa)`, boxShadow: `0 0 18px ${c}`}} />
        </div>
      </div>))}
    <Vign />
    <Title3D text="EARTH IS LOSING" y={12} size={100} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Title3D text="TO INDONESIA?!" y={594} size={104} grad={GOLD} glow="rgba(255,190,40,0.8)" />
  </>),
};
export const ThumbFinal: React.FC<{id: string}> = ({id}) => <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>{F[id]}</AbsoluteFill>;
export const FINAL_IDS = Object.keys(F);
