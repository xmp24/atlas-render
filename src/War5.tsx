import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import map from './mapdata.json';
import TL from './timeline4.json';
import CITIES from './cities3.json';
import SHORTS from './shorts.json';
import {Flag, FLAG_OF} from './flags';
import {P, Cam, INK, CREAM, RED, BLUE, GREEN, YELLOW, ORANGE, PURPLE, clamp, ease, lerp, fmt, font, font2, toScreen, popT, piece, smoothPath, arcPath, partial, PathArrow, Mover, Boom, Face, Mood, MiniFlag, Bubble, Avatar} from './lib3';

// ================= datos =================
const CT = CITIES as Record<string, P>;
const byName: Record<string, (typeof map.countries)[number]> = Object.fromEntries(map.countries.map((c) => [c.name, c]));
type Capture = {country: string; city: string; t: number; r: number; kind: 'occ' | 'lib'; p: P};
const CAPS: Capture[] = (TL.captures as any[]).map(([country, city, t, r, kind]) => ({country, city, t, r, kind, p: CT[city]}));
const FILL = TL.fill as Record<string, number[]>;
const BALTS = ['Estonia', 'Latvia', 'Lithuania'];
type Battle = {t0: number; t1: number; title: string; banner: string; country: string; att: string[]; def: string[]; A: number[]; D: number[]; bar: string; kind?: string; units?: string; prog?: [number, number][]; lib?: boolean; good?: boolean; stop?: boolean};
const BATTLES = TL.battles as Battle[];
const MAJOR = new Set(['Tallinn', 'Tartu', 'Narva', 'Parnu', 'Riga', 'Daugavpils', 'Liepaja', 'Vilnius', 'Kaunas', 'Klaipeda', 'Siauliai', 'Suwalki', 'Kaliningrad']);
const CITY_NAME: Record<string, string> = {
  Narva: 'Narva', Tartu: 'Tartu', Parnu: 'Pärnu', Tallinn: 'Tallinn', Riga: 'Riga', Daugavpils: 'Daugavpils', Liepaja: 'Liepāja',
  Vilnius: 'Vilnius', Kaunas: 'Kaunas', Klaipeda: 'Klaipėda', Siauliai: 'Šiauliai', Suwalki: 'Suwałki', Kaliningrad: 'Kaliningrad',
};
const NAMES: Record<string, string> = {
  Russia: 'RUSSIA', Belarus: 'BELARUS', Poland: 'POLAND', Lithuania: 'LITHUANIA', Latvia: 'LATVIA', Estonia: 'ESTONIA', Finland: 'FINLAND',
  Sweden: 'SWEDEN', Germany: 'GERMANY', France: 'FRANCE', Spain: 'SPAIN', 'United Kingdom': 'UK', Italy: 'ITALY',
};
const AXIS = new Set(['ru', 'by', 'kp']);

// ================= cámara =================
const CAM = TL.cam as [number, number, number, number][];
const SHAKE_AT: [number, number][] = [
  ...(TL.booms as number[]).map((b) => [b, 8] as [number, number]),
  ...CAPS.map((c) => [c.t, 2.5] as [number, number]),
  ...(TL.stamps as any[]).map((s) => [s.t, 5] as [number, number]),
  ...[...(TL.airBursts as number[][]), ...(TL.navalBursts as number[][])].map((b) => [b[0], 2.5] as [number, number]),
];
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

// ================= estado de la guerra =================
const growK = (t: number, ct: number) => lerp(t, ct - 1.0, ct + 0.6, 0, 1, Easing.out(Easing.cubic));
const capsOf = (country: string, kind: 'occ' | 'lib') => CAPS.filter((c) => c.country === country && c.kind === kind);
const firstT = (country: string, kind: 'occ' | 'lib') => Math.min(...capsOf(country, kind).map((c) => c.t), 9999);
const fracOf = (country: string, kind: 'occ' | 'lib', t: number) => {
  const list = capsOf(country, kind);
  if (!list.length) return 0;
  const f = FILL[country], w = kind === 'occ' ? [f[0], f[1]] : [f[2], f[3]];
  const fill = w[1] > 0 ? lerp(t, w[0], w[1], 0, 1) : 0;
  const done = list.reduce((s, c) => s + growK(t, c.t), 0);
  return w[1] > 0 ? Math.min(1, (done + fill) / (list.length + 1)) : done / list.length;
};
const occupied = (country: string, t: number) => BALTS.includes(country) && t >= FILL[country][1] && t < firstT(country, 'lib') - 1;
const liberated = (country: string, t: number) => BALTS.includes(country) && t >= FILL[country][3];
const activeBattle = (t: number) => BATTLES.find((b) => t >= b.t0 && t < b.t1);
const underAttack = (country: string, t: number) => BATTLES.some((b) => b.country === country && t >= b.t0 && t < b.t1);
const warDay = (t: number) => (t < 21 ? 0 : piece(t, TL.days as [number, number][]));
const battleProgress = (b: Battle, t: number) => {
  if (b.prog) return piece(t, b.prog, ease);
  if (b.lib) return b.country === 'Kaliningrad' ? fracOf('Kaliningrad', 'lib', t) : fracOf(b.country, 'lib', t);
  return fracOf(b.country, 'occ', t);
};

// ================= soldaditos =================
export type Side = 'R' | 'E';
type Squad = {pts: P[]; t0: number; t1: number; code: string; n: number; side: Side; endFade: number};
type Group = {p: P; code: string; n: number; t0: number; ct: number; side: Side; dead: number; fall0: number; fall1: number; retreat: boolean; fade: number};
const R = (...names: (string | P)[]) => smoothPath(names.map((n) => (typeof n === 'string' ? CT[n] : n)), 10);
const SQ = (pts: P[], t0: number, t1: number, code: string, copies: number, gap: number, endFade: number, n = 5): Squad[] =>
  Array.from({length: copies}).map((_, i) => ({pts, t0: t0 + i * gap, t1: t1 + i * gap, code, n, side: AXIS.has(code) ? 'R' : 'E', endFade}));
const SQUADS: Squad[] = [
  ...SQ(R([1185, 470], [1178, 471]), 9.5, 10, 'ru', 1, 0, 22.5),
  ...SQ(R([1600, 505], [1400, 490], [1260, 482], [1185, 488]), 9.0, 16.0, 'kp', 3, 0.7, 22.5, 6),
  ...SQ(R('Grodno', 'Augustow', 'Suwalki'), 22, 31, 'by', 3, 1.3, 46),
  ...SQ(R('Gusev', [1040, 547], 'Suwalki'), 22.5, 31, 'ru', 2, 1.4, 46),
  ...SQ(R('Lida', 'Grodno', [1056, 560]), 24, 34, 'by', 1, 0, 46),
  ...SQ(R('Ivangorod', 'Narva', 'Johvi', 'Rakvere', 'Tallinn'), 46, 74, 'ru', 3, 1.4, 86),
  ...SQ(R('Pskov', 'Voru', 'Tartu', 'Paide', 'Parnu'), 47, 70, 'ru', 3, 1.4, 86),
  ...SQ(R('Tallinn', 'Haapsalu', [1038, 404], [1033, 418], 'Kuressaare'), 74.5, 80, 'ru', 1, 0, 86),
  ...SQ(R('Velikiye', 'Rezekne', 'Jekabpils', 'Riga'), 86, 107, 'ru', 3, 1.3, 126),
  ...SQ(R('Polotsk', 'Daugavpils', 'Jelgava', 'Kuldiga', 'Liepaja'), 87, 119, 'by', 2, 1.5, 126),
  ...SQ(R('Pskov', 'Gulbene', 'Valmiera'), 88, 101, 'ru', 2, 1.4, 126),
  ...SQ(R('Riga', 'Talsi', 'Ventspils'), 107.5, 117, 'ru', 1, 0, 126),
  ...SQ(R('Lida', 'Vilnius', 'Kaunas', 'Taurage', 'Klaipeda'), 126, 158, 'by', 3, 1.3, 167),
  ...SQ(R('Grodno', 'Alytus', 'Marijampole'), 127, 137, 'by', 2, 1.4, 167),
  ...SQ(R('Daugavpils', 'Utena', 'Panevezys', 'Siauliai', 'Telsiai'), 127, 155, 'ru', 2, 1.5, 167),
  ...SQ(R('Daugavpils', 'Utena', 'Panevezys'), 131, 145, 'kp', 2, 1.5, 167, 6),
  ...SQ(R('Sovetsk', 'Taurage'), 148, 152, 'ru', 1, 0, 167),
  // movilización europea
  ...SQ(R('Madrid', 'Paris', 'Berlin', [990, 600]), 181, 205, 'es', 2, 1.2, 213, 6),
  ...SQ(R('Paris', 'Berlin', [1000, 588]), 182, 204, 'fr', 2, 1.2, 213, 6),
  ...SQ(R('Rome', [880, 760], [960, 640], [1005, 615]), 183, 205, 'it', 2, 1.2, 213, 6),
  ...SQ(R('London', 'Amsterdam', 'Berlin', [975, 575]), 181.5, 204, 'gb', 2, 1.2, 213, 6),
  ...SQ(R('Amsterdam', 'Berlin', [985, 620]), 183.5, 203, 'nl', 1, 0, 213, 6),
  ...SQ(R('Berlin', [960, 590], [1020, 585]), 184, 200, 'de', 2, 1.2, 213, 6),
  // frontera polaca: ataques que se estrellan
  ...SQ(R('Grodno', [1070, 565]), 213, 220, 'by', 2, 1.4, 246),
  ...SQ(R('Brest', [1072, 600]), 214, 221, 'ru', 2, 1.4, 246),
  ...SQ(R('Chernyakhovsk', [1033, 542]), 214.5, 220, 'ru', 1, 0, 246),
  // Finlandia
  ...SQ(R('Helsinki', 'Kotka', [1108, 346]), 248, 255, 'fi', 2, 1.0, 264),
  ...SQ(R('Lappeenranta', [1132, 300]), 248.5, 254, 'fi', 2, 1.0, 264),
  ...SQ(R('Joensuu', [1150, 255]), 249, 255, 'fi', 1, 0, 264),
  // Kaliningrado y corredor
  ...SQ(R('Bialystok', 'Augustow', 'Suwalki'), 300, 305, 'pl', 2, 1.0, 336),
  ...SQ(R('Gdansk', [985, 540], 'Baltiysk', 'Kaliningrad'), 301, 312, 'pl', 3, 1.2, 336),
  ...SQ(R('Elk', 'Gusev', 'Chernyakhovsk', 'Sovetsk'), 305, 325, 'de', 3, 1.2, 336),
  // liberación de Lituania
  ...SQ(R('Suwalki', 'Marijampole', 'Kaunas', 'Vilnius', 'Utena'), 336, 367, 'pl', 3, 1.2, 376),
  ...SQ(R('Augustow', 'Alytus', 'Vilnius'), 337, 349, 'de', 2, 1.2, 376),
  ...SQ(R('Kaunas', 'Siauliai', 'Telsiai'), 346, 361, 'fr', 2, 1.2, 376),
  ...SQ(R('Sovetsk', 'Taurage', 'Klaipeda'), 348, 359, 'de', 2, 1.2, 376),
  ...SQ(R('Kaunas', 'Panevezys'), 353, 364, 'gb', 2, 1.2, 376),
  // liberación de Letonia
  ...SQ(R('Liepaja', 'Kuldiga', 'Talsi'), 380.5, 386, 'se', 2, 1.0, 413),
  ...SQ(R('Siauliai', 'Jelgava', 'Riga', 'Valmiera', 'Gulbene'), 384, 404, 'pl', 3, 1.2, 413),
  ...SQ(R('Panevezys', 'Jekabpils', 'Daugavpils', 'Rezekne'), 390, 406, 'gb', 2, 1.2, 413),
  ...SQ(R('Ventspils', 'Talsi'), 382.5, 386, 'se', 1, 0, 413),
  // liberación de Estonia
  ...SQ(R('Kuressaare', [1033, 418], 'Hiiumaa', 'Haapsalu'), 416.5, 420, 'se', 2, 1.0, 449),
  ...SQ(R('Tallinn', 'Rakvere', 'Johvi', 'Narva'), 424.5, 442, 'fi', 3, 1.2, 449),
  ...SQ(R('Parnu', 'Paide', 'Tartu', 'Voru'), 426, 440, 'gb', 2, 1.2, 449),
  ...SQ(R('Valmiera', 'Parnu'), 420, 427, 'ee', 2, 1.2, 449),
];
const ALLY_AT: Record<string, string> = {Rakvere: 'gb', Riga: 'ca', Kaunas: 'de'};
const AXIS_CODE = (country: string, i: number) => (country === 'Lithuania' ? ['by', 'ru', 'kp'][i % 3] : country === 'Latvia' ? ['ru', 'by'][i % 2] : 'ru');
const GROUPS: Group[] = [
  // defensores en cada ciudad atacada
  ...CAPS.filter((c) => c.kind === 'occ').flatMap((c) => {
    const code = c.country === 'Poland' ? 'pl' : ALLY_AT[c.city] || FLAG_OF[c.country];
    const appear = c.country === 'Poland' ? 15 : BATTLES.find((b) => b.country === c.country)!.t0 - 6;
    const base = {code, t0: Math.max(14, appear), ct: c.t, side: 'E' as Side, dead: 0.55, fall0: c.t - 4, fall1: c.t, retreat: true, fade: c.t + 2.8};
    const g: Group[] = [{...base, p: [c.p[0] + 1, c.p[1] - 5], n: MAJOR.has(c.city) ? 5 : 3}];
    if (ALLY_AT[c.city]) g.push({...base, p: [c.p[0] - 6, c.p[1] - 1], code: FLAG_OF[c.country], n: 3});
    return g;
  }),
  // guarniciones rusas que caen en la liberación
  ...CAPS.filter((c) => c.kind === 'lib').map((c, i) => {
    const b = BATTLES.find((x) => x.lib && x.country === c.country) || BATTLES.find((x) => x.country === 'Kaliningrad')!;
    return {p: [c.p[0] + 1, c.p[1] - 5] as P, code: AXIS_CODE(c.country, i), n: MAJOR.has(c.city) ? 5 : 3, t0: b.t0 - 4, ct: c.t, side: 'R' as Side, dead: 0.6, fall0: c.t - 4, fall1: c.t, retreat: true, fade: c.t + 2.8};
  }),
  // frontera polaca (enfrentamientos fijos)
  ...([[[1052, 560], 'pl'], [[1056, 598], 'pl'], [[1043, 552], 'de'], [[1062, 618], 'pl']] as [P, string][]).map(([p, code]) => ({p, code, n: 5, t0: 211, ct: 246, side: 'E' as Side, dead: 0.25, fall0: 216, fall1: 244, retreat: false, fade: 247.5})),
  ...([[[1068, 565], 'by'], [[1072, 600], 'ru'], [[1034, 543], 'ru'], [[1076, 620], 'by']] as [P, string][]).map(([p, code]) => ({p, code, n: 5, t0: 219, ct: 246, side: 'R' as Side, dead: 0.65, fall0: 220, fall1: 244, retreat: false, fade: 247.5})),
  // frente finlandés
  ...([[[1110, 344], 'fi'], [[1133, 300], 'fi'], [[1150, 256], 'fi'], [[1098, 352], 'fi']] as [P, string][]).map(([p, code]) => ({p, code, n: 5, t0: 254, ct: 264, side: 'E' as Side, dead: 0.15, fall0: 256, fall1: 263, retreat: false, fade: 265})),
  ...([[[1126, 350], 'ru'], [[1148, 304], 'ru'], [[1168, 258], 'ru']] as [P, string][]).map(([p, code]) => ({p, code, n: 6, t0: 248, ct: 264, side: 'R' as Side, dead: 0.35, fall0: 256, fall1: 263, retreat: false, fade: 265})),
];
const squadPos = (q: Squad, t: number) => ({...partial(q.pts, lerp(t, q.t0, q.t1, 0, 1, Easing.inOut(Easing.sin))), moving: t > q.t0 && t < q.t1});

