import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, delayRender, continueRender} from 'remotion';
import map from './mapdata.json';
import {Flag, FLAG_OF} from './flags';

// ---------- fuentes ----------
const fontHandle = delayRender('fonts');
Promise.all([
  new FontFace('Lilita', `url(${staticFile('lilita.woff2')})`).load(),
  new FontFace('Fredoka', `url(${staticFile('fredoka600.woff2')})`, {weight: '600'}).load(),
  new FontFace('Fredoka', `url(${staticFile('fredoka700.woff2')})`, {weight: '700'}).load(),
  new FontFace('Lilita', `url(${staticFile('lilita-ext.woff2')})`, {unicodeRange: 'U+0100-024F'}).load(),
  new FontFace('Fredoka', `url(${staticFile('fredoka600-ext.woff2')})`, {weight: '600', unicodeRange: 'U+0100-024F'}).load(),
  new FontFace('Fredoka', `url(${staticFile('fredoka700-ext.woff2')})`, {weight: '700', unicodeRange: 'U+0100-024F'}).load(),
]).then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(fontHandle); });

type P = [number, number];
const C = map.cities as Record<string, P>;
const byName: Record<string, (typeof map.countries)[number]> = Object.fromEntries(map.countries.map((c) => [c.name, c]));
const INK = '#1d1d1d';
const CREAM = '#fff6e3';
const RED = '#e5322d';
const BLUE = '#1f6fe0';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.inOut(Easing.cubic);
const lerp = (f: number, a: number, b: number, v0: number, v1: number, e = ease) => interpolate(f, [a, b], [v0, v1], {...clamp, easing: e});

// ---------- cámara ----------
const CAM: {f: number; cx: number; cy: number; s: number}[] = [
  {f: 0, cx: 980, cy: 540, s: 1.0},
  {f: 110, cx: 1000, cy: 520, s: 1.12},
  {f: 225, cx: 1065, cy: 475, s: 2.35},
  {f: 470, cx: 1070, cy: 478, s: 2.6},
  {f: 535, cx: 1000, cy: 520, s: 1.55},
  {f: 590, cx: 1055, cy: 482, s: 2.3},
  {f: 760, cx: 1060, cy: 480, s: 2.45},
  {f: 860, cx: 1005, cy: 510, s: 1.35},
  {f: 900, cx: 1000, cy: 515, s: 1.3},
];
const camera = (f: number) => {
  let i = 0;
  while (i < CAM.length - 2 && f > CAM[i + 1].f) i++;
  const a = CAM[i], b = CAM[i + 1];
  const t = interpolate(f, [a.f, b.f], [0, 1], {...clamp, easing: ease});
  let cx = a.cx + (b.cx - a.cx) * t, cy = a.cy + (b.cy - a.cy) * t;
  const s = a.s * Math.pow(b.s / a.s, t);
  // temblor tras impactos
  for (const hit of [240, 288, 336, 540, 615]) {
    const d = f - hit;
    if (d >= 0 && d < 14) { const k = (1 - d / 14) * 5 / s; cx += Math.sin(d * 3.1) * k; cy += Math.cos(d * 2.3) * k; }
  }
  return {cx, cy, s};
};
const toScreen = (p: P, cam: ReturnType<typeof camera>): P => [960 + (p[0] - cam.cx) * cam.s, 540 + (p[1] - cam.cy) * cam.s];

// ---------- guion ----------
const CARDS = [
  {from: 115, to: 240, badge: '2027', text: 'Rusia y Bielorrusia concentran tropas en la frontera', tag: 'TENSIÓN', tagColor: '#ff8a1f'},
  {from: 240, to: 420, badge: 'DÍA 1', text: 'Ataque relámpago: cortan el corredor de Suwałki', tag: 'INVASIÓN', tagColor: RED},
  {from: 420, to: 480, badge: 'DÍA 9', text: 'Estonia, Letonia y Lituania caen', tag: 'OCUPADAS', tagColor: RED},
  {from: 480, to: 545, badge: 'DÍA 10', text: 'Europa responde: la OTAN activa el artículo 5', tag: 'OTAN', tagColor: BLUE},
  {from: 545, to: 720, badge: 'DÍA 40', text: 'Contraofensiva europea por tierra, mar y aire', tag: 'CONTRAATAQUE', tagColor: BLUE},
  {from: 720, to: 840, badge: 'DÍA 75', text: 'Bálticos liberados. Rusia pide un alto el fuego', tag: 'LIBERADOS', tagColor: '#27ae60'},
];
const LOCATIONS = [
  {from: 0, label: 'EUROPA'}, {from: 115, label: 'MAR BÁLTICO'}, {from: 500, label: 'EUROPA'},
  {from: 560, label: 'MAR BÁLTICO'}, {from: 780, label: 'EUROPA'},
];
// día de guerra en función del fotograma
const warDay = (f: number) => {
  if (f < 240) return 0;
  if (f < 420) return lerp(f, 240, 420, 1, 9, Easing.linear);
  if (f < 545) return lerp(f, 420, 545, 9, 40, Easing.linear);
  if (f < 720) return lerp(f, 545, 720, 40, 75, Easing.linear);
  return 75;
};
const casualties = (d: number) => {
  const seg = (rates: number[]) => {
    const [r1, r2, r3] = rates;
    if (d <= 9) return r1 * d;
    if (d <= 40) return r1 * 9 + r2 * (d - 9);
    return r1 * 9 + r2 * 31 + r3 * (d - 40);
  };
  return {ru: seg([2500, 2250, 3500]), eu: seg([3500, 2250, 1750])};
};
const BALTIC_KM2 = 175228;

