import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, random, spring, staticFile, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import "@fontsource/fredoka/600.css";
import "@fontsource/fredoka/700.css";
import "@fontsource/lilita-one/400.css";
import { Stick, walkSP, idleSP, sitSP, track, trackXY, mixSP, REST, SP, STRIDE_PER_RAD, StickIK } from "../Miya7/Stick";
import { ReiScene3, StairsScene3, LivingScene3, BathScene3, OfficeScene3, BotLayer, DownScene3 } from "./Scenes11";
import "@fontsource/oswald/600.css";
import "@fontsource/oswald/700.css";
import { STAND, idleBP, BP } from "./Bot3";
import WORDS from "./words12.json";

const W = 1080, H = 1920, INK = "#151517";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T7 = { hook: 0, photo: 28, fridge0: 62, front: 136, entry: 185, dead: 308, rei: 407, stairs: 492, kitchen: 614, stay: 758, fridge: 802, bath: 842, office: 877, down: 1005, fin: 1082, end: 1082 };
export const V12_FRAMES = T7.fin;
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
const World: React.FC<{ f: number; keys: CK[]; src: string; iw: number; ih: number; children?: React.ReactNode; fg?: { y: number; k: number }; shake?: number; grade?: string; under?: React.ReactNode; over?: React.ReactNode; post?: React.ReactNode }> = ({ f, keys, src, iw, ih, children, fg, shake = 1, grade, under, over, post }) => {
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
        {over}
        {post && <svg width={iw} height={ih} viewBox={`0 0 ${iw} ${ih}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>{post}</svg>}
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
  const p = interpolate(f, [0, 6], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 50, top: 150, opacity: p }}>
      <div style={{ background: "rgba(8,8,10,0.85)", borderRadius: 14, padding: "8px 22px", fontFamily: "monospace", fontWeight: 700, fontSize: 54, color: "#ff3b30", border: "3px solid #2c2c30", textShadow: "0 0 10px rgba(255,59,48,0.6)", display: "inline-block" }}>{t}</div>
      {inside && <div style={{ marginTop: 8, background: "rgba(8,8,10,0.8)", borderRadius: 10, padding: "4px 14px", fontFamily: "Fredoka", fontWeight: 700, fontSize: 34, color: "#e9e4d8", letterSpacing: 2, display: "inline-block" }}>INSIDE THE HOUSE · <span style={{ color: "#ff8a6a" }}>{inside}</span></div>}
    </div>
  );
};
const Stamp: React.FC<{ f: number; s: number; text: string; top: number; color?: string; rot?: number; size?: number }> = ({ f, s, text, top, color = "#e3262b", rot = -8, size = 110 }) => {
  if (f < s) return null;
  const p = interpolate(f, [s, s + 7], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  return <div style={{ position: "absolute", top, width: "100%", display: "flex", justifyContent: "center" }}><div style={{ transform: `rotate(${rot}deg) scale(${1.15 - 0.15 * p})`, opacity: p, border: `12px solid ${color}`, color, fontFamily: "Fredoka", fontWeight: 700, fontSize: size, padding: "4px 34px", borderRadius: 16, background: "rgba(10,10,14,0.3)", letterSpacing: 4 }}>{text}</div></div>;
};

/** polaroid post-it with the real photo; drops in, then turns grey */
const PostIt: React.FC<{ f: number; s: number; img: string; name: string; age: string; x: number; y: number; rot: number; gone?: number; w?: number; strike?: number }> = ({ f, s, img, name, age, x, y, rot: rot0, gone = 1e9, w = 230, strike = 1e9 }) => {
  if (f < s) return null;
  const rot = rot0 + Math.sin(f / 19 + x) * 1.2;
  const st = interpolate(f, [strike, strike + 8], [0, 1], clamp);
  const p = interpolate(f, [s, s + 8], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const g = interpolate(f, [gone, gone + 12], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, transform: `translate(-50%,0) translateY(${(1 - p) * -40}px) rotate(${rot}deg)`, opacity: p, background: "#f5f1e6", padding: "12px 12px 10px", boxShadow: "0 14px 28px rgba(0,0,0,0.6)" }}>
      <div style={{ position: "absolute", left: "50%", top: -14, width: 26, height: 26, borderRadius: 13, background: "radial-gradient(circle at 35% 35%, #ff8a8a, #b5121b 60%)", transform: "translateX(-50%)", boxShadow: "0 3px 4px rgba(0,0,0,0.5)" }} />
      <div style={{ width: "100%", height: w * 1.05, overflow: "hidden", background: "#222" }}>
        <Img src={S7(img)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: `grayscale(${g}) brightness(${1 - g * 0.25}) sepia(${0.15 * (1 - g)})` }} />
      </div>
      <div style={{ fontFamily: "Fredoka", fontWeight: 700, fontSize: w * 0.17, color: INK, textAlign: "center", marginTop: 6 }}>{name} <span style={{ color: "#b5121b" }}>{age}</span></div>
      {g > 0 && <div style={{ position: "absolute", inset: 0, background: `rgba(30,0,0,${0.15 * g})` }} />}
      {st > 0 && <svg width={w + 24} height={w * 1.05 + 70} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}><path d={`M14,${w * 0.1} L${14 + (w - 4) * st},${w * 0.1 + w * 0.85 * st}`} stroke="#d4141c" strokeWidth={12} strokeLinecap="round" opacity={0.9} />{st > 0.5 && <path d={`M${w + 10},${w * 0.1} L${w + 10 - (w - 4) * (st - 0.5) * 2},${w * 0.1 + w * 0.85 * (st - 0.5) * 2}`} stroke="#d4141c" strokeWidth={12} strokeLinecap="round" opacity={0.9} />}</svg>}
    </div>
  );
};

// ---------------- scenes ----------------
const Typed: React.FC<{ f: number; text: string; s?: number; top?: number }> = ({ f, text, s = 6, top = 300 }) => {
  const n = Math.max(0, Math.min(text.length, Math.floor((f - s) / 0.5)));
  if (f < s) return null;
  return <div style={{ position: "absolute", top, left: 56, fontFamily: "monospace", fontWeight: 700, fontSize: 44, color: "#efe7d6", letterSpacing: 4, textShadow: "0 3px 10px #000, 0 0 2px #000" }}><span style={{ color: "#ff3b30" }}>▸ </span>{text.slice(0, n)}<span style={{ opacity: Math.floor(f / 8) % 2 ? 1 : 0 }}>_</span></div>;
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
      <div style={{ position: "absolute", top: 330, width: "100%", textAlign: "center", fontFamily: "Fredoka", fontWeight: 700, fontSize: 76, color: "#fff", letterSpacing: 4, textShadow: "0 6px 0 #000" }}>SETAGAYA, TOKYO</div>
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
    <World f={f} keys={[[0, 630, 720, 1.66], [49, 590, 730, 1.7]]} {...FRONT} fg={{ y: 820, k: -0.25 }}>
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
    <Stamp f={f} s={6} text="NEVER CAUGHT" top={980} size={104} rot={-8} />
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
    actor = <StickIK hx={hx} hy={hy} s={sc} lh={LHf} rh={RHf} lf={[lf[0], lf[1] - enter * 150]} rf={[rf[0], rf[1] - enter * 150]} headTilt={Math.sin(f / 13) * 0.4} opacity={1 - Math.max(0, enter - 0.4) * 2.2} />;
    head = [hx, hy - 185 * sc - 100 * sc];
    for (let k = 0; k < 8; k++) prints.push(<ellipse key={k} cx={x0 + 20 - k * 40} cy={1108 + (k % 2) * 6} rx={9} ry={4} fill="#2b1d12" opacity={0.55} />);
  }
  const puffs = [0, 1, 2].map((i) => { const q = ((f + i * 14) % 42) / 42; return <circle key={i} cx={head[0] - 20 - q * 30} cy={head[1] - q * 26} r={6 + q * 14} fill="#dfe6f2" opacity={(1 - q) * 0.22} style={{ filter: "blur(3px)" }} />; });
  // camera follows him up and finally pushes into the dark open window (transition into the house)
  const keys: CK[] = [[0, 740, 860, 1.75], [26, 690, 840, 1.75], [60, 662, 700, 1.8], [92, 652, 580, 1.85], [123, 640, 480, 2.1]];
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
      <AbsoluteFill style={{ background: "#020306", opacity: interpolate(f, [110, 123], [0, 0.45], clamp) }} />
      <Chip t="11:58 PM" f={f} />
    </>
  );
};

const Dead: React.FC<{ f: number }> = ({ f }) => {
  const off = [0, 1, 2, 3].map((i) => { const t0 = 16 + i * 10; const k = interpolate(f, [t0, t0 + 6], [0, 1], clamp); return k > 0 && k < 1 ? (Math.floor(f) % 2 ? 1 : 0.2) : k; });
  const tear = interpolate(f, [70, 78], [0, 1], { ...clamp, easing: ez });
  return (
    <>
      <World f={f} keys={[[0, 600, 860, 1.72], [99, 575, 580, 1.8]]} {...FRONT} grade="saturate(0.7) brightness(0.98) contrast(1.05)">
        <FrontWindows f={f} off={off} />
        <FrontExtras f={f} lightsOff={10} neighOff={interpolate(f, [10, 80], [0, 1], clamp)} sweep={50} />
        {/* front door left ajar */}
        <path d="M606,772 L621,778 L621,984 L606,990 Z" fill="#050407" opacity={0.85} />
        <rect x={-200} y={-200} width={1600} height={1800} fill="#050814" opacity={0.12} />
      </World>
      <Snow f={f} />
      <Vig o={0.8} />
      <AbsoluteFill style={{ background: "#020306", opacity: interpolate(f, [0, 8], [0.6, 0], clamp) }} />
      <PostIt f={f} s={20} img="v_rei.jpg" name="REI" age="6" x={175} y={260} rot={-5} gone={60} w={190} />
      <PostIt f={f} s={26} img="v_mikio.jpg" name="MIKIO" age="44" x={420} y={245} rot={3} gone={64} w={190} />
      <PostIt f={f} s={32} img="v_yasuko.jpg" name="YASUKO" age="41" x={665} y={260} rot={-3} gone={68} w={190} />
      <PostIt f={f} s={38} img="v_niina.jpg" name="NIINA" age="8" x={905} y={250} rot={5} gone={72} w={190} />
      <div style={{ position: "absolute", left: 60, top: 1080, width: 170, height: 200 }}>
        <div style={{ position: "absolute", inset: 0, background: "#f4f0e6", borderRadius: 8, boxShadow: "0 10px 20px rgba(0,0,0,0.5)", textAlign: "center", overflow: "hidden" }}><div style={{ background: "#c8102e", color: "#fff", fontFamily: "Fredoka", fontWeight: 700, fontSize: 30, padding: 6 }}>DEC</div><div style={{ fontFamily: "Fredoka", fontWeight: 700, fontSize: 96, color: "#1a1a1a" }}>31</div></div>
        {tear < 1 && <div style={{ position: "absolute", inset: 0, background: "#f4f0e6", borderRadius: 8, textAlign: "center", overflow: "hidden", transformOrigin: "100% 0%", transform: `rotate(${-tear * 35}deg) translate(${-tear * 60}px,${tear * 300}px)`, opacity: 1 - tear }}><div style={{ background: "#c8102e", color: "#fff", fontFamily: "Fredoka", fontWeight: 700, fontSize: 30, padding: 6 }}>DEC</div><div style={{ fontFamily: "Fredoka", fontWeight: 700, fontSize: 96, color: "#1a1a1a" }}>30</div></div>}
      </div>
      <Chip t={f < 74 ? "12:00 AM" : "12:05 AM"} f={f} />
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
    {label && <Typed f={f} text={label} s={0} />}
    {over}
    {chip && <Chip t={chip[0]} f={f} inside={inside(chip[1])} />}
    {alive}
  </AbsoluteFill>
);
const UP = "saturate(0.78) hue-rotate(-10deg) contrast(1.08) brightness(0.97)", DOWN = "sepia(0.18) saturate(0.95) contrast(1.08)";
const Rei: React.FC<{ f: number }> = ({ f }) => <Room3D f={f} C={ReiScene3} len={85} label="REI'S ROOM · 2F" chip={["12:05 AM", 5]} grade={UP} fg="r"
  over={<PostIt f={f} s={4} img="v_rei.jpg" name="REI" age="6" x={850} y={330} rot={4} gone={36} strike={36} w={200} />} />;
/** the snapping blade: a kitchen knife breaks in two with sparks */
const Snap: React.FC<{ f: number; s: number }> = ({ f, s }) => {
  if (f < s) return null;
  const k = interpolate(f, [s, s + 6], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) }), o = interpolate(f, [s, s + 3], [0, 1], clamp);
  return (
    <svg width={W} height={H} style={{ position: "absolute", pointerEvents: "none" }} opacity={o}>
      <g transform="translate(540,640)">
        <g transform={`translate(${-20 - 60 * k},${-10 * k}) rotate(${-14 * k})`}><rect x={-230} y={-22} width={110} height={44} rx={10} fill="#3a2618" stroke="#111" strokeWidth={4} /><circle cx={-200} cy={0} r={5} fill="#c9c9c9" /><circle cx={-160} cy={0} r={5} fill="#c9c9c9" /><path d="M-120,-18 L-10,-18 L4,4 L-20,22 L-120,22 Z" fill="#dfe3e8" stroke="#111" strokeWidth={4} /></g>
        <g transform={`translate(${20 + 90 * k},${30 * k}) rotate(${24 * k})`}><path d="M10,-18 L-4,4 L18,22 L190,10 L230,-6 Z" fill="#dfe3e8" stroke="#111" strokeWidth={4} /><path d="M40,-8 L200,-4" stroke="#fff" strokeWidth={3} opacity={0.6} /></g>
        {Array.from({ length: 12 }).map((_, i) => { const a = random("sp" + i) * Math.PI * 2, d = 40 + 140 * k * (0.5 + random("sd" + i)); return <line key={i} x1={Math.cos(a) * d * 0.6} y1={Math.sin(a) * d * 0.6} x2={Math.cos(a) * d} y2={Math.sin(a) * d} stroke="#ffd56a" strokeWidth={4} strokeLinecap="round" opacity={1 - k * 0.8} />; })}
        <circle r={60 * (1 - k) + 10} fill="#fff6c8" opacity={0.7 * (1 - k)} />
      </g>
    </svg>
  );
};
const Stairs: React.FC<{ f: number }> = ({ f }) => <Room3D f={f} C={StairsScene3} len={122} label="THE STAIRS" chip={["12:10 AM", 10]} grade={DOWN} dutch={-3} fg="l"
  over={<><PostIt f={f} s={4} img="v_mikio.jpg" name="MIKIO" age="44" x={850} y={330} rot={3} gone={69} strike={69} w={200} />
    {f < 34 && <svg width={W} height={H} style={{ position: "absolute" }}>{[0, 1, 2, 3, 4, 5].map((i) => { const q = interpolate(f, [4, 30], [0, 1], clamp); return <circle key={i} cx={430 + i * 40 + q * (i - 2.5) * 30} cy={1330 - q * 50 - (i % 2) * 10} r={10 + q * 34} fill="#c9b79a" opacity={(1 - q) * 0.22} style={{ filter: "blur(6px)" }} />; })}</svg>}
    {f < 20 && <div style={{ position: "absolute", left: interpolate(f, [0, 20], [-200, 420]), top: 560, width: 260, height: 760, borderRadius: "45% 45% 30% 30%", background: "#050405", opacity: interpolate(f, [0, 6, 14, 20], [0, 0.55, 0.55, 0]), filter: "blur(28px)" }} />}
    <Snap f={f} s={97} /></>} />;

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
const KIT = { src: S7("kitchen_ext.png"), iw: 967, ih: 2227 };
/** places the 3D killer layer in image pixels: feet at (fx,fy), height hpx */
const BotIn: React.FC<{ fx: number; fy: number; hpx: number; children: React.ReactNode }> = ({ fx, fy, hpx, children }) => {
  const k = hpx / 792;
  return <div style={{ position: "absolute", left: fx - 300 * k, top: fy - 850 * k, width: 600 * k, height: 900 * k }}>{children}</div>;
};
const KitchenWorld: React.FC<{ f: number; keys: CK[]; cold?: boolean; knifeAt: number }> = ({ f, keys, cold, knifeAt }) => {
  const steps = [[880, 1790], [820, 1770], [760, 1800], [700, 1775]];
  return (
    <World f={f} keys={keys} {...KIT}
      over={<BotIn fx={610} fy={1710} hpx={640}><BotLayer f={f} p={idleBP(f, { ...STAND, headX: 8 + Math.sin(f / 40) * 3, headY: Math.sin(f / 33) * 10 })} rim="#ffd9a0" key2="#ffe7c0" /></BotIn>}
      post={<>{[0, 1].map((i) => { const q = ((f + i * 22) % 44) / 44; return <ellipse key={"br" + i} cx={640 + q * 40} cy={1110 - q * 50} rx={14 + q * 26} ry={10 + q * 16} fill="#e6ecf4" opacity={Math.sin(Math.PI * q) * 0.14} style={{ filter: "blur(5px)" }} />; })}</>}>
      <circle cx={452} cy={352} r={300 + Math.sin(f / 7) * 12} fill="#ffd9a0" opacity={0.06} />
      <g transform="translate(160,470) rotate(-4)"><rect width={90} height={70} fill="#fbf8ee" /><circle cx={70} cy={16} r={8} fill="#f2c94c" /><path d="M14,58 L14,30 L30,30 M40,58 L40,26 M60,58 L60,34" stroke="#d8352a" strokeWidth={3} /><rect x={36} y={-6} width={22} height={10} fill="#e9e0b8" opacity={0.8} /></g>
      <g transform="translate(400,500) rotate(5)"><rect width={80} height={62} fill="#fbf8ee" /><path d="M10,50 Q40,10 70,50" stroke="#2f7ad6" strokeWidth={3} fill="none" /><rect x={30} y={-6} width={22} height={10} fill="#e9e0b8" opacity={0.8} /></g>
      <KnifeDust f={f} s={knifeAt} />
      {!cold && f > knifeAt + 24 && <circle cx={386} cy={815} r={70 + Math.sin(f / 4) * 4} fill="none" stroke="#ff2a2a" strokeWidth={5} opacity={interpolate(f, [knifeAt + 24, knifeAt + 32], [0, 1], clamp)} strokeDasharray="20 9" />}
      <Dust f={f} box={[250, 380, 450, 550]} o={0.5} />
      <circle cx={620} cy={1300} r={300} fill="#3a0a14" opacity={0.1} style={{ filter: "blur(60px)" }} />
      {/* blood dripping off the counter edge onto the floor */}
      <path d="M455,955 q8,10 0,22 q-8,-12 0,-22 Z M500,958 q6,8 0,16 q-6,-8 0,-16 Z" fill="#5a080d" />
      {[0, 1].map((i) => { const q = ((f + i * 17) % 34) / 34; return <ellipse key={"dp" + i} cx={455 + i * 45} cy={980 + q * q * 480} rx={4} ry={7} fill="#6a0a10" opacity={q < 0.95 ? 0.9 : 0} />; })}
      <ellipse cx={478} cy={1468} rx={46} ry={11} fill="#4a070b" opacity={0.85} />
      {steps.map(([x, y], i) => <ellipse key={"fp" + i} cx={x} cy={y} rx={16} ry={7} fill="#2b1d12" opacity={cold ? 0.6 : interpolate(f, [6 + i * 6, 10 + i * 6], [0, 0.6], clamp)} />)}
      {[[520, 1640, 7], [405, 1660, 8], [350, 1700, 5], [280, 1690, 6], [210, 1720, 4]].map(([x, y, r], i) => <ellipse key={"bd" + i} cx={x} cy={y} rx={r * 1.6} ry={r * 0.7} fill="#4a070b" opacity={0.85} />)}
      <ellipse cx={610} cy={1712} rx={120} ry={20} fill="#000" opacity={0.55} style={{ filter: "blur(6px)" }} />
      <Smoke2D f={f} x={610} y={1710} h={640} n={40} />
    </World>
  );
};
const Kitchen: React.FC<{ f: number }> = ({ f }) => {
  // two framings with a hard cut (wide, then closer over his shoulder toward the knife block)
  const keys: CK[] = f < 70 ? [[0, 483, 1180, 1.22], [70, 478, 1170, 1.25]] : [[70, 520, 1250, 1.45], [150, 515, 1240, 1.48]];
  return (
    <AbsoluteFill>
      <KitchenWorld f={f} keys={keys} knifeAt={78} />
      <Flicker f={f} seed="kit" o={0.3} />
      <Vig o={0.6} />
      <Typed f={f} text="THE KITCHEN" s={0} />
      <PostIt f={f} s={4} img="v_yasuko.jpg" name="YASUKO" age="41" x={820} y={330} rot={-4} gone={61} strike={61} w={190} />
      <PostIt f={f} s={14} img="v_niina.jpg" name="NIINA" age="8" x={820} y={640} rot={4} gone={67} strike={67} w={190} />
      {f > 108 && <Stamp f={f} s={108} text="1 KNIFE MISSING" top={760} size={62} color="#fff" rot={-3} />}
      <Chip t="12:15 AM" f={f} inside={inside(15)} />
    </AbsoluteFill>
  );
};
/** cold open, part 1: the kitchen right after the murders */
const ColdKitchen: React.FC<{ f: number }> = ({ f }) => {
  const keys: CK[] = [[0, 520, 1250, 1.42], [28, 512, 1240, 1.46]];
  return (
    <AbsoluteFill>
      <KitchenWorld f={f} keys={keys} cold knifeAt={-200} />
      <Vig o={0.65} />
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0 2px, transparent 2px 5px)" }} />
      <div style={{ position: "absolute", left: 50, top: 150, fontFamily: "monospace", fontWeight: 700, fontSize: 44, color: "#f2f2f2", textShadow: "2px 0 #ff2a6a, -2px 0 #2affff" }}><div>{Math.floor(f / 15) % 2 ? "●" : "○"} REC</div><div>DEC.31.2000 · 12:15 AM</div></div>
    </AbsoluteFill>
  );
};
const Stay: React.FC<{ f: number }> = ({ f }) => <Room3D f={f} C={LivingScene3} len={44} label="LIVING ROOM" chip={["12:30 AM", 30]} grade={DOWN} fg="l" />;
const FRIDGE = { src: S7("fridge_nok.png"), iw: 1065, ih: 1477 };
/** fridge scene with the 3D killer. "cold": eating one bar, reaches for a second. "mid": drinks their barley tea, wrappers on the floor */
const FridgeS: React.FC<{ f: number; mode: "cold" | "mid" }> = ({ f, mode }) => {
  const kk = (a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: ez });
  // seen from behind, the bot's right arm is on screen-left (shelves) and its left arm on screen-right (door)
  const EAT: BP = { ...STAND, rArmX: -100, rArmZ: -22, rElbow: -128, lArmX: -62, lArmZ: -38, lElbow: -28, headX: 6 };
  const REACH: BP = { ...STAND, rArmX: -150, rArmZ: 24, rElbow: -12, lArmX: -62, lArmZ: -38, lElbow: -28, headX: -14, headY: -12, lean: -2 };
  const DRINK: BP = { ...STAND, lArmX: -112, lArmZ: 6, lElbow: -132, rArmX: 4, rArmZ: 9, rElbow: -12, headX: -20 };
  const DOOR: BP = { ...STAND, lArmX: -62, lArmZ: -38, lElbow: -28 };
  const mixP = (a: BP, b: BP, k: number): BP => { const o: any = {}; for (const key of Object.keys(a)) o[key] = (a as any)[key] + ((b as any)[key] - (a as any)[key]) * k; return o; };
  let pose: BP, lItem: React.ReactNode = null, rItem: React.ReactNode = null, gone2 = mode === "mid";
  const bar = (c: string) => <group position={[0, -0.06, 0.02]}><mesh><boxGeometry args={[0.05, 0.11, 0.024]} /><meshStandardMaterial color={c} roughness={0.5} /></mesh><mesh position={[0, -0.08, 0]}><boxGeometry args={[0.012, 0.06, 0.006]} /><meshStandardMaterial color="#d9b27a" /></mesh></group>;
  if (mode === "cold") {
    const out = kk(30, 44), back = kk(48, 62);
    const bite = Math.max(0, Math.sin(f / 2.6)) * 8 * (f < 28 || f > 62 ? 1 : 0);
    pose = out < 1 ? mixP(EAT, REACH, out) : mixP(REACH, EAT, back);
    pose = { ...idleBP(f, pose), rElbow: pose.rElbow + bite };
    gone2 = f >= 44;
    lItem = f < 34 ? bar("#c8473f") : f >= 44 ? bar("#e8c23a") : null;
  } else {
    pose = idleBP(f, mixP(DOOR, DRINK, kk(4, 20)));
    rItem = f >= 9 ? <group position={[0, -0.05, 0.03]}><mesh><cylinderGeometry args={[0.03, 0.03, 0.16, 12]} /><meshStandardMaterial color="#6b4a1e" transparent opacity={0.9} roughness={0.15} /></mesh><mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.014, 0.014, 0.04, 8]} /><meshStandardMaterial color="#f2f2ee" /></mesh></group> : null;
  }
  const melt = mode === "cold" && f > 46 ? [0, 1].map((i) => { const q = ((f + i * 9) % 18) / 18; return <ellipse key={"ml" + i} cx={612} cy={720 + q * 520} rx={3.5} ry={6} fill="#f0d070" opacity={q < 0.92 ? 0.85 : 0} />; }) : null;
  const sway = mode === "mid" ? Math.sin(f / 4) * 0.025 * Math.max(0, 1 - Math.max(0, f - 22) / 18) * (f > 22 ? 1 : 0) : 0;
  const keys: CK[] = mode === "cold" ? [[0, 600, 760, 1.55], [74, 590, 780, 1.62]] : [[0, 505, 820, 1.42], [41, 515, 800, 1.48]];
  return (
    <AbsoluteFill>
      <World f={f} keys={keys} {...FRIDGE}
        under={sway ? <div style={{ position: "absolute", left: 745, top: 400, width: 160, height: 740, overflow: "hidden", transformOrigin: "0% 50%", transform: `scaleX(${1 + sway * 6})` }}><Img src={S7("fridge_nok.png")} style={{ position: "absolute", left: -745, top: -400, width: 1065, height: 1477 }} /></div> : undefined}
        over={<BotIn fx={690} fy={1330} hpx={790}><BotLayer f={f} p={pose} rim="#fff4d6" key2="#ffe9c8" lHandItem={rItem} rHandItem={lItem} light={1.1} /></BotIn>}
        post={<>{melt}{mode === "mid" && <><Print x={846} y={742} o={interpolate(f, [8, 14], [0, 0.85], clamp)} rot={20} /><Print x={862} y={790} o={interpolate(f, [10, 16], [0, 0.7], clamp)} rot={-10} s={0.8} /></>}</>}>
        <rect x={830} y={0} width={300} height={1477} fill="url(#rdark)" />
        <g transform="translate(790,470) rotate(3)"><rect width={70} height={56} fill="#fbf8ee" /><path d="M10,46 L22,20 L34,46 M46,46 L46,24" stroke="#d8352a" strokeWidth={3} fill="none" /></g>
        {[[800, 620, "#d8352a"], [850, 640, "#2f7ad6"], [820, 680, "#f2c94c"]].map(([x, y, c], i) => <circle key={i} cx={x as number} cy={y as number} r={9} fill={c as string} stroke="#222" strokeWidth={1.5} />)}
        <defs><linearGradient id="icg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgb(222,208,192)" /><stop offset="1" stopColor="rgb(196,179,159)" /></linearGradient>
          <linearGradient id="rdark" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#000" stopOpacity="0" /><stop offset="0.35" stopColor="#000" stopOpacity="0.75" /><stop offset="1" stopColor="#000" stopOpacity="0.9" /></linearGradient>
          <radialGradient id="fglow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fff4d6" stopOpacity="0.5" /><stop offset="1" stopColor="#fff4d6" stopOpacity="0" /></radialGradient></defs>
        <rect x={542} y={507} width={29} height={79} fill="url(#icg)" />
        {gone2 && <rect x={574} y={507} width={36} height={79} fill="url(#icg)" />}
        <ellipse cx={620} cy={780} rx={330} ry={420} fill="url(#fglow)" opacity={0.55 + 0.05 * Math.sin(f / 3)} />
        {Array.from({ length: 9 }).map((_, i) => { const q = ((f + i * 7) % 50) / 50; return <ellipse key={"v" + i} cx={520 + i * 30 + q * 40} cy={1060 + q * 160} rx={50 + q * 60} ry={18 + q * 14} fill="#e8f0ff" opacity={Math.sin(Math.PI * q) * 0.13} style={{ filter: "blur(10px)" }} />; })}
        {mode === "mid" && <g>
          <path d="M470,1268 l38,-8 l6,16 l-40,10 z" fill="#c8473f" opacity={0.9} /><path d="M560,1300 l30,6 l-4,14 l-32,-6 z" fill="#e8c23a" opacity={0.9} />
          <rect x={520} y={1288} width={30} height={6} rx={3} fill="#d9b27a" transform="rotate(25,535,1291)" /><rect x={600} y={1262} width={30} height={6} rx={3} fill="#d9b27a" transform="rotate(-12,615,1265)" /></g>}
        {[0, 1, 2].map((i) => <ellipse key={i} cx={960 - i * 26} cy={1290 + i * 18} rx={6} ry={3} fill="#5a0a0e" opacity={0.8} />)}
      </World>
      <Vig o={0.55} />
      {mode === "cold" ? <>
        <div style={{ position: "absolute", left: 50, top: 150, fontFamily: "monospace", fontWeight: 700, fontSize: 44, color: "#f2f2f2", textShadow: "2px 0 #ff2a6a, -2px 0 #2affff" }}><div>{Math.floor(f / 15) % 2 ? "●" : "○"} REC</div><div>DEC.31.2000 · 12:41 AM</div></div>
        <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0 2px, transparent 2px 5px)" }} />
      </> : <Chip t="12:41 AM" f={f} inside={inside(41)} />}
      {mode === "mid" && <AbsoluteFill style={{ background: "#000", opacity: interpolate(f, [32, 41], [0, 0.4], clamp) }} />}
    </AbsoluteFill>
  );
};
const ColdOpen: React.FC<{ f: number }> = ({ f }) => <FridgeS f={f} mode="cold" />;
const Fridge: React.FC<{ f: number }> = ({ f }) => <FridgeS f={f} mode="mid" />;
/** the family photo, held longer: slow push, turns grey, the killer's ghost appears behind them */
const Photo: React.FC<{ f: number }> = ({ f }) => {
  const gray = interpolate(f, [8, 22], [0, 1], clamp), ghost = interpolate(f, [12, 30], [0, 0.6], clamp);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Img src={staticFile("miya2/steps.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", filter: "blur(30px) brightness(0.3)", transform: "scale(1.3)" }} />
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 1920 * 1.333, height: 1920, transform: `translate(-50%,-50%) scale(${1.12 + f * 0.0012})` }}>
        <Img src={staticFile("miya2/steps.jpg")} style={{ width: "100%", height: "100%", filter: `grayscale(${gray}) contrast(1.1) brightness(${1 - gray * 0.2}) sepia(${0.2 * (1 - gray)})` }} />
        <Img src={S7("k_front.png")} style={{ position: "absolute", left: "46.5%", top: "11%", height: "23%", opacity: ghost, filter: "brightness(0.8) blur(0.6px)" }} />
      </div>
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0 2px, transparent 2px 5px)" }} />
      <Vig o={0.75} />
      <div style={{ position: "absolute", left: 50, top: 150, fontFamily: "monospace", fontWeight: 700, fontSize: 44, color: "#f2f2f2", textShadow: "2px 0 #ff2a6a, -2px 0 #2affff" }}><div>{Math.floor(f / 15) % 2 ? "●" : "○"} REC</div><div>DEC.30.2000</div></div>
    </AbsoluteFill>
  );
};
const Bath: React.FC<{ f: number }> = ({ f }) => <Room3D f={f} C={BathScene3} len={35} label="BATHROOM · 2F" chip={["12:52 AM", 52]} grade={UP} fg="r" />;
const Down: React.FC<{ f: number }> = ({ f }) => <Room3D f={f} C={DownScene3} len={77} label="THE STAIRS" grade={DOWN} />;
const Office: React.FC<{ f: number }> = ({ f }) => <Room3D f={f} C={OfficeScene3} len={128} label="OFFICE · 2F" chip={["1:18 AM", 78]} grade={UP}
  over={<>
    <div style={{ position: "absolute", right: 60, top: 600, opacity: interpolate(f, [8, 14], [0, 1], clamp), background: "rgba(8,12,24,0.88)", border: "3px solid #4a7dff", borderRadius: 12, padding: "8px 20px", fontFamily: "monospace", fontWeight: 700, fontSize: 36, color: "#cfe0ff", boxShadow: "0 0 24px rgba(74,125,255,0.5)" }}><span style={{ color: Math.floor(f / 5) % 2 ? "#3dff7a" : "#1a6a33" }}>●</span> ONLINE 1:18 AM</div>
    {f > 44 && <div style={{ position: "absolute", left: 60, right: 60, top: 1060, opacity: interpolate(f, [44, 52, 118, 126], [0, 1, 1, 0], clamp), background: "rgba(10,10,12,0.88)", borderLeft: "12px solid #e3262b", padding: "14px 26px", borderRadius: 12 }}>
      <div style={{ fontFamily: "Fredoka", fontWeight: 700, fontSize: 56, color: "#fff" }}>STILL UNSOLVED</div>
      <div style={{ fontFamily: "Fredoka", fontWeight: 600, fontSize: 34, color: "#c9c3b6", letterSpacing: 1 }}>¥20,000,000 REWARD · 12,545 PIECES OF EVIDENCE</div></div>}
  </>} />;
const JAR = { src: S7("jar_fixed.png"), iw: 1086, ih: 1448 };
const Tag: React.FC<{ f: number; s: number; x: number; y: number; text: string }> = ({ f, s, x, y, text }) => {
  if (f < s) return null; const p = pop(f, s, 10);
  return <div style={{ position: "absolute", left: x, top: y, transform: `scale(${p})`, transformOrigin: "0 50%", background: "#f2c94c", color: INK, fontFamily: "Fredoka", fontWeight: 700, fontSize: 50, padding: "6px 20px", borderRadius: 10, border: `4px solid ${INK}`, boxShadow: "0 8px 16px rgba(0,0,0,0.5)" }}>{text}</div>;
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
  return <div style={{ position: "absolute", left: 90, right: 90, top, transform: `translateX(${(1 - p) * -60}px)`, opacity: p, background: "rgba(10,10,12,0.88)", borderLeft: "10px solid #e3262b", padding: "10px 24px", borderRadius: 10 }}><div style={{ fontFamily: "Fredoka", fontWeight: 700, fontSize: 54, color: "#fff" }}>{txt}</div><div style={{ fontFamily: "Fredoka", fontWeight: 600, fontSize: 28, color: "#c9c3b6", letterSpacing: 2 }}>{small}</div></div>;
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
          <text y={-468} fontFamily="Fredoka" fontWeight={700} fontSize={92} fill="#fff" textAnchor="middle" letterSpacing={6}>WANTED</text>
          <rect x={-260} y={-400} width={520} height={620} fill="#cfc9bb" />
          {q > 0 && <text y={80} fontFamily="Fredoka" fontWeight={700} fontSize={460} fill="#1a1a1e" textAnchor="middle" opacity={q}>?</text>}
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
          <text x={0} y={-20} fontFamily="Fredoka" fontWeight={700} fontSize={22} fill="#fff" textAnchor="middle">警視庁</text>
          <circle cx={red ? -16 : 44} cy={-100} r={120} fill={red ? "#ff2a2a" : "#2a5aff"} opacity={0.18} style={{ filter: "blur(20px)" }} />
        </g>
        <defs><clipPath id="tapeC"><rect x={-60} y={-20} width={interpolate(f, [6, 34], [0, 1400], { ...clamp, easing: ez })} height={80} /></clipPath></defs>
        <g transform="translate(0,1000) rotate(-1.5)" clipPath="url(#tapeC)"><rect x={-50} y={0} width={1300} height={34} fill="#f2c94c" />{Array.from({ length: 10 }).map((_, i) => <text key={i} x={i * 130} y={25} fontFamily="Fredoka" fontWeight={700} fontSize={22} fill={INK}>POLICE LINE</text>)}</g>
        {[[300, 1080, "1"], [720, 1090, "2"]].map(([x, y, n]) => <g key={n as string} transform={`translate(${x},${y})`}><path d="M-16,0 L-8,-28 L8,-28 L16,0 Z" fill="#f2c94c" stroke={INK} strokeWidth={2} /><text y={-8} fontFamily="Fredoka" fontWeight={700} fontSize={18} fill={INK} textAnchor="middle">{n}</text></g>)}
      </World>
      <Snow f={f} n={50} o={0.6} />
      <Vig o={0.6} />
      <div style={{ position: "absolute", top: 260, width: "100%", textAlign: "center", transform: `scale(${pop(f, 4, 12)})` }}>
        <div style={{ fontFamily: "Fredoka", fontWeight: 700, fontSize: 104, lineHeight: 1.05, color: "#fff", WebkitTextStroke: `6px ${INK}`, textShadow: "0 10px 0 #000" }}>DID YOU KNOW<br />THIS CASE?</div>
        <div style={{ display: "inline-block", marginTop: 24, background: "#e3262b", color: "#fff", fontFamily: "Fredoka", fontWeight: 700, fontSize: 50, padding: "10px 34px", borderRadius: 16, border: `5px solid ${INK}`, transform: `scale(${pop(f, 40, 10)})` }}>COMMENT BELOW ↓</div>
      </div>
      <AbsoluteFill style={{ background: "#000", opacity: interpolate(f, [113, 122], [0, 1], clamp) }} />
      {f > 113 && <div style={{ position: "absolute", left: 50, top: 150, fontFamily: "monospace", fontWeight: 700, fontSize: 40, color: "#f2f2f2" }}>● REC</div>}
    </>
  );
};


/** word-by-word subtitles: shows a 3-4 word group, the spoken word pops, key words in red */
/** subtitles in the video's true-crime style: condensed caps, the spoken word gets a red tag, key words stay red */
const Subs: React.FC = () => {
  const f = useCurrentFrame();
  const words = WORDS as { w: string; a: number; b: number; k: boolean; g: number }[];
  const i = words.findIndex((x) => f >= x.a - 2 && f < x.b + 5);
  if (i < 0) return null;
  const grp = words.filter((x) => x.g === words[i].g);
  const appear = interpolate(f, [grp[0].a - 2, grp[0].a + 2], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", top: 1290, width: "100%", textAlign: "center", padding: "0 100px 0 70px", boxSizing: "border-box", opacity: appear }}>
      {grp.map((x, j) => {
        let ci = -1; grp.forEach((y, k) => { if (f >= y.a) ci = k; });
        const on = f >= x.a, cur = j === ci && f < x.b + 4;
        return (
          <span key={j} style={{ display: "inline-block", margin: "6px 10px", padding: "2px 14px 6px", borderRadius: 10, background: cur ? "#c8102e" : "transparent", boxShadow: cur ? "0 6px 16px rgba(0,0,0,0.55)" : "none",
            fontFamily: "Oswald", fontWeight: 700, fontSize: 88, lineHeight: 1.1, letterSpacing: 1, textTransform: "uppercase",
            color: cur ? "#fff" : x.k ? "#ff4848" : "#fff", opacity: on ? 1 : 0.45, WebkitTextStroke: cur ? "0px" : `9px ${INK}`, paintOrder: "stroke fill", textShadow: "0 4px 14px rgba(0,0,0,0.85)" }}>{x.w}</span>
        );
      })}
    </div>
  );
};
const Grade: React.FC = () => {
  const f = useCurrentFrame();
  const night = interpolate(f, [T7.entry, T7.office], [0, 0.22], clamp);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={W} height={H} style={{ position: "absolute", opacity: f < T7.entry ? 0.18 : 0.08, mixBlendMode: "overlay" }}><filter id="gn7"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 11} /></filter><rect width={W} height={H} filter="url(#gn7)" /></svg>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,20,40,0.12), rgba(40,20,10,0.08))", mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(0,0,0,${night}) 100%)` }} />
    </AbsoluteFill>
  );
};
/** dark smoke wipe used between the rooms (the killer's aura moving through the house) */
const SmokeWipe: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame(), k = (f - at + 7) / 14;
  if (k <= 0 || k >= 1) return null;
  return (
    <svg width={W} height={H} style={{ position: "absolute", pointerEvents: "none" }}>
      {Array.from({ length: 26 }).map((_, i) => { const x = -300 + k * 1700 - random("sw" + i) * 500, y = random("sy" + i) * H, r = 180 + random("sr" + i) * 220; return <circle key={i} cx={x} cy={y} r={r} fill="#070608" opacity={Math.sin(Math.PI * k) * 0.6} style={{ filter: "blur(30px)" }} />; })}
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
  [T7.hook, T7.photo, ColdKitchen], [T7.photo, T7.fridge0, Photo], [T7.fridge0, T7.front, ColdOpen], [T7.front, T7.entry, Front], [T7.entry, T7.dead, Entry], [T7.dead, T7.rei, Dead], [T7.rei, T7.stairs, Rei],
  [T7.stairs, T7.kitchen, Stairs], [T7.kitchen, T7.stay, Kitchen], [T7.stay, T7.fridge, Stay], [T7.fridge, T7.bath, Fridge], [T7.bath, T7.office, Bath], [T7.office, T7.down, Office], [T7.down, T7.fin, Down],
];
const XF = 5;
/** clean transitions: crossfade only; the bath -> office move is a sideways pan (corridor), never a zoom */
const Scene: React.FC<{ C: React.FC<{ f: number }>; i: number }> = ({ C, i }) => {
  const g = useCurrentFrame(), f = g - (i > 0 ? XF : 0);
  const op = i > 0 ? interpolate(g, [0, XF], [0, 1], clamp) : 1;
  const pan = i === 12 ? interpolate(g, [0, XF + 4], [1, 0], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) }) : 0;
  return <AbsoluteFill style={{ opacity: op, transform: pan ? `translateX(${pan * 180}px)` : undefined, filter: pan > 0.05 ? `blur(${pan * 8}px)` : undefined }}><C f={f} /></AbsoluteFill>;
};
export const Miya12: React.FC<{ audio?: boolean; subs?: boolean }> = ({ audio = false, subs = true }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    {LIST.map(([a, b, C], i) => <Sequence key={i} from={i > 0 ? a - XF : a} durationInFrames={b - a + (i > 0 ? XF : 0)}><Scene C={C} i={i} /></Sequence>)}
    <SmokeWipe at={T7.stairs} /><SmokeWipe at={T7.kitchen} />
    {subs && <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 64%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.4) 80%, transparent 88%)", pointerEvents: "none" }} />}
    {subs && <Subs />}
    <Grade />
    {audio && <Audio src={staticFile("miya12/mix.wav")} />}
  </AbsoluteFill>
);
