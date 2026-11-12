import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import "@fontsource/fredoka/600.css";
import "@fontsource/fredoka/700.css";
import "@fontsource/lilita-one/400.css";
import { Killer, useBot, Rig, BotPose } from "./Kit3";
import { House3, Rear3, NightSky, City, ReiRoom3, Stairs3, Kitchen3, Loft3, Living3, Bath3, Office3, Police3, Tape3, usePhotoTex } from "./Sets3";
import { EV, Grain, VictimCard, Stamp, VHS } from "../Miya2/Short";
import SUBS3 from "../Miya2/subs3.json";

const W = 1080, H = 1920, INK = "#1b1b1b";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const Q3 = { hook: 0, ext: 141, entry: 216, trans: 372, rei: 480, mik: 570, kit: 700, loft: 780, stay: 860, m1: 912, m2: 948, m3: 987, ev: 1032, un: 1134, end: 1230, fin: 1291 };
export const Q3_FRAMES = Q3.fin;
const ez = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
const lerp3 = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k) as [number, number, number];

/** a 3D shot: camera dollies smoothly from A to B over the shot */
const Shot: React.FC<{ f: number; len: number; from: [number[], number[]]; to: [number[], number[]]; fov?: number; children: React.ReactNode; bg?: string }> = ({ f, len, from, to, fov = 50, children, bg = "#05070c" }) => {
  const k = ez(interpolate(f, [0, len], [0, 1], clamp));
  return (
    <ThreeCanvas width={W} height={H} shadows style={{ position: "absolute", background: bg }} camera={{ fov, position: from[0] as any, near: 0.05, far: 200 }} gl={{ antialias: true, preserveDrawingBuffer: true }}>
      <Rig pos={lerp3(from[0], to[0], k)} look={lerp3(from[1], to[1], k)} fov={fov} />
      {children}
    </ThreeCanvas>
  );
};
const Vig: React.FC<{ o?: number }> = ({ o = 0.6 }) => <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 46%, transparent 45%, rgba(0,0,0,${o}) 100%)`, pointerEvents: "none" }} />;
const Fade: React.FC<{ f: number; d?: number; children: React.ReactNode }> = ({ f, d = 10, children }) => <AbsoluteFill style={{ opacity: interpolate(f, [0, d], [0, 1], clamp) }}>{children}</AbsoluteFill>;
const Chip: React.FC<{ t: string }> = ({ t }) => (
  <div style={{ position: "absolute", left: 50, top: 150, background: "rgba(10,10,12,0.85)", borderRadius: 14, padding: "8px 22px", fontFamily: "monospace", fontWeight: 700, fontSize: 54, color: "#ff3b30", border: "3px solid #333" }}>{t}</div>
);
const Label: React.FC<{ f: number; text: string; top?: number }> = ({ f, text, top = 1330 }) => (
  <div style={{ position: "absolute", top, width: "100%", textAlign: "center", opacity: interpolate(f, [8, 22], [0, 0.9], clamp), fontFamily: "Fredoka", fontWeight: 700, fontSize: 40, color: "#e9e4d8", letterSpacing: 10, textShadow: "0 4px 16px #000" }}>{text}</div>
);
const Interior: React.FC = () => <><hemisphereLight args={["#3b4a75", "#0b0b0e", 0.6]} /><fog attach="fog" args={["#05070c", 6, 14]} /></>;

// ---------- scenes ----------
const Hook: React.FC<{ f: number }> = ({ f }) => {
  const s = interpolate(f, [0, Q3.ext], [1.0, 1.22], clamp);
  const gray = interpolate(f, [70, 110], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Img src={staticFile("miya2/steps.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", filter: "blur(30px) brightness(0.3)", transform: "scale(1.3)" }} />
      <Img src={staticFile("miya2/steps.jpg")} style={{ position: "absolute", left: "50%", top: "50%", height: 1920, transform: `translate(-50%,-50%) translate(0px,${(s - 1) * 300}px) scale(${s})`, filter: `grayscale(${gray}) contrast(1.08) brightness(${1 - gray * 0.25})` }} />
      <Vig o={0.7} />
      <VHS f={f} t="DEC.30.2000" />
    </AbsoluteFill>
  );
};

const Ext: React.FC<{ f: number }> = ({ f }) => (
  <Fade f={f} d={8}>
    <Shot f={f} len={75} from={[[0.6, 1.7, 21], [0.6, 3.1, 0]]} to={[[0.4, 2.1, 17.5], [0.4, 3.3, 0]]}>
      <NightSky /><City /><House3 f={f} lit={1} />
    </Shot>
    <Vig />
    <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center", opacity: interpolate(f, [4, 18], [0, 1], clamp), fontFamily: "Fredoka", fontWeight: 700, fontSize: 44, color: "#e9e4d8", letterSpacing: 8, textShadow: "0 4px 16px #000" }}>SETAGAYA · TOKYO</div>
    <Stamp f={f} s={18} text="NEVER CAUGHT" top={1080} size={110} rot={-8} />
  </Fade>
);

const Entry: React.FC<{ f: number }> = ({ f }) => {
  const g = useBot();
  // A: walks along the park fence  B: on the AC unit, reaching for the window  C: the window slides open
  if (f < 62) {
    const x = interpolate(f, [0, 62], [-6.2, -3.0]);
    return (<>
      <Shot f={f} len={62} from={[[-6.5, 1.5, -9.5], [-4.6, 1.3, -3.6]]} to={[[-5.2, 1.5, -9.0], [-3.2, 1.3, -3.6]]}>
        <NightSky /><City /><Rear3 f={f} open={0} />
        {g && <Killer gltf={g} clip="walk" t={f / 30} p={[x, 0, -3.6]} ry={Math.PI / 2} />}
      </Shot><Vig /><Chip t="11:58 PM" /></>);
  }
  if (f < 112) {
    const k = interpolate(f, [66, 92], [0, 1], clamp);
    return (<>
      <Shot f={f - 62} len={50} from={[[-0.2, 2.3, -4.4], [-1.6, 2.2, -0.3]]} to={[[-0.5, 2.5, -3.9], [-1.6, 2.6, -0.3]]}>
        <NightSky /><City /><Rear3 f={f} open={0} />
        {g && <Killer gltf={g} clip="idle" t={f / 30} p={[-1.6, 0.93, -0.78]} ry={0} pose="reachR" poseK={k} />}
      </Shot><Vig /><Chip t="11:59 PM" /></>);
  }
  const open = interpolate(f, [116, 134], [0, 1], clamp);
  return (<>
    <Shot f={f - 112} len={44} from={[[-1.3, 3.9, -2.6], [-1.6, 4.05, 0]]} to={[[-1.45, 4.0, -2.1], [-1.6, 4.05, 0]]}>
      <NightSky /><City /><Rear3 f={f} open={open} />
    </Shot><Vig o={0.75} /><Chip t="12:00 AM" /></>);
};

const Trans: React.FC<{ f: number }> = ({ f }) => {
  const black = interpolate(f, [0, 20, 40], [1, 1, 0], clamp);
  return (
    <>
      <Shot f={f} len={108} from={[[0.6, 1.6, 19], [0.6, 3.0, 0]]} to={[[0.5, 2.0, 15], [0.5, 3.4, 0]]}>
        <NightSky /><City /><House3 f={f} lit={0} />
      </Shot>
      <Vig o={0.8} />
      <AbsoluteFill style={{ background: "#000", opacity: black }} />
      <VictimCard f={f} s={44} n="rei" name="REI" age="6" x={180} gone={44} />
      <VictimCard f={f} s={52} n="mikio" name="MIKIO" age="44" x={420} gone={52} />
      <VictimCard f={f} s={60} n="yasuko" name="YASUKO" age="41" x={660} gone={60} />
      <VictimCard f={f} s={68} n="niina" name="NIINA" age="8" x={900} gone={68} />
    </>
  );
};

const RoomShot: React.FC<{ f: number; len: number; from: [number[], number[]]; to: [number[], number[]]; label: string; children: React.ReactNode }> = ({ f, len, from, to, label, children }) => (
  <Fade f={f} d={12}>
    <Shot f={f} len={len} from={from} to={to} fov={55}><Interior />{children}</Shot>
    <Vig o={0.7} />
    <Label f={f} text={label} />
  </Fade>
);
const Rei: React.FC<{ f: number }> = ({ f }) => (<>
  <RoomShot f={f} len={90} from={[[0.3, 1.45, 2.3], [-0.3, 0.9, -2.4]]} to={[[0.0, 1.35, 1.4], [-0.5, 0.8, -2.4]]} label="REI'S ROOM"><ReiRoom3 f={f} /></RoomShot>
  <VictimCard f={f} s={6} n="rei" name="REI" age="6" x={540} gone={6} />
</>);
const Mik: React.FC<{ f: number }> = ({ f }) => {
  const photo = usePhotoTex("miya2/steps.jpg");
  return (<>
    <RoomShot f={f} len={130} from={[[1.6, 1.5, 2.2], [-0.4, 1.3, -2.4]]} to={[[0.6, 1.4, 0.6], [-0.6, 1.0, -2.1]]} label="THE STAIRS"><Stairs3 f={f} photo={photo} /></RoomShot>
    <VictimCard f={f} s={6} n="mikio" name="MIKIO" age="44" x={540} gone={6} />
  </>);
};
const Kit: React.FC<{ f: number }> = ({ f }) => (<>
  <RoomShot f={f} len={80} from={[[0.2, 1.55, 2.2], [-0.5, 1.1, -2.4]]} to={[[-0.5, 1.4, 0.4], [-0.7, 1.1, -2.3]]} label="THE KITCHEN"><Kitchen3 f={f} ring={interpolate(f, [24, 34], [0, 1], clamp)} /></RoomShot>
  {f > 34 && <Stamp f={f} s={34} text="1 KNIFE MISSING" top={520} size={66} color="#fff" rot={-3} />}
</>);
const LoftS: React.FC<{ f: number }> = ({ f }) => (<>
  <RoomShot f={f} len={80} from={[[0, 1.2, 2.6], [0, 0.4, -1]]} to={[[0, 1.05, 1.8], [0, 0.3, -1]]} label="THE LOFT"><Loft3 f={f} /></RoomShot>
  <VictimCard f={f} s={6} n="yasuko" name="YASUKO" age="41" x={400} gone={6} />
  <VictimCard f={f} s={12} n="niina" name="NIINA" age="8" x={680} gone={12} />
</>);
const Stay: React.FC<{ f: number }> = ({ f }) => {
  const g = useBot();
  return (<Fade f={f} d={8}>
    <Shot f={f} len={52} from={[[-1.3, 1.55, 1.9], [0.8, 1.35, -2.3]]} to={[[-0.9, 1.5, 1.2], [0.8, 1.35, -2.3]]} fov={55}>
      <Interior /><Living3 f={f} />
      {g && <Killer gltf={g} clip="idle" t={(f + 40) / 30} p={[0.85, 0, -1.55]} ry={Math.PI} />}
    </Shot><Vig o={0.75} /><Chip t="12:30 AM" /></Fade>);
};
const KillerShot: React.FC<{ f: number; len: number; from: [number[], number[]]; to: [number[], number[]]; chip: string; set: React.ReactNode; kp: [number, number, number]; ry: number; pose: BotPose }> = ({ f, len, from, to, chip, set, kp, ry, pose }) => {
  const g = useBot();
  return (<>
    <Shot f={f} len={len} from={from} to={to} fov={55}><Interior />{set}{g && <Killer gltf={g} clip="idle" t={(f + 20) / 30} p={kp} ry={ry} pose={pose} poseK={interpolate(f, [0, 10], [0.4, 1], clamp)} />}</Shot>
    <Vig o={0.7} /><Chip t={chip} /></>);
};
const M1: React.FC<{ f: number }> = ({ f }) => <KillerShot f={f} len={36} from={[[-0.6, 1.5, 1.2], [1.8, 1.1, -1.8]]} to={[[-0.3, 1.45, 0.8], [1.8, 1.1, -1.8]]} chip="12:41 AM" set={<Kitchen3 f={f} fridgeOpen />} kp={[1.7, 0, -0.75]} ry={Math.PI * 0.95} pose="lean" />;
const M2: React.FC<{ f: number }> = ({ f }) => <KillerShot f={f} len={39} from={[[1.7, 1.5, 0.9], [0.5, 1.3, -2.2]]} to={[[1.5, 1.45, 0.5], [0.5, 1.3, -2.2]]} chip="12:52 AM" set={<Bath3 f={f} />} kp={[0.55, 0, -1.45]} ry={Math.PI} pose="hold" />;
const M3: React.FC<{ f: number }> = ({ f }) => <KillerShot f={f} len={45} from={[[1.5, 1.4, 0.7], [0, 1.0, -1.9]]} to={[[1.2, 1.35, 0.3], [0, 1.0, -1.9]]} chip="1:18 AM" set={<Office3 f={f} />} kp={[0, 0.02, -1.2]} ry={Math.PI} pose="sit" />;

const UN: React.FC<{ f: number }> = ({ f }) => (
  <>
    <svg width={W} height={H} style={{ position: "absolute", background: "#2a2b30" }}>
      {Array.from({ length: 30 }).map((_, i) => <rect key={i} x={0} y={i * 70} width={W} height={3} fill="#25262b" />)}
      <g transform={`translate(540,1000) rotate(-1.5) scale(${1 + f * 0.0008})`}>
        <rect x={-340} y={-560} width={680} height={1000} fill="#f2ecdc" stroke={INK} strokeWidth={5} />
        <rect x={-340} y={-560} width={680} height={130} fill="#b8161c" />
        <text y={-468} fontFamily="Lilita One" fontSize={92} fill="#fff" textAnchor="middle" letterSpacing={6}>WANTED</text>
        <rect x={-260} y={-400} width={520} height={600} fill="#cfc9bb" />
        <path d="M-210,200 Q-200,40 -90,10 Q-150,-60 -140,-150 Q-130,-260 0,-270 Q130,-260 140,-150 Q150,-60 90,10 Q200,40 210,200 Z" fill="#1d1f25" />
        <path d="M-138,-170 Q-130,-290 0,-295 Q130,-290 138,-170 Z" fill="#121318" />
        <text y={-60} fontFamily="Lilita One" fontSize={200} fill="#f2ecdc" textAnchor="middle">?</text>
        <text y={280} fontFamily="Fredoka" fontWeight={700} fontSize={44} fill={INK} textAnchor="middle">MALE · DNA ON FILE</text>
        <text y={340} fontFamily="Fredoka" fontWeight={600} fontSize={34} fill="#555" textAnchor="middle">NO MATCH IN ANY DATABASE</text>
        <circle cx={-310} cy={-530} r={14} fill="#d61e2b" /><circle cx={310} cy={-530} r={14} fill="#d61e2b" />
      </g>
    </svg>
    <Vig o={0.6} />
    <Stamp f={f} s={40} text="STILL UNSOLVED" top={860} size={110} rot={-10} />
  </>
);

const End: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Shot f={f} len={61} from={[[0.5, 2.4, 25], [0.5, 2.8, 0]]} to={[[0.3, 2.4, 23], [0.3, 2.9, 0]]}>
      <color attach="background" args={["#c9d8e8"]} />
      <fog attach="fog" args={["#c9d8e8", 30, 90]} />
      <hemisphereLight args={["#dfe9f5", "#5a5a50", 0.9]} />
      <directionalLight position={[-12, 18, 14]} intensity={2.2} color="#fff1dc" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-15} shadow-camera-right={15} shadow-camera-top={15} shadow-camera-bottom={-15} />
      <City night={false} />
      <House3 f={f} lit={0} night={false} />
      <Police3 p={[-2.5, 0, 10.2]} f={f} /><Police3 p={[4.5, 0, 9.4]} ry={0.15} f={f + 3} />
      <Tape3 p={[0, 1.05, 5.9]} len={16} />
    </Shot>
    <Vig o={0.45} />
    <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center", opacity: interpolate(f, [4, 14], [0, 1], clamp) }}>
      <div style={{ fontFamily: "Lilita One", fontSize: 140, color: "#fff", WebkitTextStroke: `6px ${INK}`, textShadow: "0 10px 0 #000" }}>WHO WAS HE?</div>
      <div style={{ display: "inline-block", marginTop: 20, background: "#e3262b", color: "#fff", fontFamily: "Lilita One", fontSize: 52, padding: "10px 34px", borderRadius: 16, border: `5px solid ${INK}` }}>COMMENT YOUR THEORY ↓</div>
    </div>
  </>
);

const Subs: React.FC = () => {
  const f = useCurrentFrame();
  const cur = (SUBS3 as [number, number, [string, boolean][]][]).find(([a, b]) => f >= a && f < b + 2);
  if (!cur || f >= Q3.end) return null;
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
  [Q3.hook, Q3.ext, Hook], [Q3.ext, Q3.entry, Ext], [Q3.entry, Q3.trans, Entry], [Q3.trans, Q3.rei, Trans], [Q3.rei, Q3.mik, Rei], [Q3.mik, Q3.kit, Mik],
  [Q3.kit, Q3.loft, Kit], [Q3.loft, Q3.stay, LoftS], [Q3.stay, Q3.m1, Stay], [Q3.m1, Q3.m2, M1], [Q3.m2, Q3.m3, M2], [Q3.m3, Q3.ev, M3], [Q3.ev, Q3.un, EV as any], [Q3.un, Q3.end, UN], [Q3.end, Q3.fin, End],
];
const Scene: React.FC<{ C: React.FC<{ f: number }> }> = ({ C }) => { const f = useCurrentFrame(); return <AbsoluteFill><C f={f} /></AbsoluteFill>; };

export const Miya3D: React.FC<{ audio?: boolean }> = ({ audio = false }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    {LIST.map(([a, b, C], i) => <Sequence key={i} from={a} durationInFrames={b - a}><Scene C={C} /></Sequence>)}
    <Subs />
    <Grain />
    {audio && <Audio src={staticFile("miya3/mix.wav")} />}
  </AbsoluteFill>
);
