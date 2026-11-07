// Miniaturas v7 (estilo del nicho: mapa limpio y saturado, 1 foco, texto plano enorme con contorno negro, sin efectos repetidos)
import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {COUNTRIES} from './HexWorld';
import {INK} from './lib3';
import {WorldBg} from './ThumbsMap';
import {CBall, AK} from './ThumbsCB';
import {WarHelmet} from './ThumbsFinal';
import {EarthBall, MysteryBall, Shine, StatesMap} from './ThumbsD6';

const K = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
const W = 1280, H = 720;
const ALL = COUNTRIES.map((c) => c.c);
const PAL = ['#e8463c', '#f2b52b', '#3fb34f', '#2f7be0', '#9b4fd1', '#f07a1e', '#1fb8b0', '#e04a9a', '#8bc43a', '#5560e0', '#d9c22e', '#c2563a'];
const distinct = (list: string[]) => { const o: Record<number, string> = {}; list.forEach((c, i) => { const k = K(c); if (k >= 0) o[k] = PAL[(i * 5 + (i >> 2)) % PAL.length]; }); return o; };
const paint = (col: string, list: string[], base: Record<number, string> = {}) => { const o = {...base}; list.forEach((c) => { const k = K(c); if (k >= 0) o[k] = col; }); return o; };
const NEUT: Record<number, string> = {}; COUNTRIES.forEach((_, i) => { NEUT[i] = '#d9cfb4'; });
const allBut = (col: string, except: string[]) => paint(col, ALL.filter((c) => !except.includes(c)));

// ---------- texto plano: relleno liso, contorno negro gordo, sombra dura ----------
const Txt: React.FC<{t: string; x?: number; y: number; size: number; c?: string; f?: 'L' | 'A' | 'B'; rot?: number; sw?: number}> = ({t, x = W / 2, y, size, c = '#fff', f = 'L', rot = 0, sw}) => {
  const fam = f === 'L' ? 'Luckiest' : f === 'A' ? 'Anton' : 'Bungee';
  const s = sw ?? size * (f === 'A' ? 0.09 : 0.12);
  return <div style={{position: 'absolute', left: x - 800, width: 1600, top: y, textAlign: 'center', fontFamily: fam, fontSize: size, lineHeight: 1, color: c, WebkitTextStroke: `${s}px ${INK}`, paintOrder: 'stroke fill', textShadow: `${size * 0.05}px ${size * 0.07}px 0 ${INK}`, transform: `rotate(${rot}deg)`, whiteSpace: 'nowrap', letterSpacing: f === 'A' ? 1 : 0}}>{t}</div>;
};
// ---------- caja de color con texto (estilo infografía) ----------
const Box: React.FC<{t: string; x?: number; y: number; size: number; bg?: string; c?: string; rot?: number}> = ({t, x = W / 2, y, size, bg = '#ffe600', c = INK, rot = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translateX(-50%) rotate(${rot}deg)`, background: bg, border: `${size * 0.07}px solid ${INK}`, padding: `${size * 0.08}px ${size * 0.28}px ${size * 0.02}px`, fontFamily: 'Anton', fontSize: size, lineHeight: 1.05, color: c, whiteSpace: 'nowrap', boxShadow: `${size * 0.08}px ${size * 0.1}px 0 ${INK}`}}>{t}</div>
);
// ---------- flecha roja gorda ----------
const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; w?: number; c?: string}> = ({x1, y1, x2, y2, w = 46, c = '#ff2a2a'}) => {
  const a = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1), hl = w * 1.6;
  const pts = [[0, -w / 2], [L - hl, -w / 2], [L - hl, -w * 1.15], [L, 0], [L - hl, w * 1.15], [L - hl, w / 2], [0, w / 2]].map(([px, py]) => [x1 + px * Math.cos(a) - py * Math.sin(a), y1 + px * Math.sin(a) + py * Math.cos(a)]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ') + 'Z';
  return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><path d={d} fill={INK} transform="translate(6,8)" /><path d={d} fill={c} stroke={INK} strokeWidth={9} strokeLinejoin="round" /></svg>;
};
const Map: React.FC<{cam: {cx: number; cy: number; s: number}; col?: Record<number, string>; dim?: number}> = ({cam, col, dim = 0}) => (<>
  <WorldBg cam={cam} skip={ALL} blur={0} colOver={{...NEUT, ...(col || {})}} />
  {dim > 0 && <AbsoluteFill style={{background: `rgba(0,0,0,${dim})`}} />}
</>);
const Ball: React.FC<{c: string; x: number; y: number; s: number; eyes?: any; look?: number; helmet?: boolean; gun?: 'r' | 'l'; sweat?: boolean; crown?: boolean; rot?: number; flagBg?: string}> = ({c, x, y, s, eyes = 'angry', look = 0, helmet, gun, sweat, crown, rot = 0, flagBg}) => (<>
  <div style={{position: 'absolute', left: x - s * 0.44, top: y + s * 0.42, width: s * 0.88, height: s * 0.12, borderRadius: '50%', background: 'rgba(0,0,0,0.45)'}} />
  <CBall k={K(c)} size={s} x={x} y={y} eyes={eyes} look={look} sweat={sweat} crown={crown} rot={rot} flagBg={flagBg} />
  <Shine x={x} y={y} s={s} rim="rgba(255,255,255,0.35)" />
  {helmet && <WarHelmet x={x} y={y + s * 0.03} size={s * 0.98} />}
  {gun === 'r' && <AK x={x + s * 0.38} y={y + s * 0.2} w={s * 0.78} rot={35} />}
  {gun === 'l' && <AK x={x - s * 0.38} y={y + s * 0.2} w={s * 0.78} rot={-35} flip />}
</>);
// fondo partido rojo/azul liso y saturado (sin rayos ni chispas)
const Split: React.FC<{l?: string; r?: string}> = ({l = '#e3121b', r = '#1565ff'}) => (<>
  <AbsoluteFill style={{background: `linear-gradient(105deg, ${l} 0%, ${l} 49.6%, #fff 49.6%, #fff 50.4%, ${r} 50.4%, ${r} 100%)`}} />
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.18) 0%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)'}} />
</>);
const VS: React.FC<{x?: number; y: number; s?: number}> = ({x = W / 2, y, s = 150}) => <Txt t="VS" x={x} y={y} size={s} c="#ffe600" rot={-6} />;

