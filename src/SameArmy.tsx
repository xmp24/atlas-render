// What If Every Country Had the Same Army? — vídeo largo (1920x1080)
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, Audio, Easing} from 'remotion';
import {FlagCanvas, MapCanvas, MiniMap, HWD, makeCam, worldAt, statsOf, anchorOf, COUNTRIES, CODE, MAINCOL, HR, MAPW, MAPH, NK, CamKey, Cam} from './HexWorld';
import {Globe} from './Globe';
import {PolyCanvas, PolyMini, polyState, ownerStats, CEv, CAREA, MAINPIECE, PIECES_C, TOTAL_AREA} from './PolyWorld';
import {Face, Mood, INK, YELLOW, RED, GREEN, CREAM, font, font2, lerp, popT, fmt} from './lib3';
import SD from './hw/samearmy.json';

export const SA = SD as any;
const D = SA as HWD;
export const SA_FRAMES = Math.round(SA.dur * 30);
const camF = makeCam(SA.cam as CamKey[]);
const NAME = (k: number) => COUNTRIES[k].n;
const UP = (k: number) => NAME(k).toUpperCase();

// tiempo del mapa (permite flash-forward y pausas)
export const tmapAt = (t: number) => {
  const m = SA.tmap as [number, number, number?][]; // [tv, tm, rate]
  let cur = m[0];
  for (const e of m) { if (e[0] <= t) cur = e; else break; }
  return cur[1] + (t - cur[0]) * (cur[2] ?? 1);
};
const shakeAt = (t: number): [number, number] => {
  let x = 0, y = 0;
  for (const [st, amp] of SA.shakes as [number, number][]) {
    const dt = t - st; if (dt < 0 || dt > 0.6) continue;
    const a = amp * (1 - dt / 0.6);
    x += Math.sin(dt * 83) * a; y += Math.cos(dt * 67) * a;
  }
  return [x, y];
};
const flashAt = (t: number) => {
  let a = 0;
  for (const st of SA.flashes as number[]) { const dt = t - st; if (dt >= 0 && dt < 0.45) a = Math.max(a, 1 - dt / 0.45); else if (dt < 0 && dt > -0.12) a = Math.max(a, 1 + dt / 0.12); }
  return a;
};
const toS = (x: number, y: number, c: Cam, W = 1920, H = 1080): [number, number] => [W / 2 + (x - c.cx) * c.s, H / 2 + (y - c.cy) * c.s];

// ---------- piezas de interfaz ----------
export const FlagImg: React.FC<{k: number; w: number; h?: number; round?: boolean; style?: React.CSSProperties}> = ({k, w, h, round, style}) => (
  <FlagCanvas k={k} w={w} h={h ?? (round ? w : (w * 3) / 4)} style={{borderRadius: round ? '50%' : 6, border: `3px solid ${INK}`, flexShrink: 0, ...style}} />
);
const Pill: React.FC<{children: React.ReactNode; bg?: string; style?: React.CSSProperties}> = ({children, bg = 'rgba(14,20,32,0.88)', style}) => (
  <div style={{background: bg, border: `4px solid ${INK}`, borderRadius: 18, boxShadow: '0 5px 0 rgba(0,0,0,0.35)', ...style}}>{children}</div>
);

// ---------- etiquetas y caras sobre el mapa ----------
// estado del mapa de países (fronteras reales)
const CEV = (SA.cev || []) as CEv[];
const COLD_END = 9.0;
const pstate = (t: number, tm: number) => polyState(CEV, t, tm, t < COLD_END);
const Labels: React.FC<{t: number; tm: number; cam: Cam; max?: number; W?: number; H?: number}> = ({t, tm, cam, max = 16, W = 1920, H = 1080}) => {
  const st = pstate(t, tm); const os = ownerStats(st.owner);
  const stl = pstate(Math.max(0, t - 1.5), tm - 1.5); const osl = ownerStats(stl.owner);
  const s2 = cam.s * cam.s;
  // pieza más grande de cada dueño (ancla en tierra)
  const best = new Int32Array(NK).fill(-1); const bestA = new Float64Array(NK);
  for (let k = 0; k < NK; k++) { const mp = MAINPIECE[k]; if (mp < 0) continue; const o = st.owner[k]; const ar = CAREA[k] * (o === k ? 1.6 : 1); if (ar > bestA[o]) { bestA[o] = ar; best[o] = k; } }
  const cand: number[] = [];
  for (let k = 0; k < NK; k++) {
    if (!os.a[k] || best[k] < 0) continue;
    if (os.a[k] * s2 < 2600 * 6) continue;
    const c = PIECES_C(best[k]);
    const [sx, sy] = toS(c[0], c[1], cam, W, H);
    if (sx < -60 || sx > W + 60 || sy < -60 || sy > H + 60) continue;
    cand.push(k);
  }
  cand.sort((x, y) => os.a[y] - os.a[x]);
  const out: React.ReactNode[] = [];
  const placed: [number, number, number][] = [];
  const top = cand.length ? cand[0] : -1;
  for (const k of cand) {
    if (out.length >= max) break;
    const c = PIECES_C(best[k]);
    const [sx, sy] = toS(c[0], c[1], cam, W, H);
    const r = Math.max(13, Math.min(46, Math.sqrt(os.a[k] * s2) * 0.06));
    if (placed.some(([px, py, pr]) => Math.hypot(px - sx, py - sy) < (pr + r) * 1.6)) continue;
    placed.push([sx, sy, r]);
    const dn = os.a[k] - osl.a[k];
    let mood: Mood = 'calm';
    if (dn < -os.a[k] * 0.03) mood = os.a[k] < 2e5 ? 'shocked' : 'scared';
    else if (dn > os.a[k] * 0.03) mood = 'angry';
    if (k === top && mood !== 'scared') mood = 'smug';
    const fs = Math.max(15, Math.min(30, r * 0.62));
    out.push(
      <g key={k}>
        <Face x={sx} y={sy - r * 0.2} r={r} mood={mood} t={t} seed={k * 7 + 3} />
        <g transform={`translate(${sx},${sy + r * 0.95})`}>
          <rect x={-NAME(k).length * fs * 0.3 - 10} y={-fs * 0.62} width={NAME(k).length * fs * 0.6 + 20} height={fs * 1.3} rx={fs * 0.45} fill="rgba(255,255,255,0.94)" stroke={INK} strokeWidth={3} />
          <text x={0} y={fs * 0.36} textAnchor="middle" fontSize={fs} fill={INK} style={{fontFamily: 'Lilita'}}>{UP(k)}</text>
        </g>
      </g>,
    );
  }
  return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{out}</svg>;
};

