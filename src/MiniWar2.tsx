import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Easing, staticFile, useCurrentFrame} from 'remotion';
import M from './mini2.json';
import {INK, CREAM, RED, YELLOW, GREEN, ORANGE, clamp, lerp, font, font2, popT, Face, Bubble, Boom, arcPath, partial, Mood, P} from './lib3';

const T = M as any;
const W = 1080, H = 1920;
const R: number = T.R;
const CELLS: P[] = T.cells;
const NB: number[][] = T.nb;
const NAMES: string[] = T.names, COLS: string[] = T.cols, DARKS: string[] = T.darks;
const N: number = T.N;
const DUR: number = T.duration;
const HIST: number[][] = T.hist;
// historial de dueños por celda
const HISTC: [number, number][][] = (() => {
  const h: [number, number][][] = T.own.map((o: number) => [[-1, o]]);
  for (const [t, i, a] of T.ev as [number, number, number][]) h[i].push([t, a]);
  return h;
})();
const ownerAt = (i: number, t: number): [number, number] => {
  const h = HISTC[i];
  let k = 0;
  while (k + 1 < h.length && h[k + 1][0] <= t) k++;
  return [h[k][1], h[k][0]];
};
const hexD = (x: number, y: number, r = R + 0.6) => {
  let s = '';
  for (let k = 0; k < 6; k++) {
    const a = (Math.PI / 180) * (60 * k - 90);
    s += `${k ? 'L' : 'M'}${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`;
  }
  return s + 'Z';
};
const HEX = CELLS.map(([x, y]) => hexD(x, y));
const edge = (a: P, b: P) => {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
  const px = (-dy / l) * (R / 2), py = (dx / l) * (R / 2);
  return `M${(mx + px).toFixed(1)},${(my + py).toFixed(1)}L${(mx - px).toFixed(1)},${(my - py).toFixed(1)}`;
};
const DX = Math.sqrt(3) * R, DY = 1.5 * R;
const DIRS: P[] = [[DX, 0], [-DX, 0], [DX / 2, DY], [-DX / 2, DY], [DX / 2, -DY], [-DX / 2, -DY]];
const COAST = (() => {
  let s = '';
  CELLS.forEach(([x, y], i) => {
    for (const [dx, dy] of DIRS) {
      const has = NB[i].some((j) => Math.abs(CELLS[j][0] - x - dx) < 2 && Math.abs(CELLS[j][1] - y - dy) < 2);
      if (!has) s += edge([x, y], [x + dx, y + dy]);
    }
  });
  return s;
})();
// montañas (territorio original de Thornwick) y bosques
const MOUNT: P[] = CELLS.filter((_, i) => T.own[i] === 3 && i % 23 === 0);
const TREES: P[] = CELLS.filter((_, i) => T.own[i] !== 3 && i % 41 === 7);
const mix = (a: string, b: string, k: number) => {
  const pa = [1, 3, 5].map((j) => parseInt(a.slice(j, j + 2), 16)), pb = [1, 3, 5].map((j) => parseInt(b.slice(j, j + 2), 16));
  return '#' + pa.map((v, j) => Math.round(v + (pb[j] - v) * k).toString(16).padStart(2, '0')).join('');
};

