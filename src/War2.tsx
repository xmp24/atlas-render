import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, spring, staticFile, useCurrentFrame, delayRender, continueRender} from 'remotion';
import map from './mapdata.json';
import eurasia from './eurasia.json';
import TL from './timeline2.json';
import {Flag, FLAG_OF} from './flags';

// ================= fuentes =================
const fontHandle = delayRender('fonts2');
Promise.all([
  new FontFace('Lilita', `url(${staticFile('lilita.woff2')})`).load(),
  new FontFace('Lilita', `url(${staticFile('lilita-ext.woff2')})`, {unicodeRange: 'U+0100-024F'}).load(),
  new FontFace('Fredoka', `url(${staticFile('fredoka600.woff2')})`, {weight: '600'}).load(),
  new FontFace('Fredoka', `url(${staticFile('fredoka700.woff2')})`, {weight: '700'}).load(),
  new FontFace('Fredoka', `url(${staticFile('fredoka600-ext.woff2')})`, {weight: '600', unicodeRange: 'U+0100-024F'}).load(),
  new FontFace('Fredoka', `url(${staticFile('fredoka700-ext.woff2')})`, {weight: '700', unicodeRange: 'U+0100-024F'}).load(),
]).then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(fontHandle); });

// ================= utilidades =================
type P = [number, number];
type Cam = {cx: number; cy: number; s: number};
const S = (sec: number) => Math.round(sec * 30);
const C = map.cities as Record<string, P>;
const byName: Record<string, (typeof map.countries)[number]> = Object.fromEntries(map.countries.map((c) => [c.name, c]));
const INK = '#1d1d1d', CREAM = '#fff6e3', RED = '#e5322d', BLUE = '#1f6fe0', GREEN = '#22a95b', YELLOW = '#ffd23f';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.inOut(Easing.cubic);
const lerp = (f: number, a: number, b: number, v0: number, v1: number, e: (t: number) => number = ease) => interpolate(f, [a, b], [v0, v1], {...clamp, easing: e});
const fmt = (n: number) => Math.round(n).toLocaleString('es-ES').replace(/,/g, '.');
const font = {fontFamily: 'Lilita'};
const font2 = {fontFamily: 'Fredoka', fontWeight: 700} as const;
const toScreen = (p: P, cam: Cam): P => [960 + (p[0] - cam.cx) * cam.s, 540 + (p[1] - cam.cy) * cam.s];
const pop = (f: number, start: number, damping = 12) => (f < start ? 0 : spring({frame: f - start, fps: 30, config: {damping, stiffness: 150}}));

// ================= cámara (mapa de Europa) =================
const CAM: [number, number, number, number][] = [
  [0, 980, 540, 1.0], [180, 1000, 525, 1.1], [690, 980, 545, 1.12], [1080, 985, 540, 1.18],
  [1170, 1075, 478, 2.3], [1350, 1078, 482, 2.45], [1410, 1052, 545, 3.0], [1540, 1050, 545, 3.1],
  [1600, 1080, 414, 3.0], [1780, 1080, 414, 3.1], [1840, 1072, 463, 2.9], [2020, 1072, 466, 3.0],
  [2080, 1060, 515, 2.9], [2260, 1060, 515, 3.0], [2330, 1010, 515, 1.6], [2510, 1000, 520, 1.5],
  [2570, 930, 650, 1.0], [2690, 940, 645, 1.04], [2750, 1022, 540, 3.0], [2920, 1022, 540, 3.1],
  [2980, 1060, 515, 2.8], [3100, 1060, 512, 2.9], [3160, 1074, 440, 2.5], [3290, 1076, 442, 2.6],
  [3340, 1115, 470, 2.0], [3420, 1110, 470, 2.05], [3500, 1000, 515, 1.3], [3600, 1000, 515, 1.28],
];
const HITS = [S(46), ...TL.explosions.map((e) => S(e.t)), S(90), S(114)];
const camera = (f: number): Cam => {
  let i = 0;
  while (i < CAM.length - 2 && f > CAM[i + 1][0]) i++;
  const [fa, xa, ya, sa] = CAM[i], [fb, xb, yb, sb] = CAM[i + 1];
  const t = interpolate(f, [fa, fb], [0, 1], {...clamp, easing: ease});
  let cx = xa + (xb - xa) * t, cy = ya + (yb - ya) * t;
  const s = sa * Math.pow(sb / sa, t);
  for (const h of HITS) {
    const d = f - h;
    if (d >= 0 && d < 12) { const k = ((1 - d / 12) * (h === S(46) || h === S(90) ? 9 : 4)) / s; cx += Math.sin(d * 3.1) * k; cy += Math.cos(d * 2.3) * k; }
  }
  return {cx, cy, s};
};

// ================= guion =================
const CARDS = [
  {from: 200, to: 560, badge: '2027', text: 'Moscú: reunión secreta de Rusia, Bielorrusia y Corea del Norte', tag: 'PLAN SECRETO', color: '#7b2cbf'},
  {from: 560, to: 712, badge: '2027', text: 'Corea del Norte envía tropas por el Transiberiano', tag: 'REFUERZOS', color: '#7b2cbf'},
  {from: 1100, to: 1380, badge: '2027', text: 'Las tropas del eje se concentran en la frontera', tag: 'TENSIÓN', color: '#ff8a1f'},
  {from: 1380, to: 1560, badge: 'DÍA 1', text: 'Bielorrusia y Kaliningrado cortan el corredor de Suwałki', tag: 'INVASIÓN', color: RED},
  {from: 1560, to: 1800, badge: 'DÍA 2', text: 'Rusia entra en Estonia por Narva', tag: 'INVASIÓN', color: RED},
  {from: 1800, to: 2040, badge: 'DÍA 4', text: 'Las columnas rusas avanzan sobre Letonia', tag: 'INVASIÓN', color: RED},
  {from: 2040, to: 2280, badge: 'DÍA 7', text: 'Lituania, atacada desde dos frentes', tag: 'INVASIÓN', color: RED},
  {from: 2280, to: 2400, badge: 'DÍA 10', text: 'Los tres países bálticos, ocupados', tag: 'OCUPADOS', color: RED},
  {from: 2400, to: 2520, badge: 'DÍA 12', text: 'Europa responde: la OTAN activa el artículo 5', tag: 'OTAN', color: BLUE},
  {from: 2520, to: 2700, badge: 'DÍA 13', text: 'Europa moviliza sus ejércitos hacia Polonia', tag: 'MOVILIZACIÓN', color: BLUE},
  {from: 2700, to: 2940, badge: 'DÍA 45', text: 'Contraofensiva: Polonia y Alemania toman Kaliningrado', tag: 'CONTRAATAQUE', color: BLUE},
  {from: 2940, to: 3120, badge: 'DÍA 55', text: 'Las tropas europeas liberan Lituania', tag: 'LIBERADA', color: GREEN},
  {from: 3120, to: 3300, badge: 'DÍA 68', text: 'Finlandia y Suecia ayudan a liberar Letonia y Estonia', tag: 'LIBERADAS', color: GREEN},
  {from: 3300, to: 3420, badge: 'DÍA 80', text: 'Rusia, sin salida, pide un alto el fuego', tag: 'PAZ', color: GREEN},
];
const LOCATIONS: [number, string][] = [
  [0, 'EUROPA'], [180, 'MOSCÚ, RUSIA'], [720, 'EUROPA'], [1080, 'FRONTERA BÁLTICA'], [1380, 'CORREDOR DE SUWAŁKI'],
  [1560, 'ESTONIA'], [1800, 'LETONIA'], [2040, 'LITUANIA'], [2280, 'EUROPA'], [2700, 'KALININGRADO'],
  [2940, 'LITUANIA'], [3120, 'LETONIA Y ESTONIA'], [3300, 'FRONTERA BÁLTICA'], [3420, 'EUROPA'],
];
const DAYS: [number, number][] = [[1380, 1], [1560, 2], [1800, 4], [2040, 7], [2280, 10], [2400, 12], [2520, 13], [2700, 45], [2940, 55], [3120, 68], [3300, 80]];
const warDay = (f: number) => {
  if (f < DAYS[0][0]) return 0;
  for (let i = 0; i < DAYS.length - 1; i++) if (f < DAYS[i + 1][0]) return lerp(f, DAYS[i][0], DAYS[i + 1][0], DAYS[i][1], DAYS[i + 1][1], Easing.linear);
  return 80;
};
const casualties = (d: number) => {
  const seg = (r1: number, r2: number, r3: number) => (d <= 12 ? r1 * d : d <= 45 ? r1 * 12 + r2 * (d - 12) : r1 * 12 + r2 * 33 + r3 * (d - 45));
  return {ru: seg(2500, 2250, 3500), eu: seg(3500, 2250, 1750)};
};

