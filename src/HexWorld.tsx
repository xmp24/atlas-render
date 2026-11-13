// Motor de mapa real en hexágonos (canvas). Atlas of War · 2026
import React, {useLayoutEffect, useRef} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import ST from './hw/static.json';

export type P = [number, number];
export type Cam = {cx: number; cy: number; s: number};
export const MAPW = (ST as any).W as number, MAPH = (ST as any).H as number, HR = (ST as any).R as number;
const RQ = (ST as any).r as number[], QQ = (ST as any).q as number[], O0 = (ST as any).o as number[];
export const NCELL = RQ.length;
export const COUNTRIES = (ST as any).countries as {c: string; n: string; cont: string; x: number; y: number; cells: number; km2?: number}[];
export const NK = COUNTRIES.length;
export const CODE = COUNTRIES.map((c) => c.c);
export const KOF: Record<string, number> = Object.fromEntries(CODE.map((c, i) => [c, i]));
export const FIC = ((ST as any).fic || null) as null | {codes: string[]; rivers: [number, string][]; lakes: string[]; box: number[]; border: number[][]};
export const FICK = new Set<number>((FIC ? FIC.codes : []).map((c) => KOF[c]));
export const RIVERS = (ST as any).rivers as [number, string][];
export const LAKES = (ST as any).lakes as string[];
export const CITIES = (ST as any).cities as [string, number, number, number][];
const DX = HR * Math.sqrt(3), DY = HR * 1.5;
export const CX = new Float32Array(NCELL), CY = new Float32Array(NCELL);
for (let i = 0; i < NCELL; i++) { CX[i] = (QQ[i] * DX) / 2; CY[i] = RQ[i] * DY; }
// vecinos: E, SE, SW, W, NW, NE  (hex con punta arriba)
export const NB = new Int32Array(NCELL * 6).fill(-1);
{
  const key = new Map<number, number>();
  for (let i = 0; i < NCELL; i++) key.set(RQ[i] * 100000 + QQ[i], i);
  const D: P[] = [[0, 2], [1, 1], [1, -1], [0, -2], [-1, -1], [-1, 1]];
  for (let i = 0; i < NCELL; i++) for (let k = 0; k < 6; k++) { const j = key.get((RQ[i] + D[k][0]) * 100000 + QQ[i] + D[k][1]); if (j !== undefined) NB[i * 6 + k] = j; }
}
// esquinas: ángulos -90+60k  (0 arriba, 1 arriba-dcha, 2 abajo-dcha, 3 abajo, 4 abajo-izda, 5 arriba-izda)
const CORN: P[] = Array.from({length: 6}, (_, k) => [Math.cos(((-90 + 60 * k) * Math.PI) / 180), Math.sin(((-90 + 60 * k) * Math.PI) / 180)]);
// arista compartida con el vecino en dirección d: E->(1,2) SE->(2,3) SW->(3,4) W->(4,5) NW->(5,0) NE->(0,1)
const EDGE: [number, number][] = [[1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 1]];