// ---------- piezas del mapa ----------
const OCEAN = () => (
  <svg width={1920} height={1080} style={{position: 'absolute'}}>
    <defs>
      <radialGradient id="sea" cx="50%" cy="45%" r="75%">
        <stop offset="0%" stopColor="#3f97d6" />
        <stop offset="100%" stopColor="#1d5e9f" />
      </radialGradient>
    </defs>
    <rect width={1920} height={1080} fill="url(#sea)" />
  </svg>
);
const Waves: React.FC<{f: number}> = ({f}) => (
  <svg width={1920} height={1080} style={{position: 'absolute'}}>
    <defs>
      <pattern id="waves" width={140} height={46} patternUnits="userSpaceOnUse" patternTransform={`translate(${(f * 0.35) % 140},0)`}>
        <path d="M0,23 C17,13 35,13 52,23 S87,33 105,23 S122,13 140,23" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={3} />
      </pattern>
    </defs>
    <rect width={1920} height={1080} fill="url(#waves)" />
  </svg>
);

const Face: React.FC<{x: number; y: number; r: number; mood: 'calm' | 'angry' | 'scared' | 'happy' | 'sad'; f: number; seed: number; look?: P}> = ({x, y, r, mood, f, seed, look = [0, 0]}) => {
  const blinkPhase = (f + seed * 37) % 110;
  const blink = blinkPhase < 4 ? 0.12 : 1;
  const bob = Math.sin((f + seed * 11) / 14) * r * 0.04;
  const ew = r * 0.42, eh = r * 0.5 * blink, ex = r * 0.48, sw = r * 0.09;
  const pr = mood === 'scared' ? r * 0.12 : r * 0.2;
  const angry = mood === 'angry';
  return (
    <g transform={`translate(${x},${y + bob})`}>
      {(mood === 'happy' || mood === 'calm') && <><ellipse cx={-ex - r * 0.15} cy={r * 0.5} rx={r * 0.2} ry={r * 0.11} fill="#ff7fa6" opacity={0.75} /><ellipse cx={ex + r * 0.15} cy={r * 0.5} rx={r * 0.2} ry={r * 0.11} fill="#ff7fa6" opacity={0.75} /></>}
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <ellipse cx={sd * ex} cy={0} rx={ew} ry={eh} fill={angry ? '#fff2f0' : '#fff'} stroke={INK} strokeWidth={sw} />
          {blink > 0.5 && <circle cx={sd * ex + look[0] * ew * 0.35} cy={look[1] * eh * 0.3 + (angry ? r * 0.06 : 0)} r={pr} fill={angry ? '#c0141a' : INK} />}
          {blink > 0.5 && angry && <circle cx={sd * ex + look[0] * ew * 0.35} cy={look[1] * eh * 0.3 + r * 0.06} r={pr * 0.5} fill={INK} />}
          {angry && <path d={`M${sd * (ex + ew * 1.1)},${-eh * 1.15} L${sd * (ex - ew * 0.9)},${-eh * 0.55}`} stroke={INK} strokeWidth={sw * 1.6} strokeLinecap="round" />}
          {mood === 'sad' && <path d={`M${sd * (ex + ew)},${-eh * 0.6} L${sd * (ex - ew * 0.8)},${-eh * 1.2}`} stroke={INK} strokeWidth={sw * 1.4} strokeLinecap="round" />}
          {mood === 'scared' && <path d={`M${sd * (ex + ew * 0.9)},${-eh * 1.25} Q${sd * ex},${-eh * 1.6} ${sd * (ex - ew * 0.9)},${-eh * 1.25}`} fill="none" stroke={INK} strokeWidth={sw * 1.2} strokeLinecap="round" />}
        </g>
      ))}
      {mood === 'happy' && <path d={`M${-r * 0.35},${r * 0.55} Q0,${r * 1.05} ${r * 0.35},${r * 0.55} Z`} fill="#8c1d2c" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />}
      {mood === 'calm' && <path d={`M${-r * 0.22},${r * 0.62} Q0,${r * 0.82} ${r * 0.22},${r * 0.62}`} fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />}
      {mood === 'angry' && <path d={`M${-r * 0.3},${r * 0.75} Q0,${r * 0.55} ${r * 0.3},${r * 0.75}`} fill="none" stroke={INK} strokeWidth={sw * 1.2} strokeLinecap="round" />}
      {mood === 'sad' && <path d={`M${-r * 0.28},${r * 0.8} Q0,${r * 0.55} ${r * 0.28},${r * 0.8}`} fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />}
      {mood === 'scared' && <ellipse cx={0} cy={r * 0.7} rx={r * 0.13} ry={r * 0.17} fill="#5a1220" stroke={INK} strokeWidth={sw} />}
    </g>
  );
};

