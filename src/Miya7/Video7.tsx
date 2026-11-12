import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, random, spring, staticFile, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import "@fontsource/fredoka/600.css";
import "@fontsource/fredoka/700.css";
import "@fontsource/lilita-one/400.css";
import { Stick, walkSP, idleSP, sitSP, track, trackXY, mixSP, REST, SP, STRIDE_PER_RAD } from "./Stick";
import WORDS from "./words7.json";

const W = 1080, H = 1920, INK = "#151517";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const T7 = { hook: 0, front: 123, entry: 180, dead: 340, rei: 440, stairs: 530, kitchen: 655, stay: 815, fridge: 870, bath: 912, office: 945, ev: 990, un: 1095, end: 1180, fin: 1250 };
export const V7_FRAMES = T7.fin;
const ez = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const pop = (f: number, s: number, d = 12, st = 200) => spring({ frame: f - s, fps: 30, config: { damping: d, stiffness: st } });
const S7 = (n: string) => staticFile(`miya7/${n}`);

/** image scene: world = image pixels; camera keys [frame, cx, cy, zoom] with eased moves */
type CK = [number, number, number, number];
const camAt = (f: number, keys: CK[]) => {
  if (f <= keys[0][0]) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) { const a = keys[i], b = keys[i + 1]; if (f <= b[0]) { const k = ez((f - a[0]) / (b[0] - a[0])); return [f, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k, a[3] + (b[3] - a[3]) * k] as CK; } }
  return keys[keys.length - 1];
};
const World: React.FC<{ f: number; keys: CK[]; src: string; iw: number; ih: number; children?: React.ReactNode; fg?: { y: number; k: number }; shake?: number; grade?: string; under?: React.ReactNode }> = ({ f, keys, src, iw, ih, children, fg, shake = 1, grade, under }) => {
  const [, cx, cy, z] = camAt(f, keys);
  const sx = noise2D("wx", f / 50, 0) * 3 * shake, sy = noise2D("wy", f / 50, 1) * 3 * shake;
  const dx = (cx - keys[0][1]) * (fg?.k ?? 0);
  const fgMask = fg ? `linear-gradient(180deg, transparent ${fg.y - 40}px, #000 ${fg.y + 20}px)` : undefined;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden", filter: grade }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: iw, height: ih, transformOrigin: "0 0", transform: `translate(${W / 2 + sx}px,${H / 2 + sy}px) scale(${z}) translate(${-cx}px,${-cy}px)` }}>
        <Img src={src} style={{ position: "absolute", left: 0, top: 0, width: iw, height: ih }} />
        {fg && <Img src={src} style={{ position: "absolute", left: 0, top: 0, width: iw, height: ih, transform: `translateX(${-dx}px)`, WebkitMaskImage: fgMask, maskImage: fgMask }} />}
        {under}
        <svg width={iw} height={ih} viewBox={`0 0 ${iw} ${ih}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>{children}</svg>
      </div>
    </AbsoluteFill>
  );
};
const PImg: React.FC<{ src: string; x: number; y: number; w: number; h: number; style?: React.CSSProperties }> = ({ src, x, y, w, h, style }) => <Img src={src} style={{ position: "absolute", left: x, top: y, width: w, height: h, ...style }} />;
const Vig: React.FC<{ o?: number }> = ({ o = 0.6 }) => <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, transparent 42%, rgba(0,0,0,${o}) 100%)`, pointerEvents: "none" }} />;
const Dust: React.FC<{ f: number; n?: number; box: [number, number, number, number]; o?: number }> = ({ f, n = 26, box, o = 0.5 }) => (
  <g>{Array.from({ length: n }).map((_, i) => {
    const x = box[0] + ((random("dx" + i) * box[2] + f * (0.15 + random("dv" + i) * 0.25) + noise2D("dn" + i, f / 60, 0) * 20) % box[2]);
    const y = box[1] + ((random("dy" + i) * box[3] - f * (0.1 + random("dw" + i) * 0.2) + 10 * box[3]) % box[3]);
    return <circle key={i} cx={x} cy={y} r={1.2 + random("dr" + i) * 2} fill="#fff1d0" opacity={o * (0.3 + 0.7 * Math.abs(Math.sin(f / 20 + i)))} />;
  })}</g>
);
const Flicker: React.FC<{ f: number; seed: string; o?: number }> = ({ f, seed, o = 0.5 }) => {
  const off = random(`${seed}${Math.floor(f / 2)}`) > 0.93 ? 1 : 0;
  return <AbsoluteFill style={{ background: "#000", opacity: off * o, pointerEvents: "none" }} />;
};
const Chip: React.FC<{ t: string; f: number }> = ({ t, f }) => {
  const p = pop(f, 0, 14);
  return <div style={{ position: "absolute", left: 50, top: 150, background: "rgba(8,8,10,0.85)", borderRadius: 14, padding: "8px 22px", fontFamily: "monospace", fontWeight: 700, fontSize: 54, color: "#ff3b30", border: "3px solid #2c2c30", transform: `scale(${p})`, transformOrigin: "0 0", textShadow: "0 0 10px rgba(255,59,48,0.6)" }}>{t}</div>;
};
const Stamp: React.FC<{ f: number; s: number; text: string; top: number; color?: string; rot?: number; size?: number }> = ({ f, s, text, top, color = "#e3262b", rot = -8, size = 110 }) => {
  if (f < s) return null;
  const p = spring({ frame: f - s, fps: 30, config: { damping: 9, stiffness: 240 } });
  return <div style={{ position: "absolute", top, width: "100%", display: "flex", justifyContent: "center" }}><div style={{ transform: `rotate(${rot}deg) scale(${2.2 - 1.2 * p})`, opacity: Math.min(1, p * 1.5), border: `12px solid ${color}`, color, fontFamily: "Lilita One", fontSize: size, padding: "4px 34px", borderRadius: 16, background: "rgba(10,10,14,0.3)", letterSpacing: 4 }}>{text}</div></div>;
};