// Ocupación y liberación de cada territorio (segundos)
type Take = {name: string; code: string; km2: number; label: string; occ: {p: P; r: number}[]; o0: number; o1: number; lib: {p: P; r: number}[]; l0: number; l1: number};
const TAKES: Take[] = [
  {name: 'Estonia', code: 'ru', km2: 45339, label: 'ESTONIA', occ: [{p: [1118, 385], r: 112}, {p: [1110, 425], r: 90}], o0: 53.5, o1: 58.8, lib: [{p: [1060, 345], r: 120}, {p: [1010, 400], r: 70}], l0: 104.5, l1: 109.5},
  {name: 'Latvia', code: 'ru', km2: 64589, label: 'LETONIA', occ: [{p: [1132, 455], r: 128}, {p: [1130, 492], r: 90}], o0: 61.5, o1: 66.8, lib: [{p: [1035, 505], r: 130}, {p: [1050, 420], r: 80}], l0: 104.8, l1: 109.8},
  {name: 'Lithuania', code: 'ru', km2: 65300, label: 'LITUANIA', occ: [{p: [1112, 540], r: 112}, {p: [1040, 530], r: 45}], o0: 69.5, o1: 74.8, lib: [{p: [1045, 560], r: 110}, {p: [1005, 515], r: 60}], l0: 98.5, l1: 103.5},
];
const CORRIDOR = {occ: [{p: [1062, 556] as P, r: 40}, {p: [1030, 538] as P, r: 28}], o0: 46.5, o1: 49.5, lib: [{p: [1040, 605] as P, r: 110}], l0: 91.5, l1: 94};
const KAL = {occ: [{p: [1046, 549] as P, r: 75}, {p: [972, 540] as P, r: 55}], o0: 91.0, o1: 95.0};
const prog = (f: number, a: number, b: number) => lerp(f, S(a), S(b), 0, 1, Easing.inOut(Easing.quad));
type Status = 'libre' | 'atacada' | 'ocupada' | 'liberando' | 'liberada';
const statusOf = (t: Take, f: number): Status => {
  if (f < S(t.o0)) return 'libre';
  if (f < S(t.o1)) return 'atacada';
  if (f < S(t.l0)) return 'ocupada';
  if (f < S(t.l1)) return 'liberando';
  return 'liberada';
};
const occupiedKm2 = (f: number) => TAKES.reduce((s, t) => s + t.km2 * prog(f, t.o0, t.o1) * (1 - prog(f, t.l0, t.l1)), 0);
const BALTIC = TAKES.reduce((s, t) => s + t.km2, 0);

// ================= piezas comunes =================
const Ocean: React.FC<{f: number}> = ({f}) => (
  <svg width={1920} height={1080} style={{position: 'absolute'}}>
    <defs>
      <radialGradient id="sea2" cx="50%" cy="45%" r="75%"><stop offset="0%" stopColor="#3f97d6" /><stop offset="100%" stopColor="#1d5e9f" /></radialGradient>
      <pattern id="waves2" width={140} height={46} patternUnits="userSpaceOnUse" patternTransform={`translate(${(f * 0.35) % 140},0)`}>
        <path d="M0,23 C17,13 35,13 52,23 S87,33 105,23 S122,13 140,23" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={3} />
      </pattern>
    </defs>
    <rect width={1920} height={1080} fill="url(#sea2)" />
    <rect width={1920} height={1080} fill="url(#waves2)" />
  </svg>
);

type Mood = 'calm' | 'angry' | 'scared' | 'happy' | 'sad' | 'smug';
const Face: React.FC<{x: number; y: number; r: number; mood: Mood; f: number; seed: number; look?: P}> = ({x, y, r, mood, f, seed, look = [0, 0]}) => {
  const blink = (f + seed * 37) % 110 < 4 ? 0.12 : 1;
  const bob = Math.sin((f + seed * 11) / 14) * r * 0.04;
  const shake = mood === 'scared' ? Math.sin(f * 1.7 + seed) * r * 0.04 : 0;
  const ew = r * 0.42, eh = r * 0.5 * blink, ex = r * 0.48, sw = r * 0.09;
  const pr = mood === 'scared' ? r * 0.12 : r * 0.2;
  const angry = mood === 'angry';
  return (
    <g transform={`translate(${x + shake},${y + bob})`}>
      {(mood === 'happy' || mood === 'calm' || mood === 'smug') && [-1, 1].map((sd) => <ellipse key={sd} cx={sd * (ex + r * 0.15)} cy={r * 0.5} rx={r * 0.2} ry={r * 0.11} fill="#ff7fa6" opacity={0.75} />)}
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <ellipse cx={sd * ex} cy={0} rx={ew} ry={eh} fill={angry ? '#fff2f0' : '#fff'} stroke={INK} strokeWidth={sw} />
          {blink > 0.5 && <circle cx={sd * ex + look[0] * ew * 0.35} cy={look[1] * eh * 0.3 + (angry ? r * 0.06 : 0)} r={pr} fill={angry ? '#c0141a' : INK} />}
          {blink > 0.5 && angry && <circle cx={sd * ex + look[0] * ew * 0.35} cy={look[1] * eh * 0.3 + r * 0.06} r={pr * 0.5} fill={INK} />}
          {angry && <path d={`M${sd * (ex + ew * 1.1)},${-eh * 1.15} L${sd * (ex - ew * 0.9)},${-eh * 0.55}`} stroke={INK} strokeWidth={sw * 1.6} strokeLinecap="round" />}
          {mood === 'smug' && <path d={`M${sd * (ex + ew)},${-eh * 0.95} L${sd * (ex - ew)},${-eh * 0.75}`} stroke={INK} strokeWidth={sw * 1.4} strokeLinecap="round" />}
          {mood === 'smug' && blink > 0.5 && <rect x={sd * ex - ew} y={-eh * 1.05} width={ew * 2} height={eh * 0.75} fill={angry ? '#fff2f0' : '#fff'} stroke="none" />}
          {mood === 'sad' && <path d={`M${sd * (ex + ew)},${-eh * 0.6} L${sd * (ex - ew * 0.8)},${-eh * 1.2}`} stroke={INK} strokeWidth={sw * 1.4} strokeLinecap="round" />}
          {mood === 'scared' && <path d={`M${sd * (ex + ew * 0.9)},${-eh * 1.25} Q${sd * ex},${-eh * 1.6} ${sd * (ex - ew * 0.9)},${-eh * 1.25}`} fill="none" stroke={INK} strokeWidth={sw * 1.2} strokeLinecap="round" />}
        </g>
      ))}
      {mood === 'happy' && <path d={`M${-r * 0.35},${r * 0.55} Q0,${r * 1.05} ${r * 0.35},${r * 0.55} Z`} fill="#8c1d2c" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />}
      {mood === 'calm' && <path d={`M${-r * 0.22},${r * 0.62} Q0,${r * 0.82} ${r * 0.22},${r * 0.62}`} fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />}
      {mood === 'smug' && <path d={`M${-r * 0.3},${r * 0.62} Q${r * 0.05},${r * 0.85} ${r * 0.35},${r * 0.5}`} fill="none" stroke={INK} strokeWidth={sw * 1.1} strokeLinecap="round" />}
      {angry && <path d={`M${-r * 0.3},${r * 0.75} Q0,${r * 0.55} ${r * 0.3},${r * 0.75}`} fill="none" stroke={INK} strokeWidth={sw * 1.2} strokeLinecap="round" />}
      {mood === 'sad' && <path d={`M${-r * 0.28},${r * 0.8} Q0,${r * 0.55} ${r * 0.28},${r * 0.8}`} fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />}
      {mood === 'scared' && <ellipse cx={0} cy={r * 0.7} rx={r * 0.13} ry={r * 0.17} fill="#5a1220" stroke={INK} strokeWidth={sw} />}
    </g>
  );
};

