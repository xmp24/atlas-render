import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {font} from '../lib3';
import MAP from './wars_eu.json';
import {TOPICS, Kind, Topic} from './topics';
import {FlagImg} from '../Indo2';
import {CODE} from '../HexWorld';

const DUR = 6; // segundos; todo lo que se mueve es periódico en 6 s para que el bucle sea perfecto
const TAU = Math.PI * 2;
const per = (t: number, k = 1, ph = 0) => Math.sin(TAU * (k * t / DUR) + ph);
const ANTON = {fontFamily: 'Anton'};
const stroke = (w: number) => ({paintOrder: 'stroke' as const, stroke: '#000', strokeWidth: w, strokeLinejoin: 'round' as const});

// ---------------- caras propias (escala de ánimo según nº de guerras) ----------------
const FACECOL: Record<Kind, [string, string]> = {vhappy: ['#fff27a', '#f5b400'], happy: ['#ffe86b', '#f2a800'], neutral: ['#ffe066', '#e89c00'], serious: ['#ffd15c', '#e08a00'], angry: ['#ff9a6b', '#e0281a'], demon: ['#c45cff', '#5a0099']};
const Face: React.FC<{kind: Kind; r: number; x: number; y: number; t: number; ph?: number}> = ({kind, r, x, y, t, ph = 0}) => {
  const id = `g${kind}`; const [c0, c1] = FACECOL[kind];
  const sh = kind === 'angry' ? per(t, 12, ph) * 2.5 : 0;
  const bob = per(t, 2, ph) * 4 + (kind === 'vhappy' ? Math.abs(per(t, 4, ph)) * -6 : 0), rot = per(t, 1, ph) * (kind === 'vhappy' ? 9 : 4);
  const E = '#2a1606';
  const eye = (cx: number, ry = 12) => <ellipse cx={cx} cy={-12} rx={8} ry={ry} fill={E} />;
  const parts: Record<Kind, React.ReactNode> = {
    vhappy: <><path d="M-32,-8 Q-20,-26 -8,-8 M8,-8 Q20,-26 32,-8" stroke={E} strokeWidth={7} fill="none" strokeLinecap="round" /><path d="M-36,6 Q0,60 36,6 Z" fill={E} /><path d="M-28,8 L28,8 L24,16 L-24,16 Z" fill="#fff" /><path d="M-16,34 Q0,44 16,34 Q0,26 -16,34 Z" fill="#e8334a" /><ellipse cx={-34} cy={12} rx={10} ry={6} fill="#ff6b8a" opacity={0.7} /><ellipse cx={34} cy={12} rx={10} ry={6} fill="#ff6b8a" opacity={0.7} /></>,
    happy: <>{eye(-18, 10)}{eye(18, 10)}<path d="M-26,14 Q0,38 26,14" stroke={E} strokeWidth={7} fill="none" strokeLinecap="round" /></>,
    neutral: <>{eye(-18, 11)}{eye(18, 11)}<path d="M-20,24 L20,24" stroke={E} strokeWidth={7} strokeLinecap="round" /></>,
    serious: <><path d="M-34,-30 L-8,-26 M34,-30 L8,-26" stroke={E} strokeWidth={7} strokeLinecap="round" />{eye(-18, 9)}{eye(18, 9)}<path d="M-20,30 Q0,20 20,30" stroke={E} strokeWidth={7} fill="none" strokeLinecap="round" /></>,
    angry: <><path d="M-38,-36 L-8,-20 M38,-36 L8,-20" stroke={E} strokeWidth={8} strokeLinecap="round" />{eye(-20, 9)}{eye(20, 9)}<path d="M-26,34 Q0,12 26,34 Z" fill={E} /><path d="M-18,30 L18,30" stroke="#fff" strokeWidth={4} /><path d="M40,-50 l10,10 m0,-10 l-10,10 M30,-56 l5,5" stroke="#b00000" strokeWidth={5} strokeLinecap="round" /></>,
    demon: <><path d="M-34,-36 Q-52,-74 -24,-90 Q-34,-62 -16,-44 Z M34,-36 Q52,-74 24,-90 Q34,-62 16,-44 Z" fill="#2a0040" stroke="#000" strokeWidth={4} /><path d="M-38,-28 L-8,-14 M38,-28 L8,-14" stroke="#1a0026" strokeWidth={8} strokeLinecap="round" /><path d="M-30,-10 L-10,-4 L-28,2 Z M30,-10 L10,-4 L28,2 Z" fill="#ffe600" /><path d="M-36,10 Q0,58 36,10 Q0,26 -36,10 Z" fill="#1a0026" /><path d="M-26,16 L-20,26 L-14,18 L-8,28 L-2,19 L4,28 L10,18 L16,26 L22,16 L26,14 Q0,24 -26,14 Z" fill="#fff" /></>,
  };
  return (
    <g transform={`translate(${x + sh},${y + bob}) rotate(${rot}) scale(${r / 50})`}>
      <defs><radialGradient id={id} cx="38%" cy="30%" r="75%"><stop offset="0%" stopColor={c0} /><stop offset="100%" stopColor={c1} /></radialGradient></defs>
      {kind === 'demon' && <circle r={64 + 6 * per(t, 3)} fill="#b000ff" opacity={0.35} />}
      <ellipse cx={4} cy={8} rx={50} ry={48} fill="rgba(0,0,0,0.4)" />
      <circle r={50} fill={`url(#${id})`} stroke="#000" strokeWidth={3} />
      <ellipse cx={-16} cy={-30} rx={18} ry={9} fill="rgba(255,255,255,0.45)" />
      {parts[kind]}
    </g>
  );
};