const UNI: Record<Side, [string, string]> = {R: ['#c7372f', '#7d1611'], E: ['#2f6fd6', '#173c80']};
export const Soldier: React.FC<{side: Side; walk: number; dir: number; shoot: boolean; fallen: number; flag?: string; alpha: number}> = ({side, walk, dir, shoot, fallen, flag, alpha}) => {
  const [c1, c2] = UNI[side];
  const sw = Math.sin(walk) * 4;
  const dead = fallen > 0.5;
  return (
    <g transform={`rotate(${fallen * 90 * dir})`} opacity={alpha * (1 - fallen * 0.35)}>
      <ellipse cx={0} cy={13} rx={8} ry={2.6} fill="rgba(0,0,0,0.3)" />
      <path d={`M-2,4 L${-3 + sw},13 M2,4 L${3 - sw},13`} stroke={INK} strokeWidth={3.4} strokeLinecap="round" />
      <rect x={-5} y={-6} width={10} height={12} rx={3.5} fill={dead ? '#8a8a8a' : c1} stroke={INK} strokeWidth={2} />
      <path d={`M0,-1 L${dir * 12},-3`} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <circle cx={0} cy={-11} r={5} fill="#f2c9a0" stroke={INK} strokeWidth={2} />
      <path d="M-6,-11 A6,6 0 0 1 6,-11 Z" fill={dead ? '#6b6b6b' : c2} stroke={INK} strokeWidth={2} />
      {shoot && !dead && <path d={`M${dir * 13},-3 l${dir * 6},-3 l${-dir * 2},3 l${dir * 6},1 l${-dir * 6},1 l${dir * 2},3 Z`} fill={YELLOW} stroke={ORANGE} strokeWidth={1} />}
      {flag && !dead && <g><line x1={-dir * 5} y1={-4} x2={-dir * 5} y2={-30} stroke={INK} strokeWidth={2.2} /><g transform={`translate(${dir > 0 ? -5 : -27},-31)`}><Flag code={flag} w={22} h={15} /><rect width={22} height={15} fill="none" stroke={INK} strokeWidth={1.6} /></g></g>}
    </g>
  );
};
const FORM: P[] = [[0, 0], [-16, -9], [-16, 9], [-31, 0], [-31, -17], [-31, 17], [-46, -9], [-46, 9]];
const Soldiers: React.FC<{t: number; cam: Cam; vp: VP}> = ({t, cam, vp}) => {
  const scale = (1.05 * vp.ui) / cam.s;
  const frame = t * 30;
  const vx0 = cam.cx - (vp.ox + 40) / cam.s, vx1 = cam.cx + (vp.W - vp.ox + 40) / cam.s, vy0 = cam.cy - (vp.oy + 40) / cam.s, vy1 = cam.cy + (vp.H - vp.oy + 40) / cam.s;
  const inView = (p: P) => p[0] > vx0 && p[0] < vx1 && p[1] > vy0 && p[1] < vy1;
  const att = SQUADS.filter((q) => t > q.t0 - 0.4 && t < q.endFade + 0.6).map((q) => ({q, ...squadPos(q, t)}));
  const grp = GROUPS.filter((g) => t > g.t0 && t < g.fade);
  const nodes: React.ReactNode[] = [];
  const tracers: React.ReactNode[] = [];
  att.forEach(({q, tip, ang, moving}, si) => {
    if (!inView(tip)) return;
    const a = lerp(t, q.t0 - 0.4, q.t0, 0, 1) * lerp(t, q.endFade, q.endFade + 0.6, 1, 0);
    const target = grp.find((g) => g.side !== q.side && Math.hypot(g.p[0] - tip[0], g.p[1] - tip[1]) < 28 && t > g.fall0 - 0.5 && t < g.fall1 + 0.2);
    const dir = target ? (target.p[0] >= tip[0] ? 1 : -1) : Math.cos(ang) >= 0 ? 1 : -1;
    const ca = Math.cos(ang), sa = Math.sin(ang);
    for (let i = 0; i < q.n; i++) {
      const [fx, fy] = FORM[i];
      const x = tip[0] + (fx * ca - fy * sa) * scale, y = tip[1] + (fx * sa + fy * ca) * scale;
      const shoot = !!target && (frame + i * 7 + si * 3) % 11 < 2;
      const fallT = q.t0 + (q.t1 - q.t0) * (0.45 + ((i * 37 + si * 11) % 30) / 100);
      const isFall = i === q.n - 1 && si % 2 === 0 && t > fallT && q.t1 - q.t0 > 4;
      const fallen = isFall ? lerp(t, fallT, fallT + 0.3, 0, 1) : 0;
      const fa = isFall ? lerp(t, fallT + 2.5, fallT + 3.2, 1, 0) : 1;
      nodes.push(<g key={`a${si}-${i}`} transform={`translate(${x},${y}) scale(${scale})`}><Soldier side={q.side} walk={moving ? frame / 2.2 + i : 0} dir={dir} shoot={shoot} fallen={fallen} flag={i === 0 ? q.code : undefined} alpha={a * fa} /></g>);
      if (shoot && target) tracers.push(<line key={`tr${si}-${i}`} x1={x + dir * 14 * scale} y1={y - 3 * scale} x2={target.p[0] + (((i * 13) % 9) - 4) * scale} y2={target.p[1] + (((i * 7) % 9) - 4) * scale} stroke={q.side === 'R' ? '#ffe38a' : '#bfe3ff'} strokeWidth={2.2 * scale} strokeLinecap="round" opacity={0.9} />);
    }
  });
  grp.forEach((g, gi) => {
    if (!inView(g.p)) return;
    const a = lerp(t, g.t0, g.t0 + 0.6, 0, 1);
    const nearSquad = att.find(({q, tip}) => q.side !== g.side && Math.hypot(g.p[0] - tip[0], g.p[1] - tip[1]) < 32);
    const nearGroup = grp.find((o) => o.side !== g.side && Math.hypot(g.p[0] - o.p[0], g.p[1] - o.p[1]) < 30);
    const near: P | undefined = nearSquad ? nearSquad.tip : nearGroup ? nearGroup.p : undefined;
    const fighting = !!near && t > g.fall0 - 0.5 && t < g.fall1;
    const dir = near ? (near[0] >= g.p[0] ? 1 : -1) : g.side === 'R' ? -1 : 1;
    const deadN = Math.floor(g.n * lerp(t, g.fall0, g.fall1, 0, g.dead));
    const retreat = g.retreat ? lerp(t, g.ct, g.ct + 2.5, 0, 1) : 0;
    const ra = g.retreat ? lerp(t, g.ct + 1.6, g.ct + 2.6, 1, 0) : lerp(t, g.fade - 1, g.fade, 1, 0);
    for (let i = 0; i < g.n; i++) {
      const col = i % 3, row = Math.floor(i / 3);
      const bx = g.p[0] + (col - 1) * 14 * scale - dir * row * 13 * scale, by = g.p[1] + (row * 10 - 4 + (col === 1 ? -6 : 0)) * scale;
      const dead = i >= g.n - deadN;
      const x = dead ? bx : bx - dir * retreat * 24 * scale, y = by + (dead ? 0 : retreat * 8 * scale);
      const shoot = fighting && !dead && (frame + i * 5 + gi * 4) % 13 < 2;
      const al = a * (dead ? lerp(t, g.fall1 + 0.8, g.fall1 + 2.8, 1, 0) * (g.retreat ? 1 : 1) : ra);
      if (al <= 0.01) continue;
      nodes.push(<g key={`g${gi}-${i}`} transform={`translate(${x},${y}) scale(${scale})`}><Soldier side={g.side} walk={retreat > 0 && retreat < 1 && !dead ? frame / 2 + i : 0} dir={dead ? dir : retreat > 0 ? -dir : dir} shoot={shoot} fallen={dead ? 1 : 0} flag={i === 0 ? g.code : undefined} alpha={al} /></g>);
      if (shoot && near) tracers.push(<line key={`gt${gi}-${i}`} x1={x + dir * 14 * scale} y1={y - 3 * scale} x2={near[0] + (((i * 11) % 9) - 4) * scale} y2={near[1] + (((i * 5) % 9) - 4) * scale} stroke={g.side === 'R' ? '#ffe38a' : '#bfe3ff'} strokeWidth={2.2 * scale} strokeLinecap="round" opacity={0.9} />);
    }
  });
  return <g>{tracers}{nodes}</g>;
};

// aviones, barcos y misiles
type Flight = {pts: P[]; t0: number; t1: number; kind: 'plane' | 'missile' | 'ship'; code?: string; color?: string; hold?: number; sinkAt?: number};
const plane = (a: P, b: P, bend: number, t0: number, t1: number, side: Side): Flight => ({pts: arcPath(a, b, bend), t0, t1, kind: 'plane', color: side === 'R' ? RED : BLUE, hold: 0});
const AIR: Flight[] = (TL.airBursts as number[][]).flatMap(([tb, x, y], i) => [
  plane([1170, 420 + i * 18], [x, y], 20 * (i % 2 ? 1 : -1), tb - 2.2, tb, 'R'),
  plane([930, 600 - i * 22], [x + 60, y - 25], -25 * (i % 2 ? 1 : -1), tb - 2.4, tb + 0.8, 'E'),
  plane([950, 450 + i * 15], [x + 80, y + 30], 30 * (i % 2 ? -1 : 1), tb - 1.6, tb + 1.6, 'E'),
]);
const NAVAL: Flight[] = [
  ...(TL.navalBursts as number[][]).map(([tb, x, y], i) => ({pts: arcPath([993 + (i % 3) * 6, 536 - (i % 2) * 4], [x, y], 6), t0: tb - 3, t1: tb, kind: 'ship' as const, code: 'ru', hold: 1, sinkAt: tb})),
  {pts: arcPath(CT.Gotland, [988, 488], 8), t0: 283, t1: 287, kind: 'ship', code: 'se', hold: 13},
  {pts: arcPath(CT.Gdansk, [975, 527], -6), t0: 283.4, t1: 286.6, kind: 'ship', code: 'pl', hold: 13},
  {pts: arcPath([900, 520], [962, 515], 6), t0: 283, t1: 288, kind: 'ship', code: 'de', hold: 11},
  {pts: arcPath([960, 470], [985, 500], 6), t0: 284, t1: 288.5, kind: 'ship', code: 'gb', hold: 10},
  ...(TL.navalBursts as number[][]).map(([tb, x, y], i) => ({pts: arcPath([[988, 488], [975, 527], [962, 515], [985, 500]][i % 4] as P, [x, y], -8), t0: tb - 1.0, t1: tb, kind: 'missile' as const})),
];
const FLIGHTS: Flight[] = [...AIR, ...NAVAL];