const Arrow: React.FC<{a: P; b: P; bend: number; f: number; start: number; end: number; color: string; w: number}> = ({a, b, bend, f, start, end, color, w}) => {
  if (f < start) return null;
  const p = lerp(f, start, end, 0, 1, Easing.out(Easing.quad));
  const fade = lerp(f, end + 75, end + 105, 1, 0);
  if (fade <= 0) return null;
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
  const c: P = [(a[0] + b[0]) / 2 - (dy / len) * bend, (a[1] + b[1]) / 2 + (dx / len) * bend];
  const pt = (t: number): P => [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]];
  const pts: P[] = [];
  for (let i = 0; i <= 30; i++) pts.push(pt((i / 30) * p));
  const tip = pts[pts.length - 1], prev = pt(Math.max(0, p - 0.04));
  const ang = Math.atan2(tip[1] - prev[1], tip[0] - prev[0]);
  const hl = w * 2.4, hw = w * 1.9;
  const head = `M${tip[0] + Math.cos(ang) * hl * 0.6},${tip[1] + Math.sin(ang) * hl * 0.6} L${tip[0] + Math.cos(ang + 2.4) * hw},${tip[1] + Math.sin(ang + 2.4) * hw} L${tip[0] + Math.cos(ang - 2.4) * hw},${tip[1] + Math.sin(ang - 2.4) * hw} Z`;
  const d = 'M' + pts.map((q) => q.join(',')).join(' L');
  return (
    <g opacity={fade}>
      <path d={d} fill="none" stroke={INK} strokeWidth={w * 1.6} strokeLinecap="round" strokeLinejoin="round" />
      <path d={head} fill={INK} stroke={INK} strokeWidth={w * 0.6} strokeLinejoin="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      <path d={head} fill={color} />
    </g>
  );
};

const Explosion: React.FC<{p: P; f: number; at: number; r: number}> = ({p, f, at, r}) => {
  const d = f - at;
  if (d < 0 || d > 28) return null;
  const k = d / 28, rr = r * (0.3 + Math.sqrt(k) * 1.1);
  const star = Array.from({length: 20}).map((_, i) => {
    const a = (i / 20) * Math.PI * 2 + at, rad = i % 2 ? rr * 0.55 : rr;
    return `${p[0] + Math.cos(a) * rad},${p[1] + Math.sin(a) * rad}`;
  }).join(' ');
  return (
    <g opacity={1 - k * k}>
      <circle cx={p[0]} cy={p[1]} r={rr * 1.35} fill="#5a5a5a" opacity={0.35 * k} />
      <polygon points={star} fill="#ff8a1f" stroke={INK} strokeWidth={r * 0.08} strokeLinejoin="round" />
      <circle cx={p[0]} cy={p[1]} r={rr * 0.45} fill="#ffe14d" />
    </g>
  );
};

// ficha de ejército (tamaño constante en pantalla)
const Token: React.FC<{p: P; code: string; inv: number; alpha?: number; label?: string}> = ({p, code, inv, alpha = 1, label}) => (
  <g transform={`translate(${p[0]},${p[1]}) scale(${inv})`} opacity={alpha}>
    <rect x={-40} y={-20} width={80} height={40} rx={10} fill={CREAM} stroke={INK} strokeWidth={4} />
    <svg x={-34} y={-13} width={30} height={26}><Flag code={code} w={30} h={26} /></svg>
    <rect x={-34} y={-13} width={30} height={26} fill="none" stroke={INK} strokeWidth={2} />
    <g transform="translate(18,2)">
      <rect x={-14} y={-2} width={28} height={10} rx={3} fill="#4a5a3a" stroke={INK} strokeWidth={2} />
      <rect x={-7} y={-9} width={14} height={8} rx={3} fill="#4a5a3a" stroke={INK} strokeWidth={2} />
      <rect x={6} y={-7} width={13} height={3} fill={INK} />
    </g>
    {label && <text y={40} textAnchor="middle" fontFamily="Lilita" fontSize={20} fill="#fff" stroke={INK} strokeWidth={5} paintOrder="stroke">{label}</text>}
  </g>
);

// ================= interfaz =================
const LocationPill: React.FC<{f: number}> = ({f}) => {
  let cur = LOCATIONS[0];
  for (const l of LOCATIONS) if (f >= l[0]) cur = l;
  const k = f - cur[0] < 12 ? pop(f, cur[0], 12) : 1;
  return (
    <div style={{position: 'absolute', left: 34, top: 30, display: 'flex', alignItems: 'center', gap: 12, background: INK, color: '#fff', padding: '12px 26px 12px 20px', borderRadius: 40, boxShadow: '0 6px 0 rgba(0,0,0,0.3)', transform: `scale(${0.85 + 0.15 * k})`, transformOrigin: 'left center', ...font, fontSize: 32, letterSpacing: 1}}>
      <svg width={22} height={30} viewBox="0 0 22 30"><path d="M11,0 C4.9,0 0,4.9 0,11 C0,19 11,30 11,30 C11,30 22,19 22,11 C22,4.9 17.1,0 11,0 Z" fill={YELLOW} /><circle cx={11} cy={11} r={4.5} fill={INK} /></svg>
      {cur[1]}
    </div>
  );
};

