import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import map from './mapdata.json';
import eurasia from './eurasia.json';
import TL from './timeline3.json';
import CITIES from './cities3.json';
import {Flag, FLAG_OF} from './flags';
import {
  P, Cam, INK, CREAM, RED, BLUE, GREEN, YELLOW, ORANGE, PURPLE, clamp, ease, lerp, fmt, font, font2, toScreen, popT, piece,
  smoothPath, arcPath, partial, PathArrow, TankToken, Mover, Boom, Face, Mood, MiniFlag, Avatar, Bubble,
} from './lib3';

// ================= datos =================
const CT = CITIES as Record<string, P>;
const byName: Record<string, (typeof map.countries)[number]> = Object.fromEntries(map.countries.map((c) => [c.name, c]));
type Capture = {country: string; city: string; t: number; r: number; kind: 'occ' | 'lib'; p: P};
const CAPS: Capture[] = (TL.captures as any[]).map(([country, city, t, r, kind]) => ({country, city, t, r, kind, p: CT[city]}));
const FILL = TL.fill as Record<string, number[]>;
const KM2: Record<string, number> = {Estonia: 45339, Latvia: 64589, Lithuania: 65300};
const BALTIC_KM2 = 45339 + 64589 + 65300;
const BALTS = ['Estonia', 'Latvia', 'Lithuania'];
const MAJOR = new Set(['Tallinn', 'Tartu', 'Narva', 'Parnu', 'Riga', 'Daugavpils', 'Liepaja', 'Valmiera', 'Vilnius', 'Kaunas', 'Klaipeda', 'Siauliai', 'Suwalki', 'Kaliningrad', 'Kuressaare']);
const CITY_NAME: Record<string, string> = {
  Narva: 'Narva', Johvi: 'Jõhvi', Rakvere: 'Rakvere', Tartu: 'Tartu', Voru: 'Võru', Paide: 'Paide', Parnu: 'Pärnu', Tallinn: 'Tallinn',
  Haapsalu: 'Haapsalu', Hiiumaa: 'Hiiumaa', Kuressaare: 'Kuressaare', Rezekne: 'Rēzekne', Daugavpils: 'Daugavpils', Gulbene: 'Gulbene',
  Jekabpils: 'Jēkabpils', Valmiera: 'Valmiera', Riga: 'Riga', Jelgava: 'Jelgava', Kuldiga: 'Kuldīga', Ventspils: 'Ventspils', Liepaja: 'Liepāja',
  Talsi: 'Talsi', Vilnius: 'Vilnius', Utena: 'Utena', Alytus: 'Alytus', Kaunas: 'Kaunas', Panevezys: 'Panevėžys', Marijampole: 'Marijampolė',
  Siauliai: 'Šiauliai', Taurage: 'Tauragė', Klaipeda: 'Klaipėda', Telsiai: 'Telšiai', Suwalki: 'Suwałki', Augustow: 'Augustów', Elk: 'Ełk',
  Kaliningrad: 'Kaliningrad', Chernyakhovsk: 'Chernyakhovsk', Sovetsk: 'Sovetsk', Baltiysk: 'Baltiysk', Gusev: 'Gusev',
};
const NAMES: Record<string, string> = {
  Russia: 'RUSSIA', Belarus: 'BELARUS', Poland: 'POLAND', Lithuania: 'LITHUANIA', Latvia: 'LATVIA', Estonia: 'ESTONIA', Finland: 'FINLAND',
  Sweden: 'SWEDEN', Germany: 'GERMANY', France: 'FRANCE', Spain: 'SPAIN', 'United Kingdom': 'UK', Italy: 'ITALY', Kaliningrad: 'KALININGRAD',
};

// ================= tiempo de historia (gancho inicial) =================
const storyTime = (sec: number) => {
  for (const [a, b, src] of TL.coldOpen as number[][]) if (sec >= a && sec < b) return src + (sec - a);
  return sec;
};

// ================= cámara (segundos de historia) =================
const CAM: [number, number, number, number][] = [
  [6, 980, 540, 1.0], [12, 990, 530, 1.08], [59, 980, 545, 1.12], [63, 985, 540, 1.15], [77, 985, 540, 1.18],
  [79, 1186, 612, 2.0], [81.8, 1186, 612, 2.05], [83, 1050, 615, 1.9], [85.8, 1050, 615, 1.95], [87, 885, 700, 1.7], [89.8, 885, 700, 1.75],
  [91, 862, 560, 1.8], [93.8, 862, 560, 1.85], [95, 1292, 265, 1.8], [97.8, 1292, 265, 1.85], [99.5, 990, 540, 1.15], [106, 1000, 530, 1.2],
  [109, 1030, 470, 1.9], [118, 1035, 470, 2.0], [120, 1065, 482, 2.2], [124, 1065, 482, 2.3],
  [126.5, 1053, 553, 4.4], [144, 1053, 553, 4.6], [146.5, 1076, 406, 5.0], [174, 1070, 406, 5.15],
  [176.5, 1066, 466, 4.4], [204, 1062, 466, 4.55], [206.5, 1058, 516, 4.6], [233, 1055, 516, 4.75],
  [237, 1000, 520, 1.5], [239, 930, 600, 1.05], [260, 935, 598, 1.08], [262.5, 1080, 480, 1.9], [274, 1080, 480, 1.95],
  [277, 1058, 575, 3.0], [289, 1058, 575, 3.1], [291.5, 1125, 315, 2.1], [299, 1125, 315, 2.15], [301.5, 930, 650, 1.0], [311, 935, 645, 1.03],
  [313.5, 1040, 492, 2.3], [320, 1040, 492, 2.35], [322.5, 995, 508, 2.6], [330, 995, 508, 2.65],
  [335, 1016, 537, 4.6], [358, 1016, 537, 4.8], [361.5, 1058, 516, 4.6], [388, 1058, 516, 4.75], [392, 1055, 440, 2.8], [423, 1060, 440, 2.95],
  [427, 1110, 470, 2.0], [444, 1110, 470, 2.05], [449, 1000, 515, 1.3], [540, 1000, 515, 1.25],
];
const SHAKES: [number, number][] = [
  ...(TL.booms as number[]).map((b) => [b, 9] as [number, number]),
  ...CAPS.map((c) => [c.t, 3] as [number, number]),
  ...(TL.extraExplosions as number[][]).map((e) => [e[0], 3] as [number, number]),
  ...(TL.stamps as any[]).map((s) => [s.t, 6] as [number, number]),
];
const camera = (t: number): Cam => {
  let i = 0;
  while (i < CAM.length - 2 && t > CAM[i + 1][0]) i++;
  const [ta, xa, ya, sa] = CAM[i], [tb, xb, yb, sb] = CAM[i + 1];
  const k = lerp(t, ta, tb, 0, 1, ease);
  let cx = xa + (xb - xa) * k, cy = ya + (yb - ya) * k;
  const s = sa * Math.pow(sb / sa, k);
  for (const [h, amp] of SHAKES) {
    const d = t - h;
    if (d >= 0 && d < 0.4) { const a = ((1 - d / 0.4) * amp) / s; cx += Math.sin(d * 93) * a; cy += Math.cos(d * 69) * a; }
  }
  return {cx, cy, s};
};

// ================= estado de la guerra =================
const firstT = (country: string, kind: 'occ' | 'lib') => Math.min(...CAPS.filter((c) => c.country === country && c.kind === kind).map((c) => c.t));
type Status = 'free' | 'attack' | 'occupied' | 'fighting' | 'liberated';
const statusOf = (country: string, t: number): Status => {
  const f = FILL[country];
  if (t < firstT(country, 'occ') - 1.5) return 'free';
  if (t < f[1]) return 'attack';
  if (t < firstT(country, 'lib') - 1.5) return 'occupied';
  if (t < f[3]) return 'fighting';
  return 'liberated';
};
const kalStatus = (t: number) => (t < firstT('Kaliningrad', 'lib') - 1.5 ? 'russian' : t < FILL.Kaliningrad[3] ? 'fighting' : 'allied');
const STATUS_LOOK: Record<string, [string, string]> = {
  free: ['FREE', '#8a8a8a'], attack: ['UNDER ATTACK', ORANGE], occupied: ['OCCUPIED', RED], fighting: ['FIGHTING', ORANGE], liberated: ['LIBERATED', GREEN],
  russian: ['RUSSIAN', '#8a8a8a'], allied: ['ALLIED CONTROL', BLUE],
};
const growK = (t: number, ct: number) => lerp(t, ct - 1.0, ct + 0.6, 0, 1, Easing.out(Easing.cubic));
const fracOf = (country: string, kind: 'occ' | 'lib', t: number) => {
  const list = CAPS.filter((c) => c.country === country && c.kind === kind);
  const f = FILL[country];
  const w = kind === 'occ' ? [f[0], f[1]] : [f[2], f[3]];
  const fill = w[1] > 0 ? lerp(t, w[0], w[1], 0, 1) : 0;
  const done = list.reduce((s, c) => s + growK(t, c.t), 0);
  return Math.min(1, (done / (list.length + 1)) + fill / (list.length + 1));
};
const occupiedKm2 = (t: number) => BALTS.reduce((s, c) => s + KM2[c] * fracOf(c, 'occ', t) * (1 - fracOf(c, 'lib', t)), 0);
const DAYS: [number, number][] = [[125, 1], [145, 2], [175, 4], [205, 7], [235, 10], [250, 12], [278, 15], [290, 20], [300, 25], [312, 33], [321, 38], [333, 45], [360, 55], [390, 62], [425, 80]];
const warDay = (t: number) => (t < 125 ? 0 : piece(t, DAYS));
const casualties = (dd: number) => {
  const seg = (r1: number, r2: number, r3: number) => (dd <= 12 ? r1 * dd : dd <= 45 ? r1 * 12 + r2 * (dd - 12) : r1 * 12 + r2 * 33 + r3 * (dd - 45));
  return {ru: seg(2500, 2250, 3500), eu: seg(3500, 2250, 1750)};
};
const equipment = (t: number) => {
  const dd = warDay(t);
  const seg = (r1: number, r2: number, r3: number) => (dd <= 12 ? r1 * dd : dd <= 45 ? r1 * 12 + r2 * (dd - 12) : r1 * 12 + r2 * 33 + r3 * (dd - 45));
  const air = lerp(t, 312.5, 320, 0, 1), sea = lerp(t, 321.5, 329, 0, 1);
  return {
    ru: {tanks: seg(22, 12, 20), planes: dd * 2.5 + air * 60, ships: Math.min(2, dd * 0.2) + sea * 11 + lerp(t, 333, 425, 0, 1)},
    eu: {tanks: seg(18, 8, 6), planes: dd * 1.5 + air * 25, ships: Math.min(1, dd * 0.1) + sea * 3 + lerp(t, 333, 425, 0, 1)},
  };
};
const POWER: [number, number][] = [[98, 0], [125, 0], [145, -0.2], [175, -0.45], [205, -0.6], [235, -0.75], [275, -0.8], [290, -0.55], [300, -0.45], [312, -0.3], [321, -0.05], [333, 0.15], [360, 0.4], [390, 0.6], [425, 0.8], [445, 0.85]];

