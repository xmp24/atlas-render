import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import "@fontsource/fredoka/600.css";
import "@fontsource/fredoka/700.css";
import "@fontsource/lilita-one/400.css";
import { Pic, PicLying, PO, Knife, FlatHouse, FlatRear, FlatCut, PoliceCar, GREY, RED } from "./Picto";
import { T, H1, H3, EV, END, Subs, Grain, VictimCard, Stamp, Mosaic, VHS } from "./Short";

const W = 1080, H = 1920, INK = "#1b1b1b";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const pop = (f: number, s: number, d = 12) => spring({ frame: f - s, fps: 30, config: { damping: d, stiffness: 220 } });
/** hard-cut camera: holds each framing until the next key */
const cut = (f: number, keys: [number, number, number, number][]) => { let k = keys[0]; for (const q of keys) if (f >= q[0]) k = q; return k; };
const View: React.FC<{ f: number; keys: [number, number, number, number][]; bg?: string; children: React.ReactNode }> = ({ f, keys, bg = GREY, children }) => {
  const [a, x, y, s] = cut(f, keys);
  const z = s * (1 + Math.min(0.04, (f - a) * 0.0012)); // tiny drift after each cut
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", background: bg }}>
      <g transform={`translate(${W / 2},${H / 2}) scale(${z}) translate(${-x},${-y})`}>{children}</g>
    </svg>
  );
};
const Badge: React.FC<{ f: number; s: number; x: number; y: number; text: string }> = ({ f, s, x, y, text }) => {
  const p = pop(f, s, 9);
  if (p < 0.01) return null;
  return <g transform={`translate(${x},${y}) scale(${p})`}><circle r={34} fill="#e3262b" /><text y={12} fontFamily="Lilita One" fontSize={34} fill="#fff" textAnchor="middle">{text}</text></g>;
};
const Chip: React.FC<{ t: string }> = ({ t }) => (
  <div style={{ position: "absolute", left: 50, top: 150, background: "#111", borderRadius: 14, padding: "8px 22px", fontFamily: "monospace", fontWeight: 700, fontSize: 60, color: "#ff3b30", border: "4px solid #333" }}>{t}</div>
);

// ---------- scenes ----------
const H2P: React.FC<{ f: number }> = ({ f }) => (
  <>
    <View f={f} keys={[[0, 540, 1100, 1.0], [30, 470, 980, 1.45]]}>
      <FlatHouse night lit />
      <Pic x={200} y={1400} k="killer" p={PO.stand} s={0.9} bg="#e6e6e6" />
    </View>
    <Chip t="11:47 PM" />
  </>
);

const E1P: React.FC<{ f: number }> = ({ f }) => {
  let x = 0, y = 1640, p = PO.walkA, vis = true;
  if (f < 30) { x = 60 + Math.floor(f / 6) * 70; p = Math.floor(f / 6) % 2 ? PO.walkB : PO.walkA; }
  else if (f < 52) { x = 425; y = 1500; p = Math.floor(f / 6) % 2 ? PO.climbB : PO.climbA; }
  else if (f < 74) { x = 425; y = 1170; p = PO.reach; }
  else if (f < 92) { x = 380; y = 790; p = PO.climbA; }
  else vis = false;
  return (
    <>
      <View f={f} keys={[[0, 460, 1450, 1.2], [52, 440, 1120, 1.35], [74, 400, 900, 1.6]]}>
        <FlatRear open={f >= 70} screenDown={f >= 66} />
        {vis && <Pic x={x} y={y} k="killer" p={p} s={0.95} bg={f < 30 ? "#5f8f4e" : GREY} />}
      </View>
      <Chip t="11:58 PM" />
    </>
  );
};

