import React from 'react';
import {Easing, interpolate, spring, staticFile, delayRender, continueRender} from 'remotion';
import {Flag} from './flags';

// ================= fuentes =================
const fontHandle = delayRender('fonts3');
Promise.all([
  new FontFace('Lilita', `url(${staticFile('lilita.woff2')})`).load(),
  new FontFace('Lilita', `url(${staticFile('lilita-ext.woff2')})`, {unicodeRange: 'U+0100-024F'}).load(),
  new FontFace('Fredoka', `url(${staticFile('fredoka600.woff2')})`, {weight: '600'}).load(),
  new FontFace('Luckiest', `url(${staticFile('luckiest.woff2')})`).load(),
  new FontFace('Anton', `url(${staticFile('anton.woff2')})`).load(),
  new FontFace('Bungee', `url(${staticFile('bungee.woff2')})`).load(),
  new FontFace('Fredoka', `url(${staticFile('fredoka700.woff2')})`, {weight: '700'}).load(),
  new FontFace('Fredoka', `url(${staticFile('fredoka600-ext.woff2')})`, {weight: '600', unicodeRange: 'U+0100-024F'}).load(),
  new FontFace('Fredoka', `url(${staticFile('fredoka700-ext.woff2')})`, {weight: '700', unicodeRange: 'U+0100-024F'}).load(),
]).then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(fontHandle); });

export type P = [number, number];
export type Cam = {cx: number; cy: number; s: number};
export const INK = '#1d1d1d', CREAM = '#fff6e3', RED = '#e5322d', BLUE = '#1f6fe0', GREEN = '#22a95b', YELLOW = '#ffd23f', ORANGE = '#ff8a1f', PURPLE = '#7b2cbf';
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ease = Easing.inOut(Easing.cubic);
export const lerp = (x: number, a: number, b: number, v0: number, v1: number, e: (t: number) => number = ease) => (a === b ? (x >= b ? v1 : v0) : interpolate(x, [a, b], [v0, v1], {...clamp, easing: e}));
export const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
export const font = {fontFamily: 'Lilita'};
export const font2 = {fontFamily: 'Fredoka', fontWeight: 700} as const;
export const toScreen = (p: P, cam: Cam): P => [960 + (p[0] - cam.cx) * cam.s, 540 + (p[1] - cam.cy) * cam.s];
// spring en segundos (t = tiempo actual, start = inicio)
export const popT = (t: number, start: number, damping = 12) => (t < start ? 0 : spring({frame: (t - start) * 30, fps: 30, config: {damping, stiffness: 150}}));
// interpolación por tramos
export const piece = (t: number, pts: [number, number][], e: (x: number) => number = Easing.linear) => {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) if (t < pts[i + 1][0]) return lerp(t, pts[i][0], pts[i + 1][0], pts[i][1], pts[i + 1][1], e);
  return pts[pts.length - 1][1];
};

// ---------- trayectorias ----------
export const smoothPath = (pts: P[], steps = 12): P[] => {
  if (pts.length < 3) return pts;
  const out: P[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < steps; k++) {
      const t = k / steps, t2 = t * t, t3 = t2 * t;
      out.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};
export const arcPath = (a: P, b: P, bend: number, n = 24): P[] => {
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
  const c: P = [(a[0] + b[0]) / 2 - (dy / len) * bend, (a[1] + b[1]) / 2 + (dx / len) * bend];
  const out: P[] = [];
  for (let i = 0; i <= n; i++) { const t = i / n; out.push([(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]]); }
  return out;
};
// recorta una polilínea a la fracción p de su longitud; devuelve puntos, punta y rumbo
export const partial = (pts: P[], p: number) => {
  const seg: number[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); total += l; }
  let left = total * Math.max(0, Math.min(1, p));
  const out: P[] = [pts[0]];
  let ang = 0;
  for (let i = 0; i < seg.length; i++) {
    const a = pts[i], b = pts[i + 1];
    ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    if (left >= seg[i]) { out.push(b); left -= seg[i]; continue; }
    const k = seg[i] ? left / seg[i] : 0;
    out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
    break;
  }
  return {pts: out, tip: out[out.length - 1], ang};
};
const d = (pts: P[]) => 'M' + pts.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' L');