// ================= rutas, unidades y combates =================
const R = (...names: string[]) => smoothPath(names.map((n) => CT[n]));
type Route = {pts: P[]; t0: number; t1: number; color: string; code: string; kind?: 'tank' | 'ship'};
const ROUTES: Route[] = [
  {pts: R('Grodno', 'Augustow', 'Suwalki'), t0: 128, t1: 133.5, color: RED, code: 'by'},
  {pts: R('Gusev', 'Suwalki'), t0: 129, t1: 133, color: RED, code: 'ru'},
  {pts: R('Ivangorod', 'Narva', 'Johvi', 'Rakvere', 'Tallinn'), t0: 144.5, t1: 166, color: RED, code: 'ru'},
  {pts: R('Pskov', 'Voru', 'Tartu', 'Paide', 'Parnu'), t0: 148, t1: 163, color: RED, code: 'ru'},
  {pts: R('Tallinn', 'Haapsalu', 'Hiiumaa', 'Kuressaare'), t0: 166.5, t1: 171, color: RED, code: 'ru'},
  {pts: R('Velikiye', 'Rezekne', 'Jekabpils', 'Riga'), t0: 174.5, t1: 191, color: RED, code: 'ru'},
  {pts: R('Polotsk', 'Daugavpils', 'Jelgava', 'Kuldiga', 'Liepaja'), t0: 176, t1: 201.5, color: RED, code: 'by'},
  {pts: R('Pskov', 'Gulbene', 'Valmiera'), t0: 177.5, t1: 186, color: RED, code: 'ru'},
  {pts: R('Riga', 'Talsi', 'Ventspils'), t0: 191.5, t1: 200, color: RED, code: 'ru'},
  {pts: R('Lida', 'Vilnius', 'Kaunas', 'Taurage', 'Klaipeda'), t0: 205, t1: 229, color: RED, code: 'by'},
  {pts: R('Grodno', 'Alytus', 'Marijampole'), t0: 208, t1: 213, color: RED, code: 'by'},
  {pts: R('Daugavpils', 'Utena', 'Panevezys', 'Siauliai', 'Telsiai'), t0: 208, t1: 226, color: RED, code: 'ru'},
  {pts: R('Sovetsk', 'Taurage'), t0: 221, t1: 224, color: RED, code: 'ru'},
  // liberación
  {pts: R('Elk', 'Augustow', 'Suwalki'), t0: 334, t1: 338, color: BLUE, code: 'pl'},
  {pts: R('Gdansk', 'Baltiysk', 'Kaliningrad'), t0: 337, t1: 345, color: BLUE, code: 'pl'},
  {pts: R('Elk', 'Gusev', 'Chernyakhovsk', 'Sovetsk'), t0: 345, t1: 351, color: BLUE, code: 'de'},
  {pts: R('Suwalki', 'Marijampole', 'Kaunas', 'Vilnius', 'Utena'), t0: 360, t1: 383, color: BLUE, code: 'pl'},
  {pts: R('Augustow', 'Alytus'), t0: 361, t1: 364, color: BLUE, code: 'de'},
  {pts: R('Sovetsk', 'Taurage', 'Klaipeda'), t0: 371, t1: 378, color: BLUE, code: 'de'},
  {pts: R('Kaunas', 'Siauliai', 'Telsiai'), t0: 368, t1: 379.5, color: BLUE, code: 'fr'},
  {pts: R('Kaunas', 'Panevezys'), t0: 375, t1: 381, color: BLUE, code: 'gb'},
  {pts: arcPath(CT.Gotland, CT.Liepaja, -10), t0: 388, t1: 391, color: BLUE, code: 'se', kind: 'ship'},
  {pts: arcPath(CT.Gotland, CT.Ventspils, 8), t0: 389, t1: 392.5, color: BLUE, code: 'se', kind: 'ship'},
  {pts: arcPath(CT.Stockholm, CT.Kuressaare, 12), t0: 388.5, t1: 393, color: BLUE, code: 'se', kind: 'ship'},
  {pts: arcPath(CT.Helsinki, CT.Tallinn, 6), t0: 396.5, t1: 400, color: BLUE, code: 'fi', kind: 'ship'},
  {pts: R('Liepaja', 'Kuldiga', 'Talsi'), t0: 391, t1: 396, color: BLUE, code: 'se'},
  {pts: R('Siauliai', 'Jelgava', 'Riga', 'Valmiera'), t0: 394, t1: 404, color: BLUE, code: 'pl'},
  {pts: R('Panevezys', 'Jekabpils', 'Daugavpils', 'Rezekne'), t0: 398, t1: 410, color: BLUE, code: 'de'},
  {pts: R('Tallinn', 'Rakvere', 'Johvi', 'Narva'), t0: 400, t1: 414.5, color: BLUE, code: 'fi'},
  {pts: R('Parnu', 'Paide', 'Tartu', 'Voru'), t0: 401, t1: 412.5, color: BLUE, code: 'gb'},
];
type Flight = {pts: P[]; t0: number; t1: number; kind: 'plane' | 'missile' | 'ship'; code?: string; color?: string; hold?: number; sinkAt?: number};
const FLIGHTS: Flight[] = [
  {pts: arcPath(CT.Chernyakhovsk, [1048, 551], 14), t0: 127.8, t1: 129.0, kind: 'missile'},
  {pts: arcPath(CT.Grodno, [1040, 548], -12), t0: 128.8, t1: 130.0, kind: 'missile'},
  {pts: arcPath(CT.Lida, [1060, 563], 10), t0: 130.4, t1: 131.5, kind: 'missile'},
  // batalla aérea
  {pts: arcPath([1150, 430], [1040, 500], 20), t0: 312.5, t1: 314.5, kind: 'plane', color: RED, hold: 0},
  {pts: arcPath([1160, 500], [1070, 480], -18), t0: 313.6, t1: 316.0, kind: 'plane', color: RED, hold: 0},
  {pts: arcPath([1130, 400], [1020, 470], 22), t0: 315.0, t1: 317.6, kind: 'plane', color: RED, hold: 0},
  {pts: arcPath([1150, 545], [1055, 510], -20), t0: 316.5, t1: 319.0, kind: 'plane', color: RED, hold: 0},
  {pts: arcPath([950, 560], [1100, 470], -30), t0: 312.6, t1: 316.0, kind: 'plane', color: BLUE, hold: 0},
  {pts: arcPath([980, 605], [1110, 500], 25), t0: 313.8, t1: 317.4, kind: 'plane', color: BLUE, hold: 0},
  {pts: arcPath([940, 500], [1095, 440], -25), t0: 315.2, t1: 318.6, kind: 'plane', color: BLUE, hold: 0},
  {pts: arcPath([990, 585], [1125, 520], 30), t0: 316.4, t1: 320.0, kind: 'plane', color: BLUE, hold: 0},
  // batalla naval
  {pts: arcPath([993, 536], [1000, 505], 6), t0: 321.6, t1: 323.5, kind: 'ship', code: 'ru', hold: 0.8, sinkAt: 323.5},
  {pts: arcPath([985, 540], [985, 520], -4), t0: 322.0, t1: 325.0, kind: 'ship', code: 'ru', hold: 0.8, sinkAt: 325.0},
  {pts: arcPath([1003, 462], [1012, 490], 6), t0: 323.5, t1: 326.5, kind: 'ship', code: 'ru', hold: 0.8, sinkAt: 326.5},
  {pts: arcPath([1000, 546], [995, 528], 4), t0: 325.0, t1: 328.0, kind: 'ship', code: 'ru', hold: 0.8, sinkAt: 328.0},
  {pts: arcPath(CT.Gotland, [988, 488], 8), t0: 321.5, t1: 324.8, kind: 'ship', code: 'se', hold: 6},
  {pts: arcPath(CT.Gdansk, [975, 527], -6), t0: 321.8, t1: 324.4, kind: 'ship', code: 'pl', hold: 6},
  {pts: arcPath([900, 520], [962, 515], 6), t0: 321.5, t1: 326.0, kind: 'ship', code: 'de', hold: 5},
  {pts: arcPath([986, 490], [1000, 505], -8), t0: 322.6, t1: 323.5, kind: 'missile'},
  {pts: arcPath([975, 527], [985, 520], -6), t0: 324.2, t1: 325.0, kind: 'missile'},
  {pts: arcPath([990, 490], [1012, 490], -10), t0: 325.6, t1: 326.5, kind: 'missile'},
  {pts: arcPath([962, 515], [995, 528], 8), t0: 327.0, t1: 328.0, kind: 'missile'},
];
// fichas estáticas por escena: [x, y, bandera, aparece, desaparece]
const TOKENS: [number, number, string, number, number][] = [
  [1150, 392, 'ru', 118.5, 127], [1155, 445, 'ru', 119.2, 127], [1165, 500, 'ru', 119.9, 127], [1112, 566, 'by', 120.6, 127], [1092, 578, 'by', 121.3, 127],
  [1030, 530, 'ru', 122, 127], [1188, 470, 'kp', 122.7, 127],
  [1045, 562, 'pl', 278.5, 291], [1052, 592, 'pl', 279, 291], [1062, 620, 'pl', 279.5, 291], [1080, 562, 'by', 278.5, 291], [1092, 598, 'by', 279, 291], [1028, 532, 'ru', 279.5, 291],
  [1093, 352, 'fi', 291, 301], [1108, 330, 'fi', 291.6, 301], [1124, 290, 'fi', 292.2, 301], [1140, 240, 'fi', 292.8, 301],
  [1150, 362, 'ru', 291.4, 301], [1160, 320, 'ru', 292, 301], [1190, 292, 'ru', 292.6, 301], [1175, 245, 'ru', 293.2, 301],
];
const REINF: [string, string, number][] = [['es', 'Madrid', 0], ['fr', 'Paris', 0.4], ['it', 'Rome', 0.8], ['gb', 'London', 0.2], ['de', 'Berlin', 0.6], ['nl', 'Amsterdam', 1.0]];
const REINF_TO: P[] = [[985, 615], [1005, 595], [995, 640], [965, 582], [1020, 578], [960, 600]];
const CABLES: [P, P, number][] = [[CT.Helsinki, CT.Tallinn, 110.5], [CT.Stockholm, CT.Klaipeda, 111.5], [CT.Helsinki, CT.Kiel, 112.5]];
const DRONES: [string, number][] = [['Vilnius', 115.5], ['Riga', 116.2], ['Helsinki', 116.9], ['Warsaw', 117.6]];

// ================= caras y bocadillos =================
const FACES: {name: string; p: P; r: number; seed: number}[] = [
  {name: 'Russia', p: [1215, 425], r: 30, seed: 1}, {name: 'Belarus', p: [1140, 548], r: 16, seed: 2}, {name: 'Poland', p: [986, 600], r: 20, seed: 3},
  {name: 'Lithuania', p: [1066, 508], r: 10, seed: 4}, {name: 'Latvia', p: [1077, 457], r: 10, seed: 5}, {name: 'Estonia', p: [1084, 401], r: 9, seed: 6},
  {name: 'Finland', p: [1075, 300], r: 16, seed: 7}, {name: 'Sweden', p: [935, 330], r: 14, seed: 8}, {name: 'Germany', p: byName.Germany.c as P, r: 18, seed: 9},
  {name: 'France', p: byName.France.c as P, r: 20, seed: 10}, {name: 'Spain', p: byName.Spain.c as P, r: 20, seed: 11},
  {name: 'United Kingdom', p: [700, 560], r: 14, seed: 12}, {name: 'Italy', p: [880, 800], r: 15, seed: 13},
];
const BUBBLES: [number, number, string, string][] = [
  [33, 37, 'av-ru', 'Gentlemen, it is time. We take the Baltics.'],
  [37.5, 41.5, 'av-by', 'My land is yours. We strike from the south.'],
  [42, 46, 'av-kp', "I'll send soldiers. And LOTS of shells."],
  [46.5, 50.5, 'av-ru', 'Phase one: cut the Suwałki Gap.'],
  [112.5, 116, 'Finland', 'Who cut our cables?!'],
  [119, 123, 'Russia', 'It wasn’t me.'],
  [141, 145, 'Poland', 'Hey! That is MY land!'],
  [150, 154, 'Estonia', 'HELP!'],
  [166.5, 170.5, 'Russia', 'Tallinn is mine.'],
  [181, 185, 'Latvia', 'They are everywhere!'],
  [210, 214, 'Lithuania', 'NATO, where are you?!'],
  [240, 244, 'Germany', 'We need a plan!'],
  [244.5, 248.5, 'France', 'Everybody, calm down!'],
  [249, 253, 'Poland', 'WE NEED TANKS. NOW!'],
  [253.5, 257.5, 'Spain', 'Wait... what did I miss?'],
  [265, 269.5, 'Russia', 'Nobody is coming.'],
  [280, 284, 'Poland', 'Not one step further!'],
  [293, 297, 'Finland', 'Try me.'],
  [303, 307, 'Spain', 'Spain is on its way!'],
  [305.5, 309.5, 'Italy', 'Italy too!'],
  [308, 311.5, 'United Kingdom', 'Right behind you.'],
  [336, 340, 'Poland', 'Our turn now.'],
  [372, 376, 'Lithuania', 'We are FREE!'],
  [401, 405, 'Estonia', 'Thank you, Finland!'],
  [428, 433, 'Russia', 'Okay... okay. Ceasefire.'],
];
const talkingNow = (who: string, t: number) => BUBBLES.some(([a, b, w]) => w === who && t >= a + 0.2 && t < b - 0.4);
const moodOf = (name: string, t: number): {mood: Mood; look?: P} => {
  if (BALTS.includes(name)) {
    const st = statusOf(name, t);
    if (st === 'liberated' || (st === 'fighting' && t > firstT(name, 'lib') + 3)) return {mood: 'happy'};
    if (t < 108) return {mood: 'calm'};
    if (t < 125) return {mood: 'scared', look: [0.8, 0]};
    return {mood: st === 'free' ? 'scared' : st === 'occupied' ? 'sad' : 'scared', look: [0.8, 0]};
  }
  switch (name) {
    case 'Russia': return t < 125 ? {mood: 'smug', look: [-1, 0]} : t < 236 ? {mood: 'angry', look: [-1, 0.2]} : t < 275 ? {mood: 'smug', look: [-1, 0]} : t < 333 ? {mood: 'angry', look: [-1, 0]} : t < 425 ? {mood: 'scared', look: [-1, 0]} : {mood: 'sad', look: [0, 0.5]};
    case 'Belarus': return t < 125 ? {mood: 'calm'} : t < 333 ? {mood: 'angry', look: [-1, -0.2]} : {mood: 'scared', look: [-1, 0]};
    case 'Poland': return t < 125 ? {mood: 'calm'} : t < 133 ? {mood: 'shocked', look: [1, -0.5]} : {mood: t > 425 ? 'happy' : 'angry', look: [1, -0.6]};
    case 'Finland': return t < 110 ? {mood: 'calm', look: [0.3, 0.8]} : t < 118 ? {mood: 'shocked', look: [0, 0.8]} : t < 425 ? {mood: 'angry', look: [0.2, 0.8]} : {mood: 'happy'};
    default: return t < 236 ? {mood: 'calm'} : t < 262 ? {mood: 'shocked', look: [1, 0]} : t < 425 ? {mood: 'angry', look: [1, -0.3]} : {mood: 'happy'};
  }
};

