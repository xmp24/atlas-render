import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import LAND from "world-atlas/land-110m.json";
import { clamp, eo, W, H } from "./Common";
import { Icon, RED, INK } from "./UI";
import WORDS from "./words.json";

const pop = (f: number, a: number, d = 10) => interpolate(f, [a, a + d], [0, 1], { ...clamp, easing: eo });
const out = (f: number, b: number, d = 8) => interpolate(f, [b - d, b], [1, 0], clamp);
const OS = (size: number, w = 700): React.CSSProperties => ({ fontFamily: "Oswald", fontWeight: w, fontSize: size, lineHeight: 1.0, textTransform: "uppercase", letterSpacing: 1 });
const PF: React.CSSProperties = { fontFamily: "Playfair Display", fontStyle: "italic", fontWeight: 700 };
export const FLOORCOL = ["#6aa0e0", "#e0a04a", "#9ac04a"];

/* ---------- subtitles v3: smaller, underline on the active word ---------- */
export const Subs3: React.FC<{ hide?: [number, number][] }> = ({ hide = [] }) => {
  const f = useCurrentFrame();
  if (hide.some(([a, b]) => f >= a && f < b)) return null;
  const words = WORDS as { w: string; a: number; b: number; k: boolean; g: number }[];
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

/* ---------- full-screen floor title, engraved in stone ---------- */
export const FloorTitle: React.FC<{ f: number; len: number; n: number; name: string; sub: string }> = ({ f, len, n, name, sub }) => {
  if (f < 0 || f > len) return null;
  const a = pop(f, 0, 14), b = pop(f, 10, 16), o = out(f, len, 14), col = FLOORCOL[n - 1];
  return <AbsoluteFill style={{ opacity: o, alignItems: "center", justifyContent: "center" }}>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,${0.35 * a}), rgba(0,0,0,${0.75 * a}))` }} />
    <div style={{ textAlign: "center", transform: `scale(${0.92 + a * 0.08})`, opacity: a }}>
      <div style={{ ...OS(40, 600), color: col, letterSpacing: 18, marginBottom: 6 }}>FLOOR</div>
      <div style={{ ...OS(260, 700), color: "#d8ccb8", letterSpacing: 6, textShadow: `0 2px 0 #fff3, 0 -3px 0 #0009, 0 0 60px ${col}55`, WebkitTextStroke: "2px #3a3026" }}>-{n}</div>
      <div style={{ ...OS(96, 700), color: "#fff", letterSpacing: 14, marginTop: 4, opacity: b }}>{name}</div>
      <div style={{ width: 520 * b, height: 3, background: col, margin: "22px auto 18px", boxShadow: `0 0 18px ${col}` }} />
      <div style={{ ...PF, fontSize: 40, color: "#d8c8b0", opacity: b }}>{sub}</div>
    </div>
  </AbsoluteFill>;
};

/* ---------- depth gauge on the right edge (replaces the chapter bar) ---------- */
export const DepthGauge: React.FC<{ depth: number; floor: number; show: number; unlocked: number }> = ({ depth, floor, show, unlocked }) => {
  if (show <= 0) return null;
  const Hh = 520, max = 48, y = (d: number) => (d / max) * Hh;
  return <div style={{ position: "absolute", right: 44, top: 170, width: 120, height: Hh + 80, opacity: show }}>
    <div style={{ position: "absolute", right: 40, top: 0, width: 6, height: Hh, borderRadius: 3, background: "rgba(255,255,255,0.12)" }} />
    <div style={{ position: "absolute", right: 40, top: 0, width: 6, height: y(depth), borderRadius: 3, background: `linear-gradient(180deg, ${FLOORCOL[0]}, ${FLOORCOL[1]}, ${FLOORCOL[2]})`, boxShadow: "0 0 12px rgba(255,120,60,0.5)" }} />
    {[["-1", 12], ["-2", 28], ["-3", 44]].map(([t, d], i) => <div key={i} style={{ position: "absolute", right: 30, top: y(d as number) - 13, display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ ...OS(22, 600), color: floor === i + 1 ? FLOORCOL[i] : "rgba(255,255,255,0.45)" }}>{t}</div>
      <div style={{ width: 26, height: 26, borderRadius: 13, border: `2px solid ${floor === i + 1 ? FLOORCOL[i] : "rgba(255,255,255,0.35)"}`, background: floor > i ? FLOORCOL[i] : "rgba(10,10,12,0.85)" }} />
    </div>)}
    <div style={{ position: "absolute", right: 22, top: y(depth) - 12, ...OS(20, 600), color: "#fff", background: "rgba(10,10,12,0.85)", padding: "2px 8px", borderRadius: 6, transform: "translateX(-46px)" }}>-{Math.round(depth)} M</div>
    <div style={{ position: "absolute", right: 14, top: Hh + 22, ...OS(18, 500), color: "rgba(255,255,255,0.7)", letterSpacing: 2, textAlign: "right" }}>{unlocked}/7</div>
  </div>;
};

