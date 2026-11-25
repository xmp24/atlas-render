import React from 'react';
import {staticFile} from 'remotion';

// ---------- emblemas en caja 100x100 ----------
const P = (pts: number[][]) => 'M' + pts.map((p) => p.join(' ')).join('L') + 'Z';
const mirror = (half: number[][]) => P([...half, ...half.slice().reverse().map(([x, y]) => [100 - x, y])]);

const crescent = (R = 40, r = 33, d = 13, rot = -30) => {
  // círculo grande menos círculo desplazado
  const a = (d * d + R * R - r * r) / (2 * d), h = Math.sqrt(Math.max(R * R - a * a, 1));
  const c = Math.cos((rot * Math.PI) / 180), s = Math.sin((rot * Math.PI) / 180);
  const T = (x: number, y: number) => [50 + x * c - y * s, 50 + x * s + y * c];
  const [p1x, p1y] = T(a, -h), [p2x, p2y] = T(a, h);
  return `M${p1x} ${p1y} A${R} ${R} 0 1 0 ${p2x} ${p2y} A${r} ${r} 0 1 1 ${p1x} ${p1y}Z`;
};
const star = (cx = 50, cy = 50, R = 40, r = 16, n = 5, rot = -90) => {
  const pts: number[][] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = ((rot + (i * 180) / n) * Math.PI) / 180, k = i % 2 ? r : R;
    pts.push([cx + k * Math.cos(a), cy + k * Math.sin(a)]);
  }
  return P(pts);
};
const rays = (n: number, R1: number, R2: number, w: number, cx = 50, cy = 50, rot = 0) => {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = ((rot + (i * 360) / n) * Math.PI) / 180, b = (w * Math.PI) / 180;
    d += P([[cx + R1 * Math.cos(a - b), cy + R1 * Math.sin(a - b)], [cx + R2 * Math.cos(a), cy + R2 * Math.sin(a)], [cx + R1 * Math.cos(a + b), cy + R1 * Math.sin(a + b)]]);
  }
  return d;
};
const circ = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;

const DEAGLE = mirror([[50, 40], [53, 33], [56, 25], [59, 17], [63, 12], [68, 12], [72, 16], [77, 18], [72, 21], [67, 21], [64, 27], [61, 36], [68, 33], [76, 26], [85, 20], [95, 17], [96, 24], [91, 29], [97, 33], [91, 39], [96, 45], [88, 49], [92, 55], [81, 56], [72, 55], [64, 57], [63, 64], [70, 68], [74, 76], [66, 73], [62, 80], [60, 90], [55, 86], [52, 94], [50, 88]]);
const EAGLE = mirror([[50, 10], [55, 11], [59, 15], [65, 19], [59, 21], [56, 25], [57, 33], [66, 31], [75, 24], [85, 18], [95, 15], [96, 23], [91, 28], [97, 32], [91, 38], [96, 44], [88, 48], [92, 54], [81, 55], [70, 53], [62, 56], [62, 64], [70, 68], [74, 76], [66, 73], [62, 80], [60, 90], [55, 86], [52, 94], [50, 88]]);
const FALCON = mirror([[50, 14], [54, 16], [56, 22], [54, 30], [62, 34], [72, 34], [84, 30], [97, 22], [94, 30], [98, 34], [92, 40], [96, 44], [86, 48], [88, 54], [76, 54], [62, 52], [58, 60], [64, 72], [70, 88], [60, 82], [56, 92], [50, 86]]);
const LION =
  P([[30, 46], [36, 40], [48, 38], [62, 38], [72, 40], [80, 44], [84, 52], [82, 60], [86, 70], [88, 82], [82, 82], [79, 70], [74, 62], [70, 66], [72, 82], [66, 82], [63, 66], [50, 64], [42, 66], [42, 82], [36, 82], [35, 66], [31, 62], [28, 74], [28, 82], [22, 82], [23, 66], [26, 56]]) +
  P([[80, 46], [86, 38], [90, 30], [96, 30], [94, 36], [90, 40], [88, 48], [84, 54]]) +
  P([[14, 26], [22, 20], [32, 22], [38, 30], [40, 40], [36, 50], [28, 54], [18, 52], [10, 46], [8, 38]]) +
  P([[6, 38], [2, 40], [4, 44], [8, 44]]) + circ(21, 33, 2.2);
