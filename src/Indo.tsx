// Can Indonesia Conquer the World? — vídeo largo guionizado (1920x1080)
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, staticFile, useCurrentFrame} from 'remotion';
import {FlagCanvas, makeCam, CamKey, Cam, COUNTRIES, MAINCOL, NK} from './HexWorld';
import {Globe} from './Globe';
import {PolyCanvas, PolyMini, polyState, ownerStats, CEv, CAREA, MAINPIECE, PIECES_C} from './PolyWorld';
import {Face, Mood, INK, YELLOW, RED, CREAM, font, font2, lerp, popT, fmt} from './lib3';
import J from './hw/indo.json';

const D = J as any;
export const INDO_FRAMES = Math.round(D.dur * 30);
const camF = makeCam(D.cam as CamKey[], 0.02);
const CEV = D.cev as CEv[];
const ID = D.id as number;
const NAME = (k: number) => COUNTRIES[k].n;
const UP = (k: number) => NAME(k).toUpperCase();
const COLD_END = 9.0;
const tmapAt = (t: number) => { const m = D.tmap as number[][]; let c = m[0]; for (const e of m) { if (e[0] <= t) c = e; else break; } return c[1] + (t - c[0]) * (c[2] ?? 1); };
const pst = (t: number) => polyState(CEV, t, tmapAt(t), t < COLD_END);
const kfv = (pk: number[][], t: number, i = 1) => {
  if (t <= pk[0][0]) return pk[0][i];
  for (let j = 1; j < pk.length; j++) if (t <= pk[j][0]) { const u = (t - pk[j - 1][0]) / (pk[j][0] - pk[j - 1][0]); return pk[j - 1][i] + (pk[j][i] - pk[j - 1][i]) * u; }
  return pk[pk.length - 1][i];
};
const toS = (x: number, y: number, c: Cam): [number, number] => [960 + (x - c.cx) * c.s, 540 + (y - c.cy) * c.s];
const FlagImg: React.FC<{k: number; w: number; h?: number; round?: boolean; style?: React.CSSProperties}> = ({k, w, h, round, style}) => (
  <FlagCanvas k={k} w={w} h={h ?? (round ? w : (w * 3) / 4)} style={{borderRadius: round ? '50%' : 6, border: `3px solid ${INK}`, flexShrink: 0, ...style}} />
);
const Ball: React.FC<{k: number; size: number; mood: Mood; t: number; look?: [number, number]}> = ({k, size, mood, t, look}) => (
  <div style={{position: 'relative', width: size, height: size}}>
    <FlagImg k={k} w={size} round style={{border: `${Math.max(4, size * 0.035)}px solid ${INK}`, boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}} />
    <svg width={size} height={size} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><Face x={size / 2} y={size * 0.47} r={size * 0.29} mood={mood} t={t} seed={k} look={look} /></svg>
  </div>
);
const shakeAt = (t: number) => { let x = 0, y = 0; for (const [st, a] of D.shakes as number[][]) { const d = t - st; if (d >= 0 && d < 0.6) { const m = a * (1 - d / 0.6); x += Math.sin(d * 83) * m; y += Math.cos(d * 67) * m; } } return [x, y]; };
const flashAt = (t: number) => { let a = 0; for (const st of D.flashes as number[]) { const d = t - st; if (d >= 0 && d < 0.4) a = Math.max(a, 1 - d / 0.4); } return a; };
// etalonado por escenas
const GRADES: Record<string, [string, number, string]> = {day: ['#000', 0, 'normal'], tense: ['#1a2a55', 0.22, 'multiply'], dusk: ['#ff7a30', 0.13, 'multiply'], night: ['#0b1a45', 0.34, 'multiply'], red: ['#b3121f', 0.24, 'multiply'], gold: ['#ffcc55', 0.28, 'soft-light']};
const Grade: React.FC<{t: number}> = ({t}) => {
  const g = D.grade as [number, string][]; let cur = -1;
  for (let i = 0; i < g.length; i++) if (g[i][0] <= t) cur = i;
  if (cur < 0) return null;
  const a = GRADES[g[cur][1]]; const prev = cur > 0 ? GRADES[g[cur - 1][1]] : GRADES.day;
  const k = lerp(t, g[cur][0], g[cur][0] + 1.6, 0, 1);
  return (
    <>
      {prev[1] > 0 && <AbsoluteFill style={{background: prev[0], opacity: prev[1] * (1 - k), mixBlendMode: prev[2] as any, zIndex: 14, pointerEvents: 'none'}} />}
      {a[1] > 0 && <AbsoluteFill style={{background: a[0], opacity: a[1] * k, mixBlendMode: a[2] as any, zIndex: 14, pointerEvents: 'none'}} />}
    </>
  );
};