/* ---------- torture dossier: era, place, duration, survival bar ---------- */
export const Dossier: React.FC<{ f: number; len: number; floor: number; idx: number; name: string; era: string; place: string; dur: string; surv: number; used: string }> = ({ f, len, floor, idx, name, era, place, dur, surv, used }) => {
  if (f < 0 || f > len) return null;
  const a = pop(f, 0, 14), o = out(f, len, 12), col = FLOORCOL[floor - 1], sb = interpolate(f, [22, 60], [100, surv], { ...clamp, easing: eo });
  const row = (k: string, v: string, i: number) => <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.1)", opacity: pop(f, 10 + i * 4, 10) }}>
    <span style={{ ...OS(22, 500), color: "rgba(255,255,255,0.55)", letterSpacing: 3 }}>{k}</span><span style={{ ...OS(26, 600), color: "#fff" }}>{v}</span></div>;
  return <div style={{ position: "absolute", left: 90, top: 150, width: 560, opacity: a * o, transform: `translateX(${(1 - a) * -60}px)` }}>
    <div style={{ background: "rgba(12,11,12,0.88)", border: `2px solid ${col}66`, borderRadius: 14, padding: "26px 32px", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
      <div style={{ ...OS(22, 600), color: col, letterSpacing: 6 }}>FLOOR -{floor} · {idx}/7</div>
      <div style={{ ...OS(76, 700), color: "#fff", marginTop: 8 }}>{name}</div>
      <div style={{ marginTop: 14 }}>{row("ERA", era, 0)}{row("PLACE", place, 1)}{row("LASTED", dur, 2)}{row("USED BY", used, 3)}</div>
      <div style={{ marginTop: 18, opacity: pop(f, 22, 10) }}>
        <div style={{ display: "flex", justifyContent: "space-between", ...OS(22, 600), color: "rgba(255,255,255,0.7)", letterSpacing: 3 }}><span>CHANCE OF SURVIVAL</span><span style={{ color: sb < 20 ? "#ff4a5a" : "#fff" }}>{Math.round(sb)}%</span></div>
        <div style={{ height: 14, borderRadius: 7, background: "rgba(255,255,255,0.12)", marginTop: 8, overflow: "hidden" }}><div style={{ width: `${sb}%`, height: "100%", background: `linear-gradient(90deg, #7a0a16, ${sb < 20 ? "#ff2a3a" : col})` }} /></div>
      </div>
    </div>
  </div>;
};

/* ---------- minimap with a real coastline (Natural Earth 110m) + pin ---------- */
const landGeo = feature(LAND as any, (LAND as any).objects.land) as any;
export const MiniMap: React.FC<{ f: number; len: number; lon: number; lat: number; label: string; year?: string; zoom?: number; left?: boolean }> = ({ f, len, lon, lat, label, year, zoom = 900, left }) => {
  if (f < 0 || f > len) return null;
  const a = pop(f, 0, 14), o = out(f, len, 10), Wm = 420, Hm = 300;
  const { d, p } = useMemo(() => { const pr = geoMercator().center([lon, lat]).scale(zoom).translate([Wm / 2, Hm / 2]); return { d: geoPath(pr)(landGeo) || "", p: pr([lon, lat]) || [Wm / 2, Hm / 2] }; }, [lon, lat, zoom]);
  const pulse = (f % 40) / 40;
  return <div style={{ position: "absolute", ...(left ? { left: 90 } : { right: 200 }), top: 120, width: Wm, opacity: a * o, transform: `translateY(${(1 - a) * -20}px)` }}>
    <div style={{ width: Wm, height: Hm, borderRadius: 14, overflow: "hidden", border: "2px solid rgba(255,255,255,0.2)", background: "radial-gradient(circle at 50% 40%, #1c2430, #0a0d12)", boxShadow: "0 16px 40px rgba(0,0,0,0.6)", position: "relative" }}>
      <svg width={Wm} height={Hm}><path d={d} fill="#3a3a30" stroke="#8a8270" strokeWidth={1} />
        <circle cx={p[0]} cy={p[1]} r={8 + pulse * 26} fill="none" stroke={RED} strokeWidth={3} opacity={1 - pulse} />
        <circle cx={p[0]} cy={p[1]} r={8} fill={RED} stroke="#fff" strokeWidth={2} /></svg>
      <div style={{ position: "absolute", left: 14, bottom: 10, ...OS(30, 700), color: "#fff", textShadow: "0 2px 8px #000" }}>{label}</div>
      {year && <div style={{ position: "absolute", right: 14, bottom: 12, ...OS(24, 600), color: "#e0b04a" }}>{year}</div>}
    </div>
  </div>;
};

/* ---------- blueprint: how the machine works ---------- */
type BP = "drip" | "rat" | "strap" | "rack" | "wheel" | "bull";
export const Blueprint: React.FC<{ f: number; len: number; kind: BP; title: string }> = ({ f, len, kind, title }) => {
  if (f < 0 || f > len) return null;
  const a = pop(f, 0, 12), o = out(f, len, 10), dr = interpolate(f, [8, 60], [0, 1], { ...clamp, easing: eo });
  const st = { stroke: "#cfe6ff", strokeWidth: 3, fill: "none", strokeDasharray: 1600, strokeDashoffset: 1600 * (1 - dr) } as React.CSSProperties;
  const lab = (x: number, y: number, t: string, d: number) => <g opacity={pop(f, d, 10)}><circle cx={x} cy={y} r={5} fill="#fff" /><text x={x + 12} y={y + 7} fill="#fff" fontFamily="Oswald" fontSize={22} letterSpacing={2}>{t}</text></g>;
  const D: Record<BP, React.ReactNode> = {
    drip: <><rect x={200} y={60} width={120} height={70} style={st} /><path d="M260 130 L260 140" style={st} /><path d="M110 300 L520 300 M140 300 L140 380 M490 300 L490 380" style={st} /><ellipse cx={200} cy={282} rx={42} ry={18} style={st} /><path d={`M260 ${150 + ((f * 4) % 120)} m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0`} fill="#cfe6ff" />{lab(330, 90, "BUCKET", 30)}{lab(270, 200, "ONE DROP", 40)}{lab(200, 250, "HEAD LOCKED", 50)}</>,
    rat: <><path d="M120 320 L520 320" style={st} /><path d="M260 320 L270 240 L370 240 L380 320" style={st} /><path d="M265 230 L375 230" style={st} />{Array.from({ length: 6 }).map((_, i) => <circle key={i} cx={280 + i * 17} cy={218} r={8} style={{ ...st, stroke: "#ffb070" }} />)}<path d="M300 300 q20 -20 40 0" style={st} />{lab(390, 220, "HOT COALS", 30)}{lab(390, 270, "IRON POT", 40)}{lab(140, 290, "RAT TRAPPED", 50)}</>,
    strap: <><path d="M100 70 L540 70" style={st} /><circle cx={320} cy={95} r={22} style={st} /><path d="M320 117 L320 220 M342 95 L500 300" style={st} /><path d="M300 230 L340 230 L330 330 L310 330 Z" style={st} /><rect x={300} y={340} width={40} height={30} style={st} />{lab(350, 95, "PULLEY", 30)}{lab(350, 200, "WRISTS TIED BEHIND", 40)}{lab(350, 360, "WEIGHTS", 50)}</>,
    rack: <><path d="M90 240 L550 240 M90 280 L550 280" style={st} /><circle cx={110} cy={260} r={30} style={st} /><circle cx={530} cy={260} r={30} style={st} /><path d="M110 230 L110 180 M530 230 L530 180" style={st} /><path d="M150 255 L490 255" style={{ ...st, stroke: "#ffb070" }} /><path d="M470 150 a40 40 0 1 1 -10 -30" style={st} />{lab(140, 200, "ROLLER", 30)}{lab(300, 220, "BODY STRETCHED", 40)}{lab(480, 120, "TURN", 50)}</>,
    wheel: <><circle cx={320} cy={230} r={150} style={st} />{Array.from({ length: 10 }).map((_, i) => <path key={i} d={`M320 230 L${320 + Math.cos(i * 0.628) * 150} ${230 + Math.sin(i * 0.628) * 150}`} style={st} />)}<path d="M540 80 L470 200" style={{ ...st, strokeWidth: 8 }} />{lab(480, 70, "IRON BAR", 30)}{lab(330, 80, "CART WHEEL", 40)}</>,
    bull: <><path d="M140 260 q0 -110 120 -110 l140 0 q60 0 80 -40 l40 10 l-20 60 q-10 80 -100 80 l-260 0 z" style={st} /><path d="M180 260 L180 340 M420 260 L420 340" style={st} /><circle cx={300} cy={210} r={36} style={st} /><path d="M380 160 q60 -20 120 -40" style={{ ...st, stroke: "#ffb070" }} />{Array.from({ length: 5 }).map((_, i) => <path key={i} d={`M${240 + i * 25} 380 q8 -20 0 -40`} style={{ ...st, stroke: "#ff7030" }} />)}{lab(340, 210, "DOOR", 30)}{lab(500, 110, "TUBES → BELLOW", 40)}{lab(330, 370, "FIRE", 50)}</>,
  };
  return <div style={{ position: "absolute", right: 120, top: 150, width: 660, opacity: a * o, transform: `translateY(${(1 - a) * 30}px)` }}>
    <div style={{ background: "linear-gradient(160deg,#0e2a4a,#081a30)", border: "2px solid #6a9ad0", borderRadius: 12, padding: "16px 20px", boxShadow: "0 20px 50px rgba(0,0,0,0.6)", backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "26px 26px" }}>
      <div style={{ ...OS(24, 600), color: "#9ac4f0", letterSpacing: 6 }}>HOW IT WORKED · {title}</div>
      <svg width={620} height={400}>{D[kind]}</svg>
    </div>
  </div>;
};

/* ---------- red ink annotations drawn over the scene ---------- */
export type InkShape = { t: "circle" | "arrow"; x: number; y: number; r?: number; x2?: number; y2?: number; label?: string; at?: number };
export const Ink: React.FC<{ f: number; len: number; shapes: InkShape[] }> = ({ f, len, shapes }) => {
  if (f < 0 || f > len) return null;
  const o = out(f, len, 10);
  return <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, opacity: o }}>
    <filter id="inkR"><feTurbulence baseFrequency="0.04" numOctaves="2" seed="3" /><feDisplacementMap in="SourceGraphic" scale="4" /></filter>
    {shapes.map((s, i) => { const k = interpolate(f, [(s.at ?? 0), (s.at ?? 0) + 14], [0, 1], { ...clamp, easing: eo }); const len2 = 900;
      return <g key={i} filter="url(#inkR)">
        {s.t === "circle" ? <ellipse cx={s.x} cy={s.y} rx={s.r ?? 60} ry={(s.r ?? 60) * 0.8} fill="none" stroke="#e01828" strokeWidth={6} strokeLinecap="round" strokeDasharray={len2} strokeDashoffset={len2 * (1 - k)} transform={`rotate(-8 ${s.x} ${s.y})`} />
          : <><path d={`M${s.x} ${s.y} Q${(s.x + (s.x2 ?? s.x)) / 2 + 30} ${(s.y + (s.y2 ?? s.y)) / 2 - 30} ${s.x2} ${s.y2}`} fill="none" stroke="#e01828" strokeWidth={6} strokeLinecap="round" strokeDasharray={len2} strokeDashoffset={len2 * (1 - k)} />
            <path d={`M${s.x2! - 18} ${s.y2! - 8} L${s.x2} ${s.y2} L${s.x2! - 8} ${s.y2! - 20}`} fill="none" stroke="#e01828" strokeWidth={6} strokeLinecap="round" opacity={k > 0.9 ? 1 : 0} /></>}
        {s.label && <text x={s.t === "circle" ? s.x + (s.r ?? 60) + 14 : s.x - 10} y={s.t === "circle" ? s.y - (s.r ?? 60) * 0.6 : s.y - 16} fill="#ff3040" fontFamily="Playfair Display" fontStyle="italic" fontWeight={700} fontSize={40} opacity={k} style={{ paintOrder: "stroke", stroke: "#000", strokeWidth: 6 }}>{s.label}</text>}
      </g>; })}
  </svg>;
};

