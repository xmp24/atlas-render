import React from 'react';
import {AbsoluteFill, Audio, Easing, staticFile, useCurrentFrame} from 'remotion';
import {INK, CREAM, RED, YELLOW, GREEN, ORANGE, lerp, font, font2, popT, Face, Bubble, Boom, Mood, P} from './lib3';
import k8 from './mw/k8.json';
import ring from './mw/ring.json';
import island from './mw/island.json';
import bridge from './mw/bridge.json';
import alliance from './mw/alliance.json';
import civil from './mw/civil.json';
import warriors from './mw/warriors.json';
import storm from './mw/storm.json';
import f1 from './mw/f1.json';
import f2 from './mw/f2.json';
import f3 from './mw/f3.json';
import f4 from './mw/f4.json';
import f5 from './mw/f5.json';
import f6 from './mw/f6.json';
import f7 from './mw/f7.json';
import f8 from './mw/f8.json';
import g1 from './mw/g1.json';
import g2 from './mw/g2.json';
import g3 from './mw/g3.json';
import g4 from './mw/g4.json';
import g5 from './mw/g5.json';
import g6 from './mw/g6.json';
import g7 from './mw/g7.json';
import g8 from './mw/g8.json';

export const MW_IDS = ['k8', 'ring', 'island', 'bridge', 'alliance', 'civil', 'warriors', 'storm'];
export const RAW: Record<string, any> = {k8, ring, island, bridge, alliance, civil, warriors, storm, f1, f2, f3, f4, f5, f6, f7, f8, g1, g2, g3, g4, g5, g6, g7, g8};
export const mwFrames = (id: string) => Math.round(RAW[id].duration * 30);
const W = 1080, H = 1920;
const STORM_COL = '#3d2b63';

// ---------- preparación por escenario (en caché) ----------
type D = ReturnType<typeof build>;
const CACHE = new Map<string, D>();
export const get = (id: string): D => { if (!CACHE.has(id)) CACHE.set(id, build(RAW[id])); return CACHE.get(id)!; };
function build(T: any) {
  const R: number = T.R, N: number = T.N, NK: number = T.NK;
  const CELLS: P[] = T.cells, NB: number[][] = T.nb;
  const HISTC: [number, number][][] = T.own.map((o: number) => [[-1, o]]);
  for (const [t, i, a] of T.ev as [number, number, number][]) HISTC[i].push([t, a]);
  const hexD = (x: number, y: number, r = R + 0.6) => { let s = ''; for (let k = 0; k < 6; k++) { const a = (Math.PI / 180) * (60 * k - 90); s += `${k ? 'L' : 'M'}${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`; } return s + 'Z'; };
  const HEX = CELLS.map(([x, y]) => hexD(x, y));
  const DX = Math.sqrt(3) * R, DY = 1.5 * R;
  const edge = (a: P, b: P) => { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy); const px = (-dy / l) * (R / 2), py = (dx / l) * (R / 2); return `M${(mx + px).toFixed(1)},${(my + py).toFixed(1)}L${(mx - px).toFixed(1)},${(my - py).toFixed(1)}`; };
  const DIRS: P[] = [[DX, 0], [-DX, 0], [DX / 2, DY], [-DX / 2, DY], [DX / 2, -DY], [-DX / 2, -DY]];
  let COAST = '';
  CELLS.forEach(([x, y], i) => { for (const [dx, dy] of DIRS) { const has = NB[i].some((j) => Math.abs(CELLS[j][0] - x - dx) < 2 && Math.abs(CELLS[j][1] - y - dy) < 2); if (!has) COAST += edge([x, y], [x + dx, y + dy]); } });
  // decoración por región original
  const deco: {x: number; y: number; ty: string; s: number}[] = [];
  CELLS.forEach(([x, y], i) => {
    const ty = T.deco?.[String(T.own[i])];
    if (!ty) return;
    const h = (i * 2654435761) % 1000;
    const every = ty === 'castle' ? 97 : ty === 'mountain' ? 17 : 13;
    if (h % every === 0) deco.push({x: x + ((h % 7) - 3) * 2, y: y + ((h % 5) - 2) * 2, ty, s: 0.8 + (h % 10) / 25});
  });
  const elimOf: Record<number, number[]> = {};
  for (const e of T.elim as number[][]) elimOf[e[1]] = e;
  return {T, R, N, NK, CELLS, NB, HISTC, HEX, edge, COAST, deco, elimOf, NAMES: T.names as string[], COLS: T.cols as string[], DARKS: T.darks as string[]};
}
const mix = (a: string, b: string, k: number) => {
  const pa = [1, 3, 5].map((j) => parseInt(a.slice(j, j + 2), 16)), pb = [1, 3, 5].map((j) => parseInt(b.slice(j, j + 2), 16));
  return '#' + pa.map((v, j) => Math.round(v + (pb[j] - v) * k).toString(16).padStart(2, '0')).join('');
};
const colOf = (d: D, o: number) => (o >= d.NK ? STORM_COL : d.COLS[o]);
const idx = (arr: any[], t: number) => arr[Math.max(0, Math.min(arr.length - 1, Math.floor(t * 10)))];

// ---------- estado por fotograma ----------
type Frame = {own: Int8Array; flips: [number, number, number][]; cents: (P | null)[]; t: number};
export const frameState = (d: D, t: number): Frame => {
  const own = new Int8Array(d.N);
  const flips: [number, number, number][] = [];
  for (let i = 0; i < d.N; i++) {
    const h = d.HISTC[i];
    let k = 0;
    while (k + 1 < h.length && h[k + 1][0] <= t) k++;
    own[i] = h[k][1];
    if (k > 0 && t - h[k][0] < 0.35) flips.push([i, h[k - 1][1], t - h[k][0]]);
  }
  // centro del trozo más grande de cada país
  const seen = new Uint8Array(d.N);
  const best: {n: number; c: P}[] = Array.from({length: d.NK}, () => ({n: 0, c: [0, 0] as P}));
  for (let i = 0; i < d.N; i++) {
    const o = own[i];
    if (seen[i] || o >= d.NK) continue;
    let n = 0, sx = 0, sy = 0;
    const st = [i]; seen[i] = 1;
    while (st.length) { const u = st.pop()!; n++; sx += d.CELLS[u][0]; sy += d.CELLS[u][1]; for (const v of d.NB[u]) if (!seen[v] && own[v] === o) { seen[v] = 1; st.push(v); } }
    if (n > best[o].n) best[o] = {n, c: [sx / n, sy / n]};
  }
  return {own, flips, cents: best.map((b) => (b.n ? b.c : null)), t};
};

