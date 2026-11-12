import React from "react";
import { random, staticFile } from "remotion";
import { noise2D } from "@remotion/noise";

export const W = 1080, H = 1920;
export const INK = "#14141a";
const sw = 4;

export const Defs2: React.FC = () => (
  <defs>
    <pattern id="tiles" width="46" height="26" patternUnits="userSpaceOnUse">
      <rect width="46" height="26" fill="#2c303c" />
      <path d="M0,26 Q11.5,6 23,26 Q34.5,6 46,26" fill="#363b49" stroke="#16181f" strokeWidth="2.5" />
      <path d="M4,22 Q11.5,11 19,22" fill="none" stroke="#4a5062" strokeWidth="2" />
      <path d="M27,22 Q34.5,11 42,22" fill="none" stroke="#4a5062" strokeWidth="2" />
    </pattern>
    <pattern id="tilesDay" width="46" height="26" patternUnits="userSpaceOnUse">
      <rect width="46" height="26" fill="#4d5361" />
      <path d="M0,26 Q11.5,6 23,26 Q34.5,6 46,26" fill="#5a6070" stroke="#2a2d36" strokeWidth="2.5" />
      <path d="M4,22 Q11.5,11 19,22" fill="none" stroke="#727a8c" strokeWidth="2" />
    </pattern>
    <pattern id="plaster" width="70" height="70" patternUnits="userSpaceOnUse">
      <rect width="70" height="70" fill="#9aa0b5" />
      <circle cx="12" cy="9" r="1.6" fill="#8a90a5" /><circle cx="45" cy="30" r="1.3" fill="#a8aec2" /><circle cx="30" cy="58" r="1.8" fill="#878da2" />
      <path d="M50,5 l8,3" stroke="#8d93a8" strokeWidth="1.5" /><path d="M5,40 l6,-2" stroke="#a9afc3" strokeWidth="1.2" />
      <circle cx="62" cy="62" r="1.2" fill="#8a90a5" />
    </pattern>
    <pattern id="plasterDay" width="70" height="70" patternUnits="userSpaceOnUse">
      <rect width="70" height="70" fill="#efece4" />
      <circle cx="12" cy="9" r="1.6" fill="#ddd8cc" /><circle cx="45" cy="30" r="1.3" fill="#f7f5ef" /><circle cx="30" cy="58" r="1.8" fill="#dcd6ca" />
      <path d="M50,5 l8,3" stroke="#e0dbcf" strokeWidth="1.5" />
    </pattern>
    <pattern id="blocks" width="64" height="32" patternUnits="userSpaceOnUse">
      <rect width="64" height="32" fill="#6c7183" />
      <rect x="1" y="1" width="62" height="30" fill="#757a8c" stroke="#555a6a" strokeWidth="2.5" />
      <circle cx="20" cy="12" r="1.5" fill="#62677a" /><circle cx="44" cy="22" r="1.8" fill="#62677a" />
    </pattern>
    <pattern id="boards" width="1080" height="40" patternUnits="userSpaceOnUse">
      <rect width="1080" height="40" fill="#6e5038" /><line x1="0" y1="39" x2="1080" y2="39" stroke="#57402d" strokeWidth="3" />
      <line x1="260" y1="0" x2="260" y2="40" stroke="#57402d" strokeWidth="2" /><line x1="740" y1="0" x2="740" y2="40" stroke="#57402d" strokeWidth="2" />
    </pattern>
    <pattern id="tatami" width="90" height="90" patternUnits="userSpaceOnUse">
      <rect width="90" height="90" fill="#8c8a5c" /><rect width="90" height="90" fill="none" stroke="#5b5a3b" strokeWidth="4" />
      {Array.from({ length: 9 }).map((_, i) => <line key={i} x1="0" y1={i * 10 + 5} x2="90" y2={i * 10 + 5} stroke="#7d7b51" strokeWidth="1.5" />)}
    </pattern>
    <pattern id="btiles" width="40" height="40" patternUnits="userSpaceOnUse">
      <rect width="40" height="40" fill="#7f97a3" /><rect width="40" height="40" fill="none" stroke="#6a808b" strokeWidth="2.5" />
    </pattern>
    <pattern id="wallpaperR" width="40" height="40" patternUnits="userSpaceOnUse">
      <rect width="40" height="40" fill="#5c6e94" /><circle cx="20" cy="20" r="3" fill="#6d80a8" /><circle cx="0" cy="0" r="3" fill="#6d80a8" /><circle cx="40" cy="40" r="3" fill="#6d80a8" />
    </pattern>
    <pattern id="wallpaperL" width="30" height="30" patternUnits="userSpaceOnUse">
      <rect width="30" height="30" fill="#8b6f58" /><line x1="0" y1="0" x2="0" y2="30" stroke="#7f6550" strokeWidth="6" />
    </pattern>
    <pattern id="hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="12" height="12" fill="#d9d3c6" /><line x1="0" y1="0" x2="0" y2="12" stroke="#b9b2a3" strokeWidth="4" />
    </pattern>
    <linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#070b1f" /><stop offset="0.6" stopColor="#18224a" /><stop offset="1" stopColor="#2c3766" /></linearGradient>
    <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe6a0" stopOpacity="0.6" /><stop offset="1" stopColor="#ffe6a0" stopOpacity="0" /></linearGradient>
    <linearGradient id="winGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd77a" /><stop offset="1" stopColor="#f0a347" /></linearGradient>
    <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8fa0d0" stopOpacity="0" /><stop offset="1" stopColor="#8fa0d0" stopOpacity="0.28" /></linearGradient>
    <radialGradient id="vig2" cx="50%" cy="48%" r="72%"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.72" /></radialGradient>
    <radialGradient id="torch" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#fff3c8" stopOpacity="0.55" /><stop offset="1" stopColor="#fff3c8" stopOpacity="0" /></radialGradient>
  </defs>
);

