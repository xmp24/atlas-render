import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, CREAM, RED, YELLOW, font, Avatar, Mood} from './lib3';
import {Ocean} from './War5';
import {PIECES} from './War6';
import {ContMap, TEAMOF, TCOL, TDARK, TFLAG, TNAME} from './War7';

const TXT = (size: number, color: string, sw = size * 0.13): React.CSSProperties => ({...font, fontSize: size, color, WebkitTextStroke: `${sw}px ${INK}`, paintOrder: 'stroke fill', lineHeight: 0.92, textShadow: `0 ${size * 0.07}px 0 rgba(0,0,0,0.55)`, whiteSpace: 'nowrap'});
const Box: React.FC<{children: React.ReactNode; bg: string; size: number; rot?: number; color?: string}> = ({children, bg, size, rot = -2, color = INK}) => (
  <div style={{transform: `rotate(${rot}deg)`, background: bg, border: `12px solid ${INK}`, borderRadius: 32, padding: '6px 46px 0', ...font, fontSize: size, color, boxShadow: '0 14px 0 rgba(0,0,0,0.5)', whiteSpace: 'nowrap'}}>{children}</div>
);
const TeamMap: React.FC<{cx: number; cy: number; s: number; op?: number}> = ({cx, cy, s, op = 0.62}) => (
  <svg width={1920} height={1080} style={{position: 'absolute'}}>
    <g transform={`translate(960,540) scale(${s}) translate(${-cx},${-cy})`}>
      {PIECES.map((p, i) => <path key={i} d={p.d} fill={TCOL[TEAMOF[p.code]]} opacity={op} stroke={INK} strokeWidth={0.8 / s} />)}
    </g>
  </svg>
);
const Av = (tm: string, size: number, mood: Mood, look: [number, number], id: string) => <Avatar size={size} code={TFLAG(tm)} mood={mood} t={0.5} seed={tm.charCodeAt(0)} look={look} id={id} />;
const P = (x: number, y: number, el: React.ReactNode) => <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)'}}>{el}</div>;

