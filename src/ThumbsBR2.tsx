import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {INK, CREAM, RED, BLUE, GREEN, YELLOW, ORANGE, font, Face, Mood} from './lib3';
import {Ocean} from './War5';
import {WorldMap, WFlag, PL, nameOf} from './War6';

const TXT = (size: number, color: string, sw = size * 0.13): React.CSSProperties => ({...font, fontSize: size, color, WebkitTextStroke: `${sw}px ${INK}`, paintOrder: 'stroke fill', lineHeight: 0.92, textShadow: `0 ${size * 0.07}px 0 rgba(0,0,0,0.55)`, whiteSpace: 'nowrap'});
const Box: React.FC<{children: React.ReactNode; bg: string; size: number; rot?: number; color?: string}> = ({children, bg, size, rot = -2, color = INK}) => (
  <div style={{transform: `rotate(${rot}deg)`, background: bg, border: `12px solid ${INK}`, borderRadius: 32, padding: '6px 46px 0', ...font, fontSize: size, color, boxShadow: '0 14px 0 rgba(0,0,0,0.5)', whiteSpace: 'nowrap'}}>{children}</div>
);
// avatar redondo con la bandera real del país
const CA: React.FC<{code: string; size: number; mood?: Mood; look?: [number, number]; x?: boolean}> = ({code, size, mood = 'angry', look = [0, 0], x}) => (
  <div style={{position: 'relative', width: size, height: size}}>
    <div style={{width: size, height: size, borderRadius: '50%', overflow: 'hidden', border: `${Math.max(4, size * 0.05)}px solid ${INK}`, boxShadow: '0 6px 0 rgba(0,0,0,0.35)', boxSizing: 'border-box', filter: x ? 'grayscale(0.7) brightness(0.8)' : 'none'}}>
      <Img src={staticFile(`wflags/${code.toLowerCase()}.svg`)} style={{width: '150%', height: '100%', objectFit: 'cover', marginLeft: '-25%'}} />
    </div>
    <svg width={size} height={size} viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><Face x={0} y={-size * 0.04} r={size * 0.3} mood={x ? 'shocked' : mood} t={0.5} seed={code.charCodeAt(0)} look={look} /></svg>
    {x && <svg width={size} height={size} viewBox="0 0 100 100" style={{position: 'absolute', left: 0, top: 0}}><path d="M18,18 L82,82 M82,18 L18,82" stroke={INK} strokeWidth={22} strokeLinecap="round" /><path d="M18,18 L82,82 M82,18 L18,82" stroke={RED} strokeWidth={13} strokeLinecap="round" /></svg>}
  </div>
);
const Crown: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 100 70"><path d="M8,62 L4,18 L28,38 L50,6 L72,38 L96,18 L92,62 Z" fill={YELLOW} stroke={INK} strokeWidth={6} strokeLinejoin="round" /><circle cx={50} cy={44} r={7} fill={RED} stroke={INK} strokeWidth={3} /><circle cx={26} cy={50} r={5} fill={BLUE} stroke={INK} strokeWidth={3} /><circle cx={74} cy={50} r={5} fill={GREEN} stroke={INK} strokeWidth={3} /></svg>
);
const MANY = 'CA MX BR AR GB FR DE ES IT PL UA RU TR EG NG ZA SA IR IN PK CN JP KR ID AU VN TH CO PE KE ET MA DZ GR SE NO FI KZ MN PH'.split(' ');

