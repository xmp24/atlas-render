// 9 miniaturas para "How the US Captured Maduro" (1920x1080, se exportan a 1280x720)
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, font} from './lib3';
import {Title3D, WHITE, GOLD, REDG, SplitBg, BoltFX, WarHelmet, Muzzle, Tracers, Smoke, Vign} from './ThumbsFinal';
import {CBall, AK} from './ThumbsCB';
import {Embers, Glow, Rays} from './ThumbsPro';
import {Char} from './Maduro/chars';
import {K, rnd, NightSky, Moon, Caracas, Heli, Boom, Ico, Sea} from './Maduro/lib';
import {Soldiers} from './Maduro/lib2';
import {Villa, HeliMini} from './Maduro/art';
import {Cell} from './Maduro/v2a';

const W = 1920, H = 1080; const US = K('US'), VE = K('VE');
const T = 3; // instante fijo para animaciones
// --- piezas ---
const Paper: React.FC<{x: number; y: number; w: number; rot: number; name: string; head: string; children: React.ReactNode}> = ({x, y, w, rot, name, head, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: w * 0.95, transform: `rotate(${rot}deg)`, background: '#f2eee4', border: `10px solid ${INK}`, boxShadow: '0 30px 60px rgba(0,0,0,0.6)'}}>
    <div style={{textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: w * 0.075, fontWeight: 900, color: INK, borderBottom: `6px double ${INK}`, padding: '12px 0'}}>{name}</div>
    <div style={{textAlign: 'center', ...font, fontSize: w * 0.11, color: INK, margin: '8px 0', lineHeight: 1}}>{head}</div>
    <div style={{position: 'absolute', left: w * 0.05, right: w * 0.05, top: w * 0.31, height: w * 0.45, overflow: 'hidden', border: `5px solid ${INK}`, background: '#222'}}>{children}</div>
    {[0, 1, 2].map((r) => <div key={r} style={{position: 'absolute', left: w * 0.06, top: w * 0.8 + r * 22, height: 12, width: `${60 + rnd(r) * 30}%`, background: '#bdb6a6'}} />)}
  </div>
);
const Mini: React.FC<{s: number; ox?: number; oy?: number; children: React.ReactNode}> = ({s, ox = 0, oy = 0, children}) => (
  <div style={{position: 'absolute', left: ox, top: oy, width: W, height: H, transform: `scale(${s})`, transformOrigin: '0 0'}}>{children}</div>
);
const Stamp: React.FC<{text: string; x: number; y: number; size: number; rot?: number; col?: string}> = ({text, x, y, size, rot = -12, col = '#e5322d'}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg)`, padding: `${size * 0.06}px ${size * 0.25}px`, border: `${size * 0.11}px solid ${col}`, borderRadius: size * 0.14, ...font, fontSize: size, color: col, lineHeight: 1, background: 'rgba(255,255,255,0.12)', boxShadow: `0 0 0 ${size * 0.04}px ${INK}, inset 0 0 0 ${size * 0.04}px ${INK}`, WebkitTextStroke: `${size * 0.04}px ${INK}`, paintOrder: 'stroke fill', whiteSpace: 'nowrap'}}>{text}</div>
);
const NewsBG: React.FC = () => (<>
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 30% 40%, #1e4fa8 0%, #0a2558 50%, #04102a 100%)'}} />
  {Array.from({length: 14}, (_, i) => <div key={i} style={{position: 'absolute', left: rnd(i) * 1800 - 200, top: 60 + i * 70, width: 300 + rnd(i + 7) * 500, height: 4, borderRadius: 3, background: 'linear-gradient(90deg, rgba(120,190,255,0), rgba(160,210,255,0.7), rgba(120,190,255,0))'}} />)}
</>);
const Ticker: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, background: '#c3100a', borderTop: `10px solid ${INK}`, display: 'flex', alignItems: 'center'}}>
    <div style={{padding: '0 34px', height: '100%', display: 'flex', alignItems: 'center', background: '#fff', ...font, fontSize: 58, color: '#c3100a'}}>BREAKING</div>
    <div style={{...font, fontSize: 60, color: '#fff', paddingLeft: 30, whiteSpace: 'nowrap'}}>{text}</div>
  </div>
);
const Shocked: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (<>
  <Char k={US} acc="tie" eyes="scared" t={T} s={s} x={x} y={y} bob={false} sweat />
  <div style={{position: 'absolute', left: x - s * 0.53, top: y - s * 0.3, width: s * 0.11, height: s * 0.2, borderRadius: s * 0.05, background: '#1d1d1d', border: '4px solid #000'}} />
</>);
const CellMini: React.FC<{s: number; ox: number; oy: number}> = ({s, ox, oy}) => <Mini s={s} ox={ox} oy={oy}><Cell t={T} /></Mini>;

// --- 9 diseños ---
const D: Record<string, React.ReactNode> = {
  // ===== informativo =====
  n1: (<>
    <NewsBG />
    <Glow x={1200} y={500} r={700} c="rgba(255,220,120,0.35)" />
    <Paper x={760} y={120} w={860} rot={6} name="THE GLOBE DAILY" head="MADURO CAPTURED"><CellMini s={0.4} ox={0} oy={-40} /></Paper>
    <Stamp text="CAPTURED" x={1250} y={560} size={130} rot={-14} />
    <Shocked x={420} y={560} s={420} />
    <Title3D text="IN ONE NIGHT" x={480} y={60} size={120} grad={GOLD} glow="rgba(255,190,40,0.9)" rot={-4} />
    <Ticker text="US FORCES CAPTURE NICOLÁS MADURO" />
    <Vign />
  </>),
  n2: (<>
    <NewsBG />
    {/* tele gigante con la celda */}
    <div style={{position: 'absolute', left: 120, top: 80, width: 1680, height: 820, border: `16px solid ${INK}`, borderRadius: 24, overflow: 'hidden', boxShadow: '0 0 90px rgba(80,160,255,0.6)'}}>
      <Mini s={0.875} ox={0} oy={-60}><Cell t={T} /></Mini>
      <div style={{position: 'absolute', left: 24, top: 20, padding: '8px 22px', background: '#c3100a', ...font, fontSize: 46, color: '#fff'}}>● LIVE</div>
    </div>
    <Title3D text="BREAKING NEWS" x={W / 2} y={120} size={170} grad={REDG} glow="rgba(255,60,40,0.9)" rot={-3} />
    <Shocked x={1600} y={760} s={330} />
    <Ticker text="MADURO IN US CUSTODY" />
    <Vign />
  </>),
  n3: (<>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #5a4a3a, #1a120a 80%)'}} />
    <Rays x={W / 2} y={540} c="rgba(255,230,160,0.35)" a={0.5} r={1300} n={22} />
    <Paper x={80} y={190} w={640} rot={-12} name="EL DIARIO MUNDIAL" head="¡CAPTURADO!"><Mini s={0.32} ox={-30} oy={-20}><Cell t={T} /></Mini></Paper>
    <Paper x={1220} y={170} w={640} rot={10} name="WORLD EVENING POST" head="NIGHT RAID"><Mini s={0.32} ox={-20} oy={-30}><NightSky glow="#3a2030" /><Caracas y={700} lights={0.6} /><Heli t={T} w={500} x={900} y={400} tilt={-6} /></Mini></Paper>
    <Paper x={600} y={120} w={720} rot={-2} name="THE GLOBE DAILY" head="MADURO CAPTURED"><Mini s={0.36} ox={-40} oy={-40}><Cell t={T} /></Mini></Paper>
    <Title3D text="THE WHOLE WORLD" x={W / 2} y={20} size={100} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Title3D text="WAS SHOCKED" x={W / 2} y={880} size={140} grad={GOLD} glow="rgba(255,190,40,0.9)" />
    <Vign />
  </>),
  // ===== guerra =====
  w1: (<>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 60%, #2a1a14 0%, #0a0606 80%)'}} />
    <div style={{position: 'absolute', left: 260, top: 220, width: 1400, height: 910}}><Villa t={T} alarm /></div>
    {[[500, 430], [1420, 450], [760, 980]].map(([x, y], i) => <Boom key={i} x={x} y={y} r={80 + i * 15} t={0.5} t0={0} d={1.4} />)}
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      {[[300, 320, 40], [1640, 300, -40], [960, 160, 0]].map(([x, y, r], i) => <HeliMini key={i} x={x} y={y} s={300} rot={r} t={T + i} />)}
      {[[380, 560, 1200, 120], [1560, 560, 700, 160]].map(([a, b, c, d], i) => <line key={i} x1={a} y1={b} x2={c} y2={d} stroke="rgba(255,30,30,0.85)" strokeWidth={5} />)}
      {Array.from({length: 12}, (_, i) => { const x = 300 + rnd(i) * 1300, y = 300 + rnd(i + 4) * 500; return <line key={'t' + i} x1={x} y1={y} x2={x + 90} y2={y + 30} stroke="#ffe36b" strokeWidth={7} strokeLinecap="round" />; })}
    </svg>
    <Embers n={80} seed={9} c="#ffb35a" />
    <Title3D text="2:01 AM" x={W / 2} y={40} size={180} grad={WHITE} glow="rgba(255,80,60,0.9)" rot={-3} />
    <Title3D text="THE RAID" x={W / 2} y={860} size={150} grad={REDG} glow="rgba(255,60,40,0.9)" />
    <Vign />
  </>),
  w2: (<>
    <NightSky glow="#3a2030" /><Moon x={1650} y={150} r={70} />
    <Caracas y={820} lights={0.6} />
    <Boom x={400} y={760} r={260} t={0.6} t0={0} d={1.4} /><Boom x={1500} y={780} r={220} t={0.5} t0={0} d={1.4} />
    <Heli t={T} w={1300} x={900} y={430} tilt={-6} />
    <Char k={US} acc="delta" eyes="angry" t={T} s={190} x={760} y={470} look={-0.6} bob={false} />
    <CBall k={VE} size={170} x={980} y={490} eyes="scared" sweat />
    <AK x={560} y={520} w={300} rot={150} flip />
    <Embers n={60} seed={4} c="#ffb35a" />
    <Title3D text="WE GOT HIM." x={W / 2} y={830} size={170} grad={GOLD} glow="rgba(255,190,40,0.9)" />
    <Vign />
  </>),
  w3: (<>
    <NightSky glow="#2a1a3a" /><Caracas y={760} lights={0.8} />
    {[[300, 180, 20], [1500, 140, -25], [1700, 320, -15]].map(([x, y, r], i) => <Ico key={i} name="jet-fighter" x={x} y={y} w={180} c="#dfe6f0" rot={r + 180} glow="#ffb35a" />)}
    <Boom x={600} y={640} r={180} t={0.5} t0={0} d={1.4} /><Boom x={1350} y={620} r={200} t={0.6} t0={0} d={1.4} />
    <AbsoluteFill style={{background: 'radial-gradient(circle at 960px 560px, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 260px, rgba(0,0,0,0.6) 420px)'}} />
    <Char k={VE} acc="sash" eyes="scared" t={T} s={380} x={960} y={560} sweat bob={false} />
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><g transform="translate(960,560)">
      <circle r={300} fill="none" stroke="#ff3b30" strokeWidth={16} strokeDasharray="70 34" /><circle r={12} fill="#ff3b30" />
      {[[-420, 0, -220, 0], [420, 0, 220, 0], [0, -420, 0, -220], [0, 420, 0, 220]].map(([a, b, c, d], i) => <line key={i} x1={a} y1={b} x2={c} y2={d} stroke="#ff3b30" strokeWidth={16} />)}
    </g></svg>
    <Title3D text="TARGET LOCATED" x={W / 2} y={40} size={150} grad={REDG} glow="rgba(255,60,40,0.9)" rot={-3} />
    <Title3D text="NICOLÁS MADURO" x={W / 2} y={890} size={110} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Vign />
  </>),
};
// ===== estilo "vs the world" (fuego vs tormenta, diseñado a 1280x720) =====
const S: Record<string, React.ReactNode> = {
  s1: (<>
    <SplitBg /><Embers n={70} seed={31} c="#ffd27a" />
    <Smoke list={[[120, 640, 90], [300, 700, 110]]} />
    <Glow x={320} y={410} r={300} c="rgba(255,190,70,0.45)" />
    <Tracers from={[640, 465]} to={[880, 410]} />
    <CBall k={US} size={390} x={320} y={410} eyes="angry" look={0.6} rim="#ffcf6a" />
    <WarHelmet x={320} y={410 + 390 * 0.03} size={390 * 0.98} />
    <AK x={470} y={490} w={300} rot={40} />
    <Muzzle x={622} y={470} s={90} />
    <Char k={VE} acc="sash" eyes="scared" t={T} s={340} x={975} y={400} sweat look={-0.6} bob={false} />
    <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0}}>{[0.36, 0.64].map((fx, i) => <path key={i} d={`M${805 + fx * 340},${420} q6,40 10,80 a14,14 0 1 1 -24,0 q4,-40 14,-80 z`} fill="#8fd2ff" stroke={INK} strokeWidth={4} />)}</svg>
    <BoltFX seed={1} /><Vign />
    <Title3D text="USA VS" x={640} y={10} size={110} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Title3D text="MADURO" x={640} y={590} size={120} grad={GOLD} glow="rgba(255,190,40,0.8)" />
  </>),
  s2: (<>
    <SplitBg /><Embers n={70} seed={32} c="#ffd27a" />
    <Glow x={320} y={420} r={300} c="rgba(255,190,70,0.45)" />
    <CBall k={US} size={400} x={330} y={420} eyes="angry" look={0.6} rim="#ffcf6a" />
    <WarHelmet x={330} y={420 + 12} size={392} />
    <AK x={480} y={500} w={300} rot={40} />
    <Char k={VE} acc="sash" eyes="scared" t={T} s={330} x={975} y={410} sweat look={-0.6} bob={false} />
    <div style={{position: 'absolute', left: 900, top: 520, width: 1, height: 1}}><Ico name="handcuffs" x={75} y={20} w={170} c="#d8dee8" /></div>
    <BoltFX seed={2} /><Vign />
    <Title3D text="CAPTURED" x={640} y={10} size={120} grad={REDG} glow="rgba(255,60,40,0.85)" />
    <Title3D text="IN ONE NIGHT" x={640} y={590} size={110} grad={GOLD} glow="rgba(255,190,40,0.8)" />
  </>),
  s3: (<>
    <SplitBg dark /><Embers n={70} seed={33} c="#ffd27a" />
    {[[90, 160, 30], [250, 90, 20], [430, 190, 25]].map(([x, y, r], i) => <Ico key={i} name="jet-fighter" x={x} y={y} w={110} c="#dfe6f0" rot={r + 90} glow="#ffb35a" />)}
    <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><HeliMini x={300} y={430} s={260} rot={60} t={T} /><HeliMini x={480} y={330} s={160} rot={70} t={T + 1} /></svg>
    <Char k={VE} acc="sash" eyes="scared" t={T} s={340} x={975} y={400} sweat look={-0.6} bob={false} />
    <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0}}><g transform="translate(975,400)"><circle r={220} fill="none" stroke="#ff3b30" strokeWidth={10} strokeDasharray="44 22" />{[[-280, 0, -160, 0], [280, 0, 160, 0], [0, -280, 0, -160], [0, 280, 0, 160]].map(([a, b, c, d], i) => <line key={i} x1={a} y1={b} x2={c} y2={d} stroke="#ff3b30" strokeWidth={10} />)}</g></svg>
    <BoltFX seed={3} /><Vign />
    <Title3D text="150 AIRCRAFT" x={640} y={10} size={104} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Title3D text="VS 1 MAN" x={640} y={590} size={120} grad={GOLD} glow="rgba(255,190,40,0.8)" />
  </>),
};
export const ThumbMad: React.FC<{id: string}> = ({id}) => (
  <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    {D[id] ? D[id] : <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transform: 'scale(1.5)', transformOrigin: '0 0'}}>{S[id]}</div>}
  </AbsoluteFill>
);
export const MAD_IDS = [...Object.keys(D), ...Object.keys(S)];
