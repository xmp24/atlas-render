import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import "@fontsource/oswald/500.css";
import "@fontsource/oswald/600.css";
import "@fontsource/oswald/700.css";
import "@fontsource/playfair-display/700-italic.css";
import "@fontsource/playfair-display/400-italic.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";
import { clamp, eo, W, H } from "./Common";
import WORDS from "./words.json";

export const RED = "#d0142c", GOLD = "#e0b04a", INK = "#0c0c0e", BONE = "#efe6d2";
const pop = (f: number, a: number, d = 10) => interpolate(f, [a, a + d], [0, 1], { ...clamp, easing: eo });
const out = (f: number, b: number, d = 8) => interpolate(f, [b - d, b], [1, 0], clamp);
const OS = (size: number, w = 700): React.CSSProperties => ({ fontFamily: "Oswald", fontWeight: w, fontSize: size, lineHeight: 1.0, textTransform: "uppercase", letterSpacing: 1 });

/* ---------- icons ---------- */
export const Icon: React.FC<{ k: string; s?: number; c?: string }> = ({ k, s = 40, c = "#fff" }) => {
  const P: Record<string, React.ReactNode> = {
    lock: <><rect x="6" y="16" width="28" height="20" rx="4" fill={c} /><path d="M12 16 V11 a8 8 0 0 1 16 0 V16" stroke={c} strokeWidth="4.5" fill="none" /><circle cx="20" cy="25" r="3" fill={INK} /></>,
    pin: <><path d="M20 38 C12 26 7 20 7 14 a13 13 0 0 1 26 0 c0 6 -5 12 -13 24z" fill={c} /><circle cx="20" cy="14" r="5" fill={INK} /></>,
    skull: <><path d="M20 4 C10 4 5 11 5 18 c0 5 2 8 5 10 v6 h20 v-6 c3 -2 5 -5 5 -10 C35 11 30 4 20 4z" fill={c} /><circle cx="13.5" cy="19" r="4" fill={INK} /><circle cx="26.5" cy="19" r="4" fill={INK} /><path d="M20 23 l-2.5 4 h5z" fill={INK} /><path d="M14 34 v-4 M20 34 v-4 M26 34 v-4" stroke={INK} strokeWidth="2" /></>,
    drop: <path d="M20 4 C14 14 9 20 9 26 a11 11 0 0 0 22 0 c0 -6 -5 -12 -11 -22z" fill={c} />,
    clock: <><circle cx="20" cy="20" r="15" stroke={c} strokeWidth="4" fill="none" /><path d="M20 11 V20 L27 24" stroke={c} strokeWidth="4" fill="none" strokeLinecap="round" /></>,
    book: <><path d="M6 8 h11 a4 4 0 0 1 3 2 a4 4 0 0 1 3 -2 h11 v24 h-11 a4 4 0 0 0 -3 2 a4 4 0 0 0 -3 -2 h-11z" fill={c} /><path d="M20 10 V34" stroke={INK} strokeWidth="2" /></>,
    scroll: <><rect x="8" y="7" width="24" height="26" rx="2" fill={c} /><path d="M13 14 h14 M13 19 h14 M13 24 h10" stroke={INK} strokeWidth="2.5" /></>,
    crown: <path d="M5 30 L8 12 L15 20 L20 8 L25 20 L32 12 L35 30z" fill={c} />,
    eye: <><path d="M3 20 C10 9 30 9 37 20 C30 31 10 31 3 20z" fill={c} /><circle cx="20" cy="20" r="6" fill={INK} /></>,
    tv: <><rect x="4" y="9" width="32" height="22" rx="3" fill={c} /><path d="M14 4 L20 9 L26 4" stroke={c} strokeWidth="3" fill="none" /><rect x="8" y="13" width="24" height="14" rx="1.5" fill={INK} /></>,
    sun: <><circle cx="20" cy="20" r="8" fill={c} />{Array.from({ length: 8 }).map((_, i) => <path key={i} d="M20 3 V8" stroke={c} strokeWidth="3.5" strokeLinecap="round" transform={`rotate(${i * 45} 20 20)`} />)}</>,
    moon: <path d="M26 5 a15 15 0 1 0 9 22 a12 12 0 1 1 -9 -22z" fill={c} />,
    q: <text x="20" y="31" textAnchor="middle" fontFamily="Oswald" fontWeight="700" fontSize="30" fill={c}>?</text>,
  };
  return <svg width={s} height={s} viewBox="0 0 40 40" style={{ display: "block" }}>{P[k]}</svg>;
};

