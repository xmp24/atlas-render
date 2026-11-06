// Miniaturas día 5: los 15 vídeos (1280x720)
import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {COUNTRIES} from './HexWorld';
import {INK, font} from './lib3';
import {WorldBg, VS} from './ThumbsMap';
import {Embers, Glow, Rays} from './ThumbsPro';
import {CBall, AK} from './ThumbsCB';
import {SplitBg, BoltFX, WarHelmet, Title3D, GOLD, WHITE, REDG, Muzzle, Tracers, Smoke, Vign, SadEarth} from './ThumbsFinal';
import SJ from './hw/states.json';

const K = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
const W = 1280, H = 720;
const Ico: React.FC<{n: string; x: number; y: number; w: number; c: string; rot?: number; flip?: boolean}> = ({n, x, y, w, c, rot = 0, flip}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - w / 2, width: w, height: w, transform: `rotate(${rot}deg) scaleX(${flip ? -1 : 1})`, filter: `drop-shadow(0 0 2px ${INK}) drop-shadow(0 0 2px ${INK}) drop-shadow(0 6px 6px rgba(0,0,0,0.5))`}}>
    <div style={{width: '100%', height: '100%', background: c, WebkitMaskImage: `url(${staticFile(`hw/icons/${n}.svg`)})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center'}} />
  </div>
);
const Mystery: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (<>
  <Glow x={x} y={y} r={s * 0.95} c="rgba(255,215,70,0.65)" />
  <div style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: '50%', background: 'radial-gradient(circle at 35% 28%, #3a3a3a, #0a0a0a 70%)', border: `${s * 0.035}px solid #ffd23f`, boxShadow: '0 0 60px #ffd23f', display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: s * 0.72, color: '#ffd23f', lineHeight: 1}}>?</div>
  <Ico n="crown" x={x} y={y - s * 0.62} w={s * 0.48} c="linear-gradient(180deg, #fff3a0, #ffc21a 60%, #d48a00)" />
</>);
const XMark: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <svg width={s} height={s} style={{position: 'absolute', left: x - s / 2, top: y - s / 2, overflow: 'visible'}}>
    {[[0.18, 0.18, 0.82, 0.82], [0.82, 0.18, 0.18, 0.82]].map(([a, b, c, d], i) => <line key={i} x1={a * s} y1={b * s} x2={c * s} y2={d * s} stroke={INK} strokeWidth={s * 0.2} strokeLinecap="round" />)}
    {[[0.18, 0.18, 0.82, 0.82], [0.82, 0.18, 0.18, 0.82]].map(([a, b, c, d], i) => <line key={i + 2} x1={a * s} y1={b * s} x2={c * s} y2={d * s} stroke="#ff1f2f" strokeWidth={s * 0.13} strokeLinecap="round" />)}
  </svg>
);
const Boom: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: 'radial-gradient(circle, #fff7c0 0%, #ffcf3a 25%, #ff6a12 50%, rgba(200,30,10,0.6) 70%, rgba(0,0,0,0) 75%)'}} />
);
const Badge: React.FC<{text: string; x: number; y: number; bg: string; size?: number; rot?: number; c?: string}> = ({text, x, y, bg, size = 44, rot = -4, c = '#fff'}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,0) rotate(${rot}deg)`, background: bg, border: `5px solid ${INK}`, borderRadius: 16, padding: '4px 20px 0', ...font, fontSize: size, color: c, boxShadow: '0 7px 0 rgba(0,0,0,0.45)', whiteSpace: 'nowrap'}}>{text}</div>
);
const ring = (n: number, cx: number, cy: number, rx: number, ry: number, a0 = -90) => Array.from({length: n}, (_, i) => { const a = ((a0 + (360 * i) / n) * Math.PI) / 180; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
const all = (col: string, except: string[]) => { const o: Record<number, string> = {}; COUNTRIES.forEach((c, i) => { if (!except.includes(c.c)) o[i] = col; }); return o; };
const some = (col: string, list: string[]) => { const o: Record<number, string> = {}; list.forEach((c) => { const k = K(c); if (k >= 0) o[k] = col; }); return o; };
// ---------- battle royale: anillo de bolas tachadas + misterio ----------
const BR: React.FC<{list: string[]; cam: {cx: number; cy: number; s: number}; top: string; bottom: string; seed: number}> = ({list, cam, top, bottom, seed}) => (<>
  <WorldBg cam={cam} skip={list} blur={2.8} />
  <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 52%, rgba(0,0,0,0) 15%, rgba(0,0,0,0.6) 85%)'}} />
  {ring(list.length, W / 2, 395, 520, 225).map(([x, y], i) => <React.Fragment key={list[i]}><CBall k={K(list[i])} size={88} x={x} y={y} eyes={i % 4 === 0 ? 'dead' : 'scared'} gray={i % 3 !== 1} rot={(i % 3 - 1) * 9} />{i % 3 !== 1 && <XMark x={x} y={y} s={88} />}</React.Fragment>)}
  <Mystery x={W / 2} y={410} s={230} />
  <Embers n={50} seed={seed} c="#ffd27a" />
  <Vign />
  <Title3D text={top} y={8} size={100} grad={WHITE} glow="rgba(255,255,255,0.6)" />
  <Title3D text={bottom} y={592} size={104} grad={GOLD} glow="rgba(255,190,40,0.85)" />
</>);
// ---------- conquer: el mundo pintado + bola gigante con corona ----------
const CQ: React.FC<{k: string; col: string; left: string[]; title: string; sub: string; seed: number; rim: string; icon: string; ally?: string[]}> = ({k, col, left, title, sub, seed, rim, icon, ally = []}) => (<>
  <WorldBg cam={{cx: 3900, cy: 1900, s: 0.36}} skip={[]} blur={2.2} colOver={all(col, left)} />
  <AbsoluteFill style={{background: 'radial-gradient(circle at 30% 55%, rgba(0,0,0,0) 15%, rgba(0,0,0,0.55) 80%)'}} />
  <Rays x={330} y={430} c={rim} a={0.35} />
  <Glow x={330} y={430} r={300} c={rim} />
  <CBall k={K(k)} size={360} x={330} y={440} eyes="smug" look={0.5} rim="#fff" crown />
  {ally.map((a, i) => <CBall key={a} k={K(a)} size={150} x={120 + i * 150} y={630} eyes="angry" look={0.4} />)}
  {left.slice(0, 3).map((c, i) => <CBall key={c} k={K(c)} size={150} x={1120 - i * 40} y={210 + i * 170} eyes="scared" look={-0.6} sweat />)}
  <Ico n={icon} x={700} y={500} w={170} c="linear-gradient(180deg,#fff,#ffd23f 60%,#c27400)" rot={-10} />
  <Embers n={50} seed={seed} c="#ffd27a" />
  <Vign />
  <Title3D text={title} y={10} size={92} grad={WHITE} glow="rgba(255,255,255,0.6)" />
  <Title3D text={sub} y={598} size={98} grad={GOLD} glow="rgba(255,190,40,0.85)" x={760} />
</>);
// ---------- mapa de estados ----------
const STS = (SJ as any).states as any[];
const Pal = (i: number) => `hsl(${(i * 222.5) % 360},${[75, 65, 85][(Math.floor(i / 3)) % 3]}%,${[52, 42, 62][i % 3]}%)`;
const StatesMap: React.FC<{gray?: string[]}> = ({gray = []}) => (
  <svg width={W} height={H} viewBox="285 262 420 236" preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', left: 0, top: 0}}>
    <rect x={0} y={0} width={4000} height={3000} fill="#1f5fa8" />
    {STS.map((s, i) => <path key={i} d={s.d} fill={gray.includes(s.ab) ? '#5a5d66' : Pal(i)} stroke="#fff" strokeWidth={0.7} />)}
    {STS.map((s, i) => gray.includes(s.ab) ? null : <text key={'t' + i} x={s.c[0] / 4} y={s.c[1] / 4} textAnchor="middle" dominantBaseline="middle" style={{...font, fontSize: 9}} fill="#fff" stroke={INK} strokeWidth={2} paintOrder="stroke">{s.ab}</text>)}
  </svg>
);
const SBall: React.FC<{ab: string; x: number; y: number; s: number; col: string; mood?: 'angry' | 'scared'}> = ({ab, x, y, s, col, mood = 'angry'}) => (
  <div style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.6) 0%, ${col} 45%, rgba(0,0,0,0.55) 100%)`, border: `${s * 0.045}px solid ${INK}`, boxShadow: '0 10px 0 rgba(0,0,0,0.4)'}}>
    <svg width={s} height={s} style={{position: 'absolute', left: 0, top: 0}}>
      {[0.36, 0.64].map((ex, j) => <g key={j}><ellipse cx={ex * s} cy={0.4 * s} rx={s * 0.11} ry={s * (mood === 'scared' ? 0.13 : 0.08)} fill="#fff" stroke={INK} strokeWidth={s * 0.03} />{mood === 'angry' && <line x1={(ex - 0.13) * s} y1={(j ? 0.27 : 0.3) * s} x2={(ex + 0.13) * s} y2={(j ? 0.3 : 0.27) * s} stroke={INK} strokeWidth={s * 0.045} strokeLinecap="round" />}</g>)}
    </svg>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: s * 0.1, textAlign: 'center', ...font, fontSize: s * 0.24, color: '#fff', WebkitTextStroke: `${s * 0.025}px ${INK}`, paintOrder: 'stroke fill'}}>{ab}</div>
  </div>
);

