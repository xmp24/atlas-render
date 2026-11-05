// V3: escenas rehechas
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, font} from '../lib3';
import {Title3D, WHITE, GOLD} from '../ThumbsFinal';
import {CBall} from '../ThumbsCB';
import {Char} from './chars';
import {W, H, K, rnd, ip, pop, LL, Ico, Big, Caption, Stamp, Bubble, Counter, NightSky, Moon, Sea, Caracas, Heli, Pin, Route, Vignette, Flash, Boom} from './lib';
import {US, VE, sq, WarMap, camAt, Soldiers, Sol, Grade, Letterbox, DaysHUD, OvalOffice, President, CallScreen, CIARoom, Black, SpeedLines} from './lib2';
import {ShipTop, Amphib, LHD_SPOTS, HeliMini, Villa, VILLA_DOOR, Car, Tower} from './art';
import {Cell} from './v2a';

const DC = LL(-77.04, 38.9), CCS = LL(-66.9, 10.5), PR = LL(-65.6, 18.25), IWO = LL(-66.5, 13.6), GTMO = LL(-75.1, 19.9), NY = LL(-74.1, 41.5);
const HOUSE = [CCS[0] + 2, CCS[1] + 1.2];
const toS = (p: number[], cam: {cx: number; cy: number; s: number}) => [(p[0] - cam.cx) * cam.s + W / 2, (p[1] - cam.cy) * cam.s + H / 2];

// villa como icono sobre el mapa (con resplandor)
const VillaIcon: React.FC<{x: number; y: number; w: number; t: number; glow?: boolean; alarm?: boolean}> = ({x, y, w, t, glow, alarm}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - w * 0.65 * 0.85, width: w, height: w * 0.65}}>
    {glow && <div style={{position: 'absolute', inset: -w * 0.3, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,80,60,0.45), rgba(255,80,60,0) 65%)'}} />}
    <div style={{position: 'absolute', inset: 0, filter: 'drop-shadow(0 8px 0 rgba(0,0,0,0.45)) drop-shadow(0 0 4px #000)'}}><Villa t={t} alarm={alarm} /></div>
  </div>
);

