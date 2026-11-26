import React from 'react';
import {AbsoluteFill, Easing, useCurrentFrame} from 'remotion';
import TLJ from './army-tl.json';
import {P, Cam, INK, RED, BLUE, GREEN, YELLOW, clamp, lerp, font, font2, popT, arcPath, PathArrow, Boom} from './lib3';
import GEOJ from './army-geo.json';
// @ts-ignore
import {PIECES, PL, FlagSvg, fitFlagBox, WFlag, usePreload} from './War6';

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
const GEO = GEOJ as any;
type Piece = {i: number; code: string; cont: string; bbox: number[]; b0: number[]; c: P; area: number; a0: number; d: string; d0: string; main0: string; main1: string; rest0: string; rest1: string; mb: number[]};
const GC = GEO.countries as Record<string, any>;
const MP: Piece[] = Object.keys(GC).filter((c) => PL[c]).map((c, i) => ({i, code: c, cont: (PL[c] as any).cont, bbox: GC[c].b1, b0: GC[c].b0, c: GC[c].c1, area: GC[c].a1, a0: GC[c].a0, d: GC[c].d1, d0: GC[c].d0, main0: GC[c].main0, main1: GC[c].main1, rest0: GC[c].rest0, rest1: GC[c].rest1, mb: GC[c].mb1 || GC[c].b1}));
const H1: Record<string, P> = Object.fromEntries(MP.map((p) => [p.code, GC[p.code].home1 as P]));
const HOME = (c: string): P => H1[c] || PL[c].home;
const HOME0 = (c: string): P => PL[c].home;
// tierra fija (la silueta del mundo no cambia): el mapa real en gris debajo
const LAND0 = MP.map((p) => p.d0).join('');
const D = 1.15; // duración de la conquista
const ui = (x: number) => x;
const SEA0 = '#2f7fc4';
const LAND_G = '#d6dbe1';

// ================= ola de transformación (por vértice) =================
const introOf: Record<string, (typeof INTRO)[number]> = {};
INTRO.forEach((it) => it.codes.forEach((c) => (introOf[c] = it)));
const DV = 1.3, SPD = 42;
const TEND = M0;
const CT: Record<string, number> = {};
MP.forEach((p) => {
  const h = HOME0(p.code);
  let best = TEND - DV;
  for (const it of INTRO) { const hh = HOME0(it.code); const tt = it.codes.includes(p.code) ? it.t + 0.45 : it.t + 0.45 + Math.hypot(h[0] - hh[0], h[1] - hh[1]) / SPD; if (tt < best) best = tt; }
  CT[p.code] = best;
});
const easeQ = Easing.inOut(Easing.cubic);
const qC = (c: string, t: number) => (CT[c] === undefined ? 1 : easeQ(Math.max(0, Math.min(1, (t - CT[c]) / DV))));
const homeAt = (c: string, t: number): P => (introOf[c]?.kind === 'gone' ? HOME0(c) : HOME(c));
const target = (c: string) => ((TROOPS[c] || 0) > 0 ? 1 : 0);
export const sAt = (c: string, t: number) => 1;
const revealT = (c: string) => (CT[c] ?? 0) - 0.05;
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

