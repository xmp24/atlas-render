import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, random, spring, staticFile, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import "@fontsource/fredoka/600.css";
import "@fontsource/fredoka/700.css";
import "@fontsource/lilita-one/400.css";
import { Stick, walkSP, idleSP, sitSP, track, trackXY, mixSP, REST, SP, STRIDE_PER_RAD, StickIK } from "../Miya7/Stick";
import { ReiScene3, StairsScene3, LivingScene3, BathScene3, OfficeScene3 } from "./Scenes8";
import WORDS from "./words10.json";

const W = 1080, H = 1920, INK = "#151517";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T7 = { hook: 0, photo: 128, front: 140, entry: 186, dead: 309, rei: 408, stairs: 493, kitchen: 615, stay: 759, fridge: 803, bath: 845, office: 878, un: 919, end: 1020, fin: 1143 };
export const V10_FRAMES = T7.fin;
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
  const r = random(`${seed}${Math.floor(f / 2)}`), r2 = random(`${seed}b${Math.floor(f / 5)}`);
  const off = r > 0.94 ? 1 : r2 > 0.9 ? 0.35 : 0;
  return <AbsoluteFill style={{ background: "#000", opacity: off * o, pointerEvents: "none" }} />;
};
/** light snow over exterior scenes */
const Snow: React.FC<{ f: number; n?: number; o?: number }> = ({ f, n = 70, o = 0.8 }) => (
  <svg width={W} height={H} style={{ position: "absolute", pointerEvents: "none" }}>{Array.from({ length: n }).map((_, i) => {
    const sp = 2 + random("sv" + i) * 3, x = (random("sx" + i) * W + Math.sin(f / 20 + i) * 30 + f * 0.6) % W, y = (random("sy" + i) * H + f * sp) % H, r = 1.5 + random("sr" + i) * 3.5;
    return <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={o * (0.35 + random("so" + i) * 0.6)} style={{ filter: r > 3.5 ? "blur(1.5px)" : undefined }} />;
  })}</svg>
);
const Print: React.FC<{ x: number; y: number; o: number; rot?: number; s?: number }> = ({ x, y, o, rot = 0, s = 1 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} opacity={o}>{[0, 1, 2, 3, 4].map((k) => <ellipse key={k} cx={0} cy={0} rx={4 + k * 3} ry={5 + k * 3.6} fill="none" stroke="#9a0f16" strokeWidth={1.6} strokeDasharray="5 3" />)}</g>
);
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
const PostIt: React.FC<{ f: number; s: number; img: string; name: string; age: string; x: number; y: number; rot: number; gone?: number; w?: number; strike?: number }> = ({ f, s, img, name, age, x, y, rot: rot0, gone = 1e9, w = 230, strike = 1e9 }) => {
  if (f < s) return null;
  const rot = rot0 + Math.sin(f / 19 + x) * 1.2;
  const st = interpolate(f, [strike, strike + 8], [0, 1], clamp);
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
      {st > 0 && <svg width={w + 24} height={w * 1.05 + 70} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}><path d={`M14,${w * 0.1} L${14 + (w - 4) * st},${w * 0.1 + w * 0.85 * st}`} stroke="#d4141c" strokeWidth={12} strokeLinecap="round" opacity={0.9} />{st > 0.5 && <path d={`M${w + 10},${w * 0.1} L${w + 10 - (w - 4) * (st - 0.5) * 2},${w * 0.1 + w * 0.85 * (st - 0.5) * 2}`} stroke="#d4141c" strokeWidth={12} strokeLinecap="round" opacity={0.9} />}</svg>}
    </div>
  );
};

