import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import "@fontsource/oswald/700.css";
import "@fontsource/lilita-one/400.css";

const F = "Oswald, sans-serif";
const YEL = "#ffd21f", RED = "#ff2a2a", WHITE = "#ffffff";

const T: React.FC<{ text: string; size: number; color: string; x: number; y: number; rot?: number; stroke?: number; font?: string; align?: "left" | "center" | "right"; w?: number }> = ({ text, size, color, x, y, rot = 0, stroke = 12, font = F, align = "left", w = 1200 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, textAlign: align, transform: `rotate(${rot}deg)`, fontFamily: font, fontWeight: 700, fontSize: size, lineHeight: 0.92, color, letterSpacing: 1,
    WebkitTextStroke: `${stroke}px #000`, paintOrder: "stroke fill", textShadow: "0 8px 0 #000, 0 14px 30px rgba(0,0,0,0.85)", textTransform: "uppercase" }}>{text}</div>
);
const Bg: React.FC<{ src: string; scale?: number; ox?: number; oy?: number; filter?: string }> = ({ src, scale = 1, ox = 0, oy = 0, filter = "brightness(1.15) contrast(1.15) saturate(1.25)" }) => (
  <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
    <Img src={staticFile(src)} style={{ position: "absolute", width: 1280 * scale, height: 720 * scale, left: -ox, top: -oy, filter }} />
  </AbsoluteFill>
);
const Vign: React.FC<{ k?: number; col?: string }> = ({ k = 0.75, col = "0,0,0" }) => <AbsoluteFill style={{ background: `radial-gradient(ellipse at 55% 50%, transparent 45%, rgba(${col},${k}) 100%)` }} />;
const Glow: React.FC<{ x: number; y: number; r: number; col: string; o?: number }> = ({ x, y, r, col, o = 0.6 }) => <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: `radial-gradient(circle, ${col} 0%, transparent 70%)`, opacity: o, mixBlendMode: "screen" }} />;
const Ring: React.FC<{ x: number; y: number; r: number; col?: string }> = ({ x, y, r, col = RED }) => <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `10px solid ${col}`, boxShadow: `0 0 30px ${col}, inset 0 0 20px ${col}` }} />;
const Arrow: React.FC<{ x: number; y: number; rot: number; s?: number; col?: string }> = ({ x, y, rot, s = 1, col = RED }) => (
  <svg style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg) scale(${s})`, transformOrigin: "0 0", filter: "drop-shadow(0 6px 0 #000) drop-shadow(0 0 18px rgba(255,0,0,0.6))" }} width="260" height="120" viewBox="0 0 260 120">
    <path d="M0 45 L170 45 L170 10 L255 60 L170 110 L170 75 L0 75 Z" fill={col} stroke="#000" strokeWidth="8" strokeLinejoin="round" />
  </svg>
);
const Badge: React.FC<{ text: string; x: number; y: number; bg?: string; size?: number; rot?: number }> = ({ text, x, y, bg = RED, size = 64, rot = -4 }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg)`, background: bg, border: "6px solid #000", borderRadius: 14, padding: "4px 22px", fontFamily: F, fontWeight: 700, fontSize: size, color: WHITE, boxShadow: "0 10px 0 #000", textTransform: "uppercase" }}>{text}</div>
);

