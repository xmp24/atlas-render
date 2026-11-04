// Shorts verticales con el motor de mapa real (1080x1920)
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, staticFile, useCurrentFrame} from 'remotion';
import {FlagCanvas, MapCanvas, HWD, makeCam, CamKey, Cam, worldAt, statsOf, anchorOf, COUNTRIES, CODE, MAINCOL, HR, NK} from './HexWorld';
import {Face, Mood, INK, YELLOW, RED, CREAM, font, font2, lerp, popT, fmt} from './lib3';
import LANG from './hw/sh_lang.json';
import ZOMB from './hw/sh_zombie.json';
import SUMM from './hw/sh_summary.json';
import SAJ from './hw/samearmy.json';

const W = 1080, H = 1920;
const DATA: Record<string, any> = {lang: LANG, zombie: ZOMB, summary: SUMM};
export const SHW_IDS = ['lang', 'zombie', 'summary'];
export const shwFrames = (id: string) => Math.round(DATA[id].dur * 30);
const toS = (x: number, y: number, c: Cam): [number, number] => [W / 2 + (x - c.cx) * c.s, H / 2 + (y - c.cy) * c.s];
const FlagImg: React.FC<{k: number; w: number; round?: boolean; style?: React.CSSProperties}> = ({k, w, round, style}) => (
  <FlagCanvas k={k} w={w} h={round ? w : (w * 3) / 4} style={{borderRadius: round ? '50%' : 8, border: `4px solid ${INK}`, flexShrink: 0, ...style}} />
);

type Ctx = {id: string; T: any; D: HWD; cam: (t: number) => Cam; teamIdx: Map<number, number>};
const CTX: Record<string, Ctx> = {};
const ctxOf = (id: string): Ctx => {
  if (CTX[id]) return CTX[id];
  const T = id === 'summary' ? {...SAJ, ...SUMM} : DATA[id];
  const teamIdx = new Map<number, number>();
  (T.teams || []).forEach((tm: any, i: number) => teamIdx.set(tm.rep, i));
  CTX[id] = {id, T, D: T as HWD, cam: makeCam(T.cam as CamKey[], 0.03), teamIdx};
  return CTX[id];
};
const nameOf = (c: Ctx, k: number) => {
  if (c.T.kind === 'lang') { const i = c.teamIdx.get(k); if (i !== undefined) return c.T.teams[i].name; }
  if (c.T.kind === 'zombie' && k === c.T.zombie) return 'ZOMBIES';
  return COUNTRIES[k].n.toUpperCase();
};
const colOf = (c: Ctx, k: number) => {
  if (c.T.kind === 'lang') { const i = c.teamIdx.get(k); if (i !== undefined) return c.T.teams[i].col; }
  if (c.T.kind === 'zombie' && k === c.T.zombie) return '#5fbf3a';
  return MAINCOL[k];
};
const tmapOf = (c: Ctx, t: number) => {
  const m = c.T.tmap as [number, number, number?][] | undefined;
  if (!m) return t;
  let cur = m[0];
  for (const e of m) { if (e[0] <= t) cur = e; else break; }
  return cur[1] + (t - cur[0]) * (cur[2] ?? 1);
};

