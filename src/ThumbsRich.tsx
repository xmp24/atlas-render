// Miniatura estilo "LATIN AMERICA BATTLE ROYALE": pobre ($1, azul) | rayo | rica ($1,000,000, fuego)
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {INK} from './lib3';
import {Embers, Glow} from './ThumbsPro';
import {Title3D, GOLD, WHITE, REDG, Tracers, Muzzle, Vign, Smoke} from './ThumbsFinal';

const W = 1280, H = 720;
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const BX = 640;
const BOLT = [[BX + 50, -20], [BX - 10, 302], [BX + 40, 318], [BX - 50, H + 20]];
const boltD = BOLT.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
const LEFT = `polygon(0px 0px, ${BOLT.map((p) => `${p[0]}px ${p[1]}px`).join(', ')}, 0px ${H}px)`;
const RIGHT = `polygon(${BOLT.map((p) => `${p[0]}px ${p[1]}px`).join(', ')}, ${W}px ${H}px, ${W}px 0px)`;
const GREENG = 'linear-gradient(180deg, #f2ffe0 0%, #9dff6a 38%, #33d14a 70%, #128a2a 100%)';

export const Bg: React.FC = () => (<>
  {/* izquierda: azul tormenta (pobre) */}
  <AbsoluteFill style={{clipPath: LEFT, background: 'radial-gradient(ellipse at 30% 35%, #74b9ff 0%, #2f6fd6 40%, #12307a 75%, #07153d 100%)'}}>
    {Array.from({length: 30}, (_, i) => <div key={i} style={{position: 'absolute', left: rnd(i) * 680 - 20, top: rnd(i + 50) * 720, width: 3, height: 26 + rnd(i + 9) * 18, background: 'rgba(210,235,255,0.5)', transform: 'rotate(16deg)', borderRadius: 3}} />)}
    <div style={{position: 'absolute', left: -40, right: 560, top: -90, height: 220, background: 'radial-gradient(ellipse at 30% 60%, rgba(10,20,50,0.75) 0%, rgba(10,20,50,0) 55%), radial-gradient(ellipse at 75% 50%, rgba(10,20,50,0.7) 0%, rgba(10,20,50,0) 55%)', filter: 'blur(6px)'}} />
  </AbsoluteFill>
  {/* derecha: fuego (rica) */}
  <AbsoluteFill style={{clipPath: RIGHT, background: 'radial-gradient(ellipse at 70% 105%, #fff3a8 0%, #ffbe1f 16%, #ff6a12 40%, #c3170c 68%, #4a0604 100%)'}}>
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: 0.45, filter: 'blur(6px)'}}>
      {Array.from({length: 10}, (_, i) => { const x = 560 + i * 75, h = 180 + rnd(i + 3) * 240; return <path key={i} d={`M${x},${H} Q${x + 30},${H - h * 0.6} ${x + 45},${H - h} Q${x + 70},${H - h * 0.55} ${x + 95},${H} Z`} fill="#ffd25a" />; })}
    </svg>
  </AbsoluteFill>
