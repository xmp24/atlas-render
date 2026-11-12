import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, random } from "remotion";
import { noise2D } from "@remotion/noise";
import "@fontsource/fredoka/600.css";
import "@fontsource/fredoka/700.css";
import "@fontsource/lilita-one/400.css";
import { Defs2, FrontHouse, RearHouse, Cutaway, Img2, INK, W, H } from "./Sets2";
import { ToonDefs } from "../Miya/Toon";
import { Kitchen, Bath, Desk, FirstAid } from "../Miya/Sets";
import SUBS from "./subs.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// scene cuts (frames @30fps) synced to voice2 timing
export const T = { h1: 0, h2: 58, h3: 118, e1: 160, cut: 270, m1: 570, m2: 612, m3: 655, ev: 700, un: 778, end: 855, fin: 915 };
export const SHORT_FRAMES = T.fin;
const TITLE = "Lilita One", BODY = "Fredoka";
const pop = (f: number, s: number, d = 12, st = 200) => spring({ frame: f - s, fps: 30, config: { damping: d, stiffness: st } });
const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

/** camera through keyframes [frame, x, y, scale] */
const camAt = (f: number, keys: [number, number, number, number][]) => {
  if (f <= keys[0][0]) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const [a, ...A] = keys[i], [b, ...B] = keys[i + 1];
    if (f <= b) { const k = ease((f - a) / (b - a)); return [f, A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k, A[2] + (B[2] - A[2]) * k] as [number, number, number, number]; }
  }
  return keys[keys.length - 1];
};
const Cam: React.FC<{ f: number; keys: [number, number, number, number][]; shake?: number; children: React.ReactNode }> = ({ f, keys, shake = 0, children }) => {
  const [, x, y, s] = camAt(f, keys);
  const sx = noise2D("a", f / 40, 0) * (6 + shake * 20), sy = noise2D("b", f / 40, 2) * (6 + shake * 20);
  return <g transform={`translate(${W / 2 + sx},${H / 2 + sy}) scale(${s}) translate(${-x},${-y})`}>{children}</g>;
};
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", background: "#000" }}>
    <ToonDefs /><Defs2 />
    {children}
    <rect width={W} height={H} fill="url(#vig2)" />
  </svg>
);

/** photo with fast motion: push-in toward a focus point, slight rotation, light leak */
const MovingPhoto: React.FC<{ f: number; len: number; src: string; from: [number, number, number]; to: [number, number, number]; gray?: number; dim?: number; children?: React.ReactNode }> = ({ f, len, src, from, to, gray = 0, dim = 0, children }) => {
  const k = ease(interpolate(f, [0, len], [0, 1], clamp));
  const x = from[0] + (to[0] - from[0]) * k, y = from[1] + (to[1] - from[1]) * k, s = from[2] + (to[2] - from[2]) * k;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Img src={staticFile(`miya2/${src}`)} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", filter: `blur(30px) brightness(0.35) grayscale(${gray})`, transform: "scale(1.3)" }} />
      <Img src={staticFile(`miya2/${src}`)} style={{ position: "absolute", left: "50%", top: "50%", height: 1920, transform: `translate(-50%,-50%) translate(${-x}px,${-y}px) scale(${s})`, filter: `grayscale(${gray}) brightness(${1 - dim}) contrast(1.08) sepia(0.15)` }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 30% 20%, rgba(255,170,90,0.18), transparent 60%)", mixBlendMode: "screen" }} />
      {children}
    </AbsoluteFill>
  );
};

const VHS: React.FC<{ f: number; t: string }> = ({ f, t }) => (
  <div style={{ position: "absolute", left: 50, top: 150, fontFamily: "monospace", fontWeight: 700, fontSize: 40, color: "#f2f2f2", textShadow: "2px 0 #ff2a6a, -2px 0 #2affff, 0 0 10px #000", letterSpacing: 2 }}>
    <div>{Math.floor(f / 15) % 2 ? "●" : "○"} REC</div>
    <div>{t}</div>
  </div>
);

