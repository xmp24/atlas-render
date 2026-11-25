import React from 'react';
import {AbsoluteFill, Easing, useCurrentFrame} from 'remotion';
import TLJ from './army-tl.json';
import {P, Cam, INK, RED, BLUE, GREEN, YELLOW, clamp, lerp, font, font2, popT, arcPath, PathArrow, Boom} from './lib3';
import {PIECES, PL, FlagSvg, fitFlagBox, WFlag, usePreload, Piece} from './War6';

const TL = TLJ as any;
const FPS = 30;
const NAME = TL.names as Record<string, string>;
const nm = (c: string) => (NAME[c] || PL[c]?.name || c).toUpperCase();
const SC = TL.scale as Record<string, number>;
const TROOPS = TL.troops as Record<string, number>;
const FACT = TL.factor as Record<string, number>;
const ALIVE0 = TL.alive0 as string[];
const INTRO = TL.intro as {t: number; code: string; codes: string[]; kind: 'giant' | 'small' | 'gone'; dur: number; title: [string, string]; factor: number; s: number}[];
const [TT0, TT1] = TL.title as [number, number];
const [M0, M1] = TL.morph as [number, number];
const WAR0 = TL.warStart as number;
const EVT = TL.events as [number, string, string[]][];
const PW = TL.pw as [number, string, number, number][];
const ALLY = TL.allies as [number, string, string, string?][];
const TURNS = TL.turns as any[];
const CHAP = TL.chapters as [number, string, string][];
const BAN = TL.banners as [number, string, string][];
const DUR = TL.duration as number;
const WIN_T = TL.winT as number;
const WINNER = TL.winner as string;
export const armyFrames = () => Math.round(DUR * FPS);
const MP = PIECES.filter((p) => PL[p.code]);
const HOME = (c: string): P => PL[c].home;
const D = 1.15; // duración de la conquista
const ui = (x: number) => x;
const SEA0 = '#2f7fc4';
const LAND_G = '#d6dbe1';

// ================= escala de cada país en el tiempo =================
const introOf: Record<string, (typeof INTRO)[number]> = {};
INTRO.forEach((it) => it.codes.forEach((c) => (introOf[c] = it)));
const morphStart = (c: string) => M0 + 0.6 + (HOME(c)[0] / 1920) * 2.6 + ((HOME(c)[1] / 1080) * 0.5);
const target = (c: string) => SC[c] ?? 0;
export const sAt = (c: string, t: number) => {
  const it = introOf[c];
  if (it) {
    if (it.kind === 'gone') return lerp(t, it.t + 1.0, it.t + 1.9, 1, 0, Easing.in(Easing.back(1.6)));
    return lerp(t, it.t + 0.55, it.t + 1.75, 1, target(c), Easing.out(Easing.back(1.4)));
  }
  const ms = morphStart(c);
  if (target(c) === 0) return lerp(t, ms, ms + 0.9, 1, 0, Easing.in(Easing.back(1.4)));
  return lerp(t, ms, ms + 1.3, 1, target(c), Easing.out(Easing.back(1.3)));
};
const revealT = (c: string) => (introOf[c] ? introOf[c].t + 0.2 : morphStart(c) - 0.2);
const sbox = (b: number[], h: P, s: number) => [h[0] + (b[0] - h[0]) * s, h[1] + (b[1] - h[1]) * s, h[0] + (b[2] - h[0]) * s, h[1] + (b[3] - h[1]) * s];
const union = (a: number[], b: number[]) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])];

// ================= dueños, equipos y poder =================
const OWN: Record<string, string>[] = [Object.fromEntries(Object.keys(PL).map((c) => [c, c]))];
EVT.forEach(([, w, ls], i) => {
  const prev = OWN[i], next: Record<string, string> = {};
  for (const c in prev) next[c] = ls.includes(prev[c]) ? w : prev[c];
  OWN.push(next);
});
const doneK = (t: number) => { let k = 0; while (k < EVT.length && EVT[k][0] + D <= t) k++; return k; };
const firedK = (t: number) => { let k = 0; while (k < EVT.length && EVT[k][0] <= t) k++; return k; };
export const elimT: Record<string, number> = {};
EVT.forEach(([t, , ls]) => ls.forEach((l) => (elimT[l] = t)));
const isAlive = (c: string, t: number) => target(c) > 0 && (elimT[c] === undefined || t < elimT[c]);
const teamAt = (t: number) => {
  const tm: Record<string, string> = Object.fromEntries(ALIVE0.map((c) => [c, c]));
  for (const [ta, a, b, kind] of ALLY) {
    if (t < ta) break;
    if (kind === 'break') { tm[b] = b; tm[a] = a; continue; }
    const L = tm[a];
    for (const c in tm) if (tm[c] === tm[b]) tm[c] = L;
  }
  return tm;
};
const powerAt = (c: string, t: number) => { let p = TROOPS[c] || 0; for (const [tp, cc, v] of PW) { if (tp > t) break; if (cc === c) p = v; } return p; };
const gainNear = (c: string, t: number) => PW.find(([tp, cc]) => cc === c && t >= tp && t < tp + 2.6);
export const fmtK = (n: number) => (n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 1 : 2) + 'M' : n >= 1e4 ? Math.round(n / 1e3) + 'K' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : String(Math.round(n)));
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

// bbox del territorio de un dueño (escala final), con caché por estado
const bbCache = new Map<string, number[] | null>();
const ownBox = (owners: string[], k: number) => {
  const key = owners.join(',') + '|' + k;
  if (bbCache.has(key)) return bbCache.get(key)!;
  let b: number[] | null = null;
  const own = OWN[k];
  for (const p of MP) if (owners.includes(own[p.code]) && target(p.code) > 0) { const sb = sbox(p.bbox, HOME(p.code), target(p.code)); b = b ? union(b, sb) : sb; }
  bbCache.set(key, b);
  return b;
};