export const ThumbCont2: React.FC<{v: string}> = ({v}) => {
  if (v === '1') return (
    // Asia contra todos
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #6b1410, #12060a)', overflow: 'hidden'}}>
      <TeamMap cx={960} cy={480} s={1.08} op={0.3} />
      {P(960, 600, Av('AS', 470, 'smug', [0, 0], 'a1'))}
      {[['NA', 230, 330], ['SA', 260, 800], ['EU', 1690, 330], ['AF', 1660, 800], ['OC', 960, 990]].map(([tm, x, y]) => <React.Fragment key={tm as string}>{P(x as number, y as number, Av(tm as string, 240, 'angry', [Math.sign(960 - (x as number)) * 0.9, Math.sign(600 - (y as number)) * 0.5], `o1${tm}`))}</React.Fragment>)}
      <svg width={1920} height={1080} style={{position: 'absolute'}}>{[[330, 380], [360, 760], [1560, 380], [1540, 760]].map(([x, y], i) => <line key={i} x1={x} y1={y} x2={960 + (x - 960) * 0.45} y2={600 + (y - 600) * 0.45} stroke={YELLOW} strokeWidth={16} strokeDasharray="30 18" />)}</svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'center'}}><Box bg="#fff" size={130}><span style={{color: RED}}>ASIA</span> vs THE WORLD</Box></div>
    </AbsoluteFill>
  );
  if (v === '2') return (
    // HUD de videojuego: tira y afloja
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <Ocean t={0} /><ContMap t={330} cam={{cx: 1150, cy: 300, s: 2.2}} />
      <AbsoluteFill style={{background: 'linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.1) 45%, rgba(0,0,0,0.5))'}} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 50, display: 'flex', alignItems: 'center', gap: 24, background: 'rgba(16,22,34,0.9)', border: '8px solid #fff', borderRadius: 40, padding: '18px 28px'}}>
        {Av('EU', 190, 'scared', [1, 0], 'h-eu')}
        <div style={{flex: 1}}>
          <div style={{display: 'flex', justifyContent: 'space-between', ...TXT(84, '#fff', 10)}}><span style={{color: '#7fa8ff'}}>31%</span><span style={{color: '#ff8b84'}}>69%</span></div>
          <div style={{height: 70, borderRadius: 35, overflow: 'hidden', border: `8px solid ${INK}`, display: 'flex', marginTop: 8}}>
            <div style={{width: '31%', background: `repeating-linear-gradient(45deg, ${TCOL.EU}, ${TCOL.EU} 22px, ${TDARK.EU} 22px, ${TDARK.EU} 44px)`}} />
            <div style={{flex: 1, background: `repeating-linear-gradient(-45deg, ${TCOL.AS}, ${TCOL.AS} 22px, ${TDARK.AS} 22px, ${TDARK.AS} 44px)`}} />
          </div>
        </div>
        {Av('AS', 190, 'smug', [-1, 0], 'h-as')}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 60, display: 'flex', justifyContent: 'center'}}><Box bg={RED} size={130} color="#fff">EUROPE vs ASIA</Box></div>
    </AbsoluteFill>
  );
  if (v === '3') return (
    // mapa con los 6 colores
    <AbsoluteFill style={{background: '#14467a', overflow: 'hidden'}}>
      <Ocean t={0} /><TeamMap cx={960} cy={500} s={1.12} op={0.95} />
      {[['NA', 520, 330], ['SA', 690, 720], ['EU', 1000, 260], ['AF', 1060, 600], ['AS', 1440, 380], ['OC', 1680, 800]].map(([tm, x, y]) => <React.Fragment key={tm as string}>{P(x as number, y as number, Av(tm as string, 190, 'angry', [0, 0], `m3${tm}`))}</React.Fragment>)}
      <div style={{position: 'absolute', left: 40, bottom: 40}}><Box bg="#fff" size={130}>CONTINENT <span style={{color: RED}}>WAR</span></Box></div>
      <div style={{position: 'absolute', right: 40, top: 40}}><Box bg={YELLOW} size={100} rot={3}>WHO WINS?</Box></div>
    </AbsoluteFill>
  );
  if (v === '4') return (
    // todos a por el trofeo
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #ffe27a 0%, #e8a316 18%, #1d3a6e 55%, #0d1a33 100%)', overflow: 'hidden'}}>
      {Array.from({length: 16}).map((_, i) => { const a = (i / 16) * 360; return <div key={i} style={{position: 'absolute', left: 960, top: 470, width: 1400, height: 60, background: 'rgba(255,240,180,0.12)', transformOrigin: '0 50%', transform: `rotate(${a}deg)`}} />; })}
      {P(960, 450, <div style={{fontSize: 420, lineHeight: 1}}>🏆</div>)}
      {[['NA', 260, 330], ['SA', 330, 790], ['EU', 1660, 330], ['AF', 1590, 790], ['AS', 700, 880], ['OC', 1220, 880]].map(([tm, x, y]) => <React.Fragment key={tm as string}>{P(x as number, y as number, Av(tm as string, 230, 'angry', [Math.sign(960 - (x as number)) * 0.9, Math.sign(450 - (y as number)) * 0.6], `t4${tm}`))}</React.Fragment>)}
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'center'}}><Box bg="#fff" size={120}>ONLY <span style={{color: RED}}>1</span> CONTINENT WINS</Box></div>
    </AbsoluteFill>
  );
  if (v === '5') return (
    // África contra Europa, pantalla partida
    <AbsoluteFill style={{background: TCOL.AF, overflow: 'hidden'}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}><path d="M1040,0 L900,320 L1010,350 L880,700 L990,730 L860,1080 L1920,1080 L1920,0 Z" fill={TCOL.EU} /><path d="M1040,0 L900,320 L1010,350 L880,700 L990,730 L860,1080" fill="none" stroke="#fff" strokeWidth={26} /><path d="M1040,0 L900,320 L1010,350 L880,700 L990,730 L860,1080" fill="none" stroke={INK} strokeWidth={10} /></svg>
      {P(450, 580, Av('AF', 560, 'angry', [1, 0], 'f-af'))}
      {P(1480, 580, Av('EU', 560, 'scared', [-1, 0], 'f-eu'))}
      {P(940, 540, <div style={TXT(190, YELLOW, 24)}>VS</div>)}
      <div style={{position: 'absolute', left: 60, top: 40}}><div style={TXT(130, '#fff')}>AFRICA</div></div>
      <div style={{position: 'absolute', right: 60, top: 40}}><div style={TXT(130, '#fff')}>EUROPE</div></div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, display: 'flex', justifyContent: 'center'}}><Box bg="#fff" size={100}>54 COUNTRIES vs 44</Box></div>
    </AbsoluteFill>
  );
  // 6: la final
  return (
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <Ocean t={0} /><ContMap t={470} cam={{cx: 520, cy: 400, s: 1.9}} />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.65) 85%)'}} />
      {P(470, 580, Av('NA', 500, 'shocked', [1, -0.3], 's-na'))}
      {P(1450, 560, Av('AS', 600, 'smug', [-1, 0], 's-as'))}
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'center'}}><Box bg={YELLOW} size={110}>THE FINAL WAR</Box></div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, display: 'flex', justifyContent: 'center'}}><Box bg="#fff" size={110} rot={2}>CAN AMERICA SURVIVE?</Box></div>
    </AbsoluteFill>
  );
};
