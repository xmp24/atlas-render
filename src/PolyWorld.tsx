// Mapa con fronteras reales: conquistas por país con barrido circular y columnas de soldaditos
import React, {useLayoutEffect, useRef} from 'react';
import {geoNaturalEarth1, geoPath} from 'd3-geo';
import {mesh} from 'topojson-client';
import WJ from './world.json';
import TOPO from './worldtopo.json';
import {IMG, MAINCOL, DARKCOL, KOF, NK, MAPW, MAPH, flagBmp, Cam, RIVERS, LAKES, CITIES, FIC, FICK} from './HexWorld';
import {drawOcc, drawUnits} from './WarLayer';

const W4 = 4; // world.json está a 1920x1080; nuestro mapa es 4x
type Piece = {k: number; path: Path2D | null; bbox: number[]; c: number[]; area: number};
export const PIECES: Piece[] = (WJ as any).pieces.map((p: any) => ({k: KOF[p.code], path: typeof Path2D !== 'undefined' ? new Path2D(p.d) : null, bbox: p.bbox.map((v: number) => v * W4), c: p.c.map((v: number) => v * W4), area: p.area * 16}));
export const PIECES_OF: number[][] = Array.from({length: NK}, () => []);
PIECES.forEach((p, i) => { if (p.k !== undefined) PIECES_OF[p.k].push(i); });
export const CAREA = new Float64Array(NK);
PIECES.forEach((p) => { if (p.k !== undefined) CAREA[p.k] += p.area; });
export const TOTAL_AREA = CAREA.reduce((a, b) => a + b, 0);
// pieza principal de cada país (para caras/etiquetas)
export const PIECES_C = (k: number) => { const mp = MAINPIECE[k]; return mp >= 0 ? PIECES[mp].c : [0, 0]; };
export const MAINPIECE = PIECES_OF.map((arr) => arr.reduce((b, i) => (b < 0 || PIECES[i].area > PIECES[b].area ? i : b), -1));
const pr = (WJ as any).pr;
export const proj = geoNaturalEarth1().scale(pr.scale * W4).translate([pr.translate[0] * W4, pr.translate[1] * W4]);
const GEOMS = (TOPO as any).objects.countries.geometries as any[];
const GEOK = GEOMS.map((g) => KOF[g.properties.code]);
GEOMS.forEach((g, i) => { g.__k = GEOK[i]; });

