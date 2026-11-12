import React from "react";
import { random } from "remotion";
import { Knife, Pic, PO, RED } from "./Picto";

const INK = "#1b1b1b";
export const RW = 1080, RH = 1920;
const FLOOR = 1400;

/** base room: wallpaper, crown moulding, wainscot, skirting, floorboards */
export const Interior: React.FC<{ wall?: string; stripe?: string; floor?: string; wains?: string; children?: React.ReactNode }> = ({ wall = "#b9b3a6", stripe = "#aea898", floor = "#8a6446", wains = "#d8d1c2", children }) => (
  <g>
    <rect x={-300} y={-300} width={1680} height={2600} fill={wall} />
    {Array.from({ length: 40 }).map((_, i) => <rect key={i} x={-300 + i * 44} y={-300} width={14} height={2000} fill={stripe} />)}
    <rect x={-300} y={200} width={1680} height={26} fill="#e9e3d6" /><rect x={-300} y={226} width={1680} height={8} fill="#cfc7b6" />
    <rect x={-300} y={1080} width={1680} height={FLOOR - 1080} fill={wains} />
    {Array.from({ length: 16 }).map((_, i) => <rect key={i} x={-280 + i * 130} y={1110} width={100} height={250} fill="none" stroke="#c4bcab" strokeWidth={5} />)}
    <rect x={-300} y={1070} width={1680} height={14} fill="#efe9dc" stroke="#bdb4a2" strokeWidth={2} />
    <rect x={-300} y={FLOOR} width={1680} height={1000} fill={floor} />
    {Array.from({ length: 14 }).map((_, r) => <g key={r}><line x1={-300} y1={FLOOR + 30 + r * 46} x2={1380} y2={FLOOR + 30 + r * 46} stroke="#6f4f36" strokeWidth={3} />
      {Array.from({ length: 6 }).map((_, q) => <line key={q} x1={-250 + q * 300 + (r % 2) * 150} y1={FLOOR + 30 + r * 46} x2={-250 + q * 300 + (r % 2) * 150} y2={FLOOR + 76 + r * 46} stroke="#6f4f36" strokeWidth={3} />)}</g>)}
    <rect x={-300} y={FLOOR - 26} width={1680} height={30} fill="#f0ebe0" stroke="#bdb4a2" strokeWidth={2} />
    <rect x={-300} y={FLOOR + 4} width={1680} height={40} fill="#000" opacity={0.12} />
    {children}
  </g>
);

