import React from "react";
import { random } from "remotion";
import { noise2D } from "@remotion/noise";
import { OUT } from "./Toon";

export const W = 1080, H = 1920;
const sw = 5;

export const Stars: React.FC<{ f: number; n?: number; h?: number }> = ({ f, n = 70, h = 700 }) => (
  <g>{Array.from({ length: n }).map((_, i) => (
    <circle key={i} cx={random(`sx${i}`) * W} cy={random(`sy${i}`) * h} r={1.5 + random(`sr${i}`) * 2.2} fill="#fff" opacity={0.25 + 0.75 * Math.abs(Math.sin(f / (8 + (i % 7)) + i))} />
  ))}</g>
);

const Tree: React.FC<{ x: number; y: number; s?: number; f: number; night?: boolean; id: string }> = ({ x, y, s = 1, f, night, id }) => {
  const sway = noise2D(id, f / 40, 0) * 3;
  const c1 = night ? "#16261f" : "#4f8a4c", c2 = night ? "#1d3229" : "#64a35c", tr = night ? "#1a1512" : "#5b4430";
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d="M-14,0 L-10,-170 L10,-170 L14,0 Z" fill={tr} stroke={OUT} strokeWidth={sw} />
      <g transform={`rotate(${sway},0,-170)`}>
        {[[-60, -230, 80], [50, -240, 85], [0, -300, 95], [-30, -190, 70], [45, -185, 65]].map(([dx, dy, r], i) => (
          <circle key={i} cx={dx} cy={dy} r={r} fill={i % 2 ? c2 : c1} stroke={OUT} strokeWidth={sw} />
        ))}
        {[[-60, -230, 80], [50, -240, 85], [0, -300, 95], [-30, -190, 70], [45, -185, 65]].map(([dx, dy, r], i) => (
          <circle key={"i" + i} cx={dx} cy={dy} r={r - 6} fill={i % 2 ? c2 : c1} />
        ))}
      </g>
    </g>
  );
};