const Card: React.FC<{f: number}> = ({f}) => {
  const card = CARDS.find((c) => f >= c.from && f < c.to);
  if (!card) return null;
  const inn = pop(f, card.from, 14);
  const out = lerp(f, card.to - 8, card.to, 0, 1);
  const y = interpolate(inn, [0, 1], [-170, 0]) - out * 170;
  return (
    <div style={{position: 'absolute', top: 96, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `translateY(${y}px) rotate(${-0.6 + inn * 0.6}deg)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 20, background: CREAM, border: `6px solid ${INK}`, borderRadius: 22, padding: '12px 16px 12px 12px', boxShadow: '0 8px 0 rgba(0,0,0,0.35)', maxWidth: 1820}}>
        <div style={{background: INK, color: YELLOW, ...font, fontSize: 48, padding: '6px 18px 2px', borderRadius: 12, whiteSpace: 'nowrap'}}>{card.badge}</div>
        <div style={{...font2, fontSize: 38, color: INK, whiteSpace: 'nowrap'}}>{card.text}</div>
        <div style={{background: card.color, color: '#fff', ...font, fontSize: 28, padding: '8px 18px 4px', borderRadius: 30, border: `4px solid ${INK}`, boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.2)', whiteSpace: 'nowrap', transform: `scale(${0.6 + 0.4 * pop(f, card.from + 6, 9)})`}}>{card.tag}</div>
      </div>
    </div>
  );
};

const BubbleAt: React.FC<{f: number; from: number; to: number; sx: number; sy: number; text: string; size?: number}> = ({f, from, to, sx, sy, text, size = 34}) => {
  if (f < from || f > to) return null;
  const k = pop(f, from, 10) * lerp(f, to - 6, to, 1, 0);
  return (
    <div style={{position: 'absolute', left: sx, top: sy, transform: `translate(-50%,-100%) scale(${k})`, transformOrigin: '50% 100%', zIndex: 5}}>
      <div style={{background: '#fff', border: `5px solid ${INK}`, borderRadius: 16, padding: '10px 22px', ...font2, fontSize: size, color: INK, whiteSpace: 'nowrap', boxShadow: '0 6px 0 rgba(0,0,0,0.3)'}}>{text}</div>
      <svg width={36} height={24} style={{position: 'absolute', left: '50%', marginLeft: -18, bottom: -19}}><path d="M2,0 L18,22 L34,0" fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><rect x={4} y={-6} width={28} height={7} fill="#fff" /></svg>
    </div>
  );
};

const MiniFlag: React.FC<{code: string; w?: number; h?: number}> = ({code, w = 54, h = 36}) => (
  <svg width={w} height={h} style={{borderRadius: 5, border: `3px solid ${INK}`, flexShrink: 0, display: 'block'}}><Flag code={code} w={w} h={h} /></svg>
);

const STATUS_STYLE: Record<Status, [string, string]> = {
  libre: ['LIBRE', '#8a8a8a'], atacada: ['BAJO ATAQUE', '#ff8a1f'], ocupada: ['OCUPADA', RED], liberando: ['COMBATES', '#ff8a1f'], liberada: ['LIBERADA', GREEN],
};

const StatsPanel: React.FC<{f: number}> = ({f}) => {
  if (f < 1385 || f > 3440) return null;
  const k = pop(f, 1385, 14) * lerp(f, 3420, 3440, 1, 0);
  const c = casualties(warDay(f));
  const row = (code: string, name: string, val: number, color: string) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 14, height: 52}}>
      <MiniFlag code={code} />
      <div style={{...font2, fontSize: 26, color: INK, width: 300, whiteSpace: 'nowrap'}}>{name}</div>
      <div style={{...font, fontSize: 42, color, minWidth: 180, textAlign: 'right'}}>{fmt(val)}</div>
    </div>
  );
  return (
    <div style={{position: 'absolute', left: 34, bottom: 70, transform: `translateY(${(1 - k) * 280}px)`}}>
      <div style={{position: 'absolute', top: -26, left: 24, background: YELLOW, border: `4px solid ${INK}`, borderRadius: 12, padding: '4px 14px 0', ...font, fontSize: 23, color: INK, zIndex: 2}}>BAJAS · MUERTOS Y HERIDOS</div>
      <div style={{background: CREAM, border: `6px solid ${INK}`, borderRadius: 20, padding: '22px 24px 10px', boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>
        {row('ru', 'RUSIA + ALIADOS', c.ru, '#c0221d')}
        {row('eu', 'EUROPA', c.eu, '#1557c0')}
      </div>
    </div>
  );
};

const BalancePanel: React.FC<{f: number}> = ({f}) => {
  if (f < 1400 || f > 3440) return null;
  const k = pop(f, 1400, 14) * lerp(f, 3420, 3440, 1, 0);
  const occ = occupiedKm2(f);
  const kalTaken = f >= S(KAL.o1);
  const kalFight = f >= S(KAL.o0) && !kalTaken;
  const rows: {code: string; name: string; st: [string, string]}[] = [
    ...TAKES.map((t) => ({code: FLAG_OF[t.name], name: t.label, st: STATUS_STYLE[statusOf(t, f)]})),
    {code: 'ru', name: 'KALININGRADO', st: kalTaken ? ['TOMADO', BLUE] : kalFight ? ['COMBATES', '#ff8a1f'] : ['RUSO', '#8a8a8a']},
  ];
  return (
    <div style={{position: 'absolute', right: 34, top: 210, width: 420, transform: `translateX(${(1 - k) * 500}px)`}}>
      <div style={{background: CREAM, border: `6px solid ${INK}`, borderRadius: 20, padding: '14px 20px', boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>
        <div style={{...font, fontSize: 30, color: INK, textAlign: 'center', marginBottom: 6}}>BALANCE</div>
        {rows.map((r) => (
          <div key={r.name} style={{display: 'flex', alignItems: 'center', gap: 12, height: 46}}>
            <MiniFlag code={r.code} w={44} h={30} />
            <div style={{...font2, fontSize: 24, color: INK, flex: 1}}>{r.name}</div>
            <div style={{...font, fontSize: 21, color: '#fff', background: r.st[1], border: `3px solid ${INK}`, borderRadius: 20, padding: '4px 12px 0', whiteSpace: 'nowrap'}}>{r.st[0]}</div>
          </div>
        ))}
        <div style={{height: 3, background: '#d9caa6', margin: '8px 0'}} />
        <div style={{...font2, fontSize: 20, color: '#555'}}>Territorio ocupado por Rusia</div>
        <div style={{...font, fontSize: 40, color: occ > 100 ? '#c0221d' : GREEN}}>{fmt(occ)} km²</div>
        <div style={{height: 20, background: '#e6d9bd', border: `4px solid ${INK}`, borderRadius: 12, overflow: 'hidden', marginTop: 4}}>
          <div style={{width: `${(occ / BALTIC) * 100}%`, height: '100%', background: RED}} />
        </div>
      </div>
    </div>
  );
};

const Footer = () => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 44, background: 'rgba(15,25,40,0.92)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', ...font2, fontWeight: 600, fontSize: 21, zIndex: 20}}>
    Simulación hipotética · Datos: Global Firepower 2026, SIPRI 2025 · Mapa: Natural Earth
  </div>
);

// ================= mapa de Europa =================
type Country = (typeof map.countries)[number];
const pid = (n: string) => n.replace(/\W/g, '');
const FlagPattern: React.FC<{id: string; code: string; box: number[]}> = ({id, code, box}) => {
  const [x0, y0, x1, y1] = box;
  return <pattern id={id} patternUnits="userSpaceOnUse" x={x0} y={y0} width={x1 - x0} height={y1 - y0}><Flag code={code} w={x1 - x0} h={y1 - y0} /></pattern>;
};
const flagBox = (c: Country) => (c.name === 'Russia' ? [1110, 160, 1900, 760] : c.bbox);
const KEY = new Set(['Estonia', 'Latvia', 'Lithuania', 'Poland', 'Belarus', 'Russia', 'Kaliningrad', 'Finland']);

const FACES: {name: string; label: string; p: P; r: number; seed: number}[] = [
  {name: 'Russia', label: 'RUSIA', p: [1215, 425], r: 30, seed: 1},
  {name: 'Belarus', label: 'BIELORRUSIA', p: [1140, 548], r: 16, seed: 2},
  {name: 'Poland', label: 'POLONIA', p: [986, 600], r: 20, seed: 3},
  {name: 'Lithuania', label: 'LITUANIA', p: [1066, 508], r: 10, seed: 4},
  {name: 'Latvia', label: 'LETONIA', p: [1077, 458], r: 10, seed: 5},
  {name: 'Estonia', label: 'ESTONIA', p: [1084, 402], r: 9, seed: 6},
  {name: 'Finland', label: 'FINLANDIA', p: [1075, 300], r: 16, seed: 7},
  {name: 'Sweden', label: 'SUECIA', p: [935, 330], r: 14, seed: 8},
  {name: 'Germany', label: 'ALEMANIA', p: byName.Germany.c as P, r: 18, seed: 9},
  {name: 'France', label: 'FRANCIA', p: byName.France.c as P, r: 20, seed: 10},
  {name: 'Spain', label: 'ESPAÑA', p: byName.Spain.c as P, r: 20, seed: 11},
  {name: 'United Kingdom', label: 'REINO UNIDO', p: [700, 560], r: 14, seed: 12},
  {name: 'Italy', label: 'ITALIA', p: [880, 800], r: 15, seed: 13},
];
const moodOf = (name: string, f: number): {mood: Mood; look?: P} => {
  const t = TAKES.find((x) => x.name === name);
  if (t) {
    const st = statusOf(t, f);
    if (st === 'liberada' || (st === 'liberando' && f > S(t.l0) + 60)) return {mood: 'happy', look: [0, 0]};
    if (f < 1100) return {mood: 'calm'};
    return {mood: 'scared', look: [0.8, 0]};
  }
  switch (name) {
    case 'Russia': return f < 1100 ? {mood: 'smug', look: [-1, 0]} : f < S(90) ? {mood: f > 2280 && f < 2400 ? 'smug' : 'angry', look: [-1, 0.2]} : f < S(110) ? {mood: 'scared', look: [-1, 0]} : {mood: 'sad', look: [0, 0.5]};
    case 'Belarus': return f < 1100 ? {mood: 'calm'} : f < S(90) ? {mood: 'angry', look: [-1, -0.2]} : {mood: 'scared', look: [-1, 0]};
    case 'Poland': return f < 1380 ? {mood: 'calm'} : f < 1450 ? {mood: 'scared', look: [1, -0.5]} : {mood: 'angry', look: [1, -0.6]};
    case 'Finland': return f < 2400 ? {mood: 'calm', look: [0.3, 0.8]} : f < S(110) ? {mood: 'angry', look: [0.2, 0.8]} : {mood: 'happy'};
    default: return f < 2290 ? {mood: 'calm'} : f < 2400 ? {mood: 'scared', look: [1, 0]} : f < S(110) ? {mood: 'angry', look: [1, -0.3]} : {mood: 'happy'};
  }
};

// refuerzos europeos (movilización)
const REINF: {code: string; from: P; to: P; d: number}[] = [
  {code: 'es', from: byName.Spain.c as P, to: [978, 612], d: 0},
  {code: 'fr', from: byName.France.c as P, to: [1000, 590], d: 10},
  {code: 'it', from: [880, 790], to: [990, 640], d: 18},
  {code: 'gb', from: [700, 560], to: [960, 580], d: 6},
  {code: 'de', from: byName.Germany.c as P, to: [1015, 572], d: 14},
  {code: 'nl', from: [770, 585], to: [955, 600], d: 22},
];

const EuropeMap: React.FC<{f: number; cam: Cam}> = ({f, cam}) => {
  const {cx, cy, s} = cam;
  const inv = 1 / s;
  const tf = `translate(960,540) scale(${s}) translate(${-cx},${-cy})`;
  const blob = (list: {p: P; r: number}[], k: number, fill: string, key: string) => list.flatMap((c, i) => [0, 1, 2].map((j) => {
    const a = i * 2.1 + j * 2.09, r = c.r * k;
    return <circle key={`${key}${i}-${j}`} cx={c.p[0] + Math.cos(a) * r * 0.1} cy={c.p[1] + Math.sin(a) * r * 0.1} r={Math.max(0, r * (0.95 - j * 0.04))} fill={fill} />;
  }));
  const BIG = {x: -600, y: -600, width: 3120, height: 2280};
  const pulse = 0.5 + 0.5 * Math.sin(f / 5);

  return (
    <svg width={1920} height={1080} style={{position: 'absolute'}}>
      <defs>
        {map.countries.map((c) => (FLAG_OF[c.name] ? <FlagPattern key={c.name} id={`fl-${pid(c.name)}`} code={FLAG_OF[c.name]} box={flagBox(c)} /> : null))}
        {TAKES.map((t) => <FlagPattern key={t.name} id={`occ-${t.name}`} code="ru" box={byName[t.name].bbox} />)}
        <FlagPattern id="occ-corr" code="ru" box={[1010, 520, 1090, 575]} />
        <clipPath id="land2">{map.countries.map((c) => <path key={c.name} d={c.d} />)}</clipPath>
        {[...TAKES.map((t) => t.name), 'Poland', 'Kaliningrad'].map((n) => <clipPath key={n} id={`cl-${n}`}><path d={byName[n].d} /></clipPath>)}
        {TAKES.map((t) => (
          <mask key={t.name} id={`m-${t.name}`} maskUnits="userSpaceOnUse" {...BIG}>
            <rect {...BIG} fill="black" />
            {blob(t.occ, prog(f, t.o0, t.o1), 'white', 'o')}
            {blob(t.lib, prog(f, t.l0, t.l1), 'black', 'l')}
          </mask>
        ))}
        <mask id="m-corr" maskUnits="userSpaceOnUse" {...BIG}>
          <rect {...BIG} fill="black" />
          {blob(CORRIDOR.occ, prog(f, CORRIDOR.o0, CORRIDOR.o1), 'white', 'c')}
          {blob(CORRIDOR.lib, prog(f, CORRIDOR.l0, CORRIDOR.l1), 'black', 'cl')}
        </mask>
        <mask id="m-kal" maskUnits="userSpaceOnUse" {...BIG}>
          <rect {...BIG} fill="black" />
          {blob(KAL.occ, prog(f, KAL.o0, KAL.o1), 'white', 'k')}
        </mask>
      </defs>
      <g transform={tf}>
        <g transform="translate(2.5,3.5)" opacity={0.3}>{map.countries.map((c) => <path key={c.name} d={c.d} fill="#06213f" />)}</g>
        {map.countries.map((c) => <path key={c.name} d={c.d} fill={FLAG_OF[c.name] ? `url(#fl-${pid(c.name)})` : '#efe3c8'} />)}
        {/* ocupación */}
        {TAKES.map((t) => <g key={t.name} mask={`url(#m-${t.name})`}><path d={byName[t.name].d} fill={`url(#occ-${t.name})`} /></g>)}
        <g mask="url(#m-corr)"><path d={byName.Poland.d} fill="url(#occ-corr)" /></g>
        <g mask="url(#m-kal)"><path d={byName.Kaliningrad.d} fill="#2b6fd6" /><path d={byName.Kaliningrad.d} fill="url(#fl-Poland)" opacity={0} /></g>
        <image href={staticFile('relief.png')} {...BIG} preserveAspectRatio="none" clipPath="url(#land2)" opacity={0.35} />
        {/* frentes: borde de avance dentro del país */}
        {TAKES.map((t) => {
          const po = prog(f, t.o0, t.o1), pl = prog(f, t.l0, t.l1);
          const occFront = po > 0 && po < 1, libFront = pl > 0 && pl < 1;
          if (!occFront && !libFront) return null;
          const list = occFront ? t.occ : t.lib, k = occFront ? po : pl, col = occFront ? RED : BLUE;
          return (
            <g key={t.name} clipPath={`url(#cl-${t.name})`}>
              {list.map((c, i) => <circle key={i} cx={c.p[0]} cy={c.p[1]} r={c.r * k * 0.95} fill="none" stroke={col} strokeWidth={5} vectorEffect="non-scaling-stroke" strokeDasharray="10 7" />)}
            </g>
          );
        })}
        {/* fronteras: todas marcadas y más gruesas en los países clave */}
        {map.countries.map((c) => <path key={c.name} d={c.d} fill="none" stroke={INK} strokeOpacity={KEY.has(c.name) ? 0.95 : 0.75} strokeWidth={KEY.has(c.name) ? 3.2 : 2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />)}
        {/* resaltado del país atacado / ocupado / liberado */}
        {TAKES.map((t) => {
          const st = statusOf(t, f);
          let col = '', w = 0, op = 1;
          if (st === 'atacada') { col = RED; w = 5 + pulse * 4; }
          else if (st === 'ocupada') { col = RED; w = 4.5; op = 0.9; }
          else if (st === 'liberando') { col = BLUE; w = 5 + pulse * 4; }
          else if (st === 'liberada' && f < S(t.l1) + 120) { col = GREEN; w = 6; op = lerp(f, S(t.l1) + 80, S(t.l1) + 120, 1, 0); }
          if (!col) return null;
          return <path key={t.name} d={byName[t.name].d} fill="none" stroke={col} strokeOpacity={op} strokeWidth={w} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />;
        })}
        {f >= S(KAL.o0) && f < S(KAL.o1) + 120 && <path d={byName.Kaliningrad.d} fill="none" stroke={f < S(KAL.o1) ? BLUE : GREEN} strokeWidth={5 + pulse * 3} vectorEffect="non-scaling-stroke" />}
        {f >= S(CORRIDOR.o0) && f < S(CORRIDOR.l1) && (() => {
          const k = prog(f, CORRIDOR.o0, CORRIDOR.o1) * (1 - prog(f, CORRIDOR.l0, CORRIDOR.l1));
          return k > 0.05 ? <g clipPath="url(#cl-Poland)" opacity={k}>{CORRIDOR.occ.map((c, i) => <circle key={i} cx={c.p[0]} cy={c.p[1]} r={c.r * 0.95} fill="none" stroke={RED} strokeWidth={4} vectorEffect="non-scaling-stroke" strokeDasharray="9 6" />)}</g> : null;
        })()}
        {/* concentración de tropas */}
        {f > 1130 && f < 1440 && ([[1150, 395, 'ru'], [1155, 445, 'ru'], [1165, 500, 'ru'], [1112, 565, 'by'], [1138, 528, 'by'], [1020, 528, 'ru'], [1185, 470, 'kp']] as [number, number, string][]).map(([x, y, code], i) => {
          const a = lerp(f, 1140 + i * 14, 1160 + i * 14, 0, 1) * lerp(f, 1410, 1440, 1, 0);
          const dy = (1 - lerp(f, 1140 + i * 14, 1165 + i * 14, 0, 1, Easing.out(Easing.back(2)))) * -30 * inv;
          return <Token key={i} p={[x, y + dy]} code={code} inv={inv * 0.9} alpha={a} />;
        })}
        {/* refuerzos europeos */}
        {f > 2530 && f < 2725 && REINF.map((r, i) => {
          const t = lerp(f, 2540 + r.d, 2660 + r.d, 0, 1, Easing.inOut(Easing.quad));
          const p: P = [r.from[0] + (r.to[0] - r.from[0]) * t, r.from[1] + (r.to[1] - r.from[1]) * t];
          const a = lerp(f, 2530 + r.d, 2545 + r.d, 0, 1) * lerp(f, 2695, 2722, 1, 0);
          return (
            <g key={i}>
              <path d={`M${r.from[0]},${r.from[1]} L${p[0]},${p[1]}`} stroke={BLUE} strokeWidth={4} strokeDasharray="10 8" vectorEffect="non-scaling-stroke" opacity={a * 0.9} />
              <Token p={p} code={r.code} inv={inv * 0.85} alpha={a} />
            </g>
          );
        })}
        {/* flechas */}
        <Arrow a={[1095, 572]} b={[1048, 551]} bend={-8} f={f} start={S(46.3)} end={S(47.5)} color={RED} w={4.5} />
        <Arrow a={[1012, 534]} b={[1040, 548]} bend={6} f={f} start={S(46.8)} end={S(48.3)} color={RED} w={4.5} />
        <Arrow a={[1150, 390]} b={[1095, 394]} bend={-6} f={f} start={S(53)} end={S(54.5)} color={RED} w={4.5} />
        <Arrow a={[1095, 394]} b={[1045, 400]} bend={-8} f={f} start={S(55)} end={S(57.5)} color={RED} w={4.5} />
        <Arrow a={[1152, 446]} b={[1095, 455]} bend={8} f={f} start={S(61)} end={S(62.5)} color={RED} w={4.5} />
        <Arrow a={[1162, 502]} b={[1103, 490]} bend={-6} f={f} start={S(61.5)} end={S(63)} color={RED} w={4.5} />
        <Arrow a={[1095, 455]} b={[1060, 462]} bend={6} f={f} start={S(63.2)} end={S(64.8)} color={RED} w={4.5} />
        <Arrow a={[1135, 548]} b={[1086, 528]} bend={-6} f={f} start={S(69)} end={S(70.3)} color={RED} w={4.5} />
        <Arrow a={[1024, 532]} b={[1062, 523]} bend={6} f={f} start={S(69.5)} end={S(70.8)} color={RED} w={4.5} />
        <Arrow a={[1086, 528]} b={[1035, 505]} bend={-8} f={f} start={S(71)} end={S(72.5)} color={RED} w={4.5} />
        <Arrow a={[966, 548]} b={[1000, 535]} bend={-6} f={f} start={S(91)} end={S(92)} color={BLUE} w={4.5} />
        <Arrow a={[1046, 565]} b={[1030, 537]} bend={6} f={f} start={S(91.5)} end={S(92.5)} color={BLUE} w={4.5} />
        <Arrow a={[1030, 590]} b={[1086, 528]} bend={-12} f={f} start={S(98.5)} end={S(99.8)} color={BLUE} w={4.5} />
        <Arrow a={[1040, 545]} b={[1050, 512]} bend={6} f={f} start={S(100)} end={S(101.3)} color={BLUE} w={4.5} />
        <Arrow a={[1058, 348]} b={[1063, 392]} bend={-8} f={f} start={S(104.5)} end={S(105.8)} color={BLUE} w={4.5} />
        <Arrow a={[1062, 520]} b={[1060, 462]} bend={-8} f={f} start={S(105)} end={S(106.3)} color={BLUE} w={4.5} />
        <Arrow a={[1060, 462]} b={[1100, 480]} bend={-8} f={f} start={S(106.5)} end={S(107.8)} color={BLUE} w={4.5} />
        {TL.explosions.map((e, i) => <Explosion key={i} p={e.p as P} f={f} at={S(e.t)} r={11} />)}
        {/* caras */}
        {FACES.map((fc) => { const m = moodOf(fc.name, f); return <Face key={fc.name} x={fc.p[0]} y={fc.p[1]} r={fc.r} mood={m.mood} look={m.look} f={f} seed={fc.seed} />; })}
      </g>
    </svg>
  );
};

// etiquetas de nombre de país (HTML, tamaño constante)
const CountryLabels: React.FC<{f: number; cam: Cam}> = ({f, cam}) => {
  const zoomed = cam.s > 1.9;
  const wideWindows = (f > 2290 && f < 2730) || (f > 3460);
  const items: {key: string; text: string; sx: number; sy: number; st?: [string, string]; big?: boolean}[] = [];
  for (const fc of FACES) {
    const isBaltic = TAKES.some((t) => t.name === fc.name);
    const isKey = KEY.has(fc.name);
    if (zoomed && !isKey) continue;
    if (!zoomed && !wideWindows) continue;
    if (!zoomed && isBaltic && cam.s < 1.4) continue;
    const [sx, sy] = toScreen(fc.p, cam);
    if (sx < 40 || sx > 1880 || sy < 200 || sy > 1020) continue;
    if (sx < 700 && sy > 800) continue; // no tapar el panel de bajas
    if (sx > 1440 && sy > 190 && sy < 700 && f > 1400 && f < 3440) continue; // ni el balance
    const t = TAKES.find((x) => x.name === fc.name);
    const st = t ? statusOf(t, f) : undefined;
    items.push({key: fc.name, text: fc.label, sx, sy: sy + fc.r * cam.s + 10, st: st && st !== 'libre' ? STATUS_STYLE[st] : undefined, big: isBaltic});
  }
  if (zoomed) {
    const [sx, sy] = toScreen([1016, 538], cam);
    const kal = f >= S(KAL.o1) ? (['TOMADO', BLUE] as [string, string]) : undefined;
    items.push({key: 'kal', text: 'KALININGRADO', sx, sy: sy + 8, st: kal});
  }
  const a = zoomed ? lerp(cam.s, 1.9, 2.2, 0, 1, Easing.linear) : 1;
  return (
    <>
      {items.map((it) => (
        <div key={it.key} style={{position: 'absolute', left: it.sx, top: it.sy, transform: 'translateX(-50%)', opacity: a, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 3}}>
          <div style={{background: '#fff', border: `4px solid ${INK}`, borderRadius: 14, padding: '3px 12px 0', ...font, fontSize: it.big ? 26 : 22, color: INK, whiteSpace: 'nowrap', boxShadow: '0 4px 0 rgba(0,0,0,0.3)'}}>{it.text}</div>
          {it.st && <div style={{background: it.st[1], border: `3px solid ${INK}`, borderRadius: 12, padding: '2px 10px 0', ...font, fontSize: 19, color: '#fff', whiteSpace: 'nowrap'}}>{it.st[0]}</div>}
        </div>
      ))}
    </>
  );
};

// sello grande "OCUPADA" / "LIBERADA"
const STAMPS: {at: number; text: string; color: string}[] = [
  {at: S(49.6), text: 'CORREDOR CORTADO', color: RED},
  {at: S(58.9), text: 'ESTONIA OCUPADA', color: RED},
  {at: S(66.9), text: 'LETONIA OCUPADA', color: RED},
  {at: S(74.9), text: 'LITUANIA OCUPADA', color: RED},
  {at: S(95.1), text: 'KALININGRADO CAE', color: BLUE},
  {at: S(103.6), text: 'LITUANIA LIBERADA', color: GREEN},
  {at: S(109.9), text: 'LETONIA Y ESTONIA LIBERADAS', color: GREEN},
];
const Stamp: React.FC<{f: number}> = ({f}) => {
  const st = STAMPS.find((s) => f >= s.at && f < s.at + 45);
  if (!st) return null;
  const d = f - st.at;
  const k = d < 8 ? interpolate(d, [0, 8], [2.2, 1], {...clamp, easing: Easing.out(Easing.cubic)}) : 1;
  const a = lerp(d, 0, 4, 0, 1) * lerp(d, 38, 45, 1, 0);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 8}}>
      <div style={{transform: `scale(${k}) rotate(-6deg)`, opacity: a, border: `8px solid ${st.color}`, color: st.color, background: 'rgba(255,246,227,0.92)', borderRadius: 18, padding: '14px 40px 6px', ...font, fontSize: 88, letterSpacing: 2, boxShadow: '0 10px 0 rgba(0,0,0,0.3)', whiteSpace: 'nowrap'}}>{st.text}</div>
    </AbsoluteFill>
  );
};

// ================= escena: reunión secreta (mapa de Eurasia) =================
const EU = eurasia as {countries: Country[]; cities: Record<string, P>};
const AXIS = new Set(['Russia', 'Belarus', 'North Korea']);
const ROUTE = ['Pyongyang', 'Tumen', 'Khabarovsk', 'Chita', 'Irkutsk', 'Novosibirsk', 'Omsk', 'Yekaterinburg', 'Moscow'].map((k) => EU.cities[k]);

const Avatar: React.FC<{x: number; y: number; size: number; code: string; name: string; mood: Mood; f: number; seed: number; k: number; look?: P}> = ({x, y, size, code, name, mood, f, seed, k, look}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${k})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
    <svg width={size} height={size} viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} style={{overflow: 'visible'}}>
      <defs><clipPath id={`av-${code}`}><circle r={size / 2 - 4} /></clipPath></defs>
      <circle r={size / 2} fill={INK} transform="translate(0,6)" opacity={0.35} />
      <g clipPath={`url(#av-${code})`}><g transform={`translate(${-size * 0.75},${-size / 2})`}><Flag code={code} w={size * 1.5} h={size} /></g></g>
      <circle r={size / 2 - 4} fill="none" stroke={INK} strokeWidth={7} />
      <Face x={0} y={-size * 0.04} r={size * 0.3} mood={mood} f={f} seed={seed} look={look} />
    </svg>
    <div style={{background: '#fff', border: `4px solid ${INK}`, borderRadius: 14, padding: '3px 14px 0', ...font, fontSize: 26, color: INK, whiteSpace: 'nowrap', marginTop: -14, boxShadow: '0 4px 0 rgba(0,0,0,0.3)'}}>{name}</div>
  </div>
);