// flecha curva que se dibuja progresivamente
const Arrow: React.FC<{a: P; b: P; bend: number; f: number; start: number; end: number; color: string; w: number}> = ({a, b, bend, f, start, end, color, w}) => {
  if (f < start) return null;
  const p = lerp(f, start, end, 0, 1, Easing.out(Easing.quad));
  const fade = lerp(f, end + 60, end + 90, 1, 0);
  if (fade <= 0) return null;
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
  const c: P = [mx - (dy / len) * bend, my + (dx / len) * bend];
  const pt = (t: number): P => [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]];
  const n = 30, pts: P[] = [];
  for (let i = 0; i <= n; i++) pts.push(pt((i / n) * p));
  const tip = pts[pts.length - 1], prev = pt(Math.max(0, p - 0.04));
  const ang = Math.atan2(tip[1] - prev[1], tip[0] - prev[0]);
  const hl = w * 2.4, hw = w * 1.9;
  const head = `M${tip[0] + Math.cos(ang) * hl * 0.6},${tip[1] + Math.sin(ang) * hl * 0.6} L${tip[0] + Math.cos(ang + 2.4) * hw},${tip[1] + Math.sin(ang + 2.4) * hw} L${tip[0] + Math.cos(ang - 2.4) * hw},${tip[1] + Math.sin(ang - 2.4) * hw} Z`;
  const d = 'M' + pts.map((q) => q.join(',')).join(' L');
  return (
    <g opacity={fade}>
      <path d={d} fill="none" stroke={INK} strokeWidth={w + w * 0.6} strokeLinecap="round" strokeLinejoin="round" />
      <path d={head} fill={INK} stroke={INK} strokeWidth={w * 0.6} strokeLinejoin="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      <path d={head} fill={color} />
    </g>
  );
};

