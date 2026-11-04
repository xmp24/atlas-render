// Banners del canal 2560x1440 (zona segura 1546x423 centrada), sin nombre
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COUNTRIES} from './HexWorld';
import {PolyCanvas, CEv} from './PolyWorld';
import {INK, font} from './lib3';
import {Glow, Rays, Boom, Embers, Icon, Ball, Trophy, Bolt} from './ThumbsPro';
import {Planet} from './Logos';
import JC from './hw/cup.json';
import JU from './hw/usa.json';

const K = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
const W = 2560, H = 1440, SX = (W - 1546) / 2, SY = (H - 423) / 2; // zona segura
const Map: React.FC<{d: any; t: number; cx: number; cy: number; s: number; blur?: number; tint?: string; empire?: number | null}> = ({d, t, cx, cy, s, blur = 3, tint, empire = null}) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, filter: `blur(${blur}px) saturate(1.2) contrast(1.1)`}}>
      <PolyCanvas cev={d.cev as CEv[]} t={t} tm={t} byTm={false} cam={{cx, cy, s}} W={W} H={H} opts={{squads: false, capitalsOff: true, war: null, empire, waves: true}} />
    </div>
    {tint && <AbsoluteFill style={{background: tint, mixBlendMode: 'multiply'}} />}
  </AbsoluteFill>
);
const Tagline: React.FC<{text: string; y?: number; col?: string}> = ({text, y = SY + 330, col = '#ffd23f'}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', ...font, fontSize: 64, color: col, WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 7px 0 ${INK}`}}>{text}</div>
);
const ROW = ['US', 'CN', 'RU', 'IN', 'BR', 'GB', 'FR', 'JP', 'ID', 'TR', 'MX', 'KR'];
const B: Record<string, React.ReactNode> = {
  // 1: fila de countryballs a ambos lados de la mascota, mapa de fondo
  b1: (<>
    <Map d={JU} t={30} cx={3840} cy={2100} s={0.36} tint="linear-gradient(90deg, #5a7ad0, #20304f 50%, #5a7ad0)" />
    <Rays x={W / 2} y={H / 2} c="rgba(255,210,90,0.6)" a={0.45} r={1400} n={24} />
    <Glow x={W / 2} y={H / 2} r={700} c="rgba(255,200,80,0.6)" />
    {ROW.slice(0, 6).map((c, i) => <Ball key={c} k={K(c)} size={170 - i * 8} mood="angry" x={W / 2 - 330 - i * 165} y={H / 2 + 30 + (i % 2) * 20} rim="#ffd36b" look={[0.7, 0]} />)}
    {ROW.slice(6, 12).map((c, i) => <Ball key={c} k={K(c)} size={170 - i * 8} mood="angry" x={W / 2 + 330 + i * 165} y={H / 2 + 30 + (i % 2) * 20} rim="#ffd36b" look={[-0.7, 0]} />)}
    <div style={{position: 'absolute', left: W / 2 - 210, top: H / 2 - 200}}><Planet size={420} mood="angry" lon={15} lat={25} helmet rim="#ffcf5a" /></div>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transform: 'scale(2)', transformOrigin: '0 0'}}><Embers n={90} seed={71} /></div>
  </>),
  // 2: rojo contra azul
  b2: (<>
    <AbsoluteFill style={{background: 'linear-gradient(100deg, #1f4fff 0%, #1f4fff 49.7%, #ffffff 49.85%, #ffffff 50.15%, #ff2b2b 50.3%, #ff2b2b 100%)'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 30%, rgba(0,0,0,0.6) 80%)'}} />
    <Rays x={W / 2} y={H / 2} c="rgba(255,255,255,0.5)" a={0.35} r={1400} n={24} />
    {['US', 'GB', 'FR', 'DE', 'JP'].map((c, i) => <Ball key={c} k={K(c)} size={150} mood="angry" x={SX + 60 + i * 140} y={H / 2 + 60 - (i % 2) * 70} rim="#9fc0ff" look={[0.7, 0]} />)}
    {['CN', 'RU', 'IN', 'IR', 'KP'].map((c, i) => <Ball key={c} k={K(c)} size={150} mood="angry" x={W - SX - 60 - i * 140} y={H / 2 + 60 - (i % 2) * 70} rim="#ff9f9f" look={[-0.7, 0]} />)}
    <div style={{position: 'absolute', left: W / 2 - 200, top: H / 2 - 210}}><Planet size={400} mood="angry" lon={-30} lat={20} rim="#ffffff" /></div>
    <Bolt x={W / 2 - 290} y={H / 2 - 230} h={200} /><Bolt x={W / 2 + 290} y={H / 2 - 230} h={200} />
  </>),
  // 3: frente de guerra: tanques, cazas, misiles hacia la mascota con casco
  b3: (<>
    <Map d={JC} t={380} cx={3200} cy={1800} s={0.55} tint="linear-gradient(180deg, #ffd0a0, #3a1a10)" />
    <Glow x={W / 2} y={H / 2} r={650} c="rgba(255,120,40,0.7)" />
    <Boom x={SX + 200} y={H / 2 + 120} r={150} seed={81} /><Boom x={W - SX - 220} y={H / 2 + 100} r={170} seed={82} />
    <Icon name="battle-tank" x={SX + 330} y={H / 2 + 110} w={210} c="#2a4fb8" glow="#9fc0ff" />
    <Icon name="battle-tank" x={W - SX - 330} y={H / 2 + 110} w={210} c="#ffcc1a" glow="#ffb347" flip />
    <Icon name="jet-fighter" x={SX + 250} y={SY + 80} w={170} c="#e8ecf2" rot={20} glow="#9fc0ff" />
    <Icon name="jet-fighter" x={W - SX - 250} y={SY + 80} w={170} c="#e8ecf2" rot={-20} flip glow="#ffb347" />
    <div style={{position: 'absolute', left: W / 2 - 220, top: H / 2 - 180}}><Planet size={440} mood="smug" lon={100} lat={25} helmet rim="#ffb347" /></div>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transform: 'scale(2)', transformOrigin: '0 0'}}><Embers n={100} seed={83} /></div>
  </>),
  // 4: torneo: trofeo en el centro, la mascota y las potencias
  b4: (<>
    <Map d={JC} t={300} cx={3840} cy={2150} s={0.36} tint="linear-gradient(180deg, #ffe7a0, #3a1a04)" />
    <Trophy x={W / 2} y={H / 2 - 10} h={420} />
    <div style={{position: 'absolute', left: W / 2 - 600, top: H / 2 - 150}}><Planet size={300} mood="angry" lon={15} lat={25} helmet rim="#ffcf5a" /></div>
    <Ball k={K('US')} size={240} mood="angry" x={W / 2 + 450} y={H / 2 + 20} rim="#6aa2ff" look={[-0.7, 0]} />
    <Ball k={K('CN')} size={200} mood="angry" x={W / 2 + 680} y={H / 2 + 40} rim="#ff6a4a" look={[-0.7, 0]} />
    {['RU', 'IN', 'BR', 'GB'].map((c, i) => <Ball key={c} k={K(c)} size={130} mood="scared" x={SX - 240 + i * 135} y={H / 2 + 110 - (i % 2) * 60} rim="#999" />)}
    <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transform: 'scale(2)', transformOrigin: '0 0'}}><Embers n={90} seed={84} c="#ffd76a" /></div>
  </>),
  // 5: la noche de los misiles: arcos cruzando el mapa
  b5: (<>
    <Map d={JU} t={200} cx={3840} cy={1900} s={0.36} blur={2} tint="linear-gradient(180deg, #303860, #0a0a18)" />
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      {[[SX - 100, H / 2 + 200, W / 2 - 300, SY], [W - SX + 100, H / 2 + 200, W / 2 + 300, SY], [SX + 200, SY + 380, W - SX - 200, SY + 380], [W - SX - 100, SY + 400, SX + 300, SY + 120]].map(([x0, y0, x1, y1], i) => {
        const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 380;
        return <g key={i}><path d={`M${x0},${y0} Q${mx},${my} ${x1},${y1}`} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={26} strokeLinecap="round" /><path d={`M${x0},${y0} Q${mx},${my} ${x1},${y1}`} fill="none" stroke="#ffd9a0" strokeWidth={7} strokeDasharray="22 16" strokeLinecap="round" /></g>;
      })}
    </svg>
    <Boom x={W / 2 - 300} y={SY + 10} r={110} seed={91} /><Boom x={W / 2 + 300} y={SY + 10} r={110} seed={92} /><Boom x={W - SX - 200} y={SY + 380} r={120} seed={93} /><Boom x={SX + 300} y={SY + 120} r={100} seed={94} />
    <div style={{position: 'absolute', left: W / 2 - 210, top: H / 2 - 190}}><Planet size={420} mood="shocked" lon={-100} lat={30} rim="#9fc0ff" /></div>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transform: 'scale(2)', transformOrigin: '0 0'}}><Embers n={120} seed={95} c="#cfe3ff" /></div>
  </>),
};
export const Banner: React.FC<{id: string}> = ({id}) => (
  <AbsoluteFill style={{background: '#0b1626', overflow: 'hidden'}}>{B[id]}
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 100%)'}} />
  </AbsoluteFill>
);
export const BANNER_IDS = Object.keys(B);