// ---------- banderas inventadas ----------
const KFlag: React.FC<{k: number; w: number; h: number}> = ({k, w, h}) => {
  if (k === 0) return <><rect width={w} height={h} fill="#2f6fd6" /><rect y={h * 0.38} width={w} height={h * 0.24} fill="#fff" /><polygon points={star(w * 0.5, h * 0.5, h * 0.2)} fill="#ffd23f" stroke={INK} strokeWidth={h * 0.02} /></>;
  if (k === 1) return <><rect width={w} height={h} fill="#d9362c" /><polygon points={`0,${h} ${w * 0.45},0 ${w * 0.62},0 ${w * 0.17},${h}`} fill="#1d1d1d" /><circle cx={w * 0.72} cy={h * 0.5} r={h * 0.2} fill="#ffd23f" /></>;
  if (k === 2) return <><rect width={w} height={h} fill="#f1b51f" /><circle cx={w * 0.5} cy={h * 0.5} r={h * 0.26} fill="#ff7a1a" />{Array.from({length: 8}).map((_, i) => { const a = (i / 8) * Math.PI * 2; return <line key={i} x1={w * 0.5 + Math.cos(a) * h * 0.32} y1={h * 0.5 + Math.sin(a) * h * 0.32} x2={w * 0.5 + Math.cos(a) * h * 0.44} y2={h * 0.5 + Math.sin(a) * h * 0.44} stroke="#ff7a1a" strokeWidth={h * 0.06} strokeLinecap="round" />; })}</>;
  return <><rect width={w} height={h} fill="#2aa356" /><polygon points={`${w * 0.5},${h * 0.16} ${w * 0.7},${h * 0.62} ${w * 0.3},${h * 0.62}`} fill="#fff" /><polygon points={`${w * 0.5},${h * 0.34} ${w * 0.76},${h * 0.84} ${w * 0.24},${h * 0.84}`} fill="#fff" /><rect x={w * 0.46} y={h * 0.82} width={w * 0.08} height={h * 0.1} fill="#fff" /></>;
};
const star = (cx: number, cy: number, r: number) => Array.from({length: 10}).map((_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; return `${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`; }).join(' ');
const Ball: React.FC<{k: number; size: number; mood: Mood; t: number; look?: P; id: string; dead?: boolean}> = ({k, size, mood, t, look, id, dead}) => (
  <svg width={size} height={size} viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} style={{overflow: 'visible', display: 'block', filter: dead ? 'grayscale(0.85) brightness(0.8)' : 'none'}}>
    <defs><clipPath id={`kb-${id}`}><circle r={size / 2 - 3} /></clipPath></defs>
    <circle r={size / 2} fill={INK} transform="translate(0,5)" opacity={0.35} />
    <g clipPath={`url(#kb-${id})`}><g transform={`translate(${-size * 0.75},${-size / 2})`}><KFlag k={k} w={size * 1.5} h={size} /></g></g>
    <circle r={size / 2 - 3} fill="none" stroke={INK} strokeWidth={Math.max(4, size * 0.05)} />
    <Face x={0} y={-size * 0.04} r={size * 0.3} mood={dead ? 'shocked' : mood} t={t} seed={k * 3 + 1} look={look} />
    {dead && <g><path d={`M${-size * 0.3},${-size * 0.3} L${size * 0.3},${size * 0.3} M${size * 0.3},${-size * 0.3} L${-size * 0.3},${size * 0.3}`} stroke={INK} strokeWidth={size * 0.16} strokeLinecap="round" /><path d={`M${-size * 0.3},${-size * 0.3} L${size * 0.3},${size * 0.3} M${size * 0.3},${-size * 0.3} L${-size * 0.3},${size * 0.3}`} stroke={RED} strokeWidth={size * 0.09} strokeLinecap="round" /></g>}
  </svg>
);
const soldAt = (t: number, k: number) => (T.sold as number[][])[Math.max(0, Math.min(T.sold.length - 1, Math.floor(t * 10)))][k];
const lossAt = (t: number) => (T.loss as number[])[Math.max(0, Math.min(T.loss.length - 1, Math.floor(t * 10)))];
const fmtK = (n: number) => `${Math.round(n / 1000)}K soldiers`;
const fmtN = (n: number) => Math.round(n).toLocaleString('en-US');
const histAt = (t: number) => HIST[Math.max(0, Math.min(HIST.length - 1, Math.floor(t * 10)))];
const pctAt = (t: number, k: number) => histAt(t)[k] / N;
const moodOf = (t: number, k: number): Mood => {
  if (t < T.warStart) return 'angry';
  const d = histAt(t)[k] - histAt(t - 1.5)[k];
  if (t > T.winT && k === T.winner) return 'happy';
  if (d > 8) return 'smug';
  if (d < -8) return 'scared';
  return 'angry';
};
// ---------- cámara ----------
const camAt = (t: number) => {
  const K = T.cam as number[][];
  let i = 0;
  while (i < K.length - 1 && t >= K[i + 1][0]) i++;
  const [ta, xb, yb, sb] = K[i];
  const [, xa, ya, sa] = K[Math.max(0, i - 1)];
  const k = i === 0 ? 1 : lerp(t, ta, ta + 0.9, 0, 1, Easing.inOut(Easing.cubic));
  let cx = xa + (xb - xa) * k, cy = ya + (yb - ya) * k;
  const s = sa + (sb - sa) * k;
  for (const [st] of T.stamps as [number][]) { const d = t - st; if (d >= 0 && d < 0.35) { const a = (1 - d / 0.35) * 9; cx += Math.sin(d * 90) * a; cy += Math.cos(d * 70) * a; } }
  return {cx, cy, s};
};
const MAPY = 1030;
const toS = (p: P, c: {cx: number; cy: number; s: number}): P => [540 + (p[0] - c.cx) * c.s, MAPY + (p[1] - c.cy) * c.s];

