import React from "react";

/** Stickman rig in the style of the user's sheet: big glossy head, angry white eyes, tubular limbs with rim highlight.
 *  Units: total height 585 (sheet pixels). (x,y) = point between the feet on the ground. */
const FILL = "#2b2b2f", BACK = "#1d1d21", LINE = "#09090b", HI = "rgba(255,255,255,0.75)";
const S = (a: number) => Math.sin((a * Math.PI) / 180), C = (a: number) => Math.cos((a * Math.PI) / 180);
const pt = (o: [number, number], a: number, L: number): [number, number] => [o[0] + S(a) * L, o[1] + C(a) * L];

export type SP = { lean: number; head: number; bob: number; t1: number; s1: number; t2: number; s2: number; u1: number; f1: number; u2: number; f2: number; f1o?: number; f2o?: number };
export const REST: SP = { lean: 2, head: 0, bob: 0, t1: 4, s1: 2, t2: -4, s2: -2, u1: 6, f1: 10, u2: -6, f2: -2 };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const mixSP = (a: SP, b: SP, k: number): SP => { const o: any = {}; for (const key of Object.keys(a)) o[key] = lerp((a as any)[key] ?? 0, (b as any)[key] ?? 0, k); return o; };
const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

/** fluid walk: phase in radians; amp 0..1 (0 = standing) */
export const walkSP = (ph: number, amp = 1, sneak = 0): SP => {
  const leg = (p: number) => {
    const thigh = 26 * Math.sin(p) * amp;
    const flex = (8 + 58 * Math.pow(Math.max(0, Math.cos(p)), 1.4)) * amp + sneak * 18;
    return { t: thigh + sneak * 10, s: thigh - flex + sneak * 10 };
  };
  const A = leg(ph), B = leg(ph + Math.PI);
  const arm = (p: number) => { const u = -20 * Math.sin(p) * amp; return { u: u + sneak * 20, f: u + (14 + 18 * Math.max(0, -Math.sin(p))) * amp + sneak * 40 }; };
  const a = arm(ph), b = arm(ph + Math.PI);
  return { lean: 4 * amp + sneak * 14, head: -2 * Math.sin(2 * ph) * amp - sneak * 6, bob: -10 * Math.abs(Math.cos(ph)) * amp + 4 * amp + sneak * 30, t1: A.t, s1: A.s, t2: B.t, s2: B.s, u1: a.u, f1: a.f, u2: b.u, f2: b.f };
};
/** horizontal distance covered per radian of phase (rig units) so feet don't slide */
export const STRIDE_PER_RAD = (4 * 205 * Math.sin((26 * Math.PI) / 180)) / (2 * Math.PI);

export const idleSP = (f: number): SP => ({ ...REST, bob: Math.sin(f / 22) * 3, head: Math.sin(f / 47) * 3, u1: 6 + Math.sin(f / 22) * 1.5, u2: -6 - Math.sin(f / 22) * 1.5 });
export const sitSP: SP = { lean: -4, head: 4, bob: 205 - 105, t1: 88, s1: 6, t2: 92, s2: 8, u1: 40, f1: 92, u2: 50, f2: 98 };

/** keyed pose track with eased interpolation */
export const track = (f: number, keys: [number, SP][]): SP => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) { const [a, A] = keys[i], [b, B] = keys[i + 1]; if (f <= b) return mixSP(A, B, ease((f - a) / (b - a))); }
  return keys[keys.length - 1][1];
};
export const trackXY = (f: number, keys: [number, number, number][]): [number, number] => {
  if (f <= keys[0][0]) return [keys[0][1], keys[0][2]];
  for (let i = 0; i < keys.length - 1; i++) { const [a, x0, y0] = keys[i], [b, x1, y1] = keys[i + 1]; if (f <= b) { const k = ease((f - a) / (b - a)); return [lerp(x0, x1, k), lerp(y0, y1, k)]; } }
  const l = keys[keys.length - 1]; return [l[1], l[2]];
};

