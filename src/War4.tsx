import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import map from './mapdata.json';
import TL from './timeline4.json';
import CITIES from './cities3.json';
import {Flag, FLAG_OF} from './flags';
import {P, Cam, INK, CREAM, RED, BLUE, GREEN, YELLOW, ORANGE, PURPLE, clamp, ease, lerp, fmt, font, font2, toScreen, popT, piece, smoothPath, partial, PathArrow, Mover, Boom, Face, Mood, MiniFlag, Bubble} from './lib3';

// ================= datos =================
const CT = CITIES as Record<string, P>;
const byName: Record<string, (typeof map.countries)[number]> = Object.fromEntries(map.countries.map((c) => [c.name, c]));
type Capture = {country: string; city: string; t: number; r: number; kind: 'occ' | 'lib'; p: P};
const CAPS: Capture[] = (TL.captures as any[]).map(([country, city, t, r, kind]) => ({country, city, t, r, kind, p: CT[city]}));
const FILL = TL.fill as Record<string, number[]>;
const BALTS = ['Estonia', 'Latvia', 'Lithuania'];
type Battle = {t0: number; t1: number; title: string; banner: string; country: string; att: string[]; def: string[]; A: number[]; D: number[]; bar: string};
const BATTLES = TL.battles as Battle[];
const MAJOR = new Set(['Tallinn', 'Tartu', 'Narva', 'Parnu', 'Riga', 'Daugavpils', 'Liepaja', 'Vilnius', 'Kaunas', 'Klaipeda', 'Siauliai', 'Suwalki']);
const CITY_NAME: Record<string, string> = {
  Narva: 'Narva', Tartu: 'Tartu', Parnu: 'Pärnu', Tallinn: 'Tallinn', Riga: 'Riga', Daugavpils: 'Daugavpils', Liepaja: 'Liepāja',
  Vilnius: 'Vilnius', Kaunas: 'Kaunas', Klaipeda: 'Klaipėda', Siauliai: 'Šiauliai', Suwalki: 'Suwałki',
};
const NAMES: Record<string, string> = {
  Russia: 'RUSSIA', Belarus: 'BELARUS', Poland: 'POLAND', Lithuania: 'LITHUANIA', Latvia: 'LATVIA', Estonia: 'ESTONIA', Finland: 'FINLAND',
  Sweden: 'SWEDEN', Germany: 'GERMANY', France: 'FRANCE', Spain: 'SPAIN', 'United Kingdom': 'UK', Italy: 'ITALY',
};

// ================= cámara =================
const CAM: [number, number, number, number][] = [
  [0, 980, 540, 1.0], [3.6, 990, 530, 1.06], [7, 1095, 500, 2.0], [17.5, 1100, 500, 2.1], [20.5, 1062, 545, 2.8],
  [22.5, 1068, 551, 6.2], [43.5, 1068, 551, 6.4], [46.5, 1088, 405, 6.2], [83.5, 1084, 405, 6.4],
  [86.5, 1090, 466, 5.2], [123.5, 1086, 466, 5.4], [126.5, 1081, 516, 5.6], [163.5, 1078, 516, 5.8],
  [167, 1000, 525, 1.6], [180, 950, 560, 1.2], [540, 950, 560, 1.2],
];
const SHAKE_AT: [number, number][] = [...(TL.booms as number[]).map((b) => [b, 10] as [number, number]), ...CAPS.map((c) => [c.t, 3] as [number, number]), ...(TL.stamps as any[]).map((s) => [s.t, 6] as [number, number])];
const camera = (t: number): Cam => {
  let i = 0;
  while (i < CAM.length - 2 && t > CAM[i + 1][0]) i++;
  const [ta, xa, ya, sa] = CAM[i], [tb, xb, yb, sb] = CAM[i + 1];
  const k = lerp(t, ta, tb, 0, 1, ease);
  let cx = xa + (xb - xa) * k, cy = ya + (yb - ya) * k;
  const s = sa * Math.pow(sb / sa, k);
  for (const [h, amp] of SHAKE_AT) { const d = t - h; if (d >= 0 && d < 0.4) { const a = ((1 - d / 0.4) * amp) / s; cx += Math.sin(d * 93) * a; cy += Math.cos(d * 69) * a; } }
  return {cx, cy, s};
};

// ================= estado =================
const growK = (t: number, ct: number) => lerp(t, ct - 1.0, ct + 0.6, 0, 1, Easing.out(Easing.cubic));
const capsOf = (country: string) => CAPS.filter((c) => c.country === country && c.kind === 'occ');
const progressOf = (country: string, t: number) => {
  const list = capsOf(country);
  const f = FILL[country];
  const fill = f[1] > 0 ? lerp(t, f[0], f[1], 0, 1) : 0;
  const done = list.reduce((s, c) => s + growK(t, c.t), 0);
  return f[1] > 0 ? Math.min(1, done / (list.length + 1) + fill / (list.length + 1)) : done / list.length;
};
const occupied = (country: string, t: number) => {
  const f = FILL[country];
  if (!BALTS.includes(country)) return false;
  return t >= f[1];
};
const underAttack = (country: string, t: number) => BATTLES.some((b) => b.country === country && t >= b.t0 && t < b.t1);
const warDay = (t: number) => (t < 21 ? 0 : piece(t, TL.days as [number, number][]));