/* ---------- tally marks scratched on stone (days) ---------- */
export const Tally: React.FC<{ f: number; len: number; n: number }> = ({ f, len, n }) => {
  if (f < 0 || f > len) return null;
  const a = pop(f, 0, 12), o = out(f, len, 10);
  return <div style={{ position: "absolute", left: 90, top: 110, padding: "18px 26px", background: "linear-gradient(160deg,#4a4640,#2a2824)", borderRadius: 10, boxShadow: "inset 0 0 30px rgba(0,0,0,0.6), 0 12px 30px rgba(0,0,0,0.5)", opacity: a * o }}>
    <div style={{ ...OS(22, 600), color: "#d8ccb8", letterSpacing: 6, marginBottom: 8 }}>DAY {n}</div>
    <svg width={420} height={80}>{Array.from({ length: n }).map((_, i) => { const g = Math.floor(i / 5), j = i % 5, x = 10 + g * 100 + j * 16; const jx = (random("tx" + i) - 0.5) * 4;
      return j < 4 ? <path key={i} d={`M${x + jx} 12 L${x - jx} 70`} stroke="#efe6d2" strokeWidth={5} strokeLinecap="round" /> : <path key={i} d={`M${x - 70} 60 L${x + 6} 20`} stroke="#efe6d2" strokeWidth={5} strokeLinecap="round" />; })}</svg>
  </div>;
};