// ================= cámara =================
type K = [number, number, number, number]; // t, cx, cy, s
const KEYS: K[] = [];
const boxCam = (b: number[], pad = 1.6, smax = 6, smin = 1): [number, number, number] => {
  const w = Math.max(30, b[2] - b[0]) * pad, h = Math.max(20, b[3] - b[1]) * pad;
  const s = Math.max(smin, Math.min(smax, 1920 / w, 1080 / h));
  return [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2, s];
};
const WORLD: [number, number, number] = [960, 560, 1.0];
// deja hueco a la derecha para la ruleta: el país queda en el centro-izquierda
const leftOf = (v: [number, number, number], px = 240): [number, number, number] => [v[0] + px / v[2], v[1], v[2]];
const CONTBOX: Record<string, number[]> = {};
for (const p of MP) { const c = PL[p.code] as any; const k = c.cont; if (k === 'XX') continue; const b = sbox(p.bbox, HOME(p.code), Math.max(0.6, target(p.code))); CONTBOX[k] = CONTBOX[k] ? union(CONTBOX[k], b) : b; }
const contOf = (c: string) => (PL[c] as any).cont as string;
KEYS.push([0, ...boxCam(sbox(ownBox(['KP'], 0)!, HOME('KP'), 1), 6, 5)]);
INTRO.forEach((it) => {
  let b: number[] | null = null;
  it.codes.forEach((c) => { const bx = PL[c] ? sbox((MP.find((p) => p.code === c) || {bbox: [HOME(c)[0] - 5, HOME(c)[1] - 5, HOME(c)[0] + 5, HOME(c)[1] + 5]}).bbox, HOME(c), 1) : null; if (bx) b = b ? union(b, bx) : bx; });
  for (const p of MP) if (it.codes.includes(p.code)) { const sb = sbox(p.bbox, HOME(p.code), Math.max(1, it.s)); b = b ? union(b, sb) : sb; }
  const pad = it.code === 'SG' ? 14 : it.code === 'IL' ? 6 : it.code === 'CR' ? 5 : it.code === 'KP' ? 3.2 : 2.2;
  KEYS.push([it.t, ...boxCam(b!, pad, it.code === 'SG' ? 14 : 8, 1)]);
  if (it === INTRO[1]) KEYS.push([TT0, ...WORLD]);
});
KEYS.push([M0, ...WORLD]);
// turnos
const viewOfTurn = (tr: any) => {
  const k = doneK(tr.t0);
  const tm = teamAt(tr.t0 + 0.01);
  const mem = (c: string) => ALIVE0.filter((x) => tm[x] === tm[c] && isAlive(x, tr.t0));
  return {k, mem};
};
CHAP.forEach(([t, title]) => {
  const cont = title.includes('ASIA') ? 'AS' : title.includes('EUROPE') ? 'EU' : title.includes('AFRICA') ? 'AF' : title.includes('MIDDLE') ? 'ME' : title.includes('AMERICAS') ? 'SA' : title.includes('OCEANIA') ? 'OC' : '';
  if (cont === 'SA') KEYS.push([t, ...boxCam(union(CONTBOX.SA, CONTBOX.NA), 1.05, 3)]);
  else KEYS.push([t, ...(cont ? boxCam(CONTBOX[cont], 1.15, 3.2) : WORLD)]);
});
TURNS.forEach((tr) => {
  if (tr.kind === 'ev3') {
    KEYS.push([tr.t0, ...WORLD]);
    const all = [...tr.A, ...tr.D];
    const b = ownBox(all, doneK(tr.t0));
    if (b) KEYS.push([tr.tArrows[0], ...boxCam(b, 1.25, 3)]);
    KEYS.push([tr.t1 - 0.3, ...WORLD]);
    return;
  }
  const {k, mem} = viewOfTurn(tr);
  const ab = ownBox(mem(tr.att), k);
  if (!ab) return;
  const cb = CONTBOX[contOf(tr.att)] || ab;
  KEYS.push([tr.tSel, ...(tr.mode === 'quick' ? boxCam(union(ab, ab), 4.5, 3.4) : boxCam(union(cb, ab), 1.1, 2.6))]);
  KEYS.push([tr.tZoom, ...leftOf(boxCam(ab, 1.45, 6.5, 1.7))]);
  if (tr.action === 'ALLIANCE') {
    const pb = ownBox(mem(tr.partner), k);
    if (pb) KEYS.push([tr.tPick + 1.6, ...boxCam(union(ab, pb), 1.35, 5.5, 1.3)]);
    return;
  }
  (tr.fights as any[]).forEach((f: any) => {
    const db = ownBox(f.defM, doneK(f.tDir));
    const ab2 = ownBox(f.attM, doneK(f.tDir));
    if (db && ab2) KEYS.push([f.tDir, ...leftOf(boxCam(union(ab2, db), 1.3, 6, 1.4), 200)]);
  });
});
KEYS.push([WIN_T - 0.2, ...WORLD]);
KEYS.sort((a, b) => a[0] - b[0]);
export const camera = (t: number): Cam => {
  let i = 0;
  while (i < KEYS.length - 1 && t >= KEYS[i + 1][0]) i++;
  const [ta, xb, yb, sb] = KEYS[i];
  const [, xa, ya, sa] = KEYS[Math.max(0, i - 1)];
  const dur = i + 1 < KEYS.length ? Math.min(1.0, Math.max(0.35, (KEYS[i + 1][0] - ta) * 0.6)) : 1.0;
  const q = i === 0 ? 1 : lerp(t, ta, ta + dur, 0, 1, Easing.inOut(Easing.cubic));
  const s = sa * Math.pow(sb / sa, q);
  // en escala logarítmica, el centro se mueve en proporción a la escala
  const qq = sb === sa ? q : (1 / s - 1 / sa) / (1 / sb - 1 / sa);
  const qc = Number.isFinite(qq) ? Math.max(0, Math.min(1, qq)) : q;
  let cx = xa + (xb - xa) * qc, cy = ya + (yb - ya) * qc;
  // sacudidas en conquistas
  for (const [te] of EVT) { const d = t - te; if (d >= 0 && d < 0.3) { const a = ((1 - d / 0.3) * 5) / s; cx += Math.sin(d * 90) * a; cy += Math.cos(d * 70) * a; } }
  const hw = 960 / s, hh = 540 / s;
  cx = Math.max(hw - 40, Math.min(1960 - hw, cx));
  cy = Math.max(hh - 40, Math.min(1120 - hh, cy));
  return {cx, cy, s};
};
const toS = (p: P, cam: Cam): P => [960 + (p[0] - cam.cx) * cam.s, 540 + (p[1] - cam.cy) * cam.s];

// ================= estado de la escena (qué turno y en qué fase) =================
const turnAt = (t: number) => { for (let i = TURNS.length - 1; i >= 0; i--) if (t >= TURNS[i].t0 && t < TURNS[i].t1 + 0.1) return TURNS[i]; return null; };
const fightAt = (tr: any, t: number) => { if (!tr || !tr.fights) return null; for (let i = tr.fights.length - 1; i >= 0; i--) if (t >= tr.fights[i].tDir) return tr.fights[i]; return null; };

// ================= ojos (estilo de la referencia) =================
type EyeMood = 'calm' | 'fire' | 'scared' | 'cool' | 'happy' | 'dead';
const Eyes: React.FC<{x: number; y: number; r: number; mood: EyeMood; look: P; t: number; seed: number; power?: string; alpha?: number; pump?: number}> = ({x, y, r, mood, look, t, seed, power, alpha = 1, pump = 1}) => {
  const blink = ((t * 0.37 + seed * 0.13) % 3.7) < 0.12 ? 0.12 : 1;
  const ex = r * 0.52, ew = r * 0.42, eh = r * 0.5 * (mood === 'scared' ? 1.12 : 1);
  const ir = r * (mood === 'scared' ? 0.17 : 0.25);
  const lk: P = [look[0] * r * 0.12, look[1] * r * 0.1];
  const sw = Math.max(0.6, r * 0.075);
  return (
    <g transform={`translate(${x},${y}) scale(${pump})`} opacity={alpha}>
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`translate(${sd * ex},0)`}>
          <ellipse rx={ew} ry={eh * (mood === 'cool' ? 1 : blink)} fill="#fff" stroke={INK} strokeWidth={sw} />
          {mood !== 'cool' && blink > 0.5 && (
            <g transform={`translate(${lk[0]},${lk[1] + eh * 0.08})`}>
              {mood === 'fire' ? (
                <path d={`M0,${ir * 1.3} C${-ir * 1.3},${ir * 0.9} ${-ir * 1.1},${-ir * 0.4} ${-ir * 0.2},${-ir * 1.6} C${-ir * 0.2},${-ir * 0.6} ${ir * 0.5},${-ir * 0.7} ${ir * 0.5},${-ir * 1.3} C${ir * 1.4},${-ir * 0.3} ${ir * 1.2},${ir * 1.0} 0,${ir * 1.3} Z`} fill="#ff7a1a" stroke="#d6281e" strokeWidth={sw * 0.7} />
              ) : mood === 'dead' ? (
                <g stroke={INK} strokeWidth={sw * 1.3} strokeLinecap="round"><line x1={-ir} y1={-ir} x2={ir} y2={ir} /><line x1={ir} y1={-ir} x2={-ir} y2={ir} /></g>
              ) : (
                <>
                  <circle r={ir * 1.25} fill="#2e64c8" />
                  <circle r={ir * 0.72} fill={INK} />
                  <circle cx={-ir * 0.4} cy={-ir * 0.45} r={ir * 0.32} fill="#fff" />
                </>
              )}
            </g>
          )}
          {mood === 'happy' && <path d={`M${-ew},${eh * 0.35} Q0,${-eh * 0.9} ${ew},${eh * 0.35} L${ew},${eh * 1.1} L${-ew},${eh * 1.1}Z`} fill="rgba(0,0,0,0)" />}
        </g>
      ))}
      {mood === 'scared' && <path d={`M${r * 0.98},${-r * 0.35} q${r * 0.12},${r * 0.22} 0,${r * 0.3} q${-r * 0.12},${-r * 0.08} 0,${-r * 0.3}`} fill="#7fd0ff" stroke={INK} strokeWidth={sw * 0.6} />}
      {mood === 'cool' && (
        <g transform={`translate(0,${-r * 0.02})`}>
          <rect x={-r * 1.12} y={-r * 0.3} width={r * 2.24} height={r * 0.16} fill={INK} />
          {[-1, 1].map((sd) => <rect key={sd} x={sd * ex - ew * 1.05} y={-r * 0.3} width={ew * 2.1} height={r * 0.52} rx={r * 0.04} fill={INK} />)}
          {[-1, 1].map((sd) => <rect key={`h${sd}`} x={sd * ex - ew * 0.75} y={-r * 0.2} width={ew * 0.42} height={r * 0.12} fill="#fff" />)}
        </g>
      )}
      {power && r > 2 && (
        <g transform={`translate(0,${eh + r * 0.42})`}>
          <rect x={-r * (0.25 + power.length * 0.2)} y={-r * 0.25} width={r * (0.5 + power.length * 0.4)} height={r * 0.5} rx={r * 0.25} fill="rgba(18,22,30,0.82)" stroke="#fff" strokeWidth={sw * 0.5} />
          <text y={r * 0.15} textAnchor="middle" fontSize={r * 0.42} fill="#fff" style={{...font}}>{power}</text>
        </g>
      )}
    </g>
  );
};

