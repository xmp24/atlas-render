// Motor "A World With": mapa con estado por vídeo (contexto), capa de celdas, capas genéricas y HUDs
import React, {createContext, useContext, useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {PolyCanvas, CEv} from '../PolyWorld';
import {COUNTRIES, MAINCOL} from '../HexWorld';
import {INK, font} from '../lib3';
import CELLS from './cells.json';
import {W, H, rnd, ip, pop, fade} from '../Maduro/lib';
import {war as warOf} from '../Maduro/lib2';
import {FlagImg} from '../SameArmy';
import {toS, camKF, kfv, TintLayer, NukeLayer, Particles, Grain, Vig, shakeXY, hms, BigStamp, TText, kOf, Cam, WORLD} from '../Burn/kit';
export {toS, camKF, kfv, TintLayer, NukeLayer, Particles, Grain, Vig, shakeXY, hms, BigStamp, TText, kOf, WORLD, W, H, rnd, ip, pop, fade, FlagImg, INK, font, MAINCOL};
export type {Cam};
export const YEL = '#ffd23f', RED = '#e5322d';

// ---------------- datos del vídeo actual ----------------
export const VCtx = createContext<any>(null);
export const useV = () => useContext(VCtx);
const WARS = new WeakMap<any, any>();
const warData = (V: any) => { if (!V.war) return null; let w = WARS.get(V); if (!w) { w = warOf(V.war); WARS.set(V, w); } return w; };

export const WMap: React.FC<{T: number; cam: Cam; warOn?: boolean; night?: number; filter?: string; children?: React.ReactNode}> = ({T, cam, warOn = true, night = 0, filter, children}) => {
  const V = useV();
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#123a6a', filter}}>
      <PolyCanvas cev={(V.cev || []) as CEv[]} t={T} tm={0} byTm={false} cam={cam} W={W} H={H} opts={{squads: false, capitalsOff: true, war: warOn ? warData(V) : null, empire: null, waves: true} as any} />
      {night > 0 && <AbsoluteFill style={{background: `rgba(4,8,24,${night})`}} />}
      {children}
    </AbsoluteFill>
  );
};