// ================= mapa de Europa =================
type Country = (typeof map.countries)[number];
const pid = (n: string) => n.replace(/\W/g, '');
const FlagPattern: React.FC<{id: string; code: string; box: number[]}> = ({id, code, box}) => {
  const [x0, y0, x1, y1] = box;
  return <pattern id={id} patternUnits="userSpaceOnUse" x={x0} y={y0} width={x1 - x0} height={y1 - y0}><Flag code={code} w={x1 - x0} h={y1 - y0} /></pattern>;
};
// caja de bandera "sin deformar": misma proporción 3:2 centrada en el país
const fitBox = (c: Country) => {
  if (c.name === 'Russia') return [1110, 160, 1900, 760];
  const [x0, y0, x1, y1] = c.bbox, w = x1 - x0, h = y1 - y0, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const tall = h > w * 1.4;
  if (!tall) return c.bbox;
  const W2 = h * 0.9; return [cx - W2 / 2, y0, cx + W2 / 2, y1];
};
const faceR = (r: number, s: number) => Math.min(r, 62 / s);
const KEY = new Set(['Estonia', 'Latvia', 'Lithuania', 'Poland', 'Belarus', 'Russia', 'Kaliningrad', 'Finland']);
const BIG = {x: -600, y: -600, width: 3120, height: 2280};

const EuropeMap: React.FC<{t: number; cam: Cam; pre: string; lite?: boolean; extra?: React.ReactNode}> = ({t, cam, pre, lite, extra}) => {
  const units = !lite;
  const {cx, cy, s} = cam;
  const inv = 1 / s;
  const tf = `translate(960,540) scale(${s}) translate(${-cx},${-cy})`;
  const pulse = 0.5 + 0.5 * Math.sin(t * 6);
  const circlesFor = (country: string, kind: 'occ' | 'lib', fill: string) => {
    const out: React.ReactNode[] = [];
    CAPS.filter((c) => c.country === country && c.kind === kind).forEach((c, i) => {
      const k = growK(t, c.t);
      if (k <= 0) return;
      for (let j = 0; j < 3; j++) {
        const a = i * 2.1 + j * 2.09;
        out.push(<circle key={`${kind}${i}-${j}`} cx={c.p[0] + Math.cos(a) * c.r * 0.22} cy={c.p[1] + Math.sin(a) * c.r * 0.22} r={c.r * k * (0.95 - j * 0.07)} fill={fill} />);
      }
    });
    const f = FILL[country];
    const win = kind === 'occ' ? [f[0], f[1]] : [f[2], f[3]];
    const fk = win[1] > 0 ? lerp(t, win[0], win[1], 0, 1) : 0;
    if (fk > 0 && byName[country]) {
      const b = byName[country].bbox;
      out.push(<circle key={`${kind}-fill`} cx={(b[0] + b[2]) / 2} cy={(b[1] + b[3]) / 2} r={Math.hypot(b[2] - b[0], b[3] - b[1]) * 0.62 * fk} fill={fill} />);
    }
    return out;
  };
  const statusStroke = (name: string) => {
    if (BALTS.includes(name)) {
      const st = statusOf(name, t);
      if (st === 'attack') return [RED, 5 + pulse * 4, 1];
      if (st === 'occupied') return [RED, 4.5, 0.9];
      if (st === 'fighting') return [BLUE, 5 + pulse * 4, 1];
      if (st === 'liberated' && t < FILL[name][3] + 4) return [GREEN, 6, lerp(t, FILL[name][3] + 2.6, FILL[name][3] + 4, 1, 0)];
      return null;
    }
    if (name === 'Kaliningrad') {
      const st = kalStatus(t);
      if (st === 'fighting') return [BLUE, 5 + pulse * 4, 1];
      if (st === 'allied' && t < FILL.Kaliningrad[3] + 4) return [GREEN, 6, lerp(t, FILL.Kaliningrad[3] + 2.6, FILL.Kaliningrad[3] + 4, 1, 0)];
    }
    return null;
  };
  // ciudades visibles: las del país en combate
  const activeCountries = new Set<string>();
  BALTS.forEach((c) => { const st = statusOf(c, t); if (st === 'attack' || st === 'fighting') activeCountries.add(c); });
  if ((t > 127 && t < 145) || (t > 333 && t < 341)) activeCountries.add('Poland');
  if (kalStatus(t) === 'fighting') activeCountries.add('Kaliningrad');
  const cityList = Array.from(new Map(CAPS.filter((c) => activeCountries.has(c.country)).map((c) => [c.city, c])).values());

  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        {map.countries.map((c) => (FLAG_OF[c.name] ? <FlagPattern key={c.name} id={`${pre}fl-${pid(c.name)}`} code={FLAG_OF[c.name]} box={fitBox(c)} /> : null))}
        {[...BALTS, 'Poland'].map((n) => <FlagPattern key={n} id={`${pre}occ-${n}`} code="ru" box={n === 'Poland' ? [1020, 530, 1075, 570] : byName[n].bbox} />)}
        <pattern id={`${pre}hatch`} patternUnits="userSpaceOnUse" width={7} height={7} patternTransform="rotate(45)">
          <rect width={7} height={7} fill="rgba(150,0,0,0.18)" /><rect width={2.6} height={7} fill="rgba(120,0,0,0.55)" />
        </pattern>
        <pattern id={`${pre}hatchB`} patternUnits="userSpaceOnUse" width={7} height={7} patternTransform="rotate(-45)">
          <rect width={7} height={7} fill="#2b6fd6" /><rect width={2.4} height={7} fill="rgba(255,255,255,0.35)" />
        </pattern>
        <clipPath id={`${pre}land`}>{map.countries.map((c) => <path key={c.name} d={c.d} />)}</clipPath>
        {[...BALTS, 'Poland', 'Kaliningrad'].map((n) => (
          <mask key={n} id={`${pre}m-${n}`} maskUnits="userSpaceOnUse" {...BIG}>
            <rect {...BIG} fill="black" />
            {n === 'Kaliningrad' ? circlesFor(n, 'lib', 'white') : <>{circlesFor(n, 'occ', 'white')}{circlesFor(n, 'lib', 'black')}</>}
          </mask>
        ))}
      </defs>
      <g transform={tf}>
        <g transform="translate(2.5,3.5)" opacity={0.3}>{map.countries.map((c) => <path key={c.name} d={c.d} fill="#06213f" />)}</g>
        {map.countries.map((c) => <path key={c.name} d={c.d} fill={FLAG_OF[c.name] ? `url(#${pre}fl-${pid(c.name)})` : '#efe3c8'} />)}
        {[...BALTS, 'Poland'].map((n) => (
          <g key={n} mask={`url(#${pre}m-${n})`}>
            <path d={byName[n].d} fill={`url(#${pre}occ-${n})`} />
            <path d={byName[n].d} fill={`url(#${pre}hatch)`} />
          </g>
        ))}
        <g mask={`url(#${pre}m-Kaliningrad)`}><path d={byName.Kaliningrad.d} fill={`url(#${pre}hatchB)`} /></g>
        {!lite && <image href={staticFile('relief.png')} {...BIG} preserveAspectRatio="none" clipPath={`url(#${pre}land)`} opacity={0.32} />}
        {map.countries.map((c) => <path key={c.name} d={c.d} fill="none" stroke={INK} strokeOpacity={KEY.has(c.name) ? 0.95 : 0.75} strokeWidth={KEY.has(c.name) ? 3.2 : 2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />)}
        {[...BALTS, 'Kaliningrad'].map((n) => {
          const st = statusStroke(n);
          if (!st) return null;
          return <path key={n} d={byName[n].d} fill="none" stroke={st[0] as string} strokeOpacity={st[2] as number} strokeWidth={st[1] as number} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />;
        })}
        {/* guerra híbrida: cables y drones */}
        {t > 107 && t < 126 && CABLES.map(([a, b, cut], i) => {
          const al = lerp(t, 107.5 + i * 0.3, 108.5 + i * 0.3, 0, 1) * lerp(t, 124, 126, 1, 0);
          const broken = t >= cut;
          const m: P = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
          const fl = broken ? lerp(t, cut, cut + 0.5, 1, 0) : 0;
          return (
            <g key={i} opacity={al}>
              <path d={`M${a[0]},${a[1]} L${b[0]},${b[1]}`} stroke={broken ? RED : YELLOW} strokeWidth={4} strokeDasharray={broken ? '4 14' : '10 6'} vectorEffect="non-scaling-stroke" />
              {broken && <g transform={`translate(${m[0]},${m[1]}) scale(${inv * (1 + fl)})`}><circle r={20} fill={RED} stroke={INK} strokeWidth={4} /><path d="M-8,-8 L8,8 M8,-8 L-8,8" stroke="#fff" strokeWidth={5} strokeLinecap="round" /></g>}
            </g>
          );
        })}
        {t > 115 && t < 124 && DRONES.map(([city, t0], i) => {
          if (t < t0) return null;
          const c = CT[city], a = (t - t0) * 2.4 + i, al = lerp(t, t0, t0 + 0.4, 0, 1) * lerp(t, 123, 124, 1, 0);
          const p: P = [c[0] + Math.cos(a) * 9, c[1] + Math.sin(a) * 6];
          return (
            <g key={city} opacity={al}>
              <circle cx={c[0]} cy={c[1]} r={10} fill="none" stroke={RED} strokeWidth={2.5} strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
              <g transform={`translate(${p[0]},${p[1]}) scale(${inv})`}>
                <path d="M-14,-14 L14,14 M14,-14 L-14,14" stroke={INK} strokeWidth={5} />
                {[[-14, -14], [14, -14], [-14, 14], [14, 14]].map(([x, y], j) => <circle key={j} cx={x} cy={y} r={7} fill="#cfd6dd" stroke={INK} strokeWidth={3} />)}
                <rect x={-7} y={-7} width={14} height={14} rx={3} fill={RED} stroke={INK} strokeWidth={3} />
              </g>
            </g>
          );
        })}
        {/* fichas estáticas */}
        {TOKENS.map(([x, y, code, a0, a1], i) => {
          if (t < a0 || t > a1) return null;
          const al = lerp(t, a0, a0 + 0.5, 0, 1) * lerp(t, a1 - 0.6, a1, 1, 0);
          const dy = (1 - lerp(t, a0, a0 + 0.6, 0, 1, Easing.out(Easing.back(2)))) * -26 * inv;
          return <TankToken key={i} p={[x, y + dy]} code={code} inv={inv * 0.8} alpha={al} flip={code === 'ru' || code === 'by' || code === 'kp'} />;
        })}
        {/* refuerzos europeos */}
        {t > 300 && t < 313 && REINF.map(([code, city, dl], i) => {
          const from = CT[city], to = REINF_TO[i];
          const k = lerp(t, 301 + dl, 309 + dl, 0, 1, Easing.inOut(Easing.quad));
          const p: P = [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k];
          const al = lerp(t, 300.5 + dl, 301 + dl, 0, 1) * lerp(t, 312, 313, 1, 0);
          return <g key={i} opacity={al}><path d={`M${from[0]},${from[1]} L${p[0]},${p[1]}`} stroke={BLUE} strokeWidth={4} strokeDasharray="10 8" vectorEffect="non-scaling-stroke" /><TankToken p={p} code={code} inv={inv * 0.85} /></g>;
        })}
        {/* rutas de avance */}
        {units && ROUTES.map((r, i) => <PathArrow key={i} pts={r.pts} t={t} t0={r.t0} t1={r.t1} color={r.color} w={4.2} fadeAfter={2.5} />)}
        {units && ROUTES.map((r, i) => <Mover key={`m${i}`} pts={r.pts} t={t} t0={r.t0} t1={r.t1} kind={r.kind || 'tank'} code={r.code} inv={inv} hold={2.2} />)}
        {units && FLIGHTS.map((fl, i) => <Mover key={`f${i}`} pts={fl.pts} t={t} t0={fl.t0} t1={fl.t1} kind={fl.kind} code={fl.code} color={fl.color} inv={inv} hold={fl.hold ?? 0.3} trail={fl.kind !== 'ship'} sinkAt={fl.sinkAt} />)}
        {/* ciudades del frente */}
        {cityList.map((c) => {
          const occ = CAPS.find((x) => x.city === c.city && x.kind === 'occ' && x.country === c.country);
          const lib = CAPS.find((x) => x.city === c.city && x.kind === 'lib' && x.country === c.country);
          const isKal = c.country === 'Kaliningrad';
          const captured = isKal ? false : !!occ && t >= occ.t;
          const freed = !!lib && t >= lib.t;
          const changeT = freed ? lib!.t : captured ? occ!.t : -99;
          const popK = changeT > 0 ? popT(t, changeT, 8) : 1;
          const bg = freed ? (isKal ? BLUE : GREEN) : captured ? RED : '#fff';
          const fg = freed || captured ? '#fff' : INK;
          const label = CITY_NAME[c.city] || c.city;
          const w = label.length * 12.5 + 26;
          const showLabel = MAJOR.has(c.city) || (changeT > 0 && t < changeT + 2.8);
          const la = MAJOR.has(c.city) ? 1 : lerp(t, changeT + 2.3, changeT + 2.8, 1, 0);
          return (
            <g key={c.city} transform={`translate(${c.p[0]},${c.p[1]}) scale(${inv})`}>
              <circle r={7} fill={bg} stroke={INK} strokeWidth={3} />
              {showLabel && <g opacity={la} transform={`translate(0,-30) scale(${0.85 + 0.15 * popK})`}>
                <rect x={-w / 2} y={-15} width={w} height={30} rx={10} fill={bg} stroke={INK} strokeWidth={3.5} />
                <text y={8} textAnchor="middle" fontFamily="Fredoka" fontWeight={700} fontSize={21} fill={fg}>{label}</text>
                {captured && !freed && <g transform={`translate(${w / 2 - 4},-14) scale(${popK})`}><svg x={-8} y={-10} width={22} height={15}><Flag code="ru" w={22} h={15} /></svg><rect x={-8} y={-10} width={22} height={15} fill="none" stroke={INK} strokeWidth={2} /></g>}
              </g>}
            </g>
          );
        })}
        {[...CAPS.map((c) => ({t: c.t, p: c.p})), ...(TL.extraExplosions as number[][]).map((e) => ({t: e[0], p: [e[1], e[2]] as P}))].map((e, i) => <Boom key={i} p={e.p} t={t} at={e.t} r={10} />)}
        {FACES.map((fc) => { const m = moodOf(fc.name, t); return <Face key={fc.name} x={fc.p[0]} y={fc.p[1]} r={faceR(fc.r, s)} mood={m.mood} look={m.look} t={t} seed={fc.seed} talking={talkingNow(fc.name, t)} />; })}
        {extra}
      </g>
    </svg>
  );
};