export const Stars: React.FC<{ f: number }> = ({ f }) => (
  <g>{Array.from({ length: 80 }).map((_, i) => (
    <circle key={i} cx={random(`s${i}`) * W} cy={random(`t${i}`) * 650} r={1.2 + random(`u${i}`) * 2} fill="#fff" opacity={0.2 + 0.8 * Math.abs(Math.sin(f / (7 + (i % 6)) + i))} />
  ))}</g>
);

const Skyline: React.FC<{ f: number; y: number }> = ({ f, y }) => (
  <g>
    {Array.from({ length: 14 }).map((_, i) => {
      const w = 70 + random(`kw${i}`) * 70, h = 160 + random(`kh${i}`) * 380, x = i * 82 - 30;
      return (
        <g key={i}>
          <rect x={x} y={y - h} width={w} height={h + 400} fill={i % 2 ? "#141b36" : "#192143"} stroke="#0b0f22" strokeWidth={2} />
          {i % 4 === 1 && <><line x1={x + w / 2} y1={y - h} x2={x + w / 2} y2={y - h - 50} stroke="#0b0f22" strokeWidth={4} /><circle cx={x + w / 2} cy={y - h - 52} r={4} fill="#ff4b4b" opacity={Math.floor(f / 15 + i) % 2 ? 1 : 0.2} /></>}
          {Array.from({ length: Math.floor(h / 34) }).map((_, r) => Array.from({ length: Math.floor(w / 22) }).map((_, c) => (
            random(`kl${i}${r}${c}`) > 0.62 ? <rect key={`${r}${c}`} x={x + 8 + c * 22} y={y - h + 12 + r * 34} width={10} height={14} fill="#f6cf74" opacity={0.85} /> : null
          )))}
        </g>
      );
    })}
  </g>
);

export const Tree2: React.FC<{ x: number; y: number; s?: number; f: number; id: string; c?: string }> = ({ x, y, s = 1, f, id, c = "#13241d" }) => {
  const sw2 = noise2D(id, f / 40, 0) * 2.5;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d="M-12,0 L-8,-150 Q-30,-190 -50,-200 M-8,-150 Q20,-200 40,-215 M-8,-150 L8,-150 L12,0 Z" fill="#0f0d0c" stroke="#0f0d0c" strokeWidth={10} />
      <g transform={`rotate(${sw2},0,-160)`}>
        {[[-70, -230, 85], [60, -240, 90], [0, -310, 100], [-30, -180, 70], [50, -180, 70], [-90, -170, 55]].map(([dx, dy, r], i) => (
          <g key={i}><circle cx={dx} cy={dy} r={r} fill={c} stroke="#081310" strokeWidth={4} /><circle cx={dx - r * 0.25} cy={dy - r * 0.3} r={r * 0.45} fill="#1b3329" opacity={0.6} /></g>
        ))}
      </g>
    </g>
  );
};