// ================= mapa =================
const tf = (c: string, s: number) => { const h = HOME(c); return `translate(${h[0]},${h[1]}) scale(${s}) translate(${-h[0]},${-h[1]})`; };
const pieceArea = (p: Piece) => p.area;
const WorldMap: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const {cx, cy, s} = cam;
  const inv = 1 / s;
  const vx0 = cx - 960 / s - 40, vx1 = cx + 960 / s + 40, vy0 = cy - 540 / s - 40, vy1 = cy + 540 / s + 40;
  const vis = (b: number[]) => b[2] > vx0 && b[0] < vx1 && b[3] > vy0 && b[1] < vy1;
  const k = doneK(t);
  const own = OWN[k];
  const tm = teamAt(t);
  const intro = t < M1 + 3;
  // capa fantasma (el mapa real, en gris)
  const ghostA = t < M0 ? 1 : lerp(t, M0 + 2, M1 + 1, 1, 0.42);
  // piezas visibles con su escala actual
  type PV = {p: Piece; sc: number; sb: number[]};
  const pv: PV[] = [];
  for (const p of MP) {
    const c = p.code;
    if (t < revealT(c)) continue;
    const sc = sAt(c, t);
    if (sc <= 0.01) continue;
    const sb = sbox(p.bbox, HOME(c), sc);
    if (!vis(sb)) continue;
    pv.push({p, sc, sb});
  }
  // conquistas en curso: las piezas de los perdedores se rellenan con la bandera del ganador
  const overlays: {w: string; ls: string[]; q: number; A: P; R: number}[] = [];
  for (let i = k; i < EVT.length && EVT[i][0] <= t; i++) {
    const [te, w, ls] = EVT[i];
    const q = Easing.inOut(Easing.cubic)(Math.min(1, (t - te) / D));
    const lb = ownBox(ls, i);
    const wb = ownBox([w], i);
    if (!lb) continue;
    const lc: P = [(lb[0] + lb[2]) / 2, (lb[1] + lb[3]) / 2];
    const wc: P = wb ? [(wb[0] + wb[2]) / 2, (wb[1] + wb[3]) / 2] : lc;
    const dx = wc[0] - lc[0], dy = wc[1] - lc[1], dl = Math.hypot(dx, dy) || 1;
    const half = Math.hypot(lb[2] - lb[0], lb[3] - lb[1]) / 2;
    const A: P = [lc[0] + (dx / dl) * Math.min(dl, half * 0.9), lc[1] + (dy / dl) * Math.min(dl, half * 0.9)];
    const R = Math.max(...[[lb[0], lb[1]], [lb[2], lb[1]], [lb[0], lb[3]], [lb[2], lb[3]]].map(([x, y]) => Math.hypot(x - A[0], y - A[1]))) * 1.05;
    overlays.push({w, ls, q, A, R});
  }
  // grupos por equipo (para que la frontera entre aliados desaparezca) y por dueño (bandera)
  const teams = new Map<string, Map<string, PV[]>>();
  for (const x of pv) {
    const o = own[x.p.code];
    const L = tm[o] || o;
    if (!teams.has(L)) teams.set(L, new Map());
    const m = teams.get(L)!;
    if (!m.has(o)) m.set(o, []);
    m.get(o)!.push(x);
  }
  const order = [...teams.entries()].sort((a, b) => Math.max(...[...a[1].keys()].map((o) => target(o))) - Math.max(...[...b[1].keys()].map((o) => target(o))));
  const ownerBox = (o: string) => { const b = ownBox([o], k); return b; };
  const flagBox = (o: string, list: PV[]) => {
    if (intro) return fitFlagBox(list.reduce((b, x) => union(b, x.sb), [...list[0].sb]));
    let b = ownerBox(o) || list.reduce((bb, x) => union(bb, x.sb), [...list[0].sb]);
    for (const ov of overlays) if (ov.w === o) { const lb = ownBox(ov.ls, k); if (lb) { const u = union(b, lb); b = b.map((v, j) => v + (u[j] - v) * ov.q); } }
    return fitFlagBox(b);
  };
  const sw = 2.2 * inv;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        {order.map(([L, m]) => [...m.entries()].map(([o, list]) => <clipPath key={`${L}-${o}`} id={`ac-${o}`}>{list.map((x, i) => <path key={i} d={x.p.d} transform={tf(x.p.code, x.sc)} />)}</clipPath>))}
        {overlays.map((ov, i) => (
          <React.Fragment key={i}>
            <clipPath id={`ao-${i}`}>{pv.filter((x) => ov.ls.includes(own[x.p.code])).map((x, j) => <path key={j} d={x.p.d} transform={tf(x.p.code, x.sc)} />)}</clipPath>
            <mask id={`am-${i}`} maskUnits="userSpaceOnUse" x={-200} y={-200} width={2400} height={1600}><circle cx={ov.A[0]} cy={ov.A[1]} r={ov.R * ov.q} fill="white" /></mask>
          </React.Fragment>
        ))}
      </defs>
      <g transform={`translate(960,540) scale(${s}) translate(${-cx},${-cy})`}>
        {ghostA > 0.01 && (
          <g opacity={ghostA}>
            {MP.filter((p) => vis(p.bbox)).map((p, i) => <path key={i} d={p.d} fill={LAND_G} stroke="#aab3bf" strokeWidth={0.8 * inv} />)}
          </g>
        )}
        {order.map(([L, m]) => (
          <g key={L}>
            <g transform={`translate(${1.6 * inv},${2.4 * inv})`} opacity={0.35}>{[...m.values()].flat().map((x, i) => <path key={i} d={x.p.d} transform={tf(x.p.code, x.sc)} fill="#06213f" />)}</g>
            {[...m.values()].flat().map((x, i) => <path key={`s${i}`} d={x.p.d} transform={tf(x.p.code, x.sc)} fill="#fff" stroke={INK} strokeWidth={(sw * 2.2) / x.sc} strokeLinejoin="round" />)}
            {[...m.entries()].map(([o, list]) => <g key={o} clipPath={`url(#ac-${o})`}><FlagSvg code={o} b={flagBox(o, list)} /></g>)}
          </g>
        ))}
        {overlays.map((ov, i) => (
          <g key={`ov${i}`} mask={`url(#am-${i})`}><g clipPath={`url(#ao-${i})`}><FlagSvg code={ov.w} b={fitFlagBox(union(ownBox([ov.w], k) || [0, 0, 1, 1], ownBox(ov.ls, k) || [0, 0, 1, 1]))} /></g></g>
        ))}
        {overlays.map((ov, i) => <circle key={`r${i}`} cx={ov.A[0]} cy={ov.A[1]} r={ov.R * ov.q} fill="none" stroke="#fff" strokeWidth={3 * inv} opacity={0.85 * (1 - ov.q)} />)}
        <MapFX t={t} cam={cam} own={own} tm={tm} pv={pv} />
        <AllEyes t={t} cam={cam} own={own} tm={tm} pv={pv} />
      </g>
    </svg>
  );
};

