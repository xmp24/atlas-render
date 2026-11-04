import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import ARC from './arctic.json';
import AFL from './arcflags.json';
import TL from './gl-tl.json';
import RASTER from './wflags-raster.json';
import {P, Cam, INK, CREAM, RED, BLUE, GREEN, YELLOW, ORANGE, clamp, lerp, fmt, font, font2, popT, piece, arcPath, partial, Mover, Boom, Face, Mood, Bubble, Avatar, TankToken} from './lib3';
import {WFlag, usePreload} from './War6';

// ================= datos =================
type Ctry = {code: string; name: string; d: string; bbox: number[]; c: P; area: number};
const C = (ARC as any).countries as Ctry[];
const PLACES = (ARC as any).places as Record<string, P>;
const FL = AFL as unknown as Record<string, {vb: number[]; body: string}>;
const RS = RASTER as Record<string, string>;
const T = TL as any;
const GL = C.find((c) => c.code === 'GL')!;
export const DUR = T.duration as number;
const SIDE: Record<string, string> = {US: '#2f5bd3', DK: '#c8102e', FR: '#1d56c9', GB: '#1d3f8a', DE: '#444', NO: '#ba0c2f', CA: '#d52b1e', IS: '#02529c', RU: '#b0261d', CN: '#de2910', GL: '#d00c33', EU: '#1d56c9', RED: '#d42a24'};
const FLAGC: Record<string, string> = {US: 'us', DK: 'dk', FR: 'fr', GB: 'gb', DE: 'de', NO: 'no', CA: 'ca', IS: 'is', RU: 'ru', CN: 'cn', GL: 'gl', EU: 'eu'};
const NAMES: Record<string, string> = {US: 'USA', DK: 'DENMARK', GL: 'GREENLAND', CA: 'CANADA', FR: 'FRANCE', GB: 'UK', DE: 'GERMANY', NO: 'NORWAY', IS: 'ICELAND', RU: 'RUSSIA', SE: 'SWEDEN', FI: 'FINLAND', NL: 'NETHERLANDS', BE: 'BELGIUM', ES: 'SPAIN', IT: 'ITALY', PL: 'POLAND'};
const FACES = T.faces as Record<string, P>;

// ================= tiempo / cámara =================
const CAMK = T.cam as [number, number, number, number][];
const SHAKE: [number, number][] = [...(T.booms as number[][]).map((b) => [b[0], 2.0] as [number, number]), ...(T.stamps as any[]).map((s) => [s.t, 5] as [number, number])];
export const camera = (t: number): Cam => {
  let i = 0;
  while (i < CAMK.length - 1 && t >= CAMK[i + 1][0]) i++;
  const [ta, xb, yb, sb] = CAMK[i];
  const [, xa, ya, sa] = CAMK[Math.max(0, i - 1)];
  const k = i === 0 ? 1 : lerp(t, ta, ta + 1.0, 0, 1, Easing.inOut(Easing.cubic));
  let cx = xa + (xb - xa) * k, cy = ya + (yb - ya) * k;
  const tn = i < CAMK.length - 1 ? CAMK[i + 1][0] : ta + 10;
  const drift = 1 + 0.06 * lerp(t, ta + 1.0, tn, 0, 1, Easing.linear);
  let s = sa * Math.pow(sb / sa, k) * drift;
  cx += Math.sin(t * 0.35) * 6 / s;
  for (const [h, amp] of SHAKE) { const d = t - h; if (d >= 0 && d < 0.3) { const a = ((1 - d / 0.3) * amp) / s; cx += Math.sin(d * 93) * a; cy += Math.cos(d * 69) * a; } }
  return {cx, cy, s};
};
const DAYS: [number, number][] = [[34.6, 1], [100, 1], [146, 2], [160, 3], [279, 14], [281, 15], [394, 30], [410, 40], [444, 60], [472, 74]];
export const dayAt = (t: number) => Math.max(1, Math.round(piece(t, DAYS)));
const series = (arr: [number, number][], t: number) => piece(t, arr);

// ================= banderas =================
const FlagFill: React.FC<{code: string; b: number[]}> = ({code, b}) => {
  const w = Math.max(1, b[2] - b[0]), h = Math.max(1, b[3] - b[1]);
  if (RS[code]) return <image href={RS[code]} x={b[0]} y={b[1]} width={w} height={h} preserveAspectRatio="none" />;
  const f = FL[code];
  if (!f) return <rect x={b[0]} y={b[1]} width={w} height={h} fill="#efe3c8" />;
  const [vx, vy, vw, vh] = f.vb;
  return <g transform={`translate(${b[0]},${b[1]}) scale(${w / vw},${h / vh}) translate(${-vx},${-vy})`} dangerouslySetInnerHTML={{__html: f.body}} />;
};
const fitBox = (c: Ctry) => {
  if (c.code === 'US') return [-120, 640, 560, 1180];
  if (c.code === 'CA') return [-60, -40, 900, 760];
  if (c.code === 'RU') return [900, -700, 2200, 380];
  if (c.code === 'FR') return [1500, 660, 1800, 880];
  if (c.code === 'NL') return [1565, 560, 1615, 625];
  if (c.code === 'DK') return [1560, 430, 1650, 510];
  if (c.code === 'NO') return [1300, 120, 1560, 470];
  let [x0, y0, x1, y1] = c.bbox; const w = x1 - x0, h = y1 - y0;
  if (h > w * 1.25) { const nw = h * 1.1; x0 -= (nw - w) / 2; x1 += (nw - w) / 2; }
  return [x0, y0, x1, y1];
};