const C1P: React.FC<{ f: number }> = ({ f }) => {
  // killer stations (hard cuts between positions)
  const st: [number, number, number, keyof typeof PO, boolean][] = [
    [0, 230, 1000, "sneak", false], [30, 600, 1000, "creep", true], [70, 880, 1000, "stand", true], [118, 860, 1000, "stab", true],
    [150, 880, 1190, "walkA", true], [175, 820, 1380, "walkB", true], [200, 640, 1380, "reach", true], [236, 870, 1000, "walkA", false], [256, 760, 640, "creep", false], [276, 650, 640, "stab", false],
  ];
  let s = st[0]; for (const q of st) if (f >= q[0]) s = q;
  const route = st.filter((q) => q[0] <= f).map((q) => `${q[1]},${q[2] - 6}`).join(" ");
  const flash = (a: number, b: number) => f >= a && f < b;
  const red = flash(30, 48) || flash(118, 136) || flash(276, 296);
  // Mikio
  let m: [number, number, keyof typeof PO, boolean] = [270, 1380, "type", false];
  if (f >= 75) m = [820, 1380, "walkA", false];
  if (f >= 100) m = [905, 1190, "climbB", false];
  if (f >= 118) m = [930, 1000, "fight", true];
  const keys: [number, number, number, number][] = [[0, 300, 860, 1.75], [30, 540, 880, 1.8], [70, 560, 1180, 1.25], [118, 860, 940, 1.9], [150, 700, 1180, 1.35], [200, 640, 1240, 1.8], [236, 620, 900, 1.2], [256, 560, 540, 1.8], [300, 540, 980, 0.98]];
  const knifeItem = f >= 118 && f < 200 ? <Knife s={0.9} broken={f >= 130} rot={-10} /> : f >= 200 ? <Knife s={0.9} rot={-10} /> : undefined;
  return (
    <>
      <View f={f} keys={keys}>
        <FlatCut dark={f >= 300 ? 0.55 : 0} />
        {/* Rei asleep */}
        <PicLying x={560} y={952} s={0.62} c={f >= 48 ? "#6a6a6a" : "#0d0d0f"} />
        <rect x={545} y={920} width={105} height={40} rx={8} fill="#3e5fa0" />
        {/* Mikio */}
        {f < 136 && <Pic x={m[0]} y={m[1]} k="man" p={PO[m[2]]} flip={m[3]} s={0.92} />}
        {f >= 136 && <PicLying x={910} y={995} s={0.85} c="#6a6a6a" />}
        {/* Yasuko & Niina in the loft */}
        {f < 296 ? (
          <><Pic x={470} y={640} k="woman" p={f >= 262 ? PO.shock : PO.stand} s={0.82} /><Pic x={560} y={640} k="girl" p={f >= 262 ? PO.shock : PO.stand} s={0.82} /></>
        ) : (
          <><PicLying x={480} y={636} s={0.7} c="#6a6a6a" /><PicLying x={600} y={636} s={0.5} c="#6a6a6a" /></>
        )}
        {/* route */}
        <polyline points={route + ` ${s[1]},${s[2] - 6}`} fill="none" stroke="#e3262b" strokeWidth={7} strokeDasharray="16 10" strokeLinecap="round" />
        <Pic x={s[1]} y={s[2]} k="killer" p={PO[s[3]]} flip={s[4]} s={0.92} item={knifeItem} />
        <Mosaic f={f} x={470} y={850} w={220} h={150} o={flash(30, 52) ? 1 : 0} />
        <Mosaic f={f} x={800} y={820} w={180} h={180} o={flash(118, 140) ? 1 : 0} />
        <Mosaic f={f} x={400} y={470} w={300} h={170} o={flash(276, 300) ? 1 : 0} />
        {flash(130, 150) && <g transform={`translate(880,800) scale(${pop(f, 130, 8) * 1.6})`}><Knife broken /><path d="M70,-14 L110,-30 M74,6 L116,18 M66,-4 L120,-6" stroke="#e3262b" strokeWidth={5} /></g>}
        {f >= 200 && f < 236 && <g transform={`translate(600,1180) scale(${pop(f, 200, 8) * 1.8})`}><circle r={60} fill="#fff" opacity={0.6} /><Knife rot={-15} s={0.9} /></g>}
      </View>
      {red && <AbsoluteFill style={{ background: "#c40d0d", opacity: Math.floor(f / 2) % 2 ? 0.35 : 0.15 }} />}
      <VictimCard f={f} s={4} n="rei" name="REI" age="6" x={180} gone={48} />
      <VictimCard f={f} s={78} n="mikio" name="MIKIO" age="44" x={420} gone={136} />
      <VictimCard f={f} s={236} n="yasuko" name="YASUKO" age="41" x={660} gone={296} />
      <VictimCard f={f} s={246} n="niina" name="NIINA" age="8" x={900} gone={296} />
      {flash(132, 150) && <Stamp f={f} s={132} text="BLADE SNAPPED" top={1190} size={80} color="#fff" rot={-4} />}
      {f >= 202 && f < 236 && <Stamp f={f} s={202} text="KITCHEN KNIFE" top={1190} size={80} color="#fff" rot={4} />}
    </>
  );
};

