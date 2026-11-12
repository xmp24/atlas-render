// Temas de los shorts de mapa (formato "How many X has your country...")
export type Kind = 'vhappy' | 'happy' | 'neutral' | 'serious' | 'angry' | 'demon';
export type Band = {lab: string; lo: number; hi: number; c0: string; c1: string; face: Kind};
export type Topic = {
  id: string;
  title: [string, string]; // dos líneas; *texto* = resaltado en rojo
  vals: Record<string, number | null>;
  fmt?: (v: number) => string;
  bands: Band[]; // en orden de leyenda (izquierda -> derecha)
  fun: Record<string, {txt: string[]; face?: Kind | null}>;
  noFace?: string[];
  source: string;
  usa?: boolean;
  slots?: Record<string, {n?: [number, number]; f?: [number, number]; m?: [number, number]; r?: number; fs?: number; lead?: boolean}>;
  nodata?: boolean;
  dur?: number; // segundos totales
  audio?: string;
  hook?: {a2: string; l1: string; num: number; numFmt: (v: number) => string; l2: string; swap: number; end: number};
};
const B = (lab: string, lo: number, hi: number, c0: string, c1: string, face: Kind): Band => ({lab, lo, hi, c0, c1, face});
const BLUE = ['#3b86ff', '#1f5fd8'], GREEN = ['#7ae86a', '#1fae3e'], YEL = ['#fff27a', '#ffcc00'], ORA = ['#ffb04a', '#ff6a00'], RED = ['#ff5a4a', '#a8001a'], PUR = ['#8a1cff', '#6a00c8'];

const WARS: Topic = {
  id: 'wars', title: ['How many *WARS* has', 'your country fought?'],
  vals: {RUS: 34, GBR: 30, FRA: 27, TUR: 17, DEU: 9, ITA: 9, ESP: 9, SRB: 9, GRC: 8, POL: 7, ROU: 7, AUT: 7, HUN: 6, PRT: 6, CZE: 6, BGR: 5, FIN: 5, NLD: 5, BEL: 4, EST: 4, IRL: 4, LVA: 3, LTU: 3, MNE: 3, HRV: 2, BIH: 2, DNK: 2, NOR: 2, UKR: 2, MKD: 2, ALB: 1, ISL: 1, LUX: 1, SVK: 1, SVN: 1, SWE: 1, CYP: 1, KOS: 1, CHE: 0, BLR: 0, MDA: 0, GEO: 2, ARM: 3, AZE: 4, USA: 24},
  bands: [B('0', 0, 0, BLUE[0], BLUE[0], 'vhappy'), B('1-2', 1, 2, GREEN[0], GREEN[1], 'happy'), B('3-5', 3, 5, YEL[0], YEL[1], 'neutral'), B('6-9', 6, 9, ORA[0], ORA[1], 'serious'), B('10-30', 10, 30, RED[0], RED[1], 'angry'), B('34', 34, 34, '#7a00e0', '#7a00e0', 'demon')],
  fun: {RUS: {txt: ['Number one,', 'comrade']}, USA: {txt: ['Only 24?!', 'Hold my beer']}, SWE: {txt: ['Our army', 'is IKEA']}, FIN: {txt: []}, GBR: {txt: ['Tea first,', 'then war']}, FRA: {txt: ['Surrender?', 'Never heard of it']},
    ESP: {txt: ['Siesta > war']}, DEU: {txt: ["We don't talk", 'about it']}, ITA: {txt: ['We switched', 'sides... twice']}, TUR: {txt: ['The Ottomans', 'count too']}, CHE: {txt: ['Neutral.', 'Pass the cheese']}},
  source: 'Wars since 1900 · source: war-memorial.net · incl. predecessor states (USSR, Ottoman Empire...)', usa: true,
};

