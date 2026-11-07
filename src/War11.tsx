import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, delayRender, continueRender} from 'remotion';
import RASTER from './wflags-raster.json';
import {geoNaturalEarth1, geoPath} from 'd3-geo';
import {mesh} from 'topojson-client';
import WORLD from './world.json';
import TOPO from './worldtopo.json';
import WFLAGS from './wflags.json';
import TLJ from './bra-tl.json';
const TL = TLJ as any;
import {P, Cam, INK, CREAM, RED, BLUE, GREEN, YELLOW, ORANGE, clamp, ease, lerp, fmt, font, font2, popT, piece, arcPath, partial, PathArrow, Mover, Boom, Face, Mood, Bubble, Avatar} from './lib3';
import {Soldier, Side, Swords, UnitIcon, Ocean} from './War5';

// ================= datos =================
export type Piece = {code: string; cont: string; d: string; bbox: number[]; c: P; area: number};
type Player = {code: string; name: string; area: number; home: P; cont: string};
export const PIECES = (WORLD as any).pieces as Piece[];
export const PL = (WORLD as any).players as Record<string, Player>;
export const CODES = Object.keys(PL);
const FL = WFLAGS as unknown as Record<string, {vb: number[]; body: string}>;
export const EVENTS = (TL.events as [number, string, string][]).map(([t, w, l]) => ({t, w, l}));
type Battle = {t0: number; t1: number; title: string; banner: string; att: string[]; def: string[]; A: number[]; D: number[]; bar: string; units?: string; prog?: [number, number][]; good?: boolean};
export const BATTLES = TL.battles as Battle[];
export const TOTAL_AREA = PIECES.reduce((s, p) => s + p.area, 0);
export const D = 1.1; // duración de la conquista (relleno de bandera)
export const nameOf = (c: string) => PL[c]?.name || c;

// estado de propietarios tras k conquistas
const OWNERS: Record<string, string>[] = [Object.fromEntries(CODES.map((c) => [c, c]))];
EVENTS.forEach((e, i) => {
  const prev = OWNERS[i], next: Record<string, string> = {};
  for (const c of CODES) next[c] = prev[c] === e.l ? e.w : prev[c];
  OWNERS.push(next);
});
const doneCount = (t: number) => { let k = 0; while (k < EVENTS.length && EVENTS[k].t + D <= t) k++; return k; };
export const firedCount = (t: number) => { let k = 0; while (k < EVENTS.length && EVENTS[k].t <= t) k++; return k; };
export const elimT: Record<string, number> = Object.fromEntries(EVENTS.map((e) => [e.l, e.t]));
const kills: Record<string, number> = {};
EVENTS.forEach((e) => (kills[e.w] = (kills[e.w] || 0) + 1));

// ================= cámara =================
const CAMK = TL.cam as [number, number, number, number][];
const SHAKE: [number, number][] = [...(TL.booms as number[]).map((b) => [b, 7] as [number, number]), ...EVENTS.map((e) => [e.t, 1.6] as [number, number]), ...(TL.stamps as any[]).map((s) => [s.t, 4] as [number, number])];
export const camera = (t: number): Cam => {
  let i = 0;
  while (i < CAMK.length - 1 && t >= CAMK[i + 1][0]) i++;
  const [ta, xb, yb, sb] = CAMK[i];
  const [, xa, ya, sa] = CAMK[Math.max(0, i - 1)];
  const k = i === 0 ? 1 : lerp(t, ta, ta + 2.4, 0, 1, ease);
  let cx = xa + (xb - xa) * k, cy = ya + (yb - ya) * k;
  const s = sa * Math.pow(sb / sa, k);
  for (const [h, amp] of SHAKE) { const d = t - h; if (d >= 0 && d < 0.35) { const a = ((1 - d / 0.35) * amp) / s; cx += Math.sin(d * 93) * a; cy += Math.cos(d * 69) * a; } }
  // no salir del mapa
  const hw = 960 / s, hh = 540 / s;
  cx = Math.max(hw - 10, Math.min(1930 - hw, cx));
  cy = Math.max(hh - 10, Math.min(1090 - hh, cy));
  return {cx, cy, s};
};

// ================= imperios (cachés por estado) =================
type Cluster = {key: string; owner: string; cont: string; pieces: Piece[]; bbox: number[]};
const union = (a: number[], b: number[]) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])];
const clusterCache = new Map<number, Map<string, Cluster>>();
const clustersOf = (k: number) => {
  let m = clusterCache.get(k);
  if (m) return m;
  m = new Map();
  const own = OWNERS[k];
  for (const p of PIECES) {
    const o = own[p.code], key = `${o}|${p.cont}`;
    const c = m.get(key);
    if (c) { c.pieces.push(p); c.bbox = union(c.bbox, p.bbox); } else m.set(key, {key, owner: o, cont: p.cont, pieces: [p], bbox: [...p.bbox]});
  }
  clusterCache.set(k, m);
  return m;
};
export const proj = geoNaturalEarth1().scale((WORLD as any).pr.scale).translate((WORLD as any).pr.translate as [number, number]);
const gpath = geoPath(proj);
const rd = (d: string | null) => (d || '').replace(/(\d+\.\d+)/g, (x) => String(Math.round(parseFloat(x) * 10) / 10));
export const OBJ = (TOPO as any).objects.countries;
export type Seg = {d: string; b: number[]};
const splitWrap = (line: number[][]): [number, number][][] => {
  const pts = line.map((c) => proj(c as [number, number])!).filter(Boolean) as [number, number][];
  const out: [number, number][][] = [[]];
  pts.forEach((p, i) => { if (i && Math.abs(p[0] - pts[i - 1][0]) > 400) out.push([]); out[out.length - 1].push(p); });
  return out.filter((x) => x.length > 1);
};
export const segs = (ml: any): Seg[] => (ml.coordinates as number[][][]).flatMap(splitWrap).map((pts) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const d = 'M' + pts.map(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); return `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`; }).join('L');
  return {d, b: [x0, y0, x1, y1]};
});
const COAST = segs(mesh(TOPO as any, OBJ, (a: any, b: any) => a === b));
const borderCache = new Map<number, {outer: Seg[]; inner: Seg[]}>();
const bordersOf = (k: number) => {
  let b = borderCache.get(k);
  if (b) return b;
  const own = OWNERS[k];
  const outer = segs(mesh(TOPO as any, OBJ, (a: any, c: any) => a !== c && own[a.properties.code] !== own[c.properties.code]));
  const inner = segs(mesh(TOPO as any, OBJ, (a: any, c: any) => a !== c && a.properties.code !== c.properties.code && own[a.properties.code] === own[c.properties.code]));
  b = {outer, inner};
  borderCache.set(k, b);
  return b;
};
export const visD = (ss: Seg[], vis: (b: number[]) => boolean) => ss.filter((x) => vis(x.b)).map((x) => x.d).join('');
const areaOf = (k: number) => {
  const a: Record<string, number> = {};
  for (const p of PIECES) { const o = OWNERS[k][p.code]; a[o] = (a[o] || 0) + p.area; }
  return a;
};
const areaCache = new Map<number, Record<string, number>>();
const areas = (k: number) => { let a = areaCache.get(k); if (!a) { a = areaOf(k); areaCache.set(k, a); } return a; };
// área con las conquistas en curso interpoladas
export const areasAt = (t: number) => {
  const k = doneCount(t), a = {...areas(k)};
  for (let i = k; i < EVENTS.length && EVENTS[i].t <= t; i++) {
    const e = EVENTS[i], q = Math.min(1, (t - e.t) / D), la = a[e.l] || 0;
    a[e.w] = (a[e.w] || 0) + la * q; a[e.l] = la * (1 - q);
  }
  return a;
};
const nearestOwned = (k: number, owner: string, to: P): P => {
  let best: P = PL[owner].home, bd = Infinity;
  for (const p of PIECES) if (OWNERS[k][p.code] === owner) { const d = Math.hypot(p.c[0] - to[0], p.c[1] - to[1]); if (d < bd) { bd = d; best = p.c; } }
  return best;
};
const kAt = (t: number) => doneCount(t);
// datos fijos por evento: punto de ataque
const EV = EVENTS.map((e, i) => {
  const vic = PL[e.l].home;
  const from = nearestOwned(i, e.w, vic);
  const vp = PIECES.filter((p) => OWNERS[i][p.code] === e.l);
  const vb = vp.reduce((b, p) => union(b, p.bbox), [...vp[0].bbox]);
  const half = Math.hypot(vb[2] - vb[0], vb[3] - vb[1]) / 2;
  const dx = from[0] - vic[0], dy = from[1] - vic[1], dl = Math.hypot(dx, dy) || 1;
  const off = Math.min(dl, half * 0.9);
  const A: P = [vic[0] + (dx / dl) * off, vic[1] + (dy / dl) * off];
  const R = Math.max(...[[vb[0], vb[1]], [vb[2], vb[1]], [vb[0], vb[3]], [vb[2], vb[3]]].map(([x, y]) => Math.hypot(x - A[0], y - A[1]))) * 1.05;
  return {...e, from, vic, A, R, vb};
});