// ---------------- scenes ----------------
const Typed: React.FC<{ f: number; text: string; s?: number; top?: number }> = ({ f, text, s = 6, top = 300 }) => {
  const n = Math.max(0, Math.min(text.length, Math.floor((f - s) / 0.75)));
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
const FrontExtras: React.FC<{ f: number; cat?: boolean; clouds?: boolean; lightsOff?: number; neighOff?: number; sweep?: number }> = ({ f, cat, clouds = true, lightsOff, neighOff = 0, sweep }) => (
  <g>
    {Array.from({ length: 14 }).map((_, i) => { const x = 40 + random("nw" + i) * 1110, y = 18 + random("nh" + i) * 120; const off = neighOff * 14 > i; return <rect key={"nb" + i} x={x} y={y} width={14} height={18} fill="#ffd27a" opacity={off ? 0.05 : 0.55 + 0.1 * Math.sin(f / 13 + i)} />; })}
    {sweep !== undefined && (() => { const q = ((f + sweep) % 90) / 90; const x = 1400 - q * 1800; return <rect x={x} y={300} width={260} height={900} fill="#fff4d0" opacity={Math.sin(Math.PI * q) * 0.13} style={{ filter: "blur(40px)" }} transform={`skewX(-18)`} />; })()}
    {Array.from({ length: 16 }).map((_, i) => { const on = lightsOff === undefined || i > (f - lightsOff) / 1.5; const c = ["#ff4a4a", "#ffd24a", "#4aff8a", "#4ab0ff"][i % 4]; return <g key={"lt" + i}><circle cx={320 + i * 28} cy={985 + Math.sin(i * 0.9) * 6} r={5} fill={on ? c : "#2a2a2a"} opacity={on ? 0.8 + 0.2 * Math.sin(f / 4 + i) : 0.6} />{on && <circle cx={320 + i * 28} cy={985 + Math.sin(i * 0.9) * 6} r={14} fill={c} opacity={0.18} />}</g>; })}
    <path d={`M306,980 ${Array.from({ length: 17 }).map((_, i) => `L${306 + i * 28},${985 + Math.sin(i * 0.9) * 6 - 4}`).join(" ")}`} stroke="#151515" strokeWidth={1.5} fill="none" />
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
      <FrontExtras f={f} cat sweep={20} />
      <rect x={-100} y={1000} width={1400} height={160} fill="#9aa8c8" opacity={0.08 + 0.03 * Math.sin(f / 15)} style={{ filter: "blur(18px)" }} />
    </World>
    <Vig o={0.55} />
    <Snow f={f} />
    {/* birds startled off the roof */}
    <svg width={W} height={H} style={{ position: "absolute" }}>{[0, 1, 2, 3].map((i) => { const q = interpolate(f, [2 + i * 2, 40 + i * 2], [0, 1], clamp); const x = 420 + i * 60 + q * (300 + i * 80), y = 520 - q * (420 + i * 40), w = Math.sin(f / 1.8 + i) * 12; return q > 0 && q < 1 && <path key={i} d={`M${x - 18},${y + w} Q${x - 8},${y - 6} ${x},${y} Q${x + 8},${y - 6} ${x + 18},${y + w}`} stroke="#0a0a0c" strokeWidth={4} fill="none" />; })}</svg>
    <Stamp f={f} s={6} text="NEVER CAUGHT" top={1120} size={110} rot={-8} />
  </>
);

// ---------- entry: walk to the ladder, climb rung by rung (IK), slip through the window ----------
const RUNGS = [1105, 1078, 1027, 978, 930, 882, 835, 788, 741, 695, 649, 604];
const rungY = (i: number) => { const a = Math.max(0, Math.min(RUNGS.length - 1, Math.floor(i))), b = Math.min(RUNGS.length - 1, a + 1); return RUNGS[a] + (RUNGS[b] - RUNGS[a]) * (i - Math.floor(i)); };
const limbIdx = (st: number, o: number, base: number) => { const u = (st - o) / 2; if (u < 0) return { i: base, lift: 0 }; const n = Math.floor(u), q = u - n; const mv = Math.min(1, q * 2); const e = mv < 0.5 ? 2 * mv * mv : 1 - Math.pow(-2 * mv + 2, 2) / 2; return { i: base + 2 * n + 2 * e, lift: Math.sin(Math.PI * mv) }; };
const REAR = { src: S7("rear_ladder.png"), iw: 1187, ih: 1325 };
const Entry: React.FC<{ f: number }> = ({ f }) => {
  const H7 = 228, sc = H7 / 585, RAD = (2 * Math.PI) / 22, SPX = STRIDE_PER_RAD * sc;
  const walkEnd = 26, climb0 = 30, STEP = 10, steps = 6, climbEnd = climb0 + STEP * steps;
  const x0 = 652 + walkEnd * RAD * SPX;
  const cut = interpolate(f, [44, 58], [0, 1], clamp), flap = interpolate(f, [58, 64], [0, 1], clamp);
  const open = interpolate(f, [62, 80], [0, 1], { ...clamp, easing: ez });
  const tremble = Math.sin(f / 2.3) * 2 * flap;
  let actor: React.ReactNode = null;
  const prints: React.ReactNode[] = [];
  let head: [number, number] = [652, 900];
  if (f < walkEnd) {
    const ph = f * RAD, x = x0 - ph * SPX;
    const amp = interpolate(f, [walkEnd - 8, walkEnd], [1, 0.2], clamp);
    actor = <Stick x={x} y={1106} h={H7} p={walkSP(ph, amp, 0.35)} f={f} flip shadow={0.45} />;
    head = [x - 30, 900];
    for (let k = 0; k < 8; k++) { const px = x0 + 20 - k * 40; if (px > x + 20) prints.push(<ellipse key={k} cx={px} cy={1108 + (k % 2) * 6} rx={9} ry={4} fill="#2b1d12" opacity={0.55} />); }
  } else {
    const st = interpolate(f, [climb0, climbEnd], [0, steps], clamp);
    const LH = limbIdx(st, 0, 5), RH = limbIdx(st, 1, 5), LF = limbIdx(st, 1, 0), RF = limbIdx(st, 0, 0);
    const lf: [number, number] = [638, rungY(LF.i) - LF.lift * 18], rf: [number, number] = [668, rungY(RF.i) - RF.lift * 18];
    const lh: [number, number] = [622 - LH.lift * 8, rungY(LH.i) - LH.lift * 22], rh: [number, number] = [684 + RH.lift * 8, rungY(RH.i) - RH.lift * 22];
    let hy = (lf[1] + rf[1]) / 2 - 72;
    const enter = interpolate(f, [climbEnd, climbEnd + 20], [0, 1], clamp);
    hy -= enter * 150;
    const sill: [number, number] = [630, 528], sill2: [number, number] = [676, 528];
    // the right hand reaches up to slide the window while he is still climbing
    const reachW = interpolate(f, [56, 64, 80, 86], [0, 1, 1, 0], clamp);
    const rhW: [number, number] = [rh[0] + (700 - rh[0]) * reachW, rh[1] + (470 - rh[1]) * reachW];
    const LHf: [number, number] = enter > 0 ? [lh[0] + (sill[0] - lh[0]) * Math.min(1, enter * 2), lh[1] + (sill[1] - lh[1]) * Math.min(1, enter * 2)] : lh;
    const RHf: [number, number] = enter > 0 ? [rhW[0] + (sill2[0] - rhW[0]) * Math.min(1, enter * 2), rhW[1] + (sill2[1] - rhW[1]) * Math.min(1, enter * 2)] : rhW;
    const hx = 652 + Math.sin(st * Math.PI) * 7 * (1 - enter);
    actor = <StickIK hx={hx} hy={hy} s={sc} lh={LHf} rh={RHf} lf={[lf[0], lf[1] - enter * 150]} rf={[rf[0], rf[1] - enter * 150]} headTilt={Math.sin(f / 13) * 0.4} opacity={1 - Math.max(0, enter - 0.55) * 2.2} />;
    head = [hx, hy - 185 * sc - 100 * sc];
    for (let k = 0; k < 8; k++) prints.push(<ellipse key={k} cx={x0 + 20 - k * 40} cy={1108 + (k % 2) * 6} rx={9} ry={4} fill="#2b1d12" opacity={0.55} />);
  }
  const puffs = [0, 1, 2].map((i) => { const q = ((f + i * 14) % 42) / 42; return <circle key={i} cx={head[0] - 20 - q * 30} cy={head[1] - q * 26} r={6 + q * 14} fill="#dfe6f2" opacity={(1 - q) * 0.22} style={{ filter: "blur(3px)" }} />; });
  // camera follows him up and finally pushes into the dark open window (transition into the house)
  const keys: CK[] = [[0, 760, 860, 1.55], [26, 690, 840, 1.65], [60, 660, 700, 1.95], [92, 650, 560, 2.3], [123, 615, 445, 6.5]];
  return (
    <>
      <World f={f} keys={keys} {...REAR} fg={{ y: 1090, k: -0.3 }}>
        <Moon f={f} x={1040} y={140} />
        {[0, 1].map((i) => <ellipse key={i} cx={((f * (1.4 + i * 0.6) + i * 600) % 1700) - 300} cy={120 + i * 46} rx={170} ry={34} fill="#0b1124" opacity={0.7} style={{ filter: "blur(10px)" }} />)}
        <rect x={576} y={356} width={146} height={166} fill="#1d2640" opacity={0.93} />
        <rect x={576} y={356} width={146} height={166} fill="#c9d6e6" opacity={0.07} />
        <rect x={578} y={358} width={70 * open} height={162} fill="#020306" />
        <g opacity={1 - open * 0.6} transform={`translate(${tremble},0)`}>
          {Array.from({ length: 16 }).map((_, i) => <line key={"m" + i} x1={650} y1={358 + i * 10.4} x2={720} y2={358 + i * 10.4} stroke="#8c97ad" strokeWidth={0.8} opacity={0.35} />)}
          {Array.from({ length: 8 }).map((_, i) => <line key={"n" + i} x1={652 + i * 9.4} y1={358} x2={652 + i * 9.4} y2={520} stroke="#8c97ad" strokeWidth={0.8} opacity={0.35} />)}
          {cut > 0 && <path d={`M660,370 L${660 + 50 * Math.min(1, cut * 2)},370 L${710},${370 + 120 * Math.max(0, cut * 2 - 1)}`} stroke="#d8dde8" strokeWidth={2} fill="none" opacity={0.9} />}
          {flap > 0 && <path d={`M660,370 L710,370 L710,490 Z`} fill="#05070c" opacity={flap} />}
        </g>
        {open > 0.4 && <path d={`M580,360 Q${598 + Math.sin(f / 4) * 10},440 ${590 + Math.sin(f / 5) * 12},520 L578,520 Z`} fill="#6f7d96" opacity={0.6} />}
        {[0, 1, 2].map((i) => <circle key={i} cx={352 + Math.sin(f / (4 + i) + i * 2) * 22} cy={782 + Math.cos(f / (5 + i) + i) * 16} r={2} fill="#fff8e0" />)}
        {prints}
        {actor}
        {puffs}
        <rect x={-100} y={1060} width={1400} height={140} fill="#9aa8c8" opacity={0.07 + 0.03 * Math.sin(f / 15)} style={{ filter: "blur(16px)" }} />
      </World>
      <Snow f={f} n={60} o={0.7 * (1 - interpolate(f, [100, 120], [0, 1], clamp))} />
      <Vig o={0.6} />
      <AbsoluteFill style={{ background: "#020306", opacity: interpolate(f, [112, 123], [0, 0.85], clamp) }} />
      <Chip t={f < 80 ? "11:58 PM" : "12:00 AM"} f={f} />
    </>
  );
};

const Dead: React.FC<{ f: number }> = ({ f }) => {
  const off = [0, 1, 2, 3].map((i) => interpolate(f, [14 + i * 9, 20 + i * 9], [0, 1], clamp));
  const tear = interpolate(f, [56, 70], [0, 1], { ...clamp, easing: ez });
  return (
    <>
      <World f={f} keys={[[0, 600, 640, 2.1], [10, 600, 680, 1.7], [100, 600, 640, 1.85]]} {...FRONT} grade="saturate(0.7) brightness(0.98) contrast(1.05)">
        <FrontWindows f={f} off={off} />
        <FrontExtras f={f} lightsOff={8} neighOff={interpolate(f, [10, 70], [0, 1], clamp)} sweep={50} />
        <rect x={-200} y={-200} width={1600} height={1800} fill="#050814" opacity={0.12} />
      </World>
      <Snow f={f} />
      <Vig o={0.8} />
      <AbsoluteFill style={{ background: "#020306", opacity: interpolate(f, [0, 8], [0.85, 0], clamp) }} />
      <PostIt f={f} s={16} img="v_rei.jpg" name="REI" age="6" x={175} y={260} rot={-5} gone={44} w={190} />
      <PostIt f={f} s={22} img="v_mikio.jpg" name="MIKIO" age="44" x={420} y={245} rot={3} gone={50} w={190} />
      <PostIt f={f} s={28} img="v_yasuko.jpg" name="YASUKO" age="41" x={665} y={260} rot={-3} gone={56} w={190} />
      <PostIt f={f} s={34} img="v_niina.jpg" name="NIINA" age="8" x={905} y={250} rot={5} gone={62} w={190} />
      {/* tear-off calendar: Dec 30 rips away to Dec 31 */}
      <div style={{ position: "absolute", left: 60, top: 1150, width: 170, height: 200, perspective: 600 }}>
        <div style={{ position: "absolute", inset: 0, background: "#f4f0e6", borderRadius: 8, boxShadow: "0 10px 20px rgba(0,0,0,0.5)", textAlign: "center" }}><div style={{ background: "#c8102e", color: "#fff", fontFamily: "Lilita One", fontSize: 30, padding: 6, borderRadius: "8px 8px 0 0" }}>DEC</div><div style={{ fontFamily: "Lilita One", fontSize: 96, color: "#1a1a1a" }}>31</div></div>
        {tear < 1 && <div style={{ position: "absolute", inset: 0, background: "#f4f0e6", borderRadius: 8, textAlign: "center", transformOrigin: "0% 0%", transform: `rotate(${tear * 70}deg) translate(${tear * 120}px,${tear * 260}px)`, opacity: 1 - tear }}><div style={{ background: "#c8102e", color: "#fff", fontFamily: "Lilita One", fontSize: 30, padding: 6, borderRadius: "8px 8px 0 0" }}>DEC</div><div style={{ fontFamily: "Lilita One", fontSize: 96, color: "#1a1a1a" }}>30</div></div>}
      </div>
      <Chip t={f < 62 ? "12:00 AM" : "12:05 AM"} f={f} />
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
const Room3D: React.FC<{ f: number; C: React.FC<{ f: number; len: number }>; len: number; label: string; alive?: React.ReactNode; over?: React.ReactNode; chip?: [string, number]; grade?: string; dutch?: number; punch?: number; punchO?: string; fg?: "l" | "r" }> = ({ f, C, len, label, alive, over, chip, grade, dutch = 0, punch = 0, punchO = "50% 40%", fg }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ filter: grade, transform: `${dutch ? `rotate(${dutch}deg) scale(${1 + Math.abs(dutch) * 0.03})` : ""} ${punch ? `scale(${1 + 0.35 * punch})` : ""}`, transformOrigin: punchO }}><C f={f} len={len} /></AbsoluteFill>
    <AbsoluteFill style={{ backdropFilter: "blur(5px)", WebkitMaskImage: "radial-gradient(ellipse 62% 58% at 50% 48%, transparent 55%, #000 100%)", maskImage: "radial-gradient(ellipse 62% 58% at 50% 48%, transparent 55%, #000 100%)", pointerEvents: "none" }} />
    {fg && <div style={{ position: "absolute", top: -40, bottom: -40, [fg === "l" ? "left" : "right"]: -70 + Math.sin(f / 30) * 10, width: 170, background: "linear-gradient(90deg,#0b0907,#1d1610 70%,rgba(20,15,10,0))", transform: fg === "r" ? "scaleX(-1)" : undefined, filter: "blur(14px)", opacity: 0.92 }} />}
    <AbsoluteFill style={{ opacity: 0.1, mixBlendMode: "multiply", background: "radial-gradient(circle at 20% 80%, #3a2a1a 0 8%, transparent 20%), radial-gradient(circle at 80% 15%, #2a2018 0 6%, transparent 18%), radial-gradient(circle at 60% 60%, #30261c 0 5%, transparent 14%)" }} />
    <Flicker f={f} seed={label} o={0.3} />
    <Vig o={0.6} />
    {label && <Typed f={f} text={label} s={4} />}
    {over}
    {chip && <Chip t={chip[0]} f={f} inside={inside(chip[1])} />}
    <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [0, 3], [0.35, 0], clamp), pointerEvents: "none" }} />
    {alive}
  </AbsoluteFill>
);
const UP = "saturate(0.78) hue-rotate(-10deg) contrast(1.08) brightness(0.97)", DOWN = "sepia(0.18) saturate(0.95) contrast(1.08)";
const Rei: React.FC<{ f: number }> = ({ f }) => <Room3D f={f} C={ReiScene3} len={85} label="REI'S ROOM · 2F" chip={["12:05 AM", 5]} grade={UP} fg="r"
  over={<PostIt f={f} s={4} img="v_rei.jpg" name="REI" age="6" x={850} y={330} rot={4} gone={30} strike={30} w={200} />} />;