/** Miyazawa duplex exterior, modelled on the aerial photo (white walls, dark hipped roof, white balcony) */
export const HouseExt: React.FC<{ f: number; night?: boolean; lights?: number; winOpen?: boolean; grLight?: number; abandoned?: boolean }> = ({ f, night = true, lights = 1, winOpen, grLight = 0, abandoned }) => {
  const wall = night ? "#8d93ab" : "#f1eee7", wall2 = night ? "#7f859d" : "#e4dfd4", roof = night ? "#272b38" : "#4a4e58", roofL = night ? "#323746" : "#5b606b";
  const lit = (k: number) => (night ? (k > 0.5 ? "#ffd87a" : "#151a2b") : "#a9cbe6");
  const flick = night ? 0.85 + 0.15 * (random(`lf${Math.floor(f / 3)}`) > 0.1 ? 1 : 0.3) : 0;
  return (
    <g>
      <rect x={-400} y={-400} width={W + 800} height={H + 800} fill={night ? "url(#nightSky)" : "url(#daySky)"} />
      {night ? <Stars f={f} /> : null}
      {night ? (
        <g><circle cx={850} cy={250} r={120} fill="#f5e6a8" opacity={0.08} /><circle cx={850} cy={250} r={62} fill="#f3e7b6" stroke={OUT} strokeWidth={4} /><circle cx={832} cy={238} r={10} fill="#d9cc98" /><circle cx={865} cy={270} r={7} fill="#d9cc98" /></g>
      ) : (
        <g><circle cx={860} cy={240} r={70} fill="#fff1b8" opacity={0.6} /><circle cx={860} cy={240} r={50} fill="#ffe58a" /></g>
      )}
      {/* distant apartment blocks */}
      {[[-20, 520, 260], [250, 470, 200], [700, 500, 220], [930, 450, 200]].map(([x, y, w], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height={600} fill={night ? "#1f2640" : "#b9c6d6"} stroke={OUT} strokeWidth={3} />
          {Array.from({ length: 9 }).map((_, r) => Array.from({ length: Math.floor(w / 46) }).map((_, c) => {
            const on = random(`ap${i}-${r}-${c}`) > (night ? 0.55 : 2);
            return <rect key={`${r}-${c}`} x={x + 16 + c * 46} y={y + 20 + r * 52} width={24} height={28} fill={on ? "#f7d27a" : night ? "#2b3354" : "#d6e1ec"} opacity={on && random(`ab${i}${r}${c}${Math.floor(f / 40)}`) > 0.97 ? 0.4 : 1} />;
          }))}
        </g>
      ))}
      {/* park trees (Soshigaya park) */}
      {[[60, 880, 1.1], [300, 830, 0.9], [980, 900, 1.15], [800, 840, 0.85]].map(([x, y, s], i) => <Tree key={i} id={`pt${i}`} x={x} y={y} s={s} f={f} night={night} />)}
      {/* utility pole + wires */}
      <rect x={968} y={430} width={24} height={1000} fill={night ? "#3a3530" : "#8c8279"} stroke={OUT} strokeWidth={sw} />
      <rect x={930} y={480} width={100} height={14} fill={night ? "#3a3530" : "#8c8279"} stroke={OUT} strokeWidth={4} />
      {[0, 1, 2].map((i) => <path key={i} d={`M-20,${430 + i * 24} Q500,${560 + i * 20} 960,${486 + i * 4}`} stroke="#0d0e12" strokeWidth={3} fill="none" />)}
      <rect x={950} y={560} width={60} height={50} rx={6} fill={night ? "#2e2b28" : "#77706a"} stroke={OUT} strokeWidth={4} />
      {/* ---- house ---- */}
      {/* right annex (grandmother's half) */}
      <g>
        <rect x={600} y={770} width={360} height={560} fill={wall2} stroke={OUT} strokeWidth={sw} />
        <path d="M570,780 L690,640 L880,640 L990,780 Z" fill={roof} stroke={OUT} strokeWidth={sw} strokeLinejoin="round" />
        {Array.from({ length: 6 }).map((_, i) => <line key={i} x1={600 + i * 4} y1={760 - i * 22} x2={960 - i * 4} y2={760 - i * 22} stroke={roofL} strokeWidth={3} />)}
        <rect x={660} y={830} width={120} height={120} fill={lit(grLight)} stroke={OUT} strokeWidth={sw} />
        <line x1={720} y1={830} x2={720} y2={950} stroke={OUT} strokeWidth={4} />
        <rect x={820} y={830} width={100} height={120} fill={lit(grLight)} stroke={OUT} strokeWidth={sw} />
        {/* balcony */}
        <rect x={640} y={1010} width={300} height={22} fill="#f8f8f8" stroke={OUT} strokeWidth={4} />
        {Array.from({ length: 11 }).map((_, i) => <line key={i} x1={650 + i * 28} y1={1032} x2={650 + i * 28} y2={1110} stroke="#f2f2f2" strokeWidth={6} />)}
        <rect x={640} y={1105} width={300} height={16} fill="#f8f8f8" stroke={OUT} strokeWidth={4} />
        <rect x={830} y={1170} width={90} height={160} fill={night ? "#2b2420" : "#5e4636"} stroke={OUT} strokeWidth={sw} />
        <circle cx={845} cy={1255} r={6} fill="#d6b56d" />
      </g>
      {/* main left part (Miyazawa) */}
      <g>
        <rect x={150} y={720} width={480} height={610} fill={wall} stroke={OUT} strokeWidth={sw} />
        <path d="M110,735 L270,560 L520,560 L670,735 Z" fill={roof} stroke={OUT} strokeWidth={sw} strokeLinejoin="round" />
        {Array.from({ length: 7 }).map((_, i) => <line key={i} x1={140 + i * 6} y1={716 - i * 22} x2={640 - i * 6} y2={716 - i * 22} stroke={roofL} strokeWidth={3} />)}
        <rect x={300} y={575} width={36} height={40} fill="#a2463a" stroke={OUT} strokeWidth={4} />
        <rect x={440} y={575} width={36} height={40} fill="#a2463a" stroke={OUT} strokeWidth={4} />
        {/* upstairs: bathroom window (entry point) + bedroom */}
        <rect x={190} y={790} width={110} height={100} fill={winOpen ? "#05070c" : lit(lights)} stroke={OUT} strokeWidth={sw} />
        {!winOpen && <line x1={245} y1={790} x2={245} y2={890} stroke={OUT} strokeWidth={4} />}
        {winOpen && <rect x={245} y={790} width={55} height={100} fill={night ? "#3a4058" : "#bcd5e8"} stroke={OUT} strokeWidth={4} />}
        <rect x={360} y={790} width={200} height={130} fill={lit(lights)} stroke={OUT} strokeWidth={sw} />
        {lights > 0.5 && night && <><rect x={365} y={795} width={50} height={120} fill="#e8622a" opacity={0.85} /><rect x={505} y={795} width={50} height={120} fill="#e8622a" opacity={0.85} /></>}
        <line x1={460} y1={790} x2={460} y2={920} stroke={OUT} strokeWidth={4} />
        {/* ground floor */}
        <rect x={190} y={1020} width={240} height={160} fill={lit(lights)} stroke={OUT} strokeWidth={sw} />
        {lights > 0.5 && night && <path d="M190,1180 L430,1180 L470,1330 L150,1330 Z" fill="#ffd87a" opacity={0.12} />}
        <line x1={310} y1={1020} x2={310} y2={1180} stroke={OUT} strokeWidth={4} />
        <rect x={490} y={1150} width={100} height={180} fill={night ? "#2b2420" : "#5e4636"} stroke={OUT} strokeWidth={sw} />
        <circle cx={575} cy={1240} r={6} fill="#d6b56d" />
        <rect x={470} y={1120} width={140} height={24} fill={roof} stroke={OUT} strokeWidth={4} />
        {/* drain pipe */}
        <rect x={155} y={730} width={14} height={600} fill={night ? "#6b7088" : "#d8d4cb"} stroke={OUT} strokeWidth={3} />
      </g>
      {/* tree beside upstairs window */}
      <Tree id="tw" x={110} y={1330} s={1.25} f={f} night={night} />
      {/* concrete block wall */}
      <rect x={0} y={1250} width={W} height={110} fill={night ? "#666b7c" : "#cfc9bd"} stroke={OUT} strokeWidth={sw} />
      {Array.from({ length: 22 }).map((_, i) => <line key={i} x1={i * 52} y1={1250} x2={i * 52} y2={1360} stroke={night ? "#555a6a" : "#b7b0a2"} strokeWidth={3} />)}
      <line x1={0} y1={1305} x2={W} y2={1305} stroke={night ? "#555a6a" : "#b7b0a2"} strokeWidth={3} />
      {abandoned && Array.from({ length: 14 }).map((_, i) => <path key={i} d={`M${i * 80 + 10},1250 q${20},-${40 + (i % 3) * 20} ${40},0`} fill="#2f4a2d" stroke={OUT} strokeWidth={3} />)}
      {/* street */}
      <rect x={-400} y={1360} width={W + 800} height={1200} fill={night ? "#262a36" : "#8f8f92"} />
      <rect x={0} y={1360} width={W} height={26} fill={night ? "#3a3f4f" : "#b1b1b3"} stroke={OUT} strokeWidth={4} />
      {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={i * 150 + 20} y={1600} width={90} height={14} rx={7} fill={night ? "#59607a" : "#e8e8e8"} />)}
      {/* street lamp */}
      <rect x={20} y={900} width={16} height={480} fill="#3d4150" stroke={OUT} strokeWidth={4} />
      <path d="M28,905 Q60,880 110,900" stroke="#3d4150" strokeWidth={12} fill="none" />
      <path d="M90,895 L130,895 L124,915 L96,915 Z" fill="#3d4150" stroke={OUT} strokeWidth={4} />
      {night && <>
        <path d="M100,915 L120,915 L330,1500 L-110,1500 Z" fill="url(#lightCone)" opacity={flick} />
        <ellipse cx={110} cy={916} rx={22} ry={8} fill="#fff4c4" opacity={flick} />
        {[0, 1, 2].map((i) => <circle key={i} cx={110 + Math.sin(f / 5 + i * 2) * 30} cy={950 + Math.cos(f / 7 + i) * 20} r={3} fill="#fff" opacity={0.8} />)}
      </>}
      {/* vending machine */}
      <g transform="translate(860,1170)">
        <rect width={120} height={210} rx={8} fill={night ? "#c43a3a" : "#d64a3f"} stroke={OUT} strokeWidth={sw} />
        <rect x={12} y={14} width={96} height={100} fill={night ? "#fff6d0" : "#eef3f7"} stroke={OUT} strokeWidth={3} />
        {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={18 + (i % 4) * 23} y={22 + Math.floor(i / 4) * 46} width={14} height={34} rx={4} fill={["#3a7bd5", "#e8b23a", "#57a85a", "#d8443a"][i % 4]} />)}
        <rect x={20} y={150} width={80} height={30} fill="#1d1d24" />
        {night && <rect x={-40} y={-30} width={200} height={300} fill="#fff6d0" opacity={0.06 + 0.03 * Math.sin(f / 4)} />}
      </g>
    </g>
  );
};

