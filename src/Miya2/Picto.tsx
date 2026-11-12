import React from "react";

/** solid black pictogram figures (reference style): no faces, separation gaps, pose-based */
export type PP = { lean: number; a1: number; a2: number; b1: number; b2: number; l1: number; l2: number; r1: number; r2: number; head?: number };
const S = (a: number) => Math.sin((a * Math.PI) / 180), C = (a: number) => Math.cos((a * Math.PI) / 180);
const pt = (o: [number, number], a: number, L: number): [number, number] => [o[0] + S(a) * L, o[1] + C(a) * L];

export const PO: Record<string, PP> = {
  stand: { lean: 0, a1: -8, a2: -4, b1: 8, b2: 4, l1: -5, l2: -3, r1: 5, r2: 3 },
  walkA: { lean: 4, a1: -28, a2: -10, b1: 28, b2: 50, l1: 26, l2: 10, r1: -24, r2: -40 },
  walkB: { lean: 4, a1: 24, a2: 45, b1: -24, b2: -8, l1: -24, l2: -42, r1: 26, r2: 12 },
  sneak: { lean: 18, a1: 40, a2: 90, b1: 55, b2: 100, l1: 30, l2: -20, r1: -20, r2: -45 },
  climbA: { lean: 6, a1: 170, a2: 185, b1: 160, b2: 175, l1: 70, l2: -10, r1: 10, r2: 0 },
  climbB: { lean: 8, a1: 150, a2: 170, b1: 175, b2: 190, l1: 10, l2: 0, r1: 80, r2: -20 },
  sit: { lean: -2, a1: 55, a2: 90, b1: 65, b2: 95, l1: 88, l2: 0, r1: 92, r2: 2 },
  type: { lean: 8, a1: 45, a2: 95, b1: 55, b2: 100, l1: 88, l2: 0, r1: 92, r2: 2 },
  fight: { lean: 10, a1: 120, a2: 150, b1: 80, b2: 130, l1: 25, l2: 10, r1: -20, r2: -10 },
  stab: { lean: 14, a1: 30, a2: 70, b1: 90, b2: 90, l1: 25, l2: 10, r1: -20, r2: -10 },
  reach: { lean: 8, a1: -8, a2: 0, b1: 85, b2: 88, l1: -5, l2: -3, r1: 8, r2: 3 },
  eat: { lean: 2, a1: 20, a2: 100, b1: 30, b2: 175, l1: -5, l2: -3, r1: 5, r2: 3 },
  hold: { lean: 4, a1: 25, a2: 95, b1: 35, b2: 100, l1: -5, l2: -3, r1: 5, r2: 3 },
  shock: { lean: -6, a1: 150, a2: 200, b1: 160, b2: 210, l1: -8, l2: -4, r1: 8, r2: 4, head: -6 },
  grief: { lean: 4, a1: 205, a2: 140, b1: 155, b2: 222, l1: -5, l2: -3, r1: 5, r2: 3, head: 10 },
  creep: { lean: 22, a1: 60, a2: 110, b1: 75, b2: 120, l1: 35, l2: -10, r1: -25, r2: -50 },
};

export type PK = "man" | "woman" | "boy" | "girl" | "killer";

