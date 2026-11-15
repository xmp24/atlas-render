import React from "react";
import WORDS5 from "./words5.json";
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { clamp, eo, ez, W, H } from "./Common";
import { Icon, RED, INK } from "./UI";

const pop = (f: number, a: number, d = 10) => interpolate(f, [a, a + d], [0, 1], { ...clamp, easing: eo });
const out = (f: number, b: number, d = 8) => interpolate(f, [b - d, b], [1, 0], clamp);
const OS = (size: number, w = 700): React.CSSProperties => ({ fontFamily: "Oswald", fontWeight: w, fontSize: size, lineHeight: 1.0, textTransform: "uppercase", letterSpacing: 1 });
export const NAMES = ["The Water Drop", "The Wooden Horse", "The Rat", "The Strappado", "Keelhauling", "The Rack", "The Breaking Wheel", "The Brazen Bull", "Scaphism"];
const N = NAMES.length;

/* ---------- big numbered title: #n, name, cruelty skulls = n ---------- */
export const TortTitle: React.FC<{ f: number; n: number; sub: string; len?: number }> = ({ f, n, sub, len = 100 }) => {
  if (f < 0 || f > len) return null;
  const a = pop(f, 0, 12), b = pop(f, 6, 12), c = pop(f, 14, 12), o = out(f, len, 12);
  return <AbsoluteFill style={{ opacity: o }}>
    <AbsoluteFill style={{ background: `linear-gradient(90deg, rgba(0,0,0,${0.75 * a}) 0%, rgba(0,0,0,${0.35 * a}) 48%, rgba(0,0,0,0) 72%)` }} />
    <div style={{ position: "absolute", left: 110, top: 290, display: "flex", alignItems: "center" }}>
      <div style={{ ...OS(320, 700), color: RED, transform: `translateX(${(1 - a) * -80}px) scale(${0.9 + a * 0.1})`, opacity: a, textShadow: "0 12px 40px rgba(0,0,0,0.7), 0 0 60px rgba(255,40,60,0.35)", WebkitTextStroke: "3px #4a0008" }}>#{n}</div>
      <div style={{ marginLeft: 40, borderLeft: `6px solid ${RED}`, paddingLeft: 34, transform: `translateX(${(1 - b) * 60}px)`, opacity: b }}>
        <div style={{ ...OS(34, 500), color: "#d8c8b0", letterSpacing: 6 }}>{sub}</div>
        <div style={{ ...OS(124, 700), color: "#fff", marginTop: 6, textShadow: "0 8px 30px rgba(0,0,0,0.8)" }}>{NAMES[n - 1]}</div>
        <div style={{ display: "flex", gap: 10, marginTop: 20, alignItems: "center", opacity: c }}>
          <div style={{ ...OS(24, 600), color: "#d8c8b0", letterSpacing: 4, marginRight: 8 }}>CRUELTY</div>
          {Array.from({ length: N }).map((_, i) => <div key={i} style={{ opacity: i < n ? 1 : 0.22, transform: `scale(${i < n ? interpolate(f, [16 + i * 3, 22 + i * 3], [0.3, 1], { ...clamp, easing: eo }) : 1})` }}><Icon k="skull" s={42} c={i < n ? RED : "#fff"} /></div>)}
        </div>
      </div>
    </div>
  </AbsoluteFill>;
};

/* ---------- cruelty meter on the right edge ---------- */
export const CrueltyMeter: React.FC<{ n: number; show: number; fill: number }> = ({ n, show, fill }) => show <= 0 ? null :
  <div style={{ position: "absolute", right: 40, top: 220, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: show }}>
    {Array.from({ length: N }).map((_, k) => { const i = N - 1 - k, on = i < n, cur = i === n - 1; return <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ ...OS(18, 600), color: on ? "#fff" : "rgba(255,255,255,0.35)", width: 22, textAlign: "right" }}>{i + 1}</div>
      <div style={{ width: 40, height: 40, borderRadius: 20, background: on ? (cur ? RED : "rgba(150,20,30,0.75)") : "rgba(12,12,14,0.8)", border: `2px solid ${cur ? "#ff8090" : "rgba(255,255,255,0.25)"}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${cur ? 1 + 0.15 * fill : 1})`, boxShadow: cur ? `0 0 ${16 * fill}px ${RED}` : "none" }}><Icon k="skull" s={24} c={on ? "#fff" : "rgba(255,255,255,0.3)"} /></div>
    </div>; })}
  </div>;