export const NightWindow: React.FC<{ x: number; y: number; w?: number; h?: number; curtain?: string; f: number; open?: boolean }> = ({ x, y, w = 280, h = 320, curtain = "#6b3fa0", f, open }) => (
  <g>
    <rect x={x - 16} y={y - 16} width={w + 32} height={h + 32} fill="#f2ede3" stroke="#c9c0ae" strokeWidth={3} />
    <rect x={x} y={y} width={w} height={h} fill="#121c3a" />
    {Array.from({ length: 7 }).map((_, i) => <rect key={i} x={x + i * (w / 7)} y={y + h - 60 - (i % 3) * 40} width={w / 7 - 6} height={200} fill="#22355f" />)}
    {Array.from({ length: 10 }).map((_, i) => <rect key={"l" + i} x={x + 10 + (i * 37) % (w - 20)} y={y + h - 40 - (i % 4) * 30} width={8} height={10} fill="#ffd56b" />)}
    <circle cx={x + w * 0.75} cy={y + 60} r={24} fill="#efe6c4" />
    {!open && <><line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#f2ede3" strokeWidth={10} /><line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke="#f2ede3" strokeWidth={8} /></>}
    <path d={`M${x - 40},${y - 30} L${x + 40},${y - 30} Q${x + 30 + Math.sin(f / 20) * (open ? 18 : 3)},${y + h / 2} ${x + 50},${y + h + 40} L${x - 40},${y + h + 40} Z`} fill={curtain} />
    <path d={`M${x + w + 40},${y - 30} L${x + w - 40},${y - 30} Q${x + w - 30 + Math.sin(f / 23) * (open ? 18 : 3)},${y + h / 2} ${x + w - 50},${y + h + 40} L${x + w + 40},${y + h + 40} Z`} fill={curtain} />
    <rect x={x - 60} y={y - 42} width={w + 120} height={14} rx={6} fill="#6b4a33" />
    <rect x={x - 26} y={y + h + 14} width={w + 52} height={16} fill="#f2ede3" stroke="#c9c0ae" strokeWidth={2} />
  </g>
);

export const Door: React.FC<{ x: number; y?: number; ajar?: boolean; light?: boolean }> = ({ x, y = FLOOR, ajar, light }) => (
  <g>
    <rect x={x - 14} y={y - 600} width={268} height={600} fill="#efe9dc" stroke="#bdb4a2" strokeWidth={3} />
    {ajar ? (
      <>
        <rect x={x} y={y - 586} width={240} height={586} fill={light ? "#f6d58a" : "#07090f"} />
        {light && <path d={`M${x},${y} L${x + 60},${y} L${x + 260},${y + 300} L${x - 160},${y + 300} Z`} fill="#f6d58a" opacity={0.25} />}
        <path d={`M${x + 240},${y - 586} L${x + 150},${y - 560} L${x + 150},${y - 20} L${x + 240},${y}`} fill="#a77a52" stroke="#7a573a" strokeWidth={4} />
      </>
    ) : (
      <>
        <rect x={x} y={y - 586} width={240} height={586} fill="#a77a52" />
        <rect x={x + 26} y={y - 556} width={188} height={230} fill="none" stroke="#8a6342" strokeWidth={6} /><rect x={x + 26} y={y - 300} width={188} height={260} fill="none" stroke="#8a6342" strokeWidth={6} />
        <circle cx={x + 210} cy={y - 300} r={11} fill="#e2c26c" stroke={INK} strokeWidth={2} />
      </>
    )}
  </g>
);
export const Frame: React.FC<{ x: number; y: number; w: number; h: number; rot?: number; children?: React.ReactNode; bg?: string }> = ({ x, y, w, h, rot = 0, children, bg = "#e9e4d8" }) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <line x1={w / 2} y1={-40} x2={w / 2 - 30} y2={0} stroke="#555" strokeWidth={2} /><line x1={w / 2} y1={-40} x2={w / 2 + 30} y2={0} stroke="#555" strokeWidth={2} />
    <rect x={-10} y={-10} width={w + 20} height={h + 20} fill="#3b2b20" /><rect width={w} height={h} fill={bg} />{children}
  </g>
);
export const Switch: React.FC<{ x: number; y: number }> = ({ x, y }) => <g><rect x={x} y={y} width={40} height={60} rx={4} fill="#f4f1ea" stroke="#bdb4a2" strokeWidth={2} /><rect x={x + 14} y={y + 16} width={12} height={28} rx={3} fill="#ddd6c8" /></g>;
export const Outlet: React.FC<{ x: number; y: number }> = ({ x, y }) => <g><rect x={x} y={y} width={36} height={44} rx={4} fill="#f4f1ea" stroke="#bdb4a2" strokeWidth={2} /><rect x={x + 10} y={y + 12} width={4} height={10} fill="#555" /><rect x={x + 22} y={y + 12} width={4} height={10} fill="#555" /></g>;
export const Plant: React.FC<{ x: number; y?: number; s?: number }> = ({ x, y = FLOOR, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-40,0 L40,0 L50,-90 L-50,-90 Z" fill="#c4572e" />
    {[-60, -30, 0, 30, 60].map((a, i) => <path key={i} d={`M0,-90 Q${a * 1.2},-170 ${a * 2},-${220 + (i % 2) * 40}`} stroke="#3f7a3a" strokeWidth={12} fill="none" strokeLinecap="round" />)}
    {[-70, -20, 30, 80].map((a, i) => <ellipse key={i} cx={a} cy={-190 - (i % 2) * 40} rx={30} ry={14} fill="#4f8f48" transform={`rotate(${a / 2},${a},${-190 - (i % 2) * 40})`} />)}
  </g>
);
export const CeilingLamp: React.FC<{ x: number; f: number; flicker?: boolean; on?: boolean }> = ({ x, f, flicker, on = true }) => {
  const k = flicker ? (random(`fl${Math.floor(f / 3)}`) > 0.12 ? 1 : 0.25) : 1;
  return (
    <g>
      <line x1={x} y1={-300} x2={x} y2={300} stroke="#111" strokeWidth={5} />
      <path d={`M${x - 90},${390} L${x + 90},${390} L${x + 44},${300} L${x - 44},${300} Z`} fill="#111" />
      <rect x={x - 90} y={386} width={180} height={10} fill={RED} />
      {on && <path d={`M${x - 90},${396} L${x + 90},${396} L${x + 420},${FLOOR + 80} L${x - 420},${FLOOR + 80} Z`} fill="#ffe9a8" opacity={0.18 * k} />}
      {on && <ellipse cx={x} cy={398} rx={40} ry={10} fill="#fff2c2" opacity={k} />}
    </g>
  );
};
export const Darken: React.FC<{ o?: number; cx?: number; cy?: number }> = ({ o = 0.55, cx = 540, cy = 900 }) => (
  <g>
    <defs><radialGradient id={`dk${cx}${cy}`} cx={cx / RW} cy={cy / RH} r="0.75"><stop offset="0.15" stopColor="#060914" stopOpacity={o * 0.25} /><stop offset="1" stopColor="#060914" stopOpacity={o} /></radialGradient></defs>
    <rect x={-300} y={-300} width={1680} height={2600} fill={`url(#dk${cx}${cy})`} />
  </g>
);
export const Marker: React.FC<{ x: number; y: number; n: string }> = ({ x, y, n }) => (
  <g transform={`translate(${x},${y})`}><path d="M-26,0 L-14,-46 L14,-46 L26,0 Z" fill="#f2c94c" stroke={INK} strokeWidth={3} /><text y={-12} fontFamily="Lilita One" fontSize={30} fill={INK} textAnchor="middle">{n}</text></g>
);

// ---------------- rooms ----------------
export const ReiRoom: React.FC<{ f: number }> = ({ f }) => (
  <Interior wall="#7e93b0" stripe="#7489a6" wains="#c9cfd8" floor="#8a6446">
    <NightWindow x={620} y={430} w={300} h={330} curtain="#2f5fa8" f={f} />
    <Door x={70} ajar />
    {/* poster + shelf with toys */}
    <Frame x={380} y={420} w={160} h={220} bg="#11264d"><path d="M80,40 L110,120 L80,180 L50,120 Z" fill="#e3e3e3" /><path d="M80,180 L70,210 L90,210 Z" fill="#ff8a1e" />{[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={20 + i * 30} cy={30 + (i % 2) * 30} r={3} fill="#fff" />)}</Frame>
    <rect x={360} y={760} width={220} height={14} fill="#7a4a2a" />
    {[0, 1, 2].map((i) => <rect key={i} x={378 + i * 66} y={700} width={44} height={60} rx={8} fill={["#e3262b", "#2f7ad6", "#f2b22a"][i]} />)}
    {/* desk with randoseru (school backpack) */}
    <rect x={660} y={1060} width={300} height={22} fill="#7a4a2a" /><rect x={676} y={1082} width={16} height={318} fill="#5a3520" /><rect x={930} y={1082} width={16} height={318} fill="#5a3520" />
    <rect x={720} y={960} width={110} height={100} rx={20} fill="#1d1d1d" /><rect x={732} y={980} width={86} height={50} rx={10} fill="#333" />
    <circle cx={900} cy={1000} r={30} fill="#f2b22a" /><rect x={896} y={1020} width={8} height={40} fill="#333" />
    {/* bed: empty, blanket pulled to the floor */}
    <rect x={200} y={1200} width={420} height={110} rx={10} fill="#7a4a2a" /><rect x={190} y={1100} width={40} height={300} rx={8} fill="#7a4a2a" /><rect x={600} y={1180} width={34} height={220} rx={8} fill="#7a4a2a" />
    <rect x={230} y={1150} width={370} height={60} rx={14} fill="#f2f2f2" /><rect x={240} y={1110} width={110} height={50} rx={16} fill="#ffffff" stroke="#ccc" strokeWidth={3} transform="rotate(-8,295,1135)" />
    <path d="M420,1160 Q560,1150 620,1200 Q660,1330 700,1400 L560,1400 Q520,1300 420,1240 Z" fill="#3e5fa0" />
    {/* toys on the floor */}
    <g transform="translate(800,1470) rotate(-10)"><path d="M0,0 Q20,-60 60,-60 Q90,-60 100,-30 L130,-40 L110,-10 L100,0 Z" fill="#3f9a4a" /><circle cx={78} cy={-46} r={4} fill="#111" /><path d="M10,0 L10,20 M60,0 L60,20" stroke="#3f9a4a" strokeWidth={14} /></g>
    <g transform="translate(300,1520)"><rect width={90} height={36} rx={8} fill="#e3262b" /><circle cx={20} cy={38} r={14} fill="#111" /><circle cx={70} cy={38} r={14} fill="#111" /></g>
    <Switch x={30} y={900} /><Outlet x={960} y={1300} />
    <CeilingLamp x={540} f={f} flicker />
    <Darken o={0.62} cx={420} cy={1200} />
  </Interior>
);

export const Stairs: React.FC<{ f: number }> = ({ f }) => (
  <Interior wall="#a39a8a" stripe="#998f7f" wains="#cdc5b5">
    {/* family photos on the wall going up the stairs */}
    {[[200, 620, -3], [420, 520, 2], [640, 420, -2]].map(([x, y, r], i) => (
      <Frame key={i} x={x} y={y} w={150} h={120} rot={r}>
        <g transform="translate(75,112)"><Pic x={-40} y={0} k="man" p={PO.stand} s={0.33} bg="#e9e4d8" /><Pic x={-8} y={0} k="woman" p={PO.stand} s={0.31} bg="#e9e4d8" /><Pic x={22} y={0} k="girl" p={PO.stand} s={0.3} bg="#e9e4d8" /><Pic x={46} y={0} k="boy" p={PO.stand} s={0.28} bg="#e9e4d8" /></g>
      </Frame>
    ))}
    {/* staircase rising to the right */}
    {Array.from({ length: 12 }).map((_, i) => (
      <g key={i}><rect x={60 + i * 80} y={FLOOR - (i + 1) * 80} width={1100} height={80} fill="#8a6446" /><rect x={60 + i * 80} y={FLOOR - (i + 1) * 80} width={1100} height={12} fill="#a97c58" /><rect x={60 + i * 80} y={FLOOR - (i + 1) * 80 + 12} width={4} height={68} fill="#6f4f36" /></g>
    ))}
    {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={430 + i * 80} y={FLOOR - (i + 1) * 80 - 130} width={10} height={130} fill="#efe9dc" />)}
    <path d={`M120,${FLOOR - 190} L1180,${FLOOR - 1150}`} stroke="#6b4a33" strokeWidth={18} strokeLinecap="round" />
    {/* light spilling from the upstairs door */}
    <rect x={900} y={180} width={200} height={300} fill="#f6d58a" opacity={0.5} />
    <path d="M900,480 L1100,480 L1180,760 L780,760 Z" fill="#f6d58a" opacity={0.12} />
    {/* broken blade tip on a step + evidence marker */}
    <g transform={`translate(520,${FLOOR - 5 * 80})`}><path d="M0,-6 L46,-9 L40,0 L48,6 L0,6 Z" fill="#c9d1d8" stroke={INK} strokeWidth={2.5} transform="rotate(-6)" /></g>
    <Marker x={610} y={FLOOR - 5 * 80} n="1" />
    <circle cx={545} cy={FLOOR - 5 * 80 - 4} r={70} fill="none" stroke="#e3262b" strokeWidth={6} strokeDasharray="14 8" opacity={0.5 + 0.5 * Math.sin(f / 6)} />
    <Switch x={40} y={980} />
    <CeilingLamp x={300} f={f} flicker />
    <Darken o={0.6} cx={550} cy={1000} />
  </Interior>
);