// ================= mapa =================
export type LVP = {W: number; H: number; ox: number; oy: number; ui: number};
export const LV0: LVP = {W: 1920, H: 1080, ox: 960, oy: 540, ui: 1};
const CAPS = T.caps as [number, string, number, string][];
const ICE: P[][] = [[[500, -250], [1300, -280], [1650, -60], [1300, 40], [1080, -10], [860, 10], [640, -60]], [[1110, 60], [1180, 110], [1150, 190], [1105, 160]], [[700, 40], [770, 90], [740, 150], [690, 110]]];
const towns = ['Nuuk', 'Kangerlussuaq', 'Sisimiut', 'Maniitsoq', 'Ilulissat', 'Aasiaat', 'Qaqortoq', 'Narsarsuaq', 'Paamiut', 'Tasiilaq', 'Ittoqqortoormiit', 'Upernavik', 'Qaanaaq'];
export const ArcticMap: React.FC<{t: number; cam: Cam; vp?: LVP}> = ({t, cam, vp = LV0}) => {
  const {cx, cy, s} = cam;
  const vx0 = cx - vp.ox / s - 20, vx1 = cx + (vp.W - vp.ox) / s + 20, vy0 = cy - vp.oy / s - 20, vy1 = cy + (vp.H - vp.oy) / s + 20;
  const vis = (b: number[]) => b[2] > vx0 && b[0] < vx1 && b[3] > vy0 && b[1] < vy1;
  const inv = vp.ui / s;
  const cs = C.filter((c) => vis(c.bbox));
  const indep = T.indep as number;
  const occA = t > indep ? lerp(t, indep, indep + 1.6, 1, 0) : 1;
  const fill = T.glfill as number[];
  const fk = lerp(t, fill[0], fill[1], 0, 1);
  const bo = T.blackout as number[];
  return (
    <svg width={vp.W} height={vp.H} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        {cs.map((c) => <clipPath key={c.code} id={`ac-${c.code}`}><path d={c.d} /></clipPath>)}
        <pattern id="htUS" patternUnits="userSpaceOnUse" width={5} height={5} patternTransform={`rotate(45) scale(${Math.max(0.4, 1.4 / s)})`}><rect width={1.8} height={5} fill="#0f2a6e" /></pattern>
        <mask id="occm" maskUnits="userSpaceOnUse" x={GL.bbox[0] - 30} y={GL.bbox[1] - 30} width={GL.bbox[2] - GL.bbox[0] + 60} height={GL.bbox[3] - GL.bbox[1] + 60}>
          {CAPS.map(([tc, pl, r], i) => { const k = lerp(t, tc - 0.8, tc + 0.6, 0, 1, Easing.out(Easing.cubic)); const p = PLACES[pl]; return k > 0 ? <circle key={i} cx={p[0]} cy={p[1]} r={r * k} fill="white" /> : null; })}
          {fk > 0 && <circle cx={935} cy={320} r={420 * fk} fill="white" />}
        </mask>
      </defs>
      <g transform={`translate(${vp.ox},${vp.oy}) scale(${s}) translate(${-cx},${-cy})`}>
        {ICE.map((pts, i) => <path key={i} d={'M' + pts.map((p) => `${p[0] + Math.sin(t * 0.4 + i + p[1]) * 4},${p[1]}`).join('L') + 'Z'} fill="rgba(240,248,255,0.55)" stroke="rgba(255,255,255,0.8)" strokeWidth={2 * inv} />)}
        <g transform="translate(2,3)" opacity={0.3}>{cs.map((c) => <path key={c.code} d={c.d} fill="#06213f" />)}</g>
        {cs.map((c) => <g key={c.code} clipPath={`url(#ac-${c.code})`}><FlagFill code={c.code} b={fitBox(c)} /></g>)}
        {occA > 0 && <g mask="url(#occm)" opacity={occA}><g clipPath="url(#ac-GL)"><rect x={GL.bbox[0]} y={GL.bbox[1]} width={GL.bbox[2] - GL.bbox[0]} height={GL.bbox[3] - GL.bbox[1]} fill="#2f5bd3" opacity={0.82} /><rect x={GL.bbox[0]} y={GL.bbox[1]} width={GL.bbox[2] - GL.bbox[0]} height={GL.bbox[3] - GL.bbox[1]} fill="url(#htUS)" /></g></g>}
        {t > indep && t < indep + 4 && <path d={GL.d} fill="none" stroke={GREEN} strokeWidth={8 * inv} opacity={lerp(t, indep + 2.5, indep + 4, 1, 0)} />}
        {t > bo[0] - 0.5 && t < bo[1] + 2 && <g clipPath="url(#ac-GL)"><rect x={GL.bbox[0]} y={GL.bbox[1]} width={GL.bbox[2] - GL.bbox[0]} height={GL.bbox[3] - GL.bbox[1]} fill="#050a18" opacity={0.55 * lerp(t, bo[0], bo[0] + 1, 0, 1) * lerp(t, bo[1], bo[1] + 2, 1, 0)} /></g>}
        <path d={(ARC as any).borders} fill="none" stroke="#3d4450" strokeWidth={0.9 * inv} />
        <path d={(ARC as any).coast} fill="none" stroke={INK} strokeWidth={1.7 * inv} />
        {s > 1.3 && towns.map((n, i) => {
          const p = PLACES[n]; const cp = CAPS.find((c) => c[1] === n);
          const capd = cp && t >= cp[0] && t < indep;
          const lightsOff = t > bo[0] + i * 0.35 && t < bo[1] + 1.5;
          return <g key={n} transform={`translate(${p[0]},${p[1]}) scale(${inv})`}><circle r={lightsOff ? 5 : 6} fill={lightsOff ? '#333' : capd ? '#2f5bd3' : YELLOW} stroke={INK} strokeWidth={2.5} />{!lightsOff && <circle r={11} fill="rgba(255,220,100,0.25)" />}</g>;
        })}
        <Units t={t} s={s} inv={inv} vis={vis} />
        {(T.booms as number[][]).filter((b) => t > b[0] - 0.05 && t < b[0] + 1.7).map((b, i) => <Boom key={i} p={[b[1], b[2]]} t={t} at={b[0]} r={Math.max(4, b[3] * 1.6 * inv * 1.6)} />)}
        <Faces t={t} s={s} inv={inv} />
      </g>
    </svg>
  );
};
const moodOf = (who: string, t: number): Mood => {
  let m: Mood = 'calm';
  for (const [mt, w, mm] of T.moods as [number, string, Mood][]) if (w === who && t >= mt) m = mm;
  return m;
};
const Faces: React.FC<{t: number; s: number; inv: number}> = ({t, s, inv}) => (
  <g>
    {Object.entries(FACES).map(([c, p]) => {
      const base = c === 'GL' ? 46 : c === 'US' || c === 'CA' || c === 'RU' ? 40 : ['DK', 'IS', 'NL', 'BE'].includes(c) ? 12 : 20;
      const r = Math.min(base, (58 * inv) / 1);
      if (r * s < 9) return null;
      const talking = (T.bubbles as any[]).some(([b0, b1, w]) => w === c && t > b0 + 0.2 && t < b1 - 0.3);
      return <Face key={c} x={p[0]} y={p[1]} r={r} mood={moodOf(c, t)} t={t} seed={c.charCodeAt(0) + c.charCodeAt(1)} talking={talking} />;
    })}
  </g>
);