// flechas navales / ofensivas
const Arrows: React.FC<{t: number; tm: number; cam: Cam; W?: number; H?: number}> = ({t, tm, cam, W = 1920, H = 1080}) => {
  const out: React.ReactNode[] = [];
  (SA.arrows as [number, number, number, number, number, number, number, string][]).forEach(([t0, t1, x0, y0, x1, y1, k, kind], i) => {
    if (tm < t0 - 0.1 || tm > t1 + 1.2) return;
    const p = lerp(tm, t0, t1, 0, 1, Easing.inOut(Easing.quad));
    const a = lerp(tm, t0 - 0.1, t0 + 0.2, 0, 1) * lerp(tm, t1 + 0.5, t1 + 1.2, 1, 0);
    const [ax, ay] = toS(x0, y0, cam, W, H), [bx, by] = toS(x1, y1, cam, W, H);
    const mx = (ax + bx) / 2, my = (ay + by) / 2 - Math.hypot(bx - ax, by - ay) * 0.22;
    const q = (u: number): [number, number] => [(1 - u) * (1 - u) * ax + 2 * (1 - u) * u * mx + u * u * bx, (1 - u) * (1 - u) * ay + 2 * (1 - u) * u * my + u * u * by];
    const pts: string[] = []; for (let j = 0; j <= 30; j++) { const [x, y] = q((j / 30) * p); pts.push(`${x.toFixed(1)},${y.toFixed(1)}`); }
    const [hx, hy] = q(p); const [px, py] = q(Math.max(0, p - 0.03));
    const ang = (Math.atan2(hy - py, hx - px) * 180) / Math.PI;
    const col = MAINCOL[k];
    out.push(
      <g key={i} opacity={a}>
        <polyline points={pts.join(' ')} fill="none" stroke={INK} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={pts.join(' ')} fill="none" stroke={col} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={kind === 'naval' ? '18 10' : undefined} strokeDashoffset={-t * 40} />
        <g transform={`translate(${hx},${hy}) rotate(${ang})`}>
          <path d="M-6,-18 L22,0 L-6,18 Z" fill={col} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        </g>
        {kind === 'naval' && p < 1 && [0, 0.07, 0.14].map((lag, si) => {
          const [sx, sy] = q(Math.max(0, p - lag));
          return (
            <g key={si} transform={`translate(${sx},${sy})`}>
              <circle r={si ? 17 : 22} fill={col} stroke={INK} strokeWidth={4} />
              <image href={staticFile('hw/icons/battleship.svg')} x={si ? -12 : -15} y={si ? -12 : -15} width={si ? 24 : 30} height={si ? 24 : 30} />
            </g>
          );
        })}
        {kind === 'naval' && p < 1 && (() => { const [jx, jy] = q(Math.min(1, p + 0.08)); return (
          <g transform={`translate(${jx},${jy - 46}) rotate(${ang + 90})`}>
            <image href={staticFile('hw/icons/jet-fighter.svg')} x={-16} y={-16} width={32} height={32} style={{filter: 'drop-shadow(0 2px 2px #000)'}} />
          </g>); })()}
      </g>,
    );
  });
  return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{out}</svg>;
};