// ---------- mapa ----------
const MapLayer: React.FC<{t: number}> = ({t}) => {
  const cam = camAt(t);
  const own = new Array(N);
  const paths = ['', '', '', ''];
  const flash: React.ReactNode[] = [];
  for (let i = 0; i < N; i++) {
    const [o, t0] = ownerAt(i, t);
    own[i] = o;
    const dt = t - t0;
    if (t0 >= 0 && dt < 0.35) {
      const prev = ownerAt(i, t0 - 0.001)[0];
      flash.push(<path key={i} d={HEX[i]} fill={dt < 0.08 ? '#fff' : mix(COLS[prev], COLS[o], Math.min(1, (dt - 0.08) / 0.27))} />);
    } else paths[o] += HEX[i];
  }
  let borders = '';
  for (let i = 0; i < N; i++) for (const j of NB[i]) if (j > i && own[j] !== own[i]) borders += edge(CELLS[i], CELLS[j]);
  const inv = 1 / cam.s;
  return (
    <svg width={W} height={H} style={{position: 'absolute'}}>
      <g transform={`translate(540,${MAPY}) scale(${cam.s}) translate(${-cam.cx},${-cam.cy})`}>
        <path d={COAST} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={22} strokeLinecap="round" />
        <path d={COAST} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={10} strokeLinecap="round" />
        {paths.map((d, k) => <path key={k} d={d} fill={COLS[k]} />)}
        {flash}
        {paths.map((d, k) => <path key={`h${k}`} d={d} fill="url(#hexTex)" opacity={0.5} />)}
        {MOUNT.map(([x, y], i) => <path key={`m${i}`} d={`M${x - 16},${y + 9} L${x - 3},${y - 13} L${x + 4},${y - 3} L${x + 9},${y - 9} L${x + 20},${y + 9} Z`} fill="rgba(0,0,0,0.18)" stroke="rgba(0,0,0,0.35)" strokeWidth={2} strokeLinejoin="round" />)}
        {TREES.map(([x, y], i) => <g key={`tr${i}`} opacity={0.3}><circle cx={x - 5} cy={y} r={6} fill="#000" /><circle cx={x + 5} cy={y + 2} r={5} fill="#000" /></g>)}
        <path d={borders} fill="none" stroke={INK} strokeWidth={3.2} strokeLinecap="round" />
        <path d={COAST} fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
        {(T.arrows as any[]).map(([t0, t1, k, a, b], i) => <Arrow key={i} t={t} t0={t0} t1={t1} k={k} a={a} b={b} inv={inv} />)}
        <Units t={t} inv={inv} />
        {(T.booms as [number, number, number][]).filter(([bt]) => t >= bt && t < bt + 1.6).map(([bt, x, y], i) => <Boom key={i} p={[x, y]} t={t} at={bt} r={20 * inv} />)}
      </g>
    </svg>
  );
};

