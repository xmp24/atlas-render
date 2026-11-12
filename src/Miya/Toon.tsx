import React from "react";

export const OUT = "#17171d";
export type Pose = { lean: number; la1: number; la2: number; ra1: number; ra2: number; ll1: number; ll2: number; rl1: number; rl2: number; tilt?: number };
const S = (a: number) => Math.sin((a * Math.PI) / 180);
const C = (a: number) => Math.cos((a * Math.PI) / 180);
const pt = (o: [number, number], a: number, L: number): [number, number] => [o[0] + S(a) * L, o[1] + C(a) * L];

export const P: Record<string, Pose> = {
  stand: { lean: 0, la1: -6, la2: -2, ra1: 6, ra2: 2, ll1: -4, ll2: -3, rl1: 4, rl2: 3 },
  sit: { lean: -3, la1: 40, la2: 80, ra1: 50, ra2: 85, ll1: 85, ll2: 2, rl1: 90, rl2: 4 },
  type: { lean: 6, la1: 35, la2: 95, ra1: 45, ra2: 100, ll1: 85, ll2: 2, rl1: 90, rl2: 4 },
  reach: { lean: 6, la1: -6, la2: 0, ra1: 80, ra2: 88, ll1: -5, ll2: -3, rl1: 7, rl2: 3 },
  eat: { lean: 2, la1: 25, la2: 110, ra1: 30, ra2: 175, ll1: -4, ll2: -3, rl1: 5, rl2: 3 },
  hold: { lean: 4, la1: 25, la2: 95, ra1: 35, ra2: 100, ll1: -4, ll2: -3, rl1: 5, rl2: 3 },
  grief: { lean: 4, la1: 205, la2: 140, ra1: 155, ra2: 222, ll1: -5, ll2: -3, rl1: 5, rl2: 3, tilt: 8 },
  play: { lean: 12, la1: 40, la2: 70, ra1: 75, ra2: 110, ll1: 70, ll2: -40, rl1: 85, rl2: -10 },
  wave: { lean: 0, la1: -6, la2: -2, ra1: 150, ra2: 175, ll1: -4, ll2: -3, rl1: 4, rl2: 3 },
  sofa: { lean: -10, la1: 20, la2: 60, ra1: 35, ra2: 80, ll1: 85, ll2: 5, rl1: 88, rl2: 8 },
};
export const walk = (t: number, amp = 1): Pose => {
  const s = Math.sin(t), a = 24 * amp;
  return { lean: 3, la1: -s * a, la2: -s * a + 18, ra1: s * a, ra2: s * a + 18, ll1: s * a, ll2: s * a - Math.max(0, -Math.cos(t)) * 34, rl1: -s * a, rl2: -s * a - Math.max(0, Math.cos(t)) * 34 };
};
export const sneak = (t: number): Pose => {
  const s = Math.sin(t), a = 18;
  return { lean: 14, la1: 40 - s * 10, la2: 80, ra1: 50 + s * 10, ra2: 90, ll1: s * a + 10, ll2: s * a - 30, rl1: -s * a + 10, rl2: -s * a - 30 };
};
export const climb = (t: number): Pose => {
  const s = Math.sin(t);
  return { lean: 4, la1: 165 + s * 18, la2: 180 + s * 8, ra1: 170 - s * 18, ra2: 182 - s * 8, ll1: 45 + s * 35, ll2: -10 + s * 12, rl1: 45 - s * 35, rl2: -10 - s * 12 };
};
export const mixP = (a: Pose, b: Pose, k: number): Pose => {
  const o: any = {};
  for (const key of Object.keys(a)) o[key] = ((a as any)[key] ?? 0) * (1 - k) + ((b as any)[key] ?? 0) * k;
  return o;
};

export type Kind = "mikio" | "yasuko" | "niina" | "rei" | "killer" | "grandma";
type Face = "neutral" | "smile" | "shock" | "sad" | "cry" | "focus";

