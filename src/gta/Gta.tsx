import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, Easing, interpolate} from 'remotion';
import {INK, lerp, popT} from '../lib3';
import TLraw from './tl.json';
import GEO from './geo.json';
import DIST from './districts.json';

const TL: any = TLraw;
type P = [number, number];
const MW = TL.map.W, MH = TL.map.H;
const GANG: Record<string, {n: string; c: string; c2: string; hq: string; tag: string}> = TL.gangs;
const COL = (t: string) => (GANG[t] ? GANG[t].c : t === 'POL' ? '#1e5bff' : t === 'MIL' ? '#6b7a3a' : '#888');

// ---------------- utilidades de tiempo ----------------
const keyAt = (arr: any[], t: number) => { let v = arr[0]; for (const a of arr) { if (a[0] <= t) v = a; else break; } return v; };
const smooth = (u: number) => u * u * (3 - 2 * u);
const todAt = (t: number) => {
  const k = TL.tod as [number, number][];
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) return k[i - 1][1] + (k[i][1] - k[i - 1][1]) * smooth((t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]));
  return k[k.length - 1][1];
};
// noche: 0 de día, 1 de noche. Atardecer: tinte naranja
const nightOf = (h: number) => { const x = ((h % 24) + 24) % 24; if (x >= 7 && x <= 17.5) return 0; if (x > 17.5 && x < 20.5) return (x - 17.5) / 3; if (x >= 20.5 || x < 5) return 1; return 1 - (x - 5) / 2; };
const duskOf = (h: number) => { const x = ((h % 24) + 24) % 24; return Math.max(0, 1 - Math.abs(x - 18.6) / 1.6) + Math.max(0, 1 - Math.abs(x - 6.2) / 1.2) * 0.8; };

// ---------------- trayectorias de unidades ----------------
type U = {id: string; k: string; tm: string; s: number; d: number; p: number[]; e: number; die?: number; alt?: number; lab?: string; sz?: number};
const UNITS = TL.units as U[];
const UBY: Record<string, U> = {};
UNITS.forEach((u) => (UBY[u.id] = u));
const posOf = (u: U, t: number): [number, number, number, number] | null => {
  const n = u.p.length / 3;
  const f = (t - u.s) / u.d;
  if (f < -0.001) return null;
  const i = Math.max(0, Math.min(n - 1, Math.floor(f)));
  const fr = Math.max(0, Math.min(1, f - i));
  const g = (j: number) => Math.max(0, Math.min(n - 1, j));
  const X = (j: number) => u.p[g(j) * 3], Y = (j: number) => u.p[g(j) * 3 + 1];
  const cr = (a: number, b: number, c: number, d: number, x: number) => 0.5 * (2 * b + (-a + c) * x + (2 * a - 5 * b + 4 * c - d) * x * x + (-a + 3 * b - 3 * c + d) * x * x * x);
  const x = cr(X(i - 1), X(i), X(i + 1), X(i + 2), fr), y = cr(Y(i - 1), Y(i), Y(i + 1), Y(i + 2), fr);
  const a0 = u.p[g(i) * 3 + 2], a1 = u.p[g(i + 1) * 3 + 2];
  let da = a1 - a0; while (da > 180) da -= 360; while (da < -180) da += 360;
  const sp = Math.hypot(X(i + 1) - X(i), Y(i + 1) - Y(i)) / u.d;
  return [x, y, a0 + da * fr, sp];
};

// ---------------- cámara ----------------
type CamK = any[];
const CAMS = TL.cam as CamK[];
const camPoint = (k: CamK, t: number): [number, number, number] => {
  if (k[1] === 'f') { const u = UBY[k[2]]; const p = u ? posOf(u, Math.min(t, u.e)) : null; return p ? [p[0] + (k[4] || 0), p[1] + (k[5] || 0), k[3]] : [MW / 2, MH / 2, k[3]]; }
  return [k[1], k[2], k[3]];
};
const camera = (t: number) => {
  let i = 0; while (i + 1 < CAMS.length && CAMS[i + 1][0] <= t) i++;
  const cur = camPoint(CAMS[i], t);
  if (i === 0) return cur;
  const tr = CAMS[i][6] ?? 1.2;
  const u = (t - CAMS[i][0]) / tr;
  if (u >= 1) return cur;
  const prev = camPoint(CAMS[i - 1], t);
  const e = Easing.inOut(Easing.cubic)(Math.max(0, u));
  // zoom en escala logarítmica para que el viaje sea natural
  const z = Math.exp(Math.log(prev[2]) + (Math.log(cur[2]) - Math.log(prev[2])) * e);
  return [prev[0] + (cur[0] - prev[0]) * e, prev[1] + (cur[1] - prev[1]) * e, z] as [number, number, number];
};
const shakeAt = (t: number) => { let a = 0; for (const s of TL.shake as number[][]) { if (t >= s[0] && t < s[0] + s[2]) a = Math.max(a, s[1] * (1 - (t - s[0]) / s[2])); } return a; };

// ---------------- territorio ----------------
const FLIPS = TL.flips as [number, string, string, number, number][];
const OWN0 = TL.own0 as Record<string, string>;
const ownAt = (id: string, t: number) => { let o = OWN0[id]; let f: any = null; for (const x of FLIPS) { if (x[1] !== id) continue; if (x[0] <= t) { o = x[2]; f = x; } } return [o, f] as [string, any]; };
const prevOwn = (id: string, t: number) => { let o = OWN0[id]; for (const x of FLIPS) if (x[1] === id && x[0] < t) o = x[2]; return o; };