const C_EU = {cx: 4150, cy: 1260, s: 0.92}, C_AF = {cx: 4262, cy: 2330, s: 0.47}, C_AS = {cx: 5700, cy: 1760, s: 0.5}, C_W = {cx: 3900, cy: 1750, s: 0.24}, C_AM = {cx: 2400, cy: 1900, s: 0.42};
const EU = 'PT ES FR BE NL LU DE CH AT IT SI HR BA RS ME AL MK GR BG RO MD UA BY PL CZ SK HU LT LV EE FI SE NO DK IE GB IS RU CY MT TR'.split(' ');
const AF = 'MA DZ TN LY EG SD SS ET ER DJ SO KE UG TZ RW BI CD CG GA GQ CM CF TD NE NG BJ TG GH CI LR SL GN GW SN GM ML MR BF AO ZM MW MZ ZW BW NA ZA LS SZ MG'.split(' ');
const AS = 'TR SY IQ IR SA YE OM AE QA KW JO IL LB AF PK IN NP BD MM TH LA VN KH MY ID PH CN MN KP KR JP TW KZ UZ TM KG TJ LK GE AM AZ BT'.split(' ');
const LA = 'MX GT HN SV NI CR PA CU DO HT CO VE EC PE BO BR PY UY AR CL GY SR'.split(' ');

