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


const WW3: Topic = {
  id: 'ww3', title: ['How *SAFE* is your country', 'if *WW3* starts?'],
  vals: {CHE: 92, IRL: 90, ISL: 86, PRT: 84, AUT: 80, ESP: 76, MLT: 80, SVN: 72, ALB: 70, ITA: 62, HRV: 66, MNE: 66, MKD: 64, BIH: 60, GRC: 60, SWE: 52, SRB: 56, LUX: 50, CYP: 46, HUN: 44, NOR: 46, DNK: 44, NLD: 40, CZE: 40, SVK: 34, BGR: 36,
    FRA: 32, BEL: 30, TUR: 30, ARM: 30, AZE: 30, KOS: 50, DEU: 24, GBR: 22, ROU: 24, FIN: 26, GEO: 20, MDA: 14, POL: 14, LTU: 8, LVA: 8, EST: 7, BLR: 5, RUS: 4, UKR: 3, USA: 34},
  fmt: (v) => `${v}%`,
  bands: [B('80%+', 80, 100, BLUE[0], BLUE[1], 'vhappy'), B('60-79%', 60, 79, GREEN[0], GREEN[1], 'happy'), B('40-59%', 40, 59, YEL[0], YEL[1], 'neutral'), B('20-39%', 20, 39, ORA[0], ORA[1], 'serious'), B('10-19%', 10, 19, RED[0], RED[1], 'angry'), B('<10%', 0, 9, '#7a00e0', '#7a00e0', 'demon')],
  fun: {CHE: {txt: ['Neutral + bunkers', '= 92%']}, IRL: {txt: ['Island. Neutral.', 'Pass the Guinness']}, ISL: {txt: ['Too far away', 'to bother']}, PRT: {txt: ['End of Europe.', 'Literally']}, ESP: {txt: ['Siesta through', 'the apocalypse']},
    GBR: {txt: ['Nuclear target', 'with tea']}, DEU: {txt: ['Right in', 'the middle']}, POL: {txt: ['First in line.', 'Again']}, FIN: {txt: ['1,340 km of', 'Russian border']}, RUS: {txt: []}, USA: {txt: ['Nuclear', 'target #1']}},
  noFace: ['RUS', 'UKR'],
  slots: {POL: {m: [760, 985]}, SWE: {m: [612, 690]}},
  source: 'Approx. safety score (Atlas of War estimate): distance to likely front, nuclear targets, neutrality, food & shelters',
  usa: true,
};

const DRAFT: Topic = {
  id: 'draft', title: ['Until what *AGE* can your', 'country *DRAFT* you?'],
  vals: {SWE: 70, FRA: 70, FIN: 65, RUS: 65, GBR: 65, UKR: 60, BLR: 60, DEU: 60, POL: 60, EST: 60, CZE: 60, SVK: 60, SRB: 60, LVA: 55, BGR: 55, HRV: 55, ALB: 55, MKD: 55, ARM: 55, DNK: 50, AUT: 50, CYP: 50, ROU: 50, SVN: 50, BIH: 50, MNE: 50, MDA: 50, AZE: 50,
    LTU: 45, ITA: 45, BEL: 45, GRC: 45, NOR: 44, TUR: 41, HUN: 40, KOS: 40, GEO: 40, LUX: 40, CHE: 37, PRT: 35, NLD: 35, ESP: 25, ISL: 0, IRL: 0, USA: 25},
  fmt: (v) => (v === 0 ? '—' : `${v}`),
  bands: [B('<40', 0, 39, BLUE[0], BLUE[1], 'vhappy'), B('40-49', 40, 49, GREEN[0], GREEN[1], 'happy'), B('50-54', 50, 54, YEL[0], YEL[1], 'neutral'), B('55-59', 55, 59, ORA[0], ORA[1], 'serious'), B('60-65', 60, 65, RED[0], RED[1], 'angry'), B('70', 66, 70, '#7a00e0', '#7a00e0', 'demon')],
  fun: {SWE: {txt: ['Total defence duty:', 'age 16 to 70']}, FRA: {txt: ['Reserve up to 70.', 'Grandpa, get up']}, FIN: {txt: []}, ESP: {txt: ['Only 19 to 25.', 'Phew']}, ISL: {txt: ['No army.', 'No draft']},
    IRL: {txt: ['Never had', 'a draft']}, USA: {txt: ['Selective Service:', '18 to 25']}, GBR: {txt: ['Recall age', 'raised to 65']}, DEU: {txt: ['Up to 60', 'in wartime']}, CHE: {txt: ['Done by 37.', 'Then cheese']}, RUS: {txt: []}, POL: {txt: []}},
  noFace: ['RUS', 'UKR'],
  slots: {POL: {m: [760, 985]}, SWE: {m: [612, 690]}},
  source: 'Max age for wartime call-up / reserve duty (men, approx.) · national laws; estimates where unclear',
  usa: true,
};

