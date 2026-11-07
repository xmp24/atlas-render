import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {mesh} from 'topojson-client';
import WORLD from './world.json';
import TOPO from './worldtopo.json';
import TLJ from './sp8-tl.json';
const TL = TLJ as any;
import {P, Cam, INK, CREAM, RED, BLUE, GREEN, YELLOW, ORANGE, clamp, ease, lerp, fmt, font, font2, popT, piece, arcPath, partial, Mover, Boom, Face, Mood, Bubble, Avatar, TankToken} from './lib3';
import {Ocean} from './War5';
import {PIECES, FlagSvg, fitFlagBox, segs, visD, OBJ, WFlag, usePreload, faceSize, Piece} from './War6';

// ================= datos =================
type Cap = {t: number; c: string; to: string; from: string; lead: string; o: P};
export const CAPS: Cap[] = (TL.captures as any[]).map(([t, c, to, from, lead, ox, oy]) => ({t, c, to, from, lead, o: [ox, oy]}));
export const TEAMOF = TL.team as Record<string, string>;
const PL = (WORLD as any).players as Record<string, {code: string; name: string; area: number; home: P}>;
export const nameOf = (c: string) => PL[c]?.name || c;
export const TNAME = TL.tname as Record<string, string>;
export const TCOL: Record<string, string> = TL.tcol;
export const TDARK: Record<string, string> = TL.tdark;
const CHAMP: string = TL.champion; const ORDER: string[] = TL.intro_order || TL.teams;
export const TFLAG = (t: string) => 't' + t.toLowerCase();
type Match = {n: number; a: string; b: string; t0: number; t1: number; days: number; winner: string; title: string; sa: number; sb: number; traj: [number, number, number][]};
export const MATCHES = TL.matches as unknown as Match[];
type Front = {t0: number; t1: number; team: string; lead: string; label: string; kind: string; targets: string[]; lib: boolean};
export const FRONTS = TL.fronts as Front[];
const UNITS = TL.units as [string, string, number, number, number, number, number, number][];
export const BUB = TL.bubbles as [number, number, string, string][];
const CODES = Object.keys(PL);
export const D = 0.9;
export const HOME: Record<string, P> = Object.fromEntries(CODES.map((c) => [c, PL[c].home]));
const AREA: Record<string, number> = {};
PIECES.forEach((p) => (AREA[p.code] = (AREA[p.code] || 0) + p.area));
const BB: Record<string, number[]> = {};
PIECES.forEach((p) => { const b = BB[p.code]; BB[p.code] = b ? [Math.min(b[0], p.bbox[0]), Math.min(b[1], p.bbox[1]), Math.max(b[2], p.bbox[2]), Math.max(b[3], p.bbox[3])] : [...p.bbox]; });
const PCS: Record<string, Piece[]> = {};
PIECES.forEach((p) => (PCS[p.code] = PCS[p.code] || []).push(p));

// control por estado (k capturas completadas)
const CTRL: Record<string, string>[] = [{...TEAMOF}];
CAPS.forEach((c, i) => { const n = {...CTRL[i]}; n[c.c] = c.to; CTRL.push(n); });
export const doneK = (t: number) => { let k = 0; while (k < CAPS.length && CAPS[k].t + D <= t) k++; return k; };
export const firedK = (t: number) => { let k = 0; while (k < CAPS.length && CAPS[k].t <= t) k++; return k; };
export const ctrlAt = (t: number) => CTRL[firedK(t)];
const capsOf: Record<string, Cap[]> = {};
CAPS.forEach((c) => (capsOf[c.c] = capsOf[c.c] || []).push(c));
const attackPt = (c: Cap) => {
  const v = HOME[c.c], b = BB[c.c];
  const half = Math.hypot(b[2] - b[0], b[3] - b[1]) / 2;
  const dx = c.o[0] - v[0], dy = c.o[1] - v[1], dl = Math.hypot(dx, dy) || 1;
  const off = Math.min(dl, half * 0.9);
  const A: P = [v[0] + (dx / dl) * off, v[1] + (dy / dl) * off];
  const R = Math.max(...[[b[0], b[1]], [b[2], b[1]], [b[0], b[3]], [b[2], b[3]]].map(([x, y]) => Math.hypot(x - A[0], y - A[1]))) * 1.05;
  return {A, R};
};
const CAPGEO = CAPS.map(attackPt);
const capIdx = new Map<Cap, number>(CAPS.map((c, i) => [c, i]));

// ================= cámara =================
const CAMK = TL.cam as [number, number, number, number][];
const SHAKE: [number, number][] = [...CAPS.filter((c) => c.lead).map((c) => [c.t, 2.2] as [number, number]), ...(TL.stamps as any[]).map((s) => [s.t, 5] as [number, number])];
export const camera = (t: number): Cam => {
  let i = 0;
  while (i < CAMK.length - 1 && t >= CAMK[i + 1][0]) i++;
  const [ta, xb, yb, sb] = CAMK[i];
  const [, xa, ya, sa] = CAMK[Math.max(0, i - 1)];
  const k = i === 0 ? 1 : lerp(t, ta, ta + 1.1, 0, 1, Easing.inOut(Easing.cubic));
  let cx = xa + (xb - xa) * k, cy = ya + (yb - ya) * k;
  const tn = i < CAMK.length - 1 ? CAMK[i + 1][0] : ta + 10;
  const drift = 1 + 0.05 * lerp(t, ta + 1.1, tn, 0, 1, Easing.linear);
  let s = sa * Math.pow(sb / sa, k) * drift;
  for (const [h, amp] of SHAKE) { const d = t - h; if (d >= 0 && d < 0.3) { const a = ((1 - d / 0.3) * amp) / s; cx += Math.sin(d * 93) * a; cy += Math.cos(d * 69) * a; } }
  return {cx, cy, s};
};

// ================= fronteras =================
const INNER = segs(mesh(TOPO as any, OBJ, (a: any, b: any) => a !== b));
const COAST = segs(mesh(TOPO as any, OBJ, (a: any, b: any) => a === b));
const ctrlBorderCache = new Map<number, ReturnType<typeof segs>>();
const ctrlBorders = (k: number) => {
  let b = ctrlBorderCache.get(k);
  if (b) return b;
  const own = CTRL[k];
  b = segs(mesh(TOPO as any, OBJ, (a: any, c: any) => a !== c && own[a.properties.code] !== own[c.properties.code]));
  ctrlBorderCache.set(k, b);
  return b;
};