export const Pic: React.FC<{ x: number; y: number; s?: number; k: PK; p: PP; flip?: boolean; c?: string; bg?: string; rot?: number; item?: React.ReactNode; o?: number }> = ({ x, y, s = 1, k, p, flip, c = "#0d0d0f", bg = "#d2d2d2", rot = 0, item, o = 1 }) => {
  const kid = k === "boy" || k === "girl";
  const sc = s * (kid ? 0.68 : 1);
  const HR = kid ? 30 : 27, TOR = 96, UA = 50, FA = 46, TH = 58, SH = 56, LW = kid ? 25 : 23, AW = kid ? 21 : 19;
  const hip: [number, number] = [0, 0];
  const sh = pt(hip, 180 - p.lean, TOR - 8);
  const neck = pt(hip, 180 - p.lean, TOR);
  const head = pt(neck, 180 - p.lean - (p.head ?? 0), HR + 9);
  const L = (o2: [number, number], a: number, b: number, l1: number, l2: number) => { const j = pt(o2, a, l1), e = pt(j, b, l2); return { e, d: `M${o2[0]},${o2[1]} L${j[0]},${j[1]} L${e[0]},${e[1]}` }; };
  const backLeg = L([-6, 0], p.l1, p.l2, TH, SH), frontLeg = L([6, 0], p.r1, p.r2, TH, SH);
  const backArm = L(sh, p.a1, p.a2, UA, FA), frontArm = L(sh, p.b1, p.b2, UA, FA);
  const foot = TH + SH;
  const tw = 30, hw = 22;
  const n = pt(hip, 180 - p.lean, TOR);
  const perp = [C(p.lean), S(p.lean)];
  const torso = `M${n[0] - perp[0] * tw},${n[1] - perp[1] * tw} L${n[0] + perp[0] * tw},${n[1] + perp[1] * tw} L${hip[0] + hw},${hip[1] + 6} L${hip[0] - hw},${hip[1] + 6} Z`;
  const limb = (d: string, w: number, front?: boolean) => (
    <>
      {front && <path d={d} stroke={bg} strokeWidth={w + 9} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      <path d={d} stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
  const female = k === "woman" || k === "girl";
  const skirt = pt(hip, 180 - p.lean, 46);
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${flip ? -sc : sc},${sc}) translate(0,${-foot})`} opacity={o}>
      {limb(backArm.d, AW)}
      {limb(backLeg.d, LW)}
      <path d={torso} fill={c} stroke={c} strokeWidth={10} strokeLinejoin="round" />
      {female && <path d={`M${skirt[0] - 22},${skirt[1]} L${skirt[0] + 22},${skirt[1]} L${hip[0] + 44},${hip[1] + 52} L${hip[0] - 44},${hip[1] + 52} Z`} fill={c} stroke={c} strokeWidth={6} strokeLinejoin="round" />}
      {limb(frontLeg.d, LW, true)}
      {k === "killer" && <rect x={-26} y={-20} width={36} height={24} rx={6} fill={bg} stroke={c} strokeWidth={5} />}
      <circle cx={head[0]} cy={head[1]} r={HR} fill={c} />
      {female && <circle cx={head[0] - HR * (k === "girl" ? 0.9 : 1.0)} cy={head[1] + (k === "girl" ? -4 : 6)} r={HR * 0.5} fill={c} />}
      {k === "girl" && <circle cx={head[0] + HR * 0.9} cy={head[1] - 4} r={HR * 0.5} fill={c} />}
      {k === "killer" && <><path d={`M${head[0] - HR - 3},${head[1] - 4} Q${head[0]},${head[1] - HR * 2.3} ${head[0] + HR + 3},${head[1] - 4} Z`} fill={c} /><rect x={head[0] - HR - 6} y={head[1] - 10} width={2 * HR + 12} height={10} rx={4} fill={bg} /></>}
      {limb(frontArm.d, AW, true)}
      {item && <g transform={`translate(${frontArm.e[0]},${frontArm.e[1]}) scale(${flip ? -1 : 1},1)`}>{item}</g>}
    </g>
  );
};

/** lying figure (in bed) */
export const PicLying: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 0.68, c = "#0d0d0f" }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <circle cx={-110} cy={-20} r={30} fill={c} />
    <rect x={-80} y={-40} width={190} height={44} rx={20} fill={c} />
  </g>
);

export const Knife: React.FC<{ s?: number; broken?: boolean; rot?: number }> = ({ s = 1, broken, rot = 0 }) => (
  <g transform={`scale(${s}) rotate(${rot})`}>
    <rect x={-10} y={-8} width={34} height={16} rx={4} fill="#5a3a24" />
    <path d={broken ? "M24,-7 L60,-9 L56,0 L62,7 L24,7 Z" : "M24,-7 L96,-9 L104,0 L24,7 Z"} fill="#c9d1d8" stroke="#1a1a1a" strokeWidth={2.5} />
  </g>
);

// ---------------- flat sets in the reference style ----------------
export const GREY = "#d2d2d2", RED = "#ff4a12";
const OUT = "#1b1b1b";

const Skyline: React.FC<{ y: number; night?: boolean }> = ({ y, night }) => {
  const c = night ? "#2a4d8f" : "#6fa0f0", w = night ? "#ffd56b" : "#a9c6f7";
  const b = [[0, 210, 120], [110, 300, 90], [190, 160, 110], [290, 360, 80], [360, 240, 130], [480, 200, 100], [570, 330, 90], [650, 260, 120], [760, 380, 70], [820, 220, 140], [950, 300, 130]];
  return (
    <g>
      {b.map(([x, h, wd], i) => (
        <g key={i}>
          <rect x={x} y={y - h} width={wd} height={h} fill={c} />
          {i % 3 === 1 && <path d={`M${x + wd / 2 - 8},${y - h} L${x + wd / 2},${y - h - 70} L${x + wd / 2 + 8},${y - h} Z`} fill={night ? "#0d1530" : "#22314d"} />}
          {Array.from({ length: Math.floor(h / 40) }).map((_, r) => Array.from({ length: Math.floor(wd / 30) }).map((_, q) => (
            ((r * 7 + q * 3 + i) % 5) < (night ? 2 : 3) ? <rect key={`${r}${q}`} x={x + 10 + q * 30} y={y - h + 14 + r * 40} width={12} height={16} fill={w} /> : null
          )))}
        </g>
      ))}
    </g>
  );
};

const Win: React.FC<{ x: number; y: number; w: number; h: number; lit?: boolean; night?: boolean; arch?: boolean; open?: boolean }> = ({ x, y, w, h, lit, night, arch, open }) => {
  const glass = open ? "#111" : night ? (lit ? "#ffd56b" : "#1d2a4a") : "#a8d4f5";
  return (
    <g>
      <rect x={x - 8} y={y - 8} width={w + 16} height={h + 16} fill={RED} rx={arch ? w / 2 : 2} />
      <rect x={x - 3} y={y - 3} width={w + 6} height={h + 6} fill="#fff" rx={arch ? w / 2 : 1} />
      <rect x={x + 3} y={y + 3} width={w - 6} height={h - 6} fill={glass} rx={arch ? w / 2 - 4 : 0} />
      {!open && <>
        <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#fff" strokeWidth={6} />
        <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke="#fff" strokeWidth={6} />
        {w > 90 && <><line x1={x + w / 4} y1={y} x2={x + w / 4} y2={y + h} stroke="#fff" strokeWidth={3} /><line x1={x + (3 * w) / 4} y1={y} x2={x + (3 * w) / 4} y2={y + h} stroke="#fff" strokeWidth={3} /></>}
        <path d={`M${x + 10},${y + h * 0.42} L${x + w * 0.42},${y + 10}`} stroke="#fff" strokeWidth={4} opacity={night && lit ? 0.3 : 0.6} />
      </>}
      <rect x={x - 14} y={y + h + 8} width={w + 28} height={12} fill="#fff" stroke={OUT} strokeWidth={2} />
    </g>
  );
};

const Shingles: React.FC<{ d: string; id: string; x: number; y: number; w: number; h: number }> = ({ d, id, x, y, w, h }) => (
  <g>
    <clipPath id={id}><path d={d} /></clipPath>
    <path d={d} fill="#3a3a3f" />
    <g clipPath={`url(#${id})`}>
      {Array.from({ length: Math.ceil(h / 26) + 1 }).map((_, r) => (
        <g key={r}>
          {Array.from({ length: Math.ceil(w / 44) + 2 }).map((_, q) => (
            <rect key={q} x={x + q * 44 - (r % 2 ? 22 : 0) - 22} y={y + r * 26} width={40} height={23} rx={3} fill={(r * 5 + q * 3) % 7 === 0 ? "#55555c" : (r + q) % 3 ? "#2b2b30" : "#46464d"} />
          ))}
        </g>
      ))}
    </g>
  </g>
);

/** Miyazawa house front, flat & detailed (white siding, dark tiled roof, orange trim) */
export const FlatHouse: React.FC<{ night?: boolean; lit?: boolean; car?: boolean; police?: number }> = ({ night = true, lit = true, car = true, police = 0 }) => {
  const sky = night ? "#1a2747" : "#cfe3f7", wall = night ? "#c9ccd6" : "#f4f2ec", wall2 = night ? "#b9bcc7" : "#e7e4dc", line = night ? "#adb1bd" : "#dcd8ce";
  return (
    <g>
      <rect x={-200} y={-200} width={1480} height={2400} fill={sky} />
      {night && <><circle cx={860} cy={260} r={58} fill="#f3e9c4" /><circle cx={838} cy={246} r={10} fill="#ddd2a4" /></>}
      <Skyline y={820} night={night} />
      <rect x={-200} y={820} width={1480} height={1300} fill={GREY} />
      {/* annex (right) */}
      <rect x={600} y={760} width={390} height={480} fill={wall2} />
      {Array.from({ length: 16 }).map((_, i) => <line key={i} x1={600} y1={780 + i * 30} x2={990} y2={780 + i * 30} stroke={line} strokeWidth={3} />)}
      <Shingles id="sh1" d="M570,770 L700,640 L880,640 L1010,770 Z" x={570} y={640} w={440} h={130} />
      <path d="M560,776 L700,632 L880,632 L1020,776" fill="none" stroke={RED} strokeWidth={12} strokeLinejoin="round" />
      <Win x={650} y={820} w={120} h={110} lit={lit} night={night} />
      <Win x={820} y={820} w={120} h={110} night={night} />
      {/* balcony */}
      <rect x={630} y={980} width={330} height={16} fill="#fff" stroke={OUT} strokeWidth={2} />
      {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={640 + i * 27} y={996} width={7} height={70} fill="#fff" />)}
      <rect x={630} y={1062} width={330} height={12} fill="#fff" stroke={OUT} strokeWidth={2} />
      <rect x={840} y={1110} width={100} height={130} fill="#5a3b28" rx={4} /><circle cx={926} cy={1180} r={6} fill="#e8c46a" />
      {/* main house (left) */}
      <rect x={110} y={700} width={510} height={540} fill={wall} />
      {Array.from({ length: 18 }).map((_, i) => <line key={i} x1={110} y1={720 + i * 30} x2={620} y2={720 + i * 30} stroke={line} strokeWidth={3} />)}
      <Shingles id="sh2" d="M70,712 L250,520 L480,520 L660,712 Z" x={70} y={520} w={590} h={192} />
      <path d="M60,718 L250,512 L480,512 L670,718" fill="none" stroke={RED} strokeWidth={12} strokeLinejoin="round" />
      {/* gable with arched window */}
      <path d="M250,712 L365,580 L480,712 Z" fill={wall} />
      <path d="M240,716 L365,570 L490,716" fill="none" stroke={RED} strokeWidth={10} strokeLinejoin="round" />
      <Win x={325} y={620} w={80} h={80} arch lit={lit} night={night} />
      {[200, 520].map((x) => <g key={x}><rect x={x} y={540} width={34} height={60} fill="#7a2a1f" /><rect x={x - 5} y={534} width={44} height={10} fill="#4e1a13" /></g>)}
      <Win x={160} y={770} w={130} h={110} lit={lit} night={night} />
      <Win x={440} y={770} w={130} h={110} lit={lit} night={night} />
      <Win x={160} y={960} w={180} h={130} lit={lit} night={night} />
      {/* door */}
      <rect x={410} y={1050} width={120} height={190} rx={60} fill={RED} />
      <rect x={418} y={1058} width={104} height={182} rx={52} fill="#4a3022" />
      <line x1={470} y1={1070} x2={470} y2={1240} stroke="#3a251a" strokeWidth={4} />
      <circle cx={505} cy={1160} r={6} fill="#e8c46a" />
      <rect x={110} y={1200} width={880} height={40} fill="#a33b2c" />
      <rect x={104} y={712} width={12} height={528} fill="#6b6f7a" /><rect x={984} y={772} width={12} height={468} fill="#6b6f7a" />
      {/* AC unit on wall */}
      <g transform="translate(560,920)"><rect width={56} height={44} fill="#eee" stroke={OUT} strokeWidth={2} /><circle cx={24} cy={22} r={15} fill="#bbb" stroke={OUT} strokeWidth={2} /></g>
      {/* fence */}
      <rect x={-200} y={1240} width={1480} height={60} fill="#b5b5b5" />
      {Array.from({ length: 26 }).map((_, i) => <line key={i} x1={i * 46} y1={1240} x2={i * 46} y2={1300} stroke="#9c9c9c" strokeWidth={3} />)}
      <line x1={-200} y1={1270} x2={1280} y2={1270} stroke="#9c9c9c" strokeWidth={3} />
      {/* utility pole */}
      <rect x={1000} y={600} width={20} height={720} fill="#6d6457" /><rect x={970} y={640} width={80} height={12} fill="#6d6457" />
      <path d="M-50,630 Q500,720 1010,646" stroke="#222" strokeWidth={3} fill="none" /><path d="M-50,660 Q500,750 1010,652" stroke="#222" strokeWidth={3} fill="none" />
      {/* red car */}
      {car && <g transform="translate(640,1290)">
        <path d="M0,70 L8,32 Q30,0 90,-2 L190,-2 Q240,2 262,32 L280,70 Z" fill="#e8231c" />
        <path d="M58,30 Q76,8 112,6 L146,6 L146,30 Z" fill="#cfe9f7" /><path d="M156,6 L194,6 Q226,10 238,30 L156,30 Z" fill="#cfe9f7" />
        <rect x={0} y={40} width={22} height={10} fill="#ffd56b" />
        <circle cx={66} cy={72} r={24} fill="#1b1b1b" /><circle cx={214} cy={72} r={24} fill="#1b1b1b" /><circle cx={66} cy={72} r={10} fill="#ddd" /><circle cx={214} cy={72} r={10} fill="#ddd" />
      </g>}
      {/* road */}
      <rect x={-200} y={1390} width={1480} height={26} fill="#e6e6e6" />
      <rect x={-200} y={1416} width={1480} height={180} fill="#3d3532" />
      {Array.from({ length: 9 }).map((_, i) => <rect key={i} x={i * 130 + 10} y={1497} width={80} height={14} rx={7} fill="#fff" />)}
      <rect x={-200} y={1596} width={1480} height={600} fill={GREY} />
      {police > 0 && <PoliceCar x={60} y={1500} f={police} />}
    </g>
  );
};

export const PoliceCar: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => (
  <g transform={`translate(${x},${y})`}>
    <path d="M0,70 L10,30 Q30,2 90,0 L200,0 Q250,4 270,30 L285,70 Z" fill="#fff" stroke={OUT} strokeWidth={4} />
    <rect x={0} y={42} width={285} height={20} fill="#1b1b1b" />
    <text x={142} y={58} fontFamily="Lilita One" fontSize={18} fill="#fff" textAnchor="middle">POLICE</text>
    <rect x={120} y={-16} width={22} height={16} fill={Math.floor(f / 5) % 2 ? "#ff2020" : "#661010"} /><rect x={142} y={-16} width={22} height={16} fill={Math.floor(f / 5) % 2 ? "#123a99" : "#2a6bff"} />
    <path d="M60,28 Q78,8 112,6 L140,6 L140,28 Z" fill="#9cc7e8" /><path d="M150,6 L196,6 Q228,10 240,28 L150,28 Z" fill="#9cc7e8" />
    <circle cx={66} cy={72} r={24} fill="#1b1b1b" /><circle cx={220} cy={72} r={24} fill="#1b1b1b" />
  </g>
);

/** flat rear wall (park side) with the bathroom window, AC box and fence */
export const FlatRear: React.FC<{ open: boolean; screenDown: boolean }> = ({ open, screenDown }) => (
  <g>
    <rect x={-200} y={-200} width={1480} height={2400} fill="#1a2747" />
    <Skyline y={760} night />
    <rect x={-200} y={760} width={1480} height={1400} fill={GREY} />
    <rect x={140} y={520} width={800} height={900} fill="#c9ccd6" />
    {Array.from({ length: 30 }).map((_, i) => <line key={i} x1={140} y1={540 + i * 30} x2={940} y2={540 + i * 30} stroke="#adb1bd" strokeWidth={3} />)}
    <Shingles id="sh3" d="M100,532 L300,380 L780,380 L980,532 Z" x={100} y={380} w={880} h={152} />
    <path d="M90,538 L300,372 L780,372 L990,538" fill="none" stroke={RED} strokeWidth={12} strokeLinejoin="round" />
    <Win x={300} y={640} w={150} h={140} night open={open} />
    <text x={375} y={620} fontFamily="Fredoka" fontWeight={700} fontSize={28} fill="#1b1b1b" textAnchor="middle" opacity={0.75}>BATHROOM</text>
    <Win x={620} y={640} w={180} h={140} night lit />
    <Win x={300} y={950} w={170} h={140} night />
    <Win x={640} y={950} w={160} h={140} night lit />
    {screenDown && <g transform="translate(250,1330) rotate(-12)"><rect width={150} height={20} fill="#8a939c" /></g>}
    <g transform="translate(330,1170)">
      <rect width={190} height={130} fill="#f0f0f0" stroke={OUT} strokeWidth={4} />
      <circle cx={78} cy={65} r={46} fill="#bdbdbd" stroke={OUT} strokeWidth={4} />
      {[0, 120, 240].map((a) => <path key={a} d="M78,65 L78,28" stroke={OUT} strokeWidth={6} transform={`rotate(${a},78,65)`} />)}
      {Array.from({ length: 5 }).map((_, i) => <rect key={i} x={140} y={16 + i * 22} width={36} height={8} fill="#ccc" />)}
      <rect x={10} y={130} width={14} height={60} fill="#777" /><rect x={166} y={130} width={14} height={60} fill="#777" />
    </g>
    <rect x={-200} y={1360} width={1480} height={150} fill="#a9a9a9" />
    {Array.from({ length: 24 }).map((_, i) => <line key={i} x1={i * 50} y1={1360} x2={i * 50} y2={1510} stroke="#929292" strokeWidth={3} />)}
    {[1410, 1460].map((y) => <line key={y} x1={-200} y1={y} x2={1280} y2={y} stroke="#929292" strokeWidth={3} />)}
    <rect x={-200} y={1510} width={1480} height={700} fill="#5f8f4e" />
    {[[60, 1650], [1010, 1620]].map(([x, y], i) => <g key={i}><rect x={x - 12} y={y - 160} width={24} height={170} fill="#5b4230" /><circle cx={x} cy={y - 220} r={90} fill="#3f7a3a" /><circle cx={x - 50} cy={y - 170} r={60} fill="#4a8a44" /><circle cx={x + 50} cy={y - 170} r={60} fill="#4a8a44" /></g>)}
    <text x={540} y={1700} fontFamily="Fredoka" fontWeight={700} fontSize={34} fill="#244a20" textAnchor="middle" opacity={0.8}>SOSHIGAYA PARK</text>
  </g>
);

/** flat cut-away of the house (reference interior style: light grey walls, simple furniture) */
export const FlatCut: React.FC<{ dark?: number }> = ({ dark = 0 }) => (
  <g>
    <rect x={-300} y={-300} width={1680} height={2600} fill="#1a2747" />
    <Skyline y={700} night />
    <rect x={-300} y={1400} width={1680} height={900} fill="#6b5a4a" />
    <Shingles id="sh4" d="M40,640 L540,300 L1040,640 L980,640 L540,340 L100,640 Z" x={40} y={300} w={1000} h={340} />
    <path d="M30,646 L540,292 L1050,646" fill="none" stroke={RED} strokeWidth={12} strokeLinejoin="round" />
    <path d="M100,640 L540,340 L980,640 Z" fill="#e2e2e2" />
    {/* rooms */}
    <rect x={100} y={640} width={880} height={760} fill="#d9d9d9" />
    {[[100, 1000, 880], [100, 640, 880], [100, 1380, 880]].map(([x, y, w], i) => <rect key={i} x={x} y={y - 8} width={w} height={20} fill="#8a8a8a" />)}
    {[[400, 650, 350], [770, 650, 350], [520, 1012, 368], [770, 1012, 368]].map(([x, y, h], i) => <rect key={i} x={x} y={y} width={12} height={h} fill="#8a8a8a" />)}
    <rect x={88} y={640} width={14} height={760} fill="#6e6e6e" /><rect x={978} y={640} width={14} height={760} fill="#6e6e6e" />
    {/* bathroom */}
    <rect x={88} y={740} width={14} height={110} fill="#111" />
    <rect x={130} y={910} width={200} height={82} rx={10} fill="#fff" stroke={OUT} strokeWidth={3} />
    <rect x={340} y={840} width={40} height={60} fill="#fff" stroke={OUT} strokeWidth={3} />
    {/* Rei's room */}
    <rect x={430} y={935} width={220} height={55} rx={8} fill={RED} /><rect x={430} y={910} width={30} height={80} rx={4} fill="#7a4a2a" />
    <rect x={680} y={890} width={70} height={100} fill="#7a4a2a" />
    {/* hanging lamps */}
    {[[255, 650], [590, 650], [320, 1012], [650, 1012], [540, 470]].map(([x, y], i) => <g key={i}><line x1={x} y1={y} x2={x} y2={y + 30} stroke="#111" strokeWidth={3} /><path d={`M${x - 26},${y + 52} L${x + 26},${y + 52} L${x + 14},${y + 30} L${x - 14},${y + 30} Z`} fill="#111" /><rect x={x - 26} y={y + 50} width={52} height={5} fill={RED} /></g>)}
    {/* stairs */}
    {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={790 + i * 17} y={1380 - (i + 1) * 37} width={180 - i * 17} height={37} fill="#a5a5a5" stroke="#8a8a8a" strokeWidth={2} />)}
    {/* office */}
    <rect x={160} y={1270} width={200} height={14} fill={RED} /><rect x={172} y={1284} width={10} height={96} fill="#111" /><rect x={340} y={1284} width={10} height={96} fill="#111" />
    <rect x={200} y={1200} width={100} height={66} fill="#222" /><rect x={208} y={1208} width={84} height={50} fill="#9ad0ff" />
    {/* kitchen */}
    <rect x={540} y={1270} width={150} height={110} fill="#bdbdbd" stroke="#8a8a8a" strokeWidth={3} />
    <rect x={700} y={1150} width={64} height={230} fill="#f2f2f2" stroke={OUT} strokeWidth={3} />
    <path d="M620,1270 L636,1222 L662,1222 L656,1270 Z" fill="#5a3a24" />
    {/* curtain window loft */}
    <rect x={480} y={520} width={120} height={80} fill="#a8d4f5" /><rect x={470} y={510} width={30} height={100} fill={RED} /><rect x={580} y={510} width={30} height={100} fill={RED} />
    {/* labels */}
    {[["BATHROOM", 160, 740], ["REI'S ROOM", 480, 740], ["OFFICE", 160, 1100], ["KITCHEN", 560, 1100], ["LOFT", 540, 610]].map(([t, x, y], i) => (
      <text key={i} x={x as number} y={(y as number) + (i === 4 ? 0 : 0)} fontFamily="Fredoka" fontWeight={700} fontSize={24} fill="#555" textAnchor="start" opacity={i === 4 ? 0 : 0.9}>{t}</text>
    ))}
    <rect x={100} y={340} width={880} height={1060} fill="#05081a" opacity={dark} />
  </g>
);
