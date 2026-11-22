// ¿Dónde NO hay McDonald's? — El Mapa Curioso (1920x1080, 30 fps)
import React, {useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import D0 from './mc.json';
import G0 from './geo.json';

const D = D0 as any;
const G = G0 as Record<string, {d: string; bb: number[]; c: number[]; r: number}>;
export const MC_FRAMES = Math.round(D.dur * 30);
const W = 1920, H = 1080;
const COL: Record<string, string> = {H: '#2fbf63', F: '#ffb020', N: '#ee4646'};
const COLD: Record<string, string> = {H: '#17803d', F: '#b87400', N: '#a51f1f'};
const LABEL: Record<string, string> = {H: 'HAY McDONALD\'S', F: 'SE FUE', N: 'NUNCA LLEGÓ'};
const Ic: React.FC<{k: string; s?: number; c?: string}> = ({k, s = 26, c = '#fff'}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{display: 'inline-block', verticalAlign: '-0.12em'}}>
    {k === 'H' ? <path d="M4 12.5 L10 18 L20 6" fill="none" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      : k === 'F' ? <path d="M9 5 L4 10 L9 15 M4 10 H14 A6 6 0 0 1 14 22 H10" fill="none" stroke={c} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
      : <path d="M5 5 L19 19 M19 5 L5 19" fill="none" stroke={c} strokeWidth="4" strokeLinecap="round" />}
  </svg>
);
const INK = '#14213d';
const F1 = 'Lilita, sans-serif', F2 = 'Fredoka, sans-serif';

// ---------------- recursos ----------------
const PATHS: Record<string, Path2D> = {};
const FLAG: Record<string, HTMLCanvasElement> = {};
let READY = false;
const C = D.C as any[];
const CODES = C.map((c) => c.c);
if (typeof window !== 'undefined') {
  const h = delayRender('mc-assets', {timeoutInMilliseconds: 120000});
  for (const k of Object.keys(G)) PATHS[k] = new Path2D(G[k].d);
  const fonts = [
    new FontFace('Lilita', `url(${staticFile('lilita.woff2')})`).load(),
    new FontFace('Lilita', `url(${staticFile('lilita-ext.woff2')})`, {unicodeRange: 'U+0100-024F'}).load(),
    new FontFace('Fredoka', `url(${staticFile('fredoka600.woff2')})`, {weight: '600'}).load(),
    new FontFace('Fredoka', `url(${staticFile('fredoka700.woff2')})`, {weight: '700'}).load(),
  ].map((p) => p.then((f) => { (document as any).fonts.add(f); }).catch(() => null));
  const imgs = CODES.map((c) => new Promise<void>((res) => {
    const im = new Image();
    im.onload = () => { const cv = document.createElement('canvas'); cv.width = 480; cv.height = 360; cv.getContext('2d')!.drawImage(im, 0, 0, 480, 360); FLAG[c] = cv; res(); };
    im.onerror = () => res();
    im.src = staticFile(`wflags/${c.toLowerCase()}.svg`);
  }));
  Promise.all([...fonts, ...imgs]).then(() => { READY = true; continueRender(h); });
}

// ---------------- utilidades ----------------
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (t: number, t0: number, t1: number, a = 0, b = 1) => a + (b - a) * clamp((t - t0) / (t1 - t0));
const easeOut = (u: number) => 1 - Math.pow(1 - clamp(u), 3);
const back = (u: number) => { u = clamp(u); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };
const popT = (t: number, t0: number, dur = 0.35) => back((t - t0) / dur);
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const idxAt = (t: number) => { let i = -1; for (let k = 0; k < C.length; k++) { if (C[k].t0 <= t) i = k; else break; } return i; };
const talkAt = (t: number) => (D.talks as any[]).filter((x) => t >= x.t0 && t < x.t1);
const ampOf = (tk: any, t: number) => { const i = Math.floor((t - tk.t0) * 30); const ch = tk.e[i]; return ch ? +ch / 9 : 0; };

