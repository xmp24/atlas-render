import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import SH from './shortsbr.json';
import TL from './world-tl.json';
import {P, Cam, INK, CREAM, RED, BLUE, GREEN, YELLOW, ORANGE, clamp, ease, lerp, fmt, font, font2, popT, piece, Bubble} from './lib3';
import {Side, Swords, UnitIcon} from './War5';
import {WorldMap, WVP, camera, activeBattle, firedCount, areasAt, faceSize, roundAt, usePreload, EVENTS, BATTLES, PL, elimT, BUB, TOTAL_AREA, nameOf, D, WFlag} from './War6';

type Def = {part: number; hook: string; next: string; map: [number, number][]; end: number};
export const SBR = SH as unknown as Def[];
const SW = 1080, SHh = 1920;
const VPV: WVP = {W: SW, H: SHh, ox: 540, oy: 1000, ui: 1.25};
const mapT = (ts: number, m: [number, number][]) => interpolate(ts, m.map((x) => x[0]), m.map((x) => x[1]), clamp);
const invT = (to: number, m: [number, number][]) => interpolate(to, m.map((x) => x[1]), m.map((x) => x[0]), clamp);
const camV = (t: number): Cam => {
  const c = camera(t);
  const s = Math.max(0.62, c.s * 0.92);
  const hw = 540 / s;
  const cx = Math.max(hw - 20, Math.min(1940 - hw, c.cx));
  return {cx, cy: c.cy, s};
};
const toV = (p: P, cam: Cam): P => [VPV.ox + (p[0] - cam.cx) * cam.s, VPV.oy + (p[1] - cam.cy) * cam.s];