const SPEND: Topic = {
  id: 'spend', title: ['How much does your country', 'spend on its *ARMY*?'],
  vals: {UKR: 39.56, RUS: 7.5, POL: 4.5, LVA: 3.61, EST: 3.37, NOR: 3.28, DNK: 3.25, LTU: 3.08, GRC: 2.99, SRB: 2.76, FIN: 2.57, SWE: 2.47, BLR: 2.4, GBR: 2.35, ROU: 2.28, DEU: 2.27, TUR: 2.2, NLD: 2.19, ESP: 2.13, HUN: 2.04, FRA: 2.03, ALB: 2.03, SVK: 2.03, HRV: 2.02, BEL: 2.01, BGR: 2.01,
    MKD: 1.97, ITA: 1.89, MNE: 1.89, KOS: 1.85, CZE: 1.84, GEO: 1.75, PRT: 1.71, CYP: 1.61, SVN: 1.54, AUT: 1.1, LUX: 0.85, CHE: 0.76, BIH: 0.73, MDA: 0.56, IRL: 0.22, ISL: 0, ARM: 6.09, AZE: 6.47, USA: 3.22},
  fmt: (v) => (v === 0 ? '0%' : v >= 10 ? `${Math.round(v)}%` : `${v.toFixed(1)}%`),
  bands: [B('<1%', 0, 0.99, BLUE[0], BLUE[1], 'vhappy'), B('1-2%', 1, 1.99, GREEN[0], GREEN[1], 'happy'), B('2-2.5%', 2, 2.49, YEL[0], YEL[1], 'neutral'), B('2.5-3.5%', 2.5, 3.49, ORA[0], ORA[1], 'serious'), B('3.5-10%', 3.5, 10, RED[0], RED[1], 'angry'), B('40%', 39, 40, '#7a00e0', '#7a00e0', 'demon')],
  fun: {IRL: {txt: ['Defence?', 'We have rain']}, CHE: {txt: ['Our army is', 'a pocket knife']}, ISL: {txt: ['No army.', 'Just vibes']}, USA: {txt: ['Pay up,', 'Europe!']}, POL: {txt: ['We know our', 'neighbours']},
    FRA: {txt: ['Exactly 2%.', 'Happy now?']}, DEU: {txt: []}, ITA: {txt: ['Pasta budget', 'is bigger']}, ESP: {txt: ['2%? Close', 'enough']}, GBR: {txt: ['Still cheaper', 'than tea']}, RUS: {txt: []}},
  noFace: ['UKR'],
  slots: {POL: {m: [760, 985]}, ESP: {m: [455, 1446]}},
  source: 'Military spending as % of GDP (2025) · source: SIPRI / NATO estimates · Iceland has no army', usa: true,
};

const BATTLES: Topic = {
  id: 'battles', title: ['Which country *WON*', 'the most *BATTLES*?'],
  vals: {FRA: 1115, GBR: 1105, DEU: 560, RUS: 491, ESP: 387, POL: 344, TUR: 210, AUT: 209, SWE: 165, ITA: 132, USA: 833},
  bands: [B('100+', 100, 199, GREEN[0], GREEN[1], 'happy'), B('200+', 200, 399, YEL[0], YEL[1], 'neutral'), B('400+', 400, 599, ORA[0], ORA[1], 'serious'), B('600+', 600, 1110, RED[0], RED[1], 'angry'), B('1115', 1115, 1115, '#7a00e0', '#7a00e0', 'demon')],
  fun: {FRA: {txt: ['Surrender jokes?', 'Check the stats']}, GBR: {txt: ['Only 10 behind', '...for now']}, USA: {txt: ['Give us', 'some time']}, DEU: {txt: ['No comment']}, ESP: {txt: ['The Armada', 'had a bad day']},
    ITA: {txt: ["Rome doesn't", 'count?!']}, SWE: {txt: ['Vikings not', 'included']}, POL: {txt: []}, RUS: {txt: []}, TUR: {txt: ['Ottomans', 'did the work']}},
  slots: {DEU: {f: [640, 1058], n: [712, 1100], m: [668, 1160]}, POL: {f: [800, 1048], n: [830, 1112], r: 28}},
  source: 'Battles won in history · source: Cottereau battle analysis (2019, Wikipedia lists) · grey = not in the top 15', usa: true,
};