const FLEUR =
  P([[50, 8], [58, 22], [60, 40], [56, 58], [50, 64], [44, 58], [40, 40], [42, 22]]) +
  P([[40, 50], [30, 38], [18, 36], [10, 44], [14, 56], [24, 60], [20, 50], [28, 48], [38, 58]]) +
  P([[60, 50], [70, 38], [82, 36], [90, 44], [86, 56], [76, 60], [80, 50], [72, 48], [62, 58]]) +
  P([[28, 60], [72, 60], [72, 68], [28, 68]]) +
  P([[44, 68], [56, 68], [60, 90], [50, 82], [40, 90]]);
const SWORDS = P([[16, 22], [22, 16], [84, 78], [78, 84]]) + P([[84, 22], [78, 16], [16, 78], [22, 84]]) + P([[66, 60], [72, 54], [80, 62], [74, 68]]) + P([[34, 60], [28, 54], [20, 62], [26, 68]]);
const SOYOMBO = P([[50, 4], [56, 14], [53, 20], [60, 16], [58, 26], [42, 26], [40, 16], [47, 20], [44, 14]]) + circ(50, 38, 9) + crescent(14, 12, 6, 90).replace(/^/, '');
const CROSS_PATTEE = P([[42, 10], [58, 10], [54, 40], [90, 36], [90, 64], [54, 60], [58, 90], [42, 90], [46, 60], [10, 64], [10, 36], [46, 40]]);
const CHAKRA = (() => {
  let d = '';
  for (let i = 0; i < 24; i++) {
    const a = (i * 15 * Math.PI) / 180;
    d += P([[50 + 4 * Math.cos(a - 0.12), 50 + 4 * Math.sin(a - 0.12)], [50 + 38 * Math.cos(a), 50 + 38 * Math.sin(a)], [50 + 4 * Math.cos(a + 0.12), 50 + 4 * Math.sin(a + 0.12)]]);
  }
  return d;
})();

export const EMB: Record<string, (c: string, c2?: string) => React.ReactNode> = {
  crescent: (c) => <path d={crescent()} fill={c} />,
  crescentStar: (c) => <><path d={crescent(36, 30, 12, -20)} fill={c} /><path d={star(70, 44, 14, 6)} fill={c} /></>,
  star: (c) => <path d={star()} fill={c} />,
  circles3: (c) => <><path d={circ(30, 32, 17) + circ(70, 32, 17) + circ(50, 68, 17)} fill={c} /></>,
  chakra: (c) => <><circle cx={50} cy={50} r={42} fill="none" stroke={c} strokeWidth={6} /><path d={CHAKRA} fill={c} /><circle cx={50} cy={50} r={7} fill={c} /></>,
  sun: (c) => <><circle cx={50} cy={50} r={22} fill={c} /><path d={rays(16, 24, 46, 6)} fill={c} /></>,
  surya: (c) => <><circle cx={50} cy={50} r={18} fill={c} /><path d={rays(8, 18, 48, 12) + rays(8, 18, 36, 7, 50, 50, 22.5)} fill={c} /><path d={rays(32, 20, 30, 2.5, 50, 50, 5.6)} fill={c} /></>,
  vergina: (c) => <><circle cx={50} cy={50} r={10} fill={c} /><path d={rays(8, 12, 46, 5) + rays(8, 12, 36, 4, 50, 50, 22.5)} fill={c} /></>,
  deagle: (c) => <path d={DEAGLE} fill={c} />,
  eagle: (c) => <path d={EAGLE} fill={c} />,
  falcon: (c) => <path d={FALCON} fill={c} />,
  lionSun: (c, c2) => <><circle cx={60} cy={32} r={20} fill={c2 || c} /><path d={rays(22, 21, 32, 4.5, 60, 32)} fill={c2 || c} /><path d={LION} fill={c} stroke="rgba(0,0,0,0.35)" strokeWidth={1.2} transform="translate(0 10)" /></>,
  fleur: (c) => <path d={FLEUR} fill={c} />,
  fleur3: (c) => <><path d={FLEUR} fill={c} transform="translate(14 4) scale(.36)" /><path d={FLEUR} fill={c} transform="translate(50 4) scale(.36)" /><path d={FLEUR} fill={c} transform="translate(32 52) scale(.36)" /></>,
  swordsCrescent: (c, c2) => <><path d={crescent(42, 36, 16, 90)} fill={c} /><path d={SWORDS} fill={c2 || '#111'} /><path d={star(50, 18, 12, 5)} fill={c} /></>,
  soyombo: (c) => <path d={SOYOMBO} fill={c} />,
  pattee: (c) => <path d={CROSS_PATTEE} fill={c} />,
  chakraSmall: (c) => <><circle cx={50} cy={50} r={40} fill="none" stroke={c} strokeWidth={7} /><path d={CHAKRA} fill={c} /></>,
  dharma: (c) => <><circle cx={50} cy={50} r={36} fill="none" stroke={c} strokeWidth={8} /><path d={rays(8, 8, 46, 7)} fill={c} /><circle cx={50} cy={50} r={10} fill={c} /></>,
  triangle: (c) => <path d={P([[50, 12], [90, 84], [10, 84]])} fill={c} />,
  diamond: (c) => <path d={P([[50, 8], [90, 50], [50, 92], [10, 50]])} fill={c} />,
  lotus: (c) => <><path d={P([[50, 12], [62, 40], [50, 72], [38, 40]]) + P([[30, 30], [48, 56], [44, 74], [22, 54]]) + P([[70, 30], [52, 56], [56, 74], [78, 54]])} fill={c} /><rect x={20} y={74} width={60} height={8} fill={c} /></>,
  kris: (c) => <path d={P([[48, 6], [54, 14], [50, 22], [56, 30], [50, 40], [56, 50], [50, 60], [54, 66], [62, 70], [62, 76], [54, 76], [54, 94], [46, 94], [46, 76], [38, 76], [38, 70], [46, 66], [44, 56], [50, 46], [44, 36], [50, 26], [44, 18]])} fill={c} />,
  arrows: (c) => <><path d="M18 92 C 16 60, 26 34, 44 18" fill="none" stroke={c} strokeWidth={7} strokeLinecap="round" /><path d={P([[36, 14], [52, 10], [46, 26]])} fill={c} /><path d="M64 96 C 70 66, 78 44, 90 30" fill="none" stroke={c} strokeWidth={7} strokeLinecap="round" /><path d={P([[82, 26], [96, 22], [94, 38]])} fill={c} /></>,
  tamga: (c) => <path d={P([[20, 20], [32, 20], [32, 56], [68, 56], [68, 20], [80, 20], [80, 68], [56, 68], [56, 90], [44, 90], [44, 68], [20, 68]])} fill={c} />,
};
export const textEmb = (t: string, c: string, size = 34, y = 50) => <text x={50} y={y} textAnchor="middle" dominantBaseline="central" fontFamily="ShortsFont" fontSize={size} fill={c}>{t}</text>;