// ---------- unidades militares ----------
type U = {c: number; ty: string; f: number; r: string; k: [number, number, number][]; t0: number; t1: number};
const UN = T.units as U[];
const posAt = (u: U, t: number): P => {
  const k = u.k;
  if (t <= k[0][0]) return [k[0][1], k[0][2]];
  if (t >= k[k.length - 1][0]) return [k[k.length - 1][1], k[k.length - 1][2]];
  let i = Math.min(k.length - 2, Math.max(0, Math.floor((t - k[0][0]) / 0.2)));
  while (i > 0 && k[i][0] > t) i--;
  while (i < k.length - 2 && k[i + 1][0] < t) i++;
  const a = k[i], b = k[i + 1], f = Math.max(0, Math.min(1, (t - a[0]) / (b[0] - a[0] || 1)));
  return [a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
};
const PER: Record<string, number> = {inf: 0.62, sniper: 1.9, tank: 1.45, art: 2.3};
const Soldier: React.FC<{x: number; y: number; c: number; aim?: number}> = ({x, y, c, aim = 0}) => (
  <g transform={`translate(${x},${y})`}>
    <line x1={2} y1={-3} x2={15} y2={-6 + aim} stroke={INK} strokeWidth={3} strokeLinecap="round" />
    <rect x={-5} y={-6} width={10} height={14} rx={4} fill={COLS[c]} stroke={INK} strokeWidth={2.2} />
    <circle cx={0} cy={-10} r={4.6} fill="#f2c79b" stroke={INK} strokeWidth={2} />
    <path d="M-5.6,-10 A5.8,5.8 0 0 1 5.6,-10 Z" fill={DARKS[c]} stroke={INK} strokeWidth={2} />
  </g>
);
const UnitIcon: React.FC<{ty: string; c: number; recoil?: number}> = ({ty, c, recoil = 0}) => {
  if (ty === 'tank') return (
    <g>
      <rect x={-22} y={2} width={44} height={11} rx={5} fill="#3a3a3a" stroke={INK} strokeWidth={2.5} />
      {[-15, -5, 5, 15].map((x) => <circle key={x} cx={x} cy={7.5} r={3} fill="#777" />)}
      <rect x={-20} y={-7} width={38} height={11} rx={4} fill={COLS[c]} stroke={INK} strokeWidth={2.5} />
      <rect x={-6 - recoil} y={-3.5} width={30} height={4.5} rx={2} fill={DARKS[c]} stroke={INK} strokeWidth={2} />
      <rect x={-12} y={-15} width={18} height={11} rx={5} fill={DARKS[c]} stroke={INK} strokeWidth={2.5} />
    </g>
  );
  if (ty === 'art') return (
    <g>
      <line x1={-4} y1={2} x2={20 - recoil} y2={-12 + recoil * 0.5} stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <line x1={-4} y1={2} x2={20 - recoil} y2={-12 + recoil * 0.5} stroke={DARKS[c]} strokeWidth={5} strokeLinecap="round" />
      <path d="M-16,10 L4,0 L10,10" fill="none" stroke={INK} strokeWidth={3} />
      <circle cx={-2} cy={8} r={7} fill={COLS[c]} stroke={INK} strokeWidth={2.5} /><circle cx={-2} cy={8} r={2} fill={INK} />
      <Soldier x={-16} y={4} c={c} />
    </g>
  );
  if (ty === 'sniper') return (
    <g>
      {[-14, -7, 0, 7].map((x, i) => <circle key={i} cx={x} cy={4 - (i % 2) * 2} r={4} fill={i % 2 ? '#4f6b2a' : '#6d8a3a'} />)}
      <ellipse cx={-4} cy={5} rx={13} ry={4.5} fill={COLS[c]} stroke={INK} strokeWidth={2.2} />
      <line x1={4} y1={2} x2={28} y2={1} stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
      <rect x={10} y={-2.5} width={7} height={3} fill={INK} />
      <circle cx={8} cy={1} r={4.4} fill="#f2c79b" stroke={INK} strokeWidth={2} />
      <path d="M3.2,1 A4.8,4.8 0 0 1 12.8,1 Z" fill={DARKS[c]} stroke={INK} strokeWidth={1.8} />
    </g>
  );
  return <g><Soldier x={-12} y={2} c={c} /><Soldier x={0} y={6} c={c} /><Soldier x={10} y={0} c={c} /></g>;
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
const Units: React.FC<{t: number; inv: number}> = ({t, inv: inv0}) => {
  const inv = inv0 * 1.6;
  const act = UN.map((u, i) => ({u, i})).filter(({u}) => t >= u.t0 && t <= u.t1 + 0.3);
  const pos = new Map<number, P>();
  for (const {u, i} of act) pos.set(i, posAt(u, t));
  const sc = 1.15 * Math.max(0.9, inv);
  const fx: React.ReactNode[] = [];
  const bodies = act.map(({u, i}) => {
    const p = pos.get(i)!;
    let best: P | null = null, bd = 1e9;
    for (const {u: v, i: j} of act) if (v.f === u.f && v.r !== u.r && t <= v.t1) { const q = pos.get(j)!; const d = Math.hypot(q[0] - p[0], q[1] - p[1]); if (d < bd) { bd = d; best = q; } }
    const face = best ? (best[0] >= p[0] ? 1 : -1) : (u.r === 'a' ? 1 : -1);
    const a = lerp(t, u.t0, u.t0 + 0.3, 0, 1) * lerp(t, u.t1, u.t1 + 0.3, 1, 0);
    const P0 = PER[u.ty], off = (i * 0.37) % P0, ph = (t + off) % P0;
    let recoil = 0;
    if (best && t < u.t1 && bd < 420) {
      const tip: P = [p[0] + face * (u.ty === 'tank' ? 26 : u.ty === 'sniper' ? 30 : u.ty === 'art' ? 22 : 16) * sc, p[1] + (u.ty === 'art' ? -13 : u.ty === 'tank' ? -1 : -4) * sc];
      const tg: P = [best[0] + Math.sin(i * 7.1 + Math.floor((t + off) / P0)) * 10, best[1] + Math.cos(i * 3.3 + Math.floor((t + off) / P0)) * 8];
      if (u.ty === 'inf') {
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
      } else if (u.ty === 'art') {
        const fl = 0.8;
        if (ph < fl) { const f = ph / fl; const x = tip[0] + (tg[0] - tip[0]) * f, y = tip[1] + (tg[1] - tip[1]) * f - Math.sin(Math.PI * f) * 140 * inv; fx.push(<circle key={`as${i}`} cx={x} cy={y} r={5 * inv} fill={INK} />); fx.push(<circle key={`ast${i}`} cx={x - 6 * inv} cy={y + 3 * inv} r={3 * inv} fill="rgba(255,255,255,0.6)" />); }
        if (ph < 0.12) { fx.push(<circle key={`amf${i}`} cx={tip[0]} cy={tip[1]} r={(14 - ph * 60) * inv} fill="#fff3a0" stroke={ORANGE} strokeWidth={2 * inv} />); recoil = 5; }
        fx.push(<Blast key={`ab${i}`} p={tg} dt={ph - fl} r={22 * inv} />);
      }
    }
    const bob = u.ty === 'inf' ? Math.sin(t * 8 + i) * 1.2 : 0;
    return (
      <g key={i} opacity={a} transform={`translate(${p[0]},${p[1] + bob}) scale(${face * sc},${sc})`}>
        <ellipse cx={0} cy={12} rx={24} ry={6} fill="rgba(0,0,0,0.3)" />
        <ellipse cx={0} cy={12} rx={22} ry={5} fill="none" stroke={COLS[u.c]} strokeWidth={3} />
        <UnitIcon ty={u.ty} c={u.c} recoil={recoil} />
      </g>
    );
  });
  return <g>{bodies}{fx}</g>;
};

const Arrow: React.FC<{t: number; t0: number; t1: number; k: number; a: P; b: P; inv: number}> = ({t, t0, t1, k, a, b, inv}) => {
  if (t < t0 || t > t1 + 0.6) return null;
  const pts = arcPath(a, b, 60, 20);
  const p = lerp(t, t0, t0 + 1.2, 0, 1, Easing.out(Easing.cubic));
  const fade = lerp(t, t1, t1 + 0.6, 1, 0);
  const {pts: q, tip, ang} = partial(pts, p);
  if (q.length < 2) return null;
  const w = 15 * inv, hl = w * 2.3, hw = w * 1.9;
  const dd = 'M' + q.map((v) => `${v[0].toFixed(1)},${v[1].toFixed(1)}`).join(' L');
  const head = `M${tip[0] + Math.cos(ang) * hl * 0.7},${tip[1] + Math.sin(ang) * hl * 0.7} L${tip[0] + Math.cos(ang + 2.4) * hw},${tip[1] + Math.sin(ang + 2.4) * hw} L${tip[0] + Math.cos(ang - 2.4) * hw},${tip[1] + Math.sin(ang - 2.4) * hw} Z`;
  const pulse = 1 + 0.06 * Math.sin(t * 9);
  return (
    <g opacity={fade}>
      <path d={dd} fill="none" stroke={INK} strokeWidth={w * 1.7 * pulse} strokeLinecap="round" />
      <path d={head} fill={INK} stroke={INK} strokeWidth={w * 0.7} strokeLinejoin="round" />
      <path d={dd} fill="none" stroke={COLS[k]} strokeWidth={w * pulse} strokeLinecap="round" strokeDasharray={`${w * 2} ${w * 0.8}`} strokeDashoffset={-t * 60 * inv} />
      <path d={head} fill={COLS[k]} />
    </g>
  );
};
// separa las caras que se solapan
const sep = (t: number, c0: (P | null)[]): (P | null)[] => {
  const c = c0.map((p) => (p ? [p[0], p[1]] as P : null));
  const r = [0, 1, 2, 3].map((k) => Math.max(70, Math.min(190, Math.sqrt(histAt(t)[k]) * 5.6)) / 2 + 12);
  for (let it = 0; it < 4; it++) for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) {
    const A = c[a], B = c[b];
    if (!A || !B) continue;
    const dx = B[0] - A[0], dy = B[1] - A[1], d = Math.hypot(dx, dy) || 1, need = r[a] + r[b];
    if (d < need) { const m = (need - d) / 2, ux = dx / d, uy = dy / d; A[0] -= ux * m; A[1] -= uy * m; B[0] += ux * m; B[1] += uy * m; }
  }
  return c;
};
// caras sobre el territorio
const centroid = (t: number, k: number): P | null => {
  let sx = 0, sy = 0, n = 0;
  for (let i = 0; i < N; i++) if (ownerAt(i, t)[0] === k) { sx += CELLS[i][0]; sy += CELLS[i][1]; n++; }
  return n ? [sx / n, sy / n] : null;
};
const Faces: React.FC<{t: number; cents: (P | null)[]}> = ({t, cents: c0}) => {
  const cam = camAt(t);
  const cents = sep(t, c0);
  return (
    <>
      {[0, 1, 2, 3].map((k) => {
        const c = cents[k];
        const el = (T.elim as number[][]).find((e) => e[1] === k);
        if (!c) {
          if (!el || t > el[0] + 0.8) return null;
        }
        const pos = c || centroid(el![0] - 0.05, k);
        if (!pos) return null;
        const [sx, sy] = toS(pos, cam);
        const n = histAt(t)[k];
        const dying = el && t >= el[0];
        const size = dying ? 120 * lerp(t, el![0], el![0] + 0.8, 1, 0) : Math.max(64, Math.min(150, Math.sqrt(n) * 4.6)) * Math.sqrt(cam.s);
        if (size < 4) return null;
        return <div key={k} style={{position: 'absolute', left: sx, top: sy, transform: 'translate(-50%,-50%)', zIndex: 4}}><Ball k={k} size={size} mood={moodOf(t, k)} t={t} id={`f${k}`} dead={!!dying} look={[Math.sin(t * 0.7 + k), 0]} /></div>;
      })}
    </>
  );
};
const BubblesL: React.FC<{t: number; cents: (P | null)[]}> = ({t, cents: c0}) => {
  const cam = camAt(t);
  const cents = sep(t, c0);
  return (
    <>
      {(T.bubbles as [number, number, number, string][]).filter(([b0, b1]) => t >= b0 && t <= b1).map(([b0, b1, k, text]) => {
        const c = cents[k];
        if (!c) return null;
        const [sx, sy] = toS(c, cam);
        const n = histAt(t)[k];
        const r = Math.max(35, Math.min(95, Math.sqrt(n) * 2.8));
        const half = text.length * 13 + 40;
        return <Bubble key={b0} k={popT(t, b0, 10) * lerp(t, b1 - 0.25, b1, 1, 0)} sx={Math.max(half + 20, Math.min(W - half - 20, sx))} sy={Math.max(560, sy - r - 14)} text={text} size={44} />;
      })}
    </>
  );
};
// ---------- HUD ----------
const Hud: React.FC<{t: number}> = ({t}) => {
  if (t < T.warStart - 0.2) return null;
  const k0 = popT(t, T.warStart - 0.2, 12);
  const days = Math.max(1, Math.round(lerp(t, T.warStart, T.winT, 1, 64, Easing.linear)));
  return (
    <div style={{position: 'absolute', top: 90, left: 24, right: 24, zIndex: 10, transform: `translateY(${(1 - k0) * -360}px)`}}>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
        {[0, 1, 2, 3].map((k) => {
          const p = pctAt(t, k);
          const el = (T.elim as number[][]).find((e) => e[1] === k);
          const dead = el && t >= el[0];
          return (
            <div key={k} style={{display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(16,22,34,0.88)', border: `5px solid ${dead ? '#777' : COLS[k]}`, borderRadius: 22, padding: '8px 14px', opacity: dead ? 0.7 : 1}}>
              <Ball k={k} size={78} mood={moodOf(t, k)} t={t} id={`h${k}`} dead={!!dead} />
              <div style={{flex: 1}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                  <span style={{...font, fontSize: 32, color: dead ? '#aaa' : '#fff', textDecoration: dead ? 'line-through' : 'none'}}>{NAMES[k]}</span>
                  <span style={{...font, fontSize: 34, color: dead ? '#aaa' : YELLOW}}>{Math.round(p * 100)}%</span>
                </div>
                <div style={{height: 18, borderRadius: 9, overflow: 'hidden', border: `4px solid ${INK}`, background: '#3a3f4a', marginTop: 3}}>
                  <div style={{width: `${p * 100}%`, height: '100%', background: `repeating-linear-gradient(45deg, ${COLS[k]}, ${COLS[k]} 10px, ${DARKS[k]} 10px, ${DARKS[k]} 20px)`}} />
                </div>
                <div style={{...font, fontSize: 28, color: dead ? '#aaa' : '#fff', marginTop: 2}}>🪖 {dead ? (k === T.winner ? '' : 'SURRENDERED') : fmtK(soldAt(t, k))}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{display: 'flex', justifyContent: 'center', marginTop: 12}}>
        <div style={{background: INK, border: '4px solid #fff', borderRadius: 14, padding: '4px 20px 0', ...font, fontSize: 36, color: YELLOW}}>DAY {days}</div><div style={{marginLeft: 12, background: RED, border: '4px solid #fff', borderRadius: 14, padding: '4px 18px 0', ...font, fontSize: 32, color: '#fff'}}>💀 LOSSES {fmtN(lossAt(t))}</div>
      </div>
    </div>
  );
};
const Chip: React.FC<{t: number}> = ({t}) => {
  const c = (T.chips as [number, string, number][]).filter(([c0]) => t >= c0 && t < c0 + 2.4).pop();
  if (!c) return null;
  const [c0, text, k] = c;
  const kk = popT(t, c0, 12) * lerp(t, c0 + 2.1, c0 + 2.4, 1, 0);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1570, display: 'flex', justifyContent: 'center', zIndex: 12}}>
      <div style={{transform: `scale(${kk}) rotate(-2deg)`, display: 'flex', alignItems: 'center', gap: 14, background: COLS[k], border: `7px solid ${INK}`, borderRadius: 24, padding: '8px 28px 8px 10px', boxShadow: '0 10px 0 rgba(0,0,0,0.35)'}}>
        <Ball k={k} size={74} mood="angry" t={t} id={`c${k}`} />
        <span style={{...font, fontSize: 54, color: '#fff', textShadow: `3px 3px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</span>
      </div>
    </div>
  );
};
const Stamp: React.FC<{t: number}> = ({t}) => {
  const s = (T.stamps as [number, string, string][]).find(([s0]) => t >= s0 && t < s0 + 1.8);
  if (!s) return null;
  const [s0, text, c] = s;
  const dt = t - s0;
  const k = dt < 0.25 ? lerp(dt, 0, 0.25, 2.3, 1, Easing.out(Easing.cubic)) : 1;
  const a = lerp(dt, 0, 0.08, 0, 1) * lerp(dt, 1.5, 1.8, 1, 0);
  const col = c === 'red' ? RED : c === 'yellow' ? '#e09a00' : GREEN;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 14}}>
      <div style={{transform: `scale(${k}) rotate(-6deg)`, opacity: a, border: `12px solid ${col}`, color: col, background: 'rgba(255,246,227,0.96)', borderRadius: 24, padding: '18px 34px 8px', ...font, fontSize: 88, textAlign: 'center', lineHeight: 1, maxWidth: 940, boxShadow: '0 12px 0 rgba(0,0,0,0.3)'}}>{text}</div>
    </AbsoluteFill>
  );
};
// ---------- elige tu país ----------
const Choose: React.FC<{t: number}> = ({t}) => {
  if (t > T.warStart + 0.6) return null;
  const out = lerp(t, T.warStart - 0.3, T.warStart + 0.4, 0, 1, Easing.in(Easing.cubic));
  const cd = t >= 2.8 && t < 5.6 ? 3 - Math.floor((t - 2.8) / 0.93) : null;
  return (
    <AbsoluteFill style={{zIndex: 20, background: `rgba(8,14,28,${0.72 * (1 - out)})`}}>
      <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 1 - out, transform: `scale(${popT(t, 0, 10)})`}}>
        <div style={{...font, fontSize: 112, color: '#fff', textShadow: `7px 7px 0 ${INK}, -3px -3px 0 ${INK}, 3px -3px 0 ${INK}, -3px 3px 0 ${INK}`, lineHeight: 1}}>CHOOSE YOUR</div>
        <div style={{...font, fontSize: 150, color: YELLOW, textShadow: `8px 8px 0 ${INK}, -4px -4px 0 ${INK}, 4px -4px 0 ${INK}, -4px 4px 0 ${INK}`, lineHeight: 1}}>COUNTRY</div>
      </div>
      <div style={{position: 'absolute', top: 520, left: 40, right: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30}}>
        {[0, 1, 2, 3].map((k) => {
          const pk = popT(t, 0.35 + k * 0.22, 11);
          const fly = out;
          const dir = [[-1, -1], [1, -1], [-1, 1], [1, 1]][k];
          return (
            <div key={k} style={{transform: `translate(${dir[0] * fly * 700}px, ${dir[1] * fly * 900}px) scale(${pk}) rotate(${(k % 2 ? 2 : -2) + Math.sin(t * 3 + k) * 1.5}deg)`, background: CREAM, border: `9px solid ${INK}`, borderRadius: 34, padding: '22px 16px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: `0 14px 0 rgba(0,0,0,0.45), inset 0 0 0 8px ${COLS[k]}`}}>
              <div style={{position: 'relative'}}>
                <Ball k={k} size={230} mood={k === 3 ? 'smug' : 'angry'} t={t} id={`ch${k}`} look={[dir[0] * -0.5, 0]} />
                <div style={{position: 'absolute', top: -14, left: -18, width: 70, height: 70, borderRadius: 35, background: INK, border: '5px solid #fff', ...font, fontSize: 46, color: YELLOW, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 6, boxSizing: 'border-box'}}>{k + 1}</div>
              </div>
              <div style={{...font, fontSize: 60, color: COLS[k], textShadow: `3px 3px 0 ${INK}`, marginTop: 10, lineHeight: 1}}>{NAMES[k]}</div>
              <div style={{...font2, fontSize: 34, color: INK, marginTop: 8}}>🪖 {T.stats[k][0]} soldiers</div>
              <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 2}}><svg width={70} height={46} viewBox="-30 -22 60 40" style={{overflow: 'visible'}}><UnitIcon ty={T.stats[k][2]} c={k} /></svg><span style={{...font2, fontSize: 32, color: '#555'}}>{T.stats[k][1]}</span></div>
            </div>
          );
        })}
      </div>
      {cd !== null && cd > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1600, display: 'flex', justifyContent: 'center'}}>
          <div style={{width: 190, height: 190, borderRadius: 95, background: RED, border: `10px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: 130, color: '#fff', paddingTop: 12, boxSizing: 'border-box', transform: `scale(${1.25 - 0.25 * Math.min(1, ((t - 2.8) % 0.93) / 0.25)})`, boxShadow: '0 10px 0 rgba(0,0,0,0.4)'}}>{cd}</div>
        </div>
      )}
      {t < 2.8 && <div style={{position: 'absolute', left: 0, right: 0, top: 1640, display: 'flex', justifyContent: 'center', transform: `scale(${popT(t, 1.4, 12)})`}}><div style={{background: '#fff', border: `7px solid ${INK}`, borderRadius: 24, padding: '10px 30px 2px', ...font, fontSize: 64, color: INK}}>Pick one & watch till the end!</div></div>}
      {t >= 5.6 && <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}><div style={{transform: `scale(${popT(t, 5.6, 9) * lerp(t, 6.2, 6.6, 1, 0)})`, ...font, fontSize: 280, color: RED, textShadow: `10px 10px 0 ${INK}, -5px -5px 0 ${INK}, 5px -5px 0 ${INK}, -5px 5px 0 ${INK}`}}>WAR!</div></AbsoluteFill>}
    </AbsoluteFill>
  );
};
const Twist: React.FC<{t: number}> = ({t}) => {
  const tw = T.twist as number;
  if (t < tw - 0.1 || t > tw + 0.8) return null;
  return <AbsoluteFill style={{background: '#fff', opacity: lerp(t, tw - 0.1, tw, 0, 0.85) * lerp(t, tw, tw + 0.8, 1, 0), zIndex: 13}} />;
};
const Winner: React.FC<{t: number}> = ({t}) => {
  const w0 = T.winT as number;
  if (t < w0) return null;
  const k = popT(t, w0, 10);
  const wk = T.winner as number;
  return (
    <AbsoluteFill style={{zIndex: 18, alignItems: 'center', justifyContent: 'center', background: `rgba(8,14,28,${0.6 * k})`}}>
      <div style={{transform: `scale(${k})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{fontSize: 180, marginBottom: -70, zIndex: 2, transform: `rotate(${Math.sin(t * 4) * 6}deg)`}}>👑</div>
        <Ball k={wk} size={400} mood="happy" t={t} id="win" />
        <div style={{marginTop: 20, background: COLS[wk], border: `10px solid ${INK}`, borderRadius: 30, padding: '12px 40px 2px', ...font, fontSize: 104, color: '#fff', textShadow: `5px 5px 0 ${INK}`, boxShadow: '0 12px 0 rgba(0,0,0,0.4)'}}>{NAMES[wk]} WINS!</div>
        <div style={{marginTop: 34, transform: `scale(${popT(t, w0 + 0.9, 11)}) rotate(-2deg)`, background: '#fff', border: `8px solid ${INK}`, borderRadius: 28, padding: '12px 34px 4px', ...font, fontSize: 70, color: INK, textAlign: 'center', lineHeight: 1.05}}>Did <span style={{color: RED}}>YOUR</span> country win?<br /><span style={{fontSize: 56, color: '#555'}}>Comment your pick 👇</span></div>
      </div>
    </AbsoluteFill>
  );
};
const Ocean: React.FC<{t: number}> = ({t}) => (
  <svg width={W} height={H} style={{position: 'absolute'}}>
    <defs>
      <radialGradient id="seaM" cx="50%" cy="52%" r="75%"><stop offset="0%" stopColor="#3f97d6" /><stop offset="100%" stopColor="#164f86" /></radialGradient>
      <pattern id="wavesM" width={140} height={46} patternUnits="userSpaceOnUse" patternTransform={`translate(${(t * 12) % 140},0)`}><path d="M0,23 C17,13 35,13 52,23 S87,33 105,23 S122,13 140,23" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={3} /></pattern>
      <pattern id="hexTex" width={8} height={8} patternUnits="userSpaceOnUse"><rect width={8} height={8} fill="none" /><circle cx={2} cy={2} r={0.9} fill="rgba(255,255,255,0.18)" /></pattern>
    </defs>
    <rect width={W} height={H} fill="url(#seaM)" /><rect width={W} height={H} fill="url(#wavesM)" />
  </svg>
);
export const MINI2_FRAMES = Math.round(DUR * 30);
export const MiniThumb2: React.FC = () => (
  <AbsoluteFill style={{background: '#164f86', overflow: 'hidden'}}>
    <Ocean t={0} /><MapLayer t={30} />
    <Choose t={2.75} />
    <AbsoluteFill style={{background: '#164f86', top: 1560, zIndex: 25, background: 'linear-gradient(rgba(8,14,28,0), rgba(8,14,28,0.9) 30%)'} as any} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 1600, display: 'flex', justifyContent: 'center', zIndex: 30}}>
      <div style={{transform: 'rotate(-3deg)', background: RED, border: `10px solid ${INK}`, borderRadius: 30, padding: '12px 40px 2px', ...font, fontSize: 104, color: '#fff', textShadow: `5px 5px 0 ${INK}`, boxShadow: '0 12px 0 rgba(0,0,0,0.45)'}}>WHO WINS? 🤔</div>
    </div>
  </AbsoluteFill>
);
export const MiniWar2: React.FC<{audio?: boolean}> = ({audio = true}) => {
  const t = useCurrentFrame() / 30;
  const cents = useMemo(() => [0, 1, 2, 3].map((k) => centroid(t, k)), [t]);
  return (
    <AbsoluteFill style={{background: '#164f86', overflow: 'hidden'}}>
      <Ocean t={t} />
      <MapLayer t={t} />
      <AbsoluteFill style={{background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0) 16%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.3))'}} />
      {t > T.warStart && t < T.winT && <Faces t={t} cents={cents} />}
      {t < T.winT && <BubblesL t={t} cents={cents} />}
      <Hud t={t} />
      {t < T.winT && <Chip t={t} />}
      <Stamp t={t} />
      <Twist t={t} />
      <Choose t={t} />
      <Winner t={t} />
      {audio && <Audio src={staticFile('mini2.wav')} />}
    </AbsoluteFill>
  );
};