export const KitchenRoom: React.FC<{ f: number; ring?: number; fridgeOpen?: boolean }> = ({ f, ring = 0, fridgeOpen }) => (
  <Interior wall="#a7b3a1" stripe="#a7b3a1" wains="#a7b3a1" floor="#9b8a74">
    {/* tiled backsplash */}
    <rect x={-300} y={780} width={1680} height={300} fill="#e7e9e4" />
    {Array.from({ length: 8 }).map((_, r) => <line key={r} x1={-300} y1={780 + r * 40} x2={1380} y2={780 + r * 40} stroke="#cfd3cb" strokeWidth={3} />)}
    {Array.from({ length: 40 }).map((_, c) => <line key={c} x1={-300 + c * 40} y1={780} x2={-300 + c * 40} y2={1080} stroke="#cfd3cb" strokeWidth={3} />)}
    {/* upper cabinets */}
    {[0, 1, 2].map((i) => <g key={i}><rect x={-20 + i * 210} y={360} width={196} height={300} fill="#f0ece2" stroke="#c9c1ad" strokeWidth={4} /><rect x={150 + i * 210} y={470} width={10} height={60} rx={4} fill="#9a9384" /></g>)}
    {/* window over the sink */}
    <NightWindow x={660} y={380} w={260} h={260} curtain="#d6c27a" f={f} />
    {/* counter + lower cabinets */}
    <rect x={-300} y={1080} width={1300} height={30} fill="#5a5e66" />
    <rect x={-300} y={1110} width={1300} height={290} fill="#f0ece2" stroke="#c9c1ad" strokeWidth={4} />
    {Array.from({ length: 6 }).map((_, i) => <g key={i}><rect x={-280 + i * 210} y={1130} width={190} height={250} fill="none" stroke="#c9c1ad" strokeWidth={4} /><rect x={-110 + i * 210} y={1150} width={50} height={8} rx={4} fill="#9a9384" /></g>)}
    {/* sink + tap */}
    <rect x={690} y={1076} width={200} height={12} rx={4} fill="#c8ccd2" /><path d="M780,1076 L780,1010 Q780,990 810,990 L840,990" stroke="#b7bdc5" strokeWidth={12} fill="none" strokeLinecap="round" />
    {/* rice cooker, kettle */}
    <g transform="translate(130,1080)"><ellipse cx={0} cy={-50} rx={60} ry={50} fill="#f4f1ea" stroke="#c9c1ad" strokeWidth={4} /><ellipse cx={0} cy={-94} rx={46} ry={14} fill="#ddd6c8" /><rect x={-14} y={-40} width={28} height={14} rx={4} fill="#4caf50" /></g>
    <g transform="translate(300,1080)"><path d="M-40,0 L-30,-70 Q0,-92 30,-70 L40,0 Z" fill="#b9bfc8" /><path d="M38,-50 L70,-70" stroke="#b9bfc8" strokeWidth={10} /></g>
    {/* knife block with one empty slot */}
    <g transform="translate(500,1080)">
      <path d="M-50,0 L-30,-120 L40,-120 L50,0 Z" fill="#6b4630" />
      {[-18, 0, 18].map((dx, i) => <rect key={i} x={dx - 4} y={-150} width={8} height={34} fill={i === 1 ? "#111" : "#2a2a2a"} />)}
      {[-18, 18].map((dx) => <rect key={dx} x={dx - 6} y={-170} width={12} height={26} rx={3} fill="#1a1a1a" />)}
      {ring > 0 && <circle cx={0} cy={-140} r={60 + Math.sin(f / 5) * 4} fill="none" stroke="#e3262b" strokeWidth={7} opacity={ring} />}
    </g>
    {/* fridge */}
    <rect x={1000} y={520} width={300} height={880} rx={14} fill="#eeeeee" stroke="#bdbdbd" strokeWidth={4} />
    {fridgeOpen ? <><rect x={1012} y={532} width={276} height={856} fill="#fff6c2" /><path d="M1000,560 L640,1900 L1380,1900 L1300,560 Z" fill="#fff6c2" opacity={0.18} /></> : <rect x={1020} y={760} width={14} height={160} rx={6} fill="#bdbdbd" />}
    {/* calendar + utensils */}
    <g transform="translate(-200,420)"><rect width={110} height={150} fill="#fff" stroke="#bbb" strokeWidth={3} /><rect width={110} height={34} fill="#e3262b" /><text x={55} y={26} fontFamily="Fredoka" fontWeight={700} fontSize={22} fill="#fff" textAnchor="middle">DEC</text><text x={55} y={112} fontFamily="Fredoka" fontWeight={700} fontSize={56} fill="#222" textAnchor="middle">30</text></g>
    <rect x={250} y={700} width={300} height={10} fill="#9a9384" />{[280, 340, 400, 460, 520].map((x, i) => <path key={i} d={`M${x},710 L${x},760`} stroke="#777" strokeWidth={6} />)}
    <CeilingLamp x={420} f={f} flicker />
    <Darken o={0.55} cx={500} cy={1000} />
  </Interior>
);