// ---------- HUD ----------
const aliveAt = (tm: number) => NK - (SA.elim as number[][]).filter((e) => e[0] <= tm).length;
const soldAt = (tm: number, k: number) => {
  const s = SA.sold; const i = Math.max(0, Math.min(s.v.length - 1, Math.floor(tm / s.dt)));
  return s.v[i][k] * 1000;
};
const Hud: React.FC<{t: number; tm: number; cam: Cam; show: number}> = ({t, tm, cam, show}) => {
  if (show <= 0.01) return null;
  const pst = pstate(t, tm); const os = ownerStats(pst.owner);
  const st = {n: os.a}; const total = TOTAL_AREA;
  const top = Array.from({length: NK}, (_, k) => k).filter((k) => st.n[k] > 0).sort((a, b) => st.n[b] - st.n[a]).slice(0, 5);
  const alive = aliveAt(tm);
  const lastE = (SA.elim as number[][]).filter((e) => e[0] <= tm).slice(-1)[0];
  const bump = lastE && tm - lastE[0] < 0.35 ? 0.18 * (1 - (tm - lastE[0]) / 0.35) : 0;
  const feed = (SA.elim as number[][]).filter((e) => e[0] <= tm && tm - e[0] < 3.2).slice(-4);
  const day = Math.max(1, Math.floor((tm - SA.warStart) * SA.dayRate) + 1);
  const ch = (SA.chapters as [number, number, string][]).filter((c) => c[0] <= t).slice(-1)[0];
  const y = (1 - show) * -160;
  return (
    <>
      {/* contador */}
      <div style={{position: 'absolute', top: 22 + y, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 14, zIndex: 20}}>
        {ch && <Pill bg={YELLOW} style={{padding: '6px 22px 2px', ...font, fontSize: 38, color: INK}}>CH.{ch[1]} · {ch[2]}</Pill>}
        <Pill bg="#14141c" style={{padding: '6px 24px 2px', display: 'flex', alignItems: 'center', gap: 12, transform: `scale(${1 + bump})`}}>
          <span style={{...font, fontSize: 38, color: '#fff'}}>COUNTRIES LEFT:</span>
          <span style={{...font, fontSize: 46, color: RED, minWidth: 74, textAlign: 'right'}}>{alive}</span>
        </Pill>
        <Pill bg={CREAM} style={{padding: '6px 22px 2px', ...font, fontSize: 38, color: INK}}>DAY {day}</Pill>
      </div>
      {/* clasificación */}
      <div style={{position: 'absolute', top: 120, right: 24 + (1 - show * (duelAt(t) || cam.s < 0.36 ? 0 : 1)) * -500, width: 410, zIndex: 20}}>
        <Pill style={{padding: '12px 14px'}}>
          <div style={{...font, fontSize: 30, color: YELLOW, marginBottom: 6, textAlign: 'center'}}>🏆 BIGGEST EMPIRES</div>
          {top.map((k, i) => (
            <div key={k} style={{display: 'flex', alignItems: 'center', gap: 10, padding: '5px 4px', borderTop: i ? '2px solid rgba(255,255,255,0.12)' : undefined}}>
              <div style={{...font, fontSize: 28, color: i === 0 ? YELLOW : '#fff', width: 26}}>{i + 1}</div>
              <FlagImg k={k} w={46} h={32} />
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{...font, fontSize: 25, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.05}}>{UP(k)}</div>
                <div style={{height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 4, marginTop: 3}}><div style={{width: `${Math.min(100, (st.n[k] / total) * 100 * 1.6)}%`, height: 8, background: MAINCOL[k], borderRadius: 4}} /></div>
              </div>
              <div style={{textAlign: 'right'}}>
                <div style={{...font, fontSize: 27, color: '#fff', lineHeight: 1}}>{((st.n[k] / total) * 100).toFixed(0)}%</div>
                <div style={{...font2, fontSize: 15, color: '#c9d4e6'}}>🪖 {(soldAt(tm, k) / 1e6).toFixed(1)}M</div>
              </div>
            </div>
          ))}
        </Pill>
      </div>
      {/* feed tipo Fortnite */}
      <div style={{position: 'absolute', top: duelAt(t) ? 250 : 104, left: 22 + (1 - show) * -600, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 20}}>
        {(SA.feed as number[][]).filter((e) => e[0] <= t && t - e[0] < 4.5).slice(-5).map((e) => {
          const k = popT(t, e[0], 14) * lerp(t, e[0] + 4.0, e[0] + 4.5, 1, 0);
          return (
            <div key={e[1]} style={{transform: `translateX(${(k - 1) * 500}px)`, opacity: k, display: 'flex', alignItems: 'center', gap: 9, background: 'linear-gradient(90deg, rgba(10,14,24,0.92), rgba(10,14,24,0.55))', borderLeft: `6px solid ${e[2] >= 0 ? MAINCOL[e[2]] : '#888'}`, borderRadius: 8, padding: '5px 14px 3px 10px'}}>
              {e[2] >= 0 && <><FlagImg k={e[2]} w={40} h={28} /><span style={{...font, fontSize: 28, color: '#fff'}}>{UP(e[2])}</span></>}
              <Img src={staticFile('hw/icons/incoming-rocket.svg')} style={{width: 30, height: 30, filter: 'drop-shadow(0 0 2px #000)'}} />
              <FlagImg k={e[1]} w={40} h={28} style={{filter: 'grayscale(1)'}} />
              <span style={{...font, fontSize: 28, color: '#ff6b5e'}}>{UP(e[1])}</span>
            </div>
          );
        })}
      </div>
      {/* minimapa */}
      <div style={{position: 'absolute', left: 24 + (1 - show) * -500, bottom: 24, zIndex: 20, border: `4px solid ${INK}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 5px 0 rgba(0,0,0,0.35)'}}>
        <PolyMini cev={CEV} t={t} tm={tm} byTm={t < COLD_END} cam={cam} w={300} h={156} VW={1920} VH={1080} />
      </div>
      <div style={{position: 'absolute', right: 24, bottom: 14, ...font2, fontSize: 18, color: 'rgba(255,255,255,0.85)', textShadow: '0 2px 3px #000', zIndex: 20, opacity: show}}>Hypothetical simulation · Every country starts with 1,000,000 soldiers</div>
    </>
  );
};

// rótulos de evento
const Chips: React.FC<{t: number}> = ({t}) => {
  const c = (SA.chips as [number, string, number, number][]).filter(([t0, , , d]) => t >= t0 && t < t0 + d).slice(-1)[0];
  if (!c) return null;
  const [t0, text, k, d] = c;
  const a = popT(t, t0, 11) * lerp(t, t0 + d - 0.3, t0 + d, 1, 0);
  return (
    <div style={{position: 'absolute', bottom: 64, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 25}}>
      <div style={{transform: `translateY(${(1 - a) * 160}px) scale(${0.7 + 0.3 * a})`, opacity: Math.min(1, a * 1.5), display: 'flex', alignItems: 'center', gap: 16, background: CREAM, border: `5px solid ${INK}`, borderRadius: 22, padding: '10px 30px 6px 14px', boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>
        {k >= 0 && <FlagImg k={k} w={64} round />}
        <span style={{...font, fontSize: 50, color: INK}}>{text}</span>
      </div>
    </div>
  );
};
const Stamps: React.FC<{t: number}> = ({t}) => {
  const s = (SA.stamps as [number, string, number, string][]).filter(([t0]) => t >= t0 && t < t0 + 2.2).slice(-1)[0];
  if (!s) return null;
  const [t0, text, k, col] = s;
  const dt = t - t0;
  const sc = dt < 0.18 ? 2.4 - (dt / 0.18) * 1.4 : 1;
  const a = lerp(dt, 1.8, 2.2, 1, 0);
  return (
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30, pointerEvents: 'none'}}>
      <div style={{transform: `rotate(-6deg) scale(${sc})`, opacity: a * Math.min(1, dt / 0.08), display: 'flex', alignItems: 'center', gap: 22, background: 'rgba(255,248,235,0.97)', border: `9px solid ${col}`, borderRadius: 18, padding: '16px 40px 10px', boxShadow: '0 12px 0 rgba(0,0,0,0.35)'}}>
        {k >= 0 && <div style={{position: 'relative'}}><FlagImg k={k} w={110} round style={{filter: col === RED ? 'grayscale(0.6)' : undefined}} /></div>}
        <span style={{...font, fontSize: 88, color: col, letterSpacing: 1}}>{text}</span>
      </div>
    </div>
  );
};
const Chapter: React.FC<{t: number}> = ({t}) => {
  const c = (SA.chapters as [number, number, string][]).filter(([t0]) => t >= t0 - 0.1 && t < t0 + 2.4).slice(-1)[0];
  if (!c) return null;
  const [t0, n, title] = c;
  const sl = lerp(t, t0 - 0.1, t0 + 0.3, -1, 0, Easing.out(Easing.cubic)) + lerp(t, t0 + 2.0, t0 + 2.4, 0, 1, Easing.in(Easing.cubic));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 210, zIndex: 35, display: 'flex', justifyContent: 'center', pointerEvents: 'none'}}>
      <div style={{transform: `translateX(${sl * 1400}px) skewX(-10deg)`, background: YELLOW, border: `6px solid ${INK}`, padding: '6px 46px 2px', boxShadow: '0 8px 0 rgba(0,0,0,0.35)', display: 'flex', alignItems: 'baseline', gap: 18}}>
        <span style={{...font, fontSize: 34, color: INK, opacity: 0.7}}>CHAPTER {n}</span>
        <span style={{...font, fontSize: 64, color: INK}}>{title}</span>
      </div>
    </div>
  );
};

// combates: pantalla VS con cuotas, barras de vida y K.O.
const Duel: React.FC<{t: number}> = ({t}) => {
  const d = (SA.duels as any[]).find((x) => t >= x.t0 - 0.05 && t < x.t1);
  if (!d) return null;
  const {a, v, ko, hp} = d;
  const vsEnd = d.t0 + 1.35;
  const hpAt = (): [number, number] => {
    const h = hp as number[][]; if (t <= h[0][0]) return [1, 1];
    for (let i = 1; i < h.length; i++) if (t <= h[i][0]) { const u = (t - h[i - 1][0]) / (h[i][0] - h[i - 1][0]); return [h[i - 1][1] + (h[i][1] - h[i - 1][1]) * u, h[i - 1][2] + (h[i][2] - h[i - 1][2]) * u]; }
    return [h[h.length - 1][1], 0];
  };
  const [ha, hv] = hpAt();
  const sa = soldAt(tmapAt(d.t0), a), sv = soldAt(tmapAt(d.t0), v);
  const pa = Math.round(Math.min(92, Math.max(8, (sa / Math.max(1, sa + sv)) * 100)));
  const out: React.ReactNode[] = [];
  if (t < vsEnd + 0.25) {
    const k = popT(t, d.t0, 11) * lerp(t, vsEnd - 0.05, vsEnd + 0.25, 1, 0);
    const side = (kk: number, dir: number, odds: number) => (
      <div style={{transform: `translateX(${dir * (1 - k) * 900}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
        <div style={{position: 'relative', width: 230, height: 230}}>
          <FlagImg k={kk} w={230} round style={{border: `9px solid ${INK}`}} />
          <svg width={230} height={230} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><Face x={115} y={108} r={66} mood="angry" t={t} seed={kk} look={[-dir * 0.8, 0]} /></svg>
        </div>
        <div style={{...font, fontSize: 58, color: '#fff', textShadow: `5px 5px 0 ${INK}`}}>{UP(kk)}</div>
        <div style={{background: odds >= 50 ? '#22a95b' : RED, border: `5px solid ${INK}`, borderRadius: 14, padding: '2px 20px 0', ...font, fontSize: 44, color: '#fff'}}>{odds}% TO WIN</div>
      </div>
    );
    out.push(
      <AbsoluteFill key="vs" style={{zIndex: 42, background: `linear-gradient(105deg, ${MAINCOL[a]}cc 0%, rgba(0,0,0,0.6) 50%, ${MAINCOL[v]}cc 100%)`, opacity: Math.min(1, k * 1.4), display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 120}}>
        {side(a, -1, pa)}
        <div style={{...font, fontSize: 190, color: YELLOW, WebkitTextStroke: `8px ${INK}`, paintOrder: 'stroke fill', transform: `scale(${0.6 + 0.6 * popT(t, d.t0 + 0.15, 8)}) rotate(-8deg)`}}>VS</div>
        {side(v, 1, 100 - pa)}
      </AbsoluteFill>,
    );
  }
  // barras de vida
  const bk = popT(t, vsEnd - 0.1, 12) * lerp(t, d.t1 - 0.3, d.t1, 1, 0);
  const shake = t > ko - 0.05 && t < ko + 0.4 ? Math.sin(t * 90) * 6 : 0;
  const bar = (kk: number, h: number, dir: number) => (
    <div style={{display: 'flex', flexDirection: dir < 0 ? 'row' : 'row-reverse', alignItems: 'center', gap: 12}}>
      <FlagImg k={kk} w={74} round />
      <div style={{display: 'flex', flexDirection: 'column', alignItems: dir < 0 ? 'flex-start' : 'flex-end', gap: 4}}>
        <div style={{...font, fontSize: 34, color: '#fff', textShadow: `3px 3px 0 ${INK}`}}>{UP(kk)}</div>
        <div style={{width: 480, height: 36, background: '#3a0d0d', border: `5px solid ${INK}`, borderRadius: 8, overflow: 'hidden', transform: dir < 0 ? 'none' : 'scaleX(-1)', boxShadow: '0 5px 0 rgba(0,0,0,0.35)'}}>
          <div style={{width: `${Math.max(0, h) * 100}%`, height: '100%', background: h > 0.5 ? 'linear-gradient(180deg,#9df06a,#2fb43a)' : h > 0.22 ? 'linear-gradient(180deg,#ffe36a,#f0a000)' : 'linear-gradient(180deg,#ff7a6a,#d01b1b)'}} />
        </div>
      </div>
    </div>
  );
  if (t >= vsEnd - 0.1) {
    out.push(
      <div key="bars" style={{position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, zIndex: 41, transform: `translateY(${(1 - bk) * -260}px) translateX(${shake}px)`}}>
        {bar(a, ha, -1)}
        <div style={{...font, fontSize: 64, color: YELLOW, WebkitTextStroke: `5px ${INK}`, paintOrder: 'stroke fill'}}>VS</div>
        {bar(v, hv, 1)}
      </div>,
    );
  }
  if (t >= ko) {
    const kk = popT(t, ko, 8) * lerp(t, d.t1 - 0.3, d.t1, 1, 0);
    out.push(
      <div key="ko" style={{position: 'absolute', inset: 0, zIndex: 43, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{transform: `scale(${0.3 + kk * 0.9}) rotate(-6deg)`, ...font, fontSize: 230, color: RED, WebkitTextStroke: `12px ${INK}`, paintOrder: 'stroke fill', textShadow: '0 14px 0 rgba(0,0,0,0.4)'}}>K.O.!</div>
        <div style={{opacity: kk, ...font, fontSize: 54, color: '#fff', textShadow: `4px 4px 0 ${INK}`}}>{UP(a)} WINS</div>
      </div>,
    );
  }
  return <>{out}</>;
};
const duelAt = (t: number) => (SA.duels as any[]).find((x) => t >= x.t0 && t < x.t1);

// botón de suscripción + like con cursor
const Subscribe: React.FC<{t: number}> = ({t}) => {
  const s0 = (SA.subs as number[]).find((x) => t >= x && t < x + 4.2);
  if (s0 === undefined) return null;
  const dt = t - s0;
  const k = popT(t, s0, 12) * lerp(dt, 3.8, 4.2, 1, 0);
  const cx = lerp(dt, 0.4, 1.3, 520, 150, Easing.inOut(Easing.cubic)), cy = lerp(dt, 0.4, 1.3, 160, 52);
  const cx2 = lerp(dt, 1.8, 2.6, cx, 438, Easing.inOut(Easing.cubic));
  const clicked1 = dt > 1.45, clicked2 = dt > 2.75;
  const press = (c: number) => (dt > c && dt < c + 0.15 ? 0.9 : 1);
  return (
    <div style={{position: 'absolute', right: 470, bottom: 40, zIndex: 50, transform: `translateY(${(1 - k) * 260}px)`, opacity: Math.min(1, k * 1.5)}}>
      <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.97)', border: `5px solid ${INK}`, borderRadius: 60, padding: '12px 18px', boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>
        <div style={{width: 74, height: 74, borderRadius: '50%', background: '#1d56c9', border: `4px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40}}>🌍</div>
        <div style={{...font, fontSize: 34, color: INK, lineHeight: 1}}>ATLAS OF WAR</div>
        <div style={{transform: `scale(${press(1.45)})`, background: clicked1 ? '#5a5a5a' : '#e5322d', borderRadius: 40, padding: '10px 26px 6px', ...font, fontSize: 36, color: '#fff'}}>{clicked1 ? 'SUBSCRIBED ✓' : 'SUBSCRIBE'}</div>
        <div style={{transform: `scale(${press(2.75) * (clicked2 ? 1 + 0.25 * Math.max(0, 1 - (dt - 2.75) / 0.3) : 1)})`, width: 64, height: 64, borderRadius: '50%', background: clicked2 ? '#1d56c9' : '#ddd', border: `4px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34}}>👍</div>
        {dt > 0.3 && <div style={{position: 'absolute', left: dt < 1.8 ? cx : cx2, top: dt < 1.8 ? cy : lerp(dt, 1.8, 2.6, cy, 56), fontSize: 64, transform: `scale(${(dt > 1.4 && dt < 1.6) || (dt > 2.7 && dt < 2.9) ? 0.8 : 1})`, filter: 'drop-shadow(0 4px 2px rgba(0,0,0,0.5))'}}>👆</div>}
      </div>
    </div>
  );
};

// gráfico de carrera en planos generales
const Race: React.FC<{t: number; tm: number; cam: Cam}> = ({t, tm, cam}) => {
  const vis = lerp(cam.s, 0.3, 0.38, 1, 0) * (duelAt(t) ? 0 : 1);
  if (vis <= 0.02 || t < SA.hud[0] + 1 || t > SA.winT - 0.5) return null;
  const os = ownerStats(pstate(t, tm).owner); const st = {n: os.a};
  const total = TOTAL_AREA;
  const top = Array.from({length: NK}, (_, k) => k).filter((k) => st.n[k] > 0).sort((x, y) => st.n[y] - st.n[x]).slice(0, 6);
  const mx = st.n[top[0]] || 1;
  return (
    <div style={{position: 'absolute', right: 24, bottom: 52, width: 470, zIndex: 21, opacity: vis, background: 'rgba(10,14,24,0.85)', border: `4px solid ${INK}`, borderRadius: 16, padding: '10px 14px 8px'}}>
      <div style={{...font, fontSize: 26, color: YELLOW, marginBottom: 4}}>📈 RACE FOR THE WORLD</div>
      {top.map((k) => (
        <div key={k} style={{display: 'flex', alignItems: 'center', gap: 8, height: 34}}>
          <div style={{width: `${(st.n[k] / mx) * 290 + 30}px`, height: 26, background: MAINCOL[k], border: `3px solid ${INK}`, borderRadius: 6}} />
          <FlagImg k={k} w={30} h={21} />
          <span style={{...font, fontSize: 22, color: '#fff', whiteSpace: 'nowrap'}}>{((st.n[k] / total) * 100).toFixed(0)}%</span>
        </div>
      ))}
    </div>
  );
};

// ruleta
const Roulette: React.FC<{t: number; r: any}> = ({t, r}) => {
  const {t0, t1, items, pick, title, result, kind} = r;
  if (t < t0 || t > t1) return null;
  const n = items.length; const seg = 360 / n;
  const spinEnd = t0 + (t1 - t0) * 0.62;
  const total = 360 * 5 + (360 - (pick * seg + seg / 2));
  const p = lerp(t, t0 + 0.6, spinEnd, 0, 1, Easing.out(Easing.cubic));
  const rot = total * p;
  const a = lerp(t, t0, t0 + 0.4, 0, 1) * lerp(t, t1 - 0.4, t1, 1, 0);
  const done = t > spinEnd;
  const R = 330;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 40, background: `rgba(6,10,22,${0.72 * a})`, opacity: a}}>
      <div style={{position: 'absolute', top: 40, left: 0, right: 0, textAlign: 'center', ...font, fontSize: 92, color: YELLOW, textShadow: `6px 6px 0 ${INK}`}}>{title}</div>
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        <g transform={`translate(960,${580}) scale(${0.6 + 0.4 * popT(t, t0, 12)})`}>
          <circle r={R + 22} fill={INK} />
          <g transform={`rotate(${rot})`}>
            {items.map((it: any, i: number) => {
              const a0 = ((i * seg - 90) * Math.PI) / 180, a1 = (((i + 1) * seg - 90) * Math.PI) / 180;
              const am = (a0 + a1) / 2;
              const col = kind === 'flag' ? MAINCOL[it] : ['#e5322d', '#1f6fe0', '#22a95b', '#ffd23f', '#ff8a1f', '#7b2cbf', '#13b5c8', '#ff5fa2'][i % 8];
              return (
                <g key={i}>
                  <path d={`M0,0 L${Math.cos(a0) * R},${Math.sin(a0) * R} A${R},${R} 0 0,1 ${Math.cos(a1) * R},${Math.sin(a1) * R} Z`} fill={col} stroke={INK} strokeWidth={5} />
                  <g transform={`translate(${Math.cos(am) * R * 0.66},${Math.sin(am) * R * 0.66}) rotate(${(am * 180) / Math.PI + 90})`}>
                    {kind === 'flag' ? (
                      <>
                        <clipPath id={`rc${i}`}><circle r={38} /></clipPath>
                        <image href={staticFile(`wflags/${CODE[it].toLowerCase()}.svg`)} x={-51} y={-38} width={102} height={76} clipPath={`url(#rc${i})`} preserveAspectRatio="xMidYMid slice" />
                        <circle r={38} fill="none" stroke={INK} strokeWidth={5} />
                      </>
                    ) : (
                      <text textAnchor="middle" y={12} fontSize={34} style={{fontFamily: 'Lilita'}} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">{it.icon}</text>
                    )}
                  </g>
                </g>
              );
            })}
          </g>
          <circle r={58} fill={CREAM} stroke={INK} strokeWidth={8} />
          <text y={18} textAnchor="middle" fontSize={50}>{kind === 'flag' ? '⚔️' : '🌍'}</text>
          <path d={`M-30,${-R - 52} L30,${-R - 52} L0,${-R + 10} Z`} fill={RED} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        </g>
      </svg>
      {done && (
        <div style={{position: 'absolute', bottom: 46, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <div style={{transform: `scale(${popT(t, spinEnd, 9)})`, display: 'flex', alignItems: 'center', gap: 18, background: YELLOW, border: `7px solid ${INK}`, borderRadius: 24, padding: '12px 36px 6px', boxShadow: '0 10px 0 rgba(0,0,0,0.4)'}}>
            {kind === 'flag' && <FlagImg k={items[pick]} w={84} round />}
            <span style={{...font, fontSize: 70, color: INK}}>{result}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// tarjetas de reglas (panel izquierdo)
const RuleCard: React.FC<{t: number}> = ({t}) => {
  const c = (SA.rules as any[]).filter((r) => t >= r.t0 && t < r.t1).slice(-1)[0];
  if (!c) return null;
  const a = popT(t, c.t0, 12) * lerp(t, c.t1 - 0.3, c.t1, 1, 0);
  return (
    <div style={{position: 'absolute', left: 60, top: 150, width: 820, zIndex: 30, transform: `translateX(${(1 - a) * -900}px)`}}>
      <div style={{background: CREAM, border: `7px solid ${INK}`, borderRadius: 28, padding: '22px 34px 26px', boxShadow: '0 12px 0 rgba(0,0,0,0.35)'}}>
        <div style={{...font, fontSize: 40, color: c.col || RED}}>{c.kicker}</div>
        <div style={{...font, fontSize: 74, color: INK, lineHeight: 1.02, marginTop: 4}}>{c.title}</div>
        {c.rows && <div style={{marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12}}>
          {c.rows.map((row: any, i: number) => {
            const ra = popT(t, c.t0 + 0.6 + i * 0.7, 12);
            return (
              <div key={i} style={{opacity: Math.min(1, ra * 1.5), transform: `translateX(${(1 - ra) * -60}px)`, display: 'flex', alignItems: 'center', gap: 16, background: '#fff', border: `4px solid ${INK}`, borderRadius: 16, padding: '8px 16px 4px'}}>
                {row.k !== undefined ? <FlagImg k={row.k} w={70} h={48} /> : <span style={{fontSize: 46}}>{row.icon}</span>}
                <div style={{flex: 1}}>
                  <div style={{...font, fontSize: 38, color: INK, lineHeight: 1}}>{row.a}</div>
                  {row.b && <div style={{...font2, fontSize: 25, color: '#555'}}>{row.b}</div>}
                </div>
                {row.v && <div style={{...font, fontSize: 44, color: row.vc || RED}}>{row.v}</div>}
              </div>
            );
          })}
        </div>}
      </div>
    </div>
  );
};

// final: ganador + ranking
const Winner: React.FC<{t: number}> = ({t}) => {
  const t0 = SA.winT; if (t < t0) return null;
  const k = SA.winner as number;
  const a = popT(t, t0, 10);
  const rk = SA.rankT as number;
  const showRank = t > rk;
  return (
    <AbsoluteFill style={{zIndex: 45}}>
      {!showRank && (
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(circle, rgba(255,210,63,${0.25 * a}) 0%, rgba(0,0,0,${0.55 * a}) 70%)`}}>
          <div style={{transform: `scale(${a})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{fontSize: 130, marginBottom: -30, transform: `rotate(${Math.sin(t * 3) * 6}deg)`}}>👑</div>
            <div style={{position: 'relative', width: 300, height: 300}}>
              <FlagImg k={k} w={300} round style={{border: `10px solid ${INK}`}} />
              <svg width={300} height={300} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><Face x={150} y={140} r={88} mood="happy" t={t} seed={5} /></svg>
            </div>
            <div style={{...font, fontSize: 130, color: YELLOW, textShadow: `8px 8px 0 ${INK}`, marginTop: 10}}>{UP(k)} WINS!</div>
            <div style={{...font2, fontSize: 40, color: '#fff', textShadow: '0 3px 4px #000'}}>{SA.winLine}</div>
          </div>
        </div>
      )}
      {showRank && (
        <div style={{position: 'absolute', inset: 0, background: 'rgba(8,12,24,0.82)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 40}}>
          <div style={{...font, fontSize: 80, color: YELLOW, textShadow: `6px 6px 0 ${INK}`}}>FINAL RANKING</div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 40px', marginTop: 20}}>
            {(SA.rank as number[]).slice(0, 10).map((kk, i) => {
              const ra = popT(t, rk + 0.3 + (9 - i) * 0.35, 12);
              return (
                <div key={kk} style={{transform: `scale(${ra})`, display: 'flex', alignItems: 'center', gap: 16, width: 640, background: i === 0 ? YELLOW : CREAM, border: `5px solid ${INK}`, borderRadius: 18, padding: '8px 18px 4px'}}>
                  <div style={{...font, fontSize: 48, color: INK, width: 92}}>#{i + 1}</div>
                  <FlagImg k={kk} w={80} h={56} />
                  <div style={{...font, fontSize: 46, color: INK, flex: 1}}>{UP(kk)}</div>
                  {i === 0 && <span style={{fontSize: 46}}>👑</span>}
                </div>
              );
            })}
          </div>
          <div style={{...font, fontSize: 52, color: '#fff', marginTop: 34, opacity: popT(t, rk + 4.5, 12)}}>WHERE DID <span style={{color: YELLOW}}>YOUR COUNTRY</span> FINISH? 👇</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// apertura en flash-forward y título
const ColdText: React.FC<{t: number}> = ({t}) => {
  const c = (SA.cold as [number, number, string, string?][]).filter(([t0, t1]) => t >= t0 && t < t1).slice(-1)[0];
  if (!c) return null;
  const [t0, t1, text, sub] = c;
  const a = popT(t, t0, 9) * lerp(t, t1 - 0.2, t1, 1, 0);
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 100%)'}}>
      <div style={{transform: `scale(${0.6 + 0.4 * a}) rotate(${(1 - a) * -4}deg)`, opacity: Math.min(1, a * 1.4), ...font, fontSize: 150, color: '#fff', textShadow: `8px 8px 0 ${INK}, 0 0 40px rgba(0,0,0,0.6)`, textAlign: 'center', lineHeight: 1}}>{text}</div>
      {sub && <div style={{opacity: a, ...font, fontSize: 64, color: YELLOW, textShadow: `5px 5px 0 ${INK}`, marginTop: 10}}>{sub}</div>}
    </div>
  );
};
const TitleOnGlobe: React.FC<{t: number}> = ({t}) => {
  const g = SA.globe; if (t < g.t0 || t > g.t1) return null;
  const a = popT(t, g.t0 + 1.2, 11) * lerp(t, g.t1 - 0.8, g.t1 - 0.2, 1, 0);
  return (
    <div style={{position: 'absolute', top: 70, left: 0, right: 0, textAlign: 'center', zIndex: 30, transform: `scale(${0.7 + 0.3 * a})`, opacity: a}}>
      <div style={{...font, fontSize: 96, color: '#fff', textShadow: `6px 6px 0 ${INK}`, lineHeight: 1}}>WHAT IF EVERY COUNTRY</div>
      <div style={{...font, fontSize: 132, color: YELLOW, textShadow: `7px 7px 0 ${INK}`, lineHeight: 1.05}}>HAD THE SAME ARMY?</div>
    </div>
  );
};

// ---------- composición ----------
export const SameArmy: React.FC<{audio?: boolean; dbg?: string}> = ({audio = true, dbg = ''}) => {
  const f = useCurrentFrame(); const t = f / 30;
  const tm = tmapAt(t);
  const cam = camF(t);
  const camPrev = camF(Math.max(0, t - 1 / 30));
  const speed = Math.hypot((cam.cx - camPrev.cx) * cam.s, (cam.cy - camPrev.cy) * cam.s) + Math.abs(Math.log(cam.s / camPrev.s)) * 900;
  const blur = Math.min(3, Math.max(0, (speed - 22) / 12));
  const [shx, shy] = shakeAt(t);
  const g = SA.globe;
  const inGlobe = t >= g.t0 && t < g.t1;
  const globeA = inGlobe ? 1 : 0;
  const mode = (SA.modes as [number, number, string][]).find(([a, b]) => t >= a && t < b)?.[2] as any;
  const hudShow = t < SA.hud[0] ? 0 : t > SA.hud[1] ? lerp(t, SA.hud[1], SA.hud[1] + 0.5, 1, 0) : lerp(t, SA.hud[0], SA.hud[0] + 0.6, 0, 1);
  const labelsOn = !inGlobe && t < SA.winT + 0.5;
  const dens = React.useMemo(() => Float32Array.from(SA.dens as number[]), []);
  const fl = flashAt(t);
  const WSV = SA.hud[0] + 0.3;
  const duel = duelAt(t);
  const koPunch = duel && t > duel.ko ? 1 + 0.12 * Math.max(0, 1 - (t - duel.ko) / 0.9) * Math.min(1, (t - duel.ko) / 0.08) : 1;
  // transición globo -> mapa: zoom radial
  const gz = inGlobe ? lerp(t, g.t1 - 1.6, g.t1, 1, 5.5, Easing.in(Easing.cubic)) : 1;
  const lon = lerp(t, g.t0, g.t1, g.lon0, g.lon1, Easing.linear), lat = lerp(t, g.t0, g.t1 - 1.6, g.lat0, g.lat1);
  return (
    <AbsoluteFill style={{background: '#0b1626', overflow: 'hidden'}}>
      {!inGlobe && !dbg.includes('nomap') && (
        <AbsoluteFill style={{transform: `translate(${shx}px,${shy}px) scale(${koPunch})`}}>
          <PolyCanvas cev={CEV} t={t} tm={tm} byTm={t < COLD_END} cam={cam} W={1920} H={1080} blur={blur} opts={{night: t > WSV ? (t - WSV) / 40 + 0.15 : null, focus: duel ? [duel.a] : null}} />
          <Arrows t={t} tm={tm} cam={cam} />
          {labelsOn && <Labels t={t} tm={tm} cam={cam} />}
        </AbsoluteFill>
      )}
      {inGlobe && (
        <AbsoluteFill style={{transform: `scale(${gz})`, transformOrigin: '50% 52%'}}>
          <Globe W={1920} H={1080} lon={lon} lat={lat} radius={430} cy={600} overlay={lerp(t, g.t0, g.t0 + 3, 0.0, 0.5)} />
        </AbsoluteFill>
      )}
      {mode === 'density' && (
        <div style={{position: 'absolute', bottom: 40, right: 60, zIndex: 25, background: CREAM, border: `5px solid ${INK}`, borderRadius: 18, padding: '10px 20px 12px', opacity: lerp(t, 33.8, 34.4, 0, 1) * lerp(t, 42.9, 43.4, 1, 0)}}>
          <div style={{...font, fontSize: 30, color: INK, textAlign: 'center'}}>SOLDIERS PER KM²</div>
          <div style={{width: 460, height: 26, borderRadius: 13, border: `3px solid ${INK}`, background: 'linear-gradient(90deg, hsl(230,88%,42%), hsl(170,88%,45%), hsl(115,88%,47%), hsl(60,88%,50%), hsl(0,88%,52%))', marginTop: 6}} />
          <div style={{display: 'flex', justifyContent: 'space-between', ...font, fontSize: 24, color: INK, marginTop: 4}}><span>EMPTY</span><span>PACKED</span></div>
        </div>
      )}
      {/* viñeta y etalonado */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.42) 100%)', pointerEvents: 'none', zIndex: 15}} />
      <Hud t={t} tm={tm} cam={cam} show={hudShow} />
      <Chips t={t} />
      <Race t={t} tm={tm} cam={cam} />
      <Chapter t={t} />
      <Duel t={t} />
      <Subscribe t={t} />
      <ColdText t={t} />
      <TitleOnGlobe t={t} />
      {!dbg.includes('nowin') && <Winner t={t} />}
      {fl > 0 && <AbsoluteFill style={{background: '#fff', opacity: fl * 0.85, zIndex: 60}} />}
      {audio && <Audio src={staticFile('hw/samearmy.wav')} />}
    </AbsoluteFill>
  );
};