const Stamp: React.FC<{ f: number; s: number; text: string; top: number; color?: string; rot?: number; size?: number }> = ({ f, s, text, top, color = "#e3262b", rot = -8, size = 120 }) => {
  if (f < s) return null;
  const p = spring({ frame: f - s, fps: 30, config: { damping: 9, stiffness: 240 } });
  return (
    <div style={{ position: "absolute", top, width: "100%", display: "flex", justifyContent: "center" }}>
      <div style={{ transform: `rotate(${rot}deg) scale(${2.2 - 1.2 * p})`, opacity: Math.min(1, p * 1.5), border: `12px solid ${color}`, color, fontFamily: TITLE, fontSize: size, padding: "4px 34px", borderRadius: 16, background: "rgba(10,10,14,0.35)", letterSpacing: 4, textShadow: "0 4px 10px rgba(0,0,0,0.5)" }}>{text}</div>
    </div>
  );
};

const VictimCard: React.FC<{ f: number; s: number; n: string; name: string; age: string; x: number; gone?: number }> = ({ f, s, n, name, age, x, gone = 1e9 }) => {
  const p = pop(f, s, 12);
  if (p < 0.01) return null;
  const g = interpolate(f, [gone, gone + 10], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: 170, width: 230, transform: `translate(-50%,0) scale(${p}) rotate(${x % 2 ? 2 : -2}deg)`, background: "#f4efe3", padding: "12px 12px 8px", boxShadow: "0 10px 26px rgba(0,0,0,0.6)", border: `4px solid ${INK}` }}>
      <div style={{ width: "100%", height: 190, overflow: "hidden", background: "#2a2f45", position: "relative" }}>
        <Img src={staticFile(`miya2/${n}.png`)} style={{ position: "absolute", left: "50%", top: 6, width: 200, transform: "translateX(-50%)", filter: `grayscale(${g}) brightness(${1 - g * 0.3})` }} />
      </div>
      <div style={{ fontFamily: TITLE, fontSize: 40, color: INK, textAlign: "center", marginTop: 6 }}>{name} <span style={{ color: "#c0392b" }}>{age}</span></div>
      {g > 0 && <div style={{ position: "absolute", inset: 0, background: `rgba(120,10,10,${0.25 * g})` }} />}
    </div>
  );
};

/** pixel mosaic block (censor) */
const Mosaic: React.FC<{ f: number; x: number; y: number; w: number; h: number; o: number }> = ({ f, x, y, w, h, o }) => {
  if (o <= 0) return null;
  const c = 26, t = Math.floor(f / 2), out = [];
  for (let i = 0; i < w / c; i++) for (let j = 0; j < h / c; j++) {
    const r = random(`${i}-${j}-${t}`);
    out.push(<rect key={`${i}-${j}`} x={x + i * c} y={y + j * c} width={c} height={c} fill={r < 0.3 ? "#0b0b0e" : r < 0.55 ? "#3b3d46" : r < 0.8 ? "#5a1212" : "#7b7f8c"} />);
  }
  return <g opacity={o}>{out}</g>;
};

// ---------------- scenes ----------------
const H1: React.FC<{ f: number }> = ({ f }) => {
  const flash = f > 44 ? interpolate(f, [44, 58], [1, 0.4], clamp) : 0;
  return (
    <MovingPhoto f={f} len={58} src="steps.jpg" from={[0, 0, 1.0]} to={[0, -340, 1.38]} gray={f > 44 ? 1 : 0}>
      <AbsoluteFill style={{ background: "#b30d0d", opacity: f > 44 && f < 48 ? 0.55 : 0, mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ background: "#fff", opacity: f < 3 ? 0.8 - f * 0.25 : 0 }} />
      <VHS f={f} t="DEC.30.2000" />
      <AbsoluteFill style={{ background: `rgba(0,0,0,${flash * 0.2})` }} />
    </MovingPhoto>
  );
};

