// Capa de guerra: territorio ocupado (rayado) pintado por donde pasan los soldados, pelotones, defensores, explosiones y ciudades
import {MAINCOL, DARKCOL, flagBmp} from './HexWorld';

const W4 = 4;
export type WarData = {
  occ: any[][]; // k (tierra), atacante, t0, t1, pelotones, color?
  sq: {a: number; p: number[]; cl: number[]; pk: number[][]; r: number; n: number; t0: number; t1: number; fw?: number[][]; tx?: number; ty?: number; paint?: number}[];
  df: any[][]; // k, x, y, n, t0, tDie, color?
  fx: number[][]; // t, x, y, tamaño px, tipo (0 explosión grande, 1 pequeña, 2 onda)
  cities: any[][]; // nombre, x, y, cap, t0, t1
};
const kf = (pk: number[][], t: number) => {
  if (t <= pk[0][0]) return pk[0][1];
  for (let i = 1; i < pk.length; i++) if (t <= pk[i][0]) { const u = (t - pk[i - 1][0]) / (pk[i][0] - pk[i - 1][0]); const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; return pk[i - 1][1] + (pk[i][1] - pk[i - 1][1]) * (0.35 * u + 0.65 * e); }
  return pk[pk.length - 1][1];
};
const at = (q: WarData['sq'][0], d: number): [number, number, number, number] => {
  const cl = q.cl, p = q.p, n = cl.length;
  if (n < 2) return [p[0], p[1], 1, 0];
  d = Math.max(0, Math.min(cl[n - 1], d));
  let lo = 0, hi = n - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cl[m] <= d) lo = m; else hi = m; }
  const u = (d - cl[lo]) / Math.max(1e-6, cl[hi] - cl[lo]);
  const x = p[lo * 2] + (p[hi * 2] - p[lo * 2]) * u, y = p[lo * 2 + 1] + (p[hi * 2 + 1] - p[lo * 2 + 1]) * u;
  let dx = p[hi * 2] - p[lo * 2], dy = p[hi * 2 + 1] - p[lo * 2 + 1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
  return [x, y, dx, dy];
};
const hatch = new Map<string, CanvasPattern>();
const hatchOf = (ctx: CanvasRenderingContext2D, a: number, col?: string) => {
  const key = col || MAINCOL[a];
  let pt = hatch.get(key);
  if (!pt) {
    const c = document.createElement('canvas'); c.width = 28; c.height = 28; const g = c.getContext('2d')!;
    g.fillStyle = key; g.globalAlpha = 0.72; g.fillRect(0, 0, 28, 28); g.globalAlpha = 0.72; g.strokeStyle = '#ffffff'; g.lineWidth = 7;
    for (const o of [-28, 0, 28]) { g.beginPath(); g.moveTo(o, 28); g.lineTo(o + 28, 0); g.stroke(); }
    pt = ctx.createPattern(c, 'repeat')!; hatch.set(key, pt);
  }
  return pt;
};
const trail = (q: WarData['sq'][0], t: number, grow: number) => {
  const d = kf(q.pk, t); const r = q.r; const path = new Path2D();
  if (d <= 0.5) return path;
  const step = r * 0.4;
  for (let l = 0; l <= d + 1e-6; l += step) {
    const [x, y] = at(q, Math.min(l, d));
    const rr = r * (0.5 + 0.95 * Math.min(1, (d - l) / (3.2 * r))) + grow;
    path.moveTo(x + rr, y); path.arc(x, y, rr, 0, Math.PI * 2);
  }
  const [hx, hy] = at(q, d); path.moveTo(hx + r * 0.5 + grow, hy); path.arc(hx, hy, r * 0.5 + grow, 0, Math.PI * 2);
  return path;
};
// se llama dentro del contexto escalado x4 (coordenadas 1920)
const occAny = (occ: any[][], k: number, a: number, t0: number) => occ.find((o) => o[0] === k && o[1] === a && o[2] === t0);
export const drawOcc = (ctx: CanvasRenderingContext2D, war: WarData, t: number, s: number, vis: (b: number[]) => boolean, PIECES: any[]) => {
  for (const oe of war.occ) {
    const [k, a, t0, t1, ids, col] = oe as any; const EC = (oe as any)[7] || DARKCOL[a] || '#400';
    if (t < t0 || t > t1) continue;
    const clip = new Path2D(); let any = false;
    for (const p of PIECES) if (p.k === k && p.path && vis(p.bbox)) { clip.addPath(p.path); any = true; }
    if (!any) continue;
    ctx.save(); ctx.globalAlpha = Math.min(1, (t1 - t) / 0.5); ctx.clip(clip); ctx.scale(1 / W4, 1 / W4);
    const edge = new Path2D(), fill = new Path2D();
    for (const i of ids) { const q = war.sq[i]; if (t < q.t0 - 0.05) continue; edge.addPath(trail(q, t, 3.2 / s)); fill.addPath(trail(q, t, 0)); }
    const pt = hatchOf(ctx, a, col); pt.setTransform(new DOMMatrix().scale(1 / s, 1 / s));
    const ga = Math.min(1, (t1 - t) / 0.5);
    // avance automático desde las fronteras: todo menos la zona de la capital
    const gr = occAny(war.occ, k, a, t0)?.[6];
    if (gr && gr.fl) {
      // avance desde las fronteras/desembarcos siguiendo la forma del país (celdas ordenadas por llegada)
      const P = gr.fl as number[]; const N = P.length / 2;
      const f = Math.max(0, Math.min(1, kf(gr.fk, t))); const n = Math.floor(f * N);
      if (n > 0) {
        const rr = gr.r as number;
        const ge = new Path2D(), gf = new Path2D();
        for (let i = 0; i < n; i++) {
          const x = P[i * 2], y = P[i * 2 + 1];
          // las últimas celdas (el frente) crecen poco a poco
          const g = i > n - 40 ? 0.55 + 0.45 * ((n - i) / 40) : 1;
          ge.moveTo(x + rr * g + 3.2 / s, y); ge.arc(x, y, rr * g + 3.2 / s, 0, Math.PI * 2);
          gf.moveTo(x + rr * g, y); gf.arc(x, y, rr * g, 0, Math.PI * 2);
        }
        ctx.fillStyle = EC; ctx.fill(ge);
        ctx.fillStyle = col || MAINCOL[a]; ctx.globalAlpha = ga * 0.35; ctx.fill(gf); ctx.globalAlpha = ga;
        ctx.fillStyle = pt; ctx.fill(gf);
      }
    } else if (gr && t > gr.t0) {
      const u0 = Math.min(1, (t - gr.t0) / (gr.t1 - gr.t0)); const u = u0 < 0.5 ? 2 * u0 * u0 : 1 - Math.pow(-2 * u0 + 2, 2) / 2;
      const R = gr.rm * u;
      if (R > 1) {
        const ge = new Path2D(), gf = new Path2D();
        for (const [px, py] of gr.p) {
          const wob = 1 + 0.06 * Math.sin(px * 0.013 + py * 0.017 + t * 0.7);
          ge.moveTo(px + R * wob + 3.2 / s, py); ge.arc(px, py, R * wob + 3.2 / s, 0, Math.PI * 2);
          gf.moveTo(px + R * wob, py); gf.arc(px, py, R * wob, 0, Math.PI * 2);
        }
        ctx.save();
        const ex = new Path2D(); ex.rect(gr.cx - 20000, gr.cy - 20000, 40000, 40000); ex.arc(gr.cx, gr.cy, gr.rc, 0, Math.PI * 2);
        ctx.clip(ex, 'evenodd');
        ctx.fillStyle = EC; ctx.fill(ge);
        ctx.fillStyle = col || MAINCOL[a]; ctx.globalAlpha = ga * 0.35; ctx.fill(gf); ctx.globalAlpha = ga;
        ctx.fillStyle = pt; ctx.fill(gf);
        ctx.restore();
      }
    }
    ctx.fillStyle = EC; ctx.fill(edge);
    ctx.fillStyle = col || MAINCOL[a]; ctx.globalAlpha *= 0.35; ctx.fill(fill); ctx.globalAlpha = ga;
    ctx.fillStyle = pt; ctx.fill(fill);
    ctx.restore();
  }
};
// soldadito de cuerpo entero del color del país
const soldier = (ctx: CanvasRenderingContext2D, x: number, y: number, sz: number, col: string, dark: string, phase: number, dir: number, pose: number, fall = 0) => {
  ctx.save(); ctx.translate(x, y);
  if (!fall) { ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(0, sz * 0.62, sz * 0.3, sz * 0.09, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.scale(dir, 1); if (fall) ctx.rotate(-fall * Math.PI / 2);
  // halo claro para que se vean sobre territorio del mismo color
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = sz * 0.2; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.roundRect(-sz * 0.19, -sz * 0.14, sz * 0.38, sz * 0.44, sz * 0.1); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -sz * 0.29, sz * 0.2, 0, Math.PI * 2); ctx.stroke();
  const leg = pose === 0 ? Math.sin(phase) * sz * 0.2 : sz * 0.08;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = '#141414'; ctx.lineWidth = sz * 0.2;
  ctx.beginPath(); ctx.moveTo(-sz * 0.05, sz * 0.22); ctx.lineTo(-sz * 0.05 - leg, sz * 0.6); ctx.moveTo(sz * 0.05, sz * 0.22); ctx.lineTo(sz * 0.05 + leg, sz * 0.6); ctx.stroke();
  ctx.strokeStyle = dark; ctx.lineWidth = sz * 0.12;
  ctx.beginPath(); ctx.moveTo(-sz * 0.05, sz * 0.22); ctx.lineTo(-sz * 0.05 - leg, sz * 0.58); ctx.moveTo(sz * 0.05, sz * 0.22); ctx.lineTo(sz * 0.05 + leg, sz * 0.58); ctx.stroke();
  ctx.fillStyle = col; ctx.strokeStyle = '#141414'; ctx.lineWidth = sz * 0.07;
  ctx.beginPath(); ctx.roundRect(-sz * 0.19, -sz * 0.14, sz * 0.38, sz * 0.44, sz * 0.1); ctx.fill(); ctx.stroke();
  // fusil
  ctx.strokeStyle = '#141414'; ctx.lineWidth = sz * 0.1; const ay = pose === 1 ? -sz * 0.04 : sz * 0.04;
  ctx.beginPath(); ctx.moveTo(sz * 0.0, sz * 0.06); ctx.lineTo(sz * 0.55, ay - (pose === 1 ? 0 : sz * 0.12)); ctx.stroke();
  ctx.fillStyle = '#f2c79a'; ctx.lineWidth = sz * 0.06; ctx.beginPath(); ctx.arc(0, -sz * 0.27, sz * 0.15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = dark; ctx.beginPath(); ctx.arc(0, -sz * 0.31, sz * 0.19, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
};
const drawTank = (ctx: CanvasRenderingContext2D, tx: number, ty: number, sz: number, col: string, face: number, fire: boolean) => {
  ctx.save(); ctx.translate(tx, ty); ctx.scale(face, 1);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(0, sz * 0.5, sz * 0.9, sz * 0.15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#141414'; ctx.lineWidth = sz * 0.08;
  ctx.fillStyle = '#2d2d2d'; ctx.beginPath(); ctx.roundRect(-sz * 0.85, sz * 0.12, sz * 1.7, sz * 0.36, sz * 0.18); ctx.fill(); ctx.stroke();
  ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(-sz * 0.75, -sz * 0.18, sz * 1.5, sz * 0.36, sz * 0.08); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(-sz * 0.35, -sz * 0.48, sz * 0.7, sz * 0.32, sz * 0.12); ctx.fill(); ctx.stroke();
  ctx.lineWidth = sz * 0.12; ctx.beginPath(); ctx.moveTo(sz * 0.3, -sz * 0.33); ctx.lineTo(sz * 1.05, -sz * 0.36); ctx.stroke();
  if (fire) { ctx.fillStyle = '#ffe36b'; ctx.beginPath(); ctx.arc(sz * 1.12, -sz * 0.36, sz * 0.22, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(200,200,200,0.6)'; ctx.beginPath(); ctx.arc(sz * 1.35, -sz * 0.45, sz * 0.2, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
};
const hsh = (i: number) => { let x = (i + 0x9e3779b9) | 0; x = Math.imul(x ^ (x >>> 16), 0x85ebca6b); x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35); return ((x ^ (x >>> 16)) >>> 0) / 4294967296; };
const banner = (ctx: CanvasRenderingContext2D, x: number, y: number, sz: number, k: number, t: number, bc?: string) => {
  ctx.strokeStyle = '#141414'; ctx.lineWidth = sz * 0.08; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - sz * 1.25); ctx.stroke();
  const fw = sz * 0.95, fh = sz * 0.64; const wv = Math.sin(t * 7) * sz * 0.04;
  if (bc) {
    const yy = y - sz * 1.25 + wv; ctx.fillStyle = bc; ctx.fillRect(x, yy, fw, fh); ctx.lineWidth = sz * 0.05; ctx.strokeRect(x, yy, fw, fh);
    ctx.fillStyle = '#fff'; ctx.beginPath(); const cx = x + fw / 2, cy = yy + fh / 2, R0 = fh * 0.34;
    for (let i = 0; i < 10; i++) { const r = i % 2 ? R0 * 0.42 : R0, an = -Math.PI / 2 + (i * Math.PI) / 5; ctx.lineTo(cx + Math.cos(an) * r, cy + Math.sin(an) * r); }
    ctx.closePath(); ctx.fill(); return;
  }
  const bmp = flagBmp(k);
  if (bmp) { ctx.drawImage(bmp, x, y - sz * 1.25 + wv, fw, fh); ctx.lineWidth = sz * 0.05; ctx.strokeRect(x, y - sz * 1.25 + wv, fw, fh); }
};
const boom = (ctx: CanvasRenderingContext2D, x: number, y: number, R: number, d: number, seed: number) => {
  if (d < 0 || d > 1.1) return;
  const q = d / 1.1;
  // humo
  ctx.fillStyle = `rgba(60,60,60,${0.55 * (1 - q)})`;
  for (let i = 0; i < 5; i++) { const an = hsh(seed + i) * Math.PI * 2; ctx.beginPath(); ctx.arc(x + Math.cos(an) * R * 0.6 * q, y - R * 0.9 * q + Math.sin(an) * R * 0.4 * q, R * (0.35 + 0.6 * q), 0, Math.PI * 2); ctx.fill(); }
  if (d < 0.45) {
    const u = d / 0.45;
    ctx.fillStyle = `rgba(255,140,30,${1 - u})`; ctx.beginPath();
    for (let i = 0; i < 16; i++) { const an = (i * Math.PI) / 8 + seed, rr = (i % 2 ? 0.55 : 1.05) * R * (0.5 + u * 0.8); ctx.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = `rgba(255,236,140,${1 - u})`; ctx.beginPath(); ctx.arc(x, y, R * 0.55 * (0.6 + u), 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${(1 - u) * 0.9})`; ctx.beginPath(); ctx.arc(x, y, R * 0.28 * (1 - u * 0.5), 0, Math.PI * 2); ctx.fill();
  }
};
// se llama en coordenadas de mapa (transformación de cámara)
export const drawUnits = (ctx: CanvasRenderingContext2D, war: WarData, t: number, s: number, x0: number, x1: number, y0: number, y1: number) => {
  if (s < 0.3) return;
  const za = Math.min(1, (s - 0.3) / 0.2);
  const sz = (40 * Math.min(1.2, Math.max(0.7, Math.sqrt(s / 1.4)))) / s;
  const inV = (x: number, y: number, m: number) => x > x0 - m && x < x1 + m && y > y0 - m && y < y1 + m;
  const ex = (war as any).ext;
  if (ex) {
    // cráteres
    for (const [tc, x, y, big] of ex.crater) {
      if (t < tc || !inV(x, y, 80 / s)) continue;
      const R = (big ? 44 : 32) / s * Math.min(1, (t - tc) / 0.3);
      const g = ctx.createRadialGradient(x, y, 0, x, y, R); g.addColorStop(0, 'rgba(20,14,10,0.75)'); g.addColorStop(0.6, 'rgba(40,30,20,0.45)'); g.addColorStop(1, 'rgba(40,30,20,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y + 4 / s, R * 1.3, R * 0.8, 0, 0, Math.PI * 2); ctx.fill();
    }
    // nombres de mares
    if (s > 0.5 && s < 4) {
      ctx.save(); ctx.font = `italic 600 ${(19 / s).toFixed(2)}px Fredoka`; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(200,230,255,0.55)';
      const al = Math.min(1, (s - 0.5) / 0.3, (4 - s) / 0.5);
      ctx.globalAlpha = al;
      for (const [n, x, y] of ex.seas) { if (!inV(x, y, 200 / s)) continue; ctx.save(); ctx.translate(x, y); (ctx as any).letterSpacing = `${(4 / s).toFixed(2)}px`; ctx.fillText(n, 0, 0); ctx.restore(); }
      ctx.restore();
    }
  }
  // ciudades
  if (s > 0.75) {
    const a = Math.min(1, (s - 0.75) / 0.35);
    ctx.font = `600 ${Math.round(17 / s * 10) / 10}px Fredoka`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const [n, x, y, cap, c0, c1] of war.cities) {
      if (t < c0 || t > c1 || !inV(x, y, 100 / s)) continue;
      const ca = a * Math.min(1, (t - c0) / 0.4, (c1 - t) / 0.4);
      ctx.globalAlpha = ca;
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#151515'; ctx.lineWidth = 2.4 / s;
      ctx.beginPath(); ctx.arc(x, y, (cap ? 6 : 4.5) / s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      const w = ctx.measureText(n).width + 16 / s, h = 26 / s;
      ctx.beginPath(); ctx.roundRect(x - w / 2, y + 9 / s, w, h, 7 / s); ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.fill(); ctx.lineWidth = 2 / s; ctx.stroke();
      ctx.fillStyle = '#151515'; ctx.fillText(n, x, y + 9 / s + h / 2 + 1 / s);
    }
    ctx.globalAlpha = 1;
  }
  // defensores
  war.df.forEach((dfe, di) => {
    const [k, x, y, n, d0, tDie, dcol, spread] = dfe; const surv = !!(dfe as any)[8];
    const sp = (spread as number) || 0;
    if (t < d0 || t > tDie + 0.9 || !inV(x, y, 60 / s)) return;
    const base = za * Math.min(1, (t - d0) / 0.4);
    for (let i = 0; i < n; i++) {
      // con 'spread' caen uno a uno mientras les disparan; el último cae en tDie
      const order = sp ? Math.floor(hsh(di * 7 + i * 3) * 1000) % n : n - 1;
      const ti = sp ? tDie - sp + (sp * (order + 1)) / n : tDie;
      const dead = !surv && t > ti; const fall = dead ? Math.min(1, (t - ti) / 0.25) : 0;
      const al = surv ? Math.max(0, Math.min(1, (tDie + 0.5 - t) / 0.5)) : dead ? Math.max(0, 1 - (t - ti - 0.35) / 0.5) : 1;
      if (al <= 0) continue;
      ctx.globalAlpha = base * al;
      const shoot = !dead && (surv ? t > d0 + 0.6 && t < tDie : t > tDie - Math.max(1.6, sp));
      const ox = ((i % 3) - 1) * sz * 0.8 + (hsh(di * 13 + i) - 0.5) * sz * 0.4, oy = Math.floor(i / 3) * sz * 0.7 - sz * 0.35;
      const dir = hsh(di + i * 7) < 0.5 ? -1 : 1;
      soldier(ctx, x + ox, y + oy - sz * 0.9, sz, (dcol as any) || MAINCOL[k], DARKCOL[k] || '#333', 0, dir, shoot ? 1 : 2, fall);
      if (dead && t - ti < 0.3) { ctx.fillStyle = `rgba(255,80,60,${0.8 * (1 - (t - ti) / 0.3)})`; ctx.beginPath(); ctx.arc(x + ox, y + oy - sz * 1.1, sz * 0.35, 0, Math.PI * 2); ctx.fill(); }
      if (shoot && Math.floor(t * 12 + i * 3) % 5 === 0) { ctx.fillStyle = '#ffe36b'; ctx.beginPath(); ctx.arc(x + ox + sz * 0.6 * dir, y + oy - sz * 0.95, sz * 0.14, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.globalAlpha = base;
    if (t < tDie - 0.1) banner(ctx, x + sz * 1.2, y - sz * 0.6, sz, k, t + di, (dfe as any)[9]);
    ctx.globalAlpha = 1;
  });
  // pelotones
  war.sq.forEach((q, qi) => {
    if (t < q.t0 || t > q.t1 + 0.5) return;
    const d = kf(q.pk, t), d2 = kf(q.pk, t + 0.15);
    const [hx, hy, dx, dy] = at(q, d);
    if (!inV(hx, hy, 120 / s)) return;
    const moving = Math.abs(d2 - d) > 0.05;
    const fight = !!q.fw && q.fw.some(([a, b]) => t >= a && t <= b);
    ctx.globalAlpha = za * Math.min(1, (t - q.t0) / 0.3) * Math.max(0, Math.min(1, (q.t1 + 0.5 - t) / 0.5));
    const back = d2 < d - 0.05; // retirada
    const face = (back ? -dx : dx) >= 0 ? 1 : -1;
    const vx = -dy, vy = dx;
    if ((q as any).kind === 'tank') {
      const ts = sz * 0.8;
      for (let i = q.n - 1; i >= 0; i--) {
        const row = Math.floor(i / 2), col = q.n === 1 ? 0 : (i % 2) - 0.5;
        const px = hx - dx * row * ts * 1.75 + vx * col * ts * 1.5, py = hy - dy * row * ts * 1.75 + vy * col * ts * 1.5;
        // polvo detrás
        if (moving) { ctx.fillStyle = `rgba(190,170,130,${0.35})`; ctx.beginPath(); ctx.arc(px - dx * ts * 1.2, py - dy * ts * 1.2 + ts * 0.3, ts * (0.5 + 0.2 * Math.sin(t * 9 + i)), 0, Math.PI * 2); ctx.fill(); }
        drawTank(ctx, px, py, ts, (q as any).col || MAINCOL[q.a], face, fight && Math.floor(t * 4 + i * 2) % 3 === 0);
      }
      banner(ctx, hx + sz * 0.3, hy - sz * 1.2, sz, q.a, t + qi, (q as any).bn);
      ctx.globalAlpha = 1;
      return;
    }
    for (let i = q.n - 1; i >= 0; i--) {
      const row = Math.floor(i / 3), col = (i % 3) - 1;
      const jx = (hsh(qi * 31 + i) - 0.5) * sz * 0.35, jy = (hsh(qi * 17 + i) - 0.5) * sz * 0.3;
      const px = hx - dx * row * sz * 0.85 + vx * col * sz * 0.7 + jx, py = hy - dy * row * sz * 0.85 + vy * col * sz * 0.7 + jy;
      soldier(ctx, px, py - sz * 0.3, sz, (q as any).col || MAINCOL[q.a], DARKCOL[q.a] || '#333', t * 13 + i * 1.9, face, moving && !fight ? 0 : 1);
      if (fight && Math.floor(t * 14 + i * 5) % 4 === 0) {
        ctx.fillStyle = '#ffe36b'; ctx.beginPath(); ctx.arc(px + face * sz * 0.62, py - sz * 0.32, sz * 0.15, 0, Math.PI * 2); ctx.fill();
      }
    }
    if ((q as any).tank && (q as any).kind !== 'tank') drawTank(ctx, hx + dx * sz * 1.3, hy + dy * sz * 1.3 + sz * 0.15, sz, (q as any).col || MAINCOL[q.a], face, fight && Math.floor(t * 3 + qi) % 3 === 0);
    banner(ctx, hx - dx * sz * 0.3 + sz * 0.2, hy - sz * 0.75, sz, q.a, t + qi, (q as any).bn);
    // trazadoras hacia el objetivo
    if (fight && q.tx !== undefined) {
      ctx.strokeStyle = 'rgba(255,230,120,0.85)'; ctx.lineWidth = 2.2 / s; ctx.lineCap = 'round';
      for (let j = 0; j < 3; j++) {
        const u = ((t * 2.6 + j * 0.37 + hsh(qi + j)) % 1);
        const ax = hx + (q.tx - hx) * u, ay = hy - sz * 0.4 + (q.ty! - hy) * u;
        const bx = hx + (q.tx - hx) * Math.min(1, u + 0.08), by = hy - sz * 0.4 + (q.ty! - hy) * Math.min(1, u + 0.08);
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  });
  if (ex) {
    // humo que queda sobre las bases destruidas
    for (const [a, b, x, y] of ex.smoke) {
      if (t < a || t > b || !inV(x, y, 150 / s)) continue;
      const fa = Math.min(1, (t - a) / 0.6, (b - t) / 1.5);
      for (let i = 0; i < 6; i++) {
        const ph = ((t - a) * 0.45 + i / 6) % 1;
        const r = (10 + ph * 26) / s;
        ctx.fillStyle = `rgba(70,70,74,${0.45 * (1 - ph) * fa})`;
        ctx.beginPath(); ctx.arc(x + Math.sin(i * 2.1 + ph * 3) * 8 / s + ph * 26 / s, y - ph * 90 / s, r, 0, Math.PI * 2); ctx.fill();
      }
    }
    // artillería
    for (const [a, xa, ya, xb, yb] of ex.arty) {
      const d = t - a; if (d < 0 || d > 0.85 || !inV((xa + xb) / 2, (ya + yb) / 2, 400 / s)) continue;
      const u = d / 0.85; const hgt = Math.hypot(xb - xa, yb - ya) * 0.45 + 30 / s;
      const px = xa + (xb - xa) * u, py = ya + (yb - ya) * u - Math.sin(u * Math.PI) * hgt;
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2.5 / s; ctx.beginPath();
      for (let j = 0; j <= 10; j++) { const uu = Math.max(0, u - 0.25) + (u - Math.max(0, u - 0.25)) * (j / 10); const qx = xa + (xb - xa) * uu, qy = ya + (yb - ya) * uu - Math.sin(uu * Math.PI) * hgt; if (j) ctx.lineTo(qx, qy); else ctx.moveTo(qx, qy); }
      ctx.stroke(); ctx.fillStyle = '#ffe9a0'; ctx.beginPath(); ctx.arc(px, py, 4.5 / s, 0, Math.PI * 2); ctx.fill();
      if (u > 0.92) boom(ctx, xb, yb, 22 / s, (d - 0.78) * 2, a);
    }
  }
  // explosiones
  for (const [t0, x, y, size, type] of war.fx) {
    const d = t - t0; if (d < 0 || d > 1.2 || !inV(x, y, 200 / s)) continue;
    if (type === 2) {
      const q = d / 1.2; ctx.strokeStyle = `rgba(255,255,255,${0.9 * (1 - q)})`; ctx.lineWidth = (10 * (1 - q) + 1) / s;
      ctx.beginPath(); ctx.arc(x, y, (size * 4 * q) / s + 4 / s, 0, Math.PI * 2); ctx.stroke();
      continue;
    }
    boom(ctx, x, y, (type === 1 ? size * 0.55 : size) / Math.max(0.6, s) , d, t0 * 7.13);
  }
  if (ex && ex.bombs) {
    // bombas que caen desde los aviones
    for (const [a, x, y] of ex.bombs) {
      const d = t - a; if (d < 0 || d > 0.6 || !inV(x, y, 200 / s)) continue;
      const u = d / 0.6; const by = y - (1 - u * u) * 140 / Math.max(0.6, s);
      ctx.fillStyle = '#1b1b1b'; ctx.beginPath(); ctx.ellipse(x, by, 4.5 / s, 8 / s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2 / s; ctx.beginPath(); ctx.moveTo(x, by - 10 / s); ctx.lineTo(x, by - 40 / s); ctx.stroke();
    }
    // barra de vida de la capital durante el asedio
    for (const ch of ex.caphp) {
      const [k, x, y, a, b] = ch;
      if (t < a - 0.4 || t > b + 0.4 || !inV(x, y, 200 / s)) continue;
      const hp = ch[5] ? Math.max(0, Math.min(1, kf(ch[5], t))) : t < a ? 1 : t > b ? 0 : Math.max(0, 1 - Math.pow((t - a) / (b - a), 0.85) - 0.04 * Math.floor((t - a) * 1.2) * 0);
      const al = Math.min(1, (t - a + 0.4) / 0.3, (b + 0.4 - t) / 0.3);
      const w = 120 / s, h = 16 / s, bx = x + 34 / s, by = y - 46 / s;
      ctx.globalAlpha = al;
      ctx.fillStyle = 'rgba(15,15,20,0.85)'; ctx.beginPath(); ctx.roundRect(bx - 3 / s, by - 24 / s, w + 6 / s, h + 28 / s, 6 / s); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = `700 ${(14 / s).toFixed(2)}px Fredoka`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('⭐ CAPITAL', bx + 2 / s, by - 7 / s);
      ctx.fillStyle = '#3a3a3a'; ctx.fillRect(bx, by, w, h);
      ctx.fillStyle = hp > 0.5 ? '#3bd16f' : hp > 0.25 ? '#ffc23a' : '#ff3b30'; ctx.fillRect(bx, by, w * hp, h);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2 / s; ctx.strokeRect(bx, by, w, h);
      ctx.globalAlpha = 1;
    }
  }
  if (ex) {
    // banderas izadas en las capitales tomadas
    for (const [a, x, y, fk] of ex.flags) {
      const d = t - a; if (d < 0 || d > 3.2 || !inV(x, y, 100 / s)) continue;
      const fa = Math.min(1, (3.2 - d) / 0.5); ctx.globalAlpha = fa;
      const H = 70 / s, up = Math.min(1, d / 0.8);
      ctx.strokeStyle = '#141414'; ctx.lineWidth = 4 / s; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - H); ctx.stroke();
      const bmp = flagBmp(fk !== undefined && fk >= 0 ? fk : (war as any).empire ?? 0); const fy = y - H * (0.15 + 0.85 * up);
      const fw = 40 / s, fh = 27 / s, wv = Math.sin(t * 8) * 2 / s;
      if (bmp) { ctx.drawImage(bmp, x, fy + wv, fw, fh); ctx.lineWidth = 2 / s; ctx.strokeRect(x, fy + wv, fw, fh); }
      ctx.globalAlpha = 1;
    }
    // misiles: arco con estela de humo
    for (const [a, b, xa, ya, xb, yb] of (ex.missiles || [])) {
      const d = t - a; if (d < -0.3 || t > b + 0.8) continue;
      const dist = Math.hypot(xb - xa, yb - ya); const hgt = dist * 0.32 + 60 / s;
      const posAt = (u: number): [number, number] => [xa + (xb - xa) * u, ya + (yb - ya) * u - Math.sin(u * Math.PI) * hgt];
      const u = Math.max(0, Math.min(1, (t - a) / (b - a)));
      // humo
      for (let j = 0; j < 22; j++) {
        const uu = u - j * 0.018; if (uu <= 0) break;
        const [px, py] = posAt(uu); const age = j / 22;
        const fade = t > b ? Math.max(0, 1 - (t - b) / 0.8) : 1;
        ctx.fillStyle = `rgba(225,225,230,${0.55 * (1 - age) * fade})`; ctx.beginPath(); ctx.arc(px, py, (4 + 9 * age) / s, 0, Math.PI * 2); ctx.fill();
      }
      if (t >= a && t <= b) {
        const [px, py] = posAt(u); const [qx, qy] = posAt(Math.min(1, u + 0.01)); const ang = Math.atan2(qy - py, qx - px);
        ctx.save(); ctx.translate(px, py); ctx.rotate(ang); const L = 16 / s;
        ctx.fillStyle = '#ff9d2e'; ctx.beginPath(); ctx.moveTo(-L * 0.9, 0); ctx.lineTo(-L * (1.5 + 0.4 * Math.sin(t * 40)), -L * 0.18); ctx.lineTo(-L * (1.5 + 0.4 * Math.sin(t * 40)), L * 0.18); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#e8e8e8'; ctx.strokeStyle = '#151515'; ctx.lineWidth = 1.6 / s;
        ctx.beginPath(); ctx.moveTo(L, 0); ctx.lineTo(L * 0.55, -L * 0.2); ctx.lineTo(-L * 0.9, -L * 0.2); ctx.lineTo(-L * 0.9, L * 0.2); ctx.lineTo(L * 0.55, L * 0.2); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#c0261e'; ctx.beginPath(); ctx.moveTo(L, 0); ctx.lineTo(L * 0.55, -L * 0.2); ctx.lineTo(L * 0.55, L * 0.2); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      if (d >= 0 && d < 0.4) { ctx.fillStyle = `rgba(255,220,120,${1 - d / 0.4})`; ctx.beginPath(); ctx.arc(xa, ya, (14 + 40 * d) / s, 0, Math.PI * 2); ctx.fill(); }
    }
    // paracaidistas
    for (const [a, x, y, n, colh] of (ex.para || [])) {
      const d = t - a; if (d < 0 || d > 1.6 || !inV(x, y, 300 / s)) continue;
      const u = Math.min(1, d / 1.4);
      for (let i = 0; i < n; i++) {
        const ox = ((i % 4) - 1.5) * 22 / s + Math.sin(t * 2 + i) * 4 / s, oy = Math.floor(i / 4) * 18 / s;
        const py = y + oy - (1 - u) * 170 / s, px = x + ox;
        ctx.globalAlpha = d > 1.4 ? 1 - (d - 1.4) / 0.2 : 1;
        ctx.fillStyle = '#f4f4f4'; ctx.strokeStyle = '#151515'; ctx.lineWidth = 1.5 / s;
        ctx.beginPath(); ctx.arc(px, py - 22 / s, 11 / s, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px - 10 / s, py - 22 / s); ctx.lineTo(px, py - 6 / s); ctx.lineTo(px + 10 / s, py - 22 / s); ctx.stroke();
        ctx.fillStyle = colh || '#556b2f'; ctx.beginPath(); ctx.roundRect(px - 3.5 / s, py - 7 / s, 7 / s, 10 / s, 2 / s); ctx.fill(); ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
    // fuego antiaéreo
    for (const [a, b, x, y] of (ex.flak || [])) {
      if (t < a || t > b || !inV(x, y, 300 / s)) continue;
      ctx.strokeStyle = 'rgba(255,230,120,0.8)'; ctx.lineWidth = 2 / s; ctx.lineCap = 'round';
      for (let j = 0; j < 5; j++) {
        const ph = (t * 1.7 + j * 0.23) % 1; const an = -Math.PI / 2 + (hsh(j * 7 + Math.floor(t * 1.7 + j * 0.23)) - 0.5) * 1.4;
        const r0 = ph * 220 / s; const sx = x + (hsh(j) - 0.5) * 40 / s;
        ctx.beginPath(); ctx.moveTo(sx + Math.cos(an) * r0, y + Math.sin(an) * r0); ctx.lineTo(sx + Math.cos(an) * (r0 + 22 / s), y + Math.sin(an) * (r0 + 22 / s)); ctx.stroke();
        if (ph > 0.85) { ctx.fillStyle = 'rgba(90,90,95,0.7)'; ctx.beginPath(); ctx.arc(sx + Math.cos(an) * 240 / s, y + Math.sin(an) * 240 / s, 9 / s, 0, Math.PI * 2); ctx.fill(); }
      }
    }
    // cazas (con escuadrón opcional)
    for (const jt of ex.jets) for (let fm = 0; fm < (jt[7] || 1); fm++) {
      const [a0, b0, xa, ya, xb, yb, k] = jt; const a = a0 + fm * 0.12, b = b0 + fm * 0.12;
      if (t < a || t > b) continue;
      const u = (t - a) / (b - a); const ang0 = Math.atan2(yb - ya, xb - xa); const off = fm === 0 ? 0 : (fm % 2 ? 1 : -1) * Math.ceil(fm / 2) * 38 / Math.max(0.5, s);
      const x = xa + (xb - xa) * u + Math.cos(ang0 + Math.PI / 2) * off - Math.cos(ang0) * Math.abs(off) * 0.8, y = ya + (yb - ya) * u + Math.sin(ang0 + Math.PI / 2) * off - Math.sin(ang0) * Math.abs(off) * 0.8;
      if (!inV(x, y, 300 / s)) continue;
      const ang = Math.atan2(yb - ya, xb - xa); const L = 26 / Math.max(0.5, s);
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 3 / Math.max(0.5, s);
      for (const off of [-0.35, 0.35]) { ctx.beginPath(); ctx.moveTo(x - Math.cos(ang) * L * 0.3 + Math.cos(ang + Math.PI / 2) * L * off, y - Math.sin(ang) * L * 0.3 + Math.sin(ang + Math.PI / 2) * L * off); ctx.lineTo(x - Math.cos(ang) * L * 6 + Math.cos(ang + Math.PI / 2) * L * off, y - Math.sin(ang) * L * 6 + Math.sin(ang + Math.PI / 2) * L * off); ctx.stroke(); }
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
      ctx.fillStyle = '#2d3640'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5 / Math.max(0.5, s);
      ctx.beginPath(); ctx.moveTo(L, 0); ctx.lineTo(-L * 0.6, -L * 0.18); ctx.lineTo(-L * 0.2, -L * 0.75); ctx.lineTo(-L * 0.45, -L * 0.75); ctx.lineTo(-L * 0.75, -L * 0.15); ctx.lineTo(-L, -L * 0.35); ctx.lineTo(-L, L * 0.35); ctx.lineTo(-L * 0.75, L * 0.15); ctx.lineTo(-L * 0.45, L * 0.75); ctx.lineTo(-L * 0.2, L * 0.75); ctx.lineTo(-L * 0.6, L * 0.18); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = MAINCOL[k]; ctx.beginPath(); ctx.arc(-L * 0.1, 0, L * 0.14, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }
};
