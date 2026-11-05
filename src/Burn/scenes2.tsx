// Escenas 2: búnkeres, pánico, impacto, bajo tierra, la señal y la salida
import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {INK, font} from '../lib3';
import {CBall} from '../ThumbsCB';
import {Char} from '../Maduro/chars';
import {Soldiers} from '../Maduro/lib2';
import {W, H, rnd, ip, pop, Bubble, Big} from '../Maduro/lib';
import {D, Map, TintLayer, NukeLayer, BunkerLayer, Particles, Grain, Vig, shakeXY, Countdown, BigStamp, toS, camKF, WORLD, kOf, Cam, YEL, HumanityBar, ShelterCards, kfv} from './kit';
import type {SP} from './scenes1';

const BURN_ITEMS = (a: number) => (D.burned as number[]).map((k) => ({k, col: '#2a0804', a}));
const bubEnd = (bubs: any[], i: number, d: number) => (i + 1 < bubs.length ? bubs[i + 1][0] - 0.15 : d);
const talking = (bubs: any[], t: number, k: number) => bubs.some(([t0, kk, tx]: any) => kk === k && t > t0 && t < t0 + 0.35 + tx.length * 0.045);
const hop = (bubs: any[], t: number, k: number) => talking(bubs, t, k) ? Math.abs(Math.sin(t * 15)) * 9 : 0;