// ================= mapa =================
type Country = (typeof map.countries)[number];
const pid = (n: string) => n.replace(/\W/g, '');
const fitBox = (c: Country) => {
  if (c.name === 'Russia') return [1110, 160, 1900, 760];
  const [x0, y0, x1, y1] = c.bbox, w = x1 - x0, h = y1 - y0, cx = (x0 + x1) / 2;
  return h > w * 1.4 ? [cx - h * 0.45, y0, cx + h * 0.45, y1] : c.bbox;
};
const KEY = new Set(['Estonia', 'Latvia', 'Lithuania', 'Poland', 'Belarus', 'Russia', 'Kaliningrad', 'Finland']);
const FACES: {name: string; p: P; r: number; seed: number}[] = [
  {name: 'Russia', p: [1215, 425], r: 30, seed: 1}, {name: 'Belarus', p: [1140, 548], r: 16, seed: 2}, {name: 'Poland', p: [986, 600], r: 20, seed: 3},
  {name: 'Lithuania', p: [1072, 506], r: 10, seed: 4}, {name: 'Latvia', p: [1083, 457], r: 10, seed: 5}, {name: 'Estonia', p: [1090, 401], r: 9, seed: 6},
  {name: 'Finland', p: [1075, 290], r: 16, seed: 7}, {name: 'Sweden', p: [935, 330], r: 14, seed: 8}, {name: 'Germany', p: byName.Germany.c as P, r: 18, seed: 9},
  {name: 'France', p: byName.France.c as P, r: 20, seed: 10}, {name: 'Spain', p: byName.Spain.c as P, r: 20, seed: 11},
  {name: 'United Kingdom', p: [700, 560], r: 14, seed: 12}, {name: 'Italy', p: [880, 800], r: 15, seed: 13},
];
const faceR = (r: number, s: number, ui = 1) => Math.min(r, (58 * ui) / s);
export type VP = {W: number; H: number; ox: number; oy: number; ui: number; k: number};
const VP0: VP = {W: 1920, H: 1080, ox: 960, oy: 540, ui: 1, k: 1};
const BUBBLES: [number, number, string, string][] = [
  [5.2, 8.6, 'Russia', 'The Baltics will be mine.'], [8.9, 11.6, 'Belarus', 'I’m in.'], [13.2, 16.2, 'Lithuania', 'Uh oh...'],
  [32, 35.5, 'Poland', 'Hey! That’s MY land!'], [52, 55, 'Estonia', 'HELP!'], [75.5, 78.5, 'Russia', 'Tallinn is mine.'],
  [95, 98, 'Latvia', 'They’re everywhere!'], [138, 141.5, 'Lithuania', 'NATO, where are you?!'],
  [168.5, 171.5, 'Germany', 'This means war!'], [171.8, 174.8, 'France', 'All of Europe is coming.'], [175, 178.5, 'Poland', 'Not one step further!'],
  [186, 189.5, 'Spain', 'Spain is on its way!'], [191, 194.5, 'Italy', 'Italy too!'], [196, 199.5, 'United Kingdom', 'Right behind you.'],
  [225, 228.5, 'Poland', 'Not one step further!'], [237, 240.5, 'Russia', 'Why won’t they break?!'],
  [251, 254.5, 'Finland', 'Try me.'], [303, 306.5, 'Poland', 'Our turn now.'], [350, 353.5, 'Lithuania', 'They came back for us!'],
  [395, 398.5, 'Latvia', 'Riga is free!'], [430, 433.5, 'Estonia', 'Thank you, Finland!'],
  [450, 454, 'Russia', 'Okay... okay. Ceasefire.'], [458, 461.5, 'Poland', 'And stay out!'],
];
const talkingNow = (who: string, t: number) => BUBBLES.some(([a, b, w]) => w === who && t >= a + 0.2 && t < b - 0.4);
const moodOf = (name: string, t: number): {mood: Mood; look?: P} => {
  if (BALTS.includes(name)) {
    if (liberated(name, t) || (t > firstT(name, 'lib') + 2 && t < 999)) return {mood: 'happy'};
    if (occupied(name, t)) return {mood: 'sad'};
    if (underAttack(name, t)) return {mood: 'scared', look: [0.8, 0]};
    return t > 12 ? {mood: 'scared', look: [0.8, 0]} : {mood: 'calm'};
  }
  switch (name) {
    case 'Russia': return t < 21 ? {mood: 'smug', look: [-1, 0]} : t < 165 ? {mood: 'angry', look: [-1, 0.2]} : t < 212 ? {mood: 'smug', look: [-1, 0]} : t < 300 ? {mood: 'angry', look: [-1, 0]} : t < 448 ? {mood: 'scared', look: [-1, 0]} : {mood: 'sad', look: [0, 0.5]};
    case 'Belarus': return t < 8.8 ? {mood: 'calm'} : t < 300 ? {mood: 'angry', look: [-1, -0.2]} : {mood: 'scared', look: [-1, 0]};
    case 'Poland': return t < 26 ? {mood: 'calm'} : t < 31 ? {mood: 'shocked', look: [1, -0.5]} : t < 448 ? {mood: 'angry', look: [1, -0.6]} : {mood: 'happy'};
    case 'Finland': return t < 45 ? {mood: 'calm', look: [0.3, 0.8]} : t < 247 ? {mood: 'shocked', look: [0, 0.8]} : t < 448 ? {mood: 'angry', look: [0.2, 0.8]} : {mood: 'happy'};
    default: return t < 165 ? {mood: 'calm'} : t < 448 ? {mood: 'angry', look: [1, -0.3]} : {mood: 'happy'};
  }
};
const maskBox = (n: string) => { const b = byName[n].bbox; return [b[0] - 8, b[1] - 8, b[2] + 8, b[3] + 8]; };
const CountryFlag: React.FC<{c: Country; code: string}> = ({c, code}) => {
  const b = fitBox(c);
  return <g clipPath={`url(#cp-${pid(c.name)})`}><g transform={`translate(${b[0]},${b[1]})`}><Flag code={code} w={b[2] - b[0]} h={b[3] - b[1]} /></g></g>;
};
// humo que flota sobre los combates
const Smoke: React.FC<{t: number}> = ({t}) => {
  const items: React.ReactNode[] = [];
  CAPS.forEach((c, i) => {
    const dt = t - c.t;
    if (dt < 0 || dt > 6) return;
    for (let j = 0; j < 3; j++) {
      const a = (i * 1.7 + j * 2.1);
      items.push(<circle key={`${i}-${j}`} cx={c.p[0] + Math.cos(a) * 4 + dt * 1.2} cy={c.p[1] + Math.sin(a) * 3 - dt * 2.2} r={3 + dt * 1.6 + j} fill="#5b5b5b" opacity={0.28 * lerp(dt, 0.5, 6, 1, 0)} />);
    }
  });
  return <g>{items}</g>;
};