const contP = (p: Piece) => (p.cont === 'XX' ? 'XX' : ((PL[p.code] as any)?.cont as string) || p.cont);
const bbC = new Map<string, number[] | null>();
const ownBoxC = (owners: string[], k: number, cont: string) => {
  const key = owners.join(',') + '|' + k + '|' + cont;
  if (bbC.has(key)) return bbC.get(key)!;
  let b: number[] | null = null;
  const own = OWN[k];
  for (const p of MP) if (contP(p) === cont && owners.includes(own[p.code]) && target(p.code) > 0) { const sb = sbox(p.bbox, HOME(p.code), target(p.code)); b = b ? union(b, sb) : sb; }
  bbC.set(key, b);
  return b;
};
// caja solo con las piezas cercanas a un punto (para que islas lejanas no abran el plano)
const ownBoxNear = (owners: string[], k: number, c: P, R: number) => {
  let b: number[] | null = null;
  const own = OWN[k];
  for (const p of MP) {
    if (!owners.includes(own[p.code]) || target(p.code) <= 0) continue;
    const h = HOME(p.code), sc = target(p.code);
    const pc: P = [h[0] + (p.c[0] - h[0]) * sc, h[1] + (p.c[1] - h[1]) * sc];
    if (Math.hypot(pc[0] - c[0], pc[1] - c[1]) > R) continue;
    const sb = sbox(p.bbox, h, sc); b = b ? union(b, sb) : sb;
  }
  return b;
};
const tiny = (c: P): number[] => [c[0] - 12, c[1] - 8, c[0] + 12, c[1] + 8];
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
const introBox = (codes: string[]) => { let b: number[] | null = null; for (const p of MP) if (codes.includes(p.code)) { const u = union(p.b0, p.bbox); b = b ? union(b, u) : u; } return b || tiny(HOME0(codes[0])); };
KEYS.push([0, ...boxCam(introBox(['KP']), 4, 5)]);
INTRO.forEach((it) => {
  let b: number[] | null = null;
  b = introBox(it.codes);
  const pad = it.code === 'SG' ? 6 : it.code === 'IL' ? 3 : it.code === 'CR' ? 4 : it.code === 'KP' ? 2.4 : 1.8;
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
  if (tr.kind === 'purge') { KEYS.push([tr.t0, ...WORLD]); return; }
  if (tr.kind === 'ev3') {
    KEYS.push([tr.t0, ...WORLD]);
    const all = [...tr.A, ...tr.D];
    const kk = doneK(tr.t0);
    let b: number[] | null = null;
    all.forEach((c: string) => { const x = ownBoxNear([c], kk, HOME(c), 200) || tiny(HOME(c)); b = b ? union(b, x) : x; });
    if (b) KEYS.push([tr.tArrows[0], ...boxCam(b, 1.25, 3)]);
    KEYS.push([tr.t1 - 0.3, ...WORLD]);
    return;
  }
  const {k, mem} = viewOfTurn(tr);
  const ab = ownBoxNear(mem(tr.att), k, HOME(tr.att), 230) || ownBox(mem(tr.att), k);
  if (!ab) return;
  const cb = CONTBOX[contOf(tr.att)] || ab;
  KEYS.push([tr.tSel, ...(tr.mode === 'quick' ? boxCam(union(ab, ab), 4.5, 3.4) : boxCam(union(cb, ab), 1.1, 2.6))]);
  KEYS.push([tr.tZoom, ...leftOf(boxCam(ab, 1.45, 6.5, 1.7))]);
  if (tr.action === 'ALLIANCE') {
    const pb = ownBoxNear(mem(tr.partner), k, HOME(tr.partner), 230);
    if (pb) KEYS.push([tr.tPick + 1.6, ...boxCam(union(ab, pb), 1.35, 5.5, 1.3)]);
    return;
  }
  (tr.fights as any[]).forEach((f: any) => {
    const kk = doneK(f.tDir);
    const db = ownBoxNear(f.defM, kk, HOME(f.def_), 230) || tiny(HOME(f.def_));
    const ab2 = ownBoxNear(f.attM, kk, HOME(f.def_), 320) || tiny(HOME(tr.att));
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
export type EyeMood = 'calm' | 'fire' | 'scared' | 'cool' | 'happy' | 'dead';
export const Eyes: React.FC<{x: number; y: number; r: number; mood: EyeMood; look: P; t: number; seed: number; power?: string; alpha?: number; pump?: number}> = ({x, y, r, mood, look, t, seed, power, alpha = 1, pump = 1}) => {
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

// ================= fronteras por pareja y costa =================
const numsBox = (d: string) => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; const re = /(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g; let m; while ((m = re.exec(d))) { const x = +m[1], y = +m[2]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return [x0, y0, x1, y1]; };
const BPAIRS = Object.entries((GEO.borders || {}) as Record<string, string>).map(([k, d]) => { const [a, b] = k.split('|'); return {a, b, d, bb: numsBox(d)}; });
const COAST = (GEO.coast || '') as string;
// caja de la bandera: sin deformarla demasiado (proporción entre 1.25 y 1.75) y centrada
const coverBox = (b: number[]) => {
  const w = Math.max(1, b[2] - b[0]), h = Math.max(1, b[3] - b[1]), cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2;
  const r = Math.min(1.75, Math.max(1.25, w / h));
  let W2 = w, H2 = h;
  if (w / h > r) H2 = w / r; else W2 = h * r;
  return [cx - W2 / 2, cy - H2 / 2, cx + W2 / 2, cy + H2 / 2];
};
// ================= bloques de tierra contigua por dueño (cada bloque lleva su propia bandera) =================
const ADJ: Record<string, Set<string>> = {};
for (const bp of BPAIRS) { (ADJ[bp.a] ||= new Set()).add(bp.b); (ADJ[bp.b] ||= new Set()).add(bp.a); }
{
  const L = MP.filter((p) => p.d);
  const gap = (a: number[], b: number[]) => Math.max(0, a[0] - b[2], b[0] - a[2], a[1] - b[3], b[1] - a[3]);
  for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) if (gap(L[i].bbox, L[j].bbox) < 5) { const a = L[i].code, b = L[j].code; if (!ADJ[a]?.has(b)) { /* islas cercanas: solo si están muy cerca */ if (gap(L[i].bbox, L[j].bbox) < 2.5) { (ADJ[a] ||= new Set()).add(b); (ADJ[b] ||= new Set()).add(a); } } }
}
const PBY: Record<string, Piece> = Object.fromEntries(MP.map((p) => [p.code, p]));
const cluCache = new Map<string, {codes: string[]; box: number[]}[]>();
const clustersOf = (o: string, k: number) => {
  const key = o + '|' + k;
  if (cluCache.has(key)) return cluCache.get(key)!;
  const own = OWN[k];
  const mine = MP.filter((p) => p.d && own[p.code] === o).map((p) => p.code);
  const seen = new Set<string>(); const out: {codes: string[]; box: number[]}[] = [];
  for (const c0 of mine) {
    if (seen.has(c0)) continue;
    const q = [c0]; seen.add(c0); const codes: string[] = [];
    while (q.length) { const c = q.pop()!; codes.push(c); for (const n of ADJ[c] || []) if (!seen.has(n) && own[n] === o && PBY[n]?.d) { seen.add(n); q.push(n); } }
    const box = codes.reduce((b, c) => union(b, PBY[c].mb), [...PBY[codes[0]].mb]);
    out.push({codes, box});
  }
  cluCache.set(key, out);
  return out;
};
const cluOf = (o: string, k: number, c: string) => clustersOf(o, k).findIndex((x) => x.codes.includes(c));
const PURGE_T = (TL.turns as any[]).find((x) => x.kind === 'purge');
const isPurgeEvt = (te: number) => !!PURGE_T && te >= PURGE_T.t0 && te <= PURGE_T.t1;
// ================= mapa =================
const tf = (c: string, s: number) => { const h = HOME(c); return `translate(${h[0]},${h[1]}) scale(${s}) translate(${-h[0]},${-h[1]})`; };
const pieceArea = (p: Piece) => p.area;
const radOf = (p: Piece) => { const h = HOME(p.code); const b = p.bbox; return Math.max(...[[b[0], b[1]], [b[2], b[1]], [b[0], b[3]], [b[2], b[3]]].map(([x, y]) => Math.hypot(x - h[0], y - h[1]))) * 1.03; };
const RAD: Record<string, number> = Object.fromEntries(MP.map((p) => [p.code, radOf(p)]));
const easeGrow = Easing.out(Easing.cubic);
const growQ = (c: string, t: number) => (CT[c] === undefined ? 1 : easeGrow(Math.max(0, Math.min(1, (t - CT[c]) / (introOf[c] ? 1.9 : DV)))));
const WorldMap: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const {cx, cy, s} = cam;
  const inv = 1 / s;
  const vx0 = cx - 960 / s - 40, vx1 = cx + 960 / s + 40, vy0 = cy - 540 / s - 40, vy1 = cy + 540 / s + 40;
  const vis = (b: number[]) => b[2] > vx0 && b[0] < vx1 && b[3] > vy0 && b[1] < vy1;
  const k = doneK(t);
  const fk = firedK(t);
  const own = OWN[k];
  const tm = teamAt(t);
  const intro = t < M1 + 0.05;
  type PV = {p: Piece; sc: number; sb: number[]; d: string};
  const pv: PV[] = [];
  const sw = 2.2 * inv;
  const grow = 2.6 * inv;
  // ---------- INTRO: cada país nace como un punto en su sitio nuevo y se expande (como una invasión) ----------
  if (intro) {
    const grey = MP.filter((p) => vis(p.b0));
    const born = MP.filter((p) => p.d && target(p.code) > 0 && t >= CT[p.code] && vis(p.bbox));
    for (const p of born) pv.push({p, sc: 1, sb: p.bbox, d: p.d});
    return (
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          {born.map((p) => {
            const q = growQ(p.code, t), h = HOME(p.code);
            return (
              <React.Fragment key={p.code}>
                <mask id={`im-${p.code}`} maskUnits="userSpaceOnUse" x={-200} y={-200} width={2400} height={1600}>
                  <path d={p.d} fillRule="evenodd" fill="#fff" stroke="#fff" strokeWidth={grow} strokeLinejoin="round" />
                </mask>
                {q < 1 && <clipPath id={`ic-${p.code}`}><circle cx={h[0]} cy={h[1]} r={Math.max(0.01, RAD[p.code] * q)} /></clipPath>}
              </React.Fragment>
            );
          })}
        </defs>
        <g transform={`translate(960,540) scale(${s}) translate(${-cx},${-cy})`}>
          <path d={LAND0} fill={LAND_G} />
          <g>{grey.map((p, i) => <path key={i} d={p.d0} fill="none" stroke="#aab3bf" strokeWidth={0.9 * inv} strokeLinejoin="round" />)}</g>
          {born.map((p) => {
            const q = growQ(p.code, t), h = HOME(p.code);
            return (
              <g key={p.code} clipPath={q < 1 ? `url(#ic-${p.code})` : undefined}>
                <g mask={`url(#im-${p.code})`}>
                  <FlagSvg code={p.code} b={coverBox(p.mb)} />
                  {q < 1 && <circle cx={h[0]} cy={h[1]} r={RAD[p.code] * q} fill="none" stroke="#fff" strokeWidth={4 * inv} opacity={0.75 * (1 - q)} />}
                </g>
                <path d={p.d} fillRule="evenodd" fill="none" stroke={INK} strokeWidth={sw * 1.1} strokeLinejoin="round" />
              </g>
            );
          })}
          <MapFX t={t} cam={cam} own={own} tm={tm} pv={pv} />
          <AllEyes t={t} cam={cam} own={own} tm={tm} pv={pv} />
        </g>
      </svg>
    );
  }
  for (const p of MP) {
    if (!p.d || target(p.code) === 0) continue;
    if (!vis(p.bbox)) continue;
    pv.push({p, sc: 1, sb: p.bbox, d: p.d});
  }
  // conquistas en curso: las piezas de los perdedores se rellenan con la bandera del ganador
  const overlays: {w: string; ls: string[]; q: number; A: P; R: number; fade: boolean; ei: number}[] = [];
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
    overlays.push({w, ls, q, A, R, fade: isPurgeEvt(te), ei: i});
  }
  const ovQ: Record<string, number> = {};
  for (const ov of overlays) ovQ[ov.w] = Math.max(ovQ[ov.w] || 0, ov.q);
  // grupos por equipo (sombra) y por dueño + bloque contiguo (bandera)
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
  const byClu = (o: string, list: PV[]) => {
    const g = new Map<number, PV[]>();
    for (const x of list) { const ci = cluOf(o, k, x.p.code); if (!g.has(ci)) g.set(ci, []); g.get(ci)!.push(x); }
    return [...g.entries()].map(([ci, l2]) => {
      const C = clustersOf(o, k)[ci];
      let b = C ? C.box : l2.reduce((bb, x) => union(bb, x.sb), [...l2[0].sb]);
      const q = ovQ[o] || 0;
      if (C && q > 0 && fk > k) { const j = cluOf(o, fk, C.codes[0]); const B = j >= 0 ? clustersOf(o, fk)[j].box : b; b = b.map((v, n) => v + (B[n] - v) * q); }
      return {ci, l2, box: coverBox(b)};
    });
  };
  const sameSide = (x: string, y: string) => x === y || (tm[x] !== undefined && tm[x] === tm[y]);
  // capas de conquista: una por bloque final del ganador
  const ovl = overlays.map((ov) => {
    const lp = pv.filter((x) => ov.ls.includes(own[x.p.code]));
    const g = new Map<number, PV[]>();
    for (const x of lp) { const j = cluOf(ov.w, fk, x.p.code); if (!g.has(j)) g.set(j, []); g.get(j)!.push(x); }
    return {ov, parts: [...g.entries()].map(([j, l2]) => ({j, l2, box: coverBox(j >= 0 ? clustersOf(ov.w, fk)[j].box : l2.reduce((bb, x) => union(bb, x.sb), [...l2[0].sb]))}))};
  });
  const groups = order.map(([L, m]) => ({L, m, own: [...m.entries()].map(([o, list]) => ({o, cl: byClu(o, list)}))}));
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        {groups.map((G) => G.own.map(({o, cl}) => cl.map(({ci, l2}) => (
          <mask key={`${o}-${ci}`} id={`ac-${o}-${ci}`} maskUnits="userSpaceOnUse" x={-200} y={-200} width={2400} height={1600}>
            {l2.map((x, i) => <path key={i} d={x.d} fillRule="evenodd" fill="#fff" stroke="#fff" strokeWidth={grow} strokeLinejoin="round" />)}
          </mask>
        ))))}
        {ovl.map(({ov, parts}, i) => (
          <React.Fragment key={i}>
            {parts.map(({j, l2}) => (
              <mask key={j} id={`ao-${i}-${j}`} maskUnits="userSpaceOnUse" x={-200} y={-200} width={2400} height={1600}>
                {l2.map((x, n) => <path key={n} d={x.d} fillRule="evenodd" fill="#fff" stroke="#fff" strokeWidth={grow} strokeLinejoin="round" />)}
              </mask>
            ))}
            {!ov.fade && <clipPath id={`aoc-${i}`}><circle cx={ov.A[0]} cy={ov.A[1]} r={Math.max(0.01, ov.R * ov.q)} /></clipPath>}
          </React.Fragment>
        ))}
      </defs>
      <g transform={`translate(960,540) scale(${s}) translate(${-cx},${-cy})`}>
        <path d={LAND0} fill="#c9ced6" />
        {groups.map((G) => (
          <g key={G.L}>
            <g transform={`translate(${1.6 * inv},${2.4 * inv})`} opacity={0.3}>{[...G.m.values()].flat().map((x, i) => <path key={i} d={x.d} fillRule="evenodd" fill="#06213f" />)}</g>
            {G.own.map(({o, cl}) => cl.map(({ci, box}) => <g key={`${o}-${ci}`} mask={`url(#ac-${o}-${ci})`}><FlagSvg code={o} b={box} /></g>))}
          </g>
        ))}
        {ovl.map(({ov, parts}, i) => (
          <g key={`ov${i}`} opacity={ov.fade ? ov.q : 1} clipPath={ov.fade ? undefined : `url(#aoc-${i})`}>
            {parts.map(({j, box}) => <g key={j} mask={`url(#ao-${i}-${j})`}><FlagSvg code={ov.w} b={box} /></g>)}
          </g>
        ))}
        {overlays.filter((ov) => !ov.fade).map((ov, i) => <circle key={`r${i}`} cx={ov.A[0]} cy={ov.A[1]} r={ov.R * ov.q} fill="none" stroke="#fff" strokeWidth={3 * inv} opacity={0.85 * (1 - ov.q) * Math.min(1, ov.q * 8)} />)}
        <g>
          {BPAIRS.filter((bp) => vis(bp.bb)).map((bp, i) => {
            const oa = own[bp.a], ob = own[bp.b];
            if (oa === undefined || ob === undefined) return null;
            let op = sameSide(oa, ob) ? 0 : 1;
            for (const ov of overlays) { if ((ov.ls.includes(oa) && ob === ov.w) || (ov.ls.includes(ob) && oa === ov.w) || (ov.ls.includes(oa) && ov.ls.includes(ob))) op = Math.min(op, 1 - ov.q); }
            if (op <= 0.01) return null;
            return <path key={i} d={bp.d} fill="none" stroke={INK} strokeWidth={sw * 1.05} strokeLinecap="round" strokeLinejoin="round" opacity={op} />;
          })}
          <path d={COAST} fill="none" stroke={INK} strokeWidth={sw * 1.25} strokeLinejoin="round" />
        </g>
        <MapFX t={t} cam={cam} own={own} tm={tm} pv={pv} />
        <AllEyes t={t} cam={cam} own={own} tm={tm} pv={pv} />
      </g>
    </svg>
  );
};

// contornos de selección, siluetas de alianza, flechas de ataque
// punto del territorio de unos dueños más cercano a un objetivo (para flechas)
const nearPt = (own: Record<string, string>, owners: string[], to: P): P => { let best: P | null = null, bd = Infinity; const mine = MP.filter((p) => p.d && owners.includes(own[p.code])); const amax = Math.max(1, ...mine.map((p) => p.area)); for (const p of mine) { if (p.area < amax * 0.04) continue; const h = HOME(p.code); const d = Math.hypot(h[0] - to[0], h[1] - to[1]); if (d < bd) { bd = d; best = h; } } return best || to; };
const MapFX: React.FC<{t: number; cam: Cam; own: Record<string, string>; tm: Record<string, string>; pv: {p: Piece; sc: number; sb: number[]}[]}> = ({t, cam, own, tm, pv}) => {
  const inv = 1 / cam.s;
  const out: React.ReactNode[] = [];
  const outline = (owners: string[], color: string, key: string, dash?: boolean, w = 4) => {
    // solo el contorno exterior del territorio (sin las fronteras interiores de lo ya conquistado)
    const sel = pv.filter((x) => owners.includes(own[x.p.code]));
    if (!sel.length) return;
    const id = `ol-${key}`;
    out.push(
      <g key={key}>
        <mask id={id} maskUnits="userSpaceOnUse" x={-3000} y={-3000} width={8000} height={7000}>
          <rect x={-3000} y={-3000} width={8000} height={7000} fill="#fff" />
          {sel.map((x, i) => <path key={i} d={x.d} fillRule="evenodd" fill="#000" stroke="#000" strokeWidth={1.2 * inv} strokeLinejoin="round" />)}
        </mask>
        <g mask={`url(#${id})`}>
          {sel.map((x, i) => <path key={i} d={x.d} fill="none" stroke={color} strokeWidth={2 * w * inv} strokeDasharray={dash ? `${10 * inv} ${7 * inv}` : undefined} strokeDashoffset={dash ? -t * 40 * inv : 0} strokeLinejoin="round" />)}
        </g>
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
      const b0 = HOME(f.def_);
      const a = nearPt(own, mem(tr.att), b0), b = nearPt(own, f.defM, a);
      const dur = (f.tVs - f.tDir) * 0.75;
      const ang1 = Math.atan2(b[1] - a[1], b[0] - a[0]);
      const u = Math.min(1, (t - f.tDir) / dur);
      const ang = ang1 - (1 - Easing.out(Easing.cubic)(u)) * Math.PI * 6;
      const L = 44 * inv;
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
        out.push(<Boom key="bm" p={los === tr.att ? a : b} t={t} at={f.tRes + 0.2} r={Math.max(8, 30 * inv)} />);
      }
    }
    if (tr.action === 'ALLIANCE' && t >= tr.tPick) {
      const k = lerp(t, tr.tAlly - 0.4, tr.tAlly + 0.6, 0, 1);
      if (t < tr.tAlly + 2.6) outline([...mem(tr.att), tr.partner], YELLOW, 'ally', true, 6 * (1 - 0.6 * k));
      const a = HOME(tr.att), b = HOME(tr.partner);
      if (t < tr.tAlly + 3) out.push(<line key="al" x1={a[0]} y1={a[1]} x2={a[0] + (b[0] - a[0]) * lerp(t, tr.tPick + 1.8, tr.tAlly, 0, 1)} y2={a[1] + (b[1] - a[1]) * lerp(t, tr.tPick + 1.8, tr.tAlly, 0, 1)} stroke="#4fc3ff" strokeWidth={5 * inv} strokeDasharray={`${12 * inv} ${9 * inv}`} opacity={lerp(t, tr.tAlly + 2.2, tr.tAlly + 3, 1, 0)} />);
    }
  }
  if (tr && tr.kind === 'purge') {
    for (const [te, , ls] of EVT) {
      if (te < tr.t0 || te > tr.t1 || t < te - 0.05 || t > te + 1.1) continue;
      ls.forEach((l) => out.push(<Boom key={`pb${l}`} p={HOME(l)} t={t} at={te + 0.05} r={Math.max(5, 16 * inv)} />));
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
  for (const x of pv) { const o = own[x.p.code]; area[o] = (area[o] || 0) + x.p.area; }
  const ALV = new Set(ALIVE0);
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
    if (!gone && !ALV.has(c)) continue;
    if (et !== undefined && t > et + D) continue;
    if (gone && t > introOf[c].t + introOf[c].dur) continue;
    const h = homeAt(c, t);
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
    const rr = Math.min(r, 92 * inv) * (gone ? 1 : Math.min(1, 0.15 + growQ(c, t) * 1.4));
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
  if (tr.kind === 'purge') {
    a = 'THE WEAKEST ARMIES FALL'; b = 'COUNTRIES WITH TINY ARMIES ARE ABSORBED BY THEIR NEIGHBORS';
  } else if (tr.kind === 'ev3') {
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

// ruleta circular: compacta y limpia
const Wheel: React.FC<{t: number; t0: number; t1: number; slices: {label: string; frac: number; color: string; sub?: string}[]; pick: number; x: number; y: number; r?: number; seed?: number; edge?: boolean}> = ({t, t0, t1, slices, pick, x, y, r = 165, seed = 0, edge = false}) => {
  const appear = lerp(t, t0 - 0.25, t0 + 0.12, 0, 1, Easing.out(Easing.back(1.4))) * lerp(t, t1 + 0.7, t1 + 1.0, 1, 0);
  if (appear <= 0) return null;
  let acc = 0;
  const arcs = slices.map((sl) => { const a0 = acc; acc += sl.frac; return {...sl, a0, a1: acc}; });
  const tgt = arcs[pick];
  const within = 0.3 + ((seed * 0.37) % 0.4);
  // al borde: la flecha se queda a pocos grados del otro color (máxima tensión), por el lado al que llega girando
  const span = tgt.a1 - tgt.a0;
  const eps = Math.min(span * 0.25, 0.011 + ((seed * 0.13) % 0.012));
  const tc = edge ? tgt.a0 + eps : tgt.a0 + span * within;
  const final = -tc * 360;
  const u = Math.min(1, Math.max(0, (t - t0) / Math.max(0.3, t1 - t0)));
  const rot = final - (1 - (edge ? Easing.out(Easing.poly(4)) : Easing.out(Easing.cubic))(u)) * 360 * (edge ? 5 : 4);
  const done = u >= 1;
  const pt = (a: number, rr: number): P => [Math.sin(a * Math.PI * 2) * rr, -Math.cos(a * Math.PI * 2) * rr];
  const R = r, ring = 12;
  const pulse = done ? 1 + 0.06 * Math.sin((t - t1) * 14) * lerp(t, t1, t1 + 0.6, 1, 0) : 1;
  return (
    <svg width={R * 2 + 60} height={R * 2 + 70} style={{position: 'absolute', left: x - R - 30, top: y - R - 45, transform: `scale(${appear * pulse})`, overflow: 'visible'}}>
      <defs>
        <radialGradient id="whl-shade" cx="50%" cy="50%" r="50%"><stop offset="55%" stopColor="rgba(255,255,255,0)" /><stop offset="100%" stopColor="rgba(0,0,0,0.22)" /></radialGradient>
        <filter id="whl-sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#000" floodOpacity="0.45" /></filter>
      </defs>
      <g transform={`translate(${R + 30},${R + 45})`}>
        <circle r={R + ring} fill="#141c2b" filter="url(#whl-sh)" />
        {Array.from({length: 24}).map((_, i) => { const [px, py] = pt(i / 24, R + ring / 2); return <circle key={i} cx={px} cy={py} r={2.6} fill={i % 2 ? '#ffd23f' : '#ffffff'} opacity={0.9} />; })}
        <g transform={`rotate(${rot})`}>
          {arcs.map((sl, i) => {
            const [x0, y0] = pt(sl.a0, R), [x1, y1] = pt(sl.a1, R);
            const large = sl.a1 - sl.a0 > 0.5 ? 1 : 0;
            const mid = (sl.a0 + sl.a1) / 2;
            const [tx, ty] = pt(mid, R * 0.6);
            const wide = sl.a1 - sl.a0;
            const fs = sl.sub ? (wide < 0.1 ? 15 : 26) : Math.min(30, Math.max(14, wide * 110));
            const isWin = done && i === pick;
            return (
              <g key={i}>
                <path d={sl.a1 - sl.a0 >= 0.999 ? `M0,${-R} A${R},${R} 0 1,1 -0.01,${-R} Z` : `M0,0 L${x0},${y0} A${R},${R} 0 ${large},1 ${x1},${y1} Z`} fill={sl.color} opacity={done && !isWin ? 0.55 : 1} />
                <line x1={0} y1={0} x2={x0} y2={y0} stroke="#fff" strokeWidth={2.5} opacity={0.9} />
                {wide > 0.045 && <text x={tx} y={ty} transform={`rotate(${mid * 360 - 90},${tx},${ty})`} textAnchor="middle" dominantBaseline="middle" fontSize={fs} fill="#fff" style={{...font}}>{sl.label}</text>}
                {sl.sub && wide >= 0.1 && <text x={tx} y={ty} transform={`rotate(${mid * 360 - 90},${tx},${ty}) translate(0,${fs * 0.95})`} textAnchor="middle" dominantBaseline="middle" fontSize={Math.min(15, 160 / Math.max(6, sl.sub.length))} fill="#fff" opacity={0.92} style={{...font2}}>{sl.sub.slice(0, 14)}</text>}
              </g>
            );
          })}
          <circle r={R} fill="url(#whl-shade)" />
        </g>
        <circle r={R} fill="none" stroke="#fff" strokeWidth={3} />
        <circle r={24} fill="#141c2b" stroke="#fff" strokeWidth={3} />
        <circle r={9} fill={YELLOW} />
        <path d={`M-15,${-R - ring - 16} L15,${-R - ring - 16} L0,${-R + 10} Z`} fill="#fff" stroke="#141c2b" strokeWidth={3} strokeLinejoin="round" />
      </g>
    </svg>
  );
};
const ACTIONS = [{label: 'WAR', frac: 0.6, color: '#e5484d'}, {label: 'ALLIANCE', frac: 0.2, color: '#12a594'}, {label: 'BLITZ', frac: 0.2, color: '#6e56cf'}];
const actionIdx = (a: string) => (a === 'WAR' ? 0 : a === 'ALLIANCE' ? 1 : 2);

const WX = 1590, WY = 620;
// 20% de los duelos (y todos los de la ronda final) se deciden por muy poco
const FINAL_T = (CHAP.find((c) => c[1].includes('FINAL')) || [1e9])[0] as number;
const edgeFight = (tRes: number) => tRes >= FINAL_T || Math.floor(Math.abs(Math.sin(tRes * 12.9898) * 43758.5453) * 10) % 5 === 0;
const TurnHUD: React.FC<{t: number}> = ({t}) => {
  const tr = turnAt(t);
  if (!tr || tr.kind !== 'turn') return null;
  const out: React.ReactNode[] = [];
  out.push(<Slot key="sl" t={t} t0={tr.tSel} t1={tr.tZoom - 0.15} pick={tr.att} x={140} y={190} seed={tr.att.charCodeAt(0)} />);
  const firstDir = tr.fights[0]?.tDir ?? tr.tPick ?? tr.t1;
  out.push(<Wheel key="ew" t={t} t0={tr.tWheel} t1={firstDir - 0.75} slices={ACTIONS} pick={actionIdx(tr.action)} x={WX} y={WY} r={165} seed={tr.att.charCodeAt(1)} />);
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
    out.push(<Wheel key="vw" t={t} t0={f.tVs} t1={f.tRes - 0.15} slices={[{label: `${(pa * 100).toFixed(1)}%`, frac: pa, color: '#e5484d', sub: nm(tr.att)}, {label: `${((1 - pa) * 100).toFixed(1)}%`, frac: 1 - pa, color: '#2f6fe4', sub: nm(f.def_)}]} pick={attWins ? 0 : 1} x={WX} y={WY} r={165} seed={f.def_.charCodeAt(0)} edge={edgeFight(f.tRes)} />);
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
const PURGE = TURNS.find((x) => x.kind === 'purge');
const GainPop: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  if (PURGE && t >= PURGE.t0 && t < PURGE.t1 + 1) return null;
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
    out.push(<Wheel key="vw" t={t} t0={tr.tVs} t1={tr.tRes - 0.15} slices={[{label: `${(pa * 100).toFixed(1)}%`, frac: pa, color: '#e23c3c', sub: 'TEAM A'}, {label: `${((1 - pa) * 100).toFixed(1)}%`, frac: 1 - pa, color: '#1f6fe0', sub: 'TEAM B'}]} pick={tr.win === 'A' ? 0 : 1} x={WX} y={WY} r={165} seed={5} edge={edgeFight(tr.tRes)} />);
  }
  return <>{out}</>;
};

// purga: todos caen a la vez -> cuadrícula de banderas tachadas
const PurgeFeed: React.FC<{t: number}> = ({t}) => {
  const tr = turnAt(t);
  if (!tr || tr.kind !== 'purge') return null;
  const fallenE = EVT.filter(([te]) => te >= tr.t0 && te <= tr.t1);
  if (!fallenE.length) return null;
  const te = fallenE[0][0];
  if (t < te - 0.1) return null;
  const k = popT(t, te, 13);
  const out = lerp(t, tr.t1 - 0.4, tr.t1 + 0.2, 1, 0);
  const list = fallenE.map((e) => e[2][0]);
  const n = Math.round(lerp(t, te, te + 0.9, 0, list.length));
  return (
    <div style={{position: 'absolute', left: 30, top: 140, width: 520, opacity: out, transform: `scale(${k})`, transformOrigin: 'left top'}}>
      <Panel border={RED} style={{padding: '12px 18px 10px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <span style={{fontSize: 38}}>💀</span><span style={{...font, fontSize: 52, color: '#ff6b63'}}>{n}</span><span style={{...font2, fontSize: 20, color: '#fff'}}>ARMIES WIPED OUT</span>
        </div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8}}>
          {list.slice(0, 60).map((c, i) => {
            const kk = lerp(t, te + i * 0.012, te + i * 0.012 + 0.25, 0, 1, Easing.out(Easing.back(1.6)));
            return (
              <div key={c} style={{position: 'relative', transform: `scale(${kk})`}}>
                <WFlag code={c} w={36} h={24} />
                <svg width={36} height={24} style={{position: 'absolute', left: 0, top: 0}}><line x1={4} y1={4} x2={32} y2={20} stroke="#ff3b30" strokeWidth={3} /><line x1={32} y1={4} x2={4} y2={20} stroke="#ff3b30" strokeWidth={3} /></svg>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
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
    const b = (() => { let bb: number[] | null = null; for (const p of MP) if (it.codes.includes(p.code)) { const sb = it.kind === 'gone' || !p.d ? p.b0 : p.mb; bb = bb ? union(bb, sb) : sb; } return bb || tiny(HOME0(it.code)); })();
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
        <div style={{...font2, fontSize: 24, color: '#fff', marginTop: 6, textShadow: '0 2px 4px #000'}}>{it.kind === 'gone' ? 'NO ARMY' : `${fmt(TROOPS[c])} SOLDIERS`}</div>
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
const Credit = () => <div style={{position: 'absolute', right: 16, bottom: 10, background: 'rgba(15,25,40,0.6)', color: '#fff', borderRadius: 10, padding: '4px 12px', ...font2, fontWeight: 600, fontSize: 15}}>Hypothetical simulation · Country sizes = share of the world's active troops (IISS / Wikipedia) · smallest sizes floored for visibility</div>;

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
      <PurgeFeed t={t} />
      <BigCard t={t} />
      <Victory t={t} />
      <Credit />
    </AbsoluteFill>
  );
};

// ================= miniaturas =================
const TX = (size: number, color: string): React.CSSProperties => ({...font, fontSize: size, color, WebkitTextStroke: `${size * 0.12}px ${INK}`, paintOrder: 'stroke fill', lineHeight: 0.95, textShadow: `0 ${size * 0.07}px 0 rgba(0,0,0,0.55)`, whiteSpace: 'nowrap'});
export const ThumbArmy: React.FC<{v: string}> = ({v}) => {
  usePreload();
  const t = M1 + 2.5;
  if (v === 'a') {
    const cam = {cx: 1520, cy: 420, s: 3.4};
    return (
      <AbsoluteFill style={{background: SEA0, overflow: 'hidden'}}>
        <Sea t={0} /><WorldMap t={t} cam={cam} />
        <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)'}} />
        {(() => { const [x, y] = toS(HOME('KP'), cam); return <svg width={1920} height={1080} style={{position: 'absolute'}}><path d={`M${x + 330},${y + 190} Q${x + 200},${y + 170} ${x + 70},${y + 40}`} fill="none" stroke={INK} strokeWidth={26} strokeLinecap="round" /><path d={`M${x + 330},${y + 190} Q${x + 200},${y + 170} ${x + 70},${y + 40}`} fill="none" stroke={YELLOW} strokeWidth={14} strokeLinecap="round" /><circle cx={x + 62} cy={y + 32} r={22} fill={YELLOW} stroke={INK} strokeWidth={7} /></svg>; })()}
        {(() => { const [x, y] = toS(HOME('KP'), cam); return <div style={{position: 'absolute', left: x + 470, top: y + 230, transform: 'translate(-50%,-50%) rotate(-6deg)', ...TX(190, YELLOW)}}>×67</div>; })()}
        {(() => { const [x, y] = toS(HOME('CN'), cam); return <div style={{position: 'absolute', left: x - 260, top: y + 60, transform: 'translate(-50%,-50%) rotate(4deg)', ...TX(130, '#8fd3ff')}}>×1.4</div>; })()}
        <div style={{position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', ...TX(150, '#fff')}}>SIZED BY <span style={{color: RED}}>ARMY</span></div>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, display: 'flex', justifyContent: 'center'}}><div style={{background: YELLOW, border: `10px solid ${INK}`, borderRadius: 26, padding: '6px 40px 0', transform: 'rotate(-2deg)', ...font, fontSize: 96, color: INK}}>THEN WAR ⚔️</div></div>
      </AbsoluteFill>
    );
  }
  const cam = {cx: 960, cy: 520, s: 1.0};
  return (
    <AbsoluteFill style={{background: SEA0, overflow: 'hidden'}}>
      <Sea t={0} /><WorldMap t={t} cam={cam} />
      <AbsoluteFill style={{background: 'rgba(10,20,40,0.25)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 26, textAlign: 'center'}}>
        <div style={TX(118, '#fff')}>THE WORLD IF COUNTRIES</div>
        <div style={TX(132, YELLOW)}>WERE SIZED BY ARMY</div>
      </div>
      {(() => { const [x, y] = toS(HOME('KP'), cam); return <div style={{position: 'absolute', left: x + 170, top: y + 120, transform: 'translate(-50%,-50%) rotate(-6deg)', ...TX(120, YELLOW)}}>×67</div>; })()}
      {(() => { const [x, y] = toS(HOME('CA'), cam); return <div style={{position: 'absolute', left: x, top: y + 30, transform: 'translate(-50%,-50%) rotate(5deg)', ...TX(110, '#8fd3ff')}}>÷24</div>; })()}
    </AbsoluteFill>
  );
};