// ---------------- dibujo de vehículos (vista cenital, el frente apunta a +x) ----------------
const Car: React.FC<{L: number; W: number; body: string; roof: string; t: number; night: number; siren?: boolean; head?: boolean}> = ({L, W, body, roof, t, night, siren, head}) => {
  const bl = Math.floor(t * 7) % 2;
  return (
    <g>
      {head && night > 0.05 && <path d={`M${L * 0.45},${-W * 0.35} L${L * 3.4},${-W * 1.5} L${L * 3.4},${W * 1.5} L${L * 0.45},${W * 0.35}Z`} fill="url(#beam)" opacity={night * 0.85} />}
      <rect x={-L / 2 + 0.6} y={-W / 2 + 0.7} width={L} height={W} rx={W * 0.32} fill="#000" opacity={0.35} />
      <rect x={-L / 2} y={-W / 2} width={L} height={W} rx={W * 0.32} fill={body} stroke="#111" strokeWidth={0.35} />
      <rect x={-L * 0.16} y={-W * 0.38} width={L * 0.38} height={W * 0.76} rx={W * 0.18} fill={roof} />
      <rect x={L * 0.2} y={-W * 0.36} width={L * 0.12} height={W * 0.72} rx={0.3} fill="#9ad0ff" opacity={0.85} />
      <rect x={-L * 0.3} y={-W * 0.34} width={L * 0.09} height={W * 0.68} rx={0.3} fill="#7fb5e6" opacity={0.7} />
      {siren && <>
        <rect x={-L * 0.04} y={-W * 0.42} width={L * 0.1} height={W * 0.38} fill={bl ? '#ff2a2a' : '#5a0d0d'} />
        <rect x={-L * 0.04} y={W * 0.04} width={L * 0.1} height={W * 0.38} fill={bl ? '#19217a' : '#2f6dff'} />
        <circle cx={0} cy={-W * 0.25} r={W * (1.2 + night * 1.6)} fill={bl ? '#ff2a2a' : '#2f6dff'} opacity={0.18 + night * 0.32} />
      </>}
      {head && <><circle cx={L / 2 - 0.4} cy={-W * 0.32} r={0.45} fill="#fff8d0" /><circle cx={L / 2 - 0.4} cy={W * 0.32} r={0.45} fill="#fff8d0" /></>}
      <circle cx={-L / 2 + 0.35} cy={-W * 0.32} r={0.4} fill="#ff3030" opacity={0.9} /><circle cx={-L / 2 + 0.35} cy={W * 0.32} r={0.4} fill="#ff3030" opacity={0.9} />
    </g>
  );
};
const Heli: React.FC<{c: string; t: number; night: number; spot?: boolean; L?: number}> = ({c, t, night, L = 10}) => (
  <g>
    <rect x={-L * 0.95} y={-0.6} width={L * 0.8} height={1.2} rx={0.5} fill={c} stroke="#111" strokeWidth={0.3} />
    <rect x={-L * 1.0} y={-2.0} width={0.8} height={4} fill={c} />
    <ellipse cx={0} cy={0} rx={L * 0.42} ry={L * 0.24} fill={c} stroke="#111" strokeWidth={0.35} />
    <ellipse cx={L * 0.2} cy={0} rx={L * 0.16} ry={L * 0.16} fill="#9ad0ff" opacity={0.85} />
    <g transform={`rotate(${(t * 1500) % 360})`}>
      <ellipse cx={0} cy={0} rx={L * 0.75} ry={L * 0.07} fill="#222" opacity={0.55} /><ellipse cx={0} cy={0} rx={L * 0.07} ry={L * 0.75} fill="#222" opacity={0.55} />
    </g>
    <circle cx={0} cy={0} r={L * 0.75} fill="#000" opacity={0.08} />
    <circle cx={-L * 0.3} cy={0} r={0.6} fill={Math.floor(t * 3) % 2 ? '#ff3030' : '#fff'} />
  </g>
);
const Tank: React.FC<{c: string; ta: number}> = ({c, ta}) => (
  <g>
    <rect x={-6.5 + 0.8} y={-3.7 + 0.8} width={13} height={7.4} rx={1} fill="#000" opacity={0.35} />
    <rect x={-6.5} y={-3.9} width={13} height={1.9} rx={0.6} fill="#2b2b22" /><rect x={-6.5} y={2.0} width={13} height={1.9} rx={0.6} fill="#2b2b22" />
    <rect x={-6} y={-2.6} width={12} height={5.2} rx={1} fill={c} stroke="#1b1b14" strokeWidth={0.35} />
    <g transform={`rotate(${ta})`}>
      <rect x={0} y={-0.45} width={10} height={0.9} fill="#2d3220" />
      <circle cx={0} cy={0} r={2.4} fill={c} stroke="#1b1b14" strokeWidth={0.35} />
    </g>
  </g>
);
const Jet: React.FC<{c: string; t: number}> = ({c, t}) => (
  <g>
    <path d="M9,0 L3,-1.2 L-1,-8 L-3,-8 L-1.5,-1.3 L-6,-1.1 L-8,-3.6 L-9.5,-3.6 L-8.4,0 L-9.5,3.6 L-8,3.6 L-6,1.1 L-1.5,1.3 L-3,8 L-1,8 L3,1.2 Z" fill={c} stroke="#222" strokeWidth={0.35} />
    <ellipse cx={4.2} cy={0} rx={1.8} ry={0.6} fill="#ffd27a" opacity={0.9} />
    <ellipse cx={-10.5} cy={0} rx={2.4 + Math.sin(t * 40) * 0.5} ry={0.9} fill="#ff9a2a" opacity={0.9} />
    <ellipse cx={-12} cy={0} rx={3.6} ry={1.3} fill="#ffcf6a" opacity={0.35} />
  </g>
);
const Boat: React.FC<{c: string; L: number; t: number; fan?: boolean}> = ({c, L, t, fan}) => (
  <g>
    <path d={`M${-L * 0.5},${-L * 0.18} L${L * 0.25},${-L * 0.18} L${L * 0.5},0 L${L * 0.25},${L * 0.18} L${-L * 0.5},${L * 0.18} Z`} fill={c} stroke="#111" strokeWidth={0.3} />
    <rect x={-L * 0.05} y={-L * 0.1} width={L * 0.2} height={L * 0.2} rx={0.4} fill="#e8f4ff" />
    {fan && <g transform={`translate(${-L * 0.42},0) rotate(${(t * 900) % 360})`}><rect x={-L * 0.2} y={-0.3} width={L * 0.4} height={0.6} fill="#333" /></g>}
  </g>
);
const Ped: React.FC<{c: string; t: number; dead: number}> = ({c, t, dead}) => {
  const w = Math.sin(t * 14) * 0.6;
  return (
    <g opacity={1 - dead * 0.2}>
      {dead > 0 && <circle cx={-0.6} cy={0.4} r={1.4 * dead} fill="#8a0d0d" opacity={0.75} />}
      <g transform={`rotate(${dead * 90})`}>
        <rect x={-0.4 + w * (1 - dead)} y={-0.95} width={1.1} height={0.6} rx={0.3} fill="#222" />
        <rect x={-0.4 - w * (1 - dead)} y={0.35} width={1.1} height={0.6} rx={0.3} fill="#222" />
        <ellipse cx={0} cy={0} rx={0.85} ry={1.15} fill={c} stroke="#111" strokeWidth={0.2} />
        <circle cx={0.15} cy={0} r={0.55} fill="#c98e62" />
      </g>
    </g>
  );
};