/* ---------- ranking list 1..7 (locked until revealed) ---------- */
export const RankList: React.FC<{ f: number; len: number; reveal: number; hl?: number; x?: number; title?: string }> = ({ f, len, reveal, hl = -1, x = 1160, title = "THE 9 WORST TORTURES" }) => {
  if (f < 0 || f > len) return null;
  const o = Math.min(pop(f, 0, 12), out(f, len, 10));
  return <div style={{ position: "absolute", left: x, top: 130, width: 640, opacity: o }}>
    <div style={{ ...OS(42, 700), color: "#fff", marginBottom: 16, letterSpacing: 3, textShadow: "0 4px 16px #000" }}>{title}</div>
    {NAMES.map((name, i) => { const r = pop(f, 4 + i * 4, 10), open = i < reveal, isHl = i === hl, shake = isHl ? Math.sin(f / 2) * 1.5 : 0;
      return <div key={i} style={{ display: "flex", alignItems: "center", height: 62, marginBottom: 8, borderRadius: 12, background: isHl ? `linear-gradient(90deg, ${RED}, #6a0612)` : "rgba(14,12,12,0.84)", border: `2px solid ${isHl ? "#ff7080" : "rgba(255,255,255,0.12)"}`, transform: `translateX(${(1 - r) * 60 + shake}px)`, opacity: r, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
        <div style={{ width: 80, textAlign: "center", ...OS(44, 700), color: isHl ? "#fff" : RED }}>{i + 1}</div>
        <div style={{ flex: 1, ...OS(36, open ? 600 : 500), color: open ? "#fff" : "rgba(255,255,255,0.35)", letterSpacing: open ? 1 : 8 }}>{open ? name : "? ? ? ? ?"}</div>
        <div style={{ width: 64, display: "flex", justifyContent: "center", opacity: open ? 0 : 0.6 }}><Icon k="lock" s={30} /></div>
      </div>; })}
  </div>;
};

/* ---------- grid transition: zoom out to 15 thumbnails, zoom into the next ---------- */
// 5x3 grid, thumbnails rendered from the video itself: tort/grid/gNN.png ; each torture owns two cells
export const GRID_OF: number[][] = [[0], [1], [2], [3], [4], [5], [6], [7], [8]]; // cell 14 = the final "?" cell
export const GridTr: React.FC<{ f: number; len: number; from: number; to: number }> = ({ f, len, from, to }) => {
  if (f < 0 || f > len) return null;
  const cols = 3, rows = 3, gap = 16, ch = (H - gap * (rows + 1)) / rows, cw = ch * 16 / 9, left0 = (W - (cw * cols + gap * (cols - 1))) / 2, top0 = gap;
  const cell = (i: number) => ({ x: left0 + (i % cols) * (cw + gap), y: top0 + Math.floor(i / cols) * (ch + gap) });
  const a = GRID_OF[from][0], b = GRID_OF[to][0]; const A = cell(a), B = cell(b);
  const k1 = ez(interpolate(f, [0, len * 0.38], [0, 1], clamp)), k2 = ez(interpolate(f, [len * 0.62, len], [0, 1], clamp));
  const sCell = W / cw, Gx = W / 2, Gy = H / 2;
  const ph2 = k2 > 0, k = ph2 ? k2 : 1 - k1;
  const P = ph2 ? B : A, fx0 = P.x + cw / 2, fy0 = P.y + ch / 2;
  const s = 1 + (sCell - 1) * k, fx = Gx + (fx0 - Gx) * k, fy = Gy + (fy0 - Gy) * k;
  const tx = W / 2 - fx * s, ty = H / 2 - fy * s;
  const mid = 1 - Math.max(1 - k1, k2);
  return <AbsoluteFill style={{ background: "#08070a", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `translate(${tx}px, ${ty}px) scale(${s})`, transformOrigin: "0 0" }}>
      {Array.from({ length: 9 }).map((_, i) => { const c = cell(i); const owner = GRID_OF.findIndex((p) => p.includes(i)); const seen = owner >= 0 && owner <= from, next = owner === to, future = owner < 0 || owner > to;
        return <div key={i} style={{ position: "absolute", left: c.x, top: c.y, width: cw, height: ch, borderRadius: 10, overflow: "hidden", border: `3px solid ${next ? RED : "rgba(255,255,255,0.18)"}`, boxShadow: next ? `0 0 ${30 * mid}px ${RED}` : "0 8px 24px rgba(0,0,0,0.6)" }}>
          {i < 9 ? <Img src={staticFile(`tort/grid/v5_${i}.png`)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: future ? "blur(10px) brightness(0.45)" : seen && !next ? "grayscale(1) brightness(0.55)" : "none" }} /> : <div style={{ width: "100%", height: "100%", background: "radial-gradient(circle,#2a0a0e,#08070a)" }} />}
          {owner >= 0 && <div style={{ position: "absolute", left: 10, top: 6, ...OS(34, 700), color: next ? RED : "#fff", textShadow: "0 2px 8px #000", opacity: mid }}>#{owner + 1}</div>}
          {seen && !next && <div style={{ position: "absolute", right: 10, bottom: 8, ...OS(22, 700), color: "#fff", background: "rgba(150,20,30,0.85)", padding: "2px 8px", borderRadius: 6, opacity: mid }}>{NAMES[owner]}</div>}
          {future && !next && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: mid }}><Icon k="lock" s={54} /></div>}
          {next && <div style={{ position: "absolute", inset: 0, border: `4px solid ${RED}`, borderRadius: 8, opacity: 0.5 + 0.5 * Math.sin(f / 3) }} />}
        </div>; })}
    </div>
  </AbsoluteFill>;
};

