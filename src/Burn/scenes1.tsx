// Escenas 1: tráiler, la caída (B/N), la llamada, últimas noticias
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, font} from '../lib3';
import {CBall} from '../ThumbsCB';
import {Char} from '../Maduro/chars';
import {W, H, rnd, ip, pop, fade, Bubble, Ico, Big} from '../Maduro/lib';
import {OvalOffice, CallScreen, CIARoom, Letterbox} from '../Maduro/lib2';
import {FlagImg} from '../SameArmy';
import {COUNTRIES} from '../HexWorld';
import {D, Map, TintLayer, NukeLayer, Particles, Grain, Vig, shakeXY, Countdown, TText, BigStamp, toS, camKF, WORLD, kOf, Cam, RED, YEL, hms, BunkerLayer} from './kit';

export type SP = {t: number; T: number; p: any};
const BURNED = (a: number) => (D.burned as number[]).map((k) => ({k, col: '#2a0804', a}));
const AFTER_T = D.t_launch + 40;
const ballTalk = (bubs: any[], t: number, k: number) => bubs.some(([t0, kk, tx]: any) => kk === k && t > t0 && t < t0 + 0.35 + tx.length * 0.045);
const hopOf = (bubs: any[], t: number, k: number) => ballTalk(bubs, t, k) ? Math.abs(Math.sin(t * 15)) * 9 : 0;
const bubEnd = (bubs: any[], i: number, d: number) => (i + 1 < bubs.length ? bubs[i + 1][0] - 0.15 : d);

// ============ TRÁILER ============
export const COLD1: React.FC<SP> = ({t}) => {
  const cam = {cx: 3900, cy: 2050, s: ip(t, [0.6, 6.3], [0.27, 0.31], false)};
  return (<AbsoluteFill style={{background: '#000'}}>
    {t > 0.6 && t < 6.3 && <AbsoluteFill style={{opacity: ip(t, [0.6, 1.6], [0, 1])}}>
      <Map T={AFTER_T} cam={cam} warOn={false} filter="grayscale(0.55) contrast(1.15) brightness(0.75)" />
      <TintLayer cam={cam} items={BURNED(0.62)} />
      <NukeLayer T={AFTER_T} cam={cam} arcs={false} blasts={false} />
      <AbsoluteFill style={{background: 'rgba(120,20,0,0.25)', mixBlendMode: 'overlay'}} />
      <Particles t={t} kind="ember" n={60} />
      <Particles t={t} kind="ash" n={50} a={0.6} />
      <Vig a={0.85} />
      <TText t={t} t0={1.6} t1={6.3} text="2048" size={300} spacing={40} glow="rgba(255,120,40,0.7)" y={H / 2 - 30} />
      <TText t={t} t0={3.4} t1={6.3} text="THE WORLD AS WE KNOW IT IS GONE" size={44} spacing={10} y={H / 2 + 150} col="#ffcc99" />
      <div style={{position: 'absolute', right: 40, bottom: 90, ...font, fontSize: 22, color: 'rgba(255,255,255,0.55)', opacity: ip(t, [3.6, 4.2], [0, 1])}}>HYPOTHETICAL SIMULATION</div>
    </AbsoluteFill>}
    <Letterbox a={1.2} />
  </AbsoluteFill>);
};

