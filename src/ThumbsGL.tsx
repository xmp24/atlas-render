import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, RED, YELLOW, BLUE, GREEN, font, Avatar, Mood} from './lib3';
import {usePreload} from './War6';
import {ArcticMap, OceanA} from './War8';

const TXT = (size: number, color: string, sw = size * 0.13): React.CSSProperties => ({...font, fontSize: size, color, WebkitTextStroke: `${sw}px ${INK}`, paintOrder: 'stroke fill', lineHeight: 0.92, textShadow: `0 ${size * 0.07}px 0 rgba(0,0,0,0.55)`, whiteSpace: 'nowrap'});
const Box: React.FC<{children: React.ReactNode; bg: string; size: number; rot?: number; color?: string}> = ({children, bg, size, rot = -2, color = INK}) => (
  <div style={{transform: `rotate(${rot}deg)`, background: bg, border: `12px solid ${INK}`, borderRadius: 32, padding: '6px 46px 0', ...font, fontSize: size, color, boxShadow: '0 14px 0 rgba(0,0,0,0.5)', whiteSpace: 'nowrap', textAlign: 'center', lineHeight: 1}}>{children}</div>
);
const Av = (code: string, size: number, mood: Mood, look: [number, number], id: string) => <Avatar size={size} code={code} mood={mood} t={0.5} seed={code.charCodeAt(0)} look={look} id={id} />;
const P = (x: number, y: number, el: React.ReactNode, rot = 0) => <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg)`}}>{el}</div>;
const Map: React.FC<{t: number; cx: number; cy: number; s: number; dark?: number}> = ({t, cx, cy, s, dark = 0}) => (
  <>
    <OceanA t={t} W={1920} H={1080} />
    <ArcticMap t={t} cam={{cx, cy, s}} />
    {dark > 0 && <AbsoluteFill style={{background: `rgba(5,10,20,${dark})`}} />}
  </>
);
const Glow: React.FC<{x: number; y: number; r: number; c: string}> = ({x, y, r, c}) => <div style={{position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: '50%', background: `radial-gradient(circle, ${c} 0%, transparent 70%)`}} />;
const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; c?: string; w?: number}> = ({x1, y1, x2, y2, c = RED, w = 34}) => {
  const a = Math.atan2(y2 - y1, x2 - x1), hx = x2 - Math.cos(a) * w * 2.2, hy = y2 - Math.sin(a) * w * 2.2;
  const px = Math.cos(a + Math.PI / 2) * w * 1.6, py = Math.sin(a + Math.PI / 2) * w * 1.6;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute'}}>
      <path d={`M${x1},${y1} Q${(x1 + x2) / 2},${Math.min(y1, y2) - 160} ${hx},${hy}`} fill="none" stroke={INK} strokeWidth={w + 18} strokeLinecap="round" />
      <path d={`M${x1},${y1} Q${(x1 + x2) / 2},${Math.min(y1, y2) - 160} ${hx},${hy}`} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${hx + px},${hy + py} ${hx - px},${hy - py}`} fill={c} stroke={INK} strokeWidth={10} strokeLinejoin="round" />
    </svg>
  );
};