// ---------------- capa de celdas: el mundo cambia por zonas ----------------
const C = CELLS as any; const NC = C.x.length;
const hash = (i: number) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
export type CellCfg = {mode: 'lat' | 'flood' | 'tz' | 'country' | 'rand' | 'dist'; t0: number; dur?: number; col: string; col2?: string; a?: number; pw?: number; south?: boolean; lvl?: number[][]; spd?: number; ev?: number[][]; seeds?: number[][]; r?: number; fade?: number; glow?: boolean; invert?: boolean; band?: number; elevw?: number; noise?: number};
// tiempo (abs) en que cada celda cambia de estado; Infinity = nunca
const CACHE = new WeakMap<any, Float32Array>();
const cellTimes = (cfg: CellCfg, V: any): Float32Array => {
  let tt = CACHE.get(cfg); if (tt) return tt;
  tt = new Float32Array(NC); const dur = cfg.dur ?? 10; const nz = cfg.noise ?? 0.08;
  if (cfg.mode === 'lat') { // de los polos al ecuador (o al revés con invert)
    for (let i = 0; i < NC; i++) { let u = 1 - Math.abs(C.la[i]) / 75; if (cfg.invert) u = 1 - u; u = Math.max(0, Math.min(1, u)); u = Math.pow(u, cfg.pw ?? 1) - (cfg.elevw ?? 0.25) * C.e[i] / 900; tt[i] = cfg.t0 + dur * Math.max(0, u + (hash(i) - 0.5) * nz); }
  } else if (cfg.mode === 'rand') {
    for (let i = 0; i < NC; i++) tt[i] = cfg.t0 + dur * hash(i + 7);
  } else if (cfg.mode === 'country') { // por país en su tiempo, extendiéndose desde la capital
    const ev = new Map<number, number[]>(); (cfg.ev || []).forEach((e) => ev.set(e[0], e));
    for (let i = 0; i < NC; i++) { const e = ev.get(C.o[i]); if (!e) { tt[i] = Infinity; continue; } const d = Math.hypot(C.x[i] - e[2], C.y[i] - e[3]); tt[i] = e[1] + d / (cfg.spd ?? 400) + hash(i) * 0.3; }
  } else if (cfg.mode === 'dist') { // ondas desde varios focos [t, x, y]
    for (let i = 0; i < NC; i++) { let m = Infinity; for (const s of cfg.seeds || []) m = Math.min(m, s[0] + Math.hypot(C.x[i] - s[1], C.y[i] - s[2]) / (cfg.spd ?? 400)); tt[i] = m + hash(i) * 0.25; }
  } else tt.fill(0);
  CACHE.set(cfg, tt); return tt;
};
// nivel de inundación: celda inundada si (elevación + distancia a costa) < nivel(T)
const floodScore = (i: number) => C.e[i] * 1.0 + C.d[i] * 9;
export const CellLayer: React.FC<{T: number; cam: Cam; cfg: CellCfg}> = ({T, cam, cfg}) => {
  const ref = useRef<HTMLCanvasElement>(null); const V = useV();
  useLayoutEffect(() => {
    const ctx = ref.current!.getContext('2d')!; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
    const r = Math.max(1.2, (cfg.r ?? 9.5) * cam.s); const x0 = cam.cx - W / 2 / cam.s - 20, x1 = cam.cx + W / 2 / cam.s + 20, y0 = cam.cy - H / 2 / cam.s - 20, y1 = cam.cy + H / 2 / cam.s + 20;
    const A = cfg.a ?? 0.85; const fd = cfg.fade ?? 0.8;
    ctx.fillStyle = cfg.col;
    if (cfg.mode === 'flood') {
      const L = kfv(cfg.lvl || [[0, 0]], T);
      if (L <= 0) return;
      for (let i = 0; i < NC; i++) { const x = C.x[i], y = C.y[i]; if (x < x0 || x > x1 || y < y0 || y > y1) continue; const sc = floodScore(i); if (sc > L) continue; const a = Math.min(1, (L - sc) / 25) * A; ctx.globalAlpha = a; ctx.fillRect((x - cam.cx) * cam.s + W / 2 - r, (y - cam.cy) * cam.s + H / 2 - r, r * 2, r * 2); }
      ctx.globalAlpha = 1; return;
    }
    if (cfg.mode === 'tz') { // medianoche que avanza hacia el oeste: banda brillante + zona ya pasada
      const lon0 = kfv(cfg.lvl || [[0, 180]], T); const band = cfg.band ?? 12;
      for (let i = 0; i < NC; i++) { const x = C.x[i], y = C.y[i]; if (x < x0 || x > x1 || y < y0 || y > y1) continue; let dl = C.lo[i] - lon0; if (dl < -180) dl += 360; if (dl > 180) dl -= 360;
        const passed = (cfg.invert ? dl < 0 : dl > 0) && Math.abs(dl) < 360; const inBand = Math.abs(dl) < band;
        if (inBand) { ctx.fillStyle = cfg.col2 || '#ffffff'; ctx.globalAlpha = (1 - Math.abs(dl) / band) * 0.9; }
        else if (passed && cfg.col) { ctx.fillStyle = cfg.col; ctx.globalAlpha = A; } else continue;
        ctx.fillRect((x - cam.cx) * cam.s + W / 2 - r, (y - cam.cy) * cam.s + H / 2 - r, r * 2, r * 2); }
      ctx.globalAlpha = 1; return;
    }
    const tt = cellTimes(cfg, V);
    for (let i = 0; i < NC; i++) {
      const ti = tt[i]; if (!(T >= ti)) continue; const x = C.x[i], y = C.y[i]; if (x < x0 || x > x1 || y < y0 || y > y1) continue;
      const a = Math.min(1, (T - ti) / fd) * A; ctx.globalAlpha = a;
      if (cfg.col2 && T - ti > fd * 3) ctx.fillStyle = cfg.col2; else ctx.fillStyle = cfg.col;
      ctx.fillRect((x - cam.cx) * cam.s + W / 2 - r, (y - cam.cy) * cam.s + H / 2 - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', left: 0, top: 0, filter: cfg.glow ? 'blur(1.5px)' : 'blur(0.6px)'}} />;
};
// fracción de celdas en estado cambiado (para contadores)
export const cellFrac = (cfg: CellCfg, V: any, T: number) => {
  if (cfg.mode === 'flood') { const L = kfv(cfg.lvl || [[0, 0]], T); let n = 0; for (let i = 0; i < NC; i++) if (floodScore(i) <= L) n++; return n / NC; }
  const tt = cellTimes(cfg, V); let n = 0; for (let i = 0; i < NC; i++) if (T >= tt[i]) n++; return n / NC;
};

// ---------------- iconos de refugios genéricos ----------------
const shIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, fill: string, mark?: string) => {
  ctx.lineWidth = Math.max(1.2, s * 0.16); ctx.strokeStyle = INK; ctx.fillStyle = fill;
  ctx.beginPath(); ctx.moveTo(x - s, y + s * 0.55); ctx.lineTo(x - s, y); ctx.arc(x, y, s, Math.PI, 0); ctx.lineTo(x + s, y + s * 0.55); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = INK; ctx.fillRect(x - s * 0.32, y - s * 0.15, s * 0.64, s * 0.7);
  if (mark === 'x') { ctx.strokeStyle = '#ff3b30'; ctx.lineWidth = Math.max(1.6, s * 0.28); ctx.beginPath(); ctx.moveTo(x - s * 0.9, y - s * 0.9); ctx.lineTo(x + s * 0.9, y + s * 0.6); ctx.moveTo(x + s * 0.9, y - s * 0.9); ctx.lineTo(x - s * 0.9, y + s * 0.6); ctx.stroke(); }
};
// sh: [x, y, tAparece, tMuere(-1)]
export const ShelterLayer: React.FC<{T: number; cam: Cam; list: number[][]; col?: string; size?: number; dead?: boolean}> = ({T, cam, list, col = '#39b6ff', size = 1, dead = true}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = ref.current!.getContext('2d')!; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
    const s0 = 5.4 * Math.max(0.75, Math.min(2.2, Math.sqrt(cam.s / 0.262))) * size;
    for (const [x, y, ta, td] of list) {
      if (T < ta) continue; const [X, Y] = toS(x, y, cam); if (X < -20 || X > W + 20 || Y < -20 || Y > H + 20) continue;
      const p = Math.min(1, (T - ta) / 0.25); const sc = p < 1 ? 0.3 + 0.7 * p + Math.sin(p * Math.PI) * 0.5 : 1;
      const isDead = dead && td > 0 && T > td;
      ctx.globalAlpha = isDead ? 0.55 : 1; shIcon(ctx, X, Y, s0 * sc, isDead ? '#6a6a6a' : col, isDead ? 'x' : undefined);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', left: 0, top: 0}} />;
};

// ---------------- HUDs genéricos ----------------
// panel superior izquierdo: etiqueta + valor formateado (año, mes, semana, temperatura...)
export const fmtVal = (v: number, f: string) => {
  if (f === 'int') return Math.round(v).toLocaleString('en-US');
  if (f === 'temp') return `${v >= 0 ? '+' : ''}${v.toFixed(0)}°C`;
  if (f === 'temp1') return `${v >= 0 ? '+' : ''}${v.toFixed(1)}°C`;
  if (f === 'pct') return `${v >= 10 ? v.toFixed(0) : v.toFixed(1)}%`;
  if (f === 'm') return `+${v.toFixed(0)} m`;
  if (f === 'big') return v >= 1e9 ? (v / 1e9).toFixed(2) + 'B' : v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(0) + 'K' : Math.round(v).toString();
  if (f === 'clock') { const h = Math.floor(((v % 24) + 24) % 24), m = Math.floor((v * 60) % 60); return `${String(h).padStart(2, '0')}:${String(Math.abs(m)).padStart(2, '0')}`; }
  return String(Math.floor(v));
};
export const Hud: React.FC<{label: string; val: string; x?: number; y?: number; col?: string; sc?: number; big?: boolean}> = ({label, val, x = 44, y = 36, col = YEL, sc = 1, big}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `scale(${sc})`, transformOrigin: '0 0', padding: '6px 24px 10px', borderRadius: 18, background: 'rgba(8,12,24,0.84)', border: '4px solid rgba(255,255,255,0.22)', boxShadow: '0 10px 24px rgba(0,0,0,0.4)'}}>
    <div style={{...font, fontSize: 22, color: col, letterSpacing: 3}}>{label}</div>
    <div style={{...font, fontSize: big ? 80 : 62, lineHeight: big ? '80px' : '62px', color: '#fff'}}>{val}</div>
  </div>
);
// barra global (centro arriba)
export const GBar: React.FC<{label: string; pct: number; sub?: string; t: number; t0?: number; col?: string; y?: number}> = ({label, pct, sub, t, t0 = -1, col, y = 30}) => {
  const c = col || (pct > 50 ? '#3bd16f' : pct > 15 ? '#ffc23a' : '#ff3b30');
  return (
    <div style={{position: 'absolute', left: W / 2 - 400, top: y, width: 800, transform: `scale(${pop(t, t0, 0.35)})`, transformOrigin: '50% 0', padding: '10px 20px 12px', borderRadius: 18, background: 'rgba(8,12,24,0.86)', border: `5px solid ${INK}`, boxShadow: '0 10px 30px rgba(0,0,0,0.45)'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}><div style={{...font, fontSize: 28, color: '#fff', letterSpacing: 2}}>{label}</div><div style={{...font, fontSize: 40, color: c}}>{pct >= 10 ? pct.toFixed(0) : pct.toFixed(pct < 1 ? 2 : 1)}%</div></div>
      <div style={{position: 'relative', height: 26, borderRadius: 10, background: '#2a2a2e', border: '3px solid #000', overflow: 'hidden', marginTop: 4}}><div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.max(0.5, Math.min(100, pct))}%`, background: `linear-gradient(180deg, ${c}, ${c}aa)`, boxShadow: `0 0 14px ${c}`}} /></div>
      {sub && <div style={{...font, fontSize: 22, color: '#cfd8e8', marginTop: 4, textAlign: 'right'}}>{sub}</div>}
    </div>
  );
};
// termómetro vertical (lado derecho)
export const Thermo: React.FC<{v: number; min: number; max: number; t: number; x?: number; y?: number; label?: string}> = ({v, min, max, t, x = W - 150, y = 170, label = 'GLOBAL AVG'}) => {
  const u = Math.max(0, Math.min(1, (v - min) / (max - min))); const h = 520; const c = v > 25 ? '#ff3b30' : v > 5 ? '#ffc23a' : v > -40 ? '#5ab8ff' : '#b8e6ff';
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 110, height: h + 150}}>
      <div style={{position: 'absolute', left: 35, top: 0, width: 40, height: h, borderRadius: 20, background: '#1a1d24', border: `5px solid ${INK}`, overflow: 'hidden'}}><div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: `${u * 100}%`, background: `linear-gradient(0deg, ${c}, #ffffff88)`}} /></div>
      <div style={{position: 'absolute', left: 20, top: h - 20, width: 70, height: 70, borderRadius: '50%', background: c, border: `5px solid ${INK}`, boxShadow: `0 0 24px ${c}`}} />
      <div style={{position: 'absolute', left: -60, width: 230, top: h + 60, textAlign: 'center', ...font, fontSize: 44, color: '#fff', WebkitTextStroke: `8px ${INK}`, paintOrder: 'stroke fill'}}>{`${v >= 0 ? '+' : ''}${v.toFixed(0)}°C`}</div>
      <div style={{position: 'absolute', left: -60, width: 230, top: h + 110, textAlign: 'center', ...font, fontSize: 18, color: '#cfd8e8'}}>{label}</div>
    </div>
  );
};
export const Counter: React.FC<{label: string; val: string; x?: number; y?: number; col?: string; t: number; t0: number; anchor?: 'bl' | 'br' | 'tr'}> = ({label, val, x, y, col = '#9fd4ff', t, t0, anchor = 'bl'}) => {
  const pos: any = anchor === 'bl' ? {left: x ?? 44, bottom: y ?? 60} : anchor === 'br' ? {right: x ?? 44, bottom: y ?? 60} : {right: x ?? 44, top: y ?? 36};
  return <div style={{position: 'absolute', ...pos, transform: `scale(${pop(t, t0, 0.3)})`, transformOrigin: anchor === 'bl' ? '0 100%' : '100% 100%', padding: '10px 24px', borderRadius: 18, background: 'rgba(8,12,24,0.88)', border: `5px solid ${INK}`}}>
    <div style={{...font, fontSize: 24, color: col}}>{label}</div><div style={{fontFamily: 'monospace', fontWeight: 900, fontSize: 54, color: '#fff'}}>{val}</div></div>;
};
export const Banner: React.FC<{t: number; t0: number; t1: number; text: string; col?: string; y?: number}> = ({t, t0, t1, text, col = '#c3100a', y = 160}) => {
  if (t < t0 || t > t1) return null; const a = Math.min(ip(t, [t0, t0 + 0.25], [0, 1]), ip(t, [t1 - 0.3, t1], [1, 0]));
  return <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', opacity: a}}><div style={{display: 'inline-block', transform: `scale(${pop(t, t0, 0.3)})`, padding: '10px 36px', borderRadius: 14, background: col, border: `6px solid ${INK}`, ...font, fontSize: 50, color: '#fff', letterSpacing: 2, boxShadow: '0 10px 24px rgba(0,0,0,0.45)'}}>{text}</div></div>;
};
// flecha gorda animada en coordenadas del mundo
export const FatArrow: React.FC<{cam: Cam; t: number; t0: number; t1: number; a: number[]; b: number[]; col: string; w?: number}> = ({cam, t, t0, t1, a, b, col, w = 26}) => {
  if (t < t0) return null; const u = Math.min(1, (t - t0) / Math.max(0.1, t1 - t0)); const [ax, ay] = toS(a[0], a[1], cam), [bx0, by0] = toS(b[0], b[1], cam);
  const bx = ax + (bx0 - ax) * u, by = ay + (by0 - ay) * u; const ang = Math.atan2(by - ay, bx - ax); const L = Math.hypot(bx - ax, by - ay); if (L < 4) return null;
  const mx = (ax + bx) / 2 - Math.sin(ang) * L * 0.18, my = (ay + by) / 2 + Math.cos(ang) * L * 0.18 * -1;
  const hx = bx - Math.cos(ang) * w * 1.6, hy = by - Math.sin(ang) * w * 1.6;
  return (<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
    <path d={`M${ax},${ay} Q${mx},${my} ${hx},${hy}`} fill="none" stroke={INK} strokeWidth={w + 10} strokeLinecap="round" />
    <path d={`M${ax},${ay} Q${mx},${my} ${hx},${hy}`} fill="none" stroke={col} strokeWidth={w} strokeLinecap="round" />
    <path d={`M${bx},${by} L${hx - Math.sin(ang) * w * 1.3},${hy + Math.cos(ang) * w * 1.3} L${hx + Math.sin(ang) * w * 1.3},${hy - Math.cos(ang) * w * 1.3} Z`} fill={col} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
  </svg>);
};
export const Icon: React.FC<{name: string; x: number; y: number; w: number; c: string; op?: number}> = ({name, x, y, w, c, op = 1}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - w / 2, width: w, height: w, opacity: op, filter: `drop-shadow(0 0 2px ${INK}) drop-shadow(0 0 2px ${INK})`}}><div style={{width: '100%', height: '100%', background: c, WebkitMaskImage: `url(${staticFile('hw/icons/' + name + '.svg')})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center'}} /></div>
);
export const kName = (k: number) => (COUNTRIES[k]?.n || '').toUpperCase();