const CutFX: React.FC<{t: number; c: any; i: number}> = ({t, c, i}) => {
  const cam: Cam = {cx: c.cam[0], cy: c.cam[1], s: c.cam[2] * (1 + t * 0.12)};
  const [ax, ay] = toS(c.A[0], c.A[1], cam), [bx, by] = toS(c.B[0], c.B[1], cam);
  const ms = [[ax, ay, bx, by, -0.25], [bx, by, ax + 40, ay + 30, -0.05], [ax - 50, ay + 40, bx + 60, by - 30, 0.08]];
  return (<AbsoluteFill>
    <Map T={0} cam={cam} warOn={false} filter={i % 2 ? 'saturate(0.6) contrast(1.2)' : 'saturate(0.8) contrast(1.1) brightness(0.9)'} />
    <TintLayer cam={cam} items={[{k: c.a, col: '#ff2a1a', a: 0.28}, {k: c.b, col: '#1a3aff', a: 0.18}]} />
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      {ms.map(([x0, y0, x1, y1, o], j) => {
        const u = Math.max(0, Math.min(1, (t - o) / 0.42)); const hgt = Math.hypot(x1 - x0, y1 - y0) * 0.3 + 40;
        const P = (q: number) => [x0 + (x1 - x0) * q, y0 + (y1 - y0) * q - Math.sin(q * Math.PI) * hgt];
        const pts = Array.from({length: 16}, (_, q) => P(Math.max(0, u - 0.5) + (u - Math.max(0, u - 0.5)) * q / 15));
        const [hx, hy] = P(u);
        const bt = t - (o + 0.42);
        return <g key={j}>
          <polyline points={pts.map((q) => q.join(',')).join(' ')} fill="none" stroke="rgba(235,235,240,0.8)" strokeWidth={9} strokeLinecap="round" />
          {u < 1 && <circle cx={hx} cy={hy} r={9} fill="#fff" stroke="#ff8a1f" strokeWidth={5} />}
          {bt > 0 && <><circle cx={x1} cy={y1} r={30 + bt * 260} fill={`rgba(255,${150 - bt * 200},40,${Math.max(0, 0.95 - bt * 1.6)})`} /><circle cx={x1} cy={y1} r={20 + bt * 160} fill={`rgba(255,250,220,${Math.max(0, 1 - bt * 3)})`} /></>}
        </g>;
      })}
    </svg>
    <AbsoluteFill style={{background: ['rgba(255,40,20,0.22)', 'rgba(40,120,255,0.18)', 'rgba(255,150,60,0.2)', 'rgba(20,30,90,0.3)'][i % 4], mixBlendMode: 'overlay'}} />
    {t < 0.06 && <AbsoluteFill style={{background: '#fff', opacity: 0.6}} />}
  </AbsoluteFill>);
};
export const COLD2: React.FC<SP> = ({t, p}) => {
  const n = p.cuts.length; const ci = Math.floor((t - 0.5) / 0.5); const lt = t - 0.5 - ci * 0.5;
  const inCuts = t >= 0.5 && ci < n;
  return (<AbsoluteFill style={{background: '#000', transform: shakeXY(t, inCuts && lt < 0.15 ? 16 : 0)}}>
    {inCuts && <CutFX t={lt} c={p.cuts[ci]} i={ci} />}
    {inCuts && <Vig a={0.7} />}
    <TText t={t} t0={0.05} t1={3.5} text="THE WORLD" size={150} spacing={24} glow="rgba(255,60,40,0.6)" />
    <TText t={t} t0={3.5} t1={8.1} text="IS AT WAR" size={170} spacing={24} col={t > 7.5 ? '#ff3b30' : '#fff'} glow="rgba(255,60,40,0.8)" />
    <Letterbox a={1.2} />
  </AbsoluteFill>);
};
const RimBall: React.FC<{k: number; x: number; t: number; t0: number}> = ({k, x, t, t0}) => {
  if (t < t0) return null; const a = ip(t, [t0, t0 + 0.5], [0, 1]); const s = 330;
  return (<div style={{position: 'absolute', left: 0, top: 0, opacity: a}}>
    <div style={{position: 'absolute', left: x - 260, top: 540 - 260, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,40,20,0.35), rgba(255,40,20,0) 70%)'}} />
    <div style={{position: 'absolute', left: 0, top: 0, filter: 'brightness(0.55) contrast(1.2)', transform: `scale(${ip(t, [t0, t0 + 3], [1, 1.04])})`, transformOrigin: `${x}px 540px`}}>
      <CBall k={k} size={s} x={x} y={540} eyes="angry" rim="#ff3b1a" />
    </div>
  </div>);
};
export const COLD3: React.FC<SP> = ({t}) => {
  const doorX = ip(t, [6.45, 6.75], [W + 100, 960 - 380], false);
  return (<AbsoluteFill style={{background: '#000'}}>
    {t < 3.6 && <AbsoluteFill>
      <RimBall k={kOf('US')} x={430} t={t} t0={0.1} />
      <RimBall k={kOf('RU')} x={960} t={t} t0={1.25} />
      <RimBall k={kOf('CN')} x={1490} t={t} t0={2.4} />
      <TText t={t} t0={0.2} t1={3.55} text="THREE SUPERPOWERS." size={64} y={880} spacing={12} />
    </AbsoluteFill>}
    {t >= 4.0 && t < 6.4 && <AbsoluteFill style={{background: `radial-gradient(ellipse, rgba(${120 + 80 * Math.abs(Math.sin(t * 5))},0,0,1), #000 70%)`, transform: shakeXY(t, 4)}}>
      <Countdown big sec={86400 - Math.floor((t - 4.0) / 0.24)} t={t} label="DEADLINE" />
      <TText t={t} t0={4.2} t1={6.4} text="ONE WARNING." size={64} y={850} spacing={12} />
    </AbsoluteFill>}
    {t >= 6.4 && <AbsoluteFill style={{background: 'linear-gradient(180deg, #2a2a2e, #121214)', transform: shakeXY(t, t > 6.75 && t < 7.1 ? 30 : 0)}}>
      {/* túnel y puerta blindada */}
      <div style={{position: 'absolute', left: 960 - 400, top: 160, width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, #ffe9b0 0%, #c9a05a 30%, #2a2014 70%)'}} />
      <div style={{position: 'absolute', left: doorX, top: 160, width: 760, height: 760, borderRadius: '50%', background: 'radial-gradient(circle at 45% 40%, #8a8e94, #4a4e54 60%, #2a2c30)', border: `16px solid ${INK}`, boxShadow: 'inset 0 0 60px rgba(0,0,0,0.6)'}}>
        {Array.from({length: 12}, (_, i) => { const a = (i / 12) * Math.PI * 2; return <div key={i} style={{position: 'absolute', left: 380 + Math.cos(a) * 320 - 22, top: 380 + Math.sin(a) * 320 - 22, width: 44, height: 44, borderRadius: '50%', background: '#2a2c30', border: `6px solid ${INK}`}} />; })}
        <div style={{position: 'absolute', left: 280, top: 280, width: 200, height: 200, borderRadius: '50%', border: `20px solid ${INK}`, background: '#6a6e74'}} />
        <div style={{position: 'absolute', left: 140, top: 350, width: 480, height: 60, background: '#ffc531', border: `8px solid ${INK}`, ...font, fontSize: 40, textAlign: 'center', lineHeight: '46px', color: INK}}>☢ SHELTER ☢</div>
      </div>
      {t > 6.75 && <AbsoluteFill style={{background: `rgba(180,170,150,${ip(t, [6.75, 7.6], [0.5, 0])})`}} />}
      <TText t={t} t0={7.3} t1={8.4} text="NO WAY BACK." size={90} y={540} spacing={16} glow="rgba(0,0,0,0.9)" />
    </AbsoluteFill>}
    <Letterbox a={1.2} />
  </AbsoluteFill>);
};
export const COLD4: React.FC<SP> = ({t}) => {
  const Tn = D.t_hit + t * 3.4; const cam = {cx: 3900, cy: 2000, s: ip(t, [0, 3.6], [0.28, 0.33], false)};
  const people = Math.round(ip(t, [3.75, 5.3], [8.2e9, 4.1e8]));
  return (<AbsoluteFill style={{background: '#000'}}>
    {t < 3.6 && <AbsoluteFill style={{transform: shakeXY(t, 10)}}>
      <Map T={0} cam={cam} warOn={false} night={0.5} />
      <NukeLayer T={Tn} cam={cam} />
      <AbsoluteFill style={{background: 'rgba(255,40,10,0.18)', mixBlendMode: 'overlay'}} />
      <Vig a={0.7} />
      <TText t={t} t0={0.3} t1={3.3} text="IN 24 HOURS..." size={110} spacing={18} glow="rgba(255,120,40,0.8)" />
    </AbsoluteFill>}
    {t > 3.3 && t < 3.9 && <AbsoluteFill style={{background: '#fff', opacity: ip(t, [3.3, 3.9], [1, 0])}} />}
    {t >= 3.6 && t < 5.55 && <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: 'monospace', fontWeight: 900, fontSize: 150, color: '#fff', textShadow: '0 0 40px rgba(255,60,40,0.7)'}}>{people.toLocaleString('en-US')}</div>
      <TText t={t} t0={4.5} t1={5.55} text="ONLY 5% SURVIVE" size={80} y={800} col="#ff3b30" spacing={14} />
    </AbsoluteFill>}
    {t >= 5.55 && <AbsoluteFill style={{transform: shakeXY(t, t < 6.0 ? 26 : 0)}}>
      <AbsoluteFill style={{filter: 'blur(3px) brightness(0.55)'}}>
        <Map T={AFTER_T} cam={{cx: 3900, cy: 2050, s: 0.3 + (t - 5.55) * 0.01}} warOn={false} filter="grayscale(0.5) brightness(0.8)" />
      </AbsoluteFill>
      <TintLayer cam={{cx: 3900, cy: 2050, s: 0.3 + (t - 5.55) * 0.01}} items={BURNED(0.4)} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 80%, rgba(255,90,20,0.45), rgba(0,0,0,0) 60%)'}} />
      <Particles t={t} kind="ember" n={90} />
      <Vig a={0.8} />
      <Big text="WHAT IF EARTH" y={250} size={150} sc={pop(t, 5.6, 0.35)} />
      <Big text="BURNED IN 24 HOURS?" y={430} size={150} col="#ff8a1f" sc={pop(t, 5.75, 0.35)} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', ...font, fontSize: 34, color: 'rgba(255,255,255,0.75)', letterSpacing: 8, opacity: ip(t, [6.4, 7.0], [0, 1])}}>A HYPOTHETICAL SIMULATION</div>
      {t > 5.55 && t < 5.8 && <AbsoluteFill style={{background: '#fff', opacity: ip(t, [5.55, 5.8], [0.9, 0])}} />}
    </AbsoluteFill>}
    <Letterbox a={ip(t, [7.5, 9], [1.2, 0])} />
  </AbsoluteFill>);
};