export const Loft: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-300} y={-300} width={1680} height={2600} fill="#6e5a47" />
    {/* slanted ceiling beams */}
    <path d="M-300,700 L540,120 L1380,700 L1380,-300 L-300,-300 Z" fill="#4a3b2e" />
    {Array.from({ length: 8 }).map((_, i) => <path key={i} d={`M${-300 + i * 120},${700 - i * 83} L${-300 + i * 120},${720 - i * 83}`} stroke="#3a2d22" strokeWidth={30} />)}
    <path d="M-300,700 L540,120 L1380,700" fill="none" stroke="#3a2d22" strokeWidth={34} />
    {/* small round window with moon */}
    <circle cx={540} cy={520} r={110} fill="#f2ede3" /><circle cx={540} cy={520} r={94} fill="#121c3a" /><circle cx={575} cy={490} r={22} fill="#efe6c4" />
    <line x1={446} y1={520} x2={634} y2={520} stroke="#f2ede3" strokeWidth={8} /><line x1={540} y1={426} x2={540} y2={614} stroke="#f2ede3" strokeWidth={8} />
    {/* tatami floor */}
    <rect x={-300} y={1300} width={1680} height={1000} fill="#a7a06a" />
    {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={-300 + i * 300} y={1300} width={300} height={620} fill="none" stroke="#6b6640" strokeWidth={8} />)}
    {/* two futons, empty, sheets pushed aside */}
    {[120, 600].map((x, i) => <g key={i}><rect x={x} y={1380} width={360} height={170} rx={20} fill="#f2f2f2" /><rect x={x + 10} y={1360} width={110} height={50} rx={18} fill="#fff" stroke="#ccc" strokeWidth={3} /><path d={`M${x + 140},1400 Q${x + 300},1390 ${x + 380},1470 L${x + 400},1560 L${x + 180},1560 Z`} fill={i ? "#e88aa6" : "#c9a36a"} /></g>)}
    {/* teddy bear on its side */}
    <g transform="translate(470,1640) rotate(-70)"><circle r={36} fill="#a26b3c" /><circle cx={0} cy={-52} r={28} fill="#a26b3c" /><circle cx={-20} cy={-74} r={11} fill="#a26b3c" /><circle cx={20} cy={-74} r={11} fill="#a26b3c" /></g>
    {/* hatch to the ladder */}
    <rect x={880} y={1600} width={180} height={140} fill="#07090f" /><rect x={880} y={1600} width={180} height={14} fill="#3a2d22" />
    <rect x={-300} y={1300} width={1680} height={14} fill="#4a3b2e" />
    <Darken o={0.68} cx={540} cy={560} />
  </g>
);