const VEH: Record<string, {L: number; W: number}> = {cop: {L: 7, W: 3.3}, suv: {L: 7.6, W: 3.6}, swat: {L: 9, W: 4}, car: {L: 7, W: 3.3}, van: {L: 8.6, W: 3.8}, truck: {L: 11, W: 4.2}, apc: {L: 10, W: 5}, bike: {L: 4, W: 1.5}};
const UnitG: React.FC<{u: U; t: number; z: number; night: number}> = ({u, t, z, night}) => {
  const tt = Math.min(t, u.e);
  const p = posOf(u, tt);
  if (!p) return null;
  const [x, y, a, sp] = p;
  const dead = u.die !== undefined && t >= u.die;
  const dd = dead ? Math.min(1, (t - u.die!) / 0.5) : 0;
  // escala mínima para que se vean en planos abiertos
  const VS = u.k === 'carrier' ? 1.4 : u.k === 'ped' ? 2.5 : u.k === 'jet' || u.k === 'heli' || u.k === 'plane' ? 2.0 : 2.4;
  const k = VS * Math.max(1, (u.k === 'jet' ? 0.9 : u.k === 'ped' ? 1.4 : 1.3) / z) * (u.sz || 1);
  const c = COL(u.tm);
  const c2 = GANG[u.tm] ? GANG[u.tm].c2 : '#222';
  let body: React.ReactNode = null;
  const alt = u.alt || 0;
  if (dead && u.k === 'carrier') {
    body = <g opacity={Math.max(0, 1 - (t - u.die!) / 6)}><path d="M60,0 L48,-11 L-55,-11 L-60,-6 L-60,6 L-55,11 L48,11 Z" fill="#2a2624" /></g>;
  } else if (dead && u.k !== 'ped' && u.k !== 'heli' && u.k !== 'jet') {
    body = <g><rect x={-3.6} y={-1.8} width={7.2} height={3.6} rx={1} fill="#262321" /><rect x={-2} y={-1.2} width={3.2} height={2.4} fill="#120f0e" /></g>;
  } else if (u.k === 'cop') body = <Car L={7} W={3.3} body="#f4f6fa" roof="#14161c" t={t} night={night} siren head />;
  else if (u.k === 'suv') body = <Car L={7.6} W={3.6} body="#15171c" roof="#2a2d36" t={t} night={night} siren head />;
  else if (u.k === 'swat') body = <Car L={9} W={4} body="#1d2533" roof="#2c3a52" t={t} night={night} siren head />;
  else if (u.k === 'hp') body = <Car L={7.2} W={3.3} body="#d6c7a0" roof="#3d3428" t={t} night={night} siren head />;
  else if (u.k === 'car') body = <Car L={7} W={3.3} body={c} roof={c2} t={t} night={night} head />;
  else if (u.k === 'van') body = <Car L={8.6} W={3.8} body={c} roof={c2} t={t} night={night} head />;
  else if (u.k === 'apc') body = <Car L={10} W={5} body="#5f6b33" roof="#48512a" t={t} night={night} head />;
  else if (u.k === 'truck') body = <Car L={11} W={4.2} body="#55602d" roof="#3f4722" t={t} night={night} head />;
  else if (u.k === 'bike') body = <g><rect x={-2} y={-0.5} width={4} height={1} rx={0.5} fill="#222" /><ellipse cx={0} cy={0} rx={1} ry={0.8} fill={c} />{night > 0.05 && <path d="M2,-0.5 L9,-2.5 L9,2.5 L2,0.5Z" fill="url(#beam)" opacity={night * 0.8} />}</g>;
  else if (u.k === 'tank') { const tp = posOf(u, tt + 0.01); body = <Tank c={u.tm === 'MIL' ? '#66733a' : c} ta={(u as any).ta ?? 0} />; void tp; }
  else if (u.k === 'heli') body = <Heli c={u.tm === 'POL' ? '#1f2f6a' : u.tm === 'MIL' ? '#4c5530' : c} t={t} night={night} />;
  else if (u.k === 'jet') body = <Jet c={u.tm === 'MIL' ? '#8c96a3' : c} t={t} />;
  else if (u.k === 'boat') body = <Boat c={u.tm === 'POL' ? '#f4f6fa' : c} L={10} t={t} />;
  else if (u.k === 'airboat') body = <Boat c={c} L={7} t={t} fan />;
  else if (u.k === 'plane') body = <g transform="scale(1.4)"><Jet c="#e8e4dc" t={0} /></g>;
  else if (u.k === 'carrier') body = <g>
    <path d="M60,0 L48,-11 L-55,-11 L-60,-6 L-60,6 L-55,11 L48,11 Z" fill="#7d858f" stroke="#2c3036" strokeWidth={0.8} />
    <path d="M52,-2 L-50,-2 M52,2 L-50,2" stroke="#e8e8e8" strokeWidth={0.5} strokeDasharray="4 3" />
    <path d="M30,-10 L-20,4" stroke="#e8e8e8" strokeWidth={0.5} strokeDasharray="4 3" />
    <rect x={5} y={6} width={14} height={5} fill="#4b525b" stroke="#2c3036" strokeWidth={0.5} />
    <circle cx={12} cy={8.5} r={1} fill={Math.floor(t * 2) % 2 ? '#ff3030' : '#fff'} />
    {[-40, -28, -16].map((xx) => <g key={xx} transform={`translate(${xx},-6) scale(0.55)`}><Jet c="#8c96a3" t={0} /></g>)}
  </g>;
  else if (u.k === 'ped') body = <Ped c={u.tm === 'POL' ? '#1e3fbf' : u.tm === 'MIL' ? '#5f6b33' : c} t={sp > 0.5 ? t : 0} dead={dd} />;
  if (dead && (u.k === 'heli' || u.k === 'jet') && t > u.die! + 0.2) return null;
  const sh = alt * 9;
  return (
    <g transform={`translate(${x},${y})`}>
      {alt > 0 && <g transform={`translate(${sh},${sh}) rotate(${a}) scale(${k})`} opacity={0.28}><ellipse cx={0} cy={0} rx={u.k === 'jet' ? 8 : 5} ry={u.k === 'jet' ? 6 : 2.5} fill="#000" /></g>}
      {u.k === 'heli' && night > 0.1 && alt > 0 && <ellipse cx={sh * 1.6 + 6} cy={sh * 1.6 + 4} rx={9 * k} ry={6 * k} fill="url(#spot)" opacity={night} />}
      {(u.k === 'boat' || u.k === 'airboat') && sp > 3 && <path d={`M${-5 * k},0 L${-22 * k},${-5 * k} L${-22 * k},${5 * k}Z`} transform={`rotate(${a})`} fill="#fff" opacity={0.35} />}
      <g transform={`rotate(${a}) scale(${k})`}>{body}</g>
      {u.lab && <text x={0} y={-7 * k} fontFamily="Anton" fontSize={4.4 * k} textAnchor="middle" fill="#fff" stroke="#000" strokeWidth={1.1 * k} paintOrder="stroke">{u.lab}</text>}
    </g>
  );
};