</>);
export const Bolt: React.FC<{seed?: number}> = ({seed = 3}) => {
  const branch = (i: number) => { const t = 0.12 + rnd(seed * 10 + i) * 0.8; const seg = t < 0.43 ? 0 : t < 0.45 ? 1 : 2; const a = BOLT[seg], b = BOLT[seg + 1]; const u = seg === 1 ? 0.5 : seg === 0 ? t / 0.43 : (t - 0.45) / 0.55;
    const x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u; const d = i % 2 ? 1 : -1; const L = 40 + rnd(i + 30) * 50;
    return `M${x},${y} l${d * L * 0.5},${-L * 0.25} l${d * L * 0.15},${L * 0.3} l${d * L * 0.45},${-L * 0.2}`; };
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <defs><filter id="rbl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter><filter id="rbs" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" /></filter></defs>
      <path d={boltD} transform="translate(-14,0)" stroke="#5fd0ff" strokeWidth={60} fill="none" filter="url(#rbl)" opacity={0.85} />
      <path d={boltD} transform="translate(14,0)" stroke="#ffb030" strokeWidth={60} fill="none" filter="url(#rbl)" opacity={0.85} />
      {Array.from({length: 7}, (_, i) => <path key={i} d={branch(i)} stroke="#e8f8ff" strokeWidth={4} fill="none" strokeLinejoin="round" filter="url(#rbs)" />)}
      {Array.from({length: 7}, (_, i) => <path key={'b' + i} d={branch(i)} stroke="#ffffff" strokeWidth={2} fill="none" strokeLinejoin="round" />)}
      <path d={boltD} stroke={INK} strokeWidth={30} fill="none" strokeLinejoin="miter" />
      <path d={boltD} stroke="#ffffff" strokeWidth={17} fill="none" strokeLinejoin="miter" />
      <path d={boltD} stroke="#bff0ff" strokeWidth={6} fill="none" strokeLinejoin="miter" filter="url(#rbs)" />
      {Array.from({length: 26}, (_, i) => { const y = rnd(i + seed * 3) * H; const x = BX + 30 - (y / H) * 70 + (rnd(i + 7) - 0.5) * 90; return <circle key={'s' + i} cx={x} cy={y} r={1.5 + rnd(i + 3) * 3} fill={i % 2 ? '#c8f2ff' : '#fff6c0'} opacity={0.9} />; })}
    </svg>
  );
};
// imagen recortada con sombra y contorno suave
const Cut: React.FC<{src: string; x: number; y: number; w: number; flip?: boolean; rim: string}> = ({src, x, y, w, flip, rim}) => (
  <Img src={staticFile(src)} style={{position: 'absolute', left: x - w / 2, top: y, width: w, transform: flip ? 'scaleX(-1)' : undefined, filter: `drop-shadow(0 0 3px ${INK}) drop-shadow(0 0 14px ${rim}) drop-shadow(0 14px 14px rgba(0,0,0,0.55))`}} />
);
const Base: React.FC = () => (<>
  <Bg />
  <Embers n={34} seed={42} c="#ffd27a" />
  <Glow x={330} y={420} r={280} c="rgba(140,200,255,0.35)" />
  <Glow x={960} y={400} r={300} c="rgba(255,190,70,0.5)" />
  <Smoke list={[[1160, 660, 110], [800, 670, 90]]} />
  <Cut src="hw/mil/poor.png" x={315} y={170} w={430} rim="rgba(150,210,255,0.8)" />
  <Cut src="hw/mil/rich.png" x={975} y={150} w={530} flip rim="rgba(255,200,90,0.9)" />
  {/* el fusil apunta a la pobre: fogonazo y trazadoras hacia la izquierda */}
  <Muzzle x={700} y={485} s={80} />
  <Tracers from={[690, 480]} to={[560, 430]} n={3} />
  <Bolt />
  <Vign />
</>);
const T: Record<string, React.ReactNode> = {
  // A · cifra encima de cada bola + ARMY abajo
  a: (<>
    <Base />
    <Title3D text="$1" x={315} y={10} size={150} grad={GREENG} glow="rgba(80,255,120,0.7)" />
    <Title3D text="$1,000,000" x={955} y={22} size={104} grad={GOLD} glow="rgba(255,190,40,0.85)" />
    <Title3D text="ARMY" y={590} size={112} grad={REDG} glow="rgba(255,60,40,0.85)" />
  </>),
  // B · como la de Latinoamérica: arriba blanco, abajo rojo
  b: (<>
    <Base />
    <Title3D text="$1 ARMY VS" y={8} size={104} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Title3D text="$1,000,000 ARMY" y={590} size={104} grad={REDG} glow="rgba(255,60,40,0.85)" />
  </>),
  // C · solo las cifras (más limpia)
  c: (<>
    <Base />
    <Title3D text="$1" x={315} y={10} size={160} grad={GREENG} glow="rgba(80,255,120,0.7)" />
    <Title3D text="$1,000,000" x={955} y={22} size={104} grad={GOLD} glow="rgba(255,190,40,0.85)" />
  </>),
};
export const RICH_THUMBS = Object.keys(T);
export const ThumbRich: React.FC<{id: string}> = ({id}) => <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>{T[id]}</AbsoluteFill>;