// flecha que se dibuja sobre una ruta
export const PathArrow: React.FC<{pts: P[]; t: number; t0: number; t1: number; color: string; w: number; fadeAfter?: number}> = ({pts, t, t0, t1, color, w, fadeAfter = 3}) => {
  if (t < t0) return null;
  const fade = lerp(t, t1 + fadeAfter, t1 + fadeAfter + 1, 1, 0);
  if (fade <= 0) return null;
  const p = lerp(t, t0, t1, 0, 1, Easing.inOut(Easing.sin));
  const {pts: q, tip, ang} = partial(pts, p);
  if (q.length < 2) return null;
  const hl = w * 2.3, hw = w * 1.9;
  const head = `M${tip[0] + Math.cos(ang) * hl * 0.7},${tip[1] + Math.sin(ang) * hl * 0.7} L${tip[0] + Math.cos(ang + 2.4) * hw},${tip[1] + Math.sin(ang + 2.4) * hw} L${tip[0] + Math.cos(ang - 2.4) * hw},${tip[1] + Math.sin(ang - 2.4) * hw} Z`;
  return (
    <g opacity={fade}>
      <path d={d(q)} fill="none" stroke={INK} strokeWidth={w * 1.6} strokeLinecap="round" strokeLinejoin="round" />
      <path d={head} fill={INK} stroke={INK} strokeWidth={w * 0.6} strokeLinejoin="round" />
      <path d={d(q)} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      <path d={head} fill={color} />
    </g>
  );
};

// ---------- iconos de unidades (tamaño constante en pantalla: escala inv) ----------
export const TankToken: React.FC<{p: P; code: string; inv: number; alpha?: number; flip?: boolean}> = ({p, code, inv, alpha = 1, flip}) => (
  <g transform={`translate(${p[0]},${p[1]}) scale(${inv})`} opacity={alpha}>
    <rect x={-42} y={-22} width={84} height={44} rx={11} fill={CREAM} stroke={INK} strokeWidth={4} />
    <svg x={-36} y={-14} width={32} height={28}><Flag code={code} w={32} h={28} /></svg>
    <rect x={-36} y={-14} width={32} height={28} fill="none" stroke={INK} strokeWidth={2} />
    <g transform={`translate(19,3) scale(${flip ? -1 : 1},1)`}>
      <rect x={-15} y={-2} width={30} height={11} rx={3} fill="#556b3f" stroke={INK} strokeWidth={2} />
      <rect x={-8} y={-10} width={15} height={9} rx={3} fill="#556b3f" stroke={INK} strokeWidth={2} />
      <rect x={6} y={-8} width={13} height={3} fill={INK} />
    </g>
  </g>
);
export const Ship: React.FC<{p: P; ang: number; code: string; inv: number; alpha?: number; sink?: number}> = ({p, ang, code, inv, alpha = 1, sink = 0}) => (
  <g transform={`translate(${p[0]},${p[1]}) scale(${inv}) rotate(${(ang * 180) / Math.PI + sink * 25})`} opacity={alpha * (1 - sink)}>
    <path d="M-34,-9 L22,-9 L36,0 L22,9 L-34,9 Z" fill="#8a96a3" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <rect x={-18} y={-6} width={22} height={12} rx={2} fill="#c9d1d9" stroke={INK} strokeWidth={2.5} />
    <g transform={`rotate(${-(ang * 180) / Math.PI})`}>
      <rect x={-14} y={-42} width={30} height={20} fill="#fff" stroke={INK} strokeWidth={3} />
      <svg x={-13} y={-41} width={28} height={18}><Flag code={code} w={28} h={18} /></svg>
      <line x1={-14} y1={-42} x2={-14} y2={-14} stroke={INK} strokeWidth={3} />
    </g>
  </g>
);
export const Plane: React.FC<{p: P; ang: number; color: string; inv: number; alpha?: number}> = ({p, ang, color, inv, alpha = 1}) => (
  <g transform={`translate(${p[0]},${p[1]}) scale(${inv}) rotate(${(ang * 180) / Math.PI + 90})`} opacity={alpha}>
    <path d="M0,-26 L5,-12 L5,-4 L26,8 L26,13 L5,7 L4,18 L11,24 L11,28 L0,25 L-11,28 L-11,24 L-4,18 L-5,7 L-26,13 L-26,8 L-5,-4 L-5,-12 Z" fill={color} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
    <ellipse cx={0} cy={-12} rx={2.5} ry={5} fill="#bfe6ff" stroke={INK} strokeWidth={1.5} />
  </g>
);
// unidad que viaja por una ruta, con estela opcional
export const Mover: React.FC<{pts: P[]; t: number; t0: number; t1: number; kind: 'tank' | 'ship' | 'plane' | 'missile'; code?: string; color?: string; inv: number; hold?: number; trail?: boolean; sinkAt?: number}> = ({pts, t, t0, t1, kind, code = 'eu', color = BLUE, inv, hold = 2, trail, sinkAt}) => {
  if (t < t0 - 0.3 || t > t1 + hold + 0.6) return null;
  const p = lerp(t, t0, t1, 0, 1, kind === 'missile' ? Easing.in(Easing.quad) : Easing.inOut(Easing.sin));
  const a = lerp(t, t0 - 0.3, t0, 0, 1) * lerp(t, t1 + hold, t1 + hold + 0.6, 1, 0);
  const {pts: q, tip, ang} = partial(pts, p);
  const sink = sinkAt !== undefined ? lerp(t, sinkAt, sinkAt + 1.2, 0, 1) : 0;
  return (
    <g>
      {trail && q.length > 1 && (() => {
        const tail = q.slice(Math.max(0, q.length - 40));
        return <path d={d(tail)} fill="none" stroke={kind === 'missile' ? '#f2f2f2' : 'rgba(255,255,255,0.85)'} strokeWidth={kind === 'missile' ? 3 * inv : 4 * inv} strokeLinecap="round" opacity={a * 0.8} strokeDasharray={kind === 'plane' ? `${6 * inv} ${4 * inv}` : undefined} />;
      })()}
      {kind === 'tank' && <TankToken p={tip} code={code} inv={inv * 0.8} alpha={a} flip={Math.cos(ang) < 0} />}
      {kind === 'ship' && <Ship p={tip} ang={ang} code={code} inv={inv * 0.8} alpha={a} sink={sink} />}
      {kind === 'plane' && <Plane p={tip} ang={ang} color={color} inv={inv * 0.8} alpha={a} />}
      {kind === 'missile' && p < 1 && <g transform={`translate(${tip[0]},${tip[1]}) scale(${inv}) rotate(${(ang * 180) / Math.PI})`} opacity={a}><path d="M-12,-3 L8,-3 L14,0 L8,3 L-12,3 Z" fill="#fff" stroke={INK} strokeWidth={2.5} /><path d="M-12,-3 L-17,-7 L-17,7 L-12,3" fill={RED} stroke={INK} strokeWidth={2} /></g>}
    </g>
  );
};

