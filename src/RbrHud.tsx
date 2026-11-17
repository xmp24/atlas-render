// HUD del Mega Battle Royale de ruleta (AMERICA vs ASIA) — recrea el formato del vídeo de referencia
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COUNTRIES, FlagCanvas} from './HexWorld';
import {INK, Face} from './lib3';
import {PIECES_C} from './PolyWorld';

type Cam = {cx: number; cy: number; s: number};
const VW = 1920, VH = 1080;
const F: React.CSSProperties = {fontFamily: 'Lilita'};
const CREAM = '#fbf3df', DARK = '#1c1a26', GOLD = '#f5b62a', RED = '#e8352b', BLUE = '#2f6fe0', TEAL = '#25b7a8';
const NMX: Record<string, string> = {'United States of America': 'USA', 'Dominican Rep.': 'Dominican Rep.', 'United Arab Emirates': 'UAE', 'Central African Rep.': 'CAR'};
const NM = (k: number) => { const n = COUNTRIES[k]?.n || '?'; return NMX[n] || n.replace('St. Vin. and Gren.', 'St. Vincent').replace('St. Kitts and Nevis', 'St. Kitts').replace('Antigua and Barb.', 'Antigua').replace('Trinidad and Tobago', 'Trinidad'); };
const toS = (x: number, y: number, c: Cam): [number, number] => [VW / 2 + (x - c.cx) * c.s, VH / 2 + (y - c.cy) * c.s];
const cl = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const eo = (u: number) => { u = cl(u, 0, 1); return 1 - (1 - u) ** 3; };
const pop = (t: number, t0: number, sp = 9) => { const d = t - t0; if (d <= 0) return 0; return 1 + Math.exp(-sp * 0.55 * d) * Math.sin(d * sp - Math.PI / 2) * 0.35 + (1 - Math.min(1, d * sp / 2.2)) * -0.0; };
const popIn = (t: number, t0: number) => { const d = t - t0; if (d <= 0) return 0; if (d > 0.5) return 1; const u = d / 0.5; return 1 + Math.sin(u * Math.PI) * 0.12 * (1 - u) - (1 - eo(u * 1.6)) * 1; };
const fadeW = (t: number, t0: number, t1: number, a = 0.18) => cl(Math.min((t - t0) / a, (t1 - t) / a), 0, 1);
const kv = (arr: any[], t: number) => { let v = arr[0]; for (const x of arr) { if (x[0] <= t) v = x; else break; } return v; };
const Flag: React.FC<{k: number; w: number; h?: number; round?: boolean}> = ({k, w, h, round}) => (
  <div style={{width: w, height: h ?? w * 0.66, borderRadius: round ? '50%' : 6, overflow: 'hidden', border: `3px solid ${INK}`, flexShrink: 0, position: 'relative', boxShadow: '0 2px 0 rgba(0,0,0,0.25)'}}>
    <FlagCanvas k={k} w={round ? w * 1.5 : w} h={h ?? (round ? w : w * 0.66)} style={round ? {marginLeft: -w * 0.25} : undefined} />
  </div>
);
const Panel: React.FC<{style?: React.CSSProperties; children: React.ReactNode; dark?: boolean; border?: string}> = ({style, children, dark, border}) => (
  <div style={{background: dark ? DARK : CREAM, border: `5px solid ${border || INK}`, borderRadius: 16, boxShadow: `0 6px 0 ${INK}, 0 10px 20px rgba(0,0,0,0.35)`, ...style}}>{children}</div>
);
const Pill: React.FC<{bg: string; fg?: string; size?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({bg, fg = '#fff', size = 30, children, style}) => (
  <div style={{display: 'inline-block', background: bg, color: fg, border: `4px solid ${INK}`, borderRadius: 999, padding: `${size * 0.12}px ${size * 0.6}px ${size * 0.02}px`, ...F, fontSize: size, lineHeight: 1.15, boxShadow: `0 4px 0 ${INK}`, whiteSpace: 'nowrap', ...style}}>{children}</div>
);

// ---------------------------------------------------------------- marcadores fijos
const AliveBox: React.FC<{RB: any; t: number}> = ({RB, t}) => {
  const n = kv(RB.alive, t)[1]; const r = kv(RB.round, t)[1]; const last = kv(RB.alive, t)[0]; const b = t - last < 0.5 && last > 0 ? 1 + 0.18 * (1 - (t - last) / 0.5) : 1;
  return (
    <Panel style={{position: 'absolute', left: 22, top: 18, width: 218, height: 152, padding: '10px 16px'}}>
      <div style={{...F, fontSize: 21, letterSpacing: 2.5, color: INK}}>STILL STANDING</div>
      <div style={{...F, fontSize: 86, lineHeight: 0.95, color: INK, transform: `scale(${b})`, transformOrigin: '0 50%'}}>{n}</div>
      <div style={{...F, fontSize: 21, color: RED}}>{r > 0 ? `ROUND ${r}` : 'GET READY'}</div>
    </Panel>
  );
};
const ICON: Record<string, [string, string]> = {pick: ['🎲', GOLD], play: ['👑', GOLD], war: ['⚔️', RED], win: ['🏆', GOLD], pact: ['🤝', TEAL], ally: ['🤝', TEAL], power: ['⚡', '#ff9a1a'], rebel: ['✊', '#9a5be0'], land: ['⚓', '#3aa0ff']};
const Status: React.FC<{RB: any; t: number}> = ({RB, t}) => {
  const s = (RB.status as any[]).find((x) => t >= x[0] && t < x[1]); if (!s) return null;
  const [t0, t1, kind, title, sub, k, k2] = s; const a = fadeW(t, t0, t1, 0.15); const sl = (1 - eo((t - t0) / 0.3)) * -30;
  const box: React.CSSProperties = {position: 'absolute', left: 262, top: 18, width: 1210, height: 100, opacity: a, transform: `translateY(${sl}px)`};
  if (kind === 'vs') {
    const v = (RB.vs as any[]).find((x) => t >= x[0] && t < x[1]); if (!v) return null;
    const hk = v[4] as number[][]; let ha = 100, hb = 100;
    for (let i = 0; i < hk.length; i++) { if (hk[i][0] <= t) { ha = hk[i][1]; hb = hk[i][2]; if (i + 1 < hk.length) { const u = cl((t - hk[i][0]) / (hk[i + 1][0] - hk[i][0]), 0, 1); ha += (hk[i + 1][1] - ha) * u; hb += (hk[i + 1][2] - hb) * u; } } }
    const bar = (hp: number, right: boolean) => (
      <div style={{width: 400, height: 26, borderRadius: 13, background: '#3b3746', border: `3px solid ${INK}`, overflow: 'hidden', display: 'flex', justifyContent: right ? 'flex-end' : 'flex-start'}}>
        <div style={{width: `${hp}%`, height: '100%', background: hp > 50 ? '#3fd36b' : hp > 25 ? '#ffc21a' : '#ff4a3a'}} />
      </div>
    );
    return (
      <Panel dark border={GOLD} style={{...box, display: 'flex', alignItems: 'center', padding: '0 22px', gap: 14}}>
        <Flag k={v[2]} w={64} h={42} />
        <div style={{display: 'flex', flexDirection: 'column', gap: 6}}><div style={{...F, fontSize: 34, color: '#fff', lineHeight: 1}}>{NM(v[2]).toUpperCase()}</div>{bar(ha, false)}</div>
        <div style={{flex: 1, display: 'flex', justifyContent: 'center'}}><div style={{width: 78, height: 78, borderRadius: '50%', background: RED, border: `5px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...F, fontSize: 40, color: '#fff', boxShadow: `0 4px 0 ${INK}`, transform: `scale(${1 + 0.06 * Math.sin(t * 8)})`}}>VS</div></div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end'}}><div style={{...F, fontSize: 34, color: '#fff', lineHeight: 1}}>{NM(v[3]).toUpperCase()}</div>{bar(hb, true)}</div>
        <Flag k={v[3]} w={64} h={42} />
      </Panel>
    );
  }
  const [ic, col] = ICON[kind] || ['★', GOLD]; const win = kind === 'win';
  return (
    <Panel dark={!win} border={win ? INK : col} style={{...box, display: 'flex', alignItems: 'center', gap: 18, padding: '0 22px', background: win ? 'linear-gradient(180deg,#ffd84a,#ffb81a)' : DARK}}>
      <div style={{width: 66, height: 66, borderRadius: 14, border: `4px solid ${win ? INK : CREAM}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, background: win ? '#fff3c0' : '#2a2735'}}>{ic}</div>
      {k >= 0 && (kind === 'play' || win || kind === 'rebel') && <Flag k={k} w={62} h={41} />}
      <div style={{display: 'flex', flexDirection: 'column', minWidth: 0}}>
        <div style={{...F, fontSize: 46, lineHeight: 1, color: win ? INK : col, whiteSpace: 'nowrap'}}>{title}</div>
        <div style={{...F, fontSize: 23, letterSpacing: 1.2, color: win ? '#5a3a00' : '#e9e3d6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{sub}</div>
      </div>
      {win && k2 >= 0 && <div style={{marginLeft: 'auto'}}><Flag k={k2} w={62} h={41} /></div>}
    </Panel>
  );
};
const Top: React.FC<{RB: any; t: number}> = ({RB, t}) => {
  const rows = (kv(RB.top, t)[1] as number[][]).filter((r) => r[1] > 0);
  return (
    <Panel style={{position: 'absolute', right: 22, top: 18, width: 372, padding: '8px 14px 10px'}}>
      <div style={{...F, fontSize: 25, color: INK, letterSpacing: 1.5, textAlign: 'center'}}>🏆 TOP CONQUERORS</div>
      {[0, 1, 2].map((i) => { const r = rows[i]; return (
        <div key={i} style={{display: 'flex', alignItems: 'center', gap: 9, height: 44, borderTop: i ? '2px dashed #cbbf9f' : undefined}}>
          <div style={{width: 30, height: 30, borderRadius: '50%', border: `3px solid ${INK}`, background: ['#ffd23f', '#d8d8d8', '#e0a060'][i], ...F, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
          {r ? <><Flag k={r[0]} w={46} h={30} /><div style={{...F, fontSize: 24, color: INK, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{NM(r[0])}</div>
            <div style={{background: GOLD, border: `3px solid ${INK}`, borderRadius: 8, ...F, fontSize: 19, padding: '1px 8px 0', color: INK}}>{r[1]} PTS</div></> : <div style={{...F, fontSize: 22, color: '#a89e85'}}>—</div>}
        </div>); })}
    </Panel>
  );
};
const TeamBar: React.FC<{RB: any; t: number}> = ({RB, t}) => {
  const [, a, b] = kv(RB.tcnt, t); const ph = kv(RB.phase, t)[1]; const f = a + b > 0 ? a / (a + b) : 0.5;
  const phc: Record<string, string> = {SKIRMISH: TEAL, 'TOTAL WAR': '#ffb020', 'WORLD WAR': RED, 'LAST STANDING': '#9a5be0', 'FINAL DUEL': GOLD};
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 952, display: 'flex', justifyContent: 'center'}}><Pill bg={phc[ph] || TEAL} fg={INK} size={22}>{ph}</Pill></div>
      <Panel style={{position: 'absolute', left: 480, top: 994, width: 960, height: 62, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', borderRadius: 999}}>
        <div style={{...F, fontSize: 32, color: BLUE}}>AMERICA</div>
        <div style={{background: INK, color: '#fff', borderRadius: 8, ...F, fontSize: 28, padding: '0 8px', minWidth: 46, textAlign: 'center'}}>{a}</div>
        <div style={{flex: 1, height: 24, borderRadius: 12, border: `3px solid ${INK}`, position: 'relative', overflow: 'visible', background: RED}}>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${f * 100}%`, background: BLUE, borderRadius: '10px 0 0 10px'}} />
          <div style={{position: 'absolute', left: `calc(${f * 100}% - 17px)`, top: -8, width: 34, height: 34, borderRadius: '50%', background: GOLD, border: `4px solid ${INK}`}} />
        </div>
        <div style={{background: INK, color: '#fff', borderRadius: 8, ...F, fontSize: 28, padding: '0 8px', minWidth: 46, textAlign: 'center'}}>{b}</div>
        <div style={{...F, fontSize: 32, color: RED}}>ASIA</div>
      </Panel>
    </>
  );
};

// ---------------------------------------------------------------- sorteo (lista tipo tragaperras)
const Slot: React.FC<{RB: any; t: number}> = ({RB, t}) => {
  const s = (RB.slot as any[]).find((x) => t >= x[0] - 0.3 && t < x[2]); if (!s) return null;
  const [t0, ts, t1, seq, pick, label, ally] = s; const a = fadeW(t, t0 - 0.3, t1, 0.2);
  const pos = eo((t - t0) / (ts - t0)) * pick; const RH = 66; const stopped = t >= ts;
  const rows = []; const base = Math.floor(pos);
  for (let i = base - 3; i <= base + 3; i++) {
    if (i < 0 || i >= seq.length) continue; const y = (i - pos) * RH; if (Math.abs(y) > RH * 2.6) continue;
    const k = seq[i]; const ctr = stopped && i === pick;
    rows.push(<div key={i} style={{position: 'absolute', left: 14, right: 14, top: 150 + y - RH / 2 + 4, height: RH - 8, display: 'flex', alignItems: 'center', gap: 14, padding: '0 12px', opacity: 1 - Math.abs(y) / (RH * 3), borderRadius: 10, background: ctr ? '#3a3216' : 'transparent'}}>
      <Flag k={k} w={44} round /><div style={{...F, fontSize: 30, color: ctr ? GOLD : '#ece6d8', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{NM(k)}</div>
    </div>);
  }
  const sc = Math.min(1, popIn(t, t0 - 0.3) + 0.0);
  return (
    <div style={{position: 'absolute', left: VW / 2 - 250, top: 300, width: 500, height: 300, opacity: a, transform: `scale(${sc})`}}>
      <div style={{position: 'absolute', inset: 0, background: 'rgba(28,26,38,0.94)', border: `5px solid ${GOLD}`, borderRadius: 18, boxShadow: `0 6px 0 ${INK}, 0 18px 40px rgba(0,0,0,0.5)`, overflow: 'hidden'}}>
        {rows}
        <div style={{position: 'absolute', left: 8, right: 8, top: 150 - RH / 2, height: RH, border: `4px solid ${GOLD}`, borderRadius: 12, boxShadow: `0 0 18px ${GOLD}`}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 60, background: 'linear-gradient(rgba(28,26,38,1),rgba(28,26,38,0))'}} />
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 60, background: 'linear-gradient(rgba(28,26,38,0),rgba(28,26,38,1))'}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: -22, display: 'flex', justifyContent: 'center'}}><Pill bg={DARK} fg={GOLD} size={22} style={{border: `3px solid ${GOLD}`}}>{label}</Pill></div>
      {stopped && <div style={{position: 'absolute', left: 0, right: 0, top: 318, display: 'flex', justifyContent: 'center', transform: `scale(${popIn(t, ts)})`}}><Pill bg={ally ? TEAL : GOLD} fg={INK} size={38}>{NM(seq[pick])}!</Pill></div>}
    </div>
  );
};

// ---------------------------------------------------------------- ruleta de evento
const SEG: Record<string, [string, string]> = {WAR: [RED, '⚔ WAR'], ALLIANCE: [TEAL, '🤝 ALLIANCE'], POWER: ['#ffa62b', '⚡ POWER'], REBELLION: ['#8e5bd8', '✊ REBELLION'], LANDING: ['#7a4a2c', '⚓ LANDING']};
const arc = (r: number, a0: number, a1: number) => { const p = (a: number) => [Math.sin(a * Math.PI / 180) * r, -Math.cos(a * Math.PI / 180) * r]; const [x0, y0] = p(a0), [x1, y1] = p(a1); return `M0,0 L${x0},${y0} A${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1},${y1} Z`; };
const anchor = (k: number, cam: Cam, dx: number): [number, number] => { const c = PIECES_C(k); const [x, y] = toS(c[0], c[1], cam); return [cl(x + dx, 300, VW - 300), cl(y, 330, 760)]; };
const Wheel: React.FC<{RB: any; t: number; cam: Cam}> = ({RB, t, cam}) => {
  const w = (RB.wheel as any[]).find((x) => t >= x[0] && t < x[3]); if (!w) return null;
  const [tin, t0, ts, t1, k, segs, wts, rot, pick, q] = w; const a = fadeW(t, tin, t1, 0.2); const sc = popIn(t, tin);
  const ang = rot * eo((t - t0) / (ts - t0)); const R_ = 168; const tot = (wts as number[]).reduce((p: number, v: number) => p + v, 0);
  const [x, y] = anchor(k, cam, 360); let acc = 0;
  const paths = (segs as string[]).map((sg, i) => { const a0 = acc / tot * 360; acc += wts[i]; const a1 = acc / tot * 360; const mid = (a0 + a1) / 2; const [c, lb] = SEG[sg] || ['#888', sg];
    return <g key={i}><path d={arc(R_, a0, a1)} fill={c} stroke={INK} strokeWidth={5} />
      <g transform={`rotate(${mid}) translate(0,${-R_ * 0.6}) rotate(${-mid - ang})`}><text textAnchor="middle" y={8} fontSize={a1 - a0 < 45 ? 17 : 23} fill="#fff" stroke={INK} strokeWidth={5} paintOrder="stroke" style={F}>{lb}</text></g></g>; });
  const res = t >= ts; const [rc, rl] = SEG[segs[pick]] || ['#888', ''];
  return (
    <div style={{position: 'absolute', left: x - 200, top: y - 250, width: 400, height: 520, opacity: a, transform: `scale(${sc})`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, display: 'flex', justifyContent: 'center'}}><Pill bg={CREAM} fg={INK} size={30}>{q}</Pill></div>
      <svg width={400} height={400} viewBox="-200 -200 400 400" style={{position: 'absolute', left: 0, top: 70, overflow: 'visible'}}>
        <circle r={R_ + 16} fill={CREAM} stroke={INK} strokeWidth={7} /><g transform={`rotate(${ang})`}>{paths}</g>
        {Array.from({length: 12}, (_, i) => <circle key={i} cx={Math.sin(i * 30 * Math.PI / 180) * (R_ + 8)} cy={-Math.cos(i * 30 * Math.PI / 180) * (R_ + 8)} r={4} fill={INK} />)}
        <circle r={26} fill={CREAM} stroke={INK} strokeWidth={6} /><circle r={9} fill={RED} />
        <path d={`M-20,${-R_ - 30} L20,${-R_ - 30} L0,${-R_ + 8} Z`} fill={GOLD} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      </svg>
      {res && <div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center', transform: `scale(${popIn(t, ts)})`}}><Pill bg={rc} size={40}>{rl.replace(/^\S+ /, '')}!</Pill></div>}
    </div>
  );
};
// ---------------------------------------------------------------- brújula: ¿contra quién?
const Compass: React.FC<{RB: any; t: number; cam: Cam}> = ({RB, t, cam}) => {
  const c = (RB.comp as any[]).find((x) => t >= x[0] && t < x[2]); if (!c) return null;
  const [t0, ts, t1, A, B] = c; const pa = PIECES_C(A), pb = PIECES_C(B); const [ax, ay] = toS(pa[0], pa[1], cam); const [bx, by] = toS(pb[0], pb[1], cam);
  let dir = Math.atan2(bx - ax, -(by - ay)) * 180 / Math.PI; if (Math.abs(bx - ax) > VW * 0.6) dir = bx > ax ? -90 : 90;   // cruza el Pacífico: apunta al borde
  const ang = dir - 900 + 900 * eo((t - t0) / (ts - t0)); const a = fadeW(t, t0, t1, 0.15); const r = 120; const x = cl(ax, 160, VW - 160), y = cl(ay, 200, 880);
  return (
    <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0, opacity: a, overflow: 'visible'}}>
      <g transform={`translate(${x},${y}) scale(${popIn(t, t0)})`}>
        <circle r={r} fill="rgba(255,255,255,0.18)" stroke={GOLD} strokeWidth={6} strokeDasharray="14 10" transform={`rotate(${t * 40})`} />
        <circle r={r * 0.72} fill="none" stroke="#fff" strokeWidth={3} opacity={0.7} />
        {[0, 90, 180, 270].map((d) => <line key={d} x1={0} y1={-r - 14} x2={0} y2={-r + 10} stroke={INK} strokeWidth={6} transform={`rotate(${d})`} />)}
        <g transform={`rotate(${ang})`}><path d={`M0,${-r * 0.95} L14,0 L0,${r * 0.25} L-14,0 Z`} fill={RED} stroke={INK} strokeWidth={5} strokeLinejoin="round" /><circle r={10} fill={CREAM} stroke={INK} strokeWidth={4} /></g>
      </g>
    </svg>
  );
};
// ---------------------------------------------------------------- ¿quién gana? (círculo de probabilidades)
const Pie: React.FC<{RB: any; t: number}> = ({RB, t}) => {
  const p = (RB.pie as any[]).find((x) => t >= x[0] && t < x[2]); if (!p) return null;
  const [t0, ts, t1, A, B, pa, winA, rot] = p; const a = fadeW(t, t0, t1, 0.2);
  const grow = eo((t - t0) / 0.55); const sc = 0.45 + 0.55 * grow; const ang = rot * eo((t - (t0 + 0.6)) / (ts - (t0 + 0.6)));
  const R_ = 150; const a1 = pa * 360; const res = t >= ts; const W_ = winA ? A : B;
  const lab = (k: number, mid: number, v: number, col: string) => (
    <g transform={`rotate(${mid}) translate(0,${-R_ * 0.55}) rotate(${-mid - ang})`}><text textAnchor="middle" y={12} fontSize={34} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke" style={F}>{Math.round(v * 100)}%</text></g>
  );
  return (
    <div style={{position: 'absolute', left: 1330, top: 220, width: 420, height: 520, opacity: a, transform: `scale(${sc})`, transformOrigin: '50% 40%'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, display: 'flex', justifyContent: 'center'}}><Pill bg={CREAM} fg={INK} size={32}>Who wins?</Pill></div>
      <svg width={420} height={420} viewBox="-210 -210 420 420" style={{position: 'absolute', left: 0, top: 64, overflow: 'visible'}}>
        <circle r={R_ + 14} fill={CREAM} stroke={INK} strokeWidth={7} />
        <g transform={`rotate(${ang})`}>
          <path d={arc(R_, 0, a1)} fill={RED} stroke={INK} strokeWidth={5} /><path d={arc(R_, a1, 360)} fill={BLUE} stroke={INK} strokeWidth={5} />
          {lab(A, a1 / 2, pa, RED)}{lab(B, a1 + (360 - a1) / 2, 1 - pa, BLUE)}
        </g>
        <circle r={24} fill={CREAM} stroke={INK} strokeWidth={6} />
        <path d={`M-18,${-R_ - 30} L18,${-R_ - 30} L0,${-R_ + 6} Z`} fill={GOLD} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      </svg>
      <div style={{position: 'absolute', left: 10, top: 400, display: 'flex', alignItems: 'center', gap: 8}}><div style={{width: 22, height: 22, borderRadius: 6, background: RED, border: `3px solid ${INK}`}} /><Flag k={A} w={42} h={28} /></div>
      <div style={{position: 'absolute', right: 10, top: 400, display: 'flex', alignItems: 'center', gap: 8}}><Flag k={B} w={42} h={28} /><div style={{width: 22, height: 22, borderRadius: 6, background: BLUE, border: `3px solid ${INK}`}} /></div>
      {res && <div style={{position: 'absolute', left: 0, right: 0, top: 452, display: 'flex', justifyContent: 'center', transform: `scale(${popIn(t, ts)})`}}><Pill bg={GOLD} fg={INK} size={36}><span style={{display: 'inline-flex', alignItems: 'center', gap: 10}}><Flag k={W_} w={40} h={27} />{NM(W_)} wins!</span></Pill></div>}
    </div>
  );
};
// ---------------------------------------------------------------- cinta de conquista (#n X conquers Y)
const Ribbon: React.FC<{RB: any; t: number}> = ({RB, t}) => {
  const r = (RB.ribbon as any[]).find((x) => t >= x[0] && t < x[1]); if (!r) return null;
  const [t0, t1, n, A, B, txt, note] = r; const a = fadeW(t, t0, t1, 0.25); const sx = (1 - eo((t - t0) / 0.45)) * -900;
  return (
    <div style={{position: 'absolute', left: 120, top: 806, opacity: a, transform: `translateX(${sx}px) rotate(-3deg)`}}>
      <div style={{position: 'absolute', left: -60, top: 44, width: 1000, height: 30, background: `repeating-linear-gradient(-45deg, ${GOLD} 0 22px, ${INK} 22px 44px)`, border: `3px solid ${INK}`, transform: 'rotate(2deg)'}} />
      <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 12}}>
        <div style={{width: 84, height: 84, borderRadius: '50%', background: GOLD, border: `5px solid ${INK}`, ...F, fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 0 ${INK}`}}>#{n}</div>
        <div style={{background: '#3a2a14', border: `4px solid ${INK}`, borderRadius: 12, padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: `0 4px 0 ${INK}`}}>
          <Flag k={A} w={52} h={34} /><div style={{display: 'flex', flexDirection: 'column'}}><div style={{...F, fontSize: 34, color: '#ffe9b0', lineHeight: 1.05}}>{txt}</div>{note && <div style={{...F, fontSize: 20, color: GOLD, letterSpacing: 1}}>{note}</div>}</div><Flag k={B} w={52} h={34} />
        </div>
      </div>
    </div>
  );
};
// ---------------------------------------------------------------- alianzas (líneas discontinuas) y avisos sobre el país
const Pacts: React.FC<{RB: any; t: number; cam: Cam}> = ({RB, t, cam}) => {
  const out: React.ReactNode[] = []; const wide = cam.s < 0.55;
  (RB.pact as any[]).forEach((p, i) => {
    const [t0, t1, A, B] = p; if (t < t0 || t >= t1) return; const fresh = t - t0 < 4.4;
    if (!wide && !fresh) return;
    const a = PIECES_C(A), b = PIECES_C(B); const [ax, ay] = toS(a[0], a[1], cam); const [bx, by] = toS(b[0], b[1], cam);
    const al = (fresh ? 1 : 0.55) * fadeW(t, t0, t1, 0.4); const sw = fresh ? 6 : 3.5; const dash = `${fresh ? 16 : 10} 10`; const off = -t * 60;
    if ((a[0] < 3600) !== (b[0] < 3600)) {          // cruza el Pacífico: sale por los bordes
      const [wx, wy] = a[0] < 3600 ? [ax, ay] : [bx, by]; const [ex, ey] = a[0] < 3600 ? [bx, by] : [ax, ay];
      out.push(<path key={'a' + i} d={`M${wx},${wy} Q${wx - 200},${wy - 160} ${-40},${(wy + ey) / 2 - 120}`} fill="none" stroke={TEAL} strokeWidth={sw} strokeDasharray={dash} strokeDashoffset={off} opacity={al} />);
      out.push(<path key={'b' + i} d={`M${ex},${ey} Q${ex + 200},${ey - 160} ${VW + 40},${(wy + ey) / 2 - 120}`} fill="none" stroke={TEAL} strokeWidth={sw} strokeDasharray={dash} strokeDashoffset={off} opacity={al} />);
    } else {
      const mx = (ax + bx) / 2, my = (ay + by) / 2 - Math.hypot(bx - ax, by - ay) * 0.2;
      out.push(<path key={'c' + i} d={`M${ax},${ay} Q${mx},${my} ${bx},${by}`} fill="none" stroke={TEAL} strokeWidth={sw} strokeDasharray={dash} strokeDashoffset={off} opacity={al} />);
      if (fresh) out.push(<g key={'s' + i} transform={`translate(${(ax + bx) / 2},${(my + (ay + by) / 2) / 2}) scale(${popIn(t, t0 + 0.2)})`}><path d="M0,-34 L30,-22 L26,14 Q16,32 0,40 Q-16,32 -26,14 L-30,-22 Z" fill={TEAL} stroke={INK} strokeWidth={5} /><text y={10} textAnchor="middle" fontSize={28}>🤝</text></g>);
    }
  });
  const fresh = (RB.pact as any[]).find((p) => t >= p[0] && t < p[0] + 4.4);
  return (<>
    <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{out}</svg>
    {fresh && <div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center', transform: `scale(${popIn(t, fresh[0] + 0.15)})`}}><Pill bg={TEAL} size={44}><span style={{display: 'inline-flex', alignItems: 'center', gap: 14}}><Flag k={fresh[2]} w={52} h={34} />ALLIES!<Flag k={fresh[3]} w={52} h={34} /></span></Pill></div>}
  </>);
};
const Pops: React.FC<{RB: any; t: number; cam: Cam}> = ({RB, t, cam}) => (<>{(RB.pops as any[]).filter((p) => t >= p[0] && t < p[1]).map((p, i) => {
  const [t0, t1, k, txt, col] = p; const c = PIECES_C(k); const [x, y] = toS(c[0], c[1], cam); const a = fadeW(t, t0, t1, 0.25);
  return (<React.Fragment key={i}>
    <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0, opacity: a * 0.9}}><circle cx={x} cy={y} r={70 + 30 * ((t - t0) % 1)} fill="none" stroke={col} strokeWidth={8} opacity={1 - ((t - t0) % 1)} /></svg>
    <div style={{position: 'absolute', left: cl(x, 220, VW - 220) - 300, width: 600, top: cl(y - 170, 140, 800), display: 'flex', justifyContent: 'center', opacity: a, transform: `scale(${popIn(t, t0)}) translateY(${Math.sin(t * 5) * 6}px)`}}><Pill bg={col} fg={INK} size={46}>{txt}</Pill></div>
  </React.Fragment>); })}</>);

// ---------------------------------------------------------------- tarjetas centrales (intro, fases, campeón) y pregunta final
const Card: React.FC<{RB: any; t: number}> = ({RB, t}) => {
  const c = (RB.cards as any[]).find((x) => t >= x[0] && t < x[1]); if (!c) return null;
  const [t0, t1, title, sub, k] = c; const a = fadeW(t, t0, t1, 0.25); const champ = title === 'CHAMPION!'; const intro = t0 < 1;
  return (
    <AbsoluteFill style={{opacity: a, pointerEvents: 'none'}}>
      {!intro && <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(10,8,20,0.55) 0%, rgba(10,8,20,0.2) 70%)'}} />}
      <div style={{position: 'absolute', left: 0, right: 0, top: champ ? 120 : intro ? 760 : 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, transform: `scale(${popIn(t, t0)})`}}>
        {champ && k != null && <svg width={300} height={300} viewBox="-150 -150 300 300" style={{overflow: 'visible'}}><defs><clipPath id="chc"><circle r={140} /></clipPath></defs><g clipPath="url(#chc)"><foreignObject x={-210} y={-140} width={420} height={280}><FlagCanvas k={k} w={420} h={280} /></foreignObject></g><circle r={140} fill="none" stroke={INK} strokeWidth={9} /><text y={-150} textAnchor="middle" fontSize={110}>👑</text></svg>}
        {champ && k != null && <svg width={300} height={300} viewBox="-150 -150 300 300" style={{position: 'absolute', left: VW / 2 - 150, top: 0, overflow: 'visible'}}><Face x={0} y={-8} r={44} mood="happy" t={t} seed={3} /></svg>}
        {intro ? <Pill bg={GOLD} fg={INK} size={64}>{title} <span style={{color: RED}}>{sub}</span></Pill> : <>
          <div style={{...F, fontSize: champ ? 130 : 140, color: GOLD, WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 10px 0 ${INK}`, lineHeight: 1}}>{title}</div>
          <Pill bg={CREAM} fg={INK} size={40}>{sub}</Pill></>}
      </div>
    </AbsoluteFill>
  );
};
const EndQ: React.FC<{RB: any; t: number}> = ({RB, t}) => {
  const e = RB.endq; if (!e || t < e[0]) return null; const a = cl((t - e[0]) / 0.25, 0, 1);
  return (
    <AbsoluteFill style={{opacity: a, background: 'rgba(10,8,20,0.45)'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', transform: `scale(${popIn(t, e[0])})`}}>
        <Panel style={{padding: '34px 60px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
          <div style={{...F, fontSize: 76, color: INK, textAlign: 'center', lineHeight: 1.05}}>{e[2]}</div>
          <Pill bg={RED} size={34}>{e[3]}</Pill>
        </Panel>
      </div>
    </AbsoluteFill>
  );
};

export const rbrCool = (D: any, t: number): Set<number> => { const s = new Set<number>(); const RB = D.rbr; if (!RB) return s; for (const x of RB.shades) if (t >= x[0] && t < x[1]) s.add(x[2]); return s; };
export const Shades: React.FC<{r: number}> = ({r}) => (
  <g>
    <path d={`M${-r * 1.0},${-r * 0.22} L${r * 1.0},${-r * 0.22}`} stroke={INK} strokeWidth={r * 0.12} strokeLinecap="round" />
    {[-1, 1].map((sd) => <path key={sd} d={`M${sd * r * 0.08},${-r * 0.24} L${sd * r * 0.9},${-r * 0.24} L${sd * r * 0.8},${r * 0.2} Q${sd * r * 0.5},${r * 0.36} ${sd * r * 0.18},${r * 0.18} Z`} fill="#111" stroke={INK} strokeWidth={r * 0.06} />)}
    {[-1, 1].map((sd) => <path key={'h' + sd} d={`M${sd * r * 0.3},${-r * 0.14} L${sd * r * 0.55},${-r * 0.14}`} stroke="#fff" strokeWidth={r * 0.06} strokeLinecap="round" opacity={0.8} />)}
  </g>
);

export const RbrHud: React.FC<{D: any; t: number; cam: Cam}> = ({D, t, cam}) => {
  const RB = D.rbr; if (!RB) return null;
  const intro = (RB.cards[0] && t < RB.cards[0][1]); const ended = RB.endq && t >= RB.endq[0] - 4.1;
  return (
    <AbsoluteFill style={{zIndex: 40, pointerEvents: 'none'}}>
      <Pacts RB={RB} t={t} cam={cam} />
      <Pops RB={RB} t={t} cam={cam} />
      <Compass RB={RB} t={t} cam={cam} />
      <Wheel RB={RB} t={t} cam={cam} />
      <Pie RB={RB} t={t} />
      <Slot RB={RB} t={t} />
      <Ribbon RB={RB} t={t} />
      {!intro && !ended && <><AliveBox RB={RB} t={t} /><Status RB={RB} t={t} /><Top RB={RB} t={t} /><TeamBar RB={RB} t={t} /></>}
      <Card RB={RB} t={t} />
      <EndQ RB={RB} t={t} />
    </AbsoluteFill>
  );
};