/* ---------- subtitles (bottom, 1-4 words, current word in a red pill) ---------- */
export const Subs: React.FC<{ hide?: [number, number][] }> = ({ hide = [] }) => {
  const f = useCurrentFrame();
  if (hide.some(([a, b]) => f >= a && f < b)) return null;
  const words = WORDS as { w: string; a: number; b: number; k: boolean; g: number }[];
  const i = words.findIndex((x) => f >= x.a - 3 && f < x.b + 6);
  if (i < 0) return null;
  const grp = words.filter((x) => x.g === words[i].g);
  const o = interpolate(f, [grp[grp.length - 1].b + 2, grp[grp.length - 1].b + 6], [1, 0], clamp);
  let ci = -1; grp.forEach((y, k) => { if (f >= y.a) ci = k; });
  return (
    <div style={{ position: "absolute", bottom: 96, width: "100%", textAlign: "center", opacity: o }}>
      {grp.map((x, j) => {
        const ap = interpolate(f, [x.a - 3, x.a + 2], [0, 1], { ...clamp, easing: eo }), cur = j === ci && f < x.b + 4;
        return <span key={j} style={{ display: "inline-block", margin: "0 7px", padding: "2px 14px 8px", borderRadius: 12, background: cur ? `linear-gradient(180deg, #ff2a40, #a80c1e)` : "transparent",
          boxShadow: cur ? "0 8px 22px rgba(200,16,46,0.45), inset 0 2px 0 rgba(255,255,255,0.25)" : "none", ...OS(70), opacity: ap, transform: `translateY(${(1 - ap) * 12}px)`,
          color: cur ? "#fff" : x.k ? "#ff5a5a" : "#fff", WebkitTextStroke: cur ? "0px" : `8px ${INK}`, paintOrder: "stroke fill", textShadow: cur ? "none" : "0 4px 14px rgba(0,0,0,0.9)" }}>{x.w}</span>;
      })}
    </div>
  );
};

/* ---------- chapter bar across the top: 7 notches counting down ---------- */
export const ChapterBar: React.FC<{ marks: number[]; total: number; show: [number, number] }> = ({ marks, total, show }) => {
  const f = useCurrentFrame(); if (f < show[0] || f > show[1]) return null;
  const o = Math.min(pop(f, show[0], 15), out(f, show[1], 15));
  return <div style={{ position: "absolute", top: 26, left: 120, right: 120, height: 34, opacity: o }}>
    <div style={{ position: "absolute", top: 15, left: 0, right: 0, height: 4, background: "rgba(255,255,255,0.15)", borderRadius: 2 }} />
    <div style={{ position: "absolute", top: 15, left: 0, width: `${(f / total) * 100}%`, height: 4, background: `linear-gradient(90deg,#7a0a16,${RED})`, boxShadow: `0 0 10px ${RED}`, borderRadius: 2 }} />
    {marks.map((m, i) => { const on = f >= m; return <div key={i} style={{ position: "absolute", left: `${(m / total) * 100}%`, top: 0, transform: "translateX(-50%)", width: 34, height: 34, borderRadius: 17, background: on ? RED : "rgba(20,20,22,0.85)", border: `2px solid ${on ? "#ff6a7a" : "rgba(255,255,255,0.35)"}`, display: "flex", alignItems: "center", justifyContent: "center", ...OS(20, 600), color: "#fff" }}>{7 - i}</div>; })}
  </div>;
};

