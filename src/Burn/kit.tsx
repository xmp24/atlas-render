// Kit para "What If Earth Burned in 24 Hours?": mapa con tinte por país, capa nuclear, búnkeres y HUDs
import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill} from 'remotion';
import {PolyCanvas, CEv} from '../PolyWorld';
import {COUNTRIES, MAINCOL} from '../HexWorld';
import {INK, font} from '../lib3';
import WJ from '../world.json';
import TL from './tl.json';
import {W, H, rnd, ip, pop, fade} from '../Maduro/lib';
import {war} from '../Maduro/lib2';
import {FlagImg} from '../SameArmy';

export const D = TL as any;
export type Cam = {cx: number; cy: number; s: number};
export const WORLD: Cam = {cx: 3840, cy: 2200, s: 0.262};
export const toS = (x: number, y: number, c: Cam): [number, number] => [(x - c.cx) * c.s + W / 2, (y - c.cy) * c.s + H / 2];
export const kfv = (pk: number[][], t: number) => {
  if (!pk || !pk.length) return 0; if (t <= pk[0][0]) return pk[0][1];
  for (let i = 1; i < pk.length; i++) if (t <= pk[i][0]) { const u = (t - pk[i - 1][0]) / (pk[i][0] - pk[i - 1][0]); return pk[i - 1][1] + (pk[i][1] - pk[i - 1][1]) * u; }
  return pk[pk.length - 1][1];
};
export const camKF = (t: number, kf: number[][]): Cam => {
  if (t <= kf[0][0]) return {cx: kf[0][1], cy: kf[0][2], s: kf[0][3]};
  for (let i = 1; i < kf.length; i++) if (t <= kf[i][0]) {
    const a = kf[i - 1], b = kf[i]; const u = (t - a[0]) / (b[0] - a[0]); const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    return {cx: a[1] + (b[1] - a[1]) * e, cy: a[2] + (b[2] - a[2]) * e, s: Math.exp(Math.log(a[3]) + (Math.log(b[3]) - Math.log(a[3])) * e)};
  }
  const l = kf[kf.length - 1]; return {cx: l[1], cy: l[2], s: l[3]};
};
export const RED = '#e5322d', YEL = '#ffd23f', BLU = '#3aa0ff';
const WARD = war(D.war);

// ---------------- mapa base ----------------
export const Map: React.FC<{T: number; cam: Cam; warOn?: boolean; night?: number; bw?: number; children?: React.ReactNode; filter?: string}> = ({T, cam, warOn = true, night = 0, bw = 0, children, filter}) => (
  <AbsoluteFill style={{overflow: 'hidden', background: '#123a6a', filter: filter ?? (bw > 0 ? `grayscale(${bw}) contrast(${1 + 0.15 * bw})` : undefined)}}>
    <PolyCanvas cev={D.cev as CEv[]} t={T} tm={0} byTm={false} cam={cam} W={W} H={H} opts={{squads: false, capitalsOff: true, war: warOn ? WARD : null, empire: null, waves: true} as any} />
    {night > 0 && <AbsoluteFill style={{background: `rgba(4,8,24,${night})`}} />}
    {children}
  </AbsoluteFill>
);