const AnalogClock: React.FC<{ f: number; x: number; y: number; r: number; speed: number }> = ({ f, x, y, r, speed }) => (
  <g>
    <circle cx={x} cy={y} r={r + 12} fill="#1b1d26" stroke={INK} strokeWidth={6} />
    <circle cx={x} cy={y} r={r} fill="#efe8d8" stroke={INK} strokeWidth={4} />
    {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={x + Math.sin(i * Math.PI / 6) * r * 0.8} y1={y - Math.cos(i * Math.PI / 6) * r * 0.8} x2={x + Math.sin(i * Math.PI / 6) * r * 0.93} y2={y - Math.cos(i * Math.PI / 6) * r * 0.93} stroke={INK} strokeWidth={5} />)}
    <line x1={x} y1={y} x2={x + Math.sin((f * speed) / 12 * Math.PI / 180) * r * 0.5} y2={y - Math.cos((f * speed) / 12 * Math.PI / 180) * r * 0.5} stroke={INK} strokeWidth={9} strokeLinecap="round" />
    <line x1={x} y1={y} x2={x + Math.sin(f * speed * Math.PI / 180) * r * 0.78} y2={y - Math.cos(f * speed * Math.PI / 180) * r * 0.78} stroke="#c0392b" strokeWidth={6} strokeLinecap="round" />
  </g>
);

const H2: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Svg>
      <Cam f={f} keys={[[0, 540, 1050, 1.0], [60, 480, 980, 1.55]]}>
        <FrontHouse f={f} lights={1} px={-f * 1.5} />
        {/* shadow passing behind the lit window */}
        <g opacity={f > 18 && f < 50 ? 0.85 : 0}><Img2 n="killer" x={interpolate(f, [18, 50], [390, 560], clamp)} y={915} h={150} /></g>
      </Cam>
      <AnalogClock f={f} x={930} y={260} r={90} speed={140} />
    </Svg>
    <VHS f={f} t="11:47 PM" />
  </>
);

const H3: React.FC<{ f: number }> = ({ f }) => (
  <MovingPhoto f={f} len={42} src="house_aerial.jpg" from={[0, 0, 1.25]} to={[-60, 40, 1.6]} gray={0.3}>
    <AbsoluteFill style={{ background: "#fff", opacity: f < 2 ? 0.6 : 0 }} />
    <Stamp f={f} s={10} text="NEVER CAUGHT" top={520} />
    <div style={{ position: "absolute", top: 200, width: "100%", textAlign: "center", fontFamily: BODY, fontWeight: 700, fontSize: 44, color: "#fff", letterSpacing: 8, textShadow: "0 4px 14px #000" }}>SETAGAYA · TOKYO</div>
  </MovingPhoto>
);

const E1: React.FC<{ f: number }> = ({ f }) => {
  // walk along fence → climb fence → step on AC unit → window
  let x = 0, y = 1720, h = 300, rot = 0, flip = false, vis = 1;
  if (f < 30) { x = interpolate(f, [0, 30], [-120, 420]); y = 1720 + Math.abs(Math.sin(f / 3)) * -10; }
  else if (f < 48) { const k = (f - 30) / 18; x = 420; y = 1720 - k * 360; rot = Math.sin(f / 2) * 4; }
  else if (f < 66) { const k = (f - 48) / 18; x = 420; y = 1360 - k * 210; rot = Math.sin(f / 2) * 4; }
  else if (f < 84) { const k = (f - 66) / 18; x = 420 - k * 40; y = 1150 - k * 330; rot = Math.sin(f / 2) * 3; }
  else { x = 380; y = 820; vis = interpolate(f, [88, 100], [1, 0], clamp); }
  const winOpen = interpolate(f, [66, 82], [0, 1], clamp);
  const screen = interpolate(f, [62, 100], [0, 1], clamp);
  return (
    <>
      <Svg>
        <Cam f={f} keys={[[0, 480, 1500, 1.2], [40, 450, 1350, 1.3], [80, 400, 1000, 1.55], [110, 380, 860, 1.75]]}>
          <RearHouse f={f} winOpen={winOpen} screen={screen > 0 && screen < 1 ? screen : 0} />
          <g opacity={vis} style={{ filter: "drop-shadow(0 0 6px rgba(150,170,255,0.55))" }}><Img2 n="killer" x={x} y={y} h={h} rot={rot} flip={flip} /></g>
        </Cam>
      </Svg>
      <VHS f={f} t="11:58 PM" />
    </>
  );
};