// ---------------- cara (canvas) ----------------
type Mood = 'curious' | 'happy' | 'sad' | 'angry';
export function drawFace(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, mood: Mood, open: number, t: number, seed: number) {
  const blink = ((t + hash(seed) * 3) % 3.2) < 0.12;
  const ex = r * 0.42, ey = -r * 0.12, ew = r * 0.33, eh = r * 0.4;
  const look = Math.sin(t * 1.3 + seed) * 0.25;
  ctx.save(); ctx.translate(x, y);
  ctx.lineWidth = Math.max(2, r * 0.07); ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  for (const sx of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(sx * ex, ey, ew, blink ? eh * 0.12 : eh, 0, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
    if (!blink) {
      ctx.beginPath(); ctx.arc(sx * ex + look * ew * 0.6, ey + eh * 0.12, ew * 0.55, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
      ctx.beginPath(); ctx.arc(sx * ex + look * ew * 0.6 - ew * 0.18, ey - eh * 0.08, ew * 0.18, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
    }
    // cejas
    ctx.beginPath();
    const by = ey - eh - r * 0.12;
    if (mood === 'angry') { ctx.moveTo(sx * (ex + ew), by - r * 0.08); ctx.lineTo(sx * (ex - ew * 0.6), by + r * 0.1); }
    else if (mood === 'sad') { ctx.moveTo(sx * (ex + ew), by + r * 0.1); ctx.lineTo(sx * (ex - ew * 0.6), by - r * 0.06); }
    else if (mood === 'happy') { ctx.moveTo(sx * (ex + ew * 0.9), by + r * 0.02); ctx.quadraticCurveTo(sx * ex, by - r * 0.12, sx * (ex - ew * 0.9), by + r * 0.02); }
    else { ctx.moveTo(sx * (ex + ew * 0.8), by); ctx.lineTo(sx * (ex - ew * 0.8), by - r * 0.03); }
    ctx.stroke();
  }
  // boca
  const my = r * 0.45, mw = r * 0.36;
  ctx.fillStyle = '#5a1020';
  if (open > 0.08) {
    const oh = r * (0.08 + 0.32 * open);
    ctx.beginPath(); ctx.ellipse(0, my, mw * (0.7 + 0.3 * open), oh, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.clip(); ctx.beginPath(); ctx.ellipse(0, my + oh * 0.8, mw * 0.6, oh * 0.5, 0, 0, Math.PI * 2); ctx.fillStyle = '#ff7a8a'; ctx.fill(); ctx.restore();
  } else if (mood === 'happy') {
    ctx.beginPath(); ctx.moveTo(-mw, my - r * 0.05); ctx.quadraticCurveTo(0, my + r * 0.32, mw, my - r * 0.05); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if (mood === 'sad') {
    ctx.beginPath(); ctx.moveTo(-mw * 0.7, my + r * 0.12); ctx.quadraticCurveTo(0, my - r * 0.12, mw * 0.7, my + r * 0.12); ctx.stroke();
    // lágrima
    ctx.beginPath(); ctx.ellipse(ex + ew * 0.4, ey + eh * 1.3 + ((t * 0.8) % 1) * r * 0.3, r * 0.07, r * 0.11, 0, 0, Math.PI * 2); ctx.fillStyle = '#7fd0ff'; ctx.fill();
  } else if (mood === 'angry') {
    ctx.beginPath(); ctx.moveTo(-mw * 0.8, my + r * 0.1); ctx.quadraticCurveTo(0, my - r * 0.1, mw * 0.8, my + r * 0.1); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(0, my, r * 0.1, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  // mejillas
  ctx.globalAlpha = 0.35; ctx.fillStyle = '#ff6b8a';
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * r * 0.72, r * 0.3, r * 0.14, r * 0.09, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
const moodOf = (c: any, t: number): Mood => (t < c.td ? 'curious' : c.st === 'H' ? 'happy' : c.st === 'F' ? 'sad' : 'angry');

// ---------------- mapa ----------------
const MapCanvas: React.FC<{t: number; f: number}> = ({t, f}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const cv = ref.current; if (!cv || !READY) return;
    const ctx = cv.getContext('2d')!;
    const cam = D.cam[Math.min(f, D.cam.length - 1)];
    const [cx, cy, s] = cam;
    // océano
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const g = ctx.createRadialGradient(W / 2, H * 0.45, 100, W / 2, H / 2, 1250);
    g.addColorStop(0, '#2a8fd0'); g.addColorStop(0.6, '#1a6aa8'); g.addColorStop(1, '#0d3f73');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.setTransform(s, 0, 0, s, W / 2 - cx * s, H / 2 - cy * s);
    // retícula sutil
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1.2 / s;
    for (let x = 0; x <= 5500; x += 228) { ctx.beginPath(); ctx.moveTo(x, -50); ctx.lineTo(x, 2700); ctx.stroke(); }
    for (let y = 0; y <= 2700; y += 223) { ctx.beginPath(); ctx.moveTo(-50, y); ctx.lineTo(5520, y); ctx.stroke(); }
    // tierra
    const i = idxAt(t);
    const decided: Record<string, string> = {};
    for (const c of C) if (t >= c.td) decided[c.c] = c.st;
    const cur = i >= 0 ? C[i] : null;
    const prev = i > 0 ? C[i - 1] : null;
    // sombra de tierra
    ctx.save(); ctx.translate(2 / s, 4 / s); ctx.fillStyle = 'rgba(0,20,50,0.35)';
    for (const k in PATHS) ctx.fill(PATHS[k]);
    ctx.restore();
    for (const k in PATHS) {
      const st = decided[k];
      ctx.fillStyle = st ? COL[st] : k[0] === '_' ? '#c9ced6' : '#e6e9ee';
      ctx.fill(PATHS[k]);
    }
    ctx.lineWidth = Math.max(0.35, 1.1 / s); ctx.strokeStyle = 'rgba(40,55,80,0.55)'; ctx.lineJoin = 'round';
    for (const k in PATHS) ctx.stroke(PATHS[k]);
    // país actual (y el anterior mientras se colorea)
    const flagOn = (c: any, a: number, scl: number) => {
      const p = PATHS[c.c]; if (!p) return;
      const [x0, y0, x1, y1] = c.bb; const ax = c.ax, ay = c.ay;
      ctx.save(); ctx.translate(ax, ay); ctx.scale(scl, scl); ctx.translate(-ax, -ay);
      ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
      ctx.fillStyle = '#fff'; ctx.globalAlpha = a; ctx.fill(p); ctx.shadowColor = 'transparent';
      ctx.save(); ctx.clip(p);
      const fl = FLAG[c.c];
      if (fl) ctx.drawImage(fl, x0, y0, x1 - x0, y1 - y0);
      ctx.restore();
      ctx.lineWidth = 3.2 / s; ctx.strokeStyle = '#fff'; ctx.stroke(p);
      ctx.restore(); ctx.globalAlpha = 1;
    };
    const recolor = (c: any, k: number) => {
      const p = PATHS[c.c]; if (!p || k <= 0) return;
      ctx.globalAlpha = k; ctx.fillStyle = COL[c.st]; ctx.fill(p); ctx.lineWidth = 2 / s; ctx.strokeStyle = COLD[c.st]; ctx.stroke(p); ctx.globalAlpha = 1;
    };
    if (prev && !prev.pin && t < prev.t1 + 0.45) { flagOn(prev, 1, 1); recolor(prev, lerp(t, prev.t1, prev.t1 + 0.4)); }
    if (cur && !cur.pin && t < D.out0) {
      const u = (t - cur.pop) / 0.3;
      if (u > 0) { const sc = 1 + 0.18 * (1 - back(u)); flagOn(cur, clamp(u * 2), u < 1 ? sc : 1); }
      recolor(cur, lerp(t, cur.t1, cur.t1 + 0.4));
    }
    // ---- caras y chinchetas (espacio de pantalla) ----
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const toS = (x: number, y: number) => [W / 2 + (x - cx) * s, H / 2 + (y - cy) * s];
    const talks = talkAt(t);
    const faceFor = (c: any, alpha: number) => {
      const [sx, sy] = toS(c.ax, c.ay);
      const tk = talks.find((x) => x.who === c.c);
      const open = tk ? ampOf(tk, t) : 0;
      if (c.pin) {
        const u = popT(t, c.pop, 0.4); if (u <= 0) return;
        const R = 58 * u;
        ctx.save(); ctx.globalAlpha = alpha;
        const py = sy - 70 * u;
        ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx - 16, py + R * 0.7); ctx.lineTo(sx + 16, py + R * 0.7); ctx.fill();
        ctx.beginPath(); ctx.arc(sx, sy, 7, 0, Math.PI * 2); ctx.fillStyle = t >= c.td ? COL[c.st] : '#fff'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
        ctx.save(); ctx.beginPath(); ctx.arc(sx, py, R, 0, Math.PI * 2); ctx.clip();
        const fl = FLAG[c.c]; if (fl) ctx.drawImage(fl, sx - R * 1.33, py - R, R * 2.66, R * 2);
        ctx.restore();
        ctx.beginPath(); ctx.arc(sx, py, R, 0, Math.PI * 2); ctx.lineWidth = 6; ctx.strokeStyle = t >= c.td ? COL[c.st] : '#fff'; ctx.stroke();
        drawFace(ctx, sx, py + R * 0.05, R * 0.62, moodOf(c, t), open, t, CODES.indexOf(c.c));
        ctx.restore();
        return;
      }
      const u = popT(t, c.pop + 0.08, 0.4); if (u <= 0) return;
      const r = clamp(c.r * s * 0.7, 30, 125) * u;
      ctx.globalAlpha = alpha; drawFace(ctx, sx, sy, r, moodOf(c, t), open, t, CODES.indexOf(c.c)); ctx.globalAlpha = 1;
    };
    if (prev && t < prev.t1 + 0.3) faceFor(prev, 1 - lerp(t, prev.t1, prev.t1 + 0.3));
    if (cur && t < D.out0) faceFor(cur, 1 - lerp(t, cur.t1, cur.t1 + 0.3));
    // etiqueta del nombre
    if (cur && t < D.out0 && t >= cur.pop) {
      const [lx, ly0] = toS((cur.bb[0] + cur.bb[2]) / 2, cur.bb[1]);
      const ly = cur.pin ? toS(cur.ax, cur.ay)[1] + 34 : Math.max(150, ly0 - 26);
      const txt = cur.n.toUpperCase();
      ctx.font = `34px ${F1}`; const tw = ctx.measureText(txt).width;
      const a = popT(t, cur.pop, 0.3) * (1 - lerp(t, cur.t1, cur.t1 + 0.25));
      ctx.save(); ctx.globalAlpha = clamp(a); ctx.translate(lx, ly); ctx.scale(a, a);
      ctx.fillStyle = INK; roundRect(ctx, -tw / 2 - 18, -26, tw + 36, 50, 25); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 1);
      ctx.restore();
    }
  }, [f, t]);
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0}} />;
};
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

// ---------------- HUD ----------------
const Flag: React.FC<{c: string; w: number; round?: boolean; style?: React.CSSProperties}> = ({c, w, round, style}) => (
  <img src={staticFile(`wflags/${c.toLowerCase()}.svg`)} style={{width: w, height: round ? w : w * 0.75, objectFit: 'cover', borderRadius: round ? '50%' : 6, border: `3px solid ${INK}`, flexShrink: 0, ...style}} />
);
const Burger: React.FC<{s: number}> = ({s}) => (
  <svg width={s} height={s} viewBox="0 0 100 100">
    <path d="M10 45 Q12 12 50 12 Q88 12 90 45 Z" fill="#f2a33a" stroke={INK} strokeWidth="5" />
    {[[30, 26], [52, 22], [68, 30], [42, 34]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="3.5" ry="2" fill="#fff6d8" />)}
    <path d="M8 52 Q20 46 30 54 Q40 46 50 54 Q60 46 70 54 Q80 46 92 52 L92 58 L8 58 Z" fill="#59c13a" stroke={INK} strokeWidth="4" />
    <rect x="9" y="58" width="82" height="14" rx="7" fill="#7a3b1c" stroke={INK} strokeWidth="5" />
    <path d="M12 76 L88 76 Q88 90 50 90 Q12 90 12 76 Z" fill="#f2a33a" stroke={INK} strokeWidth="5" />
  </svg>
);
const counts = (t: number) => { const n = {H: 0, F: 0, N: 0} as Record<string, number>; let last: Record<string, number> = {H: -9, F: -9, N: -9}; for (const c of C) if (t >= c.td) { n[c.st]++; last[c.st] = c.td; } return {n, last}; };

const HUD: React.FC<{t: number}> = ({t}) => {
  const show = easeOut(lerp(t, D.intro_end - 0.2, D.intro_end + 0.5)) * (1 - easeOut(lerp(t, D.out0, D.out0 + 0.5)));
  if (show <= 0) return null;
  const i = Math.max(0, idxAt(t)); const cur = C[i];
  const {n, last} = counts(t); const done = n.H + n.F + n.N;
  return (
    <>
      {/* barra superior */}
      <div style={{position: 'absolute', top: 22 - (1 - show) * 140, left: 960 - 430, width: 860, height: 92, background: INK, borderRadius: 26, border: '4px solid #fff', boxShadow: '0 10px 0 rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', padding: '0 22px', gap: 18}}>
        <Burger s={64} />
        <div style={{flex: 1}}>
          <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: F1, color: '#fff', fontSize: 26, letterSpacing: 1}}>
            <span>¿DÓNDE NO HAY McDONALD'S?</span><span style={{color: '#ffd23f'}}>{done} / 197</span>
          </div>
          <div style={{marginTop: 8, height: 22, borderRadius: 11, background: '#3a4766', overflow: 'hidden', display: 'flex', border: '2px solid #0b1328'}}>
            {(['H', 'F', 'N'] as const).map((k) => <div key={k} style={{width: `${(n[k] / 197) * 100}%`, background: COL[k]}} />)}
          </div>
        </div>
      </div>
      {/* contadores */}
      <div style={{position: 'absolute', left: 26 - (1 - show) * 600, bottom: 26, display: 'flex', gap: 12}}>
        {(['H', 'F', 'N'] as const).map((k) => {
          const p = 1 + 0.25 * (1 - easeOut((t - last[k]) / 0.35)) * (t - last[k] < 0.35 ? 1 : 0);
          return (
            <div key={k} style={{width: 150, height: 132, background: INK, border: `5px solid ${COL[k]}`, borderRadius: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 0 rgba(0,0,0,0.3)'}}>
              <div style={{fontFamily: F1, fontSize: 66, color: COL[k], lineHeight: 1, transform: `scale(${p})`}}>{n[k]}</div>
              <div style={{fontFamily: F1, fontSize: 19, color: '#fff', marginTop: 6}}><Ic k={k} s={18} /> {k === 'H' ? 'HAY' : k === 'F' ? 'SE FUE' : 'NUNCA'}</div>
            </div>
          );
        })}
      </div>
      {/* cola de próximos países */}
      <div style={{position: 'absolute', right: 24 + -(1 - show) * 500, top: 150, width: 360}}>
        {C.slice(i, i + 6).map((c, j) => {
          const isCur = j === 0; const dec = t >= c.td && isCur;
          const slide = (1 - easeOut((t - cur.t0) / 0.3)) * 66;
          return (
            <div key={c.c} style={{height: 58, marginBottom: 8, transform: `translateY(${slide}px)`, opacity: 1 - j * 0.13, display: 'flex', alignItems: 'center', gap: 12, padding: '0 12px', background: isCur ? '#fff' : 'rgba(20,33,61,0.88)', borderRadius: 16, border: `3px solid ${isCur ? (dec ? COL[c.st] : '#ffd23f') : 'rgba(255,255,255,0.25)'}`}}>
              <Flag c={c.c} w={52} />
              <div style={{flex: 1, fontFamily: F1, fontSize: 24, color: isCur ? INK : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{c.n.toUpperCase()}</div>
              {dec ? <div style={{fontFamily: F1, fontSize: 22, color: '#fff', background: COL[c.st], borderRadius: 10, padding: '2px 10px'}}><Ic k={c.st} s={22} /></div> : <div style={{fontFamily: F1, fontSize: 22, color: isCur ? '#999' : '#8a95b0'}}>···</div>}
            </div>
          );
        })}
      </div>
      {/* tarjeta del país */}
      {cur && t >= cur.td - 0.05 && (() => {
        const u = easeOut((t - cur.td) / 0.25) * (1 - lerp(t, cur.t1 - 0.05, cur.t1 + 0.15));
        return (
          <div style={{position: 'absolute', left: 560, bottom: 30 - (1 - u) * 60, opacity: u, width: 800, background: INK, border: `5px solid ${COL[cur.st]}`, borderRadius: 24, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 18, boxShadow: '0 10px 0 rgba(0,0,0,0.3)'}}>
            <Flag c={cur.c} w={92} />
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                <div style={{fontFamily: F1, fontSize: 40, color: '#fff', whiteSpace: 'nowrap'}}>{cur.n.toUpperCase()}</div>
                <div style={{fontFamily: F1, fontSize: 24, color: '#fff', background: COL[cur.st], borderRadius: 12, padding: '4px 14px', transform: `scale(${popT(t, cur.td, 0.3)})`, whiteSpace: 'nowrap'}}><Ic k={cur.st} s={22} /> {LABEL[cur.st]}</div>
              </div>
              <div style={{fontFamily: F2, fontWeight: 600, fontSize: 25, color: '#c7d2ea', marginTop: 2}}>{cur.note || (cur.st === 'H' ? 'Tiene McDonald\'s' : cur.st === 'N' ? 'Nunca ha tenido McDonald\'s' : '')}</div>
            </div>
          </div>
        );
      })()}
    </>
  );
};

// ---------------- bocadillo de diálogo ----------------
const Bubble: React.FC<{t: number}> = ({t}) => {
  const tk = talkAt(t).find((x) => x.who !== 'NARR');
  if (!tk) return null;
  const c = C.find((x) => x.c === tk.who); if (!c) return null;
  const f = Math.min(Math.round(t * 30), D.cam.length - 1); const [cx, cy, s] = D.cam[f];
  let sx = W / 2 + (c.ax - cx) * s, sy = H / 2 + (c.ay - cy) * s;
  if (c.pin) sy -= 70;
  const words = tk.text.split(' ');
  const shown = Math.ceil(words.length * clamp((t - tk.t0) / ((tk.t1 - tk.t0) * 0.85) + 0.05));
  const u = popT(t, tk.t0, 0.3) * (1 - lerp(t, tk.t1, tk.t1 + 0.2));
  const fr = c.pin ? 60 : clamp(c.r * s * 0.7, 30, 125);
  const bw = 560;
  const right = sx + fr + 40 + bw < 1480;
  const bx = right ? sx + fr + 30 : sx - fr - 30 - bw;
  const by = clamp(sy - fr - 170, 130, 640);
  return (
    <div style={{position: 'absolute', left: clamp(bx, 20, 1900 - bw), top: by, width: bw, transform: `scale(${clamp(u)})`, transformOrigin: right ? 'left bottom' : 'right bottom'}}>
      <div style={{background: '#fff', border: `5px solid ${INK}`, borderRadius: 28, padding: '16px 22px', boxShadow: '0 8px 0 rgba(0,0,0,0.3)', fontFamily: F2, fontWeight: 700, fontSize: 33, lineHeight: 1.18, color: INK}}>
        <span>{words.slice(0, shown).join(' ')}</span><span style={{opacity: 0}}> {words.slice(shown).join(' ')}</span>
      </div>
      <svg width="60" height="40" style={{position: 'absolute', bottom: -34, [right ? 'left' : 'right']: 30} as any}><path d={right ? 'M0 0 L18 36 L40 0 Z' : 'M20 0 L42 36 L60 0 Z'} fill="#fff" stroke={INK} strokeWidth="5" /></svg>
    </div>
  );
};

// ---------------- intro ----------------
const INTRO_BALLS = ['US', 'MX', 'IS', 'BO', 'IN', 'KP'];
const Intro: React.FC<{t: number}> = ({t}) => {
  if (t > D.intro_end + 0.4) return null;
  const out = easeOut(lerp(t, D.intro_end - 0.3, D.intro_end + 0.3));
  const lt = D.legend_t;
  const leg = [lt + 0.0, lt + 1.95, lt + 5.1];
  return (
    <AbsoluteFill style={{opacity: 1 - out, background: 'radial-gradient(ellipse at center, rgba(10,30,70,0.15), rgba(10,25,60,0.55))'}}>
      <div style={{position: 'absolute', top: 70, width: '100%', display: 'flex', justifyContent: 'center', gap: 38}}>
        {INTRO_BALLS.map((c, k) => {
          const u = popT(t, 0.15 + k * 0.12, 0.4); const bob = Math.sin(t * 5 + k) * 8;
          return (
            <div key={c} style={{position: 'relative', transform: `translateY(${bob}px) scale(${u})`}}>
              <Flag c={c} w={150} round style={{border: `6px solid ${INK}`, boxShadow: '0 10px 0 rgba(0,0,0,0.35)'}} />
              <FaceSvg size={150} mood={k === 2 || k === 3 ? 'sad' : k >= 4 ? (k === 5 ? 'angry' : 'happy') : 'happy'} t={t} />
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 330, width: '100%', textAlign: 'center', transform: `scale(${popT(t, 0.3, 0.45)})`}}>
        <div style={{fontFamily: F1, fontSize: 92, color: '#fff', textShadow: `6px 6px 0 ${INK}`, WebkitTextStroke: `3px ${INK}`}}>¿DÓNDE NO HAY</div>
        <div style={{fontFamily: F1, fontSize: 170, color: '#ffd23f', lineHeight: 1, textShadow: `8px 8px 0 ${INK}`, WebkitTextStroke: `5px #c8102e`}}>McDONALD'S?</div>
        <div style={{display: 'inline-block', marginTop: 18, fontFamily: F1, fontSize: 40, color: '#fff', background: INK, borderRadius: 18, padding: '8px 26px', border: '4px solid #fff'}}>197 PAÍSES · UNO POR UNO</div>
      </div>
      <div style={{position: 'absolute', top: 770, width: '100%', display: 'flex', justifyContent: 'center', gap: 26}}>
        {(['H', 'F', 'N'] as const).map((k, j) => (
          <div key={k} style={{transform: `scale(${popT(t, leg[j], 0.35)})`, fontFamily: F1, fontSize: 44, color: '#fff', background: COL[k], border: `5px solid ${INK}`, borderRadius: 22, padding: '10px 28px', boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}><Ic k={k} s={40} /> {LABEL[k]}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
const FaceSvg: React.FC<{size: number; mood: Mood; t: number}> = ({size, mood, t}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { const c = ref.current; if (!c) return; const x = c.getContext('2d')!; x.clearRect(0, 0, size, size); drawFace(x, size / 2, size * 0.52, size * 0.3, mood, 0, t, size + mood.length); }, [t, size, mood]);
  return <canvas ref={ref} width={size} height={size} style={{position: 'absolute', left: 0, top: 0}} />;
};

// ---------------- cierre ----------------
const Outro: React.FC<{t: number}> = ({t}) => {
  const t0 = D.out0 + 0.9; if (t < t0) return null;
  const {n} = counts(t);
  const ask = (D.talks as any[]).find((x) => x.id === 'outro1');
  const u = popT(t, t0, 0.45);
  const cnt = (v: number, d: number) => Math.round(v * easeOut((t - t0 - d) / 1.0));
  return (
    <AbsoluteFill style={{background: `rgba(8,20,48,${0.45 * clamp(u)})`}}>
      <div style={{position: 'absolute', left: 960 - 560, top: 170, width: 1120, transform: `scale(${u})`, background: INK, border: '6px solid #fff', borderRadius: 36, padding: '30px 40px', boxShadow: '0 14px 0 rgba(0,0,0,0.35)'}}>
        <div style={{fontFamily: F1, fontSize: 58, color: '#ffd23f', textAlign: 'center'}}>RESULTADO · 197 PAÍSES</div>
        <div style={{display: 'flex', justifyContent: 'space-around', marginTop: 20}}>
          {(['H', 'F', 'N'] as const).map((k, j) => (
            <div key={k} style={{textAlign: 'center'}}>
              <div style={{fontFamily: F1, fontSize: 130, color: COL[k], lineHeight: 1}}>{cnt(n[k], j * 0.2)}</div>
              <div style={{fontFamily: F1, fontSize: 34, color: '#fff'}}><Ic k={k} s={30} /> {LABEL[k]}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop: 26, textAlign: 'center', transform: `scale(${popT(t, t0 + 2.2, 0.4)})`, fontFamily: F1, fontSize: 50, color: '#fff', background: '#c8102e', borderRadius: 20, padding: '10px 0'}}>
          {n.F + n.N} SIN McDONALD'S · {n.H} CON McDONALD'S
        </div>
      </div>
      {ask && t >= ask.t0 - 0.1 && (
        <div style={{position: 'absolute', top: 780, width: '100%', textAlign: 'center', transform: `scale(${popT(t, ask.t0 - 0.1, 0.4)}) rotate(${Math.sin(t * 6) * 1.5}deg)`}}>
          <span style={{fontFamily: F1, fontSize: 64, color: INK, background: '#ffd23f', border: `6px solid ${INK}`, borderRadius: 30, padding: '14px 40px', boxShadow: '0 10px 0 rgba(0,0,0,0.35)'}}>¿HAY McDONALD'S EN TU CIUDAD? ¡COMENTA!</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const McMap: React.FC = () => {
  const f = useCurrentFrame(); const t = f / 30;
  const [, force] = useState(0);
  useLayoutEffect(() => { if (!READY) { const id = setInterval(() => { if (READY) { force((x) => x + 1); clearInterval(id); } }, 50); return () => clearInterval(id); } }, []);
  return (
    <AbsoluteFill style={{background: '#0d3f73', overflow: 'hidden'}}>
      <MapCanvas t={t} f={f} />
      <Intro t={t} />
      <HUD t={t} />
      <Bubble t={t} />
      <Outro t={t} />
    </AbsoluteFill>
  );
};

// ================= MINIATURAS (2560x1440) =================
const TW = 2560, TH = 1440;
const STF: Record<string, string> = {};
for (const c of C) STF[c.c] = c.st;
function drawWorld(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, blur: number, dim: number, only?: Set<string>) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const g = ctx.createRadialGradient(TW / 2, TH * 0.45, 200, TW / 2, TH / 2, 1700);
  g.addColorStop(0, '#2a8fd0'); g.addColorStop(1, '#0b3566');
  ctx.fillStyle = g; ctx.fillRect(0, 0, TW, TH);
  if (blur) ctx.filter = `blur(${blur}px)`;
  ctx.setTransform(s, 0, 0, s, TW / 2 - cx * s, TH / 2 - cy * s);
  for (const k in PATHS) { const st = STF[k]; ctx.fillStyle = st && (!only || only.has(k)) ? COL[st] : k[0] === '_' ? '#b9c0ca' : '#dfe3e9'; ctx.fill(PATHS[k]); }
  ctx.lineWidth = 1.4 / s; ctx.strokeStyle = 'rgba(30,45,70,0.6)'; for (const k in PATHS) ctx.stroke(PATHS[k]);
  ctx.restore();
  if (dim) { ctx.fillStyle = `rgba(6,18,45,${dim})`; ctx.fillRect(0, 0, TW, TH); }
}
// país con bandera + cara, encajado en una caja
function drawCountry(ctx: CanvasRenderingContext2D, code: string, x: number, y: number, bw: number, bh: number, mood: Mood, ring: string) {
  const g = G[code]; const p = PATHS[code]; if (!g || !p) return;
  const [x0, y0, x1, y1] = g.bb; const s = Math.min(bw / (x1 - x0), bh / (y1 - y0));
  ctx.save(); ctx.translate(x - (x0 + x1) / 2 * s, y - (y0 + y1) / 2 * s); ctx.scale(s, s);
  ctx.save(); const mg = 60 / s; ctx.beginPath(); ctx.rect(x0 - mg, y0 - mg, x1 - x0 + 2 * mg, y1 - y0 + 2 * mg); ctx.clip();
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
  ctx.lineJoin = 'round'; ctx.lineWidth = 34 / s; ctx.strokeStyle = INK; ctx.stroke(p);
  ctx.shadowColor = 'transparent'; ctx.lineWidth = 20 / s; ctx.strokeStyle = ring; ctx.stroke(p);
  ctx.lineWidth = 8 / s; ctx.strokeStyle = '#fff'; ctx.stroke(p);
  ctx.fillStyle = '#fff'; ctx.fill(p);
  ctx.save(); ctx.clip(p); const fl = FLAG[code]; if (fl) ctx.drawImage(fl, x0, y0, x1 - x0, y1 - y0); ctx.restore();
  ctx.restore();
  const fx = g.c[0], fy = g.c[1];
  ctx.restore();
  const sx = x - (x0 + x1) / 2 * s + fx * s, sy = y - (y0 + y1) / 2 * s + fy * s;
  drawFace(ctx, sx, sy, Math.min(160, Math.max(105, g.r * s * 0.8)), mood, 0, 0.6, 3);
}
const TT: React.FC<{children: any; size: number; color?: string; stroke?: string; sh?: number; style?: React.CSSProperties}> = ({children, size, color = '#fff', stroke = INK, sh, style}) => (
  <div style={{fontFamily: F1, fontSize: size, color, lineHeight: 1, WebkitTextStroke: `${size * 0.07}px ${stroke}`, paintOrder: 'stroke fill', textShadow: `0 ${sh ?? size * 0.08}px 0 ${stroke}`, whiteSpace: 'nowrap', ...style} as any}>{children}</div>
);
const Pill: React.FC<{k: string; text: string; size?: number}> = ({k, text, size = 54}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 14, fontFamily: F1, fontSize: size, color: '#fff', background: COL[k], border: `8px solid ${INK}`, borderRadius: 999, padding: '12px 34px', boxShadow: '0 12px 0 rgba(0,0,0,0.45)'}}><Ic k={k} s={size * 0.95} /> {text}</div>
);
const BigBurger: React.FC<{s: number; style?: React.CSSProperties}> = ({s, style}) => <div style={{width: s, height: s, ...style}}><Burger s={s} /></div>;

export const McThumb: React.FC<{v: number}> = ({v}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [, force] = useState(0);
  useLayoutEffect(() => { if (!READY) { const id = setInterval(() => { if (READY) { force((x) => x + 1); clearInterval(id); } }, 50); return () => clearInterval(id); } }, []);
  useLayoutEffect(() => {
    const cv = ref.current; if (!cv || !READY) return; const ctx = cv.getContext('2d')!;
    if (v === 0) {
      drawWorld(ctx, 2900, 1150, 0.62, 10, 0.35);
      drawCountry(ctx, 'US', 520, 820, 760, 470, 'happy', COL.H);
      drawCountry(ctx, 'RU', 1290, 770, 860, 600, 'sad', COL.F);
      drawCountry(ctx, 'IR', 2060, 800, 640, 520, 'angry', COL.N);
    } else if (v === 1) {
      drawWorld(ctx, 2900, 1500, 0.95, 0, 0.0);
      const gr = ctx.createLinearGradient(0, 0, 1500, 0); gr.addColorStop(0, 'rgba(6,18,45,0.6)'); gr.addColorStop(1, 'rgba(6,18,45,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, TW, TH);
      drawCountry(ctx, 'NG', 1900, 860, 620, 560, 'angry', COL.N);
    } else if (v === 2) {
      ctx.fillStyle = '#1f9d4f'; ctx.fillRect(0, 0, TW / 2, TH); ctx.fillStyle = '#c92a2a'; ctx.fillRect(TW / 2, 0, TW / 2, TH);
      for (let i = 0; i < 26; i++) { ctx.fillStyle = `rgba(255,255,255,${i % 2 ? 0.05 : 0.0})`; ctx.beginPath(); const a = (i / 26) * Math.PI * 2; ctx.moveTo(TW / 2, TH / 2); ctx.arc(TW / 2, TH / 2, 2400, a, a + Math.PI / 26); ctx.fill(); }
      drawCountry(ctx, 'US', 640, 820, 900, 560, 'happy', COL.H);
      drawCountry(ctx, 'KP', 1930, 820, 480, 640, 'angry', COL.N);
    } else {
      drawWorld(ctx, 1460, 330, 2.2, 8, 0.5);
      drawCountry(ctx, 'IS', 1720, 740, 1300, 820, 'sad', COL.F);
    }
  }, [v, READY]);
  return (
    <AbsoluteFill style={{background: '#0d3f73', overflow: 'hidden'}}>
      <canvas ref={ref} width={TW} height={TH} style={{position: 'absolute', inset: 0}} />
      {v === 0 && (<>
        <div style={{position: 'absolute', top: 60, width: '100%', display: 'flex', justifyContent: 'center', gap: 40}}>
          <TT size={210}>SIN</TT><TT size={210} color="#ffd23f" stroke="#7a0f1e">McDONALD'S</TT>
        </div>
        <div style={{position: 'absolute', top: 1060, width: '100%', display: 'flex', justifyContent: 'space-around', padding: '0 60px'}}>
          <Pill k="H" text="TIENE" size={78} /><Pill k="F" text="SE FUE" size={78} /><Pill k="N" text="NUNCA LLEGÓ" size={78} />
        </div>
        <div style={{position: 'absolute', bottom: 40, width: '100%', textAlign: 'center'}}>
          <span style={{display: 'inline-block', background: '#e03131', border: `10px solid #fff`, borderRadius: 999, padding: '10px 70px', boxShadow: '0 14px 0 rgba(0,0,0,0.45)'}}><TT size={120}>¿EN TU PAÍS?</TT></span>
        </div>
      </>)}
      {v === 1 && (<>
        <div style={{position: 'absolute', left: 90, top: 150}}>
          <TT size={560} color="#ff4d4d" stroke="#fff" sh={0} style={{WebkitTextStroke: '30px #fff', textShadow: `0 30px 0 ${INK}`}}>105</TT>
          <TT size={150} style={{marginTop: 30}}>PAÍSES</TT>
          <TT size={150} color="#ffd23f" style={{marginTop: 20}}>SIN McDONALD'S</TT>
        </div>
        <div style={{position: 'absolute', right: 90, top: 70, transform: 'rotate(8deg)'}}><Pill k="N" text="¿EL TUYO?" size={90} /></div>
      </>)}
      {v === 2 && (<>
        <div style={{position: 'absolute', top: 50, width: '100%', textAlign: 'center'}}><TT size={150}>¿DÓNDE NO HAY McDONALD'S?</TT></div>
        <div style={{position: 'absolute', left: 0, width: TW / 2, bottom: 70, textAlign: 'center'}}><TT size={300} color="#fff">SÍ</TT></div>
        <div style={{position: 'absolute', right: 0, width: TW / 2, bottom: 70, textAlign: 'center'}}><TT size={300} color="#fff">NO</TT></div>
        <div style={{position: 'absolute', left: TW / 2 - 230, top: 560, width: 460, height: 460, borderRadius: '50%', background: '#fff', border: `16px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 0 rgba(0,0,0,0.4)'}}>
          <BigBurger s={330} />
        </div>
        <div style={{position: 'absolute', left: TW / 2 - 110, top: 400}}><TT size={170} color="#ffd23f">VS</TT></div>
      </>)}
      {v === 3 && (<>
        <div style={{position: 'absolute', left: 80, top: 330, width: 700, height: 700}}>
          <div style={{position: 'absolute', left: 60, top: 40, width: 580, height: 600, borderRadius: '290px 290px 40px 40px', background: 'linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0.12) 45%, rgba(255,255,255,0.3))', border: '12px solid rgba(255,255,255,0.9)', boxShadow: `0 0 0 10px ${INK}, 0 0 80px rgba(160,220,255,0.8)`}} />
          <div style={{position: 'absolute', left: 145, top: 210}}><BigBurger s={410} /></div>
          <div style={{position: 'absolute', left: 0, top: 620, width: 700, height: 90, background: '#5b3a1e', border: `10px solid ${INK}`, borderRadius: 20}} />
        </div>
        <div style={{position: 'absolute', top: 50, width: '100%', textAlign: 'center'}}><TT size={150}>SE FUE EN 2009...</TT></div>
        <div style={{position: 'absolute', bottom: 60, width: '100%', textAlign: 'center'}}><TT size={140} color="#ffd23f">¡Y NO SE HA PODRIDO!</TT></div>
      </>)}
    </AbsoluteFill>
  );
};
