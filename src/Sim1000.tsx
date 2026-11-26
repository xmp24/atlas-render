// "I Simulated a World War 1,000 Times" — prueba v2. Mapa real + timelapses de partidas reales + Top 10.
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
const T = TL.T as Record<string, number[]>;
export const s1kFrames = () => Math.round(TL.END * 30);
const NAME = TL.names as Record<string, string>;
const nm = (c: string) => (NAME[c] || c).toUpperCase();
const P0 = TL.p0 as Record<string, number>;
const LAND = C.map((c) => GC[c].d).join('');
const COAST = GEO.coast as string;
const nums = (d: string) => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; const re = /(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g; let m; while ((m = re.exec(d))) { const x = +m[1], y = +m[2]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return [x0, y0, x1, y1]; };
const BP = Object.entries(GEO.borders as Record<string, string>).map(([k, d]) => { const [a, b] = k.split('|'); return {a, b, d}; });
const union = (a: number[], b: number[]) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])];
const coverBox = (b: number[]) => { const w = Math.max(1, b[2] - b[0]), h = Math.max(1, b[3] - b[1]), cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2; const r = Math.min(1.75, Math.max(1.25, w / h)); let W2 = w, H2 = h; if (w / h > r) H2 = w / r; else W2 = h * r; return [cx - W2 / 2, cy - H2 / 2, cx + W2 / 2, cy + H2 / 2]; };
const LB = nums(LAND);
const PC = GEO.pieces as {id: string; c: string; d: string; mb: number[]; b: number[]}[];
const PADJ = GEO.adjp as Record<string, string[]>;
const PBY: Record<string, (typeof PC)[number]> = Object.fromEntries(PC.map((p) => [p.id, p]));
const ease = Easing.inOut(Easing.cubic);
const fmtK = (n: number) => (n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 1 : 2) + 'M' : n >= 1e4 ? Math.round(n / 1e3) + 'K' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : String(Math.round(n)));
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