/** continuous cut-away: Rei → Mikio → kitchen knife → Yasuko & Niina */
const C1: React.FC<{ f: number }> = ({ f }) => {
  // killer route through the house, keyed by local frame
  const route: [number, number, number][] = [
    [0, 140, 1000], [14, 250, 1000], [30, 520, 1000], [70, 520, 1000], [95, 880, 1000], // bathroom → Rei's room → landing
    [150, 880, 1000], [175, 820, 1380], [200, 640, 1380], [205, 640, 1380], // down the stairs to the kitchen
    [225, 820, 1380], [240, 880, 1000], [255, 800, 1000], [262, 800, 640], [270, 700, 640], [300, 700, 640],
  ];
  let kx = route[0][1], ky = route[0][2];
  for (let i = 0; i < route.length - 1; i++) {
    const [a, x0, y0] = route[i], [b, x1, y1] = route[i + 1];
    if (f >= a && f <= b) { const k = (f - a) / Math.max(1, b - a); kx = x0 + (x1 - x0) * k; ky = y0 + (y1 - y0) * k; break; }
    if (f > b) { kx = x1; ky = y1; }
  }
  // trail drawn so far
  const pts: string[] = [];
  for (let g = 0; g <= f; g += 3) {
    let px = route[0][1], py = route[0][2];
    for (let i = 0; i < route.length - 1; i++) { const [a, x0, y0] = route[i], [b, x1, y1] = route[i + 1]; if (g >= a && g <= b) { const k = (g - a) / Math.max(1, b - a); px = x0 + (x1 - x0) * k; py = y0 + (y1 - y0) * k; break; } if (g > b) { px = x1; py = y1; } }
    pts.push(`${px},${py - 6}`);
  }
  const flashAt = (a: number, b: number) => (f >= a && f < b ? (Math.floor(f / 2) % 2 ? 1 : 0.4) : 0);
  const fl = Math.max(flashAt(30, 46), flashAt(118, 134), flashAt(240, 252), flashAt(276, 296));
  // Mikio: desk (300,1380) → stairs → landing
  let mx = 300, my = 1380, mvis = 1;
  if (f > 75 && f < 100) { mx = interpolate(f, [75, 100], [300, 800]); }
  else if (f >= 100 && f < 118) { const k = (f - 100) / 18; mx = 800 + k * 60; my = 1380 - k * 380; }
  else if (f >= 118) { mx = 860; my = 1000; }
  mvis = f >= 134 ? 0 : 1;
  const lights = interpolate(f, [280, 300], [1, 0], clamp);
  const keys: [number, number, number, number][] = [[0, 300, 880, 1.55], [26, 500, 880, 1.7], [75, 520, 1180, 1.3], [118, 830, 1000, 1.75], [150, 760, 1150, 1.3], [200, 650, 1250, 1.65], [240, 760, 900, 1.25], [262, 620, 560, 1.65], [300, 540, 960, 0.98]];
  const snap = f >= 130 && f < 150;
  return (
    <>
      <Svg>
        <Cam f={f} keys={keys} shake={fl}>
          <Cutaway f={f} lights={lights} flash={fl} />
          {/* Rei asleep in bed */}
          <g><Img2 n="rei" x={460} y={905} h={150} rot={-90} style={{ filter: f > 46 ? "grayscale(1) brightness(0.6)" : "brightness(0.8)" }} /><rect x={470} y={895} width={170} height={45} rx={10} fill="#3e5fa0" stroke={INK} strokeWidth={3} /></g>
          {/* Mikio */}
          <g opacity={mvis}><Img2 n="mikio" x={mx} y={my} h={230} flip={mx > 300} style={{ filter: "brightness(0.85)" }} /></g>
          {/* Yasuko & Niina in the loft */}
          <g style={{ filter: f > 296 ? "grayscale(1) brightness(0.5)" : "brightness(0.8)" }}>
            <Img2 n="yasuko" x={470} y={640} h={200} opacity={f > 296 ? 0 : 1} />
            <Img2 n="niina" x={590} y={640} h={150} opacity={f > 296 ? 0 : 1} />
          </g>
          {/* trail + killer */}
          <polyline points={pts.join(" ")} fill="none" stroke="#e3262b" strokeWidth={7} strokeDasharray="16 10" strokeLinecap="round" opacity={0.9} />
          <circle cx={kx} cy={ky - 120} r={130} fill="url(#torch)" opacity={0.5} />
          <g style={{ filter: "drop-shadow(0 0 5px rgba(255,80,80,0.6))" }}><Img2 n="killer" x={kx} y={ky} h={230} flip={false} /></g>
          {/* censor blocks on each attack */}
          <Mosaic f={f} x={420} y={830} w={240} h={150} o={flashAt(30, 50) ? 1 : 0} />
          <Mosaic f={f} x={780} y={830} w={190} h={170} o={flashAt(118, 140) ? 1 : 0} />
          <Mosaic f={f} x={400} y={460} w={300} h={180} o={flashAt(276, 300) ? 1 : 0} />
          {/* broken blade */}
          {snap && <g transform={`translate(880,800) rotate(-20) scale(${pop(f, 130, 8)})`}>
            <path d="M-120,-8 L-10,-12 L-14,10 L-120,6 Z" fill="#cfd6dc" stroke={INK} strokeWidth={4} />
            <path d="M8,-14 L60,-16 L60,14 L4,12 Z" fill="#cfd6dc" stroke={INK} strokeWidth={4} transform={`translate(${(f - 130) * 2},${(f - 130) * 3}) rotate(${(f - 130) * 8})`} />
            <rect x={60} y={-16} width={70} height={30} rx={6} fill="#6b4630" stroke={INK} strokeWidth={4} />
          </g>}
          {/* kitchen knife grab */}
          {f >= 200 && f < 236 && <g transform={`translate(650,1150) scale(${pop(f, 200, 9)})`}>
            <circle r={70} fill="#fff3c8" opacity={0.25} />
            <path d="M-80,-6 L30,-14 L30,12 L-80,6 Z" fill="#e7ecef" stroke={INK} strokeWidth={4} /><rect x={30} y={-14} width={56} height={26} rx={6} fill="#2a2a2a" stroke={INK} strokeWidth={4} />
          </g>}
        </Cam>
      </Svg>
      <VictimCard f={f} s={4} n="rei" name="REI" age="6" x={180} gone={46} />
      <VictimCard f={f} s={78} n="mikio" name="MIKIO" age="44" x={420} gone={134} />
      <VictimCard f={f} s={236} n="yasuko" name="YASUKO" age="41" x={660} gone={296} />
      <VictimCard f={f} s={246} n="niina" name="NIINA" age="8" x={900} gone={296} />
      {snap && <Stamp f={f} s={132} text="BLADE SNAPPED" top={1180} size={84} color="#f2f2f2" rot={-4} />}
      {f >= 200 && f < 236 && <Stamp f={f} s={202} text="KITCHEN KNIFE" top={1180} size={84} color="#f2f2f2" rot={4} />}
    </>
  );
};