const OceanV: React.FC<{t: number}> = ({t}) => (
  <svg width={SW} height={SHh} style={{position: 'absolute'}}>
    <defs>
      <radialGradient id="seaVB" cx="50%" cy="50%" r="80%"><stop offset="0%" stopColor="#3f97d6" /><stop offset="100%" stopColor="#1d5e9f" /></radialGradient>
      <pattern id="wavesVB" width={140} height={46} patternUnits="userSpaceOnUse" patternTransform={`translate(${(t * 10.5) % 140},0)`}><path d="M0,23 C17,13 35,13 52,23 S87,33 105,23 S122,13 140,23" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={3} /></pattern>
    </defs>
    <rect width={SW} height={SHh} fill="url(#seaVB)" /><rect width={SW} height={SHh} fill="url(#wavesVB)" />
  </svg>
);
const Header: React.FC<{t: number; part: number}> = ({t, part}) => {
  const left = 195 - firedCount(t);
  const last = EVENTS[firedCount(t) - 1];
  const bump = last ? 1 + 0.2 * lerp(t, last.t, last.t + 0.3, 1, 0) : 1;
  return (
    <div style={{position: 'absolute', top: 118, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 14, zIndex: 10}}>
      <div style={{background: YELLOW, border: `5px solid ${INK}`, borderRadius: 18, padding: '6px 18px 0', ...font, fontSize: 42, color: INK, boxShadow: '0 6px 0 rgba(0,0,0,0.35)'}}>PART {part}/6</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, background: INK, padding: '6px 22px 2px 14px', borderRadius: 18, boxShadow: '0 6px 0 rgba(0,0,0,0.35)', border: `5px solid ${left === 1 ? GREEN : RED}`}}>
        <svg width={36} height={36} viewBox="-20 -20 40 40"><circle r={17} fill="#fff" stroke={YELLOW} strokeWidth={3} /><circle cx={-6} cy={-2} r={4.5} fill={INK} /><circle cx={6} cy={-2} r={4.5} fill={INK} /><rect x={-7} y={7} width={14} height={5} rx={1} fill={INK} /></svg>
        <div style={{...font, fontSize: 42, color: YELLOW, lineHeight: 1}}>LEFT: <span style={{display: 'inline-block', transform: `scale(${bump})`, color: '#fff'}}>{left}</span></div>
      </div>
    </div>
  );
};
const wrapCard = (k: number, body: React.ReactNode) => (
  <div style={{position: 'absolute', left: 40, right: 40, top: 225, transform: `translateY(${(1 - k) * -700}px)`, zIndex: 9}}>
    <div style={{background: CREAM, border: `8px solid ${INK}`, borderRadius: 30, padding: '16px 26px 20px', boxShadow: '0 12px 0 rgba(0,0,0,0.35)'}}>{body}</div>
  </div>
);
const HudV: React.FC<{t: number}> = ({t}) => {
  const b = activeBattle(t);
  if (!b) return null;
  const k = popT(t, b.t0 + 0.6, 13) * lerp(t, b.t1 + 2.0, b.t1 + 2.4, 1, 0);
  const p = b.prog ? piece(t, b.prog, ease) : lerp(t, b.t0 + 1, b.t1 - 1.5, 0, 1);
  const lin = lerp(t, b.t0 + 1, b.t1 - 1.5, 0, 1);
  const A = b.A[0] + (b.A[1] - b.A[0]) * lin, Dv = b.D[0] + (b.D[1] - b.D[0]) * (b.prog ? lin : Math.pow(p, 0.85));
  const good = b.good ?? false;
  const barCol = good ? BLUE : RED, barDark = good ? '#1557c0' : '#b51d18';
  const round = (v: number) => (b.units ? Math.round(v) : Math.round(v / 100) * 100);
  const side = (codes: string[], val: number, sd: Side, right: boolean) => (
    <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: right ? 'flex-end' : 'flex-start', gap: 4}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 8, flexDirection: right ? 'row-reverse' : 'row'}}>
        <div style={{display: 'flex'}}>{codes.map((c, i) => <div key={c} style={{marginLeft: i ? -16 : 0}}><WFlag code={c} w={64} h={43} /></div>)}</div>
        <UnitIcon side={sd} units={b.units} />
      </div>
      <div style={{...font, fontSize: 66, color: sd === 'R' ? '#c0221d' : '#1557c0', lineHeight: 1}}>{fmt(round(val))}</div>
    </div>
  );
  return wrapCard(k, (
    <>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, ...font, fontSize: 46, color: INK, marginBottom: 8, whiteSpace: 'nowrap'}}><Swords size={44} />{b.title}</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
        {side(b.att, A, 'R', false)}
        <div style={{...font, fontSize: 40, color: '#fff', background: INK, borderRadius: 24, padding: '4px 16px 0'}}>VS</div>
        {side(b.def, Dv, 'E', true)}
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', ...font, fontSize: 34, color: INK, marginTop: 12}}><span>{b.bar}</span><span style={{color: barDark}}>{Math.round(p * 100)}%</span></div>
      <div style={{height: 32, background: '#e6d9bd', border: `6px solid ${INK}`, borderRadius: 16, overflow: 'hidden', marginTop: 6}}><div style={{width: `${p * 100}%`, height: '100%', background: `repeating-linear-gradient(45deg, ${barCol}, ${barCol} 12px, ${barDark} 12px, ${barDark} 24px)`}} /></div>
    </>
  ));
};
const RankV: React.FC<{t: number}> = ({t}) => {
  if (activeBattle(t) || t > 571) return null;
  const a = areasAt(t);
  const top = Object.entries(a).filter(([c]) => !(elimT[c] !== undefined && t > elimT[c] + D)).sort((x, y) => y[1] - x[1]).slice(0, 3);
  return wrapCard(1, (
    <>
      <div style={{...font, fontSize: 40, color: INK, textAlign: 'center', marginBottom: 4}}>🏆 BIGGEST EMPIRES</div>
      {top.map(([c, v], i) => (
        <div key={c} style={{display: 'flex', alignItems: 'center', gap: 14, height: 62}}>
          <div style={{...font, fontSize: 38, color: INK, width: 30}}>{i + 1}</div><WFlag code={c} w={64} h={43} />
          <div style={{flex: 1}}>
            <div style={{...font, fontSize: 34, color: INK, lineHeight: 1}}>{nameOf(c)}</div>
            <div style={{height: 12, background: '#e6d9bd', borderRadius: 6, marginTop: 4, overflow: 'hidden'}}><div style={{width: `${Math.min(100, (v / TOTAL_AREA) * 160)}%`, height: '100%', background: i === 0 ? ORANGE : BLUE}} /></div>
          </div>
          <div style={{...font, fontSize: 38, color: INK}}>{Math.round((v / TOTAL_AREA) * 100)}%</div>
        </div>
      ))}
    </>
  ));
};
const FeedV: React.FC<{t: number; ts: number; m: [number, number][]}> = ({t, ts, m}) => {
  if (t > 571) return null;
  const list = EVENTS.filter((e) => e.t >= m[0][1] - 0.01 && t >= e.t && ts < invT(e.t, m) + 2.2).slice(-3);
  return (
    <div style={{position: 'absolute', left: 30, top: 1230, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 8}}>
      {list.map((e) => {
        const s0 = invT(e.t, m);
        const k = lerp(ts, s0, s0 + 0.18, 0, 1, Easing.out(Easing.cubic)) * lerp(ts, s0 + 1.9, s0 + 2.2, 1, 0);
        return (
          <div key={e.l} style={{transform: `translateX(${(k - 1) * 500}px)`, opacity: k, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(20,24,32,0.85)', border: '3px solid rgba(255,255,255,0.3)', borderRadius: 14, padding: '6px 16px 4px 8px', ...font, fontSize: 32, color: '#fff', whiteSpace: 'nowrap', alignSelf: 'flex-start'}}>
            <WFlag code={e.w} w={46} h={31} /><span>{nameOf(e.w)}</span><span style={{color: YELLOW}}>⚔</span>
            <WFlag code={e.l} w={46} h={31} /><span style={{color: '#ff8b84', textDecoration: 'line-through', textDecorationThickness: 3}}>{nameOf(e.l)}</span>
          </div>
        );
      })}
    </div>
  );
};
const BannerV: React.FC<{ts: number; m: [number, number][]; hide: boolean}> = ({ts, m, hide}) => {
  if (hide) return null;
  const items = [
    ...BATTLES.filter((b) => b.t0 >= m[0][1] && b.t0 <= m[m.length - 1][1]).map((b) => ({t: b.t0, text: b.banner, col: b.good ? BLUE : RED, big: false})),
    ...(TL.rounds as any[]).filter((r) => r.t0 >= m[0][1] && r.t0 <= m[m.length - 1][1]).map((r) => ({t: r.t0, text: `ROUND ${r.n}: ${r.title}`, col: ORANGE, big: true})),
  ];
  const it = items.find((x) => { const s0 = invT(x.t, m); return ts >= s0 && ts < s0 + 1.9; });
  if (!it) return null;
  const s0 = invT(it.t, m);
  const k = popT(ts, s0, 11) * lerp(ts - s0, 1.6, 1.9, 1, 0);
  return (
    <div style={{position: 'absolute', top: it.big ? 820 : 640, left: 30, right: 30, display: 'flex', justifyContent: 'center', zIndex: 13}}>
      <div style={{transform: `scale(${k}) rotate(-2deg)`, background: it.col, border: `8px solid ${INK}`, borderRadius: 26, padding: '14px 30px 6px', boxShadow: '0 10px 0 rgba(0,0,0,0.35)', ...font, fontSize: it.big ? 84 : 70, color: '#fff', textShadow: `4px 4px 0 ${INK}`, textAlign: 'center', lineHeight: 1.02}}>{it.text}</div>
    </div>
  );
};
const StampV: React.FC<{ts: number; m: [number, number][]; hide: boolean}> = ({ts, m, hide}) => {
  if (hide) return null;
  const st = (TL.stamps as any[]).find((s) => { const s0 = invT(s.t, m); return s.t >= m[0][1] && s.t <= m[m.length - 1][1] && ts >= s0 && ts < s0 + 1.5; });
  if (!st) return null;
  const dt = ts - invT(st.t, m);
  const k = dt < 0.25 ? interpolate(dt, [0, 0.25], [2.2, 1], {...clamp, easing: Easing.out(Easing.cubic)}) : 1;
  const a = lerp(dt, 0, 0.1, 0, 1) * lerp(dt, 1.25, 1.5, 1, 0);
  const col = st.c === 'red' ? RED : st.c === 'blue' ? BLUE : GREEN;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1000, display: 'flex', justifyContent: 'center', zIndex: 12}}>
      <div style={{transform: `translateY(-50%) scale(${k}) rotate(-6deg)`, opacity: a, border: `12px solid ${col}`, color: col, background: 'rgba(255,246,227,0.95)', borderRadius: 22, padding: '16px 34px 6px', ...font, fontSize: 100, textAlign: 'center', lineHeight: 1, maxWidth: 960, boxShadow: '0 10px 0 rgba(0,0,0,0.3)'}}>{st.text}</div>
    </div>
  );
};
const BubblesV: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const a = areasAt(t);
  return (
    <>
      {BUB.filter(([b0, b1]) => t >= b0 && t <= b1).map(([b0, b1, w, text]) => {
        const [sx, sy] = toV(PL[w].home, cam);
        const r = faceSize(Math.max(a[w] || 0, PL[w].area * 0.25)) * cam.s * VPV.ui;
        const k = popT(t, b0, 10) * lerp(t, b1 - 0.25, b1, 1, 0);
        const half = text.length * 14 + 40;
        return <Bubble key={w + b0} k={k} sx={Math.max(half + 20, Math.min(SW - half - 20, sx))} sy={Math.min(1500, Math.max(activeBattle(t) ? 700 : 560, sy - r - 12))} text={text} size={50} />;
      })}
    </>
  );
};
const LabelsV: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const a = areasAt(t);
  const items: React.ReactNode[] = [];
  for (const c of Object.keys(PL)) {
    const et = elimT[c];
    if (et !== undefined && t > et) continue;
    const r = faceSize(Math.max(a[c] || 0, PL[c].area * 0.25)) * cam.s * VPV.ui;
    if (r < 22) continue;
    const [sx, sy] = toV(PL[c].home, cam);
    const y = sy + r + 6;
    if (sx < 110 || sx > 970 || y < 560 || y > 1560) continue;
    items.push(<div key={c} style={{position: 'absolute', left: sx, top: y, transform: 'translateX(-50%)', background: '#fff', border: `5px solid ${INK}`, borderRadius: 14, padding: '2px 14px 0', ...font, fontSize: Math.min(40, 24 + r * 0.2), color: INK, whiteSpace: 'nowrap', boxShadow: '0 5px 0 rgba(0,0,0,0.3)'}}>{nameOf(c).toUpperCase()}</div>);
  }
  return <div style={{position: 'absolute', inset: 0, zIndex: 3}}>{items}</div>;
};
const HookV: React.FC<{ts: number; text: string}> = ({ts, text}) => {
  if (ts > 1.6) return null;
  const k = (1 + 0.06 * Math.sin(ts * 14) * Math.exp(-ts * 3)) * lerp(ts, 1.3, 1.6, 1, 0, Easing.in(Easing.cubic));
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 16, background: `rgba(8,18,32,${0.35 * lerp(ts, 1.2, 1.6, 1, 0)})`}}>
      <div style={{transform: `scale(${k}) rotate(-3deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
        <div style={{background: INK, color: '#fff', borderRadius: 18, padding: '8px 24px 2px', ...font, fontSize: 42}}>WORLD BATTLE ROYALE</div>
        <div style={{background: '#fff', border: `11px solid ${INK}`, borderRadius: 34, padding: '20px 36px 8px', ...font, fontSize: 112, color: RED, textAlign: 'center', lineHeight: 0.98, maxWidth: 980, boxShadow: '0 14px 0 rgba(0,0,0,0.45)'}}>{text}</div>
      </div>
    </AbsoluteFill>
  );
};
const Crown: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 100 70"><path d="M8,62 L4,18 L28,38 L50,6 L72,38 L96,18 L92,62 Z" fill={YELLOW} stroke={INK} strokeWidth={6} strokeLinejoin="round" /><circle cx={50} cy={44} r={7} fill={RED} stroke={INK} strokeWidth={3} /></svg>
);
const WinnerV: React.FC<{t: number}> = ({t}) => {
  const v = TL.victory as number;
  if (t < v || t > 590) return null;
  const k = popT(t, v, 10);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 14, background: `rgba(8,18,32,${0.4 * k})`}}>
      <div style={{transform: `scale(${k})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{transform: `translateY(${Math.sin(t * 3) * 6}px)`, marginBottom: -40, zIndex: 2}}><Crown size={260} /></div>
        <div style={{width: 440, height: 440, borderRadius: '50%', overflow: 'hidden', border: `12px solid ${INK}`}}><WFlag code="US" w={440} h={440} /></div>
        <div style={{marginTop: 24, background: YELLOW, border: `9px solid ${INK}`, borderRadius: 28, padding: '10px 40px 0', ...font, fontSize: 96, color: INK, textAlign: 'center', lineHeight: 1}}>USA WINS</div>
        <div style={{marginTop: 18, background: INK, border: '6px solid #fff', borderRadius: 22, padding: '8px 28px 2px', ...font, fontSize: 52, color: '#fff'}}>194 COUNTRIES ELIMINATED</div>
      </div>
    </AbsoluteFill>
  );
};
const EndV: React.FC<{ts: number; d: Def}> = ({ts, d}) => {
  if (ts < d.end) return null;
  const k = popT(ts, d.end, 11);
  if (!d.next) {
    return (
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 17, background: `rgba(8,18,32,${0.5 * k})`}}>
        <div style={{transform: `scale(${k}) rotate(-2deg)`, background: '#fff', border: `11px solid ${INK}`, borderRadius: 34, padding: '26px 40px 12px', ...font, fontSize: 108, color: INK, textAlign: 'center', lineHeight: 1.02, boxShadow: '0 14px 0 rgba(0,0,0,0.4)'}}>Who would<br /><span style={{color: RED}}>REALLY</span> win?</div>
        <div style={{marginTop: 34, transform: `scale(${popT(ts, d.end + 0.5, 12)})`, background: YELLOW, border: `7px solid ${INK}`, borderRadius: 26, padding: '10px 34px 2px', ...font, fontSize: 60, color: INK}}>Comment below!</div>
      </AbsoluteFill>
    );
  }
  const bounce = Math.sin((ts - d.end) * 8) * 10;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 17, background: `rgba(8,18,32,${0.5 * k})`}}>
      <div style={{transform: `scale(${k}) rotate(-2deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
        <div style={{background: YELLOW, border: `7px solid ${INK}`, borderRadius: 22, padding: '6px 30px 0', ...font, fontSize: 62, color: INK, boxShadow: '0 8px 0 rgba(0,0,0,0.4)'}}>NEXT · PART {d.part + 1}/6</div>
        <div style={{background: '#fff', border: `11px solid ${INK}`, borderRadius: 34, padding: '20px 40px 8px', ...font, fontSize: 100, color: BLUE, textAlign: 'center', lineHeight: 1, maxWidth: 980, boxShadow: '0 14px 0 rgba(0,0,0,0.4)'}}>{d.next}</div>
        <div style={{transform: `translateX(${bounce}px)`, ...font, fontSize: 120, color: '#fff', textShadow: `6px 6px 0 ${INK}`}}>➜</div>
      </div>
    </AbsoluteFill>
  );
};

export const ShortBR: React.FC<{part: number}> = ({part}) => {
  usePreload();
  const d = SBR[part - 1];
  const ts = useCurrentFrame() / 30;
  const t = mapT(ts, d.map);
  const cam = camV(t);
  const hook = ts < 1.6, ending = ts >= d.end;
  return (
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <OceanV t={t} />
      <WorldMap t={t} cam={cam} vp={VPV} />
      <AbsoluteFill style={{background: 'linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0) 14%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.3))'}} />
      <LabelsV t={t} cam={cam} />
      {!hook && !ending && <BubblesV t={t} cam={cam} />}
      {!ending && <HudV t={t} />}
      {!ending && !hook && <RankV t={t} />}
      {!ending && <FeedV t={t} ts={ts} m={d.map} />}
      <BannerV ts={ts} m={d.map} hide={hook || ending} />
      <StampV ts={ts} m={d.map} hide={hook || ending} />
      {part === 6 && !ending && <WinnerV t={t} />}
      <Header t={t} part={part} />
      <HookV ts={ts} text={d.hook} />
      <EndV ts={ts} d={d} />
      <Audio src={staticFile(`shortbr${part}.wav`)} />
    </AbsoluteFill>
  );
};