const MeetingScene: React.FC<{f: number}> = ({f}) => {
  const s = lerp(f, 180, 700, 1.0, 1.07, Easing.linear);
  const tf = `translate(960,540) scale(${s}) translate(-960,-540)`;
  const pulse = 0.5 + 0.5 * Math.sin(f / 6);
  const routeP = lerp(f, 585, 690, 0, 1, Easing.inOut(Easing.quad));
  // longitud acumulada de la ruta
  const segs = ROUTE.slice(1).map((p, i) => Math.hypot(p[0] - ROUTE[i][0], p[1] - ROUTE[i][1]));
  const total = segs.reduce((a, b) => a + b, 0);
  let left = total * routeP; const pts: P[] = [ROUTE[0]];
  for (let i = 0; i < segs.length && left > 0; i++) {
    const t = Math.min(1, left / segs[i]); const a = ROUTE[i], b = ROUTE[i + 1];
    pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); left -= segs[i];
  }
  const head = pts[pts.length - 1];
  const sp = (p: P): P => [960 + (p[0] - 960) * s, 540 + (p[1] - 540) * s];
  const avK = (start: number) => pop(f, start, 11) * lerp(f, 690, 712, 1, 0);
  const cityDot = (n: string, label: string, dx: number, dy: number) => {
    const p = EU.cities[n];
    return (
      <g key={n}>
        <circle cx={p[0]} cy={p[1]} r={6 / s} fill={YELLOW} stroke={INK} strokeWidth={3 / s} />
        <text x={p[0] + dx} y={p[1] + dy} fontFamily="Lilita" fontSize={24 / s} fill="#fff" stroke={INK} strokeWidth={5 / s} paintOrder="stroke" textAnchor="middle">{label}</text>
      </g>
    );
  };
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <defs>
          {EU.countries.map((c) => (FLAG_OF[c.name] ? <FlagPattern key={c.name} id={`ea-${pid(c.name)}`} code={FLAG_OF[c.name]} box={c.name === 'Russia' ? [600, 220, 1500, 640] : c.bbox} /> : null))}
        </defs>
        <g transform={tf}>
          <g transform="translate(2,3)" opacity={0.3}>{EU.countries.map((c) => <path key={c.name} d={c.d} fill="#06213f" />)}</g>
          {EU.countries.map((c) => <path key={c.name} d={c.d} fill={FLAG_OF[c.name] ? `url(#ea-${pid(c.name)})` : '#efe3c8'} opacity={FLAG_OF[c.name] && !AXIS.has(c.name) ? 0.55 : 1} />)}
          {EU.countries.map((c) => <path key={c.name} d={c.d} fill="none" stroke={INK} strokeOpacity={0.8} strokeWidth={1.8} vectorEffect="non-scaling-stroke" />)}
          {f > 210 && EU.countries.filter((c) => AXIS.has(c.name)).map((c) => <path key={c.name} d={c.d} fill="none" stroke={RED} strokeWidth={4 + pulse * 4} vectorEffect="non-scaling-stroke" opacity={lerp(f, 210, 230, 0, 1)} />)}
          {routeP > 0 && <path d={'M' + pts.map((p) => p.join(',')).join(' L')} fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />}
          {routeP > 0 && <path d={'M' + pts.map((p) => p.join(',')).join(' L')} fill="none" stroke={YELLOW} strokeWidth={5} strokeDasharray="14 10" strokeLinecap="round" vectorEffect="non-scaling-stroke" />}
          {cityDot('Moscow', 'MOSCÚ', 0, -16)}
          {cityDot('Minsk', 'MINSK', -10, -16)}
          {cityDot('Pyongyang', 'PIONYANG', 0, 34)}
        </g>
      </svg>
      {routeP > 0 && routeP < 1.0 && (() => { const [x, y] = sp(head); return (
        <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)'}}>
          <svg width={86} height={46}><rect x={3} y={3} width={80} height={40} rx={10} fill={CREAM} stroke={INK} strokeWidth={4} /><svg x={9} y={10} width={30} height={26}><Flag code="kp" w={30} h={26} /></svg><g transform="translate(58,23)"><rect x={-14} y={-2} width={28} height={10} rx={3} fill="#4a5a3a" stroke={INK} strokeWidth={2} /><rect x={-7} y={-9} width={14} height={8} rx={3} fill="#4a5a3a" stroke={INK} strokeWidth={2} /></g></svg>
        </div>); })()}
      {f > 640 && (() => { const [x, y] = sp(EU.cities.Moscow); const k = pop(f, 640, 10) * lerp(f, 700, 712, 1, 0); return (
        <div style={{position: 'absolute', left: x + 170, top: y - 120, transform: `translate(-50%,-50%) scale(${k})`, background: '#7b2cbf', color: '#fff', border: `5px solid ${INK}`, borderRadius: 16, padding: '8px 20px 2px', ...font, fontSize: 34, whiteSpace: 'nowrap', boxShadow: '0 6px 0 rgba(0,0,0,0.3)'}}>+15.000 SOLDADOS</div>); })()}
      {/* avatares */}
      <Avatar x={700} y={860} size={150} code="ru" name="RUSIA" mood={f < 360 ? 'smug' : 'angry'} f={f} seed={1} k={avK(215)} look={[1, 0]} />
      <Avatar x={960} y={860} size={130} code="by" name="BIELORRUSIA" mood={f > 360 && f < 470 ? 'angry' : 'calm'} f={f} seed={2} k={avK(240)} look={[f < 360 ? -1 : 0, 0]} />
      <Avatar x={1220} y={860} size={130} code="kp" name="COREA DEL NORTE" mood={f > 470 ? 'smug' : 'calm'} f={f} seed={3} k={avK(265)} look={[-1, 0]} />
      <BubbleAt f={f} from={290} to={375} sx={760} sy={755} text="Ha llegado el momento: vamos a por los bálticos." />
      <BubbleAt f={f} from={380} to={470} sx={960} sy={765} text="Atacaremos desde mi territorio." />
      <BubbleAt f={f} from={475} to={575} sx={1160} sy={765} text="Yo pongo soldados y munición." />
    </AbsoluteFill>
  );
};

