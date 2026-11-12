import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, random } from "remotion";
import { noise2D } from "@remotion/noise";
import "@fontsource/fredoka/500.css";
import "@fontsource/fredoka/700.css";
import "@fontsource/lilita-one/400.css";
import { Toon, ToonDefs, P, walk, climb, sneak, mixP, OUT } from "./Toon";
import { HouseExt, Room, Desk, Kitchen, Bath, FirstAid, W, H } from "./Sets";
import SUBS from "./subs.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const SC = [0, 121, 321, 448, 545, 627, 790, 908, 999, 1137, 1276, 1415, 1566];
export const MIYA_FRAMES = SC[SC.length - 1];
const TITLE = "Lilita One", BODY = "Fredoka";

const pop = (f: number, s: number, d = 12) => spring({ frame: f - s, fps: 30, config: { damping: d, stiffness: 180 } });

const Cam: React.FC<{ f: number; len: number; a: [number, number, number]; b: [number, number, number]; shake?: number; children: React.ReactNode }> = ({ f, len, a, b, shake = 1.5, children }) => {
  const k = interpolate(f, [0, len], [0, 1], clamp);
  const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  const x = a[0] + (b[0] - a[0]) * e, y = a[1] + (b[1] - a[1]) * e, s = a[2] + (b[2] - a[2]) * e;
  const sx = noise2D("cx", f / 45, 0) * shake * 4, sy = noise2D("cy", f / 45, 3) * shake * 4;
  return <g transform={`translate(${W / 2 + sx},${H / 2 + sy}) scale(${s}) translate(${-x},${-y})`}>{children}</g>;
};

const Svg: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = "#000" }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ background: bg, position: "absolute" }}>
    <ToonDefs />
    {children}
  </svg>
);