// ---------------- recursos ----------------
export const IMG: Record<string, HTMLImageElement> = {};
export const MAINCOL: string[] = new Array(NK).fill('#888');
export const DARKCOL: string[] = new Array(NK).fill('#444');
export let MARBLE: ImageData | null = null;
let loaded = false;
const loadImg = (key: string, src: string) => new Promise<void>((res) => { const im = new Image(); im.onload = () => { IMG[key] = im; res(); }; im.onerror = () => res(); im.src = src; });
export const ICONS = ['military-fort', 'beam-satellite', 'orbital-rays', 'battle-tank', 'jet-fighter', 'battleship', 'helmet-head-shot', 'crown', 'shambling-zombie', 'biohazard', 'skull-crossed-bones', 'incoming-rocket', 'anchor', 'trophy-cup', 'explosion-rays'];
const hx = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
if (typeof window !== 'undefined' && !loaded) {
  loaded = true;
  const h = delayRender('hexworld-assets', {timeoutInMilliseconds: 120000});
  const jobs: Promise<void>[] = [];
  for (const c of CODE) jobs.push(loadImg('f-' + c, staticFile(`wflags/${c.toLowerCase()}.svg`)));
  for (const c of ['EU', 'SU']) jobs.push(loadImg('f-' + c, staticFile(`wflags/${c.toLowerCase()}.svg`)));
  for (const n of ICONS) jobs.push(loadImg('i-' + n, staticFile(`hw/icons/${n}.svg`)));
  jobs.push(loadImg('base', staticFile('hw/base.jpg')), loadImg('shade', staticFile('hw/shade.png')), loadImg('marble', staticFile('hw/marble2k.jpg')), loadImg('stars', staticFile('hw/stars.jpg')));
  Promise.all(jobs).then(() => {
    // color principal de cada bandera
    const cv = document.createElement('canvas'); cv.width = 32; cv.height = 24;
    const cx = cv.getContext('2d', {willReadFrequently: true})!;
    CODE.forEach((c, k) => {
      const im = IMG['f-' + c]; if (!im) return;
      cx.clearRect(0, 0, 32, 24); cx.drawImage(im, 0, 0, 32, 24);
      const d = cx.getImageData(0, 0, 32, 24).data;
      const bins = new Map<string, {n: number; r: number; g: number; b: number}>();
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        const key = `${r >> 5},${g >> 5},${b >> 5}`;
        const e = bins.get(key) || {n: 0, r: 0, g: 0, b: 0};
        e.n++; e.r += r; e.g += g; e.b += b; bins.set(key, e);
      }
      let best: any = null, bs = -1;
      for (const e of bins.values()) {
        const r = e.r / e.n, g = e.g / e.n, b = e.b / e.n;
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        const sat = mx === 0 ? 0 : (mx - mn) / mx;
        const score = e.n * (0.35 + sat) * (mx > 235 && sat < 0.12 ? 0.25 : 1);
        if (score > bs) { bs = score; best = {r, g, b}; }
      }
      if (best) { MAINCOL[k] = `#${hx(best.r)}${hx(best.g)}${hx(best.b)}`; DARKCOL[k] = `#${hx(best.r * 0.55)}${hx(best.g * 0.55)}${hx(best.b * 0.55)}`; }
    });
    const m = IMG['marble'];
    if (m) { const c2 = document.createElement('canvas'); c2.width = m.width; c2.height = m.height; const x2 = c2.getContext('2d')!; x2.drawImage(m, 0, 0); MARBLE = x2.getImageData(0, 0, m.width, m.height); }
    continueRender(h);
  });
}