/** polaroid post-it with the real photo; drops in, then turns grey */
const PostIt: React.FC<{ f: number; s: number; img: string; name: string; age: string; x: number; y: number; rot: number; gone?: number; w?: number }> = ({ f, s, img, name, age, x, y, rot, gone = 1e9, w = 230 }) => {
  if (f < s) return null;
  const p = spring({ frame: f - s, fps: 30, config: { damping: 11, stiffness: 170 } });
  const g = interpolate(f, [gone, gone + 12], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, transform: `translate(-50%,0) translateY(${(1 - p) * -80}px) rotate(${rot * p + (1 - p) * rot * 3}deg) scale(${0.85 + 0.15 * p})`, opacity: Math.min(1, p * 2), background: "#f5f1e6", padding: "12px 12px 10px", boxShadow: "0 14px 28px rgba(0,0,0,0.6)" }}>
      <div style={{ position: "absolute", left: "50%", top: -14, width: 26, height: 26, borderRadius: 13, background: "radial-gradient(circle at 35% 35%, #ff8a8a, #b5121b 60%)", transform: "translateX(-50%)", boxShadow: "0 3px 4px rgba(0,0,0,0.5)" }} />
      <div style={{ width: "100%", height: w * 1.05, overflow: "hidden", background: "#222" }}>
        <Img src={S7(img)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: `grayscale(${g}) brightness(${1 - g * 0.25}) sepia(${0.15 * (1 - g)})` }} />
      </div>
      <div style={{ fontFamily: "Lilita One", fontSize: w * 0.17, color: INK, textAlign: "center", marginTop: 6 }}>{name} <span style={{ color: "#b5121b" }}>{age}</span></div>
      {g > 0 && <div style={{ position: "absolute", inset: 0, background: `rgba(30,0,0,${0.15 * g})` }} />}
    </div>
  );
};

