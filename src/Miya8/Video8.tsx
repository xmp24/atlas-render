import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, random, spring, staticFile, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import "@fontsource/fredoka/600.css";
import "@fontsource/fredoka/700.css";
import "@fontsource/lilita-one/400.css";
import { Stick, walkSP, idleSP, sitSP, track, trackXY, mixSP, REST, SP, STRIDE_PER_RAD, StickIK } from "../Miya7/Stick";
import { ReiScene3, StairsScene3, LivingScene3, BathScene3, OfficeScene3 } from "./Scenes8";
import WORDS from "./words8.json";

const W = 1080, H = 1920, INK = "#151517";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const T7 = { hook: 0, map: 108, front: 123, entry: 180, dead: 340, rei: 440, stairs: 530, kitchen: 655, stay: 815, fridge: 870, bath: 912, office: 945, ev: 990, un: 1095, end: 1180, fin: 1250 };
export const V8_FRAMES = T7.fin;
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
const Chip: React.FC<{ t: string; f: number; inside?: string }> = ({ t, f, inside }) => {
  const p = pop(f, 0, 14);
  return (
    <div style={{ position: "absolute", left: 50, top: 150, transform: `scale(${p})`, transformOrigin: "0 0" }}>
      <div style={{ background: "rgba(8,8,10,0.85)", borderRadius: 14, padding: "8px 22px", fontFamily: "monospace", fontWeight: 700, fontSize: 54, color: "#ff3b30", border: "3px solid #2c2c30", textShadow: "0 0 10px rgba(255,59,48,0.6)", display: "inline-block" }}>{t}</div>
      {inside && <div style={{ marginTop: 8, background: "rgba(8,8,10,0.8)", borderRadius: 10, padding: "4px 14px", fontFamily: "Fredoka", fontWeight: 700, fontSize: 26, color: "#e9e4d8", letterSpacing: 2, display: "inline-block" }}>INSIDE THE HOUSE · <span style={{ color: "#ff8a6a" }}>{inside}</span></div>}
    </div>
  );
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
const Typed: React.FC<{ f: number; text: string; s?: number; top?: number }> = ({ f, text, s = 6, top = 300 }) => {
  const n = Math.max(0, Math.min(text.length, Math.floor((f - s) / 1.6)));
  if (f < s) return null;
  return <div style={{ position: "absolute", top, left: 56, fontFamily: "monospace", fontWeight: 700, fontSize: 36, color: "#efe7d6", letterSpacing: 5, textShadow: "0 3px 10px #000, 0 0 2px #000" }}><span style={{ color: "#ff3b30" }}>▸ </span>{text.slice(0, n)}<span style={{ opacity: Math.floor(f / 8) % 2 ? 1 : 0 }}>_</span></div>;
};
const inside = (mins: number) => `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;

const Hook: React.FC<{ f: number }> = ({ f }) => {
  const z = interpolate(f, [0, 10, 55, 108], [1.35, 1.08, 1.15, 1.32], clamp);
  const ty = interpolate(f, [0, 108], [40, -60], clamp);
  const gray = interpolate(f, [56, 66], [0, 1], clamp);
  const glitch = (f > 54 && f < 60) || (f > 92 && f < 96) || f > 102;
  const ghost = interpolate(f, [62, 92], [0, 0.6], clamp);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Img src={staticFile("miya2/steps.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", filter: "blur(30px) brightness(0.3)", transform: "scale(1.3)" }} />
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 1920 * 1.333, height: 1920, transform: `translate(-50%,-50%) translateY(${ty}px) scale(${z}) ${glitch ? `translateX(${(random("g" + f) - 0.5) * 40}px)` : ""}` }}>
        <Img src={staticFile("miya2/steps.jpg")} style={{ width: "100%", height: "100%", filter: `grayscale(${gray}) contrast(1.1) brightness(${1 - gray * 0.2}) sepia(${0.2 * (1 - gray)})` }} />
        <Img src={S7("k_front.png")} style={{ position: "absolute", left: "46.5%", top: "11%", height: "23%", opacity: ghost, filter: `blur(${1.5 - ghost}px) brightness(0.8) drop-shadow(0 0 30px rgba(0,0,0,0.9))`, transform: `translateX(${Math.sin(f / 7) * 4}px)` }} />
      </div>
      {glitch && <AbsoluteFill style={{ background: `linear-gradient(0deg, transparent ${random("a" + f) * 80}%, rgba(255,0,60,0.25) ${random("a" + f) * 80 + 3}%, transparent ${random("a" + f) * 80 + 6}%)`, mixBlendMode: "screen" }} />}
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [0, 5], [0.9, 0], clamp) + interpolate(f, [104, 108], [0, 0.8], clamp) }} />
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0 2px, transparent 2px 5px)" }} />
      <Vig o={0.75} />
      <div style={{ position: "absolute", left: 50, top: 150, fontFamily: "monospace", fontWeight: 700, fontSize: 40, color: "#f2f2f2", textShadow: "2px 0 #ff2a6a, -2px 0 #2affff" }}><div>{Math.floor(f / 15) % 2 ? "●" : "○"} REC</div><div>DEC.30.2000</div></div>
    </AbsoluteFill>
  );
};

/** 0.5 s map insert: Tokyo → Setagaya pin */
const MapIn: React.FC<{ f: number }> = ({ f }) => {
  const z = interpolate(f, [0, 15], [1, 2.2], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const ping = (f % 10) / 10;
  return (
    <AbsoluteFill style={{ background: "#0b1020" }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <g transform={`translate(540,960) scale(${z}) translate(-540,-960)`}>
          <rect width={W} height={H} fill="#121a33" />
          {Array.from({ length: 40 }).map((_, i) => <line key={"h" + i} x1={0} y1={i * 52 + (i % 3) * 6} x2={W} y2={i * 52 + 30 * Math.sin(i)} stroke="#1f2a4d" strokeWidth={i % 5 ? 2 : 6} />)}
          {Array.from({ length: 24 }).map((_, i) => <line key={"v" + i} x1={i * 48} y1={0} x2={i * 48 + 60 * Math.sin(i * 1.7)} y2={H} stroke="#1f2a4d" strokeWidth={i % 4 ? 2 : 6} />)}
          <path d="M-50,1400 C250,1250 380,1100 560,1060 C760,1010 900,860 1150,820" stroke="#24467e" strokeWidth={40} fill="none" />
          <rect x={430} y={860} width={230} height={200} fill="#ff3b3b" opacity={0.12} stroke="#ff3b3b" strokeWidth={3} />
          <circle cx={545} cy={960} r={14 + ping * 70} fill="none" stroke="#ff3b3b" strokeWidth={4} opacity={1 - ping} />
          <path d="M545,960 m-22,-46 a22,22 0 1,1 44,0 c0,22 -22,46 -22,46 c0,0 -22,-24 -22,-46 Z" fill="#ff3b3b" stroke="#fff" strokeWidth={3} transform={`translate(0,${-46})`} />
        </g>
      </svg>
      <div style={{ position: "absolute", top: 330, width: "100%", textAlign: "center", fontFamily: "Lilita One", fontSize: 76, color: "#fff", letterSpacing: 4, textShadow: "0 6px 0 #000" }}>SETAGAYA, TOKYO</div>
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [0, 3], [0.8, 0], clamp) }} />
    </AbsoluteFill>
  );
};

/** front-house overlays: kadomatsu, shimekazari, moths, puddle, cat, clouds, plate */
const FrontExtras: React.FC<{ f: number; cat?: boolean; clouds?: boolean }> = ({ f, cat, clouds = true }) => (
  <g>
    {clouds && [0, 1].map((i) => <ellipse key={i} cx={((f * (1.2 + i * 0.5) + i * 500) % 1700) - 300} cy={110 + i * 50} rx={190} ry={38} fill="#0b1124" opacity={0.75} style={{ filter: "blur(10px)" }} />)}
    {[388, 676].map((x) => (
      <g key={x} transform={`translate(${x},1032)`}>
        <rect x={-26} y={-34} width={52} height={34} fill="#8a6a3a" stroke="#4a3418" strokeWidth={2} />
        {[-12, 0, 12].map((dx, i) => <path key={i} d={`M${dx - 6},-30 L${dx - 6},${-96 - i * 14} L${dx + 6},${-104 - i * 14} L${dx + 6},-30 Z`} fill="#6f9a48" stroke="#3a5a26" strokeWidth={2} />)}
        <ellipse cx={0} cy={-40} rx={34} ry={12} fill="#2f5a2a" />
      </g>
    ))}
    <g transform="translate(582,742)"><circle r={18} fill="none" stroke="#d9c38a" strokeWidth={6} /><path d="M-6,14 L-10,40 M6,14 L10,40" stroke="#f4f1e8" strokeWidth={4} /><circle cy={-2} r={6} fill="#d8352a" /></g>
    {[0, 1, 2, 3].map((i) => <circle key={i} cx={666 + Math.sin(f / (4 + i) + i * 2) * 26} cy={728 + Math.cos(f / (5 + i) + i) * 18} r={2.2} fill="#fff8e0" />)}
    <ellipse cx={910} cy={1115} rx={120} ry={16} fill="#1b2235" opacity={0.85} />
    <ellipse cx={890} cy={1113} rx={50} ry={5} fill="#ffd27a" opacity={0.25 + 0.05 * Math.sin(f / 5)} />
    <g transform="translate(985,962)"><rect x={-26} y={-12} width={52} height={24} rx={3} fill="#f4f4ec" stroke="#333" strokeWidth={1.5} /><text y={6} fontSize={13} fontFamily="sans-serif" fontWeight={700} fill="#1f5a2a" textAnchor="middle">世田谷 500</text></g>
    {cat && (() => { const x = interpolate(f, [0, 57], [1250, 180], clamp), st = Math.sin(f / 2.2); return (
      <g transform={`translate(${x},1052)`}>
        <ellipse cx={0} cy={-14} rx={26} ry={11} fill="#0c0c0e" /><circle cx={-24} cy={-24} r={10} fill="#0c0c0e" /><path d="M-30,-31 L-28,-40 L-24,-32 M-20,-32 L-17,-40 L-15,-31" fill="#0c0c0e" />
        <path d={`M24,-16 Q42,${-30 + st * 6} 38,-44`} stroke="#0c0c0e" strokeWidth={5} fill="none" strokeLinecap="round" />
        {[-16, -6, 8, 18].map((lx, i) => <line key={i} x1={lx} y1={-6} x2={lx + (i % 2 ? st : -st) * 5} y2={6} stroke="#0c0c0e" strokeWidth={5} strokeLinecap="round" />)}
        <circle cx={-27} cy={-25} r={2} fill="#d6ff6a" />
      </g>); })()}
  </g>
);
const FRONT = { src: S7("front.png"), iw: 1195, ih: 1316 };
const winsFront: [number, number, number, number][] = [[170, 424, 96, 126], [424, 420, 110, 134], [170, 704, 136, 113], [917, 459, 76, 104]];
const FrontWindows: React.FC<{ f: number; off: number[] }> = ({ f, off }) => <g>{winsFront.map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} fill="#0a0d1c" opacity={(off[i] ?? 0) * (0.92 + 0.08 * Math.sin(f / 9 + i))} />)}</g>;
const Moon: React.FC<{ f: number; x?: number; y?: number }> = ({ f, x = 1083, y = 133 }) => <circle cx={x} cy={y} r={110 + Math.sin(f / 20) * 6} fill="#fff6d8" opacity={0.08} />;
const Front: React.FC<{ f: number }> = ({ f }) => (
  <>
    <World f={f} keys={[[0, 600, 700, 1.62], [57, 590, 740, 1.78]]} {...FRONT} fg={{ y: 820, k: -0.25 }}>
      <Moon f={f} />
      <circle cx={666} cy={735} r={40 + Math.sin(f / 3) * 3} fill="#ffd27a" opacity={0.12} />
      <FrontWindows f={f} off={[0, 0, 0, 0]} />
      <FrontExtras f={f} cat />
      <rect x={-100} y={1000} width={1400} height={160} fill="#9aa8c8" opacity={0.08 + 0.03 * Math.sin(f / 15)} style={{ filter: "blur(18px)" }} />
    </World>
    <Vig o={0.55} />
    <Stamp f={f} s={6} text="NEVER CAUGHT" top={1120} size={110} rot={-8} />
  </>
);

// ---------- entry: walk to the ladder, climb rung by rung (IK), slip through the window ----------
const RUNGS = [1105, 1078, 1027, 978, 930, 882, 835, 788, 741, 695, 649, 604];
const rungY = (i: number) => { const a = Math.max(0, Math.min(RUNGS.length - 1, Math.floor(i))), b = Math.min(RUNGS.length - 1, a + 1); return RUNGS[a] + (RUNGS[b] - RUNGS[a]) * (i - Math.floor(i)); };
const limbIdx = (st: number, o: number, base: number) => { const u = (st - o) / 2; if (u < 0) return { i: base, lift: 0 }; const n = Math.floor(u), q = u - n; const mv = Math.min(1, q * 2); const e = mv < 0.5 ? 2 * mv * mv : 1 - Math.pow(-2 * mv + 2, 2) / 2; return { i: base + 2 * n + 2 * e, lift: Math.sin(Math.PI * mv) }; };
const REAR = { src: S7("rear_ladder.png"), iw: 1187, ih: 1325 };
const Entry: React.FC<{ f: number }> = ({ f }) => {
  const H7 = 228, sc = H7 / 585;
  const walkEnd = 44, climb0 = 50, STEP = 12, steps = 6, climbEnd = climb0 + STEP * steps;
  const open = interpolate(f, [104, 118], [0, 1], clamp);
  let actor: React.ReactNode = null;
  const prints: React.ReactNode[] = [];
  if (f < walkEnd + 4) {
    const ph = f * (2 * Math.PI / 22);
    const x = Math.max(660, 1070 - ph * STRIDE_PER_RAD * sc);
    const amp = interpolate(f, [walkEnd - 10, walkEnd], [1, 0], clamp);
    actor = <Stick x={x} y={1106} h={H7} p={walkSP(ph, amp, 0.35)} f={f} flip shadow={0.45} />;
    for (let k = 0; k < 8; k++) { const px = 1060 - k * 52; if (px > x + 20) prints.push(<ellipse key={k} cx={px} cy={1108 + (k % 2) * 6} rx={9} ry={4} fill="#2b1d12" opacity={0.55} />); }
  } else {
    const st = interpolate(f, [climb0, climbEnd], [0, steps], clamp);
    const LH = limbIdx(st, 0, 5), RH = limbIdx(st, 1, 5), LF = limbIdx(st, 1, 0), RF = limbIdx(st, 0, 0);
    const lf: [number, number] = [638, rungY(LF.i) - LF.lift * 18], rf: [number, number] = [668, rungY(RF.i) - RF.lift * 18];
    const lh: [number, number] = [622 - LH.lift * 8, rungY(LH.i) - LH.lift * 22], rh: [number, number] = [684 + RH.lift * 8, rungY(RH.i) - RH.lift * 22];
    let hy = (lf[1] + rf[1]) / 2 - 72;
    const enter = interpolate(f, [climbEnd, climbEnd + 22], [0, 1], clamp);
    hy -= enter * 150;
    const sill: [number, number] = [630, 528], sill2: [number, number] = [676, 528];
    const LHf: [number, number] = enter > 0 ? [lh[0] + (sill[0] - lh[0]) * Math.min(1, enter * 2), lh[1] + (sill[1] - lh[1]) * Math.min(1, enter * 2)] : lh;
    const RHf: [number, number] = enter > 0 ? [rh[0] + (sill2[0] - rh[0]) * Math.min(1, enter * 2), rh[1] + (sill2[1] - rh[1]) * Math.min(1, enter * 2)] : rh;
    actor = <StickIK hx={652} hy={hy} s={sc} lh={LHf} rh={RHf} lf={[lf[0], lf[1] - enter * 150]} rf={[rf[0], rf[1] - enter * 150]} headTilt={Math.sin(f / 13) * 0.4} opacity={1 - Math.max(0, enter - 0.55) * 2.2} />;
    for (let k = 0; k < 8; k++) prints.push(<ellipse key={k} cx={1060 - k * 52} cy={1108 + (k % 2) * 6} rx={9} ry={4} fill="#2b1d12" opacity={0.55} />);
  }
  // breath vapour puffs near the head
  const headPos: [number, number] = f < walkEnd + 4 ? [Math.max(660, 1070 - f * (2 * Math.PI / 22) * STRIDE_PER_RAD * sc) - 30, 900] : [652, rungY(interpolate(f, [climb0, climbEnd], [0, 6], clamp)) - 210];
  const puffs = [0, 1, 2].map((i) => { const q = ((f + i * 14) % 42) / 42; return <circle key={i} cx={headPos[0] - 20 - q * 30} cy={headPos[1] - q * 26} r={6 + q * 14} fill="#dfe6f2" opacity={(1 - q) * 0.22} style={{ filter: "blur(3px)" }} />; });
  return (
    <>
      <World f={f} keys={[[0, 800, 860, 1.5], [44, 700, 860, 1.6], [90, 660, 760, 1.85], [160, 650, 560, 2.2]]} {...REAR} fg={{ y: 1090, k: -0.3 }}>
        <Moon f={f} x={1040} y={140} />
        {[0, 1].map((i) => <ellipse key={i} cx={((f * (1.4 + i * 0.6) + i * 600) % 1700) - 300} cy={120 + i * 46} rx={170} ry={34} fill="#0b1124" opacity={0.7} style={{ filter: "blur(10px)" }} />)}
        {/* frosted dark bathroom window that slides open */}
        <rect x={576} y={356} width={146} height={166} fill="#1d2640" opacity={0.93} />
        <rect x={576} y={356} width={146} height={166} fill="#c9d6e6" opacity={0.07} />
        <rect x={578} y={358} width={70 * open} height={162} fill="#020306" />
        {/* fly screen: mesh, then a knife cut opens a flap (how he really got in) */}
        {(() => { const cut = interpolate(f, [92, 104], [0, 1], clamp); const flap = interpolate(f, [104, 112], [0, 1], clamp); return (
          <g opacity={1 - open * 0.6}>
            {Array.from({ length: 16 }).map((_, i) => <line key={"m" + i} x1={650} y1={358 + i * 10.4} x2={720} y2={358 + i * 10.4} stroke="#8c97ad" strokeWidth={0.8} opacity={0.35} />)}
            {Array.from({ length: 8 }).map((_, i) => <line key={"n" + i} x1={652 + i * 9.4} y1={358} x2={652 + i * 9.4} y2={520} stroke="#8c97ad" strokeWidth={0.8} opacity={0.35} />)}
            {cut > 0 && <path d={`M660,370 L${660 + 50 * Math.min(1, cut * 2)},370 L${710},${370 + 120 * Math.max(0, cut * 2 - 1)}`} stroke="#d8dde8" strokeWidth={2} fill="none" opacity={0.9} />}
            {flap > 0 && <path d={`M660,370 L710,370 L710,490 Z`} fill="#05070c" opacity={flap} />}
          </g>); })()}
        {open > 0.5 && <path d={`M580,360 Q${598 + Math.sin(f / 4) * 10},440 ${590 + Math.sin(f / 5) * 12},520 L578,520 Z`} fill="#6f7d96" opacity={0.6} />}
        {open > 0.5 && <path d={`M582,362 Q${594 + Math.sin(f / 4) * 8},440 ${586 + Math.sin(f / 5) * 9},518`} stroke="#9aa6bb" strokeWidth={2} fill="none" opacity={0.5} />}
        {/* moths at the wall lamp */}
        {[0, 1, 2].map((i) => <circle key={i} cx={352 + Math.sin(f / (4 + i) + i * 2) * 22} cy={782 + Math.cos(f / (5 + i) + i) * 16} r={2} fill="#fff8e0" />)}
        {prints}
        {actor}
        {puffs}
        <rect x={-100} y={1060} width={1400} height={140} fill="#9aa8c8" opacity={0.07 + 0.03 * Math.sin(f / 15)} style={{ filter: "blur(16px)" }} />
      </World>
      <Vig o={0.6} />
      <Chip t={f < 118 ? "11:58 PM" : "12:00 AM"} f={f} />
    </>
  );
};

const Dead: React.FC<{ f: number }> = ({ f }) => {
  const black = interpolate(f, [0, 3, 14], [1, 1, 0], clamp);
  const off = [0, 1, 2, 3].map((i) => interpolate(f, [30 + i * 9, 36 + i * 9], [0, 1], clamp));
  return (
    <>
      <World f={f} keys={[[0, 600, 680, 1.62], [100, 600, 640, 1.85]]} {...FRONT} grade="saturate(0.6) brightness(0.8)">
        <FrontWindows f={f} off={off} />
        <FrontExtras f={f} />
        <rect x={-200} y={-200} width={1600} height={1800} fill="#050814" opacity={0.25} />
      </World>
      <Vig o={0.8} />
      <AbsoluteFill style={{ background: "#000", opacity: black }} />
      <PostIt f={f} s={22} img="v_rei.jpg" name="REI" age="6" x={175} y={240} rot={-5} gone={46} w={190} />
      <PostIt f={f} s={30} img="v_mikio.jpg" name="MIKIO" age="44" x={420} y={225} rot={3} gone={54} w={190} />
      <PostIt f={f} s={38} img="v_yasuko.jpg" name="YASUKO" age="41" x={665} y={240} rot={-3} gone={62} w={190} />
      <PostIt f={f} s={46} img="v_niina.jpg" name="NIINA" age="8" x={905} y={230} rot={5} gone={70} w={190} />
      <Chip t="12:05 AM" f={f - 20} />
    </>
  );
};

/** quick warm "alive" flash: the room as it was, with the victim, before cutting to the dark scene */
const Alive: React.FC<{ f: number; bg: string; people: [string, number, number, number][] }> = ({ f, bg, people }) => {
  if (f > 9) return null;
  const o = interpolate(f, [0, 2, 6, 9], [1, 1, 0.6, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Img src={S7(bg)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(1.35) saturate(1.2) sepia(0.25)" }} />
      {people.map(([n, x, y, h]) => <Img key={n} src={S7(n)} style={{ position: "absolute", left: x, top: y - h, height: h, filter: "brightness(1.1)" }} />)}
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [0, 3], [0.7, 0], clamp) }} />
    </AbsoluteFill>
  );
};
const Room3D: React.FC<{ f: number; C: React.FC<{ f: number; len: number }>; len: number; label: string; alive?: React.ReactNode; over?: React.ReactNode; chip?: [string, number]; grade?: string; dutch?: number }> = ({ f, C, len, label, alive, over, chip, grade, dutch = 0 }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ filter: grade, transform: dutch ? `rotate(${dutch}deg) scale(${1 + Math.abs(dutch) * 0.03})` : undefined }}><C f={f} len={len} /></AbsoluteFill>
    <Flicker f={f} seed={label} o={0.3} />
    <Vig o={0.6} />
    {label && <Typed f={f} text={label} s={10} />}
    {over}
    {chip && <Chip t={chip[0]} f={f} inside={inside(chip[1])} />}
    {alive}
  </AbsoluteFill>
);
const Rei: React.FC<{ f: number }> = ({ f }) => <Room3D f={f} C={ReiScene3} len={90} label="REI'S ROOM · 2F" chip={["12:05 AM", 5]} grade="saturate(0.82) hue-rotate(-6deg) contrast(1.06)"
  over={<PostIt f={f} s={10} img="v_rei.jpg" name="REI" age="6" x={850} y={330} rot={4} gone={10} w={200} />}
  alive={<Alive f={f} bg="room_rei.png" people={[["rei.png", 330, 1560, 520]]} />} />;
const Stairs: React.FC<{ f: number }> = ({ f }) => <Room3D f={f} C={StairsScene3} len={125} label="THE STAIRS" chip={["12:10 AM", 10]} grade="sepia(0.12) contrast(1.08) saturate(0.9)" dutch={-3}
  over={<><PostIt f={f} s={10} img="v_mikio.jpg" name="MIKIO" age="44" x={850} y={330} rot={3} gone={10} w={200} />{f > 96 && <Stamp f={f} s={96} text="THE BLADE SNAPPED" top={1130} size={64} color="#fff" rot={-3} />}</>}
  alive={<Alive f={f} bg="room_stairs.png" people={[["mikio.png", 300, 1700, 760]]} />} />;

/** 2D dark smoke for the image scenes */
const Smoke2D: React.FC<{ f: number; x: number; y: number; h: number; n?: number }> = ({ f, x, y, h, n = 36 }) => (
  <g>{Array.from({ length: n }).map((_, i) => {
    const L = 60 + random("kl" + i) * 50, q = ((f + random("ko" + i) * L) % L) / L;
    const a = random("ka" + i) * 6.28, r = h * (0.16 + random("kr" + i) * 0.14);
    const cx = x + Math.cos(a + q * 1.4) * (r + q * h * 0.12), cy = y - h * (0.1 + random("ky" + i) * 0.85) - q * h * 0.35;
    const sz = h * (0.07 + q * 0.12);
    return <circle key={i} cx={cx} cy={cy} r={sz} fill={i % 5 === 0 ? "#3a0a14" : "#1c1820"} opacity={Math.sin(Math.PI * q) * 0.45} style={{ filter: `blur(${sz * 0.35}px)` }} />;
  })}
  {Array.from({ length: 7 }).map((_, i) => { const q = ((f + i * 9) % 60) / 60, a = random("ke" + i) * 6.28; return <circle key={"e" + i} cx={x + Math.cos(a) * h * 0.15} cy={y - h * (0.15 + q * 0.9)} r={h * 0.008} fill="#ff6a2a" opacity={Math.sin(Math.PI * q) * 0.8} />; })}
  </g>
);
const KIT = { src: S7("kitchen.png"), iw: 967, ih: 1627 };
const Kitchen: React.FC<{ f: number }> = ({ f }) => {
  const ring = interpolate(f, [100, 110], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <World f={f} keys={[[0, 483, 1000, 1.2], [70, 470, 980, 1.3], [160, 505, 975, 1.72]]} {...KIT}>
        <circle cx={452} cy={352} r={300 + Math.sin(f / 7) * 12} fill="#ffd9a0" opacity={0.06} />
        {/* kids' drawings taped to the cabinet doors */}
        <g transform="translate(160,470) rotate(-4)"><rect width={90} height={70} fill="#fbf8ee" /><circle cx={70} cy={16} r={8} fill="#f2c94c" /><path d="M14,58 L14,30 L30,30 M40,58 L40,26 M60,58 L60,34" stroke="#d8352a" strokeWidth={3} /><rect x={36} y={-6} width={22} height={10} fill="#e9e0b8" opacity={0.8} /></g>
        <g transform="translate(400,500) rotate(5)"><rect width={80} height={62} fill="#fbf8ee" /><path d="M10,50 Q40,10 70,50" stroke="#2f7ad6" strokeWidth={3} fill="none" /><rect x={30} y={-6} width={22} height={10} fill="#e9e0b8" opacity={0.8} /></g>
        {ring > 0 && <circle cx={390} cy={865} r={95 + Math.sin(f / 4) * 4} fill="none" stroke="#ff2a2a" strokeWidth={6} opacity={ring} strokeDasharray="22 10" />}
        <Dust f={f} box={[250, 380, 450, 550]} o={0.5} />
        <circle cx={620} cy={1300} r={300} fill="#3a0a14" opacity={0.1} style={{ filter: "blur(60px)" }} />
        <Smoke2D f={f} x={620} y={1620} h={600} n={44} />
        <Stick x={620} y={1620} h={600} p={idleSP(f)} view="back" f={f} shadow={0.45} />
      </World>
      <Flicker f={f} seed="kit" o={0.3} />
      <Vig o={0.6} />
      <Typed f={f} text="THE KITCHEN" s={10} />
      <PostIt f={f} s={10} img="v_yasuko.jpg" name="YASUKO" age="41" x={820} y={330} rot={-4} gone={10} w={190} />
      <PostIt f={f} s={26} img="v_niina.jpg" name="NIINA" age="8" x={820} y={640} rot={4} gone={26} w={190} />
      {f > 110 && <Stamp f={f} s={110} text="1 KNIFE MISSING" top={930} size={62} color="#fff" rot={-3} />}
      <Chip t="12:15 AM" f={f} inside={inside(15)} />
      <Alive f={f} bg="kitchen.png" people={[["yasuko.png", 200, 1640, 700], ["niina.png", 560, 1640, 520]]} />
    </AbsoluteFill>
  );
};
const Stay: React.FC<{ f: number }> = ({ f }) => <Room3D f={f} C={LivingScene3} len={55} label="LIVING ROOM" chip={["12:30 AM", 30]} grade="saturate(0.85) contrast(1.05)" />;
const FRIDGE = { src: S7("fridge_nok.png"), iw: 1065, ih: 1477 };
const Fridge: React.FC<{ f: number }> = ({ f }) => {
  // back-view killer (IK): left hand takes the red ice-cream bar, brings it to his mouth; right hand holds the door
  const sc = 1.35, hx = 690 + Math.sin(f / 30) * 3, feetY = 1330, hy = feetY - 205 * sc + Math.sin(f / 11) * 3;
  const reach = interpolate(f, [0, 11], [0, 1], { ...clamp, easing: ez }), back = interpolate(f, [15, 27], [0, 1], { ...clamp, easing: ez });
  const rest: [number, number] = [640, 1010], bar: [number, number] = [556, 552], mouth: [number, number] = [688, 700];
  const bite = f > 28 ? Math.max(0, Math.sin((f - 28) / 2.6)) * 22 : 0;
  const lh: [number, number] = back > 0 ? [bar[0] + (mouth[0] - bar[0]) * back, bar[1] + (mouth[1] - bar[1]) * back + bite] : [rest[0] + (bar[0] - rest[0]) * reach, rest[1] + (bar[1] - rest[1]) * reach];
  const taken = f >= 13;
  return (
    <AbsoluteFill>
      <World f={f} keys={[[0, 505, 820, 1.42], [42, 520, 790, 1.5]]} {...FRIDGE}>
        <rect x={830} y={0} width={300} height={1477} fill="url(#rdark)" />
        <g transform="translate(790,470) rotate(3)"><rect width={70} height={56} fill="#fbf8ee" /><path d="M10,46 L22,20 L34,46 M46,46 L46,24" stroke="#d8352a" strokeWidth={3} fill="none" /></g>
        {[[800, 620, "#d8352a"], [850, 640, "#2f7ad6"], [820, 680, "#f2c94c"]].map(([x, y, c], i) => <circle key={i} cx={x as number} cy={y as number} r={9} fill={c as string} stroke="#222" strokeWidth={1.5} />)}
        <defs><linearGradient id="icg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgb(222,208,192)" /><stop offset="1" stopColor="rgb(196,179,159)" /></linearGradient>
          <linearGradient id="rdark" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#000" stopOpacity="0" /><stop offset="0.35" stopColor="#000" stopOpacity="0.75" /><stop offset="1" stopColor="#000" stopOpacity="0.9" /></linearGradient>
          <radialGradient id="fglow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fff4d6" stopOpacity="0.5" /><stop offset="1" stopColor="#fff4d6" stopOpacity="0" /></radialGradient></defs>
        {taken && <rect x={542} y={507} width={29} height={79} fill="url(#icg)" />}
        <ellipse cx={620} cy={780} rx={330} ry={420} fill="url(#fglow)" opacity={0.55 + 0.05 * Math.sin(f / 3)} />
        {/* cold vapour rolling out of the fridge */}
        {Array.from({ length: 9 }).map((_, i) => { const q = ((f + i * 7) % 50) / 50; return <ellipse key={"v" + i} cx={520 + i * 30 + q * 40} cy={1060 + q * 160} rx={50 + q * 60} ry={18 + q * 14} fill="#e8f0ff" opacity={Math.sin(Math.PI * q) * 0.13} style={{ filter: "blur(10px)" }} />; })}
        {[0, 1, 2].map((i) => <ellipse key={i} cx={960 - i * 26} cy={1290 + i * 18} rx={6} ry={3} fill="#5a0a0e" opacity={0.8} />)}
        <ellipse cx={hx} cy={feetY + 4} rx={150} ry={22} fill="#000" opacity={0.5} />
        <StickIK hx={hx} hy={hy} s={sc} lh={lh} rh={[838, 760]} lf={[hx - 40, feetY]} rf={[hx + 44, feetY - 2]} headTilt={back * -0.5 + Math.sin(f / 17) * 0.15} />
        {/* rim light from the fridge on his outline */}
        <path d={`M${hx - 52},${hy - 185 * sc} L${hx - 34},${hy}`} stroke="#fff1cc" strokeWidth={5} opacity={0.45} style={{ filter: "blur(2px)" }} />
        {(() => { const hcx = hx + (back * -0.5 + Math.sin(f / 17) * 0.15) * 10 * sc, hcy = hy - 285 * sc, r = 86 * sc; const P = (d: number) => `${hcx + Math.cos(d * Math.PI / 180) * r},${hcy + Math.sin(d * Math.PI / 180) * r}`; return <path d={`M${P(150)} A${r},${r} 0 0 1 ${P(250)}`} stroke="#fff1cc" strokeWidth={6} fill="none" opacity={0.55} strokeLinecap="round" style={{ filter: "blur(1.5px)" }} />; })()}
        {taken && back < 0.9 && <g transform={`translate(${lh[0]},${lh[1]}) rotate(${-20 + back * 40})`}><rect x={-13} y={-44} width={26} height={52} rx={11} fill="#c8473f" stroke="#7a1f1a" strokeWidth={2} /><rect x={-4} y={6} width={8} height={24} rx={3} fill="#d9b27a" /></g>}
      </World>
      <Vig o={0.55} />
      <Chip t="12:41 AM" f={f} inside={inside(41)} />
    </AbsoluteFill>
  );
};
const Bath: React.FC<{ f: number }> = ({ f }) => <Room3D f={f} C={BathScene3} len={33} label="BATHROOM · 2F" chip={["12:52 AM", 52]} grade="saturate(0.75) contrast(1.1) brightness(0.96)" dutch={2} />;
const Office: React.FC<{ f: number }> = ({ f }) => <Room3D f={f} C={OfficeScene3} len={45} label="OFFICE · 2F" chip={["1:18 AM", 78]} grade="saturate(0.85) contrast(1.06)"
  over={f > 14 && <div style={{ position: "absolute", right: 60, top: 560, transform: `scale(${pop(f, 14, 11)})`, transformOrigin: "100% 50%", background: "rgba(8,12,24,0.88)", border: "3px solid #4a7dff", borderRadius: 12, padding: "8px 20px", fontFamily: "monospace", fontWeight: 700, fontSize: 34, color: "#cfe0ff", boxShadow: "0 0 24px rgba(74,125,255,0.5)" }}><span style={{ color: Math.floor(f / 5) % 2 ? "#3dff7a" : "#1a6a33" }}>●</span> ONLINE 1:18 AM</div>} />;
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
    <Tag f={f} s={58} x={660} y={1010} text="HIS CLOTHES" />
  </AbsoluteFill>
);
const Fact: React.FC<{ f: number; s: number; big: string; small: string; top: number }> = ({ f, s, big, small, top }) => {
  if (f < s) return null; const p = pop(f, s, 12);
  return <div style={{ position: "absolute", left: 90, right: 90, top, transform: `translateX(${(1 - p) * -60}px)`, opacity: p, background: "rgba(10,10,12,0.88)", borderLeft: "10px solid #e3262b", padding: "10px 24px", borderRadius: 10 }}><div style={{ fontFamily: "Lilita One", fontSize: 54, color: "#fff" }}>{big}</div><div style={{ fontFamily: "Fredoka", fontWeight: 600, fontSize: 28, color: "#c9c3b6", letterSpacing: 2 }}>{small}</div></div>;
};
const Unknown: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: "#232327" }}>
    <svg width={W} height={H} style={{ position: "absolute" }}>
      {Array.from({ length: 40 }).map((_, i) => <rect key={i} x={0} y={i * 50} width={W} height={2} fill="#2b2b30" />)}
      <g transform={`translate(540,800) rotate(-1.5) scale(${0.8 + f * 0.0007})`}>
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
    <Img src={S7("k_front.png")} style={{ position: "absolute", left: 540 - 112, top: 800 - 395, height: 600, transform: `rotate(-1.5deg) scale(${0.8 + f * 0.0007})`, transformOrigin: "112px 395px" }} />
    <Vig o={0.55} />
    <Stamp f={f} s={22} text="STILL UNSOLVED" top={700} size={100} rot={-10} />
    <Fact f={f} s={44} top={1205} big="¥20,000,000 REWARD" small="STILL OFFERED BY TOKYO POLICE" />
    <Fact f={f} s={56} top={1335} big="12,545 PIECES OF EVIDENCE" small="AND NOT ONE NAME" />
  </AbsoluteFill>
);
const End: React.FC<{ f: number }> = ({ f }) => {
  const red = Math.floor(f / 6) % 2;
  const dawn = interpolate(f, [0, 70], [0, 0.35], clamp);
  return (
    <>
      <World f={f} keys={[[0, 600, 760, 1.62], [70, 600, 780, 1.7]]} {...FRONT} fg={{ y: 820, k: -0.2 }}>
        <FrontWindows f={f} off={[1, 1, 1, 1]} />
        <FrontExtras f={f} />
        <rect x={0} y={0} width={1195} height={420} fill="#e8a070" opacity={dawn} style={{ mixBlendMode: "screen" }} />
        <rect x={0} y={0} width={1195} height={1316} fill={red ? "#ff1a1a" : "#1a3dff"} opacity={0.16} style={{ mixBlendMode: "screen" }} />
        <g transform="translate(0,1000) rotate(-1.5)"><rect x={-50} y={0} width={1300} height={34} fill="#f2c94c" />{Array.from({ length: 10 }).map((_, i) => <text key={i} x={i * 130} y={25} fontFamily="Lilita One" fontSize={22} fill={INK}>POLICE LINE</text>)}</g>
        {[[300, 1080, "1"], [720, 1090, "2"]].map(([x, y, n]) => <g key={n as string} transform={`translate(${x},${y})`}><path d="M-16,0 L-8,-28 L8,-28 L16,0 Z" fill="#f2c94c" stroke={INK} strokeWidth={2} /><text y={-8} fontFamily="Lilita One" fontSize={18} fill={INK} textAnchor="middle">{n}</text></g>)}
      </World>
      <Vig o={0.6} />
      <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center", transform: `scale(${pop(f, 4, 12)})` }}>
        <div style={{ fontFamily: "Lilita One", fontSize: 116, color: "#fff", WebkitTextStroke: `6px ${INK}`, textShadow: "0 10px 0 #000" }}>WHO WAS HE?</div>
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
  [T7.hook, T7.map, Hook], [T7.map, T7.front, MapIn], [T7.front, T7.entry, Front], [T7.entry, T7.dead, Entry], [T7.dead, T7.rei, Dead], [T7.rei, T7.stairs, Rei], [T7.stairs, T7.kitchen, Stairs],
  [T7.kitchen, T7.stay, Kitchen], [T7.stay, T7.fridge, Stay], [T7.fridge, T7.bath, Fridge], [T7.bath, T7.office, Bath], [T7.office, T7.ev, Office], [T7.ev, T7.un, Evidence], [T7.un, T7.end, Unknown], [T7.end, T7.fin, End],
];
const Scene: React.FC<{ C: React.FC<{ f: number }>; i: number }> = ({ C, i }) => {
  const f = useCurrentFrame();
  // whip-in on hard cuts (front, entry, fridge, unknown, end)
  const whip = [2, 3, 9, 13, 14].includes(i) ? interpolate(f, [0, 5], [1, 0], clamp) : 0;
  return <AbsoluteFill style={{ transform: `scale(${1 + whip * 0.12})`, filter: whip > 0.01 ? `blur(${whip * 12}px)` : undefined }}><C f={f} /></AbsoluteFill>;
};

export const Miya8: React.FC<{ audio?: boolean }> = ({ audio = false }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    {LIST.map(([a, b, C], i) => <Sequence key={i} from={a} durationInFrames={b - a}><Scene C={C} i={i} /></Sequence>)}
    <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 70%, rgba(0,0,0,0.38) 78%, rgba(0,0,0,0.38) 88%, transparent 96%)", pointerEvents: "none" }} />
    <Subs />
    <Grade />
    {audio && <Audio src={staticFile("miya8/mix.wav")} />}
  </AbsoluteFill>
);