// ================= banderas =================
const RS = RASTER as Record<string, string>;
export const FlagSvg: React.FC<{code: string; b: number[]}> = ({code, b}) => {
  if (RS[code]) return <image href={RS[code]} x={b[0]} y={b[1]} width={Math.max(1, b[2] - b[0])} height={Math.max(1, b[3] - b[1])} preserveAspectRatio="none" />;
  const f = FL[code];
  if (!f) return null;
  const [vx, vy, vw, vh] = f.vb;
  const w = Math.max(1, b[2] - b[0]), h = Math.max(1, b[3] - b[1]);
  return <g transform={`translate(${b[0]},${b[1]}) scale(${w / vw},${h / vh}) translate(${-vx},${-vy})`} dangerouslySetInnerHTML={{__html: f.body}} />;
};
export const fitFlagBox = (b: number[]) => {
  // que la bandera no se deforme demasiado: proporción entre 1:1 y 2:1
  let [x0, y0, x1, y1] = b; const w = x1 - x0, h = y1 - y0;
  if (w / h > 2.2) { const nh = w / 2.2; y0 -= (nh - h) / 2; y1 += (nh - h) / 2; }
  if (h / w > 1.1) { const nw = h * 1.1; x0 -= (nw - w) / 2; x1 += (nw - w) / 2; }
  return [x0, y0, x1, y1];
};
export const WFlag: React.FC<{code: string; w?: number; h?: number; round?: boolean}> = ({code, w = 54, h = 36, round}) => (
  <div style={{width: w, height: h, borderRadius: round ? '50%' : 5, border: `3px solid ${INK}`, overflow: 'hidden', flexShrink: 0, background: '#ddd'}}>
    <Img src={staticFile(`wflags/${code.toLowerCase()}.svg`)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
  </div>
);

// ================= mapa =================
export type WVP = {W: number; H: number; ox: number; oy: number; ui: number};
const WVP0: WVP = {W: 1920, H: 1080, ox: 960, oy: 540, ui: 1};
export const WorldMap: React.FC<{t: number; cam: Cam; dbg?: Record<string, boolean>; vp?: WVP}> = ({t, cam, dbg = {}, vp = WVP0}) => {
  const {cx, cy, s} = cam;
  const vx0 = cx - vp.ox / s - 20, vx1 = cx + (vp.W - vp.ox) / s + 20, vy0 = cy - vp.oy / s - 20, vy1 = cy + (vp.H - vp.oy) / s + 20;
  const vis = (b: number[]) => b[2] > vx0 && b[0] < vx1 && b[3] > vy0 && b[1] < vy1;
  const k = kAt(t);
  const base = clustersOf(k);
  const bb = new Map<string, number[]>();
  base.forEach((c) => bb.set(c.key, c.bbox));
  const overlays: {e: (typeof EV)[number]; q: number; groups: {cont: string; pieces: Piece[]; key: string}[]}[] = [];
  for (let i = k; i < EVENTS.length && EVENTS[i].t <= t; i++) {
    const e = EV[i], q = Easing.inOut(Easing.cubic)(Math.min(1, (t - e.t) / D));
    const vp = PIECES.filter((p) => OWNERS[k][p.code] === e.l);
    const groups: Record<string, Piece[]> = {};
    vp.forEach((p) => (groups[p.cont] = groups[p.cont] || []).push(p));
    const gl = Object.entries(groups).map(([cont, pieces]) => {
      const key = `${e.w}|${cont}`;
      const gb = pieces.reduce((b, p) => union(b, p.bbox), [...pieces[0].bbox]);
      const cur = bb.get(key);
      if (cur) { const u = union(cur, gb); bb.set(key, cur.map((v, j) => v + (u[j] - v) * q)); } else bb.set(key, gb);
      return {cont, pieces, key};
    });
    overlays.push({e, q, groups: gl});
  }
  const brd = bordersOf(k);
  const inv = vp.ui / s;
  const clusters = [...base.values()].filter((c) => c.pieces.some((p) => vis(p.bbox)));
  return (
    <svg width={vp.W} height={vp.H} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        {clusters.map((c) => <clipPath key={c.key} id={`cl-${c.key.replace('|', '-')}`}>{c.pieces.filter((p) => vis(p.bbox)).map((p, i) => <path key={i} d={p.d} />)}</clipPath>)}
        {overlays.map(({e, q, groups}) => (
          <React.Fragment key={e.l}>
            {groups.map((g) => <clipPath key={g.cont} id={`ov-${e.l}-${g.cont}`}>{g.pieces.map((p, i) => <path key={i} d={p.d} />)}</clipPath>)}
            <mask id={`mk-${e.l}`} maskUnits="userSpaceOnUse" x={e.vb[0] - 20} y={e.vb[1] - 20} width={e.vb[2] - e.vb[0] + 40} height={e.vb[3] - e.vb[1] + 40}>
              <circle cx={e.A[0]} cy={e.A[1]} r={e.R * q} fill="white" />
            </mask>
          </React.Fragment>
        ))}
      </defs>
      <g transform={`translate(${vp.ox},${vp.oy}) scale(${s}) translate(${-cx},${-cy})`}>
        {!dbg.noShadow && <g transform="translate(1.5,2.2)" opacity={0.32}>{PIECES.filter((p) => vis(p.bbox)).map((p, i) => <path key={i} d={p.d} fill="#06213f" />)}</g>}
        {!dbg.noFlags && clusters.map((c) => <g key={c.key} clipPath={`url(#cl-${c.key.replace('|', '-')})`}><FlagSvg code={c.owner} b={fitFlagBox(bb.get(c.key)!)} /></g>)}
        {overlays.map(({e, groups}) => (
          <g key={e.l} mask={`url(#mk-${e.l})`}>
            {groups.map((g) => <g key={g.cont} clipPath={`url(#ov-${e.l}-${g.cont})`}><FlagSvg code={e.w} b={fitFlagBox(bb.get(g.key)!)} /></g>)}
          </g>
        ))}
        {overlays.map(({e, q}) => <circle key={`r${e.l}`} cx={e.A[0]} cy={e.A[1]} r={e.R * q} fill="none" stroke="#fff" strokeWidth={3 * inv} opacity={0.8 * (1 - q)} />)}
        {!dbg.noBorders && <><path d={visD(brd.inner, vis)} fill="none" stroke="#5d6470" strokeWidth={0.9 * inv} />
        <path d={visD(COAST, vis)} fill="none" stroke={INK} strokeWidth={1.6 * inv} />
        <path d={visD(brd.outer, vis)} fill="none" stroke={INK} strokeWidth={2.4 * inv} /></>}
        <Pacts t={t} inv={inv} />
        {EV.filter((e) => t > e.t - 1.8 && t < e.t + 1.6).map((e) => {
          const dist = Math.hypot(e.vic[0] - e.from[0], e.vic[1] - e.from[1]);
          if (dist < 4) return null;
          const pts = arcPath(e.from, e.vic, Math.min(40, dist * 0.18));
          return <PathArrow key={`a${e.l}`} pts={pts} t={t} t0={e.t - 1.8} t1={e.t - 0.1} color="rgba(229,50,45,0.9)" w={Math.max(1.6, 4.5 * inv)} fadeAfter={1.4} />;
        })}
        <BattleUnits t={t} s={s / vp.ui} />
        {EV.filter((e) => t > e.t - 0.05 && t < e.t + 1.7 && vis(e.vb)).map((e) => <Boom key={`b${e.l}`} p={e.vic} t={t} at={e.t} r={Math.max(6, 22 * inv)} />)}
        {!dbg.noFaces && <Faces t={t} s={s} vis={vis} ui={vp.ui} />}
      </g>
    </svg>
  );
};

// pactos (alianzas temporales)
const Pacts: React.FC<{t: number; inv: number}> = ({t, inv}) => (
  <>
    {(TL.pacts as [number, number, string, string][]).map((p, i) => [...p, i] as [number, number, string, string, number]).filter(([a, b]) => t > a && t < b + 0.6).map(([a, b, x, y, pi]) => {
      const pa = PL[x].home, pb = PL[y].home;
      const k = lerp(t, a, a + 0.8, 0, 1) * lerp(t, b, b + 0.6, 1, 0);
      const broken = t > b;
      const m: P = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2];
      return (
        <g key={pi} opacity={k}>
          <line x1={pa[0]} y1={pa[1]} x2={pb[0]} y2={pb[1]} stroke={broken ? RED : '#fff'} strokeWidth={5} strokeDasharray="10 8" vectorEffect="non-scaling-stroke" />
          <g transform={`translate(${m[0]},${m[1]}) scale(${inv * 1.3})`}>
            <circle r={26} fill={broken ? RED : GREEN} stroke={INK} strokeWidth={5} />
            <text y={11} textAnchor="middle" fontSize={30}>{broken ? '💔' : '🤝'}</text>
          </g>
        </g>
      );
    })}
  </>
);

