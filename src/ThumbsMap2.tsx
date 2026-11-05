// 10 miniaturas de Indonesia vs The World inspiradas en los diseños más vistos del nicho
import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {COUNTRIES} from './HexWorld';
import {PolyCanvas, CEv} from './PolyWorld';
import {Face, INK, font} from './lib3';
import {CountryChar, WorldBg, Txt, VS} from './ThumbsMap';
import {Ball, Boom, Embers, Glow, Rays} from './ThumbsPro';
import {Planet} from './Logos';
import JI from './hw/indo2d.json';

const K = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
const W = 1280, H = 720;
const ID = K('ID'), US = K('US'), CN = K('CN'), RU = K('RU'), IN_ = K('IN');
const IDP = {stroke: 0.55, minFrac: 0.01};

// mapa en un instante del vídeo (t alto = el mundo ya pintado de Indonesia)
const MapAt: React.FC<{t: number; cam: {cx: number; cy: number; s: number}; blur?: number; flag?: boolean}> = ({t, cam, blur = 1.6, flag = true}) => (
  <AbsoluteFill style={{overflow: 'hidden', background: '#2f7fd0'}}>
    <div style={{position: 'absolute', inset: -20, filter: `blur(${blur}px) saturate(1.3)`}}>
      <PolyCanvas cev={(JI as any).cev as CEv[]} t={t} tm={t} byTm={false} cam={cam} W={W + 40} H={H + 40} opts={{squads: false, capitalsOff: true, war: null, empire: ID, empireFlag: flag, waves: true} as any} />
    </div>
  </AbsoluteFill>
);
// fondos de mitad: fuego o tormenta/llanto
export const Fire: React.FC<{side: 'l' | 'r'}> = ({side}) => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 100%, #fff1a0 0%, #ffb21a 18%, #ff5a1a 42%, #b3140c 70%, #3a0605 100%)', clipPath: side === 'l' ? 'polygon(0 0, 54% 0, 46% 100%, 0 100%)' : 'polygon(54% 0, 100% 0, 100% 100%, 46% 100%)'}} />
);
export const Storm: React.FC<{side: 'l' | 'r'}> = ({side}) => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, #6fb4ff 0%, #2a63c9 45%, #0d2058 100%)', clipPath: side === 'l' ? 'polygon(0 0, 54% 0, 46% 100%, 0 100%)' : 'polygon(54% 0, 100% 0, 100% 100%, 46% 100%)'}}>
    {Array.from({length: 26}, (_, i) => <div key={i} style={{position: 'absolute', left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, width: 4, height: 28, background: 'rgba(200,230,255,0.55)', transform: 'rotate(18deg)', borderRadius: 3}} />)}
  </AbsoluteFill>
);
// rayo blanco en diagonal que parte la miniatura
export const Bolt: React.FC<{x?: number}> = ({x = W / 2}) => (
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
    <path d={`M${x + 50},-10 L${x - 10},${H * 0.42} L${x + 40},${H * 0.44} L${x - 50},${H + 10}`} fill="none" stroke={INK} strokeWidth={34} strokeLinejoin="miter" />
    <path d={`M${x + 50},-10 L${x - 10},${H * 0.42} L${x + 40},${H * 0.44} L${x - 50},${H + 10}`} fill="none" stroke="#ffffff" strokeWidth={18} strokeLinejoin="miter" style={{filter: 'drop-shadow(0 0 14px #fff)'}} />
  </svg>
);
// lágrimas y sudor
export const Tears: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    {[[-1, 0], [1, 0]].map(([d], i) => <path key={i} d={`M${x + d * s * 0.45},${y} q${d * s * 0.05},${s * 0.35} ${d * s * 0.12},${s * 0.75} a${s * 0.1},${s * 0.1} 0 1 1 ${-d * s * 0.2},0 z`} fill="#7cc8ff" stroke={INK} strokeWidth={4} />)}
  </svg>
);
// sello rojo estilo "HATE"
const Stamp: React.FC<{text: string; x: number; y: number; size: number; rot?: number}> = ({text, x, y, size, rot = -14}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg)`, padding: `${size * 0.05}px ${size * 0.25}px`, border: `${size * 0.11}px solid #e5322d`, borderRadius: size * 0.12, ...font, fontSize: size, color: '#e5322d', lineHeight: 1, background: 'rgba(255,255,255,0.18)', boxShadow: `0 0 0 ${size * 0.04}px ${INK}, inset 0 0 0 ${size * 0.04}px ${INK}`, WebkitTextStroke: `${size * 0.04}px ${INK}`, paintOrder: 'stroke fill'}}>{text}</div>
);
export const Ico: React.FC<{name: string; x: number; y: number; w: number; c: string; rot?: number; flip?: boolean}> = ({name, x, y, w, c, rot = 0, flip}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - w / 2, width: w, height: w, transform: `rotate(${rot}deg) scaleX(${flip ? -1 : 1})`, filter: `drop-shadow(0 0 3px ${INK}) drop-shadow(0 0 3px ${INK}) drop-shadow(0 6px 0 rgba(0,0,0,0.5))`}}>
    <div style={{width: '100%', height: '100%', background: c, WebkitMaskImage: `url(${staticFile('hw/icons/' + name + '.svg')})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center'}} />
  </div>
);
// silueta misteriosa negra con "???"
const Mystery: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <div style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: '46% 54% 50% 50%', background: 'radial-gradient(circle at 40% 35%, #3a3a3a, #0c0c0c 75%)', border: `${s * 0.04}px solid #ff3b30`, boxShadow: '0 0 40px rgba(255,40,40,0.7)'}}>
    <svg width={s} height={s} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: 'drop-shadow(0 0 4px #fff)'}}><Face x={s / 2} y={s * 0.55} r={s * 0.3} mood="shocked" t={1} seed={9} /></svg>
  </div>
);
const Label: React.FC<{text: string; x: number; y: number; size: number; col?: string; rot?: number}> = ({text, x, y, size, col = '#fff', rot = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,0) rotate(${rot}deg)`, ...font, fontSize: size, color: col, WebkitTextStroke: `${size * 0.18}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.07}px 0 ${INK}`, whiteSpace: 'nowrap', lineHeight: 1}}>{text}</div>
);

const N: Record<string, React.ReactNode> = {
  // 1 · MapaVerso: Indonesia en llamas contra el planeta llorando, rayo blanco
  n1: (<>
    <Fire side="l" /><Storm side="r" />
    <Embers n={50} seed={5} c="#ffd27a" />
    <CountryChar k={ID} {...IDP} x={330} y={385} w={600} h={330} mood="angry" faceY={0.42} faceR={0.46} redEyes look={[0.6, 0]} />
    <div style={{position: 'absolute', left: 760, top: 200}}><Planet size={360} mood="sad" lon={110} lat={0} rim="#9fd0ff" /></div>
    <Tears x={940} y={415} s={120} />
    <Bolt />
    <Txt text="WHO FEARS" y={16} size={100} />
    <Txt text="INDONESIA?" y={598} size={104} col="#ff3b30" />
  </>),
  // 2 · MapaVerso: Indonesia vs EE. UU., partido por el rayo
  n2: (<>
    <Fire side="l" /><Storm side="r" />
    <CountryChar k={ID} {...IDP} x={320} y={390} w={600} h={320} mood="angry" faceY={0.42} faceR={0.46} redEyes look={[0.6, 0]} />
    <CountryChar k={US} x={960} y={390} w={540} h={340} mood="scared" faceY={0.5} faceR={0.4} look={[-0.6, 0]} />
    <Tears x={960} y={420} s={110} />
    <Bolt />
    <Txt text="INDONESIA VS" y={16} size={104} />
    <Txt text="THE USA?!" y={598} size={110} col="#ff3b30" />
  </>),
  // 3 · El Mapa Animado / Geo Map: 195 países, solo 1 sobrevive
  n3: (<>
    <WorldBg cam={{cx: 3840, cy: 2100, s: 0.2}} mood="angry" />
    <AbsoluteFill style={{background: 'rgba(0,10,40,0.25)'}} />
    <Label text="195 COUNTRIES" x={W / 2} y={170} size={128} col="#ffffff" rot={-4} />
    <Label text="ONLY 1 SURVIVES!" x={W / 2} y={330} size={120} col="#ffd23f" rot={-4} />
    <CountryChar k={ID} {...IDP} x={W / 2} y={575} w={520} h={250} mood="smug" faceY={0.42} faceR={0.5} />
    <Ico name="crown" x={W / 2 + 10} y={475} w={110} c="#ffd23f" />
  </>),
  // 4 · El Mapa Animado: "#1 vs ???"
  n4: (<>
    <AbsoluteFill style={{background: 'linear-gradient(110deg, #0f8a3a 0%, #19b24c 50%, #4a0b0b 50.2%, #9a1212 100%)'}} />
    <Rays x={320} y={360} c="rgba(255,255,255,0.35)" a={0.5} r={700} n={18} />
    <CountryChar k={ID} {...IDP} x={320} y={360} w={560} h={300} mood="angry" faceY={0.42} faceR={0.46} redEyes look={[0.6, 0]} />
    <Mystery x={960} y={350} s={330} />
    <Bolt />
    <Label text="INDONESIA" x={320} y={22} size={86} />
    <Label text="???" x={960} y={22} size={96} col="#ff3b30" />
    <Label text="#95" x={320} y={575} size={120} col="#ffd23f" />
    <Label text="#1" x={960} y={575} size={130} col="#ffd23f" />
  </>),
  // 5 · Map animation: cabecera de color, país al centro, nombre gigante abajo
  n5: (<>
    <WorldBg cam={{cx: 5600, cy: 2350, s: 0.33}} skip={['ID']} mood="angry" />
    <div style={{position: 'absolute', left: 0, right: 0, top: 18, textAlign: 'center', ...font, fontSize: 92, lineHeight: 1, WebkitTextStroke: `15px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 6px 0 ${INK}`}}>
      <span style={{color: '#fff'}}>WHO </span><span style={{color: '#3ad16a'}}>LOVES</span><span style={{color: '#fff'}}> & </span><span style={{color: '#ff3b30'}}>HATES</span>
    </div>
    <CountryChar k={ID} {...IDP} x={W / 2} y={360} w={880} h={380} mood="angry" faceY={0.42} faceR={0.4} redEyes />
    <Txt text="INDONESIA" y={590} size={120} />
  </>),
  // 6 · Geo Map Animations: sello rojo sobre el país
  n6: (<>
    <WorldBg cam={{cx: 5600, cy: 2350, s: 0.33}} skip={['ID']} mood="scared" />
    <CountryChar k={ID} {...IDP} x={W / 2} y={380} w={940} h={400} mood="angry" faceY={0.42} faceR={0.4} redEyes />
    <Stamp text="WAR" x={W / 2 + 230} y={470} size={120} rot={-14} />
    <Txt text="INDONESIA DECLARES" y={20} size={88} />
    <Txt text="WAR ON 194 COUNTRIES" y={604} size={80} col="#ffd23f" />
  </>),
  // 7 · Geo Map Animations: el mundo pintado de Indonesia, texto amarillo + rojo
  n7: (<>
    <MapAt t={470} cam={{cx: 3840, cy: 2150, s: 0.2}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.5) 100%)'}} />
    <Label text="WHAT IF INDONESIA" x={W / 2} y={190} size={100} col="#ffffff" rot={-3} />
    <Label text="CONQUERED EARTH?" x={W / 2} y={330} size={112} col="#ffd23f" rot={-3} />
    <div style={{position: 'absolute', left: 520, top: 470}}><Ball k={ID} size={210} mood="smug" x={120} y={110} rim="#ffd36b" crown /></div>
  </>),
  // 8 · Map animation X: DÍA 1 | DÍA 400, antes y después
  n8: (<>
    <div style={{position: 'absolute', inset: 0, clipPath: 'polygon(0 0, 54% 0, 46% 100%, 0 100%)'}}><MapAt t={0} cam={{cx: 4700, cy: 2250, s: 0.26}} flag={false} /></div>
    <div style={{position: 'absolute', inset: 0, clipPath: 'polygon(54% 0, 100% 0, 100% 100%, 46% 100%)'}}><MapAt t={470} cam={{cx: 3200, cy: 2250, s: 0.26}} /></div>
    <CountryChar k={ID} {...IDP} x={300} y={420} w={500} h={260} mood="scared" faceY={0.42} faceR={0.5} />
    <Ball k={ID} size={220} mood="smug" x={980} y={440} rim="#ffd36b" crown />
    <Bolt />
    <Label text="DAY 1" x={300} y={30} size={110} />
    <Label text="DAY 400" x={980} y={30} size={110} col="#ffd23f" />
  </>),
  // 9 · Countryballs España: countryballs armadas, el resto con miedo
  n9: (<>
    <WorldBg cam={{cx: 5600, cy: 2350, s: 0.33}} mood="scared" blur={4} />
    <Glow x={W / 2} y={420} r={430} c="rgba(255,60,40,0.55)" />
    <Ball k={ID} size={330} mood="angry" x={W / 2} y={400} rim="#ff8a5a" helmet />
    {[[US, 170, 470, 0.7], [CN, 330, 560, 0.7], [RU, 960, 560, -0.7], [IN_, 1110, 470, -0.7]].map(([k, x, y, l], i) => <Ball key={i} k={k} size={150} mood="scared" x={x} y={y} rim="#cfe3ff" look={[l, 0]} sweat />)}
    <Txt text="INDONESIA" y={18} size={104} />
    <Txt text="IS COMING..." y={610} size={90} col="#ff3b30" />
  </>),
  // 10 · MapaVerso: ¿y si Indonesia gobernara el mundo?
  n10: (<>
    <Fire side="l" /><Fire side="r" />
    <Rays x={W / 2} y={380} c="rgba(255,230,140,0.55)" a={0.6} r={900} n={20} />
    <CountryChar k={ID} {...IDP} x={W / 2} y={395} w={920} h={390} mood="smug" faceY={0.42} faceR={0.4} />
    <Ico name="crown" x={W / 2} y={190} w={170} c="#ffd23f" />
    <Embers n={70} seed={8} c="#ffe08a" />
    <Txt text="WHAT IF INDONESIA" y={16} size={92} />
    <Txt text="RULED THE WORLD?" y={604} size={96} col="#ffd23f" />
  </>),
};
export const ThumbMap2: React.FC<{id: string}> = ({id}) => <AbsoluteFill style={{background: '#2f7fd0', overflow: 'hidden'}}>{N[id]}</AbsoluteFill>;
export const MAP2_IDS = Object.keys(N);