/** perspective living room with New Year details */
export const Room: React.FC<{ f: number; night?: number; lampSwing?: number; tvOn?: boolean; noPeople?: boolean }> = ({ f, night = 0, lampSwing = 0, tvOn = true }) => {
  const vpX = 540, vpY = 760;
  const sw2 = 5;
  const lampA = Math.sin(f / 10) * lampSwing;
  return (
    <g>
      {/* back wall */}
      <rect x={-300} y={-300} width={W + 600} height={1540} fill="#e4d6bf" />
      {Array.from({ length: 30 }).map((_, i) => <line key={i} x1={i * 38} y1={0} x2={i * 38} y2={1240} stroke="#d8c8ae" strokeWidth={2} />)}
      {/* left side wall (perspective) */}
      <path d={`M0,0 L130,140 L130,1180 L0,1320 Z`} fill="#d6c6aa" stroke={OUT} strokeWidth={sw2} />
      <path d={`M0,0 L130,140 L950,140 L1080,0 Z`} fill="#efe7d8" stroke={OUT} strokeWidth={sw2} />
      {/* floor with perspective boards */}
      <path d={`M0,1320 L130,1180 L1080,1180 L1080,2600 L0,2600 Z`} fill="#a5764b" stroke={OUT} strokeWidth={sw2} />
      {Array.from({ length: 16 }).map((_, i) => {
        const xb = -600 + i * 160;
        const xt = vpX + (xb - vpX) * 0.08;
        return <line key={i} x1={xt + (1180 - vpY) * 0 + (xb - xt) * ((1180 - vpY) / (1920 - vpY))} y1={1180} x2={xb} y2={1920} stroke="#8c6140" strokeWidth={3} />;
      })}
      {[1260, 1360, 1490, 1660, 1880].map((y) => <line key={y} x1={0} y1={y} x2={W} y2={y} stroke="#8c6140" strokeWidth={2} opacity={0.6} />)}
      {/* skirting */}
      <rect x={130} y={1160} width={950} height={22} fill="#7a5638" stroke={OUT} strokeWidth={4} />
      {/* window w/ curtains */}
      <g>
        <rect x={600} y={330} width={330} height={360} fill={night > 0.5 ? "#0e1530" : "#f2a65e"} stroke={OUT} strokeWidth={sw2} />
        {night > 0.5 ? (
          <g>{Array.from({ length: 14 }).map((_, i) => <rect key={i} x={610 + (i % 7) * 46} y={520 + Math.floor(i / 7) * 60 + (i % 3) * 14} width={10} height={14} fill="#f7d27a" opacity={random(`cw${i}`) > 0.4 ? 1 : 0.2} />)}
            <circle cx={860} cy={400} r={26} fill="#f3e7b6" /></g>
        ) : (
          <g><circle cx={760} cy={600} r={60} fill="#ffcf73" /><rect x={600} y={590} width={330} height={100} fill="#6b5a7a" opacity={0.7} /></g>
        )}
        <line x1={765} y1={330} x2={765} y2={690} stroke="#f6f1e6" strokeWidth={10} />
        <line x1={600} y1={510} x2={930} y2={510} stroke="#f6f1e6" strokeWidth={8} />
        <rect x={600} y={330} width={330} height={360} fill="none" stroke="#f6f1e6" strokeWidth={10} />
        <path d={`M570,300 L660,300 Q${640 + Math.sin(f / 30) * 4},500 650,720 L570,720 Z`} fill="#d65a2e" stroke={OUT} strokeWidth={4} />
        <path d={`M870,300 L960,300 L960,720 L880,720 Q${890 + Math.sin(f / 33) * 4},500 870,300 Z`} fill="#d65a2e" stroke={OUT} strokeWidth={4} />
        <rect x={555} y={288} width={420} height={18} rx={8} fill="#6b4a33" stroke={OUT} strokeWidth={4} />
      </g>
      {/* bookshelf with kagami mochi */}
      <g transform="translate(170,420)">
        <rect width={300} height={600} fill="#7a5233" stroke={OUT} strokeWidth={sw2} />
        {[0, 1, 2, 3].map((r) => (
          <g key={r}>
            <rect x={14} y={20 + r * 145} width={272} height={125} fill="#4e3421" />
            {Array.from({ length: 9 }).map((_, i) => {
              const h = 70 + random(`bk${r}${i}`) * 45;
              return r === 0 && i > 5 ? null : <rect key={i} x={20 + i * 29} y={140 + r * 145 - h} width={24} height={h} fill={["#b8473a", "#3d6fb5", "#e3b04b", "#4d8a57", "#e9e1d0", "#7d4f8f"][(i + r) % 6]} stroke={OUT} strokeWidth={3} />;
            })}
          </g>
        ))}
        {/* kagami mochi (New Year) */}
        <g transform="translate(225,140)">
          <rect x={-40} y={-12} width={80} height={14} fill="#d8443a" stroke={OUT} strokeWidth={3} />
          <ellipse cx={0} cy={-26} rx={36} ry={16} fill="#fbf8f1" stroke={OUT} strokeWidth={3} />
          <ellipse cx={0} cy={-46} rx={26} ry={13} fill="#fbf8f1" stroke={OUT} strokeWidth={3} />
          <circle cx={0} cy={-62} r={11} fill="#f2a53a" stroke={OUT} strokeWidth={3} />
        </g>
      </g>
      {/* calendar + clock */}
      <g transform="translate(520,260)">
        <rect width={64} height={8} fill="#555" />
        <rect y={8} width={64} height={84} fill="#fff" stroke={OUT} strokeWidth={3} />
        <rect y={8} width={64} height={22} fill="#d8443a" />
        <text x={32} y={25} fontSize={15} fontFamily="Fredoka" fontWeight={700} fill="#fff" textAnchor="middle">DEC</text>
        <text x={32} y={70} fontSize={34} fontFamily="Fredoka" fontWeight={700} fill="#111" textAnchor="middle">30</text>
      </g>
      {/* TV cabinet + CRT */}
      <g transform="translate(630,880)">
        <rect width={320} height={140} fill="#5a3d27" stroke={OUT} strokeWidth={sw2} />
        <rect x={20} y={20} width={130} height={100} fill="#43301f" stroke={OUT} strokeWidth={3} />
        <rect x={170} y={20} width={130} height={100} fill="#43301f" stroke={OUT} strokeWidth={3} />
        <rect x={40} y={-170} width={240} height={170} rx={18} fill="#3d3f47" stroke={OUT} strokeWidth={sw2} />
        <rect x={60} y={-152} width={170} height={134} rx={14} fill={tvOn ? "#7fb7d8" : "#1b1e26"} stroke={OUT} strokeWidth={4} />
        {tvOn && <rect x={60} y={-152 + ((f * 3) % 134)} width={170} height={6} fill="#fff" opacity={0.25} />}
        {tvOn && <text x={145} y={-75} fontSize={26} fontFamily="Lilita One" fill="#fff" textAnchor="middle" opacity={0.85}>2000→2001</text>}
        <circle cx={255} cy={-120} r={8} fill="#999" /><circle cx={255} cy={-90} r={8} fill="#999" />
      </g>
      {/* rug */}
      <ellipse cx={560} cy={1520} rx={430} ry={150} fill="#c0563f" stroke={OUT} strokeWidth={sw2} />
      <ellipse cx={560} cy={1520} rx={370} ry={115} fill="none" stroke="#e8b94f" strokeWidth={6} />
      {/* pendant lamp */}
      <g transform={`rotate(${lampA},540,0)`}>
        <line x1={540} y1={0} x2={540} y2={220} stroke={OUT} strokeWidth={5} />
        <path d="M470,270 L610,270 L580,215 L500,215 Z" fill="#e9dcc2" stroke={OUT} strokeWidth={sw2} />
        <ellipse cx={540} cy={272} rx={22} ry={8} fill={night > 0.5 ? "#555" : "#fff3c4"} />
        {night < 0.5 && <path d="M470,270 L610,270 L900,1300 L180,1300 Z" fill="url(#lightCone)" opacity={0.55} />}
      </g>
    </g>
  );
};

