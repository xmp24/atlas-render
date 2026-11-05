// 5 miniaturas que combinan lo mejor de: Last One Standing, Who Fears, Ruled the World, Is Coming
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COUNTRIES} from './HexWorld';
import {CountryChar, WorldBg, Txt} from './ThumbsMap';
import {Fire, Storm, Bolt} from './ThumbsMap2';
import {CBall, AK} from './ThumbsCB';
import {Embers, Glow, Rays} from './ThumbsPro';
import {Planet} from './Logos';

const K = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
const W = 1280, H = 720;
const ID = K('ID'), US = K('US'), CN = K('CN'), RU = K('RU'), IN_ = K('IN'), BR = K('BR'), MX = K('MX'), JP = K('JP'), DE = K('DE'), GB = K('GB'), AU = K('AU');
const IDP = {stroke: 0.55, minFrac: 0.01};
const Dead: React.FC<{list: [number, number, number, number, number][]}> = ({list}) => <>{list.map(([k, x, y, s, r], i) => <CBall key={i} k={k} size={s} x={x} y={y} eyes="dead" rot={r} gray />)}</>;
const RaysBg: React.FC = () => (<>
  <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #ffd36a 0%, #ff8a1f 30%, #d8321a 65%, #7a0f0a 100%)'}} />
  <Rays x={W / 2} y={400} c="rgba(255,240,180,0.6)" a={0.55} r={1000} n={22} />
</>);

const X: Record<string, React.ReactNode> = {
  // 1 · fuego vs tormenta: Indonesia armada con casco y gafas contra la Tierra llorando
  x1: (<>
    <Fire side="l" /><Storm side="r" />
    <Embers n={60} seed={21} c="#ffd27a" />
    <Glow x={320} y={400} r={330} c="rgba(255,200,80,0.5)" />
    <CBall k={ID} size={380} x={320} y={400} eyes="shades" helmet look={0.5} />
    <AK x={470} y={500} w={300} rot={-18} />
    <div style={{position: 'absolute', left: 790, top: 220}}><Planet size={350} mood="sad" lon={110} lat={0} rim="#9fd0ff" /></div>
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>{[[905, 425], [1035, 425]].map(([x, y], i) => <path key={i} d={`M${x},${y} q6,40 10,80 a13,13 0 1 1 -22,0 q4,-40 12,-80 z`} fill="#7cc8ff" stroke="#1d1d1d" strokeWidth={4} />)}</svg>
    <Bolt />
    <Txt text="WHO FEARS" y={14} size={102} />
    <Txt text="INDONESIA?" y={600} size={108} col="#ff3b30" />
  </>),
  // 2 · rayos dorados + corona + AK, los vencidos grises a sus pies
  x2: (<>
    <RaysBg />
    <Embers n={70} seed={22} c="#fff0b0" />
    <Dead list={[[US, 150, 630, 240, -25], [CN, 380, 680, 200, 18], [RU, 1120, 640, 240, 28], [BR, 880, 690, 190, -12], [MX, 40, 470, 170, -40], [JP, 1250, 450, 160, 50]]} />
    <CBall k={ID} size={410} x={640} y={420} eyes="shades" crown rim="#fff2a0" />
    <AK x={820} y={510} w={320} rot={-28} />
    <Txt text="LAST ONE STANDING" y={14} size={92} col="#ffd23f" />
  </>),
  // 3 · mapa con caritas + resplandor rojo: casco, gafas, AK; las potencias sudando
  x3: (<>
    <WorldBg cam={{cx: 5600, cy: 2350, s: 0.33}} mood="scared" blur={4} />
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, rgba(255,40,20,0.45) 0%, rgba(80,0,0,0.25) 45%, rgba(0,0,0,0.45) 100%)'}} />
    <Embers n={50} seed={23} c="#ffb35a" />
    <CBall k={ID} size={400} x={640} y={385} eyes="shades" helmet rim="#ff6a4a" />
    <AK x={820} y={470} w={320} rot={-22} />
    {[[US, 170, 430, 170, 0.8], [CN, 300, 570, 160, 0.8], [RU, 980, 570, 160, -0.8], [IN_, 1110, 430, 170, -0.8]].map(([k, x, y, s, l], i) => <CBall key={i} k={k} size={s} x={x} y={y} eyes="scared" look={l} sweat />)}
    <Txt text="INDONESIA" y={14} size={108} />
    <Txt text="IS COMING..." y={600} size={100} col="#ff3b30" />
  </>),
  // 4 · fuego vs tormenta: Indonesia coronada contra EE. UU. llorando y los caídos
  x4: (<>
    <Fire side="l" /><Storm side="r" />
    <Embers n={50} seed={24} c="#ffd27a" />
    <CBall k={ID} size={400} x={320} y={390} eyes="shades" crown look={0.5} rim="#fff2a0" />
    <AK x={480} y={490} w={300} rot={-18} />
    <Dead list={[[CN, 830, 640, 170, 25], [RU, 1200, 630, 170, -20]]} />
    <CBall k={US} size={330} x={980} y={380} eyes="scared" look={-0.8} tears sweat />
    <Bolt />
    <Txt text="INDONESIA VS" y={14} size={102} />
    <Txt text="THE WORLD" y={600} size={110} col="#ffd23f" />
  </>),
  // 5 · rayos + silueta gigante de Indonesia detrás + countryball coronada armada
  x5: (<>
    <RaysBg />
    <div style={{opacity: 0.85}}><CountryChar k={ID} {...IDP} x={W / 2} y={400} w={1200} h={470} mood="angry" faceY={2} faceR={0.001} /></div>
    <Embers n={70} seed={25} c="#fff0b0" />
    <CBall k={ID} size={330} x={640} y={400} eyes="shades" crown rim="#fff2a0" />
    <AK x={790} y={480} w={260} rot={-26} />
    {[[US, 150, 470, 150, 0.8], [CN, 1130, 470, 150, -0.8]].map(([k, x, y, s, l], i) => <CBall key={i} k={k} size={s} x={x} y={y} eyes="scared" look={l} sweat />)}
    <Txt text="WHAT IF INDONESIA" y={14} size={94} />
    <Txt text="RULED THE WORLD?" y={604} size={98} col="#ffd23f" />
  </>),
};
export const ThumbCombo: React.FC<{id: string}> = ({id}) => <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>{X[id]}</AbsoluteFill>;
export const COMBO_IDS = Object.keys(X);
