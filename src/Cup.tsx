// World War Cup: torneo de 128 países (1920x1080)
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, staticFile, useCurrentFrame} from 'remotion';
import {FlagCanvas, makeCam, CamKey, Cam, COUNTRIES, MAINCOL, NK} from './HexWorld';
import {Globe} from './Globe';
import {ShortCup, segTime} from './ShortFX';
import {PolyCanvas, PolyMini, polyState, ownerStats, CEv, CAREA, MAINPIECE, PIECES_C} from './PolyWorld';
import {Face, Mood, INK, YELLOW, RED, CREAM, font, font2, lerp, popT, fmt} from './lib3';
import J from './hw/cup.json';

const D = J as any;
export const CUP_FRAMES = Math.round(D.dur * 30);
const camF = makeCam(D.cam as CamKey[], 0.015);
const CEV = D.cev as CEv[];
const NAME = (k: number) => COUNTRIES[k].n;
const UP = (k: number) => NAME(k).toUpperCase();
const TEAMC = (k: number) => (D.team as Record<string, string>)[COUNTRIES[k].c] || MAINCOL[k];
const COLD_END = D.globe.t0;
const pst = (t: number) => polyState(CEV, t, t, false);
const kfv = (pk: number[][], t: number, i = 1) => {
  if (t <= pk[0][0]) return pk[0][i];
  for (let j = 1; j < pk.length; j++) if (t <= pk[j][0]) { const u = (t - pk[j - 1][0]) / (pk[j][0] - pk[j - 1][0]); return pk[j - 1][i] + (pk[j][i] - pk[j - 1][i]) * u; }
  return pk[pk.length - 1][i];
};
let VW = 1920, VH = 1080, SH = false;
const toS = (x: number, y: number, c: Cam): [number, number] => [VW / 2 + (x - c.cx) * c.s, VH / 2 + (y - c.cy) * c.s];
const FlagImg: React.FC<{k: number; w: number; h?: number; round?: boolean; style?: React.CSSProperties}> = ({k, w, h, round, style}) => (
  <FlagCanvas k={k} w={w} h={h ?? (round ? w : (w * 2) / 3)} style={{borderRadius: round ? '50%' : 6, border: `3px solid ${INK}`, flexShrink: 0, ...style}} />
);
const Ball: React.FC<{k: number; size: number; mood: Mood; t: number; look?: [number, number]}> = ({k, size, mood, t, look}) => (
  <div style={{position: 'relative', width: size, height: size}}>
    <FlagImg k={k} w={size} round style={{border: `${Math.max(4, size * 0.035)}px solid ${INK}`, boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}} />
    <svg width={size} height={size} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><Face x={size / 2} y={size * 0.47} r={size * 0.29} mood={mood} t={t} seed={k} look={look} /></svg>
  </div>
);
const Pill: React.FC<{children: React.ReactNode; bg?: string; style?: React.CSSProperties}> = ({children, bg = 'rgba(14,20,32,0.9)', style}) => (
  <div style={{background: bg, border: `4px solid ${INK}`, borderRadius: 16, boxShadow: '0 4px 0 rgba(0,0,0,0.35)', ...style}}>{children}</div>
);
const ghostAt = (t: number) => { const s = new Map<number, number>(); for (const [k, tg] of D.ghost as number[][]) if (tg <= t && !s.has(k)) s.set(k, tg); return s; };
const shakeAt = (t: number) => { let x = 0, y = 0; for (const [st, a] of D.shakes as number[][]) { const d = t - st; if (d >= 0 && d < 0.6) { const m = a * (1 - d / 0.6); x += Math.sin(d * 83) * m; y += Math.cos(d * 67) * m; } } return [x, y]; };
const flashAt = (t: number) => { let a = 0; for (const st of D.flashes as number[]) { const d = t - st; if (d >= 0 && d < 0.3) a = Math.max(a, 1 - d / 0.3); } return a; };
const win = (arr: any[] | undefined, t: number) => { for (const w of arr || []) { if (t >= w[0] && t <= w[1]) { const e = Math.min(1, (t - w[0]) / 0.6, (w[1] - t) / 0.6); return (w[2] ?? 1) * Math.max(0, e); } } return 0; };
const GRADES: Record<string, [string, number, string]> = {day: ['#000', 0, 'normal'], tense: ['#1a2a55', 0.2, 'multiply'], night: ['#0b1a45', 0.28, 'multiply'], red: ['#b3121f', 0.2, 'multiply'], gold: ['#ffcc55', 0.22, 'soft-light']};
const Grade: React.FC<{t: number}> = ({t}) => {
  const g = D.grade as [number, string][]; let cur = -1;
  for (let i = 0; i < g.length; i++) if (g[i][0] <= t) cur = i;
  if (cur < 0) return null;
  const a = GRADES[g[cur][1]]; const prev = cur > 0 ? GRADES[g[cur - 1][1]] : GRADES.day;
  const k = lerp(t, g[cur][0], g[cur][0] + 1.2, 0, 1);
  return (<>
    {prev[1] > 0 && <AbsoluteFill style={{background: prev[0], opacity: prev[1] * (1 - k), mixBlendMode: prev[2] as any, zIndex: 14, pointerEvents: 'none'}} />}
    {a[1] > 0 && <AbsoluteFill style={{background: a[0], opacity: a[1] * k, mixBlendMode: a[2] as any, zIndex: 14, pointerEvents: 'none'}} />}
  </>);
};
const battleAt = (t: number) => (D.battles as any[]).find((x) => t >= x.t0 && t < x.t1);
// caras + nombres (sin los eliminados)
const Labels: React.FC<{t: number; cam: Cam; gh: Map<number, number>}> = ({t, cam, gh}) => {
  const st = pst(t); const os = ownerStats(st.owner);
  const stl = pst(Math.max(0, t - 1.2)); const osl = ownerStats(stl.owner);
  const s2 = cam.s * cam.s;
  const best = new Int32Array(NK).fill(-1); const bestA = new Float64Array(NK);
  for (let k = 0; k < NK; k++) { if (MAINPIECE[k] < 0) continue; const o = st.owner[k]; const ar = CAREA[k] * (o === k ? 1.6 : 1); if (ar > bestA[o]) { bestA[o] = ar; best[o] = k; } }
  const b = battleAt(t);
  const cand: number[] = [];
  for (let k = 0; k < NK; k++) {
    if (!os.a[k] || best[k] < 0 || gh.has(k) || os.a[k] * s2 < 14000) continue;
    const c = PIECES_C(best[k]); const [sx, sy] = toS(c[0], c[1], cam);
    if (sx < -60 || sx > 1980 || sy < -60 || sy > 1140) continue;
    cand.push(k);
  }
  const pri = (k: number) => (b && (k === b.a || k === b.b) ? 1e12 : 0) + os.a[k];
  cand.sort((x, y) => pri(y) - pri(x));
  const out: React.ReactNode[] = []; const placed: [number, number, number][] = [];
  for (const k of cand) {
    if (out.length >= 10) break;
    const c = PIECES_C(best[k]); const [sx, sy] = toS(c[0], c[1], cam);
    const r = Math.max(14, Math.min(60, Math.sqrt(os.a[k] * s2) * 0.07));
    if (placed.some(([px, py, pr]) => Math.hypot(px - sx, py - sy) < (pr + r) * 1.6)) continue;
    placed.push([sx, sy, r]);
    const dn = os.a[k] - osl.a[k];
    let mood: Mood = 'calm';
    if (b && k === b.b) mood = 'scared'; if (b && k === b.a) mood = 'angry';
    if (dn < -os.a[k] * 0.02) mood = 'scared'; else if (dn > os.a[k] * 0.02) mood = 'smug';
    const fs = Math.max(15, Math.min(34, r * 0.6));
    out.push(
      <g key={k}>
        <Face x={sx} y={sy - r * 0.2} r={r} mood={mood} t={t} seed={k * 7 + 3} />
        <g transform={`translate(${sx},${sy + r * 0.95})`}>
          <rect x={-NAME(k).length * fs * 0.3 - 10} y={-fs * 0.62} width={NAME(k).length * fs * 0.6 + 20} height={fs * 1.3} rx={fs * 0.45} fill="rgba(255,255,255,0.95)" stroke={INK} strokeWidth={3} />
          <text y={fs * 0.36} textAnchor="middle" fontSize={fs} fill={INK} style={{fontFamily: 'Lilita'}}>{UP(k)}</text>
        </g>
      </g>,
    );
  }
  return <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{out}</svg>;
};
const Stamps: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const out: React.ReactNode[] = [];
  for (const [t0, k, kind] of D.stamps as [number, number, string][]) {
    const d = t - t0; const life = 2.2; if (d < 0 || d > life) continue;
    const c = PIECES_C(k); const [sx0, sy0] = toS(c[0], c[1], cam);
    const sx = Math.max(200, Math.min(1720, sx0)), sy = Math.max(160, Math.min(920, sy0));
    const a = popT(t, t0, 10) * lerp(d, life - 0.3, life, 1, 0);
    out.push(
      <div key={`${k}-${t0}`} style={{position: 'absolute', left: sx, top: sy, transform: `translate(-50%,-50%) scale(${0.4 + 0.6 * a}) rotate(-6deg)`, opacity: Math.min(1, a * 1.5), display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,248,235,0.97)', border: `7px solid ${RED}`, borderRadius: 14, padding: '8px 22px 4px 10px', boxShadow: '0 6px 0 rgba(0,0,0,0.35)', zIndex: 18, whiteSpace: 'nowrap'}}>
        <FlagImg k={k} w={64} round />
        <div style={{display: 'flex', flexDirection: 'column', lineHeight: 0.95}}>
          <span style={{...font, fontSize: 40, color: INK}}>{UP(k)}</span>
          <span style={{...font, fontSize: 30, color: RED}}>ELIMINATED</span>
        </div>
      </div>,
    );
  }
  return <>{out}</>;
};
const Bubbles: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const out: React.ReactNode[] = [];
  for (const bb of D.bubbles as any[]) {
    const [t0, k, text, dd] = bb as [number, number, string, number];
    const d = t - t0; if (d < 0 || d > dd) continue;
    const c = bb.length > 5 ? [bb[4], bb[5]] : PIECES_C(k); const [sx0, sy0] = toS(c[0], c[1], cam);
    const sx = Math.max(260, Math.min(1660, sx0)), sy = Math.max(200, Math.min(900, sy0 - 90));
    const a = popT(t, t0, 12) * lerp(d, dd - 0.25, dd, 1, 0);
    out.push(
      <div key={t0} style={{position: 'absolute', left: sx, top: sy, transform: `translate(-50%,-100%) scale(${a})`, transformOrigin: '50% 100%', zIndex: 19}}>
        <div style={{position: 'relative', background: '#fff', border: `4px solid ${INK}`, borderRadius: 18, padding: '8px 18px 4px', ...font2, fontSize: 30, color: INK, whiteSpace: 'nowrap', boxShadow: '0 5px 0 rgba(0,0,0,0.3)'}}>
          {text}
          <div style={{position: 'absolute', left: '50%', bottom: -16, width: 24, height: 24, background: '#fff', borderRight: `4px solid ${INK}`, borderBottom: `4px solid ${INK}`, transform: 'translateX(-50%) rotate(45deg)'}} />
        </div>
      </div>,
    );
  }
  return <>{out}</>;
};
const Arrows: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const out: React.ReactNode[] = [];
  (D.arrows as any[]).forEach(([t0, t1, x0, y0, x1, y1, k, kind], i) => {
    if (t < t0 - 0.1 || t > t1 + 0.6) return;
    const p = lerp(t, t0, t1, 0, 1, Easing.inOut(Easing.quad));
    const a = lerp(t, t0 - 0.1, t0 + 0.2, 0, 1) * lerp(t, t1 + 0.2, t1 + 0.6, 1, 0);
    const [ax, ay] = toS(x0, y0, cam), [bx, by] = toS(x1, y1, cam);
    const mx = (ax + bx) / 2, my = (ay + by) / 2 - Math.hypot(bx - ax, by - ay) * 0.18;
    const q = (u: number): [number, number] => [(1 - u) * (1 - u) * ax + 2 * (1 - u) * u * mx + u * u * bx, (1 - u) * (1 - u) * ay + 2 * (1 - u) * u * my + u * u * by];
    const pts: string[] = []; for (let j = 0; j <= 30; j++) { const [x, y] = q((j / 30) * p); pts.push(`${x.toFixed(1)},${y.toFixed(1)}`); }
    const col = TEAMC(k);
    const firing = kind === 'fire' && p > 0.55 && p < 1;
    out.push(
      <g key={i} opacity={a}>
        <polyline points={pts.join(' ')} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={5} strokeLinecap="round" strokeDasharray="4 12" />
        {firing && [0, 0.07, 0.14].map((lag, si) => { const [sx, sy] = q(Math.max(0, p - lag)); return Math.floor(t * 9 + si * 2) % 3 === 0 ? <g key={'f' + si}><circle cx={sx + (bx - sx) * 0.12} cy={sy + (by - sy) * 0.12 - 6} r={14} fill="#ffe36b" /><circle cx={sx + (bx - sx) * 0.12} cy={sy + (by - sy) * 0.12 - 6} r={7} fill="#fff" /></g> : null; })}
        {p < 1 && [0, 0.07, 0.14].map((lag, si) => { const [sx, sy] = q(Math.max(0, p - lag)); return (
          <g key={si} transform={`translate(${sx},${sy})`}><ellipse rx={30} ry={9} cy={14} fill="rgba(255,255,255,0.35)" /><circle r={si ? 17 : 22} fill={col} stroke={INK} strokeWidth={4} /><image href={staticFile('hw/icons/battleship.svg')} x={si ? -12 : -15} y={si ? -12 : -15} width={si ? 24 : 30} height={si ? 24 : 30} /></g>); })}
      </g>,
    );
  });
  return <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{out}</svg>;
};
// ---------- HUD del torneo ----------
const Hud: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const show = lerp(t, D.hudT - 0.3, D.hudT + 0.3, 0, 1) * lerp(t, D.winT - 0.5, D.winT, 1, 0);
  if (show <= 0.01) return null;
  const ms = D.matches as any[];
  const cur = ms.filter((m) => m.t0 - 2.3 <= t).slice(-1)[0];
  const alive = 16 - ms.filter((m) => m.ko <= t).length;
  const rn: Record<string, [string, number]> = {r16: ['ROUND OF 16', 8], qf: ['QUARTER-FINAL', 4], sf: ['SEMI-FINAL', 2], final: ['THE FINAL', 1]};
  const label = cur ? (cur.rnd === 'final' ? 'THE FINAL' : `${rn[cur.rnd][0]} · ${cur.i + 1}/${rn[cur.rnd][1]}`) : 'ROUND OF 16';
  return (
    <>
      <div style={{position: 'absolute', top: 18, left: 20 + (1 - show) * -500, zIndex: 20}}><Pill bg="#1b1f2b" style={{padding: '4px 18px 0', ...font, fontSize: 32, color: YELLOW, border: `4px solid ${YELLOW}`}}>🏆 WORLD WAR CUP</Pill></div>
      <div style={{position: 'absolute', top: 18, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20, transform: `translateY(${(1 - show) * -120}px)`}}>
        <Pill bg={CREAM} style={{padding: '4px 22px 0', ...font, fontSize: 36, color: INK}}>{label}</Pill>
      </div>
      <div style={{position: 'absolute', top: 18, right: 20 + (1 - show) * -500, zIndex: 20}}><Pill bg={RED} style={{padding: '4px 18px 0', ...font, fontSize: 32, color: '#fff'}}>{alive} LEFT</Pill></div>
      <div style={{position: 'absolute', left: 20 + (1 - show) * -500, bottom: 20, zIndex: 20, border: `4px solid ${INK}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 5px 0 rgba(0,0,0,0.35)'}}>
        <PolyMini cev={CEV} t={t} tm={t} byTm={false} cam={cam} w={260} h={135} VW={VW} VH={VH} />
      </div>
      <div style={{position: 'absolute', right: 22, bottom: 12, ...font2, fontSize: 16, color: 'rgba(255,255,255,0.85)', textShadow: '0 2px 3px #000', zIndex: 20, opacity: show}}>Hypothetical simulation · Power points are fictional</div>
    </>
  );
};
// ---------- VS + tarjeta de batalla ----------
const Battle: React.FC<{t: number}> = ({t}) => {
  const b = (D.battles as any[]).find((x) => t >= x.t0 - 0.05 && t < x.t1);
  if (!b) return null;
  const pa = kfv(b.pk, t, 1), pb = kfv(b.pk, t, 2);
  const inv = b.inv && b.inv.length ? kfv(b.inv, t) : 0;
  const k0 = popT(t, b.t0 + 1.8, 12) * lerp(t, b.t1 - 0.3, b.t1, 1, 0);
  const vs = t < b.t0 + 1.95;
  const prev = b.inv && b.inv.length ? kfv(b.inv, t - 0.6) : 0;
  const down = inv < prev - 0.5;
  const pa0 = b.pk[0][1], pb0 = b.pk[0][2];
  const pr = Math.round((100 * Math.pow(pa0, 1.25)) / (Math.pow(pa0, 1.25) + Math.pow(pb0, 1.25)));
  const fill = lerp(t, b.t0 + 0.2, b.t0 + 0.9, 50, pr);
  const ca = TEAMC(b.a), cb = TEAMC(b.b);
  return (
    <>
      {vs && (
        <AbsoluteFill style={{zIndex: 42, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 110, background: `linear-gradient(105deg, ${ca}cc 0%, rgba(0,0,0,0.6) 50%, ${cb}cc 100%)`, opacity: lerp(t, b.t0, b.t0 + 0.15, 0, 1) * lerp(t, b.t0 + 1.65, b.t0 + 1.95, 1, 0)}}>
          <div style={{transform: `translateX(${(1 - popT(t, b.t0, 11)) * -700}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}><Ball k={b.a} size={230} mood="angry" t={t} look={[0.8, 0]} /><div style={{...font, fontSize: 56, color: '#fff', textShadow: `5px 5px 0 ${INK}`}}>{UP(b.a)}</div><Pill bg={CREAM} style={{padding: '2px 18px 0', ...font, fontSize: 40, color: INK}}>⚡ {fmt(pa0)}</Pill></div>
          <div style={{...font, fontSize: 180, color: YELLOW, WebkitTextStroke: `8px ${INK}`, paintOrder: 'stroke fill', transform: `rotate(-8deg) scale(${0.6 + 0.5 * popT(t, b.t0 + 0.1, 8)})`}}>VS</div>
          <div style={{transform: `translateX(${(1 - popT(t, b.t0, 11)) * 700}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}><Ball k={b.b} size={230} mood="angry" t={t} look={[-0.8, 0]} /><div style={{...font, fontSize: 56, color: '#fff', textShadow: `5px 5px 0 ${INK}`}}>{UP(b.b)}</div><Pill bg={CREAM} style={{padding: '2px 18px 0', ...font, fontSize: 40, color: INK}}>⚡ {fmt(pb0)}</Pill></div>
          <div style={{position: 'absolute', top: 120, left: 360, right: 360}}>
            <div style={{display: 'flex', justifyContent: 'space-between', ...font, fontSize: 34, color: '#fff', textShadow: `3px 3px 0 ${INK}`}}><span>{Math.round(fill)}%</span><span>WIN CHANCE</span><span>{100 - Math.round(fill)}%</span></div>
            <div style={{height: 34, border: `5px solid ${INK}`, borderRadius: 12, overflow: 'hidden', display: 'flex', boxShadow: '0 5px 0 rgba(0,0,0,0.35)'}}><div style={{width: `${fill}%`, background: ca}} /><div style={{width: 6, background: '#fff'}} /><div style={{flex: 1, background: cb}} /></div>
          </div>
        </AbsoluteFill>
      )}
      <div style={{position: 'absolute', right: 26, top: SH ? 1250 : 250, width: 430, zIndex: 41, transform: `translateX(${(1 - k0) * 520}px)`, background: CREAM, border: `5px solid ${INK}`, borderRadius: 22, padding: '14px 22px 16px', boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}><FlagImg k={b.a} w={58} h={40} /><span style={{...font, fontSize: 26, color: INK, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden'}}>{UP(b.a)}</span><span style={{...font, fontSize: 34, whiteSpace: 'nowrap', color: ca === '#ffcc1a' ? '#c99400' : ca === '#f4f4f4' ? '#d81e2a' : ca}}>⚡ {fmt(pa)}</span></div>
        <div style={{display: 'flex', justifyContent: 'center', margin: '4px 0'}}><span style={{background: INK, color: '#fff', ...font, fontSize: 24, borderRadius: 20, padding: '1px 14px 0'}}>VS</span></div>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}><FlagImg k={b.b} w={58} h={40} /><span style={{...font, fontSize: 26, color: INK, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden'}}>{UP(b.b)}</span><span style={{...font, fontSize: 34, whiteSpace: 'nowrap', color: cb === '#ffcc1a' ? '#c99400' : cb === '#f4f4f4' ? '#d81e2a' : cb}}>⚡ {fmt(pb)}</span></div>
        <div style={{display: 'flex', justifyContent: 'space-between', ...font, fontSize: 24, color: INK, marginTop: 10}}><span>INVASION</span><span style={{color: down ? '#1f4fbf' : RED}}>{Math.round(inv)}% {down ? '▼' : ''}</span></div>
        <div style={{height: 24, border: `4px solid ${INK}`, borderRadius: 12, overflow: 'hidden', background: '#e9dfc9'}}><div style={{width: `${inv}%`, height: '100%', background: ca}} /></div>
      </div>
    </>
  );
};
// ---------- foco: oscurece todo e ilumina una unidad ----------
const Spot: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const sp = ((D as any).spot as any[] || []).find((x) => t >= x.t0 && t <= x.t1 + 0.5);
  if (!sp) return null;
  const a = Math.min(1, (t - sp.t0) / 0.35, (sp.t1 + 0.5 - t) / 0.5);
  const P = sp.pts as number[][]; let i = 0; while (i < P.length - 2 && P[i + 1][0] < t) i++;
  const u = Math.max(0, Math.min(1, (t - P[i][0]) / Math.max(0.01, P[i + 1][0] - P[i][0])));
  const x = P[i][1] + (P[i + 1][1] - P[i][1]) * u, y = P[i][2] + (P[i + 1][2] - P[i][2]) * u;
  const [sx, sy] = toS(x, y, cam); const R = sp.r * (1 + 0.04 * Math.sin(t * 6));
  const pop = popT(t, sp.t0 + 0.15, 10);
  return (
    <AbsoluteFill style={{zIndex: 16, pointerEvents: 'none', opacity: a}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at ${sx}px ${sy}px, rgba(0,0,0,0) ${R * 0.75}px, rgba(4,6,14,0.72) ${R * 1.7}px)`}} />
      <div style={{position: 'absolute', left: sx - R * 0.8, top: sy - R * 0.8, width: R * 1.6, height: R * 1.6, borderRadius: '50%', border: '4px solid rgba(255,227,107,0.9)', boxShadow: '0 0 30px 6px rgba(255,227,107,0.45)', transform: `scale(${0.6 + 0.4 * pop})`}} />
      <div style={{position: 'absolute', left: sx, top: sy - R * 0.8 - 70, transform: `translateX(-50%) scale(${pop})`, ...font, fontSize: 44, color: YELLOW, WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill', whiteSpace: 'nowrap'}}>{sp.label}</div>
    </AbsoluteFill>
  );
};
// ---------- barra de vida gigante (final) ----------
const BigHP: React.FC<{t: number}> = ({t}) => {
  const B = (D as any).bighp; if (!B || t < B.t0 || t > B.t1) return null;
  const a = popT(t, B.t0, 11) * lerp(t, B.t1 - 0.4, B.t1, 1, 0);
  const hp = Math.max(0, Math.min(1, kfv(B.hp, t))); const hp2 = Math.max(0, Math.min(1, kfv(B.hp, t - 0.45)));
  const hit = hp < kfv(B.hp, t - 0.12) - 0.004; const up = hp > kfv(B.hp, t - 0.3) + 0.004;
  const low = hp < 0.25; const blink = low && Math.floor(t * 4) % 2 === 0;
  const col = hp > 0.5 ? '#3bd16f' : hp > 0.25 ? '#ffc23a' : '#ff3b30';
  const jx = hit ? Math.sin(t * 90) * 7 : 0;
  const W = 940;
  return (
    <div style={{position: 'absolute', top: SH ? 640 : 150, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 37, opacity: a}}>
      <div style={{transform: `translate(${jx}px, ${(1 - a) * -120}px)`, width: W, background: 'rgba(10,12,20,0.9)', border: `5px solid ${blink ? '#ff3b30' : INK}`, borderRadius: 20, padding: '10px 18px 14px', boxShadow: low ? '0 0 40px 8px rgba(255,40,40,0.55)' : '0 8px 0 rgba(0,0,0,0.4)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8}}>
          <FlagImg k={B.k} w={60} h={40} />
          <span style={{...font, fontSize: 38, color: '#fff', flex: 1, whiteSpace: 'nowrap'}}>⭐ {B.name}</span>
          <span style={{...font, fontSize: 44, color: up ? '#3bd16f' : col, transform: `scale(${hit ? 1.15 : 1})`}}>{Math.round(hp * 100)}% {up ? '▲' : ''}</span>
        </div>
        <div style={{position: 'relative', height: 42, background: '#2a2a2e', border: `4px solid #fff`, borderRadius: 10, overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.max(hp, hp2) * 100}%`, background: up ? '#bfffd2' : '#fff', opacity: 0.85}} />
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${hp * 100}%`, background: col}} />
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((q) => <div key={q} style={{position: 'absolute', left: `${q * 10}%`, top: 0, bottom: 0, width: 3, background: 'rgba(0,0,0,0.35)'}} />)}
        </div>
        {B.sub && <div style={{...font, fontSize: 26, color: low ? '#ff8a8a' : '#cfd6e6', textAlign: 'center', marginTop: 6}}>{low ? '⚠ CAPITAL ABOUT TO FALL ⚠' : B.sub}</div>}
      </div>
    </div>
  );
};
const Chips: React.FC<{t: number}> = ({t}) => {
  const c = (D.chips as any[]).filter(([t0, , , d]) => t >= t0 && t < t0 + d).slice(-1)[0];
  if (!c) return null;
  const [t0, text, k, d] = c;
  const a = popT(t, t0, 11) * lerp(t, t0 + d - 0.3, t0 + d, 1, 0);
  return (
    <div style={{position: 'absolute', bottom: (SH ? 300 : 54) + 95 * win(D.letterbox, t), left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 36}}>
      <div style={{transform: `translateY(${(1 - a) * 160}px) scale(${0.7 + 0.3 * a})`, opacity: Math.min(1, a * 1.5), display: 'flex', alignItems: 'center', gap: 16, background: CREAM, border: `5px solid ${INK}`, borderRadius: 22, padding: '8px 28px 4px 12px', boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>
        {k >= 0 && <FlagImg k={k} w={58} round />}
        <span style={{...font, fontSize: 44, color: INK}}>{text}</span>
      </div>
    </div>
  );
};
const QCard: React.FC<{t: number}> = ({t}) => {
  const c = (D.qcards as any[]).find(([t0, , d]) => t >= t0 && t < t0 + d);
  if (!c) return null;
  const [t0, text, d] = c; const a = popT(t, t0, 12) * lerp(t, t0 + d - 0.3, t0 + d, 1, 0);
  const n = Math.min(text.length, Math.floor((t - t0) * 45));
  return (
    <div style={{position: 'absolute', top: SH ? 560 : 96, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 34}}>
      <div style={{transform: `scale(${0.6 + 0.4 * a})`, opacity: Math.min(1, a * 1.4), background: 'rgba(10,12,20,0.88)', border: `4px solid ${YELLOW}`, borderRadius: 16, padding: '6px 26px 2px', ...font, fontSize: 46, color: YELLOW, whiteSpace: 'nowrap'}}>{text.slice(0, n)}<span style={{opacity: 0}}>{text.slice(n)}</span></div>
    </div>
  );
};
const Chapter: React.FC<{t: number}> = ({t}) => {
  const c = (D.chapters as any[]).filter(([t0]) => t >= t0 - 0.1 && t < t0 + 1.9).slice(-1)[0];
  if (!c || t < D.hudT + 3 || (D.brk as any[]).some((x) => t >= x[0] - 0.2 && t < x[1])) return null;
  const [t0, title] = c;
  const sl = lerp(t, t0 - 0.1, t0 + 0.3, -1, 0, Easing.out(Easing.cubic)) + lerp(t, t0 + 1.5, t0 + 1.9, 0, 1, Easing.in(Easing.cubic));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 430, zIndex: 47, display: 'flex', justifyContent: 'center', pointerEvents: 'none'}}>
      <div style={{transform: `translateX(${sl * 1500}px) skewX(-10deg)`, background: YELLOW, border: `7px solid ${INK}`, padding: '8px 60px 2px', boxShadow: '0 10px 0 rgba(0,0,0,0.35)'}}>
        <div style={{...font, fontSize: 110, color: INK, lineHeight: 1}}>{title}</div>
      </div>
    </div>
  );
};
const Cards: React.FC<{t: number}> = ({t}) => {
  const c = (D.cards as any[]).find((x) => t >= x.t0 && t < x.t1);
  if (!c) return null;
  const a = popT(t, c.t0, 10) * lerp(t, c.t1 - 0.3, c.t1, 1, 0);
  if (c.kind === 'bigtext') {
    return (
      <AbsoluteFill style={{zIndex: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(ellipse at center, rgba(0,0,0,${0.55 * a}) 0%, rgba(0,0,0,0) 70%)`, pointerEvents: 'none'}}>
        <div style={{transform: `scale(${0.5 + 0.5 * a})`, opacity: Math.min(1, a * 1.4), textAlign: 'center'}}>
          <div style={{...font, fontSize: 120, color: '#fff', WebkitTextStroke: `9px ${INK}`, paintOrder: 'stroke fill', lineHeight: 1}}>{c.text}</div>
          {c.sub && <div style={{...font, fontSize: 52, color: YELLOW, WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill', marginTop: 8}}>{c.sub}</div>}
        </div>
      </AbsoluteFill>
    );
  }
  const dt = t - c.t0; const sc = dt < 0.18 ? 2.2 - (dt / 0.18) * 1.2 : 1;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'}}>
      <div style={{transform: `rotate(-5deg) scale(${sc})`, opacity: lerp(t, c.t1 - 0.3, c.t1, 1, 0), display: 'flex', alignItems: 'center', gap: 22, background: 'rgba(255,248,235,0.97)', border: `10px solid ${RED}`, borderRadius: 20, padding: '16px 44px 8px', boxShadow: '0 12px 0 rgba(0,0,0,0.35)'}}>
        <FlagImg k={c.k} w={110} round />
        <span style={{...font, fontSize: 96, color: RED}}>{c.text}</span>
      </div>
    </div>
  );
};
// ---------- lista de los 128 clasificados ----------
const QualList: React.FC<{t: number}> = ({t}) => {
  const L = D.list; if (t < L.t0 - 0.2 || t > L.t1 + 0.6) return null;
  const order = L.order as number[];
  // posición: lenta hasta el #15 y luego se dispara hasta el final
  const pos = t < L.slow ? lerp(t, L.t0 + 0.2, L.slow, 0, 10, Easing.linear) : 10 + 113 * Math.pow(Math.min(1, (t - L.slow) / (L.t1 - L.slow)), 2.3);
  const a = popT(t, L.t0, 12) * lerp(t, L.t1 + 0.2, L.t1 + 0.6, 1, 0);
  const speed = t < L.slow ? 0 : 113 * 2.3 * Math.pow(Math.min(1, (t - L.slow) / (L.t1 - L.slow)), 1.3) / (L.t1 - L.slow);
  const RH = 132; const top = Math.floor(pos);
  const rows: React.ReactNode[] = [];
  for (let i = top - 1; i <= top + 5; i++) {
    if (i < 0 || i >= 128) continue;
    const y = (i - pos) * RH;
    const k = order[i];
    rows.push(
      <div key={i} style={{position: 'absolute', left: 0, right: 0, top: y, height: RH - 16, display: 'flex', alignItems: 'center', gap: 24, background: i < 16 ? 'linear-gradient(90deg,#fff3c4,#f6eedb)' : '#f6eedb', border: `5px solid ${INK}`, borderRadius: 20, padding: '0 28px'}}>
        <span style={{...font, fontSize: 60, color: RED, width: 130}}>#{i + 1}</span>
        <FlagImg k={k} w={120} h={80} />
        <span style={{...font, fontSize: 60, color: INK, flex: 1, whiteSpace: 'nowrap'}}>{UP(k)}</span>
        <span style={{...font, fontSize: 34, color: '#1f9a3a'}}>✓ QUALIFIED</span>
      </div>,
    );
  }
  return (
    <AbsoluteFill style={{zIndex: 45, background: `rgba(6,10,22,${0.6 * a})`, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 50}}>
      <div style={{opacity: a, ...font, fontSize: 76, color: YELLOW, WebkitTextStroke: `7px ${INK}`, paintOrder: 'stroke fill'}}>THE 128 QUALIFIED NATIONS</div>
      <div style={{opacity: a, position: 'relative', width: 1100, height: RH * 5 - 16, marginTop: 24, overflow: 'hidden', filter: speed > 12 ? `blur(${Math.min(3, (speed - 12) / 12)}px)` : undefined}}>{rows}</div>
      <div style={{opacity: a, ...font, fontSize: 44, color: '#fff', marginTop: 16}}>{Math.min(128, top + 5)} / 128</div>
    </AbsoluteFill>
  );
};
// ---------- cuadrícula de eliminación ----------
const Grid: React.FC<{t: number}> = ({t}) => {
  const g = (D.grid as any[]).find((x) => t >= x.t0 - 0.1 && t < x.t1 + 0.3);
  if (!g) return null;
  const a = popT(t, g.t0, 12) * lerp(t, g.t1 - 0.2, g.t1 + 0.3, 1, 0);
  const n = g.pairs.length; const cols = 8; const rows = Math.ceil(n / cols);
  const big = n <= 32;
  const cw = 228, ch = big ? 190 : 112; const fw = big ? 96 : 84, fh = big ? 64 : 56;
  const left = (1920 - cols * cw) / 2 + 6, top0 = big ? 210 : 150;
  const gone = (g.pairs as any[]).filter((p) => p[2] <= t).length;
  return (
    <AbsoluteFill style={{zIndex: 45, background: `rgba(6,10,22,${0.78 * a})`}}>
      <div style={{position: 'absolute', top: 30, left: 0, right: 0, textAlign: 'center', opacity: a}}>
        <span style={{...font, fontSize: 70, color: YELLOW, WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill'}}>{g.title}</span>
        <span style={{...font, fontSize: 56, color: '#fff', marginLeft: 30}}>{g.frm - gone} LEFT</span>
      </div>
      {(g.pairs as any[]).map(([w, l, te], i) => {
        const cx = left + (i % cols) * cw, cy = top0 + Math.floor(i / cols) * ch;
        const done = t >= te; const pp = done ? popT(t, te, 10) : 0;
        const tile = (k: number, isL: boolean, x: number) => (
          <div style={{position: 'absolute', left: x, top: 0, width: 104, textAlign: 'center'}}>
            <div style={{position: 'relative', display: 'inline-block', transform: !isL && done ? `scale(${1 + 0.15 * Math.max(0, 1 - (t - te) / 0.4)})` : undefined}}>
              <FlagImg k={k} w={fw} h={fh} style={{border: `3px solid ${!isL && done ? YELLOW : INK}`, filter: isL && done ? 'grayscale(1) brightness(0.6)' : undefined}} />
              {isL && done && <span style={{position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-55%) scale(${0.4 + 0.6 * pp})`, ...font, fontSize: fh * 1.05, color: RED, WebkitTextStroke: `3px ${INK}`, paintOrder: 'stroke fill', lineHeight: 1}}>✕</span>}
            </div>
            <div style={{...font2, fontSize: big ? 19 : 15, color: isL && done ? '#777' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: isL && done ? 'line-through' : undefined}}>{NAME(k)}</div>
          </div>
        );
        return (
          <div key={i} style={{position: 'absolute', left: cx, top: cy, width: cw - 12, height: ch - 10, opacity: a, transform: `scale(${0.6 + 0.4 * popT(t, g.t0 + i * 0.006, 14)})`}}>
            {tile(w, false, 0)}
            <span style={{position: 'absolute', left: 104, top: fh * 0.3, width: 16, textAlign: 'center', ...font, fontSize: 18, color: '#9aa'}}>v</span>
            {tile(l, true, 116)}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
// ---------- ronda de 32: barras de choque ----------
const Duels: React.FC<{t: number}> = ({t}) => {
  const s = (D.duel as any[]).find((x) => t >= x.t0 && t < x.t1);
  if (!s) return null;
  const a = popT(t, s.t0, 12) * lerp(t, s.t1 - 0.25, s.t1, 1, 0);
  const u = Math.min(1, (t - s.t0 - 0.3) / 4.0);
  const idx = (D.duel as any[]).indexOf(s);
  return (
    <AbsoluteFill style={{zIndex: 45, background: `rgba(6,10,22,${0.72 * a})`}}>
      <div style={{position: 'absolute', top: 26, left: 0, right: 0, textAlign: 'center', ...font, fontSize: 64, color: YELLOW, WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill', opacity: a}}>ROUND OF 32 · DUELS {idx * 4 + 1}-{idx * 4 + 4} / 16</div>
      {(s.ms as any[]).map((m, j) => {
        const y = 140 + j * 228;
        const f = u <= 0 ? 0.5 : kfv(m.cur, Math.max(0, u));
        const done = u >= 0.98;
        const slide = (1 - popT(t, s.t0 + j * 0.08, 12));
        const sw = !!m.sw; const L = sw ? m.b : m.a, R = sw ? m.a : m.b; const pL = sw ? m.pb : m.pa, pR = sw ? m.pa : m.pb;
        const ca = sw ? MAINCOL[m.b] : TEAMC(m.a); const cbx = sw ? TEAMC(m.a) : MAINCOL[m.b]; const cb = cbx === ca ? '#555' : cbx;
        const BW = 860; const front = BW * (sw ? 1 - f : f);
        const lose = (left: boolean) => done && (left === sw);
        return (
          <div key={j} style={{position: 'absolute', left: 60, right: 60, top: y, height: 200, opacity: a, transform: `translateX(${slide * (j % 2 ? 1 : -1) * 1400}px)`}}>
            <div style={{position: 'absolute', left: 0, top: 30, width: 420, display: 'flex', alignItems: 'center', gap: 16, filter: lose(true) ? 'grayscale(1)' : undefined, opacity: lose(true) ? 0.6 : 1}}>
              <FlagImg k={L} w={150} h={100} style={{border: `5px solid ${done && !lose(true) ? YELLOW : INK}`}} />
              <div><div style={{...font, fontSize: 46, color: '#fff', whiteSpace: 'nowrap'}}>{UP(L)}</div><div style={{...font, fontSize: 32, color: YELLOW}}>⚡ {fmt(pL)}</div></div>
            </div>
            <div style={{position: 'absolute', left: 470, top: 60, width: BW, height: 70, border: `6px solid ${INK}`, borderRadius: 18, overflow: 'hidden', background: cb, boxShadow: '0 6px 0 rgba(0,0,0,0.4)'}}>
              <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: front, background: ca}} />
              <div style={{position: 'absolute', left: front - 10, top: -10, width: 20, bottom: -10, background: '#fff', boxShadow: '0 0 24px 10px rgba(255,240,170,0.9)', opacity: done ? 0 : 1}} />
              {!done && [0, 1, 2, 3, 4].map((q) => { const ph = (t * 3.1 + q * 0.21) % 1; return <div key={q} style={{position: 'absolute', left: front + Math.cos(q * 2.3 + t * 9) * 40 * ph, top: 35 + Math.sin(q * 1.7 + t * 11) * 34 * ph, width: 10, height: 10, borderRadius: 5, background: '#ffe36b', opacity: 1 - ph}} />; })}
            </div>
            {m.close && !done && u > 0.3 && <div style={{position: 'absolute', left: 470 + BW / 2 - 90, top: 10, ...font, fontSize: 30, color: '#ff8a8a'}}>⚠ CLOSE FIGHT</div>}
            <div style={{position: 'absolute', right: 0, top: 30, width: 420, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16, filter: lose(false) ? 'grayscale(1)' : undefined, opacity: lose(false) ? 0.6 : 1}}>
              <div style={{textAlign: 'right'}}><div style={{...font, fontSize: 46, color: '#fff', whiteSpace: 'nowrap'}}>{UP(R)}</div><div style={{...font, fontSize: 32, color: YELLOW}}>⚡ {fmt(pR)}</div></div>
              <FlagImg k={R} w={150} h={100} style={{border: `5px solid ${done && !lose(false) ? YELLOW : INK}`}} />
            </div>
            {done && <div style={{position: 'absolute', [sw ? 'left' : 'right']: 120, top: 40, transform: `rotate(-8deg) scale(${popT(t, s.t0 + 0.3 + 4.0, 9)})`, ...font, fontSize: 54, color: RED, WebkitTextStroke: `4px ${INK}`, paintOrder: 'stroke fill'}}>ELIMINATED</div>}
            {done && <div style={{position: 'absolute', [sw ? 'right' : 'left']: sw ? 420 + 20 : 470 + 20, top: 66, ...font, fontSize: 46, color: '#fff', textShadow: `3px 3px 0 ${INK}`, transform: `scale(${popT(t, s.t0 + 4.3, 9)})`, transformOrigin: sw ? 'right center' : 'left center'}}>{sw ? 'ADVANCES ✓' : '✓ ADVANCES'}</div>}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
// ---------- llave (bracket) ----------
const SLOTX = {r16: 40, qf: 300, sf: 560};
const Bracket: React.FC<{t: number}> = ({t}) => {
  const s = (D.brk as any[]).find((x) => t >= x[0] && t < x[1]);
  if (!s) return null;
  const [t0, t1, stage, idx] = s;
  const a = popT(t, t0, 12) * lerp(t, t1 - 0.25, t1, 1, 0);
  const ms = D.matches as any[]; const r16 = D.r16 as number[][];
  const known = (m: any) => m.ko <= t0 + 0.05;    // resultado conocido al empezar esta pantalla
  const justNow = (m: any) => known(m) && !(D.brk as any[]).some((x) => x[0] > m.ko && x[0] < t0);
  const res = (rnd: string, i: number) => ms.find((m) => m.rnd === rnd && m.i === i);
  // equipos por ronda/posición
  const teams: Record<string, (number | null)[]> = {r16: r16.flat(), qf: [], sf: [], f: []};
  for (let i = 0; i < 8; i++) { const m = res('r16', i); teams.qf.push(m && known(m) ? m.w : null); }
  for (let i = 0; i < 4; i++) { const m = res('qf', i); teams.sf.push(m && known(m) ? m.w : null); }
  for (let i = 0; i < 2; i++) { const m = res('sf', i); teams.f.push(m && known(m) ? m.w : null); }
  const champ = (() => { const m = res('final', 0); return m && known(m) ? m.w : null; })();
  const lost = new Set<number>(ms.filter(known).map((m) => (m.w === m.a ? m.b : m.a)));
  const BH = 54, BW = 230;
  const box = (k: number | null, x: number, y: number, key: string, hi: boolean, anim: number) => (
    <div key={key} style={{position: 'absolute', left: x, top: y - BH / 2, width: BW, height: BH, display: 'flex', alignItems: 'center', gap: 10, background: k === null ? 'rgba(255,255,255,0.12)' : lost.has(k) ? '#3a3f4a' : '#f6eedb', border: `4px solid ${hi ? YELLOW : INK}`, borderRadius: 12, padding: '0 10px', boxShadow: hi ? `0 0 ${18 + 10 * Math.sin(t * 8)}px rgba(255,210,63,0.9)` : '0 4px 0 rgba(0,0,0,0.35)', transform: `scale(${1 + 0.12 * anim})`, opacity: k === null ? 0.6 : 1}}>
      {k !== null && <><FlagImg k={k} w={54} h={36} style={{filter: lost.has(k) ? 'grayscale(1)' : undefined}} /><span style={{...font, fontSize: 24, color: lost.has(k) ? '#9aa' : INK, whiteSpace: 'nowrap', overflow: 'hidden'}}>{UP(k)}</span></>}
    </div>
  );
  const ys16 = (i: number) => 150 + i * 108;   // 8 equipos por lado
  const out: React.ReactNode[] = []; const lines: React.ReactNode[] = [];
  const isNext = (rnd: string, i: number) => stage === rnd && idx === i;
  for (let side = 0; side < 2; side++) {
    const X = (x: number) => (side === 0 ? x : 1920 - x - BW);
    for (let j = 0; j < 8; j++) { const ti = side * 8 + j; const k = teams.r16[ti]; const mi = Math.floor(ti / 2); out.push(box(k, X(SLOTX.r16), ys16(j), `r${ti}`, isNext('r16', mi), 0)); }
    for (let j = 0; j < 4; j++) {
      const qi = side * 4 + j; const y = (ys16(2 * j) + ys16(2 * j + 1)) / 2; const m = res('r16', qi);
      const an = m && justNow(m) ? Math.max(0, 1 - (t - t0 - 0.3) / 0.6) : 0;
      out.push(box(teams.qf[qi], X(SLOTX.qf), y, `q${qi}`, isNext('qf', Math.floor(qi / 2)), an));
      const xa = side === 0 ? SLOTX.r16 + BW : 1920 - SLOTX.r16 - BW, xb = side === 0 ? SLOTX.qf : 1920 - SLOTX.qf;
      const g = teams.qf[qi] !== null;
      lines.push(<path key={`lq${qi}`} d={`M${xa},${ys16(2 * j)} H${(xa + xb) / 2} V${ys16(2 * j + 1)} H${xa} M${(xa + xb) / 2},${y} H${xb}`} fill="none" stroke={g ? YELLOW : 'rgba(255,255,255,0.4)'} strokeWidth={g ? 5 : 3} />);
    }
    for (let j = 0; j < 2; j++) {
      const si = side * 2 + j; const ya = (ys16(4 * j) + ys16(4 * j + 1)) / 2, yb = (ys16(4 * j + 2) + ys16(4 * j + 3)) / 2; const y = (ya + yb) / 2; const m = res('qf', si);
      const an = m && justNow(m) ? Math.max(0, 1 - (t - t0 - 0.3) / 0.6) : 0;
      out.push(box(teams.sf[si], X(SLOTX.sf), y, `s${si}`, isNext('sf', Math.floor(si / 2)), an));
      const xa = side === 0 ? SLOTX.qf + BW : 1920 - SLOTX.qf - BW, xb = side === 0 ? SLOTX.sf : 1920 - SLOTX.sf;
      const g = teams.sf[si] !== null;
      lines.push(<path key={`ls${si}`} d={`M${xa},${ya} H${(xa + xb) / 2} V${yb} H${xa} M${(xa + xb) / 2},${y} H${xb}`} fill="none" stroke={g ? YELLOW : 'rgba(255,255,255,0.4)'} strokeWidth={g ? 5 : 3} />);
    }
    // finalista: en la columna central, uno encima del otro
    const yF = side === 0 ? 470 : 610; const m = res('sf', side);
    const an = m && justNow(m) ? Math.max(0, 1 - (t - t0 - 0.3) / 0.6) : 0;
    out.push(box(teams.f[side], 960 - BW / 2, yF, `f${side}`, stage === 'final', an));
    const ySF = (ys16(0) + ys16(3)) / 2 * 0.5 + (ys16(4) + ys16(7)) / 2 * 0.5;
    const yA = ((ys16(0) + ys16(1)) / 2 + (ys16(2) + ys16(3)) / 2) / 2, yB = ((ys16(4) + ys16(5)) / 2 + (ys16(6) + ys16(7)) / 2) / 2;
    const xa = side === 0 ? SLOTX.sf + BW : 1920 - SLOTX.sf - BW + 0;
    const xm = side === 0 ? xa + 22 : 1920 - SLOTX.sf - BW - 22;
    const xs = side === 0 ? SLOTX.sf + BW : 1920 - SLOTX.sf - BW;
    const xf = side === 0 ? 960 - BW / 2 : 960 + BW / 2;
    const g = teams.f[side] !== null;
    void ySF;
    lines.push(<path key={`lf${side}`} d={`M${xs},${yA} H${xm} V${yB} H${xs} M${xm},${(yA + yB) / 2} V${yF} H${xf}`} fill="none" stroke={g ? YELLOW : 'rgba(255,255,255,0.4)'} strokeWidth={g ? 5 : 3} />);
  }
  const title = stage === 'r16' ? 'THE BRACKET' : stage === 'qf' ? 'QUARTER-FINALS' : stage === 'sf' ? 'SEMI-FINALS' : stage === 'final' ? 'THE FINAL' : 'CHAMPION';
  const nm = idx >= 0 ? ms.find((m) => m.rnd === stage && m.i === idx) : null;
  return (
    <AbsoluteFill style={{zIndex: 46, background: `rgba(6,10,22,${0.86 * a})`, opacity: Math.min(1, a * 1.3)}}>
      <div style={{position: 'absolute', top: 30, left: 0, right: 0, textAlign: 'center', ...font, fontSize: 64, color: YELLOW, WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill'}}>🏆 {title}</div>
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>{lines}</svg>
      {out}
      <div style={{position: 'absolute', left: 960 - 34, top: 528, ...font, fontSize: 40, color: '#fff'}}>VS</div>
      <div style={{position: 'absolute', left: 960 - 110, top: champ !== null ? 690 : 170, width: 220, textAlign: 'center'}}>
        <div style={{fontSize: 120, transform: `scale(${1 + 0.05 * Math.sin(t * 3)})`}}>🏆</div>
        {champ !== null && <div style={{display: 'flex', justifyContent: 'center', transform: `scale(${popT(t, t0 + 0.3, 9)})`}}><Ball k={champ} size={150} mood="happy" t={t} /></div>}
      </div>
      {nm && <div style={{position: 'absolute', bottom: 40, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}><Pill bg={CREAM} style={{padding: '6px 26px 2px', ...font, fontSize: 44, color: INK, transform: `scale(${popT(t, t0 + 0.4, 10)})`}}>NEXT: {UP(nm.a)} VS {UP(nm.b)}</Pill></div>}
    </AbsoluteFill>
  );
};
const Cinema: React.FC<{t: number}> = ({t}) => {
  const lb = win(D.letterbox, t);
  let red = 0; for (const [st, amp] of D.shakes as number[][]) { const d = t - st; if (d >= 0 && d < 0.7 && amp >= 18) red = Math.max(red, 1 - d / 0.7); }
  return (<>
    {red > 0 && <AbsoluteFill style={{zIndex: 16, pointerEvents: 'none', background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(200,10,20,0.5) 100%)', opacity: red}} />}
    {lb > 0 && <><div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 95 * lb, background: '#000', zIndex: 33}} /><div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 95 * lb, background: '#000', zIndex: 33}} /></>}
  </>);
};
const ColdText: React.FC<{t: number}> = ({t}) => {
  const c = (D.cold as any[]).find(([a, b]) => t >= a && t < b);
  if (!c) return null;
  const a = popT(t, c[0], 9) * lerp(t, c[1] - 0.2, c[1], 1, 0);
  return <div style={{position: 'absolute', inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 100%)'}}>
    <div style={{transform: `scale(${0.6 + 0.4 * a}) rotate(${(1 - a) * -4}deg)`, opacity: Math.min(1, a * 1.4), ...font, fontSize: 150, color: '#fff', textShadow: `8px 8px 0 ${INK}`, textAlign: 'center', lineHeight: 1}}>{c[2]}</div></div>;
};
const Title: React.FC<{t: number}> = ({t}) => {
  const g = D.globe; if (t < g.t0 || t > g.t1) return null;
  const a = popT(t, g.t0 + 0.5, 11) * lerp(t, g.t1 - 0.8, g.t1 - 0.2, 1, 0);
  return <div style={{position: 'absolute', top: 40, left: 0, right: 0, textAlign: 'center', zIndex: 30, transform: `scale(${0.7 + 0.3 * a})`, opacity: a}}>
    <div style={{fontSize: 110, lineHeight: 1}}>🏆</div>
    <div style={{...font, fontSize: 150, color: YELLOW, WebkitTextStroke: `9px ${INK}`, paintOrder: 'stroke fill', lineHeight: 1}}>WORLD WAR CUP</div>
    <div style={{...font, fontSize: 54, color: '#fff', textShadow: `5px 5px 0 ${INK}`}}>128 COUNTRIES · 1 CHAMPION</div></div>;
};
const Ending: React.FC<{t: number}> = ({t}) => {
  const t0 = D.winT + 4.2; if (t < t0) return null;
  const a = popT(t, t0, 10); const ch = D.champ;
  return (
    <AbsoluteFill style={{zIndex: 47, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(circle, rgba(255,210,63,${0.2 * a}) 0%, rgba(0,0,0,${0.5 * a}) 75%)`}}>
      {Array.from({length: 22}, (_, i) => { const k = (D.top16 as number[])[i % 16]; const x = (i * 173) % 1920; const sp = 160 + (i * 53) % 140; const y = -120 + ((t - t0) * sp + i * 97) % 1300; return <div key={i} style={{position: 'absolute', left: x, top: y, transform: `rotate(${Math.sin(t * 2 + i) * 30}deg)`, opacity: 0.8}}><FlagImg k={k} w={60} h={40} /></div>; })}
      <div style={{transform: `scale(${a})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{fontSize: 130, marginBottom: -30}}>🏆</div>
        <Ball k={ch} size={270} mood="happy" t={t} />
        <div style={{...font, fontSize: 104, color: YELLOW, textShadow: `8px 8px 0 ${INK}`, marginTop: 12, textAlign: 'center', lineHeight: 1}}>{UP(ch)} WINS THE<br />WORLD WAR CUP</div>
        <div style={{display: 'flex', gap: 18, marginTop: 18, opacity: popT(t, t0 + 0.8, 12)}}>
          {[['⚔️', '4 WARS WON'], ['🌍', '128 → 1'], ['👑', 'WORLD CHAMPION']].map(([i, s]) => <Pill key={s} bg={CREAM} style={{padding: '6px 20px 2px', ...font, fontSize: 36, color: INK}}>{i} {s}</Pill>)}
        </div>
        <div style={{...font, fontSize: 54, color: '#fff', textShadow: `4px 4px 0 ${INK}`, marginTop: 24, opacity: popT(t, t0 + 2, 12)}}>WHO SHOULD HAVE WON? 👇</div>
      </div>
    </AbsoluteFill>
  );
};
const Subscribe: React.FC<{t: number}> = ({t}) => {
  const s0 = (D.subs as number[]).find((x) => t >= x && t < x + 4.2);
  if (s0 === undefined) return null;
  const dt = t - s0; const k = popT(t, s0, 12) * lerp(dt, 3.8, 4.2, 1, 0);
  const c1 = dt > 1.45, c2 = dt > 2.75;
  return (
    <div style={{position: 'absolute', right: 40, bottom: 110, zIndex: 50, transform: `translateY(${(1 - k) * 360}px)`}}>
      <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 16, background: '#fff', border: `5px solid ${INK}`, borderRadius: 60, padding: '12px 18px', boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>
        <div style={{width: 70, height: 70, borderRadius: '50%', background: '#1d56c9', border: `4px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38}}>🌍</div>
        <div style={{...font, fontSize: 32, color: INK}}>ATLAS OF WAR</div>
        <div style={{background: c1 ? '#5a5a5a' : '#e5322d', borderRadius: 40, padding: '10px 24px 6px', ...font, fontSize: 34, color: '#fff'}}>{c1 ? 'SUBSCRIBED ✓' : 'SUBSCRIBE'}</div>
        <div style={{width: 60, height: 60, borderRadius: '50%', background: c2 ? '#1d56c9' : '#ddd', border: `4px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32}}>👍</div>
        {dt > 0.3 && <div style={{position: 'absolute', left: dt < 1.8 ? lerp(dt, 0.4, 1.3, 520, 300) : lerp(dt, 1.8, 2.6, 300, 450), top: lerp(dt, 0.4, 1.3, 140, 50), fontSize: 60}}>👆</div>}
      </div>
    </div>
  );
};
const MKB = new Map<any, any[]>();
const markersFor = (b: any) => { if (!MKB.has(b)) MKB.set(b, (D.markers as any[]).filter((m) => m[1] === b.b || m[1] === b.a)); return MKB.get(b)!; };
const punch = (t: number) => { let a = 0; for (const [st, amp] of D.shakes as number[][]) { const d = t - st; if (d >= 0 && d < 0.5 && amp >= 12) a = Math.max(a, 0.03 * (1 - d / 0.5)); } return a; };

export const Cup: React.FC<{audio?: boolean; W?: number; H?: number; zf?: number; segs?: number[][]; hook?: string[]; cta?: string[]}> = ({audio = true, W = 1920, H = 1080, zf = 1, segs, hook, cta}) => {
  VW = W; VH = H; SH = H > W;
  const f = useCurrentFrame(); const lt = f / 30;
  const {t, cuts, sdur} = segTime(lt, segs);
  const cam0 = camF(t); const cp0 = camF(Math.max(0, t - 1 / 30));
  const cam = {...cam0, s: cam0.s * zf}; const cp = {...cp0, s: cp0.s * zf};
  const speed = Math.hypot((cam.cx - cp.cx) * cam.s, (cam.cy - cp.cy) * cam.s) + Math.abs(Math.log(cam.s / cp.s)) * 900;
  const blur = Math.min(2.0, Math.max(0, (speed - 40) / 14));
  const [shx, shy] = shakeAt(t);
  const g = D.globe; const inGlobe = t >= g.t0 && t < g.t1;
  const gz = inGlobe ? lerp(t, g.t1 - 1.4, g.t1, 1, 0.75, Easing.in(Easing.quad)) : 1;
  const lon = lerp(t, g.t0, g.t1, g.lon0, g.lon1, Easing.inOut(Easing.cubic)), lat = lerp(t, g.t0, g.t1, g.lat0, g.lat1);
  const gfade = lerp(t, g.t1 - 0.5, g.t1, 1, 0);
  const showMap = !inGlobe || t > g.t1 - 0.55;
  const fl = flashAt(t);
  const b = battleAt(t);
  const gh = ghostAt(t);
  const lit = b ? [b.a, b.b] : null;
  const tilt = win(D.tilt, t); const des = win(D.desat, t);
  return (
    <AbsoluteFill style={{background: '#0b1626', overflow: 'hidden'}}>
      {showMap && (
        <AbsoluteFill style={{transform: `translate(${shx}px,${shy}px) rotate(${tilt}deg) scale(${1 + punch(t) + (tilt ? 0.04 : 0)})`, filter: des ? `saturate(${1 - 0.55 * des})` : undefined}}>
          <PolyCanvas cev={CEV} t={t} tm={t} byTm={false} cam={cam} W={VW} H={VH} blur={blur} opts={{markers: b ? markersFor(b) : null, squads: false, capitalsOff: true, hl: b && t < b.ko ? b.b : null, war: D.war, empire: null, lit, waves: true, ghost: gh}} />
          <Arrows t={t} cam={cam} />
          {t < D.winT + 4 && t > COLD_END && <Labels t={t} cam={cam} gh={gh} />}
          <Stamps t={t} cam={cam} />
          <Bubbles t={t} cam={cam} />
        </AbsoluteFill>
      )}
      {inGlobe && (
        <AbsoluteFill style={{transform: `scale(${gz})`, transformOrigin: '50% 55%', opacity: gfade}}>
          <Globe W={1920} H={1080} lon={lon} lat={lat} radius={400} cy={600} overlay={lerp(t, g.t0, g.t0 + 2.5, 0, 0.45)} />
        </AbsoluteFill>
      )}
      <Grade t={t} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.42) 100%)', pointerEvents: 'none', zIndex: 15}} />
      <Spot t={t} cam={cam} />
      <Cinema t={t} />
      {!SH && <Hud t={t} cam={cam} />}
      <Battle t={t} />
      <BigHP t={t} />
      <Chips t={t} />
      <QCard t={t} />
      <Chapter t={t} />
      <Cards t={t} />
      {!SH && <><QualList t={t} />
      <Grid t={t} />
      <Duels t={t} />
      <Bracket t={t} />
      <Subscribe t={t} />
      <ColdText t={t} />
      <Title t={t} />
      <Ending t={t} /></>}
      {SH && hook && cta && <ShortCup lt={lt} dur={sdur} hook={hook} cta={cta} cuts={cuts} />}
      {fl > 0 && <AbsoluteFill style={{background: '#fff', opacity: fl * 0.18, zIndex: 60}} />}
      {audio && <Audio src={staticFile('hw/cup.wav')} />}
    </AbsoluteFill>
  );
};
