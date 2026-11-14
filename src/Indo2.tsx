// Can Indonesia Conquer the World? v2 — invasiones con pelotones por tierra (1920x1080). Versiones 'a' y 'b'.
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, staticFile, useCurrentFrame} from 'remotion';
import {FlagCanvas, makeCam, CamKey, Cam, COUNTRIES, MAINCOL, NK, FLAG_OVR, FICK, FICHIDE} from './HexWorld';
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
import J_wbram from './hw/wbram.json';
import J_wbsa from './hw/wbsa.json';
import J_dbras from './hw/dbras.json';
import J_dbras2 from './hw/dbras2.json';
import J_dbras3 from './hw/dbras3.json';
import J_tlua from './hw/tlua.json';
import J_tlde from './hw/tlde.json';
import J_dbras4 from './hw/dbras4.json';
import J_dbreu from './hw/dbreu.json';
import J_cw from './hw/cw.json';
import J_da from './hw/da.json';
import J_dbram from './hw/dbram.json';
import J_dbrin from './hw/dbrin.json';
import J_idw from './hw/idw.json';
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
import J_swap from './hw/swap.json';
import J_euus from './hw/euus.json';
import J_brme from './hw/brme.json';
import J_cnin from './hw/cnin.json';
import J_brit from './hw/brit.json';
import J_napo from './hw/napo.json';
import J_ussr from './hw/ussr.json';
import J_ww1 from './hw/ww1.json';
import J_tri from './hw/tri.json';
import J_euarmy from './hw/euarmy.json';
import J_rare from './hw/rare.json';
import J_inpk from './hw/inpk.json';
import J_kor from './hw/kor.json';
import J_cart from './hw/cart.json';
import J_ilir from './hw/ilir.json';
import J_nato from './hw/nato.json';
import J_tw27 from './hw/tw27.json';
import J_grl from './hw/grl.json';
import J_inid from './hw/inid.json';