const T: Record<string, React.ReactNode> = {
  taiwan: (<>
    <WorldBg cam={{cx: 6260, cy: 1880, s: 2.2}} skip={['CN', 'TW']} blur={2.4} colOver={some('#c8102e', ['CN'])} />
    <AbsoluteFill style={{background: 'radial-gradient(circle at 60% 50%, rgba(0,0,0,0) 20%, rgba(0,0,0,0.55) 90%)'}} />
    {[[600, 330], [680, 470], [560, 560], [760, 250]].map(([x, y], i) => <Ico key={i} n="battleship" x={x} y={y} w={80} c="#e8e8e8" rot={-12} />)}
    <Tracers from={[640, 400]} to={[860, 360]} n={5} />
    <Boom x={880} y={360} r={60} />
    <Glow x={260} y={420} r={300} c="rgba(255,60,40,0.5)" />
    <CBall k={K('CN')} size={360} x={250} y={430} eyes="angry" look={0.6} rim="#ffb0a0" />
    <WarHelmet x={250} y={440} size={354} />
    <Glow x={1080} y={420} r={240} c="rgba(120,170,255,0.5)" />
    <CBall k={K('TW')} size={260} x={1080} y={430} eyes="angry" look={-0.6} rim="#bcd4ff" sweat />
    <AK x={960} y={500} w={200} rot={-35} flip />
    <Embers n={50} seed={51} c="#ffd27a" />
    <Vign />
    <Title3D text="CHINA INVADES TAIWAN" y={10} size={96} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Title3D text="DAY BY DAY" y={596} size={110} grad={REDG} glow="rgba(255,60,40,0.85)" />
  </>),
  rceu: (<>
    <WorldBg cam={{cx: 4250, cy: 1250, s: 0.95}} skip={['RU', 'CN', 'FR', 'DE', 'PL']} blur={2.4} colOver={some('#c0262d', ['RU', 'BY', 'UA', 'PL', 'LT', 'LV', 'EE', 'FI'])} />
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 20%, rgba(0,0,0,0.55) 90%)'}} />
    <Glow x={1000} y={400} r={330} c="rgba(255,50,40,0.5)" />
    <CBall k={K('RU')} size={290} x={930} y={420} eyes="angry" look={-0.6} rim="#ffb0a0" />
    <CBall k={K('CN')} size={250} x={1160} y={470} eyes="angry" look={-0.6} rim="#ffb0a0" />
    <WarHelmet x={930} y={430} size={284} />
    {['FR', 'DE', 'PL'].map((c, i) => <CBall key={c} k={K(c)} size={170} x={130 + i * 150} y={380 + (i % 2) * 70} eyes="scared" look={0.5} sweat />)}
    <Glow x={260} y={620} r={150} c="rgba(140,180,255,0.6)" />
    <CBall k={K('US')} size={170} x={250} y={620} eyes="shades" look={0.5} rim="#cfe0ff" />
    <Badge text="THEN THE USA ARRIVES" x={520} y={640} bg="#1f6fe0" size={36} rot={-3} />
    <Tracers from={[800, 420]} to={[520, 400]} n={5} />
    <Embers n={50} seed={52} c="#ffd27a" />
    <Vign />
    <Title3D text="RUSSIA & CHINA" y={8} size={104} grad={REDG} glow="rgba(255,60,40,0.8)" />
    <Title3D text="VS EUROPE" y={128} size={96} grad={WHITE} glow="rgba(255,255,255,0.6)" />
  </>),
  ukr: (<>
    <WorldBg cam={{cx: 4430, cy: 1270, s: 1.35}} skip={['UA', 'RU']} blur={2.4} colOver={some('#c0262d', ['RU', 'BY'])} />
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 20%, rgba(0,0,0,0.6) 90%)'}} />
    <Glow x={330} y={420} r={300} c="rgba(255,220,60,0.5)" />
    <CBall k={K('UA')} size={330} x={320} y={430} eyes="angry" look={0.6} rim="#fff3a0" />
    <WarHelmet x={320} y={440} size={324} />
    <div style={{position: 'absolute', left: 470, top: 250, width: 150, height: 150, borderRadius: '50%', background: '#0b2a6b', border: `8px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(120,170,255,0.9)'}}><div style={{...font, fontSize: 44, color: '#fff'}}>NATO</div></div>
    <CBall k={K('RU')} size={330} x={980} y={430} eyes="angry" look={-0.6} rim="#ffb0a0" />
    <AK x={850} y={500} w={260} rot={-40} flip />
    <Muzzle x={700} y={470} s={80} />
    <Tracers from={[690, 470]} to={[520, 440]} n={4} />
    <BoltFX seed={11} />
    <Embers n={50} seed={53} c="#ffd27a" />
    <Vign />
    <Title3D text="WHAT IF UKRAINE" y={8} size={102} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Title3D text="JOINED NATO?" y={590} size={116} grad={GOLD} glow="rgba(255,190,40,0.85)" />
  </>),
  usla: (<>
    <SplitBg />
    <Embers n={60} seed={54} c="#ffd27a" />
    <Glow x={300} y={410} r={300} c="rgba(140,180,255,0.5)" />
    <CBall k={K('US')} size={350} x={290} y={420} eyes="angry" look={0.6} rim="#9fc0ff" />
    <WarHelmet x={290} y={430} size={344} />
    <AK x={440} y={500} w={260} rot={40} />
    <Muzzle x={575} y={480} s={80} />
    {[['BR', 1000, 300, 230], ['MX', 820, 480, 170], ['CO', 1150, 520, 170], ['VE', 980, 560, 150], ['AR', 1180, 230, 140], ['CU', 820, 250, 130]].map(([c, x, y, s]: any) => <CBall key={c} k={K(c)} size={s} x={x} y={y} eyes="angry" look={-0.6} />)}
    <BoltFX seed={12} />
    <Vign />
    <Title3D text="USA VS" y={8} size={110} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Title3D text="LATIN AMERICA" y={596} size={112} grad={GOLD} glow="rgba(255,190,40,0.85)" />
  </>),
  ww3: (<>
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #6a1208 0%, #2a0604 55%, #0a0202 100%)'}} />
    <Rays x={W / 2} y={400} c="rgba(255,120,40,0.6)" a={0.4} />
    <SadEarth x={W / 2} y={410} size={330} cracks fires />
    {[[300, 220], [990, 210], [230, 540], [1060, 560], [640, 150]].map(([x, y], i) => <Boom key={i} x={x} y={y} r={50 + (i % 2) * 25} />)}
    <CBall k={K('US')} size={210} x={190} y={360} eyes="angry" look={0.5} />
    <CBall k={K('RU')} size={210} x={1090} y={360} eyes="angry" look={-0.5} />
    <CBall k={K('CN')} size={170} x={1120} y={600} eyes="angry" look={-0.5} />
    <CBall k={K('GB')} size={150} x={160} y={600} eyes="angry" look={0.5} />
    <Ico n="missile-swarm" x={640} y={600} w={150} c="#e8e8e8" />
    <Embers n={70} seed={55} c="#ffb35a" />
    <Vign />
    <Title3D text="WORLD WAR 3" y={6} size={130} grad={REDG} glow="rgba(255,60,40,0.9)" />
    <Title3D text="SIMULATION" y={604} size={100} grad={WHITE} glow="rgba(255,255,255,0.6)" />
  </>),
  breu: <BR list={['FR', 'DE', 'GB', 'IT', 'ES', 'RU', 'UA', 'SE', 'NO', 'NL', 'BE', 'CH', 'AT', 'GR', 'PT', 'RO', 'HU', 'CZ', 'FI']} cam={{cx: 4150, cy: 1250, s: 0.9}} top="EUROPE BATTLE ROYALE" bottom="ONLY 1 SURVIVES" seed={56} />,
  braf: <BR list={['EG', 'NG', 'ZA', 'DZ', 'MA', 'KE', 'CD', 'AO', 'SD', 'TZ', 'GH', 'CM', 'ML', 'SN', 'LY', 'TN', 'SO', 'MZ', 'ZW']} cam={{cx: 4262, cy: 2347, s: 0.45}} top="AFRICA BATTLE ROYALE" bottom="54 ENTER · 1 SURVIVES" seed={57} />,
  bras: <BR list={['CN', 'IN', 'JP', 'KR', 'KP', 'PK', 'IR', 'SA', 'TR', 'ID', 'TH', 'PH', 'MY', 'KZ', 'MN', 'AF', 'IQ', 'BD', 'MM']} cam={{cx: 5763, cy: 1733, s: 0.5}} top="ASIA BATTLE ROYALE" bottom="ONLY 1 SURVIVES" seed={58} />,
  brus: (<>
    <StatesMap gray={['RI', 'DE', 'VT', 'NH', 'CT', 'WV', 'NJ', 'MD', 'DC', 'KY', 'IN', 'SD', 'ND', 'ID', 'AR', 'MS']} />
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 25%, rgba(0,0,0,0.6) 90%)'}} />
    <Glow x={250} y={430} r={260} c="rgba(255,140,40,0.6)" />
    <SBall ab="TX" x={250} y={440} s={300} col="#ee7a22" />
    <Glow x={1030} y={430} r={260} c="rgba(80,140,255,0.6)" />
    <SBall ab="CA" x={1030} y={440} s={300} col="#2f6fe0" />
    <VS x={640} y={440} r={95} />
    <SBall ab="VA" x={640} y={210} s={150} col="#d6303a" />
    <Badge text="50 STATES · 1 WINNER" x={640} y={600} bg="#c81e1e" size={50} rot={-3} />
    <Embers n={50} seed={59} c="#ffd27a" />
    <Vign />
    <Title3D text="50 STATES BATTLE ROYALE" y={10} size={92} grad={GOLD} glow="rgba(255,190,40,0.85)" />
  </>),
  cqru: <CQ k="RU" col="#c0262d" left={['US', 'CN', 'IN']} title="CAN RUSSIA CONQUER" sub="THE WORLD?" seed={60} rim="rgba(255,80,60,0.6)" icon="lightning-storm" />,
  cqcn: <CQ k="CN" col="#d11a1a" left={['US', 'IN', 'RU']} title="CAN CHINA CONQUER" sub="THE WORLD?" seed={61} rim="rgba(255,200,40,0.6)" icon="jet-fighter" />,
  cqbr: <CQ k="BR" col="#1f9e4a" left={['US', 'CN', 'RU']} title="CAN BRAZIL CONQUER" sub="THE WORLD?" seed={62} rim="rgba(80,255,120,0.55)" icon="palm-tree" />,
  cqes: <CQ k="ES" col="#d4a017" left={['US', 'CN', 'GB']} title="CAN SPAIN REBUILD" sub="ITS EMPIRE?" seed={63} rim="rgba(255,200,40,0.65)" icon="battleship" ally={['PT', 'MX', 'AR']} />,
  survive: (<>
    <WorldBg cam={{cx: 3900, cy: 1900, s: 0.36}} skip={[]} blur={3} />
    <AbsoluteFill style={{background: 'rgba(10,6,20,0.55)'}} />
    {[['ES', '22 DAYS', 170, 250], ['FR', '2 MONTHS', 170, 470], ['RU', '2 YEARS', 1110, 250], ['CN', '3 YEARS', 1110, 470]].map(([c, d, x, y]: any, i) => (
      <React.Fragment key={c}><CBall k={K(c)} size={150} x={x} y={y} eyes={i < 2 ? 'scared' : 'angry'} sweat={i < 2} look={i < 2 ? 0.4 : -0.4} />
        <Badge text={d} x={x} y={y + 74} bg={i < 2 ? '#c81e1e' : '#1f9e4a'} size={34} rot={i % 2 ? 3 : -3} /></React.Fragment>))}
    <Glow x={640} y={400} r={260} c="rgba(255,215,70,0.55)" />
    <div style={{position: 'absolute', left: 640 - 170, top: 230, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #fff, #e8e2d0 70%)', border: `14px solid ${INK}`, boxShadow: '0 0 60px rgba(255,215,70,0.8)'}}>
      <svg width={312} height={312} style={{position: 'absolute', left: 0, top: 0}}>
        {Array.from({length: 12}, (_, i) => { const a = (i * 30 * Math.PI) / 180; return <line key={i} x1={156 + Math.sin(a) * 120} y1={156 - Math.cos(a) * 120} x2={156 + Math.sin(a) * 140} y2={156 - Math.cos(a) * 140} stroke={INK} strokeWidth={8} />; })}
        <path d="M156 156 L156 36 A120 120 0 1 1 52 96 Z" fill="rgba(229,50,45,0.55)" />
        <line x1={156} y1={156} x2={156} y2={50} stroke={INK} strokeWidth={14} strokeLinecap="round" />
        <line x1={156} y1={156} x2={226} y2={196} stroke="#e5322d" strokeWidth={10} strokeLinecap="round" />
      </svg>
    </div>
    <Embers n={50} seed={64} c="#ffd27a" />
    <Vign />
    <Title3D text="HOW LONG WOULD YOU" y={8} size={92} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Title3D text="SURVIVE VS THE WORLD?" y={600} size={92} grad={GOLD} glow="rgba(255,190,40,0.85)" />
  </>),
  ww2: (<>
    <WorldBg cam={{cx: 3900, cy: 1700, s: 0.42}} skip={[]} blur={2.4} colOver={all('#2b2b2b', ['US', 'CA', 'MX', 'BR', 'AR', 'AU', 'NZ', 'CL', 'PE', 'CO', 'VE', 'BO', 'PY', 'UY', 'EC', 'GY', 'SR', 'CU', 'GT', 'HN', 'NI', 'CR', 'PA', 'SV', 'GL'])} />
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 15%, rgba(0,0,0,0.7) 90%)'}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(60,40,10,0.25), rgba(0,0,0,0.2))', mixBlendMode: 'multiply'}} />
    <Glow x={640} y={420} r={300} c="rgba(255,60,40,0.45)" />
    <CBall k={K('DE')} size={330} x={640} y={430} eyes="smug" look={0} rim="#ffcf6a" />
    <WarHelmet x={640} y={440} size={324} />
    <CBall k={K('US')} size={190} x={190} y={480} eyes="scared" look={0.5} sweat />
    <CBall k={K('GB')} size={170} x={1090} y={300} eyes="dead" gray />
    <XMark x={1090} y={300} s={170} />
    <CBall k={K('RU')} size={170} x={1110} y={530} eyes="dead" gray />
    <XMark x={1110} y={530} s={170} />
    <Badge text="ALTERNATE HISTORY" x={640} y={612} bg="#5a4a2a" size={44} rot={-2} />
    <Embers n={60} seed={65} c="#ffb35a" />
    <Vign />
    <Title3D text="WHAT IF GERMANY" y={8} size={104} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Title3D text="WON WW2?" y={118} size={110} grad={REDG} glow="rgba(255,60,40,0.85)" />
  </>),
};
export const ThumbD5: React.FC<{id: string}> = ({id}) => <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>{T[id]}</AbsoluteFill>;
export const D5_IDS = Object.keys(T);