// ---------- banderas ----------
export type FlagSpec = {
  img?: string; // flag-icons iso2
  bg?: string; h?: string[]; v?: string[]; w?: number[];
  nordic?: [string, string?]; nx?: number; ny?: number; nt?: number; saltire?: string; cross?: string; rays?: [string, string, number?];
  emb?: string; ec?: string; ec2?: string; es?: number; ex?: number; ey?: number; text?: [string, string, number?];
  canton?: string; border?: string;
};

export const Flag: React.FC<{f: FlagSpec; w: number; h: number}> = ({f, w, h}) => {
  if (f.img) return <image href={staticFile(`sh/flags/${f.img}.svg`)} x={0} y={0} width={w} height={h} preserveAspectRatio="none" />;
  const out: React.ReactNode[] = [<rect key="bg" x={0} y={0} width={w} height={h} fill={f.bg || '#fff'} />];
  const band = (cols: string[], horiz: boolean) => {
    const ws = f.w || cols.map(() => 1), tot = ws.reduce((a, b) => a + b, 0); let acc = 0;
    cols.forEach((c, i) => {
      const a = acc / tot, b = (acc + ws[i]) / tot; acc += ws[i];
      out.push(horiz ? <rect key={'h' + i} x={0} y={a * h} width={w} height={(b - a) * h + 1} fill={c} /> : <rect key={'v' + i} x={a * w} y={0} width={(b - a) * w + 1} height={h} fill={c} />);
    });
  };
  if (f.h) band(f.h, true);
  if (f.v) band(f.v, false);
  if (f.rays) {
    const [c1, c2, n = 16] = f.rays, cx = w * 0.44, cy = h * 0.5, R = Math.hypot(w, h);
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2, a1 = ((i + 0.5) / n) * Math.PI * 2;
      out.push(<path key={'r' + i} d={`M${cx} ${cy}L${cx + R * Math.cos(a0)} ${cy + R * Math.sin(a0)}L${cx + R * Math.cos(a1)} ${cy + R * Math.sin(a1)}Z`} fill={c1} />);
    }
    out.push(<circle key="rc" cx={cx} cy={cy} r={Math.min(w, h) * 0.2} fill={c1} />);
    void c2;
  }
  if (f.nordic) {
    const t = Math.min(w, h) * (f.nt ?? 0.16), cx = w * (f.nx ?? 0.36), cy = h * (f.ny ?? 0.5);
    out.push(<rect key="n1" x={cx - t / 2} y={0} width={t} height={h} fill={f.nordic[0]} />, <rect key="n2" x={0} y={cy - t / 2} width={w} height={t} fill={f.nordic[0]} />);
    if (f.nordic[1]) { const t2 = t * 0.45; out.push(<rect key="n3" x={cx - t2 / 2} y={0} width={t2} height={h} fill={f.nordic[1]} />, <rect key="n4" x={0} y={h / 2 - t2 / 2} width={w} height={t2} fill={f.nordic[1]} />); }
  }
  if (f.cross) { const t = Math.min(w, h) * 0.18; out.push(<rect key="c1" x={w / 2 - t / 2} y={0} width={t} height={h} fill={f.cross} />, <rect key="c2" x={0} y={h / 2 - t / 2} width={w} height={t} fill={f.cross} />); }
  if (f.saltire) {
    const t = Math.min(w, h) * 0.11;
    out.push(<line key="s1" x1={w * 0.08} y1={h * 0.08} x2={w * 0.92} y2={h * 0.92} stroke={f.saltire} strokeWidth={t} strokeLinecap="round" strokeDasharray={`${t * 1.6} ${t * 0.35}`} />, <line key="s2" x1={w * 0.92} y1={h * 0.08} x2={w * 0.08} y2={h * 0.92} stroke={f.saltire} strokeWidth={t} strokeLinecap="round" strokeDasharray={`${t * 1.6} ${t * 0.35}`} />);
  }
  if (f.emb || f.text) {
    const s = Math.min(w, h) * (f.es || 0.62), x = w * (f.ex ?? 0.5) - s / 2, y = h * (f.ey ?? 0.5) - s / 2;
    out.push(
      <g key="e" transform={`translate(${x} ${y}) scale(${s / 100})`}>
        {f.emb && EMB[f.emb](f.ec || '#fff', f.ec2)}
        {f.text && textEmb(f.text[0], f.text[1], f.text[2] || 30, f.emb ? 104 : 50)}
      </g>,
    );
  }
  return <>{out}</>;
};