// ============ CAP 1: LA CAÍDA ============
const CONFLICT = ['UA', 'SD', 'ET', 'SY', 'YE', 'MM', 'CD', 'SO', 'ML', 'LY', 'AF', 'IQ', 'VE', 'HT', 'NG', 'PK', 'IN', 'IL', 'IR', 'RS'].map(kOf).filter((k) => k >= 0);
export const FALL1: React.FC<SP> = ({t, T}) => {
  const cam = {cx: ip(t, [0, 12], [4300, 4600], false), cy: ip(t, [0, 12], [2050, 2000], false), s: ip(t, [0, 12], [0.31, 0.38], false)};
  return (<AbsoluteFill>
    <Map T={T} cam={cam} bw={1} />
    <TintLayer cam={cam} items={CONFLICT.map((k, i) => ({k, col: '#ff2a1a', a: t > 2.5 + i * 0.45 ? 0.32 + 0.12 * Math.sin(t * 3 + i) : 0}))} />
    <Grain t={t} a={0.1} />
    <Vig a={0.7} />
  </AbsoluteFill>);
};
const FallBalls: React.FC<{t: number; p: any; d: number}> = ({t, p, d}) => {
  const bubs = p.bubs as any[];
  return (<>
    {[[p.a, 300, 'angry'], [p.b, W - 300, 'scared']].map(([k, x, e], i) => <div key={i} style={{position: 'absolute', left: 0, top: -hopOf(bubs, t, i), transform: `scale(${pop(t, 0.3 + i * 0.25, 0.35)})`, transformOrigin: `${x}px 820px`}}>
      <Char k={k as number} x={x as number} y={820} s={190} t={t} eyes={e as any} sweat={i === 1 && t > 4} />
    </div>)}
    {bubs.map(([t0, k, tx]: any, i: number) => <Bubble key={i} t={t} t0={t0} t1={Math.min(t0 + 3.2, d - 0.2)} x={k === 0 ? 360 : W - 360} y={680} text={tx} size={38} tail={k === 0 ? 'l' : 'r'} />)}
  </>);
};
const Vignette1: React.FC<SP & {d: number}> = ({t, T, p, d}) => {
  const cam = {cx: p.cam[0], cy: p.cam[1], s: p.cam[2] * ip(t, [0, d], [0.92, 1.08], false)};
  const flipT = (D.cev as any[]).filter((e) => e[0] >= T - t && e[0] <= T - t + d).map((e) => [e[2], e[0] - (T - t)]);
  return (<AbsoluteFill>
    <Map T={T} cam={cam} bw={1} />
    <TintLayer cam={cam} items={[{k: p.a, col: '#ff2a1a', a: 0.2}, {k: p.b, col: '#d8d8d8', a: 0.12}, ...flipT.map(([k, tf]: any) => ({k, col: '#ff2a1a', a: ip(t, [tf, tf + 1.0], [0, 0.4])}))]} />
    <Grain t={t} a={0.1} />
    <Vig a={0.6} />
    <FallBalls t={t} p={p} d={d} />
    {p.stamp && <BigStamp t={t} t0={p.stamp[0]} text={p.stamp[1]} y={420} size={110} />}
  </AbsoluteFill>);
};
export const FALL2: React.FC<SP> = (q) => <Vignette1 {...q} d={9} />;
export const FALL3: React.FC<SP> = (q) => <Vignette1 {...q} d={9} />;
export const FALL4: React.FC<SP> = (q) => <Vignette1 {...q} d={9} />;
export const FALL5: React.FC<SP> = ({t, T, p}) => {
  const g = p.gone as number[]; const cols = 6;
  return (<AbsoluteFill style={{background: '#0c0c0c'}}>
    <AbsoluteFill style={{filter: 'blur(4px) brightness(0.35)'}}><Map T={T} cam={{cx: 4300, cy: 2000, s: 0.34}} bw={1} warOn={false} /></AbsoluteFill>
    <Grain t={t} a={0.12} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', ...font, fontSize: 64, color: '#fff', letterSpacing: 4, opacity: ip(t, [0.2, 0.6], [0, 1])}}>COUNTRIES THAT NO LONGER EXIST</div>
    {g.map((k, i) => {
      const x = 260 + (i % cols) * 280, y = 360 + Math.floor(i / cols) * 300; const tx = 1.0 + 0.42 * i;
      const xd = t > tx;
      return <div key={i} style={{position: 'absolute', left: 0, top: 0, transform: `scale(${pop(t, 0.3 + i * 0.05, 0.3)})`, transformOrigin: `${x}px ${y}px`}}>
        <div style={{position: 'absolute', left: 0, top: 0, filter: xd ? 'grayscale(1) brightness(0.7)' : undefined}}><CBall k={k} size={170} x={x} y={y} eyes={xd ? 'dead' : 'scared'} /></div>
        {xd && <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><g transform={`translate(${x},${y}) scale(${ip(t, [tx, tx + 0.15], [1.8, 1])})`}><path d="M-80,-80 L80,80 M80,-80 L-80,80" stroke="#ff2a1a" strokeWidth={22} strokeLinecap="round" /></g></svg>}
        <div style={{position: 'absolute', left: x - 140, width: 280, top: y + 100, textAlign: 'center', ...font, fontSize: 26, color: xd ? '#ff6a5a' : '#ddd'}}>{(COUNTRIES[k]?.n || '').toUpperCase()}</div>
      </div>;
    })}
    <Vig a={0.6} />
  </AbsoluteFill>);
};
export const FALL6: React.FC<SP> = ({t, T, p}) => {
  const cam = WORLD; const W_ = p.west.map(kOf), E_ = p.east.map(kOf);
  const wn = Math.round(ip(t, [3.0, 4.6], [0, 5600])), en = Math.round(ip(t, [3.6, 5.2], [0, 6400]));
  const Panel: React.FC<{x: number; t0: number; k: number; name: string; col: string; n: number}> = ({x, t0, k, name, col, n}) => t < t0 ? null : (
    <div style={{position: 'absolute', left: x, top: 640, width: 360, transform: `scale(${pop(t, t0, 0.35)})`, padding: '14px 20px', borderRadius: 20, background: 'rgba(8,12,24,0.88)', border: `6px solid ${col}`, textAlign: 'center'}}>
      <div style={{...font, fontSize: 44, color: col}}>{name}</div>
      <div style={{fontFamily: 'monospace', fontWeight: 900, fontSize: 64, color: '#fff'}}>{n.toLocaleString('en-US')}</div>
      <div style={{...font, fontSize: 24, color: '#cfd8e8'}}>NUCLEAR WARHEADS</div>
    </div>
  );
  return (<AbsoluteFill>
    <Map T={T} cam={cam} bw={ip(t, [0, 1.2], [1, 0])} />
    <TintLayer cam={cam} items={[...W_.map((k: number, i: number) => ({k, col: '#2a7bff', a: ip(t, [3.0 + i * 0.02, 3.3 + i * 0.02], [0, 0.55])})), ...E_.map((k: number, i: number) => ({k, col: '#ff2a1a', a: ip(t, [3.6 + i * 0.02, 3.9 + i * 0.02], [0, 0.55])}))]} />
    <Vig a={0.5} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', opacity: ip(t, [1.0, 1.5], [0, 1])}}><div style={{display: 'inline-block', padding: '10px 36px', borderRadius: 16, background: 'rgba(8,12,24,0.85)', border: `5px solid ${INK}`, ...font, fontSize: 56, color: '#fff'}}>TWO BLOCS. ONE PLANET.</div></div>
    <Panel x={140} t0={3.0} k={0} name="THE WEST" col="#3a8bff" n={wn} />
    <Panel x={W - 500} t0={3.6} k={0} name="THE EAST" col="#ff4a3a" n={en} />
    {t > 4.2 && <Big text="VS" y={690} size={130} col={YEL} sc={pop(t, 4.2, 0.3)} />}
  </AbsoluteFill>);
};