// ---------------- tinte por país (Path2D de world.json) ----------------
const PATHS: Record<number, Path2D[]> = {};
const pathsOf = (k: number) => {
  if (!PATHS[k]) { const c = COUNTRIES[k].c; PATHS[k] = ((WJ as any).pieces as any[]).filter((p) => p.code === c).map((p) => new Path2D(p.d)); }
  return PATHS[k];
};
export type Tint = {k: number; col: string; a: number; stroke?: string; crack?: boolean};
let CRACK: HTMLCanvasElement | null = null;
const crackTex = () => {
  if (CRACK) return CRACK;
  const c = document.createElement('canvas'); c.width = 512; c.height = 512; const g = c.getContext('2d')!;
  let sd = 7; const R = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  // manchas de ceniza
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${20 + R() * 40},${20 + R() * 36},${20 + R() * 30},${0.08 + R() * 0.2})`; g.beginPath(); g.arc(R() * 512, R() * 512, 4 + R() * 26, 0, Math.PI * 2); g.fill(); }
  // grietas ramificadas
  const crack = (x: number, y: number, a: number, len: number, w: number, depth: number) => {
    g.strokeStyle = `rgba(8,6,5,${0.55 + 0.35 * R()})`; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y);
    for (let i = 0; i < len; i++) { a += (R() - 0.5) * 0.9; x += Math.cos(a) * 9; y += Math.sin(a) * 9; g.lineTo(x, y);
      if (depth < 3 && R() < 0.12) { g.stroke(); crack(x, y, a + (R() < 0.5 ? 1 : -1) * (0.5 + R()), len * 0.5, w * 0.6, depth + 1); g.strokeStyle = `rgba(8,6,5,0.7)`; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); } }
    g.stroke();
  };
  for (let i = 0; i < 16; i++) crack(R() * 512, R() * 512, R() * 6.28, 22 + R() * 30, 2.2 + R() * 2.2, 0);
  CRACK = c; return c;
};
export const TintLayer: React.FC<{cam: Cam; items: Tint[]; blend?: any}> = ({cam, items, blend}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = ref.current!.getContext('2d')!; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
    const s = cam.s * 4; ctx.setTransform(s, 0, 0, s, W / 2 - cam.cx * cam.s, H / 2 - cam.cy * cam.s);
    for (const it of items) {
      if (it.a <= 0.003) continue;
      ctx.globalAlpha = Math.min(1, it.a); ctx.fillStyle = it.col;
      for (const p of pathsOf(it.k)) { ctx.fill(p); if (it.stroke) { ctx.strokeStyle = it.stroke; ctx.lineWidth = 2.2 / s * 4; ctx.stroke(p); } }
      if (it.crack) { const pat = ctx.createPattern(crackTex(), 'repeat')!; pat.setTransform(new DOMMatrix().scale(0.16)); ctx.fillStyle = pat; ctx.globalAlpha = Math.min(1, it.a * 1.2); for (const p of pathsOf(it.k)) ctx.fill(p); }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', left: 0, top: 0, mixBlendMode: blend}} />;
};

// ---------------- capa nuclear: arcos de ICBM, explosiones y quemaduras ----------------
export const NukeLayer: React.FC<{T: number; cam: Cam; arcs?: boolean; blasts?: boolean; scorch?: number; glow?: number; data?: any; ruin?: boolean; rad?: number}> = ({T, cam, arcs = true, blasts = true, scorch = 1, glow = 1, data, ruin, rad = 1}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = ref.current!.getContext('2d')!; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
    const Z = Math.max(0.6, Math.sqrt(cam.s / 0.262));
    const N = data || D.nuke;
    // zonas afectadas persistentes: radiación + cráter oscuro (+ brasas pequeñas)
    if (scorch > 0) for (let i = 0; i < N.blasts.length; i++) {
      const [tb, x, y, sc] = N.blasts[i]; if (T < tb + 0.2) continue;
      const [X, Y] = toS(x, y, cam); if (X < -400 || X > W + 400 || Y < -400 || Y > H + 400) continue;
      const age = T - tb; const R = (ruin ? 9 : 14) * (1 + 0.3 * Math.min(1, age / 3)) * sc * Z;
      if (rad > 0 && !ruin) { const ra = Math.min(1, age / 2.5) * rad * scorch; const g0 = ctx.createRadialGradient(X, Y, R * 0.5, X, Y, R * 2.6); g0.addColorStop(0, `rgba(190,255,60,${0.16 * ra})`); g0.addColorStop(0.6, `rgba(160,230,40,${0.06 * ra})`); g0.addColorStop(1, 'rgba(150,220,40,0)'); ctx.fillStyle = g0; ctx.beginPath(); ctx.arc(X, Y, R * 2.6, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = `rgba(200,255,80,${0.35 * ra})`; ctx.setLineDash([4 * Z, 5 * Z]); ctx.lineWidth = 1.5 * Z; ctx.beginPath(); ctx.arc(X, Y, R * 2.0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
      let g = ctx.createRadialGradient(X, Y, 0, X, Y, R * 1.7);
      g.addColorStop(0, `rgba(14,10,8,${0.85 * scorch})`); g.addColorStop(0.5, `rgba(40,34,30,${0.55 * scorch})`); g.addColorStop(1, 'rgba(40,34,30,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(X, Y, R * 1.7, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(10,8,6,${0.6 * scorch})`; ctx.lineWidth = 1.6 * Z; ctx.beginPath(); ctx.arc(X, Y, R * 0.55, 0, Math.PI * 2); ctx.stroke();
      const ga = Math.max(0.15, 1 - age / 30) * glow * scorch;
      for (let e = 0; e < 5; e++) { const an = rnd(i * 9 + e) * 6.28, rr = R * (0.2 + 0.9 * rnd(i * 5 + e)); const fl = 0.5 + 0.5 * Math.sin(T * (5 + e) + i + e);
        ctx.fillStyle = `rgba(255,${120 + 60 * fl},40,${0.75 * ga * fl})`; ctx.beginPath(); ctx.arc(X + Math.cos(an) * rr, Y + Math.sin(an) * rr * 0.7, (1.4 + 1.6 * rnd(i + e)) * Z, 0, Math.PI * 2); ctx.fill(); }
    }
    // arcos
    if (arcs) for (const [a, b, xa, ya, xb, yb, side] of N.arcs) {
      if (T < a || T > b + 0.15) continue;
      const u = Math.min(1, (T - a) / (b - a)); const ue = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      const [Xa, Ya] = toS(xa, ya, cam), [Xb, Yb] = toS(xb, yb, cam);
      const dist = Math.hypot(Xb - Xa, Yb - Ya); const hgt = dist * 0.2 + 20;
      const pos = (q: number): [number, number] => [Xa + (Xb - Xa) * q, Ya + (Yb - Ya) * q - Math.sin(q * Math.PI) * hgt];
      const col = side === 0 ? '120,200,255' : '255,90,70';
      ctx.lineCap = 'round';
      for (const [lw, al] of [[7 * Z, 0.18], [2.6 * Z, 0.9]] as [number, number][]) {
        ctx.strokeStyle = `rgba(${col},${al})`; ctx.lineWidth = lw; ctx.beginPath();
        const q0 = Math.max(0, ue - 0.55);
        for (let j = 0; j <= 24; j++) { const q = q0 + (ue - q0) * (j / 24); const [px, py] = pos(q); if (j) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
        ctx.stroke();
      }
      const [hx, hy] = pos(ue); ctx.fillStyle = '#fff'; ctx.shadowColor = `rgb(${col})`; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(hx, hy, 3.6 * Z, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      if (T - a < 0.5) { ctx.fillStyle = `rgba(255,240,200,${1 - (T - a) / 0.5})`; ctx.beginPath(); ctx.arc(Xa, Ya, (6 + 20 * (T - a)) * Z, 0, Math.PI * 2); ctx.fill(); }
    }
    // explosiones: destello, bola de fuego, onda y hongo
    if (blasts) for (const [tb, x, y, sc] of N.blasts) {
      const d = T - tb; if (d < 0 || d > 4.5) continue;
      const [X, Y] = toS(x, y, cam); if (X < -400 || X > W + 400 || Y < -400 || Y > H + 400) continue;
      const R = 30 * sc * Z;
      if (d < 0.4) { const a = 1 - d / 0.4; const g = ctx.createRadialGradient(X, Y, 0, X, Y, R * 2.6); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(0.3, `rgba(255,250,220,${a * 0.8})`); g.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(X, Y, R * 2.6, 0, Math.PI * 2); ctx.fill(); }
      const q = Math.min(1, d / 2.6); ctx.strokeStyle = `rgba(255,255,255,${0.8 * (1 - q)})`; ctx.lineWidth = (5 * (1 - q) + 1) * Z; ctx.beginPath(); ctx.ellipse(X, Y, R * (0.4 + 3.0 * q), R * (0.4 + 3.0 * q) * 0.75, 0, 0, Math.PI * 2); ctx.stroke();
      const fb = Math.min(1, d / 0.3) * Math.max(0, 1 - (d - 2.4) / 2.1);
      if (fb > 0) {
        const rise = Math.min(1, d / 2.2); const cy = Y - R * (0.2 + 1.5 * rise); const cw = R * (0.55 + 0.45 * rise); const ch = cw * 0.62;
        // tallo
        const sg = ctx.createLinearGradient(X, Y, X, cy); sg.addColorStop(0, `rgba(120,60,30,${0.75 * fb})`); sg.addColorStop(1, `rgba(255,150,60,${0.85 * fb})`);
        ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(X - cw * 0.22, Y); ctx.quadraticCurveTo(X - cw * 0.1, (Y + cy) / 2, X - cw * 0.16, cy); ctx.lineTo(X + cw * 0.16, cy); ctx.quadraticCurveTo(X + cw * 0.1, (Y + cy) / 2, X + cw * 0.22, Y); ctx.closePath(); ctx.fill();
        // base de polvo
        const bg = ctx.createRadialGradient(X, Y, 0, X, Y, cw * 1.1); bg.addColorStop(0, `rgba(200,120,60,${0.6 * fb})`); bg.addColorStop(1, 'rgba(120,80,60,0)'); ctx.fillStyle = bg; ctx.beginPath(); ctx.ellipse(X, Y, cw * 1.1, cw * 0.4, 0, 0, Math.PI * 2); ctx.fill();
        // sombrero
        const cg = ctx.createRadialGradient(X, cy - ch * 0.3, 0, X, cy, cw); const hot = Math.max(0, 1 - d / 2.2);
        cg.addColorStop(0, `rgba(255,${230 - 80 * (1 - hot)},${160 - 100 * (1 - hot)},${fb})`); cg.addColorStop(0.5, `rgba(${230 - 80 * (1 - hot)},${110 - 30 * (1 - hot)},40,${0.95 * fb})`); cg.addColorStop(1, `rgba(90,60,50,${0.5 * fb})`);
        ctx.fillStyle = cg; ctx.beginPath(); ctx.ellipse(X, cy, cw, ch, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(255,220,150,${0.5 * fb * hot})`; ctx.beginPath(); ctx.ellipse(X, cy + ch * 0.35, cw * 0.7, ch * 0.3, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', left: 0, top: 0}} />;
};

// ---------------- búnkeres ----------------
const bunkerIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, fill: string, dead: number, mark?: 'x' | 'ok' | 'star') => {
  ctx.lineWidth = Math.max(1.2, s * 0.16); ctx.strokeStyle = INK; ctx.fillStyle = fill;
  ctx.beginPath(); ctx.moveTo(x - s, y + s * 0.55); ctx.lineTo(x - s, y); ctx.arc(x, y, s, Math.PI, 0); ctx.lineTo(x + s, y + s * 0.55); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = dead > 0 ? '#333' : INK; ctx.fillRect(x - s * 0.32, y - s * 0.15, s * 0.64, s * 0.7);
  if (mark === 'x') { ctx.strokeStyle = '#ff3b30'; ctx.lineWidth = Math.max(1.6, s * 0.28); ctx.beginPath(); ctx.moveTo(x - s * 0.9, y - s * 0.9); ctx.lineTo(x + s * 0.9, y + s * 0.6); ctx.moveTo(x + s * 0.9, y - s * 0.9); ctx.lineTo(x - s * 0.9, y + s * 0.6); ctx.stroke(); }
  if (mark === 'ok') { ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1.6, s * 0.26); ctx.beginPath(); ctx.moveTo(x - s * 0.5, y - s * 0.1); ctx.lineTo(x - s * 0.1, y + s * 0.3); ctx.lineTo(x + s * 0.6, y - s * 0.6); ctx.stroke(); }
};
export type BMode = 'pub' | 'life' | 'signal' | 'open';
// mode 'pub': aparecen en su t; 'life': mueren en d (gris + X); 'signal': los vivos se encienden verdes por ondas desde sx,sy
export const BunkerLayer: React.FC<{T: number; cam: Cam; mode?: BMode; gov?: number; pubA?: number; size?: number; sig?: [number, number, number]; flow?: number}> = ({T, cam, mode = 'pub', gov = 0, pubA = 1, size = 1, sig, flow = 0}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = ref.current!.getContext('2d')!; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
    const Z = Math.max(0.75, Math.min(2.2, Math.sqrt(cam.s / 0.262)));
    const s0 = 5.4 * Z * size;
    if (pubA > 0) {
      ctx.globalAlpha = pubA;
      const list = D.pub as number[][];
      for (let i = 0; i < list.length; i++) {
        const [x, y, ta, td] = list[i]; if (T < ta) continue;
        const [X, Y] = toS(x, y, cam); if (X < -20 || X > W + 20 || Y < -20 || Y > H + 20) continue;
        const p = Math.min(1, (T - ta) / 0.25); const sc = p < 1 ? 0.3 + 0.7 * p + Math.sin(p * Math.PI) * 0.5 : 1;
        const dead = mode !== 'pub' && td > 0 && T > td ? Math.min(1, (T - td) / 0.5) : 0;
        if (flow > 0 && dead === 0 && i % 5 === 0) {
          // personas entrando: puntitos que convergen
          for (let j = 0; j < 4; j++) { const ph = ((T * 0.8 + rnd(i * 7 + j)) % 1); const ang = rnd(i + j * 13) * Math.PI * 2; const rr = (1 - ph) * 34 * Z;
            ctx.fillStyle = `rgba(255,255,255,${0.85 * flow * Math.min(1, ph * 3)})`; ctx.beginPath(); ctx.arc(X + Math.cos(ang) * rr, Y + Math.sin(ang) * rr, 1.6 * Z, 0, Math.PI * 2); ctx.fill(); }
        }
        let fill = '#39b6ff', mark: any;
        if (dead > 0) { fill = '#6a6a6a'; mark = 'x'; ctx.globalAlpha = pubA * (1 - 0.45 * dead); }
        if (mode === 'open' && dead === 0) { const to = list[i][5]; if (T > to) { const pp = Math.min(1, (T - to) / 0.3); fill = '#2bd46a'; mark = 'ok'; if (pp < 1) { ctx.strokeStyle = `rgba(43,212,106,${1 - pp})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(X, Y, s0 * (1 + pp * 3), 0, Math.PI * 2); ctx.stroke(); } } }
        if (mode === 'signal' && dead === 0 && sig) { const [sx, sy, t0] = sig; const dd = Math.hypot(x - sx, y - sy); const ton = t0 + dd / 2600; if (T > ton) { fill = '#2bd46a'; mark = 'ok'; } }
        bunkerIcon(ctx, X, Y, s0 * sc, fill, dead, mark);
        ctx.globalAlpha = pubA;
      }
      ctx.globalAlpha = 1;
    }
    if (gov > 0) {
      ctx.globalAlpha = Math.min(1, gov);
      for (const g of D.gov) { const [X, Y] = toS(g.at[0], g.at[1], cam); bunkerIcon(ctx, X, Y, s0 * 1.7, '#ffc531', 0, 'star'); }
      ctx.globalAlpha = 1;
    }
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', left: 0, top: 0}} />;
};