// banderas históricas usadas en los 9 shorts
export const FL: Record<string, FlagSpec> = {
  // GG EZ Indonesia
  majapahit: {h: ['#d41f26', '#fff', '#d41f26', '#fff', '#d41f26', '#fff', '#d41f26', '#fff', '#d41f26']},
  bali: {bg: '#1c1c1c', h: ['#1c1c1c', '#f4f1e6', '#c8102e'], emb: 'lotus', ec: '#e8b923', es: 0.5},
  sunda: {bg: '#f2f2f2', h: ['#c8102e', '#f2f2f2'], emb: 'kris', ec: '#1c1c1c', es: 0.55},
  srivijaya: {bg: '#f1b80f', emb: 'dharma', ec: '#8a1d10', es: 0.6},
  pasai: {bg: '#0f6b3a', emb: 'crescentStar', ec: '#fff', es: 0.6},
  tanjungpura: {h: ['#f6d23a', '#1a7a3a'], emb: 'diamond', ec: '#fff', es: 0.4},
  temasek: {bg: '#c8102e', emb: 'lionSun', ec: '#fff', ec2: '#fff', es: 0.62},
  brunei_old: {bg: '#f7d21d', emb: 'crescent', ec: '#c8102e', es: 0.5},
  ternate: {h: ['#f7f7f7', '#f7d21d', '#1a7a3a'], emb: 'star', ec: '#c8102e', es: 0.35},
  dompu: {v: ['#0d3b8c', '#f2f2f2'], emb: 'triangle', ec: '#c8102e', es: 0.4},
  makassar: {bg: '#1a1a1a', emb: 'kris', ec: '#e8b923', es: 0.55},
  luwu: {h: ['#c8102e', '#e8b923'], emb: 'sun', ec: '#fff', es: 0.45},
  // GG EZ India
  mughal_plain: {bg: '#1f6b35'},
  mongol_plain: {bg: '#5aa7d8'},
  mughal: {bg: '#1f6b35', emb: 'lionSun', ec: '#f2c230', ec2: '#f2c230', es: 0.7},
  lodi: {h: ['#127a3d', '#111', '#127a3d'], w: [2, 1, 2], emb: 'crescent', ec: '#fff', es: 0.4},
  rajput: {bg: '#e8731a', emb: 'sun', ec: '#f7d21d', es: 0.55},
  gujarat: {bg: '#0f6b8a', emb: 'crescentStar', ec: '#fff', es: 0.5},
  bengal: {bg: '#0f6b3a', h: ['#0f6b3a', '#d41f26'], w: [3, 1], emb: 'crescent', ec: '#fff', es: 0.45},
  kashmir: {bg: '#c8102e', emb: 'pattee', ec: '#fff', es: 0.38},
  sindh: {v: ['#1a1a1a', '#e8b923'], emb: 'star', ec: '#fff', es: 0.35},
  kandahar: {bg: '#1f8a4c', emb: 'lionSun', ec: '#f2c230', ec2: '#f2c230', es: 0.6},
  ahmadnagar: {bg: '#5b2a86', emb: 'crescent', ec: '#f2c230', es: 0.45},
  bijapur: {bg: '#1a3f8a', emb: 'crescentStar', ec: '#fff', es: 0.5},
  golconda: {h: ['#f2c230', '#1a1a1a'], emb: 'diamond', ec: '#fff', es: 0.38},
  ahom: {bg: '#c8102e', emb: 'triangle', ec: '#f2c230', es: 0.42},
  maratha: {bg: '#ff8a1e'},
  malacca: {bg: '#f2c230', emb: 'kris', ec: '#1a1a1a', es: 0.55},
  // GG EZ Asia
  mongol: {bg: '#5aa7d8', emb: 'soyombo', ec: '#fff', es: 0.6},
  xia: {bg: '#e8d6a0', emb: 'diamond', ec: '#8a1d10', es: 0.42},
  khwarazm: {bg: '#1a6b4a', emb: 'crescent', ec: '#f2c230', es: 0.5},
  jin: {bg: '#f2c230', emb: 'sun', ec: '#c8102e', es: 0.5},
  rus: {bg: '#c8102e', emb: 'triangle', ec: '#f2c230', es: 0.42},
  abbasid: {bg: '#111'},
  goryeo: {bg: '#f2f2f2', emb: 'dharma', ec: '#1a3f8a', es: 0.5},
  song: {bg: '#c8102e', emb: 'circles3', ec: '#f2c230', es: 0.45},
  hungary: {h: ['#c8102e', '#f2f2f2', '#c8102e', '#f2f2f2', '#c8102e', '#f2f2f2', '#c8102e', '#f2f2f2']},
  georgia: {bg: '#fff', cross: '#c8102e'},
  japan_old: {bg: '#fff', emb: 'star', ec: '#fff'},
  tibet: {bg: '#1a3f8a', emb: 'sun', ec: '#f2c230', es: 0.4},
  // grew the fastest
  macedon: {bg: '#b51d1d', emb: 'vergina', ec: '#f2c230', es: 0.7},
  achaemenid: {bg: '#8a1d2a', emb: 'falcon', ec: '#f2c230', es: 0.75},
  inca: {h: ['#e0201b', '#f78a1d', '#fbe11b', '#40a62f', '#2aa6dd', '#1d4fa0', '#6c2a86']},
  timurid: {bg: '#111', emb: 'circles3', ec: '#c3161c', es: 0.78},
  // then vs today
  roman: {bg: '#8a1515', emb: 'eagle', ec: '#e8b923', es: 0.6, ey: 0.42, text: ['SPQR', '#e8b923', 24]},
  commonwealth: {h: ['#f2f2f2', '#c8102e'], emb: 'eagle', ec: '#f2f2f2', es: 0.5, ey: 0.75},
  denmark_norway: {bg: '#c8102e', nordic: ['#fff'], nx: 0.24, ny: 0.74, nt: 0.075},
  austria_hungary: {bg: '#f2c230', emb: 'deagle', ec: '#1a1a1a', es: 0.7},
  serbian_emp: {bg: '#c8102e', emb: 'deagle', ec: '#f2f2f2', es: 0.66},
  // controlled
  portugal_old: {bg: '#fff', emb: 'pattee', ec: '#c8102e', es: 0.62},
  ghurid: {bg: '#d41f26', emb: 'swordsCrescent', ec: '#fff', ec2: '#111', es: 0.66},
  durrani: {h: ['#1a8a3d', '#fff', '#1a8a3d'], w: [1, 2, 1]},
  voc: {h: ['#f07d1a', '#fff', '#1a3f8a'], text: ['VOC', '#1a1a1a', 34], es: 0.55},
  spain_old: {bg: '#fff', saltire: '#c8102e'},
  japan_rs: {bg: '#fff', rays: ['#c8102e', '#fff', 16]},
  france_old: {bg: '#f4f2ea', emb: 'fleur3', ec: '#d4a614', es: 0.7},
  rac: {h: ['#fff', '#1a3f8a', '#c8102e']},
  prinsen: {h: ['#f07d1a', '#fff', '#1a3f8a']},
  mexico_old: {img: 'mx'},
};
