import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, continueRender, delayRender} from 'remotion';
import MAPJ from './map.json';
import ICJ from './icons.json';
import DJ from './da.json';

const fh = delayRender('fonts-da');
Promise.all([
  new FontFace('Lilita', `url(${staticFile('lilita.woff2')})`).load(),
  new FontFace('Fredoka', `url(${staticFile('fredoka700.woff2')})`, {weight: '700'}).load(),
  new FontFace('Luckiest', `url(${staticFile('luckiest.woff2')})`).load(),
]).then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(fh); });

const M = MAPJ as any; const IC = ICJ as Record<string, [number, string]>; const D = DJ as any;
export const DA_FRAMES = Math.round((D.dur ?? 10) * 30);
type P2 = [number, number];
const C0 = '#ff8a1f', C0D = '#c75a00', C1 = '#2f6fe0', C1D = '#173f94';
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const eio = (x: number) => { x = clamp01(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const eob = (x: number) => { x = clamp01(x); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const fmtM = (v: number) => '$' + Math.round(v).toLocaleString('en-US');
const fmtS = (v: number) => (v >= 1e6 ? `$${+(v / 1e6).toFixed(v >= 1e7 ? 0 : 1)}M` : v >= 1e3 ? `$${+(v / 1e3).toFixed(v >= 1e4 ? 0 : 1)}K` : `$${Math.round(v)}`);
const FONT = {fontFamily: 'Lilita'}; const F2 = {fontFamily: 'Fredoka', fontWeight: 700} as const;
const OUT = (w = 6, c = '#111') => ({WebkitTextStroke: `${w}px ${c}`, paintOrder: 'stroke fill'} as React.CSSProperties);

// ---------- iconos ----------
const Icon: React.FC<{n: string; x: number; y: number; s: number; col?: string; flip?: boolean; rot?: number; op?: number}> = ({n, x, y, s, col, flip, rot = 0, op = 1}) => {
  const e = IC[n]; if (!e) return null; const k = s / e[0];
  return <g transform={`translate(${x},${y}) rotate(${rot}) scale(${flip ? -k : k},${k}) translate(${-e[0] / 2},${-e[0] / 2})`} style={{color: col ?? '#fff'}} opacity={op} dangerouslySetInnerHTML={{__html: e[1]}} />;
};
const IconDiv: React.FC<{n: string; s: number; col?: string; style?: React.CSSProperties}> = ({n, s, col, style}) => (
  <svg width={s} height={s} style={{overflow: 'visible', ...style}}><Icon n={n} x={s / 2} y={s / 2} s={s} col={col} /></svg>);

// ---------- interpolación ----------
const camAt = (t: number) => {
  const K = D.cam as number[][]; let x = K[0][1], y = K[0][2], s = K[0][3];
  for (const [t0, x1, y1, s1, d] of K) {
    if (t < t0) break;
    const k = d <= 0 ? 1 : eio((t - t0) / d);
    x = x + (x1 - x) * k; y = y + (y1 - y) * k; s = Math.exp(Math.log(s) + (Math.log(s1) - Math.log(s)) * k);
  }
  // sacudida
  let sh = 0; for (const [t0, a, d] of (D.shake ?? []) as number[][]) if (t >= t0 && t < t0 + d) sh += a * (1 - (t - t0) / d);
  if (sh > 0) { x += Math.sin(t * 91) * sh / s; y += Math.cos(t * 77) * sh / s; }
  return {x, y, s};
};
const kv = (K: number[][] | undefined, t: number, def = 0) => { // [[t, v, d]] animado
  if (!K || !K.length) return def; let v = def;
  for (const [t0, v1, d = 0] of K) { if (t < t0) break; const k = d <= 0 ? 1 : eio((t - t0) / d); v = v + (v1 - v) * k; }
  return v;
};
const step = <T,>(K: [number, T][] | undefined, t: number, def: T): T => { let v = def; for (const [t0, v1] of K ?? []) { if (t < t0) break; v = v1; } return v; };
const posAt = (p: number[][], t: number): [number, number, number] => { // x, y, dir
  if (t <= p[0][0]) return [p[0][1], p[0][2], p.length > 1 ? Math.sign(p[1][1] - p[0][1]) : 1];
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i], b = p[i + 1];
    if (t <= b[0]) { const k = (t - a[0]) / Math.max(1e-6, b[0] - a[0]); return [a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k, Math.sign(b[1] - a[1]) || 1]; }
  }
  const l = p[p.length - 1], q = p[Math.max(0, p.length - 2)]; return [l[1], l[2], Math.sign(l[1] - q[1]) || 1];
};

// ---------- cara (emoji) ----------
const MOOD: Record<string, string> = {sleep: 'tw:sleeping-face', calm: 'tw:slightly-smiling-face', happy: 'tw:grinning-face', meh: 'tw:neutral-face', worried: 'tw:worried-face', scared: 'tw:fearful-face', panic: 'tw:face-screaming-in-fear',
  dead: 'tw:dizzy-face', angry: 'tw:face-with-steam-from-nose', rage: 'tw:pouting-face', cool: 'tw:smiling-face-with-sunglasses', cry: 'tw:loudly-crying-face', skull: 'tw:skull', cowboy: 'tw:cowboy-hat-face', clown: 'tw:clown-face'};

// ---------- unidades ----------
const UK: Record<string, {i: string; r: number; tok?: boolean; rotate?: boolean; air?: boolean}> = {
  rock: {i: 'tw:man', r: 20, tok: true}, guy: {i: 'tw:cowboy-hat-face', r: 20, tok: true}, soldier: {i: 'tw:military-helmet', r: 20, tok: true}, elite: {i: 'gi:rifle', r: 22, tok: true},
  guard: {i: 'tw:guard', r: 20, tok: true}, police: {i: 'tw:man-police-officer', r: 20, tok: true}, pcar: {i: 'tw:police-car', r: 26, tok: true}, moto: {i: 'tw:motorcycle', r: 22, tok: true},
  pickup: {i: 'tw:pickup-truck', r: 26, tok: true}, jeep: {i: 'gi:jeep', r: 26, tok: true}, apc: {i: 'gi:apc', r: 30, tok: true}, tank: {i: 'gi:battle-tank', r: 34, tok: true}, oldtank: {i: 'gi:tank', r: 32, tok: true},
  arty: {i: 'gi:cannon', r: 28, tok: true}, launcher: {i: 'gi:missile-launcher', r: 32, tok: true}, mortar: {i: 'gi:mortar', r: 24, tok: true},
  drone: {i: 'gi:delivery-drone', r: 16, tok: true, air: true}, heli: {i: 'tw:helicopter', r: 34, air: true}, jet: {i: 'gi:jet-fighter', r: 46, rotate: true, air: true}, bomber: {i: 'gi:stealth-bomber', r: 60, rotate: true, air: true},
  ship: {i: 'gi:battleship', r: 50, tok: true}, carrier: {i: 'gi:carrier', r: 70, tok: true}, boat: {i: 'tw:ship', r: 34}, para: {i: 'gi:parachute', r: 26, air: true}, dog: {i: 'tw:dog', r: 18},
};
const Unit: React.FC<{u: any; t: number; s: number}> = ({u, t, s}) => {
  const p = u.p as number[][]; if (t < p[0][0] || (u.out !== undefined && t > u.out + 0.4)) return null;
  const dieT = u.die as number | undefined; if (dieT !== undefined && t > dieT + 0.7) return null;
  const [x, y, dir] = posAt(p, Math.min(t, dieT ?? 1e9));
  const K = UK[u.k] ?? UK.soldier; const sc = u.sc ?? 1;
  const R = Math.max(K.r * sc * 1.55, (K.r / 20) * 15 / Math.max(s, 0.2));
  const born = clamp01((t - p[0][0]) / 0.3); const outk = u.out !== undefined ? clamp01((t - u.out) / 0.4) : 0;
  const dk = dieT !== undefined ? clamp01((t - dieT) / 0.7) : 0;
  const op = (1 - outk) * (1 - dk) * Math.min(1, born * 1.5);
  const col = u.s === 0 ? C0 : C1, colD = u.s === 0 ? C0D : C1D;
  const bob = K.air ? Math.sin(t * 5 + x) * 3 : 0;
  const scl = eob(born) * (1 + dk * 0.3);
  if (K.rotate) {
    const [x2, y2] = posAt(p, Math.min(t, dieT ?? 1e9) + 0.05); const ang = Math.atan2(y2 - y, x2 - x) * 180 / Math.PI + 90;
    return <g opacity={op}><ellipse cx={x + 18 / s} cy={y + 40 / s} rx={R * 0.5} ry={R * 0.25} fill="#0006" />
      <Icon n={K.i} x={x} y={y} s={R * 2 * scl} col={col} rot={ang} /><Icon n={K.i} x={x} y={y} s={R * 1.6 * scl} col={dk > 0 ? '#555' : col === C0 ? '#ffd29a' : '#a9c6ff'} rot={ang} op={0.5} /></g>;
  }
  if (!K.tok) return <g opacity={op}><ellipse cx={x} cy={y + R * 0.8} rx={R * 0.8} ry={R * 0.25} fill="#0005" />
    <circle cx={x} cy={y + bob} r={R * 1.05 * scl} fill={col} opacity={0.55} /><Icon n={K.i} x={x} y={y + bob} s={R * 1.9 * scl} flip={dir > 0 && u.k !== 'para'} /></g>;
  const gi = K.i.startsWith('gi:');
  return <g opacity={op}>
    {K.air ? <ellipse cx={x} cy={y + R * 1.3} rx={R * 0.7} ry={R * 0.22} fill="#0005" /> : null}
    <circle cx={x} cy={y + bob + R * 0.12} r={R * scl} fill="#0007" />
    <circle cx={x} cy={y + bob} r={R * scl} fill={dk > 0 ? '#666' : col} stroke={dk > 0 ? '#333' : colD} strokeWidth={R * 0.16} />
    <Icon n={K.i} x={x} y={y + bob} s={R * (gi ? 1.35 : 1.45) * scl} col="#fff" flip={!gi ? dir > 0 : dir < 0} />
    {dk > 0 ? <Icon n="tw:skull" x={x} y={y - R * 1.4 - dk * 20} s={R * 1.2} op={1 - dk} /> : null}
  </g>;
};

// ---------- efectos ----------
const Boom: React.FC<{x: number; y: number; r: number; k: number; seed: number}> = ({x, y, r, k, seed}) => {
  const a = 1 - k; const rr = r * (0.35 + 0.9 * Math.sqrt(k));
  return <g opacity={a}>
    <circle cx={x} cy={y} r={rr * 1.25} fill="#fff3b0" opacity={k < 0.15 ? 0.9 : 0} />
    <circle cx={x} cy={y} r={rr} fill="#ff7a1a" /><circle cx={x} cy={y} r={rr * 0.7} fill="#ffc93a" /><circle cx={x} cy={y} r={rr * 0.38} fill="#fff6c8" />
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const an = i * 0.785 + seed; const d = r * (0.4 + 1.3 * k); return <circle key={i} cx={x + Math.cos(an) * d} cy={y + Math.sin(an) * d} r={r * 0.16 * (1 - k)} fill="#3a2a22" />; })}
    <circle cx={x} cy={y} r={r * (0.6 + 1.6 * k)} fill="none" stroke="#fff" strokeWidth={r * 0.08 * (1 - k)} />
  </g>;
};
const Smoke: React.FC<{x: number; y: number; r: number; t: number; a: number}> = ({x, y, r, t, a}) => (
  <g opacity={a}>{[0, 1, 2, 3, 4].map((i) => { const ph = ((t * 0.45 + i / 5) % 1); return <circle key={i} cx={x + Math.sin(i * 2.1 + t) * r * 0.3 + ph * r * 0.6} cy={y - ph * r * 2.2} r={r * (0.35 + ph * 0.7)} fill="#3b3b40" opacity={0.55 * (1 - ph)} />; })}
    <circle cx={x} cy={y} r={r * 0.32} fill="#ff6a00" opacity={0.6 + 0.3 * Math.sin(t * 17 + x)} /></g>);

