import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import "@fontsource/fredoka/600.css";
import "@fontsource/fredoka/700.css";
import "@fontsource/lilita-one/400.css";
import { Pic, PO, FlatHouse, FlatRear, GREY } from "./Picto";
import { ReiRoom, Stairs, KitchenRoom, Loft, Living, Bathroom, Office } from "./Rooms";
import { EV, Grain, VictimCard, Stamp, VHS } from "./Short";
import SUBS3 from "./subs3.json";

const W = 1080, H = 1920, INK = "#1b1b1b";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const Q = { hook: 0, ext: 141, entry: 216, trans: 372, rei: 480, mik: 570, kit: 700, loft: 780, stay: 860, m1: 912, m2: 948, m3: 987, ev: 1032, un: 1134, end: 1230, fin: 1291 };
export const Q_FRAMES = Q.fin;
const pop = (f: number, s: number, d = 12) => spring({ frame: f - s, fps: 30, config: { damping: d, stiffness: 200 } });

/** slow, uneasy push-in (camera only, characters stay still) */
const Slow: React.FC<{ f: number; len: number; a: [number, number, number]; b: [number, number, number]; children: React.ReactNode; bg?: string }> = ({ f, len, a, b, children, bg = GREY }) => {
  const k = interpolate(f, [0, len], [0, 1], clamp);
  const x = a[0] + (b[0] - a[0]) * k, y = a[1] + (b[1] - a[1]) * k, s = a[2] + (b[2] - a[2]) * k;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", background: bg }}>
      <g transform={`translate(${W / 2},${H / 2}) scale(${s}) translate(${-x},${-y})`}>{children}</g>
      <defs><radialGradient id="vq" cx="50%" cy="48%" r="72%"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.55" /></radialGradient></defs>
      <rect width={W} height={H} fill="url(#vq)" />
    </svg>
  );
};
const FadeIn: React.FC<{ f: number; d?: number; children: React.ReactNode }> = ({ f, d = 12, children }) => <AbsoluteFill style={{ opacity: interpolate(f, [0, d], [0, 1], clamp) }}>{children}</AbsoluteFill>;
const Chip: React.FC<{ t: string; f: number }> = ({ t, f }) => (
  <div style={{ position: "absolute", left: 50, top: 150, background: "rgba(10,10,12,0.9)", borderRadius: 14, padding: "8px 22px", fontFamily: "monospace", fontWeight: 700, fontSize: 56, color: "#ff3b30", border: "4px solid #333", opacity: Math.floor(f / 20) % 2 ? 1 : 0.85 }}>{t}</div>
);
const Caption: React.FC<{ f: number; s: number; text: string; top?: number }> = ({ f, s, text, top = 330 }) => {
  const o = interpolate(f, [s, s + 12], [0, 1], clamp);
  return <div style={{ position: "absolute", top, width: "100%", textAlign: "center", opacity: o, fontFamily: "Fredoka", fontWeight: 700, fontSize: 44, color: "#e9e4d8", letterSpacing: 8, textShadow: "0 4px 16px #000" }}>{text}</div>;
};

// ---------- scenes ----------
const Hook: React.FC<{ f: number }> = ({ f }) => {
  const len = Q.ext;
  const s = interpolate(f, [0, len], [1.0, 1.22], clamp);
  const gray = interpolate(f, [70, 110], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Img src={staticFile("miya2/steps.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", filter: "blur(30px) brightness(0.3)", transform: "scale(1.3)" }} />
      <Img src={staticFile("miya2/steps.jpg")} style={{ position: "absolute", left: "50%", top: "50%", height: 1920, transform: `translate(-50%,-50%) translate(0px,${(s - 1) * 300}px) scale(${s})`, filter: `grayscale(${gray}) contrast(1.08) sepia(${0.2 - gray * 0.2}) brightness(${1 - gray * 0.25})` }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(0,0,0,0.7) 100%)" }} />
      <VHS f={f} t="DEC.30.2000" />
    </AbsoluteFill>
  );
};

