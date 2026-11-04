import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import SH from './shortscont.json';
import TL from './cont-tl.json';
import {P, Cam, INK, CREAM, RED, BLUE, GREEN, YELLOW, ORANGE, clamp, lerp, fmt, font, font2, popT, Bubble, Avatar, Mood} from './lib3';
import {WFlag, usePreload} from './War6';
import {camera, ContMap, CVP, CAPS, TEAMOF, nameOf, TNAME, TCOL, TDARK, TFLAG, MATCHES, FRONTS, BUB, matchAt, tugAt, soldiersAt, dayAt, faceR, ctrlAt, HOME, activeFront, totalDays} from './War7';

type Def = {part: number; hook: string; next: string; map: [number, number][]; end: number};
export const SCD = SH as unknown as Def[];
const SW = 1080, SHh = 1920;
const VPV: CVP = {W: SW, H: SHh, ox: 540, oy: 1040, ui: 1.25};
const mapT = (ts: number, m: [number, number][]) => interpolate(ts, m.map((x) => x[0]), m.map((x) => x[1]), clamp);
const invT = (to: number, m: [number, number][]) => interpolate(to, m.map((x) => x[1]), m.map((x) => x[0]), clamp);
const camV = (t: number): Cam => {
  const c = camera(t);
  const s = Math.max(0.6, c.s * 0.95);
  const hw = 540 / s;
  return {cx: Math.max(hw - 30, Math.min(1950 - hw, c.cx)), cy: c.cy + 30 / s, s};
};
const toV = (p: P, cam: Cam): P => [VPV.ox + (p[0] - cam.cx) * cam.s, VPV.oy + (p[1] - cam.cy) * cam.s];
const OceanV: React.FC<{t: number}> = ({t}) => (
  <svg width={SW} height={SHh} style={{position: 'absolute'}}>
    <defs>
      <radialGradient id="seaVC" cx="50%" cy="50%" r="80%"><stop offset="0%" stopColor="#3f97d6" /><stop offset="100%" stopColor="#1d5e9f" /></radialGradient>
      <pattern id="wavesVC" width={140} height={46} patternUnits="userSpaceOnUse" patternTransform={`translate(${(t * 10.5) % 140},0)`}><path d="M0,23 C17,13 35,13 52,23 S87,33 105,23 S122,13 140,23" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={3} /></pattern>
    </defs>
    <rect width={SW} height={SHh} fill="url(#seaVC)" /><rect width={SW} height={SHh} fill="url(#wavesVC)" />
  </svg>
);
const HudV: React.FC<{t: number; part: number}> = ({t, part}) => {
  const m = matchAt(t);
  const showM = m && t > m.t0 + 2.0 && t < m.t1 - 6.5;
  const pa = popT(t, (m?.t0 ?? 0) + 2.0, 13);
  return (
    <div style={{position: 'absolute', top: 112, left: 30, right: 30, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
      <div style={{display: 'flex', gap: 12}}>
        <div style={{background: YELLOW, border: `5px solid ${INK}`, borderRadius: 18, padding: '6px 18px 0', ...font, fontSize: 40, color: INK}}>PART {part}/6</div>
        {m && showM && <div style={{background: INK, border: '5px solid #fff', borderRadius: 18, padding: '6px 18px 0', ...font, fontSize: 40, color: YELLOW}}>{m.title} · DAY {dayAt(t, m)}</div>}
      </div>
      {m && showM && (() => {
        const p = tugAt(t, m);
        const [sa, sb] = soldiersAt(t, m);
        const moodA: Mood = p > 0.62 ? 'smug' : p < 0.38 ? 'scared' : 'angry';
        const moodB: Mood = p < 0.38 ? 'smug' : p > 0.62 ? 'scared' : 'angry';
        const side = (tm: string, n: number, mood: Mood, right: boolean) => (
          <div style={{display: 'flex', alignItems: 'center', gap: 10, flexDirection: right ? 'row-reverse' : 'row'}}>
            <Avatar size={96} code={TFLAG(tm)} mood={mood} t={t} seed={tm.charCodeAt(0)} look={[right ? -1 : 1, 0]} id={`hv-${tm}`} />
            <div style={{display: 'flex', flexDirection: 'column', alignItems: right ? 'flex-end' : 'flex-start'}}>
              <div style={{...font, fontSize: 34, color: '#fff', lineHeight: 1, textShadow: `3px 3px 0 ${INK}`}}>{TNAME[tm]}</div>
              <div style={{...font, fontSize: 42, color: YELLOW, lineHeight: 1.1, textShadow: `3px 3px 0 ${INK}`}}>{fmt(Math.round(n / 1000) * 1000)}</div>
            </div>
          </div>
        );
        return (
          <div style={{width: '100%', transform: `translateY(${(1 - pa) * -400}px)`, background: 'rgba(16,22,34,0.88)', border: '5px solid #fff', borderRadius: 30, padding: '12px 18px 14px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>{side(m.a, sa, moodA, false)}<div style={{...font, fontSize: 40, color: RED, textShadow: `3px 3px 0 ${INK}`}}>VS</div>{side(m.b, sb, moodB, true)}</div>
            <div style={{display: 'flex', justifyContent: 'space-between', ...font, fontSize: 34, color: '#fff', margin: '8px 6px 4px'}}><span>{Math.round(p * 100)}%</span><span style={{color: YELLOW, fontSize: 28}}>TERRITORY</span><span>{100 - Math.round(p * 100)}%</span></div>
            <div style={{position: 'relative', height: 38, borderRadius: 19, overflow: 'hidden', border: `5px solid ${INK}`, display: 'flex'}}>
              <div style={{width: `${p * 100}%`, background: `repeating-linear-gradient(45deg, ${TCOL[m.a]}, ${TCOL[m.a]} 12px, ${TDARK[m.a]} 12px, ${TDARK[m.a]} 24px)`}} />
              <div style={{flex: 1, background: `repeating-linear-gradient(-45deg, ${TCOL[m.b]}, ${TCOL[m.b]} 12px, ${TDARK[m.b]} 12px, ${TDARK[m.b]} 24px)`}} />
              <div style={{position: 'absolute', left: `calc(${p * 100}% - 4px)`, top: -4, width: 8, height: 46, background: '#fff', boxShadow: '0 0 10px #fff'}} />
            </div>
          </div>
        );
      })()}
    </div>
  );
};
const FrontChipV: React.FC<{t: number; ts: number; m: [number, number][]; hide: boolean}> = ({t, ts, m, hide}) => {
  if (hide) return null;
  const f = FRONTS.find((x) => { const s0 = invT(x.t0, m); return x.t0 >= m[0][1] && ts >= s0 + 0.1 && ts < s0 + 1.8; });
  if (!f || !f.label) return null;
  const s0 = invT(f.t0, m);
  const k = popT(ts, s0 + 0.1, 12) * lerp(ts, s0 + 1.5, s0 + 1.8, 1, 0);
  const big = (TL.battles as any[]).some(([a]) => Math.abs(a - f.t0) < 0.01);
  return (
    <div style={{position: 'absolute', top: 470, left: 30, right: 30, display: 'flex', justifyContent: 'center', zIndex: 12}}>
      <div style={{transform: `scale(${k}) rotate(-2deg)`, display: 'flex', alignItems: 'center', gap: 14, background: big ? RED : TCOL[f.team], border: `7px solid ${INK}`, borderRadius: 22, padding: '10px 26px 4px', ...font, fontSize: big ? 66 : 52, color: '#fff', textShadow: `3px 3px 0 ${INK}`, textAlign: 'center', lineHeight: 1.02, maxWidth: 1000}}>
        <WFlag code={f.lead} w={62} h={41} />{f.label}
      </div>
    </div>
  );
};
const FeedV: React.FC<{t: number; ts: number; m: [number, number][]}> = ({t, ts, m}) => {
  const list = CAPS.filter((c) => c.lead && c.t >= m[0][1] && t >= c.t && ts < invT(c.t, m) + 2.0).slice(-3);
  return (
    <div style={{position: 'absolute', left: 26, top: 1290, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 8}}>
      {list.map((c) => {
        const s0 = invT(c.t, m);
        const k = lerp(ts, s0, s0 + 0.18, 0, 1, Easing.out(Easing.cubic)) * lerp(ts, s0 + 1.7, s0 + 2.0, 1, 0);
        const lib = c.to === TEAMOF[c.c];
        return (
          <div key={c.c + c.t} style={{transform: `translateX(${(k - 1) * 520}px)`, opacity: k, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(16,22,34,0.88)', borderLeft: `9px solid ${TCOL[c.to]}`, borderRadius: 14, padding: '6px 16px 4px 8px', ...font, fontSize: 32, color: '#fff', whiteSpace: 'nowrap', alignSelf: 'flex-start'}}>
            <WFlag code={c.lead} w={46} h={31} /><span>{nameOf(c.lead)}</span><span style={{color: lib ? '#8ef0a8' : YELLOW}}>{lib ? '✚' : '⚔'}</span>
            <WFlag code={c.c} w={46} h={31} /><span style={{color: lib ? '#8ef0a8' : '#ff9b94'}}>{nameOf(c.c)}</span>
          </div>
        );
      })}
    </div>
  );
};
const StampV: React.FC<{ts: number; m: [number, number][]; hide: boolean}> = ({ts, m, hide}) => {
  if (hide) return null;
  const st = (TL.stamps as any[]).find((s) => { const s0 = invT(s.t, m); return s.t >= m[0][1] && s.t <= m[m.length - 1][1] && ts >= s0 && ts < s0 + 1.6; });
  if (!st) return null;
  const dt = ts - invT(st.t, m);
  const k = dt < 0.25 ? interpolate(dt, [0, 0.25], [2.2, 1], {...clamp, easing: Easing.out(Easing.cubic)}) : 1;
  const a = lerp(dt, 0, 0.1, 0, 1) * lerp(dt, 1.35, 1.6, 1, 0);
  const col = st.c === 'red' ? RED : st.c === 'blue' ? BLUE : GREEN;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1040, display: 'flex', justifyContent: 'center', zIndex: 13}}>
      <div style={{transform: `translateY(-50%) scale(${k}) rotate(-6deg)`, opacity: a, border: `12px solid ${col}`, color: col, background: 'rgba(255,246,227,0.95)', borderRadius: 22, padding: '16px 30px 6px', ...font, fontSize: 96, textAlign: 'center', lineHeight: 1, maxWidth: 980, boxShadow: '0 10px 0 rgba(0,0,0,0.3)'}}>{st.text}</div>
    </div>
  );
};
const BubblesV: React.FC<{t: number; cam: Cam}> = ({t, cam}) => (
  <>
    {BUB.filter(([b0, b1]) => t >= b0 && t <= b1).map(([b0, b1, w, text]) => {
      const [sx, sy] = toV(HOME[w], cam);
      const r = faceR(w) * cam.s * VPV.ui;
      const k = popT(t, b0, 10) * lerp(t, b1 - 0.25, b1, 1, 0);
      const half = text.length * 14 + 40;
      return <Bubble key={w + b0} k={k} sx={Math.max(half + 20, Math.min(SW - half - 20, sx))} sy={Math.min(1500, Math.max(640, sy - r - 12))} text={text} size={50} />;
    })}
  </>
);
const LabelsV: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const f = activeFront(t);
  if (!f) return null;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 3}}>
      {f.targets.filter((c) => { const cp = CAPS.find((x) => x.c === c && x.t >= f.t0 && x.t <= f.t1 + 0.1); return !cp || (t > cp.t - 3.0 && t < cp.t + 1.8); }).slice(0, 5).map((c) => {
        const [sx, sy] = toV(HOME[c], cam);
        const y = sy + Math.max(faceR(c) * cam.s * VPV.ui, 10) + 6;
        if (sx < 100 || sx > 980 || y < 620 || y > 1560) return null;
        const capd = ctrlAt(t)[c] !== TEAMOF[c] && !f.lib;
        return <div key={c} style={{position: 'absolute', left: sx, top: y, transform: 'translateX(-50%)', background: capd ? TCOL[ctrlAt(t)[c]] : '#fff', border: `5px solid ${INK}`, borderRadius: 14, padding: '2px 14px 0', ...font, fontSize: 32, color: capd ? '#fff' : INK, whiteSpace: 'nowrap'}}>{nameOf(c).toUpperCase()}</div>;
      })}
    </div>
  );
};
const MatchIntroV: React.FC<{t: number}> = ({t}) => {
  const m = MATCHES.find((x) => t >= x.t0 && t < x.t0 + 2.2);
  if (!m) return null;
  const dt = t - m.t0;
  const k = popT(t, m.t0, 11) * lerp(dt, 1.9, 2.2, 1, 0);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 15, background: `rgba(8,15,30,${0.55 * k})`}}>
      <div style={{transform: `scale(${k})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
        <div style={{background: YELLOW, border: `7px solid ${INK}`, borderRadius: 22, padding: '6px 30px 0', ...font, fontSize: 64, color: INK}}>{m.title}</div>
        <Avatar size={300} code={TFLAG(m.a)} mood="angry" t={t} seed={1} id="mv-a" /><div style={{...font, fontSize: 60, color: '#fff', textShadow: `4px 4px 0 ${INK}`}}>{TNAME[m.a]}</div>
        <div style={{...font, fontSize: 130, color: RED, textShadow: `6px 6px 0 ${INK}`}}>VS</div>
        <Avatar size={300} code={TFLAG(m.b)} mood="angry" t={t} seed={2} id="mv-b" /><div style={{...font, fontSize: 60, color: '#fff', textShadow: `4px 4px 0 ${INK}`}}>{TNAME[m.b]}</div>
      </div>
    </AbsoluteFill>
  );
};
const TeamIntroV: React.FC<{t: number}> = ({t}) => {
  const it = (TL.intro as [number, string][]).find(([a]) => t >= a && t < a + 3.0);
  if (!it) return null;
  const [t0, tm] = it;
  const k = popT(t, t0 + 0.1, 12) * lerp(t, t0 + 2.7, t0 + 3.0, 1, 0);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1300, display: 'flex', justifyContent: 'center', zIndex: 12, transform: `scale(${k})`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, background: CREAM, border: `8px solid ${INK}`, borderRadius: 30, padding: '12px 28px 12px 12px'}}>
        <Avatar size={150} code={TFLAG(tm)} mood="angry" t={t} seed={tm.charCodeAt(0)} id={`tiv-${tm}`} />
        <div style={{...font, fontSize: 76, color: TCOL[tm]}}>{TNAME[tm]}</div>
      </div>
    </div>
  );
};
type Slot = {team: string | null; win?: boolean; lose?: boolean};
const BracketV: React.FC<{t: number}> = ({t}) => {
  const br = (TL.brackets as [number, number, number][]).find(([a, b]) => t >= a && t < b);
  if (!br) return null;
  const [t0, t1, st] = br;
  const k = popT(t, t0, 12) * lerp(t, t1 - 0.35, t1, 1, 0);
  const rows: [string, Slot, Slot][] = [
    ['QUARTER-FINAL 1', {team: 'NA', win: st >= 1}, {team: 'SA', lose: st >= 1}],
    ['QUARTER-FINAL 2', {team: 'EU', win: st >= 2}, {team: 'AF', lose: st >= 2}],
    ['QUARTER-FINAL 3', {team: 'AS', win: st >= 3}, {team: 'OC', lose: st >= 3}],
    ['SEMI-FINAL', {team: st >= 2 ? 'EU' : null, lose: st >= 4}, {team: st >= 3 ? 'AS' : null, win: st >= 4}],
    ['THE FINAL', {team: st >= 1 ? 'NA' : null}, {team: st >= 4 ? 'AS' : null}],
  ];
  const nextIdx = [0, 1, 2, 3, 4][st];
  const chip = (s: Slot, i: string) => (
    <div style={{flex: 1, display: 'flex', alignItems: 'center', gap: 10, height: 76, padding: '0 12px', background: s.team ? (s.lose ? '#9aa1ab' : '#fff') : 'rgba(255,255,255,0.25)', border: `5px solid ${s.win ? YELLOW : INK}`, borderRadius: 18, opacity: s.lose ? 0.7 : 1}}>
      {s.team ? <><Avatar size={58} code={TFLAG(s.team)} mood={s.lose ? 'sad' : s.win ? 'happy' : 'calm'} t={t} seed={s.team.charCodeAt(1)} id={`bv-${i}`} /><div style={{...font, fontSize: 30, color: INK, textDecoration: s.lose ? 'line-through' : 'none', whiteSpace: 'nowrap'}}>{TNAME[s.team]}</div></> : <div style={{...font, fontSize: 40, color: '#fff', width: '100%', textAlign: 'center'}}>?</div>}
    </div>
  );
  return (
    <AbsoluteFill style={{zIndex: 16, background: `rgba(8,15,30,${0.85 * k})`, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{opacity: k, transform: `scale(${0.9 + 0.1 * k})`, width: 1000, display: 'flex', flexDirection: 'column', gap: 18}}>
        <div style={{...font, fontSize: 80, color: YELLOW, textAlign: 'center', textShadow: `5px 5px 0 ${INK}`}}>🏆 WORLD CUP OF WAR</div>
        {rows.map(([lbl, a, b], i) => (
          <div key={lbl} style={{padding: 10, borderRadius: 24, boxShadow: i === nextIdx ? `0 0 0 6px rgba(255,210,63,${0.5 + 0.5 * Math.sin(t * 7)})` : 'none'}}>
            <div style={{...font, fontSize: 34, color: i === 4 ? YELLOW : '#fff', marginBottom: 6}}>{lbl}</div>
            <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>{chip(a, `${i}a`)}<div style={{...font, fontSize: 36, color: RED}}>VS</div>{chip(b, `${i}b`)}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
const VictoryV: React.FC<{t: number}> = ({t}) => {
  const v = TL.victory as number, q = TL.question as number, st = TL.stats as number;
  if (t < v || t > q) return null;
  const k = popT(t, v, 10);
  const mvp = (TL.mvp as [string, number][])[0];
  return (
    <AbsoluteFill style={{zIndex: 14, background: `rgba(8,15,30,${0.5 * k})`, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: `scale(${k})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
        <div style={{fontSize: 170, marginBottom: -60, zIndex: 2}}>🏆</div>
        <Avatar size={380} code="tas" mood="happy" t={t} seed={5} id="vv-as" />
        <div style={{background: YELLOW, border: `9px solid ${INK}`, borderRadius: 28, padding: '10px 40px 0', ...font, fontSize: 100, color: INK}}>ASIA WINS!</div>
        {t > st && (
          <div style={{marginTop: 10, width: 960, background: CREAM, border: `8px solid ${INK}`, borderRadius: 28, padding: '14px 24px', transform: `scale(${popT(t, st, 12)})`}}>
            {[[<WFlag code={mvp[0]} w={60} h={40} />, 'MVP', `${nameOf(mvp[0])} · ${mvp[1]} captures`], [<Avatar size={52} code="tna" mood="calm" t={t} seed={4} id="vv-na" />, 'Fastest win', 'North America · 14 days'], [<WFlag code="RU" w={60} h={40} />, 'Biggest battle', 'Battle of Moscow'], [<div style={{fontSize: 44}}>📅</div>, 'Total war', `${totalDays} days`]].map(([ic, l, v2], i) => (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, height: 84, borderTop: i ? '3px solid #e2d3b1' : 'none'}}>
                <div style={{width: 64, display: 'flex', justifyContent: 'center'}}>{ic}</div><div style={{...font2, fontSize: 34, color: INK, width: 250}}>{l as string}</div><div style={{...font, fontSize: 40, color: INK}}>{v2 as string}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
const QuestionV: React.FC<{t: number}> = ({t}) => {
  const q = TL.question as number;
  if (t < q) return null;
  const k = popT(t, q, 11);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 15, background: `rgba(8,18,32,${0.5 * k})`}}>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 140px)', gap: 16, marginBottom: 30, transform: `scale(${k})`}}>{['NA', 'SA', 'EU', 'AF', 'AS', 'OC'].map((tm, i) => <Avatar key={tm} size={140} code={TFLAG(tm)} mood={tm === 'AS' ? 'smug' : 'angry'} t={t} seed={i} id={`qv-${tm}`} />)}</div>
      <div style={{transform: `scale(${k}) rotate(-2deg)`, background: '#fff', border: `11px solid ${INK}`, borderRadius: 34, padding: '24px 36px 12px', ...font, fontSize: 96, color: INK, textAlign: 'center', lineHeight: 1.02}}>Which continent<br />would <span style={{color: RED}}>REALLY</span> win?</div>
      <div style={{marginTop: 30, transform: `scale(${popT(t, q + 0.6, 12)})`, background: YELLOW, border: `7px solid ${INK}`, borderRadius: 26, padding: '10px 34px 2px', ...font, fontSize: 60, color: INK}}>Comment below!</div>
    </AbsoluteFill>
  );
};
const HookV: React.FC<{ts: number; text: string}> = ({ts, text}) => {
  if (ts > 1.6) return null;
  const k = (1 + 0.06 * Math.sin(ts * 14) * Math.exp(-ts * 3)) * lerp(ts, 1.3, 1.6, 1, 0, Easing.in(Easing.cubic));
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 18, background: `rgba(8,18,32,${0.4 * lerp(ts, 1.2, 1.6, 1, 0)})`}}>
      <div style={{transform: `scale(${k}) rotate(-3deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
        <div style={{display: 'flex', gap: 10}}>{['NA', 'SA', 'EU', 'AF', 'AS', 'OC'].map((tm, i) => <Avatar key={tm} size={120} code={TFLAG(tm)} mood="angry" t={ts} seed={i} id={`hk-${tm}`} />)}</div>
        <div style={{background: INK, color: '#fff', borderRadius: 18, padding: '8px 24px 2px', ...font, fontSize: 42}}>WAR OF CONTINENTS</div>
        <div style={{background: '#fff', border: `11px solid ${INK}`, borderRadius: 34, padding: '20px 36px 8px', ...font, fontSize: 108, color: RED, textAlign: 'center', lineHeight: 0.98, maxWidth: 1000}}>{text}</div>
      </div>
    </AbsoluteFill>
  );
};
const EndV: React.FC<{ts: number; d: Def}> = ({ts, d}) => {
  if (ts < d.end || !d.next) return null;
  const k = popT(ts, d.end, 11);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 18, background: `rgba(8,18,32,${0.5 * k})`}}>
      <div style={{transform: `scale(${k}) rotate(-2deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
        <div style={{background: YELLOW, border: `7px solid ${INK}`, borderRadius: 22, padding: '6px 30px 0', ...font, fontSize: 62, color: INK}}>NEXT · PART {d.part + 1}/6</div>
        <div style={{background: '#fff', border: `11px solid ${INK}`, borderRadius: 34, padding: '20px 40px 8px', ...font, fontSize: 100, color: BLUE, textAlign: 'center', lineHeight: 1, maxWidth: 1000}}>{d.next}</div>
        <div style={{transform: `translateX(${Math.sin((ts - d.end) * 8) * 10}px)`, ...font, fontSize: 120, color: '#fff', textShadow: `6px 6px 0 ${INK}`}}>➜</div>
      </div>
    </AbsoluteFill>
  );
};
export const ShortCont: React.FC<{part: number}> = ({part}) => {
  usePreload();
  const d = SCD[part - 1];
  const ts = useCurrentFrame() / 30;
  const t = mapT(ts, d.map);
  const cam = camV(t);
  const hook = ts < 1.6, ending = ts >= d.end;
  return (
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <OceanV t={t} />
      <ContMap t={t} cam={cam} vp={VPV} />
      <AbsoluteFill style={{background: 'linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0) 14%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.3))'}} />
      <LabelsV t={t} cam={cam} />
      {!hook && !ending && <BubblesV t={t} cam={cam} />}
      {!ending && <FeedV t={t} ts={ts} m={d.map} />}
      {!ending && <HudV t={t} part={part} />}
      <FrontChipV t={t} ts={ts} m={d.map} hide={hook || ending} />
      <StampV ts={ts} m={d.map} hide={hook || ending} />
      <TeamIntroV t={t} />
      {!hook && <MatchIntroV t={t} />}
      <BracketV t={t} />
      <VictoryV t={t} />
      <QuestionV t={t} />
      <HookV ts={ts} text={d.hook} />
      <EndV ts={ts} d={d} />
      <Audio src={staticFile(`shortcont${part}.wav`)} />
    </AbsoluteFill>
  );
};
