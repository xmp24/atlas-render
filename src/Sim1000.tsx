// "I Simulated a World War 1,000 Times" — prueba. Mapa real + timelapses de partidas reales + ranking.
import React from 'react';
import {AbsoluteFill, Easing, useCurrentFrame} from 'remotion';
import TLJ from './s1k-tl.json';
import GEOJ from './s1k-geo.json';
import {INK, RED, YELLOW, lerp, font, font2, popT} from './lib3';
// @ts-ignore
import {FlagSvg, WFlag, usePreload} from './War6';

type P = [number, number];
const TL = TLJ as any;
const GEO = GEOJ as any;
const GC = GEO.countries as Record<string, {d: string; b: number[]; mb: number[]; home: P; area: number; cont: string; name: string}>;
const C = Object.keys(GC);
const T = TL.T as Record<string, number[]>;
export const s1kFrames = () => Math.round(TL.END * 30);
const NAME = TL.names as Record<string, string>;
const nm = (c: string) => (NAME[c] || c).toUpperCase();
const LAND = C.map((c) => GC[c].d).join('');
const COAST = GEO.coast as string;
const nums = (d: string) => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; const re = /(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g; let m; while ((m = re.exec(d))) { const x = +m[1], y = +m[2]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return [x0, y0, x1, y1]; };
const BP = Object.entries(GEO.borders as Record<string, string>).map(([k, d]) => { const [a, b] = k.split('|'); return {a, b, d}; });
const ADJ: Record<string, Set<string>> = {};
for (const {a, b} of BP) { (ADJ[a] ||= new Set()).add(b); (ADJ[b] ||= new Set()).add(a); }
const union = (a: number[], b: number[]) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])];
const coverBox = (b: number[]) => { const w = Math.max(1, b[2] - b[0]), h = Math.max(1, b[3] - b[1]), cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2; const r = Math.min(1.75, Math.max(1.25, w / h)); let W2 = w, H2 = h; if (w / h > r) H2 = w / r; else W2 = h * r; return [cx - W2 / 2, cy - H2 / 2, cx + W2 / 2, cy + H2 / 2]; };
const LB = nums(LAND);
const PC = (GEO.pieces as {id: string; c: string; d: string; mb: number[]; b: number[]}[]);
const PADJ = GEO.adjp as Record<string, string[]>;
const PBY: Record<string, (typeof PC)[number]> = Object.fromEntries(PC.map((p) => [p.id, p]));
const ease = Easing.inOut(Easing.cubic);

