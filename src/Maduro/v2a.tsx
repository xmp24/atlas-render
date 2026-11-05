// V2 · primera mitad: intro, Casa Blanca, CIA, frontera, búsqueda, 2ª llamada, Delta Force, 30 días
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, font} from '../lib3';
import {Title3D, WHITE, GOLD} from '../ThumbsFinal';
import {Char} from './chars';
import {W, H, K, rnd, ip, pop, fade, LL, Ico, Big, Caption, Stamp, Bubble, NightSky, Moon, Sea, Caracas, Heli, Pin, Route, Vignette, Flash, Boom} from './lib';
import {US, VE, sq, WarMap, camAt, Soldiers, Grade, Letterbox, DaysHUD, OvalOffice, President, CallScreen, Black, SpeedLines} from './lib2';

const DC = LL(-77.04, 38.9), CCS = LL(-66.9, 10.5), BRAGG = LL(-79.0, 35.14), CUC = LL(-72.5, 7.9), PR = LL(-65.6, 18.25);

// ---------- la celda (intro y outro) ----------
export const Cell: React.FC<{t: number; bars?: number}> = ({t, bars = 1}) => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, #3a4250 0%, #161a22 70%, #07080b 100%)'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 780, bottom: 0, background: 'linear-gradient(180deg, #2a2e36, #121418)'}} />
    {/* foco que barre */}
    <div style={{position: 'absolute', left: 960 + Math.sin(t * 1.3) * 300 - 400, top: -200, width: 800, height: 1300, background: 'radial-gradient(ellipse at 50% 80%, rgba(255,250,220,0.22) 0%, rgba(255,250,220,0) 60%)', transform: `rotate(${Math.sin(t * 1.3) * 10}deg)`}} />
    <Char k={VE} acc="sash" eyes="scared" t={t} s={330} x={960} y={600} sweat label="NICOLÁS MADURO" />
    {/* barrotes que caen */}
    <div style={{position: 'absolute', left: 560, top: ip(bars, [0, 1], [-900, 140]), width: 800, height: 760}}>
      {Array.from({length: 9}, (_, i) => <div key={i} style={{position: 'absolute', left: i * 98, top: 0, width: 24, height: 760, borderRadius: 12, background: 'linear-gradient(90deg, #5a606a, #c8ced8 45%, #4a4f58)', border: `4px solid ${INK}`}} />)}
      <div style={{position: 'absolute', left: -20, right: -20, top: 0, height: 34, background: 'linear-gradient(180deg, #8a909a, #4a4f58)', border: `4px solid ${INK}`}} />
      <div style={{position: 'absolute', left: -20, right: -20, bottom: 0, height: 34, background: 'linear-gradient(180deg, #8a909a, #4a4f58)', border: `4px solid ${INK}`}} />
    </div>
    <Char k={US} acc="delta" eyes="angry" t={t} s={230} x={340} y={650} look={0.8} />
    <Char k={US} acc="delta" eyes="angry" t={t} s={230} x={1580} y={650} look={-0.8} />
    <Vignette a={0.7} />
  </AbsoluteFill>
);

// ---------- A · INTRO (8 s) ----------
export const A: React.FC<{t: number}> = ({t}) => {
  const bars = ip(t, [0.3, 0.75], [0, 1]); const shake = t > 0.75 && t < 1.05 ? Math.sin(t * 120) * 14 : 0;
  const rew = t > 6.2; // rebobinado
  return (<AbsoluteFill>
    <div style={{position: 'absolute', inset: 0, transform: `translate(${shake}px,${shake}px) scale(${ip(t, [0, 6], [1.08, 1], false)})`, filter: rew ? 'saturate(0.3) contrast(1.3)' : undefined}}><Cell t={t} bars={bars} /></div>
    <Stamp t={t} t0={1} t1={6} place="NEW YORK" date="JANUARY 2026" />
    {t > 2.2 && t < 6.4 && <div style={{position: 'absolute', inset: 0, transform: `scale(${pop(t, 2.2, 0.35)})`}}>
      <Title3D text="HOW THE US" x={W / 2} y={120} size={110} grad={WHITE} glow="rgba(255,255,255,0.5)" />
      <Title3D text="CAPTURED MADURO" x={W / 2} y={250} size={140} grad={GOLD} glow="rgba(255,190,40,0.8)" />
    </div>}
    {t > 4 && t < 6.4 && <Big text="But how did he end up here?" y={900} size={56} sc={pop(t, 4, 0.3)} />}
    {rew && <AbsoluteFill style={{background: 'repeating-linear-gradient(180deg, rgba(255,255,255,0.08) 0 3px, transparent 3px 9px)'}}><div style={{position: 'absolute', left: 60, top: 60, ...font, fontSize: 70, color: '#fff', textShadow: '0 4px 0 #000'}}>◀◀ REWIND</div></AbsoluteFill>}
    <Flash t={t} t0={0.75} d={0.2} />
    <div style={{position: 'absolute', right: 40, bottom: 26, ...font, fontSize: 22, color: 'rgba(255,255,255,0.6)'}}>Dramatization inspired by real events</div>
  </AbsoluteFill>);
};

