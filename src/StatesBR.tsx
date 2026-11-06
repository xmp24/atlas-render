// 50 STATES BATTLE ROYALE (1920x1080)
import React from 'react';
import {AbsoluteFill, Audio, Easing, staticFile, useCurrentFrame} from 'remotion';
import {FlagCanvas, makeCam, CamKey, Cam, COUNTRIES} from './HexWorld';
import {PolyCanvas, CEv} from './PolyWorld';
import {drawOcc} from './WarLayer';
import {Face, Mood, INK, YELLOW, RED, CREAM, font, font2, lerp, popT} from './lib3';
import {ShortCup, segTime} from './ShortFX';
import J from './hw/brus.json';
import SJ from './hw/states.json';

const D = J as any;
const STS = (SJ as any).states as any[];
export const BRUS_FRAMES = Math.round(D.dur * 30);
const camF = makeCam(D.cam as CamKey[], 0.015);
const US = COUNTRIES.findIndex((c) => c.c === 'US');
const BLUE = '#2f6fe0', REDC = '#e0393e', ASH = '#4b4e57', NEUT = '#cfc6b0';
const SCOL: string[] = D.cols;
const SDARK: string[] = D.dark;
const NAMES: string[] = D.names;
let VW = 1920, VH = 1080, SH = false;
const toS = (x: number, y: number, c: Cam): [number, number] => [VW / 2 + (x - c.cx) * c.s, VH / 2 + (y - c.cy) * c.s];
const kfv = (pk: number[][], t: number, i = 1) => {
  if (t <= pk[0][0]) return pk[0][i];
  for (let j = 1; j < pk.length; j++) if (t <= pk[j][0]) { const u = (t - pk[j - 1][0]) / (pk[j][0] - pk[j - 1][0]); return pk[j - 1][i] + (pk[j][i] - pk[j - 1][i]) * u; }
  return pk[pk.length - 1][i];
};
const SP: any[] = STS.map((s, i) => ({k: i, path: typeof Path2D !== 'undefined' ? new Path2D(s.d) : null, bbox: s.bbox, c: s.c, area: s.area}));
const OWN = D.own as [number, number, number][];
const sideAt = (i: number, t: number): [number, number, number] => {
  // [color actual, color previo, mezcla]
  let cur = i, prev = cur, tc = -10;
  for (const [te, s, sd] of OWN) { if (s !== i) continue; if (te <= t) { prev = cur; cur = sd; tc = te; } else break; }
  return [cur, prev, Math.min(1, (t - tc) / 0.6)];
};
const hexMix = (a: string, b: string, u: number) => {
  const pa = [1, 3, 5].map((j) => parseInt(a.slice(j, j + 2), 16)), pb = [1, 3, 5].map((j) => parseInt(b.slice(j, j + 2), 16));
  return `rgb(${pa.map((v, j) => Math.round(v + (pb[j] - v) * u)).join(',')})`;
};
const WARSOCC = {occ: (D.socc as any[]).map(([s, a, t0, t1, fl]) => [s, US, t0, t1, [], SCOL[a], fl, SDARK[a]]), sq: [], df: []};
const drawStates = (ctx: CanvasRenderingContext2D, t: number, s: number, vis: (b: number[]) => boolean) => {
  // relleno de cada estado según su bando
  for (let i = 0; i < SP.length; i++) {
    const p = SP[i]; if (!p.path || !vis(p.bbox)) continue;
    const rv = D.reveal[i] ?? 0;
    let col: string;
    if (t < rv) col = NEUT;
    else if (t < rv + 0.35) col = hexMix(NEUT, SCOL[i], (t - rv) / 0.35);
    else { const [cur, prev, u] = sideAt(i, t); col = u >= 1 ? SCOL[cur] : hexMix(SCOL[prev], SCOL[cur], u); }
    ctx.fillStyle = col; ctx.fill(p.path);
    if (t >= rv && t < rv + 0.35) { ctx.fillStyle = `rgba(255,255,255,${0.6 * (1 - (t - rv) / 0.35)})`; ctx.fill(p.path); }
  }
  drawOcc(ctx, WARSOCC as any, t, s, vis, SP);
  // ceniza: textura de grietas y humo en los estados destruidos
  ctx.save(); ctx.scale(0.25, 0.25);
  // marcadores: bases y cuarteles
  for (const [type, x, y, sd, dead] of D.smk as any[]) {
    const isDead = dead != null && t >= dead; const R0 = (type === 'hq' ? 22 : 15) / Math.max(0.5, s);
    if (type !== 'hq' && dead != null && t > dead + 6) continue;
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.arc(x, y + R0 * 0.15, R0 * 1.05, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = isDead ? '#666' : SCOL[sd]; ctx.strokeStyle = type === 'hq' ? '#ffd23f' : '#fff'; ctx.lineWidth = R0 * 0.16;
    ctx.beginPath(); ctx.arc(x, y, R0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = isDead ? '#bbb' : '#fff'; ctx.beginPath();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? R0 * 0.3 : R0 * 0.68, an = -Math.PI / 2 + (i * Math.PI) / 5; ctx.lineTo(x + Math.cos(an) * r, y + Math.sin(an) * r); }
    ctx.closePath(); ctx.fill();
    if (isDead) { ctx.strokeStyle = '#e5322d'; ctx.lineWidth = R0 * 0.22; ctx.beginPath(); ctx.moveTo(x - R0 * 0.6, y - R0 * 0.6); ctx.lineTo(x + R0 * 0.6, y + R0 * 0.6); ctx.moveTo(x + R0 * 0.6, y - R0 * 0.6); ctx.lineTo(x - R0 * 0.6, y + R0 * 0.6); ctx.stroke(); }
  }
  ctx.restore();
  // fronteras entre estados
  ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 1.6 / (s * 4);
  for (const p of SP) { if (p.path && vis(p.bbox)) ctx.stroke(p.path); }
  ctx.strokeStyle = 'rgba(10,10,20,0.55)'; ctx.lineWidth = 0.6 / (s * 4);
  for (const p of SP) { if (p.path && vis(p.bbox)) ctx.stroke(p.path); }
};
// ---------- capas HTML ----------
const Pill: React.FC<{children: React.ReactNode; bg?: string; style?: React.CSSProperties}> = ({children, bg = 'rgba(14,20,32,0.9)', style}) => (
  <div style={{background: bg, border: `4px solid ${INK}`, borderRadius: 16, boxShadow: '0 4px 0 rgba(0,0,0,0.35)', ...style}}>{children}</div>
);
const FlagImg: React.FC<{k: number; w: number; h?: number; round?: boolean; style?: React.CSSProperties}> = ({k, w, h, round, style}) => (
  <FlagCanvas k={k} w={w} h={h ?? (round ? w : (w * 2) / 3)} style={{borderRadius: round ? '50%' : 6, border: `3px solid ${INK}`, flexShrink: 0, ...style}} />
);
const Side: React.FC<{sd: number; size: number; mood: Mood; t: number; look?: [number, number]}> = ({sd, size, mood, t, look}) => (
  <div style={{position: 'relative', width: size, height: size, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.55) 0%, ${SCOL[sd]} 45%, ${SDARK[sd]} 100%)`, border: `${size * 0.04}px solid ${INK}`, boxShadow: '0 8px 0 rgba(0,0,0,0.35)', flexShrink: 0}}>
    <svg width={size} height={size} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><Face x={size / 2} y={size * 0.42} r={size * 0.27} mood={mood} t={t} seed={sd + 3} look={look} /></svg>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: size * 0.07, textAlign: 'center', ...font, fontSize: size * 0.2, color: '#fff', WebkitTextStroke: `${Math.max(2, size * 0.02)}px ${INK}`, paintOrder: 'stroke fill'}}>{STS[sd].ab}</div>
  </div>
);
const StateLabels: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  if (cam.s < 0.75 || t < D.coldEnd + 1.5) return null;
  const a = Math.min(1, (cam.s - 0.75) / 0.3);
  return <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0, opacity: a}}>{STS.map((s, i) => {
    if (s.area < 1500 && cam.s < 1.6) return null;
    const [x, y] = toS(s.c[0], s.c[1], cam); if (x < -40 || x > VW + 40 || y < -40 || y > VH + 40) return null;
    return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" style={{...font, fontSize: Math.min(34, 14 + cam.s * 7)}} fill="rgba(255,255,255,0.92)" stroke="rgba(0,0,0,0.6)" strokeWidth={4} paintOrder="stroke">{s.ab}</text>;
  })}</svg>;
};
const Arrows: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const out: React.ReactNode[] = [];
  (D.arrows as any[]).forEach(([t0, t1, x0, y0, x1, y1, sd, k], i) => {
    if (t < t0 - 0.1 || t > t1 + 0.6) return;
    const p = lerp(t, t0, t1, 0, 1, Easing.inOut(Easing.quad));
    const a = lerp(t, t0 - 0.1, t0 + 0.2, 0, 1) * lerp(t, t1 + 0.2, t1 + 0.6, 1, 0);
    const [ax, ay] = toS(x0, y0, cam), [bx, by] = toS(x1, y1, cam);
    const mx = (ax + bx) / 2, my = (ay + by) / 2 - Math.hypot(bx - ax, by - ay) * 0.18;
    const q = (u: number): [number, number] => [(1 - u) * (1 - u) * ax + 2 * (1 - u) * u * mx + u * u * bx, (1 - u) * (1 - u) * ay + 2 * (1 - u) * u * my + u * u * by];
    const pts: string[] = []; for (let j = 0; j <= 30; j++) { const [x, y] = q((j / 30) * p); pts.push(`${x.toFixed(1)},${y.toFixed(1)}`); }
    out.push(
      <g key={i} opacity={a}>
        <polyline points={pts.join(' ')} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={5} strokeLinecap="round" strokeDasharray="4 12" />
        {p < 1 && [0, 0.07, 0.14].map((lag, si) => { const [sx, sy] = q(Math.max(0, p - lag)); return (
          <g key={si} transform={`translate(${sx},${sy})`}><ellipse rx={30} ry={9} cy={14} fill="rgba(255,255,255,0.35)" /><circle r={si ? 17 : 22} fill={k >= 0 ? '#e9e9e9' : SCOL[sd]} stroke={INK} strokeWidth={4} /><image href={staticFile('hw/icons/battleship.svg')} x={si ? -12 : -15} y={si ? -12 : -15} width={si ? 24 : 30} height={si ? 24 : 30} /></g>); })}
      </g>,
    );
    if (k >= 0 && p < 1) { const [sx, sy] = q(p); out.push(<foreignObject key={'f' + i} x={sx - 26} y={sy - 66} width={52} height={36} opacity={a}><FlagImg k={k} w={46} h={31} /></foreignObject>); }
  });
  return <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{out}</svg>;
};
const Bubbles: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const out: React.ReactNode[] = [];
  for (const [t0, sd, text, dd, x, y] of D.bubbles as any[]) {
    const d = t - t0; if (d < 0 || d > dd) continue;
    const [sx0, sy0] = toS(x, y, cam); const sx = Math.max(220, Math.min(VW - 220, sx0)), sy = Math.max(200, Math.min(VH - 160, sy0 - 60));
    const a = popT(t, t0, 12) * lerp(d, dd - 0.25, dd, 1, 0);
    out.push(<div key={t0} style={{position: 'absolute', left: sx, top: sy, transform: `translate(-50%,-100%) scale(${a})`, transformOrigin: '50% 100%', zIndex: 19}}>
      <div style={{background: '#fff', border: `4px solid ${SCOL[sd]}`, borderRadius: 18, padding: '8px 18px 4px', ...font2, fontSize: 30, color: INK, whiteSpace: 'nowrap', boxShadow: '0 5px 0 rgba(0,0,0,0.3)'}}>{text}</div></div>);
  }
  return <>{out}</>;
};
const lastAt = (arr: any[], t: number) => { let c = arr[0]; for (const e of arr) if (e[0] <= t) c = e; return c; };
const Hud: React.FC<{t: number}> = ({t}) => {
  if (t < D.warT - 0.3) return null;
  const a = popT(t, D.warT - 0.3, 10) * lerp(t, D.endT - 0.5, D.endT, 1, 0);
  const n = lastAt(D.alive, t)[1]; const ld = lastAt(D.lead, t)[1] as number[][];
  const nb = (D.alive as any[]).find((e) => Math.abs(e[0] - t) < 0.5 && e[0] <= t);
  const bump = nb ? 1 + 0.25 * Math.max(0, 1 - (t - nb[0]) / 0.5) : 1;
  return (<>
    <div style={{position: 'absolute', top: 18, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 30, opacity: a, transform: `translateY(${(1 - a) * -100}px)`}}>
      <Pill bg="#1b1f2b" style={{padding: '4px 24px 0', ...font, fontSize: 42, color: YELLOW, border: `4px solid ${REDC}`, transform: `scale(${bump})`}}>🗺️ {n} STATES LEFT</Pill>
    </div>
    <div style={{position: 'absolute', top: 18, left: 18, zIndex: 30, opacity: a * (((D.bighp2 || []) as any[]).some((B: any) => t >= B.t0 - 0.3 && t <= B.t1 + 0.3) ? 0 : 1), display: 'flex', flexDirection: 'column', gap: 6, transform: `translateX(${(1 - a) * -300}px)`}}>
      <Pill bg="rgba(250,244,230,0.94)" style={{padding: '2px 12px 0', ...font, fontSize: 22, color: INK}}>👑 BIGGEST EMPIRES</Pill>
      {ld.map(([o, c], j) => (
        <div key={o} style={{display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(250,244,230,0.94)', border: `4px solid ${SCOL[o]}`, borderRadius: 14, padding: '3px 12px 0 4px', minWidth: 290}}>
          <span style={{...font, fontSize: 24, color: INK, width: 26}}>{j + 1}</span>
          <div style={{width: 34, height: 34, borderRadius: '50%', background: SCOL[o], border: `3px solid ${INK}`}} />
          <span style={{...font, fontSize: 24, color: INK, flex: 1, whiteSpace: 'nowrap'}}>{NAMES[o]}</span>
          <span style={{...font, fontSize: 26, color: SDARK[o]}}>{c}</span>
        </div>))}
    </div>
  </>);
};
const Chips: React.FC<{t: number}> = ({t}) => {
  const c = (D.chips as any[]).filter(([t0, , , d]) => t >= t0 && t < t0 + d).slice(-1)[0];
  if (!c) return null;
  const [t0, text, k, d, sd] = c;
  const a = popT(t, t0, 11) * lerp(t, t0 + d - 0.3, t0 + d, 1, 0);
  const lb = win(D.letterbox, t);
  return (
    <div style={{position: 'absolute', bottom: (SH ? 300 : 54) + 95 * lb, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 36}}>
      <div style={{transform: `translateY(${(1 - a) * 160}px) scale(${0.7 + 0.3 * a})`, opacity: Math.min(1, a * 1.5), display: 'flex', alignItems: 'center', gap: 16, background: CREAM, border: `5px solid ${sd >= 0 ? SCOL[sd] : INK}`, borderRadius: 22, padding: '8px 28px 4px 12px', boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>
        <div style={{width: 50, height: 50, borderRadius: '50%', background: sd >= 0 ? SCOL[sd] : `linear-gradient(90deg, ${BLUE} 50%, ${REDC} 50%)`, border: `4px solid ${INK}`}} />
        <span style={{...font, fontSize: SH ? 40 : 44, color: INK, whiteSpace: 'nowrap'}}>{text}</span>
      </div>
    </div>
  );
};
const win = (arr: number[][], t: number) => { for (const [a, b] of arr || []) { if (t >= a - 0.4 && t <= b + 0.4) return Math.min(1, (t - a + 0.4) / 0.4, (b + 0.4 - t) / 0.4); } return 0; };
const QCard: React.FC<{t: number}> = ({t}) => {
  const c = (D.qcards as any[]).find(([t0, , d]) => t >= t0 && t < t0 + d);
  if (!c) return null;
  const [t0, text, d] = c; const a = popT(t, t0, 12) * lerp(t, t0 + d - 0.3, t0 + d, 1, 0);
  const n = Math.min(text.length, Math.floor((t - t0) * 45));
  return <div style={{position: 'absolute', top: SH ? 560 : 96, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 34}}>
    <div style={{transform: `scale(${0.6 + 0.4 * a})`, opacity: Math.min(1, a * 1.4), background: 'rgba(10,12,20,0.88)', border: `4px solid ${YELLOW}`, borderRadius: 16, padding: '6px 26px 2px', ...font, fontSize: 46, color: YELLOW, whiteSpace: 'nowrap'}}>{text.slice(0, n)}</div></div>;
};
const Cards: React.FC<{t: number}> = ({t}) => {
  const c = (D.cards as any[]).find((x) => t >= x.t0 && t < x.t1);
  if (!c) return null;
  const a = popT(t, c.t0, 10) * lerp(t, c.t1 - 0.3, c.t1, 1, 0);
  if (c.kind === 'bigtext') return (
    <AbsoluteFill style={{zIndex: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(ellipse at center, rgba(0,0,0,${0.55 * a}) 0%, rgba(0,0,0,0) 70%)`}}>
      <div style={{transform: `scale(${0.5 + 0.5 * a})`, opacity: Math.min(1, a * 1.4), textAlign: 'center'}}>
        <div style={{...font, fontSize: SH ? 100 : 120, color: '#fff', WebkitTextStroke: `9px ${INK}`, paintOrder: 'stroke fill', lineHeight: 1}}>{c.text}</div>
        {c.sub && <div style={{...font, fontSize: 52, color: YELLOW, WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill', marginTop: 8}}>{c.sub}</div>}
      </div>
    </AbsoluteFill>);
  if (c.kind === 'elim') {
    const dt = t - c.t0; const sc = dt < 0.18 ? 2.0 - (dt / 0.18) * 1.0 : 1;
    return (
      <div style={{position: 'absolute', left: 0, right: 0, top: SH ? 600 : 170, display: 'flex', justifyContent: 'center', zIndex: 44, pointerEvents: 'none'}}>
        <div style={{transform: `rotate(-4deg) scale(${sc})`, opacity: lerp(t, c.t1 - 0.3, c.t1, 1, 0), display: 'flex', alignItems: 'center', gap: 20, background: 'rgba(255,248,235,0.97)', border: `9px solid ${RED}`, borderRadius: 20, padding: '10px 34px 6px 12px', boxShadow: '0 12px 0 rgba(0,0,0,0.35)'}}>
          <div style={{filter: 'grayscale(0.6)'}}><Side sd={c.s} size={96} mood="sad" t={t} /></div>
          <div style={{display: 'flex', flexDirection: 'column', lineHeight: 0.95}}>
            <span style={{...font, fontSize: 64, color: INK}}>{NAMES[c.s]}</span>
            <span style={{...font, fontSize: 44, color: RED}}>ELIMINATED · #{c.n + 1}</span>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 10}}>
            <span style={{...font2, fontSize: 22, color: '#666'}}>BY</span>
            <Side sd={c.by} size={70} mood="angry" t={t} />
          </div>
        </div>
      </div>);
  }
  if (c.kind === 'bars') {
    const mx = Math.max(...c.rows.map((r: any) => r[1]));
    return (
      <AbsoluteFill style={{zIndex: 43, background: `rgba(6,10,22,${0.82 * Math.min(1, a)})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, opacity: Math.min(1, a * 1.3)}}>
        <div style={{...font, fontSize: 76, color: '#fff', WebkitTextStroke: `7px ${INK}`, paintOrder: 'stroke fill', marginBottom: 10}}>{c.title}</div>
        {c.rows.map(([sd, v, base]: any, j: number) => {
          const p = popT(t, c.t0 + 0.5 + j * 0.45, 9); const w = 900 * (v / mx) * Math.min(1, Math.max(0, (t - c.t0 - 0.5 - j * 0.45) / 0.6));
          return <div key={j} style={{display: 'flex', alignItems: 'center', gap: 18, opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * -300}px)`, width: 1500}}>
            <Side sd={sd} size={78} mood="angry" t={t} />
            <div style={{width: 280, ...font, fontSize: 40, color: '#fff'}}>{NAMES[sd]}</div>
            <div style={{width: w, height: 46, background: `linear-gradient(${SCOL[sd]}, ${SDARK[sd]})`, border: `4px solid ${INK}`, borderRadius: 10}} />
            <div style={{...font2, fontSize: 26, color: YELLOW, whiteSpace: 'nowrap'}}>{base}</div>
          </div>;
        })}
      </AbsoluteFill>);
  }
  if (c.kind === 'count') {
    const dt = t - c.t0; const n = 3 - Math.floor(dt); const u = dt % 1;
    return <AbsoluteFill style={{zIndex: 45, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `rgba(0,0,0,${0.35 * Math.min(1, a)})`}}>
      <div style={{...font, fontSize: n > 0 ? 300 : 220, color: n > 0 ? '#fff' : YELLOW, WebkitTextStroke: `12px ${INK}`, paintOrder: 'stroke fill', transform: `scale(${u < 0.15 ? 1.8 - u / 0.15 * 0.8 : 1 + (u - 0.15) * 0.06})`}}>{n > 0 ? n : 'FIGHT!'}</div></AbsoluteFill>;
  }
  if (c.kind === 'versus') return (
    <AbsoluteFill style={{zIndex: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: SH ? 40 : 160, flexDirection: SH ? 'column' : 'row', background: `linear-gradient(105deg, ${SCOL[c.a]}dd 0%, rgba(0,0,0,0.6) 50%, ${SCOL[c.b]}dd 100%)`, opacity: Math.min(1, a * 1.3)}}>
      {[[c.a, c.na], [c.b, c.nb]].map(([sd, n], j) => (
        <div key={j} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, transform: `translateX(${(1 - popT(t, c.t0, 11)) * (j ? 700 : -700)}px)`}}>
          <Side sd={sd} size={SH ? 200 : 250} mood="angry" t={t} look={[j ? -0.8 : 0.8, 0]} />
          <div style={{...font, fontSize: 70, color: '#fff', textShadow: `5px 5px 0 ${INK}`}}>{NAMES[sd]}</div>
          <Pill bg={CREAM} style={{padding: '2px 18px 0', ...font, fontSize: 44, color: SDARK[sd]}}>{n} STATES</Pill>
        </div>))}
      {!SH && <div style={{position: 'absolute', ...font, fontSize: 170, color: YELLOW, WebkitTextStroke: `8px ${INK}`, paintOrder: 'stroke fill', transform: `rotate(-8deg) scale(${0.6 + 0.4 * popT(t, c.t0 + 0.1, 8)})`}}>VS</div>}
    </AbsoluteFill>);
  if (c.kind === 'winner') {
    const dt = t - c.t0;
    return (
      <AbsoluteFill style={{zIndex: 45, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, background: `radial-gradient(circle, ${SCOL[c.s]}99 0%, rgba(0,0,0,0.75) 70%)`, opacity: Math.min(1, a * 1.3)}}>
        <div style={{fontSize: 120, transform: `translateY(${(1 - popT(t, c.t0 + 0.3, 9)) * -300}px)`}}>👑</div>
        <div style={{transform: `scale(${popT(t, c.t0, 9)})`}}><Side sd={c.s} size={300} mood="happy" t={t} /></div>
        <div style={{...font, fontSize: 130, color: YELLOW, WebkitTextStroke: `9px ${INK}`, paintOrder: 'stroke fill', transform: `scale(${popT(t, c.t0 + 0.5, 9)})`}}>{NAMES[c.s]} WINS!</div>
        <div style={{display: 'flex', gap: 18, opacity: popT(t, c.t0 + 1.4, 10)}}>
          <Pill bg={CREAM} style={{padding: '4px 20px 0', ...font, fontSize: 40, color: INK}}>🗺️ 51/51 STATES</Pill>
          <Pill bg={CREAM} style={{padding: '4px 20px 0', ...font, fontSize: 40, color: INK}}>⚔️ 50 ELIMINATIONS</Pill>
        </div>
        <div style={{...font2, fontSize: 42, color: '#fff', opacity: popT(t, c.t0 + 3.0, 10), marginTop: 10}}>WHICH STATE WOULD YOU BET ON? 👇</div>
      </AbsoluteFill>);
  }
  return null;
};
const BigHP2: React.FC<{t: number}> = ({t}) => {
  const L = ((D.bighp2 || []) as any[]).filter((B) => t >= B.t0 && t <= B.t1); if (!L.length) return null;
  return (
    <div style={{position: 'absolute', top: SH ? 700 : 110, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: SH ? 10 : 40, zIndex: 37, flexDirection: SH ? 'column' : 'row', alignItems: 'center'}}>
      {L.map((B, i) => {
        const a = popT(t, B.t0, 11) * lerp(t, B.t1 - 0.4, B.t1, 1, 0);
        const hp = Math.max(0, Math.min(1, kfv(B.hp, t))); const hp2 = Math.max(0, Math.min(1, kfv(B.hp, t - 0.45)));
        const hit = hp < kfv(B.hp, t - 0.12) - 0.004; const low = hp < 0.25; const blink = low && Math.floor(t * 4) % 2 === 0;
        return (
          <div key={i} style={{width: 560, opacity: a, transform: `translate(${hit ? Math.sin(t * 90) * 6 : 0}px, ${(1 - a) * -100}px)`, background: 'rgba(10,12,20,0.9)', border: `5px solid ${blink ? '#ff3b30' : B.col}`, borderRadius: 18, padding: '8px 14px 12px', boxShadow: low ? '0 0 34px 6px rgba(255,40,40,0.5)' : '0 8px 0 rgba(0,0,0,0.4)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', ...font, fontSize: 34, color: '#fff'}}><span>⭐ {B.name}</span><span style={{color: low ? '#ff5a4a' : '#fff'}}>{Math.round(hp * 100)}%</span></div>
            <div style={{position: 'relative', height: 34, background: '#2a2a2e', border: '4px solid #fff', borderRadius: 10, overflow: 'hidden', marginTop: 4}}>
              <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.max(hp, hp2) * 100}%`, background: '#fff', opacity: 0.8}} />
              <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${hp * 100}%`, background: B.col}} />
            </div>
          </div>);
      })}
    </div>
  );
};
const Spot: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const sp = (D.spot as any[]).find((x) => t >= x.t0 && t <= x.t1 + 0.5);
  if (!sp) return null;
  const a = Math.min(1, (t - sp.t0) / 0.35, (sp.t1 + 0.5 - t) / 0.5);
  const P = sp.pts as number[][]; let i = 0; while (i < P.length - 2 && P[i + 1][0] < t) i++;
  const u = Math.max(0, Math.min(1, (t - P[i][0]) / Math.max(0.01, P[i + 1][0] - P[i][0])));
  const [sx, sy] = toS(P[i][1] + (P[i + 1][1] - P[i][1]) * u, P[i][2] + (P[i + 1][2] - P[i][2]) * u, cam); const R = sp.r * (1 + 0.04 * Math.sin(t * 6));
  const pop = popT(t, sp.t0 + 0.15, 10);
  return (
    <AbsoluteFill style={{zIndex: 16, pointerEvents: 'none', opacity: a}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at ${sx}px ${sy}px, rgba(0,0,0,0) ${R * 0.75}px, rgba(4,6,14,0.72) ${R * 1.7}px)`}} />
      <div style={{position: 'absolute', left: sx - R * 0.8, top: sy - R * 0.8, width: R * 1.6, height: R * 1.6, borderRadius: '50%', border: '4px solid rgba(255,227,107,0.9)', boxShadow: '0 0 30px 6px rgba(255,227,107,0.45)', transform: `scale(${0.6 + 0.4 * pop})`}} />
      <div style={{position: 'absolute', left: sx, top: sy - R * 0.8 - 70, transform: `translateX(-50%) scale(${pop})`, ...font, fontSize: 44, color: YELLOW, WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill', whiteSpace: 'nowrap'}}>{sp.label}</div>
    </AbsoluteFill>
  );
};
const Chapter: React.FC<{t: number}> = ({t}) => {
  const c = (D.chapters as any[]).filter((x) => x[0] <= t).slice(-1)[0];
  if (!c || SH) return null;
  const idx = (D.chapters as any[]).indexOf(c);
  return <div style={{position: 'absolute', top: 22, right: 24, zIndex: 31}}><Pill bg={YELLOW} style={{padding: '2px 14px 0', ...font, fontSize: 26, color: INK}}>{idx + 1} · {c[1]}</Pill></div>;
};
const Cold: React.FC<{t: number}> = ({t}) => {
  const C0 = D.cold as [number, string][]; if (t > D.coldEnd) return null;
  let cur = C0[0]; for (const c of C0) if (c[0] <= t) cur = c;
  const dt = t - cur[0]; const sc = dt < 0.2 ? 2.2 - (dt / 0.2) * 1.2 : 1 + dt * 0.02;
  return <AbsoluteFill style={{zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)'}}>
    <div style={{transform: `scale(${sc}) rotate(-3deg)`, ...font, fontSize: SH ? 96 : 130, textAlign: 'center', padding: '0 30px', lineHeight: 1.05, color: cur[1].includes('ONE') ? YELLOW : '#fff', WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill'}}>
      {cur[1]}
    </div></AbsoluteFill>;
};
const GR: Record<string, [string, number, string]> = {day: ['#000', 0, 'normal'], tense: ['#1a2a55', 0.18, 'multiply'], dusk: ['#ff7a30', 0.12, 'multiply'], night: ['#0b1a45', 0.3, 'multiply'], red: ['#b3121f', 0.2, 'multiply'], ash: ['#777', 0.35, 'saturation']};
const Grade: React.FC<{t: number}> = ({t}) => {
  const g = D.grade as [number, string][]; let cur = -1;
  for (let i = 0; i < g.length; i++) if (g[i][0] <= t) cur = i;
  if (cur < 0) return null;
  const a = GR[g[cur][1]]; const prev = cur > 0 ? GR[g[cur - 1][1]] : GR.day; const k = lerp(t, g[cur][0], g[cur][0] + 1.2, 0, 1);
  return <>{prev[1] > 0 && <AbsoluteFill style={{background: prev[0], opacity: prev[1] * (1 - k), mixBlendMode: prev[2] as any, zIndex: 14}} />}{a[1] > 0 && <AbsoluteFill style={{background: a[0], opacity: a[1] * k, mixBlendMode: a[2] as any, zIndex: 14}} />}</>;
};
const shakeAt = (t: number) => { let x = 0, y = 0; for (const [st, a] of D.shakes as number[][]) { const d = t - st; if (d >= 0 && d < 0.6) { const m = a * (1 - d / 0.6); x += Math.sin(d * 83) * m; y += Math.cos(d * 67) * m; } } return [x, y]; };
const flashAt = (t: number) => { let a = 0; for (const f of D.flashes as number[]) { const d = t - f; if (d >= 0 && d < 0.35) a = Math.max(a, 1 - d / 0.35); } return a; };
const Cinema: React.FC<{t: number}> = ({t}) => { const lb = win(D.letterbox, t); return lb > 0 ? <><div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 95 * lb, background: '#000', zIndex: 33}} /><div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 95 * lb, background: '#000', zIndex: 33}} /></> : null; };


const warpT = (tr: number) => { const w = D.warp as number[][] | undefined; if (!w) return tr; let s = w[0]; for (const x of w) { if (x[0] <= tr) s = x; else break; } return s[1] + (tr - s[0]) * s[2]; };
const ColdOpen: React.FC<{tR: number}> = ({tR}) => {
  const C = D.cold2; if (!C || tR >= C.p1 + 0.05) return null;
  const clips = C.clips as number[][]; const inClip = tR < C.c1;
  const lb = inClip ? 1 : lerp(tR, C.p0 + 1.2, C.p1, 1, 0);
  let flash = 0; for (const [r0] of clips) { const d = tR - r0; if (d >= 0 && d < 0.18) flash = Math.max(flash, 1 - d / 0.18); }
  const black = inClip ? lerp(tR, C.c1 - 0.6, C.c1, 0, 1) : tR < C.p0 ? 1 : lerp(tR, C.p0, C.p0 + 2.2, 1, 0, Easing.inOut(Easing.quad));
  const ta = tR >= C.p0 ? popT(tR, C.p0 + 0.7, 6) * lerp(tR, C.p1 - 0.45, C.p1, 1, 0) : 0;
  const sa = tR >= C.p0 ? popT(tR, C.p0 + 1.5, 6) * lerp(tR, C.p1 - 0.45, C.p1, 1, 0) : 0;
  return <>
    {inClip && <AbsoluteFill style={{zIndex: 61, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 35%, rgba(0,0,0,0.75) 100%)'}} />}
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 120 * lb, background: '#000', zIndex: 62}} />
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 120 * lb, background: '#000', zIndex: 62}} />
    <AbsoluteFill style={{zIndex: 64, background: '#000', opacity: black}} />
    {flash > 0 && <AbsoluteFill style={{zIndex: 65, background: '#fff', opacity: flash * 0.7}} />}
    {tR >= C.p0 && <AbsoluteFill style={{zIndex: 66, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18}}>
      <div style={{...font, fontSize: 104, color: '#fff', textAlign: 'center', maxWidth: 1700, lineHeight: 1.02, opacity: ta, transform: `translateY(${(1 - ta) * 30}px)`, WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill'}}>{C.title}</div>
      <div style={{...font2, fontSize: 46, color: '#e8e2d0', textAlign: 'center', maxWidth: 1500, opacity: sa}}>{C.sub}</div>
    </AbsoluteFill>}
  </>;
};
export const StatesBR: React.FC<{audio?: boolean; W?: number; H?: number; zf?: number; segs?: number[][]; hook?: string[]; cta?: string[]}> = ({audio = true, W = 1920, H = 1080, zf = 1, segs, hook, cta}) => {
  VW = W; VH = H; SH = H > W;
  const f = useCurrentFrame(); const lt = f / 30; const sgT = segTime(lt, segs); const tR = sgT.t; const cuts = sgT.cuts; const sdur = sgT.sdur; const t = warpT(tR);
  const CO = D.cold2 && tR < D.cold2.p1 ? D.cold2 : null;
  const c0 = camF(t); const p0 = camF(Math.max(0, t - 1 / 30));
  const cam = {...c0, s: c0.s * zf}; const cp = {...p0, s: p0.s * zf};
  const speed = Math.hypot((cam.cx - cp.cx) * cam.s, (cam.cy - cp.cy) * cam.s) + Math.abs(Math.log(cam.s / cp.s)) * 900;
  const blur = Math.min(2.0, Math.max(0, (speed - 40) / 14));
  const [shx, shy] = shakeAt(t); const fl = flashAt(t);
  return (
    <AbsoluteFill style={{background: '#0b1626', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${shx}px,${shy}px)`}}>
        <PolyCanvas cev={[] as CEv[]} t={t} tm={t} byTm={false} cam={cam} W={VW} H={VH} blur={blur} opts={{markers: null, squads: false, capitalsOff: true, war: D.war, empire: null, lit: [US], waves: true, extra: drawStates}} />
        <Arrows t={t} cam={cam} />
        <StateLabels t={t} cam={cam} />
        {!CO && <Bubbles t={t} cam={cam} />}
      </AbsoluteFill>
      <Grade t={t} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.42) 100%)', pointerEvents: 'none', zIndex: 15}} />
      {!CO && <>
      <Spot t={t} cam={cam} />
      <Cinema t={t} />
      <Hud t={t} />
      <Chapter t={t} />
      <BigHP2 t={t} />
      <Chips t={t} />
      <QCard t={t} />
      <Cards t={t} />
      </>}
      <ColdOpen tR={tR} />
      {!CO && <Cold t={t} />}
      {SH && hook && cta && <ShortCup lt={lt} dur={sdur} hook={hook} cta={cta} cuts={cuts} />}
      {fl > 0 && <AbsoluteFill style={{background: '#fff', opacity: fl * 0.18, zIndex: 60}} />}
      {audio && <Audio src={staticFile('hw/brus.wav')} />}
    </AbsoluteFill>
  );
};