// ================= unidades =================
const UNI: Record<string, [string, string]> = Object.fromEntries(Object.keys(TCOL).map((t) => [t, [TCOL[t], TDARK[t]]]));
const Trooper: React.FC<{team: string; walk: number; dir: number; shoot: boolean; fallen: number; alpha: number}> = ({team, walk, dir, shoot, fallen, alpha}) => {
  const [c1, c2] = UNI[team] || ['#888', '#555'];
  const sw = Math.sin(walk) * 4;
  const dead = fallen > 0.5;
  return (
    <g transform={`rotate(${fallen * 90 * dir})`} opacity={alpha * (1 - fallen * 0.35)}>
      <ellipse cx={0} cy={13} rx={8} ry={2.6} fill="rgba(0,0,0,0.3)" />
      <path d={`M-2,4 L${-3 + sw},13 M2,4 L${3 - sw},13`} stroke={INK} strokeWidth={3.4} strokeLinecap="round" />
      <rect x={-5} y={-6} width={10} height={12} rx={3.5} fill={dead ? '#8a8a8a' : c1} stroke={INK} strokeWidth={2} />
      <path d={`M0,-1 L${dir * 12},-3`} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <circle cx={0} cy={-11} r={5} fill="#f2c9a0" stroke={INK} strokeWidth={2} />
      <path d="M-6,-11 A6,6 0 0 1 6,-11 Z" fill={dead ? '#6b6b6b' : c2} stroke={INK} strokeWidth={2} />
      {shoot && !dead && <path d={`M${dir * 13},-3 l${dir * 6},-3 l${-dir * 2},3 l${dir * 6},1 l${-dir * 6},1 l${dir * 2},3 Z`} fill={YELLOW} stroke={ORANGE} strokeWidth={1} />}
    </g>
  );
};
const FORM: P[] = [[0, 0], [-16, -9], [-16, 9], [-31, 0], [-31, -17], [-31, 17], [-46, -9], [-46, 9]];
const Units: React.FC<{t: number; s: number; vis: (b: number[]) => boolean; ui: number}> = ({t, s, vis, ui}) => {
  const out: React.ReactNode[] = [];
  const frame = t * 30;
  const sc = (1.4 * ui) / s;
  UNITS.forEach(([kind, team, x0, y0, x1, y1, t0, t1], i) => {
    if (t < t0 - 0.3 || t > t1 + 1.6) return;
    if (!vis([Math.min(x0, x1) - 20, Math.min(y0, y1) - 20, Math.max(x0, x1) + 20, Math.max(y0, y1) + 20])) return;
    if (kind === 'def') {
      const fall = lerp(t, t0 + 0.4, t1, 0, 1);
      const fade = lerp(t, t1 + 0.4, t1 + 1.4, 1, 0) * lerp(t, t0 - 0.3, t0 + 0.2, 0, 1);
      for (let j = 0; j < 7; j++) {
        const col = j % 4, row = Math.floor(j / 4);
        const x = x0 + (col - 1.5) * 15 * sc, y = y0 + (row * 12 - 4) * sc;
        const dead = j < Math.floor(fall * 6.5);
        out.push(<g key={`d${i}-${j}`} transform={`translate(${x},${y}) scale(${sc})`}><Trooper team={team} walk={0} dir={j % 2 ? 1 : -1} shoot={!dead && (frame + j * 5 + i) % 12 < 2} fallen={dead ? 1 : 0} alpha={fade} /></g>);
      }
      return;
    }
    const dist = Math.hypot(x1 - x0, y1 - y0);
    const pts = arcPath([x0, y0], [x1, y1], Math.min(36, dist * 0.18) * (i % 2 ? 1 : -1));
    if (kind === 'plane') { out.push(<Mover key={`p${i}`} pts={pts} t={t} t0={t0} t1={t1} kind="plane" color={TCOL[team]} inv={(1.25 * ui) / s} hold={0.2} trail />); return; }
    if (kind === 'missile') { out.push(<Mover key={`m${i}`} pts={pts} t={t} t0={t0} t1={t1} kind="missile" inv={(1.1 * ui) / s} hold={0} trail />); return; }
    if (kind === 'ship') { out.push(<Mover key={`s${i}`} pts={pts} t={t} t0={t0} t1={t1} kind="ship" code={TFLAG(team)} inv={(1.0 * ui) / s} hold={1.4} />); return; }
    const pr = lerp(t, t0, t1, 0, 1, Easing.inOut(Easing.sin));
    const {tip, ang} = partial(pts, pr);
    const a = lerp(t, t0 - 0.3, t0, 0, 1) * lerp(t, t1 + 0.6, t1 + 1.4, 1, 0);
    if (kind === 'tank') { out.push(<TankToken key={`t${i}`} p={tip} code={TFLAG(team)} inv={(0.75 * ui) / s} alpha={a} flip={Math.cos(ang) < 0} />); return; }
    const ca = Math.cos(ang), sa = Math.sin(ang), dir = ca >= 0 ? 1 : -1;
    const shooting = pr > 0.7;
    for (let j = 0; j < FORM.length; j++) {
      const [fx, fy] = FORM[j];
      const x = tip[0] + (fx * ca - fy * sa) * sc, y = tip[1] + (fx * sa + fy * ca) * sc;
      out.push(<g key={`q${i}-${j}`} transform={`translate(${x},${y}) scale(${sc})`}><Trooper team={team} walk={pr < 1 ? frame / 2.2 + j : 0} dir={dir} shoot={shooting && (frame + j * 7 + i) % 11 < 2} fallen={0} alpha={a} /></g>);
    }
  });
  return <g>{out}</g>;
};