const EuropeMap: React.FC<{t: number; cam: Cam; vp?: VP}> = ({t, cam, vp = VP0}) => {
  const {cx, cy, s} = cam;
  const s0 = s / vp.k;
  const vx0 = cx - vp.ox / s - 40, vx1 = cx + (vp.W - vp.ox) / s + 40, vy0 = cy - vp.oy / s - 40, vy1 = cy + (vp.H - vp.oy) / s + 40;
  const visible = (b: number[]) => b[2] > vx0 && b[0] < vx1 && b[3] > vy0 && b[1] < vy1;
  const inv = vp.ui / s;
  const tf = `translate(${vp.ox},${vp.oy}) scale(${s}) translate(${-cx},${-cy})`;
  const pulse = 0.5 + 0.5 * Math.sin(t * 6);
  const circles = (country: string, kind: 'occ' | 'lib', fill: string) => {
    const out: React.ReactNode[] = [];
    capsOf(country, kind).forEach((c, i) => {
      const k = growK(t, c.t);
      if (k <= 0) return;
      for (let j = 0; j < 3; j++) { const a = i * 2.1 + j * 2.09; out.push(<circle key={`${kind}${i}-${j}`} cx={c.p[0] + Math.cos(a) * c.r * 0.22} cy={c.p[1] + Math.sin(a) * c.r * 0.22} r={c.r * k * (0.95 - j * 0.07)} fill={fill} />); }
    });
    const f = FILL[country], w = kind === 'occ' ? [f[0], f[1]] : [f[2], f[3]];
    const fk = w[1] > 0 ? lerp(t, w[0], w[1], 0, 1) : 0;
    if (fk > 0) { const b = byName[country].bbox; out.push(<circle key={`${kind}-fill`} cx={(b[0] + b[2]) / 2} cy={(b[1] + b[3]) / 2} r={Math.hypot(b[2] - b[0], b[3] - b[1]) * 0.62 * fk} fill={fill} />); }
    return out;
  };
  const majorCities = Array.from(new Map(CAPS.filter((c) => MAJOR.has(c.city)).map((c) => [c.city, c])).values()).filter(() => s0 > 2.6);
  const libGlow = BALTS.map((n) => (t >= FILL[n][3] && t < FILL[n][3] + 4 ? n : null)).filter(Boolean) as string[];
  return (
    <svg width={vp.W} height={vp.H} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        {s0 < 2.4 && <clipPath id="land">{map.countries.filter((c) => visible(c.bbox)).map((c) => <path key={c.name} d={c.d} />)}</clipPath>}
        <pattern id="hatch" patternUnits="userSpaceOnUse" width={7} height={7} patternTransform="rotate(45)"><rect width={7} height={7} fill="rgba(150,0,0,0.16)" /><rect width={2.4} height={7} fill="rgba(120,0,0,0.5)" /></pattern>
        <pattern id="hatchB" patternUnits="userSpaceOnUse" width={7} height={7} patternTransform="rotate(-45)"><rect width={7} height={7} fill="#2b6fd6" /><rect width={2.4} height={7} fill="rgba(255,255,255,0.35)" /></pattern>
        {map.countries.filter((c) => FLAG_OF[c.name] || c.name === 'Kaliningrad').map((c) => <clipPath key={c.name} id={`cp-${pid(c.name)}`}><path d={c.d} /></clipPath>)}
        {[...BALTS, 'Poland', 'Kaliningrad'].map((n) => {
          const b = maskBox(n);
          return (
            <mask key={n} id={`m-${n}`} maskUnits="userSpaceOnUse" x={b[0]} y={b[1]} width={b[2] - b[0]} height={b[3] - b[1]}>
              <rect x={b[0]} y={b[1]} width={b[2] - b[0]} height={b[3] - b[1]} fill="black" />
              {n === 'Kaliningrad' ? circles(n, 'lib', 'white') : <>{circles(n, 'occ', 'white')}{circles(n, 'lib', 'black')}</>}
            </mask>
          );
        })}
      </defs>
      <g transform={tf}>
        <g transform="translate(2.5,3.5)" opacity={0.3}>{map.countries.filter((c) => visible(c.bbox)).map((c) => <path key={c.name} d={c.d} fill="#06213f" />)}</g>
        {map.countries.map((c) => (FLAG_OF[c.name] && visible(c.bbox) ? <CountryFlag key={c.name} c={c} code={FLAG_OF[c.name]} /> : visible(c.bbox) ? <path key={c.name} d={c.d} fill="#efe3c8" /> : null))}
        {[...BALTS, 'Poland'].map((n) => {
          const box = n === 'Poland' ? [1020, 530, 1075, 570] : byName[n].bbox;
          if (!visible(box)) return null;
          return <g key={n} mask={`url(#m-${n})`}><g clipPath={`url(#cp-${pid(n)})`}><g transform={`translate(${box[0]},${box[1]})`}><Flag code="ru" w={box[2] - box[0]} h={box[3] - box[1]} /></g></g><path d={byName[n].d} fill="url(#hatch)" /></g>;
        })}
        {visible(byName.Kaliningrad.bbox) && <g mask="url(#m-Kaliningrad)"><path d={byName.Kaliningrad.d} fill="url(#hatchB)" /></g>}
        {s0 < 2.4 && <image href={staticFile('relief.png')} x={-600} y={-600} width={3120} height={2280} preserveAspectRatio="none" clipPath="url(#land)" opacity={0.3 * lerp(s0, 2.0, 2.4, 1, 0, Easing.linear)} />}
        {map.countries.filter((c) => visible(c.bbox)).map((c) => <path key={c.name} d={c.d} fill="none" stroke={INK} strokeOpacity={KEY.has(c.name) ? 0.95 : 0.75} strokeWidth={KEY.has(c.name) ? 3.2 : 2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />)}
        {BALTS.map((n) => {
          const att = underAttack(n, t);
          const b = BATTLES.find((x) => x.country === n && t >= x.t0 && t < x.t1);
          if (att) return <path key={n} d={byName[n].d} fill="none" stroke={b?.lib ? BLUE : RED} strokeWidth={5 + pulse * 4} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />;
          if (occupied(n, t)) return <path key={n} d={byName[n].d} fill="none" stroke={RED} strokeWidth={4} strokeOpacity={0.85} vectorEffect="non-scaling-stroke" />;
          return null;
        })}
        {libGlow.map((n) => <path key={`lg${n}`} d={byName[n].d} fill="none" stroke={GREEN} strokeWidth={7} strokeOpacity={lerp(t, FILL[n][3] + 2.5, FILL[n][3] + 4, 1, 0)} vectorEffect="non-scaling-stroke" />)}
        {underAttack('Kaliningrad', t) && <path d={byName.Kaliningrad.d} fill="none" stroke={BLUE} strokeWidth={5 + pulse * 4} vectorEffect="non-scaling-stroke" />}
        {SQUADS.filter((q) => q.t1 - q.t0 > 3).map((q, i) => <PathArrow key={i} pts={q.pts} t={t} t0={q.t0} t1={q.t1} color={q.side === 'R' ? 'rgba(229,50,45,0.75)' : 'rgba(31,111,224,0.8)'} w={1.3 * vp.ui * Math.max(1, 3 / s)} fadeAfter={2} />)}
        {majorCities.map((c) => {
          const occ = CAPS.find((x) => x.city === c.city && x.kind === 'occ');
          const lib = CAPS.find((x) => x.city === c.city && x.kind === 'lib');
          const isKal = c.country === 'Kaliningrad';
          const freed = !!lib && t >= lib.t;
          const cap = !isKal && !!occ && t >= occ.t && !freed;
          const changed = freed ? lib!.t : cap ? occ!.t : -99;
          const k = changed > 0 ? popT(t, changed, 8) : 1;
          const bg = freed ? (isKal ? BLUE : GREEN) : cap ? RED : 'rgba(255,255,255,0.92)';
          const fg = freed || cap ? '#fff' : INK;
          const label = CITY_NAME[c.city] || c.city, w = label.length * 12 + 24;
          return (
            <g key={c.city} transform={`translate(${c.p[0]},${c.p[1]}) scale(${inv})`}>
              <circle r={6} fill={freed ? (isKal ? BLUE : GREEN) : cap ? RED : '#fff'} stroke={INK} strokeWidth={3} />
              <g transform={`translate(0,24) scale(${0.85 + 0.15 * k})`}><rect x={-w / 2} y={-13} width={w} height={26} rx={9} fill={bg} stroke={INK} strokeWidth={3} /><text y={7} textAnchor="middle" fontFamily="Fredoka" fontWeight={700} fontSize={19} fill={fg}>{label}</text></g>
              {freed && !isKal && t < lib!.t + 1.2 && <g transform={`translate(0,-22) scale(${lerp(t, lib!.t, lib!.t + 0.3, 0.2, 1) * lerp(t, lib!.t + 0.9, lib!.t + 1.2, 1, 0)})`}><rect x={-15} y={-10} width={30} height={20} fill="#fff" stroke={INK} strokeWidth={2.5} /><g transform="translate(-14,-9)"><Flag code={FLAG_OF[c.country]} w={28} h={18} /></g></g>}
            </g>
          );
        })}
        <Smoke t={t} />
        <Soldiers t={t} cam={cam} vp={vp} />
        {FLIGHTS.map((fl, i) => <Mover key={`f${i}`} pts={fl.pts} t={t} t0={fl.t0} t1={fl.t1} kind={fl.kind} code={fl.code} color={fl.color} inv={inv * 1.15} hold={fl.hold ?? 0.3} trail={fl.kind !== 'ship'} sinkAt={fl.sinkAt} />)}
        {CAPS.map((c, i) => <Boom key={i} p={c.p} t={t} at={c.t} r={9} />)}
        {CAPS.map((c, i) => <Boom key={`p${i}`} p={[c.p[0] + 6, c.p[1] - 4]} t={t} at={c.t - 1.4} r={6} />)}
        {[...(TL.airBursts as number[][]), ...(TL.navalBursts as number[][])].map(([tb, x, y], i) => <Boom key={`b${i}`} p={[x, y]} t={t} at={tb} r={11} />)}
        {FACES.map((fc) => { const m = moodOf(fc.name, t); return <Face key={fc.name} x={fc.p[0]} y={fc.p[1]} r={faceR(fc.r, s, vp.ui)} mood={m.mood} look={m.look} t={t} seed={fc.seed} talking={talkingNow(fc.name, t)} />; })}
      </g>
    </svg>
  );
};

// ================= etiquetas y bocadillos =================
const hudVisible = (t: number) => BATTLES.some((b) => t > b.t0 && t < b.t1 + 2.5);
const MapLabels: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const zoomed = cam.s > 1.7;
  const items: React.ReactNode[] = [];
  for (const fc of FACES) {
    if (zoomed ? !KEY.has(fc.name) : cam.s > 1.3 && !KEY.has(fc.name)) continue;
    if (!zoomed && BALTS.includes(fc.name) && cam.s < 1.4) continue;
    const [sx, sy0] = toScreen(fc.p, cam);
    const sy = sy0 + faceR(fc.r, cam.s) * cam.s + 10;
    if (sx < 80 || sx > 1840 || sy < 150 || sy > 1020) continue;
    if (hudVisible(t) && sx > 1420 && sy > 200 && sy < 760) continue;
    if (t > 468 && t < 520 && sx > 1050 && sx < 1880 && sy > 180 && sy < 900) continue;
    items.push(<div key={fc.name} style={{position: 'absolute', left: sx, top: sy, transform: 'translateX(-50%)', background: '#fff', border: `4px solid ${INK}`, borderRadius: 14, padding: '3px 14px 0', ...font, fontSize: BALTS.includes(fc.name) ? 30 : 26, color: INK, whiteSpace: 'nowrap', boxShadow: '0 4px 0 rgba(0,0,0,0.3)'}}>{NAMES[fc.name]}</div>);
  }
  if (zoomed) { const [sx, sy] = toScreen([1016, 541], cam); if (sx > 80 && sx < 1840 && sy > 150 && sy < 1020 && !(hudVisible(t) && sx > 1420)) items.push(<div key="kal" style={{position: 'absolute', left: sx, top: sy, transform: 'translateX(-50%)', background: '#fff', border: `4px solid ${INK}`, borderRadius: 14, padding: '3px 12px 0', ...font, fontSize: 22, color: INK}}>KALININGRAD</div>); }
  const a = zoomed ? lerp(cam.s, 1.7, 1.9, 0, 1, Easing.linear) : 1;
  return <div style={{position: 'absolute', inset: 0, opacity: a, zIndex: 3}}>{items}</div>;
};
const MapBubbles: React.FC<{t: number; cam: Cam}> = ({t, cam}) => (
  <>
    {BUBBLES.filter(([a, b]) => t >= a && t <= b).map(([a, b, w, text]) => {
      const fc = FACES.find((x) => x.name === w)!;
      const [sx, sy] = toScreen(fc.p, cam);
      const k = popT(t, a, 10) * lerp(t, b - 0.25, b, 1, 0);
      return <Bubble key={w + a} k={k} sx={Math.max(300, Math.min(hudVisible(t) ? 1200 : 1640, sx))} sy={Math.min(980, Math.max(230, sy - faceR(fc.r, cam.s) * cam.s - 14))} text={text} size={40} />;
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
export const Swords: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="-20 -20 40 40">
    {[-1, 1].map((d) => <g key={d} transform={`rotate(${d * 45})`}><rect x={-2.5} y={-17} width={5} height={24} rx={1} fill="#e6e6e6" stroke={INK} strokeWidth={2} /><rect x={-7} y={7} width={14} height={4} rx={2} fill={YELLOW} stroke={INK} strokeWidth={2} /><rect x={-2} y={11} width={4} height={7} fill="#8a5a2b" stroke={INK} strokeWidth={1.5} /></g>)}
  </svg>
);
export const UnitIcon: React.FC<{side: Side; units?: string}> = ({side, units}) => {
  const col = side === 'R' ? RED : BLUE;
  if (units === 'jets') return <svg width={40} height={40} viewBox="-28 -28 56 56"><g transform="rotate(90)"><path d="M0,-26 L5,-12 L5,-4 L26,8 L26,13 L5,7 L4,18 L11,24 L11,28 L0,25 L-11,28 L-11,24 L-4,18 L-5,7 L-26,13 L-26,8 L-5,-4 L-5,-12 Z" fill={col} stroke={INK} strokeWidth={3.5} /></g></svg>;
  if (units === 'ships') return <svg width={44} height={30} viewBox="-36 -14 72 28"><path d="M-34,-9 L22,-9 L36,0 L22,9 L-34,9 Z" fill={col} stroke={INK} strokeWidth={4} /><rect x={-18} y={-6} width={22} height={12} rx={2} fill="#c9d1d9" stroke={INK} strokeWidth={2.5} /></svg>;
  return <svg width={34} height={44} viewBox="-12 -20 24 36" style={{display: 'block'}}><Soldier side={side} walk={0} dir={side === 'R' ? 1 : -1} shoot={false} fallen={0} alpha={1} /></svg>;
};
const BattleHUD: React.FC<{t: number}> = ({t}) => {
  const b = BATTLES.find((x) => t >= x.t0 + 0.6 && t < x.t1 + 2.8);
  if (!b) return null;
  const k = popT(t, b.t0 + 0.6, 13) * lerp(t, b.t1 + 2.4, b.t1 + 2.8, 1, 0);
  const p = battleProgress(b, t);
  const attSide: Side = AXIS.has(b.att[0]) ? 'R' : 'E', defSide: Side = attSide === 'R' ? 'E' : 'R';
  const colOf = (s: Side) => (s === 'R' ? '#c0221d' : '#1557c0');
  const barCol = b.good || b.lib ? (b.lib ? GREEN : BLUE) : RED;
  const barDark = b.good || b.lib ? (b.lib ? '#178a47' : '#1557c0') : '#b51d18';
  if (b.kind === 'counter') {
    const v = b.A[0] + (b.A[1] - b.A[0]) * p;
    return (
      <div style={{position: 'absolute', right: 36, top: 230, width: 440, transform: `translateX(${(1 - k) * 520}px)`, zIndex: 9}}>
        <div style={{background: CREAM, border: `7px solid ${INK}`, borderRadius: 24, padding: '16px 22px 18px', boxShadow: '0 10px 0 rgba(0,0,0,0.35)'}}>
          <div style={{...font, fontSize: 38, color: INK, textAlign: 'center', marginBottom: 10}}>{b.title}</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}><MiniFlag code="eu" w={54} h={36} /><UnitIcon side="E" /><div style={{...font, fontSize: 62, color: '#1557c0'}}>{fmt(Math.round(v / 100) * 100)}</div></div>
          <div style={{...font, fontSize: 24, color: INK, marginTop: 12}}>{b.bar}</div>
          <div style={{height: 26, background: '#e6d9bd', border: `5px solid ${INK}`, borderRadius: 14, overflow: 'hidden', marginTop: 4}}><div style={{width: `${p * 100}%`, height: '100%', background: `repeating-linear-gradient(45deg, ${BLUE}, ${BLUE} 10px, #1557c0 10px, #1557c0 20px)`}} /></div>
          <div style={{display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center'}}>{['es', 'fr', 'it', 'gb', 'nl', 'de'].map((c, i) => <div key={c} style={{opacity: lerp(t, 181 + i * 1.2, 181.6 + i * 1.2, 0, 1), transform: `scale(${popT(t, 181 + i * 1.2, 9)})`}}><MiniFlag code={c} w={48} h={32} /></div>)}</div>
        </div>
      </div>
    );
  }
  const A = b.A[0] - (b.A[0] - b.A[1]) * (b.prog ? lerp(t, b.t0 + 1, b.t1 - 1, 0, 1) : p);
  const D = b.D[0] - (b.D[0] - b.D[1]) * (b.prog ? lerp(t, b.t0 + 1, b.t1 - 1, 0, 1) : Math.pow(p, 0.85));
  const caps = b.country ? capsOf(b.country, b.lib ? 'lib' : 'occ') : [];
  const popTimes = caps.length ? caps.map((c) => c.t) : Array.from({length: Math.floor((b.t1 - b.t0) / 3.5)}).map((_, i) => b.t0 + 3 + i * 3.5);
  const lastPop = [...popTimes].reverse().find((pt) => t >= pt && t < pt + 1.2);
  const lossA = (b.A[0] - b.A[1]) / popTimes.length, lossD = (b.D[0] - b.D[1]) / popTimes.length;
  const round = (v: number) => (b.units ? Math.round(v) : Math.round(v / 10) * 10);
  const row = (codes: string[], val: number, side: Side, loss: number) => (
    <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 12}}>
      <div style={{display: 'flex'}}>{codes.map((c, i) => <div key={c} style={{marginLeft: i ? -14 : 0}}><MiniFlag code={c} w={50} h={34} /></div>)}</div>
      <UnitIcon side={side} units={b.units} />
      <div style={{...font, fontSize: 58, color: colOf(side), lineHeight: 1}}>{fmt(round(val))}</div>
      {lastPop !== undefined && loss >= (b.units ? 1 : 10) && <div style={{position: 'absolute', right: -10, top: -30 - (t - lastPop) * 26, opacity: lerp(t, lastPop + 0.7, lastPop + 1.2, 1, 0), ...font, fontSize: 26, color: '#fff', background: colOf(side), border: `3px solid ${INK}`, borderRadius: 10, padding: '1px 8px 0'}}>-{fmt(round(loss))}</div>}
    </div>
  );
  return (
    <div style={{position: 'absolute', right: 36, top: 230, width: 440, transform: `translateX(${(1 - k) * 520}px)`, zIndex: 9}}>
      <div style={{background: CREAM, border: `7px solid ${INK}`, borderRadius: 24, padding: '16px 22px 18px', boxShadow: '0 10px 0 rgba(0,0,0,0.35)'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, ...font, fontSize: 38, color: INK, marginBottom: 10, whiteSpace: 'nowrap'}}><Swords size={38} />{b.title}</div>
        {row(b.att, A, attSide, lossA)}
        <div style={{display: 'flex', alignItems: 'center', gap: 10, margin: '6px 0'}}><div style={{flex: 1, height: 4, background: '#d9caa6'}} /><div style={{...font, fontSize: 30, color: '#fff', background: INK, borderRadius: 20, padding: '2px 14px 0'}}>VS</div><div style={{flex: 1, height: 4, background: '#d9caa6'}} /></div>
        {row(b.def, D, defSide, lossD)}
        <div style={{display: 'flex', justifyContent: 'space-between', ...font, fontSize: 25, color: INK, marginTop: 16, gap: 10}}><span style={{whiteSpace: 'nowrap'}}>{b.bar}</span><span style={{color: barDark}}>{Math.round(p * 100)}%</span></div>
        <div style={{height: 26, background: '#e6d9bd', border: `5px solid ${INK}`, borderRadius: 14, overflow: 'hidden', marginTop: 4}}><div style={{width: `${p * 100}%`, height: '100%', background: `repeating-linear-gradient(45deg, ${barCol}, ${barCol} 10px, ${barDark} 10px, ${barDark} 20px)`}} /></div>
      </div>
    </div>
  );
};
const DayCounter: React.FC<{t: number}> = ({t}) => {
  if (t < 3.8 || t > 520) return null;
  const k = popT(t, 3.8, 12) * lerp(t, 519.5, 520, 1, 0);
  const war = t >= 21, over = t >= 456;
  const dd = Math.max(1, Math.floor(warDay(t)));
  return (
    <div style={{position: 'absolute', top: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 10}}>
      <div style={{transform: `scale(${k})`, display: 'flex', alignItems: 'center', gap: 14, background: INK, padding: '10px 30px 6px 20px', borderRadius: 20, boxShadow: '0 6px 0 rgba(0,0,0,0.35)', border: `4px solid ${over ? GREEN : war ? RED : '#555'}`}}>
        <svg width={40} height={40} viewBox="0 0 36 36"><rect x={3} y={6} width={30} height={27} rx={5} fill="#fff" stroke={YELLOW} strokeWidth={3} /><rect x={3} y={6} width={30} height={9} fill={over ? GREEN : RED} /><rect x={9} y={2} width={4} height={8} rx={2} fill={YELLOW} /><rect x={23} y={2} width={4} height={8} rx={2} fill={YELLOW} /></svg>
        <div style={{...font, fontSize: 52, color: YELLOW, lineHeight: 1}}>{!war ? '2027' : over ? `CEASEFIRE · DAY ${dd}` : `DAY ${dd}`}</div>
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
  const flash = i === 3 ? lerp(dt, 0, 0.35, 0.6, 0) : 0;
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
  const good = !AXIS.has(b.att[0]) || b.good;
  return (
    <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 13}}>
      <div style={{transform: `scale(${k}) rotate(-2deg)`, display: 'flex', alignItems: 'center', gap: 18, background: good ? BLUE : RED, border: `7px solid ${INK}`, borderRadius: 22, padding: '10px 40px 4px', boxShadow: '0 10px 0 rgba(0,0,0,0.35)', ...font, fontSize: 76, color: '#fff', textShadow: `4px 4px 0 ${INK}`, whiteSpace: 'nowrap'}}><Swords size={70} />{b.banner}</div>
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
// resultado final, pregunta y cierre
const Results: React.FC<{t: number}> = ({t}) => {
  if (t < 469 || t > 506) return null;
  const k = popT(t, 469, 12) * lerp(t, 505.4, 506, 1, 0);
  const rows: [string, string, string, string][] = [
    ['ru', 'Russia & allies — soldiers lost', '228,000', '#c0221d'],
    ['eu', 'Europe — soldiers lost', '175,000', '#1557c0'],
    ['lt', 'Baltic states', 'LIBERATED', GREEN],
    ['ru', 'Kaliningrad', 'EUROPEAN CONTROL', BLUE],
  ];
  return (
    <div style={{position: 'absolute', right: 70, top: 200, width: 780, transform: `translateX(${(1 - k) * 900}px)`, zIndex: 11}}>
      <div style={{position: 'absolute', top: -34, left: 30, background: YELLOW, border: `6px solid ${INK}`, borderRadius: 16, padding: '4px 22px 0', ...font, fontSize: 44, color: INK, transform: 'rotate(-3deg)', zIndex: 2}}>WAR OVER · 76 DAYS</div>
      <div style={{background: CREAM, border: `8px solid ${INK}`, borderRadius: 28, padding: '44px 32px 22px', boxShadow: '0 12px 0 rgba(0,0,0,0.35)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14}}><MiniFlag code="eu" w={66} h={44} /><div style={{...font, fontSize: 60, color: '#1557c0'}}>EUROPE WINS</div></div>
        {rows.map(([c, l, v, col], i) => (
          <div key={l} style={{display: 'flex', alignItems: 'center', gap: 14, height: 66, borderTop: '3px solid #e2d3b1', opacity: lerp(t, 470 + i * 0.6, 470.4 + i * 0.6, 0, 1)}}>
            <MiniFlag code={c} w={50} h={34} /><div style={{...font2, fontSize: 30, color: INK, flex: 1}}>{l}</div><div style={{...font, fontSize: 40, color: col}}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
const Question: React.FC<{t: number}> = ({t}) => {
  if (t < 506 || t > 520) return null;
  const k = popT(t, 506, 11) * lerp(t, 519.4, 520, 1, 0);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 12, background: `rgba(8,18,32,${0.35 * k})`}}>
      <div style={{transform: `scale(${k}) rotate(-2deg)`, background: '#fff', border: `9px solid ${INK}`, borderRadius: 30, padding: '24px 50px 14px', ...font, fontSize: 92, color: INK, textAlign: 'center', lineHeight: 1.05, boxShadow: '0 12px 0 rgba(0,0,0,0.35)'}}>Could Europe win<br /><span style={{color: RED}}>WITHOUT</span> the US?</div>
      <div style={{marginTop: 30, transform: `scale(${popT(t, 507.2, 12) * lerp(t, 519.4, 520, 1, 0)})`, background: YELLOW, border: `6px solid ${INK}`, borderRadius: 24, padding: '8px 34px 2px', ...font, fontSize: 54, color: INK}}>Tell us in the comments!</div>
    </AbsoluteFill>
  );
};
const Outro: React.FC<{t: number}> = ({t}) => {
  if (t < 520) return null;
  const k = popT(t, 520.2, 11);
  const clickT = 523.5;
  const pressed = t > clickT && t < clickT + 0.4;
  const subbed = t > clickT + 0.2;
  const hand = lerp(t, 521.8, clickT, 0, 1, Easing.inOut(Easing.cubic));
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40, zIndex: 14, background: `rgba(8,18,32,${0.55 * k})`}}>
      <div style={{transform: `scale(${k})`, display: 'flex', alignItems: 'center', gap: 30}}>
        <Avatar size={190} code="eu" mood="happy" t={t} seed={3} id="out-eu" />
        <div style={{position: 'relative'}}>
          <div style={{transform: `scale(${pressed ? 0.92 : 1})`, background: subbed ? '#8a8a8a' : '#e62117', color: '#fff', border: `8px solid ${INK}`, borderRadius: 24, padding: '18px 54px 8px', ...font, fontSize: 84, boxShadow: '0 10px 0 rgba(0,0,0,0.4)'}}>{subbed ? 'SUBSCRIBED ✓' : 'SUBSCRIBE'}</div>
          <svg width={90} height={110} viewBox="0 0 60 74" style={{position: 'absolute', left: interpolate(hand, [0, 1], [420, 210]), top: interpolate(hand, [0, 1], [200, 60]), opacity: lerp(t, 521.5, 521.9, 0, 1)}}><path d="M22,4 C22,0 30,0 30,4 L30,30 L48,34 C54,35 56,40 54,46 L48,66 C47,70 44,72 40,72 L22,72 C18,72 15,69 13,66 L4,48 C2,44 6,40 10,42 L22,50 Z" fill="#fff" stroke={INK} strokeWidth={4} strokeLinejoin="round" /></svg>
        </div>
        <Avatar size={190} code="ru" mood="sad" t={t} seed={1} id="out-ru" />
      </div>
      <div style={{transform: `scale(${popT(t, 525, 12)})`, background: CREAM, border: `7px solid ${INK}`, borderRadius: 24, padding: '14px 36px 8px', ...font, fontSize: 52, color: INK, boxShadow: '0 10px 0 rgba(0,0,0,0.35)'}}>NEXT: <span style={{color: RED}}>What if China invaded Taiwan?</span></div>
    </AbsoluteFill>
  );
};
export const Ocean: React.FC<{t: number}> = ({t}) => (
  <svg width={1920} height={1080} style={{position: 'absolute'}}>
    <defs>
      <radialGradient id="sea5" cx="50%" cy="45%" r="75%"><stop offset="0%" stopColor="#3f97d6" /><stop offset="100%" stopColor="#1d5e9f" /></radialGradient>
      <pattern id="waves5" width={140} height={46} patternUnits="userSpaceOnUse" patternTransform={`translate(${(t * 10.5) % 140},0)`}><path d="M0,23 C17,13 35,13 52,23 S87,33 105,23 S122,13 140,23" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={3} /></pattern>
    </defs>
    <rect width={1920} height={1080} fill="url(#sea5)" /><rect width={1920} height={1080} fill="url(#waves5)" />
  </svg>
);
const Credit = () => <div style={{position: 'absolute', right: 18, bottom: 12, background: 'rgba(15,25,40,0.65)', color: '#fff', borderRadius: 12, padding: '5px 14px', ...font2, fontWeight: 600, fontSize: 17, zIndex: 20}}>Hypothetical simulation · Data: Global Firepower 2026, SIPRI 2025</div>;

export const War5: React.FC = () => {
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
      <Results t={t} />
      <DayCounter t={t} />
      <Countdown t={t} />
      <Question t={t} />
      <Outro t={t} />
      <Title t={t} />
      <Credit />
      <Audio src={staticFile('music5.wav')} />
    </AbsoluteFill>
  );
};

// ================= miniatura final =================
export const ThumbFinal: React.FC = () => {
  const t = 140;
  const cam: Cam = {cx: 1072, cy: 492, s: 3.4};
  return (
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <Ocean t={0} />
      <EuropeMap t={t} cam={cam} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.5) 100%)'}} />
      <div style={{position: 'absolute', left: 20, top: 330}}><Avatar size={420} code="eu" mood="angry" t={0.5} seed={3} look={[1, 0]} id="tf-eu" /></div>
      <div style={{position: 'absolute', right: 10, top: 300}}><Avatar size={470} code="ru" mood="angry" t={0.5} seed={1} look={[-1, 0]} id="tf-ru" /></div>
      <div style={{position: 'absolute', top: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: 'rotate(-2deg)', background: '#fff', border: `11px solid ${INK}`, borderRadius: 30, padding: '8px 50px 0', ...font, fontSize: 176, lineHeight: 1.05, boxShadow: '0 14px 0 rgba(0,0,0,0.45)', whiteSpace: 'nowrap'}}>
          <span style={{color: '#d4211b'}}>RUSSIA</span><span style={{color: INK, fontSize: 120}}> vs </span><span style={{color: '#1557c0'}}>EUROPE</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 960, top: 600, transform: 'translate(-50%,-50%) rotate(-4deg)', display: 'flex', alignItems: 'center', gap: 18, background: CREAM, border: `9px solid ${INK}`, borderRadius: 26, padding: '12px 30px 4px', boxShadow: '0 12px 0 rgba(0,0,0,0.4)'}}>
        <div style={{...font, fontSize: 96, color: '#c0221d'}}>62,000</div>
        <div style={{...font, fontSize: 56, color: '#fff', background: INK, borderRadius: 30, padding: '2px 22px 0'}}>VS</div>
        <div style={{...font, fontSize: 96, color: '#1557c0'}}>27,800</div>
      </div>
      <div style={{position: 'absolute', bottom: 36, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: 'rotate(2deg)', background: YELLOW, border: `11px solid ${INK}`, borderRadius: 30, padding: '4px 64px 0', ...font, fontSize: 156, color: INK, boxShadow: '0 14px 0 rgba(0,0,0,0.45)'}}>WHO WINS?</div>
      </div>
    </AbsoluteFill>
  );
};