// ---------- explosión con humo, onda y partículas ----------
export const Boom: React.FC<{p: P; t: number; at: number; r: number}> = ({p, t, at, r}) => {
  const dt = t - at;
  if (dt < 0 || dt > 1.6) return null;
  const k = Math.min(1, dt / 0.9);
  const rr = r * (0.3 + Math.sqrt(k) * 1.1);
  const seed = Math.floor(at * 97);
  const star = Array.from({length: 20}).map((_, i) => {
    const a = (i / 20) * Math.PI * 2 + seed, rad = i % 2 ? rr * 0.55 : rr;
    return `${p[0] + Math.cos(a) * rad},${p[1] + Math.sin(a) * rad}`;
  }).join(' ');
  const smoke = Array.from({length: 6}).map((_, i) => {
    const a = (i / 6) * Math.PI * 2 + seed * 0.3;
    const dist = r * (0.4 + dt * 1.1);
    return <circle key={i} cx={p[0] + Math.cos(a) * dist * 0.6} cy={p[1] + Math.sin(a) * dist * 0.5 - dt * r * 0.9} r={r * (0.35 + dt * 0.5)} fill="#4b4b4b" opacity={0.45 * lerp(dt, 0.2, 1.6, 1, 0)} />;
  });
  const sparks = Array.from({length: 10}).map((_, i) => {
    const a = (i / 10) * Math.PI * 2 + seed * 1.7, dist = r * (0.6 + dt * 3.2);
    return <circle key={i} cx={p[0] + Math.cos(a) * dist} cy={p[1] + Math.sin(a) * dist + dt * dt * r * 2} r={r * 0.08} fill="#ffd23f" stroke={INK} strokeWidth={r * 0.02} opacity={lerp(dt, 0.2, 0.9, 1, 0)} />;
  });
  return (
    <g>
      {smoke}
      <circle cx={p[0]} cy={p[1]} r={r * (0.5 + dt * 3)} fill="none" stroke="#fff" strokeWidth={r * 0.12 * (1 - Math.min(1, dt / 0.7))} opacity={lerp(dt, 0, 0.7, 0.9, 0)} />
      {dt < 0.9 && <g opacity={1 - k * k}><polygon points={star} fill={ORANGE} stroke={INK} strokeWidth={r * 0.08} strokeLinejoin="round" /><circle cx={p[0]} cy={p[1]} r={rr * 0.45} fill="#ffe14d" /></g>}
      {sparks}
    </g>
  );
};