// ================= mapa =================
export type CVP = {W: number; H: number; ox: number; oy: number; ui: number};
const CVP0: CVP = {W: 1920, H: 1080, ox: 960, oy: 540, ui: 1};
const introTeam = (t: number) => (TL.intro as [number, string][]).find(([a]) => t >= a && t < a + 3.0);
export const ContMap: React.FC<{t: number; cam: Cam; vp?: CVP}> = ({t, cam, vp = CVP0}) => {
  const {cx, cy, s} = cam;
  const vx0 = cx - vp.ox / s - 20, vx1 = cx + (vp.W - vp.ox) / s + 20, vy0 = cy - vp.oy / s - 20, vy1 = cy + (vp.H - vp.oy) / s + 20;
  const vis = (b: number[]) => b[2] > vx0 && b[0] < vx1 && b[3] > vy0 && b[1] < vy1;
  const inv = vp.ui / s;
  const visCodes = CODES.filter((c) => BB[c] && vis(BB[c]));
  const k = doneK(t);
  // ocupaciones
  const occ: React.ReactNode[] = [];
  const defs: React.ReactNode[] = [];
  for (const c of visCodes) {
    const list = capsOf[c];
    if (!list) continue;
    let j = -1;
    for (let x = 0; x < list.length; x++) if (list[x].t <= t) j = x;
    if (j < 0) continue;
    const cur = list[j], q = Easing.inOut(Easing.cubic)(Math.min(1, (t - cur.t) / D));
    const g = CAPGEO[capIdx.get(cur)!];
    const nat = TEAMOF[c];
    const layer = (team: string, key: string, mask?: string) => (
      <g key={key} clipPath={`url(#oc-${c})`} mask={mask}>
        <rect x={BB[c][0] - 2} y={BB[c][1] - 2} width={BB[c][2] - BB[c][0] + 4} height={BB[c][3] - BB[c][1] + 4} fill={TCOL[team]} opacity={0.62} />
        <rect x={BB[c][0] - 2} y={BB[c][1] - 2} width={BB[c][2] - BB[c][0] + 4} height={BB[c][3] - BB[c][1] + 4} fill={`url(#ht-${team})`} />
      </g>
    );
    defs.push(<clipPath key={`oc${c}`} id={`oc-${c}`}>{PCS[c].map((p, i) => <path key={i} d={p.d} />)}</clipPath>);
    const mb = [BB[c][0] - 20, BB[c][1] - 20, BB[c][2] - BB[c][0] + 40, BB[c][3] - BB[c][1] + 40];
    if (q < 1) {
      defs.push(
        <mask key={`mk${c}`} id={`mk-${c}`} maskUnits="userSpaceOnUse" x={mb[0]} y={mb[1]} width={mb[2]} height={mb[3]}>
          {cur.to === nat ? <><rect x={mb[0]} y={mb[1]} width={mb[2]} height={mb[3]} fill="white" /><circle cx={g.A[0]} cy={g.A[1]} r={g.R * q} fill="black" /></> : <circle cx={g.A[0]} cy={g.A[1]} r={g.R * q} fill="white" />}
        </mask>,
      );
    }
    if (cur.to !== nat) {
      if (q < 1 && cur.from !== nat) occ.push(layer(cur.from, `${c}p`));
      occ.push(layer(cur.to, `${c}n`, q < 1 ? `url(#mk-${c})` : undefined));
    } else if (q < 1 && cur.from !== nat) occ.push(layer(cur.from, `${c}l`, `url(#mk-${c})`));
    if (q < 1) occ.push(<circle key={`${c}r`} cx={g.A[0]} cy={g.A[1]} r={g.R * q} fill="none" stroke="#fff" strokeWidth={3 * inv} opacity={0.85 * (1 - q)} />);
  }
  const it = introTeam(t);
  const ctrlB = ctrlBorders(k);
  return (
    <svg width={vp.W} height={vp.H} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        {visCodes.map((c) => <clipPath key={c} id={`cf-${c}`}>{PCS[c].map((p, i) => <path key={i} d={p.d} />)}</clipPath>)}
        {Object.keys(TCOL).map((tm) => (
          <pattern key={tm} id={`ht-${tm}`} patternUnits="userSpaceOnUse" width={5} height={5} patternTransform={`rotate(45) scale(${Math.max(0.5, 1.6 / s)})`}><rect width={1.7} height={5} fill={TDARK[tm]} opacity={0.75} /></pattern>
        ))}
        {defs}
      </defs>
      <g transform={`translate(${vp.ox},${vp.oy}) scale(${s}) translate(${-cx},${-cy})`}>
        <g transform="translate(1.5,2.2)" opacity={0.32}>{PIECES.filter((p) => vis(p.bbox)).map((p, i) => <path key={i} d={p.d} fill="#06213f" />)}</g>
        {visCodes.map((c) => <g key={c} clipPath={`url(#cf-${c})`}><FlagSvg code={c} b={fitFlagBox(BB[c])} /></g>)}
        {occ}
        {it && <g opacity={0.45 + 0.15 * Math.sin(t * 8)}>{visCodes.filter((c) => TEAMOF[c] === it[1]).map((c) => <g key={c} clipPath={`url(#cf-${c})`}><rect x={BB[c][0]} y={BB[c][1]} width={BB[c][2] - BB[c][0]} height={BB[c][3] - BB[c][1]} fill={TCOL[it[1]]} /></g>)}</g>}
        <path d={visD(INNER, vis)} fill="none" stroke="#3d4450" strokeWidth={0.8 * inv} />
        <path d={visD(COAST, vis)} fill="none" stroke={INK} strokeWidth={1.6 * inv} />
        <path d={visD(ctrlB, vis)} fill="none" stroke={INK} strokeWidth={3.2 * inv} />
        <Units t={t} s={s} vis={vis} ui={vp.ui} />
        {CAPS.filter((c) => c.lead && t > c.t - 1.3 && t < c.t + 1.7 && vis(BB[c.c])).map((c, i) => (
          <React.Fragment key={`b${c.c}${c.t}`}>
            <Boom p={HOME[c.c]} t={t} at={c.t} r={Math.max(5, 20 * inv)} />
            <Boom p={[HOME[c.c][0] + 9 * inv, HOME[c.c][1] - 6 * inv]} t={t} at={c.t - 1.1} r={Math.max(3, 12 * inv)} />
            <Boom p={[HOME[c.c][0] - 10 * inv, HOME[c.c][1] + 5 * inv]} t={t} at={c.t - 0.55} r={Math.max(3, 13 * inv)} />
          </React.Fragment>
        ))}
        <Faces t={t} s={s} codes={visCodes} ui={vp.ui} />
      </g>
    </svg>
  );
};
export const activeFront = (t: number) => FRONTS.find((f) => t >= f.t0 && t < f.t1);
export const faceR = (c: string) => faceSize(AREA[c] || 20) * 0.9;
const Faces: React.FC<{t: number; s: number; codes: string[]; ui: number}> = ({t, s, codes, ui}) => {
  const ctrl = ctrlAt(t);
  const f = activeFront(t);
  const nodes: React.ReactNode[] = [];
  for (const c of codes) {
    const r = faceR(c) * ui;
    if (r * s < 8) continue;
    let mood: Mood = 'calm';
    let look: P = [0, 0];
    if (ctrl[c] !== TEAMOF[c]) mood = 'sad';
    if (f && f.targets.includes(c) && ctrl[c] === TEAMOF[c]) mood = 'scared';
    if (f && (c === f.lead || (TEAMOF[c] === f.team && ctrl[c] === f.team && r * s > 14))) { mood = 'angry'; }
    if (f && f.targets.includes(c) && !f.lib) { const o = HOME[f.lead]; look = [Math.sign(o[0] - HOME[c][0]) * 0.8, 0]; }
    if (TL.victory && t > (TL.victory as number) && TEAMOF[c] === CHAMP) mood = 'happy';
    const talking = BUB.some(([b0, b1, w]) => w === c && t > b0 + 0.2 && t < b1 - 0.3);
    nodes.push(<Face key={c} x={HOME[c][0]} y={HOME[c][1]} r={r} mood={mood} t={t} seed={c.charCodeAt(0) + c.charCodeAt(1)} look={look} talking={talking} />);
  }
  return <g>{nodes}</g>;
};

