import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import RIR from './r-iran.json';
import RTW from './r-taiwan.json';
import TIR from './tl-iran.json';
import TTW from './tl-taiwan.json';
import WFL from './wflags.json';
import RASTER from './wflags-raster.json';
import {P, Cam, INK, CREAM, RED, BLUE, GREEN, YELLOW, ORANGE, clamp, lerp, fmt, font, font2, popT, piece, arcPath, partial, Mover, Boom, Face, Mood, Bubble, Avatar, TankToken} from './lib3';
import {WFlag, usePreload} from './War6';

// ================= datos por vídeo =================
type Ctry = {code: string; name: string; d: string; bbox: number[]; c: P};
type V = {M: any; T: any; C: Ctry[]; PL: Record<string, P>};
const VIDS: Record<string, V> = {
  iran: {M: RIR, T: TIR, C: (RIR as any).countries, PL: (RIR as any).places},
  taiwan: {M: RTW, T: TTW, C: (RTW as any).countries, PL: (RTW as any).places},
};
export const W9_IDS = Object.keys(VIDS);
export const w9Frames = (id: string) => Math.round(VIDS[id].T.duration * 30);
const FL = WFL as unknown as Record<string, {vb: number[]; body: string}>;
const RS = RASTER as Record<string, string>;
const SIDE: Record<string, string> = {US: '#2f5bd3', IR: '#239f40', IL: '#1b5fb8', SA: '#0f7a3c', CN: '#de2910', TW: '#1a3fa8', JP: '#bc002d', PH: '#0038a8', RU: '#b0261d', YE: '#c8102e', LB: '#e8a317', QA: '#8d1b3d', AE: '#00732f', RED: '#d42a24', NEU: '#777'};
const pt = (v: V, p: any): P => (typeof p === 'string' ? v.PL[p] : p);
const SEQ = (arr: [number, number][], t: number) => piece(t, arr);

// ================= cámara =================
const camera = (v: V, t: number): Cam => {
  const K = v.T.cam as [number, number, number, number][];
  let i = 0;
  while (i < K.length - 1 && t >= K[i + 1][0]) i++;
  const [ta, xb, yb, sb] = K[i];
  const [, xa, ya, sa] = K[Math.max(0, i - 1)];
  const k = i === 0 ? 1 : lerp(t, ta, ta + 1.0, 0, 1, Easing.inOut(Easing.cubic));
  let cx = xa + (xb - xa) * k, cy = ya + (yb - ya) * k;
  const tn = i < K.length - 1 ? K[i + 1][0] : ta + 10;
  let s = sa * Math.pow(sb / sa, k) * (1 + 0.06 * lerp(t, ta + 1.0, tn, 0, 1, Easing.linear));
  cx += (Math.sin(t * 0.35) * 6) / s;
  for (const b of v.T.booms as number[][]) { const d = t - b[0]; if (d >= 0 && d < 0.3) { const a = ((1 - d / 0.3) * 2) / s; cx += Math.sin(d * 93) * a; cy += Math.cos(d * 69) * a; } }
  for (const st of v.T.stamps as any[]) { const d = t - st.t; if (d >= 0 && d < 0.3) { const a = ((1 - d / 0.3) * 5) / s; cx += Math.sin(d * 93) * a; cy += Math.cos(d * 69) * a; } }
  return {cx, cy, s};
};
export const camera9 = (id: string, t: number) => camera(VIDS[id], t);
const dayAt = (v: V, t: number) => Math.max(1, Math.round(SEQ(v.T.days, t)));