// etiquetas con caras
const Labels: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const st = pst(t); const os = ownerStats(st.owner);
  const stl = pst(Math.max(0, t - 1.2)); const osl = ownerStats(stl.owner);
  const s2 = cam.s * cam.s;
  const best = new Int32Array(NK).fill(-1); const bestA = new Float64Array(NK);
  for (let k = 0; k < NK; k++) { if (MAINPIECE[k] < 0) continue; const o = st.owner[k]; const ar = CAREA[k] * (o === k ? 1.6 : 1); if (ar > bestA[o]) { bestA[o] = ar; best[o] = k; } }
  const cand: number[] = [];
  for (let k = 0; k < NK; k++) {
    if (!os.a[k] || best[k] < 0 || os.a[k] * s2 < 16000) continue;
    const c = PIECES_C(best[k]); const [sx, sy] = toS(c[0], c[1], cam);
    if (sx < -60 || sx > 1980 || sy < -60 || sy > 1140) continue;
    cand.push(k);
  }
  cand.sort((x, y) => (x === ID ? -1 : y === ID ? 1 : os.a[y] - os.a[x]));
  const out: React.ReactNode[] = []; const placed: [number, number, number][] = [];
  for (const k of cand) {
    if (out.length >= 12) break;
    const c = PIECES_C(best[k]); const [sx, sy] = toS(c[0], c[1], cam);
    const r = Math.max(14, Math.min(46, Math.sqrt(os.a[k] * s2) * 0.06));
    if (placed.some(([px, py, pr]) => Math.hypot(px - sx, py - sy) < (pr + r) * 1.6)) continue;
    placed.push([sx, sy, r]);
    const dn = os.a[k] - osl.a[k];
    let mood: Mood = k === ID ? 'smug' : 'calm';
    if (dn < -os.a[k] * 0.02) mood = 'scared'; else if (dn > os.a[k] * 0.02) mood = 'angry';
    const fs = Math.max(15, Math.min(30, r * 0.62));
    out.push(
      <g key={k}>
        <Face x={sx} y={sy - r * 0.2} r={r} mood={mood} t={t} seed={k * 7 + 3} />
        <g transform={`translate(${sx},${sy + r * 0.95})`}>
          <rect x={-NAME(k).length * fs * 0.3 - 10} y={-fs * 0.62} width={NAME(k).length * fs * 0.6 + 20} height={fs * 1.3} rx={fs * 0.45} fill="rgba(255,255,255,0.94)" stroke={INK} strokeWidth={3} />
          <text y={fs * 0.36} textAnchor="middle" fontSize={fs} fill={INK} style={{fontFamily: 'Lilita'}}>{UP(k)}</text>
        </g>
      </g>,
    );
  }
  return <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{out}</svg>;
};
// flotas
const Arrows: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const out: React.ReactNode[] = [];
  (D.arrows as any[]).forEach(([t0, t1, x0, y0, x1, y1, k], i) => {
    if (t < t0 - 0.1 || t > t1 + 0.8) return;
    const p = lerp(t, t0, t1, 0, 1, Easing.inOut(Easing.quad));
    const a = lerp(t, t0 - 0.1, t0 + 0.2, 0, 1) * lerp(t, t1 + 0.3, t1 + 0.8, 1, 0);
    const [ax, ay] = toS(x0, y0, cam), [bx, by] = toS(x1, y1, cam);
    const mx = (ax + bx) / 2, my = (ay + by) / 2 - Math.hypot(bx - ax, by - ay) * 0.22;
    const q = (u: number): [number, number] => [(1 - u) * (1 - u) * ax + 2 * (1 - u) * u * mx + u * u * bx, (1 - u) * (1 - u) * ay + 2 * (1 - u) * u * my + u * u * by];
    const pts: string[] = []; for (let j = 0; j <= 30; j++) { const [x, y] = q((j / 30) * p); pts.push(`${x.toFixed(1)},${y.toFixed(1)}`); }
    const col = MAINCOL[k];
    out.push(
      <g key={i} opacity={a}>
        <polyline points={pts.join(' ')} fill="none" stroke={INK} strokeWidth={12} strokeLinecap="round" />
        <polyline points={pts.join(' ')} fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" strokeDasharray="16 10" strokeDashoffset={-t * 40} />
        {p < 1 && [0, 0.06, 0.12].map((lag, si) => { const [sx, sy] = q(Math.max(0, p - lag)); return (
          <g key={si} transform={`translate(${sx},${sy})`}><circle r={si ? 16 : 21} fill={col} stroke={INK} strokeWidth={4} /><image href={staticFile('hw/icons/battleship.svg')} x={si ? -11 : -14} y={si ? -11 : -14} width={si ? 22 : 28} height={si ? 22 : 28} /></g>); })}
      </g>,
    );
  });
  return <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{out}</svg>;
};
// láser orbital
const Laser: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const out: React.ReactNode[] = [];
  for (const [t0, x, y] of D.laser as number[][]) {
    const d = t - t0; if (d < -0.4 || d > 1.2) continue;
    const [sx, sy] = toS(x, y, cam);
    const a = d < 0 ? (d + 0.4) / 0.4 * 0.5 : lerp(d, 0.7, 1.2, 1, 0);
    const w = d < 0 ? 4 : 30 + 20 * Math.sin(d * 40);
    out.push(
      <g key={t0} opacity={a}>
        <line x1={960} y1={-40} x2={sx} y2={sy} stroke="#ff2b4a" strokeWidth={w * 1.8} opacity={0.35} strokeLinecap="round" />
        <line x1={960} y1={-40} x2={sx} y2={sy} stroke="#ff6b7a" strokeWidth={w} strokeLinecap="round" />
        <line x1={960} y1={-40} x2={sx} y2={sy} stroke="#fff" strokeWidth={w * 0.3} strokeLinecap="round" />
        {d > 0 && <circle cx={sx} cy={sy} r={40 + d * 160} fill="none" stroke="#fff" strokeWidth={10 * (1 - Math.min(1, d))} />}
      </g>,
    );
  }
  if (!out.length) return null;
  return <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, zIndex: 12, overflow: 'visible'}}><defs /><g>{out}</g>
    <g transform="translate(960,70)"><circle r={46} fill="#1d2a44" stroke="#fff" strokeWidth={5} /><image href={staticFile('hw/icons/beam-satellite.svg')} x={-32} y={-32} width={64} height={64} /></g></svg>;
};