// ---------- personajes ----------
export type Mood = 'calm' | 'angry' | 'scared' | 'happy' | 'sad' | 'smug' | 'shocked';
export const Face: React.FC<{x: number; y: number; r: number; mood: Mood; t: number; seed: number; look?: P; talking?: boolean; plain?: boolean}> = ({x, y, r, mood, t, seed, look = [0, 0], talking, plain}) => {
  const f = t * 30;
  const blink = (f + seed * 37) % 110 < 4 ? 0.12 : 1;
  const bob = Math.sin((f + seed * 11) / 14) * r * 0.04;
  const jump = mood === 'happy' ? -Math.abs(Math.sin((f + seed * 7) / 7)) * r * 0.35 : 0;
  const shake = mood === 'scared' || mood === 'shocked' ? Math.sin(f * 1.7 + seed) * r * 0.05 : 0;
  const ew = r * 0.42, eh = r * 0.5 * blink * (mood === 'shocked' ? 1.15 : 1), ex = r * 0.48, sw = r * 0.09;
  const pr = mood === 'scared' || mood === 'shocked' ? r * 0.11 : r * 0.2;
  const angry = mood === 'angry';
  const mo = talking ? 0.35 + 0.65 * Math.abs(Math.sin(f / 2.6 + seed)) : 0;
  let mouth: React.ReactNode = null;
  if (talking) mouth = <ellipse cx={0} cy={r * 0.68} rx={r * 0.24} ry={r * 0.06 + r * 0.2 * mo} fill="#6b1424" stroke={INK} strokeWidth={sw} />;
  else if (mood === 'happy') mouth = <path d={`M${-r * 0.35},${r * 0.55} Q0,${r * 1.05} ${r * 0.35},${r * 0.55} Z`} fill="#8c1d2c" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />;
  else if (mood === 'calm') mouth = <path d={`M${-r * 0.22},${r * 0.62} Q0,${r * 0.82} ${r * 0.22},${r * 0.62}`} fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />;
  else if (mood === 'smug') mouth = <path d={`M${-r * 0.3},${r * 0.62} Q${r * 0.05},${r * 0.85} ${r * 0.35},${r * 0.5}`} fill="none" stroke={INK} strokeWidth={sw * 1.1} strokeLinecap="round" />;
  else if (angry) mouth = <path d={`M${-r * 0.3},${r * 0.75} Q0,${r * 0.55} ${r * 0.3},${r * 0.75}`} fill="none" stroke={INK} strokeWidth={sw * 1.2} strokeLinecap="round" />;
  else if (mood === 'sad') mouth = <path d={`M${-r * 0.28},${r * 0.8} Q0,${r * 0.55} ${r * 0.28},${r * 0.8}`} fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />;
  else mouth = <ellipse cx={0} cy={r * 0.7} rx={r * 0.13} ry={r * 0.17} fill="#5a1220" stroke={INK} strokeWidth={sw} />;
  return (
    <g transform={`translate(${x + shake},${y + bob + jump})`}>
      {(mood === 'happy' || mood === 'calm' || mood === 'smug') && [-1, 1].map((sd) => <ellipse key={sd} cx={sd * (ex + r * 0.15)} cy={r * 0.5} rx={r * 0.2} ry={r * 0.11} fill="#ff7fa6" opacity={0.75} />)}
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <ellipse cx={sd * ex} cy={0} rx={ew} ry={eh} fill={angry && !plain ? '#fff2f0' : '#fff'} stroke={INK} strokeWidth={plain ? sw * 1.5 : sw} />
          {blink > 0.5 && <circle cx={sd * ex + look[0] * ew * 0.35} cy={look[1] * eh * 0.3 + (angry ? r * 0.06 : 0)} r={plain ? pr * 1.15 : pr} fill={angry && !plain ? '#c0141a' : INK} />}
          {blink > 0.5 && angry && !plain && <circle cx={sd * ex + look[0] * ew * 0.35} cy={look[1] * eh * 0.3 + r * 0.06} r={pr * 0.5} fill={INK} />}
          {angry && <path d={`M${sd * (ex + ew * 1.1)},${-eh * 1.15} L${sd * (ex - ew * 0.9)},${-eh * 0.55}`} stroke={INK} strokeWidth={sw * 1.6} strokeLinecap="round" />}
          {mood === 'smug' && blink > 0.5 && <rect x={sd * ex - ew * 1.05} y={-eh * 1.1} width={ew * 2.1} height={eh * 0.8} fill="#fff" />}
          {mood === 'smug' && <path d={`M${sd * (ex + ew)},${-eh * 0.32} L${sd * (ex - ew)},${-eh * 0.32}`} stroke={INK} strokeWidth={sw * 1.3} strokeLinecap="round" />}
          {mood === 'sad' && <path d={`M${sd * (ex + ew)},${-eh * 0.6} L${sd * (ex - ew * 0.8)},${-eh * 1.2}`} stroke={INK} strokeWidth={sw * 1.4} strokeLinecap="round" />}
          {(mood === 'scared' || mood === 'shocked') && <path d={`M${sd * (ex + ew * 0.9)},${-eh * 1.3} Q${sd * ex},${-eh * 1.7} ${sd * (ex - ew * 0.9)},${-eh * 1.3}`} fill="none" stroke={INK} strokeWidth={sw * 1.2} strokeLinecap="round" />}
        </g>
      ))}
      {mouth}
      {mood === 'scared' && <path d={`M${r * 0.95},${-r * 0.55} q${r * 0.14},${r * 0.28} 0,${r * 0.36} q${-r * 0.14},${-r * 0.08} 0,${-r * 0.36}`} fill="#7fd0ff" stroke={INK} strokeWidth={sw * 0.7} transform={`translate(0,${((f / 3 + seed) % 10) * r * 0.03})`} />}
      {mood === 'sad' && [-1, 1].map((sd) => <path key={sd} d={`M${sd * ex},${eh * 0.7} q${sd * r * 0.04},${r * 0.2} 0,${r * 0.3} q${-sd * r * 0.06},${-r * 0.1} 0,${-r * 0.3}`} fill="#7fd0ff" stroke={INK} strokeWidth={sw * 0.6} transform={`translate(0,${((f / 2 + seed + sd * 3) % 12) * r * 0.035})`} />)}
    </g>
  );
};