// ---------- banderas inventadas ----------
const star = (cx: number, cy: number, r: number) => Array.from({length: 10}).map((_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; return `${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`; }).join(' ');
const GFlag: React.FC<{f: any; w: number; h: number}> = ({f, w, h}) => {
  const c = f.c as string[];
  const bg = <rect width={w} height={h} fill={c[0]} />;
  const cx = w / 2, cy = h / 2;
  switch (f.t) {
    case 'diag': return <>{bg}<polygon points={`0,${h} ${w * 0.45},0 ${w * 0.62},0 ${w * 0.17},${h}`} fill={c[1]} /><circle cx={w * 0.72} cy={cy} r={h * 0.2} fill={c[2]} /></>;
    case 'anchor': return <>{bg}<g stroke={c[1]} strokeWidth={h * 0.07} fill="none" strokeLinecap="round"><line x1={cx} y1={h * 0.2} x2={cx} y2={h * 0.8} /><line x1={cx - h * 0.14} y1={h * 0.32} x2={cx + h * 0.14} y2={h * 0.32} /><path d={`M${cx - h * 0.26},${h * 0.58} Q${cx - h * 0.2},${h * 0.82} ${cx},${h * 0.8} Q${cx + h * 0.2},${h * 0.82} ${cx + h * 0.26},${h * 0.58}`} /></g><circle cx={cx} cy={h * 0.16} r={h * 0.06} fill="none" stroke={c[1]} strokeWidth={h * 0.05} /></>;
    case 'sun': return <>{bg}<circle cx={cx} cy={cy} r={h * 0.24} fill={c[1]} />{Array.from({length: 8}).map((_, i) => { const a = (i / 8) * Math.PI * 2; return <line key={i} x1={cx + Math.cos(a) * h * 0.31} y1={cy + Math.sin(a) * h * 0.31} x2={cx + Math.cos(a) * h * 0.43} y2={cy + Math.sin(a) * h * 0.43} stroke={c[1]} strokeWidth={h * 0.06} strokeLinecap="round" />; })}</>;
    case 'tree': return <>{bg}<polygon points={`${cx},${h * 0.16} ${w * 0.7},${h * 0.62} ${w * 0.3},${h * 0.62}`} fill={c[1]} /><polygon points={`${cx},${h * 0.34} ${w * 0.76},${h * 0.84} ${w * 0.24},${h * 0.84}`} fill={c[1]} /></>;
    case 'moon': return <>{bg}<circle cx={cx - h * 0.04} cy={cy} r={h * 0.26} fill={c[1]} /><circle cx={cx + h * 0.06} cy={cy - h * 0.04} r={h * 0.23} fill={c[0]} /><polygon points={star(cx + h * 0.2, cy - h * 0.02, h * 0.1)} fill={c[1]} /></>;
    case 'vstripe': return <>{c.map((col, i) => <rect key={i} x={(w / 3) * i} width={w / 3 + 1} height={h} fill={col} />)}</>;
    case 'hstripe': return <>{c.map((col, i) => <rect key={i} y={(h / 3) * i} width={w} height={h / 3 + 1} fill={col} />)}</>;
    case 'snow': return <>{bg}<g stroke={c[1]} strokeWidth={h * 0.06} strokeLinecap="round">{[0, 60, 120].map((a) => { const r = (a * Math.PI) / 180; return <line key={a} x1={cx - Math.cos(r) * h * 0.3} y1={cy - Math.sin(r) * h * 0.3} x2={cx + Math.cos(r) * h * 0.3} y2={cy + Math.sin(r) * h * 0.3} />; })}</g></>;
    case 'circle': return <>{bg}<circle cx={cx} cy={cy} r={h * 0.28} fill={c[1]} /></>;
    case 'star': return <>{bg}<rect y={h * 0.38} width={w} height={h * 0.24} fill={c[1]} /><polygon points={star(cx, cy, h * 0.22)} fill={c[2]} stroke={INK} strokeWidth={h * 0.02} /></>;
    case 'crown': return <>{bg}<path d={`M${cx - h * 0.3},${h * 0.66} L${cx - h * 0.34},${h * 0.3} L${cx - h * 0.15},${h * 0.46} L${cx},${h * 0.24} L${cx + h * 0.15},${h * 0.46} L${cx + h * 0.34},${h * 0.3} L${cx + h * 0.3},${h * 0.66} Z`} fill={c[1]} /></>;
    case 'mountain': return <>{bg}<polygon points={`${w * 0.12},${h * 0.8} ${w * 0.4},${h * 0.25} ${w * 0.55},${h * 0.5} ${w * 0.66},${h * 0.35} ${w * 0.9},${h * 0.8}`} fill={c[1]} /></>;
    case 'wave': return <>{bg}{[0.38, 0.62].map((y) => <path key={y} d={`M0,${h * y} Q${w * 0.17},${h * (y - 0.1)} ${w * 0.33},${h * y} T${w * 0.67},${h * y} T${w},${h * y}`} fill="none" stroke={c[1]} strokeWidth={h * 0.07} />)}</>;
    case 'sword': return <>{bg}<polygon points={`${cx},${h * 0.12} ${cx + h * 0.05},${h * 0.62} ${cx - h * 0.05},${h * 0.62}`} fill={c[1]} /><rect x={cx - h * 0.18} y={h * 0.62} width={h * 0.36} height={h * 0.06} fill={c[1]} /><rect x={cx - h * 0.03} y={h * 0.68} width={h * 0.06} height={h * 0.16} fill={c[1]} /></>;
    case 'crossK': return <>{bg}<rect x={cx - h * 0.1} width={h * 0.2} height={h} fill={c[1]} /><rect y={cy - h * 0.1} width={w} height={h * 0.2} fill={c[1]} /></>;
    case 'axe': return <>{bg}<g stroke={c[1]} strokeWidth={h * 0.06} strokeLinecap="round"><line x1={cx - h * 0.3} y1={h * 0.85} x2={cx + h * 0.25} y2={h * 0.2} /><line x1={cx + h * 0.3} y1={h * 0.85} x2={cx - h * 0.25} y2={h * 0.2} /></g><path d={`M${cx + h * 0.12},${h * 0.18} q${h * 0.24},${h * 0.04} ${h * 0.2},${h * 0.26} z M${cx - h * 0.12},${h * 0.18} q${-h * 0.24},${h * 0.04} ${-h * 0.2},${h * 0.26} z`} fill={c[1]} /></>;
    case 'rising': return <>{bg}{Array.from({length: 12}).map((_, i) => { const a = (i / 12) * Math.PI * 2; return <polygon key={i} points={`${cx},${cy} ${cx + Math.cos(a) * w},${cy + Math.sin(a) * w} ${cx + Math.cos(a + 0.13) * w},${cy + Math.sin(a + 0.13) * w}`} fill={c[1]} opacity={0.5} />; })}<circle cx={cx} cy={cy} r={h * 0.26} fill={c[1]} /></>;
    case 'lambda': return <>{bg}<path d={`M${cx - h * 0.28},${h * 0.8} L${cx},${h * 0.2} L${cx + h * 0.28},${h * 0.8}`} fill="none" stroke={c[1]} strokeWidth={h * 0.11} strokeLinejoin="round" /></>;
    case 'emoji': return <>{bg}<rect y={h * 0.62} width={w} height={h * 0.38} fill={c[1] || 'rgba(0,0,0,0.18)'} /><text x={cx} y={h * 0.31} fontSize={h * 0.28} textAnchor="middle" dominantBaseline="central">{f.e}</text></>;
    default: return bg;
  }
};
export const Ball: React.FC<{d: D; k: number; size: number; mood: Mood; t: number; look?: P; id: string; dead?: boolean}> = ({d, k, size, mood, t, look, id, dead}) => (
  <svg width={size} height={size} viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} style={{overflow: 'visible', display: 'block', filter: dead ? 'grayscale(0.85) brightness(0.8)' : 'none'}}>
    <defs><clipPath id={`gb-${id}`}><circle r={size / 2 - 3} /></clipPath></defs>
    <circle r={size / 2} fill={INK} transform="translate(0,5)" opacity={0.35} />
    <g clipPath={`url(#gb-${id})`}><g transform={`translate(${-size * 0.75},${-size / 2})`}><GFlag f={d.T.flags[k]} w={size * 1.5} h={size} /></g></g>
    <circle r={size / 2 - 3} fill="none" stroke={INK} strokeWidth={Math.max(3.5, size * 0.05)} />
    <Face x={0} y={-size * 0.04} r={size * 0.3} mood={dead ? 'shocked' : mood} t={t} seed={k * 3 + 1} look={look} />
    {dead && <g><path d={`M${-size * 0.3},${-size * 0.3} L${size * 0.3},${size * 0.3} M${size * 0.3},${-size * 0.3} L${-size * 0.3},${size * 0.3}`} stroke={INK} strokeWidth={size * 0.16} strokeLinecap="round" /><path d={`M${-size * 0.3},${-size * 0.3} L${size * 0.3},${size * 0.3} M${size * 0.3},${-size * 0.3} L${-size * 0.3},${size * 0.3}`} stroke={RED} strokeWidth={size * 0.09} strokeLinecap="round" /></g>}
  </svg>
);
export const histAt = (d: D, t: number) => idx(d.T.hist, t) as number[];
export const isDead = (d: D, k: number, t: number) => !!d.elimOf[k] && t >= d.elimOf[k][0];
export const moodOf = (d: D, t: number, k: number): Mood => {
  if (t < d.T.warStart) return 'angry';
  if (t > d.T.winT && k === d.T.winner) return 'happy';
  const dd = histAt(d, t)[k] - histAt(d, t - 1.5)[k];
  if (dd > 8) return 'smug';
  if (dd < -8) return 'scared';
  return 'angry';
};
// ---------- cámara ----------
export const camAt = (d: D, t: number) => {
  const c = d.T.cam as number[][];
  const f = Math.max(0, Math.min(c.length - 1.001, t * 10)), i = Math.floor(f), k = f - i;
  const a = c[i], b = c[Math.min(c.length - 1, i + 1)];
  let cx = a[0] + (b[0] - a[0]) * k, cy = a[1] + (b[1] - a[1]) * k;
  const s = a[2] + (b[2] - a[2]) * k;
  for (const [st] of d.T.stamps as [number][]) { const dt = t - st; if (dt >= 0 && dt < 0.35) { const am = (1 - dt / 0.35) * 9; cx += Math.sin(dt * 90) * am; cy += Math.cos(dt * 70) * am; } }
  return {cx, cy, s};
};
const toS = (d: D, p: P, c: {cx: number; cy: number; s: number}): P => [540 + (p[0] - c.cx) * c.s, d.T.mapy + (p[1] - c.cy) * c.s];