// ---------------- scenes ----------------
const Hook: React.FC<{ f: number }> = ({ f }) => {
  const z = interpolate(f, [0, 10, 60, 123], [1.35, 1.08, 1.16, 1.32], clamp);
  const ty = interpolate(f, [0, 123], [40, -60], clamp);
  const gray = interpolate(f, [58, 70], [0, 1], clamp);
  const glitch = (f > 56 && f < 62) || (f > 100 && f < 104) || f > 117;
  const ghost = interpolate(f, [66, 96], [0, 0.55], clamp);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Img src={staticFile("miya2/steps.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", filter: "blur(30px) brightness(0.3)", transform: "scale(1.3)" }} />
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 1920 * 1.333, height: 1920, transform: `translate(-50%,-50%) translateY(${ty}px) scale(${z}) ${glitch ? `translateX(${(random("g" + f) - 0.5) * 40}px)` : ""}` }}>
        <Img src={staticFile("miya2/steps.jpg")} style={{ width: "100%", height: "100%", filter: `grayscale(${gray}) contrast(1.1) brightness(${1 - gray * 0.2}) sepia(${0.2 * (1 - gray)})` }} />
        {/* the killer's silhouette faintly appears in the bushes behind the family */}
        <Img src={S7("k_front.png")} style={{ position: "absolute", left: "45%", top: "6%", height: "30%", opacity: ghost, filter: "blur(1px) brightness(0.85)" }} />
      </div>
      {glitch && <AbsoluteFill style={{ background: `linear-gradient(0deg, transparent ${random("a" + f) * 80}%, rgba(255,0,60,0.25) ${random("a" + f) * 80 + 3}%, transparent ${random("a" + f) * 80 + 6}%)`, mixBlendMode: "screen" }} />}
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [0, 5], [0.9, 0], clamp) + interpolate(f, [118, 123], [0, 1], clamp) }} />
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0 2px, transparent 2px 5px)" }} />
      <Vig o={0.75} />
      <div style={{ position: "absolute", left: 50, top: 150, fontFamily: "monospace", fontWeight: 700, fontSize: 40, color: "#f2f2f2", textShadow: "2px 0 #ff2a6a, -2px 0 #2affff" }}><div>{Math.floor(f / 15) % 2 ? "●" : "○"} REC</div><div>DEC.30.2000</div></div>
    </AbsoluteFill>
  );
};

const FRONT = { src: S7("front.png"), iw: 1195, ih: 1316 };
const winsFront: [number, number, number, number][] = [[170, 424, 96, 126], [424, 420, 110, 134], [170, 704, 136, 113], [917, 459, 76, 104]];
const FrontWindows: React.FC<{ f: number; off: number[] }> = ({ f, off }) => <g>{winsFront.map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} fill="#0a0d1c" opacity={(off[i] ?? 0) * (0.92 + 0.08 * Math.sin(f / 9 + i))} />)}</g>;
const Moon: React.FC<{ f: number }> = ({ f }) => <circle cx={1083} cy={133} r={110 + Math.sin(f / 20) * 6} fill="#fff6d8" opacity={0.08} />;
const Front: React.FC<{ f: number }> = ({ f }) => (
  <>
    <World f={f} keys={[[0, 600, 700, 1.62], [57, 590, 740, 1.78]]} {...FRONT} fg={{ y: 820, k: -0.25 }}>
      <Moon f={f} />
      <circle cx={666} cy={735} r={40 + Math.sin(f / 3) * 3} fill="#ffd27a" opacity={0.12} />
      <FrontWindows f={f} off={[0, 0, 0, 0]} />
    </World>
    <Vig o={0.55} />
    <Stamp f={f} s={6} text="NEVER CAUGHT" top={1120} size={110} rot={-8} />
  </>
);