// ================= etiquetas y bocadillos sobre el mapa =================
const MapLabels: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const zoomed = cam.s > 1.62;
  const wide = (t > 238 && t < 262) || (t > 301 && t < 312) || t > 448 || (t > 63 && t < 99);
  const items: React.ReactNode[] = [];
  for (const fc of FACES) {
    const isBalt = BALTS.includes(fc.name);
    if (zoomed ? !KEY.has(fc.name) : !wide) continue;
    if (!zoomed && isBalt && cam.s < 1.4) continue;
    const [sx, sy0] = toScreen(fc.p, cam);
    const sy = sy0 + faceR(fc.r, cam.s) * cam.s + 12;
    if (sx < 60 || sx > 1860 || sy < 200 || sy > 1010) continue;
    if (t > 125 && t < 445 && sx < 720 && sy > 780) continue;
    if (t > 125 && t < 445 && sx > 1440 && sy > 190 && sy < 600) continue;
    const st = isBalt ? statusOf(fc.name, t) : undefined;
    const look = st && st !== 'free' ? STATUS_LOOK[st] : undefined;
    items.push(
      <div key={fc.name} style={{position: 'absolute', left: sx, top: sy, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
        <div style={{background: '#fff', border: `4px solid ${INK}`, borderRadius: 14, padding: '3px 14px 0', ...font, fontSize: isBalt ? 30 : 26, color: INK, whiteSpace: 'nowrap', boxShadow: '0 4px 0 rgba(0,0,0,0.3)'}}>{NAMES[fc.name]}</div>
        {look && <div style={{background: look[1], border: `3px solid ${INK}`, borderRadius: 12, padding: '2px 12px 0', ...font, fontSize: 21, color: '#fff', whiteSpace: 'nowrap'}}>{look[0]}</div>}
      </div>,
    );
  }
  if (zoomed) {
    const [sx, sy] = toScreen([1016, 541], cam);
    const st = kalStatus(t);
    if (sx > 60 && sx < 1860 && sy > 200 && sy < 1010)
      items.push(
        <div key="kal" style={{position: 'absolute', left: sx, top: sy, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
          <div style={{background: '#fff', border: `4px solid ${INK}`, borderRadius: 14, padding: '3px 12px 0', ...font, fontSize: 24, color: INK, whiteSpace: 'nowrap'}}>KALININGRAD</div>
          {st !== 'russian' && <div style={{background: STATUS_LOOK[st][1], border: `3px solid ${INK}`, borderRadius: 12, padding: '2px 10px 0', ...font, fontSize: 19, color: '#fff'}}>{STATUS_LOOK[st][0]}</div>}
        </div>,
      );
  }
  const a = zoomed ? lerp(cam.s, 1.62, 1.82, 0, 1, Easing.linear) : 1;
  return <div style={{position: 'absolute', inset: 0, opacity: a, zIndex: 3}}>{items}</div>;
};
const MapBubbles: React.FC<{t: number; cam: Cam}> = ({t, cam}) => (
  <>
    {BUBBLES.filter(([a, b, w]) => !w.startsWith('av-') && t >= a && t <= b).map(([a, b, w, text]) => {
      const fc = FACES.find((x) => x.name === w)!;
      const [sx, sy] = toScreen(fc.p, cam);
      const k = popT(t, a, 10) * lerp(t, b - 0.25, b, 1, 0);
      const maxX = t > 125 && t < 445 ? 1180 : 1660;
      return <Bubble key={w + a} k={k} sx={Math.max(330, Math.min(maxX, sx))} sy={Math.max(260, sy - faceR(fc.r, cam.s) * cam.s - 14)} text={text} />;
    })}
  </>
);
const MapPills: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const list: [P, number, number, string, string][] = [
    [[985, 425], 111, 118, 'UNDERSEA CABLES CUT', RED], [[1050, 600], 116.5, 123.5, 'DRONES OVER AIRPORTS', RED],
    [[1188, 500], 122.7, 127, '+15,000 NORTH KOREAN TROOPS', PURPLE],
    [[1047, 575], 280, 290, 'BATTLE OF THE SUWAŁKI GAP', ORANGE], [[1135, 268], 291.5, 300, 'SECOND FRONT', BLUE],
    [[1040, 455], 313, 320, 'AIR BATTLE', BLUE], [[985, 470], 322, 329.5, 'NAVAL BATTLE', BLUE],
  ];
  return (
    <>
      {list.map(([p, a, b, text, col]) => {
        if (t < a || t > b) return null;
        const [sx, sy] = toScreen(p, cam);
        const k = popT(t, a, 11) * lerp(t, b - 0.3, b, 1, 0);
        return <div key={text} style={{position: 'absolute', left: sx, top: sy, transform: `translate(-50%,-50%) scale(${k})`, background: col, color: '#fff', border: `5px solid ${INK}`, borderRadius: 22, padding: '6px 22px 1px', ...font, fontSize: 34, whiteSpace: 'nowrap', boxShadow: '0 6px 0 rgba(0,0,0,0.3)', zIndex: 4}}>{text}</div>;
      })}
    </>
  );
};

// ================= interfaz fija =================
const LOCATIONS: [number, string][] = [
  [6, 'EUROPE'], [12, 'MOSCOW, RUSSIA'], [60, 'EUROPE'], [78.5, 'POLAND'], [82.5, 'GERMANY'], [86.5, 'FRANCE'], [90.5, 'UNITED KINGDOM'], [94.5, 'FINLAND'],
  [98.5, 'EUROPE'], [108, 'BALTIC SEA'], [125, 'SUWAŁKI GAP'], [145, 'ESTONIA'], [175, 'LATVIA'], [205, 'LITHUANIA'], [236, 'EUROPE'], [262, 'BALTIC FRONT'],
  [277, 'POLISH BORDER'], [290, 'FINNISH BORDER'], [300, 'EUROPE'], [312, 'BALTIC SKIES'], [321, 'BALTIC SEA'], [333, 'KALININGRAD'], [360, 'LITHUANIA'],
  [390, 'LATVIA & ESTONIA'], [425, 'RUSSIAN BORDER'], [445, 'EUROPE'],
];
const LocationPill: React.FC<{t: number}> = ({t}) => {
  let cur = LOCATIONS[0];
  for (const l of LOCATIONS) if (t >= l[0]) cur = l;
  const k = t - cur[0] < 0.4 ? popT(t, cur[0], 12) : 1;
  return (
    <div style={{position: 'absolute', left: 34, top: 28, display: 'flex', alignItems: 'center', gap: 12, background: INK, color: '#fff', padding: '12px 28px 12px 22px', borderRadius: 40, boxShadow: '0 6px 0 rgba(0,0,0,0.3)', transform: `scale(${0.85 + 0.15 * k})`, transformOrigin: 'left center', ...font, fontSize: 36, letterSpacing: 1, zIndex: 10}}>
      <svg width={24} height={32} viewBox="0 0 22 30"><path d="M11,0 C4.9,0 0,4.9 0,11 C0,19 11,30 11,30 C11,30 22,19 22,11 C22,4.9 17.1,0 11,0 Z" fill={YELLOW} /><circle cx={11} cy={11} r={4.5} fill={INK} /></svg>
      {cur[1]}
    </div>
  );
};
const CARDS: [number, number, string, string, string, string][] = [
  [14.5, 46, '2027', 'Moscow: a secret meeting of Russia, Belarus and North Korea', 'SECRET PLAN', PURPLE],
  [46, 59.2, '2027', 'North Korea sends troops on the Trans-Siberian Railway', 'REINFORCEMENTS', PURPLE],
  [78.5, 98.3, 'THE PLAYERS', 'Europe’s strongest armies', 'EUROPE', BLUE],
  [108, 118, '2027', 'Sabotage: cables cut and drones over airports', 'HYBRID WAR', ORANGE],
  [118, 125, '2027', 'Russian, Belarusian and North Korean troops mass on the border', 'TENSION', ORANGE],
  [125, 145, 'DAY 1', 'Belarus and Kaliningrad cut the Suwałki Gap', 'INVASION', RED],
  [145, 175, 'DAY 2', 'Russian columns pour into Estonia from Narva', 'INVASION', RED],
  [175, 205, 'DAY 4', 'Latvia is attacked from three directions', 'INVASION', RED],
  [205, 235, 'DAY 7', 'Lithuania is invaded from Belarus and the north', 'INVASION', RED],
  [238, 250, 'DAY 10', 'The Baltics have fallen. Europe is in shock', 'OCCUPIED', RED],
  [250, 262, 'DAY 12', 'NATO invokes Article 5', 'NATO', BLUE],
  [262, 275, 'DAY 12', 'Russia bets that Europe won’t fight back', 'RUSSIA', RED],
  [278, 290, 'DAY 15', 'Poland holds the line at the Suwałki Gap', 'DEFENSE', BLUE],
  [290, 300, 'DAY 20', 'Finland opens a second front in the north', 'FINLAND', BLUE],
  [300, 312, 'DAY 25', 'Europe sends its armies to Poland', 'MOBILIZATION', BLUE],
  [312, 321, 'DAY 33', 'European jets win control of the skies', 'AIR BATTLE', BLUE],
  [321, 330, 'DAY 38', 'Russia’s Baltic Fleet is destroyed at sea', 'NAVAL BATTLE', BLUE],
  [333, 360, 'DAY 45', 'Poland and Germany storm Kaliningrad', 'COUNTERATTACK', BLUE],
  [360, 390, 'DAY 55', 'Lithuania is liberated, city by city', 'LIBERATION', GREEN],
  [390, 425, 'DAY 62', 'Swedish and Finnish landings free Latvia and Estonia', 'LIBERATION', GREEN],
  [425, 445, 'DAY 80', 'Europe stops at the border. Russia asks for peace', 'CEASEFIRE', GREEN],
];
const TopCard: React.FC<{t: number}> = ({t}) => {
  const c = CARDS.find(([a, b]) => t >= a && t < b);
  if (!c) return null;
  const [a, b, badge, text, tag, col] = c;
  const inn = popT(t, a, 14), out = lerp(t, b - 0.27, b, 0, 1);
  const y = interpolate(inn, [0, 1], [-180, 0]) - out * 180;
  return (
    <div style={{position: 'absolute', top: 104, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `translateY(${y}px)`, zIndex: 9}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 20, background: CREAM, border: `6px solid ${INK}`, borderRadius: 22, padding: '12px 16px 12px 12px', boxShadow: '0 8px 0 rgba(0,0,0,0.35)', maxWidth: 1840}}>
        <div style={{background: INK, color: YELLOW, ...font, fontSize: 50, padding: '6px 18px 2px', borderRadius: 12, whiteSpace: 'nowrap'}}>{badge}</div>
        <div style={{...font2, fontSize: 42, color: INK, whiteSpace: 'nowrap'}}>{text}</div>
        <div style={{background: col, color: '#fff', ...font, fontSize: 30, padding: '8px 18px 4px', borderRadius: 30, border: `4px solid ${INK}`, whiteSpace: 'nowrap', transform: `scale(${0.6 + 0.4 * popT(t, a + 0.2, 9)})`}}>{tag}</div>
      </div>
    </div>
  );
};
const PowerBar: React.FC<{t: number}> = ({t}) => {
  if (t < 98.5 || t > 509) return null;
  const k = popT(t, 98.5, 13) * lerp(t, 508.5, 509, 1, 0);
  const v = piece(t, POWER, ease);
  const W = 620, mid = W / 2 + (v * W) / 2;
  return (
    <div style={{position: 'absolute', top: 26, left: 960 - W / 2 - 60, width: W + 120, transform: `scale(${k})`, display: 'flex', alignItems: 'center', gap: 10, zIndex: 10}}>
      <MiniFlag code="ru" w={46} h={32} />
      <div style={{position: 'relative', width: W, height: 34, border: `5px solid ${INK}`, borderRadius: 18, overflow: 'hidden', background: BLUE, boxShadow: '0 5px 0 rgba(0,0,0,0.3)'}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: mid, background: RED}} />
        <div style={{position: 'absolute', left: mid - 3, top: -2, bottom: -2, width: 6, background: '#fff', borderLeft: `2px solid ${INK}`, borderRight: `2px solid ${INK}`}} />
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: 20, color: '#fff', textShadow: `2px 2px 0 ${INK}`, letterSpacing: 1}}>WHO’S WINNING?</div>
      </div>
      <MiniFlag code="eu" w={46} h={32} />
    </div>
  );
};
const DayCounter: React.FC<{t: number}> = ({t}) => {
  if (t < 125 || t > 445.5) return null;
  const dd = Math.max(1, Math.floor(warDay(t)));
  const k = popT(t, 125, 12) * lerp(t, 445, 445.5, 1, 0);
  return (
    <div style={{position: 'absolute', right: 34, top: 26, transform: `scale(${k})`, transformOrigin: 'right top', display: 'flex', alignItems: 'center', gap: 12, background: INK, padding: '10px 24px 8px 16px', borderRadius: 18, boxShadow: '0 6px 0 rgba(0,0,0,0.3)', zIndex: 10}}>
      <svg width={36} height={36} viewBox="0 0 36 36"><rect x={3} y={6} width={30} height={27} rx={5} fill="#fff" stroke={YELLOW} strokeWidth={3} /><rect x={3} y={6} width={30} height={9} fill={RED} /><rect x={9} y={2} width={4} height={8} rx={2} fill={YELLOW} /><rect x={23} y={2} width={4} height={8} rx={2} fill={YELLOW} /></svg>
      <div style={{...font, fontSize: 40, color: YELLOW}}>DAY {dd}</div>
    </div>
  );
};
const Icon: React.FC<{k: 'tank' | 'plane' | 'ship'}> = ({k}) => (
  <svg width={30} height={22} viewBox="-15 -11 30 22">
    {k === 'tank' && <g><rect x={-13} y={-1} width={26} height={9} rx={3} fill="#556b3f" stroke={INK} strokeWidth={2} /><rect x={-6} y={-8} width={12} height={8} rx={3} fill="#556b3f" stroke={INK} strokeWidth={2} /><rect x={5} y={-6} width={10} height={3} fill={INK} /></g>}
    {k === 'plane' && <path d="M-14,0 L-4,-2 L4,-11 L7,-11 L3,-2 L10,-2 L13,-6 L15,-6 L14,0 L15,6 L13,6 L10,2 L3,2 L7,11 L4,11 L-4,2 Z" fill="#9aa7b4" stroke={INK} strokeWidth={1.6} />}
    {k === 'ship' && <path d="M-14,2 L14,2 L10,8 L-10,8 Z M-6,-4 L4,-4 L4,2 L-6,2 Z M-2,-9 L0,-9 L0,-4 L-2,-4 Z" fill="#8a96a3" stroke={INK} strokeWidth={1.6} />}
  </svg>
);
const CasualtyPanel: React.FC<{t: number; real: number}> = ({t, real}) => {
  if (t < 125.5 || t > 446 || (real > 12 && real < 125.5)) return null;
  const k = popT(t, 125.5, 14) * lerp(t, 445.5, 446, 1, 0);
  const c = casualties(warDay(t)), e = equipment(t);
  const row = (code: string, name: string, tot: number, col: string, eq: {tanks: number; planes: number; ships: number}) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 12, height: 50}}>
      <MiniFlag code={code} w={50} h={34} />
      <div style={{...font2, fontSize: 24, color: INK, width: 200, whiteSpace: 'nowrap'}}>{name}</div>
      <div style={{...font, fontSize: 34, color: col, width: 120, textAlign: 'right'}}>{fmt(tot * 0.25)}</div>
      <div style={{...font, fontSize: 34, color: col, width: 140, textAlign: 'right', opacity: 0.8}}>{fmt(tot * 0.75)}</div>
      <div style={{display: 'flex', gap: 10, marginLeft: 14}}>
        {(['tank', 'plane', 'ship'] as const).map((kk) => <div key={kk} style={{display: 'flex', alignItems: 'center', gap: 3, ...font, fontSize: 24, color: INK, minWidth: 76}}><Icon k={kk} />{fmt(kk === 'tank' ? eq.tanks : kk === 'plane' ? eq.planes : eq.ships)}</div>)}
      </div>
    </div>
  );
  return (
    <div style={{position: 'absolute', left: 30, bottom: 62, transform: `translateY(${(1 - k) * 300}px)`, zIndex: 8}}>
      <div style={{position: 'absolute', top: -26, left: 24, background: YELLOW, border: `4px solid ${INK}`, borderRadius: 12, padding: '4px 14px 0', ...font, fontSize: 23, color: INK, zIndex: 2}}>CASUALTIES & LOSSES</div>
      <div style={{background: CREAM, border: `6px solid ${INK}`, borderRadius: 20, padding: '20px 22px 8px', boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>
        <div style={{display: 'flex', ...font, fontSize: 19, color: '#6b6250', marginLeft: 262, gap: 0}}>
          <div style={{width: 120, textAlign: 'right'}}>KILLED</div><div style={{width: 140, textAlign: 'right'}}>WOUNDED</div><div style={{marginLeft: 30}}>EQUIPMENT LOST</div>
        </div>
        {row('ru', 'RUSSIA & ALLIES', c.ru, '#c0221d', e.ru)}
        {row('eu', 'EUROPE', c.eu, '#1557c0', e.eu)}
      </div>
    </div>
  );
};
const BalancePanel: React.FC<{t: number; real: number}> = ({t, real}) => {
  if (t < 126 || t > 446 || real < 6.2 || (real > 12 && real < 126)) return null;
  const k = popT(t, 126, 14) * lerp(t, 445.5, 446, 1, 0);
  const occ = occupiedKm2(t);
  const rows = [
    ...BALTS.map((n) => ({code: FLAG_OF[n], name: NAMES[n], st: STATUS_LOOK[statusOf(n, t)]})),
    {code: 'ru', name: 'KALININGRAD', st: STATUS_LOOK[kalStatus(t)]},
  ];
  return (
    <div style={{position: 'absolute', right: 30, top: 212, width: 430, transform: `translateX(${(1 - k) * 520}px)`, zIndex: 8}}>
      <div style={{background: CREAM, border: `6px solid ${INK}`, borderRadius: 20, padding: '12px 18px', boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>
        <div style={{...font, fontSize: 30, color: INK, textAlign: 'center', marginBottom: 4}}>FRONT STATUS</div>
        {rows.map((r) => (
          <div key={r.name} style={{display: 'flex', alignItems: 'center', gap: 12, height: 46}}>
            <MiniFlag code={r.code} w={44} h={30} />
            <div style={{...font2, fontSize: 24, color: INK, flex: 1}}>{r.name}</div>
            <div style={{...font, fontSize: 20, color: '#fff', background: r.st[1], border: `3px solid ${INK}`, borderRadius: 20, padding: '4px 12px 0', whiteSpace: 'nowrap'}}>{r.st[0]}</div>
          </div>
        ))}
        <div style={{height: 3, background: '#d9caa6', margin: '8px 0'}} />
        <div style={{...font2, fontSize: 20, color: '#555'}}>Baltic land occupied by Russia</div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 10}}>
          <div style={{...font, fontSize: 40, color: occ > 100 ? '#c0221d' : GREEN}}>{fmt(occ)} km²</div>
          <div style={{...font, fontSize: 26, color: '#6b6250'}}>{Math.round((occ / BALTIC_KM2) * 100)}%</div>
        </div>
        <div style={{height: 20, background: '#e6d9bd', border: `4px solid ${INK}`, borderRadius: 12, overflow: 'hidden', marginTop: 4}}>
          <div style={{width: `${(occ / BALTIC_KM2) * 100}%`, height: '100%', background: RED}} />
        </div>
      </div>
    </div>
  );
};
const Minimap: React.FC<{t: number; cam: Cam; real: number}> = ({t, cam, real}) => {
  const show = t > 108 && t < 445 && cam.s > 1.55 && !(real > 12 && real < 108);
  const a = show ? lerp(cam.s, 1.55, 1.8, 0, 1, Easing.linear) : 0;
  if (a <= 0) return null;
  const X0 = 560, Y0 = 170, sc = 0.25, W = 900 * sc, H = 720 * sc;
  const vw = 1920 / cam.s, vh = 1080 / cam.s;
  return (
    <div style={{position: 'absolute', right: 30, bottom: 62, opacity: a, zIndex: 8, background: CREAM, border: `5px solid ${INK}`, borderRadius: 16, padding: 8, boxShadow: '0 6px 0 rgba(0,0,0,0.3)'}}>
      <svg width={W} height={H} style={{display: 'block', borderRadius: 8, background: '#3a86c8'}}>
        <defs><pattern id="mmh" patternUnits="userSpaceOnUse" width={4} height={4} patternTransform="rotate(45)"><rect width={4} height={4} fill={RED} /><rect width={1.5} height={4} fill="#7a0000" /></pattern></defs>
        <g transform={`scale(${sc}) translate(${-X0},${-Y0})`}>
          {map.countries.map((c) => {
            let fill = '#efe3c8';
            if (c.name === 'Russia' || c.name === 'Belarus') fill = '#f2b8b0';
            if (BALTS.includes(c.name)) { const st = statusOf(c.name, t); fill = st === 'occupied' || st === 'attack' ? 'url(#mmh)' : st === 'liberated' ? '#8fd6a8' : '#efe3c8'; }
            if (c.name === 'Kaliningrad') fill = kalStatus(t) === 'allied' ? BLUE : '#f2b8b0';
            return <path key={c.name} d={c.d} fill={fill} stroke={INK} strokeWidth={1.2} vectorEffect="non-scaling-stroke" />;
          })}
          <rect x={cam.cx - vw / 2} y={cam.cy - vh / 2} width={vw} height={vh} fill="rgba(255,210,63,0.25)" stroke={YELLOW} strokeWidth={3} vectorEffect="non-scaling-stroke" />
        </g>
      </svg>
      <div style={{display: 'flex', gap: 12, marginTop: 6, ...font2, fontSize: 17, color: INK, justifyContent: 'center'}}>
        <span style={{display: 'flex', alignItems: 'center', gap: 4}}><svg width={16} height={16}><rect width={16} height={16} fill="url(#mmh)" stroke={INK} strokeWidth={2} /></svg>Occupied</span>
        <span style={{display: 'flex', alignItems: 'center', gap: 4}}><svg width={16} height={16}><rect width={16} height={16} fill={BLUE} stroke={INK} strokeWidth={2} /></svg>Allied</span>
        <span style={{display: 'flex', alignItems: 'center', gap: 4}}><svg width={16} height={16}><rect width={16} height={16} fill="#8fd6a8" stroke={INK} strokeWidth={2} /></svg>Liberated</span>
      </div>
    </div>
  );
};
const Stamp: React.FC<{t: number}> = ({t}) => {
  const st = (TL.stamps as any[]).find((s) => t >= s.t && t < s.t + 1.6);
  if (!st) return null;
  const dt = t - st.t;
  const k = dt < 0.27 ? interpolate(dt, [0, 0.27], [2.2, 1], {...clamp, easing: Easing.out(Easing.cubic)}) : 1;
  const a = lerp(dt, 0, 0.12, 0, 1) * lerp(dt, 1.35, 1.6, 1, 0);
  const col = st.c === 'red' ? RED : st.c === 'blue' ? BLUE : GREEN;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 12, pointerEvents: 'none'}}>
      <div style={{transform: `scale(${k}) rotate(-6deg)`, opacity: a, border: `9px solid ${col}`, color: col, background: 'rgba(255,246,227,0.93)', borderRadius: 18, padding: '14px 44px 6px', ...font, fontSize: 96, letterSpacing: 2, boxShadow: '0 10px 0 rgba(0,0,0,0.3)', whiteSpace: 'nowrap'}}>{st.text}</div>
    </AbsoluteFill>
  );
};
const FACTS: [number, number, string, string][] = [
  [54.2, 59.2, 'By early 2026, North Korea had shipped Russia about 33,000 containers of munitions — roughly 15 million artillery shells.', 'South Korean intelligence via NK News, 2026'],
  [155, 161.5, 'Narva, Estonia’s third-largest city, is about 97% Russian-speaking — and sits right on the Russian border.', 'Chatham House, 2025'],
  [253, 261, 'Article 5: an attack on one ally is an attack on all. But each country decides how to respond — it doesn’t force anyone to send troops.', 'North Atlantic Treaty, 1949'],
  [266, 273.5, 'In 2025 Russia produced about 7 million shells and rockets — far more than all of NATO combined.', 'Estonian Foreign Intelligence Service, 2026'],
  [293.5, 299.5, 'Finland has just 5.6 million people — but 280,000 wartime troops and 870,000 trained reservists.', 'Finnish Defence Forces'],
  [364, 370.5, 'Poland is building one of Europe’s strongest armies: about 900 modern tanks planned by 2030.', 'Polish Ministry of Defence plans via Grosswald, 2026'],
];
const FactCard: React.FC<{t: number}> = ({t}) => {
  const fct = FACTS.find(([a, b]) => t >= a && t < b);
  if (!fct) return null;
  const [a, b, text, src] = fct;
  const k = popT(t, a, 13) * lerp(t, b - 0.3, b, 1, 0);
  return (
    <div style={{position: 'absolute', left: 40, top: 330, width: 660, transform: `scale(${k})`, transformOrigin: 'left center', zIndex: 11}}>
      <div style={{position: 'absolute', top: -30, left: 30, background: YELLOW, border: `5px solid ${INK}`, borderRadius: 14, padding: '4px 18px 0', ...font, fontSize: 30, color: INK, transform: 'rotate(-3deg)'}}>DID YOU KNOW?</div>
      <div style={{background: '#fff', border: `6px solid ${INK}`, borderRadius: 22, padding: '30px 30px 14px', boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>
        <div style={{...font2, fontSize: 32, color: INK, lineHeight: 1.25}}>{text}</div>
        <div style={{...font2, fontWeight: 600, fontSize: 18, color: '#7a7262', marginTop: 8}}>Source: {src}</div>
      </div>
    </div>
  );
};
const ChapterTitle: React.FC<{t: number}> = ({t}) => {
  const ch = (TL.chapters as any[]).find((c) => t >= c.t && t < c.t + 3);
  if (!ch) return null;
  const dt = t - ch.t;
  const a = lerp(dt, 0, 0.25, 0, 1) * lerp(dt, 2.6, 3, 1, 0);
  const k = popT(t, ch.t + 0.1, 11);
  const k2 = popT(t, ch.t + 0.3, 12);
  return (
    <AbsoluteFill style={{background: `rgba(8,18,32,${0.6 * a})`, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 18, zIndex: 14}}>
      <div style={{opacity: a, transform: `scale(${k})`, background: YELLOW, border: `5px solid ${INK}`, borderRadius: 30, padding: '6px 28px 0', ...font, fontSize: 40, color: INK}}>CHAPTER {ch.n}</div>
      <div style={{opacity: a, transform: `scale(${k2}) rotate(-2deg)`, ...font, fontSize: 130, color: '#fff', textShadow: `6px 6px 0 ${INK}, -3px -3px 0 ${INK}, 3px -3px 0 ${INK}, -3px 3px 0 ${INK}`, whiteSpace: 'nowrap'}}>{ch.title}</div>
      <div style={{opacity: a, width: interpolate(k2, [0, 1], [0, 700]), height: 8, background: RED, borderRadius: 4, border: `3px solid ${INK}`}} />
    </AbsoluteFill>
  );
};
const Footer = () => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 44, background: 'rgba(15,25,40,0.92)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', ...font2, fontWeight: 600, fontSize: 21, zIndex: 20}}>
    Hypothetical simulation · Data: Global Firepower 2026, SIPRI 2025 · Map: Natural Earth
  </div>
);