// ---------------- datos dinámicos ----------------
export type HWD = {
  ft: number[]; fc: number[]; fo: number[]; // conquistas: tiempo (centésimas), celda, nuevo dueño
  elim: [number, number, number, number][]; // t, k, killer, puesto
  sold?: {dt: number; v: number[][]}; // soldados (miles) muestreados
  start?: number[]; // dueños iniciales (por defecto los reales)
};
class World {
  d: HWD; own: Int16Array; prev: Int16Array; lastT: Float32Array; ptr = 0; t = -1;
  constructor(d: HWD) { this.d = d; this.own = new Int16Array(NCELL); this.prev = new Int16Array(NCELL); this.lastT = new Float32Array(NCELL); this.reset(); }
  reset() { const s = this.d.start || O0; for (let i = 0; i < NCELL; i++) { this.own[i] = s[i]; this.prev[i] = s[i]; this.lastT[i] = -99; } this.ptr = 0; this.t = -1; }
  seek(t: number) {
    if (t < this.t) this.reset();
    const tc = t * 100; const {ft, fc, fo} = this.d;
    while (this.ptr < ft.length && ft[this.ptr] <= tc) { const c = fc[this.ptr]; this.prev[c] = this.own[c]; this.own[c] = fo[this.ptr]; this.lastT[c] = ft[this.ptr] / 100; this.ptr++; }
    this.t = t;
    return this;
  }
}
const WORLDS = new Map<HWD, World[]>();
export const worldAt = (d: HWD, t: number, slot = 0) => { let a = WORLDS.get(d); if (!a) { a = []; WORLDS.set(d, a); } if (!a[slot]) a[slot] = new World(d); return a[slot].seek(t); };
export type WorldT = World;
// estadísticas por dueño
export type Stats = {n: Int32Array; mx: Float32Array; my: Float32Array; sx: Float32Array; sy: Float32Array};
export const statsOf = (w: World): Stats => {
  const n = new Int32Array(NK), sx1 = new Float64Array(NK), sy1 = new Float64Array(NK), sx2 = new Float64Array(NK), sy2 = new Float64Array(NK);
  for (let i = 0; i < NCELL; i++) { const o = w.own[i]; if (o < 0) continue; n[o]++; sx1[o] += CX[i]; sy1[o] += CY[i]; sx2[o] += CX[i] * CX[i]; sy2[o] += CY[i] * CY[i]; }
  const mx = new Float32Array(NK), my = new Float32Array(NK), sx = new Float32Array(NK), sy = new Float32Array(NK);
  for (let k = 0; k < NK; k++) if (n[k]) { mx[k] = sx1[k] / n[k]; my[k] = sy1[k] / n[k]; sx[k] = Math.sqrt(Math.max(0, sx2[k] / n[k] - mx[k] * mx[k])); sy[k] = Math.sqrt(Math.max(0, sy2[k] / n[k] - my[k] * my[k])); }
  return {n, mx, my, sx, sy};
};
// centro "de masa" robusto (celda propia más cercana a la media)
export const anchorOf = (w: World, st: Stats, k: number): P => {
  const mx = st.mx[k], my = st.my[k];
  let best = -1, bd = 1e18;
  for (let i = 0; i < NCELL; i++) if (w.own[i] === k) { const d = (CX[i] - mx) ** 2 + (CY[i] - my) ** 2; if (d < bd) { bd = d; best = i; } }
  return best >= 0 ? [CX[best], CY[best]] : [mx, my];
};

// ---------------- dibujo ----------------
export type DrawOpts = {
  W: number; H: number; mode?: 'flag' | 'color' | 'density' | 'team';
  color?: (k: number) => string; teamOf?: (k: number) => number; teamCols?: string[];
  dens?: Float32Array; units?: boolean; puffs?: boolean; cities?: boolean; rivers?: boolean; unitOwners?: number[] | null; night?: number | null;
  dimExcept?: Set<number> | null; dimAmt?: number; flash?: boolean; grid?: boolean; zombie?: number; special?: {k: number; col: string} | null;
};
// banderas rasterizadas una vez (dibujar SVG grandes en cada fotograma es muy lento)
const FLAGBMP = new Map<number, HTMLCanvasElement>();
// sustitución de bandera por vídeo (p. ej. Francia -> UE): {k: 'EU'}
export const FLAG_OVR: Record<number, string> = {};
export const flagBmp = (k: number): CanvasImageSource | null => {
  let c = FLAGBMP.get(k);
  if (c) return c;
  const im = IMG['f-' + (FLAG_OVR[k] || CODE[k])]; if (!im) return null;
  c = document.createElement('canvas'); c.width = 640; c.height = 480;
  c.getContext('2d')!.drawImage(im, 0, 0, 640, 480);
  FLAGBMP.set(k, c);
  return c;
};
const hash = (i: number) => { let x = (i + 0x9e3779b9) | 0; x = Math.imul(x ^ (x >>> 16), 0x85ebca6b); x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35); return ((x ^ (x >>> 16)) >>> 0) / 4294967296; };
const RIVER_P = RIVERS.map(([sr, d]) => [sr, typeof Path2D !== 'undefined' ? new Path2D(d) : null] as const);
const LAKE_P = typeof Path2D !== 'undefined' ? LAKES.map((d) => new Path2D(d)) : [];