// ---------------- estado por país ----------------
export type CEv = [number, number, number, number, number, number, number, number, any?]; // tv, tm, país, nuevo, viejo, ox, oy, dur, extras{or:[[x,y,[[t,p]..]]], sq}
export type Wipe = {i: number; p: number; from: number; to: number; circles: [number, number, number][]; sq: boolean};
export type PolyState = {owner: Int16Array; wipe: Wipe[]};
const kf = (pk: number[][], t: number) => {
  if (t <= pk[0][0]) return pk[0][1];
  for (let i = 1; i < pk.length; i++) if (t <= pk[i][0]) { const u = (t - pk[i - 1][0]) / (pk[i][0] - pk[i - 1][0]); return pk[i - 1][1] + (pk[i][1] - pk[i - 1][1]) * u; }
  return pk[pk.length - 1][1];
};
const EVS = new Map<any, CEv[][]>();
const evsOf = (cev: CEv[]) => {
  let e = EVS.get(cev);
  if (!e) { e = Array.from({length: NK}, () => [] as CEv[]); for (const ev of cev) e[ev[2]].push(ev); EVS.set(cev, e); }
  return e;
};
export const polyState = (cev: CEv[], t: number, tm: number, byTm: boolean): PolyState & {ev: (CEv | null)[]} => {
  const per = evsOf(cev);
  const owner = new Int16Array(NK); const wipe: Wipe[] = []; const evc: (CEv | null)[] = new Array(NK).fill(null);
  for (let k = 0; k < NK; k++) {
    owner[k] = k;
    const arr = per[k]; let last: CEv | null = null; let next: CEv | null = null;
    for (const ev of arr) { if ((byTm ? ev[1] <= tm : ev[0] <= t)) last = ev; else { next = ev; break; } }
    if (last) owner[k] = last[3];
    if (byTm) continue;
    // invasión progresiva en curso (antes de que el país cambie de dueño)
    if (next && next[8] && next[8].or) {
      const st0 = Math.min(...next[8].or.map((o: any) => o[2][0][0]));
      if (t >= st0) {
        const circles = next[8].or.map((o: any) => [o[0], o[1], Math.max(0, Math.min(1, kf(o[2], t)))] as [number, number, number]);
        wipe.push({i: k, p: Math.max(...circles.map((c: number[]) => c[2])), from: owner[k], to: next[3], circles, sq: next[8].sq !== 0}); evc[k] = next;
        continue;
      }
    }
    if (last && t < last[0] + last[7] && !(last[8] && last[8].or)) {
      const p = (t - last[0]) / last[7];
      wipe.push({i: k, p, from: last[4], to: last[3], circles: [[last[5], last[6], p]], sq: !(last[8] && last[8].sq === 0)}); evc[k] = last;
    }
  }
  return {owner, wipe, ev: evc};
};
// estadísticas por dueño (área, centro, dispersión)
export const ownerStats = (owner: Int16Array) => {
  const a = new Float64Array(NK), mx = new Float64Array(NK), my = new Float64Array(NK), vx = new Float64Array(NK), vy = new Float64Array(NK);
  for (const p of PIECES) { if (p.k === undefined) continue; const o = owner[p.k]; a[o] += p.area; mx[o] += p.c[0] * p.area; my[o] += p.c[1] * p.area; }
  for (let k = 0; k < NK; k++) if (a[k]) { mx[k] /= a[k]; my[k] /= a[k]; }
  for (const p of PIECES) { if (p.k === undefined) continue; const o = owner[p.k]; const w = p.area; vx[o] += w * ((p.bbox[0] - mx[o]) ** 2 + (p.bbox[2] - mx[o]) ** 2) / 2; vy[o] += w * ((p.bbox[1] - my[o]) ** 2 + (p.bbox[3] - my[o]) ** 2) / 2; }
  const sx = new Float64Array(NK), sy = new Float64Array(NK);
  for (let k = 0; k < NK; k++) if (a[k]) { sx[k] = Math.sqrt(vx[k] / a[k]); sy[k] = Math.sqrt(vy[k] / a[k]); }
  return {a, mx, my, sx, sy};
};
const RIVER_P = typeof Path2D !== 'undefined' ? RIVERS.map(([sr, d]) => [sr, new Path2D(d)] as const) : [];
const LAKE_P = typeof Path2D !== 'undefined' ? LAKES.map((d) => new Path2D(d)) : [];
const FRIV_P = typeof Path2D !== 'undefined' && FIC ? FIC.rivers.map(([sr, d]) => [sr, new Path2D(d)] as const) : [];
const FLAKE_P = typeof Path2D !== 'undefined' && FIC ? FIC.lakes.map((d) => new Path2D(d)) : [];
const FBOX = FIC ? FIC.box.map((v) => v / 4) : [0, 0, 0, 0];
const inFbox = (b: number[]) => b[0] >= FBOX[0] && b[2] <= FBOX[2] && b[1] >= FBOX[1] && b[3] <= FBOX[3];
const ficSkip = (p: {k: number; bbox: number[]}, fic: boolean) => (FICK.has(p.k) ? !fic : fic && inFbox(p.bbox));
const patCache = new Map<number, CanvasPattern>();
let WAVE: CanvasPattern | null = null;
let BASE_SOFT: HTMLCanvasElement | null = null;