const World: React.FC<{t: number; cam: {x: number; y: number; s: number}}> = ({t, cam}) => {
  const s = cam.s;
  const terr = (D.terr ?? []) as number[][];
  const units = (D.units ?? []) as any[];
  const fx = D.fx ?? {};
  const occ = D.occ ?? {};
  const dead = D.bdead ?? {};
  const lw = (px: number) => px / s;
  return <svg width={1920} height={1080} style={{position: 'absolute'}}>
    <defs>
      <clipPath id="land"><path d={M.coast} /></clipPath>
      <clipPath id="left"><path d={M.clipL} /></clipPath>
      <radialGradient id="sea" cx="50%" cy="45%" r="75%"><stop offset="0" stopColor="#2a8fd8" /><stop offset="1" stopColor="#0f4d8f" /></radialGradient>
      <pattern id="wave" width="120" height="70" patternUnits="userSpaceOnUse"><path d="M10 35 q15 -12 30 0 t30 0" stroke="#ffffff22" strokeWidth="4" fill="none" /></pattern>
    </defs>
    <rect width={1920} height={1080} fill="url(#sea)" />
    <g transform={`translate(960,540) scale(${s}) translate(${-cam.x},${-cam.y})`}>
      <rect x={-3000} y={-3000} width={10000} height={9000} fill="url(#wave)" transform={`translate(${(t * 12) % 120},0)`} />
      {/* costa: aura */}
      <path d={M.coast} fill="none" stroke="#7fd3ff" strokeWidth={lw(14) + 30} opacity={0.35} />
      <path d={M.coast} fill="#e9dcb0" stroke="#f5ecc8" strokeWidth={22} />
      {/* gigante */}
      <path d={M.coast} fill={C1} opacity={0.92} />
      <g clipPath="url(#land)">
        <g clipPath="url(#left)"><rect x={-500} y={-500} width={3000} height={4000} fill={C0} /></g>
        {/* territorio conquistado */}
        {terr.map(([t0, t1, l0, l1, x, y, r], i) => { if (t < t0 || t > l1) return null; const k = eio((t - t0) / Math.max(0.01, t1 - t0)) * (1 - eio((t - l0) / Math.max(0.01, l1 - l0))); if (k <= 0) return null;
          return <circle key={i} cx={x} cy={y} r={r * k} fill={C0} opacity={0.9} />; })}
        {/* relieve */}
        {(M.mts as number[][]).map(([x, y, r], i) => <g key={i} opacity={0.5}><path d={`M${x - r},${y + r * 0.5} L${x},${y - r * 0.7} L${x + r},${y + r * 0.5} Z`} fill="#00000030" /><path d={`M${x - r * 0.28},${y - r * 0.28} L${x},${y - r * 0.7} L${x + r * 0.28},${y - r * 0.28} Z`} fill="#ffffffaa" /></g>)}
        {(M.trees as number[][]).map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#00000026" />)}
        {/* sombra interior */}
        <path d={M.coast} fill="none" stroke="#00000030" strokeWidth={40} />
      </g>
      {(M.lakes as string[]).map((d, i) => <path key={i} d={d} fill="#3aa0e8" stroke="#bfe7ff" strokeWidth={8} />)}
      {/* río frontera */}
      <path d={M.river} fill="none" stroke="#bfe7ff" strokeWidth={34} strokeLinecap="round" />
      <path d={M.river} fill="none" stroke="#3aa0e8" strokeWidth={22} strokeLinecap="round" />
      {/* carreteras */}
      {Object.values(M.roads as Record<string, string>).map((d, i) => <g key={i}><path d={d} fill="none" stroke="#00000055" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" /><path d={d} fill="none" stroke="#f3e6c4" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 0" /></g>)}
      {/* puente */}
      <rect x={M.P.bridge[0] - 34} y={M.P.bridge[1] - 14} width={68} height={28} rx={6} fill="#8a5a33" stroke="#4a2a12" strokeWidth={5} />
      {/* bases del gigante */}
      {(M.bases as any[]).map(([name, key, kind]: [string, string, string]) => { const [x, y] = M.P[key]; const dk = step(dead[key], t, 0) === 1;
        const ic = kind === 'fort' ? 'tw:castle' : kind === 'air' ? 'tw:airplane' : kind === 'navy' ? 'tw:anchor' : 'gi:cannon';
        return <g key={key}>
          {kind === 'air' ? <rect x={x - 120} y={y + 30} width={240} height={30} rx={6} fill="#555" stroke="#222" strokeWidth={4} transform={`rotate(-12 ${x} ${y})`} /> : null}
          <rect x={x - 46} y={y - 46} width={92} height={92} rx={18} fill={dk ? '#444' : C1D} stroke="#fff" strokeWidth={6} />
          <Icon n={dk ? 'tw:fire' : ic} x={x} y={y} s={70} col="#fff" />
          {dk ? <Smoke x={x} y={y - 20} r={60} t={t} a={1} /> : null}
          {s > 0.32 ? <text x={x} y={y + 80} textAnchor="middle" fontSize={Math.max(26, 15 / s)} style={{...FONT, ...OUT(Math.max(6, 4 / s) as any)}} fill="#fff">{name}</text> : null}
        </g>; })}
      {/* ciudades */}
      {(M.cities as any[]).map(([name, key, tier]: [string, string, number]) => { const [x, y] = M.P[key];
        const own = step(occ[key], t, 1) as number; const mood = step((D.moods ?? {})[key], t, 'calm') as string;
        const ic = tier === 3 ? 'tw:classical-building' : tier === 2 ? 'tw:cityscape' : tier === 1 ? 'tw:houses' : 'tw:house';
        const sz = [60, 80, 100, 130][tier]; const burn = step(dead[key], t, 0) === 1;
        return <g key={key}>
          <circle cx={x} cy={y} r={sz * 0.72} fill={own === 0 ? C0 : '#ffffff'} stroke={own === 0 ? C0D : C1D} strokeWidth={8} />
          <Icon n={burn ? 'tw:derelict-house' : ic} x={x} y={y} s={sz} />
          {burn ? <Smoke x={x + 10} y={y - 20} r={sz * 0.6} t={t} a={1} /> : null}
          {own === 0 ? <g><line x1={x + sz * 0.5} y1={y - sz * 0.2} x2={x + sz * 0.5} y2={y - sz * 1.05} stroke="#333" strokeWidth={6} /><rect x={x + sz * 0.5} y={y - sz * 1.05} width={sz * 0.55} height={sz * 0.36} fill={C0} stroke="#fff" strokeWidth={4} /></g> : null}
          <Icon n={MOOD[mood] ?? MOOD.calm} x={x - sz * 0.62} y={y - sz * 0.62} s={sz * 0.62} />
          {s > 0.3 ? <text x={x} y={y + sz * 0.72 + Math.max(34, 22 / s)} textAnchor="middle" fontSize={Math.max(30, (tier === 3 ? 24 : 17) / s)} style={{...FONT, ...OUT(Math.max(7, 4.5 / s) as any)}} fill="#fff">{name}</text> : null}
        </g>; })}
      {/* edificios construidos */}
      {(D.blds ?? []).map((b: any, i: number) => { if (t < b.t0 || (b.t1 !== undefined && t > b.t1 + 0.5)) return null;
        const k = (t - b.t0); const built = clamp01((k - 0.7) / 0.35); const outk = b.t1 !== undefined ? clamp01((t - b.t1) / 0.5) : 0; const sz = Math.max((b.sz ?? 80) * 1.45, 40 / s);
        const dk = b.dead !== undefined && t > b.dead;
        return <g key={i} opacity={1 - outk}>
          <ellipse cx={b.x} cy={b.y + sz * 0.42} rx={sz * 0.55} ry={sz * 0.16} fill="#0005" />
          {k < 0.8 ? <g><Icon n="tw:building-construction" x={b.x} y={b.y - (1 - clamp01(k / 0.25)) * 40} s={sz * 0.9} op={clamp01(k / 0.15)} />
            {[0, 1, 2].map((j) => <circle key={j} cx={b.x + (j - 1) * sz * 0.35} cy={b.y + sz * 0.3 - ((k * 3 + j / 3) % 1) * sz * 0.6} r={sz * 0.08} fill="#d9c9a8" opacity={0.8} />)}</g> : null}
          {built > 0 ? <Icon n={dk ? 'tw:fire' : b.k} x={b.x} y={b.y} s={sz * eob(built)} /> : null}
          {dk ? <Smoke x={b.x} y={b.y - 10} r={sz * 0.5} t={t} a={1} /> : null}
          {b.price && k > 0.8 && k < 3.2 ? <g opacity={clamp01((3.2 - k) / 0.4)} transform={`translate(${b.x},${b.y - sz * 0.75 - (k - 0.8) * 12})`}>
            <rect x={-sz * 0.75} y={-24} width={sz * 1.5} height={44} rx={12} fill="#1fae3e" stroke="#fff" strokeWidth={4} />
            <text y={10} textAnchor="middle" fontSize={30} style={FONT} fill="#fff">-{b.price}</text></g> : null}
        </g>; })}
      {/* rocas, disparos */}
      {(fx.rock ?? []).map(([t0, t1, x0, y0, x1, y1]: number[], i: number) => { if (t < t0 || t > t1) return null; const k = (t - t0) / (t1 - t0); const h = Math.hypot(x1 - x0, y1 - y0) * 0.35;
        return <Icon key={i} n="tw:rock" x={x0 + (x1 - x0) * k} y={y0 + (y1 - y0) * k - Math.sin(k * Math.PI) * h} s={22} rot={k * 400} />; })}
      {(fx.shot ?? []).map(([t0, x0, y0, x1, y1, c]: number[], i: number) => { const k = (t - t0) / 0.22; if (k < 0 || k > 1) return null;
        const a = clamp01(k * 1.5), b = clamp01(k * 1.5 - 0.5);
        return <g key={i}><line x1={x0 + (x1 - x0) * b} y1={y0 + (y1 - y0) * b} x2={x0 + (x1 - x0) * a} y2={y0 + (y1 - y0) * a} stroke={c === 1 ? '#9fd0ff' : '#fff3a0'} strokeWidth={5} strokeLinecap="round" />
          {k < 0.3 ? <circle cx={x0} cy={y0} r={9} fill="#fff6a0" /> : null}</g>; })}
      {(fx.splash ?? []).map(([t0, x, y]: number[], i: number) => { const k = (t - t0) / 0.8; if (k < 0 || k > 1) return null;
        return <g key={i} opacity={1 - k}><circle cx={x} cy={y} r={10 + 40 * k} fill="none" stroke="#e8f7ff" strokeWidth={6} /><circle cx={x} cy={y} r={5 + 22 * k} fill="none" stroke="#fff" strokeWidth={4} /></g>; })}
      {(fx.smoke ?? []).map(([t0, t1, x, y, r]: number[], i: number) => (t < t0 || t > t1 + 1) ? null : <Smoke key={i} x={x} y={y} r={r} t={t} a={Math.min(clamp01((t - t0) / 0.5), clamp01((t1 + 1 - t)))} />)}
      {/* unidades */}
      {units.filter((u) => !(UK[u.k]?.air)).map((u, i) => <Unit key={i} u={u} t={t} s={s} />)}
      {/* banderas de récord */}
      {(D.flags ?? []).map(([t0, x, y, lab]: [number, number, number, string], i: number) => { if (t < t0) return null; const k = eob((t - t0) / 0.5);
        return <g key={i} transform={`translate(${x},${y}) scale(${Math.max(1, 0.55 / s) * k})`}>
          <line x1={0} y1={0} x2={0} y2={-110} stroke="#222" strokeWidth={7} />
          <path d="M0,-110 L92,-90 L0,-66 Z" fill={C0} stroke="#fff" strokeWidth={5} />
          <rect x={-58} y={4} width={116} height={42} rx={12} fill="#111d" stroke={C0} strokeWidth={4} />
          <text y={36} textAnchor="middle" fontSize={32} style={FONT} fill="#fff">{lab}</text></g>; })}
      {/* misiles */}
      {(fx.msl ?? []).map(([t0, t1, x0, y0, x1, y1, h]: number[], i: number) => { if (t < t0 || t > t1 + 0.05) return null; const k = clamp01((t - t0) / (t1 - t0));
        const pt = (q: number) => [x0 + (x1 - x0) * q, y0 + (y1 - y0) * q - Math.sin(q * Math.PI) * (h ?? 300)];
        const [x, y] = pt(k); const [xa, ya] = pt(Math.min(1, k + 0.02)); const ang = Math.atan2(ya - y, xa - x) * 180 / Math.PI;
        const trail = Array.from({length: 14}, (_, j) => pt(Math.max(0, k - j * 0.025)));
        return <g key={i}><polyline points={trail.map((p) => p.join(',')).join(' ')} fill="none" stroke="#ffffffaa" strokeWidth={10} strokeLinecap="round" />
          <g transform={`translate(${x},${y}) rotate(${ang})`}><rect x={-26} y={-7} width={46} height={14} rx={7} fill="#eee" stroke="#333" strokeWidth={3} /><path d="M20,-7 L34,0 L20,7 Z" fill="#e5322d" /><circle cx={-30} cy={0} r={9} fill="#ffb02e" /></g></g>; })}
      {(fx.boom ?? []).map(([t0, x, y, r]: number[], i: number) => { const k = (t - t0) / 0.9; if (k < 0 || k > 1) return null; return <Boom key={i} x={x} y={y} r={r} k={k} seed={i} />; })}
      {/* aire por encima */}
      {units.filter((u) => UK[u.k]?.air).map((u, i) => <Unit key={'a' + i} u={u} t={t} s={s} />)}
      {/* bocadillos en el mundo */}
      {(D.bub ?? []).map(([t0, d, x, y, txt, side]: [number, number, number, number, string, number], i: number) => { if (t < t0 || t > t0 + d) return null; const k = eob((t - t0) / 0.3) * clamp01((t0 + d - t) / 0.2);
        const sc = Math.max(1, 0.7 / s) * k; const w = Math.max(120, txt.length * 22 + 50);
        return <g key={i} transform={`translate(${x},${y - 40}) scale(${sc})`}>
          <path d={`M-14,-6 L0,22 L14,-6 Z`} fill="#fff" stroke="#111" strokeWidth={5} />
          <rect x={-w / 2} y={-76} width={w} height={72} rx={22} fill="#fff" stroke={side === 1 ? C1D : side === 0 ? C0D : '#111'} strokeWidth={6} />
          <rect x={-10} y={-12} width={20} height={10} fill="#fff" />
          <text y={-28} textAnchor="middle" fontSize={40} style={FONT} fill="#111">{txt}</text></g>; })}
    </g>
  </svg>;
};

// ---------- escenas laterales (cinemática y "en directo") ----------
const Guy: React.FC<{x: number; y: number; col: string; s?: number; pose?: number; gun?: number; helmet?: boolean; flip?: boolean; dead?: number; face?: string}> = ({x, y, col, s = 1, pose = 0, gun = 0, helmet, flip, dead = 0, face}) => (
  <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s}) rotate(${dead * 85})`} opacity={1 - dead * 0.3}>
    <ellipse cx={0} cy={2} rx={34} ry={8} fill="#0004" />
    <rect x={-14} y={-50} width={11} height={50} rx={5} fill="#333" /><rect x={3} y={-50} width={11} height={50} rx={5} fill="#333" />
    <rect x={-22} y={-110} width={44} height={66} rx={16} fill={col} stroke="#111" strokeWidth={4} />
    <circle cx={0} cy={-136} r={28} fill="#ffd3a8" stroke="#111" strokeWidth={4} />
    <circle cx={9} cy={-140} r={4} fill="#111" /><path d="M2,-124 q8,5 16,0" stroke="#111" strokeWidth={3} fill="none" />
    {helmet ? <path d="M-30,-140 a30 30 0 0 1 60 0 Z" fill="#4b5d2e" stroke="#111" strokeWidth={4} /> : <path d="M-28,-146 q28,-28 56,0 q-28,-10 -56,0" fill="#5a3a1a" />}
    {face ? <g transform="translate(0,-136)" /> : null}
    {gun ? <g transform={`translate(10,-92) rotate(${-pose * 10})`}><rect x={0} y={-6} width={gun === 2 ? 76 : 44} height={12} rx={4} fill="#222" /><rect x={8} y={4} width={10} height={18} fill="#222" /></g>
      : <g transform={`translate(8,-98) rotate(${-150 + pose * 190})`}><rect x={0} y={-6} width={46} height={13} rx={6} fill={col} stroke="#111" strokeWidth={3} /><circle cx={48} cy={0} r={9} fill="#ffd3a8" stroke="#111" strokeWidth={3} /></g>}
  </g>);

const SideScene: React.FC<{type: string; t: number; w: number; h: number; money?: string}> = ({type, t, w, h, money}) => {
  const gy = h * 0.78; const night = type === 'missiles';
  const elems: React.ReactNode[] = [];
  if (type === 'rocks') {
    // 2 tipos tiran piedras a una valla
    for (let i = 0; i < 2; i++) { const ph = ((t * 0.9 + i * 0.5) % 1); const pose = ph < 0.3 ? 0 : ph < 0.45 ? (ph - 0.3) / 0.15 : 1 - (ph - 0.45) / 0.55;
      elems.push(<Guy key={'g' + i} x={w * 0.2 + i * 130} y={gy + i * 18} col={C0} s={1.3} pose={pose} />);
      const rk = (ph - 0.42) / 0.5; if (rk > 0 && rk < 1) elems.push(<g key={'r' + i}><Icon n="tw:rock" x={w * 0.2 + i * 130 + 60 + rk * w * 0.5} y={gy - 190 - Math.sin(rk * Math.PI) * 180 + rk * 120} s={44} rot={rk * 700} /></g>); }
    elems.push(<g key="fence">{Array.from({length: 9}, (_, i) => <rect key={i} x={w * 0.78 + i * 26} y={gy - 160} width={16} height={160} fill="#8a6a4a" stroke="#3a2a1a" strokeWidth={3} />)}<rect x={w * 0.77} y={gy - 120} width={w * 0.25} height={16} fill="#8a6a4a" /></g>);
    elems.push(<Guy key="gd" x={w * 0.93} y={gy} col={C1} s={1.2} flip pose={0.2} gun={1} />);
  } else if (type === 'guns') {
    for (let i = 0; i < 6; i++) { const fire = Math.sin(t * 22 + i * 1.7) > 0.6; const x = w * 0.08 + (i % 3) * 120 + (i > 2 ? 60 : 0); const y = gy - (i > 2 ? 40 : 0);
      elems.push(<Guy key={'s' + i} x={x} y={y} col={C0} s={1.0} gun={2} helmet pose={0} />);
      if (fire) elems.push(<g key={'f' + i}><circle cx={x + 96} cy={y - 92} r={14} fill="#fff6a0" /><line x1={x + 100} y1={y - 92} x2={x + 100 + w * 0.5} y2={y - 92 - 20 + (i % 3) * 14} stroke="#fff3a0" strokeWidth={4} opacity={0.8} /></g>); }
    elems.push(<g key="pk" transform={`translate(${w * 0.36},${gy - 20})`}><Icon n="tw:pickup-truck" x={0} y={-50} s={150} flip /></g>);
    for (let i = 0; i < 4; i++) { const hit = ((t * 1.3 + i * 0.37) % 1) < 0.12; elems.push(<g key={'e' + i}><Guy x={w * 0.72 + i * 70} y={gy - (i % 2) * 30} col={C1} s={0.9} flip gun={2} helmet />{hit ? <circle cx={w * 0.72 + i * 70} cy={gy - 120} r={40} fill="#ffb02e" opacity={0.8} /> : null}</g>); }
  } else {
    // misiles y cazas sobre una ciudad
    elems.push(<g key="city" opacity={0.95}>{Array.from({length: 12}, (_, i) => { const bw = 70 + (i * 37) % 50, bh = 120 + (i * 53) % 160; return <rect key={i} x={w * 0.55 + i * 75} y={gy - bh} width={bw} height={bh} fill="#1a2440" stroke="#2c3a66" strokeWidth={3} />; })}</g>);
    for (let i = 0; i < 3; i++) { const x = w * 0.08 + i * 160; elems.push(<g key={'l' + i} transform={`translate(${x},${gy})`}><rect x={-70} y={-40} width={150} height={40} rx={8} fill="#5b6b3a" stroke="#222" strokeWidth={4} /><circle cx={-40} cy={0} r={14} fill="#222" /><circle cx={40} cy={0} r={14} fill="#222" /><rect x={-50} y={-90} width={110} height={30} rx={8} fill="#6d7d48" stroke="#222" strokeWidth={4} transform="rotate(-35)" /></g>); }
    for (let j = 0; j < 7; j++) { const ph = ((t * 0.55 + j / 7) % 1); const x0 = w * 0.1 + (j % 3) * 160, y0 = gy - 90, x1 = w * 0.6 + (j * 97) % (w * 0.35), y1 = gy - 60;
      const px = x0 + (x1 - x0) * ph, py = y0 + (y1 - y0) * ph - Math.sin(ph * Math.PI) * h * 0.55;
      elems.push(<g key={'m' + j}>{ph < 0.92 ? <circle cx={px} cy={py} r={10} fill="#ffcf4a" /> : <circle cx={x1} cy={y1} r={60 + (ph - 0.92) * 900} fill="#ff7a1a" opacity={1 - (ph - 0.92) / 0.08} />}
        {Array.from({length: 8}, (_, q) => { const p2 = Math.max(0, ph - q * 0.02); return <circle key={q} cx={x0 + (x1 - x0) * p2} cy={y0 + (y1 - y0) * p2 - Math.sin(p2 * Math.PI) * h * 0.55} r={8 + q * 2} fill="#fff" opacity={0.35 - q * 0.04} />; })}</g>); }
    for (let j = 0; j < 3; j++) { const ph = ((t * 0.35 + j / 3) % 1); elems.push(<Icon key={'j' + j} n="gi:jet-fighter" x={-200 + ph * (w + 400)} y={h * 0.18 + j * 60} s={110} col="#c9d3e6" rot={90} />); }
  }
  return <svg width={w} height={h} style={{display: 'block'}}>
    <defs><linearGradient id={'sk' + type} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={night ? '#0b1030' : '#6ec6ff'} /><stop offset="1" stopColor={night ? '#47306a' : '#d8f1ff'} /></linearGradient></defs>
    <rect width={w} height={h} fill={`url(#sk${type})`} />
    {night ? null : <circle cx={w * 0.85} cy={h * 0.18} r={60} fill="#fff3a0" />}
    <path d={`M0,${gy - 120} Q${w * 0.25},${gy - 220} ${w * 0.5},${gy - 130} T${w},${gy - 150} L${w},${h} L0,${h} Z`} fill={night ? '#2a2550' : '#8fd27a'} opacity={0.7} />
    <rect y={gy} width={w} height={h - gy} fill={night ? '#3b3a2a' : '#6cb85a'} /><rect y={gy} width={w} height={10} fill="#00000030" />
    {elems}
    {money ? <g><rect x={30} y={30} width={360} height={100} rx={22} fill="#111c" stroke="#1fae3e" strokeWidth={6} /><text x={210} y={104} textAnchor="middle" fontSize={70} style={FONT} fill="#5dff8a">{money}</text></g> : null}
  </svg>;
};

// ---------- HUD ----------
const LEVELS = ['$1', '$100', '$1K', '$10K', '$100K', '$1M', '$100M'];
const THREAT = [['BORED', 'tw:sleeping-face'], ['GUARDS', 'tw:neutral-face'], ['POLICE', 'tw:face-with-steam-from-nose'], ['ARMY', 'tw:pouting-face'], ['AIR FORCE', 'tw:pouting-face'], ['TOTAL WAR', 'tw:face-screaming-in-fear']];
const Hud: React.FC<{t: number}> = ({t}) => {
  const vis = (D.hud ?? []).some(([a, b]: number[]) => t >= a && t <= b); if (!vis) return null;
  const hk = Math.min(...(D.hud as number[][]).filter(([a, b]) => t >= a && t <= b).map(([a, b]) => Math.min(clamp01((t - a) / 0.4), clamp01((b - t) / 0.4))));
  const money = kv(D.money, t, 0); const lvl = step(D.level, t, 0) as number; const thr = kv(D.threat, t, 0); const ti = Math.round(thr);
  const dist = kv(D.dist, t, 0); const dmg = kv(D.dmg, t, 0); const res = (D.lres ?? {}) as Record<string, number[]>;
  const recs = (D.flags ?? []).filter((f: any) => t >= f[0]);
  return <AbsoluteFill style={{opacity: hk}}>
    {/* dinero */}
    <div style={{position: 'absolute', left: 26, top: 22, background: '#111d', border: `5px solid ${C0}`, borderRadius: 22, padding: '8px 22px 10px', minWidth: 330}}>
      <div style={{...F2, color: C0, fontSize: 24, letterSpacing: 1}}>THE CHALLENGER</div>
      <div style={{...FONT, color: '#5dff8a', fontSize: 58, lineHeight: 1}}>{fmtM(money)}</div>
      <div style={{height: 4, background: '#fff2', margin: '8px 0 6px'}} />
      <div style={{...F2, color: '#8fb6ff', fontSize: 22}}>THE GIANT</div>
      <div style={{...FONT, color: '#cfe0ff', fontSize: 36, lineHeight: 1}}>$50,000,000</div>
    </div>
    {/* escalera de niveles */}
    <div style={{position: 'absolute', right: 24, top: 22, display: 'flex', flexDirection: 'column', gap: 6}}>
      {LEVELS.map((l, i) => { const cur = i === lvl; const r = res[i] ? step(res[i] as any, t, 0) : 0;
        return <div key={i} style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8}}>
          {r ? <IconDiv n={r === 2 ? 'tw:trophy' : 'tw:chequered-flag'} s={34} /> : null}
          <div style={{...FONT, fontSize: cur ? 38 : 28, color: cur ? '#111' : '#fff', background: cur ? '#ffd23f' : i < lvl ? '#555c' : '#111b', border: `4px solid ${cur ? '#fff' : '#fff5'}`, borderRadius: 14, padding: '0 14px', minWidth: 110, textAlign: 'center'}}>{l}</div></div>; })}
    </div>
    {/* distancia a la capital */}
    <div style={{position: 'absolute', left: 560, top: 26, width: 800}}>
      <div style={{...F2, color: '#fff', fontSize: 24, textAlign: 'center', ...OUT(5)}}>DISTANCE TO THE CAPITAL</div>
      <div style={{position: 'relative', height: 34, background: '#111c', border: '4px solid #fff', borderRadius: 18, marginTop: 4}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${dist * 100}%`, background: `linear-gradient(90deg, ${C0D}, ${C0})`, borderRadius: 14}} />
        {recs.map((f: any, i: number) => <div key={i} style={{position: 'absolute', left: `${f[4] * 100}%`, top: -4, transform: 'translateX(-50%)', textAlign: 'center'}}>
          <div style={{width: 4, height: 34, background: '#fff', margin: '0 auto'}} /><div style={{...FONT, fontSize: 18, color: '#fff', ...OUT(4)}}>{f[3]}</div></div>)}
        <div style={{position: 'absolute', right: -40, top: -26}}><IconDiv n="tw:classical-building" s={70} /></div>
      </div>
    </div>
    {/* amenaza */}
    <div style={{position: 'absolute', left: 26, bottom: 24, background: '#111d', border: `5px solid ${C1}`, borderRadius: 22, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 14}}>
      <div style={{position: 'relative'}}><IconDiv n={THREAT[ti][1]} s={84} /><div style={{position: 'absolute', top: -26, left: 10}}><IconDiv n="tw:crown" s={60} /></div></div>
      <div>
        <div style={{...F2, color: '#8fb6ff', fontSize: 22}}>GIANT THREAT LEVEL</div>
        <div style={{display: 'flex', gap: 5, marginTop: 6}}>{THREAT.map((_, i) => <div key={i} style={{width: 44, height: 22, borderRadius: 6, background: i <= thr + 0.01 ? ['#3b86ff', '#1fae3e', '#ffcc00', '#ff6a00', '#e5322d', '#8a1cff'][i] : '#fff2', border: '2px solid #fff6'}} />)}</div>
        <div style={{...FONT, color: '#fff', fontSize: 34, marginTop: 2}}>{THREAT[ti][0]}</div>
      </div>
    </div>
    {/* daño */}
    {dmg > 0 ? <div style={{position: 'absolute', right: 26, bottom: 24, background: '#111d', border: '5px solid #e5322d', borderRadius: 22, padding: '8px 22px', textAlign: 'right'}}>
      <div style={{...F2, color: '#ff8a80', fontSize: 22}}>DAMAGE TO THE GIANT</div>
      <div style={{...FONT, color: '#fff', fontSize: 50, lineHeight: 1.05}}>{fmtM(dmg)}</div></div> : null}
  </AbsoluteFill>;
};

// ---------- tarjetas ----------
const Pop: React.FC<{t: number; t0: number; d: number; children: React.ReactNode; style?: React.CSSProperties; from?: 'up' | 'down' | 'scale' | 'right'}> = ({t, t0, d, children, style, from = 'scale'}) => {
  const k = eob((t - t0) / 0.35); const o = clamp01((t0 + d - t) / 0.25); const kk = clamp01((t - t0) / 0.35);
  const tr = from === 'scale' ? `scale(${0.4 + 0.6 * k})` : from === 'up' ? `translateY(${(1 - k) * -200}px)` : from === 'right' ? `translateX(${(1 - k) * 700}px)` : `translateY(${(1 - k) * 260}px)`;
  return <div style={{opacity: Math.min(o, kk * 2), transform: tr, ...style}}>{children}</div>;
};
const Card: React.FC<{c: any; t: number}> = ({c, t}) => {
  const lt = t - c.t;
  if (c.type === 'big') return <AbsoluteFill style={{alignItems: 'center', justifyContent: c.pos === 'top' ? 'flex-start' : c.pos === 'bottom' ? 'flex-end' : 'center', paddingTop: c.pos === 'top' ? 150 : 0, paddingBottom: c.pos === 'bottom' ? 150 : 0}}>
    <Pop t={t} t0={c.t} d={c.d} style={{textAlign: 'center'}}>
      <div style={{...FONT, fontSize: c.fs ?? 110, color: c.col ?? '#fff', ...OUT(14), lineHeight: 1.0, transform: `rotate(${c.rot ?? 0}deg)`}}>{c.text}</div>
      {c.sub ? <div style={{...FONT, fontSize: (c.fs ?? 110) * 0.45, color: c.subcol ?? '#ffd23f', ...OUT(9), marginTop: 10}}>{c.sub}</div> : null}
    </Pop></AbsoluteFill>;
  if (c.type === 'level') {
    const notes = Array.from({length: 26}, (_, i) => i);
    return <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', background: `rgba(0,0,0,${0.55 * clamp01(lt / 0.2) * clamp01((c.d - lt) / 0.3)})`}}>
      {notes.map((i) => { const x = (i * 211) % 1920; const y = ((lt * (420 + (i % 5) * 80)) + i * 97) % 1300 - 150; return <div key={i} style={{position: 'absolute', left: x, top: y, transform: `rotate(${(lt * 120 + i * 40) % 360}deg)`, opacity: clamp01((c.d - lt) / 0.3)}}><IconDiv n="tw:dollar-banknote" s={80} /></div>; })}
      <Pop t={t} t0={c.t} d={c.d} style={{textAlign: 'center'}}>
        <div style={{...FONT, fontSize: 70, color: '#ffd23f', ...OUT(10)}}>LEVEL {c.n}</div>
        <div style={{...FONT, fontSize: 230, color: '#5dff8a', ...OUT(18), lineHeight: 0.95}}>{c.money}</div>
        {c.sub ? <div style={{...F2, fontSize: 46, color: '#fff', ...OUT(8)}}>{c.sub}</div> : null}
      </Pop></AbsoluteFill>;
  }
  if (c.type === 'recruit') return <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 30}}>
    <Pop t={t} t0={c.t} d={c.d} from="down" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{...FONT, fontSize: 46, color: '#fff', background: '#1fae3e', border: '5px solid #fff', borderRadius: 18, padding: '2px 26px', marginBottom: 12, ...OUT(6)}}>{c.title ?? 'HIRING'}</div>
      <div style={{display: 'flex', gap: 14}}>{c.items.map((it: any, i: number) => { const k = eob((lt - 0.3 - i * (c.gap ?? 0.45)) / 0.35); if (k <= 0) return <div key={i} style={{width: 210}} />;
        return <div key={i} style={{width: 210, background: '#fff6e3', border: '5px solid #111', borderRadius: 18, padding: 10, textAlign: 'center', transform: `scale(${k}) rotate(${(i % 2 ? 2 : -2)}deg)`}}>
          <div style={{background: it.bg ?? '#ffd8a8', borderRadius: 12, padding: 6}}><IconDiv n={it.i} s={96} /></div>
          <div style={{...FONT, fontSize: 32, color: '#111', marginTop: 4}}>{it.name}</div>
          {it.note ? <div style={{...F2, fontSize: 20, color: '#555', lineHeight: 1.1}}>{it.note}</div> : null}
          <div style={{...FONT, fontSize: 30, color: '#1a8a3a'}}>{it.pay}</div></div>; })}</div>
    </Pop></AbsoluteFill>;
  if (c.type === 'shop') { const tot = c.items.length;
    return <AbsoluteFill style={{alignItems: 'flex-end', justifyContent: 'center', paddingRight: 40}}>
      <Pop t={t} t0={c.t} d={c.d} from="right" style={{width: 470, background: '#fffdf5', border: '5px solid #111', borderRadius: 10, padding: '18px 22px', boxShadow: '0 12px 0 #0005', maskImage: 'none'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}><IconDiv n="tw:shopping-cart" s={54} /><div style={{...FONT, fontSize: 44, color: '#111'}}>{c.title ?? 'SHOPPING LIST'}</div></div>
        <div style={{borderTop: '4px dashed #999', margin: '8px 0'}} />
        {c.items.map((it: any, i: number) => { const k = clamp01((lt - 0.35 - i * (c.gap ?? 0.4)) / 0.2); return <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10, opacity: k, transform: `translateX(${(1 - k) * 40}px)`, height: 52}}>
          <IconDiv n={it.i} s={42} /><div style={{...F2, fontSize: 28, color: '#222', flex: 1}}>{it.name}</div><div style={{...FONT, fontSize: 30, color: it.price === 'FREE' ? '#1a8a3a' : '#c0392b'}}>{it.price}</div></div>; })}
        <div style={{borderTop: '4px dashed #999', margin: '8px 0'}} />
        <div style={{display: 'flex', justifyContent: 'space-between', opacity: clamp01((lt - 0.4 - tot * (c.gap ?? 0.4)) / 0.2)}}><div style={{...FONT, fontSize: 38}}>TOTAL</div><div style={{...FONT, fontSize: 38, color: '#c0392b'}}>{c.total}</div></div>
      </Pop></AbsoluteFill>; }
  if (c.type === 'ready') return <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
    <Pop t={t} t0={c.t} d={c.d} style={{background: '#111e', border: `6px solid ${C0}`, borderRadius: 28, padding: '22px 40px', textAlign: 'center'}}>
      <div style={{...FONT, fontSize: 76, color: C0, ...OUT(8)}}>ARMY READY</div>
      <div style={{display: 'flex', gap: 26, justifyContent: 'center', marginTop: 10}}>{c.lines.map(([ic, n, lab]: [string, string, string], i: number) => <div key={i} style={{textAlign: 'center'}}>
        <IconDiv n={ic} s={84} /><div style={{...FONT, fontSize: 48, color: '#fff'}}>{n}</div><div style={{...F2, fontSize: 22, color: '#ccc'}}>{lab}</div></div>)}</div>
    </Pop></AbsoluteFill>;
  if (c.type === 'predict') { const cd = Math.max(0, Math.ceil(c.d - 0.4 - lt));
    return <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', background: `rgba(0,0,0,${0.45 * clamp01(lt / 0.2) * clamp01((c.d - lt) / 0.25)})`}}>
      <Pop t={t} t0={c.t} d={c.d} style={{textAlign: 'center'}}>
        <div style={{...FONT, fontSize: 96, color: '#fff', ...OUT(12)}}>HOW FAR WILL THEY GET?</div>
        <div style={{display: 'flex', gap: 30, justifyContent: 'center', marginTop: 24}}>{c.opts.map((o: string, i: number) => <div key={i} style={{...FONT, fontSize: 46, color: '#111', background: ['#5dff8a', '#ffd23f', '#ff8a80'][i], border: '6px solid #111', borderRadius: 20, padding: '12px 30px', transform: `scale(${eob((lt - 0.25 - i * 0.15) / 0.3)})`}}>{['A', 'B', 'C'][i]}. {o}</div>)}</div>
        <div style={{...FONT, fontSize: 120, color: '#ffd23f', ...OUT(12), marginTop: 10}}>{cd > 0 ? cd : ''}</div>
      </Pop></AbsoluteFill>; }
  if (c.type === 'result') return <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', background: `rgba(0,0,0,${0.5 * clamp01(lt / 0.2) * clamp01((c.d - lt) / 0.25)})`}}>
    <Pop t={t} t0={c.t} d={c.d} style={{background: '#fff6e3', border: '8px solid #111', borderRadius: 30, padding: '24px 50px', minWidth: 880, textAlign: 'center', boxShadow: '0 16px 0 #0007'}}>
      <div style={{...FONT, fontSize: 44, color: '#666'}}>LEVEL {c.n} · {c.money} ARMY</div>
      <div style={{...FONT, fontSize: 96, color: c.win ? '#1a8a3a' : '#c0392b', lineHeight: 1}}>{c.verdict}</div>
      <div style={{display: 'flex', gap: 22, justifyContent: 'center', marginTop: 18}}>{c.stats.map(([ic, v, lab]: [string, string, string], i: number) => <div key={i} style={{background: '#111', borderRadius: 18, padding: '10px 18px', minWidth: 170, opacity: clamp01((lt - 0.4 - i * 0.25) / 0.2)}}>
        <IconDiv n={ic} s={50} /><div style={{...FONT, fontSize: 42, color: '#fff'}}>{v}</div><div style={{...F2, fontSize: 20, color: '#aaa'}}>{lab}</div></div>)}</div>
    </Pop></AbsoluteFill>;
  if (c.type === 'caption') return <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: c.y ?? 160}}>
    <Pop t={t} t0={c.t} d={c.d} from="down"><div style={{...FONT, fontSize: c.fs ?? 54, color: '#fff', background: c.bg ?? '#111d', border: `5px solid ${c.bc ?? '#fff'}`, borderRadius: 22, padding: '8px 30px', textAlign: 'center'}}>{c.text}</div></Pop></AbsoluteFill>;
  if (c.type === 'alert') { const fl = Math.sin(lt * 14) > 0;
    return <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-start', paddingTop: 200}}>
      <AbsoluteFill style={{boxShadow: `inset 0 0 ${fl ? 160 : 80}px ${c.col ?? '#e5322d'}`, opacity: clamp01((c.d - lt) / 0.3)}} />
      <Pop t={t} t0={c.t} d={c.d} from="up"><div style={{...FONT, fontSize: 80, color: '#fff', background: c.col ?? '#e5322d', border: '7px solid #fff', borderRadius: 24, padding: '6px 40px', ...OUT(8)}}>{c.text}</div>
        {c.sub ? <div style={{...F2, fontSize: 38, color: '#fff', textAlign: 'center', ...OUT(7), marginTop: 6}}>{c.sub}</div> : null}</Pop></AbsoluteFill>; }
  if (c.type === 'pip') { const k = eob(lt / 0.4) * clamp01((c.d - lt) / 0.3);
    return <div style={{position: 'absolute', right: 40, top: 300, width: 640, height: 400, border: '8px solid #fff', borderRadius: 24, overflow: 'hidden', transform: `scale(${k})`, transformOrigin: 'right center', boxShadow: '0 14px 0 #0006'}}>
      <SideScene type={c.scene} t={lt} w={640} h={400} />
      <div style={{position: 'absolute', left: 14, top: 12, ...FONT, fontSize: 30, color: '#fff', background: '#e5322d', borderRadius: 10, padding: '0 12px'}}>● LIVE</div>
      {c.label ? <div style={{position: 'absolute', left: 0, right: 0, bottom: 10, textAlign: 'center', ...FONT, fontSize: 36, color: '#fff', ...OUT(7)}}>{c.label}</div> : null}</div>; }
  if (c.type === 'rules') return <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', background: `rgba(0,0,0,${0.5 * clamp01(lt / 0.3) * clamp01((c.d - lt) / 0.3)})`}}>
    <div style={{display: 'flex', gap: 36}}>{c.items.map(([ic, h, s]: string[], i: number) => <Pop key={i} t={t} t0={c.t + i * 0.9} d={c.d - i * 0.9} style={{width: 470, background: '#fff6e3', border: '7px solid #111', borderRadius: 28, padding: 24, textAlign: 'center'}}>
      <div style={{...FONT, fontSize: 40, color: '#888'}}>RULE {i + 1}</div><IconDiv n={ic} s={150} /><div style={{...FONT, fontSize: 58, color: '#111'}}>{h}</div><div style={{...F2, fontSize: 30, color: '#444'}}>{s}</div></Pop>)}</div></AbsoluteFill>;
  if (c.type === 'final') return <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', background: `rgba(0,0,0,${0.6 * clamp01(lt / 0.3)})`}}>
    <Pop t={t} t0={c.t} d={c.d} style={{textAlign: 'center'}}>
      <div style={{...FONT, fontSize: 84, color: '#ffd23f', ...OUT(10)}}>{c.title}</div>
      <div style={{display: 'flex', gap: 14, alignItems: 'flex-end', marginTop: 20, height: 520}}>{c.rows.map(([lab, pct, txt, win]: [string, number, string, number], i: number) => { const k = eio((lt - 0.5 - i * 0.35) / 0.6);
        return <div key={i} style={{width: 210, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%'}}>
          <div style={{...FONT, fontSize: 30, color: '#fff', ...OUT(6), opacity: k}}>{txt}</div>
          <div style={{width: 150, height: Math.max(8, 400 * pct * k), background: win ? 'linear-gradient(#ffd23f,#ff8a1f)' : `linear-gradient(${C0},${C0D})`, border: '5px solid #fff', borderRadius: '16px 16px 0 0', position: 'relative'}}>
            {win && k > 0.9 ? <div style={{position: 'absolute', top: -90, left: 30}}><IconDiv n="tw:trophy" s={84} /></div> : null}</div>
          <div style={{...FONT, fontSize: 44, color: '#5dff8a', ...OUT(7), marginTop: 6}}>{lab}</div></div>; })}</div>
    </Pop></AbsoluteFill>;
  return null;
};

// ---------- composición ----------
export const DollarArmy: React.FC<{audio?: boolean}> = ({audio = true}) => {
  const f = useCurrentFrame(); const t = f / 30;
  const cam = camAt(t);
  const cine = ((D.cine ?? []) as any[]).find((c) => t >= c[0] && t < c[1]);
  const fl = ((D.flash ?? []) as number[][]).reduce((a, [t0, d]) => Math.max(a, t >= t0 && t < t0 + d ? 1 - (t - t0) / d : 0), 0);
  return <AbsoluteFill style={{background: '#0f4d8f'}}>
    {audio && D.audio ? <Audio src={staticFile(D.audio)} /> : null}
    <World t={t} cam={cam} />
    <Hud t={t} />
    {((D.cards ?? []) as any[]).filter((c) => t >= c.t && t < c.t + c.d).map((c, i) => <Card key={i} c={c} t={t} />)}
    {cine ? <AbsoluteFill><SideScene type={cine[2]} t={t - cine[0]} w={1920} h={1080} money={cine[3]} />
      {cine[4] ? <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 70}}><div style={{...FONT, fontSize: 80, color: '#fff', ...OUT(12)}}>{cine[4]}</div></AbsoluteFill> : null}</AbsoluteFill> : null}
    {fl > 0 ? <AbsoluteFill style={{background: '#fff', opacity: fl}} /> : null}
  </AbsoluteFill>;
};