// ---------- estado de una partida en el tiempo ----------
type Sim = {seed: number; win: string; ev: [string, string][]};
const evTimes = (n: number, ta: number, tb: number) => Array.from({length: n}, (_, i) => ta + (tb - ta) * Math.pow((i + 1) / n, 0.62));
type State = {own: Record<string, string>; active: {w: string; l: string; q: number; lp: string[]}[]; alive: number; last: [string, string][]};
const stateAt = (sim: Sim, ta: number, tb: number, t: number): State => {
  const tt = evTimes(sim.ev.length, ta, tb);
  const own: Record<string, string> = Object.fromEntries(C.map((c) => [c, c]));
  const active: State['active'] = []; let alive = C.length; const last: [string, string][] = [];
  for (let i = 0; i < sim.ev.length; i++) {
    if (tt[i] > t) break;
    const [w, l] = sim.ev[i]; const gap = i + 1 < tt.length ? tt[i + 1] - tt[i] : 0.5; const dq = Math.max(0.18, Math.min(0.55, gap * 3));
    const q = (t - tt[i]) / dq;
    const lp = C.filter((c) => own[c] === l);
    if (q < 1) active.push({w, l, q: ease(Math.max(0, q)), lp});
    for (const c of lp) own[c] = w;
    alive--; last.push([w, l]);
  }
  // los territorios en animación se dibujan aún con el dueño anterior debajo
  const base = {...own}; for (const a of active) for (const c of a.lp) base[c] = a.l;
  return {own: base, active, alive, last: last.slice(-3)};
};

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
const WorldMap: React.FC<{st: State; id: string; dim?: number}> = ({st, id, dim = 0}) => {
  const {own, active} = st;
  const cl = clusters(own);
  // capa del ganador sobre lo conquistado (círculo que crece desde su lado)
  const ovs = active.map((a, i) => {
    const lb = a.lp.reduce((b, c) => union(b, GC[c].b), [...GC[a.lp[0]].b]);
    const wh = GC[a.w]?.home || [(lb[0] + lb[2]) / 2, (lb[1] + lb[3]) / 2];
    const lc: P = [(lb[0] + lb[2]) / 2, (lb[1] + lb[3]) / 2]; const dx = wh[0] - lc[0], dy = wh[1] - lc[1], dl = Math.hypot(dx, dy) || 1; const half = Math.hypot(lb[2] - lb[0], lb[3] - lb[1]) / 2;
    const A: P = [lc[0] + (dx / dl) * Math.min(dl, half), lc[1] + (dy / dl) * Math.min(dl, half)];
    const R = Math.max(...[[lb[0], lb[1]], [lb[2], lb[1]], [lb[0], lb[3]], [lb[2], lb[3]]].map(([x, y]) => Math.hypot(x - A[0], y - A[1]))) * 1.05;
    // la bandera del ganador con la caja de su bloque final
    const fin = {...own}; for (const c of a.lp) fin[c] = a.w; const fcs = clusters(fin).filter((k) => k.o === a.w && k.ids.some((id) => a.lp.includes(PBY[id].c)));
    return {i, a, A, R, parts: fcs.map((k) => ({box: k.box, ids: k.ids.filter((id) => a.lp.includes(PBY[id].c))}))};
  });
  const sw = 1.6;
  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
      <defs>
        {cl.map((k, i) => <mask key={i} id={`${id}m${i}`} maskUnits="userSpaceOnUse" x={-100} y={-100} width={2200} height={1300}>{k.ids.map((pid) => <path key={pid} d={PBY[pid].d} fill="#fff" stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" fillRule="evenodd" />)}</mask>)}
        {ovs.map((o) => <React.Fragment key={o.i}>{o.parts.map((pt, j) => <mask key={j} id={`${id}o${o.i}_${j}`} maskUnits="userSpaceOnUse" x={-100} y={-100} width={2200} height={1300}>{pt.ids.map((pid) => <path key={pid} d={PBY[pid].d} fill="#fff" stroke="#fff" strokeWidth={1.6} fillRule="evenodd" />)}</mask>)}<clipPath id={`${id}c${o.i}`}><circle cx={o.A[0]} cy={o.A[1]} r={Math.max(0.01, o.R * o.a.q)} /></clipPath></React.Fragment>)}
      </defs>
      <g transform={`translate(1.5,2.5)`} opacity={0.35}><path d={LAND} fill="#06213f" /></g>
      <path d={LAND} fill="#c9ced6" />
      {cl.map((k, i) => <g key={i} mask={`url(#${id}m${i})`}><FlagSvg code={k.o} b={k.box} /></g>)}
      {ovs.map((o) => <g key={o.i} clipPath={`url(#${id}c${o.i})`}>{o.parts.map((pt, j) => <g key={j} mask={`url(#${id}o${o.i}_${j})`}><FlagSvg code={o.a.w} b={pt.box} /></g>)}</g>)}
      {ovs.map((o) => <circle key={'r' + o.i} cx={o.A[0]} cy={o.A[1]} r={o.R * o.a.q} fill="none" stroke="#fff" strokeWidth={2.5} opacity={0.8 * (1 - o.a.q) * Math.min(1, o.a.q * 8)} />)}
      {BP.map((bp, i) => { if (own[bp.a] === own[bp.b]) return null; let op = 1; for (const o of ovs) if ((o.a.lp.includes(bp.a) && own[bp.b] === o.a.w) || (o.a.lp.includes(bp.b) && own[bp.a] === o.a.w)) op = 1 - o.a.q; return op > 0.02 ? <path key={i} d={bp.d} fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" opacity={op} /> : null; })}
      <path d={COAST} fill="none" stroke={INK} strokeWidth={sw * 1.2} strokeLinejoin="round" />
      {dim > 0 && <rect x={0} y={0} width={1920} height={1080} fill="#050b18" opacity={dim} />}
    </svg>
  );
};
const Sea: React.FC = () => <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #2f7fc4 0%, #1d5c9e 60%, #123f75 100%)'}} />;
// cámara: el mapa entero, con un acercamiento muy lento
const Cam: React.FC<{t: number; children: React.ReactNode; z?: number}> = ({t, children, z = 0}) => {
  const s0 = Math.min(1920 / (LB[2] - LB[0] + 40), 1080 / (LB[3] - LB[1] + 40)); const s = s0 * (1 + z);
  const cx = (LB[0] + LB[2]) / 2, cy = (LB[1] + LB[3]) / 2;
  return <div style={{position: 'absolute', inset: 0, transform: `translate(${960 - cx * s}px,${540 - cy * s}px) scale(${s})`, transformOrigin: '0 0'}}>{children}</div>;
};

// ---------- piezas de interfaz ----------
const OUT = {textShadow: `4px 4px 0 ${INK}, -2px -2px 0 ${INK}, 2px -2px 0 ${INK}, -2px 2px 0 ${INK}`};
const Pill: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => <div style={{background: 'rgba(12,16,26,0.88)', border: '3px solid rgba(255,255,255,0.15)', borderRadius: 16, padding: '8px 22px 4px', ...font, color: '#fff', ...style}}>{children}</div>;
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
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
const Card: React.FC<{t: number; t0: number; t1: number; code?: string; big: string; sub?: string; col?: string; top?: number}> = ({t, t0, t1, code, big, sub, col = YELLOW, top = 380}) => {
  if (t < t0 || t > t1) return null; const k = popT(t, t0) * lerp(t, t1 - 0.25, t1, 1, 0);
  return <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', transform: `scale(${k})`}}>
    <div style={{background: 'rgba(12,16,26,0.92)', border: `5px solid ${col}`, borderRadius: 26, padding: '18px 46px 10px', display: 'flex', alignItems: 'center', gap: 26, boxShadow: '0 14px 50px rgba(0,0,0,0.55)'}}>
      {code && <WFlag code={code} w={150} h={100} />}
      <div style={{textAlign: 'center'}}><div style={{...font, fontSize: 92, color: col, lineHeight: 1, ...OUT}}>{big}</div>{sub && <div style={{...font2, fontSize: 40, color: '#fff', marginTop: 8}}>{sub}</div>}</div></div></div>;
};

// ---------- escenas ----------
const SIMS = TL.sims as Record<string, Sim>;
const ID: Record<string, string> = Object.fromEntries(C.map((c) => [c, c]));
const Hook: React.FC<{t: number}> = ({t}) => {
  const [a, b] = T.hook; const snaps = TL.snaps as {seed: number; own: Record<string, string>}[];
  const per = (b - a - 0.6) / snaps.length; const i = Math.min(snaps.length - 1, Math.max(0, Math.floor((t - a) / per)));
  const u = Math.min(1, (t - a) / (b - a - 0.3)); const n = Math.max(1, Math.round(Math.pow(u, 2.2) * 1000));
  const flash = lerp(t - a - i * per, 0, 0.12, 0.55, 0);
  return <>
    <Cam t={t} z={0.04 * u}><WorldMap st={{own: snaps[i].own, active: [], alive: 0, last: []}} id="hk" /></Cam>
    <AbsoluteFill style={{background: '#fff', opacity: flash}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', ...font, fontSize: 150, color: YELLOW, ...OUT, WebkitTextStroke: `8px ${INK}`}}>#{fmt(n)}</div>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, display: 'flex', justifyContent: 'center', transform: `scale(${popT(t, a + 0.4)})`}}>
      <Pill style={{fontSize: 56, padding: '12px 36px 6px'}}>189 COUNTRIES · <span style={{color: YELLOW}}>1,000</span> WORLD WARS</Pill></div>
  </>;
};
const Rules: React.FC<{t: number}> = ({t}) => {
  const [a] = T.rules; const items = [['⚔️', 'Countries attack their neighbors'], ['💪', 'Bigger army = better odds'], ['🎲', 'Upsets can happen'], ['🏆', 'Last one standing wins']];
  return <>
    <Cam t={t} z={0}><WorldMap st={{own: ID, active: [], alive: C.length, last: []}} id="ru" /></Cam>
    <div style={{position: 'absolute', left: 0, right: 0, top: 60, textAlign: 'center', transform: `scale(${popT(t, a)})`, ...font, fontSize: 84, color: '#fff', ...OUT}}>WHO WINS <span style={{color: YELLOW}}>THE MOST?</span></div>
    <div style={{position: 'absolute', left: 60, top: 230, display: 'flex', flexDirection: 'column', gap: 18}}>
      {items.map(([ic, s], i) => <div key={i} style={{transform: `scale(${popT(t, a + 0.8 + i * 1.4)})`, transformOrigin: 'left center'}}><Pill style={{...font2, fontSize: 40, display: 'flex', gap: 14, alignItems: 'center'}}><span style={{fontSize: 44}}>{ic}</span>{s}</Pill></div>)}
    </div>
  </>;
};
const SimScene: React.FC<{t: number; key2: string; ta: number; tb: number; n: number; z?: number}> = ({t, key2, ta, tb, n, z = 0}) => {
  const st = stateAt(SIMS[key2], ta, tb, t);
  return <><Cam t={t} z={z * lerp(t, ta, tb, 0, 1)}><WorldMap st={st} id={key2} /></Cam><SimHud t={t} n={n} st={st} t0={ta - 0.3} /></>;
};
const Never: React.FC<{t: number}> = ({t}) => {
  const [a, b] = T.never; const L = TL.never as string[]; const cols = 14;
  return <>
    <Cam t={t} z={0}><WorldMap st={{own: Object.fromEntries(C.map((c) => [c, SIMS.s1.win])), active: [], alive: 1, last: []}} id="nv" dim={0.72} /></Cam>
    <div style={{position: 'absolute', left: 0, right: 0, top: 44, textAlign: 'center', transform: `scale(${popT(t, a)})`, ...font, fontSize: 80, color: '#fff', ...OUT}}><span style={{color: '#ff6b6b'}}>{L.length}</span> COUNTRIES NEVER WON</div>
    <div style={{position: 'absolute', left: 120, right: 120, top: 170, display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 10}}>
      {L.map((c, i) => { const ti = a + 0.3 + (i / L.length) * 2.6; const k = popT(t, ti, 14); const x = t > ti + 2.2 + (i % 7) * 0.05;
        return <div key={c} style={{position: 'relative', transform: `scale(${k})`, opacity: x ? 0.55 : 1}}><WFlag code={c} w={86} h={58} />{x && <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: 52, color: RED, ...OUT}}>✖</div>}</div>; })}
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, textAlign: 'center', transform: `scale(${popT(t, a + 3.4)})`, ...font, fontSize: 60, color: YELLOW, ...OUT}}>0 WINS IN 1,000 WARS</div>
  </>;
};
const Top: React.FC<{t: number}> = ({t}) => {
  const [a] = T.top; const top = TL.top as [string, number][];
  return <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #1b2a4a 0%, #070b14 80%)'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', transform: `scale(${popT(t, a)})`, ...font, fontSize: 96, color: '#fff', ...OUT}}>THE <span style={{color: YELLOW}}>#1</span> COUNTRY</div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center', transform: `scale(${popT(t, a + 1.2)})`}}>
      <div style={{width: 330, height: 220, borderRadius: 24, border: `6px solid ${YELLOW}`, background: 'linear-gradient(135deg,#222b3d,#0d1320)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: 170, color: YELLOW, boxShadow: `0 0 ${40 + 20 * Math.sin(t * 6)}px rgba(255,210,63,0.6)`}}>?</div></div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 590, textAlign: 'center', transform: `scale(${popT(t, a + 2.6)})`, ...font, fontSize: 110, color: YELLOW, ...OUT}}>{top[0][1]} / 1,000 WINS</div>
  </AbsoluteFill>;
};

export const Sim1000: React.FC = () => {
  usePreload();
  const t = useCurrentFrame() / 30;
  const s1 = T.sim1, sg = T.sg, mx = T.mx;
  let scene: React.ReactNode = null;
  if (t < T.hook[1]) scene = <Hook t={t} />;
  else if (t < T.rules[1]) scene = <Rules t={t} />;
  else if (t < T.win1[1]) scene = <><SimScene t={t} key2="s1" ta={s1[1]} tb={s1[2]} n={1} z={0} />
    <Card t={t} t0={s1[0]} t1={s1[1] + 0.2} big="SIMULATION #1" sub="Let the war begin" />
    <Card t={t} t0={T.win1[0] + 0.3} t1={T.win1[1]} code={SIMS.s1.win} big={`${nm(SIMS.s1.win)} WINS!`} sub="+1 WIN · 999 TO GO" /></>;
  else if (t < T.never[1]) scene = <Never t={t} />;
  else if (t < sg[3]) scene = <><SimScene t={t} key2="sg" ta={sg[1]} tb={sg[2]} n={SIMS.sg.seed + 1} />
    <Card t={t} t0={sg[0]} t1={sg[1]} code="SG" big="SINGAPORE" sub="1 / 1,000 WINS" />
    <Card t={t} t0={sg[2] + 0.1} t1={sg[3]} code="SG" big="SINGAPORE WINS!" sub="The only time it happened" /></>;
  else if (t < mx[3]) scene = <><SimScene t={t} key2="mx" ta={mx[1]} tb={mx[2]} n={SIMS.mx.seed + 1} />
    <Card t={t} t0={mx[0]} t1={mx[3]} code="MX" big="MEXICO" sub={`${TL.wins.MX} / 1,000 WINS`} top={760} /></>;
  else scene = <Top t={t} />;
  const fadeEnd = lerp(t, TL.END - 0.6, TL.END, 0, 1);
  return <AbsoluteFill style={{overflow: 'hidden', background: '#123f75'}}>
    <Sea />{scene}
    <div style={{position: 'absolute', right: 20, bottom: 12, ...font2, fontSize: 16, color: 'rgba(255,255,255,0.75)'}}>Simulation · win odds based on active troops (IISS) · not a prediction</div>
    <AbsoluteFill style={{background: '#000', opacity: fadeEnd}} />
  </AbsoluteFill>;
};