// ================= unidades =================
const Trooper: React.FC<{col: string; walk: number; dir: number; shoot: boolean; fallen?: number; alpha: number}> = ({col, walk, dir, shoot, fallen = 0, alpha}) => {
  const sw = Math.sin(walk) * 4;
  return (
    <g transform={`rotate(${fallen * 90 * dir})`} opacity={alpha}>
      <ellipse cx={0} cy={13} rx={8} ry={2.6} fill="rgba(0,0,0,0.3)" />
      <path d={`M-2,4 L${-3 + sw},13 M2,4 L${3 - sw},13`} stroke={INK} strokeWidth={3.4} strokeLinecap="round" />
      <rect x={-5} y={-6} width={10} height={12} rx={3.5} fill={fallen > 0.5 ? '#888' : col} stroke={INK} strokeWidth={2} />
      <path d={`M0,-1 L${dir * 12},-3`} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <circle cx={0} cy={-11} r={5} fill="#f2c9a0" stroke={INK} strokeWidth={2} />
      <path d="M-6,-11 A6,6 0 0 1 6,-11 Z" fill="#fff" stroke={INK} strokeWidth={2} />
      {shoot && <path d={`M${dir * 13},-3 l${dir * 6},-3 l${-dir * 2},3 l${dir * 6},1 l${-dir * 6},1 l${dir * 2},3 Z`} fill={YELLOW} stroke={ORANGE} strokeWidth={1} />}
    </g>
  );
};
const FORM: P[] = [[0, 0], [-16, -9], [-16, 9], [-31, 0], [-31, -17], [-31, 17]];
const Heli: React.FC<{col: string; t: number; flip: boolean}> = ({col, t, flip}) => (
  <g transform={`scale(${flip ? -1 : 1},1)`}>
    <ellipse cx={0} cy={0} rx={18} ry={9} fill={col} stroke={INK} strokeWidth={3} />
    <rect x={-34} y={-3} width={20} height={5} rx={2} fill={col} stroke={INK} strokeWidth={2} />
    <ellipse cx={8} cy={-2} rx={6} ry={4} fill="#bfe6ff" stroke={INK} strokeWidth={1.5} />
    <rect x={-28} y={-11} width={56 * Math.abs(Math.cos(t * 40))} height={3} transform={`translate(${28 - 28 * Math.abs(Math.cos(t * 40))},0)`} fill={INK} />
    <line x1={0} y1={-9} x2={0} y2={-12} stroke={INK} strokeWidth={3} />
  </g>
);
const C17: React.FC<{col: string}> = ({col}) => (
  <g><path d="M-30,-4 L26,-4 L34,0 L26,4 L-30,4 Z" fill="#8a94a3" stroke={INK} strokeWidth={3} /><path d="M-4,-4 L-14,-30 L-6,-30 L8,-4 Z M-4,4 L-14,30 L-6,30 L8,4 Z" fill="#8a94a3" stroke={INK} strokeWidth={3} /><path d="M-30,-4 L-36,-14 L-30,-14 L-24,-4 Z" fill={col} stroke={INK} strokeWidth={2} /></g>
);
const Sub: React.FC<{col: string}> = ({col}) => (
  <g><ellipse cx={0} cy={0} rx={30} ry={7} fill="#3d4652" stroke={INK} strokeWidth={3} opacity={0.85} /><rect x={-4} y={-14} width={10} height={9} rx={2} fill="#3d4652" stroke={INK} strokeWidth={2.5} /><rect x={-3} y={-13} width={8} height={3} fill={col} /></g>
);
const Drone: React.FC<{col: string}> = ({col}) => (<g><path d="M14,0 L-10,-12 L-4,0 L-10,12 Z" fill={col} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" /></g>);
const Sled: React.FC<{t: number}> = ({t}) => (
  <g>{[0, 1, 2, 3].map((k) => <ellipse key={k} cx={14 + k * 9} cy={(k % 2 ? -3 : 3) + Math.sin(t * 20 + k) * 1.5} rx={4} ry={2.5} fill="#7a5a3a" stroke={INK} strokeWidth={1.5} />)}<rect x={-12} y={-5} width={20} height={9} rx={2} fill="#c8102e" stroke={INK} strokeWidth={2} /><line x1={-14} y1={6} x2={10} y2={6} stroke={INK} strokeWidth={2} /></g>
);
const Units: React.FC<{t: number; s: number; inv: number; vis: (b: number[]) => boolean}> = ({t, s, inv, vis}) => {
  const out: React.ReactNode[] = [];
  const frame = t * 30;
  const sc = 1.3 * inv;
  (T.units as any[]).forEach(([kind, side, x0, y0, x1, y1, t0, t1], i) => {
    if (t < t0 - 0.3 || t > t1 + 1.6) return;
    if (!vis([Math.min(x0, x1) - 30, Math.min(y0, y1) - 30, Math.max(x0, x1) + 30, Math.max(y0, y1) + 30])) return;
    const col = SIDE[side] || '#888';
    const fa = lerp(t, t0 - 0.3, t0, 0, 1) * lerp(t, t1 + 0.6, t1 + 1.4, 1, 0);
    if (kind === 'def') {
      const fall = lerp(t, t0 + 1, t1, 0, 1);
      for (let j = 0; j < 6; j++) {
        const x = x0 + ((j % 3) - 1) * 15 * sc, y = y0 + (Math.floor(j / 3) * 12 - 4) * sc;
        const dead = j < Math.floor(fall * 3);
        out.push(<g key={`d${i}${j}`} transform={`translate(${x},${y}) scale(${sc})`}><Trooper col={col} walk={0} dir={j % 2 ? 1 : -1} shoot={!dead && (frame + j * 5) % 12 < 2} fallen={dead ? 1 : 0} alpha={fa} /></g>);
      }
      return;
    }
    if (kind === 'crowd') {
      for (let j = 0; j < 10; j++) {
        const x = x0 + ((j % 5) - 2) * 9 * sc, y = y0 + (Math.floor(j / 5) * 10 - 5) * sc + Math.abs(Math.sin(frame / 4 + j)) * -3 * sc;
        out.push(<g key={`c${i}${j}`} transform={`translate(${x},${y}) scale(${sc * 0.9})`} opacity={fa}><circle cy={-10} r={5} fill="#f2c9a0" stroke={INK} strokeWidth={2} /><rect x={-5} y={-5} width={10} height={12} rx={3} fill={j % 3 ? '#d00c33' : '#fff'} stroke={INK} strokeWidth={2} />{j % 4 === 0 && <g><line x1={6} y1={-4} x2={6} y2={-26} stroke={INK} strokeWidth={2} /><rect x={6} y={-30} width={18} height={11} fill="#fff" stroke={INK} strokeWidth={1.5} /><rect x={6} y={-24.5} width={18} height={5.5} fill="#d00c33" /></g>}</g>);
      }
      return;
    }
    if (kind === 'sonar') {
      for (let j = 0; j < 3; j++) { const ph = ((t - t0) * 0.8 + j / 3) % 1; out.push(<circle key={`so${i}${j}`} cx={x0} cy={y0} r={ph * 80 * inv} fill="none" stroke="#8fe3ff" strokeWidth={3 * inv} opacity={(1 - ph) * fa} />); }
      return;
    }
    if (kind === 'shipsink') { out.push(<Mover key={`k${i}`} pts={[[x0, y0], [x0 + 1, y0]]} t={t} t0={t0} t1={t0 + 0.01} kind="ship" code={FLAGC[side]} inv={1.0 * inv} hold={2} sinkAt={t0 + 0.2} />); return; }
    const dist = Math.hypot(x1 - x0, y1 - y0);
    const pts = arcPath([x0, y0], [x1, y1], Math.min(30, dist * 0.15) * (i % 2 ? 1 : -1));
    if (kind === 'plane') { out.push(<Mover key={`p${i}`} pts={pts} t={t} t0={t0} t1={t1} kind="plane" color={col} inv={1.3 * inv} hold={0.2} trail />); return; }
    if (kind === 'missile') { out.push(<Mover key={`m${i}`} pts={pts} t={t} t0={t0} t1={t1} kind="missile" inv={1.1 * inv} hold={0} trail />); return; }
    if (kind === 'ship' || kind === 'landing') { out.push(<Mover key={`s${i}`} pts={pts} t={t} t0={t0} t1={t1} kind="ship" code={FLAGC[side]} inv={(kind === 'landing' ? 0.7 : 1.0) * inv} hold={1.6} />); return; }
    if (kind === 'carrier') { out.push(<Mover key={`cv${i}`} pts={pts} t={t} t0={t0} t1={t1} kind="ship" code={FLAGC[side]} inv={1.6 * inv} hold={1.6} />); return; }
    const pr = lerp(t, t0, t1, 0, 1, Easing.inOut(Easing.sin));
    const {tip, ang} = partial(pts, pr);
    const flip = Math.cos(ang) < 0;
    if (kind === 'tank') { out.push(<TankToken key={`t${i}`} p={tip} code={FLAGC[side]} inv={0.75 * inv} alpha={fa} flip={flip} />); return; }
    const g = (el: React.ReactNode, rot = true, scl = sc) => out.push(<g key={`u${i}`} transform={`translate(${tip[0]},${tip[1]}) scale(${scl}) ${rot ? `rotate(${(ang * 180) / Math.PI})` : ''}`} opacity={fa}>{el}</g>);
    if (kind === 'heli') return g(<Heli col={col} t={t} flip={flip} />, false, sc * 1.1);
    if (kind === 'c17') return g(<C17 col={col} />, true, sc * 1.2);
    if (kind === 'sub') return g(<Sub col={col} />, true, sc * 1.1);
    if (kind === 'drone') return g(<Drone col={col} />, true, sc);
    if (kind === 'sled') return g(<Sled t={t} />, false, sc * 1.2);
    if (kind === 'para') {
      const sw = Math.sin(frame / 8 + i) * 8;
      out.push(<g key={`pa${i}`} transform={`translate(${tip[0] + sw * inv},${tip[1]}) scale(${sc * 0.9})`} opacity={fa * lerp(t, t1, t1 + 0.4, 1, 0.0)}><path d="M-16,-30 Q0,-48 16,-30 Z" fill="#e8e2d0" stroke={INK} strokeWidth={2.5} /><path d="M-15,-30 L-2,-8 M15,-30 L2,-8 M0,-34 L0,-8" stroke={INK} strokeWidth={1.4} /><Trooper col={col} walk={0} dir={1} shoot={false} alpha={1} /></g>);
      return;
    }
    // escuadra
    const ca = Math.cos(ang), sa = Math.sin(ang), dir = ca >= 0 ? 1 : -1;
    for (let j = 0; j < FORM.length; j++) {
      const [fx, fy] = FORM[j];
      const x = tip[0] + (fx * ca - fy * sa) * sc, y = tip[1] + (fx * sa + fy * ca) * sc;
      out.push(<g key={`q${i}-${j}`} transform={`translate(${x},${y}) scale(${sc})`}><Trooper col={col} walk={pr < 1 ? frame / 2.2 + j : 0} dir={dir} shoot={pr > 0.75 && (frame + j * 7 + i) % 11 < 2} alpha={fa} /></g>);
    }
  });
  return <g>{out}</g>;
};

// ================= interfaz (sirve para horizontal y vertical) =================
export type Lay = {W: number; H: number; vert: boolean};
const toS = (p: P, cam: Cam, vp: LVP): P => [vp.ox + (p[0] - cam.cx) * cam.s, vp.oy + (p[1] - cam.cy) * cam.s];
const hudPhase = (t: number) => { let ph = 'none'; for (const [ht, k] of T.hud as [number, string][]) if (t >= ht) ph = k; return ph; };
const cardActive = (t: number) => (T.cards as any[]).some((c) => t >= c.t0 - 0.1 && t < c.t1 && c.kind !== 'closed');
const Chip0: React.FC<{code: string; w?: number; h?: number}> = ({code, w = 50, h = 34}) => <WFlag code={(FLAGC[code] || code).toUpperCase()} w={w} h={h} />;
export const Hud: React.FC<{t: number; L: Lay}> = ({t, L}) => {
  const ph = hudPhase(t);
  if (t < 34.6 || ph === 'none') return null;
  const day = dayAt(t);
  const top = L.vert ? 120 : 16;
  const wrap = (body: React.ReactNode) => (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 10}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transform: L.vert ? 'scale(1.3)' : undefined, transformOrigin: 'top center'}}>
        {body}
        <div style={{background: INK, border: '4px solid #fff', borderRadius: 14, padding: '3px 16px 0', ...font, fontSize: 28, color: YELLOW}}>DAY {day}</div>
      </div>
    </div>
  );
  const box = (inner: React.ReactNode) => <div style={{display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(16,22,34,0.88)', border: '5px solid #fff', borderRadius: 28, padding: '8px 22px', width: L.vert ? 780 : 1060, boxSizing: 'border-box'}}>{inner}</div>;
  const name = (txt: string, n: string, right?: boolean) => <div style={{display: 'flex', flexDirection: 'column', alignItems: right ? 'flex-end' : 'flex-start', minWidth: 150}}><div style={{...font, fontSize: 28, color: '#fff', lineHeight: 1}}>{txt}</div><div style={{...font, fontSize: 38, color: YELLOW, lineHeight: 1.1}}>{n}</div></div>;
  if (ph === 'invasion') {
    const p = series(T.ctrl, t);
    const us = series(T.soldiers.us, t), df = series(T.soldiers.def, t);
    return wrap(box(<>
      <Avatar size={80} code="us" mood={p > 0.5 ? 'smug' : 'angry'} t={t} seed={1} look={[1, 0]} id="h-us" />{name('USA', fmt(Math.round(us / 10) * 10))}
      <div style={{flex: 1}}>
        <div style={{display: 'flex', justifyContent: 'space-between', ...font, fontSize: 26, color: '#fff'}}><span>GREENLAND CONTROLLED</span><span style={{color: '#8fb3ff'}}>{Math.round(p * 100)}%</span></div>
        <div style={{height: 30, borderRadius: 15, overflow: 'hidden', border: `5px solid ${INK}`, background: '#e9e9e9', marginTop: 4}}><div style={{width: `${p * 100}%`, height: '100%', background: 'repeating-linear-gradient(45deg, #2f5bd3, #2f5bd3 12px, #1d3f8a 12px, #1d3f8a 24px)'}} /></div>
      </div>
      {name('DEFENDERS', fmt(Math.round(df)), true)}<Avatar size={80} code="dk" mood={p > 0.5 ? 'scared' : 'angry'} t={t} seed={2} look={[-1, 0]} id="h-dk" />
    </>));
  }
  if (ph === 'meter') {
    const v = series(T.meter, t);
    const col = v < 0.4 ? GREEN : v < 0.7 ? ORANGE : RED;
    return wrap(box(<>
      <Avatar size={72} code="us" mood="angry" t={t} seed={1} look={[1, 0]} id="m-us" />
      <div style={{flex: 1}}>
        <div style={{display: 'flex', justifyContent: 'space-between', ...font, fontSize: 28, color: '#fff'}}><span>ESCALATION</span><span style={{color: col}}>{v < 0.4 ? 'TENSE' : v < 0.7 ? 'DANGEROUS' : 'ON THE BRINK'}</span></div>
        <div style={{position: 'relative', height: 30, borderRadius: 15, overflow: 'hidden', border: `5px solid ${INK}`, background: 'linear-gradient(90deg, #22a95b, #ffd23f 45%, #ff8a1f 70%, #e5322d)', marginTop: 4}}>
          <div style={{position: 'absolute', right: 0, top: 0, bottom: 0, width: `${(1 - v) * 100}%`, background: '#2a2f3a'}} />
          <div style={{position: 'absolute', left: `calc(${v * 100}% - 4px)`, top: -2, width: 8, height: 34, background: '#fff', boxShadow: `0 0 ${8 + 8 * Math.sin(t * 10)}px #fff`}} />
        </div>
      </div>
      <Avatar size={72} code="eu" mood="angry" t={t} seed={2} look={[-1, 0]} id="m-eu" />
    </>));
  }
  // bajas
  const us = series(T.losses.us, t), eu = series(T.losses.eu, t);
  let sh = [0, 0]; for (const x of T.losses.ships) if (t >= x[0]) sh = [x[1], x[2]];
  return wrap(box(<>
    <Avatar size={72} code="us" mood="angry" t={t} seed={1} look={[1, 0]} id="l-us" />{name('US LOSSES', `${fmt(Math.round(us))} · ⚓${sh[0]}`)}
    <div style={{flex: 1, textAlign: 'center', ...font, fontSize: 34, color: RED}}>⚔ ALLIES AT WAR</div>
    {name('EUROPE LOSSES', `${fmt(Math.round(eu))} · ⚓${sh[1]}`, true)}<Avatar size={72} code="eu" mood="angry" t={t} seed={2} look={[-1, 0]} id="l-eu" />
  </>));
};
export const ChipBar: React.FC<{t: number; L: Lay}> = ({t, L}) => {
  const ch = (T.chips as [number, string, string][]).filter(([ct]) => t >= ct && t < ct + 2.6).slice(-1)[0];
  if (!ch) return null;
  const [ct, text, side] = ch;
  const k = popT(t, ct, 12) * lerp(t, ct + 2.3, ct + 2.6, 1, 0);
  const red = side === 'RED';
  return (
    <div style={{position: 'absolute', top: L.vert ? 470 : 205, left: 30, right: 30, display: 'flex', justifyContent: 'center', zIndex: 12}}>
      <div style={{transform: `scale(${k}) rotate(-2deg)`, display: 'flex', alignItems: 'center', gap: 14, background: red ? RED : SIDE[side] || BLUE, border: `6px solid ${INK}`, borderRadius: 20, padding: '8px 26px 2px', ...font, fontSize: L.vert ? 50 : 44, color: '#fff', textShadow: `3px 3px 0 ${INK}`, boxShadow: '0 8px 0 rgba(0,0,0,0.35)', textAlign: 'center', lineHeight: 1.02, maxWidth: L.vert ? 1000 : 1500}}>
        {!red && FLAGC[side] && <Chip0 code={side} w={54} h={36} />}{text}
      </div>
    </div>
  );
};
export const Ticker: React.FC<{t: number; L: Lay}> = ({t, L}) => {
  const h = (T.headlines as [number, string][]).find(([ht]) => t >= ht && t < ht + 3.6);
  if (!h) return null;
  const k = lerp(t, h[0], h[0] + 0.25, 0, 1) * lerp(t, h[0] + 3.3, h[0] + 3.6, 1, 0);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: L.vert ? 380 : 60, display: 'flex', justifyContent: 'center', zIndex: 11, opacity: k}}>
      <div style={{display: 'flex', alignItems: 'stretch', border: `5px solid ${INK}`, borderRadius: 12, overflow: 'hidden', transform: `translateY(${(1 - k) * 60}px)`, maxWidth: L.vert ? 1020 : 1500}}>
        <div style={{background: RED, ...font, fontSize: 34, color: '#fff', padding: '6px 16px 0'}}>BREAKING</div>
        <div style={{background: '#fff', ...font, fontSize: 34, color: INK, padding: '6px 18px 0', whiteSpace: L.vert ? 'normal' : 'nowrap'}}>{h[1]}</div>
      </div>
    </div>
  );
};
export const Stamp: React.FC<{t: number; L: Lay}> = ({t, L}) => {
  const st = (T.stamps as any[]).find((s) => t >= s.t && t < s.t + s.d);
  if (!st) return null;
  const dt = t - st.t;
  const k = dt < 0.27 ? interpolate(dt, [0, 0.27], [2.2, 1], {...clamp, easing: Easing.out(Easing.cubic)}) : 1;
  const a = lerp(dt, 0, 0.12, 0, 1) * lerp(dt, st.d - 0.3, st.d, 1, 0);
  const col = st.c === 'red' ? RED : st.c === 'blue' ? BLUE : GREEN;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 13}}>
      <div style={{transform: `scale(${k}) rotate(-6deg)`, opacity: a, border: `10px solid ${col}`, color: col, background: 'rgba(255,246,227,0.95)', borderRadius: 18, padding: '14px 36px 6px', ...font, fontSize: L.vert ? 88 : 96, boxShadow: '0 10px 0 rgba(0,0,0,0.3)', textAlign: 'center', lineHeight: 1, maxWidth: L.vert ? 980 : 1700}}>{st.text}</div>
    </AbsoluteFill>
  );
};
export const Bubbles: React.FC<{t: number; cam: Cam; vp: LVP; L: Lay}> = ({t, cam, vp, L}) => (
  <>
    {(T.bubbles as [number, number, string, string][]).filter(([b0, b1]) => t >= b0 && t <= b1).map(([b0, b1, w, text]) => {
      const [sx, sy] = toS(FACES[w] || [960, 540], cam, vp);
      const k = popT(t, b0, 10) * lerp(t, b1 - 0.25, b1, 1, 0);
      const half = text.length * (L.vert ? 14 : 11) + 40;
      return <Bubble key={w + b0} k={k} sx={Math.max(half + 20, Math.min(L.W - half - 20, sx))} sy={Math.min(L.H - (L.vert ? 420 : 140), Math.max(L.vert ? 640 : 280, sy - 40))} text={text} size={L.vert ? 48 : 40} />;
    })}
  </>
);
const LAB: Record<string, string> = {Sisimiut: 'L', Aasiaat: 'L', Qaqortoq: 'L', Maniitsoq: 'L', Nuuk: 'L', Paamiut: 'L', Kangerlussuaq: 'R', Narsarsuaq: 'R', Ilulissat: 'R', Upernavik: 'L', Tasiilaq: 'R'};
const Labels: React.FC<{t: number; cam: Cam; vp: LVP; L: Lay}> = ({t, cam, vp, L}) => {
  if (cam.s < 2.2 || cardActive(t)) return null;
  const items = ['Nuuk', 'Kangerlussuaq', 'Sisimiut', 'Maniitsoq', 'Ilulissat', 'Qaqortoq', 'Narsarsuaq', 'Tasiilaq', 'Pituffik', 'Station Nord', 'Reykjavik', 'Upernavik', 'Ittoqqortoormiit'];
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 3}}>
      {items.map((n) => {
        const [sx, sy] = toS(PLACES[n], cam, vp);
        if (sx < 80 || sx > L.W - 80 || sy < (L.vert ? 600 : 260) || sy > L.H - (L.vert ? 420 : 120)) return null;
        const cp = (T.caps as any[]).find((c) => c[1] === n);
        const capd = cp && t >= cp[0] && t < T.indep;
        const side = LAB[n]; const tr = side === 'L' ? 'translate(calc(-100% - 12px),-50%)' : side === 'R' ? 'translate(12px,-50%)' : 'translateX(-50%)';
        return <div key={n} style={{position: 'absolute', left: sx, top: side ? sy : sy + 12, transform: tr, background: capd ? '#2f5bd3' : '#fff', color: capd ? '#fff' : INK, border: `4px solid ${INK}`, borderRadius: 12, padding: '2px 12px 0', ...font, fontSize: L.vert ? 30 : 24, whiteSpace: 'nowrap'}}>{n.toUpperCase()}</div>;
      })}
    </div>
  );
};