const Tube: React.FC<{ d: string; w: number; back?: boolean; hi?: boolean }> = ({ d, w, back, hi = true }) => (
  <g>
    <path d={d} stroke={LINE} strokeWidth={w + 8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} stroke={back ? BACK : FILL} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    {hi && !back && <path d={d} stroke={HI} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" transform={`translate(${-w * 0.28},0)`} opacity={0.55} />}
  </g>
);

const Head: React.FC<{ cx: number; cy: number; view: "side" | "front" | "three" | "back"; blink?: number; dir?: number }> = ({ cx, cy, view, blink = 1, dir = 1 }) => {
  const r = 82;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 4} fill={LINE} />
      <circle cx={cx} cy={cy} r={r} fill={FILL} />
      <circle cx={cx} cy={cy} r={r} fill="url(#stkShade2)" />
      <defs><radialGradient id="stkShade2" cx="0.35" cy="0.3" r="0.75"><stop offset="0" stopColor="#5a5a62" stopOpacity="0.55" /><stop offset="0.6" stopColor="#2b2b2f" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.45" /></radialGradient></defs>
      <path d={`M${cx - r * 0.72},${cy - r * 0.32} A${r * 0.8},${r * 0.8} 0 0 1 ${cx - r * 0.1},${cy - r * 0.8}`} stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.85} />
      <ellipse cx={cx - r * 0.42} cy={cy - r * 0.5} rx={10} ry={5} fill="#fff" opacity={0.35} transform={`rotate(-40,${cx - r * 0.42},${cy - r * 0.5})`} />
      {view !== "back" && (() => {
        const eye = (ex: number, flipE: number, sc = 1) => (
          <path d={`M${ex - 22 * sc * flipE},${cy - 6} Q${ex},${cy - 2 - 10 * blink} ${ex + 22 * sc * flipE},${cy - 16} Q${ex + 6 * flipE},${cy + 12 * blink} ${ex - 22 * sc * flipE},${cy - 6} Z`} fill="#fff" />
        );
        if (view === "front") return <g>{eye(cx - 30, -1)}{eye(cx + 30, 1)}</g>;
        if (view === "three") return <g>{eye(cx - 16 + 20 * dir, -dir, 0.8)}{eye(cx + 34 * dir + 14 * dir, dir, 1)}</g>;
        return eye(cx + 48 * dir, dir, 0.9);
      })()}
    </g>
  );
};