const INVADED: Topic = {
  id: 'invaded', title: ['When was your country', 'last *INVADED*?'],
  vals: {RUS: 2024, UKR: 2022, GEO: 2008, GBR: 1982, ESP: 1975, CYP: 1974, CZE: 1968, SVK: 1968, PRT: 1961, NLD: 1961, HUN: 1956, DEU: 1945, AUT: 1945, BGR: 1945, ROU: 1944, ITA: 1943, SRB: 1941, SVN: 1941, HRV: 1941, BIH: 1941, MKD: 1941, MNE: 1941, KOS: 1941, GRC: 1941, BLR: 1941,
    BEL: 1940, LUX: 1940, FRA: 1940, DNK: 1940, NOR: 1940, EST: 1940, LVA: 1940, LTU: 1940, ISL: 1940, POL: 1939, FIN: 1939, ALB: 1939, TUR: 1919, ARM: 1920, AZE: 1920, SWE: 1808, CHE: 1798, IRL: 1649, MDA: null, USA: 1942},
  bands: [B('<1800', 1600, 1799, BLUE[0], BLUE[1], 'vhappy'), B('1800s', 1800, 1899, GREEN[0], GREEN[1], 'happy'), B('1900-39', 1900, 1939, YEL[0], YEL[1], 'neutral'), B('1940s', 1940, 1949, ORA[0], ORA[1], 'serious'), B('1950-99', 1950, 1999, RED[0], RED[1], 'angry'), B('2000+', 2000, 2026, '#7a00e0', '#6a00c8', 'angry')],
  fun: {IRL: {txt: ['1649. Cromwell.', 'We remember']}, CHE: {txt: ['Napoleon.', 'Never again']}, SWE: {txt: ['Last visitor:', 'Russia, 1808']}, ISL: {txt: ['The UK invaded us.', 'Politely']}, GBR: {txt: ['Argentina, 1982.', 'Nice try']},
    POL: {txt: ['Twice.', 'Same month']}, FRA: {txt: ["Let's not talk", 'about 1940']}, ITA: {txt: ['The Allies came.', 'We said ciao']}, USA: {txt: ['Japan, 1942', '(Alaska)']}, DEU: {txt: []}},
  noFace: ['RUS', 'UKR'],
  slots: {SWE: {m: [612, 690], n: [725, 790]}, POL: {m: [760, 985]}, ITA: {m: [672, 1402]}, ISL: {m: [392, 722]}},
  source: 'Last time each country was invaded · source: Brilliant Maps (incl. overseas territories)', usa: true,
};

const PEACE: Topic = {
  id: 'peace', title: ['How many *YEARS OF PEACE*', 'has your country had?'],
  vals: {ISL: 1000, SWE: 217, CHE: 179, PRT: 179, IRL: 103, ESP: 87, BGR: 82, BLR: 81, POL: 81, LTU: 81, LVA: 81, EST: 81, FIN: 81, NOR: 81, DNK: 81, GBR: 81, FRA: 81, BEL: 81, NLD: 81, LUX: 81, DEU: 81, AUT: 81, ITA: 81, CZE: 81, SVK: 81, ROU: 81, ALB: 81,
    GRC: 77, HUN: 70, CYP: 52, SVN: 35, MDA: 34, HRV: 31, BIH: 31, SRB: 27, KOS: 27, MNE: 27, MKD: 25, GEO: 18, ARM: 3, AZE: 3, TUR: 1, RUS: 0, UKR: 0},
  fmt: (v) => (v >= 1000 ? '∞' : `${v}`),
  bands: [B('200+', 200, 1000, BLUE[0], BLUE[1], 'vhappy'), B('100+', 100, 199, GREEN[1], GREEN[0], 'happy'), B('80+', 80, 99, YEL[1], YEL[0], 'neutral'), B('31-79', 31, 79, ORA[1], ORA[0], 'serious'), B('1-30', 1, 30, RED[1], RED[0], 'angry'), B('0', 0, 0, '#7a00e0', '#7a00e0', 'angry')],
  fun: {ISL: {txt: ['Never had a war.', 'Just volcanoes']}, SWE: {txt: ['Last war:', 'Napoleon era']}, CHE: {txt: ['Neutral', 'since 1847']}, PRT: {txt: ['Chilling', 'since 1847']}, IRL: {txt: ['1923. Long', 'time ago']},
    ESP: {txt: ['1939.', 'Never again']}, GBR: {txt: ['Quiet since', 'the Blitz']}, GRC: {txt: []}, DEU: {txt: []}, FRA: {txt: []}},
  noFace: ['RUS', 'UKR'],
  slots: {SWE: {m: [612, 690]}},
  source: 'Years since the last war fought on its own territory (approx.) · Atlas of War research', usa: false,
};