// ---------- estado de una partida en el tiempo ----------
type Sim = {seed: number; win: string; ev: [string, string, number][]; from: number};
type Act = {w: string; l: string; q: number; lp: string[]; ti: number; dq: number; gap: number};
type State = {own: Record<string, string>; pw: Record<string, number>; active: Act[]; alive: number; last: [string, string][]; done: boolean; focus: P | null};
const center = (b: number[]): P => [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
const stateAt = (sim: Sim, ta: number, tb: number, t: number): State => {
  const own: Record<string, string> = Object.fromEntries(C.map((c) => [c, c]));
  const pw: Record<string, number> = {...P0};
  const i0 = Math.floor(sim.ev.length * sim.from); const n = sim.ev.length - i0;
  const active: Act[] = []; let alive = C.length; const last: [string, string][] = []; let focus: P | null = null;
  const tAt = (k: number) => ta + (tb - ta) * Math.pow((k + 1) / n, 0.62);
  for (let i = 0; i < sim.ev.length; i++) {
    const k = i - i0; const ti = k < 0 ? -1e9 : tAt(k);
    if (ti > t) break;
    const [w, l, p] = sim.ev[i]; const gap = k >= 0 && k + 1 < n ? tAt(k + 1) - ti : 0.6; const dq = Math.max(0.2, Math.min(0.6, gap * 3));
    const lp = C.filter((c) => own[c] === l);
    if (t - ti < dq) active.push({w, l, q: ease(Math.max(0, (t - ti) / dq)), lp, ti, dq, gap});
    for (const c of lp) own[c] = w;
    pw[w] = p; pw[l] = 0; alive--; if (k >= 0) last.push([w, l]);
    if (lp.length) focus = center(lp.reduce((b, c) => union(b, GC[c].b), [...GC[lp[0]].b]));
  }
  const base = {...own}; for (const a of active) for (const c of a.lp) base[c] = a.l;
  return {own: base, pw, active, alive, last: last.slice(-3), done: alive <= 1 && !active.length, focus};
};

// ---------- cámara: sigue las batallas, suave ----------
type Cam = {cx: number; cy: number; s: number};
const S0 = Math.min(1920 / (LB[2] - LB[0] + 40), 1080 / (LB[3] - LB[1] + 40));
const WORLD: Cam = {cx: (LB[0] + LB[2]) / 2, cy: (LB[1] + LB[3]) / 2, s: S0};
const followCam = (sim: Sim, ta: number, tb: number, t: number, shiftX = 0): Cam => {
  let sx = 0, sy = 0, sw = 0;
  for (let k = 0; k < 10; k++) { const st = stateAt(sim, ta, tb, t - k * 0.22); if (st.focus) { const w = 10 - k; sx += st.focus[0] * w; sy += st.focus[1] * w; sw += w; } }
  const st = stateAt(sim, ta, tb, t);
  const zoom = lerp(st.alive, 4, 60, 1.0, 1.32) * lerp(t, ta, ta + 1.2, 0, 1) * lerp(t, tb - 0.6, tb + 0.4, 1, 0);
  const s = S0 * (1 + Math.max(0, zoom - 1) * 1) * (zoom > 0 ? 1 : 1);
  const S = S0 * Math.max(1, 1 + (Math.max(1, lerp(st.alive, 4, 60, 1.0, 1.32)) - 1) * lerp(t, ta, ta + 1.2, 0, 1) * lerp(t, tb - 0.6, tb + 0.4, 1, 0));
  void s;
  const k = S / S0 - 1; const fx = sw ? sx / sw : WORLD.cx, fy = sw ? sy / sw : WORLD.cy;
  let cx = WORLD.cx + (fx - WORLD.cx) * Math.min(1, k * 2.4), cy = WORLD.cy + (fy - WORLD.cy) * Math.min(1, k * 2.4);
  const hw = 960 / S, hh = 540 / S;
  cx = Math.max(LB[0] - 20 + hw, Math.min(LB[2] + 20 - hw, cx)); cy = Math.max(LB[1] - 20 + hh, Math.min(LB[3] + 20 - hh, cy));
  return {cx: cx + shiftX / S, cy, s: S};
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
const WorldMap: React.FC<{st: State; id: string; t: number; cam: Cam; dim?: number; eyes?: boolean; winner?: string}> = ({st, id, t, cam, dim = 0, eyes = true, winner}) => {
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
  // ojos: un par por país vivo, en su casa, tamaño según su territorio
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
      {ovs.map((o) => <circle key={'r' + o.i} cx={o.A[0]} cy={o.A[1]} r={o.R * o.a.q} fill="none" stroke="#fff" strokeWidth={2.2} opacity={0.8 * (1 - o.a.q) * Math.min(1, o.a.q * 8)} />)}
      {BP.map((bp, i) => { if (own[bp.a] === own[bp.b]) return null; let op = 1; for (const o of ovs) if ((o.a.lp.includes(bp.a) && own[bp.b] === o.a.w) || (o.a.lp.includes(bp.b) && own[bp.a] === o.a.w)) op = 1 - o.a.q; return op > 0.02 ? <path key={i} d={bp.d} fill="none" stroke={INK} strokeWidth={Math.min(1.6, 2.2 * inv)} strokeLinecap="round" opacity={op} /> : null; })}
      <path d={COAST} fill="none" stroke={INK} strokeWidth={Math.min(1.9, 2.6 * inv)} strokeLinejoin="round" />
      {/* flechas y explosiones de las conquistas (solo cuando hay tiempo para verlas) */}
      {ovs.filter((o) => o.a.gap >= 0.22 && GC[o.a.w]).map((o) => { const d = Math.hypot(o.lc[0] - o.wh[0], o.lc[1] - o.wh[1]); if (d < 6) return null;
        return <PathArrow key={'a' + o.i} pts={arcPath(o.wh, o.lc, Math.min(40, d * 0.22))} t={t} t0={o.a.ti - 0.05} t1={o.a.ti + o.a.dq * 0.45} color="rgba(229,50,45,0.92)" w={Math.max(2, 5 * inv)} fadeAfter={o.a.dq * 0.9} />; })}
      {ovs.filter((o) => o.a.gap >= 0.15).map((o) => <Boom key={'b' + o.i} p={o.lc} t={t} at={o.a.ti + o.a.dq * 0.35} r={Math.max(6, 22 * inv)} />)}
      {eyes && Object.keys(area).filter((o) => GC[o]).map((o) => {
        const r = Math.max(2.5, Math.min(30, Math.sqrt(area[o]) * 0.2)); if (r * cam.s < 7) return null;
        const lq = actL.get(o); const mood: EyeMood = winner === o ? 'cool' : lq != null ? 'dead' : actW.has(o) ? 'fire' : 'calm';
        const h = GC[o].home; const pw = st.pw[o] || P0[o];
        return <Eyes key={o} x={h[0]} y={h[1]} r={r} mood={mood} look={[Math.sin(t * 0.7 + o.charCodeAt(0)) * 0.6, 0]} t={t} seed={o.charCodeAt(0) + o.charCodeAt(1)} power={r * cam.s > 12 ? fmtK(pw) : undefined} alpha={lq != null ? 1 - lq : 1} />;
      })}
      {dim > 0 && <rect x={-200} y={-200} width={2400} height={1500} fill="#050b18" opacity={dim} />}
    </svg>
  );
};
const Sea: React.FC = () => <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #2f7fc4 0%, #1d5c9e 60%, #123f75 100%)'}} />;

// ---------- interfaz ----------
const OUT = {textShadow: `4px 4px 0 ${INK}, -2px -2px 0 ${INK}, 2px -2px 0 ${INK}, -2px 2px 0 ${INK}`};
const Pill: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => <div style={{background: 'rgba(12,16,26,0.88)', border: '3px solid rgba(255,255,255,0.15)', borderRadius: 16, padding: '8px 22px 4px', ...font, color: '#fff', ...style}}>{children}</div>;
const SimHud: React.FC<{t: number; n: number; st: State; t0: number}> = ({t, n, st, t0}) => (
  <>
    <div style={{position: 'absolute', left: 36, top: 30, transform: `scale(${popT(t, t0)})`, transformOrigin: 'left top', display: 'flex', gap: 14}}>
      <Pill style={{fontSize: 40, color: YELLOW}}>SIMULATION #{fmt(n)}</Pill>
      <Pill style={{fontSize: 40}}>ALIVE <span style={{color: '#ff6b8b'}}>{st.alive}</span></Pill>
    </div>
    <div style={{position: 'absolute', left: 36, bottom: 34, display: 'flex', flexDirection: 'column', gap: 8}}>
      {st.last.map(([w, l], i) => <div key={i + w + l} style={{display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(12,16,26,0.82)', borderRadius: 12, padding: '5px 14px 2px', ...font2, fontSize: 24, color: '#fff', opacity: 0.55 + 0.45 * ((i + 1) / st.last.length)}}><WFlag code={w} w={38} h={26} /><span style={{color: YELLOW}}>{nm(w)}</span> eliminated <span style={{color: '#ff8080'}}>{nm(l)}</span> ☠️</div>)}
    </div>
  </>
);
const Card: React.FC<{t: number; t0: number; t1: number; code?: string; big: string; sub?: string; col?: string; top?: number; left?: number; right?: number; size?: number}> = ({t, t0, t1, code, big, sub, col = YELLOW, top = 380, left = 0, right = 0, size = 92}) => {
  if (t < t0 || t > t1) return null; const k = popT(t, t0) * lerp(t, t1 - 0.25, t1, 1, 0);
  return <div style={{position: 'absolute', left, right, top, display: 'flex', justifyContent: 'center', transform: `scale(${k})`}}>
    <div style={{background: 'rgba(12,16,26,0.92)', border: `5px solid ${col}`, borderRadius: 26, padding: '16px 40px 8px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 14px 50px rgba(0,0,0,0.55)'}}>
      {code && <WFlag code={code} w={size * 1.5} h={size} />}
      <div style={{textAlign: 'center'}}><div style={{...font, fontSize: size, color: col, lineHeight: 1, ...OUT}}>{big}</div>{sub && <div style={{...font2, fontSize: size * 0.42, color: '#fff', marginTop: 8}}>{sub}</div>}</div></div></div>;
};

// ---------- escenas ----------
const SIMS = TL.sims as Record<string, Sim>;
const ID: Record<string, string> = Object.fromEntries(C.map((c) => [c, c]));
const still = (own: Record<string, string>): State => ({own, pw: {...P0}, active: [], alive: 0, last: [], done: false, focus: null});
const Hook: React.FC<{t: number}> = ({t}) => {
  const [a, b] = T.hook; const snaps = TL.snaps as {seed: number; own: Record<string, string>}[];
  const tEnd = 6.3; const per = tEnd / snaps.length; const i = Math.min(snaps.length - 1, Math.max(0, Math.floor((t - a) / per)));
  const u = Math.min(1, (t - a) / tEnd); const n = Math.max(1, Math.round(Math.pow(u, 2.2) * 1000));
  const own = t < tEnd ? snaps[i].own : ID;
  const flash = t < tEnd ? lerp(t - a - i * per, 0, 0.12, 0.5, 0) : lerp(t, tEnd, tEnd + 0.15, 0.6, 0);
  const cam = {...WORLD, s: S0 * (1.02 + 0.05 * ((t - a) % per) / per)};
  const rules = [['⚔️', 'Countries attack their neighbors'], ['💪', 'Bigger army = better odds'], ['🎲', 'Anything can happen']];
  return <>
    <CamBox cam={cam}><WorldMap st={still(own)} id="hk" t={t} cam={cam} eyes={t >= tEnd} /></CamBox>
    <AbsoluteFill style={{background: '#fff', opacity: flash}} />
    {t < tEnd + 0.3 && <div style={{position: 'absolute', left: 0, right: 0, top: 60, textAlign: 'center', ...font, fontSize: 150, color: YELLOW, ...OUT, WebkitTextStroke: `8px ${INK}`, opacity: lerp(t, tEnd, tEnd + 0.3, 1, 0)}}>#{fmt(n)}</div>}
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 64, display: 'flex', justifyContent: 'center', transform: `scale(${popT(t, a + 0.3) * lerp(t, b - 0.25, b, 1, 0)})`}}>
      <Pill style={{fontSize: 56, padding: '12px 36px 6px'}}>189 COUNTRIES · <span style={{color: YELLOW}}>1,000</span> WORLD WARS</Pill></div>
    <div style={{position: 'absolute', left: 50, top: 70, display: 'flex', flexDirection: 'column', gap: 14}}>
      {rules.map(([ic, s], k) => <div key={k} style={{transform: `scale(${popT(t, tEnd + 0.1 + k * 0.9) * lerp(t, b - 0.25, b, 1, 0)})`, transformOrigin: 'left center'}}><Pill style={{...font2, fontSize: 38, display: 'flex', gap: 14, alignItems: 'center'}}><span style={{fontSize: 42}}>{ic}</span>{s}</Pill></div>)}
    </div>
  </>;
};
const SimScene: React.FC<{t: number; key2: string; ta: number; tb: number; n: number; shiftX?: number; hud?: boolean}> = ({t, key2, ta, tb, n, shiftX = 0, hud = true}) => {
  const sim = SIMS[key2]; const st = stateAt(sim, ta, tb, t); const cam = followCam(sim, ta, tb, t, shiftX);
  return <><CamBox cam={cam}><WorldMap st={st} id={key2} t={t} cam={cam} winner={t > tb + 0.2 ? sim.win : undefined} /></CamBox>{hud && <SimHud t={t} n={n} st={st} t0={ta - 0.3} />}</>;
};
const Never: React.FC<{t: number}> = ({t}) => {
  const [a] = T.never; const L = TL.never as string[]; const cols = 14;
  return <>
    <CamBox cam={WORLD}><WorldMap st={still(Object.fromEntries(C.map((c) => [c, SIMS.s1.win])))} id="nv" t={t} cam={WORLD} dim={0.72} eyes={false} /></CamBox>
    <div style={{position: 'absolute', left: 0, right: 0, top: 44, textAlign: 'center', transform: `scale(${popT(t, a)})`, ...font, fontSize: 80, color: '#fff', ...OUT}}><span style={{color: '#ff6b6b'}}>{L.length}</span> COUNTRIES NEVER WON</div>
    <div style={{position: 'absolute', left: 120, right: 120, top: 170, display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 10}}>
      {L.map((c, i) => { const ti = a + 0.2 + (i / L.length) * 2.2; const k = popT(t, ti, 14); const x = t > ti + 1.8 + (i % 7) * 0.05;
        return <div key={c} style={{position: 'relative', transform: `scale(${k})`, opacity: x ? 0.55 : 1}}><WFlag code={c} w={86} h={58} />{x && <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: 52, color: RED, ...OUT}}>✖</div>}</div>; })}
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, textAlign: 'center', transform: `scale(${popT(t, a + 3.0)})`, ...font, fontSize: 60, color: YELLOW, ...OUT}}>0 WINS IN 1,000 WARS</div>
  </>;
};
// ---------- TOP 10 ----------
const RANKS = TL.ranks as {r: number; c: string; wins: number; seed: number; t0: number; ta: number; tb: number; t1: number}[];
const Board: React.FC<{t: number; cur: number}> = ({t, cur}) => {
  const max = RANKS[RANKS.length - 1].wins;
  return <div style={{position: 'absolute', right: 26, top: 26, bottom: 26, width: 470, background: 'rgba(10,14,24,0.9)', border: '3px solid rgba(255,255,255,0.15)', borderRadius: 22, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 7}}>
    <div style={{...font, fontSize: 40, color: YELLOW, textAlign: 'center'}}>🏆 MOST WINS</div>
    <div style={{...font2, fontSize: 18, color: '#9fb0c8', textAlign: 'center', marginTop: -6}}>OUT OF 1,000 WORLD WARS</div>
    {Array.from({length: 10}, (_, i) => i + 1).map((r) => { const R = RANKS.find((x) => x.r === r)!; const shown = t >= R.t0 + 0.15; const isCur = r === cur; const k = shown ? popT(t, R.t0 + 0.15) : 0;
      const bw = shown ? lerp(t, R.t0 + 0.2, R.t0 + 1.2, 0, R.wins / max) : 0;
      return <div key={r} style={{position: 'relative', height: 76, borderRadius: 12, background: isCur ? 'rgba(255,210,63,0.18)' : 'rgba(255,255,255,0.05)', border: isCur ? `3px solid ${YELLOW}` : '3px solid transparent', display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${bw * 100}%`, background: r === 1 ? 'rgba(255,210,63,0.28)' : 'rgba(79,163,255,0.22)'}} />
        <span style={{...font, fontSize: 34, color: r <= 3 ? YELLOW : '#cfd8e6', width: 52, position: 'relative'}}>#{r}</span>
        {shown ? <div style={{display: 'flex', alignItems: 'center', gap: 10, transform: `scale(${k})`, transformOrigin: 'left center', position: 'relative', flex: 1}}><WFlag code={R.c} w={58} h={40} /><span style={{...font, fontSize: 28, color: '#fff', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{nm(R.c)}</span><span style={{...font, fontSize: 34, color: YELLOW}}>{R.wins}</span></div>
          : <span style={{...font, fontSize: 30, color: 'rgba(255,255,255,0.25)', position: 'relative'}}>???</span>}
      </div>; })}
  </div>;
};
const TopScene: React.FC<{t: number}> = ({t}) => {
  const R = [...RANKS].reverse().find((x) => t >= x.t0) || RANKS[0];
  const intro = t < RANKS[0].t0;
  const cam0 = {...WORLD, cx: WORLD.cx + 250 / WORLD.s};
  return <>
    {intro ? <CamBox cam={cam0}><WorldMap st={still(ID)} id="tp" t={t} cam={cam0} dim={0.45} /></CamBox>
      : <SimScene t={t} key2={'r' + R.r} ta={R.ta} tb={R.tb} n={R.seed + 1} shiftX={250} hud={false} />}
    {!intro && <div style={{position: 'absolute', left: 30, top: 26}}><Pill style={{fontSize: 30, color: '#cfd8e6'}}>SIMULATION #{fmt(R.seed + 1)} · one of its wins</Pill></div>}
    <Board t={t} cur={intro ? 0 : R.r} />
    {intro && <div style={{position: 'absolute', left: 0, width: 1400, top: 400, textAlign: 'center', transform: `scale(${popT(t, T.top[0])})`, ...font, fontSize: 120, color: '#fff', ...OUT}}>THE <span style={{color: YELLOW}}>TOP 10</span></div>}
    {!intro && <Card t={t} t0={R.t0} t1={R.t1 - 0.1} code={R.c} big={`#${R.r} ${nm(R.c)}`} sub={`${R.wins} / 1,000 WINS`} top={R.r === 1 ? 380 : 840} right={500} size={R.r === 1 ? 110 : 62} col={R.r <= 3 ? YELLOW : '#ffffff'} />}
  </>;
};
const Question: React.FC<{t: number}> = ({t}) => {
  const [a] = T.q;
  return <>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 40% 45%, #1b2a4a 0%, #070b14 85%)'}} />
    <Board t={t} cur={1} />
    <div style={{position: 'absolute', left: 40, width: 1360, top: 330, textAlign: 'center', transform: `scale(${popT(t, a)})`}}>
      <div style={{...font, fontSize: 96, color: '#fff', ...OUT, lineHeight: 1.1}}>WHICH COUNTRY DESERVES</div>
      <div style={{...font, fontSize: 150, color: YELLOW, ...OUT, WebkitTextStroke: `8px ${INK}`}}>#1 ?</div>
      <div style={{...font2, fontSize: 44, color: '#fff', marginTop: 10}}>💬 Tell me in the comments</div>
    </div>
  </>;
};

export const Sim1000: React.FC = () => {
  usePreload();
  const t = useCurrentFrame() / 30;
  const s1 = T.sim1, sg = T.sg;
  let scene: React.ReactNode = null;
  if (t < T.hook[1]) scene = <Hook t={t} />;
  else if (t < T.win1[1]) scene = <><SimScene t={t} key2="s1" ta={s1[1]} tb={s1[2]} n={1} />
    <Card t={t} t0={s1[0]} t1={s1[1] + 0.2} big="SIMULATION #1" sub="Let the war begin" />
    <Card t={t} t0={T.win1[0] + 0.3} t1={T.win1[1]} code={SIMS.s1.win} big={`${nm(SIMS.s1.win)} WINS!`} sub="+1 WIN · 999 TO GO" /></>;
  else if (t < T.never[1]) scene = <Never t={t} />;
  else if (t < sg[3]) scene = <><SimScene t={t} key2="sg" ta={sg[1]} tb={sg[2]} n={SIMS.sg.seed + 1} />
    <Card t={t} t0={sg[0]} t1={sg[1]} code="SG" big="SINGAPORE" sub="1 / 1,000 WINS" />
    <Card t={t} t0={sg[2] + 0.1} t1={sg[3]} code="SG" big="SINGAPORE WINS!" sub="The only time it happened" /></>;
  else if (t < T.q[0]) scene = <TopScene t={t} />;
  else scene = <Question t={t} />;
  return <AbsoluteFill style={{overflow: 'hidden', background: '#123f75'}}>
    <Sea />{scene}
    <div style={{position: 'absolute', left: 20, bottom: 8, ...font2, fontSize: 15, color: 'rgba(255,255,255,0.7)'}}>Simulation · win odds based on active troops (IISS) · not a prediction</div>
  </AbsoluteFill>;
};