/* ---------- heartbeat line along the bottom ---------- */
export const ECG: React.FC<{ f: number; len: number; bpm?: number; flat?: number }> = ({ f, len, bpm = 110, flat = -1 }) => {
  if (f < 0 || f > len) return null;
  const o = Math.min(pop(f, 0, 12), out(f, len, 12)), per = 1800 / bpm, pts: string[] = [];
  for (let x = 0; x <= W; x += 6) { const t = f - (W - x) / 14; const ph = ((t % per) + per) % per; let y = 0; const dead = flat >= 0 && t > flat;
    if (!dead) { if (ph > 6 && ph < 8) y = -10; else if (ph > 9 && ph < 10.5) y = 26; else if (ph > 10.5 && ph < 12) y = -70; else if (ph > 12 && ph < 13.5) y = 30; else if (ph > 18 && ph < 22) y = -12; }
    pts.push(`${x},${1000 + y}`); }
  return <svg width={W} height={H} style={{ position: "absolute", left: 0, top: -110, opacity: o * 0.8 }}><polyline points={pts.join(" ")} fill="none" stroke="#ff2a3a" strokeWidth={3} style={{ filter: "drop-shadow(0 0 6px #ff2a3a)" }} /></svg>;
};

/* ---------- poll: would you confess? ---------- */
export const Poll: React.FC<{ f: number; len: number; q: string; ans: string }> = ({ f, len, q, ans }) => {
  if (f < 0 || f > len) return null;
  const a = pop(f, 0, 12), o = out(f, len, 10), cd = Math.max(0, 3 - Math.floor(f / 18)), rv = pop(f, 54, 12);
  const btn = (t: string, hl: boolean) => <div style={{ width: 280, padding: "22px 0", textAlign: "center", borderRadius: 14, border: `3px solid ${hl ? "#ff5a6a" : "rgba(255,255,255,0.4)"}`, background: hl ? "linear-gradient(180deg,#a8102a,#5a0612)" : "rgba(14,14,16,0.85)", ...OS(56, 700), color: "#fff" }}>{t}</div>;
  return <AbsoluteFill style={{ opacity: o }}>
    <AbsoluteFill style={{ background: `rgba(0,0,0,${0.55 * a})` }} />
    <div style={{ position: "absolute", top: 230, width: "100%", textAlign: "center", ...PF, fontSize: 88, color: "#fff", opacity: a, textShadow: "0 6px 30px #000" }}>{q}</div>
    <div style={{ position: "absolute", top: 420, width: "100%", display: "flex", justifyContent: "center", gap: 60, opacity: a }}>{btn("YES", rv > 0.5)}{btn("NO", false)}</div>
    <div style={{ position: "absolute", top: 600, width: "100%", textAlign: "center", ...OS(80, 700), color: rv > 0 ? "#ff4a5a" : "#fff", opacity: a }}>{rv > 0 ? ans : cd}</div>
  </AbsoluteFill>;
};