/** computer desk (left-front of room), reusable */
export const Desk: React.FC<{ x: number; y: number; f: number; on?: boolean; s?: number; screen?: React.ReactNode }> = ({ x, y, f, on, s = 1, screen }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-20} y={0} width={340} height={26} fill="#8a6a4a" stroke={OUT} strokeWidth={sw} />
    <rect x={0} y={26} width={22} height={250} fill="#6b4f36" stroke={OUT} strokeWidth={4} />
    <rect x={280} y={26} width={22} height={250} fill="#6b4f36" stroke={OUT} strokeWidth={4} />
    {/* tower */}
    <rect x={230} y={-150} width={70} height={150} rx={6} fill="#d9d2c0" stroke={OUT} strokeWidth={sw} />
    <rect x={240} y={-130} width={50} height={8} fill="#9a937f" /><circle cx={265} cy={-30} r={7} fill={on ? "#6cff6c" : "#4a5a4a"} />
    {/* CRT monitor */}
    <rect x={20} y={-30} width={150} height={30} fill="#cfc7b2" stroke={OUT} strokeWidth={4} />
    <rect x={0} y={-200} width={200} height={170} rx={14} fill="#ddd6c3" stroke={OUT} strokeWidth={sw} />
    <rect x={16} y={-186} width={168} height={128} rx={8} fill={on ? "#2e6fd6" : "#1b2230"} stroke={OUT} strokeWidth={4} />
    {on && screen}
    {on && <rect x={16} y={-186 + ((f * 2) % 128)} width={168} height={4} fill="#fff" opacity={0.18} />}
    {/* keyboard */}
    <path d="M20,-6 L190,-6 L200,4 L10,4 Z" fill="#e9e3d2" stroke={OUT} strokeWidth={3} />
  </g>
);