type Ctx = {D: any; camF: (t: number) => Cam; camF2: (t: number) => Cam; CEV: CEv[]; ID: number; MKB: Map<any, any[]>; ALLY: number[]};
const CTXS: Record<string, Ctx> = {};
const getCtx = (v: string): Ctx => {
  if (!CTXS[v]) {
  const JMAP: Record<string, any> = {inid: J_inid, wbram: J_wbram, wbsa: J_wbsa, dbras: J_dbras, dbras2: J_dbras2, dbras3: J_dbras3, tlua: J_tlua, tlde: J_tlde, dbras4: J_dbras4, dbreu: J_dbreu, cw: J_cw, da: J_da, dbram: J_dbram, dbrin: J_dbrin, idw: J_idw, breu: J_breu, braf: J_braf, bras: J_bras, cqru: J_cqru, cqcn: J_cqcn, cqbr: J_cqbr, cqes: J_cqes, taiwan: J_taiwan, rceu: J_rceu, ukr: J_ukr, usla: J_usla, ww3: J_ww3, survive: J_survive, ww2: J_ww2, grl: J_grl, tw27: J_tw27, nato: J_nato, ilir: J_ilir, cart: J_cart, kor: J_kor, inpk: J_inpk, rare: J_rare, euarmy: J_euarmy, tri: J_tri, ww1: J_ww1, ussr: J_ussr, napo: J_napo, brit: J_brit, cnin: J_cnin, brme: J_brme, euus: J_euus, swap: J_swap};
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
const pst = (t: number) => polyState(X.CEV, t, tmapAt(t), t < (X.D.coldEnd ?? COLD_END));
const kfv = (pk: number[][], t: number, i = 1) => {
  if (t <= pk[0][0]) return pk[0][i];
  for (let j = 1; j < pk.length; j++) if (t <= pk[j][0]) { const u = (t - pk[j - 1][0]) / (pk[j][0] - pk[j - 1][0]); return pk[j - 1][i] + (pk[j][i] - pk[j - 1][i]) * u; }
  return pk[pk.length - 1][i];
};
let VW = 1920, VH = 1080, SHORT = false;
const toS = (x: number, y: number, c: Cam): [number, number] => [VW / 2 + (x - c.cx) * c.s, VH / 2 + (y - c.cy) * c.s];
export const FlagImg: React.FC<{k: number; w: number; h?: number; round?: boolean; style?: React.CSSProperties}> = ({k, w, h, round, style}) => (
  <FlagCanvas k={k} w={w} h={h ?? (round ? w : (w * 3) / 4)} style={{borderRadius: round ? '50%' : 6, border: `3px solid ${INK}`, flexShrink: 0, ...style}} />
);
export const Ball: React.FC<{k: number; size: number; mood: Mood; t: number; look?: [number, number]}> = ({k, size, mood, t, look}) => (
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
  for (let k = 0; k < NK; k++) { if (MAINPIECE[k] < 0 || (FICK.has(k) && !X.D.fic) || (X.D.fic && FICHIDE.has(k))) continue; const o = st.owner[k]; const ar = CAREA[k] * (o === k ? 1.6 : 1); if (ar > bestA[o]) { bestA[o] = ar; best[o] = k; } }
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
        <div style={{position: 'relative', background: '#fff', border: `4px solid ${INK}`, borderRadius: 18, padding: '8px 18px 4px', ...font2, fontSize: X.D.duel ? 46 : 30, color: INK, whiteSpace: 'nowrap', boxShadow: '0 5px 0 rgba(0,0,0,0.3)'}}>
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
  if (D.duel) return null;
  if (D.mode === 'tl') return <TlHud t={t} />;
  if (D.mode === 'cw' || D.mode === 'da') return null;
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
        {!D.wbr && <Pill bg="#1b1f2b" style={{padding: '4px 22px 0', ...font, fontSize: 40, color: YELLOW, border: `4px solid ${RED}`}}>📅 DAY {day}</Pill>}
      </div>
      {ch && !D.dbr && <div style={{position: 'absolute', top: 20, right: 20 + (1 - show) * -600, zIndex: 20}}><Pill bg={YELLOW} style={{padding: '4px 16px 0', ...font, fontSize: 26, color: INK}}>{(D.chapters as any[]).indexOf(ch) + 1} · {ch[1]}</Pill></div>}
      {sk && sn > 1 && (
        <div style={{position: 'absolute', top: 120, left: 22, zIndex: 20, transform: `scale(${0.9 + 0.1 * popT(t, lastF ? lastF[0] : 0, 8)})`, transformOrigin: 'left center', opacity: lerp(t, sk[1] + 1.0, sk[1] + 1.5, 1, 0)}}>
          <Pill bg={RED} style={{padding: '2px 14px 0', ...font, fontSize: 30, color: '#fff'}}>🔥 +{sn} IN A ROW</Pill>
        </div>
      )}
      <div style={{position: 'absolute', left: 20 + (1 - show) * -500, bottom: 20, zIndex: 20, border: `4px solid ${INK}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 5px 0 rgba(0,0,0,0.35)'}}>
        <PolyMini cev={X.CEV} t={t} tm={tmapAt(t)} byTm={t < (X.D.coldEnd ?? COLD_END)} cam={cam} w={260} h={135} VW={VW} VH={VH} />
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
        <span style={{...font, fontSize: X.D.duel ? 54 : 44, color: INK}}>{text}</span>
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
  if (X.D.splash || X.D.mode === 'cw' || X.D.mode === 'da') return null;
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
  const r = X.D.reveal; if (!r || t < r.t0 || t > r.t1) return null;
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
  const t0 = X.D.winT; if (t < t0 || X.D.duel || X.D.mode === 'cw' || X.D.mode === 'da') return null;
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
      {!D.dbr && <div style={{position: 'absolute', top: 20, left: 20 + (1 - show) * -600, zIndex: 20}}>
        <Pill bg="#1b1f2b" style={{padding: '4px 18px 0', display: 'flex', alignItems: 'baseline', gap: 10, border: `4px solid ${RED}`, transform: `scale(${1 + bump})`, transformOrigin: 'left center'}}>
          <span style={{...font, fontSize: 26, color: '#ff9a8f'}}>👥 ALIVE</span><span style={{...font, fontSize: 52, color: '#fff'}}>{n}</span><span style={{...font, fontSize: 26, color: '#9aa'}}>/ {D.parts.length}</span>
        </Pill>
        <div style={{marginTop: 8, display: 'flex', flexDirection: 'column', gap: 5}}>
          {top.map(([k, c], i) => (
            <div key={k} style={{display: 'flex', alignItems: 'center', gap: 8, background: i === 0 ? 'rgba(255,210,63,0.92)' : 'rgba(250,244,230,0.92)', border: `3px solid ${INK}`, borderRadius: 12, padding: '2px 10px 0 4px', width: 250}}>
              <span style={{...font, fontSize: 22, color: INK, width: 22}}>{i + 1}</span><FlagImg k={k} w={34} round /><span style={{...font, fontSize: 20, color: INK, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden'}}>{SNAME(k)}</span><span style={{...font, fontSize: 22, color: RED}}>{c}</span>
            </div>))}
        </div>
      </div>}
      <div style={{position: 'absolute', top: 18, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20, transform: `translateY(${(1 - show) * -120}px)`}}>
        {!D.wbr && <Pill bg="#1b1f2b" style={{padding: '4px 22px 0', ...font, fontSize: 40, color: YELLOW, border: `4px solid ${RED}`}}>📅 DAY {day}</Pill>}
      </div>
      {ch && !D.dbr && <div style={{position: 'absolute', top: 20, right: 20 + (1 - show) * -600, zIndex: 20}}><Pill bg={YELLOW} style={{padding: '4px 16px 0', ...font, fontSize: 26, color: INK}}>{D.dbr ? ch[1] : <>ROUND {(D.chapters as any[]).indexOf(ch) + 1} · {ch[1]}</>}</Pill></div>}
      <div style={{position: 'absolute', left: 20 + (1 - show) * -500, bottom: 20, zIndex: 20, border: `4px solid ${INK}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 5px 0 rgba(0,0,0,0.35)'}}>
        <PolyMini cev={X.CEV} t={t} tm={tmapAt(t)} byTm={t < (X.D.coldEnd ?? COLD_END)} cam={cam} w={260} h={135} VW={VW} VH={VH} />
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
  elim: ({t, b}) => {
    const ks: number[] = b.ks; const n = ks.length; const cols = b.cols || 10; const sz = b.size || 112; const gap = 18;
    const W_ = cols * (sz + gap) - gap; const rows = Math.ceil(n / cols); const H_ = rows * (sz + gap + 8);
    const x0 = (VW - W_) / 2, y0 = 250; const keep = b.keep; const xs = b.xsT, xe = b.xsEnd;
    const order = ks.map((_, i) => i).filter((i) => i !== keep);
    const tx = (j: number) => xs + (xe - xs) * Math.pow((j + 1) / order.length, 0.62);
    const nCross = order.filter((_, j) => t >= tx(j)).length; const left = n - nCross;
    const fin = t >= xe + 0.15; const fz = fin ? Easing.out(Easing.cubic)(Math.min(1, (t - xe - 0.15) / 0.7)) : 0;
    const o = Math.min(1, (b.t1 - t) / 0.3); const lastX = order.map((_, j) => tx(j)).filter((v) => v <= t).slice(-1)[0] ?? -9;
    const shk = t - lastX < 0.12 ? (1 - (t - lastX) / 0.12) * 6 : 0;
    return <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #2a1018 0%, #07080d 72%)', opacity: o, transform: `translate(${Math.sin(t * 90) * shk}px, ${Math.cos(t * 70) * shk}px)`}}>
      <div style={{position: 'absolute', top: 40, left: 0, right: 0, textAlign: 'center', opacity: 1 - fz}}>
        <span style={{...font, fontSize: 150, color: left <= 3 ? '#ff2b3b' : '#fff', textShadow: `8px 8px 0 ${INK}`, display: 'inline-block', transform: `scale(${t - lastX < 0.2 ? 1.12 - 0.12 * (t - lastX) / 0.2 : 1})`}}>{left}</span>
        <span style={{...font, fontSize: 70, color: YELLOW, textShadow: `5px 5px 0 ${INK}`, marginLeft: 22}}>{b.unit || 'COUNTRIES'} LEFT</span></div>
      {ks.map((k, i) => { const r = Math.floor(i / cols), c = i % cols; const rowN = Math.min(cols, n - r * cols); const ox = (cols - rowN) * (sz + gap) / 2;
        const x = x0 + ox + c * (sz + gap), y = y0 + r * (sz + gap + 8); const ti = b.t0 + 0.08 + i * (b.step || 0.025); const u = popT(t, ti, 12);
        const j = order.indexOf(i); const crossed = j >= 0 && t >= tx(j); const cu = crossed ? Math.min(1, (t - tx(j)) / 0.25) : 0;
        if (i === keep) { const cx = VW / 2 - 120 - sz * 3.2, cy = VH / 2 - sz * 1.6 - 20; const px = x + (cx - x) * fz, py = y + (cy - y) * fz; const scl = 1 + 2.2 * fz;
          return <div key={k} style={{position: 'absolute', left: px, top: py, width: sz, height: sz, transform: `scale(${u * scl})`, transformOrigin: 'top left', zIndex: 5}}>
            {fin && <div style={{position: 'absolute', left: -sz * 0.6, top: -sz * 0.6, width: sz * 2.2, height: sz * 2.2, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,210,63,0.75) 0%, rgba(255,210,63,0) 65%)', transform: `rotate(${t * 40}deg)`}} />}
            <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: '#111', border: `5px solid ${YELLOW}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: sz * 0.66, color: YELLOW, boxShadow: `0 0 ${20 + 14 * Math.sin(t * 9)}px #ffd23f`}}>?</div></div>; }
        return <div key={k} style={{position: 'absolute', left: x, top: y, width: sz, height: sz + 8, transform: `translateY(${(1 - u) * -600}px) scale(${1 - 0.25 * cu})`, opacity: (crossed ? 1 - 0.65 * cu : 1) * (1 - fz), filter: crossed ? `grayscale(${cu})` : undefined}}>
          <Ball k={k} size={sz} mood={crossed ? 'scared' : 'angry'} t={t + i} />
          {crossed && <span style={{position: 'absolute', left: 0, right: 0, top: -sz * 0.18, textAlign: 'center', ...font, fontSize: sz * 1.15, color: '#ff1f2f', lineHeight: 1, transform: `scale(${1.8 - 0.8 * popT(t, tx(j), 16)})`, textShadow: `4px 4px 0 ${INK}`}}>✕</span>}
        </div>; })}
      {fin && <div style={{position: 'absolute', left: VW / 2 - 40, top: VH / 2 - 170, opacity: fz, transform: `translateX(${(1 - fz) * 200}px)`}}>
        <div style={{...font, fontSize: 104, color: '#fff', textShadow: `7px 7px 0 ${INK}`, lineHeight: 0.95}}>{b.fin1 || 'ONLY ONE'}</div>
        <div style={{...font, fontSize: 104, color: YELLOW, textShadow: `7px 7px 0 ${INK}`, lineHeight: 0.95}}>{b.fin2 || 'SURVIVES'}</div>
        {b.pill && <div style={{marginTop: 22, opacity: popT(t, xe + 0.9, 10)}}><Pill bg={RED} style={{padding: '6px 22px 0', ...font, fontSize: 38, color: '#fff'}}>{b.pill}</Pill></div>}</div>}
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
      </div>
      {b.stamp && t >= b.stampT && <div style={{position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', justifyContent: 'center', transform: `rotate(-8deg) scale(${2.2 - 1.2 * popT(t, b.stampT, 14)})`, opacity: Math.min(1, (t - b.stampT) / 0.12)}}>
        <div style={{...font, fontSize: 92, color: '#ff2b3b', border: '12px solid #ff2b3b', borderRadius: 24, padding: '10px 40px 0', background: 'rgba(10,10,16,0.88)', textShadow: `4px 4px 0 ${INK}`}}>{b.stamp}</div></div>}
      </AbsoluteFill>; },
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
      <PolyMini cev={X.CEV} t={t} tm={tmapAt(t)} byTm={t < (X.D.coldEnd ?? COLD_END)} cam={cam} w={260} h={135} VW={VW} VH={VH} />
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
    {inClip && ci >= 0 && C.tags && C.tags[ci] && <div style={{position: 'absolute', left: 0, right: 0, bottom: 150, zIndex: 63, display: 'flex', justifyContent: 'center'}}><div style={{...font, fontSize: 96, color: ci % 2 ? YELLOW : '#fff', textShadow: `7px 7px 0 ${INK}`, WebkitTextStroke: `4px ${INK}`, paintOrder: 'stroke fill', transform: `scale(${1.5 - 0.5 * popT(tR, clips[ci][0] + 0.05, 14)}) rotate(${ci % 2 ? 2 : -2}deg)`, opacity: popT(tR, clips[ci][0] + 0.05, 14)}}>{C.tags[ci]}</div></div>}
    <AbsoluteFill style={{zIndex: 64, background: '#000', opacity: black, pointerEvents: 'none'}} />
    {flash > 0 && <AbsoluteFill style={{zIndex: 65, background: '#fff', opacity: flash * 0.7}} />}
    {tR >= C.p0 && <AbsoluteFill style={{zIndex: 66, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, pointerEvents: 'none'}}>
      <div style={{...font, fontSize: 104, color: '#fff', textAlign: 'center', maxWidth: 1700, lineHeight: 1.02, opacity: ta, transform: `translateY(${(1 - ta) * 30}px)`, textShadow: '0 6px 30px rgba(0,0,0,0.9)', WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill'}}>{C.title}</div>
      <div style={{...font2, fontSize: 46, color: '#e8e2d0', textAlign: 'center', maxWidth: 1500, opacity: sa, textShadow: '0 4px 20px rgba(0,0,0,0.95)'}}>{C.sub}</div>
    </AbsoluteFill>}
  </>;
};
// @@BRFX@@
// ======================= DUELO CON SUPERPODERES =======================
const dval = (bars: number[][], t: number, i: number) => {
  if (t <= bars[0][0]) return bars[0][i];
  for (let j = 1; j < bars.length; j++) if (t < bars[j][0]) { const a = bars[j - 1], b = bars[j]; return a[i] + (b[i] - a[i]) * Easing.out(Easing.quad)((t - a[0]) / (b[0] - a[0])); }
  return bars[bars.length - 1][i];
};
const mmss = (s: number) => { const v = Math.max(0, Math.ceil(s)); return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`; };
const hsh = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const DuelHud: React.FC<{t: number}> = ({t}) => {
  const Dd = X.D.duel; if (!Dd) return null;
  const a = lerp(t, Dd.hud[0], Dd.hud[0] + 0.4, 0, 1) * lerp(t, Dd.hud[1] - 0.3, Dd.hud[1], 1, 0); if (a <= 0) return null;
  const side = (i: number) => {
    const k = i === 1 ? Dd.a : Dd.b; const v = dval(Dd.bars, t, i); const g = Math.max(v, dval(Dd.bars, t - 0.7, i));
    const col = i === 1 ? Dd.ca : Dd.cb; const low = v <= 15; const shake = low ? Math.sin(t * 40) * 2 : 0;
    const hit = (Dd.hits as any[]).filter((h) => h[1] === i && t >= h[0] && t < h[0] + 1.6);
    return (
      <div style={{display: 'flex', flexDirection: i === 1 ? 'row' : 'row-reverse', alignItems: 'center', gap: 12, width: 700, flexShrink: 0, position: 'relative'}}>
        <div style={{transform: `scale(${1 + (hit.length ? 0.12 * Math.max(0, 1 - (t - hit[0][0]) * 2) : 0)}) translateX(${shake}px)`}}><Ball k={k} size={118} mood={v < 20 ? 'scared' : v > dval(Dd.bars, t, 3 - i) ? 'smug' : 'angry'} t={t} look={[i === 1 ? 1 : -1, 0]} /></div>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{display: 'flex', justifyContent: 'space-between', flexDirection: i === 1 ? 'row' : 'row-reverse', ...font, color: '#fff', textShadow: `4px 4px 0 ${INK}`}}>
            <span style={{fontSize: 48}}>{i === 1 ? Dd.na : Dd.nb}</span>
            <span style={{fontSize: 60, color: low ? (Math.floor(t * 4) % 2 ? '#ff4d4d' : '#fff') : YELLOW}}>{Math.max(0, Math.round(v))}%</span>
          </div>
          <div style={{height: 46, background: '#1a1f2b', border: `6px solid ${INK}`, borderRadius: 26, overflow: 'hidden', position: 'relative', display: 'flex', justifyContent: i === 1 ? 'flex-start' : 'flex-end', boxShadow: hit.length ? `0 0 ${30 * Math.max(0, 1 - (t - hit[0][0]))}px 10px ${hit[0][2] > 0 ? '#ff2020' : '#30ff70'}` : 'none', transform: hit.length && hit[0][2] > 0 ? `translateX(${Math.sin(t * 60) * 8 * Math.max(0, 1 - (t - hit[0][0]) * 1.5)}px)` : undefined}}>
            <div style={{position: 'absolute', top: 0, bottom: 0, [i === 1 ? 'left' : 'right']: 0, width: `${g}%`, background: '#fff', opacity: 0.85} as any} />
            <div style={{position: 'absolute', top: 0, bottom: 0, [i === 1 ? 'left' : 'right']: 0, width: `${v}%`, background: `repeating-linear-gradient(${i === 1 ? 45 : -45}deg, ${col}, ${col} 18px, ${shade(col)} 18px, ${shade(col)} 36px)`} as any} />
            <div style={{position: 'absolute', left: 0, right: 0, top: 4, height: 10, background: 'rgba(255,255,255,0.35)', borderRadius: 8}} />
          </div>
          <div style={{display: 'flex', flexDirection: i === 1 ? 'row' : 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, opacity: lerp(t, Dd.hud2 || 0, (Dd.hud2 || 0) + 0.4, 0, 1)}}>
            <div style={{...font, fontSize: 34, color: '#fff', textShadow: `3px 3px 0 ${INK}`}}>🪖 {fmt(Math.round((Dd.sold[i - 1] * v) / 100 + (v > 0 ? (Math.floor(t * 7) % 9) * 37 : 0)))}</div>
            <div style={{display: 'flex', gap: 2, fontSize: 30}}>{(Dd.powers as any[]).filter((p) => p.by === k && p.kind !== 'curse' && t > p.ts).map((p, j) => <span key={j} style={{filter: 'drop-shadow(2px 2px 0 #000)'}}>{p.emoji}</span>)}</div>
          </div>
          {(Dd.fire as any[] || []).filter((f) => f[2] === i && t >= f[0] && t < f[1]).map((f, j) => <div key={j} style={{position: 'absolute', top: -6, [i === 1 ? 'right' : 'left']: 90, transform: `scale(${popT(t, f[0], 10) * (1 + 0.06 * Math.sin(t * 12))}) rotate(${i === 1 ? 4 : -4}deg)`, background: 'linear-gradient(180deg,#ffe14d,#ff6a00)', border: `5px solid ${INK}`, borderRadius: 14, padding: '2px 12px 0', ...font, fontSize: 32, color: '#fff', textShadow: `3px 3px 0 ${INK}`} as any}>🔥 ON FIRE</div>)}
        </div>
        {((Dd.status || []) as any[]).filter((st) => st[2] === i && t >= st[0] && t < st[1]).slice(-1).map((st, j) => <div key={'st' + j} style={{position: 'absolute', top: 176, [i === 1 ? 'left' : 'right']: 130, transform: `scale(${popT(t, st[0], 10) * lerp(t, st[1] - 0.3, st[1], 1, 0)}) rotate(${i === 1 ? -2 : 2}deg)`, background: st[4], border: `5px solid ${INK}`, borderRadius: 16, padding: '4px 16px 0', ...font, fontSize: 34, color: '#fff', textShadow: `3px 3px 0 ${INK}`, whiteSpace: 'nowrap', boxShadow: `0 0 ${14 + 8 * Math.sin(t * 6)}px ${st[4]}`} as any}>{st[3]}</div>)}
        {i === 1 && Dd.explain && t >= Dd.explain && t < Dd.explain + 3.6 && <div style={{position: 'absolute', top: 178, left: 140, transform: `scale(${popT(t, Dd.explain, 10) * lerp(t, Dd.explain + 3.3, Dd.explain + 3.6, 1, 0)}) translateY(${Math.sin(t * 8) * 6}px)`, transformOrigin: 'left top', display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
          <div style={{...font, fontSize: 70, color: YELLOW, textShadow: `5px 5px 0 ${INK}`, lineHeight: 0.8, marginLeft: 60}}>⬆</div>
          <div style={{background: '#fff', border: `6px solid ${INK}`, borderRadius: 20, padding: '6px 20px 0', ...font, fontSize: 40, color: INK, whiteSpace: 'nowrap', boxShadow: '0 8px 0 rgba(0,0,0,0.4)'}}>THIS IS THEIR ARMY · <span style={{color: RED}}>0% = LOSE</span></div>
        </div>}
        {hit.map((h, j) => { const d = t - h[0]; return <div key={j} style={{position: 'absolute', [i === 1 ? 'left' : 'right']: 280, top: 70 + d * 60, opacity: lerp(d, 1.0, 1.6, 1, 0), transform: `scale(${popT(t, h[0], 12) * 1.2})`, ...font, fontSize: 72, color: h[2] > 0 ? '#ff3b3b' : '#4dff7a', textShadow: `5px 5px 0 ${INK}`} as any}>{h[2] > 0 ? `-${h[2]}%` : `+${-h[2]}%`}{Math.abs(h[2]) >= 5 && <div style={{fontSize: 34, color: '#fff'}}>{h[2] > 0 ? '-' : '+'}{fmt(Math.round(Math.abs(h[2]) * Dd.sold[i - 1] / 100))} SOLDIERS</div>}</div>; })}
      </div>
    );
  };
  const tm = (Dd.timers as any[]).find((x) => t >= x[0] && t < x[1] + 0.8);
  const rem = tm ? tm[1] - t : 0; const urgent = tm && rem <= 10 && rem > 0;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 18, zIndex: 34, opacity: a, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 20}}>
      {side(1)}
      <div style={{width: 230, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{...font, fontSize: 64, color: '#fff', textShadow: `5px 5px 0 ${INK}`, marginTop: 10}}>VS</div>
        {tm && rem > -0.8 && <div style={{marginTop: 6, background: urgent ? (Math.floor(t * 2) % 2 ? RED : '#8a1010') : 'rgba(14,20,32,0.92)', border: `5px solid ${INK}`, borderRadius: 18, padding: '6px 16px 0', textAlign: 'center', transform: `scale(${urgent ? 1 + 0.06 * Math.sin(t * 12) : 1})`}}>
          <div style={{...font2, fontSize: 22, color: YELLOW}}>{tm[2]}</div>
          <div style={{...font, fontSize: 64, color: '#fff', lineHeight: 1}}>{mmss(rem)}</div>
        </div>}
      </div>
      {side(2)}
      {tm && t - tm[0] < 1.6 && t >= tm[0] && <div style={{position: 'fixed', left: 0, right: 0, top: 300, textAlign: 'center', opacity: lerp(t - tm[0], 1.2, 1.6, 1, 0)}}><span style={{display: 'inline-block', transform: `scale(${popT(t, tm[0], 10)})`, background: 'rgba(14,20,32,0.92)', border: `8px solid ${YELLOW}`, borderRadius: 30, padding: '10px 40px 0', ...font, fontSize: 90, color: '#fff', textShadow: `6px 6px 0 ${INK}`}}>{tm[2]} <span style={{color: YELLOW}}>{mmss(tm[1] - tm[0])}</span></span></div>}
      {tm && rem <= 5 && rem > 0 && (() => { const n = Math.ceil(rem); const f = rem - Math.floor(rem); return <div style={{position: 'fixed', left: 0, right: 0, top: 175, textAlign: 'center', ...font, fontSize: 190, color: '#fff', opacity: (0.25 + 0.6 * f) * 0.85, transform: `scale(${1.25 - 0.25 * f})`, textShadow: `9px 9px 0 ${INK}, 0 0 50px ${RED}`}}>{n}</div>; })()}
    </div>
  );
};
const shade = (h: string) => { const n = parseInt(h.slice(1), 16); const r = (n >> 16) * 0.6, g = ((n >> 8) & 255) * 0.6, b = (n & 255) * 0.6; return `rgb(${r | 0},${g | 0},${b | 0})`; };
export const DWheel: React.FC<{items: string[]; cols: string[]; rot: number; R: number; cx: number; cy: number; fs?: number}> = ({items, cols, rot, R, cx, cy, fs = 40}) => {
  const n = items.length, seg = 360 / n;
  return (
    <g transform={`translate(${cx},${cy})`}>
      <circle r={R + 26} fill={INK} /><circle r={R + 16} fill="#ffd23f" />
      {Array.from({length: 24}).map((_, i) => <circle key={i} cx={Math.cos((i / 24) * Math.PI * 2) * (R + 21)} cy={Math.sin((i / 24) * Math.PI * 2) * (R + 21)} r={6} fill={i % 2 ? '#fff' : RED} />)}
      <g transform={`rotate(${rot})`}>
        {items.map((it, i) => {
          const a0 = ((i * seg - 90) * Math.PI) / 180, a1 = (((i + 1) * seg - 90) * Math.PI) / 180, am = (a0 + a1) / 2;
          return (
            <g key={i}>
              <path d={`M0,0 L${Math.cos(a0) * R},${Math.sin(a0) * R} A${R},${R} 0 0,1 ${Math.cos(a1) * R},${Math.sin(a1) * R} Z`} fill={cols[i % cols.length]} stroke={INK} strokeWidth={6} />
              <g transform={`translate(${Math.cos(am) * R * 0.58},${Math.sin(am) * R * 0.58}) rotate(${(am * 180) / Math.PI + (Math.cos(am) < 0 ? 180 : 0)})`}>
                <text textAnchor="middle" y={fs * 0.35} fontSize={fs} style={{fontFamily: 'Lilita'}} fill="#fff" stroke={INK} strokeWidth={7} paintOrder="stroke">{it}</text>
              </g>
            </g>
          );
        })}
      </g>
      <circle r={58} fill={CREAM} stroke={INK} strokeWidth={8} /><text textAnchor="middle" y={22} fontSize={60}>⚡</text>
      <path d={`M-34,${-R - 64} L34,${-R - 64} L0,${-R + 10} Z`} fill={RED} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    </g>
  );
};
const DuelSpin: React.FC<{t: number}> = ({t}) => {
  const Dd = X.D.duel; if (!Dd) return null;
  const r = (Dd.spins as any[]).find((x) => t >= x.t0 - 0.3 && t < x.t1 + 0.3); if (!r) return null;
  const a = lerp(t, r.t0 - 0.3, r.t0, 0, 1) * lerp(t, r.t1, r.t1 + 0.3, 1, 0);
  const n = r.items.length, seg = 360 / n; const spinEnd = r.t0 + (r.t1 - r.t0) * 0.66;
  const land = 360 - (r.pick * seg + seg / 2) + (hsh(r.t0) - 0.5) * seg * 0.5;
  let rot = 0;
  if (r.style === 'nearmiss') { const pre = 360 * 4 + land - seg * 0.55; const tp = r.t0 + (spinEnd - r.t0) * 0.82; rot = t < tp ? pre * lerp(t, r.t0 + 0.15, tp, 0, 1, Easing.out(Easing.cubic)) : pre + seg * 0.55 * lerp(t, tp + 0.25, spinEnd + 0.15, 0, 1, Easing.inOut(Easing.quad)); }
  else if (r.style === 'reverse') rot = -(360 * 5 + (360 - land)) * lerp(t, r.t0 + 0.15, spinEnd, 0, 1, Easing.out(Easing.cubic)) ;
  else rot = (360 * 5 + land) * lerp(t, r.t0 + 0.15, spinEnd, 0, 1, Easing.out(Easing.cubic));
  const done = t > spinEnd;
  const enter = popT(t, r.t0 - 0.2, 10);
  return (
    <AbsoluteFill style={{zIndex: 42, background: `radial-gradient(circle at 50% 58%, rgba(10,14,30,${0.35 * a}) 20%, rgba(4,6,14,${0.8 * a}) 75%)`, opacity: a}}>
      <div style={{position: 'absolute', top: 205, left: 0, right: 0, textAlign: 'center', ...font, fontSize: 76, color: YELLOW, textShadow: `6px 6px 0 ${INK}`, transform: `scale(${enter})`}}>{r.title}</div>
      {r.sub && <div style={{position: 'absolute', top: 292, left: 0, right: 0, textAlign: 'center', ...font, fontSize: 44, color: '#ff6b6b', textShadow: `4px 4px 0 ${INK}`, transform: `scale(${1 + 0.03 * Math.sin(t * 8)})`}}>{r.sub}</div>}
      {r.style === 'nearmiss' && t > r.t0 + (r.t1 - r.t0) * 0.66 * 0.8 && t < r.t0 + (r.t1 - r.t0) * 0.66 + 0.2 && <div style={{position: 'absolute', top: 640, left: 0, right: 0, textAlign: 'center', ...font, fontSize: 120, color: YELLOW, textShadow: `8px 8px 0 ${INK}`, transform: `rotate(-6deg) scale(${1 + 0.1 * Math.sin(t * 20)})`}}>WAIT... 😱</div>}
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, transform: `scale(${enter})`, transformOrigin: '960px 690px'}}><DWheel items={r.items} cols={r.cols} rot={rot} R={300} cx={960} cy={690} fs={r.fs || 40} /></svg>
      {done && <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: `scale(${popT(t, spinEnd, 9) * (1 + 0.04 * Math.sin(t * 10))}) rotate(-2deg)`, background: r.rcol || YELLOW, border: `9px solid ${INK}`, borderRadius: 30, padding: '14px 46px 6px', ...font, fontSize: 96, color: r.rtext || INK, textAlign: 'center', boxShadow: '0 14px 0 rgba(0,0,0,0.45)'}}>{r.result}</div>
      </div>}
    </AbsoluteFill>
  );
};
const KIND_TINT: Record<string, string> = {freeze: 'rgba(120,200,255,0.30)', volcano: 'rgba(255,80,0,0.22)', lightning: 'rgba(20,10,60,0.35)', quake: 'rgba(90,60,20,0.18)', curse: 'rgba(80,0,120,0.30)', laser: 'rgba(255,40,60,0.18)', tsunami: 'rgba(0,80,200,0.18)', tornado: 'rgba(60,60,60,0.22)', meteor: 'rgba(255,120,0,0.15)', clones: 'rgba(255,255,255,0)'};
const PowerBanner: React.FC<{t: number}> = ({t}) => {
  const Dd = X.D.duel; if (!Dd) return null;
  const p = (Dd.powers as any[]).find((x) => t >= x.t0 && t < x.t1 + 0.4); const out: React.ReactNode[] = [];
  if (p) {
    const d = t - p.t0; const tint = KIND_TINT[p.kind] || 'transparent';
    const ta = lerp(t, p.t0, p.t0 + 0.4, 0, 1) * lerp(t, p.t1 - 0.6, p.t1 + 0.4, 1, 0);
    out.push(<AbsoluteFill key="tint" style={{zIndex: 14, background: p.kind === 'freeze' ? `radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(150,220,255,${0.75 * ta}) 100%)` : tint, opacity: ta * (p.kind === 'lightning' ? (Math.floor(t * 14) % 5 === 0 ? 0.3 : 1) : 1), pointerEvents: 'none'}} />);
    if (p.kind === 'freeze') for (let i = 0; i < 70; i++) { const x = hsh(i) * 1920 + Math.sin(t * 1.5 + i) * 30; const y = ((hsh(i + 9) * 1200 + d * (80 + hsh(i + 3) * 120)) % 1200) - 60; out.push(<div key={'s' + i} style={{position: 'absolute', left: x, top: y, fontSize: 18 + hsh(i + 5) * 26, opacity: 0.85 * ta, zIndex: 15, color: '#fff'}}>❄</div>); }
    if (d < 2.6) {
      const k = popT(t, p.t0 + 0.05, 9); const fa = lerp(d, 2.1, 2.6, 1, 0);
      out.push(
        <div key="bn" style={{position: 'absolute', left: 0, right: 0, top: 300, zIndex: 41, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: fa}}>
          <div style={{fontSize: 170, transform: `scale(${k}) rotate(${Math.sin(t * 9) * 6}deg)`, filter: 'drop-shadow(0 10px 0 rgba(0,0,0,0.5))'}}>{p.emoji}</div>
          <div style={{transform: `scale(${k})`, background: p.col, border: `9px solid ${INK}`, borderRadius: 28, padding: '10px 44px 2px', ...font, fontSize: 104, color: '#fff', textShadow: `6px 6px 0 ${INK}`, boxShadow: '0 14px 0 rgba(0,0,0,0.5)'}}>{p.name}{p.mult > 1 ? ' x2' : ''}</div>
          <div style={{marginTop: 14, ...font, fontSize: 46, color: '#fff', textShadow: `4px 4px 0 ${INK}`}}>{p.sub}</div>
        </div>,
      );
    }
  }
  for (const c of Dd.combos as any[]) { const d = t - c[0]; if (d < 0 || d > 2.6) continue; out.push(
    <div key={'cb' + c[0]} style={{position: 'absolute', left: 0, right: 0, top: 360, zIndex: 43, display: 'flex', justifyContent: 'center', opacity: lerp(d, 2.1, 2.6, 1, 0)}}>
      <div style={{transform: `scale(${popT(t, c[0], 10) * (1 + 0.05 * Math.sin(t * 16))}) rotate(-4deg)`, background: 'linear-gradient(180deg, #ffe14d, #ff6a00 55%, #d4110e)', border: `10px solid ${INK}`, borderRadius: 34, padding: '16px 60px 4px', ...font, fontSize: 150, color: '#fff', textShadow: `8px 8px 0 ${INK}`, boxShadow: '0 0 80px 20px rgba(255,120,0,0.7)'}}>🔥 COMBO x2 🔥</div>
    </div>); }
  for (const c of Dd.curses as any[]) { const d = t - c[0]; if (d < 0 || d > 3.4) continue; out.push(
    <AbsoluteFill key={'cu' + c[0]} style={{zIndex: 43, background: `rgba(60,0,90,${0.45 * lerp(d, 0, 0.3, 0, 1) * lerp(d, 2.8, 3.4, 1, 0)})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: lerp(d, 2.8, 3.4, 1, 0)}}>
      <div style={{fontSize: 220, transform: `scale(${popT(t, c[0], 8)}) translateY(${Math.sin(t * 6) * 10}px)`}}>💀</div>
      <div style={{transform: `scale(${popT(t, c[0] + 0.2, 9)})`, background: '#5b1a8f', border: `9px solid ${INK}`, borderRadius: 28, padding: '10px 44px 2px', ...font, fontSize: 96, color: '#fff', textShadow: `6px 6px 0 ${INK}`}}>CURSE!</div>
      <div style={{marginTop: 16, ...font, fontSize: 50, color: '#fff', textShadow: `4px 4px 0 ${INK}`}}>{c[2]}</div>
    </AbsoluteFill>); }
  for (const c of Dd.chests as any[]) { const d = t - c.topen; if (d < 0 || d > 3.2) continue; out.push(
    <div key={'ch' + c.t0} style={{position: 'absolute', left: 0, right: 0, bottom: 150, zIndex: 41, display: 'flex', justifyContent: 'center', opacity: lerp(d, 2.7, 3.2, 1, 0)}}>
      <div style={{transform: `scale(${popT(t, c.topen, 10)})`, display: 'flex', alignItems: 'center', gap: 20, background: c.good ? '#1f9e55' : '#c81e1e', border: `8px solid ${INK}`, borderRadius: 26, padding: '10px 34px 4px', boxShadow: '0 12px 0 rgba(0,0,0,0.45)'}}>
        <span style={{fontSize: 90}}>{c.icon}</span><span style={{...font, fontSize: 70, color: '#fff', textShadow: `5px 5px 0 ${INK}`}}>{c.text}</span>
      </div>
    </div>); }
  const hk = Dd.hook; if (t < hk[1] + 0.4) {
    const ha = lerp(t, hk[1] - 0.4, hk[1] + 0.4, 1, 0);
    out.push(
      <AbsoluteFill key="hook" style={{zIndex: 44, background: `rgba(5,8,18,${0.55 * ha})`, opacity: ha, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
        <div style={{...font, fontSize: 120, color: '#fff', textShadow: `8px 8px 0 ${INK}`, marginBottom: 10, transform: `scale(${popT(t, 0.1, 9)})`}}>INDIA <span style={{color: YELLOW}}>vs</span> INDONESIA</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 40}}>
          <div style={{position: 'relative', transform: `translateX(${lerp(t, 0, 0.5, -600, 0, Easing.out(Easing.back(1.4)))}px)`}}><Ball k={Dd.a} size={220} mood="angry" t={t} look={[1, 0]} />{((Dd.hookLines || []) as any[]).filter((h) => h[1] === 'a' && t >= h[0]).map((h, j) => <div key={j} style={{position: 'absolute', top: 50, right: '100%', marginRight: 24, transform: `scale(${popT(t, h[0], 11)})`, transformOrigin: 'right center', background: '#fff', border: `6px solid ${INK}`, borderRadius: 24, padding: '8px 22px 2px', ...font, fontSize: 42, color: INK, whiteSpace: 'nowrap', boxShadow: '0 8px 0 rgba(0,0,0,0.45)'} as any}>{h[2]}</div>)}</div>
          <div style={{...font, fontSize: 150, color: '#fff', textShadow: `8px 8px 0 ${INK}`, transform: `scale(${popT(t, 0.45, 9)})`}}>VS</div>
          <div style={{position: 'relative', transform: `translateX(${lerp(t, 0, 0.5, 600, 0, Easing.out(Easing.back(1.4)))}px)`}}><Ball k={Dd.b} size={220} mood="angry" t={t} look={[-1, 0]} />{((Dd.hookLines || []) as any[]).filter((h) => h[1] === 'b' && t >= h[0]).map((h, j) => <div key={j} style={{position: 'absolute', top: 50, left: '100%', marginLeft: 24, transform: `scale(${popT(t, h[0], 11)})`, transformOrigin: 'left center', background: '#fff', border: `6px solid ${INK}`, borderRadius: 24, padding: '8px 22px 2px', ...font, fontSize: 42, color: INK, whiteSpace: 'nowrap', boxShadow: '0 8px 0 rgba(0,0,0,0.45)'} as any}>{h[2]}</div>)}</div>
        </div>
        <div style={{marginTop: 30, transform: `scale(${popT(t, 0.8, 9)}) rotate(-2deg)`, background: YELLOW, border: `9px solid ${INK}`, borderRadius: 28, padding: '10px 50px 2px', ...font, fontSize: 84, color: INK}}>BUT WITH SUPERPOWERS ⚡</div>
        <div style={{marginTop: 22, ...font, fontSize: 44, color: '#fff', textShadow: `4px 4px 0 ${INK}`, opacity: lerp(t, 1.4, 1.8, 0, 1)}}>ONLY ONE ARMY SURVIVES · GUESS WHO IN THE COMMENTS 👇</div>
      </AbsoluteFill>,
    );
  }
  return <>{out}</>;
};
// efectos de poderes sobre el mapa
const bolt = (x0: number, y0: number, x1: number, y1: number, seed: number) => {
  const pts: string[] = []; const n = 10;
  for (let i = 0; i <= n; i++) { const f = i / n; const j = i === 0 || i === n ? 0 : (hsh(seed * 31 + i) - 0.5) * 90 * (1 - f * 0.5); pts.push(`${x0 + (x1 - x0) * f + j},${y0 + (y1 - y0) * f}`); }
  return pts.join(' ');
};

// ================= Battle royale de ruletas (wbr) =================
const wbrSeg = (w: number[]) => { const tot = w.reduce((a, b) => a + b, 0); let acc = 0; return w.map((x) => { const a0 = (acc / tot) * 360; acc += x; return [a0, (acc / tot) * 360]; }); };
const WWheel: React.FC<{items: string[]; w: number[]; cols: string[]; rot: number; R: number; cx: number; cy: number; fs: number; pct?: boolean}> = ({items, w, cols, rot, R, cx, cy, fs, pct}) => {
  const sg = wbrSeg(w); const tot = w.reduce((a, b) => a + b, 0);
  return (
    <g transform={`translate(${cx},${cy})`}>
      <circle r={R + 24} fill={INK} /><circle r={R + 14} fill="#ffd23f" />
      {Array.from({length: 24}).map((_, i) => <circle key={i} cx={Math.cos((i / 24) * Math.PI * 2) * (R + 19)} cy={Math.sin((i / 24) * Math.PI * 2) * (R + 19)} r={5} fill={i % 2 ? '#fff' : RED} />)}
      <g transform={`rotate(${rot})`}>
        {sg.map(([d0, d1], i) => {
          const a0 = ((d0 - 90) * Math.PI) / 180, a1 = ((d1 - 90) * Math.PI) / 180, am = (a0 + a1) / 2; const big = d1 - d0 > 180 ? 1 : 0;
          const span = d1 - d0; const f = Math.min(fs, fs * Math.max(0.55, span / 70));
          return (
            <g key={i}>
              <path d={`M0,0 L${Math.cos(a0) * R},${Math.sin(a0) * R} A${R},${R} 0 ${big},1 ${Math.cos(a1) * R},${Math.sin(a1) * R} Z`} fill={cols[i % cols.length]} stroke={INK} strokeWidth={5} />
              <g transform={`translate(${Math.cos(am) * R * 0.6},${Math.sin(am) * R * 0.6}) rotate(${(am * 180) / Math.PI + (Math.cos(am) < 0 ? 180 : 0)})`}>
                <text textAnchor="middle" y={f * 0.35} fontSize={f} style={{fontFamily: 'Lilita'}} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">{items[i].length > 13 ? items[i].slice(0, 12) + '.' : items[i]}</text>
                {pct && <text textAnchor="middle" y={f * 0.35 + f * 0.95} fontSize={f * 0.75} style={{fontFamily: 'Lilita'}} fill="#ffe680" stroke={INK} strokeWidth={5} paintOrder="stroke">{Math.round((w[i] / tot) * 100)}%</text>}
              </g>
            </g>
          );
        })}
      </g>
      <circle r={42} fill={INK} /><circle r={34} fill="#ffd23f" /><text textAnchor="middle" y={13} fontSize={34} style={{fontFamily: 'Lilita'}} fill={INK}>VS</text>
      <path d={`M-26,${-R - 52} L26,${-R - 52} L0,${-R + 8} Z`} fill="#ff5fa2" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    </g>
  );
};
const wbrRot = (r: any, t: number) => {
  const sg = wbrSeg(r.w); const [a0, a1] = sg[r.pick]; const span = a1 - a0; const se = r.t0 + (r.t1 - r.t0) * 0.66;
  if (r.style === 'nearmiss') {
    const a = a1 - 0.07 * span; const target = 360 * 5 + 360 - a; const pre = target - 0.2 * span - 6; const tp = r.t0 + (se - r.t0) * 0.82;
    return t < tp ? pre * lerp(t, r.t0 + 0.1, tp, 0, 1, Easing.out(Easing.cubic)) : pre + (target - pre) * lerp(t, tp + 0.3, se, 0, 1, Easing.inOut(Easing.quad));
  }
  const a = a0 + span * (0.25 + 0.5 * ((r.t0 * 7.3 * 1.618) % 1)); return (360 * 5 + 360 - a) * lerp(t, r.t0 + 0.1, se, 0, 1, Easing.out(Easing.cubic));
};
const WbrHud: React.FC<{t: number}> = ({t}) => {
  const WB = X.D.wbr; if (!WB) return null; const out: React.ReactNode[] = [];
  const S_ = SHORT; const CX = VW / 2;
  // selector tipo tragaperras
  const s = (WB.sel as any[]).find((x) => t >= x[0] - 0.25 && t < x[1] + 0.35);
  if (s) {
    const [t0, t1, lst, pick, n] = s; const a = lerp(t, t0 - 0.25, t0 + 0.1, 0, 1) * lerp(t, t1, t1 + 0.35, 1, 0);
    const p = pick * lerp(t, t0 + 0.1, t1 - 0.7, 0, 1, Easing.out(Easing.cubic)); const base = Math.floor(p); const fr = p - base; const rh = S_ ? 92 : 76; const done = t > t1 - 0.7;
    const W_ = S_ ? 760 : 600;
    out.push(<AbsoluteFill key="sel" style={{zIndex: 41, background: `rgba(4,8,18,${0.45 * a})`, opacity: a}}>
      <div style={{position: 'absolute', left: CX - W_ / 2, top: VH / 2 - rh * 3.1, width: W_, height: rh * 5 + 70, background: 'linear-gradient(180deg,#141b2e,#0b101d)', border: '6px solid #ffd23f', borderRadius: 28, boxShadow: '0 0 40px rgba(255,210,63,0.45), 0 14px 0 rgba(0,0,0,0.5)', overflow: 'hidden', transform: `scale(${popT(t, t0 - 0.2, 12)})`}}>
        <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 52, background: '#ffd23f', display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: S_ ? 32 : 26, color: INK}}>🎲 SELECTION POOL · {n} {X.D.unitPl || 'COUNTRIES'}</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 60, height: rh * 5, overflow: 'hidden'}}>
          {[-3, -2, -1, 0, 1, 2, 3].map((d) => { const i = base + d; if (i < 0 || i >= lst.length) return null; const y = (d - fr + 2) * rh; const ctr = Math.abs(d - fr) < 0.5;
            return <div key={i} style={{position: 'absolute', left: 18, right: 18, top: y + 4, height: rh - 8, display: 'flex', alignItems: 'center', gap: 16, padding: '0 18px', borderRadius: 14, background: ctr ? (done ? 'rgba(255,210,63,0.95)' : 'rgba(255,255,255,0.14)') : 'rgba(255,255,255,0.05)', opacity: 1 - Math.min(0.75, Math.abs(d - fr) * 0.3)}}>
              <FlagImg k={lst[i]} w={S_ ? 74 : 60} h={S_ ? 50 : 40} /><span style={{...font, fontSize: S_ ? 46 : 38, color: ctr && done ? INK : '#fff', whiteSpace: 'nowrap'}}>{SNAME(lst[i])}</span></div>; })}
          <div style={{position: 'absolute', left: 10, right: 10, top: rh * 2, height: rh, border: '5px solid #ffd23f', borderRadius: 16, boxShadow: '0 0 24px #ffd23f'}} />
        </div>
      </div>
      {done && <div style={{position: 'absolute', left: 0, right: 0, top: VH / 2 + rh * 2.4 + 40, display: 'flex', justifyContent: 'center'}}><div style={{transform: `scale(${popT(t, t1 - 0.7, 9)})`, background: INK, border: '5px solid #ffd23f', borderRadius: 20, padding: '8px 26px 2px', ...font, fontSize: S_ ? 48 : 40, color: '#ffd23f', display: 'flex', alignItems: 'center', gap: 14}}><FlagImg k={lst[pick]} w={56} h={38} />SELECTED: {SNAME(lst[pick])}</div></div>}
    </AbsoluteFill>);
  }
  // ruleta activa
  const r = (WB.wheels as any[]).find((x) => x.kind !== 'duel' && x.kind !== 'tb' && t >= x.t0 - 0.25 && t < x.t1 + 0.3);
  if (r) {
    const a = lerp(t, r.t0 - 0.25, r.t0 + 0.05, 0, 1) * lerp(t, r.t1, r.t1 + 0.3, 1, 0); const se = r.t0 + (r.t1 - r.t0) * 0.66;
    const R = S_ ? 300 : r.kind === 'war' ? 250 : 235; const cx = S_ ? CX : VW - 400; const cy = S_ ? VH - 640 : 590;
    const nm = r.style === 'nearmiss' && t > r.t0 + (se - r.t0) * 0.8 && t < se + 0.15;
    out.push(<div key="wh" style={{position: 'absolute', inset: 0, zIndex: 40, opacity: a, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: cx - 340, width: 680, top: cy - R - 128, textAlign: 'center', ...font, fontSize: S_ ? 56 : 44, color: '#fff', textShadow: `4px 4px 0 ${INK}`}}>{r.title}</div>
      <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0, transform: `scale(${popT(t, r.t0 - 0.25, 12)})`, transformOrigin: `${cx}px ${cy}px`}}><WWheel items={r.items} w={r.w} cols={r.cols} rot={wbrRot(r, t)} R={R} cx={cx} cy={cy} fs={r.kind === 'war' ? 34 : 30} pct={r.kind === 'war'} /></svg>
      {nm && <div style={{position: 'absolute', left: cx - 300, width: 600, top: cy - 60, textAlign: 'center', ...font, fontSize: 96, color: YELLOW, textShadow: `7px 7px 0 ${INK}`, transform: `rotate(-6deg) scale(${1 + 0.1 * Math.sin(t * 20)})`}}>WAIT... 😱</div>}
      {t > se && <div style={{position: 'absolute', left: cx - 420, width: 840, top: cy + R + 40, display: 'flex', justifyContent: 'center'}}><div style={{transform: `scale(${popT(t, se, 9)})`, background: r.rcol || YELLOW, border: `7px solid ${INK}`, borderRadius: 22, padding: '8px 28px 2px', ...font, fontSize: S_ ? 58 : 46, color: r.kind === 'war' ? INK : '#fff', textShadow: r.kind === 'war' ? 'none' : `3px 3px 0 ${INK}`, whiteSpace: 'nowrap', boxShadow: '0 10px 0 rgba(0,0,0,0.4)'}}>{r.result}</div></div>}
    </div>);
  }
  // cabecera
  const h = [...(WB.hdr as any[])].reverse().find((x) => t >= x.t0 && t < x.t1);
  if (h) {
    const a = popT(t, h.t0, 13); const top = S_ ? 250 : 16;
    let body: React.ReactNode = null;
    if (h.kind === 'vs') {
      const v = WB.vs[h.i]; const fa = v.fa; const se = v.t0 + 0.3 + (v.t1 - v.t0 - 0.5) * 0.66; const fin = t > se;
      body = (<div style={{width: S_ ? 1000 : 1020, background: 'rgba(12,16,28,0.94)', border: '5px solid #fff', borderRadius: 24, padding: '8px 18px 10px'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...font, color: '#fff'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>{(v.a as number[]).map((k) => <FlagImg key={k} k={k} w={52} h={36} />)}<div><div style={{fontSize: 36, lineHeight: 1}}>{v.an}</div><div style={{...font2, fontSize: 18, color: '#ffd23f'}}>{fmt(v.pa)} POWER</div></div></div>
          <div style={{width: 64, height: 64, borderRadius: 32, background: '#ff5fa2', border: `5px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: '#fff', transform: `scale(${1 + 0.08 * Math.sin(t * 8)})`}}>VS</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, flexDirection: 'row-reverse', textAlign: 'right'}}>{(v.b as number[]).map((k) => <FlagImg key={k} k={k} w={52} h={36} />)}<div><div style={{fontSize: 36, lineHeight: 1}}>{v.bn}</div><div style={{...font2, fontSize: 18, color: '#ffd23f'}}>{fmt(v.pb)} POWER</div></div></div>
        </div>
        <div style={{marginTop: 8, height: 30, borderRadius: 15, overflow: 'hidden', display: 'flex', border: `4px solid ${INK}`, ...font, fontSize: 20, color: '#fff'}}>
          <div style={{width: `${fa * 100}%`, background: fin && v.win === 1 ? '#7a2020' : '#e5322d', paddingLeft: 10, display: 'flex', alignItems: 'center'}}>{Math.round(fa * 100)}% WIN</div>
          <div style={{flex: 1, background: fin && v.win === 0 ? '#183a7a' : '#1f6fe0', paddingRight: 10, display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>{Math.round((1 - fa) * 100)}% WIN</div>
        </div>
        {h.spin && <div style={{textAlign: 'center', ...font, fontSize: 26, color: '#ffd23f', marginTop: 4}}>SPIN {h.spin} OF 3 · SCORE {h.score[0]} - {h.score[1]}</div>}
      </div>);
    } else if (h.kind === 'win') {
      body = (<div style={{display: 'flex', alignItems: 'center', gap: 18, background: 'linear-gradient(180deg,#ffe680,#ffb800)', border: `6px solid ${INK}`, borderRadius: 24, padding: '8px 26px 4px', boxShadow: '0 0 40px rgba(255,200,40,0.7)'}}>
        <FlagImg k={h.lk} w={64} h={44} style={{filter: 'grayscale(1)', opacity: 0.7}} />
        <div style={{textAlign: 'center'}}><div style={{...font, fontSize: S_ ? 54 : 50, color: INK, lineHeight: 1}}>🏆 {h.text}</div><div style={{...font2, fontSize: 22, color: INK}}>{h.sub}</div></div>
        <FlagImg k={h.k} w={64} h={44} /></div>);
    } else {
      body = (<div style={{display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(12,16,28,0.94)', border: `5px solid ${h.col || '#ffd23f'}`, borderRadius: 24, padding: '8px 26px 4px', maxWidth: VW - 60}}>
        {h.k !== undefined && <FlagImg k={h.k} w={60} h={40} />}
        <div><div style={{...font, fontSize: S_ ? 46 : 40, color: h.kind === 'event' ? '#fff' : '#ffd23f', lineHeight: 1.05, whiteSpace: 'nowrap'}}>{h.text}</div>{h.sub && <div style={{...font2, fontSize: S_ ? 26 : 22, color: '#cfd6e6'}}>{h.sub}</div>}</div></div>);
    }
    out.push(<div key="hdr" style={{position: 'absolute', left: 0, right: 0, top, zIndex: 39, display: 'flex', justifyContent: 'center', transform: `translateY(${(1 - a) * -60}px)`, opacity: a}}>{body}</div>);
  }
  // reglas
  for (const [r0, r1, rows] of (WB.rules || []) as any[]) {
    if (t < r0 - 0.2 || t > r1 + 0.3) continue; const a = lerp(t, r1, r1 + 0.3, 1, 0);
    out.push(<div key="rules" style={{position: 'absolute', left: 0, right: 0, bottom: S_ ? 300 : 70, zIndex: 45, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, opacity: a, padding: '0 20px'}}>
      {(rows as string[][]).map(([ic, tx], i) => { const ti = r0 + i * 0.45; if (t < ti) return null; return (
        <div key={i} style={{transform: `scale(${popT(t, ti, 11)}) rotate(${i % 2 ? 1.5 : -1.5}deg)`, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: `5px solid ${INK}`, borderRadius: 20, padding: '5px 14px 1px', boxShadow: '0 8px 0 rgba(0,0,0,0.4)'}}>
          <span style={{width: 40, height: 40, borderRadius: 20, background: INK, color: YELLOW, ...font, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</span>
          <span style={{fontSize: 32}}>{ic}</span><span style={{...font, fontSize: 30, color: INK, whiteSpace: 'nowrap'}}>{tx}</span>
        </div>); })}
    </div>);
  }
  return <>{out}</>;
};

// ================= Duelos al mejor de 5 (dbr) =================
const DCATS = [['🪖', 'ARMY'], ['✈️', 'AIR FORCE'], ['⚓', 'NAVY'], ['🚀', 'MISSILES'], ['🛡️', 'TANKS'], ['💣', 'ARTILLERY'], ['🛸', 'DRONES'], ['🚁', 'HELICOPTERS'], ['🪂', 'PARATROOPERS']];
const DCATS5 = [['🪖', 'ARMY'], ['✈️', 'AIR FORCE'], ['⚓', 'NAVY'], ['🚀', 'MISSILES'], ['🎖️', 'ELITE']];
const TBN = [['👑', 'KING OF THE HILL', 'TIME IN THE ZONE'], ['🚩', 'CAPTURE THE FLAG', 'FLAG CARRIED HOME'], ['🎯', 'ELITE SHOOTOUT', 'ELITE SOLDIERS LEFT'], ['🏛️', 'CAPITAL RUSH', 'CAPITAL HP']];
const DATK = ['GROUND ASSAULT!', 'AIR STRIKE!', 'NAVAL STRIKE!', 'MISSILE BARRAGE!', 'TANK ASSAULT!', 'ARTILLERY BARRAGE!', 'DRONE SWARM!', 'HELICOPTER RAID!', 'AIRBORNE ASSAULT!'];
const kfHP = (hp: any[], t: number, side: number) => { let prev = 100, cur = 100, t0 = -1e9; for (const k of hp) { if (t < k[0]) break; prev = cur; cur = k[1 + side]; t0 = k[0]; } return {v: prev + (cur - prev) * Math.min(1, Math.max(0, (t - t0) / 1.0)), prev, cur, t0}; };
const DbrHud: React.FC<{t: number}> = ({t}) => {
  const DB = X.D.dbr; if (!DB) return null; const out: React.ReactNode[] = [];
  const d = (DB.duels as any[]).find((x) => t >= x.t0 - 0.2 && t < x.t1 + 0.3);
  if (d) {
    const S_ = SHORT;
    const a = lerp(t, d.t0 - 0.2, d.t0 + 0.25, 0, 1) * lerp(t, d.t1, d.t1 + 0.3, 1, 0);
    const cntF = lerp(t, d.cnt[0] + 0.1, d.cnt[1] - 0.2, 0, 1, Easing.out(Easing.quad));
    const sp = (d.spins as any[]); const done = sp.filter((x) => t >= x.atk[0] + (x.final ? 4.2 : 1.0));
    const lostA = done.filter((x) => !x.wa).length, lostB = done.filter((x) => x.wa).length;
    const cur = [...sp].reverse().find((x) => t >= x.t0);
    const sc = cur && t >= cur.se ? cur.sc : (done.length ? done[done.length - 1].sc : [0, 0]);
    const hpOf = (lost: number, side: number) => { const fin = sp.find((x) => x.final); let h = 1 - lost / 3;
      if (fin && ((side === 0 && !fin.wa) || (side === 1 && fin.wa)) && t > fin.atk[0]) h = Math.min(h, lerp(t, fin.atk[0] + 0.5, fin.atk[1] - 0.6, 1 / 3, 0)); return Math.max(0, h); };
    const last = done.length ? done[done.length - 1] : null;
    // barras de vida grandes arriba
    const hpBar = (side: number) => {
      const k = side === 0 ? d.a : d.b; const nm = side === 0 ? d.an : d.bn; const H = d.hp ? kfHP(d.hp, t, side) : null; const hp = H ? H.v / 100 : hpOf(side === 0 ? lostA : lostB, side); const ghost = H ? Math.max(hp, (H.prev - (H.prev - H.cur) * Math.min(1, Math.max(0, (t - H.t0 - 0.9) / 0.5))) / 100) : hp; const col = side === 0 ? '#e5322d' : '#1f6fe0';
      const fur = (d.fury || []).find((f: any) => f[1] === side && t >= f[0]);
      const hit = H ? (t - H.t0 < 1.0 && t > H.t0 && H.cur < H.prev) : (last && t - last.atk[0] < 1.6 && t > last.atk[0] && ((last.wa ? 1 : 0) === side));
      const W_ = S_ ? (VW - 210) / 2 : VW / 2 - 200;
      return (
        <div style={{width: W_, flexShrink: 0, display: 'flex', flexDirection: side === 0 ? 'row' : 'row-reverse', alignItems: 'center', gap: 10, transform: `translateX(${hit ? Math.sin(t * 60) * 8 : 0}px)`}}>
          <FlagImg k={k} w={S_ ? 70 : 84} h={S_ ? 48 : 58} />
          <div style={{flex: 1}}>
            <div style={{...font, fontSize: S_ ? 30 : 40, color: '#fff', textShadow: `3px 3px 0 ${INK}`, textAlign: side === 0 ? 'left' : 'right', lineHeight: 1, whiteSpace: 'nowrap'}}>{nm}{fur && <span style={{marginLeft: 12, marginRight: 12, fontSize: S_ ? 24 : 28, color: '#ff8a1f', display: 'inline-block', transform: `scale(${popT(t, fur[0], 9) * (1 + 0.06 * Math.sin(t * 10))})`}}>🔥 FURY +15%</span>}</div>
            <div style={{marginTop: 4, height: S_ ? 38 : 46, background: '#2a0f12', border: `5px solid ${INK}`, borderRadius: 24, overflow: 'hidden', position: 'relative', display: 'flex', justifyContent: side === 0 ? 'flex-start' : 'flex-end', boxShadow: hit ? '0 0 30px 8px #ff2020' : `0 0 16px ${col}`}}>
              <div style={{position: 'absolute', top: 0, bottom: 0, [side === 0 ? 'left' : 'right']: 0, width: `${ghost * 100}%`, background: '#fff8', zIndex: 0} as any} />
              <div style={{position: 'relative', zIndex: 1, width: `${hp * 100}%`, background: hp > 0.5 ? 'linear-gradient(180deg,#5dff8a,#1fa64a)' : hp > 0.2 ? 'linear-gradient(180deg,#ffe14d,#e0a400)' : 'linear-gradient(180deg,#ff6b6b,#c41e1e)'}} />
              <div style={{position: 'absolute', left: 0, right: 0, top: 6, height: 8, margin: '0 14px', borderRadius: 4, background: 'rgba(255,255,255,0.3)'}} />
              <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: S_ ? 24 : 28, color: '#fff', textShadow: `3px 3px 0 ${INK}`}}>❤️ {Math.round(hp * 100)}%</div>
            </div>
          </div>
        </div>);
    };
    const tied = sc[0] === 2 && sc[1] === 2;
    out.push(<div key="top" style={{position: 'absolute', top: S_ ? 230 : 14, left: 0, width: VW, height: 130, zIndex: 38, opacity: a, transform: `translateY(${(1 - a) * -80}px)`}}>
      <div style={{position: 'absolute', left: 16, top: 0}}>{hpBar(0)}</div><div style={{position: 'absolute', right: 16, top: 0}}>{hpBar(1)}</div>
      <div style={{position: 'absolute', left: VW / 2 - (S_ ? 90 : 115), top: 0, width: S_ ? 180 : 230, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(10,14,26,0.94)', border: '5px solid #fff', borderRadius: 22, padding: '2px 18px 0'}}>
          <span style={{...font, fontSize: S_ ? 50 : 60, color: '#ff6b6b'}}>{sc[0]}</span><span style={{...font, fontSize: 36, color: '#fff'}}>-</span><span style={{...font, fontSize: S_ ? 50 : 60, color: '#6ba8ff'}}>{sc[1]}</span>
        </div>
        <div style={{display: 'flex', gap: 4, marginTop: 6}}>{Array.from({length: d.ncat || 5}, (_, i) => i).map((i) => { const s_ = sp.find((x) => x.cat === i && t >= x.se); return <div key={i} style={{width: S_ ? 28 : 34, height: S_ ? 28 : 34, borderRadius: 17, border: `4px solid ${INK}`, background: s_ ? (s_.wa ? '#e5322d' : '#1f6fe0') : 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: S_ ? 13 : 16}}>{DCATS[i][0]}</div>; })}</div>
      </div>
    </div>);
    out.push(<div key="sub" style={{position: 'absolute', top: S_ ? 360 : 112, left: 0, right: 0, zIndex: 38, opacity: a, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      {d.title && <div style={{...font, fontSize: S_ ? 36 : 32, color: '#ffd23f', textShadow: `3px 3px 0 ${INK}`}}>{d.title}</div>}
      {cur && cur.cat >= 0 && t < cur.atk[1] && <div style={{...font, fontSize: S_ ? 32 : 28, color: '#fff', textShadow: `3px 3px 0 ${INK}`}}>ROUND {cur.cat + 1} · {DCATS[cur.cat][0]} {DCATS[cur.cat][1]}</div>}
      {tied && !d.tb && !(cur && cur.final && t > cur.se) && <div style={{marginTop: 4, ...font, fontSize: S_ ? 50 : 44, color: '#ff3b3b', textShadow: `4px 4px 0 ${INK}`, transform: `scale(${1 + 0.06 * Math.sin(t * 9)})`}}>2 - 2 · SUDDEN DEATH!</div>}
    </div>);
    // paneles laterales: solo stats + poder total
    const panel = (side: number) => {
      const st = side === 0 ? d.sa : d.sb; const ot = side === 0 ? d.sb : d.sa; const col = side === 0 ? '#e5322d' : '#1f6fe0';
      const tot = Math.round(st.reduce((x: number, y: number) => x + y, 0) * cntF);
      const pos: any = S_ ? {bottom: 230, [side === 0 ? 'left' : 'right']: 12 + (1 - a) * -520, width: VW / 2 - 24} : {top: 160, [side === 0 ? 'left' : 'right']: 16 + (1 - a) * -420, width: 340};
      return (
        <div style={{position: 'absolute', ...pos, zIndex: 38, background: 'linear-gradient(180deg,rgba(18,24,40,0.93),rgba(10,14,26,0.93))', border: `5px solid ${col}`, borderRadius: 22, padding: S_ ? '6px 12px 8px' : '6px 14px 10px', boxShadow: `0 0 20px ${col}77, 0 8px 0 rgba(0,0,0,0.4)`}}>
          {(d.ncat ? DCATS.slice(0, d.ncat) : DCATS5).map(([ic, nmc], i) => {
            const v = Math.round(st[i] * cntF); const cmp_ = (d.ncat || 5) > 5; const mx = Math.max(st[i], ot[i]);
            const act = cur && cur.cat === i && t < cur.atk[1]; const won = sp.find((x) => x.cat === i && t >= x.se); const w = won && ((won.wa ? 0 : 1) === side);
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: S_ || cmp_ ? 2 : 6, padding: cmp_ ? '0 8px' : '2px 8px', borderRadius: 12, background: act ? 'rgba(255,210,63,0.22)' : 'rgba(255,255,255,0.05)', border: act ? '3px solid #ffd23f' : '3px solid transparent', opacity: t < d.cnt[0] + 0.15 * i ? 0 : 1}}>
                <span style={{fontSize: S_ ? 22 : 26, width: 30}}>{ic}</span>
                <div style={{flex: 1}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', ...font, fontSize: S_ ? 18 : 19, color: '#cfd6e6'}}><span>{nmc}</span><span style={{color: '#fff', fontSize: S_ ? 22 : 23}}>{fmt(v)}</span></div>
                  <div style={{height: S_ ? 7 : 9, background: '#20283c', borderRadius: 5, overflow: 'hidden'}}><div style={{width: `${(v / mx) * 100}%`, height: '100%', background: col}} /></div>
                </div>
                <span style={{width: 24, fontSize: S_ ? 18 : 22, textAlign: 'center'}}>{won ? (w ? '✅' : '❌') : ''}</span>
              </div>);
          })}
          <div style={{marginTop: S_ ? 5 : 8, textAlign: 'center', background: col, border: `4px solid ${INK}`, borderRadius: 14, ...font, fontSize: S_ ? 28 : 32, color: '#fff', textShadow: `3px 3px 0 ${INK}`, padding: '2px 0 0'}}>⚡ POWER {fmt(tot)}</div>
          {d.wmod && d.wmod[side] !== 0 && <div style={{marginTop: 6, textAlign: 'center', transform: `scale(${popT(t, d.cnt[1] - 0.3, 9) * (1 + 0.05 * Math.sin(t * 8))})`, background: d.wmod[side] > 0 ? '#e8f6ff' : '#ff5a3a', border: `4px solid ${INK}`, borderRadius: 14, ...font, fontSize: S_ ? 26 : 30, color: d.wmod[side] > 0 ? '#1a5fa8' : '#fff', padding: '2px 0 0'}}>{d.wmod[side] > 0 ? '❄️' : '🔥'} STORM {d.wmod[side] > 0 ? '+' : ''}{Math.round(d.wmod[side] * 100)}%</div>}
        </div>);
    };
    out.push(<React.Fragment key="pa">{panel(0)}{panel(1)}</React.Fragment>);
    // ruleta
    if (cur && t >= cur.t0 - 0.2 && t < cur.atk[0] + 0.2) {
      const w = (X.D.wbr.wheels as any[]).find((x) => Math.abs(x.t0 - cur.t0) < 0.01); if (w) {
        const wa = lerp(t, cur.t0 - 0.2, cur.t0 + 0.1, 0, 1) * lerp(t, cur.atk[0] - 0.1, cur.atk[0] + 0.2, 1, 0);
        const cx = VW / 2, cy = S_ ? VH * 0.53 : 640, R = S_ ? 250 : 205; const nm = w.style === 'nearmiss' && t > w.t0 + (cur.se - w.t0) * 0.8 && t < cur.se + 0.15;
        out.push(<div key="dw" style={{position: 'absolute', inset: 0, zIndex: 37, opacity: wa, pointerEvents: 'none'}}>
          <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0, transform: `scale(${popT(t, cur.t0 - 0.2, 12)})`, transformOrigin: `${cx}px ${cy}px`}}><WWheel items={w.items} w={w.w} cols={w.cols} rot={wbrRot(w, t)} R={R} cx={cx} cy={cy} fs={28} pct /></svg>
          {nm && <div style={{position: 'absolute', left: cx - 300, width: 600, top: cy - 60, textAlign: 'center', ...font, fontSize: 90, color: YELLOW, textShadow: `7px 7px 0 ${INK}`, transform: `rotate(-6deg) scale(${1 + 0.1 * Math.sin(t * 20)})`}}>WAIT... 😱</div>}
          {t > cur.se && <div style={{position: 'absolute', left: cx - 500, width: 1000, top: cy + R + 26, display: 'flex', justifyContent: 'center'}}><div style={{transform: `scale(${popT(t, cur.se, 9)})`, display: 'flex', alignItems: 'center', gap: 12, background: '#ffd23f', border: `6px solid ${INK}`, borderRadius: 20, padding: '6px 22px 0', ...font, fontSize: S_ ? 36 : 40, color: INK, whiteSpace: 'nowrap'}}><FlagImg k={cur.wa ? d.a : d.b} w={52} h={36} />{w.result}</div></div>}
          {cur.upset && t > cur.se && <div style={{position: 'absolute', left: cx + (S_ ? 40 : 120), top: cy - R - 40, ...font, fontSize: 84, color: '#ff3b3b', textShadow: `6px 6px 0 ${INK}`, transform: `rotate(10deg) scale(${popT(t, cur.se + 0.1, 8)})`}}>UPSET!</div>}
        </div>);
      }
    }
    // rótulo del ataque
    if (cur && t >= cur.atk[0] && t < cur.atk[1]) {
      const ak = cur.wa ? d.a : d.b; const p = popT(t, cur.atk[0], 11) * lerp(t, cur.atk[1] - 0.3, cur.atk[1], 1, 0);
      out.push(<div key="atk" style={{position: 'absolute', left: 0, right: 0, bottom: S_ ? 560 : 70, zIndex: 38, display: 'flex', justifyContent: 'center', opacity: p}}>
        <div style={{transform: `scale(${p}) rotate(-2deg)`, display: 'flex', alignItems: 'center', gap: 14, background: cur.final ? 'linear-gradient(180deg,#ff5a4a,#b80d0d)' : 'rgba(12,16,28,0.94)', border: `6px solid ${cur.final ? INK : '#ffd23f'}`, borderRadius: 22, padding: '6px 26px 2px', ...font, fontSize: cur.final ? 54 : 44, color: '#fff', textShadow: `3px 3px 0 ${INK}`, whiteSpace: 'nowrap'}}>
          <FlagImg k={ak} w={58} h={40} />{cur.final ? '💥 FINAL ASSAULT!' : `${DCATS[cur.cat][0]} ${DATK[cur.cat]}`}</div></div>);
    }
    // desempate
    const tb = d.tb;
    if (tb && t >= tb.t0 - 0.2 && t < tb.g1 + 0.6) {
      if (t < tb.g0) {
        const w = (X.D.wbr.wheels as any[]).find((x) => x.kind === 'tb' && Math.abs(x.t0 - tb.t0) < 0.01);
        if (w) { const cx = VW / 2, cy = S_ ? VH * 0.53 : 640, R = S_ ? 250 : 215; const wa = lerp(t, tb.t0 - 0.2, tb.t0 + 0.1, 0, 1) * lerp(t, tb.g0 - 0.3, tb.g0, 1, 0);
          out.push(<div key="tbw" style={{position: 'absolute', inset: 0, zIndex: 40, opacity: wa}}>
            <div style={{position: 'absolute', left: 0, right: 0, top: cy - R - (S_ ? 130 : 110), textAlign: 'center', ...font, fontSize: S_ ? 58 : 50, color: '#ff3b3b', textShadow: `5px 5px 0 ${INK}`, transform: `scale(${1 + 0.05 * Math.sin(t * 8)})`}}>2 - 2 · ⚖️ TIEBREAKER!</div>
            <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0}}><WWheel items={w.items} w={w.w} cols={w.cols} rot={wbrRot(w, t)} R={R} cx={cx} cy={cy} fs={24} /></svg>
            {t > tb.se && <div style={{position: 'absolute', left: 0, right: 0, top: cy + R + 26, display: 'flex', justifyContent: 'center'}}><div style={{transform: `scale(${popT(t, tb.se, 9)})`, background: '#ffd23f', border: `6px solid ${INK}`, borderRadius: 20, padding: '6px 22px 0', ...font, fontSize: 44, color: INK}}>{w.result}</div></div>}
          </div>); }
      } else {
        const [ic, nm_, lab] = TBN[tb.kind]; const pa = kf(tb.pa, t), pb = kf(tb.pb, t); const done = t > tb.g1;
        const val = (side: number) => { const me = side === 0 ? pa : pb, op = side === 0 ? pb : pa;
          if (tb.kind === 2) { const n0 = side === 0 ? tb.na : tb.nb; return {txt: `${Math.max(0, Math.round(n0 * (1 - op / 100)))}`, f: Math.max(0, 1 - op / 100)}; }
          if (tb.kind === 3) return {txt: `${Math.max(0, Math.round(100 - op))}%`, f: Math.max(0, 1 - op / 100)};
          return {txt: `${Math.round(me)}%`, f: me / 100}; };
        const row = (side: number) => { const v = val(side); const col = side === 0 ? '#e5322d' : '#1f6fe0'; const k = side === 0 ? d.a : d.b; const wn = done && tb.win === side;
          return (<div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 8}}>
            <FlagImg k={k} w={56} h={38} />
            <div style={{flex: 1, height: 34, background: '#20283c', border: `4px solid ${INK}`, borderRadius: 17, overflow: 'hidden'}}><div style={{width: `${v.f * 100}%`, height: '100%', background: col, boxShadow: wn ? '0 0 20px #ffd23f' : undefined}} /></div>
            <span style={{...font, fontSize: 38, color: wn ? '#ffd23f' : '#fff', width: 110, textAlign: 'right'}}>{v.txt}</span></div>); };
        const p = popT(t, tb.g0, 10);
        out.push(<div key="tbg" style={{position: 'absolute', left: 0, right: 0, top: S_ ? 470 : 160, zIndex: 40, display: 'flex', justifyContent: 'center', opacity: lerp(t, tb.g1 + 0.3, tb.g1 + 0.6, 1, 0)}}>
          <div style={{transform: `scale(${p})`, width: S_ ? VW - 60 : 760, background: 'rgba(10,14,26,0.94)', border: '6px solid #ffd23f', borderRadius: 24, padding: '10px 22px 14px', boxShadow: '0 0 40px rgba(255,210,63,0.4)'}}>
            <div style={{textAlign: 'center', ...font, fontSize: 44, color: '#ffd23f', textShadow: `3px 3px 0 ${INK}`}}>{ic} {nm_}</div>
            <div style={{textAlign: 'center', ...font2, fontSize: 22, color: '#cfd6e6'}}>{lab}</div>
            {row(0)}{row(1)}
            {!done && <div style={{textAlign: 'center', marginTop: 6, ...font, fontSize: 30, color: '#fff'}}>⏱️ {Math.max(0, tb.g1 - t).toFixed(1)}s</div>}
          </div></div>);
      }
    }
  }
  // absorción de poder
  const ab = (DB.absorbs as any[]).find((x) => t >= x.t0 && t < x.t1 + 0.3);
  if (ab) {
    const a = lerp(t, ab.t0, ab.t0 + 0.2, 0, 1) * lerp(t, ab.t1 - 0.1, ab.t1 + 0.3, 1, 0); const f = lerp(t, ab.t0 + 0.4, ab.t0 + (ab.t1 - ab.t0) * 0.7, 0, 1, Easing.out(Easing.cubic));
    const tot0 = ab.frm.reduce((x: number, y: number) => x + y, 0), tot1 = ab.to.reduce((x: number, y: number) => x + y, 0); const mx = Math.max(...ab.to);
    out.push(<AbsoluteFill key="ab" style={{zIndex: 44, background: `rgba(4,8,18,${0.55 * a})`, opacity: a, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: `scale(${popT(t, ab.t0, 11)})`, width: Math.min(980, VW - 40), background: 'linear-gradient(180deg,#1b2440,#0d1324)', border: '7px solid #4dff7a', borderRadius: 30, padding: '18px 36px 24px', boxShadow: '0 0 60px rgba(77,255,122,0.45)'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, ...font, fontSize: 46, color: '#fff'}}>
          <FlagImg k={ab.a} w={84} h={58} /><span>{ab.an}</span><span style={{color: '#4dff7a'}}>ABSORBS</span><span style={{filter: 'grayscale(1)', opacity: 0.8, display: 'flex', alignItems: 'center', gap: 10}}><FlagImg k={ab.b} w={60} h={42} />{ab.bn}</span></div>
        {(ab.frm.length === 4 ? DCATS.slice(0, 4) : DCATS5).map(([ic, nmc], i) => { const v = ab.frm[i] + (ab.to[i] - ab.frm[i]) * f; return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 10}}>
            <span style={{fontSize: 34, width: 44}}>{ic}</span><span style={{...font, fontSize: 26, color: '#cfd6e6', width: 160}}>{nmc}</span>
            <div style={{flex: 1, height: 22, background: '#20283c', borderRadius: 11, overflow: 'hidden', position: 'relative'}}><div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(v / mx) * 100}%`, background: 'linear-gradient(90deg,#1fa64a,#5dff8a)'}} /><div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(ab.frm[i] / mx) * 100}%`, background: '#e5322d'}} /></div>
            <span style={{...font, fontSize: 30, color: '#fff', width: 110, textAlign: 'right'}}>{fmt(v)}</span><span style={{...font, fontSize: 24, color: '#4dff7a', width: 90}}>+{fmt(ab.to[i] - ab.frm[i])}</span>
          </div>); })}
        <div style={{textAlign: 'center', marginTop: 14, ...font, fontSize: 56, color: '#ffd23f', textShadow: `4px 4px 0 ${INK}`}}>⚡ TOTAL POWER {fmt(tot0 + (tot1 - tot0) * f)}</div>
      </div></AbsoluteFill>);
  }
  // preguntas para comentarios
  for (const [a0, a1, txt] of (DB.asks || []) as any[]) {
    if (t < a0 || t > a1) continue; const p = popT(t, a0, 10) * lerp(t, a1 - 0.3, a1, 1, 0);
    out.push(<div key={'ask' + a0} style={{position: 'absolute', left: 0, right: 0, top: 150, zIndex: 45, display: 'flex', justifyContent: 'center', opacity: p}}><div style={{transform: `scale(${p}) rotate(-2deg)`, background: '#ffd23f', border: `7px solid ${INK}`, borderRadius: 26, padding: '10px 34px 4px', ...font, fontSize: 54, color: INK, boxShadow: '0 12px 0 rgba(0,0,0,0.45)'}}>{txt}</div></div>);
  }
  // vivos
  const n = aliveAt(t);
  if (!d && t > X.D.war_t && t < X.D.winT) out.push(<div key="alv" style={{position: 'absolute', left: 18, top: 18, zIndex: 20}}><Pill bg="#1b1f2b" style={{padding: '4px 18px 0', display: 'flex', alignItems: 'baseline', gap: 10, border: `4px solid ${RED}`}}><span style={{...font, fontSize: 26, color: '#ff9a8f'}}>👥 ALIVE</span><span style={{...font, fontSize: 48, color: '#fff'}}>{n}</span><span style={{...font, fontSize: 24, color: '#9aa'}}>/ {X.D.parts.length}</span></Pill></div>);
  return <>{out}</>;
};

const kf = (pk: number[][], t: number) => { if (!pk || !pk.length) return 0; if (t <= pk[0][0]) return pk[0][1]; for (let i = 1; i < pk.length; i++) if (t <= pk[i][0]) { const [a, va] = pk[i - 1], [b, vb] = pk[i]; return va + (vb - va) * (t - a) / Math.max(1e-6, b - a); } return pk[pk.length - 1][1]; };
const TEAMCOL = ['#e5322d', '#1f6fe0', '#ff8a1f', '#22a95b', '#7b2cbf', '#13b5c8', '#ffd23f', '#8a5a2b'];
// ================= eventos especiales (HUD) =================
const EvHud: React.FC<{t: number}> = ({t}) => {
  const DB = X.D.dbr; if (!DB || !DB.events) return null; const out: React.ReactNode[] = []; const S_ = SHORT;
  // reloj de cuenta atrás al próximo evento
  const evs = DB.events as any[]; const ev1end = DB.ev1 && DB.ev1.out ? DB.ev1.out[0] + 3.2 : 0;
  const nxt = evs.find((e: any, i: number) => t < e[0] && (i === 0 ? t > X.D.war_t : t > (DB.ev1end ?? ev1end)));
  const cds: any[] = [];
  if (nxt) cds.push([nxt[0], '🎉 SPECIAL EVENT IN', '🎉 SPECIAL EVENT', '#ffd23f', 0]);
  if (DB.wxcd && t > DB.wxcd[0] && t < DB.wxcd[1]) cds.push([DB.wxcd[1], '🌦️ WEATHER CHANGE IN', '🌧️ WEATHER CHANGE', '#5fd4ff', 1]);
  for (const [tgt, lab, big, colw, slot] of cds) {
    const rem = tgt - t;
    if (rem > 5) {
      const big = rem <= 60; const flash = rem <= 30 && Math.floor(t * 4) % 2 === 0;
      const sc = (big ? 1.25 : 0.9) * (rem <= 60 && rem > 59 ? popT(t, tgt - 60, 8) : 1);
      const mm = Math.floor(rem / 60), ss = Math.floor(rem % 60);
      out.push(<div key={'evc' + slot} style={{position: 'absolute', right: S_ ? 20 : 22, bottom: (S_ ? 760 : 120) + slot * 150, zIndex: 46, transform: `scale(${sc})`, transformOrigin: 'right bottom'}}>
        <div style={{background: rem <= 30 ? (flash ? '#ff2020' : '#fff') : 'rgba(12,16,28,0.94)', border: `5px solid ${rem <= 30 ? INK : colw}`, borderRadius: 18, padding: '6px 16px 2px', textAlign: 'center', boxShadow: rem <= 60 ? '0 0 26px rgba(255,210,63,0.6)' : undefined}}>
          <div style={{...font, fontSize: 20, color: rem <= 30 ? (flash ? '#fff' : RED) : colw}}>{lab}</div>
          <div style={{...font, fontSize: 46, color: rem <= 30 ? (flash ? '#fff' : INK) : '#fff', lineHeight: 1}}>{mm}:{String(ss).padStart(2, '0')}</div>
        </div></div>);
    } else {
      const n = Math.ceil(rem); const f = rem - Math.floor(rem);
      out.push(<AbsoluteFill key={'evbig' + slot} style={{zIndex: 47, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'}}>
        <div style={{textAlign: 'center', transform: `scale(${1 + f * 0.6})`, opacity: 0.4 + 0.6 * f}}>
          <div style={{...font, fontSize: 60, color: colw, textShadow: `5px 5px 0 ${INK}`}}>{big}</div>
          <div style={{...font, fontSize: 300, color: n % 2 ? '#ff2b2b' : '#fff', textShadow: `14px 14px 0 ${INK}`, lineHeight: 1}}>{n}</div></div></AbsoluteFill>);
    }
  }
  // temporal
  const WXd = DB.weather;
  if (WXd && t >= WXd.t0 && t < WXd.t1 + 2) {
    const a = lerp(t, WXd.t0, WXd.t0 + 1.0, 0, 1) * lerp(t, WXd.t1, WXd.t1 + 2, 1, 0);
    const drops = Array.from({length: 140}, (_, i) => { const x0 = ((i * 137.5) % VW); const sp = 900 + (i % 7) * 120; const y = ((t * sp + i * 97) % (VH + 200)) - 100; return <line key={i} x1={x0 + y * 0.18} y1={y} x2={x0 + y * 0.18 + 9} y2={y + 46} stroke="rgba(190,215,255,0.55)" strokeWidth={2.4} />; });
    out.push(<div key="rain" style={{position: 'absolute', inset: 0, zIndex: 30, opacity: a, pointerEvents: 'none', background: 'rgba(20,30,60,0.18)'}}><svg width={VW} height={VH}>{drops}</svg></div>);
    if (t > WXd.t0 + 1.6 && t < WXd.intro[1]) {
      const p = popT(t, WXd.t0 + 1.6, 10) * lerp(t, WXd.intro[1] - 0.3, WXd.intro[1], 1, 0); const alive_ = new Set<number>();
      for (const k of X.D.parts as number[]) { let o = k; for (const e of X.D.elim as any[]) if (e[1] === k && e[0] <= t) o = -1; if (o >= 0) alive_.add(k); }
      const grp = [[-0.25, '🔥 HOT', '#ff5a3a'], [-0.10, '🌤️ WARM', '#ffa53a'], [0.10, '🌥️ COOL', '#7fc8ff'], [0.25, '❄️ COLD', '#e8f6ff']];
      out.push(<AbsoluteFill key="wxi" style={{zIndex: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: p}}>
        <div style={{transform: `scale(${p})`, width: S_ ? VW - 40 : 1300, background: 'rgba(10,16,32,0.95)', border: '7px solid #5fd4ff', borderRadius: 28, padding: '14px 26px 18px'}}>
          <div style={{textAlign: 'center', ...font, fontSize: 58, color: '#5fd4ff', textShadow: `4px 4px 0 ${INK}`}}>{WXd.head || '🌧️ STORM SEASON · RAIN & SNOW'}</div>
          <div style={{textAlign: 'center', ...font2, fontSize: 26, color: '#fff', marginBottom: 10}}>FOR ~2 MINUTES THE WEATHER CHANGES EVERY WHEEL</div>
          {grp.map(([m, lab, col]: any, gi) => { const ks = Object.entries(WXd.mods).filter(([c, v]: any) => Math.abs(v - m) < 0.001).map(([c]) => CODEK[c]).filter((k: number) => alive_.has(k));
            return <div key={gi} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 8, transform: `translateX(${(1 - popT(t, WXd.t0 + 1.9 + gi * 0.25, 10)) * -200}px)`}}>
              <span style={{...font, fontSize: 36, color: col, width: 210}}>{lab}</span>
              <span style={{...font, fontSize: 44, color: m > 0 ? '#4dff7a' : '#ff6b6b', width: 120}}>{m > 0 ? '+' : ''}{Math.round(m * 100)}%</span>
              <div style={{display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1}}>{ks.map((k: number) => <FlagImg key={k} k={k} w={52} h={35} />)}</div></div>; })}
        </div></AbsoluteFill>);
    }
    if (t > WXd.intro[1]) out.push(<div key="wxp" style={{position: 'absolute', left: 18, bottom: S_ ? 300 : 26, zIndex: 41}}><Pill bg="rgba(10,16,32,0.92)" style={{padding: '4px 16px 0', border: '4px solid #5fd4ff', ...font, fontSize: 26, color: '#5fd4ff'}}>🌧️ STORM ACTIVE · ❄️ COLD +25% · 🔥 HOT -25%</Pill></div>);
  }
  // Evento 1: Capture the Base
  const E = DB.ev1;
  if (E && t >= E.t0 && t < E.out[0] + 3.2) {
    if (t >= E.intro[0] && t < E.intro[1]) {
      const a = popT(t, E.intro[0], 10) * lerp(t, E.intro[1] - 0.3, E.intro[1], 1, 0);
      out.push(<AbsoluteFill key="e1i" style={{zIndex: 44, background: `rgba(4,8,18,${0.6 * a})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: a}}>
        <div style={{...font, fontSize: S_ ? 54 : 64, color: '#ffd23f', textShadow: `5px 5px 0 ${INK}`}}>🏰 CAPTURE THE BASE</div>
        <div style={{...font2, fontSize: S_ ? 26 : 30, color: '#fff', marginBottom: 16, textAlign: 'center'}}>{E.teams.length} TEAMS · {E.teams.length - 1} BUNKERS · THE TEAM LEFT OUTSIDE IS ELIMINATED</div>
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14, width: S_ ? VW - 40 : 1500}}>
          {(E.teams as number[][]).map((tm, i) => <div key={i} style={{transform: `scale(${popT(t, E.intro[0] + 0.15 * i, 11)})`, width: S_ ? 240 : 340, background: 'rgba(12,16,28,0.95)', border: `5px solid ${TEAMCOL[i]}`, borderRadius: 18, padding: '6px 10px'}}>
            <div style={{...font, fontSize: 30, color: TEAMCOL[i], textAlign: 'center'}}>{E.names ? E.names[i] : `TEAM ${i + 1}`}</div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center'}}>{tm.map((k) => <FlagImg key={k} k={k} w={S_ ? 46 : 62} h={S_ ? 31 : 42} />)}</div></div>)}
        </div></AbsoluteFill>);
    }
    // estado de equipos (columna)
    if (t > E.intro[1]) {
      const sv = (i: number) => (E.saved as any[]).find((x) => x[1] === i && t >= x[0]);
      out.push(<div key="e1s" style={{position: 'absolute', left: 16, top: S_ ? 420 : 110, zIndex: 40, display: 'flex', flexDirection: 'column', gap: 6}}>
        {(E.teams as number[][]).map((tm, i) => { const ok = sv(i); const dead = t >= E.out[0] && i === E.out[1];
          return <div key={i} style={{display: 'flex', alignItems: 'center', gap: 6, background: dead ? '#5a0d0d' : ok ? 'rgba(20,90,40,0.95)' : 'rgba(12,16,28,0.92)', border: `4px solid ${TEAMCOL[i]}`, borderRadius: 14, padding: '3px 8px', transform: ok && t - ok[0] < 0.5 ? `scale(${popT(t, ok[0], 9)})` : undefined}}>
            <span style={{...font, fontSize: 20, color: TEAMCOL[i], width: 26}}>{i + 1}</span>
            {tm.map((k) => <FlagImg key={k} k={k} w={34} h={23} />)}
            <span style={{fontSize: 22, marginLeft: 4}}>{dead ? '❌' : ok ? '✅' : '⚠️'}</span></div>; })}
      </div>);
    }
    const sc = (E.scenes as any[]).find((x) => t >= x.t0 && t < x.t1);
    if (sc) {
      const tw = E.teams[sc.w], tl = sc.l !== null && sc.l !== undefined ? E.teams[sc.l] : null; const idx = (E.scenes as any[]).indexOf(sc);
      out.push(<div key="e1h" style={{position: 'absolute', left: 0, right: 0, top: S_ ? 250 : 18, zIndex: 41, display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: `scale(${popT(t, sc.t0, 11)})`, display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(12,16,28,0.95)', border: `5px solid ${sc.last ? '#ff3b3b' : '#ffd23f'}`, borderRadius: 22, padding: '6px 22px 2px'}}>
          <span style={{...font, fontSize: S_ ? 36 : 42, color: '#ffd23f'}}>🏰 {sc.last ? 'THE LAST BUNKER' : `BUNKER ${idx + 1}`}</span>
          <span style={{...font, fontSize: 30, color: TEAMCOL[sc.w]}}>{E.names ? E.names[sc.w] : `TEAM ${sc.w + 1}`}</span>
          {tl && <><span style={{...font, fontSize: 28, color: '#fff'}}>VS</span><span style={{...font, fontSize: 30, color: TEAMCOL[sc.l]}}>{E.names ? E.names[sc.l] : `TEAM ${sc.l + 1}`}</span></>}
        </div></div>);
      if (t >= sc.tcap) out.push(<div key="e1sv" style={{position: 'absolute', left: 0, right: 0, top: S_ ? 620 : 200, zIndex: 41, display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: `scale(${popT(t, sc.tcap, 8)}) rotate(-4deg)`, background: '#22c55e', border: `7px solid ${INK}`, borderRadius: 22, padding: '6px 30px 0', ...font, fontSize: S_ ? 62 : 72, color: '#fff', textShadow: `4px 4px 0 ${INK}`, display: 'flex', alignItems: 'center', gap: 12}}>✅ {E.names ? E.names[sc.w] : `TEAM ${sc.w + 1}`} SAVED {tw.map((k: number) => <FlagImg key={k} k={k} w={50} h={34} />)}</div></div>);
    }
  }
  // Evento 2: blitz
  const bz = ((DB.blitz || []) as any[]).find((x) => t >= x.t0 && t < x.t1);
  if (bz) {
    const u = lerp(t, bz.t0 + 0.4, bz.t1 - 0.6, 0, 1);
    const hv = (arr: number[]) => { const i = Math.min(arr.length - 2, Math.floor(u * (arr.length - 1))); const f = u * (arr.length - 1) - i; return arr[i] + (arr[i + 1] - arr[i]) * Math.min(1, f * 1.4); };
    const bar = (k: number, nm: string, v: number, col: string, side: number) => (<div style={{display: 'flex', alignItems: 'center', gap: 10, flexDirection: side ? 'row-reverse' : 'row', width: S_ ? 440 : 640}}>
      <FlagImg k={k} w={70} h={48} /><div style={{flex: 1}}><div style={{...font, fontSize: 32, color: '#fff', textAlign: side ? 'right' : 'left'}}>{nm}</div>
      <div style={{height: 34, background: '#2a0f12', border: `5px solid ${INK}`, borderRadius: 18, overflow: 'hidden', display: 'flex', justifyContent: side ? 'flex-end' : 'flex-start'}}><div style={{width: `${v}%`, background: v > 50 ? '#3ddc6a' : v > 20 ? '#ffd23f' : '#ff3b3b', boxShadow: `0 0 12px ${col}`}} /></div></div></div>);
    out.push(<div key="bz" style={{position: 'absolute', left: 0, right: 0, top: S_ ? 240 : 14, zIndex: 41, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
      <div style={{transform: `scale(${popT(t, bz.t0, 11)})`, ...font, fontSize: S_ ? 44 : 50, color: '#ffd23f', textShadow: `4px 4px 0 ${INK}`}}>⚡ 1V1 BLITZ #{bz.n}</div>
      <div style={{display: 'flex', gap: 30, alignItems: 'center'}}>{bar(bz.a, bz.an, hv(bz.hpa), '#e5322d', 0)}<span style={{...font, fontSize: 40, color: '#fff'}}>VS</span>{bar(bz.b, bz.bn, hv(bz.hpb), '#1f6fe0', 1)}</div></div>);
  }
  // estadística del momento + bracket
  const st = ((DB.stats || []) as any[]).find((x) => t >= x[0] && t < x[1]);
  if (st) {
    const a = popT(t, st[0], 10) * lerp(t, st[1] - 0.3, st[1], 1, 0);
    out.push(<div key="st" style={{position: 'absolute', left: 0, right: 0, bottom: S_ ? 330 : 90, zIndex: 43, display: 'flex', justifyContent: 'center', opacity: a}}>
      <div style={{transform: `scale(${a})`, background: 'rgba(12,16,28,0.95)', border: '6px solid #ffd23f', borderRadius: 24, padding: '10px 30px 12px', textAlign: 'center', maxWidth: VW - 60}}>
        <div style={{...font, fontSize: S_ ? 40 : 46, color: '#ffd23f'}}>{st[2]}</div>
        <div style={{...font, fontSize: S_ ? 30 : 36, color: '#fff'}}>{st[3]}</div>
        <div style={{display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap'}}>{(st[4] as number[]).map((k, i) => <div key={k} style={{transform: `scale(${popT(t, st[0] + 0.2 + i * 0.06, 12)})`}}><FlagImg k={k} w={52} h={35} /></div>)}</div>
      </div></div>);
  }
  return <>{out}</>;
};
// ================= eventos y desempates (mapa) =================
const EvFX: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const DB = X.D.dbr; if (!DB) return null; const out: React.ReactNode[] = [];
  const d = (DB.duels as any[]).find((x) => x.tb && t >= x.tb.g0 - 0.3 && t < x.tb.g1 + 0.5);
  if (d) {
    const tb = d.tb; const pa = kf(tb.pa, t), pb = kf(tb.pb, t); const [mx, my] = toS(tb.mid[0], tb.mid[1], cam); const [ax, ay] = toS(tb.ca[0], tb.ca[1], cam); const [bx, by] = toS(tb.cb[0], tb.cb[1], cam);
    if (tb.kind === 0) {
      const lead = pa >= pb ? '#e5322d' : '#1f6fe0'; const R = 70 + 10 * Math.sin(t * 5);
      out.push(<g key="koth"><circle cx={mx} cy={my} r={R} fill={lead + '44'} stroke={lead} strokeWidth={8} strokeDasharray="20 10" transform={`rotate(${t * 60} ${mx} ${my})`} /><text x={mx} y={my + 22} textAnchor="middle" fontSize={64}>👑</text></g>);
    } else if (tb.kind === 1) {
      const tok = (sx: number, sy: number, ex: number, ey: number, p: number, k: number, col: string, key: string) => { const u = p / 100; const f = u < 0.5 ? u * 2 : 2 - u * 2; const x = sx + (ex - sx) * f, y = sy + (ey - sy) * f;
        return <g key={key}><line x1={sx} y1={sy} x2={ex} y2={ey} stroke={col} strokeWidth={5} strokeDasharray="14 10" opacity={0.7} /><circle cx={x} cy={y} r={26} fill={col} stroke={INK} strokeWidth={5} /><text x={x} y={y + 10} textAnchor="middle" fontSize={30}>{u >= 0.5 ? '🚩' : '🏃'}</text></g>; };
      out.push(tok(ax, ay, bx, by, pa, d.b, '#e5322d', 'fa')); out.push(tok(bx, by, ax, ay, pb, d.a, '#1f6fe0', 'fb'));
      out.push(<text key="ha" x={ax} y={ay - 34} textAnchor="middle" fontSize={44}>🏠</text>); out.push(<text key="hb" x={bx} y={by - 34} textAnchor="middle" fontSize={44}>🏠</text>);
    } else if (tb.kind === 3) {
      for (const [x, y, hp, col, k] of [[ax, ay, 100 - pb, '#e5322d', 'a'], [bx, by, 100 - pa, '#1f6fe0', 'b']] as any[]) out.push(<g key={'cap' + k}><circle cx={x} cy={y} r={46} fill="none" stroke="#ff3b3b" strokeWidth={6} /><text x={x} y={y + 14} textAnchor="middle" fontSize={44}>🏛️</text>
        <rect x={x - 60} y={y - 82} width={120} height={18} rx={9} fill="#2a0f12" stroke={INK} strokeWidth={4} /><rect x={x - 58} y={y - 80} width={116 * Math.max(0, hp) / 100} height={14} rx={7} fill={col} /></g>);
    } else {
      out.push(<g key="el"><circle cx={mx} cy={my} r={60} fill="none" stroke="#ffd23f" strokeWidth={6} /><line x1={mx - 80} y1={my} x2={mx + 80} y2={my} stroke="#ffd23f" strokeWidth={4} /><line x1={mx} y1={my - 80} x2={mx} y2={my + 80} stroke="#ffd23f" strokeWidth={4} /></g>);
    }
  }
  const E = DB.ev1;
  if (E) for (const sc of E.scenes as any[]) {
    if (t < sc.t0 - 0.2 || t > sc.t1 + 0.2) continue;
    const [bx, by] = toS(sc.b[0], sc.b[1], cam); const lead = kf(sc.lead, t); const cap = t >= sc.tcap;
    const arr = (tw: number[], col: string, f: number, key: string) => { const [sx, sy] = toS(tw[0], tw[1], cam); const x = sx + (bx - sx) * f, y = sy + (by - sy) * f;
      return <g key={key}><line x1={sx} y1={sy} x2={x} y2={y} stroke={INK} strokeWidth={16} strokeLinecap="round" /><line x1={sx} y1={sy} x2={x} y2={y} stroke={col} strokeWidth={9} strokeLinecap="round" strokeDasharray="22 10" /><circle cx={x} cy={y} r={16} fill={col} stroke={INK} strokeWidth={5} /></g>; };
    const u = lerp(t, sc.t0 + 0.3, sc.tcap, 0, 1);
    out.push(arr(sc.tw, TEAMCOL[sc.w], Math.min(1, u * (0.6 + 0.4 * lead)), 'w' + sc.t0));
    if (sc.tl) out.push(arr(sc.tl, TEAMCOL[sc.l], Math.min(0.85, u * (1.05 - 0.4 * lead)), 'l' + sc.t0));
    const pr = cap ? 1 : Math.min(0.97, u * lead);
    out.push(<g key={'bk' + sc.t0}><circle cx={bx} cy={by} r={64} fill="rgba(12,16,28,0.85)" stroke={INK} strokeWidth={8} />
      <circle cx={bx} cy={by} r={64} fill="none" stroke={cap ? '#22c55e' : TEAMCOL[sc.w]} strokeWidth={10} strokeDasharray={`${pr * 402} 402`} transform={`rotate(-90 ${bx} ${by})`} />
      <text x={bx} y={by + 22} textAnchor="middle" fontSize={62}>{cap ? '✅' : '🏰'}</text></g>);
  }
  return <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>{out}</svg>;
};

// ================= timelapse (tl) =================
const TlHud: React.FC<{t: number}> = ({t}) => {
  const T = X.D.tlx; if (!T) return null; const S_ = SHORT;
  const ks = T.keys as any[]; let i = 0; for (let j = 0; j < ks.length; j++) if (t >= ks[j][0]) i = j;
  const k = ks[i]; const pct = kf(ks.map((x: any) => [x[0], x[3]]), t); const pop = popT(t, k[0], 12);
  const ev = [...(T.events as any[])].reverse().find((e) => t >= e[0] && t < e[0] + e[2]);
  return (<>
    <div style={{position: 'absolute', left: 0, right: 0, top: S_ ? 210 : 20, zIndex: 40, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{...font, fontSize: S_ ? 50 : 46, color: '#fff', textShadow: `4px 4px 0 ${INK}`, textAlign: 'center', padding: '0 30px'}}>{T.title}</div>
      <div style={{marginTop: 8, transform: `scale(${0.92 + 0.08 * pop})`, background: T.col, border: `7px solid ${INK}`, borderRadius: 26, padding: '6px 34px 0', ...font, fontSize: S_ ? 92 : 80, color: '#fff', textShadow: `5px 5px 0 ${INK}`, boxShadow: '0 12px 0 rgba(0,0,0,0.45)', minWidth: 420, textAlign: 'center'}}>{k[1]}</div>
      <div style={{marginTop: 14, width: S_ ? VW - 120 : 760, background: 'rgba(12,16,28,0.92)', border: '5px solid #fff', borderRadius: 20, padding: '8px 16px 10px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', ...font, fontSize: S_ ? 30 : 28, color: '#fff'}}><span>{T.barLabel}</span><span style={{color: T.col2 || '#ffd23f'}}>{pct.toFixed(T.dec ?? 1)}{T.unit ?? '%'}</span></div>
        <div style={{marginTop: 6, height: 26, background: '#20283c', borderRadius: 13, overflow: 'hidden'}}><div style={{width: `${Math.min(100, pct / (T.max || 100) * 100)}%`, height: '100%', background: T.col}} /></div>
      </div>
    </div>
    {ev && <div style={{position: 'absolute', left: 0, right: 0, bottom: S_ ? 420 : 110, zIndex: 41, display: 'flex', justifyContent: 'center', padding: '0 30px'}}>
      <div style={{transform: `scale(${popT(t, ev[0], 10)}) rotate(-1.5deg)`, background: '#fff', border: `6px solid ${INK}`, borderRadius: 22, padding: '8px 24px 2px', ...font, fontSize: S_ ? 44 : 40, color: INK, textAlign: 'center', boxShadow: '0 10px 0 rgba(0,0,0,0.45)'}}>{ev[1]}</div></div>}
    <div style={{position: 'absolute', left: 0, right: 0, bottom: S_ ? 300 : 30, zIndex: 41, textAlign: 'center', ...font2, fontSize: S_ ? 24 : 20, color: '#e8eefc', textShadow: `2px 2px 0 ${INK}`}}>{T.note}</div>
  </>);
};
const TlFX: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const T = X.D.tlx; if (!T || !T.arrows) return null; const out: React.ReactNode[] = [];
  for (const [t0, t1, x0, y0, x1, y1, col, icon] of T.arrows as any[]) {
    if (t < t0 || t > t1 + 0.4) continue; const u = lerp(t, t0, t1, 0, 1, Easing.out(Easing.quad)); const a = lerp(t, t1, t1 + 0.4, 1, 0);
    const [sx, sy] = toS(x0, y0, cam); const [ex, ey] = toS(x1, y1, cam); const x = sx + (ex - sx) * u, y = sy + (ey - sy) * u; const ang = Math.atan2(ey - sy, ex - sx);
    out.push(<g key={t0 + '_' + x0} opacity={a}>
      <line x1={sx} y1={sy} x2={x} y2={y} stroke={INK} strokeWidth={22} strokeLinecap="round" />
      <line x1={sx} y1={sy} x2={x} y2={y} stroke={col} strokeWidth={13} strokeLinecap="round" />
      <polygon points={`${x + Math.cos(ang) * 34},${y + Math.sin(ang) * 34} ${x + Math.cos(ang + 2.4) * 30},${y + Math.sin(ang + 2.4) * 30} ${x + Math.cos(ang - 2.4) * 30},${y + Math.sin(ang - 2.4) * 30}`} fill={col} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {icon && [0.3, 0.55, 0.8].map((q) => { const px = sx + (x - sx) * q, py = sy + (y - sy) * q; return <text key={q} x={px} y={py + 12 + 4 * Math.sin(t * 12 + q * 9)} textAnchor="middle" fontSize={34}>{icon}</text>; })}
    </g>);
  }
  return <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>{out}</svg>;
};
const WbrFX: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const WB = X.D.wbr; if (!WB) return null; const out: React.ReactNode[] = [];
  for (const [t0, t1, x, y, ang, r] of WB.cmp as any[]) {
    if (t < t0 - 0.2 || t > t1 + 0.4) continue;
    const [sx, sy] = toS(x, y, cam); const R = X.D.dbr ? Math.max(45, Math.min(150, r * cam.s)) : Math.max(80, Math.min(320, r * cam.s)); const a = lerp(t, t0 - 0.2, t0 + 0.1, 0, 1) * lerp(t, t1, t1 + 0.4, 1, 0);
    const an = ang - 720 - 47 + (720 + 47) * lerp(t, t0 + 0.1, t1 - 0.5, 0, 1, Easing.out(Easing.cubic)); const rad = (an * Math.PI) / 180; const L = R * 1.35;
    const tx = sx + Math.cos(rad) * L, ty = sy + Math.sin(rad) * L; const lock = t > t1 - 0.5;
    out.push(<g key={'c' + t0} opacity={a}>
      <circle cx={sx} cy={sy} r={R} fill="rgba(20,180,255,0.10)" stroke="#5fd4ff" strokeWidth={6} strokeDasharray="22 14" transform={`rotate(${t * 40} ${sx} ${sy})`} />
      <circle cx={sx} cy={sy} r={R * 0.25} fill="none" stroke="#5fd4ff" strokeWidth={4} />
      <line x1={sx} y1={sy} x2={tx} y2={ty} stroke={INK} strokeWidth={22} strokeLinecap="round" />
      <line x1={sx} y1={sy} x2={tx} y2={ty} stroke={lock ? '#ff3b3b' : '#5fd4ff'} strokeWidth={12} strokeLinecap="round" strokeDasharray={lock ? undefined : '30 12'} />
      <polygon points={`${tx + Math.cos(rad) * 40},${ty + Math.sin(rad) * 40} ${tx + Math.cos(rad + 2.5) * 34},${ty + Math.sin(rad + 2.5) * 34} ${tx + Math.cos(rad - 2.5) * 34},${ty + Math.sin(rad - 2.5) * 34}`} fill={lock ? '#ff3b3b' : '#5fd4ff'} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {lock && <circle cx={tx} cy={ty} r={30 + 40 * ((t - (t1 - 0.5)) % 0.6)} fill="none" stroke="#ff3b3b" strokeWidth={6} opacity={1 - ((t - (t1 - 0.5)) % 0.6) / 0.6} />}
    </g>);
  }
  for (const [t0, x, y, txt, col] of WB.pops as any[]) {
    const d = t - t0; if (d < 0 || d > 2.0) continue; const [sx, sy] = toS(x, y, cam);
    out.push(<text key={'p' + t0 + txt} x={sx} y={sy - 40 - d * 50} textAnchor="middle" fontSize={64 * popT(t, t0, 10)} style={{fontFamily: 'Lilita'}} fill={col} stroke={INK} strokeWidth={9} paintOrder="stroke" opacity={lerp(d, 1.5, 2.0, 1, 0)}>{txt}</text>);
  }
  return <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>{out}</svg>;
};
const PowerFX: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const Dd = X.D.duel; if (!Dd) return null;
  const out: React.ReactNode[] = [];
  (Dd.powers as any[]).forEach((p, pi) => {
    if (p.kind === 'tsunami' && t > p.t1 && t < p.t1 + 40) { (p.pts as number[][]).forEach(([wx, wy], i) => { const [x, y] = toS(wx, wy, cam); out.push(<circle key={`fl${pi}-${i}`} cx={x} cy={y} r={60 * Math.min(2, cam.s)} fill="#2f8cff" opacity={0.3 * lerp(t, p.t1 + 30, p.t1 + 40, 1, 0)} />); }); }
    if (t < p.t0 || t > p.t1 + 1.5) return;
    const d = t - p.t0; const fade = lerp(t, p.t1, p.t1 + 1.5, 1, 0);
    const P = (p.pts as number[][]).map(([x, y]) => toS(x, y, cam));
    if (p.kind === 'lightning') P.forEach(([x, y], i) => { for (let r = 0; r < 3; r++) { const tt = p.ts + i * 0.32 + r * 1.9; const e = t - tt; if (e < 0 || e > 0.7) continue; const a = 1 - e / 0.7; const pts = bolt(x + (hsh(i + r) - 0.5) * 300, -80, x, y, i * 7 + r + Math.floor(t * 20));
      const pts2 = bolt(x + (hsh(i + r + 5) - 0.5) * 420, -80, x, y, i * 11 + r + 3 + Math.floor(t * 20)); out.push(<g key={`l${pi}-${i}-${r}`} opacity={a}><polyline points={pts} fill="none" stroke="#6ec6ff" strokeWidth={70} opacity={0.3} /><polyline points={pts} fill="none" stroke="#bfe8ff" strokeWidth={26} opacity={0.8} /><polyline points={pts} fill="none" stroke="#fff" strokeWidth={10} /><polyline points={pts2} fill="none" stroke="#fff" strokeWidth={5} opacity={0.8} /><circle cx={x} cy={y} r={60 + 120 * e} fill="#bfe8ff" opacity={0.6 * a} /></g>); } });
    if (p.kind === 'meteor') P.forEach(([x, y], i) => { const ti = p.ts + i * 0.9; const e = t - (ti - 1.5);
      if (e > 0 && e < 1.5) { const f = Easing.in(Easing.quad)(e / 1.5); const sx = x + 900 * (1 - f), sy = y - 1000 * (1 - f); const r = 34 + 14 * Math.sin(t * 30);
        out.push(<g key={`m${pi}-${i}`}><line x1={sx} y1={sy} x2={sx + 260} y2={sy - 290} stroke="url(#mtrail)" strokeWidth={r * 1.6} strokeLinecap="round" /><circle cx={sx} cy={sy} r={r * 1.4} fill="#ff7a00" opacity={0.5} /><circle cx={sx} cy={sy} r={r} fill="#ffd23f" stroke="#7a2a00" strokeWidth={6} /></g>); }
      const e2 = t - ti; if (e2 >= 0 && e2 < 2.4) { const R = 40 + 520 * Easing.out(Easing.cubic)(Math.min(1, e2 / 1.4));
        out.push(<g key={`mi${pi}-${i}`} opacity={lerp(e2, 1.2, 2.4, 1, 0)}><circle cx={x} cy={y} r={R} fill="none" stroke="#fff" strokeWidth={22 * (1 - e2 / 2.4)} /><circle cx={x} cy={y} r={R * 0.6} fill="#ff8a1e" opacity={0.45} /><circle cx={x} cy={y} r={R * 0.3} fill="#fff4b0" opacity={0.7} /></g>); } });
    if (p.kind === 'tsunami') { const [ox, oy] = toS(p.from[0], p.from[1], cam); const maxR = Math.max(...P.map(([x, y]) => Math.hypot(x - ox, y - oy))) + 200; const f = Easing.inOut(Easing.quad)(Math.min(1, Math.max(0, (t - p.ts) / 6.5)));
      for (let w = 0; w < 4; w++) { const R = Math.max(10, maxR * f - w * 70); const ang = Math.atan2(P[0][1] - oy, P[0][0] - ox); const a0 = ang - 0.9, a1 = ang + 0.9;
        out.push(<path key={`w${pi}-${w}`} d={`M${ox + Math.cos(a0) * R},${oy + Math.sin(a0) * R} A${R},${R} 0 0,1 ${ox + Math.cos(a1) * R},${oy + Math.sin(a1) * R}`} fill="none" stroke={w === 0 ? '#f4fbff' : '#2f8cff'} strokeWidth={w === 0 ? 26 : 44 - w * 8} opacity={(w === 0 ? 0.95 : 0.65 - w * 0.12) * fade} strokeLinecap="round" />); }
      P.forEach(([x, y], i) => { const hit = p.ts + 6.5 * (Math.hypot(x - ox, y - oy) / maxR); const e = t - hit; if (e > 0) out.push(<circle key={`wf${pi}-${i}`} cx={x} cy={y} r={Math.min(150, 40 + e * 90)} fill="#2f8cff" opacity={0.35 * fade} />); }); }
    if (p.kind === 'freeze') P.forEach(([x, y], i) => { const e = t - p.ts - i * 0.25; if (e < 0) return; const R = Math.min(260, e * 300);
      out.push(<g key={`f${pi}-${i}`} opacity={fade}>{Array.from({length: 9}).map((_, j) => { const an = j * 0.7 + i; const L = R * (0.5 + hsh(i * 9 + j) * 0.6); return <polygon key={'sp' + j} points={`${x + Math.cos(an - 0.12) * 30},${y + Math.sin(an - 0.12) * 30} ${x + Math.cos(an) * L},${y + Math.sin(an) * L} ${x + Math.cos(an + 0.12) * 30},${y + Math.sin(an + 0.12) * 30}`} fill="#e8fbff" stroke="#6cc8f0" strokeWidth={4} opacity={0.9} />; })}<circle cx={x} cy={y} r={R} fill="#bfe9ff" opacity={0.45} /><circle cx={x} cy={y} r={R} fill="none" stroke="#fff" strokeWidth={6} strokeDasharray="14 10" />{Array.from({length: 6}).map((_, j) => <line key={j} x1={x} y1={y} x2={x + Math.cos(j * 1.047) * R * 0.8} y2={y + Math.sin(j * 1.047) * R * 0.8} stroke="#fff" strokeWidth={5} opacity={0.8} />)}</g>); });
    if (p.kind === 'quake') P.forEach(([x, y], i) => { const e = t - p.ts - i * 0.4; if (e < 0) return; const L = Math.min(1, e / 1.2);
      out.push(<g key={`q${pi}-${i}`} opacity={fade}>{Array.from({length: 7}).map((_, j) => { const ang = j * 0.9 + i; let px = x, py = y; const seg: string[] = [`${px},${py}`]; for (let s = 0; s < 6; s++) { px += Math.cos(ang + (hsh(i * 13 + j * 7 + s) - 0.5) * 0.9) * 70 * L; py += Math.sin(ang + (hsh(i * 17 + j * 3 + s) - 0.5) * 0.9) * 70 * L; seg.push(`${px},${py}`); } return <g key={j}><polyline points={seg.join(' ')} fill="none" stroke="#ff7a1e" strokeWidth={26} strokeLinejoin="round" opacity={0.5} /><polyline points={seg.join(' ')} fill="none" stroke="#1a0c02" strokeWidth={14} strokeLinejoin="round" /></g>; })}
        {[0, 0.5, 1].map((o) => { const ee = (e + o) % 1.5; return <ellipse key={o} cx={x} cy={y} rx={ee * 220} ry={ee * 120} fill="none" stroke="#c9a46a" strokeWidth={8} opacity={1 - ee / 1.5} />; })}</g>); });
    if (p.kind === 'volcano') { const [x, y] = P[0]; const e = t - p.ts; if (e >= 0) {
      const g: React.ReactNode[] = [<circle key="glow" cx={x} cy={y} r={70 + 30 * Math.sin(t * 8)} fill="#ff5a00" opacity={0.6 * fade} />, <circle key="lava" cx={x} cy={y} r={Math.min(320, e * 70)} fill="#ff3d00" opacity={0.28 * fade} />];
      for (let i = 0; i < 26; i++) { const s0 = (i * 0.37) % 4; const ee = ((e - s0) % 4 + 4) % 4; if (e < s0) continue; const r = 30 + ee * 40; g.push(<circle key={'pl' + i} cx={x + (hsh(i) - 0.5) * 60 + ee * 18} cy={y - ee * 110 - hsh(i + 2) * 40} r={r} fill={i % 3 ? '#5a5a5a' : '#3a3a3a'} opacity={(0.75 - ee * 0.18) * fade} />); }
      for (let i = 0; i < 18; i++) { const s0 = (i * 0.29) % 3; const ee = ((e - s0) % 1.6 + 1.6) % 1.6; if (e < s0) continue; const vx = (hsh(i + 40) - 0.5) * 520, vy = -420 - hsh(i + 7) * 320; g.push(<circle key={'lb' + i} cx={x + vx * ee} cy={y + vy * ee + 500 * ee * ee} r={9} fill="#ffb000" stroke="#c42a00" strokeWidth={3} opacity={fade} />); }
      out.push(<g key={`v${pi}`}>{g}</g>); } }
    if (p.kind === 'tornado') { const path = P; const e = Math.max(0, t - p.ts); const f = Math.min(1, e / (p.t1 - p.ts)); const seg = f * (path.length - 1); const i0 = Math.min(path.length - 2, Math.floor(seg)); const ff = seg - i0;
      const x = path[i0][0] + (path[i0 + 1][0] - path[i0][0]) * ff, y = path[i0][1] + (path[i0 + 1][1] - path[i0][1]) * ff;
      out.push(<g key={`tn${pi}`} opacity={fade}>{Array.from({length: 9}).map((_, j) => <ellipse key={j} cx={x + Math.sin(t * 8 + j) * (6 + j * 3)} cy={y - j * 34} rx={30 + j * 16} ry={10 + j * 4} fill="none" stroke={j % 2 ? '#d7dde6' : '#9aa3b0'} strokeWidth={10} opacity={0.85} />)}
        {Array.from({length: 14}).map((_, j) => { const an = t * 6 + j; const rr = 40 + (j % 5) * 30; return <rect key={'d' + j} x={x + Math.cos(an) * rr} y={y - 60 - (j % 7) * 30 + Math.sin(an) * 12} width={10} height={10} fill="#5b4a3a" />; })}</g>); }
    if (p.kind === 'laser') P.forEach(([x, y], i) => { const tt = p.ts + i * 1.1; const e = t - tt; if (e < -0.8 || e > 1.6) return;
      const a = e < 0 ? 0.7 : lerp(e, 1.1, 1.6, 1, 0); const w = e < 0 ? 6 : 70 + 26 * Math.sin(e * 40);
      out.push(<g key={`z${pi}-${i}`} opacity={a}>{e < 0 && <circle cx={x} cy={y} r={60 + (1 + e) * 70} fill="none" stroke="#ff2b4a" strokeWidth={6} strokeDasharray="14 10" />}
        <line x1={x + 200} y1={-80} x2={x} y2={y} stroke="#ff2b4a" strokeWidth={w * 2.2} opacity={0.35} strokeLinecap="round" /><line x1={x + 200} y1={-80} x2={x} y2={y} stroke="#ff6b7a" strokeWidth={w} strokeLinecap="round" /><line x1={x + 200} y1={-80} x2={x} y2={y} stroke="#fff" strokeWidth={w * 0.35} strokeLinecap="round" />
        {e > 0 && <circle cx={x} cy={y} r={60 + e * 200} fill="#ff6b7a" opacity={0.4 * (1 - e / 1.6)} />}</g>); });
    if (p.kind === 'clones') { const [ox, oy] = toS(p.from[0], p.from[1], cam); for (let i = 0; i < 40; i++) { const ts = p.ts + i * 0.06; if (t < ts) continue; const tg = P[i % P.length]; const e = t - ts; const f = Math.min(1, Math.max(0, (e - 0.6) / 4.5));
        const bx = ox + ((i % 8) - 3.5) * 64, by = oy + (Math.floor(i / 8) - 2) * 64; const x = bx + (tg[0] - bx) * Easing.inOut(Easing.quad)(f), y = by + (tg[1] - by) * Easing.inOut(Easing.quad)(f) + Math.abs(Math.sin(t * 10 + i)) * -8;
        const s = popT(t, ts, 12);
        out.push(<g key={`c${pi}-${i}`} transform={`translate(${x},${y}) scale(${s * 1.5})`} opacity={fade}><circle r={20} fill="#fff" stroke={INK} strokeWidth={4} /><path d="M-20,0 A20,20 0 0,1 20,0 Z" fill="#e5322d" /><circle r={20} fill="none" stroke={INK} strokeWidth={4} /><circle cx={-6} cy={-2} r={4} fill={INK} /><circle cx={6} cy={-2} r={4} fill={INK} /></g>); } }
    if (p.kind === 'curse') { const [x, y] = P[0]; const e = t - p.ts; if (e >= 0) out.push(<g key={`cu${pi}`} opacity={fade}>{Array.from({length: 12}).map((_, j) => { const ee = (e * 0.8 + j * 0.15) % 1.8; return <circle key={j} cx={x + (hsh(j) - 0.5) * 160} cy={y - ee * 160} r={30 + ee * 30} fill="#7b2cbf" opacity={0.55 * (1 - ee / 1.8)} />; })}<text x={x} y={y + 30} textAnchor="middle" fontSize={120}>💀</text></g>); }
  });
  for (const c of Dd.chests as any[]) {
    if (t < c.t0 || t > c.topen + 2.5) continue;
    const [x, y] = toS(c.x, c.y, cam); const e = t - c.t0; const fall = Math.min(1, e / 1.6); const cy_ = y - 600 * (1 - Easing.out(Easing.quad)(fall));
    const opened = t > c.topen; const oa = opened ? lerp(t, c.topen + 1.6, c.topen + 2.5, 1, 0) : 1;
    const race = (sx: number, sy: number, k: number, arrive: number, j: number) => { const [ax, ay] = toS(sx, sy, cam); const f = Math.min(1, Math.max(0, (t - c.t0 - 1.2) / (arrive - c.t0 - 1.2))); const px = ax + (x - ax) * f, py = ay + (y - ay) * f - Math.abs(Math.sin(t * 12)) * 10;
      return <foreignObject key={'r' + j} x={px - 34} y={py - 34} width={68} height={68}><div style={{width: 68, height: 68}}><Ball k={k} size={68} mood="angry" t={t} /></div></foreignObject>; };
    out.push(<g key={'chest' + c.t0} opacity={oa}>
      {!opened && <circle cx={x} cy={y} r={70 + 10 * Math.sin(t * 6)} fill="#ffd23f" opacity={0.35} />}
      {fall < 1 && <><path d={`M${x - 70},${cy_ - 120} Q${x},${cy_ - 200} ${x + 70},${cy_ - 120} Z`} fill="#fff" stroke={INK} strokeWidth={5} /><line x1={x - 70} y1={cy_ - 120} x2={x - 20} y2={cy_ - 30} stroke={INK} strokeWidth={3} /><line x1={x + 70} y1={cy_ - 120} x2={x + 20} y2={cy_ - 30} stroke={INK} strokeWidth={3} /></>}
      <text x={x} y={cy_ + 30} textAnchor="middle" fontSize={opened ? 0 : (c.small ? 70 : 90)}>{c.box || '🎁'}</text>
      {!opened && fall >= 1 && <text x={x} y={cy_ - 60} textAnchor="middle" fontSize={56} style={{fontFamily: 'Lilita'}} fill={YELLOW} stroke={INK} strokeWidth={7} paintOrder="stroke">?</text>}
      {opened && <><circle cx={x} cy={y} r={40 + (t - c.topen) * 260} fill="none" stroke={c.good ? '#ffd23f' : '#ff3b3b'} strokeWidth={14} opacity={1 - (t - c.topen) / 2.5} /><text x={x} y={y + 40} textAnchor="middle" fontSize={130} transform={`translate(0,${-(t - c.topen) * 30})`}>{c.icon}</text></>}
      {race(c.ax, c.ay, Dd.a, c.k === Dd.a ? c.topen : c.topen + 0.8, 1)}
      {race(c.bx, c.by, Dd.b, c.k === Dd.b ? c.topen : c.topen + 0.8, 2)}
    </g>);
  }
  if (!out.length) return null;
  return <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0, zIndex: 13, overflow: 'visible'}}><defs><linearGradient id="mtrail" x1="0" y1="0" x2="1" y2="-1"><stop offset="0" stopColor="#ffd23f" /><stop offset="1" stopColor="#ff5a00" stopOpacity="0" /></linearGradient></defs>{out}</svg>;
};

