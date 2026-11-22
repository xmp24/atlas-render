import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ContMap, TFLAG, TCOL} from './WarGov';
import {Avatar, INK, font} from './lib3';
// miniatura 1280x720: los tres sistemas con cara + mapa real dividido en tres colores
export const ThumbGov: React.FC = () => {
  const cam = {cx: 1010, cy: 430, s: 0.78} as any;
  const t = 5.2;
  const Big: React.FC<{tm: string; size: number; x: number; y: number; rot: number; mood: any; label: string; z: number}> = ({tm, size, x, y, rot, mood, label, z}) => (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg)`, zIndex: z, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{position: 'absolute', width: size * 1.5, height: size * 1.5, borderRadius: '50%', background: `radial-gradient(circle, ${TCOL[tm]}cc 0%, ${TCOL[tm]}00 65%)`, top: -size * 0.25}} />
      <div style={{filter: 'drop-shadow(0 14px 10px rgba(0,0,0,0.6))'}}><Avatar size={size} code={TFLAG(tm)} mood={mood} t={1.3} seed={3} id={`th-${tm}`} /></div>
      <div style={{marginTop: -10, ...font, fontSize: size * 0.2, color: '#fff', background: TCOL[tm], border: `6px solid ${INK}`, borderRadius: 16, padding: '2px 18px 0', boxShadow: '0 6px 0 rgba(0,0,0,0.45)'}}>{label}</div>
    </div>);
  return (
    <AbsoluteFill style={{background: '#0b1f3a', overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, filter: 'saturate(1.25) brightness(0.85)'}}>
        <ContMap t={t} cam={cam} vp={{W: 1280, H: 720, ox: 640, oy: 360, ui: 0.7}} />
      </div>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 62%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.6) 100%)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 34%)'}} />
      {/* chispas de choque */}
      <div style={{position: 'absolute', left: 640, top: 470, width: 520, height: 300, transform: 'translate(-50%,-50%)', background: 'radial-gradient(ellipse, rgba(255,220,120,0.85) 0%, rgba(255,120,30,0.5) 30%, rgba(255,60,0,0) 65%)'}} />
      <Big tm="MON" size={250} x={640} y={455} rot={0} mood="angry" label="MONARCHY" z={2} />
      <Big tm="DEM" size={330} x={250} y={470} rot={-6} mood="angry" label="DEMOCRACY" z={3} />
      <Big tm="DIC" size={330} x={1030} y={470} rot={6} mood="angry" label="DICTATORSHIP" z={3} />
      <div style={{position: 'absolute', top: 18, left: 0, right: 0, textAlign: 'center', ...font, fontSize: 118, lineHeight: 1, color: '#fff', WebkitTextStroke: `14px ${INK}`, paintOrder: 'stroke fill', textShadow: '0 10px 0 rgba(0,0,0,0.5)', transform: 'rotate(-2deg)'}}>
        WHO RULES <span style={{color: '#ffd23f'}}>THE WORLD?</span></div>
    </AbsoluteFill>
  );
};