// ---------- A3 · INTRO más llamativa (8 s) ----------
export const A3: React.FC<{t: number}> = ({t}) => {
  const bars = ip(t, [0.2, 0.6], [0, 1]); const punch = t > 0.6 && t < 0.9 ? 1.06 : 1; const shake = (t > 0.6 && t < 0.9) || (t > 2 && t < 2.3) ? Math.sin(t * 130) * 16 : 0;
  const police = Math.floor(t * 6) % 2; const rew = t > 6.4;
  return (<AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', inset: 0, transform: `translate(${shake}px,${shake * 0.6}px) scale(${punch * ip(t, [0, 6.4], [1.15, 1], false)})`, filter: rew ? 'saturate(0.2) contrast(1.4)' : undefined}}><Cell t={t} bars={bars} /></div>
    {/* sirenas */}
    <AbsoluteFill style={{background: `radial-gradient(ellipse at ${police ? 0 : 100}% 50%, ${police ? 'rgba(255,30,30,0.45)' : 'rgba(40,90,255,0.45)'} 0%, rgba(0,0,0,0) 55%)`, mixBlendMode: 'screen'}} />
    {/* flashes de prensa */}
    {Array.from({length: 10}, (_, i) => { const tf = 0.9 + rnd(i) * 5; return t > tf && t < tf + 0.12 ? <div key={i} style={{position: 'absolute', left: rnd(i + 9) * W - 150, top: 500 + rnd(i + 3) * 500, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.95), rgba(255,255,255,0) 60%)'}} /> : null; })}
    {/* rayo y onda detrás del título */}
    {t > 2 && t < 6.6 && <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      <circle cx={W / 2} cy={250} r={ip(t, [2, 2.8], [40, 1200])} fill="none" stroke="rgba(255,230,140,0.8)" strokeWidth={ip(t, [2, 2.8], [40, 2])} opacity={ip(t, [2, 2.8], [1, 0])} />
      {Math.floor(t * 8) % 4 !== 0 && <path d="M1500,0 L1430,140 L1480,150 L1380,330" fill="none" stroke="#fff6c0" strokeWidth={10} style={{filter: 'drop-shadow(0 0 16px #fff)'}} />}
    </svg>}
    {t > 2 && t < 6.6 && <div style={{position: 'absolute', inset: 0, transform: `scale(${pop(t, 2, 0.35)}) rotate(${-2 + Math.sin(t * 3) * 0.5}deg)`}}>
      <Title3D text="HOW THE US" x={W / 2} y={110} size={120} grad={WHITE} glow="rgba(255,255,255,0.5)" />
      <Title3D text="CAPTURED MADURO" x={W / 2} y={250} size={150} grad={GOLD} glow="rgba(255,190,40,0.9)" />
    </div>}
    {t > 1 && t < 6.6 && <div style={{position: 'absolute', left: ip(t, [1, 1.4], [-700, 0]), top: 930, padding: '14px 40px', background: '#c3100a', borderTop: `6px solid ${INK}`, borderBottom: `6px solid ${INK}`, ...font, fontSize: 46, color: '#fff'}}>BREAKING · MADURO IN US CUSTODY</div>}
    {t > 4.4 && t < 6.6 && <Big text="How did this happen?" x={1460} y={820} size={54} sc={pop(t, 4.4, 0.3)} />}
    {rew && <AbsoluteFill style={{background: 'repeating-linear-gradient(180deg, rgba(255,255,255,0.1) 0 3px, transparent 3px 9px)'}}><div style={{position: 'absolute', left: 60, top: 60, ...font, fontSize: 70, color: '#fff', textShadow: '0 4px 0 #000'}}>◀◀ REWIND</div></AbsoluteFill>}
    <Flash t={t} t0={0.6} d={0.2} /><Flash t={t} t0={2} d={0.25} col="#fff3c0" />
    <div style={{position: 'absolute', right: 40, bottom: 12, ...font, fontSize: 22, color: 'rgba(255,255,255,0.6)'}}>Dramatization inspired by real events</div>
  </AbsoluteFill>);
};

// ---------- D3 · segunda llamada con sala de la CIA (12 s) ----------
export const D3: React.FC<{t: number}> = ({t}) => (<AbsoluteFill>
  <OvalOffice t={t} zoom={ip(t, [0, 12], [1.0, 1.08], false)}>
    <President t={t} talk={[[6.6, 8.4], [8.8, 11.2]]} x={960} y={540} s={300} mood={t > 6.5 ? 'angry' : 'normal'} />
    <Bubble t={t} t0={6.6} t1={8.6} x={960} y={330} text="Then do it." size={56} />
    <Bubble t={t} t0={8.8} t1={11.6} x={960} y={330} text="You have 30 days." size={56} />
  </OvalOffice>
  <CallScreen t={t} t0={0.6} t1={6.4} label="CIA HEADQUARTERS" x={1380} y={110}>
    <CIARoom t={t} />
    <Char k={US} acc="cia" eyes="shades" t={t} s={150} x={210} y={175} />
  </CallScreen>
  <Bubble t={t} t0={1.2} t1={6.2} x={1590} y={470} text="Sir, we found him." size={40} />
  {t > 9.5 && <DaysHUD t={t} d={30} t0={9.5} />}
  <Grade g="warm" /><Black t={t} t0={0} d={0.4} /><Vignette />
</AbsoluteFill>);

// ---------- C3 · LA CIA (48 s) ----------
const AGENTS: [number, number][] = [[-71.6, 10.6], [-69.3, 10.05], [-68.0, 10.15], [-66.95, 10.45], [-64.2, 10.4], [-62.6, 8.3], [-63.6, 8.1], [-66.0, 7.9], [-67.5, 8.9], [-70.2, 8.6], [-71.1, 8.55], [-72.2, 7.8], [-65.2, 6.2], [-63.0, 6.5], [-61.8, 7.4], [-67.6, 5.7], [-69.0, 9.5], [-64.8, 9.1]];
export const C3: React.FC<{t: number}> = ({t}) => (<AbsoluteFill style={{background: '#000'}}>
  {/* 1 · agentes en la oscuridad (0-8) */}
  {t < 8.3 && (() => { const vc = LL(-66.8, 8.2); const cam = camAt(t, [[0, vc[0], vc[1], 3.2], [8, vc[0] + 10, vc[1] + 4, 3.6]]);
    return <AbsoluteFill>
      <WarMap t={t} cam={cam} night={0.82} />
      {AGENTS.map(([lo, la], i) => { const p = LL(lo, la); const [x, y] = toS(p, cam); const t0 = 0.6 + i * 0.35; if (t < t0) return null; const k = pop(t, t0, 0.3);
        return <React.Fragment key={i}>
          <div style={{position: 'absolute', left: x - 90, top: y - 110, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(140,230,255,0.55), rgba(140,230,255,0) 65%)', opacity: ip(t, [t0, t0 + 0.4], [0, 1])}} />
          <div style={{position: 'absolute', left: 0, top: 0, transform: `scale(${k})`, transformOrigin: `${x}px ${y - 30}px`}}><Char k={US} acc="cia" eyes="shades" t={t + i} s={46} x={x} y={y - 30} bob={false} /></div>
        </React.Fragment>; })}
      <Caption t={t} t0={0.8} t1={8} text="Secret CIA agents slip into Venezuela" hl="CIA agents" />
      <Stamp t={t} t0={0.2} t1={8} place="VENEZUELA" date="AUGUST 2025" />
    </AbsoluteFill>; })()}
  {/* 2 · la frontera (8-24) */}
  {t > 8 && t < 24.3 && (() => { const lt = t - 8;
    const carX = ip(lt, [0, 2.2], [-300, 760]) + ip(lt, [10.6, 12], [0, 1700]); const car2 = ip(lt, [12.4, 15.6], [-300, 2300]);
    const lift = ip(lt, [10.2, 10.8], [0, -70]); const alert = lt > 6.4 && lt < 9.2; const z = ip(lt, [6.2, 9.2], [1, 1.12]) * ip(lt, [9.2, 10], [1, 1 / 1.12]) ;
    const lightAng = alert ? -168 + Math.sin(lt * 0.5) * 2 : -150 + Math.sin(lt * 1.2) * 25;
    return <AbsoluteFill style={{opacity: ip(t, [8, 8.3], [0, 1])}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${z})`, transformOrigin: '700px 650px'}}>
        <AbsoluteFill style={{background: 'linear-gradient(180deg, #3a2a5a 0%, #e0703a 48%, #ffb46a 58%)'}} />
        {Array.from({length: 7}, (_, i) => <div key={i} style={{position: 'absolute', left: ((rnd(i) * 2200 + lt * (25 + i * 6)) % 2400) - 400, top: 40 + (i % 3) * 70, width: 420 + rnd(i + 2) * 200, height: 70, borderRadius: 40, background: 'linear-gradient(180deg, rgba(255,220,180,0.75), rgba(200,120,110,0.5))'}} />)}
        <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
          <path d="M0,520 L200,380 L380,460 L620,330 L860,450 L1080,350 L1320,470 L1560,360 L1920,480 L1920,700 L0,700 Z" fill="#7a3a4a" opacity={0.75} />
          <path d="M0,600 L260,500 L520,560 L800,480 L1100,560 L1400,490 L1920,570 L1920,700 L0,700 Z" fill="#5a2a3a" />
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: 640, bottom: 0, background: 'linear-gradient(180deg, #a86a3a, #6a3a1a)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 700, height: 120, background: '#3a3a40', borderTop: `6px solid ${INK}`, borderBottom: `6px solid ${INK}`}}><div style={{position: 'absolute', left: 0, right: 0, top: 54, height: 8, background: 'repeating-linear-gradient(90deg, #ffd23f 0 70px, transparent 70px 140px)'}} /></div>
        {[300, 1000, 1250, 1700].map((x, i) => <div key={i} style={{position: 'absolute', left: x, top: 820 + (i % 2) * 60, width: 40, height: 50, background: '#ff8a1f', clipPath: 'polygon(50% 0, 100% 100%, 0 100%)', border: `3px solid ${INK}`}} />)}
        {/* señal, bandera y caseta */}
        <div style={{position: 'absolute', left: 1500, top: 470, padding: '6px 20px', background: '#1f6a2a', border: `6px solid ${INK}`, ...font, fontSize: 38, color: '#fff'}}>VENEZUELA</div>
        <div style={{position: 'absolute', left: 1530, top: 530, width: 10, height: 170, background: INK}} />
        <div style={{position: 'absolute', left: 1080, top: 420, width: 230, height: 280, background: 'linear-gradient(180deg, #efe8d6, #cfc5ad)', border: `8px solid ${INK}`}}>
          <div style={{position: 'absolute', left: 26, top: 50, width: 170, height: 90, background: '#9fd4ff', border: `5px solid ${INK}`}} />
          <div style={{position: 'absolute', left: -24, right: -24, top: -44, height: 50, background: 'repeating-linear-gradient(90deg, #c3100a 0 40px, #fff 40px 80px)', border: `6px solid ${INK}`}} />
        </div>
        <div style={{position: 'absolute', left: 1000, top: 640, width: 560, height: 28, background: 'repeating-linear-gradient(90deg, #c3100a 0 50px, #fff 50px 100px)', border: `5px solid ${INK}`, transformOrigin: '0 50%', transform: `rotate(${lift}deg)`}} />
        <Tower x={1790} y={260} t={lt} ang={lightAng} alert={alert} />
        {/* coches */}
        <Car x={carX} y={740} w={380} t={lt} moving={lt < 2.2 || lt > 10.6} />
        {lt > 12.4 && <Car x={car2} y={740} w={360} t={lt} col="#5a2a2a" />}
        {(lt > 10.6 || lt < 2.2) && Array.from({length: 6}, (_, i) => <div key={i} style={{position: 'absolute', left: carX - 230 - i * 40, top: 750 - i * 6, width: 50 + i * 12, height: 40 + i * 8, borderRadius: '50%', background: `rgba(200,160,110,${0.4 - i * 0.05})`}} />)}
        {/* guardia */}
        <Char k={VE} eyes={alert ? 'angry' : 'normal'} t={t} s={150} x={ip(lt, [2.4, 3.4], [1190, 930])} y={600} look={-0.8} label="BORDER GUARD" />
        {alert && <div style={{position: 'absolute', left: 900, top: 420, ...font, fontSize: 120, color: '#ff3b30', WebkitTextStroke: `8px ${INK}`, paintOrder: 'stroke fill', transform: `scale(${pop(lt, 6.4, 0.25)})`}}>!</div>}
      </div>
      {/* DNI */}
      {lt > 3.8 && lt < 6.3 && <div style={{position: 'absolute', left: 300, top: 110, width: 600, height: 370, transform: `rotate(-4deg) scale(${pop(lt, 3.8, 0.3) * ip(lt, [6, 6.3], [1, 0], false)})`, borderRadius: 26, background: 'linear-gradient(135deg, #fff4c8, #f2d77a)', border: `8px solid ${INK}`, boxShadow: '0 20px 50px rgba(0,0,0,0.5)'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 64, borderRadius: '18px 18px 0 0', background: 'linear-gradient(180deg, #ffd21a 0 33%, #1f4fbf 33% 66%, #d61f26 66%)'}} />
        <div style={{position: 'absolute', left: 30, top: 92, width: 180, height: 230, background: '#dfe8f2', border: `5px solid ${INK}`, overflow: 'hidden'}}><CBall k={VE} size={140} x={90} y={115} eyes="normal" /></div>
        <div style={{position: 'absolute', left: 240, top: 100, ...font, fontSize: 30, color: INK, lineHeight: 1.5}}>IDENTITY CARD<br />CARLOS RUIZ<br />TOURIST 🙂</div>
        <div style={{position: 'absolute', right: 30, bottom: 24, transform: 'rotate(-14deg)', padding: '2px 18px', border: '7px solid #c3100a', borderRadius: 12, ...font, fontSize: 58, color: '#c3100a'}}>FAKE</div>
      </div>}
      <Bubble t={lt} t0={2.8} t1={4} x={930} y={440} text="Papers." size={42} />
      <Bubble t={lt} t0={6.6} t1={9} x={930} y={440} text="Wait... step out!" size={44} />
      <Bubble t={lt} t0={9.3} t1={10.6} x={930} y={440} text="...OK. Go." size={44} />
      {lt > 9.3 && lt < 11 && <div style={{position: 'absolute', left: 700, top: 160, transform: `rotate(-10deg) scale(${pop(lt, 9.3, 0.25)})`, padding: '8px 30px', border: '10px solid #3ad16a', borderRadius: 14, ...font, fontSize: 80, color: '#3ad16a', background: 'rgba(0,0,0,0.3)'}}>APPROVED</div>}
      {alert && <AbsoluteFill style={{boxShadow: `inset 0 0 200px rgba(255,0,0,${0.35 + 0.2 * Math.sin(lt * 10)})`}} />}
      <Caption t={lt} t0={0.3} t1={3.6} text="Some agents drive in across the border..." />
      <Caption t={lt} t0={6.5} t1={9.2} text="Almost caught!" hl="Almost caught!" />
      <Caption t={lt} t0={12.6} t1={16} text="One car after another, they get in." />
      <Letterbox /><Grade g="warm" />
    </AbsoluteFill>; })()}
  {/* 3 · prismáticos sobre el mapa (24-32) */}
  {t > 24 && t < 32.3 && (() => { const lt = t - 24; const cam = camAt(lt, [[0, CCS[0] - 20, CCS[1] + 30, 3.4], [8, CCS[0] - 6, CCS[1] + 10, 5.2]]); const [ax, ay] = toS([CCS[0] - 26, CCS[1] + 26], cam); const sweep = Math.sin(lt * 1.1) * 0.5;
    return <AbsoluteFill style={{opacity: ip(t, [24, 24.3], [0, 1])}}>
      <WarMap t={t} cam={cam} night={0.85} />
      {/* cono de luz de los prismáticos */}
      <div style={{position: 'absolute', left: ax, top: ay - 40, width: 1100, height: 520, transformOrigin: '0 50%', transform: `translateY(-260px) rotate(${-25 + sweep * 30}deg)`, background: 'radial-gradient(ellipse at 0% 50%, rgba(255,250,210,0.55) 0%, rgba(255,250,210,0) 70%)', clipPath: 'polygon(0 46%, 100% 0, 100% 100%, 0 54%)', mixBlendMode: 'screen'}} />
      <div style={{position: 'absolute', left: ax - 160, top: ay - 220, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(140,230,255,0.45), rgba(140,230,255,0) 65%)'}} />
      <Char k={US} acc="cia" eyes="shades" t={t} s={120} x={ax} y={ay - 60} look={0.8} />
      <div style={{position: 'absolute', left: ax + 40, top: ay - 80, width: 1, height: 1}}><Ico name="binoculars" x={0} y={0} w={80} c="#2a2a2a" rot={-10} /></div>
      <Caption t={lt} t0={0.4} t1={7.8} text="They watch, follow and wait" hl="watch, follow and wait" />
    </AbsoluteFill>; })()}
  {/* 4 · la casa localizada (32-40) */}
  {t > 32 && t < 40.3 && (() => { const lt = t - 32; const cam = camAt(lt, [[0, CCS[0] - 6, CCS[1] + 10, 5.2], [3, HOUSE[0], HOUSE[1], 6]]); const [hx, hy] = toS(HOUSE, cam); const k = ip(lt, [2.4, 3.6], [3, 1]);
    return <AbsoluteFill>
      <WarMap t={t} cam={cam} night={0.75} />
      {lt > 2 && <div style={{position: 'absolute', left: 0, top: 0, transform: `scale(${pop(lt, 2, 0.35)})`, transformOrigin: `${hx}px ${hy}px`}}><VillaIcon x={hx} y={hy} w={420} t={t} glow /></div>}
      {lt > 2.4 && <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><g transform={`translate(${hx},${hy - 120}) scale(${k}) rotate(${lt * 35})`}><circle r={250} fill="none" stroke="#ff3b30" strokeWidth={12} strokeDasharray="60 30" /><line x1={-320} y1={0} x2={-180} y2={0} stroke="#ff3b30" strokeWidth={12} /><line x1={320} y1={0} x2={180} y2={0} stroke="#ff3b30" strokeWidth={12} /><line x1={0} y1={-320} x2={0} y2={-180} stroke="#ff3b30" strokeWidth={12} /><line x1={0} y1={320} x2={0} y2={180} stroke="#ff3b30" strokeWidth={12} /></g></svg>}
      {lt > 3.6 && <Big text="TARGET LOCATED" y={70} size={110} col="#ff3b30" sc={pop(lt, 3.6, 0.3)} />}
      <Caption t={lt} t0={4} t1={8} text="Maduro's fortified compound in Caracas" hl="fortified compound" />
    </AbsoluteFill>; })()}
  {/* 5 · la señal a Washington (40-48) */}
  {t > 40 && (() => { const lt = t - 40; const cam = camAt(lt, [[0, HOUSE[0], HOUSE[1], 4.6], [2.5, (CCS[0] + DC[0]) / 2, (CCS[1] + DC[1]) / 2, 1.5], [6.4, (CCS[0] + DC[0]) / 2, (CCS[1] + DC[1]) / 2, 1.6], [8, DC[0], DC[1], 4.6]]);
    const [ax, ay] = toS(CCS, cam), [bx, by] = toS(DC, cam);
    return <AbsoluteFill style={{opacity: ip(t, [40, 40.3], [0, 1])}}>
      <WarMap t={t} cam={cam} night={0.45} />
      <Pin x={ax} y={ay} t={t} label="TARGET" />
      <Route a={[ax, ay]} b={[bx, by]} p={ip(lt, [2.2, 5.4], [0, 1])} col="#3ad16a" bend={0.2} w={7} />
      {lt > 5.4 && <Pin x={bx} y={by} t={t * 1.5} col="#3a8aff" label="WASHINGTON" />}
      {lt > 5.4 && <div style={{position: 'absolute', left: bx + 30, top: by + 30, ...font, fontSize: 40, color: '#fff', WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill', transform: `rotate(${Math.sin(t * 30) * 6}deg)`}}>📞 RING!</div>}
      <Caption t={lt} t0={1} t1={7.8} text="The location goes straight to the White House" hl="White House" />
    </AbsoluteFill>; })()}
  <Vignette />
</AbsoluteFill>);

// ---------- F3 · 30 DÍAS (46 s) ----------
export const F3: React.FC<{t: number}> = ({t}) => {
  const day = Math.max(1, Math.round(ip(t, [0, 38], [29, 1], false)));
  const cuts = [0, 6, 11, 16, 24, 31, 38, 42]; let shot = 0; for (let i = 0; i < cuts.length; i++) if (t >= cuts[i]) shot = i; const lt = t - cuts[shot];
  return (<AbsoluteFill style={{background: '#000'}}>
    {/* 0 · la flota (barcos dibujados) */}
    {shot === 0 && (() => { const c = LL(-67, 15.6); const cam = camAt(lt, [[0, c[0], c[1] - 30, 2.5], [6, c[0] - 15, c[1], 3.0]]);
      const ships = [[-64, 13.2], [-66, 13.6], [-68, 13.4], [-70, 13.8], [-62.5, 14.2], [-67, 14.6], [-65, 15], [-69, 15.2], [-71.5, 14.6], [-63.5, 15.6], [-66.5, 16.2]];
      return <AbsoluteFill><WarMap t={t} cam={cam} night={0.3} />
        <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          {ships.map(([lo, la], i) => { const p = LL(lo, la); const u = ip(lt, [0.2 + i * 0.22, 3.6 + i * 0.22], [0, 1]); const [x, y] = toS([p[0] + (1 - u) * 180, p[1] - (1 - u) * 100], cam); return <ShipTop key={i} x={x} y={y} len={110} ang={150} wake={1 - u * 0.6} />; })}
          {(() => { const p = LL(-67.5, 16.9); const u = ip(lt, [0, 3.2], [0, 1]); const [x, y] = toS([p[0] + (1 - u) * 220, p[1] - (1 - u) * 120], cam); return <Amphib x={x} y={y} len={250} ang={150} wake={1 - u * 0.6} label="USS GERALD R. FORD" />; })()}
        </svg>
        <Caption t={lt} t0={0.5} t1={5.8} text="An aircraft carrier and 11 warships move in" hl="11 warships" /></AbsoluteFill>; })()}
    {/* 1 · cubierta: despegan cazas */}
    {shot === 1 && <AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #7ab8f0 0%, #cfe6ff 60%)'}} />
      {Array.from({length: 5}, (_, i) => <div key={i} style={{position: 'absolute', left: ((rnd(i) * 2000 + t * 40) % 2300) - 300, top: 60 + i * 60, width: 360, height: 60, borderRadius: 30, background: 'rgba(255,255,255,0.7)'}} />)}
      <Sea t={t} y={700} speed={160} col="#1d5a9a" />
      <div style={{position: 'absolute', left: ip(lt, [0, 5], [200, 120], false), top: 560, width: 1500, height: 150}}>
        <div style={{position: 'absolute', left: 0, top: 30, width: 1500, height: 40, background: '#6a737e', border: `6px solid ${INK}`}} />
        <div style={{position: 'absolute', left: 60, top: 70, width: 1380, height: 80, background: 'linear-gradient(180deg, #8a939e, #4a525c)', border: `6px solid ${INK}`, clipPath: 'polygon(0 0, 100% 0, 96% 100%, 4% 100%)'}} />
        <div style={{position: 'absolute', left: 1000, top: -110, width: 120, height: 145, background: '#7a838e', border: `6px solid ${INK}`}}><div style={{position: 'absolute', left: 50, top: -60, width: 8, height: 60, background: INK}} /></div>
      </div>
      {[0, 1, 2].map((i) => { const u = ip(lt, [0.6 + i * 1.2, 2.4 + i * 1.2], [0, 1], false); if (u >= 1) return null; return <div key={i}>{u > 0 && <div style={{position: 'absolute', left: 600 + u * 1500 - 300, top: 560 - u * u * 420, width: 300, height: 8, borderRadius: 4, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.8))', transform: `rotate(${-u * 20}deg)`}} />}<Ico name="jet-fighter" x={600 + i * (u > 0 ? 0 : 160) + u * 1500} y={570 - u * u * 420} w={110} c="#5a6470" rot={90 - u * 20} /></div>; })}
      <Caption t={lt} t0={0.4} t1={4.8} text="Fighter jets on standby" hl="Fighter jets" />
    </AbsoluteFill>}
    {/* 2 · tropas reuniéndose en Puerto Rico */}
    {shot === 2 && (() => { const cam = camAt(lt, [[0, PR[0], PR[1], 6], [5, PR[0] + 5, PR[1] + 2, 7]]);
      const w = {sq: [sq(US, [[PR[0] - 60, PR[1] + 10], [PR[0] - 8, PR[1]]], 0.3, 4, 6), sq(US, [[PR[0] + 50, PR[1] + 14], [PR[0] + 10, PR[1] + 2]], 0.6, 4.2, 6), sq(US, [[PR[0] - 30, PR[1] - 20], [PR[0] - 2, PR[1] - 6]], 0.9, 4.5, 5)], cities: [['PUERTO RICO', PR[0], PR[1] + 30, 0, 0, 99]],
        ext: {jets: [[0.2, 3.4, PR[0] - 400, PR[1] - 300, PR[0], PR[1] - 10, US, 3], [1.2, 4.6, PR[0] + 400, PR[1] - 260, PR[0] + 20, PR[1] - 14, US, 3]]}};
      return <><WarMap t={lt} cam={cam} w={w} night={0.2} /><Caption t={lt} t0={0.5} t1={4.8} text="Troops gather in Puerto Rico" hl="Puerto Rico" /></>; })()}
    {/* 3 · de la costa al buque en lanchas */}
    {shot === 3 && (() => { const coast = [PR[0] - 10, PR[1] + 22]; const ship = [PR[0] - 16, PR[1] + 70]; const cam = camAt(lt, [[0, PR[0] - 12, PR[1] + 40, 6], [8, PR[0] - 14, PR[1] + 52, 7]]);
      const [sx, sy] = toS(ship, cam);
      const w = {sq: [sq(US, [[PR[0] - 40, PR[1] - 4], [coast[0] - 6, coast[1] - 4]], 0.2, 2.6, 6, {t_end: 2.8}), sq(US, [[PR[0] + 20, PR[1] - 4], [coast[0] + 8, coast[1] - 3]], 0.4, 2.8, 6, {t_end: 3})]};
      return <AbsoluteFill><WarMap t={lt} cam={cam} w={w} night={0.25} />
        <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <Amphib x={sx} y={sy} len={760} ang={-8} wake={0.3} label="USS IWO JIMA" />
          {[0, 1, 2].map((i) => { const u = ip(lt, [2.4 + i * 0.6, 6 + i * 0.6], [0, 1]); const [ax, ay] = toS([coast[0] - 4 + i * 6, coast[1] + 4], cam); const bx = sx - 200 + i * 160, by = sy + 40; const x = ax + (bx - ax) * u, y = ay + (by - ay) * u; if (u <= 0 || u >= 1) return null;
            return <g key={i} transform={`translate(${x},${y}) rotate(${Math.atan2(by - ay, bx - ax) * 180 / Math.PI})`}><path d="M-60,0 L-140,-18 L-140,18 Z" fill="rgba(255,255,255,0.4)" /><rect x={-50} y={-18} width={100} height={36} rx={14} fill="#5a6a4a" stroke={INK} strokeWidth={4} />{[0, 1, 2, 3].map((j) => <circle key={j} cx={-30 + j * 20} cy={0} r={7} fill="#c3100a" stroke={INK} strokeWidth={2} />)}</g>; })}
        </svg>
        <Caption t={lt} t0={0.4} t1={7.6} text="Boats carry the troops to the USS Iwo Jima" hl="USS Iwo Jima" /></AbsoluteFill>; })()}
    {/* 4 · los helicópteros aterrizan en el buque */}
    {shot === 4 && <AbsoluteFill style={{background: '#1d5a9a'}}>
      <Sea t={t} y={0} speed={60} col="#1d5a9a" />
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <Amphib x={W / 2} y={H / 2 + 60} len={1700} ang={0} wake={0.6}>
          {LHD_SPOTS.slice(0, 4).map(([px, py], i) => { const u = ip(lt, [0.4 + i * 1.1, 2.8 + i * 1.1], [0, 1]); const sc = 34 + (1 - u) * 60; return u > 0 ? <HeliMini key={i} x={px + (1 - u) * (i % 2 ? 260 : -260)} y={py - (1 - u) * 220} s={sc} t={t * (u >= 1 ? 0.3 : 1) + i} rot={(1 - u) * (i % 2 ? -40 : 40) + 90} /> : null; })}
        </Amphib>
      </svg>
      <Caption t={lt} t0={0.5} t1={6.6} text="The helicopters land on deck, one by one" hl="land on deck" />
    </AbsoluteFill>}
    {/* 5 · agentes acercándose por tierra a la casa */}
    {shot === 5 && (() => { const cam = camAt(lt, [[0, HOUSE[0], HOUSE[1] - 4, 4.4], [7, HOUSE[0], HOUSE[1] - 2, 5.6]]); const [hx, hy] = toS(HOUSE, cam);
      const from: [number, number][] = [[-50, 30], [40, 34], [-60, -20], [55, -24], [0, 52]];
      return <AbsoluteFill><WarMap t={t} cam={cam} night={0.8} />
        <VillaIcon x={hx} y={hy} w={260} t={t} glow />
        {from.map(([dx, dy], i) => { const u = ip(lt, [0.3 + i * 0.3, 6 + i * 0.2], [0, 0.72]); const [x, y] = toS([HOUSE[0] + dx * (1 - u), HOUSE[1] + dy * (1 - u)], cam); const [x0, y0] = toS([HOUSE[0] + dx, HOUSE[1] + dy], cam);
          return <React.Fragment key={i}><svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><line x1={x0} y1={y0} x2={x} y2={y} stroke="rgba(140,230,255,0.7)" strokeWidth={4} strokeDasharray="6 10" /></svg>
            <div style={{position: 'absolute', left: x - 80, top: y - 110, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(140,230,255,0.45), rgba(140,230,255,0) 65%)'}} />
            <Char k={US} acc="cia" eyes="shades" t={t + i} s={50} x={x} y={y - 30} bob={false} /></React.Fragment>; })}
        <Caption t={lt} t0={0.4} t1={6.8} text="On the ground, agents close in on the house" hl="close in" /></AbsoluteFill>; })()}
    {/* 6 · "GO." */}
    {shot === 6 && <AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #2a3456, #0a0f1c 75%)'}} />
      <President t={lt} talk={[[0.8, 2.6]]} x={960} y={560} s={320} mood="angry" />
      <Bubble t={lt} t0={0.8} t1={3.8} x={960} y={330} text="GO." size={110} />
      <Stamp t={lt} t0={0.1} t1={3.9} place="MAR-A-LAGO, FLORIDA" date="JANUARY 2, 2026" time="10:46 PM" />
    </AbsoluteFill>}
    {/* 7 · título de operación */}
    {shot === 7 && <AbsoluteFill style={{background: `rgba(${Math.floor(t * 3) % 2 ? 120 : 30},0,0,1)`}}>
      <Big text="OPERATION" y={330} size={90} sc={pop(lt, 0.1, 0.3)} />
      <Big text="ABSOLUTE RESOLVE" y={440} size={150} col="#ffd23f" sc={pop(lt, 0.3, 0.35)} />
      {lt > 2 && <Big text="IT BEGINS." y={680} size={80} col="#ff3b30" sc={pop(lt, 2, 0.3)} />}
    </AbsoluteFill>}
    {shot <= 5 && <DaysHUD t={t} d={day} />}
    {shot === 6 && <DaysHUD t={t} d={0 as any} />}
    {shot <= 5 && <Letterbox />}
    <Grade g={shot === 1 ? 'warm' : 'night'} />
    <Vignette />
  </AbsoluteFill>);
};

// ---------- G3V · ASALTO sobre la villa (40 s) ----------
const VW = 1300, VX = (W - VW) / 2, VY = 150, VS = VW / 800;
const vs = (x: number, y: number): [number, number] => [VX + x * VS, VY + y * VS];
export const G3V: React.FC<{t: number}> = ({t}) => {
  const zin = ip(t, [0, 2.6], [0.3, 1]) * ip(t, [16, 19.5], [1, 1.28]) * ip(t, [22.5, 26], [1, 1 / 1.28]); const alarm = t > 2;
  const shake = t > 6.5 && t < 16.5 && Math.floor(t * 7) % 3 === 0 ? Math.sin(t * 90) * 6 : 0;
  const [dx, dy] = vs(VILLA_DOOR[0], VILLA_DOOR[1] + 8);
  // francotiradores en las torres
  const snipers: [number, number, number][] = [[53, 205, 15.2], [753, 205, 16.2]];
  // guardias en el césped
  const guards: [number, number, number][] = [[150, 400, 9], [260, 440, 10], [330, 470, 11], [480, 470, 11.8], [560, 440, 12.6], [660, 400, 13.4], [220, 330, 14.2], [600, 330, 14.8]];
  // helicópteros: posición final sobre el césped
  const helis: [number, number][] = [[100, 430], [700, 430], [230, 480]];
  const sols: Sol[] = [];
  snipers.forEach(([x, y, td], i) => { const [sx, sy] = vs(x, y); const fall = ip(t, [td, td + 0.3], [0, 1], false); if (t < td + 1.2) sols.push({x: sx, y: sy, k: VE, dir: i ? -1 : 1, pose: 1, fall, flash: t > 2.4 && t < td && Math.floor(t * 6 + i * 2) % 3 === 0, sz: 38}); });
  guards.forEach(([x, y, td], i) => { const [sx, sy] = vs(x, y); const fall = ip(t, [td, td + 0.3], [0, 1], false); if (t > 3 && t < td + 1.2) sols.push({x: sx, y: sy, k: VE, dir: x < 400 ? -1 : 1, pose: 1, fall, flash: t > 6.5 && t < td && Math.floor(t * 12 + i) % 4 === 0, sz: 38, flag: i === 2 && t < td}); });
  // equipos de EE. UU. que bajan por cuerda
  helis.forEach(([hx, hy], hi) => { for (let j = 0; j < 4; j++) {
    const drop = ip(t, [5.2 + hi * 0.4 + j * 0.25, 5.7 + hi * 0.4 + j * 0.25], [0, 1]); if (drop <= 0) continue;
    const [bx, by] = vs(hx + (j - 1.5) * 26, hy - 30); const board = t > 26.5;
    if (board && t > 28 + j * 0.1) continue;
    const [gx, gy] = vs(VILLA_DOOR[0] + (hi - 1) * 120 + (j - 1.5) * 24, 460);
    const adv = ip(t, [15.5, 17.5], [0, 0.6]) * (1 - ip(t, [25.5, 27.5], [0, 1]));
    sols.push({x: bx + (gx - bx) * adv, y: by + (gy - by) * adv - (1 - drop) * 90, k: US, dir: hx < 400 ? 1 : -1, pose: (t > 15.5 && t < 17.5) || (t > 25.5 && t < 27.5) ? 0 : 1, flash: t > 6.5 && t < 15 && Math.floor(t * 14 + j * 3 + hi) % 4 === 0, sz: 38, flag: j === 0 && hi === 2});
  } });
  // los dos que entran
  const enter = [0, 1].map((i) => { const [sx, sy] = vs(VILLA_DOOR[0] + (i ? 30 : -30), 470); const u = ip(t, [17.5, 19.5], [0, 1]); const out = ip(t, [22.5, 25.5], [0, 1]);
    const inside = t > 19.6 && t < 22.5; const x = sx + (dx - sx) * (u - out * u), y = sy + (dy - sy) * (u - out * u) + out * 60;
    return {x, y, inside}; });
  enter.forEach((e, i) => { if (!e.inside && t > 17.5 && t < 28) sols.push({x: e.x + (t > 22.5 ? (i ? 44 : -44) : 0), y: e.y, k: US, dir: 1, pose: t < 19.5 || (t > 22.5 && t < 25.5) ? 0 : 1, sz: 40}); });
  const madPos = (() => { if (t < 22.5 || t > 28) return null; const out = ip(t, [22.5, 25.5], [0, 1]); const [hx, hy] = vs(helis[0][0], helis[0][1] - 30); const w2 = ip(t, [25.5, 27.8], [0, 1]); return [dx + (hx - dx) * w2, dy + out * 60 + (hy - dy - 60) * w2]; })();
  const heliY = (i: number) => ip(t, [3 + i * 0.5, 5.2 + i * 0.4], [-600, 0]) - ip(t, [29 + i * 0.3, 33 + i * 0.3], [0, 900]);
  return (<AbsoluteFill style={{background: '#0a1208'}}>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 60%, #22381f, #0a1208 80%)'}} />
    <div style={{position: 'absolute', inset: 0, transform: `translate(${shake}px, ${shake * 0.7}px) scale(${zin})`, transformOrigin: `${W / 2}px ${t > 15 ? VY + 372 * VS : VY + 300 * VS}px`}}>
      <div style={{position: 'absolute', left: VX, top: VY, width: VW, height: VW * 0.65}}><Villa t={t} alarm={alarm} lit={1} flash={t > 19.6 && t < 22.5 && Math.floor(t * 8) % 2 ? 1 : 0} /></div>
      {/* ventanas parpadeando dentro (disparos) */}
      {t > 19.6 && t < 22.5 && Math.floor(t * 9) % 3 === 0 && <div style={{position: 'absolute', left: vs(300, 190)[0], top: vs(300, 190)[1], width: 60 * VS, height: 50 * VS, background: 'rgba(255,240,180,0.9)', boxShadow: '0 0 40px #fff2a0'}} />}
      <Soldiers list={sols} t={t} />
      {madPos && <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H}}><CBall k={VE} size={56} x={madPos[0]} y={madPos[1] - 20} eyes="scared" sweat /></div>}
      {/* láseres de los francotiradores */}
      {t > 2.4 && t < 15.2 && <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>{snipers.map(([x, y], i) => { const [sx, sy] = vs(x, y - 20); const tx = W / 2 + Math.sin(t * 1.3 + i * 2) * 600, ty = -50 + Math.cos(t + i) * 120; return <line key={i} x1={sx} y1={sy} x2={tx} y2={ty} stroke="rgba(255,30,30,0.8)" strokeWidth={3} />; })}</svg>}
      {/* trazadoras */}
      {t > 6.5 && t < 15 && <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>{Array.from({length: 12}, (_, i) => { const g = guards[i % guards.length]; const hh = helis[i % 3]; const [ax, ay] = vs(hh[0], hh[1] - 40); const [bx, by] = vs(g[0], g[1] - 20); const u = (t * 2.6 + i * 0.11) % 1;
        return t < g[2] ? <line key={i} x1={ax + (bx - ax) * u} y1={ay + (by - ay) * u} x2={ax + (bx - ax) * Math.min(1, u + 0.06)} y2={ay + (by - ay) * Math.min(1, u + 0.06)} stroke={i % 2 ? '#ffe36b' : '#ff9a5a'} strokeWidth={4} strokeLinecap="round" /> : null; })}</svg>}
      {/* helicópteros alrededor de la casa */}
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {helis.map(([hx, hy], i) => { const [x, y] = vs(hx, hy - 70); return <g key={i}>
          {t > 5 && t < 8.5 && <line x1={x} y1={y + heliY(i)} x2={x} y2={y + 70 * VS} stroke="#d8c8a0" strokeWidth={4} />}
          <HeliMini x={x} y={y + heliY(i)} s={150} rot={i === 2 ? 0 : i ? -60 : 60} t={t + i} />
        </g>; })}
      </svg>
    </div>
    {t > 2.2 && t < 5.5 && <Big text="SNIPERS!" y={60} size={110} col="#ff3b30" sc={pop(t, 2.2, 0.3)} />}
    {t > 19.6 && t < 22.5 && <Big text="INSIDE..." y={60} size={100} col="#ffd23f" sc={pop(t, 19.6, 0.3)} />}
    {t > 23 && t < 26 && <Big text="GOT HIM!" y={60} size={110} col="#3ad16a" sc={pop(t, 23, 0.3)} />}
    <Flash t={t} t0={19.5} d={0.25} col="#ffe8b0" />
    <Stamp t={t} t0={0.3} t1={9} place="MADURO'S COMPOUND, CARACAS" date="JANUARY 3, 2026" time="2:01 AM" />
    <Caption t={t} t0={2.6} t1={5.2} text="Snipers open fire on the helicopters" hl="Snipers" />
    <Caption t={t} t0={5.4} t1={9.4} text="Delta Force fast-ropes down around the house" hl="Delta Force" />
    <Caption t={t} t0={9.6} t1={15.2} text="Heavy fire. The guards fall one by one" hl="one by one" />
    <Caption t={t} t0={15.6} t1={19.4} text="Two soldiers head for the door..." hl="the door" />
    <Caption t={t} t0={25.6} t1={29} text="Maduro is put on the helicopter" hl="Maduro" />
    <Caption t={t} t0={29.4} t1={33.6} text="Total time on the ground: minutes." />
    <Grade g="night" /><Vignette />
  </AbsoluteFill>);
};

// ---------- G4M · huida en el mapa (24 s) ----------
export const G4M: React.FC<{t: number}> = ({t}) => {
  const cam = camAt(t, [[0, HOUSE[0], HOUSE[1] - 10, 5.2], [10, HOUSE[0], HOUSE[1] - 40, 5.2], [16, IWO[0], IWO[1] + 10, 3.2], [24, IWO[0], IWO[1], 4]]);
  const route = (u: number) => [HOUSE[0] + (IWO[0] - HOUSE[0]) * u, HOUSE[1] + (IWO[1] - HOUSE[1]) * u];
  const prog = ip(t, [0, 6], [0, 0.18], false) + ip(t, [6, 7.4], [0, 0.02]) + ip(t, [10.4, 21], [0, 0.8]);
  const turn = ip(t, [6, 7.2], [0, 180]) - ip(t, [9.6, 10.6], [0, 180]); // dan la vuelta, disparan, y siguen
  const heading = (Math.atan2(IWO[1] - HOUSE[1], IWO[0] - HOUSE[0]) * 180) / Math.PI + 90;
  const us = [-22, 0, 22].map((o, i) => { const p = route(Math.min(1, prog - i * 0.01)); return [p[0] + o, p[1] + Math.abs(o) * 0.4]; });
  const veU = ip(t, [2, 6.5], [-0.1, 0.12], false); const veDown = t > 8.6; const veP = route(veU);
  const [vx, vy] = toS(veP, cam);
  const landed = t > 21;
  return (<AbsoluteFill>
    <WarMap t={t} cam={cam} night={0.55} />
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      {/* ruta trazada */}
      {(() => { const [ax, ay] = toS(HOUSE, cam); const [bx, by] = toS(route(Math.min(1, prog)), cam); return <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#ffd23f" strokeWidth={6} strokeDasharray="16 12" opacity={0.85} />; })()}
      {(() => { const [ix, iy] = toS(IWO, cam); return <Amphib x={ix} y={iy} len={55 * cam.s} ang={-10} wake={0.5} label="USS IWO JIMA" />; })()}
      {us.map((p, i) => { const [x, y] = toS(p, cam); return <HeliMini key={i} x={x} y={y} s={landed ? 30 * cam.s / 4 : 90} rot={heading + turn} t={t + i} />; })}
      {!veDown && t > 2 && <HeliMini x={vx} y={vy} s={90} rot={heading} t={t} col="#4a4a40" tail="#ffd21a" />}
      {veDown && t < 11 && <g opacity={ip(t, [9, 11], [1, 0])}><HeliMini x={vx + (t - 8.6) * 30} y={vy + (t - 8.6) * 50} s={90} rot={heading + (t - 8.6) * 200} t={t} col="#4a4a40" tail="#ffd21a" /></g>}
      {/* disparos venezolanos y respuesta */}
      {t > 3.4 && t < 6 && Array.from({length: 5}, (_, i) => { const [ux, uy] = toS(us[1], cam); const u = (t * 2.4 + i * 0.2) % 1; return <line key={i} x1={vx + (ux - vx) * u} y1={vy + (uy - vy) * u} x2={vx + (ux - vx) * Math.min(1, u + 0.07)} y2={vy + (uy - vy) * Math.min(1, u + 0.07)} stroke="#ffb030" strokeWidth={5} strokeLinecap="round" />; })}
      {t > 7.2 && t < 8.8 && us.map((p, i) => { const [ux, uy] = toS(p, cam); return Array.from({length: 3}, (_, j) => { const u = (t * 3 + j * 0.3 + i * 0.1) % 1; return <line key={i + '-' + j} x1={ux + (vx - ux) * u} y1={uy + (vy - uy) * u} x2={ux + (vx - ux) * Math.min(1, u + 0.08)} y2={uy + (vy - uy) * Math.min(1, u + 0.08)} stroke="#fff6a0" strokeWidth={5} strokeLinecap="round" />; }); })}
    </svg>
    <Boom x={vx} y={vy} r={130} t={t} t0={8.6} d={1.3} />
    {t > 4.4 && t < 6 && <Big text="HIT!" x={toS(us[1], cam)[0]} y={toS(us[1], cam)[1] - 170} size={80} col="#ff3b30" sc={pop(t, 4.4, 0.25)} />}
    {t > 6 && t < 7.6 && <Big text="TURN AROUND!" y={80} size={90} col="#ffd23f" sc={pop(t, 6, 0.3)} />}
    {t > 8.6 && t < 10.6 && <Big text="CHASER DOWN" y={80} size={90} col="#3ad16a" sc={pop(t, 8.6, 0.3)} />}
    <Flash t={t} t0={8.6} d={0.2} col="#ffd8a0" />
    <Stamp t={t} t0={0.3} t1={20} place="ESCAPE ROUTE" date="JANUARY 3, 2026" time={t < 12 ? '≈ 2:30 AM' : '3:29 AM'} />
    <Caption t={t} t0={0.4} t1={3.4} text="They take off toward the sea" hl="toward the sea" />
    <Caption t={t} t0={3.6} t1={6} text="A Venezuelan helicopter chases them" hl="chases them" />
    <Caption t={t} t0={6.2} t1={10.4} text="The helicopters turn around and fire back" hl="fire back" />
    <Caption t={t} t0={11} t1={20.6} text="3:29 AM: over the water, heading for the USS Iwo Jima" hl="USS Iwo Jima" />
    {landed && <Big text="LANDED" y={80} size={100} col="#3ad16a" sc={pop(t, 21, 0.3)} />}
    <Grade g="night" /><Vignette />
  </AbsoluteFill>);
};

// ---------- I3 · traslado a EE. UU. con buque dibujado (12 s) ----------
export const I3: React.FC<{t: number}> = ({t}) => {
  const cam = camAt(t, [[0, IWO[0], IWO[1] - 30, 3.2], [5, (IWO[0] + GTMO[0]) / 2, (IWO[1] + GTMO[1]) / 2 - 60, 2.2], [12, (GTMO[0] + NY[0]) / 2, (GTMO[1] + NY[1]) / 2, 1.5]]);
  const legs: [number[], number[], number, number, string, string][] = [[IWO, GTMO, 0.5, 4.5, 'helicopter', 'GUANTÁNAMO BAY'], [GTMO, NY, 5, 10.5, 'airplane', 'NEW YORK']];
  const [ix, iy] = toS(IWO, cam);
  return (<AbsoluteFill>
    <WarMap t={t} cam={cam} night={0.3} />
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><Amphib x={ix} y={iy} len={70 * cam.s} ang={-10} wake={0.4} label="USS IWO JIMA" /></svg>
    {legs.map(([a, b, t0, t1, ic, lb], i) => { const u = ip(t, [t0, t1], [0, 1]); const A = toS(a, cam) as [number, number], B = toS(b, cam) as [number, number];
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