export const ThumbBR2: React.FC<{v: string}> = ({v}) => {
  if (v === '1') return (
    // muro de países eliminados y un ganador
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #3a1010, #0d0d14)', overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: -20, display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 14, padding: 20, opacity: 0.9}}>
        {[...MANY, ...MANY.slice(0, 20)].slice(0, 60).map((c, i) => <CA key={i} code={c} size={170} x />)}
      </div>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 56%, rgba(255,210,63,0.55) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0.55) 70%)'}} />
      <div style={{position: 'absolute', left: 960, top: 600, transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{marginBottom: -40, zIndex: 2}}><Crown size={240} /></div>
        <CA code="US" size={380} mood="happy" />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'center'}}><Box bg="#fff" size={124}>195 ENTER. <span style={{color: RED}}>1 LEAVES.</span></Box></div>
    </AbsoluteFill>
  );
  if (v === '2') return (
    // tormenta estilo battle royale que se cierra sobre el mapa
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <Ocean t={0} /><WorldMap t={23} cam={{cx: 1000, cy: 470, s: 1.25}} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <defs><mask id="storm"><rect width={1920} height={1080} fill="white" /><circle cx={1180} cy={560} r={330} fill="black" /></mask>
          <radialGradient id="sg" cx="50%" cy="50%" r="70%"><stop offset="0%" stopColor="#7a2bd6" stopOpacity={0.55} /><stop offset="100%" stopColor="#3b0a7a" stopOpacity={0.9} /></radialGradient></defs>
        <rect width={1920} height={1080} fill="url(#sg)" mask="url(#storm)" />
        <circle cx={1180} cy={560} r={330} fill="none" stroke="#e9c8ff" strokeWidth={14} strokeDasharray="40 18" />
        <circle cx={1180} cy={560} r={330} fill="none" stroke="#b06bff" strokeWidth={36} opacity={0.35} />
      </svg>
      <div style={{position: 'absolute', left: 1180, top: 560, transform: 'translate(-50%,-50%)', display: 'flex', gap: 10}}><CA code="CN" size={190} look={[1, 0]} /><CA code="US" size={190} look={[-1, 0]} /></div>
      <div style={{position: 'absolute', left: 40, top: 60}}><div style={TXT(150, '#fff')}>THE ZONE</div><div style={{...TXT(150, '#d7a6ff'), marginTop: 14}}>IS CLOSING</div></div>
      <div style={{position: 'absolute', left: 40, bottom: 50}}><Box bg={YELLOW} size={100}>LAST COUNTRY STANDING</Box></div>
    </AbsoluteFill>
  );
  if (v === '3') return (
    // todos contra todos: flechas desde todas partes
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <Ocean t={0} /><WorldMap t={60} cam={{cx: 960, cy: 470, s: 1.1}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%, rgba(120,0,0,0.15) 20%, rgba(80,0,0,0.75) 100%)'}} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {[[[300, 300], [800, 520]], [[600, 900], [880, 640]], [[1700, 250], [1150, 480]], [[1650, 900], [1150, 650]], [[960, 120], [960, 420]], [[150, 650], [700, 640]], [[1850, 600], [1250, 580]]].map(([a, b], i) => {
          const [x0, y0] = a, [x1, y1] = b; const ang = Math.atan2(y1 - y0, x1 - x0); const c = [RED, ORANGE, YELLOW, RED, ORANGE, YELLOW, RED][i];
          return <g key={i}><line x1={x0} y1={y0} x2={x1} y2={y1} stroke={INK} strokeWidth={52} strokeLinecap="round" /><line x1={x0} y1={y0} x2={x1} y2={y1} stroke={c} strokeWidth={34} strokeLinecap="round" /><polygon points={`${x1 + Math.cos(ang) * 50},${y1 + Math.sin(ang) * 50} ${x1 + Math.cos(ang + 2.5) * 60},${y1 + Math.sin(ang + 2.5) * 60} ${x1 + Math.cos(ang - 2.5) * 60},${y1 + Math.sin(ang - 2.5) * 60}`} fill={c} stroke={INK} strokeWidth={9} strokeLinejoin="round" /></g>;
        })}
        {Array.from({length: 18}).map((_, i) => { const a = (i / 18) * Math.PI * 2, r = i % 2 ? 120 : 180; return null; })}
      </svg>
      <div style={{position: 'absolute', left: 960, top: 560, transform: 'translate(-50%,-50%)', fontSize: 300}}>💥</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'center'}}><Box bg="#fff" size={118}>EVERY COUNTRY <span style={{color: RED}}>vs</span> EVERY COUNTRY</Box></div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, display: 'flex', justifyContent: 'center'}}><Box bg={YELLOW} size={130} rot={2}>WHO SURVIVES?</Box></div>
    </AbsoluteFill>
  );
  if (v === '4') {
    // estilo videojuego: lista de eliminaciones
    const feed: [string, string][] = [['US', 'CA'], ['CN', 'JP'], ['TR', 'GR'], ['IN', 'PK'], ['BR', 'AR'], ['FR', 'DE'], ['RU', 'PL'], ['US', 'CN']];
    return (
      <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
        <Ocean t={0} /><WorldMap t={500} cam={{cx: 1100, cy: 480, s: 1.2}} />
        <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.1))'}} />
        <div style={{position: 'absolute', left: 40, top: 40, display: 'flex', flexDirection: 'column', gap: 12}}>
          {feed.map(([a, b], i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 16, background: i === feed.length - 1 ? 'rgba(212,42,36,0.95)' : 'rgba(16,22,34,0.9)', border: '4px solid rgba(255,255,255,0.4)', borderRadius: 16, padding: '6px 22px 4px 10px', ...font, fontSize: i === feed.length - 1 ? 62 : 46, color: '#fff', alignSelf: 'flex-start', opacity: 0.55 + 0.45 * (i / (feed.length - 1))}}>
              <WFlag code={a} w={i === feed.length - 1 ? 84 : 64} h={i === feed.length - 1 ? 56 : 43} />{nameOf(a)}<span style={{color: YELLOW}}>⚔</span><WFlag code={b} w={i === feed.length - 1 ? 84 : 64} h={i === feed.length - 1 ? 56 : 43} /><span style={{textDecoration: 'line-through', textDecorationThickness: 5, color: '#ffd0cc'}}>{nameOf(b)}</span>
            </div>
          ))}
        </div>
        <div style={{position: 'absolute', right: 50, top: 70, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
          <div style={TXT(64, '#fff')}>COUNTRIES LEFT</div>
          <div style={TXT(420, YELLOW, 40)}>1</div>
        </div>
        <div style={{position: 'absolute', right: 50, bottom: 50}}><Box bg={YELLOW} size={92} rot={2}>VICTORY ROYALE?</Box></div>
      </AbsoluteFill>
    );
  }
  if (v === '5') return (
    // podio
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #2d6fd1, #0f2550)', overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, opacity: 0.35}}><WorldMap t={300} cam={{cx: 960, cy: 470, s: 1.0}} /></div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 26}}>
        {[['CN', 2, 320, '#c9d1d9', 360], ['US', 1, 460, YELLOW, 300], ['RU', 3, 230, '#d48a4b', 320]].map(([c, n, h, col, sz]) => (
          <div key={c as string} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            {n === 1 && <div style={{marginBottom: -36, zIndex: 2}}><Crown size={200} /></div>}
            <CA code={c as string} size={sz as number} mood={n === 1 ? 'happy' : n === 2 ? 'angry' : 'sad'} />
            <div style={{width: 380, height: h as number, marginTop: 14, background: col as string, border: `10px solid ${INK}`, borderBottom: 'none', borderRadius: '24px 24px 0 0', display: 'flex', justifyContent: 'center', paddingTop: 10, ...font, fontSize: 150, color: INK}}>{n}</div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'center'}}><Box bg="#fff" size={120}>WORLD WAR <span style={{color: RED}}>PODIUM</span></Box></div>
      <div style={{position: 'absolute', left: 40, top: 230}}><div style={TXT(84, YELLOW)}>195</div><div style={TXT(52, '#fff')}>COUNTRIES</div></div>
    </AbsoluteFill>
  );
  // 6: la sorpresa (Suiza resiste)
  return (
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <Ocean t={0} /><WorldMap t={180} cam={{cx: 1000, cy: 330, s: 3.2}} />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, rgba(0,0,0,0) 20%, rgba(0,0,0,0.7) 75%)'}} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {Array.from({length: 10}).map((_, i) => {
          const a = (i / 10) * Math.PI * 2 + 0.3, x0 = 960 + Math.cos(a) * 900, y0 = 600 + Math.sin(a) * 600, x1 = 960 + Math.cos(a) * 330, y1 = 600 + Math.sin(a) * 300;
          return <g key={i}><line x1={x0} y1={y0} x2={x1} y2={y1} stroke={INK} strokeWidth={40} strokeLinecap="round" /><line x1={x0} y1={y0} x2={x1} y2={y1} stroke={RED} strokeWidth={24} strokeLinecap="round" /></g>;
        })}
        <circle cx={960} cy={600} r={300} fill="rgba(140,220,255,0.25)" stroke="#bfefff" strokeWidth={14} />
      </svg>
      <div style={{position: 'absolute', left: 960, top: 600, transform: 'translate(-50%,-50%)'}}><CA code="CH" size={380} mood="smug" /></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'center'}}><Box bg="#fff" size={110}>THE WORLD vs <span style={{color: RED}}>SWITZERLAND</span></Box></div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, display: 'flex', justifyContent: 'center'}}><Box bg={YELLOW} size={120} rot={2}>NOBODY EXPECTED THIS</Box></div>
    </AbsoluteFill>
  );
};