/* ---------- stylised x-ray: skeleton with the joints that suffer ---------- */
export type XKind = "head" | "belly" | "shoulders" | "joints" | "limbs" | "heat" | "skin";
export const XRay: React.FC<{ f: number; len: number; kind: XKind; label: string; side?: "l" | "r" }> = ({ f, len, kind, label, side = "r" }) => {
  if (f < 0 || f > len) return null;
  const a = pop(f, 0, 12), o = out(f, len, 10), scan = ((f * 6) % 520), pulse = 0.5 + 0.5 * Math.sin(f / 4);
  const hot: Record<XKind, [number, number, number][]> = { head: [[150, 70, 34]], belly: [[150, 250, 40]], shoulders: [[112, 150, 18], [188, 150, 18]], joints: [[112, 150, 16], [188, 150, 16], [96, 240, 14], [204, 240, 14], [128, 330, 15], [172, 330, 15], [128, 420, 14], [172, 420, 14]], limbs: [[90, 200, 14], [210, 200, 14], [120, 380, 15], [180, 380, 15]], heat: [[150, 230, 120]], skin: [[150, 70, 40], [150, 250, 60], [150, 400, 40]] };
  const bone = { stroke: "#cfe8ff", strokeWidth: 7, strokeLinecap: "round" as const, fill: "none" };
  return <div style={{ position: "absolute", [side === "r" ? "right" : "left"]: 130, top: 130, width: 330, opacity: a * o, transform: `translateY(${(1 - a) * 30}px)` } as React.CSSProperties}>
    <div style={{ background: "radial-gradient(circle at 50% 40%, #0e2a3a, #040a10)", border: "2px solid #4a9ad0", borderRadius: 14, padding: "12px 14px", boxShadow: "0 0 40px rgba(60,160,255,0.25), 0 20px 50px rgba(0,0,0,0.6)", overflow: "hidden", position: "relative" }}>
      <div style={{ ...OS(20, 600), color: "#8ac8f0", letterSpacing: 6 }}>X-RAY · {label}</div>
      <svg width={300} height={500} viewBox="0 0 300 500">
        <ellipse cx="150" cy="70" rx="38" ry="46" {...bone} />
        <path d="M150 116 L150 300" {...bone} />
        {[150, 175, 200, 225, 250].map((y) => <path key={y} d={`M150 ${y} Q110 ${y + 5} 102 ${y + 22} M150 ${y} Q190 ${y + 5} 198 ${y + 22}`} {...bone} strokeWidth={4} />)}
        <path d="M112 150 L188 150 M112 150 L96 240 L90 320 M188 150 L204 240 L210 320" {...bone} />
        <path d="M120 300 Q150 320 180 300 M128 310 L128 420 L124 490 M172 310 L172 420 L176 490" {...bone} />
        {hot[kind].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={kind === "heat" ? `rgba(255,90,20,${0.25 + 0.25 * pulse})` : `rgba(255,40,60,${0.5 + 0.4 * pulse})`} style={{ filter: "blur(2px)" }} />)}
        <rect x="0" y={scan - 20} width="300" height="20" fill="rgba(140,220,255,0.25)" />
      </svg>
    </div>
  </div>;
};