// ================= fichas de país (estilo videojuego) =================
type Fighter = {t: number; code: string; name: string; side: 'AXIS' | 'EUROPE'; soldiers: number; soldierNote?: string; tanks: number; planes: number; budget: string; trait: string};
const FIGHTERS: Fighter[] = [
  {t: 20, code: 'ru', name: 'RUSSIA', side: 'AXIS', soldiers: 1320000, tanks: 5630, planes: 1559, budget: '$190B', trait: '4+ years of real combat experience'},
  {t: 24, code: 'by', name: 'BELARUS', side: 'AXIS', soldiers: 63000, tanks: 577, planes: 93, budget: '~$1B', trait: 'Borders Poland, Lithuania and Latvia'},
  {t: 28, code: 'kp', name: 'NORTH KOREA', side: 'AXIS', soldiers: 1320000, tanks: 4895, planes: 455, budget: '~$4.8B', trait: 'Already sent ~15,000 troops to Russia'},
  {t: 78.5, code: 'pl', name: 'POLAND', side: 'EUROPE', soldiers: 250000, tanks: 798, planes: 70, budget: '$46.8B', trait: 'NATO’s top spender: 4.5% of GDP'},
  {t: 82.5, code: 'de', name: 'GERMANY', side: 'EUROPE', soldiers: 184324, tanks: 296, planes: 190, budget: '$114B', trait: 'Europe’s biggest military budget'},
  {t: 86.5, code: 'fr', name: 'FRANCE', side: 'EUROPE', soldiers: 264000, tanks: 427, planes: 223, budget: '$68B', trait: 'Nuclear power with an aircraft carrier'},
  {t: 90.5, code: 'gb', name: 'UNITED KINGDOM', side: 'EUROPE', soldiers: 141330, tanks: 288, planes: 141, budget: '$89B', trait: 'Two aircraft carriers and 10 submarines'},
  {t: 94.5, code: 'fi', name: 'FINLAND', side: 'EUROPE', soldiers: 24000, soldierNote: '280,000 in wartime', tanks: 200, planes: 53, budget: '$8.1B', trait: '870,000 trained reservists'},
];
const FighterCard: React.FC<{t: number}> = ({t}) => {
  const fc = FIGHTERS.find((x) => t >= x.t && t < x.t + 4);
  if (!fc) return null;
  const dt = t - fc.t;
  const inn = popT(t, fc.t, 14), out = lerp(dt, 3.7, 4, 0, 1);
  const x = interpolate(inn, [0, 1], [700, 0]) - out * 1400;
  const col = fc.side === 'AXIS' ? RED : BLUE;
  const bar = (label: string, val: number, max: number, shown: string, i: number) => {
    const g = lerp(dt, 0.35 + i * 0.15, 1.1 + i * 0.15, 0, 1, Easing.out(Easing.cubic));
    return (
      <div style={{display: 'flex', alignItems: 'center', gap: 14, height: 50}}>
        <div style={{...font2, fontSize: 24, color: '#5b5446', width: 190}}>{label}</div>
        <div style={{flex: 1, height: 24, background: '#e6d9bd', border: `4px solid ${INK}`, borderRadius: 12, overflow: 'hidden'}}><div style={{width: `${Math.max(3, (val / max) * 100) * g}%`, height: '100%', background: col}} /></div>
        <div style={{...font, fontSize: 32, color: INK, width: 160, textAlign: 'right'}}>{shown}</div>
      </div>
    );
  };
  return (
    <div style={{position: 'absolute', right: 60, top: 270, width: 860, transform: `translateX(${x}px) rotate(${(1 - inn) * 4}deg)`, zIndex: 11}}>
      <div style={{position: 'absolute', left: -60, top: 30, zIndex: 2}}><Avatar size={210} code={fc.code} mood={fc.side === 'AXIS' ? 'smug' : 'angry'} t={t} seed={fc.code.charCodeAt(0)} look={[fc.side === 'AXIS' ? -1 : 1, 0]} id={`fc-${fc.code}`} /></div>
      <div style={{background: CREAM, border: `7px solid ${INK}`, borderRadius: 26, padding: '22px 30px 18px 180px', boxShadow: '0 10px 0 rgba(0,0,0,0.35)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8}}>
          <div style={{...font, fontSize: 60, color: INK, lineHeight: 1}}>{fc.name}</div>
          <div style={{background: col, color: '#fff', border: `4px solid ${INK}`, borderRadius: 20, padding: '4px 14px 0', ...font, fontSize: 24}}>{fc.side}</div>
        </div>
        {bar('Active soldiers', fc.soldiers, 1320000, fc.soldiers >= 1e6 ? `${(fc.soldiers / 1e6).toFixed(2)}M` : fmt(fc.soldiers), 0)}
        {fc.soldierNote && <div style={{...font2, fontSize: 20, color: col, marginTop: -8, marginLeft: 204}}>{fc.soldierNote}</div>}
        {bar('Tanks', fc.tanks, 5630, fmt(fc.tanks), 1)}
        {bar('Combat aircraft', fc.planes, 1559, fmt(fc.planes), 2)}
        <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 8}}>
          <div style={{...font2, fontSize: 24, color: '#5b5446', width: 190}}>Defense budget</div>
          <div style={{...font, fontSize: 36, color: INK}}>{fc.budget}</div>
        </div>
        <div style={{marginTop: 12, background: INK, color: YELLOW, borderRadius: 14, padding: '8px 16px 4px', ...font, fontSize: 28, display: 'inline-block'}}>★ {fc.trait}</div>
      </div>
    </div>
  );
};

