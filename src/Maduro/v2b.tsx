// V2 · segunda mitad: ataque aéreo, asalto, persecución, cubierta + foto, traslado, noticias, outro
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, font} from '../lib3';
import {Char} from './chars';
import {W, H, K, rnd, ip, pop, fade, LL, Ico, Big, Caption, Stamp, Bubble, Counter, NightSky, Moon, Sea, Caracas, Heli, HeliTop, Pin, Route, Vignette, Flash, Boom} from './lib';
import {US, VE, sq, WarMap, camAt, Soldiers, Sol, Grade, Letterbox, Black, SpeedLines} from './lib2';
import {Cell} from './v2a';

const CCS = LL(-66.9, 10.5), IWO = LL(-66.5, 13.6), GTMO = LL(-75.1, 19.9), NY = LL(-74.1, 41.5);

// ---------- G1 · ataque aéreo sobre Caracas en el mapa (12 s) ----------
export const G1: React.FC<{t: number}> = ({t}) => {
  const cam = camAt(t, [[0, CCS[0] + 20, CCS[1] - 120, 2.4], [5, CCS[0], CCS[1] - 20, 4.6], [12, CCS[0], CCS[1], 5.6]]);
  const sites: [number, number][] = [[-40, -14], [30, -10], [-20, 24], [50, 18], [-60, 8], [14, -34], [70, -4], [-30, -44]];
  const jets: any[] = []; const missiles: any[] = []; const fx: any[] = []; const flak: any[] = [];
  for (let i = 0; i < 14; i++) { const a = 0.2 + i * 0.35; const fromX = CCS[0] - 500 + rnd(i) * 1000, fromY = CCS[1] - 600; jets.push([a, a + 3.2, fromX, fromY, CCS[0] + (rnd(i + 5) - 0.5) * 60, CCS[1] + 300, US, 3]); }
  sites.forEach(([dx, dy], i) => { const a = 3 + i * 0.7; const sx = CCS[0] + dx, sy = CCS[1] + dy; missiles.push([a, a + 1.4, sx - 200, sy - 260, sx, sy]); fx.push([a + 1.4, sx, sy, 60, 0]); fx.push([a + 1.5, sx, sy, 30, 2]); flak.push([a - 1.5, a + 1.3, sx, sy]); });
  const w = {fx, cities: [['CARACAS', CCS[0], CCS[1] + 14, 1, 0, 99]], ext: {jets, missiles, flak, smoke: sites.map(([dx, dy], i) => [3 + i * 0.7 + 1.4, 30, CCS[0] + dx, CCS[1] + dy]), crater: sites.map(([dx, dy], i) => [3 + i * 0.7 + 1.4, CCS[0] + dx, CCS[1] + dy, 1])}, df: sites.map(([dx, dy], i) => [VE, CCS[0] + dx, CCS[1] + dy + 4, 3, 0, 3 + i * 0.7 + 1.4, null, 0.6])};
  const shake = fx.some((f) => t > f[0] && t < f[0] + 0.2) ? Math.sin(t * 80) * 6 : 0;
  return (<AbsoluteFill>
    <div style={{position: 'absolute', inset: 0, transform: `translate(${shake}px, ${shake}px)`}}><WarMap t={t} cam={cam} w={w} night={0.5} /></div>
    <div style={{position: 'absolute', right: 50, top: 60}}><div style={{position: 'relative', width: 360, height: 92}}><Counter t={t} t0={0.4} to={150} x={0} y={0} label="AIRCRAFT · 20 BASES" icon="jet-fighter" suffix="+" d={4} /></div></div>
    <Stamp t={t} t0={0.2} t1={11.8} place="CARACAS" date="JANUARY 3, 2026" time="≈ 2:00 AM" />
    <Caption t={t} t0={0.6} t1={5.5} text="150+ aircraft strike Venezuela's air defenses" hl="150+ aircraft" />
    <Caption t={t} t0={6} t1={11.8} text="Radars and anti-air sites go dark" hl="go dark" />
    <Grade g="red" />
    <Vignette />
  </AbsoluteFill>);
};

