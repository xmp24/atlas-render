// Miniaturas AMERICA vs ASIA Battle Royale (estilo LATIN AMERICA BATTLE ROYALE)
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COUNTRIES} from './HexWorld';
import {Embers, Glow} from './ThumbsPro';
import {CBall, AK} from './ThumbsCB';
import {WarHelmet, Title3D, GOLD, WHITE, REDG, Muzzle, Tracers, Smoke, Vign} from './ThumbsFinal';
import {Bg, Bolt} from './ThumbsRich';
import {WorldBg} from './ThumbsMap';

const K = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
const BLUEG = 'linear-gradient(180deg,#e6f4ff 0%,#7cc4ff 40%,#2f7fe6 75%,#1846a8 100%)';
const Hero: React.FC<{c: string; x: number; y: number; s: number; right?: boolean; rim: string}> = ({c, x, y, s, right, rim}) => (<>
  <Glow x={x} y={y} r={s * 0.85} c={rim} />
  <CBall k={K(c)} size={s} x={x} y={y} eyes="angry" look={right ? -0.6 : 0.6} rim={rim} />
  <WarHelmet x={x} y={y + s * 0.03} size={s * 0.98} rot={right ? 6 : -6} />
  <AK x={x + (right ? -s * 0.42 : s * 0.42)} y={y + s * 0.24} w={s * 0.78} rot={right ? -40 : 40} flip={right} />
</>);
const Crowd: React.FC<{list: [string, number, number, number][]; right?: boolean; eyes?: any}> = ({list, right, eyes}) => (<>
  {list.map(([c, x, y, s], i) => <CBall key={c} k={K(c)} size={s} x={x} y={y} eyes={eyes ?? (i % 2 ? 'scared' : 'angry')} look={right ? -0.6 : 0.6} />)}
</>);
const T: Record<string, React.ReactNode> = {
  // A · como la de Latinoamérica: USA armado vs China armada + aliados detrás
  a: (<>
    <Bg />
    <Embers n={40} seed={7} c="#ffd27a" />
    <Crowd list={[['MX', 120, 560, 120], ['BR', 520, 590, 130], ['CA', 110, 250, 110], ['AR', 540, 250, 100]]} />
    <Crowd list={[['JP', 1170, 250, 115], ['IN', 760, 590, 125], ['RU', 1150, 570, 130], ['KR', 760, 245, 100]]} right />
    <Hero c="US" x={330} y={400} s={300} rim="rgba(120,200,255,0.55)" />
    <Hero c="CN" x={960} y={400} s={300} right rim="rgba(255,170,60,0.6)" />
    <Muzzle x={590} y={500} s={70} /><Muzzle x={700} y={500} s={70} />
    <Tracers from={[600, 495]} to={[700, 470]} n={3} /><Tracers from={[690, 495]} to={[590, 470]} n={3} />
    <Smoke list={[[120, 680, 110], [1160, 680, 110]]} />
    <Bolt /><Vign />
    <Title3D text="AMERICA VS ASIA" y={8} size={100} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Title3D text="BATTLE ROYALE" y={590} size={112} grad={REDG} glow="rgba(255,60,40,0.85)" />
  </>),
  // B · 82 países, solo 1 sobrevive
  b: (<>
    <Bg />
    <Embers n={50} seed={9} c="#ffd27a" />
    <Crowd list={[['US', 200, 330, 190], ['BR', 440, 300, 150], ['MX', 140, 520, 130], ['CA', 330, 520, 140], ['AR', 520, 500, 120], ['CO', 470, 140, 90], ['CU', 120, 160, 85]]} />
    <Crowd list={[['CN', 1080, 330, 190], ['IN', 840, 300, 150], ['JP', 1140, 520, 130], ['RU', 950, 520, 140], ['KR', 760, 500, 120], ['SA', 810, 140, 90], ['IR', 1160, 160, 85]]} right />
    <Bolt /><Vign />
    <Title3D text="82 COUNTRIES" y={14} size={104} grad={WHITE} glow="rgba(255,255,255,0.6)" />
    <Title3D text="ONLY 1 SURVIVES" y={590} size={108} grad={GOLD} glow="rgba(255,190,40,0.85)" />
  </>),
  // C · mapa del mundo partido azul/rojo + WHO WINS?
  c: (<>
    <AbsoluteFill style={{clipPath: 'inset(0 50% 0 0)'}}><WorldBg cam={{cx: 2250, cy: 1900, s: 0.42}} blur={2} /></AbsoluteFill>
    <AbsoluteFill style={{clipPath: 'inset(0 0 0 50%)'}}><WorldBg cam={{cx: 5150, cy: 1500, s: 0.42}} blur={2} /></AbsoluteFill>
    <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(30,90,220,0.55) 0%, rgba(30,90,220,0.35) 42%, rgba(220,40,30,0.35) 58%, rgba(220,40,30,0.55) 100%)', mixBlendMode: 'multiply'}} />
    <Embers n={30} seed={4} c="#ffd27a" />
    <Hero c="US" x={300} y={420} s={290} rim="rgba(120,200,255,0.6)" />
    <Hero c="CN" x={980} y={420} s={290} right rim="rgba(255,170,60,0.6)" />
    <Bolt /><Vign />
    <Title3D text="AMERICA" x={330} y={20} size={104} grad={BLUEG} glow="rgba(80,170,255,0.8)" rot={-3} />
    <Title3D text="ASIA" x={960} y={20} size={118} grad={REDG} glow="rgba(255,60,40,0.85)" rot={3} />
    <Title3D text="WHO WINS?" y={598} size={104} grad={GOLD} glow="rgba(255,190,40,0.85)" />
  </>),
};
export const AMAS_IDS = Object.keys(T);
export const ThumbAmAs: React.FC<{id: string}> = ({id}) => <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>{T[id]}</AbsoluteFill>;