// ---------------- efectos ----------------
const SHOTS = TL.shots as number[][];      // [t, x0,y0,x1,y1, kind(0 bala,1 cohete,2 obús,3 misil), team]
const BOOMS = TL.booms as number[][];      // [t, x, y, r]
const FIRES = TL.fires as number[][];      // [t0, t1, x, y, r]
const Boom: React.FC<{b: number[]; t: number}> = ({b, t}) => {
  const dt = t - b[0], r = b[3];
  const u = dt / 1.1;
  return (
    <g transform={`translate(${b[1]},${b[2]})`}>
      <circle r={r * (0.4 + u * 1.6)} fill="none" stroke="#fff" strokeWidth={r * 0.12 * (1 - u)} opacity={(1 - u) * 0.8} />
      <circle r={r * (0.5 + u * 0.9)} fill="#3a2a22" opacity={0.55 * (1 - u)} />
      <circle r={r * (0.35 + u * 0.7) * (1 - u * 0.4)} fill="#ff7a1a" opacity={Math.max(0, 1 - u * 1.3)} />
      <circle r={r * (0.22 + u * 0.3)} fill="#ffe28a" opacity={Math.max(0, 1 - u * 2)} />
      {[0, 1, 2, 3, 4, 5].map((i) => { const a = i * 1.05 + b[1]; return <circle key={i} cx={Math.cos(a) * r * (0.3 + u * 1.4)} cy={Math.sin(a) * r * (0.3 + u * 1.4)} r={r * 0.08} fill="#2b2420" opacity={1 - u} />; })}
    </g>
  );
};