/* ---------- big numbered title card ---------- */
export const TitleCard: React.FC<{ f: number; n: number; name: string; sub: string; len?: number }> = ({ f, n, name, sub, len = 110 }) => {
  if (f < 0 || f > len) return null;
  const a = pop(f, 0, 12), b = pop(f, 6, 12), c = pop(f, 14, 12), o = out(f, len, 12);
  const skulls = 8 - n;
  return <AbsoluteFill style={{ opacity: o }}>
    <AbsoluteFill style={{ background: `linear-gradient(90deg, rgba(0,0,0,${0.72 * a}) 0%, rgba(0,0,0,${0.35 * a}) 45%, rgba(0,0,0,0) 70%)` }} />
    <div style={{ position: "absolute", left: 120, top: 300, display: "flex", alignItems: "center" }}>
      <div style={{ ...OS(300, 700), color: RED, transform: `translateX(${(1 - a) * -80}px)`, opacity: a, textShadow: "0 12px 40px rgba(0,0,0,0.7)", WebkitTextStroke: "3px #4a0008" }}>#{n}</div>
      <div style={{ marginLeft: 40, borderLeft: `6px solid ${RED}`, paddingLeft: 34, transform: `translateX(${(1 - b) * 60}px)`, opacity: b }}>
        <div style={{ ...OS(34, 500), color: "#c8b8a0", letterSpacing: 6 }}>{sub}</div>
        <div style={{ ...OS(124, 700), color: "#fff", marginTop: 6, textShadow: "0 8px 30px rgba(0,0,0,0.8)" }}>{name}</div>
        <div style={{ display: "flex", gap: 10, marginTop: 20, alignItems: "center", opacity: c }}>
          <div style={{ ...OS(24, 600), color: "#c8b8a0", letterSpacing: 4, marginRight: 8 }}>CRUELTY</div>
          {Array.from({ length: 7 }).map((_, i) => <div key={i} style={{ opacity: i < skulls ? 1 : 0.22, transform: `scale(${i < skulls ? interpolate(f, [16 + i * 3, 22 + i * 3], [0.4, 1], clamp) : 1})` }}><Icon k="skull" s={40} c={i < skulls ? RED : "#fff"} /></div>)}
        </div>
      </div>
    </div>
  </AbsoluteFill>;
};