// ================= tarjetas =================
const Card: React.FC<{t: number; c: any; L: Lay; children: React.ReactNode; title?: string; col?: string}> = ({t, c, L, children, title, col = INK}) => {
  const k = popT(t, c.t0, 12) * lerp(t, c.t1 - 0.3, c.t1, 1, 0);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: L.vert ? 640 : 300, display: 'flex', justifyContent: 'center', zIndex: 12}}>
      <div style={{transform: `scale(${k})`, width: L.vert ? 980 : 1100, background: CREAM, border: `8px solid ${INK}`, borderRadius: 30, padding: '18px 26px 22px', boxShadow: '0 12px 0 rgba(0,0,0,0.35)', boxSizing: 'border-box'}}>
        {title && <div style={{...font, fontSize: 52, color: col, textAlign: 'center', marginBottom: 10}}>{title}</div>}
        {children}
      </div>
    </div>
  );
};
const rowIn = (t: number, t0: number, i: number, gap = 0.45) => ({opacity: lerp(t, t0 + 0.3 + i * gap, t0 + 0.6 + i * gap, 0, 1), transform: `translateX(${lerp(t, t0 + 0.3 + i * gap, t0 + 0.6 + i * gap, -60, 0)}px)`});
const Row: React.FC<{st: any; icon: React.ReactNode; label: string; value: React.ReactNode; vcol?: string}> = ({st, icon, label, value, vcol = INK}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 16, minHeight: 72, borderTop: '3px solid #e2d3b1', ...st}}>
    <div style={{width: 70, display: 'flex', justifyContent: 'center', fontSize: 46}}>{icon}</div>
    <div style={{...font2, fontSize: 34, color: INK, flex: 1}}>{label}</div>
    <div style={{...font, fontSize: 44, color: vcol}}>{value}</div>
  </div>
);
const count = (t: number, t0: number, v: number, d = 1.4) => Math.round(v * lerp(t, t0 + 0.3, t0 + 0.3 + d, 0, 1, Easing.out(Easing.cubic)));
const FlagStack: React.FC<{codes: string[]; t: number; t0: number; size?: number}> = ({codes, t, t0, size = 64}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center'}}>{codes.map((c, i) => <div key={c + i} style={{transform: `scale(${popT(t, t0 + 0.3 + i * 0.18, 9)})`}}><WFlag code={c} w={size} h={size * 0.67} /></div>)}</div>
);
const Arrow: React.FC<{label: string; col: string; dir?: number; t: number; t0: number}> = ({label, col, dir = 1, t, t0}) => {
  const k = lerp(t, t0, t0 + 0.6, 0, 1, Easing.out(Easing.cubic));
  return <div style={{display: 'flex', alignItems: 'center', flexDirection: dir > 0 ? 'row' : 'row-reverse', gap: 6}}><div style={{height: 22, width: 260 * k, background: col, border: `4px solid ${INK}`, borderRadius: 11}} /><div style={{width: 0, height: 0, borderTop: '24px solid transparent', borderBottom: '24px solid transparent', [dir > 0 ? 'borderLeft' : 'borderRight']: `36px solid ${col}`, opacity: k}} /><div style={{...font, fontSize: 40, color: col, marginLeft: 8}}>{label}</div></div>;
};
const Spark: React.FC<{t: number; t0: number; down?: boolean; col?: string}> = ({t, t0, down = true, col = RED}) => {
  const n = 40, k = lerp(t, t0 + 0.2, t0 + 3.5, 0, 1);
  const pts = Array.from({length: n}).map((_, i) => { const x = (i / (n - 1)) * 600; const base = down ? 60 + i * 4.5 : 240 - i * 4; return `${x},${base + Math.sin(i * 1.7) * 14 + Math.cos(i * 0.6) * 8}`; }).slice(0, Math.max(2, Math.round(n * k)));
  return <svg width={620} height={260} viewBox="0 -10 620 260"><polyline points={pts.join(' ')} fill="none" stroke={col} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" /></svg>;
};
const Cards: React.FC<{t: number; L: Lay}> = ({t, L}) => {
  const c = (T.cards as any[]).find((x) => t >= x.t0 && t < x.t1);
  if (!c) return null;
  const t0 = c.t0;
  switch (c.kind) {
    case 'title': {
      const k = popT(t, 0.1, 10) * lerp(t, 3.8, 4.2, 1, 0);
      return <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 14}}><div style={{transform: `scale(${k}) rotate(-2deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}><div style={{display: 'flex', gap: 30, alignItems: 'center'}}><Avatar size={L.vert ? 220 : 180} code="us" mood="smug" t={t} seed={1} look={[1, 0]} id="tt-us" /><div style={{fontSize: 90}}>➜</div><Avatar size={L.vert ? 220 : 180} code="gl" mood="scared" t={t} seed={2} look={[-1, 0]} id="tt-gl" /></div><div style={{background: '#2ec36a', border: `9px solid ${INK}`, borderRadius: 30, padding: '20px 50px 10px', ...font, fontSize: L.vert ? 96 : 116, color: '#fff', textShadow: `5px 5px 0 ${INK}`, textAlign: 'center', lineHeight: 1.02}}>WHAT IF THE USA<br />INVADED GREENLAND?</div></div></AbsoluteFill>;
    }
    case 'facts': return <Card t={t} c={c} L={L} title="GREENLAND" col="#d00c33">{[['🧊', 'Size', `${fmt(count(t, t0, 2166086))} km²`], ['👥', 'People', fmt(count(t, t0 + 0.4, 56000))], ['🇩🇰', 'Part of', 'Kingdom of Denmark'], ['🇺🇸', 'US base already there', 'Pituffik']].map(([i, l, v], j) => <Row key={l} st={rowIn(t, t0, j)} icon={i} label={l} value={v} />)}</Card>;
    case 'why': return <Card t={t} c={c} L={L} title="WHY THE USA WANTS IT" col={BLUE}>{[['🧭', 'New Arctic shipping routes', '❄️ → 🚢'], ['💎', 'Rare earth minerals', 'TONS'], ['📡', 'Missile defense & radar', 'PITUFFIK'], ['🗺️', 'Between USA, Europe and Russia', 'KEY SPOT']].map(([i, l, v], j) => <Row key={l} st={rowIn(t, t0, j)} icon={i} label={l} value={v} vcol={BLUE} />)}</Card>;
    case 'forces': {
      const k = lerp(t, t0 + 0.5, t0 + 2.2, 0, 1, Easing.out(Easing.cubic));
      return <Card t={t} c={c} L={L} title="THE FORCES (approx.)">
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}><WFlag code="US" w={80} h={54} /><div style={{flex: 1, height: 46, background: '#e6d9bd', borderRadius: 23, border: `5px solid ${INK}`, overflow: 'hidden'}}><div style={{width: `${100 * k}%`, height: '100%', background: '#2f5bd3'}} /></div><div style={{...font, fontSize: 46, color: '#2f5bd3', width: 230, textAlign: 'right'}}>{fmt(Math.round(1328000 * k))}</div></div>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 16}}><WFlag code="DK" w={80} h={54} /><div style={{flex: 1, height: 46, background: '#e6d9bd', borderRadius: 23, border: `5px solid ${INK}`, overflow: 'hidden'}}><div style={{width: `${Math.max(0.6, 0.03 * k * 100)}%`, height: '100%', background: '#c8102e'}} /></div><div style={{...font, fontSize: 46, color: '#c8102e', width: 230, textAlign: 'right'}}>{fmt(Math.round(350 * k))}</div></div>
        <div style={{...font2, fontSize: 28, color: '#666', textAlign: 'center', marginTop: 12}}>US active troops vs Danish troops in Greenland</div>
      </Card>;
    }
    case 'tension': return <Card t={t} c={c} L={L} title="2026: THE TENSION" col={RED}><div style={{display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center'}}><Arrow label="TARIFFS" col={RED} t={t} t0={t0 + 0.3} /><FlagStack codes={['DK', 'FR', 'DE', 'SE', 'NO', 'GB', 'NL', 'FI']} t={t} t0={t0 + 1.2} size={70} /><div style={{...font, fontSize: 34, color: INK, ...rowIn(t, t0 + 2, 0)}}>European troops arrive in Greenland</div></div></Card>;
    case 'countdown': {
      const i = Math.floor((t - t0 - 2) / 1.0);
      const k = popT(t, t0, 11) * lerp(t, c.t1 - 0.3, c.t1, 1, 0);
      const label = t - t0 < 2 ? 'OPERATION' : i < 3 ? String(3 - i) : 'DAY 1';
      const dt = t - t0 < 2 ? t - t0 : (t - t0 - 2) % 1;
      const s2 = interpolate(dt, [0, 0.25], [1.8, 1], {...clamp, easing: Easing.out(Easing.cubic)});
      return <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 15}}><div style={{opacity: k, transform: `scale(${s2})`, ...font, fontSize: label.length > 3 ? (L.vert ? 140 : 180) : 260, color: label === 'DAY 1' ? RED : '#fff', textShadow: `8px 8px 0 ${INK}, -4px -4px 0 ${INK}, 4px -4px 0 ${INK}, -4px 4px 0 ${INK}`}}>{label}</div></AbsoluteFill>;
    }
    case 'article': return <Card t={t} c={c} L={L} title="DENMARK CALLS FOR HELP" col="#c8102e"><div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 14}}><WFlag code="DK" w={110} h={74} /><div style={{...font, fontSize: 60, color: INK}}>➜</div><div style={{...font, fontSize: 44, color: '#1d56c9'}}>NATO ART. 4 · EU ART. 42.7</div></div><FlagStack codes={['FR', 'DE', 'NO', 'SE', 'FI', 'NL', 'BE', 'EE', 'PL', 'ES', 'IT', 'GB']} t={t} t0={t0 + 0.8} size={66} /></Card>;
    case 'trade': return <Card t={t} c={c} L={L} title="TRADE WAR" col={RED}><div style={{display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center'}}><div style={{display: 'flex', alignItems: 'center', gap: 14}}><WFlag code="EU" w={90} h={60} /><Arrow label="+25%" col="#1d56c9" t={t} t0={t0 + 0.3} /><WFlag code="US" w={90} h={60} /></div><div style={{display: 'flex', alignItems: 'center', gap: 14}}><WFlag code="EU" w={90} h={60} /><Arrow label="+25%" col={RED} dir={-1} t={t} t0={t0 + 1.0} /><WFlag code="US" w={90} h={60} /></div><Spark t={t} t0={t0 + 1.5} /></div></Card>;
    case 'closed': return null;
    case 'bases': return <Card t={t} c={c} L={L} title="US BASES IN EUROPE RESTRICTED" col="#1d56c9">{[['DE', 'Ramstein (Germany)'], ['ES', 'Rota (Spain)'], ['IT', 'Aviano (Italy)'], ['IS', 'Keflavik (Iceland)']].map(([f, n], j) => <Row key={n} st={rowIn(t, t0, j)} icon={<WFlag code={f} w={60} h={40} />} label={n} value={<span style={{color: RED}}>🚫 LIMITED</span>} />)}</Card>;
    case 'china': return <Card t={t} c={c} L={L} title="CHINA PLAYS ITS CARD" col="#de2910"><div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20}}><WFlag code="CN" w={120} h={80} /><div style={{...font, fontSize: 48, color: INK}}>RARE EARTHS</div><div style={{...font, fontSize: 70, color: RED}}>✂</div></div><div style={{display: 'flex', justifyContent: 'center', marginTop: 10}}><Spark t={t} t0={t0 + 0.8} /></div></Card>;
    case 'un': {
      const k = lerp(t, t0 + 0.5, t0 + 3, 0, 1, Easing.out(Easing.cubic));
      return <Card t={t} c={c} L={L} title="UN EMERGENCY VOTE (simulated)" col="#2a8fd8"><div style={{display: 'flex', gap: 16, alignItems: 'center'}}><div style={{...font, fontSize: 40, color: GREEN, width: 220}}>CONDEMN {Math.round(139 * k)}</div><div style={{flex: 1, height: 50, display: 'flex', borderRadius: 25, overflow: 'hidden', border: `5px solid ${INK}`}}><div style={{width: `${71 * k}%`, background: GREEN}} /><div style={{width: `${4 * k}%`, background: RED}} /><div style={{flex: 1, background: '#bbb'}} /></div><div style={{...font, fontSize: 40, color: RED, width: 160, textAlign: 'right'}}>NO {Math.round(7 * k)}</div></div></Card>;
    }
    case 'uk': return <Card t={t} c={c} L={L} title="THE UK IS TORN" col="#1d3f8a"><div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30}}><WFlag code="US" w={110} h={74} /><div style={{transform: `rotate(${Math.sin(t * 4) * 12}deg)`}}><Avatar size={170} code="gb" mood="shocked" t={t} seed={4} id="c-uk" /></div><WFlag code="EU" w={110} h={74} /></div><div style={{...font, fontSize: 38, color: INK, textAlign: 'center', marginTop: 10}}>Old ally vs. neighbours</div></Card>;
    case 'nato': case 'split': {
      const sp = lerp(t, t0 + 1, t0 + 3, 0, 1, Easing.inOut(Easing.cubic));
      return <Card t={t} c={c} L={L} title={c.kind === 'nato' ? 'NATO EMERGENCY SUMMIT' : 'NATO SPLITS IN TWO'} col="#1d3f8a"><div style={{display: 'flex', justifyContent: 'center', gap: 20 + 140 * sp}}><div style={{display: 'flex', gap: 8, transform: `rotate(${-6 * sp}deg)`}}>{['US'].map((f) => <WFlag key={f} code={f} w={90} h={60} />)}</div><div style={{display: 'flex', gap: 8, flexWrap: 'wrap', width: 420, transform: `rotate(${6 * sp}deg)`}}>{['DK', 'FR', 'DE', 'NO', 'NL', 'BE', 'ES', 'SE', 'FI', 'PL'].map((f) => <WFlag key={f} code={f} w={70} h={47} />)}</div></div><div style={{...font, fontSize: 40, color: RED, textAlign: 'center', marginTop: 12, opacity: sp}}>💔 75 YEARS OF ALLIANCE</div></Card>;
    }
    case 'cyber': return <Card t={t} c={c} L={L} title="CYBER WAR" col="#16a34a"><div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}>{['US', 'EU'].map((f, j) => <div key={f} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}><WFlag code={f} w={110} h={74} /><div style={{width: 260, height: 150, background: (Math.floor(t * 6 + j * 3) % 4 === 0) ? '#111' : '#0d2b12', border: `6px solid ${INK}`, borderRadius: 12, ...font, fontSize: 26, color: '#4ade80', padding: 10, overflow: 'hidden', fontFamily: 'monospace'}}>{Array.from({length: 5}).map((_, r) => <div key={r}>{Array.from({length: 18}).map((__, q) => ((q * 7 + r * 3 + Math.floor(t * 12)) % 2 ? '1' : '0')).join('')}</div>)}</div></div>)}</div></Card>;
    case 'markets': return <Card t={t} c={c} L={L} title="MARKETS IN FREEFALL" col={RED}><div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20}}><div style={{display: 'flex', flexDirection: 'column', gap: 10}}>{[['$ DOLLAR', `-${count(t, t0, 9)}%`], ['📈 STOCKS', `-${count(t, t0 + 0.3, 14)}%`], ['🏦 US BONDS', 'SOLD']].map(([l, v], j) => <div key={l} style={{...font, fontSize: 40, color: INK, ...rowIn(t, t0, j)}}>{l} <span style={{color: RED}}>{v}</span></div>)}</div><Spark t={t} t0={t0} /></div></Card>;
    case 'sanctions': return <Card t={t} c={c} L={L} title="CANADA SANCTIONS THE USA" col="#d52b1e"><div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16}}><WFlag code="CA" w={110} h={74} /><Arrow label="SANCTIONS" col="#d52b1e" t={t} t0={t0 + 0.3} /><WFlag code="US" w={110} h={74} /></div></Card>;
    case 'congress': {
      const k = lerp(t, t0 + 0.4, t0 + 2.6, 0, 1, Easing.out(Easing.cubic));
      return <Card t={t} c={c} L={L} title="US CONGRESS SPLIT" col="#2f5bd3"><div style={{display: 'flex', gap: 14, alignItems: 'center'}}><div style={{...font, fontSize: 40, color: GREEN, width: 220}}>FUND IT {Math.round(214 * k)}</div><div style={{flex: 1, height: 50, display: 'flex', borderRadius: 25, overflow: 'hidden', border: `5px solid ${INK}`}}><div style={{width: `${49 * k}%`, background: GREEN}} /><div style={{flex: 1}} /><div style={{width: `${51 * k}%`, background: RED}} /></div><div style={{...font, fontSize: 40, color: RED, width: 220, textAlign: 'right'}}>STOP IT {Math.round(221 * k)}</div></div><div style={{...font2, fontSize: 26, color: '#666', textAlign: 'center', marginTop: 8}}>Simulated House vote</div></Card>;
    }
    case 'geneva': return <Card t={t} c={c} L={L} title="PEACE TALKS IN GENEVA" col={GREEN}><div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24}}><Avatar size={140} code="us" mood="angry" t={t} seed={1} look={[1, 0]} id="g-us" /><WFlag code="CH" w={100} h={100} /><Avatar size={140} code="dk" mood="angry" t={t} seed={2} look={[-1, 0]} id="g-dk" /><Avatar size={140} code="gl" mood="calm" t={t} seed={3} look={[-1, 0]} id="g-gl" /></div><div style={{...font, fontSize: 40, color: INK, textAlign: 'center', marginTop: 10}}>CEASEFIRE IN {Math.max(0, 3 - Math.floor(t - t0 - 2))}...</div></Card>;
    case 'cost': return <Card t={t} c={c} L={L} title="THE COST OF THE WAR (simulated)" col={RED}>{[['🇺🇸', 'US soldiers killed', fmt(count(t, t0, 141))], ['🇪🇺', 'European soldiers killed', fmt(count(t, t0 + 0.3, 230))], ['⚓', 'Warships lost', '2'], ['💸', 'Economic damage', `$${count(t, t0 + 0.6, 1800)}B`]].map(([i, l, v], j) => <Row key={l} st={rowIn(t, t0, j)} icon={i} label={l} value={v} vcol={RED} />)}</Card>;
    case 'agreement': return <Card t={t} c={c} L={L} title="THE GENEVA AGREEMENT" col={GREEN}>{[['🕊️', 'Ceasefire', 'SIGNED'], ['🗳️', 'Greenland referendum', 'UN-SUPERVISED'], ['🪖', 'US troops', 'STAY FOR NOW']].map(([i, l, v], j) => <Row key={l} st={rowIn(t, t0, j)} icon={i} label={l} value={v} vcol={GREEN} />)}</Card>;
    case 'referendum': {
      const k = lerp(t, t0 + 0.6, t0 + 4.5, 0, 1, Easing.out(Easing.cubic));
      return <Card t={t} c={c} L={L} title="GREENLAND VOTES: INDEPENDENCE?" col="#d00c33"><div style={{display: 'flex', gap: 14, alignItems: 'center'}}><div style={{...font, fontSize: 46, color: GREEN, width: 200}}>YES {Math.round(81 * k)}%</div><div style={{flex: 1, height: 56, display: 'flex', borderRadius: 28, overflow: 'hidden', border: `5px solid ${INK}`}}><div style={{width: `${81 * k}%`, background: GREEN}} /><div style={{flex: 1, background: '#ddd'}} /><div style={{width: `${19 * k}%`, background: RED}} /></div><div style={{...font, fontSize: 46, color: RED, width: 170, textAlign: 'right'}}>NO {Math.round(19 * k)}%</div></div><div style={{...font2, fontSize: 26, color: '#666', textAlign: 'center', marginTop: 8}}>Simulated result</div></Card>;
    }
    case 'pact': return <Card t={t} c={c} L={L} title="THE DEAL" col={BLUE}><div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30}}><Avatar size={170} code="gl" mood="calm" t={t} seed={3} look={[1, 0]} id="p-gl" /><div style={{fontSize: 90, transform: `scale(${1 + 0.1 * Math.sin(t * 6)})`}}>🤝</div><Avatar size={170} code="us" mood="happy" t={t} seed={1} look={[-1, 0]} id="p-us" /></div><div style={{...font, fontSize: 36, color: INK, textAlign: 'center', marginTop: 10}}>Independent Greenland · US bases stay</div></Card>;
    case 'alliance': return <Card t={t} c={c} L={L} title="EUROPE'S NEW DEFENCE ALLIANCE" col="#1d56c9"><FlagStack codes={['DK', 'FR', 'DE', 'NO', 'SE', 'FI', 'NL', 'BE', 'PL', 'ES', 'IT', 'EE', 'GB', 'CA']} t={t} t0={t0} size={70} /><div style={{...font, fontSize: 34, color: INK, textAlign: 'center', marginTop: 10, ...rowIn(t, t0 + 2.5, 0)}}>US troops start leaving Europe</div></Card>;
    case 'rearm': return <Card t={t} c={c} L={L} title="EUROPE REARMS" col="#1d56c9"><div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 30, height: 230}}>{[['2024', 1.9], ['2026', 2.4], ['2027', 3.5], ['2028', 4.6]].map(([y, v], j) => { const h = (v as number) * 42 * lerp(t, t0 + 0.3 + j * 0.4, t0 + 0.9 + j * 0.4, 0, 1); return <div key={y as string} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}><div style={{...font, fontSize: 32, color: INK}}>{(v as number).toFixed(1)}%</div><div style={{width: 110, height: h, background: j === 3 ? RED : '#1d56c9', border: `5px solid ${INK}`, borderRadius: '10px 10px 0 0'}} /><div style={{...font, fontSize: 30, color: INK}}>{y}</div></div>; })}</div><div style={{...font2, fontSize: 26, color: '#666', textAlign: 'center'}}>Defence spending, % of GDP (simulated)</div></Card>;
    case 'winners': return <Card t={t} c={c} L={L} title="WHO REALLY WINS?" col={RED}><div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40}}><Avatar size={190} code="ru" mood="happy" t={t} seed={5} id="w-ru" /><Avatar size={190} code="cn" mood="smug" t={t} seed={6} id="w-cn" /></div><div style={{...font, fontSize: 38, color: INK, textAlign: 'center', marginTop: 10}}>A divided West is their best gift</div></Card>;
    case 'later': return <Card t={t} c={c} L={L} title="60 DAYS LATER" col="#d00c33">{[['🏗️', 'New US bases', '+3'], ['✈️', 'US troops in Greenland', fmt(count(t, t0, 6000))], ['🧑‍🤝‍🧑', 'Greenlanders protesting', 'DAILY']].map(([i, l, v], j) => <Row key={l} st={rowIn(t, t0, j)} icon={i} label={l} value={v} />)}</Card>;
    case 'newmap': return <Card t={t} c={c} L={L} title="THE NEW ARCTIC" col={BLUE}>{[['GL', 'Greenland', 'INDEPENDENT', GREEN], ['US', 'USA', 'BASES + ALONE', BLUE], ['DK', 'Denmark', 'LOST GREENLAND', RED], ['EU', 'Europe', 'NEW ALLIANCE', '#1d56c9']].map(([f, l, v, col], j) => <Row key={l} st={rowIn(t, t0, j)} icon={<WFlag code={f} w={64} h={43} />} label={l} value={v} vcol={col} />)}</Card>;
    default: return null;
  }
};
const Closed: React.FC<{t: number; cam: Cam; vp: LVP}> = ({t, cam, vp}) => {
  const c = (T.cards as any[]).find((x) => x.kind === 'closed' && t >= x.t0 && t < x.t1);
  if (!c) return null;
  const [sx, sy] = toS(PLACES[c.place], cam, vp);
  const k = popT(t, c.t0, 10) * lerp(t, c.t1 - 0.3, c.t1, 1, 0);
  return <div style={{position: 'absolute', left: sx, top: sy, transform: `translate(-50%,-50%) scale(${k})`, zIndex: 9, fontSize: 130}}>🚫</div>;
};
const Results: React.FC<{t: number; L: Lay}> = ({t, L}) => {
  if (t < T.results || t >= T.results_end) return null;
  const t0 = T.results;
  const c = {t0, t1: T.results_end};
  return <Card t={t} c={c} L={L} title="FINAL RESULTS" col={INK}>{[['🇺🇸', 'USA', 'Keeps its bases · loses its allies', BLUE], ['🇬🇱', 'Greenland', 'Independent', GREEN], ['🇩🇰', 'Denmark', 'Loses Greenland', RED], ['🤝', 'NATO', 'Broken', RED], ['📅', 'War', `74 days · ${T.caps.length} towns taken`, INK]].map(([i, l, v, col], j) => <Row key={l} st={rowIn(t, t0, j, 0.6)} icon={i} label={l} value={<span style={{fontSize: L.vert ? 32 : 38}}>{v}</span>} vcol={col} />)}</Card>;
};
const VERDICT: Record<string, [string, string, Mood]> = {
  GREENLAND: ['gl', 'Won its independence… but the US is still there', 'happy'],
  USA: ['us', 'Got Greenland. Lost its friends.', 'smug'],
  DENMARK: ['dk', 'Lost 98% of its territory', 'sad'],
  EUROPE: ['eu', 'Learned to defend itself', 'angry'],
  NATO: ['us', '1949 – 2026?', 'shocked'],
};
const Epilogue: React.FC<{t: number; L: Lay}> = ({t, L}) => {
  const e = (T.epilogue as [number, string, string][]).find(([a], i, arr) => t >= a && t < (arr[i + 1]?.[0] ?? T.question));
  if (!e) return null;
  const [t0, key] = e;
  const [code, text, m] = VERDICT[key];
  const k = popT(t, t0, 11) * lerp(t, t0 + 6.7, t0 + 7, 1, 0);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: L.vert ? 420 : 70, display: 'flex', justifyContent: 'center', zIndex: 12}}>
      <div style={{transform: `scale(${k})`, display: 'flex', alignItems: 'center', gap: 20, background: CREAM, border: `8px solid ${INK}`, borderRadius: 30, padding: '14px 30px 14px 14px', maxWidth: L.vert ? 1000 : 1400}}>
        <Avatar size={L.vert ? 150 : 160} code={key === 'NATO' ? 'eu' : code} mood={m} t={t} seed={key.length} id={`ep-${key}`} />
        <div><div style={{...font, fontSize: L.vert ? 56 : 64, color: RED, lineHeight: 1}}>{key}</div><div style={{...font, fontSize: L.vert ? 38 : 44, color: INK, lineHeight: 1.1}}>{text}</div></div>
      </div>
    </div>
  );
};
const Question: React.FC<{t: number; L: Lay}> = ({t, L}) => {
  const q = T.question as number;
  if (t < q) return null;
  const k = popT(t, q, 11);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 15, background: `rgba(8,18,32,${0.45 * k})`}}>
      <div style={{display: 'flex', gap: 20, marginBottom: 24, transform: `scale(${k})`}}><Avatar size={L.vert ? 200 : 160} code="us" mood="smug" t={t} seed={1} id="q-us" /><Avatar size={L.vert ? 200 : 160} code="gl" mood="angry" t={t} seed={2} id="q-gl" /><Avatar size={L.vert ? 200 : 160} code="dk" mood="sad" t={t} seed={3} id="q-dk" /></div>
      <div style={{transform: `scale(${k}) rotate(-2deg)`, background: '#fff', border: `9px solid ${INK}`, borderRadius: 30, padding: '24px 44px 14px', ...font, fontSize: L.vert ? 96 : 100, color: INK, textAlign: 'center', lineHeight: 1.05, maxWidth: L.vert ? 980 : 1500}}>Was it <span style={{color: RED}}>worth it?</span></div>
      <div style={{marginTop: 28, transform: `scale(${popT(t, q + 0.8, 12)})`, background: YELLOW, border: `6px solid ${INK}`, borderRadius: 24, padding: '8px 34px 2px', ...font, fontSize: L.vert ? 52 : 56, color: INK}}>Who really won? Comment!</div>
    </AbsoluteFill>
  );
};
const Credit: React.FC<{L: Lay}> = ({L}) => <div style={{position: 'absolute', right: 18, bottom: L.vert ? 300 : 12, background: 'rgba(15,25,40,0.65)', color: '#fff', borderRadius: 12, padding: '5px 14px', ...font2, fontWeight: 600, fontSize: 17, zIndex: 20}}>Hypothetical simulation · Based on 2026 events · Numbers approx.</div>;

export const Overlay: React.FC<{t: number; cam: Cam; vp: LVP; L: Lay; hideTitle?: boolean}> = ({t, cam, vp, L, hideTitle}) => (
  <>
    <Labels t={t} cam={cam} vp={vp} L={L} />
    {!cardActive(t) && <Bubbles t={t} cam={cam} vp={vp} L={L} />}
    <Closed t={t} cam={cam} vp={vp} />
    <Hud t={t} L={L} />
    <ChipBar t={t} L={L} />
    <Ticker t={t} L={L} />
    {!(hideTitle && t < 4.2) && <Cards t={t} L={L} />}
    <Results t={t} L={L} />
    <Epilogue t={t} L={L} />
    <Stamp t={t} L={L} />
    <Question t={t} L={L} />
    <Credit L={L} />
  </>
);
export const OceanA: React.FC<{t: number; W: number; H: number}> = ({t, W, H}) => (
  <svg width={W} height={H} style={{position: 'absolute'}}>
    <defs>
      <radialGradient id="seaA" cx="50%" cy="40%" r="80%"><stop offset="0%" stopColor="#3a86c8" /><stop offset="100%" stopColor="#164f86" /></radialGradient>
      <pattern id="wavesA" width={140} height={46} patternUnits="userSpaceOnUse" patternTransform={`translate(${(t * 10.5) % 140},0)`}><path d="M0,23 C17,13 35,13 52,23 S87,33 105,23 S122,13 140,23" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={3} /></pattern>
    </defs>
    <rect width={W} height={H} fill="url(#seaA)" /><rect width={W} height={H} fill="url(#wavesA)" />
  </svg>
);
export const WarGL: React.FC = () => {
  usePreload();
  const t = useCurrentFrame() / 30;
  const cam = camera(t);
  const L: Lay = {W: 1920, H: 1080, vert: false};
  return (
    <AbsoluteFill style={{background: '#164f86', overflow: 'hidden'}}>
      <OceanA t={t} W={1920} H={1080} />
      <ArcticMap t={t} cam={cam} />
      <Overlay t={t} cam={cam} vp={LV0} L={L} />
      <Audio src={staticFile('music8.wav')} />
    </AbsoluteFill>
  );
};