// ================= soldaditos =================
type Squad = {pts: P[]; t0: number; t1: number; code: string; n: number; side: 'R' | 'E'; endFade?: number};
type Garrison = {p: P; code: string; n: number; t0: number; ct: number; side: 'R' | 'E'; retreat?: P};
const R = (...names: (string | P)[]) => smoothPath(names.map((n) => (typeof n === 'string' ? CT[n] : n)), 10);
const SQ = (pts: P[], t0: number, t1: number, code: string, copies: number, gap: number, endFade: number, n = 5): Squad[] =>
  Array.from({length: copies}).map((_, i) => ({pts, t0: t0 + i * gap, t1: t1 + i * gap, code, n, side: ['ru', 'by', 'kp'].includes(code) ? 'R' : 'E', endFade}));
const SQUADS: Squad[] = [
  // concentración previa y llegada norcoreana
  ...SQ(R([1185, 470], [1178, 471]), 9.5, 10, 'ru', 1, 0, 22.5),
  ...SQ(R([1600, 505], [1400, 490], [1260, 482], [1185, 488]), 9.0, 16.0, 'kp', 3, 0.7, 22.5, 6),
  // Suwałki
  ...SQ(R('Grodno', 'Augustow', 'Suwalki'), 22, 31, 'by', 3, 1.3, 46),
  ...SQ(R('Gusev', [1040, 547], 'Suwalki'), 22.5, 31, 'ru', 2, 1.4, 46),
  ...SQ(R('Lida', 'Grodno', [1056, 560]), 24, 34, 'by', 1, 0, 46),
  // Estonia
  ...SQ(R('Ivangorod', 'Narva', 'Johvi', 'Rakvere', 'Tallinn'), 46, 74, 'ru', 3, 1.4, 86),
  ...SQ(R('Pskov', 'Voru', 'Tartu', 'Paide', 'Parnu'), 47, 70, 'ru', 3, 1.4, 86),
  ...SQ(R('Tallinn', 'Haapsalu', [1038, 404], [1033, 418], 'Kuressaare'), 74.5, 80, 'ru', 1, 0, 86),
  // Letonia
  ...SQ(R('Velikiye', 'Rezekne', 'Jekabpils', 'Riga'), 86, 107, 'ru', 3, 1.3, 126),
  ...SQ(R('Polotsk', 'Daugavpils', 'Jelgava', 'Kuldiga', 'Liepaja'), 87, 119, 'by', 2, 1.5, 126),
  ...SQ(R('Pskov', 'Gulbene', 'Valmiera'), 88, 101, 'ru', 2, 1.4, 126),
  ...SQ(R('Riga', 'Talsi', 'Ventspils'), 107.5, 117, 'ru', 1, 0, 126),
  // Lituania
  ...SQ(R('Lida', 'Vilnius', 'Kaunas', 'Taurage', 'Klaipeda'), 126, 158, 'by', 3, 1.3, 167),
  ...SQ(R('Grodno', 'Alytus', 'Marijampole'), 127, 137, 'by', 2, 1.4, 167),
  ...SQ(R('Daugavpils', 'Utena', 'Panevezys', 'Siauliai', 'Telsiai'), 127, 155, 'ru', 2, 1.5, 167),
  ...SQ(R('Daugavpils', 'Utena', 'Panevezys'), 131, 145, 'kp', 2, 1.5, 167, 6),
  ...SQ(R('Sovetsk', 'Taurage'), 148, 152, 'ru', 1, 0, 167),
];
// guarniciones defensoras en cada ciudad (caen y se retiran al capturarla)
const ALLY_AT: Record<string, string> = {Rakvere: 'gb', Riga: 'ca', Kaunas: 'de'};
const GARRISONS: Garrison[] = CAPS.filter((c) => c.kind === 'occ').flatMap((c) => {
  const code = c.country === 'Poland' ? 'pl' : ALLY_AT[c.city] || FLAG_OF[c.country];
  const appear = c.country === 'Poland' ? 15 : BATTLES.find((b) => b.country === c.country)!.t0 - 6;
  const g: Garrison[] = [{p: [c.p[0] + 1, c.p[1] - 5], code, n: MAJOR.has(c.city) ? 5 : 3, t0: Math.max(14, appear), ct: c.t, side: 'E'}];
  if (ALLY_AT[c.city]) g.push({p: [c.p[0] - 6, c.p[1] - 1], code: FLAG_OF[c.country], n: 3, t0: Math.max(14, appear), ct: c.t, side: 'E'});
  return g;
});
const squadPos = (q: Squad, t: number) => {
  const p = lerp(t, q.t0, q.t1, 0, 1, Easing.inOut(Easing.sin));
  return {...partial(q.pts, p), moving: t > q.t0 && t < q.t1};
};