const LOOK: Record<Kind, { top: string; top2?: string; leg: string; shoe: string; skin: string; scale: number; head: number }> = {
  mikio: { top: "#2f56c8", leg: "#c9b48a", shoe: "#4a3424", skin: "#f3dcbc", scale: 1, head: 1 },
  yasuko: { top: "#d9b77e", leg: "#1d1d24", shoe: "#1d1d24", skin: "#f5dfc2", scale: 0.96, head: 1 },
  niina: { top: "#d8443a", top2: "#7fa6d6", leg: "#f2e3cf", shoe: "#ffffff", skin: "#f6e0c4", scale: 0.66, head: 1.18 },
  rei: { top: "#e8b23a", top2: "#3e7bd6", leg: "#24315e", shoe: "#2c3d7a", skin: "#f6e0c4", scale: 0.6, head: 1.2 },
  killer: { top: "#252a38", leg: "#1b1e27", shoe: "#0e0f13", skin: "#4b4e58", scale: 1.04, head: 1 },
  grandma: { top: "#8a6a96", leg: "#3b3446", shoe: "#2a2230", skin: "#f1d9bb", scale: 0.92, head: 1 },
};

export const Toon: React.FC<{
  x: number; y: number; s?: number; kind: Kind; pose: Pose; flip?: boolean; face?: Face; f?: number; look?: number; bandage?: boolean; holding?: React.ReactNode; dim?: number; glow?: string; tear?: number;
}> = ({ x, y, s = 1, kind, pose, flip, face = "neutral", f = 0, look = 0, bandage, holding, dim = 0, glow, tear = 0 }) => {
  const L = LOOK[kind];
  const sc = s * L.scale;
  const HR = 74 * L.head;
  const TH = 108, SH = 104, UA = 70, FA = 66, TORSO = 150;
  const hip: [number, number] = [0, 0];
  const breathe = Math.sin(f / 18) * 2.5;
  const neck = pt(hip, 180 - pose.lean, TORSO + breathe);
  const sh = pt(hip, 180 - pose.lean, TORSO - 22 + breathe);
  const head = pt(neck, 180 - pose.lean - (pose.tilt ?? 0), HR - 6);
  const limb = (o: [number, number], a1: number, a2: number, l1: number, l2: number) => {
    const j = pt(o, a1, l1), e = pt(j, a2, l2);
    return { j, e, d: `M${o[0]},${o[1]} L${j[0]},${j[1]} L${e[0]},${e[1]}` };
  };
  const bl = limb([-10, 0], pose.ll1, pose.ll2, TH, SH);
  const fl = limb([10, 0], pose.rl1, pose.rl2, TH, SH);
  const ba = limb([sh[0] - 22, sh[1]], pose.la1, pose.la2, UA, FA);
  const fa = limb([sh[0] + 22, sh[1]], pose.ra1, pose.ra2, UA, FA);
  const foot = TH + SH;
  const blinkPhase = (f + (kind.length * 37)) % 110;
  const blink = blinkPhase < 4 ? 0.12 : 1;
  const Leg = ({ l }: { l: ReturnType<typeof limb> }) => (
    <g>
      <path d={l.d} stroke={OUT} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={l.d} stroke={L.leg} strokeWidth={13} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx={l.e[0] + 12} cy={l.e[1] + 2} rx={24} ry={12} fill={L.shoe} stroke={OUT} strokeWidth={5} />
    </g>
  );
  const Arm = ({ l, front }: { l: ReturnType<typeof limb>; front?: boolean }) => (
    <g>
      <path d={l.d} stroke={OUT} strokeWidth={26} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={l.d} stroke={L.top} strokeWidth={17} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={l.e[0]} cy={l.e[1]} r={13} fill={kind === "killer" ? "#111" : L.skin} stroke={OUT} strokeWidth={5} />
      {front && bandage && <rect x={l.e[0] - 15} y={l.e[1] - 8} width={30} height={14} rx={4} fill="#fff" stroke="#c9302c" strokeWidth={3} />}
      {front && holding && <g transform={`translate(${l.e[0]},${l.e[1]})`}>{holding}</g>}
    </g>
  );
  // torso shape (jacket/top)
  const tw = kind === "niina" || kind === "rei" ? 54 : 50;
  const torso = `M${sh[0] - tw},${sh[1] - 4} Q${sh[0]},${sh[1] - 22} ${sh[0] + tw},${sh[1] - 4} L${tw - 8},${-6} Q0,${14} ${-tw + 8},${-6} Z`;
  const eyes = () => {
    const ex = 24 * L.head, ey = -2;
    const k = blink;
    const big = face === "shock" ? 1.35 : 1;
    if (kind === "killer")
      return (
        <g>
          <ellipse cx={-ex + look} cy={ey} rx={7} ry={6 * k} fill="#f4f4f4" />
          <ellipse cx={ex + look} cy={ey} rx={7} ry={6 * k} fill="#f4f4f4" />
          <path d={`M${-ex - 16},${ey - 18} L${-ex + 12},${ey - 10} M${ex + 16},${ey - 18} L${ex - 12},${ey - 10}`} stroke="#0b0b0e" strokeWidth={6} strokeLinecap="round" />
        </g>
      );
    return (
      <g>
        <ellipse cx={-ex + look} cy={ey} rx={7.5 * big} ry={11 * k * big} fill={OUT} />
        <ellipse cx={ex + look} cy={ey} rx={7.5 * big} ry={11 * k * big} fill={OUT} />
        {face === "sad" || face === "cry" ? (
          <path d={`M${-ex - 14},${ey - 22} L${-ex + 10},${ey - 30} M${ex + 14},${ey - 22} L${ex - 10},${ey - 30}`} stroke={OUT} strokeWidth={5} strokeLinecap="round" />
        ) : face === "focus" ? (
          <path d={`M${-ex - 12},${ey - 26} L${-ex + 10},${ey - 22} M${ex + 12},${ey - 26} L${ex - 10},${ey - 22}`} stroke={OUT} strokeWidth={5} strokeLinecap="round" />
        ) : (
          <path d={`M${-ex - 12},${ey - 26} Q${-ex},${ey - 32} ${-ex + 12},${ey - 26} M${ex - 12},${ey - 26} Q${ex},${ey - 32} ${ex + 12},${ey - 26}`} stroke={OUT} strokeWidth={4.5} fill="none" strokeLinecap="round" />
        )}
      </g>
    );
  };
  const mouth = () => {
    const my = 30 * L.head;
    if (kind === "killer") return null;
    if (face === "smile") return <path d={`M-16,${my - 4} Q0,${my + 12} 16,${my - 4}`} stroke={OUT} strokeWidth={5} fill="none" strokeLinecap="round" />;
    if (face === "shock") return <ellipse cx={0} cy={my + 2} rx={11} ry={15} fill="#5a1d1d" stroke={OUT} strokeWidth={4} />;
    if (face === "sad" || face === "cry") return <path d={`M-14,${my + 6} Q0,${my - 6} 14,${my + 6}`} stroke={OUT} strokeWidth={5} fill="none" strokeLinecap="round" />;
    return <path d={`M-10,${my} L10,${my}`} stroke={OUT} strokeWidth={5} strokeLinecap="round" />;
  };
  const hair = () => {
    const r = HR;
    switch (kind) {
      case "mikio":
        return (
          <>
            <path d={`M${-r + 4},-8 Q${-r},${-r - 6} 0,${-r - 8} Q${r},${-r - 6} ${r - 4},-8 Q${r * 0.6},${-r * 0.65} 0,${-r * 0.7} Q${-r * 0.6},${-r * 0.65} ${-r + 4},-8 Z`} fill="#24201c" stroke={OUT} strokeWidth={4} />
            <path d={`M${-r * 0.62},${r * 0.28} Q${-r * 0.55},${r * 0.95} 0,${r + 4} Q${r * 0.55},${r * 0.95} ${r * 0.62},${r * 0.28} Q${r * 0.3},${r * 0.62} 0,${r * 0.6} Q${-r * 0.3},${r * 0.62} ${-r * 0.62},${r * 0.28} Z`} fill="#2d2925" />
            <circle cx={-24} cy={-2} r={19} fill="none" stroke="#3a3a3a" strokeWidth={4} />
            <circle cx={24} cy={-2} r={19} fill="none" stroke="#3a3a3a" strokeWidth={4} />
            <path d="M-5,-2 L5,-2" stroke="#3a3a3a" strokeWidth={4} />
          </>
        );
      case "yasuko":
        return <path d={`M${-r - 8},${r * 0.55} Q${-r - 14},${-r - 10} 0,${-r - 12} Q${r + 14},${-r - 10} ${r + 8},${r * 0.55} L${r - 10},${r * 0.5} Q${r - 6},${-r * 0.35} ${r * 0.2},${-r * 0.6} Q${-r * 0.3},${-r * 0.35} ${-r + 12},${-r * 0.1} L${-r + 10},${r * 0.5} Z`} fill="#141216" stroke={OUT} strokeWidth={4} />;
      case "niina":
        return (
          <>
            <circle cx={r + 6} cy={-r * 0.35} r={r * 0.42} fill="#141216" stroke={OUT} strokeWidth={4} />
            <circle cx={r - 6} cy={-r * 0.5} r={9} fill="#e0273b" />
            <path d={`M${-r - 4},${r * 0.3} Q${-r - 8},${-r - 8} 0,${-r - 8} Q${r + 8},${-r - 8} ${r + 4},${r * 0.2} Q${r * 0.5},${-r * 0.6} ${-r * 0.1},${-r * 0.45} Q${-r * 0.7},${-r * 0.3} ${-r + 6},${r * 0.3} Z`} fill="#141216" stroke={OUT} strokeWidth={4} />
          </>
        );
      case "rei":
        return <path d={`M${-r + 2},-2 Q${-r - 4},${-r - 6} 0,${-r - 8} Q${r + 4},${-r - 6} ${r - 2},-2 L${r * 0.55},${-r * 0.35} L${r * 0.25},${-r * 0.2} L0,${-r * 0.4} L${-r * 0.3},${-r * 0.2} L${-r * 0.6},${-r * 0.35} Z`} fill="#1a1714" stroke={OUT} strokeWidth={4} />;
      case "grandma":
        return (
          <>
            <circle cx={0} cy={-r - 12} r={r * 0.38} fill="#c9c6cc" stroke={OUT} strokeWidth={4} />
            <path d={`M${-r + 2},${r * 0.1} Q${-r - 6},${-r - 6} 0,${-r - 6} Q${r + 6},${-r - 6} ${r - 2},${r * 0.1} Q${r * 0.4},${-r * 0.55} 0,${-r * 0.55} Q${-r * 0.4},${-r * 0.55} ${-r + 2},${r * 0.1} Z`} fill="#c9c6cc" stroke={OUT} strokeWidth={4} />
            <circle cx={-24} cy={-2} r={17} fill="none" stroke="#6b5b3a" strokeWidth={3.5} />
            <circle cx={24} cy={-2} r={17} fill="none" stroke="#6b5b3a" strokeWidth={3.5} />
          </>
        );
      case "killer":
        return (
          <>
            <path d={`M${-r - 4},${-r * 0.4} Q${-r - 6},${-r - 30} 0,${-r - 32} Q${r + 6},${-r - 30} ${r + 4},${-r * 0.4} Z`} fill="#1a1c24" stroke={OUT} strokeWidth={5} />
            <rect x={-r - 8} y={-r * 0.62} width={2 * r + 16} height={26} rx={10} fill="#22252f" stroke={OUT} strokeWidth={5} />
            {[-48, -24, 0, 24, 48].map((dx) => <line key={dx} x1={dx} y1={-r * 0.6} x2={dx} y2={-r * 0.6 + 22} stroke="#14161c" strokeWidth={4} />)}
          </>
        );
    }
  };
  const female = kind === "yasuko" || kind === "niina" || kind === "grandma";
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -sc : sc},${sc}) translate(0,${-foot})`} style={{ filter: dim ? `brightness(${1 - dim})` : undefined }}>
      {glow && <ellipse cx={0} cy={-120} rx={190} ry={330} fill={glow} opacity={0.18} />}
      <ellipse cx={0} cy={foot + 10} rx={70} ry={12} fill="#000" opacity={0.25} />
      <Arm l={ba} />
      <Leg l={bl} />
      <Leg l={fl} />
      <path d={torso} fill={L.top} stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
      {kind === "rei" && (<g><clipPath id={`rc${Math.round(x)}`}><path d={torso} /></clipPath><g clipPath={`url(#rc${Math.round(x)})`}>{[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${-tw - 30},${sh[1] + 18 + i * 28} L${tw + 30},${sh[1] + 18 + i * 28}`} stroke={i % 2 ? "#d8443a" : L.top2} strokeWidth={11} />)}</g><path d={torso} fill="none" stroke={OUT} strokeWidth={6} /></g>)}
      {kind === "niina" && <path d={`M${-tw + 12},${sh[1] + 30} L${tw - 12},${sh[1] + 30} L${tw + 16},${30} L${-tw - 16},${30} Z`} fill={L.top2} stroke={OUT} strokeWidth={5} />}
      {female && kind !== "niina" && <path d={`M${-tw + 6},-12 L${tw - 6},-12 L${tw + 20},${54} L${-tw - 20},${54} Z`} fill={kind === "grandma" ? "#5b4e66" : "#1d1d24"} stroke={OUT} strokeWidth={5} />}
      {kind === "killer" && (
        <>
          <path d={`M${sh[0]},${sh[1]} L${sh[0] * 0.3},${-10}`} stroke="#14161e" strokeWidth={5} />
          <rect x={-46} y={-38} width={66} height={42} rx={12} fill="#5a4630" stroke={OUT} strokeWidth={5} />
          <path d="M-46,-30 L20,-30" stroke="#3b2d1d" strokeWidth={4} />
        </>
      )}
      {kind === "grandma" && <path d={`M${sh[0] - 10},${sh[1]} L${-4},${-10} M${sh[0] + 10},${sh[1]} L${4},${-10}`} stroke="#6f5379" strokeWidth={6} />}
      {/* neck */}
      <g transform={`translate(${head[0]},${head[1]})`}>
        <circle r={HR} fill={L.skin} stroke={OUT} strokeWidth={6} />
        {kind === "killer" && <circle r={HR - 3} fill="url(#killerShade)" />}
        {kind !== "killer" && <ellipse cx={-HR * 0.42} cy={HR * 0.32} rx={10} ry={6} fill="#e8a59a" opacity={0.45} />}
        {kind !== "killer" && <ellipse cx={HR * 0.42} cy={HR * 0.32} rx={10} ry={6} fill="#e8a59a" opacity={0.45} />}
        {eyes()}
        {mouth()}
        {hair()}
        {(face === "cry" || tear > 0) && <path d={`M${-26},${16 + (f % 20) * 2} q-6,10 0,14 q6,-4 0,-14 Z`} fill="#8fd0ff" stroke={OUT} strokeWidth={2} />}
      </g>
      <Arm l={fa} front />
    </g>
  );
};

export const ToonDefs: React.FC = () => (
  <defs>
    <radialGradient id="killerShade" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stopColor="#6d707b" />
      <stop offset="100%" stopColor="#2a2c35" />
    </radialGradient>
    <linearGradient id="lightCone" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#ffe9a8" stopOpacity="0.55" />
      <stop offset="100%" stopColor="#ffe9a8" stopOpacity="0" />
    </linearGradient>
    <linearGradient id="fridgeCone" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0%" stopColor="#fff7d6" stopOpacity="0.55" />
      <stop offset="100%" stopColor="#fff7d6" stopOpacity="0" />
    </linearGradient>
    <linearGradient id="crtCone" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#8fd3ff" stopOpacity="0.45" />
      <stop offset="100%" stopColor="#8fd3ff" stopOpacity="0" />
    </linearGradient>
    <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#0c1230" />
      <stop offset="100%" stopColor="#2a3566" />
    </linearGradient>
    <linearGradient id="daySky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#8fb9e6" />
      <stop offset="100%" stopColor="#dbe9f3" />
    </linearGradient>
    <radialGradient id="vig" cx="50%" cy="50%" r="75%">
      <stop offset="55%" stopColor="#000" stopOpacity="0" />
      <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
    </radialGradient>
  </defs>
);