// caras: una por imperio vivo, en su "casa", tamaño según territorio
export const BUB = TL.bubbles as [number, number, string, string][];
export const faceSize = (area: number) => Math.min(64, Math.max(3, Math.sqrt(area) * 0.15));
const Faces: React.FC<{t: number; s: number; vis: (b: number[]) => boolean; ui?: number}> = ({t, s, vis, ui = 1}) => {
  const a = areasAt(t);
  const nodes: React.ReactNode[] = [];
  for (const c of CODES) {
    const et = elimT[c];
    if (et !== undefined && t > et + D) continue;
    const home = PL[c].home;
    const shrink = et !== undefined ? lerp(t, et + 0.2, et + D, 1, 0) : 1;
    const r = faceSize(Math.max(a[c] || 0, PL[c].area * 0.25)) * shrink * ui;
    const rs = r * s;
    if (rs < 7 || !vis([home[0] - r, home[1] - r, home[0] + r, home[1] + r])) continue;
    const ev = EVENTS.find((e) => (e.w === c || e.l === c) && t > e.t - 2.2 && t < e.t + 1.2);
    const inBattle = BATTLES.find((b) => (b.att.includes(c) || b.def.includes(c)) && t > b.t0 && t < b.t1);
    let mood: Mood = 'calm';
    if (et !== undefined && t > et - 2.2) mood = t > et ? 'shocked' : 'scared';
    else if (ev || inBattle) mood = 'angry';
    else if ((kills[c] || 0) > 3 && t > 30) mood = 'smug';
    if (TL.victory && t > (TL.victory as number) && c === TL.winner) mood = 'happy';
    const talking = BUB.some(([b0, b1, w]) => w === c && t > b0 + 0.2 && t < b1 - 0.3);
    nodes.push(<Face key={c} x={home[0]} y={home[1]} r={r} mood={mood} t={t} seed={c.charCodeAt(0) + c.charCodeAt(1)} look={[0, 0]} talking={talking} />);
  }
  return <g>{nodes}</g>;
};

