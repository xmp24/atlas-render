// Escenas 1-6: gancho, CIA, despliegue, ensayo, Mar-a-Lago, mal tiempo
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, font} from '../lib3';
import {Title3D, WHITE, GOLD} from '../ThumbsFinal';
import {Char} from './chars';
import {W, H, K, rnd, ip, pop, fade, LL, Ico, Big, Caption, Stamp, Bubble, Chapter, Counter, NightSky, Moon, Sea, Caracas, Heli, MapCam, Pin, Route, Vignette, Flash} from './lib';

const US = K('US'), VE = K('VE');
const CCS = LL(-66.9, 10.5), PR = LL(-65.6, 18.25), PB = LL(-80.04, 26.68);

// ---------- 1 · GANCHO (10 s) ----------
export const S1: React.FC<{t: number}> = ({t}) => {
  const z = ip(t, [0, 10], [1, 1.12], false);
  return (<AbsoluteFill>
    <div style={{position: 'absolute', inset: 0, transform: `scale(${z})`, transformOrigin: '50% 70%'}}>
      <NightSky glow="#2a2440" /><Moon x={1500} y={190} r={70} />
      <Caracas y={700} />
      {[0, 1, 2].map((i) => <Heli key={i} t={t} dark w={260 - i * 40} x={ip(t, [0, 10], [2100 + i * 260, 300 + i * 300], false)} y={330 + i * 70 + Math.sin(t * 1.5 + i) * 8} tilt={8} />)}
    </div>
    <Stamp t={t} t0={0.4} t1={5.6} place="CARACAS, VENEZUELA" date="JANUARY 3, 2026" time="2:01 AM" />
    {t > 5.2 && <div style={{transform: `scale(${pop(t, 5.2, 0.4)})`, position: 'absolute', inset: 0}}>
      <Title3D text="HOW THE US" x={W / 2} y={330} size={130} grad={WHITE} glow="rgba(255,255,255,0.5)" />
      <Title3D text="CAPTURED MADURO" x={W / 2} y={480} size={150} grad={GOLD} glow="rgba(255,190,40,0.8)" />
    </div>}
    {t > 6 && <div style={{position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', ...font, fontSize: 36, color: '#cfd8e8', opacity: ip(t, [6, 6.6], [0, 1])}}>The full operation, step by step</div>}
    <div style={{position: 'absolute', right: 40, bottom: 26, ...font, fontSize: 22, color: 'rgba(255,255,255,0.6)'}}>Animated dramatization based on public reports</div>
    <Vignette />
    <Flash t={t} t0={5.2} d={0.3} />
  </AbsoluteFill>);
};

// ---------- 2 · CIA (26 s) ----------
export const S2: React.FC<{t: number}> = ({t}) => {
  const mapA = fade(t, 0, 10.4, 0.5);
  const s = ip(t, [2.5, 8], [2.4, 3.8]); const cx = ip(t, [2.5, 8], [CCS[0] - 60, CCS[0]]), cy = ip(t, [2.5, 8], [CCS[1] - 260, CCS[1] - 20]);
  const sx = (p: number[]) => (p[0] - cx) * s + W / 2, sy = (p: number[]) => (p[1] - cy) * s + H / 2;
  const items = ['DAILY ROUTINE', 'WHERE HE SLEEPS', 'HIS SECURITY', 'EVEN HIS PETS'];
  return (<AbsoluteFill style={{background: '#0a0f1c'}}>
    {t < 10.6 && <div style={{position: 'absolute', inset: 0, opacity: mapA}}>
      <MapCam cx={cx} cy={cy} s={s} night={0.45} />
      <Pin x={sx(CCS)} y={sy(CCS)} t={t} label="CARACAS" />
      {/* el equipo entra desde el mar */}
      {t > 4 && <>
        <Route a={[sx(CCS) + 260, sy(CCS) - 300]} b={[sx(CCS) + 30, sy(CCS) - 30]} p={ip(t, [4, 6.5], [0, 1])} col="#9fd8ff" bend={0.15} w={5} />
        <Char k={US} acc="cia" eyes="shades" t={t} s={110} x={ip(t, [4, 6.5], [sx(CCS) + 260, sx(CCS) + 120])} y={ip(t, [4, 6.5], [sy(CCS) - 300, sy(CCS) - 110])} label="CIA TEAM" />
      </>}
      <Caption t={t} t0={3} t1={10} text="A small CIA team quietly enters Venezuela" hl="CIA team" />
    </div>}
    <Chapter t={t} t0={0} t1={2.6} top="AUGUST 2025" main="5 MONTHS EARLIER" />
    {/* expediente */}
    {t > 10.2 && <AbsoluteFill style={{opacity: ip(t, [10.2, 10.8], [0, 1]), background: 'radial-gradient(ellipse at 50% 40%, #3a2a1a 0%, #1a120a 70%, #0a0604 100%)'}}>
      <div style={{position: 'absolute', left: 300, top: ip(t, [10.2, 11.2], [1200, 120]), width: 1320, height: 820, transform: 'rotate(-2deg)', background: '#d9c48f', borderRadius: 14, border: `6px solid ${INK}`, boxShadow: '0 30px 60px rgba(0,0,0,0.6)'}}>
        <div style={{position: 'absolute', left: 40, top: 30, ...font, fontSize: 38, color: '#5a3a10'}}>SUBJECT FILE</div>
        <div style={{position: 'absolute', left: 40, top: 80, ...font, fontSize: 72, color: INK}}>NICOLÁS MADURO</div>
        <div style={{position: 'absolute', left: 60, top: 200, width: 360, height: 420, background: '#f4ead2', border: `5px solid ${INK}`, transform: 'rotate(-3deg)'}}>
          <Char k={VE} acc="sash" eyes="normal" t={t} s={240} x={180} y={200} bob={false} />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 14, textAlign: 'center', ...font, fontSize: 30, color: INK}}>PRESIDENT OF VENEZUELA</div>
        </div>
        {items.map((it, i) => { const t0 = 12.5 + i * 1.6; return (
          <div key={it} style={{position: 'absolute', left: 500, top: 230 + i * 100, display: 'flex', alignItems: 'center', gap: 24, opacity: ip(t, [t0, t0 + 0.3], [0, 1])}}>
            <div style={{width: 64, height: 64, border: `5px solid ${INK}`, borderRadius: 10, background: '#f4ead2', position: 'relative'}}>{t > t0 + 0.4 && <div style={{position: 'absolute', left: 6, top: -16, ...font, fontSize: 80, color: '#1f8a3a', transform: `scale(${pop(t, t0 + 0.4, 0.25)})`}}>✓</div>}</div>
            <div style={{...font, fontSize: 56, color: INK}}>{it}</div>
          </div>); })}
        {t > 19.5 && <div style={{position: 'absolute', right: 60, top: 40, transform: `rotate(12deg) scale(${pop(t, 19.5, 0.25) * (1 + ip(t, [19.5, 19.7], [1.2, 0]))})`, padding: '8px 28px', border: '8px solid #c3100a', borderRadius: 14, ...font, fontSize: 70, color: '#c3100a'}}>TRACKED</div>}
      </div>
      <Caption t={t} t0={11.5} t1={19} text="For months, they studied his every move" />
      <Caption t={t} t0={19.5} t1={25.6} text="A source close to Maduro could pinpoint his location" hl="pinpoint his location" />
    </AbsoluteFill>}
    <Vignette />
  </AbsoluteFill>);
};

// ---------- 3 · DESPLIEGUE (30 s) ----------
export const S3: React.FC<{t: number}> = ({t}) => {
  const c = LL(-67, 15.5); const s = ip(t, [0, 30], [2.7, 3.0], false);
  const sx = (p: number[]) => (p[0] - c[0]) * s + W / 2, sy = (p: number[]) => (p[1] - c[1]) * s + H / 2;
  const ships = [[-64, 13.2], [-66, 13.6], [-68, 13.4], [-70, 13.8], [-62.5, 14.2], [-67, 14.6], [-65, 15], [-69, 15.2], [-71.5, 14.6], [-63.5, 15.6], [-66.5, 16.2]];
  return (<AbsoluteFill>
    <MapCam cx={c[0]} cy={c[1]} s={s} night={0.3} />
    <Pin x={sx(CCS)} y={sy(CCS)} t={t} label="CARACAS" />
    {/* portaaviones */}
    {t > 3 && (() => { const p = LL(-67.5, 16.6); const k = ip(t, [3, 6], [0, 1]); return <>
      <div style={{position: 'absolute', left: sx(p) + (1 - k) * 600 - 140, top: sy(p) - 30 - (1 - k) * 260, width: 380, height: 18, borderRadius: 9, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.4))', opacity: k < 1 ? 0.8 : 0}} />
      <Ico name="carrier" x={sx(p) + (1 - k) * 600} y={sy(p) - (1 - k) * 260} w={150} c="#c8d2e0" glow="#9fd8ff" />
      {k >= 1 && <div style={{position: 'absolute', left: sx(p) - 140, top: sy(p) + 60, ...font, fontSize: 28, color: '#fff', WebkitTextStroke: `5px ${INK}`, paintOrder: 'stroke fill', whiteSpace: 'nowrap'}}>USS GERALD R. FORD</div>}
    </>; })()}
    {ships.map(([lo, la], i) => { const t0 = 7 + i * 0.35; if (t < t0) return null; const p = LL(lo, la); const k = ip(t, [t0, t0 + 1.6], [0, 1]);
      return <Ico key={i} name="battleship" x={sx(p) + (1 - k) * 500} y={sy(p) - (1 - k) * 220} w={70} c="#b8c4d4" />; })}
    {t > 11 && [0, 1, 2, 3, 4, 5].map((i) => { const k = ip(t, [11 + i * 0.15, 12.5 + i * 0.15], [0, 1]); return <Ico key={i} name="jet-fighter" x={sx(PR) - 80 + (i % 3) * 60 + (1 - k) * 400} y={sy(PR) - 40 + Math.floor(i / 3) * 50 - (1 - k) * 300} w={46} c="#dfe6f0" rot={200} />; })}
    {t > 11 && <Pin x={sx(PR)} y={sy(PR)} t={t} col="#3a8aff" label="PUERTO RICO" size={16} />}
    <div style={{position: 'absolute', right: 50, top: 60, display: 'flex', flexDirection: 'column', gap: 16}}>
      <div style={{position: 'relative', width: 360, height: 92}}><Counter t={t} t0={4} to={1} x={0} y={0} label="AIRCRAFT CARRIER" icon="carrier" d={0.3} /></div>
      <div style={{position: 'relative', width: 360, height: 92}}><Counter t={t} t0={7.5} to={11} x={0} y={0} label="WARSHIPS" icon="battleship" /></div>
      <div style={{position: 'relative', width: 360, height: 92}}><Counter t={t} t0={11.5} to={12} x={0} y={0} label="F-35 FIGHTERS" icon="jet-fighter" suffix="+" /></div>
      <div style={{position: 'relative', width: 360, height: 92}}><Counter t={t} t0={14.5} to={15000} x={0} y={0} label="TROOPS" icon="helicopter" suffix="+" d={1.6} /></div>
    </div>
    <Caption t={t} t0={1} t1={17.5} text="The US moves a massive force into the Caribbean" hl="massive force" />
    {t > 18.5 && <div style={{position: 'absolute', left: W / 2, top: 420, transform: `translate(-50%,-50%) rotate(-8deg) scale(${pop(t, 18.5, 0.25) * (1 + ip(t, [18.5, 18.75], [1.4, 0]))})`, padding: '14px 40px', border: '10px solid #ff3b30', borderRadius: 18, background: 'rgba(0,0,0,0.35)', textAlign: 'center'}}>
      <div style={{...font, fontSize: 40, color: '#fff'}}>OFFICIAL REASON:</div><div style={{...font, fontSize: 84, color: '#ff3b30', WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill'}}>ANTI-DRUG OPERATIONS</div>
    </div>}
    {t > 23 && <Char k={VE} t={t} s={170} x={sx(CCS) - 300} y={sy(CCS) + 90} eyes="scared" look={0.6} sweat label="VENEZUELA" op={ip(t, [23, 23.4], [0, 1])} />}
    {t > 23.5 && <Bubble t={t} t0={23.6} t1={29.8} x={sx(CCS) - 300} y={sy(CCS) - 30} text="...anti-drug?" size={42} />}
    <Vignette />
  </AbsoluteFill>);
};

// ---------- 4 · ENSAYO (24 s) ----------
const ROOMS = [[0, 0, 300, 220], [300, 0, 260, 220], [560, 0, 300, 220], [0, 220, 420, 240], [420, 220, 220, 240], [640, 220, 220, 240]];
const PATH: [number, number][] = [[-120, 420], [60, 420], [60, 340], [210, 340], [210, 120], [430, 120], [430, 330], [530, 330], [700, 330], [700, 110]];
const along = (u: number): [number, number] => { const L: number[] = [0]; for (let i = 1; i < PATH.length; i++) L.push(L[i - 1] + Math.hypot(PATH[i][0] - PATH[i - 1][0], PATH[i][1] - PATH[i - 1][1]));
  const d = Math.max(0, Math.min(1, u)) * L[L.length - 1]; let i = 1; while (i < L.length - 1 && L[i] < d) i++; const f = (d - L[i - 1]) / (L[i] - L[i - 1] || 1);
  return [PATH[i - 1][0] + (PATH[i][0] - PATH[i - 1][0]) * f, PATH[i - 1][1] + (PATH[i][1] - PATH[i - 1][1]) * f]; };
export const S4: React.FC<{t: number}> = ({t}) => {
  const draw = ip(t, [0.5, 4.5], [0, 1]); const ox = 530, oy = 260;
  const reps = [[6, 10.5], [10.8, 14.2], [14.4, 17.2], [17.4, 19.6]];
  return (<AbsoluteFill style={{background: '#0d3a73'}}>
    <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.08) 2px, transparent 2px)', backgroundSize: '60px 60px'}} />
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      <g transform={`translate(${ox},${oy})`}>
        {ROOMS.map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} pathLength={1} fill="none" stroke="#e8f4ff" strokeWidth={6} strokeDasharray={`${Math.max(0, Math.min(1, draw * 1.6 - i * 0.12))} 1`} />)}
        {draw > 0.95 && <><rect x={-6} y={380} width={12} height={70} fill="#ffd23f" /><text x={-40} y={480} fill="#ffd23f" style={{...font, fontSize: 26}}>STEEL DOOR</text>
          <rect x={690} y={-6} width={80} height={12} fill="#ff3b30" /><text x={640} y={-20} fill="#ff3b30" style={{...font, fontSize: 26}}>SAFE ROOM</text></>}
      </g>
    </svg>
    {reps.map(([a, b], r) => { if (t < a || t > b) return null; const u = ip(t, [a + 0.2, b - 0.3], [0, 1], false);
      return [0, 1, 2, 3].map((i) => { const [x, y] = along(u - i * 0.035); return <Char key={r + '-' + i} k={US} acc="delta" eyes="angry" t={t} s={54} x={ox + x} y={oy + y} bob={false} />; }); })}
    {reps.map(([a], r) => t > a && t < a + 1.2 ? <div key={r} style={{position: 'absolute', left: ox + 40, top: oy + 350, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, #fff6c0, rgba(255,180,40,0))', opacity: 1 - (t - a) / 1.2}} /> : null)}
    <div style={{position: 'absolute', right: 80, top: 70, textAlign: 'center'}}>
      <div style={{position: 'relative', width: 150, height: 150}}><Ico name="stopwatch" x={75} y={75} w={140} c="#ffffff" rot={Math.sin(t * 20) * 3} /></div>
    </div>
    {t > 6 && <div style={{position: 'absolute', left: 80, top: 70, ...font, fontSize: 64, color: '#ffd23f', WebkitTextStroke: `8px ${INK}`, paintOrder: 'stroke fill'}}>REHEARSAL</div>}
    <Caption t={t} t0={0.6} t1={6} text="Delta Force builds an exact replica of the house" hl="exact replica" />
    <Caption t={t} t0={6.5} t1={14} text="They practice the entry again..." />
    <Caption t={t} t0={14.3} t1={19.8} text="...and again, and again." />
    {t > 20 && <Big text="READY." y={460} size={150} col="#3ad16a" sc={pop(t, 20, 0.3)} />}
    <Vignette a={0.4} />
  </AbsoluteFill>);
};

// ---------- 5 · MAR-A-LAGO: zoom, edificio en 3D, ventana, llamada (32 s) ----------
const Mansion: React.FC<{lit?: number}> = ({lit = 1}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 1400, height: 620}}>
    {/* alas */}
    {[0, 900].map((x, i) => <div key={i} style={{position: 'absolute', left: x, top: 260, width: 500, height: 360, background: 'linear-gradient(180deg, #f1e3c4, #d9c49a)', border: `6px solid ${INK}`}}>
      <div style={{position: 'absolute', left: -20, right: -20, top: -70, height: 80, background: 'linear-gradient(180deg, #c8582f, #8f3518)', clipPath: 'polygon(6% 0,94% 0,100% 100%,0 100%)', borderBottom: `6px solid ${INK}`}} />
      {[0, 1, 2, 3].map((c) => [0, 1].map((r) => <div key={c + '-' + r} style={{position: 'absolute', left: 40 + c * 115, top: 60 + r * 150, width: 70, height: 100, borderRadius: '35px 35px 4px 4px', border: `5px solid ${INK}`, background: rnd(c * 3 + r + i * 9) < 0.6 * lit ? 'radial-gradient(circle at 50% 70%, #fff3b0, #ffb84a)' : '#2a3550'}} />))}
    </div>)}
    {/* cuerpo central */}
    <div style={{position: 'absolute', left: 420, top: 180, width: 560, height: 440, background: 'linear-gradient(180deg, #f6ead0, #ddc89e)', border: `6px solid ${INK}`}}>
      <div style={{position: 'absolute', left: -30, right: -30, top: -80, height: 90, background: 'linear-gradient(180deg, #d0613a, #93391b)', clipPath: 'polygon(8% 0,92% 0,100% 100%,0 100%)', borderBottom: `6px solid ${INK}`}} />
      {[0, 1, 2].map((c) => <div key={c} style={{position: 'absolute', left: 60 + c * 170, top: 230, width: 100, height: 200, borderRadius: '50px 50px 4px 4px', border: `5px solid ${INK}`, background: 'radial-gradient(circle at 50% 70%, #fff3b0, #ffb84a)'}} />)}
      {/* ventana principal (la de la sala de crisis) */}
      <div style={{position: 'absolute', left: 230, top: 60, width: 100, height: 120, borderRadius: '50px 50px 4px 4px', border: `6px solid ${INK}`, background: 'radial-gradient(circle at 50% 60%, #dff2ff, #6aa8e8)', boxShadow: '0 0 40px #9fd8ff'}} />
    </div>
    {/* torre */}
    <div style={{position: 'absolute', left: 610, top: 0, width: 180, height: 200, background: 'linear-gradient(180deg, #f6ead0, #e0cda3)', border: `6px solid ${INK}`}}>
      <div style={{position: 'absolute', left: -20, right: -20, top: -60, height: 66, background: 'linear-gradient(180deg, #d0613a, #93391b)', clipPath: 'polygon(50% 0,100% 100%,0 100%)'}} />
      <div style={{position: 'absolute', left: 55, top: 50, width: 70, height: 100, borderRadius: '35px 35px 4px 4px', border: `5px solid ${INK}`, background: 'radial-gradient(circle at 50% 70%, #fff3b0, #ffb84a)'}} />
    </div>
  </div>
);
export const S5: React.FC<{t: number}> = ({t}) => {
  // A) mapa → Florida (0-5)
  const mapS = ip(t, [0, 5], [0.9, 9]); const mc = [ip(t, [0, 5], [LL(-75, 20)[0], PB[0]]), ip(t, [0, 5], [LL(-75, 20)[1], PB[1]])];
  // B) finca vista desde arriba que se inclina y el edificio se levanta (5-10.5)
  const tilt = ip(t, [6.2, 9], [0, 62]); const rise = ip(t, [7.5, 10], [0, 1]);
  // C) dolly hacia la ventana (10.5-14.5)
  const dz = ip(t, [10.5, 14.5], [1, 16]);
  // E) salir de la ventana (28-32)
  const out = ip(t, [28.2, 31.5], [16, 1]);
  const showOutside = t < 14.6 || t > 28;
  const z = t > 28 ? out : dz;
  const winX = 420 + 230 + 50, winY = 180 + 60 + 60; // centro de la ventana en el edificio
  return (<AbsoluteFill style={{background: '#050914'}}>
    {t < 5.6 && <div style={{position: 'absolute', inset: 0, opacity: ip(t, [4.8, 5.6], [1, 0])}}><MapCam cx={mc[0]} cy={mc[1]} s={mapS} night={0.5} />
      <Pin x={(PB[0] - mc[0]) * mapS + W / 2} y={(PB[1] - mc[1]) * mapS + H / 2} t={t} label="PALM BEACH, FLORIDA" /></div>}
    {showOutside && t > 4.8 && <div style={{position: 'absolute', inset: 0, opacity: t < 5.6 ? ip(t, [4.8, 5.6], [0, 1]) : 1}}>
      <NightSky glow="#22305a" />
      <div style={{position: 'absolute', inset: 0, transform: `scale(${z})`, transformOrigin: `${260 + winX}px ${360 + winY}px`}}>
        {/* suelo / finca inclinándose */}
        <div style={{position: 'absolute', inset: 0, perspective: 1400, perspectiveOrigin: '50% 30%'}}>
          <div style={{position: 'absolute', left: -400, top: 700 - 520, width: W + 800, height: 1040, transformOrigin: '50% 100%', transform: `rotateX(${tilt}deg)`, background: 'radial-gradient(ellipse at 50% 40%, #2f5a2a, #16301a 70%)', border: `4px solid ${INK}`}}>
            <div style={{position: 'absolute', left: 1600, top: 760, width: 360, height: 150, borderRadius: 30, background: 'linear-gradient(135deg, #5fd0ff, #1f7ad0)', border: `6px solid ${INK}`, boxShadow: '0 0 40px #4fc0ff'}} />
            <div style={{position: 'absolute', left: 660, top: 300, width: 1400, height: 300, background: '#cdb98e', border: `6px solid ${INK}`, opacity: 1 - rise}} />
            {Array.from({length: 18}, (_, i) => <div key={i} style={{position: 'absolute', left: 300 + i * 150, top: 900 + (i % 2) * 40, width: 70, height: 70, borderRadius: '50%', background: '#1f4a1f', border: `4px solid ${INK}`}} />)}
          </div>
        </div>
        {/* edificio que se levanta */}
        <div style={{position: 'absolute', left: 260, top: 360, width: 1400, height: 620, transformOrigin: '50% 100%', transform: `scaleY(${rise})`, opacity: rise > 0 ? 1 : 0}}><Mansion /></div>
        {rise > 0.2 && [[160, 980], [1760, 980], [60, 1010], [1860, 1010]].map(([x, y], i) => <div key={i} style={{position: 'absolute', left: x - 90, top: y - 420 * rise, width: 180, height: 420 * rise}}><Ico name="palm-tree" x={90} y={210 * rise} w={420 * rise} c="#1f3a1f" /></div>)}
      </div>
      {t < 10 && t > 6 && <Caption t={t} t0={6} t1={10} text="Mar-a-Lago, Florida" hl="Mar-a-Lago" />}
    </div>}
    {/* D) sala de crisis improvisada */}
    {t > 14 && t < 29 && <AbsoluteFill style={{opacity: Math.min(ip(t, [14, 14.8], [0, 1]), ip(t, [28.2, 29], [1, 0])), background: 'linear-gradient(180deg, #1a2238 0%, #0d1220 60%, #2a1e14 60%, #1a120a 100%)'}}>
      {/* pantallas */}
      {[[260, 120, 520], [820, 90, 640], [1520, 120, 360]].map(([x, y, w], i) => <div key={i} style={{position: 'absolute', left: x, top: y, width: w, height: w * 0.56, border: `8px solid ${INK}`, borderRadius: 10, background: '#0a1a33', overflow: 'hidden', boxShadow: '0 0 40px rgba(80,160,255,0.35)'}}>
        {i === 1 && <div style={{position: 'absolute', inset: 0}}><div style={{position: 'absolute', left: -560, top: -300, width: W, height: H, transform: 'scale(0.62)', transformOrigin: '0 0'}}><MapCam cx={CCS[0]} cy={CCS[1] - 80} s={3.2} night={0.2} /></div><Pin x={320} y={220} t={t} size={14} /></div>}
        {i !== 1 && Array.from({length: 6}, (_, r) => <div key={r} style={{position: 'absolute', left: 20, top: 20 + r * 40, height: 14, width: `${30 + rnd(r + i * 7) * 60}%`, background: '#2a6acc', opacity: 0.7}} />)}
        <div style={{position: 'absolute', right: 12, top: 8, ...font, fontSize: 22, color: '#ff3b30', opacity: Math.floor(t * 2) % 2 ? 1 : 0.3}}>● LIVE</div>
      </div>)}
      {/* mesa */}
      <div style={{position: 'absolute', left: 260, top: 760, width: 1400, height: 90, borderRadius: 20, background: 'linear-gradient(180deg, #5a3a1f, #3a2410)', border: `6px solid ${INK}`}} />
      <Char k={US} acc="general" eyes="normal" t={t} s={190} x={420} y={640} look={0.5} label="GENERALS" />
      <Char k={US} acc="tie" eyes={t > 23 ? 'angry' : 'normal'} t={t} s={260} x={960} y={600} label="THE PRESIDENT" />
      <Char k={US} acc="cia" eyes="shades" t={t} s={170} x={1500} y={650} look={-0.5} label="CIA DIRECTOR" />
      {/* teléfono */}
      <div style={{position: 'absolute', left: 1110, top: 690, width: 1, height: 1, transform: `rotate(${t > 16 && t < 17.5 ? Math.sin(t * 60) * 8 : 0}deg)`}}><Ico name="rotary-phone" x={0} y={0} w={110} c="#c3100a" /></div>
      {t > 15.3 && t < 17.5 && <div style={{position: 'absolute', left: 1070, top: 590, ...font, fontSize: 40, color: '#ffd23f', WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill', transform: `rotate(${Math.sin(t * 30) * 6}deg)`}}>RING!</div>}
      <Bubble t={t} t0={18} t1={21.6} x={430} y={470} text="Everything is ready." size={38} tail="l" />
      <Bubble t={t} t0={22} t1={27.6} x={960} y={400} text="Approved." size={54} />
      <Caption t={t} t0={22.4} t1={27.8} text="The operation is approved... 4 days before launch" hl="4 days" />
    </AbsoluteFill>}
    <Stamp t={t} t0={0.3} t1={14} place="PALM BEACH, FLORIDA" date="LATE DECEMBER 2025" />
    <Vignette />
  </AbsoluteFill>);
};

// ---------- 6 · MAL TIEMPO: cuenta atrás (18 s) ----------
export const S6: React.FC<{t: number}> = ({t}) => {
  const clear = ip(t, [12.5, 15], [0, 1]);
  const day = t < 5 ? 4 : t < 7.5 ? 3 : t < 10 ? 2 : 1;
  return (<AbsoluteFill>
    <NightSky glow="#20304a" />
    <Caracas y={720} lights={0.8} />
    {/* nubes */}
    {Array.from({length: 9}, (_, i) => { const dir = i % 2 ? 1 : -1; return <div key={i} style={{position: 'absolute', left: rnd(i) * 1600 - 200 + dir * clear * 1400, top: 40 + (i % 4) * 90, width: 700, height: 220, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(60,70,90,0.95) 0%, rgba(40,50,70,0.8) 50%, rgba(30,40,60,0) 72%)', filter: 'blur(6px)'}} />; })}
    {clear < 0.5 && Array.from({length: 40}, (_, i) => <div key={i} style={{position: 'absolute', left: (rnd(i) * W + t * 60) % W, top: (rnd(i + 20) * H + t * 900) % H, width: 3, height: 34, background: 'rgba(180,200,230,0.5)', transform: 'rotate(12deg)'}} />)}
    <div style={{position: 'absolute', left: W / 2 - 170, top: 250, width: 340, height: 380, borderRadius: 26, background: '#f4f4f4', border: `8px solid ${INK}`, boxShadow: '0 20px 40px rgba(0,0,0,0.5)', opacity: ip(t, [0.5, 1], [0, 1]) * (1 - clear)}}>
      <div style={{height: 100, borderRadius: '18px 18px 0 0', background: '#c3100a', ...font, fontSize: 44, color: '#fff', textAlign: 'center', lineHeight: '100px'}}>LAUNCH IN</div>
      <div key={day} style={{...font, fontSize: 200, color: INK, textAlign: 'center', lineHeight: '200px', transform: `scale(${pop(t, day === 4 ? 0.5 : day === 3 ? 5 : day === 2 ? 7.5 : 10, 0.3)})`}}>{day}</div>
      <div style={{...font, fontSize: 40, color: INK, textAlign: 'center'}}>{day === 1 ? 'DAY' : 'DAYS'}</div>
    </div>
    {t > 1.2 && clear < 0.6 && <Big text="DELAYED" y={110} size={110} col="#ff3b30" rot={-4} sc={pop(t, 1.2, 0.3)} />}
    <Caption t={t} t0={1.6} t1={11.8} text="Too many clouds. They wait for clear skies." hl="clear skies" />
    {t > 14.5 && <Big text="CLEAR SKIES" y={380} size={130} col="#3ad16a" sc={pop(t, 14.5, 0.3)} />}
    <Vignette />
  </AbsoluteFill>);
};