export const Living: React.FC<{ f: number }> = ({ f }) => (
  <Interior wall="#8d8577" stripe="#867e70" wains="#b5ad9d">
    <NightWindow x={660} y={400} w={300} h={330} curtain="#c9542c" f={f} />
    {/* shelf with kagami mochi */}
    <rect x={80} y={640} width={340} height={16} fill="#6b4a33" />
    <g transform="translate(150,640)"><rect x={-40} y={-12} width={80} height={12} fill="#e3262b" /><ellipse cx={0} cy={-24} rx={36} ry={15} fill="#fbf8f1" /><ellipse cx={0} cy={-44} rx={26} ry={12} fill="#fbf8f1" /><circle cx={0} cy={-60} r={10} fill="#f2a53a" /></g>
    {[0, 1, 2].map((i) => <rect key={i} x={250 + i * 44} y={566} width={34} height={74} fill={["#2f5fa8", "#e3262b", "#f2b22a"][i]} />)}
    {/* wall clock */}
    <g transform="translate(540,330)"><circle r={70} fill="#f4f1ea" stroke="#3b2b20" strokeWidth={12} />
      <line x1={0} y1={0} x2={Math.sin(f / 40) * 36} y2={-Math.cos(f / 40) * 36} stroke="#111" strokeWidth={8} strokeLinecap="round" />
      <line x1={0} y1={0} x2={Math.sin(f / 4) * 54} y2={-Math.cos(f / 4) * 54} stroke="#e3262b" strokeWidth={4} strokeLinecap="round" /></g>
    {/* CRT TV on cabinet, off */}
    <rect x={80} y={1180} width={360} height={220} fill="#5a3d27" /><rect x={100} y={1200} width={150} height={180} fill="#4a321f" /><rect x={270} y={1200} width={150} height={180} fill="#4a321f" />
    <rect x={130} y={960} width={260} height={220} rx={20} fill="#2c2c30" /><rect x={150} y={980} width={190} height={170} rx={14} fill="#15181f" /><circle cx={365} cy={1020} r={10} fill="#666" />
    {/* sofa + kotatsu */}
    <rect x={560} y={1120} width={480} height={170} rx={40} fill="#6e2c26" /><rect x={560} y={1250} width={480} height={150} rx={30} fill="#5c241f" />
    <rect x={510} y={1460} width={500} height={30} fill="#7a4a2a" /><path d="M500,1490 L1020,1490 L1060,1640 L460,1640 Z" fill="#c9542c" />
    <circle cx={720} cy={1440} r={18} fill="#f39a2b" /><circle cx={760} cy={1440} r={18} fill="#f39a2b" /><circle cx={740} cy={1420} r={18} fill="#f39a2b" />
    <Plant x={980} y={1400} s={0.9} />
    <Switch x={480} y={940} />
    {/* the killer, sitting still in the dark */}
    <Pic x={800} y={1420} k="killer" p={PO.sit} s={1.4} flip bg="#5c241f" />
    <Darken o={0.7} cx={800} cy={1100} />
  </Interior>
);