// ---------------- partículas ----------------
export const Particles: React.FC<{t: number; kind: 'ember' | 'ash' | 'snow' | 'dust'; n?: number; a?: number}> = ({t, kind, n = 70, a = 1}) => {
  if (a <= 0) return null;
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: a, pointerEvents: 'none'}}>
      {Array.from({length: n}, (_, i) => {
        const sp = kind === 'ember' ? -(60 + rnd(i) * 140) : kind === 'snow' ? 60 + rnd(i) * 90 : kind === 'ash' ? 30 + rnd(i) * 60 : 10 + rnd(i) * 20;
        const y = (((rnd(i + 3) * (H + 100)) + t * sp) % (H + 100) + H + 100) % (H + 100) - 50;
        const x = rnd(i + 11) * W + Math.sin(t * (0.6 + rnd(i + 5)) + i) * 40;
        const r = kind === 'ember' ? 1.5 + rnd(i + 7) * 3 : kind === 'snow' ? 2 + rnd(i + 7) * 4 : 1.5 + rnd(i + 7) * 3.5;
        const col = kind === 'ember' ? `rgba(255,${120 + Math.floor(rnd(i + 9) * 100)},40,${0.5 + 0.5 * Math.abs(Math.sin(t * 3 + i))})` : kind === 'snow' ? 'rgba(240,244,250,0.85)' : kind === 'ash' ? 'rgba(170,170,175,0.7)' : 'rgba(255,240,200,0.35)';
        return <circle key={i} cx={x} cy={y} r={r} fill={col} />;
      })}
    </svg>
  );
};
export const Grain: React.FC<{t: number; a?: number}> = ({t, a = 0.07}) => (
  <AbsoluteFill style={{pointerEvents: 'none', opacity: a, backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '4px 4px', transform: `translate(${(Math.floor(t * 24) % 4) - 2}px, ${(Math.floor(t * 24 * 7) % 4) - 2}px)`}} />
);
export const Vig: React.FC<{a?: number; col?: string}> = ({a = 0.6, col = '0,0,0'}) => <AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(ellipse at center, rgba(${col},0) 45%, rgba(${col},${a}) 100%)`}} />;
export const shakeXY = (t: number, amp: number): string => amp <= 0 ? 'none' : `translate(${(rnd(Math.floor(t * 30)) - 0.5) * amp}px, ${(rnd(Math.floor(t * 30) + 77) - 0.5) * amp}px)`;

// ---------------- HUDs ----------------
const pad2 = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, '0');
export const hms = (s: number) => `${pad2(s / 3600)}:${pad2((s % 3600) / 60)}:${pad2(s % 60)}`;
export const Countdown: React.FC<{sec: number; t: number; big?: boolean; label?: string}> = ({sec, t, big, label = 'STRIKE IN'}) => {
  const urgent = sec < 3600; const blink = urgent && Math.floor(t * 4) % 2 === 0;
  if (big) return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{...font, fontSize: 64, color: '#ff4a3a', letterSpacing: 10}}>{label}</div>
      <div style={{fontFamily: 'monospace', fontWeight: 900, fontSize: 260, color: blink ? '#ff2a1a' : '#fff', textShadow: '0 0 60px rgba(255,40,20,0.8)', letterSpacing: 6}}>{hms(sec)}</div>
    </AbsoluteFill>
  );
  return (
    <div style={{position: 'absolute', right: 40, top: 36, borderRadius: 18, overflow: 'hidden', border: `6px solid ${INK}`, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', background: '#0b0d12'}}>
      <div style={{background: '#c3100a', ...font, fontSize: 26, color: '#fff', textAlign: 'center', padding: '4px 18px', letterSpacing: 3}}>☢ {label}</div>
      <div style={{fontFamily: 'monospace', fontWeight: 900, fontSize: 66, lineHeight: '80px', color: blink ? '#ff3b30' : '#fff', padding: '0 22px', textShadow: '0 0 18px rgba(255,60,40,0.6)'}}>{hms(sec)}</div>
    </div>
  );
};
export const YearBadge: React.FC<{year: number; t: number; t0?: number; bw?: boolean}> = ({year, t, t0 = 0, bw}) => (
  <div style={{position: 'absolute', left: 44, top: 36, transform: `scale(${pop(t, t0, 0.3)})`, transformOrigin: '0 0', padding: '6px 26px 10px', borderRadius: 18, background: bw ? 'rgba(20,20,20,0.85)' : 'rgba(8,12,24,0.82)', border: '4px solid rgba(255,255,255,0.25)'}}>
    <div style={{...font, fontSize: 24, color: bw ? '#bbb' : YEL, letterSpacing: 4}}>YEAR</div>
    <div style={{...font, fontSize: 70, lineHeight: '70px', color: '#fff'}}>{Math.floor(year)}</div>
  </div>
);
export const HumanityBar: React.FC<{T: number; t: number; t0?: number; y?: number}> = ({T, t, t0 = 0, y = 34}) => {
  const pct = kfv(D.hum, T); const ppl = pct / 100 * 8.2e9; const sc = pop(t, t0, 0.35);
  const fmt = ppl >= 1e9 ? (ppl / 1e9).toFixed(2) + ' BILLION' : Math.round(ppl / 1e6).toLocaleString('en-US') + ' MILLION';
  const col = pct > 50 ? '#3bd16f' : pct > 2 ? '#ffc23a' : '#ff3b30';
  return (
    <div style={{position: 'absolute', left: W / 2 - 420, top: y, width: 840, transform: `scale(${sc})`, transformOrigin: '50% 0', padding: '12px 22px 16px', borderRadius: 20, background: 'rgba(8,12,24,0.85)', border: `5px solid ${INK}`, boxShadow: '0 10px 30px rgba(0,0,0,0.5)'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
        <div style={{...font, fontSize: 30, color: '#fff', letterSpacing: 2}}>HUMANITY ALIVE</div>
        <div style={{...font, fontSize: 44, color: col}}>{pct >= 10 ? pct.toFixed(0) : pct.toFixed(pct < 1 ? 2 : 1)}%</div>
      </div>
      <div style={{position: 'relative', height: 30, borderRadius: 10, background: '#2a2a2e', border: '3px solid #000', overflow: 'hidden', marginTop: 4}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.max(0.6, pct)}%`, background: `linear-gradient(180deg, ${col}, ${col}aa)`, boxShadow: `0 0 16px ${col}`}} />
        {pct < 20 && <div style={{position: 'absolute', left: `${Math.max(0.6, pct)}%`, top: 0, bottom: 0, width: 3, background: '#fff', opacity: 0.6 + 0.4 * Math.sin(t * 8)}} />}
      </div>
      <div style={{...font, fontSize: 24, color: '#cfd8e8', marginTop: 6, textAlign: 'right'}}>{fmt} PEOPLE</div>
    </div>
  );
};
export const ShelterCards: React.FC<{T: number; t: number; t0?: number; x?: number; y?: number; only?: number[]}> = ({T, t, t0 = 0, x = W - 430, y = 210, only}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 400}}>
    {(D.feat as any[]).map((f, i) => {
      if (only && !only.includes(i)) return null;
      const food = Math.max(0, kfv(f.food, T)); const alive = Math.max(0, Math.round(kfv(f.alive, T))); const lost = f.die && T > f.die;
      const sc = pop(t, t0 + i * 0.18, 0.3);
      const fc = food > 50 ? '#3bd16f' : food > 20 ? '#ffc23a' : '#ff3b30';
      return (
        <div key={i} style={{position: 'relative', marginBottom: 14, transform: `scale(${sc})`, transformOrigin: '100% 50%', padding: '10px 16px 12px', borderRadius: 16, background: lost ? 'rgba(40,10,10,0.9)' : 'rgba(8,12,24,0.86)', border: `4px solid ${lost ? '#ff3b30' : INK}`, filter: lost ? 'grayscale(0.6)' : undefined}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <FlagImg k={COUNTRIES.findIndex((c) => c.c === f.id)} w={52} h={34} style={{border: '3px solid #000', borderRadius: 6}} />
            <div style={{flex: 1}}><div style={{...font, fontSize: 28, color: '#fff', lineHeight: 1}}>{f.name}</div><div style={{...font, fontSize: 18, color: '#9fb0c8'}}>{f.place}</div></div>
            <div style={{textAlign: 'right'}}><div style={{...font, fontSize: 28, color: '#fff', lineHeight: 1}}>{alive.toLocaleString('en-US')}</div><div style={{...font, fontSize: 16, color: '#9fb0c8'}}>ALIVE</div></div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 8}}>
            <div style={{...font, fontSize: 18, color: '#cfd8e8', width: 52}}>FOOD</div>
            <div style={{flex: 1, height: 16, borderRadius: 6, background: '#2a2a2e', border: '2px solid #000', overflow: 'hidden'}}><div style={{width: `${food}%`, height: '100%', background: fc}} /></div>
            <div style={{...font, fontSize: 20, color: fc, width: 54, textAlign: 'right'}}>{Math.round(food)}%</div>
          </div>
          {lost && <div style={{position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) rotate(-10deg) scale(${pop(T, f.die, 0.3)})`, padding: '2px 22px', border: '5px solid #ff3b30', borderRadius: 10, ...font, fontSize: 44, color: '#ff3b30', background: 'rgba(0,0,0,0.6)'}}>LOST</div>}
        </div>
      );
    })}
  </div>
);
export const Chip: React.FC<{t: number; t0: number; t1: number; text: string; k?: number}> = ({t, t0, t1, text}) => {
  if (t < t0 || t > t1) return null; const a = fade(t, t0, t1, 0.3); const sl = ip(t, [t0, t0 + 0.4], [-500, 0]);
  return <div style={{position: 'absolute', left: 44 + sl, top: 150, opacity: a, padding: '10px 28px', borderRadius: 14, background: '#c3100a', border: `5px solid ${INK}`, ...font, fontSize: 40, color: '#fff', boxShadow: '0 8px 20px rgba(0,0,0,0.4)'}}>{text}</div>;
};
export const BigStamp: React.FC<{t: number; t0: number; text: string; x?: number; y?: number; col?: string; size?: number; rot?: number}> = ({t, t0, text, x = W / 2, y = H / 2, col = '#ff3b30', size = 120, rot = -12}) => {
  if (t < t0) return null; const k = ip(t, [t0, t0 + 0.18], [2.4, 1]);
  return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${k})`, opacity: ip(t, [t0, t0 + 0.1], [0, 1]), padding: '6px 40px', border: `${size * 0.09}px solid ${col}`, borderRadius: 18, ...font, fontSize: size, color: col, background: 'rgba(0,0,0,0.35)', letterSpacing: 6, whiteSpace: 'nowrap'}}>{text}</div>;
};
// texto de tráiler: aparece con zoom lento y brillo
export const TText: React.FC<{t: number; t0: number; t1: number; text: string; size?: number; y?: number; col?: string; glow?: string; spacing?: number}> = ({t, t0, t1, text, size = 120, y = H / 2, col = '#fff', glow = 'rgba(255,255,255,0.35)', spacing = 14}) => {
  if (t < t0 || t > t1) return null;
  const a = Math.min(ip(t, [t0, t0 + 0.12], [0, 1], false), ip(t, [t1 - 0.15, t1], [1, 0], false)); const sc = ip(t, [t0, t1], [1.06, 1.0], false);
  return <div style={{position: 'absolute', left: 0, right: 0, top: y, transform: `translateY(-50%) scale(${sc})`, textAlign: 'center', opacity: a, fontFamily: 'Lilita', fontSize: size, color: col, letterSpacing: spacing, textShadow: `0 0 40px ${glow}, 0 6px 0 #000`, whiteSpace: 'nowrap'}}>{text}</div>;
};
export const kOf = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
export {MAINCOL};
