import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {mesh} from 'topojson-client';
import WORLD from './world.json';
import TOPO from './worldtopo.json';
import TL from './gov-tl.json';
import {P, Cam, INK, CREAM, RED, BLUE, GREEN, YELLOW, ORANGE, clamp, ease, lerp, fmt, font, font2, popT, piece, arcPath, partial, Mover, Boom, Face, Mood, Bubble, Avatar, TankToken} from './lib3';
import {Ocean} from './War5';
import {PIECES, FlagSvg, fitFlagBox, segs, visD, OBJ, WFlag, usePreload, faceSize, Piece} from './War6';

// ================= datos =================
type Cap = {t: number; c: string; to: string; from: string; lead: string; o: P};
export const CAPS: Cap[] = (TL.captures as any[]).map(([t, c, to, from, lead, ox, oy]) => ({t, c, to, from, lead, o: [ox, oy]}));
export const TEAMOF = TL.team as Record<string, string>;
const PL = (WORLD as any).players as Record<string, {code: string; name: string; area: number; home: P}>;
export const nameOf = (c: string) => PL[c]?.name || c;
export const TNAME = TL.tname as Record<string, string>;
export const TCOL: Record<string, string> = {DEM: '#2f63d1', DIC: '#d23b2e', MON: '#8e44c9'};
export const TDARK: Record<string, string> = {DEM: '#1b3d8f', DIC: '#8f2219', MON: '#5b2589'};
export const TFLAG = (t: string) => 't' + t.toLowerCase();
type Match = {n: number; a: string; b: string; t0: number; t1: number; days: number; winner: string; title: string; sa: number; sb: number; traj: [number, number, number][]};
export const MATCHES = TL.matches as unknown as Match[];
type Front = {t0: number; t1: number; team: string; lead: string; label: string; kind: string; targets: string[]; lib: boolean};
export const FRONTS = TL.fronts as Front[];
const UNITS = TL.units as [string, string, number, number, number, number, number, number][];
export const BUB = TL.bubbles as [number, number, string, string][];
const CODES = Object.keys(PL);
export const D = 0.05;
export const HOME: Record<string, P> = Object.fromEntries(CODES.map((c) => [c, PL[c].home]));
const AREA: Record<string, number> = {};
PIECES.forEach((p) => (AREA[p.code] = (AREA[p.code] || 0) + p.area));
const BB: Record<string, number[]> = {};
PIECES.forEach((p) => { const b = BB[p.code]; BB[p.code] = b ? [Math.min(b[0], p.bbox[0]), Math.min(b[1], p.bbox[1]), Math.max(b[2], p.bbox[2]), Math.max(b[3], p.bbox[3])] : [...p.bbox]; });
const PCS: Record<string, Piece[]> = {};
PIECES.forEach((p) => (PCS[p.code] = PCS[p.code] || []).push(p));

