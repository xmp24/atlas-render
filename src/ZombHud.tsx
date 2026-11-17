// HUD del apocalipsis zombi (animación directa)
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COUNTRIES, FlagCanvas} from './HexWorld';
import {INK} from './lib3';

type Cam = {cx: number; cy: number; s: number};
const VW = 1920, VH = 1080;
const F: React.CSSProperties = {fontFamily: 'Lilita'};
const CREAM = '#fbf3df', DARK = '#16141c', TOX = '#7bd83a', RED = '#e8352b', BLUE = '#2fa8ff';
const toS = (x: number, y: number, c: Cam): [number, number] => [VW / 2 + (x - c.cx) * c.s, VH / 2 + (y - c.cy) * c.s];
const cl = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const eo = (u: number) => { u = cl(u, 0, 1); return 1 - (1 - u) ** 3; };
const popIn = (t: number, t0: number) => { const d = t - t0; if (d <= 0) return 0; if (d > 0.5) return 1; const u = d / 0.5; return eo(u) * (1 + 0.15 * Math.sin(u * Math.PI)); };
const fadeW = (t: number, t0: number, t1: number, a = 0.25) => cl(Math.min((t - t0) / a, (t1 - t) / a), 0, 1);
export const kfl = (k: number[][], t: number) => { if (!k.length) return 0; if (t <= k[0][0]) return k[0][1]; for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const a = k[i - 1], b = k[i]; return a[1] + (b[1] - a[1]) * ((t - a[0]) / Math.max(1e-6, b[0] - a[0])); } return k[k.length - 1][1]; };
const fmt = (n: number) => n >= 1e9 ? (n / 1e9).toFixed(2) + 'B' : n >= 1e6 ? (n / 1e6).toFixed(n >= 1e8 ? 0 : 1) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : String(Math.round(n));
const interpCnt = (rows: number[][], t: number) => { let i = Math.min(rows.length - 2, Math.max(0, Math.floor(t / 0.5))); const a = rows[i], b = rows[i + 1]; const u = cl((t - a[0]) / Math.max(1e-6, b[0] - a[0]), 0, 1); return [a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u, a[3] + (b[3] - a[3]) * u]; };

// fracción infectada de un país (para las caras)
let ZF: Map<number, number[][][]> | null = null; let ZD: any = null;
export const zfrac = (D: any, k: number, t: number) => {
  if (ZD !== D) { ZD = D; ZF = new Map(); for (const o of D.war.occ) { const g = o[6]; if (!g || !g.fk) continue; const l = ZF.get(o[0]) || []; l.push(g.fk); ZF.set(o[0], l); } }
  const l = ZF!.get(k); if (!l) return 0; let m = 0; for (const fk of l) m = Math.max(m, kfl(fk, t)); return m;
};
export const ZFace: React.FC<{x: number; y: number; r: number; t: number; seed: number; mut: boolean}> = ({x, y, r, t, seed, mut}) => {
  const bob = Math.sin(t * 2.2 + seed) * r * 0.06; const tilt = Math.sin(t * 1.3 + seed) * 8;
  const iris = mut ? '#ff2a1a' : '#ffe14a';
  return (
    <g transform={`translate(${x},${y + bob}) rotate(${tilt})`}>
      {[-1, 1].map((sd) => <g key={sd}>
        <ellipse cx={sd * r * 0.48} cy={sd > 0 ? r * 0.05 : 0} rx={r * (sd > 0 ? 0.36 : 0.42)} ry={r * (sd > 0 ? 0.42 : 0.5)} fill="#c9e89a" stroke={INK} strokeWidth={r * 0.09} />
        <circle cx={sd * r * 0.48 + Math.sin(t * 3 + sd) * r * 0.05} cy={sd > 0 ? r * 0.08 : r * 0.02} r={r * 0.3} fill={iris} opacity={0.35} />
        <circle cx={sd * r * 0.48 + Math.sin(t * 3 + sd) * r * 0.05} cy={sd > 0 ? r * 0.08 : r * 0.02} r={r * 0.22} fill={iris} stroke={INK} strokeWidth={r * 0.06} />
        <path d={`M${sd * (r * 0.48 + r * 0.42)},${-r * 0.62} L${sd * (r * 0.48 - r * 0.38)},${-r * 0.36}`} stroke={INK} strokeWidth={r * 0.13} strokeLinecap="round" />
      </g>)}
      <path d={`M${-r * 0.42},${r * 0.62} L${-r * 0.28},${r * 0.52} L${-r * 0.14},${r * 0.66} L0,${r * 0.52} L${r * 0.14},${r * 0.66} L${r * 0.28},${r * 0.52} L${r * 0.42},${r * 0.64} Q0,${r * 1.05} ${-r * 0.42},${r * 0.62} Z`} fill="#4a1010" stroke={INK} strokeWidth={r * 0.08} strokeLinejoin="round" />
      <path d={`M${-r * 0.3},${r * 0.6} L${-r * 0.24},${r * 0.72} L${-r * 0.17},${r * 0.62} M${r * 0.05},${r * 0.6} L${r * 0.1},${r * 0.73} L${r * 0.16},${r * 0.62}`} fill="#fff" stroke={INK} strokeWidth={r * 0.03} />
      <path d={`M${r * 0.75},${-r * 0.2} l${r * 0.2},${r * 0.05} M${r * 0.78},${-r * 0.08} l${r * 0.2},${r * 0.05} M${r * 0.85},${-r * 0.3} l0,${r * 0.35}`} stroke={INK} strokeWidth={r * 0.05} strokeLinecap="round" opacity={0.8} />
    </g>
  );
};