// soldadito
const soldier = (ctx: CanvasRenderingContext2D, x: number, y: number, sz: number, col: string, phase: number, dir: number) => {
  const leg = Math.sin(phase) * sz * 0.22;
  ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
  ctx.lineCap = 'round'; ctx.strokeStyle = '#1d1d1d'; ctx.lineWidth = sz * 0.16;
  ctx.beginPath(); ctx.moveTo(0, sz * 0.25); ctx.lineTo(-leg, sz * 0.62); ctx.moveTo(0, sz * 0.25); ctx.lineTo(leg, sz * 0.62); ctx.stroke();
  ctx.fillStyle = '#4c5a2e'; ctx.strokeStyle = '#1d1d1d'; ctx.lineWidth = sz * 0.07;
  ctx.beginPath(); ctx.roundRect(-sz * 0.17, -sz * 0.12, sz * 0.34, sz * 0.42, sz * 0.08); ctx.fill(); ctx.stroke();
  ctx.lineWidth = sz * 0.09; ctx.beginPath(); ctx.moveTo(sz * 0.05, sz * 0.05); ctx.lineTo(sz * 0.48, -sz * 0.08); ctx.stroke();
  ctx.fillStyle = '#f2c79a'; ctx.lineWidth = sz * 0.06; ctx.beginPath(); ctx.arc(0, -sz * 0.24, sz * 0.15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, -sz * 0.29, sz * 0.18, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
};

export type PolyOpts = {W: number; H: number; night?: number | null; squads?: boolean; focus?: number[] | null; t: number; markers?: any[] | null; capitalsOff?: boolean; hl?: number | null; war?: any; empire?: number | null; lit?: number[] | null; empireCol?: string | null; waves?: boolean; ghost?: Map<number, number> | null; extra?: any; empireFlag?: boolean};
const CWMESH = new Map<string, (Path2D | null)[]>();
export const drawPoly = (ctx: CanvasRenderingContext2D, st: ReturnType<typeof polyState>, cam: Cam, o: PolyOpts) => {
  const {W, H} = o; const s = cam.s;
  const os = ownerStats(st.owner);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#1a4f8f'; ctx.fillRect(0, 0, W, H);
  ctx.setTransform(s, 0, 0, s, W / 2 - cam.cx * s, H / 2 - cam.cy * s);
  if (IMG.base) {
    // a mucho zoom la textura base (3840 px) se pixela: se suaviza
    // a mucho zoom la textura base (3840 px) se pixela: versión suavizada precalculada
    if (s > 1.6 && !BASE_SOFT) { const c = document.createElement('canvas'); c.width = 1920; c.height = 1080; const g = c.getContext('2d')!; g.filter = 'blur(2px)'; g.drawImage(IMG.base, 0, 0, 1920, 1080); BASE_SOFT = c; }
    ctx.drawImage(s > 1.6 && BASE_SOFT ? BASE_SOFT : IMG.base, 0, 0, MAPW, MAPH);
  }
  if (o.waves && s > 0.9) {
    if (!WAVE) { const c = document.createElement('canvas'); c.width = 140; c.height = 70; const g = c.getContext('2d')!; g.strokeStyle = 'rgba(255,255,255,0.13)'; g.lineWidth = 3; g.lineCap = 'round';
      for (const [oy, ox] of [[18, 0], [53, 70]]) { g.beginPath(); for (let x = -10; x <= 150; x += 4) { const y = oy + Math.sin(((x + ox) / 140) * Math.PI * 2) * 5; if (x === -10) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke(); }
      WAVE = ctx.createPattern(c, 'repeat'); }
    const wp = WAVE!; wp.setTransform(new DOMMatrix().scale(1 / s, 1 / s).translate((o.t * 8) % 140, 0));
    ctx.globalAlpha = Math.min(1, (s - 0.9) / 0.6); ctx.fillStyle = wp; ctx.fillRect(cam.cx - W / 2 / s, cam.cy - H / 2 / s, W / s, H / s); ctx.globalAlpha = 1;
  }
  const x0 = cam.cx - W / 2 / s, x1 = cam.cx + W / 2 / s, y0 = cam.cy - H / 2 / s, y1 = cam.cy + H / 2 / s;
  const vis = (b: number[]) => b[2] >= x0 && b[0] <= x1 && b[3] >= y0 && b[1] <= y1;
  // caja de la bandera: bloque principal del imperio (sin territorios lejanos)
  const owned: number[][] = Array.from({length: NK}, () => []);
  PIECES.forEach((p, i) => { if (p.k !== undefined) owned[st.owner[p.k]].push(i); });
  const boxOf = (k: number) => {
    const arr = owned[k]; if (!arr.length) return [0, 0, 1, 1];
    let bi = arr[0]; for (const i of arr) if (PIECES[i].area > PIECES[bi].area) bi = i;
    const b = [...PIECES[bi].bbox]; const inn = new Set([bi]);
    for (let it = 0; it < 6; it++) {
      let ch = false; const gx = (b[2] - b[0]) * 0.25 + 120, gy = (b[3] - b[1]) * 0.25 + 120;
      for (const i of arr) { if (inn.has(i)) continue; const q = PIECES[i].bbox; if (q[2] >= b[0] - gx && q[0] <= b[2] + gx && q[3] >= b[1] - gy && q[1] <= b[3] + gy) { inn.add(i); b[0] = Math.min(b[0], q[0]); b[1] = Math.min(b[1], q[1]); b[2] = Math.max(b[2], q[2]); b[3] = Math.max(b[3], q[3]); ch = true; } }
      if (!ch) break;
    }
    return b;
  };
  const patOf = (k: number) => {
    const bmp = flagBmp(k); if (!bmp) return MAINCOL[k];
    const bb = boxOf(k); const cx = (bb[0] + bb[2]) / 2, cy = (bb[1] + bb[3]) / 2;
    const bw = Math.max(bb[2] - bb[0], 60), bh = Math.max(bb[3] - bb[1], 45);
    let fw = Math.max(bw, (bh * 4) / 3); let fh = (fw * 3) / 4; if (fh < bh) { fh = bh; fw = (fh * 4) / 3; }
    os.mx[k] = cx; os.my[k] = cy;
    let pat = patCache.get(k);
    if (!pat) { pat = ctx.createPattern(bmp, 'no-repeat')!; patCache.set(k, pat); }
    pat.setTransform(new DOMMatrix().scale(1 / W4, 1 / W4).translate(os.mx[k] - fw / 2, os.my[k] - fh / 2).scale(fw / 640, fh / 480));
    return pat;
  };
  // relleno por pieza (en coordenadas 1920 -> escala 4)
  const wipeOf = new Map<number, Wipe>(); for (const w of st.wipe) wipeOf.set(w.i, w);
  const pats = new Map<number, CanvasPattern | string>();
  const P = (k: number) => { let v = pats.get(k); if (!v) { v = patOf(k); pats.set(k, v); } return v; };
  ctx.save(); ctx.scale(W4, W4);
  const FICO = !!(o as any).fic;
  for (const p of PIECES) {
    if (p.k === undefined || !p.path || !vis(p.bbox) || ficSkip(p, FICO)) continue;
    const w = wipeOf.get(p.k); const o2 = w ? w.to : st.owner[p.k];
    const base = w ? w.from : o2;
    const CO = (o as any).colOver as Record<number, string> | undefined;
    ctx.fillStyle = CO && CO[base] ? CO[base] : base === o.empire && o.empireCol ? o.empireCol : MAINCOL[base]; ctx.fill(p.path);
    // patrones en espacio 1920: deshacer la escala dentro del patrón
    const pb = CO && CO[base] ? CO[base] : base === o.empire && !(o as any).empireFlag ? (o.empireCol || MAINCOL[base]) : P(base);
    if (typeof pb !== 'string') { ctx.globalAlpha = 0.8; ctx.fillStyle = pb; ctx.fill(p.path); ctx.globalAlpha = 1; }
    if (o.ghost && o.ghost.has(base)) { ctx.globalAlpha = Math.min(1, Math.max(0, (o.t - o.ghost.get(base)!) / 0.9)); ctx.fillStyle = 'rgba(58,62,74,0.9)'; ctx.fill(p.path); ctx.globalAlpha = 1; }
    if (w) {
      ctx.save(); ctx.clip(p.path);
      ctx.beginPath();
      let any = false;
      for (const [cx0, cy0, pp] of w.circles) {
        if (pp <= 0.001) continue;
        const ox = cx0 / W4, oy = cy0 / W4;
        const rmax = Math.hypot(Math.max(Math.abs(p.bbox[0] / W4 - ox), Math.abs(p.bbox[2] / W4 - ox)), Math.max(Math.abs(p.bbox[1] / W4 - oy), Math.abs(p.bbox[3] / W4 - oy))) * 1.05;
        const e = pp < 0.5 ? 2 * pp * pp : 1 - Math.pow(-2 * pp + 2, 2) / 2;
        ctx.moveTo(ox + Math.max(0.5, rmax * e), oy); ctx.arc(ox, oy, Math.max(0.5, rmax * e), 0, Math.PI * 2); any = true;
      }
      if (any) {
        ctx.fillStyle = CO && CO[o2] ? CO[o2] : o2 === o.empire && o.empireCol ? o.empireCol : MAINCOL[o2]; ctx.fill();
        const pn = CO && CO[o2] ? CO[o2] : o2 === o.empire && !(o as any).empireFlag ? (o.empireCol || MAINCOL[o2]) : P(o2); if (typeof pn !== 'string') { ctx.globalAlpha = 0.8; ctx.fillStyle = pn; ctx.fill(); ctx.globalAlpha = 1; }
        ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 2.2 / (s * W4); ctx.stroke();
      }
      ctx.restore();
    }
  }
  const CWo = (o as any).cw;
  if (CWo) {
    for (const p of PIECES) {
      if (p.k === undefined || !p.path || !vis(p.bbox) || CWo.dead[p.k] || CWo.team[p.k] < 0) continue;
      ctx.globalAlpha = 0.3; ctx.fillStyle = CWo.cols[CWo.team[p.k]]; ctx.fill(p.path); ctx.globalAlpha = 1;
    }
    for (const p of PIECES) {
      if (p.k === undefined || !p.path || !vis(p.bbox) || !CWo.dead[p.k]) continue;
      ctx.fillStyle = 'rgba(14,14,20,0.78)'; ctx.fill(p.path);
      ctx.globalAlpha = 0.34; ctx.fillStyle = CWo.cols[CWo.team[p.k]] || '#000'; ctx.fill(p.path); ctx.globalAlpha = 1;
    }
  }
  if (o.lit && o.lit.length) {
    ctx.fillStyle = 'rgba(4,8,26,0.34)';
    for (const p of PIECES) { if (p.k === undefined || !p.path || !vis(p.bbox) || ficSkip(p, FICO) || o.lit.includes(st.owner[p.k])) continue; ctx.fill(p.path); }
  }
  if (o.war) drawOcc(ctx, o.war, o.t, s, vis, PIECES);
  if ((o as any).extra) (o as any).extra(ctx, o.t, s, vis);
  ctx.restore();
  // relieve
  if (IMG.shade) { ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.9 * Math.max(0.25, Math.min(1, (3.2 - s) / 1.8)); ctx.drawImage(IMG.shade, 0, 0, MAPW, MAPH); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  // ríos y lagos
  if (s > 0.38) {
    const a = Math.min(1, (s - 0.38) / 0.3);
    ctx.globalAlpha = 0.5 * a; ctx.strokeStyle = '#7fc3ee'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const [sr, p] of RIVER_P) { if (sr > 3 + s * 3) continue; ctx.lineWidth = Math.max(1.2 / s, (7 - sr) * 0.55); ctx.stroke(p); }
    ctx.globalAlpha = 0.9 * a; ctx.fillStyle = '#5aa7dd'; for (const p of LAKE_P) ctx.fill(p);
    ctx.globalAlpha = 1;
  }
  if (FICO) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const [sr, p] of FRIV_P) { ctx.globalAlpha = sr === 1 ? 0.95 : 0.75; ctx.strokeStyle = sr === 1 ? '#bfe6ff' : '#7fc3ee'; ctx.lineWidth = sr === 1 ? Math.max(3.2 / s, 5.5) : Math.max(1.4 / s, (6 - sr) * 0.9); ctx.stroke(p); if (sr === 1) { ctx.strokeStyle = '#4aa3e0'; ctx.lineWidth = Math.max(1.8 / s, 3.2); ctx.stroke(p); } }
    ctx.globalAlpha = 0.95; for (const p of FLAKE_P) { ctx.fillStyle = '#4aa3e0'; ctx.fill(p); ctx.strokeStyle = '#bfe6ff'; ctx.lineWidth = Math.max(1 / s, 1.5); ctx.stroke(p); }
    ctx.globalAlpha = 1;
  }
  // fronteras: finas entre países, gruesas entre imperios
  const ctxPath = geoPath(proj, ctx);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.beginPath(); ctxPath(mesh(TOPO as any, (TOPO as any).objects.countries, (a: any, b: any) => a !== b && st.owner[a.__k] === st.owner[b.__k]) as any);
  ctx.strokeStyle = 'rgba(255,255,255,0.32)'; ctx.lineWidth = 1.1 / s; ctx.stroke();
  ctx.beginPath(); ctxPath(mesh(TOPO as any, (TOPO as any).objects.countries, (a: any, b: any) => a === b || st.owner[a.__k] !== st.owner[b.__k]) as any);
  ctx.strokeStyle = '#151515'; ctx.lineWidth = Math.max(2.2 / s, 4); ctx.stroke();
  if (FICO) {
    ctx.save(); ctx.scale(W4, W4);
    for (const p of PIECES) { if (p.k === undefined || !p.path || !FICK.has(p.k) || !vis(p.bbox)) continue; ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = Math.max(5 / s, 9) / W4; ctx.stroke(p.path); }
    for (const p of PIECES) { if (p.k === undefined || !p.path || !FICK.has(p.k) || !vis(p.bbox)) continue; ctx.strokeStyle = '#151515'; ctx.lineWidth = Math.max(2.2 / s, 4) / W4; ctx.stroke(p.path); }
    ctx.restore();
  }
  if (CWo) {
    let ms = CWMESH.get(CWo.key);
    if (!ms) {
      const gp = geoPath(proj);
      ms = (CWo.cols as string[]).map((_: string, T: number) => (CWo.has[T] ? new Path2D(gp(mesh(TOPO as any, (TOPO as any).objects.countries, (a: any, b: any) => (a === b ? CWo.team[a.__k] === T : (CWo.team[a.__k] === T) !== (CWo.team[b.__k] === T))) as any) || '') : null));
      CWMESH.set(CWo.key, ms); if (CWMESH.size > 60) CWMESH.delete(CWMESH.keys().next().value as string);
    }
    ms.forEach((m: Path2D | null, T: number) => {
      if (!m) return;
      ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.lineWidth = 15 / s; ctx.stroke(m);
      ctx.strokeStyle = CWo.cols[T]; ctx.lineWidth = 9 / s; ctx.stroke(m);
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.6 / s; ctx.stroke(m);
    });
  }
  if (o.hl != null) {
    const pul = 0.7 + 0.3 * Math.sin(o.t * 6);
    const hm = mesh(TOPO as any, (TOPO as any).objects.countries, (a: any, b: any) => (a === b ? st.owner[a.__k] === o.hl : (st.owner[a.__k] === o.hl) !== (st.owner[b.__k] === o.hl)));
    ctx.beginPath(); ctxPath(hm as any); ctx.strokeStyle = `rgba(255,214,60,${pul})`; ctx.lineWidth = 7 / s; ctx.stroke();
  }
  if (o.empire != null) {
    const E = o.empire;
    const eg = mesh(TOPO as any, (TOPO as any).objects.countries, (a: any, b: any) => (a === b ? st.owner[a.__k] === E : (st.owner[a.__k] === E) !== (st.owner[b.__k] === E)));
    ctx.save(); ctx.translate(0, 3 / s); ctx.beginPath(); ctxPath(eg as any); ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 12 / s; ctx.stroke(); ctx.restore();
    ctx.beginPath(); ctxPath(eg as any); ctx.strokeStyle = '#5a060b'; ctx.lineWidth = 6 / s; ctx.stroke();
    ctx.save(); ctx.translate(0, -1.2 / s); ctx.beginPath(); ctxPath(eg as any); ctx.strokeStyle = 'rgba(255,220,150,1)'; ctx.lineWidth = 2.4 / s; ctx.stroke(); ctx.restore();
  }
  // día/noche
  if (o.night !== undefined && o.night !== null) {
    const cxN = (((o.night % 1) + 1) % 1) * MAPW;
    for (const off of [-MAPW, 0, MAPW]) {
      const c = cxN + off, half = MAPW * 0.42;
      if (c + half < x0 || c - half > x1) continue;
      const g = ctx.createLinearGradient(c - half, 0, c + half, 0);
      g.addColorStop(0, 'rgba(5,10,35,0)'); g.addColorStop(0.3, 'rgba(5,10,35,0.3)'); g.addColorStop(0.5, 'rgba(5,10,35,0.38)'); g.addColorStop(0.7, 'rgba(5,10,35,0.3)'); g.addColorStop(1, 'rgba(5,10,35,0)');
      ctx.fillStyle = g; ctx.fillRect(c - half, -200, half * 2, MAPH + 400);
    }
  }
  // bases militares y capitales del guion
  if (o.markers && s > 0.42) {
    const a0 = Math.min(1, (s - 0.42) / 0.15);
    const R0 = Math.min(30, 22 * Math.max(0.8, s)) / s;
    for (const m of o.markers) {
      const [type, k, x, y, tDead] = m as [string, number, number, number, number | null];
      if (x < x0 - 50 || x > x1 + 50 || y < y0 - 50 || y > y1 + 50) continue;
      const own = st.owner[k];
      const dead = tDead !== null && tDead !== undefined && o.t >= tDead;
      ctx.globalAlpha = a0;
      if (dead && o.t - tDead! < 1.6) {
        const q = (o.t - tDead!) / 1.6;
        ctx.globalAlpha = a0 * (1 - q); ctx.fillStyle = q < 0.3 ? '#fff3b0' : '#ff7a1f';
        ctx.beginPath(); ctx.arc(x, y, R0 * (1.2 + q * 3.5), 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = a0 * (1 - q) * 0.7; ctx.fillStyle = '#444'; ctx.beginPath(); ctx.arc(x, y - R0 * q * 3, R0 * (1 + q * 2.5), 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = a0;
      }
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.arc(x, y + R0 * 0.15, R0 * 1.05, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = dead ? '#666' : MAINCOL[own]; ctx.strokeStyle = type === 'cap' ? '#ffd23f' : '#fff'; ctx.lineWidth = R0 * 0.16;
      ctx.beginPath(); ctx.arc(x, y, R0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (type === 'cap') {
        ctx.fillStyle = dead ? '#bbb' : '#ffd23f'; ctx.beginPath();
        for (let i = 0; i < 10; i++) { const r = i % 2 ? R0 * 0.32 : R0 * 0.72, an = -Math.PI / 2 + (i * Math.PI) / 5; ctx.lineTo(x + Math.cos(an) * r, y + Math.sin(an) * r); }
        ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#1d1d1d'; ctx.lineWidth = R0 * 0.08; ctx.stroke();
      } else if (IMG['i-military-fort']) {
        ctx.drawImage(IMG['i-military-fort'], x - R0 * 0.68, y - R0 * 0.68, R0 * 1.36, R0 * 1.36);
      }
      if (dead) { ctx.strokeStyle = '#e5322d'; ctx.lineWidth = R0 * 0.22; ctx.beginPath(); ctx.moveTo(x - R0 * 0.6, y - R0 * 0.6); ctx.lineTo(x + R0 * 0.6, y + R0 * 0.6); ctx.moveTo(x + R0 * 0.6, y - R0 * 0.6); ctx.lineTo(x - R0 * 0.6, y + R0 * 0.6); ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
  }
  // capitales
  if (!o.capitalsOff && s > 0.75) {
    const a = Math.min(1, (s - 0.75) / 0.3);
    ctx.globalAlpha = a; ctx.font = `${Math.round(15 / s)}px Fredoka`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    for (const [n, x, y, cap] of CITIES) {
      if (!cap || x < x0 || x > x1 || y < y0 || y > y1) continue;
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2.2 / s;
      ctx.beginPath(); ctx.arc(x, y, 4 / s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.lineWidth = 3.5 / s; ctx.strokeText(n, x + 7 / s, y); ctx.fillText(n, x + 7 / s, y);
    }
    ctx.globalAlpha = 1;
  }
  if (o.war) drawUnits(ctx, o.war, o.t, s, x0, x1, y0, y1);
  // columnas de soldaditos (pocas): sólo conquistas visibles en curso
  if (o.squads !== false && s > 0.3) {
    const cand = st.wipe.filter((w) => w.sq).map((w) => {
      const c0 = w.circles.reduce((b, c) => (c[2] > b[2] && c[2] < 1 ? c : b), w.circles[0]);
      const ev = [...st.ev[w.i]!] as any; ev[5] = c0[0]; ev[6] = c0[1]; ev[3] = w.to;
      return {w: {...w, p: c0[2]}, ev};
    }).filter(({ev}) => ev[5] > x0 && ev[5] < x1 && ev[6] > y0 && ev[6] < y1);
    const pick = (o.focus && o.focus.length ? cand.filter(({ev}) => o.focus!.includes(ev[3])) : cand)
      .sort((a, b) => CAREA[b.ev[2]] - CAREA[a.ev[2]]).slice(0, 4);
    const sz = Math.min(34, 22 * Math.max(0.7, s)) / s;
    for (const {w, ev} of pick) {
      const k = ev[3]; const mp = MAINPIECE[ev[2]]; if (mp < 0) continue;
      const tx = PIECES[mp].c[0], ty = PIECES[mp].c[1];
      let dx = tx - ev[5], dy = ty - ev[6]; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
      const span = Math.min(dl, 260 / s);
      const prog = Math.min(1, w.p * 1.1);
      const sx = ev[5] - dx * span * 0.5 + dx * span * prog, sy = ev[6] - dy * span * 0.5 + dy * span * prog;
      const fade = Math.min(1, w.p / 0.1) * Math.min(1, (1 - w.p) / 0.15);
      ctx.globalAlpha = Math.max(0, fade);
      for (let q = 0; q < 5; q++) {
        const ox = (q % 3 - 1) * sz * 0.75 - dx * (q > 2 ? sz * 0.9 : 0), oy = (q > 2 ? sz * 0.5 : -sz * 0.2) + (q % 2) * sz * 0.2;
        soldier(ctx, sx + ox, sy + oy, sz, MAINCOL[k], o.t * 14 + q * 1.7, dx >= 0 ? 1 : -1);
      }
      ctx.globalAlpha = 1;
    }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  return os;
};

export const PolyCanvas: React.FC<{cev: CEv[]; t: number; tm: number; byTm: boolean; cam: Cam; W: number; H: number; blur?: number; opts?: Partial<PolyOpts>}> = ({cev, t, tm, byTm, cam, W, H, blur = 0, opts}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d'); if (!ctx) return;
    drawPoly(ctx, polyState(cev, t, tm, byTm), cam, {W, H, t, ...(opts || {})});
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', left: 0, top: 0, width: W, height: H, filter: blur > 0.3 ? `blur(${blur.toFixed(2)}px)` : undefined}} />;
};
export const PolyMini: React.FC<{cev: CEv[]; t: number; tm: number; byTm: boolean; cam: Cam; w: number; h: number; VW: number; VH: number}> = ({cev, t, tm, byTm, cam, w, h, VW, VH}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d'); if (!ctx) return;
    const st = polyState(cev, t, tm, byTm);
    const sx = w / 1920, sy = h / (1080 * 0.93);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#163a66'; ctx.fillRect(0, 0, w, h);
    ctx.setTransform(sx, 0, 0, sy, 0, 0);
    for (const p of PIECES) { if (p.k === undefined || !p.path) continue; ctx.fillStyle = MAINCOL[st.owner[p.k]]; ctx.fill(p.path); }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    const vw = (VW / cam.s) * (w / MAPW), vh = (VH / cam.s) * (h / (MAPH * 0.93));
    ctx.strokeRect(cam.cx * (w / MAPW) - vw / 2, cam.cy * (h / (MAPH * 0.93)) - vh / 2, vw, vh);
  });
  return <canvas ref={ref} width={w} height={h} style={{width: w, height: h, display: 'block'}} />;
};
void DARKCOL;