// ============ CAP 2: LA LLAMADA ============
const Speaker: React.FC<{t: number; k: number; x: number; y: number; s: number; label: string; bubs: any[]; idx: number; acc?: any; eyes?: any; phone?: boolean}> = ({t, k, x, y, s, label, bubs, idx, acc = 'tie', eyes = 'normal', phone}) => {
  const hop = hopOf(bubs, t, idx);
  return (<>
    <div style={{position: 'absolute', left: 0, top: -hop, width: W, height: H}}><Char k={k} acc={acc} eyes={eyes} t={t} s={s} x={x} y={y} label={label} /></div>
    {phone && <div style={{position: 'absolute', left: x + s * 0.32, top: y - s * 0.1 - hop, width: 1, height: 1, transform: `rotate(${-20 + (ballTalk(bubs, t, idx) ? Math.sin(t * 12) * 4 : 0)}deg)`}}><Ico name="phone" x={0} y={0} w={s * 0.42} c="#1d1d1d" /></div>}
  </>);
};
export const CALL1: React.FC<SP> = ({t, p}) => {
  const bubs = p.bubs; const zoom = ip(t, [11.8, 15.5], [1, 1.18]);
  return (<AbsoluteFill>
    <OvalOffice t={t} zoom={zoom}>
      <Speaker t={t} k={kOf('US')} x={960} y={560} s={300} label="PRESIDENT · USA" bubs={bubs} idx={0} phone eyes={t > 8.4 ? 'scared' : 'normal'} />
    </OvalOffice>
    <CallScreen t={t} t0={2.7} t1={15.8} label="PENTAGON">
      <CIARoom t={t} />
      <div style={{position: 'absolute', left: 0, top: -hopOf(bubs, t, 1) * 0.5, width: 420, height: 300}}><Char k={kOf('US')} acc="general" eyes="angry" t={t} s={150} x={210} y={175} /></div>
    </CallScreen>
    {bubs.map(([t0, k, tx]: any, i: number) => <Bubble key={i} t={t} t0={t0} t1={bubEnd(bubs, i, 15.8)} x={k === 0 ? 900 : 1430} y={k === 0 ? 380 : 470} text={tx} size={40} tail={k === 0 ? 'c' : 'r'} />)}
    {t > 11.8 && <AbsoluteFill style={{background: 'rgba(255,30,20,0.16)', mixBlendMode: 'multiply', opacity: ip(t, [11.8, 12.6], [0, 1])}} />}
    <Vig a={0.45} />
  </AbsoluteFill>);
};
const Room: React.FC<{t: number; wall: [string, string]; k: number; accent: string; children?: React.ReactNode; alarm?: number}> = ({t, wall, k, accent, children, alarm = 0}) => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, ${wall[0]}, ${wall[1]})`, overflow: 'hidden'}}>
    {[0.18, 0.5, 0.82].map((f, i) => <div key={i} style={{position: 'absolute', left: `${f * 100}%`, top: 90, width: 120, height: 360, marginLeft: -60, background: 'linear-gradient(180deg, #2a3a5a, #0e1626)', border: `10px solid ${accent}`, borderRadius: '60px 60px 0 0'}} />)}
    <div style={{position: 'absolute', left: 0, right: 0, top: 470, height: 14, background: accent}} />
    <div style={{position: 'absolute', left: '50%', top: 130, marginLeft: -160, width: 0}}><div style={{position: 'absolute', left: 0, top: 0, width: 8, height: 420, background: '#c9a64a'}} /><FlagImg k={k} w={150} h={100} style={{position: 'absolute', left: 8, top: 10, transform: `skewY(${Math.sin(t * 2) * 3}deg)`}} /></div>
    <div style={{position: 'absolute', left: '50%', marginLeft: -300, top: 700, width: 600, height: 400, background: 'linear-gradient(180deg, #6a3a1a, #3a1e0a)', border: `8px solid ${INK}`, borderRadius: 10}} />
    {children}
    <div style={{position: 'absolute', left: '50%', marginLeft: -40, top: 650, width: 80, height: 60, background: '#1d1d1d', borderRadius: 10, border: '4px solid #000'}} />
    {alarm > 0 && <AbsoluteFill style={{background: `rgba(255,20,10,${alarm * (0.15 + 0.15 * Math.abs(Math.sin(t * 6)))})`}} />}
  </AbsoluteFill>
);
export const CALL2: React.FC<SP> = ({t, p}) => {
  const bubs = p.bubs; const al = ip(t, [9.6, 10.2], [0, 1]);
  return (<AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: W / 2 - 6, height: H, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: -W / 4, top: 0, width: W, height: H}}>
        <Room t={t} wall={['#7a1a1a', '#4a0e0e']} k={kOf('RU')} accent="#d8b45a" alarm={al}>
          <Speaker t={t} k={kOf('RU')} x={W / 2} y={560} s={300} label="RUSSIA" bubs={bubs} idx={0} eyes="smug" phone />
        </Room>
      </div>
    </div>
    <div style={{position: 'absolute', left: W / 2 + 6, top: 0, width: W / 2 - 6, height: H, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: -W / 4, top: 0, width: W, height: H}}>
        <Room t={t} wall={['#8a1010', '#5a0606']} k={kOf('CN')} accent="#ffcf3a" alarm={al}>
          <Speaker t={t} k={kOf('CN')} x={W / 2} y={560} s={300} label="CHINA" bubs={bubs} idx={1} eyes="angry" phone />
        </Room>
      </div>
    </div>
    <div style={{position: 'absolute', left: W / 2 - 6, top: 0, width: 12, height: H, background: INK}} />
    <div style={{position: 'absolute', left: W / 2 - 170, top: 40, width: 340, padding: '6px 0', borderRadius: 12, background: '#000', border: '4px solid #3ad16a', ...font, fontSize: 28, color: '#3ad16a', textAlign: 'center'}}>● ENCRYPTED LINE</div>
    {bubs.map(([t0, k, tx]: any, i: number) => <Bubble key={i} t={t} t0={t0} t1={bubEnd(bubs, i, 12.3)} x={k === 0 ? W / 4 : (3 * W) / 4} y={380} text={tx} size={36} />)}
    <Vig a={0.5} />
  </AbsoluteFill>);
};
export const CALL3: React.FC<SP> = ({t, p}) => {
  const bubs = p.bubs; const ks = ['US', 'RU', 'CN'].map(kOf); const pw = W / 3;
  const bl = Math.floor(t * 3) % 2 === 0;
  return (<AbsoluteFill style={{background: '#000', transform: shakeXY(t, t > 9 && t < 9.4 ? 20 : 0)}}>
    {ks.map((k, i) => <div key={i} style={{position: 'absolute', left: i * pw + 6, top: 150, width: pw - 12, height: 760, overflow: 'hidden', borderRadius: 20, border: `6px solid ${ballTalk(bubs, t, i) ? YEL : '#333'}`, background: 'radial-gradient(ellipse at 50% 40%, #2a3448, #0a0e18)'}}>
      <div style={{position: 'absolute', left: 0, top: -hopOf(bubs, t, i), width: pw, height: 760}}><Char k={k} acc={i === 0 ? 'tie' : i === 1 ? 'general' : 'tie'} eyes="angry" t={t} s={260} x={pw / 2 - 6} y={430} label={['USA', 'RUSSIA', 'CHINA'][i]} /></div>
      <div style={{position: 'absolute', left: 14, top: 12, ...font, fontSize: 22, color: '#ff3b30'}}>● LIVE</div>
    </div>)}
    <div style={{position: 'absolute', left: 0, right: 0, top: 30, height: 96, background: bl ? '#c3100a' : '#7a0805', borderTop: `6px solid ${INK}`, borderBottom: `6px solid ${INK}`, ...font, fontSize: 62, color: '#fff', textAlign: 'center', lineHeight: '84px', letterSpacing: 10}}>DEFCON 1</div>
    {bubs.map(([t0, k, tx]: any, i: number) => <Bubble key={i} t={t} t0={t0} t1={Math.min(bubEnd(bubs, i, 8.9), 8.9)} x={pw * k + pw / 2} y={400} text={tx} size={k === 0 ? 30 : 40} />)}
    {t > 9.0 && <AbsoluteFill style={{background: 'rgba(0,0,0,0.75)'}}><Countdown big sec={86400} t={t} label="THE DEADLINE" /></AbsoluteFill>}
    {t < 0.25 && <AbsoluteFill style={{background: '#fff', opacity: 0.5 - t * 2}} />}
  </AbsoluteFill>);
};
const SiloPins: React.FC<{t: number; cam: Cam; groups: [string, number, string][]}> = ({t, cam, groups}) => (
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
    {groups.map(([c, t0, lab], gi) => {
      if (t < t0) return null; const pts = D.silo[c] as number[][]; const sc = pop(t, t0, 0.3);
      const sp = pts.map(([x, y]) => toS(x, y, cam)); const mx = sp.reduce((a, b) => a + b[0], 0) / sp.length, my = sp.reduce((a, b) => a + b[1], 0) / sp.length;
      return <g key={gi}>
        {sp.map(([X, Y], i) => <g key={i}><circle cx={X} cy={Y} r={(10 + 14 * ((t * 1.2 + i * 0.3) % 1)) * sc} fill="none" stroke="#ff3b30" strokeWidth={3} opacity={1 - ((t * 1.2 + i * 0.3) % 1)} /><circle cx={X} cy={Y} r={7 * sc} fill="#ff3b30" stroke={INK} strokeWidth={3} /></g>)}
        <g transform={`translate(${mx},${my}) scale(${ip(t, [t0, t0 + 0.35], [2.2, 1])}) rotate(${(t - t0) * 30})`} opacity={ip(t, [t0, t0 + 0.2], [0, 1])}>
          <circle r={70} fill="none" stroke={YEL} strokeWidth={5} strokeDasharray="30 18" />
          {[0, 90, 180, 270].map((a) => <line key={a} x1={0} y1={-90} x2={0} y2={-56} stroke={YEL} strokeWidth={6} transform={`rotate(${a})`} />)}
        </g>
        <text x={mx} y={my + 120} textAnchor="middle" style={{...font, fontSize: 34}} fill="#fff" stroke={INK} strokeWidth={8} paintOrder="stroke">{lab}</text>
      </g>;
    })}
  </svg>
);
export const CALL4: React.FC<SP> = ({t, T}) => {
  const cam = {cx: 3840, cy: 1700, s: ip(t, [0, 8], [0.3, 0.34], false)};
  return (<AbsoluteFill>
    <Map T={T} cam={cam} night={0.45} warOn={false} />
    <AbsoluteFill style={{background: 'rgba(255,30,20,0.1)', mixBlendMode: 'overlay'}} />
    <SiloPins t={t} cam={cam} groups={[['US', 0.6, 'USA · 1,700 READY'], ['RU', 1.3, 'RUSSIA · 1,600 READY'], ['CN', 2.0, 'CHINA · 600 READY']]} />
    <Vig a={0.6} />
  </AbsoluteFill>);
};

// ============ CAP 3: ÚLTIMA HORA ============
const Paper: React.FC<{name: string; head: string; children?: React.ReactNode}> = ({name, head, children}) => (
  <div style={{position: 'absolute', inset: 0, background: '#f2eee4', border: `8px solid ${INK}`}}>
    <div style={{textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: 40, fontWeight: 900, color: INK, borderBottom: `5px double ${INK}`, padding: '10px 0'}}>{name}</div>
    <div style={{textAlign: 'center', ...font, fontSize: 66, color: '#b0100a', margin: '10px 0'}}>{head}</div>
    <div style={{position: 'absolute', left: 30, right: 30, top: 170, height: 290, overflow: 'hidden', border: `4px solid ${INK}`, background: '#222'}}>{children}</div>
    {[0, 1, 2].map((r) => <div key={r} style={{margin: '0 30px', position: 'absolute', top: 480 + r * 26, height: 12, width: `${60 + rnd(r) * 30}%`, background: '#bdb6a6'}} />)}
  </div>
);
const MiniMap: React.FC<{T: number; t: number; cam: Cam; scale: number; nuke?: boolean}> = ({T, t, cam, scale, nuke}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `scale(${scale})`, transformOrigin: '0 0'}}>
    <Map T={T} cam={cam} night={0.4} warOn={false} />
    <SiloPins t={t} cam={cam} groups={[['US', 0, ''], ['RU', 0, ''], ['CN', 0, '']]} />
    {nuke && <NukeLayer T={D.t_hit + (t % 6) * 2} cam={cam} />}
  </div>
);
export const NEWS: React.FC<SP> = ({t, T, p}) => {
  const bubs = p.bubs; const hop = hopOf(bubs, t, 0);
  const ticker = 'BREAKING: NUCLEAR STRIKES ANNOUNCED IN 24 HOURS  •  USA, RUSSIA AND CHINA ON HIGHEST ALERT  •  GOVERNMENTS ORDER EVACUATIONS  •  FIND THE NEAREST SHELTER  •  ';
  const papers: [number, string, string, Cam][] = [[5.6, 'THE GLOBE DAILY', '24 HOURS LEFT', {cx: 3840, cy: 1800, s: 0.3}], [9.6, 'WORLD EVENING POST', 'FIND A SHELTER', {cx: 1900, cy: 1500, s: 0.6}], [13.0, 'EL DIARIO MUNDIAL', '¿EL FIN?', {cx: 4400, cy: 1300, s: 0.55}]];
  const al = p.alert as number[]; const alertOn = t > al[0] && t < al[1];
  return (<AbsoluteFill style={{background: '#06142e', overflow: 'hidden'}}>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 30% 40%, #1e4fa8 0%, #0a2558 50%, #04102a 100%)'}} />
    {Array.from({length: 14}, (_, i) => <div key={i} style={{position: 'absolute', left: ((rnd(i) * 2400 + t * (120 + rnd(i + 3) * 200)) % 2600) - 400, top: 80 + i * 60, width: 300 + rnd(i + 7) * 400, height: 3 + (i % 3), borderRadius: 3, background: 'linear-gradient(90deg, rgba(120,190,255,0), rgba(160,210,255,0.7), rgba(120,190,255,0))'}} />)}
    <div style={{position: 'absolute', left: 1010, top: 110, width: 820, height: 470, border: `12px solid ${INK}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 0 60px rgba(80,160,255,0.5)'}}>
      <MiniMap T={T} t={t} cam={{cx: 3840, cy: 1800, s: 0.3}} scale={0.427} />
      <div style={{position: 'absolute', left: 16, top: 12, padding: '4px 14px', background: '#c3100a', ...font, fontSize: 26, color: '#fff'}}>● LIVE</div>
      <div style={{position: 'absolute', right: 16, top: 12, padding: '4px 14px', background: '#000', ...font, fontSize: 26, color: '#ff3b30'}}>☢ {hms(86400 - 1200 - t * 270)}</div>
    </div>
    <div style={{position: 'absolute', left: 80, top: 700, width: 900, height: 220, background: 'linear-gradient(180deg, #2a4a8a, #12285a)', border: `8px solid ${INK}`, borderRadius: '24px 24px 0 0'}}><div style={{position: 'absolute', left: 30, top: 30, ...font, fontSize: 44, color: YEL}}>WORLD NEWS 24</div></div>
    <div style={{position: 'absolute', left: 0, top: -hop, width: W, height: H}}>
      <Char k={kOf('GB')} acc="tie" eyes={t > 11 ? 'scared' : 'normal'} sweat={t > 7.6} t={t} s={300} x={520} y={540} />
      <div style={{position: 'absolute', left: 520 - 158, top: 450, width: 34, height: 60, borderRadius: 14, background: '#1d1d1d', border: '4px solid #000'}} />
      <div style={{position: 'absolute', left: 640, top: 600, width: 150, height: 110, background: '#fbfbf6', border: `5px solid ${INK}`, transform: `rotate(${-12 + (ballTalk(bubs, t, 0) ? Math.sin(t * 6) * 3 : 0)}deg)`}}>{[0, 1, 2, 3].map((r) => <div key={r} style={{margin: '12px 14px 0', height: 8, background: '#bcbcbc'}} />)}</div>
    </div>
    {bubs.map(([t0, _k, tx]: any, i: number) => <Bubble key={i} t={t} t0={t0} t1={bubEnd(bubs, i, 14.8)} x={560} y={330} text={tx} size={42} />)}
    {papers.map(([t0, n, h, cam], i) => { if (t < t0 || t > t0 + 4.4) return null; const k = ip(t, [t0, t0 + 0.6], [0, 1]); const o = ip(t, [t0 + 3.9, t0 + 4.4], [1, 0]);
      return <div key={i} style={{position: 'absolute', left: 1080 + (i - 1) * 40, top: 150 + (i % 2) * 30, width: 640, height: 600, opacity: o, transform: `rotate(${(1 - k) * 540 + (i - 1) * 5}deg) scale(${0.1 + k * 0.9})`, boxShadow: '0 20px 50px rgba(0,0,0,0.6)'}}><Paper name={n} head={h}><div style={{position: 'absolute', left: -60, top: -40}}><MiniMap T={T} t={t} cam={cam} scale={0.33} nuke={i === 2} /></div></Paper></div>; })}
    <div style={{position: 'absolute', left: 0, right: 0, top: 930, height: 100, background: '#c3100a', borderTop: `8px solid ${INK}`, display: 'flex', alignItems: 'center'}}>
      <div style={{flex: '0 0 auto', padding: '0 30px', height: '100%', display: 'flex', alignItems: 'center', background: '#fff', ...font, fontSize: 42, color: '#c3100a'}}>BREAKING</div>
      <div style={{overflow: 'hidden', whiteSpace: 'nowrap', flex: 1}}><div style={{display: 'inline-block', transform: `translateX(${-(t * 300) % 3600}px)`, ...font, fontSize: 44, color: '#fff'}}>{ticker + ticker}</div></div>
    </div>
    {alertOn && <AbsoluteFill style={{background: `rgba(0,0,0,${ip(t, [al[0], al[0] + 0.3], [0, 0.72])})`}}>
      <AbsoluteFill style={{background: `rgba(255,0,0,${0.12 + 0.12 * Math.abs(Math.sin(t * 6))})`}} />
      <div style={{position: 'absolute', left: W / 2 - 280, top: ip(t, [al[0], al[0] + 0.45], [H, 90]), width: 560, height: 900, borderRadius: 70, background: '#111', border: '14px solid #2a2a2a', boxShadow: '0 30px 80px rgba(0,0,0,0.8)'}}>
        <div style={{position: 'absolute', left: 30, right: 30, top: 70, bottom: 60, borderRadius: 30, background: 'linear-gradient(180deg, #2a3550, #10141f)'}}>
          <div style={{position: 'absolute', left: 30, right: 30, top: 140, borderRadius: 26, background: 'rgba(240,240,245,0.96)', padding: '24px 26px', transform: `scale(${pop(t, al[0] + 0.5, 0.35)})`}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, ...font, fontSize: 30, color: '#c3100a'}}>⚠ EMERGENCY ALERT</div>
            <div style={{fontFamily: 'Fredoka', fontWeight: 700, fontSize: 31, color: '#111', marginTop: 10, lineHeight: 1.25}}>BALLISTIC MISSILE THREAT IN 24 HOURS. SEEK IMMEDIATE SHELTER. THIS IS NOT A DRILL.</div>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 40, textAlign: 'center', fontFamily: 'Fredoka', fontWeight: 700, fontSize: 70, color: '#fff'}}>{hms(86400 - 6000 - (t - al[0]) * 300).slice(0, 5)}</div>
        </div>
      </div>
    </AbsoluteFill>}
    <div style={{position: 'absolute', right: 30, bottom: 108, ...font, fontSize: 20, color: 'rgba(255,255,255,0.5)'}}>News channel and newspapers are fictional</div>
  </AbsoluteFill>);
};
export {BunkerLayer};