/** the snapping blade: a kitchen knife breaks in two with sparks */
const Snap: React.FC<{ f: number; s: number }> = ({ f, s }) => {
  if (f < s) return null;
  const k = interpolate(f, [s, s + 6], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) }), o = interpolate(f, [s, s + 3], [0, 1], clamp);
  return (
    <svg width={W} height={H} style={{ position: "absolute", pointerEvents: "none" }} opacity={o}>
      <g transform="translate(540,960)">
        <g transform={`translate(${-20 - 60 * k},${-10 * k}) rotate(${-14 * k})`}><rect x={-230} y={-22} width={110} height={44} rx={10} fill="#3a2618" stroke="#111" strokeWidth={4} /><circle cx={-200} cy={0} r={5} fill="#c9c9c9" /><circle cx={-160} cy={0} r={5} fill="#c9c9c9" /><path d="M-120,-18 L-10,-18 L4,4 L-20,22 L-120,22 Z" fill="#dfe3e8" stroke="#111" strokeWidth={4} /></g>
        <g transform={`translate(${20 + 90 * k},${30 * k}) rotate(${24 * k})`}><path d="M10,-18 L-4,4 L18,22 L190,10 L230,-6 Z" fill="#dfe3e8" stroke="#111" strokeWidth={4} /><path d="M40,-8 L200,-4" stroke="#fff" strokeWidth={3} opacity={0.6} /></g>
        {Array.from({ length: 12 }).map((_, i) => { const a = random("sp" + i) * Math.PI * 2, d = 40 + 140 * k * (0.5 + random("sd" + i)); return <line key={i} x1={Math.cos(a) * d * 0.6} y1={Math.sin(a) * d * 0.6} x2={Math.cos(a) * d} y2={Math.sin(a) * d} stroke="#ffd56a" strokeWidth={4} strokeLinecap="round" opacity={1 - k * 0.8} />; })}
        <circle r={60 * (1 - k) + 10} fill="#fff6c8" opacity={0.7 * (1 - k)} />
      </g>
    </svg>
  );
};
const Stairs: React.FC<{ f: number }> = ({ f }) => <Room3D f={f} C={StairsScene3} len={122} label="THE STAIRS" chip={["12:10 AM", 10]} grade={DOWN} dutch={-3} fg="l"
  over={<><PostIt f={f} s={4} img="v_mikio.jpg" name="MIKIO" age="44" x={850} y={330} rot={3} gone={50} strike={50} w={200} />
    {f < 34 && <svg width={W} height={H} style={{ position: "absolute" }}>{[0, 1, 2, 3, 4, 5].map((i) => { const q = interpolate(f, [4, 30], [0, 1], clamp); return <circle key={i} cx={430 + i * 40 + q * (i - 2.5) * 30} cy={1330 - q * 50 - (i % 2) * 10} r={10 + q * 34} fill="#c9b79a" opacity={(1 - q) * 0.22} style={{ filter: "blur(6px)" }} />; })}</svg>}
    <Snap f={f} s={95} />{f > 100 && <Stamp f={f} s={100} text="THE BLADE SNAPPED" top={1150} size={64} color="#fff" rot={-3} />}</>} />;

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
/** the missing knife: sits in the block, then crumbles into dark dust that drifts away */
const KnifeDust: React.FC<{ f: number; s: number }> = ({ f, s: s0 }) => {
  const k = interpolate(f, [s0, s0 + 22], [0, 1], clamp);
  return (
    <g>
      {k < 1 && <g opacity={1 - k}><rect x={377} y={768} width={18} height={70} rx={4} fill="#231812" stroke="#0a0806" strokeWidth={2} /><circle cx={386} cy={785} r={2.2} fill="#9a9a9a" /><circle cx={386} cy={815} r={2.2} fill="#9a9a9a" /><path d="M379,772 L381,834" stroke="#fff" strokeWidth={1.2} opacity={0.25} /></g>}
      {k > 0 && Array.from({ length: 46 }).map((_, i) => {
        const y0 = 770 + random("kd" + i) * 68, x0 = 378 + random("ke" + i) * 16, del = (y0 - 770) / 68 * 0.35, q = Math.max(0, Math.min(1, (k - del) / (1 - del)));
        if (q <= 0) return null;
        const x = x0 + q * (40 + random("kf" + i) * 120), y = y0 - q * (60 + random("kg" + i) * 140) + Math.sin(q * 6 + i) * 8;
        return <circle key={i} cx={x} cy={y} r={1.5 + random("kh" + i) * 3 + q * 3} fill={i % 6 === 0 ? "#4a0a12" : "#120e10"} opacity={(1 - q) * 0.9} />;
      })}
    </g>
  );
};
const KIT = { src: S7("kitchen.png"), iw: 967, ih: 1627 };
const KitchenWorld: React.FC<{ f: number; keys: CK[] }> = ({ f, keys }) => {
  const steps = [[860, 1600], [800, 1585], [745, 1610], [690, 1592]];
  return (
    <World f={f} keys={keys} {...KIT}>
      <circle cx={452} cy={352} r={300 + Math.sin(f / 7) * 12} fill="#ffd9a0" opacity={0.06} />
      <g transform="translate(160,470) rotate(-4)"><rect width={90} height={70} fill="#fbf8ee" /><circle cx={70} cy={16} r={8} fill="#f2c94c" /><path d="M14,58 L14,30 L30,30 M40,58 L40,26 M60,58 L60,34" stroke="#d8352a" strokeWidth={3} /><rect x={36} y={-6} width={22} height={10} fill="#e9e0b8" opacity={0.8} /></g>
      <g transform="translate(400,500) rotate(5)"><rect width={80} height={62} fill="#fbf8ee" /><path d="M10,50 Q40,10 70,50" stroke="#2f7ad6" strokeWidth={3} fill="none" /><rect x={30} y={-6} width={22} height={10} fill="#e9e0b8" opacity={0.8} /></g>
      <KnifeDust f={f} s={68} />
      {f > 92 && <circle cx={386} cy={815} r={70 + Math.sin(f / 4) * 4} fill="none" stroke="#ff2a2a" strokeWidth={5} opacity={interpolate(f, [92, 100], [0, 1], clamp)} strokeDasharray="20 9" />}
      <Dust f={f} box={[250, 380, 450, 550]} o={0.5} />
      <circle cx={620} cy={1300} r={300} fill="#3a0a14" opacity={0.1} style={{ filter: "blur(60px)" }} />
      {/* muddy footprints appear one by one, then blood drops toward the door */}
      {steps.map(([x, y], i) => <ellipse key={"fp" + i} cx={x} cy={y} rx={16} ry={7} fill="#2b1d12" opacity={interpolate(f, [6 + i * 6, 10 + i * 6], [0, 0.6], clamp)} />)}
      {[[520, 1560, 7], [470, 1590, 5], [405, 1575, 8], [350, 1605, 5], [280, 1590, 6], [210, 1612, 4]].map(([x, y, r], i) => <ellipse key={"bd" + i} cx={x} cy={y} rx={r * 1.6} ry={r * 0.7} fill="#4a070b" opacity={0.85} />)}
      <Smoke2D f={f} x={620} y={1620} h={600} n={44} />
      <Stick x={620} y={1620} h={600} p={idleSP(f)} view="back" f={f} shadow={0.45} />
      {[0, 1].map((i) => { const q = ((f + i * 22) % 44) / 44; return <ellipse key={"br" + i} cx={680 + q * 40} cy={1100 - q * 50} rx={14 + q * 26} ry={10 + q * 16} fill="#e6ecf4" opacity={Math.sin(Math.PI * q) * 0.16} style={{ filter: "blur(5px)" }} />; })}
    </World>
  );
};
const Kitchen: React.FC<{ f: number }> = ({ f }) => {
  // split screen while "killed with a knife from their own kitchen": top = the knife block close-up
  const sp = interpolate(f, [50, 58, 112, 120], [0, 1, 1, 0], { ...clamp, easing: ez });
  const main: CK[] = [[0, 483, 1000, 1.2], [70, 470, 980, 1.3], [144, 505, 1010, 1.62]];
  return (
    <AbsoluteFill>
      <KitchenWorld f={f} keys={main} />
      {sp > 0 && <AbsoluteFill style={{ clipPath: `inset(0 0 ${100 - 50 * sp}% 0)` }}>
        <KitchenWorld f={f} keys={[[0, 390, 925, 4.2], [144, 388, 915, 4.6]]} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 960 - 4, height: 8, background: "#e3262b", boxShadow: "0 0 18px rgba(227,38,43,0.8)" }} />
      </AbsoluteFill>}
      <Flicker f={f} seed="kit" o={0.3} />
      <Vig o={0.6} />
      <Typed f={f} text="THE KITCHEN" s={4} />
      <PostIt f={f} s={4} img="v_yasuko.jpg" name="YASUKO" age="41" x={820} y={330} rot={-4} gone={50} strike={50} w={190} />
      <PostIt f={f} s={20} img="v_niina.jpg" name="NIINA" age="8" x={820} y={640} rot={4} gone={56} strike={56} w={190} />
      {f > 100 && <Stamp f={f} s={100} text="1 KNIFE MISSING" top={sp > 0.5 ? 820 : 930} size={62} color="#fff" rot={-3} />}
      <Chip t="12:15 AM" f={f} inside={inside(15)} />
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [0, 3], [0.35, 0], clamp), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
const Stay: React.FC<{ f: number }> = ({ f }) => <Room3D f={f} C={LivingScene3} len={44} label="LIVING ROOM" chip={["12:30 AM", 30]} grade={DOWN} fg="l" punch={interpolate(f, [32, 38], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) })} punchO="62% 34%"
  over={f > 32 && <AbsoluteFill style={{ background: "#b0101a", opacity: interpolate(f, [32, 35, 44], [0, 0.35, 0], clamp), mixBlendMode: "screen" }} />} />;