export const Kitchen: React.FC<{ f: number; door: number }> = ({ f, door }) => (
  <g>
    <rect x={-400} y={-400} width={W + 800} height={H + 800} fill="#2c3247" />
    {/* tiles */}
    {Array.from({ length: 14 }).map((_, i) => <line key={"h" + i} x1={0} y1={520 + i * 50} x2={W} y2={520 + i * 50} stroke="#353c55" strokeWidth={3} />)}
    {Array.from({ length: 22 }).map((_, i) => <line key={"v" + i} x1={i * 50} y1={520} x2={i * 50} y2={1220} stroke="#353c55" strokeWidth={3} />)}
    {/* upper cabinets */}
    <rect x={0} y={300} width={560} height={220} fill="#3e4660" stroke={OUT} strokeWidth={sw} />
    {[0, 1, 2].map((i) => <g key={i}><rect x={20 + i * 180} y={320} width={160} height={180} fill="#465071" stroke={OUT} strokeWidth={4} /><rect x={160 + i * 180} y={400} width={8} height={30} rx={3} fill="#9aa3bd" /></g>)}
    {/* window (dark) */}
    <rect x={180} y={600} width={220} height={190} fill="#0c1124" stroke={OUT} strokeWidth={sw} />
    <line x1={290} y1={600} x2={290} y2={790} stroke={OUT} strokeWidth={4} />
    {/* counter */}
    <rect x={0} y={1060} width={620} height={30} fill="#525c78" stroke={OUT} strokeWidth={sw} />
    <rect x={0} y={1090} width={600} height={250} fill="#3a4258" stroke={OUT} strokeWidth={sw} />
    {[0, 1, 2].map((i) => <g key={i}><rect x={20 + i * 195} y={1110} width={175} height={210} fill="#424b66" stroke={OUT} strokeWidth={4} /><rect x={95 + i * 195} y={1130} width={30} height={8} rx={3} fill="#9aa3bd" /></g>)}
    {/* rice cooker + kettle */}
    <g transform="translate(70,1060)"><ellipse cx={50} cy={-50} rx={55} ry={50} fill="#e9e5dc" stroke={OUT} strokeWidth={4} /><ellipse cx={50} cy={-92} rx={42} ry={14} fill="#d2cdc1" stroke={OUT} strokeWidth={3} /><rect x={36} y={-40} width={28} height={14} rx={4} fill="#58c06a" /></g>
    <g transform="translate(470,1060)"><path d="M0,0 L10,-70 Q40,-90 70,-70 L80,0 Z" fill="#b8bec9" stroke={OUT} strokeWidth={4} /><path d="M78,-50 L110,-70" stroke={OUT} strokeWidth={8} /></g>
    {/* floor */}
    <rect y={1340} width={W} height={1200} fill="#232838" />
    {Array.from({ length: 10 }).map((_, i) => <line key={i} x1={i * 120 - 100} y1={1340} x2={i * 180 - 400} y2={1920} stroke="#2d3347" strokeWidth={3} />)}
    {[1420, 1540, 1700].map((y) => <line key={y} x1={0} y1={y} x2={W} y2={y} stroke="#2d3347" strokeWidth={3} />)}
    {/* fridge */}
    <g transform="translate(640,560)">
      <rect width={360} height={780} rx={22} fill="#d7d2c4" stroke={OUT} strokeWidth={sw} />
      {/* interior */}
      <rect x={14} y={14} width={332} height={752} rx={14} fill="#fff8d6" opacity={door} />
      {[200, 380, 560].map((y) => <rect key={y} x={20} y={y} width={320} height={10} fill="#d9cfa5" opacity={door} />)}
      <g opacity={door}>
        {/* fridge contents */}
        <ellipse cx={90} cy={170} rx={50} ry={38} fill="#cfe08a" stroke={OUT} strokeWidth={4} />
        {Array.from({ length: 6 }).map((_, i) => <path key={i} d={`M${60 + i * 12},140 q4,30 0,60`} stroke="#9fb45c" strokeWidth={3} fill="none" />)}
        {[0, 1, 2, 3].map((i) => <g key={i} transform={`translate(${190 + i * 36},130)`}><rect width={28} height={70} rx={6} fill="#c8a165" stroke={OUT} strokeWidth={3} /><rect y={20} width={28} height={20} fill="#fff" /></g>)}
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={40 + i * 56} y={340} width={46} height={40} rx={6} fill={["#f4a6c0", "#fff1c4", "#a7d8f0", "#f4a6c0", "#fff1c4"][i]} stroke={OUT} strokeWidth={3} />)}
        <rect x={40} y={480} width={120} height={70} rx={8} fill="#e86b4f" stroke={OUT} strokeWidth={3} />
        <rect x={190} y={470} width={60} height={80} rx={8} fill="#f4f4f4" stroke={OUT} strokeWidth={3} />
      </g>
    </g>
    {/* light spill from the fridge */}
    <path d="M650,580 L120,1920 L1080,1920 L1000,580 Z" fill="url(#fridgeCone)" opacity={door * 0.8} />
    {/* fridge door swinging open (hinged on right) */}
    <g>
      <path d={`M${1000 - 360 * (1 - door)},560 L1000,560 L1000,1340 L${1000 - 360 * (1 - door)},1340 Z`} fill={door < 0.05 ? "none" : "#c9c4b6"} stroke={door < 0.05 ? "none" : OUT} strokeWidth={sw} />
      {door < 0.05 && <rect x={655} y={760} width={14} height={160} rx={6} fill="#9a9483" stroke={OUT} strokeWidth={3} />}
      {door >= 0.05 && <path d={`M1000,560 L${1000 + 140 * door},600 L${1000 + 140 * door},1300 L1000,1340 Z`} fill="#bdb7a8" stroke={OUT} strokeWidth={sw} />}
    </g>
    {/* calendar on wall */}
    <g transform="translate(470,640)"><rect width={90} height={120} fill="#fff" stroke={OUT} strokeWidth={3} /><rect width={90} height={28} fill="#d8443a" /><text x={45} y={90} fontSize={44} fontFamily="Fredoka" fontWeight={700} textAnchor="middle" fill="#111">30</text></g>
    {/* night dim except fridge light */}
    <rect width={W} height={H} fill="#060914" opacity={0.35 - door * 0.15} />
  </g>
);

