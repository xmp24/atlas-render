// Motor "país por país con valor" (altura, sueldo...) — 1920x1080, 30 fps
import React, {useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import A0 from './alt.json';
import S0 from './sue.json';
import G0 from '../mcd/geo.json';
import {drawFace} from '../mcd/McMap';

const REG: Record<string, any> = {alt: A0, sue: S0};
export const numFrames = (v: string) => Math.max(30, Math.round(REG[v].dur * 30));
const G = G0 as Record<string, {d: string; dm: string; bb: number[]; bm: number[]; c: number[]; r: number}>;
const W = 1920, H = 1080;
const INK = '#14213d';
const F1 = 'Lilita, sans-serif', F2 = 'Fredoka, sans-serif';
type Mood = 'curious' | 'happy' | 'sad' | 'angry';

// datos del vídeo activo (cada render usa una sola composición)
let D: any = A0; let C: any[] = D.C; let COL: Record<string, string> = {}; let COLD: Record<string, string> = {}; let CAT: Record<string, any> = {};
function use(v: string) {
  if (D === REG[v] && Object.keys(CAT).length) return;
  D = REG[v]; C = D.C; COL = {}; COLD = {}; CAT = {};
  for (const k of D.cfg.cats) { COL[k.k] = k.col; COLD[k.k] = k.cold; CAT[k.k] = k; }
}

// ---------------- recursos ----------------
const PATHS: Record<string, Path2D> = {};
const PATHM: Record<string, Path2D> = {};
const FLAG: Record<string, HTMLCanvasElement> = {};
let READY = false;
if (typeof window !== 'undefined') {
  const h = delayRender('num-assets', {timeoutInMilliseconds: 120000});
  for (const k of Object.keys(G)) { PATHS[k] = new Path2D(G[k].d); PATHM[k] = new Path2D(G[k].dm || G[k].d); }
  const fonts = [
    new FontFace('Lilita', `url(${staticFile('lilita.woff2')})`).load(),
    new FontFace('Lilita', `url(${staticFile('lilita-ext.woff2')})`, {unicodeRange: 'U+0100-024F'}).load(),
    new FontFace('Fredoka', `url(${staticFile('fredoka600.woff2')})`, {weight: '600'}).load(),
    new FontFace('Fredoka', `url(${staticFile('fredoka700.woff2')})`, {weight: '700'}).load(),
  ].map((p) => p.then((f) => { (document as any).fonts.add(f); }).catch(() => null));
  const codes = new Set<string>(); for (const v of Object.values(REG)) for (const c of v.C) codes.add(c.c);
  const imgs = [...codes].map((c) => new Promise<void>((res) => {
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
const idxAt = (t: number) => { let i = -1; for (let k = 0; k < C.length; k++) { if (C[k].t0 <= t) i = k; else break; } return i; };
const talkAt = (t: number) => (D.talks as any[]).filter((x) => t >= x.t0 && t < x.t1);
const ampOf = (tk: any, t: number) => { const i = Math.floor((t - tk.t0) * 30); const ch = tk.e[i]; return ch ? +ch / 9 : 0; };
const isThin = (c: any, s: number) => !c.pin && c.r * s * 0.7 < 44;
const moodOf = (c: any, t: number): Mood => (t < c.td ? 'curious' : (CAT[c.st]?.mood || 'happy'));
const ord = () => D.cfg.cats.map((k: any) => k.k) as string[];

function drawFlagCover(ctx: CanvasRenderingContext2D, fl: HTMLCanvasElement, x0: number, y0: number, x1: number, y1: number) {
  const w = x1 - x0, h = y1 - y0; const A = Math.max(4 / 3 / 2, Math.min(4 / 3 * 2, w / h));
  let dw = w, dh = w / A;
  if (dh < h) { dh = h; dw = h * A; }
  ctx.drawImage(fl, x0 + (w - dw) / 2, y0 + (h - dh) / 2, dw, dh);
}
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

// ---------------- mapa ----------------
const MapCanvas: React.FC<{t: number; f: number}> = ({t, f}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const cv = ref.current; if (!cv || !READY) return;
    const ctx = cv.getContext('2d')!;
    const [cx, cy, s] = D.cam[Math.min(f, D.cam.length - 1)];
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const g = ctx.createRadialGradient(W / 2, H * 0.45, 100, W / 2, H / 2, 1250);
    g.addColorStop(0, '#2a8fd0'); g.addColorStop(0.6, '#1a6aa8'); g.addColorStop(1, '#0d3f73');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.setTransform(s, 0, 0, s, W / 2 - cx * s, H / 2 - cy * s);
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1.2 / s;
    for (let x = 0; x <= 5500; x += 228) { ctx.beginPath(); ctx.moveTo(x, -50); ctx.lineTo(x, 2700); ctx.stroke(); }
    for (let y = 0; y <= 2700; y += 223) { ctx.beginPath(); ctx.moveTo(-50, y); ctx.lineTo(5520, y); ctx.stroke(); }
    const i = idxAt(t);
    const decided: Record<string, string> = {};
    for (const c of C) if (t >= c.td) decided[c.c] = c.st;
    const cur = i >= 0 ? C[i] : null;
    const prev = i > 0 ? C[i - 1] : null;
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
    const flagOn = (c: any, a: number, scl: number) => {
      const p = PATHM[c.c]; if (!p) return;
      const [x0, y0, x1, y1] = G[c.c].bm; const ax = c.ax, ay = c.ay;
      ctx.save(); ctx.translate(ax, ay); ctx.scale(scl, scl); ctx.translate(-ax, -ay);
      ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
      ctx.fillStyle = '#fff'; ctx.globalAlpha = a; ctx.fill(p); ctx.shadowColor = 'transparent';
      ctx.save(); ctx.clip(p);
      const fl = FLAG[c.c]; if (fl) drawFlagCover(ctx, fl, x0, y0, x1, y1);
      ctx.restore();
      ctx.lineWidth = 3.2 / s; ctx.strokeStyle = '#fff'; ctx.stroke(p);
      ctx.restore(); ctx.globalAlpha = 1;
    };
    const recolor = (c: any, k: number) => {
      const p = PATHM[c.c]; if (!p || k <= 0) return;
      const [x0, y0, x1, y1] = G[c.c].bm;
      const R = Math.hypot(Math.max(c.ax - x0, x1 - c.ax), Math.max(c.ay - y0, y1 - c.ay)) * easeOut(k) * 1.05;
      ctx.save(); ctx.clip(p); ctx.beginPath(); ctx.arc(c.ax, c.ay, Math.max(0.01, R), 0, Math.PI * 2); ctx.fillStyle = COL[c.st]; ctx.fill(); ctx.restore();
      ctx.lineWidth = 2 / s; ctx.strokeStyle = COLD[c.st]; ctx.globalAlpha = clamp(k * 1.5); ctx.stroke(p); ctx.globalAlpha = 1;
    };
    if (prev && !prev.pin && t < prev.t1 + 0.5) { flagOn(prev, 1, 1); recolor(prev, lerp(t, prev.t1, prev.t1 + 0.45)); }
    if (cur && !cur.pin && t < D.out0) {
      const u = (t - cur.pop) / 0.3;
      if (u > 0) { const sc = 1 + 0.18 * (1 - back(u)); flagOn(cur, clamp(u * 2), u < 1 ? sc : 1); }
      recolor(cur, lerp(t, cur.t1, cur.t1 + 0.45));
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const toS = (x: number, y: number) => [W / 2 + (x - cx) * s, H / 2 + (y - cy) * s];
    const talks = talkAt(t);
    const faceFor = (c: any, alpha: number) => {
      const [sx, sy] = toS(c.ax, c.ay);
      const tk = talks.find((x) => x.who === c.c);
      const open = tk ? ampOf(tk, t) : 0;
      if (c.pin || isThin(c, s)) {
        const u = popT(t, c.pop, 0.4); if (u <= 0) return;
        const R = 58 * u;
        ctx.save(); ctx.globalAlpha = alpha;
        const flip = sy - 70 - 58 < 210;
        const py = flip ? sy + 80 * u : sy - 70 * u;
        ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx - 16, py + (flip ? -R * 0.7 : R * 0.7)); ctx.lineTo(sx + 16, py + (flip ? -R * 0.7 : R * 0.7)); ctx.fill();
        ctx.beginPath(); ctx.arc(sx, sy, 7, 0, Math.PI * 2); ctx.fillStyle = t >= c.td ? COL[c.st] : '#fff'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
        ctx.save(); ctx.beginPath(); ctx.arc(sx, py, R, 0, Math.PI * 2); ctx.clip();
        const fl = FLAG[c.c]; if (fl) ctx.drawImage(fl, sx - R * 1.33, py - R, R * 2.66, R * 2);
        ctx.restore();
        ctx.beginPath(); ctx.arc(sx, py, R, 0, Math.PI * 2); ctx.lineWidth = 6; ctx.strokeStyle = t >= c.td ? COL[c.st] : '#fff'; ctx.stroke();
        drawFace(ctx, sx, py + R * 0.05, R * 0.62, moodOf(c, t), open, t, C.indexOf(c));
        ctx.restore();
        return;
      }
      const u = popT(t, c.pop + 0.08, 0.4); if (u <= 0) return;
      const r = clamp(c.r * s * 0.7, 38, 125) * u;
      ctx.globalAlpha = alpha; drawFace(ctx, sx, sy, r, moodOf(c, t), open, t, C.indexOf(c)); ctx.globalAlpha = 1;
    };
    if (prev && t < prev.t1 + 0.3) faceFor(prev, 1 - lerp(t, prev.t1, prev.t1 + 0.3));
    if (cur && t < D.out0) faceFor(cur, 1 - lerp(t, cur.t1, cur.t1 + 0.3));
    if (cur && t < D.out0 && t >= cur.pop) {
      const bmc = G[cur.c] ? G[cur.c].bm : cur.bb; const [lx, ly0] = toS((bmc[0] + bmc[2]) / 2, bmc[1]);
      const ly = cur.pin ? toS(cur.ax, cur.ay)[1] + 34 : Math.max(150, Math.min(ly0, toS(cur.ax, cur.ay)[1] - 150) - 26);
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

// ---------------- HUD ----------------
const Flag: React.FC<{c: string; w: number; round?: boolean; style?: React.CSSProperties}> = ({c, w, round, style}) => (
  <img src={staticFile(`wflags/${c.toLowerCase()}.svg`)} style={{width: w, height: round ? w : w * 0.75, objectFit: 'cover', borderRadius: round ? '50%' : 6, border: `3px solid ${INK}`, flexShrink: 0, ...style}} />
);
export const Icon: React.FC<{k: string; s: number}> = ({k, s}) => k === 'ruler' ? (
  <svg width={s} height={s} viewBox="0 0 100 100">
    <rect x="30" y="4" width="40" height="92" rx="8" fill="#ffd23f" stroke={INK} strokeWidth="6" />
    {[16, 28, 40, 52, 64, 76, 88].map((y, i) => <line key={y} x1="30" y1={y} x2={i % 2 ? 50 : 58} y2={y} stroke={INK} strokeWidth="5" strokeLinecap="round" />)}
  </svg>
) : (
  <svg width={s} height={s} viewBox="0 0 100 100">
    <rect x="6" y="24" width="88" height="52" rx="10" fill="#4cc26a" stroke={INK} strokeWidth="6" />
    <circle cx="50" cy="50" r="15" fill="#2a9a4a" stroke={INK} strokeWidth="5" />
    <text x="50" y="59" textAnchor="middle" fontFamily="Lilita, sans-serif" fontSize="26" fill="#fff">$</text>
    <circle cx="20" cy="50" r="5" fill={INK} /><circle cx="80" cy="50" r="5" fill={INK} />
  </svg>
);
const counts = (t: number) => { const n: Record<string, number> = {}; const last: Record<string, number> = {}; for (const k of ord()) { n[k] = 0; last[k] = -9; } for (const c of C) if (t >= c.td) { n[c.st]++; last[c.st] = c.td; } return {n, last}; };

const HUD: React.FC<{t: number}> = ({t}) => {
  const show = easeOut(lerp(t, D.intro_end - 0.2, D.intro_end + 0.5)) * (1 - easeOut(lerp(t, D.out0, D.out0 + 0.5)));
  if (show <= 0) return null;
  const i = Math.max(0, idxAt(t)); const cur = C[i];
  const {n, last} = counts(t); const done = Object.values(n).reduce((a, b) => a + b, 0);
  const K = ord(); const cw = K.length > 5 ? 100 : 112; const left = 26 + K.length * (cw + 10) + 8;
  return (
    <>
      <div style={{position: 'absolute', top: 22 - (1 - show) * 140, left: 960 - 440, width: 880, height: 92, background: INK, borderRadius: 26, border: '4px solid #fff', boxShadow: '0 10px 0 rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', padding: '0 22px', gap: 16}}>
        <Icon k={D.cfg.icon} s={64} />
        <div style={{flex: 1}}>
          <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: F1, color: '#fff', fontSize: 26, letterSpacing: 1}}>
            <span>{D.cfg.title}</span><span style={{color: '#ffd23f'}}>{done} / {C.length}</span>
          </div>
          <div style={{marginTop: 8, height: 22, borderRadius: 11, background: '#3a4766', overflow: 'hidden', display: 'flex', border: '2px solid #0b1328'}}>
            {K.map((k) => <div key={k} style={{width: `${(n[k] / C.length) * 100}%`, background: COL[k]}} />)}
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 26 - (1 - show) * 800, bottom: 26, display: 'flex', gap: 10}}>
        {K.map((k) => {
          const p = 1 + 0.25 * (1 - easeOut((t - last[k]) / 0.35)) * (t - last[k] < 0.35 ? 1 : 0);
          return (
            <div key={k} style={{width: cw, height: 128, background: INK, border: `5px solid ${COL[k]}`, borderRadius: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 0 rgba(0,0,0,0.3)'}}>
              <div style={{fontFamily: F1, fontSize: 60, color: COL[k], lineHeight: 1, transform: `scale(${p})`}}>{n[k]}</div>
              <div style={{fontFamily: F1, fontSize: 19, color: '#fff', marginTop: 6, whiteSpace: 'nowrap'}}>{CAT[k].short}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', right: 24 + -(1 - show) * 500, top: 150, width: 360}}>
        {C.slice(i, i + 6).map((c, j) => {
          const isCur = j === 0; const dec = t >= c.td && isCur;
          const slide = (1 - easeOut((t - cur.t0) / 0.3)) * 66;
          return (
            <div key={c.c} style={{height: 58, marginBottom: 8, transform: `translateY(${slide}px)`, opacity: 1 - j * 0.13, display: 'flex', alignItems: 'center', gap: 12, padding: '0 12px', background: isCur ? '#fff' : 'rgba(20,33,61,0.88)', borderRadius: 16, border: `3px solid ${isCur ? (dec ? COL[c.st] : '#ffd23f') : 'rgba(255,255,255,0.25)'}`}}>
              <Flag c={c.c} w={52} />
              <div style={{flex: 1, fontFamily: F1, fontSize: 24, color: isCur ? INK : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{c.n.toUpperCase()}</div>
              {dec ? <div style={{fontFamily: F1, fontSize: 21, color: c.st === 'C' ? INK : '#fff', background: COL[c.st], borderRadius: 10, padding: '2px 10px', whiteSpace: 'nowrap'}}>{c.vs}</div> : <div style={{fontFamily: F1, fontSize: 22, color: isCur ? '#999' : '#8a95b0'}}>···</div>}
            </div>
          );
        })}
      </div>
      {cur && t >= cur.td - 0.05 && (() => {
        const u = easeOut((t - cur.td) / 0.25) * (1 - lerp(t, cur.t1 - 0.05, cur.t1 + 0.15));
        const dark = cur.st === 'C';
        return (
          <div style={{position: 'absolute', left, bottom: 30 - (1 - u) * 60, opacity: u, width: 1470 - left, background: INK, border: `5px solid ${COL[cur.st]}`, borderRadius: 24, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 10px 0 rgba(0,0,0,0.3)'}}>
            <Flag c={cur.c} w={88} />
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{fontFamily: F1, fontSize: 36, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{cur.n.toUpperCase()}</div>
              <div style={{fontFamily: F2, fontWeight: 600, fontSize: 23, color: '#c7d2ea', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{cur.sub}</div>
            </div>
            <div style={{fontFamily: F1, fontSize: 44, color: dark ? INK : '#fff', background: COL[cur.st], borderRadius: 16, padding: '4px 18px', transform: `scale(${popT(t, cur.td, 0.3)})`, whiteSpace: 'nowrap', border: `3px solid ${COLD[cur.st]}`}}>{cur.v}</div>
          </div>
        );
      })()}
    </>
  );
};

// ---------------- bocadillo ----------------
const Bubble: React.FC<{t: number}> = ({t}) => {
  const tk = talkAt(t).find((x) => x.who !== 'NARR');
  if (!tk) return null;
  const c = C.find((x) => x.c === tk.who); if (!c) return null;
  const f = Math.min(Math.round(t * 30), D.cam.length - 1); const [cx, cy, s] = D.cam[f];
  let sx = W / 2 + (c.ax - cx) * s, sy = H / 2 + (c.ay - cy) * s;
  const pinish = c.pin || isThin(c, s);
  if (pinish) sy += (sy - 128 < 210 ? 80 : -70);
  const words = tk.text.split(' ');
  const shown = Math.ceil(words.length * clamp((t - tk.t0) / ((tk.t1 - tk.t0) * 0.85) + 0.05));
  const u = popT(t, tk.t0, 0.3) * (1 - lerp(t, tk.t1, tk.t1 + 0.2));
  const fr = pinish ? 60 : clamp(c.r * s * 0.7, 30, 125);
  const bw = 560;
  const right = sx + fr + 40 + bw < 1480;
  const bx = right ? sx + fr + 30 : sx - fr - 30 - bw;
  const by = clamp(sy - fr - 170, 130, 600);
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
const FaceSvg: React.FC<{size: number; mood: Mood; t: number}> = ({size, mood, t}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { const c = ref.current; if (!c) return; const x = c.getContext('2d')!; x.clearRect(0, 0, size, size); drawFace(x, size / 2, size * 0.52, size * 0.3, mood, 0, t, size + mood.length); }, [t, size, mood]);
  return <canvas ref={ref} width={size} height={size} style={{position: 'absolute', left: 0, top: 0}} />;
};
const Intro: React.FC<{t: number}> = ({t}) => {
  if (t > D.intro_end + 0.4) return null;
  const out = easeOut(lerp(t, D.intro_end - 0.3, D.intro_end + 0.3));
  const cfg = D.cfg; const K = ord();
  return (
    <AbsoluteFill style={{opacity: 1 - out, background: 'radial-gradient(ellipse at center, rgba(10,30,70,0.15), rgba(10,25,60,0.55))'}}>
      <div style={{position: 'absolute', top: 70, width: '100%', display: 'flex', justifyContent: 'center', gap: 38}}>
        {cfg.balls.map((c: string, k: number) => {
          const u = popT(t, 0.15 + k * 0.12, 0.4); const bob = Math.sin(t * 5 + k) * 8;
          return (
            <div key={c} style={{position: 'relative', transform: `translateY(${bob}px) scale(${u})`}}>
              <Flag c={c} w={150} round style={{border: `6px solid ${INK}`, boxShadow: '0 10px 0 rgba(0,0,0,0.35)'}} />
              <FaceSvg size={150} mood={cfg.ballMoods[k]} t={t} />
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 320, width: '100%', textAlign: 'center', transform: `scale(${popT(t, 0.3, 0.45)})`}}>
        <div style={{fontFamily: F1, fontSize: 96, color: '#fff', textShadow: `6px 6px 0 ${INK}`, WebkitTextStroke: `3px ${INK}`}}>{cfg.t1}</div>
        <div style={{fontFamily: F1, fontSize: 160, color: '#ffd23f', lineHeight: 1, textShadow: `8px 8px 0 ${INK}`, WebkitTextStroke: `5px #c8102e`}}>{cfg.t2}</div>
        <div style={{display: 'inline-block', marginTop: 18, fontFamily: F1, fontSize: 40, color: '#fff', background: INK, borderRadius: 18, padding: '8px 26px', border: '4px solid #fff'}}>{cfg.badge}</div>
      </div>
      <div style={{position: 'absolute', top: 790, width: '100%', display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', padding: '0 60px'}}>
        {K.map((k, j) => (
          <div key={k} style={{transform: `scale(${popT(t, D.leg[j] ?? 99, 0.35)})`, fontFamily: F1, fontSize: K.length > 5 ? 34 : 38, color: k === 'C' ? INK : '#fff', background: COL[k], border: `5px solid ${INK}`, borderRadius: 20, padding: '8px 22px', boxShadow: '0 8px 0 rgba(0,0,0,0.35)', whiteSpace: 'nowrap'}}>{CAT[k].label}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------------- cierre (corto) ----------------
const Outro: React.FC<{t: number}> = ({t}) => {
  const t0 = D.out0 + 0.2; if (t < t0) return null;
  const u = popT(t, t0, 0.45);
  const card = (x: any[], k: number) => {
    const c = C.find((y) => y.c === x[0]); if (!c) return null;
    return (
      <div style={{flex: 1, textAlign: 'center', transform: `scale(${popT(t, t0 + 0.15 * k, 0.4)})`}}>
        <div style={{fontFamily: F1, fontSize: 40, color: '#ffd23f'}}>{x[1]}</div>
        <Flag c={c.c} w={190} style={{margin: '10px auto', display: 'block', border: `6px solid ${COL[c.st]}`}} />
        <div style={{fontFamily: F1, fontSize: 46, color: '#fff'}}>{c.n.toUpperCase()}</div>
        <div style={{display: 'inline-block', marginTop: 8, fontFamily: F1, fontSize: 56, color: c.st === 'C' ? INK : '#fff', background: COL[c.st], borderRadius: 18, padding: '4px 26px'}}>{x[2]}</div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{background: `rgba(8,20,48,${0.5 * clamp(u)})`}}>
      <div style={{position: 'absolute', left: 960 - 560, top: 120, width: 1120, transform: `scale(${u})`, background: INK, border: '6px solid #fff', borderRadius: 36, padding: '26px 40px', boxShadow: '0 14px 0 rgba(0,0,0,0.35)', display: 'flex', gap: 30}}>
        {card(D.cfg.best, 0)}{card(D.cfg.worst, 1)}
      </div>
      <div style={{position: 'absolute', top: 800, width: '100%', textAlign: 'center', transform: `scale(${popT(t, t0 + 0.3, 0.4)}) rotate(${Math.sin(t * 6) * 1.5}deg)`}}>
        <span style={{fontFamily: F1, fontSize: 64, color: INK, background: '#ffd23f', border: `6px solid ${INK}`, borderRadius: 30, padding: '14px 40px', boxShadow: '0 10px 0 rgba(0,0,0,0.35)'}}>{D.cfg.ask}</span>
      </div>
    </AbsoluteFill>
  );
};

export const NumMap: React.FC<{v: string}> = ({v}) => {
  use(v);
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
function drawWorld(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, blur: number, dim: number) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const g = ctx.createRadialGradient(TW / 2, TH * 0.45, 200, TW / 2, TH / 2, 1700);
  g.addColorStop(0, '#2a8fd0'); g.addColorStop(1, '#0b3566'); ctx.fillStyle = g; ctx.fillRect(0, 0, TW, TH);
  if (blur) ctx.filter = `blur(${blur}px)`;
  ctx.setTransform(s, 0, 0, s, TW / 2 - cx * s, TH / 2 - cy * s);
  const ST: Record<string, string> = {}; for (const c of C) ST[c.c] = c.st;
  for (const k in PATHS) { const st = ST[k]; ctx.fillStyle = st ? COL[st] : k[0] === '_' ? '#b9c0ca' : '#dfe3e9'; ctx.fill(PATHS[k]); }
  ctx.lineWidth = 1.4 / s; ctx.strokeStyle = 'rgba(30,45,70,0.6)'; for (const k in PATHS) ctx.stroke(PATHS[k]);
  ctx.restore();
  if (dim) { ctx.fillStyle = `rgba(6,18,45,${dim})`; ctx.fillRect(0, 0, TW, TH); }
}
function drawCountry(ctx: CanvasRenderingContext2D, code: string, x: number, y: number, bw: number, bh: number, mood: Mood, ring: string) {
  const g = G[code]; const p = PATHM[code]; if (!g || !p) return;
  const [x0, y0, x1, y1] = g.bm; const s = Math.min(bw / (x1 - x0), bh / (y1 - y0));
  ctx.save(); ctx.translate(x - (x0 + x1) / 2 * s, y - (y0 + y1) / 2 * s); ctx.scale(s, s);
  ctx.save(); const mg = 60 / s; ctx.beginPath(); ctx.rect(x0 - mg, y0 - mg, x1 - x0 + 2 * mg, y1 - y0 + 2 * mg); ctx.clip();
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
  ctx.lineJoin = 'round'; ctx.lineWidth = 34 / s; ctx.strokeStyle = INK; ctx.stroke(p);
  ctx.shadowColor = 'transparent'; ctx.lineWidth = 20 / s; ctx.strokeStyle = ring; ctx.stroke(p);
  ctx.lineWidth = 8 / s; ctx.strokeStyle = '#fff'; ctx.stroke(p);
  ctx.fillStyle = '#fff'; ctx.fill(p);
  ctx.save(); ctx.clip(p); const fl = FLAG[code]; if (fl) drawFlagCover(ctx, fl, x0, y0, x1, y1); ctx.restore();
  ctx.restore(); ctx.restore();
  const sx = x - (x0 + x1) / 2 * s + g.c[0] * s, sy = y - (y0 + y1) / 2 * s + g.c[1] * s;
  drawFace(ctx, sx, sy, Math.min(170, Math.max(105, g.r * s * 0.8)), mood, 0, 0.6, 3);
}
// bola-bandera con cara (para miniaturas)
function drawBall(ctx: CanvasRenderingContext2D, code: string, x: number, y: number, r: number, mood: Mood, ring: string) {
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 20;
  ctx.beginPath(); ctx.arc(x, y, r + 16, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill(); ctx.restore();
  ctx.beginPath(); ctx.arc(x, y, r + 8, 0, Math.PI * 2); ctx.fillStyle = ring; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
  const fl = FLAG[code]; if (fl) ctx.drawImage(fl, x - r * 1.34, y - r, r * 2.68, r * 2);
  const gr = ctx.createRadialGradient(x - r * 0.4, y - r * 0.5, r * 0.1, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,0.35)'); gr.addColorStop(0.6, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.3)');
  ctx.fillStyle = gr; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore();
  drawFace(ctx, x, y + r * 0.05, r * 0.62, mood, 0, 0.6, 5);
}
const TT: React.FC<{children: any; size: number; color?: string; stroke?: string; sh?: number; style?: React.CSSProperties}> = ({children, size, color = '#fff', stroke = INK, sh, style}) => (
  <div style={{fontFamily: F1, fontSize: size, color, lineHeight: 1, WebkitTextStroke: `${size * 0.07}px ${stroke}`, paintOrder: 'stroke fill', textShadow: `0 ${sh ?? size * 0.08}px 0 ${stroke}`, whiteSpace: 'nowrap', ...style} as any}>{children}</div>
);
const Tag: React.FC<{bg: string; children: any; size?: number; color?: string; style?: React.CSSProperties}> = ({bg, children, size = 90, color = '#fff', style}) => (
  <div style={{display: 'inline-block', fontFamily: F1, fontSize: size, color, background: bg, border: `10px solid ${INK}`, borderRadius: 999, padding: '10px 50px', boxShadow: '0 14px 0 rgba(0,0,0,0.45)', whiteSpace: 'nowrap', ...style}}>{children}</div>
);

export const NumThumb: React.FC<{v: string; n: number}> = ({v, n}) => {
  use(v);
  const ref = useRef<HTMLCanvasElement>(null);
  const [, force] = useState(0);
  useLayoutEffect(() => { if (!READY) { const id = setInterval(() => { if (READY) { force((x) => x + 1); clearInterval(id); } }, 50); return () => clearInterval(id); } }, []);
  useLayoutEffect(() => {
    const cv = ref.current; if (!cv || !READY) return; const ctx = cv.getContext('2d')!;
    ctx.clearRect(0, 0, TW, TH);
    if (v === 'alt') {
      if (n === 0) { drawWorld(ctx, 2900, 1150, 0.62, 10, 0.4); drawBall(ctx, 'NL', 640, 640, 330, 'happy', COL.E); drawBall(ctx, 'TL', 1900, 1000, 170, 'sad', COL.A); }
      else if (n === 1) { drawWorld(ctx, 2950, 1000, 1.1, 0, 0.2); drawCountry(ctx, 'NL', 900, 760, 900, 900, 'happy', COL.E); }
      else { ctx.fillStyle = '#9b5de5'; ctx.fillRect(0, 0, TW / 2, TH); ctx.fillStyle = '#ee4646'; ctx.fillRect(TW / 2, 0, TW / 2, TH);
        for (let i = 0; i < 26; i++) { ctx.fillStyle = `rgba(255,255,255,${i % 2 ? 0.06 : 0})`; ctx.beginPath(); const a = (i / 26) * Math.PI * 2; ctx.moveTo(TW / 2, TH / 2); ctx.arc(TW / 2, TH / 2, 2400, a, a + Math.PI / 26); ctx.fill(); }
        drawBall(ctx, 'NL', 640, 560, 300, 'happy', '#fff'); drawBall(ctx, 'TL', 1920, 860, 200, 'angry', '#fff'); }
    } else {
      if (n === 0) { drawWorld(ctx, 2950, 1300, 0.6, 10, 0.4); drawBall(ctx, 'LU', 640, 700, 320, 'happy', COL.E); drawBall(ctx, 'VE', 1920, 760, 280, 'sad', COL.A); }
      else if (n === 1) { drawWorld(ctx, 1500, 1500, 1.0, 0, 0.15); const gr = ctx.createLinearGradient(0, 0, 1500, 0); gr.addColorStop(0, 'rgba(6,18,45,0.7)'); gr.addColorStop(1, 'rgba(6,18,45,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, TW, TH); drawCountry(ctx, 'VE', 1880, 820, 780, 640, 'sad', COL.A); }
      else { ctx.fillStyle = '#2fbf63'; ctx.fillRect(0, 0, TW / 2, TH); ctx.fillStyle = '#ee4646'; ctx.fillRect(TW / 2, 0, TW / 2, TH);
        for (let i = 0; i < 26; i++) { ctx.fillStyle = `rgba(255,255,255,${i % 2 ? 0.06 : 0})`; ctx.beginPath(); const a = (i / 26) * Math.PI * 2; ctx.moveTo(TW / 2, TH / 2); ctx.arc(TW / 2, TH / 2, 2400, a, a + Math.PI / 26); ctx.fill(); }
        drawBall(ctx, 'LU', 660, 720, 300, 'happy', '#fff'); drawBall(ctx, 'VE', 1900, 720, 300, 'sad', '#fff'); }
    }
  }, [v, n, READY]);
  return (
    <AbsoluteFill style={{background: '#0d3f73', overflow: 'hidden'}}>
      <canvas ref={ref} width={TW} height={TH} style={{position: 'absolute', inset: 0}} />
      {v === 'alt' && n === 0 && (<>
        <div style={{position: 'absolute', top: 50, width: '100%', textAlign: 'center'}}><TT size={190}>¿QUIÉN ES MÁS ALTO?</TT></div>
        <div style={{position: 'absolute', left: 300, top: 1040}}><Tag bg={COL.E} size={110}>1,82 m</Tag></div>
        <div style={{position: 'absolute', left: 1700, top: 1210}}><Tag bg={COL.A} size={90}>1,60 m</Tag></div>
        <div style={{position: 'absolute', right: 90, top: 330, transform: 'rotate(7deg)'}}><Tag bg="#ffd23f" color={INK} size={100}>¿Y TÚ?</Tag></div>
      </>)}
      {v === 'alt' && n === 1 && (<>
        <div style={{position: 'absolute', right: 80, top: 160, textAlign: 'right'}}>
          <TT size={470} color="#9b5de5" stroke="#fff" sh={0} style={{WebkitTextStroke: '26px #fff', textShadow: `0 30px 0 ${INK}`}}>1,82</TT>
          <TT size={150} style={{marginTop: 40}}>EL PAÍS MÁS</TT>
          <TT size={190} color="#ffd23f" style={{marginTop: 20}}>ALTO</TT>
        </div>
      </>)}
      {v === 'alt' && n === 2 && (<>
        <div style={{position: 'absolute', top: 40, width: '100%', textAlign: 'center'}}><TT size={170}>23 CM DE DIFERENCIA</TT></div>
        <div style={{position: 'absolute', left: 0, width: TW / 2, bottom: 70, textAlign: 'center'}}><TT size={240}>GIGANTES</TT></div>
        <div style={{position: 'absolute', right: 0, width: TW / 2, bottom: 70, textAlign: 'center'}}><TT size={240}>BAJITOS</TT></div>
        <div style={{position: 'absolute', left: TW / 2 - 110, top: 560}}><TT size={190} color="#ffd23f">VS</TT></div>
      </>)}
      {v === 'sue' && n === 0 && (<>
        <div style={{position: 'absolute', top: 50, width: '100%', textAlign: 'center'}}><TT size={180}>SUELDO MÍNIMO</TT></div>
        <div style={{position: 'absolute', left: 300, top: 1080}}><Tag bg={COL.E} size={120}>3.150 $</Tag></div>
        <div style={{position: 'absolute', left: 1640, top: 1080}}><Tag bg={COL.A} size={120}>&lt; 1 $</Tag></div>
        <div style={{position: 'absolute', left: TW / 2 - 120, top: 560}}><TT size={190} color="#ffd23f">VS</TT></div>
      </>)}
      {v === 'sue' && n === 1 && (<>
        <div style={{position: 'absolute', left: 90, top: 170}}>
          <TT size={150}>COBRAN</TT>
          <TT size={420} color="#ff4d4d" stroke="#fff" sh={0} style={{WebkitTextStroke: '26px #fff', textShadow: `0 30px 0 ${INK}`, marginTop: 30}}>&lt;1$</TT>
          <TT size={150} color="#ffd23f" style={{marginTop: 40}}>AL MES</TT>
        </div>
        <div style={{position: 'absolute', right: 90, top: 70, transform: 'rotate(7deg)'}}><Tag bg="#ffd23f" color={INK} size={90}>¿Y TU PAÍS?</Tag></div>
      </>)}
      {v === 'sue' && n === 2 && (<>
        <div style={{position: 'absolute', top: 40, width: '100%', textAlign: 'center'}}><TT size={160}>¿CUÁNTO SE COBRA?</TT></div>
        <div style={{position: 'absolute', left: 0, width: TW / 2, bottom: 80, textAlign: 'center'}}><TT size={260}>RICOS</TT></div>
        <div style={{position: 'absolute', right: 0, width: TW / 2, bottom: 80, textAlign: 'center'}}><TT size={260}>POBRES</TT></div>
        <div style={{position: 'absolute', left: TW / 2 - 120, top: 560}}><TT size={190} color="#ffd23f">VS</TT></div>
      </>)}
    </AbsoluteFill>
  );
};