const REAR = { src: S7("rear_clean.png"), iw: 1187, ih: 1325 };
const Entry: React.FC<{ f: number }> = ({ f }) => {
  const H7 = 228, sc = H7 / 585;
  // choreography (rear image pixels)
  const walkEnd = 56, x0 = 1080, x1 = 700;
  let x = x1, y = 1095, p: SP = REST, view: "side" | "back" = "side", vis = 1, flip = true;
  if (f < walkEnd) { const ph = f * (2 * Math.PI / 20); x = x0 - ph * STRIDE_PER_RAD * sc * 1.0; x = Math.max(x, x1); p = walkSP(ph, interpolate(f, [walkEnd - 8, walkEnd], [1, 0.2], clamp), 0.3); }
  else {
    const g = f;
    const up: SP = { lean: 2, head: -12, bob: 0, t1: 4, s1: 2, t2: -4, s2: -2, u1: 168, f1: 176, u2: 160, f2: 172 };
    const knee: SP = { lean: 10, head: -6, bob: -30, t1: 80, s1: 6, t2: -10, s2: -20, u1: 120, f1: 150, u2: 110, f2: 140 };
    const stand: SP = { ...REST, head: -10 };
    const pull: SP = { lean: 6, head: -15, bob: -20, t1: 30, s1: 0, t2: 10, s2: -20, u1: 175, f1: 180, u2: 170, f2: 178 };
    const tuck: SP = { lean: 30, head: -5, bob: -60, t1: 90, s1: -10, t2: 70, s2: -30, u1: 150, f1: 150, u2: 140, f2: 150 };
    p = track(g, [[walkEnd, REST], [walkEnd + 8, up], [walkEnd + 20, knee], [walkEnd + 34, stand], [walkEnd + 44, up], [walkEnd + 56, pull], [walkEnd + 70, tuck]]);
    [x, y] = trackXY(g, [[walkEnd, x1, 1095], [walkEnd + 20, 680, 1040], [walkEnd + 34, 655, 904], [walkEnd + 48, 655, 896], [walkEnd + 62, 650, 690], [walkEnd + 76, 655, 560]]);
    vis = interpolate(g, [walkEnd + 66, walkEnd + 78], [1, 0], clamp);
  }
  const open = interpolate(f, [100, 112], [0, 1], clamp);
  return (
    <>
      <World f={f} keys={[[0, 760, 820, 1.5], [56, 690, 820, 1.62], [100, 660, 700, 1.85], [160, 650, 560, 2.15]]} {...REAR} fg={{ y: 1080, k: -0.3 }} under={<PImg src={S7("ac.png")} x={590} y={900} w={124} h={114} />}>
        <Moon f={f} />
        {/* frosted dark bathroom window, then it slides open */}
        <rect x={576} y={356} width={146} height={166} fill="#1d2640" opacity={0.92} />
        <rect x={576} y={356} width={146} height={166} fill="#c9d6e6" opacity={0.08} />
        <rect x={578} y={358} width={70 * open} height={162} fill="#020306" />
        {open > 0.5 && <path d={`M580,360 Q${600 + Math.sin(f / 4) * 14},440 ${592 + Math.sin(f / 5) * 18},520 L578,520 Z`} fill="#e9eef2" opacity={0.85} />}
        {/* AC unit on a wall bracket under the window */}
        <path d="M600,1014 L600,1040 L640,1014 M700,1014 L700,1040 L660,1014" stroke="#5a5d66" strokeWidth={6} fill="none" />
        {vis > 0 && <Stick x={x} y={y} h={H7} p={p} f={f} flip={flip} view={view} opacity={vis} shadow={f < walkEnd + 10 ? 0.4 : 0} />}
        <Dust f={f} n={14} box={[300, 700, 600, 400]} o={0.25} />
      </World>
      <Vig o={0.6} />
      <Chip t={f < 120 ? "11:58 PM" : "12:00 AM"} f={f} />
    </>
  );
};

