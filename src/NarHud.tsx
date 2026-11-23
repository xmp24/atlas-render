// HUD narrativo: subtítulos del narrador, bocadillos de los países con su bola, contador, top 3, reloj, rótulos y final.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COUNTRIES, FlagCanvas} from './HexWorld';
import {INK, Face} from './lib3';
import {PIECES_C} from './PolyWorld';

type Cam = {cx: number; cy: number; s: number};
const VW = 1920, VH = 1080;
const F: React.CSSProperties = {fontFamily: 'Lilita'};
const CREAM = '#fbf3df', DARK = 'rgba(14,16,26,0.86)', GOLD = '#ffc93c', RED = '#e8352b';
const NMX: Record<string, string> = {'United States of America': 'USA', 'United Arab Emirates': 'UAE', 'Central African Rep.': 'CAR', 'Dem. Rep. Congo': 'DR Congo', 'Bosnia and Herz.': 'Bosnia'};
const NM = (k: number) => { const n = COUNTRIES[k]?.n || '?'; return (NMX[n] || n).toUpperCase(); };
const CODE: Record<string, number> = {}; COUNTRIES.forEach((c, i) => { CODE[c.c] = i; });
const toS = (x: number, y: number, c: Cam): [number, number] => [VW / 2 + (x - c.cx) * c.s, VH / 2 + (y - c.cy) * c.s];
const cl = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const eo = (u: number) => { u = cl(u, 0, 1); return 1 - (1 - u) ** 3; };
const pop = (t: number, t0: number, sp = 10) => { const d = t - t0; if (d <= 0) return 0; return 1 - Math.exp(-sp * 0.6 * d) * Math.cos(d * sp); };
const fadeW = (t: number, t0: number, t1: number, a = 0.2) => cl(Math.min((t - t0) / a, (t1 - t) / a), 0, 1);
const kv = (arr: any[], t: number) => { let v = arr[0]; for (const x of arr) { if (x[0] <= t) v = x; else break; } return v; };

const RoundFlag: React.FC<{k: number; d: number; border?: number}> = ({k, d, border = 4}) => (
  <div style={{width: d, height: d, borderRadius: '50%', overflow: 'hidden', border: `${border}px solid ${INK}`, flexShrink: 0, position: 'relative', background: '#fff'}}>
    <FlagCanvas k={k} w={d * 1.5} h={d} style={{marginLeft: -d * 0.25}} />
  </div>
);
const RectFlag: React.FC<{k: number; w: number}> = ({k, w}) => (
  <div style={{width: w, height: w * 0.66, borderRadius: 5, overflow: 'hidden', border: `3px solid ${INK}`, flexShrink: 0}}><FlagCanvas k={k} w={w} h={w * 0.66} /></div>
);
const BallTalk: React.FC<{k: number; d: number; t: number; talking: boolean}> = ({k, d, t, talking}) => (
  <div style={{position: 'relative', width: d, height: d, filter: 'drop-shadow(0 6px 0 rgba(0,0,0,0.35))'}}>
    <RoundFlag k={k} d={d} border={Math.max(4, d * 0.05)} />
    <svg width={d} height={d} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><Face x={d / 2} y={d * 0.47} r={d * 0.29} mood={'calm'} t={t} seed={k} talking={talking} /></svg>
  </div>
);