// ================= escena: comparativa de fuerzas =================
const FORCES: {label: string; ru: number; eu: number; show: (v: number) => string}[] = [
  {label: 'Soldados en activo', ru: 2703000, eu: 1302811, show: (v) => fmt(v)},
  {label: 'Tanques', ru: 11102, eu: 2674, show: (v) => fmt(v)},
  {label: 'Aviones de combate', ru: 2107, eu: 1132, show: (v) => fmt(v)},
  {label: 'Cabezas nucleares', ru: 5480, eu: 515, show: (v) => fmt(v)},
  {label: 'Gasto militar', ru: 196000, eu: 483000, show: (v) => `${fmt(v)} M$`},
  {label: 'Población', ru: 176.6, eu: 413.1, show: (v) => `${Math.round(v)} M`},
];
const ForcesScene: React.FC<{f: number}> = ({f}) => {
  if (f < 715 || f > 1095) return null;
  const k = pop(f, 730, 13) * lerp(f, 1065, 1090, 1, 0);
  const dim = lerp(f, 715, 740, 0, 0.5) * lerp(f, 1070, 1095, 1, 0);
  return (
    <AbsoluteFill style={{background: `rgba(8,18,32,${dim})`, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: `scale(${k})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{background: YELLOW, border: `6px solid ${INK}`, borderRadius: 18, padding: '8px 36px 2px', ...font, fontSize: 56, color: INK, marginBottom: -22, zIndex: 2, boxShadow: '0 6px 0 rgba(0,0,0,0.3)', transform: 'rotate(-2deg)'}}>LAS FUERZAS</div>
        <div style={{background: CREAM, border: `7px solid ${INK}`, borderRadius: 26, padding: '40px 40px 18px', width: 1300, boxShadow: '0 10px 0 rgba(0,0,0,0.35)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10}}><MiniFlag code="ru" /><MiniFlag code="by" /><MiniFlag code="kp" /><div style={{...font, fontSize: 36, color: '#c0221d', marginLeft: 8}}>BANDO RUSO</div></div>
            <div style={{display: 'flex', alignItems: 'center', gap: 10}}><div style={{...font, fontSize: 36, color: '#1557c0', marginRight: 8}}>EUROPA · 13 PAÍSES</div><MiniFlag code="eu" /></div>
          </div>
          {FORCES.map((r, i) => {
            const st = 770 + i * 26;
            const a = lerp(f, st, st + 12, 0, 1);
            const g = lerp(f, st, st + 40, 0, 1, Easing.out(Easing.cubic));
            const mx = Math.max(r.ru, r.eu);
            const ruWin = r.ru > r.eu;
            return (
              <div key={r.label} style={{display: 'flex', alignItems: 'center', height: 74, opacity: a, borderTop: i ? '3px solid #e2d3b1' : 'none'}}>
                <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 14}}>
                  <div style={{...font, fontSize: 36, color: '#c0221d', opacity: ruWin ? 1 : 0.65, whiteSpace: 'nowrap', minWidth: 200, textAlign: 'right'}}>{r.show(r.ru * g)}</div>
                  <div style={{width: 250, height: 30, display: 'flex', justifyContent: 'flex-end'}}><div style={{width: `${(r.ru / mx) * 100 * g}%`, background: RED, border: `4px solid ${INK}`, borderRadius: '10px 0 0 10px', opacity: ruWin ? 1 : 0.6}} /></div>
                </div>
                <div style={{width: 300, textAlign: 'center', ...font2, fontSize: 28, color: INK}}>{r.label}</div>
                <div style={{flex: 1, display: 'flex', alignItems: 'center', gap: 14}}>
                  <div style={{width: 250, height: 30, display: 'flex'}}><div style={{width: `${(r.eu / mx) * 100 * g}%`, background: BLUE, border: `4px solid ${INK}`, borderRadius: '0 10px 10px 0', opacity: ruWin ? 0.6 : 1}} /></div>
                  <div style={{...font, fontSize: 36, color: '#1557c0', opacity: ruWin ? 0.65 : 1, whiteSpace: 'nowrap', minWidth: 200}}>{r.show(r.eu * g)}</div>
                </div>
              </div>
            );
          })}
          <div style={{...font2, fontWeight: 600, fontSize: 20, color: '#6b6250', textAlign: 'center', marginTop: 10}}>Global Firepower 2026 (incluye material almacenado) · SIPRI 2025 · Europa = 13 países clave de la OTAN</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ================= intro y final =================
const TitleIntro: React.FC<{f: number}> = ({f}) => {
  if (f > 172) return null;
  const k = pop(f, 10, 11) * lerp(f, 160, 172, 1, 0);
  const k2 = pop(f, 40, 12) * lerp(f, 160, 172, 1, 0);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24}}>
      <div style={{transform: `scale(${k}) rotate(-2deg)`, background: '#2ec36a', border: `7px solid ${INK}`, borderRadius: 26, padding: '22px 48px 14px', boxShadow: '0 10px 0 rgba(0,0,0,0.35)', ...font, fontSize: 96, color: '#fff', textShadow: `4px 4px 0 ${INK}`, textAlign: 'center', lineHeight: 1.05}}>¿Y si RUSIA invadiera<br />EUROPA?</div>
      <div style={{transform: `scale(${k2})`, background: INK, color: YELLOW, borderRadius: 30, padding: '10px 30px 4px', ...font, fontSize: 40}}>SIMULACIÓN DE GUERRA</div>
    </AbsoluteFill>
  );
};
const EndScene: React.FC<{f: number}> = ({f}) => {
  if (f < 3425) return null;
  const k = pop(f, 3425, 11), k2 = pop(f, 3445, 12), k3 = pop(f, 3480, 12);
  const c = casualties(80);
  const row = (code: string, label: string, val: string, color: string) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 16, height: 58}}>
      <MiniFlag code={code} /><div style={{...font2, fontSize: 32, color: INK, flex: 1}}>{label}</div><div style={{...font, fontSize: 44, color}}>{val}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 30, background: `rgba(8,18,32,${0.45 * k})`, zIndex: 9}}>
      <div style={{transform: `scale(${k}) rotate(-2deg)`, background: YELLOW, border: `7px solid ${INK}`, borderRadius: 24, padding: '18px 46px 10px', boxShadow: '0 10px 0 rgba(0,0,0,0.35)', ...font, fontSize: 100, color: INK}}>FIN DE LA GUERRA</div>
      <div style={{transform: `scale(${k2})`, background: CREAM, border: `6px solid ${INK}`, borderRadius: 22, padding: '18px 34px', width: 820, boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>
        {row('eu', 'Duración', '80 días', INK)}
        {row('ru', 'Bajas del bando ruso', fmt(c.ru), '#c0221d')}
        {row('eu', 'Bajas europeas', fmt(c.eu), '#1557c0')}
        {row('lt', 'Bálticos recuperados', '100 %', GREEN)}
      </div>
      <div style={{transform: `scale(${k3})`, background: '#fff', border: `6px solid ${INK}`, borderRadius: 20, padding: '12px 34px', ...font2, fontSize: 44, color: INK, boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>¿Crees que Europa ganaría? ¡Comenta!</div>
    </AbsoluteFill>
  );
};

// ================= composición =================
export const War2: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camera(f);
  const meetA = lerp(f, 165, 195, 0, 1) * lerp(f, 690, 725, 1, 0);
  const showEurope = meetA < 1;
  const flash = (at: number) => (f >= at && f < at + 12 ? lerp(f, at, at + 12, 0.5, 0) : 0);
  const anchor = (name: string) => FACES.find((x) => x.name === name)!.p;
  const B = (from: number, to: number, who: string, text: string, dy = -14) => {
    const fc = FACES.find((x) => x.name === who)!;
    const [sx, sy] = toScreen(anchor(who), cam);
    return <BubbleAt key={`${who}${from}`} f={f} from={from} to={to} sx={sx} sy={sy - fc.r * cam.s + dy} text={text} />;
  };
  return (
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <Ocean f={f} />
      {showEurope && <EuropeMap f={f} cam={cam} />}
      {showEurope && <CountryLabels f={f} cam={cam} />}
      {meetA > 0 && <AbsoluteFill style={{opacity: meetA}}><Ocean f={f} /><MeetingScene f={f} /></AbsoluteFill>}
      <AbsoluteFill style={{background: '#fff', opacity: flash(S(46)) + flash(S(90))}} />
      {B(1130, 1260, 'Russia', 'Esta vez va en serio.')}
      {B(1450, 1545, 'Poland', '¡Eh! ¡Que eso es mío!')}
      {B(1640, 1765, 'Estonia', '¡Socorro!')}
      {B(1880, 2010, 'Latvia', '¡Nos rodean!')}
      {B(2120, 2255, 'Lithuania', '¡OTAN, ayuda!')}
      {B(2300, 2395, 'Russia', 'Los bálticos son míos.')}
      {B(2420, 2515, 'Poland', '¡De aquí no pasáis!')}
      {B(2575, 2690, 'Spain', '¡Vamos para allá!')}
      {B(2600, 2690, 'Germany', '¡Todos a Polonia!')}
      {B(2765, 2848, 'Poland', '¡Ahora nos toca a nosotros!')}
      {B(3108, 3175, 'Lithuania', '¡LIBRES!')}
      {B(3190, 3290, 'Estonia', '¡Gracias, vecinos!')}
      {B(3320, 3410, 'Russia', 'Vale... alto el fuego.')}
      <Stamp f={f} />
      <ForcesScene f={f} />
      <LocationPill f={f} />
      <Card f={f} />
      <StatsPanel f={f} />
      <BalancePanel f={f} />
      <TitleIntro f={f} />
      <EndScene f={f} />
      <Footer />
      <Audio src={staticFile('music2.wav')} />
    </AbsoluteFill>
  );
};