export const drawMap = (ctx: CanvasRenderingContext2D, d: HWD, t: number, cam: Cam, o: DrawOpts) => {
  const w = worldAt(d, t);
  const st = statsOf(w);
  const {W, H} = o; const s = cam.s;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#1a4f8f'; ctx.fillRect(0, 0, W, H);
  ctx.setTransform(s, 0, 0, s, W / 2 - cam.cx * s, H / 2 - cam.cy * s);
  if (IMG.base) ctx.drawImage(IMG.base, 0, 0, MAPW, MAPH);
  const x0 = cam.cx - W / 2 / s - HR * 2, x1 = cam.cx + W / 2 / s + HR * 2, y0 = cam.cy - H / 2 / s - HR * 2, y1 = cam.cy + H / 2 / s + HR * 2;
  const vis: number[] = [];
  for (let i = 0; i < NCELL; i++) if (CX[i] > x0 && CX[i] < x1 && CY[i] > y0 && CY[i] < y1 && !FICK.has(O0[i])) vis.push(i);
  const r = HR * 1.02;
  // trozos de <=900 celdas por dueño: un Path2D con miles de subtrayectos es lentísimo de rellenar
  const pathsA = new Map<number, Path2D[]>(); const pcount = new Map<number, number>();
  for (const i of vis) {
    const k = w.own[i]; let arr = pathsA.get(k); if (!arr) { arr = []; pathsA.set(k, arr); }
    const n = pcount.get(k) || 0; pcount.set(k, n + 1);
    if (n % 900 === 0) arr.push(new Path2D());
    const p = arr[arr.length - 1];
    const x = CX[i], y = CY[i];
    p.moveTo(x + CORN[0][0] * r, y + CORN[0][1] * r);
    for (let c = 1; c < 6; c++) p.lineTo(x + CORN[c][0] * r, y + CORN[c][1] * r);
    p.closePath();
  }
  const paths: [number, Path2D][] = [];
  for (const [k, arr] of pathsA) for (const p of arr) paths.push([k, p]);
  const mode = o.mode || 'flag';
  for (const [k, p] of paths) {
    let col = MAINCOL[k];
    if (mode === 'color' && o.color) col = o.color(k);
    let neutral = false;
    if (mode === 'team' && o.teamOf && o.teamCols) { const tm = o.teamOf(k); if (tm >= 0) col = o.teamCols[tm]; else neutral = true; }
    if (o.special && k === o.special.k) col = o.special.col;
    if (mode === 'density' && o.dens) { const v = o.dens[k]; col = `hsl(${Math.round(230 - v * 230)},88%,${Math.round(42 + v * 10)}%)`; }
    ctx.fillStyle = col; ctx.fill(p);
    if ((mode === 'flag' || neutral) && !(o.special && k === o.special.k) && IMG['f-' + CODE[k]] && st.n[k] > 0) {
      const bw = Math.max(st.sx[k] * 4.2, HR * 4), bh = Math.max(st.sy[k] * 4.2, HR * 3);
      let fw = Math.max(bw, bh * 4 / 3); let fh = fw * 3 / 4;
      if (fh < bh) { fh = bh; fw = fh * 4 / 3; }
      const pat = ctx.createPattern(flagBmp(k)!, 'no-repeat');
      if (pat) {
        pat.setTransform(new DOMMatrix().translate(st.mx[k] - fw / 2, st.my[k] - fh / 2).scale(fw / 640, fh / 480));
        ctx.globalAlpha = 0.86; ctx.fillStyle = pat; ctx.fill(p); ctx.globalAlpha = 1;
      }
      if (neutral) { ctx.globalAlpha = 0.55; ctx.fillStyle = '#20242c'; ctx.fill(p); ctx.globalAlpha = 1; }
    }
    if (o.special && k === o.special.k) {
      // textura zombi: manchas
      ctx.save(); ctx.clip(p); ctx.globalAlpha = 0.35; ctx.fillStyle = '#2f6b1f';
      for (let q = 0; q < vis.length; q += 7) { const i = vis[q]; if (w.own[i] !== k) continue; ctx.beginPath(); ctx.arc(CX[i] + (hash(i) - 0.5) * HR, CY[i], HR * (0.4 + hash(i + 7) * 0.7), 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
  }
  // atenuar no seleccionados
  if (o.dimExcept) {
    ctx.fillStyle = `rgba(10,20,40,${o.dimAmt ?? 0.6})`;
    for (const [k, p] of paths) if (!o.dimExcept.has(k)) ctx.fill(p);
  }
  // destello de conquista
  if (o.flash !== false) {
    ctx.fillStyle = '#ffffff';
    for (const i of vis) {
      const age = t - w.lastT[i];
      if (age >= 0 && age < 0.5) {
        ctx.globalAlpha = 0.75 * (1 - age / 0.5);
        ctx.beginPath(); const x = CX[i], y = CY[i];
        ctx.moveTo(x + CORN[0][0] * r, y + CORN[0][1] * r);
        for (let c = 1; c < 6; c++) ctx.lineTo(x + CORN[c][0] * r, y + CORN[c][1] * r);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }
  // relieve
  if (IMG.shade) { ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.95; ctx.drawImage(IMG.shade, 0, 0, MAPW, MAPH); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  // rejilla hex sutil
  if (o.grid !== false && s > 0.42) {
    ctx.globalAlpha = Math.min(1, (s - 0.42) / 0.4) * 0.16;
    ctx.strokeStyle = '#000'; ctx.lineWidth = 1 / s;
    for (const [, p] of paths) ctx.stroke(p);
    ctx.globalAlpha = 1;
  }
  // ríos y lagos
  if (o.rivers !== false && s > 0.38) {
    const a = Math.min(1, (s - 0.38) / 0.3);
    ctx.globalAlpha = 0.55 * a; ctx.strokeStyle = '#7fc3ee'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const [sr, p] of RIVER_P) { if (!p) continue; if (sr > 3 + s * 3) continue; ctx.lineWidth = Math.max(1.2 / s, (7 - sr) * 0.55); ctx.stroke(p); }
    ctx.globalAlpha = 0.9 * a; ctx.fillStyle = '#5aa7dd';
    for (const p of LAKE_P) ctx.fill(p);
    ctx.globalAlpha = 1;
  }
  // costa y fronteras
  const coast = new Path2D(), bord = new Path2D();
  for (const i of vis) {
    const x = CX[i], y = CY[i], k = w.own[i];
    for (let dd = 0; dd < 6; dd++) {
      const n = NB[i * 6 + dd];
      if (n >= 0 && (w.own[n] === k || n < i)) continue;
      const [a, b] = EDGE[dd];
      const pa = CORN[a], pb = CORN[b];
      const tgt = n < 0 ? coast : bord;
      tgt.moveTo(x + pa[0] * HR, y + pa[1] * HR); tgt.lineTo(x + pb[0] * HR, y + pb[1] * HR);
    }
  }
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(15,20,30,0.85)'; ctx.lineWidth = Math.max(1.6 / s, HR * 0.16); ctx.stroke(coast);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = Math.max(4.4 / s, HR * 0.4); ctx.stroke(bord);
  ctx.strokeStyle = '#141414'; ctx.lineWidth = Math.max(2.2 / s, HR * 0.2); ctx.stroke(bord);
  // humo/explosiones y unidades en los frentes
  const {ft, fc, fo} = d;
  if ((o.puffs !== false || o.units !== false) && s > 0.2) {
    let lo = 0, hi = ft.length; const tmin = (t - 1.8) * 100;
    while (lo < hi) { const m = (lo + hi) >> 1; if (ft[m] < tmin) lo = m + 1; else hi = m; }
    const tc = t * 100;
    let nPuff = 0, nUnit = 0;
    const cand: number[] = [];
    for (let j = lo; j < ft.length && ft[j] <= tc; j++) { const c = fc[j]; if (CX[c] > x0 && CX[c] < x1 && CY[c] > y0 && CY[c] < y1) cand.push(j); }
    const step = Math.max(1, Math.floor(cand.length / 45));
    const ucnt = o.unitOwners ? cand.filter((j) => o.unitOwners!.includes(fo[j])).length : cand.length;
    const ustep = Math.max(1, Math.floor(ucnt / 18)); let uq = 0;
    const zf = Math.max(0.55, Math.min(1.3, s / 0.6)); const us = (26 * zf) / s;
    for (let q = 0; q < cand.length; q++) {
      const j = cand[q]; const c = fc[j]; const age = t - ft[j] / 100; const hsh = hash(j);
      if (o.puffs !== false && s > 0.4 && q % step === 0 && nPuff < 28 && age < 1.1) {
        nPuff++;
        const k = age / 1.1; const rr = ((5 + 20 * k) * (0.7 + hsh * 0.6) * Math.max(0.55, Math.min(1.3, s / 0.6))) / s;
        ctx.globalAlpha = (1 - k) * 0.85;
        ctx.fillStyle = k < 0.25 ? '#fff3b0' : k < 0.5 ? '#ff9a2e' : '#5b5b5b';
        ctx.beginPath(); ctx.arc(CX[c] + (hsh - 0.5) * HR, CY[c] - (k * 14) / s, rr, 0, Math.PI * 2); ctx.fill();
        if (k < 0.3) { ctx.globalAlpha = (1 - k / 0.3) * 0.9; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3 / s; ctx.beginPath(); ctx.arc(CX[c], CY[c], rr * 1.6, 0, Math.PI * 2); ctx.stroke(); }
        ctx.globalAlpha = 1;
      }
      if (o.units !== false && (!o.unitOwners || o.unitOwners.includes(fo[j])) && uq++ % ustep === 0 && nUnit < 18 && age < 1.8 && s > 0.3) {
        nUnit++;
        const k = fo[j];
        const icon = IMG['i-' + (o.zombie !== undefined && k === o.zombie ? 'shambling-zombie' : hsh < 0.55 ? 'battle-tank' : hsh < 0.85 ? 'helmet-head-shot' : 'jet-fighter')];
        const fade = Math.min(1, age / 0.15) * Math.min(1, (1.8 - age) / 0.3);
        // se desliza desde el lado del atacante
        const ax = st.n[k] ? st.mx[k] : CX[c], ay = st.n[k] ? st.my[k] : CY[c];
        const dl = Math.hypot(CX[c] - ax, CY[c] - ay) || 1;
        const sl = ((1 - Math.min(1, age / 0.9)) * 46) / s;
        const ux = CX[c] - ((CX[c] - ax) / dl) * sl, uy = CY[c] - ((CY[c] - ay) / dl) * sl;
        const rad = us * 0.62;
        ctx.globalAlpha = fade;
        ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.arc(ux, uy + rad * 0.18, rad * 1.04, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = DARKCOL[k]; ctx.beginPath(); ctx.arc(ux, uy, rad, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = rad * 0.14; ctx.stroke();
        if (icon) ctx.drawImage(icon, ux - rad * 0.72, uy - rad * 0.72, rad * 1.44, rad * 1.44);
        ctx.globalAlpha = 1;
      }
    }
  }
  // ciclo día/noche: banda oscura que recorre el planeta
  if (o.night !== undefined && o.night !== null) {
    const cxN = (((o.night % 1) + 1) % 1) * MAPW;
    for (const off of [-MAPW, 0, MAPW]) {
      const c = cxN + off, half = MAPW * 0.42;
      if (c + half < x0 || c - half > x1) continue;
      const g = ctx.createLinearGradient(c - half, 0, c + half, 0);
      g.addColorStop(0, 'rgba(5,10,35,0)'); g.addColorStop(0.3, 'rgba(5,10,35,0.34)'); g.addColorStop(0.5, 'rgba(5,10,35,0.42)'); g.addColorStop(0.7, 'rgba(5,10,35,0.34)'); g.addColorStop(1, 'rgba(5,10,35,0)');
      ctx.fillStyle = g; ctx.fillRect(c - half, -200, half * 2, MAPH + 400);
    }
  }
  // ciudades
  if (o.cities !== false && s > 0.75) {
    const a = Math.min(1, (s - 0.75) / 0.3);
    ctx.globalAlpha = a;
    ctx.font = `${Math.round(15 / s)}px Fredoka`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    for (const [n, x, y, cap] of CITIES) {
      if (x < x0 || x > x1 || y < y0 || y > y1) continue;
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2.2 / s;
      ctx.beginPath(); ctx.arc(x, y, (cap ? 4.2 : 3) / s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (cap) { ctx.lineWidth = 3.5 / s; ctx.strokeText(n, x + 7 / s, y); ctx.fillText(n, x + 7 / s, y); }
    }
    ctx.globalAlpha = 1;
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  return {w, st};
};

// componente: lienzo del mapa
export const MapCanvas: React.FC<{d: HWD; t: number; cam: Cam; W: number; H: number; opts?: Partial<DrawOpts>; blur?: number; onStats?: (w: World, st: Stats) => void}> = ({d, t, cam, W, H, opts, blur = 0}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d'); if (!ctx) return;
    drawMap(ctx, d, t, cam, {W, H, ...(opts || {})});
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', left: 0, top: 0, width: W, height: H, filter: blur > 0.3 ? `blur(${blur.toFixed(2)}px)` : undefined}} />;
};

// bandera como lienzo (rasterizada una vez; mucho más rápido que <Img> con SVG)
export const FlagCanvas: React.FC<{k: number; w: number; h: number; style?: React.CSSProperties}> = ({k, w, h, style}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current; if (!c) return; const b = flagBmp(k); if (!b) return;
    const x = c.getContext('2d')!; x.clearRect(0, 0, c.width, c.height);
    // recorte tipo "cover"
    const ar = w / h, sw = 640, sh = 480; let cw = sw, chh = sh;
    if (ar > sw / sh) chh = sw / ar; else cw = sh * ar;
    x.drawImage(b, (sw - cw) / 2, (sh - chh) / 2, cw, chh, 0, 0, c.width, c.height);
  });
  return <canvas ref={ref} width={Math.ceil(w * 1.5)} height={Math.ceil(h * 1.5)} style={{width: w, height: h, display: 'block', ...style}} />;
};

// minimapa
export const MiniMap: React.FC<{d: HWD; t: number; cam: Cam; w: number; h: number; VW: number; VH: number}> = ({d, t, cam, w, h, VW, VH}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d'); if (!ctx) return;
    const wd = worldAt(d, t);
    const sx = w / MAPW, sy = h / (MAPH * 0.93);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#163a66'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < NCELL; i++) { ctx.fillStyle = MAINCOL[wd.own[i]]; ctx.fillRect(CX[i] * sx - 0.6, CY[i] * sy - 0.6, 1.8, 1.8); }
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    const vw = VW / cam.s * sx, vh = VH / cam.s * sy;
    ctx.strokeRect(cam.cx * sx - vw / 2, cam.cy * sy - vh / 2, vw, vh);
  });
  return <canvas ref={ref} width={w} height={h} style={{width: w, height: h, display: 'block'}} />;
};

// ---------------- cámara ----------------
export type CamKey = [number, number, number, number, number?]; // t, cx, cy, s, duración de la transición
export const makeCam = (keys: CamKey[], drift = 0.018) => {
  const ks = [...keys].sort((a, b) => a[0] - b[0]);
  const e = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const mix = (a: Cam, b: Cam, x: number): Cam => {
    const k = e(Math.max(0, Math.min(1, x)));
    return {cx: a.cx + (b.cx - a.cx) * k, cy: a.cy + (b.cy - a.cy) * k, s: Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * k)};
  };
  return (t: number): Cam => {
    let from: Cam = {cx: ks[0][1], cy: ks[0][2], s: ks[0][3]}, to = from, t0 = -1e9, d = 1;
    for (let i = 1; i < ks.length; i++) {
      if (ks[i][0] > t) break;
      from = mix(from, to, (ks[i][0] - t0) / d);
      to = {cx: ks[i][1], cy: ks[i][2], s: ks[i][3]}; t0 = ks[i][0]; d = ks[i][4] ?? 1.6;
    }
    const c = mix(from, to, (t - t0) / d);
    const held = Math.max(0, t - t0 - d);
    return {...c, s: c.s * (1 + drift * Math.min(held, 12) / 10)};
  };
};
