// Can Indonesia Conquer the World? v2 — invasiones con pelotones por tierra (1920x1080). Versiones 'a' y 'b'.
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, staticFile, useCurrentFrame} from 'remotion';
import {FlagCanvas, makeCam, CamKey, Cam, COUNTRIES, MAINCOL, NK, FLAG_OVR} from './HexWorld';
import {Globe} from './Globe';
import {PolyCanvas, PolyMini, polyState, ownerStats, CEv, CAREA, MAINPIECE, PIECES_C} from './PolyWorld';
import {Face, Mood, INK, YELLOW, RED, CREAM, font, font2, lerp, popT, fmt} from './lib3';
import {ShortCup, segTime} from './ShortFX';
import JA from './hw/indo2a.json';
import JB from './hw/indo2b.json';
import JC from './hw/indo2c.json';
import JD from './hw/indo2d.json';
import JU from './hw/usa.json';
import JL from './hw/latam.json';
import JH from './hw/hormuz.json';
import J_breu from './hw/breu.json';
import J_braf from './hw/braf.json';
import J_bras from './hw/bras.json';
import J_cqru from './hw/cqru.json';
import J_cqcn from './hw/cqcn.json';
import J_cqbr from './hw/cqbr.json';
import J_cqes from './hw/cqes.json';
import J_taiwan from './hw/taiwan.json';
import J_rceu from './hw/rceu.json';
import J_ukr from './hw/ukr.json';
import J_usla from './hw/usla.json';
import J_ww3 from './hw/ww3.json';
import J_survive from './hw/survive.json';
import J_ww2 from './hw/ww2.json';
import J_euarmy from './hw/euarmy.json';
import J_rare from './hw/rare.json';
import J_inpk from './hw/inpk.json';
import J_kor from './hw/kor.json';
import J_cart from './hw/cart.json';
import J_ilir from './hw/ilir.json';
import J_nato from './hw/nato.json';
import J_tw27 from './hw/tw27.json';
import J_grl from './hw/grl.json';

type Ctx = {D: any; camF: (t: number) => Cam; camF2: (t: number) => Cam; CEV: CEv[]; ID: number; MKB: Map<any, any[]>; ALLY: number[]};
const CTXS: Record<string, Ctx> = {};
const getCtx = (v: string): Ctx => {
  if (!CTXS[v]) {
  const JMAP: Record<string, any> = {breu: J_breu, braf: J_braf, bras: J_bras, cqru: J_cqru, cqcn: J_cqcn, cqbr: J_cqbr, cqes: J_cqes, taiwan: J_taiwan, rceu: J_rceu, ukr: J_ukr, usla: J_usla, ww3: J_ww3, survive: J_survive, ww2: J_ww2, grl: J_grl, tw27: J_tw27, nato: J_nato, ilir: J_ilir, cart: J_cart, kor: J_kor, inpk: J_inpk, rare: J_rare, euarmy: J_euarmy};
  const D = (JMAP[v] ? JMAP[v] : v === 'l' ? JL : v === 'h' ? JH : v === 'u' ? JU : v === 'd' ? JD : v === 'c' ? JC : v === 'b' ? JB : JA) as any;
    CTXS[v] = {D, camF: makeCam(D.cam as CamKey[], 0.02), camF2: makeCam(((D.cam2 && D.cam2.length) ? D.cam2 : D.cam) as CamKey[], 0.02), CEV: D.cev as CEv[], ID: D.id, MKB: new Map(), ALLY: ((D.cards as any[]).find((c) => c.kind === 'alliance') || {ks: []}).ks};
  }
  return CTXS[v];
};
let X: Ctx = getCtx('a');
export const indoFrames = (v: string) => Math.round(getCtx(v).D.dur * 30);