const Lamp: React.FC<{ x: number }> = ({ x }) => (
  <g><line x1={x} y1={0} x2={x} y2={300} stroke="#111" strokeWidth={6} /><path d={`M${x - 80},${380} L${x + 80},${380} L${x + 40},${300} L${x - 40},${300} Z`} fill="#111" /><rect x={x - 80} y={376} width={160} height={10} fill={RED} /></g>
);
const Room: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <g>
    <rect x={-200} y={-200} width={1480} height={2400} fill={GREY} />
    <rect x={-200} y={1500} width={1480} height={700} fill="#c4c4c4" />
    <Lamp x={540} />
    {children}
  </g>
);

const M1P: React.FC<{ f: number }> = ({ f }) => (
  <>
    <View f={f} keys={[[0, 540, 1150, 1.15]]}>
      <Room>
        {/* fridge, door open */}
        <rect x={640} y={760} width={300} height={740} rx={14} fill="#f6f6f6" stroke={INK} strokeWidth={5} />
        <rect x={656} y={776} width={268} height={708} rx={8} fill="#fff6c2" />
        {[960, 1140, 1320].map((y) => <rect key={y} x={660} y={y} width={260} height={10} fill="#d9cf98" />)}
        {[0, 1, 2, 3].map((i) => <rect key={i} x={680 + i * 56} y={890} width={34} height={70} rx={6} fill="#c8a165" />)}
        <ellipse cx={740} cy={1100} rx={56} ry={40} fill="#b9d36a" />
        <rect x={940} y={770} width={70} height={720} fill="#e8e8e8" stroke={INK} strokeWidth={4} />
        {/* red round table like the reference */}
        <ellipse cx={330} cy={1290} rx={190} ry={44} fill={RED} /><rect x={160} y={1290} width={340} height={30} fill="#c43a12" />
        {[200, 440].map((x) => <rect key={x} x={x} y={1310} width={16} height={190} fill="#b0300f" />)}
        {[0, 1, 2, 3].map((i) => f > 8 + i * 7 && <g key={i} transform={`translate(${220 + i * 70},1270) scale(${pop(f, 8 + i * 7, 9)})`}><path d="M-20,0 L20,0 L26,-38 L-26,-38 Z" fill="#f4a6c0" stroke={INK} strokeWidth={3} /></g>)}
        <Pic x={560} y={1500} k="killer" p={PO.eat} s={1.6} item={<path d="M-12,-6 L12,-6 L16,-34 L-16,-34 Z" fill="#f4a6c0" stroke={INK} strokeWidth={2} />} />
      </Room>
    </View>
    <Chip t="12:31 AM" />
    <svg width={W} height={H} style={{ position: "absolute" }}><Badge f={f} s={30} x={900} y={170} text="×4" /></svg>
  </>
);

const M2P: React.FC<{ f: number }> = ({ f }) => (
  <>
    <View f={f} keys={[[0, 540, 1150, 1.15]]}>
      <Room>
        <rect x={600} y={620} width={300} height={360} rx={14} fill="#dbeef8" stroke={INK} strokeWidth={6} />
        <path d="M630,680 L690,640 M630,740 L730,650" stroke="#fff" strokeWidth={10} />
        <path d="M580,1080 L920,1080 L890,1160 Q750,1200 610,1160 Z" fill="#fff" stroke={INK} strokeWidth={5} />
        <rect x={720} y={1160} width={60} height={340} fill="#fff" stroke={INK} strokeWidth={5} />
        {/* first aid kit on the counter */}
        <g transform={`translate(860,1030) scale(${pop(f, 4, 10)})`}>
          <rect x={-70} y={-50} width={140} height={100} rx={12} fill="#fff" stroke={INK} strokeWidth={5} />
          <rect x={-14} y={-34} width={28} height={68} fill="#e3262b" /><rect x={-34} y={-14} width={68} height={28} fill="#e3262b" />
        </g>
        <Pic x={420} y={1500} k="killer" p={PO.hold} s={1.6} item={f > 16 ? <rect x={-20} y={-10} width={40} height={20} rx={5} fill="#fff" stroke="#c41e1e" strokeWidth={4} /> : <circle r={8} fill="#c41e1e" />} />
      </Room>
    </View>
    <Chip t="12:52 AM" />
  </>
);