export const Bathroom: React.FC<{ f: number; band: boolean }> = ({ f, band }) => (
  <Interior wall="#9fb7c2" stripe="#9fb7c2" wains="#cfe0e6" floor="#7f97a3">
    {Array.from({ length: 30 }).map((_, i) => <line key={i} x1={-300} y1={i * 60} x2={1380} y2={i * 60} stroke="#8fa7b2" strokeWidth={3} />)}
    {Array.from({ length: 30 }).map((_, i) => <line key={"v" + i} x1={-300 + i * 60} y1={0} x2={-300 + i * 60} y2={1400} stroke="#8fa7b2" strokeWidth={3} />)}
    <NightWindow x={70} y={420} w={220} h={260} curtain="#e9eef0" f={f} open />
    <rect x={560} y={440} width={340} height={400} rx={14} fill="#dbeef8" stroke="#8a9a9f" strokeWidth={10} /><path d="M600,500 L660,460 M600,560 L700,470" stroke="#fff" strokeWidth={12} />
    <path d="M540,1060 L920,1060 L890,1140 Q730,1180 570,1140 Z" fill="#fff" stroke="#8a9a9f" strokeWidth={5} /><rect x={700} y={1140} width={60} height={260} fill="#fff" stroke="#8a9a9f" strokeWidth={5} />
    <rect x={960} y={820} width={110} height={300} rx={10} fill="#f2b22a" /><rect x={940} y={810} width={150} height={16} rx={8} fill="#9aa3ad" />
    <g transform="translate(860,1010)"><rect x={-70} y={-50} width={140} height={100} rx={12} fill="#fff" stroke={INK} strokeWidth={5} /><rect x={-14} y={-34} width={28} height={68} fill="#e3262b" /><rect x={-34} y={-14} width={68} height={28} fill="#e3262b" /></g>
    <Pic x={380} y={1500} k="killer" p={PO.hold} s={1.5} bg="#7f97a3" item={band ? <rect x={-20} y={-10} width={40} height={20} rx={5} fill="#fff" stroke="#c41e1e" strokeWidth={4} /> : <circle r={8} fill="#c41e1e" />} />
    <CeilingLamp x={720} f={f} flicker />
    <Darken o={0.45} cx={640} cy={1000} />
  </Interior>
);