// ---------- decoración ----------
const Deco: React.FC<{x: number; y: number; ty: string; s: number}> = ({x, y, ty, s}) => {
  const g = (el: React.ReactNode) => <g transform={`translate(${x},${y}) scale(${s})`}>{el}</g>;
  switch (ty) {
    case 'snow': return g(<g fill="rgba(255,255,255,0.75)"><circle r={2.6} /><circle cx={7} cy={4} r={1.8} /><circle cx={-6} cy={5} r={1.6} /></g>);
    case 'mountain': return g(<path d="M-16,9 L-3,-13 L4,-3 L9,-9 L20,9 Z" fill="rgba(0,0,0,0.18)" stroke="rgba(0,0,0,0.35)" strokeWidth={2} strokeLinejoin="round" />);
    case 'forest': return g(<g fill="rgba(0,0,0,0.26)"><circle cx={-5} cy={0} r={6} /><circle cx={5} cy={2} r={5} /><circle cx={0} cy={-5} r={5} /></g>);
    case 'jungle': return g(<g fill="rgba(0,40,10,0.35)"><circle cx={-6} cy={0} r={7} /><circle cx={6} cy={1} r={7} /><circle cx={0} cy={-6} r={6} /><circle cx={0} cy={5} r={6} /></g>);
    case 'palm': return g(<g stroke="rgba(0,0,0,0.35)" strokeWidth={2.4} fill="none" strokeLinecap="round"><path d="M0,10 Q2,0 0,-8" /><path d="M0,-8 Q-9,-10 -12,-4 M0,-8 Q9,-10 12,-4 M0,-8 Q-4,-15 -9,-15 M0,-8 Q4,-15 9,-15" /></g>);
    case 'desert': return g(<g stroke="rgba(120,70,0,0.35)" strokeWidth={2.2} fill="none" strokeLinecap="round"><path d="M-14,4 Q-7,-3 0,4" /><path d="M-2,9 Q5,2 12,9" /></g>);
    case 'steppe': return g(<g stroke="rgba(0,0,0,0.25)" strokeWidth={2} strokeLinecap="round"><path d="M-6,6 L-8,-2 M-3,6 L-3,-4 M0,6 L2,-2" /></g>);
    case 'swamp': return g(<g stroke="rgba(30,60,30,0.4)" strokeWidth={2.2} fill="none" strokeLinecap="round"><path d="M-12,0 q4,-4 8,0 t8,0 t8,0" /><path d="M-8,7 q4,-4 8,0 t8,0" /></g>);
    case 'castle': return g(<g fill="rgba(70,70,80,0.8)" stroke={INK} strokeWidth={1.6}><rect x={-12} y={-6} width={24} height={14} /><rect x={-14} y={-14} width={7} height={22} /><rect x={7} y={-14} width={7} height={22} /><path d="M-14,-14 h2 v-3 h3 v3 h2 M7,-14 h2 v-3 h3 v3 h2" /><rect x={-3} y={0} width={6} height={8} fill={INK} /></g>);
    case 'sakura': return g(<g fill="rgba(255,190,215,0.9)"><circle r={3.2} /><circle cx={7} cy={3} r={2.6} /><circle cx={-5} cy={5} r={2.4} /></g>);
    default: return null;
  }
};

// ---------- mapa ----------
export const MapLayer: React.FC<{d: D; f: Frame}> = ({d, f}) => {
  const {t, own} = f;
  const cam = camAt(d, t);
  const T = d.T;
  const paths: string[] = Array.from({length: d.NK + 1}, () => '');
  const flashing = new Set(f.flips.map((x) => x[0]));
  const pre = T.pre;
  if (pre && t < pre.split + 1.2) {
    // imperio unido antes de dividirse
    let joined = '', fl: React.ReactNode[] = [];
    for (let i = 0; i < d.N; i++) {
      const [x, y] = d.CELLS[i];
      const dl = pre.split + Math.hypot(x - 540, y - 1050) / 900;
      if (t < dl) joined += d.HEX[i];
      else if (t < dl + 0.3) fl.push(<path key={i} d={d.HEX[i]} fill={t < dl + 0.08 ? '#fff' : mix(pre.col, d.COLS[own[i]], (t - dl - 0.08) / 0.22)} />);
      else paths[own[i]] += d.HEX[i];
    }
    return (
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <g transform={`translate(540,${T.mapy}) scale(${cam.s}) translate(${-cam.cx},${-cam.cy})`}>
          <path d={d.COAST} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={18} strokeLinecap="round" />
          <path d={joined} fill={pre.col} />{paths.map((p, k) => <path key={k} d={p} fill={colOf(d, k)} />)}{fl}
          <path d={d.COAST} fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
        </g>
      </svg>
    );
  }
  const flash: React.ReactNode[] = [];
  for (let i = 0; i < d.N; i++) if (!flashing.has(i)) paths[own[i]] += d.HEX[i];
  for (const [i, prev, dt] of f.flips) flash.push(<path key={i} d={d.HEX[i]} fill={d.T.fast ? mix(mix(colOf(d, own[i]), '#ffffff', 0.5), colOf(d, own[i]), Math.min(1, dt / 0.3)) : dt < 0.08 ? '#fff' : mix(colOf(d, prev), colOf(d, own[i]), Math.min(1, (dt - 0.08) / 0.27))} />);
  let borders = '';
  for (let i = 0; i < d.N; i++) for (const j of d.NB[i]) if (j > i && own[j] !== own[i]) borders += d.edge(d.CELLS[i], d.CELLS[j]);
  const inv = 1 / cam.s;
  return (
    <svg width={W} height={H} style={{position: 'absolute'}}>
      <defs>
        <pattern id="stormTex" width={60} height={60} patternUnits="userSpaceOnUse" patternTransform={`rotate(${t * 40}) translate(${t * 30},0)`}><path d="M0,30 Q15,10 30,30 T60,30" fill="none" stroke="rgba(190,150,255,0.35)" strokeWidth={4} /><circle cx={45} cy={12} r={3} fill="rgba(255,255,255,0.25)" /></pattern>
        <pattern id="hexTexG" width={8} height={8} patternUnits="userSpaceOnUse"><circle cx={2} cy={2} r={0.9} fill="rgba(255,255,255,0.18)" /></pattern>
      </defs>
      <g transform={`translate(540,${T.mapy}) scale(${cam.s}) translate(${-cam.cx},${-cam.cy})`}>
        <path d={d.COAST} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={22} strokeLinecap="round" />
        <path d={d.COAST} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={10} strokeLinecap="round" />
        {paths.map((p, k) => <path key={k} d={p} fill={colOf(d, k)} />)}
        {flash}
        {paths.slice(0, d.NK).map((p, k) => <path key={`h${k}`} d={p} fill="url(#hexTexG)" opacity={0.5} />)}
        {T.storm && <path d={paths[d.NK]} fill="url(#stormTex)" />}
        {d.deco.filter((q) => { const i = 0; return true; }).map((q, i) => <Deco key={i} {...q} />)}
        <path d={borders} fill="none" stroke={INK} strokeWidth={3.2} strokeLinecap="round" />
        <path d={d.COAST} fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
        <Units d={d} t={t} inv={inv} />
        {(T.booms as [number, number, number][]).filter(([bt]) => t >= bt && t < bt + 1.6).map(([bt, x, y], i) => <Boom key={i} p={[x, y]} t={t} at={bt} r={20 * inv} />)}
      </g>
      {T.storm && <StormFx d={d} t={t} />}
    </svg>
  );
};
const StormFx: React.FC<{d: D; t: number}> = ({d, t}) => {
  const ph = (d.T.stormPhases as number[][]).find((p) => t >= p[0] - 0.2 && t <= p[1] + 0.4);
  if (!ph) return null;
  const k = Math.floor(t * 6);
  const on = (k * 7919) % 11 < 2;
  if (!on) return null;
  const x = 120 + ((k * 389) % 840), y = 500 + ((k * 571) % 900);
  return <g><rect width={W} height={H} fill="rgba(220,200,255,0.18)" /><path d={`M${x},${y - 260} L${x - 30},${y - 120} L${x + 20},${y - 110} L${x - 25},${y}`} fill="none" stroke="#fff" strokeWidth={9} strokeLinejoin="round" /><path d={`M${x},${y - 260} L${x - 30},${y - 120} L${x + 20},${y - 110} L${x - 25},${y}`} fill="none" stroke="#c9a7ff" strokeWidth={4} strokeLinejoin="round" /></g>;
};