export const Bath: React.FC<{ f: number }> = ({ f }) => {
  const flick = random(`bf${Math.floor(f / 2)}`) > 0.08 ? 1 : 0.55;
  return (
    <g>
      <rect x={-400} y={-400} width={W + 800} height={H + 800} fill="#9fb4bd" />
      {Array.from({ length: 30 }).map((_, i) => <line key={"h" + i} x1={0} y1={i * 60} x2={W} y2={i * 60} stroke="#8aa0a9" strokeWidth={3} />)}
      {Array.from({ length: 20 }).map((_, i) => <line key={"v" + i} x1={i * 60} y1={0} x2={i * 60} y2={1300} stroke="#8aa0a9" strokeWidth={3} />)}
      {/* open window (entry point), curtain flapping */}
      <rect x={90} y={300} width={260} height={300} fill="#0c1124" stroke={OUT} strokeWidth={sw} />
      <rect x={220} y={300} width={130} height={300} fill="#2a3352" stroke={OUT} strokeWidth={4} />
      <path d={`M90,300 L200,300 Q${190 + Math.sin(f / 4) * 30},450 ${180 + Math.sin(f / 5) * 40},600 L90,600 Z`} fill="#e8eef0" stroke={OUT} strokeWidth={4} opacity={0.9} />
      {/* mirror cabinet */}
      <rect x={560} y={320} width={340} height={380} rx={14} fill="#c9d6db" stroke={OUT} strokeWidth={sw} />
      <rect x={580} y={340} width={300} height={340} rx={8} fill="#dfeef3" stroke={OUT} strokeWidth={4} />
      <path d="M600,380 L660,340 M600,440 L700,350" stroke="#fff" strokeWidth={8} opacity={0.6} />
      {/* light bar */}
      <rect x={600} y={260} width={260} height={30} rx={14} fill={flick > 0.9 ? "#fffbe6" : "#9aa"} stroke={OUT} strokeWidth={4} />
      <path d="M600,290 L860,290 L1080,1300 L380,1300 Z" fill="url(#lightCone)" opacity={0.45 * flick} />
      {/* sink */}
      <path d="M560,880 L900,880 L870,960 Q730,1000 590,960 Z" fill="#f5f7f8" stroke={OUT} strokeWidth={sw} />
      <rect x={700} y={960} width={60} height={340} fill="#eef1f2" stroke={OUT} strokeWidth={4} />
      <path d="M720,880 L720,840 L770,840" stroke="#9aa3ad" strokeWidth={12} fill="none" strokeLinecap="round" />
      {/* towel */}
      <rect x={950} y={600} width={100} height={260} rx={10} fill="#e8b23a" stroke={OUT} strokeWidth={4} />
      <rect x={930} y={590} width={140} height={16} rx={8} fill="#9aa3ad" stroke={OUT} strokeWidth={3} />
      {/* floor */}
      <rect y={1300} width={W} height={1200} fill="#6d828b" />
      {Array.from({ length: 10 }).map((_, i) => <line key={i} x1={i * 130 - 50} y1={1300} x2={i * 200 - 300} y2={1920} stroke="#5d7079" strokeWidth={3} />)}
      <rect width={W} height={H} fill="#060914" opacity={flick > 0.9 ? 0.18 : 0.4} />
    </g>
  );
};

export const FirstAid: React.FC<{ open: number }> = ({ open }) => (
  <g>
    <rect x={-90} y={-60} width={180} height={120} rx={14} fill="#f2f2f2" stroke={OUT} strokeWidth={sw} />
    <rect x={-20} y={-40} width={40} height={80} fill="#d8443a" /><rect x={-40} y={-20} width={80} height={40} fill="#d8443a" />
    <g transform={`translate(0,-60) rotate(${-open * 70},-90,0)`}>
      <rect x={-90} y={-22} width={180} height={22} rx={8} fill="#e6e6e6" stroke={OUT} strokeWidth={4} />
    </g>
    {open > 0.5 && <><rect x={-70} y={-110} width={50} height={30} rx={6} fill="#fff" stroke={OUT} strokeWidth={3} transform="rotate(-12)" /><circle cx={40} cy={-100} r={22} fill="#fff" stroke={OUT} strokeWidth={3} /><circle cx={40} cy={-100} r={8} fill="#ddd" /></>}
  </g>
);