const Ext: React.FC<{ f: number }> = ({ f }) => (
  <FadeIn f={f} d={8}>
    <Slow f={f} len={75} a={[540, 1150, 1.0]} b={[540, 1120, 1.12]}><FlatHouse night lit /></Slow>
    <Caption f={f} s={4} text="SETAGAYA · TOKYO" top={330} />
    <Stamp f={f} s={18} text="NEVER CAUGHT" top={1100} size={110} rot={-8} />
  </FadeIn>
);

const Entry: React.FC<{ f: number }> = ({ f }) => {
  // pose holds with hard cuts: walk → fence → AC unit → window → gone
  let x = 140, y = 1640, p = PO.walkA, vis = true;
  if (f < 34) { x = 120 + Math.floor(f / 11) * 90; p = Math.floor(f / 11) % 2 ? PO.walkB : PO.walkA; }
  else if (f < 64) { x = 425; y = 1500; p = PO.climbA; }
  else if (f < 92) { x = 425; y = 1170; p = PO.reach; }
  else if (f < 116) { x = 380; y = 790; p = PO.climbB; }
  else vis = false;
  const keys: [number, number, number][] = f < 64 ? [460, 1450, 1.2] as any : f < 92 ? [440, 1150, 1.4] as any : [390, 880, 1.75] as any;
  return (
    <>
      <Slow f={f} len={160} a={keys as any} b={[keys[0] as any, (keys[1] as any) - 20, (keys[2] as any) * 1.05]}>
        <FlatRear open={f >= 100} screenDown={f >= 96} />
        {vis && <Pic x={x} y={y} k="killer" p={p} s={0.95} bg={f < 34 ? "#5f8f4e" : GREY} />}
      </Slow>
      <Chip t="11:58 PM" f={f} />
    </>
  );
};

const Trans: React.FC<{ f: number }> = ({ f }) => {
  const black = interpolate(f, [0, 20, 36], [1, 1, 0], clamp);
  return (
    <>
      <Slow f={f} len={108} a={[540, 1100, 1.05]} b={[540, 1060, 1.22]}>
        <FlatHouse night lit={false} car />
        <rect x={-200} y={-200} width={1480} height={2400} fill="#060914" opacity={0.45} />
      </Slow>
      <AbsoluteFill style={{ background: "#000", opacity: black }} />
      <VictimCard f={f} s={44} n="rei" name="REI" age="6" x={180} gone={44} />
      <VictimCard f={f} s={52} n="mikio" name="MIKIO" age="44" x={420} gone={52} />
      <VictimCard f={f} s={60} n="yasuko" name="YASUKO" age="41" x={660} gone={60} />
      <VictimCard f={f} s={68} n="niina" name="NIINA" age="8" x={900} gone={68} />
    </>
  );
};

const RoomShot: React.FC<{ f: number; len: number; a: [number, number, number]; b: [number, number, number]; label: string; children: React.ReactNode }> = ({ f, len, a, b, label, children }) => (
  <FadeIn f={f} d={10}>
    <Slow f={f} len={len} a={a} b={b} bg="#000">{children}</Slow>
    <Caption f={f} s={8} text={label} top={1300} />
  </FadeIn>
);