const SC: Record<string, (v: 'a' | 'b') => React.ReactNode> = {
  // ===== WW2: Alemania armada contra la Tierra seria con casco =====
  ww2: (v) => v === 'a' ? (<>
    <Split l="#1c1c1c" r="#1565ff" />
    <Ball c="DE" x={330} y={420} s={420} helmet gun="r" look={0.5} />
    <EarthBall x={960} y={440} s={380} mood="serious" hat />
    <Txt t="WORLD WAR 2" y={26} size={128} c="#fff" rot={-2} />
  </>) : (<>
    <Map cam={{cx: 3300, cy: 1500, s: 0.42}} col={{...allBut('#3b3b3b', ['US', 'CA', 'MX', 'GL']), ...paint('#1f63e0', ['US', 'CA', 'MX'])}} />
    <Arrow x1={560} y1={330} x2={300} y2={300} />
    <Ball c="DE" x={760} y={430} s={400} helmet gun="l" look={-0.5} />
    <Box t="WORLD WAR 2" y={36} size={110} bg="#ffe600" rot={-2} />
  </>),
  // ===== Survive: Islandia 1 día vs EEUU 365 días =====
  survive: (v) => (<>
    <WorldBg cam={C_W} skip={ALL} blur={2} />
    <AbsoluteFill style={{background: 'rgba(0,0,0,0.45)'}} />
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: 'scale(0.72)', transformOrigin: '640px 300px'}}><BigClockFlat /></div>
    <Ball c="IS" x={220} y={360} s={290} eyes="scared" look={0.4} sweat />
    <Ball c="US" x={1060} y={360} s={300} helmet gun="l" look={-0.4} />
    {v === 'a' ? <><Txt t="1 DAY" x={220} y={545} size={120} c="#ff3b30" rot={-4} /><Txt t="365 DAYS" x={1060} y={548} size={104} c="#3dff6a" rot={3} /></>
      : <><Box t="1 DAY" x={220} y={545} size={92} bg="#ff2a2a" c="#fff" rot={-4} /><Box t="365 DAYS" x={1060} y={548} size={92} bg="#2fd44f" c="#fff" rot={3} /></>}
  </>),
  // ===== 50 estados =====
  brus: (v) => v === 'a' ? (<>
    <div style={{position: 'absolute', inset: 0, transform: 'scale(1.35)'}}><StatesMap /></div>
    <Txt t="BATTLE" y={150} size={190} c="#fff" rot={-3} />
    <Txt t="ROYALE" y={360} size={190} c="#ffe600" rot={-3} />
  </>) : (<>
    <div style={{position: 'absolute', inset: 0, transform: 'scale(1.35)'}}><StatesMap /></div>
    <AbsoluteFill style={{background: 'rgba(0,0,0,0.15)'}} />
    <Ball c="US" x={640} y={430} s={430} helmet gun="r" look={0.2} />
    <Txt t="BATTLE ROYALE" y={22} size={130} c="#fff" rot={-2} />
  </>),
  // ===== Battle Royales: mapa de colores + bola misteriosa de un color =====
  breu: (v) => (<>
    <Map cam={C_EU} col={distinct(EU)} />
    <MysteryBall x={640} y={450} s={360} col="#1f5fe0" dark="#06205e" light="#8fc2ff" v="a" />
    {v === 'a' ? <Txt t="EUROPE BATTLE ROYALE" y={28} size={104} c="#fff" rot={-2} /> : <Box t="EUROPEAN BATTLE ROYALE" y={30} size={92} rot={-2} />}
  </>),
  braf: (v) => (<>
    <Map cam={C_AF} col={distinct(AF)} />
    <MysteryBall x={640} y={450} s={360} col="#1e9e48" dark="#063a18" light="#8ff0a8" v="a" />
    {v === 'a' ? <Txt t="AFRICA BATTLE ROYALE" y={28} size={104} c="#fff" rot={-2} /> : <Box t="AFRICAN BATTLE ROYALE" y={30} size={92} rot={-2} />}
  </>),
  bras: (v) => (<>
    <Map cam={C_AS} col={distinct(AS)} />
    <MysteryBall x={640} y={450} s={360} col="#d6202a" dark="#4a0006" light="#ff9a8a" v="a" />
    {v === 'a' ? <Txt t="ASIA BATTLE ROYALE" y={28} size={110} c="#fff" rot={-2} /> : <Box t="ASIAN BATTLE ROYALE" y={30} size={92} rot={-2} />}
  </>),
  // ===== España =====
  cqes: (v) => (<>
    <Map cam={C_W} col={v === 'b' ? paint('#ffc400', ['ES', 'MX', 'GT', 'HN', 'SV', 'NI', 'CR', 'PA', 'CU', 'DO', 'CO', 'VE', 'EC', 'PE', 'BO', 'PY', 'UY', 'AR', 'CL', 'PH', 'PT', 'MA']) : allBut('#ffc400', ['US', 'CN', 'RU', 'GB'])} />
    {v === 'b' && <><Arrow x1={560} y1={330} x2={330} y2={430} /><Arrow x1={700} y1={330} x2={1060} y2={430} /></>}
    <Ball c="ES" x={640} y={400} s={400} eyes="smug" crown flagBg="linear-gradient(180deg, #c60b1e 0%, #c60b1e 25%, #ffc400 25%, #ffc400 75%, #c60b1e 75%, #c60b1e 100%)" />
    {v === 'a' ? <Txt t="SPANISH EMPIRE" y={588} size={120} c="#ffe600" rot={-2} /> : <Box t="SPANISH EMPIRE" y={596} size={92} bg="#c60b1e" c="#fff" rot={-2} />}
  </>),
  // ===== Ucrania =====
  ukr: (v) => v === 'a' ? (<>
    <Map cam={{cx: 4420, cy: 1240, s: 1.25}} col={{...paint('#1f63e0', ['UA', 'PL', 'RO', 'SK', 'HU', 'LT', 'LV', 'EE', 'DE', 'CZ', 'FI', 'SE', 'NO', 'DK', 'BG', 'MD', 'TR', 'GR', 'AT', 'SI', 'HR', 'NL', 'BE', 'FR', 'IT', 'GB']), ...paint('#e3121b', ['RU', 'BY'])}} />
    <Arrow x1={330} y1={420} x2={620} y2={380} c="#ffe600" />
    <Ball c="UA" x={300} y={450} s={380} helmet look={0.5} />
    <Ball c="RU" x={990} y={450} s={380} gun="l" look={-0.5} />
    <Box t="UKRAINE JOINS NATO" y={30} size={92} rot={-2} />
  </>) : (<>
    <Split l="#1f63e0" r="#e3121b" />
    <Ball c="UA" x={320} y={430} s={430} helmet look={0.5} />
    <Ball c="RU" x={960} y={430} s={430} gun="l" look={-0.5} />
    <VS y={330} s={150} />
    <Txt t="WHAT IF UKRAINE JOINED NATO?" y={34} size={78} c="#fff" rot={-2} />
  </>),
  // ===== USA vs LatAm (mismo diseño, texto nuevo) =====
  usla: (v) => (<>
    {v === 'a' ? <Split /> : <Map cam={C_AM} col={{...paint('#e3121b', ['US']), ...paint('#2fae4e', LA)}} />}
    <Ball c="US" x={290} y={420} s={350} helmet gun="r" look={0.6} />
    {[['BR', 1000, 300, 230], ['MX', 820, 480, 170], ['CO', 1150, 520, 170], ['VE', 980, 560, 150], ['AR', 1180, 230, 140], ['CU', 820, 250, 130]].map(([c, x, y, s]: any) => <Ball key={c} c={c} x={x} y={y} s={s} look={-0.6} />)}
    {v === 'a' ? <><Txt t="USA VS" y={14} size={110} c="#fff" rot={-2} /><Txt t="LATIN AMERICA" y={594} size={104} c="#ffe600" rot={-2} /></>
      : <><Box t="USA VS LATIN AMERICA" y={30} size={86} rot={-2} /></>}
  </>),
  // ===== WW3 =====
  ww3: (v) => v === 'a' ? (<>
    <Split />
    <Ball c="US" x={320} y={430} s={400} helmet gun="r" look={0.6} />
    <Ball c="RU" x={960} y={430} s={400} helmet gun="l" look={-0.6} />
    <Txt t="WORLD WAR 3" y={26} size={130} c="#fff" rot={-2} />
  </>) : (<>
    <Map cam={C_W} col={{...paint('#1f63e0', ['US', 'CA', 'GB', 'FR', 'DE', 'PL', 'IT', 'ES', 'JP', 'KR', 'AU', 'NO', 'SE', 'FI', 'NL', 'BE', 'PT', 'RO', 'TR', 'GR', 'UA']), ...paint('#e3121b', ['RU', 'CN', 'IR', 'KP', 'BY'])}} />
    <Arrow x1={760} y1={330} x2={980} y2={360} c="#ffe600" />
    <Ball c="US" x={260} y={440} s={330} helmet gun="r" look={0.6} />
    <Ball c="RU" x={1030} y={440} s={330} helmet gun="l" look={-0.6} />
    <Box t="WORLD WAR 3" y={30} size={110} bg="#ff2a2a" c="#fff" rot={-2} />
  </>),
  // ===== Conquer: estilo "USA VS THE ENTIRE WORLD" =====
  cqru: (v) => <Conq v={v} k="RU" name="RUSSIA" col="#e3121b" />,
  cqcn: (v) => <Conq v={v} k="CN" name="CHINA" col="#e3121b" />,
  cqbr: (v) => <Conq v={v} k="BR" name="BRAZIL" col="#20b04a" />,
};
const Conq: React.FC<{v: 'a' | 'b'; k: string; name: string; col: string}> = ({v, k, name, col}) => v === 'a' ? (<>
  <Split />
  <Ball c={k} x={320} y={430} s={420} helmet gun="r" look={0.6} />
  <EarthBall x={960} y={430} s={390} mood="sad" />
  <Txt t={`${name} VS`} y={20} size={118} c="#fff" rot={-2} />
  <Txt t="THE ENTIRE WORLD" y={600} size={100} c="#ffe600" rot={-2} />
</>) : (<>
  <Map cam={C_W} col={allBut(col, ['US', 'CA', 'AU', 'GL', 'AQ'])} />
  <Ball c={k} x={640} y={420} s={420} helmet gun="r" look={0.2} />
  <Box t={`CAN ${name} CONQUER THE WORLD?`} y={30} size={80} rot={-2} />
</>);
// reloj sin brillos
const BigClockFlat: React.FC = () => {
  const s = 400, cx = W / 2, cy = 380;
  return (<>
    <div style={{position: 'absolute', left: cx - s / 2, top: cy - s / 2, width: s, height: s, borderRadius: '50%', background: '#fffdf4', border: `22px solid ${INK}`, boxShadow: `0 0 0 14px #ff2a2a, 0 0 0 26px ${INK}, 18px 22px 0 26px rgba(0,0,0,0.55)`}}>
      <svg width={s - 44} height={s - 44} style={{position: 'absolute', left: 0, top: 0}}>
        {Array.from({length: 12}, (_, i) => { const a = (i * 30 * Math.PI) / 180; return <line key={i} x1={178 + Math.sin(a) * 140} y1={178 - Math.cos(a) * 140} x2={178 + Math.sin(a) * 168} y2={178 - Math.cos(a) * 168} stroke={INK} strokeWidth={12} />; })}
        <path d="M178 178 L178 20 A158 158 0 1 1 48 86 Z" fill="#ff2a2a" opacity={0.85} />
        <line x1={178} y1={178} x2={178} y2={50} stroke={INK} strokeWidth={20} strokeLinecap="round" />
        <line x1={178} y1={178} x2={270} y2={232} stroke={INK} strokeWidth={14} strokeLinecap="round" />
        <circle cx={178} cy={178} r={18} fill={INK} />
      </svg>
    </div>
    {[-1, 1].map((d) => <div key={d} style={{position: 'absolute', left: cx + d * 150 - 60, top: cy - 250, width: 120, height: 76, borderRadius: '50% 50% 20% 20%', background: '#ff2a2a', border: `12px solid ${INK}`, transform: `rotate(${d * 30}deg)`}} />)}
  </>);
};
const T: Record<string, React.ReactNode> = {};
for (const k of Object.keys(SC)) { T[`${k}-a`] = SC[k]('a'); T[`${k}-b`] = SC[k]('b'); }
export const ThumbD7: React.FC<{id: string}> = ({id}) => <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>{T[id]}</AbsoluteFill>;
export const D7_IDS = Object.keys(T);