// ---------- G2 · vuelo rasante (6 s) ----------
export const G2: React.FC<{t: number}> = ({t}) => (<AbsoluteFill>
  <NightSky glow="#1a2a4a" /><Moon x={300} y={170} r={60} />
  <Sea t={t} y={700} speed={700} />
  {[[1000, 580, 520], [1450, 620, 440], [1800, 570, 380]].map(([x, y, w], i) => <Heli key={i} t={t + i} w={w} x={x - t * 30} y={y + Math.sin(t * 2 + i) * 6} tilt={-8} />)}
  <div style={{position: 'absolute', left: 860, top: 620, width: 6, height: 80, background: '#ffd23f'}} />
  <div style={{position: 'absolute', left: 880, top: 632, ...font, fontSize: 42, color: '#ffd23f', WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill'}}>~100 FT</div>
  <Caption t={t} t0={0.3} t1={5.8} text="Helicopters skim just 100 feet above the sea" hl="100 feet" />
  <Letterbox /><Grade g="night" /><Vignette />
</AbsoluteFill>);

// ---------- G3 · ASALTO AL COMPLEJO (40 s), vista cenital con soldados del canal ----------
const HX = 960, HY = 470; // centro de la casa
const COMP = {x: 300, y: 120, w: 1320, h: 820};
export const G3: React.FC<{t: number}> = ({t}) => {
  const z = ip(t, [0, 4], [0.82, 1]) * ip(t, [26, 32], [1, 1.15]);
  const heliPos = (i: number): [number, number, number] => { // x, y, tamaño
    const tx = [520, 1400, 960][i], ty = [300, 300, 860][i]; const k = ip(t, [0.2 + i * 0.5, 4 + i * 0.5], [0, 1]); const out = ip(t, [33 + i * 0.4, 37 + i * 0.4], [0, 1]);
    const orb = (1 - k) * 0.9; const ang = i * 2.1 + t * 0.6;
    return [tx + Math.cos(ang) * 600 * orb + out * 1400 * (i === 1 ? 1 : -1) * 0.6, ty + Math.sin(ang) * 400 * orb - out * 900, 300 - k * 40 + out * 80];
  };
  // guardias: caen uno a uno durante el tiroteo
  const guards: [number, number, number][] = [[700, 260, 9.5], [1220, 260, 10.3], [640, 700, 11.1], [1290, 690, 11.8], [960, 240, 12.6], [960, 720, 13.2]];
  const sols: Sol[] = [];
  guards.forEach(([x, y, td], i) => { const fall = ip(t, [td, td + 0.3], [0, 1], false); if (t < td + 1.2) sols.push({x, y, k: VE, dir: x < HX ? -1 : 1, pose: 1, fall, flash: t > 5 && t < td && Math.floor(t * 12 + i) % 4 === 0, sz: 56, flag: i === 0 && t < td}); });
  // equipos que bajan por cuerda y avanzan a la puerta, luego vuelven con Maduro
  const teams: [number, number][] = [[520, 300], [1400, 300], [960, 860]];
  teams.forEach(([hx, hy], ti) => { for (let j = 0; j < 4; j++) {
    const drop = ip(t, [5 + ti * 0.4 + j * 0.3, 5.6 + ti * 0.4 + j * 0.3], [0, 1]); if (drop <= 0) continue;
    const go = ip(t, [14, 17.5], [0, 1]); const back = ip(t, [27, 31], [0, 1]); const board = ip(t, [31, 33], [0, 1]);
    const sx0 = hx + (j - 1.5) * 50, sy0 = hy + 40; const dx = HX + (ti - 1) * 70 + (j - 1.5) * 30, dy = HY + 170;
    let x = sx0 + (dx - sx0) * go, y = sy0 + (dy - sy0) * go; if (t > 18 && t < 27) continue; // dentro de la casa
    x = x + (sx0 - x) * back; y = y + (sy0 - y) * back; if (board >= 1) continue;
    const moving = (t > 14 && t < 17.5) || (t > 27 && t < 31);
    sols.push({x, y: y - (1 - drop) * 80, k: US, dir: (t > 27 ? sx0 - dx : dx - sx0) >= 0 ? 1 : -1, pose: moving ? 0 : 1, flash: t > 6.5 && t < 13.5 && Math.floor(t * 14 + j * 3 + ti) % 4 === 0, sz: 56, flag: j === 0 && ti === 0});
  } });
  const ropes = t > 4.8 && t < 7.4;
  return (<AbsoluteFill style={{background: '#0d140d'}}>
    <div style={{position: 'absolute', inset: 0, transform: `scale(${z})`, transformOrigin: `${HX}px ${HY + 100}px`}}>
      {/* terreno y muro */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #233a22, #0f1a0f 80%)'}} />
      {Array.from({length: 40}, (_, i) => <div key={i} style={{position: 'absolute', left: rnd(i) * W, top: rnd(i + 3) * H, width: 70, height: 70, borderRadius: '50%', background: '#16301a', border: '3px solid #0a140a'}} />)}
      <div style={{position: 'absolute', left: COMP.x, top: COMP.y, width: COMP.w, height: COMP.h, border: `22px solid #8a8577`, outline: `6px solid ${INK}`, background: 'rgba(60,80,50,0.4)'}} />
      {[[COMP.x, COMP.y], [COMP.x + COMP.w, COMP.y], [COMP.x, COMP.y + COMP.h], [COMP.x + COMP.w, COMP.y + COMP.h]].map(([x, y], i) => <div key={i} style={{position: 'absolute', left: x - 34, top: y - 34, width: 68, height: 68, background: '#6a665a', border: `6px solid ${INK}`}} />)}
      {/* casa (tejado) */}
      <div style={{position: 'absolute', left: HX - 300, top: HY - 160, width: 600, height: 330, background: 'linear-gradient(135deg, #b5552c, #7a3418)', border: `10px solid ${INK}`, boxShadow: '12px 16px 0 rgba(0,0,0,0.4)'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 155, height: 10, background: INK}} />
        {t > 18 && t < 27 && <div style={{position: 'absolute', inset: 0, background: `rgba(255,220,120,${Math.floor(t * 8) % 3 === 0 ? 0.35 : 0.1})`}} />}
      </div>
      {/* puerta de acero */}
      <div style={{position: 'absolute', left: HX - 50, top: HY + 160, width: 100, height: 26, background: t > 17.5 ? '#2a1a0a' : '#9aa0aa', border: `6px solid ${INK}`}} />
      <Boom x={HX} y={HY + 170} r={150} t={t} t0={17.6} d={1.2} />
      <Soldiers list={sols} t={t} />
      {/* cuerdas */}
      {ropes && teams.map(([x, y], i) => <div key={i} style={{position: 'absolute', left: x - 2, top: y - 120, width: 4, height: 160, background: '#d8c8a0'}} />)}
      {/* Maduro sale escoltado */}
      {t > 27 && t < 33 && (() => { const u = ip(t, [27, 31], [0, 1]); const x = HX + (520 - HX) * u, y = HY + 200 + (330 - HY - 200) * u; return <Char k={VE} acc="sash" eyes="scared" t={t} s={90} x={x} y={y} bob={false} sweat />; })()}
      {/* helicópteros */}
      {[0, 1, 2].map((i) => { const [x, y, s] = heliPos(i); return <HeliTop key={i} t={t + i} w={s} x={x} y={y} rot={i * 40 + t * (t < 4 ? 30 : 4)} />; })}
      {/* trazadoras del tiroteo */}
      {t > 6.5 && t < 13.5 && <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>{Array.from({length: 10}, (_, i) => { const g = guards[i % guards.length]; const tm = teams[i % 3]; const u = (t * 2.5 + i * 0.13) % 1; const ax = tm[0] + (g[0] - tm[0]) * u, ay = tm[1] + 40 + (g[1] - tm[1] - 40) * u; const bx = tm[0] + (g[0] - tm[0]) * Math.min(1, u + 0.07), by = tm[1] + 40 + (g[1] - tm[1] - 40) * Math.min(1, u + 0.07);
        return t < g[2] ? <line key={i} x1={ax} y1={ay} x2={bx} y2={by} stroke="#ffe36b" strokeWidth={5} strokeLinecap="round" /> : null; })}</svg>}
    </div>
    {/* interior: carrera a la sala segura (18-27) */}
    {t > 18 && t < 27 && <AbsoluteFill style={{opacity: Math.min(ip(t, [18, 18.3], [0, 1]), ip(t, [26.7, 27], [1, 0])), background: 'linear-gradient(180deg, #4a3a2a 0%, #2e2418 65%, #5a4a38 65%)'}}>
      <div style={{position: 'absolute', left: 1500, top: 260, width: 260, height: 420, background: '#5a5f66', border: `10px solid ${INK}`}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${ip(t, [19.5, 24.5], [100, 30])}%`, background: 'linear-gradient(90deg, #8a9099, #6a6f78)', borderRight: `8px solid ${INK}`}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: -60, textAlign: 'center', ...font, fontSize: 36, color: '#ff3b30'}}>SAFE ROOM</div>
      </div>
      <Char k={VE} acc="sash" eyes="scared" t={t} s={240} x={ip(t, [18.6, 22.5], [500, 1280])} y={560} sweat look={0.8} />
      <Char k={VE} eyes="scared" t={t} s={180} x={ip(t, [18.9, 22.8], [300, 1080])} y={600} look={0.8} />
      {t > 22.6 && <Soldiers t={t} list={[0, 1, 2].map((i) => ({x: ip(t, [22.6, 23.6], [-100 - i * 120, 380 + i * 140]), y: 640 + (i % 2) * 20, k: US, dir: 1, pose: t > 23.6 ? 1 : 0, sz: 150, flag: i === 0}))} />}
      <div style={{position: 'absolute', left: W / 2 - 300, top: 80, width: 600}}>
        <div style={{...font, fontSize: 42, color: '#fff', textAlign: 'center', WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill'}}>{t < 24 ? 'DOOR CLOSING...' : 'TOO LATE!'}</div>
        <div style={{height: 36, border: `6px solid ${INK}`, borderRadius: 10, background: '#2a1010', overflow: 'hidden'}}><div style={{width: `${ip(t, [19.5, 24], [0, 70])}%`, height: '100%', background: t < 24 ? 'linear-gradient(90deg, #ffd23f, #ff8a1a)' : '#ff3b30'}} /></div>
      </div>
      {t > 24.2 && <Big text="SURRENDER" y={820} size={110} col="#ffd23f" sc={pop(t, 24.2, 0.3)} />}
    </AbsoluteFill>}
    <Flash t={t} t0={17.6} d={0.3} col="#ffe8b0" />
    <Stamp t={t} t0={0.3} t1={17.8} place="MADURO'S COMPOUND" date="JANUARY 3, 2026" time="2:01 AM" />
    <Caption t={t} t0={0.6} t1={4.8} text="The helicopters surround the compound" hl="surround" />
    <Caption t={t} t0={5.2} t1={9} text="Delta Force fast-ropes down under fire" hl="under fire" />
    <Caption t={t} t0={9.4} t1={14} text="The guards fall in seconds" hl="in seconds" />
    <Caption t={t} t0={14.4} t1={17.6} text="Steel doors? Blown open." hl="Blown open" />
    <Caption t={t} t0={27.4} t1={32.6} text="Maduro is taken to the helicopters" hl="taken" />
    <Caption t={t} t0={33} t1={39.6} text="In and out." />
    <Grade g="night" />
    <Vignette />
  </AbsoluteFill>);
};

// ---------- G4 · PERSECUCIÓN (16 s) ----------
export const G4: React.FC<{t: number}> = ({t}) => {
  const hitUS = 4.5, hitVE = 9.2; const veX = ip(t, [0, 3], [2300, 1500]) + ip(t, [hitVE, hitVE + 3], [0, 700]); const veY = 420 + ip(t, [hitVE, hitVE + 3], [0, 600]) + Math.sin(t * 2) * 10;
  const usHit = t > hitUS && t < hitUS + 1 ? 1 - (t - hitUS) : 0; const wob = t > hitUS && t < hitUS + 2.5 ? Math.sin((t - hitUS) * 16) * 10 : 0;
  return (<AbsoluteFill>
    <NightSky glow="#2a2040" /><Moon x={260} y={160} r={56} />
    <div style={{position: 'absolute', inset: 0, transform: `translateX(${(t * 120) % 200}px)`}}><Caracas y={820} lights={0.5} /></div>
    {/* EE. UU. hacia la izquierda */}
    {[[650, 380, 420], [1000, 470, 380]].map(([x, y, w], i) => <Heli key={i} t={t + i} w={w} x={x + Math.sin(t + i) * 20} y={y + (i === 1 ? wob : 0)} tilt={-8 + (i === 1 ? wob : 0)} hit={i === 1 ? usHit : 0} />)}
    {/* humo del helicóptero dañado */}
    {t > hitUS && Array.from({length: 10}, (_, i) => { const ph = ((t - hitUS) * 1.5 + i / 10) % 1; return <div key={i} style={{position: 'absolute', left: 1180 + ph * 400, top: 450 - ph * 60, width: 40 + ph * 80, height: 40 + ph * 80, borderRadius: '50%', background: `rgba(60,60,64,${0.5 * (1 - ph)})`}} />; })}
    {/* helicóptero venezolano */}
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `rotate(${t > hitVE ? (t - hitVE) * 25 : 0}deg)`, transformOrigin: `${veX}px ${veY}px`}}>
      <Heli t={t} w={400} x={veX} y={veY} tilt={-6} dark={false} />
      <div style={{position: 'absolute', left: veX + 60, top: veY - 30, width: 70, height: 46, background: 'linear-gradient(180deg, #ffd21a 0 33%, #1f4fbf 33% 66%, #d61f26 66%)', border: `4px solid ${INK}`}} />
    </div>
    {t > hitVE && Array.from({length: 10}, (_, i) => { const ph = ((t - hitVE) * 1.5 + i / 10) % 1; return <div key={i} style={{position: 'absolute', left: veX - 80 + ph * 200, top: veY - ph * 200, width: 50 + ph * 100, height: 50 + ph * 100, borderRadius: '50%', background: `rgba(40,40,44,${0.6 * (1 - ph)})`}} />; })}
    {/* disparos venezolanos */}
    {t > 2.5 && t < hitVE && <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>{Array.from({length: 6}, (_, i) => { const u = (t * 2 + i * 0.17) % 1; const ax = veX - 200 - u * 600, ay = veY + u * (40); return <line key={i} x1={ax} y1={ay} x2={ax - 60} y2={ay + 4} stroke="#ffb030" strokeWidth={6} strokeLinecap="round" />; })}</svg>}
    {/* respuesta de EE. UU. */}
    {t > 6.5 && t < hitVE + 0.3 && <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>{Array.from({length: 8}, (_, i) => { const u = (t * 2.4 + i * 0.13) % 1; const ax = 820 + u * (veX - 900), ay = 400 + u * (veY - 400); return <line key={i} x1={ax} y1={ay} x2={ax + 60} y2={ay + 4} stroke="#fff6a0" strokeWidth={6} strokeLinecap="round" />; })}</svg>}
    {t > hitUS && t < hitUS + 2 && <Big text="HIT!" x={1150} y={300} size={90} col="#ff3b30" sc={pop(t, hitUS, 0.25)} />}
    <Boom x={veX} y={veY} r={140} t={t} t0={hitVE} d={1.2} />
    <Flash t={t} t0={hitVE} d={0.25} col="#ffd8a0" />
    {t > 12 && <Big text="ESCAPED" y={160} size={110} col="#3ad16a" sc={pop(t, 12, 0.3)} />}
    <Caption t={t} t0={0.5} t1={4.4} text="A Venezuelan helicopter gives chase" hl="gives chase" />
    <Caption t={t} t0={hitUS + 0.6} t1={hitVE - 0.2} text="One US helicopter is hit... but keeps flying" hl="keeps flying" />
    <Caption t={t} t0={hitVE + 0.6} t1={15.6} text="The others fire back. The chaser turns away" hl="fire back" />
    <Letterbox /><Grade g="red" /><Vignette />
  </AbsoluteFill>);
};

// ---------- cubierta al amanecer (usada en la escena y en la foto) ----------
export const Deck: React.FC<{t: number; walk?: number; small?: boolean; lab?: string}> = ({t, walk = 1, small, lab = 'AGENT'}) => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg, #4a3a5a 0%, #e8823a 35%, #ffc36a 52%, #9ec8e8 53%, #6a9ac8 100%)', overflow: 'hidden'}}>
    {!small && Array.from({length: 6}, (_, i) => <div key={i} style={{position: 'absolute', left: rnd(i) * 1500, top: 120 + rnd(i + 4) * 200, width: 500, height: 120, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,200,120,0.6), rgba(255,200,120,0))'}} />)}
    <Sea t={t} y={560} speed={80} col="#5a8ab8" />
    <div style={{position: 'absolute', left: 0, right: 0, top: 820, bottom: 0, background: 'linear-gradient(180deg, #4a4f58, #2a2e34)', borderTop: `8px solid ${INK}`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 20, height: 18, background: 'repeating-linear-gradient(90deg, #c3100a 0 120px, #f2f2f2 120px 240px)'}} />
    </div>
    {(() => { const x = ip(walk, [0, 1], [-200, 960]); return <>
      <Char k={US} eyes="angry" t={t} s={230} x={x - 230} y={700} label={lab} bob={false} />
      <Char k={VE} eyes="sad" t={t} s={240} x={x} y={690} label="MADURO" bob={false} />
      <Char k={US} eyes="angry" t={t} s={230} x={x + 230} y={700} label={lab} bob={false} />
    </>; })()}
  </AbsoluteFill>
);

// ---------- H · LLEGADA Y LA FOTO (20 s) ----------
export const HH: React.FC<{t: number}> = ({t}) => {
  const photo = t > 8;
  return (<AbsoluteFill style={{background: '#000'}}>
    {!photo && <AbsoluteFill>
      <Deck t={t} walk={ip(t, [2.6, 7.6], [0, 1], false)} />
      {t < 3 && <Heli t={t} w={600} x={ip(t, [0, 2.4], [2200, 1300])} y={ip(t, [0, 2.4], [200, 640])} tilt={ip(t, [0, 2.4], [-10, 0])} />}
      {t > 2.4 && <Heli t={t} w={600} x={1300} y={640} tilt={0} />}
      <Stamp t={t} t0={0.3} t1={7.8} place="USS IWO JIMA" date="JANUARY 3, 2026" time="DAWN" />
      <Caption t={t} t0={2.8} t1={7.8} text="Maduro arrives on the USS Iwo Jima" hl="USS Iwo Jima" />
    </AbsoluteFill>}
    {photo && (() => { const lt = t - 8; const out = ip(lt, [1.2, 3.2], [0, 1]); const dev = ip(lt, [3, 6], [0, 1]);
      return <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #3a2a1a, #120a05 80%)'}}>
        {/* cámara instantánea */}
        <div style={{position: 'absolute', left: W / 2 - 330, top: ip(lt, [3.6, 4.6], [120, -700]), width: 660, height: 420, borderRadius: 50, background: 'linear-gradient(180deg, #f4f0e6, #d8d2c4)', border: `10px solid ${INK}`, boxShadow: '0 30px 60px rgba(0,0,0,0.6)'}}>
          <div style={{position: 'absolute', left: 220, top: 90, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, #6aa8ff 0%, #1a2a5a 40%, #0a0a14 70%)', border: `12px solid ${INK}`}} />
          <div style={{position: 'absolute', left: 40, top: 40, width: 90, height: 60, borderRadius: 10, background: '#2a2a2a', border: `5px solid ${INK}`}} />
          <div style={{position: 'absolute', right: 50, top: 50, width: 70, height: 70, borderRadius: '50%', background: '#c3100a', border: `6px solid ${INK}`}} />
          {[...'RAINBOW'].map((c, i) => <div key={i} style={{position: 'absolute', left: 300 + i * 6, top: 330, width: 6, height: 70, background: ['#e5322d', '#ff8a1f', '#ffd23f', '#22a95b', '#1f6fe0', '#7b2cbf', '#e5322d'][i]}} />)}
        </div>
        {/* la foto */}
        <div style={{position: 'absolute', left: W / 2 - 300, top: ip(out, [0, 1], [480, 560]) + ip(lt, [3.6, 4.6], [0, -380]), width: 600, height: 700 * Math.max(0.05, out), overflow: 'hidden', transform: `rotate(${ip(lt, [3.6, 4.6], [0, -4])}deg) scale(${ip(lt, [3.6, 4.6], [1, 1.25])})`, transformOrigin: '50% 0'}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: 600, height: 700, background: '#f7f5ef', border: `8px solid ${INK}`, boxShadow: '0 20px 40px rgba(0,0,0,0.6)'}}>
            <div style={{position: 'absolute', left: 30, top: 30, width: 524, height: 524, overflow: 'hidden', background: '#222'}}>
              <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: 'scale(0.6)', transformOrigin: '0 0', marginLeft: -310, marginTop: -110, filter: `brightness(${0.1 + dev * 0.9}) saturate(${dev})`}}><Deck t={0} walk={1} small lab="DEA" /></div>
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 34, textAlign: 'center', fontFamily: 'Comic Sans MS, cursive', fontSize: 42, color: '#333', opacity: dev}}>Jan 3, 2026</div>
          </div>
        </div>
        <Flash t={lt} t0={0.4} d={0.5} />
        {lt > 6 && <Big text="THE PHOTO THAT WENT VIRAL" y={60} size={70} col="#ffd23f" sc={pop(lt, 6, 0.3)} />}
      </AbsoluteFill>; })()}
    <Grade g="warm" /><Vignette />
  </AbsoluteFill>);
};

// ---------- I · TRASLADO A EE. UU. (12 s) ----------
export const II: React.FC<{t: number}> = ({t}) => {
  const cam = camAt(t, [[0, IWO[0], IWO[1] - 30, 3.2], [5, (IWO[0] + GTMO[0]) / 2, (IWO[1] + GTMO[1]) / 2 - 60, 2.2], [12, (GTMO[0] + NY[0]) / 2, (GTMO[1] + NY[1]) / 2, 1.5]]);
  const X = (p: number[]) => (p[0] - cam.cx) * cam.s + W / 2, Y = (p: number[]) => (p[1] - cam.cy) * cam.s + H / 2;
  const legs: [[number, number], [number, number], number, number, string, string, number][] = [[IWO, GTMO, 0.5, 4.5, 'helicopter', 'GUANTÁNAMO BAY', US], [GTMO, NY, 5, 10.5, 'airplane', 'NEW YORK', US]];
  return (<AbsoluteFill>
    <WarMap t={t} cam={cam} night={0.3} tokens={[{x: IWO[0], y: IWO[1], k: US, icon: 'carrier', size: 30, label: 'USS IWO JIMA'}]} />
    {legs.map(([a, b, t0, t1, ic, lb], i) => { const u = ip(t, [t0, t1], [0, 1]); const A: [number, number] = [X(a), Y(a)], B: [number, number] = [X(b), Y(b)];
      const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2 - Math.hypot(B[0] - A[0], B[1] - A[1]) * 0.2; const hx = (1 - u) ** 2 * A[0] + 2 * (1 - u) * u * mx + u * u * B[0], hy = (1 - u) ** 2 * A[1] + 2 * (1 - u) * u * my + u * u * B[1];
      return <React.Fragment key={i}><Route a={A} b={B} p={u} col="#ffd23f" bend={0.2} head={false} />
        {u > 0 && u < 1 && <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><circle cx={hx} cy={hy} r={36} fill="#3c5aa6" stroke={INK} strokeWidth={5} /></svg>}
        {u > 0 && u < 1 && <Ico name={ic} x={hx} y={hy} w={50} c="#fff" outline={false} />}
        {u >= 1 && <Pin x={B[0]} y={B[1]} t={t} col="#3a8aff" label={lb} size={16} />}</React.Fragment>; })}
    <Caption t={t} t0={0.5} t1={4.8} text="First to Guantánamo Bay..." hl="Guantánamo Bay" />
    <Caption t={t} t0={5.2} t1={11.6} text="...then an FBI plane to New York" hl="New York" />
    <Vignette />
  </AbsoluteFill>);
};

// ---------- J · NOTICIAS (28 s) ----------
const Paper: React.FC<{name: string; head: string; children: React.ReactNode}> = ({name, head, children}) => (
  <div style={{position: 'absolute', inset: 0, background: '#f2eee4', border: `8px solid ${INK}`}}>
    <div style={{textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: 40, fontWeight: 900, color: INK, borderBottom: `5px double ${INK}`, padding: '10px 0'}}>{name}</div>
    <div style={{textAlign: 'center', ...font, fontSize: 64, color: INK, margin: '10px 0'}}>{head}</div>
    <div style={{position: 'absolute', left: 30, right: 30, top: 160, height: 300, overflow: 'hidden', border: `4px solid ${INK}`, background: '#222'}}>{children}</div>
    {[0, 1, 2].map((r) => <div key={r} style={{margin: '0 30px', position: 'absolute', top: 480 + r * 26, height: 12, width: `${60 + rnd(r) * 30}%`, background: '#bdb6a6'}} />)}
  </div>
);
export const JJ: React.FC<{t: number}> = ({t}) => {
  const ticker = 'BREAKING: US FORCES CAPTURE NICOLÁS MADURO  •  STRIKES ON CARACAS OVERNIGHT  •  MADURO FLOWN TO NEW YORK  •  FACES NARCO-TERRORISM CHARGES  •  ';
  const talk = [[1.2, 4.6], [5.2, 9], [9.6, 13.6], [14.2, 18]];
  const talking = talk.some(([a, b]) => t > a && t < b); const hop = talking ? Math.abs(Math.sin(t * 15)) * 8 : 0;
  const papers: [number, string, string, React.ReactNode][] = [
    [6, 'THE GLOBE DAILY', 'MADURO CAPTURED', <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: 'scale(0.36)', transformOrigin: '0 0', marginLeft: -60, marginTop: -60}}><Cell t={t} /></div>],
    [11, 'EL DIARIO MUNDIAL', '¡CAPTURADO!', <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: 'scale(0.36)', transformOrigin: '0 0', marginLeft: -40, marginTop: -100}}><Deck t={0} walk={1} small /></div>],
    [16, 'WORLD EVENING POST', 'NIGHT RAID', <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: 'scale(0.36)', transformOrigin: '0 0', marginLeft: 0, marginTop: -60}}><NightSky glow="#3a2030" /><Caracas y={700} lights={0.6} /><Heli t={t} w={500} x={900} y={400} tilt={-6} /></div>],
  ];
  return (<AbsoluteFill style={{background: '#06142e', overflow: 'hidden'}}>
    {/* fondo animado: luces y líneas en movimiento */}
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 30% 40%, #1e4fa8 0%, #0a2558 50%, #04102a 100%)'}} />
    {Array.from({length: 14}, (_, i) => <div key={i} style={{position: 'absolute', left: ((rnd(i) * 2400 + t * (120 + rnd(i + 3) * 200)) % 2600) - 400, top: 80 + i * 60, width: 300 + rnd(i + 7) * 400, height: 3 + (i % 3), borderRadius: 3, background: 'linear-gradient(90deg, rgba(120,190,255,0), rgba(160,210,255,0.7), rgba(120,190,255,0))'}} />)}
    {Array.from({length: 6}, (_, i) => <div key={'g' + i} style={{position: 'absolute', left: 200 + i * 320 + Math.sin(t * 0.7 + i) * 60, top: 100 + Math.cos(t * 0.5 + i) * 60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(120,180,255,0.18), rgba(120,180,255,0))'}} />)}
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 120, background: 'linear-gradient(180deg, rgba(0,0,0,0.5), rgba(0,0,0,0))'}} />
    {/* tele con mini vídeo */}
    <div style={{position: 'absolute', left: 1010, top: 110, width: 820, height: 470, border: `12px solid ${INK}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 0 60px rgba(80,160,255,0.5)'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: 'scale(0.427)', transformOrigin: '0 0'}}>
        {t % 12 < 6 ? <Deck t={t} walk={ip(t % 6, [0, 5.5], [0, 1])} /> : <AbsoluteFill><NightSky glow="#1a2a4a" /><Sea t={t} y={700} speed={600} />{[[1100, 560, 520], [1550, 600, 420]].map(([x, y, w], i) => <Heli key={i} t={t + i} w={w} x={x} y={y} tilt={-8} />)}</AbsoluteFill>}
      </div>
      <div style={{position: 'absolute', left: 16, top: 12, padding: '4px 14px', background: '#c3100a', ...font, fontSize: 26, color: '#fff'}}>● LIVE</div>
    </div>
    {/* mesa y presentadora con auricular y folios */}
    <div style={{position: 'absolute', left: 80, top: 700, width: 900, height: 220, background: 'linear-gradient(180deg, #2a4a8a, #12285a)', border: `8px solid ${INK}`, borderRadius: '24px 24px 0 0'}}><div style={{position: 'absolute', left: 30, top: 30, ...font, fontSize: 44, color: '#ffd23f'}}>WORLD NEWS 24</div></div>
    <div style={{position: 'absolute', left: 0, top: -hop, width: W, height: H}}>
      <Char k={US} acc="tie" eyes="normal" t={t} s={300} x={520} y={540} />
      {/* auricular + micro */}
      <div style={{position: 'absolute', left: 520 - 158, top: 450, width: 34, height: 60, borderRadius: 14, background: '#1d1d1d', border: '4px solid #000'}} />
      <div style={{position: 'absolute', left: 520 - 150, top: 500, width: 120, height: 8, background: '#1d1d1d', transform: 'rotate(28deg)', transformOrigin: '0 50%'}} />
      <div style={{position: 'absolute', left: 520 - 50, top: 548, width: 22, height: 22, borderRadius: '50%', background: '#2a2a2a', border: '3px solid #000'}} />
      {/* folios */}
      <div style={{position: 'absolute', left: 640, top: 600, width: 150, height: 110, background: '#fbfbf6', border: `5px solid ${INK}`, transform: `rotate(${-12 + (talking ? Math.sin(t * 6) * 3 : 0)}deg)`}}>{[0, 1, 2, 3].map((r) => <div key={r} style={{margin: '12px 14px 0', height: 8, background: '#bcbcbc'}} />)}</div>
    </div>
    <Bubble t={t} t0={1.2} t1={4.8} x={560} y={330} text="Breaking news tonight!" size={42} />
    <Bubble t={t} t0={5.2} t1={9.2} x={560} y={330} text="US forces captured Maduro." size={42} />
    <Bubble t={t} t0={9.6} t1={13.8} x={560} y={330} text="He's now in New York." size={42} />
    <Bubble t={t} t0={14.2} t1={18.4} x={560} y={330} text="The world reacts..." size={42} />
    {/* periódicos con fotos que entran girando */}
    {papers.map(([t0, n, h, img], i) => { if (t < t0 || t > t0 + 5.5) return null; const k = ip(t, [t0, t0 + 0.6], [0, 1]); const o = ip(t, [t0 + 4.9, t0 + 5.5], [1, 0]);
      return <div key={i} style={{position: 'absolute', left: 1080 + (i - 1) * 40, top: 150 + (i % 2) * 30, width: 640, height: 600, opacity: o, transform: `rotate(${(1 - k) * 540 + (i - 1) * 5}deg) scale(${0.1 + k * 0.9})`, boxShadow: '0 20px 50px rgba(0,0,0,0.6)'}}><Paper name={n} head={h}>{img}</Paper></div>; })}
    {/* rótulo inferior */}
    <div style={{position: 'absolute', left: 0, right: 0, top: 930, height: 100, background: '#c3100a', borderTop: `8px solid ${INK}`, display: 'flex', alignItems: 'center'}}>
      <div style={{flex: '0 0 auto', padding: '0 30px', height: '100%', display: 'flex', alignItems: 'center', background: '#fff', ...font, fontSize: 42, color: '#c3100a'}}>BREAKING</div>
      <div style={{overflow: 'hidden', whiteSpace: 'nowrap', flex: 1}}><div style={{display: 'inline-block', transform: `translateX(${-(t * 280) % 2600}px)`, ...font, fontSize: 44, color: '#fff'}}>{ticker + ticker}</div></div>
    </div>
    {t > 22 && <AbsoluteFill style={{opacity: ip(t, [22, 22.4], [0, 1]), background: 'radial-gradient(ellipse at 50% 40%, #1d2a48, #0a0f1c 75%)'}}>
      <Char k={VE} eyes="scared" t={t} s={240} x={620} y={560} label="VENEZUELA" />
      <Bubble t={t} t0={22.4} t1={27.8} x={620} y={390} text="Where is he?!" size={44} />
      <Char k={K('CU')} eyes="angry" t={t} s={240} x={1300} y={560} label="CUBA" />
      <Bubble t={t} t0={23.6} t1={27.8} x={1300} y={390} text="We lost 32 officers." size={40} />
    </AbsoluteFill>}
    <div style={{position: 'absolute', right: 30, bottom: 108, ...font, fontSize: 20, color: 'rgba(255,255,255,0.5)'}}>News channel and newspapers are fictional</div>
  </AbsoluteFill>);
};

// ---------- K · OUTRO (10 s) ----------
export const KK: React.FC<{t: number}> = ({t}) => (<AbsoluteFill>
  <div style={{position: 'absolute', inset: 0, transform: `scale(${ip(t, [0, 10], [1, 1.1], false)})`}}><Cell t={t} /></div>
  <AbsoluteFill style={{background: `rgba(0,0,0,${ip(t, [0.8, 1.6], [0, 0.55])})`}} />
  {t > 1 && <Big text="WHAT HAPPENS TO" y={330} size={100} sc={pop(t, 1, 0.3)} />}
  {t > 1.4 && <Big text="VENEZUELA NOW?" y={460} size={140} col="#ffd23f" sc={pop(t, 1.4, 0.3)} />}
  {t > 3 && <div style={{position: 'absolute', left: 0, right: 0, top: 680, textAlign: 'center', ...font, fontSize: 48, color: '#fff', opacity: ip(t, [3, 3.5], [0, 1])}}>Tell us in the comments 👇</div>}
  {t > 4.5 && <div style={{position: 'absolute', left: W / 2 - 200, top: 790, width: 400, padding: '16px 0', borderRadius: 18, background: '#e5322d', border: `6px solid ${INK}`, textAlign: 'center', ...font, fontSize: 52, color: '#fff', transform: `scale(${pop(t, 4.5, 0.3)})`}}>SUBSCRIBE</div>}
</AbsoluteFill>);