const Window: React.FC<{ x: number; y: number; w: number; h: number; lit: number; f: number; curtains?: string; shade?: boolean; frosted?: boolean; open?: number; seed?: string; night?: boolean }> = ({ x, y, w, h, lit, f, curtains = "#c9542c", shade, frosted, open = 0, seed = "w", night = true }) => {
  const flick = lit > 0 ? 0.92 + 0.08 * Math.sin(f / 7 + x) : 0;
  const glass = night ? (lit > 0.5 ? "url(#winGlow)" : "#0d1328") : "#a9c8e2";
  return (
    <g>
      {lit > 0.5 && night && <rect x={x - 30} y={y - 20} width={w + 60} height={h + 60} fill="#ffcf6b" opacity={0.1 * flick} rx={30} />}
      <rect x={x - 10} y={y - 10} width={w + 20} height={h + 20} fill="#d9d4c8" stroke={INK} strokeWidth={sw} />
      <rect x={x} y={y} width={w} height={h} fill={glass} stroke={INK} strokeWidth={3} opacity={lit > 0.5 ? flick : 1} />
      {frosted && <rect x={x} y={y} width={w} height={h} fill="#c9d7e6" opacity={lit > 0.5 ? 0.35 : 0.25} />}
      {lit > 0.5 && night && !frosted && (
        <>
          <path d={`M${x},${y} L${x + w * 0.28},${y} Q${x + w * 0.22},${y + h * 0.5} ${x + w * 0.3},${y + h} L${x},${y + h} Z`} fill={curtains} opacity={0.9} />
          <path d={`M${x + w},${y} L${x + w * 0.72},${y} Q${x + w * 0.78},${y + h * 0.5} ${x + w * 0.7},${y + h} L${x + w},${y + h} Z`} fill={curtains} opacity={0.9} />
        </>
      )}
      {shade && <rect x={x} y={y} width={w} height={h * 0.35} fill={night ? "#d9c9a8" : "#e8e2d4"} opacity={0.9} />}
      {open > 0 && <rect x={x} y={y} width={w * 0.5 * open} height={h} fill="#05070e" />}
      <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#d9d4c8" strokeWidth={7} />
      {!frosted && <line x1={x} y1={y + h * 0.5} x2={x + w} y2={y + h * 0.5} stroke="#d9d4c8" strokeWidth={5} />}
      <path d={`M${x + 8},${y + h * 0.4} L${x + w * 0.3},${y + 8}`} stroke="#fff" strokeWidth={5} opacity={0.25} />
      <rect x={x - 16} y={y + h + 8} width={w + 32} height={12} fill="#c8c2b4" stroke={INK} strokeWidth={3} />
    </g>
  );
};