// token en el mapa: icono en círculo, con estela
const Token: React.FC<{cam: Cam; a: number[]; b: number[]; t: number; t0: number; t1: number; icon: string; k: number; size?: number; hold?: number}> = ({cam, a, b, t, t0, t1, icon, k, size = 30, hold = 1.2}) => {
  if (t < t0 || t > t1 + hold) return null;
  const u = Math.max(0, Math.min(1, (t - t0) / (t1 - t0))); const ue = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
  const [ax, ay] = toS(a[0], a[1], cam), [bx, by] = toS(b[0], b[1], cam); const x = ax + (bx - ax) * ue, y = ay + (by - ay) * ue - Math.sin(ue * Math.PI) * 30;
  const op = t > t1 ? ip(t, [t1, t1 + hold], [1, 0]) : 1; const flip = bx < ax;
  return (<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: op}}>
    <line x1={ax} y1={ay} x2={x} y2={y} stroke="rgba(255,255,255,0.6)" strokeWidth={5} strokeDasharray="4 12" strokeLinecap="round" />
    <circle cx={x} cy={y} r={size} fill={k >= 0 ? '#1f3a8a' : '#333'} stroke={INK} strokeWidth={4} />
    <image href={staticFile('hw/icons/' + icon + '.svg')} x={x - size * 0.7} y={y - size * 0.7} width={size * 1.4} height={size * 1.4} transform={flip ? `translate(${2 * x},0) scale(-1,1)` : undefined} style={{filter: 'invert(1)'}} />
  </svg>);
};
const GovPin: React.FC<{cam: Cam; at: number[]; t: number; t0: number; label: string; dx?: number}> = ({cam, at, t, t0, label, dx = 0}) => {
  if (t < t0) return null; const [X0, Y] = toS(at[0], at[1], cam); const X = X0 + dx; const s = pop(t, t0, 0.35);
  return (<div style={{position: 'absolute', left: X, top: Y, transform: `translate(-50%,-100%) scale(${s})`, transformOrigin: '50% 100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    <div style={{padding: '6px 16px', borderRadius: 12, background: '#ffc531', border: `5px solid ${INK}`, ...font, fontSize: 30, color: INK, whiteSpace: 'nowrap'}}>⭐ {label}</div>
    <div style={{width: 0, height: 0, borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderTop: `18px solid ${INK}`}} />
  </div>);
};
const pl = (n: string) => D.pl[n] as number[];
const gv = (n: string) => (D.gov as any[]).find((g) => g.name === n).at as number[];

// ============ CAP 4: BÚNKERES ============
export const VIP1: React.FC<SP> = ({t, T}) => {
  const dc = pl('DC'), chy = gv('CHEYENNE MTN');
  const cam = camKF(t, [[0, dc[0], dc[1], 1.1], [2.6, dc[0], dc[1] - 10, 1.8], [7.6, dc[0] - 20, dc[1] - 20, 1.9], [9.6, (dc[0] + chy[0]) / 2, dc[1] - 20, 1.0], [14, (dc[0] + chy[0]) / 2, dc[1] - 30, 1.08]]);
  return (<AbsoluteFill>
    <Map T={T} cam={cam} night={0.3} warOn={false} />
    <Token cam={cam} a={dc} b={gv('MOUNT WEATHER')} t={t} t0={3.0} t1={4.2} icon="helicopter" k={0} />
    <Token cam={cam} a={dc} b={gv('RAVEN ROCK')} t={t} t0={4.6} t1={5.8} icon="helicopter" k={0} />
    <Token cam={cam} a={dc} b={gv('RAVEN ROCK')} t={t} t0={6.2} t1={7.4} icon="helicopter" k={0} />
    <Token cam={cam} a={dc} b={chy} t={t} t0={9.6} t1={12.6} icon="commercial-airplane" k={0} size={36} />
    <GovPin cam={cam} at={gv('MOUNT WEATHER')} t={t} t0={4.2} label="MOUNT WEATHER" dx={110} />
    <GovPin cam={cam} at={gv('RAVEN ROCK')} t={t} t0={5.8} label="RAVEN ROCK" dx={-110} />
    <GovPin cam={cam} at={chy} t={t} t0={12.4} label="CHEYENNE MOUNTAIN" />
    {t > 2.6 && t < 8.4 && (() => { const [X, Y] = toS(dc[0], dc[1], cam); return <div style={{position: 'absolute', left: X - 22, top: Y - 22, width: 44, height: 44, borderRadius: '50%', background: '#fff', border: `5px solid ${INK}`, ...font, fontSize: 22, textAlign: 'center', lineHeight: '34px'}}>DC</div>; })()}
    <Vig a={0.55} />
  </AbsoluteFill>);
};
export const VIP2: React.FC<SP> = ({t, T}) => {
  const mos = pl('MOS'), bei = pl('BEI'), pyo = pl('PYO');
  const cam = camKF(t, [[0, mos[0] + 200, mos[1] + 20, 0.9], [4.6, mos[0] + 260, mos[1] + 40, 0.95], [5.6, bei[0] + 20, bei[1] + 30, 1.6], [10, bei[0] + 60, bei[1] + 40, 1.7]]);
  return (<AbsoluteFill>
    <Map T={T} cam={cam} night={0.3} warOn={false} />
    <Token cam={cam} a={mos} b={gv('KOSVINSKY')} t={t} t0={1.2} t1={2.4} icon="helicopter" k={0} />
    <Token cam={cam} a={mos} b={gv('YAMANTAU')} t={t} t0={3.4} t1={4.6} icon="helicopter" k={0} />
    <Token cam={cam} a={bei} b={gv('WESTERN HILLS')} t={t} t0={5.6} t1={6.8} icon="helicopter" k={0} size={26} />
    <Token cam={cam} a={pyo} b={[pyo[0] + 20, pyo[1] - 25]} t={t} t0={7.8} t1={9.0} icon="helicopter" k={0} size={26} />
    <GovPin cam={cam} at={gv('KOSVINSKY')} t={t} t0={2.4} label="KOSVINSKY MOUNTAIN" />
    <GovPin cam={cam} at={gv('YAMANTAU')} t={t} t0={4.6} label="YAMANTAU" />
    <GovPin cam={cam} at={gv('WESTERN HILLS')} t={t} t0={6.8} label="WESTERN HILLS" />
    <GovPin cam={cam} at={pyo} t={t} t0={9.0} label="PYONGYANG" />
    <Vig a={0.55} />
  </AbsoluteFill>);
};
const Mountain: React.FC<{dark?: number}> = ({dark = 0}) => (<>
  <AbsoluteFill style={{background: `linear-gradient(180deg, #3a4a6a ${0}%, #8a6a5a 60%)`, filter: `brightness(${1 - dark})`}} />
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
    <path d="M-50,760 L300,330 L520,520 L860,170 L1260,560 L1500,380 L1980,760 Z" fill="#4a4038" stroke={INK} strokeWidth={8} />
    <path d="M860,170 L760,300 L820,290 L860,330 L910,280 L960,300 Z" fill="#e8e8ee" />
    <rect x={0} y={760} width={W} height={320} fill="#3a3a3a" />
    <rect x={0} y={760} width={W} height={14} fill="#222" />
  </svg>
</>);
export const DOOR: React.FC<SP> = ({t}) => {
  const walk = ip(t, [0.3, 5.0], [0, 1], false); const gate = ip(t, [5.4, 6.4], [0, 1]);
  const people: [string, number, any, string][] = [['US', 0, 'tie', 'PRESIDENT'], ['US', -260, 'general', 'GENERAL'], ['GB', -500, 'none', 'VIP'], ['AE', -720, 'none', 'BILLIONAIRE']];
  const sol = Array.from({length: 4}, (_, i) => ({x: -150 - i * 240 + walk * 1180 + (i % 2) * 40, y: 740, k: kOf('US'), dir: 1, sz: 90}));
  return (<AbsoluteFill style={{overflow: 'hidden', transform: shakeXY(t, t > 6.3 && t < 6.7 ? 22 : 0)}}>
    <Mountain />
    {/* boca del túnel */}
    <div style={{position: 'absolute', left: 1180, top: 520, width: 520, height: 400, borderRadius: '260px 260px 0 0', background: 'radial-gradient(ellipse at 50% 80%, #ffe0a0, #6a4a2a 60%, #1a1208)', border: `12px solid ${INK}`, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${gate * 50}%`, background: 'repeating-linear-gradient(0deg, #6a6e74 0 40px, #4a4e54 40px 46px)', borderRight: `8px solid ${INK}`}} />
      <div style={{position: 'absolute', right: 0, top: 0, bottom: 0, width: `${gate * 50}%`, background: 'repeating-linear-gradient(0deg, #6a6e74 0 40px, #4a4e54 40px 46px)', borderLeft: `8px solid ${INK}`}} />
    </div>
    <div style={{position: 'absolute', left: 1240, top: 470, padding: '4px 20px', background: '#ffc531', border: `6px solid ${INK}`, ...font, fontSize: 34, color: INK}}>☢ RESTRICTED</div>
    {people.map(([c, off, acc, lab], i) => { const x = 120 + off + walk * 1300; if (x > 1520 || gate > 0.6) return null;
      return <div key={i} style={{position: 'absolute', left: 0, top: -Math.abs(Math.sin(t * 9 + i)) * 10, width: W, height: H}}><Char k={kOf(c)} acc={acc} eyes={i >= 2 ? 'shades' : 'scared'} t={t} s={i === 0 ? 170 : 140} x={x} y={i === 0 ? 670 : 690} label={lab} />
        {i >= 2 && <div style={{position: 'absolute', left: x + 50, top: 710, width: 70, height: 50, borderRadius: 8, background: '#6a4a2a', border: `5px solid ${INK}`}} />}</div>; })}
    {gate < 0.6 && <Soldiers list={sol.filter((s) => s.x < 1500)} t={t} />}
    <BigStamp t={t} t0={7.0} text="SEALED" x={1440} y={700} size={120} />
    <Vig a={0.5} />
  </AbsoluteFill>);
};
export const BUNK: React.FC<SP> = ({t, T, p}) => {
  const ch = toW('CH'), fi = toW('FI'), kr = pl('SEO'), ru = pl('MOS');
  const cam = camKF(t, [[0, ch[0], ch[1] - 40, 1.0], [1.6, ch[0], ch[1], 2.2], [3.4, ch[0], ch[1], 2.3], [4.6, fi[0], fi[1], 1.5], [5.9, fi[0], fi[1], 1.5], [6.8, kr[0], kr[1], 1.8], [8.0, kr[0], kr[1], 1.8], [9.0, ru[0], ru[1], 1.4], [10.4, ru[0], ru[1], 1.4], [11.8, WORLD.cx, WORLD.cy, WORLD.s], [17, WORLD.cx, WORLD.cy - 30, WORLD.s * 1.05]]);
  const spaces = Math.round(ip(t, [1.4, 12.0], [0, 410], false));
  const lab = (p.labels as any[]).filter(([t0]) => t > t0).pop();
  return (<AbsoluteFill>
    <Map T={T} cam={cam} night={0.3} warOn={false} />
    <BunkerLayer T={T} cam={cam} gov={1} />
    <Vig a={0.5} />
    {lab && t < 11.6 && <div key={lab[0]} style={{position: 'absolute', left: 0, right: 0, top: 160, textAlign: 'center'}}><div style={{display: 'inline-block', transform: `scale(${pop(t, lab[0], 0.3)})`, padding: '10px 30px', borderRadius: 16, background: 'rgba(8,12,24,0.88)', border: `5px solid #39b6ff`, ...font, fontSize: 46, color: '#fff'}}>{lab[2]}</div></div>}
    <div style={{position: 'absolute', left: 44, bottom: 60, padding: '12px 26px', borderRadius: 18, background: 'rgba(8,12,24,0.88)', border: `5px solid ${INK}`}}>
      <div style={{...font, fontSize: 26, color: '#9fd4ff'}}>SHELTER SPACES WORLDWIDE</div>
      <div style={{fontFamily: 'monospace', fontWeight: 900, fontSize: 60, color: '#fff'}}>{spaces} MILLION</div>
    </div>
    {t > 12.0 && <BigStamp t={t} t0={12.0} text="ONLY 5%" y={520} size={150} col={YEL} />}
  </AbsoluteFill>);
};
const toW = (c: string) => { const k = kOf(c); const g = (D.pub as number[][]).filter((b) => b[4] === k); const x = g.reduce((a, b) => a + b[0], 0) / g.length, y = g.reduce((a, b) => a + b[1], 0) / g.length; return [x, y]; };

// ============ CAP 5: PÁNICO ============
export const RIOT1: React.FC<SP> = ({t, T, p}) => {
  const cam = {cx: p.cam[0], cy: p.cam[1], s: p.cam[2] * ip(t, [0, 12], [1, 1.12], false)};
  const R = D.riot as number[][];
  return (<AbsoluteFill>
    <Map T={T} cam={cam} night={0.25} warOn={false} />
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      {R.map(([x, y], i) => {
        const t0 = 2.4 + i * 0.35; if (t < t0) return null; const [X, Y] = toS(x, y, cam); const sc = pop(t, t0, 0.3);
        return <g key={i}>
          <circle cx={X} cy={Y} r={(40 + 30 * ((t * 1.3 + i * 0.2) % 1)) * sc} fill="none" stroke="#ff3b30" strokeWidth={4} opacity={1 - ((t * 1.3 + i * 0.2) % 1)} />
          {Array.from({length: 18}, (_, j) => { const a = rnd(i * 31 + j) * Math.PI * 2, r = 10 + rnd(j + i) * 34; return <circle key={j} cx={X + Math.cos(a + t * (rnd(j) - 0.5) * 3) * r} cy={Y + Math.sin(a + t * (rnd(j + 2) - 0.5) * 3) * r * 0.7} r={4} fill={['#fff', '#ffd23f', '#ff8a6a'][j % 3]} stroke={INK} strokeWidth={1.5} />; })}
          <g transform={`translate(${X},${Y - 46}) scale(${sc})`}><rect x={-26} y={-18} width={52} height={36} rx={4} fill="#f2eee4" stroke={INK} strokeWidth={4} /><path d="M-30,-18 L30,-18 L24,-30 L-24,-30 Z" fill="#e5322d" stroke={INK} strokeWidth={4} /><text y={10} textAnchor="middle" style={{...font, fontSize: 16}} fill={INK}>FOOD</text></g>
          {Math.floor(t * 4 + i) % 3 === 0 && <text x={X + 30} y={Y - 20} style={{...font, fontSize: 30}}>💥</text>}
        </g>;
      })}
    </svg>
    <div style={{position: 'absolute', left: 44, bottom: 60, padding: '12px 26px', borderRadius: 18, background: 'rgba(8,12,24,0.88)', border: `5px solid ${INK}`, opacity: ip(t, [2.6, 3.0], [0, 1])}}>
      <div style={{...font, fontSize: 26, color: '#ff9a8a'}}>STORES LOOTED</div>
      <div style={{fontFamily: 'monospace', fontWeight: 900, fontSize: 60, color: '#fff'}}>{Math.round(ip(t, [2.6, 12], [0, 184000], false)).toLocaleString('en-US')}</div>
    </div>
    <Vig a={0.55} />
  </AbsoluteFill>);
};
const Street: React.FC<{t: number}> = ({t}) => (<>
  <AbsoluteFill style={{background: 'linear-gradient(180deg, #2a1a3a, #6a3a3a 60%, #3a2a2a)'}} />
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
    {Array.from({length: 12}, (_, i) => <rect key={i} x={i * 170 - 20} y={300 + rnd(i) * 160} width={150} height={600} fill="#1e1626" stroke={INK} strokeWidth={4} />)}
    {Array.from({length: 40}, (_, i) => <rect key={'w' + i} x={(i % 12) * 170 + 20 + (i % 3) * 40} y={340 + Math.floor(i / 12) * 70 + rnd(i % 12) * 160} width={22} height={30} fill={rnd(i + 5) > 0.5 ? '#ffd27a' : '#2a2030'} />)}
    <rect x={0} y={860} width={W} height={220} fill="#2a2a2e" />
  </svg>
  <AbsoluteFill style={{background: Math.floor(t * 3) % 2 ? 'rgba(255,30,30,0.12)' : 'rgba(30,60,255,0.12)'}} />
</>);
export const RIOT2: React.FC<SP> = ({t, p}) => {
  const bubs = p.bubs; const fight = t > 0.9 && t < 4.6;
  const A = 760 + (fight ? Math.sin(t * 9) * 40 : 0), B = 1120 - (fight ? Math.sin(t * 9) * 40 : 0);
  return (<AbsoluteFill style={{overflow: 'hidden'}}>
    <Street t={t} />
    {t < 5.0 && <>
      <div style={{position: 'absolute', left: 560, top: 380, width: 800, height: 480, background: '#d8d0c0', border: `8px solid ${INK}`}}>
        <div style={{position: 'absolute', left: -20, right: -20, top: -10, height: 90, background: 'repeating-linear-gradient(90deg, #e5322d 0 80px, #fff 80px 160px)', border: `8px solid ${INK}`, ...font, fontSize: 64, textAlign: 'center', color: INK, lineHeight: '74px'}}>MARKET</div>
        <div style={{position: 'absolute', left: 60, right: 60, top: 140, height: 280, background: '#3a4250', border: `6px solid ${INK}`}}>{[0, 1, 2].map((r) => <div key={r} style={{position: 'absolute', left: 10, right: 10, top: 20 + r * 90, height: 8, background: '#8a8a8a'}} />)}</div>
      </div>
      <div style={{position: 'absolute', left: 0, top: -hop(bubs, t, 0), width: W, height: H}}><Char k={kOf('FR')} eyes="angry" t={t} s={220} x={A} y={790} /></div>
      <div style={{position: 'absolute', left: 0, top: -hop(bubs, t, 1), width: W, height: H}}><Char k={kOf('DE')} eyes="angry" t={t} s={220} x={B} y={790} /></div>
      <div style={{position: 'absolute', left: (A + B) / 2 - 40 + Math.sin(t * 9) * 50, top: 660, width: 80, height: 100, borderRadius: 10, background: 'linear-gradient(90deg, #c0c4ca, #8a8e94)', border: `6px solid ${INK}`}}><div style={{marginTop: 30, height: 34, background: '#e5322d', ...font, fontSize: 20, color: '#fff', textAlign: 'center'}}>BEANS</div></div>
      {fight && Math.floor(t * 5) % 2 === 0 && <div style={{position: 'absolute', left: (A + B) / 2 - 60 + rnd(Math.floor(t * 5)) * 60, top: 600, ...font, fontSize: 90}}>💥</div>}
    </>}
    {t >= 5.0 && <>
      <div style={{position: 'absolute', left: 1200, top: 300, width: 520, height: 580, background: '#5a5e64', border: `10px solid ${INK}`}}>
        <div style={{position: 'absolute', left: 30, right: 30, top: 30, padding: '8px 0', background: '#ffc531', border: `6px solid ${INK}`, ...font, fontSize: 40, textAlign: 'center', color: INK}}>PUBLIC SHELTER</div>
        <div style={{position: 'absolute', left: 90, right: 90, bottom: 0, height: ip(t, [6.0, 6.6], [0, 420]), background: 'repeating-linear-gradient(0deg, #8a8e94 0 36px, #6a6e74 36px 42px)', borderTop: `8px solid ${INK}`, top: 'auto'}} />
      </div>
      {Array.from({length: 7}, (_, i) => { const x = 1000 - i * 150 + ip(t, [5.0, 6.2], [0, 120]); const k = ['IT', 'ES', 'FR', 'DE', 'PL', 'NL', 'BE'][i];
        return <div key={i} style={{position: 'absolute', left: 0, top: -Math.abs(Math.sin(t * 8 + i)) * 8, width: W, height: H}}><Char k={kOf(k)} eyes={t > 6.6 ? 'scared' : 'normal'} tears={t > 7.2 && i < 2} t={t} s={150} x={x} y={820} /></div>; })}
      <BigStamp t={t} t0={7.0} text="FULL" x={1460} y={640} size={130} />
    </>}
    {bubs.map(([t0, k, tx]: any, i: number) => <Bubble key={i} t={t} t0={t0} t1={bubEnd(bubs, i, 9.8)} x={k === 0 ? A : k === 1 ? B : 1000} y={k === 2 ? 640 : 610} text={tx} size={44} />)}
    <Vig a={0.55} />
  </AbsoluteFill>);
};
export const RUSH: React.FC<SP> = ({t, T}) => {
  const cam = camKF(t, [[0, 4000, 1400, 0.85], [5.4, 3950, 1450, 0.75], [9.0, WORLD.cx, WORLD.cy, WORLD.s]]);
  const list = D.pub as number[][]; const full = Array.from({length: 30}, (_, i) => list[Math.floor(rnd(i + 40) * list.length)]);
  return (<AbsoluteFill>
    <Map T={T} cam={cam} night={0.35} warOn={false} />
    <BunkerLayer T={T} cam={cam} gov={1} flow={ip(t, [0, 1, 6, 9], [0.4, 1, 1, 0])} />
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      {full.map((b, i) => { const t0 = 1.5 + i * 0.28; if (t < t0) return null; const [X, Y] = toS(b[0], b[1], cam); if (X < 0 || X > W || Y < 0 || Y > H) return null;
        return <g key={i} transform={`translate(${X},${Y - 22}) scale(${pop(t, t0, 0.3)})`}><rect x={-34} y={-15} width={68} height={28} rx={6} fill="#ff3b30" stroke={INK} strokeWidth={3} /><text y={7} textAnchor="middle" style={{...font, fontSize: 20}} fill="#fff">FULL</text></g>; })}
    </svg>
    <Vig a={0.55} />
  </AbsoluteFill>);
};
export const COUNT: React.FC<SP> = ({t, p}) => (<AbsoluteFill style={{background: `radial-gradient(ellipse, rgba(${80 + 60 * Math.max(0, Math.sin(t * Math.PI * 2))},0,0,1), #000 70%)`}}>
  <Countdown big sec={Math.ceil(kfv(p.cd, t))} t={t} label="IMPACT IN" />
  {t > 5.5 && <AbsoluteFill style={{background: '#000', opacity: ip(t, [5.5, 6], [0, 1])}} />}
</AbsoluteFill>);

// ============ CAP 6: IMPACTO ============
export const NUKE: React.FC<SP> = ({t, T}) => {
  const cam = camKF(t, [[0, WORLD.cx, WORLD.cy - 150, WORLD.s * 1.08], [9.0, WORLD.cx, WORLD.cy - 200, WORLD.s * 1.12], [15, 4300, 1500, 0.4], [19.5, WORLD.cx, WORLD.cy - 150, WORLD.s * 1.1]]);
  const N = D.nuke; const launched = (N.arcs as number[][]).filter((a) => a[0] <= T).length; const air = Math.round(launched / N.arcs.length * 3900);
  const recent = (N.blasts as number[][]).filter((b) => T - b[0] > 0 && T - b[0] < 0.4).length;
  const flash = t > 20 ? ip(t, [20, 20.15, 21.6], [0, 1, 0]) : 0;
  return (<AbsoluteFill style={{background: '#000'}}>
    <AbsoluteFill style={{transform: shakeXY(t, Math.min(26, recent * 5))}}>
      <Map T={T} cam={cam} night={0.5} warOn={false} />
      <TintLayer cam={cam} items={BURN_ITEMS(ip(t, [10, 20], [0, 0.45]))} />
      <NukeLayer T={T} cam={cam} />
      {t < 3 && <AbsoluteFill style={{background: `rgba(255,0,0,${0.18 * Math.abs(Math.sin(t * 5))})`}} />}
      <Particles t={t} kind="ash" n={60} a={ip(t, [14, 20], [0, 0.8])} />
      <Vig a={0.7} />
    </AbsoluteFill>
    {t < 3.0 && <div style={{position: 'absolute', left: 0, right: 0, top: 160, textAlign: 'center'}}><div style={{display: 'inline-block', padding: '10px 40px', background: Math.floor(t * 4) % 2 ? '#c3100a' : '#000', border: '6px solid #ff3b30', ...font, fontSize: 64, color: '#fff', letterSpacing: 8}}>⚠ LAUNCH DETECTED</div></div>}
    {t > 3.1 && t < 6.4 && <BigStamp t={t} t0={3.1} text="WAVE 1" y={160} size={80} col="#ff8a6a" rot={0} />}
    {t > 6.5 && t < 9.4 && <BigStamp t={t} t0={6.5} text="WAVE 2" y={160} size={80} col="#ff8a6a" rot={0} />}
    {t > 3 && t < 20 && <div style={{position: 'absolute', left: 44, bottom: 60, padding: '12px 26px', borderRadius: 18, background: 'rgba(8,12,24,0.88)', border: `5px solid ${INK}`}}>
      <div style={{...font, fontSize: 26, color: '#ff9a8a'}}>WARHEADS LAUNCHED</div>
      <div style={{fontFamily: 'monospace', fontWeight: 900, fontSize: 64, color: '#fff'}}>{air.toLocaleString('en-US')}</div>
    </div>}
    {t > 9.0 && <HumanityBar T={T} t={t} t0={9.0} />}
    {flash > 0 && <AbsoluteFill style={{background: '#fff', opacity: flash}} />}
  </AbsoluteFill>);
};
const Smoke: React.FC<{t: number; a: number; rise?: number}> = ({t, a, rise = 0}) => a <= 0 ? null : (
  <AbsoluteFill style={{pointerEvents: 'none', opacity: a, filter: 'blur(26px)'}}>
    {Array.from({length: 26}, (_, i) => { const x = rnd(i) * W, y = H * (0.25 + rnd(i + 4) * 0.7) - rise * (200 + rnd(i + 9) * 300); const r = 120 + rnd(i + 2) * 200 + t * 6;
      return <div key={i} style={{position: 'absolute', left: x - r + Math.sin(t * 0.3 + i) * 60, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: `rgba(${30 + rnd(i + 1) * 30},${25 + rnd(i + 1) * 20},${22},0.7)`}} />; })}
  </AbsoluteFill>
);
export const AFTER: React.FC<SP> = ({t, T}) => {
  const cam = {cx: 4000, cy: 1900, s: ip(t, [0, 15], [0.34, 0.3], false)};
  const dark = ip(t, [9.6, 14.5], [0, 0.55]);
  return (<AbsoluteFill>
    <Map T={T} cam={cam} night={0.25 + dark * 0.5} warOn={false} filter={`saturate(${1 - dark})`} />
    <TintLayer cam={cam} items={BURN_ITEMS(0.5)} />
    <NukeLayer T={T} cam={cam} arcs={false} blasts={false} glow={1 - dark * 0.8} />
    <Smoke t={t} a={ip(t, [0, 4.8, 9], [0.25, 0.4, 0.8])} rise={ip(t, [4.8, 9.2], [0, 1])} />
    <Particles t={t} kind="ember" n={50} a={ip(t, [0, 6, 10], [1, 0.8, 0.1])} />
    <Particles t={t} kind="ash" n={70} />
    {t > 9.6 && <div style={{position: 'absolute', right: 120, top: 120, width: 170, height: 170, borderRadius: '50%', background: 'radial-gradient(circle, #fff6c0, #ffb030 60%, rgba(255,150,40,0))', opacity: ip(t, [9.6, 10, 14], [0, 1, 0.12]), boxShadow: '0 0 80px rgba(255,200,80,0.6)'}} />}
    <HumanityBar T={T} t={t} t0={-1} />
    <Vig a={0.7} />
  </AbsoluteFill>);
};
const Stat: React.FC<{t: number; t0: number; x: number; label: string; val: string; col: string}> = ({t, t0, x, label, val, col}) => t < t0 ? null : (
  <div style={{position: 'absolute', left: x, top: 640, width: 400, transform: `scale(${pop(t, t0, 0.35)})`, padding: '14px 20px', borderRadius: 20, background: 'rgba(8,12,24,0.88)', border: `6px solid ${col}`, textAlign: 'center'}}>
    <div style={{fontFamily: 'monospace', fontWeight: 900, fontSize: 80, color: col}}>{val}</div>
    <div style={{...font, fontSize: 30, color: '#fff'}}>{label}</div>
  </div>
);
export const WINTER: React.FC<SP> = ({t, T}) => {
  const cam = {cx: 3900, cy: 2000, s: 0.3};
  return (<AbsoluteFill>
    <Map T={T} cam={cam} night={0.25} warOn={false} filter="grayscale(0.85) brightness(1.05) contrast(0.9)" />
    <TintLayer cam={cam} items={BURN_ITEMS(0.4)} />
    <AbsoluteFill style={{background: 'rgba(220,230,245,0.28)'}} />
    <Particles t={t} kind="snow" n={110} />
    <Stat t={t} t0={1.0} x={180} label="AVERAGE TEMPERATURE" val="-10°C" col="#9fd4ff" />
    <Stat t={t} t0={1.8} x={W / 2 - 200} label="SUNLIGHT" val="-70%" col={YEL} />
    <Stat t={t} t0={2.6} x={W - 580} label="HARVESTS" val="-90%" col="#ff6a5a" />
    <HumanityBar T={T} t={t} t0={-1} />
    <Vig a={0.6} />
  </AbsoluteFill>);
};

// ============ CAP 7: BAJO TIERRA ============
const yearAt = (T: number) => kfv(D.years, T);
export const YearHUD: React.FC<{T: number; t: number}> = ({T, t}) => (
  <div style={{position: 'absolute', left: 44, top: 36, padding: '6px 26px 10px', borderRadius: 18, background: 'rgba(8,12,24,0.82)', border: '4px solid rgba(255,255,255,0.25)'}}>
    <div style={{...font, fontSize: 24, color: YEL, letterSpacing: 4}}>YEAR</div>
    <div style={{...font, fontSize: 70, lineHeight: '70px', color: '#fff'}}>{Math.floor(yearAt(T))}</div>
  </div>
);
const winterCam = {cx: 3950, cy: 1950, s: 0.3};
export const ALIVE: React.FC<SP> = ({t, T}) => (<AbsoluteFill>
  <Map T={T} cam={winterCam} night={0.45} warOn={false} filter="grayscale(0.8) brightness(0.9)" />
  <TintLayer cam={winterCam} items={BURN_ITEMS(0.4)} />
  <AbsoluteFill style={{background: 'rgba(200,215,235,0.18)'}} />
  <BunkerLayer T={T} cam={winterCam} mode="life" gov={1} size={1.1} />
  <Particles t={t} kind="snow" n={60} a={0.6} />
  <Vig a={0.6} />
  <HumanityBar T={T} t={t} t0={-1} />
  <ShelterCards T={T} t={t} t0={3.0} />
  <YearHUD T={T} t={t} />
</AbsoluteFill>);
// sección transversal de un búnker
const Section: React.FC<{t: number; food: number; dark?: number; red?: number; k: number; name: string; children?: React.ReactNode}> = ({t, food, dark = 0, red = 0, k, name, children}) => {
  const flick = rnd(Math.floor(t * 12)) > 0.93 ? 0.35 : 0;
  const cans = Math.round(food / 100 * 36);
  return (<AbsoluteFill style={{background: '#1a1a1e', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 170, background: 'linear-gradient(180deg, #8a9098, #c8ccd2)'}} />
    <Particles t={t} kind="snow" n={30} a={0.7} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 170, height: 40, background: '#e8ecf0'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 210, bottom: 0, background: 'repeating-linear-gradient(180deg, #5a4a3a 0 30px, #4e4032 30px 60px)'}} />
    {/* habitaciones */}
    <div style={{position: 'absolute', left: 120, top: 290, width: 1680, height: 720, background: '#d8d2c4', border: `12px solid ${INK}`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 350, height: 12, background: INK}} />
      <div style={{position: 'absolute', left: 820, top: 0, bottom: 0, width: 12, background: INK}} />
      {/* literas */}
      {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: 40 + i * 250, top: 60, width: 210, height: 260}}>{[0, 1].map((r) => <div key={r} style={{position: 'absolute', left: 0, right: 0, top: r * 130 + 60, height: 34, background: '#4a6a9a', border: `5px solid ${INK}`, borderRadius: 6}} />)}</div>)}
      <div style={{position: 'absolute', left: 30, top: 14, ...font, fontSize: 28, color: INK}}>DORMS</div>
      {/* almacén */}
      <div style={{position: 'absolute', left: 860, top: 14, ...font, fontSize: 28, color: INK}}>FOOD STORE</div>
      {[0, 1, 2].map((r) => <div key={r} style={{position: 'absolute', left: 880, right: 40, top: 90 + r * 85, height: 10, background: '#6a5a4a'}} />)}
      {Array.from({length: 36}, (_, i) => i < cans ? <div key={i} style={{position: 'absolute', left: 890 + (i % 12) * 64, top: 40 + Math.floor(i / 12) * 85, width: 46, height: 50, borderRadius: 6, background: 'linear-gradient(90deg, #c0c4ca, #8a8e94)', border: `4px solid ${INK}`}}><div style={{marginTop: 14, height: 14, background: i % 3 ? '#e5322d' : '#2a7bff'}} /></div> : null)}
      {/* generador */}
      <div style={{position: 'absolute', left: 30, top: 374, ...font, fontSize: 28, color: INK}}>COMMON ROOM</div>
      <div style={{position: 'absolute', left: 860, top: 374, ...font, fontSize: 28, color: INK}}>GENERATOR · WATER · AIR</div>
      <div style={{position: 'absolute', left: 900, top: 430, width: 260, height: 200, background: '#3a5a3a', border: `6px solid ${INK}`, borderRadius: 10}}>{[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: 20 + i * 80, top: 30, width: 50, height: 50, borderRadius: '50%', background: rnd(Math.floor(t * 3) + i) > 0.5 ? '#3ad16a' : '#1a4a2a', border: '4px solid #000'}} />)}</div>
      <div style={{position: 'absolute', left: 1220, top: 430, width: 160, height: 220, borderRadius: '20px 20px 0 0', background: 'linear-gradient(180deg, #4a8ad8, #2a5a9a)', border: `6px solid ${INK}`}} />
      <div style={{position: 'absolute', left: 1430, top: 440, width: 160, height: 160, borderRadius: '50%', border: `10px solid ${INK}`, background: '#888', transform: `rotate(${t * 200}deg)`}}><div style={{position: 'absolute', left: 60, top: 0, width: 20, height: 140, background: INK}} /></div>
      {children}
    </div>
    <div style={{position: 'absolute', left: 120, top: 220, padding: '6px 22px', background: '#ffc531', border: `6px solid ${INK}`, display: 'flex', alignItems: 'center', gap: 14, ...font, fontSize: 36, color: INK}}>{name}</div>
    <div style={{position: 'absolute', right: 120, top: 210, width: 420, padding: '8px 16px', borderRadius: 14, background: 'rgba(8,12,24,0.9)', border: `5px solid ${INK}`}}>
      <div style={{display: 'flex', justifyContent: 'space-between', ...font, fontSize: 28, color: '#fff'}}><span>FOOD LEFT</span><span style={{color: food > 50 ? '#3bd16f' : food > 20 ? '#ffc23a' : '#ff3b30'}}>{Math.round(food)}%</span></div>
      <div style={{height: 22, borderRadius: 8, background: '#2a2a2e', border: '3px solid #000', overflow: 'hidden', marginTop: 4}}><div style={{width: `${food}%`, height: '100%', background: food > 50 ? '#3bd16f' : food > 20 ? '#ffc23a' : '#ff3b30'}} /></div>
    </div>
    <AbsoluteFill style={{background: `rgba(0,0,0,${dark + flick})`}} />
    {red > 0 && <AbsoluteFill style={{background: `rgba(255,0,0,${red * (0.12 + 0.1 * Math.abs(Math.sin(t * 5)))})`}} />}
  </AbsoluteFill>);
};
export const INSIDE: React.FC<SP> = ({t, T, p}) => {
  const food = kfv(p.food, t); const k = kOf('CH');
  const walkers = [[260, 585, 0], [480, 585, 1], [700, 585, 2], [400, 945, 3], [640, 945, 4]];
  return (<AbsoluteFill>
    <Section t={t} food={food} k={k} name="SHELTER 17 · BERN">
      {walkers.map(([x0, y, i]) => { const x = x0 + Math.sin(t * 0.6 + i) * 120; return <div key={i} style={{position: 'absolute', left: -120, top: -290 - Math.abs(Math.sin(t * 6 + i)) * 5, width: W, height: H}}><Char k={k} t={t} s={110} x={x} y={y} eyes="normal" /></div>; })}
      {t > 6 && <div style={{position: 'absolute', left: 300, top: 420, ...font, fontSize: 30, color: INK, padding: '6px 16px', background: '#fff', border: `4px solid ${INK}`, borderRadius: 10}}>RATION: 1 CAN / DAY</div>}
    </Section>
    <YearHUD T={T} t={t} />
  </AbsoluteFill>);
};
export const FIGHT: React.FC<SP> = ({t, T, p}) => {
  const food = kfv(p.food, t); const k = kOf('US'); const bubs = p.bubs; const fight = t > 4.8 && t < 8.8;
  const lost = t > p.lost[0];
  const cx = [740, 980, 1220];
  return (<AbsoluteFill style={{transform: shakeXY(t, fight ? 8 : 0)}}>
    <Section t={t} food={food} k={k} name="BUNKER 9 · OHIO" dark={lost ? ip(t, [9.6, 10.4], [0, 0.75]) : 0.1} red={ip(t, [1, 2], [0, 1])}>
      {cx.map((x0, i) => { const x = x0 + (fight ? Math.sin(t * 10 + i * 2) * 60 : 0); const dead = i === 1 && t > 8.4;
        return <div key={i} style={{position: 'absolute', left: -120, top: -290 - hop(bubs, t, i), width: W, height: H}}><Char k={k} t={t} s={150} x={x} y={925} rot={dead ? 80 : 0} eyes={dead ? 'dead' : 'angry'} sweat={!dead} /></div>; })}
      {fight && Math.floor(t * 5) % 2 === 0 && <div style={{position: 'absolute', left: 820 + rnd(Math.floor(t * 5)) * 200, top: 560, ...font, fontSize: 90}}>💥</div>}
    </Section>
    {bubs.map(([t0, kk, tx]: any, i: number) => <Bubble key={i} t={t} t0={t0} t1={bubEnd(bubs, i, 8.6)} x={cx[kk]} y={760} text={tx} size={40} />)}
    {lost && <BigStamp t={t} t0={p.lost[0]} text={p.lost[1]} size={100} />}
    <YearHUD T={T} t={t} />
  </AbsoluteFill>);
};
export const YEARS: React.FC<SP> = ({t, T}) => {
  const lostN = (D.pub as number[][]).filter((b) => b[3] > 0 && b[3] < T).length; const tot = (D.pub as number[][]).length;
  return (<AbsoluteFill>
    <Map T={T} cam={winterCam} night={0.45} warOn={false} filter="grayscale(0.8) brightness(0.9)" />
    <TintLayer cam={winterCam} items={BURN_ITEMS(0.4)} />
    <AbsoluteFill style={{background: 'rgba(200,215,235,0.18)'}} />
    <BunkerLayer T={T} cam={winterCam} mode="life" gov={1} size={1.1} />
    <Particles t={t} kind="snow" n={60} a={0.6} />
    <Vig a={0.6} />
    <HumanityBar T={T} t={t} t0={-1} />
    <ShelterCards T={T} t={t} t0={-1} />
    <YearHUD T={T} t={t} />
    <div style={{position: 'absolute', left: 44, bottom: 60, padding: '12px 26px', borderRadius: 18, background: 'rgba(8,12,24,0.88)', border: `5px solid ${INK}`}}>
      <div style={{...font, fontSize: 26, color: '#ff9a8a'}}>SHELTERS LOST</div>
      <div style={{fontFamily: 'monospace', fontWeight: 900, fontSize: 60, color: '#fff'}}>{Math.round(lostN / tot * 100)}%</div>
    </div>
  </AbsoluteFill>);
};
// bola con traje NBQ
const Hazmat: React.FC<{x: number; y: number; s: number; t: number; k: number}> = ({x, y, s, t, k}) => (<div style={{position: 'absolute', left: 0, top: -Math.abs(Math.sin(t * 7 + x)) * 8}}>
  <div style={{position: 'absolute', left: x - s * 0.62, top: y - s * 0.66, width: s * 1.24, height: s * 1.18, borderRadius: '50% 50% 42% 42%', background: 'radial-gradient(circle at 35% 30%, #ffe45a, #d8a810 70%)', border: `${s * 0.035}px solid ${INK}`}} />
  <div style={{position: 'absolute', left: x - s * 0.36, top: y - s * 0.36, width: s * 0.72, height: s * 0.5, borderRadius: s * 0.2, background: 'linear-gradient(180deg, rgba(160,220,255,0.9), rgba(60,120,180,0.9))', border: `${s * 0.04}px solid ${INK}`, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: s * 0.72, height: s * 0.5, transform: `scale(0.9)`}}><div style={{position: 'absolute', left: s * 0.14, top: s * 0.12, width: s * 0.1, height: s * 0.14, borderRadius: '50%', background: '#fff', border: `${s * 0.015}px solid ${INK}`}} /><div style={{position: 'absolute', left: s * 0.44, top: s * 0.12, width: s * 0.1, height: s * 0.14, borderRadius: '50%', background: '#fff', border: `${s * 0.015}px solid ${INK}`}} /></div>
  </div>
  <div style={{position: 'absolute', left: x - s * 0.16, top: y + s * 0.14, width: s * 0.32, height: s * 0.26, borderRadius: '40%', background: '#2a2a2a', border: `${s * 0.03}px solid ${INK}`}} />
  <div style={{position: 'absolute', left: x - s * 0.5, top: y + s * 0.3, width: s * 0.24, height: s * 0.16, background: '#000', borderRadius: 6, overflow: 'hidden'}}><div style={{width: '100%', height: '100%', transform: 'scale(1)'}} /></div>
  <div style={{position: 'absolute', left: x + s * 0.3, top: y + s * 0.0, width: s * 0.26, height: s * 0.18, borderRadius: 6, background: '#3a3a3a', border: `${s * 0.025}px solid ${INK}`, ...font, fontSize: s * 0.1, color: '#3ad16a', textAlign: 'center'}}>☢</div>
</div>);
export const SCOUT: React.FC<SP> = ({t, T}) => {
  const hatch = ip(t, [1.2, 2.0], [0, 1]); const walk = ip(t, [2.0, 8.8], [0, 1], false);
  const rad = ip(t, [2.5, 8.5], [4.2, 0.9]);
  if (t >= 9.0) {
    const cam = {cx: 4000, cy: 1700, s: 0.6};
    const alive = (D.pub as number[][]).filter((b, i) => i % 7 === 0 && (b[3] < 0 || b[3] > T));
    return (<AbsoluteFill>
      <Map T={T} cam={cam} night={0.4} warOn={false} filter="grayscale(0.75) brightness(0.9)" />
      <TintLayer cam={cam} items={BURN_ITEMS(0.4)} />
      <BunkerLayer T={T} cam={cam} mode="life" />
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        {alive.map((b, i) => { const [X, Y] = toS(b[0], b[1], cam); const a = rnd(i) * Math.PI * 2; const L = ip(t, [9.2, 14.5], [0, 60 + rnd(i + 3) * 90]);
          return <g key={i}><path d={`M${X},${Y} q${Math.cos(a + 1) * L * 0.6},${Math.sin(a + 1) * L * 0.6} ${Math.cos(a) * L},${Math.sin(a) * L}`} fill="none" stroke="#ffd23f" strokeWidth={4} strokeDasharray="3 8" strokeLinecap="round" /><circle cx={X + Math.cos(a) * L} cy={Y + Math.sin(a) * L} r={6} fill="#ffd23f" stroke={INK} strokeWidth={2} /></g>; })}
      </svg>
      <Vig a={0.6} />
      <YearHUD T={T} t={t} />
      <HumanityBar T={T} t={t} t0={-1} />
    </AbsoluteFill>);
  }
  return (<AbsoluteFill style={{overflow: 'hidden'}}>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #5a5a60, #9a9a98 70%)'}} />
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      {Array.from({length: 16}, (_, i) => { const x = i * 130 - 20, h = 140 + rnd(i) * 320; return <path key={i} d={`M${x},640 L${x},${640 - h} L${x + 30},${640 - h - rnd(i + 2) * 40} L${x + 70},${640 - h + 20} L${x + 110},${640 - h - 10} L${x + 110},640 Z`} fill="#3a3a3e" opacity={0.75} />; })}
      <rect x={0} y={640} width={W} height={440} fill="#6a6866" />
      {[[300, 640], [1500, 640], [1750, 640]].map(([x, y], i) => <path key={i} d={`M${x},${y} L${x},${y - 180} M${x},${y - 110} L${x - 50},${y - 160} M${x},${y - 140} L${x + 40},${y - 190}`} stroke="#2a2a2a" strokeWidth={10} strokeLinecap="round" />)}
    </svg>
    <div style={{position: 'absolute', left: 180, top: 700, width: 260, height: 70, borderRadius: '50%', background: '#2a2a2e', border: `8px solid ${INK}`}} />
    <div style={{position: 'absolute', left: 180, top: 700 - hatch * 160, width: 260, height: 70, borderRadius: '50%', background: '#7a7e84', border: `8px solid ${INK}`, transform: `rotateX(${hatch * 70}deg)`}} />
    {[0, 1, 2].map((i) => { const x = 310 + walk * 1150 - i * 190; const show = x > 300; return show ? <Hazmat key={i} x={x} y={800 + i * 40} s={150} t={t} k={0} /> : null; })}
    <Particles t={t} kind="ash" n={90} />
    <div style={{position: 'absolute', right: 50, top: 50, width: 360, padding: '14px 20px', borderRadius: 18, background: '#1a1a1a', border: `6px solid ${INK}`}}>
      <div style={{...font, fontSize: 26, color: '#ffd23f'}}>☢ GEIGER COUNTER</div>
      <div style={{fontFamily: 'monospace', fontWeight: 900, fontSize: 60, color: rad > 2 ? '#ff3b30' : '#ffc23a'}}>{rad.toFixed(2)}</div>
      <div style={{...font, fontSize: 22, color: '#ccc'}}>mSv / hour</div>
    </div>
    <YearHUD T={T} t={t} />
    <Vig a={0.55} />
  </AbsoluteFill>);
};
export const FAMILY: React.FC<SP> = ({t}) => {
  const ch = kOf('CH'), fi = kOf('FI');
  const born = Math.round(ip(t, [4.0, 12.5], [0, 2300000], false));
  return (<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #6a4a2a, #2a1a0e 75%)', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 60, background: '#1a120a'}} />
    {[400, 960, 1520].map((x, i) => <div key={i} style={{position: 'absolute', left: x - 30, top: 60, width: 60, height: 40, borderRadius: '0 0 30px 30px', background: '#ffe7a0', boxShadow: '0 0 120px 40px rgba(255,220,140,0.35)'}} />)}
    {t < 6.4 ? <>
      <Char k={ch} t={t} s={230} x={760} y={620} eyes="normal" />
      <Char k={fi} t={t} s={230} x={1160} y={620} eyes="normal" />
      {t > 1.0 && <div style={{position: 'absolute', left: 960 - 60, top: 300 - (t - 1) * 10, ...font, fontSize: 120, transform: `scale(${pop(t, 1.0, 0.35)})`}}>❤️</div>}
      {t > 3.0 && <div style={{position: 'absolute', left: 0, top: 0, transform: `scale(${pop(t, 3.0, 0.35)})`, transformOrigin: '960px 760px'}}><Char k={ch} t={t} s={110} x={960} y={760} eyes="normal" /></div>}
    </> : <>
      <div style={{position: 'absolute', left: 560, top: 150, width: 800, height: 400, background: '#2a3a2a', border: `14px solid #6a4a2a`}}>
        <svg width={800} height={400} style={{position: 'absolute', left: 0, top: 0}}>
          <circle cx={600} cy={110} r={60} fill="none" stroke="#ffd23f" strokeWidth={8} />
          {Array.from({length: 10}, (_, i) => { const a = i / 10 * Math.PI * 2; return <line key={i} x1={600 + Math.cos(a) * 80} y1={110 + Math.sin(a) * 80} x2={600 + Math.cos(a) * 110} y2={110 + Math.sin(a) * 110} stroke="#ffd23f" strokeWidth={7} strokeLinecap="round" />; })}
          <path d="M60,330 Q200,250 340,330 T620,330 T780,330" fill="none" stroke="#7ad16a" strokeWidth={8} />
          <text x={80} y={110} style={{fontFamily: 'Fredoka', fontWeight: 700, fontSize: 60}} fill="#fff">THE SKY?</text>
        </svg>
      </div>
      {Array.from({length: 5}, (_, i) => <Char key={i} k={[ch, fi, kOf('SE'), kOf('NO'), ch][i]} t={t + i} s={120} x={560 + i * 200} y={830} eyes="normal" />)}
    </>}
    <div style={{position: 'absolute', left: 44, bottom: 60, padding: '12px 26px', borderRadius: 18, background: 'rgba(8,12,24,0.88)', border: `5px solid ${INK}`, opacity: ip(t, [4.0, 4.4], [0, 1])}}>
      <div style={{...font, fontSize: 26, color: '#ffd8a0'}}>BORN UNDERGROUND</div>
      <div style={{fontFamily: 'monospace', fontWeight: 900, fontSize: 60, color: '#fff'}}>{born.toLocaleString('en-US')}</div>
    </div>
    <Vig a={0.5} />
  </AbsoluteFill>);
};
export const THAW: React.FC<SP> = ({t, T}) => {
  const u = ip(t, [0, 10], [0, 1]);
  return (<AbsoluteFill>
    <Map T={T} cam={winterCam} night={0.45 - u * 0.3} warOn={false} filter={`grayscale(${0.8 - u * 0.6}) brightness(${0.9 + u * 0.1})`} />
    <TintLayer cam={winterCam} items={BURN_ITEMS(0.4 - u * 0.25)} />
    <AbsoluteFill style={{background: `rgba(200,215,235,${0.18 * (1 - u)})`}} />
    <BunkerLayer T={T} cam={winterCam} mode="life" gov={1} size={1.1} />
    <Particles t={t} kind="snow" n={60} a={0.6 * (1 - u)} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 80% 10%, rgba(255,220,140,0.35), rgba(255,220,140,0) 50%)', opacity: u}} />
    <Vig a={0.55} />
    <HumanityBar T={T} t={t} t0={-1} />
    <ShelterCards T={T} t={t} t0={-1} only={[0, 1]} />
    <YearHUD T={T} t={t} />
  </AbsoluteFill>);
};