const Dead: React.FC<{ f: number }> = ({ f }) => {
  const black = interpolate(f, [0, 14, 28], [1, 1, 0], clamp);
  const off = [0, 1, 2, 3].map((i) => interpolate(f, [30 + i * 9, 36 + i * 9], [0, 1], clamp));
  return (
    <>
      <World f={f} keys={[[0, 600, 680, 1.62], [100, 600, 640, 1.85]]} {...FRONT} grade="saturate(0.6) brightness(0.8)">
        <FrontWindows f={f} off={off} />
        <rect x={-200} y={-200} width={1600} height={1800} fill="#050814" opacity={0.25} />
      </World>
      <Vig o={0.8} />
      <AbsoluteFill style={{ background: "#000", opacity: black }} />
      <PostIt f={f} s={22} img="v_rei.jpg" name="REI" age="6" x={175} y={240} rot={-5} gone={46} w={190} />
      <PostIt f={f} s={30} img="v_mikio.jpg" name="MIKIO" age="44" x={420} y={225} rot={3} gone={54} w={190} />
      <PostIt f={f} s={38} img="v_yasuko.jpg" name="YASUKO" age="41" x={665} y={240} rot={-3} gone={62} w={190} />
      <PostIt f={f} s={46} img="v_niina.jpg" name="NIINA" age="8" x={905} y={230} rot={5} gone={70} w={190} />
    </>
  );
};