// ================= comparativa de fuerzas =================
const FORCES: {label: string; ru: number; eu: number; show: (v: number) => string}[] = [
  {label: 'Active soldiers', ru: 2703000, eu: 1302811, show: (v) => fmt(v)},
  {label: 'Tanks', ru: 11102, eu: 2674, show: (v) => fmt(v)},
  {label: 'Combat aircraft', ru: 2107, eu: 1132, show: (v) => fmt(v)},
  {label: 'Nuclear warheads', ru: 5480, eu: 515, show: (v) => fmt(v)},
  {label: 'Military spending', ru: 196, eu: 483, show: (v) => `$${Math.round(v)}B`},
  {label: 'Population', ru: 176.6, eu: 413.1, show: (v) => `${Math.round(v)}M`},
];
const ForcesPanel: React.FC<{t: number}> = ({t}) => {
  if (t < 62.6 || t > 78.4) return null;
  const k = popT(t, 63, 13) * lerp(t, 77.8, 78.4, 1, 0);
  return (
    <AbsoluteFill style={{background: `rgba(8,18,32,${0.5 * k})`, alignItems: 'center', justifyContent: 'center', zIndex: 11}}>
      <div style={{transform: `scale(${k})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{background: YELLOW, border: `6px solid ${INK}`, borderRadius: 18, padding: '8px 40px 2px', ...font, fontSize: 60, color: INK, marginBottom: -24, zIndex: 2, boxShadow: '0 6px 0 rgba(0,0,0,0.3)', transform: 'rotate(-2deg)'}}>THE FORCES</div>
        <div style={{background: CREAM, border: `7px solid ${INK}`, borderRadius: 26, padding: '42px 40px 18px', width: 1400, boxShadow: '0 10px 0 rgba(0,0,0,0.35)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10}}><MiniFlag code="ru" /><MiniFlag code="by" /><MiniFlag code="kp" /><div style={{...font, fontSize: 40, color: '#c0221d', marginLeft: 8}}>RUSSIA’S SIDE</div></div>
            <div style={{display: 'flex', alignItems: 'center', gap: 10}}><div style={{...font, fontSize: 40, color: '#1557c0', marginRight: 8}}>EUROPE · 13 COUNTRIES</div><MiniFlag code="eu" /></div>
          </div>
          {FORCES.map((r, i) => {
            const st = 64.2 + i * 1.3;
            const a = lerp(t, st, st + 0.4, 0, 1), g = lerp(t, st, st + 1.4, 0, 1, Easing.out(Easing.cubic));
            const mx = Math.max(r.ru, r.eu), ruWin = r.ru > r.eu;
            return (
              <div key={r.label} style={{display: 'flex', alignItems: 'center', height: 80, opacity: a, borderTop: i ? '3px solid #e2d3b1' : 'none'}}>
                <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 14}}>
                  <div style={{...font, fontSize: 40, color: '#c0221d', opacity: ruWin ? 1 : 0.6, whiteSpace: 'nowrap', minWidth: 200, textAlign: 'right'}}>{r.show(r.ru * g)}</div>
                  <div style={{width: 260, height: 32, display: 'flex', justifyContent: 'flex-end'}}><div style={{width: `${(r.ru / mx) * 100 * g}%`, background: RED, border: `4px solid ${INK}`, borderRadius: '10px 0 0 10px', opacity: ruWin ? 1 : 0.55}} /></div>
                </div>
                <div style={{width: 300, textAlign: 'center', ...font2, fontSize: 30, color: INK}}>{r.label}</div>
                <div style={{flex: 1, display: 'flex', alignItems: 'center', gap: 14}}>
                  <div style={{width: 260, height: 32, display: 'flex'}}><div style={{width: `${(r.eu / mx) * 100 * g}%`, background: BLUE, border: `4px solid ${INK}`, borderRadius: '0 10px 10px 0', opacity: ruWin ? 0.55 : 1}} /></div>
                  <div style={{...font, fontSize: 40, color: '#1557c0', opacity: ruWin ? 0.6 : 1, whiteSpace: 'nowrap', minWidth: 200}}>{r.show(r.eu * g)}</div>
                </div>
              </div>
            );
          })}
          <div style={{...font2, fontWeight: 600, fontSize: 20, color: '#6b6250', textAlign: 'center', marginTop: 10}}>Global Firepower 2026 (includes stored equipment) · SIPRI 2025 · Europe = 13 key NATO members</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
const OnPaper: React.FC<{t: number}> = ({t}) => {
  if (t < 98.6 || t > 105) return null;
  const k = popT(t, 98.8, 12) * lerp(t, 104.5, 105, 1, 0);
  const k2 = popT(t, 101.3, 12) * lerp(t, 104.5, 105, 1, 0);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 22, zIndex: 11, background: `rgba(8,18,32,${0.35 * k})`}}>
      <div style={{transform: `scale(${k})`, background: CREAM, border: `7px solid ${INK}`, borderRadius: 24, padding: '20px 40px', boxShadow: '0 10px 0 rgba(0,0,0,0.35)', textAlign: 'center'}}>
        <div style={{...font, fontSize: 40, color: INK, marginBottom: 8}}>ON PAPER…</div>
        <div style={{...font2, fontSize: 40, color: '#c0221d'}}>Russia’s side: 2× the soldiers, 4× the tanks</div>
        <div style={{...font2, fontSize: 40, color: '#1557c0'}}>Europe: 2.5× the money, 2.3× the people</div>
      </div>
      <div style={{transform: `scale(${k2}) rotate(-2deg)`, background: INK, color: YELLOW, borderRadius: 20, padding: '12px 34px 6px', ...font, fontSize: 48}}>But wars aren’t won on paper.</div>
    </AbsoluteFill>
  );
};

// ================= gancho y título =================
const Hook: React.FC<{real: number}> = ({real}) => {
  if (real >= 6) return null;
  const first = real < 3;
  const a0 = first ? 0 : 3;
  const k = popT(real, a0 + 0.1, 10);
  const flash = real >= 2.95 && real < 3.2 ? lerp(real, 2.95, 3.2, 0.8, 0) : 0;
  return (
    <>
      <AbsoluteFill style={{background: 'rgba(0,0,0,0.25)', zIndex: 13}} />
      <div style={{position: 'absolute', top: 140, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 14}}>
        <div style={{transform: `scale(${k}) rotate(-3deg)`, background: RED, color: '#fff', border: `7px solid ${INK}`, borderRadius: 20, padding: '14px 40px 6px', ...font, fontSize: 84, textShadow: `4px 4px 0 ${INK}`, boxShadow: '0 10px 0 rgba(0,0,0,0.35)', whiteSpace: 'nowrap'}}>
          {first ? 'DAY 3 — ESTONIA IS FALLING' : 'DAY 9 — THE BALTICS ARE GONE'}
        </div>
      </div>
      <AbsoluteFill style={{background: '#fff', opacity: flash, zIndex: 15}} />
    </>
  );
};
const Title: React.FC<{real: number}> = ({real}) => {
  if (real < 6 || real > 12.4) return null;
  const k = popT(real, 6.1, 10) * lerp(real, 11.9, 12.4, 1, 0);
  const k2 = popT(real, 7.0, 12) * lerp(real, 11.9, 12.4, 1, 0);
  const flash = real < 6.3 ? lerp(real, 6, 6.3, 0.9, 0) : 0;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 26, zIndex: 13}}>
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
      <div style={{transform: `scale(${k}) rotate(-2deg)`, background: '#2ec36a', border: `8px solid ${INK}`, borderRadius: 28, padding: '24px 54px 14px', boxShadow: '0 12px 0 rgba(0,0,0,0.35)', ...font, fontSize: 112, color: '#fff', textShadow: `5px 5px 0 ${INK}`, textAlign: 'center', lineHeight: 1.02}}>WHAT IF RUSSIA<br />INVADED EUROPE?</div>
      <div style={{transform: `scale(${k2})`, background: INK, color: YELLOW, borderRadius: 30, padding: '10px 34px 4px', ...font, fontSize: 44}}>A WAR SIMULATION · BASED ON 2026 DATA</div>
    </AbsoluteFill>
  );
};

// ================= reunión secreta (Eurasia) =================
const EU = eurasia as {countries: Country[]; cities: Record<string, P>};
const AXIS = new Set(['Russia', 'Belarus', 'North Korea']);
const ROUTE = ['Pyongyang', 'Tumen', 'Khabarovsk', 'Chita', 'Irkutsk', 'Novosibirsk', 'Omsk', 'Yekaterinburg', 'Moscow'].map((k) => EU.cities[k]);
const MeetingScene: React.FC<{t: number}> = ({t}) => {
  const s = lerp(t, 12, 60, 1.0, 1.1, Easing.linear);
  const tf = `translate(960,540) scale(${s}) translate(-960,-560)`;
  const sp = (p: P): P => [960 + (p[0] - 960) * s, 540 + (p[1] - 560) * s];
  const pulse = 0.5 + 0.5 * Math.sin(t * 5);
  const routeP = lerp(t, 47, 55, 0, 1, Easing.inOut(Easing.quad));
  const {pts, tip} = partial(smoothPath(ROUTE, 8), routeP);
  const avK = (start: number) => popT(t, start, 11) * lerp(t, 51.2, 52, 1, 0);
  const city = (n: string, label: string, dy: number) => {
    const p = EU.cities[n];
    return <g key={n}><circle cx={p[0]} cy={p[1]} r={7 / s} fill={YELLOW} stroke={INK} strokeWidth={3 / s} /><text x={p[0]} y={p[1] + dy / s} fontFamily="Lilita" fontSize={28 / s} fill="#fff" stroke={INK} strokeWidth={6 / s} paintOrder="stroke" textAnchor="middle">{label}</text></g>;
  };
  const talk = (who: string) => talkingNow(who, t);
  const AV: [string, string, string, number, number][] = [['av-ru', 'ru', 'RUSSIA', 640, 33], ['av-by', 'by', 'BELARUS', 960, 33.4], ['av-kp', 'kp', 'NORTH KOREA', 1280, 33.8]];
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <defs>{EU.countries.map((c) => (FLAG_OF[c.name] ? <FlagPattern key={c.name} id={`ea-${pid(c.name)}`} code={FLAG_OF[c.name]} box={c.name === 'Russia' ? [600, 220, 1500, 640] : c.bbox} /> : null))}</defs>
        <g transform={tf}>
          <g transform="translate(2,3)" opacity={0.3}>{EU.countries.map((c) => <path key={c.name} d={c.d} fill="#06213f" />)}</g>
          {EU.countries.map((c) => <path key={c.name} d={c.d} fill={FLAG_OF[c.name] ? `url(#ea-${pid(c.name)})` : '#efe3c8'} opacity={FLAG_OF[c.name] && !AXIS.has(c.name) ? 0.5 : 1} />)}
          {EU.countries.map((c) => <path key={c.name} d={c.d} fill="none" stroke={INK} strokeOpacity={0.85} strokeWidth={AXIS.has(c.name) ? 3 : 1.8} vectorEffect="non-scaling-stroke" />)}
          {t > 15 && EU.countries.filter((c) => AXIS.has(c.name)).map((c) => <path key={c.name} d={c.d} fill="none" stroke={RED} strokeWidth={4 + pulse * 4} vectorEffect="non-scaling-stroke" opacity={lerp(t, 15, 16, 0, 1)} />)}
          {routeP > 0 && <path d={'M' + pts.map((p: P) => p.join(',')).join(' L')} fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />}
          {routeP > 0 && <path d={'M' + pts.map((p: P) => p.join(',')).join(' L')} fill="none" stroke={YELLOW} strokeWidth={5} strokeDasharray="14 10" strokeLinecap="round" vectorEffect="non-scaling-stroke" />}
          {city('Moscow', 'MOSCOW', -18)}{city('Pyongyang', 'PYONGYANG', 38)}
          {t > 15 && t < 47 && <g opacity={lerp(t, 15, 16, 0, 1) * lerp(t, 46, 47, 1, 0)}>{[['RUSSIA', 1060, 400], ['BELARUS', 690, 540], ['N. KOREA', 1440, 585]].map(([n, x, y]) => <text key={n as string} x={x as number} y={y as number} fontFamily="Lilita" fontSize={30 / s} fill={YELLOW} stroke={INK} strokeWidth={7 / s} paintOrder="stroke" textAnchor="middle">{n}</text>)}</g>}
        </g>
      </svg>
      {routeP > 0 && routeP < 1 && (() => { const [x, y] = sp(tip); return <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)'}}><svg width={140} height={50}>{[0, 1, 2].map((i) => <g key={i} transform={`translate(${i * 44},0)`}><rect x={3} y={8} width={40} height={30} rx={6} fill={i === 0 ? '#555' : CREAM} stroke={INK} strokeWidth={4} />{i > 0 && <svg x={9} y={14} width={28} height={18}><Flag code="kp" w={28} h={18} /></svg>}<circle cx={12} cy={42} r={5} fill={INK} /><circle cx={34} cy={42} r={5} fill={INK} /></g>)}</svg></div>; })()}
      {t > 52.5 && t < 59.2 && (() => { const [x, y] = sp(EU.cities.Moscow); const k = popT(t, 52.5, 10) * lerp(t, 58.6, 59.2, 1, 0); return <div style={{position: 'absolute', left: x + 190, top: y - 130, transform: `translate(-50%,-50%) scale(${k})`, background: PURPLE, color: '#fff', border: `5px solid ${INK}`, borderRadius: 18, padding: '10px 24px 2px', ...font, fontSize: 40, whiteSpace: 'nowrap', boxShadow: '0 6px 0 rgba(0,0,0,0.3)'}}>+15,000 SOLDIERS</div>; })()}
      {t > 32.5 && AV.map(([id, code, name, x, st]) => {
        const k = avK(st);
        const b = BUBBLES.find(([a, bb, w]) => w === id && t >= a && t <= bb);
        return (
          <React.Fragment key={id}>
            <div style={{position: 'absolute', left: x, top: 880, transform: `translate(-50%,-50%) scale(${k})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <Avatar size={id === 'av-ru' ? 170 : 150} code={code} mood={id === 'av-ru' ? 'smug' : id === 'av-kp' && t > 42 ? 'smug' : 'calm'} t={t} seed={code.charCodeAt(0)} look={[id === 'av-ru' ? 1 : -0.6, 0]} talking={talk(id)} id={`m-${code}`} />
              <div style={{background: '#fff', border: `4px solid ${INK}`, borderRadius: 14, padding: '3px 14px 0', ...font, fontSize: 28, color: INK, marginTop: -12, whiteSpace: 'nowrap', boxShadow: '0 4px 0 rgba(0,0,0,0.3)'}}>{name}</div>
            </div>
            {b && <Bubble k={popT(t, b[0], 10) * lerp(t, b[1] - 0.25, b[1], 1, 0)} sx={Math.max(420, Math.min(1500, x))} sy={770} text={b[3]} size={38} />}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

// ================= zoom circular (inset) =================
const INSETS: {t0: number; t1: number; at: P; cam: Cam; sx: number; sy: number; r: number; label: string}[] = [
  {t0: 129.5, t1: 139.5, at: [1048, 552], cam: {cx: 1047, cy: 553, s: 8}, sx: 400, sy: 520, r: 210, label: 'SUWAŁKI GAP · ONLY 65 KM WIDE'},
];
const Inset: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const ins = INSETS.find((x) => t >= x.t0 && t < x.t1);
  if (!ins) return null;
  const k = popT(t, ins.t0, 12) * lerp(t, ins.t1 - 0.35, ins.t1, 1, 0);
  const [mx, my] = toScreen(ins.at, cam);
  const road = smoothPath([CT.Bialystok, CT.Augustow, CT.Suwalki, CT.Marijampole, CT.Kaunas]);
  const extra = (
    <g>
      <path d={'M' + road.map((p) => p.join(',')).join(' L')} fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d={'M' + road.map((p) => p.join(',')).join(' L')} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d={`M1036,544 L1064,551`} stroke={YELLOW} strokeWidth={5} vectorEffect="non-scaling-stroke" strokeDasharray="6 4" />
      <text x={1050} y={541} textAnchor="middle" fontFamily="Lilita" fontSize={3.2} fill="#fff" stroke={INK} strokeWidth={0.8} paintOrder="stroke">65 km</text>
      <text x={1043} y={566} textAnchor="middle" fontFamily="Lilita" fontSize={2.4} fill="#fff" stroke={INK} strokeWidth={0.7} paintOrder="stroke">VIA BALTICA</text>
    </g>
  );
  return (
    <>
      <svg width={1920} height={1080} style={{position: 'absolute', zIndex: 5, opacity: k}}>
        <line x1={mx} y1={my} x2={ins.sx + ins.r * 0.7} y2={ins.sy} stroke={INK} strokeWidth={8} strokeLinecap="round" />
        <line x1={mx} y1={my} x2={ins.sx + ins.r * 0.7} y2={ins.sy} stroke="#fff" strokeWidth={4} strokeDasharray="12 9" strokeLinecap="round" />
        <circle cx={mx} cy={my} r={10} fill={YELLOW} stroke={INK} strokeWidth={4} />
      </svg>
      <div style={{position: 'absolute', left: ins.sx - ins.r, top: ins.sy - ins.r, width: ins.r * 2, height: ins.r * 2, borderRadius: '50%', overflow: 'hidden', border: `8px solid ${INK}`, boxShadow: '0 10px 0 rgba(0,0,0,0.35), inset 0 0 0 4px #fff', transform: `scale(${k})`, zIndex: 6, background: '#2d77b8'}}>
        <div style={{position: 'absolute', left: -(960 - ins.r), top: -(540 - ins.r), width: 1920, height: 1080}}>
          <EuropeMap t={t} cam={ins.cam} pre="in-" lite extra={extra} />
        </div>
      </div>
      <div style={{position: 'absolute', left: ins.sx, top: ins.sy + ins.r + 6, transform: `translate(-50%,-50%) scale(${k})`, background: YELLOW, border: `5px solid ${INK}`, borderRadius: 20, padding: '6px 22px 1px', ...font, fontSize: 32, color: INK, whiteSpace: 'nowrap', zIndex: 7, boxShadow: '0 6px 0 rgba(0,0,0,0.3)'}}>{ins.label}</div>
    </>
  );
};

// ================= océano =================
const Ocean: React.FC<{t: number}> = ({t}) => (
  <svg width={1920} height={1080} style={{position: 'absolute'}}>
    <defs>
      <radialGradient id="sea3" cx="50%" cy="45%" r="75%"><stop offset="0%" stopColor="#3f97d6" /><stop offset="100%" stopColor="#1d5e9f" /></radialGradient>
      <pattern id="waves3" width={140} height={46} patternUnits="userSpaceOnUse" patternTransform={`translate(${(t * 10.5) % 140},0)`}>
        <path d="M0,23 C17,13 35,13 52,23 S87,33 105,23 S122,13 140,23" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={3} />
      </pattern>
    </defs>
    <rect width={1920} height={1080} fill="url(#sea3)" />
    <rect width={1920} height={1080} fill="url(#waves3)" />
  </svg>
);

// ================= composición =================
export const War3: React.FC = () => {
  const frame = useCurrentFrame();
  const real = frame / 30;
  const t = storyTime(real);
  const cam = camera(t);
  const meetA = lerp(real, 12.3, 13.6, 0, 1) * lerp(real, 58.6, 60, 1, 0);
  const showEurope = meetA < 1;
  return (
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <Ocean t={real} />
      {showEurope && <EuropeMap t={t} cam={cam} pre="m-" />}
      {showEurope && <MapLabels t={t} cam={cam} />}
      {showEurope && <MapPills t={t} cam={cam} />}
      {showEurope && <MapBubbles t={t} cam={cam} />}
      {meetA > 0 && <AbsoluteFill style={{opacity: meetA}}><Ocean t={real} /><MeetingScene t={t} /></AbsoluteFill>}
      <Inset t={t} cam={cam} />
      <Stamp t={t} />
      <ForcesPanel t={t} />
      <OnPaper t={t} />
      <FighterCard t={t} />
      <FactCard t={t} />
      {real >= 6 && <LocationPill t={t} />}
      {real >= 6 && <TopCard t={t} />}
      <PowerBar t={t} />
      <DayCounter t={t} />
      <CasualtyPanel t={t} real={real} />
      <BalancePanel t={t} real={real} />
      <Minimap t={t} cam={cam} real={real} />
      <ChapterTitle t={real} />
      <Hook real={real} />
      <Title real={real} />
      <Footer />
      <Audio src={staticFile('music3.wav')} />
    </AbsoluteFill>
  );
};

// ================= miniatura de YouTube =================
export const Thumb: React.FC = () => {
  const t = 233;
  const cam: Cam = {cx: 1075, cy: 500, s: 2.6};
  const arrows: [P, P, number][] = [[[1160, 395], [1080, 410], -10], [[1170, 470], [1075, 470], 8], [[1140, 548], [1070, 525], -8]];
  return (
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <Ocean t={0} />
      <EuropeMap t={t} cam={cam} pre="th-" lite />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <g transform={`translate(960,540) scale(${cam.s}) translate(${-cam.cx},${-cam.cy})`}>
          {arrows.map(([a, b, bend], i) => <PathArrow key={i} pts={arcPath(a, b, bend)} t={10} t0={0} t1={1} color={RED} w={9} fadeAfter={100} />)}
          <Boom p={[1072, 470]} t={0.35} at={0} r={22} />
          <Boom p={[1062, 520]} t={0.3} at={0} r={18} />
          <Boom p={[1085, 410]} t={0.4} at={0} r={18} />
        </g>
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.45) 100%)'}} />
      <div style={{position: 'absolute', left: 40, top: 300}}><Avatar size={430} code="eu" mood="angry" t={0.5} seed={3} look={[1, 0]} id="th-eu" /></div>
      <div style={{position: 'absolute', right: 30, top: 270}}><Avatar size={480} code="ru" mood="angry" t={0.5} seed={1} look={[-1, 0]} id="th-ru" /></div>
      <div style={{position: 'absolute', top: 26, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: 'rotate(-2deg)', background: '#fff', border: `10px solid ${INK}`, borderRadius: 30, padding: '10px 50px 0', ...font, fontSize: 170, lineHeight: 1.05, boxShadow: '0 14px 0 rgba(0,0,0,0.4)', whiteSpace: 'nowrap'}}>
          <span style={{color: '#d4211b'}}>RUSSIA</span><span style={{color: INK, fontSize: 120}}> vs </span><span style={{color: '#1557c0'}}>EUROPE</span>
        </div>
      </div>
      <div style={{position: 'absolute', bottom: 40, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: 'rotate(2deg)', background: YELLOW, border: `10px solid ${INK}`, borderRadius: 30, padding: '6px 60px 0', ...font, fontSize: 150, color: INK, boxShadow: '0 14px 0 rgba(0,0,0,0.4)'}}>WHO WINS?</div>
      </div>
      <div style={{position: 'absolute', left: 960, top: 560, transform: 'translate(-50%,-50%) rotate(-8deg)', border: `9px solid ${RED}`, color: RED, background: 'rgba(255,246,227,0.95)', borderRadius: 18, padding: '8px 30px 0', ...font, fontSize: 70, whiteSpace: 'nowrap', boxShadow: '0 10px 0 rgba(0,0,0,0.35)'}}>BALTICS OCCUPIED</div>
    </AbsoluteFill>
  );
};