const Counters: React.FC<{Z: any; t: number}> = ({Z, t}) => {
  const [h, z, d] = interpCnt(Z.cnt, t); const W = Z.world; const lost = (z + d) / W;
  const box = (ic: string, lab: string, v: number, col: string, fg: string) => (
    <div style={{background: DARK, border: `5px solid ${col}`, borderRadius: 16, padding: '6px 18px 4px', minWidth: 250, boxShadow: `0 6px 0 ${INK}, 0 0 20px ${col}66`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{...F, fontSize: 22, letterSpacing: 2, color: col}}>{ic} {lab}</div>
      <div style={{...F, fontSize: 52, lineHeight: 1, color: fg, fontVariantNumeric: 'tabular-nums'}}>{fmt(v)}</div>
    </div>
  );
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
      <div style={{display: 'flex', gap: 16}}>{box('🟢', 'HEALTHY', h, '#4fe07a', '#e8ffe9')}{box('🧟', 'ZOMBIES', z, TOX, TOX)}{box('💀', 'DEAD', d, '#b9b2c6', '#ffffff')}</div>
      <div style={{width: 820, height: 30, borderRadius: 15, background: '#2a2733', border: `4px solid ${INK}`, position: 'relative', overflow: 'hidden', boxShadow: `0 4px 0 ${INK}`}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${lost * 100}%`, background: 'linear-gradient(90deg,#3f8f22,#7bd83a)'}} />
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...F, fontSize: 20, color: '#fff', textShadow: `2px 2px 0 ${INK}`}}>HUMANITY LOST: {(lost * 100).toFixed(lost < 0.01 ? 3 : 1)}%</div>
      </div>
    </div>
  );
};
const Day: React.FC<{Z: any; t: number}> = ({Z, t}) => (
  <div style={{position: 'absolute', left: 24, top: 20, background: CREAM, border: `5px solid ${INK}`, borderRadius: 16, padding: '6px 18px 2px', boxShadow: `0 6px 0 ${INK}`}}>
    <div style={{...F, fontSize: 20, letterSpacing: 2, color: '#7a6a50'}}>DAY</div>
    <div style={{...F, fontSize: 58, lineHeight: 1, color: INK}}>{Math.round(kfl(Z.day, t))}</div>
  </div>
);
const Cure: React.FC<{Z: any; t: number}> = ({Z, t}) => {
  const p = kfl(Z.cure, t); if (t < 116) return null; const a = cl((t - 116) / 0.6, 0, 1); const done = p >= 100;
  const IN = COUNTRIES.findIndex((c) => c.c === 'IN'), ID = COUNTRIES.findIndex((c) => c.c === 'ID');
  return (
    <div style={{position: 'absolute', right: 24, top: 20, width: 270, opacity: a, background: DARK, border: `5px solid ${done ? '#fff' : BLUE}`, borderRadius: 16, padding: '8px 14px 12px', boxShadow: `0 6px 0 ${INK}, 0 0 ${done ? 40 : 18}px ${BLUE}88`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <span style={{fontSize: 30}}>💉</span><div style={{...F, fontSize: 28, color: BLUE, flex: 1}}>CURE</div>
        {[IN, ID].map((k) => <div key={k} style={{width: 42, height: 28, borderRadius: 5, overflow: 'hidden', border: `3px solid ${INK}`}}><FlagCanvas k={k} w={42} h={28} /></div>)}
      </div>
      <div style={{marginTop: 6, height: 34, borderRadius: 17, background: '#23303c', border: `4px solid ${INK}`, position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${p}%`, background: `linear-gradient(90deg,#1a6fd0,${BLUE},#9fe1ff)`, boxShadow: `0 0 16px ${BLUE}`}} />
        <div style={{position: 'absolute', left: `${p}%`, top: 0, bottom: 0, width: 30, marginLeft: -15, background: 'rgba(255,255,255,0.35)', filter: 'blur(6px)', transform: `translateX(${Math.sin(t * 4) * 6}px)`}} />
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...F, fontSize: 24, color: '#fff', textShadow: `2px 2px 0 ${INK}`}}>{done ? 'READY!' : `${Math.floor(p)}%`}</div>
      </div>
    </div>
  );
};
const News: React.FC<{Z: any; t: number}> = ({Z, t}) => {
  const n = (Z.news as any[]).filter((x) => t >= x[0] && t < x[1]).slice(-1)[0]; if (!n) return null;
  const [t0, t1, txt, ic] = n; const a = fadeW(t, t0, t1, 0.3); const sx = (1 - eo((t - t0) / 0.4)) * -120;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 34, display: 'flex', justifyContent: 'center', opacity: a, transform: `translateY(${-sx * 0.2}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(16,14,22,0.92)', border: `4px solid ${TOX}`, borderRadius: 999, padding: '8px 28px 6px', boxShadow: `0 5px 0 ${INK}`}}>
        <span style={{background: RED, color: '#fff', ...F, fontSize: 20, padding: '2px 10px 0', borderRadius: 8, border: `3px solid ${INK}`}}>BREAKING</span>
        <span style={{fontSize: 30}}>{ic}</span><span style={{...F, fontSize: 32, color: '#fff', letterSpacing: 0.5}}>{txt}</span>
      </div>
    </div>
  );
};
const Cards: React.FC<{Z: any; t: number}> = ({Z, t}) => {
  const c = (Z.cards as any[]).find((x) => t >= x[0] && t < x[1]); if (!c) return null;
  const [t0, t1, title, sub, col] = c; const a = fadeW(t, t0, t1, 0.3);
  return (
    <AbsoluteFill style={{opacity: a, pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at center, ${col}55 0%, rgba(0,0,0,0.35) 70%)`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 410, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, transform: `scale(${popIn(t, t0)})`}}>
        <div style={{...F, fontSize: 124, color: '#fff', WebkitTextStroke: `11px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 10px 0 ${INK}, 0 0 40px ${col}`, lineHeight: 1, textAlign: 'center'}}>{title}</div>
        {sub && <div style={{background: col, border: `5px solid ${INK}`, borderRadius: 999, padding: '6px 26px 2px', ...F, fontSize: 38, color: '#fff', boxShadow: `0 5px 0 ${INK}`}}>{sub}</div>}
      </div>
    </AbsoluteFill>
  );
};
const MapFX: React.FC<{Z: any; t: number; cam: Cam}> = ({Z, t, cam}) => {
  const out: React.ReactNode[] = [];
  (Z.rings as any[]).forEach((r, i) => {
    const [t0, t1, x, y, R0, tb] = r; if (t < t0 || t > t1) return; const [sx, sy] = toS(x, y, cam); const rr = R0 * cam.s * eo((t - t0) / 0.8);
    const broke = t >= tb; const a = broke ? 1 - (t - tb) / (t1 - tb) : 1;
    out.push(<g key={'r' + i} opacity={a}><circle cx={sx} cy={sy} r={rr} fill="none" stroke={INK} strokeWidth={14} /><circle cx={sx} cy={sy} r={rr} fill="none" stroke={broke ? RED : '#ffd23f'} strokeWidth={9} strokeDasharray={broke ? '6 26' : '26 14'} transform={broke ? `rotate(${(t - tb) * 40} ${sx} ${sy})` : undefined} /></g>);
  });
  (Z.flights as any[]).forEach((f, i) => {
    const [t0, t1, x0, y0, x1, y1, cure] = f; if (t < t0 || t > t1 + 0.6) return;
    const [ax, ay] = toS(x0, y0, cam), [bx, by] = toS(x1, y1, cam); const mx = (ax + bx) / 2, my = Math.min(ay, by) - Math.hypot(bx - ax, by - ay) * 0.28;
    const u = eo((t - t0) / (t1 - t0)); const q = (p: number) => [(1 - p) ** 2 * ax + 2 * (1 - p) * p * mx + p * p * bx, (1 - p) ** 2 * ay + 2 * (1 - p) * p * my + p * p * by];
    const [px, py] = q(u); const [qx, qy] = q(Math.min(1, u + 0.02)); const ang = Math.atan2(qy - py, qx - px) * 180 / Math.PI;
    const col = cure ? BLUE : TOX; const a = t > t1 ? 1 - (t - t1) / 0.6 : 1;
    out.push(<g key={'f' + i} opacity={a}><path d={`M${ax},${ay} Q${mx},${my} ${bx},${by}`} fill="none" stroke={col} strokeWidth={5} strokeDasharray="12 10" opacity={0.85} />
      <g transform={`translate(${px},${py}) rotate(${ang})`}><path d="M-22,-4 L10,-4 L22,0 L10,4 L-22,4 Z M-4,-4 L-12,-20 L-6,-20 L6,-4 Z M-4,4 L-12,20 L-6,20 L6,4 Z M-20,-4 L-26,-12 L-22,-12 L-14,-4 Z M-20,4 L-26,12 L-22,12 L-14,4 Z" fill="#fff" stroke={INK} strokeWidth={3} /><circle cx={-30} cy={0} r={6} fill={col} opacity={0.8} /></g></g>);
  });
  (Z.mist as any[]).forEach((m, i) => {
    const [t0, t1, x, y, R0] = m; if (t < t0 || t > t1) return; const [sx, sy] = toS(x, y, cam); const u = (t - t0) / (t1 - t0);
    out.push(<g key={'m' + i} opacity={1 - u}>{[0, 1, 2].map((j) => <circle key={j} cx={sx + Math.sin(j * 2.1) * 20} cy={sy + Math.cos(j * 2.1) * 14} r={R0 * cam.s * (0.4 + u * (0.9 + j * 0.2))} fill={BLUE} opacity={0.28} />)}<circle cx={sx} cy={sy} r={R0 * cam.s * (0.3 + u)} fill="none" stroke="#bfeaff" strokeWidth={6} /></g>);
  });
  (Z.pops as any[]).forEach((p, i) => {
    const [t0, t1, x, y, txt, col, ring] = p; if (t < t0 || t > t1) return; const [sx, sy] = toS(x, y, cam); const a = fadeW(t, t0, t1, 0.3);
    out.push(<g key={'p' + i} opacity={a}>
      {ring ? [0, 1, 2].map((j) => { const ph = ((t - t0) * 0.8 + j / 3) % 1; return <circle key={j} cx={sx} cy={sy} r={20 + ph * 110} fill="none" stroke={col} strokeWidth={7} opacity={1 - ph} />; }) : null}
      <g transform={`translate(${sx},${sy - 70}) scale(${popIn(t, t0)})`}><rect x={-txt.length * 13 - 22} y={-30} width={txt.length * 26 + 44} height={56} rx={28} fill={col} stroke={INK} strokeWidth={5} /><text y={12} textAnchor="middle" fontSize={36} fill="#fff" stroke={INK} strokeWidth={5} paintOrder="stroke" style={F}>{txt}</text></g>
    </g>);
  });
  return <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{out}</svg>;
};
const EndQ: React.FC<{Z: any; t: number}> = ({Z, t}) => {
  const q = Z.q; if (!q || t < q[0]) return null; const a = cl((t - q[0]) / 0.25, 0, 1);
  return (
    <AbsoluteFill style={{opacity: a, background: 'rgba(10,8,20,0.5)'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', justifyContent: 'center', transform: `scale(${popIn(t, q[0])})`}}>
        <div style={{background: CREAM, border: `6px solid ${INK}`, borderRadius: 24, padding: '30px 64px 24px', boxShadow: `0 8px 0 ${INK}`, ...F, fontSize: 84, color: INK}}>{q[1]}</div>
      </div>
    </AbsoluteFill>
  );
};
export const ZombHud: React.FC<{D: any; t: number; cam: Cam}> = ({D, t, cam}) => {
  const Z = D.zomb; if (!Z) return null; const intro = t < 6.6;
  const mut = (Z.hl as any[]).find((h) => t >= h[0] && t < h[1]);
  return (
    <AbsoluteFill style={{zIndex: 40, pointerEvents: 'none'}}>
      {mut && <AbsoluteFill style={{background: '#ff0000', opacity: 0.18 * (0.5 + 0.5 * Math.sin(t * 14)) * (1 - (t - mut[0]) / (mut[1] - mut[0])), mixBlendMode: 'multiply'}} />}
      <MapFX Z={Z} t={t} cam={cam} />
      {!intro && !(Z.q && t >= Z.q[0]) && <><Counters Z={Z} t={t} /><Day Z={Z} t={t} /><Cure Z={Z} t={t} /><News Z={Z} t={t} /></>}
      <Cards Z={Z} t={t} />
      <EndQ Z={Z} t={t} />
    </AbsoluteFill>
  );
};