// etiquetas
const Labels: React.FC<{c: Ctx; t: number; tm: number; cam: Cam; max?: number}> = ({c, t, tm, cam, max = 7}) => {
  const w = worldAt(c.D, tm); const st = statsOf(w);
  const wl = worldAt(c.D, Math.max(0, tm - 1.2), 1); const stl = statsOf(wl);
  const hexA = HR * HR * 2.6 * cam.s * cam.s;
  const cand: number[] = [];
  for (let k = 0; k < NK; k++) {
    if (st.n[k] < 2) continue;
    if (c.T.kind === 'lang' && !c.teamIdx.has(k)) continue;
    const [sx, sy] = toS(st.mx[k], st.my[k], cam);
    if (sx < -60 || sx > W + 60 || sy < 300 || sy > H - 200) continue;
    if (st.n[k] * hexA < 3200) continue;
    cand.push(k);
  }
  cand.sort((a, b) => st.n[b] - st.n[a]);
  const out: React.ReactNode[] = []; const placed: [number, number, number][] = [];
  for (const k of cand) {
    if (out.length >= max) break;
    const [ax, ay] = anchorOf(w, st, k);
    let [sx, sy] = toS(ax, ay, cam);
    sx = Math.max(90, Math.min(W - 90, sx));
    const r = Math.max(22, Math.min(62, Math.sqrt(st.n[k] * hexA) * 0.18));
    if (placed.some(([px, py, pr]) => Math.hypot(px - sx, py - sy) < (pr + r) * 1.7)) continue;
    placed.push([sx, sy, r]);
    const dn = st.n[k] - stl.n[k];
    let mood: Mood = 'angry';
    if (c.T.kind === 'zombie' && k === c.T.zombie) mood = 'angry';
    else if (dn < -Math.max(2, st.n[k] * 0.05)) mood = st.n[k] < 30 ? 'shocked' : 'scared';
    else if (dn > Math.max(3, st.n[k] * 0.04)) mood = 'smug';
    const nm = nameOf(c, k); const fs = Math.max(26, Math.min(44, r * 0.7));
    out.push(
      <g key={k}>
        <circle cx={sx} cy={sy} r={r * 1.25} fill={colOf(c, k)} stroke={INK} strokeWidth={5} />
        {c.T.kind === 'zombie' && k === c.T.zombie ? <image href={staticFile('hw/icons/shambling-zombie.svg')} x={sx - r} y={sy - r} width={r * 2} height={r * 2} /> : <Face x={sx} y={sy - r * 0.1} r={r} mood={mood} t={t} seed={k * 5 + 1} />}
        <g transform={`translate(${sx},${sy + r * 1.25 + fs * 0.75})`}>
          <rect x={-nm.length * fs * 0.3 - 12} y={-fs * 0.68} width={nm.length * fs * 0.6 + 24} height={fs * 1.36} rx={fs * 0.5} fill="#fff" stroke={INK} strokeWidth={4} />
          <text y={fs * 0.36} textAnchor="middle" fontSize={fs} fill={INK} style={{fontFamily: 'Lilita'}}>{nm}</text>
        </g>
      </g>,
    );
  }
  return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{out}</svg>;
};
const Arrows: React.FC<{c: Ctx; t: number; tm: number; cam: Cam}> = ({c, t, tm, cam}) => {
  const out: React.ReactNode[] = [];
  (c.T.arrows as any[]).forEach(([t0, t1, x0, y0, x1, y1, k], i) => {
    if (tm < t0 - 0.1 || tm > t1 + 0.8) return;
    const p = lerp(tm, t0, t1, 0, 1, Easing.inOut(Easing.quad));
    const a = lerp(tm, t0 - 0.1, t0 + 0.15, 0, 1) * lerp(tm, t1 + 0.3, t1 + 0.8, 1, 0);
    const [ax, ay] = toS(x0, y0, cam), [bx, by] = toS(x1, y1, cam);
    if (Math.max(ax, bx) < -200 || Math.min(ax, bx) > W + 200 || Math.max(ay, by) < -200 || Math.min(ay, by) > H + 200) return;
    const mx = (ax + bx) / 2, my = (ay + by) / 2 - Math.hypot(bx - ax, by - ay) * 0.25;
    const q = (u: number): [number, number] => [(1 - u) * (1 - u) * ax + 2 * (1 - u) * u * mx + u * u * bx, (1 - u) * (1 - u) * ay + 2 * (1 - u) * u * my + u * u * by];
    const pts: string[] = []; for (let j = 0; j <= 24; j++) { const [x, y] = q((j / 24) * p); pts.push(`${x.toFixed(1)},${y.toFixed(1)}`); }
    const [hx, hy] = q(p); const [px, py] = q(Math.max(0, p - 0.04));
    const ang = (Math.atan2(hy - py, hx - px) * 180) / Math.PI;
    const col = colOf(c, k);
    const icon = c.T.kind === 'zombie' ? 'jet-fighter' : 'battleship';
    out.push(
      <g key={i} opacity={a}>
        <polyline points={pts.join(' ')} fill="none" stroke={INK} strokeWidth={13} strokeLinecap="round" />
        <polyline points={pts.join(' ')} fill="none" stroke={col} strokeWidth={7} strokeLinecap="round" strokeDasharray="16 10" strokeDashoffset={-t * 40} />
        <g transform={`translate(${hx},${hy}) rotate(${ang})`}><circle r={26} fill={col} stroke={INK} strokeWidth={5} /><image href={staticFile(`hw/icons/${icon}.svg`)} x={-18} y={-18} width={36} height={36} transform="rotate(90)" /></g>
      </g>,
    );
  });
  return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{out}</svg>;
};