const HoursHud: React.FC<{ f0: number; f: number; label: string; time: string }> = ({ f, label, time }) => (
  <div style={{ position: "absolute", left: 50, top: 150, background: "rgba(10,12,22,0.88)", border: "4px solid #3a3f5a", borderRadius: 16, padding: "12px 26px" }}>
    <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 28, color: "#9fb0ff", letterSpacing: 3 }}>{label}</div>
    <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 64, color: "#ff3b30", textShadow: "0 0 10px #ff3b30" }}>{time}</div>
  </div>
);

const M1: React.FC<{ f: number }> = ({ f }) => {
  const door = interpolate(f, [0, 10], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  return (
    <>
      <Svg>
        <Cam f={f} keys={[[0, 760, 1050, 1.25], [42, 700, 1080, 1.5]]}>
          <Kitchen f={f} door={door} />
          {[0, 1, 2, 3].map((i) => f > 10 + i * 6 && <g key={i} transform={`translate(${250 + i * 60},1046) scale(${pop(f, 10 + i * 6, 9)})`}><path d="M-22,0 L22,0 L28,-40 L-28,-40 Z" fill="#f4a6c0" stroke={INK} strokeWidth={3} /><rect x={-29} y={-46} width={58} height={8} fill="#fff" stroke={INK} strokeWidth={2} /></g>)}
          <g style={{ filter: "drop-shadow(0 0 8px rgba(255,240,190,0.7))" }}><Img2 n="killer" x={560} y={1640} h={560} /></g>
        </Cam>
      </Svg>
      <HoursHud f0={0} f={f} label="ICE CREAMS EATEN" time={String(Math.min(4, Math.floor(f / 6)))} />
    </>
  );
};

const M2: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Svg>
      <Cam f={f} keys={[[0, 640, 1150, 1.4], [43, 680, 1100, 1.6]]}>
        <Bath f={f} />
        <g transform={`translate(840,862) scale(0.8)`}><FirstAid open={interpolate(f, [4, 16], [0, 1], clamp)} /></g>
        <g style={{ filter: "drop-shadow(0 0 6px rgba(180,200,255,0.6))" }}><Img2 n="killer" x={430} y={1780} h={760} /></g>
        <g transform={`translate(${520},${1300})`}><rect x={-24} y={-12} width={48} height={24} rx={6} fill="#fff" stroke="#b01e1e" strokeWidth={4} transform={`scale(${pop(f, 18, 10)})`} /></g>
      </Cam>
    </Svg>
    <HoursHud f0={0} f={f} label="TIME" time="12:52 AM" />
  </>
);