// ================= marcadores =================
export const matchAt = (t: number) => MATCHES.find((m) => t >= m.t0 && t < m.t1);
const areaCtrl = (t: number, team: string) => { const c = ctrlAt(t); let a = 0; for (const x of CODES) if (c[x] === team) a += AREA[x] || 0; return a; };
export const tugAt = (t: number, m: Match) => {
  const a = areaCtrl(t, m.a), b = areaCtrl(t, m.b);
  return a / Math.max(1, a + b);
};
export const soldiersAt = (t: number, m: Match): [number, number] => {
  let i = 0;
  while (i < m.traj.length - 1 && m.traj[i + 1][0] <= t) i++;
  const cur = m.traj[i], nx = m.traj[Math.min(m.traj.length - 1, i + 1)];
  const k = lerp(t, cur[0], cur[0] + 0.5, 0, 1);
  const prev = m.traj[Math.max(0, i - 1)];
  return [prev[1] + (cur[1] - prev[1]) * (i ? k : 1), prev[2] + (cur[2] - prev[2]) * (i ? k : 1)];
};
export const dayAt = (t: number, m: Match) => Math.max(1, Math.round(1 + (m.days - 1) * lerp(t, m.t0 + 2.2, m.t1 - 9, 0, 1, Easing.linear)));
const TeamSide: React.FC<{team: string; n: number; right?: boolean; t: number; mood: Mood; loss?: number; lossT?: number}> = ({team, n, right, t, mood, loss, lossT}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12, flexDirection: right ? 'row-reverse' : 'row', position: 'relative'}}>
    <Avatar size={92} code={TFLAG(team)} mood={mood} t={t} seed={team.charCodeAt(0)} look={[right ? -1 : 1, 0]} id={`hud-${team}`} />
    <div style={{display: 'flex', flexDirection: 'column', alignItems: right ? 'flex-end' : 'flex-start'}}>
      <div style={{...font, fontSize: 32, color: '#fff', lineHeight: 1, textShadow: `3px 3px 0 ${INK}`}}>{TNAME[team]}</div>
      <div style={{...font, fontSize: 40, color: YELLOW, lineHeight: 1.1, textShadow: `3px 3px 0 ${INK}`}}>{fmt(Math.round(n / 1000) * 1000)}</div>
    </div>
    {loss !== undefined && lossT !== undefined && t - lossT < 1.2 && <div style={{position: 'absolute', [right ? 'right' : 'left']: 4, top: 92 + (t - lossT) * 22, opacity: lerp(t, lossT + 0.7, lossT + 1.2, 1, 0), ...font, fontSize: 30, color: '#fff', background: RED, border: `3px solid ${INK}`, borderRadius: 10, padding: '1px 10px 0'}}>-{fmt(Math.round(loss / 1000) * 1000)}</div>}
  </div>
);
const MatchHUD: React.FC<{t: number}> = ({t}) => {
  const m = matchAt(t);
  if (!m || t < m.t0 + 2.0 || t > m.t1 - 6.5) return null;
  const k = popT(t, m.t0 + 2.0, 13) * lerp(t, m.t1 - 7, m.t1 - 6.5, 1, 0);
  const p = tugAt(t, m);
  const [sa, sb] = soldiersAt(t, m);
  let li = 0; while (li < m.traj.length - 1 && m.traj[li + 1][0] <= t) li++;
  const lossT = li ? m.traj[li][0] : undefined;
  const la = li ? m.traj[li - 1][1] - m.traj[li][1] : 0, lb = li ? m.traj[li - 1][2] - m.traj[li][2] : 0;
  const moodA: Mood = p > 0.62 ? 'smug' : p < 0.38 ? 'scared' : 'angry';
  const moodB: Mood = p < 0.38 ? 'smug' : p > 0.62 ? 'scared' : 'angry';
  return (
    <div style={{position: 'absolute', top: 14, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 10, transform: `translateY(${(1 - k) * -220}px)`}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22, background: 'rgba(16,22,34,0.86)', border: '5px solid #fff', borderRadius: 30, padding: '8px 24px', boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>
          <TeamSide team={m.a} n={sa} t={t} mood={moodA} loss={la > 0 ? la : undefined} lossT={lossT} />
          <div style={{width: 520}}>
            <div style={{display: 'flex', justifyContent: 'space-between', ...font, fontSize: 30, color: '#fff', marginBottom: 4}}><span style={{color: TCOL[m.a] === '#1d56c9' ? '#6ea2ff' : '#fff'}}>{Math.round(p * 100)}%</span><span style={{color: YELLOW, fontSize: 24}}>TERRITORY</span><span>{100 - Math.round(p * 100)}%</span></div>
            <div style={{position: 'relative', height: 34, borderRadius: 17, overflow: 'hidden', border: `5px solid ${INK}`, display: 'flex'}}>
              <div style={{width: `${p * 100}%`, background: `repeating-linear-gradient(45deg, ${TCOL[m.a]}, ${TCOL[m.a]} 12px, ${TDARK[m.a]} 12px, ${TDARK[m.a]} 24px)`}} />
              <div style={{flex: 1, background: `repeating-linear-gradient(-45deg, ${TCOL[m.b]}, ${TCOL[m.b]} 12px, ${TDARK[m.b]} 12px, ${TDARK[m.b]} 24px)`}} />
              <div style={{position: 'absolute', left: `calc(${p * 100}% - 4px)`, top: -4, width: 8, height: 42, background: '#fff', boxShadow: '0 0 10px #fff'}} />
            </div>
          </div>
          <TeamSide team={m.b} n={sb} right t={t} mood={moodB} loss={lb > 0 ? lb : undefined} lossT={lossT} />
        </div>
        <div style={{display: 'flex', gap: 10}}>
          <div style={{background: YELLOW, border: `4px solid ${INK}`, borderRadius: 14, padding: '3px 16px 0', ...font, fontSize: 28, color: INK}}>{m.title}</div>
          <div style={{background: INK, border: '4px solid #fff', borderRadius: 14, padding: '3px 16px 0', ...font, fontSize: 28, color: YELLOW}}>DAY {dayAt(t, m)}</div>
        </div>
      </div>
    </div>
  );
};
const FrontChip: React.FC<{t: number}> = ({t}) => {
  const f = FRONTS.find((x) => t >= x.t0 + 0.2 && t < x.t0 + 2.6);
  if (!f || !f.label) return null;
  const k = popT(t, f.t0 + 0.2, 12) * lerp(t, f.t0 + 2.3, f.t0 + 2.6, 1, 0);
  const big = (TL.battles as any[]).some(([a]) => Math.abs(a - f.t0) < 0.01);
  return (
    <div style={{position: 'absolute', top: big ? 230 : 210, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 12}}>
      <div style={{transform: `scale(${k}) rotate(-2deg)`, display: 'flex', alignItems: 'center', gap: 14, background: big ? RED : TCOL[f.team], border: `6px solid ${INK}`, borderRadius: 20, padding: big ? '10px 34px 4px' : '6px 24px 2px', ...font, fontSize: big ? 66 : 42, color: '#fff', textShadow: `3px 3px 0 ${INK}`, boxShadow: '0 8px 0 rgba(0,0,0,0.35)', whiteSpace: 'nowrap'}}>
        <WFlag code={f.lead} w={big ? 66 : 50} h={big ? 44 : 33} />{f.label}
      </div>
    </div>
  );
};
const KillFeed: React.FC<{t: number}> = ({t}) => {
  const list = CAPS.filter((c) => c.lead && t >= c.t && t < c.t + 3.0).slice(-4);
  return (
    <div style={{position: 'absolute', left: 22, bottom: 60, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 8}}>
      {list.map((c) => {
        const k = lerp(t, c.t, c.t + 0.22, 0, 1, Easing.out(Easing.cubic)) * lerp(t, c.t + 2.6, c.t + 3.0, 1, 0);
        const lib = c.to === TEAMOF[c.c];
        return (
          <div key={c.c + c.t} style={{transform: `translateX(${(k - 1) * 460}px)`, opacity: k, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(16,22,34,0.86)', borderLeft: `8px solid ${TCOL[c.to]}`, borderRadius: 12, padding: '5px 14px 3px 8px', ...font, fontSize: 26, color: '#fff', whiteSpace: 'nowrap'}}>
            <WFlag code={c.lead} w={40} h={27} /><span>{nameOf(c.lead)}</span><span style={{color: lib ? '#8ef0a8' : YELLOW, fontSize: 22}}>{lib ? 'LIBERATED' : 'CAPTURED'}</span>
            <WFlag code={c.c} w={40} h={27} /><span style={{color: lib ? '#8ef0a8' : '#ff9b94'}}>{nameOf(c.c)}</span>
          </div>
        );
      })}
    </div>
  );
};
const toScreen = (p: P, cam: Cam, vp: CVP = CVP0): P => [vp.ox + (p[0] - cam.cx) * cam.s, vp.oy + (p[1] - cam.cy) * cam.s];
const Labels: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const f = activeFront(t);
  if (!f) return null;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 3}}>
      {f.targets.filter((c) => { const cp = CAPS.find((x) => x.c === c && x.t >= f.t0 && x.t <= f.t1 + 0.1); return !cp || (t > cp.t - 3.0 && t < cp.t + 1.8); }).map((c) => {
        const [sx, sy] = toScreen(HOME[c], cam);
        const r = faceR(c) * cam.s;
        const y = sy + Math.max(r, 8) + 6;
        if (sx < 80 || sx > 1840 || y < 200 || y > 1000) return null;
        const capd = ctrlAt(t)[c] !== TEAMOF[c] && !f.lib;
        return <div key={c} style={{position: 'absolute', left: sx, top: y, transform: 'translateX(-50%)', background: capd ? TCOL[ctrlAt(t)[c]] : '#fff', border: `4px solid ${INK}`, borderRadius: 12, padding: '2px 12px 0', ...font, fontSize: 24, color: capd ? '#fff' : INK, whiteSpace: 'nowrap', boxShadow: '0 4px 0 rgba(0,0,0,0.3)'}}>{nameOf(c).toUpperCase()}</div>;
      })}
    </div>
  );
};
const Bubbles: React.FC<{t: number; cam: Cam}> = ({t, cam}) => (
  <>
    {BUB.filter(([b0, b1]) => t >= b0 && t <= b1).map(([b0, b1, w, text]) => {
      const [sx, sy] = toScreen(HOME[w], cam);
      const r = faceR(w) * cam.s;
      const k = popT(t, b0, 10) * lerp(t, b1 - 0.25, b1, 1, 0);
      return <Bubble key={w + b0} k={k} sx={Math.max(280, Math.min(1640, sx))} sy={Math.min(980, Math.max(300, sy - r - 12))} text={text} size={40} />;
    })}
  </>
);
const Stamp: React.FC<{t: number}> = ({t}) => {
  const st = (TL.stamps as any[]).find((s) => t >= s.t && t < s.t + s.d);
  if (!st) return null;
  const dt = t - st.t;
  const k = dt < 0.27 ? interpolate(dt, [0, 0.27], [2.2, 1], {...clamp, easing: Easing.out(Easing.cubic)}) : 1;
  const a = lerp(dt, 0, 0.12, 0, 1) * lerp(dt, st.d - 0.3, st.d, 1, 0);
  const col = st.c === 'red' ? RED : st.c === 'blue' ? BLUE : GREEN;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 13}}>
      <div style={{transform: `scale(${k}) rotate(-6deg)`, opacity: a, border: `10px solid ${col}`, color: col, background: 'rgba(255,246,227,0.95)', borderRadius: 18, padding: '14px 44px 6px', ...font, fontSize: 104, boxShadow: '0 10px 0 rgba(0,0,0,0.3)', whiteSpace: 'nowrap'}}>{st.text}</div>
    </AbsoluteFill>
  );
};

