import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {mesh} from 'topojson-client';
import WORLD from './world.json';
import TOPO from './worldtopo.json';
import TL from './rel-tl.json';
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
export const TCOL: Record<string, string> = {CHR: '#2f63d1', ISL: '#1f9e55', HIN: '#f07c1c', BUD: '#e8b81a', ATH: '#6f757e', JEW: '#4f9bdc'};
export const TDARK: Record<string, string> = {CHR: '#1b3d8f', ISL: '#136a39', HIN: '#a8520c', BUD: '#9a7808', ATH: '#3f444b', JEW: '#2a6aa3'};
export const TFLAG = (t: string) => 't' + t.toLowerCase();
type Match = {n: number; a: string; b: string; t0: number; t1: number; days: number; winner: string; title: string; sa: number; sb: number; traj: [number, number, number][]};
export const MATCHES = TL.matches as unknown as Match[];
type Front = {t0: number; t1: number; team: string; lead: string; label: string; kind: string; targets: string[]; lib: boolean};
export const FRONTS = TL.fronts as Front[];
const UNITS = TL.units as [string, string, number, number, number, number, number, number][];
export const BUB = TL.bubbles as [number, number, string, string][];
const CODES = Object.keys(PL);
export const D = 0.9;
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
  const tn = i < CAMK.length - 1 ? CAMK[i + 1][0] : ta + 10;
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
const Units: React.FC<{t: number; s: number; vis: (b: number[]) => boolean; ui: number}> = ({t, s, vis, ui}) => {
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
  // pintura (intro) y ocupaciones con mancha irregular
  const occ: React.ReactNode[] = [];
  const defs: React.ReactNode[] = [];
  for (const c of visCodes) {
    const p0 = PAINT[c] ?? 0;
    if (t < p0) continue;
    const list = capsOf[c] || [];
    let j = -1;
    for (let x = 0; x < list.length; x++) if (list[x].t <= t) j = x;
    const cur = j >= 0 ? list[j] : null;
    const st = cur ? cur.t : p0, dur = cur ? D : 0.55;
    const q = Easing.inOut(Easing.cubic)(Math.min(1, (t - st) / dur));
    const g = cur ? CAPGEO[capIdx.get(cur)!] : {A: HOME[c], R: RAD[c]};
    const layer = (team: string, key: string, mask?: string) => (
      <g key={key} clipPath={`url(#oc-${c})`} mask={mask}>
        <rect x={BB[c][0] - 2} y={BB[c][1] - 2} width={BB[c][2] - BB[c][0] + 4} height={BB[c][3] - BB[c][1] + 4} fill={TCOL[team]} opacity={0.66} />
        <rect x={BB[c][0] - 2} y={BB[c][1] - 2} width={BB[c][2] - BB[c][0] + 4} height={BB[c][3] - BB[c][1] + 4} fill={`url(#ht-${team})`} />
      </g>
    );
    defs.push(<clipPath key={`oc${c}`} id={`oc-${c}`}>{PCS[c].map((p, i) => <path key={i} d={p.d} />)}</clipPath>);
    const mb = [BB[c][0] - 20, BB[c][1] - 20, BB[c][2] - BB[c][0] + 40, BB[c][3] - BB[c][1] + 40];
    if (q < 1) defs.push(<mask key={`mk${c}`} id={`mk-${c}`} maskUnits="userSpaceOnUse" x={mb[0]} y={mb[1]} width={mb[2]} height={mb[3]}><path d={blob(g.A, g.R * 1.35 * q, c.charCodeAt(0) * 7 + c.charCodeAt(1) + (cur ? cur.t : 0))} fill="white" /></mask>);
    if (q < 1 && cur) occ.push(layer(cur.from, `${c}p`));
    occ.push(layer(cur ? cur.to : TEAMOF[c], `${c}n`, q < 1 ? `url(#mk-${c})` : undefined));
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
        {it && <g opacity={0.6 * lerp(t, it[0], it[0] + 0.25, 0, 1) * lerp(t, it[2] - 0.25, it[2], 1, 0)}>{visCodes.filter((c) => TEAMOF[c] !== it[1]).map((c) => <g key={c} clipPath={`url(#cf-${c})`}><rect x={BB[c][0]} y={BB[c][1]} width={BB[c][2] - BB[c][0]} height={BB[c][3] - BB[c][1]} fill="#0a1220" /></g>)}</g>}
        <path d={visD(INNER, vis)} fill="none" stroke="#3d4450" strokeWidth={0.8 * inv} />
        <path d={visD(COAST, vis)} fill="none" stroke={INK} strokeWidth={1.6 * inv} />
        <path d={visD(ctrlB, vis)} fill="none" stroke={INK} strokeWidth={3.2 * inv} />
        <Units t={t} s={s} vis={vis} ui={vp.ui} />
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
const ORDER = ['CHR', 'ISL', 'HIN', 'BUD', 'JEW', 'ATH'];
const SHR: Record<string, number>[] = CTRL.map((cc) => { const o: Record<string, number> = {}; for (const tm of ORDER) o[tm] = 0; for (const c of CODES) o[cc[c]] = (o[cc[c]] || 0) + (WGT[c] || 0); return o; });
export const shareAt = (t: number) => {
  const k = firedK(t);
  const o = {...SHR[k]};
  for (let i = k - 1; i >= 0 && CAPS[i].t + D > t; i--) { const c = CAPS[i], q = Math.min(1, (t - c.t) / D), w = (WGT[c.c] || 0) * (1 - q); o[c.to] -= w; o[c.from] += w; }
  return o;
};
const SHORT: Record<string, string> = {CHR: 'CHRISTIANITY', ISL: 'ISLAM', HIN: 'HINDUISM', BUD: 'BUDDHISM', ATH: 'ATHEISM', JEW: 'JUDAISM'};
const H0 = INTRO.length ? INTRO[INTRO.length - 1][1] : 18;
const ShareHUD: React.FC<{t: number}> = ({t}) => {
  const v = TL.victory as number;
  if (t < H0 || t > v) return null;
  const k = popT(t, H0, 13) * lerp(t, v - 0.4, v, 1, 0);
  const sh = shareAt(t);
  const tot = ORDER.reduce((a, b) => a + Math.max(0, sh[b]), 0) || 1;
  const BW = 1240;
  const losses = CAPS.filter((c) => c.lead && c.from !== c.to && t >= c.t && t < c.t + 1.6).slice(-3);
  return (
    <div style={{position: 'absolute', top: 14, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 10, transform: `translateY(${(1 - k) * -200}px)`}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(16,22,34,0.86)', border: '5px solid #fff', borderRadius: 26, padding: '8px 18px', boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>
          <div style={{...font, fontSize: 26, color: YELLOW, lineHeight: 1, textAlign: 'center', width: 96}}>WORLD<br />SHARE</div>
          <div style={{position: 'relative', width: BW, height: 54, borderRadius: 16, overflow: 'hidden', border: `5px solid ${INK}`, display: 'flex', background: '#222'}}>
            {ORDER.map((tm) => {
              const w = Math.max(0, sh[tm]) / tot;
              if (w <= 0.0005) return null;
              const px = w * BW;
              return (
                <div key={tm} style={{width: px, height: '100%', position: 'relative', background: `repeating-linear-gradient(45deg, ${TCOL[tm]}, ${TCOL[tm]} 12px, ${TDARK[tm]} 12px, ${TDARK[tm]} 24px)`, borderRight: `3px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, overflow: 'hidden', whiteSpace: 'nowrap'}}>
                  {px > 70 && <div style={{width: 34, height: 34, flexShrink: 0}}><Avatar size={34} code={TFLAG(tm)} mood="calm" t={t} seed={tm.charCodeAt(1)} id={`sh-${tm}`} /></div>}
                  {px > 44 && <span style={{...font, fontSize: 26, color: '#fff', textShadow: `2px 2px 0 ${INK}`}}>{px > 230 ? `${SHORT[tm]} ` : ''}{Math.round(w * 100)}%</span>}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{display: 'flex', gap: 10, height: 50}}>
          {losses.map((c) => {
            const kk = popT(t, c.t, 11) * lerp(t, c.t + 1.3, c.t + 1.6, 1, 0);
            return (
              <div key={c.c + c.t} style={{transform: `scale(${kk})`, display: 'flex', alignItems: 'center', gap: 8, background: RED, border: `4px solid ${INK}`, borderRadius: 14, padding: '2px 14px 0 6px', ...font, fontSize: 28, color: '#fff', whiteSpace: 'nowrap'}}>
                <div style={{width: 36, height: 36}}><Avatar size={36} code={TFLAG(c.from)} mood="scared" t={t} seed={3} id={`ls-${c.c}-${Math.round(c.t * 10)}`} /></div>
                {SHORT[c.from]} -{(WGT[c.c] || 0) < 0.1 ? (WGT[c.c] || 0).toFixed(2) : (WGT[c.c] || 0).toFixed(1)}%
              </div>
            );
          })}
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
      <div style={{transform: `scale(${k}) rotate(-2deg)`, display: 'flex', alignItems: 'center', gap: 14, background: (f as any).alliance ? `linear-gradient(90deg, ${TCOL.CHR}, ${TCOL.ISL}, ${TCOL.HIN}, ${TCOL.BUD})` : big ? RED : TCOL[f.team], border: `6px solid ${INK}`, borderRadius: 20, padding: big ? '10px 34px 4px' : '6px 24px 2px', ...font, fontSize: big ? 66 : 42, color: '#fff', textShadow: `3px 3px 0 ${INK}`, boxShadow: '0 8px 0 rgba(0,0,0,0.35)', whiteSpace: 'nowrap'}}>
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
const TINFO: Record<string, [string, number, string, string]> = {CHR: ['2.3 billion', 0, 'USA', 'US'], ISL: ['2.0 billion', 0, 'Indonesia', 'ID'], HIN: ['1.2 billion', 0, 'India', 'IN'], BUD: ['324 million', 0, 'Thailand', 'TH'], ATH: ['1.9 billion', 0, 'China', 'CN']};
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
  const four = ['CHR', 'ISL', 'HIN', 'BUD'];
  const lines = ['Truce?', 'Truce.', 'Together, then!', 'Agreed.'];
  const join = lerp(dt, 3.2, 3.8, 0, 1, Easing.inOut(Easing.cubic));
  return (
    <AbsoluteFill style={{zIndex: 16, background: `rgba(8,15,30,${0.72 * a})`, alignItems: 'center', justifyContent: 'center', opacity: a}}>
      <div style={{position: 'relative', width: 1920, height: 1080}}>
        {four.map((tm, i) => {
          const x0 = [260, 760, 1160, 1660][i], x1 = 560 + i * 200;
          const x = x0 + (x1 - x0) * join;
          const yIn = (1 - Math.min(1, Math.max(0, dt - i * 0.15) / 0.35)) * 500;
          const bk = popT(t, t0 + 0.5 + i * 0.6, 10) * lerp(dt, 3.0, 3.2, 1, 0);
          return (
            <div key={tm} style={{position: 'absolute', left: x, top: 470 + yIn, transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <div style={{position: 'absolute', top: -120, transform: `scale(${bk})`, background: '#fff', border: `5px solid ${INK}`, borderRadius: 20, padding: '6px 18px 0', ...font, fontSize: 40, color: INK, whiteSpace: 'nowrap'}}>{lines[i]}</div>
              <Avatar size={join > 0.5 ? 200 : 230} code={TFLAG(tm)} mood={join > 0.5 ? 'angry' : 'calm'} t={t} seed={i} look={[1, 0]} id={`un-${tm}`} />
              <div style={{...font, fontSize: 36, color: '#fff', textShadow: `3px 3px 0 ${INK}`, marginTop: 6}}>{TNAME[tm]}</div>
            </div>
          );
        })}
        {dt > 3.6 && <div style={{position: 'absolute', left: 0, right: 0, top: 120, display: 'flex', justifyContent: 'center'}}><div style={{transform: `scale(${popT(t, t0 + 3.6, 9)}) rotate(-3deg)`, background: `linear-gradient(90deg, ${TCOL.CHR}, ${TCOL.ISL}, ${TCOL.HIN}, ${TCOL.BUD})`, border: `9px solid ${INK}`, borderRadius: 28, padding: '12px 50px 4px', ...font, fontSize: 104, color: '#fff', textShadow: `5px 5px 0 ${INK}`, whiteSpace: 'nowrap'}}>ALL RELIGIONS UNITE!</div></div>}
        {dt > 4.4 && <div style={{position: 'absolute', left: 0, right: 0, top: 740, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30, transform: `scale(${popT(t, t0 + 4.4, 10)})`}}><div style={{...font, fontSize: 90, color: RED, textShadow: `5px 5px 0 ${INK}`}}>VS</div><Avatar size={170} code="tath" mood="scared" t={t} seed={9} id="un-ath" /><div style={{...font, fontSize: 60, color: '#fff', textShadow: `4px 4px 0 ${INK}`}}>ATHEISM</div></div>}
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
        <div style={{width: 60, height: 60}}><Avatar size={60} code="tath" mood="smug" t={t} seed={7} id="qc-ath" /></div>{text.slice(0, n)}<span style={{opacity: n < text.length ? 1 : 0}}>|</span>
      </div>
    </div>
  );
};

// ================= título, final =================
const Title: React.FC<{t: number}> = ({t}) => {
  if (t > 4.4) return null;
  const k = popT(t, 0.05, 10) * lerp(t, 3.9, 4.4, 1, 0);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 14}}>
      <div style={{transform: `scale(${k}) rotate(-2deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
        <div style={{display: 'flex', gap: 14}}>{['CHR', 'ISL', 'HIN', 'BUD', 'ATH'].map((tm, i) => <div key={tm} style={{transform: `translateY(${Math.sin(t * 6 + i) * 6}px)`}}><Avatar size={120} code={TFLAG(tm)} mood="angry" t={t} seed={i} id={`tt-${tm}`} /></div>)}</div>
        <div style={{background: RED, border: `9px solid ${INK}`, borderRadius: 30, padding: '20px 56px 10px', boxShadow: '0 12px 0 rgba(0,0,0,0.35)', ...font, fontSize: 124, color: '#fff', textShadow: `5px 5px 0 ${INK}`, textAlign: 'center', lineHeight: 1.02}}>EVERY RELIGION<br />GOES TO WAR</div>
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
    [<div style={{fontSize: 40}}>🤝</div>, 'Champion', 'THE ALLIANCE'],
    [<WFlag code={mvp[0]} w={54} h={36} />, 'MVP', `${nameOf(mvp[0])} · ${mvp[1]} captures`],
    [<Avatar size={48} code="tath" mood="sad" t={t} seed={4} id="st-ath" />, 'Atheism peak', `${Math.round((TL as any).peak)}% of the world`],
    [<WFlag code="CN" w={54} h={36} />, 'Biggest battle', 'Battle of Beijing'],
    [<div style={{fontSize: 40}}>⚔️</div>, 'Total war', `${FRONTS.length} battles · ${CAPS.filter((c) => c.lead).length} captures`],
  ];
  return (
    <AbsoluteFill style={{zIndex: 14, background: `rgba(8,15,30,${0.5 * k})`, opacity: k}}>
      <div style={{position: 'absolute', left: interpolate(shift, [0, 1], [960, 470]), top: 540, transform: `translate(-50%,-50%) scale(${popT(t, v, 10)})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{fontSize: 150, marginBottom: -30, zIndex: 2, transform: `translateY(${Math.sin(t * 3) * 6}px)`}}>🏆</div>
        <div style={{display: 'flex', gap: 6}}>{['CHR', 'ISL', 'HIN', 'BUD', 'JEW'].map((tm, i) => <div key={tm} style={{transform: `translateY(${Math.sin(t * 5 + i) * 8}px)`}}><Avatar size={150} code={TFLAG(tm)} mood="happy" t={t} seed={i} id={`win-${tm}`} /></div>)}</div>
        <div style={{marginTop: 18, background: YELLOW, border: `8px solid ${INK}`, borderRadius: 26, padding: '8px 44px 0', ...font, fontSize: 80, color: INK, boxShadow: '0 10px 0 rgba(0,0,0,0.4)', whiteSpace: 'nowrap'}}>THE ALLIANCE WINS!</div>
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
      <div style={{display: 'flex', gap: 14, marginBottom: 26, transform: `scale(${k})`}}>{['CHR', 'ISL', 'HIN', 'BUD', 'ATH'].map((tm, i) => <Avatar key={tm} size={110} code={TFLAG(tm)} mood="angry" t={t} seed={i} id={`q-${tm}`} />)}</div>
      <div style={{transform: `scale(${k}) rotate(-2deg)`, background: '#fff', border: `9px solid ${INK}`, borderRadius: 30, padding: '24px 50px 14px', ...font, fontSize: 92, color: INK, textAlign: 'center', lineHeight: 1.05, boxShadow: '0 12px 0 rgba(0,0,0,0.35)'}}>Which one would win<br /><span style={{color: RED}}>ALONE</span>?</div>
      <div style={{marginTop: 30, transform: `scale(${popT(t, q + 0.5, 12)})`, background: YELLOW, border: `6px solid ${INK}`, borderRadius: 24, padding: '8px 34px 2px', ...font, fontSize: 56, color: INK}}>Comment below!</div>
    </AbsoluteFill>
  );
};
const Credit = () => <div style={{position: 'absolute', right: 18, bottom: 12, background: 'rgba(15,25,40,0.65)', color: '#fff', borderRadius: 12, padding: '5px 14px', ...font2, fontWeight: 600, fontSize: 17, zIndex: 20}}>Hypothetical simulation · Majority religion by country: Pew Research Center · Respect to every belief</div>;

export const WarRel: React.FC = () => {
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