const M3: React.FC<{ f: number }> = ({ f }) => {
  const screen = (
    <g>
      <rect x={16} y={-186} width={168} height={128} fill="#0a246a" />
      <text x={100} y={-140} fontSize={20} fontFamily="monospace" fontWeight={700} fill="#fff" textAnchor="middle">CONNECTED</text>
      <text x={100} y={-90} fontSize={40} fontFamily="monospace" fontWeight={700} fill="#ffd25a" textAnchor="middle">01:18</text>
    </g>
  );
  return (
    <>
      <Svg>
        <Cam f={f} keys={[[0, 330, 1080, 2.1], [45, 300, 1060, 2.4]]}>
          <rect x={-200} y={-200} width={1500} height={2400} fill="#06080f" />
          <Desk x={170} y={1180} f={f} on screen={screen} />
          <ellipse cx={270} cy={1080} rx={260} ry={200} fill="#8fd3ff" opacity={0.12 + 0.04 * Math.sin(f / 2)} />
          <g style={{ filter: "drop-shadow(0 0 10px rgba(143,211,255,0.9)) brightness(1.1)" }}><Img2 n="killer" x={510} y={1300} h={300} flip /></g>
        </Cam>
      </Svg>
      <HoursHud f0={0} f={f} label="ONLINE" time="1:18 AM" />
    </>
  );
};