const M3P: React.FC<{ f: number }> = ({ f }) => (
  <>
    <View f={f} keys={[[0, 540, 1150, 1.15]]}>
      <Room>
        <rect x={160} y={1200} width={520} height={24} fill={RED} />
        {[190, 640].map((x) => <rect key={x} x={x} y={1224} width={18} height={276} fill="#111" />)}
        <rect x={250} y={960} width={300} height={220} rx={12} fill="#222" />
        <rect x={266} y={976} width={268} height={170} fill="#0a246a" />
        <text x={400} y={1030} fontFamily="monospace" fontWeight={700} fontSize={30} fill="#fff" textAnchor="middle">CONNECTED</text>
        <text x={400} y={1110} fontFamily="monospace" fontWeight={700} fontSize={64} fill="#ffd25a" textAnchor="middle">01:18</text>
        <rect x={360} y={1180} width={80} height={22} fill="#222" />
        {/* stool like the reference */}
        <rect x={760} y={1290} width={120} height={20} fill="#111" /><path d="M770,1310 L750,1500 M870,1310 L890,1500 M760,1420 L880,1420" stroke="#111" strokeWidth={14} />
        <Pic x={820} y={1430} k="killer" p={PO.type} s={1.3} flip />
      </Room>
    </View>
    <Chip t="1:18 AM" />
  </>
);

const UNP: React.FC<{ f: number }> = ({ f }) => (
  <>
    <svg width={W} height={H} style={{ position: "absolute", background: "#cfcfcf" }}>
      <g transform="translate(540,1000) rotate(-1.5)">
        <rect x={-340} y={-560} width={680} height={1000} fill="#f2ecdc" stroke={INK} strokeWidth={5} />
        <rect x={-340} y={-560} width={680} height={130} fill="#b8161c" />
        <text y={-468} fontFamily="Lilita One" fontSize={92} fill="#fff" textAnchor="middle" letterSpacing={6}>WANTED</text>
        <rect x={-260} y={-400} width={520} height={600} fill="#e2ddd0" />
        <Pic x={0} y={180} k="killer" p={PO.stand} s={2.3} bg="#e2ddd0" />
        <text y={-60} fontFamily="Lilita One" fontSize={200} fill="#fff" textAnchor="middle">?</text>
        <text y={280} fontFamily="Fredoka" fontWeight={700} fontSize={44} fill={INK} textAnchor="middle">MALE · DNA ON FILE</text>
        <text y={340} fontFamily="Fredoka" fontWeight={600} fontSize={34} fill="#555" textAnchor="middle">NO MATCH IN ANY DATABASE</text>
      </g>
      <PoliceCar x={30} y={1640} f={f} />
    </svg>
    <Stamp f={f} s={30} text="STILL UNSOLVED" top={860} size={110} rot={-10} />
  </>
);

const LIST: [number, number, React.FC<{ f: number }>][] = [
  [T.h1, T.h2, H1], [T.h2, T.h3, H2P], [T.h3, T.e1, H3], [T.e1, T.cut, E1P], [T.cut, T.m1, C1P],
  [T.m1, T.m2, M1P], [T.m2, T.m3, M2P], [T.m3, T.ev, M3P], [T.ev, T.un, EV], [T.un, T.end, UNP], [T.end, T.fin, END],
];
const Scene: React.FC<{ C: React.FC<{ f: number }> }> = ({ C }) => { const f = useCurrentFrame(); return <AbsoluteFill><C f={f} /></AbsoluteFill>; };

export const MiyaPicto: React.FC<{ audio?: boolean }> = ({ audio = false }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    {LIST.map(([a, b, C], i) => <Sequence key={i} from={a} durationInFrames={b - a}><Scene C={C} /></Sequence>)}
    <Subs />
    <Grain />
    {audio && <Audio src={staticFile("miya2/mix.wav")} />}
  </AbsoluteFill>
);