const NameTag: React.FC<{ f: number; s: number; x: number; y: number; name: string; age: string }> = ({ f, s, x, y, name, age }) => {
  const p = pop(f, s, 10);
  if (p < 0.01) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-100%) scale(${p})`, transformOrigin: "50% 100%", textAlign: "center" }}>
      <div style={{ background: "#fffaf0", border: `5px solid ${OUT}`, borderRadius: 18, padding: "6px 22px", fontFamily: TITLE, fontSize: 52, color: OUT, boxShadow: "0 8px 0 rgba(0,0,0,0.35)", whiteSpace: "nowrap" }}>
        {name} <span style={{ color: "#c0392b" }}>{age}</span>
      </div>
      <div style={{ width: 0, height: 0, margin: "0 auto", borderLeft: "16px solid transparent", borderRight: "16px solid transparent", borderTop: `20px solid ${OUT}` }} />
    </div>
  );
};

const Hud: React.FC<{ f: number; s: number; title: string; rows: [string, string, string, number][] }> = ({ f, s, title, rows }) => {
  const p = pop(f, s, 14);
  return (
    <div style={{ position: "absolute", right: 46, top: 250, width: 420, transform: `scale(${p})`, transformOrigin: "100% 0", background: "rgba(14,18,34,0.92)", border: "4px solid #4a5aa0", borderRadius: 18, padding: "18px 24px", fontFamily: BODY, color: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 3, color: "#9fb4ff", marginBottom: 10 }}>{title}</div>
      {rows.map(([icon, label, val, st], i) => {
        const r = pop(f, st, 12);
        return (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 36, fontWeight: 600, padding: "6px 0", opacity: r, transform: `translateX(${(1 - r) * 40}px)`, borderTop: i ? "2px solid #2a3360" : "none" }}>
            <span><span style={{ display: "inline-block", width: 22, height: 22, borderRadius: 11, background: icon, marginRight: 14, border: "3px solid #fff" }} />{label}</span><span style={{ fontWeight: 700, color: "#ffd25a" }}>{val}</span>
          </div>
        );
      })}
    </div>
  );
};

const Photo: React.FC<{ f: number; len: number; src: string; rot?: number; caption?: string; sub?: string; capStart?: number; children?: React.ReactNode }> = ({ f, len, src, rot = -2, caption, sub, capStart = 4, children }) => {
  const k = interpolate(f, [0, len], [1, 1.1], clamp);
  const pp = pop(f, 0, 14);
  const cp = pop(f, capStart, 12);
  return (
    <AbsoluteFill style={{ background: "#0a0a0d", overflow: "hidden" }}>
      <Img src={staticFile(`miya/${src}`)} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", filter: "blur(40px) brightness(0.4)", transform: `scale(${1.3 * k})` }} />
      <div style={{ position: "absolute", left: 40, right: 40, top: 430, height: 960, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${(0.88 + 0.12 * pp) * k}) rotate(${rot}deg)` }}>
        <div style={{ background: "#f4f1ea", padding: 20, boxShadow: "0 30px 80px rgba(0,0,0,0.7)" }}>
          <Img src={staticFile(`miya/${src}`)} style={{ display: "block", width: 960, maxHeight: 900, objectFit: "contain", filter: "contrast(1.05) sepia(0.12)" }} />
        </div>
      </div>
      {caption && (
        <div style={{ position: "absolute", top: 230, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${cp})` }}>
          <div style={{ background: "#c0392b", color: "#fff", fontFamily: TITLE, fontSize: 76, padding: "8px 34px", borderRadius: 18, border: `5px solid ${OUT}`, boxShadow: "0 8px 0 rgba(0,0,0,0.4)" }}>{caption}</div>
          {sub && <div style={{ color: "#fff", fontFamily: BODY, fontWeight: 700, fontSize: 46, marginTop: 20, letterSpacing: 5, textShadow: "0 4px 14px #000" }}>{sub}</div>}
        </div>
      )}
      {children}
    </AbsoluteFill>
  );
};

// ---------------- scenes ----------------
const S0: React.FC<{ f: number }> = ({ f }) => {
  const len = SC[1];
  const date = "DECEMBER 30, 2000";
  const n = Math.floor(interpolate(f, [4, 44], [0, date.length], clamp));
  return (
    <Photo f={f} len={len} src="birthday.jpg" rot={2}>
      <div style={{ position: "absolute", top: 210, width: "100%", textAlign: "center" }}>
        <div style={{ color: "#fff", fontFamily: TITLE, fontSize: 100, textShadow: "0 6px 0 #000, 0 0 30px #000", WebkitTextStroke: `4px ${OUT}` }}>{date.slice(0, n)}&nbsp;</div>
        <div style={{ color: "#ffb347", fontFamily: BODY, fontWeight: 700, fontSize: 56, letterSpacing: 12, opacity: interpolate(f, [55, 70], [0, 1], clamp), textShadow: "0 4px 14px #000" }}>TOKYO · JAPAN</div>
      </div>
    </Photo>
  );
};

const S1: React.FC<{ f: number }> = ({ f }) => {
  const CUT = 62, len = SC[2] - SC[1];
  if (f < CUT) return <Photo f={f} len={CUT} src="steps.jpg" rot={-2} caption="THE MIYAZAWA FAMILY" capStart={2} />;
  const g = f - CUT;
  const top = (g * 14) % 360;
  return (
    <>
      <Svg>
        <Cam f={g} len={len - CUT} a={[540, 1080, 1.0]} b={[540, 1120, 1.12]}>
          <Room f={f} />
          <Desk x={150} y={1220} f={f} on screen={<g><rect x={26} y={-176} width={148} height={20} fill="#0a246a" /><rect x={26} y={-150} width={148} height={84} fill="#fff" /><rect x={36} y={-140} width={90} height={8} fill="#999" /><rect x={36} y={-124} width={120} height={8} fill="#999" /></g>} />
          <g><rect x={170} y={1300} width={110} height={18} rx={6} fill="#3b3f4a" stroke={OUT} strokeWidth={4} /><rect x={262} y={1180} width={18} height={130} rx={6} fill="#3b3f4a" stroke={OUT} strokeWidth={4} /><rect x={215} y={1318} width={14} height={110} fill="#2a2d35" /></g>
          <Toon x={210} y={1430} kind="mikio" pose={P.type} face={g > 20 && g < 70 ? "smile" : "focus"} f={f} flip />
          {/* sofa */}
          <g transform="translate(560,1300)">
            <rect x={0} y={-150} width={440} height={130} rx={36} fill="#b9443a" stroke={OUT} strokeWidth={5} />
            <rect x={0} y={-40} width={440} height={110} rx={30} fill="#a63a31" stroke={OUT} strokeWidth={5} />
            <rect x={-20} y={-110} width={60} height={170} rx={26} fill="#c24c41" stroke={OUT} strokeWidth={5} />
            <rect x={400} y={-110} width={60} height={170} rx={26} fill="#c24c41" stroke={OUT} strokeWidth={5} />
          </g>
          <Toon x={790} y={1330} kind="yasuko" pose={P.sofa} face={g > 30 ? "smile" : "neutral"} f={f} flip holding={<g><rect x={-14} y={-26} width={28} height={30} rx={6} fill="#f2f2f2" stroke={OUT} strokeWidth={4} /><path d={`M-4,-34 q${Math.sin(f / 5) * 6},-14 0,-28`} stroke="#fff" strokeWidth={4} fill="none" opacity={0.7} /></g>} />
          {/* low table with mikan */}
          <g transform="translate(560,1560)">
            <ellipse cx={0} cy={-60} rx={190} ry={40} fill="#7a5233" stroke={OUT} strokeWidth={5} />
            <rect x={-170} y={-60} width={20} height={70} fill="#6b4630" stroke={OUT} strokeWidth={4} /><rect x={150} y={-60} width={20} height={70} fill="#6b4630" stroke={OUT} strokeWidth={4} />
            <ellipse cx={-30} cy={-78} rx={60} ry={20} fill="#ddd" stroke={OUT} strokeWidth={4} />
            {[-60, -30, 0, -45, -15].map((dx, i) => <circle key={i} cx={dx} cy={-88 - (i > 2 ? 18 : 0)} r={17} fill="#f39a2b" stroke={OUT} strokeWidth={3} />)}
          </g>
          <Toon x={420} y={1760} kind="niina" pose={P.play} face="smile" f={f} flip />
          <Toon x={720} y={1770} kind="rei" pose={P.play} face="smile" f={f} />
          {/* spinning top (koma) */}
          <g transform={`translate(${575 + Math.sin(g / 8) * 30},1720) rotate(${Math.sin(g / 3) * 8})`}>
            <path d="M-34,-20 L34,-20 L0,30 Z" fill="#d8443a" stroke={OUT} strokeWidth={4} />
            <rect x={-34} y={-30} width={68} height={12} fill={top < 180 ? "#3e7bd6" : "#e8b23a"} stroke={OUT} strokeWidth={3} />
            <line x1={0} y1={-30} x2={0} y2={-50} stroke={OUT} strokeWidth={6} />
          </g>
        </Cam>
      </Svg>
      <NameTag f={f} s={64} x={250} y={760} name="MIKIO" age="44" />
      <NameTag f={f} s={98} x={790} y={820} name="YASUKO" age="41" />
      <NameTag f={f} s={147} x={420} y={1330} name="NIINA" age="8" />
      <NameTag f={f} s={168} x={760} y={1380} name="REI" age="6" />
    </>
  );
};

const S2: React.FC<{ f: number }> = ({ f }) => {
  const len = SC[3] - SC[2];
  const lights = f < 14 ? 1 : 0;
  const walkEnd = 40, climbEnd = 98;
  let x = -60, y = 1250, pose = sneak(f / 3.2);
  if (f < walkEnd) x = interpolate(f, [0, walkEnd], [-80, 140]);
  else if (f < climbEnd) { x = 160; y = interpolate(f, [walkEnd, climbEnd], [1250, 890]); pose = climb((f - walkEnd) / 2.6); }
  else { x = interpolate(f, [climbEnd, climbEnd + 14], [180, 250], clamp); y = 890; pose = sneak(f / 3); }
  const vis = interpolate(f, [climbEnd + 4, climbEnd + 14], [1, 0], clamp);
  return (
    <Svg>
      <Cam f={f} len={len} a={[520, 1000, 1.05]} b={[360, 960, 1.35]}>
        <HouseExt f={f} night lights={lights} winOpen={f > climbEnd} grLight={0} />
        <g opacity={vis}><Toon x={x} y={y} kind="killer" pose={pose} f={f} s={0.62} glow="#9fb4ff" /></g>
      </Cam>
      <rect width={W} height={H} fill="url(#vig)" />
      <ClockChip f={f} t="11:30 PM" />
    </Svg>
  );
};

const ClockChip: React.FC<{ f: number; t: string; s?: number }> = ({ f, t, s = 0 }) => {
  const p = pop(f, s, 12);
  return (
    <g transform={`translate(70,170) scale(${p})`}>
      <rect width={t.length * 44 + 50} height={110} rx={18} fill="#14161e" stroke="#3a3f52" strokeWidth={6} />
      <text x={(t.length * 44 + 50) / 2} y={80} fontFamily="monospace" fontWeight={700} fontSize={70} fill="#ff3b30" textAnchor="middle" style={{ filter: "drop-shadow(0 0 8px #ff3b30)" }}>{t}</text>
    </g>
  );
};

const S3: React.FC<{ f: number }> = ({ f }) => {
  const len = SC[4] - SC[3];
  if (f < 46) {
    const flash = random(`fl${Math.floor(f / 2)}`) > 0.6 ? 1 : 0;
    const grow = interpolate(f, [0, 46], [0.7, 1.6], clamp);
    return (
      <Svg>
        <Cam f={f} len={46} a={[540, 900, 1.1]} b={[540, 900, 1.25]} shake={6}>
          <Room f={f} night={1} lampSwing={9} tvOn={false} />
          <rect width={W} height={H} fill="#080b18" opacity={0.6} />
          {/* intruder shadow growing on the wall */}
          <g transform={`translate(560,1180) scale(${grow})`} opacity={0.85}>
            <Toon x={0} y={0} kind="killer" pose={P.stand} f={f} s={1.2} dim={1} />
          </g>
          <rect width={W} height={H} fill="#8a0f0f" opacity={flash * 0.32} />
        </Cam>
        <rect width={W} height={H} fill="url(#vig)" />
      </Svg>
    );
  }
  const names: [string, string][] = [["MIKIO", "44"], ["YASUKO", "41"], ["NIINA", "8"], ["REI", "6"]];
  return (
    <Svg bg="#07070a">
      {names.map(([n, a], i) => {
        const x = 165 + i * 250, p = interpolate(f, [48 + i * 8, 60 + i * 8], [0, 1], clamp), fl = 1 + noise2D("c" + i, f / 6, 0) * 0.18;
        return (
          <g key={n} opacity={p}>
            <ellipse cx={x} cy={830} rx={80 * fl} ry={140 * fl} fill="#f6c45a" opacity={0.13} />
            <rect x={x - 26} y={880} width={52} height={130} rx={8} fill="#f3ead8" stroke={OUT} strokeWidth={4} />
            <path d={`M${x},${880 - 60 * fl} Q${x + 22},${850} ${x},${878} Q${x - 22},${850} ${x},${880 - 60 * fl} Z`} fill="#ffc94a" />
            <path d={`M${x},${880 - 34 * fl} Q${x + 10},${862} ${x},${878} Q${x - 10},${862} ${x},${880 - 34 * fl} Z`} fill="#fff6d0" />
            <text x={x} y={1100} fontFamily={TITLE} fontSize={54} fill="#fff" textAnchor="middle">{n}</text>
            <text x={x} y={1160} fontFamily={BODY} fontWeight={600} fontSize={40} fill="#999" textAnchor="middle">{a}</text>
          </g>
        );
      })}
    </Svg>
  );
};

const WallClock: React.FC<{ x: number; y: number; r: number; f: number; speed: number }> = ({ x, y, r, f, speed }) => {
  const a = f * speed;
  return (
    <g>
      <circle cx={x} cy={y} r={r + 10} fill="#6b4a33" stroke={OUT} strokeWidth={5} />
      <circle cx={x} cy={y} r={r} fill="#f6f1e6" stroke={OUT} strokeWidth={4} />
      {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={x + Math.sin(i * Math.PI / 6) * r * 0.78} y1={y - Math.cos(i * Math.PI / 6) * r * 0.78} x2={x + Math.sin(i * Math.PI / 6) * r * 0.92} y2={y - Math.cos(i * Math.PI / 6) * r * 0.92} stroke={OUT} strokeWidth={5} />)}
      <line x1={x} y1={y} x2={x + Math.sin(a / 12 * Math.PI / 180) * r * 0.5} y2={y - Math.cos(a / 12 * Math.PI / 180) * r * 0.5} stroke={OUT} strokeWidth={9} strokeLinecap="round" />
      <line x1={x} y1={y} x2={x + Math.sin(a * Math.PI / 180) * r * 0.75} y2={y - Math.cos(a * Math.PI / 180) * r * 0.75} stroke="#c0392b" strokeWidth={6} strokeLinecap="round" />
    </g>
  );
};

const S4: React.FC<{ f: number }> = ({ f }) => {
  const len = SC[5] - SC[4];
  const look = Math.sin(f / 10) * 8;
  return (
    <Svg>
      <Cam f={f} len={len} a={[540, 1150, 1.0]} b={[540, 1200, 1.22]}>
        <Room f={f} night={1} tvOn={false} />
        <rect width={W} height={H} fill="#080b18" opacity={0.5} />
        <WallClock x={830} y={210} r={70} f={f} speed={90} />
        <ellipse cx={540} cy={1700} rx={260} ry={60} fill="#8fa6ff" opacity={0.08} />
        <Toon x={540} y={1720} kind="killer" pose={f < 30 ? walk(f / 4) : P.stand} f={f} s={1.15} look={look} />
      </Cam>
      <rect width={W} height={H} fill="url(#vig)" />
    </Svg>
  );
};

const S5: React.FC<{ f: number }> = ({ f }) => {
  const len = SC[6] - SC[5];
  const door = interpolate(f, [8, 24], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const cups = [62, 72, 82, 92].filter((s) => f > s + 6).length;
  const eating = f > 40 && f < 118;
  return (
    <>
      <Svg>
        <Cam f={f} len={len} a={[620, 1080, 1.0]} b={[560, 1120, 1.15]}>
          <Kitchen f={f} door={door} />
          {/* empty ice cream cups pile on the counter */}
          {Array.from({ length: cups }).map((_, i) => <g key={i} transform={`translate(${210 + i * 52},1046) scale(${pop(f, [62, 72, 82, 92][i] + 6, 9)})`}><path d="M-20,0 L20,0 L26,-38 L-26,-38 Z" fill="#f4a6c0" stroke={OUT} strokeWidth={3} /><rect x={-27} y={-44} width={54} height={8} fill="#fff" stroke={OUT} strokeWidth={2} /></g>)}
          {f > 36 && <g transform={`translate(130,1050) scale(${pop(f, 36, 10)})`}><path d="M-50,0 A50,50 0 0 1 50,0 Z" fill="#cfe08a" stroke={OUT} strokeWidth={4} /><path d="M-40,0 A40,40 0 0 1 40,0 Z" fill="#f5c97d" /></g>}
          {f > 118 && [0, 1, 2, 3].map((i) => <g key={i} transform={`translate(${420 + i * 30},1058) scale(${pop(f, 118 + i * 4, 10)})`}><rect x={-12} y={-64} width={24} height={64} rx={5} fill="#c8a165" stroke={OUT} strokeWidth={3} opacity={0.75} /></g>)}
          <Toon x={560} y={1640} kind="killer" s={1.1} f={f} pose={door < 0.5 ? P.stand : eating ? P.eat : f >= 118 ? P.hold : P.reach}
            holding={eating ? <g><path d="M-14,-8 L14,-8 L18,-40 L-18,-40 Z" fill="#f4a6c0" stroke={OUT} strokeWidth={3} /><rect x={-4} y={-58} width={6} height={22} fill="#d9b98a" /></g> : f >= 118 ? <rect x={-12} y={-70} width={24} height={64} rx={5} fill="#c8a165" stroke={OUT} strokeWidth={3} /> : undefined} />
        </Cam>
        <rect width={W} height={H} fill="url(#vig)" />
      </Svg>
      <Hud f={f} s={30} title="TAKEN FROM THE FRIDGE" rows={[["#9fd36a", "Melon", "1", 36], ["#f4a6c0", "Ice creams", String(Math.max(1, cups)), 62], ["#c8a165", "Barley tea", "4", 118]]} />
    </>
  );
};

const S6: React.FC<{ f: number }> = ({ f }) => {
  const len = SC[7] - SC[6];
  const open = interpolate(f, [14, 30], [0, 1], clamp);
  const band = f > 70;
  const drip = (f % 26) / 26;
  return (
    <Svg>
      <Cam f={f} len={len} a={[600, 1250, 1.3]} b={[620, 1230, 1.5]}>
        <Bath f={f} />
        <g transform={`translate(780,820) scale(${pop(f, 6, 12)})`}><FirstAid open={open} /></g>
        <Toon x={430} y={1700} kind="killer" s={1.15} f={f} pose={band ? P.hold : mixP(P.hold, P.reach, 0.3)} bandage={band} look={6} />
        {!band && <circle cx={540} cy={1300 + drip * 160} r={9} fill="#9d1c1c" opacity={1 - drip} />}
      </Cam>
      <rect width={W} height={H} fill="url(#vig)" />
    </Svg>
  );
};

const S7: React.FC<{ f: number }> = ({ f }) => {
  const len = SC[8] - SC[7];
  const prog = interpolate(f, [10, 60], [0, 1], clamp);
  const online = f > 62;
  const screen = (
    <g>
      <rect x={16} y={-186} width={168} height={128} fill="#2a6bd1" />
      <rect x={30} y={-170} width={140} height={96} fill="#d4d0c8" stroke="#fff" strokeWidth={2} />
      <rect x={30} y={-170} width={140} height={16} fill="#0a246a" />
      <text x={100} y={-128} fontSize={13} fontFamily="monospace" fontWeight={700} fill="#111" textAnchor="middle">{online ? "CONNECTED" : "Dialing..."}</text>
      <rect x={42} y={-110} width={116} height={14} fill="#fff" stroke="#777" strokeWidth={1.5} />
      <rect x={44} y={-108} width={112 * prog} height={10} fill={online ? "#2fb84a" : "#0a246a"} />
    </g>
  );
  return (
    <Svg bg="#070914">
      <Cam f={f} len={len} a={[360, 1080, 1.9]} b={[390, 1060, 2.2]} shake={1}>
        <rect width={W} height={H} fill="#0b0f1c" />
        <Room f={f} night={1} tvOn={false} />
        <rect width={W} height={H} fill="#05070f" opacity={0.6} />
        <path d="M250,1080 L-200,1500 L-200,600 Z" fill="url(#crtCone)" opacity={0.35} />
        <Desk x={170} y={1180} f={f} on screen={screen} s={1} />
        <ellipse cx={270} cy={1080} rx={220} ry={180} fill="#8fd3ff" opacity={0.1 + 0.04 * Math.sin(f / 2)} />
        <Toon x={520} y={1390} kind="killer" pose={P.type} f={f} flip glow="#8fd3ff" />
        {/* red digital clock on the shelf */}
        <g transform="translate(150,880)">
          <rect width={130} height={56} rx={8} fill="#121318" stroke="#3a3f52" strokeWidth={4} />
          <text x={65} y={44} fontFamily="monospace" fontWeight={700} fontSize={40} fill="#ff3b30" textAnchor="middle" opacity={Math.floor(f / 15) % 2 ? 1 : 0.85}>01:18</text>
        </g>
      </Cam>
      <rect width={W} height={H} fill="url(#vig)" />
      <ClockChip f={f} t="1:18 AM" s={4} />
    </Svg>
  );
};

const S8: React.FC<{ f: number }> = ({ f }) => {
  const len = SC[9] - SC[8];
  if (f >= 100) return <Photo f={f - 100} len={len - 100} src="house_aerial.jpg" rot={1.5} caption="SHE FOUND THEM" sub="DECEMBER 31, 2000" capStart={2} />;
  // grandmother leaves her door (x~875), walks to the Miyazawa door (x~540), knocks, goes in, comes back out
  let x = 875, pose = P.stand, face: any = "neutral", vis = 1, flip = true;
  if (f < 12) { x = 875; vis = interpolate(f, [0, 8], [0, 1], clamp); }
  else if (f < 58) { x = interpolate(f, [12, 58], [875, 560]); pose = walk(f / 4.5, 0.6); }
  else if (f < 74) { x = 560; pose = mixP(P.stand, P.wave, Math.abs(Math.sin(f / 2))); face = "focus"; }
  else if (f < 84) { x = 560; vis = interpolate(f, [74, 82], [1, 0], clamp); }
  else { x = 560; pose = P.grief; face = "cry"; vis = 1; flip = false; }
  return (
    <Svg>
      <Cam f={f} len={100} a={[680, 1140, 1.45]} b={[620, 1170, 1.7]}>
        <HouseExt f={f} night={false} lights={0} grLight={0} />
        <g opacity={vis}><Toon x={x} y={1335} kind="grandma" pose={pose} face={face} f={f} s={0.7} flip={flip} /></g>
      </Cam>
      <rect width={W} height={H} fill="url(#vig)" opacity={0.6} />
      <ClockChip f={f} t="10:40 AM" s={2} />
    </Svg>
  );
};

const Bag: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <g>
    <rect x={-150} y={-150} width={300} height={290} rx={16} fill="#e9f0f2" stroke={OUT} strokeWidth={5} opacity={0.96} />
    <rect x={-150} y={-150} width={300} height={34} rx={10} fill="#c0392b" stroke={OUT} strokeWidth={5} />
    <text x={0} y={-125} fontFamily={BODY} fontWeight={700} fontSize={22} fill="#fff" textAnchor="middle" letterSpacing={3}>EVIDENCE</text>
    {children}
    <rect x={-120} y={78} width={240} height={46} rx={8} fill="#fff8d6" stroke={OUT} strokeWidth={3} />
    <text x={0} y={111} fontFamily={TITLE} fontSize={32} fill={OUT} textAnchor="middle">{label}</text>
  </g>
);

const S9: React.FC<{ f: number }> = ({ f }) => {
  const len = SC[10] - SC[9];
  const siren = Math.floor(f / 7) % 2;
  const items: [number, number, number, string, React.ReactNode][] = [
    [300, 760, 20, "HIS BLOOD", <g><rect x={-18} y={-90} width={36} height={130} rx={14} fill="#f4f4f4" stroke={OUT} strokeWidth={4} /><rect x={-14} y={-20} width={28} height={56} rx={10} fill="#8e1414" /><rect x={-22} y={-104} width={44} height={20} rx={6} fill="#3e7bd6" stroke={OUT} strokeWidth={3} /></g>],
    [780, 760, 48, "FINGERPRINTS", <g>{[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx={-80 + i * 40} cy={-20} rx={16} ry={22} fill="none" stroke="#333" strokeWidth={3} strokeDasharray="6 3" />)}<rect x={-110} y={-60} width={220} height={90} fill="none" stroke="#777" strokeWidth={2} /></g>],
    [300, 1150, 74, "HIS CLOTHES", <g><path d="M-80,-80 L-30,-95 Q0,-75 30,-95 L80,-80 L100,-30 L70,-20 L70,40 L-70,40 L-70,-20 L-100,-30 Z" fill="#4b5d7a" stroke={OUT} strokeWidth={4} /><rect x={-60} y={10} width={60} height={34} rx={8} fill="#5a4630" stroke={OUT} strokeWidth={3} /><path d="M20,10 q30,-40 60,0 Z" fill="#22252f" stroke={OUT} strokeWidth={3} /></g>],
    [780, 1150, 104, "THE KNIFE", <g transform="rotate(-25)"><path d="M-110,-6 L50,-14 L50,10 L-110,6 Z" fill="#cfd6dc" stroke={OUT} strokeWidth={4} /><rect x={50} y={-14} width={70} height={24} rx={6} fill="#6b4630" stroke={OUT} strokeWidth={4} /></g>],
  ];
  return (
    <Svg bg="#1b2030">
      <Cam f={f} len={len} a={[540, 960, 1.0]} b={[540, 980, 1.08]} shake={1}>
        <rect width={W} height={H} fill="#1d2233" />
        {/* police lights sweeping across the wall */}
        <rect width={W} height={H} fill={siren ? "#ff2d2d" : "#2d5bff"} opacity={0.12} />
        <path d={`M${siren ? -200 : 1280},0 L${siren ? 500 : 580},0 L${siren ? 300 : 780},1920 L${siren ? -400 : 1480},1920 Z`} fill={siren ? "#ff3b3b" : "#3b6bff"} opacity={0.12} />
        {/* table */}
        <path d="M60,560 L1020,560 L1080,1420 L0,1420 Z" fill="#5d4633" stroke={OUT} strokeWidth={6} />
        {Array.from({ length: 6 }).map((_, i) => <line key={i} x1={60} y1={620 + i * 140} x2={1020} y2={620 + i * 140} stroke="#4f3b2b" strokeWidth={3} />)}
        {/* police tape */}
        <g transform="translate(0,1700) rotate(-6)">
          <rect x={-100} y={0} width={1300} height={70} fill="#f2c94c" stroke={OUT} strokeWidth={5} />
          <text x={540} y={50} fontFamily={TITLE} fontSize={44} fill={OUT} textAnchor="middle" letterSpacing={6}>POLICE LINE · DO NOT CROSS · 立入禁止</text>
        </g>
        {items.map(([x, y, s, label, art], i) => (
          <g key={i} transform={`translate(${x},${y}) rotate(${i % 2 ? 3 : -3}) scale(${pop(f, s, 10)})`}><Bag label={label}>{art}</Bag></g>
        ))}
      </Cam>
      <rect width={W} height={H} fill="url(#vig)" />
    </Svg>
  );
};

const S10: React.FC<{ f: number }> = ({ f }) => {
  const len = SC[11] - SC[10];
  const year = Math.floor(interpolate(f, [6, 80], [2000, 2026], clamp));
  const stamp = spring({ frame: f - 96, fps: 30, config: { damping: 9, stiffness: 220 } });
  const q = 0.7 + 0.3 * Math.abs(Math.sin(f / 8));
  return (
    <Svg bg="#1a1d26">
      <Cam f={f} len={len} a={[540, 1000, 1.0]} b={[540, 1020, 1.1]}>
        {/* cork board */}
        <rect width={W} height={H} fill="#2a2f3d" />
        <rect x={70} y={480} width={940} height={1140} rx={16} fill="#b98a5a" stroke={OUT} strokeWidth={8} />
        {Array.from({ length: 120 }).map((_, i) => <circle key={i} cx={90 + random(`ck${i}`) * 900} cy={500 + random(`cy${i}`) * 1100} r={3} fill="#9c7046" />)}
        {/* poster */}
        <g transform="translate(540,1050) rotate(-1.5)">
          <rect x={-330} y={-500} width={660} height={940} fill="#f6f1e2" stroke={OUT} strokeWidth={5} />
          <rect x={-330} y={-500} width={660} height={130} fill="#c0392b" />
          <text x={0} y={-410} fontFamily={TITLE} fontSize={88} fill="#fff" textAnchor="middle" letterSpacing={6}>UNKNOWN</text>
          <rect x={-250} y={-340} width={500} height={560} fill="#20232d" stroke={OUT} strokeWidth={4} />
          <g transform="translate(0,230)"><Toon x={0} y={0} kind="killer" pose={P.stand} f={f} s={1.0} dim={0.55} /></g>
          <text x={0} y={-120} fontFamily={TITLE} fontSize={220} fill="#fff" textAnchor="middle" opacity={q}>?</text>
          <text x={0} y={300} fontFamily={BODY} fontWeight={700} fontSize={42} fill={OUT} textAnchor="middle">MALE · DNA ON FILE</text>
          <text x={0} y={360} fontFamily={BODY} fontWeight={600} fontSize={34} fill="#555" textAnchor="middle">Setagaya, Tokyo · Dec 30, 2000</text>
          <circle cx={-300} cy={-470} r={14} fill="#d8443a" stroke={OUT} strokeWidth={3} />
          <circle cx={300} cy={-470} r={14} fill="#d8443a" stroke={OUT} strokeWidth={3} />
        </g>
      </Cam>
      <g transform="translate(540,300)">
        <rect x={-230} y={-110} width={460} height={150} rx={20} fill="#14161e" stroke="#3a3f52" strokeWidth={6} />
        <text x={0} y={10} fontFamily="monospace" fontWeight={700} fontSize={120} fill="#ff3b30" textAnchor="middle" style={{ filter: "drop-shadow(0 0 10px #ff3b30)" }}>{year}</text>
      </g>
      {f > 96 && (
        <g transform={`translate(540,1060) rotate(-14) scale(${2 - stamp})`} opacity={Math.min(1, stamp * 1.4)}>
          <rect x={-330} y={-95} width={660} height={170} rx={14} fill="rgba(255,255,255,0.15)" stroke="#e02a2a" strokeWidth={14} />
          <text y={40} fontFamily={TITLE} fontSize={120} fill="#e02a2a" textAnchor="middle" letterSpacing={6}>NO MATCH</text>
        </g>
      )}
    </Svg>
  );
};

const S11: React.FC<{ f: number }> = ({ f }) => {
  const len = SC[12] - SC[11];
  const t1 = pop(f, 0, 14);
  const stamp = spring({ frame: f - 34, fps: 30, config: { damping: 9, stiffness: 220 } });
  const out = interpolate(f, [len - 16, len], [1, 0], clamp);
  const fl = 1 + noise2D("end", f / 6, 0) * 0.15;
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Svg>
        <Cam f={f} len={len} a={[520, 1100, 1.2]} b={[520, 1150, 1.05]}>
          <HouseExt f={f} night lights={0} grLight={0} abandoned />
          {/* flowers and candles at the wall */}
          <g transform="translate(560,1360)">
            {[-80, -40, 0, 40, 80].map((dx, i) => <g key={i}><line x1={dx} y1={0} x2={dx + 6} y2={-50} stroke="#3e7a3a" strokeWidth={5} /><circle cx={dx + 6} cy={-56} r={13} fill={["#fff", "#f4d03f", "#fff", "#e8b4d0", "#fff"][i]} stroke={OUT} strokeWidth={3} /></g>)}
            <ellipse cx={0} cy={-60} rx={140 * fl} ry={90 * fl} fill="#ffc94a" opacity={0.15} />
            {[-120, 120].map((dx) => <g key={dx}><rect x={dx - 14} y={-50} width={28} height={50} rx={5} fill="#f3ead8" stroke={OUT} strokeWidth={3} /><path d={`M${dx},${-50 - 30 * fl} Q${dx + 12},-62 ${dx},-50 Q${dx - 12},-62 ${dx},${-50 - 30 * fl} Z`} fill="#ffc94a" /></g>)}
          </g>
        </Cam>
        <rect width={W} height={H} fill="url(#vig)" />
      </Svg>
      <div style={{ position: "absolute", top: 220, width: "100%", textAlign: "center", transform: `scale(${t1})` }}>
        <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 56, color: "#cfd6ff", letterSpacing: 10, textShadow: "0 4px 14px #000" }}>THE SETAGAYA</div>
        <div style={{ fontFamily: TITLE, fontSize: 120, color: "#fff", WebkitTextStroke: `5px ${OUT}`, textShadow: "0 8px 0 #000" }}>FAMILY MURDER</div>
      </div>
      {f > 34 && (
        <div style={{ position: "absolute", top: 520, width: "100%", display: "flex", justifyContent: "center" }}>
          <div style={{ transform: `rotate(-5deg) scale(${2 - stamp})`, opacity: Math.min(1, stamp * 1.4), background: "#c0392b", color: "#fff", fontFamily: TITLE, fontSize: 96, padding: "6px 40px", borderRadius: 16, border: `6px solid ${OUT}`, boxShadow: "0 10px 0 rgba(0,0,0,0.5)" }}>STILL UNSOLVED</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

const Subs: React.FC = () => {
  const f = useCurrentFrame();
  const cur = (SUBS as [number, number, string][]).find(([a, b]) => f >= a && f < b + 4);
  if (!cur) return null;
  const p = spring({ frame: f - cur[0], fps: 30, config: { damping: 14, stiffness: 260 } });
  return (
    <div style={{ position: "absolute", top: 1430, width: "100%", textAlign: "center", padding: "0 70px", boxSizing: "border-box" }}>
      <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: 70, color: "#fff", WebkitTextStroke: `10px ${OUT}`, paintOrder: "stroke fill", lineHeight: 1.2, display: "inline-block", transform: `scale(${0.85 + 0.15 * p})`, textShadow: "0 6px 0 rgba(0,0,0,0.5)" }}>{cur[2]}</span>
    </div>
  );
};

const CTA: React.FC = () => {
  const f = useCurrentFrame();
  const p = pop(f, 1518, 12);
  if (f < 1518) return null;
  return (
    <div style={{ position: "absolute", top: 1430, width: "100%", display: "flex", justifyContent: "center", transform: `scale(${p})` }}>
      <div style={{ background: "#fff", color: OUT, fontFamily: TITLE, fontSize: 60, padding: "10px 36px", borderRadius: 18, border: `6px solid ${OUT}` }}>WHO DO YOU THINK DID IT?</div>
    </div>
  );
};

const SCENES = [S0, S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11];

const Scene: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const Sc = SCENES[i];
  const len = SC[i + 1] - SC[i];
  const o = interpolate(f, [0, 5], [0, 1], clamp);
  return <AbsoluteFill style={{ opacity: i === 0 ? 1 : o }}><Sc f={f} /></AbsoluteFill>;
};

export const Miyazawa: React.FC<{ audio?: boolean }> = ({ audio = false }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    {SCENES.map((_, i) => (
      <Sequence key={i} from={SC[i]} durationInFrames={SC[i + 1] - SC[i]}>
        <Scene i={i} />
      </Sequence>
    ))}
    <Subs />
    <CTA />
    {audio && <Audio src={staticFile("miya/mix.wav")} />}
  </AbsoluteFill>
);