const Polaroid: React.FC<{ f: number; s: number; x: number; y: number; rot: number; label: string; children: React.ReactNode }> = ({ f, s, x, y, rot, label, children }) => {
  const p = pop(f, s, 10, 260);
  if (p < 0.01) return null;
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${0.6 + 0.4 * p})`} opacity={Math.min(1, p * 1.5)}>
      <rect x={-150} y={-150} width={300} height={340} fill="#f3efe6" stroke="#bdb6a6" strokeWidth={3} style={{ filter: "drop-shadow(0 12px 14px rgba(0,0,0,0.55))" }} />
      <rect x={-130} y={-130} width={260} height={240} fill="#1d1f27" />
      {children}
      <text y={160} fontFamily={TITLE} fontSize={34} fill={INK} textAnchor="middle">{label}</text>
      <circle cx={0} cy={-150} r={16} fill="#d61e2b" stroke="#7a0f15" strokeWidth={3} /><circle cx={-4} cy={-154} r={5} fill="#ff8a8a" />
    </g>
  );
};

const EV: React.FC<{ f: number }> = ({ f }) => {
  const str = interpolate(f, [8, 70], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${1.04 + f * 0.0008})` }}>
        <Img src={staticFile("miya2/board.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {/* English case note over the board's label */}
        <g transform="translate(830,215) rotate(4)">
          <rect x={-215} y={-150} width={430} height={300} fill="#efe3c8" stroke="#b9a885" strokeWidth={3} />
          <text y={-40} fontFamily="Georgia, serif" fontWeight={700} fontSize={64} fill="#1d1d1d" textAnchor="middle">CASE FILE</text>
          <text y={40} fontFamily="Georgia, serif" fontWeight={700} fontSize={48} fill="#1d1d1d" textAnchor="middle">SETAGAYA</text>
          <text y={100} fontFamily="Georgia, serif" fontSize={38} fill="#a01818" textAnchor="middle">DEC 30, 2000</text>
          <circle cx={0} cy={-140} r={14} fill="#d61e2b" />
        </g>
        {/* red string linking the evidence to the suspect photo */}
        <path d="M330,650 L760,860 L420,1150 L140,1560" fill="none" stroke="#c4161c" strokeWidth={5} strokeDasharray="2000" strokeDashoffset={2000 * (1 - str)} />
        <Polaroid f={f} s={14} x={330} y={650} rot={-5} label="HIS BLOOD">
          <g><rect x={-18} y={-90} width={36} height={150} rx={14} fill="#f4f4f4" stroke={INK} strokeWidth={4} /><rect x={-14} y={-10} width={28} height={64} rx={10} fill="#8e1414" /><rect x={-22} y={-104} width={44} height={20} rx={6} fill="#3e7bd6" stroke={INK} strokeWidth={3} /></g>
        </Polaroid>
        <Polaroid f={f} s={35} x={760} y={860} rot={6} label="FINGERPRINTS">
          <g>{[0, 1, 2, 3, 4].map((i) => <g key={i} transform={`translate(${-90 + i * 45},-10)`}>{[0, 1, 2, 3, 4].map((r) => <ellipse key={r} rx={6 + r * 4} ry={9 + r * 5} fill="none" stroke="#c8ccd6" strokeWidth={2} />)}</g>)}</g>
        </Polaroid>
        <Polaroid f={f} s={56} x={420} y={1150} rot={-3} label="HIS CLOTHES">
          <g><path d="M-90,-70 L-35,-88 Q0,-66 35,-88 L90,-70 L110,-20 L80,-10 L80,60 L-80,60 L-80,-10 L-110,-20 Z" fill="#4b5d7a" stroke={INK} strokeWidth={4} /><rect x={-60} y={10} width={64} height={36} rx={8} fill="#5a4630" stroke={INK} strokeWidth={3} /><path d="M20,10 q36,-46 70,0 Z" fill="#22252f" stroke={INK} strokeWidth={3} /></g>
        </Polaroid>
      </svg>
    </AbsoluteFill>
  );
};

const UN: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Svg>
      <Cam f={f} keys={[[0, 540, 1000, 1.0], [77, 540, 980, 1.12]]}>
        <rect x={-200} y={-200} width={1500} height={2400} fill="#1a1c24" />
        {Array.from({ length: 30 }).map((_, i) => <line key={i} x1={i * 40} y1={0} x2={i * 40 - 200} y2={1920} stroke="#20232c" strokeWidth={6} />)}
        <g transform="translate(540,1000) rotate(-1.5)">
          <rect x={-340} y={-560} width={680} height={1000} fill="#f2ecdc" stroke={INK} strokeWidth={5} style={{ filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.6))" }} />
          <rect x={-340} y={-560} width={680} height={130} fill="#b8161c" />
          <text y={-468} fontFamily={TITLE} fontSize={92} fill="#fff" textAnchor="middle" letterSpacing={6}>WANTED</text>
          <rect x={-260} y={-400} width={520} height={600} fill="#2a2d38" />
          <circle cx={0} cy={-150} r={300} fill="#3a3f52" opacity={0.5} />
          <Img2 n="killer" x={0} y={200} h={560} />
          <text y={-110} fontFamily={TITLE} fontSize={200} fill="#fff" textAnchor="middle" opacity={0.75 + 0.25 * Math.sin(f / 5)}>?</text>
          <text y={280} fontFamily={BODY} fontWeight={700} fontSize={44} fill={INK} textAnchor="middle">MALE · DNA ON FILE</text>
          <text y={340} fontFamily={BODY} fontWeight={600} fontSize={34} fill="#555" textAnchor="middle">NO MATCH IN ANY DATABASE</text>
          <text y={400} fontFamily={BODY} fontWeight={600} fontSize={30} fill="#777" textAnchor="middle">Tokyo Metropolitan Police</text>
        </g>
      </Cam>
    </Svg>
    <Stamp f={f} s={30} text="STILL UNSOLVED" top={860} size={110} rot={-10} />
  </>
);

