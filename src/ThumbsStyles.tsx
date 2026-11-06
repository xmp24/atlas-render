// Miniaturas adaptadas al estilo de 10 canales del nicho (sin copiar sus personajes ni marcas):
// S1 What If (cinemático 3D) · S2 Hoog (espacio realista, casi sin texto) · S3 MrSpherical (mapa + VS)
// S4 Dokdo Studio (escena cartoon de habitación) · S5 3D Countryballs (bolas brillantes con luz dramática)
// S6 Infographics Show (personaje + flecha + círculo rojo) · S7 RealLifeLore (mapa limpio con región resaltada)
// S8 Kurzgesagt (vector plano neón) · S9 Bright Side (collage, flechas, caras) · S10 Mapping (año vs año en mapa)
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COUNTRIES} from './HexWorld';
import {INK, Mood, font, font2} from './lib3';
import {Planet} from './Logos';
import {Earth} from './ThumbsBurn';
import {Title3D, GOLD, WHITE} from './ThumbsFinal';
import {Glow, Rays, Icon, Ball, Embers} from './ThumbsPro';
import {LandMap, Eyes, CYAN, ICE, FIRE, BLOOD, PURP} from './ThumbsWorld2';

const W = 1280, H = 720;
const K = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const T: React.FC<{text: string; x: number; y: number; size: number; c?: string; sw?: number; f?: any; rot?: number; anchor?: 'l' | 'c' | 'r'; shadow?: string}> = ({text, x, y, size, c = '#fff', sw, f = font, rot = 0, anchor = 'c', shadow}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(${anchor === 'c' ? '-50%' : anchor === 'r' ? '-100%' : '0'},0) rotate(${rot}deg)`, ...f, fontSize: size, color: c, whiteSpace: 'nowrap', lineHeight: 1,
    WebkitTextStroke: sw ? `${sw}px ${INK}` : undefined, paintOrder: 'stroke fill', textShadow: shadow ?? `0 ${size * 0.06}px 0 rgba(0,0,0,0.55)`}}>{text}</div>
);
const Stars: React.FC<{n?: number; seed?: number}> = ({n = 140, seed = 2}) => <>{Array.from({length: n}, (_, i) => { const s = rnd(i * 3 + seed) * 2.6 + 0.6; return <div key={i} style={{position: 'absolute', left: rnd(i + seed) * W, top: rnd(i * 7 + seed) * H, width: s, height: s, borderRadius: '50%', background: '#fff', opacity: 0.35 + rnd(i * 5) * 0.65}} />; })}</>;
const Arrow: React.FC<{x: number; y: number; rot: number; s?: number; col?: string}> = ({x, y, rot, s = 1, col = '#ff2a1a'}) => (
  <svg width={260 * s} height={160 * s} viewBox="0 0 260 160" style={{position: 'absolute', left: x - 130 * s, top: y - 80 * s, transform: `rotate(${rot}deg)`, overflow: 'visible', filter: 'drop-shadow(0 6px 0 rgba(0,0,0,0.5))'}}>
    <path d="M10,95 Q110,20 200,70 L190,30 L250,95 L175,130 L190,95 Q110,55 30,115 Z" fill={col} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
  </svg>
);
const Circle: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', border: '12px solid #ff2a1a', boxShadow: '0 0 0 4px #fff, 0 6px 0 4px rgba(0,0,0,0.4)'}} />;

// ---------- S1 · What If (cinemático) ----------
const S1: React.FC<{v: 'cold' | 'heat'}> = ({v}) => {
  const cold = v === 'cold';
  return (<AbsoluteFill style={{background: cold ? 'radial-gradient(ellipse at 70% 60%, #1a3a5a 0%, #050a14 70%)' : 'radial-gradient(ellipse at 70% 60%, #5a1a06 0%, #0a0302 70%)', overflow: 'hidden'}}>
    <Stars n={160} />
    <Glow x={860} y={430} r={560} c={cold ? 'rgba(170,230,255,0.55)' : 'rgba(255,120,30,0.65)'} />
    <div style={{position: 'absolute', left: 0, top: 0, filter: cold ? 'grayscale(0.55) brightness(1.45) hue-rotate(170deg) saturate(1.5)' : 'saturate(1.3) contrast(1.1)'}}><Earth x={880} y={460} size={720} lon={20} lat={25} burn={cold ? 0 : 1.4} /></div>
    {cold && <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, mixBlendMode: 'screen'}}>{Array.from({length: 26}, (_, i) => { const a = rnd(i) * 6.28, r1 = 120 + rnd(i + 3) * 200, r2 = r1 + 60 + rnd(i + 7) * 120; return <path key={i} d={`M${880 + Math.cos(a) * r1},${460 + Math.sin(a) * r1} L${880 + Math.cos(a + 0.05) * r2},${460 + Math.sin(a + 0.05) * r2}`} stroke="rgba(230,250,255,0.7)" strokeWidth={3} />; })}</svg>}
    {!cold && <Embers n={90} seed={5} c="#ffb347" />}
    <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 38%, rgba(0,0,0,0) 60%)'}} />
    <T text="WHAT IF EARTH" x={60} y={150} size={58} anchor="l" c="#ffffff" f={font2} shadow="0 4px 18px rgba(0,0,0,0.9)" />
    <T text={cold ? 'FROZE' : 'BURNED'} x={50} y={215} size={190} anchor="l" c={cold ? '#bfeaff' : '#ffb21a'} f={font} shadow={`0 0 40px ${cold ? 'rgba(120,210,255,0.9)' : 'rgba(255,120,20,0.9)'}, 0 8px 0 rgba(0,0,0,0.6)`} />
    <T text={cold ? '-1°C EVERY MONTH' : '+1°C EVERY MONTH'} x={62} y={430} size={52} anchor="l" c="#fff" f={font2} shadow="0 4px 14px rgba(0,0,0,0.9)" />
  </AbsoluteFill>);
};

// ---------- S2 · Hoog (espacio realista, minimalista) ----------
const S2: React.FC<{v: 'deathdate' | 'power'}> = ({v}) => {
  const ast = v === 'deathdate';
  return (<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    <Stars n={260} seed={7} />
    <Glow x={ast ? 520 : 640} y={ast ? 470 : 380} r={430} c="rgba(90,150,255,0.35)" />
    <div style={{position: 'absolute', left: 0, top: 0, filter: ast ? 'brightness(1.1)' : 'brightness(0.32) saturate(0.6)'}}><Earth x={ast ? 520 : 640} y={ast ? 470 : 380} size={ast ? 640 : 560} lon={ast ? 105 : 20} lat={20} /></div>
    {!ast && <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>{Array.from({length: 40}, (_, i) => { const a = rnd(i) * 6.28, r = rnd(i + 9) * 250; return <circle key={i} cx={640 + Math.cos(a) * r} cy={380 + Math.sin(a) * r * 0.9} r={1.4 + rnd(i) * 1.6} fill={i < 3 ? '#ffd96a' : 'rgba(255,217,106,0)'} />; })}</svg>}
    {ast && <><div style={{position: 'absolute', left: 840, top: 40, width: 520, height: 140, transform: 'rotate(-145deg)', transformOrigin: '0 50%', background: 'linear-gradient(90deg, rgba(255,140,40,0.95), rgba(255,90,20,0))', filter: 'blur(10px)'}} />
      <div style={{position: 'absolute', left: 800, top: 20, width: 150, height: 130, borderRadius: '48% 52% 45% 55%', background: 'radial-gradient(circle at 35% 35%, #9a8a7a, #3a2a20 70%)', boxShadow: '0 0 60px 20px rgba(255,140,40,0.7)'}} /></>}
    <T text={ast ? '14 · 08 · 2033' : 'THE DAY EARTH WENT DARK'} x={640} y={ast ? 610 : 640} size={ast ? 64 : 48} c="#fff" f={font2} shadow="0 0 20px rgba(0,0,0,1)" />
  </AbsoluteFill>);
};

// ---------- S3 · MrSpherical (mapa + VS) ----------
const S3: React.FC<{v: 'powers' | 'ocean'}> = ({v}) => {
  const p = v === 'powers';
  return (<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    <LandMap land={p ? '#2f9a4a' : '#7ccf5a'} />
    {!p && <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(20,90,220,0.75) 0%, rgba(20,90,220,0.25) 55%, rgba(20,90,220,0) 75%)'}} />}
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)'}} />
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: 150, background: 'linear-gradient(180deg, rgba(0,0,0,0.75), rgba(0,0,0,0))'}} />
    {p ? <>
      <Glow x={330} y={420} r={280} c="rgba(255,210,60,0.8)" />
      <Ball k={K('NG')} size={330} mood="angry" x={330} y={420} crown rim="#ffd23f" />
      {['BJ', 'NE', 'TD', 'CM', 'GH'].map((c, i) => <Ball key={c} k={K(c)} size={120} mood="scared" sweat x={830 + (i % 3) * 150} y={300 + Math.floor(i / 3) * 170 + (i % 2) * 20} rim="#ff6a5a" look={[-0.7, 0]} />)}
      <T text="VS" x={640} y={330} size={150} c="#ffd23f" sw={14} />
      <T text="NIGERIA WITH SUPERPOWERS" x={640} y={40} size={66} sw={10} />
    </> : <>
      <Glow x={360} y={400} r={280} c="rgba(120,200,255,0.8)" />
      <Ball k={K('NL')} size={330} mood="angry" helmet x={360} y={400} rim="#7fd0ff" />
      <Icon name="big-wave" x={940} y={420} w={420} c="#3a9aff" glow="#7fd0ff" />
      <T text="VS" x={650} y={320} size={150} c="#ffd23f" sw={14} />
      <T text="NETHERLANDS VS THE OCEAN" x={640} y={40} size={64} sw={10} />
    </>}
    <T text={p ? 'YEAR 5' : '+1 METER EVERY WEEK'} x={640} y={630} size={52} c="#fff" sw={8} />
  </AbsoluteFill>);
};

// ---------- S4 · Dokdo Studio (escena cartoon) ----------
const Room: React.FC<{night?: boolean}> = ({night}) => (<>
  <AbsoluteFill style={{background: night ? 'linear-gradient(180deg, #1c2450 0%, #2a3470 60%, #3a2a50 100%)' : 'linear-gradient(180deg, #f6e6c8 0%, #ecd2a6 62%, #b07a4a 62%, #8a5a34 100%)'}} />
  <div style={{position: 'absolute', left: 880, top: 70, width: 300, height: 240, background: night ? 'radial-gradient(circle at 70% 30%, #fff8d0 0 30px, #0a1030 31px)' : '#9fd8ff', border: `12px solid ${night ? '#5a4a8a' : '#fff'}`, borderRadius: 10, boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}} />
  {night && <div style={{position: 'absolute', left: 60, top: 470, width: 700, height: 160, background: 'linear-gradient(180deg, #6a7ad8, #3a4aa8)', borderRadius: 30, border: `8px solid ${INK}`}} />}
  {night && <div style={{position: 'absolute', left: 70, top: 410, width: 230, height: 90, background: '#f0f0ff', borderRadius: 40, border: `8px solid ${INK}`}} />}
</>);
const S4: React.FC<{v: 'nosleep' | 'memory'}> = ({v}) => {
  const ns = v === 'nosleep';
  return (<AbsoluteFill style={{overflow: 'hidden'}}>
    <Room night={ns} />
    {ns ? <>
      <Ball k={K('US')} size={330} mood="shocked" sweat x={420} y={400} rim="#b98aff" look={[0.4, -0.3]} />
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>{[-1, 1].map((d) => <path key={d} d={`M${420 + d * 55 - 42},${420} Q${420 + d * 55},${450} ${420 + d * 55 + 42},${420}`} fill="none" stroke="#6a3a9a" strokeWidth={12} strokeLinecap="round" />)}</svg>
      <Icon name="alarm-clock" x={980} y={470} w={190} c="#ffd23f" rot={12} glow="#ffd23f" />
      <div style={{position: 'absolute', left: 620, top: 150, background: '#fff', border: `7px solid ${INK}`, borderRadius: 34, padding: '10px 28px', ...font, fontSize: 64, color: INK}}>DAY 11...</div>
      <T text="NOBODY CAN SLEEP" x={640} y={600} size={88} c="#d8b8ff" sw={12} />
    </> : <>
      <Ball k={K('FR')} size={300} mood="happy" x={360} y={410} rim="#ffd23f" />
      <Ball k={K('FR')} size={300} mood="shocked" sweat x={900} y={410} rim="#ffd23f" look={[-0.6, 0]} />
      <div style={{position: 'absolute', left: 120, top: 140, background: '#fff', border: `7px solid ${INK}`, borderRadius: 34, padding: '8px 24px', ...font, fontSize: 56, color: INK}}>Hi honey!</div>
      <div style={{position: 'absolute', left: 760, top: 140, background: '#fff', border: `7px solid ${INK}`, borderRadius: 34, padding: '8px 24px', ...font, fontSize: 56, color: INK}}>WHO ARE YOU?!</div>
      <T text="00:00" x={640} y={590} size={110} c="#ffb0d0" sw={14} />
    </>}
  </AbsoluteFill>);
};

// ---------- S5 · 3D Countryballs (luz dramática) ----------
const S5: React.FC<{v: 'purge' | 'gravity'}> = ({v}) => {
  const pu = v === 'purge';
  return (<AbsoluteFill style={{background: pu ? 'radial-gradient(ellipse at 50% 60%, #6a0606 0%, #120000 70%)' : 'radial-gradient(ellipse at 50% 50%, #3a2a8a 0%, #05030f 75%)', overflow: 'hidden'}}>
    {!pu && <Stars n={120} />}
    {pu ? <>
      <div style={{position: 'absolute', left: -200, top: -200, width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,30,30,0.7), transparent 70%)'}} />
      <div style={{position: 'absolute', left: 800, top: -220, width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(40,90,255,0.6), transparent 70%)'}} />
      <div style={{position: 'absolute', left: 0, top: 0, filter: 'contrast(1.25) saturate(1.2) drop-shadow(0 30px 40px rgba(0,0,0,0.8))'}}><Ball k={K('US')} size={460} mood="angry" x={640} y={380} rim="#ff2a1a" look={[0, 0.2]} /></div>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><path d="M440,350 Q640,300 840,350 L830,410 Q640,370 450,410 Z" fill="#111" stroke="#000" strokeWidth={6} /><ellipse cx={560} cy={378} rx={34} ry={20} fill="#ff2a1a" /><ellipse cx={720} cy={378} rx={34} ry={20} fill="#ff2a1a" /></svg>
      <T text="7:00 PM" x={640} y={600} size={110} c="#ff3b30" sw={12} shadow="0 0 30px rgba(255,40,30,0.9)" />
    </> : <>
      {[['US', 330, 300, 230, -25], ['JP', 820, 230, 200, 30], ['BR', 1060, 480, 180, -40], ['IN', 560, 520, 170, 50]].map(([c, x, y, s, r], i) =>
        <div key={i} style={{position: 'absolute', left: 0, top: 0, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.7))'}}><Ball k={K(c as string)} size={s as number} mood="scared" sweat x={x as number} y={y as number} rot={r as number} rim="#b98aff" /></div>)}
      <T text="NO GRAVITY" x={640} y={40} size={110} c="#e8dcff" sw={12} shadow="0 0 30px rgba(185,138,255,0.9)" />
    </>}
  </AbsoluteFill>);
};

// ---------- S6 · Infographics Show (personaje + flecha + círculo) ----------
const S6: React.FC<{v: 'thirty' | 'money'}> = ({v}) => {
  const th = v === 'thirty';
  return (<AbsoluteFill style={{background: th ? 'linear-gradient(135deg, #ffd23f 0%, #ff8a1a 100%)' : 'linear-gradient(135deg, #3bd16f 0%, #0e7a3a 100%)', overflow: 'hidden'}}>
    <Rays x={330} y={420} c="rgba(255,255,255,0.6)" a={0.35} n={16} r={900} />
    <Ball k={K(th ? 'US' : 'GB')} size={420} mood={th ? 'shocked' : 'sad'} sweat x={330} y={430} rim="#fff" look={[0.6, -0.2]} />
    <div style={{position: 'absolute', left: 640, top: 140, width: 560, height: 300, background: '#fff', border: `10px solid ${INK}`, borderRadius: 26, transform: 'rotate(3deg)', boxShadow: '0 10px 0 rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
      <div style={{...font, fontSize: 52, color: INK}}>{th ? 'AGE' : 'BALANCE'}</div><div style={{...font, fontSize: th ? 150 : 118, color: '#e5322d', lineHeight: 1}}>{th ? '30' : '$0.00'}</div>
    </div>
    <Circle x={920} y={340} r={th ? 120 : 190} />
    <Arrow x={600} y={250} rot={-20} s={1.2} />
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 150, background: '#e5322d', borderTop: `10px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: 92, color: '#fff', WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill'}}>{th ? 'EVERYONE DIES AT 30' : 'ALL MONEY IS GONE'}</div>
  </AbsoluteFill>);
};