const UNI: Record<'R' | 'E', [string, string]> = {R: ['#c7372f', '#7d1611'], E: ['#2f6fd6', '#173c80']};
const Soldier: React.FC<{x: number; y: number; side: 'R' | 'E'; walk: number; dir: number; shoot: boolean; fallen: number; flag?: string; alpha: number}> = ({x, y, side, walk, dir, shoot, fallen, flag, alpha}) => {
  const [c1, c2] = UNI[side];
  const sw = Math.sin(walk) * 4;
  return (
    <g transform={`translate(${x},${y}) rotate(${fallen * 90 * dir})`} opacity={alpha * (1 - fallen * 0.35)}>
      <ellipse cx={0} cy={13} rx={8} ry={2.6} fill="rgba(0,0,0,0.3)" />
      <path d={`M-2,4 L${-3 + sw},13 M2,4 L${3 - sw},13`} stroke={INK} strokeWidth={3.4} strokeLinecap="round" />
      <rect x={-5} y={-6} width={10} height={12} rx={3.5} fill={fallen > 0.5 ? '#8a8a8a' : c1} stroke={INK} strokeWidth={2} />
      <path d={`M0,-1 L${dir * 12},-3`} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <circle cx={0} cy={-11} r={5} fill="#f2c9a0" stroke={INK} strokeWidth={2} />
      <path d="M-6,-11 A6,6 0 0 1 6,-11 Z" fill={fallen > 0.5 ? '#6b6b6b' : c2} stroke={INK} strokeWidth={2} />
      {shoot && fallen < 0.5 && <path d={`M${dir * 13},-3 l${dir * 6},-3 l${-dir * 2},3 l${dir * 6},1 l${-dir * 6},1 l${dir * 2},3 Z`} fill={YELLOW} stroke={ORANGE} strokeWidth={1} />}
      {flag && fallen < 0.5 && <g><line x1={-dir * 5} y1={-4} x2={-dir * 5} y2={-30} stroke={INK} strokeWidth={2.2} /><g transform={`translate(${dir > 0 ? -5 : -27},-31)`}><Flag code={flag} w={22} h={15} /><rect width={22} height={15} fill="none" stroke={INK} strokeWidth={1.6} /></g></g>}
    </g>
  );
};
// formación detrás del líder según el rumbo
const FORM: P[] = [[0, 0], [-16, -9], [-16, 9], [-31, 0], [-31, -17], [-31, 17], [-46, -9], [-46, 9]];
const Soldiers: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const inv = 1 / cam.s;
  const scale = inv * 1.05;
  const frame = t * 30;
  // posiciones de escuadras atacantes
  const att = SQUADS.map((q) => ({q, ...squadPos(q, t)})).filter(({q}) => t > q.t0 - 0.4 && t < (q.endFade ?? q.t1 + 6) + 0.6);
  const garr = GARRISONS.filter((g) => t > g.t0 && t < g.ct + 3);
  const nodes: React.ReactNode[] = [];
  const tracers: React.ReactNode[] = [];
  att.forEach(({q, tip, ang, moving}, si) => {
    const a = lerp(t, q.t0 - 0.4, q.t0, 0, 1) * lerp(t, (q.endFade ?? q.t1 + 6), (q.endFade ?? q.t1 + 6) + 0.6, 1, 0);
    const target = garr.find((g) => Math.hypot(g.p[0] - tip[0], g.p[1] - tip[1]) < 26 && t > g.ct - 4.5 && t < g.ct + 0.2);
    const dir = target ? (target.p[0] >= tip[0] ? 1 : -1) : Math.cos(ang) >= 0 ? 1 : -1;
    const ca = Math.cos(ang), sa = Math.sin(ang);
    for (let i = 0; i < q.n; i++) {
      const [fx, fy] = FORM[i];
      const ox = (fx * ca - fy * sa) * scale, oy = (fx * sa + fy * ca) * scale;
      const x = tip[0] + ox, y = tip[1] + oy;
      const shoot = !!target && (frame + i * 7 + si * 3) % 11 < 2;
      const fallT = q.t0 + (q.t1 - q.t0) * (0.45 + ((i * 37 + si * 11) % 30) / 100);
      const isFall = i === q.n - 1 && si % 2 === 0 && t > fallT;
      const fallen = isFall ? lerp(t, fallT, fallT + 0.3, 0, 1) : 0;
      const fa = isFall ? lerp(t, fallT + 2.5, fallT + 3.2, 1, 0) : 1;
      nodes.push(<g key={`a${si}-${i}`} transform={`translate(${x},${y}) scale(${scale})`}><Soldier x={0} y={0} side={q.side} walk={moving ? frame / 2.2 + i : 0} dir={dir} shoot={shoot} fallen={fallen} flag={i === 0 ? q.code : undefined} alpha={a * fa} /></g>);
      if (shoot && target) tracers.push(<line key={`tr${si}-${i}`} x1={x + dir * 14 * scale} y1={y - 3 * scale} x2={target.p[0] + ((i * 13) % 9 - 4) * scale} y2={target.p[1] + ((i * 7) % 9 - 4) * scale} stroke="#ffe38a" strokeWidth={2.2 * scale} strokeLinecap="round" opacity={0.9} />);
    }
  });
  garr.forEach((g, gi) => {
    const a = lerp(t, g.t0, g.t0 + 0.6, 0, 1);
    const near = att.find(({tip}) => Math.hypot(g.p[0] - tip[0], g.p[1] - tip[1]) < 30);
    const fighting = !!near && t > g.ct - 4.5 && t < g.ct;
    const dir = near ? (near.tip[0] >= g.p[0] ? 1 : -1) : 1;
    const deadN = Math.floor(g.n * lerp(t, g.ct - 4, g.ct, 0, 0.55));
    const retreat = lerp(t, g.ct, g.ct + 2.5, 0, 1);
    const ra = lerp(t, g.ct + 1.6, g.ct + 2.6, 1, 0);
    for (let i = 0; i < g.n; i++) {
      const col = i % 3, row = Math.floor(i / 3);
      const bx = g.p[0] + (col - 1) * 14 * scale - dir * row * 13 * scale, by = g.p[1] + (row * 10 - 4 + (col === 1 ? -6 : 0)) * scale;
      const dead = i >= g.n - deadN;
      const x = dead ? bx : bx - dir * retreat * 24 * scale, y = by + (dead ? 0 : retreat * 8 * scale);
      const shoot = fighting && !dead && (frame + i * 5 + gi * 4) % 13 < 2;
      nodes.push(<g key={`g${gi}-${i}`} transform={`translate(${x},${y}) scale(${scale})`}><Soldier x={0} y={0} side="E" walk={retreat > 0 && retreat < 1 && !dead ? frame / 2 + i : 0} dir={dead ? dir : retreat > 0 ? -dir : dir} shoot={shoot} fallen={dead ? 1 : 0} flag={i === 0 ? g.code : undefined} alpha={a * (dead ? lerp(t, g.ct + 0.8, g.ct + 2.8, 1, 0) : ra)} /></g>);
      if (shoot && near) tracers.push(<line key={`gt${gi}-${i}`} x1={x + dir * 14 * scale} y1={y - 3 * scale} x2={near.tip[0]} y2={near.tip[1]} stroke="#bfe3ff" strokeWidth={2.2 * scale} strokeLinecap="round" opacity={0.9} />);
    }
  });
  return <g>{tracers}{nodes}</g>;
};