export const Stick: React.FC<{ x: number; y: number; h?: number; p: SP; view?: "side" | "front" | "three" | "back"; flip?: boolean; f?: number; item?: React.ReactNode; shadow?: number; rim?: string; opacity?: number }> = ({ x, y, h = 300, p, view = "side", flip, f = 0, item, shadow = 0.35, rim, opacity = 1 }) => {
  const s = h / 585;
  const dir = flip ? -1 : 1;
  const blink = (f + 13) % 97 < 3 ? 0.15 : 1;
  const hip: [number, number] = [0, -205 + p.bob];
  if (view === "side") {
    const neck = pt(hip, 180 - p.lean, 190);
    const sh = pt(hip, 180 - p.lean, 172);
    const head = pt(neck, 180 - p.lean - p.head, 84);
    const leg = (t: number, sAng: number) => { const k = pt(hip, t, 105), a = pt(k, sAng, 100); return { d: `M${hip[0]},${hip[1]} L${k[0]},${k[1]} L${a[0]},${a[1]}`, a, sAng }; };
    const arm = (u: number, fo: number) => { const e = pt(sh, u, 102), w = pt(e, fo, 96); return { d: `M${sh[0]},${sh[1]} L${e[0]},${e[1]} L${w[0]},${w[1]}`, w }; };
    const L1 = leg(p.t1, p.s1), L2 = leg(p.t2, p.s2), A1 = arm(p.u1, p.f1), A2 = arm(p.u2, p.f2);
    const foot = (l: { a: [number, number]; sAng: number }, back?: boolean) => {
      const ang = -l.sAng * 0.55;
      return <g transform={`translate(${l.a[0]},${l.a[1]}) rotate(${ang})`}><rect x={-14} y={-12} width={50} height={24} rx={12} fill={back ? BACK : FILL} stroke={LINE} strokeWidth={4} /></g>;
    };
    const torso = `M${hip[0]},${hip[1]} L${sh[0]},${sh[1]}`;
    return (
      <g transform={`translate(${x},${y}) scale(${s * dir},${s})`} opacity={opacity}>
        {shadow > 0 && <ellipse cx={0} cy={4} rx={110} ry={16} fill="#000" opacity={shadow} />}
        <Tube d={A2.d} w={24} back />
        <Tube d={L2.d} w={30} back />{foot(L2, true)}
        <Tube d={torso} w={58} />
        <Tube d={L1.d} w={30} />{foot(L1)}
        <Head cx={head[0]} cy={head[1]} view="side" blink={blink} dir={1} />
        <Tube d={A1.d} w={24} />
        <circle cx={A1.w[0]} cy={A1.w[1]} r={17} fill={FILL} stroke={LINE} strokeWidth={4} />
        {item && <g transform={`translate(${A1.w[0]},${A1.w[1]}) scale(${dir},1)`}>{item}</g>}
        {rim && <path d={torso} stroke={rim} strokeWidth={4} transform="translate(26,0)" opacity={0.5} />}
      </g>
    );
  }
  // front / back / three-quarter: symmetric body, breathing and weight shift
  const sway = Math.sin(f / 30) * 2;
  const breathe = 1 + Math.sin(f / 22) * 0.012;
  const shY = -395 + p.bob, hipY = -205 + p.bob;
  const legL = `M-14,${hipY} L-18,${-105} L-20,-8`, legR = `M14,${hipY} L18,${-105} L20,-8`;
  const armL = `M-34,${shY + 8} L${-46 - p.u1 * 0.3},${shY + 105} L${-48 - p.u1 * 0.3},${shY + 200}`;
  const armR = `M34,${shY + 8} L${46 + p.u2 * 0.3 * -1},${shY + 105} L${48 + p.u2 * 0.3 * -1},${shY + 200}`;
  return (
    <g transform={`translate(${x + sway},${y}) scale(${s * dir},${s})`} opacity={opacity}>
      {shadow > 0 && <ellipse cx={0} cy={4} rx={90} ry={16} fill="#000" opacity={shadow} />}
      <Tube d={legL} w={30} hi={view !== "back"} /><Tube d={legR} w={30} hi={view !== "back"} />
      <ellipse cx={-22} cy={-4} rx={26} ry={13} fill={FILL} stroke={LINE} strokeWidth={4} /><ellipse cx={22} cy={-4} rx={26} ry={13} fill={FILL} stroke={LINE} strokeWidth={4} />
      <g transform={`translate(0,${hipY}) scale(1,${breathe}) translate(0,${-hipY})`}>
        <path d={`M-36,${shY} L36,${shY} L22,${hipY + 10} L-22,${hipY + 10} Z`} fill={FILL} stroke={LINE} strokeWidth={5} strokeLinejoin="round" />
        <path d={`M-26,${shY + 14} L-16,${hipY}`} stroke={HI} strokeWidth={2.6} opacity={view === "back" ? 0.15 : 0.5} />
      </g>
      <Tube d={armL} w={24} hi={view !== "back"} /><Tube d={armR} w={24} hi={view !== "back"} />
      <rect x={-12} y={shY - 22} width={24} height={26} fill={FILL} />
      <Head cx={0} cy={shY - 104 + p.head * 0.5} view={view} blink={blink} dir={1} />
      {item}
    </g>
  );
};