const BASES: Topic = {
  id: 'bases', title: ['How many *US BASES*', 'are in your country?'],
  vals: {DEU: 7, ITA: 7, GBR: 5, POL: 5, ROU: 3, GRC: 3, BEL: 2, HUN: 2, ESP: 2, TUR: 2, LTU: 2, BGR: 2, NOR: 1, PRT: 1, ISL: 1, LVA: 1, EST: 1, KOS: 1, CYP: 1, DNK: 1,
    FRA: 0, NLD: 0, CHE: 0, AUT: 0, IRL: 0, SWE: 0, FIN: 0, CZE: 0, SVK: 0, SVN: 0, HRV: 0, BIH: 0, SRB: 0, MNE: 0, ALB: 0, MKD: 0, LUX: 0, MDA: 0, UKR: 0, BLR: 0, RUS: 0, GEO: 0, ARM: 0, AZE: 0},
  bands: [B('0', 0, 0, BLUE[0], BLUE[0], 'vhappy'), B('1', 1, 1, GREEN[0], GREEN[0], 'happy'), B('2', 2, 2, YEL[1], YEL[1], 'neutral'), B('3-4', 3, 4, ORA[0], ORA[1], 'serious'), B('5-6', 5, 6, RED[0], RED[1], 'angry'), B('7', 7, 7, '#7a00e0', '#7a00e0', 'demon')],
  fun: {FRA: {txt: ['Non merci', '(since 1966)']}, DEU: {txt: ['7 bases.', 'Send help']}, ITA: {txt: ['They came for pizza.', 'Never left']}, GBR: {txt: ['Special', 'relationship']}, POL: {txt: ['Please,', 'MORE']},
    ESP: {txt: ['Rota says hi']}, TUR: {txt: ["Incirlik? It's", 'complicated']}, CHE: {txt: ['Neutral,', 'remember?']}, SWE: {txt: ['New in NATO.', 'Still 0']}, RUS: {txt: ['Not today']}},
  slots: {POL: {m: [760, 985]}, SWE: {m: [612, 690]}},
  source: 'Major US military sites (2024) · source: Congressional Research Service report R48123', usa: false,
};

const BUNKERS: Topic = {
  id: 'bunkers', title: ['How many *BUNKERS* does', 'your country have?'],
  vals: {CHE: 368814, ALB: 173371, SWE: 64500, FIN: 51500, POL: 36000, NOR: 22500, UKR: 22193, RUS: 16224, DNK: 11637, ROU: 5807, CZE: 4268, TUR: 4171, SRB: 3472, HUN: 2931, BLR: 2840, AUT: 2663, SVK: 2182, BGR: 2093, HRV: 2034, BIH: 1650, ITA: 1206, SVN: 1044, MKD: 1042, AZE: 1002, KOS: 897, LTU: 836, FRA: 671, GBR: 668, ARM: 592, DEU: 579, LVA: 574, GRC: 536, ESP: 471, EST: 398, GEO: 372, NLD: 347, MNE: 311, MDA: 266, BEL: 230, CYP: 120, PRT: 103, LUX: 31, IRL: 25, ISL: 0},
  fmt: (v) => (v >= 9950 ? `${Math.round(v / 1000)}K` : v >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${v}`),
  bands: [B('<1K', 0, 999, BLUE[0], BLUE[1], 'vhappy'), B('1-5K', 1000, 4999, GREEN[0], GREEN[1], 'happy'), B('5-20K', 5000, 19999, YEL[0], YEL[1], 'neutral'), B('20-60K', 20000, 59999, ORA[0], ORA[1], 'serious'), B('60-200K', 60000, 199999, RED[0], RED[1], 'angry'), B('369K', 300000, 400000, '#7a00e0', '#7a00e0', 'demon')],
  fun: {CHE: {txt: ['Neutral...', 'but READY']}, ALB: {txt: ['Paranoid?', 'Us?']}, SWE: {txt: ['Very', 'lagom']}, FIN: {txt: []}, NOR: {txt: ['Fjords count', 'too']},
    POL: {txt: []}, ISL: {txt: ['Zero.', 'We have volcanoes']}, ESP: {txt: ['A cellar', 'counts?']}, GBR: {txt: ['Keep calm', 'and hide under a table']}, DEU: {txt: []}},
  slots: {ALB: {f: [829, 1396], n: [776, 1482], m: [776, 1540], r: 15, fs: 84, lead: true}, CHE: {n: [612, 1500], m: [612, 1560], fs: 84, r: 18, lead: true}, POL: {f: [800, 1048], n: [834, 1110], m: [760, 985], r: 28}, DEU: {f: [650, 1052], n: [690, 1112], m: [640, 1162]}, SWE: {m: [612, 690]}, NOR: {m: [548, 905]}},
  noFace: ['RUS', 'UKR'], 
  source: 'Bunkers & shelters (approx.) · average of published figures, estimates where no data · details in description',
};

export const TOPICS: Record<string, Topic> = {bunkers: BUNKERS, wars: WARS, spend: SPEND, battles: BATTLES, invaded: INVADED, peace: PEACE, bases: BASES};