const CYBER: Topic = {
  id: 'cyber', title: ['How many *CYBERATTACKS* hit', 'your country every week?'],
  vals: {UKR: 2950, RUS: 2600, ITA: 2350, PRT: 2250, TUR: 2050, GRC: 2000, ESP: 1950, AZE: 1900, POL: 1850, GEO: 1800, BLR: 1750, ARM: 1750, BEL: 1700, MDA: 1700, ROU: 1650, CZE: 1600, SRB: 1600, ALB: 1600, BGR: 1600, CYP: 1600,
    GBR: 1550, LTU: 1550, NLD: 1500, EST: 1500, SVK: 1500, BIH: 1500, MKD: 1500, DEU: 1450, FRA: 1450, HUN: 1450, HRV: 1450, MNE: 1450, AUT: 1400, LVA: 1400, KOS: 1400, IRL: 1350, CHE: 1300, SVN: 1300, LUX: 1300, NOR: 1250, SWE: 1200, DNK: 1150, FIN: 1100, ISL: 900, USA: 1450},
  fmt: (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${v}`),
  bands: [B('<1.2K', 0, 1199, BLUE[0], BLUE[1], 'vhappy'), B('1.2-1.4K', 1200, 1399, GREEN[0], GREEN[1], 'happy'), B('1.4-1.6K', 1400, 1599, YEL[0], YEL[1], 'neutral'), B('1.6-2K', 1600, 1999, ORA[0], ORA[1], 'serious'), B('2-2.5K', 2000, 2499, RED[0], RED[1], 'angry'), B('2.5K+', 2500, 3000, '#7a00e0', '#7a00e0', 'demon')],
  fun: {UKR: {txt: []}, RUS: {txt: []}, ITA: {txt: ['Password:', 'pizza123']}, PRT: {txt: ['Most hit', 'in the West']}, ISL: {txt: ['Hackers get lost', 'in the snow']}, FIN: {txt: []},
    ESP: {txt: ['Hackers', 'love siesta']}, DEU: {txt: ['Still using', 'fax. Safe']}, GBR: {txt: ['Keep calm and', 'change password']}, USA: {txt: ['Hold my', 'firewall']}, SWE: {txt: []}, TUR: {txt: []}},
  noFace: ['UKR'],
  slots: {POL: {m: [760, 985]}, SWE: {m: [612, 690]}},
  source: 'Avg. weekly cyberattacks per organization (2025, approx.) · Check Point Research regional data + estimates',
  usa: true,
};

const SL = {POL: {m: [760, 985] as [number, number]}, SWE: {m: [612, 690] as [number, number]}};
const IQ: Topic = {
  id: 'iq', title: ['What is the average *IQ*', 'in your country?'],
  vals: {DEU: 100, NLD: 100, FIN: 100, CHE: 99, LUX: 99, SWE: 99, BEL: 99, AUT: 99, ISL: 99, GBR: 99, EST: 99, DNK: 98, NOR: 98, POL: 98, CZE: 98, HUN: 98, ITA: 97, FRA: 97, ESP: 97, SVN: 97, SVK: 97, LVA: 97, HRV: 97, RUS: 97, LTU: 96, IRL: 96, BLR: 96, MLT: 96,
    UKR: 95, PRT: 94, BIH: 93, BGR: 93, ARM: 93, GRC: 92, ROU: 92, MKD: 91, MDA: 91, CYP: 91, SRB: 90, MNE: 89, TUR: 89, GEO: 86, ALB: 85, AZE: 85, KOS: 84, USA: 98},
  bands: [B('<88', 80, 87, '#7a00e0', '#7a00e0', 'serious'), B('88-91', 88, 91, RED[0], RED[1], 'serious'), B('92-94', 92, 94, ORA[0], ORA[1], 'neutral'), B('95-96', 95, 96, YEL[0], YEL[1], 'neutral'), B('97-98', 97, 98, GREEN[0], GREEN[1], 'happy'), B('99+', 99, 101, BLUE[0], BLUE[1], 'vhappy')],
  fun: {DEU: {txt: ['Engineered', 'brains']}, ITA: {txt: ['Pasta-powered']}, ESP: {txt: ['Smart enough', 'for siesta']}, USA: {txt: ['Freedom', 'IQ']}, GBR: {txt: ['Tea helps']}, FIN: {txt: []}, CHE: {txt: ['Neutral', 'and nerdy']}, POL: {txt: []}, ISL: {txt: ['Cold =', 'more thinking']}},
  slots: SL, usa: true,
  source: 'Average national IQ (approx.) · Lynn & Becker (2019) estimates · these figures are highly debated',
};
const HEIGHT: Topic = {
  id: 'height', title: ['How *TALL* are men', 'in your country?'],
  vals: {NLD: 183.8, MNE: 183.3, EST: 182.8, BIH: 181.4, DNK: 181.4, ISL: 181, CZE: 181, LVA: 181, LTU: 181, BEL: 181.7, SRB: 180.6, HRV: 180.5, SVN: 180.3, SVK: 180, NOR: 180, FIN: 180, SWE: 180, DEU: 180, POL: 180, UKR: 179, BLR: 179, AUT: 179, LUX: 179, KOS: 179, IRL: 178.9,
    CHE: 178, GRC: 178, BGR: 178, MKD: 178, ITA: 177.8, GBR: 177.5, FRA: 177, HUN: 177, CYP: 177, ESP: 176.6, RUS: 176.5, MDA: 176, TUR: 176, GEO: 176, ROU: 175, ARM: 175, ALB: 174, PRT: 173.9, MLT: 173, AZE: 172, USA: 177},
  fmt: (v) => `${Math.round(v)}`,
  bands: [B('<175', 160, 174.9, BLUE[0], BLUE[1], 'vhappy'), B('175-177', 175, 176.9, GREEN[0], GREEN[1], 'happy'), B('177-179', 177, 178.9, YEL[0], YEL[1], 'neutral'), B('179-181', 179, 180.9, ORA[0], ORA[1], 'serious'), B('181-183', 181, 182.9, RED[0], RED[1], 'angry'), B('183+', 183, 190, '#7a00e0', '#7a00e0', 'demon')],
  fun: {PRT: {txt: ['Short but', 'happy']}, USA: {txt: ['177 cm.', 'In feet: 5’9’’']}, ESP: {txt: ['Siesta stunts', 'growth']}, DEU: {txt: []}, ITA: {txt: ['Shoes add', '+3 cm']}, GBR: {txt: []}, SWE: {txt: []}, TUR: {txt: []}, ISL: {txt: ['Viking genes']}},
  slots: SL, usa: true,
  source: 'Average height of men, cm (approx.) · NCD-RisC / national surveys · Netherlands & Montenegro = tallest',
};
const LIFE: Topic = {
  id: 'life', title: ['How *LONG* do people live', 'in your country?'],
  vals: {CHE: 84, ESP: 84, ITA: 83.5, ISL: 83, NOR: 83, SWE: 83, LUX: 83, FRA: 83, MLT: 83, IRL: 82.6, CYP: 82, PRT: 82, NLD: 82, BEL: 82, AUT: 82, FIN: 82, DNK: 82, GRC: 81.5, SVN: 81.5, DEU: 81, GBR: 81,
    CZE: 79.5, ALB: 79.5, EST: 79, POL: 78.5, HRV: 78.5, TUR: 78, SVK: 78, MNE: 77, HUN: 77, BIH: 77, MKD: 76.5, SRB: 76.5, LTU: 76.5, KOS: 76, ROU: 76, LVA: 75.5, BGR: 75.5, ARM: 75, GEO: 74, AZE: 74, BLR: 74, RUS: 73, MDA: 72, UKR: 71, USA: 78.4},
  fmt: (v) => `${Math.round(v)}`,
  bands: [B('<74', 60, 73.9, '#7a00e0', '#7a00e0', 'demon'), B('74-76', 74, 75.9, RED[0], RED[1], 'angry'), B('76-78', 76, 77.9, ORA[0], ORA[1], 'serious'), B('78-80', 78, 79.9, YEL[0], YEL[1], 'neutral'), B('80-82', 80, 81.9, GREEN[0], GREEN[1], 'happy'), B('82+', 82, 90, BLUE[0], BLUE[1], 'vhappy')],
  fun: {ESP: {txt: ['Olive oil', 'works']}, CHE: {txt: ['Chocolate', 'works too']}, ITA: {txt: ['Nonna', 'approved']}, USA: {txt: ['78. Healthcare', 'not included']}, RUS: {txt: []}, DEU: {txt: []}, GBR: {txt: []}, POL: {txt: []}, ISL: {txt: ['Fish + fresh air']}},
  slots: SL, usa: true,
  source: 'Life expectancy at birth, years (approx., 2023) · WHO / Eurostat / World Bank',
};
const FIRST: Topic = {
  id: 'first', title: ['At what *AGE* do people lose', 'their *VIRGINITY*?'],
  vals: {ISL: 15.6, DEU: 15.9, DNK: 16.1, SWE: 16.2, AUT: 16.3, NOR: 16.5, FIN: 16.5, CZE: 16.5, BGR: 16.5, GBR: 16.5, RUS: 16.9, NLD: 17, CHE: 17, SVN: 17, LUX: 17, FRA: 17.2, GRC: 17.2, EST: 17.2, BEL: 17.3, IRL: 17.3, SVK: 17.3, PRT: 17.4, HUN: 17.4, SRB: 17.4, UKR: 17.4,
    ESP: 17.5, LVA: 17.5, BLR: 17.5, ITA: 17.6, ROU: 17.6, HRV: 17.6, POL: 18, TUR: 18, LTU: 18, BIH: 18, MNE: 18, CYP: 18, MKD: 18.3, ALB: 18.5, MDA: 18.5, KOS: 19, GEO: 20.5, ARM: 21, AZE: 21, MLT: 18.5, USA: 17},
  fmt: (v) => v.toFixed(1),
  bands: [B('<16.5', 15, 16.49, BLUE[0], BLUE[1], 'vhappy'), B('16.5-17', 16.5, 16.99, GREEN[0], GREEN[1], 'happy'), B('17-17.4', 17, 17.49, YEL[0], YEL[1], 'neutral'), B('17.5-17.9', 17.5, 17.99, ORA[0], ORA[1], 'serious'), B('18-19', 18, 19.99, RED[0], RED[1], 'angry'), B('20+', 20, 25, '#7a00e0', '#7a00e0', 'demon')],
  fun: {},
  slots: SL, usa: true,
  source: 'Average age at first sexual experience (approx.) · Durex Global Sex Survey + national surveys',
};
const MARRY: Topic = {
  id: 'marry', title: ['At what *AGE* do people', '*MARRY* in your country?'],
  vals: {ESP: 37, IRL: 36, SWE: 35, ITA: 35, PRT: 35, FRA: 35, ISL: 35, NLD: 34, BEL: 34, LUX: 34, DNK: 34, NOR: 34, DEU: 33, FIN: 33, GBR: 33, SVN: 33, GRC: 33, CHE: 32, AUT: 32, MLT: 32, CZE: 31, EST: 31, HUN: 31, SVK: 31, CYP: 31,
    HRV: 30.5, LVA: 30, BGR: 30, SRB: 30, POL: 29, LTU: 29, ROU: 29, MNE: 29, BIH: 28, MKD: 28, ALB: 27, KOS: 27, MDA: 27, GEO: 27, ARM: 27, UKR: 26, BLR: 26, RUS: 26, TUR: 26, AZE: 25, USA: 29},
  fmt: (v) => `${Math.round(v)}`,
  bands: [B('<27', 20, 26.9, BLUE[0], BLUE[1], 'vhappy'), B('27-28', 27, 28.9, GREEN[0], GREEN[1], 'happy'), B('29-30', 29, 30.9, YEL[0], YEL[1], 'neutral'), B('31-32', 31, 32.9, ORA[0], ORA[1], 'serious'), B('33-34', 33, 34.9, RED[0], RED[1], 'angry'), B('35+', 35, 40, '#7a00e0', '#7a00e0', 'demon')],
  fun: {ESP: {txt: ['37?! Mum is', 'still waiting']}, ITA: {txt: ['Still living', 'with mamma']}, IRL: {txt: ['After the', 'pub closes']}, TUR: {txt: ['Grandma', 'is happy']}, USA: {txt: ['Vegas', 'speed']}, SWE: {txt: ['Why marry?', 'Sambo life']}, RUS: {txt: []}, DEU: {txt: []}, POL: {txt: []}},
  slots: SL, usa: true,
  source: 'Average age at first marriage, men & women (approx.) · Eurostat / UN data',
};
const DIVORCE: Topic = {
  id: 'divorce', title: ['How many marriages end', 'in *DIVORCE*?'],
  vals: {PRT: 64, LUX: 60, RUS: 58, ESP: 57, UKR: 55, EST: 52, FRA: 51, BEL: 50, LVA: 50, LTU: 50, BLR: 50, FIN: 48, SWE: 47, CYP: 47, DNK: 45, CZE: 45, MDA: 45, GBR: 42, AUT: 40, CHE: 40, NLD: 39, NOR: 39, HUN: 38, ISL: 37, ITA: 37, SVK: 37, DEU: 36, SVN: 35,
    POL: 33, BGR: 33, GRC: 30, GEO: 30, HRV: 25, ROU: 25, ARM: 25, AZE: 25, TUR: 25, SRB: 20, ALB: 20, IRL: 15, MLT: 15, MNE: 15, BIH: 10, MKD: 10, KOS: 10, USA: 45},
  fmt: (v) => `${v}%`,
  bands: [B('<20%', 0, 19, BLUE[0], BLUE[1], 'vhappy'), B('20-34%', 20, 34, GREEN[0], GREEN[1], 'happy'), B('35-44%', 35, 44, YEL[0], YEL[1], 'neutral'), B('45-54%', 45, 54, ORA[0], ORA[1], 'serious'), B('55-59%', 55, 59, RED[0], RED[1], 'angry'), B('60%+', 60, 100, '#7a00e0', '#7a00e0', 'demon')],
  fun: {PRT: {txt: ['Love is', 'temporary']}, ESP: {txt: ['Drama level:', 'telenovela']}, IRL: {txt: ['Divorce legal', 'only since 1996']}, ITA: {txt: ['Mamma says', 'no divorce']}, USA: {txt: ['Vegas wedding,', 'Vegas divorce']}, POL: {txt: []}, DEU: {txt: []}, GBR: {txt: []}},
  slots: SL, usa: true,
  source: 'Divorces per 100 marriages (approx., recent years) · Eurostat / national statistics',
};
const HAPPY: Topic = {
  id: 'happy', title: ['How *HAPPY* is', 'your country?'],
  vals: {FIN: 7.7, DNK: 7.5, ISL: 7.5, SWE: 7.3, NLD: 7.3, NOR: 7.3, LUX: 7.1, CHE: 6.9, BEL: 6.9, IRL: 6.9, CZE: 6.9, KOS: 6.9, LTU: 6.8, AUT: 6.8, SVN: 6.8, DEU: 6.8, GBR: 6.7, FRA: 6.6, ROU: 6.6, POL: 6.5, ESP: 6.5, EST: 6.4, SRB: 6.4, MLT: 6.4, ITA: 6.4,
    SVK: 6.2, LVA: 6.2, HRV: 6.1, HUN: 6.1, PRT: 6.0, CYP: 6.0, MDA: 6.0, GRC: 5.9, RUS: 5.9, MNE: 5.8, BIH: 5.8, BLR: 5.8, BGR: 5.6, MKD: 5.4, ALB: 5.4, ARM: 5.4, GEO: 5.1, UKR: 4.9, TUR: 4.9, AZE: 4.9, USA: 6.7},
  fmt: (v) => v.toFixed(1),
  bands: [B('<5', 0, 4.99, '#7a00e0', '#7a00e0', 'demon'), B('5-5.4', 5, 5.49, RED[0], RED[1], 'angry'), B('5.5-5.9', 5.5, 5.99, ORA[0], ORA[1], 'serious'), B('6-6.4', 6, 6.49, YEL[0], YEL[1], 'neutral'), B('6.5-6.9', 6.5, 6.99, GREEN[0], GREEN[1], 'happy'), B('7+', 7, 10, BLUE[0], BLUE[1], 'vhappy')],
  fun: {FIN: {txt: []}, DNK: {txt: []}, ISL: {txt: ['Hot springs', 'help']}, TUR: {txt: ['Inflation', 'says hi']}, ESP: {txt: ['Happy? Sí,', 'after siesta']}, GBR: {txt: ['Mustn’t', 'grumble']}, USA: {txt: ['Happy-ish']}, ITA: {txt: []}, POL: {txt: []}, SWE: {txt: []}},
  slots: SL, usa: true,
  source: 'Happiness score out of 10 (approx.) · World Happiness Report 2025',
};
const OBESE: Topic = {
  id: 'obese', title: ['How many adults are', '*OBESE* in your country?'],
  vals: {TUR: 32, MLT: 29, GBR: 28, HUN: 27, MNE: 26, LTU: 26, RUS: 26, IRL: 25, CZE: 25, BGR: 25, BLR: 25, SRB: 24, HRV: 24, UKR: 24, GRC: 23, POL: 23, LVA: 23, ESP: 23, FIN: 23, MKD: 23, GEO: 23, ISL: 22, EST: 22, ROU: 22, DEU: 22, SVN: 22, ALB: 22, AZE: 22,
    SVK: 21, PRT: 21, NOR: 21, LUX: 21, BIH: 21, MDA: 21, CYP: 21, KOS: 20, ARM: 20, BEL: 19, AUT: 19, SWE: 19, FRA: 18, NLD: 18, DNK: 18, ITA: 17, CHE: 12, USA: 42},
  fmt: (v) => `${v}%`,
  bands: [B('<18%', 0, 17.9, BLUE[0], BLUE[1], 'vhappy'), B('18-20%', 18, 20.9, GREEN[0], GREEN[1], 'happy'), B('21-23%', 21, 23.9, YEL[0], YEL[1], 'neutral'), B('24-26%', 24, 26.9, ORA[0], ORA[1], 'serious'), B('27-30%', 27, 29.9, RED[0], RED[1], 'angry'), B('30%+', 30, 50, '#7a00e0', '#7a00e0', 'demon')],
  fun: {USA: {txt: ['42%.', 'Supersize me']}, ITA: {txt: ['Pasta, but', 'make it walk']}, CHE: {txt: ['Mountains', 'keep us fit']}, GBR: {txt: ['Fish & chips', 'strikes back']}, TUR: {txt: ['Kebab', 'power']}, FRA: {txt: ['Small portions,', 'big wine']}, POL: {txt: []}, DEU: {txt: []}},
  slots: SL, usa: true,
  source: 'Adults with obesity, % (approx., 2022) · WHO / NCD-RisC',
};
const BILL: Topic = {
  id: 'bill', title: ['How many *BILLIONAIRES*', 'live in your country?'],
  vals: {DEU: 171, RUS: 140, ITA: 74, GBR: 55, FRA: 53, SWE: 43, CHE: 40, TUR: 35, ESP: 30, NOR: 15, NLD: 13, POL: 13, CZE: 12, AUT: 10, DNK: 10, BEL: 10, GRC: 10, IRL: 9, FIN: 8, UKR: 6, CYP: 6, PRT: 4, HUN: 4, LUX: 4,
    ROU: 2, EST: 2, HRV: 2, BGR: 2, ISL: 1, LVA: 1, LTU: 1, SVK: 1, SVN: 1, GEO: 1, ARM: 1, SRB: 0, AZE: 0, BLR: 0, MDA: 0, ALB: 0, BIH: 0, MNE: 0, MKD: 0, KOS: 0, MLT: 0, USA: 902},
  bands: [B('0', 0, 0, BLUE[0], BLUE[0], 'vhappy'), B('1-5', 1, 5, GREEN[0], GREEN[1], 'happy'), B('6-15', 6, 15, YEL[0], YEL[1], 'neutral'), B('16-50', 16, 50, ORA[0], ORA[1], 'serious'), B('51-150', 51, 150, RED[0], RED[1], 'angry'), B('150+', 151, 1000, '#7a00e0', '#7a00e0', 'demon')],
  fun: {USA: {txt: ['902.', 'Not a typo']}, DEU: {txt: ['Old money,', 'new cars']}, RUS: {txt: ['Oligarchs', 'count?']}, ITA: {txt: ['Fashion', 'pays']}, ESP: {txt: ['Zara made', 'a few']}, SWE: {txt: ['IKEA, Spotify,', 'H&M...']}, CHE: {txt: ['They just', 'moved here']}, ISL: {txt: ['Just one']}, POL: {txt: []}},
  slots: SL, usa: true,
  source: 'Number of billionaires (approx.) · Forbes World’s Billionaires List 2025',
};
const TAX: Topic = {
  id: 'tax', title: ['How much *TAX* do the rich', 'pay in your country?'],
  vals: {FIN: 57, DNK: 56, FRA: 55, AUT: 55, BEL: 53, PRT: 53, SWE: 52, SVN: 50, NLD: 49.5, IRL: 48, DEU: 47.5, ITA: 47, ESP: 47, NOR: 47, ISL: 46, LUX: 46, GBR: 45, GRC: 44, CHE: 40, TUR: 40, POL: 36, CYP: 35, MLT: 35, HRV: 35, LTU: 32, LVA: 31,
    SVK: 25, AZE: 25, SRB: 25, CZE: 23, ALB: 23, UKR: 23, EST: 22, RUS: 22, GEO: 20, ARM: 20, BLR: 20, MKD: 18, HUN: 15, MNE: 15, MDA: 12, ROU: 10, BGR: 10, BIH: 10, KOS: 10, USA: 37},
  fmt: (v) => `${Math.round(v)}%`,
  bands: [B('<15%', 0, 14.9, BLUE[0], BLUE[1], 'vhappy'), B('15-24%', 15, 24.9, GREEN[0], GREEN[1], 'happy'), B('25-34%', 25, 34.9, YEL[0], YEL[1], 'neutral'), B('35-44%', 35, 44.9, ORA[0], ORA[1], 'serious'), B('45-52%', 45, 52.9, RED[0], RED[1], 'angry'), B('53%+', 53, 70, '#7a00e0', '#7a00e0', 'demon')],
  fun: {FIN: {txt: []}, BGR: {txt: []}, FRA: {txt: ['The state', 'says merci']}, USA: {txt: ['+ state tax', 'surprise']}, CHE: {txt: ['Depends on', 'the canton']}, ITA: {txt: []}, ESP: {txt: ['Hacienda', 'somos todos']}, DEU: {txt: []}, GBR: {txt: []}, POL: {txt: []}},
  slots: SL, usa: true,
  source: 'Top personal income tax rate, % (approx., 2025) · OECD / Tax Foundation / national rates',
};
const RETIRE: Topic = {
  id: 'retire', title: ['At what *AGE* can you', '*RETIRE* in your country?'],
  vals: {DNK: 67, ITA: 67, GRC: 67, ISL: 67, NOR: 67, NLD: 67, DEU: 66, ESP: 66.5, PRT: 66.5, IRL: 66, GBR: 66, SWE: 66, MNE: 66, BEL: 65, FIN: 65, CHE: 65, AUT: 65, LUX: 65, POL: 65, HUN: 65, SVN: 65, HRV: 65, LVA: 65, ROU: 65, SRB: 65, BIH: 65, ALB: 65.5, KOS: 65,
    GEO: 65, AZE: 65, CYP: 65, EST: 64.8, BGR: 64.6, CZE: 64.5, LTU: 64.5, RUS: 64, MKD: 64, MLT: 64, SVK: 63, MDA: 63.5, BLR: 63, ARM: 63, FRA: 62.8, UKR: 60, TUR: 60, USA: 67},
  fmt: (v) => (Number.isInteger(v) ? `${v}` : v.toFixed(1)),
  bands: [B('<62', 50, 61.9, BLUE[0], BLUE[1], 'vhappy'), B('62-63', 62, 63.9, GREEN[0], GREEN[1], 'happy'), B('64', 64, 64.9, YEL[0], YEL[1], 'neutral'), B('65', 65, 65.9, ORA[0], ORA[1], 'serious'), B('66', 66, 66.9, RED[0], RED[1], 'angry'), B('67+', 67, 75, '#7a00e0', '#7a00e0', 'demon')],
  fun: {FRA: {txt: ['62.8 and', 'still protesting']}, ITA: {txt: ['67. Mamma mia']}, TUR: {txt: []}, USA: {txt: ['Work till', 'you drop']}, ESP: {txt: ['66.5 and', 'counting']}, GBR: {txt: []}, DEU: {txt: []}, POL: {txt: []}, ISL: {txt: ['Retire at 67,', 'then fish']}},
  slots: SL, usa: true,
  source: 'Statutory retirement age for men (approx., 2025-26) · OECD Pensions at a Glance / national laws · Denmark rising to 70',
};

export const TOPICS: Record<string, Topic> = {bunkers: BUNKERS, wars: WARS, spend: SPEND, battles: BATTLES, invaded: INVADED, peace: PEACE, bases: BASES, ww3: WW3, draft: DRAFT, cyber: CYBER, iq: IQ, height: HEIGHT, life: LIFE, first: FIRST, marry: MARRY, divorce: DIVORCE, happy: HAPPY, obese: OBESE, bill: BILL, tax: TAX, retire: RETIRE};