// ---------- back view with 2-bone IK (ladder climbing) ----------
const ik2 = (sx: number, sy: number, tx: number, ty: number, l1: number, l2: number, out: number): [number, number] => {
  let dx = tx - sx, dy = ty - sy; let d = Math.hypot(dx, dy);
  const maxd = l1 + l2 - 0.5; if (d > maxd) { dx *= maxd / d; dy *= maxd / d; d = maxd; }
  const a = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
  const base = Math.atan2(dy, dx); const ang = base + a * out;
  return [sx + Math.cos(ang) * l1, sy + Math.sin(ang) * l1];
};
/** back-view stickman: hips at (hx,hy) in world px; hands/feet at world targets; s = px per rig unit */
export const StickIK: React.FC<{ hx: number; hy: number; s: number; lh: [number, number]; rh: [number, number]; lf: [number, number]; rf: [number, number]; headTilt?: number; opacity?: number }> = ({ hx, hy, s, lh, rh, lf, rf, headTilt = 0, opacity = 1 }) => {
  const shY = hy - 185 * s, shL: [number, number] = [hx - 30 * s, shY + 6 * s], shR: [number, number] = [hx + 30 * s, shY + 6 * s];
  const hpL: [number, number] = [hx - 14 * s, hy], hpR: [number, number] = [hx + 14 * s, hy];
  const eL = ik2(shL[0], shL[1], lh[0], lh[1], 102 * s, 96 * s, -1), eR = ik2(shR[0], shR[1], rh[0], rh[1], 102 * s, 96 * s, 1);
  const kL = ik2(hpL[0], hpL[1], lf[0], lf[1], 105 * s, 100 * s, 1), kR = ik2(hpR[0], hpR[1], rf[0], rf[1], 105 * s, 100 * s, -1);
  const T: React.FC<{ d: string; w: number }> = ({ d, w }) => (<g><path d={d} stroke={LINE} strokeWidth={(w + 8) * s} fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d={d} stroke={FILL} strokeWidth={w * s} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>);
  const P = (a: number[], b: number[], c: number[]) => `M${a[0]},${a[1]} L${b[0]},${b[1]} L${c[0]},${c[1]}`;
  const hc: [number, number] = [hx + headTilt * 10 * s, shY - 100 * s];
  return (
    <g opacity={opacity}>
      <T d={P(hpL, kL, lf)} w={30} /><T d={P(hpR, kR, rf)} w={30} />
      <ellipse cx={lf[0]} cy={lf[1]} rx={22 * s} ry={11 * s} fill={FILL} stroke={LINE} strokeWidth={4 * s} />
      <ellipse cx={rf[0]} cy={rf[1]} rx={22 * s} ry={11 * s} fill={FILL} stroke={LINE} strokeWidth={4 * s} />
      <path d={`M${hx - 36 * s},${shY} L${hx + 36 * s},${shY} L${hx + 22 * s},${hy + 10 * s} L${hx - 22 * s},${hy + 10 * s} Z`} fill={FILL} stroke={LINE} strokeWidth={5 * s} strokeLinejoin="round" />
      <T d={P(shL, eL, lh)} w={24} /><T d={P(shR, eR, rh)} w={24} />
      <circle cx={lh[0]} cy={lh[1]} r={16 * s} fill={FILL} stroke={LINE} strokeWidth={4 * s} /><circle cx={rh[0]} cy={rh[1]} r={16 * s} fill={FILL} stroke={LINE} strokeWidth={4 * s} />
      <rect x={hx - 12 * s} y={shY - 22 * s} width={24 * s} height={26 * s} fill={FILL} />
      <path d={`M${hx - 26 * s},${shY + 12 * s} L${hx - 15 * s},${hy}`} stroke="rgba(255,255,255,0.22)" strokeWidth={5 * s} strokeLinecap="round" />
      <circle cx={hc[0]} cy={hc[1]} r={86 * s} fill={LINE} /><circle cx={hc[0]} cy={hc[1]} r={82 * s} fill={FILL} />
      <circle cx={hc[0]} cy={hc[1]} r={82 * s} fill="url(#stkShade)" />
      <defs><radialGradient id="stkShade" cx="0.35" cy="0.3" r="0.75"><stop offset="0" stopColor="#5a5a62" stopOpacity="0.55" /><stop offset="0.6" stopColor="#2b2b2f" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.45" /></radialGradient></defs>
      <path d={`M${hc[0] - 58 * s},${hc[1] - 26 * s} A${66 * s},${66 * s} 0 0 1 ${hc[0] - 8 * s},${hc[1] - 66 * s}`} stroke="#fff" strokeWidth={4 * s} fill="none" opacity={0.6} strokeLinecap="round" />
    </g>
  );
};
