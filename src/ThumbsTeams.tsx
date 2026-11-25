import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, RED, YELLOW, font, Avatar, Mood} from './lib3';
import {Ocean} from './War5';
import {ContMap as MapW} from './WarWW3';
import {ContMap as MapI} from './WarID50';

const TXT = (size: number, color: string, sw = size * 0.13): React.CSSProperties => ({...font, fontSize: size, color, WebkitTextStroke: `${sw}px ${INK}`, paintOrder: 'stroke fill', lineHeight: 0.92, textShadow: `0 ${size * 0.07}px 0 rgba(0,0,0,0.55)`, whiteSpace: 'nowrap'});
const Box: React.FC<{children: React.ReactNode; bg: string; size: number; rot?: number; color?: string}> = ({children, bg, size, rot = -2, color = INK}) => (
  <div style={{transform: `rotate(${rot}deg)`, background: bg, border: `12px solid ${INK}`, borderRadius: 32, padding: '6px 46px 0', ...font, fontSize: size, color, boxShadow: '0 14px 0 rgba(0,0,0,0.5)', whiteSpace: 'nowrap'}}>{children}</div>
);
const Av = (code: string, size: number, mood: Mood, look: [number, number], id: string) => <Avatar size={size} code={code} mood={mood} t={0.5} seed={code.charCodeAt(0) + code.charCodeAt(1)} look={look} id={id} />;
const P = (x: number, y: number, el: React.ReactNode) => <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)'}}>{el}</div>;
const Top: React.FC<{children: React.ReactNode; y?: number}> = ({children, y = 34}) => <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center'}}>{children}</div>;
const Bot: React.FC<{children: React.ReactNode; y?: number}> = ({children, y = 40}) => <div style={{position: 'absolute', left: 0, right: 0, bottom: y, display: 'flex', justifyContent: 'center'}}>{children}</div>;
const Fire = () => <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 120%, rgba(255,90,20,0.55), rgba(120,10,0,0.25) 40%, rgba(0,0,0,0) 70%)'}} />;
const Vign = ({k = 0.7}) => <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 35%, rgba(0,0,0,${k}) 100%)`}} />;
const Boom = (x: number, y: number, s: number) => P(x, y, <div style={{width: s, height: s, borderRadius: '50%', background: 'radial-gradient(circle, #fff7c2 0%, #ffc23a 25%, #ff5a1a 50%, rgba(200,30,0,0.6) 68%, rgba(0,0,0,0) 72%)'}} />);
const Line = (x1: number, y1: number, x2: number, y2: number, c = YELLOW) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={18} strokeDasharray="34 18" strokeLinecap="round" />;

export const ThumbTeams: React.FC<{v: string}> = ({v}) => {
  if (v === 'w1') return (
    // mapa en plena guerra + las 3 potencias
    <AbsoluteFill style={{background: '#14467a', overflow: 'hidden'}}>
      <Ocean t={0} /><MapW t={560} cam={{cx: 1180, cy: 430, s: 1.25}} />
      <AbsoluteFill style={{background: 'rgba(60,0,0,0.25)'}} /><Fire /><Vign />
      {Boom(1150, 360, 160)}{Boom(1420, 470, 120)}{Boom(980, 300, 100)}
      {P(330, 640, Av('US', 380, 'angry', [1, 0], 'w1u'))}
      {P(1350, 690, Av('RU', 330, 'angry', [-1, 0], 'w1r'))}
      {P(1650, 640, Av('CN', 330, 'angry', [-1, 0], 'w1c'))}
      <Top><div style={TXT(220, RED, 26)}>WORLD WAR 3</div></Top>
      <Bot><Box bg={YELLOW} size={104}>WHO SURVIVES?</Box></Bot>
    </AbsoluteFill>
  );
  if (v === 'w2') return (
    // Occidente contra Oriente, pantalla partida
    <AbsoluteFill style={{background: '#2f63d1', overflow: 'hidden'}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}><path d="M1040,0 L900,320 L1010,350 L880,700 L990,730 L860,1080 L1920,1080 L1920,0 Z" fill="#c8262b" /><path d="M1040,0 L900,320 L1010,350 L880,700 L990,730 L860,1080" fill="none" stroke="#fff" strokeWidth={26} /><path d="M1040,0 L900,320 L1010,350 L880,700 L990,730 L860,1080" fill="none" stroke={INK} strokeWidth={10} /></svg>
      <Fire />
      {P(300, 640, Av('US', 330, 'angry', [1, 0], 'w2u'))}{P(640, 760, Av('UA', 230, 'angry', [1, 0], 'w2a'))}{P(560, 440, Av('JP', 190, 'angry', [1, 0], 'w2j'))}
      {P(1600, 640, Av('RU', 330, 'angry', [-1, 0], 'w2r'))}{P(1270, 770, Av('CN', 250, 'angry', [-1, 0], 'w2c'))}{P(1330, 440, Av('IR', 190, 'angry', [-1, 0], 'w2i'))}
      {P(940, 560, <div style={TXT(200, YELLOW, 24)}>VS</div>)}
      <Top><div style={TXT(210, '#fff', 26)}>WORLD WAR 3</div></Top>
      <Bot><Box bg="#fff" size={96}>SIMULATION</Box></Bot>
    </AbsoluteFill>
  );
  if (v === 'w3') return (
    // antes / después
    <AbsoluteFill style={{background: '#14467a', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 960, height: 1080, overflow: 'hidden'}}><div style={{position: 'absolute', left: -480, top: 0, width: 1920, height: 1080}}><Ocean t={0} /><MapW t={20} cam={{cx: 1150, cy: 420, s: 1.6}} /></div></div>
      <div style={{position: 'absolute', left: 960, top: 0, width: 960, height: 1080, overflow: 'hidden'}}><div style={{position: 'absolute', left: -480, top: 0, width: 1920, height: 1080}}><Ocean t={0} /><MapW t={850} cam={{cx: 1150, cy: 420, s: 1.6}} /></div><AbsoluteFill style={{background: 'rgba(90,0,0,0.25)'}} /></div>
      <div style={{position: 'absolute', left: 948, top: 0, width: 24, height: 1080, background: '#fff', borderLeft: `8px solid ${INK}`, borderRight: `8px solid ${INK}`}} />
      <Vign k={0.5} />
      <div style={{position: 'absolute', left: 60, top: 200}}><Box bg="#fff" size={90}>2026</Box></div>
      <div style={{position: 'absolute', right: 60, top: 200}}><Box bg={RED} size={90} color="#fff" rot={2}>AFTER WW3</Box></div>
      <Top><div style={TXT(170, YELLOW, 22)}>WORLD WAR 3 SIMULATION</div></Top>
    </AbsoluteFill>
  );
  if (v === 'i1') return (
    // Indonesia contra 50 banderas
    <AbsoluteFill style={{background: 'radial-gradient(circle at 25% 55%, #ff5a4a, #8a0f14 45%, #1a0608 100%)', overflow: 'hidden'}}>
      <Fire />
      {P(420, 600, Av('ID', 560, 'angry', [1, 0], 'i1d'))}
      {(['US', 'CN', 'RU', 'IN', 'JP', 'AU', 'KR', 'TR', 'IR', 'EG', 'SA', 'PK', 'VN', 'TH', 'MY', 'PH', 'KP', 'NZ', 'MN', 'KZ', 'AE', 'BD', 'MM', 'SG'] as string[]).map((c, i) => {
        const col = i % 6, row = Math.floor(i / 6);
        return <React.Fragment key={c}>{P(960 + col * 152 + (row % 2) * 40, 300 + row * 168, Av(c, i < 4 ? 170 : 140, 'scared', [-1, 0], `i1${c}`))}</React.Fragment>;
      })}
      <Top><div style={TXT(170, '#fff', 22)}>INDONESIA <span style={{color: YELLOW}}>vs</span> 50</div></Top>
      <Bot><Box bg={YELLOW} size={100}>CAN IT WIN?</Box></Bot>
    </AbsoluteFill>
  );
  if (v === 'i2') return (
    // el mapa: rojo contra la gran alianza
    <AbsoluteFill style={{background: '#14467a', overflow: 'hidden'}}>
      <Ocean t={0} /><MapI t={700} cam={{cx: 1300, cy: 520, s: 1.35}} />
      <Fire /><Vign k={0.6} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>{Line(1700, 380, 1420, 720)}{Line(560, 380, 1300, 720)}{Line(1000, 230, 1360, 690)}</svg>
      {Boom(1400, 740, 170)}
      {P(1420, 820, Av('ID', 300, 'angry', [0, -1], 'i2d'))}
      {P(300, 640, Av('US', 260, 'angry', [1, 0], 'i2u'))}{P(560, 330, Av('RU', 230, 'angry', [1, 0], 'i2r'))}{P(1700, 330, Av('CN', 230, 'angry', [-1, 0], 'i2c'))}
      <Top><div style={TXT(200, '#fff', 24)}>1 <span style={{color: YELLOW}}>vs</span> 50</div></Top>
      <div style={{position: 'absolute', left: 50, bottom: 50}}><Box bg={RED} size={96} color="#fff">INDONESIA</Box></div>
    </AbsoluteFill>
  );
  // i3: mapa entero de Indonesia ganando
  return (
    <AbsoluteFill style={{background: '#14467a', overflow: 'hidden'}}>
      <Ocean t={0} /><MapI t={880} cam={{cx: 1200, cy: 470, s: 1.15}} />
      <Vign k={0.55} />
      {P(1460, 640, Av('ID', 420, 'smug', [0, 0], 'i3d'))}
      <Top><div style={TXT(180, YELLOW, 22)}>INDONESIA</div></Top>
      <Bot><Box bg="#fff" size={110}>DEFEATS <span style={{color: RED}}>50</span> COUNTRIES?!</Box></Bot>
    </AbsoluteFill>
  );
};