// contornos de selección, siluetas de alianza, flechas de ataque
const MapFX: React.FC<{t: number; cam: Cam; own: Record<string, string>; tm: Record<string, string>; pv: {p: Piece; sc: number; sb: number[]}[]}> = ({t, cam, own, tm, pv}) => {
  const inv = 1 / cam.s;
  const out: React.ReactNode[] = [];
  const outline = (owners: string[], color: string, key: string, dash?: boolean, w = 4) => {
    out.push(
      <g key={key}>
        {pv.filter((x) => owners.includes(own[x.p.code])).map((x, i) => <path key={i} d={x.p.d} transform={tf(x.p.code, x.sc)} fill="none" stroke={color} strokeWidth={(w * inv) / x.sc} strokeDasharray={dash ? `${(10 * inv) / x.sc} ${(7 * inv) / x.sc}` : undefined} strokeDashoffset={dash ? (-t * 40 * inv) / x.sc : 0} strokeLinejoin="round" />)}
      </g>,
    );
  };
  const tr = turnAt(t);
  const mem = (c: string) => ALIVE0.filter((x) => tm[x] === tm[c] && isAlive(x, t + 0.001));
  if (tr && tr.kind === 'turn' && t >= tr.tZoom) {
    const f = fightAt(tr, t);
    outline(mem(tr.att), YELLOW, 'att', false, 4.5);
    if (f && t >= f.tDir && t < f.tRes + 0.4) {
      const pulse = 0.6 + 0.4 * Math.sin(t * 12);
      if (t >= f.tDir + (tr.mode === 'quick' ? 0.8 : 1.4)) outline(f.defM, `rgba(255,80,70,${pulse})`, 'def', true, 5);
      // flecha de dirección que gira
      const a = HOME(tr.att), b = HOME(f.def_);
      const dur = (f.tVs - f.tDir) * 0.75;
      const ang1 = Math.atan2(b[1] - a[1], b[0] - a[0]);
      const u = Math.min(1, (t - f.tDir) / dur);
      const ang = ang1 - (1 - Easing.out(Easing.cubic)(u)) * Math.PI * 6;
      const L = 34 * inv;
      if (t < f.tVs + 0.6) {
        out.push(
          <g key="dir" transform={`translate(${a[0]},${a[1]}) rotate(${(ang * 180) / Math.PI})`} opacity={lerp(t, f.tVs, f.tVs + 0.6, 1, 0)}>
            <circle r={L * 0.55} fill="rgba(255,255,255,0.85)" stroke={INK} strokeWidth={3 * inv} />
            <path d={`M${L * 0.2},${-L * 0.28} L${L * 1.6},0 L${L * 0.2},${L * 0.28} Z`} fill={RED} stroke={INK} strokeWidth={3 * inv} strokeLinejoin="round" />
          </g>,
        );
      }
      if (t >= f.tVs - 0.2 && t < f.tRes + 1.6) {
        const dist = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const pts = arcPath(a, b, Math.min(50, dist * 0.2));
        out.push(<PathArrow key="arr" pts={pts} t={t} t0={f.tVs - 0.2} t1={f.tVs + 0.5} color="rgba(229,50,45,0.92)" w={6 * inv} fadeAfter={f.tRes + 1.6 - f.tVs} />);
      }
      if (t >= f.tRes && t < f.tRes + 1.6) {
        const win = f.win;
        const los = f.defM.includes(win) || tm[win] === tm[f.def_] ? tr.att : f.def_;
        out.push(<Boom key="bm" p={HOME(los)} t={t} at={f.tRes + 0.2} r={Math.max(8, 30 * inv)} />);
      }
    }
    if (tr.action === 'ALLIANCE' && t >= tr.tPick) {
      const k = lerp(t, tr.tAlly - 0.4, tr.tAlly + 0.6, 0, 1);
      if (t < tr.tAlly + 2.6) outline([...mem(tr.att), tr.partner], YELLOW, 'ally', true, 6 * (1 - 0.6 * k));
      const a = HOME(tr.att), b = HOME(tr.partner);
      if (t < tr.tAlly + 3) out.push(<line key="al" x1={a[0]} y1={a[1]} x2={a[0] + (b[0] - a[0]) * lerp(t, tr.tPick + 1.8, tr.tAlly, 0, 1)} y2={a[1] + (b[1] - a[1]) * lerp(t, tr.tPick + 1.8, tr.tAlly, 0, 1)} stroke="#4fc3ff" strokeWidth={5 * inv} strokeDasharray={`${12 * inv} ${9 * inv}`} opacity={lerp(t, tr.tAlly + 2.2, tr.tAlly + 3, 1, 0)} />);
    }
  }
  if (tr && tr.kind === 'ev3') {
    // líneas entre los 3 aliados
    if (t >= tr.tAllies && t < tr.tRes + 1.2) {
      const P3 = tr.A.map((c: string) => HOME(c));
      const k = lerp(t, tr.tAllies, tr.tAllies + 1.2, 0, 1);
      [[0, 1], [1, 2], [2, 0]].forEach(([i, j]) => out.push(<line key={`e${i}`} x1={P3[i][0]} y1={P3[i][1]} x2={P3[i][0] + (P3[j][0] - P3[i][0]) * k} y2={P3[i][1] + (P3[j][1] - P3[i][1]) * k} stroke="#4fc3ff" strokeWidth={5 * inv} strokeDasharray={`${14 * inv} ${10 * inv}`} opacity={0.9} />));
      outline(tr.A, '#4fc3ff', 'evA', true, 5);
    }
    tr.A.forEach((c: string, i: number) => {
      const ta = tr.tArrows[i];
      if (t < ta || t > tr.tRes + 1.6) return;
      const a = HOME(c), b = HOME(tr.D[i]);
      const dist = Math.hypot(b[0] - a[0], b[1] - a[1]);
      out.push(<PathArrow key={`ea${i}`} pts={arcPath(a, b, Math.min(60, dist * 0.2))} t={t} t0={ta} t1={ta + 0.8} color="rgba(229,50,45,0.92)" w={6 * inv} fadeAfter={9} />);
      if (t > ta + 0.7) outline([tr.D[i]], `rgba(255,80,70,${0.6 + 0.4 * Math.sin(t * 12)})`, `ed${i}`, true, 5);
    });
  }
  return <g>{out}</g>;
};

// ojos + poder de cada país vivo
const AllEyes: React.FC<{t: number; cam: Cam; own: Record<string, string>; tm: Record<string, string>; pv: {p: Piece; sc: number; sb: number[]}[]}> = ({t, cam, own, tm, pv}) => {
  const area: Record<string, number> = {};
  for (const x of pv) { const o = own[x.p.code]; area[o] = (area[o] || 0) + pieceArea(x.p) * x.sc * x.sc; }
  // área de los que acaban de conquistar crece suave
  const tr = turnAt(t);
  const f = fightAt(tr, t);
  const nodes: React.ReactNode[] = [];
  const war = t >= M1;
  for (const c of Object.keys(PL)) {
    if (t < revealT(c)) continue;
    const sc = sAt(c, t);
    const et = elimT[c];
    const gone = introOf[c]?.kind === 'gone';
    if (sc <= 0.02 && !gone) continue;
    if (target(c) === 0 && !gone) continue;
    if (et !== undefined && t > et + D) continue;
    if (gone && t > introOf[c].t + introOf[c].dur) continue;
    const h = HOME(c);
    let r = Math.min(80, Math.max(3.2, Math.sqrt(Math.max(area[c] || 0, PL[c].area * sc * sc * 0.5)) * 0.15));
    if (gone) r = 34 / cam.s;
    if (!(h[0] > cam.cx - 1000 / cam.s && h[0] < cam.cx + 1000 / cam.s && h[1] > cam.cy - 600 / cam.s && h[1] < cam.cy + 600 / cam.s)) continue;
    if (r * cam.s < 6) continue;
    let mood: EyeMood = 'calm';
    let look: P = [Math.sin(t * 0.7 + c.charCodeAt(0)) * 0.6, 0];
    if (tr && tr.kind === 'turn' && f) {
      const attSide = tm[c] === tm[tr.att];
      const defSide = f.defM.includes(c);
      const tgt = attSide ? HOME(f.def_) : defSide ? HOME(tr.att) : null;
      if (tgt) { const dx = tgt[0] - h[0], dy = tgt[1] - h[1], dl = Math.hypot(dx, dy) || 1; look = [dx / dl, dy / dl]; }
      const winnerSide = f.win === c || tm[f.win] === tm[c];
      if (t >= f.tRes && (attSide || defSide)) mood = winnerSide ? 'cool' : 'dead';
      else if (t >= f.tDir && attSide) mood = 'fire';
      else if (t >= f.tDir + 1 && defSide) mood = 'scared';
    }
    if (tr && tr.kind === 'turn' && tr.action === 'ALLIANCE' && t >= tr.tAlly && (c === tr.att || c === tr.partner)) mood = 'happy';
    if (tr && tr.kind === 'ev3') {
      const iA = tr.A.indexOf(c), iD = tr.D.indexOf(c);
      if (iA >= 0 || iD >= 0) {
        const won = (iA >= 0 && tr.win === 'A') || (iD >= 0 && tr.win === 'D');
        if (t >= tr.tRes) mood = won ? 'cool' : 'dead';
        else if (t >= tr.tArrows[0]) mood = iA >= 0 ? 'fire' : 'scared';
      }
    }
    if (gone) mood = t > introOf[c].t + 0.9 ? 'scared' : 'calm';
    if (introOf[c] && t < M0 && !gone) mood = introOf[c].kind === 'giant' && t > introOf[c].t + 0.6 ? 'happy' : introOf[c].kind === 'small' && t > introOf[c].t + 0.6 ? 'scared' : 'calm';
    if (t > WIN_T && c === WINNER) mood = 'cool';
    const alpha = et !== undefined ? lerp(t, et + 0.3, et + D, 1, 0) : 1;
    const inv = 1 / cam.s;
    const rr = Math.min(r, 92 * inv);
    const tmL = tm[c];
    const showP = war && t > WAR0 - 1;
    const pw = showP ? (tmL && ALIVE0.filter((x) => tm[x] === tmL && isAlive(x, t)).length > 1 ? ALIVE0.filter((x) => tm[x] === tmL && isAlive(x, t)).reduce((s, x) => s + powerAt(x, t), 0) : powerAt(c, t)) : 0;
    const g = gainNear(c, t);
    const pump = g ? 1 + 0.25 * lerp(t, g[0], g[0] + 0.5, 1, 0) : 1;
    nodes.push(<Eyes key={c} x={h[0]} y={h[1]} r={rr} mood={mood} look={look} t={t} seed={c.charCodeAt(0) + c.charCodeAt(1)} power={showP ? fmtK(pw) : undefined} alpha={alpha} pump={pump} />);
  }
  return <g>{nodes}</g>;
};