// HUD
const Hud: React.FC<{c: Ctx; t: number; tm: number}> = ({c, t, tm}) => {
  const T = c.T; const k0 = popT(t, T.warStart - 0.1, 12);
  const w = worldAt(c.D, tm); const st = statsOf(w);
  const total = st.n.reduce((a, b) => a + b, 0);
  let rows: {k: number; v: string}[] = [];
  let pill = '';
  if (T.kind === 'lang') {
    const alive = (T.teams as any[]).map((tm: any) => tm.rep).filter((k: number) => st.n[k] > 0);
    rows = [...alive].sort((a, b) => st.n[b] - st.n[a]).slice(0, 4).map((k) => ({k, v: `${Math.round((st.n[k] / total) * 100)}%`}));
    pill = `${alive.length} LEFT`;
  } else if (T.kind === 'zombie') {
    let humans = 0; const pop = T.pop as number[];
    const base = COUNTRIES.map((cc) => cc.cells);
    for (let k = 0; k < NK; k++) if (k !== T.zombie && st.n[k] > 0) humans += pop[k] * Math.min(1, st.n[k] / Math.max(1, base[k]));
    const zp = (st.n[T.zombie] / total) * 100;
    return (
      <div style={{position: 'absolute', top: 70, left: 30, right: 30, zIndex: 20, transform: `translateY(${(1 - k0) * -400}px)`}}>
        <div style={{background: 'rgba(10,14,20,0.92)', border: `6px solid ${INK}`, borderRadius: 26, padding: '12px 20px 8px', textAlign: 'center', boxShadow: '0 8px 0 rgba(0,0,0,0.4)'}}>
          <div style={{...font, fontSize: 40, color: '#9be37a'}}>🧍 HUMANS LEFT</div>
          <div style={{...font, fontSize: 86, color: '#fff', lineHeight: 1}}>{fmt(Math.max(0, humans))}</div>
        </div>
        <div style={{display: 'flex', gap: 12, marginTop: 12}}>
          <div style={{flex: 1, background: '#5fbf3a', border: `5px solid ${INK}`, borderRadius: 20, padding: '6px 14px 2px', ...font, fontSize: 40, color: INK, textAlign: 'center'}}>🧟 {zp.toFixed(0)}% INFECTED</div>
          <div style={{flex: 1, background: CREAM, border: `5px solid ${INK}`, borderRadius: 20, padding: '6px 14px 2px', ...font, fontSize: 40, color: INK, textAlign: 'center'}}>{(() => { const n = Array.from(st.n).filter((n, k) => n > 0 && k !== T.zombie).length; return `${n} ${n === 1 ? 'COUNTRY' : 'COUNTRIES'}`; })()}</div>
        </div>
      </div>
    );
  } else {
    const alive = NK - (T.elim as number[][]).filter((e) => e[0] <= tm).length;
    rows = Array.from({length: NK}, (_, k) => k).filter((k) => st.n[k] > 0).sort((a, b) => st.n[b] - st.n[a]).slice(0, 4).map((k) => ({k, v: `${Math.round((st.n[k] / total) * 100)}%`}));
    pill = `${alive} COUNTRIES LEFT`;
  }
  const lastE = (T.elim as number[][]).filter((e) => e[0] <= tm).slice(-1)[0];
  const bump = lastE && tm - lastE[0] < 0.4 ? 0.25 * (1 - (tm - lastE[0]) / 0.4) : 0;
  return (
    <div style={{position: 'absolute', top: 60, left: 24, right: 24, zIndex: 20, transform: `translateY(${(1 - k0) * -400}px)`}}>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
        {rows.map(({k, v}, i) => (
          <div key={k} style={{display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(12,18,30,0.92)', border: `6px solid ${colOf(c, k)}`, borderRadius: 22, padding: '6px 12px'}}>
            <div style={{...font, fontSize: 40, color: i === 0 ? YELLOW : '#fff', width: 50}}>#{i + 1}</div>
            {T.kind === 'lang' ? <div style={{width: 58, height: 58, borderRadius: '50%', background: colOf(c, k), border: `4px solid ${INK}`, flexShrink: 0}} /> : <FlagImg k={k} w={58} round />}
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{...font, fontSize: 28, color: '#fff', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{nameOf(c, k)}</div>
              <div style={{...font, fontSize: 48, color: YELLOW, lineHeight: 1}}>{v}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{display: 'flex', justifyContent: 'center', marginTop: 12}}>
        <div style={{transform: `scale(${1 + bump})`, background: RED, border: '6px solid #fff', borderRadius: 20, padding: '4px 30px 0', ...font, fontSize: 52, color: '#fff', textShadow: `3px 3px 0 ${INK}`}}>{pill}</div>
      </div>
    </div>
  );
};
const Chips: React.FC<{c: Ctx; t: number}> = ({c, t}) => {
  const ch = (c.T.chips as [number, string, number, number][]).filter(([t0, , , d]) => t >= t0 && t < t0 + d).slice(-1)[0];
  if (!ch) return null;
  const [t0, text, k, d] = ch;
  const a = popT(t, t0, 11) * lerp(t, t0 + d - 0.25, t0 + d, 1, 0);
  return (
    <div style={{position: 'absolute', bottom: 260, left: 30, right: 30, display: 'flex', justifyContent: 'center', zIndex: 25}}>
      <div style={{transform: `translateY(${(1 - a) * 200}px) scale(${0.7 + 0.3 * a})`, opacity: Math.min(1, a * 1.5), display: 'flex', alignItems: 'center', gap: 14, background: CREAM, border: `6px solid ${INK}`, borderRadius: 24, padding: '12px 26px 8px 14px', boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>
        {k >= 0 && (c.T.kind === 'zombie' && k === c.T.zombie ? <span style={{fontSize: 60}}>🧟</span> : c.T.kind === 'lang' ? <div style={{width: 64, height: 64, borderRadius: '50%', background: colOf(c, k), border: `4px solid ${INK}`}} /> : <FlagImg k={k} w={70} round />)}
        <span style={{...font, fontSize: 52, color: INK, textAlign: 'center', lineHeight: 1.05}}>{text}</span>
      </div>
    </div>
  );
};
const Stamps: React.FC<{c: Ctx; t: number}> = ({c, t}) => {
  const s = (c.T.stamps as [number, string, number][]).filter(([t0]) => t >= t0 && t < t0 + 1.5 && t0 < c.T.winT - 0.3).slice(-1)[0];
  if (!s) return null;
  const [t0, text, k] = s; const dt = t - t0;
  const sc = dt < 0.15 ? 2.3 - (dt / 0.15) * 1.3 : 1;
  const a = lerp(dt, 1.2, 1.5, 1, 0);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 820, display: 'flex', justifyContent: 'center', zIndex: 30}}>
      <div style={{transform: `rotate(-6deg) scale(${sc})`, opacity: a, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'rgba(255,248,235,0.97)', border: `10px solid ${RED}`, borderRadius: 22, padding: '14px 30px 8px', boxShadow: '0 12px 0 rgba(0,0,0,0.35)', maxWidth: 1000}}>
        {c.T.kind !== 'lang' && k >= 0 && !(c.T.kind === 'zombie' && k === c.T.zombie) && <FlagImg k={k} w={110} round style={{filter: 'grayscale(0.7)'}} />}
        <span style={{...font, fontSize: text.length > 18 ? 62 : text.length > 14 ? 72 : 84, color: RED, textAlign: 'center', lineHeight: 1}}>{text}</span>
      </div>
    </div>
  );
};

// intro rápida con temporizador
const Intro: React.FC<{c: Ctx; t: number}> = ({c, t}) => {
  const T = c.T; const ws = T.warStart;
  if (t > ws + 0.35 || T.kind === 'summary') return null;
  const out = lerp(t, ws - 0.05, ws + 0.35, 1, 0);
  const pulse = 1 + Math.sin(t * 22) * 0.025;
  const cd = Math.max(1, 3 - Math.floor((t / (ws - 0.35)) * 3));
  const ring = Math.min(1, t / (ws - 0.35));
  const go = t > ws - 0.35;
  let body: React.ReactNode = null;
  if (T.kind === 'lang') {
    body = (
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, padding: '0 36px'}}>
        {(T.teams as any[]).map((tm, i) => {
          const a = popT(t, 0.08 + i * 0.07, 11);
          return (
            <div key={i} style={{transform: `scale(${a}) rotate(${(i % 2 ? 1 : -1) * 2}deg)`, background: tm.col, border: `7px solid ${INK}`, borderRadius: 26, padding: '12px 10px 8px', textAlign: 'center', boxShadow: '0 9px 0 rgba(0,0,0,0.4)', position: 'relative'}}>
              <div style={{position: 'absolute', left: -14, top: -14, width: 54, height: 54, borderRadius: '50%', background: '#fff', border: `5px solid ${INK}`, ...font, fontSize: 36, lineHeight: '50px', color: INK}}>{i + 1}</div>
              <div style={{...font, fontSize: 60, color: '#fff', textShadow: `4px 4px 0 ${INK}`, lineHeight: 1}}>{tm.name}</div>
              <div style={{...font2, fontSize: 38, color: '#fff', textShadow: `3px 3px 0 ${INK}`}}>{tm.hi}</div>
            </div>
          );
        })}
      </div>
    );
  } else if (T.kind === 'zombie') {
    const a = popT(t, 0.1, 9);
    body = (
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
        <div style={{fontSize: 260, transform: `scale(${a}) rotate(${Math.sin(t * 9) * 8}deg)`}}>🧟</div>
        <div style={{transform: `scale(${popT(t, 0.6, 10)})`, display: 'flex', alignItems: 'center', gap: 16, background: CREAM, border: `7px solid ${INK}`, borderRadius: 26, padding: '12px 28px 6px'}}>
          <FlagImg k={COUNTRIES.findIndex((x) => x.c === 'FR')} w={90} round />
          <span style={{...font, fontSize: 64, color: INK}}>PATIENT ZERO: PARIS</span>
        </div>
      </div>
    );
  }
  return (
    <AbsoluteFill style={{zIndex: 50, opacity: out, background: `rgba(6,10,20,${T.kind === 'zombie' ? 0.45 : 0.62})`}}>
      <div style={{position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center', transform: `scale(${pulse * popT(t, 0, 9)})`}}>
        <div style={{...font, fontSize: 112, color: T.kind === 'zombie' ? '#9be37a' : YELLOW, textShadow: `7px 7px 0 ${INK}`, lineHeight: 1}}>{T.h1}</div>
        <div style={{...font, fontSize: 64, color: '#fff', textShadow: `5px 5px 0 ${INK}`, marginTop: 8}}>{T.h2}</div>
      </div>
      <div style={{position: 'absolute', top: 470, left: 0, right: 0}}>{body}</div>
      <div style={{position: 'absolute', bottom: 210, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        {!go ? (
          <svg width={230} height={230} viewBox="-115 -115 230 230">
            <circle r={100} fill="#fff" stroke={INK} strokeWidth={12} />
            <circle r={84} fill="none" stroke={RED} strokeWidth={22} strokeDasharray={`${2 * Math.PI * 84 * (1 - ring)} 999`} transform="rotate(-90)" />
            <text y={40} textAnchor="middle" fontSize={120} style={{fontFamily: 'Lilita'}} fill={INK}>{cd}</text>
          </svg>
        ) : (
          <div style={{transform: `scale(${popT(t, ws - 0.35, 8) * 1.2})`, ...font, fontSize: 170, color: RED, textShadow: `8px 8px 0 ${INK}`, WebkitTextStroke: '4px #fff'}}>{T.kind === 'zombie' ? 'RUN!' : 'WAR!'}</div>
        )}
      </div>
    </AbsoluteFill>
  );
};
const Winner: React.FC<{c: Ctx; t: number}> = ({c, t}) => {
  const T = c.T; const t0 = T.winT;
  if (t < t0) return null;
  const a = popT(t, t0, 9);
  const col = T.kind === 'lang' ? colOf(c, T.winner) : T.kind === 'zombie' ? '#5fbf3a' : MAINCOL[T.winner];
  return (
    <AbsoluteFill style={{zIndex: 45, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(circle, rgba(255,210,63,${0.3 * a}) 0%, rgba(0,0,0,${0.55 * a}) 70%)`}}>
      <div style={{transform: `scale(${a})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{fontSize: 150, marginBottom: -30}}>{T.kind === 'zombie' ? '🧟' : '👑'}</div>
        <svg width={360} height={360} viewBox="-180 -180 360 360"><circle r={170} fill={col} stroke={INK} strokeWidth={14} />{T.kind !== 'zombie' && <Face x={0} y={-8} r={100} mood="happy" t={t} seed={4} />}{T.kind === 'zombie' && <image href={staticFile('hw/icons/shambling-zombie.svg')} x={-120} y={-120} width={240} height={240} />}</svg>
        <div style={{...font, fontSize: 124, color: YELLOW, textShadow: `8px 8px 0 ${INK}`, textAlign: 'center', lineHeight: 1, marginTop: 10}}>{T.winText}</div>
        <div style={{...font, fontSize: 60, color: '#fff', textShadow: `5px 5px 0 ${INK}`, marginTop: 10}}>{T.winSub}</div>
      </div>
    </AbsoluteFill>
  );
};
// resumen: cartel final "WHO WINS? FULL VIDEO"
const Cliff: React.FC<{c: Ctx; t: number}> = ({c, t}) => {
  const T = c.T; if (T.kind !== 'summary' || t < T.cliffT) return null;
  const a = popT(t, T.cliffT, 9);
  return (
    <AbsoluteFill style={{zIndex: 46, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `rgba(0,0,0,${0.55 * a})`}}>
      <div style={{transform: `scale(${a})`, textAlign: 'center'}}>
        <div style={{...font, fontSize: 120, color: YELLOW, textShadow: `8px 8px 0 ${INK}`, lineHeight: 1}}>WHO CONQUERS<br />THE WORLD?</div>
        <div style={{display: 'flex', gap: 30, justifyContent: 'center', margin: '30px 0'}}>
          {(T.finalists as number[]).map((k, i) => (
            <div key={k} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
              <FlagImg k={k} w={(T.finalists as number[]).length > 3 ? 196 : 220} round />
              <div style={{...font, fontSize: 40, color: '#fff', textShadow: `4px 4px 0 ${INK}`}}>{COUNTRIES[k].n.toUpperCase()}</div>
            </div>
          ))}
        </div>
        <div style={{transform: `scale(${1 + Math.sin(t * 8) * 0.04})`, display: 'inline-block', background: RED, border: '7px solid #fff', borderRadius: 26, padding: '14px 40px 6px', ...font, fontSize: 76, color: '#fff'}}>▶ FULL VIDEO ON THE CHANNEL</div>
      </div>
    </AbsoluteFill>
  );
};
const ColdTxt: React.FC<{c: Ctx; t: number}> = ({c, t}) => {
  const ct = (c.T.coldS || []) as [number, number, string][];
  const e = ct.filter(([a, b]) => t >= a && t < b).slice(-1)[0];
  if (!e) return null;
  const a = popT(t, e[0], 9) * lerp(t, e[1] - 0.2, e[1], 1, 0);
  return (
    <div style={{position: 'absolute', top: 360, left: 40, right: 40, zIndex: 40, textAlign: 'center', transform: `scale(${0.6 + 0.4 * a})`, opacity: Math.min(1, a * 1.4), ...font, fontSize: 110, color: '#fff', textShadow: `8px 8px 0 ${INK}`, lineHeight: 1.02}}>{e[2]}</div>
  );
};

const Inner: React.FC<{id: string; t: number}> = ({id, t}) => {
  const c = ctxOf(id); const T = c.T;
  const tm = tmapOf(c, t);
  const cam = c.cam(t); const cp = c.cam(Math.max(0, t - 1 / 30));
  const speed = Math.hypot((cam.cx - cp.cx) * cam.s, (cam.cy - cp.cy) * cam.s) + Math.abs(Math.log(cam.s / cp.s)) * 900;
  const blur = Math.min(3, Math.max(0, (speed - 22) / 12));
  const lastS = (T.stamps as [number][]).filter(([s]) => t >= s && t - s < 0.4).slice(-1)[0];
  const sh = lastS ? (1 - (t - lastS[0]) / 0.4) * 14 : 0;
  const opts: any = {units: tm > T.warStart, puffs: tm > T.warStart};
  if (T.kind === 'lang') { opts.mode = 'team'; opts.teamOf = (k: number) => c.teamIdx.get(k) ?? -1; opts.teamCols = T.teams.map((x: any) => x.col); }
  if (T.kind === 'zombie') { opts.special = {k: T.zombie, col: '#5fbf3a'}; opts.zombie = T.zombie; }
  return (
    <AbsoluteFill style={{background: '#0b1626', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${Math.sin(t * 80) * sh}px,${Math.cos(t * 70) * sh}px)`}}>
        <MapCanvas d={c.D} t={tm} cam={cam} W={W} H={H} blur={blur} opts={opts} />
        <Arrows c={c} t={t} tm={tm} cam={cam} />
        {t > T.warStart - 0.2 && t < T.winT && <Labels c={c} t={t} tm={tm} cam={cam} />}
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)', zIndex: 15}} />
      {t < T.winT && <Hud c={c} t={t} tm={tm} />}
      <Chips c={c} t={t} />
      <Stamps c={c} t={t} />
      <ColdTxt c={c} t={t} />
      <Intro c={c} t={t} />
      <Winner c={c} t={t} />
      <Cliff c={c} t={t} />
      {(() => { const fl = ((c.T.flashes || []) as number[]).map((f) => (t >= f && t < f + 0.3 ? 1 - (t - f) / 0.3 : 0)).reduce((a, b) => Math.max(a, b), 0); return fl > 0 ? <AbsoluteFill style={{background: '#fff', opacity: fl * 0.8, zIndex: 60}} /> : null; })()}
    </AbsoluteFill>
  );
};
export const ShortHW: React.FC<{id: string; audio?: boolean}> = ({id, audio = true}) => {
  const f = useCurrentFrame(); const t = f / 30;
  const c = ctxOf(id); const dur = c.T.dur;
  const loop = lerp(t, dur - 0.4, dur, 0, 1);
  return (
    <AbsoluteFill>
      <Inner id={id} t={t} />
      {loop > 0.001 && <AbsoluteFill style={{opacity: loop}}><Inner id={id} t={0} /></AbsoluteFill>}
      {audio && <Audio src={staticFile(`hw/sh-${id}.wav`)} />}
    </AbsoluteFill>
  );
};