const DuelEnd: React.FC<{t: number}> = ({t}) => {
  const Dd = X.D.duel; if (!Dd || !Dd.end) return null; const E = Dd.end; const t0 = X.D.winT;
  if (t < t0) return null;
  const out: React.ReactNode[] = [];
  for (let i = 0; i < 30; i++) { const x = hsh(i) * 1920 + Math.sin(t * 2 + i) * 40; const y = -60 + ((t - t0) * (180 + hsh(i + 4) * 160) + hsh(i + 9) * 1100) % 1200;
    out.push(<div key={'cf' + i} style={{position: 'absolute', left: x, top: y, width: 46, height: 30, transform: `rotate(${Math.sin(t * 3 + i) * 40}deg)`, border: `3px solid ${INK}`, borderRadius: 4, overflow: 'hidden', zIndex: 0}}><div style={{height: 15, background: '#e5322d'}} /><div style={{height: 15, background: '#fff'}} /></div>); }
  const a = lerp(t, E.t0, E.t0 + 0.5, 0, 1);
  return (
    <AbsoluteFill style={{zIndex: 46, pointerEvents: 'none'}}>
      {out}
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, rgba(40,25,0,${0.35 * a}) 30%, rgba(0,0,0,${0.75 * a}) 100%)`}} />
      <div style={{position: 'absolute', left: 90, top: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${popT(t, t0 + 0.2, 8)})`}}>
        <div style={{fontSize: 150, transform: `translateY(${Math.abs(Math.sin(t * 4)) * -18}px) rotate(${Math.sin(t * 3) * 8}deg)`, marginBottom: -40, zIndex: 2}}>👑</div>
        <div style={{transform: `translateY(${Math.abs(Math.sin(t * 4 + 0.4)) * -14}px)`}}><Ball k={Dd.b} size={400} mood="happy" t={t} /></div>
        <div style={{...font, fontSize: 118, color: YELLOW, textShadow: `8px 8px 0 ${INK}`, marginTop: 10}}>INDONESIA</div>
        <div style={{...font, fontSize: 92, color: '#fff', textShadow: `7px 7px 0 ${INK}`, marginTop: -16}}>WINS! 🏆</div>
      </div>
      {t > E.t0 && <div style={{position: 'absolute', right: 80, top: 120, width: 930, opacity: a, transform: `translateX(${lerp(t, E.t0, E.t0 + 0.5, 300, 0, Easing.out(Easing.back(1.3)))}px) rotate(1deg)`}}>
        <div style={{background: CREAM, border: `10px solid ${INK}`, borderRadius: 34, padding: '18px 30px 22px', boxShadow: '0 16px 0 rgba(0,0,0,0.5)'}}>
          <div style={{display: 'flex', alignItems: 'center', ...font, fontSize: 48, color: INK, marginBottom: 6}}>
            <div style={{flex: 1}}>⚔️ THE WAR IN NUMBERS</div>
            <div style={{width: 170, display: 'flex', justifyContent: 'center'}}><Ball k={Dd.a} size={70} mood="sad" t={t} /></div>
            <div style={{width: 170, display: 'flex', justifyContent: 'center'}}><Ball k={Dd.b} size={70} mood="happy" t={t} /></div>
          </div>
          {(E.rows as string[][]).map((r, i) => { const ti = E.t0 + 0.6 + i * 0.45; const k = popT(t, ti, 10); return (
            <div key={i} style={{display: 'flex', alignItems: 'center', height: 92, borderTop: '4px solid #e2d3b1', opacity: t > ti ? 1 : 0, transform: `scale(${0.85 + 0.15 * k})`, transformOrigin: 'left center'}}>
              <div style={{flex: 1, ...font, fontSize: 46, color: INK}}>{r[0]}</div>
              <div style={{width: 170, textAlign: 'center', ...font, fontSize: 50, color: '#d9690a'}}>{r[1]}</div>
              <div style={{width: 170, textAlign: 'center', ...font, fontSize: 50, color: '#c81e1e'}}>{r[2]}</div>
            </div>); })}
          {t > E.t0 + 3.4 && <div style={{marginTop: 12, background: '#ffd23f', border: `6px solid ${INK}`, borderRadius: 20, padding: '8px 18px 2px', ...font, fontSize: 44, color: INK, textAlign: 'center', transform: `scale(${popT(t, E.t0 + 3.4, 10)})`}}>{E.best[0]} {E.best[1]}</div>}
        </div>
      </div>}
      {E.next && t > E.next[0] && <AbsoluteFill style={{background: `rgba(5,8,18,${0.9 * lerp(t, E.next[0], E.next[0] + 0.4, 0, 1)})`, zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{...font, fontSize: 100, color: YELLOW, textShadow: `7px 7px 0 ${INK}`, transform: `scale(${popT(t, E.next[0], 10)})`}}>NEXT EPISODE? YOU DECIDE 👇</div>
        <div style={{display: 'flex', gap: 40, marginTop: 30}}>{(E.next[1] as string[][]).map(([a_, b_, txt], j) => <div key={j} style={{transform: `scale(${popT(t, E.next[0] + 0.4 + j * 0.3, 10)})`, background: CREAM, border: `8px solid ${INK}`, borderRadius: 28, padding: '24px 30px', textAlign: 'center', width: 640}}><div style={{fontSize: 100, whiteSpace: 'nowrap'}}>{a_} ⚔️ {b_}</div><div style={{...font, fontSize: 62, color: INK}}>{txt}</div><div style={{...font, fontSize: 50, color: RED, marginTop: 6}}>COMMENT {String.fromCharCode(65 + j)} 👇</div></div>)}</div>
      </AbsoluteFill>}
      {t > E.t0 + 5.4 && <div style={{position: 'absolute', left: 0, right: 0, bottom: 50, display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: `scale(${popT(t, E.t0 + 5.4, 9) * (1 + 0.03 * Math.sin(t * 6))}) rotate(-1.5deg)`, background: RED, border: `9px solid ${INK}`, borderRadius: 28, padding: '10px 46px 2px', ...font, fontSize: 80, color: '#fff', textShadow: `5px 5px 0 ${INK}`}}>{E.ask}</div>
      </div>}
    </AbsoluteFill>
  );
};
const MiniWheel: React.FC<{t: number}> = ({t}) => {
  const Dd = X.D.duel; if (!Dd || !Dd.minis) return null; const out: React.ReactNode[] = [];
  for (const m of Dd.minis as any[]) {
    if (m.kind === 'monsoon' && t > m.t1 - 1.4 && t < m.t1 + 6) { const a = lerp(t, m.t1 - 1.4, m.t1 - 0.6, 0, 1) * lerp(t, m.t1 + 5, m.t1 + 6, 1, 0);
      out.push(<svg key={'rain' + m.t0} width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, zIndex: 16, opacity: a}}><rect width={1920} height={1080} fill="rgba(20,40,70,0.28)" />{Array.from({length: 140}).map((_, i) => { const x = hsh(i) * 2100 - 100; const y = ((hsh(i + 7) * 1200 + t * 1400) % 1200) - 100; return <line key={i} x1={x} y1={y} x2={x - 18} y2={y + 46} stroke="#cfe6ff" strokeWidth={3} opacity={0.7} />; })}</svg>); }
    if (t < m.t0 - 0.3 || t > m.t1 + 1.6) continue;
    const a = lerp(t, m.t0 - 0.3, m.t0, 0, 1) * lerp(t, m.t1 + 1.1, m.t1 + 1.6, 1, 0);
    const n = m.items.length, seg = 360 / n, se = m.t0 + (m.t1 - m.t0) * 0.6;
    const rot = (360 * 4 + (360 - (m.pick * seg + seg / 2))) * lerp(t, m.t0 + 0.05, se, 0, 1, Easing.out(Easing.cubic));
    out.push(<div key={'mw' + m.t0} style={{position: 'absolute', right: 30, bottom: 120, width: 420, zIndex: 39, opacity: a, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${popT(t, m.t0 - 0.2, 10)})`, transformOrigin: 'right bottom'}}>
      <div style={{background: INK, border: '5px solid #fff', borderRadius: 18, padding: '6px 18px 0', ...font, fontSize: 36, color: YELLOW, marginBottom: 6}}>🎲 RANDOM EVENT</div>
      <svg width={360} height={330} style={{overflow: 'visible'}}><DWheel items={m.items} cols={['#e5322d', '#1f6fe0', '#22a95b', '#13b5c8', '#ff8a1f', '#7b2cbf']} rot={rot} R={135} cx={180} cy={185} fs={21} /></svg>
      {t > se && <div style={{marginTop: 4, transform: `scale(${popT(t, se, 10)})`, background: YELLOW, border: `6px solid ${INK}`, borderRadius: 18, padding: '6px 16px 0', ...font, fontSize: 34, color: INK, textAlign: 'center', whiteSpace: 'nowrap'}}>{m.result}</div>}
    </div>);
  }
  for (const [tq, txt] of (Dd.asks || []) as [number, string][]) {
    if (t < tq || t > tq + 4.6) continue; const a = popT(t, tq, 10) * lerp(t, tq + 4.1, tq + 4.6, 1, 0);
    out.push(<div key={'ask' + tq} style={{position: 'absolute', left: 30, top: 200, zIndex: 39, transform: `scale(${a}) rotate(-1.5deg)`, transformOrigin: 'left center', background: '#fff', border: `6px solid ${INK}`, borderRadius: 22, padding: '10px 22px 4px', ...font, fontSize: 40, color: INK, boxShadow: '0 8px 0 rgba(0,0,0,0.4)'}}>{txt}</div>);
  }
  return <>{out}</>;
};
const replayAt = (tR: number) => { const Dd = X.D.duel; if (!Dd || !Dd.replays) return null; return (Dd.replays as any[]).find((r) => tR >= r[0] && tR < r[1]) || null; };
const DuelReal: React.FC<{tR: number}> = ({tR}) => {
  const Dd = X.D.duel; if (!Dd) return null; const out: React.ReactNode[] = [];
  const rp = replayAt(tR);
  if (rp) { const a = Math.min(1, (tR - rp[0]) / 0.2, (rp[1] - tR) / 0.2);
    out.push(<AbsoluteFill key="rp" style={{zIndex: 48, opacity: a, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', inset: 0, border: '18px solid rgba(255,255,255,0.9)', boxShadow: 'inset 0 0 80px rgba(0,0,0,0.6)'}} />
      <div style={{position: 'absolute', left: 60, top: 230, display: 'flex', alignItems: 'center', gap: 14, background: RED, border: `6px solid ${INK}`, borderRadius: 18, padding: '6px 22px 0', ...font, fontSize: 60, color: '#fff'}}><span style={{width: 26, height: 26, borderRadius: 13, background: '#fff', opacity: Math.floor(tR * 3) % 2 ? 1 : 0.2}} />{rp[2] || 'REPLAY'}</div>
      <div style={{position: 'absolute', right: 60, top: 240, ...font, fontSize: 48, color: '#fff', textShadow: `4px 4px 0 ${INK}`}}>⏪ SLOW MOTION</div>
    </AbsoluteFill>); }
  for (const [r0, r1, txt, sub] of (Dd.teaser || []) as any[]) {
    if (tR < r0 || tR >= r1) continue; const a = popT(tR, r0, 12);
    out.push(<AbsoluteFill key={'tz' + r0} style={{zIndex: 49, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 400, textAlign: 'center', transform: `scale(${a}) rotate(-3deg)`}}>
        <div style={{...font, fontSize: 150, color: YELLOW, textShadow: `9px 9px 0 ${INK}`}}>{txt}</div>
        {sub && <div style={{...font, fontSize: 70, color: '#fff', textShadow: `6px 6px 0 ${INK}`}}>{sub}</div>}
      </div>
    </AbsoluteFill>);
    if (tR - r0 < 0.12) out.push(<AbsoluteFill key={'tf' + r0} style={{zIndex: 50, background: '#fff', opacity: 1 - (tR - r0) / 0.12}} />);
  }
  return <>{out}</>;
};
const DuelExtra: React.FC<{t: number}> = ({t}) => {
  const Dd = X.D.duel; if (!Dd) return null; const out: React.ReactNode[] = [];
  // reglas numeradas
  for (const [r0, r1, rows] of (Dd.rules || []) as any[]) {
    if (t < r0 - 0.2 || t > r1 + 0.3) continue; const a = lerp(t, r1, r1 + 0.3, 1, 0);
    out.push(<div key="rules" style={{position: 'absolute', left: 0, right: 0, bottom: 70, zIndex: 45, display: 'flex', justifyContent: 'center', gap: 12, opacity: a}}>
      {(rows as string[][]).map(([ic, tx], i) => { const ti = r0 + i * 0.45; if (t < ti) return null; return (
        <div key={i} style={{transform: `scale(${popT(t, ti, 11)}) rotate(${i % 2 ? 1.5 : -1.5}deg)`, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: `5px solid ${INK}`, borderRadius: 20, padding: '5px 14px 1px', boxShadow: '0 8px 0 rgba(0,0,0,0.4)'}}>
          <span style={{width: 40, height: 40, borderRadius: 20, background: INK, color: YELLOW, ...font, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</span>
          <span style={{fontSize: 32}}>{ic}</span><span style={{...font, fontSize: 29, color: INK, whiteSpace: 'nowrap'}}>{tx}</span>
        </div>); })}
    </div>);
  }
  // registro de capturas (como el battle royale)
  const fd = ((Dd.feed || []) as any[]).filter((f) => f[0] <= t && t < f[0] + 9).slice(-5);
  const miniOn = ((Dd.minis || []) as any[]).some((m) => t >= m.t0 - 0.3 && t < m.t1 + 0.5);
  for (const [w0, wt] of (Dd.where || []) as any[]) { if (t < w0 || t > w0 + 3.6) continue;
    out.push(<div key={'wh' + w0} style={{position: 'absolute', left: 0, right: 0, top: 300, zIndex: 36, display: 'flex', justifyContent: 'center', opacity: lerp(t, w0 + 3.2, w0 + 3.6, 1, 0)}}>
      <div style={{transform: `scale(${popT(t, w0, 11)})`, background: 'rgba(14,20,32,0.9)', border: `5px solid #fff`, borderRadius: 40, padding: '6px 26px 0', ...font, fontSize: 40, color: '#fff', textShadow: `3px 3px 0 ${INK}`, whiteSpace: 'nowrap'}}>{wt}</div>
    </div>); }
  if (!miniOn && t > (Dd.hud[0] || 0) + 1 && t < X.D.winT) out.push(<div key="feed" style={{position: 'absolute', left: 22, bottom: 150, zIndex: 33, display: 'flex', flexDirection: 'column', gap: 6}}>
    {fd.map((f, i) => { const a = popT(t, f[0], 12) * lerp(t, f[0] + 8.4, f[0] + 9, 1, 0); return (
      <div key={f[0] + '' + i} style={{transform: `translateX(${(1 - a) * -260}px)`, opacity: a, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(14,20,32,0.88)', border: `3px solid ${INK}`, borderRadius: 10, padding: '4px 12px 0'}}>
        <FlagImg k={f[1]} w={40} h={28} /><span style={{...font, fontSize: 28, color: f[3] || YELLOW}}>{f[2]}</span>
      </div>); })}
  </div>);
  // misiones
  for (const m of (Dd.missions || []) as any[]) {
    if (t < m.t0 || t > m.t1 + 2.4) continue; const prog = Math.min(1, (t - m.t0) / (m.t1 - m.t0)); const done = t >= m.t1;
    const a = popT(t, m.t0, 10) * lerp(t, m.t1 + 2.0, m.t1 + 2.4, 1, 0);
    out.push(<div key={'mi' + m.t0} style={{position: 'absolute', left: 24, top: 200, zIndex: 37, transform: `scale(${a})`, transformOrigin: 'left top', width: 560, background: CREAM, border: `6px solid ${INK}`, borderRadius: 20, padding: '10px 18px', boxShadow: '0 8px 0 rgba(0,0,0,0.4)'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10}}><FlagImg k={m.k} w={50} h={34} /><span style={{...font, fontSize: 32, color: RED}}>🎯 MISSION</span></div>
      <div style={{...font, fontSize: 36, color: INK, marginTop: 4}}>{m.text}</div>
      <div style={{height: 22, background: '#ddd', border: `4px solid ${INK}`, borderRadius: 12, marginTop: 8, overflow: 'hidden'}}><div style={{width: `${(done ? 1 : prog) * 100}%`, height: '100%', background: done ? (m.ok ? '#22a95b' : RED) : YELLOW}} /></div>
      {done && <div style={{position: 'absolute', right: -20, top: -24, transform: `scale(${popT(t, m.t1, 10)}) rotate(8deg)`, background: m.ok ? '#22a95b' : RED, border: `6px solid ${INK}`, borderRadius: 18, padding: '4px 14px 0', ...font, fontSize: 44, color: '#fff'}}>{m.ok ? '✅ DONE' : '❌ FAILED'}</div>}
    </div>);
  }
  return <>{out}</>;
};
const BossFX: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const Dd = X.D.duel; if (!Dd || !Dd.boss) return null; const out: React.ReactNode[] = [];
  for (const b of Dd.boss as any[]) {
    if (t < b.t0 || t > b.t1 + 1.5) continue;
    const f = Math.min(1, (t - b.t0) / (b.t1 - b.t0)); const P = b.path as number[][]; const sg = f * (P.length - 1); const i0 = Math.min(P.length - 2, Math.floor(sg)); const ff = sg - i0;
    const [x, y] = toS(P[i0][0] + (P[i0 + 1][0] - P[i0][0]) * ff, P[i0][1] + (P[i0 + 1][1] - P[i0][1]) * ff, cam);
    const hp = Math.max(0, dval(b.hp, t, 1)); const dead = t >= b.t1; const sz = 150 * Math.min(1.6, cam.s / 2.5);
    const flash = (b.hp as number[][]).some((h) => t >= h[0] && t < h[0] + 0.15);
    out.push(<g key={'boss' + b.t0} opacity={dead ? lerp(t, b.t1, b.t1 + 1.5, 1, 0) : 1}>
      {!dead && <ellipse cx={x} cy={y + sz * 0.35} rx={sz * 0.6} ry={sz * 0.16} fill="rgba(0,0,0,0.35)" />}
      {!dead && <g transform={`translate(${x},${y}) scale(${b.flip ? -1 : 1},1)`}>
        <rect x={-sz * 0.55} y={-sz * 0.05} width={sz * 1.1} height={sz * 0.34} rx={sz * 0.12} fill="#3d3f45" stroke={INK} strokeWidth={6} />
        {Array.from({length: 5}).map((_, j) => <circle key={j} cx={-sz * 0.42 + j * sz * 0.21} cy={sz * 0.12} r={sz * 0.07} fill="#777" stroke={INK} strokeWidth={4} transform={`rotate(${t * 300} ${-sz * 0.42 + j * sz * 0.21} ${sz * 0.12})`} />)}
        <rect x={-sz * 0.4} y={-sz * 0.32} width={sz * 0.8} height={sz * 0.3} rx={sz * 0.08} fill={b.col} stroke={INK} strokeWidth={6} />
        <rect x={sz * 0.25} y={-sz * 0.24} width={sz * 0.55} height={sz * 0.08} fill="#2a2a2a" stroke={INK} strokeWidth={4} />
        <circle cx={-sz * 0.05} cy={-sz * 0.18} r={sz * 0.17} fill={flash ? '#fff' : b.col} stroke={INK} strokeWidth={6} />
        <circle cx={-sz * 0.1} cy={-sz * 0.2} r={sz * 0.035} fill={INK} /><circle cx={sz * 0.02} cy={-sz * 0.2} r={sz * 0.035} fill={INK} />
      </g>}
      {!dead && <g transform={`translate(${x - 140},${y - sz * 0.75})`}>
        <rect width={280} height={58} rx={12} fill="rgba(14,20,32,0.92)" stroke={INK} strokeWidth={4} />
        <text x={140} y={24} textAnchor="middle" fontSize={22} style={{fontFamily: 'Lilita'}} fill={YELLOW}>{b.name}</text>
        <rect x={12} y={32} width={256} height={16} rx={8} fill="#333" /><rect x={12} y={32} width={256 * hp} height={16} rx={8} fill={hp > 0.5 ? '#3bd16f' : hp > 0.25 ? '#ffb000' : '#ff3030'} />
      </g>}
      {dead && t < b.t1 + 1.2 && <circle cx={x} cy={y} r={40 + (t - b.t1) * 400} fill="#ffb000" opacity={0.6 * (1 - (t - b.t1) / 1.2)} />}
    </g>);
  }
  if (!out.length) return null;
  return <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0, zIndex: 13, overflow: 'visible'}}>{out}</svg>;
};
// ===================== CONTINENTS WAR =====================
const CWST = new Map<number, any>();
const cwState = (t: number) => {
  const C = X.D.cw; if (!C) return null;
  const key0 = Math.round(t * 30); const hit = CWST.get(key0); if (hit) return hit;
  const team = new Int16Array(NK).fill(-1); const dead = new Uint8Array(NK);
  for (const e of C.tev as number[][]) { if (e[0] > t) break; team[e[1]] = e[2]; dead[e[1]] = e[3]; }
  const has = (C.teams as any[]).map((_: any, i: number) => team.some((v) => v === i));
  let key = ''; for (let k = 0; k < NK; k++) key += String.fromCharCode(65 + team[k] + 1);
  const st = {team, dead, has, key, cols: (C.teams as any[]).map((T: any) => T.col)};
  CWST.set(key0, st); if (CWST.size > 200) CWST.delete(CWST.keys().next().value as number);
  return st;
};
const cwLit = (t: number): number[] | null => {
  const C = X.D.cw; if (!C) return null; const it = (C.intro as any[]).find((x) => t >= x[0] && t < x[1]); if (!it) return null;
  const st = cwState(t); if (!st) return null; const out: number[] = []; for (let k = 0; k < NK; k++) if (st.team[k] === it[2]) out.push(k); return out;
};
const kfl = (pk: number[][], t: number) => { if (!pk.length) return 0; if (t <= pk[0][0]) return pk[0][1]; for (let i = 1; i < pk.length; i++) if (t <= pk[i][0]) { const u = (t - pk[i - 1][0]) / Math.max(1e-6, pk[i][0] - pk[i - 1][0]); return pk[i - 1][1] + (pk[i][1] - pk[i - 1][1]) * u; } return pk[pk.length - 1][1]; };
const eocf = (u: number) => { u = Math.min(1, Math.max(0, u)); return 1 - Math.pow(1 - u, 3); };
const cwElimT = (i: number) => { const e = (X.D.cw.elim as any[]).find((x) => x[1] === i); return e ? e[0] : 1e9; };
const fmtN = (v: number) => Math.round(v).toLocaleString('en-US');
const cwMmss = (s: number) => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.floor(Math.max(0, s) % 60)).padStart(2, '0')}`;
const cwAdj = (n: string) => ({EUROPE: 'EUROPEAN', ASIA: 'ASIAN', 'NORTH AMERICA': 'N. AMERICAN', AFRICA: 'AFRICAN', 'SOUTH AMERICA': 'S. AMERICAN', OCEANIA: 'OCEANIAN'} as any)[n] || n;
const cwXY = (k: number) => (X.D.cw.capxy || {})[k] as number[] | undefined;
const cwIntroAt = (t: number) => (X.D.cw.intro as any[]).find((x) => t >= x[0] - 0.2 && t < x[1] + 0.3);
const cwFirstSeen = (i: number) => { const it = (X.D.cw.intro as any[]).find((x) => x[2] === i); return it ? it[0] + 1.2 : 0; };

const ChestSVG: React.FC<{rar: number; open: number; shake: number}> = ({rar, open, shake}) => {
  const col = ['#9a6a3a', '#3a8cff', '#a64dff', '#ffc21a'][rar]; const rim = ['#5a3a1a', '#1a4f9e', '#5a1a9e', '#a87a00'][rar];
  return (
    <svg width={300} height={270} viewBox="-150 -160 300 270" style={{overflow: 'visible'}}>
      {open > 0 && Array.from({length: 14}).map((_, i) => { const a = (i / 14) * Math.PI * 2 + open; const L = 60 + 160 * open; return <line key={i} x1={0} y1={-40} x2={Math.cos(a) * L} y2={-40 + Math.sin(a) * L} stroke={col} strokeWidth={12} opacity={0.75 * (1 - open * 0.6)} strokeLinecap="round" />; })}
      {open > 0 && <circle cx={0} cy={-40} r={40 + 140 * open} fill={rar === 3 ? '#fff4b0' : '#ffffff'} opacity={0.55 * (1 - open)} />}
      <g transform={`rotate(${shake > 0 ? Math.sin(shake * 40) * 6 : 0})`}>
        <rect x={-110} y={-30} width={220} height={120} rx={16} fill={col} stroke={INK} strokeWidth={9} />
        <rect x={-110} y={-30} width={220} height={24} fill={rim} stroke={INK} strokeWidth={6} />
        <rect x={-20} y={-12} width={40} height={48} rx={7} fill="#ffd23f" stroke={INK} strokeWidth={6} />
        <g transform={`translate(0,-30) translate(0,${-open * 40}) scale(1,${1 - open * 0.55})`}>
          <path d="M-114,0 L-114,-50 Q0,-104 114,-50 L114,0 Z" fill={col} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
          <path d="M-66,-6 L-66,-66 M66,-6 L66,-66" stroke={rim} strokeWidth={16} />
        </g>
      </g>
    </svg>
  );
};

const CwFace: React.FC<{mood: 'scared' | 'dead' | 'idle'; r: number; t: number}> = ({mood, r, t}) => {
  const jx = mood === 'scared' ? Math.sin(t * 60) * r * 0.05 : 0;
  return (
    <g transform={`translate(${jx},0)`}>
      <circle r={r} fill={mood === 'dead' ? '#9aa0a8' : '#ffd23f'} stroke={INK} strokeWidth={r * 0.12} />
      {mood === 'scared' && <>
        <path d={`M${-r * 0.55},${-r * 0.45} L${-r * 0.15},${-r * 0.55} M${r * 0.55},${-r * 0.45} L${r * 0.15},${-r * 0.55}`} stroke={INK} strokeWidth={r * 0.1} strokeLinecap="round" />
        <circle cx={-r * 0.33} cy={-r * 0.12} r={r * 0.2} fill="#fff" stroke={INK} strokeWidth={r * 0.06} /><circle cx={r * 0.33} cy={-r * 0.12} r={r * 0.2} fill="#fff" stroke={INK} strokeWidth={r * 0.06} />
        <circle cx={-r * 0.33} cy={-r * 0.1} r={r * 0.07} fill={INK} /><circle cx={r * 0.33} cy={-r * 0.1} r={r * 0.07} fill={INK} />
        <ellipse cx={0} cy={r * 0.45} rx={r * 0.18} ry={r * 0.24} fill={INK} />
        <path d={`M${r * 0.75},${-r * 0.6} q${r * 0.12},${r * 0.25} 0,${r * 0.32} q${-r * 0.12},${-r * 0.07} 0,${-r * 0.32}`} fill="#7fd0ff" stroke={INK} strokeWidth={r * 0.04} />
      </>}
      {mood === 'dead' && <>
        {[-1, 1].map((sd) => <path key={sd} d={`M${sd * r * 0.33 - r * 0.15},${-r * 0.27} l${r * 0.3},${r * 0.3} m0,${-r * 0.3} l${-r * 0.3},${r * 0.3}`} stroke={INK} strokeWidth={r * 0.11} strokeLinecap="round" />)}
        <path d={`M${-r * 0.3},${r * 0.45} L${r * 0.3},${r * 0.45}`} stroke={INK} strokeWidth={r * 0.1} strokeLinecap="round" />
        <path d={`M${r * 0.12},${r * 0.45} q${r * 0.12},${r * 0.28} ${r * 0.22},0`} fill="#ff6b8a" stroke={INK} strokeWidth={r * 0.05} />
      </>}
      {mood === 'idle' && <>
        <circle cx={-r * 0.33} cy={-r * 0.12} r={r * 0.11} fill={INK} /><circle cx={r * 0.33} cy={-r * 0.12} r={r * 0.11} fill={INK} />
        <path d={`M${-r * 0.3},${r * 0.35} Q0,${r * 0.6} ${r * 0.3},${r * 0.35}`} stroke={INK} strokeWidth={r * 0.1} fill="none" strokeLinecap="round" />
      </>}
    </g>
  );
};

const CwFX: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const C = X.D.cw; if (!C) return null; const out: React.ReactNode[] = [];
  const S = Math.max(0.55, Math.min(1.5, cam.s / 0.9)); const st = cwState(t); const winT = C.win ? C.win[0] : 1e9;
  // nombres grandes de los continentes en vistas amplias
  if (st && cam.s < 0.5 && t < winT && !cwIntroAt(t)) {
    (C.teams as any[]).forEach((T: any, i: number) => {
      if (t > cwElimT(i) + 1) return; const xs: number[] = [], ys: number[] = [];
      for (let k = 0; k < NK; k++) if (st.team[k] === i && !st.dead[k]) { const xy = cwXY(k); if (xy) { xs.push(xy[0]); ys.push(xy[1]); } }
      if (!xs.length) return; xs.sort((a, b) => a - b); ys.sort((a, b) => a - b);
      const [x, y] = toS(xs[Math.floor(xs.length / 2)], ys[Math.floor(ys.length / 2)], cam); const a = Math.min(1, (0.5 - cam.s) / 0.1);
      out.push(<g key={'lab' + i} opacity={a}><text x={x} y={y + 60} textAnchor="middle" fontSize={44} style={{fontFamily: 'Lilita'}} fill={T.col} stroke={INK} strokeWidth={10} paintOrder="stroke">{T.emo} {T.name}</text></g>);
    });
  }
  // bases
  (C.teams as any[]).forEach((T: any, i: number) => {
    if (t > cwElimT(i) || t > winT || t < cwFirstSeen(i)) return;
    const [x, y] = toS(T.hq[0], T.hq[1], cam); if (x < -100 || x > VW + 100 || y < -100 || y > VH + 100) return;
    const act = (C.turns as any[]).find((u) => t >= u.t0 && t < u.t1 && u.team === i);
    const r = 30 * S * (act ? 1 + 0.08 * Math.sin(t * 8) : 1);
    out.push(<g key={'hq' + i}>
      {act && <circle cx={x} cy={y} r={r * 2.1} fill={T.col} opacity={0.25 + 0.1 * Math.sin(t * 6)} />}
      <circle cx={x} cy={y} r={r} fill={T.col} stroke={INK} strokeWidth={6} />
      <text x={x} y={y + r * 0.36} textAnchor="middle" fontSize={r * 1.05}>{T.emo}</text>
      <text x={x} y={y + r + 24 * S} textAnchor="middle" fontSize={20 * S} style={{fontFamily: 'Lilita'}} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">{T.name} HQ</text>
    </g>);
  });
  // calaveras sobre los países destruidos
  if (st && t < winT) for (const r of C.res as any[]) {
    if (r[2] !== 'dead' || t < r[0]) continue; const k = r[1]; if (!st.dead[k]) continue; const xy = cwXY(k); if (!xy) continue;
    const [x, y] = toS(xy[0], xy[1], cam); if (x < -80 || x > VW + 80 || y < -80 || y > VH + 80) continue;
    const e = t - r[0]; const big = e < 1.6 ? 1 + 1.6 * (1 - e / 1.6) * popT(t, r[0], 10) : 1; const sz = 30 * Math.min(1.3, S) * big;
    out.push(<g key={'sk' + r[0] + k}>{e < 1.6 && <text x={x} y={y - 70} textAnchor="middle" fontSize={40} style={{fontFamily: 'Lilita'}} fill="#ff3b3b" stroke={INK} strokeWidth={9} paintOrder="stroke" opacity={lerp(e, 1.2, 1.6, 1, 0)}>DESTROYED</text>}<text x={x} y={y + sz * 0.35} textAnchor="middle" fontSize={sz}>💀</text></g>);
  }
  // refuerzos que caen en la base / caja de suministros
  for (const [t0, t1, wx, wy, emo, n] of C.drops as any[]) {
    if (t < t0 || t > t1 + 0.4) continue; const [x, y] = toS(wx, wy, cam); const a = lerp(t, t1, t1 + 0.4, 1, 0);
    if (n < 0) {
      const f = Math.min(1, (t - t0) / 1.3); const yy = y - 520 * (1 - Easing.out(Easing.quad)(f));
      out.push(<g key={'cr' + t0} opacity={a}>
        {f < 1 && <><path d={`M${x - 70},${yy - 150} Q${x},${yy - 230} ${x + 70},${yy - 150}`} fill="#fff" stroke={INK} strokeWidth={5} /><line x1={x - 66} y1={yy - 150} x2={x} y2={yy - 40} stroke={INK} strokeWidth={3} /><line x1={x + 66} y1={yy - 150} x2={x} y2={yy - 40} stroke={INK} strokeWidth={3} /></>}
        <circle cx={x} cy={yy} r={90 + 10 * Math.sin(t * 6)} fill="#ffd23f" opacity={0.25} />
        <text x={x} y={yy + 40} textAnchor="middle" fontSize={120}>📦</text>
      </g>);
      continue;
    }
    for (let j = 0; j < n; j++) {
      const td = t0 + j * 0.07; const e = t - td; if (e < 0) continue;
      const ang = (j / n) * Math.PI * 2 + 0.4; const rr = (55 + (j % 3) * 26) * S;
      const tx = x + Math.cos(ang) * rr, ty = y + Math.sin(ang) * rr * 0.6;
      const f = Math.min(1, e / 0.45); const yy = ty - 260 * (1 - Easing.out(Easing.back(1.6))(f));
      out.push(<text key={'d' + t0 + '-' + j} x={tx} y={yy} textAnchor="middle" fontSize={56 * S} opacity={a}>{emo}</text>);
    }
  }
  // atacantes resaltados y objetivo
  for (const u of C.turns as any[]) {
    if (u.atk && t >= u.atk[0] && t < u.atk[0] + 3.2) {
      const T0 = C.teams[u.team];
      (u.atk[1] as number[]).forEach((k, j) => { const xy = cwXY(k); if (!xy) return; const [x, y] = toS(xy[0], xy[1], cam); const p = 0.5 + 0.5 * Math.sin(t * 9 + j);
        out.push(<g key={'at' + u.t0 + k}><circle cx={x} cy={y} r={34 + 10 * p} fill="none" stroke={T0.col} strokeWidth={8} /><text x={x} y={y - 52} textAnchor="middle" fontSize={30} style={{fontFamily: 'Lilita'}} fill="#fff" stroke={T0.col} strokeWidth={8} paintOrder="stroke">⚔️ {SNAME(k)}</text></g>); });
    }
    if (!u.target || !u.atk) continue; const tl = u.target[0], te = u.atk[0] + 3.4; if (t < tl || t > te) continue;
    const k = u.target[1]; const T0 = (C.teams as any[])[u.target[2]]; const wx = cwXY(k);
    if (!wx) continue; const [x, y] = toS(wx[0], wx[1], cam); const p = 0.5 + 0.5 * Math.sin(t * 10);
    out.push(<g key={'tg' + tl}><circle cx={x} cy={y} r={46 + 10 * p} fill="none" stroke="#ff3b3b" strokeWidth={8} /><line x1={x - 74} y1={y} x2={x - 30} y2={y} stroke="#ff3b3b" strokeWidth={8} /><line x1={x + 30} y1={y} x2={x + 74} y2={y} stroke="#ff3b3b" strokeWidth={8} /><line x1={x} y1={y - 74} x2={x} y2={y - 30} stroke="#ff3b3b" strokeWidth={8} /><line x1={x} y1={y + 30} x2={x} y2={y + 74} stroke="#ff3b3b" strokeWidth={8} />
      <text x={x} y={y - 90} textAnchor="middle" fontSize={38} style={{fontFamily: 'Lilita'}} fill="#fff" stroke={T0 ? T0.col : INK} strokeWidth={9} paintOrder="stroke">🎯 {SNAME(k)}</text></g>);
  }
  // barras de vida en capitales debilitadas
  for (const [k, pk] of C.caphp as any[]) {
    const v = kfl(pk, t); if (v >= 99.5 || (st && st.dead[k] && v <= 0.5)) continue;
    const xy = cwXY(k); if (!xy) continue; const [x, y] = toS(xy[0], xy[1], cam);
    if (x < -60 || x > VW + 60 || y < -60 || y > VH + 60) continue;
    const w = 110 * Math.min(1.2, S); const col = v > 60 ? '#4dff7a' : v > 30 ? '#ffd23f' : '#ff3b3b';
    out.push(<g key={'ch' + k}><rect x={x - w / 2 - 5} y={y - 44} width={w + 10} height={26} rx={9} fill={INK} /><rect x={x - w / 2} y={y - 39} width={w * v / 100} height={16} rx={6} fill={col} />
      <text x={x} y={y - 52} textAnchor="middle" fontSize={24} style={{fontFamily: 'Lilita'}} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">🩸 {Math.round(v)}%</text></g>);
  }
  // continente eliminado: sus capitales parpadean en rojo
  for (const [t0, i] of (C.elimfx || []) as any[]) {
    if (t < t0 || t > t0 + 2.4) continue; const p = 0.5 + 0.5 * Math.sin((t - t0) * 14);
    for (let k = 0; k < NK; k++) { if (!st || st.team[k] !== i && !(st.dead[k] && X.D.cw.tev)) continue; }
    (C.capall?.[i] || []).forEach((xy: number[], j: number) => { const [x, y] = toS(xy[0], xy[1], cam); out.push(<circle key={'ef' + t0 + j} cx={x} cy={y} r={26 + 18 * p} fill="#ff3b3b" opacity={0.45 * lerp(t, t0 + 1.8, t0 + 2.4, 1, 0)} />); });
  }
  // caza de ciudades
  for (const ev of C.cities as any[]) {
    if (t < ev.t0 || t > ev.t1) continue;
    for (const [wx, wy, name, tf, tdie] of ev.pts as any[]) {
      if (t < tf - 0.1) continue; const [x, y] = toS(wx, wy, cam); const dead = tdie && t > tdie; const r = 44 * Math.min(1.6, Math.max(0.8, cam.s / 1.4));
      const pop = popT(t, tf, 10); const saved = !tdie && t > tf + 1.6;
      out.push(<g key={'cf' + tf} transform={`translate(${x},${y - r * 1.4}) scale(${pop})`}>
        {dead && t < tdie + 1.0 && <circle r={r * (1 + (t - tdie) * 6)} fill="#ffb000" opacity={0.6 * (1 - (t - tdie))} />}
        <CwFace mood={dead ? 'dead' : saved ? 'idle' : 'scared'} r={r} t={t} />
        <text y={r + 36} textAnchor="middle" fontSize={34} style={{fontFamily: 'Lilita'}} fill="#fff" stroke={INK} strokeWidth={8} paintOrder="stroke">{name}</text>
        {saved && <text y={-r - 14} textAnchor="middle" fontSize={32} style={{fontFamily: 'Lilita'}} fill="#4dff7a" stroke={INK} strokeWidth={7} paintOrder="stroke">SAFE... 😮‍💨</text>}
        {dead && <text y={-r - 14} textAnchor="middle" fontSize={36} style={{fontFamily: 'Lilita'}} fill="#ff3b3b" stroke={INK} strokeWidth={8} paintOrder="stroke">💀 DESTROYED</text>}
      </g>);
    }
  }
  return <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none', zIndex: 12, overflow: 'visible'}}>{out}</svg>;
};

const CwBar: React.FC<{i: number; t: number; w: number; act: boolean}> = ({i, t, w, act}) => {
  const C = X.D.cw; const T = C.teams[i]; const v = Math.max(0, kfl(C.hp[i], t)); const vg = Math.max(0, kfl(C.hp[i], t - 0.8));
  const pw = kfl(C.pw[i], t); const cnt = Math.round(kfl(C.cnt[i], t)); const dead = t >= cwElimT(i);
  const low = v < 25 && !dead; const fl = low ? 0.5 + 0.5 * Math.sin(t * 9) : 0;
  const hit = (C.turns as any[]).find((u) => u.dp && u.dp[1] === i && t >= u.dp[0] && t < u.dp[0] + 0.5); const sh = hit ? Math.sin(t * 70) * 6 : 0;
  return (
    <div style={{width: w, background: dead ? 'rgba(40,40,46,0.94)' : 'rgba(10,14,26,0.94)', border: `6px solid ${act ? '#fff' : dead ? '#555' : T.col}`, borderRadius: 22, padding: '8px 12px 10px', boxShadow: act ? `0 0 28px 8px ${T.col}` : '0 6px 0 rgba(0,0,0,0.45)', filter: dead ? 'grayscale(1)' : undefined, position: 'relative', transform: `translateX(${sh}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
        <div style={{width: 54, height: 54, borderRadius: '50%', background: T.col, border: `4px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32}}>{T.emo}</div>
        <div style={{flex: 1, overflow: 'hidden'}}>
          <div style={{...font, fontSize: T.name.length > 10 ? 27 : 33, color: '#fff', whiteSpace: 'nowrap', lineHeight: 1.05}}>{T.name}</div>
          <div style={{...font, fontSize: 22, color: '#cfe3ff', lineHeight: 1.1}}>🏳️ {cnt} / {T.n0} COUNTRIES</div>
        </div>
        <div style={{...font, fontSize: 40, color: dead ? '#999' : v < 25 ? '#ff5a5a' : '#fff'}}>{dead ? '💀' : `${Math.round(v)}%`}</div>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 6}}>
        <span style={{...font, fontSize: 17, color: '#9fb3d0'}}>TERRITORY</span>
        <div style={{position: 'relative', flex: 1, height: 24, background: '#2a2f3a', borderRadius: 10, border: `3px solid ${INK}`, overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${vg}%`, background: '#fff', opacity: 0.85}} />
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${v}%`, background: low ? `rgb(255,${Math.round(60 + 80 * fl)},60)` : `linear-gradient(180deg, ${T.col}, ${T.col2})`}} />
        </div>
      </div>
      <div style={{...font, fontSize: 20, color: '#ffe680', marginTop: 4}}>⚡ {fmtN(pw)} POWER</div>
      {dead && <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: 46, color: '#ff3b3b', textShadow: `4px 4px 0 ${INK}`, transform: 'rotate(-6deg)'}}>ELIMINATED</div>}
    </div>
  );
};

const CwWheelRot = (wd: any, t: number) => wd.tg * eocf((t - wd.t0 - 0.05) / Math.max(0.01, wd.se - wd.t0 - 0.05));
const CW_STEPS = [['📦', 'CHEST'], ['🎯', 'TARGET'], ['🎡', 'ATTACKERS'], ['💥', 'RESULT']];

const CwHud: React.FC<{t: number}> = ({t}) => {
  const C = X.D.cw; if (!C) return null; const out: React.ReactNode[] = []; const CX = VW / 2;
  const winT = C.win ? C.win[0] : 1e9; const g0 = C.g0 || 0;
  const act = (C.turns as any[]).find((u) => t >= u.t0 && t < u.t1);
  // --- paneles de continentes (6; al caer Oceanía/Sudamérica quedan los 4 de las esquinas) ---
  const POS: [number, number][] = [[20, 18], [VW - 470, 18], [20, VH - 186], [VW - 470, VH - 186], [20, VH / 2 - 90], [VW - 470, VH / 2 - 90]];
  if (t < winT + 0.5) (C.teams as any[]).forEach((_: any, i: number) => {
    const fs = cwFirstSeen(i); if (t < fs - 0.4) return;
    const et = cwElimT(i); if (i >= 4 && t > et + 5.5) return;
    const hideR = (C.rules as any[]).length ? lerp(t, C.rules[0][0] - 0.3, C.rules[0][0], 1, 0) + lerp(t, C.hook2[1] - 0.1, C.hook2[1] + 0.4, 0, 1) : 1;
    const p = popT(t, fs - 0.4, 9) * (i >= 4 ? lerp(t, et + 4.5, et + 5.5, 1, 0) : 1) * Math.min(1, hideR);
    if (p < 0.02) return;
    const [x, y] = POS[i];
    out.push(<div key={'p' + i} style={{position: 'absolute', left: x, top: y, transform: `scale(${p})`, transformOrigin: i % 2 ? 'right center' : 'left center', zIndex: 30, opacity: Math.min(1, p * 1.5)}}><CwBar i={i} t={t} w={450} act={!!act && act.team === i} /></div>);
  });
  // --- gancho ---
  if (C.hook && t < C.hook[1] + 0.4) {
    const a = lerp(t, C.hook[1], C.hook[1] + 0.4, 1, 0);
    out.push(<AbsoluteFill key="hook" style={{zIndex: 44, background: `rgba(4,8,18,${0.35 * a})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: a}}>
      <div style={{...font, fontSize: 140, color: '#fff', textShadow: `9px 9px 0 ${INK}`, transform: `scale(${popT(t, 0.05, 9)})`, lineHeight: 1}}>6 CONTINENTS</div>
      <div style={{...font, fontSize: 104, color: YELLOW, textShadow: `8px 8px 0 ${INK}`, transform: `scale(${popT(t, 0.45, 9)})`}}>GO TO WAR</div>
      <div style={{...font, fontSize: 72, color: '#ff5a5a', textShadow: `6px 6px 0 ${INK}`, transform: `scale(${popT(t, 1.1, 9)})`}}>ONLY 1 SURVIVES</div>
    </AbsoluteFill>);
  }
  // --- presentación de continentes ---
  const it = cwIntroAt(t);
  if (it) {
    const [t0, t1, i, lead, n, pw] = it; const T = C.teams[i]; const a = lerp(t, t0 - 0.2, t0 + 0.2, 0, 1) * lerp(t, t1, t1 + 0.3, 1, 0);
    const order = (C.intro as any[]).findIndex((x) => x[2] === i); const rk = 6 - order;
    out.push(<div key={'in' + i} style={{position: 'absolute', left: CX - 430, bottom: 40, width: 860, zIndex: 40, opacity: a, transform: `translateY(${(1 - popT(t, t0, 9)) * 120}px)`}}>
      <div style={{background: 'rgba(10,14,26,0.95)', border: `9px solid ${T.col}`, borderRadius: 30, padding: '14px 26px 16px', boxShadow: `0 0 40px ${T.col}`, display: 'flex', alignItems: 'center', gap: 22}}>
        <div style={{width: 130, height: 130, borderRadius: '50%', background: T.col, border: `7px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, flexShrink: 0}}>{T.emo}</div>
        <div style={{flex: 1}}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 14}}><span style={{...font, fontSize: 70, color: '#fff', textShadow: `5px 5px 0 ${INK}`}}>{T.name}</span><span style={{...font, fontSize: 30, color: rk === 1 ? '#4dff7a' : rk >= 5 ? '#ff6b6b' : '#ffd23f'}}>#{rk} {rk === 1 ? 'STRONGEST' : rk === 6 ? 'WEAKEST' : ''}</span></div>
          <div style={{display: 'flex', gap: 14, marginTop: 6, opacity: popT(t, t0 + 1.0, 10)}}>
            <span style={{background: '#22283a', borderRadius: 14, padding: '4px 14px 0', ...font, fontSize: 32, color: '#cfe3ff'}}>🏳️ {n} COUNTRIES</span>
            <span style={{background: '#22283a', borderRadius: 14, padding: '4px 14px 0', ...font, fontSize: 32, color: '#ffe680'}}>⚡ {fmtN(pw)} POWER</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, opacity: popT(t, t0 + 1.8, 10)}}><span style={{...font, fontSize: 30, color: '#fff'}}>💪 STRONGEST:</span><FlagImg k={lead} w={60} h={40} /><span style={{...font, fontSize: 34, color: T.col}}>{SNAME(lead)}</span></div>
        </div>
      </div></div>);
  }
  // --- reglas ---
  for (const [t0, t1, j] of C.rules as any[]) {
    if (t < t0 - 0.2 || t > t1 + 0.3) continue; const a = lerp(t, t0 - 0.2, t0 + 0.2, 0, 1) * lerp(t, t1, t1 + 0.3, 1, 0);
    const chip = (txt: string, col: string, d: number) => <div style={{background: col, border: `5px solid ${INK}`, borderRadius: 18, padding: '6px 20px 0', ...font, fontSize: 40, color: '#fff', textShadow: `3px 3px 0 ${INK}`, transform: `scale(${popT(t, t0 + d, 10)})`}}>{txt}</div>;
    const body = j === 0 ? <>
      <div style={{display: 'flex', gap: 20, alignItems: 'center'}}><ChestSVG rar={3} open={Math.min(1, Math.max(0, (t - t0 - 1.2) / 0.6))} shake={t < t0 + 1.2 ? t : 0} /><div style={{display: 'flex', flexDirection: 'column', gap: 12}}>{chip('👥 TROOPS · 🛡️ TANKS · ✈️ JETS', '#2f6bff', 1.6)}{chip('= MORE ⚡ POWER', '#11943c', 2.2)}{chip('💖 RARE CHESTS REVIVE FALLEN COUNTRIES', '#a64dff', 3.0)}</div></div></>
      : j === 1 ? <>
      <div style={{display: 'flex', gap: 16, marginTop: 6}}>{chip('🪖 1 = WEAKEN', '#ff9a1f', 1.0)}{chip('⚔️ 2 = DESTROY', '#e0202a', 1.6)}{chip('💥 3 = DESTROY + NEIGHBOUR', '#7a00e0', 2.2)}</div>
      <div style={{marginTop: 18, ...font, fontSize: 38, color: '#ffe680', opacity: popT(t, t0 + 3.0, 10)}}>⚡ MORE POWER = BIGGER SLICES ON THE WHEEL</div></>
      : <>
      <div style={{display: 'flex', gap: 16, marginTop: 6}}>{chip('💀 LOSE ALL YOUR COUNTRIES = ELIMINATED', '#c8141e', 1.0)}</div>
      <div style={{display: 'flex', gap: 16, marginTop: 14}}>{chip('🎉 SPECIAL EVENTS EVERY FEW MINUTES', '#ff8a1a', 1.8)}{chip('🏆 LAST ONE STANDING WINS', '#11943c', 2.6)}</div></>;
    const title = ['📦 EVERY TURN, A CONTINENT OPENS A CHEST', '🎯 THE ARROW PICKS AN ENEMY · 🎡 THE WHEEL PICKS HOW MANY ATTACK', '🏆 HOW TO WIN'][j];
    out.push(<AbsoluteFill key={'ru' + j} style={{zIndex: 43, background: `rgba(4,8,18,${0.62 * a})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: a}}>
      <div style={{...font, fontSize: 34, color: '#fff', background: '#22283a', borderRadius: 14, padding: '4px 18px 0', marginBottom: 12}}>📖 RULE {j + 1} / 3</div>
      <div style={{...font, fontSize: j === 1 ? 56 : 70, color: YELLOW, textShadow: `6px 6px 0 ${INK}`, textAlign: 'center', maxWidth: 1700, transform: `scale(${popT(t, t0, 10)})`}}>{title}</div>
      <div style={{marginTop: 22, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>{body}</div>
    </AbsoluteFill>);
  }
  // --- gancho 2 ---
  if (C.hook2 && t >= C.hook2[0] - 0.2 && t < C.hook2[1] + 0.3) {
    const [t0, t1] = C.hook2; const a = lerp(t, t0 - 0.2, t0 + 0.2, 0, 1) * lerp(t, t1, t1 + 0.3, 1, 0);
    out.push(<AbsoluteFill key="h2" style={{zIndex: 43, background: `rgba(30,0,0,${0.55 * a})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: a}}>
      <div style={{display: 'flex', gap: 30}}>{[5, 4].map((i, j) => <div key={i} style={{width: 150, height: 150, borderRadius: '50%', background: C.teams[i].col, border: `8px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 92, transform: `scale(${popT(t, t0 + j * 0.2, 10)}) rotate(${Math.sin(t * 12 + j) * 6}deg)`}}>{C.teams[i].emo}</div>)}</div>
      <div style={{...font, fontSize: 72, color: '#fff', textShadow: `6px 6px 0 ${INK}`, marginTop: 16}}>OCEANIA & SOUTH AMERICA ARE THE WEAKEST</div>
      <div style={{background: '#c8141e', border: `7px solid ${INK}`, borderRadius: 24, padding: '10px 34px 2px', ...font, fontSize: 66, color: '#fff', marginTop: 14, transform: `scale(${popT(t, t0 + 0.8, 10)})`}}>⚠️ CAN THEY SURVIVE 5 MINUTES?</div>
    </AbsoluteFill>);
  }
  // --- cuenta atrás ---
  const cd = (C.cds as any[]).filter((c) => t >= c[0] && t < c[1] && !(C.total && t >= C.total[0])).slice(-1)[0];
  if (cd) {
    const rem = cd[1] - t; const urgent = rem < 30; const fl = urgent && Math.floor(t * 4) % 2 === 0;
    out.push(<div key="cd" style={{position: 'absolute', top: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 31}}>
      <div style={{background: fl ? cd[3] : 'rgba(10,14,26,0.92)', border: `5px solid ${cd[3]}`, borderRadius: 18, padding: '4px 20px 0', ...font, fontSize: urgent ? 40 : 34, color: fl ? '#fff' : cd[3], transform: `scale(${rem < 5 ? 1.25 + 0.1 * Math.sin(t * 20) : 1})`}}>{cd[2]} <span style={{color: '#fff'}}>{cwMmss(rem)}</span></div>
    </div>);
  }
  // --- turno: cartel + indicador de pasos + explicación ---
  if (act) {
    const T = C.teams[act.team]; const a = lerp(t, act.t0, act.t0 + 0.25, 0, 1);
    const st = act.st as number[]; let cur = -1; st.forEach((x, j) => { if (t >= x) cur = j; });
    out.push(<div key="tb" style={{position: 'absolute', top: 84, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 33, opacity: a}}>
      <div style={{background: T.col, border: `6px solid ${INK}`, borderRadius: 22, padding: '6px 30px 0', ...font, fontSize: t < act.t0 + 1.5 ? 58 : 40, color: '#fff', textShadow: `4px 4px 0 ${INK}`, transform: `scale(${popT(t, act.t0, 10)})`}}>{T.emo} {T.name}'S TURN</div>
      {st.length > 0 && <div style={{display: 'flex', gap: 8, marginTop: 8}}>{CW_STEPS.map(([e, l], j) => <div key={j} style={{background: j === cur ? '#ffd23f' : j < cur ? 'rgba(77,255,122,0.85)' : 'rgba(20,26,40,0.9)', border: `4px solid ${INK}`, borderRadius: 14, padding: '3px 12px 0', ...font, fontSize: 24, color: j === cur || j < cur ? INK : '#8a96ad', transform: `scale(${j === cur ? 1.12 : 1})`}}>{j < cur ? '✔' : e} {l}</div>)}</div>}
    </div>);
    if (act.tut && cur >= 0) {
      const tn = cwAdj(T.name);
      const caps = [`📦 ${T.name} OPENS A CHEST → TROOPS & WEAPONS = MORE POWER`, `🎯 THE ARROW CHOOSES WHICH ENEMY COUNTRY ${T.name} ATTACKS`, `🎡 HOW MANY ${tn} COUNTRIES JOIN THE ATTACK? 1 = WEAKEN · 2 = DESTROY · 3 = DESTROY + NEIGHBOUR`, `💥 EVERY DESTROYED COUNTRY = LESS TERRITORY FOR ITS CONTINENT`];
      out.push(<div key="tut" style={{position: 'absolute', left: 500, right: 500, bottom: 28, display: 'flex', justifyContent: 'center', zIndex: 39}}>
        <div style={{background: '#fff', border: `6px solid ${INK}`, borderRadius: 20, padding: '8px 22px 2px', ...font, fontSize: 30, color: INK, textAlign: 'center', transform: `scale(${popT(t, st[cur], 10)})`}}><span style={{color: '#c8141e'}}>HOW IT WORKS · </span>{caps[cur]}</div></div>);
    }
    // cofre
    if (act.chest) {
      const [tc, rar] = act.chest; const tre = act.reel ? act.reel[0] : tc + 2; const op = Math.min(1, Math.max(0, (t - (tc + 0.9)) / 0.5));
      if (t >= tc - 0.1 && t < tre + 0.3) {
        const a2 = lerp(t, tre - 0.1, tre + 0.3, 1, 0); const RN = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'][rar]; const RC = ['#c88a4a', '#3a8cff', '#a64dff', '#ffc21a'][rar];
        out.push(<div key="ch" style={{position: 'absolute', left: CX - 150, top: VH / 2 - 190, zIndex: 34, opacity: a2, transform: `scale(${popT(t, tc, 10)})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <ChestSVG rar={rar} open={op} shake={t < tc + 0.9 ? t : 0} />
          <div style={{marginTop: -10, background: RC, border: `5px solid ${INK}`, borderRadius: 16, padding: '4px 18px 0', ...font, fontSize: 36, color: '#fff', textShadow: `3px 3px 0 ${INK}`, whiteSpace: 'nowrap'}}>{rar === 3 ? '✨ ' : ''}{RN} CHEST</div></div>);
      }
    }
  }
  // --- selector de recompensa ---
  const reels: any[] = (C.turns as any[]).filter((u) => u.reel).map((u) => ({t0: u.reel[0], t1: u.reel[1], items: u.reel[2], pick: u.reel[3], rar: u.reel[4], kind: 'turn', team: u.team}));
  for (const r of C.reels as any[]) reels.push({t0: r[0], t1: r[1], items: r[2], pick: r[3], kind: r[4], cols: r[5], team: r[6]});
  for (const r of reels) {
    if (t < r.t0 - 0.2 || t > r.t1 + 0.5) continue;
    const a = lerp(t, r.t0 - 0.2, r.t0 + 0.1, 0, 1) * lerp(t, r.t1 + 0.15, r.t1 + 0.5, 1, 0);
    const se = r.t1 - 0.35; const p = r.pick * eocf((t - r.t0) / (se - r.t0)); const base = Math.floor(p); const fr = p - base; const done = t > se;
    const mini = r.kind === 'mini'; const rh = mini ? 54 : 84; const Wd = mini ? 330 : 640;
    let cx = CX, cy = VH / 2 - 10;
    if (mini) { const pos = [[260, 330], [VW - 260, 330], [260, VH - 380], [VW - 260, VH - 380]]; [cx, cy] = pos[r.team] || [CX, VH / 2]; }
    const brd = r.kind === 'tm' ? '#ffd23f' : r.kind === 'mini' ? r.cols[0] : ['#c88a4a', '#3a8cff', '#a64dff', '#ffc21a'][r.rar];
    const head = r.kind === 'tm' ? '🪂 WHO GETS THE CRATE?' : mini ? `${C.teams[r.team].emo} ${C.teams[r.team].name}` : `🎁 WHAT'S INSIDE THE CHEST?`;
    out.push(<div key={'rl' + r.t0 + (r.team ?? '')} style={{position: 'absolute', left: cx - Wd / 2, top: cy - rh * 1.5 - 30, width: Wd, height: rh * 3 + 52, background: 'linear-gradient(180deg,#141b2e,#0b101d)', border: `7px solid ${brd}`, borderRadius: 26, overflow: 'hidden', zIndex: 35, opacity: a, transform: `scale(${popT(t, r.t0 - 0.2, 12)})`, boxShadow: `0 0 34px ${brd}, 0 12px 0 rgba(0,0,0,0.5)`}}>
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 46, background: brd, display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: mini ? 22 : 30, color: INK}}>{head}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 50, height: rh * 3, overflow: 'hidden'}}>
        {[-2, -1, 0, 1, 2].map((d) => { const i = base + d; if (i < 0 || i >= r.items.length) return null; const y = (d - fr + 1) * rh; const ctr = Math.abs(d - fr) < 0.5; const itm = r.items[i];
          const bg = r.kind === 'tm' ? r.cols[i] : ctr ? (done ? 'rgba(255,210,63,0.95)' : 'rgba(255,255,255,0.16)') : 'rgba(255,255,255,0.05)';
          return <div key={i} style={{position: 'absolute', left: 12, right: 12, top: y + 3, height: rh - 6, display: 'flex', alignItems: 'center', gap: 16, padding: '0 18px', borderRadius: 14, background: bg, opacity: 1 - Math.min(0.7, Math.abs(d - fr) * 0.35), border: ctr && done ? `4px solid ${INK}` : undefined, transform: ctr && done ? `scale(${1 + 0.05 * Math.sin(t * 14)})` : undefined}}>
            <span style={{fontSize: mini ? 30 : 50}}>{itm[0]}</span><span style={{...font, fontSize: mini ? 24 : 40, color: ctr && done && r.kind !== 'tm' ? INK : '#fff', textShadow: r.kind === 'tm' ? `3px 3px 0 ${INK}` : undefined}}>{itm[1]}</span></div>; })}
      </div>
    </div>);
  }
  // --- ganancia ---
  for (const u of C.turns as any[]) {
    if (!u.gain) continue; const [tg, emo, txt, g] = u.gain; if (t < tg || t > tg + 2.0) continue;
    const a = lerp(t, tg + 1.6, tg + 2.0, 1, 0);
    out.push(<div key={'g' + tg} style={{position: 'absolute', left: 0, right: 0, top: VH / 2 - 150, textAlign: 'center', zIndex: 36, opacity: a}}>
      <div style={{...font, fontSize: 84, color: g > 0 ? '#4dff7a' : '#ff9a8f', textShadow: `6px 6px 0 ${INK}`, transform: `scale(${popT(t, tg, 10)})`}}>{emo} {txt}</div>
      {g > 0 && <div style={{...font, fontSize: 54, color: '#ffe680', textShadow: `5px 5px 0 ${INK}`, opacity: popT(t, tg + 0.5, 10)}}>⚡ +{fmtN(g)} POWER FOR {C.teams[u.team].name}</div>}</div>);
  }
  // --- tarjeta de objetivo ---
  for (const u of C.turns as any[]) {
    if (!u.target) continue; const [tt0, k, tm] = u.target; if (t < tt0 + 0.3 || t > tt0 + 2.0) continue;
    const a = lerp(t, tt0 + 1.6, tt0 + 2.0, 1, 0); const T = C.teams[tm];
    out.push(<div key={'tc' + tt0} style={{position: 'absolute', left: 0, right: 0, top: VH / 2 + 80, display: 'flex', justifyContent: 'center', zIndex: 36, opacity: a}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(10,14,26,0.95)', border: `7px solid #ff3b3b`, borderRadius: 24, padding: '10px 26px 6px', transform: `scale(${popT(t, tt0 + 0.3, 10)})`}}>
        <span style={{...font, fontSize: 46, color: '#ff3b3b'}}>🎯 TARGET:</span><FlagImg k={k} w={84} h={56} /><span style={{...font, fontSize: 56, color: '#fff'}}>{SNAME(k)}</span><span style={{...font, fontSize: 34, color: T.col}}>({T.name})</span></div></div>);
  }
  // --- ruleta 1-2-3 ---
  for (const wd of C.wheels as any[]) {
    if (t < wd.t0 - 0.3 || t > wd.t1 + 0.4) continue;
    const a = lerp(t, wd.t0 - 0.3, wd.t0, 0, 1) * lerp(t, wd.t1, wd.t1 + 0.4, 1, 0); const rot = CwWheelRot(wd, Math.min(t, wd.se));
    const R = 200; const cx = CX, cy = VH / 2 + 30; const T = C.teams[wd.team]; const TT = C.teams[wd.tt];
    const settled = t > wd.se; const items = ['1·WEAKEN', '2·DESTROY', '3·DESTROY+'];
    out.push(<div key={'w' + wd.t0} style={{position: 'absolute', left: 0, top: 0, width: VW, height: VH, zIndex: 34, opacity: a, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: cx - 500, top: cy - R - 112, width: 1000, textAlign: 'center', ...font, fontSize: 44, color: '#fff', textShadow: `5px 5px 0 ${INK}`}}>🎡 HOW MANY {cwAdj(T.name)} COUNTRIES ATTACK?</div>
      {wd.mods && <div style={{position: 'absolute', left: cx - 400, top: cy - R - 60, width: 800, display: 'flex', justifyContent: 'center', gap: 10}}>{[[T, wd.mods[0]], [TT, wd.mods[1]]].map(([tm, m]: any, i) => m ? <span key={i} style={{background: m > 0 ? '#e8f6ff' : '#ff5a3a', border: `4px solid ${INK}`, borderRadius: 12, padding: '2px 12px 0', ...font, fontSize: 26, color: m > 0 ? '#1a5fa8' : '#fff'}}>STORM {m > 0 ? '❄️' : '🔥'} {tm.name} {m > 0 ? '+' : ''}{Math.round(m * 100)}%</span> : null)}</div>}
      <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0}}><WWheel items={items} w={wd.w} cols={['#ff9a1f', '#e0202a', '#7a00e0']} rot={rot} R={R} cx={cx} cy={cy} fs={34} pct /></svg>
      {settled && <div style={{position: 'absolute', left: cx - 500, top: cy + R + 34, width: 1000, textAlign: 'center', ...font, fontSize: 54, whiteSpace: 'nowrap', color: '#fff', textShadow: `5px 5px 0 ${INK}`, transform: `scale(${popT(t, wd.se, 12)})`}}>{['🪖 1 COUNTRY ATTACKS → WEAKEN', '⚔️ 2 COUNTRIES ATTACK → DESTROY', '💥 3 COUNTRIES ATTACK → DESTROY + NEIGHBOUR'][wd.pick]}</div>}
    </div>);
  }
  // --- atacantes ---
  for (const u of C.turns as any[]) {
    if (!u.atk) continue; const t0 = u.atk[0]; if (t < t0 || t > t0 + 2.6) continue; const a = lerp(t, t0 + 2.2, t0 + 2.6, 1, 0); const T = C.teams[u.team];
    out.push(<div key={'ak' + t0} style={{position: 'absolute', left: 0, right: 0, top: 210, display: 'flex', justifyContent: 'center', zIndex: 36, opacity: a}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, background: T.col, border: `6px solid ${INK}`, borderRadius: 22, padding: '8px 22px 4px', transform: `scale(${popT(t, t0, 10)})`}}>
        {(u.atk[1] as number[]).map((k: number, j: number) => <React.Fragment key={k}>{j > 0 && <span style={{...font, fontSize: 40, color: '#fff'}}>+</span>}<FlagImg k={k} w={60} h={40} /><span style={{...font, fontSize: 36, color: '#fff', textShadow: `3px 3px 0 ${INK}`}}>{SNAME(k)}</span></React.Fragment>)}
        <span style={{...font, fontSize: 40, color: YELLOW, textShadow: `3px 3px 0 ${INK}`}}>ATTACK!</span></div></div>);
  }
  // --- resultado ---
  for (const u of C.turns as any[]) {
    if (!u.dp) continue; const [tr, tt, drop, k] = u.dp; if (t < tr || t > tr + 2.6) continue;
    const a = lerp(t, tr + 2.2, tr + 2.6, 1, 0); const T = C.teams[tt]; const dead = u.out === 'kill';
    const r2 = (C.res as any[]).find((r) => Math.abs(r[0] - tr) < 0.05 && r[1] === k); const hpv = r2 && r2[2] === 'weak' ? r2[4] : 0;
    const nb = u.nb !== undefined ? (C.res as any[]).find((r) => r[1] === u.nb && r[0] > tr && r[0] < tr + 1) : null;
    out.push(<AbsoluteFill key={'rs' + tr} style={{zIndex: 37, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 175, opacity: a, pointerEvents: 'none'}}>
      <div style={{transform: `scale(${popT(t, tr, 10)})`, background: dead ? '#8e0f17' : '#b35a00', border: `8px solid ${INK}`, borderRadius: 26, padding: '12px 30px 8px', textAlign: 'center', boxShadow: `0 0 0 7px ${T.col}`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center'}}><FlagImg k={k} w={84} h={56} /><span style={{...font, fontSize: 60, color: '#fff', textShadow: `4px 4px 0 ${INK}`}}>{SNAME(k)} {dead ? 'DESTROYED 💀' : `WEAKENED 🩸 ${hpv}%`}</span></div>
        {!dead && <div style={{...font2, fontSize: 28, color: '#ffe0b0'}}>ONE MORE HIT AND IT FALLS</div>}
        {nb && <div style={{...font, fontSize: 34, color: '#fff', marginTop: 4}}>+ {SNAME(nb[1])} {nb[2] === 'dead' ? 'ALSO DESTROYED 💀' : `WEAKENED 🩸 ${nb[4]}%`}</div>}
        <div style={{...font, fontSize: 32, color: '#ffd23f', marginTop: 4}}>{T.emo} {T.name} −{drop}% TERRITORY</div></div></AbsoluteFill>);
  }
  // --- tarjetas ---
  for (const [t0, t1, title, sub, col] of C.cards as any[]) {
    if (t < t0 || t > t1 + 0.4) continue; const a = lerp(t, t1, t1 + 0.4, 1, 0);
    out.push(<AbsoluteFill key={'cd' + t0} style={{zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: a, pointerEvents: 'none', background: title.includes('ELIMINATED') ? `rgba(40,0,0,${0.45 * a})` : undefined}}>
      <div style={{transform: `scale(${popT(t, t0, 10)})`, background: 'rgba(10,14,26,0.95)', border: `10px solid ${col}`, borderRadius: 30, padding: '20px 56px 14px', textAlign: 'center', boxShadow: `0 0 50px ${col}`}}>
        <div style={{...font, fontSize: 90, color: '#fff', textShadow: `6px 6px 0 ${INK}`}}>{title}</div>
        <div style={{...font, fontSize: 40, color: col}}>{sub}</div></div></AbsoluteFill>);
  }
  // --- eventos ---
  for (const [t0, t1, title, sub, col, emo] of C.events as any[]) {
    if (t < t0 - 0.1 || t > t1 + 0.4) continue; const a = lerp(t, t0 - 0.1, t0 + 0.15, 0, 1) * lerp(t, t1, t1 + 0.4, 1, 0);
    out.push(<AbsoluteFill key={'ev' + t0} style={{zIndex: 42, background: `rgba(4,6,14,${0.6 * a})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: a}}>
      <div style={{...font, fontSize: 34, color: '#fff', background: '#22283a', borderRadius: 14, padding: '4px 18px 0', marginBottom: 6}}>🎉 SPECIAL EVENT</div>
      <div style={{fontSize: 160, transform: `scale(${popT(t, t0, 9)}) rotate(${Math.sin(t * 6) * 6}deg)`}}>{emo}</div>
      <div style={{background: col, border: `8px solid ${INK}`, borderRadius: 28, padding: '10px 46px 0', ...font, fontSize: 104, color: '#fff', textShadow: `7px 7px 0 ${INK}`, transform: `scale(${popT(t, t0 + 0.12, 10)})`}}>{title}</div>
      <div style={{marginTop: 16, ...font, fontSize: 46, color: '#fff', textShadow: `4px 4px 0 ${INK}`, opacity: popT(t, t0 + 0.4, 10), maxWidth: 1500, textAlign: 'center'}}>{sub}</div></AbsoluteFill>);
  }
  // --- los 4 finalistas ---
  if (C.four && t >= C.four[0] && t < C.four[1] + 0.4) {
    const a = lerp(t, C.four[1], C.four[1] + 0.4, 1, 0);
    out.push(<AbsoluteFill key="four" style={{zIndex: 41, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: a, background: `rgba(4,6,14,${0.45 * a})`}}>
      <div style={{...font, fontSize: 130, color: YELLOW, textShadow: `9px 9px 0 ${INK}`, transform: `scale(${popT(t, C.four[0], 9)})`}}>⚔️ THE FINAL FOUR</div>
      <div style={{...font, fontSize: 44, color: '#fff', textShadow: `4px 4px 0 ${INK}`}}>OCEANIA AND SOUTH AMERICA ARE GONE</div></AbsoluteFill>);
  }
  // --- clasificación ---
  const rankBox = (t0: number, title: string, sub?: (i: number) => string) => {
    const st = cwState(t); if (!st) return null;
    const rows = [0, 1, 2, 3, 4, 5].map((i) => ({i, n: Math.round(kfl(C.cnt[i], t)), v: kfl(C.hp[i], t), d: t >= cwElimT(i), e: cwElimT(i)})).sort((a, b) => (a.d === b.d ? (a.d ? b.e - a.e : b.v - a.v) : a.d ? 1 : -1));
    return <div style={{transform: `scale(${popT(t, t0, 10)})`, background: 'rgba(10,14,26,0.96)', border: `8px solid ${YELLOW}`, borderRadius: 30, padding: '16px 30px', width: 900}}>
      <div style={{...font, fontSize: 60, color: YELLOW, textAlign: 'center', textShadow: `4px 4px 0 ${INK}`}}>{title}</div>
      {rows.map((r, j) => { const T = C.teams[r.i]; return <div key={r.i} style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 8, opacity: r.d ? 0.55 : popT(t, t0 + 0.3 + j * 0.12, 10), filter: r.d ? 'grayscale(1)' : undefined}}>
        <span style={{...font, fontSize: 44, color: '#fff', width: 50}}>{j + 1}</span>
        <div style={{width: 56, height: 56, borderRadius: '50%', background: T.col, border: `4px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32}}>{T.emo}</div>
        <span style={{...font, fontSize: 40, color: '#fff', flex: 1}}>{T.name}</span>
        <span style={{...font, fontSize: 34, color: r.d ? '#ff5a5a' : '#cfe3ff'}}>{sub ? sub(r.i) : r.d ? '💀 ELIMINATED' : `🏳️ ${r.n} · ${Math.round(r.v)}%`}</span></div>; })}
    </div>;
  };
  for (const [t0, t1] of C.ranks as any[]) {
    if (t < t0 || t > t1 + 0.4) continue; const a = lerp(t, t1, t1 + 0.4, 1, 0);
    out.push(<AbsoluteFill key={'rk' + t0} style={{zIndex: 41, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: a, background: `rgba(4,6,14,${0.5 * a})`}}>{rankBox(t0, '📊 STANDINGS')}</AbsoluteFill>);
  }
  // --- tormenta ---
  if (C.storm && t >= C.storm[0] - 0.5 && t < C.storm[1] + 1.5) {
    const a = lerp(t, C.storm[0] - 0.5, C.storm[0] + 0.5, 0, 1) * lerp(t, C.storm[1], C.storm[1] + 1.5, 1, 0);
    const drops = Array.from({length: 120}, (_, i) => { const x0 = (i * 137.5) % VW; const sp = 900 + (i % 7) * 120; const y = ((t * sp + i * 97) % (VH + 200)) - 100; return <line key={i} x1={x0 + y * 0.18} y1={y} x2={x0 + y * 0.18 + 9} y2={y + 46} stroke="rgba(190,215,255,0.55)" strokeWidth={2.4} />; });
    out.push(<div key="rain" style={{position: 'absolute', inset: 0, zIndex: 29, opacity: a, pointerEvents: 'none', background: 'rgba(20,30,60,0.2)'}}><svg width={VW} height={VH}>{drops}</svg></div>);
    const m = C.storm[2]; const badge = [0, 1, 2, 3].filter((i) => m[i]).map((i) => `${m[i] > 0 ? '❄️' : '🔥'} ${C.teams[i].name} ${m[i] > 0 ? '+' : ''}${Math.round(m[i] * 100)}%`).join('  ·  ');
    out.push(<div key="stb" style={{position: 'absolute', bottom: 22, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 31, opacity: a}}><div style={{background: 'rgba(10,16,32,0.92)', border: '5px solid #5fd4ff', borderRadius: 16, padding: '4px 18px 0', ...font, fontSize: 26, color: '#5fd4ff'}}>🌧️ STORM · {badge}</div></div>);
  }
  // --- guerra total ---
  if (C.total && t >= C.total[0] && t < winT) {
    const pul = 0.5 + 0.5 * Math.sin(t * 5);
    out.push(<AbsoluteFill key="tw" style={{zIndex: 28, pointerEvents: 'none', background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(200,0,0,${0.25 + 0.15 * pul}) 100%)`}} />);
    out.push(<div key="twb" style={{position: 'absolute', top: 22, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 31}}><div style={{background: '#c8141e', border: `6px solid ${INK}`, borderRadius: 18, padding: '4px 26px 0', ...font, fontSize: 46, color: '#fff', textShadow: `4px 4px 0 ${INK}`, transform: `scale(${1 + 0.04 * pul})`}}>⚔️ TOTAL WAR</div>
      <div style={{marginTop: 8, background: 'rgba(10,14,26,0.9)', borderRadius: 12, padding: '3px 14px 0', ...font, fontSize: 26, color: '#fff'}}>EVERYONE ATTACKS AT ONCE · LAST ONE STANDING WINS</div></div>);
  }
  // --- preguntas a comentarios ---
  for (const [t0, t1, txt] of C.asks as any[]) {
    if (t < t0 || t > t1 + 0.4) continue; const a = lerp(t, t0, t0 + 0.3, 0, 1) * lerp(t, t1, t1 + 0.4, 1, 0);
    out.push(<div key={'ask' + t0} style={{position: 'absolute', left: 0, right: 0, bottom: 34, display: 'flex', justifyContent: 'center', zIndex: 32, opacity: a}}><div style={{background: '#fff', border: `6px solid ${INK}`, borderRadius: 20, padding: '6px 26px 0', ...font, fontSize: 42, color: INK, transform: `scale(${popT(t, t0, 10)})`}}>{txt}</div></div>);
  }
  // --- ganador + resumen ---
  if (C.win && t >= C.win[0]) {
    const T = C.teams[C.win[1]]; const a = popT(t, C.win[0], 9); const rc = C.recap; const inR = rc && t >= rc[0];
    out.push(<AbsoluteFill key="win" style={{zIndex: 46, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(circle, rgba(255,210,63,${0.2 * a}) 0%, rgba(0,0,0,${(inR ? 0.7 : 0.5) * a}) 75%)`}}>
      {Array.from({length: 40}, (_, i) => { const x = (i * 173) % VW; const sp = 200 + (i * 53) % 160; const y = -100 + ((t - C.win[0]) * sp + i * 97) % (VH + 200); return <div key={i} style={{position: 'absolute', left: x, top: y, width: 18, height: 30, background: ['#ffd23f', T.col, '#fff', '#4dff7a'][i % 4], transform: `rotate(${t * 200 + i * 40}deg)`}} />; })}
      {!inR ? <>
        <div style={{fontSize: 130, transform: `scale(${a})`}}>🏆</div>
        <div style={{width: 260, height: 260, borderRadius: '50%', background: T.col, border: `12px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 160, transform: `scale(${a})`}}>{T.emo}</div>
        <div style={{...font, fontSize: 120, color: YELLOW, textShadow: `8px 8px 0 ${INK}`, marginTop: 10, transform: `scale(${a})`}}>{T.name} WINS</div>
        <div style={{...font, fontSize: 64, color: '#fff', textShadow: `5px 5px 0 ${INK}`, opacity: popT(t, C.win[0] + 0.8, 10)}}>THE CONTINENTS WAR 🌍</div></>
      : <>{rankBox(rc[0], '🏁 FINAL RESULTS', (i) => { const e = (rc[2] as any[]).find((x) => x[0] === i); return i === C.win[1] ? '🏆 WINNER' : `💀 FELL AT ${cwMmss(e[1])}`; })}
        <div style={{marginTop: 24, background: '#fff', border: `6px solid ${INK}`, borderRadius: 20, padding: '8px 26px 0', ...font, fontSize: 46, color: INK, opacity: popT(t, rc[0] + 1.5, 10)}}>💬 WHICH CONTINENT SHOULD WIN NEXT TIME? 👇</div></>}
    </AbsoluteFill>);
  }
  return <>{out}</>;
};

// ================= $1 ARMY vs $100,000,000 ARMY (modo 'da') =================
const DA_C0 = '#ec6a1c', DA_C0D = '#8a3606', DA_C1 = '#1d3f9a', DA_C1L = '#5b8cff';
const daE = (x: number) => { x = Math.max(0, Math.min(1, x)); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const daB = (x: number) => { x = Math.max(0, Math.min(1, x)); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const daKv = (K: number[][] | undefined, t: number, def = 0) => { if (!K || !K.length) return def; let v = def; for (const [t0, v1, d = 0] of K) { if (t < t0) break; const k = d <= 0 ? 1 : daE((t - t0) / d); v = v + (v1 - v) * k; } return v; };
const daStep = (K: any[] | undefined, t: number, def: any) => { let v = def; for (const [t0, v1] of K ?? []) { if (t < t0) break; v = v1; } return v; };
const daMoney = (v: number) => '$' + Math.round(v).toLocaleString('en-US');
const DaIco: React.FC<{n: string; x: number; y: number; s: number; op?: number}> = ({n, x, y, s, op = 1}) => <image href={staticFile(`hw/icons/${n}.svg`)} x={x - s / 2} y={y - s / 2} width={s} height={s} opacity={op} />;
const DAICON: Record<string, string> = {shack: 'house', camp: 'house', barracks: 'military-fort', tanks: 'battle-tank', arty: 'cannon', air: 'jet-fighter', port: 'anchor', missiles: 'missile-pod', radar: 'radar-dish', heli: 'helicopter', hq: 'crown', bunker: 'bunker', fort: 'military-fort', guns: 'cannon', navy: 'battleship', drones: 'radar-sweep'};
const DaFX: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const A = X.D.da; if (!A) return null; const out: React.ReactNode[] = [];
  const S = Math.max(0.6, Math.min(1.35, cam.s / 2.2));
  const on = (x: number, y: number, m = 120) => x > -m && x < VW + m && y > -m && y < VH + m;
  // bases del gigante
  for (const b of (A.bases ?? []) as any[]) {
    const [key, bx, by, kind, name] = b; if (t < (b[5] ?? -1)) continue; const [x, y] = toS(bx, by, cam); if (!on(x, y)) continue;
    const dead = daStep(A.bdead?.[key], t, 0) === 1; const r = 26 * S;
    out.push(<g key={'b' + key}>
      <rect x={x - r} y={y - r} width={r * 2} height={r * 2} rx={r * 0.35} fill={dead ? '#3a3a3a' : DA_C1} stroke={INK} strokeWidth={4 * S} />
      <DaIco n={DAICON[kind] ?? 'military-fort'} x={x} y={y} s={r * 1.45} op={dead ? 0.35 : 1} />
      {dead && <g stroke="#e53935" strokeWidth={6 * S} strokeLinecap="round"><line x1={x - r * 0.7} y1={y - r * 0.7} x2={x + r * 0.7} y2={y + r * 0.7} /><line x1={x + r * 0.7} y1={y - r * 0.7} x2={x - r * 0.7} y2={y + r * 0.7} /></g>}
      {cam.s > 1.3 && <text x={x} y={y + r + 22 * S} textAnchor="middle" fontSize={18 * S} style={{fontFamily: 'Fredoka', fontWeight: 700}} fill="#fff" stroke={INK} strokeWidth={5 * S} paintOrder="stroke">{name}</text>}
    </g>);
  }
  // guarnición aparcada (cazas, buques, tanques) — iconos pequeños
  for (const [i, g] of ((A.gar ?? []) as any[]).entries()) {
    const [kind, gx, gy, t0, t1, td, side] = g; if (t < t0 || t > t1) continue; const [x, y] = toS(gx, gy, cam); if (!on(x, y)) continue;
    const dk = td != null && t > td ? Math.min(1, (t - td) / 0.6) : 0; if (dk >= 1) continue; const r = 13 * S;
    out.push(<g key={'g' + i} opacity={1 - dk}><circle cx={x} cy={y} r={r} fill={dk ? '#555' : side === 0 ? '#2a1608' : DA_C1} stroke={side === 0 ? DA_C0 : INK} strokeWidth={3 * S} /><DaIco n={kind === 'jet' ? 'jet-fighter' : kind === 'ship' ? 'battleship' : kind === 'heli' ? 'helicopter' : 'battle-tank'} x={x} y={y} s={r * 1.5} /></g>);
  }
  // edificios del retador (construcción + precio)
  for (const [i, b] of ((A.blds ?? []) as any[]).entries()) {
    if (t < b.t0 || (b.t1 != null && t > b.t1 + 0.5)) continue; const [x, y] = toS(b.x, b.y, cam); if (!on(x, y)) continue;
    const k = t - b.t0; const prog = Math.min(1, k / 0.8); const built = daB((k - 0.8) / 0.35); const outk = b.t1 != null ? Math.min(1, Math.max(0, (t - b.t1) / 0.5)) : 0;
    const dead = b.dead != null && t > b.dead; const r = (b.big ? 30 : 22) * S;
    out.push(<g key={'c' + i} opacity={1 - outk}>
      {k < 0.9 && <><circle cx={x} cy={y} r={r} fill="rgba(0,0,0,0.45)" stroke="#fff" strokeOpacity={0.4} strokeWidth={2 * S} strokeDasharray={`${4 * S} ${4 * S}`} />
        <path d={`M ${x} ${y - r} A ${r} ${r} 0 ${prog > 0.5 ? 1 : 0} 1 ${x + r * Math.sin(prog * 6.283)} ${y - r * Math.cos(prog * 6.283)}`} fill="none" stroke="#ffd23f" strokeWidth={5 * S} /></>}
      {k >= 0.8 && <g transform={`translate(${x},${y}) scale(${built})`}>
        <circle r={r} fill={dead ? '#444' : '#2a1608'} stroke={DA_C0} strokeWidth={4 * S} /><circle r={r + 2.5 * S} fill="none" stroke={INK} strokeWidth={2 * S} /><DaIco n={DAICON[b.k] ?? 'house'} x={0} y={0} s={r * 1.35} op={dead ? 0.35 : 1} />
        {b.n ? <g><circle cx={r * 0.85} cy={-r * 0.85} r={r * 0.48} fill="#fff" stroke={INK} strokeWidth={2.5 * S} /><text x={r * 0.85} y={-r * 0.85 + r * 0.18} textAnchor="middle" fontSize={r * 0.52} style={{fontFamily: 'Lilita'}} fill={INK}>{b.n}</text></g> : null}
      </g>}
      {b.price && k > 0.8 && k < 3.0 && <g opacity={Math.min(1, (3.0 - k) / 0.4)} transform={`translate(${x},${y - r - 20 * S - (k - 0.8) * 8})`}>
        <rect x={-46 * S} y={-15 * S} width={92 * S} height={28 * S} rx={8 * S} fill="#0d2a14" stroke="#3ddc6a" strokeWidth={2.5 * S} />
        <text y={6 * S} textAnchor="middle" fontSize={18 * S} style={{fontFamily: 'Lilita'}} fill="#5dff8a">-{b.price}</text></g>}
    </g>);
  }
  // banderas de récord por nivel
  for (const [i, f] of ((A.flags ?? []) as any[]).entries()) {
    const [t0, fx, fy, lab] = f; if (t < t0) continue; const [x, y] = toS(fx, fy, cam); if (!on(x, y)) continue;
    const k = daB((t - t0) / 0.45); const h = 54 * S * k;
    out.push(<g key={'f' + i}><line x1={x} y1={y} x2={x} y2={y - h} stroke={INK} strokeWidth={4 * S} />
      <path d={`M ${x} ${y - h} L ${x + 34 * S * k} ${y - h + 10 * S} L ${x} ${y - h + 20 * S} Z`} fill={DA_C0} stroke={INK} strokeWidth={2.5 * S} />
      <rect x={x - 26 * S} y={y + 4 * S} width={52 * S} height={22 * S} rx={6 * S} fill="#111d" stroke={DA_C0} strokeWidth={2 * S} opacity={k} />
      <text x={x} y={y + 20 * S} textAnchor="middle" fontSize={15 * S} style={{fontFamily: 'Lilita'}} fill="#fff" opacity={k}>{lab}</text></g>);
  }
  // ciudades tomadas
  for (const [name, cx, cy, st] of (A.cities ?? []) as any[]) {
    const v = daStep(st, t, 0); if (!v) continue; const [x, y] = toS(cx, cy, cam); if (!on(x, y)) continue;
    const pul = 0.6 + 0.4 * Math.sin(t * 6);
    out.push(<g key={'k' + name}>{v === 1 ? <circle cx={x} cy={y} r={30 * S * (1 + 0.15 * pul)} fill="none" stroke="#ff4d3a" strokeWidth={4 * S} opacity={pul} />
      : <g><line x1={x + 10 * S} y1={y} x2={x + 10 * S} y2={y - 40 * S} stroke={INK} strokeWidth={3.5 * S} /><path d={`M ${x + 10 * S} ${y - 40 * S} L ${x + 38 * S} ${y - 32 * S} L ${x + 10 * S} ${y - 24 * S} Z`} fill={DA_C0} stroke={INK} strokeWidth={2 * S} /></g>}</g>);
  }
  return <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>{out}</svg>;
};

const DA_LV = ['$1', '$100', '$1K', '$10K', '$100K', '$1M', '$100M'];
const DA_TH = ['CALM', 'GUARDS', 'POLICE', 'ARMY', 'AIR FORCE', 'TOTAL WAR'];
const DA_THC = ['#3b86ff', '#22a95b', '#ffcc00', '#ff6a00', '#e5322d', '#8a1cff'];
const DaPanel: React.FC<{style: React.CSSProperties; col?: string; children: React.ReactNode}> = ({style, col = '#ffffff33', children}) => (
  <div style={{position: 'absolute', background: 'linear-gradient(180deg, rgba(12,16,26,0.92), rgba(6,9,16,0.92))', border: `3px solid ${col}`, borderRadius: 14, boxShadow: '0 6px 0 rgba(0,0,0,0.45)', ...style}}>{children}</div>);
const DaCard: React.FC<{c: any; t: number}> = ({c, t}) => {
  const lt = t - c.t; const k = daB(lt / 0.35); const o = Math.min(1, lt / 0.2, (c.d - lt) / 0.25);
  if (o <= 0) return null;
  if (c.type === 'level') return <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', background: `rgba(4,8,16,${0.55 * o})`, zIndex: 40}}>
    <div style={{textAlign: 'center', opacity: o, transform: `scale(${0.7 + 0.3 * k})`}}>
      <div style={{...font2, fontSize: 40, color: '#ffd23f', letterSpacing: 8}}>LEVEL {c.n} / 7</div>
      <div style={{height: 6, width: 520 * daE(lt / 0.5), background: '#ffd23f', margin: '10px auto 14px', borderRadius: 3}} />
      <div style={{...font, fontSize: 210, color: '#5dff8a', lineHeight: 0.95, WebkitTextStroke: `14px ${INK}`, paintOrder: 'stroke fill'}}>{c.money}</div>
      {c.sub && <div style={{...font2, fontSize: 40, color: '#fff', marginTop: 8, letterSpacing: 2}}>{c.sub}</div>}
    </div></AbsoluteFill>;
  if (c.type === 'shop') { const n = c.items.length; const gap = c.gap ?? 0.42;
    return <DaPanel col="#3ddc6a88" style={{right: 26, top: 300, width: 470, padding: '14px 20px', opacity: o, transform: `translateX(${(1 - k) * 520}px)`, zIndex: 35}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}><div style={{...font, fontSize: 34, color: '#fff'}}>{c.title ?? 'SHOPPING'}</div><div style={{...font2, fontSize: 22, color: '#5dff8a'}}>BUDGET {c.budget}</div></div>
      <div style={{height: 3, background: '#ffffff22', margin: '8px 0'}} />
      {c.items.map((it: any, i: number) => { const a = Math.min(1, Math.max(0, (lt - 0.35 - i * gap) / 0.2)); return <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, height: 46, opacity: a, transform: `translateX(${(1 - a) * 30}px)`}}>
        <div style={{width: 40, height: 40, borderRadius: 10, background: DA_C0, border: `2px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Img src={staticFile(`hw/icons/${DAICON[it.i] ?? it.i}.svg`)} style={{width: 28, height: 28}} /></div>
        <div style={{...font2, fontSize: 25, color: '#eee', flex: 1}}>{it.name}</div><div style={{...font, fontSize: 28, color: '#ff8a80'}}>{it.price}</div></div>; })}
      <div style={{height: 3, background: '#ffffff22', margin: '8px 0'}} />
      <div style={{display: 'flex', justifyContent: 'space-between', opacity: Math.min(1, Math.max(0, (lt - 0.4 - n * gap) / 0.2))}}><div style={{...font, fontSize: 30, color: '#fff'}}>REMAINING</div><div style={{...font, fontSize: 30, color: '#5dff8a'}}>$0</div></div>
    </DaPanel>; }
  if (c.type === 'ready') return <DaPanel col={DA_C0} style={{left: '50%', top: 170, transform: `translateX(-50%) scale(${0.8 + 0.2 * k})`, padding: '12px 30px', opacity: o, textAlign: 'center', zIndex: 35}}>
    <div style={{...font, fontSize: 40, color: DA_C0, letterSpacing: 2}}>ARMY READY</div>
    <div style={{display: 'flex', gap: 30, justifyContent: 'center', marginTop: 6}}>{c.lines.map(([ic, nn, lab]: string[], i: number) => <div key={i} style={{textAlign: 'center', minWidth: 90}}>
      <Img src={staticFile(`hw/icons/${DAICON[ic] ?? ic}.svg`)} style={{width: 46, height: 46}} /><div style={{...font, fontSize: 38, color: '#fff', lineHeight: 1}}>{nn}</div><div style={{...font2, fontSize: 18, color: '#aab'}}>{lab}</div></div>)}</div></DaPanel>;
  if (c.type === 'predict') { const cd = Math.max(0, Math.ceil(c.d - 0.3 - lt));
    return <div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: o, zIndex: 35}}>
      <div style={{...font, fontSize: 60, color: '#fff', WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill', transform: `scale(${0.8 + 0.2 * k})`}}>HOW FAR WILL THEY GET? <span style={{color: '#ffd23f'}}>{cd || ''}</span></div>
      <div style={{display: 'flex', gap: 20, marginTop: 10}}>{c.opts.map((op: string, i: number) => <div key={i} style={{...font, fontSize: 34, color: '#fff', background: 'rgba(8,12,20,0.9)', border: `3px solid ${['#3ddc6a', '#ffd23f', '#ff6a5a'][i]}`, borderRadius: 12, padding: '4px 20px', transform: `scale(${daB((lt - 0.2 - i * 0.12) / 0.3)})`}}>{['A', 'B', 'C'][i]} · {op}</div>)}</div></div>; }
  if (c.type === 'result') return <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', background: `rgba(4,8,16,${0.45 * o})`, zIndex: 40}}>
    <DaPanel col={c.win ? '#ffd23f' : '#ff5a4a'} style={{position: 'relative', padding: '20px 44px', textAlign: 'center', opacity: o, transform: `scale(${0.8 + 0.2 * k})`, minWidth: 860}}>
      <div style={{...font2, fontSize: 28, color: '#aab', letterSpacing: 3}}>LEVEL {c.n} · {c.money}</div>
      <div style={{...font, fontSize: 78, color: c.win ? '#ffd23f' : '#fff', lineHeight: 1.05}}>{c.verdict}</div>
      <div style={{display: 'flex', gap: 18, justifyContent: 'center', marginTop: 14}}>{c.stats.map(([v, lab]: string[], i: number) => <div key={i} style={{background: '#ffffff10', border: '2px solid #ffffff22', borderRadius: 12, padding: '8px 18px', minWidth: 190, opacity: Math.min(1, Math.max(0, (lt - 0.3 - i * 0.2) / 0.2))}}>
        <div style={{...font, fontSize: 44, color: '#fff', lineHeight: 1}}>{v}</div><div style={{...font2, fontSize: 18, color: '#9aa'}}>{lab}</div></div>)}</div></DaPanel></AbsoluteFill>;
  if (c.type === 'title') return <AbsoluteFill style={{alignItems: 'center', justifyContent: c.pos === 'top' ? 'flex-start' : 'center', paddingTop: c.pos === 'top' ? 150 : 0, zIndex: 38}}>
    <div style={{textAlign: 'center', opacity: o, transform: `scale(${0.75 + 0.25 * k})`}}>
      {c.pre && <div style={{...font2, fontSize: 36, color: '#ffd23f', letterSpacing: 6, marginBottom: 6}}>{c.pre}</div>}
      <div style={{...font, fontSize: c.fs ?? 104, color: c.col ?? '#fff', lineHeight: 1.0, WebkitTextStroke: `12px ${INK}`, paintOrder: 'stroke fill'}}>{c.text}</div>
      {c.sub && <div style={{...font, fontSize: (c.fs ?? 104) * 0.42, color: c.subcol ?? '#ffd23f', marginTop: 10, WebkitTextStroke: `7px ${INK}`, paintOrder: 'stroke fill'}}>{c.sub}</div>}</div></AbsoluteFill>;
  if (c.type === 'pres') return <DaPanel col={c.side === 1 ? DA_C1L : DA_C0} style={{[c.side === 1 ? 'right' : 'left']: 40, top: 220, width: 520, padding: '18px 24px', opacity: o, transform: `translateX(${(1 - k) * (c.side === 1 ? 600 : -600)}px)`, zIndex: 35} as any}>
    <div style={{display: 'flex', alignItems: 'center', gap: 16}}><Img src={staticFile(`wflags/${c.side === 1 ? 'xg' : 'xc'}.svg`)} style={{width: 96, height: 64, borderRadius: 8, border: `3px solid ${INK}`}} />
      <div><div style={{...font2, fontSize: 22, color: '#aab', letterSpacing: 3}}>{c.pre}</div><div style={{...font, fontSize: 56, color: '#fff', lineHeight: 1}}>{c.name}</div></div></div>
    <div style={{height: 3, background: '#ffffff22', margin: '12px 0'}} />
    {c.lines.map(([ic, txt]: string[], i: number) => { const a = Math.min(1, Math.max(0, (lt - 0.4 - i * 0.35) / 0.25)); return <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, height: 54, opacity: a}}>
      <div style={{width: 44, height: 44, borderRadius: 10, background: c.side === 1 ? DA_C1 : DA_C0, border: `2px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Img src={staticFile(`hw/icons/${DAICON[ic] ?? ic}.svg`)} style={{width: 30, height: 30}} /></div>
      <div style={{...font2, fontSize: 30, color: '#eee'}}>{txt}</div></div>; })}</DaPanel>;
  if (c.type === 'rules') return <div style={{position: 'absolute', left: 0, right: 0, bottom: 60, display: 'flex', justifyContent: 'center', gap: 22, zIndex: 35}}>{c.items.map(([ic, h, sub]: string[], i: number) => { const a = Math.min(o, Math.max(0, (lt - i * 0.5) / 0.3)); return <DaPanel key={i} col="#ffd23f88" style={{position: 'relative', width: 400, padding: '12px 18px', opacity: a, transform: `translateY(${(1 - a) * 60}px)`}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 14}}><div style={{...font, fontSize: 54, color: '#ffd23f', width: 40}}>{i + 1}</div><div><div style={{...font, fontSize: 38, color: '#fff', lineHeight: 1}}>{h}</div><div style={{...font2, fontSize: 21, color: '#aab'}}>{sub}</div></div></div></DaPanel>; })}</div>;
  if (c.type === 'alert') return <div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: o, zIndex: 36}}>
    <div style={{...font, fontSize: 58, color: '#fff', background: c.col ?? '#c62828', border: `4px solid ${INK}`, borderRadius: 14, padding: '2px 34px', boxShadow: `0 0 ${30 + 20 * Math.sin(lt * 10)}px ${c.col ?? '#c62828'}`, transform: `scale(${0.8 + 0.2 * k})`}}>{c.text}</div>
    {c.sub && <div style={{...font2, fontSize: 30, color: '#fff', marginTop: 8, WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill'}}>{c.sub}</div>}</div>;
  if (c.type === 'final') return <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', background: `rgba(4,8,16,${0.62 * o})`, zIndex: 40}}>
    <div style={{textAlign: 'center', opacity: o}}><div style={{...font, fontSize: 70, color: '#ffd23f', WebkitTextStroke: `9px ${INK}`, paintOrder: 'stroke fill'}}>{c.title}</div>
      <div style={{display: 'flex', gap: 16, alignItems: 'flex-end', height: 480, marginTop: 20}}>{c.rows.map(([lab, pct, txt, win]: [string, number, string, number], i: number) => { const g = daE((lt - 0.4 - i * 0.3) / 0.6);
        return <div key={i} style={{width: 190, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end'}}>
          <div style={{...font, fontSize: 28, color: '#fff', opacity: g}}>{txt}</div>
          <div style={{width: 130, height: Math.max(6, 380 * pct * g), background: win ? 'linear-gradient(#ffd23f,#e09000)' : `linear-gradient(${DA_C0},${DA_C0D})`, border: `3px solid ${INK}`, borderRadius: '12px 12px 0 0'}} />
          <div style={{...font, fontSize: 40, color: '#5dff8a', marginTop: 6}}>{lab}</div></div>; })}</div></div></AbsoluteFill>;
  return null;
};
const DaHud: React.FC<{t: number}> = ({t}) => {
  const A = X.D.da; if (!A) return null; const out: React.ReactNode[] = [];
  // cinemática: dinero arriba a la izquierda
  const ci = ((A.cine ?? []) as any[]).find((c) => t >= c[0] && t < c[1]);
  if (ci) { const lt = t - ci[0]; const k = daB(lt / 0.4); const o = Math.min(1, (ci[1] - t) / 0.3);
    out.push(<div key="ci" style={{position: 'absolute', left: 70, top: 130, opacity: o, transform: `translateX(${(1 - k) * -300}px)`, zIndex: 41}}>
      <div style={{...font, fontSize: 130, color: '#5dff8a', lineHeight: 1, WebkitTextStroke: `12px ${INK}`, paintOrder: 'stroke fill'}}>{ci[2]}</div>
      <div style={{...font2, fontSize: 36, color: '#fff', letterSpacing: 4, WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill'}}>{ci[3]}</div></div>); }
  const hv = ((A.hud ?? []) as number[][]).find(([a, b]) => t >= a && t <= b);
  if (hv) {
    const ho = Math.min(1, (t - hv[0]) / 0.4, (hv[1] - t) / 0.4);
    const money = daKv(A.money, t, 0); const lvl = daStep(A.level, t, 0); const thr = daKv(A.threat, t, 0); const ti = Math.max(0, Math.min(5, Math.round(thr)));
    const dist = daKv(A.dist, t, 0); const dmg = daKv(A.dmg, t, 0); const recs = ((A.flags ?? []) as any[]).filter((f) => t >= f[0]);
    out.push(<AbsoluteFill key="hud" style={{opacity: ho, zIndex: 30}}>
      <DaPanel col={DA_C0} style={{left: 24, top: 22, padding: '8px 20px 10px', minWidth: 330}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}><Img src={staticFile('wflags/xc.svg')} style={{width: 36, height: 24, borderRadius: 4}} /><div style={{...font2, fontSize: 22, color: '#ffb27a', letterSpacing: 1}}>THE CHALLENGER</div></div>
        <div style={{...font, fontSize: 56, color: '#5dff8a', lineHeight: 1.05}}>{daMoney(money)}</div>
        <div style={{height: 2, background: '#ffffff22', margin: '6px 0'}} />
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}><Img src={staticFile('wflags/xg.svg')} style={{width: 36, height: 24, borderRadius: 4}} /><div style={{...font2, fontSize: 20, color: '#9fbaff'}}>THE GIANT</div><div style={{...font, fontSize: 30, color: '#cfe0ff', marginLeft: 'auto'}}>$50,000,000</div></div>
      </DaPanel>
      <div style={{position: 'absolute', right: 24, top: 22, display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end'}}>
        {DA_LV.map((l, i) => { const cur = i === lvl; const r = daStep((A.lres ?? {})[i], t, 0);
          return <div key={i} style={{display: 'flex', alignItems: 'center', gap: 8}}>
            {r ? <div style={{...font, fontSize: 18, color: r === 2 ? '#ffd23f' : '#ff8a80'}}>{r === 2 ? 'WON' : 'FAILED'}</div> : null}
            <div style={{...font, fontSize: cur ? 34 : 24, color: cur ? INK : '#fff', background: cur ? '#ffd23f' : i < lvl ? 'rgba(60,60,70,0.85)' : 'rgba(8,12,20,0.85)', border: `3px solid ${cur ? '#fff' : '#ffffff40'}`, borderRadius: 10, padding: '0 12px', minWidth: 96, textAlign: 'center'}}>{l}</div></div>; })}
      </div>
      <div style={{position: 'absolute', left: 560, top: 24, width: 800}}>
        <div style={{...font2, fontSize: 22, color: '#fff', textAlign: 'center', letterSpacing: 2, WebkitTextStroke: `5px ${INK}`, paintOrder: 'stroke fill'}}>DISTANCE TO THE CAPITAL</div>
        <div style={{position: 'relative', height: 30, background: 'rgba(8,12,20,0.85)', border: '3px solid #fff', borderRadius: 16, marginTop: 4}}>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${dist * 100}%`, background: `linear-gradient(90deg, ${DA_C0D}, ${DA_C0})`, borderRadius: 13}} />
          {recs.map((f: any, i: number) => <div key={i} style={{position: 'absolute', left: `${f[4] * 100}%`, top: -2, transform: 'translateX(-50%)', textAlign: 'center'}}><div style={{width: 3, height: 30, background: '#fff', margin: '0 auto'}} /><div style={{...font, fontSize: 16, color: '#fff', WebkitTextStroke: `4px ${INK}`, paintOrder: 'stroke fill'}}>{f[3]}</div></div>)}
          <div style={{position: 'absolute', right: -30, top: -16, width: 56, height: 56, borderRadius: 28, background: DA_C1, border: `3px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Img src={staticFile('hw/icons/crown.svg')} style={{width: 34, height: 34}} /></div>
        </div>
      </div>
      <DaPanel col={DA_C1L} style={{left: 24, bottom: 22, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 14}}>
        <Img src={staticFile('wflags/xg.svg')} style={{width: 66, height: 44, borderRadius: 6, border: `2px solid ${INK}`}} />
        <div><div style={{...font2, fontSize: 18, color: '#9fbaff', letterSpacing: 1}}>GIANT RESPONSE</div>
          <div style={{display: 'flex', gap: 4, marginTop: 4}}>{DA_TH.map((_, i) => <div key={i} style={{width: 38, height: 16, borderRadius: 4, background: i <= thr + 0.01 ? DA_THC[i] : '#ffffff1c', border: '1px solid #ffffff55'}} />)}</div>
          <div style={{...font, fontSize: 30, color: DA_THC[ti], marginTop: 2}}>{DA_TH[ti]}</div></div>
      </DaPanel>
      {dmg > 0 && <DaPanel col="#ff5a4a" style={{right: 24, bottom: 22, padding: '6px 20px', textAlign: 'right'}}>
        <div style={{...font2, fontSize: 18, color: '#ff9a8f', letterSpacing: 1}}>DAMAGE TO THE GIANT</div><div style={{...font, fontSize: 46, color: '#fff', lineHeight: 1.05}}>{daMoney(dmg)}</div></DaPanel>}
    </AbsoluteFill>);
  }
  for (const [i, c] of ((A.cards ?? []) as any[]).entries()) if (t >= c.t && t < c.t + c.d) out.push(<DaCard key={'c' + i} c={c} t={t} />);
  return <>{out}</>;
};

const BuffHud: React.FC<{t: number}> = ({t}) => {
  const B = (X.D.buffs || []) as any[]; if (!B.length) return null;
  const act = B.filter((b) => t >= b[0] - 0.2 && t < b[1] + 0.4);
  if (!act.length) return null;
  return <div style={{position: 'absolute', right: 22, top: 78, zIndex: 38, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end'}}>
    {act.map((b, i) => { const [t0, t1, ico, name, col] = b; const left = Math.max(0, t1 - t); const a = Math.min(1, (t - t0 + 0.2) / 0.3, (t1 + 0.4 - t) / 0.4); const pct = Math.max(0, Math.min(1, left / (t1 - t0)));
      return <div key={i} style={{opacity: a, transform: `scale(${popT(t, t0, 10)})`, transformOrigin: 'right center', background: 'rgba(10,14,26,0.94)', border: `4px solid ${col}`, borderRadius: 16, padding: '6px 14px 6px 10px', minWidth: 330, boxShadow: `0 0 ${16 + 8 * Math.sin(t * 6)}px ${col}`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}><span style={{fontSize: 34}}>{ico}</span><div style={{flex: 1}}><div style={{...font, fontSize: 28, color: '#fff', lineHeight: 1}}>{name}</div>
          <div style={{height: 8, background: '#ffffff22', borderRadius: 4, marginTop: 4, overflow: 'hidden'}}><div style={{width: `${pct * 100}%`, height: '100%', background: col}} /></div></div>
          <span style={{...font, fontSize: 30, color: col}}>{Math.floor(left / 60)}:{String(Math.floor(left % 60)).padStart(2, '0')}</span></div></div>; })}
  </div>;
};
export const Indo2: React.FC<{audio?: boolean; v?: string; W?: number; H?: number; off?: number; zf?: number; sdur?: number; hook?: string[]; cta?: string[]; segs?: number[][]; noHud?: boolean}> = ({noHud = false, audio = true, v = 'a', W = 1920, H = 1080, off = 0, zf = 1, sdur = 0, hook, cta, segs}) => {
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
  const lit = b ? [b.a ?? X.ID, b.b, ...(b.title === 'WESTERN ALLIANCE' ? X.ALLY : [])] : D.cw ? cwLit(t) : null;
  const pulse = 0.5 + 0.5 * Math.sin(t * 7);
  const CO = coldOf(tR); const coldZ = CO ? (tR < CO.c1 ? 1.04 + 0.05 * ((tR % 3) / 3) : lerp(tR, CO.p0, CO.p1, 1.12, 1.0, Easing.out(Easing.quad))) : 1;
  return (
    <AbsoluteFill style={{background: '#0b1626', overflow: 'hidden'}}>
      {showMap && (
        <AbsoluteFill style={{clipPath: split ? 'inset(0 50% 0 0)' : undefined, transform: `translate(${shx}px,${shy}px) rotate(${V2 ? win(D.tilt, t) : 0}deg) scale(${(1 + (V2 ? punch(t) : 0) + (V2 && win(D.tilt, t) ? 0.04 : 0)) * coldZ})`, filter: D.duel ? `saturate(${replayAt(tR) ? 0.55 : 1.35}) brightness(1.1) contrast(1.06)` : V2 && win(D.desat, t) ? `saturate(${1 - 0.55 * Math.abs(win(D.desat, t))}) contrast(1.05)` : undefined}}>
          <PolyCanvas cev={X.CEV} t={t} tm={tmapAt(t)} byTm={t < (X.D.coldEnd ?? COLD_END)} cam={inGlobe ? X.camF(g.t1 + 0.03) : camL} W={VW} H={VH} blur={blur} opts={{markers: b ? markersFor(b) : null, squads: false, capitalsOff: true, hl: b && t < b.ko ? b.b : null, war: t > (D.mode === 'tl' ? -1 : (X.D.coldEnd ?? COLD_END)) ? D.war : null, empire: t > (X.D.coldEnd ?? COLD_END) ? ((D.mode === 'br' || D.mode === 'cw') ? (b ? (b.a ?? null) : null) : X.ID) : null, lit, empireCol: X.D.empCol ? (b && t < b.ko ? X.D.empCol2 : X.D.empCol) : b && t < b.ko ? (V2 ? '#6a0c12' : '#9e1a1f') : null, waves: V2, empireFlag: !!X.D.empFlag, colOver: X.D.colOver, cw: cwState(t), fic: !!X.D.fic} as any} />
          <Arrows t={t} cam={camL} />
          <CwFX t={t} cam={camL} />
          <DaFX t={t} cam={camL} />
          <Laser t={t} cam={camL} />
          <PowerFX t={t} cam={camL} />
          <WbrFX t={t} cam={camL} />
          <EvFX t={t} cam={camL} />
          <TlFX t={t} cam={camL} />
          <BossFX t={t} cam={camL} />
          {!CO && !noHud && <>
          {t < D.winT + 0.3 && <Labels t={t} cam={camL} />}
          <Stamps t={t} cam={camL} />
          <Bubbles t={t} cam={camL} />
          </>}
        </AbsoluteFill>
      )}
      {split && (
        <AbsoluteFill style={{clipPath: 'inset(0 0 0 50%)', transform: `translate(${shx}px,${shy}px)`}}>
          <PolyCanvas cev={X.CEV} t={t} tm={tmapAt(t)} byTm={t < (X.D.coldEnd ?? COLD_END)} cam={camR} W={VW} H={VH} blur={blur} opts={{markers: b ? markersFor(b) : null, squads: false, capitalsOff: true, hl: b && t < b.ko ? b.b : null, war: t > (D.mode === 'tl' ? -1 : (X.D.coldEnd ?? COLD_END)) ? D.war : null, empire: t > (X.D.coldEnd ?? COLD_END) ? ((D.mode === 'br' || D.mode === 'cw') ? (b ? (b.a ?? null) : null) : X.ID) : null, lit, empireCol: X.D.empCol ? (b && t < b.ko ? X.D.empCol2 : X.D.empCol) : b && t < b.ko ? (V2 ? '#6a0c12' : '#9e1a1f') : null, waves: V2, empireFlag: !!X.D.empFlag, colOver: X.D.colOver, fic: !!X.D.fic} as any} />
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
      <AbsoluteFill style={{background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,${D.duel ? 0.22 : 0.42}) 100%)`, pointerEvents: 'none', zIndex: 15}} />
      {!CO && !noHud && <>
      <Hud t={t} cam={cam} />
      <Battle t={t} />
      <Chips t={t} />
      <Chapter t={t} />
      <QCard t={t} />
      <Cards t={t} />
      <Ranking t={t} />
      <Roulettes t={t} />
      <WbrHud t={t} />
      <CwHud t={t} />
      <DaHud t={t} />
      <BuffHud t={t} />
      <DbrHud t={t} />
      <EvHud t={t} />
      <DuelHud t={t} />
      <PowerBanner t={t} />
      <DuelSpin t={t} />
      <DuelEnd t={t} />
      <MiniWheel t={t} />
      <DuelExtra t={t} />
      <DuelReal tR={tR} />
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