// ---------- S7 · RealLifeLore (mapa limpio, región resaltada) ----------
const S7: React.FC<{v: 'babies' | 'deathdate'}> = ({v}) => {
  const b = v === 'babies';
  return (<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, filter: 'saturate(0.35) brightness(0.8)'}}><LandMap land="#c8c4b8" /></div>
    {b ? <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><defs><radialGradient id="g7"><stop offset="0" stopColor="#ff3b30" stopOpacity="0.95" /><stop offset="1" stopColor="#ff3b30" stopOpacity="0" /></radialGradient></defs>
        <circle cx={600} cy={170} r={200} fill="url(#g7)" /></svg>
      : <AbsoluteFill style={{background: 'radial-gradient(ellipse at 100% 45%, rgba(255,40,30,0.75) 0%, rgba(255,40,30,0) 45%)'}} />}
    <T text={b ? 'WHY EUROPE IS' : 'WHY THIS ZONE'} x={70} y={430} size={92} anchor="l" c="#fff" f={font2} shadow="0 5px 20px rgba(0,0,0,0.9)" />
    <T text={b ? 'RUNNING OUT OF PEOPLE' : 'DIES ON ONE DAY'} x={70} y={530} size={92} anchor="l" c={b ? '#ff4a3a' : '#ff4a3a'} f={font2} shadow="0 5px 20px rgba(0,0,0,0.9)" />
  </AbsoluteFill>);
};