// control por estado (k capturas completadas)
const CTRL: Record<string, string>[] = [{...TEAMOF}];
CAPS.forEach((c, i) => { const n = {...CTRL[i]}; n[c.c] = c.to; CTRL.push(n); });
export const doneK = (t: number) => { let k = 0; while (k < CAPS.length && CAPS[k].t + D <= t) k++; return k; };
export const firedK = (t: number) => { let k = 0; while (k < CAPS.length && CAPS[k].t <= t) k++; return k; };
export const ctrlAt = (t: number) => CTRL[firedK(t)];
const capsOf: Record<string, Cap[]> = {};
CAPS.forEach((c) => (capsOf[c.c] = capsOf[c.c] || []).push(c));
const attackPt = (c: Cap) => {
  const v = HOME[c.c], b = BB[c.c];
  const half = Math.hypot(b[2] - b[0], b[3] - b[1]) / 2;
  const dx = c.o[0] - v[0], dy = c.o[1] - v[1], dl = Math.hypot(dx, dy) || 1;
  const off = Math.min(dl, half * 0.9);
  const A: P = [v[0] + (dx / dl) * off, v[1] + (dy / dl) * off];
  const R = Math.max(...[[b[0], b[1]], [b[2], b[1]], [b[0], b[3]], [b[2], b[3]]].map(([x, y]) => Math.hypot(x - A[0], y - A[1]))) * 1.05;
  return {A, R};
};
const CAPGEO = CAPS.map(attackPt);
type Occ = {c: string; att: string; def: string; A: P; kf: [number, number][]; quiet: boolean};
const OCC = (TL as any).occ as Occ[];
const OCCR = OCC.map((e) => { const b = BB[e.c] || [e.A[0], e.A[1], e.A[0] + 1, e.A[1] + 1]; return Math.max(...[[b[0], b[1]], [b[2], b[1]], [b[0], b[3]], [b[2], b[3]]].map(([x, y]) => Math.hypot(x - e.A[0], y - e.A[1]))) * 1.05; });
const occOf: Record<string, number[]> = {};
OCC.forEach((e, i) => (occOf[e.c] = occOf[e.c] || []).push(i));
export const qAt = (e: Occ, t: number) => {
  const k = e.kf;
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const [a, qa] = k[i - 1], [b, qb] = k[i]; const u = b > a ? (t - a) / (b - a) : 1; return qa + (qb - qa) * (0.5 - 0.5 * Math.cos(Math.PI * u)); }
  return k[k.length - 1][1];
};
const occActive = (e: Occ, t: number) => t >= e.kf[0][0] && t < e.kf[e.kf.length - 1][0];
type Arrow = [number, number, string, P[], number];
const ARROWS = ((TL as any).arrows || []) as Arrow[];
const FX = ((TL as any).fx || []) as [number, number, number, number][];
const curvePts = (pts: P[]) => {
  if (pts.length === 2) { const [a, b] = pts; const dx = b[0] - a[0], dy = b[1] - a[1]; const m: P = [(a[0] + b[0]) / 2 - dy * 0.12, (a[1] + b[1]) / 2 + dx * 0.12]; pts = [a, m, b]; }
  const out: P[] = [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let j = 1; j <= 12; j++) { const u = j / 12, u2 = u * u, u3 = u2 * u; out.push([0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3), 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3)]); }
  }
  return out;
};
const ACURVE = ARROWS.map((a) => { const c = curvePts(a[3]); const L = [0]; for (let i = 1; i < c.length; i++) L.push(L[i - 1] + Math.hypot(c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1])); return {c, L}; });
const Arrows: React.FC<{t: number; inv: number}> = ({t, inv}) => {
  const out: React.ReactNode[] = [];
  ARROWS.forEach(([t0, t1, team, , w], i) => {
    if (t < t0 || t > t1 + 0.4) return;
    const {c, L} = ACURVE[i];
    const tot = L[L.length - 1];
    const pr = lerp(t, t0, t0 + Math.min(3.2, (t1 - t0) * 0.55), 0.02, 1, Easing.out(Easing.cubic));
    const a = lerp(t, t0, t0 + 0.25, 0, 1) * lerp(t, t1 - 0.3, t1 + 0.4, 1, 0);
    const len = tot * pr * 0.93;
    const pts: P[] = [c[0]];
    for (let j = 1; j < c.length && L[j] <= len; j++) pts.push(c[j]);
    const last = pts[pts.length - 1];
    let k = 1; while (k < c.length && L[k] <= len) k++;
    const tip: P = k < c.length ? [c[k - 1][0] + (c[k][0] - c[k - 1][0]) * ((len - L[k - 1]) / Math.max(0.001, L[k] - L[k - 1])), c[k - 1][1] + (c[k][1] - c[k - 1][1]) * ((len - L[k - 1]) / Math.max(0.001, L[k] - L[k - 1]))] : last;
    pts.push(tip);
    const prev = pts[Math.max(0, pts.length - 3)];
    const ang = Math.atan2(tip[1] - prev[1], tip[0] - prev[0]);
    const W = 17 * w * inv, HW = 30 * w * inv, HL = 34 * w * inv;
    const d = pts.map((p, j) => `${j ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
    const ca = Math.cos(ang), sa = Math.sin(ang);
    const head = `M${tip[0] + ca * HL},${tip[1] + sa * HL} L${tip[0] - sa * HW},${tip[1] + ca * HW} L${tip[0] + sa * HW},${tip[1] - ca * HW} Z`;
    out.push(
      <g key={i} opacity={a}>
        <path d={d} fill="none" stroke={INK} strokeWidth={W + 12 * inv} strokeLinecap="round" strokeLinejoin="round" />
        <path d={head} fill={INK} stroke={INK} strokeWidth={12 * inv} strokeLinejoin="round" />
        <path d={d} fill="none" stroke="#fff" strokeWidth={W + 6 * inv} strokeLinecap="round" strokeLinejoin="round" />
        <path d={head} fill="#fff" stroke="#fff" strokeWidth={6 * inv} strokeLinejoin="round" />
        <path d={d} fill="none" stroke={TCOL[team]} strokeWidth={W} strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={W * 0.3} strokeLinecap="round" strokeDasharray={`${18 * inv} ${14 * inv}`} strokeDashoffset={-t * 60 * inv} />
        <path d={head} fill={TCOL[team]} />
      </g>,
    );
  });
  return <g>{out}</g>;
};
const capIdx = new Map<Cap, number>(CAPS.map((c, i) => [c, i]));

// ================= cámara =================
const CAMK = TL.cam as [number, number, number, number][];
const SHAKE: [number, number][] = [...CAPS.filter((c) => c.lead).map((c) => [c.t, 2.2] as [number, number]), ...(TL.stamps as any[]).map((s) => [s.t, 5] as [number, number])];
export const camera = (t: number): Cam => {
  let i = 0;
  while (i < CAMK.length - 1 && t >= CAMK[i + 1][0]) i++;
  const [ta, xb, yb, sb] = CAMK[i];
  const [, xa, ya, sa] = CAMK[Math.max(0, i - 1)];
  const k = i === 0 ? 1 : lerp(t, ta, ta + 1.1, 0, 1, Easing.inOut(Easing.cubic));
  let cx = xa + (xb - xa) * k, cy = ya + (yb - ya) * k;
  const tn = Math.max(ta + 1.2, i < CAMK.length - 1 ? CAMK[i + 1][0] : ta + 10);
  const drift = 1 + 0.05 * lerp(t, ta + 1.1, tn, 0, 1, Easing.linear);
  let s = sa * Math.pow(sb / sa, k) * drift;
  for (const [h, amp] of SHAKE) { const d = t - h; if (d >= 0 && d < 0.3) { const a = ((1 - d / 0.3) * amp) / s; cx += Math.sin(d * 93) * a; cy += Math.cos(d * 69) * a; } }
  return {cx, cy, s};
};

// ================= fronteras =================
const INNER = segs(mesh(TOPO as any, OBJ, (a: any, b: any) => a !== b));
const COAST = segs(mesh(TOPO as any, OBJ, (a: any, b: any) => a === b));
const ctrlBorderCache = new Map<number, ReturnType<typeof segs>>();
const ctrlBorders = (k: number) => {
  let b = ctrlBorderCache.get(k);
  if (b) return b;
  const own = CTRL[k];
  b = segs(mesh(TOPO as any, OBJ, (a: any, c: any) => a !== c && own[a.properties.code] !== own[c.properties.code]));
  ctrlBorderCache.set(k, b);
  return b;
};

// ================= unidades =================
const UNI: Record<string, [string, string]> = Object.fromEntries(Object.keys(TCOL).map((t) => [t, [TCOL[t], TDARK[t]]]));
const Trooper: React.FC<{team: string; walk: number; dir: number; shoot: boolean; fallen: number; alpha: number}> = ({team, walk, dir, shoot, fallen, alpha}) => {
  const [c1, c2] = UNI[team] || ['#888', '#555'];
  const sw = Math.sin(walk) * 4;
  const dead = fallen > 0.5;
  return (
    <g transform={`rotate(${fallen * 90 * dir})`} opacity={alpha * (1 - fallen * 0.35)}>
      <ellipse cx={0} cy={13} rx={8} ry={2.6} fill="rgba(0,0,0,0.3)" />
      <path d={`M-2,4 L${-3 + sw},13 M2,4 L${3 - sw},13`} stroke={INK} strokeWidth={3.4} strokeLinecap="round" />
      <rect x={-5} y={-6} width={10} height={12} rx={3.5} fill={dead ? '#8a8a8a' : c1} stroke={INK} strokeWidth={2} />
      <path d={`M0,-1 L${dir * 12},-3`} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <circle cx={0} cy={-11} r={5} fill="#f2c9a0" stroke={INK} strokeWidth={2} />
      <path d="M-6,-11 A6,6 0 0 1 6,-11 Z" fill={dead ? '#6b6b6b' : c2} stroke={INK} strokeWidth={2} />
      {shoot && !dead && <path d={`M${dir * 13},-3 l${dir * 6},-3 l${-dir * 2},3 l${dir * 6},1 l${-dir * 6},1 l${dir * 2},3 Z`} fill={YELLOW} stroke={ORANGE} strokeWidth={1} />}
    </g>
  );
};
const FORM: P[] = [[0, 0], [-16, -9], [-16, 9], [-31, 0], [-31, -17], [-31, 17], [-46, -9], [-46, 9]];
const USC: number[][] = ((TL as any).usc || []) as number[][];
const ufAt = (t: number) => { if (!USC.length || t <= USC[0][0]) return 1; for (let i = 1; i < USC.length; i++) if (t <= USC[i][0]) { const [a0, v0] = USC[i - 1], [a1, v1] = USC[i]; return v0 + (v1 - v0) * (t - a0) / Math.max(1e-6, a1 - a0); } return USC[USC.length - 1][1]; };
const Units: React.FC<{t: number; s: number; vis: (b: number[]) => boolean; ui: number}> = ({t, s, vis, ui: ui0}) => {
  const ui = ui0 * ufAt(t);
  const out: React.ReactNode[] = [];
  const frame = t * 30;
  const sc = (1.4 * ui) / s;
  UNITS.forEach(([kind, team, x0, y0, x1, y1, t0, t1], i) => {
    if (t < t0 - 0.3 || t > t1 + 1.6) return;
    if (!vis([Math.min(x0, x1) - 20, Math.min(y0, y1) - 20, Math.max(x0, x1) + 20, Math.max(y0, y1) + 20])) return;
    if (kind === 'def') {
      const fall = lerp(t, t0 + 0.4, t1, 0, 1);
      const fade = lerp(t, t1 + 0.4, t1 + 1.4, 1, 0) * lerp(t, t0 - 0.3, t0 + 0.2, 0, 1);
      for (let j = 0; j < 7; j++) {
        const col = j % 4, row = Math.floor(j / 4);
        const x = x0 + (col - 1.5) * 15 * sc, y = y0 + (row * 12 - 4) * sc;
        const dead = j < Math.floor(fall * 6.5);
        out.push(<g key={`d${i}-${j}`} transform={`translate(${x},${y}) scale(${sc})`}><Trooper team={team} walk={0} dir={j % 2 ? 1 : -1} shoot={!dead && (frame + j * 5 + i) % 12 < 2} fallen={dead ? 1 : 0} alpha={fade} /></g>);
      }
      return;
    }
    const dist = Math.hypot(x1 - x0, y1 - y0);
    const pts = arcPath([x0, y0], [x1, y1], Math.min(36, dist * 0.18) * (i % 2 ? 1 : -1));
    if (kind === 'plane') { out.push(<Mover key={`p${i}`} pts={pts} t={t} t0={t0} t1={t1} kind="plane" color={TCOL[team]} inv={(1.25 * ui) / s} hold={0.2} trail />); return; }
    if (kind === 'missile') { out.push(<Mover key={`m${i}`} pts={pts} t={t} t0={t0} t1={t1} kind="missile" inv={(1.1 * ui) / s} hold={0} trail />); return; }
    if (kind === 'ship') { out.push(<Mover key={`s${i}`} pts={pts} t={t} t0={t0} t1={t1} kind="ship" code={TFLAG(team)} inv={(1.0 * ui) / s} hold={1.4} />); return; }
    const pr = lerp(t, t0, t1, 0, 1, Easing.inOut(Easing.sin));
    const {tip, ang} = partial(pts, pr);
    const a = lerp(t, t0 - 0.3, t0, 0, 1) * lerp(t, t1 + 0.6, t1 + 1.4, 1, 0);
    if (kind === 'tank') { out.push(<TankToken key={`t${i}`} p={tip} code={TFLAG(team)} inv={(0.75 * ui) / s} alpha={a} flip={Math.cos(ang) < 0} />); return; }
    const ca = Math.cos(ang), sa = Math.sin(ang), dir = ca >= 0 ? 1 : -1;
    const shooting = pr > 0.7;
    for (let j = 0; j < FORM.length; j++) {
      const [fx, fy] = FORM[j];
      const x = tip[0] + (fx * ca - fy * sa) * sc, y = tip[1] + (fx * sa + fy * ca) * sc;
      out.push(<g key={`q${i}-${j}`} transform={`translate(${x},${y}) scale(${sc})`}><Trooper team={team} walk={pr < 1 ? frame / 2.2 + j : 0} dir={dir} shoot={shooting && (frame + j * 7 + i) % 11 < 2} fallen={0} alpha={a} /></g>);
    }
  });
  return <g>{out}</g>;
};

// ================= mapa =================
export type CVP = {W: number; H: number; ox: number; oy: number; ui: number};
const CVP0: CVP = {W: 1920, H: 1080, ox: 960, oy: 540, ui: 1};
const INTRO = TL.intro as [number, number, string][];
const introTeam = (t: number) => { const x = INTRO.find(([a, b]) => t >= a && t < b); return x ? ([x[0], x[2], x[1]] as [number, string, number]) : undefined; };
const PAINT = TL.paint as Record<string, number>;
const RAD: Record<string, number> = Object.fromEntries(Object.keys(BB).map((c) => [c, Math.hypot(BB[c][2] - BB[c][0], BB[c][3] - BB[c][1]) * 0.6]));
// mancha irregular (no circular) que se expande
const blob = (A: P, R: number, seed: number) => {
  const n = 30;
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = Math.max(0, R * (1 + 0.2 * Math.sin(a * 3 + seed) + 0.13 * Math.sin(a * 5 + seed * 1.7) + 0.08 * Math.sin(a * 9 + seed * 0.3)));
    d += `${i ? 'L' : 'M'}${(A[0] + Math.cos(a) * r).toFixed(1)},${(A[1] + Math.sin(a) * r).toFixed(1)}`;
  }
  return d + 'Z';
};
export const ContMap: React.FC<{t: number; cam: Cam; vp?: CVP}> = ({t, cam, vp = CVP0}) => {
  const {cx, cy, s} = cam;
  const vx0 = cx - vp.ox / s - 20, vx1 = cx + (vp.W - vp.ox) / s + 20, vy0 = cy - vp.oy / s - 20, vy1 = cy + (vp.H - vp.oy) / s + 20;
  const vis = (b: number[]) => b[2] > vx0 && b[0] < vx1 && b[3] > vy0 && b[1] < vy1;
  const inv = vp.ui / s;
  const visCodes = CODES.filter((c) => BB[c] && vis(BB[c]));
  const k = doneK(t);
  // color sólido por religión + frentes que avanzan
  const occ: React.ReactNode[] = [];
  const defs: React.ReactNode[] = [];
  const ctrlNow = ctrlAt(t);
  for (const c of visCodes) {
    const p0 = PAINT[c] ?? 0;
    if (t < p0) continue;
    const box = <rect x={BB[c][0] - 2} y={BB[c][1] - 2} width={BB[c][2] - BB[c][0] + 4} height={BB[c][3] - BB[c][1] + 4} />;
    defs.push(<clipPath key={`oc${c}`} id={`oc-${c}`}>{PCS[c].map((p, i) => <path key={i} d={p.d} />)}</clipPath>);
    const owner = ctrlNow[c];
    const pq = Math.min(1, (t - p0) / 0.55);
    const seed = c.charCodeAt(0) * 7 + c.charCodeAt(1);
    if (pq < 1) defs.push(<mask key={`pm${c}`} id={`pm-${c}`} maskUnits="userSpaceOnUse" x={BB[c][0] - 30} y={BB[c][1] - 30} width={BB[c][2] - BB[c][0] + 60} height={BB[c][3] - BB[c][1] + 60}><path d={blob(HOME[c], RAD[c] * 2.2 * Easing.out(Easing.cubic)(pq), seed)} fill="white" /></mask>);
    occ.push(<g key={`${c}b`} clipPath={`url(#oc-${c})`} mask={pq < 1 ? `url(#pm-${c})` : undefined}>{React.cloneElement(box, {fill: TCOL[owner]})}</g>);
    for (const ei of occOf[c] || []) {
      const e = OCC[ei];
      if (!occActive(e, t)) continue;
      const q = qAt(e, t);
      if (q <= 0.001) continue;
      const bp = blob(e.A, OCCR[ei] * 1.8 * Math.pow(q, 1.5), seed + ei);
      defs.push(<mask key={`om${ei}`} id={`om-${ei}`} maskUnits="userSpaceOnUse" x={BB[c][0] - 30} y={BB[c][1] - 30} width={BB[c][2] - BB[c][0] + 60} height={BB[c][3] - BB[c][1] + 60}><path d={bp} fill="white" /></mask>);
      occ.push(
        <g key={`${c}o${ei}`} clipPath={`url(#oc-${c})`}>
          <g mask={`url(#om-${ei})`}>{React.cloneElement(box, {fill: TCOL[e.att]})}</g>
          <path d={bp} fill="none" stroke={INK} strokeWidth={2.6 * inv} strokeDasharray={`${7 * inv} ${4 * inv}`} />
        </g>,
      );
    }
  }
  const it = introTeam(t);
  const ctrlB = ctrlBorders(k);
  return (
    <svg width={vp.W} height={vp.H} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        {visCodes.map((c) => <clipPath key={c} id={`cf-${c}`}>{PCS[c].map((p, i) => <path key={i} d={p.d} />)}</clipPath>)}
        {Object.keys(TCOL).map((tm) => (
          <pattern key={tm} id={`ht-${tm}`} patternUnits="userSpaceOnUse" width={5} height={5} patternTransform={`rotate(45) scale(${Math.max(0.5, 1.6 / s)})`}><rect width={1.7} height={5} fill={TDARK[tm]} opacity={0.75} /></pattern>
        ))}
        {defs}
      </defs>
      <g transform={`translate(${vp.ox},${vp.oy}) scale(${s}) translate(${-cx},${-cy})`}>
        <g transform="translate(1.5,2.2)" opacity={0.32}>{PIECES.filter((p) => vis(p.bbox)).map((p, i) => <path key={i} d={p.d} fill="#06213f" />)}</g>
        {visCodes.map((c) => <g key={c} clipPath={`url(#cf-${c})`}><FlagSvg code={c} b={fitFlagBox(BB[c])} /></g>)}
        {occ}
        <Arrows t={t} inv={inv} />
        {it && <g opacity={0.6 * lerp(t, it[0], it[0] + 0.25, 0, 1) * lerp(t, it[2] - 0.25, it[2], 1, 0)}>{visCodes.filter((c) => TEAMOF[c] !== it[1]).map((c) => <g key={c} clipPath={`url(#cf-${c})`}><rect x={BB[c][0]} y={BB[c][1]} width={BB[c][2] - BB[c][0]} height={BB[c][3] - BB[c][1]} fill="#0a1220" /></g>)}</g>}
        <path d={visD(INNER, vis)} fill="none" stroke="#3d4450" strokeWidth={0.8 * inv} />
        <path d={visD(COAST, vis)} fill="none" stroke={INK} strokeWidth={1.6 * inv} />
        <path d={visD(ctrlB, vis)} fill="none" stroke={INK} strokeWidth={3.2 * inv} />
        <Units t={t} s={s} vis={vis} ui={vp.ui} />
        {FX.filter(([ft, x, y]) => t > ft - 0.05 && t < ft + 1.0 && x > vx0 && x < vx1 && y > vy0 && y < vy1).map(([ft, x, y, r], i) => <Boom key={`fx${i}${ft}`} p={[x, y]} t={t} at={ft} r={Math.max(4, 15 * r * inv)} />)}
        {CAPS.filter((c) => c.lead && t > c.t - 1.3 && t < c.t + 1.7 && vis(BB[c.c])).map((c, i) => (
          <React.Fragment key={`b${c.c}${c.t}`}>
            <Boom p={HOME[c.c]} t={t} at={c.t} r={Math.max(5, 20 * inv)} />
            <Boom p={[HOME[c.c][0] + 9 * inv, HOME[c.c][1] - 6 * inv]} t={t} at={c.t - 1.1} r={Math.max(3, 12 * inv)} />
            <Boom p={[HOME[c.c][0] - 10 * inv, HOME[c.c][1] + 5 * inv]} t={t} at={c.t - 0.55} r={Math.max(3, 13 * inv)} />
          </React.Fragment>
        ))}
        <Faces t={t} s={s} codes={visCodes} ui={vp.ui} />
      </g>
    </svg>
  );
};
export const activeFront = (t: number) => FRONTS.find((f) => t >= f.t0 && t < f.t1);
export const faceR = (c: string) => faceSize(AREA[c] || 20) * 0.9;
const Faces: React.FC<{t: number; s: number; codes: string[]; ui: number}> = ({t, s, codes, ui}) => {
  const ctrl = ctrlAt(t);
  const f = activeFront(t);
  const nodes: React.ReactNode[] = [];
  for (const c of codes) {
    const r = faceR(c) * ui;
    if (r * s < 8) continue;
    let mood: Mood = 'calm';
    let look: P = [0, 0];
    if (ctrl[c] !== TEAMOF[c]) mood = 'sad';
    if (f && f.targets.includes(c) && ctrl[c] === TEAMOF[c]) mood = 'scared';
    if (f && (c === f.lead || (TEAMOF[c] === f.team && ctrl[c] === f.team && r * s > 14))) { mood = 'angry'; }
    if (f && f.targets.includes(c) && !f.lib) { const o = HOME[f.lead]; look = [Math.sign(o[0] - HOME[c][0]) * 0.8, 0]; }
    if (TL.victory && t > (TL.victory as number)) mood = 'happy';
    const talking = BUB.some(([b0, b1, w]) => w === c && t > b0 + 0.2 && t < b1 - 0.3);
    nodes.push(<Face key={c} x={HOME[c][0]} y={HOME[c][1]} r={r} mood={mood} t={t} seed={c.charCodeAt(0) + c.charCodeAt(1)} look={look} talking={talking} />);
  }
  return <g>{nodes}</g>;
};

// ================= marcadores =================
// ================= reparto mundial (barra superior) =================
const WGT = TL.w as Record<string, number>;
const ORDER = ['DEM', 'MON', 'DIC'];
const SHR: Record<string, number>[] = CTRL.map((cc) => { const o: Record<string, number> = {}; for (const tm of ORDER) o[tm] = 0; for (const c of CODES) o[cc[c]] = (o[cc[c]] || 0) + (WGT[c] || 0); return o; });
export const shareAt = (t: number) => {
  const o = {...SHR[firedK(t)]};
  const cc = ctrlAt(t);
  OCC.forEach((e) => { if (!occActive(e, t)) return; const w = (WGT[e.c] || 0) * qAt(e, t); o[cc[e.c]] -= w; o[e.att] = (o[e.att] || 0) + w; });
  return o;
};
const SHORT: Record<string, string> = {DEM: 'DEMOCRACY', DIC: 'DICTATORSHIP', MON: 'MONARCHY'};
const H0 = (TL as any).h0 ?? 3.2;
const ShareHUD: React.FC<{t: number}> = ({t}) => {
  const v = TL.victory as number;
  if (t < H0 || t > v) return null;
  const k = popT(t, H0, 13) * lerp(t, v - 0.4, v, 1, 0);
  const sh = shareAt(t);
  const tot = ORDER.reduce((a, b) => a + Math.max(0, sh[b]), 0) || 1;
  const BW = 1240;
  const hit: Record<string, number> = {}, gain: Record<string, number> = {};
  for (const c of CAPS) { if (!c.lead || c.t > t || t - c.t > 0.7) continue; const d = 1 - (t - c.t) / 0.7; hit[c.from] = Math.max(hit[c.from] || 0, d); gain[c.to] = Math.max(gain[c.to] || 0, d); }
  return (
    <div style={{position: 'absolute', top: 14, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 10, transform: `translateY(${(1 - k) * -200}px)`}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(16,22,34,0.86)', border: '5px solid #fff', borderRadius: 26, padding: '8px 18px', boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>
          <div style={{...font, fontSize: 26, color: YELLOW, lineHeight: 1, textAlign: 'center', width: 96}}>WORLD<br />POWER</div>
          <div style={{position: 'relative', width: BW, height: 54, borderRadius: 16, overflow: 'hidden', border: `5px solid ${INK}`, display: 'flex', background: '#222'}}>
            {ORDER.map((tm) => {
              const w = Math.max(0, sh[tm]) / tot;
              if (w <= 0.0005) return null;
              const px = w * BW;
              return (
                <div key={tm} style={{width: px, height: '100%', position: 'relative', background: TCOL[tm], transform: `translateY(${(hit[tm] || 0) * Math.sin(t * 70) * 5}px) scaleY(${1 + (gain[tm] || 0) * 0.12})`, boxShadow: hit[tm] ? `inset 0 0 0 200px rgba(255,40,40,${0.55 * hit[tm]})` : gain[tm] ? `inset 0 0 0 200px rgba(255,255,255,${0.35 * gain[tm]})` : undefined, borderRight: `3px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, overflow: 'hidden', whiteSpace: 'nowrap'}}>
                  {px > 70 && <div style={{width: 34, height: 34, flexShrink: 0}}><Avatar size={34} code={TFLAG(tm)} mood="calm" t={t} seed={tm.charCodeAt(1)} id={`sh-${tm}`} /></div>}
                  {px > 44 && <span style={{...font, fontSize: 26, color: '#fff', textShadow: `2px 2px 0 ${INK}`}}>{px > 230 ? `${SHORT[tm]} ` : ''}{Math.round(w * 100)}%</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
const FrontChip: React.FC<{t: number}> = ({t}) => {
  const f = FRONTS.find((x) => t >= x.t0 + 0.2 && t < x.t0 + 2.6);
  if (!f || !f.label) return null;
  const k = popT(t, f.t0 + 0.2, 12) * lerp(t, f.t0 + 2.3, f.t0 + 2.6, 1, 0);
  const big = (TL.battles as any[]).some(([a]) => Math.abs(a - f.t0) < 0.01);
  return (
    <div style={{position: 'absolute', top: big ? 230 : 210, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 12}}>
      <div style={{transform: `scale(${k}) rotate(-2deg)`, display: 'flex', alignItems: 'center', gap: 14, background: (f as any).alliance ? `linear-gradient(90deg, ${TCOL.MON}, ${TCOL.DIC})` : big ? RED : TCOL[f.team], border: `6px solid ${INK}`, borderRadius: 20, padding: big ? '10px 34px 4px' : '6px 24px 2px', ...font, fontSize: big ? 66 : 42, color: '#fff', textShadow: `3px 3px 0 ${INK}`, boxShadow: '0 8px 0 rgba(0,0,0,0.35)', whiteSpace: 'nowrap'}}>
        <WFlag code={f.lead} w={big ? 66 : 50} h={big ? 44 : 33} />{f.label}
      </div>
    </div>
  );
};
const KillFeed: React.FC<{t: number}> = ({t}) => {
  const list = CAPS.filter((c) => c.lead && t >= c.t && t < c.t + 3.0).slice(-4);
  return (
    <div style={{position: 'absolute', left: 22, bottom: 60, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 8}}>
      {list.map((c) => {
        const k = lerp(t, c.t, c.t + 0.22, 0, 1, Easing.out(Easing.cubic)) * lerp(t, c.t + 2.6, c.t + 3.0, 1, 0);
        const lib = c.to === TEAMOF[c.c];
        return (
          <div key={c.c + c.t} style={{transform: `translateX(${(k - 1) * 460}px)`, opacity: k, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(16,22,34,0.86)', borderLeft: `8px solid ${TCOL[c.to]}`, borderRadius: 12, padding: '5px 14px 3px 8px', ...font, fontSize: 26, color: '#fff', whiteSpace: 'nowrap'}}>
            <WFlag code={c.lead} w={40} h={27} /><span>{nameOf(c.lead)}</span><span style={{color: lib ? '#8ef0a8' : YELLOW, fontSize: 22}}>{lib ? 'LIBERATED' : 'CAPTURED'}</span>
            <WFlag code={c.c} w={40} h={27} /><span style={{color: lib ? '#8ef0a8' : '#ff9b94'}}>{nameOf(c.c)}</span>
          </div>
        );
      })}
    </div>
  );
};
const toScreen = (p: P, cam: Cam, vp: CVP = CVP0): P => [vp.ox + (p[0] - cam.cx) * cam.s, vp.oy + (p[1] - cam.cy) * cam.s];
const Labels: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const f = activeFront(t);
  if (!f) return null;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 3}}>
      {f.targets.filter((c) => { const cp = CAPS.find((x) => x.c === c && x.t >= f.t0 && x.t <= f.t1 + 0.1); return !cp || (t > cp.t - 3.0 && t < cp.t + 1.8); }).map((c) => {
        const [sx, sy] = toScreen(HOME[c], cam);
        const r = faceR(c) * cam.s;
        const y = sy + Math.max(r, 8) + 6;
        if (sx < 80 || sx > 1840 || y < 200 || y > 1000) return null;
        const capd = ctrlAt(t)[c] !== TEAMOF[c] && !f.lib;
        return <div key={c} style={{position: 'absolute', left: sx, top: y, transform: 'translateX(-50%)', background: capd ? TCOL[ctrlAt(t)[c]] : '#fff', border: `4px solid ${INK}`, borderRadius: 12, padding: '2px 12px 0', ...font, fontSize: 24, color: capd ? '#fff' : INK, whiteSpace: 'nowrap', boxShadow: '0 4px 0 rgba(0,0,0,0.3)'}}>{nameOf(c).toUpperCase()}</div>;
      })}
    </div>
  );
};
const Bubbles: React.FC<{t: number; cam: Cam}> = ({t, cam}) => (
  <>
    {BUB.filter(([b0, b1]) => t >= b0 && t <= b1).map(([b0, b1, w, text]) => {
      const [sx, sy] = toScreen(HOME[w], cam);
      const r = faceR(w) * cam.s;
      const k = popT(t, b0, 10) * lerp(t, b1 - 0.25, b1, 1, 0);
      return <Bubble key={w + b0} k={k} sx={Math.max(280, Math.min(1640, sx))} sy={Math.min(980, Math.max(300, sy - r - 12))} text={text} size={40} />;
    })}
  </>
);
const Stamp: React.FC<{t: number}> = ({t}) => {
  const st = (TL.stamps as any[]).find((s) => t >= s.t && t < s.t + s.d);
  if (!st) return null;
  const dt = t - st.t;
  const k = dt < 0.27 ? interpolate(dt, [0, 0.27], [2.2, 1], {...clamp, easing: Easing.out(Easing.cubic)}) : 1;
  const a = lerp(dt, 0, 0.12, 0, 1) * lerp(dt, st.d - 0.3, st.d, 1, 0);
  const col = st.c === 'red' ? RED : st.c === 'blue' ? BLUE : st.c === 'gray' ? '#4b5058' : GREEN;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 13}}>
      <div style={{transform: `scale(${k}) rotate(-6deg)`, opacity: a, border: `10px solid ${col}`, color: col, background: 'rgba(255,246,227,0.95)', borderRadius: 18, padding: '14px 44px 6px', ...font, fontSize: 104, boxShadow: '0 10px 0 rgba(0,0,0,0.3)', whiteSpace: 'nowrap'}}>{st.text}</div>
    </AbsoluteFill>
  );
};

// ================= intro de religiones, capítulos, alianza =================
const TINFO: Record<string, [string, number, string, string]> = {DEM: ['', 0, 'USA', 'US'], DIC: ['', 0, 'China', 'CN'], MON: ['', 0, 'Saudi Arabia', 'SA']};
Object.keys(TINFO).forEach((tm) => (TINFO[tm][1] = CODES.filter((c) => TEAMOF[c] === tm).length));
const TeamIntro: React.FC<{t: number}> = ({t}) => {
  const it = introTeam(t);
  if (!it) return null;
  const [t0, tm, t1] = it;
  const k = popT(t, t0 + 0.15, 12) * lerp(t, t1 - 0.25, t1, 1, 0);
  const [n, cnt, star, sc] = TINFO[tm];
  return (
    <div style={{position: 'absolute', left: 60, bottom: 70, transform: `translateX(${(1 - k) * -900}px)`, zIndex: 12, display: 'flex', alignItems: 'center', gap: 24}}>
      <Avatar size={220} code={TFLAG(tm)} mood="angry" t={t} seed={tm.charCodeAt(0)} look={[1, 0]} id={`intro-${tm}`} />
      <div style={{background: CREAM, border: `8px solid ${INK}`, borderRadius: 28, padding: '14px 30px 14px', boxShadow: '0 10px 0 rgba(0,0,0,0.35)'}}>
        <div style={{...font, fontSize: 70, color: TCOL[tm], lineHeight: 1}}>{TNAME[tm]}</div>
        <div style={{display: 'flex', gap: 26, marginTop: 8, ...font, fontSize: 32, color: INK}}>
          <span>👥 {n} {tm === 'ATH' ? 'non-religious' : 'followers'}</span><span>🏳️ {cnt} countries</span><span style={{display: 'flex', alignItems: 'center', gap: 8}}>⭐ <WFlag code={sc} w={42} h={28} /> {star}</span>
        </div>
      </div>
    </div>
  );
};
const CHAP = TL.chapters as [number, number, string, string, string[]][];
const ChapterCard: React.FC<{t: number}> = ({t}) => {
  const ch = CHAP.find(([a, b]) => t >= a && t < b);
  if (!ch) return null;
  const [t0, t1, title, sub, teams] = ch;
  const dt = t - t0;
  const k = popT(t, t0, 11) * lerp(t, t1 - 0.25, t1, 1, 0);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 15, background: `rgba(8,15,30,${0.6 * lerp(dt, 0, 0.2, 0, 1) * lerp(t, t1 - 0.3, t1, 1, 0)})`}}>
      <div style={{transform: `scale(${k})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
        <div style={{background: YELLOW, border: `7px solid ${INK}`, borderRadius: 22, padding: '6px 34px 0', ...font, fontSize: 58, color: INK, transform: 'rotate(-2deg)'}}>{title}</div>
        <div style={{...font, fontSize: 116, color: '#fff', textShadow: `6px 6px 0 ${INK}`, whiteSpace: 'nowrap'}}>{sub}</div>
        <div style={{display: 'flex', gap: 22}}>{teams.map((tm, i) => <div key={tm} style={{transform: `translateY(${(1 - Math.min(1, Math.max(0, dt - i * 0.08) / 0.3)) * 300}px)`}}><Avatar size={teams.length === 1 ? 230 : 150} code={TFLAG(tm)} mood="angry" t={t} seed={i} id={`ch-${tm}`} /></div>)}</div>
      </div>
    </AbsoluteFill>
  );
};
const UNITE = (TL as any).unite as [number, number] | undefined;
const UniteCard: React.FC<{t: number}> = ({t}) => {
  if (!UNITE || t < UNITE[0] || t >= UNITE[1]) return null;
  const [t0, t1] = UNITE;
  const dt = t - t0;
  const a = lerp(dt, 0, 0.3, 0, 1) * lerp(t, t1 - 0.3, t1, 1, 0);
  const four = ['MON', 'DIC'];
  const lines = ['Need a hand?', 'Welcome, Your Majesty.'];
  const join = lerp(dt, 2.4, 3.0, 0, 1, Easing.inOut(Easing.cubic));
  return (
    <AbsoluteFill style={{zIndex: 16, background: `rgba(8,15,30,${0.72 * a})`, alignItems: 'center', justifyContent: 'center', opacity: a}}>
      <div style={{position: 'relative', width: 1920, height: 1080}}>
        {four.map((tm, i) => {
          const x0 = [420, 1500][i], x1 = [800, 1120][i];
          const x = x0 + (x1 - x0) * join;
          const yIn = (1 - Math.min(1, Math.max(0, dt - i * 0.15) / 0.35)) * 500;
          const bk = popT(t, t0 + 0.4 + i * 0.8, 10) * lerp(dt, 2.2, 2.4, 1, 0);
          return (
            <div key={tm} style={{position: 'absolute', left: x, top: 480 + yIn, transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <div style={{position: 'absolute', top: -130, transform: `scale(${bk})`, background: '#fff', border: `5px solid ${INK}`, borderRadius: 20, padding: '6px 18px 0', ...font, fontSize: 42, color: INK, whiteSpace: 'nowrap'}}>{lines[i]}</div>
              <Avatar size={250} code={TFLAG(tm)} mood={join > 0.5 ? 'angry' : 'smug'} t={t} seed={i} look={[i ? -1 : 1, 0]} id={`un-${tm}`} />
              <div style={{...font, fontSize: 44, color: '#fff', textShadow: `3px 3px 0 ${INK}`, marginTop: 6}}>{TNAME[tm]}</div>
            </div>
          );
        })}
        {dt > 2.8 && <div style={{position: 'absolute', left: 0, right: 0, top: 110, display: 'flex', justifyContent: 'center'}}><div style={{transform: `scale(${popT(t, t0 + 2.8, 9)}) rotate(-3deg)`, background: `linear-gradient(90deg, ${TCOL.MON}, ${TCOL.DIC})`, border: `9px solid ${INK}`, borderRadius: 28, padding: '12px 50px 4px', ...font, fontSize: 100, color: '#fff', textShadow: `5px 5px 0 ${INK}`, whiteSpace: 'nowrap'}}>THE KINGS JOIN THE WAR!</div></div>}
        {dt > 3.6 && <div style={{position: 'absolute', left: 0, right: 0, top: 760, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30, transform: `scale(${popT(t, t0 + 3.6, 10)})`}}><div style={{...font, fontSize: 90, color: RED, textShadow: `5px 5px 0 ${INK}`}}>VS</div><Avatar size={170} code="tdem" mood="scared" t={t} seed={9} id="un-dem" /><div style={{...font, fontSize: 60, color: '#fff', textShadow: `4px 4px 0 ${INK}`}}>DEMOCRACY</div></div>}
      </div>
    </AbsoluteFill>
  );
};
const QCARDS = TL.qcards as [number, number, string][];
const QCard: React.FC<{t: number}> = ({t}) => {
  const q = QCARDS.find(([a, b]) => t >= a && t < b);
  if (!q) return null;
  const [t0, t1, text] = q;
  const n = Math.floor(lerp(t, t0, t0 + 1.0, 0, text.length, Easing.linear));
  const k = popT(t, t0, 12) * lerp(t, t1 - 0.3, t1, 1, 0);
  return (
    <div style={{position: 'absolute', top: 318, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 11}}>
      <div style={{transform: `scale(${k})`, display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: `6px solid ${INK}`, borderRadius: 22, padding: '8px 26px 2px', ...font, fontSize: 48, color: INK, boxShadow: '0 8px 0 rgba(0,0,0,0.35)', whiteSpace: 'nowrap'}}>
        <div style={{width: 60, height: 60}}><Avatar size={60} code="tdic" mood="smug" t={t} seed={7} id="qc-ath" /></div>{text.slice(0, n)}<span style={{opacity: n < text.length ? 1 : 0}}>|</span>
      </div>
    </div>
  );
};

// ================= título, final =================
const Title: React.FC<{t: number}> = ({t}) => {
  if (t > 3.0) return null;
  const k = popT(t, 0.02, 12) * lerp(t, 2.6, 3.0, 1, 0);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 14}}>
      <div style={{transform: `scale(${k}) rotate(-2deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
        <div style={{display: 'flex', gap: 18}}>{['DEM', 'MON', 'DIC'].map((tm, i) => <div key={tm} style={{transform: `translateY(${Math.sin(t * 6 + i) * 6}px)`}}><Avatar size={140} code={TFLAG(tm)} mood="angry" t={t} seed={i} id={`tt-${tm}`} /></div>)}</div>
        <div style={{background: RED, border: `9px solid ${INK}`, borderRadius: 30, padding: '18px 50px 8px', boxShadow: '0 12px 0 rgba(0,0,0,0.35)', ...font, fontSize: 104, color: '#fff', textShadow: `5px 5px 0 ${INK}`, textAlign: 'center', lineHeight: 1.04}}><span style={{color: '#9cc0ff'}}>DEMOCRACY</span> vs <span style={{color: '#e2b8ff'}}>MONARCHY</span><br />vs <span style={{color: '#ffb3a8'}}>DICTATORSHIP</span></div>
      </div>
    </AbsoluteFill>
  );
};
const Victory: React.FC<{t: number}> = ({t}) => {
  const v = TL.victory as number, st = TL.stats as number, q = TL.question as number;
  if (t < v || t > q) return null;
  const k = popT(t, v, 10) * lerp(t, q - 0.4, q, 1, 0);
  const shift = lerp(t, st, st + 0.8, 0, 1, Easing.inOut(Easing.cubic));
  const mvp = (TL.mvp as [string, number][])[0];
  const rows: [React.ReactNode, string, string][] = [
    [<div style={{fontSize: 40}}>🗳️</div>, 'Champion', 'DEMOCRACY'],
    [<WFlag code={mvp[0]} w={54} h={36} />, 'MVP', `${nameOf(mvp[0])} · ${mvp[1]} captures`],
    [<Avatar size={48} code="tdic" mood="sad" t={t} seed={4} id="st-dic" />, 'Axis peak', `${Math.round((TL as any).peak)} power`],
    [<WFlag code="CN" w={54} h={36} />, 'Biggest battle', 'Battle of Beijing'],
    [<div style={{fontSize: 40}}>⚔️</div>, 'Total war', `${FRONTS.length} battles · ${CAPS.filter((c) => c.lead).length} captures`],
  ];
  return (
    <AbsoluteFill style={{zIndex: 14, background: `rgba(8,15,30,${0.5 * k})`, opacity: k}}>
      <div style={{position: 'absolute', left: interpolate(shift, [0, 1], [960, 470]), top: 540, transform: `translate(-50%,-50%) scale(${popT(t, v, 10)})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{fontSize: 150, marginBottom: -30, zIndex: 2, transform: `translateY(${Math.sin(t * 3) * 6}px)`}}>🏆</div>
        <div style={{display: 'flex', gap: 6}}>{['DEM'].map((tm, i) => <div key={tm} style={{transform: `translateY(${Math.sin(t * 5 + i) * 8}px)`}}><Avatar size={220} code={TFLAG(tm)} mood="happy" t={t} seed={i} id={`win-${tm}`} /></div>)}</div>
        <div style={{marginTop: 18, background: YELLOW, border: `8px solid ${INK}`, borderRadius: 26, padding: '8px 44px 0', ...font, fontSize: 80, color: INK, boxShadow: '0 10px 0 rgba(0,0,0,0.4)', whiteSpace: 'nowrap'}}>DEMOCRACY WINS!</div>
      </div>
      {t > st && (
        <div style={{position: 'absolute', right: 60, top: 200, width: 820, transform: `translateX(${(1 - popT(t, st + 0.4, 12)) * 960}px)`}}>
          <div style={{background: CREAM, border: `8px solid ${INK}`, borderRadius: 28, padding: '22px 30px 18px', boxShadow: '0 12px 0 rgba(0,0,0,0.35)'}}>
            <div style={{...font, fontSize: 56, color: INK, marginBottom: 10}}>RELIGION WAR · STATS</div>
            {rows.map(([ic, l, val], i) => (
              <div key={l} style={{display: 'flex', alignItems: 'center', gap: 16, height: 80, borderTop: '3px solid #e2d3b1', opacity: lerp(t, st + 0.8 + i * 0.5, st + 1.2 + i * 0.5, 0, 1)}}>
                <div style={{width: 60, display: 'flex', justifyContent: 'center'}}>{ic}</div><div style={{...font2, fontSize: 30, color: INK, width: 220}}>{l}</div><div style={{...font, fontSize: 38, color: i === 0 ? RED : INK}}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
const Question: React.FC<{t: number}> = ({t}) => {
  const q = TL.question as number;
  if (t < q) return null;
  const k = popT(t, q, 11);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 15, background: `rgba(8,18,32,${0.5 * k})`}}>
      <div style={{display: 'flex', gap: 14, marginBottom: 26, transform: `scale(${k})`}}>{['DEM', 'MON', 'DIC'].map((tm, i) => <Avatar key={tm} size={130} code={TFLAG(tm)} mood="angry" t={t} seed={i} id={`q-${tm}`} />)}</div>
      <div style={{transform: `scale(${k}) rotate(-2deg)`, background: '#fff', border: `9px solid ${INK}`, borderRadius: 30, padding: '24px 50px 14px', ...font, fontSize: 92, color: INK, textAlign: 'center', lineHeight: 1.05, boxShadow: '0 12px 0 rgba(0,0,0,0.35)'}}>Which side would<br /><span style={{color: RED}}>YOU</span> fight for?</div>
      <div style={{marginTop: 30, transform: `scale(${popT(t, q + 0.5, 12)})`, background: YELLOW, border: `6px solid ${INK}`, borderRadius: 24, padding: '8px 34px 2px', ...font, fontSize: 56, color: INK}}>Comment below!</div>
    </AbsoluteFill>
  );
};
const Credit = () => <div style={{position: 'absolute', right: 18, bottom: 12, background: 'rgba(15,25,40,0.65)', color: '#fff', borderRadius: 12, padding: '5px 14px', ...font2, fontWeight: 600, fontSize: 17, zIndex: 20}}>Hypothetical simulation · Military power: Global Firepower 2026 · Government type: EIU Democracy Index (simplified)</div>;

const LEG = ['DEM', 'MON', 'DIC'];
const Legend: React.FC<{t: number}> = ({t}) => {
  const v = TL.victory as number;
  if (t < 3.0 || t > v + 0.3) return null;
  const k = popT(t, 3.0, 12);
  const cc = ctrlAt(t);
  return (
    <div style={{position: 'absolute', left: 16, top: 128, zIndex: 9, transform: `translateX(${(1 - k) * -300}px)`, background: 'rgba(16,22,34,0.82)', border: '4px solid #fff', borderRadius: 18, padding: '10px 14px 6px', display: 'flex', flexDirection: 'column', gap: 6}}>
      {LEG.map((tm) => {
        const alive = Object.values(cc).includes(tm) || OCC.some((e) => e.att === tm && occActive(e, t));
        return (
          <div key={tm} style={{display: 'flex', alignItems: 'center', gap: 10, opacity: alive ? 1 : 0.35}}>
            <div style={{width: 30, height: 22, background: TCOL[tm], border: `3px solid ${INK}`, borderRadius: 6}} />
            <span style={{...font, fontSize: 24, color: '#fff', textDecoration: alive ? 'none' : 'line-through'}}>{SHORT[tm]}</span>
          </div>
        );
      })}
    </div>
  );
};
const WIDES = ((TL as any).wides || []) as [number, string][];
const WideLabel: React.FC<{t: number}> = ({t}) => {
  const w = WIDES.find(([a]) => t >= a + 0.4 && t < a + 2.4);
  if (!w) return null;
  const k = popT(t, w[0] + 0.4, 12) * lerp(t, w[0] + 2.1, w[0] + 2.4, 1, 0);
  return <div style={{position: 'absolute', left: 0, right: 0, bottom: 90, display: 'flex', justifyContent: 'center', zIndex: 11}}><div style={{transform: `scale(${k})`, background: YELLOW, border: `6px solid ${INK}`, borderRadius: 20, padding: '6px 34px 0', ...font, fontSize: 54, color: INK}}>{w[1]}</div></div>;
};
export const WarGov: React.FC = () => {
  usePreload();
  const t = useCurrentFrame() / 60;
  const cam = camera(t);
  return (
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <Ocean t={t} />
      <ContMap t={t} cam={cam} />
      <Labels t={t} cam={cam} />
      <Bubbles t={t} cam={cam} />
      <KillFeed t={t} />
      <ShareHUD t={t} />
      <Legend t={t} />
      <WideLabel t={t} />
      <QCard t={t} />
      <FrontChip t={t} />
      <TeamIntro t={t} />
      <Stamp t={t} />
      <ChapterCard t={t} />
      <UniteCard t={t} />
      <Victory t={t} />
      <Question t={t} />
      <Title t={t} />
      <Credit />
    </AbsoluteFill>
  );
};