// ---------------- HUD ----------------
const STAR = 'M0,-10 L2.9,-3.1 L10.5,-3.1 L4.4,1.4 L6.6,8.9 L0,4.4 L-6.6,8.9 L-4.4,1.4 L-10.5,-3.1 L-2.9,-3.1 Z';
const Stars: React.FC<{t: number}> = ({t}) => {
  const st = TL.stars as [number, number][];
  const cur = keyAt(st, t);
  const n = cur[1];
  const flash = t - cur[0] < 1.4 ? 1 - (t - cur[0]) / 1.4 : 0;
  if (n <= 0 && t < 3) return null;
  return (
    <div style={{position: 'absolute', right: 34, top: 26, display: 'flex', gap: 6, zIndex: 20}}>
      {[1, 2, 3, 4, 5, 6].map((i) => {
        const on = i <= n;
        const isNew = i === n && flash > 0;
        const s = isNew ? 1 + flash * 0.9 : 1;
        const col = on ? (i === 6 ? '#ff3b3b' : '#ffffff') : 'rgba(255,255,255,0.18)';
        return (
          <svg key={i} width={46} height={46} viewBox="-12 -12 24 24" style={{transform: `scale(${s})`, filter: on ? `drop-shadow(0 0 ${6 + flash * 18}px ${i === 6 ? '#ff2020' : 'rgba(255,255,255,0.8)'})` : undefined}}>
            <path d={STAR} fill={col} stroke="#000" strokeWidth={1.6} opacity={on && isNew && Math.floor(t * 8) % 2 ? 0.55 : 1} />
          </svg>
        );
      })}
    </div>
  );
};
const fmtMoney = (v: number) => '$' + Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const Money: React.FC<{t: number}> = ({t}) => {
  const m = TL.money as [number, number][];
  let v = 0;
  for (let i = 0; i < m.length; i++) { if (m[i][0] <= t) { const nx = m[i + 1]; const v0 = i ? m[i - 1][1] : 0; v = m[i][1]; if (t - m[i][0] < 1.5) v = v0 + (m[i][1] - v0) * smooth((t - m[i][0]) / 1.5); void nx; } }
  if (v <= 0) return null;
  return <div style={{position: 'absolute', right: 40, top: 82, fontFamily: 'Anton', fontSize: 50, color: '#3ccf6a', WebkitTextStroke: '3px #062b12', paintOrder: 'stroke fill', textShadow: '0 4px 0 rgba(0,0,0,0.5)', zIndex: 20}}>{fmtMoney(v)}</div>;
};
const Clock: React.FC<{h: number}> = ({h}) => {
  const x = ((h % 24) + 24) % 24; const hh = Math.floor(x), mm = Math.floor((x - hh) * 60 / 5) * 5;
  return <div style={{position: 'absolute', right: 44, top: 146, fontFamily: 'Anton', fontSize: 34, color: '#fff', WebkitTextStroke: '2px #000', paintOrder: 'stroke fill', zIndex: 20, letterSpacing: 1}}>{String(hh).padStart(2, '0')}:{String(mm).padStart(2, '0')}</div>;
};
const Alliance: React.FC<{t: number}> = ({t}) => {
  const js = (TL.joins as [number, string][]).filter((j) => j[0] <= t);
  const out = (TL.gone as [number, string][]).filter((j) => j[0] <= t).map((j) => j[1]);
  if (!js.length) return null;
  return (
    <div style={{position: 'absolute', left: 26, top: 24, zIndex: 20, display: 'flex', flexDirection: 'column', gap: 6}}>
      <div style={{fontFamily: 'Anton', fontSize: 24, color: '#ffd23f', WebkitTextStroke: '2px #000', paintOrder: 'stroke fill', letterSpacing: 1}}>{TL.allianceTitle ? keyAt(TL.allianceTitle, t)[1] : 'THE GANGS'}</div>
      {js.map(([t0, g]) => {
        const k = popT(t, t0, 12);
        const dead = out.includes(g);
        return (
          <div key={g} style={{display: 'flex', alignItems: 'center', gap: 10, transform: `translateX(${(1 - k) * -340}px)`, opacity: dead ? 0.35 : 1}}>
            <div style={{width: 34, height: 34, borderRadius: 8, background: GANG[g].c, border: '3px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Anton', fontSize: 15, color: GANG[g].c2 === '#000' ? '#000' : '#fff'}}>{GANG[g].tag}</div>
            <div style={{fontFamily: 'Anton', fontSize: 25, color: '#fff', WebkitTextStroke: '2px #000', paintOrder: 'stroke fill', textDecoration: dead ? 'line-through' : 'none'}}>{GANG[g].n}</div>
          </div>
        );
      })}
    </div>
  );
};
const Feed: React.FC<{t: number}> = ({t}) => {
  const f = (TL.feed as [number, string, string][]).filter((x) => x[0] <= t && t - x[0] < 4.5).slice(-4);
  return (
    <div style={{position: 'absolute', right: 30, top: 200, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, zIndex: 20}}>
      {f.map(([t0, txt, tm]) => {
        const a = lerp(t, t0, t0 + 0.2, 0, 1) * lerp(t, t0 + 4.0, t0 + 4.5, 1, 0);
        return <div key={t0 + txt} style={{opacity: a, transform: `translateX(${(1 - a) * 60}px)`, background: 'rgba(0,0,0,0.72)', borderLeft: `6px solid ${COL(tm)}`, padding: '6px 14px 4px', fontFamily: 'Anton', fontSize: 24, color: '#fff', letterSpacing: 0.5}}>{txt}</div>;
      })}
    </div>
  );
};
const Territory: React.FC<{t: number}> = ({t}) => {
  if (t < (TL.terrFrom || 0) || t > TL.victory) return null;
  const area: Record<string, number> = {};
  let tot = 0;
  for (const d of DIST as any[]) { const [o] = ownAt(d.id, t); area[o] = (area[o] || 0) + d.area; tot += d.area; }
  const order = Object.keys(area).sort((a, b) => (a === 'POL' || a === 'MIL' ? 1 : 0) - (b === 'POL' || b === 'MIL' ? 1 : 0));
  return (
    <div style={{position: 'absolute', left: 260, right: 260, bottom: 26, zIndex: 20}}>
      <div style={{display: 'flex', height: 26, border: '4px solid #000', borderRadius: 13, overflow: 'hidden', boxShadow: '0 5px 0 rgba(0,0,0,0.4)'}}>
        {order.map((o) => <div key={o} style={{width: `${(area[o] / tot) * 100}%`, background: COL(o), borderRight: '2px solid #000'}} />)}
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: 'Anton', fontSize: 22, color: '#fff', WebkitTextStroke: '2px #000', paintOrder: 'stroke fill', marginTop: 2}}>
        <span>GANGS {Math.round((order.filter((o) => o !== 'POL' && o !== 'MIL').reduce((s, o) => s + area[o], 0) / tot) * 100)}%</span><span>LAW {Math.round((((area.POL || 0) + (area.MIL || 0)) / tot) * 100)}%</span>
      </div>
    </div>
  );
};
const Card: React.FC<{t: number}> = ({t}) => {
  const c = (TL.cards as any[]).find((x) => t >= x[0] && t < x[1]);
  if (!c) return null;
  const [t0, t1, kind, a, b] = c;
  const k = popT(t, t0, 11) * lerp(t, t1 - 0.3, t1, 1, 0);
  if (kind === 'chapter') {
    return (
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 30, background: `rgba(0,0,0,${0.45 * k})`}}>
        <div style={{transform: `scale(${k})`, textAlign: 'center'}}>
          <svg width={600} height={90} viewBox="0 0 600 90">{[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={STAR} transform={`translate(${300 + (i - 2.5) * 92},45) scale(3.4)`} fill={i < b ? (i === 5 ? '#ff3b3b' : '#fff') : 'rgba(255,255,255,0.15)'} stroke="#000" strokeWidth={1.4} />)}</svg>
          <div style={{fontFamily: 'Anton', fontSize: 120, color: '#fff', WebkitTextStroke: '8px #000', paintOrder: 'stroke fill', lineHeight: 1.05, letterSpacing: 2}}>{a}</div>
        </div>
      </AbsoluteFill>
    );
  }
  if (kind === 'gang') {
    const g = GANG[a];
    return (
      <div style={{position: 'absolute', left: 60, bottom: 110, zIndex: 30, transform: `translateX(${(1 - k) * -900}px)`, display: 'flex', alignItems: 'center', gap: 22}}>
        <div style={{width: 170, height: 170, borderRadius: 30, background: `linear-gradient(135deg, ${g.c}, ${g.c2})`, border: '7px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Anton', fontSize: 64, color: '#fff', WebkitTextStroke: '4px #000', paintOrder: 'stroke fill', boxShadow: '0 10px 0 rgba(0,0,0,0.5)'}}>{g.tag}</div>
        <div style={{background: 'rgba(0,0,0,0.82)', borderLeft: `12px solid ${g.c}`, padding: '12px 28px 10px'}}>
          <div style={{fontFamily: 'Anton', fontSize: 74, color: g.c, lineHeight: 1}}>{g.n}</div>
          <div style={{fontFamily: 'Anton', fontSize: 30, color: '#fff', marginTop: 6, letterSpacing: 1}}>{b}</div>
        </div>
      </div>
    );
  }
  if (kind === 'stamp') {
    return (
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 30}}>
        <div style={{transform: `scale(${0.6 + k * 0.4}) rotate(-4deg)`, opacity: k, fontFamily: 'Anton', fontSize: 150, color: b || '#ff3b3b', WebkitTextStroke: '9px #000', paintOrder: 'stroke fill', letterSpacing: 3, textShadow: '0 10px 0 rgba(0,0,0,0.5)'}}>{a}</div>
      </AbsoluteFill>
    );
  }
  if (kind === 'title') {
    return (
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 30, background: `rgba(0,0,0,${0.35 * k})`}}>
        <div style={{transform: `scale(${k})`, textAlign: 'center'}}>
          <div style={{fontFamily: 'Anton', fontSize: 70, color: '#ffd23f', WebkitTextStroke: '6px #000', paintOrder: 'stroke fill', letterSpacing: 6}}>{b}</div>
          <div style={{fontFamily: 'Anton', fontSize: 150, color: '#fff', WebkitTextStroke: '10px #000', paintOrder: 'stroke fill', lineHeight: 1, letterSpacing: 2, background: 'linear-gradient(#fff,#ffd6f0)', WebkitBackgroundClip: 'text'}}>{a}</div>
        </div>
      </AbsoluteFill>
    );
  }
  if (kind === 'question') {
    return (
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 30, background: `rgba(0,0,0,${0.5 * k})`}}>
        <div style={{transform: `scale(${k})`, fontFamily: 'Anton', fontSize: 110, color: '#fff', WebkitTextStroke: '8px #000', paintOrder: 'stroke fill', textAlign: 'center', lineHeight: 1.05}}>{a}<br /><span style={{color: '#ffd23f', fontSize: 70}}>{b}</span></div>
      </AbsoluteFill>
    );
  }
  return null;
};
const Bubbles: React.FC<{t: number; w2s: (p: P) => P}> = ({t, w2s}) => (
  <>
    {(TL.bubbles as any[]).filter((b) => t >= b[0] && t < b[1]).map((b, i) => {
      let p: P | null = null;
      if (typeof b[2] === 'string') { const u = UBY[b[2]]; const q = u ? posOf(u, Math.min(t, u.e)) : null; if (q) p = [q[0], q[1]]; } else p = b[2];
      if (!p) return null;
      const [x, y] = w2s(p);
      const k = popT(t, b[0], 12) * lerp(t, b[1] - 0.25, b[1], 1, 0);
      return (
        <div key={i} style={{position: 'absolute', left: x, top: y - 60, transform: `translate(-50%,-100%) scale(${k})`, transformOrigin: '50% 100%', zIndex: 25, background: '#fff', border: '5px solid #000', borderRadius: 22, padding: '8px 20px 6px', fontFamily: 'Lilita', fontSize: 34, color: '#111', whiteSpace: 'nowrap', boxShadow: '0 6px 0 rgba(0,0,0,0.4)'}}>
          {b[3]}
          <div style={{position: 'absolute', left: '50%', bottom: -18, width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderTop: '16px solid #000', transform: 'translateX(-50%)'}} />
        </div>
      );
    })}
  </>
);
// etiquetas de lugar: [t0, t1, [x,y], color, tamaño, texto]
const Labels: React.FC<{t: number; w2s: (p: P) => P}> = ({t, w2s}) => {
  const L = (TL.labels as any[]).filter((l) => t >= l[0] && t < l[1]);
  return (
    <>
      {L.map((l, i) => {
        const [x, y] = w2s(l[2]);
        const k = popT(t, l[0], 12) * lerp(t, l[1] - 0.3, l[1], 1, 0);
        return <div key={i} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${k})`, zIndex: 15, fontFamily: 'Anton', fontSize: l[4] || 40, color: l[3] || '#fff', WebkitTextStroke: '5px #000', paintOrder: 'stroke fill', letterSpacing: 2, whiteSpace: 'nowrap'}}>{l[5]}</div>;
      })}
    </>
  );
};

// ---------------- composición ----------------
export const GtaWar: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const [cx0, cy0, z0] = camera(t);
  const sk = shakeAt(t);
  const cx = cx0 + Math.sin(t * 53) * sk * 6 / z0, cy = cy0 + Math.cos(t * 47) * sk * 6 / z0, z = z0;
  const hour = todAt(t);
  const night = nightOf(hour), dusk = duskOf(hour);
  const tr = `translate(960px,540px) scale(${z}) translate(${-cx}px,${-cy}px)`;
  const w2s = (p: P): P => [960 + (p[0] - cx) * z, 540 + (p[1] - cy) * z];
  const vw = 1920 / z, vh = 1080 / z;
  const vx0 = cx - vw / 2 - 60, vx1 = cx + vw / 2 + 60, vy0 = cy - vh / 2 - 60, vy1 = cy + vh / 2 + 60;
  const inV = (x: number, y: number, m = 0) => x > vx0 - m && x < vx1 + m && y > vy0 - m && y < vy1 + m;
  const sea = night > 0.5 ? '#0b2348' : '#1a72b8';
  const live = UNITS.filter((u) => t >= u.s && t <= (u.die !== undefined ? Math.max(u.e, u.die + (u.k === 'ped' ? 6 : u.k === 'heli' || u.k === 'jet' ? 0.3 : 9)) : u.e + 0.05));
  const ground = live.filter((u) => !u.alt);
  const air = live.filter((u) => u.alt);
  const iw = 1 / z;
  return (
    <AbsoluteFill style={{background: sea, overflow: 'hidden'}}>
      {/* océano con olas */}
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(${night > 0.5 ? '10,30,70' : '40,140,210'},1), rgba(${night > 0.5 ? '5,18,44' : '22,96,170'},1))`, opacity: 1}} />
      <AbsoluteFill style={{opacity: 0.18 * (1 - night * 0.6), backgroundImage: 'radial-gradient(ellipse at center, rgba(255,255,255,0.7) 0 1px, transparent 2px)', backgroundSize: `${Math.max(12, 36 * z)}px ${Math.max(9, 24 * z)}px`, backgroundPosition: `${(-cx * z + t * 6) % 400}px ${(-cy * z) % 400}px`}} />
      <div style={{position: 'absolute', left: 0, top: 0, width: MW, height: MH, transformOrigin: '0 0', transform: tr}}>
        <Img src={staticFile('gta/map_day.webp')} style={{position: 'absolute', left: 0, top: 0, width: MW, height: MH}} />
        {night > 0.01 && <Img src={staticFile('gta/map_night.webp')} style={{position: 'absolute', left: 0, top: 0, width: MW, height: MH, opacity: night}} />}
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <radialGradient id="beam" cx="0" cy="0.5" r="1"><stop offset="0" stopColor="#fff6c8" stopOpacity="0.9" /><stop offset="1" stopColor="#fff6c8" stopOpacity="0" /></radialGradient>
          <radialGradient id="spot"><stop offset="0" stopColor="#f6fbff" stopOpacity="0.8" /><stop offset="0.7" stopColor="#f6fbff" stopOpacity="0.25" /><stop offset="1" stopColor="#f6fbff" stopOpacity="0" /></radialGradient>
          {(DIST as any[]).map((d) => <clipPath key={d.id} id={`dc-${d.id.replace(/\s/g, '')}`}><path d={d.d} /></clipPath>)}
        </defs>
        <g transform={`translate(960,540) scale(${z}) translate(${-cx},${-cy})`}>
          {/* territorios */}
          {(DIST as any[]).map((d) => {
            if (!(d.bb[2] > vx0 && d.bb[0] < vx1 && d.bb[3] > vy0 && d.bb[1] < vy1)) return null;
            const [o, fl] = ownAt(d.id, t);
            const prev = fl ? prevOwn(d.id, fl[0]) : o;
            const q = fl ? Math.min(1, (t - fl[0]) / 1.6) : 1;
            const R = Math.hypot(d.bb[2] - d.bb[0], d.bb[3] - d.bb[1]);
            const clip = `url(#dc-${d.id.replace(/\s/g, '')})`;
            const zf = Math.min(1, 1.1 / Math.max(0.3, z)) * 0.75 + 0.25;
            const alpha = (x: string) => (x === 'POL' ? 0.0 : x === 'MIL' ? 0.3 : 0.4) * zf;
            return (
              <g key={d.id} clipPath={clip}>
                {q < 1 && <path d={d.d} fill={COL(prev)} opacity={alpha(prev)} />}
                {q < 1 ? <circle cx={fl[3]} cy={fl[4]} r={R * Easing.out(Easing.cubic)(q)} fill={COL(o)} opacity={alpha(o) || 0.001} /> : <path d={d.d} fill={COL(o)} opacity={alpha(o)} />}
                {q < 1 && <circle cx={fl[3]} cy={fl[4]} r={R * Easing.out(Easing.cubic)(q)} fill="none" stroke="#fff" strokeWidth={3 * iw} opacity={1 - q} />}
                {o !== 'POL' && <path d={d.d} fill="none" stroke={COL(o)} strokeWidth={5 * iw} opacity={0.9} />}
              </g>
            );
          })}
          {/* carreteras */}
          {(GEO as any).roads.map((r: any, i: number) => {
            const d = 'M' + r.pts.map((p: number[]) => p.join(',')).join(' L');
            const big = r.n !== 'RD';
            return (
              <g key={i}>
                {night > 0.05 && <path d={d} fill="none" stroke="#ffb347" strokeWidth={(big ? 14 : 9)} opacity={0.22 * night} strokeLinecap="round" strokeLinejoin="round" />}
                <path d={d} fill="none" stroke="#2c2e33" strokeWidth={big ? 6.5 : 4.5} strokeLinecap="round" strokeLinejoin="round" />
                <path d={d} fill="none" stroke={night > 0.5 ? '#4a4c52' : '#5d6068'} strokeWidth={big ? 4.6 : 3} strokeLinecap="round" strokeLinejoin="round" />
                {big && <path d={d} fill="none" stroke="#ffd34d" strokeWidth={0.45} strokeDasharray="3 3" opacity={0.85} />}
              </g>
            );
          })}
          {/* fuegos */}
          {FIRES.filter((fr) => t >= fr[0] && t < fr[1] && inV(fr[2], fr[3])).map((fr, i) => {
            const fl = Math.sin(t * 20 + i) * 0.15 + 1;
            return <g key={`fi${i}`} transform={`translate(${fr[2]},${fr[3]})`}><circle r={fr[4] * 1.8} fill="#2a2420" opacity={0.25} /><circle r={fr[4] * fl} fill="#ff6a1a" opacity={0.75} /><circle r={fr[4] * 0.55 * fl} fill="#ffd36a" opacity={0.9} />{night > 0.2 && <circle r={fr[4] * 4} fill="#ff8a2a" opacity={0.12 * night} />}</g>;
          })}
          {/* unidades de tierra */}
          {ground.filter((u) => { const p = posOf(u, Math.min(t, u.e)); return p && inV(p[0], p[1]); }).map((u) => <UnitG key={u.id} u={u} t={t} z={z} night={night} />)}
          {/* disparos */}
          {SHOTS.filter((s) => t >= s[0] && t < s[0] + (s[5] === 0 ? 0.09 : s[5] === 1 ? 0.7 : s[5] === 2 ? 0.45 : 1.1) && (inV(s[1], s[2], 200) || inV(s[3], s[4], 200))).map((s, i) => {
            const dur = s[5] === 0 ? 0.09 : s[5] === 1 ? 0.7 : s[5] === 2 ? 0.45 : 1.1;
            const u = (t - s[0]) / dur;
            if (s[5] === 0) {
              const x1 = s[1] + (s[3] - s[1]) * Math.min(1, u * 1.6), y1 = s[2] + (s[4] - s[2]) * Math.min(1, u * 1.6);
              return <g key={`s${i}`}><circle cx={s[1]} cy={s[2]} r={1.6 * Math.max(1, 2 / z)} fill="#ffe08a" opacity={1 - u} /><line x1={s[1] + (s[3] - s[1]) * Math.max(0, u * 1.6 - 0.4)} y1={s[2] + (s[4] - s[2]) * Math.max(0, u * 1.6 - 0.4)} x2={x1} y2={y1} stroke="#fff3b0" strokeWidth={0.7 * Math.max(1, 2 / z)} strokeLinecap="round" /></g>;
            }
            const e = s[5] === 3 ? Easing.in(Easing.quad)(u) : u;
            const x = s[1] + (s[3] - s[1]) * e, y = s[2] + (s[4] - s[2]) * e;
            const tx = s[1] + (s[3] - s[1]) * Math.max(0, e - 0.25), ty = s[2] + (s[4] - s[2]) * Math.max(0, e - 0.25);
            return <g key={`s${i}`}><line x1={tx} y1={ty} x2={x} y2={y} stroke="#d8d4cc" strokeWidth={(s[5] === 2 ? 1.2 : 2.2) * Math.max(1, 1.6 / z)} opacity={0.6} strokeLinecap="round" /><circle cx={x} cy={y} r={(s[5] === 2 ? 1.1 : 1.6) * Math.max(1, 2 / z)} fill="#ffcf5a" /></g>;
          })}
          {/* explosiones */}
          {BOOMS.filter((b) => t >= b[0] && t < b[0] + 1.1 && inV(b[1], b[2], 100)).map((b, i) => <Boom key={`b${i}`} b={b} t={t} />)}
          {/* aire */}
          {air.filter((u) => { const p = posOf(u, Math.min(t, u.e)); return p && inV(p[0], p[1], 120); }).map((u) => {
            if (u.k !== 'jet') return <UnitG key={u.id} u={u} t={t} z={z} night={night} />;
            // estela de condensación de los cazas
            const pts: string[] = [];
            for (let k = 0; k <= 10; k++) { const p = posOf(u, Math.max(u.s, Math.min(t, u.e) - k * 0.12)); if (p) pts.push(`${p[0]},${p[1]}`); }
            return <g key={u.id}><polyline points={pts.join(' ')} fill="none" stroke="#fff" strokeWidth={2.6 * Math.max(1, 1.6 / z)} opacity={0.35} strokeLinecap="round" /><UnitG u={u} t={t} z={z} night={night} /></g>;
          })}
        </g>
      </svg>
      {/* luz: atardecer y noche */}
      <AbsoluteFill style={{background: '#ff7a2a', mixBlendMode: 'multiply', opacity: dusk * 0.35, pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)'}} />
      <Labels t={t} w2s={w2s} />
      <Bubbles t={t} w2s={w2s} />
      <Alliance t={t} />
      <Stars t={t} />
      <Money t={t} />
      <Clock h={hour} />
      <Feed t={t} />
      <Territory t={t} />
      <Card t={t} />
      <div style={{position: 'absolute', left: 18, bottom: 6, fontFamily: 'Anton', fontSize: 15, color: 'rgba(255,255,255,0.75)', zIndex: 21}}>Fan-made simulation · Not affiliated with Rockstar Games</div>
      {(TL.flash as number[][]).filter((fl) => t >= fl[0] && t < fl[0] + fl[1]).map((fl, i) => <AbsoluteFill key={i} style={{background: fl[2] ? '#ff2020' : '#fff', opacity: (1 - (t - fl[0]) / fl[1]) * 0.55, zIndex: 40}} />)}
    </AbsoluteFill>
  );
};
export const gtaFrames = () => Math.round(TL.dur * 60);