// ================= intro de equipos, presentación de combates y cuadro =================
const TINFO: Record<string, [number, string, string]> = TL.tinfo;
const SOLD0: Record<string, number> = TL.sold0;
const TeamIntro: React.FC<{t: number}> = ({t}) => {
  const it = introTeam(t);
  if (!it) return null;
  const [t0, tm] = it;
  const k = popT(t, t0 + 0.25, 12) * lerp(t, t0 + 2.75, t0 + 3.0, 1, 0);
  const [n, star, sc] = TINFO[tm];
  return (
    <div style={{position: 'absolute', left: 60, bottom: 70, transform: `translateX(${(1 - k) * -900}px)`, zIndex: 12, display: 'flex', alignItems: 'center', gap: 24}}>
      <Avatar size={220} code={TFLAG(tm)} mood="angry" t={t} seed={tm.charCodeAt(0)} look={[1, 0]} id={`intro-${tm}`} />
      <div style={{background: CREAM, border: `8px solid ${INK}`, borderRadius: 28, padding: '14px 30px 14px', boxShadow: '0 10px 0 rgba(0,0,0,0.35)'}}>
        <div style={{...font, fontSize: 70, color: TCOL[tm], lineHeight: 1}}>{TNAME[tm]}</div>
        <div style={{display: 'flex', gap: 26, marginTop: 8, ...font, fontSize: 32, color: INK}}>
          <span>🪖 {fmt(SOLD0[tm])}</span><span>🏳️ {n} countries</span><span style={{display: 'flex', alignItems: 'center', gap: 8}}>⭐ <WFlag code={sc} w={42} h={28} /> {star}</span>
        </div>
      </div>
    </div>
  );
};
const MatchIntro: React.FC<{t: number}> = ({t}) => {
  const m = MATCHES.find((x) => t >= x.t0 && t < x.t0 + 2.2);
  if (!m) return null;
  const dt = t - m.t0;
  const k = popT(t, m.t0, 11) * lerp(dt, 1.9, 2.2, 1, 0);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 15, background: `rgba(8,15,30,${0.55 * lerp(dt, 0, 0.2, 0, 1) * lerp(dt, 1.9, 2.2, 1, 0)})`}}>
      <div style={{transform: `scale(${k})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
        <div style={{background: YELLOW, border: `7px solid ${INK}`, borderRadius: 22, padding: '6px 34px 0', ...font, fontSize: 66, color: INK, transform: 'rotate(-2deg)'}}>{m.title}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 40}}>
          <div style={{transform: `translateX(${(1 - Math.min(1, dt / 0.35)) * -500}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}><Avatar size={280} code={TFLAG(m.a)} mood="angry" t={t} seed={1} look={[1, 0]} id="mi-a" /><div style={{...font, fontSize: 56, color: '#fff', textShadow: `4px 4px 0 ${INK}`}}>{TNAME[m.a]}</div></div>
          <div style={{...font, fontSize: 140, color: RED, textShadow: `6px 6px 0 ${INK}, -3px -3px 0 ${INK}`, transform: `scale(${1 + 0.15 * Math.sin(dt * 12)})`}}>VS</div>
          <div style={{transform: `translateX(${(1 - Math.min(1, dt / 0.35)) * 500}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}><Avatar size={280} code={TFLAG(m.b)} mood="angry" t={t} seed={2} look={[-1, 0]} id="mi-b" /><div style={{...font, fontSize: 56, color: '#fff', textShadow: `4px 4px 0 ${INK}`}}>{TNAME[m.b]}</div></div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
// cuadro del torneo
type Slot = {team: string | null; win?: boolean; lose?: boolean};
const BR = (TL.bracket || {qf: [], qfw: [], semi: [], fin: []}) as {qf: string[][]; qfw: string[]; semi: string[]; semiw: string; fin: string[]; note: string};
const bracketState = (stage: number) => {
  return {
    qf: BR.qf.map((p, i) => p.map((tm) => (tm === BR.qfw[i] ? {team: tm, win: stage >= i + 1} : {team: tm, lose: stage >= i + 1}))) as Slot[][],
    semi: BR.semi.map((tm, i) => ({team: stage >= i + 2 ? tm : null, win: stage >= 4 && tm === BR.semiw, lose: stage >= 4 && tm !== BR.semiw})) as Slot[],
    fin: [{team: stage >= 1 ? BR.fin[0] : null}, {team: stage >= 4 ? BR.fin[1] : null}] as Slot[],
    next: stage === 0 ? 'qf0' : stage === 1 ? 'qf1' : stage === 2 ? 'qf2' : stage === 3 ? 'semi' : 'fin',
  };
};
const SlotBox: React.FC<{s: Slot; t: number; pop: number}> = ({s, t, pop}) => (
  <div style={{width: 400, height: 74, display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px', background: s.team ? (s.lose ? '#9aa1ab' : '#fff') : 'rgba(255,255,255,0.25)', border: `5px solid ${s.win ? YELLOW : INK}`, borderRadius: 18, opacity: s.lose ? 0.7 : 1, transform: `scale(${pop})`, boxShadow: s.win ? `0 0 22px ${YELLOW}` : '0 5px 0 rgba(0,0,0,0.35)'}}>
    {s.team ? <><div style={{width: 60, height: 60}}><Avatar size={60} code={TFLAG(s.team)} mood={s.lose ? 'sad' : s.win ? 'happy' : 'calm'} t={t} seed={s.team.charCodeAt(1)} id={`br-${s.team}-${Math.round(pop * 10)}`} /></div><div style={{...font, fontSize: 32, whiteSpace: 'nowrap', color: s.lose ? '#555' : INK, textDecoration: s.lose ? 'line-through' : 'none'}}>{TNAME[s.team]}</div></> : <div style={{...font, fontSize: 40, color: '#fff', width: '100%', textAlign: 'center'}}>?</div>}
  </div>
);
type GSlot = {team: string; show: number; res: number; win: boolean};
const GBracket: React.FC<{t: number; t0: number; t1: number; stage: number}> = ({t, t0, t1, stage}) => {
  const G = TL.brk as {cols: {label: string; matches: GSlot[][]}[]; next: Record<string, string>; note?: [number, string]};
  const k = popT(t, t0, 12) * lerp(t, t1 - 0.35, t1, 1, 0);
  const pulse = 0.5 + 0.5 * Math.sin(t * 7);
  const nk = G.next[String(stage)];
  const line = '6px solid rgba(255,255,255,0.75)';
  const sl = (s: GSlot): Slot => (stage >= s.show ? {team: s.team, win: stage >= s.res && s.res > 0 && s.win, lose: stage >= s.res && s.res > 0 && !s.win} : {team: null});
  const sc = G.cols[0].matches.length > 3 ? 0.82 : 1;
  return (
    <AbsoluteFill style={{zIndex: 16, background: `rgba(8,15,30,${0.82 * k})`, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: `scale(${(0.9 + 0.1 * k) * sc})`, opacity: k, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
        <div style={{...font, fontSize: 76, color: YELLOW, textShadow: `5px 5px 0 ${INK}`}}>🏆 WORLD CUP OF WAR</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 46}}>
          {G.cols.map((col, ci) => (
            <div key={ci} style={{display: 'flex', flexDirection: 'column', gap: 26, justifyContent: 'center'}}>
              {col.label && <div style={{...font, fontSize: 34, color: ci === G.cols.length - 1 ? YELLOW : '#fff', textAlign: 'center'}}>{col.label}</div>}
              {col.matches.map((m, mi) => {
                const key = `c${ci}m${mi}`;
                return <div key={mi} style={{display: 'flex', flexDirection: 'column', gap: 8, padding: 8, borderLeft: ci ? line : undefined, ...(nk === key ? {boxShadow: `0 0 0 6px rgba(255,210,63,${0.4 + 0.6 * pulse})`, borderRadius: 24} : {})}}>
                  {m.map((s, si) => <SlotBox key={si} s={sl(s)} t={t} pop={stage === s.res && s.win ? 1 + 0.08 * lerp(t, t0 + 0.6, t0 + 1.0, 1, 0) : 1} />)}
                </div>;
              })}
              {G.note && ci === G.cols.length - 1 && stage === G.note[0] && <div style={{background: GREEN, border: `5px solid ${INK}`, borderRadius: 16, padding: '6px 16px 0', ...font, fontSize: 28, color: '#fff', textAlign: 'center', maxWidth: 400}}>{G.note[1]}</div>}
            </div>
          ))}
          <div style={{fontSize: 150, transform: `translateY(${Math.sin(t * 3) * 6}px)`}}>🏆</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
const Bracket: React.FC<{t: number}> = ({t}) => {
  const br = (TL.brackets as [number, number, number][]).find(([a, b]) => t >= a && t < b);
  if (!br) return null;
  const [t0, t1, stage] = br;
  if (TL.brk) return <GBracket t={t} t0={t0} t1={t1} stage={stage} />;
  const k = popT(t, t0, 12) * lerp(t, t1 - 0.35, t1, 1, 0);
  const st = bracketState(stage);
  const pulse = 0.5 + 0.5 * Math.sin(t * 7);
  const hl = (key: string) => (st.next === key ? {boxShadow: `0 0 0 6px rgba(255,210,63,${0.4 + 0.6 * pulse})`, borderRadius: 24} : {});
  const winPop = (cond?: boolean) => (cond ? 1 + 0.08 * lerp(t, t0 + 0.6, t0 + 1.0, 1, 0) : 1);
  const line = '6px solid rgba(255,255,255,0.75)';
  return (
    <AbsoluteFill style={{zIndex: 16, background: `rgba(8,15,30,${0.82 * k})`, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: `scale(${0.9 + 0.1 * k})`, opacity: k, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24}}>
        <div style={{...font, fontSize: 76, color: YELLOW, textShadow: `5px 5px 0 ${INK}`}}>🏆 WORLD CUP OF WAR</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 46}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: 26}}>
            {st.qf.map((pair, i) => (
              <div key={i} style={{display: 'flex', flexDirection: 'column', gap: 8, padding: 8, ...hl(`qf${i}`)}}>
                {pair.map((s) => <SlotBox key={s.team!} s={s} t={t} pop={winPop(s.win && stage === i + 1)} />)}
              </div>
            ))}
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 30, marginTop: 200}}>
            <div style={{...font, fontSize: 34, color: '#fff', textAlign: 'center'}}>SEMI-FINAL</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 8, padding: 8, borderLeft: line, ...hl('semi')}}>{st.semi.map((s, i) => <SlotBox key={i} s={s} t={t} pop={winPop(s.win && stage === 4)} />)}</div>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 30}}>
            <div style={{...font, fontSize: 34, color: YELLOW, textAlign: 'center'}}>THE FINAL</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 8, padding: 8, borderLeft: line, ...hl('fin')}}>{st.fin.map((s, i) => <SlotBox key={i} s={s} t={t} pop={1} />)}</div>
            {stage === 3 && <div style={{background: GREEN, border: `5px solid ${INK}`, borderRadius: 16, padding: '6px 16px 0', ...font, fontSize: 28, color: '#fff', textAlign: 'center', maxWidth: 400}}>{BR.note}</div>}
          </div>
          <div style={{fontSize: 150, transform: `translateY(${Math.sin(t * 3) * 6}px)`}}>🏆</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ================= título, final =================
const Title: React.FC<{t: number}> = ({t}) => {
  if (t > 4.4) return null;
  const k = popT(t, 0.1, 10) * lerp(t, 3.9, 4.4, 1, 0);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 14}}>
      <div style={{transform: `scale(${k}) rotate(-2deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
        <div style={{display: 'flex', gap: 14}}>{ORDER.map((tm, i) => <div key={tm} style={{transform: `translateY(${Math.sin(t * 6 + i) * 6}px)`}}><Avatar size={110} code={TFLAG(tm)} mood="angry" t={t} seed={i} id={`tt-${tm}`} /></div>)}</div>
        <div style={{background: '#2ec36a', border: `9px solid ${INK}`, borderRadius: 30, padding: '20px 56px 10px', boxShadow: '0 12px 0 rgba(0,0,0,0.35)', ...font, fontSize: 118, color: '#fff', textShadow: `5px 5px 0 ${INK}`, textAlign: 'center', lineHeight: 1.02}}>{TL.title[0]}<br />{TL.title[1]}</div>
      </div>
    </AbsoluteFill>
  );
};
export const totalDays = MATCHES.reduce((s, m) => s + m.days, 0);
const Victory: React.FC<{t: number}> = ({t}) => {
  const v = TL.victory as number, st = TL.stats as number, q = TL.question as number;
  if (t < v || t > q) return null;
  const k = popT(t, v, 10) * lerp(t, q - 0.4, q, 1, 0);
  const shift = lerp(t, st, st + 0.8, 0, 1, Easing.inOut(Easing.cubic));
  const mvp = (TL.mvp as [string, number][])[0];
  const rows: [React.ReactNode, string, string][] = [
    [<Avatar size={48} code={TFLAG(CHAMP)} mood="happy" t={t} seed={3} id="st-as" />, 'Champion', TNAME[CHAMP]],
    [<WFlag code={mvp[0]} w={54} h={36} />, 'MVP', `${nameOf(mvp[0])} · ${mvp[1]} captures`],
    [<Avatar size={48} code={TFLAG(TL.fastest[0])} mood="calm" t={t} seed={4} id="st-na" />, 'Fastest win', `${TL.fastest[1]} · ${(MATCHES.find((m) => m.winner === TL.fastest[0]) || MATCHES[0]).days} days`],
    [<WFlag code={TL.biggest[0]} w={54} h={36} />, 'Biggest battle', TL.biggest[1]],
    [<div style={{fontSize: 40}}>📅</div>, 'Total war', `${totalDays} days · ${CAPS.length} captures`],
  ];
  return (
    <AbsoluteFill style={{zIndex: 14, background: `rgba(8,15,30,${0.5 * k})`, opacity: k}}>
      <div style={{position: 'absolute', left: interpolate(shift, [0, 1], [960, 480]), top: 540, transform: `translate(-50%,-50%) scale(${popT(t, v, 10)})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{fontSize: 170, marginBottom: -50, zIndex: 2, transform: `translateY(${Math.sin(t * 3) * 6}px)`}}>🏆</div>
        <Avatar size={400} code={TFLAG(CHAMP)} mood="happy" t={t} seed={5} id="win-as" />
        <div style={{marginTop: 18, background: YELLOW, border: `8px solid ${INK}`, borderRadius: 26, padding: '8px 44px 0', ...font, fontSize: 84, color: INK, boxShadow: '0 10px 0 rgba(0,0,0,0.4)'}}>{TNAME[CHAMP]} WINS!</div>
      </div>
      {t > st && (
        <div style={{position: 'absolute', right: 70, top: 200, width: 840, transform: `translateX(${(1 - popT(t, st + 0.4, 12)) * 960}px)`}}>
          <div style={{background: CREAM, border: `8px solid ${INK}`, borderRadius: 28, padding: '22px 30px 18px', boxShadow: '0 12px 0 rgba(0,0,0,0.35)'}}>
            <div style={{...font, fontSize: 58, color: INK, marginBottom: 10}}>{TL.statsTitle}</div>
            {rows.map(([ic, l, val], i) => (
              <div key={l} style={{display: 'flex', alignItems: 'center', gap: 16, height: 80, borderTop: '3px solid #e2d3b1', opacity: lerp(t, st + 0.8 + i * 0.5, st + 1.2 + i * 0.5, 0, 1)}}>
                <div style={{width: 60, display: 'flex', justifyContent: 'center'}}>{ic}</div><div style={{...font2, fontSize: 30, color: INK, width: 220}}>{l}</div><div style={{...font, fontSize: 38, color: i === 0 ? RED : INK}}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
const Question: React.FC<{t: number}> = ({t}) => {
  const q = TL.question as number;
  if (t < q) return null;
  const k = popT(t, q, 11);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 15, background: `rgba(8,18,32,${0.45 * k})`}}>
      <div style={{display: 'flex', gap: 14, marginBottom: 26, transform: `scale(${k})`}}>{ORDER.map((tm, i) => <Avatar key={tm} size={100} code={TFLAG(tm)} mood={tm === CHAMP ? 'smug' : 'angry'} t={t} seed={i} id={`q-${tm}`} />)}</div>
      <div style={{transform: `scale(${k}) rotate(-2deg)`, background: '#fff', border: `9px solid ${INK}`, borderRadius: 30, padding: '24px 50px 14px', ...font, fontSize: 92, color: INK, textAlign: 'center', lineHeight: 1.05, boxShadow: '0 12px 0 rgba(0,0,0,0.35)'}}>{TL.qtext[0]}<br /><span style={{color: RED}}>{TL.qtext[1]}</span></div>
      <div style={{marginTop: 30, transform: `scale(${popT(t, q + 0.8, 12)})`, background: YELLOW, border: `6px solid ${INK}`, borderRadius: 24, padding: '8px 34px 2px', ...font, fontSize: 56, color: INK}}>Tell us in the comments!</div>
    </AbsoluteFill>
  );
};
const Credit = () => <div style={{position: 'absolute', right: 18, bottom: 12, background: 'rgba(15,25,40,0.65)', color: '#fff', borderRadius: 12, padding: '5px 14px', ...font2, fontWeight: 600, fontSize: 17, zIndex: 20}}>Hypothetical simulation · Troop numbers approx., based on Global Firepower 2026</div>;

export const WarCont: React.FC = () => {
  usePreload();
  const t = useCurrentFrame() / 30;
  const cam = camera(t);
  return (
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <Ocean t={t} />
      <ContMap t={t} cam={cam} />
      <Labels t={t} cam={cam} />
      <Bubbles t={t} cam={cam} />
      <KillFeed t={t} />
      <MatchHUD t={t} />
      <FrontChip t={t} />
      <TeamIntro t={t} />
      <Stamp t={t} />
      <MatchIntro t={t} />
      <Bracket t={t} />
      <Victory t={t} />
      <Question t={t} />
      <Title t={t} />
      <Credit />
    </AbsoluteFill>
  );
};