const NAME = (k: number) => COUNTRIES[k].n;
const UP = (k: number) => NAME(k).toUpperCase();
const COLD_END = 9.0;
const tmapAt = (t: number) => { const m = X.D.tmap as number[][]; let c = m[0]; for (const e of m) { if (e[0] <= t) c = e; else break; } return c[1] + (t - c[0]) * (c[2] ?? 1); };
const pst = (t: number) => polyState(X.CEV, t, tmapAt(t), t < COLD_END);
const kfv = (pk: number[][], t: number, i = 1) => {
  if (t <= pk[0][0]) return pk[0][i];
  for (let j = 1; j < pk.length; j++) if (t <= pk[j][0]) { const u = (t - pk[j - 1][0]) / (pk[j][0] - pk[j - 1][0]); return pk[j - 1][i] + (pk[j][i] - pk[j - 1][i]) * u; }
  return pk[pk.length - 1][i];
};
let VW = 1920, VH = 1080, SHORT = false;
const toS = (x: number, y: number, c: Cam): [number, number] => [VW / 2 + (x - c.cx) * c.s, VH / 2 + (y - c.cy) * c.s];
const FlagImg: React.FC<{k: number; w: number; h?: number; round?: boolean; style?: React.CSSProperties}> = ({k, w, h, round, style}) => (
  <FlagCanvas k={k} w={w} h={h ?? (round ? w : (w * 3) / 4)} style={{borderRadius: round ? '50%' : 6, border: `3px solid ${INK}`, flexShrink: 0, ...style}} />
);
const Ball: React.FC<{k: number; size: number; mood: Mood; t: number; look?: [number, number]}> = ({k, size, mood, t, look}) => (
  <div style={{position: 'relative', width: size, height: size}}>
    <FlagImg k={k} w={size} round style={{border: `${Math.max(4, size * 0.035)}px solid ${INK}`, boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}} />
    <svg width={size} height={size} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><Face x={size / 2} y={size * 0.47} r={size * 0.29} mood={mood} t={t} seed={k} look={look} /></svg>
  </div>
);
const shakeAt = (t: number) => { let x = 0, y = 0; for (const [st, a] of X.D.shakes as number[][]) { const d = t - st; if (d >= 0 && d < 0.6) { const m = a * (1 - d / 0.6); x += Math.sin(d * 83) * m; y += Math.cos(d * 67) * m; } } return [x, y]; };
const flashAt = (t: number) => { let a = 0; for (const st of X.D.flashes as number[]) { const d = t - st; if (d >= 0 && d < 0.3) a = Math.max(a, 1 - d / 0.3); } return a; };
const GRADES: Record<string, [string, number, string]> = {cold: ['#6fa8ff', 0.16, 'multiply'], day: ['#000', 0, 'normal'], tense: ['#1a2a55', 0.2, 'multiply'], dusk: ['#ff7a30', 0.13, 'multiply'], night: ['#0b1a45', 0.32, 'multiply'], red: ['#b3121f', 0.22, 'multiply'], gold: ['#ffcc55', 0.22, 'soft-light']};
const Grade: React.FC<{t: number}> = ({t}) => {
  const g = X.D.grade as [number, string][]; let cur = -1;
  for (let i = 0; i < g.length; i++) if (g[i][0] <= t) cur = i;
  if (cur < 0) return null;
  const a = GRADES[g[cur][1]]; const prev = cur > 0 ? GRADES[g[cur - 1][1]] : GRADES.day;
  const k = lerp(t, g[cur][0], g[cur][0] + 1.2, 0, 1);
  return (
    <>
      {prev[1] > 0 && <AbsoluteFill style={{background: prev[0], opacity: prev[1] * (1 - k), mixBlendMode: prev[2] as any, zIndex: 14, pointerEvents: 'none'}} />}
      {a[1] > 0 && <AbsoluteFill style={{background: a[0], opacity: a[1] * k, mixBlendMode: a[2] as any, zIndex: 14, pointerEvents: 'none'}} />}
    </>
  );
};
// caras + nombres
const Labels: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const st = pst(t); const os = ownerStats(st.owner);
  const stl = pst(Math.max(0, t - 1.2)); const osl = ownerStats(stl.owner);
  const s2 = cam.s * cam.s;
  const best = new Int32Array(NK).fill(-1); const bestA = new Float64Array(NK);
  for (let k = 0; k < NK; k++) { if (MAINPIECE[k] < 0) continue; const o = st.owner[k]; const ar = CAREA[k] * (o === k ? 1.6 : 1); if (ar > bestA[o]) { bestA[o] = ar; best[o] = k; } }
  const cand: number[] = [];
  for (let k = 0; k < NK; k++) {
    if (!os.a[k] || best[k] < 0 || os.a[k] * s2 < 14000) continue;
    const c = PIECES_C(best[k]); const [sx, sy] = toS(c[0], c[1], cam);
    if (sx < -60 || sx > VW + 60 || sy < -60 || sy > VH + 60) continue;
    cand.push(k);
  }
  const b = (X.D.battles as any[]).find((x) => t >= x.t0 && t < x.t1);
  cand.sort((x, y) => (b && x === b.b ? -1 : b && y === b.b ? 1 : x === X.ID ? -1 : y === X.ID ? 1 : os.a[y] - os.a[x]));
  const out: React.ReactNode[] = []; const placed: [number, number, number][] = [];
  for (const k of cand) {
    if (out.length >= 10) break;
    const c = PIECES_C(best[k]); const [sx, sy] = toS(c[0], c[1], cam);
    const r = Math.max(14, Math.min(62, Math.sqrt(os.a[k] * s2) * 0.07));
    if (placed.some(([px, py, pr]) => Math.hypot(px - sx, py - sy) < (pr + r) * 1.6)) continue;
    placed.push([sx, sy, r]);
    const dn = os.a[k] - osl.a[k];
    let mood: Mood = k === X.ID ? 'smug' : 'calm';
    if (b && k === b.b) mood = 'scared';
    if (dn < -os.a[k] * 0.02) mood = 'scared'; else if (dn > os.a[k] * 0.02) mood = 'angry';
    const fs = Math.max(15, Math.min(34, r * 0.6));
    out.push(
      <g key={k}>
        <Face x={sx} y={sy - r * 0.2} r={r} mood={mood} t={t} seed={k * 7 + 3} />
        <g transform={`translate(${sx},${sy + r * 0.95})`}>
          <rect x={-NAME(k).length * fs * 0.3 - 10} y={-fs * 0.62} width={NAME(k).length * fs * 0.6 + 20} height={fs * 1.3} rx={fs * 0.45} fill="rgba(255,255,255,0.95)" stroke={INK} strokeWidth={3} />
          <text y={fs * 0.36} textAnchor="middle" fontSize={fs} fill={INK} style={{fontFamily: 'Lilita'}}>{UP(k)}</text>
        </g>
      </g>,
    );
  }
  return <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{out}</svg>;
};
// sellos de conquista sobre cada país
const Stamps: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const out: React.ReactNode[] = [];
  for (const [t0, k, kind] of X.D.stamps as [number, number, string][]) {
    const d = t - t0; const life = kind === 'big' || kind === 'freebig' ? 2.2 : 1.3; const fr = kind === 'free' || kind === 'freebig';
    if (d < 0 || d > life) continue;
    const c = PIECES_C(k); const [sx0, sy0] = toS(c[0], c[1], cam);
    const sx = Math.max(160, Math.min(VW - 160, sx0)), sy = Math.max(140, Math.min(VH - 140, sy0));
    const a = popT(t, t0, 10) * lerp(d, life - 0.3, life, 1, 0);
    const big = kind === 'big' || kind === 'freebig';
    out.push(
      <div key={`${k}-${t0}`} style={{position: 'absolute', left: sx, top: sy, transform: `translate(-50%,-50%) scale(${0.4 + 0.6 * a}) rotate(-6deg)`, opacity: Math.min(1, a * 1.5), display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,248,235,0.97)', border: `${big ? 7 : 5}px solid ${fr ? '#2fae4e' : RED}`, borderRadius: 14, padding: big ? '8px 22px 4px 10px' : '4px 14px 2px 6px', boxShadow: '0 6px 0 rgba(0,0,0,0.35)', zIndex: 18, whiteSpace: 'nowrap'}}>
        <FlagImg k={k} w={big ? 64 : 40} round />
        <div style={{display: 'flex', flexDirection: 'column', lineHeight: 0.95}}>
          <span style={{...font, fontSize: big ? 40 : 26, color: INK}}>{UP(k)}</span>
          <span style={{...font, fontSize: big ? 30 : 20, color: fr ? '#2fae4e' : RED}}>{fr ? 'LIBERATED' : 'CONQUERED'}</span>
        </div>
      </div>,
    );
  }
  return <>{out}</>;
};
const Bubbles: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const out: React.ReactNode[] = [];
  for (const [t0, k, text, dd] of X.D.bubbles as [number, number, string, number][]) {
    const d = t - t0; if (d < 0 || d > dd) continue;
    const c = PIECES_C(k); const [sx0, sy0] = toS(c[0], c[1], cam);
    const sx = Math.max(260, Math.min(VW - 260, sx0)), sy = Math.max(200, Math.min(VH - 180, sy0 - 90));
    const a = popT(t, t0, 12) * lerp(d, dd - 0.25, dd, 1, 0);
    out.push(
      <div key={t0} style={{position: 'absolute', left: sx, top: sy, transform: `translate(-50%,-100%) scale(${a})`, transformOrigin: '50% 100%', zIndex: 19}}>
        <div style={{position: 'relative', background: '#fff', border: `4px solid ${INK}`, borderRadius: 18, padding: '8px 18px 4px', ...font2, fontSize: 30, color: INK, whiteSpace: 'nowrap', boxShadow: '0 5px 0 rgba(0,0,0,0.3)'}}>
          {text}
          <div style={{position: 'absolute', left: '50%', bottom: -16, width: 24, height: 24, background: '#fff', borderRight: `4px solid ${INK}`, borderBottom: `4px solid ${INK}`, transform: 'translateX(-50%) rotate(45deg)'}} />
        </div>
      </div>,
    );
  }
  return <>{out}</>;
};
// flotas
const Arrows: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const out: React.ReactNode[] = [];
  (X.D.arrows as any[]).forEach(([t0, t1, x0, y0, x1, y1, k], i) => {
    if (t < t0 - 0.1 || t > t1 + 0.6) return;
    const p = lerp(t, t0, t1, 0, 1, Easing.inOut(Easing.quad));
    const a = lerp(t, t0 - 0.1, t0 + 0.2, 0, 1) * lerp(t, t1 + 0.2, t1 + 0.6, 1, 0);
    const [ax, ay] = toS(x0, y0, cam), [bx, by] = toS(x1, y1, cam);
    const mx = (ax + bx) / 2, my = (ay + by) / 2 - Math.hypot(bx - ax, by - ay) * 0.18;
    const q = (u: number): [number, number] => [(1 - u) * (1 - u) * ax + 2 * (1 - u) * u * mx + u * u * bx, (1 - u) * (1 - u) * ay + 2 * (1 - u) * u * my + u * u * by];
    const pts: string[] = []; for (let j = 0; j <= 30; j++) { const [x, y] = q((j / 30) * p); pts.push(`${x.toFixed(1)},${y.toFixed(1)}`); }
    const col = MAINCOL[k];
    const kind = (X.D.arrows as any[])[i][7];
    if (kind === 'hero') {
      const ph = lerp(t, t0, t1, 0, 1, Easing.linear); const [sx, sy] = q(ph);
      const glow = 0.6 + 0.4 * Math.sin(t * 5);
      out.push(
        <g key={i} opacity={a}>
          <defs><radialGradient id={`hg${i}`}><stop offset="0%" stopColor="#fff6c0" stopOpacity={0.95} /><stop offset="45%" stopColor="#ffd23f" stopOpacity={0.45} /><stop offset="100%" stopColor="#ffd23f" stopOpacity={0} /></radialGradient></defs>
          <polygon points={`${sx - 40},${-60} ${sx + 40},${-60} ${sx + 150},${sy + 60} ${sx - 150},${sy + 60}`} fill="rgba(255,240,180,0.10)" />
          <circle cx={sx} cy={sy} r={150 * glow + 40} fill={`url(#hg${i})`} />
          <ellipse cx={sx} cy={sy + 26} rx={70} ry={14} fill="rgba(255,255,255,0.4)" />
          <g transform={`translate(${sx},${sy})`}><circle r={44} fill={col} stroke={YELLOW} strokeWidth={7} /><image href={staticFile('hw/icons/battleship.svg')} x={-30} y={-30} width={60} height={60} /></g>
        </g>,
      );
      return;
    }
    const firing = kind === 'fire' && p > 0.55 && p < 1;
    out.push(
      <g key={i} opacity={a}>
        <polyline points={pts.join(' ')} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={5} strokeLinecap="round" strokeDasharray="4 12" />
        {firing && [0, 0.07, 0.14].map((lag, si) => { const [sx, sy] = q(Math.max(0, p - lag)); const on = Math.floor(t * 9 + si * 2) % 3 === 0; return on ? <g key={'f' + si}><circle cx={sx + (bx - sx) * 0.12} cy={sy + (by - sy) * 0.12 - 6} r={14} fill="#ffe36b" /><circle cx={sx + (bx - sx) * 0.12} cy={sy + (by - sy) * 0.12 - 6} r={7} fill="#fff" /></g> : null; })}
        {p < 1 && [0, 0.07, 0.14].map((lag, si) => { const [sx, sy] = q(Math.max(0, p - lag)); return (
          <g key={si} transform={`translate(${sx},${sy})`}><ellipse rx={30} ry={9} cy={14} fill="rgba(255,255,255,0.35)" /><circle r={si ? 17 : 22} fill={col} stroke={INK} strokeWidth={4} /><image href={staticFile('hw/icons/battleship.svg')} x={si ? -12 : -15} y={si ? -12 : -15} width={si ? 24 : 30} height={si ? 24 : 30} /></g>); })}
      </g>,
    );
  });
  return <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{out}</svg>;
};
const Laser: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const out: React.ReactNode[] = [];
  for (const [t0, x, y] of X.D.laser as number[][]) {
    const d = t - t0; if (d < -0.5 || d > 1.3) continue;
    const [sx, sy] = toS(x, y, cam);
    const a = d < 0 ? ((d + 0.5) / 0.5) * 0.6 : lerp(d, 0.8, 1.3, 1, 0);
    const w = d < 0 ? 5 : 34 + 18 * Math.sin(d * 40);
    out.push(
      <g key={t0} opacity={a}>
        {d < 0 && <circle cx={sx} cy={sy} r={30 + (1 + d * 2) * 30} fill="none" stroke="#ff2b4a" strokeWidth={4} strokeDasharray="10 8" />}
        <line x1={sx + 300} y1={-60} x2={sx} y2={sy} stroke="#ff2b4a" strokeWidth={w * 2} opacity={0.35} strokeLinecap="round" />
        <line x1={sx + 300} y1={-60} x2={sx} y2={sy} stroke="#ff6b7a" strokeWidth={w} strokeLinecap="round" />
        <line x1={sx + 300} y1={-60} x2={sx} y2={sy} stroke="#fff" strokeWidth={w * 0.3} strokeLinecap="round" />
      </g>,
    );
  }
  if (!out.length) return null;
  return <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0, zIndex: 12, overflow: 'visible'}}>{out}</svg>;
};
const Pill: React.FC<{children: React.ReactNode; bg?: string; style?: React.CSSProperties}> = ({children, bg = 'rgba(14,20,32,0.9)', style}) => (
  <div style={{background: bg, border: `4px solid ${INK}`, borderRadius: 16, boxShadow: '0 4px 0 rgba(0,0,0,0.35)', ...style}}>{children}</div>
);
const Hud: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const D = X.D;
  if (D.mode === 'br') return <HudBR t={t} cam={cam} />;
  if (D.mode === 'camp') return <HudCamp t={t} cam={cam} />;
  const show = lerp(t, D.war_t - 0.5, D.war_t + 0.3, 0, 1) * lerp(t, D.winT - 0.3, D.winT + 0.3, 1, 0);
  if (show <= 0.01) return null;
  const pw = kfv(D.indo, t);
  const st = pst(t);
  let n = 0; for (let k = 0; k < NK; k++) if (k !== X.ID && st.owner[k] === X.ID) n++;
  const ch = (D.chapters as any[]).filter((c) => c[0] <= t).slice(-1)[0];
  const lastF = (D.feed as number[][]).filter((f) => f[0] <= t).slice(-1)[0];
  const bump = lastF && t - lastF[0] < 0.3 ? 0.12 * (1 - (t - lastF[0]) / 0.3) : 0;
  const day = Math.round(kfv(D.days, t));
  const sk = (D.streak as number[][]).find(([a, b]) => t >= a && t <= b + 1.5);
  const sn = sk ? (D.feed as number[][]).filter((f) => f[0] >= sk[0] && f[0] <= t).length : 0;
  return (
    <>
      <div style={{position: 'absolute', top: 20, left: 20 + (1 - show) * -600, zIndex: 20, display: 'flex', alignItems: 'center', gap: 10}}>
        <Ball k={X.ID} size={78} mood="smug" t={t} />
        <div>
          <Pill style={{padding: '2px 14px 0', display: 'flex', alignItems: 'baseline', gap: 8}}>
            <span style={{...font, fontSize: 24, color: '#ffd23f'}}>⚡ POWER</span>
            <span style={{...font, fontSize: 40, color: '#fff', minWidth: 130}}>{fmt(pw)}</span>
          </Pill>
          <div style={{display: 'flex', gap: 6, marginTop: 5}}>
            {D.mode === 'hz' ? <HzPills t={t} /> : <><Pill bg={CREAM} style={{padding: '1px 12px 0', ...font, fontSize: 23, color: INK, transform: `scale(${1 + bump})`, transformOrigin: 'left center', display: 'inline-block'}}>🌍 {n} / {D.total}</Pill>
            {D.ver !== 'a' && <Pill bg="#2a3346" style={{padding: '1px 12px 0', ...font, fontSize: 23, color: '#ff9a8f', display: 'inline-block'}}>{D.total - n} LEFT</Pill>}</>}
          </div>
        </div>
      </div>
      {/* días */}
      <div style={{position: 'absolute', top: 18, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20, transform: `translateY(${(1 - show) * -120}px)`}}>
        <Pill bg="#1b1f2b" style={{padding: '4px 22px 0', ...font, fontSize: 40, color: YELLOW, border: `4px solid ${RED}`}}>📅 DAY {day}</Pill>
      </div>
      {ch && <div style={{position: 'absolute', top: 20, right: 20 + (1 - show) * -600, zIndex: 20}}><Pill bg={YELLOW} style={{padding: '4px 16px 0', ...font, fontSize: 26, color: INK}}>{(D.chapters as any[]).indexOf(ch) + 1} · {ch[1]}</Pill></div>}
      {sk && sn > 1 && (
        <div style={{position: 'absolute', top: 120, left: 22, zIndex: 20, transform: `scale(${0.9 + 0.1 * popT(t, lastF ? lastF[0] : 0, 8)})`, transformOrigin: 'left center', opacity: lerp(t, sk[1] + 1.0, sk[1] + 1.5, 1, 0)}}>
          <Pill bg={RED} style={{padding: '2px 14px 0', ...font, fontSize: 30, color: '#fff'}}>🔥 +{sn} IN A ROW</Pill>
        </div>
      )}
      <div style={{position: 'absolute', left: 20 + (1 - show) * -500, bottom: 20, zIndex: 20, border: `4px solid ${INK}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 5px 0 rgba(0,0,0,0.35)'}}>
        <PolyMini cev={X.CEV} t={t} tm={tmapAt(t)} byTm={t < COLD_END} cam={cam} w={260} h={135} VW={VW} VH={VH} />
      </div>
      <div style={{position: 'absolute', right: 22, bottom: 12, ...font2, fontSize: 16, color: 'rgba(255,255,255,0.85)', textShadow: '0 2px 3px #000', zIndex: 20, opacity: show}}>Hypothetical simulation · Power points are fictional</div>
    </>
  );
};
// tarjeta de batalla (derecha): poder de ambos + % de invasión
const Battle: React.FC<{t: number}> = ({t}) => {
  const b = (X.D.battles as any[]).find((x) => t >= x.t0 - 0.05 && t < x.t1);
  if (!b) return null;
  const pa = kfv(b.pk, t, 1), pb = kfv(b.pk, t, 2);
  const inv = b.inv && b.inv.length ? kfv(b.inv, t) : 0;
  const k0 = popT(t, b.t0 + 1.1, 12) * lerp(t, b.t1 - 0.3, b.t1, 1, 0);
  const vs = t < b.t0 + (X.D.ver === 'd' ? 1.9 : 1.25);
  const prev = b.inv && b.inv.length ? kfv(b.inv, t - 0.6) : 0;
  const down = inv < prev - 0.5;
  return (
    <>
      {vs && (
        <AbsoluteFill style={{zIndex: 42, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 110, background: `linear-gradient(105deg, ${MAINCOL[b.a ?? X.ID]}bb 0%, rgba(0,0,0,0.55) 50%, ${MAINCOL[b.bk ?? b.b]}bb 100%)`, opacity: lerp(t, b.t0, b.t0 + 0.15, 0, 1) * (X.D.ver === 'd' ? lerp(t, b.t0 + 1.6, b.t0 + 1.9, 1, 0) : lerp(t, b.t0 + 0.95, b.t0 + 1.25, 1, 0))}}>
          <div style={{transform: `translateX(${(1 - popT(t, b.t0, 11)) * -700}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}><Ball k={b.a ?? X.ID} size={230} mood="angry" t={t} look={[0.8, 0]} /><div style={{...font, fontSize: 56, color: '#fff', textShadow: `5px 5px 0 ${INK}`}}>{b.an || X.D.hero || 'INDONESIA'}</div>{X.D.ver === 'd' && <Pill bg={CREAM} style={{padding: '2px 18px 0', ...font, fontSize: 40, color: RED}}>⚡ {fmt(b.pk[0][1])}</Pill>}</div>
          <div style={{...font, fontSize: 180, color: YELLOW, WebkitTextStroke: `8px ${INK}`, paintOrder: 'stroke fill', transform: `rotate(-8deg) scale(${0.6 + 0.5 * popT(t, b.t0 + 0.1, 8)})`}}>VS</div>
          <div style={{transform: `translateX(${(1 - popT(t, b.t0, 11)) * 700}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}><Ball k={b.bk ?? b.b} size={230} mood="angry" t={t} look={[-0.8, 0]} /><div style={{...font, fontSize: 56, color: '#fff', textShadow: `5px 5px 0 ${INK}`}}>{b.bk != null ? UP(b.bk) : b.title}</div>{X.D.ver === 'd' && <Pill bg={CREAM} style={{padding: '2px 18px 0', ...font, fontSize: 40, color: '#1f4fbf'}}>⚡ {fmt(b.pk[0][2])}</Pill>}</div>
          {X.D.ver === 'd' && (() => { const pa0 = b.pk[0][1], pb0 = b.pk[0][2]; const pr = Math.round((100 * Math.pow(pa0, 1.3)) / (Math.pow(pa0, 1.3) + Math.pow(pb0, 1.3))); const fill = lerp(t, b.t0 + 0.2, b.t0 + 0.8, 50, pr); return (
            <div style={{position: 'absolute', top: SHORT ? 330 : 120, left: SHORT ? 60 : 360, right: SHORT ? 60 : 360}}>
              <div style={{display: 'flex', justifyContent: 'space-between', ...font, fontSize: 34, color: '#fff', textShadow: `3px 3px 0 ${INK}`}}><span>{Math.round(fill)}% WIN</span><span>WIN CHANCE</span><span>{100 - Math.round(fill)}% WIN</span></div>
              <div style={{height: 34, border: `5px solid ${INK}`, borderRadius: 12, overflow: 'hidden', display: 'flex', boxShadow: '0 5px 0 rgba(0,0,0,0.35)'}}><div style={{width: `${fill}%`, background: 'linear-gradient(180deg,#ff6b6b,#d0181e)'}} /><div style={{width: 6, background: '#fff'}} /><div style={{flex: 1, background: 'linear-gradient(180deg,#5a8bff,#1f3fa0)'}} /></div>
            </div>); })()}
        </AbsoluteFill>
      )}
      <div style={{position: 'absolute', right: 26, top: SHORT ? 1300 : 250, width: 420, zIndex: 41, transform: `translateX(${(1 - k0) * 520}px)`, background: CREAM, border: `5px solid ${INK}`, borderRadius: 22, padding: '14px 22px 16px', boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, ...font, fontSize: 38, color: INK}}><span>⚔️</span>{b.title}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 8}}><FlagImg k={b.a ?? X.ID} w={58} h={40} /><span style={{...font, fontSize: 50, color: RED}}>⚡ {fmt(pa)}</span></div>
        <div style={{display: 'flex', justifyContent: 'center', margin: '2px 0'}}><span style={{background: INK, color: '#fff', ...font, fontSize: 26, borderRadius: 20, padding: '1px 14px 0'}}>VS</span></div>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}><FlagImg k={b.bk ?? b.b} w={58} h={40} /><span style={{...font, fontSize: 50, color: '#1f4fbf'}}>⚡ {fmt(pb)}</span></div>
        {X.D.ver !== 'a' && (() => { const ms = markersFor(b).filter((m: any) => m[1] === b.b); return ms.length ? (
          <div style={{display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8}}>
            {ms.map((m: any, i: number) => { const dead = m[4] !== null && t >= m[4]; return <div key={i} style={{width: 46, height: 46, borderRadius: '50%', background: dead ? '#777' : m[0] === 'cap' ? '#ffd23f' : '#3b4a66', border: `4px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, position: 'relative', transform: `scale(${dead && t - m[4] < 0.3 ? 1.3 - (t - m[4]) : 1})`}}>{m[0] === 'cap' ? '⭐' : '🏰'}{dead && <span style={{position: 'absolute', ...font, fontSize: 40, color: RED, lineHeight: 1}}>✕</span>}</div>; })}
          </div>) : null; })()}
        <div style={{display: 'flex', justifyContent: 'space-between', ...font, fontSize: 24, color: INK, marginTop: 10}}><span>{b.lib ? 'LIBERATION' : 'INVASION'}</span><span style={{color: down ? '#1f4fbf' : RED}}>{Math.round(inv)}% {down ? '▼' : ''}</span></div>
        <div style={{height: 24, border: `4px solid ${INK}`, borderRadius: 12, overflow: 'hidden', background: '#e9dfc9'}}>
          <div style={{width: `${inv}%`, height: '100%', background: down ? 'linear-gradient(90deg,#ff8f8f,#c22)' : 'linear-gradient(90deg,#ff5a5a,#d0181e)'}} />
        </div>
      </div>
    </>
  );
};
const Chips: React.FC<{t: number}> = ({t}) => {
  const c = (X.D.chips as any[]).filter(([t0, , , d]) => t >= t0 && t < t0 + d).slice(-1)[0];
  if (!c) return null;
  const [t0, text, k, d] = c;
  const a = popT(t, t0, 11) * lerp(t, t0 + d - 0.3, t0 + d, 1, 0);
  return (
    <div style={{position: 'absolute', bottom: 54 + 95 * win(X.D.letterbox, t), left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 36}}>
      <div style={{transform: `translateY(${(1 - a) * 160}px) scale(${0.7 + 0.3 * a})`, opacity: Math.min(1, a * 1.5), display: 'flex', alignItems: 'center', gap: 16, background: CREAM, border: `5px solid ${INK}`, borderRadius: 22, padding: '8px 28px 4px 12px', boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>
        {k >= 0 && <FlagImg k={k} w={58} round />}
        <span style={{...font, fontSize: 44, color: INK}}>{text}</span>
      </div>
    </div>
  );
};
const QCard: React.FC<{t: number}> = ({t}) => {
  const c = ((X.D.qcards || []) as any[]).find(([t0, , d]) => t >= t0 && t < t0 + d);
  if (!c) return null;
  const [t0, text, d] = c; const a = popT(t, t0, 12) * lerp(t, t0 + d - 0.3, t0 + d, 1, 0);
  const n = Math.min(text.length, Math.floor((t - t0) * 45));
  return (
    <div style={{position: 'absolute', top: 96, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 34}}>
      <div style={{transform: `scale(${0.6 + 0.4 * a})`, opacity: Math.min(1, a * 1.4), background: 'rgba(10,12,20,0.88)', border: `4px solid ${YELLOW}`, borderRadius: 16, padding: '6px 26px 2px', ...font, fontSize: 46, color: YELLOW, whiteSpace: 'nowrap'}}>{text.slice(0, n)}<span style={{opacity: 0}}>{text.slice(n)}</span></div>
    </div>
  );
};

// ranking de los países más fuertes: aparece con la posición antigua y anima la subida
const Ranking: React.FC<{t: number}> = ({t}) => {
  const r = ((X.D.ranks || []) as any[]).find((x) => t >= x.t && t < x.t + 3.4);
  if (!r) return null;
  const dt = t - r.t; const a = popT(t, r.t, 11) * lerp(dt, 3.0, 3.4, 1, 0);
  const u = lerp(dt, 0.9, 2.1, 0, 1, Easing.inOut(Easing.cubic));
  const rank = Math.round(r.old + (r.new - r.old) * u);
  const rows = (r.top as number[][]).slice(0, 4);
  const RH = 92;
  // posición visual de Indonesia: debajo (fila 5) si está fuera del top 4; si entra, se coloca en su puesto
  const slot = (rk: number) => (rk <= 4 ? rk - 1 : 4.35);
  const ys = slot(r.old) + (slot(r.new) - slot(r.old)) * u;
  const climbed = r.new < r.old && dt > 2.1;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 130, display: 'flex', justifyContent: 'center', zIndex: 43, pointerEvents: 'none'}}>
      <div style={{transform: `scale(${0.6 + 0.4 * a})`, opacity: Math.min(1, a * 1.5), width: 760, background: 'rgba(12,16,28,0.94)', border: `6px solid ${INK}`, borderRadius: 26, padding: '16px 22px 22px', boxShadow: '0 12px 0 rgba(0,0,0,0.4)'}}>
        <div style={{...font, fontSize: 52, color: YELLOW, textAlign: 'center', marginBottom: 10}}>🏆 STRONGEST NATIONS</div>
        <div style={{position: 'relative', height: RH * 5.35}}>
          {rows.map(([k, pw], i) => {
            const bs = i + (r.old <= 4 && i >= r.old - 1 ? 1 : 0), as_ = i + (r.new <= 4 && i >= r.new - 1 ? 1 : 0);
            const sl = bs + (as_ - bs) * u;
            return (
              <div key={k} style={{position: 'absolute', left: 0, right: 0, top: sl * RH, height: RH - 12, display: 'flex', alignItems: 'center', gap: 16, background: '#f6eedb', border: `4px solid ${INK}`, borderRadius: 16, padding: '0 18px', opacity: sl > 4.2 ? 0.6 : 1}}>
                <span style={{...font, fontSize: 44, color: INK, width: 70}}>#{Math.round(sl) + 1}</span>
                <FlagImg k={k} w={70} h={48} />
                <span style={{...font, fontSize: 40, color: INK, flex: 1}}>{UP(k)}</span>
                <span style={{...font, fontSize: 36, color: '#1f4fbf'}}>⚡ {fmt(pw)}</span>
              </div>
            );
          })}
          <div style={{position: 'absolute', left: -8, right: -8, top: ys * RH, height: RH - 4, display: 'flex', alignItems: 'center', gap: 16, background: climbed ? 'linear-gradient(90deg,#ffd23f,#ff9a3c)' : 'linear-gradient(90deg,#ff5a5a,#d0181e)', border: `5px solid ${YELLOW}`, borderRadius: 18, padding: '0 22px', boxShadow: `0 0 ${20 + 20 * Math.sin(t * 8)}px rgba(255,210,63,0.8)`, transform: `scale(${1 + 0.06 * Math.sin(u * Math.PI)})`}}>
            <span style={{...font, fontSize: 52, color: '#fff', textShadow: `3px 3px 0 ${INK}`, width: 90}}>#{rank}</span>
            <FlagImg k={X.ID} w={74} h={50} />
            <span style={{...font, fontSize: 44, color: '#fff', textShadow: `3px 3px 0 ${INK}`, flex: 1, whiteSpace: 'nowrap'}}>INDONESIA</span>
            {r.new < r.old && dt > 0.9 && <span style={{...font, fontSize: 34, color: '#fff', textShadow: `3px 3px 0 ${INK}`, whiteSpace: 'nowrap'}}>{`▲${r.old - rank}`}</span>}
            <span style={{...font, fontSize: 36, color: '#fff', textShadow: `3px 3px 0 ${INK}`, whiteSpace: 'nowrap'}}>⚡ {fmt(r.ip)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
const Chapter: React.FC<{t: number}> = ({t}) => {
  if (X.D.splash) return null;
  const c = (X.D.chapters as any[]).filter(([t0]) => t >= t0 - 0.1 && t < t0 + 1.7).slice(-1)[0];
  if (!c) return null;
  const [t0, title] = c; const n = (X.D.chapters as any[]).indexOf(c) + 1;
  const nc = (X.D.cards as any[]).find((x) => (x.kind === 'alliance' || x.kind === 'remain') && x.t0 > t0 && x.t0 < t0 + 1.7);
  const e = nc ? nc.t0 : t0 + 1.7; if (t > e) return null;
  const sl = lerp(t, t0 - 0.1, t0 + 0.3, -1, 0, Easing.out(Easing.cubic)) + lerp(t, e - 0.35, e, 0, 1, Easing.in(Easing.cubic));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 150, zIndex: 35, display: 'flex', justifyContent: 'center', pointerEvents: 'none'}}>
      <div style={{transform: `translateX(${sl * 1500}px) skewX(-10deg)`, background: YELLOW, border: `6px solid ${INK}`, padding: '4px 44px 0', boxShadow: '0 8px 0 rgba(0,0,0,0.35)', textAlign: 'center'}}>
        <div style={{...font, fontSize: 28, color: INK, opacity: 0.7}}>CHAPTER {n}</div>
        <div style={{...font, fontSize: 70, color: INK, lineHeight: 1}}>{title}</div>
      </div>
    </div>
  );
};
// ---------- escenas nuevas: cumbre, objetivo fijado, apagón ----------
const CODEK: Record<string, number> = {}; COUNTRIES.forEach((c, i) => { CODEK[c.c] = i; });
const ownedAt = (t: number) => { const o = new Set<number>([X.ID]); for (const e of X.CEV as any[]) { if (e[0] > t) break; if (e[3] === X.ID) o.add(e[2]); } return o; };
const Summit: React.FC<{t: number}> = ({t}) => {
  const S_ = ((X.D.summits || []) as any[]).find((x) => t >= x.t0 && t < x.t1);
  if (!S_) return null;
  const a = Math.min(1, (t - S_.t0) / 0.35, (S_.t1 - t) / 0.35);
  const n = S_.ks.length; const cx = 960, cy = 600, rx = 560, ry = 250;
  const cur = (S_.lines as any[]).filter((l) => l[0] <= t).slice(-1)[0];
  const done = t >= S_.tr;
  return (
    <AbsoluteFill style={{zIndex: 47, opacity: a, background: 'radial-gradient(ellipse at 50% 55%, rgba(40,32,24,0.96) 0%, rgba(8,8,14,0.97) 75%)'}}>
      <div style={{position: 'absolute', top: 40, left: 0, right: 0, textAlign: 'center', ...font, fontSize: 64, color: '#fff', WebkitTextStroke: `7px ${INK}`, paintOrder: 'stroke fill'}}>⚠️ EMERGENCY SUMMIT</div>
      <div style={{position: 'absolute', left: cx - rx * 0.78, top: cy - ry * 0.62, width: rx * 1.56, height: ry * 1.24, borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 35%, #7a5232 0%, #4b2f1a 70%, #2a190d 100%)', border: `8px solid ${INK}`, boxShadow: '0 22px 0 rgba(0,0,0,0.45), inset 0 -18px 30px rgba(0,0,0,0.35)'}}>
        <div style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', fontSize: 110, opacity: done ? 1 : 0.35}}>{done ? '🤝' : '🗺️'}</div>
      </div>
      {(S_.ks as number[]).map((k, i) => {
        const an = Math.PI + (i / (n - 1)) * Math.PI * -1 + (n > 1 ? 0 : 0); const ang = -Math.PI * 0.95 + (i / Math.max(1, n - 1)) * Math.PI * 0.9 - Math.PI * 0.025;
        const x = cx + Math.cos(ang) * rx, y = cy + Math.sin(ang) * ry * 1.05 + (Math.sin(ang) > 0 ? 40 : -20);
        const talking = cur && cur[1] === i && !done; const sz = 170 * (talking ? 1.12 : 1);
        const pop = popT(t, S_.t0 + 0.1 + i * 0.08, 12);
        return (
          <div key={i} style={{position: 'absolute', left: x - sz / 2, top: y - sz / 2 + (talking ? Math.sin(t * 14) * 4 : 0), transform: `scale(${pop})`}}>
            <Ball k={k} size={sz} mood={done ? 'angry' : talking ? 'angry' : 'calm'} t={t} look={[(cx - x) / 600, (cy - y) / 400]} />
          </div>
        );
      })}
      {cur && !done && (() => { const i = cur[1]; const ang = -Math.PI * 0.95 + (i / Math.max(1, n - 1)) * Math.PI * 0.9 - Math.PI * 0.025;
        const x = cx + Math.cos(ang) * rx, y = cy + Math.sin(ang) * ry * 1.05 + (Math.sin(ang) > 0 ? 40 : -20);
        const bx = Math.max(260, Math.min(1660, x)), by = Math.max(150, y - 120);
        return <div style={{position: 'absolute', left: bx, top: by, zIndex: 5, transform: `translate(-50%,-100%) scale(${popT(t, cur[0], 14)})`, transformOrigin: '50% 100%', background: '#fff', border: `5px solid ${INK}`, borderRadius: 20, padding: '10px 24px 6px', ...font2, fontSize: 40, color: INK, whiteSpace: 'nowrap', boxShadow: '0 6px 0 rgba(0,0,0,0.35)'}}>
          <FlagImg k={S_.ks[i]} w={40} h={27} style={{display: 'inline-block', verticalAlign: 'middle', marginRight: 12}} />{cur[2]}
          <div style={{position: 'absolute', left: '50%', bottom: -16, width: 24, height: 24, background: '#fff', borderRight: `5px solid ${INK}`, borderBottom: `5px solid ${INK}`, transform: 'translateX(-50%) rotate(45deg)'}} /></div>; })()}
      {done && <div style={{position: 'absolute', left: 0, right: 0, bottom: 60, display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: `rotate(-4deg) scale(${popT(t, S_.tr, 9)})`, background: RED, border: `8px solid ${INK}`, borderRadius: 24, padding: '10px 40px 2px', ...font, fontSize: 84, color: '#fff', boxShadow: '0 10px 0 rgba(0,0,0,0.4)'}}>{S_.result}</div>
      </div>}
    </AbsoluteFill>
  );
};
const Network: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const N = (X.D as any).net; if (!N || t < N.t0 || t > N.t1) return null;
  const a = Math.min(1, (t - N.t0) / 0.4, (N.t1 - t) / 0.5);
  const P = (N.nodes as any[]).map(([x, y]) => toS(x, y, cam));
  const [ex, ey] = toS(N.src[0], N.src[1], cam);
  const emp = t >= N.tc - 0.9 ? Math.min(1, (t - N.tc + 0.9) / 1.4) : 0;
  const out: React.ReactNode[] = [];
  (N.links as number[][]).forEach(([i, j], li) => {
    const [x0, y0] = P[i], [x1, y1] = P[j]; const tcut = N.tc + li * 0.12; const cut = t >= tcut;
    const fl = cut ? Math.max(0, 1 - (t - tcut) / 0.7) : 1; if (fl <= 0.01) return;
    const flick = cut ? (Math.floor(t * 24 + li) % 2 ? 1 : 0.2) : 1;
    out.push(<line key={'l' + li} x1={x0} y1={y0} x2={x1} y2={y1} stroke={cut ? '#ff2b2b' : '#5ff3ff'} strokeWidth={cut ? 4 : 5} strokeDasharray={cut ? '10 14' : undefined} opacity={fl * flick * 0.9} style={{filter: `drop-shadow(0 0 8px ${cut ? '#ff2b2b' : '#5ff3ff'})`}} />);
    if (!cut) for (let q = 0; q < 3; q++) { const u = ((t * 0.9 + q / 3 + li * 0.17) % 1); out.push(<circle key={'p' + li + q} cx={x0 + (x1 - x0) * u} cy={y0 + (y1 - y0) * u} r={6} fill="#fff" />); }
  });
  (N.nodes as any[]).forEach(([x, y, label, kind], i) => {
    const [sx, sy] = P[i]; const dead = t >= N.tc + 0.3 + i * 0.1;
    out.push(<g key={'n' + i} transform={`translate(${sx},${sy})`}>
      <circle r={kind === 'hq' ? 22 : 14} fill={dead ? '#3a0d0d' : '#0d2a3a'} stroke={dead ? '#ff2b2b' : '#5ff3ff'} strokeWidth={4} />
      {!dead && <circle r={(kind === 'hq' ? 22 : 14) + ((t * 40) % 30)} fill="none" stroke="#5ff3ff" strokeWidth={2} opacity={1 - ((t * 40) % 30) / 30} />}
      {dead && <text y={-26} textAnchor="middle" style={{...font, fontSize: 24}} fill="#ff4d4d" stroke={INK} strokeWidth={5} paintOrder="stroke" opacity={Math.floor(t * 6 + i) % 2 ? 1 : 0.6}>NO SIGNAL</text>}
      {!dead && label && <text y={-26} textAnchor="middle" style={{...font, fontSize: 22}} fill="#9ff8ff" stroke={INK} strokeWidth={5} paintOrder="stroke">{label}</text>}
    </g>);
  });
  if (emp > 0) out.push(<circle key="emp" cx={ex} cy={ey} r={emp * 2400} fill="none" stroke="#ffffff" strokeWidth={30 * (1 - emp) + 4} opacity={0.8 * (1 - emp)} />);
  return <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0, zIndex: 18, opacity: a, overflow: 'visible'}}>
    <rect x={0} y={0} width={VW} height={VH} fill={`rgba(0,10,20,${0.35})`} />{out}</svg>;
};
const Targets: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const out: React.ReactNode[] = [];
  for (const [t0, t1, x, y, label] of ((X.D.targets || []) as any[])) {
    if (t < t0 || t > t1) continue;
    const [sx, sy] = toS(x, y, cam); const u = Math.min(1, (t - t0) / 0.45); const R0 = 150 - 80 * u; const a = Math.min(1, (t1 - t) / 0.25);
    const blink = Math.floor(t * 8) % 2 === 0;
    out.push(<g key={t0 + '' + x} opacity={a} transform={`translate(${sx},${sy}) rotate(${(1 - u) * 90})`}>
      <circle r={R0} fill="none" stroke="#ff2b2b" strokeWidth={5} strokeDasharray="14 10" />
      <circle r={R0 * 0.35} fill="none" stroke="#ff2b2b" strokeWidth={4} />
      {[0, 1, 2, 3].map((q) => <line key={q} x1={0} y1={R0 + 4} x2={0} y2={R0 + 30} stroke="#ff2b2b" strokeWidth={6} transform={`rotate(${q * 90})`} />)}
    </g>);
    out.push(<text key={'l' + t0 + x} x={sx} y={sy + 120} textAnchor="middle" opacity={a * (blink ? 1 : 0.55)} style={{...font, fontSize: 34}} fill="#ff4d4d" stroke={INK} strokeWidth={6} paintOrder="stroke">{u >= 1 ? label : 'LOCKING...'}</text>);
  }
  return out.length ? <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0, zIndex: 18, overflow: 'visible'}}>{out}</svg> : null;
};
const Glitch: React.FC<{t: number}> = ({t}) => {
  const g = ((X.D.glitch || []) as any[]).find(([a, b]) => t >= a && t <= b); if (!g) return null;
  const f = Math.floor(t * 30); const rnd = (i: number) => { const v = Math.sin((f * 13 + i) * 91.7) * 43758.5; return v - Math.floor(v); };
  const k = Math.min(1, (t - g[0]) / 0.2, (g[1] - t) / 0.4);
  return (
    <AbsoluteFill style={{zIndex: 58, pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: `rgba(0,0,0,${0.45 * k})`}} />
      {Array.from({length: 14}).map((_, i) => <div key={i} style={{position: 'absolute', left: (rnd(i) - 0.5) * 120, top: rnd(i + 50) * VH, width: VW, height: 6 + rnd(i + 99) * 40, background: i % 3 === 0 ? 'rgba(0,255,255,0.35)' : i % 3 === 1 ? 'rgba(255,0,200,0.32)' : 'rgba(255,255,255,0.25)', mixBlendMode: 'screen', opacity: k}} />)}
      <div style={{position: 'absolute', top: '42%', left: 0, right: 0, textAlign: 'center', ...font, fontSize: 110, color: '#ff2b2b', WebkitTextStroke: `8px ${INK}`, paintOrder: 'stroke fill', transform: `translateX(${(rnd(7) - 0.5) * 30}px)`, opacity: k * (rnd(3) > 0.15 ? 1 : 0.2), textShadow: '6px 0 0 rgba(0,255,255,0.7), -6px 0 0 rgba(255,0,200,0.7)'}}>ENEMY SYSTEMS OFFLINE</div>
    </AbsoluteFill>
  );
};
const Cards: React.FC<{t: number}> = ({t}) => {
  const c = (X.D.cards as any[]).find((x) => t >= x.t0 && t < x.t1);
  if (!c) return null;
  const a = popT(t, c.t0, 10) * lerp(t, c.t1 - 0.3, c.t1, 1, 0);
  if (c.kind === 'intro') {
    return (
      <div style={{position: 'absolute', right: 110, top: 250, zIndex: 40, transform: `translateX(${(1 - a) * 900}px)`, display: 'flex', alignItems: 'center', gap: 26}}>
        <Ball k={X.ID} size={240} mood="smug" t={t} />
        <div style={{background: CREAM, border: `7px solid ${INK}`, borderRadius: 26, padding: '18px 30px 14px', boxShadow: '0 10px 0 rgba(0,0,0,0.35)'}}>
          <div style={{...font, fontSize: 84, color: RED, lineHeight: 1}}>{X.D.hero ? 'UNITED STATES' : 'INDONESIA'}</div>
          <div style={{...font2, fontSize: 34, color: INK}}>{X.D.hero ? '👥 340 million people' : '👥 280 million people'}</div>
          <div style={{...font2, fontSize: 34, color: INK}}>{X.D.hero ? '💪 The strongest army on Earth' : '🏝️ 17,000 islands'}</div>
          <div style={{...font2, fontSize: 34, color: INK}}>🎯 Goal: the entire world</div>
        </div>
      </div>
    );
  }
  if (c.kind === 'declare') {
    const dt = t - c.t0; const sc = dt < 0.2 ? 2.6 - (dt / 0.2) * 1.6 : 1 + 0.03 * Math.sin(dt * 9);
    return (
      <AbsoluteFill style={{zIndex: 44, background: `radial-gradient(circle, rgba(120,0,0,${0.55 * a}) 0%, rgba(0,0,0,${0.75 * a}) 80%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18}}>
        <div style={{transform: `scale(${popT(t, c.t0, 9)})`}}><Ball k={X.ID} size={210} mood="angry" t={t} /></div>
        <div style={{transform: `scale(${sc}) rotate(-3deg)`, opacity: Math.min(1, a * 1.3), textAlign: 'center'}}>
          <div style={{...font, fontSize: 88, color: '#fff', textShadow: `6px 6px 0 ${INK}`, lineHeight: 1}}>{X.D.hero || 'INDONESIA'} DECLARES WAR</div>
          <div style={{...font, fontSize: 132, color: RED, WebkitTextStroke: `8px ${INK}`, paintOrder: 'stroke fill', lineHeight: 1.05}}>ON THE WORLD</div>
        </div>
      </AbsoluteFill>
    );
  }
  if (c.kind === 'stamp') {
    const dt = t - c.t0; const sc = dt < 0.18 ? 2.2 - (dt / 0.18) * 1.2 : 1;
    return (
      <div style={{position: 'absolute', inset: 0, zIndex: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'}}>
        <div style={{transform: `rotate(-5deg) scale(${sc})`, opacity: lerp(t, c.t1 - 0.3, c.t1, 1, 0), display: 'flex', alignItems: 'center', gap: 22, background: 'rgba(255,248,235,0.97)', border: `10px solid ${RED}`, borderRadius: 20, padding: '16px 44px 8px', boxShadow: '0 12px 0 rgba(0,0,0,0.35)'}}>
          <FlagImg k={c.k} w={110} round />
          <span style={{...font, fontSize: 92, color: RED}}>{c.text}</span>
        </div>
      </div>
    );
  }
  if (c.kind === 'bigtext') {
    const dt = t - c.t0; const sc = dt < 0.22 ? 1.9 - (dt / 0.22) * 0.9 : 1 + (dt - 0.22) * 0.02;
    return (
      <AbsoluteFill style={{zIndex: 44, background: `radial-gradient(circle, rgba(0,0,0,${0.25 * a}) 0%, rgba(0,0,0,${0.7 * a}) 85%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, pointerEvents: 'none'}}>
        <div style={{transform: `scale(${sc})`, opacity: Math.min(1, a * 1.3), ...font, fontSize: 130, color: '#fff', WebkitTextStroke: `9px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 8px 0 ${INK}`, lineHeight: 1, textAlign: 'center'}}>{c.text}</div>
        {c.sub && <div style={{opacity: Math.min(1, Math.max(0, (dt - 0.3) * 3)) * a, ...font, fontSize: 52, color: YELLOW, WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill', textAlign: 'center'}}>{c.sub}</div>}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{zIndex: 42, background: `rgba(6,10,22,${0.55 * a})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30}}>
      <div style={{transform: `scale(${a})`, ...font, fontSize: 100, color: YELLOW, textShadow: `7px 7px 0 ${INK}`}}>{c.text}</div>
      <div style={{display: 'flex', flexDirection: 'row', gap: 26}}>
        {(c.ks as number[]).map((k, i) => (
          <div key={k} style={{transform: `scale(${popT(t, c.t0 + 0.2 + i * 0.1, 10)})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
            <Ball k={k} size={170} mood={c.kind === 'remain' ? 'scared' : 'angry'} t={t} />
            <div style={{...font, fontSize: 38, color: '#fff', textShadow: `4px 4px 0 ${INK}`}}>{UP(k)}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
const Wheel: React.FC<{items: string[]; rot: number; R: number; cx: number; cy: number; fs?: number}> = ({items, rot, R, cx, cy, fs = 34}) => {
  const n = items.length, seg = 360 / n; const cols = ['#e5322d', '#1f6fe0', '#22a95b', '#ffd23f', '#ff8a1f', '#7b2cbf', '#13b5c8', '#ff5fa2'];
  return (
    <g transform={`translate(${cx},${cy})`}>
      <circle r={R + 18} fill={INK} />
      <g transform={`rotate(${rot})`}>
        {items.map((it, i) => {
          const a0 = ((i * seg - 90) * Math.PI) / 180, a1 = (((i + 1) * seg - 90) * Math.PI) / 180, am = (a0 + a1) / 2;
          return (
            <g key={i}>
              <path d={`M0,0 L${Math.cos(a0) * R},${Math.sin(a0) * R} A${R},${R} 0 0,1 ${Math.cos(a1) * R},${Math.sin(a1) * R} Z`} fill={cols[i % 8]} stroke={INK} strokeWidth={5} />
              <g transform={`translate(${Math.cos(am) * R * 0.64},${Math.sin(am) * R * 0.64}) rotate(${(am * 180) / Math.PI + 90})`}>
                <text textAnchor="middle" y={12} fontSize={fs} style={{fontFamily: 'Lilita'}} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">{it}</text>
              </g>
            </g>
          );
        })}
      </g>
      <circle r={50} fill={CREAM} stroke={INK} strokeWidth={7} />
      <path d={`M-26,${-R - 44} L26,${-R - 44} L0,${-R + 8} Z`} fill={RED} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    </g>
  );
};
const Roulettes: React.FC<{t: number}> = ({t}) => {
  const rs = X.D.roulettes as any[];
  if (!rs.length) return null;
  if (t < rs[0].t0 - 0.2 || t > rs[rs.length - 1].t1 + 0.3) return null;
  const r = rs.find((x) => t >= x.t0 && t < x.t1 + 0.05) || rs[rs.length - 1];
  const n = r.items.length, seg = 360 / n;
  const spinEnd = r.t0 + (r.t1 - r.t0) * 0.6;
  const total = 360 * 4 + (360 - (r.pick * seg + seg / 2));
  const rot = total * lerp(t, r.t0 + 0.1, spinEnd, 0, 1, Easing.out(Easing.cubic));
  const all = lerp(t, rs[0].t0 - 0.2, rs[0].t0 + 0.3, 0, 1) * lerp(t, rs[rs.length - 1].t1 - 0.2, rs[rs.length - 1].t1 + 0.3, 1, 0);
  const done = t > spinEnd; const idx = rs.indexOf(r);
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 40, background: `rgba(6,10,22,${0.5 * all})`, opacity: all}}>
      <div style={{position: 'absolute', left: 140, top: 60, width: 640, textAlign: 'center', ...font, fontSize: 70, color: YELLOW, textShadow: `5px 5px 0 ${INK}`}}>{r.title}</div>
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}><Wheel items={r.items} rot={rot} R={250} cx={460} cy={560} /></svg>
      {done && <div style={{position: 'absolute', left: 120, width: 680, bottom: 90, display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: `scale(${popT(t, spinEnd, 9)})`, background: YELLOW, border: `6px solid ${INK}`, borderRadius: 20, padding: '8px 26px 4px', ...font, fontSize: idx === 4 ? 36 : 50, color: INK, textAlign: 'center'}}>{r.result}</div>
      </div>}
      <div style={{position: 'absolute', right: 120, top: 150, width: 760, background: CREAM, border: `7px solid ${INK}`, borderRadius: 28, padding: '20px 30px', boxShadow: '0 12px 0 rgba(0,0,0,0.4)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 12}}><FlagImg k={X.ID} w={90} h={62} /><div style={{...font, fontSize: 56, color: INK}}>{X.D.heroAdj || 'INDONESIAN'} ARMY</div></div>
        {(X.D.army as string[][]).map(([ic, txt], i) => {
          const te = rs[i].t0 + (rs[i].t1 - rs[i].t0) * 0.6; const shown = t > te; const k = shown ? popT(t, te, 12) : 0;
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: `4px solid ${INK}`, borderRadius: 14, padding: '6px 16px 2px', marginTop: 10, opacity: shown ? 1 : 0.35}}>
              <span style={{fontSize: 40}}>{ic}</span>
              <span style={{...font, fontSize: 44, color: INK, transform: `scale(${0.8 + 0.2 * k})`, transformOrigin: 'left center'}}>{shown ? txt : '...'}</span>
            </div>
          );
        })}
        <div style={{...font, fontSize: 48, color: RED, marginTop: 14, textAlign: 'center'}}>⚡ POWER: {fmt(kfv(X.D.indo, t))}</div>
      </div>
    </div>
  );
};
// poder especial: candado -> ruleta que vuelve a girar -> láser
const POWERS0 = ['TSUNAMI', 'EMP', 'LASER', 'CLONES', 'MIND', 'QUAKE', 'FREEZE', 'NUKE'];
const POWERSU = ['TSUNAMI', 'EMP', 'BLACKOUT', 'CLONES', 'LASER', 'QUAKE', 'FREEZE', 'DRONES'];
const Reveal: React.FC<{t: number}> = ({t}) => {
  const r = X.D.reveal; if (t < r.t0 || t > r.t1) return null;
  const tl = r.t0 + 1.0, ts = tl + 0.2, te = ts + 1.8;
  const a = lerp(t, r.t0, r.t0 + 0.3, 0, 1) * lerp(t, r.t1 - 0.4, r.t1, 1, 0);
  const pick = 2, seg = 45; const total = 360 * 3 + (360 - (pick * seg + seg / 2));
  const rot = total * lerp(t, ts, te, 0, 1, Easing.out(Easing.cubic));
  return (
    <AbsoluteFill style={{zIndex: 46, background: `rgba(0,0,0,${0.62 * a})`, opacity: a}}>
      <div style={{position: 'absolute', top: 70, left: 0, right: 0, textAlign: 'center', ...font, fontSize: 64, color: '#fff', textShadow: `5px 5px 0 ${INK}`}}>{t < te ? 'TIME TO USE THE SPECIAL POWER...' : 'SPECIAL POWER UNLOCKED!'}</div>
      {t < tl && <div style={{position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', justifyContent: 'center'}}><span style={{fontSize: 230, transform: `translateX(${Math.sin(t * 60) * lerp(t, r.t0, tl, 2, 20)}px) scale(${1 + lerp(t, tl - 0.15, tl, 0, 0.6)})`, opacity: lerp(t, tl - 0.1, tl, 1, 0)}}>🔒</span></div>}
      {t >= tl && t < te + 0.25 && <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, transform: `scale(${popT(t, tl, 11)})`, transformOrigin: '960px 580px'}}><Wheel items={r.items || (X.D.hero ? POWERSU : POWERS0)} rot={rot} R={300} cx={960} cy={590} fs={30} /></svg>}
      {t >= te && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', justifyContent: 'center'}}>
          <div style={{transform: `scale(${popT(t, te, 9)})`, width: 900, height: 330, background: 'linear-gradient(135deg,#ff2b4a,#7b0d1e)', border: `10px solid ${YELLOW}`, borderRadius: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30, boxShadow: '0 0 80px #ff2b4a'}}>
            <div style={{width: 200, height: 200, borderRadius: '50%', background: '#1d2a44', border: `8px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Img src={staticFile(`hw/icons/${r.icon}.svg`)} style={{width: 140, height: 140}} /></div>
            <div style={{...font, fontSize: 84, color: '#fff', textShadow: `6px 6px 0 ${INK}`, lineHeight: 1, width: 520}}>{r.name}</div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
const Subscribe: React.FC<{t: number}> = ({t}) => {
  const s0 = (X.D.subs as number[]).find((x) => t >= x && t < x + 4.2);
  if (s0 === undefined) return null;
  const dt = t - s0; const k = popT(t, s0, 12) * lerp(dt, 3.8, 4.2, 1, 0);
  const c1 = dt > 1.45, c2 = dt > 2.75;
  return (
    <div style={{position: 'absolute', right: 40, bottom: 110, zIndex: 50, transform: `translateY(${(1 - k) * 360}px)`}}>
      <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 16, background: '#fff', border: `5px solid ${INK}`, borderRadius: 60, padding: '12px 18px', boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>
        <div style={{width: 70, height: 70, borderRadius: '50%', background: '#1d56c9', border: `4px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38}}>🌍</div>
        <div style={{...font, fontSize: 32, color: INK}}>ATLAS OF WAR</div>
        <div style={{background: c1 ? '#5a5a5a' : '#e5322d', borderRadius: 40, padding: '10px 24px 6px', ...font, fontSize: 34, color: '#fff'}}>{c1 ? 'SUBSCRIBED ✓' : 'SUBSCRIBE'}</div>
        <div style={{width: 60, height: 60, borderRadius: '50%', background: c2 ? '#1d56c9' : '#ddd', border: `4px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32}}>👍</div>
        {dt > 0.3 && <div style={{position: 'absolute', left: dt < 1.8 ? lerp(dt, 0.4, 1.3, 520, 300) : lerp(dt, 1.8, 2.6, 300, 450), top: lerp(dt, 0.4, 1.3, 140, 50), fontSize: 60}}>👆</div>}
      </div>
    </div>
  );
};
const ColdText: React.FC<{t: number}> = ({t}) => {
  const c = (X.D.cold as any[]).find(([a, b]) => t >= a && t < b);
  if (!c) return null;
  const a = popT(t, c[0], 9) * lerp(t, c[1] - 0.2, c[1], 1, 0);
  return <div style={{position: 'absolute', inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 100%)'}}>
    <div style={{transform: `scale(${0.6 + 0.4 * a}) rotate(${(1 - a) * -4}deg)`, opacity: Math.min(1, a * 1.4), ...font, fontSize: 140, color: '#fff', textShadow: `8px 8px 0 ${INK}`, textAlign: 'center', lineHeight: 1}}>{c[2]}</div></div>;
};
const Title: React.FC<{t: number}> = ({t}) => {
  const g = X.D.globe; if (t < g.t0 || t > g.t1) return null;
  const a = popT(t, g.t0 + 0.6, 11) * lerp(t, g.t1 - 1.8, g.t1 - 1.2, 1, 0);
  return <div style={{position: 'absolute', top: 50, left: 0, right: 0, textAlign: 'center', zIndex: 30, transform: `scale(${0.7 + 0.3 * a})`, opacity: a}}>
    <div style={{...font, fontSize: 100, color: '#fff', textShadow: `6px 6px 0 ${INK}`, lineHeight: 1}}>{X.D.title2 ? X.D.title2[0] : 'CAN INDONESIA'}</div>
    <div style={{...font, fontSize: 132, color: YELLOW, textShadow: `7px 7px 0 ${INK}`, lineHeight: 1.05}}>{X.D.title2 ? X.D.title2[1] : 'CONQUER THE WORLD?'}</div></div>;
};
const Ending: React.FC<{t: number}> = ({t}) => {
  const t0 = X.D.winT; if (t < t0) return null;
  const a = popT(t, t0, 10);
  const V2 = X.D.ver !== 'a';
  const pk = X.D.indo as number[][]; const pmax = pk[pk.length - 1][1]; const tA = X.D.war_t, tB = X.D.winT;
  const line = pk.filter((p) => p[0] >= tA - 1).map((p) => `${((p[0] - tA) / (tB - tA)) * 360},${90 - (p[1] / pmax) * 86}`).join(' ');
  const drawn = lerp(t, t0 + 1.0, t0 + 3.5, 0, 1);
  return (
    <AbsoluteFill style={{zIndex: 45, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(circle, rgba(255,210,63,${0.18 * a}) 0%, rgba(0,0,0,${0.45 * a}) 75%)`}}>
      {V2 && Array.from({length: 26}, (_, i) => { const k = (i * 37 + 11) % NK; const x = ((i * 173) % 1920); const sp = 160 + (i * 53) % 140; const y = -120 + ((t - t0) * sp + i * 97) % 1300; return <div key={i} style={{position: 'absolute', left: x, top: y, transform: `rotate(${Math.sin(t * 2 + i) * 30}deg)`, opacity: 0.85}}><FlagImg k={k === X.ID ? 1 : k} w={54} h={36} /></div>; })}
      {V2 && !X.D.mode && <div style={{position: 'absolute', left: 60, bottom: 60, background: 'rgba(10,14,24,0.85)', border: `4px solid ${INK}`, borderRadius: 16, padding: '10px 16px', opacity: popT(t, t0 + 0.8, 12)}}>
        <div style={{...font, fontSize: 26, color: YELLOW}}>⚡ POWER OVER THE CAMPAIGN</div>
        <svg width={360} height={96}><polyline points={line} fill="none" stroke="#ff5a5a" strokeWidth={5} strokeLinejoin="round" strokeDasharray={2000} strokeDashoffset={2000 * (1 - drawn)} /></svg>
      </div>}
      <div style={{transform: `scale(${a})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        {X.D.endKs ? <div style={{display: 'flex', gap: 26, filter: 'grayscale(0.5)'}}>{(X.D.endKs as number[]).map((k, i) => <Ball key={k} k={k} size={170} mood="sad" t={t + i} />)}</div> : <><div style={{fontSize: 120, marginBottom: -28}}>👑</div>
        <Ball k={X.ID} size={260} mood="happy" t={t} /></>}
        <div style={{...font, fontSize: 100, color: YELLOW, textShadow: `8px 8px 0 ${INK}`, marginTop: 10, textAlign: 'center', lineHeight: 1}}>{X.D.endTitle ? <>{X.D.endTitle[0]}<br /><span style={{fontSize: 70}}>{X.D.endTitle[1]}</span></> : <>{X.D.heroLong || 'INDONESIA'} CONQUERED<br />THE WORLD</>}</div>
        <div style={{display: 'flex', flexDirection: 'row', gap: 20, marginTop: 18, opacity: popT(t, t0 + 0.8, 12)}}>
          {(X.D.endPills || [['🌍', `${X.D.total}/${X.D.total} COUNTRIES`], ['📅', `${Math.round(kfv(X.D.days, t0))} DAYS`], [X.D.hero ? '💻' : '🛰️', X.D.weapon || 'ORBITAL LASER']]).map(([i, s]) => <Pill key={s} bg={CREAM} style={{padding: '6px 20px 2px', ...font, fontSize: 36, color: INK}}>{i} {s}</Pill>)}
        </div>
        <div style={{...font, fontSize: 52, color: '#fff', textShadow: `4px 4px 0 ${INK}`, marginTop: 24, opacity: popT(t, t0 + 2.2, 12)}}>{X.D.endAsk || 'WHICH COUNTRY SHOULD TRY NEXT? 👇'}</div>
      </div>
    </AbsoluteFill>
  );
};
// ventanas [t0,t1,(valor)] -> valor suavizado (1 por defecto)
const win = (arr: any[] | undefined, t: number) => {
  for (const w of arr || []) { if (t >= w[0] && t <= w[1]) { const e = Math.min(1, (t - w[0]) / 0.6, (w[1] - t) / 0.6); return (w[2] ?? 1) * Math.max(0, e); } }
  return 0;
};
const punch = (t: number) => { let a = 0; for (const [st, amp] of X.D.shakes as number[][]) { const d = t - st; if (d >= 0 && d < 0.5 && amp >= 12) a = Math.max(a, 0.035 * (1 - d / 0.5)); } return a; };
// franjas de cine, viñeta roja en golpes fuertes, líneas de velocidad en las rachas
const Cinema: React.FC<{t: number}> = ({t}) => {
  const lb = win(X.D.letterbox, t);
  let red = 0; for (const [st, amp] of X.D.shakes as number[][]) { const d = t - st; if (d >= 0 && d < 0.7 && amp >= 18) red = Math.max(red, 1 - d / 0.7); }
  const sk = (X.D.streak as number[][]).find(([a, b]) => t >= a && t <= b);
  return (
    <>
      {red > 0 && <AbsoluteFill style={{zIndex: 16, pointerEvents: 'none', background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(200,10,20,0.55) 100%)', opacity: red}} />}
      {sk && (
        <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0, zIndex: 16, opacity: 0.18}}>
          {Array.from({length: 26}, (_, i) => { const an = (i / 26) * Math.PI * 2 + i * 0.3; const ph = ((t * 3 + i * 0.37) % 1); const r0 = 620 + ph * 300; return <line key={i} x1={VW / 2 + Math.cos(an) * r0} y1={VH / 2 + Math.sin(an) * r0} x2={VW / 2 + Math.cos(an) * (r0 + 180)} y2={VH / 2 + Math.sin(an) * (r0 + 180)} stroke="#fff" strokeWidth={4} strokeLinecap="round" />; })}
        </svg>
      )}
      {lb > 0 && <>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 95 * lb, background: '#000', zIndex: 33}} />
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 95 * lb, background: '#000', zIndex: 33}} />
      </>}
    </>
  );
};
const markersFor = (b: any) => {
  if (!X.MKB.has(b)) { const set = new Set<number>([b.b, ...(b.title === 'WESTERN ALLIANCE' ? X.ALLY : [])]); X.MKB.set(b, (X.D.markers as any[]).filter((m) => set.has(m[1]))); }
  return X.MKB.get(b)!;
};

// ---------- foco: oscurece todo e ilumina una unidad ----------
const Spot: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const sp = ((X.D as any).spot as any[] || []).find((x) => t >= x.t0 && t <= x.t1 + 0.5);
  if (!sp) return null;
  const a = Math.min(1, (t - sp.t0) / 0.35, (sp.t1 + 0.5 - t) / 0.5);
  const P = sp.pts as number[][]; let i = 0; while (i < P.length - 2 && P[i + 1][0] < t) i++;
  const u = Math.max(0, Math.min(1, (t - P[i][0]) / Math.max(0.01, P[i + 1][0] - P[i][0])));
  const x = P[i][1] + (P[i + 1][1] - P[i][1]) * u, y = P[i][2] + (P[i + 1][2] - P[i][2]) * u;
  const [sx, sy] = toS(x, y, cam); const R = sp.r * (1 + 0.04 * Math.sin(t * 6));
  const pop = popT(t, sp.t0 + 0.15, 10);
  return (
    <AbsoluteFill style={{zIndex: 16, pointerEvents: 'none', opacity: a}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at ${sx}px ${sy}px, rgba(0,0,0,0) ${R * 0.75}px, rgba(4,6,14,0.72) ${R * 1.7}px)`}} />
      <div style={{position: 'absolute', left: sx - R * 0.8, top: sy - R * 0.8, width: R * 1.6, height: R * 1.6, borderRadius: '50%', border: '4px solid rgba(255,227,107,0.9)', boxShadow: '0 0 30px 6px rgba(255,227,107,0.45)', transform: `scale(${0.6 + 0.4 * pop})`}} />
      <div style={{position: 'absolute', left: sx, top: sy - R * 0.8 - 70, transform: `translateX(-50%) scale(${pop})`, ...font, fontSize: 44, color: YELLOW, WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill', whiteSpace: 'nowrap'}}>{sp.label}</div>
    </AbsoluteFill>
  );
};
// ---------- barra de vida gigante (final) ----------
const BigHP: React.FC<{t: number}> = ({t}) => {
  const BB = (X.D as any).bighp; const B = Array.isArray(BB) ? BB.find((x: any) => t >= x.t0 && t <= x.t1) : BB; if (!B || t < B.t0 || t > B.t1) return null;
  const a = popT(t, B.t0, 11) * lerp(t, B.t1 - 0.4, B.t1, 1, 0);
  const hp = Math.max(0, Math.min(1, kfv(B.hp, t))); const hp2 = Math.max(0, Math.min(1, kfv(B.hp, t - 0.45)));
  const hit = hp < kfv(B.hp, t - 0.12) - 0.004; const up = hp > kfv(B.hp, t - 0.3) + 0.004;
  const low = hp < 0.25; const blink = low && Math.floor(t * 4) % 2 === 0;
  const col = hp > 0.5 ? '#3bd16f' : hp > 0.25 ? '#ffc23a' : '#ff3b30';
  const jx = hit ? Math.sin(t * 90) * 7 : 0;
  const W = 940;
  return (
    <div style={{position: 'absolute', top: SHORT ? 430 : 150, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 37, opacity: a}}>
      <div style={{transform: `translate(${jx}px, ${(1 - a) * -120}px)`, width: W, background: 'rgba(10,12,20,0.9)', border: `5px solid ${blink ? '#ff3b30' : INK}`, borderRadius: 20, padding: '10px 18px 14px', boxShadow: low ? '0 0 40px 8px rgba(255,40,40,0.55)' : '0 8px 0 rgba(0,0,0,0.4)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8}}>
          <FlagImg k={B.k} w={60} h={40} />
          <span style={{...font, fontSize: 38, color: '#fff', flex: 1, whiteSpace: 'nowrap'}}>⭐ {B.name}</span>
          <span style={{...font, fontSize: 44, color: up ? '#3bd16f' : col, transform: `scale(${hit ? 1.15 : 1})`}}>{Math.round(hp * 100)}% {up ? '▲' : ''}</span>
        </div>
        <div style={{position: 'relative', height: 42, background: '#2a2a2e', border: `4px solid #fff`, borderRadius: 10, overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.max(hp, hp2) * 100}%`, background: up ? '#bfffd2' : '#fff', opacity: 0.85}} />
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${hp * 100}%`, background: col}} />
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((q) => <div key={q} style={{position: 'absolute', left: `${q * 10}%`, top: 0, bottom: 0, width: 3, background: 'rgba(0,0,0,0.35)'}} />)}
        </div>
        {B.sub && <div style={{...font, fontSize: 26, color: low ? '#ff8a8a' : '#cfd6e6', textAlign: 'center', marginTop: 6}}>{low ? '⚠ CAPITAL ABOUT TO FALL ⚠' : B.sub}</div>}
      </div>
    </div>
  );
};
// capa de los shorts: gancho al principio y llamada al vídeo largo al final
const ShortLayer: React.FC<{t: number; off: number; dur: number; hook: string[]; cta: string[]}> = ({t, off, dur, hook, cta}) => {
  const lt = t - off;
  const h = lerp(lt, 0, 0.3, 0, 1) * lerp(lt, 2.4, 2.8, 1, 0);
  const c = lt > dur - 3.4 ? popT(lt, dur - 3.4, 10) : 0;
  return (
    <>
      {h > 0.01 && <div style={{position: 'absolute', top: 1240, left: 30, right: 30, textAlign: 'center', zIndex: 70, transform: `scale(${0.7 + 0.3 * h})`, opacity: h}}>
        <div style={{...font, fontSize: 92, lineHeight: 1, color: '#fff', WebkitTextStroke: `9px ${INK}`, paintOrder: 'stroke fill'}}>{hook[0]}</div>
        <div style={{...font, fontSize: 104, lineHeight: 1.05, color: YELLOW, WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill'}}>{hook[1]}</div>
      </div>}
      {c > 0.01 && <AbsoluteFill style={{zIndex: 72, background: `rgba(0,0,0,${0.55 * Math.min(1, c)})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30}}>
        <div style={{transform: `scale(${c})`, textAlign: 'center', padding: '0 40px'}}>
          <div style={{...font, fontSize: 96, lineHeight: 1, color: '#fff', WebkitTextStroke: `9px ${INK}`, paintOrder: 'stroke fill'}}>{cta[0]}</div>
          <div style={{...font, fontSize: 96, lineHeight: 1.05, color: YELLOW, WebkitTextStroke: `9px ${INK}`, paintOrder: 'stroke fill'}}>{cta[1]}</div>
        </div>
        <div style={{transform: `scale(${popT(lt, dur - 2.8, 10)})`, background: RED, border: `7px solid ${INK}`, borderRadius: 30, padding: '20px 40px 10px', ...font, fontSize: 64, color: '#fff', boxShadow: '0 10px 0 rgba(0,0,0,0.4)'}}>▶ FULL VIDEO ON MY CHANNEL</div>
      </AbsoluteFill>}
    </>
  );
};

// ======== BATTLE ROYALE (LatAm) ========
const TIERC: Record<string, string> = {S: '#ff3b3b', A: '#ff9a2e', B: '#ffd23f', C: '#6fdc6f', D: '#5aa7ff'};
const SNAME = (k: number) => UP(k).replace('DOMINICAN REPUBLIC', 'DOMINICAN REP.').replace('UNITED STATES OF AMERICA', 'USA');
const empCounts = (t: number, parts: number[]) => {
  const st = pst(t); const cnt = new Map<number, number>();
  for (let k = 0; k < NK; k++) { const o = st.owner[k]; if (parts.includes(o)) cnt.set(o, (cnt.get(o) || 0) + 1); }
  const pw = (X.D.pw0 || {}) as any; return [...cnt.entries()].sort((a, b) => b[1] - a[1] || (pw[b[0]] || 0) - (pw[a[0]] || 0));
};
const aliveAt = (t: number) => kfvStep(X.D.alive, t);
const kfvStep = (pk: number[][], t: number) => { let v = pk[0][1]; for (const p of pk) { if (p[0] <= t) v = p[1]; else break; } return v; };
const HudBR: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const D = X.D;
  const show = lerp(t, D.war_t - 0.5, D.war_t + 0.3, 0, 1) * lerp(t, D.winT - 0.3, D.winT + 0.3, 1, 0);
  if (show <= 0.01) return null;
  const n = aliveAt(t); const lastE = (D.elim as any[]).filter((e) => e[0] <= t).slice(-1)[0];
  const bump = lastE && t - lastE[0] < 0.4 ? 0.25 * (1 - (t - lastE[0]) / 0.4) : 0;
  const top = empCounts(t, D.parts).slice(0, 4);
  const ch = (D.chapters as any[]).filter((c) => c[0] <= t).slice(-1)[0];
  const day = Math.round(kfv(D.days, t));
  return (
    <>
      <div style={{position: 'absolute', top: 20, left: 20 + (1 - show) * -600, zIndex: 20}}>
        <Pill bg="#1b1f2b" style={{padding: '4px 18px 0', display: 'flex', alignItems: 'baseline', gap: 10, border: `4px solid ${RED}`, transform: `scale(${1 + bump})`, transformOrigin: 'left center'}}>
          <span style={{...font, fontSize: 26, color: '#ff9a8f'}}>👥 ALIVE</span><span style={{...font, fontSize: 52, color: '#fff'}}>{n}</span><span style={{...font, fontSize: 26, color: '#9aa'}}>/ {D.parts.length}</span>
        </Pill>
        <div style={{marginTop: 8, display: 'flex', flexDirection: 'column', gap: 5}}>
          {top.map(([k, c], i) => (
            <div key={k} style={{display: 'flex', alignItems: 'center', gap: 8, background: i === 0 ? 'rgba(255,210,63,0.92)' : 'rgba(250,244,230,0.92)', border: `3px solid ${INK}`, borderRadius: 12, padding: '2px 10px 0 4px', width: 250}}>
              <span style={{...font, fontSize: 22, color: INK, width: 22}}>{i + 1}</span><FlagImg k={k} w={34} round /><span style={{...font, fontSize: 20, color: INK, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden'}}>{SNAME(k)}</span><span style={{...font, fontSize: 22, color: RED}}>{c}</span>
            </div>))}
        </div>
      </div>
      <div style={{position: 'absolute', top: 18, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20, transform: `translateY(${(1 - show) * -120}px)`}}>
        <Pill bg="#1b1f2b" style={{padding: '4px 22px 0', ...font, fontSize: 40, color: YELLOW, border: `4px solid ${RED}`}}>📅 DAY {day}</Pill>
      </div>
      {ch && <div style={{position: 'absolute', top: 20, right: 20 + (1 - show) * -600, zIndex: 20}}><Pill bg={YELLOW} style={{padding: '4px 16px 0', ...font, fontSize: 26, color: INK}}>ROUND {(D.chapters as any[]).indexOf(ch) + 1} · {ch[1]}</Pill></div>}
      <div style={{position: 'absolute', left: 20 + (1 - show) * -500, bottom: 20, zIndex: 20, border: `4px solid ${INK}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 5px 0 rgba(0,0,0,0.35)'}}>
        <PolyMini cev={X.CEV} t={t} tm={tmapAt(t)} byTm={t < COLD_END} cam={cam} w={260} h={135} VW={VW} VH={VH} />
      </div>
      <div style={{position: 'absolute', right: 22, bottom: 12, ...font2, fontSize: 16, color: 'rgba(255,255,255,0.85)', textShadow: '0 2px 3px #000', zIndex: 20, opacity: show}}>Hypothetical simulation · Power points are fictional</div>
    </>
  );
};
const ElimFX: React.FC<{t: number}> = ({t}) => {
  const e = (X.D.elim as any[]).filter((x) => t >= x[0] && t < x[0] + (x[4] ? 2.4 : 3.4)).slice(-1)[0];
  if (!e) return null;
  const [t0, k, a, n, big] = e;
  if (big && t < t0 + 2.4) {
    const p = popT(t, t0, 9); const o = lerp(t, t0, t0 + 0.15, 0, 1) * lerp(t, t0 + 2.1, t0 + 2.4, 1, 0);
    return (
      <AbsoluteFill style={{zIndex: 47, background: `radial-gradient(circle, rgba(60,0,0,${0.55 * o}) 0%, rgba(0,0,0,${0.75 * o}) 80%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: o}}>
        <div style={{position: 'relative', transform: `scale(${0.4 + 0.6 * p}) rotate(${lerp(t, t0, t0 + 2.4, -4, 6)}deg)`, filter: `grayscale(${lerp(t, t0 + 0.4, t0 + 1.0, 0, 1)})`}}>
          <Ball k={k} size={300} mood="shocked" t={t} />
          <svg width={300} height={300} style={{position: 'absolute', left: 0, top: 0}}>
            {[[40, 40, 260, 260], [260, 40, 40, 260]].map(([x1, y1, x2, y2], i) => { const u = lerp(t, t0 + 0.35 + i * 0.15, t0 + 0.55 + i * 0.15, 0, 1); return <line key={i} x1={x1} y1={y1} x2={x1 + (x2 - x1) * u} y2={y1 + (y2 - y1) * u} stroke="#ff1f2f" strokeWidth={34} strokeLinecap="round" />; })}
          </svg>
        </div>
        <div style={{...font, fontSize: 150, color: '#ff2b3b', WebkitTextStroke: `7px ${INK}`, paintOrder: 'stroke fill', marginTop: 10, transform: `scale(${popT(t, t0 + 0.3, 10)})`, lineHeight: 1}}>ELIMINATED</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, opacity: popT(t, t0 + 0.6, 12)}}>
          <span style={{...font, fontSize: 50, color: '#fff', textShadow: `4px 4px 0 ${INK}`}}>{SNAME(k)} · BY</span><FlagImg k={a} w={70} round /><span style={{...font, fontSize: 50, color: YELLOW, textShadow: `4px 4px 0 ${INK}`}}>{SNAME(a)}</span>
        </div>
        <div style={{...font, fontSize: 58, color: INK, background: YELLOW, border: `5px solid ${INK}`, borderRadius: 18, padding: '4px 26px 0', marginTop: 16, transform: `scale(${popT(t, t0 + 0.9, 10)})`}}>{n} LEFT</div>
      </AbsoluteFill>
    );
  }
  const a2 = popT(t, t0, 12) * lerp(t, t0 + 3.0, t0 + 3.4, 1, 0);
  return (
    <div style={{position: 'absolute', top: 92, right: 20, zIndex: 37, transform: `translateX(${(1 - a2) * 560}px)`, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(16,18,28,0.94)', border: `4px solid #ff3b3b`, borderRadius: 18, padding: '8px 16px 6px 10px', boxShadow: '0 6px 0 rgba(0,0,0,0.35)'}}>
      <FlagImg k={a} w={50} round /><span style={{fontSize: 34}}>🔫</span>
      <div style={{position: 'relative'}}><FlagImg k={k} w={50} round style={{filter: 'grayscale(1)'}} /><span style={{position: 'absolute', left: 4, top: -10, ...font, fontSize: 56, color: '#ff2b3b', lineHeight: 1}}>✕</span></div>
      <div style={{display: 'flex', flexDirection: 'column'}}><span style={{...font, fontSize: 30, color: '#fff', lineHeight: 1}}>{SNAME(k)}</span><span style={{...font, fontSize: 22, color: '#ff9a8f'}}>ELIMINATED · {n} LEFT</span></div>
    </div>
  );
};
const Board: React.FC<{t: number}> = ({t}) => {
  const b = ((X.D.board || []) as number[][]).find(([a, z]) => t >= a && t < z);
  if (!b) return null;
  const [t0, t1] = b; const o = lerp(t, t0, t0 + 0.2, 0, 1) * lerp(t, t1 - 0.3, t1, 1, 0);
  const rows = empCounts(t0, X.D.parts); const dead = (X.D.elim as any[]).filter((e) => e[0] <= t0).map((e) => e[1]);
  const mx_ = rows.length ? rows[0][1] : 1;
  return (
    <AbsoluteFill style={{zIndex: 46, background: `rgba(8,10,18,${0.82 * o})`, opacity: o, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 50}}>
      <div style={{...font, fontSize: 84, color: YELLOW, textShadow: `6px 6px 0 ${INK}`, transform: `scale(${popT(t, t0, 10)})`}}>🏆 STANDINGS</div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14, width: 1100}}>
        {rows.slice(0, 8).map(([k, c], i) => { const u = popT(t, t0 + 0.25 + i * 0.12, 12); return (
          <div key={k} style={{display: 'flex', alignItems: 'center', gap: 16, transform: `translateX(${(1 - u) * -160}px)`, opacity: Math.min(1, u * 1.5)}}>
            <span style={{...font, fontSize: 46, color: i === 0 ? YELLOW : '#fff', width: 60, textAlign: 'right'}}>{i + 1}</span><Ball k={k} size={64} mood={i === 0 ? 'smug' : 'calm'} t={t} />
            <span style={{...font, fontSize: 38, color: '#fff', width: 330, whiteSpace: 'nowrap'}}>{SNAME(k)}</span>
            <div style={{flex: 1, height: 38, background: '#2a3040', border: `4px solid ${INK}`, borderRadius: 12, overflow: 'hidden'}}><div style={{width: `${(100 * c / mx_) * lerp(t, t0 + 0.4 + i * 0.12, t0 + 1.2 + i * 0.12, 0, 1)}%`, height: '100%', background: `linear-gradient(90deg, ${MAINCOL[k]}, #ffffff55)`}} /></div>
            <span style={{...font, fontSize: 34, color: YELLOW, width: 150}}>{c} {c === 1 ? 'COUNTRY' : 'LANDS'}</span>
          </div>); })}
      </div>
      <div style={{display: 'flex', gap: 8, marginTop: 26, flexWrap: 'wrap', width: 1300, justifyContent: 'center', opacity: popT(t, t0 + 1.4, 10)}}>
        {dead.map((k: number) => <div key={k} style={{position: 'relative'}}><FlagImg k={k} w={56} round style={{filter: 'grayscale(1) brightness(0.7)'}} /><span style={{position: 'absolute', left: 6, top: -12, ...font, fontSize: 62, color: '#ff2b3b', lineHeight: 1}}>✕</span></div>)}
      </div>
    </AbsoluteFill>
  );
};
const Poll: React.FC<{t: number}> = ({t}) => {
  const p = X.D.poll; if (!p || t < p.t0 || t > p.t1) return null;
  const o = lerp(t, p.t0, p.t0 + 0.2, 0, 1) * lerp(t, p.t1 - 0.3, p.t1, 1, 0);
  return (
    <AbsoluteFill style={{zIndex: 46, background: `rgba(8,10,18,${0.78 * o})`, opacity: o, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40}}>
      <div style={{...font, fontSize: 96, color: '#fff', textShadow: `6px 6px 0 ${INK}`, transform: `scale(${popT(t, p.t0, 10)})`}}>{p.text}</div>
      <div style={{display: 'flex', gap: 34}}>
        {(p.ks as number[]).map((k, i) => <div key={k} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transform: `translateY(${(1 - popT(t, p.t0 + 0.3 + i * 0.18, 10)) * 500 + Math.sin(t * 7 + i) * 10}px)`}}><Ball k={k} size={150} mood="angry" t={t + i} /><span style={{...font, fontSize: 30, color: YELLOW}}>{SNAME(k)}</span></div>)}
      </div>
    </AbsoluteFill>
  );
};
const IntroL: React.FC<{t: number}> = ({t}) => {
  const I = X.D.intro; if (!I || !I.grid || t > I.count[1] + 0.1) return null;
  const P: number[] = I.parts;
  if (t < I.map[0]) {
    const xsT = I.xs[0]; const sur = 9; // la casilla que queda con '?'
    return (
      <AbsoluteFill style={{zIndex: 48, background: 'radial-gradient(circle at 50% 40%, #2a1420 0%, #07080d 75%)', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{...font, fontSize: 150, color: t < xsT ? '#fff' : '#ff2b3b', textShadow: `8px 8px 0 ${INK}`, marginTop: 90, transform: `scale(${t < xsT ? 0.6 + 0.4 * popT(t, 0.1, 9) : 0.6 + 0.4 * popT(t, xsT, 9)}) rotate(${t < xsT ? 0 : -2}deg)`, lineHeight: 1}}>{t < xsT ? '20 COUNTRIES' : 'ONLY 1 SURVIVES'}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(10, 168px)', gap: 22, marginTop: 120}}>
          {P.map((k, i) => { const ti = I.grid[0] + i * 0.115; const u = popT(t, ti, 11); const xi = i < sur ? i : i - 1; const tx = xsT + 0.05 + xi * 0.11; const crossed = i !== sur && t >= tx;
            const q = i === sur && t >= xsT + 2.2; const zq = q ? lerp(t, xsT + 2.2, I.map[0], 1, 2.4, Easing.in(Easing.cubic)) : 1;
            return (
              <div key={k} style={{position: 'relative', width: 168, height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${(1 - u) * -700}px) scale(${zq})`, opacity: crossed ? lerp(t, tx + 0.4, tx + 1.0, 1, 0.35) : 1, zIndex: q ? 5 : 1}}>
                {i === sur && t >= xsT ? <div style={{width: 150, height: 150, borderRadius: '50%', background: '#111', border: `6px solid ${YELLOW}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: 96, color: YELLOW, boxShadow: `0 0 ${30 + 20 * Math.sin(t * 9)}px #ffd23f`}}>?</div> : <Ball k={k} size={150} mood={crossed ? 'scared' : 'angry'} t={t + i} />}
                <span style={{...font, fontSize: 19, color: '#fff', marginTop: 4, whiteSpace: 'nowrap', opacity: i === sur && t >= xsT ? 0 : 1}}>{SNAME(k)}</span>
                {crossed && <span style={{position: 'absolute', top: -14, ...font, fontSize: 170, color: '#ff1f2f', lineHeight: 1, transform: `scale(${1.6 - 0.6 * popT(t, tx, 14)})`, textShadow: `4px 4px 0 ${INK}`}}>✕</span>}
              </div>); })}
        </div>
      </AbsoluteFill>
    );
  }
  if (t < I.tier[0]) {
    const a = popT(t, I.map[0] + 0.2, 10) * lerp(t, I.tier[0] - 0.3, I.tier[0], 1, 0);
    return (
      <AbsoluteFill style={{zIndex: 30, pointerEvents: 'none'}}>
        <div style={{position: 'absolute', top: 40, left: 0, right: 0, textAlign: 'center', transform: `scale(${0.7 + 0.3 * a})`, opacity: a}}>
          <div style={{...font, fontSize: 92, color: '#fff', textShadow: `6px 6px 0 ${INK}`, lineHeight: 1}}>LATIN AMERICA</div>
          <div style={{...font, fontSize: 132, color: YELLOW, textShadow: `7px 7px 0 ${INK}`, lineHeight: 1.05}}>BATTLE ROYALE</div>
        </div>
        <div style={{position: 'absolute', bottom: 70, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: popT(t, I.map[0] + 1.2, 10)}}><Pill bg={RED} style={{padding: '6px 26px 0', ...font, fontSize: 50, color: '#fff'}}>20 FIGHTERS · 1 WINNER · NO RULES</Pill></div>
      </AbsoluteFill>
    );
  }
  if (t < I.count[0]) {
    const o = lerp(t, I.tier[0], I.tier[0] + 0.25, 0, 1) * lerp(t, I.tier[1] - 0.25, I.tier[1], 1, 0);
    return (
      <AbsoluteFill style={{zIndex: 46, background: `rgba(8,10,18,${0.8 * o})`, opacity: o, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 34}}>
        <div style={{...font, fontSize: 76, color: '#fff', textShadow: `5px 5px 0 ${INK}`}}>⚡ POWER TIER LIST</div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14, width: 1500}}>
          {(I.tiers as any[]).map(([tn, ks]: [string, number[]], i: number) => { const tt = I.tier[0] + 0.2 + i * 2.1; const u = popT(t, tt, 12); return (
            <div key={tn} style={{display: 'flex', alignItems: 'center', gap: 16, height: 150, background: 'rgba(255,255,255,0.06)', border: `4px solid ${INK}`, borderRadius: 18, transform: `translateX(${(1 - u) * -1800}px)`}}>
              <div style={{width: 150, height: '100%', background: TIERC[tn], borderRadius: '14px 0 0 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: 100, color: INK}}>{tn}</div>
              {ks.map((k, j) => { const tj = tt + 0.35 + j * 0.22; const v = popT(t, tj, 11); return <div key={k} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${(1 - v) * -400}px)`, opacity: t >= tj ? 1 : 0}}><Ball k={k} size={100} mood={tn === 'S' ? 'smug' : tn === 'D' ? 'scared' : 'angry'} t={t + j} /><span style={{...font, fontSize: 20, color: '#fff', whiteSpace: 'nowrap'}}>{SNAME(k)}</span></div>; })}
            </div>); })}
        </div>
      </AbsoluteFill>
    );
  }
  const nums = ['3', '2', '1']; const i = Math.min(2, Math.floor((t - I.count[0]) / 1.1)); const tn = I.count[0] + 0.1 + i * 1.1; const fight = t >= I.count[1] - 0.35;
  return (
    <AbsoluteFill style={{zIndex: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `rgba(0,0,0,${fight ? 0 : 0.35})`}}>
      <div style={{...font, fontSize: fight ? 260 : 420, color: fight ? YELLOW : '#fff', WebkitTextStroke: `12px ${INK}`, paintOrder: 'stroke fill', transform: `scale(${fight ? 0.5 + 0.7 * popT(t, I.count[1] - 0.35, 10) : 1.6 - 0.6 * popT(t, tn, 10)})`, opacity: fight ? lerp(t, I.count[1], I.count[1] + 0.1, 1, 0) : lerp(t, tn + 0.8, tn + 1.05, 1, 0.2)}}>{fight ? 'FIGHT!' : nums[i]}</div>
    </AbsoluteFill>
  );
};
const strAt = (t: number) => { let v = 'OPEN'; for (const p of (X.D.strait || []) as any[]) { if (p[0] <= t) v = p[1]; else break; } return v as string; };
const HzPills: React.FC<{t: number}> = ({t}) => {
  const st = strAt(t); const col = st === 'CLOSED' ? '#e0262b' : st === 'CONTESTED' ? '#ff9a2e' : '#2fae4e';
  const o = kfv(X.D.oil, t), o0 = kfv(X.D.oil, t - 0.5); const up = o > o0 + 0.05, dn = o < o0 - 0.05;
  return <>
    <Pill bg={col} style={{padding: '1px 12px 0', ...font, fontSize: 23, color: '#fff', display: 'inline-block'}}>⚓ STRAIT: {st}</Pill>
    <Pill bg="#2a3346" style={{padding: '1px 12px 0', ...font, fontSize: 23, color: up ? '#ff8f8f' : dn ? '#8fffa4' : '#fff', display: 'inline-block'}}>🛢️ ${Math.round(o)} {up ? '▲' : dn ? '▼' : ''}</Pill>
  </>;
};
const IntroH: React.FC<{t: number}> = ({t}) => {
  const I = X.D.intro; if (!I) return null;
  if (t < I.close[1]) {
    const inOil = t < I.oil[1], inHere = t >= I.here[0] && t < I.here[1], inClose = t >= I.close[0];
    const dark = inOil ? 0.62 : inHere ? 0.25 : 0.4;
    const cnt = Math.round(lerp(t, 0.3, 2.6, 0, 21000000, Easing.out(Easing.cubic)));
    const price = kfv(X.D.oil, t);
    return (
      <AbsoluteFill style={{zIndex: 44, background: `radial-gradient(circle, rgba(0,0,0,${dark * 0.4}) 25%, rgba(0,0,0,${dark}) 100%)`}}>
        {inOil && <div style={{position: 'absolute', top: 240, left: 0, right: 0, textAlign: 'center'}}>
          <div style={{...font, fontSize: 150, color: '#fff', textShadow: `8px 8px 0 ${INK}`, transform: `scale(${0.6 + 0.4 * popT(t, 0.1, 9)})`, lineHeight: 1}}>20% OF THE WORLD'S OIL</div>
          <div style={{...font, fontSize: 70, color: YELLOW, textShadow: `5px 5px 0 ${INK}`, marginTop: 30, opacity: popT(t, 0.6, 10)}}>🛢️ {cnt.toLocaleString('en-US')} BARRELS / DAY</div>
        </div>}
        {inHere && <>
          <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
            {[0, 1, 2].map((i) => { const r = 60 + ((t * 120 + i * 60) % 180); return <circle key={i} cx={960} cy={540} r={r} fill="none" stroke={YELLOW} strokeWidth={8} opacity={1 - (r - 60) / 180} />; })}
            <circle cx={960} cy={540} r={22} fill={RED} stroke={INK} strokeWidth={6} />
          </svg>
          <div style={{position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center', ...font, fontSize: 130, color: '#fff', textShadow: `8px 8px 0 ${INK}`, transform: `scale(${0.6 + 0.4 * popT(t, I.here[0], 9)})`}}>PASSES THROUGH HERE 👇</div>
        </>}
        {inClose && <>
          <AbsoluteFill style={{background: `rgba(200,10,20,${0.35 * lerp(t, I.close[0], I.close[0] + 0.6, 1, 0.3)})`}} />
          <div style={{position: 'absolute', top: 110, left: 0, right: 0, textAlign: 'center', ...font, fontSize: 140, color: '#ff2b3b', WebkitTextStroke: `7px ${INK}`, paintOrder: 'stroke fill', transform: `scale(${0.5 + 0.5 * popT(t, I.close[0] + 0.1, 9)}) rotate(-2deg)`}}>AND IRAN JUST CLOSED IT</div>
          <div style={{position: 'absolute', right: 120, bottom: 110, width: 620, background: 'rgba(10,12,20,0.92)', border: `5px solid ${RED}`, borderRadius: 22, padding: '16px 26px', transform: `translateY(${(1 - popT(t, I.close[0] + 0.5, 10)) * 500}px)`}}>
            <div style={{...font, fontSize: 34, color: '#ff9a8f'}}>🛢️ OIL PRICE · LIVE</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
              <span style={{...font, fontSize: 110, color: '#fff', lineHeight: 1}}>${Math.round(price)}</span><span style={{...font, fontSize: 70, color: '#ff3b3b'}}>▲ {Math.round((price / 72 - 1) * 100)}%</span>
            </div>
            <svg width={560} height={110}><polyline points={Array.from({length: 40}, (_, i) => { const tt = I.close[0] + (i / 39) * Math.max(0.01, t - I.close[0]); return `${i * 14},${105 - (kfv(X.D.oil, tt) - 60) * 1.05 + Math.sin(i * 1.7) * 4}`; }).join(' ')} fill="none" stroke="#ff3b3b" strokeWidth={6} strokeLinejoin="round" /></svg>
          </div>
        </>}
      </AbsoluteFill>
    );
  }
  if (t >= I.tape[0] && t < I.tape[1]) {
    const o = lerp(t, I.tape[0], I.tape[0] + 0.25, 0, 1) * lerp(t, I.tape[1] - 0.3, I.tape[1], 1, 0);
    return (
      <AbsoluteFill style={{zIndex: 46, background: `linear-gradient(100deg, rgba(31,63,160,${0.85 * o}) 0%, rgba(8,10,18,${0.9 * o}) 50%, rgba(20,110,50,${0.85 * o}) 100%)`, opacity: o}}>
        <div style={{position: 'absolute', top: 30, left: 0, right: 0, textAlign: 'center', ...font, fontSize: 72, color: YELLOW, textShadow: `5px 5px 0 ${INK}`}}>TALE OF THE TAPE</div>
        <div style={{position: 'absolute', left: 60, top: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateX(${(1 - popT(t, I.tape[0], 10)) * -500}px)`}}><Ball k={I.ka} size={250} mood="smug" t={t} look={[0.8, 0]} /><div style={{...font, fontSize: 56, color: '#fff', textShadow: `4px 4px 0 ${INK}`}}>USA</div></div>
        <div style={{position: 'absolute', right: 60, top: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateX(${(1 - popT(t, I.tape[0], 10)) * 500}px)`}}><Ball k={I.kb} size={250} mood="angry" t={t} look={[-0.8, 0]} /><div style={{...font, fontSize: 56, color: '#fff', textShadow: `4px 4px 0 ${INK}`}}>IRAN</div></div>
        <div style={{position: 'absolute', left: 380, right: 380, top: 140, display: 'flex', flexDirection: 'column', gap: 22}}>
          {(I.rows as any[]).map(([ic, lab, a, b, sh], i) => { const tt = I.tape[0] + 0.6 + i * 1.6; const u = popT(t, tt, 11); const f = lerp(t, tt + 0.2, tt + 0.9, 0.5, sh, Easing.out(Easing.cubic)); return (
            <div key={i} style={{opacity: t >= tt ? 1 : 0, transform: `scale(${0.7 + 0.3 * u})`}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}><span style={{...font, fontSize: 46, color: '#9fc0ff'}}>{a}</span><span style={{...font, fontSize: 32, color: '#fff'}}>{ic} {lab}</span><span style={{...font, fontSize: 46, color: '#8fffa4'}}>{b}</span></div>
              <div style={{height: 30, display: 'flex', border: `4px solid ${INK}`, borderRadius: 12, overflow: 'hidden'}}><div style={{width: `${f * 100}%`, background: 'linear-gradient(180deg,#5a8bff,#1f3fa0)'}} /><div style={{width: 6, background: '#fff'}} /><div style={{flex: 1, background: 'linear-gradient(180deg,#4fd06f,#1a7a34)'}} /></div>
            </div>); })}
        </div>
      </AbsoluteFill>
    );
  }
  if (t >= I.go[0] && t < I.go[1]) {
    const a = popT(t, I.go[0], 10) * lerp(t, I.go[1] - 0.25, I.go[1], 1, 0);
    return <AbsoluteFill style={{zIndex: 46, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `rgba(0,0,0,${0.4 * a})`}}>
      <div style={{...font, fontSize: 150, color: '#fff', WebkitTextStroke: `9px ${INK}`, paintOrder: 'stroke fill', transform: `scale(${0.5 + 0.5 * a})`}}>SIMULATION START</div>
      <div style={{...font2, fontSize: 34, color: '#fff', marginTop: 10, opacity: a, textShadow: '0 2px 4px #000'}}>Hypothetical scenario · Not a prediction · Real conflict ongoing</div>
    </AbsoluteFill>;
  }
  return null;
};
// ======== BLOQUES DE INTRO COMBINABLES (D.intro.blocks) ========
const BIG = (fs: number, col = '#fff', st = 8) => ({...font, fontSize: fs, color: col, WebkitTextStroke: `${st}px ${INK}`, paintOrder: 'stroke fill' as any, lineHeight: 1});
const fadeIO = (t: number, a: number, b: number, k = 0.25) => lerp(t, a, a + k, 0, 1) * lerp(t, b - k, b, 1, 0);
const BLK: Record<string, React.FC<{t: number; b: any}>> = {
  grid: ({t, b}) => {
    const ks: number[] = b.ks; const cols = b.cols || 10; const sz = b.size || 150; const xsT = b.xsT ?? 1e9; const keep = b.keep ?? -1;
    return <AbsoluteFill style={{background: b.bg || 'radial-gradient(circle at 50% 40%, #2a1420 0%, #07080d 75%)', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: lerp(t, b.t1 - 0.2, b.t1, 1, 0)}}>
      <div style={{...BIG(b.fs || 140, t < xsT ? '#fff' : '#ff2b3b'), marginTop: b.mt ?? 50, transform: `scale(${0.6 + 0.4 * popT(t, t < xsT ? b.t0 : xsT, 9)})`}}>{t < xsT ? b.title1 : b.title2}</div>
      <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, ${sz + 14}px)`, gap: b.gap ?? 12, marginTop: 30}}>
        {ks.map((k, i) => { const ti = b.t0 + 0.1 + i * (b.step || 0.06); const u = popT(t, ti, 11); const xi = keep >= 0 && i > keep ? i - 1 : i; const tx = xsT + 0.05 + xi * (b.xstep || 0.05); const crossed = i !== keep && t >= tx;
          const q = i === keep && t >= xsT;
          return <div key={k} style={{position: 'relative', width: sz + 14, height: sz + 22, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${(1 - u) * -800}px) scale(${q ? lerp(t, xsT + 0.8, b.t1, 1, 2.2) : 1})`, opacity: crossed ? lerp(t, tx + 0.3, tx + 0.8, 1, 0.3) : 1, zIndex: q ? 5 : 1}}>
            {q ? <div style={{width: sz, height: sz, borderRadius: '50%', background: '#111', border: `5px solid ${YELLOW}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: sz * 0.66, color: YELLOW, boxShadow: `0 0 ${24 + 16 * Math.sin(t * 9)}px #ffd23f`}}>?</div> : <Ball k={k} size={sz} mood={crossed ? 'scared' : 'angry'} t={t + i} />}
            {crossed && <span style={{position: 'absolute', top: -sz * 0.12, ...font, fontSize: sz * 1.1, color: '#ff1f2f', lineHeight: 1, transform: `scale(${1.6 - 0.6 * popT(t, tx, 14)})`, textShadow: `4px 4px 0 ${INK}`}}>✕</span>}
          </div>; })}
      </div>
    </AbsoluteFill>;
  },
  mapTitle: ({t, b}) => { const a = popT(t, b.t0 + 0.15, 10) * lerp(t, b.t1 - 0.3, b.t1, 1, 0); return <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', top: 40, left: 0, right: 0, textAlign: 'center', transform: `scale(${0.7 + 0.3 * a})`, opacity: a}}>
      <div style={{...BIG(90), textShadow: `6px 6px 0 ${INK}`}}>{b.l1}</div><div style={{...BIG(130, YELLOW), marginTop: 6}}>{b.l2}</div></div>
    {b.pill && <div style={{position: 'absolute', bottom: 70, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: popT(t, b.t0 + 1.0, 10) * a}}><Pill bg={RED} style={{padding: '6px 26px 0', ...font, fontSize: 48, color: '#fff'}}>{b.pill}</Pill></div>}
  </AbsoluteFill>; },
  tier: ({t, b}) => { const o = fadeIO(t, b.t0, b.t1); const TC: any = {S: '#ff3b3b', A: '#ff9a2e', B: '#ffd23f', C: '#6fdc6f', D: '#5aa7ff'}; const per = (b.t1 - b.t0 - 0.6) / b.tiers.length;
    return <AbsoluteFill style={{background: `rgba(8,10,18,${0.82 * o})`, opacity: o, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 26}}>
      <div style={{...BIG(70), textShadow: `5px 5px 0 ${INK}`}}>{b.title || '⚡ POWER TIER LIST'}</div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12, width: 1640}}>
        {(b.tiers as any[]).map(([tn, ks]: [string, number[]], i: number) => { const tt = b.t0 + 0.2 + i * per; const u = popT(t, tt, 12); const bs = Math.min(100, 1400 / Math.max(1, ks.length) - 12); return (
          <div key={tn} style={{display: 'flex', alignItems: 'center', gap: 8, height: 150, background: 'rgba(255,255,255,0.06)', border: `4px solid ${INK}`, borderRadius: 18, transform: `translateX(${(1 - u) * -1900}px)`}}>
            <div style={{width: 140, minWidth: 140, height: '100%', background: TC[tn], borderRadius: '14px 0 0 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: 96, color: INK}}>{tn}</div>
            {ks.map((k, j) => { const tj = tt + 0.3 + j * Math.min(0.2, (per - 0.5) / ks.length); const v = popT(t, tj, 11); return <div key={k} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${(1 - v) * -400}px)`, opacity: t >= tj ? 1 : 0}}><Ball k={k} size={bs} mood={tn === 'S' ? 'smug' : tn === 'D' ? 'scared' : 'angry'} t={t + j} />{bs > 70 && <span style={{...font, fontSize: 17, color: '#fff', whiteSpace: 'nowrap'}}>{SNAME(k)}</span>}</div>; })}
          </div>); })}
      </div></AbsoluteFill>; },
  count: ({t, b}) => { const nums = ['3', '2', '1']; const step = (b.t1 - b.t0 - 0.4) / 3; const i = Math.min(2, Math.floor((t - b.t0) / step)); const tn = b.t0 + i * step; const go = t >= b.t1 - 0.4;
    return <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: `rgba(0,0,0,${go ? 0 : 0.35})`}}>
      <div style={{...BIG(go ? 240 : 420, go ? YELLOW : '#fff', 12), transform: `scale(${go ? 0.5 + 0.7 * popT(t, b.t1 - 0.4, 10) : 1.6 - 0.6 * popT(t, tn, 10)})`}}>{go ? (b.go || 'FIGHT!') : nums[i]}</div></AbsoluteFill>; },
  news: ({t, b}) => { const o = fadeIO(t, b.t0, b.t1, 0.15); const sl = popT(t, b.t0 + 0.2, 10);
    return <AbsoluteFill style={{opacity: o, pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.65) 100%)'}} />
      <div style={{position: 'absolute', left: 60, top: 50, display: 'flex', gap: 10, alignItems: 'center'}}><div style={{background: '#e0262b', padding: '6px 16px 2px', ...font, fontSize: 34, color: '#fff', borderRadius: 8, opacity: 0.6 + 0.4 * Math.abs(Math.sin(t * 5))}}>● LIVE</div><div style={{...font, fontSize: 30, color: '#fff', textShadow: '0 2px 4px #000'}}>{b.where || 'WORLD NEWS 24'}</div></div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 130, transform: `translateX(${(1 - sl) * -1920}px)`}}>
        <div style={{display: 'inline-block', background: '#e0262b', padding: '10px 30px 2px', ...font, fontSize: 44, color: '#fff', marginLeft: 60}}>BREAKING NEWS</div>
        <div style={{background: '#fff', padding: '14px 60px 6px', ...font, fontSize: 66, color: INK, borderTop: `6px solid #e0262b`}}>{b.head}</div>
        {b.sub && <div style={{background: '#1b1f2b', padding: '8px 60px 2px', ...font2, fontSize: 32, color: '#fff'}}>{b.sub}</div>}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, height: 56, background: YELLOW, overflow: 'hidden', borderTop: `4px solid ${INK}`}}><div style={{whiteSpace: 'nowrap', ...font, fontSize: 34, color: INK, paddingTop: 10, transform: `translateX(${1920 - (t - b.t0) * 420}px)`}}>{b.ticker}</div></div>
    </AbsoluteFill>; },
  bars: ({t, b}) => { const o = fadeIO(t, b.t0, b.t1); const rows = b.rows as any[]; const mx = Math.max(...rows.map((r) => r[1]));
    return <AbsoluteFill style={{background: `rgba(8,10,18,${0.85 * o})`, opacity: o, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 40}}>
      <div style={{...BIG(70, YELLOW), textShadow: `5px 5px 0 ${INK}`}}>{b.title}</div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20, width: 1500}}>
        {rows.map(([k, v, lab], i) => { const tt = b.t0 + 0.3 + i * (b.step || 0.25); const u = popT(t, tt, 12); const w = lerp(t, tt + 0.1, tt + 0.9, 0, v / mx, Easing.out(Easing.cubic)); return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, opacity: Math.min(1, u * 1.5), transform: `translateX(${(1 - u) * -120}px)`}}>
            <Ball k={k} size={70} mood="angry" t={t + i} /><span style={{...font, fontSize: 34, color: '#fff', width: 300, whiteSpace: 'nowrap'}}>{SNAME(k)}</span>
            <div style={{flex: 1, height: 44, background: '#2a3040', border: `4px solid ${INK}`, borderRadius: 12, overflow: 'hidden'}}><div style={{width: `${w * 100}%`, height: '100%', background: `linear-gradient(90deg, ${MAINCOL[k]}, #ffffff66)`}} /></div>
            <span style={{...font, fontSize: 34, color: YELLOW, width: 220}}>{lab}</span></div>); })}
      </div></AbsoluteFill>; },
  stat: ({t, b}) => { const o = fadeIO(t, b.t0, b.t1, 0.15); const v = Math.round(lerp(t, b.t0 + 0.2, b.t1 - 0.6, b.from, b.to, Easing.out(Easing.cubic)));
    return <AbsoluteFill style={{background: `radial-gradient(circle, rgba(0,0,0,${0.35 * o}) 20%, rgba(0,0,0,${0.7 * o}) 100%)`, opacity: o, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      {b.pre && <div style={{...BIG(70), marginBottom: 10}}>{b.pre}</div>}
      <div style={{...BIG(230, b.col || YELLOW, 12), transform: `scale(${0.6 + 0.4 * popT(t, b.t0, 9)})`}}>{(b.prefix || '') + v.toLocaleString('en-US') + (b.unit || '')}</div>
      <div style={{...BIG(76), marginTop: 14, opacity: popT(t, b.t0 + 0.5, 10)}}>{b.sub}</div></AbsoluteFill>; },
  versus: ({t, b}) => { const o = fadeIO(t, b.t0, b.t1, 0.15); const sa = popT(t, b.t0 + 0.05, 9), sb = popT(t, b.t0 + 0.3, 9), sv = popT(t, b.t0 + 0.6, 12);
    return <AbsoluteFill style={{opacity: o, background: `linear-gradient(105deg, ${MAINCOL[b.ka[0]]}dd 0%, #0a0c14ee 48%, #0a0c14ee 52%, ${MAINCOL[b.kb[0]]}dd 100%)`}}>
      <div style={{position: 'absolute', left: 80, top: 180, display: 'flex', gap: 10, transform: `translateX(${(1 - sa) * -900}px)`}}>{(b.ka as number[]).map((k, i) => <Ball key={k} k={k} size={i ? 200 : 330} mood="angry" t={t} look={[0.8, 0]} />)}</div>
      <div style={{position: 'absolute', right: 80, top: 180, display: 'flex', gap: 10, flexDirection: 'row-reverse', transform: `translateX(${(1 - sb) * 900}px)`}}>{(b.kb as number[]).map((k, i) => <Ball key={k} k={k} size={i ? 200 : 330} mood="angry" t={t} look={[-0.8, 0]} />)}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', ...BIG(260, YELLOW, 14), transform: `scale(${2.2 - 1.2 * sv}) rotate(-6deg)`, opacity: sv}}>VS</div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, display: 'flex', justifyContent: 'space-around', ...BIG(64)}}><span>{b.la}</span><span>{b.lb}</span></div>
      {b.title && <div style={{position: 'absolute', left: 0, right: 0, top: 40, textAlign: 'center', ...BIG(80), opacity: popT(t, b.t0 + 0.8, 10)}}>{b.title}</div>}
    </AbsoluteFill>; },
  quote: ({t, b}) => { const o = fadeIO(t, b.t0, b.t1, 0.15); const n = Math.floor(lerp(t, b.t0 + 0.3, b.t0 + 0.3 + b.text.length * 0.035, 0, b.text.length));
    return <AbsoluteFill style={{opacity: o, background: `rgba(5,6,10,${0.75 * o})`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 50}}>
      <div style={{transform: `scale(${0.5 + 0.5 * popT(t, b.t0, 9)})`}}><Ball k={b.kk ?? b.k} size={380} mood={b.mood || 'angry'} t={t} look={[0.8, 0]} /></div>
      <div style={{maxWidth: 1000, background: '#fff', border: `7px solid ${INK}`, borderRadius: 36, padding: '30px 44px 20px', ...font, fontSize: 74, color: INK, lineHeight: 1.1}}>{b.text.slice(0, n)}<span style={{opacity: Math.sin(t * 12) > 0 ? 1 : 0}}>|</span></div>
    </AbsoluteFill>; },
  clock: ({t, b}) => { const o = fadeIO(t, b.t0, b.t1, 0.15); const v = lerp(t, b.t0 + 0.2, b.t1 - 0.3, b.from, b.to); const hh = Math.floor(v), mm = Math.floor((v - hh) * 60), ss = Math.floor(((v - hh) * 60 - mm) * 60);
    return <AbsoluteFill style={{opacity: o, background: `radial-gradient(circle, rgba(60,0,0,${0.5 * o}) 10%, rgba(0,0,0,${0.85 * o}) 90%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{...BIG(70)}}>{b.title}</div>
      <div style={{...font, fontSize: 250, color: '#ff2b3b', fontVariantNumeric: 'tabular-nums', textShadow: '0 0 40px #ff2b3b', marginTop: 10}}>{String(hh).padStart(2, '0')}:{String(mm).padStart(2, '0')}:{String(ss).padStart(2, '0')}</div>
      <div style={{...BIG(56, YELLOW), marginTop: 10}}>{b.sub}</div></AbsoluteFill>; },
  timeline: ({t, b}) => { const o = fadeIO(t, b.t0, b.t1); const ev = b.events as any[]; const per = (b.t1 - b.t0 - 0.5) / ev.length; const cur = Math.min(ev.length - 1, Math.floor((t - b.t0 - 0.2) / per));
    return <AbsoluteFill style={{opacity: o, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 80, right: 80, bottom: 90, height: 8, background: '#fff', borderRadius: 4, border: `3px solid ${INK}`}} />
      {ev.map(([d, txt]: [string, string], i: number) => { const x = 80 + (i + 0.5) * (1760 / ev.length); const on = i <= cur; return <div key={i}>
        <div style={{position: 'absolute', left: x - 18, bottom: 76, width: 36, height: 36, borderRadius: '50%', background: on ? RED : '#555', border: `5px solid ${INK}`}} />
        <div style={{position: 'absolute', left: x - 120, width: 240, bottom: 124, textAlign: 'center', ...font, fontSize: 28, color: on ? YELLOW : '#999', textShadow: `3px 3px 0 ${INK}`}}>{d}</div></div>; })}
      {cur >= 0 && <div style={{position: 'absolute', top: 60, left: 0, right: 0, textAlign: 'center', ...BIG(84), transform: `scale(${0.7 + 0.3 * popT(t, b.t0 + 0.2 + cur * per, 10)})`}}>{ev[cur][1]}</div>}
    </AbsoluteFill>; },
  ladder: ({t, b}) => { const o = fadeIO(t, b.t0, b.t1); const ks = b.ks as number[]; const per = (b.t1 - b.t0 - 0.6) / ks.length;
    return <AbsoluteFill style={{background: `rgba(8,10,18,${0.8 * o})`, opacity: o}}>
      <div style={{position: 'absolute', top: 30, left: 0, right: 0, textAlign: 'center', ...BIG(72, YELLOW)}}>{b.title}</div>
      {ks.map((k, i) => { const tt = b.t0 + 0.3 + i * per; const u = popT(t, tt, 11); const x = 140 + i * (1640 / Math.max(1, ks.length - 1)); const y = 900 - (i / Math.max(1, ks.length - 1)) * 640;
        return <div key={k} style={{position: 'absolute', left: x - 60, top: y - 60, transform: `scale(${u})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}><Ball k={k} size={i === ks.length - 1 ? 150 : 110} mood={i === ks.length - 1 ? 'smug' : 'angry'} t={t + i} /><span style={{...font, fontSize: 22, color: '#fff', whiteSpace: 'nowrap'}}>{(b.labels && b.labels[i]) || SNAME(k)}</span></div>; })}
    </AbsoluteFill>; },
};
const IntroSeq: React.FC<{t: number}> = ({t}) => {
  const I = X.D.intro; if (!I || !I.blocks) return null;
  const bs = (I.blocks as any[]).filter((b) => t >= b.t0 && t < b.t1);
  return <>{bs.map((b, i) => { const C = BLK[b.k]; return C ? <AbsoluteFill key={i} style={{zIndex: b.z ?? 46}}><C t={t} b={b} /></AbsoluteFill> : null; })}</>;
};

const HudCamp: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const D = X.D;
  const show = lerp(t, D.war_t - 0.5, D.war_t + 0.3, 0, 1) * lerp(t, D.winT - 0.3, D.winT + 0.3, 1, 0);
  if (show <= 0.01) return null;
  const st = pst(t); const sides = (D.sides || []) as any[];
  const cnt = sides.map((sd) => { let n = 0; for (let k = 0; k < NK; k++) if ((sd.ks as number[]).includes(st.owner[k])) n++; return n; });
  const ch = (D.chapters as any[]).filter((c) => c[0] <= t).slice(-1)[0];
  const day = Math.round(kfv(D.days, t));
  const pill = ((D.pills || []) as any[]).filter((p) => p[0] <= t && (p[3] == null || t < p[0] + p[3])).slice(-1)[0];
  return (<>
    <div style={{position: 'absolute', top: 20, left: 20 + (1 - show) * -700, zIndex: 20, display: 'flex', flexDirection: 'column', gap: 6}}>
      {sides.map((sd, i) => (
        <div key={i} style={{display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(250,244,230,0.94)', border: `4px solid ${sd.col || INK}`, borderRadius: 14, padding: '3px 12px 0 4px', minWidth: 300}}>
          <div style={{display: 'flex'}}>{(sd.flags || sd.ks.slice(0, 3)).map((k: number, j: number) => <div key={j} style={{marginLeft: j ? -14 : 0}}><FlagImg k={k} w={40} round /></div>)}</div>
          <span style={{...font, fontSize: 24, color: INK, flex: 1, whiteSpace: 'nowrap'}}>{sd.name}</span>
          {sd.vals ? <span style={{...font, fontSize: 22, color: sd.col || RED, whiteSpace: 'nowrap'}}>{(sd.vals as any[]).filter((v: any) => v[0] <= t).slice(-1)[0]?.[1]}</span> : <span style={{...font, fontSize: 30, color: sd.col || RED}}>{cnt[i]}</span>}
        </div>))}
      {pill && <Pill bg={pill[2] || RED} style={{padding: '2px 12px 0', ...font, fontSize: 24, color: '#fff', alignSelf: 'flex-start'}}>{pill[1]}</Pill>}
    </div>
    <div style={{position: 'absolute', top: 18, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20, transform: `translateY(${(1 - show) * -120}px)`}}>
      <Pill bg="#1b1f2b" style={{padding: '4px 22px 0', ...font, fontSize: 40, color: YELLOW, border: `4px solid ${RED}`}}>📅 {D.dayLabel || 'DAY'} {day}</Pill>
    </div>
    {ch && <div style={{position: 'absolute', top: 20, right: 20 + (1 - show) * -600, zIndex: 20}}><Pill bg={YELLOW} style={{padding: '4px 16px 0', ...font, fontSize: 26, color: INK}}>{(D.chapters as any[]).indexOf(ch) + 1} · {ch[1]}</Pill></div>}
    <div style={{position: 'absolute', left: 20 + (1 - show) * -500, bottom: 20, zIndex: 20, border: `4px solid ${INK}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 5px 0 rgba(0,0,0,0.35)'}}>
      <PolyMini cev={X.CEV} t={t} tm={tmapAt(t)} byTm={t < COLD_END} cam={cam} w={260} h={135} VW={VW} VH={VH} />
    </div>
    <div style={{position: 'absolute', right: 22, bottom: 12, ...font2, fontSize: 16, color: 'rgba(255,255,255,0.85)', textShadow: '0 2px 3px #000', zIndex: 20, opacity: show}}>{D.disclaimer || 'Hypothetical simulation · Not a prediction'}</div>
  </>);
};

const warpT = (D: any, tr: number) => { const w = D.warp as number[][] | undefined; if (!w) return tr; let s = w[0]; for (const x of w) { if (x[0] <= tr) s = x; else break; } return s[1] + (tr - s[0]) * s[2]; };
const Splash: React.FC<{tR: number}> = ({tR}) => {
  const sp = ((X.D.splash || []) as any[]).find((x) => tR >= x[0] && tR < x[1]); if (!sp) return null;
  const [r0, r1, txt, sub] = sp; const o = lerp(tR, r0, r0 + 0.2, 0, 1) * lerp(tR, r1 - 0.25, r1, 1, 0);
  return <AbsoluteFill style={{zIndex: 49, background: `rgba(6,8,14,${0.72 * o})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: o}}>
    <div style={{...font, fontSize: Math.min(230, 2700 / Math.max(6, String(txt).length)), textAlign: 'center', maxWidth: 1800, color: YELLOW, WebkitTextStroke: `12px ${INK}`, paintOrder: 'stroke fill', lineHeight: 1, transform: `scale(${0.4 + 0.6 * popT(tR, r0, 10)}) rotate(-3deg)`}}>{txt}</div>
    <div style={{...font, fontSize: 70, color: '#fff', WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill', marginTop: 16, opacity: popT(tR, r0 + 0.35, 10), transform: `translateY(${(1 - popT(tR, r0 + 0.35, 10)) * 40}px)`}}>{sub}</div>
  </AbsoluteFill>;
};

// ---------- COLD OPEN cinemático (tiempo de render) ----------
const coldOf = (tR: number) => { const C = X.D.cold2; if (!C) return null; return tR < C.p1 ? C : null; };
const ColdOpen: React.FC<{tR: number}> = ({tR}) => {
  const C = X.D.cold2; if (!C || tR >= C.p1 + 0.05) return null;
  const clips = C.clips as number[][]; const inClip = tR < C.c1;
  const lb = inClip ? 1 : lerp(tR, C.p0 + 1.2, C.p1, 1, 0);
  let flash = 0; for (const [r0] of clips) { const d = tR - r0; if (d >= 0 && d < 0.18) flash = Math.max(flash, 1 - d / 0.18); }
  const black = inClip ? lerp(tR, C.c1 - 0.6, C.c1, 0, 1) : tR < C.p0 ? 1 : lerp(tR, C.p0, C.p0 + 2.2, 1, 0, Easing.inOut(Easing.quad));
  const ta = tR >= C.p0 ? popT(tR, C.p0 + 0.7, 6) * lerp(tR, C.p1 - 0.45, C.p1, 1, 0) : 0;
  const sa = tR >= C.p0 ? popT(tR, C.p0 + 1.5, 6) * lerp(tR, C.p1 - 0.45, C.p1, 1, 0) : 0;
  const ci = clips.findIndex(([r0, r1]) => tR >= r0 && tR < r1);
  return <>
    {inClip && <AbsoluteFill style={{zIndex: 61, pointerEvents: 'none', background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 35%, rgba(0,0,0,0.75) 100%)', mixBlendMode: 'multiply'}} />}
    {inClip && <AbsoluteFill style={{zIndex: 61, pointerEvents: 'none', background: 'rgba(120,20,10,0.18)', mixBlendMode: 'overlay'}} />}
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 120 * lb, background: '#000', zIndex: 62}} />
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 120 * lb, background: '#000', zIndex: 62}} />
    {inClip && ci >= 0 && C.tags && C.tags[ci] && <div style={{position: 'absolute', left: 60, bottom: 30, zIndex: 63, ...font, fontSize: 40, color: '#fff', opacity: 0.85 * popT(tR, clips[ci][0] + 0.2, 8), letterSpacing: 4}}>{C.tags[ci]}</div>}
    <AbsoluteFill style={{zIndex: 64, background: '#000', opacity: black, pointerEvents: 'none'}} />
    {flash > 0 && <AbsoluteFill style={{zIndex: 65, background: '#fff', opacity: flash * 0.7}} />}
    {tR >= C.p0 && <AbsoluteFill style={{zIndex: 66, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, pointerEvents: 'none'}}>
      <div style={{...font, fontSize: 104, color: '#fff', textAlign: 'center', maxWidth: 1700, lineHeight: 1.02, opacity: ta, transform: `translateY(${(1 - ta) * 30}px)`, textShadow: '0 6px 30px rgba(0,0,0,0.9)', WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill'}}>{C.title}</div>
      <div style={{...font2, fontSize: 46, color: '#e8e2d0', textAlign: 'center', maxWidth: 1500, opacity: sa, textShadow: '0 4px 20px rgba(0,0,0,0.95)'}}>{C.sub}</div>
    </AbsoluteFill>}
  </>;
};
// @@BRFX@@
export const Indo2: React.FC<{audio?: boolean; v?: string; W?: number; H?: number; off?: number; zf?: number; sdur?: number; hook?: string[]; cta?: string[]; segs?: number[][]}> = ({audio = true, v = 'a', W = 1920, H = 1080, off = 0, zf = 1, sdur = 0, hook, cta, segs}) => {
  X = getCtx(v); VW = W; VH = H; SHORT = H > W;
  if (X.D.flagOvr) for (const kk in X.D.flagOvr) FLAG_OVR[+kk] = X.D.flagOvr[kk];
  const D = X.D; const V2 = D.ver !== 'a';
  const f = useCurrentFrame(); const lt = f / 30; const sg = segTime(lt, segs); const tR = segs ? sg.t : off + lt; const t = warpT(D, tR);
  const zc = (c: Cam): Cam => (zf === 1 ? c : {...c, s: c.s * zf});
  const cam = zc(X.camF(t)); const cp = zc(X.camF(Math.max(0, t - 1 / 30)));
  const speed = Math.hypot((cam.cx - cp.cx) * cam.s, (cam.cy - cp.cy) * cam.s) + Math.abs(Math.log(cam.s / cp.s)) * 900;
  const blur = Math.min(2.0, Math.max(0, (speed - 40) / 14));
  const [shx, shy] = shakeAt(t);
  const HERO = !!D.hero;
  const g0 = D.globe; const gx = HERO ? ((D.globes || []) as any[]).find((x) => t >= x.t0 && t < x.t1) : null;
  const g = gx || g0; const inGlobe = t >= g.t0 && t < g.t1;
  const gz = inGlobe && !HERO ? lerp(t, g.t1 - 1.6, g.t1, 1, 1.8, Easing.in(Easing.quad)) : 1;
  const lon = lerp(t, g.t0, g.t1 - (HERO ? 0.7 : 1.6), g.lon0, g.lon1, Easing.inOut(Easing.cubic)), lat = lerp(t, g.t0, g.t1 - (HERO ? 0.7 : 1.6), g.lat0, g.lat1, Easing.inOut(Easing.cubic));
  const gfade = HERO ? lerp(t, g.t1 - 0.7, g.t1, 1, 0) : lerp(t, g.t1 - 0.4, g.t1, 1, 0);
  const grad = HERO ? lerp(t, g.t0, g.t1, gx ? 380 : 420, gx ? 640 : 700, Easing.inOut(Easing.cubic)) : 420;
  const showMap = !inGlobe || t > g.t1 - (HERO ? 0.75 : 0.45);
  const ownSet = HERO && inGlobe ? ownedAt(t) : null; const hlSet = new Set<string>(gx ? gx.hl : []);
  const split = HERO ? ((D.split || []) as any[]).find((x) => t >= x.t0 && t < x.t1) : null;
  const camL = split ? {...cam, cx: cam.cx + VW / 4 / cam.s} : cam;
  const c2 = X.camF2(t); const camR = split ? {...c2, cx: c2.cx - VW / 4 / c2.s} : c2;
  const fl = flashAt(t);
  const b = (D.battles as any[]).find((x) => t >= x.t0 && t < x.t1);
  const lit = b ? [b.a ?? X.ID, b.b, ...(b.title === 'WESTERN ALLIANCE' ? X.ALLY : [])] : null;
  const pulse = 0.5 + 0.5 * Math.sin(t * 7);
  const CO = coldOf(tR); const coldZ = CO ? (tR < CO.c1 ? 1.04 + 0.05 * ((tR % 3) / 3) : lerp(tR, CO.p0, CO.p1, 1.12, 1.0, Easing.out(Easing.quad))) : 1;
  return (
    <AbsoluteFill style={{background: '#0b1626', overflow: 'hidden'}}>
      {showMap && (
        <AbsoluteFill style={{clipPath: split ? 'inset(0 50% 0 0)' : undefined, transform: `translate(${shx}px,${shy}px) rotate(${V2 ? win(D.tilt, t) : 0}deg) scale(${(1 + (V2 ? punch(t) : 0) + (V2 && win(D.tilt, t) ? 0.04 : 0)) * coldZ})`, filter: V2 && win(D.desat, t) ? `saturate(${1 - 0.55 * Math.abs(win(D.desat, t))}) contrast(1.05)` : undefined}}>
          <PolyCanvas cev={X.CEV} t={t} tm={tmapAt(t)} byTm={t < COLD_END} cam={inGlobe ? X.camF(g.t1 + 0.03) : camL} W={VW} H={VH} blur={blur} opts={{markers: b ? markersFor(b) : null, squads: false, capitalsOff: true, hl: b && t < b.ko ? b.b : null, war: t > COLD_END ? D.war : null, empire: t > COLD_END ? (D.mode === 'br' ? (b ? (b.a ?? null) : null) : X.ID) : null, lit, empireCol: X.D.empCol ? (b && t < b.ko ? X.D.empCol2 : X.D.empCol) : b && t < b.ko ? (V2 ? '#6a0c12' : '#9e1a1f') : null, waves: V2, empireFlag: !!X.D.empFlag, colOver: X.D.colOver}} />
          <Arrows t={t} cam={camL} />
          <Laser t={t} cam={camL} />
          {!CO && <>
          {t < D.winT + 0.3 && <Labels t={t} cam={camL} />}
          <Stamps t={t} cam={camL} />
          <Bubbles t={t} cam={camL} />
          </>}
        </AbsoluteFill>
      )}
      {split && (
        <AbsoluteFill style={{clipPath: 'inset(0 0 0 50%)', transform: `translate(${shx}px,${shy}px)`}}>
          <PolyCanvas cev={X.CEV} t={t} tm={tmapAt(t)} byTm={t < COLD_END} cam={camR} W={VW} H={VH} blur={blur} opts={{markers: b ? markersFor(b) : null, squads: false, capitalsOff: true, hl: b && t < b.ko ? b.b : null, war: t > COLD_END ? D.war : null, empire: t > COLD_END ? (D.mode === 'br' ? (b ? (b.a ?? null) : null) : X.ID) : null, lit, empireCol: X.D.empCol ? (b && t < b.ko ? X.D.empCol2 : X.D.empCol) : b && t < b.ko ? (V2 ? '#6a0c12' : '#9e1a1f') : null, waves: V2, empireFlag: !!X.D.empFlag, colOver: X.D.colOver}} />
          <Arrows t={t} cam={camR} />
        </AbsoluteFill>
      )}
      {split && (() => { const a = Math.min(1, (t - split.t0) / 0.4, (split.t1 - t) / 0.4); return <AbsoluteFill style={{zIndex: 32, opacity: a, pointerEvents: 'none'}}>
        <div style={{position: 'absolute', left: VW / 2 - 6, top: 0, bottom: 0, width: 12, background: '#fff', boxShadow: '0 0 24px 6px rgba(255,255,255,0.6)', transform: `scaleY(${popT(t, split.t0, 10)})`}} />
        <div style={{position: 'absolute', left: 0, width: VW / 2, top: 120, textAlign: 'center'}}><span style={{background: '#c81e1e', border: `5px solid ${INK}`, borderRadius: 16, padding: '6px 22px 0', ...font, fontSize: 44, color: '#fff'}}>{split.left}</span></div>
        <div style={{position: 'absolute', left: VW / 2, width: VW / 2, top: 120, textAlign: 'center'}}><span style={{background: '#1f4fbf', border: `5px solid ${INK}`, borderRadius: 16, padding: '6px 22px 0', ...font, fontSize: 44, color: '#fff'}}>{split.right}</span></div>
      </AbsoluteFill>; })()}
      {inGlobe && (
        <AbsoluteFill style={{transform: `scale(${gz})`, transformOrigin: '50% 50%', opacity: gfade, background: gfade < 1 ? 'transparent' : undefined}}>
          <Globe W={1920} H={1080} lon={lon} lat={lat} radius={grad} cy={540} overlay={HERO ? 0.22 : lerp(t, g.t0, g.t0 + 2.5, 0, 0.5)} highlight={HERO ? (c) => (ownSet && ownSet.has(CODEK[c]) ? '#2f5fe0' : hlSet.has(c) ? '#ff3b30' : null) : (c) => (c === 'ID' ? (pulse > 0.5 ? '#ff3b30' : '#ffd23f') : null)} stars={HERO ? 1 : lerp(t, g.t1 - 1.6, g.t1, 1, 0)} />
        </AbsoluteFill>
      )}
      <Grade t={t} />
      {!CO && <>
      <Spot t={t} cam={camL} />
      <Targets t={t} cam={camL} />
      <Network t={t} cam={camL} />
      <BigHP t={t} />
      </>}
      {V2 && <Cinema t={t} />}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.42) 100%)', pointerEvents: 'none', zIndex: 15}} />
      {!CO && <>
      <Hud t={t} cam={cam} />
      <Battle t={t} />
      <Chips t={t} />
      <Chapter t={t} />
      <QCard t={t} />
      <Cards t={t} />
      <Ranking t={t} />
      <Roulettes t={t} />
      <Reveal t={t} />
      <Summit t={t} />
      <Glitch t={t} />
      <Subscribe t={t} />
      <ColdText t={t} />
      <Title t={t} />
      <Ending t={t} />
      <Splash tR={tR} />
      {D.mode === 'br' && <><ElimFX t={t} /><Board t={t} /><Poll t={t} /><IntroL t={t} /></>}
      {D.intro && D.intro.kind === 'hz' && <><IntroH t={t} /><Poll t={t} /></>}
      {D.intro && D.intro.blocks && <><IntroSeq t={t} />{D.mode !== 'br' && <Poll t={t} />}</>}
      </>}
      <ColdOpen tR={tR} />
      {fl > 0 && <AbsoluteFill style={{background: '#fff', opacity: fl * 0.35, zIndex: 60}} />}
      {SHORT && hook && cta && !segs && <ShortLayer t={t} off={off} dur={sdur} hook={hook} cta={cta} />}
      {SHORT && hook && cta && segs && <ShortCup lt={lt} dur={sg.sdur} hook={hook} cta={cta} cuts={sg.cuts} />}
      {audio && <Audio src={staticFile(`hw/indo2${v}.wav`)} />}
    </AbsoluteFill>
  );
};
