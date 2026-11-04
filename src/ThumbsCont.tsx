import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, CREAM, RED, BLUE, YELLOW, ORANGE, font, Avatar} from './lib3';
import {Ocean} from './War5';
import {PIECES, WFlag} from './War6';
import {ContMap, TEAMOF, TCOL, TFLAG, TNAME} from './War7';

const TXT = (size: number, color: string, sw = size * 0.13): React.CSSProperties => ({...font, fontSize: size, color, WebkitTextStroke: `${sw}px ${INK}`, paintOrder: 'stroke fill', lineHeight: 0.92, textShadow: `0 ${size * 0.07}px 0 rgba(0,0,0,0.55)`, whiteSpace: 'nowrap'});
const Box: React.FC<{children: React.ReactNode; bg: string; size: number; rot?: number; color?: string}> = ({children, bg, size, rot = -2, color = INK}) => (
  <div style={{transform: `rotate(${rot}deg)`, background: bg, border: `12px solid ${INK}`, borderRadius: 32, padding: '6px 50px 0', ...font, fontSize: size, color, boxShadow: '0 14px 0 rgba(0,0,0,0.5)', whiteSpace: 'nowrap'}}>{children}</div>
);
const TeamMap: React.FC<{cx: number; cy: number; s: number; op?: number}> = ({cx, cy, s, op = 0.62}) => (
  <svg width={1920} height={1080} style={{position: 'absolute'}}>
    <g transform={`translate(960,540) scale(${s}) translate(${-cx},${-cy})`}>
      {PIECES.map((p, i) => <path key={i} d={p.d} fill={TCOL[TEAMOF[p.code]]} opacity={op} stroke={INK} strokeWidth={0.6 / s} />)}
    </g>
  </svg>
);
const ORDER = ['NA', 'SA', 'EU', 'AF', 'AS', 'OC'];
export const ThumbCont: React.FC<{v: string}> = ({v}) => {
  if (v === 'A') return (
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <Ocean t={0} /><ContMap t={0} cam={{cx: 960, cy: 500, s: 1.08}} /><TeamMap cx={960} cy={500} s={1.08} op={0.45} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.65) 100%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 40, display: 'flex', justifyContent: 'center'}}><Box bg="#fff" size={130}>6 CONTINENTS, <span style={{color: RED}}>1 WINNER</span></Box></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center', gap: 18, alignItems: 'flex-end'}}>
        {ORDER.map((tm, i) => <div key={tm} style={{transform: `translateY(${i % 2 ? 30 : 0}px)`}}><Avatar size={tm === 'AS' ? 300 : 260} code={TFLAG(tm)} mood="angry" t={0.5} seed={i} look={[i < 3 ? 1 : -1, 0]} id={`ta-${tm}`} /></div>)}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, display: 'flex', justifyContent: 'center'}}><Box bg={YELLOW} size={140} rot={2}>WHO WINS? 🏆</Box></div>
    </AbsoluteFill>
  );
  if (v === 'B') return (
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <Ocean t={0} /><TeamMap cx={960} cy={480} s={1.12} op={0.75} />
      <AbsoluteFill style={{background: 'rgba(8,15,30,0.45)'}} />
      <div style={{position: 'absolute', left: 60, top: 280}}><Avatar size={560} code="tas" mood="angry" t={0.5} seed={2} look={[1, 0]} id="tb-as" /></div>
      <div style={{position: 'absolute', right: 60, top: 280}}><Avatar size={560} code="tna" mood="angry" t={0.5} seed={4} look={[-1, 0]} id="tb-na" /></div>
      <div style={{position: 'absolute', left: 960, top: 560, transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center'}}><div style={{fontSize: 220}}>🏆</div><div style={TXT(150, '#fff', 20)}>VS</div></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 40, display: 'flex', justifyContent: 'center'}}><Box bg="#fff" size={130}><span style={{color: RED}}>ASIA</span> vs <span style={{color: '#6b3fc4'}}>AMERICA</span></Box></div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 36, display: 'flex', justifyContent: 'center'}}><Box bg={YELLOW} size={120} rot={2}>THE FINAL WAR</Box></div>
    </AbsoluteFill>
  );
  if (v === 'C') {
    const pair = (a: string, b: string, y: number) => (
      <div style={{position: 'absolute', left: 90, top: y, display: 'flex', alignItems: 'center', gap: 14}}>
        <Avatar size={150} code={TFLAG(a)} mood="angry" t={0.5} seed={1} look={[1, 0]} id={`tc-${a}`} /><div style={TXT(70, RED)}>VS</div><Avatar size={150} code={TFLAG(b)} mood="angry" t={0.5} seed={2} look={[-1, 0]} id={`tc-${b}`} />
      </div>
    );
    return (
      <AbsoluteFill style={{background: 'linear-gradient(135deg, #10203d, #1d5e9f)', overflow: 'hidden'}}>
        <TeamMap cx={960} cy={500} s={1.05} op={0.35} />
        {pair('NA', 'SA', 120)}{pair('EU', 'AF', 430)}{pair('AS', 'OC', 740)}
        <svg width={1920} height={1080} style={{position: 'absolute'}}>{[195, 505, 815].map((y, i) => <path key={i} d={`M600,${y} H760 V${i < 2 ? 350 : 815} ${i < 2 ? 'H900' : 'H900'}`} fill="none" stroke="#fff" strokeWidth={12} strokeLinecap="round" />)}<path d="M900,350 V815 M900,580 H1060" stroke="#fff" strokeWidth={12} fill="none" /></svg>
        <div style={{position: 'absolute', left: 1080, top: 120}}><div style={TXT(140, YELLOW)}>WORLD CUP</div><div style={{...TXT(140, '#fff'), marginTop: 14}}>OF WAR</div></div>
        <div style={{position: 'absolute', left: 1180, top: 470, fontSize: 330}}>🏆</div>
        <div style={{position: 'absolute', right: 60, top: 890}}><Box bg={RED} size={90} color="#fff">CONTINENTS AT WAR</Box></div>
      </AbsoluteFill>
    );
  }
  if (v === 'D') return (
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <Ocean t={0} /><ContMap t={0} cam={{cx: 1000, cy: 430, s: 2.0}} /><TeamMap cx={1000} cy={430} s={2.0} op={0.5} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {[[[980, 860], [900, 470], RED], [[1160, 340], [1300, 560], BLUE], [[1500, 470], [1250, 330], ORANGE]].map(([a, b, c], i) => {
          const [x0, y0] = a as number[], [x1, y1] = b as number[];
          const ang = Math.atan2(y1 - y0, x1 - x0);
          return <g key={i}><line x1={x0} y1={y0} x2={x1 - Math.cos(ang) * 40} y2={y1 - Math.sin(ang) * 40} stroke={INK} strokeWidth={64} strokeLinecap="round" /><line x1={x0} y1={y0} x2={x1 - Math.cos(ang) * 40} y2={y1 - Math.sin(ang) * 40} stroke={c as string} strokeWidth={44} strokeLinecap="round" /><polygon points={`${x1 + Math.cos(ang) * 40},${y1 + Math.sin(ang) * 40} ${x1 + Math.cos(ang + 2.4) * 70},${y1 + Math.sin(ang + 2.4) * 70} ${x1 + Math.cos(ang - 2.4) * 70},${y1 + Math.sin(ang - 2.4) * 70}`} fill={c as string} stroke={INK} strokeWidth={10} strokeLinejoin="round" /></g>;
        })}
      </svg>
      <div style={{position: 'absolute', left: 40, top: 40}}><Box bg="#fff" size={120}>AFRICA ATTACKS <span style={{color: '#1d56c9'}}>EUROPE</span></Box></div>
      <div style={{position: 'absolute', right: 40, bottom: 40}}><Box bg={YELLOW} size={110} rot={2}>WHO WINS?</Box></div>
      <div style={{position: 'absolute', left: 60, bottom: 40}}><Avatar size={300} code="taf" mood="angry" t={0.5} seed={3} look={[1, -0.3]} id="td-af" /></div>
    </AbsoluteFill>
  );
  // E: el más débil contra el más fuerte
  return (
    <AbsoluteFill style={{background: 'linear-gradient(90deg, #0b6f86 0%, #14a3b3 35%, #8f1714 60%, #d42a24 100%)', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 110, top: 420}}><Avatar size={260} code="toc" mood="scared" t={0.5} seed={3} look={[1, 0]} id="te-oc" /></div>
      <div style={{position: 'absolute', right: -60, top: 140}}><Avatar size={820} code="tas" mood="smug" t={0.5} seed={2} look={[-1, 0.2]} id="te-as" /></div>
      <div style={{position: 'absolute', left: 60, top: 60}}><div style={TXT(140, '#fff')}>76,000</div><div style={{...TXT(60, '#bff4ff'), marginTop: 10}}>OCEANIA SOLDIERS</div></div>
      <div style={{position: 'absolute', left: 560, top: 380}}><div style={TXT(130, YELLOW)}>VS</div></div>
      <div style={{position: 'absolute', right: 60, top: 60}}><div style={TXT(140, '#fff')}>9,800,000</div><div style={{...TXT(60, '#ffd0cc'), marginTop: 10, textAlign: 'right'}}>ASIA SOLDIERS</div></div>
      <div style={{position: 'absolute', left: 60, bottom: 50}}><Box bg={YELLOW} size={120}>CAN THEY SURVIVE?</Box></div>
    </AbsoluteFill>
  );
};