const Explosion: React.FC<{p: P; f: number; at: number; r: number}> = ({p, f, at, r}) => {
  const d = f - at;
  if (d < 0 || d > 26) return null;
  const k = d / 26;
  const rr = r * (0.3 + Math.sqrt(k) * 1.1);
  const spikes = 10;
  const star = Array.from({length: spikes * 2}).map((_, i) => {
    const a = (i / (spikes * 2)) * Math.PI * 2 + at;
    const rad = i % 2 ? rr * 0.55 : rr;
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

// ---------- interfaz ----------
const font = {fontFamily: 'Lilita'};
const font2 = {fontFamily: 'Fredoka', fontWeight: 700};

const LocationPill: React.FC<{f: number}> = ({f}) => {
  let cur = LOCATIONS[0];
  for (const l of LOCATIONS) if (f >= l.from) cur = l;
  const since = f - cur.from;
  const pop = since < 10 ? spring({frame: since, fps: 30, config: {damping: 12}}) : 1;
  return (
    <div style={{position: 'absolute', left: 34, top: 30, display: 'flex', alignItems: 'center', gap: 12, background: INK, color: '#fff', padding: '12px 26px 12px 20px', borderRadius: 40, boxShadow: '0 6px 0 rgba(0,0,0,0.3)', transform: `scale(${0.85 + 0.15 * pop})`, transformOrigin: 'left center', ...font, fontSize: 34, letterSpacing: 1}}>
      <svg width={22} height={30} viewBox="0 0 22 30"><path d="M11,0 C4.9,0 0,4.9 0,11 C0,19 11,30 11,30 C11,30 22,19 22,11 C22,4.9 17.1,0 11,0 Z" fill="#ffd23f" /><circle cx={11} cy={11} r={4.5} fill={INK} /></svg>
      {cur.label}
    </div>
  );
};

const Card: React.FC<{f: number}> = ({f}) => {
  const card = CARDS.find((c) => f >= c.from && f < c.to);
  if (!card) return null;
  const local = f - card.from;
  const inn = spring({frame: local, fps: 30, config: {damping: 14, stiffness: 140}});
  const out = lerp(f, card.to - 8, card.to, 0, 1);
  const y = interpolate(inn, [0, 1], [-160, 0]) - out * 160;
  return (
    <div style={{position: 'absolute', top: 92, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `translateY(${y}px) rotate(${-0.6 + inn * 0.6}deg)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 22, background: CREAM, border: `6px solid ${INK}`, borderRadius: 22, padding: '14px 18px 14px 14px', boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>
        <div style={{background: INK, color: '#ffd23f', ...font, fontSize: 52, padding: '6px 20px 2px', borderRadius: 12, whiteSpace: 'nowrap'}}>{card.badge}</div>
        <div style={{...font2, fontSize: 42, color: INK, whiteSpace: 'nowrap'}}>{card.text}</div>
        <div style={{background: card.tagColor, color: '#fff', ...font, fontSize: 30, padding: '8px 18px 4px', borderRadius: 30, border: `4px solid ${INK}`, boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.2)', whiteSpace: 'nowrap', transform: `scale(${0.6 + 0.4 * spring({frame: local - 6, fps: 30, config: {damping: 9}})})`}}>{card.tag}</div>
      </div>
    </div>
  );
};

const Bubble: React.FC<{f: number; from: number; to: number; at: P; text: string; cam: ReturnType<typeof camera>; dx?: number; dy?: number}> = ({f, from, to, at, text, cam, dx = 0, dy = -70}) => {
  if (f < from || f > to) return null;
  const pop = spring({frame: f - from, fps: 30, config: {damping: 10, stiffness: 160}});
  const out = lerp(f, to - 6, to, 1, 0);
  const [sx, sy] = toScreen(at, cam);
  return (
    <div style={{position: 'absolute', left: sx + dx, top: sy + dy, transform: `translate(-50%,-100%) scale(${pop * out})`, transformOrigin: '50% 100%'}}>
      <div style={{background: '#fff', border: `5px solid ${INK}`, borderRadius: 16, padding: '10px 22px', ...font2, fontSize: 36, color: INK, whiteSpace: 'nowrap', boxShadow: '0 6px 0 rgba(0,0,0,0.3)'}}>{text}</div>
      <svg width={36} height={24} style={{position: 'absolute', left: '50%', marginLeft: -18, bottom: -19}}><path d="M2,0 L18,22 L34,0" fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><rect x={4} y={-6} width={28} height={7} fill="#fff" /></svg>
    </div>
  );
};

const fmt = (n: number) => Math.round(n).toLocaleString('es-ES').replace(/,/g, '.');
const MiniFlag: React.FC<{code: string}> = ({code}) => (
  <svg width={54} height={36} style={{borderRadius: 5, border: `3px solid ${INK}`, flexShrink: 0}}><Flag code={code} w={54} h={36} /></svg>
);

const StatsPanel: React.FC<{f: number}> = ({f}) => {
  if (f < 245) return null;
  const pop = spring({frame: f - 245, fps: 30, config: {damping: 14}});
  const c = casualties(warDay(f));
  const row = (code: string, name: string, val: number, color: string) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 14, height: 54}}>
      <MiniFlag code={code} />
      <div style={{...font2, fontSize: 27, color: INK, width: 320, whiteSpace: 'nowrap'}}>{name}</div>
      <div style={{...font, fontSize: 44, color, minWidth: 190, textAlign: 'right'}}>{fmt(val)}</div>
    </div>
  );
  return (
    <div style={{position: 'absolute', left: 34, bottom: 70, transform: `translateY(${(1 - pop) * 260}px)`}}>
      <div style={{position: 'absolute', top: -26, left: 24, background: '#ffd23f', border: `4px solid ${INK}`, borderRadius: 12, padding: '4px 14px 0', ...font, fontSize: 24, color: INK, zIndex: 2}}>BAJAS · MUERTOS Y HERIDOS</div>
      <div style={{background: CREAM, border: `6px solid ${INK}`, borderRadius: 20, padding: '22px 26px 12px', boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>
        {row('ru', 'RUSIA + BIELORRUSIA', c.ru, '#c0221d')}
        {row('eu', 'EUROPA', c.eu, '#1557c0')}
      </div>
    </div>
  );
};

const TerritoryPanel: React.FC<{f: number}> = ({f}) => {
  if (f < 250) return null;
  const pop = spring({frame: f - 250, fps: 30, config: {damping: 14}});
  const occ = f < 560 ? lerp(f, 255, 430, 0, BALTIC_KM2) : lerp(f, 560, 760, BALTIC_KM2, 0);
  const pct = occ / BALTIC_KM2;
  const kal = f >= 660;
  return (
    <div style={{position: 'absolute', right: 34, top: 220, width: 380, transform: `translateX(${(1 - pop) * 460}px)`}}>
      <div style={{background: CREAM, border: `6px solid ${INK}`, borderRadius: 20, padding: '16px 22px', boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>
        <div style={{...font, fontSize: 28, color: INK, textAlign: 'center', marginBottom: 6}}>BALANCE</div>
        <div style={{...font2, fontSize: 22, color: '#555'}}>Territorio ocupado por Rusia</div>
        <div style={{...font, fontSize: 46, color: pct > 0.01 ? '#c0221d' : '#27ae60'}}>{fmt(occ)} km²</div>
        <div style={{height: 22, background: '#e6d9bd', border: `4px solid ${INK}`, borderRadius: 12, overflow: 'hidden', margin: '6px 0 12px'}}>
          <div style={{width: `${pct * 100}%`, height: '100%', background: RED}} />
        </div>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{...font2, fontSize: 24, color: INK}}>Kaliningrado</div>
          <div style={{...font, fontSize: 24, color: '#fff', background: kal ? BLUE : RED, border: `3px solid ${INK}`, borderRadius: 20, padding: '4px 14px 0'}}>{kal ? 'TOMADO' : 'RUSO'}</div>
        </div>
      </div>
    </div>
  );
};

const Footer = () => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 44, background: 'rgba(15,25,40,0.92)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', ...font2, fontWeight: 600, fontSize: 21}}>
    Simulación hipotética · Datos: Global Firepower 2026, SIPRI 2025 · Mapa: Natural Earth
  </div>
);

const TitleIntro: React.FC<{f: number}> = ({f}) => {
  if (f > 112) return null;
  const pop = spring({frame: f - 8, fps: 30, config: {damping: 11}});
  const out = lerp(f, 100, 112, 1, 0);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: `scale(${pop * out}) rotate(-2deg)`, background: '#2ec36a', border: `7px solid ${INK}`, borderRadius: 26, padding: '22px 48px 14px', boxShadow: '0 10px 0 rgba(0,0,0,0.35)', ...font, fontSize: 92, color: '#fff', textShadow: `4px 4px 0 ${INK}`, textAlign: 'center', lineHeight: 1.05}}>
        ¿Y si RUSIA invadiera<br />EUROPA?
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{f: number}> = ({f}) => {
  if (f < 842) return null;
  const pop = spring({frame: f - 842, fps: 30, config: {damping: 11}});
  const pop2 = spring({frame: f - 856, fps: 30, config: {damping: 12}});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 26, background: `rgba(10,20,35,${0.35 * pop})`}}>
      <div style={{transform: `scale(${pop}) rotate(-2deg)`, background: '#ffd23f', border: `7px solid ${INK}`, borderRadius: 24, padding: '18px 46px 10px', boxShadow: '0 10px 0 rgba(0,0,0,0.35)', ...font, fontSize: 96, color: INK}}>FIN DE LA GUERRA</div>
      <div style={{transform: `scale(${pop2})`, background: CREAM, border: `6px solid ${INK}`, borderRadius: 20, padding: '14px 34px', ...font2, fontSize: 44, color: INK, boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>¿Crees que Europa ganaría? ¡Comenta!</div>
    </AbsoluteFill>
  );
};

// ---------- escena del mapa ----------
type Country = (typeof map.countries)[number];
const FlagPattern: React.FC<{id: string; code: string; box: number[]}> = ({id, code, box}) => {
  const [x0, y0, x1, y1] = box;
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" x={x0} y={y0} width={x1 - x0} height={y1 - y0}>
      <Flag code={code} w={x1 - x0} h={y1 - y0} />
    </pattern>
  );
};
// caja de la bandera: para países enormes usamos una caja cercana a la zona visible
const flagBox = (c: Country) => {
  if (c.name === 'Russia') return [1110, 160, 1900, 760];
  return c.bbox;
};

const MapScene: React.FC<{f: number; cam: ReturnType<typeof camera>}> = ({f, cam}) => {
  const {cx, cy, s} = cam;
  const tf = `translate(960,540) scale(${s}) translate(${-cx},${-cy})`;
  const inv = 1 / s;
  // máscaras de ocupación (círculos que crecen desde los puntos de ataque)
  const grow = (start: number, end: number, r: number) => lerp(f, start, end, 0, r, Easing.inOut(Easing.quad));
  const occCircles: {p: P; r: number}[] = [
    {p: C.Narva, r: grow(262, 430, 175)}, {p: C.Pskov, r: grow(272, 440, 180)}, {p: C.Polotsk, r: grow(280, 440, 160)},
    {p: [1112, 538], r: grow(262, 425, 135)}, {p: [1118, 455], r: grow(276, 440, 150)},
  ];
  const libCircles: {p: P; r: number}[] = [
    {p: [1040, 565], r: grow(560, 760, 230)}, {p: [990, 515], r: grow(575, 760, 160)}, {p: [1062, 335], r: grow(600, 760, 160)},
    {p: [1000, 440], r: grow(590, 760, 150)},
  ];
  const corrCircles = [{p: [1062, 556] as P, r: grow(252, 330, 42)}, {p: [1028, 538] as P, r: grow(255, 330, 30)}];
  const corrLib = [{p: [1040, 600] as P, r: grow(550, 630, 120)}];
  const kalCircles = [{p: [1046, 549] as P, r: grow(598, 680, 80)}, {p: C.Gdansk, r: grow(605, 680, 70)}];
  const baltic = ['Estonia', 'Latvia', 'Lithuania'].map((n) => byName[n]).filter(Boolean);
  const blob = (list: {p: P; r: number}[], fill: string, key: string) => list.flatMap((c, i) => [0, 1, 2].map((j) => {
    const a = i * 2.1 + j * 2.09;
    return <circle key={`${key}${i}-${j}`} cx={c.p[0] + Math.cos(a) * c.r * 0.12} cy={c.p[1] + Math.sin(a) * c.r * 0.12} r={Math.max(0, c.r * (0.92 - j * 0.04))} fill={fill} />;
  }));

  const faces: {name: string; p: P; r: number; mood: any; seed: number; look?: P; show?: [number, number]}[] = [
    {name: 'Russia', p: [1215, 425], r: 30, seed: 1, mood: f < 120 ? 'calm' : f < 720 ? 'angry' : 'sad', look: f < 720 ? [-1, 0.2] : [0, 0.4]},
    {name: 'Belarus', p: byName.Belarus.c as P, r: 16, seed: 2, mood: f < 120 ? 'calm' : f < 560 ? 'angry' : 'scared', look: [-1, 0]},
    {name: 'Poland', p: byName.Poland.c as P, r: 20, seed: 3, mood: f < 420 ? 'calm' : 'angry', look: f < 420 ? [0.3, 0] : [1, -0.4]},
    {name: 'Lithuania', p: [1068, 521], r: 10, seed: 4, mood: f < 240 ? 'calm' : f < 700 ? 'scared' : 'happy', look: [0.5, 0]},
    {name: 'Latvia', p: [1072, 470], r: 10, seed: 5, mood: f < 240 ? 'calm' : f < 700 ? 'scared' : 'happy', look: [0.5, 0]},
    {name: 'Estonia', p: [1080, 404], r: 9, seed: 6, mood: f < 240 ? 'calm' : f < 700 ? 'scared' : 'happy', look: [0.5, 0]},
    {name: 'Finland', p: [1075, 300], r: 16, seed: 7, mood: f < 545 ? 'calm' : 'angry', look: [0.2, 0.6]},
    {name: 'Sweden', p: [935, 330], r: 14, seed: 8, mood: 'calm'},
    {name: 'Germany', p: byName.Germany.c as P, r: 18, seed: 9, mood: f < 480 ? 'calm' : 'angry', look: [1, 0]},
    {name: 'France', p: byName.France.c as P, r: 20, seed: 10, mood: f < 480 ? 'calm' : 'angry', look: [1, 0]},
    {name: 'Spain', p: byName.Spain.c as P, r: 20, seed: 11, mood: f < 480 ? 'calm' : 'angry', look: [1, -0.5]},
    {name: 'United Kingdom', p: [700, 560], r: 14, seed: 12, mood: f < 480 ? 'calm' : 'angry', look: [1, 0]},
    {name: 'Italy', p: [880, 800], r: 15, seed: 13, mood: f < 480 ? 'calm' : 'angry', look: [1, -0.5]},
  ];

  const labels: {text: string; p: P; from: number; to: number; dy?: number; color?: string}[] = [
    {text: 'CORREDOR DE SUWAŁKI', p: C.Suwalki, from: 300, to: 425, dy: 28},
    {text: 'KALININGRADO CAE', p: C.Kaliningrad, from: 660, to: 760, dy: 26, color: BLUE},
  ];
  const cityLabels: {n: string; t: string}[] = [
    {n: 'Tallinn', t: 'Tallin'}, {n: 'Riga', t: 'Riga'}, {n: 'Vilnius', t: 'Vilna'}, {n: 'Warsaw', t: 'Varsovia'},
    {n: 'Minsk', t: 'Minsk'}, {n: 'Helsinki', t: 'Helsinki'},
  ];
  const cityAlpha = s > 1.8 ? lerp(s, 1.8, 2.2, 0, 1, Easing.linear) : 0;

  return (
    <svg width={1920} height={1080} style={{position: 'absolute'}}>
      <defs>
        {map.countries.map((c) => FLAG_OF[c.name] ? <FlagPattern key={c.name} id={`fl-${c.name.replace(/\W/g, '')}`} code={FLAG_OF[c.name]} box={flagBox(c)} /> : null)}
        <FlagPattern id="occ-ru" code="ru" box={[990, 360, 1170, 575]} />
        <clipPath id="land">{map.countries.map((c) => <path key={c.name} d={c.d} />)}</clipPath>
        <mask id="m-occ" maskUnits="userSpaceOnUse" x={-600} y={-600} width={3120} height={2280}>
          <rect x={-600} y={-600} width={3120} height={2280} fill="black" />
          {blob(occCircles, 'white', 'o')}
          {blob(libCircles, 'black', 'l')}
        </mask>
        <mask id="m-corr" maskUnits="userSpaceOnUse" x={-600} y={-600} width={3120} height={2280}>
          <rect x={-600} y={-600} width={3120} height={2280} fill="black" />
          {blob(corrCircles, 'white', 'c')}
          {blob(corrLib, 'black', 'cl')}
        </mask>
        <mask id="m-kal" maskUnits="userSpaceOnUse" x={-600} y={-600} width={3120} height={2280}>
          <rect x={-600} y={-600} width={3120} height={2280} fill="black" />
          {blob(kalCircles, 'white', 'k')}
        </mask>
      </defs>
      <g transform={tf}>
        {/* sombra de la tierra */}
        <g transform="translate(2.5,3.5)" opacity={0.28}>{map.countries.map((c) => <path key={c.name} d={c.d} fill="#06213f" />)}</g>
        {/* países */}
        {map.countries.map((c) => <path key={c.name} d={c.d} fill={FLAG_OF[c.name] ? `url(#fl-${c.name.replace(/\W/g, '')})` : '#efe3c8'} />)}
        {/* ocupación rusa */}
        <g mask="url(#m-occ)">{baltic.map((c) => <path key={c.name} d={c.d} fill="url(#occ-ru)" />)}</g>
        <g mask="url(#m-corr)"><path d={byName.Poland.d} fill="url(#occ-ru)" /><path d={byName.Lithuania.d} fill="url(#occ-ru)" /></g>
        {/* Kaliningrado tomado */}
        <g mask="url(#m-kal)"><path d={byName.Kaliningrad.d} fill="#2b6fd6" /></g>
        {/* relieve */}
        <image href={staticFile('relief.png')} x={-600} y={-600} width={3120} height={2280} preserveAspectRatio="none" clipPath="url(#land)" opacity={0.4} />
        {/* fronteras */}
        {map.countries.map((c) => <path key={c.name} d={c.d} fill="none" stroke={INK} strokeOpacity={0.55} strokeWidth={1.3} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />)}
        {/* concentración de tropas */}
        {f > 130 && f < 262 && [[1112, 540], [1100, 565], [1125, 440], [1118, 395], [1140, 500], [1035, 532]].map((p, i) => {
          const pulse = 0.5 + 0.5 * Math.sin((f - 130) / 5 + i);
          const a = lerp(f, 130 + i * 8, 150 + i * 8, 0, 1);
          return <g key={i} opacity={a}><circle cx={p[0]} cy={p[1]} r={(5 + pulse * 4) * Math.min(1, 2 / s) * 1.2} fill={RED} opacity={0.35} /><circle cx={p[0]} cy={p[1]} r={3.2 * Math.min(1, 2 / s) * 1.2} fill={RED} stroke={INK} strokeWidth={0.8} /></g>;
        })}
        {/* ciudades */}
        {cityAlpha > 0 && cityLabels.map(({n, t}) => {
          const p = C[n];
          return (
            <g key={n} opacity={cityAlpha} transform={`translate(${p[0]},${p[1]}) scale(${inv})`}>
              <circle r={6} fill="#fff" stroke={INK} strokeWidth={3} />
              <text x={10} y={-8} fontFamily="Fredoka" fontWeight={700} fontSize={22} fill="#fff" stroke={INK} strokeWidth={5} paintOrder="stroke">{t}</text>
            </g>
          );
        })}
        {/* flechas */}
        <Arrow a={[1095, 572]} b={[1048, 551]} bend={-8} f={f} start={240} end={270} color={RED} w={5.5} />
        <Arrow a={[1012, 534]} b={[1040, 548]} bend={6} f={f} start={252} end={288} color={RED} w={5.5} />
        <Arrow a={[1130, 545]} b={[1088, 528]} bend={-6} f={f} start={265} end={309} color={RED} w={5.5} />
        <Arrow a={[1118, 383]} b={[1066, 388]} bend={-10} f={f} start={285} end={336} color={RED} w={5.5} />
        <Arrow a={[1126, 432]} b={[1062, 462]} bend={10} f={f} start={310} end={372} color={RED} w={5.5} />
        <Arrow a={[1030, 604]} b={[1082, 532]} bend={-14} f={f} start={548} end={570} color={BLUE} w={5.5} />
        <Arrow a={[968, 548]} b={[1000, 535]} bend={-6} f={f} start={560} end={591} color={BLUE} w={5.5} />
        <Arrow a={[1045, 348]} b={[1090, 412]} bend={-12} f={f} start={575} end={615} color={BLUE} w={5.5} />
        <Arrow a={[1060, 520]} b={[1060, 466]} bend={-8} f={f} start={612} end={654} color={BLUE} w={5.5} />
        <Arrow a={[1065, 460]} b={[1112, 484]} bend={-10} f={f} start={650} end={690} color={BLUE} w={5.5} />
        {/* explosiones (sincronizadas con el audio) */}
        <Explosion p={[1118, 383]} f={f} at={251} r={12} />
        <Explosion p={[1048, 551]} f={f} at={270} r={12} />
        <Explosion p={[1040, 548]} f={f} at={288} r={12} />
        <Explosion p={[1088, 528]} f={f} at={309} r={12} />
        <Explosion p={[1066, 388]} f={f} at={336} r={12} />
        <Explosion p={[1062, 462]} f={f} at={372} r={12} />
        <Explosion p={[1082, 532]} f={f} at={570} r={12} />
        <Explosion p={[1000, 535]} f={f} at={591} r={12} />
        <Explosion p={[1090, 412]} f={f} at={615} r={12} />
        <Explosion p={[1060, 466]} f={f} at={654} r={12} />
        <Explosion p={[1112, 484]} f={f} at={690} r={12} />
        {/* caras */}
        {faces.map((fc) => <Face key={fc.name} x={fc.p[0]} y={fc.p[1]} r={fc.r} mood={fc.mood} f={f} seed={fc.seed} look={fc.look} />)}
        {/* etiquetas */}
        {labels.map((l) => {
          if (f < l.from || f > l.to) return null;
          const pop = spring({frame: f - l.from, fps: 30, config: {damping: 11}}) * lerp(f, l.to - 6, l.to, 1, 0);
          const w = l.text.length * 15 + 36;
          return (
            <g key={l.text} transform={`translate(${l.p[0]},${l.p[1] + (l.dy || 0)}) scale(${inv * pop})`}>
              <rect x={-w / 2} y={-22} width={w} height={44} rx={22} fill={l.color || '#ffc61a'} stroke={INK} strokeWidth={5} />
              <text y={11} textAnchor="middle" fontFamily="Lilita" fontSize={28} fill={l.color ? '#fff' : INK}>{l.text}</text>
            </g>
          );
        })}
      </g>
    </svg>
  );
};

export const War: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camera(f);
  const flash = f >= 240 && f < 252 ? lerp(f, 240, 252, 0.55, 0) : 0;
  return (
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <OCEAN />
      <Waves f={f} />
      <MapScene f={f} cam={cam} />
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
      <Bubble f={f} from={150} to={235} at={[1215, 425]} cam={cam} text="Solo son maniobras..." dy={-80} />
      <Bubble f={f} from={318} to={410} at={[1068, 521]} cam={cam} text="¡AYUDA!" dy={-40} />
      <Bubble f={f} from={432} to={530} at={byName.Poland.c as P} cam={cam} text="¡De aquí no pasáis!" dy={-50} />
      <Bubble f={f} from={600} to={700} at={[1064, 364]} cam={cam} text="¡Vamos, vecinos!" dy={-24} dx={-60} />
      <Bubble f={f} from={732} to={830} at={[1215, 425]} cam={cam} text="Vale, vale... paz" dy={-80} />
      <Bubble f={f} from={750} to={835} at={[1072, 470]} cam={cam} text="¡LIBRES!" dy={-36} dx={-20} />
      <LocationPill f={f} />
      <Card f={f} />
      <StatsPanel f={f} />
      <TerritoryPanel f={f} />
      <TitleIntro f={f} />
      <EndCard f={f} />
      <Footer />
      <Audio src={staticFile('music.wav')} />
    </AbsoluteFill>
  );
};