/* ---------- ranking board (7 slots, locked until revealed) ---------- */
export const RANK = [["7", "The Strappado"], ["6", "The Rat"], ["5", "The Water Drop"], ["4", "The Rack"], ["3", "The Breaking Wheel"], ["2", "The Brazen Bull"], ["1", "Scaphism"]];
export const RankBoard: React.FC<{ f: number; reveal: number; len: number; hl?: number; title?: string; x?: number }> = ({ f, reveal, len, hl = -1, title = "THE 7 CRUELEST TORTURES", x = 1180 }) => {
  if (f < 0 || f > len) return null;
  const o = Math.min(pop(f, 0, 12), out(f, len, 10));
  return <div style={{ position: "absolute", left: x, top: 150, width: 620, opacity: o }}>
    <div style={{ ...OS(40, 700), color: "#fff", marginBottom: 18, letterSpacing: 2, textShadow: "0 4px 16px #000" }}>{title}</div>
    {RANK.map(([n, name], i) => { const r = pop(f, 4 + i * 4, 10), open = i < reveal, isHl = i === hl; const shake = isHl ? Math.sin(f / 2) * 1.5 : 0;
      return <div key={i} style={{ display: "flex", alignItems: "center", height: 84, marginBottom: 12, borderRadius: 12, background: isHl ? `linear-gradient(90deg, ${RED}, #6a0612)` : "rgba(14,12,12,0.82)", border: `2px solid ${isHl ? "#ff7080" : "rgba(255,255,255,0.12)"}`,
        transform: `translateX(${(1 - r) * 60 + shake}px)`, opacity: r, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
        <div style={{ width: 90, ...OS(50, 700), color: isHl ? "#fff" : RED, textAlign: "center" }}>{n}</div>
        <div style={{ flex: 1, ...OS(40, open ? 600 : 500), color: open ? "#fff" : "rgba(255,255,255,0.35)", letterSpacing: open ? 1 : 8, filter: open ? undefined : "blur(1px)" }}>{open ? name : "? ? ? ? ?"}</div>
        <div style={{ width: 70, display: "flex", justifyContent: "center", opacity: open ? 0 : 0.6 }}><Icon k="lock" s={34} /></div>
      </div>; })}
  </div>;
};

/* ---------- place / date tag (lower left) ---------- */
export const Tag: React.FC<{ f: number; len: number; place: string; date?: string; icon?: string }> = ({ f, len, place, date, icon = "pin" }) => {
  if (f < 0 || f > len) return null;
  const a = pop(f, 0, 12), o = out(f, len, 10);
  return <div style={{ position: "absolute", left: 90, top: 90, display: "flex", alignItems: "center", opacity: a * o, transform: `translateY(${(1 - a) * -20}px)` }}>
    <div style={{ width: 70, height: 70, borderRadius: 10, background: RED, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}><Icon k={icon} s={44} /></div>
    <div style={{ marginLeft: 18, padding: "8px 22px", background: "rgba(10,10,12,0.8)", borderRadius: 10, borderLeft: `4px solid ${RED}` }}>
      <div style={{ ...OS(40, 700), color: "#fff" }}>{place}</div>
      {date && <div style={{ ...OS(26, 500), color: "#c8b8a0", letterSpacing: 4, marginTop: 4 }}>{date}</div>}
    </div>
  </div>;
};

/* ---------- parchment info card ---------- */
export const Card: React.FC<{ f: number; len: number; kicker: string; title: string; body?: string; icon?: string; x?: number; y?: number; w?: number; side?: "l" | "r" }> = ({ f, len, kicker, title, body, icon = "scroll", x, y = 250, w = 640, side = "r" }) => {
  if (f < 0 || f > len) return null;
  const a = pop(f, 0, 14), o = out(f, len, 10), left = x ?? (side === "r" ? W - w - 120 : 120);
  return <div style={{ position: "absolute", left, top: y, width: w, opacity: a * o, transform: `translateY(${(1 - a) * 30}px) rotate(${(1 - a) * (side === "r" ? 2 : -2)}deg)` }}>
    <div style={{ background: `linear-gradient(160deg, #efe2c4, #d8c49c)`, borderRadius: 6, padding: "34px 40px 36px", boxShadow: "0 24px 60px rgba(0,0,0,0.65), inset 0 0 60px rgba(120,80,30,0.35)", position: "relative" }}>
      <div style={{ position: "absolute", top: -26, left: 34, width: 60, height: 60, borderRadius: 30, background: RED, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px rgba(0,0,0,0.4)" }}><Icon k={icon} s={36} /></div>
      <div style={{ ...OS(24, 600), color: "#7a1a14", letterSpacing: 5, marginTop: 8 }}>{kicker}</div>
      <div style={{ fontFamily: "Playfair Display", fontStyle: "italic", fontWeight: 700, fontSize: 62, color: "#1e140c", marginTop: 8, lineHeight: 1.05 }}>{title}</div>
      {body && <div style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 28, color: "#3a2a1a", marginTop: 16, lineHeight: 1.35 }}>{body}</div>}
    </div>
  </div>;
};

/* ---------- rubber stamp ---------- */
export const Stamp: React.FC<{ f: number; len: number; text: string; color?: string; x?: number; y?: number; rot?: number; size?: number }> = ({ f, len, text, color = RED, x = W / 2, y = H / 2 - 40, rot = -10, size = 170 }) => {
  if (f < 0 || f > len) return null;
  const k = interpolate(f, [0, 6], [2.4, 1], { ...clamp, easing: eo }), a = interpolate(f, [0, 4], [0, 1], clamp), o = out(f, len, 10);
  return <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${k})`, opacity: a * o }}>
    <div style={{ ...OS(size, 700), color, border: `12px solid ${color}`, borderRadius: 18, padding: "10px 44px 18px", letterSpacing: 8, maskImage: "radial-gradient(circle at 30% 40%, #000 60%, rgba(0,0,0,0.75) 100%)", textShadow: "0 0 1px rgba(0,0,0,0.3)", background: "rgba(0,0,0,0.25)" }}>{text}</div>
  </div>;
};

/* ---------- big centered statement ---------- */
export const Big: React.FC<{ f: number; len: number; text: string; sub?: string; color?: string; y?: number; size?: number }> = ({ f, len, text, sub, color = "#fff", y = 380, size = 170 }) => {
  if (f < 0 || f > len) return null;
  const a = pop(f, 0, 10), o = out(f, len, 10), b = pop(f, 8, 12);
  return <div style={{ position: "absolute", top: y, width: "100%", textAlign: "center", opacity: o }}>
    <div style={{ ...OS(size, 700), color, transform: `scale(${0.85 + a * 0.15})`, opacity: a, textShadow: "0 10px 40px rgba(0,0,0,0.85)", WebkitTextStroke: `4px ${INK}`, paintOrder: "stroke fill" }}>{text}</div>
    {sub && <div style={{ ...OS(48, 600), color: "#d8c8b0", letterSpacing: 10, marginTop: 18, opacity: b }}>{sub}</div>}
  </div>;
};

/* ---------- day/hour counter ---------- */
export const Counter: React.FC<{ f: number; len: number; label: string; value: number; icon?: string; x?: number; y?: number }> = ({ f, len, label, value, icon = "clock", x = 90, y = 90 }) => {
  if (f < 0 || f > len) return null;
  const a = pop(f, 0, 10), o = out(f, len, 10);
  return <div style={{ position: "absolute", left: x, top: y, display: "flex", alignItems: "center", gap: 18, padding: "14px 30px 14px 20px", background: "rgba(10,10,12,0.85)", borderRadius: 14, border: `2px solid ${RED}`, opacity: a * o, boxShadow: "0 10px 30px rgba(0,0,0,0.6)" }}>
    <Icon k={icon} s={54} c={RED} />
    <div><div style={{ ...OS(24, 600), color: "#c8b8a0", letterSpacing: 5 }}>{label}</div><div style={{ ...OS(76, 700), color: "#fff", marginTop: 2 }}>{value}</div></div>
  </div>;
};

/* ---------- two-column comparison (TV test) ---------- */
export const Split: React.FC<{ f: number; len: number; l: [string, string, string]; r: [string, string, string]; at: number }> = ({ f, len, l, r, at }) => {
  if (f < 0 || f > len) return null;
  const a = pop(f, 0, 12), b = pop(f, at, 12), o = out(f, len, 10);
  const box = (k: number, [ic, h, t]: [string, string, string], bad: boolean) => <div style={{ width: 600, padding: "36px 40px", borderRadius: 16, background: bad ? `linear-gradient(180deg, #8a0a1a, #3a040a)` : "rgba(20,22,26,0.9)", border: `3px solid ${bad ? "#ff5a6a" : "rgba(255,255,255,0.2)"}`, opacity: k, transform: `translateY(${(1 - k) * 40}px)`, boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }}>
    <Icon k={ic} s={70} c={bad ? "#fff" : "#9ab"} />
    <div style={{ ...OS(54, 700), color: "#fff", marginTop: 14 }}>{h}</div>
    <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 34, color: bad ? "#ffd0d4" : "#aab4be", marginTop: 10 }}>{t}</div>
  </div>;
  return <AbsoluteFill style={{ opacity: o }}>
    <AbsoluteFill style={{ background: `rgba(0,0,0,${0.5 * a})` }} />
    <div style={{ position: "absolute", top: 130, width: "100%", textAlign: "center", ...OS(46, 600), color: "#c8b8a0", letterSpacing: 8, opacity: a }}><span style={{ display: "inline-flex", alignItems: "center", gap: 16 }}><Icon k="tv" s={50} c="#c8b8a0" />THE TV EXPERIMENT</span></div>
    <div style={{ position: "absolute", top: 250, width: "100%", display: "flex", justifyContent: "center", gap: 60 }}>{box(a, l, false)}{box(b, r, true)}</div>
  </AbsoluteFill>;
};

/* ---------- Guy Fawkes signatures ---------- */
export const Signatures: React.FC<{ f: number; len: number; at: number }> = ({ f, len, at }) => {
  if (f < 0 || f > len) return null;
  const a = pop(f, 0, 14), o = out(f, len, 10), wr = interpolate(f, [8, 50], [0, 100], clamp), wr2 = interpolate(f, [at, at + 40], [0, 100], clamp);
  const sheet = (k: number, children: React.ReactNode, label: string, rot: number) => <div style={{ width: 720, height: 360, background: "linear-gradient(160deg,#eadcbc,#d2bd92)", borderRadius: 4, boxShadow: "0 24px 60px rgba(0,0,0,0.65), inset 0 0 80px rgba(120,80,30,0.4)", position: "relative", opacity: k, transform: `rotate(${rot}deg) translateY(${(1 - k) * 40}px)` }}>
    <div style={{ position: "absolute", top: 24, left: 32, ...OS(26, 600), color: "#7a1a14", letterSpacing: 6 }}>{label}</div>
    {Array.from({ length: 5 }).map((_, i) => <div key={i} style={{ position: "absolute", left: 40, right: 40, top: 80 + i * 22, height: 4, background: "rgba(60,40,20,0.12)", borderRadius: 2 }} />)}
    {children}
  </div>;
  const shaky = "Guido".split("");
  return <AbsoluteFill style={{ opacity: o }}>
    <AbsoluteFill style={{ background: `rgba(0,0,0,${0.55 * a})` }} />
    <div style={{ position: "absolute", top: 200, width: "100%", display: "flex", justifyContent: "center", gap: 60 }}>
      {sheet(a, <div style={{ position: "absolute", left: 60, top: 190, fontFamily: "Playfair Display", fontStyle: "italic", fontWeight: 700, fontSize: 96, color: "#1a1410", clipPath: `inset(0 ${100 - wr}% 0 0)` }}>Guido Fawkes</div>, "BEFORE", -2)}
      {sheet(pop(f, at - 6, 12), <div style={{ position: "absolute", left: 90, top: 210, fontFamily: "Playfair Display", fontStyle: "italic", fontWeight: 400, fontSize: 70, color: "#2a2018", clipPath: `inset(0 ${100 - wr2}% 0 0)`, opacity: 0.85 }}>{shaky.map((c, i) => <span key={i} style={{ display: "inline-block", transform: `translate(${(random("sg" + i) - 0.5) * 14}px, ${(random("sh" + i) - 0.5) * 26}px) rotate(${(random("sr" + i) - 0.5) * 30}deg)` }}>{c}</span>)}</div>, "AFTER THE TOWER", 2)}
    </div>
  </AbsoluteFill>;
};

/* ---------- comment prompt + end screen ---------- */
export const EndScreen: React.FC<{ f: number; len: number; askAt: number; nextAt: number }> = ({ f, len, askAt, nextAt }) => {
  const a = pop(f, askAt, 12), n = pop(f, nextAt, 14);
  return <AbsoluteFill>
    {f >= askAt && <div style={{ position: "absolute", left: 120, top: 620, display: "flex", alignItems: "center", gap: 22, padding: "20px 34px", background: "rgba(10,10,12,0.88)", borderRadius: 18, border: "2px solid rgba(255,255,255,0.2)", opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>
      <svg width="64" height="64" viewBox="0 0 40 40"><path d="M6 8 h28 a3 3 0 0 1 3 3 v15 a3 3 0 0 1 -3 3 h-16 l-8 7 v-7 h-4 a3 3 0 0 1 -3 -3 v-15 a3 3 0 0 1 3 -3z" fill={RED} /><circle cx="13" cy="18.5" r="2.4" fill="#fff" /><circle cx="20" cy="18.5" r="2.4" fill="#fff" /><circle cx="27" cy="18.5" r="2.4" fill="#fff" /></svg>
      <div><div style={{ ...OS(28, 600), color: "#c8b8a0", letterSpacing: 5 }}>COMMENT BELOW</div><div style={{ ...OS(54, 700), color: "#fff" }}>Which one was the worst?</div></div>
    </div>}
    {f >= nextAt && <div style={{ position: "absolute", right: 120, top: 560, width: 620, opacity: n, transform: `scale(${0.9 + n * 0.1})` }}>
      <div style={{ ...OS(30, 600), color: "#c8b8a0", letterSpacing: 6, marginBottom: 12 }}>WATCH NEXT</div>
      <div style={{ width: 620, height: 349, borderRadius: 14, border: `4px solid ${RED}`, background: "linear-gradient(135deg,#1a1210,#050404)", boxShadow: `0 0 40px rgba(208,20,44,0.45)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ ...OS(64, 700), color: "#fff", textAlign: "center", lineHeight: 1.05 }}>ONE NIGHT IN A<br /><span style={{ color: RED }}>MEDIEVAL DUNGEON</span></div>
        <div style={{ position: "absolute", bottom: 14, right: 18, width: 64, height: 64, borderRadius: 32, background: RED, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="30" height="30" viewBox="0 0 10 10"><path d="M3 2 L8 5 L3 8z" fill="#fff" /></svg></div>
      </div>
    </div>}
  </AbsoluteFill>;
};

/* ---------- grade, grain, vignette, letterbox ---------- */
export const Grade: React.FC<{ tint?: string }> = ({ tint }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ pointerEvents: "none" }}>
    {tint && <AbsoluteFill style={{ background: tint, mixBlendMode: "soft-light" }} />}
    <svg width={W} height={H} style={{ position: "absolute", opacity: 0.06, mixBlendMode: "overlay" }}><filter id="gnT"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed={f % 13} /></filter><rect width={W} height={H} filter="url(#gnT)" /></svg>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.5) 100%)" }} />
  </AbsoluteFill>;
};