// ---------- S8 · Kurzgesagt (vector plano neón) ----------
const S8: React.FC<{v: 'power' | 'cold'}> = ({v}) => {
  const pw = v === 'power';
  const bg = pw ? '#0b0d2a' : '#0a2a4a';
  return (<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 55%, ${pw ? '#1a1f5a' : '#1a5a8a'} 0%, ${bg} 70%)`, overflow: 'hidden'}}>
    <Stars n={90} seed={11} />
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      <circle cx={640} cy={400} r={300} fill={pw ? 'rgba(255,217,106,0.08)' : 'rgba(170,230,255,0.15)'} />
      <circle cx={640} cy={400} r={250} fill={pw ? '#2a4ab8' : '#e8f6ff'} />
      <path d="M470,300 q60,-60 130,-20 q40,40 110,10 q60,40 40,110 q-40,60 -120,50 q-60,30 -110,-20 q-70,-40 -50,-130 Z" fill={pw ? '#3ac87a' : '#ffffff'} />
      <path d="M690,430 q50,-20 90,30 q10,60 -50,80 q-60,0 -60,-50 Z" fill={pw ? '#3ac87a' : '#ffffff'} />
      <circle cx={640} cy={400} r={250} fill="none" stroke={pw ? '#3a4aa8' : '#8ad8ff'} strokeWidth={10} />
      {pw && <path d="M640,150 A250,250 0 0 1 640,650 Z" fill="rgba(0,0,0,0.55)" />}
      {pw && Array.from({length: 40}, (_, i) => { const a = rnd(i) * 3.14 + 1.57, r = 40 + rnd(i + 4) * 190; return <circle key={i} cx={640 + Math.cos(a) * r} cy={400 + Math.sin(a) * r} r={3 + rnd(i) * 3} fill="#ffd96a" opacity={0.9} />; })}
      {pw && <g transform="translate(980,330)"><circle r={70} fill="#ffd96a" opacity={0.25} /><path d="M-30,-40 a40,40 0 1 1 60,0 q-10,20 -10,40 h-40 q0,-20 -10,-40 Z" fill="#3a3a5a" stroke="#ffd96a" strokeWidth={6} /><rect x={-18} y={4} width={36} height={22} rx={4} fill="#ffd96a" /><path d="M-12,-30 l24,40" stroke="#ff4a3a" strokeWidth={8} strokeLinecap="round" /></g>}
      {!pw && Array.from({length: 10}, (_, i) => <path key={i} d={`M${400 + i * 55},${150 + (i % 2) * 20} l14,-24 l14,24 l-14,24 Z`} fill="#bfeaff" opacity={0.7} />)}
    </svg>
    {/* criaturitas planas (estilo propio, no copiado) */}
    {[[300, 600, '#ff6a8a'], [980, 590, '#ffd23f'], [1080, 250, '#7af0b0']].map(([x, y, c], i) => <div key={i} style={{position: 'absolute', left: (x as number) - 45, top: (y as number) - 40, width: 90, height: 80, borderRadius: '50% 50% 45% 45%', background: c as string}}>
      <div style={{position: 'absolute', left: 22, top: 26, width: 14, height: 14, borderRadius: '50%', background: '#111'}} /><div style={{position: 'absolute', left: 54, top: 26, width: 14, height: 14, borderRadius: '50%', background: '#111'}} />
      <div style={{position: 'absolute', left: 36, top: 50, width: 18, height: 12, borderRadius: '50%', background: '#111'}} /></div>)}
    <T text={pw ? 'What If Electricity Stopped?' : 'What If Earth Froze?'} x={640} y={40} size={78} c="#fff" f={font2} shadow="0 4px 0 rgba(0,0,0,0.35)" />
  </AbsoluteFill>);
};

// ---------- S9 · Bright Side (collage + flechas + caras) ----------
const S9: React.FC<{v: 'memory' | 'nosleep'}> = ({v}) => {
  const m = v === 'memory';
  return (<AbsoluteFill style={{background: m ? '#ffe8f2' : '#efe6ff', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 30, top: 60, width: 600, height: 600, borderRadius: 30, overflow: 'hidden', border: '10px solid #fff', boxShadow: '0 10px 30px rgba(0,0,0,0.35)'}}>
      <div style={{position: 'absolute', inset: 0, filter: m ? 'brightness(1.1)' : 'hue-rotate(40deg)'}}><LandMap land={m ? '#e8eef8' : '#b48aff'} /></div>
      <div style={{position: 'absolute', left: 0, top: 0}}><Planet size={420} mood="shocked" lon={15} lat={20} rim="#fff" /></div>
    </div>
    <div style={{position: 'absolute', left: 660, top: 60, width: 590, height: 600, borderRadius: 30, overflow: 'hidden', border: '10px solid #fff', background: m ? 'linear-gradient(135deg, #ff8ac0, #8a3a8a)' : 'linear-gradient(135deg, #3a1a8a, #0a0520)', boxShadow: '0 10px 30px rgba(0,0,0,0.35)'}}>
      <Icon name={m ? 'brain' : 'alarm-clock'} x={295} y={300} w={330} c="#fff" glow="#fff" />
    </div>
    <Circle x={950} y={360} r={190} />
    <Arrow x={640} y={160} rot={20} s={1.3} col="#ffd23f" />
    <div style={{position: 'absolute', left: 300, top: 610, background: '#ffd23f', border: `8px solid ${INK}`, padding: '6px 26px', ...font, fontSize: 70, color: INK, transform: 'rotate(-2deg)'}}>{m ? 'GONE AT MIDNIGHT' : '30 NIGHTS AWAKE'}</div>
  </AbsoluteFill>);
};

// ---------- S10 · Mapping (año vs año) ----------
const S10: React.FC<{v: 'powers' | 'heat'}> = ({v}) => {
  const p = v === 'powers';
  return (<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)'}}><LandMap land={p ? '#8ac86a' : '#7ccf5a'} /><Eyes mood="happy" skip={(x, y) => x > 600 || y < 130} /></div>
    <div style={{position: 'absolute', inset: 0, clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)'}}><LandMap land={p ? '#ffd23f' : '#ff7a1a'} />{!p && <Embers n={50} seed={3} />}<Eyes mood={p ? 'angry' : 'scared'} skip={(x, y) => x < 680 || y < 130} /></div>
    <div style={{position: 'absolute', left: 634, top: 0, width: 12, height: H, background: '#fff', boxShadow: '0 0 20px #fff'}} />
    <div style={{position: 'absolute', left: 40, top: 30, background: '#fff', border: `7px solid ${INK}`, borderRadius: 14, padding: '2px 22px', ...font, fontSize: 70, color: INK}}>{p ? '2030' : '+15°C'}</div>
    <div style={{position: 'absolute', right: 40, top: 30, background: p ? '#ffd23f' : '#ff3b30', border: `7px solid ${INK}`, borderRadius: 14, padding: '2px 22px', ...font, fontSize: 70, color: p ? INK : '#fff'}}>{p ? '2040' : '+460°C'}</div>
    <Ball k={K(p ? 'NG' : 'CA')} size={230} mood={p ? 'smug' : 'smug'} crown x={960} y={470} rim="#ffd23f" />
    <Ball k={K(p ? 'NG' : 'CA')} size={190} mood="calm" x={320} y={480} rim="#fff" />
  </AbsoluteFill>);
};

export const STYLES: Record<string, React.ReactNode> = {
  's1-cold': <S1 v="cold" />, 's1-heat': <S1 v="heat" />, 's2-deathdate': <S2 v="deathdate" />, 's2-power': <S2 v="power" />,
  's3-powers': <S3 v="powers" />, 's3-ocean': <S3 v="ocean" />, 's4-nosleep': <S4 v="nosleep" />, 's4-memory': <S4 v="memory" />,
  's5-purge': <S5 v="purge" />, 's5-gravity': <S5 v="gravity" />, 's6-thirty': <S6 v="thirty" />, 's6-money': <S6 v="money" />,
  's7-babies': <S7 v="babies" />, 's7-deathdate': <S7 v="deathdate" />, 's8-power': <S8 v="power" />, 's8-cold': <S8 v="cold" />,
  's9-memory': <S9 v="memory" />, 's9-nosleep': <S9 v="nosleep" />, 's10-powers': <S10 v="powers" />, 's10-heat': <S10 v="heat" />,
};
export const ThumbStyle: React.FC<{id: string}> = ({id}) => <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>{STYLES[id]}</AbsoluteFill>;
void CYAN; void ICE; void FIRE; void BLOOD; void PURP; void GOLD; void WHITE; void Title3D;
