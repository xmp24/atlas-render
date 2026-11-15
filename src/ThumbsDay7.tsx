// Miniaturas día 7: America BR, India BR, Indonesia vs the world (A = mapa + cuotas 1920x1080, B y C = 1280x720)
import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {Indo2, FlagImg} from './Indo2';
import {CODE, COUNTRIES} from './HexWorld';
import {INK, YELLOW, CREAM, font} from './lib3';
import {WorldBg, VS} from './ThumbsMap';
import {Embers, Glow, Rays} from './ThumbsPro';
import {CBall} from './ThumbsCB';
import {SplitBg, BoltFX, WarHelmet, Title3D, GOLD, WHITE, REDG, Vign} from './ThumbsFinal';

const K = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
const W = 1280;
// ---------------- A: mapa del vídeo + título apilado + tarjeta ----------------
type Row = [string, string, string, string];   // code, nombre, valor, color
const sh = `9px 9px 0 ${INK}, -3px -3px 0 ${INK}, 3px -3px 0 ${INK}, -3px 3px 0 ${INK}`;
const MapOdds: React.FC<{v: string; l: [string, string, string]; cols: [string, string, string]; pill: string; head: string; rows: Row[]; size?: number}> = ({v, l, cols, pill, head, rows, size = 205}) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Indo2 v={v} audio={false} noHud />
    <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(8,14,30,0.8), rgba(8,14,30,0.15) 50%, rgba(0,0,0,0) 70%)'}} />
    <div style={{position: 'absolute', left: 56, top: 70}}>
      {l.map((t, i) => <div key={i} style={{...font, fontSize: size, color: cols[i], textShadow: sh, lineHeight: 0.95}}>{t}</div>)}
      <div style={{marginTop: 34, display: 'inline-block', background: 'rgba(14,18,28,0.95)', border: '7px solid #fff', borderRadius: 26, padding: '12px 34px 4px', ...font, fontSize: 64, color: YELLOW}}>{pill}</div>
    </div>
    <div style={{position: 'absolute', right: 60, top: 70, width: 640, transform: 'rotate(1.5deg)'}}>
      <div style={{background: CREAM, border: `10px solid ${INK}`, borderRadius: 34, padding: '18px 30px 10px', boxShadow: '0 16px 0 rgba(0,0,0,0.5)'}}>
        <div style={{...font, fontSize: 66, color: INK, textAlign: 'center', marginBottom: 6}}>{head}</div>
        {rows.map(([c, n, p, col], i) => (
          <div key={c} style={{display: 'flex', alignItems: 'center', gap: 20, height: 128, borderTop: '5px solid #e2d3b1'}}>
            <div style={{...font, fontSize: 64, color: INK, width: 44}}>{i + 1}</div>
            <div style={{border: `4px solid ${INK}`, borderRadius: 8, overflow: 'hidden', lineHeight: 0}}><FlagImg k={CODE.indexOf(c)} w={120} h={80} /></div>
            <div style={{...font, fontSize: n.length > 9 ? 54 : 62, color: INK, flex: 1, whiteSpace: 'nowrap'}}>{n}</div>
            <div style={{...font, fontSize: 64, color: col}}>{p}</div>
          </div>
        ))}
      </div>
    </div>
  </AbsoluteFill>
);
// ---------------- piezas comunes ----------------
const Ico: React.FC<{n: string; x: number; y: number; w: number; c: string; rot?: number}> = ({n, x, y, w, c, rot = 0}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - w / 2, width: w, height: w, transform: `rotate(${rot}deg)`, filter: `drop-shadow(0 0 2px ${INK}) drop-shadow(0 0 2px ${INK}) drop-shadow(0 6px 6px rgba(0,0,0,0.5))`}}>
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
const Badge: React.FC<{text: string; x: number; y: number; bg: string; size?: number; rot?: number}> = ({text, x, y, bg, size = 44, rot = -4}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,0) rotate(${rot}deg)`, background: bg, border: `5px solid ${INK}`, borderRadius: 16, padding: '4px 20px 0', ...font, fontSize: size, color: '#fff', boxShadow: '0 7px 0 rgba(0,0,0,0.45)', whiteSpace: 'nowrap'}}>{text}</div>
);
const ring = (n: number, cx: number, cy: number, rx: number, ry: number, a0 = -90) => Array.from({length: n}, (_, i) => { const a = ((a0 + (360 * i) / n) * Math.PI) / 180; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
const all = (col: string, except: string[]) => { const o: Record<number, string> = {}; COUNTRIES.forEach((c, i) => { if (!except.includes(c.c)) o[i] = col; }); return o; };
// ---------------- B: anillo de tachados ----------------
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
const AM = ['US', 'CA', 'MX', 'BR', 'AR', 'CO', 'CL', 'PE', 'VE', 'CU', 'EC', 'BO', 'PY', 'UY', 'GT', 'HN', 'PA', 'JM', 'HT'];
const CITY = ['Y01', 'Y00', 'Y02', 'Y03', 'Y04', 'Y05', 'Y06', 'Y07', 'Y08', 'Y09', 'Y10', 'Y12', 'Y13', 'Y15', 'Y16', 'Y19', 'Y22', 'Y27'];
const CNAME: Record<string, string> = {Y00: 'MUMBAI', Y01: 'DELHI', Y02: 'BANGALORE', Y03: 'HYDERABAD', Y04: 'CHENNAI', Y05: 'KOLKATA'};
const T: Record<string, React.ReactNode> = {
  // ===== AMERICA =====
  amB: <BR list={AM} cam={{cx: 2250, cy: 2250, s: 0.34}} top="AMERICA BATTLE ROYALE" bottom="ONLY 1 SURVIVES" seed={71} />,
  amC: (<>
    <WorldBg cam={{cx: 2300, cy: 2200, s: 0.4}} skip={['US', 'BR', 'MX', 'CA']} blur={2.2} colOver={(() => { const o: Record<number, string> = {}; ['US', 'CA', 'MX', 'GT', 'CU', 'BS'].forEach((c) => { const k = K(c); if (k >= 0) o[k] = '#2b4fa8'; }); return o; })()} />
    <AbsoluteFill style={{background: 'radial-gradient(circle at 30% 55%, rgba(0,0,0,0) 15%, rgba(0,0,0,0.55) 80%)'}} />
    <Rays x={330} y={430} c="rgba(120,170,255,0.6)" a={0.35} />
    <Glow x={330} y={430} r={300} c="rgba(120,170,255,0.6)" />
    <CBall k={K('US')} size={360} x={330} y={440} eyes="smug" look={0.5} rim="#fff" crown />
    {['BR', 'MX', 'CA'].map((c, i) => <CBall key={c} k={K(c)} size={160} x={1110 - i * 40} y={210 + i * 170} eyes="scared" look={-0.6} sweat />)}
    <VS x={760} y={420} r={80} />
    <Embers n={50} seed={72} c="#ffd27a" />
    <Vign />
    <Title3D text="CAN ANYONE" y={10} size={100} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Title3D text="STOP THE USA?" y={596} size={104} grad={GOLD} glow="rgba(255,190,40,0.85)" x={760} />
  </>),
  // ===== INDIA =====
  inB: <BR list={CITY} cam={{cx: 5493, cy: 1930, s: 0.9}} top="INDIA BATTLE ROYALE" bottom="32 CITIES · 1 SURVIVES" seed={73} />,
  inC: (<>
    <WorldBg cam={{cx: 5493, cy: 1950, s: 1.1}} skip={['IN']} blur={2.6} />
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, rgba(0,0,0,0) 15%, rgba(0,0,0,0.6) 85%)'}} />
    <Rays x={640} y={410} c="rgba(255,160,60,0.55)" a={0.35} />
    <Glow x={640} y={410} r={260} c="rgba(255,160,60,0.6)" />
    <CBall k={K('IN')} size={300} x={640} y={410} eyes="scared" look={0} sweat />
    <svg width={300} height={300} style={{position: 'absolute', left: 490, top: 260}}>
      {['M150 0 L135 70 L165 110 L140 170 L160 220 L150 300', 'M0 140 L70 150 L100 130 L150 160', 'M300 120 L230 140 L200 175 L160 165', 'M60 270 L110 210 L150 210'].map((d, i) => <path key={i} d={d} fill="none" stroke={INK} strokeWidth={9} strokeLinejoin="round" />)}
    </svg>
    {([['Y01', 190, 230], ['Y00', 190, 440], ['Y02', 1090, 230], ['Y05', 1090, 440]] as [string, number, number][]).map(([c, x, y], i) => { return <React.Fragment key={c}><CBall k={K(c)} size={150} x={x} y={y} eyes="angry" look={x < 640 ? 0.5 : -0.5} /><Badge text={CNAME[c]} x={x} y={y + 66} bg="#c81e1e" size={30} rot={i % 2 ? 3 : -3} /></React.Fragment>; })}
    <Embers n={50} seed={74} c="#ffd27a" />
    <Vign />
    <Title3D text="INDIA SPLIT INTO" y={8} size={100} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Title3D text="32 CITIES AT WAR" y={598} size={104} grad={GOLD} glow="rgba(255,190,40,0.85)" />
  </>),
  // ===== INDONESIA =====
  idB: (<>
    <SplitBg />
    <Embers n={60} seed={75} c="#ffd27a" />
    <Glow x={300} y={420} r={300} c="rgba(255,90,70,0.55)" />
    <CBall k={K('ID')} size={350} x={290} y={430} eyes="angry" look={0.6} rim="#ffb0a0" />
    <WarHelmet x={290} y={440} size={344} />
    {[['US', 1040, 300, 230], ['IN', 800, 250, 150], ['CN', 820, 450, 180], ['RU', 1120, 490, 170]].map(([c, x, y, s]: any) => <CBall key={c} k={K(c)} size={s} x={x} y={y} eyes="angry" look={-0.6} />)}
    <BoltFX seed={13} />
    <Vign />
    <Title3D text="INDONESIA VS" y={8} size={110} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Title3D text="4 SUPERPOWERS" y={596} size={110} grad={REDG} glow="rgba(255,60,40,0.85)" />
  </>),
  idC: (<>
    <WorldBg cam={{cx: 3900, cy: 1900, s: 0.36}} skip={[]} blur={2.2} colOver={all('#d11a1a', ['US', 'CN', 'RU'])} />
    <AbsoluteFill style={{background: 'radial-gradient(circle at 30% 55%, rgba(0,0,0,0) 15%, rgba(0,0,0,0.55) 80%)'}} />
    <Rays x={330} y={430} c="rgba(255,90,70,0.6)" a={0.35} />
    <Glow x={330} y={430} r={300} c="rgba(255,90,70,0.6)" />
    <CBall k={K('ID')} size={360} x={330} y={440} eyes="smug" look={0.5} rim="#fff" crown />
    {['US', 'CN', 'RU'].map((c, i) => <CBall key={c} k={K(c)} size={150} x={1120 - i * 40} y={210 + i * 170} eyes="scared" look={-0.6} sweat />)}
    <Ico n="battleship" x={700} y={500} w={170} c="linear-gradient(180deg,#fff,#ffd23f 60%,#c27400)" rot={-10} />
    <Embers n={50} seed={76} c="#ffd27a" />
    <Vign />
    <Title3D text="CAN INDONESIA CONQUER" y={10} size={88} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Title3D text="THE WORLD?" y={598} size={104} grad={GOLD} glow="rgba(255,190,40,0.85)" x={760} />
  </>),
};
export const D9_IDS = Object.keys(T);
export const ThumbD9: React.FC<{id: string}> = ({id}) => <AbsoluteFill style={{overflow: 'hidden', background: '#123'}}>{T[id]}</AbsoluteFill>;
// ---------------- A ----------------
const B = '#2f7fd6', O = '#e8a33a';
export const ThumbD9A: React.FC<{id: string}> = ({id}) => {
  if (id === 'am') return <MapOdds v="dbram" l={['AMERICA', 'BATTLE', 'ROYALE']} cols={['#fff', YELLOW, '#ff4a3a']} pill="28 COUNTRIES · 1 WINNER" head="🏆 WHO WINS?"
    rows={[['US', 'USA', '44%', O], ['BR', 'Brazil', '17%', B], ['MX', 'Mexico', '11%', B], ['CA', 'Canada', '9%', B], ['AR', 'Argentina', '6%', B]]} />;
  if (id === 'in') return <MapOdds v="dbrin" l={['INDIA', 'BATTLE', 'ROYALE']} cols={['#fff', YELLOW, '#ff4a3a']} pill="32 CITIES · 1 WINNER" head="🏆 WHO WINS?"
    rows={[['Y01', 'Delhi', '27%', O], ['Y00', 'Mumbai', '24%', B], ['Y02', 'Bangalore', '13%', B], ['Y05', 'Kolkata', '10%', B], ['Y03', 'Hyderabad', '8%', B]]} />;
  return <MapOdds v="idw" l={['INDONESIA', 'VS THE', 'WORLD']} cols={['#fff', YELLOW, '#ff4a3a']} size={170} pill="194 COUNTRIES · 1 WHEEL" head="☠️ FINAL BOSSES"
    rows={[['IN', 'India', '?', '#d63a2f'], ['RU', 'Russia', '?', '#d63a2f'], ['CN', 'China', '?', '#d63a2f'], ['US', 'USA', '?', '#d63a2f']]} />;
};