export const NarHud: React.FC<{D: any; t: number; cam: Cam}> = ({D, t, cam}) => {
  const N = D.nar; if (!N) return null;
  const lines = N.lines as [number, number, string, string][];
  const cur = lines.filter((l) => t >= l[0] - 0.05 && t < l[1] + 0.35);
  const narr = cur.filter((l) => l[2] === 'N').slice(-1)[0];
  const talk = cur.filter((l) => l[2] !== 'N').slice(-1)[0];
  // contador
  const al = kv(N.alive, t); const prevT = al[0]; const bump = t - prevT < 0.35 ? (1 - (t - prevT) / 0.35) * 0.18 : 0;
  const top = kv(N.top, t);
  const endT = N.endq[0]; const winT = N.win[0];
  const hudA = 1 - fadeW(t, endT - 0.2, 1e9, 0.4);
  // reloj
  const ck = N.clock as number[][]; let mins = 0;
  for (let i = 0; i < ck.length; i++) { if (t >= ck[i][0]) { const nx = ck[i + 1]; mins = nx ? ck[i][1] + (ck[i + 1][1] - ck[i][1]) * cl((t - ck[i][0]) / (nx[0] - ck[i][0]), 0, 1) : ck[i][1]; } }
  const hh = Math.floor(mins / 60), mm = Math.floor(mins % 60);
  const sun = cl((mins - 380) / 60, 0, 1);
  // rótulo de capítulo
  const ttl = (N.titles as [number, string][]).filter(([t0]) => t >= t0 - 0.05 && t < t0 + (t0 < 15 ? 3.4 : 1.9)).slice(-1)[0];
  const out: React.ReactNode[] = [];
  // amanecer al final
  if (sun > 0) out.push(<AbsoluteFill key="sun" style={{background: 'radial-gradient(ellipse at 50% 120%, rgba(255,170,80,0.55), rgba(255,120,60,0.15) 50%, rgba(0,0,0,0) 75%)', opacity: sun * 0.8, zIndex: 15, pointerEvents: 'none'}} />);
  // contador (arriba izq.)
  out.push(
    <div key="cnt" style={{position: 'absolute', left: 32, top: 28, zIndex: 30, opacity: hudA, background: DARK, border: `4px solid ${INK}`, borderRadius: 18, padding: '8px 22px 4px', boxShadow: '0 6px 0 rgba(0,0,0,0.35)', minWidth: 230}}>
      <div style={{...F, fontSize: 22, color: '#cfd6e6', letterSpacing: 1}}>🌍 COUNTRIES LEFT</div>
      <div style={{...F, fontSize: 74, lineHeight: 1, color: al[1] <= 4 ? GOLD : '#fff', transform: `scale(${1 + bump})`, transformOrigin: 'left center'}}>{al[1]}</div>
    </div>);
  // reloj (arriba centro)
  out.push(
    <div key="clk" style={{position: 'absolute', left: VW / 2, top: 26, transform: 'translateX(-50%)', zIndex: 30, opacity: hudA, background: DARK, border: `4px solid ${INK}`, borderRadius: 999, padding: '6px 26px 2px', ...F, fontSize: 40, color: sun > 0.3 ? GOLD : '#fff', boxShadow: '0 6px 0 rgba(0,0,0,0.35)'}}>
      {sun > 0.3 ? '🌅' : '🌙'} {String(hh).padStart(2, '0')}:{String(mm).padStart(2, '0')}
    </div>);
  // top 3 (arriba der.)
  if (top && top.length > 1) out.push(
    <div key="top" style={{position: 'absolute', right: 32, top: 28, zIndex: 30, opacity: hudA, background: DARK, border: `4px solid ${INK}`, borderRadius: 18, padding: '8px 16px 8px', boxShadow: '0 6px 0 rgba(0,0,0,0.35)', width: 340}}>
      <div style={{...F, fontSize: 22, color: '#cfd6e6', marginBottom: 4}}>👑 BIGGEST EMPIRES</div>
      {(top.slice(1) as [number, number][]).map(([k, p], i) => (
        <div key={k} style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 5}}>
          <span style={{...F, fontSize: 26, color: i === 0 ? GOLD : '#fff', width: 20}}>{i + 1}</span><RectFlag k={k} w={44} />
          <span style={{...F, fontSize: 25, color: '#fff', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{NM(k)}</span>
          <span style={{...F, fontSize: 25, color: i === 0 ? GOLD : '#fff'}}>{p.toFixed(0)}%</span>
        </div>))}
    </div>);
  // bocadillo del país
  if (talk && t < winT - 0.2) {
    const k = CODE[talk[2]] ?? -1;
    if (k >= 0) {
      const c = PIECES_C(k); const [sx0, sy0] = toS(c[0], c[1], cam);
      const txt = talk[3]; const wide = txt.length > 34;
      const bw = wide ? 640 : Math.max(300, txt.length * 19 + 150);
      const sx = cl(sx0, bw / 2 + 40, VW - bw / 2 - 40), sy = cl(sy0 - 30, 330, VH - 250);
      const a = pop(t, talk[0], 11) * fadeW(t, talk[0] - 0.1, talk[1] + 0.35, 0.18);
      const talking = t < talk[1] && Math.floor(t * 9) % 2 === 0;
      out.push(
        <div key={'b' + talk[0]} style={{position: 'absolute', left: sx, top: sy, transform: `translate(-50%,-100%) scale(${a})`, transformOrigin: '50% 100%', zIndex: 32, display: 'flex', alignItems: 'flex-end', gap: 10}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <BallTalk k={k} d={96} t={t} talking={talking} />
            <div style={{...F, fontSize: 20, color: '#fff', background: INK, borderRadius: 8, padding: '2px 8px 0', marginTop: -6, whiteSpace: 'nowrap'}}>{NM(k)}</div>
          </div>
          <div style={{position: 'relative', background: '#fff', border: `5px solid ${INK}`, borderRadius: 22, padding: '10px 20px 6px', ...F, fontSize: wide ? 32 : 36, lineHeight: 1.12, color: INK, maxWidth: 560, boxShadow: '0 6px 0 rgba(0,0,0,0.35)', marginBottom: 40}}>
            {txt}
            <div style={{position: 'absolute', left: -15, bottom: 16, width: 22, height: 22, background: '#fff', borderLeft: `5px solid ${INK}`, borderBottom: `5px solid ${INK}`, transform: 'rotate(45deg)'}} />
          </div>
        </div>);
    }
  }
  // subtítulo del narrador
  if (narr) {
    const a = fadeW(t, narr[0] - 0.05, narr[1] + 0.35, 0.15);
    out.push(
      <div key={'n' + narr[0]} style={{position: 'absolute', left: VW / 2, bottom: 54, transform: `translateX(-50%) translateY(${(1 - eo((t - narr[0]) / 0.2)) * 14}px)`, opacity: a, zIndex: 33, maxWidth: 1440, background: DARK, border: `4px solid ${INK}`, borderRadius: 18, padding: '10px 28px 6px', ...F, fontSize: 40, lineHeight: 1.15, color: '#fff', textAlign: 'center', boxShadow: '0 6px 0 rgba(0,0,0,0.35)'}}>
        {narr[3]}
      </div>);
  }
  // rótulos
  if (ttl) {
    const big = ttl[0] < 15; const d = big ? 3.4 : 1.9; const a = fadeW(t, ttl[0], ttl[0] + d, 0.18); const s = 0.6 + 0.4 * pop(t, ttl[0], 12);
    out.push(
      <div key={'t' + ttl[0]} style={{position: 'absolute', left: VW / 2, top: big ? 380 : 400, transform: `translate(-50%,-50%) scale(${s}) rotate(-2deg)`, opacity: a, zIndex: 34, textAlign: 'center'}}>
        <div style={{background: big ? RED : GOLD, border: `6px solid ${INK}`, borderRadius: 20, padding: big ? '14px 40px 6px' : '10px 44px 2px', ...F, fontSize: big ? 84 : 92, color: big ? '#fff' : INK, whiteSpace: 'nowrap', boxShadow: `0 10px 0 ${INK}`, lineHeight: 1.05}}>
          {big ? <>EVERY COUNTRY<br />INVADES ITS NEIGHBOR</> : ttl[1]}
        </div>
      </div>);
  }
  // ganador
  if (t >= winT && t < endT + 0.3) {
    const k = N.win[1]; const a = fadeW(t, winT, endT + 0.3, 0.25); const s = pop(t, winT, 9);
    out.push(
      <div key="win" style={{position: 'absolute', left: VW / 2, top: 360, transform: `translate(-50%,-50%) scale(${s})`, opacity: a, zIndex: 35, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
        <BallTalk k={k} d={190} t={t} talking={false} />
        <div style={{background: GOLD, border: `6px solid ${INK}`, borderRadius: 20, padding: '10px 40px 2px', ...F, fontSize: 80, color: INK, whiteSpace: 'nowrap', boxShadow: `0 10px 0 ${INK}`}}>🏆 {NM(k)} RULES THE WORLD</div>
        {talk && talk[2] !== 'N' && <div style={{background: '#fff', border: `5px solid ${INK}`, borderRadius: 20, padding: '8px 26px 4px', ...F, fontSize: 44, color: INK, whiteSpace: 'nowrap', boxShadow: '0 6px 0 rgba(0,0,0,0.35)', transform: `scale(${pop(t, talk[0], 11)})`}}>💬 "{talk[3]}"</div>}
      </div>);
  }
  // pregunta final
  if (t >= endT) {
    const a = fadeW(t, endT, 1e9, 0.25); const s = pop(t, endT, 10);
    out.push(
      <AbsoluteFill key="endq" style={{background: `rgba(10,12,20,${0.55 * a})`, zIndex: 36, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{transform: `scale(${s}) rotate(-1.5deg)`, background: CREAM, border: `7px solid ${INK}`, borderRadius: 26, padding: '22px 50px 12px', textAlign: 'center', boxShadow: `0 12px 0 ${INK}`}}>
          <div style={{...F, fontSize: 76, color: INK, lineHeight: 1.05}}>WOULD YOUR COUNTRY<br />HAVE DONE BETTER?</div>
          <div style={{...F, fontSize: 44, color: RED, marginTop: 10}}>💬 TELL US IN THE COMMENTS</div>
        </div>
      </AbsoluteFill>);
  }
  return <>{out}</>;
};
