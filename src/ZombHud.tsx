// HUD del apocalipsis zombi (animación directa)
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COUNTRIES, FlagCanvas} from './HexWorld';
import {INK} from './lib3';
import {WallScene, LabScene, BunkerScene} from './Zomb3D';
import {Globe} from './Globe';

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
      <div style={{display: 'flex', gap: 16}}>{box('🟢', Z.hLabel || 'HEALTHY', h, '#4fe07a', '#e8ffe9')}{box('🧟', 'ZOMBIES', z, TOX, TOX)}{box('💀', 'DEAD', d, '#b9b2c6', '#ffffff')}</div>
      <div style={{width: 820, height: 30, borderRadius: 15, background: '#2a2733', border: `4px solid ${INK}`, position: 'relative', overflow: 'hidden', boxShadow: `0 4px 0 ${INK}`, display: 'flex'}}>
        <div style={{width: `${h / W * 100}%`, background: 'linear-gradient(180deg,#6ff09a,#2fb85a)'}} />
        <div style={{width: `${z / W * 100}%`, background: 'linear-gradient(180deg,#a8f05a,#4f9a22)'}} />
        <div style={{width: `${d / W * 100}%`, background: 'linear-gradient(180deg,#8a8496,#4a4556)'}} />
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...F, fontSize: 20, color: '#fff', textShadow: `2px 2px 0 ${INK}`}}>WORLD STATUS · HUMANITY LOST {(lost * 100).toFixed(lost < 0.01 ? 3 : 1)}%</div>
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
  const T0 = Z.cureT ?? 116; const p = kfl(Z.cure, t); if (t < T0) return null; const a = cl((t - T0) / 0.6, 0, 1); const done = p >= 100;
  const IN = COUNTRIES.findIndex((c) => c.c === 'IN'), ID = COUNTRIES.findIndex((c) => c.c === 'ID');
  return (
    <div style={{position: 'absolute', right: 24, top: 20, width: 320, opacity: a, background: DARK, border: `5px solid ${done ? '#fff' : BLUE}`, borderRadius: 16, padding: '8px 14px 12px', boxShadow: `0 6px 0 ${INK}, 0 0 ${done ? 40 : 18}px ${BLUE}88`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <span style={{fontSize: 30}}>💉</span><div style={{...F, fontSize: 28, color: BLUE, flex: 1}}>CURE</div>
        {[IN, ID].map((k) => <div key={k} style={{width: 42, height: 28, borderRadius: 5, overflow: 'hidden', border: `3px solid ${INK}`}}><FlagCanvas k={k} w={42} h={28} /></div>)}
      </div>
      <div style={{marginTop: 6, height: 34, borderRadius: 17, background: '#23303c', border: `4px solid ${INK}`, position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${p}%`, background: `linear-gradient(90deg,#1a6fd0,${BLUE},#9fe1ff)`, boxShadow: `0 0 16px ${BLUE}`}} />
        <div style={{position: 'absolute', left: `${p}%`, top: 0, bottom: 0, width: 30, marginLeft: -15, background: 'rgba(255,255,255,0.35)', filter: 'blur(6px)', transform: `translateX(${Math.sin(t * 4) * 6}px)`}} />
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...F, fontSize: 24, color: '#fff', textShadow: `2px 2px 0 ${INK}`}}>{done ? 'READY!' : `${Math.floor(p)}%`}</div>
      </div>
      <div style={{...F, fontSize: 17, color: '#9fd8ff', textAlign: 'center', marginTop: 6, letterSpacing: 1}}>{done ? 'HUMANITY IS SAVED' : `DAYS UNTIL THE CURE: ${p > 85 ? Math.max(1, Math.round((100 - p) * 0.9)) : '???'}`}</div>
    </div>
  );
};
const News: React.FC<{Z: any; t: number}> = ({Z, t}) => {
  const pipOn = ((Z.pip || []) as any[]).some((x) => t >= x[0] - 0.3 && t < x[1]);
  const n = (Z.news as any[]).filter((x) => t >= x[0] && t < x[1]).slice(-1)[0]; if (!n) return null;
  const [t0, t1, txt, ic] = n; const a = fadeW(t, t0, t1, 0.3); const sx = (1 - eo((t - t0) / 0.4)) * -120;
  return (
    <div style={{position: 'absolute', left: pipOn ? 700 : 0, right: 0, bottom: 34, display: 'flex', justifyContent: 'center', opacity: a, transform: `translateY(${-sx * 0.2}px)`}}>
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
export const ZombMapFX: React.FC<{D: any; t: number; cam: Cam}> = ({D, t, cam}) => {
  const Z = D.zomb; if (!Z) return null;
  const out: React.ReactNode[] = [];
  // búnkeres: escudo verde mientras aguantan, rojo parpadeando al ser atacados, tachado al caer
  for (const b of (Z.bunkers || []) as any[]) {
    const [x, y, tf] = b; if (t < (Z.shelterT ?? 0) || t > tf + 2.5) continue; const [sx, sy] = toS(x, y, cam);
    if (sx < -60 || sx > VW + 60 || sy < -60 || sy > VH + 60) continue;
    const r = Math.max(13, Math.min(30, 9 * cam.s + 8)); const atk = t > tf - 3.4 && t < tf; const dead = t >= tf;
    const pop = Math.min(1, (t - (Z.shelterT ?? 0)) / 0.4);
    out.push(<g key={'bk' + x + '_' + y} transform={`translate(${sx},${sy}) scale(${pop})`} opacity={dead ? Math.max(0, 1 - (t - tf) / 2.5) : 1}>
      {atk && <circle r={r * (1.5 + 0.3 * Math.sin(t * 12))} fill="none" stroke="#ff2a2a" strokeWidth={4} opacity={0.5 + 0.5 * Math.sin(t * 12)} />}
      <path d={`M0,${-r} L${r * 0.85},${-r * 0.55} L${r * 0.75},${r * 0.35} Q0,${r * 1.15} ${-r * 0.75},${r * 0.35} L${-r * 0.85},${-r * 0.55} Z`} fill={dead ? '#5a5560' : atk ? '#c81e1e' : '#2f9e4a'} stroke={INK} strokeWidth={3} />
      {!dead && <path d={`M${-r * 0.35},0 L${-r * 0.05},${r * 0.3} L${r * 0.4},${-r * 0.3}`} fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />}
      {dead && <path d={`M${-r * 0.4},${-r * 0.4} L${r * 0.4},${r * 0.4} M${r * 0.4},${-r * 0.4} L${-r * 0.4},${r * 0.4}`} stroke="#fff" strokeWidth={4} strokeLinecap="round" />}
    </g>);
  }
  // mapa de calor (focos activos que laten) + refugiados huyendo
  if (Z.seeds && t < (Z.cureT1 ?? 1e9)) for (const ks in Z.seeds) {
    const k = +ks; const f = zfrac(D, k, t); if (f < 0.02 || f > 0.97) continue; const [x, y, R0] = Z.seeds[ks]; const [sx, sy] = toS(x, y, cam);
    if (sx < -300 || sx > VW + 300 || sy < -300 || sy > VH + 300) continue;
    const r = Math.max(30, R0 * Math.sqrt(f) * cam.s) * (1 + 0.08 * Math.sin(t * 5 + k));
    const mut = t >= (Z.mutT ?? 1e9);
    out.push(<circle key={'h' + k} cx={sx} cy={sy} r={r} fill={`url(#${mut ? 'heatM' : 'heatZ'})`} />);
    if (f > 0.1 && f < 0.85) for (let j = 0; j < 5; j++) { const a = (k * 1.7 + j * 1.26) % (Math.PI * 2); const ph = ((t * 0.35 + j / 5 + k * 0.13) % 1); const dd = r * (0.9 + ph * 0.9);
      out.push(<circle key={'rf' + k + j} cx={sx + Math.cos(a) * dd} cy={sy + Math.sin(a) * dd} r={3.2} fill="#ffffff" stroke={INK} strokeWidth={1.2} opacity={(1 - ph) * 0.9} />); }
  }
  (Z.flights as any[]).forEach((f, i) => {
    const [t0, t1, x0, y0, x1, y1, cure] = f; if (t < t0 || t > t1 + 0.6) return;
    const [ax, ay] = toS(x0, y0, cam), [bx, by] = toS(x1, y1, cam); const mx = (ax + bx) / 2, my = Math.min(ay, by) - Math.hypot(bx - ax, by - ay) * 0.28;
    const u = eo((t - t0) / (t1 - t0)); const q = (p: number) => [(1 - p) ** 2 * ax + 2 * (1 - p) * p * mx + p * p * bx, (1 - p) ** 2 * ay + 2 * (1 - p) * p * my + p * p * by];
    const [px, py] = q(u); const [qx, qy] = q(Math.min(1, u + 0.02)); const ang = Math.atan2(qy - py, qx - px) * 180 / Math.PI;
    const col = cure ? BLUE : TOX; const a = t > t1 ? 1 - (t - t1) / 0.6 : 1;
    out.push(<g key={'fs' + i} opacity={a * 0.28} transform={`translate(${px + 26},${py + 34}) rotate(${ang}) scale(1.6)`}><path d="M-22,-4 L10,-4 L22,0 L10,4 L-22,4 Z M-4,-4 L-12,-20 L-6,-20 L6,-4 Z M-4,4 L-12,20 L-6,20 L6,4 Z" fill="#000" /></g>);
    out.push(<g key={'f' + i} opacity={a}><path d={`M${ax},${ay} Q${mx},${my} ${bx},${by}`} fill="none" stroke={col} strokeWidth={9} strokeDasharray="18 12" opacity={0.95} />
      <g transform={`translate(${px},${py}) rotate(${ang}) scale(1.9)`}><path d="M-22,-4 L10,-4 L22,0 L10,4 L-22,4 Z M-4,-4 L-12,-20 L-6,-20 L6,-4 Z M-4,4 L-12,20 L-6,20 L6,4 Z M-20,-4 L-26,-12 L-22,-12 L-14,-4 Z M-20,4 L-26,12 L-22,12 L-14,4 Z" fill="#fff" stroke={INK} strokeWidth={3} /><circle cx={-30} cy={0} r={6} fill={col} opacity={0.8} /></g></g>);
  });
  (Z.mist as any[]).forEach((m, i) => {
    const [t0, t1, x, y, R0] = m; if (t < t0 || t > t1) return; const [sx, sy] = toS(x, y, cam); const u = (t - t0) / (t1 - t0);
    out.push(<g key={'m' + i} opacity={(1 - u) * Math.min(1, u * 6)}>{[0, 1, 2, 3].map((j) => <circle key={j} cx={sx + Math.sin(j * 2.1 + u) * 26} cy={sy + Math.cos(j * 2.1 + u) * 18} r={R0 * cam.s * (0.35 + u * (0.7 + j * 0.15))} fill="url(#cureMist)" />)}</g>);
  });
  (Z.pops as any[]).forEach((p, i) => {
    const [t0, t1, x, y, txt, col, ring] = p; if (t < t0 || t > t1) return; const [sx, sy] = toS(x, y, cam); const a = fadeW(t, t0, t1, 0.3);
    out.push(<g key={'p' + i} opacity={a}>
      {ring ? [0, 1].map((j) => { const ph = ((t - t0) * 0.8 + j / 2) % 1; return <circle key={j} cx={sx} cy={sy} r={14 + ph * 60} fill="none" stroke={col} strokeWidth={5} opacity={(1 - ph) * 0.8} />; }) : null}
      <g transform={`translate(${sx},${sy - 70}) scale(${popIn(t, t0)})`}><rect x={-txt.length * 13 - 22} y={-30} width={txt.length * 26 + 44} height={56} rx={28} fill={col} stroke={INK} strokeWidth={5} /><text y={12} textAnchor="middle" fontSize={36} fill="#fff" stroke={INK} strokeWidth={5} paintOrder="stroke" style={F}>{txt}</text></g>
    </g>);
  });
  return <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><defs><radialGradient id="heatZ"><stop offset="0%" stopColor="#d8ff6a" stopOpacity={0.55} /><stop offset="55%" stopColor="#7bd83a" stopOpacity={0.22} /><stop offset="100%" stopColor="#7bd83a" stopOpacity={0} /></radialGradient><radialGradient id="heatM"><stop offset="0%" stopColor="#ff8a50" stopOpacity={0.55} /><stop offset="55%" stopColor="#d8301a" stopOpacity={0.22} /><stop offset="100%" stopColor="#d8301a" stopOpacity={0} /></radialGradient><radialGradient id="cureMist"><stop offset="0%" stopColor="#9fe1ff" stopOpacity={0.55} /><stop offset="60%" stopColor="#2fa8ff" stopOpacity={0.25} /><stop offset="100%" stopColor="#2fa8ff" stopOpacity={0} /></radialGradient></defs>{out}</svg>;
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

// ---------------------------------------------------------------- v2: 3D, beats, contador gigante, encuesta, sellos, naciones, grading
// ventana 3D pequeña abajo a la izquierda con animación de despliegue
const PW = 640, PH = 360;
const PiP: React.FC<{Z: any; t: number}> = ({Z, t}) => {
  const s = ((Z.pip || []) as any[]).find((x) => t >= x[0] && t < x[1]); if (!s) return null;
  const [t0, t1, kind, p0, p1, fl, title, sub] = s; const u = t - t0;
  const open = popIn(t, t0), close = 1 - eo((t - (t1 - 0.35)) / 0.35); const k = Math.min(open, t > t1 - 0.35 ? close : 1);
  const p = p0 < 0 ? kfl(Z.cure, t) : p0 + (p1 - p0) * cl((u - 0.3) / Math.max(0.1, t1 - t0 - 0.9), 0, 1);
  const done = fl === 'done' || (p0 < 0 && p >= 100) ? cl((t - (Z.cureT1 ?? t0)) / 0.8, 0, 1) : 0;
  const col = fl === 'fail' || fl === 'fall' ? RED : kind === 'lab' ? BLUE : fl === 'breach' ? RED : kind === 'bunker' ? '#ffb020' : '#ffd23f';
  return (
    <div style={{position: 'absolute', left: 30, bottom: 74, width: PW, height: PH, transformOrigin: '0% 100%', transform: `scale(${k}) rotate(${(1 - k) * -6}deg)`, opacity: Math.min(1, k * 1.5), zIndex: 43}}>
      <div style={{position: 'absolute', inset: -8, borderRadius: 26, background: INK, boxShadow: `0 10px 0 ${INK}, 0 0 36px ${col}88`}} />
      <div style={{position: 'absolute', inset: 0, borderRadius: 18, overflow: 'hidden', border: `5px solid ${col}`}}>
        {kind === 'lab' ? <LabScene u={u} p={p} fail={fl === 'fail' && u > 1.4} done={done} w={PW} h={PH} /> : kind === 'bunker' ? <BunkerScene u={u} fl={fl} w={PW} h={PH} n={fl === 'close' ? 10 : 14} /> : <WallScene u={u} breach={fl === 'breach'} w={PW} h={PH} />}
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.45) 100%)'}} />
        <div style={{position: 'absolute', left: 14, top: 12, display: 'flex', gap: 8, alignItems: 'center'}}>
          <span style={{background: RED, color: '#fff', ...F, fontSize: 20, padding: '2px 10px 0', borderRadius: 8, border: `3px solid ${INK}`, opacity: 0.6 + 0.4 * Math.sin(t * 6)}}>● LIVE</span>
          <span style={{...F, fontSize: 26, color: '#fff', textShadow: `2px 2px 0 ${INK}`}}>{title}</span>
        </div>
        {sub && <div style={{position: 'absolute', left: 14, bottom: 12, ...F, fontSize: 22, color: '#fff', background: col, border: `3px solid ${INK}`, borderRadius: 10, padding: '2px 12px 0'}}>{sub}</div>}
        {kind === 'lab' && <div style={{position: 'absolute', right: 14, top: 54, background: 'rgba(6,16,28,0.85)', border: `4px solid ${fl === 'fail' ? RED : BLUE}`, borderRadius: 14, padding: '4px 16px 0', textAlign: 'center'}}>
          <div style={{...F, fontSize: 16, color: fl === 'fail' ? RED : BLUE, letterSpacing: 2}}>CURE</div>
          <div style={{...F, fontSize: 64, lineHeight: 1, color: '#fff', fontVariantNumeric: 'tabular-nums'}}>{Math.floor(p)}%</div>
          {fl === 'fail' && u > 1.4 && <div style={{...F, fontSize: 24, color: '#fff', background: RED, border: `3px solid ${INK}`, borderRadius: 8, padding: '1px 8px 0', margin: '4px 0 6px', transform: `rotate(-6deg) scale(${popIn(t, t0 + 1.4)})`}}>TEST FAILED</div>}
          {done > 0 && <div style={{...F, fontSize: 24, color: INK, background: '#9fe8ff', border: `3px solid ${INK}`, borderRadius: 8, padding: '1px 8px 0', margin: '4px 0 6px', transform: `scale(${popIn(t, Z.cureT1 ?? t0)})`}}>READY!</div>}
        </div>}
      </div>
    </div>
  );
};
// transición por globo entre continentes
const GlobeT: React.FC<{D: any; t: number}> = ({D, t}) => {
  const Z = D.zomb; const g = ((Z.globes || []) as any[]).find((x) => t >= x[0] && t < x[1]); if (!g) return null;
  const [t0, t1, lo0, la0, lo1, la1] = g; const u = eo((t - t0) / (t1 - t0)); const a = cl(Math.min((t - t0) / 0.35, (t1 - t) / 0.35), 0, 1);
  const mut = t >= (Z.mutT ?? 1e9);
  const hl = (c: string) => { const k = COUNTRIES.findIndex((x) => x.c === c); if (k < 0) return null; const f = zfrac(D, k, t); return f > 0.5 ? (mut ? '#9a2a18' : '#5fb832') : f > 0.05 ? '#d8c040' : null; };
  return <AbsoluteFill style={{zIndex: 35, opacity: a, transform: `scale(${1 + 0.25 * (1 - a)})`}}><Globe W={VW} H={VH} lon={lo0 + (lo1 - lo0) * u} lat={la0 + (la1 - la0) * u} radius={430} cy={560} overlay={0.35} highlight={hl} stars={1} /></AbsoluteFill>;
};
// ranking de los últimos países en pie
const Rank: React.FC<{D: any; t: number}> = ({D, t}) => {
  const Z = D.zomb; const w = ((Z.rank || []) as any[]).find((x) => t >= x[0] && t < x[1]); if (!w) return null;
  const a = fadeW(t, w[0], w[1], 0.4);
  const rows = (Z.rankList as string[]).map((c) => { const k = COUNTRIES.findIndex((x) => x.c === c); return {c, k, f: zfrac(D, k, t)}; }).filter((r) => r.k >= 0).sort((x, y) => x.f - y.f).slice(0, 6);
  return (
    <div style={{position: 'absolute', right: 24, top: 190, width: 320, opacity: a, background: DARK, border: `5px solid #ffb020`, borderRadius: 16, padding: '8px 12px', boxShadow: `0 6px 0 ${INK}`}}>
      <div style={{...F, fontSize: 21, color: '#ffb020', textAlign: 'center', letterSpacing: 1}}>LAST COUNTRIES STANDING</div>
      {rows.map((r) => { const dead = r.f > 0.96; return <div key={r.c} style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, opacity: dead ? 0.45 : 1}}>
        <div style={{width: 42, height: 28, borderRadius: 4, overflow: 'hidden', border: `3px solid ${INK}`, flexShrink: 0}}><FlagCanvas k={r.k} w={42} h={28} /></div>
        <div style={{...F, fontSize: 20, color: '#fff', width: 120, textDecoration: dead ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden'}}>{COUNTRIES[r.k].n.toUpperCase()}</div>
        <div style={{flex: 1, height: 16, borderRadius: 8, background: '#2a2733', border: `2px solid ${INK}`, overflow: 'hidden'}}><div style={{width: `${(1 - r.f) * 100}%`, height: '100%', background: '#4fe07a'}} /></div>
      </div>; })}
    </div>
  );
};
const Speed: React.FC<{Z: any; t: number}> = ({Z, t}) => {
  if (!Z.speed) return null; const v = kfl(Z.speed, t); const col = v > 70 ? RED : v > 40 ? '#ffb020' : '#7bd83a';
  return (
    <div style={{position: 'absolute', left: 24, top: 240, width: 160, background: DARK, border: `5px solid ${col}`, borderRadius: 16, padding: '4px 10px 8px', boxShadow: `0 6px 0 ${INK}`}}>
      <div style={{...F, fontSize: 15, color: col, textAlign: 'center'}}>INFECTION SPEED</div>
      <div style={{height: 14, borderRadius: 7, background: '#2a2733', border: `2px solid ${INK}`, overflow: 'hidden'}}><div style={{width: `${v}%`, height: '100%', background: col}} /></div>
      {v > 70 && <div style={{...F, fontSize: 18, color: '#fff', textAlign: 'center', opacity: 0.6 + 0.4 * Math.sin(t * 8)}}>x2 MUTANT</div>}
    </div>
  );
};
const Story: React.FC<{Z: any; t: number; end: number}> = ({Z, t, end}) => {
  if (!Z.story) return null; const L = 900; const u = cl(t / end, 0, 1);
  return (
    <div style={{position: 'absolute', left: (VW - L) / 2, bottom: 10, width: L, height: 12}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 6, background: 'rgba(20,18,28,0.8)', border: `2px solid ${INK}`}} />
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: u * L, borderRadius: 6, background: 'linear-gradient(90deg,#7bd83a,#ff4a3a,#2fa8ff)'}} />
      {(Z.story as any[]).map(([tt, ic]: any, i: number) => <div key={i} style={{position: 'absolute', left: (tt / end) * L - 13, top: -12, fontSize: 22, filter: t >= tt ? 'none' : 'grayscale(1) brightness(0.6)'}}>{ic}</div>)}
    </div>
  );
};
const Caps: React.FC<{Z: any; t: number}> = ({Z, t}) => {
  const c = ((Z.cap || []) as any[]).find((x) => t >= x[0] && t < x[1]); if (!c) return null; const pipOn = ((Z.pip || []) as any[]).some((x) => t >= x[0] - 0.3 && t < x[1]);
  const [t0, t1, title, sub, col] = c; const a = fadeW(t, t0, t1, 0.25); const sx = (1 - eo((t - t0) / 0.45)) * -500;
  return (
    <div style={{position: 'absolute', left: 70 + sx, bottom: pipOn ? 470 : 90, opacity: a, zIndex: 41}}>
      <div style={{...F, fontSize: 96, color: '#fff', WebkitTextStroke: `9px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 8px 0 ${INK}, 0 0 30px ${col}`, lineHeight: 1}}>{title}</div>
      {sub && <div style={{display: 'inline-block', marginTop: 10, background: col, border: `5px solid ${INK}`, borderRadius: 12, padding: '4px 20px 0', ...F, fontSize: 40, color: '#fff', boxShadow: `0 5px 0 ${INK}`}}>{sub}</div>}
    </div>
  );
};
const Beats: React.FC<{Z: any; t: number}> = ({Z, t}) => {
  const b = ((Z.beats || []) as any[]).find((x) => t >= x[0] && t < x[1]); if (!b) return null;
  const [t0, t1, txt, col, size, bg] = b; const a = fadeW(t, t0, t1, 0.12); const k = popIn(t, t0) * (1 + (t - t0) * 0.04);
  return (
    <AbsoluteFill style={{zIndex: 45, background: bg ? '#000' : 'transparent', opacity: bg ? 1 : a}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: a}}>
        <div style={{...F, fontSize: size, color: col, WebkitTextStroke: `${Math.round(size / 11)}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${Math.round(size / 12)}px 0 ${INK}, 0 0 50px ${col}aa`, transform: `scale(${k})`, textAlign: 'center', lineHeight: 1.05, whiteSpace: 'pre-line'}}>{txt}</div>
      </div>
    </AbsoluteFill>
  );
};
const BigCount: React.FC<{Z: any; t: number}> = ({Z, t}) => {
  const b = ((Z.bigc || []) as any[]).find((x) => t >= x[0] && t < x[1]); if (!b) return null;
  const [t0, t1, label, col, idx, pct] = b; const v = interpCnt(Z.cnt, t); const a = fadeW(t, t0, t1, 0.2);
  const val = pct ? ((v[1] + v[2]) / Z.world * 100).toFixed(1) + '%' : Math.round(v[idx]).toLocaleString('en-US');
  return (
    <AbsoluteFill style={{zIndex: 44, opacity: a, background: 'rgba(0,0,0,0.55)'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', transform: `scale(${popIn(t, t0)})`}}>
        <div style={{...F, fontSize: 220, color: col, WebkitTextStroke: `16px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 14px 0 ${INK}, 0 0 60px ${col}`, lineHeight: 1, fontVariantNumeric: 'tabular-nums', transform: `translateX(${Math.sin(t * 50) * 3}px)`}}>{val}</div>
        <div style={{...F, fontSize: 70, color: '#fff', WebkitTextStroke: `7px ${INK}`, paintOrder: 'stroke fill', marginTop: 10}}>{label}</div>
      </div>
    </AbsoluteFill>
  );
};
const Poll: React.FC<{Z: any; t: number}> = ({Z, t}) => {
  const p = Z.poll; if (!p || t < p[0] || t >= p[1]) return null; const [t0, t1, title, cs] = p; const a = fadeW(t, t0, t1, 0.25);
  return (
    <AbsoluteFill style={{zIndex: 44, opacity: a, background: 'rgba(8,6,16,0.7)'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', ...F, fontSize: 110, color: '#ffd23f', WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 9px 0 ${INK}`, transform: `scale(${popIn(t, t0)})`}}>{title}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center', gap: 60}}>
        {(cs as string[]).map((c, i) => { const k = COUNTRIES.findIndex((x) => x.c === c); const s = popIn(t, t0 + 0.4 + i * 0.25);
          return <div key={c} style={{transform: `scale(${s}) translateY(${Math.sin(t * 3 + i) * 6}px)`, textAlign: 'center'}}>
            <div style={{width: 250, height: 166, borderRadius: 18, overflow: 'hidden', border: `7px solid ${INK}`, boxShadow: `0 8px 0 ${INK}`}}><FlagCanvas k={k} w={250} h={166} /></div>
            <div style={{...F, fontSize: 46, color: '#fff', marginTop: 10, WebkitTextStroke: `5px ${INK}`, paintOrder: 'stroke fill'}}>{COUNTRIES[k].n.toUpperCase()}</div>
          </div>; })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center', ...F, fontSize: 52, color: '#fff', opacity: cl((t - t0 - 1.4) / 0.4, 0, 1)}}>Comment your guess 👇</div>
    </AbsoluteFill>
  );
};
const Stamps: React.FC<{Z: any; t: number}> = ({Z, t}) => {
  const s = ((Z.stamps || []) as any[]).filter((x) => t >= x[0] && t < x[0] + 1.9).slice(-1)[0]; if (!s) return null;
  const [t0, k, txt, col] = s; const a = fadeW(t, t0, t0 + 1.9, 0.2); const sc = 1 + 0.8 * (1 - eo((t - t0) / 0.25));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center', opacity: a, zIndex: 42}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, background: col || RED, border: `6px solid ${INK}`, borderRadius: 18, padding: '8px 26px 4px 12px', boxShadow: `0 7px 0 ${INK}`, transform: `rotate(-3deg) scale(${sc})`}}>
        <div style={{width: 96, height: 64, borderRadius: 8, overflow: 'hidden', border: `4px solid ${INK}`}}><FlagCanvas k={k} w={96} h={64} /></div>
        <div style={{...F, fontSize: 62, color: '#fff', WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill'}}>{txt}</div>
      </div>
    </div>
  );
};
const Stand: React.FC<{Z: any; t: number}> = ({Z, t}) => {
  if (!Z.stand || t < Z.stand[0][0]) return null; const n = Math.round(kfl(Z.stand, t));
  return (
    <div style={{position: 'absolute', left: 24, top: 148, background: DARK, border: `5px solid #4fe07a`, borderRadius: 16, padding: '4px 16px 2px', boxShadow: `0 6px 0 ${INK}`, textAlign: 'center'}}>
      <div style={{...F, fontSize: 17, letterSpacing: 1, color: '#4fe07a'}}>{Z.standLabel || 'NATIONS LEFT'}</div>
      <div style={{...F, fontSize: 46, lineHeight: 1, color: '#fff'}}>{n}</div>
    </div>
  );
};
const Grade: React.FC<{Z: any; t: number}> = ({Z, t}) => (<>{((Z.grade || []) as any[]).map((g, i) => { if (t < g[0] || t > g[1]) return null; return <AbsoluteFill key={i} style={{background: g[2], opacity: g[3] * fadeW(t, g[0], g[1], 1.2), mixBlendMode: g[4] || 'multiply'}} />; })}</>);

export const ZombHud: React.FC<{D: any; t: number; cam: Cam}> = ({D, t, cam}) => {
  const Z = D.zomb; if (!Z) return null; const intro = t < (Z.hudT ?? 6.6);
  const inGl = ((Z.globes || []) as any[]).some((x) => t >= x[0] && t < x[1]);
  const full = ((Z.bigc || []) as any[]).some((x) => t >= x[0] && t < x[1]) || (Z.poll && t >= Z.poll[0] && t < Z.poll[1]);
  const mut = (Z.hl as any[]).find((h) => t >= h[0] && t < h[1]);
  const fin = Z.q && t >= Z.q[0];
  return (
    <AbsoluteFill style={{zIndex: 40, pointerEvents: 'none'}}>
      <Grade Z={Z} t={t} />
      {mut && <AbsoluteFill style={{background: '#ff0000', opacity: 0.18 * (0.5 + 0.5 * Math.sin(t * 14)) * (1 - (t - mut[0]) / (mut[1] - mut[0])), mixBlendMode: 'multiply'}} />}
      <GlobeT D={D} t={t} />
      {!intro && !full && !fin && <><Counters Z={Z} t={t} /><Day Z={Z} t={t} /><Stand Z={Z} t={t} /><Speed Z={Z} t={t} /><Cure Z={Z} t={t} />{!inGl && <><Rank D={D} t={t} /><News Z={Z} t={t} /><Stamps Z={Z} t={t} /></>}<Story Z={Z} t={t} end={D.dur} /></>}
      {!fin && <PiP Z={Z} t={t} />}
      <Caps Z={Z} t={t} />
      <BigCount Z={Z} t={t} />
      <Poll Z={Z} t={t} />
      <Cards Z={Z} t={t} />
      <Beats Z={Z} t={t} />
      <EndQ Z={Z} t={t} />
    </AbsoluteFill>
  );
};