// ================= mapa =================
type Country = (typeof map.countries)[number];
const pid = (n: string) => n.replace(/\W/g, '');
const FlagPattern: React.FC<{id: string; code: string; box: number[]}> = ({id, code, box}) => {
  const [x0, y0, x1, y1] = box;
  return <pattern id={id} patternUnits="userSpaceOnUse" x={x0} y={y0} width={x1 - x0} height={y1 - y0}><Flag code={code} w={x1 - x0} h={y1 - y0} /></pattern>;
};
const fitBox = (c: Country) => {
  if (c.name === 'Russia') return [1110, 160, 1900, 760];
  const [x0, y0, x1, y1] = c.bbox, w = x1 - x0, h = y1 - y0, cx = (x0 + x1) / 2;
  return h > w * 1.4 ? [cx - h * 0.45, y0, cx + h * 0.45, y1] : c.bbox;
};
const KEY = new Set(['Estonia', 'Latvia', 'Lithuania', 'Poland', 'Belarus', 'Russia', 'Kaliningrad', 'Finland']);
const BIG = {x: -600, y: -600, width: 3120, height: 2280};
const FACES: {name: string; p: P; r: number; seed: number}[] = [
  {name: 'Russia', p: [1215, 425], r: 30, seed: 1}, {name: 'Belarus', p: [1140, 548], r: 16, seed: 2}, {name: 'Poland', p: [986, 600], r: 20, seed: 3},
  {name: 'Lithuania', p: [1072, 506], r: 10, seed: 4}, {name: 'Latvia', p: [1083, 457], r: 10, seed: 5}, {name: 'Estonia', p: [1090, 401], r: 9, seed: 6},
  {name: 'Finland', p: [1075, 300], r: 16, seed: 7}, {name: 'Sweden', p: [935, 330], r: 14, seed: 8}, {name: 'Germany', p: byName.Germany.c as P, r: 18, seed: 9},
  {name: 'France', p: byName.France.c as P, r: 20, seed: 10}, {name: 'Spain', p: byName.Spain.c as P, r: 20, seed: 11},
  {name: 'United Kingdom', p: [700, 560], r: 14, seed: 12}, {name: 'Italy', p: [880, 800], r: 15, seed: 13},
];
const faceR = (r: number, s: number) => Math.min(r, 58 / s);
const BUBBLES: [number, number, string, string][] = [
  [5.2, 8.6, 'Russia', 'The Baltics will be mine.'],
  [8.9, 11.6, 'Belarus', 'I’m in.'],
  [13.2, 16.2, 'Lithuania', 'Uh oh...'],
  [32, 35.5, 'Poland', 'Hey! That’s MY land!'],
  [52, 55, 'Estonia', 'HELP!'],
  [75.5, 78.5, 'Russia', 'Tallinn is mine.'],
  [95, 98, 'Latvia', 'They’re everywhere!'],
  [138, 141.5, 'Lithuania', 'NATO, where are you?!'],
  [168.5, 171.5, 'Germany', 'This means war!'],
  [171.8, 174.8, 'France', 'All of Europe is coming.'],
  [175, 178.5, 'Poland', 'Not one step further!'],
];
const talkingNow = (who: string, t: number) => BUBBLES.some(([a, b, w]) => w === who && t >= a + 0.2 && t < b - 0.4);
const moodOf = (name: string, t: number): {mood: Mood; look?: P} => {
  if (BALTS.includes(name)) {
    if (occupied(name, t)) return {mood: 'sad'};
    if (underAttack(name, t)) return {mood: 'scared', look: [0.8, 0]};
    return t > 12 ? {mood: 'scared', look: [0.8, 0]} : {mood: 'calm'};
  }
  switch (name) {
    case 'Russia': return t < 21 ? {mood: 'smug', look: [-1, 0]} : t < 165 ? {mood: 'angry', look: [-1, 0.2]} : {mood: 'smug', look: [-1, 0]};
    case 'Belarus': return t < 8.8 ? {mood: 'calm'} : {mood: 'angry', look: [-1, -0.2]};
    case 'Poland': return t < 26 ? {mood: 'calm'} : t < 31 ? {mood: 'shocked', look: [1, -0.5]} : {mood: 'angry', look: [1, -0.6]};
    case 'Finland': return t < 45 ? {mood: 'calm', look: [0.3, 0.8]} : {mood: 'shocked', look: [0, 0.8]};
    default: return t < 165 ? {mood: 'calm'} : {mood: 'angry', look: [1, -0.3]};
  }
};
const maskBox = (n: string) => { const b = byName[n].bbox; return [b[0] - 8, b[1] - 8, b[2] + 8, b[3] + 8]; };
const CountryFlag: React.FC<{c: Country; code: string}> = ({c, code}) => {
  const b = fitBox(c);
  return <g clipPath={`url(#cp-${pid(c.name)})`}><g transform={`translate(${b[0]},${b[1]})`}><Flag code={code} w={b[2] - b[0]} h={b[3] - b[1]} /></g></g>;
};
const EuropeMap: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const {cx, cy, s} = cam;
  const vx0 = cx - 960 / s - 40, vx1 = cx + 960 / s + 40, vy0 = cy - 540 / s - 40, vy1 = cy + 540 / s + 40;
  const visible = (b: number[]) => b[2] > vx0 && b[0] < vx1 && b[3] > vy0 && b[1] < vy1;
  const inv = 1 / s;
  const tf = `translate(960,540) scale(${s}) translate(${-cx},${-cy})`;
  const pulse = 0.5 + 0.5 * Math.sin(t * 6);
  const circles = (country: string) => {
    const out: React.ReactNode[] = [];
    capsOf(country).forEach((c, i) => {
      const k = growK(t, c.t);
      if (k <= 0) return;
      for (let j = 0; j < 3; j++) { const a = i * 2.1 + j * 2.09; out.push(<circle key={`${i}-${j}`} cx={c.p[0] + Math.cos(a) * c.r * 0.22} cy={c.p[1] + Math.sin(a) * c.r * 0.22} r={c.r * k * (0.95 - j * 0.07)} fill="white" />); }
    });
    const f = FILL[country];
    const fk = f[1] > 0 ? lerp(t, f[0], f[1], 0, 1) : 0;
    if (fk > 0) { const b = byName[country].bbox; out.push(<circle key="fill" cx={(b[0] + b[2]) / 2} cy={(b[1] + b[3]) / 2} r={Math.hypot(b[2] - b[0], b[3] - b[1]) * 0.62 * fk} fill="white" />); }
    return out;
  };
  const majorCities = CAPS.filter((c) => MAJOR.has(c.city) && s > 2.6);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        {s < 2.4 && <clipPath id="land">{map.countries.filter((c) => visible(c.bbox)).map((c) => <path key={c.name} d={c.d} />)}</clipPath>}
        <pattern id="hatch" patternUnits="userSpaceOnUse" width={7} height={7} patternTransform="rotate(45)"><rect width={7} height={7} fill="rgba(150,0,0,0.16)" /><rect width={2.4} height={7} fill="rgba(120,0,0,0.5)" /></pattern>
        {map.countries.filter((c) => FLAG_OF[c.name] || BALTS.includes(c.name) || c.name === 'Poland').map((c) => <clipPath key={c.name} id={`cp-${pid(c.name)}`}><path d={c.d} /></clipPath>)}
        {[...BALTS, 'Poland'].map((n) => { const b = maskBox(n); return <mask key={n} id={`m-${n}`} maskUnits="userSpaceOnUse" x={b[0]} y={b[1]} width={b[2] - b[0]} height={b[3] - b[1]}><rect x={b[0]} y={b[1]} width={b[2] - b[0]} height={b[3] - b[1]} fill="black" />{circles(n)}</mask>; })}
      </defs>
      <g transform={tf}>
        <g transform="translate(2.5,3.5)" opacity={0.3}>{map.countries.filter((c) => visible(c.bbox)).map((c) => <path key={c.name} d={c.d} fill="#06213f" />)}</g>
        {map.countries.map((c) => (FLAG_OF[c.name] && visible(c.bbox) ? <CountryFlag key={c.name} c={c} code={FLAG_OF[c.name]} /> : <path key={c.name} d={c.d} fill={FLAG_OF[c.name] ? '#cfc6b0' : '#efe3c8'} />))}
        {[...BALTS, 'Poland'].map((n) => { const box = n === 'Poland' ? [1020, 530, 1075, 570] : byName[n].bbox; return <g key={n} mask={`url(#m-${n})`}><g clipPath={`url(#cp-${pid(n)})`}><g transform={`translate(${box[0]},${box[1]})`}><Flag code="ru" w={box[2] - box[0]} h={box[3] - box[1]} /></g></g><path d={byName[n].d} fill="url(#hatch)" /></g>; })}
        {s < 2.4 && <image href={staticFile('relief.png')} {...BIG} preserveAspectRatio="none" clipPath="url(#land)" opacity={0.3 * lerp(s, 2.0, 2.4, 1, 0, Easing.linear)} />}
        {map.countries.filter((c) => visible(c.bbox)).map((c) => <path key={c.name} d={c.d} fill="none" stroke={INK} strokeOpacity={KEY.has(c.name) ? 0.95 : 0.75} strokeWidth={KEY.has(c.name) ? 3.2 : 2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />)}
        {BALTS.map((n) => (underAttack(n, t) ? <path key={n} d={byName[n].d} fill="none" stroke={RED} strokeWidth={5 + pulse * 4} vectorEffect="non-scaling-stroke" strokeLinejoin="round" /> : occupied(n, t) ? <path key={n} d={byName[n].d} fill="none" stroke={RED} strokeWidth={4} strokeOpacity={0.85} vectorEffect="non-scaling-stroke" /> : null))}
        {/* rutas tenues */}
        {SQUADS.filter((q, i) => i % 1 === 0 && q.t1 - q.t0 > 3).map((q, i) => <PathArrow key={i} pts={q.pts} t={t} t0={q.t0} t1={q.t1} color={q.side === 'R' ? 'rgba(229,50,45,0.75)' : 'rgba(31,111,224,0.8)'} w={1.3} fadeAfter={2} />)}
        {/* ciudades principales */}
        {majorCities.map((c) => {
          const cap = t >= c.t;
          const k = cap ? popT(t, c.t, 8) : 1;
          const label = CITY_NAME[c.city] || c.city, w = label.length * 12 + 24;
          return (
            <g key={c.city} transform={`translate(${c.p[0]},${c.p[1]}) scale(${inv})`}>
              <circle r={6} fill={cap ? RED : '#fff'} stroke={INK} strokeWidth={3} />
              <g transform={`translate(0,24) scale(${0.85 + 0.15 * k})`}><rect x={-w / 2} y={-13} width={w} height={26} rx={9} fill={cap ? RED : 'rgba(255,255,255,0.92)'} stroke={INK} strokeWidth={3} /><text y={7} textAnchor="middle" fontFamily="Fredoka" fontWeight={700} fontSize={19} fill={cap ? '#fff' : INK}>{label}</text></g>
            </g>
          );
        })}
        <Soldiers t={t} cam={cam} />
        {CAPS.map((c, i) => <Boom key={i} p={c.p} t={t} at={c.t} r={9} />)}
        {CAPS.map((c, i) => <Boom key={`p${i}`} p={[c.p[0] + 6, c.p[1] - 4]} t={t} at={c.t - 1.4} r={6} />)}
        {FACES.map((fc) => { const m = moodOf(fc.name, t); return <Face key={fc.name} x={fc.p[0]} y={fc.p[1]} r={faceR(fc.r, s)} mood={m.mood} look={m.look} t={t} seed={fc.seed} talking={talkingNow(fc.name, t)} />; })}
      </g>
    </svg>
  );
};