// ================= miniaturas alternativas =================
const TX = (size: number, color: string, sw = size * 0.13, stroke = INK): React.CSSProperties => ({
  ...font, fontSize: size, color, WebkitTextStroke: `${sw}px ${stroke}`, paintOrder: 'stroke fill', lineHeight: 0.92,
  textShadow: `0 ${size * 0.07}px 0 rgba(0,0,0,0.55)`, whiteSpace: 'nowrap',
});
const FatArrow: React.FC<{pts: P[]; color: string; w: number}> = ({pts, color, w}) => {
  const sp = smoothPath(pts, 14);
  const a = sp[sp.length - 3], b = sp[sp.length - 1];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const body = sp.slice(0, -2);
  const d = 'M' + body.map((p) => p.join(',')).join(' L');
  const hl = w * 2.1, hw = w * 1.5;
  const tip: P = [b[0] + Math.cos(ang) * w * 0.6, b[1] + Math.sin(ang) * w * 0.6];
  const base: P = [tip[0] - Math.cos(ang) * hl, tip[1] - Math.sin(ang) * hl];
  const l: P = [base[0] + Math.cos(ang + Math.PI / 2) * hw, base[1] + Math.sin(ang + Math.PI / 2) * hw];
  const r: P = [base[0] - Math.cos(ang + Math.PI / 2) * hw, base[1] - Math.sin(ang + Math.PI / 2) * hw];
  const head = `${tip.join(',')} ${l.join(',')} ${r.join(',')}`;
  return (
    <g>
      <path d={d} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth={w + 16} strokeLinecap="round" transform="translate(0,10)" />
      <polygon points={head} fill="rgba(0,0,0,0.4)" transform="translate(0,10)" />
      <path d={d} fill="none" stroke={INK} strokeWidth={w + 16} strokeLinecap="round" strokeLinejoin="round" />
      <polygon points={head} fill={INK} stroke={INK} strokeWidth={16} strokeLinejoin="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      <polygon points={head} fill={color} />
    </g>
  );
};
const Burst: React.FC<{x: number; y: number; r: number; fill: string; n?: number}> = ({x, y, r, fill, n = 14}) => {
  const pts = Array.from({length: n * 2}).map((_, i) => { const a = (i / (n * 2)) * Math.PI * 2; const rr = i % 2 ? r * 0.72 : r; return `${x + Math.cos(a) * rr},${y + Math.sin(a) * rr}`; }).join(' ');
  return <polygon points={pts} fill={fill} stroke={INK} strokeWidth={r * 0.07} strokeLinejoin="round" />;
};
const Kaboom: React.FC<{p: P; t: number; at: number; r: number}> = ({p, r}) => (
  <g>
    {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={p[0] + Math.cos(i * 1.3) * r * 0.7} cy={p[1] - r * 0.35 + Math.sin(i * 1.3) * r * 0.35} r={r * 0.45} fill="#3b3b3b" opacity={0.55} />)}
    <Burst x={p[0]} y={p[1]} r={r} fill={ORANGE} n={11} />
    <Burst x={p[0]} y={p[1]} r={r * 0.62} fill={YELLOW} n={9} />
    <circle cx={p[0]} cy={p[1]} r={r * 0.22} fill="#fff8d0" />
  </g>
);
const sc = (n: string, cam: Cam, dx = 0, dy = 0): P => toScreen([CT[n][0] + dx, CT[n][1] + dy], cam);
const Pos: React.FC<{x: number; y: number; rot?: number; children: React.ReactNode; z?: number}> = ({x, y, rot = 0, children, z = 5}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg)`, zIndex: z}}>{children}</div>
);
const Av = (code: string, size: number, mood: Mood, x: number, y: number, look: P, id: string, seed = 2) => (
  <Pos x={x} y={y} z={6}><Avatar size={size} code={code} mood={mood} t={0.5} seed={seed} look={look} id={id} /></Pos>
);
const BigSoldiers: React.FC<{side: Side; x0: number; y0: number; n: number; s: number; dir: number; flag: string; fallen?: number[]}> = ({side, x0, y0, n, s, dir, flag, fallen = []}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const row = i % 3, col = Math.floor(i / 3);
      const x = x0 - dir * (col * 26 + row * 9) * s, y = y0 + (row - 1) * 22 * s + col * 3 * s;
      return <g key={i} transform={`translate(${x},${y}) scale(${s * (1 - col * 0.06)})`}><Soldier side={side} walk={i * 1.3} dir={dir} shoot={i % 2 === 0} fallen={fallen.includes(i) ? 1 : 0} flag={i === 1 ? flag : undefined} alpha={1} /></g>;
    })}
  </g>
);

export const ThumbV: React.FC<{v: string}> = ({v}) => {
  if (v === 'A') {
    // WAR IN EUROPE: invasión con flechas y explosiones
    const t = 140, cam: Cam = {cx: 1040, cy: 468, s: 3.3};
    return (
      <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
        <Ocean t={0} /><EuropeMap t={t} cam={cam} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 62% 50%, rgba(80,0,0,0) 30%, rgba(90,0,0,0.75) 100%)'}} />
        <svg width={1920} height={1080} style={{position: 'absolute', zIndex: 4}}>
          <FatArrow pts={[sc('Narva', cam, 95, 6), sc('Narva', cam, 30, 6), sc('Tallinn', cam, 8, 2)]} color={RED} w={46} />
          <FatArrow pts={[sc('Rezekne', cam, 90, 0), sc('Rezekne', cam, 20, -4), sc('Riga', cam, 9, 0)]} color={RED} w={46} />
          <FatArrow pts={[sc('Vilnius', cam, 60, 55), sc('Vilnius', cam, 5, 15), sc('Kaunas', cam, 6, -2)]} color={RED} w={46} />
          <Kaboom p={sc('Riga', cam)} t={0.3} at={0} r={70} />
          <Kaboom p={sc('Tallinn', cam, -4, 0)} t={0.32} at={0} r={60} />
          <Kaboom p={sc('Kaunas', cam, -6, 0)} t={0.28} at={0} r={66} />
        </svg>
        {Av('ru', 560, 'angry', 1790, 560, [-1, 0.1], 'ta-ru', 1)}
        {Av('by', 250, 'angry', 1520, 930, [-1, -0.3], 'ta-by', 4)}
        {Av('ee', 150, 'scared', 120, 920, [1, 0], 'ta-ee', 5)}
        {Av('lv', 150, 'scared', 290, 950, [1, 0], 'ta-lv', 6)}
        {Av('lt', 150, 'scared', 460, 930, [1, 0], 'ta-lt', 7)}
        <Pos x={430} y={210} rot={-5} z={8}><div style={TX(250, '#fff')}>WAR</div></Pos>
        <Pos x={460} y={420} rot={-5} z={8}><div style={TX(150, YELLOW)}>IN EUROPE</div></Pos>
        <Pos x={300} y={590} rot={-5} z={8}><div style={{...font, fontSize: 70, color: '#fff', background: RED, border: `8px solid ${INK}`, borderRadius: 20, padding: '6px 28px 0', boxShadow: '0 10px 0 rgba(0,0,0,0.5)'}}>DAY 1</div></Pos>
      </AbsoluteFill>
    );
  }
  if (v === 'B') {
    // 3 vs 30: pantalla partida
    const zig = 'M1020,0 L900,300 L1010,330 L880,640 L990,670 L860,1080 L1920,1080 L1920,0 Z';
    const eu: [string, number, number, number][] = [['de', 1250, 330, 210], ['fr', 1500, 300, 200], ['gb', 1740, 340, 200], ['pl', 1150, 590, 190], ['it', 1820, 600, 180], ['fi', 1380, 560, 160], ['se', 1640, 560, 160], ['es', 1260, 830, 170], ['nl', 1500, 820, 150], ['ee', 1720, 840, 140], ['lv', 1880, 830, 120], ['lt', 1100, 860, 140]];
    return (
      <AbsoluteFill style={{background: 'radial-gradient(circle at 25% 50%, #f04a3c, #8e0f0b)', overflow: 'hidden'}}>
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          <defs><radialGradient id="tbB" cx="75%" cy="50%" r="70%"><stop offset="0%" stopColor="#3f8cf0" /><stop offset="100%" stopColor="#0d2e78" /></radialGradient></defs>
          {Array.from({length: 18}).map((_, i) => { const a = (i / 18) * Math.PI * 2; return <path key={i} d={`M420,560 L${420 + Math.cos(a) * 1600},${560 + Math.sin(a) * 1600} L${420 + Math.cos(a + 0.17) * 1600},${560 + Math.sin(a + 0.17) * 1600} Z`} fill="rgba(255,255,255,0.07)" />; })}
          <path d={zig} fill="url(#tbB)" />
          {Array.from({length: 18}).map((_, i) => { const a = (i / 18) * Math.PI * 2; return <path key={i} d={`M1500,560 L${1500 + Math.cos(a) * 1600},${560 + Math.sin(a) * 1600} L${1500 + Math.cos(a + 0.17) * 1600},${560 + Math.sin(a + 0.17) * 1600} Z`} fill="rgba(255,255,255,0.06)" clipPath="url(#clB)" />; })}
          <clipPath id="clB"><path d={zig} /></clipPath>
          <path d={zig} fill="none" stroke="#fff" strokeWidth={26} />
          <path d={zig} fill="none" stroke={INK} strokeWidth={10} />
        </svg>
        {eu.map(([c, x, y, s], i) => <React.Fragment key={c}>{Av(c, s, 'angry', x, y, [-1, 0], `tb-${c}`, i + 3)}</React.Fragment>)}
        {Av('eu', 330, 'angry', 1480, 560, [-1, 0], 'tb-eu', 2)}
        {Av('ru', 470, 'angry', 400, 560, [1, 0], 'tb-ru', 1)}
        {Av('by', 260, 'angry', 690, 330, [1, 0.2], 'tb-by', 4)}
        {Av('kp', 260, 'angry', 700, 820, [1, -0.2], 'tb-kp', 6)}
        <Pos x={390} y={150} rot={-4} z={8}><div style={TX(230, '#fff')}>3</div></Pos>
        <Pos x={1500} y={150} rot={4} z={8}><div style={TX(230, '#fff')}>30</div></Pos>
        <svg width={1920} height={1080} style={{position: 'absolute', zIndex: 9}}><Burst x={945} y={530} r={175} fill={YELLOW} n={16} /></svg>
        <Pos x={945} y={545} rot={-6} z={10}><div style={TX(170, RED, 20)}>VS</div></Pos>
        <Pos x={960} y={985} rot={-2} z={10}><div style={{...font, fontSize: 112, color: INK, background: '#fff', border: `11px solid ${INK}`, borderRadius: 28, padding: '6px 48px 0', boxShadow: '0 12px 0 rgba(0,0,0,0.5)'}}>WHO WINS?</div></Pos>
      </AbsoluteFill>
    );
  }
  if (v === 'C') {
    // Europa sin EE.UU.
    const t = 200, cam: Cam = {cx: 930, cy: 520, s: 1.15};
    return (
      <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
        <Ocean t={0} /><EuropeMap t={t} cam={cam} />
        <AbsoluteFill style={{background: 'rgba(10,20,40,0.45)'}} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.6) 100%)'}} />
        {Av('eu', 500, 'angry', 330, 640, [1, 0], 'tc-eu', 3)}
        {Av('ru', 500, 'smug', 1590, 640, [-1, 0], 'tc-ru', 1)}
        <Pos x={960} y={520} z={7}>
          <div style={{position: 'relative', width: 330, height: 330}}>
            <Avatar size={330} code="us" mood="shocked" t={0.5} seed={9} look={[0, 0]} id="tc-us" />
            <svg width={400} height={400} viewBox="-200 -200 400 400" style={{position: 'absolute', left: -35, top: -35}}>
              <circle r={178} fill="none" stroke={INK} strokeWidth={62} />
              <circle r={178} fill="none" stroke="#e5221b" strokeWidth={44} />
              <line x1={-126} y1={-126} x2={126} y2={126} stroke={INK} strokeWidth={62} />
              <line x1={-126} y1={-126} x2={126} y2={126} stroke="#e5221b" strokeWidth={44} />
            </svg>
          </div>
        </Pos>
        <Pos x={960} y={140} rot={-2} z={8}><div style={{whiteSpace: 'nowrap'}}><span style={TX(170, '#4d93ff')}>EUROPE </span><span style={TX(110, '#fff')}>vs </span><span style={TX(170, '#ff3b30')}>RUSSIA</span></div></Pos>
        <Pos x={960} y={950} rot={2} z={8}><div style={{...font, fontSize: 124, color: INK, background: YELLOW, border: `11px solid ${INK}`, borderRadius: 28, padding: '6px 50px 0', boxShadow: '0 12px 0 rgba(0,0,0,0.5)', whiteSpace: 'nowrap'}}>WITHOUT THE USA?</div></Pos>
      </AbsoluteFill>
    );
  }
  if (v === 'D') {
    // estilo videojuego de lucha
    const t = 150, cam = camera(150);
    const Bar: React.FC<{code: string; name: string; hp: number; color: string; flip?: boolean}> = ({code, name, hp, color, flip}) => (
      <div style={{display: 'flex', flexDirection: flip ? 'row-reverse' : 'row', alignItems: 'center', gap: 16}}>
        <Avatar size={170} code={code} mood="angry" t={0.5} seed={flip ? 1 : 3} look={[flip ? -1 : 1, 0]} id={`td-${code}`} />
        <div style={{display: 'flex', flexDirection: 'column', alignItems: flip ? 'flex-end' : 'flex-start', gap: 6}}>
          <div style={TX(74, '#fff', 12)}>{name}</div>
          <div style={{width: 560, height: 54, background: '#3a0d0d', border: `8px solid ${INK}`, borderRadius: 14, overflow: 'hidden', display: 'flex', justifyContent: flip ? 'flex-end' : 'flex-start', boxShadow: '0 8px 0 rgba(0,0,0,0.5)'}}>
            <div style={{width: `${hp * 100}%`, background: `linear-gradient(${color}, ${color}cc)`, borderRight: flip ? 'none' : `6px solid ${INK}`, borderLeft: flip ? `6px solid ${INK}` : 'none'}} />
          </div>
        </div>
      </div>
    );
    return (
      <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
        <Ocean t={0} /><EuropeMap t={t} cam={cam} />
        <AbsoluteFill style={{background: 'linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0) 35%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.6))'}} />
        <svg width={1920} height={1080} style={{position: 'absolute', zIndex: 4}}>
          {[[540, 760], [650, 870], [600, 690], [1270, 760], [1350, 880], [1300, 690]].map(([x, y], i) => <line key={i} x1={x} y1={y - 15} x2={x < 960 ? x + 560 : x - 560} y2={y - 25 + (i % 3) * 10} stroke={YELLOW} strokeWidth={6} strokeDasharray="60 50" opacity={0.85} />)}
          <Kaboom p={[960, 760]} t={0.3} at={0} r={120} />
          <Kaboom p={[760, 900]} t={0.45} at={0} r={80} />
          <Kaboom p={[1180, 640]} t={0.4} at={0} r={70} />
          <BigSoldiers side="E" x0={640} y0={800} n={9} s={4.2} dir={1} flag="eu" fallen={[8]} />
          <BigSoldiers side="R" x0={1290} y0={800} n={9} s={4.2} dir={-1} flag="ru" fallen={[7]} />
        </svg>
        <div style={{position: 'absolute', top: 30, left: 30, zIndex: 8}}><Bar code="eu" name="EUROPE" hp={0.32} color="#2f8cff" /></div>
        <div style={{position: 'absolute', top: 30, right: 30, zIndex: 8}}><Bar code="ru" name="RUSSIA" hp={0.88} color="#ff3b30" flip /></div>
        <Pos x={960} y={110} z={9}><div style={{...font, fontSize: 66, color: '#fff', background: INK, border: '6px solid #fff', borderRadius: 18, padding: '4px 22px 0'}}>VS</div></Pos>
        <Pos x={960} y={420} rot={-6} z={9}><div style={{...TX(270, YELLOW, 30, '#b3120d')}}>FIGHT!</div></Pos>
      </AbsoluteFill>
    );
  }
  // E: Europa contraataca
  const t = 352, cam: Cam = {cx: 1060, cy: 480, s: 3.1};
  return (
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <Ocean t={0} /><EuropeMap t={t} cam={cam} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 45% 50%, rgba(0,20,80,0) 30%, rgba(0,20,80,0.7) 100%)'}} />
      <svg width={1920} height={1080} style={{position: 'absolute', zIndex: 4}}>
        <FatArrow pts={[sc('Kaliningrad', cam, -70, 25), sc('Kaunas', cam, -25, 14), sc('Vilnius', cam, 75, 12)]} color={BLUE} w={56} />
        <FatArrow pts={[sc('Liepaja', cam, -60, -4), sc('Riga', cam, -5, 14), sc('Daugavpils', cam, 85, -20)]} color={BLUE} w={56} />
        
        <Kaboom p={sc('Vilnius', cam, 100, -25)} t={0} at={0} r={70} />
        <Kaboom p={sc('Daugavpils', cam, 110, 10)} t={0} at={0} r={60} />
      </svg>
      {Av('ru', 520, 'scared', 1730, 640, [-1, 0], 'te-ru', 1)}
      {Av('eu', 380, 'angry', 230, 800, [1, -0.2], 'te-eu', 3)}
      <Pos x={560} y={190} rot={-4} z={8}><div style={TX(170, '#fff')}>EUROPE</div></Pos>
      <Pos x={620} y={375} rot={-4} z={8}><div style={TX(150, '#5aa9ff')}>STRIKES BACK</div></Pos>
    </AbsoluteFill>
  );
};

// ================= SHORTS verticales (1080x1920) =================
type ShortDef = {part: number; hook: string; next: string; map: [number, number][]; end: number};
export const SHORT_DEFS = SHORTS as unknown as ShortDef[];
const SW = 1080, SH = 1920;
const VPV: VP = {W: SW, H: SH, ox: 540, oy: 1080, ui: 1.3, k: 1.0};
const mapTime = (ts: number, m: [number, number][]) => interpolate(ts, m.map((x) => x[0]), m.map((x) => x[1]), clamp);
const invTime = (to: number, m: [number, number][]) => interpolate(to, m.map((x) => x[1]), m.map((x) => x[0]), clamp);
const camV = (t: number): Cam => { const c = camera(t); return {cx: c.cx - 14 / Math.max(1, c.s / 3), cy: c.cy, s: c.s * VPV.k}; };
const toV = (p: P, cam: Cam): P => [VPV.ox + (p[0] - cam.cx) * cam.s, VPV.oy + (p[1] - cam.cy) * cam.s];

const OceanV: React.FC<{t: number}> = ({t}) => (
  <svg width={SW} height={SH} style={{position: 'absolute'}}>
    <defs>
      <radialGradient id="seaV" cx="50%" cy="50%" r="80%"><stop offset="0%" stopColor="#3f97d6" /><stop offset="100%" stopColor="#1d5e9f" /></radialGradient>
      <pattern id="wavesV" width={140} height={46} patternUnits="userSpaceOnUse" patternTransform={`translate(${(t * 10.5) % 140},0)`}><path d="M0,23 C17,13 35,13 52,23 S87,33 105,23 S122,13 140,23" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={3} /></pattern>
    </defs>
    <rect width={SW} height={SH} fill="url(#seaV)" /><rect width={SW} height={SH} fill="url(#wavesV)" />
  </svg>
);
const MapLabelsV: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const zoomed = cam.s / VPV.k > 1.7;
  const items: React.ReactNode[] = [];
  for (const fc of FACES) {
    if (!KEY.has(fc.name) && (zoomed || cam.s / VPV.k > 1.3)) continue;
    if (!zoomed && BALTS.includes(fc.name) && cam.s / VPV.k < 1.4) continue;
    const [sx, sy0] = toV(fc.p, cam);
    const sy = sy0 + faceR(fc.r, cam.s, VPV.ui) * cam.s + 10;
    if (sx < 110 || sx > 970 || sy < (hudVisible(t) ? 640 : 260) || sy > 1640) continue;
    items.push(<div key={fc.name} style={{position: 'absolute', left: sx, top: sy, transform: 'translateX(-50%)', background: '#fff', border: `5px solid ${INK}`, borderRadius: 16, padding: '3px 16px 0', ...font, fontSize: BALTS.includes(fc.name) ? 40 : 36, color: INK, whiteSpace: 'nowrap', boxShadow: '0 5px 0 rgba(0,0,0,0.3)'}}>{NAMES[fc.name]}</div>);
  }
  const a = zoomed ? lerp(cam.s / VPV.k, 1.7, 1.9, 0, 1, Easing.linear) : 1;
  return <div style={{position: 'absolute', inset: 0, opacity: a, zIndex: 3}}>{items}</div>;
};
const BubblesV: React.FC<{t: number; cam: Cam}> = ({t, cam}) => (
  <>
    {BUBBLES.filter(([a, b]) => t >= a && t <= b).map(([a, b, w, text]) => {
      const fc = FACES.find((x) => x.name === w)!;
      const [sx, sy] = toV(fc.p, cam);
      const k = popT(t, a, 10) * lerp(t, b - 0.25, b, 1, 0);
      const half = text.length * 14 + 40;
      return <Bubble key={w + a} k={k} sx={Math.max(half + 20, Math.min(SW - half - 20, sx))} sy={Math.min(1560, Math.max(hudVisible(t) ? 700 : 330, sy - faceR(fc.r, cam.s, VPV.ui) * cam.s - 14))} text={text} size={50} />;
    })}
  </>
);
const HudV: React.FC<{t: number}> = ({t}) => {
  const b = BATTLES.find((x) => t >= x.t0 + 0.6 && t < x.t1 + 2.8);
  if (!b) return null;
  const k = popT(t, b.t0 + 0.6, 13) * lerp(t, b.t1 + 2.4, b.t1 + 2.8, 1, 0);
  const p = battleProgress(b, t);
  const attSide: Side = AXIS.has(b.att[0]) ? 'R' : 'E', defSide: Side = attSide === 'R' ? 'E' : 'R';
  const colOf = (s: Side) => (s === 'R' ? '#c0221d' : '#1557c0');
  const barCol = b.good || b.lib ? (b.lib ? GREEN : BLUE) : RED;
  const barDark = b.good || b.lib ? (b.lib ? '#178a47' : '#1557c0') : '#b51d18';
  const wrap = (body: React.ReactNode) => (
    <div style={{position: 'absolute', left: 40, right: 40, top: 230, transform: `translateY(${(1 - k) * -700}px)`, zIndex: 9}}>
      <div style={{background: CREAM, border: `8px solid ${INK}`, borderRadius: 30, padding: '18px 28px 22px', boxShadow: '0 12px 0 rgba(0,0,0,0.35)'}}>{body}</div>
    </div>
  );
  const bar = (
    <>
      <div style={{display: 'flex', justifyContent: 'space-between', ...font, fontSize: 36, color: INK, marginTop: 14}}><span>{b.bar}</span><span style={{color: barDark}}>{Math.round(p * 100)}%</span></div>
      <div style={{height: 34, background: '#e6d9bd', border: `6px solid ${INK}`, borderRadius: 17, overflow: 'hidden', marginTop: 6}}><div style={{width: `${p * 100}%`, height: '100%', background: `repeating-linear-gradient(45deg, ${barCol}, ${barCol} 12px, ${barDark} 12px, ${barDark} 24px)`}} /></div>
    </>
  );
  if (b.kind === 'counter') {
    const v = b.A[0] + (b.A[1] - b.A[0]) * p;
    return wrap(
      <>
        <div style={{...font, fontSize: 50, color: INK, textAlign: 'center'}}>{b.title}</div>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 6}}>
          <MiniFlag code="eu" w={72} h={48} /><UnitIcon side="E" /><div style={{...font, fontSize: 88, color: '#1557c0', lineHeight: 1}}>{fmt(Math.round(v / 100) * 100)}</div>
          <div style={{display: 'flex', gap: 4, marginLeft: 8}}>{['es', 'fr', 'it', 'gb', 'nl', 'de'].map((c, i) => <div key={c} style={{transform: `scale(${popT(t, 181 + i * 1.2, 9)})`}}><MiniFlag code={c} w={40} h={27} /></div>)}</div>
        </div>
        {bar}
      </>,
    );
  }
  const A = b.A[0] - (b.A[0] - b.A[1]) * (b.prog ? lerp(t, b.t0 + 1, b.t1 - 1, 0, 1) : p);
  const D = b.D[0] - (b.D[0] - b.D[1]) * (b.prog ? lerp(t, b.t0 + 1, b.t1 - 1, 0, 1) : Math.pow(p, 0.85));
  const caps = b.country ? capsOf(b.country, b.lib ? 'lib' : 'occ') : [];
  const popTimes = caps.length ? caps.map((c) => c.t) : Array.from({length: Math.floor((b.t1 - b.t0) / 3.5)}).map((_, i) => b.t0 + 3 + i * 3.5);
  const lastPop = [...popTimes].reverse().find((pt) => t >= pt && t < pt + 1.2);
  const lossA = (b.A[0] - b.A[1]) / popTimes.length, lossD = (b.D[0] - b.D[1]) / popTimes.length;
  const round = (v: number) => (b.units ? Math.round(v) : Math.round(v / 10) * 10);
  const side = (codes: string[], val: number, sd: Side, loss: number, right: boolean) => (
    <div style={{position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: right ? 'flex-end' : 'flex-start', gap: 4}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 8, flexDirection: right ? 'row-reverse' : 'row'}}>
        <div style={{display: 'flex'}}>{codes.map((c, i) => <div key={c} style={{marginLeft: i ? -16 : 0}}><MiniFlag code={c} w={60} h={40} /></div>)}</div>
        <UnitIcon side={sd} units={b.units} />
      </div>
      <div style={{...font, fontSize: 72, color: colOf(sd), lineHeight: 1}}>{fmt(round(val))}</div>
      {lastPop !== undefined && loss >= (b.units ? 1 : 10) && <div style={{position: 'absolute', [right ? 'left' : 'right']: 0, top: -6 - (t - lastPop) * 30, opacity: lerp(t, lastPop + 0.7, lastPop + 1.2, 1, 0), ...font, fontSize: 34, color: '#fff', background: colOf(sd), border: `4px solid ${INK}`, borderRadius: 12, padding: '1px 10px 0'}}>-{fmt(round(loss))}</div>}
    </div>
  );
  return wrap(
    <>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, ...font, fontSize: 50, color: INK, marginBottom: 8, whiteSpace: 'nowrap'}}><Swords size={48} />{b.title}</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
        {side(b.att, A, attSide, lossA, false)}
        <div style={{...font, fontSize: 40, color: '#fff', background: INK, borderRadius: 24, padding: '4px 16px 0'}}>VS</div>
        {side(b.def, D, defSide, lossD, true)}
      </div>
      {bar}
    </>,
  );
};
const HeaderV: React.FC<{t: number; part: number}> = ({t, part}) => {
  const war = t >= 21, over = t >= 456;
  const dd = Math.max(1, Math.floor(warDay(t)));
  return (
    <div style={{position: 'absolute', top: 118, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 16, zIndex: 10}}>
      <div style={{background: YELLOW, border: `5px solid ${INK}`, borderRadius: 18, padding: '6px 20px 0', ...font, fontSize: 44, color: INK, boxShadow: '0 6px 0 rgba(0,0,0,0.35)'}}>PART {part}/6</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, background: INK, padding: '6px 24px 2px 16px', borderRadius: 18, boxShadow: '0 6px 0 rgba(0,0,0,0.35)', border: `5px solid ${over ? GREEN : war ? RED : '#555'}`}}>
        <svg width={36} height={36} viewBox="0 0 36 36"><rect x={3} y={6} width={30} height={27} rx={5} fill="#fff" stroke={YELLOW} strokeWidth={3} /><rect x={3} y={6} width={30} height={9} fill={over ? GREEN : RED} /></svg>
        <div style={{...font, fontSize: 44, color: YELLOW, lineHeight: 1}}>{!war ? '2027' : over ? `CEASEFIRE · DAY ${dd}` : `DAY ${dd}`}</div>
      </div>
    </div>
  );
};
const BannerV: React.FC<{t: number; ts: number; m: [number, number][]; hide: boolean}> = ({t, ts, m, hide}) => {
  if (hide) return null;
  const b = BATTLES.find((x) => { const s0 = invTime(x.t0, m); return ts >= s0 && ts < s0 + 2.0 && x.t0 >= m[0][1] - 0.01; });
  if (!b) return null;
  const s0 = invTime(b.t0, m), dt = ts - s0;
  const k = popT(ts, s0, 11) * lerp(dt, 1.7, 2.0, 1, 0);
  const good = !AXIS.has(b.att[0]) || b.good;
  return (
    <div style={{position: 'absolute', top: 640, left: 30, right: 30, display: 'flex', justifyContent: 'center', zIndex: 13}}>
      <div style={{transform: `scale(${k}) rotate(-2deg)`, background: good ? BLUE : RED, border: `8px solid ${INK}`, borderRadius: 26, padding: '14px 30px 6px', boxShadow: '0 10px 0 rgba(0,0,0,0.35)', ...font, fontSize: 70, color: '#fff', textShadow: `4px 4px 0 ${INK}`, textAlign: 'center', lineHeight: 1.02}}>{b.banner}</div>
    </div>
  );
};
const StampV: React.FC<{ts: number; m: [number, number][]; hide: boolean}> = ({ts, m, hide}) => {
  if (hide) return null;
  const st = (TL.stamps as any[]).find((s) => { const s0 = invTime(s.t, m); return s.t >= m[0][1] && s.t <= m[m.length - 1][1] && ts >= s0 && ts < s0 + 1.5; });
  if (!st) return null;
  const dt = ts - invTime(st.t, m);
  const k = dt < 0.25 ? interpolate(dt, [0, 0.25], [2.2, 1], {...clamp, easing: Easing.out(Easing.cubic)}) : 1;
  const a = lerp(dt, 0, 0.1, 0, 1) * lerp(dt, 1.25, 1.5, 1, 0);
  const col = st.c === 'red' ? RED : st.c === 'blue' ? BLUE : GREEN;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1010, display: 'flex', justifyContent: 'center', zIndex: 12}}>
      <div style={{transform: `translateY(-50%) scale(${k}) rotate(-6deg)`, opacity: a, border: `12px solid ${col}`, color: col, background: 'rgba(255,246,227,0.95)', borderRadius: 22, padding: '16px 34px 6px', ...font, fontSize: 100, textAlign: 'center', lineHeight: 1, maxWidth: 940, boxShadow: '0 10px 0 rgba(0,0,0,0.3)'}}>{st.text}</div>
    </div>
  );
};
const HookV: React.FC<{ts: number; text: string}> = ({ts, text}) => {
  if (ts > 1.6) return null;
  const k = (1 + 0.06 * Math.sin(ts * 14) * Math.exp(-ts * 3)) * lerp(ts, 1.3, 1.6, 1, 0, Easing.in(Easing.cubic));
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 15, background: `rgba(8,18,32,${0.35 * lerp(ts, 1.2, 1.6, 1, 0)})`}}>
      <div style={{transform: `scale(${k}) rotate(-3deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
        <div style={{background: INK, color: '#fff', borderRadius: 18, padding: '8px 24px 2px', ...font, fontSize: 42}}>WHAT IF RUSSIA INVADED EUROPE?</div>
        <div style={{background: '#fff', border: `11px solid ${INK}`, borderRadius: 34, padding: '20px 36px 8px', ...font, fontSize: 118, color: RED, textAlign: 'center', lineHeight: 0.98, maxWidth: 980, boxShadow: '0 14px 0 rgba(0,0,0,0.45)'}}>{text}</div>
      </div>
    </AbsoluteFill>
  );
};
const EndV: React.FC<{ts: number; d: ShortDef}> = ({ts, d}) => {
  if (ts < d.end) return null;
  const k = popT(ts, d.end, 11);
  if (!d.next) {
    return (
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 16, background: `rgba(8,18,32,${0.45 * k})`}}>
        <div style={{transform: `scale(${k}) rotate(-2deg)`, background: '#fff', border: `11px solid ${INK}`, borderRadius: 34, padding: '26px 40px 12px', ...font, fontSize: 104, color: INK, textAlign: 'center', lineHeight: 1.02, boxShadow: '0 14px 0 rgba(0,0,0,0.4)'}}>Could Europe win<br /><span style={{color: RED}}>WITHOUT</span><br />the US?</div>
        <div style={{marginTop: 34, transform: `scale(${popT(ts, d.end + 0.5, 12)})`, background: YELLOW, border: `7px solid ${INK}`, borderRadius: 26, padding: '10px 34px 2px', ...font, fontSize: 60, color: INK}}>Tell us in the comments!</div>
      </AbsoluteFill>
    );
  }
  const bounce = Math.sin((ts - d.end) * 8) * 10;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 16, background: `rgba(8,18,32,${0.45 * k})`}}>
      <div style={{transform: `scale(${k}) rotate(-2deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
        <div style={{background: YELLOW, border: `7px solid ${INK}`, borderRadius: 22, padding: '6px 30px 0', ...font, fontSize: 62, color: INK, boxShadow: '0 8px 0 rgba(0,0,0,0.4)'}}>NEXT · PART {d.part + 1}/6</div>
        <div style={{background: '#fff', border: `11px solid ${INK}`, borderRadius: 34, padding: '20px 40px 8px', ...font, fontSize: 104, color: BLUE, textAlign: 'center', lineHeight: 1, maxWidth: 980, boxShadow: '0 14px 0 rgba(0,0,0,0.4)'}}>{d.next}</div>
        <div style={{transform: `translateX(${bounce}px)`, ...font, fontSize: 120, color: '#fff', textShadow: `6px 6px 0 ${INK}`}}>➜</div>
      </div>
    </AbsoluteFill>
  );
};
const ResultsV: React.FC<{t: number}> = ({t}) => {
  if (t < 469) return null;
  const k = popT(t, 469, 12);
  const rows: [string, string, string, string][] = [
    ['ru', 'Russia & allies lost', '228,000', '#c0221d'], ['eu', 'Europe lost', '175,000', '#1557c0'], ['lt', 'Baltic states', 'FREE', GREEN], ['ru', 'Kaliningrad', 'EUROPEAN', BLUE],
  ];
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 560, transform: `scale(${k})`, zIndex: 11}}>
      <div style={{position: 'absolute', top: -40, left: 30, background: YELLOW, border: `6px solid ${INK}`, borderRadius: 18, padding: '4px 24px 0', ...font, fontSize: 52, color: INK, transform: 'rotate(-3deg)', zIndex: 2}}>WAR OVER · 76 DAYS</div>
      <div style={{background: CREAM, border: `8px solid ${INK}`, borderRadius: 30, padding: '50px 30px 22px', boxShadow: '0 12px 0 rgba(0,0,0,0.35)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14}}><MiniFlag code="eu" w={84} h={56} /><div style={{...font, fontSize: 84, color: '#1557c0'}}>EUROPE WINS</div></div>
        {rows.map(([c, l, v, col], i) => (
          <div key={l} style={{display: 'flex', alignItems: 'center', gap: 16, height: 84, borderTop: '4px solid #e2d3b1', opacity: lerp(t, 469.6 + i * 0.5, 470 + i * 0.5, 0, 1)}}>
            <MiniFlag code={c} w={60} h={40} /><div style={{...font2, fontSize: 38, color: INK, flex: 1}}>{l}</div><div style={{...font, fontSize: 52, color: col}}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ShortV: React.FC<{part: number}> = ({part}) => {
  const d = SHORT_DEFS[part - 1];
  const ts = useCurrentFrame() / 30;
  const t = mapTime(ts, d.map);
  const cam = camV(t);
  const hook = ts < 1.6, ending = ts >= d.end;
  return (
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <OceanV t={t} />
      <EuropeMap t={t} cam={cam} vp={VPV} />
      <AbsoluteFill style={{background: 'linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0) 14%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.3))'}} />
      <MapLabelsV t={t} cam={cam} />
      {!hook && !ending && <BubblesV t={t} cam={cam} />}
      {!ending && <HudV t={t} />}
      <BannerV t={t} ts={ts} m={d.map} hide={hook || ending} />
      <StampV ts={ts} m={d.map} hide={hook || ending} />
      {part === 6 && <ResultsV t={t} />}
      <HeaderV t={t} part={part} />
      <HookV ts={ts} text={d.hook} />
      <EndV ts={ts} d={d} />
      <Audio src={staticFile(`short${part}.wav`)} />
    </AbsoluteFill>
  );
};