const ROOM = (n: string) => ({ src: S7(`room_${n}.png`), iw: 1620, ih: 2880 });
const RoomScene: React.FC<{ f: number; n: string; keys: CK[]; label: string; children?: React.ReactNode; over?: React.ReactNode; dust?: [number, number, number, number]; lamp?: [number, number] }> = ({ f, n, keys, label, children, over, dust, lamp }) => (
  <AbsoluteFill style={{ opacity: interpolate(f, [0, 8], [0, 1], clamp) }}>
    <World f={f} keys={keys} {...ROOM(n)}>
      {lamp && <circle cx={lamp[0]} cy={lamp[1]} r={260 + Math.sin(f / 7) * 10} fill="#ffd9a0" opacity={0.07} />}
      {children}
      {dust && <Dust f={f} box={dust} o={0.45} />}
    </World>
    <Flicker f={f} seed={n} o={0.35} />
    <Vig o={0.62} />
    <div style={{ position: "absolute", top: 1330, width: "100%", textAlign: "center", opacity: interpolate(f, [8, 22], [0, 0.9], clamp), fontFamily: "Fredoka", fontWeight: 700, fontSize: 38, color: "#efe7d6", letterSpacing: 10, textShadow: "0 4px 16px #000" }}>{label}</div>
    {over}
  </AbsoluteFill>
);
const Rei: React.FC<{ f: number }> = ({ f }) => <RoomScene f={f} n="rei" label="REI'S ROOM" keys={[[0, 810, 1500, 0.72], [90, 700, 1560, 0.85]]} lamp={[200, 420]} dust={[100, 600, 1200, 1400]} over={<PostIt f={f} s={4} img="v_rei.jpg" name="REI" age="6" x={540} y={190} rot={-4} gone={4} w={250} />} />;
const Stairs: React.FC<{ f: number }> = ({ f }) => {
  const ring = interpolate(f, [86, 96], [0, 1], clamp);
  return <RoomScene f={f} n="stairs" label="THE STAIRS" keys={[[0, 810, 1560, 0.72], [125, 900, 1300, 1.0]]} dust={[300, 500, 1100, 1500]}
    over={<><PostIt f={f} s={4} img="v_mikio.jpg" name="MIKIO" age="44" x={540} y={190} rot={3} gone={4} w={250} />{f > 96 && <Stamp f={f} s={96} text="THE BLADE SNAPPED" top={1150} size={64} color="#fff" rot={-3} />}</>}>
    {ring > 0 && <circle cx={845} cy={1555} r={120 + Math.sin(f / 4) * 6} fill="none" stroke="#ff2a2a" strokeWidth={10} opacity={ring} strokeDasharray="30 14" />}
  </RoomScene>;
};
const KIT = { src: S7("kitchen.png"), iw: 967, ih: 1627 };
const Kitchen: React.FC<{ f: number }> = ({ f }) => {
  const ring = interpolate(f, [100, 110], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: interpolate(f, [0, 8], [0, 1], clamp) }}>
      <World f={f} keys={[[0, 483, 900, 1.2], [70, 450, 880, 1.35], [160, 395, 860, 2.0]]} {...KIT}>
        <circle cx={452} cy={352} r={300 + Math.sin(f / 7) * 12} fill="#ffd9a0" opacity={0.06} />
        {ring > 0 && <circle cx={390} cy={830} r={95 + Math.sin(f / 4) * 4} fill="none" stroke="#ff2a2a" strokeWidth={6} opacity={ring} strokeDasharray="22 10" />}
        <Dust f={f} box={[250, 380, 450, 550]} o={0.5} />
      </World>
      <Flicker f={f} seed="kit" o={0.3} />
      <Vig o={0.6} />
      <PostIt f={f} s={4} img="v_yasuko.jpg" name="YASUKO" age="41" x={380} y={180} rot={-4} gone={4} w={230} />
      <PostIt f={f} s={22} img="v_niina.jpg" name="NIINA" age="8" x={690} y={190} rot={4} gone={22} w={230} />
      {f > 110 && <Stamp f={f} s={110} text="1 KNIFE MISSING" top={1150} size={70} color="#fff" rot={-3} />}
    </AbsoluteFill>
  );
};
const Stay: React.FC<{ f: number }> = ({ f }) => (
  <RoomScene f={f} n="living" label="" keys={[[0, 900, 1500, 0.8], [55, 980, 1450, 0.9]]} lamp={[540, 470]}>
    <Stick x={1010} y={1960} h={900} p={idleSP(f)} view="back" f={f} shadow={0.45} />
    <rect x={-200} y={-200} width={2000} height={3300} fill="#03050d" opacity={0.15} />
  </RoomScene>
);
const FRIDGE = { src: S7("fridge_clean.png"), iw: 1065, ih: 1477 };
const Fridge: React.FC<{ f: number }> = ({ f }) => {
  const br = 1 + Math.sin(f / 9) * 0.006;
  return (
    <AbsoluteFill>
      <World f={f} keys={[[0, 560, 760, 1.35], [42, 600, 760, 1.5]]} {...FRIDGE} under={<PImg src={S7("fridge_killer.png")} x={0} y={0} w={1065} h={1477} style={{ transformOrigin: "990px 1380px", transform: `scale(${br},${1 / br})` }} />}>
        <rect x={500} y={400} width={250} height={680} fill="#fff6d0" opacity={0.05 + 0.03 * Math.sin(f / 3)} />
      </World>
      <Vig o={0.55} />
      <Chip t="12:41 AM" f={f} />
    </AbsoluteFill>
  );
};
const Bath: React.FC<{ f: number }> = ({ f }) => (
  <RoomScene f={f} n="bath" label="" keys={[[0, 800, 1500, 0.78], [33, 820, 1480, 0.86]]} lamp={[700, 480]}
    over={<Chip t="12:52 AM" f={f} />}>
    <Stick x={430} y={2300} h={1050} p={idleSP(f)} view="three" f={f} shadow={0.4} />
    <g transform="translate(355,1860)"><rect x={-32} y={-18} width={64} height={36} rx={8} fill="#f5f5f2" stroke="#b5121b" strokeWidth={5} /><path d="M-26,0 L26,0" stroke="#e6e6e2" strokeWidth={4} /></g>
  </RoomScene>
);
const Office: React.FC<{ f: number }> = ({ f }) => {
  const type = Math.sin(f / 2) * 3;
  return (
    <RoomScene f={f} n="office" label="" keys={[[0, 760, 1500, 0.78], [45, 780, 1460, 0.88]]} over={<Chip t="1:18 AM" f={f} />}>
      <rect x={1050} y={1120} width={420} height={300} fill="#8fbfff" opacity={0.1 + 0.03 * Math.sin(f / 2)} />
      <Stick x={520} y={2330} h={880} p={mixSP(sitSP, { ...sitSP, f1: 92 + type, f2: 98 - type }, 1)} f={f} shadow={0} />
    </RoomScene>
  );
};
const JAR = { src: S7("jar_fixed.png"), iw: 1086, ih: 1448 };
const Tag: React.FC<{ f: number; s: number; x: number; y: number; text: string }> = ({ f, s, x, y, text }) => {
  if (f < s) return null; const p = pop(f, s, 10);
  return <div style={{ position: "absolute", left: x, top: y, transform: `scale(${p})`, transformOrigin: "0 50%", background: "#f2c94c", color: INK, fontFamily: "Lilita One", fontSize: 50, padding: "6px 20px", borderRadius: 10, border: `4px solid ${INK}`, boxShadow: "0 8px 16px rgba(0,0,0,0.5)" }}>{text}</div>;
};
const Evidence: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ opacity: interpolate(f, [0, 8], [0, 1], clamp) }}>
    <World f={f} keys={[[0, 560, 760, 1.35], [105, 520, 820, 1.75]]} {...JAR} />
    <Vig o={0.55} />
    <Tag f={f} s={14} x={90} y={560} text="HIS BLOOD" />
    <Tag f={f} s={36} x={560} y={760} text="FINGERPRINTS" />
    <Tag f={f} s={58} x={150} y={1000} text="HIS CLOTHES" />
  </AbsoluteFill>
);
const Unknown: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: "#232327" }}>
    <svg width={W} height={H} style={{ position: "absolute" }}>
      {Array.from({ length: 40 }).map((_, i) => <rect key={i} x={0} y={i * 50} width={W} height={2} fill="#2b2b30" />)}
      <g transform={`translate(540,1000) rotate(-1.5) scale(${1 + f * 0.0009})`}>
        <rect x={-345} y={-565} width={690} height={1010} fill="#000" opacity={0.35} transform="translate(14,18)" />
        <rect x={-340} y={-560} width={680} height={1000} fill="#f2ecdc" />
        <rect x={-340} y={-560} width={680} height={130} fill="#b8161c" />
        <text y={-468} fontFamily="Lilita One" fontSize={92} fill="#fff" textAnchor="middle" letterSpacing={6}>WANTED</text>
        <rect x={-260} y={-400} width={520} height={620} fill="#cfc9bb" />
        <text y={300} fontFamily="Fredoka" fontWeight={700} fontSize={44} fill={INK} textAnchor="middle">MALE · DNA ON FILE</text>
        <text y={360} fontFamily="Fredoka" fontWeight={600} fontSize={34} fill="#555" textAnchor="middle">NO MATCH IN ANY DATABASE</text>
        <circle cx={-310} cy={-530} r={14} fill="#d61e2b" /><circle cx={310} cy={-530} r={14} fill="#d61e2b" />
      </g>
    </svg>
    <Img src={S7("k_front.png")} style={{ position: "absolute", left: 540 - 112, top: 1000 - 395, height: 600, transform: `rotate(-1.5deg) scale(${1 + f * 0.0009})`, transformOrigin: "112px 395px" }} />
    <Vig o={0.55} />
    <Stamp f={f} s={30} text="STILL UNSOLVED" top={860} size={110} rot={-10} />
  </AbsoluteFill>
);
const End: React.FC<{ f: number }> = ({ f }) => {
  const red = Math.floor(f / 6) % 2;
  return (
    <>
      <World f={f} keys={[[0, 600, 760, 1.62], [70, 600, 780, 1.7]]} {...FRONT} fg={{ y: 820, k: -0.2 }}>
        <FrontWindows f={f} off={[1, 1, 1, 1]} />
        <rect x={0} y={0} width={1195} height={1316} fill={red ? "#ff1a1a" : "#1a3dff"} opacity={0.16} style={{ mixBlendMode: "screen" }} />
        <g transform="translate(0,940) rotate(-1.5)"><rect x={-50} y={0} width={1300} height={34} fill="#f2c94c" />{Array.from({ length: 10 }).map((_, i) => <text key={i} x={i * 130} y={25} fontFamily="Lilita One" fontSize={22} fill={INK}>POLICE LINE</text>)}</g>
      </World>
      <Vig o={0.6} />
      <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center", transform: `scale(${pop(f, 4, 12)})` }}>
        <div style={{ fontFamily: "Lilita One", fontSize: 140, color: "#fff", WebkitTextStroke: `6px ${INK}`, textShadow: "0 10px 0 #000" }}>WHO WAS HE?</div>
        <div style={{ display: "inline-block", marginTop: 20, background: "#e3262b", color: "#fff", fontFamily: "Lilita One", fontSize: 52, padding: "10px 34px", borderRadius: 16, border: `5px solid ${INK}` }}>COMMENT YOUR THEORY ↓</div>
      </div>
    </>
  );
};