// ================= mapa =================
const FlagFill: React.FC<{code: string; b: number[]}> = ({code, b}) => {
  const w = Math.max(1, b[2] - b[0]), h = Math.max(1, b[3] - b[1]);
  if (RS[code]) return <image href={RS[code]} x={b[0]} y={b[1]} width={w} height={h} preserveAspectRatio="none" />;
  const f = FL[code];
  if (!f) return <rect x={b[0]} y={b[1]} width={w} height={h} fill="#efe3c8" />;
  const [vx, vy, vw, vh] = f.vb;
  return <g transform={`translate(${b[0]},${b[1]}) scale(${w / vw},${h / vh}) translate(${-vx},${-vy})`} dangerouslySetInnerHTML={{__html: f.body}} />;
};
const fitBox = (v: V, c: Ctry) => {
  const o = v.T.fit?.[c.code];
  if (o) return o;
  let [x0, y0, x1, y1] = c.bbox;
  x0 = Math.max(x0, -500); y0 = Math.max(y0, -700); x1 = Math.min(x1, 2400); y1 = Math.min(y1, 1800);
  const w = x1 - x0, h = y1 - y0;
  if (h > w * 1.2) { const nw = h * 1.1; x0 -= (nw - w) / 2; x1 += (nw - w) / 2; }
  if (w > h * 2.2) { const nh = w / 1.8; y0 -= (nh - h) / 2; y1 += (nh - h) / 2; }
  return [x0, y0, x1, y1];
};
export type LVP = {W: number; H: number; ox: number; oy: number; ui: number};
export const LV0: LVP = {W: 1920, H: 1080, ox: 960, oy: 540, ui: 1};
export const RegionMap: React.FC<{id: string; t: number; cam: Cam; vp?: LVP}> = ({id, t, cam, vp = LV0}) => {
  const v = VIDS[id];
  const T = v.T;
  const {cx, cy, s} = cam;
  const vx0 = cx - vp.ox / s - 20, vx1 = cx + (vp.W - vp.ox) / s + 20, vy0 = cy - vp.oy / s - 20, vy1 = cy + (vp.H - vp.oy) / s + 20;
  const vis = (b: number[]) => b[2] > vx0 && b[0] < vx1 && b[3] > vy0 && b[1] < vy1;
  const inv = vp.ui / s;
  const cs = v.C.filter((c) => vis(c.bbox));
  // zonas ocupadas, agrupadas por bando + país
  const groups: Record<string, React.ReactNode[]> = {};
  for (const z of T.zones as any[]) {
    const [t0, p, r, side, clip, tEnd] = z;
    if (t < t0 - 0.8 || (tEnd && t > tEnd + 1.6)) continue;
    const k = lerp(t, t0 - 0.8, t0 + 0.6, 0, 1, Easing.out(Easing.cubic)) * (tEnd ? lerp(t, tEnd, tEnd + 1.6, 1, 0) : 1);
    if (k <= 0) continue;
    const q = pt(v, p);
    (groups[`${side}|${clip}`] ||= []).push(<circle key={groups[`${side}|${clip}`]?.length || 0} cx={q[0]} cy={q[1]} r={r * k} fill={T.zoneCol?.[side] || SIDE[side]} />);
  }
  const towns = (T.towns as string[]) || [];
  return (
    <svg width={vp.W} height={vp.H} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        {cs.map((c) => <clipPath key={c.code} id={`rc-${id}-${c.code}`}><path d={c.d} /></clipPath>)}
        <pattern id={`ht9-${id}`} patternUnits="userSpaceOnUse" width={5} height={5} patternTransform={`rotate(45) scale(${Math.max(0.4, 1.4 / s)})`}><rect width={1.8} height={5} fill="rgba(0,0,0,0.45)" /></pattern>
      </defs>
      <g transform={`translate(${vp.ox},${vp.oy}) scale(${s}) translate(${-cx},${-cy})`}>
        <g transform="translate(2,3)" opacity={0.3}>{cs.map((c) => <path key={c.code} d={c.d} fill="#06213f" />)}</g>
        {cs.map((c) => <g key={c.code} clipPath={`url(#rc-${id}-${c.code})`}><FlagFill code={c.code} b={fitBox(v, c)} /></g>)}
        {Object.entries(groups).map(([key, circles]) => {
          const [side, clip] = key.split('|');
          return <g key={key} clipPath={clip ? `url(#rc-${id}-${clip})` : undefined}><g opacity={0.8}>{circles}</g><g opacity={0.8} style={{mixBlendMode: 'multiply'}}>{React.Children.map(circles, (el: any) => React.cloneElement(el, {fill: `url(#ht9-${id})`}))}</g></g>;
        })}
        <path d={v.M.borders} fill="none" stroke="#3d4450" strokeWidth={0.9 * inv} />
        <path d={v.M.coast} fill="none" stroke={INK} strokeWidth={1.7 * inv} />
        {s > (T.townScale || 1.2) && towns.map((n) => {
          const p = v.PL[n];
          const cp = (T.caps as any[]).filter((c) => c[1] === n && t >= c[0]).slice(-1)[0];
          return <g key={n} transform={`translate(${p[0]},${p[1]}) scale(${inv})`}><circle r={11} fill="rgba(255,220,100,0.22)" /><circle r={6} fill={cp ? SIDE[cp[2]] : YELLOW} stroke={INK} strokeWidth={2.5} /></g>;
        })}
        <Units v={v} t={t} inv={inv} vis={vis} />
        {(T.booms as number[][]).filter((b) => t > b[0] - 0.05 && t < b[0] + 1.7).map((b, i) => <Boom key={i} p={[b[1], b[2]]} t={t} at={b[0]} r={Math.max(4, b[3] * 1.6 * inv * 1.6)} />)}
        <Faces v={v} t={t} s={s} inv={inv} />
      </g>
    </svg>
  );
};
const moodOf = (v: V, who: string, t: number): Mood => {
  let m: Mood = 'calm';
  for (const [mt, w, mm] of v.T.moods as [number, string, Mood][]) if (w === who && t >= mt) m = mm;
  return m;
};
const Faces: React.FC<{v: V; t: number; s: number; inv: number}> = ({v, t, s, inv}) => (
  <g>
    {Object.entries(v.T.faces as Record<string, number[]>).map(([c, [x, y, base]]) => {
      const r = Math.min(base, 58 * inv);
      if (r * s < 9) return null;
      const talking = (v.T.bubbles as any[]).some(([b0, b1, w]) => w === c && t > b0 + 0.2 && t < b1 - 0.3);
      return <Face key={c} x={x} y={y} r={r} mood={moodOf(v, c, t)} t={t} seed={c.charCodeAt(0) + c.charCodeAt(1)} talking={talking} />;
    })}
  </g>
);