export const Thumb6: React.FC<{ i: number }> = ({ i }) => {
  if (i === 0) return <AbsoluteFill>
    <Bg src="tort/thumb/bg_rat.png" scale={1.25} ox={20} oy={170} />
    <Glow x={560} y={330} r={320} col="#ff7a00" o={0.5} />
    <Vign k={0.8} />
    <AbsoluteFill style={{ background: "linear-gradient(270deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 40%, transparent 62%)" }} />
    <T text="9 WORST" size={180} color={WHITE} x={0} y={50} align="right" w={1240} />
    <T text="TORTURES" size={150} color={RED} x={0} y={235} align="right" w={1240} />
    <Badge text="IN HISTORY" x={830} y={420} bg="#111" size={60} rot={3} />
  </AbsoluteFill>;
  if (i === 1) return <AbsoluteFill>
    <Bg src="tort/thumb/bg_bull.png" scale={1.25} ox={0} oy={60} filter="brightness(1.05) contrast(1.25) saturate(1.4) hue-rotate(-8deg)" />
    <Glow x={260} y={620} r={360} col="#ff3c00" o={0.8} />
    <Glow x={240} y={400} r={200} col="#ffae00" o={0.45} />
    <Vign k={0.85} />
    <AbsoluteFill style={{ background: "linear-gradient(270deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 45%, transparent 65%)" }} />
    <T text="HE WAS" size={120} color={WHITE} x={0} y={70} align="right" w={1230} />
    <T text="INSIDE" size={210} color={YEL} x={0} y={190} align="right" w={1230} />
    <T text="THE BULL" size={130} color={RED} x={0} y={400} align="right" w={1230} />
    <Ring x={250} y={400} r={120} />
    <Arrow x={430} y={300} rot={160} s={0.7} col={YEL} />
  </AbsoluteFill>;
  if (i === 2) {
    const cw = 330, ch = 186, g = 12, x0 = (1280 - cw * 3 - g * 2) / 2, y0 = 14;
    return <AbsoluteFill style={{ background: "#0b0b0d" }}>
      {Array.from({ length: 9 }).map((_, k) => {
        const x = x0 + (k % 3) * (cw + g), y = y0 + Math.floor(k / 3) * (ch + g), last = k === 8;
        return <div key={k} style={{ position: "absolute", left: x, top: y, width: cw, height: ch, borderRadius: 12, overflow: "hidden", border: last ? `7px solid ${RED}` : "4px solid #222", boxShadow: last ? `0 0 40px ${RED}` : "none" }}>
          <Img src={staticFile(`tort/grid/v5_${k}.png`)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: last ? "blur(6px) brightness(0.55)" : `grayscale(${k < 6 ? 0.6 : 0.1}) brightness(${k < 6 ? 0.8 : 1.05})` }} />
          <div style={{ position: "absolute", left: 10, top: 4, fontFamily: F, fontWeight: 700, fontSize: 46, color: last ? RED : WHITE, WebkitTextStroke: "6px #000", paintOrder: "stroke fill" }}>#{k + 1}</div>
          {last && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F, fontWeight: 700, fontSize: 170, color: WHITE, WebkitTextStroke: "10px #000", paintOrder: "stroke fill" }}>?</div>}
        </div>;
      })}
      <div style={{ position: "absolute", left: 0, top: 600, width: 1280, height: 120, background: "#000" }} />
      <T text="#9 IS THE WORST" size={104} color={YEL} x={0} y={604} align="center" w={1280} stroke={10} />
    </AbsoluteFill>;
  }
  if (i === 3) return <AbsoluteFill>
    <Bg src="tort/thumb/bg_drip.png" scale={1.7} ox={480} oy={330} />
    <Glow x={650} y={260} r={260} col="#5ad8ff" o={0.45} />
    <Vign k={0.85} />
    <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 40%, transparent 62%)" }} />
    <T text="JUST" size={130} color={WHITE} x={40} y={60} />
    <T text="WATER..." size={190} color="#5ad8ff" x={40} y={180} />
    <Badge text="DROVE THEM MAD" x={44} y={420} size={58} />
    <Ring x={600} y={430} r={95} col="#5ad8ff" />
  </AbsoluteFill>;
  return <AbsoluteFill>
    <Bg src="tort/thumb/bg_keel.png" scale={1.45} ox={420} oy={160} filter="brightness(1.4) contrast(1.15) saturate(1.3)" />
    <Glow x={820} y={380} r={300} col="#38e0d0" o={0.4} />
    <Vign k={0.8} col="0,10,20" />
    <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,8,16,0.9) 0%, rgba(0,8,16,0.35) 42%, transparent 62%)" }} />
    <T text="DRAGGED" size={170} color={WHITE} x={40} y={60} />
    <T text="UNDER" size={170} color={YEL} x={40} y={230} />
    <T text="THE SHIP" size={110} color={RED} x={40} y={410} />
    <Arrow x={560} y={560} rot={-20} s={0.8} col={RED} />
  </AbsoluteFill>;
};