export const MiniFlag: React.FC<{code: string; w?: number; h?: number}> = ({code, w = 54, h = 36}) => (
  <svg width={w} height={h} style={{borderRadius: 5, border: `3px solid ${INK}`, flexShrink: 0, display: 'block'}}><Flag code={code} w={w} h={h} /></svg>
);

// avatar redondo (bandera con cara) en pantalla
export const Avatar: React.FC<{size: number; code: string; mood: Mood; t: number; seed: number; look?: P; talking?: boolean; id: string}> = ({size, code, mood, t, seed, look, talking, id}) => (
  <svg width={size} height={size} viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} style={{overflow: 'visible', display: 'block'}}>
    <defs><clipPath id={`av-${id}`}><circle r={size / 2 - 4} /></clipPath></defs>
    <circle r={size / 2} fill={INK} transform="translate(0,6)" opacity={0.35} />
    <g clipPath={`url(#av-${id})`}><g transform={`translate(${-size * 0.75},${-size / 2})`}><Flag code={code} w={size * 1.5} h={size} /></g></g>
    <circle r={size / 2 - 4} fill="none" stroke={INK} strokeWidth={Math.max(5, size * 0.045)} />
    <Face x={0} y={-size * 0.04} r={size * 0.3} mood={mood} t={t} seed={seed} look={look} talking={talking} />
  </svg>
);

export const Bubble: React.FC<{k: number; sx: number; sy: number; text: string; size?: number}> = ({k, sx, sy, text, size = 38}) => {
  if (k <= 0.001) return null;
  return (
    <div style={{position: 'absolute', left: sx, top: sy, transform: `translate(-50%,-100%) scale(${k})`, transformOrigin: '50% 100%', zIndex: 6}}>
      <div style={{background: '#fff', border: `5px solid ${INK}`, borderRadius: 18, padding: '10px 24px', ...font2, fontSize: size, color: INK, whiteSpace: 'nowrap', boxShadow: '0 6px 0 rgba(0,0,0,0.3)'}}>{text}</div>
      <svg width={38} height={26} style={{position: 'absolute', left: '50%', marginLeft: -19, bottom: -21}}><path d="M2,0 L19,24 L36,0" fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><rect x={4} y={-6} width={30} height={7} fill="#fff" /></svg>
    </div>
  );
};