// ---------- B · LA CASA BLANCA (14 s) ----------
export const B: React.FC<{t: number}> = ({t}) => {
  const cam = camAt(t, [[0, DC[0] + 120, DC[1] + 80, 1.15], [3.8, DC[0] + 40, DC[1] + 20, 1.6], [5.6, DC[0], DC[1], 6]]);
  const sx = (DC[0] - cam.cx) * cam.s + W / 2, sy = (DC[1] - cam.cy) * cam.s + H / 2;
  const inside = t > 5.9;
  return (<AbsoluteFill>
    {!inside && <>
      <WarMap t={t} cam={cam} night={0.35} tint="rgba(255,255,255,0.1)" />
      {t > 1.2 && <Pin x={sx} y={sy} t={t * 1.6} label={cam.s < 6 ? 'THE WHITE HOUSE' : undefined} />}
      {t > 1.2 && t < 4 && <div style={{position: 'absolute', left: sx + 40, top: sy + 20, ...font, fontSize: 40, color: '#fff', WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill', transform: `rotate(${Math.sin(t * 30) * 5}deg)`, opacity: Math.floor(t * 3) % 2 ? 1 : 0.5}}>📞 ring...</div>}
      <SpeedLines t={t} a={ip(t, [4, 4.6], [0, 1]) * ip(t, [5.4, 5.9], [1, 0])} />
    </>}
    <Black t={t} t0={5.95} d={0.4} />
    {inside && <OvalOffice t={t} zoom={ip(t, [6, 14], [1.12, 1.0], false)}>
      <President t={t} talk={[[7, 8.8], [9.2, 10.9], [11.3, 13.4]]} x={960} y={540} s={300} mood={t > 9 ? 'angry' : 'normal'} />
      <Bubble t={t} t0={7} t1={9} x={960} y={330} text="Find Maduro." size={52} />
      <Bubble t={t} t0={9.2} t1={11.1} x={960} y={330} text="Bring him to justice." size={52} />
      <Bubble t={t} t0={11.3} t1={13.8} x={960} y={330} text="Move. Now." size={64} />
    </OvalOffice>}
    {inside && <Stamp t={t} t0={6.2} t1={13.8} place="THE OVAL OFFICE" date="WASHINGTON, D.C." />}
    {inside && <Grade g="warm" />}
    <Vignette />
  </AbsoluteFill>);
};

// ---------- C · LA CIA EN VENEZUELA (46 s) ----------
const CITIES: [number, number, string][] = [[-66.9, 10.5, 'CARACAS'], [-71.64, 10.65, 'MARACAIBO'], [-68.0, 10.16, 'VALENCIA'], [-63.18, 10.45, 'CUMANÁ'], [-69.3, 10.07, 'BARQUISIMETO'], [-62.65, 8.3, 'CIUDAD GUAYANA'], [-67.6, 10.25, 'MARACAY']];
export const C: React.FC<{t: number}> = ({t}) => {
  const vc = LL(-66.5, 9.0);
  return (<AbsoluteFill style={{background: '#000'}}>
    {/* C1 · agentes que aparecen por Venezuela (0-8) */}
    {t < 8.3 && (() => { const cam = camAt(t, [[0, vc[0], vc[1] - 60, 2.6], [8, vc[0] - 40, vc[1] - 30, 3.4]]); const X = (p: number[]) => (p[0] - cam.cx) * cam.s + W / 2, Y = (p: number[]) => (p[1] - cam.cy) * cam.s + H / 2;
      return <AbsoluteFill>
        <WarMap t={t} cam={cam} night={0.45} tint="rgba(0,200,180,0.15)" />
        {CITIES.map(([lo, la, n], i) => { const p = LL(lo, la); const t0 = 1 + i * 0.75; if (t < t0) return null; const k = pop(t, t0, 0.35);
          return <React.Fragment key={n}>
            {t - t0 < 0.6 && <div style={{position: 'absolute', left: X(p) - 90, top: Y(p) - 140, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(220,220,220,0.8), rgba(220,220,220,0))', opacity: 1 - (t - t0) / 0.6, transform: `scale(${1 + (t - t0) * 1.5})`}} />}
            <div style={{position: 'absolute', left: 0, top: 0, transform: `scale(${k})`, transformOrigin: `${X(p)}px ${Y(p)}px`}}><Char k={US} acc="cia" eyes="shades" t={t + i} s={90} x={X(p)} y={Y(p) - 60} /></div>
            <div style={{position: 'absolute', left: X(p) - 60, top: Y(p) + 6, width: 120, textAlign: 'center', ...font, fontSize: 22, color: '#fff', WebkitTextStroke: `4px ${INK}`, paintOrder: 'stroke fill'}}>{n}</div>
          </React.Fragment>; })}
        <Caption t={t} t0={0.8} t1={8} text="Secret CIA agents slip into Venezuela" hl="CIA agents" />
        <Stamp t={t} t0={0.2} t1={8} place="VENEZUELA" date="AUGUST 2025" />
      </AbsoluteFill>; })()}
    {/* C2 · la frontera y el DNI falso (8-20) */}
    {t > 8 && t < 20.3 && (() => { const lt = t - 8; const lift = ip(lt, [6.6, 7.4], [0, -70]); const ax = ip(lt, [0.2, 2.2], [-200, 640]) + ip(lt, [7.4, 9], [0, 1500]);
      return <AbsoluteFill style={{opacity: ip(t, [8, 8.3], [0, 1])}}>
        <AbsoluteFill style={{background: 'linear-gradient(180deg, #f3b45a 0%, #e98a3a 45%, #7a4a2a 46%, #5a3a20 100%)'}} />
        {Array.from({length: 6}, (_, i) => <div key={i} style={{position: 'absolute', left: i * 340 - 40, top: 360 - (i % 2) * 40, width: 420, height: 160, background: '#a5562a', clipPath: 'polygon(0 100%, 40% 0, 100% 100%)', opacity: 0.6}} />)}
        <div style={{position: 'absolute', left: 0, right: 0, top: 640, height: 30, background: 'repeating-linear-gradient(90deg, #f2e6c8 0 60px, transparent 60px 120px)', opacity: 0.6}} />
        {/* caseta y barrera */}
        <div style={{position: 'absolute', left: 1080, top: 360, width: 220, height: 300, background: '#e9e2d0', border: `8px solid ${INK}`}}><div style={{position: 'absolute', left: 30, top: 40, width: 160, height: 90, background: '#9fd4ff', border: `5px solid ${INK}`}} /><div style={{position: 'absolute', left: -20, right: -20, top: -40, height: 46, background: '#c3100a', border: `6px solid ${INK}`}} /></div>
        <div style={{position: 'absolute', left: 1000, top: 560, width: 520, height: 30, background: 'repeating-linear-gradient(90deg, #c3100a 0 50px, #fff 50px 100px)', border: `5px solid ${INK}`, transformOrigin: '0 50%', transform: `rotate(${lift}deg)`}} />
        <div style={{position: 'absolute', left: 930, top: 220, padding: '8px 22px', background: '#1f3a8a', border: `6px solid ${INK}`, ...font, fontSize: 40, color: '#fff'}}>BORDER CONTROL</div>
        <Char k={VE} eyes={lt > 3 && lt < 6 ? 'angry' : 'normal'} t={t} s={170} x={1190} y={500} look={-0.8} label="BORDER GUARD" />
        <Char k={US} acc="cia" eyes="shades" t={t} s={170} x={ax} y={580} look={0.8} />
        {/* los demás pasan detrás */}
        {lt > 8.5 && [0, 1, 2, 3].map((i) => <Char key={i} k={US} acc="cia" eyes="shades" t={t + i} s={120} x={ip(lt, [8.5 + i * 0.5, 11.5 + i * 0.5], [-200, 2100], false)} y={600} look={0.8} bob={false} />)}
        {/* el DNI falso */}
        {lt > 2.6 && lt < 7 && <div style={{position: 'absolute', left: 420, top: 120, width: 640, height: 400, transform: `rotate(-4deg) scale(${pop(lt, 2.6, 0.35) * ip(lt, [6.6, 7], [1, 0], false)})`, borderRadius: 26, background: 'linear-gradient(135deg, #fff4c8, #f2d77a)', border: `8px solid ${INK}`, boxShadow: '0 20px 50px rgba(0,0,0,0.5)'}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 70, borderRadius: '18px 18px 0 0', background: 'linear-gradient(180deg, #ffd21a 0 33%, #1f4fbf 33% 66%, #d61f26 66%)'}} />
          <div style={{position: 'absolute', left: 30, top: 100, width: 200, height: 250, background: '#dfe8f2', border: `5px solid ${INK}`, overflow: 'hidden'}}><Char k={VE} eyes="normal" t={0} s={150} x={100} y={120} bob={false} /></div>
          <div style={{position: 'absolute', left: 260, top: 110, ...font, fontSize: 30, color: INK, lineHeight: 1.5}}>IDENTITY CARD<br />NAME: CARLOS RUIZ<br />JOB: TOURIST 🙂<br />NO. 00-000-000</div>
          {lt > 4.6 && <div style={{position: 'absolute', right: 30, bottom: 26, transform: `rotate(-14deg) scale(${pop(lt, 4.6, 0.25)})`, padding: '4px 20px', border: '8px solid #c3100a', borderRadius: 12, ...font, fontSize: 64, color: '#c3100a'}}>FAKE</div>}
        </div>}
        {lt > 5.6 && lt < 7.8 && <Bubble t={lt} t0={5.6} t1={7.6} x={1190} y={330} text="Welcome!" size={44} />}
        <Caption t={t} t0={8.6} t1={14} text="Others cross the border with fake IDs" hl="fake IDs" />
        <Caption t={t} t0={14.6} t1={20} text="One by one, they get in." />
        <Grade g="warm" />
      </AbsoluteFill>; })()}
    {/* C3 · búsqueda (20-36) */}
    {t > 20 && t < 36.3 && (() => { const lt = t - 20;
      const cam = camAt(lt, [[0, CCS[0] - 40, CCS[1] + 20, 3.6], [4, CCS[0] + 10, CCS[1], 4.6], [8.2, CCS[0], CCS[1], 4.6], [12, CCS[0] + 2, CCS[1] + 1, 5.6], [16, CCS[0] + 2, CCS[1] + 1, 6.2]]);
      const X = (x: number) => (x - cam.cx) * cam.s + W / 2, Y = (y: number) => (y - cam.cy) * cam.s + H / 2;
      const spots: [number, number][] = [[-30, -20], [26, -16], [-16, 22], [36, 16], [2, 1.2]];
      const roof = lt > 4 && lt < 8.2;
      return <AbsoluteFill style={{opacity: ip(t, [20, 20.3], [0, 1])}}>
        {!roof && <WarMap t={t} cam={cam} night={0.55} tint="rgba(0,200,180,0.15)" />}
        {!roof && lt < 4 && [0, 1, 2, 3].map((i) => { const a = (i / 4) * Math.PI * 2 + lt * 0.8; const r = 40 + Math.sin(lt * 2 + i) * 14; return <Char key={i} k={US} acc="cia" eyes="shades" t={t + i} s={80} x={X(CCS[0] + Math.cos(a) * r)} y={Y(CCS[1] + Math.sin(a) * r * 0.6)} bob={false} />; })}
        {/* azotea con prismáticos */}
        {roof && <AbsoluteFill>
          <NightSky glow="#204050" /><Caracas y={640} lights={1.1} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 820, bottom: 0, background: '#1a2230', borderTop: `8px solid ${INK}`}} />
          <Char k={US} acc="cia" eyes="shades" t={t} s={240} x={420} y={700} look={0.8} />
          <div style={{position: 'absolute', left: 520, top: 640, width: 1, height: 1}}><Ico name="binoculars" x={0} y={0} w={130} c="#2a2a2a" rot={-10} /></div>
          <div style={{position: 'absolute', left: ip(lt, [4, 8], [900, 1300]), top: 260, width: 420, height: 300, borderRadius: '50%', border: `10px solid ${INK}`, boxShadow: '0 0 0 2000px rgba(0,0,0,0.45)'}} />
          <Caption t={lt} t0={4.2} t1={8} text="Watching. Following. Waiting." />
        </AbsoluteFill>}
        {/* descartes */}
        {!roof && lt > 8.2 && lt < 12 && spots.slice(0, 4).map(([dx, dy], i) => { const t0 = 8.4 + i * 0.8; return <React.Fragment key={i}>
          <Pin x={X(CCS[0] + dx)} y={Y(CCS[1] + dy)} t={lt + i} col="#ffd23f" size={16} />
          {lt > t0 && <div style={{position: 'absolute', left: X(CCS[0] + dx) - 45, top: Y(CCS[1] + dy) - 70, ...font, fontSize: 90, color: '#ff3b30', WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill', transform: `scale(${pop(lt, t0, 0.25)})`}}>✕</div>}
        </React.Fragment>; })}
        {!roof && lt > 8.2 && lt < 12 && <Big text="NOT HERE..." y={150} size={80} col="#ff3b30" />}
        {/* localizado */}
        {!roof && lt > 12 && (() => { const px = X(CCS[0] + 2), py = Y(CCS[1] + 1.2); const k = ip(lt, [12, 13.2], [3, 1]);
          return <>
            <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><g transform={`translate(${px},${py}) scale(${k}) rotate(${lt * 40})`}>
              <circle r={110} fill="none" stroke="#ff3b30" strokeWidth={10} strokeDasharray="40 20" /><line x1={-160} y1={0} x2={-60} y2={0} stroke="#ff3b30" strokeWidth={10} /><line x1={160} y1={0} x2={60} y2={0} stroke="#ff3b30" strokeWidth={10} /><line x1={0} y1={-160} x2={0} y2={-60} stroke="#ff3b30" strokeWidth={10} /><line x1={0} y1={160} x2={0} y2={60} stroke="#ff3b30" strokeWidth={10} /></g></svg>
            <div style={{position: 'absolute', left: 0, top: 0, width: 1, height: 1}}><Ico name="castle" x={px} y={py} w={110} c="#e9e2d0" /></div>
            {lt > 13.3 && <Big text="TARGET LOCATED" y={140} size={110} col="#ff3b30" sc={pop(lt, 13.3, 0.3)} />}
          </>; })()}
        <Caption t={lt} t0={0.5} t1={4} text="They search every corner of Caracas" hl="every corner" />
        <Caption t={lt} t0={14} t1={16} text="Maduro's secret compound" hl="secret compound" />
      </AbsoluteFill>; })()}
    {/* C4 · la señal vuelve a Washington (36-46) */}
    {t > 36 && (() => { const lt = t - 36; const cam = camAt(lt, [[0, CCS[0], CCS[1], 4.6], [2.5, (CCS[0] + DC[0]) / 2, (CCS[1] + DC[1]) / 2, 1.5], [8, (CCS[0] + DC[0]) / 2, (CCS[1] + DC[1]) / 2, 1.6], [10, DC[0], DC[1], 5]]);
      const X = (p: number[]) => (p[0] - cam.cx) * cam.s + W / 2, Y = (p: number[]) => (p[1] - cam.cy) * cam.s + H / 2;
      return <AbsoluteFill style={{opacity: ip(t, [36, 36.3], [0, 1])}}>
        <WarMap t={t} cam={cam} night={0.45} />
        <Pin x={X(CCS)} y={Y(CCS)} t={t} label="TARGET" />
        <Route a={[X(CCS), Y(CCS)]} b={[X(DC), Y(DC)]} p={ip(lt, [2.6, 6], [0, 1])} col="#3ad16a" bend={0.2} w={7} />
        {lt > 6 && <Pin x={X(DC)} y={Y(DC)} t={t * 1.5} col="#3a8aff" label="WASHINGTON" />}
        {lt > 6 && <div style={{position: 'absolute', left: X(DC) + 30, top: Y(DC) + 30, ...font, fontSize: 40, color: '#fff', WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill', transform: `rotate(${Math.sin(t * 30) * 6}deg)`}}>📞 RING!</div>}
        <Caption t={lt} t0={1} t1={9.6} text="The location is sent straight to Washington" hl="Washington" />
      </AbsoluteFill>; })()}
    <Vignette />
  </AbsoluteFill>);
};

// ---------- D · SEGUNDA LLAMADA (12 s) ----------
export const D: React.FC<{t: number}> = ({t}) => (<AbsoluteFill>
  <OvalOffice t={t} zoom={ip(t, [0, 12], [1.0, 1.1], false)}>
    <President t={t} talk={[[6.6, 8.4], [8.8, 11.2]]} x={960} y={540} s={300} mood={t > 6.5 ? 'angry' : 'normal'} />
    <Bubble t={t} t0={6.6} t1={8.6} x={960} y={330} text="Then do it." size={56} />
    <Bubble t={t} t0={8.8} t1={11.6} x={960} y={330} text="You have 30 days." size={56} />
  </OvalOffice>
  <CallScreen t={t} t0={0.6} t1={6.4} label="CIA" x={1430} y={110}>
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse, #1d2a48, #0a0f1c)'}} />
    <Char k={US} acc="cia" eyes="shades" t={t} s={170} x={210} y={150} />
  </CallScreen>
  <Bubble t={t} t0={1.2} t1={6.2} x={1640} y={470} text="Sir, we found him." size={40} />
  {t > 9.5 && <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H}}><DaysHUD t={t} d={30} t0={9.5} /></div>}
  <Grade g="warm" />
  <Black t={t} t0={0.0} d={0.4} />
  <Vignette />
</AbsoluteFill>);

// ---------- E · DELTA FORCE RECIBE LA ORDEN (14 s) ----------
export const E: React.FC<{t: number}> = ({t}) => {
  const cam = camAt(t, [[0, DC[0], DC[1], 6], [1.6, DC[0], DC[1], 2.2], [3, BRAGG[0], BRAGG[1], 2.6], [4.3, BRAGG[0], BRAGG[1], 6]]);
  const X = (p: number[]) => (p[0] - cam.cx) * cam.s + W / 2, Y = (p: number[]) => (p[1] - cam.cy) * cam.s + H / 2;
  const inside = t > 4.5;
  return (<AbsoluteFill>
    {!inside && <><WarMap t={t} cam={cam} night={0.4} /><Pin x={X(DC)} y={Y(DC)} t={t} col="#3a8aff" size={14} /><Pin x={X(BRAGG)} y={Y(BRAGG)} t={t * 1.6} label="DELTA FORCE HQ" />
      <Route a={[X(DC), Y(DC)]} b={[X(BRAGG), Y(BRAGG)]} p={ip(t, [1.4, 3], [0, 1])} col="#3ad16a" bend={0.15} w={6} />
      <SpeedLines t={t} a={ip(t, [3.4, 3.8], [0, 1]) * ip(t, [4.2, 4.5], [1, 0])} /></>}
    <Black t={t} t0={4.5} d={0.4} />
    {inside && <AbsoluteFill style={{background: 'linear-gradient(180deg, #2a3324 0%, #1a2016 62%, #3a3a3a 62%, #222 100%)'}}>
      <div style={{position: 'absolute', left: 520, top: 90, width: 880, height: 400, border: `10px solid ${INK}`, borderRadius: 12, overflow: 'hidden', background: '#0a1a33'}}>
        <div style={{position: 'absolute', left: -520, top: -340, width: W, height: H, transform: 'scale(1)', transformOrigin: '0 0'}}><WarMap t={t} cam={{cx: CCS[0], cy: CCS[1], s: 4}} night={0.2} /></div>
        <div style={{position: 'absolute', left: 420, top: 180, width: 40, height: 40, borderRadius: '50%', border: '6px solid #ff3b30', boxShadow: '0 0 20px #ff3b30'}} />
        <div style={{position: 'absolute', left: 14, top: 10, ...font, fontSize: 26, color: '#ff3b30'}}>TARGET · CARACAS</div>
      </div>
      <Char k={US} acc="general" eyes={t > 9 ? 'angry' : 'normal'} t={t} s={260} x={960} y={660} label="COMMANDER" />
      <div style={{position: 'absolute', left: 1050, top: 580, width: 1, height: 1, transform: 'rotate(-20deg)'}}><Ico name="phone" x={0} y={0} w={110} c="#1d1d1d" /></div>
      {[0, 1, 2, 3, 4, 5].map((i) => <Char key={i} k={US} acc="delta" eyes="angry" t={t + i} s={150} x={180 + i * 110 + (i > 2 ? 1000 : 0)} y={ip(t, [9.5 + i * 0.12, 10 + i * 0.12], [790, 760])} look={i > 2 ? -0.6 : 0.6} />)}
      <Bubble t={t} t0={5.4} t1={8.6} x={960} y={420} text="Order received." size={50} />
      <Bubble t={t} t0={8.8} t1={13.6} x={960} y={420} text="We're moving out!" size={56} />
      <Stamp t={t} t0={4.8} t1={13.6} place="FORT BRAGG, NORTH CAROLINA" date="DELTA FORCE" />
      <DaysHUD t={t} d={30} />
      <Grade g="night" />
    </AbsoluteFill>}
    <Vignette />
  </AbsoluteFill>);
};

// ---------- F · 30 DÍAS DE MOVILIZACIÓN (50 s) ----------
export const F: React.FC<{t: number}> = ({t}) => {
  const day = Math.max(1, Math.round(ip(t, [0, 36], [29, 1], false)));
  const car = LL(-67, 15.5);
  const shot = t < 6 ? 1 : t < 11 ? 2 : t < 16.5 ? 3 : t < 22 ? 4 : t < 28 ? 5 : t < 33 ? 6 : t < 37 ? 7 : t < 43 ? 8 : 9;
  const lt = t - [0, 0, 6, 11, 16.5, 22, 28, 33, 37, 43][shot];
  return (<AbsoluteFill style={{background: '#000'}}>
    {/* 1 · flota entrando en el Caribe */}
    {shot === 1 && (() => { const cam = camAt(lt, [[0, car[0], car[1] - 30, 2.4], [6, car[0] - 20, car[1], 2.9]]); const ships = [[-64, 13.2], [-66, 13.6], [-68, 13.4], [-70, 13.8], [-62.5, 14.2], [-67, 14.6], [-65, 15], [-69, 15.2]];
      const tok = ships.map(([lo, la], i) => { const p = LL(lo, la); const u = ip(lt, [0.3 + i * 0.25, 3.5 + i * 0.25], [0, 1]); return {x: p[0] + (1 - u) * 160, y: p[1] - (1 - u) * 90, k: US, icon: 'battleship', size: 24, trail: [p[0] + 160, p[1] - 90] as [number, number]}; });
      const fp = LL(-67.5, 16.6); const uf = ip(lt, [0, 3], [0, 1]);
      tok.push({x: fp[0] + (1 - uf) * 200, y: fp[1] - (1 - uf) * 110, k: US, icon: 'carrier', size: 40, label: 'USS GERALD R. FORD'} as any);
      return <><WarMap t={t} cam={cam} night={0.3} tokens={tok} /><Caption t={lt} t0={0.6} t1={5.8} text="An aircraft carrier and 11 warships move in" hl="11 warships" /></>; })()}
    {/* 2 · portaaviones: despegan cazas */}
    {shot === 2 && <AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #7ab8f0 0%, #cfe6ff 60%)'}} />
      <Sea t={t} y={700} speed={160} col="#1d5a9a" />
      <div style={{position: 'absolute', left: ip(lt, [0, 5], [200, 120], false), top: 560, width: 1500, height: 150}}>
        <div style={{position: 'absolute', left: 0, top: 30, width: 1500, height: 40, background: '#6a737e', border: `6px solid ${INK}`}} />
        <div style={{position: 'absolute', left: 60, top: 70, width: 1380, height: 80, background: 'linear-gradient(180deg, #8a939e, #4a525c)', border: `6px solid ${INK}`, clipPath: 'polygon(0 0, 100% 0, 96% 100%, 4% 100%)'}} />
        <div style={{position: 'absolute', left: 1000, top: -110, width: 120, height: 145, background: '#7a838e', border: `6px solid ${INK}`}}><div style={{position: 'absolute', left: 50, top: -60, width: 8, height: 60, background: INK}} /></div>
        <div style={{position: 'absolute', left: 30, top: 80, ...font, fontSize: 40, color: '#fff'}}>78</div>
      </div>
      {[0, 1, 2].map((i) => { const u = ip(lt, [0.8 + i * 1.3, 2.6 + i * 1.3], [0, 1], false); if (u <= 0) return <div key={i} style={{position: 'absolute', left: 0, top: 0}}><Ico name="jet-fighter" x={600 + i * 160} y={570} w={110} c="#5a6470" rot={90} /></div>; if (u >= 1) return null;
        return <div key={i}><div style={{position: 'absolute', left: 600 + u * 1500 - 300, top: 560 - u * u * 420, width: 300, height: 8, borderRadius: 4, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.8))', transform: `rotate(${-u * 20}deg)`}} /><Ico name="jet-fighter" x={600 + u * 1500} y={570 - u * u * 420} w={110} c="#5a6470" rot={90 - u * 20} /></div>; })}
      <Caption t={lt} t0={0.4} t1={4.8} text="F-35s and F-22s on standby" hl="F-35s" />
    </AbsoluteFill>}
    {/* 3 · Puerto Rico: cazas y tropas reuniéndose (mapa con soldados del canal) */}
    {shot === 3 && (() => { const cam = camAt(lt, [[0, PR[0], PR[1], 6], [5.5, PR[0] + 5, PR[1] + 2, 7.5]]);
      const w = {sq: [sq(US, [[PR[0] - 60, PR[1] + 10], [PR[0] - 8, PR[1]]], 0.3, 4, 6), sq(US, [[PR[0] + 50, PR[1] + 14], [PR[0] + 10, PR[1] + 2]], 0.6, 4.2, 6), sq(US, [[PR[0] - 30, PR[1] - 20], [PR[0] - 2, PR[1] - 6]], 0.9, 4.5, 5)], cities: [['PUERTO RICO', PR[0], PR[1] + 30, 0, 0, 99]],
        ext: {jets: [[0.2, 3.4, PR[0] - 400, PR[1] - 300, PR[0], PR[1] - 10, US, 3], [1.2, 4.6, PR[0] + 400, PR[1] - 260, PR[0] + 20, PR[1] - 14, US, 3]]}};
      return <><WarMap t={lt} cam={cam} w={w} night={0.2} /><Caption t={lt} t0={0.5} t1={5.3} text="Troops gather in Puerto Rico" hl="Puerto Rico" /></>; })()}
    {/* 4 · helicópteros en cubierta, rotores arrancando */}
    {shot === 4 && <AbsoluteFill>
      <NightSky glow="#2a3a5a" /><Sea t={t} y={760} speed={120} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 650, height: 120, background: 'linear-gradient(180deg, #5a636e, #33393f)', borderTop: `8px solid ${INK}`}} />
      {[0, 1, 2, 3].map((i) => <Heli key={i} t={t * ip(lt, [1, 4], [0.05, 1]) + i} w={380} x={280 + i * 440} y={600} tilt={0} />)}
      {[0, 1, 2, 3, 4, 5].map((i) => <Char key={i} k={US} acc="delta" eyes="angry" t={t + i} s={90} x={ip(lt, [0.5 + i * 0.2, 3 + i * 0.2], [-100, 240 + i * 270])} y={690} look={0.6} bob={false} />)}
      <Caption t={lt} t0={0.5} t1={5.3} text="The helicopters of the 160th get ready" hl="160th" />
    </AbsoluteFill>}
    {/* 5 · mapa: tropas embarcando hacia los barcos */}
    {shot === 5 && (() => { const ship = LL(-66.5, 13.6); const cam = camAt(lt, [[0, (PR[0] + ship[0]) / 2, (PR[1] + ship[1]) / 2, 3.2], [6, ship[0], ship[1], 4.2]]);
      const w = {sq: [sq(US, [[PR[0], PR[1]], [ship[0] - 10, ship[1] - 10]], 0.2, 4.5, 6), sq(US, [[PR[0] + 20, PR[1] + 5], [ship[0] + 15, ship[1] - 6]], 0.6, 4.9, 6), sq(US, [[PR[0] - 20, PR[1] + 3], [ship[0] - 25, ship[1] + 4]], 1, 5.3, 5, {kind: 'tank', n: 2})]};
      return <><WarMap t={lt} cam={cam} w={w} night={0.3} tokens={[{x: ship[0], y: ship[1], k: US, icon: 'carrier', size: 34, label: 'USS IWO JIMA'}]} /><Caption t={lt} t0={0.5} t1={5.6} text="Delta Force moves onto the USS Iwo Jima" hl="USS Iwo Jima" /></>; })()}
    {/* 6 · mal tiempo */}
    {shot === 6 && <AbsoluteFill>
      <NightSky glow="#20304a" /><Caracas y={720} lights={0.8} />
      {Array.from({length: 9}, (_, i) => <div key={i} style={{position: 'absolute', left: rnd(i) * 1600 - 200 + Math.sin(t + i) * 30, top: 40 + (i % 4) * 90, width: 700, height: 220, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(60,70,90,0.95) 0%, rgba(40,50,70,0.8) 50%, rgba(30,40,60,0) 72%)', filter: 'blur(6px)'}} />)}
      {Array.from({length: 40}, (_, i) => <div key={i} style={{position: 'absolute', left: (rnd(i) * W + t * 60) % W, top: (rnd(i + 20) * H + t * 900) % H, width: 3, height: 34, background: 'rgba(180,200,230,0.5)', transform: 'rotate(12deg)'}} />)}
      {lt > 0.3 && <Big text="DELAYED: BAD WEATHER" y={420} size={100} col="#ff3b30" rot={-4} sc={pop(lt, 0.3, 0.3)} />}
      <Flash t={lt} t0={2.4} d={0.25} col="#dfe8ff" />
    </AbsoluteFill>}
    {/* 7 · cielo despejado */}
    {shot === 7 && <AbsoluteFill>
      <NightSky glow="#20304a" /><Moon x={1500} y={200} r={70} /><Caracas y={720} lights={0.8} />
      {Array.from({length: 9}, (_, i) => <div key={i} style={{position: 'absolute', left: rnd(i) * 1600 - 200 + (i % 2 ? 1 : -1) * ip(lt, [0, 2.5], [0, 1500]), top: 40 + (i % 4) * 90, width: 700, height: 220, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(60,70,90,0.95) 0%, rgba(30,40,60,0) 72%)', filter: 'blur(6px)'}} />)}
      {lt > 1.6 && <Big text="CLEAR SKIES" y={420} size={120} col="#3ad16a" sc={pop(lt, 1.6, 0.3)} />}
    </AbsoluteFill>}
    {/* 8 · "GO." */}
    {shot === 8 && <AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #2a3456, #0a0f1c 75%)'}} />
      <President t={lt} talk={[[1, 3]]} x={960} y={560} s={320} mood="angry" />
      <Bubble t={lt} t0={1} t1={5.6} x={960} y={330} text="GO." size={110} />
      <Stamp t={lt} t0={0.2} t1={5.8} place="MAR-A-LAGO, FLORIDA" date="JANUARY 2, 2026" time="10:46 PM" />
    </AbsoluteFill>}
    {/* 9 · título de operación + alarma */}
    {shot === 9 && <AbsoluteFill style={{background: `rgba(${Math.floor(t * 3) % 2 ? 120 : 30},0,0,1)`}}>
      <Big text="OPERATION" y={330} size={90} sc={pop(lt, 0.2, 0.3)} />
      <Big text="ABSOLUTE RESOLVE" y={440} size={150} col="#ffd23f" sc={pop(lt, 0.5, 0.35)} />
      {lt > 2.5 && <Big text="IT BEGINS." y={680} size={80} col="#ff3b30" sc={pop(lt, 2.5, 0.3)} />}
    </AbsoluteFill>}
    {shot <= 7 && <DaysHUD t={t} d={day} />}
    {shot === 8 && <DaysHUD t={t} d={0 as any} />}
    {shot <= 7 && <Letterbox />}
    <Grade g={shot === 2 ? 'warm' : 'night'} />
    <Vignette />
  </AbsoluteFill>);
};