/** front of the Miyazawa home at night: hipped tiled roof, white plaster, balcony, red car */
export const FrontHouse: React.FC<{ f: number; lights?: number; px?: number }> = ({ f, lights = 1, px = 0 }) => (
  <g>
    <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#nsky)" />
    <Stars f={f} />
    <g transform={`translate(${px * 0.2},0)`}>
      <circle cx={840} cy={230} r={150} fill="#e9ddb0" opacity={0.06} /><circle cx={840} cy={230} r={60} fill="#efe4bb" stroke={INK} strokeWidth={3} />
      <circle cx={822} cy={218} r={9} fill="#d6c993" /><circle cx={856} cy={250} r={6} fill="#d6c993" />
    </g>
    <g transform={`translate(${px * 0.35},0)`}><Skyline f={f} y={760} /></g>
    <g transform={`translate(${px * 0.55},0)`}>
      {[[40, 900, 1.2], [260, 860, 1], [1010, 900, 1.25], [820, 850, 0.95]].map(([x, y, s], i) => <Tree2 key={i} id={`ft${i}`} x={x} y={y} s={s} f={f} />)}
    </g>
    {/* utility pole + wires */}
    <rect x={985} y={380} width={26} height={1100} fill="#2b2826" stroke={INK} strokeWidth={sw} />
    <rect x={940} y={430} width={116} height={16} fill="#2b2826" stroke={INK} strokeWidth={3} />
    {[0, 1, 2].map((i) => <path key={i} d={`M-30,${400 + i * 26} Q520,${520 + i * 22} 990,${436 + i * 4}`} stroke="#07080c" strokeWidth={3} fill="none" />)}
    <rect x={965} y={520} width={66} height={56} rx={6} fill="#3a3632" stroke={INK} strokeWidth={3} />
    {/* house: annex right (balcony) */}
    <rect x={590} y={760} width={380} height={600} fill="url(#plaster)" stroke={INK} strokeWidth={sw} />
    <path d="M560,770 L680,640 L880,640 L1000,770 Z" fill="url(#tiles)" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
    <rect x={555} y={764} width={450} height={12} fill="#1c1f28" stroke={INK} strokeWidth={2} />
    <Window x={650} y={820} w={120} h={130} lit={lights} f={f} curtains="#3a6ab0" />
    <Window x={820} y={820} w={110} h={130} lit={0} f={f} shade />
    <rect x={630} y={1010} width={320} height={20} fill="#f2f2f2" stroke={INK} strokeWidth={3} />
    {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={640 + i * 27} y1={1030} x2={640 + i * 27} y2={1110} stroke="#ececec" strokeWidth={6} />)}
    <rect x={630} y={1106} width={320} height={14} fill="#f2f2f2" stroke={INK} strokeWidth={3} />
    {/* AC unit on balcony */}
    <g transform="translate(860,1150)"><rect width={90} height={70} fill="#d7d3c9" stroke={INK} strokeWidth={3} /><circle cx={40} cy={35} r={24} fill="#8f8b82" stroke={INK} strokeWidth={3} />
      <g transform={`rotate(${f * 25},40,35)`}><path d="M40,35 L40,14 M40,35 L58,46 M40,35 L22,46" stroke={INK} strokeWidth={4} /></g></g>
    {/* main left part */}
    <rect x={130} y={700} width={500} height={660} fill="url(#plaster)" stroke={INK} strokeWidth={sw} />
    <path d="M90,715 L260,540 L510,540 L670,715 Z" fill="url(#tiles)" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
    <rect x={84} y={708} width={592} height={14} fill="#1c1f28" stroke={INK} strokeWidth={2} />
    {[300, 440].map((x) => <g key={x}><rect x={x} y={555} width={38} height={42} fill="#8f3a2f" stroke={INK} strokeWidth={3} /><rect x={x - 4} y={550} width={46} height={10} fill="#6e2b23" stroke={INK} strokeWidth={2} /></g>)}
    <Window x={180} y={780} w={130} h={120} lit={lights} f={f} curtains="#c9542c" />
    <Window x={380} y={780} w={190} h={130} lit={lights} f={f} curtains="#8a4bb0" />
    <Window x={180} y={1000} w={230} h={160} lit={lights} f={f} curtains="#c9542c" />
    {/* entrance */}
    <rect x={460} y={1150} width={110} height={210} fill="#3b2c22" stroke={INK} strokeWidth={sw} />
    <rect x={470} y={1160} width={40} height={190} fill="#46352a" /><rect x={520} y={1160} width={40} height={190} fill="#46352a" />
    <circle cx={515} cy={1260} r={5} fill="#d6b56d" />
    <rect x={440} y={1120} width={150} height={24} fill="#1c1f28" stroke={INK} strokeWidth={3} />
    <circle cx={600} cy={1170} r={11} fill="#ffe6a0" opacity={0.9} /><circle cx={600} cy={1170} r={40} fill="#ffe6a0" opacity={0.12} />
    {/* gutters & downpipes */}
    <rect x={124} y={720} width={14} height={640} fill="#596079" stroke={INK} strokeWidth={2} />
    <rect x={964} y={776} width={12} height={584} fill="#596079" stroke={INK} strokeWidth={2} />
    {/* red car in the carport (as in the aerial photo) */}
    <g transform="translate(640,1250)">
      <path d="M0,90 L10,40 Q30,0 90,-5 L200,-5 Q250,0 270,40 L290,90 Z" fill="#9b1d1d" stroke={INK} strokeWidth={sw} />
      <path d="M50,35 Q70,8 110,6 L150,6 L150,35 Z" fill="#20283c" stroke={INK} strokeWidth={3} /><path d="M160,6 L200,6 Q235,10 250,35 L160,35 Z" fill="#20283c" stroke={INK} strokeWidth={3} />
      <circle cx={70} cy={92} r={28} fill="#111" stroke={INK} strokeWidth={4} /><circle cx={230} cy={92} r={28} fill="#111" stroke={INK} strokeWidth={4} />
      <circle cx={70} cy={92} r={10} fill="#777" /><circle cx={230} cy={92} r={10} fill="#777" />
    </g>
    {/* block wall + gate */}
    <rect x={-20} y={1300} width={1120} height={120} fill="url(#blocks)" stroke={INK} strokeWidth={sw} />
    <rect x={-20} y={1292} width={1120} height={14} fill="#8a8fa0" stroke={INK} strokeWidth={3} />
    <rect x={420} y={1300} width={190} height={120} fill="#22252e" stroke={INK} strokeWidth={3} />
    {Array.from({ length: 8 }).map((_, i) => <line key={i} x1={432 + i * 24} y1={1304} x2={432 + i * 24} y2={1416} stroke="#4b5060" strokeWidth={4} />)}
    <g transform="translate(360,1330)"><rect width={44} height={56} fill="#c74234" stroke={INK} strokeWidth={3} /><rect x={8} y={14} width={28} height={6} fill="#111" /></g>
    {Array.from({ length: 12 }).map((_, i) => <path key={i} d={`M${i * 95 + 20},1300 q15,-26 32,0`} fill="#1f3a28" stroke={INK} strokeWidth={2} />)}
    {/* street */}
    <rect x={-300} y={1420} width={W + 600} height={1000} fill="#1c1f29" />
    <rect x={-300} y={1420} width={W + 600} height={22} fill="#2e3240" />
    {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={i * 150 + 10} y={1640} width={90} height={12} rx={6} fill="#4a5068" />)}
    {/* street lamp */}
    <rect x={30} y={930} width={16} height={500} fill="#30343f" stroke={INK} strokeWidth={3} />
    <path d="M38,935 Q70,905 120,925" stroke="#30343f" strokeWidth={12} fill="none" />
    <path d="M100,918 L142,918 L136,938 L106,938 Z" fill="#30343f" stroke={INK} strokeWidth={3} />
    <path d="M110,938 L132,938 L330,1530 L-90,1530 Z" fill="url(#cone)" opacity={0.75 + 0.25 * (random(`sl${Math.floor(f / 3)}`) > 0.08 ? 1 : 0)} />
    {[0, 1, 2].map((i) => <circle key={i} cx={120 + Math.sin(f / 5 + i * 2) * 26} cy={970 + Math.cos(f / 6 + i) * 18} r={2.5} fill="#fff" />)}
    <rect x={-300} y={1200} width={W + 600} height={400} fill="url(#fog)" transform={`translate(${Math.sin(f / 50) * 30},0)`} />
  </g>
);

