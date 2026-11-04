// Logos del canal (sin nombre): la bola-planeta con cara, casco y estética de los vídeos. 1024x1024
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Globe} from './Globe';
import {Face, Mood, INK} from './lib3';

export const Planet: React.FC<{size: number; mood: Mood; lon?: number; lat?: number; helmet?: boolean; look?: [number, number]; rim?: string}> = ({size, mood, lon = -30, lat = 15, helmet, look = [0, 0], rim = '#ffd36b'}) => (
  <div style={{position: 'relative', width: size, height: size}}>
    <div style={{position: 'absolute', inset: -size * 0.1, borderRadius: '50%', background: `radial-gradient(circle, ${rim} 0%, transparent 66%)`, opacity: 0.55}} />
    <div style={{position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', border: `${size * 0.04}px solid ${INK}`, boxShadow: `0 ${size * 0.05}px 0 rgba(0,0,0,0.55)`}}>
      {(() => { const IW = size * 3.0, IH = IW / 2; const x = -((lon + 180) / 360) * IW + size / 2, y = -((90 - lat) / 180) * IH + size / 2;
        return <Img src={staticFile('hw/marble2k.jpg')} style={{position: 'absolute', left: x, top: y, width: IW, height: IH, filter: 'saturate(1.35) contrast(1.1) brightness(1.05)'}} />; })()}
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 55%, rgba(10,30,80,0.55) 100%)'}} />
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 33% 27%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 22%), radial-gradient(circle at 66% 76%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.5) 88%)'}} />
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: `inset ${-size * 0.05}px ${-size * 0.02}px ${size * 0.06}px ${rim}`}} />
    </div>
    <svg width={size} height={size} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.95)) drop-shadow(0 0 3px rgba(255,255,255,0.9))'}}><Face x={size / 2} y={size * 0.5} r={size * 0.29} mood={mood} t={1} seed={4} look={look} /></svg>
    {helmet && <div style={{position: 'absolute', left: size * 0.03, top: -size * 0.15, width: size * 0.94, height: size * 0.4, borderRadius: `${size}px ${size}px ${size * 0.08}px ${size * 0.08}px`, background: 'radial-gradient(circle at 35% 30%, #94a562 0%, #55622f 60%, #353d1d 100%)', border: `${size * 0.035}px solid ${INK}`, boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>
      <div style={{position: 'absolute', left: '44%', top: '30%', width: size * 0.1, height: size * 0.1, background: '#ffd23f', clipPath: 'polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)'}} />
    </div>}
  </div>
);
const Icon: React.FC<{name: string; x: number; y: number; w: number; c: string; rot?: number; glow?: string; flip?: boolean}> = ({name, x, y, w, c, rot = 0, glow, flip}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - w / 2, width: w, height: w, transform: `rotate(${rot}deg) scaleX(${flip ? -1 : 1})`, filter: `drop-shadow(0 0 3px ${INK}) drop-shadow(0 0 3px ${INK}) drop-shadow(0 8px 0 rgba(0,0,0,0.5))${glow ? ` drop-shadow(0 0 22px ${glow})` : ''}`}}>
    <div style={{width: '100%', height: '100%', background: c, WebkitMaskImage: `url(${staticFile('hw/icons/' + name + '.svg')})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center'}} />
  </div>
);
const Rays: React.FC<{c: string; a?: number; n?: number}> = ({c, a = 0.5, n = 18}) => (
  <AbsoluteFill style={{opacity: a, background: `repeating-conic-gradient(from 0deg at 50% 50%, ${c} 0deg ${180 / n}deg, transparent ${180 / n}deg ${360 / n}deg)`, WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 70%)'}} />
);
const Ring: React.FC<{r: number; w: number; c: string; dash?: string}> = ({r, w, c, dash}) => (
  <svg width={1024} height={1024} style={{position: 'absolute', left: 0, top: 0}}><circle cx={512} cy={512} r={r} fill="none" stroke={INK} strokeWidth={w + 14} strokeDasharray={dash} /><circle cx={512} cy={512} r={r} fill="none" stroke={c} strokeWidth={w} strokeDasharray={dash} /></svg>
);
const Boom: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: 'radial-gradient(circle, #fffbe0 0%, #ffe066 22%, #ff9a1f 45%, #ff3d1f 62%, rgba(200,30,10,0) 72%)'}} />
);
const L: Record<string, React.ReactNode> = {
  // 1: la bola-planeta con casco, rayos dorados
  l1: (<>
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #2a3f7a 0%, #0c1530 70%)'}} />
    <Rays c="rgba(255,210,90,0.7)" a={0.5} />
    <div style={{position: 'absolute', left: 112, top: 172}}><Planet size={800} mood="angry" helmet rim="#ffcf5a" lon={15} lat={25} /></div>
  </>),
  // 2: diana militar + espadas cruzadas detrás
  l2: (<>
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #3a1214 0%, #120607 72%)'}} />
    <Icon name="explosion-rays" x={512} y={512} w={940} c="#ff8a3a" glow="#ffcf5a" />
    <Ring r={430} w={22} c="#ffd23f" dash="60 28" />
    <div style={{position: 'absolute', left: 122, top: 122}}><Planet size={780} mood="angry" lon={95} lat={30} rim="#ff7a4a" /></div>
    <svg width={1024} height={1024} style={{position: 'absolute', left: 0, top: 0}}>{[[512, 40, 512, 140], [512, 884, 512, 984], [40, 512, 140, 512], [884, 512, 984, 512]].map(([a, b, c, d], i) => <g key={i}><line x1={a} y1={b} x2={c} y2={d} stroke={INK} strokeWidth={34} strokeLinecap="round" /><line x1={a} y1={b} x2={c} y2={d} stroke="#ffd23f" strokeWidth={18} strokeLinecap="round" /></g>)}</svg>
  </>),
  // 3: medio rojo, medio azul (la guerra de bandos) con rayo
  l3: (<>
    <AbsoluteFill style={{background: 'linear-gradient(100deg, #1f4fff 0%, #1f4fff 49.5%, #ffffff 49.7%, #ffffff 50.3%, #ff2b2b 50.5%, #ff2b2b 100%)'}} />
    <AbsoluteFill style={{background: 'radial-gradient(circle, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 85%)'}} />
    <div style={{position: 'absolute', left: 122, top: 122}}><Planet size={780} mood="angry" lon={-85} lat={25} rim="#ffffff" /></div>
    <svg viewBox="0 0 100 200" width={190} height={380} style={{position: 'absolute', left: 840, top: 60, overflow: 'visible', filter: 'drop-shadow(0 0 22px #fff3a0)'}}><path d="M60,0 L20,95 L48,95 L30,200 L85,80 L55,80 L80,0 Z" fill="#fff6b0" stroke={INK} strokeWidth="7" strokeLinejoin="round" /></svg>
  </>),
  // 4: insignia: estrella de cinco puntas dorada detrás, cazas y tanque
  l4: (<>
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #3b4a24 0%, #141a0b 75%)'}} />
    <svg width={1024} height={1024} style={{position: 'absolute', left: 0, top: 0}}>
      <polygon points="512,40 627,370 975,370 693,575 800,905 512,700 224,905 331,575 49,370 397,370" fill="#ffd23f" stroke={INK} strokeWidth={22} strokeLinejoin="round" />
    </svg>
    <div style={{position: 'absolute', left: 137, top: 200}}><Planet size={750} mood="smug" lon={20} lat={10} helmet rim="#fff1a8" /></div>
    <Icon name="jet-fighter" x={170} y={190} w={190} c="#e8ecf2" rot={-30} />
    <Icon name="jet-fighter" x={854} y={190} w={190} c="#e8ecf2" rot={30} flip />
  </>),
  // 5: el planeta en llamas con explosiones y misil
  l5: (<>
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 60%, #ff7a2a 0%, #8a1a0a 40%, #1a0605 80%)'}} />
    <Boom x={230} y={760} r={220} /><Boom x={820} y={780} r={240} /><Boom x={512} y={860} r={200} />
    <div style={{position: 'absolute', left: 132, top: 120}}><Planet size={760} mood="shocked" lon={-100} lat={30} rim="#ffb347" /></div>
    <Icon name="incoming-rocket" x={860} y={170} w={220} c="#f0f0f0" rot={0} glow="#ffb347" />
  </>),
};
export const Logo: React.FC<{id: string}> = ({id}) => <AbsoluteFill style={{background: '#0b1626', overflow: 'hidden'}}>{L[id]}</AbsoluteFill>;
export const LOGO_IDS = Object.keys(L);