/* ---------- subscribe nudge: a button lowered on a rope (smooth, no bounce) ---------- */
export const SubNudge: React.FC<{ f: number; len: number }> = ({ f, len }) => {
  if (f < 0 || f > len) return null;
  const d = interpolate(f, [0, 22], [-260, 0], { ...clamp, easing: eo }), up = interpolate(f, [len - 20, len], [0, -300], clamp), click = f > 46 && f < 56;
  return <div style={{ position: "absolute", right: 260, top: d + up, width: 300, display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={{ width: 6, height: 200, background: "repeating-linear-gradient(180deg,#b89a60 0 10px,#8a7040 10px 20px)" }} />
    <div style={{ padding: "18px 34px", borderRadius: 12, background: click || f > 56 ? "#3a3a3e" : RED, ...OS(40, 700), color: "#fff", boxShadow: "0 14px 30px rgba(0,0,0,0.6)", transform: `scale(${click ? 0.94 : 1})` }}>{f > 56 ? "SUBSCRIBED" : "SUBSCRIBE"}</div>
  </div>;
};

/* ---------- small source citation ---------- */
export const Source: React.FC<{ f: number; len: number; t: string }> = ({ f, len, t }) => (f < 0 || f > len ? null : <div style={{ position: "absolute", right: 40, bottom: 18, fontFamily: "Inter", fontWeight: 500, fontSize: 20, color: "rgba(255,255,255,0.6)", opacity: Math.min(pop(f, 0, 10), out(f, len, 10)) }}>Source: {t}</div>);

/* ---------- letterbox for death / climax moments ---------- */
export const Letterbox: React.FC<{ k: number }> = ({ k }) => k <= 0 ? null : <>
  <div style={{ position: "absolute", left: 0, top: 0, width: W, height: 110 * k, background: "#000" }} />
  <div style={{ position: "absolute", left: 0, bottom: 0, width: W, height: 110 * k, background: "#000" }} />
</>;

/* ---------- film burn between floors ---------- */
export const Burn: React.FC<{ f: number; len?: number }> = ({ f, len = 24 }) => {
  if (f < 0 || f > len) return null;
  const k = Math.sin((f / len) * Math.PI);
  return <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none" }}>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${30 + f * 2}% 60%, rgba(255,170,60,${0.9 * k}), rgba(255,60,10,${0.5 * k}) 35%, transparent 70%)` }} />
    <AbsoluteFill style={{ background: `radial-gradient(circle at 80% 20%, rgba(255,230,180,${0.6 * k}), transparent 40%)` }} />
  </AbsoluteFill>;
};

/* ---------- floor board: 3 floors, 7 locked slots ---------- */
export const FLOORS: [string, string[]][] = [["THE CELLS", ["The Water Drop", "The Rat", "The Strappado"]], ["THE CHAMBER", ["The Rack", "The Breaking Wheel", "The Brazen Bull"]], ["THE PIT", ["Scaphism"]]];
export const FloorBoard: React.FC<{ f: number; len: number; reveal: number; hl?: number; x?: number; title?: string }> = ({ f, len, reveal, hl = -1, x = 1160, title = "THE DUNGEON" }) => {
  if (f < 0 || f > len) return null;
  const o = Math.min(pop(f, 0, 12), out(f, len, 10)); let idx = 0;
  return <div style={{ position: "absolute", left: x, top: 120, width: 640, opacity: o }}>
    <div style={{ ...OS(40, 700), color: "#fff", marginBottom: 14, letterSpacing: 4, textShadow: "0 4px 16px #000" }}>{title}</div>
    {FLOORS.map(([fname, items], fi) => <div key={fi} style={{ marginBottom: 14 }}>
      <div style={{ ...OS(22, 600), color: FLOORCOL[fi], letterSpacing: 5, marginBottom: 6 }}>FLOOR -{fi + 1} · {fname}</div>
      {items.map((name) => { const i = idx++; const r = pop(f, 4 + i * 4, 10), open = i < reveal, isHl = i === hl;
        return <div key={i} style={{ display: "flex", alignItems: "center", height: 62, marginBottom: 8, borderRadius: 10, background: isHl ? `linear-gradient(90deg, ${RED}, #6a0612)` : "rgba(14,12,12,0.84)", border: `2px solid ${isHl ? "#ff7080" : "rgba(255,255,255,0.12)"}`, transform: `translateX(${(1 - r) * 60}px)`, opacity: r }}>
          <div style={{ width: 64, textAlign: "center", ...OS(34, 700), color: isHl ? "#fff" : FLOORCOL[fi] }}>{i + 1}</div>
          <div style={{ flex: 1, ...OS(32, open ? 600 : 500), color: open ? "#fff" : "rgba(255,255,255,0.35)", letterSpacing: open ? 1 : 8 }}>{open ? name : "? ? ? ? ?"}</div>
          <div style={{ width: 60, display: "flex", justifyContent: "center", opacity: open ? 0 : 0.6 }}><Icon k="lock" s={28} /></div>
        </div>; })}
    </div>)}
  </div>;
};

/* ---------- parchment card with engraved portrait, wax seal and myth/real pill ---------- */
export const Card3: React.FC<{ f: number; len: number; kicker: string; title: string; body?: string; portrait?: "man" | "hat" | "crown" | "laurel" | "turban" | "cap"; pill?: "REAL" | "LEGEND" | "MYTH"; side?: "l" | "r"; y?: number }> = ({ f, len, kicker, title, body, portrait, pill, side = "r", y = 230 }) => {
  if (f < 0 || f > len) return null;
  const a = pop(f, 0, 14), o = out(f, len, 10), w = 660, left = side === "r" ? W - w - 200 : 110;
  const seal = interpolate(f, [24, 30], [2.2, 1], { ...clamp, easing: eo }), sealO = interpolate(f, [24, 27], [0, 1], clamp);
  return <div style={{ position: "absolute", left, top: y, width: w, opacity: a * o, transform: `translateY(${(1 - a) * 30}px) rotate(${(1 - a) * (side === "r" ? 2 : -2)}deg)` }}>
    <div style={{ background: "linear-gradient(160deg, #efe2c4, #d8c49c)", borderRadius: 6, padding: "30px 36px 34px", boxShadow: "0 24px 60px rgba(0,0,0,0.65), inset 0 0 60px rgba(120,80,30,0.35)", display: "flex", gap: 26, position: "relative" }}>
      {portrait && <svg width={130} height={160} viewBox="0 0 130 160" style={{ flexShrink: 0 }}>
        <defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0 L0 6" stroke="#3a2a1a" strokeWidth="1.4" /></pattern></defs>
        <rect x="2" y="2" width="126" height="156" fill="none" stroke="#3a2a1a" strokeWidth="3" />
        <ellipse cx="65" cy="70" rx="30" ry="36" fill="url(#hatch)" stroke="#2a1a10" strokeWidth="2.5" />
        <path d="M18 158 Q22 112 65 108 Q108 112 112 158" fill="url(#hatch)" stroke="#2a1a10" strokeWidth="2.5" />
        {portrait === "hat" && <><ellipse cx="65" cy="40" rx="50" ry="8" fill="#2a1a10" /><rect x="42" y="12" width="46" height="28" rx="4" fill="#2a1a10" /></>}
        {portrait === "crown" && <path d="M35 40 L40 18 L52 32 L65 12 L78 32 L90 18 L95 40 Z" fill="#8a6a20" stroke="#2a1a10" strokeWidth="2" />}
        {portrait === "laurel" && Array.from({ length: 9 }).map((_, i) => <ellipse key={i} cx={38 + i * 7} cy={38 - Math.sin((i / 8) * Math.PI) * 8} rx="5" ry="3" fill="#5a6a2a" />)}
        {portrait === "turban" && <ellipse cx="65" cy="40" rx="36" ry="20" fill="#d8c8a8" stroke="#2a1a10" strokeWidth="2.5" />}
        {portrait === "cap" && <path d="M33 50 Q65 10 97 50 Z" fill="#7a1212" stroke="#2a1a10" strokeWidth="2" />}
        {(portrait === "hat" || portrait === "laurel") && <path d="M50 92 Q65 112 80 92" fill="#2a1a10" />}
      </svg>}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ ...OS(22, 600), color: "#7a1a14", letterSpacing: 5 }}>{kicker}</div>
          {pill && <div style={{ ...OS(18, 700), color: "#fff", background: pill === "REAL" ? "#2a6a3a" : pill === "LEGEND" ? "#8a6a1a" : RED, padding: "3px 10px", borderRadius: 6, letterSpacing: 3 }}>{pill}</div>}</div>
        <div style={{ ...PF, fontSize: 56, color: "#1e140c", marginTop: 8, lineHeight: 1.05 }}>{title}</div>
        {body && <div style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 26, color: "#3a2a1a", marginTop: 14, lineHeight: 1.35 }}>{body}</div>}
      </div>
      <div style={{ position: "absolute", right: -18, bottom: -18, width: 70, height: 70, borderRadius: 35, background: "radial-gradient(circle at 40% 35%, #c8202c, #6a0a10)", boxShadow: "0 4px 10px rgba(0,0,0,0.5), inset 0 -4px 8px rgba(0,0,0,0.4)", transform: `scale(${seal})`, opacity: sealO, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon k="skull" s={34} c="#4a0006" /></div>
    </div>
  </div>;
};

/* ---------- end screen sized for YouTube end-screen elements ---------- */
export const EndScreen3: React.FC<{ f: number; askAt: number; nextAt: number }> = ({ f, askAt, nextAt }) => {
  const a = pop(f, askAt, 12), n = pop(f, nextAt, 14);
  const box = (x: number, t1: string, t2: string) => <div style={{ position: "absolute", left: x, top: 330, width: 700, height: 394, borderRadius: 14, border: `4px solid ${RED}`, background: "linear-gradient(135deg,#1a1210,#050404)", boxShadow: "0 0 40px rgba(208,20,44,0.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: n, transform: `scale(${0.94 + n * 0.06})` }}>
    <div style={{ ...OS(60, 700), color: "#fff", textAlign: "center", lineHeight: 1.05 }}>{t1}<br /><span style={{ color: RED }}>{t2}</span></div></div>;
  return <AbsoluteFill>
    {f >= askAt && f < nextAt + 10 && <div style={{ position: "absolute", left: 120, top: 760, display: "flex", alignItems: "center", gap: 22, padding: "20px 34px", background: "rgba(10,10,12,0.88)", borderRadius: 18, border: "2px solid rgba(255,255,255,0.2)", opacity: a * (1 - n) }}>
      <Icon k="skull" s={56} c={RED} /><div><div style={{ ...OS(28, 600), color: "#c8b8a0", letterSpacing: 5 }}>COMMENT BELOW</div><div style={{ ...OS(54, 700), color: "#fff" }}>Which one would you never survive?</div></div></div>}
    {f >= nextAt && <>
      <AbsoluteFill style={{ background: `rgba(0,0,0,${0.6 * n})` }} />
      <div style={{ position: "absolute", top: 200, width: "100%", textAlign: "center", ...OS(60, 700), color: "#fff", opacity: n, letterSpacing: 6 }}>WATCH NEXT</div>
      {box(170, "ONE NIGHT IN A", "MEDIEVAL DUNGEON")}{box(1050, "THE WORST PRISONS", "IN HISTORY")}
      <div style={{ position: "absolute", left: W / 2 - 80, top: 800, width: 160, height: 160, borderRadius: 80, border: "4px dashed rgba(255,255,255,0.5)", opacity: n, display: "flex", alignItems: "center", justifyContent: "center", ...OS(26, 600), color: "#fff" }}>SUBSCRIBE</div>
    </>}
  </AbsoluteFill>;
};