/** rear of the house, park side: open upstairs bathroom window, AC unit, block fence */
export const RearHouse: React.FC<{ f: number; winOpen: number; screen: number }> = ({ f, winOpen, screen }) => (
  <g>
    <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#nsky)" />
    <Stars f={f} />
    <Skyline f={f} y={700} />
    {/* house rear wall */}
    <rect x={180} y={540} width={760} height={900} fill="url(#plaster)" stroke={INK} strokeWidth={sw} />
    <path d="M140,555 L330,400 L790,400 L980,555 Z" fill="url(#tiles)" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
    <rect x={134} y={548} width={852} height={14} fill="#1c1f28" stroke={INK} strokeWidth={2} />
    {/* upstairs bathroom window (entry) */}
    <Window x={300} y={640} w={150} h={150} lit={0} f={f} frosted open={winOpen} />
    {/* fly screen falling */}
    {screen > 0 && <g transform={`translate(${300 + screen * 40},${640 + screen * 760}) rotate(${screen * 160})`} opacity={1 - Math.max(0, screen - 0.9) * 10}><rect width={150} height={150} fill="none" stroke="#9aa3ad" strokeWidth={5} /><rect width={150} height={150} fill="#9aa3ad" opacity={0.25} /></g>}
    <Window x={620} y={640} w={200} h={150} lit={1} f={f} curtains="#3a6ab0" />
    <Window x={300} y={950} w={180} h={150} lit={1} f={f} curtains="#c9542c" />
    <Window x={640} y={950} w={160} h={150} lit={0} f={f} shade />
    {/* vent + pipes */}
    <rect x={520} y={700} width={50} height={50} rx={25} fill="#bdb7aa" stroke={INK} strokeWidth={3} />
    {[0, 1, 2].map((i) => <line key={i} x1={528} y1={712 + i * 13} x2={562} y2={712 + i * 13} stroke={INK} strokeWidth={3} />)}
    <rect x={186} y={560} width={14} height={880} fill="#596079" stroke={INK} strokeWidth={2} />
    {/* AC outdoor unit on a stand (used as a step) */}
    <g transform="translate(330,1150)">
      <rect x={0} y={0} width={180} height={130} fill="#d7d3c9" stroke={INK} strokeWidth={sw} />
      <circle cx={75} cy={65} r={48} fill="#7d7a72" stroke={INK} strokeWidth={4} />
      <g transform={`rotate(${f * 20},75,65)`}>{[0, 120, 240].map((a) => <path key={a} d="M75,65 Q95,40 75,22" transform={`rotate(${a},75,65)`} fill="#5f5c55" stroke={INK} strokeWidth={2} />)}</g>
      {Array.from({ length: 6 }).map((_, i) => <line key={i} x1={135} y1={18 + i * 18} x2={170} y2={18 + i * 18} stroke="#9a968c" strokeWidth={4} />)}
      <rect x={10} y={130} width={14} height={90} fill="#555" stroke={INK} strokeWidth={2} /><rect x={156} y={130} width={14} height={90} fill="#555" stroke={INK} strokeWidth={2} />
      <path d="M90,0 Q95,-60 140,-80 L140,-260" stroke="#e4e0d6" strokeWidth={10} fill="none" />
    </g>
    {/* block fence (foreground), moss */}
    <rect x={-40} y={1370} width={1160} height={170} fill="url(#blocks)" stroke={INK} strokeWidth={sw} />
    <rect x={-40} y={1360} width={1160} height={16} fill="#8a8fa0" stroke={INK} strokeWidth={3} />
    {Array.from({ length: 16 }).map((_, i) => <path key={i} d={`M${i * 70},1540 q12,-${20 + (i % 3) * 14} 26,0`} fill="#20402c" />)}
    {/* park path + trees (foreground) */}
    <rect x={-300} y={1540} width={W + 600} height={900} fill="#151a17" />
    <path d="M-100,1720 Q540,1650 1180,1720 L1180,1800 Q540,1730 -100,1800 Z" fill="#2b2a26" />
    <Tree2 id="r1" x={980} y={1600} s={1.4} f={f} />
    <Tree2 id="r2" x={60} y={1640} s={1.3} f={f} />
    {/* park lamp */}
    <rect x={820} y={1200} width={12} height={420} fill="#2a2e38" />
    <circle cx={826} cy={1195} r={20} fill="#fff3c8" opacity={0.9} />
    <circle cx={826} cy={1195} r={180} fill="#fff3c8" opacity={0.07} />
    <rect x={-300} y={1250} width={W + 600} height={500} fill="url(#fog)" transform={`translate(${Math.sin(f / 45) * 40},0)`} />
  </g>
);