// ============ CAP 8: LA SEÑAL ============
export const SIGNAL: React.FC<SP> = ({t, T, p}) => {
  const bern = pl('BERN'); const msg = p.msg as [number, string];
  const n = Math.floor(ip(t, [msg[0], msg[0] + 2.4], [0, msg[1].length], false));
  if (t < 7.5) return (<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #2a3a4a, #0e141c 75%)'}}>
    <div style={{position: 'absolute', left: 260, top: 640, width: 1400, height: 300, background: '#3a4250', border: `10px solid ${INK}`, borderRadius: 14}} />
    {Array.from({length: 14}, (_, i) => <div key={i} style={{position: 'absolute', left: 300 + i * 95, top: 680, width: 50, height: 50, borderRadius: '50%', background: rnd(Math.floor(t * 4) + i) > 0.5 ? '#3ad16a' : '#ffc531', border: '4px solid #000'}} />)}
    <Char k={kOf('CH')} t={t} s={260} x={560} y={520} eyes="normal" />
    <div style={{position: 'absolute', left: 560 - 150, top: 400, width: 300, height: 30, borderRadius: 15, border: '10px solid #1d1d1d', borderBottom: 'none', height: 80}} />
    <div style={{position: 'absolute', left: 900, top: 160, width: 820, height: 420, background: '#0a140a', border: `12px solid ${INK}`, borderRadius: 16, padding: 30, boxSizing: 'border-box'}}>
      <div style={{fontFamily: 'monospace', fontWeight: 900, fontSize: 40, color: '#3ad16a'}}>RADIATION: 0.0002 mSv/h</div>
      <div style={{fontFamily: 'monospace', fontWeight: 900, fontSize: 40, color: '#3ad16a', marginTop: 10}}>AIR: BREATHABLE</div>
      <div style={{fontFamily: 'monospace', fontWeight: 900, fontSize: 40, color: '#3ad16a', marginTop: 10}}>STATUS: <span style={{color: '#fff', background: Math.floor(t * 3) % 2 ? '#2a8a3a' : 'transparent'}}>SAFE</span></div>
      <div style={{fontFamily: 'monospace', fontWeight: 900, fontSize: 36, color: YEL, marginTop: 30, lineHeight: 1.3}}>{msg[1].slice(0, n)}<span style={{opacity: Math.floor(t * 3) % 2}}>▌</span></div>
    </div>
    <YearHUD T={T} t={t} />
    <Vig a={0.5} />
  </AbsoluteFill>);
  const cam = WORLD; const [bx, by] = toS(bern[0], bern[1], cam); const t0 = 7.5;
  return (<AbsoluteFill>
    <Map T={T} cam={cam} night={0.15} warOn={false} filter="grayscale(0.15)" />
    <TintLayer cam={cam} items={BURN_ITEMS(0.15)} />
    <BunkerLayer T={T} cam={cam} mode="signal" gov={1} sig={[bern[0], bern[1], T - t + t0]} />
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      {Array.from({length: 6}, (_, i) => { const r = ((t - t0) * 260 + i * 160) % 1400; return <circle key={i} cx={bx} cy={by} r={r} fill="none" stroke="#3ad16a" strokeWidth={6} opacity={Math.max(0, 1 - r / 1400) * 0.8} />; })}
      <circle cx={bx} cy={by} r={14} fill="#3ad16a" stroke={INK} strokeWidth={4} />
    </svg>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 80, textAlign: 'center'}}><div style={{display: 'inline-block', padding: '14px 34px', borderRadius: 18, background: 'rgba(8,12,24,0.88)', border: '5px solid #3ad16a', ...font, fontSize: 44, color: '#fff'}}>"IT IS SAFE TO GO OUTSIDE."</div></div>
    <Vig a={0.45} />
    <YearHUD T={T} t={t} />
  </AbsoluteFill>);
};
export const OUT: React.FC<SP> = ({t}) => {
  if (t < 3.0) { const op = ip(t, [1.0, 2.6], [0, 1]);
    return (<AbsoluteFill style={{background: '#0e0e10'}}>
      <div style={{position: 'absolute', left: 960 - 380, top: 160, width: 760, height: 760, borderRadius: '50%', background: '#fffbe8', boxShadow: `0 0 ${200 * op}px ${80 * op}px rgba(255,250,220,${op})`}} />
      <div style={{position: 'absolute', left: 960 - 380, top: 160, width: 760, height: 760, borderRadius: '50%', background: 'radial-gradient(circle at 45% 40%, #8a8e94, #4a4e54 60%, #2a2c30)', border: `16px solid ${INK}`, transformOrigin: '0% 50%', transform: `perspective(1600px) rotateY(${-op * 85}deg)`}} />
      <AbsoluteFill style={{background: '#fff', opacity: ip(t, [2.2, 3.0], [0, 1])}} />
    </AbsoluteFill>); }
  const tt = t - 3; const sun = ip(tt, [0, 6], [0.3, 1]);
  const ppl: [string, number, number][] = [['CH', 0.2, 1.0], ['FI', 0.9, 1.0], ['CH', 1.6, 0.6], ['SE', 2.4, 1.0], ['NO', 3.1, 0.6], ['KR', 3.9, 1.0]];
  return (<AbsoluteFill style={{overflow: 'hidden'}}>
    <AbsoluteFill style={{background: `linear-gradient(180deg, rgb(${120 + 60 * sun},${160 + 50 * sun},${200 + 30 * sun}), #f0e0c0 70%)`}} />
    <div style={{position: 'absolute', left: 1400, top: 140 - sun * 30, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, #fffbe0, #ffd860 70%)', boxShadow: `0 0 ${120 * sun}px ${50 * sun}px rgba(255,230,140,0.7)`}} />
    {Array.from({length: 7}, (_, i) => <div key={i} style={{position: 'absolute', left: ((i * 330 + tt * 25) % 2400) - 300, top: 80 + (i % 3) * 70, width: 340, height: 90, borderRadius: 60, background: 'rgba(255,255,255,0.75)', opacity: 1 - sun * 0.5}} />)}
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      {Array.from({length: 12}, (_, i) => { const x = 700 + i * 110, h = 80 + rnd(i) * 200; return <rect key={i} x={x} y={660 - h} width={90} height={h} fill="#8a8a90" opacity={0.6} />; })}
      <rect x={0} y={660} width={W} height={420} fill="#9a9488" />
      {Array.from({length: 60}, (_, i) => { const g = ip(tt, [1 + rnd(i) * 8, 2.5 + rnd(i) * 8], [0, 1]); const x = rnd(i + 3) * W, y = 690 + rnd(i + 7) * 380; return <ellipse key={i} cx={x} cy={y} rx={60 * g} ry={18 * g} fill="#6ab04a" opacity={0.85} />; })}
      {Array.from({length: 5}, (_, i) => { const x = ((tt * 120 + i * 300) % 2200) - 100, y = 260 + i * 30 + Math.sin(tt * 3 + i) * 15; return tt > 0.5 ? <path key={i} d={`M${x - 16},${y} q8,-10 16,0 q8,-10 16,0`} fill="none" stroke="#2a2a2a" strokeWidth={4} /> : null; })}
    </svg>
    <div style={{position: 'absolute', left: 120, top: 700, width: 280, height: 80, borderRadius: '50%', background: '#2a2a2e', border: `8px solid ${INK}`}} />
    {ppl.map(([c, t0, sz], i) => { if (tt < t0) return null; const x = 260 + Math.min(1, (tt - t0) / 2.2) * (300 + i * 220); const y = 740 + (i % 2) * 60;
      return <div key={i} style={{position: 'absolute', left: 0, top: -Math.abs(Math.sin(tt * 6 + i)) * 7, width: W, height: H}}><Char k={kOf(c)} t={tt} s={170 * sz} x={x} y={y} eyes="normal" look={-0.6} /></div>; })}
    <Bubble t={tt} t0={4.6} t1={8.4} x={260 + 300 + 2 * 220} y={640} text="Is that... the sun?" size={40} />
    {tt < 0.8 && <AbsoluteFill style={{background: '#fff', opacity: ip(tt, [0, 0.8], [1, 0])}} />}
    <Vig a={0.35} />
  </AbsoluteFill>);
};
export const END: React.FC<SP> = ({t, T}) => {
  const cam = {cx: 3900, cy: 2100, s: ip(t, [0, 13], [0.3, 0.27], false)};
  return (<AbsoluteFill>
    <Map T={T} cam={cam} warOn={false} filter="saturate(1.05)" />
    <TintLayer cam={cam} items={BURN_ITEMS(0.12)} />
    <BunkerLayer T={T} cam={cam} mode="signal" sig={[0, 0, -999]} />
    <AbsoluteFill style={{background: 'rgba(0,0,0,0.45)', opacity: ip(t, [0.5, 1.2], [0, 1])}} />
    {t > 0.8 && <Big text="8.2 BILLION PEOPLE." y={230} size={110} sc={pop(t, 0.8, 0.35)} />}
    {t > 2.6 && <Big text="25 MILLION WALKED OUT." y={380} size={110} col={YEL} sc={pop(t, 2.6, 0.35)} />}
    {t > 5.5 && <div style={{position: 'absolute', left: 0, right: 0, top: 600, textAlign: 'center', ...font, fontSize: 56, color: '#fff', opacity: ip(t, [5.5, 6.0], [0, 1])}}>Would YOU have made it to a shelter? 👇</div>}
    {t > 8.0 && <div style={{position: 'absolute', left: W / 2 - 220, top: 740, width: 440, padding: '16px 0', borderRadius: 18, background: '#e5322d', border: `6px solid ${INK}`, textAlign: 'center', ...font, fontSize: 56, color: '#fff', transform: `scale(${pop(t, 8.0, 0.3)})`}}>SUBSCRIBE</div>}
    <div style={{position: 'absolute', right: 40, bottom: 30, ...font, fontSize: 22, color: 'rgba(255,255,255,0.6)'}}>Hypothetical simulation · figures are estimates</div>
    <AbsoluteFill style={{background: '#000', opacity: ip(t, [11.8, 13], [0, 1])}} />
  </AbsoluteFill>);
};