// ---------- unidades ----------
type U = {c: number; ty: string; f: number; r: string; k: [number, number, number][]; t0: number; t1: number};
const posAt = (u: U, t: number): P => {
  const k = u.k;
  if (t <= k[0][0]) return [k[0][1], k[0][2]];
  if (t >= k[k.length - 1][0]) return [k[k.length - 1][1], k[k.length - 1][2]];
  let i = 0;
  while (i < k.length - 2 && k[i + 1][0] < t) i++;
  const a = k[i], b = k[i + 1], f = Math.max(0, Math.min(1, (t - a[0]) / (b[0] - a[0] || 1)));
  const e = u.ty === 'ship' || u.ty === 'longship' ? Easing.inOut(Easing.cubic)(f) : f;
  return [a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e];
};
const PER: Record<string, number> = {inf: 0.62, sniper: 1.9, tank: 1.45, art: 2.3, ship: 1.7, longship: 99, knight: 0.9, sword: 0.75, axe: 0.85, katana: 0.6, spear: 0.8};
const MELEE = new Set(['knight', 'sword', 'axe', 'katana', 'spear']);
const Soldier: React.FC<{x: number; y: number; c: string; dk: string}> = ({x, y, c, dk}) => (
  <g transform={`translate(${x},${y})`}>
    <line x1={2} y1={-3} x2={15} y2={-6} stroke={INK} strokeWidth={3} strokeLinecap="round" />
    <rect x={-5} y={-6} width={10} height={14} rx={4} fill={c} stroke={INK} strokeWidth={2.2} />
    <circle cx={0} cy={-10} r={4.6} fill="#f2c79b" stroke={INK} strokeWidth={2} />
    <path d="M-5.6,-10 A5.8,5.8 0 0 1 5.6,-10 Z" fill={dk} stroke={INK} strokeWidth={2} />
  </g>
);
const Warrior: React.FC<{x: number; y: number; ty: string; c: string; dk: string; sw: number}> = ({x, y, ty, c, dk, sw}) => {
  const helm = ty === 'axe' ? <g><path d="M-6,-11 A6,6 0 0 1 6,-11 Z" fill="#9aa1ab" stroke={INK} strokeWidth={1.8} /><path d="M-6,-12 q-5,-2 -5,-8 M6,-12 q5,-2 5,-8" fill="none" stroke="#f3ead8" strokeWidth={2.6} strokeLinecap="round" /></g>
    : ty === 'katana' ? <g><path d="M-6.5,-10 A6.5,6.5 0 0 1 6.5,-10 Z" fill="#2b2b2b" stroke={INK} strokeWidth={1.8} /><path d="M-5,-15 L0,-11 L5,-15" fill="none" stroke="#ffd23f" strokeWidth={2.2} /></g>
    : ty === 'spear' ? <g><path d="M-6,-10 A6,6 0 0 1 6,-10 Z" fill="#c8973a" stroke={INK} strokeWidth={1.8} /><path d="M-6,-15 Q0,-22 6,-15" fill="none" stroke="#c0281c" strokeWidth={4} /></g>
    : <path d="M-6,-10 A6,6 0 0 1 6,-10 L6,-7 L-6,-7 Z" fill="#b8bec7" stroke={INK} strokeWidth={1.8} />;
  const weapon = ty === 'axe' ? <g transform={`rotate(${sw})`}><line x1={4} y1={-2} x2={16} y2={-14} stroke="#6b411c" strokeWidth={2.6} strokeLinecap="round" /><path d="M13,-17 q8,0 7,9 l-6,-4 z" fill="#cfd5dc" stroke={INK} strokeWidth={1.4} /></g>
    : ty === 'spear' ? <g transform={`rotate(${sw * 0.4})`}><line x1={-6} y1={0} x2={26} y2={-6} stroke="#6b411c" strokeWidth={2.4} strokeLinecap="round" /><polygon points="26,-9 33,-7 26,-3" fill="#cfd5dc" stroke={INK} strokeWidth={1} /></g>
    : ty === 'katana' ? <g transform={`rotate(${sw})`}><path d="M4,-2 Q14,-10 22,-20" fill="none" stroke="#e6ebf0" strokeWidth={2.6} strokeLinecap="round" /><line x1={3} y1={0} x2={6} y2={-4} stroke={INK} strokeWidth={3} /></g>
    : <g transform={`rotate(${sw})`}><line x1={4} y1={-2} x2={18} y2={-16} stroke="#e6ebf0" strokeWidth={3} strokeLinecap="round" /><line x1={2} y1={-6} x2={8} y2={0} stroke={INK} strokeWidth={2.4} /></g>;
  const shield = ty === 'spear' ? <circle cx={-6} cy={0} r={8} fill="#c8973a" stroke={INK} strokeWidth={2} /> : ty === 'axe' ? <circle cx={-6} cy={0} r={7} fill={c} stroke={INK} strokeWidth={2} /> : ty === 'sword' ? <path d="M-12,-6 h10 v8 q-5,6 -10,0 z" fill={c} stroke={INK} strokeWidth={1.8} /> : null;
  return (
    <g transform={`translate(${x},${y})`}>
      {weapon}
      <rect x={-5} y={-6} width={10} height={14} rx={4} fill={c} stroke={INK} strokeWidth={2.2} />
      <circle cx={0} cy={-10} r={4.8} fill="#f2c79b" stroke={INK} strokeWidth={2} />
      {helm}{shield}
    </g>
  );
};
export const UnitIcon: React.FC<{ty: string; c: string; dk: string; recoil?: number; sw?: number}> = ({ty, c, dk, recoil = 0, sw = 0}) => {
  if (ty === 'tank') return (
    <g>
      <rect x={-22} y={2} width={44} height={11} rx={5} fill="#3a3a3a" stroke={INK} strokeWidth={2.5} />
      {[-15, -5, 5, 15].map((x) => <circle key={x} cx={x} cy={7.5} r={3} fill="#777" />)}
      <rect x={-20} y={-7} width={38} height={11} rx={4} fill={c} stroke={INK} strokeWidth={2.5} />
      <rect x={-6 - recoil} y={-3.5} width={30} height={4.5} rx={2} fill={dk} stroke={INK} strokeWidth={2} />
      <rect x={-12} y={-15} width={18} height={11} rx={5} fill={dk} stroke={INK} strokeWidth={2.5} />
    </g>
  );
  if (ty === 'art') return (
    <g>
      <line x1={-4} y1={2} x2={20 - recoil} y2={-12 + recoil * 0.5} stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <line x1={-4} y1={2} x2={20 - recoil} y2={-12 + recoil * 0.5} stroke={dk} strokeWidth={5} strokeLinecap="round" />
      <path d="M-16,10 L4,0 L10,10" fill="none" stroke={INK} strokeWidth={3} />
      <circle cx={-2} cy={8} r={7} fill={c} stroke={INK} strokeWidth={2.5} /><circle cx={-2} cy={8} r={2} fill={INK} />
      <Soldier x={-16} y={4} c={c} dk={dk} />
    </g>
  );
  if (ty === 'sniper') return (
    <g>
      {[-14, -7, 0, 7].map((x, i) => <circle key={i} cx={x} cy={4 - (i % 2) * 2} r={4} fill={i % 2 ? '#4f6b2a' : '#6d8a3a'} />)}
      <ellipse cx={-4} cy={5} rx={13} ry={4.5} fill={c} stroke={INK} strokeWidth={2.2} />
      <line x1={4} y1={2} x2={28} y2={1} stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
      <rect x={10} y={-2.5} width={7} height={3} fill={INK} />
      <circle cx={8} cy={1} r={4.4} fill="#f2c79b" stroke={INK} strokeWidth={2} />
      <path d="M3.2,1 A4.8,4.8 0 0 1 12.8,1 Z" fill={dk} stroke={INK} strokeWidth={1.8} />
    </g>
  );
  if (ty === 'ship') return (
    <g>
      <path d="M-30,0 L30,0 L22,11 L-24,11 Z" fill="#5d6773" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      <rect x={-14} y={-9} width={20} height={9} rx={2} fill={c} stroke={INK} strokeWidth={2.2} />
      <rect x={-6} y={-17} width={8} height={8} fill={dk} stroke={INK} strokeWidth={2} />
      <line x1={6 - recoil} y1={-5} x2={26 - recoil} y2={-8} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <path d="M-34,12 q8,-4 16,0 t16,0 t16,0 t16,0" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={2.4} />
    </g>
  );
  if (ty === 'longship') return (
    <g>
      <path d="M-32,2 Q0,14 32,2 L28,-4 Q34,-10 30,-16 L26,-4 Q0,4 -26,-4 L-30,-16 Q-34,-10 -28,-4 Z" fill="#8a5a2b" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
      <line x1={0} y1={-2} x2={0} y2={-34} stroke={INK} strokeWidth={3} />
      <rect x={-13} y={-32} width={26} height={20} fill={c} stroke={INK} strokeWidth={2} />
      <rect x={-13} y={-25} width={26} height={6} fill="#fff" opacity={0.8} />
      {[-18, -9, 0, 9, 18].map((x) => <circle key={x} cx={x} cy={0} r={3.2} fill={dk} stroke={INK} strokeWidth={1.2} />)}
      <path d="M-36,10 q8,-4 16,0 t16,0 t16,0 t16,0" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={2.4} />
    </g>
  );
  if (ty === 'knight') return (
    <g>
      <g transform={`rotate(${sw * 0.15})`}>
        <ellipse cx={0} cy={2} rx={15} ry={7} fill="#8b5a2b" stroke={INK} strokeWidth={2.2} />
        <path d="M12,-1 L20,-10 L25,-7 L18,3 Z" fill="#8b5a2b" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
        {[-10, -4, 5, 11].map((x, i) => <line key={x} x1={x} y1={7} x2={x + Math.sin(sw / 10 + i) * 3} y2={15} stroke={INK} strokeWidth={2.6} strokeLinecap="round" />)}
        <rect x={-7} y={-3} width={12} height={6} fill={c} stroke={INK} strokeWidth={1.6} />
      </g>
      <rect x={-5} y={-16} width={9} height={13} rx={3} fill={c} stroke={INK} strokeWidth={2} />
      <path d="M-5.5,-17 A5.5,5.5 0 0 1 5.5,-17 L5.5,-14 L-5.5,-14 Z" fill="#b8bec7" stroke={INK} strokeWidth={1.8} />
      <path d="M0,-22 q5,-5 9,-1" fill="none" stroke={c} strokeWidth={3} strokeLinecap="round" />
      <g transform={`rotate(${sw * 0.25})`}><line x1={2} y1={-10} x2={34} y2={-14} stroke="#6b411c" strokeWidth={2.6} strokeLinecap="round" /><polygon points="34,-17 40,-14 34,-11" fill="#cfd5dc" /></g>
    </g>
  );
  if (MELEE.has(ty)) return <g><Warrior x={-9} y={3} ty={ty} c={c} dk={dk} sw={sw} /><Warrior x={7} y={-1} ty={ty} c={c} dk={dk} sw={-sw * 0.8} /></g>;
  return <g><Soldier x={-12} y={2} c={c} dk={dk} /><Soldier x={0} y={6} c={c} dk={dk} /><Soldier x={10} y={0} c={c} dk={dk} /></g>;
};
const Blast: React.FC<{p: P; dt: number; r: number}> = ({p, dt, r}) => {
  if (dt < 0 || dt > 0.6) return null;
  const k = dt / 0.6;
  return (
    <g opacity={1 - k}>
      <circle cx={p[0]} cy={p[1] - dt * r} r={r * (0.6 + k * 1.2)} fill="#555" opacity={0.45} />
      <circle cx={p[0]} cy={p[1]} r={r * (0.4 + k * 0.7)} fill={ORANGE} stroke={INK} strokeWidth={r * 0.1} />
      <circle cx={p[0]} cy={p[1]} r={r * 0.3 * (1 - k)} fill="#ffe14d" />
    </g>
  );
};
const Clash: React.FC<{p: P; dt: number; s: number}> = ({p, dt, s}) => {
  if (dt < 0 || dt > 0.3) return null;
  const k = dt / 0.3;
  const pts = Array.from({length: 8}).map((_, i) => { const a = (i / 8) * Math.PI * 2, r = (i % 2 ? 7 : 16) * s * (0.6 + k); return `${p[0] + Math.cos(a) * r},${p[1] + Math.sin(a) * r}`; }).join(' ');
  return <g opacity={1 - k}><polygon points={pts} fill="#fff6b0" stroke={INK} strokeWidth={1.6 * s} /><text x={p[0]} y={p[1] - 18 * s} fontFamily="Lilita" fontSize={18 * s} fill="#fff" stroke={INK} strokeWidth={4 * s} paintOrder="stroke" textAnchor="middle">CLANG!</text></g>;
};
const Units: React.FC<{d: D; t: number; inv: number}> = ({d, t, inv: inv0}) => {
  const inv = inv0 * 1.6;
  const UN = d.T.units as U[];
  const act: {u: U; i: number}[] = [];
  UN.forEach((u, i) => { if (t >= u.t0 && t <= u.t1 + 0.3) act.push({u, i}); });
  const pos = new Map<number, P>();
  for (const {u, i} of act) pos.set(i, posAt(u, t));
  const sc = 1.15 * Math.max(0.9, inv);
  const fx: React.ReactNode[] = [];
  const bodies = act.map(({u, i}) => {
    const p = pos.get(i)!;
    let best: P | null = null, bd = 1e9;
    for (const {u: v, i: j} of act) if (v.f === u.f && v.r !== u.r && v.ty !== 'longship' && t <= v.t1) { const q = pos.get(j)!; const dd = Math.hypot(q[0] - p[0], q[1] - p[1]); if (dd < bd) { bd = dd; best = q; } }
    const moving = (u.ty === 'ship' || u.ty === 'longship') && t < u.k[1][0];
    const face = moving ? (u.k[1][1] >= u.k[0][1] ? 1 : -1) : best ? (best[0] >= p[0] ? 1 : -1) : (u.r === 'a' ? 1 : -1);
    const a = lerp(t, u.t0, u.t0 + 0.3, 0, 1) * lerp(t, u.t1, u.t1 + 0.3, 1, 0);
    const P0 = PER[u.ty] || 1, off = (i * 0.37) % P0, ph = (t + off) % P0;
    let recoil = 0, sw = 0;
    const engaged = best && t < u.t1 && !moving && bd < (MELEE.has(u.ty) ? 170 : 430);
    if (engaged && best) {
      const tip: P = [p[0] + face * (u.ty === 'tank' ? 26 : u.ty === 'sniper' ? 30 : u.ty === 'art' ? 22 : u.ty === 'ship' ? 28 : 16) * sc, p[1] + (u.ty === 'art' ? -13 : u.ty === 'tank' || u.ty === 'ship' ? -6 : -4) * sc];
      const tg: P = [best[0] + Math.sin(i * 7.1 + Math.floor((t + off) / P0)) * 10, best[1] + Math.cos(i * 3.3 + Math.floor((t + off) / P0)) * 8];
      if (MELEE.has(u.ty)) {
        sw = Math.sin((ph / P0) * Math.PI * 2) * 45;
        if (u.r === 'a') fx.push(<Clash key={`cl${i}`} p={[(p[0] + best[0]) / 2, (p[1] + best[1]) / 2 - 8]} dt={ph - P0 * 0.25} s={inv} />);
      } else if (u.ty === 'inf') {
        for (let b = 0; b < 3; b++) {
          const pb = ph - b * 0.07;
          if (pb >= 0 && pb < 0.16) {
            const f0 = pb / 0.16, f1 = Math.min(1, f0 + 0.25);
            fx.push(<line key={`tr${i}-${b}`} x1={tip[0] + (tg[0] - tip[0]) * f0} y1={tip[1] + (tg[1] - tip[1]) * f0} x2={tip[0] + (tg[0] - tip[0]) * f1} y2={tip[1] + (tg[1] - tip[1]) * f1} stroke="#ffe66b" strokeWidth={3 * inv} strokeLinecap="round" />);
            if (pb < 0.05) fx.push(<circle key={`mf${i}-${b}`} cx={tip[0]} cy={tip[1]} r={5 * inv} fill="#fff3a0" stroke={ORANGE} strokeWidth={1.5 * inv} />);
          }
        }
        if (ph > 0.15 && ph < 0.36) fx.push(<circle key={`hp${i}`} cx={tg[0]} cy={tg[1]} r={(4 + (ph - 0.15) * 30) * inv} fill="rgba(80,80,80,0.5)" />);
      } else if (u.ty === 'sniper') {
        if (ph < 0.18) { fx.push(<line key={`sn${i}`} x1={tip[0]} y1={tip[1]} x2={tg[0]} y2={tg[1]} stroke="#fff" strokeWidth={2.4 * inv} opacity={1 - ph / 0.18} />); recoil = 2; }
        if (ph < 0.06) fx.push(<circle key={`smf${i}`} cx={tip[0]} cy={tip[1]} r={8 * inv} fill="#fff3a0" stroke={ORANGE} strokeWidth={2 * inv} />);
        if (ph > 0.05 && ph < 0.4) fx.push(<g key={`sh${i}`}><circle cx={tg[0]} cy={tg[1]} r={(5 + ph * 30) * inv} fill="none" stroke="#fff" strokeWidth={2.5 * inv} opacity={1 - ph / 0.4} /><circle cx={tg[0]} cy={tg[1]} r={4 * inv} fill={RED} opacity={1 - ph / 0.4} /></g>);
      } else if (u.ty === 'tank') {
        if (ph < 0.25) { const f = ph / 0.25; fx.push(<circle key={`ts${i}`} cx={tip[0] + (tg[0] - tip[0]) * f} cy={tip[1] + (tg[1] - tip[1]) * f} r={4.5 * inv} fill="#ffe14d" stroke={INK} strokeWidth={1.5 * inv} />); recoil = 6 * (1 - f); }
        if (ph < 0.1) fx.push(<circle key={`tmf${i}`} cx={tip[0]} cy={tip[1]} r={(12 - ph * 50) * inv} fill="#fff3a0" stroke={ORANGE} strokeWidth={2 * inv} />);
        fx.push(<Blast key={`tb${i}`} p={tg} dt={ph - 0.25} r={14 * inv} />);
      } else if (u.ty === 'art' || u.ty === 'ship') {
        const fl = u.ty === 'ship' ? 0.6 : 0.8, hgt = u.ty === 'ship' ? 70 : 140;
        if (ph < fl) { const f = ph / fl; const x = tip[0] + (tg[0] - tip[0]) * f, y = tip[1] + (tg[1] - tip[1]) * f - Math.sin(Math.PI * f) * hgt * inv; fx.push(<circle key={`as${i}`} cx={x} cy={y} r={5 * inv} fill={INK} />); }
        if (ph < 0.12) { fx.push(<circle key={`amf${i}`} cx={tip[0]} cy={tip[1]} r={(14 - ph * 60) * inv} fill="#fff3a0" stroke={ORANGE} strokeWidth={2 * inv} />); recoil = 5; }
        fx.push(<Blast key={`ab${i}`} p={tg} dt={ph - fl} r={(u.ty === 'ship' ? 18 : 22) * inv} />);
      }
    }
    const bob = u.ty === 'inf' || MELEE.has(u.ty) ? Math.sin(t * 8 + i) * 1.2 : u.ty === 'ship' || u.ty === 'longship' ? Math.sin(t * 3 + i) * 1.5 : 0;
    const col = d.COLS[u.c], dk = d.DARKS[u.c];
    const naval = u.ty === 'ship' || u.ty === 'longship';
    return (
      <g key={i} opacity={a} transform={`translate(${p[0]},${p[1] + bob}) scale(${face * sc * (naval ? 1.15 : 1)},${sc * (naval ? 1.15 : 1)})`}>
        {!naval && <><ellipse cx={0} cy={12} rx={24} ry={6} fill="rgba(0,0,0,0.3)" /><ellipse cx={0} cy={12} rx={22} ry={5} fill="none" stroke={col} strokeWidth={3} /></>}
        <UnitIcon ty={u.ty} c={col} dk={dk} recoil={recoil} sw={sw} />
      </g>
    );
  });
  return <g>{bodies}{fx}</g>;
};
// separación de caras
const sep = (d: D, t: number, c0: (P | null)[]): (P | null)[] => {
  const c = c0.map((p) => (p ? [p[0], p[1]] as P : null));
  const r = c.map((_, k) => Math.max(56, Math.min(140, Math.sqrt(histAt(d, t)[k] || 0) * 4.2)) / 2 + 10);
  for (let it = 0; it < 4; it++) for (let a = 0; a < c.length; a++) for (let b = a + 1; b < c.length; b++) {
    const A = c[a], B = c[b];
    if (!A || !B) continue;
    const dx = B[0] - A[0], dy = B[1] - A[1], dd = Math.hypot(dx, dy) || 1, need = r[a] + r[b];
    if (dd < need) { const m = (need - dd) / 2, ux = dx / dd, uy = dy / dd; A[0] -= ux * m; A[1] -= uy * m; B[0] += ux * m; B[1] += uy * m; }
  }
  return c;
};
export const Faces: React.FC<{d: D; f: Frame}> = ({d, f}) => {
  const {t} = f;
  const cam = camAt(d, t);
  const cents = sep(d, t, f.cents);
  const big = d.NK > 4 ? 0.82 : 1;
  return (
    <>
      {cents.map((c, k) => {
        if (!c) return null;
        if (d.NK > 20 && (histAt(d, t)[k] || 0) < 60 && k > 1) return null;
        const [sx, sy] = toS(d, c, cam);
        const n = histAt(d, t)[k];
        const size = Math.max(56, Math.min(140, Math.sqrt(n) * 4.2)) * Math.sqrt(cam.s) * big * (d.T.fast ? 1.35 : 1);
        return <div key={k} style={{position: 'absolute', left: sx, top: sy, transform: 'translate(-50%,-50%)', zIndex: 4}}><Ball d={d} k={k} size={size} mood={moodOf(d, t, k)} t={t} id={`f${k}`} look={[Math.sin(t * 0.7 + k), 0]} /></div>;
      })}
    </>
  );
};
export const BubblesL: React.FC<{d: D; f: Frame}> = ({d, f}) => {
  const {t} = f;
  const cam = camAt(d, t);
  const cents = sep(d, t, f.cents);
  return (
    <>
      {(d.T.bubbles as [number, number, number, string][]).filter(([b0, b1]) => t >= b0 && t <= b1).map(([b0, b1, k, text]) => {
        const c = cents[k];
        if (!c) return null;
        const [sx, sy] = toS(d, c, cam);
        const r = Math.max(30, Math.min(75, Math.sqrt(histAt(d, t)[k]) * 2.2));
        const half = text.length * 13 + 40;
        return <Bubble key={b0} k={popT(t, b0, 10) * lerp(t, b1 - 0.25, b1, 1, 0)} sx={Math.max(half + 20, Math.min(W - half - 20, sx))} sy={Math.max(d.NK > 4 ? 520 : 480, sy - r - 14)} text={text} size={44} />;
      })}
    </>
  );
};
// ---------- HUD ----------
const fmtK = (n: number, mel: boolean) => (n >= 10000 ? `${Math.round(n / 1000)}K` : Math.round(n).toLocaleString('en-US')) + (mel ? ' warriors' : ' soldiers');
const teamAt = (d: D, t: number): number[] | null => {
  const tm = d.T.teams as [number, number[]][] | null;
  if (!tm) return null;
  let cur = tm[0][1];
  for (const [t0, v] of tm) if (t >= t0) cur = v;
  return cur;
};
const Hud: React.FC<{d: D; t: number}> = ({d, t}) => {
  const T = d.T;
  if (t < T.warStart - 0.2) return null;
  const k0 = popT(t, T.warStart - 0.2, 12);
  const days = Math.max(1, Math.round(lerp(t, T.warStart, T.winT, 1, T.extra?.days || 64, Easing.linear)));
  const eight = d.NK > 4;
  const mel = T.mode === 'melee';
  const tm = teamAt(d, t);
  const sold = idx(T.sold, t) as number[];
  const loss = idx(T.loss, t) as number;
  return (
    <div style={{position: 'absolute', top: eight ? 64 : 84, left: 20, right: 20, zIndex: 10, transform: `translateY(${(1 - k0) * -420}px)`}}>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: eight ? 8 : 12}}>
        {Array.from({length: d.NK}).map((_, k) => {
          const p = (histAt(d, t)[k] || 0) / d.N;
          const el = d.elimOf[k];
          const dead = isDead(d, k, t);
          return (
            <div key={k} style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(16,22,34,0.88)', border: `${eight ? 4 : 5}px solid ${dead ? '#777' : d.COLS[k]}`, borderRadius: eight ? 16 : 22, padding: eight ? '4px 10px' : '8px 14px', opacity: dead ? 0.72 : 1}}>
              <Ball d={d} k={k} size={eight ? 52 : 76} mood={moodOf(d, t, k)} t={t} id={`h${k}`} dead={dead} />
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                  <span style={{...font, fontSize: eight ? 25 : 31, color: dead ? '#aaa' : '#fff', textDecoration: dead ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden'}}>{d.NAMES[k]}</span>
                  <span style={{...font, fontSize: eight ? 26 : 33, color: dead ? '#aaa' : YELLOW}}>{dead && el ? `#${el[2]}` : `${Math.round(p * 100)}%`}</span>
                </div>
                <div style={{height: eight ? 12 : 17, borderRadius: 9, overflow: 'hidden', border: `${eight ? 3 : 4}px solid ${INK}`, background: '#3a3f4a', marginTop: 2}}>
                  <div style={{width: `${p * 100}%`, height: '100%', background: `repeating-linear-gradient(45deg, ${d.COLS[k]}, ${d.COLS[k]} 10px, ${d.DARKS[k]} 10px, ${d.DARKS[k]} 20px)`}} />
                </div>
                <div style={{...font, fontSize: eight ? 20 : 26, color: dead ? '#aaa' : '#fff', marginTop: 1, whiteSpace: 'nowrap'}}>{dead ? 'ELIMINATED' : `🪖 ${fmtK(sold[k], mel)}`}</div>
              </div>
              {tm && !dead && <div style={{position: 'absolute', top: -14, right: 10, background: T.extra.teamCols[tm[k]], border: '3px solid #fff', borderRadius: 10, padding: '1px 10px 0', ...font, fontSize: 20, color: '#fff'}}>{T.extra.teamNames[tm[k]]}</div>}
            </div>
          );
        })}
      </div>
      <div style={{display: 'flex', justifyContent: 'center', gap: 12, marginTop: eight ? 8 : 12}}>
        <div style={{background: INK, border: '4px solid #fff', borderRadius: 14, padding: '4px 20px 0', ...font, fontSize: 34, color: YELLOW}}>{mel ? 'DAY' : 'DAY'} {days}</div>
        <div style={{background: RED, border: '4px solid #fff', borderRadius: 14, padding: '4px 18px 0', ...font, fontSize: 32, color: '#fff'}}>💀 LOSSES {Math.round(loss).toLocaleString('en-US')}</div>
        <StormChip d={d} t={t} />
      </div>
    </div>
  );
};
const StormChip: React.FC<{d: D; t: number}> = ({d, t}) => {
  if (!d.T.storm) return null;
  const ph = d.T.stormPhases as number[][];
  const cur = ph.find((p) => t >= p[0] && t <= p[1]);
  const next = ph.find((p) => t < p[0] && p[0] - t <= 3.2);
  if (!cur && !next) return null;
  const txt = cur ? '⚡ CLOSING' : `⚡ STORM IN ${Math.ceil(next![0] - t)}`;
  return <div style={{background: '#5b2f9e', border: '4px solid #fff', borderRadius: 14, padding: '4px 16px 0', ...font, fontSize: 32, color: '#fff', transform: `scale(${1 + 0.06 * Math.sin(t * 10)})`}}>{txt}</div>;
};
export const Chip: React.FC<{d: D; t: number}> = ({d, t}) => {
  const c = (d.T.chips as [number, string, number][]).filter(([c0]) => t >= c0 && t < c0 + 2.3).pop();
  if (!c) return null;
  const [c0, text, k] = c;
  const kk = popT(t, c0, 12) * lerp(t, c0 + 2.0, c0 + 2.3, 1, 0);
  const long = text.length > 26;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1600, display: 'flex', justifyContent: 'center', zIndex: 12}}>
      <div style={{transform: `scale(${kk}) rotate(-2deg)`, display: 'flex', alignItems: 'center', gap: 12, background: d.COLS[k], border: `7px solid ${INK}`, borderRadius: 24, padding: '8px 24px 8px 10px', boxShadow: '0 10px 0 rgba(0,0,0,0.35)', maxWidth: 1040}}>
        <Ball d={d} k={k} size={70} mood="angry" t={t} id={`c${k}`} />
        <span style={{...font, fontSize: long ? 44 : 52, color: '#fff', textShadow: `3px 3px 0 ${INK}`, lineHeight: 1.05}}>{text}</span>
      </div>
    </div>
  );
};
export const Stamp: React.FC<{d: D; t: number}> = ({d, t}) => {
  const s = (d.T.stamps as [number, string, string][]).find(([s0]) => t >= s0 && t < s0 + (d.T.fast ? 1.3 : 1.8));
  if (!s) return null;
  const [s0, text, c] = s;
  const dt = t - s0;
  const k = dt < 0.25 ? lerp(dt, 0, 0.25, 2.3, 1, Easing.out(Easing.cubic)) : 1;
  const a = lerp(dt, 0, 0.08, 0, 1) * (d.T.fast ? lerp(dt, 1.05, 1.3, 1, 0) : lerp(dt, 1.5, 1.8, 1, 0));
  const col = c === 'red' ? RED : c === 'yellow' ? '#e09a00' : c === 'purple' ? '#6b2fb3' : GREEN;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 14}}>
      <div style={{transform: `scale(${k}) rotate(-6deg)`, opacity: a, border: `12px solid ${col}`, color: col, background: 'rgba(255,246,227,0.96)', borderRadius: 24, padding: '18px 30px 8px', ...font, fontSize: text.length > 24 ? 74 : 88, textAlign: 'center', lineHeight: 1, maxWidth: 960, boxShadow: '0 12px 0 rgba(0,0,0,0.3)'}}>{text}</div>
    </AbsoluteFill>
  );
};
// ---------- elige tu país ----------
const Choose: React.FC<{d: D; t: number}> = ({d, t}) => {
  const T = d.T;
  const ws = T.warStart;
  if (t > ws + 0.6) return null;
  const c0 = T.pre ? T.pre.t1 : 0;
  if (t < c0) return null;
  const tc = t - c0;
  const out = lerp(t, ws - 0.3, ws + 0.4, 0, 1, Easing.in(Easing.cubic));
  const cdT = ws - 3.2;
  const cd = t >= cdT && t < ws - 0.4 ? 3 - Math.floor((t - cdT) / 0.93) : null;
  const eight = d.NK > 4;
  const tm = teamAt(d, 0);
  const mel = T.mode === 'melee';
  return (
    <AbsoluteFill style={{zIndex: 20, background: `rgba(8,14,28,${0.74 * (1 - out)})`}}>
      <div style={{position: 'absolute', top: eight ? 90 : 150, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 1 - out, transform: `scale(${popT(tc, 0, 10)})`}}>
        <div style={{...font, fontSize: eight ? 96 : 112, color: '#fff', textShadow: `7px 7px 0 ${INK}, -3px -3px 0 ${INK}, 3px -3px 0 ${INK}, -3px 3px 0 ${INK}`, lineHeight: 1}}>{T.title}</div>
        <div style={{...font, fontSize: eight ? 128 : 150, color: YELLOW, textShadow: `8px 8px 0 ${INK}, -4px -4px 0 ${INK}, 4px -4px 0 ${INK}, -4px 4px 0 ${INK}`, lineHeight: 1}}>{T.title2}</div>
      </div>
      <div style={{position: 'absolute', top: eight ? 370 : 520, left: eight ? 30 : 40, right: eight ? 30 : 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: eight ? 30 : 30}}>
        {Array.from({length: d.NK}).map((_, k) => {
          const pk = popT(tc, 0.3 + k * (eight ? 0.12 : 0.22), 11);
          const dir = [k % 2 ? 1 : -1, k < d.NK / 2 ? -1 : 1];
          return (
            <div key={k} style={{position: 'relative', transform: `translate(${dir[0] * out * 700}px, ${dir[1] * out * 900}px) scale(${pk}) rotate(${(k % 2 ? 2 : -2) + Math.sin(t * 3 + k) * 1.5}deg)`, background: CREAM, border: `${eight ? 7 : 9}px solid ${INK}`, borderRadius: eight ? 26 : 34, padding: eight ? '18px 10px 18px 14px' : '22px 16px 18px', display: 'flex', flexDirection: eight ? 'row' : 'column', alignItems: 'center', gap: eight ? 12 : 0, boxShadow: `0 12px 0 rgba(0,0,0,0.45), inset 0 0 0 ${eight ? 6 : 8}px ${d.COLS[k]}`}}>
              <div style={{position: 'relative'}}>
                <Ball d={d} k={k} size={eight ? 150 : 230} mood={k === T.winner ? 'smug' : 'angry'} t={t} id={`ch${k}`} look={[dir[0] * -0.5, 0]} />
                <div style={{position: 'absolute', top: -12, left: -14, width: eight ? 50 : 70, height: eight ? 50 : 70, borderRadius: 35, background: INK, border: '5px solid #fff', ...font, fontSize: eight ? 32 : 46, color: YELLOW, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 5, boxSizing: 'border-box'}}>{k + 1}</div>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: eight ? 'flex-start' : 'center', minWidth: 0}}>
                <div style={{...font, fontSize: eight ? 42 : 58, color: d.COLS[k], textShadow: `3px 3px 0 ${INK}`, marginTop: eight ? 0 : 10, lineHeight: 1, whiteSpace: 'nowrap'}}>{d.NAMES[k]}</div>
                <div style={{...font2, fontSize: eight ? 27 : 33, color: INK, marginTop: 6, whiteSpace: 'nowrap'}}>🪖 {T.stats[k][0]} {mel ? 'warriors' : 'soldiers'}</div>
                <div style={{display: 'flex', alignItems: 'center', gap: 6, marginTop: 2}}><svg width={eight ? 52 : 70} height={eight ? 36 : 48} viewBox="-34 -26 68 46" style={{overflow: 'visible'}}><UnitIcon ty={T.stats[k][2]} c={d.COLS[k]} dk={d.DARKS[k]} /></svg><span style={{...font2, fontSize: eight ? 23 : 30, color: '#555', whiteSpace: 'nowrap'}}>{T.stats[k][1]}</span></div>
              </div>
              {tm && <div style={{position: 'absolute', bottom: -18, left: '50%', transform: 'translateX(-50%)', background: T.extra.teamCols[tm[k]], border: '4px solid #fff', borderRadius: 12, padding: '2px 14px 0', ...font, fontSize: 28, color: '#fff', whiteSpace: 'nowrap'}}>{T.extra.teamNames[tm[k]]}</div>}
            </div>
          );
        })}
      </div>
      {cd !== null && cd > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: eight ? 1630 : 1600, display: 'flex', justifyContent: 'center'}}>
          <div style={{width: 180, height: 180, borderRadius: 90, background: RED, border: `10px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: 124, color: '#fff', paddingTop: 12, boxSizing: 'border-box', transform: `scale(${1.25 - 0.25 * Math.min(1, ((t - cdT) % 0.93) / 0.25)})`, boxShadow: '0 10px 0 rgba(0,0,0,0.4)'}}>{cd}</div>
        </div>
      )}
      {t < cdT && <div style={{position: 'absolute', left: 0, right: 0, top: eight ? 1660 : 1640, display: 'flex', justifyContent: 'center', transform: `scale(${popT(tc, 1.2, 12)})`}}><div style={{background: '#fff', border: `7px solid ${INK}`, borderRadius: 24, padding: '10px 30px 2px', ...font, fontSize: 62, color: INK}}>Pick one & watch till the end!</div></div>}
      {t >= ws - 0.4 && <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}><div style={{transform: `scale(${popT(t, ws - 0.4, 9) * lerp(t, ws + 0.2, ws + 0.6, 1, 0)})`, ...font, fontSize: mel ? 230 : 280, color: RED, textShadow: `10px 10px 0 ${INK}, -5px -5px 0 ${INK}, 5px -5px 0 ${INK}, -5px 5px 0 ${INK}`}}>{mel ? 'FIGHT!' : 'WAR!'}</div></AbsoluteFill>}
    </AbsoluteFill>
  );
};
const PreIntro: React.FC<{d: D; t: number}> = ({d, t}) => {
  const pre = d.T.pre;
  if (!pre || t > pre.t1 + 0.2) return null;
  const k = popT(t, 0.15, 10) * lerp(t, pre.t1 - 0.3, pre.t1 + 0.2, 1, 0);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 180, display: 'flex', justifyContent: 'center', zIndex: 21}}>
      <div style={{transform: `scale(${k}) rotate(-3deg)`, background: '#fff', border: `11px solid ${INK}`, borderRadius: 34, padding: '18px 36px 8px', ...font, fontSize: 92, color: RED, textAlign: 'center', lineHeight: 1, maxWidth: 980, boxShadow: '0 12px 0 rgba(0,0,0,0.4)'}}>{pre.text}</div>
    </div>
  );
};
export const Twist: React.FC<{d: D; t: number}> = ({d, t}) => {
  const tw = d.T.twist as number | null;
  if (!tw || t < tw - 0.1 || t > tw + 0.7) return null;
  return <AbsoluteFill style={{background: '#fff', opacity: lerp(t, tw - 0.1, tw, 0, 0.6) * lerp(t, tw, tw + 0.7, 1, 0), zIndex: 13}} />;
};
const ORD = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
const Winner: React.FC<{d: D; t: number}> = ({d, t}) => {
  const T = d.T;
  const w0 = T.winT as number;
  if (t < w0) return null;
  const k = popT(t, w0, 10);
  const wk = T.winner as number;
  const rank = T.rank as number[];
  const eight = d.NK > 4;
  return (
    <AbsoluteFill style={{zIndex: 18, alignItems: 'center', justifyContent: 'center', background: `rgba(8,14,28,${0.62 * k})`}}>
      <div style={{transform: `scale(${k})`, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -80}}>
        <div style={{fontSize: 160, marginBottom: -62, zIndex: 2, transform: `rotate(${Math.sin(t * 4) * 6}deg)`}}>👑</div>
        <Ball d={d} k={wk} size={eight ? 300 : 340} mood="happy" t={t} id="win" />
        <div style={{marginTop: 18, background: d.COLS[wk], border: `10px solid ${INK}`, borderRadius: 30, padding: '12px 36px 2px', ...font, fontSize: d.NAMES[wk].length > 9 ? 84 : 100, color: '#fff', textShadow: `5px 5px 0 ${INK}`, boxShadow: '0 12px 0 rgba(0,0,0,0.4)', whiteSpace: 'nowrap'}}>{d.NAMES[wk]} WIN{d.NAMES[wk].endsWith('S') && !d.NAMES[wk].startsWith('THE') ? '' : 'S'}!</div>
        <div style={{marginTop: 22, display: 'grid', gridTemplateColumns: eight ? '1fr 1fr' : '1fr 1fr 1fr', gap: 10, transform: `scale(${popT(t, w0 + 0.6, 12)})`}}>
          {rank.slice(1).map((c, i) => (
            <div key={c} style={{display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.95)', border: `5px solid ${INK}`, borderRadius: 16, padding: '4px 12px 4px 6px'}}>
              <span style={{...font, fontSize: 30, color: '#777', width: 50}}>{ORD[i + 1]}</span>
              <Ball d={d} k={c} size={44} mood="sad" t={t} id={`rk${c}`} />
              <span style={{...font, fontSize: 28, color: d.COLS[c], textShadow: `2px 2px 0 ${INK}`, whiteSpace: 'nowrap'}}>{d.NAMES[c]}</span>
            </div>
          ))}
        </div>
        <div style={{marginTop: 26, transform: `scale(${popT(t, w0 + 1.1, 11)}) rotate(-2deg)`, background: '#fff', border: `8px solid ${INK}`, borderRadius: 28, padding: '12px 34px 4px', ...font, fontSize: 64, color: INK, textAlign: 'center', lineHeight: 1.05}}>Did <span style={{color: RED}}>YOUR</span> {T.title2.toLowerCase()} win?<br /><span style={{fontSize: 50, color: '#555'}}>Comment your pick 👇</span></div>
      </div>
    </AbsoluteFill>
  );
};
export const Ocean: React.FC<{t: number}> = ({t}) => (
  <svg width={W} height={H} style={{position: 'absolute'}}>
    <defs>
      <radialGradient id="seaG" cx="50%" cy="52%" r="75%"><stop offset="0%" stopColor="#3f97d6" /><stop offset="100%" stopColor="#164f86" /></radialGradient>
      <pattern id="wavesG" width={140} height={46} patternUnits="userSpaceOnUse" patternTransform={`translate(${(t * 12) % 140},0)`}><path d="M0,23 C17,13 35,13 52,23 S87,33 105,23 S122,13 140,23" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={3} /></pattern>
    </defs>
    <rect width={W} height={H} fill="url(#seaG)" /><rect width={W} height={H} fill="url(#wavesG)" />
  </svg>
);
export const MiniWarG: React.FC<{id: string; audio?: boolean}> = ({id, audio = true}) => {
  const d = get(id);
  const t = useCurrentFrame() / 30;
  const f = frameState(d, t);
  const T = d.T;
  return (
    <AbsoluteFill style={{background: '#164f86', overflow: 'hidden'}}>
      <Ocean t={t} />
      <MapLayer d={d} f={f} />
      <AbsoluteFill style={{background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0) 16%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.3))'}} />
      {t > T.warStart && t < T.winT && <Faces d={d} f={f} />}
      {t > T.warStart && t < T.winT && <BubblesL d={d} f={f} />}
      <Hud d={d} t={t} />
      {t < T.winT && <Chip d={d} t={t} />}
      <Stamp d={d} t={t} />
      <Twist d={d} t={t} />
      <PreIntro d={d} t={t} />
      <Choose d={d} t={t} />
      <Winner d={d} t={t} />
      {audio && <Audio src={staticFile(`mw-${id}.wav`)} />}
    </AbsoluteFill>
  );
};
const THUMB: Record<string, string> = {k8: '8 KINGDOMS, 1 WINNER', ring: '8 NATIONS, 1 SEA', island: 'WHO WINS? 🤔', bridge: 'WHO WINS? 🤔', alliance: 'WHO BETRAYS WHO? 🤔', civil: 'WHO TAKES THE EMPIRE?', warriors: 'WHO WINS? ⚔️', storm: 'THE STORM IS COMING ⚡'};
export const MiniThumbG: React.FC<{id: string}> = ({id}) => {
  const d = get(id);
  const T = d.T;
  const tc = (T.pre ? T.pre.t1 : 0) + 2.3;
  const eight = d.NK > 4;
  return (
    <AbsoluteFill style={{background: '#164f86', overflow: 'hidden'}}>
      <Ocean t={0} /><MapLayer d={d} f={frameState(d, T.warStart + 14)} />
      <Choose d={d} t={Math.min(tc, T.warStart - 3.3)} />
      <AbsoluteFill style={{top: 1540, zIndex: 25, background: 'linear-gradient(rgba(8,14,28,0), rgba(8,14,28,0.92) 30%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: eight ? 1640 : 1610, display: 'flex', justifyContent: 'center', zIndex: 30}}>
        <div style={{transform: 'rotate(-3deg)', background: RED, border: `10px solid ${INK}`, borderRadius: 30, padding: '12px 40px 2px', ...font, fontSize: (THUMB[id] || '').length > 16 ? 70 : 92, color: '#fff', textShadow: `5px 5px 0 ${INK}`, boxShadow: '0 12px 0 rgba(0,0,0,0.45)', whiteSpace: 'nowrap'}}>{THUMB[id] || 'WHO WINS? 🤔'}</div>
      </div>
    </AbsoluteFill>
  );
};