/** cross-section of the house: loft, 2F (bathroom, Rei's room, landing), 1F (office, kitchen), stairs */
export const Cutaway: React.FC<{ f: number; lights: number; flash: number; rooms?: Record<string, number> }> = ({ f, lights, flash }) => {
  const dim = (k: number) => 0.75 - 0.6 * (1 - lights) * k;
  return (
    <g>
      <rect x={-400} y={-400} width={W + 800} height={H + 800} fill="url(#nsky)" />
      <Stars f={f} />
      {/* ground */}
      <rect x={-400} y={1400} width={W + 800} height={800} fill="#2a2119" />
      {Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={random(`g${i}`) * W} cy={1420 + random(`h${i}`) * 300} r={3 + random(`r${i}`) * 4} fill="#3a2e23" />)}
      {/* roof */}
      <path d="M40,640 L540,320 L1040,640 L990,640 L540,356 L90,640 Z" fill="url(#tiles)" stroke={INK} strokeWidth={sw} />
      <path d="M90,640 L540,356 L990,640 Z" fill="#3a2f28" />
      {/* loft room */}
      <path d="M250,640 L540,456 L830,640 Z" fill="url(#wallpaperL)" />
      <rect x={250} y={630} width={580} height={12} fill="#5a4330" />
      {/* floors */}
      <rect x={110} y={640} width={860} height={20} fill="url(#hatch)" stroke={INK} strokeWidth={3} />
      <rect x={110} y={1000} width={860} height={20} fill="url(#hatch)" stroke={INK} strokeWidth={3} />
      {/* 2F rooms */}
      <rect x={110} y={660} width={290} height={340} fill="url(#btiles)" />
      <rect x={410} y={660} width={360} height={340} fill="url(#wallpaperR)" />
      <rect x={780} y={660} width={190} height={340} fill="#7a6a58" />
      {/* 1F rooms */}
      <rect x={110} y={1020} width={410} height={360} fill="#6f7a63" />
      <rect x={530} y={1020} width={240} height={360} fill="#c9c2b0" />
      <rect x={780} y={1020} width={190} height={360} fill="#7a6a58" />
      {/* floors (wood) */}
      <rect x={410} y={975} width={360} height={25} fill="#7a5a3c" /><rect x={110} y={1355} width={660} height={25} fill="#7a5a3c" /><rect x={250} y={615} width={580} height={25} fill="url(#tatami)" />
      {/* interior walls */}
      {[400, 770].map((x) => <rect key={x} x={x} y={660} width={12} height={340} fill="url(#hatch)" stroke={INK} strokeWidth={2} />)}
      {[520, 770].map((x) => <rect key={x} x={x} y={1020} width={12} height={360} fill="url(#hatch)" stroke={INK} strokeWidth={2} />)}
      {/* outer walls */}
      <rect x={92} y={640} width={20} height={740} fill="url(#hatch)" stroke={INK} strokeWidth={3} />
      <rect x={968} y={640} width={20} height={740} fill="url(#hatch)" stroke={INK} strokeWidth={3} />
      <rect x={92} y={1380} width={896} height={22} fill="url(#hatch)" stroke={INK} strokeWidth={3} />
      {/* bathroom: tub, sink, open window in outer wall */}
      <rect x={92} y={740} width={20} height={110} fill="#0a0e1c" />
      <path d={`M60,${760 + Math.sin(f / 4) * 6} q30,40 0,80`} stroke="#dfe7ea" strokeWidth={6} fill="none" opacity={0.7} />
      <path d="M130,1000 L130,900 L330,900 L330,1000 Z" fill="#e9eef0" stroke={INK} strokeWidth={3} />
      <rect x={120} y={890} width={220} height={16} rx={6} fill="#f4f7f8" stroke={INK} strokeWidth={3} />
      <rect x={345} y={850} width={45} height={60} fill="#f4f7f8" stroke={INK} strokeWidth={3} /><rect x={340} y={760} width={55} height={70} rx={6} fill="#c8dbe2" stroke={INK} strokeWidth={3} />
      {/* Rei's room: bed, desk, toy shelf, poster */}
      <rect x={430} y={900} width={210} height={70} rx={8} fill="#c7b9a0" stroke={INK} strokeWidth={3} />
      <rect x={430} y={880} width={36} height={95} rx={6} fill="#8a6a4a" stroke={INK} strokeWidth={3} />
      <rect x={680} y={860} width={70} height={110} fill="#8a6a4a" stroke={INK} strokeWidth={3} />
      {[0, 1, 2].map((i) => <rect key={i} x={690 + i * 18} y={872} width={14} height={30} fill={["#d8443a", "#3e7bd6", "#e8b23a"][i]} stroke={INK} strokeWidth={2} />)}
      <rect x={520} y={730} width={80} height={100} fill="#f2e6c9" stroke={INK} strokeWidth={3} /><circle cx={560} cy={770} r={24} fill="#3e7bd6" />
      {/* landing + stairs between floors */}
      {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={790 + i * 17} y={1380 - (i + 1) * 36} width={180 - i * 17} height={36} fill="#9b7650" stroke={INK} strokeWidth={2} />)}
      {/* 1F office: desk + CRT */}
      <rect x={160} y={1250} width={220} height={18} fill="#8a6a4a" stroke={INK} strokeWidth={3} />
      <rect x={170} y={1268} width={14} height={100} fill="#6b4f36" /><rect x={356} y={1268} width={14} height={100} fill="#6b4f36" />
      <rect x={190} y={1150} width={120} height={100} rx={8} fill="#ddd6c3" stroke={INK} strokeWidth={3} />
      <rect x={200} y={1160} width={100} height={70} fill="#2e6fd6" opacity={0.85} />
      <rect x={400} y={1090} width={100} height={260} fill="#6b4f36" stroke={INK} strokeWidth={3} />
      {[0, 1, 2, 3].map((r) => <rect key={r} x={408} y={1100 + r * 62} width={84} height={6} fill="#4d3826" />)}
      {/* kitchen: counter, knife block, fridge */}
      <rect x={540} y={1260} width={150} height={100} fill="#d6cfbd" stroke={INK} strokeWidth={3} /><rect x={535} y={1250} width={160} height={14} fill="#a39b88" stroke={INK} strokeWidth={2} />
      <path d="M620,1250 L640,1200 L668,1200 L660,1250 Z" fill="#6b4630" stroke={INK} strokeWidth={3} />
      <rect x={700} y={1130} width={65} height={230} rx={8} fill="#e4e0d4" stroke={INK} strokeWidth={3} />
      <rect x={560} y={1080} width={110} height={70} fill="#a7a08c" stroke={INK} strokeWidth={3} />
      {/* lamps */}
      {[[255, 670], [590, 670], [320, 1030], [650, 1030], [540, 470]].map(([x, y], i) => (
        <g key={i}><line x1={x} y1={y} x2={x} y2={y + 40} stroke={INK} strokeWidth={3} /><path d={`M${x - 26},${y + 62} L${x + 26},${y + 62} L${x + 16},${y + 40} L${x - 16},${y + 40} Z`} fill="#e9dcc2" stroke={INK} strokeWidth={2} />
          {lights > 0.3 && <path d={`M${x - 26},${y + 62} L${x + 26},${y + 62} L${x + 120},${y + 320} L${x - 120},${y + 320} Z`} fill="url(#cone)" opacity={0.35 * lights} />}</g>
      ))}
      {/* night darkness inside */}
      <rect x={92} y={340} width={896} height={1060} fill="#060a18" opacity={dim(1) * 0.55 + (1 - lights) * 0.3} />
      {/* red flash */}
      <rect x={-400} y={-400} width={W + 800} height={H + 800} fill="#9e0f0f" opacity={flash * 0.45} />
    </g>
  );
};

export const Img2: React.FC<{ n: string; x: number; y: number; h: number; flip?: boolean; rot?: number; style?: React.CSSProperties; opacity?: number; ratio?: number }> = ({ n, x, y, h, flip, rot = 0, style, opacity = 1, ratio }) => {
  const R: Record<string, number> = { mikio: 356 / 1018, yasuko: 350 / 996, rei: 314 / 788, niina: 382 / 782, killer: 356 / 1018 };
  const w = h * (ratio ?? R[n] ?? 0.4);
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${flip ? -1 : 1},1)`} opacity={opacity}>
      <image href={staticFile(`miya2/${n}.png`)} x={-w / 2} y={-h} width={w} height={h} style={style} />
    </g>
  );
};