// ---------------- iconos propios de la cabecera ----------------
const Swords: React.FC<{t: number}> = ({t}) => (
  <g transform={`translate(150,160) rotate(${per(t, 1) * 4})`}>
    {[-1, 1].map((s) => (
      <g key={s} transform={`scale(${s},1) rotate(-45)`}>
        <path d="M-9,-105 L0,-125 L9,-105 L9,30 L-9,30 Z" fill="#e9eef5" stroke="#000" strokeWidth={6} strokeLinejoin="round" />
        <path d="M0,-118 L0,26" stroke="#9aa8b8" strokeWidth={4} />
        <rect x={-34} y={28} width={68} height={14} rx={6} fill="#ffcc2e" stroke="#000" strokeWidth={6} />
        <rect x={-8} y={42} width={16} height={38} rx={5} fill="#8a4b20" stroke="#000" strokeWidth={6} />
        <circle cy={88} r={11} fill="#ffcc2e" stroke="#000" strokeWidth={6} />
      </g>
    ))}
  </g>
);
const Helmet: React.FC<{t: number}> = ({t}) => (
  <g transform={`translate(930,160) rotate(${per(t, 1, 1.5) * 4})`}>
    <circle r={92} fill="#f6dfb2" stroke="#000" strokeWidth={6} />
    <circle r={78} fill="#ffeccb" />
    <path d="M-66,22 Q-62,-62 0,-66 Q62,-62 66,22 Z" fill="#5b6b2e" stroke="#000" strokeWidth={6} strokeLinejoin="round" />
    <path d="M-80,22 L80,22 Q78,40 60,40 L-60,40 Q-78,40 -80,22 Z" fill="#46551f" stroke="#000" strokeWidth={6} strokeLinejoin="round" />
    <path d="M-40,-40 Q-20,-56 6,-54" stroke="#8a9a52" strokeWidth={8} fill="none" strokeLinecap="round" />
    <path d="M0,-38 l7,15 16,2 -12,11 3,16 -14,-8 -14,8 3,-16 -12,-11 16,-2 Z" fill="#ffcc2e" stroke="#000" strokeWidth={3} />
  </g>
);
const SubPill: React.FC<{t: number}> = ({t}) => {
  const s = 1 + 0.04 * Math.max(0, per(t, 3));
  const play = (x: number, dir: number) => <g transform={`translate(${x},0)`}><rect x={-22} y={-16} width={44} height={32} rx={9} fill="#ff0000" /><path d={dir > 0 ? 'M-6,-9 L10,0 L-6,9 Z' : 'M6,-9 L-10,0 L6,9 Z'} fill="#fff" /></g>;
  return (
    <g transform={`translate(540,160) scale(${s})`}>
      <rect x={-205} y={-40} width={410} height={80} rx={14} fill="#111" stroke="#cfcfcf" strokeWidth={5} />
      {play(-160, 1)}{play(160, -1)}
      <text x={0} y={14} textAnchor="middle" style={{...font, fontSize: 44}} fill="#fff">Subscribe!</text>
    </g>
  );
};