const Rei: React.FC<{ f: number }> = ({ f }) => (
  <>
    <RoomShot f={f} len={90} a={[540, 1100, 1.0]} b={[480, 1150, 1.15]} label="REI'S ROOM"><ReiRoom f={f} /></RoomShot>
    <VictimCard f={f} s={6} n="rei" name="REI" age="6" x={540} gone={6} />
  </>
);
const Mik: React.FC<{ f: number }> = ({ f }) => (
  <>
    <RoomShot f={f} len={130} a={[600, 1050, 1.0]} b={[560, 1000, 1.35]} label="THE STAIRS"><Stairs f={f} /></RoomShot>
    <VictimCard f={f} s={6} n="mikio" name="MIKIO" age="44" x={540} gone={6} />
  </>
);
const Kit: React.FC<{ f: number }> = ({ f }) => (
  <>
    <RoomShot f={f} len={80} a={[500, 1050, 1.0]} b={[500, 960, 1.4]} label="THE KITCHEN"><KitchenRoom f={f} ring={interpolate(f, [20, 30], [0, 1], clamp)} /></RoomShot>
    {f > 30 && <Stamp f={f} s={30} text="1 KNIFE MISSING" top={560} size={70} color="#fff" rot={-3} />}
  </>
);
const LoftS: React.FC<{ f: number }> = ({ f }) => (
  <>
    <RoomShot f={f} len={80} a={[540, 1200, 1.0]} b={[540, 1250, 1.12]} label="THE LOFT"><Loft f={f} /></RoomShot>
    <VictimCard f={f} s={6} n="yasuko" name="YASUKO" age="41" x={400} gone={6} />
    <VictimCard f={f} s={12} n="niina" name="NIINA" age="8" x={680} gone={12} />
  </>
);
const Stay: React.FC<{ f: number }> = ({ f }) => (
  <>
    <RoomShot f={f} len={52} a={[700, 1150, 1.15]} b={[760, 1180, 1.3]} label=""><Living f={f} /></RoomShot>
    <Chip t="12:30 AM" f={f} />
  </>
);
const M1: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Slow f={f} len={36} a={[900, 1150, 1.25]} b={[920, 1150, 1.32]} bg="#000">
      <KitchenRoom f={f} fridgeOpen />
      <Pic x={880} y={1500} k="killer" p={PO.eat} s={1.5} bg="#9b8a74" item={<path d="M-12,-6 L12,-6 L16,-34 L-16,-34 Z" fill="#f4a6c0" stroke={INK} strokeWidth={2} />} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${520 + i * 46},1076 L${552 + i * 46},1076 L${556 + i * 46},1046 L${516 + i * 46},1046 Z`} fill="#f4a6c0" stroke={INK} strokeWidth={2} />)}
    </Slow>
    <Chip t="12:41 AM" f={f} />
  </>
);
const M2: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Slow f={f} len={39} a={[600, 1100, 1.15]} b={[600, 1100, 1.22]} bg="#000"><Bathroom f={f} band={f > 14} /></Slow>
    <Chip t="12:52 AM" f={f} />
  </>
);
const M3: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Slow f={f} len={45} a={[640, 1100, 1.15]} b={[640, 1080, 1.25]} bg="#000"><Office f={f} /></Slow>
    <Chip t="1:18 AM" f={f} />
  </>
);
const UN: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Slow f={f} len={96} a={[540, 1000, 1.0]} b={[540, 980, 1.08]} bg="#3a3a3f">
      <rect x={-200} y={-200} width={1480} height={2400} fill="#4a4a50" />
      {Array.from({ length: 30 }).map((_, i) => <rect key={i} x={-200} y={i * 70} width={1480} height={4} fill="#43434a" />)}
      <g transform="translate(540,1000) rotate(-1.5)">
        <rect x={-340} y={-560} width={680} height={1000} fill="#f2ecdc" stroke={INK} strokeWidth={5} />
        <rect x={-340} y={-560} width={680} height={130} fill="#b8161c" />
        <text y={-468} fontFamily="Lilita One" fontSize={92} fill="#fff" textAnchor="middle" letterSpacing={6}>WANTED</text>
        <rect x={-260} y={-400} width={520} height={600} fill="#e2ddd0" />
        <Pic x={0} y={180} k="killer" p={PO.stand} s={2.3} bg="#e2ddd0" />
        <text y={-60} fontFamily="Lilita One" fontSize={200} fill="#fff" textAnchor="middle">?</text>
        <text y={280} fontFamily="Fredoka" fontWeight={700} fontSize={44} fill={INK} textAnchor="middle">MALE · DNA ON FILE</text>
        <text y={340} fontFamily="Fredoka" fontWeight={600} fontSize={34} fill="#555" textAnchor="middle">NO MATCH IN ANY DATABASE</text>
        <circle cx={-310} cy={-530} r={14} fill="#d61e2b" /><circle cx={310} cy={-530} r={14} fill="#d61e2b" />
      </g>
    </Slow>
    <Stamp f={f} s={40} text="STILL UNSOLVED" top={860} size={110} rot={-10} />
  </>
);
const End: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Slow f={f} len={61} a={[540, 1150, 1.0]} b={[540, 1150, 1.06]}>
      <FlatHouse night={false} lit={false} police={f + 1} />
      {/* police tape across the fence */}
      <g transform="translate(0,1262) rotate(-2)"><rect x={-100} y={0} width={1300} height={40} fill="#f2c94c" />{Array.from({ length: 12 }).map((_, i) => <text key={i} x={i * 120} y={30} fontFamily="Lilita One" fontSize={24} fill={INK}>POLICE ·</text>)}</g>
      <rect x={-200} y={-200} width={1480} height={2400} fill="#c9a17a" opacity={0.12} />
    </Slow>
    <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center", transform: `scale(${pop(f, 6, 12)})` }}>
      <div style={{ fontFamily: "Lilita One", fontSize: 140, color: "#fff", WebkitTextStroke: `6px ${INK}`, textShadow: "0 10px 0 #000" }}>WHO WAS HE?</div>
      <div style={{ display: "inline-block", marginTop: 20, background: "#e3262b", color: "#fff", fontFamily: "Lilita One", fontSize: 52, padding: "10px 34px", borderRadius: 16, border: `5px solid ${INK}` }}>COMMENT YOUR THEORY ↓</div>
    </div>
  </>
);

const Subs3: React.FC = () => {
  const f = useCurrentFrame();
  const cur = (SUBS3 as [number, number, [string, boolean][]][]).find(([a, b]) => f >= a && f < b + 2);
  if (!cur || f >= Q.end) return null;
  const o = interpolate(f, [cur[0], cur[0] + 4], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", top: 1480, width: "100%", textAlign: "center", padding: "0 60px", boxSizing: "border-box", opacity: o }}>
      <span style={{ fontFamily: "Fredoka", fontWeight: 700, fontSize: 68, wordSpacing: 6 }}>
        {cur[2].map(([w, k], i) => (
          <React.Fragment key={i}>{i > 0 ? " " : ""}<span style={{ fontFamily: "Fredoka", fontWeight: 700, fontSize: k ? 76 : 66, color: k ? "#ff3b3b" : "#fff", WebkitTextStroke: `10px ${INK}`, paintOrder: "stroke fill", textTransform: "uppercase", display: "inline-block", lineHeight: 1.25 }}>{w}</span></React.Fragment>
        ))}
      </span>
    </div>
  );
};

const LIST: [number, number, React.FC<{ f: number }>][] = [
  [Q.hook, Q.ext, Hook], [Q.ext, Q.entry, Ext], [Q.entry, Q.trans, Entry], [Q.trans, Q.rei, Trans], [Q.rei, Q.mik, Rei], [Q.mik, Q.kit, Mik],
  [Q.kit, Q.loft, Kit], [Q.loft, Q.stay, LoftS], [Q.stay, Q.m1, Stay], [Q.m1, Q.m2, M1], [Q.m2, Q.m3, M2], [Q.m3, Q.ev, M3], [Q.ev, Q.un, EV as any], [Q.un, Q.end, UN], [Q.end, Q.fin, End],
];
const Scene: React.FC<{ C: React.FC<{ f: number }> }> = ({ C }) => { const f = useCurrentFrame(); return <AbsoluteFill><C f={f} /></AbsoluteFill>; };

export const MiyaQuiet: React.FC<{ audio?: boolean }> = ({ audio = false }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    {LIST.map(([a, b, C], i) => <Sequence key={i} from={a} durationInFrames={b - a}><Scene C={C} /></Sequence>)}
    <Subs3 />
    <Grain />
    {audio && <Audio src={staticFile("miya2/mix3.wav")} />}
  </AbsoluteFill>
);