/* ---------- text painted / carved on the wall with perspective ---------- */
export const WallText: React.FC<{ f: number; len: number; text: string; x: number; y: number; rotY?: number; size?: number; color?: string }> = ({ f, len, text, x, y, rotY = 0, size = 90, color = "#e8d8b8" }) => {
  if (f < 0 || f > len) return null;
  const k = interpolate(f, [4, 30], [0, 1], clamp), o = out(f, len, 10);
  return <div style={{ position: "absolute", left: x, top: y, perspective: 900, opacity: o }}>
    <div style={{ transform: `rotateY(${rotY}deg)`, fontFamily: "Playfair Display", fontStyle: "italic", fontWeight: 700, fontSize: size, color, mixBlendMode: "screen", opacity: 0.85, clipPath: `inset(0 ${100 - k * 100}% 0 0)`, textShadow: "0 0 18px rgba(255,170,90,0.35)", letterSpacing: 2 }}>{text}</div>
  </div>;
};

/* ---------- rain streaks ---------- */
export const Rain: React.FC<{ f: number; k?: number }> = ({ f, k = 1 }) => k <= 0 ? null : <AbsoluteFill style={{ pointerEvents: "none", opacity: k }}>
  {Array.from({ length: 140 }).map((_, i) => { const sp = 40 + random("rs" + i) * 30, x = (random("rx" + i) * 1.2 - 0.1) * W, y = ((random("ry" + i) * H + f * sp) % (H + 200)) - 100;
    return <div key={i} style={{ position: "absolute", left: x - (y / H) * 60, top: y, width: 2, height: 40 + random("rl" + i) * 40, background: "linear-gradient(180deg, rgba(200,210,230,0), rgba(200,210,230,0.45))", transform: "rotate(12deg)" }} />; })}
</AbsoluteFill>;

/* ---------- red mood light pulse for the hardest moments ---------- */
export const RedMood: React.FC<{ k: number; f: number }> = ({ k, f }) => k <= 0 ? null : <AbsoluteFill style={{ pointerEvents: "none", background: `radial-gradient(ellipse at 50% 50%, rgba(255,20,30,${0.0}) 30%, rgba(140,0,10,${0.45 * k * (0.85 + 0.15 * Math.sin(f / 5))}) 100%)`, mixBlendMode: "multiply" }} />;

/* ---------- god rays over photo sets ---------- */
export const GodRays: React.FC<{ f: number; x: number; y: number; ang?: number; col?: string; k?: number }> = ({ f, x, y, ang = 20, col = "190,210,255", k = 1 }) => <div style={{ position: "absolute", left: x - 500, top: y, width: 1000, height: 1100, transformOrigin: "50% 0", transform: `rotate(${ang}deg)`, pointerEvents: "none", mixBlendMode: "screen", opacity: k }}>
  {Array.from({ length: 7 }).map((_, i) => { const w = 40 + random("gr" + i) * 90; return <div key={i} style={{ position: "absolute", left: 500 - 180 + i * 60 + Math.sin(f / 60 + i) * 10, top: 0, width: w, height: 1100, background: `linear-gradient(180deg, rgba(${col},${0.22 + random("go" + i) * 0.15}), rgba(${col},0))`, filter: "blur(14px)", transform: `skewX(${(i - 3) * 4}deg)` }} />; })}
</div>;

export const Subs5: React.FC<{ hide?: [number, number][] }> = ({ hide = [] }) => {
  const f = useCurrentFrame();
  if (hide.some(([a, b]) => f >= a && f < b)) return null;
  const words = WORDS5 as { w: string; a: number; b: number; k: boolean; g: number }[];
  const i = words.findIndex((x) => f >= x.a - 3 && f < x.b + 6);
  if (i < 0) return null;
  const grp = words.filter((x) => x.g === words[i].g);
  const o = interpolate(f, [grp[grp.length - 1].b + 2, grp[grp.length - 1].b + 6], [1, 0], clamp);
  let ci = -1; grp.forEach((y, k) => { if (f >= y.a) ci = k; });
  return <div style={{ position: "absolute", bottom: 58, width: "100%", textAlign: "center", opacity: o }}>
    {grp.map((x, j) => { const ap = interpolate(f, [x.a - 3, x.a + 2], [0, 1], { ...clamp, easing: eo }), cur = j === ci && f < x.b + 4;
      return <span key={j} style={{ display: "inline-block", margin: "0 9px", position: "relative", ...OS(58, 600), opacity: ap, color: x.k ? "#ff5a5a" : "#fff", WebkitTextStroke: `7px ${INK}`, paintOrder: "stroke fill", textShadow: "0 4px 14px rgba(0,0,0,0.9)" }}>
        {x.w}
        <span style={{ position: "absolute", left: 0, right: 0, bottom: -10, height: 6, borderRadius: 3, background: RED, boxShadow: `0 0 10px ${RED}`, transform: `scaleX(${cur ? interpolate(f, [x.a - 2, x.a + 4], [0, 1], clamp) : 0})`, transformOrigin: "left" }} />
      </span>; })}
  </div>;
};