// soldaditos, aviones y barcos de las batallas grandes
const FORM: P[] = [[0, 0], [-16, -9], [-16, 9], [-31, 0], [-31, -17], [-31, 17]];
const homeOrEdge = (c: string, other: string, k: number): P => {
  return nearestOwned(k, c, PL[other].home);
};
const BUNITS = BATTLES.map((b) => {
  const k = doneCount(b.t0);
  const att = b.att[0], def = b.def[0];
  const target: P = (b as any).target || PL[def].home;
  const from: P = (b as any).from || homeOrEdge(att, def, k);
  const stop = b.prog && b.bar !== 'CAPTURED' ? 0.82 : 1;
  const dist = Math.hypot(target[0] - from[0], target[1] - from[1]);
  return {b, from, target, stop, pts: arcPath(from, target, Math.min(30, dist * 0.15))};
});
const BattleUnits: React.FC<{t: number; s: number}> = ({t, s}) => {
  const out: React.ReactNode[] = [];
  const frame = t * 30;
  const sc = 1.25 / s;
  BUNITS.forEach(({b, from, target, stop, pts}, bi) => {
    if (t < b.t0 || t > b.t1 + 1.5) return;
    const fade = lerp(t, b.t1 + 0.5, b.t1 + 1.5, 1, 0);
    if (b.units === 'jets' || b.units === 'ships') {
      const n = 7;
      for (let i = 0; i < n; i++) {
        const tb = b.t0 + 2 + i * ((b.t1 - b.t0 - 3) / n);
        const hit: P = [1700 + ((i * 53) % 140) - 70, 360 + ((i * 37) % 120) - 30];
        const usFrom: P = [1935, 300 + ((i * 41) % 200)], cnFrom: P = [1520 + ((i * 29) % 60), 380 + ((i * 17) % 80)];
        if (b.units === 'jets') {
          out.push(<Mover key={`j${bi}-${i}a`} pts={arcPath(usFrom, hit, 25)} t={t} t0={tb - 2.2} t1={tb} kind="plane" color={BLUE} inv={1.15 / s} hold={0.3} trail />);
          out.push(<Mover key={`j${bi}-${i}b`} pts={arcPath(cnFrom, [hit[0] + 20, hit[1] - 10], -25)} t={t} t0={tb - 2.0} t1={tb + 0.4} kind="plane" color={RED} inv={1.15 / s} hold={0.3} trail />);
        } else {
          out.push(<Mover key={`s${bi}-${i}a`} pts={arcPath(usFrom, [hit[0] + 18, hit[1]], 10)} t={t} t0={tb - 3} t1={tb} kind="ship" code="us" inv={1.0 / s} hold={2} sinkAt={i % 3 === 2 ? tb + 0.3 : undefined} />);
          out.push(<Mover key={`s${bi}-${i}b`} pts={arcPath(cnFrom, [hit[0] - 18, hit[1]], -10)} t={t} t0={tb - 3} t1={tb} kind="ship" code="cn" inv={1.0 / s} hold={2} sinkAt={i % 3 !== 2 ? tb + 0.3 : undefined} />);
          out.push(<Mover key={`m${bi}-${i}`} pts={arcPath([hit[0] + 18, hit[1]], [hit[0] - 18, hit[1]], -8)} t={t} t0={tb - 0.8} t1={tb} kind="missile" inv={1.0 / s} />);
        }
        out.push(<Boom key={`bb${bi}-${i}`} p={hit} t={t} at={tb} r={14 / s + 4} />);
      }
      return;
    }
    // escuadras atacantes
    const p0 = b.t0 + 0.8, p1 = b.t1 - 2.2;
    for (let q = 0; q < 3; q++) {
      const t0 = p0 + q * 1.1, t1 = p1 + q * 0.4;
      const pr = lerp(t, t0, t1, 0, stop, Easing.inOut(Easing.sin));
      const {tip, ang} = partial(pts, pr);
      const off = (q - 1) * 14 * sc;
      const ca = Math.cos(ang), sa = Math.sin(ang);
      const bx = tip[0] - sa * off, by = tip[1] + ca * off;
      const near = Math.hypot(target[0] - bx, target[1] - by) < 60 * sc + 26 / s;
      const dir = ca >= 0 ? 1 : -1;
      for (let i = 0; i < FORM.length; i++) {
        const [fx, fy] = FORM[i];
        const x = bx + (fx * ca - fy * sa) * sc, y = by + (fx * sa + fy * ca) * sc;
        const shoot = (near || stop < 1) && t > t1 - 1 && (frame + i * 7 + q * 3) % 11 < 2;
        out.push(<g key={`sq${bi}-${q}-${i}`} transform={`translate(${x},${y}) scale(${sc})`}><Soldier side="R" walk={t > t0 && t < t1 ? frame / 2.2 + i : 0} dir={dir} shoot={shoot} fallen={0} alpha={fade * lerp(t, t0 - 0.3, t0, 0, 1)} /></g>);
      }
    }
    // defensores
    const prog = b.prog ? piece(t, b.prog) : lerp(t, b.t0 + 1, b.t1 - 1.5, 0, 1);
    const dead = Math.floor(8 * Math.min(0.9, prog * (stop < 1 ? 0.5 : 1)));
    for (let i = 0; i < 8; i++) {
      const col = i % 4, row = Math.floor(i / 4);
      const dirD = from[0] > target[0] ? 1 : -1;
      const x = target[0] + (col - 1.5) * 15 * sc - dirD * row * 12 * sc, y = target[1] + (row * 12 - 6) * sc;
      const isDead = i >= 8 - dead;
      const shoot = !isDead && (frame + i * 5 + bi) % 13 < 2 && t > b.t0 + 2;
      out.push(<g key={`df${bi}-${i}`} transform={`translate(${x},${y}) scale(${sc})`}><Soldier side="E" walk={0} dir={dirD} shoot={shoot} fallen={isDead ? 1 : 0} alpha={fade * lerp(t, b.t0, b.t0 + 0.6, 0, 1)} /></g>);
    }
  });
  return <g>{out}</g>;
};