export const ThumbGL: React.FC<{v: string}> = ({v}) => {
  usePreload();
  if (v === '1') return ( // EE. UU. se lanza a por Groenlandia
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Map t={30} cx={700} cy={430} s={0.95} dark={0.15} />
      <Arrow x1={330} y1={860} x2={760} y2={420} />
      {P(300, 820, Av('us', 380, 'angry', [1, -0.6], 't1us'))}
      {P(1010, 380, Av('gl', 300, 'scared', [-1, 0.3], 't1gl'))}
      <div style={{position: 'absolute', right: 40, top: 560}}><Box bg="#fff" size={118} rot={-3}>USA vs<br /><span style={{color: RED}}>GREENLAND</span></Box></div>
    </AbsoluteFill>
  );
  if (v === '2') return ( // 41 horas
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Map t={126} cx={940} cy={330} s={1.75} dark={0.25} />
      {P(470, 560, Av('us', 360, 'smug', [1, 0], 't2us'))}
      <div style={{position: 'absolute', right: 60, top: 120}}><div style={{...TXT(250, YELLOW, 22)}}>41</div><div style={{...TXT(130, '#fff', 14)}}>HOURS</div></div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 50, display: 'flex', justifyContent: 'center'}}><Box bg={RED} size={110} color="#fff">GREENLAND FALLS</Box></div>
    </AbsoluteFill>
  );
  if (v === '3') return ( // OTAN contra EE. UU.
    <AbsoluteFill style={{overflow: 'hidden', background: 'radial-gradient(circle at 50% 50%, #7a1410, #12060a)'}}>
      <Glow x={960} y={560} r={420} c="rgba(255,170,40,0.55)" />
      {P(470, 560, Av('us', 440, 'angry', [1, 0], 't3us'), -4)}
      {P(1450, 560, Av('eu', 440, 'angry', [-1, 0], 't3eu'), 4)}
      {P(960, 560, <div style={{...TXT(200, RED, 20)}}>VS</div>)}
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'center'}}><Box bg="#fff" size={124}>NATO vs <span style={{color: BLUE}}>USA</span>?!</Box></div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, display: 'flex', justifyContent: 'center'}}><Box bg={YELLOW} size={80} rot={2}>OVER GREENLAND</Box></div>
    </AbsoluteFill>
  );
  if (v === '4') return ( // 1.328.000 contra 350
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Map t={18} cx={840} cy={430} s={1.0} dark={0.45} />
      {P(460, 470, Av('us', 470, 'smug', [1, 0.2], 't4us'))}
      {P(1480, 560, Av('dk', 190, 'scared', [-1, 0], 't4dk'))}
      <div style={{position: 'absolute', left: 140, top: 760, ...TXT(124, '#8fb3ff', 14)}}>1,328,000</div>
      <div style={{position: 'absolute', left: 1400, top: 700, ...TXT(124, '#ff8b84', 14)}}>350</div>
      {P(1000, 520, <div style={{...TXT(150, YELLOW, 16)}}>VS</div>)}
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'center'}}><Box bg="#fff" size={96}>CAN GREENLAND <span style={{color: RED}}>SURVIVE?</span></Box></div>
    </AbsoluteFill>
  );
  if (v === '5') return ( // Día 1, paracaidistas
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Map t={57} cx={830} cy={420} s={3.2} dark={0.1} />
      {[[700, 250, 170, -8], [930, 380, 210, 6], [1180, 220, 150, -4], [560, 520, 130, 10], [1090, 600, 140, -6]].map(([x, y, sz, r], i) => <React.Fragment key={i}>{P(x, y, <div style={{fontSize: sz, filter: 'drop-shadow(0 10px 0 rgba(0,0,0,0.45))'}}>🪂</div>, r)}</React.Fragment>)}
      <div style={{position: 'absolute', left: 50, top: 40}}><Box bg={RED} size={150} color="#fff" rot={-4}>DAY 1</Box></div>
      {P(1600, 300, Av('us', 300, 'angry', [-1, 0.4], 't5us'))}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 50, display: 'flex', justifyContent: 'center'}}><Box bg="#fff" size={110}>THE USA <span style={{color: RED}}>INVADES</span></Box></div>
    </AbsoluteFill>
  );
  if (v === '6') return ( // título clásico
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Map t={30} cx={900} cy={360} s={1.3} dark={0.35} />
      {P(430, 620, Av('us', 340, 'smug', [1, 0], 't6us'))}
      {P(960, 600, <div style={{...TXT(170, '#fff', 18)}}>➜</div>)}
      {P(1490, 620, Av('gl', 340, 'scared', [-1, 0], 't6gl'))}
      <div style={{position: 'absolute', left: 0, right: 0, top: 50, display: 'flex', justifyContent: 'center'}}><Box bg={GREEN} size={118} color="#fff">WHAT IF THE USA<br />INVADED GREENLAND?</Box></div>
    </AbsoluteFill>
  );
  if (v === '7') return ( // Dinamarca pierde el 98 %
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Map t={300} cx={1000} cy={420} s={1.1} dark={0.3} />
      {P(1500, 540, Av('dk', 400, 'sad', [-1, 0], 't7dk'))}
      <div style={{position: 'absolute', left: 80, top: 260}}><div style={{...TXT(260, RED, 24)}}>-98%</div></div>
      <div style={{position: 'absolute', left: 60, bottom: 70}}><Box bg="#fff" size={96}>DENMARK LOSES IT ALL</Box></div>
    </AbsoluteFill>
  );
  if (v === '8') return ( // Europa en guerra con EE. UU.
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Map t={300} cx={1060} cy={460} s={3.0} dark={0.2} />
      <Glow x={960} y={520} r={380} c="rgba(255,120,30,0.6)" />
      {P(960, 520, <div style={{fontSize: 300}}>💥</div>)}
      {P(330, 540, Av('us', 330, 'angry', [1, 0], 't8us'))}
      {P(1590, 540, Av('fr', 330, 'angry', [-1, 0], 't8fr'))}
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'center'}}><Box bg={RED} size={110} color="#fff">ALLIES AT WAR</Box></div>
    </AbsoluteFill>
  );
  if (v === '9') return ( // ¿mereció la pena?
    <AbsoluteFill style={{overflow: 'hidden', background: 'radial-gradient(circle at 50% 55%, #2b4d7d, #0c1626)'}}>
      {P(420, 600, Av('us', 340, 'sad', [1, 0], 't9us'))}
      {P(960, 560, Av('gl', 400, 'happy', [0, 0], 't9gl'))}
      {P(1500, 600, Av('dk', 340, 'angry', [-1, 0], 't9dk'))}
      <div style={{position: 'absolute', left: 0, right: 0, top: 40, display: 'flex', justifyContent: 'center'}}><Box bg="#fff" size={124}>WHO <span style={{color: RED}}>REALLY</span> WON?</Box></div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 50, display: 'flex', justifyContent: 'center'}}><Box bg={YELLOW} size={90} rot={2}>NOBODY EXPECTED THIS</Box></div>
    </AbsoluteFill>
  );
  return ( // 10: noticia de última hora
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Map t={125} cx={930} cy={320} s={1.6} dark={0.15} />
      {P(1560, 420, Av('us', 380, 'smug', [-1, 0], 't10us'))}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, display: 'flex', border: `12px solid ${INK}`, boxShadow: '0 14px 0 rgba(0,0,0,0.5)'}}>
        <div style={{background: RED, ...font, fontSize: 96, color: '#fff', padding: '14px 34px 0'}}>BREAKING</div>
        <div style={{flex: 1, background: '#fff', ...font, fontSize: 96, color: INK, padding: '14px 30px 0', whiteSpace: 'nowrap'}}>US SEIZES GREENLAND</div>
      </div>
    </AbsoluteFill>
  );
};