const FRIDGE = { src: S7("fridge_nok.png"), iw: 1065, ih: 1477 };
/** fridge scene. mode "cold": cold open, already eating one bar, reaches for a second. mode "mid": drinks their barley tea, wrappers on the floor */
const FridgeS: React.FC<{ f: number; mode: "cold" | "mid" }> = ({ f, mode }) => {
  const sc = 1.35, hx = 690 + Math.sin(f / 30) * 3, feetY = 1330, hy = feetY - 205 * sc + Math.sin(f / 11) * 3;
  const mouth: [number, number] = [688, 700];
  const kk = (a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: ez });
  const lerp2 = (A: [number, number], B: [number, number], k: number): [number, number] => [A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k];
  let lh: [number, number], rh: [number, number] = [838, 760], held: React.ReactNode = null, tilt = Math.sin(f / 17) * 0.15;
  const redBar = (rot: number, c = "#c8473f", d = "#7a1f1a") => <g transform={`rotate(${rot})`}><rect x={-13} y={-44} width={26} height={52} rx={11} fill={c} stroke={d} strokeWidth={2} /><rect x={-4} y={6} width={8} height={24} rx={3} fill="#d9b27a" /></g>;
  let gone1 = true, gone2 = false;
  if (mode === "cold") {
    // 0-60 eating (bites), 62-80 reaches the yellow bar, 80-100 brings it back, then bites again
    const yel: [number, number] = [591, 552];
    const out = kk(60, 76), back = kk(84, 100);
    const bite = Math.max(0, Math.sin(f / 2.6)) * 20 * (f < 58 || f > 100 ? 1 : 0);
    lh = out < 1 ? lerp2([mouth[0], mouth[1] + bite], yel, out) : lerp2(yel, mouth, back);
    if (f > 100) lh = [mouth[0], mouth[1] + bite];
    gone2 = f >= 78;
    if (f >= 78 && back < 0.45) held = <g transform={`translate(${lh[0]},${lh[1]})`}>{redBar(-20 + back * 40, "#e8c23a", "#8a6a12")}</g>;
    tilt = (out > 0 && back < 1 ? 0.4 * out : -0.5) + Math.sin(f / 17) * 0.15;
  } else {
    // takes the barley-tea bottle from the door and drinks
    const bottle: [number, number] = [808, 712];
    const out = kk(0, 10), back = kk(14, 24);
    rh = back > 0 ? lerp2(bottle, [mouth[0] + 30, mouth[1] - 10], back) : lerp2([838, 760], bottle, out);
    lh = [640, 1010];
    tilt = -0.6 * back + Math.sin(f / 17) * 0.1;
    gone2 = true;
    if (f >= 11 && back < 0.5) held = <g transform={`translate(${rh[0]},${rh[1]}) rotate(${back * -50})`}><rect x={-12} y={-60} width={24} height={70} rx={6} fill="#6b4a1e" opacity={0.92} stroke="#2a1a08" strokeWidth={2} /><rect x={-6} y={-76} width={12} height={18} rx={3} fill="#f2f2ee" /><rect x={-12} y={-30} width={24} height={22} fill="#e9e1c8" /></g>;
  }
  const hcx = hx + tilt * 10 * sc, hcy = hy - 285 * sc, r = 86 * sc;
  const P = (d: number) => `${hcx + Math.cos(d * Math.PI / 180) * r},${hcy + Math.sin(d * Math.PI / 180) * r}`;
  const keys: CK[] = mode === "cold" ? [[0, 640, 640, 2.3], [40, 600, 720, 1.85], [128, 520, 790, 1.5]] : [[0, 505, 820, 1.42], [42, 520, 790, 1.5]];
  return (
    <AbsoluteFill>
      <World f={f} keys={keys} {...FRIDGE}>
        <rect x={830} y={0} width={300} height={1477} fill="url(#rdark)" />
        <g transform="translate(790,470) rotate(3)"><rect width={70} height={56} fill="#fbf8ee" /><path d="M10,46 L22,20 L34,46 M46,46 L46,24" stroke="#d8352a" strokeWidth={3} fill="none" /></g>
        {[[800, 620, "#d8352a"], [850, 640, "#2f7ad6"], [820, 680, "#f2c94c"]].map(([x, y, c], i) => <circle key={i} cx={x as number} cy={y as number} r={9} fill={c as string} stroke="#222" strokeWidth={1.5} />)}
        <defs><linearGradient id="icg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgb(222,208,192)" /><stop offset="1" stopColor="rgb(196,179,159)" /></linearGradient>
          <linearGradient id="rdark" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#000" stopOpacity="0" /><stop offset="0.35" stopColor="#000" stopOpacity="0.75" /><stop offset="1" stopColor="#000" stopOpacity="0.9" /></linearGradient>
          <radialGradient id="fglow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fff4d6" stopOpacity="0.5" /><stop offset="1" stopColor="#fff4d6" stopOpacity="0" /></radialGradient></defs>
        {gone1 && <rect x={542} y={507} width={29} height={79} fill="url(#icg)" />}
        {gone2 && <rect x={574} y={507} width={36} height={79} fill="url(#icg)" />}
        <ellipse cx={620} cy={780} rx={330} ry={420} fill="url(#fglow)" opacity={0.55 + 0.05 * Math.sin(f / 3)} />
        {Array.from({ length: 9 }).map((_, i) => { const q = ((f + i * 7) % 50) / 50; return <ellipse key={"v" + i} cx={520 + i * 30 + q * 40} cy={1060 + q * 160} rx={50 + q * 60} ry={18 + q * 14} fill="#e8f0ff" opacity={Math.sin(Math.PI * q) * 0.13} style={{ filter: "blur(10px)" }} />; })}
        {mode === "mid" && <g>{/* wrappers and sticks he dropped */}
          <path d="M470,1268 l38,-8 l6,16 l-40,10 z" fill="#c8473f" opacity={0.9} /><path d="M560,1300 l30,6 l-4,14 l-32,-6 z" fill="#e8c23a" opacity={0.9} />
          <rect x={520} y={1288} width={30} height={6} rx={3} fill="#d9b27a" transform="rotate(25,535,1291)" /><rect x={600} y={1262} width={30} height={6} rx={3} fill="#d9b27a" transform="rotate(-12,615,1265)" />
          {[[480, 1250], [585, 1282]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={9} ry={4} fill="#d8c8a8" opacity={0.6} />)}</g>}
        {[0, 1, 2].map((i) => <ellipse key={i} cx={960 - i * 26} cy={1290 + i * 18} rx={6} ry={3} fill="#5a0a0e" opacity={0.8} />)}
        <ellipse cx={hx} cy={feetY + 4} rx={150} ry={22} fill="#000" opacity={0.5} />
        <StickIK hx={hx} hy={hy} s={sc} lh={lh} rh={rh} lf={[hx - 40, feetY]} rf={[hx + 44, feetY - 2]} headTilt={tilt} />
        <path d={`M${hx - 52},${hy - 185 * sc} L${hx - 34},${hy}`} stroke="#fff1cc" strokeWidth={5} opacity={0.45} style={{ filter: "blur(2px)" }} />
        <path d={`M${P(150)} A${r},${r} 0 0 1 ${P(250)}`} stroke="#fff1cc" strokeWidth={6} fill="none" opacity={0.55} strokeLinecap="round" style={{ filter: "blur(1.5px)" }} />
        {held}
        {mode === "mid" && <Print x={846} y={742} o={interpolate(f, [8, 14], [0, 0.85], clamp)} rot={20} />}
        {mode === "mid" && <Print x={862} y={790} o={interpolate(f, [10, 16], [0, 0.7], clamp)} rot={-10} s={0.8} />}
      </World>
      {mode === "mid" && <AbsoluteFill style={{ background: "#000", opacity: interpolate(f, [30, 40], [0, 0.82], clamp) }} />}
      <Vig o={0.55} />
      {mode === "cold" ? <>
        <div style={{ position: "absolute", left: 50, top: 150, fontFamily: "monospace", fontWeight: 700, fontSize: 40, color: "#f2f2f2", textShadow: "2px 0 #ff2a6a, -2px 0 #2affff" }}><div>{Math.floor(f / 15) % 2 ? "●" : "○"} REC</div><div>DEC.31.2000 · 12:41 AM</div></div>
        <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0 2px, transparent 2px 5px)" }} />
        <AbsoluteFill style={{ background: "#000", opacity: interpolate(f, [0, 6], [1, 0], clamp) }} />
      </> : <Chip t="12:41 AM" f={f} inside={inside(41)} />}
    </AbsoluteFill>
  );
};
const ColdOpen: React.FC<{ f: number }> = ({ f }) => <FridgeS f={f} mode="cold" />;
const Fridge: React.FC<{ f: number }> = ({ f }) => <FridgeS f={f} mode="mid" />;
/** 0.4 s VHS rewind to the family photo (grey, glitching, the killer's ghost behind them) */
const PhotoFlash: React.FC<{ f: number }> = ({ f }) => {
  const k = f / 13;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 1920 * 1.333, height: 1920, transform: `translate(-50%,-50%) scale(${1.25 - k * 0.12}) translateX(${(random("pf" + f) - 0.5) * 50}px)` }}>
        <Img src={staticFile("miya2/steps.jpg")} style={{ width: "100%", height: "100%", filter: `grayscale(${Math.min(1, k * 1.5)}) contrast(1.2) brightness(0.85)` }} />
        <Img src={S7("k_front.png")} style={{ position: "absolute", left: "46.5%", top: "11%", height: "23%", opacity: 0.7 * k, filter: "brightness(0.8)" }} />
      </div>
      {[0, 1, 2].map((i) => <div key={i} style={{ position: "absolute", left: 0, right: 0, top: `${(random("rw" + i + f) * 100).toFixed(1)}%`, height: 18 + i * 10, background: "rgba(255,255,255,0.18)", mixBlendMode: "screen" }} />)}
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 5px)" }} />
      <div style={{ position: "absolute", left: 50, top: 150, fontFamily: "monospace", fontWeight: 700, fontSize: 46, color: "#fff", textShadow: "2px 0 #ff2a6a, -2px 0 #2affff" }}>◀◀ REWIND</div>
      <Vig o={0.75} />
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [0, 2, 10, 13], [0.7, 0, 0, 0.8], clamp) }} />
    </AbsoluteFill>
  );
};
/** CRT close-up of the dial-up screen */
const Crt: React.FC<{ f: number; s: number }> = ({ f, s }) => {
  if (f < s) return null;
  const p = pop(f, s, 14), g = f - s;
  const lines = ["C:\\> Dial-Up Networking", "Dialing...", "Verifying user name and password...", "Connected at 56,000 bps", "12/31/2000  01:18 AM"];
  const full = lines.join("\n"), nch = Math.min(full.length, Math.floor(g * 9)), typed = full.slice(0, nch).split("\n");
  const shown = typed.length;
  return (
    <AbsoluteFill style={{ background: "#05070c", opacity: Math.min(1, p * 1.4) }}>
      <div style={{ position: "absolute", left: 70, top: 470, width: 940, height: 760, borderRadius: 60, background: "#0d1b3a", boxShadow: "inset 0 0 120px #000, 0 0 80px rgba(80,140,255,0.35)", overflow: "hidden", transform: `scale(${0.9 + 0.1 * p})` }}>
        <div style={{ position: "absolute", left: 60, top: 70, right: 60, background: "#c0c0c0", border: "4px solid #fff", borderRightColor: "#444", borderBottomColor: "#444", padding: 0 }}>
          <div style={{ background: "linear-gradient(90deg,#000a7a,#1084d0)", color: "#fff", fontFamily: "sans-serif", fontWeight: 700, fontSize: 34, padding: "6px 14px" }}>Connected to Internet</div>
          <div style={{ padding: "18px 22px", fontFamily: "monospace", fontSize: 32, color: "#111", lineHeight: 1.5 }}>{typed.map((l, i) => <div key={i} style={{ color: i === 4 ? "#b5121b" : "#111", fontWeight: i === 4 ? 700 : 400 }}>{l}{i === shown - 1 && <span style={{ opacity: Math.floor(f / 4) % 2 }}>█</span>}</div>)}</div>
        </div>
        <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0 3px, transparent 3px 6px)" }} />
        <AbsoluteFill style={{ background: `rgba(160,200,255,${0.05 + 0.04 * Math.sin(f * 1.7)})` }} />
      </div>
    </AbsoluteFill>
  );
};
const Bath: React.FC<{ f: number }> = ({ f }) => <Room3D f={f} C={BathScene3} len={33} label="BATHROOM · 2F" chip={["12:52 AM", 52]} grade={UP} dutch={2} fg="r" />;
const Office: React.FC<{ f: number }> = ({ f }) => <Room3D f={f} C={OfficeScene3} len={41} label="OFFICE · 2F" chip={["1:18 AM", 78]} grade={UP}
  over={f > 10 && f < 24 && <div style={{ position: "absolute", right: 60, top: 560, transform: `scale(${pop(f, 10, 11)})`, transformOrigin: "100% 50%", background: "rgba(8,12,24,0.88)", border: "3px solid #4a7dff", borderRadius: 12, padding: "8px 20px", fontFamily: "monospace", fontWeight: 700, fontSize: 34, color: "#cfe0ff", boxShadow: "0 0 24px rgba(74,125,255,0.5)" }}><span style={{ color: Math.floor(f / 5) % 2 ? "#3dff7a" : "#1a6a33" }}>●</span> ONLINE 1:18 AM</div>}
  alive={<Crt f={f} s={24} />} />;
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
    <Fact f={f} s={74} top={1240} big="HIS DNA: MIXED ASIAN–EUROPEAN" small="ACCORDING TO FORENSIC ANALYSIS" />
  </AbsoluteFill>
);
const Fact: React.FC<{ f: number; s: number; big: string; small: string; top: number; count?: [number, string, string] }> = ({ f, s, big, small, top, count }) => {
  if (f < s) return null; const p = pop(f, s, 12);
  let txt = big;
  if (count) { const v = Math.round(count[0] * Math.min(1, Math.pow((f - s) / 18, 0.6))); txt = count[1] + v.toLocaleString("en-US") + count[2]; }
  return <div style={{ position: "absolute", left: 90, right: 90, top, transform: `translateX(${(1 - p) * -60}px)`, opacity: p, background: "rgba(10,10,12,0.88)", borderLeft: "10px solid #e3262b", padding: "10px 24px", borderRadius: 10 }}><div style={{ fontFamily: "Lilita One", fontSize: 54, color: "#fff" }}>{txt}</div><div style={{ fontFamily: "Fredoka", fontWeight: 600, fontSize: 28, color: "#c9c3b6", letterSpacing: 2 }}>{small}</div></div>;
};
const Unknown: React.FC<{ f: number }> = ({ f }) => {
  const drop = spring({ frame: f - 2, fps: 30, config: { damping: 10, stiffness: 140 } });
  const sc = 0.8 + Math.max(0, f) * 0.0006;
  const q = interpolate(f, [78, 90], [0, 1], clamp);
  const ff = f < 10;
  return (
    <AbsoluteFill style={{ background: "#232327" }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <defs><filter id="corkF"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="4" /><feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.38  0 0 0 0 0.22  0 0 0 0.55 0" /></filter>
          <pattern id="paperN" width="200" height="200" patternUnits="userSpaceOnUse"><rect width="200" height="200" filter="url(#corkF)" opacity="0.25" /></pattern></defs>
        <rect width={W} height={H} fill="#5a3e26" /><rect width={W} height={H} filter="url(#corkF)" />
        <rect width={W} height={H} fill="#000" opacity={0.35} />
        <g transform={`translate(540,${800 - (1 - drop) * 1300}) rotate(${-1.5 + (1 - drop) * 8}) scale(${sc})`}>
          <rect x={-345} y={-565} width={690} height={1010} fill="#000" opacity={0.35} transform="translate(14,18)" />
          <rect x={-340} y={-560} width={680} height={1000} fill="#f2ecdc" />
          <rect x={-340} y={-560} width={680} height={1000} fill="url(#paperN)" opacity={0.35} />
          <path d="M-340,-80 L340,-60" stroke="#d6cdb6" strokeWidth={3} opacity={0.8} />
          <rect x={-340} y={-560} width={680} height={130} fill="#b8161c" />
          <text y={-468} fontFamily="Lilita One" fontSize={92} fill="#fff" textAnchor="middle" letterSpacing={6}>WANTED</text>
          <rect x={-260} y={-400} width={520} height={620} fill="#cfc9bb" />
          {q > 0 && <text y={80} fontFamily="Lilita One" fontSize={460} fill="#1a1a1e" textAnchor="middle" opacity={q}>?</text>}
          <text y={300} fontFamily="Fredoka" fontWeight={700} fontSize={44} fill={INK} textAnchor="middle">MALE · DNA ON FILE</text>
          <text y={360} fontFamily="Fredoka" fontWeight={600} fontSize={34} fill="#555" textAnchor="middle">NO MATCH IN ANY DATABASE</text>
          {drop > 0.9 && <><circle cx={0} cy={-575} r={16} fill="#d61e2b" stroke="#600" strokeWidth={3} /><rect x={-380} y={400} width={110} height={34} fill="#e9dfb8" opacity={0.85} transform="rotate(28,-325,417)" /><rect x={270} y={400} width={110} height={34} fill="#e9dfb8" opacity={0.85} transform="rotate(-26,325,417)" /></>}
        </g>
      </svg>
      <Img src={S7("k_front.png")} style={{ position: "absolute", left: 540 - 112, top: 800 - 395 - (1 - drop) * 1300, height: 600, opacity: 1 - q, transform: `rotate(${-1.5 + (1 - drop) * 8}deg) scale(${sc})`, transformOrigin: "112px 395px" }} />
      <Vig o={0.55} />
      <Stamp f={f} s={22} text="STILL UNSOLVED" top={700} size={100} rot={-10} />
      {f > 22 && f < 40 && <svg width={W} height={H} style={{ position: "absolute" }}>{Array.from({ length: 14 }).map((_, i) => { const k = (f - 22) / 18, a = random("ud" + i) * 6.28; return <circle key={i} cx={540 + Math.cos(a) * (260 + 200 * k)} cy={770 + Math.sin(a) * (90 + 120 * k)} r={8 + 16 * k} fill="#d9c9a8" opacity={(1 - k) * 0.35} style={{ filter: "blur(4px)" }} />; })}</svg>}
      <Fact f={f} s={40} top={1205} big="" count={[20000000, "¥", " REWARD"]} small="STILL OFFERED BY TOKYO POLICE" />
      <Fact f={f} s={52} top={1335} big="" count={[12545, "", " PIECES OF EVIDENCE"]} small="AND NOT ONE NAME" />
      {ff && <><AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.12) 0 3px, transparent 3px 9px)", transform: `translateY(${(f * 37) % 40}px)` }} />
        <div style={{ position: "absolute", left: 50, top: 150, fontFamily: "monospace", fontWeight: 700, fontSize: 46, color: "#fff", textShadow: "2px 0 #ff2a6a, -2px 0 #2affff" }}>▶▶ 2000 → 2025</div></>}
      {f < 6 && <AbsoluteFill style={{ background: `linear-gradient(0deg, transparent ${random("ug" + f) * 70}%, rgba(255,0,60,0.35) ${random("ug" + f) * 70 + 4}%, transparent ${random("ug" + f) * 70 + 9}%)`, mixBlendMode: "screen", transform: `translateX(${(random("uh" + f) - 0.5) * 50}px)` }} />}
    </AbsoluteFill>
  );
};
const End: React.FC<{ f: number }> = ({ f }) => {
  const red = Math.floor(f / 6) % 2;
  const dawn = interpolate(f, [0, 100], [0, 0.38], clamp);
  return (
    <>
      <World f={f} keys={[[0, 620, 780, 1.55], [100, 620, 800, 1.72]]} {...FRONT} fg={{ y: 820, k: -0.2 }}>
        <FrontWindows f={f} off={[1, 1, 1, 1]} />
        <FrontExtras f={f} lightsOff={-100} neighOff={0.6} />
        <rect x={0} y={0} width={1195} height={420} fill="#e8a070" opacity={dawn} style={{ mixBlendMode: "screen" }} />
        <rect x={0} y={0} width={1195} height={1316} fill={red ? "#ff1a1a" : "#1a3dff"} opacity={0.16} style={{ mixBlendMode: "screen" }} />
        <g transform={`translate(${interpolate(f, [0, 40], [1400, 800], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) })},1105)`}>
          <path d="M-210,0 L-210,-46 L-150,-52 L-100,-92 L80,-92 L130,-52 L210,-44 L210,0 Z" fill="#f2f2ee" stroke="#111" strokeWidth={4} />
          <path d="M-210,-30 L210,-30 L210,-12 L-210,-12 Z" fill="#111" /><path d="M-92,-86 L-40,-86 L-40,-54 L-128,-54 Z M-30,-86 L70,-86 L112,-54 L-30,-54 Z" fill="#2a3442" />
          <rect x={-46} y={-108} width={60} height={16} rx={4} fill={red ? "#ff2a2a" : "#3a0a0a"} /><rect x={14} y={-108} width={60} height={16} rx={4} fill={red ? "#0a1a3a" : "#2a5aff"} />
          <circle cx={-130} cy={2} r={30} fill="#111" /><circle cx={130} cy={2} r={30} fill="#111" /><circle cx={-130} cy={2} r={12} fill="#888" /><circle cx={130} cy={2} r={12} fill="#888" />
          <text x={0} y={-20} fontFamily="Lilita One" fontSize={22} fill="#fff" textAnchor="middle">警視庁</text>
          <circle cx={red ? -16 : 44} cy={-100} r={120} fill={red ? "#ff2a2a" : "#2a5aff"} opacity={0.18} style={{ filter: "blur(20px)" }} />
        </g>
        <defs><clipPath id="tapeC"><rect x={-60} y={-20} width={interpolate(f, [6, 34], [0, 1400], { ...clamp, easing: ez })} height={80} /></clipPath></defs>
        <g transform="translate(0,1000) rotate(-1.5)" clipPath="url(#tapeC)"><rect x={-50} y={0} width={1300} height={34} fill="#f2c94c" />{Array.from({ length: 10 }).map((_, i) => <text key={i} x={i * 130} y={25} fontFamily="Lilita One" fontSize={22} fill={INK}>POLICE LINE</text>)}</g>
        {[[300, 1080, "1"], [720, 1090, "2"]].map(([x, y, n]) => <g key={n as string} transform={`translate(${x},${y})`}><path d="M-16,0 L-8,-28 L8,-28 L16,0 Z" fill="#f2c94c" stroke={INK} strokeWidth={2} /><text y={-8} fontFamily="Lilita One" fontSize={18} fill={INK} textAnchor="middle">{n}</text></g>)}
      </World>
      <Snow f={f} n={50} o={0.6} />
      <Vig o={0.6} />
      <div style={{ position: "absolute", top: 260, width: "100%", textAlign: "center", transform: `scale(${pop(f, 4, 12)})` }}>
        <div style={{ fontFamily: "Lilita One", fontSize: 104, lineHeight: 1.05, color: "#fff", WebkitTextStroke: `6px ${INK}`, textShadow: "0 10px 0 #000" }}>DID YOU KNOW<br />THIS CASE?</div>
        <div style={{ display: "inline-block", marginTop: 24, background: "#e3262b", color: "#fff", fontFamily: "Lilita One", fontSize: 50, padding: "10px 34px", borderRadius: 16, border: `5px solid ${INK}`, transform: `scale(${pop(f, 40, 10)})` }}>COMMENT BELOW ↓</div>
      </div>
      <AbsoluteFill style={{ background: "#000", opacity: interpolate(f, [113, 122], [0, 1], clamp) }} />
      {f > 113 && <div style={{ position: "absolute", left: 50, top: 150, fontFamily: "monospace", fontWeight: 700, fontSize: 40, color: "#f2f2f2" }}>● REC</div>}
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
            <React.Fragment key={j}>{j > 0 ? " " : ""}<span style={{ display: "inline-block", fontFamily: "Fredoka", fontWeight: 700, fontSize: x.k ? 78 : 68, color: x.k ? "#ff4848" : cur ? "#ffe066" : "#fff", opacity: on ? 1 : 0.35, textShadow: x.k ? "0 0 18px rgba(0,0,0,0.95), 0 4px 0 #000" : "0 4px 0 #000", transform: `scale(${cur ? 0.9 + 0.18 * p : 1})`, WebkitTextStroke: `10px ${INK}`, paintOrder: "stroke fill", textTransform: "uppercase", lineHeight: 1.25, marginRight: j < grp.length - 1 ? 22 : 0 }}>{x.w}</span></React.Fragment>
          );
        })}
      </span>
    </div>
  );
};
const Grade: React.FC = () => {
  const f = useCurrentFrame();
  const night = interpolate(f, [T7.entry, T7.un], [0, 0.22], clamp);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={W} height={H} style={{ position: "absolute", opacity: f < T7.front ? 0.2 : 0.08, mixBlendMode: "overlay" }}><filter id="gn7"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 11} /></filter><rect width={W} height={H} filter="url(#gn7)" /></svg>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,20,40,0.12), rgba(40,20,10,0.08))", mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(0,0,0,${night}) 100%)` }} />
    </AbsoluteFill>
  );
};
/** dark smoke wipe used between the rooms (the killer's aura moving through the house) */
const SmokeWipe: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame(), k = (f - at + 9) / 18;
  if (k <= 0 || k >= 1) return null;
  return (
    <svg width={W} height={H} style={{ position: "absolute", pointerEvents: "none" }}>
      {Array.from({ length: 26 }).map((_, i) => { const x = -300 + k * 1700 - random("sw" + i) * 500, y = random("sy" + i) * H, r = 180 + random("sr" + i) * 220; return <circle key={i} cx={x} cy={y} r={r} fill={i % 5 ? "#060507" : "#2a060c"} opacity={Math.sin(Math.PI * k) * 0.9} style={{ filter: "blur(30px)" }} />; })}
    </svg>
  );
};
/** door-frame wipe: two dark jambs close and reopen across the cut */
const DoorWipe: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame(), k = interpolate(f, [at - 7, at, at + 7], [0, 1, 0], { ...clamp, easing: ez });
  if (k <= 0) return null;
  return <><div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${50 * k}%`, background: "linear-gradient(90deg,#0a0806,#2a1d12)" }} /><div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${50 * k}%`, background: "linear-gradient(270deg,#0a0806,#2a1d12)" }} /></>;
};
const LIST: [number, number, React.FC<{ f: number }>][] = [
  [T7.hook, T7.photo, ColdOpen], [T7.photo, T7.front, PhotoFlash], [T7.front, T7.entry, Front], [T7.entry, T7.dead, Entry], [T7.dead, T7.rei, Dead], [T7.rei, T7.stairs, Rei], [T7.stairs, T7.kitchen, Stairs],
  [T7.kitchen, T7.stay, Kitchen], [T7.stay, T7.fridge, Stay], [T7.fridge, T7.bath, Fridge], [T7.bath, T7.office, Bath], [T7.office, T7.un, Office], [T7.un, T7.end, Unknown], [T7.end, T7.fin, End],
];
// cut style per scene index: whip in, vertical whip (floor change), or plain crossfade
const CUT: Record<number, "whip" | "up" | "down" | "fade"> = { 1: "fade", 2: "whip", 3: "whip", 4: "fade", 5: "up", 6: "down", 7: "fade", 8: "fade", 9: "fade", 10: "up", 11: "fade", 12: "whip", 13: "whip" };
const XF = 4;
const Scene: React.FC<{ C: React.FC<{ f: number }>; i: number }> = ({ C, i }) => {
  const g = useCurrentFrame(), f = g - (i > 0 ? XF : 0);
  const kind = CUT[i] ?? "fade";
  const w = i > 0 ? interpolate(f, [0, 6], [1, 0], clamp) : 0;
  const op = i > 0 ? interpolate(g, [0, XF], [0, 1], clamp) : 1;
  let tr = "", fl: string | undefined;
  if (w > 0.01 && kind === "whip") { tr = `scale(${1 + w * 0.12})`; fl = `blur(${w * 12}px)`; }
  if (w > 0.01 && (kind === "up" || kind === "down")) { tr = `translateY(${(kind === "up" ? 1 : -1) * w * 160}px)`; fl = `blur(${w * 10}px)`; }
  return <AbsoluteFill style={{ opacity: op, transform: tr || undefined, filter: fl }}><C f={f} /></AbsoluteFill>;
};
/** small punch-in whenever a red key word is spoken */
const Punch: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const words = WORDS as { a: number; k: boolean }[];
  let amt = 0;
  for (const x of words) if (x.k && f >= x.a && f < x.a + 8 && f < T7.end) amt = Math.max(amt, Math.sin(Math.PI * (f - x.a) / 8));
  return <AbsoluteFill style={{ transform: `scale(${1 + amt * 0.025})` }}>{children}</AbsoluteFill>;
};
export const Miya10: React.FC<{ audio?: boolean }> = ({ audio = false }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Punch>{LIST.map(([a, b, C], i) => <Sequence key={i} from={i > 0 ? a - XF : a} durationInFrames={b - a + (i > 0 ? XF : 0)}><Scene C={C} i={i} /></Sequence>)}</Punch>
    <SmokeWipe at={T7.stairs} /><SmokeWipe at={T7.kitchen} /><SmokeWipe at={T7.bath} />
    <DoorWipe at={T7.stay} /><DoorWipe at={T7.fridge} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 70%, rgba(0,0,0,0.38) 78%, rgba(0,0,0,0.38) 88%, transparent 96%)", pointerEvents: "none" }} />
    <Subs />
    <Grade />
    {audio && <Audio src={staticFile("miya10/mix.wav")} />}
  </AbsoluteFill>
);