// ================= interfaz =================
export const roundAt = (t: number) => [...(TL.rounds as any[])].reverse().find((r) => t >= r.t0);
const Counter: React.FC<{t: number}> = ({t}) => {
  if (t < 3.6) return null;
  const k = popT(t, 3.6, 12);
  const left = 195 - firedCount(t);
  const last = EVENTS[firedCount(t) - 1];
  const bump = last ? 1 + 0.18 * lerp(t, last.t, last.t + 0.35, 1, 0) : 1;
  const r = roundAt(t);
  return (
    <div style={{position: 'absolute', top: 22, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 14, zIndex: 10}}>
      {r && <div style={{transform: `scale(${k})`, background: YELLOW, border: `5px solid ${INK}`, borderRadius: 18, padding: '8px 22px 2px', ...font, fontSize: 44, color: INK, boxShadow: '0 6px 0 rgba(0,0,0,0.35)'}}>ROUND {r.n}</div>}
      <div style={{transform: `scale(${k})`, display: 'flex', alignItems: 'center', gap: 14, background: INK, padding: '8px 28px 4px 18px', borderRadius: 20, boxShadow: '0 6px 0 rgba(0,0,0,0.35)', border: `4px solid ${left === 1 ? GREEN : RED}`}}>
        <svg width={40} height={40} viewBox="-20 -20 40 40"><circle r={17} fill="#fff" stroke={YELLOW} strokeWidth={3} /><circle cx={-6} cy={-2} r={4.5} fill={INK} /><circle cx={6} cy={-2} r={4.5} fill={INK} /><rect x={-7} y={7} width={14} height={5} rx={1} fill={INK} /></svg>
        <div style={{...font, fontSize: 50, color: YELLOW, lineHeight: 1}}>COUNTRIES LEFT: <span style={{display: 'inline-block', transform: `scale(${bump})`, color: '#fff'}}>{left}</span></div>
      </div>
    </div>
  );
};
const KillFeed: React.FC<{t: number}> = ({t}) => {
  if (t > TL.victory) return null;
  const list = EVENTS.filter((e) => t >= e.t && t < e.t + 3.6).slice(-5);
  return (
    <div style={{position: 'absolute', left: 22, top: 112, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 8}}>
      {list.map((e) => {
        const k = lerp(t, e.t, e.t + 0.25, 0, 1, Easing.out(Easing.cubic)) * lerp(t, e.t + 3.2, e.t + 3.6, 1, 0);
        return (
          <div key={e.l} style={{transform: `translateX(${(k - 1) * 420}px)`, opacity: k, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(20,24,32,0.82)', border: '3px solid rgba(255,255,255,0.25)', borderRadius: 12, padding: '5px 14px 3px 8px', ...font, fontSize: 25, color: '#fff', whiteSpace: 'nowrap'}}>
            <WFlag code={e.w} w={38} h={26} /><span>{nameOf(e.w)}</span>
            <svg width={28} height={28} viewBox="-20 -20 40 40">{[-1, 1].map((d) => <g key={d} transform={`rotate(${d * 45})`}><rect x={-2.5} y={-17} width={5} height={24} fill="#e6e6e6" /><rect x={-7} y={7} width={14} height={4} fill={YELLOW} /></g>)}</svg>
            <WFlag code={e.l} w={38} h={26} /><span style={{color: '#ff8b84', textDecoration: 'line-through', textDecorationThickness: 3}}>{nameOf(e.l)}</span>
          </div>
        );
      })}
    </div>
  );
};
export const activeBattle = (t: number) => BATTLES.find((x) => t >= x.t0 + 0.6 && t < x.t1 + 2.4);
const Ranking: React.FC<{t: number}> = ({t}) => {
  if (t < 24 || t > TL.victory) return null;
  const hide = activeBattle(t);
  const vis = lerp(t, 24, 24.6, 0, 1) * (hide ? 0 : 1);
  if (vis <= 0) return null;
  const a = areasAt(t);
  const top = Object.entries(a).filter(([c]) => !(elimT[c] !== undefined && t > elimT[c] + D)).sort((x, y) => y[1] - x[1]).slice(0, 5);
  return (
    <div style={{position: 'absolute', right: 26, top: 120, width: 380, opacity: vis, zIndex: 8}}>
      <div style={{background: 'rgba(255,246,227,0.95)', border: `6px solid ${INK}`, borderRadius: 22, padding: '12px 16px 14px', boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>
        <div style={{...font, fontSize: 32, color: INK, textAlign: 'center', marginBottom: 6}}>🏆 BIGGEST EMPIRES</div>
        {top.map(([c, v], i) => (
          <div key={c} style={{display: 'flex', alignItems: 'center', gap: 10, height: 50}}>
            <div style={{...font, fontSize: 28, color: INK, width: 24}}>{i + 1}</div>
            <WFlag code={c} w={46} h={31} />
            <div style={{flex: 1}}>
              <div style={{...font, fontSize: 24, color: INK, lineHeight: 1}}>{nameOf(c)}</div>
              <div style={{height: 10, background: '#e6d9bd', borderRadius: 6, marginTop: 3, overflow: 'hidden'}}><div style={{width: `${Math.min(100, (v / TOTAL_AREA) * 100 * 1.6)}%`, height: '100%', background: i === 0 ? ORANGE : BLUE}} /></div>
            </div>
            <div style={{...font, fontSize: 26, color: INK, width: 70, textAlign: 'right'}}>{Math.round((v / TOTAL_AREA) * 100)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
};
const FlagRow: React.FC<{codes: string[]}> = ({codes}) => <div style={{display: 'flex'}}>{codes.map((c, i) => <div key={c} style={{marginLeft: i ? -14 : 0}}><WFlag code={c} w={52} h={35} /></div>)}</div>;
const BattleHUD: React.FC<{t: number}> = ({t}) => {
  const b = activeBattle(t);
  if (!b) return null;
  const k = popT(t, b.t0 + 0.6, 13) * lerp(t, b.t1 + 2.0, b.t1 + 2.4, 1, 0);
  const p = b.prog ? piece(t, b.prog, ease) : lerp(t, b.t0 + 1, b.t1 - 1.5, 0, 1);
  const lin = lerp(t, b.t0 + 1, b.t1 - 1.5, 0, 1);
  const A = b.A[0] + (b.A[1] - b.A[0]) * lin, Dv = b.D[0] + (b.D[1] - b.D[0]) * (b.prog ? lin : Math.pow(p, 0.85));
  const good = b.good ?? false;
  const barCol = good ? BLUE : RED, barDark = good ? '#1557c0' : '#b51d18';
  const round = (v: number) => (b.units ? Math.round(v) : Math.round(v / 100) * 100);
  const row = (codes: string[], val: number, side: Side) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
      <FlagRow codes={codes} /><UnitIcon side={side} units={b.units} />
      <div style={{...font, fontSize: 56, color: side === 'R' ? '#c0221d' : '#1557c0', lineHeight: 1}}>{fmt(round(val))}</div>
    </div>
  );
  return (
    <div style={{position: 'absolute', right: 30, top: 120, width: 470, transform: `translateX(${(1 - k) * 560}px)`, zIndex: 9}}>
      <div style={{background: CREAM, border: `7px solid ${INK}`, borderRadius: 24, padding: '14px 22px 18px', boxShadow: '0 10px 0 rgba(0,0,0,0.35)'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, ...font, fontSize: 36, color: INK, marginBottom: 10, whiteSpace: 'nowrap'}}><Swords size={36} />{b.title}</div>
        {row(b.att, A, 'R')}
        <div style={{display: 'flex', alignItems: 'center', gap: 10, margin: '6px 0'}}><div style={{flex: 1, height: 4, background: '#d9caa6'}} /><div style={{...font, fontSize: 28, color: '#fff', background: INK, borderRadius: 20, padding: '2px 14px 0'}}>VS</div><div style={{flex: 1, height: 4, background: '#d9caa6'}} /></div>
        {row(b.def, Dv, 'E')}
        <div style={{display: 'flex', justifyContent: 'space-between', ...font, fontSize: 25, color: INK, marginTop: 14}}><span>{b.bar}</span><span style={{color: barDark}}>{Math.round(p * 100)}%</span></div>
        <div style={{height: 26, background: '#e6d9bd', border: `5px solid ${INK}`, borderRadius: 14, overflow: 'hidden', marginTop: 4}}><div style={{width: `${p * 100}%`, height: '100%', background: `repeating-linear-gradient(45deg, ${barCol}, ${barCol} 10px, ${barDark} 10px, ${barDark} 20px)`}} /></div>
      </div>
    </div>
  );
};
const Banner: React.FC<{t: number}> = ({t}) => {
  const b = BATTLES.find((x) => t >= x.t0 && t < x.t0 + 2.6);
  if (!b) return null;
  const k = popT(t, b.t0, 11) * lerp(t - b.t0, 2.2, 2.6, 1, 0);
  return (
    <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 13}}>
      <div style={{transform: `scale(${k}) rotate(-2deg)`, display: 'flex', alignItems: 'center', gap: 18, background: b.good ? BLUE : RED, border: `7px solid ${INK}`, borderRadius: 22, padding: '10px 40px 4px', boxShadow: '0 10px 0 rgba(0,0,0,0.35)', ...font, fontSize: 74, color: '#fff', textShadow: `4px 4px 0 ${INK}`, whiteSpace: 'nowrap'}}><Swords size={66} />{b.banner}</div>
    </div>
  );
};
const RoundBanner: React.FC<{t: number}> = ({t}) => {
  const r = (TL.rounds as any[]).find((x) => t >= x.t0 && t < x.t0 + 3.2);
  if (!r) return null;
  const dt = t - r.t0;
  const k = popT(t, r.t0, 10) * lerp(dt, 2.8, 3.2, 1, 0);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 15, background: `rgba(8,18,32,${0.45 * lerp(dt, 0, 0.3, 0, 1) * lerp(dt, 2.8, 3.2, 1, 0)})`}}>
      <div style={{transform: `scale(${k}) rotate(-3deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
        <div style={{...font, fontSize: 70, color: YELLOW, textShadow: `5px 5px 0 ${INK}`}}>ROUND {r.n}</div>
        <div style={{background: '#fff', border: `10px solid ${INK}`, borderRadius: 30, padding: '16px 56px 6px', ...font, fontSize: 130, color: r.n === 5 ? ORANGE : RED, boxShadow: '0 14px 0 rgba(0,0,0,0.4)', whiteSpace: 'nowrap'}}>{r.title}</div>
      </div>
    </AbsoluteFill>
  );
};
const Stamp: React.FC<{t: number}> = ({t}) => {
  const st = (TL.stamps as any[]).find((s) => t >= s.t && t < s.t + 2.2);
  if (!st) return null;
  const dt = t - st.t;
  const k = dt < 0.27 ? interpolate(dt, [0, 0.27], [2.2, 1], {...clamp, easing: Easing.out(Easing.cubic)}) : 1;
  const a = lerp(dt, 0, 0.12, 0, 1) * lerp(dt, 1.9, 2.2, 1, 0);
  const col = st.c === 'red' ? RED : st.c === 'blue' ? BLUE : GREEN;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 12}}>
      <div style={{transform: `scale(${k}) rotate(-6deg)`, opacity: a, border: `10px solid ${col}`, color: col, background: 'rgba(255,246,227,0.95)', borderRadius: 18, padding: '14px 44px 6px', ...font, fontSize: 110, boxShadow: '0 10px 0 rgba(0,0,0,0.3)', whiteSpace: 'nowrap'}}>{st.text}</div>
    </AbsoluteFill>
  );
};
const toScreen = (p: P, cam: Cam): P => [960 + (p[0] - cam.cx) * cam.s, 540 + (p[1] - cam.cy) * cam.s];
const Bubbles: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const a = areasAt(t);
  return (
    <>
      {BUB.filter(([b0, b1]) => t >= b0 && t <= b1).map(([b0, b1, w, text]) => {
        const [sx, sy] = toScreen(PL[w].home, cam);
        const r = faceSize(Math.max(a[w] || 0, PL[w].area * 0.25)) * cam.s;
        const k = popT(t, b0, 10) * lerp(t, b1 - 0.25, b1, 1, 0);
        const right = activeBattle(t) ? 1380 : 1440;
        return <Bubble key={w + b0} k={k} sx={Math.max(260, Math.min(right, sx))} sy={Math.min(1000, Math.max(250, sy - r - 12))} text={text} size={40} />;
      })}
    </>
  );
};
const Labels: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const a = areasAt(t);
  const items: React.ReactNode[] = [];
  for (const c of CODES) {
    const et = elimT[c];
    if (et !== undefined && t > et) continue;
    const r = faceSize(Math.max(a[c] || 0, PL[c].area * 0.25)) * cam.s;
    if (r < 15) continue;
    const [sx, sy] = toScreen(PL[c].home, cam);
    const y = sy + r + 6;
    if (sx < 90 || sx > 1830 || y < 110 || y > 1030) continue;
    if (activeBattle(t) && sx > 1400 && y < 620) continue;
    if (!activeBattle(t) && t > 24 && sx > 1480 && y < 460) continue;
    items.push(<div key={c} style={{position: 'absolute', left: sx, top: y, transform: 'translateX(-50%)', background: '#fff', border: `4px solid ${INK}`, borderRadius: 12, padding: '2px 12px 0', ...font, fontSize: Math.min(30, 16 + r * 0.25), color: INK, whiteSpace: 'nowrap', boxShadow: '0 4px 0 rgba(0,0,0,0.3)'}}>{nameOf(c).toUpperCase()}</div>);
  }
  return <div style={{position: 'absolute', inset: 0, zIndex: 3}}>{items}</div>;
};

// ================= intro y final =================
const Title: React.FC<{t: number}> = ({t}) => {
  if (t > 4.2) return null;
  const k = popT(t, 0.1, 10) * lerp(t, 3.7, 4.2, 1, 0);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 13}}>
      <div style={{transform: `scale(${k}) rotate(-2deg)`, background: '#2ec36a', border: `9px solid ${INK}`, borderRadius: 30, padding: '24px 56px 14px', boxShadow: '0 12px 0 rgba(0,0,0,0.35)', ...font, fontSize: 112, color: '#fff', textShadow: `5px 5px 0 ${INK}`, textAlign: 'center', lineHeight: 1.02}}>{TL.title[0]}<br />{TL.title[1]}</div>
    </AbsoluteFill>
  );
};
const RULES: [number, string, string][] = TL.rules || [[4.6, '195 COUNTRIES', '#fff'], [7.4, 'EVERY COUNTRY FOR ITSELF', YELLOW], [10.2, 'CONQUER = TAKE THEIR LAND', '#8fd3ff'], [13.0, 'NO NUKES · LAST ONE STANDING WINS', '#ff9b94']];
const Rules: React.FC<{t: number}> = ({t}) => {
  if (t < 4.5 || t > 17.6) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 90, zIndex: 13}}>
      {RULES.map(([t0, text, col], i) => {
        const end = i < 3 ? RULES[i + 1][0] : 17.4;
        if (t < t0 || t > end + 0.2) return null;
        const k = popT(t, t0, 11) * lerp(t, end - 0.2, end + 0.2, 1, 0);
        return (
          <div key={i} style={{position: 'absolute', bottom: 110, transform: `scale(${k}) rotate(${i % 2 ? 2 : -2}deg)`, background: INK, border: '6px solid #fff', borderRadius: 26, padding: '14px 40px 6px', display: 'flex', alignItems: 'center', gap: 20}}>
            <div style={{...font, fontSize: 44, color: INK, background: YELLOW, borderRadius: 40, width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 6}}>{i + 1}</div>
            <div style={{...font, fontSize: 72, color: col, whiteSpace: 'nowrap'}}>{text}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
const Countdown: React.FC<{t: number}> = ({t}) => {
  const c0 = TL.countdown as number;
  if (t < c0 || t > c0 + 4.2) return null;
  const i = Math.floor(t - c0);
  const label = i < 3 ? String(3 - i) : 'FIGHT!';
  const dt = t - (c0 + i);
  const k = interpolate(dt, [0, 0.25], [2.4, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const a = i < 3 ? lerp(dt, 0.7, 1, 1, 0) : lerp(dt, 0.9, 1.2, 1, 0);
  const flash = i === 3 ? lerp(dt, 0, 0.35, 0.6, 0) : 0;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 16}}>
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
      <div style={{transform: `scale(${k})`, opacity: a, ...font, fontSize: i < 3 ? 260 : 230, color: i < 3 ? '#fff' : RED, textShadow: `8px 8px 0 ${INK}, -4px -4px 0 ${INK}, 4px -4px 0 ${INK}, -4px 4px 0 ${INK}`}}>{label}</div>
    </AbsoluteFill>
  );
};
const Crown: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 100 70"><path d="M8,62 L4,18 L28,38 L50,6 L72,38 L96,18 L92,62 Z" fill={YELLOW} stroke={INK} strokeWidth={6} strokeLinejoin="round" /><circle cx={50} cy={44} r={7} fill={RED} stroke={INK} strokeWidth={3} /><circle cx={26} cy={50} r={5} fill={BLUE} stroke={INK} strokeWidth={3} /><circle cx={74} cy={50} r={5} fill={GREEN} stroke={INK} strokeWidth={3} /></svg>
);
const topKiller = Object.entries(kills).sort((a, b) => b[1] - a[1])[0];
const Winner: React.FC<{t: number}> = ({t}) => {
  const v = TL.victory as number;
  if (t < v) return null;
  const k = popT(t, v, 10);
  const out = TL.question as number;
  const kr = TL.results as number;
  const shift = lerp(t, kr, kr + 0.8, 0, 1, Easing.inOut(Easing.cubic));
  const fade = lerp(t, out - 0.4, out, 1, 0);
  const rows: [string, string, string][] = [
    [TL.winner, 'Winner', TL.winnerName], [topKiller[0], 'Most eliminations', `${nameOf(topKiller[0])} · ${topKiller[1]}`],
    ...(TL.resultRows as [string, string, string][]),
  ];
  return (
    <AbsoluteFill style={{zIndex: 14, background: `rgba(8,18,32,${0.35 * k * fade})`, opacity: fade}}>
      <div style={{position: 'absolute', left: interpolate(shift, [0, 1], [960, 470]), top: 520, transform: `translate(-50%,-50%) scale(${k})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{transform: `translateY(${Math.sin(t * 3) * 6}px)`, marginBottom: -40, zIndex: 2}}><Crown size={220} /></div>
        <Avatar size={380} code={TL.winnerFlag || TL.winner.toLowerCase()} mood="happy" t={t} seed={5} id="win-w" />
        <div style={{marginTop: 18, background: YELLOW, border: `8px solid ${INK}`, borderRadius: 26, padding: '8px 44px 0', ...font, fontSize: 84, color: INK, boxShadow: '0 10px 0 rgba(0,0,0,0.4)'}}>LAST ONE STANDING</div>
      </div>
      {t > kr && (
        <div style={{position: 'absolute', right: 70, top: 230, width: 820, transform: `translateX(${(1 - popT(t, kr + 0.4, 12)) * 960}px)`}}>
          <div style={{background: CREAM, border: `8px solid ${INK}`, borderRadius: 28, padding: '22px 30px 18px', boxShadow: '0 12px 0 rgba(0,0,0,0.35)'}}>
            <div style={{...font, fontSize: 58, color: INK, marginBottom: 10}}>BATTLE ROYALE RESULTS</div>
            {rows.map(([c, l, v], i) => (
              <div key={l} style={{display: 'flex', alignItems: 'center', gap: 14, height: 74, borderTop: '3px solid #e2d3b1', opacity: lerp(t, kr + 0.8 + i * 0.6, kr + 1.2 + i * 0.6, 0, 1)}}>
                <WFlag code={c} w={54} h={36} /><div style={{...font2, fontSize: 30, color: INK, width: 270}}>{l}</div><div style={{...font, fontSize: 38, color: i === 0 ? '#1557c0' : INK}}>{v}</div>
              </div>
            ))}
            <div style={{display: 'flex', alignItems: 'center', gap: 14, height: 74, borderTop: '3px solid #e2d3b1', opacity: lerp(t, kr + 3.2, kr + 3.6, 0, 1)}}>
              <div style={{...font, fontSize: 40, color: RED}}>194</div><div style={{...font2, fontSize: 30, color: INK}}>countries eliminated · {TL.pacts.length} alliances</div>
            </div>
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
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 15, background: `rgba(8,18,32,${0.4 * k})`}}>
      <div style={{transform: `scale(${k}) rotate(-2deg)`, background: '#fff', border: `9px solid ${INK}`, borderRadius: 30, padding: '24px 50px 14px', ...font, fontSize: 100, color: INK, textAlign: 'center', lineHeight: 1.05, boxShadow: '0 12px 0 rgba(0,0,0,0.35)'}}>Who would <span style={{color: RED}}>REALLY</span> win?</div>
      <div style={{marginTop: 30, transform: `scale(${popT(t, q + 1.0, 12)})`, background: YELLOW, border: `6px solid ${INK}`, borderRadius: 24, padding: '8px 34px 2px', ...font, fontSize: 56, color: INK}}>Tell us in the comments!</div>
    </AbsoluteFill>
  );
};
const Credit = () => <div style={{position: 'absolute', right: 18, bottom: 12, background: 'rgba(15,25,40,0.65)', color: '#fff', borderRadius: 12, padding: '5px 14px', ...font2, fontWeight: 600, fontSize: 17, zIndex: 20}}>Hypothetical simulation · Troop numbers approx., based on Global Firepower 2026</div>;

export const usePreload = () => {
  const [h] = React.useState(() => delayRender('flags'));
  React.useEffect(() => {
    Promise.all(Object.values(RS).map((src) => { const i = new Image(); i.src = src; return i.decode().catch(() => null); })).then(() => continueRender(h));
  }, [h]);
};
export const WarBRA: React.FC<{dbg?: Record<string, boolean>}> = ({dbg = {}}) => {
  usePreload();
  const t = useCurrentFrame() / 30;
  const cam = camera(t);
  return (
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <Ocean t={t} />
      <WorldMap t={t} cam={cam} dbg={dbg} />
      {!dbg.noHtml && <>
      <Labels t={t} cam={cam} />
      {t < TL.victory && <Bubbles t={t} cam={cam} />}
      <KillFeed t={t} />
      <Ranking t={t} />
      <BattleHUD t={t} />
      <Banner t={t} />
      <Stamp t={t} />
      <RoundBanner t={t} />
      <Counter t={t} />
      <Rules t={t} />
      <Countdown t={t} />
      <Winner t={t} />
      <Question t={t} />
      <Title t={t} />
      <Credit /></>}
    </AbsoluteFill>
  );
};

// ================= miniaturas =================
const TXT = (size: number, color: string, sw = size * 0.13): React.CSSProperties => ({...font, fontSize: size, color, WebkitTextStroke: `${sw}px ${INK}`, paintOrder: 'stroke fill', lineHeight: 0.92, textShadow: `0 ${size * 0.07}px 0 rgba(0,0,0,0.55)`, whiteSpace: 'nowrap'});
export const ThumbBR: React.FC<{v: string}> = ({v}) => {
  if (v === 'A') {
    return (
      <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
        <Ocean t={0} /><WorldMap t={23} cam={{cx: 1000, cy: 470, s: 1.25}} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.15) 20%, rgba(0,0,0,0.7) 100%)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40, zIndex: 5}}>
          <div style={{position: 'relative'}}><div style={TXT(330, '#fff')}>195</div><svg width={520} height={300} style={{position: 'absolute', left: -20, top: 0}}><line x1={10} y1={260} x2={500} y2={40} stroke={INK} strokeWidth={56} strokeLinecap="round" /><line x1={10} y1={260} x2={500} y2={40} stroke={RED} strokeWidth={36} strokeLinecap="round" /></svg></div>
          <div style={TXT(200, YELLOW)}>➜</div>
          <div style={{position: 'relative'}}><div style={{position: 'absolute', left: 10, top: -150}}><Crown size={200} /></div><div style={TXT(330, YELLOW)}>1</div></div>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 60, display: 'flex', justifyContent: 'center', zIndex: 5}}>
          <div style={{transform: 'rotate(-2deg)', background: YELLOW, border: `12px solid ${INK}`, borderRadius: 32, padding: '6px 60px 0', ...font, fontSize: 150, color: INK, boxShadow: '0 14px 0 rgba(0,0,0,0.5)'}}>WHO SURVIVES?</div>
        </div>
      </AbsoluteFill>
    );
  }
  if (v === 'B') {
    return (
      <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
        <Ocean t={0} /><WorldMap t={500} cam={{cx: 960, cy: 500, s: 1.15}} />
        <AbsoluteFill style={{background: 'rgba(8,15,30,0.45)'}} />
        <div style={{position: 'absolute', left: 70, top: 300, zIndex: 5}}><Avatar size={560} code="us" mood="angry" t={0.5} seed={5} look={[1, 0]} id="tb-us" /></div>
        <div style={{position: 'absolute', right: 70, top: 300, zIndex: 5}}><Avatar size={560} code="cn" mood="angry" t={0.5} seed={2} look={[-1, 0]} id="tb-cn" /></div>
        <div style={{position: 'absolute', left: 960, top: 520, transform: 'translate(-50%,-50%)', zIndex: 6, display: 'flex', flexDirection: 'column', alignItems: 'center'}}><Crown size={300} /><div style={TXT(150, '#fff', 20)}>VS</div></div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 40, display: 'flex', justifyContent: 'center', zIndex: 6}}>
          <div style={{transform: 'rotate(-2deg)', background: '#fff', border: `12px solid ${INK}`, borderRadius: 32, padding: '6px 50px 0', ...font, fontSize: 120, color: INK, boxShadow: '0 14px 0 rgba(0,0,0,0.5)', whiteSpace: 'nowrap'}}>LAST 2 OF <span style={{color: RED}}>195</span></div>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, display: 'flex', justifyContent: 'center', zIndex: 6}}>
          <div style={{transform: 'rotate(2deg)', background: YELLOW, border: `12px solid ${INK}`, borderRadius: 32, padding: '6px 60px 0', ...font, fontSize: 130, color: INK, boxShadow: '0 14px 0 rgba(0,0,0,0.5)'}}>WHO WINS?</div>
        </div>
      </AbsoluteFill>
    );
  }
  // C: estilo videojuego, ranking + mapa en plena guerra
  const rows: [string, string, number][] = [['US', 'USA', 31], ['CN', 'China', 27], ['RU', 'Russia', 16], ['IN', 'India', 7], ['EG', 'Egypt', 6]];
  return (
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <Ocean t={0} /><WorldMap t={392} cam={{cx: 1000, cy: 480, s: 1.2}} />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(0,0,0,0.6), rgba(0,0,0,0.1) 55%)'}} />
      <div style={{position: 'absolute', left: 60, top: 70, zIndex: 6}}>
        <div style={TXT(150, '#fff')}>WORLD</div>
        <div style={{...TXT(150, YELLOW), marginTop: 10}}>BATTLE</div>
        <div style={{...TXT(150, RED), marginTop: 10}}>ROYALE</div>
        <div style={{marginTop: 40, display: 'inline-block', background: INK, border: '7px solid #fff', borderRadius: 24, padding: '10px 30px 2px', ...font, fontSize: 72, color: YELLOW}}>195 COUNTRIES · 1 WINNER</div>
      </div>
      <div style={{position: 'absolute', right: 50, top: 120, width: 640, zIndex: 6, transform: 'rotate(2deg)'}}>
        <div style={{background: CREAM, border: `10px solid ${INK}`, borderRadius: 30, padding: '20px 26px', boxShadow: '0 14px 0 rgba(0,0,0,0.5)'}}>
          <div style={{...font, fontSize: 60, color: INK, textAlign: 'center', marginBottom: 8}}>🏆 TOP 5</div>
          {rows.map(([c, n, p], i) => (
            <div key={c} style={{display: 'flex', alignItems: 'center', gap: 16, height: 104, borderTop: '4px solid #e2d3b1'}}>
              <div style={{...font, fontSize: 56, color: INK, width: 40}}>{i + 1}</div><WFlag code={c} w={110} h={74} />
              <div style={{...font, fontSize: 58, color: INK, flex: 1}}>{n}</div><div style={{...font, fontSize: 58, color: i === 0 ? ORANGE : BLUE}}>{p}%</div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ===== miniaturas Battle Royale con alianzas (modelos A, B, C) =====
const BOX: React.FC<{children: React.ReactNode; bg: string; size: number; rot?: number; color?: string}> = ({children, bg, size, rot = -2, color = INK}) => (
  <div style={{transform: `rotate(${rot}deg)`, background: bg, border: `12px solid ${INK}`, borderRadius: 32, padding: '6px 50px 0', ...font, fontSize: size, color, boxShadow: '0 14px 0 rgba(0,0,0,0.5)', whiteSpace: 'nowrap'}}>{children}</div>
);
export const ThumbBRA: React.FC<{v: string}> = ({v}) => {
  if (v === 'A') {
    const row = ['us', 'brf', 'gb', 'de', 'ru', 'inf', 'cn', 'au'];
    return (
      <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
        <Ocean t={0} /><WorldMap t={150} cam={{cx: 960, cy: 500, s: 1.08}} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.65) 100%)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 40, display: 'flex', justifyContent: 'center'}}><BOX bg="#fff" size={124}>195 COUNTRIES, <span style={{color: '#1f9e55'}}>ALLIANCES ON</span></BOX></div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 320, display: 'flex', justifyContent: 'center', gap: 14, alignItems: 'flex-end'}}>
          {row.map((c, i) => <div key={c} style={{transform: `translateY(${i % 2 ? 30 : 0}px)`}}><Avatar size={c === 'inf' ? 250 : 208} code={c} mood={i % 3 === 0 ? 'smug' : 'angry'} t={0.5} seed={i} look={[i < 4 ? 1 : -1, 0]} id={`ba-${c}`} /></div>)}
        </div>
        <div style={{position: 'absolute', left: 520, top: 268, fontSize: 110, zIndex: 3}}>🤝</div>
        <div style={{position: 'absolute', left: 1290, top: 268, fontSize: 110, zIndex: 3}}>💔</div>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, display: 'flex', justifyContent: 'center'}}><BOX bg={YELLOW} size={140} rot={2}>WHO WINS? 🏆</BOX></div>
      </AbsoluteFill>
    );
  }
  if (v === 'B') {
    const pa = 47, A = '#1d56c9', Ad = '#123a8c', B = '#e8901a', Bd = '#a8620c';
    return (
      <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
        <Ocean t={0} /><WorldMap t={500} cam={{cx: 960, cy: 480, s: 1.15}} />
        <AbsoluteFill style={{background: 'linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.1) 45%, rgba(0,0,0,0.5))'}} />
        <div style={{position: 'absolute', left: 60, right: 60, top: 50, display: 'flex', alignItems: 'center', gap: 24, background: 'rgba(16,22,34,0.9)', border: '8px solid #fff', borderRadius: 40, padding: '18px 28px'}}>
          <Avatar size={190} code="us" mood="scared" t={0.5} seed={5} look={[1, 0]} id="bb-us" />
          <div style={{flex: 1}}>
            <div style={{display: 'flex', justifyContent: 'space-between', ...font, fontSize: 84, color: '#fff'}}><span style={{color: '#cfe0ff'}}>{pa}%</span><span style={{fontSize: 70}}>💔</span><span style={{color: '#ffe0b8'}}>{100 - pa}%</span></div>
            <div style={{height: 70, borderRadius: 35, overflow: 'hidden', border: `8px solid ${INK}`, display: 'flex', marginTop: 8}}>
              <div style={{width: `${pa}%`, background: `repeating-linear-gradient(45deg, ${A}, ${A} 22px, ${Ad} 22px, ${Ad} 44px)`}} />
              <div style={{flex: 1, background: `repeating-linear-gradient(-45deg, ${B}, ${B} 22px, ${Bd} 22px, ${Bd} 44px)`}} />
            </div>
          </div>
          <Avatar size={190} code="inf" mood="smug" t={0.5} seed={2} look={[-1, 0]} id="bb-in" />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 60, display: 'flex', justifyContent: 'center'}}><BOX bg={RED} size={124} color="#fff">ALLIES... UNTIL THE END?</BOX></div>
      </AbsoluteFill>
    );
  }
  const rows: [string, string, number][] = [['IN', 'India', 29], ['US', 'USA', 27], ['CN', 'China', 18], ['RU', 'Russia', 9], ['BR', 'Brazil', 6]];
  return (
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <Ocean t={0} /><WorldMap t={300} cam={{cx: 1000, cy: 480, s: 1.2}} />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(0,0,0,0.6), rgba(0,0,0,0.1) 55%)'}} />
      <div style={{position: 'absolute', left: 60, top: 70, zIndex: 6}}>
        <div style={TXT(150, '#fff')}>WORLD</div>
        <div style={{...TXT(150, YELLOW), marginTop: 10}}>BATTLE</div>
        <div style={{...TXT(150, RED), marginTop: 10}}>ROYALE</div>
        <div style={{marginTop: 40, display: 'inline-block', background: INK, border: '7px solid #fff', borderRadius: 24, padding: '10px 30px 2px', ...font, fontSize: 64, color: YELLOW}}>195 COUNTRIES · ALLIANCES 🤝</div>
      </div>
      <div style={{position: 'absolute', right: 50, top: 120, width: 640, zIndex: 6, transform: 'rotate(2deg)'}}>
        <div style={{background: CREAM, border: `10px solid ${INK}`, borderRadius: 30, padding: '20px 26px', boxShadow: '0 14px 0 rgba(0,0,0,0.5)'}}>
          <div style={{...font, fontSize: 60, color: INK, textAlign: 'center', marginBottom: 8}}>🏆 TOP 5</div>
          {rows.map(([c, n, p], i) => (
            <div key={c} style={{display: 'flex', alignItems: 'center', gap: 16, height: 104, borderTop: '4px solid #e2d3b1'}}>
              <div style={{...font, fontSize: 56, color: INK, width: 40}}>{i + 1}</div><WFlag code={c} w={110} h={74} />
              <div style={{...font, fontSize: 58, color: INK, flex: 1}}>{n}</div><div style={{...font, fontSize: 58, color: i === 0 ? ORANGE : BLUE}}>{p}%</div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