export const Office: React.FC<{ f: number }> = ({ f }) => (
  <Interior wall="#7f8a76" stripe="#76816d" wains="#c1c7b4">
    <NightWindow x={680} y={420} w={260} h={300} curtain="#3b6b4a" f={f} />
    <rect x={80} y={560} width={280} height={500} fill="#6b4a33" />{[0, 1, 2].map((r) => <g key={r}><rect x={92} y={590 + r * 155} width={256} height={10} fill="#4d3423" />{Array.from({ length: 7 }).map((_, i) => <rect key={i} x={100 + i * 34} y={530 + r * 155} width={26} height={60} fill={["#b8473a", "#3d6fb5", "#e3b04b", "#4d8a57", "#e9e1d0"][(i + r) % 5]} />)}</g>)}
    <rect x={380} y={1160} width={560} height={24} fill={RED} />{[400, 900].map((x) => <rect key={x} x={x} y={1184} width={18} height={216} fill="#111" />)}
    <rect x={460} y={900} width={320} height={240} rx={14} fill="#ddd6c3" stroke="#a49c86" strokeWidth={4} />
    <rect x={480} y={920} width={280} height={180} fill="#0a246a" />
    <rect x={480} y={920} width={280} height={30} fill="#1f4bb5" />
    <text x={620} y={990} fontFamily="monospace" fontWeight={700} fontSize={30} fill="#fff" textAnchor="middle">CONNECTED</text>
    <text x={620} y={1070} fontFamily="monospace" fontWeight={700} fontSize={64} fill="#ffd25a" textAnchor="middle">01:18</text>
    <rect x={580} y={1140} width={80} height={20} fill="#cfc7b2" />
    <path d="M470,1160 L770,1160 L780,1172 L460,1172 Z" fill="#eee" />
    <path d="M620,1100 L100,1900 L1300,1900 Z" fill="#8fd3ff" opacity={0.1 + 0.03 * Math.sin(f / 2)} />
    <rect x={820} y={1280} width={130} height={20} fill="#111" /><path d="M830,1300 L810,1400 M940,1300 L960,1400" stroke="#111" strokeWidth={14} />
    <Pic x={880} y={1420} k="killer" p={PO.type} s={1.3} flip bg="#7f8a76" />
    <Darken o={0.62} cx={620} cy={1000} />
  </Interior>
);
