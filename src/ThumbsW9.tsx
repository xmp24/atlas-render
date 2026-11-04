import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, RED, YELLOW, BLUE, font, Avatar, Mood} from './lib3';
import {usePreload} from './War6';
import {RegionMap, Ocean9} from './War9';

const TXT = (size: number, color: string, sw = size * 0.13): React.CSSProperties => ({...font, fontSize: size, color, WebkitTextStroke: `${sw}px ${INK}`, paintOrder: 'stroke fill', lineHeight: 0.92, textShadow: `0 ${size * 0.07}px 0 rgba(0,0,0,0.55)`, whiteSpace: 'nowrap'});
const Box: React.FC<{children: React.ReactNode; bg: string; size: number; rot?: number; color?: string}> = ({children, bg, size, rot = -2, color = INK}) => (
  <div style={{transform: `rotate(${rot}deg)`, background: bg, border: `12px solid ${INK}`, borderRadius: 32, padding: '6px 46px 0', ...font, fontSize: size, color, boxShadow: '0 14px 0 rgba(0,0,0,0.5)', whiteSpace: 'nowrap', textAlign: 'center', lineHeight: 1}}>{children}</div>
);
const Av = (code: string, size: number, mood: Mood, look: [number, number], id: string) => <Avatar size={size} code={code} mood={mood} t={0.5} seed={code.charCodeAt(0) + size} look={look} id={id} />;
const P = (x: number, y: number, el: React.ReactNode, rot = 0) => <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg)`}}>{el}</div>;
const Map: React.FC<{id: string; t: number; cx: number; cy: number; s: number; dark?: number}> = ({id, t, cx, cy, s, dark = 0}) => (
  <><Ocean9 t={t} W={1920} H={1080} /><RegionMap id={id} t={t} cam={{cx, cy, s}} />{dark > 0 && <AbsoluteFill style={{background: `rgba(5,10,20,${dark})`}} />}</>
);
const Glow: React.FC<{x: number; y: number; r: number; c: string}> = ({x, y, r, c}) => <div style={{position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: '50%', background: `radial-gradient(circle, ${c} 0%, transparent 70%)`}} />;
export const ThumbW9: React.FC<{v: string}> = ({v}) => {
  usePreload();
  if (v === 'iran1') return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Map id="iran" t={200} cx={1100} cy={420} s={1.0} dark={0.35} />
      <Glow x={960} y={560} r={420} c="rgba(255,140,30,0.55)" />
      {P(460, 560, Av('us', 440, 'angry', [1, 0], 'i1a'), -4)}{P(1460, 560, Av('ir', 440, 'angry', [-1, 0], 'i1b'), 4)}
      {P(960, 560, <div style={{...TXT(200, RED, 20)}}>VS</div>)}
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'center'}}><Box bg="#fff" size={124}>THE USA INVADES <span style={{color: '#239f40'}}>IRAN</span></Box></div>
    </AbsoluteFill>
  );
  if (v === 'iran2') return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Map id="iran" t={77.6} cx={1320} cy={575} s={3.2} dark={0.1} />
      <Glow x={1120} y={600} r={300} c="rgba(255,120,30,0.5)" />
      {P(1650, 300, Av('ir', 300, 'angry', [-1, 0.3], 'i2a'))}
      <div style={{position: 'absolute', left: 50, top: 50}}><Box bg={RED} size={120} color="#fff" rot={-4}>BATTLE FOR</Box></div>
      <div style={{position: 'absolute', left: 90, top: 210}}><div style={{...TXT(190, YELLOW, 20)}}>HORMUZ</div></div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 50, display: 'flex', justifyContent: 'center'}}><Box bg="#fff" size={84}>20% OF THE WORLD'S OIL</Box></div>
    </AbsoluteFill>
  );
  if (v === 'iran3') return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Map id="iran" t={300} cx={980} cy={300} s={1.8} dark={0.3} />
      {P(500, 600, Av('us', 380, 'scared', [1, -0.4], 'i3a'))}{P(1450, 430, Av('ir', 300, 'smug', [-1, 0.3], 'i3b'))}
      <div style={{position: 'absolute', left: 0, right: 0, top: 40, display: 'flex', justifyContent: 'center'}}><Box bg="#fff" size={110}>WHY NOBODY CAN <span style={{color: RED}}>INVADE</span> IRAN</Box></div>
      <div style={{position: 'absolute', right: 70, bottom: 60}}><Box bg={YELLOW} size={90} rot={3}>⛰️ 1,500 KM OF MOUNTAINS</Box></div>
    </AbsoluteFill>
  );
  if (v === 'iran4') return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Map id="iran" t={210} cx={1050} cy={360} s={0.95} dark={0.3} />
      {P(430, 640, Av('us', 340, 'smug', [1, 0], 'i4a'))}{P(960, 620, <div style={{...TXT(170, '#fff', 18)}}>➜</div>)}{P(1490, 640, Av('ir', 340, 'angry', [-1, 0], 'i4b'))}
      <div style={{position: 'absolute', left: 0, right: 0, top: 50, display: 'flex', justifyContent: 'center'}}><Box bg="#c8102e" size={118} color="#fff">WHAT IF THE USA<br />INVADED IRAN?</Box></div>
    </AbsoluteFill>
  );
  if (v === 'taiwan1') return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Map id="taiwan" t={175} cx={880} cy={560} s={1.4} dark={0.35} />
      <Glow x={960} y={560} r={420} c="rgba(255,140,30,0.55)" />
      {P(460, 560, Av('cn', 440, 'angry', [1, 0], 't1a'), -4)}{P(1460, 560, Av('tw', 440, 'angry', [-1, 0], 't1b'), 4)}
      {P(960, 560, <div style={{...TXT(200, RED, 20)}}>VS</div>)}
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'center'}}><Box bg="#fff" size={124}>CHINA INVADES <span style={{color: '#1a3fa8'}}>TAIWAN</span></Box></div>
    </AbsoluteFill>
  );
  if (v === 'taiwan2') return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Map id="taiwan" t={146} cx={840} cy={520} s={1.9} dark={0.15} />
      <div style={{position: 'absolute', left: 60, top: 60}}><div style={{...TXT(240, YELLOW, 24)}}>130 KM</div></div>
      {P(1640, 420, Av('cn', 320, 'angry', [-1, 0.2], 't2a'))}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 50, display: 'flex', justifyContent: 'center'}}><Box bg="#fff" size={100}>CAN CHINA <span style={{color: RED}}>CROSS IT?</span></Box></div>
    </AbsoluteFill>
  );
  if (v === 'taiwan3') return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Map id="taiwan" t={147} cx={860} cy={520} s={1.6} dark={0.15} />
      <Glow x={960} y={540} r={360} c="rgba(255,120,30,0.45)" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 40, display: 'flex', justifyContent: 'center'}}><Box bg={RED} size={104} color="#fff">THE BIGGEST INVASION</Box></div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 50, display: 'flex', justifyContent: 'center'}}><Box bg="#fff" size={104} rot={2}>IN HISTORY</Box></div>
      {P(1680, 560, Av('tw', 280, 'scared', [-1, 0], 't3a'))}
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Map id="taiwan" t={210} cx={900} cy={560} s={1.1} dark={0.3} />
      {P(430, 640, Av('cn', 340, 'smug', [1, 0], 't4a'))}{P(960, 620, <div style={{...TXT(170, '#fff', 18)}}>➜</div>)}{P(1490, 640, Av('tw', 340, 'scared', [-1, 0], 't4b'))}
      <div style={{position: 'absolute', left: 0, right: 0, top: 50, display: 'flex', justifyContent: 'center'}}><Box bg="#de2910" size={118} color="#fff">WHAT IF CHINA<br />INVADED TAIWAN?</Box></div>
    </AbsoluteFill>
  );
};
