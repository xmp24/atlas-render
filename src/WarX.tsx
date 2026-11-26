// Motor WarX: mapa real (o cualquier geo con el formato de army-geo) + guerras por piezas, ruletas, reglas narradas, battle royale.
// Uso: const X = makeWarX(TL, GEO); <Composition component={X.Comp720} durationInFrames={X.frames} ... />
import React from 'react';
import {AbsoluteFill, Easing, useCurrentFrame} from 'remotion';
import {P, Cam, INK, RED, BLUE, GREEN, YELLOW, lerp, font, font2, popT, arcPath, PathArrow, Boom} from './lib3';
import {PL, FlagSvg, usePreload} from './War6';
import {Img, staticFile} from 'remotion';

type Piece = {i: number; code: string; cont: string; bbox: number[]; c: P; area: number; d: string; mb: number[]};
type EyeMood = 'calm' | 'fire' | 'scared' | 'cool' | 'happy' | 'dead';

export const makeWarX = (TLJ: any, GEOJ: any) => {
  const TL = TLJ as any;
  const FPS = TL.fps || 30;
  const GEO = GEOJ as any;
  const GC = GEO.countries as Record<string, any>;
  const NAME = (TL.names || {}) as Record<string, string>;
  const FLAGS = (TL.flags || {}) as Record<string, string>;
  const XFL = (TL.xflags || {}) as Record<string, {vb: number[]; body: string}>;
  const FL = (o: string) => FLAGS[o] || o;
  const nm = (c: string) => (NAME[c] || (PL as any)[c]?.name || c).toUpperCase();
  const TROOPS = (TL.troops || {}) as Record<string, number>;
  const ALIVE0 = TL.alive0 as string[];
  const EVT = TL.events as any[]; // [t, w, ls[], pcs[]|null, style?, A?]
  const PW = (TL.pw || []) as [number, string, number, number][];
  const ALLY = (TL.allies || []) as [number, string, string, string?][];
  const TURNS = (TL.turns || []) as any[];
  const CHAP = (TL.chapters || []) as [number, string, string][];
  const BAN = (TL.banners || []) as [number, string, string][];
  const DUR = TL.duration as number;
  const WIN_T = (TL.winT ?? 1e9) as number;
  const WINNER = TL.winner as string;
  const WAR0 = (TL.warStart ?? 0) as number;
  const HUD = (TL.hud || {}) as any;
  const UNIT = (TL.unit || 'TROOPS') as string;
  const TEAMF = TL.teamFights !== false;
  const D = TL.conqDur ?? 1.15;
  const frames = Math.round(DUR * FPS);

  const MP: Piece[] = Object.keys(GC).filter((c) => (PL as any)[c]).map((c, i) => ({i, code: c, cont: (PL as any)[c].cont, bbox: GC[c].b1, c: GC[c].c1, area: GC[c].a0 ?? GC[c].a1, d: GC[c].d1, mb: GC[c].mb1 || GC[c].b1}));
  const PBY: Record<string, Piece> = Object.fromEntries(MP.map((p) => [p.code, p]));
  const PH = (c: string): P => GC[c]?.home1 || (PL as any)[c]?.home || [960, 540];
  const OWN0: Record<string, string> = Object.fromEntries(MP.map((p) => [p.code, p.code]));
  Object.assign(OWN0, TL.owner0 || {});
  const HOMEP = (TL.homes || {}) as Record<string, string>; // owner -> pieza capital
  const homePiece = (o: string) => HOMEP[o] || (GC[o] ? o : MP.find((p) => OWN0[p.code] === o)?.code || o);
  const LAND0 = MP.map((p) => p.d).join('');
  const union = (a: number[], b: number[]) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])];
  const tiny = (c: P): number[] => [c[0] - 12, c[1] - 8, c[0] + 12, c[1] + 8];

  // ================= dueños por estado =================
  const OWN: Record<string, string>[] = [OWN0];
  const elimT: Record<string, number> = {};
  const cnt0: Record<string, number> = {};
  for (const p of MP) cnt0[OWN0[p.code]] = (cnt0[OWN0[p.code]] || 0) + 1;
  {
    const cnt = {...cnt0};
    EVT.forEach((e, i) => {
      const [te, w, ls, pcs] = e;
      const prev = OWN[i], next: Record<string, string> = {...prev};
      for (const c in prev) {
        const take = pcs ? pcs.includes(c) : ls.includes(prev[c]);
        if (take && prev[c] !== w) { cnt[prev[c]] = (cnt[prev[c]] || 0) - 1; cnt[w] = (cnt[w] || 0) + 1; next[c] = w; }
      }
      for (const l of ls) if (l && (cnt[l] || 0) <= 0 && elimT[l] === undefined) elimT[l] = te;
      OWN.push(next);
    });
  }
  const doneK = (t: number) => { let k = 0; while (k < EVT.length && EVT[k][0] + D <= t) k++; return k; };
  const firedK = (t: number) => { let k = 0; while (k < EVT.length && EVT[k][0] <= t) k++; return k; };
  const isAlive = (c: string, t: number) => elimT[c] === undefined || t < elimT[c];
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
  const gainNear = (c: string, t: number) => PW.find(([tp, cc, , g]) => cc === c && g > 0 && t >= tp && t < tp + 2.6);
  const fmtK = (n: number) => (n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 1 : 2) + 'M' : n >= 1e4 ? Math.round(n / 1e3) + 'K' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : String(Math.round(n)));
  const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
  const bbCache = new Map<string, number[] | null>();
  const ownBox = (owners: string[], k: number, full = false) => {
    const key = owners.join(',') + '|' + k + (full ? 'F' : '');
    if (bbCache.has(key)) return bbCache.get(key)!;
    let b: number[] | null = null;
    const own = OWN[k];
    for (const p of MP) if (owners.includes(own[p.code])) { const bb = full ? p.bbox : p.mb; b = b ? union(b, bb) : [...bb]; }
    bbCache.set(key, b);
    return b;
  };
  const pcsBox = (pcs: string[], full = false) => { let b: number[] | null = null; for (const c of pcs) if (PBY[c]) { const bb = full ? PBY[c].bbox : PBY[c].mb; b = b ? union(b, bb) : [...bb]; } return b; };
  const areaCache = new Map<number, Record<string, number>>();
  const areasK = (k: number) => { let a = areaCache.get(k); if (!a) { a = {}; for (const p of MP) { const o = OWN[k][p.code]; a[o] = (a[o] || 0) + p.area; } areaCache.set(k, a); } return a; };
  const TOTAL = MP.reduce((s, p) => s + p.area, 0);
  // posición del dueño: su capital si aún la tiene; si no, su pieza más grande
  const posCache = new Map<string, P>();
  const ownerPos = (o: string, k: number): P => {
    const key = o + '|' + k;
    if (posCache.has(key)) return posCache.get(key)!;
    const hp = homePiece(o);
    let r: P;
    if (OWN[k][hp] === o) r = PH(hp);
    else { let best: Piece | null = null; for (const p of MP) if (OWN[k][p.code] === o && (!best || p.area > best.area)) best = p; r = best ? PH(best.code) : PH(hp); }
    posCache.set(key, r);
    return r;
  };
  const HOME = (o: string) => ownerPos(o, 0);
  const ownBoxNear = (owners: string[], k: number, c: P, R: number) => {
    let b: number[] | null = null;
    const own = OWN[k];
    let amax = 0;
    for (const p of MP) if (owners.includes(own[p.code]) && p.area > amax) amax = p.area;
    for (const p of MP) {
      if (!owners.includes(own[p.code])) continue;
      if (p.area < amax * 0.03) continue;
      if (Math.hypot(p.c[0] - c[0], p.c[1] - c[1]) > R) continue;
      b = b ? union(b, p.mb) : [...p.mb];
    }
    return b;
  };
  const contOf = (o: string) => ((PL as any)[homePiece(o)]?.cont || 'XX') as string;

  // ================= cámara =================
  type K = [number, number, number, number];
  const KEYS: K[] = [];
  const boxCam = (b: number[], pad = 1.6, smax = 6, smin = 1): [number, number, number] => {
    const w = Math.max(30, b[2] - b[0]) * pad, h = Math.max(20, b[3] - b[1]) * pad;
    const s = Math.max(smin, Math.min(smax, 1920 / w, 1080 / h));
    return [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2, s];
  };
  const WORLD: [number, number, number] = TL.world || [960, 560, 1.0];
  const leftOf = (v: [number, number, number], px = 240): [number, number, number] => [v[0] + px / v[2], v[1], v[2]];
  const CONTBOX: Record<string, number[]> = {};
  for (const p of MP) { const k = p.cont; if (k === 'XX') continue; CONTBOX[k] = CONTBOX[k] ? union(CONTBOX[k], p.bbox) : [...p.bbox]; }
  KEYS.push([0, ...WORLD]);
  for (const k of (TL.cam || []) as K[]) KEYS.push(k);
  const tmAt0 = (t: number) => teamAt(t);
  const memAt = (c: string, t: number) => { if (!TEAMF) return [c]; const tm = tmAt0(t + 0.01); return ALIVE0.filter((x) => tm[x] === tm[c] && isAlive(x, t)); };
  TURNS.forEach((tr) => {
    if (tr.kind === 'purge') { KEYS.push([tr.t0, ...WORLD]); return; }
    if (tr.kind === 'ev3') {
      KEYS.push([tr.t0, ...WORLD]);
      const kk = doneK(tr.t0);
      let b: number[] | null = null;
      [...tr.A, ...tr.D].forEach((c: string) => { const x = ownBoxNear([c], kk, ownerPos(c, kk), 200) || tiny(ownerPos(c, kk)); b = b ? union(b, x) : x; });
      if (b) KEYS.push([tr.tArrows[0], ...boxCam(b, 1.25, 3)]);
      KEYS.push([tr.t1 - 0.3, ...WORLD]);
      return;
    }
    if (tr.kind !== 'turn') return;
    const k = doneK(tr.t0);
    const mem = memAt(tr.att, tr.t0);
    const ap = ownerPos(tr.att, k);
    const ab = ownBoxNear(mem, k, ap, 230) || ownBox(mem, k);
    if (!ab) return;
    const cb = CONTBOX[contOf(tr.att)] || ab;
    if (tr.slot !== false) KEYS.push([tr.tSel, ...(TL.world ? WORLD : tr.mode === 'quick' ? boxCam(ab, 4.5, 3.4) : boxCam(union(cb, ab), 1.1, 2.6))]);
    KEYS.push([tr.tZoom, ...leftOf(boxCam(ab, 1.45, 6.5, 1.7))]);
    if (tr.action === 'ALLIANCE') {
      const pb = ownBoxNear(memAt(tr.partner, tr.t0), k, ownerPos(tr.partner, k), 230);
      if (pb) KEYS.push([tr.tPick + 1.6, ...boxCam(union(ab, pb), 1.35, 5.5, 1.3)]);
      return;
    }
    (tr.fights as any[]).forEach((f: any) => {
      const kk = doneK(f.tDir);
      const dp = ownerPos(f.def_, kk);
      const db = f.tp ? pcsBox(f.tp)! : ownBoxNear(f.defM, kk, dp, 230) || tiny(dp);
      const dc: P = [(db[0] + db[2]) / 2, (db[1] + db[3]) / 2];
      const ab2 = ownBoxNear(f.attM, kk, dc, 320) || tiny(ownerPos(tr.att, kk));
      KEYS.push([f.tDir, ...leftOf(boxCam(union(ab2, db), 1.3, 6, 1.4), 200)]);
    });
  });
  if (WIN_T < 1e8) KEYS.push([WIN_T - 0.2, ...WORLD]);
  KEYS.sort((a, b) => a[0] - b[0]);
  const CUTS = new Set<number>(((TL.cuts || []) as number[]).map((x) => Math.round(x * 100)));
  const camera = (t: number): Cam => {
    let i = 0;
    while (i < KEYS.length - 1 && t >= KEYS[i + 1][0]) i++;
    const [ta, xb, yb, sb] = KEYS[i];
    const [, xa, ya, sa] = KEYS[Math.max(0, i - 1)];
    const cut = CUTS.has(Math.round(ta * 100));
    const dur = cut ? 0.0001 : i + 1 < KEYS.length ? Math.min(1.0, Math.max(0.35, (KEYS[i + 1][0] - ta) * 0.6)) : 1.0;
    const q = i === 0 || cut ? 1 : lerp(t, ta, ta + dur, 0, 1, Easing.inOut(Easing.cubic));
    const s = sa * Math.pow(sb / sa, q);
    const qq = sb === sa ? q : (1 / s - 1 / sa) / (1 / sb - 1 / sa);
    const qc = Number.isFinite(qq) ? Math.max(0, Math.min(1, qq)) : q;
    let cx = xa + (xb - xa) * qc, cy = ya + (yb - ya) * qc;
    // deriva lenta (cámara viva)
    if (HUD.drift) { cx += Math.sin(t * 0.37) * 6 / s; cy += Math.cos(t * 0.29) * 4 / s; }
    for (const e of EVT) { const d = t - e[0]; if (d >= 0 && d < 0.3 && e[4] !== 'fade' && e[4] !== 'quiet') { const a = ((1 - d / 0.3) * (HUD.shake ?? 5)) / s; cx += Math.sin(d * 90) * a; cy += Math.cos(d * 70) * a; } }
    const hw = 960 / s, hh = 540 / s;
    cx = Math.max(hw - 40, Math.min(1960 - hw, cx));
    cy = Math.max(hh - 40, Math.min(1120 - hh, cy));
    return {cx, cy, s};
  };
  const toS = (p: P, cam: Cam): P => [960 + (p[0] - cam.cx) * cam.s, 540 + (p[1] - cam.cy) * cam.s];
  const turnAt = (t: number) => { for (let i = TURNS.length - 1; i >= 0; i--) if (t >= TURNS[i].t0 && t < TURNS[i].t1 + 0.1) return TURNS[i]; return null; };
  const fightAt = (tr: any, t: number) => { if (!tr || !tr.fights) return null; for (let i = tr.fights.length - 1; i >= 0; i--) if (t >= tr.fights[i].tDir) return tr.fights[i]; return null; };

  // ================= ojos =================
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

  // ================= banderas =================
  const MapFlag: React.FC<{o: string; b: number[]}> = ({o, b}) => {
    const code = FL(o);
    const f = XFL[code];
    if (f) {
      const [vx, vy, vw, vh] = f.vb;
      const w = Math.max(1, b[2] - b[0]), h = Math.max(1, b[3] - b[1]);
      return <g transform={`translate(${b[0]},${b[1]}) scale(${w / vw},${h / vh}) translate(${-vx},${-vy})`} dangerouslySetInnerHTML={{__html: f.body}} />;
    }
    return <FlagSvg code={code} b={b} />;
  };
  const HFlag: React.FC<{code: string; w?: number; h?: number; round?: boolean}> = ({code, w = 54, h = 36, round}) => {
    const c = FL(code);
    const f = XFL[c];
    return (
      <div style={{width: w, height: h, borderRadius: round ? '50%' : 5, border: `3px solid ${INK}`, overflow: 'hidden', flexShrink: 0, background: '#ddd'}}>
        {f ? (
          <svg width={w - 6} height={h - 6} viewBox={f.vb.join(' ')} preserveAspectRatio="xMidYMid slice" dangerouslySetInnerHTML={{__html: f.body}} />
        ) : (
          <Img src={staticFile(`wflags/${c.toLowerCase()}.svg`)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
        )}
      </div>
    );
  };

  // ================= fronteras y bloques =================
  const numsBox = (d: string) => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; const re = /(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g; let m; while ((m = re.exec(d))) { const x = +m[1], y = +m[2]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return [x0, y0, x1, y1]; };
  const BPAIRS = Object.entries((GEO.borders || {}) as Record<string, string>).map(([k, d]) => { const [a, b] = k.split('|'); return {a, b, d, bb: numsBox(d)}; });
  const COAST = (GEO.coast || '') as string;
  const coverBox = (b: number[]) => {
    const w = Math.max(1, b[2] - b[0]), h = Math.max(1, b[3] - b[1]), cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2;
    const r = Math.min(1.75, Math.max(1.25, w / h));
    let W2 = w, H2 = h;
    if (w / h > r) H2 = w / r; else W2 = h * r;
    return [cx - W2 / 2, cy - H2 / 2, cx + W2 / 2, cy + H2 / 2];
  };
  const ADJ: Record<string, Set<string>> = {};
  for (const bp of BPAIRS) { (ADJ[bp.a] ||= new Set()).add(bp.b); (ADJ[bp.b] ||= new Set()).add(bp.a); }
  {
    const gap = (a: number[], b: number[]) => Math.max(0, a[0] - b[2], b[0] - a[2], a[1] - b[3], b[1] - a[3]);
    for (let i = 0; i < MP.length; i++) for (let j = i + 1; j < MP.length; j++) if (gap(MP[i].mb, MP[j].mb) < 2.5) { const a = MP[i].code, b = MP[j].code; (ADJ[a] ||= new Set()).add(b); (ADJ[b] ||= new Set()).add(a); }
  }
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
  // datos fijos por evento (punto de origen de la expansión)
  const EVG = EVT.map((e, i) => {
    const [, w, ls, pcs, style, A0] = e;
    const lb = pcs ? pcsBox(pcs, true) : ownBox(ls, i, true);
    if (!lb) return null;
    const lc: P = [(lb[0] + lb[2]) / 2, (lb[1] + lb[3]) / 2];
    let A: P;
    if (A0) A = A0 as P;
    else {
      const wb = ownBoxNear([w], i, lc, 260) || ownBox([w], i);
      const wc: P = wb ? [(wb[0] + wb[2]) / 2, (wb[1] + wb[3]) / 2] : lc;
      const dx = wc[0] - lc[0], dy = wc[1] - lc[1], dl = Math.hypot(dx, dy) || 1;
      const half = Math.hypot(lb[2] - lb[0], lb[3] - lb[1]) / 2;
      A = [lc[0] + (dx / dl) * Math.min(dl, half * 0.9), lc[1] + (dy / dl) * Math.min(dl, half * 0.9)];
    }
    const R = Math.max(...[[lb[0], lb[1]], [lb[2], lb[1]], [lb[0], lb[3]], [lb[2], lb[3]]].map(([x, y]) => Math.hypot(x - A[0], y - A[1]))) * 1.05;
    return {A, R, fade: style === 'fade', lb};
  });

  // ================= mapa =================
  const UNCL = '#c9ced6';
  const WorldMap: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
    const {cx, cy, s} = cam;
    const inv = 1 / s;
    const vx0 = cx - 960 / s - 40, vx1 = cx + 960 / s + 40, vy0 = cy - 540 / s - 40, vy1 = cy + 540 / s + 40;
    const vis = (b: number[]) => b[2] > vx0 && b[0] < vx1 && b[3] > vy0 && b[1] < vy1;
    const k = doneK(t);
    const fk = firedK(t);
    const own = OWN[k];
    const tm = teamAt(t);
    type PV = {p: Piece; d: string};
    const pv: PV[] = [];
    const sw = 2.2 * inv;
    const grow = 2.6 * inv;
    for (const p of MP) { if (!p.d || !vis(p.bbox)) continue; pv.push({p, d: p.d}); }
    const overlays: {w: string; ls: string[]; pcs: string[] | null; q: number; A: P; R: number; fade: boolean; ei: number}[] = [];
    for (let i = k; i < EVT.length && EVT[i][0] <= t; i++) {
      const [te, w, ls, pcs] = EVT[i];
      const g = EVG[i];
      if (!g) continue;
      const q = Easing.inOut(Easing.cubic)(Math.min(1, (t - te) / D));
      overlays.push({w, ls, pcs: pcs || null, q, A: g.A, R: g.R, fade: g.fade, ei: i});
    }
    const ovQ: Record<string, number> = {};
    for (const ov of overlays) ovQ[ov.w] = Math.max(ovQ[ov.w] || 0, ov.q);
    const teams = new Map<string, Map<string, PV[]>>();
    const grey: PV[] = [];
    for (const x of pv) {
      const o = own[x.p.code];
      if (!o) { grey.push(x); continue; }
      const L = tm[o] || o;
      if (!teams.has(L)) teams.set(L, new Map());
      const m = teams.get(L)!;
      if (!m.has(o)) m.set(o, []);
      m.get(o)!.push(x);
    }
    const byClu = (o: string, list: PV[]) => {
      const g = new Map<number, PV[]>();
      for (const x of list) { const ci = cluOf(o, k, x.p.code); if (!g.has(ci)) g.set(ci, []); g.get(ci)!.push(x); }
      return [...g.entries()].map(([ci, l2]) => {
        const C = clustersOf(o, k)[ci];
        let b = C ? C.box : l2.reduce((bb, x) => union(bb, x.p.mb), [...l2[0].p.mb]);
        const q = ovQ[o] || 0;
        if (C && q > 0 && fk > k) { const j = cluOf(o, fk, C.codes[0]); const B = j >= 0 ? clustersOf(o, fk)[j].box : b; b = b.map((v, n) => v + (B[n] - v) * q); }
        return {ci, l2, box: coverBox(b)};
      });
    };
    const sameSide = (x: string, y: string) => x === y || (tm[x] !== undefined && tm[x] === tm[y]);
    const ovl = overlays.map((ov) => {
      const lp = pv.filter((x) => (ov.pcs ? ov.pcs.includes(x.p.code) : ov.ls.includes(own[x.p.code])));
      const g = new Map<number, PV[]>();
      for (const x of lp) { const j = cluOf(ov.w, fk, x.p.code); if (!g.has(j)) g.set(j, []); g.get(j)!.push(x); }
      return {ov, parts: [...g.entries()].map(([j, l2]) => ({j, l2, box: coverBox(j >= 0 ? clustersOf(ov.w, fk)[j].box : l2.reduce((bb, x) => union(bb, x.p.mb), [...l2[0].p.mb]))}))};
    });
    const groups = [...teams.entries()].map(([L, m]) => ({L, m, own: [...m.entries()].map(([o, list]) => ({o, cl: byClu(o, list)}))}));
    const inOv = (c: string, o: string) => overlays.some((ov) => (ov.pcs ? ov.pcs.includes(c) : ov.ls.includes(o)));
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
          <path d={LAND0} fill={UNCL} />
          {grey.map((x, i) => <path key={`g${i}`} d={x.d} fill="none" stroke="#9aa3af" strokeWidth={0.9 * inv} strokeLinejoin="round" />)}
          {groups.map((G) => (
            <g key={G.L}>
              <g transform={`translate(${1.6 * inv},${2.4 * inv})`} opacity={0.3}>{[...G.m.values()].flat().map((x, i) => <path key={i} d={x.d} fillRule="evenodd" fill="#06213f" />)}</g>
              {G.own.map(({o, cl}) => cl.map(({ci, box}) => <g key={`${o}-${ci}`} mask={`url(#ac-${o}-${ci})`}><MapFlag o={o} b={box} /></g>))}
            </g>
          ))}
          {ovl.map(({ov, parts}, i) => (
            <g key={`ov${i}`} opacity={ov.fade ? ov.q : 1} clipPath={ov.fade ? undefined : `url(#aoc-${i})`}>
              {parts.map(({j, box}) => <g key={j} mask={`url(#ao-${i}-${j})`}><MapFlag o={ov.w} b={box} /></g>)}
            </g>
          ))}
          {overlays.filter((ov) => !ov.fade).map((ov, i) => <circle key={`r${i}`} cx={ov.A[0]} cy={ov.A[1]} r={ov.R * ov.q} fill="none" stroke="#fff" strokeWidth={3 * inv} opacity={0.85 * (1 - ov.q) * Math.min(1, ov.q * 8)} />)}
          <g>
            {BPAIRS.filter((bp) => vis(bp.bb)).map((bp, i) => {
              const oa = own[bp.a], ob = own[bp.b];
              if (oa === undefined || ob === undefined) return null;
              let op = sameSide(oa, ob) ? 0 : 1;
              if (!oa && !ob) op = 0.35;
              for (const ov of overlays) {
                const la = ov.pcs ? ov.pcs.includes(bp.a) : ov.ls.includes(oa), lb2 = ov.pcs ? ov.pcs.includes(bp.b) : ov.ls.includes(ob);
                if ((la && ob === ov.w) || (lb2 && oa === ov.w) || (la && lb2)) op = Math.min(op, 1 - ov.q);
              }
              if (op <= 0.01) return null;
              return <path key={i} d={bp.d} fill="none" stroke={INK} strokeWidth={sw * 1.05} strokeLinecap="round" strokeLinejoin="round" opacity={op} />;
            })}
            <path d={COAST} fill="none" stroke={INK} strokeWidth={sw * 1.25} strokeLinejoin="round" />
          </g>
          <MapFX t={t} cam={cam} own={own} tm={tm} pv={pv} />
          <AllEyes t={t} cam={cam} k={k} tm={tm} />
        </g>
      </svg>
    );
  };

  // ================= efectos del mapa =================
  const nearPt = (own: Record<string, string>, owners: string[], to: P): P => { let best: P | null = null, bd = Infinity; const mine = MP.filter((p) => p.d && owners.includes(own[p.code])); const amax = Math.max(1, ...mine.map((p) => p.area)); for (const p of mine) { if (p.area < amax * 0.04) continue; const h = PH(p.code); const d = Math.hypot(h[0] - to[0], h[1] - to[1]); if (d < bd) { bd = d; best = h; } } return best || to; };
  const ARW = (TL.arrows || []) as [number, number, number, number, number, number, string?][];
  const BOOMS = (TL.booms || []) as [number, number, number, number][];
  const MARKS = (TL.marks || []) as [number, number, string[], string, string[]?][];
  const MapFX: React.FC<{t: number; cam: Cam; own: Record<string, string>; tm: Record<string, string>; pv: {p: Piece; d: string}[]}> = ({t, cam, own, tm, pv}) => {
    const inv = 1 / cam.s;
    const out: React.ReactNode[] = [];
    const outlineSel = (sel: {d: string}[], color: string, key: string, dash?: boolean, w = 4) => {
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
    const outline = (owners: string[], color: string, key: string, dash?: boolean, w = 4) => outlineSel(pv.filter((x) => owners.includes(own[x.p.code])), color, key, dash, w);
    const outlineP = (pcs: string[], color: string, key: string, dash?: boolean, w = 4) => outlineSel(pv.filter((x) => pcs.includes(x.p.code)), color, key, dash, w);
    // silueta de cada bando (contorno exterior del territorio del equipo)
    for (const [L, col] of (TL.sideOutline || []) as [string, string][]) {
      const mem = ALIVE0.filter((c) => tm[c] === L);
      outline(mem, col, `side${L}`, false, 5.5);
    }
    // marcas (reglas): países señalados parpadeando
    MARKS.forEach(([t0, t1, owners, color, pcs], i) => {
      if (t < t0 || t > t1) return;
      const a = lerp(t, t0, t0 + 0.3, 0, 1) * lerp(t, t1 - 0.3, t1, 1, 0);
      const pulse = 0.55 + 0.45 * Math.sin(t * 10);
      const col = color.startsWith('#') ? color : color;
      if (pcs && pcs.length) outlineP(pcs, col, `mk${i}`, false, 3.2 * a * (0.8 + 0.2 * pulse));
      else outline(owners, col, `mk${i}`, false, 3.2 * a * (0.8 + 0.2 * pulse));
    });
    const tr = turnAt(t);
    const mem = (c: string) => (TEAMF ? ALIVE0.filter((x) => tm[x] === tm[c] && isAlive(x, t + 0.001)) : [c]);
    if (tr && tr.kind === 'turn' && t >= tr.tZoom) {
      const f = fightAt(tr, t);
      outline(mem(tr.att), YELLOW, 'att', false, 4.5);
      if (f && t >= f.tDir && t < f.tRes + 0.4) {
        const pulse = 0.6 + 0.4 * Math.sin(t * 12);
        if (t >= f.tDir + (tr.mode === 'quick' ? 0.8 : 1.4)) { if (f.tp) outlineP(f.tp, `rgba(255,80,70,${pulse})`, 'def', true, 5); else outline(f.defM, `rgba(255,80,70,${pulse})`, 'def', true, 5); }
        const b0 = f.tp ? PH(f.tp[0]) : ownerPos(f.def_, doneK(f.tDir));
        const a = nearPt(own, mem(tr.att), b0), b = f.tp ? b0 : nearPt(own, f.defM, a);
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
          out.push(<PathArrow key="arr" pts={arcPath(a, b, Math.min(50, dist * 0.2))} t={t} t0={f.tVs - 0.2} t1={f.tVs + 0.5} color="rgba(229,50,45,0.92)" w={6 * inv} fadeAfter={f.tRes + 1.6 - f.tVs} />);
        }
        if (t >= f.tRes && t < f.tRes + 1.6) {
          const attWins = f.win === tr.att || f.attM.includes(f.win);
          out.push(<Boom key="bm" p={attWins ? b : a} t={t} at={f.tRes + 0.2} r={Math.max(8, 30 * inv)} />);
        }
      }
      if (tr.action === 'ALLIANCE' && t >= tr.tPick) {
        const k = lerp(t, tr.tAlly - 0.4, tr.tAlly + 0.6, 0, 1);
        if (t < tr.tAlly + 2.6) outline([...mem(tr.att), tr.partner], YELLOW, 'ally', true, 6 * (1 - 0.6 * k));
        const a = ownerPos(tr.att, doneK(t)), b = ownerPos(tr.partner, doneK(t));
        if (t < tr.tAlly + 3) out.push(<line key="al" x1={a[0]} y1={a[1]} x2={a[0] + (b[0] - a[0]) * lerp(t, tr.tPick + 1.8, tr.tAlly, 0, 1)} y2={a[1] + (b[1] - a[1]) * lerp(t, tr.tPick + 1.8, tr.tAlly, 0, 1)} stroke="#4fc3ff" strokeWidth={5 * inv} strokeDasharray={`${12 * inv} ${9 * inv}`} opacity={lerp(t, tr.tAlly + 2.2, tr.tAlly + 3, 1, 0)} />);
      }
    }
    if (tr && tr.kind === 'purge') {
      for (const e of EVT) {
        const [te, , ls] = e;
        if (te < tr.t0 || te > tr.t1 || t < te - 0.05 || t > te + 1.1) continue;
        ls.forEach((l: string) => out.push(<Boom key={`pb${l}${te}`} p={ownerPos(l, 0)} t={t} at={te + 0.05} r={Math.max(5, 16 * inv)} />));
      }
    }
    if (tr && tr.kind === 'ev3') {
      if (t >= tr.tAllies && t < tr.tRes + 1.2) {
        const kk = doneK(tr.t0);
        const P3 = tr.A.map((c: string) => ownerPos(c, kk));
        const k = lerp(t, tr.tAllies, tr.tAllies + 1.2, 0, 1);
        (tr.A.length === 3 ? [[0, 1], [1, 2], [2, 0]] : [[0, 1]]).forEach(([i, j]) => out.push(<line key={`e${i}`} x1={P3[i][0]} y1={P3[i][1]} x2={P3[i][0] + (P3[j][0] - P3[i][0]) * k} y2={P3[i][1] + (P3[j][1] - P3[i][1]) * k} stroke="#4fc3ff" strokeWidth={5 * inv} strokeDasharray={`${14 * inv} ${10 * inv}`} opacity={0.9} />));
        outline(tr.A, '#4fc3ff', 'evA', true, 5);
      }
      tr.A.forEach((c: string, i: number) => {
        const ta = tr.tArrows[i];
        if (t < ta || t > tr.tRes + 1.6) return;
        const kk = doneK(tr.t0);
        const a = ownerPos(c, kk), b = ownerPos(tr.D[i], kk);
        const dist = Math.hypot(b[0] - a[0], b[1] - a[1]);
        out.push(<PathArrow key={`ea${i}`} pts={arcPath(a, b, Math.min(60, dist * 0.2))} t={t} t0={ta} t1={ta + 0.8} color="rgba(229,50,45,0.92)" w={6 * inv} fadeAfter={9} />);
        if (t > ta + 0.7) outline([tr.D[i]], `rgba(255,80,70,${0.6 + 0.4 * Math.sin(t * 12)})`, `ed${i}`, true, 5);
      });
    }
    // flechas y explosiones del director (raids, reglas)
    ARW.forEach(([t0, t1, x0, y0, x1, y1, col], i) => {
      if (t < t0 || t > t1 + 0.8) return;
      const a: P = [x0, y0], b: P = [x1, y1];
      const dist = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (dist * cam.s < 4) return;
      out.push(<PathArrow key={`xa${i}`} pts={arcPath(a, b, Math.min(60, dist * 0.22))} t={t} t0={t0} t1={t0 + Math.min(0.55, (t1 - t0) * 0.6)} color={col || 'rgba(229,50,45,0.92)'} w={Math.max(2.2 * inv, Math.min(7 * inv, dist * 0.06))} fadeAfter={t1 - t0 + 0.4} />);
    });
    BOOMS.forEach(([tb, x, y, r], i) => {
      if (t < tb - 0.05 || t > tb + 1.1) return;
      out.push(<Boom key={`xb${i}`} p={[x, y]} t={t} at={tb} r={Math.max(6 * inv, r)} />);
    });
    return <g>{out}</g>;
  };

  // ojos + poder de cada dueño vivo
  const AllEyes: React.FC<{t: number; cam: Cam; k: number; tm: Record<string, string>}> = ({t, cam, k, tm}) => {
    const area = areasK(k);
    const tr = turnAt(t);
    const f = fightAt(tr, t);
    const nodes: React.ReactNode[] = [];
    const inv = 1 / cam.s;
    const showP = t > WAR0 - 1 && HUD.power !== false;
    for (const c of ALIVE0) {
      const et = elimT[c];
      if (et !== undefined && t > et + D) continue;
      if (!(area[c] > 0) && et === undefined) continue;
      const h = ownerPos(c, et !== undefined && t > et ? Math.max(0, EVT.findIndex((e) => e[0] === et)) : k);
      let r = Math.min(80, Math.max(3.2, Math.sqrt(area[c] || 4) * 0.15));
      if (!(h[0] > cam.cx - 1000 / cam.s && h[0] < cam.cx + 1000 / cam.s && h[1] > cam.cy - 600 / cam.s && h[1] < cam.cy + 600 / cam.s)) continue;
      if (r * cam.s < 6) continue;
      let mood: EyeMood = 'calm';
      let look: P = [Math.sin(t * 0.7 + c.charCodeAt(0)) * 0.6, 0];
      if (tr && tr.kind === 'turn' && f) {
        const attSide = TEAMF ? tm[c] === tm[tr.att] : c === tr.att;
        const defSide = f.defM.includes(c);
        const tgt = attSide ? ownerPos(f.def_, k) : defSide ? ownerPos(tr.att, k) : null;
        if (tgt) { const dx = tgt[0] - h[0], dy = tgt[1] - h[1], dl = Math.hypot(dx, dy) || 1; look = [dx / dl, dy / dl]; }
        const winnerSide = f.win === c || (TEAMF && tm[f.win] === tm[c]);
        if (t >= f.tRes && (attSide || defSide)) mood = winnerSide ? 'cool' : 'dead';
        else if (t >= f.tDir && attSide) mood = 'fire';
        else if (t >= f.tDir + 1 && defSide) mood = 'scared';
      }
      if (tr && tr.kind === 'turn' && tr.action === 'ALLIANCE' && t >= tr.tAlly && (c === tr.att || c === tr.partner)) mood = 'happy';
      if (tr && tr.kind === 'ev3') {
        const iA = tr.A.indexOf(c), iD = tr.D.indexOf(c);
        if (iA >= 0 || iD >= 0) { const won = (iA >= 0 && tr.win === 'A') || (iD >= 0 && tr.win === 'D'); if (t >= tr.tRes) mood = won ? 'cool' : 'dead'; else if (t >= tr.tArrows[0]) mood = iA >= 0 ? 'fire' : 'scared'; }
      }
      // moods del director: [t0, t1, owner, mood]
      for (const m of (TL.moods || []) as [number, number, string, EyeMood][]) if (m[2] === c && t >= m[0] && t < m[1]) mood = m[3];
      if (et !== undefined && t >= et) mood = 'dead';
      if (t > WIN_T && c === WINNER) mood = 'cool';
      const alpha = et !== undefined ? lerp(t, et + 0.3, et + D, 1, 0) : 1;
      const rr = Math.min(r, 92 * inv);
      const L = tm[c];
      const pw = showP ? (TEAMF && L && ALIVE0.filter((x) => tm[x] === L && isAlive(x, t)).length > 1 ? ALIVE0.filter((x) => tm[x] === L && isAlive(x, t)).reduce((s, x) => s + powerAt(x, t), 0) : powerAt(c, t)) : 0;
      const g = gainNear(c, t);
      const pump = g ? 1 + 0.25 * lerp(t, g[0], g[0] + 0.5, 1, 0) : 1;
      nodes.push(<Eyes key={c} x={h[0]} y={h[1]} r={rr} mood={mood} look={look} t={t} seed={c.charCodeAt(0) + c.charCodeAt(1)} power={showP && pw > 0 ? fmtK(pw) : undefined} alpha={alpha} pump={pump} />);
    }
    return <g>{nodes}</g>;
  };

  // ================= HUD =================
  const Panel: React.FC<{children: React.ReactNode; style?: React.CSSProperties; border?: string}> = ({children, style, border = 'rgba(255,255,255,0.12)'}) => (
    <div style={{background: 'rgba(16,24,38,0.92)', border: `3px solid ${border}`, borderRadius: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.35)', ...style}}>{children}</div>
  );
  const ELIMS = Object.entries(elimT).sort((a, b) => a[1] - b[1]);
  const aliveCount = (t: number) => ALIVE0.length - ELIMS.filter(([, te]) => te <= t + 0.6).length;
  const roundNo = (t: number) => TURNS.filter((x) => x.t0 <= t && x.kind === 'turn').length;
  const AliveBox: React.FC<{t: number}> = ({t}) => {
    if (HUD.alive === false || t < WAR0 - 0.5 || t > WIN_T + 0.5) return null;
    const k = popT(t, WAR0 - 0.5);
    const last = ELIMS.filter(([, te]) => te <= t + 0.6).slice(-1)[0];
    const bump = last ? 1 + 0.3 * lerp(t, last[1] + 0.6, last[1] + 1.0, 1, 0) : 1;
    const sub = HUD.aliveSub === 'round' ? `ROUND #${Math.max(1, roundNo(t))}` : HUD.aliveSub || '';
    return (
      <Panel border="#ff4fa3" style={{position: 'absolute', left: 30, top: 28, width: 290, height: 92, transform: `scale(${k})`, transformOrigin: 'left top', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px'}}>
        <div>
          <div style={{...font2, fontSize: 21, color: '#fff', letterSpacing: 0.5}}>{HUD.aliveLabel || 'ALIVE COUNTRIES'}</div>
          {sub && <div style={{...font2, fontSize: 16, color: '#ff4fa3', marginTop: 6}}>{sub}</div>}
        </div>
        <div style={{...font, fontSize: 62, color: '#ff4fa3', transform: `scale(${bump})`}}>{aliveCount(t)}</div>
      </Panel>
    );
  };
  // ranking por territorio
  const Top5: React.FC<{t: number}> = ({t}) => {
    if (!HUD.top5 || t < WAR0 + 0.5 || t > WIN_T + 0.3) return null;
    const a = areasK(doneK(t));
    const list = Object.entries(a).filter(([o]) => o && ALIVE0.includes(o)).sort((x, y) => y[1] - x[1]).slice(0, HUD.top5 === true ? 5 : HUD.top5);
    const k = popT(t, WAR0 + 0.5);
    return (
      <Panel style={{position: 'absolute', left: 30, top: 136, width: 330, padding: '10px 14px', transform: `scale(${k})`, transformOrigin: 'left top'}}>
        <div style={{...font2, fontSize: 17, color: YELLOW, marginBottom: 6}}>{HUD.top5Label || 'BIGGEST TERRITORY'}</div>
        {list.map(([o, ar], i) => (
          <div key={o} style={{display: 'flex', alignItems: 'center', gap: 10, height: 40}}>
            <div style={{...font, fontSize: 22, color: '#9fb0c6', width: 20}}>{i + 1}</div>
            <HFlag code={o} w={40} h={28} />
            <div style={{flex: 1, overflow: 'hidden'}}>
              <div style={{...font, fontSize: nm(o).length > 11 ? 16 : 19, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{nm(o)}</div>
              <div style={{height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.12)'}}><div style={{width: `${Math.min(100, (ar / TOTAL) * 100 * (HUD.top5Scale || 2.2))}%`, height: 6, borderRadius: 3, background: i === 0 ? YELLOW : '#4fc3ff'}} /></div>
            </div>
            <div style={{...font2, fontSize: 16, color: '#fff', width: 52, textAlign: 'right'}}>{((ar / TOTAL) * 100).toFixed(1)}%</div>
          </div>
        ))}
      </Panel>
    );
  };
  // marcador de dos bandos
  const TB = (TL.teamBoard || null) as [string, string, string][] | null;
  const TeamBoard: React.FC<{t: number}> = ({t}) => {
    if (!TB || t < WAR0 - 0.5 || t > WIN_T + 0.5) return null;
    const tm = teamAt(t);
    const k = popT(t, WAR0 - 0.5);
    const a = areasK(doneK(t));
    return (
      <div style={{position: 'absolute', left: 30, top: 28, display: 'flex', flexDirection: 'column', gap: 10, transform: `scale(${k})`, transformOrigin: 'left top'}}>
        {TB.map(([L, name, col]) => {
          const mem = ALIVE0.filter((c) => tm[c] === L && isAlive(c, t + 0.6));
          const pw = mem.reduce((s, c) => s + powerAt(c, t), 0);
          const ar = mem.reduce((s, c) => s + (a[c] || 0), 0);
          return (
            <Panel key={L} border={col} style={{width: 330, padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <div style={{...font, fontSize: 28, color: col === '#e5322d' ? '#ff6b63' : '#6fa8ff'}}>{name}</div>
                <div style={{...font2, fontSize: 15, color: '#cdd6e2'}}>{fmtK(pw)} {UNIT} · {((ar / TOTAL) * 100).toFixed(1)}% LAND</div>
              </div>
              <div style={{...font, fontSize: 52, color: '#fff'}}>{mem.length}</div>
            </Panel>
          );
        })}
      </div>
    );
  };
  // feed de eliminaciones (solo banderas)
  const KillFeed: React.FC<{t: number}> = ({t}) => {
    if (!HUD.feed || t > WIN_T) return null;
    const killer: Record<string, string> = {};
    EVT.forEach((e) => { for (const l of e[2]) if (elimT[l] === e[0]) killer[l] = e[1]; });
    const list = ELIMS.filter(([, te]) => te <= t && te > t - 6).slice(-5);
    return (
      <div style={{position: 'absolute', right: 26, top: 26, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end'}}>
        {list.map(([l, te]) => {
          const k = popT(t, te, 13);
          const o = lerp(t, te + 4.8, te + 6, 1, 0);
          return (
            <div key={l} style={{transform: `scale(${k})`, opacity: o, transformOrigin: 'right center', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(16,24,38,0.88)', border: '3px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '6px 12px'}}>
              <HFlag code={killer[l] || l} w={46} h={32} />
              <span style={{fontSize: 24}}>⚔️</span>
              <div style={{position: 'relative'}}>
                <HFlag code={l} w={46} h={32} />
                <svg width={46} height={32} style={{position: 'absolute', left: 0, top: 0}}><line x1={5} y1={5} x2={41} y2={27} stroke="#ff3b30" strokeWidth={4} /><line x1={41} y1={5} x2={5} y2={27} stroke="#ff3b30" strokeWidth={4} /></svg>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  const StatusBar: React.FC<{t: number}> = ({t}) => {
    const tr = turnAt(t);
    if (!tr || t < WAR0 || HUD.status === false) return null;
    let a = '', b = '';
    if (tr.kind === 'purge') { a = tr.title || 'THE WEAKEST FALL'; b = tr.sub || ''; }
    else if (tr.kind === 'ev3') {
      if (t < tr.tSel) { a = 'SPECIAL EVENT!'; b = `${tr.A.length} COUNTRIES FROM ANYWHERE WILL UNITE`; }
      else if (t < tr.tAllies) { a = `SELECTING ${tr.A.length} COUNTRIES...`; b = tr.A.length === 3 ? 'TRIPLE SELECTOR IS SPINNING' : 'DOUBLE SELECTOR IS SPINNING'; }
      else if (t < tr.tArrows[0]) { a = tr.A.map((c: string) => nm(c)).join(' + '); b = 'FORMING A SPECIAL ALLIANCE'; }
      else if (t < tr.tVs) { a = 'CHOOSING TARGETS'; b = 'EACH ALLY THROWS ONE ARROW'; }
      else return null;
    } else if (tr.kind === 'turn') {
      const f = fightAt(tr, t);
      if (f && t >= f.tVs) return null;
      if (tr.slot2 && t < tr.tZoom + 0.5) { a = 'SELECTING THE TWO RIVALS...'; b = `${TB ? TB[0][1] : 'SIDE A'} SELECTOR  ·  ${TB ? TB[1][1] : 'SIDE B'} SELECTOR`; }
      else if (tr.slot === false) { if (!f) return null; a = tr.title || `${nm(tr.att)} ATTACKS`; b = tr.sub || 'SPINNING TARGET DIRECTION...'; }
      else if (t < tr.tZoom) { a = 'SELECTING ACTIVE ' + (HUD.who || 'COUNTRY') + '...'; b = 'THE SELECTOR IS SPINNING'; }
      else if (t < tr.tWheel) { a = `ACTIVE TURN: ${nm(tr.att)}`; b = 'ZOOMING TO THE SELECTED ' + (HUD.who || 'COUNTRY'); }
      else if (tr.action === 'ALLIANCE') {
        if (t < tr.tPick) { a = `ACTIVE TURN: ${nm(tr.att)}`; b = 'SPINNING THE EVENT WHEEL...'; }
        else if (t < tr.tAlly) { a = `ALLIANCE: ${nm(tr.att)}`; b = 'CHOOSING AN ALLIANCE PARTNER'; }
        else { a = `${nm(tr.att)} + ${nm(tr.partner)}`; b = `ALLIED · COMBINED ${HUD.powerWord || 'POWER'} ${fmt(tr.power)}`; }
      } else if (!f) { a = `ACTIVE TURN: ${nm(tr.att)}`; b = 'SPINNING THE EVENT WHEEL...'; }
      else { a = `${tr.action}: ${nm(tr.att)}`; b = tr.fights.indexOf(f) >= 1 ? 'SECOND STRIKE · SPINNING TARGET DIRECTION...' : f.tpName ? `TARGET: ${f.tpName}` : 'SPINNING TARGET DIRECTION...'; }
    } else return null;
    return (
      <Panel style={{position: 'absolute', left: 420, top: 28, width: 1080, height: 92, padding: '14px 30px'}}>
        <div style={{...font, fontSize: 38, color: YELLOW, whiteSpace: 'nowrap', overflow: 'hidden'}}>{a}</div>
        <div style={{...font2, fontSize: 18, color: '#e8ecf2', marginTop: 2}}>{b}</div>
      </Panel>
    );
  };
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
    if (appear <= 0 || N === 0) return null;
    const rows: React.ReactNode[] = [];
    const base = Math.floor(pos);
    for (let j = -3; j <= 3; j++) {
      const i = ((base + j) % N + N) % N;
      const c = list[i];
      const off = (base + j - pos) * H;
      const sel = Math.abs(off) < H / 2 && u >= 1;
      rows.push(
        <div key={j} style={{position: 'absolute', left: 14, right: 14, top: 3 * H + off + 12, height: H - 10, display: 'flex', alignItems: 'center', gap: 14, padding: '0 14px', background: sel ? 'rgba(255,210,63,0.18)' : 'rgba(255,255,255,0.05)', borderRadius: 10, border: '2px solid rgba(255,255,255,0.08)'}}>
          <HFlag code={c} w={38} h={38} round />
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
        <div style={{position: 'absolute', left: '50%', top: -22, transform: 'translateX(-50%)', background: YELLOW, borderRadius: 12, padding: '6px 22px 2px', ...font, fontSize: 24, color: INK, border: `3px solid ${INK}`, whiteSpace: 'nowrap'}}>{N} {HUD.slotWord || 'COUNTRIES'}</div>
        {u >= 1 && <div style={{position: 'absolute', left: 0, right: 0, bottom: -44, textAlign: 'center', ...font, fontSize: 26, color: YELLOW, textShadow: '0 3px 0 #000'}}>{nm(pick)} SELECTED</div>}
      </div>
    );
  };
  const Wheel: React.FC<{t: number; t0: number; t1: number; slices: {label: string; frac: number; color: string; sub?: string}[]; pick: number; x: number; y: number; r?: number; seed?: number; edge?: boolean; id: string}> = ({t, t0, t1, slices, pick, x, y, r = 165, seed = 0, edge = false, id}) => {
    const appear = lerp(t, t0 - 0.25, t0 + 0.12, 0, 1, Easing.out(Easing.back(1.4))) * lerp(t, t1 + 0.7, t1 + 1.0, 1, 0);
    if (appear <= 0) return null;
    let acc = 0;
    const arcs = slices.map((sl) => { const a0 = acc; acc += sl.frac; return {...sl, a0, a1: acc}; });
    const tgt = arcs[pick];
    const within = 0.3 + ((seed * 0.37) % 0.4);
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
          <radialGradient id={`whs-${id}`} cx="50%" cy="50%" r="50%"><stop offset="55%" stopColor="rgba(255,255,255,0)" /><stop offset="100%" stopColor="rgba(0,0,0,0.22)" /></radialGradient>
          <filter id={`whf-${id}`} x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#000" floodOpacity="0.45" /></filter>
        </defs>
        <g transform={`translate(${R + 30},${R + 45})`}>
          <circle r={R + ring} fill="#141c2b" filter={`url(#whf-${id})`} />
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
            <circle r={R} fill={`url(#whs-${id})`} />
          </g>
          <circle r={R} fill="none" stroke="#fff" strokeWidth={3} />
          <circle r={24} fill="#141c2b" stroke="#fff" strokeWidth={3} />
          <circle r={9} fill={YELLOW} />
          <path d={`M-15,${-R - ring - 16} L15,${-R - ring - 16} L0,${-R + 10} Z`} fill="#fff" stroke="#141c2b" strokeWidth={3} strokeLinejoin="round" />
        </g>
      </svg>
    );
  };
  const ACTIONS = (TL.actions || [{label: 'WAR', frac: 0.6, color: '#e5484d'}, {label: 'ALLIANCE', frac: 0.2, color: '#12a594'}, {label: 'BLITZ', frac: 0.2, color: '#6e56cf'}]) as {label: string; frac: number; color: string}[];
  const actionIdx = (a: string) => Math.max(0, ACTIONS.findIndex((x) => x.label === a));
  const WX = 1590, WY = 620;
  const FINAL_T = (CHAP.find((c) => c[1].includes('FINAL')) || [1e9])[0] as number;
  const edgeFight = (tRes: number) => tRes >= FINAL_T || Math.floor(Math.abs(Math.sin(tRes * 12.9898) * 43758.5453) * 10) % 5 === 0;
  const pct = (x: number) => (x * 100).toFixed(1) + '%';
  const VSBar: React.FC<{t: number; f: any; tr: any}> = ({t, f, tr}) => {
    const k = lerp(t, f.tVs - 0.15, f.tVs + 0.2, 0, 1, Easing.out(Easing.cubic));
    const pa = f.pa / (f.pa + f.pb);
    const res = t >= f.tRes;
    const attWins = f.win === tr.att || f.attM.includes(f.win);
    const W = attWins ? tr.att : f.def_, L = attWins ? f.def_ : tr.att;
    const side = (code: string, power: number, right: boolean, team: string[]) => (
      <div style={{display: 'flex', alignItems: 'center', gap: 14, flexDirection: right ? 'row-reverse' : 'row', width: 400}}>
        <div style={{display: 'flex', gap: 4}}>{team.slice(0, 3).map((c) => <HFlag key={c} code={c} w={54} h={36} />)}</div>
        <div style={{textAlign: right ? 'right' : 'left'}}>
          <div style={{...font, fontSize: 32, color: res && code === L ? '#8a93a3' : '#fff', whiteSpace: 'nowrap', textDecoration: res && code === L ? 'line-through' : 'none'}}>{team.length > 2 ? (right ? 'TEAM B' : 'TEAM A') : team.length > 1 ? team.map((c) => nm(c)).join(' + ') : nm(code)}</div>
          <div style={{...font2, fontSize: 17, color: '#cdd6e2'}}>{fmt(power)} {UNIT}</div>
        </div>
      </div>
    );
    const gainTxt = f.gain ? ` · +${fmt(f.gain)} ${HUD.powerWord || 'POWER'}` : '';
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
            <div style={{width: `${pa * 100}%`, background: 'linear-gradient(#ff5a54,#c8262b)', ...font2, fontSize: 15, color: '#fff', paddingLeft: 10, lineHeight: '20px', whiteSpace: 'nowrap'}}>{pct(pa)} WIN</div>
            <div style={{flex: 1, background: 'linear-gradient(#4a90ff,#1d4fbf)', ...font2, fontSize: 15, color: '#fff', textAlign: 'right', paddingRight: 10, lineHeight: '20px', whiteSpace: 'nowrap'}}>{pct(1 - pa)} WIN</div>
          </div>
          {res && <div style={{textAlign: 'center', ...font2, fontSize: 18, color: YELLOW, marginTop: 6}}>{f.resTxt || (f.attM.length > 2 ? `${attWins ? 'TEAM A' : 'TEAM B'} TAKES 3 COUNTRIES` : f.tp && f.tpName ? `${nm(W)} ${attWins ? 'TAKES' : 'DEFENDS'} ${f.tpName}` : `${nm(W)} CONQUERED ${nm(L)}`)}{gainTxt}</div>}
        </Panel>
      </div>
    );
  };
  const TurnHUD: React.FC<{t: number}> = ({t}) => {
    const tr = turnAt(t);
    if (!tr || tr.kind !== 'turn') return null;
    const out: React.ReactNode[] = [];
    const SX = HUD.top5 || TL.teamBoard ? 400 : 140;
    if (tr.slot !== false) out.push(<Slot key="sl" t={t} t0={tr.tSel} t1={tr.tZoom - 0.15} pick={tr.att} x={SX} y={190} seed={tr.att.charCodeAt(0)} pool={tr.pool} />);
    if (tr.slot2) out.push(<Slot key="sl2" t={t} t0={tr.tSel} t1={tr.tZoom + 0.35} pick={tr.slot2.pick} x={1920 - 140 - 420} y={190} seed={tr.slot2.pick.charCodeAt(0) + 3} pool={tr.slot2.pool} />);
    const firstDir = tr.fights[0]?.tDir ?? tr.tPick ?? tr.t1;
    if (tr.ewheel !== false) out.push(<Wheel key="ew" id="ew" t={t} t0={tr.tWheel} t1={firstDir - 0.75} slices={ACTIONS} pick={actionIdx(tr.action)} x={WX} y={WY} r={165} seed={tr.att.charCodeAt(1)} />);
    if (tr.action === 'ALLIANCE') {
      const pool = aliveListAt(tr.tPick).filter((c) => c !== tr.att);
      out.push(<Slot key="ps" t={t} t0={tr.tPick} t1={tr.tAlly - 0.4} pick={tr.partner} x={SX} y={190} seed={3} pool={pool} />);
      if (t >= tr.tAlly) {
        const k = popT(t, tr.tAlly + 0.6);
        out.push(
          <div key="ab" style={{position: 'absolute', left: 0, right: 0, bottom: 70, display: 'flex', justifyContent: 'center', transform: `scale(${k})`}}>
            <Panel border="#4fc3ff" style={{padding: '14px 34px 8px', display: 'flex', alignItems: 'center', gap: 18}}>
              <HFlag code={tr.att} w={70} h={48} /><span style={{...font, fontSize: 44, color: '#fff'}}>+</span><HFlag code={tr.partner} w={70} h={48} />
              <div style={{...font, fontSize: 44, color: '#4fc3ff', marginLeft: 10}}>ALLIED!</div>
              <div style={{...font2, fontSize: 24, color: '#fff', marginLeft: 10}}>{HUD.powerWord || 'POWER'} <span style={{color: YELLOW, ...font, fontSize: 36}}>{fmt(tr.power)}</span></div>
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
      out.push(<Wheel key="vw" id="vw" t={t} t0={f.tVs} t1={f.tRes - 0.15} slices={[{label: `${(pa * 100).toFixed(1)}%`, frac: pa, color: '#e5484d', sub: nm(tr.att)}, {label: `${((1 - pa) * 100).toFixed(1)}%`, frac: 1 - pa, color: '#2f6fe4', sub: nm(f.def_)}]} pick={attWins ? 0 : 1} x={WX} y={WY} r={165} seed={f.def_.charCodeAt(0)} edge={f.edge ?? edgeFight(f.tRes)} />);
    }
    return <>{out}</>;
  };
  const GainPop: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
    if (HUD.gain === false) return null;
    const g = PW.filter(([tp, , , gain]) => gain > 0 && t >= tp && t < tp + 2.2);
    return (
      <>
        {g.slice(-3).map(([tp, c, , gain]) => {
          const [x, y] = toS(ownerPos(c, doneK(t)), cam);
          const k = popT(t, tp);
          const up = lerp(t, tp, tp + 2.2, 0, -60);
          const a = lerp(t, tp + 1.7, tp + 2.2, 1, 0);
          return (
            <div key={`${tp}${c}`} style={{position: 'absolute', left: Math.max(120, Math.min(1800, x)), top: Math.max(160, Math.min(1000, y - 70 + up)), transform: `translate(-50%,-50%) scale(${k})`, opacity: a, background: 'rgba(16,24,38,0.92)', border: `3px solid ${GREEN}`, borderRadius: 14, padding: '8px 18px 4px', ...font, fontSize: 34, color: '#62f08f', whiteSpace: 'nowrap'}}>+{fmt(gain)} <span style={{...font2, fontSize: 18, color: '#fff'}}>{HUD.powerWord || 'POWER'}</span></div>
          );
        })}
      </>
    );
  };
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
            <div style={{...font, fontSize: 52, color: '#fff', WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill'}}>{tr.A.length} VS {tr.A.length} · ANYWHERE ON THE MAP</div>
          </div>
        </AbsoluteFill>,
      );
    }
    const pool = aliveListAt(tr.tSel);
    const nA = tr.A.length;
    tr.A.forEach((c: string, i: number) => out.push(<Slot key={`s${i}`} t={t} t0={tr.tSel} t1={tr.tSel + 1.6 + i * 0.6} pick={c} x={(1920 - nA * 580) / 2 + 40 + i * 580} y={260} w={500} seed={i + 2} pool={pool} />));
    if (t >= tr.tVs - 0.15) {
      const f = {tVs: tr.tVs, tRes: tr.tRes, pa: tr.pa, pb: tr.pb, win: tr.win === 'A' ? tr.A[0] : tr.D[0], attM: tr.A, defM: tr.D, def_: tr.D[0], gain: tr.gains.reduce((s: number, x: number) => s + x, 0), resTxt: tr.resTxt};
      out.push(<VSBar key="vs" t={t} f={f} tr={{att: tr.A[0]}} />);
      const pa = tr.pa / (tr.pa + tr.pb);
      out.push(<Wheel key="vw" id="vw3" t={t} t0={tr.tVs} t1={tr.tRes - 0.15} slices={[{label: `${(pa * 100).toFixed(1)}%`, frac: pa, color: '#e23c3c', sub: 'TEAM A'}, {label: `${((1 - pa) * 100).toFixed(1)}%`, frac: 1 - pa, color: '#1f6fe0', sub: 'TEAM B'}]} pick={tr.win === 'A' ? 0 : 1} x={WX} y={WY} r={165} seed={5} edge={edgeFight(tr.tRes)} />);
    }
    return <>{out}</>;
  };
  const PurgeFeed: React.FC<{t: number}> = ({t}) => {
    const tr = turnAt(t);
    if (!tr || tr.kind !== 'purge') return null;
    const fallen = ELIMS.filter(([, te]) => te >= tr.t0 && te <= tr.t1);
    if (!fallen.length) return null;
    const te = fallen[0][1];
    if (t < te - 0.1) return null;
    const k = popT(t, te, 13);
    const out = lerp(t, tr.t1 - 0.4, tr.t1 + 0.2, 1, 0);
    const list = fallen.map((e) => e[0]);
    const n = Math.round(lerp(t, te, te + 0.9, 0, list.length));
    return (
      <div style={{position: 'absolute', left: 30, top: 140, width: 520, opacity: out, transform: `scale(${k})`, transformOrigin: 'left top'}}>
        <Panel border={RED} style={{padding: '12px 18px 10px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <span style={{fontSize: 38}}>💀</span><span style={{...font, fontSize: 52, color: '#ff6b63'}}>{n}</span><span style={{...font2, fontSize: 20, color: '#fff'}}>{tr.feed || 'COUNTRIES WIPED OUT'}</span>
          </div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8}}>
            {list.slice(0, 60).map((c, i) => {
              const kk = lerp(t, te + i * 0.012, te + i * 0.012 + 0.25, 0, 1, Easing.out(Easing.back(1.6)));
              return (
                <div key={c} style={{position: 'relative', transform: `scale(${kk})`}}>
                  <HFlag code={c} w={36} h={24} />
                  <svg width={36} height={24} style={{position: 'absolute', left: 0, top: 0}}><line x1={4} y1={4} x2={32} y2={20} stroke="#ff3b30" strokeWidth={3} /><line x1={32} y1={4} x2={4} y2={20} stroke="#ff3b30" strokeWidth={3} /></svg>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    );
  };
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
          <div style={{...font, fontSize: a.length > 18 ? 96 : 120, color: ch ? '#fff' : YELLOW, WebkitTextStroke: `9px ${INK}`, paintOrder: 'stroke fill', textShadow: '0 10px 0 rgba(0,0,0,0.5)', whiteSpace: 'nowrap'}}>{a}</div>
          {b && <div style={{display: 'inline-block', marginTop: 10, background: YELLOW, border: `5px solid ${INK}`, borderRadius: 16, padding: '8px 30px 2px', ...font, fontSize: 44, color: INK}}>{b}</div>}
        </div>
      </AbsoluteFill>
    );
  };
  const OUT_TXT: React.CSSProperties = {WebkitTextStroke: `7px ${INK}`, paintOrder: 'stroke fill', textShadow: '0 6px 0 rgba(0,0,0,0.4)'};
  // tarjeta de título (intro corta)
  const TitleCard: React.FC<{t: number}> = ({t}) => {
    const tc = TL.titleCard;
    if (!tc) return null;
    const [t0, t1, l1, l2, sub] = tc;
    if (t < t0 - 0.1 || t > t1 + 0.3) return null;
    const k = popT(t, t0, 12), o = lerp(t, t1 - 0.25, t1 + 0.25, 1, 0);
    return (
      <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: `rgba(10,30,60,${0.3 * o})`}}>
        <div style={{transform: `scale(${k})`, opacity: o, textAlign: 'center'}}>
          <div style={{...font, fontSize: 96, color: '#fff', ...OUT_TXT, lineHeight: 1.05}}>{l1}</div>
          <div style={{...font, fontSize: 118, color: YELLOW, ...OUT_TXT, WebkitTextStroke: `9px ${INK}`, lineHeight: 1.05}}>{l2}</div>
          {sub && <div style={{...font, fontSize: 40, color: '#fff', ...OUT_TXT, marginTop: 14}}>{sub}</div>}
        </div>
      </AbsoluteFill>
    );
  };
  // reglas: tarjeta grande y luego cabecera fija
  const RULES = (TL.rules || []) as [number, number, number, string, string, string?][];
  const RuleHUD: React.FC<{t: number}> = ({t}) => {
    const r = RULES.find(([t0, t1]) => t >= t0 && t < t1);
    if (!r) return null;
    const trr = turnAt(t);
    const ff = fightAt(trr, t);
    if (ff && t >= ff.tVs - 0.3 && t >= r[0] + 2.6) return null;
    const [t0, t1, n, a, b, icon] = r;
    const big = t < t0 + 2.6;
    if (big) {
      const k = popT(t, t0, 11), o = lerp(t, t0 + 2.2, t0 + 2.6, 1, 0);
      return (
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: `rgba(8,14,28,${0.5 * o})`}}>
          <div style={{transform: `scale(${k})`, opacity: o, textAlign: 'center', maxWidth: 1700}}>
            <div style={{display: 'inline-block', background: RED, border: `5px solid ${INK}`, borderRadius: 16, padding: '6px 30px 0', ...font, fontSize: 48, color: '#fff'}}>{HUD.ruleWord ?? 'RULE'} {HUD.noHash ? '' : '#'}{n}</div>
            <div style={{...font, fontSize: a.length > 30 ? 78 : 96, color: '#fff', ...OUT_TXT, WebkitTextStroke: `9px ${INK}`, lineHeight: 1.05, marginTop: 12}}>{icon ? icon + ' ' : ''}{a}</div>
            {b && <div style={{...font, fontSize: 64, color: YELLOW, ...OUT_TXT, WebkitTextStroke: `8px ${INK}`, marginTop: 8}}>{b}</div>}
          </div>
        </AbsoluteFill>
      );
    }
    const k = popT(t, t0 + 2.5, 12);
    return (
      <div style={{position: 'absolute', left: 0, right: 0, top: 24, display: 'flex', justifyContent: 'center', transform: `scale(${k})`, opacity: lerp(t, t1 - 0.3, t1, 1, 0)}}>
        <Panel border={RED} style={{padding: '10px 26px 6px', display: 'flex', alignItems: 'center', gap: 16, maxWidth: 1180}}>
          <div style={{background: RED, borderRadius: 10, padding: '4px 14px 0', ...font, fontSize: 30, color: '#fff', whiteSpace: 'nowrap'}}>{HUD.noHash ? '' : '#'}{n}</div>
          <div style={{...font, fontSize: 34, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{icon ? icon + ' ' : ''}{a} <span style={{color: YELLOW}}>{b}</span></div>
        </Panel>
      </div>
    );
  };
  // chips de contador ("23 COUNTRIES MARKED")
  const CHIPS = (TL.chips || []) as [number, number, string, string?][];
  const Chips: React.FC<{t: number}> = ({t}) => {
    const c = CHIPS.filter(([t0, t1]) => t >= t0 && t < t1).slice(-1)[0];
    if (!c) return null;
    const [t0, t1, txt, col] = c;
    const k = popT(t, t0, 11), o = lerp(t, t1 - 0.3, t1, 1, 0);
    return (
      <div style={{position: 'absolute', left: 0, right: 0, top: 128, display: 'flex', justifyContent: 'center', transform: `scale(${k})`, opacity: o}}>
        <div style={{background: col || YELLOW, border: `4px solid ${INK}`, borderRadius: 14, padding: '6px 24px 0', ...font, fontSize: 36, color: col ? '#fff' : INK, whiteSpace: 'nowrap', boxShadow: '0 6px 0 rgba(0,0,0,0.35)'}}>{txt}</div>
      </div>
    );
  };
  // subtítulos de la narración
  const SUBS = (TL.subs || []) as [number, number, string][];
  const Subs: React.FC<{t: number}> = ({t}) => {
    const s = SUBS.find(([t0, t1]) => t >= t0 && t < t1);
    if (!s) return null;
    const [t0, t1, txt] = s;
    const o = lerp(t, t0, t0 + 0.12, 0, 1) * lerp(t, t1 - 0.12, t1, 1, 0);
    return (
      <div style={{position: 'absolute', left: 140, right: 140, bottom: 64, display: 'flex', justifyContent: 'center', opacity: o}}>
        <div style={{background: 'rgba(10,14,24,0.72)', borderRadius: 14, padding: '8px 22px 4px', ...font, fontSize: 40, color: '#fff', textAlign: 'center', lineHeight: 1.15, WebkitTextStroke: `1px ${INK}`}}>{txt}</div>
      </div>
    );
  };
  // etiquetas sobre el mapa: [t0, t1, x, y, text, color?]
  const LABELS = (TL.labels || []) as [number, number, number, number, string, string?][];
  const MapLabels: React.FC<{t: number; cam: Cam}> = ({t, cam}) => (
    <>
      {LABELS.filter(([t0, t1]) => t >= t0 && t < t1).map(([t0, t1, x, y, txt, col], i) => {
        const [sx, sy] = toS([x, y], cam);
        if (sx < -200 || sx > 2120 || sy < -100 || sy > 1180) return null;
        const k = popT(t, t0, 12), o = lerp(t, t1 - 0.25, t1, 1, 0);
        return <div key={i} style={{position: 'absolute', left: sx, top: sy, transform: `translate(-50%,-50%) scale(${k})`, opacity: o, background: col || INK, border: `3px solid ${YELLOW}`, borderRadius: 12, padding: '5px 16px 1px', ...font, fontSize: 28, color: '#fff', whiteSpace: 'nowrap'}}>{txt}</div>;
      })}
    </>
  );
  const Victory: React.FC<{t: number}> = ({t}) => {
    if (t < WIN_T + 0.6) return null;
    const k = popT(t, WIN_T + 0.6, 10);
    const q = t > DUR - 3.2;
    const Q = (TL.question || ['WHICH COUNTRY', 'SHOULD HAVE WON?']) as string[];
    return (
      <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(8,14,28,0.45)'}}>
        {!q ? (
          <div style={{transform: `scale(${k})`, textAlign: 'center'}}>
            <div style={{fontSize: 150}}>🏆</div>
            <div style={{display: 'inline-flex', alignItems: 'center', gap: 22, background: YELLOW, border: `7px solid ${INK}`, borderRadius: 22, padding: '12px 40px 4px'}}>
              <HFlag code={WINNER} w={110} h={74} />
              <span style={{...font, fontSize: nm(WINNER).length > 14 ? 76 : 96, color: INK, whiteSpace: 'nowrap'}}>{nm(WINNER)} {TL.winWord || 'WINS!'}</span>
            </div>
            {TL.winSub !== '' && <div style={{...font, fontSize: 40, color: '#fff', ...OUT_TXT, marginTop: 16}}>{TL.winSub || `${fmt(powerAt(WINNER, t))} ${UNIT} · ${ALIVE0.length - 1} DEFEATED`}</div>}
          </div>
        ) : (
          <div style={{transform: `scale(${popT(t, DUR - 3.2, 10)})`, textAlign: 'center'}}>
            <div style={{...font, fontSize: 104, color: '#fff', ...OUT_TXT, WebkitTextStroke: `9px ${INK}`}}>{Q[0]}</div>
            <div style={{...font, fontSize: 104, color: YELLOW, ...OUT_TXT, WebkitTextStroke: `9px ${INK}`}}>{Q[1]}</div>
          </div>
        )}
      </AbsoluteFill>
    );
  };
  const Credit = () => (TL.credit ? <div style={{position: 'absolute', right: 16, bottom: 10, background: 'rgba(15,25,40,0.6)', color: '#fff', borderRadius: 10, padding: '4px 12px', ...font2, fontWeight: 600, fontSize: 15}}>{TL.credit}</div> : null);
  const SEA0 = '#2f7fc4';
  const Sea: React.FC<{t: number}> = ({t}) => (
    <svg width={1920} height={1080} style={{position: 'absolute'}}>
      <defs>
        <radialGradient id="xsea" cx="50%" cy="45%" r="75%"><stop offset="0%" stopColor="#3a8fd3" /><stop offset="100%" stopColor="#1b5796" /></radialGradient>
        <pattern id="xwav" width={140} height={46} patternUnits="userSpaceOnUse" patternTransform={`translate(${(t * 10.5) % 140},0)`}><path d="M0,23 C17,13 35,13 52,23 S87,33 105,23 S122,13 140,23" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={3} /></pattern>
      </defs>
      <rect width={1920} height={1080} fill="url(#xsea)" /><rect width={1920} height={1080} fill="url(#xwav)" />
    </svg>
  );
  // destello en los cortes de cámara
  const CutFlash: React.FC<{t: number}> = ({t}) => {
    const c = ((TL.cuts || []) as number[]).find((x) => t >= x && t < x + 0.18);
    if (c === undefined) return null;
    return <AbsoluteFill style={{background: '#fff', opacity: lerp(t, c, c + 0.18, 0.35, 0)}} />;
  };
  const Comp: React.FC = () => {
    usePreload();
    const t = useCurrentFrame() / FPS;
    const cam = camera(t);
    return (
      <AbsoluteFill style={{background: SEA0, overflow: 'hidden'}}>
        <Sea t={t} />
        <WorldMap t={t} cam={cam} />
        <MapLabels t={t} cam={cam} />
        <GainPop t={t} cam={cam} />
        <AliveBox t={t} />
        <Top5 t={t} />
        <TeamBoard t={t} />
        <KillFeed t={t} />
        <StatusBar t={t} />
        <TurnHUD t={t} />
        <Ev3HUD t={t} />
        <PurgeFeed t={t} />
        <RuleHUD t={t} />
        <Chips t={t} />
        <BigCard t={t} />
        <TitleCard t={t} />
        <Subs t={t} />
        <Victory t={t} />
        <CutFlash t={t} />
        <Credit />
      </AbsoluteFill>
    );
  };
  // versión 1280x720: misma escena escalada
  const Comp720: React.FC = () => (
    <AbsoluteFill style={{overflow: 'hidden', background: SEA0}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: 'scale(0.6666667)', transformOrigin: '0 0'}}>
        <Comp />
      </div>
    </AbsoluteFill>
  );
  return {Comp, Comp720, frames, fps: FPS};
};
