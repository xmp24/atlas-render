// Miniaturas día 4: LatAm Battle Royale + Strait of Hormuz (1280x720)
import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {COUNTRIES} from './HexWorld';
import {INK, font} from './lib3';
import {WorldBg} from './ThumbsMap';
import {Embers, Glow} from './ThumbsPro';
import {CBall, AK} from './ThumbsCB';
import {SplitBg, BoltFX, WarHelmet, Title3D, GOLD, WHITE, REDG, Muzzle, Tracers, Smoke, Vign} from './ThumbsFinal';

const K = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
const W = 1280, H = 720;
const LAT = 'MX GT HN SV NI CR PA CU DO HT CO VE EC PE BO BR PY UY AR CL'.split(' ');
const Ico: React.FC<{n: string; x: number; y: number; w: number; c: string; rot?: number; flip?: boolean}> = ({n, x, y, w, c, rot = 0, flip}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - w / 2, width: w, height: w, transform: `rotate(${rot}deg) scaleX(${flip ? -1 : 1})`, filter: `drop-shadow(0 0 2px ${INK}) drop-shadow(0 0 2px ${INK}) drop-shadow(0 6px 6px rgba(0,0,0,0.5))`}}>
    <div style={{width: '100%', height: '100%', background: c, WebkitMaskImage: `url(${staticFile(`hw/icons/${n}.svg`)})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center'}} />
  </div>
);
const Mystery: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (<>
  <Glow x={x} y={y} r={s * 0.95} c="rgba(255,215,70,0.65)" />
  <div style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: '50%', background: 'radial-gradient(circle at 35% 28%, #3a3a3a, #0a0a0a 70%)', border: `${s * 0.035}px solid #ffd23f`, boxShadow: '0 0 60px #ffd23f', display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: s * 0.72, color: '#ffd23f', lineHeight: 1}}>?</div>
  <div style={{position: 'absolute', left: x - s * 0.24, top: y - s * 0.86, width: s * 0.48, height: s * 0.48, filter: `drop-shadow(0 0 3px ${INK}) drop-shadow(0 0 18px #ffd86a)`}}><div style={{width: '100%', height: '100%', background: 'linear-gradient(180deg, #fff3a0, #ffc21a 60%, #d48a00)', WebkitMaskImage: `url(${staticFile('hw/icons/crown.svg')})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat'}} /></div>
</>);
const XMark: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <svg width={s} height={s} style={{position: 'absolute', left: x - s / 2, top: y - s / 2, overflow: 'visible'}}>
    {[[0.18, 0.18, 0.82, 0.82], [0.82, 0.18, 0.18, 0.82]].map(([a, b, c, d], i) => <line key={i} x1={a * s} y1={b * s} x2={c * s} y2={d * s} stroke={INK} strokeWidth={s * 0.2} strokeLinecap="round" />)}
    {[[0.18, 0.18, 0.82, 0.82], [0.82, 0.18, 0.18, 0.82]].map(([a, b, c, d], i) => <line key={i} x1={a * s} y1={b * s} x2={c * s} y2={d * s} stroke="#ff1f2f" strokeWidth={s * 0.13} strokeLinecap="round" />)}
  </svg>
);
const Boom: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => (<>
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: 'radial-gradient(circle, #fff7c0 0%, #ffcf3a 25%, #ff6a12 50%, rgba(200,30,10,0.6) 70%, rgba(0,0,0,0) 75%)'}} />
</>);
const Badge: React.FC<{text: string; x: number; y: number; bg: string; size?: number; rot?: number}> = ({text, x, y, bg, size = 44, rot = -4}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,0) rotate(${rot}deg)`, background: bg, border: `5px solid ${INK}`, borderRadius: 16, padding: '4px 20px 0', ...font, fontSize: size, color: '#fff', boxShadow: '0 7px 0 rgba(0,0,0,0.45)', whiteSpace: 'nowrap'}}>{text}</div>
);
const LATCAM = {cx: 2900, cy: 2640, s: 0.27};
const GCAM = {cx: 4909, cy: 1762, s: 1.5};
const ring = (n: number, cx: number, cy: number, rx: number, ry: number, a0 = -90) => Array.from({length: n}, (_, i) => { const a = ((a0 + (360 * i) / n) * Math.PI) / 180; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });

const T: Record<string, React.ReactNode> = {
  // ================= LATAM =================
  l1: (<>
    <WorldBg cam={LATCAM} skip={LAT} blur={2.5} />
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 52%, rgba(0,0,0,0) 20%, rgba(0,0,0,0.55) 85%)'}} />
    {ring(19, W / 2, 400, 520, 230).map(([x, y], i) => { const c = LAT.filter((c) => c !== 'CO')[i]; return <React.Fragment key={c}><CBall k={K(c)} size={92} x={x} y={y} eyes="scared" gray rot={(i % 3 - 1) * 8} /><XMark x={x} y={y} s={92} /></React.Fragment>; })}
    <Mystery x={W / 2} y={410} s={230} />
    <Embers n={50} seed={41} c="#ffd27a" />
    <Vign />
    <Title3D text="20 COUNTRIES" y={8} size={104} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Title3D text="ONLY 1 SURVIVES" y={590} size={108} grad={GOLD} glow="rgba(255,190,40,0.85)" />
  </>),
  l2: (<>
    <SplitBg />
    <Embers n={60} seed={42} c="#ffd27a" />
    <Smoke list={[[120, 650, 100], [1160, 660, 100]]} />
    <Glow x={330} y={400} r={280} c="rgba(255,190,70,0.45)" />
    <CBall k={K('BR')} size={340} x={330} y={400} eyes="angry" look={0.6} rim="#ffcf6a" />
    <WarHelmet x={330} y={410} size={334} />
    <AK x={470} y={480} w={260} rot={40} />
    <Muzzle x={600} y={462} s={80} />
    <Tracers from={[620, 455]} to={[820, 400]} />
    {['MX', 'AR', 'CO', 'CL', 'PE', 'VE'].map((c, i) => { const [x, y] = [[930, 250], [1120, 280], [1010, 430], [1180, 470], [880, 520], [1080, 590]][i]; return <CBall key={c} k={K(c)} size={150 - (i % 2) * 14} x={x} y={y} eyes={i % 2 ? 'scared' : 'angry'} look={-0.6} />; })}
    <BoltFX seed={4} />
    <Vign />
    <Title3D text="LATIN AMERICA" y={8} size={100} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Title3D text="BATTLE ROYALE" y={590} size={112} grad={REDG} glow="rgba(255,60,40,0.85)" />
  </>),
  l3: (<>
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #3a1622 0%, #0b0a12 80%)'}} />
    {LAT.map((c, i) => { const x = 128 + (i % 10) * 114, y = 260 + Math.floor(i / 10) * 150; const surv = c === 'BR' || c === 'MX' || c === 'CO'; return <React.Fragment key={c}><CBall k={K(c)} size={100} x={x} y={y} eyes={surv ? 'angry' : 'dead'} gray={!surv} rim={surv ? '#ffcf6a' : undefined} />{!surv && <XMark x={x} y={y} s={100} />}</React.Fragment>; })}
    <Badge text="17 ELIMINATED" x={W / 2} y={470} bg="#c81e1e" size={52} rot={-3} />
    <Embers n={40} seed={43} c="#ff7a5a" />
    <Vign />
    <Title3D text="WHO SURVIVES?" y={20} size={124} grad={GOLD} glow="rgba(255,190,40,0.85)" />
    <Title3D text="BRAZIL · MEXICO · ???" y={570} size={88} grad={WHITE} glow="rgba(255,255,255,0.6)" />
  </>),
  l4: (<>
    <WorldBg cam={{cx: 2850, cy: 2350, s: 0.42}} skip={LAT} blur={2} />
    <AbsoluteFill style={{background: 'rgba(60,0,0,0.25)'}} />
    <Boom x={420} y={360} r={150} /><Boom x={860} y={430} r={120} /><Boom x={640} y={560} r={90} />
    <Smoke list={[[420, 300, 120], [860, 380, 100]]} />
    <CBall k={K('MX')} size={250} x={250} y={330} eyes="angry" look={0.7} rot={-8} />
    <WarHelmet x={250} y={340} size={246} />
    <CBall k={K('CO')} size={250} x={1030} y={330} eyes="angry" look={-0.7} rot={8} />
    <WarHelmet x={1030} y={340} size={246} />
    <AK x={380} y={410} w={220} rot={35} />
    <AK x={900} y={410} w={220} rot={-35} flip />
    <Tracers from={[480, 390]} to={[640, 380]} /><Tracers from={[800, 390]} to={[640, 380]} />
    <CBall k={K('BR')} size={190} x={640} y={420} eyes="scared" look={0} sweat />
    <BoltFX seed={5} />
    <Vign />
    <Title3D text="THE FINAL 3" y={8} size={116} grad={GOLD} glow="rgba(255,190,40,0.85)" />
    <Title3D text="ONLY 1 SURVIVES" y={596} size={100} grad={WHITE} glow="rgba(255,255,255,0.6)" />
  </>),
  l5: (<>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #121826 0%, #0a0d16 100%)'}} />
    {[['S', '#ff3b3b', ['BR', 'MX']], ['A', '#ff9a2e', ['AR', 'CO', 'CL', 'VE']], ['B', '#ffd23f', ['PE', 'CU', 'EC', 'BO']], ['D', '#5aa7ff', ['HN', 'NI', 'CR', 'HT']]].map(([tn, col, ks], i) => (
      <div key={tn as string} style={{position: 'absolute', left: 40, top: 150 + i * 132, width: 760, height: 120, display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.07)', border: `5px solid ${INK}`, borderRadius: 18}}>
        <div style={{width: 120, height: '100%', background: col as string, borderRadius: '12px 0 0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: 86, color: INK}}>{tn as string}</div>
      </div>))}
    {[['BR', 'MX'], ['AR', 'CO', 'CL', 'VE'], ['PE', 'CU', 'EC', 'BO'], ['HN', 'NI', 'CR', 'HT']].map((ks, i) => ks.map((c, j) => <CBall key={c} k={K(c)} size={100} x={240 + j * 130} y={210 + i * 132} eyes={i === 0 ? 'smug' : i === 3 ? 'scared' : 'angry'} />))}
    <Glow x={1030} y={400} r={300} c="rgba(255,60,40,0.45)" />
    <Mystery x={1030} y={420} s={300} />
    <Badge text="WINNER?" x={1030} y={600} bg="#c81e1e" size={58} rot={-4} />
    <Embers n={40} seed={44} c="#ffd27a" />
    <Vign />
    <Title3D text="20 COUNTRIES BATTLE ROYALE" y={14} size={88} grad={WHITE} glow="rgba(255,255,255,0.6)" />
  </>),
  // ================= HORMUZ =================
  h1: (<>
    <WorldBg cam={GCAM} skip={['US', 'IR']} blur={2.4} />
    <AbsoluteFill style={{background: 'radial-gradient(circle at 60% 55%, rgba(0,0,0,0) 20%, rgba(0,0,0,0.55) 90%)'}} />
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      <circle cx={705} cy={468} r={90} fill="none" stroke="#ff2b3b" strokeWidth={16} />
      <circle cx={705} cy={468} r={90} fill="none" stroke={INK} strokeWidth={4} />
      <path d="M500 600 L620 520" stroke="#ff2b3b" strokeWidth={18} strokeLinecap="round" /><path d="M580 515 L630 515 L622 560" fill="none" stroke="#ff2b3b" strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <Ico n="battleship" x={720} y={478} w={70} c="#ffcf3a" />
    <Boom x={690} y={455} r={40} />
    <CBall k={K('US')} size={250} x={190} y={470} eyes="shades" look={0.6} rim="#9fc0ff" />
    <CBall k={K('IR')} size={250} x={1100} y={250} eyes="angry" look={-0.6} rim="#ff9f9f" />
    <AK x={1000} y={330} w={200} rot={-30} flip />
    <Embers n={40} seed={45} c="#ffd27a" />
    <Vign />
    <Title3D text="THE BATTLE FOR" y={8} size={86} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Title3D text="HORMUZ" y={560} size={150} grad={GOLD} glow="rgba(255,190,40,0.85)" />
  </>),
  h2: (<>
    <SplitBg />
    <Embers n={70} seed={46} c="#ffd27a" />
    <Smoke list={[[100, 660, 100], [1180, 650, 100]]} />
    <Glow x={330} y={410} r={290} c="rgba(140,180,255,0.45)" />
    <CBall k={K('US')} size={360} x={320} y={410} eyes="angry" look={0.6} rim="#9fc0ff" />
    <WarHelmet x={320} y={420} size={354} />
    <AK x={470} y={490} w={280} rot={40} />
    <Muzzle x={612} y={470} s={90} />
    <Tracers from={[630, 465]} to={[820, 420]} n={5} />
    <CBall k={K('IR')} size={340} x={960} y={410} eyes="angry" look={-0.6} rim="#ff9f9f" />
    <WarHelmet x={960} y={420} size={334} />
    <AK x={820} y={490} w={270} rot={-40} flip />
    <BoltFX seed={6} />
    <Vign />
    <Title3D text="USA VS IRAN" y={8} size={120} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Title3D text="WHO CONTROLS HORMUZ?" y={598} size={86} grad={GOLD} glow="rgba(255,190,40,0.85)" />
  </>),
  h3: (<>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #2a0606 0%, #5a0d0d 50%, #120404 100%)'}} />
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      {Array.from({length: 8}, (_, i) => <line key={i} x1={0} y1={140 + i * 70} x2={W} y2={140 + i * 70} stroke="rgba(255,255,255,0.06)" strokeWidth={2} />)}
      <polyline points="40,600 160,585 260,590 360,560 430,570 520,470 600,430 680,300 760,320 840,200 920,170 1000,110" fill="none" stroke={INK} strokeWidth={26} strokeLinejoin="round" />
      <polyline points="40,600 160,585 260,590 360,560 430,570 520,470 600,430 680,300 760,320 840,200 920,170 1000,110" fill="none" stroke="#ff3b3b" strokeWidth={14} strokeLinejoin="round" />
      <path d="M960 90 L1040 100 L1000 160 Z" fill="#ff3b3b" stroke={INK} strokeWidth={6} />
    </svg>
    <div style={{position: 'absolute', left: 620, top: 300, ...font, fontSize: 190, color: '#fff', WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill', transform: 'rotate(-6deg)', textShadow: '0 0 40px #ff2b3b'}}>$165</div>
    <Ico n="battleship" x={250} y={480} w={260} c="#3a3a3a" />
    <Boom x={250} y={440} r={110} />
    <Smoke list={[[230, 330, 120], [300, 260, 90]]} />
    <CBall k={K('IR')} size={250} x={1120} y={530} eyes="smug" look={-0.5} rim="#ff9f9f" />
    <Embers n={50} seed={47} c="#ffb35a" />
    <Vign />
    <Title3D text="IRAN CLOSED HORMUZ" y={8} size={100} grad={REDG} glow="rgba(255,60,40,0.85)" />
  </>),
  h4: (<>
    <WorldBg cam={{cx: 5020, cy: 1820, s: 0.9}} skip={['IR']} blur={2.5} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,20,50,0.55), rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.5))'}} />
    <Ico n="carrier" x={360} y={520} w={420} c="#5d6b7a" />
    {[[620, 250, -18], [760, 180, -22], [900, 240, -16]].map(([x, y, r], i) => <Ico key={i} n="jet-fighter" x={x} y={y} w={130} c="#c9d3de" rot={r} />)}
    {[[1000, 320], [1080, 420], [1150, 300]].map(([x, y], i) => <Boom key={i} x={x} y={y} r={80 - i * 10} />)}
    <CBall k={K('IR')} size={230} x={1110} y={560} eyes="scared" look={-0.6} sweat />
    <CBall k={K('US')} size={200} x={140} y={210} eyes="shades" look={0.6} rim="#9fc0ff" />
    <Embers n={40} seed={48} c="#ffd27a" />
    <Vign />
    <Title3D text="THE US NAVY ARRIVES" y={8} size={96} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Badge text="STRAIT OF HORMUZ" x={W / 2} y={600} bg="#c81e1e" size={60} rot={-3} />
  </>),
  h5: (<>
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 60%, #3a0e0e 0%, #0b0608 75%)'}} />
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      {[[100, 700, 640, 250], [1180, 700, 640, 250], [300, 720, 600, 200], [980, 720, 680, 200]].map(([x1, y1, x2, y2], i) => <path key={i} d={`M${x1},${y1} Q${(x1 + x2) / 2},${y2 - 260} ${x2},${y2}`} fill="none" stroke="rgba(255,200,120,0.7)" strokeWidth={6} strokeDasharray="18 12" />)}
    </svg>
    <Boom x={640} y={250} r={160} />
    <Smoke list={[[640, 180, 140]]} />
    <CBall k={K('US')} size={220} x={170} y={470} eyes="angry" look={0.6} rim="#9fc0ff" />
    <CBall k={K('IR')} size={220} x={1110} y={470} eyes="angry" look={-0.6} rim="#ff9f9f" />
    <CBall k={K('RU')} size={160} x={900} y={330} eyes="smug" look={-0.6} />
    <CBall k={K('CN')} size={160} x={1180} y={230} eyes="smug" look={-0.6} />
    <CBall k={K('IL')} size={150} x={360} y={330} eyes="angry" look={0.6} />
    <Embers n={60} seed={49} c="#ffb35a" />
    <BoltFX seed={7} />
    <Vign />
    <Title3D text="WORLD WAR 3" y={540} size={140} grad={REDG} glow="rgba(255,60,40,0.85)" />
    <Title3D text="STARTS IN HORMUZ?" y={8} size={86} grad={WHITE} glow="rgba(255,255,255,0.6)" />
  </>),
  // ================= WORLD WAR CUP =================
  w1: (<>
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #3b2a08 0%, #160c02 55%, #050302 100%)'}} />
    {Array.from({length: 36}, (_, i) => { const a = (i / 36) * Math.PI * 2; const r = 300 + (i % 3) * 70; const x = W / 2 + Math.cos(a) * r * 1.55, y = 360 + Math.sin(a) * r * 0.5; const cs = ['US','CN','RU','BR','FR','DE','GB','JP','IN','KR','MX','AR','ES','IT','TR','IR','EG','NG','SA','AU','CA','PK','ID','KP','UA','PL','ZA','CO','VN','TH','SE','NO','IL','MA','PE','CL']; return <CBall key={i} k={K(cs[i])} size={70 + (i % 3) * 12} x={x} y={y} eyes={i % 4 === 0 ? 'scared' : 'angry'} look={x < W / 2 ? 0.6 : -0.6} />; })}
    <Glow x={W / 2} y={360} r={330} c="rgba(255,205,60,0.6)" />
    <Ico n="trophy-cup" x={W / 2} y={350} w={360} c="linear-gradient(180deg, #fff6b0, #ffd23f 45%, #d48a00)" />
    <AK x={W / 2 - 230} y={380} w={210} rot={30} />
    <AK x={W / 2 + 230} y={380} w={210} rot={-30} flip />
    <Embers n={60} seed={51} c="#ffd27a" />
    <Vign />
    <Title3D text="128 COUNTRIES" y={8} size={104} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Title3D text="1 TROPHY" y={590} size={120} grad={GOLD} glow="rgba(255,190,40,0.85)" />
  </>),
  w2: (<>
    <SplitBg />
    <Embers n={60} seed={52} c="#ffd27a" />
    <Smoke list={[[110, 650, 100], [1170, 650, 100]]} />
    <Glow x={300} y={400} r={280} c="rgba(140,180,255,0.45)" />
    <CBall k={K('US')} size={330} x={290} y={410} eyes="scared" look={0.6} sweat />
    <WarHelmet x={290} y={420} size={324} />
    <CBall k={K('CN')} size={330} x={990} y={410} eyes="angry" look={-0.6} rim="#ffcf6a" />
    <WarHelmet x={990} y={420} size={324} />
    <AK x={850} y={490} w={270} rot={-40} flip />
    <Muzzle x={700} y={470} s={85} />
    <Tracers from={[680, 465]} to={[470, 420]} n={5} />
    <BoltFX seed={8} />
    <Glow x={W / 2} y={250} r={150} c="rgba(255,205,60,0.6)" />
    <Ico n="trophy-cup" x={W / 2} y={250} w={190} c="linear-gradient(180deg, #fff6b0, #ffd23f 45%, #d48a00)" />
    <Badge text="THE FINAL" x={W / 2} y={470} bg="#c81e1e" size={54} rot={-4} />
    <Vign />
    <Title3D text="WORLD WAR CUP" y={8} size={110} grad={GOLD} glow="rgba(255,190,40,0.85)" />
    <Title3D text="WASHINGTON IS FALLING" y={600} size={84} grad={REDG} glow="rgba(255,60,40,0.85)" />
  </>),
  w3: (<>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #0f1a33 0%, #070b16 100%)'}} />
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      {[[150, 180, 300, 245], [150, 310, 300, 245], [150, 420, 300, 485], [150, 550, 300, 485], [1130, 180, 980, 245], [1130, 310, 980, 245], [1130, 420, 980, 485], [1130, 550, 980, 485], [300, 245, 470, 365], [300, 485, 470, 365], [980, 245, 810, 365], [980, 485, 810, 365]].map(([x1, y1, x2, y2], i) => <path key={i} d={`M${x1},${y1} H${(x1 + x2) / 2} V${y2} H${x2}`} fill="none" stroke="#ffd23f" strokeWidth={8} opacity={0.85} />)}
    </svg>
    {[['BR', 150, 180], ['JP', 150, 310], ['GB', 150, 420], ['KR', 150, 550], ['RU', 1130, 180], ['IN', 1130, 310], ['FR', 1130, 420], ['DE', 1130, 550]].map(([c, x, y], i) => <React.Fragment key={c as string}><CBall k={K(c as string)} size={100} x={x as number} y={y as number} eyes="dead" gray /><XMark x={x as number} y={y as number} s={100} /></React.Fragment>)}
    {[['US', 470, 365], ['CN', 810, 365]].map(([c, x, y]) => <CBall key={c as string} k={K(c as string)} size={170} x={x as number} y={y as number} eyes="angry" look={c === 'US' ? 0.7 : -0.7} rim="#ffcf6a" />)}
    <Glow x={W / 2} y={365} r={160} c="rgba(255,205,60,0.6)" />
    <Ico n="trophy-cup" x={W / 2} y={365} w={170} c="linear-gradient(180deg, #fff6b0, #ffd23f 45%, #d48a00)" />
    <Embers n={50} seed={53} c="#ffd27a" />
    <Vign />
    <Title3D text="WHO WINS THE" y={8} size={96} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Title3D text="WORLD WAR CUP?" y={590} size={112} grad={GOLD} glow="rgba(255,190,40,0.85)" />
  </>),
  w4: (<>
    <SplitBg dark />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.5) 100%)'}} />
    <Embers n={80} seed={54} c="#ffd27a" />
    <Smoke list={[[90, 680, 120], [1190, 680, 120], [640, 720, 140]]} />
    {/* siluetas de luz */}
    {[[290, 440, '#ffb000', '#fff6c8'], [990, 440, '#2f8bff', '#e2f4ff']].map(([x, y, c1, c2], i) => (
      <React.Fragment key={i}>
        <div style={{position: 'absolute', left: (x as number) - 260, top: (y as number) - 260, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,0,0,0.6) 38%, rgba(0,0,0,0) 72%)', filter: 'blur(10px)'}} />
        <div style={{position: 'absolute', left: (x as number) - 192, top: (y as number) - 192, width: 384, height: 384, borderRadius: '50%', boxShadow: `0 0 0 9px ${c2}, 0 0 18px 12px ${c2}, 0 0 60px 26px ${c1}, 0 0 140px 50px ${c1}aa`}} />
      </React.Fragment>))}
    <CBall k={K('US')} size={380} x={290} y={440} eyes="angry" look={0.6} />
    <WarHelmet x={290} y={452} size={374} />
    <AK x={450} y={530} w={290} rot={38} />
    <CBall k={K('CN')} size={380} x={990} y={440} eyes="angry" look={-0.6} />
    <WarHelmet x={990} y={452} size={374} />
    <AK x={830} y={530} w={290} rot={-38} flip />
    <Muzzle x={600} y={505} s={80} />
    <Muzzle x={680} y={505} s={80} />
    <Tracers from={[610, 500]} to={[780, 470]} n={4} />
    <Tracers from={[670, 500]} to={[500, 470]} n={4} />
    <BoltFX seed={8} />
    <Glow x={W / 2} y={300} r={230} c="rgba(255,215,70,0.75)" />
    <div style={{position: 'absolute', left: W / 2 - 170, top: 160, width: 340, height: 340, borderRadius: '50%', background: 'conic-gradient(from 0deg, rgba(255,230,120,0.0), rgba(255,230,120,0.35), rgba(255,230,120,0.0) 12%, rgba(255,230,120,0.35) 25%, rgba(255,230,120,0) 37%, rgba(255,230,120,0.35) 50%, rgba(255,230,120,0) 62%, rgba(255,230,120,0.35) 75%, rgba(255,230,120,0) 87%, rgba(255,230,120,0.35))', filter: 'blur(3px)'}} />
    <Ico n="trophy-cup" x={W / 2} y={310} w={270} c="linear-gradient(180deg, #fffbe0, #ffe14a 35%, #ffb21a 70%, #c27400)" />
    <Vign />
    <Title3D text="WORLD WAR CUP" y={6} size={124} grad={GOLD} glow="rgba(255,190,40,0.9)" />
  </>),
};
export const ThumbD4: React.FC<{id: string}> = ({id}) => <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>{T[id]}</AbsoluteFill>;
export const D4_IDS = Object.keys(T);