// ================= etiquetas y bocadillos =================
const MapLabels: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const zoomed = cam.s > 1.7;
  const items: React.ReactNode[] = [];
  for (const fc of FACES) {
    if (zoomed ? !KEY.has(fc.name) : cam.s > 1.3 && !KEY.has(fc.name)) continue;
    if (!zoomed && BALTS.includes(fc.name) && cam.s < 1.4) continue;
    const [sx, sy0] = toScreen(fc.p, cam);
    const sy = sy0 + faceR(fc.r, cam.s) * cam.s + 10;
    if (sx < 80 || sx > 1840 || sy < 150 || sy > 1020) continue;
    if (BATTLES.some((b) => t > b.t0 && t < b.t1 + 2.5) && sx > 1440 && sy > 220 && sy < 720) continue;
    items.push(<div key={fc.name} style={{position: 'absolute', left: sx, top: sy, transform: 'translateX(-50%)', background: '#fff', border: `4px solid ${INK}`, borderRadius: 14, padding: '3px 14px 0', ...font, fontSize: BALTS.includes(fc.name) ? 30 : 26, color: INK, whiteSpace: 'nowrap', boxShadow: '0 4px 0 rgba(0,0,0,0.3)'}}>{NAMES[fc.name]}</div>);
  }
  if (zoomed) { const [sx, sy] = toScreen([1016, 541], cam); if (sx > 80 && sx < 1840 && sy > 150 && sy < 1020) items.push(<div key="kal" style={{position: 'absolute', left: sx, top: sy, transform: 'translateX(-50%)', background: '#fff', border: `4px solid ${INK}`, borderRadius: 14, padding: '3px 12px 0', ...font, fontSize: 22, color: INK}}>KALININGRAD</div>); }
  const a = zoomed ? lerp(cam.s, 1.7, 1.9, 0, 1, Easing.linear) : 1;
  return <div style={{position: 'absolute', inset: 0, opacity: a, zIndex: 3}}>{items}</div>;
};
const MapBubbles: React.FC<{t: number; cam: Cam}> = ({t, cam}) => (
  <>
    {BUBBLES.filter(([a, b]) => t >= a && t <= b).map(([a, b, w, text]) => {
      const fc = FACES.find((x) => x.name === w)!;
      const [sx, sy] = toScreen(fc.p, cam);
      const k = popT(t, a, 10) * lerp(t, b - 0.25, b, 1, 0);
      const battle = BATTLES.some((bb) => t > bb.t0 && t < bb.t1 + 2.5);
      return <Bubble key={w + a} k={k} sx={Math.max(300, Math.min(battle ? 1200 : 1640, sx))} sy={Math.max(230, sy - faceR(fc.r, cam.s) * cam.s - 14)} text={text} size={40} />;
    })}
  </>
);
const MapPill: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  if (t < 10.5 || t > 15.5) return null;
  const [sx, sy] = toScreen([1330, 530], cam);
  const k = popT(t, 10.5, 11) * lerp(t, 15.2, 15.5, 1, 0);
  return <div style={{position: 'absolute', left: Math.min(1700, sx), top: sy, transform: `translate(-50%,-50%) scale(${k})`, display: 'flex', alignItems: 'center', gap: 10, background: PURPLE, color: '#fff', border: `5px solid ${INK}`, borderRadius: 22, padding: '6px 20px 1px', ...font, fontSize: 34, whiteSpace: 'nowrap', boxShadow: '0 6px 0 rgba(0,0,0,0.3)', zIndex: 4}}><MiniFlag code="kp" w={40} h={27} />NORTH KOREA SENDS TROOPS</div>;
};