const END: React.FC<{ f: number }> = ({ f }) => (
  <MovingPhoto f={f} len={60} src="house_aerial.jpg" from={[0, 0, 1.4]} to={[30, 20, 1.55]} gray={0.8} dim={0.55}>
    <div style={{ position: "absolute", top: 640, width: "100%", textAlign: "center", transform: `scale(${pop(f, 0, 10)})` }}>
      <div style={{ fontFamily: TITLE, fontSize: 150, color: "#fff", WebkitTextStroke: `6px ${INK}`, textShadow: "0 10px 0 #000" }}>WHO WAS HE?</div>
      <div style={{ display: "inline-block", marginTop: 30, background: "#e3262b", color: "#fff", fontFamily: TITLE, fontSize: 56, padding: "10px 36px", borderRadius: 16, border: `5px solid ${INK}`, transform: `scale(${1 + 0.04 * Math.sin(f / 4)})` }}>COMMENT YOUR THEORY ↓</div>
    </div>
  </MovingPhoto>
);

const Subs: React.FC = () => {
  const f = useCurrentFrame();
  const cur = (SUBS as [number, number, [string, boolean][]][]).find(([a, b]) => f >= a && f < b + 2);
  if (!cur || f >= T.end) return null;
  const p = spring({ frame: f - cur[0], fps: 30, config: { damping: 12, stiffness: 320 } });
  return (
    <div style={{ position: "absolute", top: 1470, width: "100%", textAlign: "center", padding: "0 60px", boxSizing: "border-box" }}>
      <span style={{ display: "inline-block", transform: `scale(${0.8 + 0.2 * p})`, fontFamily: BODY, fontWeight: 700, fontSize: 70, wordSpacing: 6 }}>
        {cur[2].map(([w, k], i) => (
          <React.Fragment key={i}>{i > 0 ? " " : ""}<span style={{ fontFamily: BODY, fontWeight: 700, fontSize: k ? 80 : 70, lineHeight: 1.25, color: k ? "#ff3b3b" : "#fff", WebkitTextStroke: `11px ${INK}`, paintOrder: "stroke fill", marginRight: 0, textTransform: "uppercase", textShadow: "0 7px 0 rgba(0,0,0,0.55)", display: "inline-block" }}>{w}</span></React.Fragment>
        ))}
      </span>
    </div>
  );
};

const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={W} height={H} style={{ position: "absolute", opacity: 0.09, mixBlendMode: "overlay" }}>
        <filter id="gn"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 9} /></filter>
        <rect width={W} height={H} filter="url(#gn)" />
      </svg>
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0 2px, transparent 2px 5px)" }} />
    </AbsoluteFill>
  );
};

const LIST: [number, number, React.FC<{ f: number }>][] = [
  [T.h1, T.h2, H1], [T.h2, T.h3, H2], [T.h3, T.e1, H3], [T.e1, T.cut, E1], [T.cut, T.m1, C1],
  [T.m1, T.m2, M1], [T.m2, T.m3, M2], [T.m3, T.ev, M3], [T.ev, T.un, EV], [T.un, T.end, UN], [T.end, T.fin, END],
];

const Scene: React.FC<{ C: React.FC<{ f: number }>; first: boolean }> = ({ C, first }) => {
  const f = useCurrentFrame();
  // whip-zoom transition in
  const k = first ? 1 : interpolate(f, [0, 6], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ transform: `scale(${1.18 - 0.18 * k})`, filter: k < 1 ? `blur(${(1 - k) * 14}px)` : undefined }}>
      <C f={f} />
    </AbsoluteFill>
  );
};

export const MiyaShort: React.FC<{ audio?: boolean }> = ({ audio = false }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    {LIST.map(([a, b, C], i) => (
      <Sequence key={i} from={a} durationInFrames={b - a}><Scene C={C} first={i === 0} /></Sequence>
    ))}
    <Subs />
    <Grain />
    {audio && <Audio src={staticFile("miya2/mix.wav")} />}
  </AbsoluteFill>
);