// ---------------- fondo oscuro animado (niebla en movimiento, reflectores, fuego y brasas) ----------------
const EMB = Array.from({length: 130}, (_, i) => ({x: (i * 233.7) % 1080, ph: (i * 0.618) % 1, sp: 1 + (i % 3), r: 1.6 + (i % 5) * 1.2, sw: 20 + (i % 6) * 14, dr: (i % 2 ? 1 : -1) * (40 + (i % 4) * 30)}));
const Bg: React.FC<{t: number}> = ({t}) => {
  const u = t / DUR;
  const beam = (cx: number, a0: number, amp: number, k: number, ph: number, key: string) => {
    const a = a0 + amp * per(t, k, ph);
    return <g key={key} transform={`translate(${cx},1980) rotate(${a})`}><path d="M-14,0 L-190,-2300 L190,-2300 L14,0 Z" fill="url(#beam)" /></g>;
  };
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 88%, #4a1f0c 0%, #170e0b 45%, #07080b 100%)'}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <filter id="blur"><feGaussianBlur stdDeviation={55} /></filter>
          <filter id="fogf" x="0" y="0" width="1080" height="1920" filterUnits="userSpaceOnUse">
            <feTurbulence type="fractalNoise" baseFrequency="0.0028 0.0042" numOctaves={4} seed={9} stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.72  0 0 0 0 0.74  0 0 0 0 0.8  0 0 0 1.25 -0.52" />
          </filter>
          <pattern id="fog" width={1080} height={1920} patternUnits="userSpaceOnUse" patternTransform={`translate(${-u * 1080},0)`}><rect width={1080} height={1920} filter="url(#fogf)" /></pattern>
          <pattern id="fog2" width={1080} height={1920} patternUnits="userSpaceOnUse" patternTransform={`translate(${u * 2160},${-u * 1920}) scale(1)`}><rect width={1080} height={1920} filter="url(#fogf)" /></pattern>
          <radialGradient id="fire" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#ff6a1a" stopOpacity={0.65} /><stop offset="100%" stopColor="#ff6a1a" stopOpacity={0} /></radialGradient>
          <linearGradient id="beam" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#fff6d8" stopOpacity={0.32} /><stop offset="100%" stopColor="#fff6d8" stopOpacity={0} /></linearGradient>
        </defs>
        <g filter="url(#blur)" opacity={0.6}>
          {[0, 1, 2, 3, 4, 5].map((i) => <ellipse key={i} cx={540 + per(t, 1 + (i % 2), i) * 420 + (i - 2.5) * 90} cy={300 + i * 290 + per(t, 2, i + 2) * 110} rx={380} ry={190} fill={i % 2 ? '#3d414b' : '#2a2c33'} />)}
        </g>
        <rect width={1080} height={1920} fill="url(#fog)" opacity={0.42} />
        <rect width={1080} height={1920} fill="url(#fog2)" opacity={0.22} />
        <g style={{mixBlendMode: 'screen'}}>
          {beam(170, 18, 22, 1, 0, 'b1')}{beam(910, -18, 22, 1, 2.2, 'b2')}{beam(540, 0, 30, 1, 4.1, 'b3')}
        </g>
        <ellipse cx={540 + per(t, 2) * 90} cy={1900} rx={820} ry={380} fill="url(#fire)" opacity={0.7 + 0.18 * per(t, 6) + 0.1 * per(t, 11, 1)} />
        <ellipse cx={240 + per(t, 3, 1) * 50} cy={1940} rx={360} ry={200} fill="url(#fire)" opacity={0.5 + 0.3 * per(t, 9, 2)} />
        <ellipse cx={850 + per(t, 3, 2) * 50} cy={1940} rx={360} ry={200} fill="url(#fire)" opacity={0.5 + 0.3 * per(t, 7, 3)} />
        {EMB.map((e, i) => {
          const q = (u * e.sp + e.ph) % 1; const y = 1980 - q * 2150; const x = e.x + Math.sin(TAU * (q * 2 + e.ph)) * e.sw + q * e.dr;
          return <circle key={i} cx={x} cy={y} r={e.r} fill={i % 3 ? '#ffb347' : '#ff5a1a'} opacity={0.85 * Math.sin(Math.PI * q) * (0.6 + 0.4 * per(t, 5 + (i % 4), i))} />;
        })}
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.6) 100%)'}} />
    </AbsoluteFill>
  );
};