// ================= HUD =================
const DayCounter: React.FC<{t: number}> = ({t}) => {
  if (t < 3.8) return null;
  const k = popT(t, 3.8, 12);
  const war = t >= 21;
  const dd = Math.max(1, Math.floor(warDay(t)));
  const bump = war ? popT(t, Math.floor(t * 4) / 4, 9) : 1;
  return (
    <div style={{position: 'absolute', top: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 10}}>
      <div style={{transform: `scale(${k})`, display: 'flex', alignItems: 'center', gap: 14, background: INK, padding: '10px 30px 6px 20px', borderRadius: 20, boxShadow: '0 6px 0 rgba(0,0,0,0.35)', border: `4px solid ${war ? RED : '#555'}`}}>
        <svg width={40} height={40} viewBox="0 0 36 36"><rect x={3} y={6} width={30} height={27} rx={5} fill="#fff" stroke={YELLOW} strokeWidth={3} /><rect x={3} y={6} width={30} height={9} fill={RED} /><rect x={9} y={2} width={4} height={8} rx={2} fill={YELLOW} /><rect x={23} y={2} width={4} height={8} rx={2} fill={YELLOW} /></svg>
        <div style={{...font, fontSize: 52, color: YELLOW, lineHeight: 1}}>{war ? `DAY ${dd}` : '2027'}</div>
      </div>
    </div>
  );
};
const Countdown: React.FC<{t: number}> = ({t}) => {
  const c0 = TL.countdown as number;
  if (t < c0 || t > c0 + 4.2) return null;
  const i = Math.floor(t - c0);
  const label = i < 3 ? String(3 - i) : 'WAR!';
  const dt = t - (c0 + i);
  const k = interpolate(dt, [0, 0.25], [2.4, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const a = i < 3 ? lerp(dt, 0.7, 1, 1, 0) : lerp(dt, 0.9, 1.2, 1, 0);
  const flash = i === 3 ? lerp(dt, 0, 0.35, 0.85, 0) : 0;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 16}}>
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
      <div style={{transform: `scale(${k})`, opacity: a, ...font, fontSize: i < 3 ? 260 : 220, color: i < 3 ? '#fff' : RED, textShadow: `8px 8px 0 ${INK}, -4px -4px 0 ${INK}, 4px -4px 0 ${INK}, -4px 4px 0 ${INK}`}}>{label}</div>
    </AbsoluteFill>
  );
};
const Banner: React.FC<{t: number}> = ({t}) => {
  const b = BATTLES.find((x) => t >= x.t0 && t < x.t0 + 2.8);
  if (!b) return null;
  const dt = t - b.t0;
  const k = popT(t, b.t0, 11) * lerp(dt, 2.4, 2.8, 1, 0);
  return (
    <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 13}}>
      <div style={{transform: `scale(${k}) rotate(-2deg)`, display: 'flex', alignItems: 'center', gap: 18, background: RED, border: `7px solid ${INK}`, borderRadius: 22, padding: '10px 40px 4px', boxShadow: '0 10px 0 rgba(0,0,0,0.35)', ...font, fontSize: 76, color: '#fff', textShadow: `4px 4px 0 ${INK}`, whiteSpace: 'nowrap'}}>
        <Swords size={70} />{b.banner}
      </div>
    </div>
  );
};
const Swords: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="-20 -20 40 40">
    {[-1, 1].map((d) => <g key={d} transform={`rotate(${d * 45})`}><rect x={-2.5} y={-17} width={5} height={24} rx={1} fill="#e6e6e6" stroke={INK} strokeWidth={2} /><rect x={-7} y={7} width={14} height={4} rx={2} fill={YELLOW} stroke={INK} strokeWidth={2} /><rect x={-2} y={11} width={4} height={7} fill="#8a5a2b" stroke={INK} strokeWidth={1.5} /></g>)}
  </svg>
);
const SoldierIcon: React.FC<{side: 'R' | 'E'}> = ({side}) => (
  <svg width={34} height={44} viewBox="-12 -20 24 36" style={{display: 'block'}}><Soldier x={0} y={0} side={side} walk={0} dir={side === 'R' ? 1 : -1} shoot={false} fallen={0} alpha={1} /></svg>
);
const BattleHUD: React.FC<{t: number}> = ({t}) => {
  const b = BATTLES.find((x) => t >= x.t0 + 0.6 && t < x.t1 + 2.8);
  if (!b) return null;
  const k = popT(t, b.t0 + 0.6, 13) * lerp(t, b.t1 + 2.4, b.t1 + 2.8, 1, 0);
  const p = progressOf(b.country, t);
  const A = b.A[0] - (b.A[0] - b.A[1]) * p;
  const D = b.D[0] - (b.D[0] - b.D[1]) * Math.pow(p, 0.85);
  const caps = capsOf(b.country);
  const lastCap = [...caps].reverse().find((c) => t >= c.t && t < c.t + 1.2);
  const lossA = Math.round((b.A[0] - b.A[1]) / caps.length / 10) * 10, lossD = Math.round((b.D[0] - b.D[1]) / caps.length / 10) * 10;
  const pctLabel = Math.round(p * 100);
  const row = (codes: string[], val: number, col: string, side: 'R' | 'E', loss: number) => (
    <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 12}}>
      <div style={{display: 'flex'}}>{codes.map((c, i) => <div key={c} style={{marginLeft: i ? -14 : 0}}><MiniFlag code={c} w={50} h={34} /></div>)}</div>
      <SoldierIcon side={side} />
      <div style={{...font, fontSize: 58, color: col, lineHeight: 1}}>{fmt(Math.round(val / 10) * 10)}</div>
      {lastCap && <div style={{position: 'absolute', right: 0, top: 6 - (t - lastCap.t) * 34, opacity: lerp(t, lastCap.t + 0.7, lastCap.t + 1.2, 1, 0), ...font, fontSize: 32, color: col, textShadow: `2px 2px 0 #fff`}}>-{fmt(loss)}</div>}
    </div>
  );
  return (
    <div style={{position: 'absolute', right: 36, top: 230, width: 430, transform: `translateX(${(1 - k) * 520}px)`, zIndex: 9}}>
      <div style={{background: CREAM, border: `7px solid ${INK}`, borderRadius: 24, padding: '16px 22px 18px', boxShadow: '0 10px 0 rgba(0,0,0,0.35)'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, ...font, fontSize: 40, color: INK, marginBottom: 10}}><Swords size={40} />{b.title}</div>
        {row(b.att, A, '#c0221d', 'R', lossA)}
        <div style={{display: 'flex', alignItems: 'center', gap: 10, margin: '6px 0'}}><div style={{flex: 1, height: 4, background: '#d9caa6'}} /><div style={{...font, fontSize: 30, color: '#fff', background: INK, borderRadius: 20, padding: '2px 14px 0'}}>VS</div><div style={{flex: 1, height: 4, background: '#d9caa6'}} /></div>
        {row(b.def, D, '#1557c0', 'E', lossD)}
        <div style={{display: 'flex', justifyContent: 'space-between', ...font, fontSize: 28, color: INK, marginTop: 16}}><span>{b.bar}</span><span style={{color: '#c0221d'}}>{pctLabel}%</span></div>
        <div style={{height: 26, background: '#e6d9bd', border: `5px solid ${INK}`, borderRadius: 14, overflow: 'hidden', marginTop: 4}}><div style={{width: `${p * 100}%`, height: '100%', background: `repeating-linear-gradient(45deg, ${RED}, ${RED} 10px, #b51d18 10px, #b51d18 20px)`}} /></div>
      </div>
    </div>
  );
};
const Stamp: React.FC<{t: number}> = ({t}) => {
  const st = (TL.stamps as any[]).find((s) => t >= s.t && t < s.t + 1.8);
  if (!st) return null;
  const dt = t - st.t;
  const k = dt < 0.27 ? interpolate(dt, [0, 0.27], [2.2, 1], {...clamp, easing: Easing.out(Easing.cubic)}) : 1;
  const a = lerp(dt, 0, 0.12, 0, 1) * lerp(dt, 1.5, 1.8, 1, 0);
  const col = st.c === 'red' ? RED : st.c === 'blue' ? BLUE : GREEN;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 12}}>
      <div style={{transform: `scale(${k}) rotate(-6deg)`, opacity: a, border: `10px solid ${col}`, color: col, background: 'rgba(255,246,227,0.94)', borderRadius: 18, padding: '14px 44px 6px', ...font, fontSize: 104, letterSpacing: 2, boxShadow: '0 10px 0 rgba(0,0,0,0.3)', whiteSpace: 'nowrap'}}>{st.text}</div>
    </AbsoluteFill>
  );
};
const Title: React.FC<{t: number}> = ({t}) => {
  if (t > 4) return null;
  const k = popT(t, 0.15, 10) * lerp(t, 3.5, 4, 1, 0);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 13}}>
      <div style={{transform: `scale(${k}) rotate(-2deg)`, background: '#2ec36a', border: `9px solid ${INK}`, borderRadius: 30, padding: '24px 56px 14px', boxShadow: '0 12px 0 rgba(0,0,0,0.35)', ...font, fontSize: 124, color: '#fff', textShadow: `5px 5px 0 ${INK}`, textAlign: 'center', lineHeight: 1.02}}>WHAT IF RUSSIA<br />INVADED EUROPE?</div>
    </AbsoluteFill>
  );
};
const Ocean: React.FC<{t: number}> = ({t}) => (
  <svg width={1920} height={1080} style={{position: 'absolute'}}>
    <defs>
      <radialGradient id="sea4" cx="50%" cy="45%" r="75%"><stop offset="0%" stopColor="#3f97d6" /><stop offset="100%" stopColor="#1d5e9f" /></radialGradient>
      <pattern id="waves4" width={140} height={46} patternUnits="userSpaceOnUse" patternTransform={`translate(${(t * 10.5) % 140},0)`}><path d="M0,23 C17,13 35,13 52,23 S87,33 105,23 S122,13 140,23" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={3} /></pattern>
    </defs>
    <rect width={1920} height={1080} fill="url(#sea4)" /><rect width={1920} height={1080} fill="url(#waves4)" />
  </svg>
);
const Credit = () => <div style={{position: 'absolute', right: 18, bottom: 12, background: 'rgba(15,25,40,0.65)', color: '#fff', borderRadius: 12, padding: '5px 14px', ...font2, fontWeight: 600, fontSize: 17, zIndex: 20}}>Hypothetical simulation · Data: Global Firepower 2026, SIPRI 2025</div>;

export const War4: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const cam = camera(t);
  return (
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <Ocean t={t} />
      <EuropeMap t={t} cam={cam} />
      <MapLabels t={t} cam={cam} />
      <MapPill t={t} cam={cam} />
      <MapBubbles t={t} cam={cam} />
      <BattleHUD t={t} />
      <Banner t={t} />
      <Stamp t={t} />
      <DayCounter t={t} />
      <Countdown t={t} />
      <Title t={t} />
      <Credit />
      <Audio src={staticFile('music4.wav')} />
    </AbsoluteFill>
  );
};
