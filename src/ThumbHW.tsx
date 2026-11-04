// Miniaturas tipo póster para el vídeo largo (1280x720)
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {MapCanvas, HWD, KOF} from './HexWorld';
import {Face, INK, YELLOW, RED, font} from './lib3';
import SD from './hw/samearmy.json';
const D = SD as unknown as HWD;
const W = 1280, H = 720;
const Ball: React.FC<{code: string; size: number; mood: any; x: number; y: number; seed?: number}> = ({code, size, mood, x, y, seed = 3}) => (
  <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: '0 14px 0 rgba(0,0,0,0.45)'}} />
    <Img src={staticFile(`wflags/${code.toLowerCase()}.svg`)} style={{position: 'absolute', inset: 0, width: size, height: size, objectFit: 'cover', borderRadius: '50%', border: `${Math.max(6, size * 0.04)}px solid ${INK}`}} />
    <svg width={size} height={size} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><Face x={size / 2} y={size * 0.46} r={size * 0.3} mood={mood} t={0.5} seed={seed} /></svg>
  </div>
);
const Stroke: React.FC<{children: React.ReactNode; size: number; color?: string; style?: React.CSSProperties}> = ({children, size, color = '#fff', style}) => (
  <div style={{...font, fontSize: size, color, lineHeight: 0.95, WebkitTextStroke: `${size * 0.09}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.08}px 0 ${INK}`, ...style}}>{children}</div>
);
export const ThumbHW: React.FC<{v: number}> = ({v}) => {
  if (v === 1) {
    // A: Rusia gigante asustada vs Mónaco diminuto furioso
    return (
      <AbsoluteFill style={{background: '#0b1626', overflow: 'hidden'}}>
        <MapCanvas d={D} t={0} cam={{cx: 4300, cy: 1500, s: 0.36}} W={W} H={H} opts={{units: false, puffs: false, cities: false}} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 60%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 100%)'}} />
        <Ball code="RU" size={430} mood="scared" x={330} y={430} />
        <Ball code="LU" size={210} mood="angry" x={1010} y={455} seed={9} />
        <div style={{position: 'absolute', left: 895, top: 575, display: 'flex', gap: 4}}>{[0, 1, 2, 3, 4].map((i) => <Img key={i} src={staticFile('hw/icons/helmet-head-shot.svg')} style={{width: 44, height: 44, background: RED, borderRadius: '50%', border: `4px solid ${INK}`, padding: 4}} />)}</div>
        <Stroke size={64} style={{position: 'absolute', left: 840, top: 640}} color={YELLOW}>1,000,000</Stroke>
        <Stroke size={64} style={{position: 'absolute', left: 180, top: 640}} color={YELLOW}>1,000,000</Stroke>
        <Stroke size={118} style={{position: 'absolute', top: 26, left: 0, right: 0, textAlign: 'center'}}>SAME ARMY?!</Stroke>
        <div style={{position: 'absolute', left: 600, top: 380, ...font, fontSize: 90, color: RED, WebkitTextStroke: `7px ${INK}`, paintOrder: 'stroke fill'}}>VS</div>
      </AbsoluteFill>
    );
  }
  if (v === 2) {
    // B: mapa mundial en guerra + pregunta
    return (
      <AbsoluteFill style={{background: '#0b1626', overflow: 'hidden'}}>
        <MapCanvas d={D} t={390} cam={{cx: 3900, cy: 2150, s: 0.2}} W={W} H={H} opts={{units: false, puffs: false, cities: false}} />
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.55) 100%)'}} />
        <Stroke size={104} style={{position: 'absolute', top: 24, left: 0, right: 0, textAlign: 'center'}}>EVERY COUNTRY</Stroke>
        <Stroke size={128} color={YELLOW} style={{position: 'absolute', bottom: 28, left: 0, right: 0, textAlign: 'center'}}>SAME ARMY</Stroke>
        <div style={{position: 'absolute', right: 40, top: 230, transform: 'rotate(8deg)', background: RED, border: `8px solid ${INK}`, borderRadius: 26, padding: '6px 26px 0', ...font, fontSize: 92, color: '#fff'}}>WHO WINS?</div>
      </AbsoluteFill>
    );
  }
  // C: 195 vs 1 con contador
  return (
    <AbsoluteFill style={{background: '#0b1626', overflow: 'hidden'}}>
      <MapCanvas d={D} t={100} cam={{cx: 4050, cy: 1500, s: 0.62}} W={W} H={H} opts={{units: false, puffs: false, cities: false}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.05) 20%, rgba(0,0,0,0.65) 100%)'}} />
      <Stroke size={190} color={YELLOW} style={{position: 'absolute', top: 60, left: 50}}>195</Stroke>
      <Stroke size={70} style={{position: 'absolute', top: 250, left: 60}}>COUNTRIES</Stroke>
      <Stroke size={190} color="#fff" style={{position: 'absolute', top: 340, right: 60, textAlign: 'right'}}>1</Stroke>
      <Stroke size={70} color={RED} style={{position: 'absolute', top: 530, right: 60, textAlign: 'right'}}>SURVIVES</Stroke>
      <div style={{position: 'absolute', left: 60, bottom: 40, background: '#fff', border: `7px solid ${INK}`, borderRadius: 22, padding: '6px 24px 0', ...font, fontSize: 52, color: INK}}>🪖 SAME ARMY FOR ALL</div>
    </AbsoluteFill>
  );
};
void KOF;