// ================= HUD =================
const Panel: React.FC<{children: React.ReactNode; style?: React.CSSProperties; border?: string}> = ({children, style, border = 'rgba(255,255,255,0.12)'}) => (
  <div style={{background: 'rgba(16,24,38,0.92)', border: `3px solid ${border}`, borderRadius: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.35)', ...style}}>{children}</div>
);
const aliveCount = (t: number) => ALIVE0.length - EVT.filter(([te]) => te <= t + 0.6).reduce((s, e) => s + e[2].length, 0);
const roundNo = (t: number) => TURNS.filter((x) => x.t0 <= t).length;
const AliveBox: React.FC<{t: number}> = ({t}) => {
  if (t < WAR0 - 0.5 || t > WIN_T + 0.5) return null;
  const k = popT(t, WAR0 - 0.5);
  const last = EVT.filter(([te]) => te <= t + 0.6).slice(-1)[0];
  const bump = last ? 1 + 0.3 * lerp(t, last[0] + 0.6, last[0] + 1.0, 1, 0) : 1;
  return (
    <Panel border="#ff4fa3" style={{position: 'absolute', left: 30, top: 28, width: 290, height: 92, transform: `scale(${k})`, transformOrigin: 'left top', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px'}}>
      <div>
        <div style={{...font2, fontSize: 21, color: '#fff', letterSpacing: 0.5}}>ALIVE COUNTRIES</div>
        <div style={{...font2, fontSize: 16, color: '#ff4fa3', marginTop: 6}}>ROUND #{Math.max(1, roundNo(t))}</div>
      </div>
      <div style={{...font, fontSize: 62, color: '#ff4fa3', transform: `scale(${bump})`}}>{aliveCount(t)}</div>
    </Panel>
  );
};
const StatusBar: React.FC<{t: number}> = ({t}) => {
  const tr = turnAt(t);
  if (!tr || t < WAR0) return null;
  let a = '', b = '';
  if (tr.kind === 'ev3') {
    if (t < tr.tSel) { a = 'SPECIAL EVENT!'; b = '3 COUNTRIES FROM ANYWHERE WILL UNITE'; }
    else if (t < tr.tAllies) { a = 'SELECTING 3 COUNTRIES...'; b = 'TRIPLE SELECTOR IS SPINNING'; }
    else if (t < tr.tArrows[0]) { a = `${nm(tr.A[0])} + ${nm(tr.A[1])} + ${nm(tr.A[2])}`; b = 'FORMING A SPECIAL ALLIANCE'; }
    else if (t < tr.tVs) { a = 'CHOOSING TARGETS'; b = 'EACH ALLY THROWS ONE ARROW'; }
    else return null;
  } else {
    const f = fightAt(tr, t);
    if (f && t >= f.tVs) return null;
    if (t < tr.tZoom) { a = 'SELECTING ACTIVE COUNTRY...'; b = 'THE COUNTRY SELECTOR IS SPINNING'; }
    else if (t < tr.tWheel) { a = `ACTIVE TURN: ${nm(tr.att)}`; b = 'ZOOMING TO THE SELECTED COUNTRY'; }
    else if (tr.action === 'ALLIANCE') {
      if (t < tr.tPick) { a = `ACTIVE TURN: ${nm(tr.att)}`; b = 'SPINNING THE EVENT WHEEL...'; }
      else if (t < tr.tAlly) { a = `ALLIANCE: ${nm(tr.att)}`; b = 'CHOOSING AN ALLIANCE PARTNER'; }
      else { a = `${nm(tr.att)} + ${nm(tr.partner)}`; b = `ALLIED · COMBINED POWER ${fmt(tr.power)}`; }
    } else if (!f) { a = `ACTIVE TURN: ${nm(tr.att)}`; b = 'SPINNING THE EVENT WHEEL...'; }
    else { a = `${tr.action === 'BLITZ' ? 'BLITZ' : 'WAR'}: ${nm(tr.att)}`; b = tr.action === 'BLITZ' && tr.fights.indexOf(f) === 1 ? 'SECOND STRIKE · SPINNING TARGET DIRECTION...' : 'SPINNING TARGET DIRECTION...'; }
  }
  return (
    <Panel style={{position: 'absolute', left: 420, top: 28, width: 1080, height: 92, padding: '14px 30px'}}>
      <div style={{...font, fontSize: 38, color: YELLOW, whiteSpace: 'nowrap', overflow: 'hidden'}}>{a}</div>
      <div style={{...font2, fontSize: 18, color: '#e8ecf2', marginTop: 2}}>{b}</div>
    </Panel>
  );
};

// selector tipo tragaperras
const aliveListAt = (t: number) => ALIVE0.filter((c) => isAlive(c, t)).sort((a, b) => nm(a).localeCompare(nm(b)));
const Slot: React.FC<{t: number; t0: number; t1: number; pick: string; x: number; y: number; w?: number; seed?: number; pool?: string[]}> = ({t, t0, t1, pick, x, y, w = 420, seed = 0, pool}) => {
  const list = pool || aliveListAt(t0);
  const N = list.length;
  const idx = Math.max(0, list.indexOf(pick));
  const u = Math.min(1, Math.max(0, (t - t0) / Math.max(0.3, t1 - t0)));
  const spins = Math.min(N - 1, 18 + (seed % 5) * 2);
  const pos = idx - (1 - Easing.out(Easing.cubic)(u)) * spins;
  const H = 60;
  const appear = lerp(t, t0 - 0.2, t0 + 0.15, 0, 1) * lerp(t, t1 + 0.55, t1 + 0.85, 1, 0);
  if (appear <= 0) return null;
  const rows: React.ReactNode[] = [];
  const base = Math.floor(pos);
  for (let j = -3; j <= 3; j++) {
    const i = ((base + j) % N + N) % N;
    const c = list[i];
    const off = (base + j - pos) * H;
    const sel = Math.abs(off) < H / 2 && u >= 1;
    rows.push(
      <div key={j} style={{position: 'absolute', left: 14, right: 14, top: 3 * H + off + 12, height: H - 10, display: 'flex', alignItems: 'center', gap: 14, padding: '0 14px', background: sel ? 'rgba(255,210,63,0.18)' : 'rgba(255,255,255,0.05)', borderRadius: 10, border: '2px solid rgba(255,255,255,0.08)'}}>
        <WFlag code={c} w={38} h={38} round />
        <div style={{...font, fontSize: 27, color: '#fff', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden'}}>{nm(c)}</div>
        <div style={{...font2, fontSize: 15, color: '#9fb0c6'}}>{fmtK(powerAt(c, t0))}</div>
      </div>,
    );
  }
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: 7 * H + 24, opacity: appear, transform: `scale(${0.9 + 0.1 * appear})`}}>
      <Panel border={YELLOW} style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
        {rows}
        <div style={{position: 'absolute', left: 8, right: 8, top: 3 * H + 6, height: H, border: `4px solid ${YELLOW}`, borderRadius: 12, boxShadow: '0 0 18px rgba(255,210,63,0.5)'}} />
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(rgba(16,24,38,0.95), rgba(16,24,38,0) 28%, rgba(16,24,38,0) 72%, rgba(16,24,38,0.95))'}} />
      </Panel>
      <div style={{position: 'absolute', left: '50%', top: -22, transform: 'translateX(-50%)', background: YELLOW, borderRadius: 12, padding: '6px 22px 2px', ...font, fontSize: 24, color: INK, border: `3px solid ${INK}`, whiteSpace: 'nowrap'}}>{N} COUNTRIES</div>
      {u >= 1 && <div style={{position: 'absolute', left: 0, right: 0, bottom: -44, textAlign: 'center', ...font, fontSize: 26, color: YELLOW, textShadow: '0 3px 0 #000'}}>{nm(pick)} SELECTED</div>}
    </div>
  );
};

// ruleta circular genérica
const Wheel: React.FC<{t: number; t0: number; t1: number; slices: {label: string; frac: number; color: string; sub?: string}[]; pick: number; x: number; y: number; r?: number; seed?: number}> = ({t, t0, t1, slices, pick, x, y, r = 210, seed = 0}) => {
  const appear = lerp(t, t0 - 0.25, t0 + 0.1, 0, 1, Easing.out(Easing.back(1.5))) * lerp(t, t1 + 0.7, t1 + 1.0, 1, 0);
  if (appear <= 0) return null;
  let acc = 0;
  const arcs = slices.map((s) => { const a0 = acc; acc += s.frac; return {...s, a0, a1: acc}; });
  const tgt = arcs[pick];
  const within = 0.25 + ((seed * 0.37) % 0.5);
  const tc = tgt.a0 + (tgt.a1 - tgt.a0) * within;
  const final = -tc * 360;
  const u = Math.min(1, Math.max(0, (t - t0) / Math.max(0.3, t1 - t0)));
  const rot = final - (1 - Easing.out(Easing.cubic)(u)) * 360 * 4;
  const pt = (a: number, rr: number): P => [Math.sin(a * Math.PI * 2) * rr, -Math.cos(a * Math.PI * 2) * rr];
  return (
    <svg width={r * 2 + 40} height={r * 2 + 60} style={{position: 'absolute', left: x - r - 20, top: y - r - 40, transform: `scale(${appear})`}}>
      <g transform={`translate(${r + 20},${r + 40})`}>
        <circle r={r + 10} fill={INK} />
        <circle r={r + 6} fill="none" stroke={YELLOW} strokeWidth={6} />
        <g transform={`rotate(${rot})`}>
          {arcs.map((s, i) => {
            const [x0, y0] = pt(s.a0, r), [x1, y1] = pt(s.a1, r);
            const large = s.a1 - s.a0 > 0.5 ? 1 : 0;
            const mid = (s.a0 + s.a1) / 2;
            const [tx, ty] = pt(mid, r * 0.62);
            const fs = s.sub ? (s.a1 - s.a0 < 0.12 ? 18 : 30) : Math.min(40, Math.max(15, (s.a1 - s.a0) * 140));
            return (
              <g key={i}>
                <path d={`M0,0 L${x0},${y0} A${r},${r} 0 ${large},1 ${x1},${y1} Z`} fill={s.color} stroke="rgba(0,0,0,0.25)" strokeWidth={2} />
                <text x={tx} y={ty} transform={`rotate(${mid * 360 - 90},${tx},${ty})`} textAnchor="middle" dominantBaseline="middle" fontSize={fs} fill="#fff" style={{...font}} stroke="rgba(0,0,0,0.35)" strokeWidth={1}>{s.label}</text>
                {s.sub && s.a1 - s.a0 >= 0.12 && <text x={tx} y={ty} transform={`rotate(${mid * 360 - 90},${tx},${ty}) translate(0,${fs * 0.95})`} textAnchor="middle" dominantBaseline="middle" fontSize={Math.min(20, 190 / Math.max(6, s.sub.length))} fill="#fff" style={{...font2}}>{s.sub.slice(0, 14)}</text>}
              </g>
            );
          })}
        </g>
        <circle r={30} fill={INK} stroke={YELLOW} strokeWidth={5} />
        <text y={9} textAnchor="middle" fontSize={24} fill={YELLOW} style={{...font}}>VS</text>
        <path d={`M-16,${-r - 34} L16,${-r - 34} L0,${-r - 6} Z`} fill="#ff4fa3" stroke={INK} strokeWidth={3} />
      </g>
    </svg>
  );
};
const ACTIONS = [{label: 'WAR', frac: 0.6, color: '#e8505b'}, {label: 'ALLIANCE', frac: 0.2, color: '#22a59a'}, {label: 'BLITZ', frac: 0.2, color: '#7b5cd6'}];
const actionIdx = (a: string) => (a === 'WAR' ? 0 : a === 'ALLIANCE' ? 1 : 2);

const WX = 1500, WY = 600;
const TurnHUD: React.FC<{t: number}> = ({t}) => {
  const tr = turnAt(t);
  if (!tr || tr.kind !== 'turn') return null;
  const out: React.ReactNode[] = [];
  out.push(<Slot key="sl" t={t} t0={tr.tSel} t1={tr.tZoom - 0.15} pick={tr.att} x={140} y={190} seed={tr.att.charCodeAt(0)} />);
  const firstDir = tr.fights[0]?.tDir ?? tr.tPick ?? tr.t1;
  out.push(<Wheel key="ew" t={t} t0={tr.tWheel} t1={firstDir - 0.75} slices={ACTIONS} pick={actionIdx(tr.action)} x={WX} y={WY} r={200} seed={tr.att.charCodeAt(1)} />);
  if (tr.action === 'ALLIANCE') {
    const pool = aliveListAt(tr.tPick).filter((c) => c !== tr.att);
    out.push(<Slot key="ps" t={t} t0={tr.tPick} t1={tr.tAlly - 0.4} pick={tr.partner} x={140} y={190} seed={3} pool={pool} />);
    if (t >= tr.tAlly) {
      const k = popT(t, tr.tAlly + 0.6);
      out.push(
        <div key="ab" style={{position: 'absolute', left: 0, right: 0, bottom: 70, display: 'flex', justifyContent: 'center', transform: `scale(${k})`}}>
          <Panel border="#4fc3ff" style={{padding: '14px 34px 8px', display: 'flex', alignItems: 'center', gap: 18}}>
            <WFlag code={tr.att} w={70} h={48} /><span style={{...font, fontSize: 44, color: '#fff'}}>+</span><WFlag code={tr.partner} w={70} h={48} />
            <div style={{...font, fontSize: 44, color: '#4fc3ff', marginLeft: 10}}>ALLIED!</div>
            <div style={{...font2, fontSize: 24, color: '#fff', marginLeft: 10}}>POWER <span style={{color: YELLOW, ...font, fontSize: 36}}>{fmt(tr.power)}</span></div>
          </Panel>
        </div>,
      );
    }
  }
  const f = fightAt(tr, t);
  if (f && t >= f.tVs - 0.15) out.push(<VSBar key="vs" t={t} f={f} tr={tr} />);
  if (f && t >= f.tVs - 0.3) {
    const pa = f.pa / (f.pa + f.pb);
    const attWins = f.win === tr.att || f.attM.includes(f.win);
    out.push(<Wheel key="vw" t={t} t0={f.tVs} t1={f.tRes - 0.15} slices={[{label: `${(pa * 100).toFixed(1)}%`, frac: pa, color: '#e23c3c', sub: nm(tr.att)}, {label: `${((1 - pa) * 100).toFixed(1)}%`, frac: 1 - pa, color: '#1f6fe0', sub: nm(f.def_)}]} pick={attWins ? 0 : 1} x={WX} y={WY} r={200} seed={f.def_.charCodeAt(0)} />);
  }
  return <>{out}</>;
};
const pct = (x: number) => (x * 100).toFixed(1) + '%';
const VSBar: React.FC<{t: number; f: any; tr: any}> = ({t, f, tr}) => {
  const k = lerp(t, f.tVs - 0.15, f.tVs + 0.2, 0, 1, Easing.out(Easing.cubic));
  const pa = f.pa / (f.pa + f.pb);
  const res = t >= f.tRes;
  const attWins = f.win === tr.att || f.attM.includes(f.win);
  const W = attWins ? tr.att : f.def_, L = attWins ? f.def_ : tr.att;
  const side = (code: string, power: number, right: boolean, team: string[]) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 14, flexDirection: right ? 'row-reverse' : 'row', width: 400}}>
      <div style={{display: 'flex', gap: 4}}>{team.slice(0, 3).map((c) => <WFlag key={c} code={c} w={54} h={36} />)}</div>
      <div style={{textAlign: right ? 'right' : 'left'}}>
        <div style={{...font, fontSize: 32, color: res && code === L ? '#8a93a3' : '#fff', whiteSpace: 'nowrap', textDecoration: res && code === L ? 'line-through' : 'none'}}>{team.length > 2 ? (right ? 'TEAM B' : 'TEAM A') : team.length > 1 ? team.map((c) => nm(c)).join(' + ') : nm(code)}</div>
        <div style={{...font2, fontSize: 17, color: '#cdd6e2'}}>{fmt(power)} TROOPS</div>
      </div>
    </div>
  );
  return (
    <div style={{position: 'absolute', left: 330, top: 22, width: 1260, transform: `translateY(${(k - 1) * 140}px)`}}>
      <Panel style={{padding: '12px 24px 14px'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          {side(tr.att, f.pa, false, f.attM)}
          {res ? (
            <div style={{transform: `scale(${popT(t, f.tRes)})`, background: '#3a2a08', border: `3px solid ${YELLOW}`, borderRadius: 12, padding: '6px 22px 2px', textAlign: 'center'}}>
              <div style={{...font, fontSize: 30, color: YELLOW, whiteSpace: 'nowrap'}}>{f.attM.length > 2 ? (attWins ? 'TEAM A' : 'TEAM B') : nm(W)} WINS!</div>
            </div>
          ) : (
            <div style={{width: 64, height: 64, borderRadius: 32, background: '#8a2be2', border: `4px solid ${YELLOW}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: 28, color: '#fff'}}>VS</div>
          )}
          {side(f.def_, f.pb, true, f.defM)}
        </div>
        <div style={{display: 'flex', height: 22, borderRadius: 11, overflow: 'hidden', marginTop: 10, border: '2px solid rgba(255,255,255,0.3)'}}>
          <div style={{width: `${pa * 100}%`, background: 'linear-gradient(#ff5a54,#c8262b)', ...font2, fontSize: 15, color: '#fff', paddingLeft: 10, lineHeight: '20px'}}>{pct(pa)} WIN</div>
          <div style={{flex: 1, background: 'linear-gradient(#4a90ff,#1d4fbf)', ...font2, fontSize: 15, color: '#fff', textAlign: 'right', paddingRight: 10, lineHeight: '20px'}}>{pct(1 - pa)} WIN</div>
        </div>
        {res && <div style={{textAlign: 'center', ...font2, fontSize: 18, color: YELLOW, marginTop: 6}}>{f.attM.length > 2 ? `${attWins ? 'TEAM A' : 'TEAM B'} TAKES 3 COUNTRIES` : `${nm(W)} CONQUERED ${nm(L)}`} · +{fmt(f.gain)} POWER</div>}
      </Panel>
    </div>
  );
};
// +N POWER flotante
const GainPop: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const g = PW.filter(([tp]) => t >= tp && t < tp + 2.2);
  return (
    <>
      {g.map(([tp, c, , gain]) => {
        const [x, y] = toS(HOME(c), cam);
        const k = popT(t, tp);
        const up = lerp(t, tp, tp + 2.2, 0, -60);
        const a = lerp(t, tp + 1.7, tp + 2.2, 1, 0);
        return (
          <div key={`${tp}${c}`} style={{position: 'absolute', left: Math.max(120, Math.min(1800, x)), top: Math.max(160, Math.min(1000, y - 70 + up)), transform: `translate(-50%,-50%) scale(${k})`, opacity: a, background: 'rgba(16,24,38,0.92)', border: `3px solid ${GREEN}`, borderRadius: 14, padding: '8px 18px 4px', ...font, fontSize: 34, color: '#62f08f', whiteSpace: 'nowrap'}}>+{fmt(gain)} <span style={{...font2, fontSize: 18, color: '#fff'}}>POWER</span></div>
        );
      })}
    </>
  );
};

// evento especial 3v3
const Ev3HUD: React.FC<{t: number}> = ({t}) => {
  const tr = turnAt(t);
  if (!tr || tr.kind !== 'ev3') return null;
  const out: React.ReactNode[] = [];
  if (t < tr.tSel + 0.3) {
    const k = popT(t, tr.tBan, 10);
    out.push(
      <AbsoluteFill key="ban" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: `rgba(10,10,30,${0.45 * lerp(t, tr.tSel - 0.3, tr.tSel + 0.3, 1, 0)})`}}>
        <div style={{transform: `scale(${k}) rotate(-3deg)`, opacity: lerp(t, tr.tSel - 0.2, tr.tSel + 0.3, 1, 0), textAlign: 'center'}}>
          <div style={{...font, fontSize: 130, color: YELLOW, WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill', textShadow: '0 10px 0 rgba(0,0,0,0.5)'}}>⚡ SPECIAL EVENT ⚡</div>
          <div style={{...font, fontSize: 52, color: '#fff', WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill'}}>3 VS 3 · ANYWHERE ON THE MAP</div>
        </div>
      </AbsoluteFill>,
    );
  }
  const pool = aliveListAt(tr.tSel);
  tr.A.forEach((c: string, i: number) => out.push(<Slot key={`s${i}`} t={t} t0={tr.tSel} t1={tr.tSel + 1.6 + i * 0.6} pick={c} x={120 + i * 580} y={260} w={500} seed={i + 2} pool={pool} />));
  if (t >= tr.tVs - 0.15) {
    const f = {tVs: tr.tVs, tRes: tr.tRes, pa: tr.pa, pb: tr.pb, win: tr.win === 'A' ? tr.A[0] : tr.D[0], attM: tr.A, defM: tr.D, def_: tr.D[0], gain: tr.gains.reduce((s: number, x: number) => s + x, 0)};
    out.push(<VSBar key="vs" t={t} f={f} tr={{att: tr.A[0]}} />);
    const pa = tr.pa / (tr.pa + tr.pb);
    out.push(<Wheel key="vw" t={t} t0={tr.tVs} t1={tr.tRes - 0.15} slices={[{label: `${(pa * 100).toFixed(1)}%`, frac: pa, color: '#e23c3c', sub: 'TEAM A'}, {label: `${((1 - pa) * 100).toFixed(1)}%`, frac: 1 - pa, color: '#1f6fe0', sub: 'TEAM B'}]} pick={tr.win === 'A' ? 0 : 1} x={WX} y={WY} r={200} seed={5} />);
  }
  return <>{out}</>;
};

// capítulos y banners
const BigCard: React.FC<{t: number}> = ({t}) => {
  const ch = CHAP.find(([t0]) => t >= t0 && t < t0 + 3);
  const bn = BAN.find(([t0]) => t >= t0 && t < t0 + 3);
  const it = ch || bn;
  if (!it) return null;
  const [t0, a, b] = it;
  const k = popT(t, t0, 11);
  const o = lerp(t, t0 + 2.5, t0 + 3, 1, 0);
  return (
    <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: `rgba(8,14,28,${0.55 * o})`}}>
      <div style={{transform: `scale(${k})`, opacity: o, textAlign: 'center'}}>
        <div style={{...font, fontSize: 120, color: ch ? '#fff' : YELLOW, WebkitTextStroke: `9px ${INK}`, paintOrder: 'stroke fill', textShadow: '0 10px 0 rgba(0,0,0,0.5)', whiteSpace: 'nowrap'}}>{a}</div>
        <div style={{display: 'inline-block', marginTop: 10, background: YELLOW, border: `5px solid ${INK}`, borderRadius: 16, padding: '8px 30px 2px', ...font, fontSize: 44, color: INK}}>{b}</div>
      </div>
    </AbsoluteFill>
  );
};

// ================= intro (estilo McDonald's) =================
const OUT_TXT: React.CSSProperties = {WebkitTextStroke: `7px ${INK}`, paintOrder: 'stroke fill', textShadow: '0 6px 0 rgba(0,0,0,0.4)'};
const IntroHUD: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const it = INTRO.find((x) => t >= x.t && t < x.t + x.dur);
  const out: React.ReactNode[] = [];
  if (it) {
    const k = popT(t, it.t, 13);
    out.push(
      <div key="tt" style={{position: 'absolute', top: 40, left: 0, right: 0, textAlign: 'center', transform: `scale(${k})`, ...font, fontSize: 78, color: '#fff', ...OUT_TXT}}>
        {it.title[0]}<span style={{color: it.kind === 'giant' ? YELLOW : it.kind === 'gone' ? '#ff5a54' : '#6fc3ff'}}>{it.title[1]}</span>
      </div>,
    );
    // etiqueta, número y sello junto al país
    const c = it.code;
    const b = (() => { let bb: number[] | null = null; for (const p of MP) if (it.codes.includes(p.code)) { const sb = sbox(p.bbox, HOME(p.code), Math.max(0.3, sAt(p.code, t))); bb = bb ? union(bb, sb) : sb; } return bb!; })();
    const top = toS([(b[0] + b[2]) / 2, b[1]], cam), bot = toS([(b[0] + b[2]) / 2, b[3]], cam);
    const u = lerp(t, it.t + 0.55, it.t + 1.75, 0, 1, Easing.out(Easing.cubic));
    const f = it.factor;
    let big = '', tag = '', col = YELLOW, tcol = GREEN;
    if (it.kind === 'giant') { big = '×' + (f >= 10 ? Math.round(1 + (f - 1) * u).toString() : (1 + (f - 1) * u).toFixed(1)); tag = '★ BIGGER'; }
    else if (it.kind === 'small') { const d = 1 / f; big = '÷' + (d >= 10 ? Math.round(1 + (d - 1) * u).toString() : (1 + (d - 1) * u).toFixed(1)); tag = '▼ SMALLER'; col = '#8fd3ff'; tcol = BLUE; }
    else { big = 'GONE!'; tag = '✖ NO ARMY'; col = '#ff5a54'; tcol = RED; }
    const ks = popT(t, it.t + 0.5, 10);
    const labelY = Math.max(150, top[1] - 50);
    out.push(
      <div key="nm" style={{position: 'absolute', left: top[0], top: labelY, transform: `translate(-50%,-50%) scale(${popT(t, it.t + 0.1)})`, background: INK, border: `3px solid ${YELLOW}`, borderRadius: 14, padding: '6px 18px 2px', ...font, fontSize: 30, color: '#fff', whiteSpace: 'nowrap'}}>{it.codes.map((x) => nm(x)).join(' & ')}</div>,
    );
    const by = Math.min(920, Math.max(labelY + 110, bot[1] + 20));
    out.push(
      <div key="bg" style={{position: 'absolute', left: bot[0], top: by, transform: `translate(-50%,-50%) scale(${ks})`, textAlign: 'center'}}>
        <div style={{...font, fontSize: 120, color: col, ...OUT_TXT, WebkitTextStroke: `9px ${INK}`, lineHeight: 1}}>{big}</div>
        <div style={{display: 'inline-block', marginTop: 4, background: tcol, border: `3px solid ${INK}`, borderRadius: 10, padding: '4px 16px 0', ...font, fontSize: 28, color: '#fff'}}>{tag}</div>
        <div style={{...font2, fontSize: 22, color: '#fff', marginTop: 6, textShadow: '0 2px 4px #000'}}>{it.kind === 'gone' ? '0 active troops' : `${fmt(TROOPS[c])} active troops`}</div>
      </div>,
    );
  }
  // tarjeta de título (3 s)
  if (t >= TT0 - 0.1 && t < TT1 + 0.3) {
    const k = popT(t, TT0, 12), o = lerp(t, TT1 - 0.2, TT1 + 0.3, 1, 0);
    out.push(
      <AbsoluteFill key="title" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: `rgba(10,30,60,${0.35 * o})`}}>
        <div style={{transform: `scale(${k})`, opacity: o, textAlign: 'center'}}>
          <div style={{...font, fontSize: 96, color: '#fff', ...OUT_TXT, lineHeight: 1.05}}>THE WORLD IF COUNTRIES</div>
          <div style={{...font, fontSize: 112, color: YELLOW, ...OUT_TXT, WebkitTextStroke: `9px ${INK}`, lineHeight: 1.05}}>WERE SIZED BY THEIR ARMY</div>
          <div style={{...font, fontSize: 40, color: '#fff', ...OUT_TXT, marginTop: 14}}>REAL DATA · ACTIVE TROOPS · THEN THEY GO TO WAR</div>
          <div style={{display: 'flex', gap: 18, justifyContent: 'center', marginTop: 18}}>
            {[['★ BIGGER', GREEN], ['▼ SMALLER', BLUE], ['✖ GONE', RED]].map(([l, c]) => <div key={l} style={{background: c, border: `3px solid ${INK}`, borderRadius: 14, padding: '6px 20px 0', ...font, fontSize: 32, color: '#fff'}}>{l}</div>)}
          </div>
        </div>
      </AbsoluteFill>,
    );
  }
  if (t >= M0 && t < M1) {
    const k = popT(t, M0, 12), o = lerp(t, M1 - 0.6, M1, 1, 0);
    out.push(<div key="m" style={{position: 'absolute', top: 40, left: 0, right: 0, textAlign: 'center', transform: `scale(${k})`, opacity: o, ...font, fontSize: 80, color: '#fff', ...OUT_TXT}}>NOW... <span style={{color: YELLOW}}>EVERY COUNTRY</span> AT ONCE</div>);
  }
  return <>{out}</>;
};

// victoria + pregunta corta
const Victory: React.FC<{t: number}> = ({t}) => {
  if (t < WIN_T + 0.6) return null;
  const k = popT(t, WIN_T + 0.6, 10);
  const q = t > DUR - 3.2;
  return (
    <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(8,14,28,0.45)'}}>
      {!q ? (
        <div style={{transform: `scale(${k})`, textAlign: 'center'}}>
          <div style={{fontSize: 150}}>🏆</div>
          <div style={{display: 'inline-flex', alignItems: 'center', gap: 22, background: YELLOW, border: `7px solid ${INK}`, borderRadius: 22, padding: '12px 40px 4px'}}>
            <WFlag code={WINNER} w={110} h={74} />
            <span style={{...font, fontSize: 96, color: INK}}>{nm(WINNER)} WINS!</span>
          </div>
          <div style={{...font, fontSize: 40, color: '#fff', ...OUT_TXT, marginTop: 16}}>{fmt(powerAt(WINNER, t))} TROOPS · {ALIVE0.length - 1} ARMIES DEFEATED</div>
        </div>
      ) : (
        <div style={{transform: `scale(${popT(t, DUR - 3.2, 10)})`, textAlign: 'center'}}>
          <div style={{...font, fontSize: 104, color: '#fff', ...OUT_TXT, WebkitTextStroke: `9px ${INK}`}}>WHICH COUNTRY</div>
          <div style={{...font, fontSize: 104, color: YELLOW, ...OUT_TXT, WebkitTextStroke: `9px ${INK}`}}>SHOULD HAVE WON?</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
const Credit = () => <div style={{position: 'absolute', right: 16, bottom: 10, background: 'rgba(15,25,40,0.6)', color: '#fff', borderRadius: 10, padding: '4px 12px', ...font2, fontWeight: 600, fontSize: 15}}>Hypothetical simulation · Sizes = share of active troops (Wikipedia, IISS) vs land area · very small/large values capped</div>;

const Sea: React.FC<{t: number}> = ({t}) => (
  <svg width={1920} height={1080} style={{position: 'absolute'}}>
    <defs>
      <radialGradient id="armysea" cx="50%" cy="45%" r="75%"><stop offset="0%" stopColor="#3a8fd3" /><stop offset="100%" stopColor="#1b5796" /></radialGradient>
      <pattern id="armywav" width={140} height={46} patternUnits="userSpaceOnUse" patternTransform={`translate(${(t * 10.5) % 140},0)`}><path d="M0,23 C17,13 35,13 52,23 S87,33 105,23 S122,13 140,23" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={3} /></pattern>
    </defs>
    <rect width={1920} height={1080} fill="url(#armysea)" /><rect width={1920} height={1080} fill="url(#armywav)" />
  </svg>
);

export const WarArmy: React.FC = () => {
  usePreload();
  const t = useCurrentFrame() / FPS;
  const cam = camera(t);
  return (
    <AbsoluteFill style={{background: SEA0, overflow: 'hidden'}}>
      <Sea t={t} />
      <WorldMap t={t} cam={cam} />
      <GainPop t={t} cam={cam} />
      {t < M1 + 0.5 && <IntroHUD t={t} cam={cam} />}
      <AliveBox t={t} />
      <StatusBar t={t} />
      <TurnHUD t={t} />
      <Ev3HUD t={t} />
      <BigCard t={t} />
      <Victory t={t} />
      <Credit />
    </AbsoluteFill>
  );
};