// ---------- interfaz ----------
const Pill: React.FC<{children: React.ReactNode; bg?: string; style?: React.CSSProperties}> = ({children, bg = 'rgba(14,20,32,0.9)', style}) => (
  <div style={{background: bg, border: `4px solid ${INK}`, borderRadius: 18, boxShadow: '0 5px 0 rgba(0,0,0,0.35)', ...style}}>{children}</div>
);
const Hud: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const show = lerp(t, D.war - 0.5, D.war + 0.3, 0, 1) * lerp(t, D.winT - 0.3, D.winT + 0.3, 1, 0);
  if (show <= 0.01) return null;
  const pw = kfv(D.indo, t);
  const st = pst(t);
  let n = 0; for (let k = 0; k < NK; k++) if (k !== ID && st.owner[k] === ID) n++;
  const ch = (D.chapters as any[]).filter((c) => c[0] <= t).slice(-1)[0];
  const lastF = (D.feed as number[][]).filter((f) => f[0] <= t).slice(-1)[0];
  const bump = lastF && t - lastF[0] < 0.35 ? 0.15 * (1 - (t - lastF[0]) / 0.35) : 0;
  return (
    <>
      <div style={{position: 'absolute', top: 22, left: 22 + (1 - show) * -600, zIndex: 20, display: 'flex', alignItems: 'center', gap: 14}}>
        <Ball k={ID} size={96} mood="smug" t={t} />
        <div>
          <Pill style={{padding: '4px 18px 0', display: 'flex', alignItems: 'baseline', gap: 10}}>
            <span style={{...font, fontSize: 30, color: '#ffd23f'}}>⚡ POWER</span>
            <span style={{...font, fontSize: 52, color: '#fff', minWidth: 170}}>{fmt(pw)}</span>
          </Pill>
          <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 6}}>
            <Pill bg={CREAM} style={{padding: '2px 14px 0', ...font, fontSize: 28, color: INK, transform: `scale(${1 + bump})`, transformOrigin: 'left center'}}>🌍 {n} / {D.total} CONQUERED</Pill>
          </div>
        </div>
      </div>
      {ch && <div style={{position: 'absolute', top: 22, right: 22 + (1 - show) * -600, zIndex: 20}}><Pill bg={YELLOW} style={{padding: '6px 20px 2px', ...font, fontSize: 34, color: INK}}>CH.{(D.chapters as any[]).indexOf(ch) + 1} · {ch[2]}</Pill></div>}
      <div style={{position: 'absolute', left: 22 + (1 - show) * -500, bottom: 22, zIndex: 20, border: `4px solid ${INK}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 5px 0 rgba(0,0,0,0.35)'}}>
        <PolyMini cev={CEV} t={t} tm={tmapAt(t)} byTm={t < COLD_END} cam={cam} w={290} h={150} VW={1920} VH={1080} />
      </div>
      {/* feed */}
      <div style={{position: 'absolute', top: 150, left: 22, zIndex: 20, display: 'flex', flexDirection: 'column', gap: 6, opacity: show}}>
        {(D.feed as number[][]).filter((f) => f[0] <= t && t - f[0] < 3.2).slice(-3).map((f) => {
          const k = popT(t, f[0], 14) * lerp(t, f[0] + 2.8, f[0] + 3.2, 1, 0);
          return (
            <div key={f[1]} style={{transform: `translateX(${(k - 1) * 420}px)`, opacity: k, display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(90deg, rgba(10,14,24,0.92), rgba(10,14,24,0.5))', borderLeft: `6px solid ${MAINCOL[ID]}`, borderRadius: 8, padding: '4px 14px 2px 10px'}}>
              <FlagImg k={ID} w={36} h={25} /><span style={{...font, fontSize: 26, color: '#fff'}}>INDONESIA</span>
              <Img src={staticFile('hw/icons/incoming-rocket.svg')} style={{width: 26, height: 26}} />
              <FlagImg k={f[1]} w={36} h={25} style={{filter: 'grayscale(1)'}} /><span style={{...font, fontSize: 26, color: '#ff6b5e'}}>{UP(f[1])}</span>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', right: 22, bottom: 12, ...font2, fontSize: 17, color: 'rgba(255,255,255,0.85)', textShadow: '0 2px 3px #000', zIndex: 20, opacity: show}}>Hypothetical simulation · Power points are fictional</div>
    </>
  );
};
// barra de poder del combate (tira y afloja)
const Battle: React.FC<{t: number}> = ({t}) => {
  const b = (D.battles as any[]).find((x) => t >= x.t0 - 0.05 && t < x.t1);
  if (!b) return null;
  const pa = kfv(b.pk, t, 1), pb = kfv(b.pk, t, 2);
  const frac = pa / Math.max(1, pa + pb);
  const k0 = popT(t, b.t0, 12) * lerp(t, b.t1 - 0.3, b.t1, 1, 0);
  const vs = t < b.t0 + 1.3;
  const ko = b.ko && t >= b.ko;
  return (
    <>
      {vs && (
        <AbsoluteFill style={{zIndex: 42, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 110, background: `linear-gradient(105deg, ${MAINCOL[ID]}bb 0%, rgba(0,0,0,0.55) 50%, ${MAINCOL[b.b]}bb 100%)`, opacity: lerp(t, b.t0, b.t0 + 0.15, 0, 1) * lerp(t, b.t0 + 1.0, b.t0 + 1.3, 1, 0)}}>
          <div style={{transform: `translateX(${(1 - popT(t, b.t0, 11)) * -700}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}><Ball k={ID} size={230} mood="angry" t={t} look={[0.8, 0]} /><div style={{...font, fontSize: 56, color: '#fff', textShadow: `5px 5px 0 ${INK}`}}>INDONESIA</div></div>
          <div style={{...font, fontSize: 180, color: YELLOW, WebkitTextStroke: `8px ${INK}`, paintOrder: 'stroke fill', transform: `rotate(-8deg) scale(${0.6 + 0.5 * popT(t, b.t0 + 0.1, 8)})`}}>VS</div>
          <div style={{transform: `translateX(${(1 - popT(t, b.t0, 11)) * 700}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}><Ball k={b.b} size={230} mood="angry" t={t} look={[-0.8, 0]} /><div style={{...font, fontSize: 56, color: '#fff', textShadow: `5px 5px 0 ${INK}`}}>{b.title}</div></div>
        </AbsoluteFill>
      )}
      <div style={{position: 'absolute', top: 128, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 41, transform: `translateY(${(1 - k0) * -300}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <FlagImg k={ID} w={70} round />
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', ...font, fontSize: 30, color: '#fff', textShadow: `3px 3px 0 ${INK}`}}><span>⚡ {fmt(pa)}</span><span>{b.title} ⚡ {fmt(pb)}</span></div>
            <div style={{width: 900, height: 34, border: `5px solid ${INK}`, borderRadius: 10, overflow: 'hidden', display: 'flex', boxShadow: '0 5px 0 rgba(0,0,0,0.35)'}}>
              <div style={{width: `${frac * 100}%`, background: `linear-gradient(180deg, #ff5a5a, ${MAINCOL[ID]})`}} />
              <div style={{width: 6, background: '#fff'}} />
              <div style={{flex: 1, background: `linear-gradient(180deg, ${MAINCOL[b.b]}, #222)`}} />
            </div>
          </div>
          <FlagImg k={b.b} w={70} round />
        </div>
      </div>
      {ko && (
        <div style={{position: 'absolute', inset: 0, zIndex: 43, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'}}>
          <div style={{transform: `scale(${0.3 + popT(t, b.ko, 8) * 0.9}) rotate(-6deg)`, opacity: lerp(t, b.t1 - 0.3, b.t1, 1, 0), ...font, fontSize: 170, color: RED, WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill'}}>CONQUERED!</div>
        </div>
      )}
    </>
  );
};
const Chips: React.FC<{t: number}> = ({t}) => {
  const c = (D.chips as any[]).filter(([t0, , , d]) => t >= t0 && t < t0 + d).slice(-1)[0];
  if (!c) return null;
  const [t0, text, k, d] = c;
  const a = popT(t, t0, 11) * lerp(t, t0 + d - 0.3, t0 + d, 1, 0);
  return (
    <div style={{position: 'absolute', bottom: 60, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 25}}>
      <div style={{transform: `translateY(${(1 - a) * 160}px) scale(${0.7 + 0.3 * a})`, opacity: Math.min(1, a * 1.5), display: 'flex', alignItems: 'center', gap: 16, background: CREAM, border: `5px solid ${INK}`, borderRadius: 22, padding: '10px 30px 6px 14px', boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>
        {k >= 0 && <FlagImg k={k} w={64} round />}
        <span style={{...font, fontSize: 48, color: INK}}>{text}</span>
      </div>
    </div>
  );
};
const Chapter: React.FC<{t: number}> = ({t}) => {
  const c = (D.chapters as any[]).filter(([t0]) => t >= t0 - 0.1 && t < t0 + 2.6).slice(-1)[0];
  if (!c) return null;
  const [t0, , title] = c; const n = (D.chapters as any[]).indexOf(c) + 1;
  const nc = (D.cards as any[]).find((x) => (x.kind === 'alliance' || x.kind === 'remain') && x.t0 > t0 && x.t0 < t0 + 2.6);
  const e = nc ? nc.t0 : t0 + 2.6; if (t > e) return null;
  const sl = lerp(t, t0 - 0.1, t0 + 0.35, -1, 0, Easing.out(Easing.cubic)) + lerp(t, e - 0.4, e, 0, 1, Easing.in(Easing.cubic));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 430, zIndex: 35, display: 'flex', justifyContent: 'center', pointerEvents: 'none'}}>
      <div style={{transform: `translateX(${sl * 1500}px) skewX(-10deg)`, background: YELLOW, border: `7px solid ${INK}`, padding: '8px 60px 2px', boxShadow: '0 10px 0 rgba(0,0,0,0.35)', textAlign: 'center'}}>
        <div style={{...font, fontSize: 36, color: INK, opacity: 0.7}}>CHAPTER {n}</div>
        <div style={{...font, fontSize: 96, color: INK, lineHeight: 1}}>{title}</div>
      </div>
    </div>
  );
};
const Cards: React.FC<{t: number}> = ({t}) => {
  const c = (D.cards as any[]).find((x) => t >= x.t0 && t < x.t1);
  if (!c) return null;
  const a = popT(t, c.t0, 10) * lerp(t, c.t1 - 0.3, c.t1, 1, 0);
  if (c.kind === 'intro') {
    return (
      <div style={{position: 'absolute', right: 120, top: 250, zIndex: 40, transform: `translateX(${(1 - a) * 900}px)`, display: 'flex', alignItems: 'center', gap: 26}}>
        <Ball k={ID} size={240} mood="smug" t={t} />
        <div style={{background: CREAM, border: `7px solid ${INK}`, borderRadius: 26, padding: '18px 30px 14px', boxShadow: '0 10px 0 rgba(0,0,0,0.35)'}}>
          <div style={{...font, fontSize: 84, color: RED, lineHeight: 1}}>INDONESIA</div>
          <div style={{...font2, fontSize: 34, color: INK}}>👥 280 million people</div>
          <div style={{...font2, fontSize: 34, color: INK}}>🏝️ 17,000 islands</div>
          <div style={{...font2, fontSize: 34, color: INK}}>🎯 Goal: the entire world</div>
        </div>
      </div>
    );
  }
  if (c.kind === 'stamp') {
    const dt = t - c.t0; const sc = dt < 0.18 ? 2.2 - (dt / 0.18) * 1.2 : 1;
    return (
      <div style={{position: 'absolute', inset: 0, zIndex: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'}}>
        <div style={{transform: `rotate(-5deg) scale(${sc})`, opacity: lerp(t, c.t1 - 0.3, c.t1, 1, 0), display: 'flex', alignItems: 'center', gap: 22, background: 'rgba(255,248,235,0.97)', border: `10px solid ${MAINCOL[ID]}`, borderRadius: 20, padding: '16px 44px 8px', boxShadow: '0 12px 0 rgba(0,0,0,0.35)'}}>
          <FlagImg k={c.k} w={110} round />
          <span style={{...font, fontSize: 96, color: MAINCOL[ID] === '#ffffff' ? RED : RED}}>{c.text}</span>
        </div>
      </div>
    );
  }
  // alliance / remain: fila de banderas
  return (
    <AbsoluteFill style={{zIndex: 42, background: `rgba(6,10,22,${0.55 * a})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30}}>
      <div style={{transform: `scale(${a})`, ...font, fontSize: 100, color: YELLOW, textShadow: `7px 7px 0 ${INK}`}}>{c.text}</div>
      <div style={{display: 'flex', flexDirection: 'row', gap: 26}}>
        {(c.ks as number[]).map((k, i) => (
          <div key={k} style={{transform: `scale(${popT(t, c.t0 + 0.25 + i * 0.12, 10)})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
            <Ball k={k} size={170} mood={c.kind === 'remain' ? 'scared' : 'angry'} t={t} />
            <div style={{...font, fontSize: 38, color: '#fff', textShadow: `4px 4px 0 ${INK}`}}>{UP(k)}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
// ruletas rápidas + tarjeta del ejército
const Roulettes: React.FC<{t: number}> = ({t}) => {
  const rs = D.roulettes as any[];
  if (t < rs[0].t0 - 0.2 || t > rs[rs.length - 1].t1 + 0.3) return null;
  const r = rs.find((x) => t >= x.t0 && t < x.t1 + 0.05) || rs[rs.length - 1];
  const n = r.items.length, seg = 360 / n;
  const spinEnd = r.t0 + (r.t1 - r.t0) * 0.62;
  const total = 360 * 4 + (360 - (r.pick * seg + seg / 2));
  const rot = total * lerp(t, r.t0 + 0.15, spinEnd, 0, 1, Easing.out(Easing.cubic));
  const all = lerp(t, rs[0].t0 - 0.2, rs[0].t0 + 0.3, 0, 1) * lerp(t, rs[rs.length - 1].t1 - 0.2, rs[rs.length - 1].t1 + 0.3, 1, 0);
  const R = 250; const cols = ['#e5322d', '#1f6fe0', '#22a95b', '#ffd23f', '#ff8a1f', '#7b2cbf', '#13b5c8', '#ff5fa2'];
  const done = t > spinEnd;
  const idx = rs.indexOf(r);
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 40, background: `rgba(6,10,22,${0.5 * all})`, opacity: all}}>
      <div style={{position: 'absolute', left: 140, top: 60, width: 640, textAlign: 'center', ...font, fontSize: 70, color: YELLOW, textShadow: `5px 5px 0 ${INK}`}}>{r.title}</div>
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        <g transform={`translate(460,560)`}>
          <circle r={R + 18} fill={INK} />
          <g transform={`rotate(${rot})`}>
            {r.items.map((it: string, i: number) => {
              const a0 = ((i * seg - 90) * Math.PI) / 180, a1 = (((i + 1) * seg - 90) * Math.PI) / 180, am = (a0 + a1) / 2;
              return (
                <g key={i}>
                  <path d={`M0,0 L${Math.cos(a0) * R},${Math.sin(a0) * R} A${R},${R} 0 0,1 ${Math.cos(a1) * R},${Math.sin(a1) * R} Z`} fill={cols[i % 8]} stroke={INK} strokeWidth={5} />
                  <g transform={`translate(${Math.cos(am) * R * 0.66},${Math.sin(am) * R * 0.66}) rotate(${(am * 180) / Math.PI + 90})`}>
                    <text textAnchor="middle" y={12} fontSize={34} style={{fontFamily: 'Lilita'}} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">{it}</text>
                  </g>
                </g>
              );
            })}
          </g>
          <circle r={50} fill={CREAM} stroke={INK} strokeWidth={7} />
          <path d={`M-26,${-R - 44} L26,${-R - 44} L0,${-R + 8} Z`} fill={RED} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        </g>
      </svg>
      {done && <div style={{position: 'absolute', left: 120, width: 680, bottom: 90, display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: `scale(${popT(t, spinEnd, 9)})`, background: YELLOW, border: `6px solid ${INK}`, borderRadius: 20, padding: '8px 26px 4px', ...font, fontSize: idx === 4 ? 36 : 50, color: INK, textAlign: 'center'}}>{r.result}</div>
      </div>}
      {/* tarjeta del ejército */}
      <div style={{position: 'absolute', right: 120, top: 150, width: 760, background: CREAM, border: `7px solid ${INK}`, borderRadius: 28, padding: '20px 30px', boxShadow: '0 12px 0 rgba(0,0,0,0.4)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 12}}><FlagImg k={ID} w={90} h={62} /><div style={{...font, fontSize: 56, color: INK}}>INDONESIAN ARMY</div></div>
        {(D.army as string[][]).map(([ic, txt], i) => {
          const shown = t > rs[i].t0 + (rs[i].t1 - rs[i].t0) * 0.62;
          const k = shown ? popT(t, rs[i].t0 + (rs[i].t1 - rs[i].t0) * 0.62, 12) : 0;
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: `4px solid ${INK}`, borderRadius: 14, padding: '6px 16px 2px', marginTop: 10, opacity: shown ? 1 : 0.35}}>
              <span style={{fontSize: 40}}>{ic}</span>
              <span style={{...font, fontSize: 44, color: INK, transform: `scale(${0.8 + 0.2 * k})`, transformOrigin: 'left center'}}>{shown ? txt : '...'}</span>
            </div>
          );
        })}
        <div style={{...font, fontSize: 48, color: RED, marginTop: 14, textAlign: 'center'}}>⚡ POWER: {fmt(kfv(D.indo, t))}</div>
      </div>
    </div>
  );
};
// revelación del poder especial
const Reveal: React.FC<{t: number}> = ({t}) => {
  const r = D.reveal; if (t < r.t0 || t > r.t1) return null;
  const open = r.t0 + 2.6;
  const a = lerp(t, r.t0, r.t0 + 0.3, 0, 1) * lerp(t, r.t1 - 0.4, r.t1, 1, 0);
  const shake = t < open ? Math.sin(t * 60) * lerp(t, r.t0, open, 2, 18) : 0;
  return (
    <AbsoluteFill style={{zIndex: 46, background: `rgba(0,0,0,${0.6 * a})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, opacity: a}}>
      <div style={{...font, fontSize: 64, color: '#fff', textShadow: `5px 5px 0 ${INK}`}}>{t < open ? 'TIME TO USE THE SPECIAL POWER...' : 'SPECIAL POWER UNLOCKED'}</div>
      <div style={{transform: `translateX(${shake}px) scale(${t < open ? 1 : 1 + 0.15 * Math.max(0, 1 - (t - open) / 0.4)})`, width: 860, height: 330, background: t < open ? '#2a2f3a' : 'linear-gradient(135deg,#ff2b4a,#7b0d1e)', border: `10px solid ${t < open ? '#888' : YELLOW}`, borderRadius: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30, boxShadow: t < open ? 'none' : '0 0 80px #ff2b4a'}}>
        {t < open ? <span style={{fontSize: 170}}>🔒</span> : (<>
          <div style={{width: 200, height: 200, borderRadius: '50%', background: '#1d2a44', border: `8px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Img src={staticFile(`hw/icons/${r.icon}.svg`)} style={{width: 140, height: 140}} /></div>
          <div style={{...font, fontSize: 84, color: '#fff', textShadow: `6px 6px 0 ${INK}`, lineHeight: 1, width: 520}}>{r.name}</div>
        </>)}
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
    <div style={{position: 'absolute', right: 40, bottom: 50, zIndex: 50, transform: `translateY(${(1 - k) * 260}px)`}}>
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
const ColdText: React.FC<{t: number}> = ({t}) => {
  const c = (D.cold as any[]).find(([a, b]) => t >= a && t < b);
  if (!c) return null;
  const a = popT(t, c[0], 9) * lerp(t, c[1] - 0.2, c[1], 1, 0);
  return <div style={{position: 'absolute', inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 100%)'}}>
    <div style={{transform: `scale(${0.6 + 0.4 * a}) rotate(${(1 - a) * -4}deg)`, opacity: Math.min(1, a * 1.4), ...font, fontSize: 140, color: '#fff', textShadow: `8px 8px 0 ${INK}`, textAlign: 'center', lineHeight: 1}}>{c[2]}</div></div>;
};
const Title: React.FC<{t: number}> = ({t}) => {
  const g = D.globe; if (t < g.t0 || t > g.t1) return null;
  const a = popT(t, g.t0 + 0.8, 11) * lerp(t, g.t1 - 0.9, g.t1 - 0.3, 1, 0);
  return <div style={{position: 'absolute', top: 60, left: 0, right: 0, textAlign: 'center', zIndex: 30, transform: `scale(${0.7 + 0.3 * a})`, opacity: a}}>
    <div style={{...font, fontSize: 100, color: '#fff', textShadow: `6px 6px 0 ${INK}`, lineHeight: 1}}>CAN INDONESIA</div>
    <div style={{...font, fontSize: 132, color: YELLOW, textShadow: `7px 7px 0 ${INK}`, lineHeight: 1.05}}>CONQUER THE WORLD?</div></div>;
};
const Ending: React.FC<{t: number}> = ({t}) => {
  const t0 = D.winT; if (t < t0) return null;
  const a = popT(t, t0, 10);
  return (
    <AbsoluteFill style={{zIndex: 45, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(circle, rgba(255,210,63,${0.22 * a}) 0%, rgba(0,0,0,${0.5 * a}) 75%)`}}>
      <div style={{transform: `scale(${a})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{fontSize: 120, marginBottom: -28}}>👑</div>
        <Ball k={ID} size={280} mood="happy" t={t} />
        <div style={{...font, fontSize: 104, color: YELLOW, textShadow: `8px 8px 0 ${INK}`, marginTop: 10, textAlign: 'center', lineHeight: 1}}>INDONESIA CONQUERED<br />THE WORLD</div>
        <div style={{display: 'flex', flexDirection: 'row', gap: 20, marginTop: 20, opacity: popT(t, t0 + 1.2, 12)}}>
          {[['🌍', `${D.total}/${D.total} COUNTRIES`], ['⚡', `FINAL POWER ${fmt(kfv(D.indo, t))}`], ['🛰️', 'ORBITAL LASER']].map(([i, s]) => <Pill key={s} bg={CREAM} style={{padding: '6px 20px 2px', ...font, fontSize: 36, color: INK}}>{i} {s}</Pill>)}
        </div>
        <div style={{...font, fontSize: 52, color: '#fff', textShadow: `4px 4px 0 ${INK}`, marginTop: 26, opacity: popT(t, t0 + 4, 12)}}>WHICH COUNTRY SHOULD TRY NEXT? 👇</div>
      </div>
    </AbsoluteFill>
  );
};

const ALLY = ((D.cards as any[]).find((c) => c.kind === 'alliance') || {ks: []}).ks as number[];
const MK = new Map<any, any[]>();
const markersFor = (b: any) => { if (!MK.has(b)) { const set = new Set<number>([b.b, ...(b.title === 'WESTERN ALLIANCE' ? ALLY : [])]); MK.set(b, (D.markers as any[]).filter((m) => set.has(m[1]))); } return MK.get(b)!; };
export const Indo: React.FC<{audio?: boolean}> = ({audio = true}) => {
  const f = useCurrentFrame(); const t = f / 30;
  const cam = camF(t); const cp = camF(Math.max(0, t - 1 / 30));
  const speed = Math.hypot((cam.cx - cp.cx) * cam.s, (cam.cy - cp.cy) * cam.s) + Math.abs(Math.log(cam.s / cp.s)) * 900;
  const blur = Math.min(2.5, Math.max(0, (speed - 24) / 12));
  const [shx, shy] = shakeAt(t);
  const g = D.globe; const inGlobe = t >= g.t0 && t < g.t1;
  const gz = inGlobe ? lerp(t, g.t1 - 1.4, g.t1, 1, 5.5, Easing.in(Easing.cubic)) : 1;
  const lon = lerp(t, g.t0, g.t1 - 1.4, g.lon0, g.lon1, Easing.inOut(Easing.cubic)), lat = lerp(t, g.t0, g.t1 - 1.4, g.lat0, g.lat1);
  const fl = flashAt(t);
  const b = (D.battles as any[]).find((x) => t >= x.t0 && t < x.t1);
  return (
    <AbsoluteFill style={{background: '#0b1626', overflow: 'hidden'}}>
      {!inGlobe && (
        <AbsoluteFill style={{transform: `translate(${shx}px,${shy}px)`}}>
          <PolyCanvas cev={CEV} t={t} tm={tmapAt(t)} byTm={t < COLD_END} cam={cam} W={1920} H={1080} blur={blur} opts={{markers: b ? markersFor(b) : null, focus: b ? [ID] : null, squads: !!b, capitalsOff: true, hl: b && t < b.ko ? b.b : null}} />
          <Arrows t={t} cam={cam} />
          <Laser t={t} cam={cam} />
          {t < D.winT + 0.3 && <Labels t={t} cam={cam} />}
        </AbsoluteFill>
      )}
      {inGlobe && (
        <AbsoluteFill style={{transform: `scale(${gz})`, transformOrigin: '50% 55%'}}>
          <Globe W={1920} H={1080} lon={lon} lat={lat} radius={420} cy={610} overlay={lerp(t, g.t0, g.t0 + 2.5, 0, 0.5)} highlight={(c) => (c === 'ID' ? '#e5322d' : null)} />
        </AbsoluteFill>
      )}
      <Grade t={t} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)', pointerEvents: 'none', zIndex: 15}} />
      <Hud t={t} cam={cam} />
      <Battle t={t} />
      <Chips t={t} />
      <Chapter t={t} />
      <Cards t={t} />
      <Roulettes t={t} />
      <Reveal t={t} />
      <Subscribe t={t} />
      <ColdText t={t} />
      <Title t={t} />
      <Ending t={t} />
      {fl > 0 && <AbsoluteFill style={{background: '#fff', opacity: fl * 0.75, zIndex: 60}} />}
      {audio && <Audio src={staticFile('hw/indo.wav')} />}
    </AbsoluteFill>
  );
};
