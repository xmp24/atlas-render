import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, RED, YELLOW, BLUE, GREEN, font, Avatar, Mood} from './lib3';
import {usePreload, WorldMap} from './War6';
import {ContMap} from './War7';
import {ArcticMap, OceanA} from './War8';

const W = 1080, H = 1920;
const VP = {W, H, ox: 540, oy: 960, ui: 1};
const TXT = (size: number, color: string, sw = size * 0.13): React.CSSProperties => ({...font, fontSize: size, color, WebkitTextStroke: `${sw}px ${INK}`, paintOrder: 'stroke fill', lineHeight: 0.95, textShadow: `0 ${size * 0.07}px 0 rgba(0,0,0,0.55)`, textAlign: 'center'});
const Box: React.FC<{children: React.ReactNode; bg: string; size: number; rot?: number; color?: string}> = ({children, bg, size, rot = -2, color = INK}) => (
  <div style={{transform: `rotate(${rot}deg)`, background: bg, border: `12px solid ${INK}`, borderRadius: 34, padding: '14px 40px 4px', ...font, fontSize: size, color, boxShadow: '0 14px 0 rgba(0,0,0,0.5)', textAlign: 'center', lineHeight: 1}}>{children}</div>
);
const Av = (code: string, size: number, mood: Mood, look: [number, number], id: string) => <Avatar size={size} code={code} mood={mood} t={0.5} seed={code.charCodeAt(0) + size} look={look} id={id} />;
const P = (x: number, y: number, el: React.ReactNode, rot = 0) => <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg)`}}>{el}</div>;
const Shade = () => <AbsoluteFill style={{background: 'linear-gradient(rgba(5,10,20,0.75), rgba(5,10,20,0.15) 30%, rgba(5,10,20,0.15) 65%, rgba(5,10,20,0.8))'}} />;
const Series: React.FC<{c?: string}> = ({c = YELLOW}) => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 90, display: 'flex', justifyContent: 'center'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 16, background: INK, border: `8px solid #fff`, borderRadius: 30, padding: '12px 32px 4px'}}>
      <span style={{...font, fontSize: 64, color: c}}>6-PART SERIES</span>
      <span style={{display: 'flex', gap: 8}}>{[1, 2, 3, 4, 5, 6].map((i) => <span key={i} style={{width: 26, height: 26, borderRadius: 13, background: c, border: '4px solid #fff', marginBottom: 8}} />)}</span>
    </div>
  </div>
);
const Burst: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => <div style={{position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,190,60,0.85) 0%, rgba(255,90,20,0.35) 40%, transparent 70%)'}} />;

export const ThumbPack: React.FC<{v: string}> = ({v}) => {
  usePreload();
  if (v === 'ru') return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#164f86'}}>
      <OceanA t={0} W={W} H={H} /><WorldMap t={23} cam={{cx: 1060, cy: 270, s: 4.2}} vp={VP} /><Shade />
      <div style={{position: 'absolute', top: 120, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
        <div style={{...TXT(170, '#fff', 20)}}>RUSSIA</div>
        <div style={{...TXT(130, RED, 16)}}>vs</div>
        <div style={{...TXT(170, '#ffd23f', 20)}}>EUROPE</div>
      </div>
      <Burst x={540} y={1060} r={360} />
      {P(240, 1060, Av('ru', 330, 'angry', [1, 0], 'pr-ru'), -5)}
      {P(840, 1060, Av('eu', 330, 'angry', [-1, 0], 'pr-eu'), 5)}
      {P(540, 1060, <div style={{...TXT(150, RED, 18)}}>VS</div>)}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1360, display: 'flex', justifyContent: 'center'}}><Box bg="#fff" size={78}>WHO WINS <span style={{color: RED}}>WW3?</span></Box></div>
      <Series />
    </AbsoluteFill>
  );
  if (v === 'br') return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#164f86'}}>
      <OceanA t={0} W={W} H={H} /><WorldMap t={23} cam={{cx: 1000, cy: 430, s: 1.6}} vp={VP} /><Shade />
      <div style={{position: 'absolute', top: 110, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{...TXT(260, YELLOW, 28)}}>195</div>
        <div style={{...TXT(110, '#fff', 14)}}>COUNTRIES</div>
      </div>
      {P(540, 880, <div style={{fontSize: 200}}>👑</div>)}
      {P(540, 1080, <div style={{...TXT(260, RED, 28)}}>1</div>, -4)}
      {[['us', 180, 820], ['cn', 900, 820], ['ru', 170, 1200], ['gb', 910, 1200], ['de', 330, 1360], ['fr', 750, 1360]].map(([c, x, y], i) => <React.Fragment key={c as string}>{P(x as number, y as number, Av(c as string, 190, 'angry', [Math.sign(540 - (x as number)), 0], `pb-${c}`), (i % 2 ? 6 : -6))}</React.Fragment>)}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1560, display: 'flex', justifyContent: 'center'}}><Box bg="#fff" size={84}>ONLY 1 <span style={{color: RED}}>SURVIVES</span></Box></div>
      <Series />
    </AbsoluteFill>
  );
  if (v === 'cont') return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#164f86'}}>
      <OceanA t={0} W={W} H={H} /><ContMap t={500} cam={{cx: 1000, cy: 470, s: 1.15}} vp={VP} /><Shade />
      <div style={{position: 'absolute', top: 120, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
        <div style={{...TXT(140, '#fff', 18)}}>WAR OF</div>
        <div style={{...TXT(150, YELLOW, 20)}}>CONTINENTS</div>
      </div>
      {[['tna', 270, 720], ['teu', 810, 720], ['tsa', 270, 1000], ['tas', 810, 1000], ['taf', 270, 1280], ['toc', 810, 1280]].map(([c, x, y]) => <React.Fragment key={c}>{P(x as number, y as number, Av(c as string, 240, 'angry', [Math.sign(540 - (x as number)), 0], `pc-${c}`))}</React.Fragment>)}
      {P(540, 1000, <div style={{fontSize: 210, filter: 'drop-shadow(0 10px 0 rgba(0,0,0,0.5))'}}>🏆</div>)}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1470, display: 'flex', justifyContent: 'center'}}><Box bg={RED} size={80} color="#fff">ONLY 1 WINS</Box></div>
      <Series />
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#164f86'}}>
      <OceanA t={0} W={W} H={H} /><ArcticMap t={126} cam={{cx: 930, cy: 330, s: 1.9}} vp={VP} /><Shade />
      <div style={{position: 'absolute', top: 110, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
        <div style={{...TXT(130, '#fff', 16)}}>THE USA</div>
        <div style={{...TXT(140, RED, 18)}}>INVADES</div>
        <div style={{...TXT(140, '#fff', 18)}}>GREENLAND</div>
      </div>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <path d="M250,1250 Q400,820 700,900" fill="none" stroke={INK} strokeWidth={56} strokeLinecap="round" />
        <path d="M250,1250 Q400,820 700,900" fill="none" stroke={RED} strokeWidth={34} strokeLinecap="round" />
        <polygon points="790,930 680,850 660,975" fill={RED} stroke={INK} strokeWidth={10} strokeLinejoin="round" />
      </svg>
      {P(260, 1280, Av('us', 340, 'angry', [1, -0.5], 'pg-us'), -4)}
      {P(830, 900, Av('gl', 290, 'scared', [-1, 0.3], 'pg-gl'), 4)}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1480, display: 'flex', justifyContent: 'center'}}><Box bg={YELLOW} size={76}>NATO vs USA?!</Box></div>
      <Series />
    </AbsoluteFill>
  );
};