// ================= unidades =================
const Trooper: React.FC<{col: string; walk: number; dir: number; shoot: boolean; fallen?: number; alpha: number}> = ({col, walk, dir, shoot, fallen = 0, alpha}) => {
  const sw = Math.sin(walk) * 4;
  return (
    <g transform={`rotate(${fallen * 90 * dir})`} opacity={alpha}>
      <ellipse cx={0} cy={13} rx={8} ry={2.6} fill="rgba(0,0,0,0.3)" />
      <path d={`M-2,4 L${-3 + sw},13 M2,4 L${3 - sw},13`} stroke={INK} strokeWidth={3.4} strokeLinecap="round" />
      <rect x={-5} y={-6} width={10} height={12} rx={3.5} fill={fallen > 0.5 ? '#888' : col} stroke={INK} strokeWidth={2} />
      <path d={`M0,-1 L${dir * 12},-3`} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <circle cx={0} cy={-11} r={5} fill="#f2c9a0" stroke={INK} strokeWidth={2} />
      <path d="M-6,-11 A6,6 0 0 1 6,-11 Z" fill="#5b6b3a" stroke={INK} strokeWidth={2} />
      {shoot && <path d={`M${dir * 13},-3 l${dir * 6},-3 l${-dir * 2},3 l${dir * 6},1 l${-dir * 6},1 l${dir * 2},3 Z`} fill={YELLOW} stroke={ORANGE} strokeWidth={1} />}
    </g>
  );
};
const FORM: P[] = [[0, 0], [-16, -9], [-16, 9], [-31, 0], [-31, -17], [-31, 17]];
const Heli: React.FC<{col: string; t: number; flip: boolean}> = ({col, t, flip}) => (
  <g transform={`scale(${flip ? -1 : 1},1)`}>
    <ellipse cx={0} cy={0} rx={18} ry={9} fill={col} stroke={INK} strokeWidth={3} />
    <rect x={-34} y={-3} width={20} height={5} rx={2} fill={col} stroke={INK} strokeWidth={2} />
    <ellipse cx={8} cy={-2} rx={6} ry={4} fill="#bfe6ff" stroke={INK} strokeWidth={1.5} />
    <rect x={-28} y={-11} width={56 * Math.abs(Math.cos(t * 40))} height={3} transform={`translate(${28 - 28 * Math.abs(Math.cos(t * 40))},0)`} fill={INK} />
    <line x1={0} y1={-9} x2={0} y2={-12} stroke={INK} strokeWidth={3} />
  </g>
);
const C17: React.FC<{col: string}> = ({col}) => (<g><path d="M-30,-4 L26,-4 L34,0 L26,4 L-30,4 Z" fill="#8a94a3" stroke={INK} strokeWidth={3} /><path d="M-4,-4 L-14,-30 L-6,-30 L8,-4 Z M-4,4 L-14,30 L-6,30 L8,4 Z" fill="#8a94a3" stroke={INK} strokeWidth={3} /><path d="M-30,-4 L-36,-14 L-30,-14 L-24,-4 Z" fill={col} stroke={INK} strokeWidth={2} /></g>);
const Sub: React.FC<{col: string}> = ({col}) => (<g><ellipse cx={0} cy={0} rx={30} ry={7} fill="#3d4652" stroke={INK} strokeWidth={3} opacity={0.85} /><rect x={-4} y={-14} width={10} height={9} rx={2} fill="#3d4652" stroke={INK} strokeWidth={2.5} /><rect x={-3} y={-13} width={8} height={3} fill={col} /></g>);
const Drone: React.FC<{col: string}> = ({col}) => (<g><path d="M14,0 L-10,-12 L-4,0 L-10,12 Z" fill={col} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" /></g>);
const Boat: React.FC<{col: string; t: number}> = ({col, t}) => (<g><path d="M-14,-4 L12,-4 L18,0 L12,4 L-14,4 Z" fill={col} stroke={INK} strokeWidth={2.5} /><rect x={-6} y={-8} width={8} height={5} fill="#ddd" stroke={INK} strokeWidth={1.5} /><path d={`M-16,0 q-8,${Math.sin(t * 20) * 3} -18,0`} stroke="#fff" strokeWidth={3} fill="none" opacity={0.8} /></g>);
const Mine: React.FC<{t: number}> = ({t}) => (<g><circle r={7} fill="#2b2b2b" stroke={INK} strokeWidth={2} />{[0, 60, 120, 180, 240, 300].map((a) => <line key={a} x1={0} y1={0} x2={Math.cos((a * Math.PI) / 180) * 11} y2={Math.sin((a * Math.PI) / 180) * 11} stroke={INK} strokeWidth={2.5} />)}<circle r={2} fill={(t * 2) % 1 < 0.5 ? RED : '#550'} /></g>);
const Units: React.FC<{v: V; t: number; inv: number; vis: (b: number[]) => boolean}> = ({v, t, inv, vis}) => {
  const out: React.ReactNode[] = [];
  const frame = t * 30;
  const sc = 1.3 * inv;
  (v.T.units as any[]).forEach(([kind, side, x0, y0, x1, y1, t0, t1], i) => {
    if (t < t0 - 0.3 || t > t1 + 1.6) return;
    if (!vis([Math.min(x0, x1) - 30, Math.min(y0, y1) - 30, Math.max(x0, x1) + 30, Math.max(y0, y1) + 30])) return;
    const col = SIDE[side] || '#888';
    const fl = side.toLowerCase();
    const fa = lerp(t, t0 - 0.3, t0, 0, 1) * lerp(t, t1 + 0.6, t1 + 1.4, 1, 0);
    if (kind === 'def') {
      const fall = lerp(t, t0 + 1, t1, 0, 1);
      for (let j = 0; j < 6; j++) {
        const x = x0 + ((j % 3) - 1) * 15 * sc, y = y0 + (Math.floor(j / 3) * 12 - 4) * sc;
        const dead = j < Math.floor(fall * 3);
        out.push(<g key={`d${i}${j}`} transform={`translate(${x},${y}) scale(${sc})`}><Trooper col={col} walk={0} dir={j % 2 ? 1 : -1} shoot={!dead && (frame + j * 5) % 12 < 2} fallen={dead ? 1 : 0} alpha={fa} /></g>);
      }
      return;
    }
    if (kind === 'mine') { out.push(<g key={`mn${i}`} transform={`translate(${x0},${y0}) scale(${sc})`} opacity={fa}><Mine t={t} /></g>); return; }
    if (kind === 'shipsink') { out.push(<Mover key={`k${i}`} pts={[[x0, y0], [x0 + 1, y0]]} t={t} t0={t0} t1={t0 + 0.01} kind="ship" code={fl} inv={1.0 * inv} hold={2} sinkAt={t0 + 0.2} />); return; }
    const dist = Math.hypot(x1 - x0, y1 - y0);
    const pts = arcPath([x0, y0], [x1, y1], Math.min(30, dist * 0.15) * (i % 2 ? 1 : -1));
    if (kind === 'plane') { out.push(<Mover key={`p${i}`} pts={pts} t={t} t0={t0} t1={t1} kind="plane" color={col} inv={1.3 * inv} hold={0.2} trail />); return; }
    if (kind === 'missile') { out.push(<Mover key={`m${i}`} pts={pts} t={t} t0={t0} t1={t1} kind="missile" inv={1.1 * inv} hold={0} trail />); return; }
    if (kind === 'ship' || kind === 'landing') { out.push(<Mover key={`s${i}`} pts={pts} t={t} t0={t0} t1={t1} kind="ship" code={fl} inv={(kind === 'landing' ? 0.7 : 1.0) * inv} hold={1.6} />); return; }
    if (kind === 'carrier') { out.push(<Mover key={`cv${i}`} pts={pts} t={t} t0={t0} t1={t1} kind="ship" code={fl} inv={1.6 * inv} hold={1.6} />); return; }
    const pr = lerp(t, t0, t1, 0, 1, Easing.inOut(Easing.sin));
    const {tip, ang} = partial(pts, pr);
    const flip = Math.cos(ang) < 0;
    if (kind === 'tank') { out.push(<TankToken key={`t${i}`} p={tip} code={fl} inv={0.75 * inv} alpha={fa} flip={flip} />); return; }
    const g = (el: React.ReactNode, rot = true, scl = sc) => out.push(<g key={`u${i}`} transform={`translate(${tip[0]},${tip[1]}) scale(${scl}) ${rot ? `rotate(${(ang * 180) / Math.PI})` : ''}`} opacity={fa}>{el}</g>);
    if (kind === 'heli') return g(<Heli col={col} t={t} flip={flip} />, false, sc * 1.1);
    if (kind === 'c17') return g(<C17 col={col} />, true, sc * 1.2);
    if (kind === 'sub') return g(<Sub col={col} />, true, sc * 1.1);
    if (kind === 'drone') return g(<Drone col={col} />, true, sc);
    if (kind === 'boat') return g(<Boat col={col} t={t} />, true, sc * 0.9);
    if (kind === 'para') {
      const sw = Math.sin(frame / 8 + i) * 8;
      out.push(<g key={`pa${i}`} transform={`translate(${tip[0] + sw * inv},${tip[1]}) scale(${sc * 0.9})`} opacity={fa * lerp(t, t1, t1 + 0.4, 1, 0.0)}><path d="M-16,-30 Q0,-48 16,-30 Z" fill="#e8e2d0" stroke={INK} strokeWidth={2.5} /><path d="M-15,-30 L-2,-8 M15,-30 L2,-8 M0,-34 L0,-8" stroke={INK} strokeWidth={1.4} /><Trooper col={col} walk={0} dir={1} shoot={false} alpha={1} /></g>);
      return;
    }
    const ca = Math.cos(ang), sa = Math.sin(ang), dir = ca >= 0 ? 1 : -1;
    for (let j = 0; j < FORM.length; j++) {
      const [fx, fy] = FORM[j];
      const x = tip[0] + (fx * ca - fy * sa) * sc, y = tip[1] + (fx * sa + fy * ca) * sc;
      out.push(<g key={`q${i}-${j}`} transform={`translate(${x},${y}) scale(${sc})`}><Trooper col={col} walk={pr < 1 ? frame / 2.2 + j : 0} dir={dir} shoot={pr > 0.75 && (frame + j * 7 + i) % 11 < 2} alpha={fa} /></g>);
    }
  });
  return <g>{out}</g>;
};

// ================= interfaz =================
export type Lay = {W: number; H: number; vert: boolean};
const toS = (p: P, cam: Cam, vp: LVP): P => [vp.ox + (p[0] - cam.cx) * cam.s, vp.oy + (p[1] - cam.cy) * cam.s];
const phaseAt = (v: V, t: number) => { let ph: any = null; for (const h of v.T.hud as any[]) if (t >= h[0]) ph = h; return ph; };
const cardActive = (v: V, t: number) => (v.T.cards as any[]).some((c) => t >= c.t0 - 0.1 && t < c.t1);
const Hud: React.FC<{v: V; t: number; L: Lay}> = ({v, t, L}) => {
  const ph = phaseAt(v, t);
  if (!ph || ph[1] === 'none') return null;
  const T = v.T;
  const top = L.vert ? 120 : 16;
  const wrap = (body: React.ReactNode) => (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 10}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transform: L.vert ? 'scale(1.3)' : undefined, transformOrigin: 'top center'}}>
        {body}
        <div style={{background: INK, border: '4px solid #fff', borderRadius: 14, padding: '3px 16px 0', ...font, fontSize: 28, color: YELLOW}}>DAY {dayAt(v, t)}</div>
      </div>
    </div>
  );
  const box = (inner: React.ReactNode) => <div style={{display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(16,22,34,0.88)', border: '5px solid #fff', borderRadius: 28, padding: '8px 22px', width: L.vert ? 780 : 1060, boxSizing: 'border-box'}}>{inner}</div>;
  const name = (txt: string, n: string, right?: boolean) => <div style={{display: 'flex', flexDirection: 'column', alignItems: right ? 'flex-end' : 'flex-start', minWidth: 150}}><div style={{...font, fontSize: 28, color: '#fff', lineHeight: 1}}>{txt}</div><div style={{...font, fontSize: 38, color: YELLOW, lineHeight: 1.1}}>{n}</div></div>;
  const [, kind, cfg] = ph;
  const A = cfg.a, B = cfg.b;
  if (kind === 'control') {
    const p = SEQ(T.series[cfg.ctrl], t);
    const sa = SEQ(T.series[cfg.sa], t), sb = SEQ(T.series[cfg.sb], t);
    return wrap(box(<>
      <Avatar size={80} code={A.f} mood={p > 0.5 ? 'smug' : 'angry'} t={t} seed={1} look={[1, 0]} id="h-a" />{name(A.n, fmt(Math.round(sa / 100) * 100))}
      <div style={{flex: 1}}>
        <div style={{display: 'flex', justifyContent: 'space-between', ...font, fontSize: 26, color: '#fff'}}><span>{cfg.label}</span><span style={{color: '#8fb3ff'}}>{Math.round(p * 100)}%</span></div>
        <div style={{height: 30, borderRadius: 15, overflow: 'hidden', border: `5px solid ${INK}`, background: '#e9e9e9', marginTop: 4}}><div style={{width: `${p * 100}%`, height: '100%', background: `repeating-linear-gradient(45deg, ${SIDE[A.c]}, ${SIDE[A.c]} 12px, #1d2b55 12px, #1d2b55 24px)`}} /></div>
      </div>
      {name(B.n, fmt(Math.round(sb / 100) * 100), true)}<Avatar size={80} code={B.f} mood={p > 0.5 ? 'scared' : 'angry'} t={t} seed={2} look={[-1, 0]} id="h-b" />
    </>));
  }
  if (kind === 'meter') {
    const x = SEQ(T.series[cfg.meter], t);
    const col = x < 0.4 ? GREEN : x < 0.7 ? ORANGE : RED;
    return wrap(box(<>
      <Avatar size={72} code={A.f} mood="angry" t={t} seed={1} look={[1, 0]} id="m-a" />
      <div style={{flex: 1}}>
        <div style={{display: 'flex', justifyContent: 'space-between', ...font, fontSize: 28, color: '#fff'}}><span>{cfg.label}</span><span style={{color: col}}>{x < 0.4 ? 'TENSE' : x < 0.7 ? 'DANGEROUS' : 'ON THE BRINK'}</span></div>
        <div style={{position: 'relative', height: 30, borderRadius: 15, overflow: 'hidden', border: `5px solid ${INK}`, background: 'linear-gradient(90deg, #22a95b, #ffd23f 45%, #ff8a1f 70%, #e5322d)', marginTop: 4}}>
          <div style={{position: 'absolute', right: 0, top: 0, bottom: 0, width: `${(1 - x) * 100}%`, background: '#2a2f3a'}} />
          <div style={{position: 'absolute', left: `calc(${x * 100}% - 4px)`, top: -2, width: 8, height: 34, background: '#fff', boxShadow: `0 0 ${8 + 8 * Math.sin(t * 10)}px #fff`}} />
        </div>
      </div>
      <Avatar size={72} code={B.f} mood="angry" t={t} seed={2} look={[-1, 0]} id="m-b" />
    </>));
  }
  const la = SEQ(T.series[cfg.la], t), lb = SEQ(T.series[cfg.lb], t);
  let sh = [0, 0]; for (const x of T.series[cfg.ships] || []) if (t >= x[0]) sh = [x[1], x[2]];
  return wrap(box(<>
    <Avatar size={72} code={A.f} mood="angry" t={t} seed={1} look={[1, 0]} id="l-a" />{name(`${A.n} LOSSES`, `${fmt(Math.round(la))} · ⚓${sh[0]}`)}
    <div style={{flex: 1, textAlign: 'center', ...font, fontSize: 32, color: RED}}>{cfg.label}</div>
    {name(`${B.n} LOSSES`, `${fmt(Math.round(lb))} · ⚓${sh[1]}`, true)}<Avatar size={72} code={B.f} mood="angry" t={t} seed={2} look={[-1, 0]} id="l-b" />
  </>));
};
const ChipBar: React.FC<{v: V; t: number; L: Lay}> = ({v, t, L}) => {
  const ch = (v.T.chips as [number, string, string][]).filter(([ct]) => t >= ct && t < ct + 2.6).slice(-1)[0];
  if (!ch) return null;
  const [ct, text, side] = ch;
  const k = popT(t, ct, 12) * lerp(t, ct + 2.3, ct + 2.6, 1, 0);
  const red = side === 'RED';
  return (
    <div style={{position: 'absolute', top: L.vert ? 470 : 205, left: 30, right: 30, display: 'flex', justifyContent: 'center', zIndex: 12}}>
      <div style={{transform: `scale(${k}) rotate(-2deg)`, display: 'flex', alignItems: 'center', gap: 14, background: red ? RED : SIDE[side] || BLUE, border: `6px solid ${INK}`, borderRadius: 20, padding: '8px 26px 2px', ...font, fontSize: L.vert ? 48 : 44, color: '#fff', textShadow: `3px 3px 0 ${INK}`, boxShadow: '0 8px 0 rgba(0,0,0,0.35)', textAlign: 'center', lineHeight: 1.02, maxWidth: L.vert ? 1000 : 1500}}>
        {!red && side !== 'NEU' && <WFlag code={side} w={54} h={36} />}{text}
      </div>
    </div>
  );
};
const Ticker: React.FC<{v: V; t: number; L: Lay}> = ({v, t, L}) => {
  const h = (v.T.headlines as [number, string][]).find(([ht]) => t >= ht && t < ht + 3.6);
  if (!h) return null;
  const k = lerp(t, h[0], h[0] + 0.25, 0, 1) * lerp(t, h[0] + 3.3, h[0] + 3.6, 1, 0);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: L.vert ? 380 : 60, display: 'flex', justifyContent: 'center', zIndex: 11, opacity: k}}>
      <div style={{display: 'flex', alignItems: 'stretch', border: `5px solid ${INK}`, borderRadius: 12, overflow: 'hidden', transform: `translateY(${(1 - k) * 60}px)`, maxWidth: L.vert ? 1020 : 1500}}>
        <div style={{background: RED, ...font, fontSize: 34, color: '#fff', padding: '6px 16px 0'}}>BREAKING</div>
        <div style={{background: '#fff', ...font, fontSize: 34, color: INK, padding: '6px 18px 0', whiteSpace: L.vert ? 'normal' : 'nowrap'}}>{h[1]}</div>
      </div>
    </div>
  );
};
const Stamp: React.FC<{v: V; t: number; L: Lay}> = ({v, t, L}) => {
  const st = (v.T.stamps as any[]).find((s) => t >= s.t && t < s.t + s.d);
  if (!st) return null;
  const dt = t - st.t;
  const k = dt < 0.27 ? interpolate(dt, [0, 0.27], [2.2, 1], {...clamp, easing: Easing.out(Easing.cubic)}) : 1;
  const a = lerp(dt, 0, 0.12, 0, 1) * lerp(dt, st.d - 0.3, st.d, 1, 0);
  const col = st.c === 'red' ? RED : st.c === 'blue' ? BLUE : st.c === 'yellow' ? '#d98e00' : GREEN;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 13}}>
      <div style={{transform: `scale(${k}) rotate(-6deg)`, opacity: a, border: `10px solid ${col}`, color: col, background: 'rgba(255,246,227,0.95)', borderRadius: 18, padding: '14px 36px 6px', ...font, fontSize: L.vert ? 84 : 92, boxShadow: '0 10px 0 rgba(0,0,0,0.3)', textAlign: 'center', lineHeight: 1, maxWidth: L.vert ? 980 : 1700}}>{st.text}</div>
    </AbsoluteFill>
  );
};
const Bubbles: React.FC<{v: V; t: number; cam: Cam; vp: LVP; L: Lay}> = ({v, t, cam, vp, L}) => (
  <>
    {(v.T.bubbles as [number, number, string, string][]).filter(([b0, b1]) => t >= b0 && t <= b1).map(([b0, b1, w, text]) => {
      const f = v.T.faces[w] || [960, 540];
      const [sx, sy] = toS([f[0], f[1]], cam, vp);
      const k = popT(t, b0, 10) * lerp(t, b1 - 0.25, b1, 1, 0);
      const half = text.length * (L.vert ? 14 : 11) + 40;
      return <Bubble key={w + b0} k={k} sx={Math.max(half + 20, Math.min(L.W - half - 20, sx))} sy={Math.min(L.H - (L.vert ? 420 : 140), Math.max(L.vert ? 640 : 280, sy - 40))} text={text} size={L.vert ? 46 : 40} />;
    })}
  </>
);
const Labels: React.FC<{v: V; t: number; cam: Cam; vp: LVP; L: Lay}> = ({v, t, cam, vp, L}) => {
  if (cardActive(v, t)) return null;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 3}}>
      {(v.T.labels as [string, string, number, number?][]).map(([n, side, smin, smax]) => {
        if (cam.s < smin || (smax && cam.s > smax)) return null;
        const p = v.PL[n];
        const [sx, sy] = toS(p, cam, vp);
        if (sx < 80 || sx > L.W - 80 || sy < (L.vert ? 600 : 250) || sy > L.H - (L.vert ? 420 : 120)) return null;
        const cp = (v.T.caps as any[]).filter((c) => c[1] === n && t >= c[0]).slice(-1)[0];
        const sea = side === 'S';
        const tr = side === 'L' ? 'translate(calc(-100% - 12px),-50%)' : side === 'R' ? 'translate(12px,-50%)' : 'translate(-50%,-50%)';
        if (sea) return <div key={n} style={{position: 'absolute', left: sx, top: sy, transform: tr, ...font, fontSize: L.vert ? 30 : 26, color: 'rgba(255,255,255,0.75)', letterSpacing: 3, whiteSpace: 'nowrap', textShadow: '0 2px 4px rgba(0,0,0,0.4)'}}>{n.toUpperCase()}</div>;
        return <div key={n} style={{position: 'absolute', left: sx, top: side === 'C' ? sy + 22 : sy, transform: tr, background: cp ? SIDE[cp[2]] : '#fff', color: cp ? '#fff' : INK, border: `4px solid ${INK}`, borderRadius: 12, padding: '2px 12px 0', ...font, fontSize: L.vert ? 30 : 24, whiteSpace: 'nowrap'}}>{n.toUpperCase()}</div>;
      })}
    </div>
  );
};
// ---------- tarjetas genéricas ----------
const CardBox: React.FC<{t: number; c: any; L: Lay; children: React.ReactNode; title?: string; col?: string}> = ({t, c, L, children, title, col = INK}) => {
  const k = popT(t, c.t0, 12) * lerp(t, c.t1 - 0.3, c.t1, 1, 0);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: L.vert ? 640 : 280, display: 'flex', justifyContent: 'center', zIndex: 12}}>
      <div style={{transform: `scale(${k})`, width: L.vert ? 980 : 1120, background: CREAM, border: `8px solid ${INK}`, borderRadius: 30, padding: '18px 26px 22px', boxShadow: '0 12px 0 rgba(0,0,0,0.35)', boxSizing: 'border-box'}}>
        {title && <div style={{...font, fontSize: L.vert ? 48 : 52, color: col, textAlign: 'center', marginBottom: 10, lineHeight: 1.05}}>{title}</div>}
        {children}
      </div>
    </div>
  );
};
const rowIn = (t: number, t0: number, i: number, gap = 0.45) => ({opacity: lerp(t, t0 + 0.3 + i * gap, t0 + 0.6 + i * gap, 0, 1), transform: `translateX(${lerp(t, t0 + 0.3 + i * gap, t0 + 0.6 + i * gap, -60, 0)}px)`});
const count = (t: number, t0: number, val: number, d = 1.4) => Math.round(val * lerp(t, t0 + 0.3, t0 + 0.3 + d, 0, 1, Easing.out(Easing.cubic)));
const Icon: React.FC<{i: string}> = ({i}) => (i.startsWith('flag:') ? <WFlag code={i.slice(5)} w={58} h={39} /> : <>{i}</>);
const Cards: React.FC<{v: V; t: number; L: Lay}> = ({v, t, L}) => {
  const c = (v.T.cards as any[]).find((x) => t >= x.t0 && t < x.t1);
  if (!c) return null;
  const t0 = c.t0;
  if (c.kind === 'title') {
    const k = popT(t, t0 + 0.1, 10) * lerp(t, c.t1 - 0.4, c.t1, 1, 0);
    return <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 14}}><div style={{transform: `scale(${k}) rotate(-2deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}><div style={{display: 'flex', gap: 30, alignItems: 'center'}}><Avatar size={L.vert ? 220 : 180} code={c.a} mood="angry" t={t} seed={1} look={[1, 0]} id="tt-a" /><div style={{fontSize: 90}}>⚔️</div><Avatar size={L.vert ? 220 : 180} code={c.b} mood="angry" t={t} seed={2} look={[-1, 0]} id="tt-b" /></div><div style={{background: c.col || RED, border: `9px solid ${INK}`, borderRadius: 30, padding: '20px 50px 10px', ...font, fontSize: L.vert ? 92 : 112, color: '#fff', textShadow: `5px 5px 0 ${INK}`, textAlign: 'center', lineHeight: 1.02}}>{c.l1}<br />{c.l2}</div></div></AbsoluteFill>;
  }
  if (c.kind === 'act') {
    const k = popT(t, t0, 11) * lerp(t, c.t1 - 0.3, c.t1, 1, 0);
    return <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 14, background: `rgba(8,15,30,${0.45 * k})`}}><div style={{transform: `scale(${k})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}><div style={{background: YELLOW, border: `7px solid ${INK}`, borderRadius: 20, padding: '6px 28px 0', ...font, fontSize: 52, color: INK}}>ACT {c.n}</div><div style={{...font, fontSize: L.vert ? 100 : 130, color: '#fff', textShadow: `7px 7px 0 ${INK}, -3px -3px 0 ${INK}, 3px -3px 0 ${INK}, -3px 3px 0 ${INK}`, textAlign: 'center', lineHeight: 1}}>{c.text}</div></div></AbsoluteFill>;
  }
  if (c.kind === 'countdown') {
    const lab = c.labels as string[];
    const idx = Math.min(lab.length - 1, Math.floor((t - t0) / ((c.t1 - t0) / lab.length)));
    const lt = t - (t0 + idx * ((c.t1 - t0) / lab.length));
    const k = lerp(lt, 0, 0.12, 0, 1), s2 = lerp(lt, 0, 0.9, 1.5, 1, Easing.out(Easing.cubic));
    const label = lab[idx];
    return <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 15}}><div style={{opacity: k, transform: `scale(${s2})`, ...font, fontSize: label.length > 3 ? (L.vert ? 140 : 180) : 260, color: label.length > 3 ? RED : '#fff', textShadow: `8px 8px 0 ${INK}, -4px -4px 0 ${INK}, 4px -4px 0 ${INK}, -4px 4px 0 ${INK}`}}>{label}</div></AbsoluteFill>;
  }
  if (c.kind === 'bars') {
    const k = lerp(t, t0 + 0.5, t0 + 2.2, 0, 1, Easing.out(Easing.cubic));
    const mx = Math.max(...c.bars.map((b: any) => b[1]));
    return <CardBox t={t} c={c} L={L} title={c.title}>
      {c.bars.map(([f, val, col, lab]: any, j: number) => (
        <div key={j} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: j ? 14 : 0, ...rowIn(t, t0, j, 0.3)}}>
          <WFlag code={f} w={74} h={50} />
          <div style={{flex: 1}}>
            {lab && <div style={{...font2, fontSize: 24, color: '#555'}}>{lab}</div>}
            <div style={{height: 40, background: '#e6d9bd', borderRadius: 20, border: `5px solid ${INK}`, overflow: 'hidden'}}><div style={{width: `${Math.max(1.2, (100 * val * k) / mx)}%`, height: '100%', background: col}} /></div>
          </div>
          <div style={{...font, fontSize: 42, color: col, width: 220, textAlign: 'right'}}>{c.fmt === 'raw' ? val : fmt(Math.round(val * k))}</div>
        </div>
      ))}
      {c.note && <div style={{...font2, fontSize: 26, color: '#666', textAlign: 'center', marginTop: 12}}>{c.note}</div>}
    </CardBox>;
  }
  if (c.kind === 'flags') return <CardBox t={t} c={c} L={L} title={c.title} col={c.col}><div style={{display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center'}}>{c.codes.map((f: string, i: number) => <div key={f + i} style={{transform: `scale(${popT(t, t0 + 0.3 + i * 0.15, 9)})`}}><WFlag code={f} w={92} h={62} /></div>)}</div>{c.note && <div style={{...font, fontSize: 36, color: c.col || INK, textAlign: 'center', marginTop: 14}}>{c.note}</div>}</CardBox>;
  if (c.kind === 'question') {
    const k = popT(t, t0, 11);
    return <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 15, background: `rgba(8,18,32,${0.45 * k})`}}><div style={{display: 'flex', gap: 20, marginBottom: 24, transform: `scale(${k})`}}>{c.faces.map((f: string, i: number) => <Avatar key={f} size={L.vert ? 190 : 160} code={f} mood={c.moods[i]} t={t} seed={i + 1} id={`q-${f}`} />)}</div><div style={{transform: `scale(${k}) rotate(-2deg)`, background: '#fff', border: `9px solid ${INK}`, borderRadius: 30, padding: '24px 44px 14px', ...font, fontSize: L.vert ? 92 : 100, color: INK, textAlign: 'center', lineHeight: 1.05, maxWidth: L.vert ? 980 : 1500}}>{c.l1} <span style={{color: RED}}>{c.l2}</span></div><div style={{marginTop: 28, transform: `scale(${popT(t, t0 + 0.8, 12)})`, background: YELLOW, border: `6px solid ${INK}`, borderRadius: 24, padding: '8px 34px 2px', ...font, fontSize: L.vert ? 50 : 56, color: INK}}>{c.sub}</div></AbsoluteFill>;
  }
  if (c.kind === 'verdict') {
    const k = popT(t, t0, 11) * lerp(t, c.t1 - 0.3, c.t1, 1, 0);
    return <div style={{position: 'absolute', left: 0, right: 0, bottom: L.vert ? 420 : 70, display: 'flex', justifyContent: 'center', zIndex: 12}}><div style={{transform: `scale(${k})`, display: 'flex', alignItems: 'center', gap: 20, background: CREAM, border: `8px solid ${INK}`, borderRadius: 30, padding: '14px 30px 14px 14px', maxWidth: L.vert ? 1000 : 1400}}><Avatar size={L.vert ? 150 : 160} code={c.f} mood={c.mood} t={t} seed={c.f.length} id={`vd-${c.f}`} /><div><div style={{...font, fontSize: L.vert ? 54 : 62, color: c.col || RED, lineHeight: 1}}>{c.name}</div><div style={{...font, fontSize: L.vert ? 36 : 42, color: INK, lineHeight: 1.1}}>{c.text}</div></div></div></div>;
  }
  // 'rows'
  return <CardBox t={t} c={c} L={L} title={c.title} col={c.col}>{(c.rows as any[]).map(([i, l, val, vcol, num], j) => (
    <div key={j} style={{display: 'flex', alignItems: 'center', gap: 16, minHeight: 70, borderTop: j ? '3px solid #e2d3b1' : 'none', ...rowIn(t, t0, j, c.gap || 0.45)}}>
      <div style={{width: 74, display: 'flex', justifyContent: 'center', fontSize: 44}}><Icon i={i} /></div>
      <div style={{...font2, fontSize: L.vert ? 30 : 33, color: INK, flex: 1}}>{l}</div>
      <div style={{...font, fontSize: L.vert ? 36 : 42, color: vcol || INK, textAlign: 'right'}}>{num ? `${fmt(count(t, t0 + j * (c.gap || 0.45), num))}${val}` : val}</div>
    </div>
  ))}{c.note && <div style={{...font2, fontSize: 24, color: '#777', textAlign: 'center', marginTop: 8}}>{c.note}</div>}</CardBox>;
};
const Credit: React.FC<{v: V; L: Lay}> = ({v, L}) => <div style={{position: 'absolute', right: 18, bottom: L.vert ? 300 : 12, background: 'rgba(15,25,40,0.65)', color: '#fff', borderRadius: 12, padding: '5px 14px', ...font2, fontWeight: 600, fontSize: 17, zIndex: 20}}>{v.T.credit}</div>;
export const Overlay9: React.FC<{id: string; t: number; cam: Cam; vp: LVP; L: Lay; hideTitle?: boolean}> = ({id, t, cam, vp, L, hideTitle}) => {
  const v = VIDS[id];
  return (
    <>
      <Labels v={v} t={t} cam={cam} vp={vp} L={L} />
      <Hud v={v} t={t} L={L} />
      <ChipBar v={v} t={t} L={L} />
      <Ticker v={v} t={t} L={L} />
      <Bubbles v={v} t={t} cam={cam} vp={vp} L={L} />
      {!(hideTitle && t < 4.5) && <Cards v={v} t={t} L={L} />}
      <Stamp v={v} t={t} L={L} />
      <Credit v={v} L={L} />
    </>
  );
};
export const Ocean9: React.FC<{t: number; W: number; H: number}> = ({t, W, H}) => (
  <svg width={W} height={H} style={{position: 'absolute'}}>
    <defs>
      <radialGradient id="sea9" cx="50%" cy="50%" r="80%"><stop offset="0%" stopColor="#3f97d6" /><stop offset="100%" stopColor="#1d5e9f" /></radialGradient>
      <pattern id="waves9" width={140} height={46} patternUnits="userSpaceOnUse" patternTransform={`translate(${(t * 10.5) % 140},0)`}><path d="M0,23 C17,13 35,13 52,23 S87,33 105,23 S122,13 140,23" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={3} /></pattern>
    </defs>
    <rect width={W} height={H} fill="url(#sea9)" /><rect width={W} height={H} fill="url(#waves9)" />
  </svg>
);
export const War9: React.FC<{id: string}> = ({id}) => {
  usePreload();
  const t = useCurrentFrame() / 30;
  const cam = camera(VIDS[id], t);
  const L: Lay = {W: 1920, H: 1080, vert: false};
  return (
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <Ocean9 t={t} W={1920} H={1080} />
      <RegionMap id={id} t={t} cam={cam} />
      <Overlay9 id={id} t={t} cam={cam} vp={LV0} L={L} />
      <Audio src={staticFile(`music-${id}.wav`)} />
    </AbsoluteFill>
  );
};
