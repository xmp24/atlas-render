// "I Simulated a World War 1,000 Times" — v3 (~8 min). Lo dirige army-less: src/s1k-tl.json (director.py).
import React from 'react';
import {AbsoluteFill, Easing, useCurrentFrame} from 'remotion';
import TLJ from './s1k-tl.json';
import GEOJ from './s1k-geo.json';
import {INK, RED, YELLOW, lerp, font, font2, popT, arcPath, PathArrow, Boom} from './lib3';
// @ts-ignore
import {FlagSvg, WFlag, usePreload} from './War6';
import {Eyes, EyeMood} from './WarArmy';

type P = [number, number];
const TL = TLJ as any;
const GEO = GEOJ as any;
const GC = GEO.countries as Record<string, {d: string; b: number[]; mb: number[]; home: P; area: number; cont: string; name: string}>;
const C = Object.keys(GC);
export const s1kFrames = () => Math.round(TL.END * 30);
const NAME = TL.names as Record<string, string>;
const nm = (c: string) => (NAME[c] || c).toUpperCase();
const P0 = TL.p0 as Record<string, number>;
const LAND = C.map((c) => GC[c].d).join('');
const COAST = GEO.coast as string;
const BP = Object.entries(GEO.borders as Record<string, string>).map(([k, d]) => { const [a, b] = k.split('|'); return {a, b, d}; });
const union = (a: number[], b: number[]) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])];
const coverBox = (b: number[]) => { const w = Math.max(1, b[2] - b[0]), h = Math.max(1, b[3] - b[1]), cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2; const r = Math.min(1.75, Math.max(1.25, w / h)); let W2 = w, H2 = h; if (w / h > r) H2 = w / r; else W2 = h * r; return [cx - W2 / 2, cy - H2 / 2, cx + W2 / 2, cy + H2 / 2]; };
const LB = TL.lb as number[];
const PC = GEO.pieces as {id: string; c: string; d: string; mb: number[]; b: number[]}[];
const PADJ = GEO.adjp as Record<string, string[]>;
const PBY: Record<string, (typeof PC)[number]> = Object.fromEntries(PC.map((p) => [p.id, p]));
const ease = Easing.inOut(Easing.cubic);
const fmtK = (n: number) => (n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 1 : 2) + 'M' : n >= 1e4 ? Math.round(n / 1e3) + 'K' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : String(Math.round(n)));
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
const pctS = (p: number) => (p * 100 < 1 ? (p * 100).toFixed(2) : (p * 100).toFixed(1)) + '%';
const center = (b: number[]): P => [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
const OUT = {textShadow: `4px 4px 0 ${INK}, -2px -2px 0 ${INK}, 2px -2px 0 ${INK}, -2px 2px 0 ${INK}`};

// ---------- partidas: estado exacto en cada instante ----------
type Sim = {seed: number; win: string; ev: [string, string, string, string, number, number, number, number][]; t: number[]; dq: number[]; vs: {i: number; t0: number; t1: number; kind: string}[]};
const SIMS = TL.sims as Record<string, Sim>;
type Act = {w: string; l: string; q: number; lp: string[]; ti: number; dq: number; i: number};
type State = {own: Record<string, string>; pw: Record<string, number>; active: Act[]; alive: number; last: [string, string][]};
const ownCache = new Map<string, {k: number; own: Record<string, string>; pw: Record<string, number>}>();
const stateAt = (key: string, t: number): State => {
  const sim = SIMS[key]; const own: Record<string, string> = Object.fromEntries(C.map((c) => [c, c])); const pw: Record<string, number> = {...P0};
  const active: Act[] = []; let alive = C.length; const last: [string, string][] = [];
  for (let i = 0; i < sim.ev.length; i++) {
    const ti = sim.t[i]; if (ti == null || ti > t) break;
    const [w, l, , , , , , p] = sim.ev[i]; const dq = sim.dq[i];
    const lp = C.filter((c) => own[c] === l);
    if (t - ti < dq) active.push({w, l, q: ease(Math.max(0, (t - ti) / dq)), lp, ti, dq, i});
    for (const c of lp) own[c] = w; pw[w] = p; pw[l] = 0; alive--; if (ti > 0) last.push([w, l]);
  }
  void ownCache;
  const base = {...own}; for (const a of active) for (const c of a.lp) base[c] = a.l;
  return {own: base, pw, active, alive, last: last.slice(-3)};
};
const vsAt = (key: string, t: number) => SIMS[key].vs.find((v) => t >= v.t0 && t < v.t1) || null;

// ---------- cámara global por fotogramas clave (del director) ----------
type Cam = {cx: number; cy: number; s: number};
const WORLD: Cam = {cx: TL.world[0], cy: TL.world[1], s: TL.world[2]};
const KEYS = TL.cam as [number, number, number, number, number][];
const camAt = (t: number): Cam => {
  let i = -1; for (let k = 0; k < KEYS.length; k++) if (KEYS[k][0] <= t) i = k; else break;
  if (i < 0) return WORLD;
  const prev: Cam = i > 0 ? {cx: KEYS[i - 1][1], cy: KEYS[i - 1][2], s: KEYS[i - 1][3]} : WORLD;
  const [t0, cx, cy, s, dur] = KEYS[i]; const q = ease(Math.min(1, (t - t0) / dur));
  const S = prev.s * Math.pow(s / prev.s, q);
  return {cx: prev.cx + (cx - prev.cx) * q, cy: prev.cy + (cy - prev.cy) * q, s: S};
};
const CamBox: React.FC<{cam: Cam; children: React.ReactNode}> = ({cam, children}) => <div style={{position: 'absolute', inset: 0, transform: `translate(${960 - cam.cx * cam.s}px,${540 - cam.cy * cam.s}px) scale(${cam.s})`, transformOrigin: '0 0'}}>{children}</div>;

// ---------- mapa ----------
const clusters = (own: Record<string, string>) => {
  const seen = new Set<string>(); const out: {o: string; ids: string[]; box: number[]}[] = [];
  for (const p0 of PC) {
    if (seen.has(p0.id)) continue; const o = own[p0.c]; const st = [p0.id]; seen.add(p0.id); const ids: string[] = [];
    while (st.length) { const id = st.pop()!; ids.push(id); for (const n of PADJ[id] || []) if (!seen.has(n) && own[PBY[n].c] === o) { seen.add(n); st.push(n); } }
    out.push({o, ids, box: coverBox(ids.reduce((b, id) => union(b, PBY[id].mb), [...PBY[ids[0]].mb]))});
  }
  return out;
};
type MapOpts = {id: string; t: number; cam: Cam; dim?: number; eyes?: boolean; moods?: Record<string, EyeMood>; hi?: string; arrows?: boolean};
const WorldMap: React.FC<{st: State} & MapOpts> = ({st, id, t, cam, dim = 0, eyes = true, moods = {}, hi, arrows = true}) => {
  const {own, active} = st;
  const cl = clusters(own);
  const ovs = active.map((a, i) => {
    const lb = a.lp.reduce((b, c) => union(b, GC[c].b), [...GC[a.lp[0]].b]);
    const wh = GC[a.w]?.home || center(lb);
    const lc = center(lb); const dx = wh[0] - lc[0], dy = wh[1] - lc[1], dl = Math.hypot(dx, dy) || 1; const half = Math.hypot(lb[2] - lb[0], lb[3] - lb[1]) / 2;
    const A: P = [lc[0] + (dx / dl) * Math.min(dl, half), lc[1] + (dy / dl) * Math.min(dl, half)];
    const R = Math.max(...[[lb[0], lb[1]], [lb[2], lb[1]], [lb[0], lb[3]], [lb[2], lb[3]]].map(([x, y]) => Math.hypot(x - A[0], y - A[1]))) * 1.05;
    const fin = {...own}; for (const c of a.lp) fin[c] = a.w; const fcs = clusters(fin).filter((k) => k.o === a.w && k.ids.some((pid) => a.lp.includes(PBY[pid].c)));
    return {i, a, A, R, lc, wh, parts: fcs.map((k) => ({box: k.box, ids: k.ids.filter((pid) => a.lp.includes(PBY[pid].c))}))};
  });
  const inv = 1 / cam.s;
  const area: Record<string, number> = {}; for (const c of C) area[own[c]] = (area[own[c]] || 0) + GC[c].area;
  const actW = new Set(active.map((a) => a.w)); const actL = new Map(active.map((a) => [a.l, a.q]));
  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <defs>
        {cl.map((k, i) => <mask key={i} id={`${id}m${i}`} maskUnits="userSpaceOnUse" x={-100} y={-100} width={2200} height={1300}>{k.ids.map((pid) => <path key={pid} d={PBY[pid].d} fill="#fff" stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" fillRule="evenodd" />)}</mask>)}
        {ovs.map((o) => <React.Fragment key={o.i}>{o.parts.map((pt, j) => <mask key={j} id={`${id}o${o.i}_${j}`} maskUnits="userSpaceOnUse" x={-100} y={-100} width={2200} height={1300}>{pt.ids.map((pid) => <path key={pid} d={PBY[pid].d} fill="#fff" stroke="#fff" strokeWidth={1.6} fillRule="evenodd" />)}</mask>)}<clipPath id={`${id}c${o.i}`}><circle cx={o.A[0]} cy={o.A[1]} r={Math.max(0.01, o.R * o.a.q)} /></clipPath></React.Fragment>)}
      </defs>
      <g transform="translate(1.2,2.2)" opacity={0.35}><path d={LAND} fill="#06213f" /></g>
      <path d={LAND} fill="#c9ced6" />
      {cl.map((k, i) => <g key={i} mask={`url(#${id}m${i})`}><FlagSvg code={k.o} b={k.box} /></g>)}
      {ovs.map((o) => <g key={o.i} clipPath={`url(#${id}c${o.i})`}>{o.parts.map((pt, j) => <g key={j} mask={`url(#${id}o${o.i}_${j})`}><FlagSvg code={o.a.w} b={pt.box} /></g>)}</g>)}
      {ovs.map((o) => <circle key={'r' + o.i} cx={o.A[0]} cy={o.A[1]} r={o.R * o.a.q} fill="none" stroke="#fff" strokeWidth={2.4 * Math.min(1, inv * 1.5)} opacity={0.85 * (1 - o.a.q) * Math.min(1, o.a.q * 8)} />)}
      {BP.map((bp, i) => { if (own[bp.a] === own[bp.b]) return null; let op = 1; for (const o of ovs) if ((o.a.lp.includes(bp.a) && own[bp.b] === o.a.w) || (o.a.lp.includes(bp.b) && own[bp.a] === o.a.w)) op = 1 - o.a.q; return op > 0.02 ? <path key={i} d={bp.d} fill="none" stroke={INK} strokeWidth={Math.min(1.6, 2.2 * inv)} strokeLinecap="round" opacity={op} /> : null; })}
      <path d={COAST} fill="none" stroke={INK} strokeWidth={Math.min(1.9, 2.6 * inv)} strokeLinejoin="round" />
      {hi && <g>{C.filter((c) => own[c] === hi).map((c) => <path key={c} d={GC[c].d} fill="none" stroke={YELLOW} strokeWidth={4 * inv} opacity={0.6 + 0.4 * Math.sin(t * 7)} />)}</g>}
      {arrows && ovs.filter((o) => o.a.dq >= 0.5 && GC[o.a.w]).map((o) => { const d = Math.hypot(o.lc[0] - o.wh[0], o.lc[1] - o.wh[1]); if (d < 6) return null;
        return <PathArrow key={'a' + o.i} pts={arcPath(o.wh, o.lc, Math.min(40, d * 0.22))} t={t} t0={o.a.ti - 0.05} t1={o.a.ti + o.a.dq * 0.45} color="rgba(229,50,45,0.92)" w={Math.max(2, 6 * inv)} fadeAfter={o.a.dq * 0.9} />; })}
      {ovs.filter((o) => o.a.dq >= 0.3).map((o) => <Boom key={'b' + o.i} p={o.lc} t={t} at={o.a.ti + o.a.dq * 0.3} r={Math.max(6, 26 * inv)} />)}
      {eyes && Object.keys(area).filter((o) => GC[o]).map((o) => {
        const r = Math.max(2.5, Math.min(30, Math.sqrt(area[o]) * 0.2)); if (r * cam.s < 8 && !moods[o]) return null;
        const lq = actL.get(o); const mood: EyeMood = moods[o] || (lq != null ? 'dead' : actW.has(o) ? 'fire' : 'calm');
        const h = GC[o].home; const pw = st.pw[o] || P0[o]; const rr = Math.max(r, moods[o] ? 9 * inv : 0);
        return <Eyes key={o} x={h[0]} y={h[1]} r={rr} mood={mood} look={[Math.sin(t * 0.7 + o.charCodeAt(0)) * 0.6, 0]} t={t} seed={o.charCodeAt(0) + o.charCodeAt(1)} power={rr * cam.s > 13 ? fmtK(pw) : undefined} alpha={lq != null ? 1 - lq : 1} />;
      })}
      {dim > 0 && <rect x={-400} y={-400} width={2800} height={1900} fill="#050b18" opacity={dim} />}
    </svg>
  );
};
const Sea: React.FC = () => <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #2f7fc4 0%, #1d5c9e 60%, #123f75 100%)'}} />;
const ID: Record<string, string> = Object.fromEntries(C.map((c) => [c, c]));
const still = (own: Record<string, string>): State => ({own, pw: {...P0}, active: [], alive: 0, last: []});

// ---------- interfaz ----------
const Pill: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => <div style={{background: 'rgba(12,16,26,0.88)', border: '3px solid rgba(255,255,255,0.15)', borderRadius: 16, padding: '8px 22px 4px', ...font, color: '#fff', ...style}}>{children}</div>;
// tarjeta VS: poder de cada uno, probabilidad, resultado
const VSCard: React.FC<{t: number; sim: Sim; v: {i: number; t0: number; t1: number; kind: string}; cx?: number}> = ({t, sim, v, cx = 960}) => {
  const [w, , a, d, pa, pb, prob] = sim.ev[v.i]; const ti = sim.t[v.i];
  const k = popT(t, v.t0, 13) * lerp(t, v.t1 - 0.25, v.t1, 1, 0); const done = t >= ti;
  const fill = lerp(t, v.t0 + 0.4, v.t0 + 1.2, 0.5, prob);
  if (v.kind === 'mini') return <div style={{position: 'absolute', left: cx - 600, width: 1200, top: 124, display: 'flex', justifyContent: 'center', transform: `scale(${k})`}}>
    <Pill style={{display: 'flex', alignItems: 'center', gap: 14, fontSize: 42, padding: '10px 26px 6px'}}><WFlag code={a} w={72} h={48} /><span style={{color: done && w === a ? YELLOW : '#fff'}}>{nm(a)}</span><span style={{color: '#ff6b6b'}}>⚔️</span><span style={{color: done && w === d ? YELLOW : '#fff'}}>{nm(d)}</span><WFlag code={d} w={72} h={48} /><span style={{...font2, fontSize: 32, color: '#9fd0ff'}}>{pctS(prob)} chance</span>{done && <span style={{color: '#7dff6a'}}>✔</span>}</Pill></div>;
  const side = (c: string, p: number, left: boolean) => { const isW = done && w === c, isL = done && w !== c;
    return <div style={{display: 'flex', flexDirection: left ? 'row' : 'row-reverse', alignItems: 'center', gap: 16, flex: 1, opacity: isL ? 0.45 : 1, transform: `scale(${isW ? 1 + 0.08 * Math.max(0, 1 - (t - ti) * 2) : 1})`}}>
      <div style={{position: 'relative'}}><WFlag code={c} w={120} h={80} />{isL && <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: 80, color: RED, ...OUT}}>✖</div>}</div>
      <div style={{textAlign: left ? 'left' : 'right'}}><div style={{...font, fontSize: 40, color: isW ? YELLOW : '#fff', lineHeight: 1, whiteSpace: 'nowrap'}}>{nm(c)}</div><div style={{...font2, fontSize: 26, color: '#cfd8e6', marginTop: 4}}>🪖 {fmtK(p)}</div>{isW && <div style={{...font, fontSize: 34, color: '#7dff6a', marginTop: 2}}>WINS!</div>}</div></div>; };
  return <div style={{position: 'absolute', left: cx - 560, width: 1120, bottom: 34, transform: `scale(${k})`, transformOrigin: 'center bottom'}}>
    <div style={{background: 'rgba(10,14,24,0.93)', border: `4px solid ${YELLOW}`, borderRadius: 24, padding: '14px 26px 14px', boxShadow: '0 14px 50px rgba(0,0,0,0.55)'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18}}>{side(a, pa, true)}<div style={{...font, fontSize: 50, color: '#ff4f5e', ...OUT}}>VS</div>{side(d, pb, false)}</div>
      <div style={{position: 'relative', height: 30, marginTop: 12, borderRadius: 15, overflow: 'hidden', background: '#2f6fe4', border: '3px solid rgba(255,255,255,0.8)'}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${fill * 100}%`, background: '#e5484d'}} />
        <div style={{position: 'absolute', left: 12, top: 1, ...font, fontSize: 24, color: '#fff'}}>{pctS(prob)}</div>
        <div style={{position: 'absolute', right: 12, top: 1, ...font, fontSize: 24, color: '#fff'}}>{pctS(1 - prob)}</div>
      </div></div></div>;
};
const SimHud: React.FC<{t: number; n: number; st: State; t0: number; showFeed: boolean}> = ({t, n, st, t0, showFeed}) => (
  <>
    <div style={{position: 'absolute', left: 36, top: 30, transform: `scale(${popT(t, t0)})`, transformOrigin: 'left top', display: 'flex', gap: 14}}>
      <Pill style={{fontSize: 40, color: YELLOW}}>SIMULATION #{fmt(n)}</Pill>
      <Pill style={{fontSize: 40}}>ALIVE <span style={{color: '#ff6b8b'}}>{st.alive}</span></Pill>
    </div>
    {showFeed && <div style={{position: 'absolute', left: 36, bottom: 40, display: 'flex', flexDirection: 'column', gap: 8}}>
      {st.last.map(([w, l], i) => <div key={i + w + l} style={{display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(12,16,26,0.85)', borderRadius: 12, padding: '6px 16px 3px', ...font2, fontSize: 28, color: '#fff', opacity: 0.55 + 0.45 * ((i + 1) / st.last.length)}}><WFlag code={w} w={44} h={30} /><span style={{color: YELLOW}}>{nm(w)}</span> eliminated <span style={{color: '#ff8080'}}>{nm(l)}</span> ☠️</div>)}
    </div>}
  </>
);
const Card: React.FC<{t: number; t0: number; t1: number; code?: string; big: string; sub?: string; col?: string; top?: number; left?: number; right?: number; size?: number}> = ({t, t0, t1, code, big, sub, col = YELLOW, top = 380, left = 0, right = 0, size = 92}) => {
  if (t < t0 || t > t1) return null; const k = popT(t, t0) * lerp(t, t1 - 0.25, t1, 1, 0);
  return <div style={{position: 'absolute', left, right, top, display: 'flex', justifyContent: 'center', transform: `scale(${k})`}}>
    <div style={{background: 'rgba(12,16,26,0.92)', border: `5px solid ${col}`, borderRadius: 26, padding: '16px 40px 8px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 14px 50px rgba(0,0,0,0.55)'}}>
      {code && <WFlag code={code} w={size * 1.5} h={size} />}
      <div style={{textAlign: 'center'}}><div style={{...font, fontSize: size, color: col, lineHeight: 1, ...OUT}}>{big}</div>{sub && <div style={{...font2, fontSize: size * 0.42, color: '#fff', marginTop: 8}}>{sub}</div>}</div></div></div>;
};
const BANNERS = TL.banners as [number, string][];
const Banner: React.FC<{t: number}> = ({t}) => { const b = BANNERS.find(([t0]) => t >= t0 && t < t0 + 1.8); if (!b) return null; const k = popT(t, b[0], 12) * lerp(t, b[0] + 1.5, b[0] + 1.8, 1, 0);
  return <div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center', transform: `scale(${k})`}}><div style={{background: RED, border: `4px solid ${INK}`, borderRadius: 18, padding: '10px 40px 4px', ...font, fontSize: 64, color: '#fff', ...OUT}}>{b[1]}</div></div>; };

// ---------- escena: una partida (mapa + VS + HUD) ----------
const SimView: React.FC<{t: number; k: string; n: number; hud: boolean; cx?: number; hiWin?: boolean}> = ({t, k, n, hud, cx = 960, hiWin}) => {
  const sim = SIMS[k]; const st = stateAt(k, t); const cam = camAt(t); const v = vsAt(k, t);
  const moods: Record<string, EyeMood> = {};
  if (v) { const [w, , a, d] = sim.ev[v.i]; const done = t >= sim.t[v.i]; moods[a] = done ? (w === a ? 'cool' : 'dead') : 'fire'; moods[d] = done ? (w === d ? 'cool' : 'dead') : 'scared'; }
  if (st.alive <= 1) moods[sim.win] = 'cool';
  return <>
    <CamBox cam={cam}><WorldMap st={st} id={k} t={t} cam={cam} moods={moods} hi={hiWin ? sim.win : undefined} /></CamBox>
    {hud && <SimHud t={t} n={n} st={st} t0={sim.t.find((x) => x > 0) ?? t} showFeed={!v} />}
    {v && <VSCard t={t} sim={sim} v={v} cx={cx} />}
  </>;
};

// ---------- montaje: 9 partidas a la vez ----------
const PAL = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#ff8ad8'];
const colOf = (c: string) => PAL[(c.charCodeAt(0) * 7 + c.charCodeAt(1) * 13) % PAL.length];
const Montage: React.FC<{t: number; sc: any}> = ({t, sc}) => {
  const sims = sc.sims as {seed: number; win: string; ev: [string, string][]}[]; const D = sc.t1 - sc.t0; const per = (D - 0.4) / 4;
  const u = Math.min(1, (t - sc.t0) / (D - 0.6)); const n = Math.min(1000, Math.max(2, Math.round(2 + Math.pow(u, 2.6) * 998)));
  const W = 600, H = 318; const sx = W / (LB[2] - LB[0]), sy = H / (LB[3] - LB[1]); const s = Math.min(sx, sy);
  return <AbsoluteFill style={{background: '#0b1830'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 18, textAlign: 'center', ...font, fontSize: 70, color: YELLOW, ...OUT}}>SIMULATION #{fmt(n)}</div>
    {Array.from({length: 9}, (_, cell) => {
      const cyc = Math.min(3, Math.floor((t - sc.t0) / per)); const sm = sims[cell + cyc * 9]; const lt = (t - sc.t0) - cyc * per; const ra = Math.min(1, lt / (per - 0.6));
      const ne = Math.floor(sm.ev.length * Math.pow(ra, 0.8)); const own: Record<string, string> = Object.fromEntries(C.map((c) => [c, c]));
      for (let i = 0; i < ne; i++) { const [w, l] = sm.ev[i]; for (const c of C) if (own[c] === l) own[c] = w; }
      const done = ra >= 1; const x = 24 + (cell % 3) * (W + 24), y = 120 + Math.floor(cell / 3) * (H + 18);
      return <div key={cell} style={{position: 'absolute', left: x, top: y, width: W, height: H, borderRadius: 14, overflow: 'hidden', background: '#1d5c9e', border: `3px solid ${done ? YELLOW : 'rgba(255,255,255,0.25)'}`}}>
        <svg width={W} height={H}><g transform={`translate(${(W - (LB[2] - LB[0]) * s) / 2 - LB[0] * s},${(H - (LB[3] - LB[1]) * s) / 2 - LB[1] * s}) scale(${s})`}>
          {C.map((c) => <path key={c} d={GC[c].d} fill={colOf(own[c])} stroke="#0d1320" strokeWidth={0.6} />)}</g></svg>
        <div style={{position: 'absolute', left: 8, top: 6, ...font2, fontSize: 18, color: '#fff', textShadow: '0 2px 3px #000'}}>#{sm.seed + 1}</div>
        {done && <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'rgba(0,0,0,0.35)', transform: `scale(${popT(t, sc.t0 + cyc * per + per - 0.6)})`}}><WFlag code={sm.win} w={84} h={56} /><span style={{...font, fontSize: 40, color: YELLOW, ...OUT}}>{nm(sm.win)} WINS</span></div>}
      </div>; })}
  </AbsoluteFill>;
};

// ---------- escenas de datos ----------
const FlagGrid: React.FC<{t: number; t0: number; list: string[]; cols: number; w: number; cross?: boolean; label?: (c: string) => string}> = ({t, t0, list, cols, w, cross, label}) => (
  <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 10}}>
    {list.map((c, i) => { const ti = t0 + 0.2 + (i / list.length) * 2.0; const k = popT(t, ti, 14); const x = cross && t > ti + 1.7 + (i % 7) * 0.05;
      return <div key={c} style={{position: 'relative', transform: `scale(${k})`, opacity: x ? 0.55 : 1, display: 'flex', flexDirection: 'column', alignItems: 'center'}}><WFlag code={c} w={w} h={w * 0.67} />{x && <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: w * 0.67, display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: w * 0.6, color: RED, ...OUT}}>✖</div>}{label && <div style={{...font, fontSize: 20, color: '#fff', marginTop: 4, whiteSpace: 'nowrap'}}>{label(c)}</div>}</div>; })}
  </div>
);
const Dim: React.FC<{t: number; d?: number; own?: Record<string, string>; hi?: string; cam?: Cam}> = ({t, d = 0.7, own = ID, hi, cam = WORLD}) => <CamBox cam={cam}><WorldMap st={still(own)} id="dm" t={t} cam={cam} dim={d} eyes={false} hi={hi} /></CamBox>;
const RANKS = TL.ranks as {r: number; c: string; wins: number; finals: number; avgp: number; nem: [string, number]; seed: number; t0: number; ta: number; t1: number}[];
const Board: React.FC<{t: number; cur: number}> = ({t, cur}) => {
  const max = RANKS[RANKS.length - 1].wins;
  return <div style={{position: 'absolute', right: 22, top: 22, bottom: 22, width: 470, background: 'rgba(10,14,24,0.92)', border: '3px solid rgba(255,255,255,0.15)', borderRadius: 22, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 7}}>
    <div style={{...font, fontSize: 40, color: YELLOW, textAlign: 'center'}}>🏆 MOST WINS</div>
    <div style={{...font2, fontSize: 18, color: '#9fb0c8', textAlign: 'center', marginTop: -6}}>OUT OF 1,000 WORLD WARS</div>
    {Array.from({length: 10}, (_, i) => i + 1).map((r) => { const R = RANKS.find((x) => x.r === r)!; const shown = t >= R.t0 + 0.2; const isCur = r === cur; const k = shown ? popT(t, R.t0 + 0.2) : 0;
      const bw = shown ? lerp(t, R.t0 + 0.3, R.t0 + 1.3, 0, R.wins / max) : 0;
      return <div key={r} style={{position: 'relative', height: 76, borderRadius: 12, background: isCur ? 'rgba(255,210,63,0.18)' : 'rgba(255,255,255,0.05)', border: isCur ? `3px solid ${YELLOW}` : '3px solid transparent', display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${bw * 100}%`, background: r === 1 ? 'rgba(255,210,63,0.3)' : 'rgba(79,163,255,0.24)'}} />
        <span style={{...font, fontSize: 34, color: r <= 3 ? YELLOW : '#cfd8e6', width: 54, position: 'relative'}}>#{r}</span>
        {shown ? <div style={{display: 'flex', alignItems: 'center', gap: 10, transform: `scale(${k})`, transformOrigin: 'left center', position: 'relative', flex: 1}}><WFlag code={R.c} w={58} h={40} /><span style={{...font, fontSize: 28, color: '#fff', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{nm(R.c)}</span><span style={{...font, fontSize: 34, color: YELLOW}}>{R.wins}</span></div>
          : <span style={{...font, fontSize: 30, color: 'rgba(255,255,255,0.25)', position: 'relative'}}>???</span>}
      </div>; })}
  </div>;
};
const RankHeader: React.FC<{t: number; R: (typeof RANKS)[number]}> = ({t, R}) => {
  const big = lerp(t, R.t0 + 2.4, R.t0 + 3.0, 1, 0);   // primero grande en el centro, luego sube como cabecera
  const k = popT(t, R.t0, 12);
  const y = 380 * big + 22 * (1 - big), sc = (R.r === 1 ? 1.55 : 1.3) * big + 1 * (1 - big);
  const chip = (s: React.ReactNode, i: number) => <div key={i} style={{transform: `scale(${popT(t, R.t0 + 3.0 + i * 0.35)})`}}><Pill style={{...font2, fontSize: 26, padding: '6px 16px 3px', display: 'flex', alignItems: 'center', gap: 8}}>{s}</Pill></div>;
  return <>
    <div style={{position: 'absolute', left: 0, width: 1420, top: y, display: 'flex', justifyContent: 'center', transform: `scale(${k * sc})`, transformOrigin: 'center top'}}>
      <div style={{background: 'rgba(10,14,24,0.94)', border: `5px solid ${R.r <= 3 ? YELLOW : '#fff'}`, borderRadius: 22, padding: '10px 30px 6px', display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 10px 40px rgba(0,0,0,0.5)'}}>
        <span style={{...font, fontSize: 70, color: YELLOW, ...OUT}}>#{R.r}</span><WFlag code={R.c} w={96} h={64} />
        <div><div style={{...font, fontSize: 56, color: '#fff', lineHeight: 1}}>{nm(R.c)}</div><div style={{...font2, fontSize: 24, color: '#cfd8e6'}}>{R.wins} / 1,000 WINS · {(R.wins / 10).toFixed(1)}%</div></div></div></div>
    {big < 0.05 && <div style={{position: 'absolute', left: 0, width: 1420, top: 128, display: 'flex', justifyContent: 'center', gap: 12}}>
      {[<>🏁 {R.finals} FINALS</>, <>📍 AVG PLACE #{Math.round(R.avgp)}</>, <>☠️ NEMESIS <WFlag code={R.nem[0]} w={36} h={24} /> {nm(R.nem[0])} ×{R.nem[1]}</>].map(chip)}
    </div>}
  </>;
};

export const Sim1000: React.FC = () => {
  usePreload();
  const t = useCurrentFrame() / 30;
  const SC = (TL.scenes as any[]).filter((s) => t >= s.t0 && t < s.t1);
  const base = SC.find((s) => s.kind !== 'card');
  const nodes: React.ReactNode[] = []; const cards: React.ReactNode[] = [];
  const shake = (() => { let a = 0; for (const k in SIMS) for (const v of SIMS[k].vs) { if (v.kind !== 'big') continue; const d = t - SIMS[k].t[v.i]; if (d >= 0 && d < 0.35) a = Math.max(a, (1 - d / 0.35) * 9); } return a; })();
  if (!base) nodes.push(<Dim key="d" t={t} d={0.35} />);
  for (const s of SC) {
    if (s.kind === 'hook') { const k = s.keys.find((kk: string) => { const v = SIMS[kk].vs[SIMS[kk].vs.length - 1]; return t < v.t1; }) || s.keys[s.keys.length - 1];
      nodes.push(<SimView key="hk" t={t} k={k} n={SIMS[k].seed + 1} hud={false} />);
      nodes.push(<div key="hc" style={{position: 'absolute', left: 0, right: 0, top: 34, textAlign: 'center', ...font, fontSize: 84, color: YELLOW, ...OUT}}>SIMULATION #{fmt(SIMS[k].seed + 1)}</div>);
      if (t > 7.9) nodes.push(<div key="hq" style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', transform: `scale(${popT(t, 7.9, 11)})`}}><div style={{display: 'inline-block', background: RED, border: `6px solid ${INK}`, borderRadius: 26, padding: '16px 50px 8px', ...font, fontSize: 110, color: '#fff', ...OUT}}>WHO WINS THE MOST?</div></div>);
      nodes.push(<div key="ht" style={{position: 'absolute', left: 0, right: 0, top: 140, display: 'flex', justifyContent: 'center', transform: `scale(${popT(t, 0.6)})`}}><Pill style={{fontSize: 46}}>189 COUNTRIES · <span style={{color: YELLOW}}>1,000</span> WORLD WARS</Pill></div>);
    }
    if (s.kind === 'sim') nodes.push(<SimView key={s.key} t={t} k={s.key} n={s.n} hud={s.hud} />, <Banner key="bn" t={t} />);
    if (s.kind === 'card') cards.push(<Card key={'c' + s.t0} t={t} t0={s.t0} t1={s.t1} code={s.code} big={s.big} sub={s.sub} top={s.code ? 360 : 400} />);
    if (s.kind === 'montage') nodes.push(<Montage key="mt" t={t} sc={s} />);
    if (s.kind === 'never') nodes.push(<React.Fragment key="nv"><Dim t={t} d={0.75} /><div style={{position: 'absolute', left: 0, right: 0, top: 36, textAlign: 'center', transform: `scale(${popT(t, s.t0)})`, ...font, fontSize: 84, color: '#fff', ...OUT}}><span style={{color: '#ff6b6b'}}>{s.list.length}</span> COUNTRIES NEVER WON</div>
      <div style={{position: 'absolute', left: 110, right: 110, top: 160}}><FlagGrid t={t} t0={s.t0} list={s.list} cols={14} w={88} cross /></div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 34, textAlign: 'center', transform: `scale(${popT(t, s.t0 + 3.0)})`, ...font, fontSize: 60, color: YELLOW, ...OUT}}>0 WINS IN 1,000 WORLD WARS</div></React.Fragment>);
    if (s.kind === 'spot') { const b = union(GC[s.c].b, GC[s.foe].b); const cw = b[2] - b[0], ch = b[3] - b[1]; const zs = Math.min(1920 / (cw * 2.2), 1080 / (ch * 2.2)); const q = ease(Math.min(1, (t - s.t0) / 1.2));
      const cam = {cx: WORLD.cx + ((b[0] + b[2]) / 2 - 230 / zs - WORLD.cx) * q, cy: WORLD.cy + ((b[1] + b[3]) / 2 - WORLD.cy) * q, s: WORLD.s * Math.pow(Math.max(WORLD.s, zs) / WORLD.s, q)};
      nodes.push(<React.Fragment key="sp"><CamBox cam={cam}><WorldMap st={still(ID)} id="sp" t={t} cam={cam} eyes={false} hi={s.c} dim={0} /></CamBox>
        <div style={{position: 'absolute', left: 60, top: 260, transform: `scale(${popT(t, s.t0 + 0.5)})`, transformOrigin: 'left center'}}>
          <div style={{background: 'rgba(10,14,24,0.94)', border: `5px solid ${YELLOW}`, borderRadius: 24, padding: '18px 30px 14px', width: 640}}>
            <div style={{...font2, fontSize: 28, color: '#9fb0c8'}}>STRONGEST ARMY THAT NEVER WON</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 8}}><WFlag code={s.c} w={120} h={80} /><div style={{...font, fontSize: 72, color: YELLOW, ...OUT}}>{s.big}</div></div>
            <div style={{...font, fontSize: 40, color: '#fff', marginTop: 8}}>{s.sub}</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, transform: `scale(${popT(t, s.t0 + 5.0)})`, transformOrigin: 'left center', ...font2, fontSize: 32, color: '#fff'}}>☠️ Eliminated by <WFlag code={s.foe} w={54} h={36} /><span style={{color: '#ff8080', ...font}}>{nm(s.foe)}</span> <span style={{...font, color: YELLOW}}>{s.foeN}×</span></div>
          </div></div></React.Fragment>); }
    if (s.kind === 'once') nodes.push(<React.Fragment key="on"><Dim t={t} d={0.75} /><div style={{position: 'absolute', left: 0, right: 0, top: 80, textAlign: 'center', transform: `scale(${popT(t, s.t0)})`, ...font, fontSize: 84, color: '#fff', ...OUT}}><span style={{color: YELLOW}}>{s.list.length}</span> COUNTRIES WON <span style={{color: YELLOW}}>ONCE</span></div>
      <div style={{position: 'absolute', left: 140, right: 140, top: 280}}><FlagGrid t={t} t0={s.t0} list={s.list} cols={8} w={150} label={(c) => nm(c)} /></div></React.Fragment>);
    if (s.kind === 'finals') { const mx = s.list[0][2]; nodes.push(<React.Fragment key="fn"><Dim t={t} d={0.78} /><div style={{position: 'absolute', left: 0, right: 0, top: 60, textAlign: 'center', transform: `scale(${popT(t, s.t0)})`, ...font, fontSize: 84, color: '#fff', ...OUT}}>MOST COMMON <span style={{color: YELLOW}}>FINALS</span></div>
      <div style={{position: 'absolute', left: 260, right: 260, top: 220, display: 'flex', flexDirection: 'column', gap: 18}}>
        {s.list.map(([a, b, n]: [string, string, number], i: number) => <div key={i} style={{position: 'relative', height: 120, borderRadius: 18, background: i === 0 ? 'rgba(255,210,63,0.16)' : 'rgba(255,255,255,0.07)', border: i === 0 ? `4px solid ${YELLOW}` : '4px solid transparent', display: 'flex', alignItems: 'center', gap: 20, padding: '0 26px', transform: `scale(${popT(t, s.t0 + 0.4 + (4 - i) * 0.35)})`, overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(n / mx) * lerp(t, s.t0 + 0.6 + (4 - i) * 0.35, s.t0 + 1.6 + (4 - i) * 0.35, 0, 100)}%`, background: 'rgba(79,163,255,0.22)'}} />
          <WFlag code={a} w={96} h={64} /><span style={{...font, fontSize: 48, color: '#fff', position: 'relative'}}>{nm(a)}</span><span style={{...font, fontSize: 44, color: '#ff4f5e', position: 'relative'}}>VS</span><span style={{...font, fontSize: 48, color: '#fff', position: 'relative'}}>{nm(b)}</span><WFlag code={b} w={96} h={64} />
          <span style={{...font, fontSize: 60, color: YELLOW, marginLeft: 'auto', position: 'relative'}}>×{n}</span></div>)}
      </div></React.Fragment>); }
    if (s.kind === 'toptitle') nodes.push(<React.Fragment key="tt"><Dim t={t} d={0.55} cam={{...WORLD, cx: WORLD.cx + 250 / WORLD.s}} /><Board t={t} cur={0} /><div style={{position: 'absolute', left: 0, width: 1420, top: 390, textAlign: 'center', transform: `scale(${popT(t, s.t0)})`, ...font, fontSize: 140, color: '#fff', ...OUT}}>THE <span style={{color: YELLOW}}>TOP 10</span></div></React.Fragment>);
    if (s.kind === 'rank') { const R = RANKS.find((x) => x.r === s.r)!;
      nodes.push(<React.Fragment key={'rk' + s.r}><SimView t={t} k={s.key} n={s.n} hud={false} cx={700} hiWin={false} /><Board t={t} cur={s.r} /><RankHeader t={t} R={R} />
        <div style={{position: 'absolute', left: 30, bottom: 300, ...font2, fontSize: 22, color: 'rgba(255,255,255,0.85)', textShadow: '0 2px 3px #000'}}>Simulation #{fmt(s.n)} · one of its wins</div></React.Fragment>); }
    if (s.kind === 'question') nodes.push(<React.Fragment key="q"><AbsoluteFill style={{background: 'radial-gradient(ellipse at 40% 45%, #1b2a4a 0%, #070b14 85%)'}} /><Board t={t} cur={1} />
      <div style={{position: 'absolute', left: 40, width: 1360, top: 300, textAlign: 'center', transform: `scale(${popT(t, s.t0)})`}}>
        <div style={{...font, fontSize: 100, color: '#fff', ...OUT, lineHeight: 1.1}}>WHICH COUNTRY DESERVES</div>
        <div style={{...font, fontSize: 170, color: YELLOW, ...OUT, WebkitTextStroke: `8px ${INK}`}}>#1 ?</div>
        <div style={{...font2, fontSize: 46, color: '#fff', marginTop: 10}}>💬 Tell me in the comments</div></div></React.Fragment>);
  }
  return <AbsoluteFill style={{overflow: 'hidden', background: '#123f75'}}>
    <Sea /><div style={{position: 'absolute', inset: 0, transform: shake ? `translate(${Math.sin(t * 90) * shake}px,${Math.cos(t * 70) * shake}px)` : undefined}}>{nodes}{cards}</div>
    <div style={{position: 'absolute', left: 20, bottom: 6, ...font2, fontSize: 15, color: 'rgba(255,255,255,0.6)'}}>Simulation · win odds based on active troops (IISS) · not a prediction</div>
  </AbsoluteFill>;
};