/** word-by-word subtitles: shows a 3-4 word group, the spoken word pops, key words in red */
const Subs: React.FC = () => {
  const f = useCurrentFrame();
  const words = WORDS as { w: string; a: number; b: number; k: boolean; g: number }[];
  const i = words.findIndex((x) => f >= x.a && f < x.b + 6);
  if (i < 0 || f >= T7.end) return null;
  const grp = words.filter((x) => x.g === words[i].g);
  return (
    <div style={{ position: "absolute", top: 1470, width: "100%", textAlign: "center", padding: "0 60px", boxSizing: "border-box" }}>
      <span style={{ fontFamily: "Fredoka", fontWeight: 700, fontSize: 68, wordSpacing: 8 }}>
        {grp.map((x, j) => {
          const on = f >= x.a; const cur = f >= x.a && f < x.b;
          const p = cur ? spring({ frame: f - x.a, fps: 30, config: { damping: 10, stiffness: 300 } }) : 1;
          return (
            <React.Fragment key={j}>{j > 0 ? " " : ""}<span style={{ display: "inline-block", fontFamily: "Fredoka", fontWeight: 700, fontSize: x.k ? 78 : 68, color: x.k ? "#ff3b3b" : cur ? "#ffe066" : "#fff", opacity: on ? 1 : 0.35, transform: `scale(${cur ? 0.9 + 0.18 * p : 1})`, WebkitTextStroke: `10px ${INK}`, paintOrder: "stroke fill", textTransform: "uppercase", lineHeight: 1.25, marginRight: j < grp.length - 1 ? 22 : 0 }}>{x.w}</span></React.Fragment>
          );
        })}
      </span>
    </div>
  );
};
const Grade: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={W} height={H} style={{ position: "absolute", opacity: 0.08, mixBlendMode: "overlay" }}><filter id="gn7"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 11} /></filter><rect width={W} height={H} filter="url(#gn7)" /></svg>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,20,40,0.12), rgba(40,20,10,0.08))", mixBlendMode: "multiply" }} />
    </AbsoluteFill>
  );
};