// ---------------- datos y textos ----------------
type C = {c: string; d: string; col: string; v: number; x: number; y: number; a: number};
const CS = (MAP as any).cs as C[];
// huecos de maquetación por país (coordenadas del mapa): n = número, f = cara, m = comentario
type Slot = {n: [number, number]; f: [number, number]; m: [number, number]; r?: number; fs?: number; lead?: boolean};
const SLOT: Record<string, Slot> = {
  RUS: {n: [1012, 805], f: [962, 712], m: [975, 875], r: 54},
  USA: {n: [310, 520], f: [205, 525], m: [262, 602], r: 46},
  SWE: {n: [762, 772], f: [748, 688], m: [762, 822], r: 32, fs: 58},
  FIN: {n: [870, 815], f: [852, 735], m: [870, 862], r: 32, fs: 58},
  GBR: {n: [522, 1050], f: [505, 968], m: [300, 1090], r: 34, fs: 64},
  FRA: {n: [565, 1262], f: [508, 1180], m: [318, 1262], r: 44},
  ESP: {n: [492, 1372], f: [418, 1352], m: [450, 1438], r: 40},
  DEU: {n: [704, 1082], f: [645, 1068], m: [668, 1152], r: 34, fs: 64},
  ITA: {n: [718, 1336], f: [688, 1268], m: [700, 1392], r: 28, fs: 64},
  TUR: {n: [1030, 1410], f: [935, 1402], m: [960, 1468], r: 42},
  CHE: {n: [628, 1528], f: [622, 1230], m: [640, 1588], r: 17, fs: 60},
  POL: {n: [826, 1086], f: [768, 1076], m: [800, 1140], r: 30, fs: 58},
  IRL: {n: [430, 1042], f: [428, 990], m: [292, 975], r: 22, fs: 44},
  ISL: {n: [452, 664], f: [392, 656], m: [420, 722], r: 26, fs: 48},
  PRT: {n: [342, 1380], f: [345, 1322], m: [240, 1290], r: 20, fs: 40},
  GRC: {n: [868, 1408], f: [835, 1446], m: [820, 1520], r: 20, fs: 44},
  NOR: {n: [676, 862], f: [672, 800], m: [600, 760], r: 26, fs: 48},
};
const NOFF: Record<string, [number, number]> = {CZE: [30, 12]};
const SKIP = new Set(['GEO', 'LUX', 'CYP', 'ARM', 'AZE']);
const mix = (a: string, b: string, k: number) => { const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
const bandOf = (T: Topic, v: number) => T.bands.find((b) => v >= b.lo && v <= b.hi) ?? (v < Math.min(...T.bands.map((b) => b.lo)) ? T.bands[0] : T.bands[T.bands.length - 1]);
const colOf = (T: Topic, v: number | null | undefined) => { if (v === null || v === undefined) return '#3e4148'; const b = bandOf(T, v); return b.hi === b.lo ? b.c0 : mix(b.c0, b.c1, Math.min(1, Math.max(0, (v - b.lo) / (b.hi - b.lo)))); };
const TitleLine: React.FC<{s: string; y: number; fs: number}> = ({s, y, fs}) => (
  <text x={540} y={y} textAnchor="middle" style={{...font, fontSize: fs}} fill="#fff" {...stroke(fs * 0.15)}>
    {s.split('*').map((p, i) => <tspan key={i} fill={i % 2 ? '#ff2a2a' : '#fff'}>{p}</tspan>)}
  </text>
);

const Hook: React.FC<{T: Topic; t: number}> = ({T, t}) => {
  const H = T.hook!; const out = Math.min(1, Math.max(0, (t - H.end) / 0.3));
  const pop = (t0: number) => { const u = Math.min(1, Math.max(0, (t - t0) / 0.22)); return u < 1 ? 0.4 + 0.75 * Math.sin(u * Math.PI * 0.62) / Math.sin(Math.PI * 0.62) * (1 + 0.15 * (1 - u)) : 1; };
  const cnt = H.num * Math.min(1, Math.max(0, (t - 0.12) / 0.75)) ** 0.6;
  const shake = t > H.swap && t < H.swap + 0.25 ? Math.sin(t * 90) * 10 * (1 - (t - H.swap) / 0.25) : 0;
  const flash = t > H.end && t < H.end + 0.15 ? 1 - (t - H.end) / 0.15 : 0;
  return (
    <AbsoluteFill style={{zIndex: 50}}>
      <AbsoluteFill style={{background: 'rgba(5,6,10,0.86)', opacity: 1 - out, backdropFilter: 'blur(6px)'}} />
      <AbsoluteFill style={{opacity: 1 - out, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `translateX(${shake}px)`}}>
        <div style={{transform: `scale(${pop(0)}) rotate(-4deg)`, border: '8px solid #000', borderRadius: 18, overflow: 'hidden', lineHeight: 0, boxShadow: '0 14px 0 rgba(0,0,0,0.6)'}}><FlagImg k={CODE.indexOf(H.a2)} w={330} h={230} /></div>
        <div style={{marginTop: 50, ...font, fontSize: 108, color: '#fff', WebkitTextStroke: '16px #000', paintOrder: 'stroke fill', transform: `scale(${pop(0.08)})`}}>{H.l1}</div>
        <div style={{...ANTON, fontSize: 210, lineHeight: 1.05, color: '#ff2a2a', WebkitTextStroke: '22px #000', paintOrder: 'stroke fill', transform: `scale(${pop(0.12) * (1 + 0.04 * Math.sin(t * 30) * (t < 0.9 ? 1 : 0))})`}}>{H.numFmt(cnt)}</div>
        <div style={{...font, fontSize: 118, color: '#ffd23f', WebkitTextStroke: '16px #000', paintOrder: 'stroke fill', transform: `scale(${pop(0.2)})`}}>BUNKERS 🤯</div>
        {t > H.swap && <div style={{marginTop: 40, ...font, fontSize: 70, whiteSpace: 'nowrap', color: '#fff', background: '#7a00e0', border: '8px solid #000', borderRadius: 26, padding: '14px 34px 4px', transform: `scale(${pop(H.swap)}) rotate(2deg)`}}>{H.l2}</div>}
      </AbsoluteFill>
      {flash > 0 && <AbsoluteFill style={{background: '#fff', opacity: flash * 0.85}} />}
    </AbsoluteFill>
  );
};

export const WarsShort: React.FC<{topic?: string; thumb?: boolean}> = ({topic = 'wars'}) => {
  const f = useCurrentFrame(); const t = f / 30;
  const T = TOPICS[topic]; const fmtv = T.fmt ?? ((v: number) => `${v}`);
  const tfs = Math.min(92, ...T.title.map((l) => 1010 / (0.5 * l.replace(/\*/g, '').length)));
  const list = CS.filter((c) => (c.c !== 'USA' || T.usa));
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <Audio src={staticFile(T.audio ?? 'sw/loop_ref.wav')} />
      <Bg t={t} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs><filter id="ds" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx={0} dy={8} stdDeviation={10} floodColor="#000" floodOpacity={0.7} /></filter></defs>
        <g transform="translate(0,45)">
        <g filter="url(#ds)">
          {list.map((c) => <path key={c.c} d={c.d} fill={colOf(T, T.vals[c.c])} stroke="#0b0b0b" strokeWidth={2.4} strokeLinejoin="round" />)}
        </g>
        {/* números */}
        {list.filter((c) => !SKIP.has(c.c) && T.vals[c.c] !== null && T.vals[c.c] !== undefined).map((c) => {
          const v = T.vals[c.c] as number; const txt = fmtv(v); const F = T.fun[c.c]; const S = F && (SLOT[c.c] || T.slots?.[c.c]) ? {...(SLOT[c.c] ?? {}), ...(T.slots?.[c.c] ?? {})} as Slot : undefined;
          const base = Math.max(20, Math.min(54, 12 + Math.sqrt(c.a) * 0.32)); const wfit = (Math.sqrt(c.a) * 1.05) / (0.46 * Math.max(1, txt.length));
          const fs = S ? Math.min(S.fs ?? 74, (S.fs ?? 74) * 2.6 / Math.max(1, txt.length)) : Math.max(17, Math.min(base, wfit));
          const o = NOFF[c.c] ?? [0, 0]; let [x, y] = S ? S.n : [c.x + o[0], c.y + o[1]];
          if (S && S.f[0] < S.n[0]) x += Math.max(0, txt.length - 2) * fs * 0.22;
          x = Math.min(x, 1080 - 0.25 * fs * txt.length - 10);
          const pulse = S ? 1 + 0.035 * per(t, 2, c.x) : 1;
          return (
            <g key={c.c}>
              {S && (c.c === 'CHE' || S.lead) && <><path d={`M${c.x},${c.y + 18} L${x + 4},${y - fs * 0.6}`} stroke="#000" strokeWidth={9} strokeLinecap="round" /><path d={`M${c.x},${c.y + 18} L${x + 4},${y - fs * 0.6}`} stroke="#fff" strokeWidth={4} strokeDasharray="10 7" /></>}
              <text x={x} y={y + fs * 0.36} textAnchor="middle" transform={`translate(${x},${y}) scale(${pulse}) translate(${-x},${-y})`} style={{...ANTON, fontSize: fs}} fill="#fff" {...stroke(Math.max(4, fs * 0.13))}>{txt}</text>
              {S && F.txt.map((ln, i) => <text key={i} x={S.m[0]} y={S.m[1] + i * 32} textAnchor="middle" style={{...ANTON, fontSize: 30}} fill="#fff" {...stroke(6)}>{ln}</text>)}
            </g>
          );
        })}
        {list.filter((c) => T.fun[c.c] && (SLOT[c.c] || T.slots?.[c.c]) && T.vals[c.c] !== null && T.vals[c.c] !== undefined && !(T.noFace ?? []).includes(c.c) && T.fun[c.c].face !== null).map((c, i) => {
          const S = {...(SLOT[c.c] ?? {}), ...(T.slots?.[c.c] ?? {})} as Slot; const k = (T.fun[c.c].face ?? bandOf(T, T.vals[c.c] as number).face) as Kind;
          return <Face key={c.c} kind={k} r={S.r ?? 44} x={S.f[0]} y={S.f[1]} t={t} ph={i * 1.3} />;
        })}
        </g>
        {/* cabecera */}
        <Swords t={t} /><Helmet t={t} /><SubPill t={t} />
        <TitleLine s={T.title[0]} y={340} fs={tfs} />
        <TitleLine s={T.title[1]} y={340 + tfs * 1.1} fs={tfs} />
        {/* leyenda */}
        <g transform="translate(540,1718)">
          {[...T.bands.map((b) => ({lab: b.lab, col: b.hi === b.lo ? b.c0 : mix(b.c0, b.c1, 0.5)})), ...(T.nodata ? [{lab: '?', col: '#3e4148'}] : [])].map((b, i, arr) => { const n = arr.length; const w = Math.min(150, 1040 / n); const x = (i - (n - 1) / 2) * w; const lab = b.lab; const lfs = Math.min(36, (w - 20) / (0.48 * lab.length));
            return <g key={i} transform={`translate(${x},0)`}><rect x={-w / 2 + 8} y={-26} width={w - 16} height={52} rx={14} fill={b.col} stroke="#000" strokeWidth={4} /><text x={0} y={lfs * 0.36} textAnchor="middle" style={{...ANTON, fontSize: lfs}} fill="#fff" {...stroke(6)}>{lab}</text></g>; })}
        </g>
        {/* marca de agua */}
        <g opacity={0.22}>
          {Array.from({length: 10}, (_, i) => { const a = (i / 10) * TAU - Math.PI / 2; return <text key={i} x={540 + Math.cos(a) * 150} y={1812 + Math.sin(a) * 58 + 14} textAnchor="middle" style={{fontSize: 40}} fill="#fff">★</text>; })}
          <text x={540} y={1834} textAnchor="middle" style={{...font, fontSize: 58, letterSpacing: 2}} fill="#fff">ATLAS OF WAR</text>
        </g>
        <text x={540} y={1890} textAnchor="middle" style={{...font, fontSize: Math.min(24, 2000 / T.source.length)}} fill="rgba(255,255,255,0.55)">{T.source}</text>
      </svg>
      {T.hook && t < T.hook.end + 0.35 && <Hook T={T} t={t} />}
    </AbsoluteFill>
  );
};
