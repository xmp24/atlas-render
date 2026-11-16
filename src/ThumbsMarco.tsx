// 5 miniaturas estilo "$1 vs $1,000,000" para el vídeo de Marco (Mónaco)
import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {COUNTRIES} from './HexWorld';
import {INK} from './lib3';
import {WorldBg, VS} from './ThumbsMap';
import {Embers, Glow, Rays} from './ThumbsPro';
import {CBall} from './ThumbsCB';
import {Title3D, GOLD, WHITE, REDG, Vign, BoltFX} from './ThumbsFinal';

const K = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
const MC = () => K('MC');
const GREEN = 'linear-gradient(180deg,#d6ffb0 0%,#6dff6d 45%,#1fa83a 100%)';
const Ico: React.FC<{n: string; x: number; y: number; w: number; c: string; rot?: number; flip?: boolean}> = ({n, x, y, w, c, rot = 0, flip}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - w / 2, width: w, height: w, transform: `rotate(${rot}deg) scaleX(${flip ? -1 : 1})`, filter: `drop-shadow(0 0 2px ${INK}) drop-shadow(0 0 2px ${INK}) drop-shadow(0 8px 8px rgba(0,0,0,0.55))`}}>
    <div style={{width: '100%', height: '100%', background: c, WebkitMaskImage: `url(${staticFile(`hw/icons/${n}.svg`)})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center'}} />
  </div>
);
// la cacerola de Marco sobre una CBall
const Pot: React.FC<{x: number; y: number; s: number; rot?: number}> = ({x, y, s, rot = 0}) => (
  <svg width={s} height={s} style={{position: 'absolute', left: x - s / 2, top: y - s / 2, overflow: 'visible', transform: `rotate(${rot}deg)`}}>
    <path d={`M ${s * 0.1} ${s * 0.2} A ${s * 0.41} ${s * 0.34} 0 0 1 ${s * 0.9} ${s * 0.2} Z`} fill="#a7b0ba" stroke={INK} strokeWidth={s * 0.028} />
    <path d={`M ${s * 0.22} ${s * 0.08} Q ${s * 0.5} ${-s * 0.06} ${s * 0.78} ${s * 0.08}`} fill="none" stroke="#e8eef4" strokeWidth={s * 0.03} strokeLinecap="round" opacity={0.8} />
    <rect x={s * 0.02} y={s * 0.17} width={s * 0.96} height={s * 0.075} rx={s * 0.03} fill="#7d8790" stroke={INK} strokeWidth={s * 0.022} />
    <rect x={s * 0.93} y={s * 0.15} width={s * 0.26} height={s * 0.06} rx={s * 0.02} fill="#5a636b" stroke={INK} strokeWidth={s * 0.018} />
  </svg>
);
const Marco: React.FC<{x: number; y: number; s: number; eyes: any; look?: number; crown?: boolean; sweat?: boolean; tears?: boolean; rim?: string; broom?: boolean; rot?: number}> = ({x, y, s, eyes, look = 0, crown, sweat, tears, rim, broom, rot = 0}) => (<>
  {broom && <svg width={s} height={s * 1.4} style={{position: 'absolute', left: x + s * 0.2, top: y - s * 0.55, overflow: 'visible'}}><g transform={`rotate(-18 ${s * 0.2} ${s * 0.9})`}><rect x={s * 0.18} y={0} width={s * 0.07} height={s * 1.05} rx={s * 0.03} fill="#a0662c" stroke={INK} strokeWidth={s * 0.02} /><path d={`M ${s * 0.06} ${s * 1.0} L ${s * 0.37} ${s * 1.0} L ${s * 0.45} ${s * 1.32} L ${s * -0.02} ${s * 1.32} Z`} fill="#e8c35a" stroke={INK} strokeWidth={s * 0.02} /></g></svg>}
  <CBall k={MC()} size={s} x={x} y={y} eyes={eyes} look={look} crown={crown} sweat={sweat} tears={tears} rim={rim} rot={rot} />
  {!crown && <Pot x={x} y={y - s * 0.13} s={s * 1.02} rot={rot} />}
</>);
const Big: React.FC<{text: string; x: number; y: number; size: number; grad?: string; rot?: number; anchor?: 'left' | 'center' | 'right'}> = ({text, x, y, size, grad = GREEN, rot = 0, anchor = 'center'}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(${anchor === 'center' ? '-50%' : anchor === 'right' ? '-100%' : '0'},0) rotate(${rot}deg)`, whiteSpace: 'nowrap'}}>
    <div style={{fontFamily: 'Lilita', fontSize: size, lineHeight: 1, background: grad, WebkitBackgroundClip: 'text', color: 'transparent', WebkitTextStroke: `${size * 0.06}px ${INK}`, paintOrder: 'stroke fill', filter: `drop-shadow(0 ${size * 0.06}px 0 ${INK}) drop-shadow(0 ${size * 0.1}px ${size * 0.08}px rgba(0,0,0,0.55))`}}>{text}</div>
  </div>
);
const Arrow: React.FC<{x: number; y: number; w: number; rot: number}> = ({x, y, w, rot}) => (
  <svg width={w} height={w * 0.6} style={{position: 'absolute', left: x, top: y, overflow: 'visible', transform: `rotate(${rot}deg)`, filter: 'drop-shadow(0 8px 8px rgba(0,0,0,0.5))'}}>
    <path d={`M 0 ${w * 0.22} L ${w * 0.62} ${w * 0.22} L ${w * 0.62} ${w * 0.04} L ${w} ${w * 0.3} L ${w * 0.62} ${w * 0.56} L ${w * 0.62} ${w * 0.38} L 0 ${w * 0.38} Z`} fill="#ff2a2a" stroke="#fff" strokeWidth={w * 0.035} strokeLinejoin="round" />
  </svg>
);
const GOLDF = 'linear-gradient(180deg,#fff6b0,#ffc21a 55%,#c27a00)';
const T: Record<string, React.ReactNode> = {
  // 1 · pantalla partida pobre / rico
  split: (<>
    <div style={{position: 'absolute', left: 0, top: 0, width: 640, height: 720, background: 'linear-gradient(160deg,#6b7280,#2b2f36)'}} />
    <div style={{position: 'absolute', left: 640, top: 0, width: 640, height: 720, background: 'radial-gradient(circle at 70% 55%,#ffe27a,#d99a00 55%,#7a4a00)'}} />
    <Rays x={960} y={430} c="rgba(255,240,170,0.55)" a={0.45} />
    {[[790, 560, 190, 'battle-tank', 0], [1130, 590, 210, 'battle-tank', 0], [1180, 270, 150, 'jet-fighter', -20], [800, 250, 130, 'jet-fighter', -10]].map(([x, y, w, n, r]: any, i) => <Ico key={i} n={n} x={x} y={y} w={w} c={GOLDF} rot={r} flip={i % 2 === 1} />)}
    <Marco x={300} y={460} s={300} eyes="scared" look={0.4} sweat broom />
    <Glow x={960} y={440} r={240} c="rgba(255,220,90,0.7)" />
    <Marco x={960} y={440} s={300} eyes="smug" look={-0.3} crown rim="#fff6b0" />
    <VS x={640} y={380} r={78} />
    <Big text="$1" x={300} y={40} size={190} />
    <Big text="$1,000,000" x={960} y={50} size={112} grad={GOLDF} />
    <Embers n={40} seed={81} c="#ffe08a" />
    <Vign />
  </>),
  // 2 · escalera de dinero
  ladder: (<>
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#1b2a4a,#0b1222)'}} />
    {[0, 1, 2, 3].map((i) => { const x = 160 + i * 320; const h = 120 + i * 120; return <React.Fragment key={i}>
      <div style={{position: 'absolute', left: x - 140, top: 680 - h, width: 280, height: h, background: i === 3 ? 'linear-gradient(180deg,#ffd23f,#c27a00)' : 'linear-gradient(180deg,#3fb24f,#1e6b2a)', border: `6px solid ${INK}`, borderRadius: '18px 18px 0 0'}} /></React.Fragment>; })}
    <Marco x={160} y={500} s={130} eyes="scared" broom />
    {[0, 1, 2].map((j) => <Marco key={j} x={430 + j * 60} y={430 + (j % 2) * 30} s={95} eyes="angry" />)}
    <Ico n="battle-tank" x={800} y={330} w={170} c="linear-gradient(180deg,#e6e6e6,#8a8a8a)" />
    <Ico n="jet-fighter" x={890} y={210} w={110} c="linear-gradient(180deg,#e6e6e6,#8a8a8a)" rot={-20} />
    <Glow x={1120} y={200} r={220} c="rgba(255,210,60,0.7)" />
    <Ico n="battle-tank" x={1060} y={210} w={170} c={GOLDF} /><Ico n="battle-tank" x={1190} y={250} w={150} c={GOLDF} flip /><Ico n="jet-fighter" x={1130} y={90} w={140} c={GOLDF} rot={-25} /><Ico n="battleship" x={1120} y={330} w={170} c={GOLDF} />
    {['$1', '$1,000', '$100K', '$1,000,000'].map((l, i) => <Big key={l} text={l} x={160 + i * 320} y={i === 3 ? 430 : 590} size={i === 3 ? 74 : 82} grad={i === 3 ? GOLDF : GREEN} />)}
    <Arrow x={250} y={60} w={380} rot={-12} />
    <Big text="$1 → $1,000,000 ARMY" x={640} y={8} size={70} grad={WHITE} />
    <Vign />
  </>),
  // 3 · mapa: Francia dorada y Marco coronado
  map: (<>
    <WorldBg cam={{cx: 3880, cy: 1290, s: 1.25}} skip={['FR', 'MC']} blur={1.6} colOver={{[K('FR')]: '#d9a521', [K('MC')]: '#d9a521'}} />
    <AbsoluteFill style={{background: 'radial-gradient(circle at 45% 55%, rgba(0,0,0,0) 20%, rgba(0,0,0,0.55) 85%)'}} />
    <Rays x={600} y={420} c="rgba(255,220,90,0.55)" a={0.4} />
    <Glow x={600} y={420} r={300} c="rgba(255,210,60,0.7)" />
    <Marco x={600} y={430} s={360} eyes="smug" look={0.3} crown rim="#fff6b0" />
    <CBall k={K('FR')} size={190} x={1070} y={470} eyes="scared" look={-0.6} sweat />
    <Ico n="battle-tank" x={230} y={560} w={170} c={GOLDF} /><Ico n="jet-fighter" x={250} y={220} w={140} c={GOLDF} rot={-15} />
    <Big text="$1,000,000 ARMY" x={640} y={8} size={110} grad={GOLDF} />
    <Big text="VS FRANCE" x={640} y={590} size={100} grad={REDG} />
    <Embers n={40} seed={83} c="#ffe08a" />
    <Vign />
  </>),
  // 4 · primer plano de Marco con $1 y un muro de tanques detrás
  close: (<>
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#7a1010,#2a0606)'}} />
    {Array.from({length: 7}, (_, i) => <Ico key={i} n="battle-tank" x={620 + (i % 4) * 190} y={250 + Math.floor(i / 4) * 170} w={200} c="linear-gradient(180deg,#3a3a3a,#111)" flip />)}
    <BoltFX seed={21} />
    <Marco x={330} y={430} s={480} eyes="scared" look={0.5} sweat />
    <svg width={150} height={150} style={{position: 'absolute', left: 470, top: 520, overflow: 'visible', filter: 'drop-shadow(0 8px 8px rgba(0,0,0,0.6))'}}><circle cx={75} cy={75} r={70} fill="#ffcf2e" stroke="#9a6a00" strokeWidth={10} /><text x={75} y={98} textAnchor="middle" fontSize={64} style={{fontFamily: 'Lilita'}} fill="#9a6a00">$1</text></svg>
    <Big text="$1 ARMY?!" x={900} y={480} size={150} />
    <Big text="vs $1,000,000" x={930} y={20} size={100} grad={GOLDF} rot={-4} />
    <Vign />
  </>),
  // 5 · antes y después
  before: (<>
    <div style={{position: 'absolute', left: 0, top: 0, width: 640, height: 720, background: 'linear-gradient(180deg,#8fd3ff,#d9f2ff 60%,#7bc46a 60%)'}} />
    <div style={{position: 'absolute', left: 640, top: 0, width: 640, height: 720, background: 'radial-gradient(circle at 50% 60%,#ff8a2a,#7a1a00 70%)'}} />
    <Marco x={330} y={470} s={260} eyes="dead" rot={-25} broom />
    <CBall k={K('FR')} size={170} x={130} y={520} eyes="smug" look={0.6} />
    <div style={{position: 'absolute', left: 230, top: 260, fontFamily: 'Lilita', fontSize: 70, color: '#fff', WebkitTextStroke: `8px ${INK}`, paintOrder: 'stroke fill', transform: 'rotate(-10deg)'}}>BONK!</div>
    <Ico n="spiky-explosion" x={960} y={430} w={460} c="linear-gradient(180deg,#fff3a0,#ff8a00 60%,#c21a00)" />
    <Marco x={960} y={430} s={250} eyes="angry" look={-0.2} crown rim="#fff6b0" />
    <Ico n="battle-tank" x={760} y={600} w={170} c={GOLDF} /><Ico n="battle-tank" x={1170} y={600} w={170} c={GOLDF} flip /><Ico n="jet-fighter" x={1150} y={170} w={140} c={GOLDF} rot={-20} />
    <Arrow x={470} y={300} w={300} rot={0} />
    <Big text="$1" x={320} y={30} size={170} />
    <Big text="$1,000,000" x={960} y={40} size={108} grad={GOLDF} />
    <Vign />
  </>),
};
export const MARCO_THUMBS = Object.keys(T);
export const ThumbMarco: React.FC<{id: string}> = ({id}) => <AbsoluteFill style={{overflow: 'hidden', background: '#111'}}>{T[id]}</AbsoluteFill>;
