// Escenas 7-14: la orden, despegue, 150 aviones, ataques, vuelo rasante, asalto, extracción, noticias, tribunal
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, font} from '../lib3';
import {Char} from './chars';
import {W, H, K, rnd, ip, pop, fade, LL, Ico, Big, Caption, Stamp, Bubble, Counter, NightSky, Moon, Sea, Caracas, Heli, HeliTop, MapCam, Pin, Route, Vignette, Flash, Boom} from './lib';

const US = K('US'), VE = K('VE'), CU = K('CU'), CO = K('CO'), BR = K('BR'), MX = K('MX');
const CCS = LL(-66.9, 10.5), PB = LL(-80.04, 26.68), PR = LL(-65.6, 18.25), GTMO = LL(-75.1, 19.9), NY = LL(-74.1, 41.5), IWO = LL(-66.5, 13.6);

// ---------- 7 · LA ORDEN, la base y el despegue (32 s) ----------
export const S7: React.FC<{t: number}> = ({t}) => {
  const c = LL(-72, 19); const s = 2.1;
  const sx = (p: number[]) => (p[0] - c[0]) * s + W / 2, sy = (p: number[]) => (p[1] - c[1]) * s + H / 2;
  const bases: [number, number][] = [[-65.6, 18.25], [-66.5, 13.6], [-64, 13.2], [-68, 13.4], [-81.4, 28.4], [-77.9, 34.7], [-97.4, 32.8], [-76.3, 36.9], [-86.5, 30.4], [-70, 13.8], [-62.5, 14.2], [-80.4, 25.5]];
  const lights = Math.floor(t * 2.5) % 2;
  return (<AbsoluteFill style={{background: '#050914'}}>
    {/* a) "GO" en la sala */}
    {t < 4.4 && <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #1d2a48, #0a0f1c 75%)', opacity: ip(t, [3.8, 4.4], [1, 0])}}>
      <Char k={US} acc="tie" eyes="angry" t={t} s={340} x={W / 2} y={560} label="THE PRESIDENT" />
      <Bubble t={t} t0={0.6} t1={4.2} x={W / 2} y={330} text="GO." size={90} />
    </AbsoluteFill>}
    {/* b) la señal viaja a las bases */}
    {t > 3.8 && t < 11.6 && <div style={{position: 'absolute', inset: 0, opacity: Math.min(ip(t, [3.8, 4.4], [0, 1]), ip(t, [11, 11.6], [1, 0]))}}>
      <MapCam cx={c[0]} cy={c[1]} s={s} night={0.55} />
      <Pin x={sx(PB)} y={sy(PB)} t={t} col="#ffd23f" label="MAR-A-LAGO" size={18} />
      {bases.map((b, i) => { const p = LL(b[0], b[1]); const t0 = 4.6 + i * 0.25; return <React.Fragment key={i}>
        <Route a={[sx(PB), sy(PB)]} b={[sx(p), sy(p)]} p={ip(t, [t0, t0 + 1], [0, 1])} col="#9fe8ff" bend={0.12} w={3} />
        {t > t0 + 1 && <Pin x={sx(p)} y={sy(p)} t={t + i} col="#3a8aff" size={12} />}
      </React.Fragment>; })}
      <Caption t={t} t0={4.8} t1={11.2} text="The signal goes out to 20 bases" hl="20 bases" />
    </div>}
    {/* c) base: alarma, embarque, despegue */}
    {t > 11 && <AbsoluteFill style={{opacity: ip(t, [11, 11.6], [0, 1])}}>
      <NightSky glow="#30223a" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 760, bottom: 0, background: 'linear-gradient(180deg, #2a2f38, #15181e)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 860, height: 10, background: 'repeating-linear-gradient(90deg, #ffd23f 0 80px, transparent 80px 160px)', opacity: 0.6}} />
      {/* hangar */}
      <div style={{position: 'absolute', left: 1180, top: 380, width: 640, height: 390, background: '#3a414c', border: `8px solid ${INK}`, borderRadius: '320px 320px 0 0'}}><div style={{position: 'absolute', left: 120, right: 120, bottom: 0, height: 260, background: '#1a1e24', borderTop: `6px solid ${INK}`}} /></div>
      {/* luces de alarma */}
      {[[1250, 360], [1750, 360]].map(([x, y], i) => <div key={i} style={{position: 'absolute', left: x - 30, top: y - 30, width: 60, height: 60, borderRadius: '50%', background: lights === i ? '#ff3b30' : '#5a1010', boxShadow: lights === i ? '0 0 80px 30px rgba(255,40,30,0.5)' : 'none', border: `5px solid ${INK}`}} />)}
      <div style={{position: 'absolute', inset: 0, background: `rgba(255,30,20,${lights ? 0.08 : 0})`}} />
      {/* helicóptero en la pista */}
      {(() => { const lift = ip(t, [24, 29], [0, 1]); const x = ip(t, [26, 32], [700, -400]); return <>
        <Heli t={t * (t < 18 ? 0.15 : t < 22 ? 0.6 : 1)} w={620} x={x} y={690 - lift * 420} tilt={lift * 10} />
        {t > 21 && t < 28 && Array.from({length: 18}, (_, i) => { const a = (i / 18) * Math.PI * 2; const r = ((t - 21) * 220 + i * 13) % 420; return <div key={i} style={{position: 'absolute', left: 700 + Math.cos(a) * r * 1.6 - 30, top: 810 + Math.sin(a) * r * 0.25 - 15, width: 60, height: 30, borderRadius: '50%', background: 'rgba(180,170,150,0.35)', filter: 'blur(4px)'}} />; })}
      </>; })()}
      {/* soldados embarcando */}
      {[0, 1, 2, 3, 4].map((i) => { const t0 = 15 + i * 0.7; const x = ip(t, [t0, t0 + 2.2], [1500 - i * 30, 760]); const vis = t < t0 + 2.3; return vis ? <Char key={i} k={US} acc="delta" eyes="angry" t={t} s={110} x={x} y={770 + Math.abs(Math.sin(t * 9 + i)) * -8} look={-0.8} op={t < t0 ? 0 : 1} bob={false} /> : null; })}
      <Stamp t={t} t0={11.4} t1={31.6} place="WASHINGTON TIME" date="JANUARY 2, 2026" time="10:46 PM" />
      <Caption t={t} t0={13.5} t1={20.5} text="Delta Force boards the helicopters" hl="Delta Force" />
      <Caption t={t} t0={21} t1={31} text="Flown by the Army's elite 160th aviation regiment" hl="160th" />
    </AbsoluteFill>}
    <Vignette />
  </AbsoluteFill>);
};

// ---------- 8 · 150 AVIONES DESDE 20 BASES (16 s) ----------
export const S8: React.FC<{t: number}> = ({t}) => {
  const c = LL(-70, 18); const s = ip(t, [0, 16], [2.0, 2.6], false);
  const sx = (p: number[]) => (p[0] - c[0]) * s + W / 2, sy = (p: number[]) => (p[1] - c[1]) * s + H / 2;
  const orig: [number, number][] = [[-65.6, 18.25], [-66.5, 15], [-64, 14], [-81.4, 28.4], [-77.9, 30.7], [-76.3, 31.9], [-86.5, 29.4], [-70, 15.8], [-62.5, 15.2], [-80.4, 25.5], [-60, 20], [-74, 24]];
  return (<AbsoluteFill>
    <MapCam cx={c[0]} cy={c[1]} s={s} night={0.6} />
    <Pin x={sx(CCS)} y={sy(CCS)} t={t} label="CARACAS" />
    {Array.from({length: 60}, (_, i) => { const o = LL(...orig[i % orig.length]); const t0 = 1 + (i % 20) * 0.25 + Math.floor(i / 20) * 1.5; const u = ip(t, [t0, t0 + 6 + rnd(i) * 2], [0, 1], false); if (u <= 0 || u >= 1) return null;
      const jx = (rnd(i + 3) - 0.5) * 60, jy = (rnd(i + 5) - 0.5) * 60; const x = sx(o) + (sx(CCS) + jx - sx(o)) * u, y = sy(o) + (sy(CCS) + jy - sy(o)) * u;
      const ang = (Math.atan2(sy(CCS) - sy(o), sx(CCS) - sx(o)) * 180) / Math.PI + 90;
      return <Ico key={i} name="jet-fighter" x={x} y={y} w={34} c="#e8eef8" rot={ang} />; })}
    <div style={{position: 'absolute', right: 50, top: 60, display: 'flex', flexDirection: 'column', gap: 16}}>
      <div style={{position: 'relative', width: 360, height: 92}}><Counter t={t} t0={1} to={150} x={0} y={0} label="AIRCRAFT" icon="jet-fighter" suffix="+" d={6} /></div>
      <div style={{position: 'relative', width: 360, height: 92}}><Counter t={t} t0={1.5} to={20} x={0} y={0} label="BASES" icon="radar-sweep" d={3} /></div>
    </div>
    <Caption t={t} t0={1.5} t1={8} text="More than 150 aircraft take off at once" hl="150 aircraft" />
    <Caption t={t} t0={8.4} t1={15.6} text="F-22s · F-35s · F/A-18s · B-1 bombers · drones" />
    <Vignette />
  </AbsoluteFill>);
};

// ---------- 9 · ATAQUE A LAS DEFENSAS AÉREAS (18 s) ----------
export const S9: React.FC<{t: number}> = ({t}) => {
  const hits = [[3, 260, 520], [4.2, 760, 470], [5, 1180, 500], [6.1, 1560, 450], [7.2, 470, 560], [8.4, 1380, 540], [9.5, 940, 430]];
  const shake = hits.some(([h]) => t > h && t < h + 0.25) ? Math.sin(t * 90) * 8 : 0;
  return (<AbsoluteFill>
    <div style={{position: 'absolute', inset: 0, transform: `translate(${shake}px, ${shake * 0.6}px)`}}>
      <NightSky glow="#3a2030" /><Moon x={1650} y={150} r={56} />
      <Caracas y={700} lights={0.6} />
      {hits.map(([h, x, y], i) => <React.Fragment key={i}>
        {t < h + 0.2 && <Ico name="radar-dish" x={x} y={y - 30} w={70} c="#9aa6b8" />}
        {t > h - 1.2 && t < h && <div style={{position: 'absolute', left: x + (h - t) * 500 - 6, top: y - (h - t) * 700, width: 12, height: 60, borderRadius: 6, background: 'linear-gradient(180deg, rgba(255,255,255,0), #fff6c0)', transform: 'rotate(35deg)'}} />}
        <Boom x={x} y={y} r={150} t={t} t0={h} d={1.4} />
        {t > h + 0.8 && <div style={{position: 'absolute', left: x - 50, top: y - 120 - (t - h) * 20, width: 100, height: 160, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(50,40,40,0.55), rgba(50,40,40,0))', filter: 'blur(6px)'}} />}
      </React.Fragment>)}
    </div>
    {hits.map(([h], i) => <Flash key={i} t={t} t0={h} d={0.18} col="#ffd8a0" />)}
    <Stamp t={t} t0={0.3} t1={17.6} place="CARACAS" date="JANUARY 3, 2026" time="≈ 2:00 AM" />
    <Caption t={t} t0={1} t1={8.5} text="First target: Venezuela's air defenses" hl="air defenses" />
    <Caption t={t} t0={9} t1={17.5} text="Hit in more than a dozen locations" hl="more than a dozen" />
    <Vignette />
  </AbsoluteFill>);
};

// ---------- 10 · VUELO RASANTE SOBRE EL AGUA (20 s) ----------
export const S10: React.FC<{t: number}> = ({t}) => {
  const hitT = 10.5; const hit = t > hitT && t < hitT + 1.2 ? 1 - (t - hitT) / 1.2 : 0; const wob = t > hitT && t < hitT + 3 ? Math.sin((t - hitT) * 18) * 10 * (1 - (t - hitT) / 3) : 0;
  return (<AbsoluteFill>
    <NightSky glow="#1a2a4a" /><Moon x={300} y={170} r={60} />
    <Sea t={t} y={720} speed={520} />
    {/* costa que se acerca */}
    <div style={{position: 'absolute', left: ip(t, [0, 20], [-1400, -200], false), top: 560, width: 1200, height: 180, background: '#0e1a2e', clipPath: 'polygon(0 100%, 0 30%, 30% 0, 60% 40%, 80% 20%, 100% 100%)'}} />
    {[[1000, 590, 520], [1450, 640, 440], [1800, 580, 380]].map(([x, y, w], i) => <Heli key={i} t={t + i} w={w} x={x + Math.sin(t * 0.8 + i) * 30} y={y + Math.sin(t * 2 + i) * 6 + (i === 1 ? wob : 0)} tilt={10 + (i === 1 ? wob : 0)} flip hit={i === 1 ? hit : 0} />)}
    {/* regla de altura */}
    <div style={{position: 'absolute', left: 860, top: 640, width: 6, height: 80, background: '#ffd23f'}} />
    <div style={{position: 'absolute', left: 880, top: 652, ...font, fontSize: 42, color: '#ffd23f', WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill', opacity: ip(t, [1.5, 2], [0, 1])}}>~100 FT</div>
    {/* trazadoras desde la costa */}
    {t > hitT - 1.5 && t < hitT + 0.4 && Array.from({length: 5}, (_, i) => { const u = ((t - (hitT - 1.5)) * 1.4 + i * 0.18) % 1; return <div key={i} style={{position: 'absolute', left: 200 + u * 1250, top: 560 + u * 90, width: 50, height: 6, borderRadius: 3, background: '#ffb030', boxShadow: '0 0 12px #ff8a1a', transform: 'rotate(4deg)'}} />; })}
    {t > hitT && <Big text="HIT!" x={1480} y={470} size={90} col="#ff3b30" sc={pop(t, hitT, 0.25)} op={ip(t, [hitT + 2.5, hitT + 3.2], [1, 0])} />}
    <Caption t={t} t0={1} t1={9.5} text="Helicopters race in just 100 feet above the sea" hl="100 feet" />
    <Caption t={t} t0={hitT + 0.8} t1={19.5} text="One helicopter is hit... but keeps flying" hl="keeps flying" />
    <Vignette />
  </AbsoluteFill>);
};

// ---------- 11 · EL ASALTO (46 s) ----------
const CX = 960, CY = 560;
export const S11: React.FC<{t: number}> = ({t}) => {
  // vista cenital del complejo hasta 28 s, luego primer plano de la rendición
  const close = t > 27.5;
  const z = ip(t, [0, 3], [0.7, 1]) * ip(t, [14, 18], [1, 1.35]);
  const land = [[CX - 420, CY - 260], [CX - 160, CY - 330]];
  const team = (i: number): [number, number] => {
    const pts: [number, number][] = [[land[0][0], land[0][1]], [CX - 330, CY - 80], [CX - 230, CY + 20], [CX - 40, CY + 20], [CX + 80, CY - 60], [CX + 230, CY - 60]];
    const u = ip(t, [7 + i * 0.25, 22 + i * 0.25], [0, 1], false); const seg = Math.min(pts.length - 2, Math.floor(u * (pts.length - 1))); const f = u * (pts.length - 1) - seg;
    if (t < 15.5 && u * (pts.length - 1) > 2) { const a = pts[2]; return [a[0] - i * 26, a[1] + (i % 2) * 22]; }
    return [pts[seg][0] + (pts[seg + 1][0] - pts[seg][0]) * f - i * 26, pts[seg][1] + (pts[seg + 1][1] - pts[seg][1]) * f + (i % 2) * 22]; };
  const doorClose = ip(t, [17, 24], [0, 0.72], false);
  const madX = ip(t, [17, 21.5], [CX + 300, CX + 240]);
  return (<AbsoluteFill style={{background: '#0a0f14'}}>
    {!close && <div style={{position: 'absolute', inset: 0, transform: `scale(${z})`, transformOrigin: `${CX + 100}px ${CY}px`}}>
      <div style={{position: 'absolute', left: CX - 620, top: CY - 420, width: 1240, height: 840, background: '#1f2a1f', border: `16px solid #4a4a4a`, outline: `6px solid ${INK}`}}>
        {Array.from({length: 30}, (_, i) => <div key={i} style={{position: 'absolute', left: rnd(i) * 1180, top: rnd(i + 9) * 780, width: 40, height: 40, borderRadius: '50%', background: '#173017'}} />)}
      </div>
      {/* casa */}
      <div style={{position: 'absolute', left: CX - 280, top: CY - 160, width: 640, height: 360, background: '#c8b896', border: `10px solid ${INK}`}}>
        {[[0, 0, 220, 180], [220, 0, 200, 180], [420, 0, 200, 180], [0, 180, 320, 160], [320, 180, 300, 160]].map(([x, y, w, h], i) => <div key={i} style={{position: 'absolute', left: x, top: y, width: w, height: h, border: '4px solid #6a5a3a', background: i === 2 ? '#b8a684' : undefined}} />)}
        <div style={{position: 'absolute', left: 480, top: 20, ...font, fontSize: 24, color: '#5a1010'}}>SAFE ROOM</div>
        <div style={{position: 'absolute', left: 430, top: 175, width: 180, height: 14, background: '#444', transform: `scaleX(${doorClose})`, transformOrigin: '0 50%', border: '3px solid #000'}} />
      </div>
      {/* puerta de acero */}
      <div style={{position: 'absolute', left: CX - 296, top: CY - 10, width: 22, height: 80, background: t > 12.5 ? '#3a2a1a' : '#8a8f99', border: `4px solid ${INK}`, transform: t > 12.5 ? 'rotate(-70deg)' : undefined, transformOrigin: '50% 0'}} />
      <div style={{position: 'absolute', left: CX - 470, top: CY + 80, ...font, fontSize: 30, color: '#ffd23f', WebkitTextStroke: `5px ${INK}`, paintOrder: 'stroke fill'}}>STEEL DOOR</div>
      {/* fuego enemigo durante el aterrizaje */}
      {t > 1 && t < 7 && [[CX + 560, CY - 380], [CX - 580, CY + 380], [CX + 560, CY + 380]].map(([x, y], i) => Math.floor(t * 8 + i) % 3 === 0 ? <div key={i} style={{position: 'absolute', left: x - 20, top: y - 20, width: 40, height: 40, borderRadius: '50%', background: 'radial-gradient(circle, #fff6c0, rgba(255,160,40,0))'}} /> : null)}
      {/* helicópteros aterrizando */}
      {land.map(([x, y], i) => { const k = ip(t, [0.5 + i * 0.6, 4.5 + i * 0.6], [0, 1]); return <HeliTop key={i} t={t + i} w={ip(k, [0, 1], [380, 230], false)} x={x + (1 - k) * -500} y={y + (1 - k) * -300} rot={-30 + k * 30} />; })}
      {/* equipo */}
      {t > 6.5 && [0, 1, 2, 3, 4].map((i) => { const [x, y] = team(i); return <div key={i} style={{position: 'absolute', left: x - 22, top: y - 22, width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', border: `4px solid ${INK}`, background: 'radial-gradient(circle at 40% 35%, #6e6a52, #3e3b2c)', boxShadow: '0 0 12px rgba(120,255,120,0.6)'}} />; })}
      {/* Maduro y su mujer */}
      {t > 15 && <div style={{position: 'absolute', left: madX - 30, top: CY - 110, width: 60, height: 60, borderRadius: '50%', overflow: 'hidden', border: `4px solid ${INK}`, background: 'linear-gradient(180deg, #ffd21a 0 33%, #1f4fbf 33% 66%, #d61f26 66%)', boxShadow: '0 0 20px #ff3b30'}} />}
      {t > 15 && <div style={{position: 'absolute', left: madX - 100, top: CY - 80, width: 48, height: 48, borderRadius: '50%', border: `4px solid ${INK}`, background: 'linear-gradient(180deg, #ffd21a 0 33%, #1f4fbf 33% 66%, #d61f26 66%)'}} />}
      {t > 15 && <div style={{position: 'absolute', left: madX - 40, top: CY - 180, ...font, fontSize: 30, color: '#fff', WebkitTextStroke: `5px ${INK}`, paintOrder: 'stroke fill'}}>MADURO</div>}
    </div>}
    {!close && t > 8.5 && t < 12.5 && <div style={{position: 'absolute', left: 140, top: 560, width: 1, height: 1}}><Ico name="torch" x={0} y={0} w={140} c="#ffb030" glow="#ff8a1a" /></div>}
    {!close && <Flash t={t} t0={12.5} d={0.35} col="#ffe8b0" />}
    {/* barra de la puerta de la sala segura */}
    {!close && t > 17 && <div style={{position: 'absolute', left: W / 2 - 300, top: 60, width: 600}}>
      <div style={{...font, fontSize: 40, color: '#fff', textAlign: 'center', WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill'}}>{t < 24 ? 'SAFE ROOM DOOR CLOSING...' : 'TOO LATE'}</div>
      <div style={{height: 34, border: `6px solid ${INK}`, borderRadius: 10, background: '#2a1010', overflow: 'hidden'}}><div style={{width: `${doorClose * 100}%`, height: '100%', background: t < 24 ? 'linear-gradient(90deg, #ffd23f, #ff8a1a)' : '#ff3b30'}} /></div>
    </div>}
    {/* primer plano: rendición */}
    {close && <AbsoluteFill style={{opacity: ip(t, [27.5, 28.2], [0, 1]), background: 'radial-gradient(ellipse at 50% 45%, #2a2f3a, #0d1016 75%)'}}>
      <Char k={VE} acc="sash" eyes="scared" t={t} s={320} x={760} y={560} sweat label="NICOLÁS MADURO" />
      <Char k={VE} eyes="scared" t={t} s={240} x={1110} y={600} label="CILIA FLORES" />
      {t > 31 && <div style={{position: 'absolute', left: 520, top: 220, width: 1, height: 1, transform: `rotate(${Math.sin(t * 6) * 8}deg)`}}><div style={{position: 'absolute', left: 0, top: 0, width: 8, height: 200, background: '#8a6a3a'}} /><div style={{position: 'absolute', left: 8, top: 0, width: 150, height: 100, background: '#fff', border: `4px solid ${INK}`, transform: `scaleX(${pop(t, 31, 0.3)})`, transformOrigin: '0 0'}} /></div>}
      {[0, 1, 2].map((i) => <Char key={i} k={US} acc="delta" eyes="angry" t={t} s={200} x={ip(t, [28, 29.5], [2200, 1460 + i * 150])} y={590 + (i % 2) * 30} look={-0.8} />)}
      {t > 34 && <div style={{position: 'absolute', left: W / 2, top: 230, transform: `translate(-50%,-50%) rotate(-6deg) scale(${pop(t, 34, 0.25) * (1 + ip(t, [34, 34.2], [1.2, 0]))})`, padding: '10px 36px', border: '10px solid #ff3b30', borderRadius: 16, ...font, fontSize: 96, color: '#ff3b30', background: 'rgba(0,0,0,0.3)'}}>IN CUSTODY</div>}
      {t > 38 && <div style={{position: 'absolute', left: 0, top: 0, width: 1, height: 1}}><Ico name="handcuffs" x={760} y={820} w={120} c="#c8d0dc" /></div>}
    </AbsoluteFill>}
    <Stamp t={t} t0={0.3} t1={27.4} place="MADURO'S COMPOUND, CARACAS" date="JANUARY 3, 2026" time="2:01 AM" />
    <Caption t={t} t0={1.2} t1={6.8} text="They land at the compound under fire" hl="under fire" />
    <Caption t={t} t0={7.4} t1={12.3} text="Steel doors. They brought blowtorches..." hl="blowtorches" />
    <Caption t={t} t0={12.6} t1={16.5} text="...but they didn't need them." />
    <Caption t={t} t0={17} t1={27.2} text="Maduro runs for his safe room" hl="safe room" />
    <Caption t={t} t0={29} t1={33.8} text="He doesn't make it. He and his wife surrender." hl="surrender" />
    <Caption t={t} t0={38.6} t1={45.6} text="No US troops were killed in the operation" hl="No US troops were killed" />
    <Vignette />
  </AbsoluteFill>);
};

// ---------- 12 · EXTRACCIÓN (26 s) ----------
export const S12: React.FC<{t: number}> = ({t}) => {
  const c = [ip(t, [0, 26], [LL(-70, 15)[0], LL(-73, 28)[0]]), ip(t, [0, 26], [LL(-70, 15)[1], LL(-73, 28)[1]])]; const s = ip(t, [0, 26], [3.0, 1.6]);
  const sx = (p: number[]) => (p[0] - c[0]) * s + W / 2, sy = (p: number[]) => (p[1] - c[1]) * s + H / 2;
  const legs: [[number, number], [number, number], number, number, string, string][] = [
    [CCS, IWO, 1, 6, 'helicopter', 'USS IWO JIMA'], [IWO, GTMO, 8, 13, 'helicopter', 'GUANTÁNAMO BAY'], [GTMO, NY, 15, 21, 'airplane', 'NEW YORK']];
  return (<AbsoluteFill>
    <MapCam cx={c[0]} cy={c[1]} s={s} night={0.4} />
    <Pin x={sx(CCS)} y={sy(CCS)} t={t} label="CARACAS" size={16} />
    {legs.map(([a, b, t0, t1, ic, lb], i) => { const u = ip(t, [t0, t1], [0, 1]); const A: [number, number] = [sx(a), sy(a)], B: [number, number] = [sx(b), sy(b)];
      const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2 - Math.hypot(B[0] - A[0], B[1] - A[1]) * 0.2; const hx = (1 - u) ** 2 * A[0] + 2 * (1 - u) * u * mx + u * u * B[0], hy = (1 - u) ** 2 * A[1] + 2 * (1 - u) * u * my + u * u * B[1];
      return <React.Fragment key={i}>
        <Route a={A} b={B} p={u} col={i === 2 ? '#9fe8ff' : '#ffd23f'} bend={0.2} head={false} />
        {u > 0 && u < 1 && <Ico name={ic} x={hx} y={hy} w={70} c="#ffffff" glow="#ffd23f" />}
        {u >= 1 && <Pin x={B[0]} y={B[1]} t={t} col="#3a8aff" label={lb} size={16} />}
        {i === 0 && u >= 1 && <Ico name="carrier" x={B[0]} y={B[1] + 50} w={90} c="#c8d2e0" />}
      </React.Fragment>; })}
    <Stamp t={t} t0={0.5} t1={7.5} place="OVER THE CARIBBEAN" date="JANUARY 3, 2026" time="3:29 AM" />
    <Caption t={t} t0={1} t1={7.6} text="3:29 AM: they are over the water with Maduro" hl="over the water" />
    <Caption t={t} t0={8} t1={14.6} text="Onto the USS Iwo Jima, then Guantánamo Bay" hl="USS Iwo Jima" />
    <Caption t={t} t0={15} t1={25.6} text="An FBI plane flies him to New York" hl="New York" />
    <Vignette />
  </AbsoluteFill>);
};

// ---------- 13 · NOTICIAS Y REACCIONES (36 s) ----------
export const S13: React.FC<{t: number}> = ({t}) => {
  const ticker = 'BREAKING: US CAPTURES NICOLÁS MADURO  •  STRIKES HIT CARACAS OVERNIGHT  •  MADURO FLOWN TO NEW YORK  •  FACES NARCO-TERRORISM CHARGES  •  ';
  return (<AbsoluteFill style={{background: '#0a0f1c'}}>
    {/* a) el móvil vibra con el anuncio */}
    {t < 6.4 && <AbsoluteFill style={{opacity: ip(t, [5.8, 6.4], [1, 0]), background: 'radial-gradient(ellipse at 50% 50%, #1d2440, #070a14 75%)'}}>
      <div style={{position: 'absolute', left: W / 2 - 230, top: 110 + Math.sin(t * 50) * (t < 1.6 ? 6 : 0), width: 460, height: 860, borderRadius: 60, background: '#111', border: `10px solid ${INK}`, boxShadow: '0 0 60px rgba(120,160,255,0.35)'}}>
        <div style={{position: 'absolute', left: 30, right: 30, top: 70, ...font, fontSize: 70, color: '#fff', textAlign: 'center'}}>4:21</div>
        <div style={{position: 'absolute', left: 24, right: 24, top: 220, padding: 24, borderRadius: 26, background: 'rgba(255,255,255,0.92)', transform: `translateY(${ip(t, [1, 1.5], [-60, 0])}px)`, opacity: ip(t, [1, 1.4], [0, 1])}}>
          <div style={{...font, fontSize: 26, color: '#c3100a'}}>BREAKING NEWS</div>
          <div style={{...font, fontSize: 38, color: INK, lineHeight: 1.15}}>US announces "large scale strike" and Maduro's capture</div>
        </div>
      </div>
      <Caption t={t} t0={2} t1={6} text="4:21 AM: the President announces it online" hl="4:21 AM" />
    </AbsoluteFill>}
    {/* b) plató de noticias */}
    {t > 5.8 && t < 21 && <AbsoluteFill style={{opacity: Math.min(ip(t, [5.8, 6.4], [0, 1]), ip(t, [20.4, 21], [1, 0])), background: 'linear-gradient(180deg, #0d2a5a, #061633)'}}>
      <div style={{position: 'absolute', left: 980, top: 120, width: 820, height: 470, border: `10px solid ${INK}`, borderRadius: 12, overflow: 'hidden'}}><div style={{position: 'absolute', left: -480, top: -270, width: W, height: H, transform: 'scale(0.75)', transformOrigin: '0 0'}}><NightSky glow="#3a2030" /><Caracas y={700} lights={0.6} /></div>
        <div style={{position: 'absolute', left: 20, top: 16, padding: '6px 18px', background: '#c3100a', ...font, fontSize: 30, color: '#fff'}}>LIVE · CARACAS</div></div>
      <div style={{position: 'absolute', left: 120, top: 660, width: 860, height: 220, background: 'linear-gradient(180deg, #2a3a5a, #15203a)', border: `8px solid ${INK}`, borderRadius: '20px 20px 0 0'}} />
      <Char k={US} acc="tie" eyes="normal" t={t} s={300} x={550} y={520} label="NEWS ANCHOR" />
      <Bubble t={t} t0={8} t1={13.6} x={560} y={300} text="We have breaking news..." size={40} />
      <Bubble t={t} t0={14} t1={20.4} x={560} y={300} text="Maduro is in US custody." size={40} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 900, height: 110, background: '#c3100a', borderTop: `8px solid ${INK}`, display: 'flex', alignItems: 'center'}}>
        <div style={{flex: '0 0 auto', padding: '0 30px', height: '100%', display: 'flex', alignItems: 'center', background: '#fff', ...font, fontSize: 44, color: '#c3100a'}}>BREAKING</div>
        <div style={{overflow: 'hidden', whiteSpace: 'nowrap', flex: 1}}><div style={{display: 'inline-block', transform: `translateX(${-(t * 260) % 2400}px)`, ...font, fontSize: 46, color: '#fff'}}>{ticker + ticker}</div></div>
      </div>
    </AbsoluteFill>}
    {/* c) periódicos girando (cabeceras inventadas) */}
    {t > 20.4 && t < 28.6 && <AbsoluteFill style={{opacity: Math.min(ip(t, [20.4, 21], [0, 1]), ip(t, [28, 28.6], [1, 0])), background: 'radial-gradient(ellipse, #3a3a3a, #111 75%)'}}>
      {[['THE GLOBE DAILY', 'MADURO CAPTURED', 21], ['EL DIARIO MUNDIAL', '¡CAPTURADO!', 23.4], ['WORLD EVENING POST', 'NIGHT RAID ON CARACAS', 25.8]].map(([n, h, t0], i) => { const tt = t0 as number; if (t < tt) return null; const k = ip(t, [tt, tt + 0.8], [0, 1]);
        return <div key={i} style={{position: 'absolute', left: W / 2 - 520 + i * 40, top: 140 + i * 30, width: 1040, height: 700, background: '#f2eee4', border: `8px solid ${INK}`, transform: `rotate(${(1 - k) * 720 + (i - 1) * 4}deg) scale(${0.1 + k * 0.9})`, boxShadow: '0 20px 40px rgba(0,0,0,0.6)'}}>
          <div style={{textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: 64, fontWeight: 900, color: INK, borderBottom: `6px double ${INK}`, padding: '20px 0'}}>{n}</div>
          <div style={{textAlign: 'center', ...font, fontSize: 110, color: INK, marginTop: 30}}>{h}</div>
          {[0, 1, 2, 3, 4].map((r) => <div key={r} style={{margin: '18px 60px 0', height: 16, background: '#bdb6a6', width: `${70 + rnd(r + i) * 25}%`}} />)}
        </div>; })}
    </AbsoluteFill>}
    {/* d) reacciones (atribuidas) */}
    {t > 28 && <AbsoluteFill style={{opacity: ip(t, [28, 28.6], [0, 1]), background: 'radial-gradient(ellipse at 50% 40%, #1d2a48, #0a0f1c 75%)'}}>
      <Char k={VE} eyes="scared" t={t} s={240} x={560} y={600} label="VENEZUELA'S VICE PRESIDENT" />
      <Bubble t={t} t0={28.8} t1={35.8} x={560} y={430} text="We don't know where he is." size={40} />
      <Char k={CU} eyes="angry" t={t} s={240} x={1360} y={600} label="CUBA" />
      <Bubble t={t} t0={30.6} t1={35.8} x={1360} y={430} text="32 of our officers were killed." size={38} />
    </AbsoluteFill>}
    {t > 20.4 && t < 28.6 && <div style={{position: 'absolute', right: 40, bottom: 20, ...font, fontSize: 22, color: 'rgba(255,255,255,0.55)'}}>Newspapers shown are fictional</div>}
    <Vignette a={0.4} />
  </AbsoluteFill>);
};

// ---------- 14 · TRIBUNAL Y CIERRE (18 s) ----------
export const S14: React.FC<{t: number}> = ({t}) => {
  const bang = [3.2, 3.6];
  return (<AbsoluteFill style={{background: '#1a120a'}}>
    {t < 11 && <AbsoluteFill style={{opacity: ip(t, [10.4, 11], [1, 0]), background: 'linear-gradient(180deg, #4a3220 0%, #2a1a0e 70%)'}}>
      <div style={{position: 'absolute', left: 560, top: 300, width: 800, height: 300, background: 'linear-gradient(180deg, #6a4424, #3e2610)', border: `8px solid ${INK}`, borderRadius: '20px 20px 0 0'}} />
      <Char k={US} acc="judge" eyes="normal" t={t} s={220} x={960} y={240} label="JUDGE" />
      <div style={{position: 'absolute', left: 1260, top: 230, width: 1, height: 1, transform: `rotate(${bang.some((b) => t > b && t < b + 0.15) ? -30 : 0}deg)`}}><Ico name="banging-gavel" x={0} y={0} w={120} c="#8a5a2a" /></div>
      <Char k={VE} acc="sash" eyes="normal" t={t} s={260} x={960} y={790} label="NICOLÁS MADURO" />
      <Bubble t={t} t0={5} t1={10.4} x={960} y={620} text="Not guilty." size={56} />
      <Stamp t={t} t0={0.3} t1={10.4} place="MANHATTAN FEDERAL COURT" date="JANUARY 5, 2026" />
      <Caption t={t} t0={1.4} t1={10.4} text="Charged with narco-terrorism, he pleads not guilty" hl="not guilty" />
    </AbsoluteFill>}
    {t > 10.4 && <AbsoluteFill style={{opacity: ip(t, [10.4, 11], [0, 1])}}>
      <MapCam cx={LL(-70, 12)[0]} cy={LL(-70, 12)[1]} s={ip(t, [10.4, 18], [4, 2])} night={0.5} blur={2} />
      <Big text="WHAT HAPPENS TO" y={330} size={100} sc={pop(t, 11.2, 0.3)} />
      <Big text="VENEZUELA NOW?" y={460} size={130} col="#ffd23f" sc={pop(t, 11.6, 0.3)} />
      {t > 13 && <div style={{position: 'absolute', left: 0, right: 0, top: 680, textAlign: 'center', ...font, fontSize: 44, color: '#fff', opacity: ip(t, [13, 13.5], [0, 1])}}>Tell us in the comments 👇</div>}
    </AbsoluteFill>}
    <Vignette />
  </AbsoluteFill>);
};