const LIST: [number, number, React.FC<{ f: number }>][] = [
  [T7.hook, T7.front, Hook], [T7.front, T7.entry, Front], [T7.entry, T7.dead, Entry], [T7.dead, T7.rei, Dead], [T7.rei, T7.stairs, Rei], [T7.stairs, T7.kitchen, Stairs],
  [T7.kitchen, T7.stay, Kitchen], [T7.stay, T7.fridge, Stay], [T7.fridge, T7.bath, Fridge], [T7.bath, T7.office, Bath], [T7.office, T7.ev, Office], [T7.ev, T7.un, Evidence], [T7.un, T7.end, Unknown], [T7.end, T7.fin, End],
];
const Scene: React.FC<{ C: React.FC<{ f: number }>; i: number }> = ({ C, i }) => {
  const f = useCurrentFrame();
  // whip-in on hard cuts (front, entry, fridge, unknown, end)
  const whip = [1, 2, 8, 12, 13].includes(i) ? interpolate(f, [0, 5], [1, 0], clamp) : 0;
  return <AbsoluteFill style={{ transform: `scale(${1 + whip * 0.12})`, filter: whip > 0.01 ? `blur(${whip * 12}px)` : undefined }}><C f={f} /></AbsoluteFill>;
};

export const Miya7: React.FC<{ audio?: boolean }> = ({ audio = false }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    {LIST.map(([a, b, C], i) => <Sequence key={i} from={a} durationInFrames={b - a}><Scene C={C} i={i} /></Sequence>)}
    <Subs />
    <Grade />
    {audio && <Audio src={staticFile("miya7/mix.wav")} />}
  </AbsoluteFill>
);
