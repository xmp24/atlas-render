// Personajes: countryballs clásicas con accesorios
import React from 'react';
import {INK, font} from '../lib3';
import {CBall} from '../ThumbsCB';

type Acc = 'none' | 'cia' | 'delta' | 'general' | 'sash' | 'tie' | 'judge';
export const Char: React.FC<{k: number; x: number; y: number; s: number; t: number; acc?: Acc; eyes?: any; look?: number; label?: string; sweat?: boolean; tears?: boolean; bob?: boolean; rot?: number; op?: number}> = ({k, x, y, s, t, acc = 'none', eyes = 'normal', look = 0, label, sweat, tears, bob = true, rot = 0, op = 1}) => {
  const by = bob ? Math.sin(t * 2.2 + x * 0.01) * s * 0.012 : 0; const sq = bob ? 1 + Math.sin(t * 2.2 + x * 0.01) * 0.012 : 1;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, opacity: op}}>
      <div style={{position: 'absolute', left: x - s * 0.42, top: y + s * 0.44, width: s * 0.84, height: s * 0.12, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,0,0,0.45), rgba(0,0,0,0) 70%)'}} />
      <div style={{position: 'absolute', left: 0, top: by, width: 1, height: 1, transform: `rotate(${rot}deg)`, transformOrigin: `${x}px ${y}px`}}>
        <div style={{position: 'absolute', left: 0, top: 0, transform: `scale(${1 / sq}, ${sq})`, transformOrigin: `${x}px ${y + s / 2}px`}}>
          <CBall k={k} size={s} x={x} y={y} eyes={eyes} look={look} sweat={sweat} tears={tears} />
          {acc === 'sash' && <div style={{position: 'absolute', left: x - s * 0.5, top: y - s * 0.02, width: s, height: s * 0.5, overflow: 'hidden', borderRadius: `0 0 ${s}px ${s}px`}}><div style={{position: 'absolute', left: -s * 0.1, top: s * 0.06, width: s * 1.3, height: s * 0.16, transform: 'rotate(-28deg)', background: 'linear-gradient(180deg, #ffd21a 0 33%, #1f4fbf 33% 66%, #d61f26 66%)', border: `${s * 0.012}px solid ${INK}`}} /></div>}
          {acc === 'tie' && <div style={{position: 'absolute', left: x - s * 0.06, top: y + s * 0.18, width: s * 0.12, height: s * 0.3, background: '#c3100a', clipPath: 'polygon(30% 0,70% 0,100% 80%,50% 100%,0 80%)', border: `${s * 0.01}px solid ${INK}`}} />}
          {acc === 'cia' && <>
            <div style={{position: 'absolute', left: x - s * 0.58, top: y - s * 0.52, width: s * 1.16, height: s * 0.1, borderRadius: s * 0.05, background: '#1d1d1d', border: `${s * 0.012}px solid #000`}} />
            <div style={{position: 'absolute', left: x - s * 0.32, top: y - s * 0.78, width: s * 0.64, height: s * 0.3, borderRadius: `${s * 0.18}px ${s * 0.18}px ${s * 0.03}px ${s * 0.03}px`, background: 'linear-gradient(180deg, #3a3a3a, #161616)', border: `${s * 0.012}px solid #000`}}><div style={{position: 'absolute', left: 0, right: 0, bottom: s * 0.03, height: s * 0.05, background: '#7a1010'}} /></div>
          </>}
          {acc === 'delta' && <>
            <div style={{position: 'absolute', left: x - s * 0.5, top: y - s * 0.62, width: s * 1.0, height: s * 0.42, borderRadius: `${s}px ${s}px ${s * 0.05}px ${s * 0.05}px`, background: 'radial-gradient(circle at 35% 30%, #6e6a52, #3e3b2c 70%)', border: `${s * 0.02}px solid ${INK}`}} />
            <div style={{position: 'absolute', left: x - s * 0.16, top: y - s * 0.6, width: s * 0.32, height: s * 0.16, borderRadius: s * 0.04, background: '#1d1d1d', border: `${s * 0.012}px solid #000`}}>
              {[0.2, 0.6].map((f, i) => <div key={i} style={{position: 'absolute', left: `${f * 100}%`, top: '20%', width: s * 0.09, height: s * 0.09, borderRadius: '50%', background: 'radial-gradient(circle, #9dff9a, #2a8a2a)', boxShadow: '0 0 10px #6aff6a'}} />)}
            </div>
          </>}
          {acc === 'general' && <>
            <div style={{position: 'absolute', left: x - s * 0.46, top: y - s * 0.62, width: s * 0.92, height: s * 0.3, borderRadius: `${s * 0.4}px ${s * 0.4}px ${s * 0.04}px ${s * 0.04}px`, background: 'linear-gradient(180deg, #4a5a3a, #2e3a22)', border: `${s * 0.015}px solid ${INK}`}}><div style={{position: 'absolute', left: '44%', top: '20%', width: s * 0.12, height: s * 0.12, background: '#ffd23f', clipPath: 'polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)'}} /></div>
            <div style={{position: 'absolute', left: x - s * 0.5, top: y - s * 0.36, width: s * 1.0, height: s * 0.08, borderRadius: s * 0.04, background: '#1d1d1d'}} />
          </>}
          {acc === 'judge' && <div style={{position: 'absolute', left: x - s * 0.55, top: y - s * 0.62, width: s * 1.1, height: s * 0.6, borderRadius: `${s * 0.5}px ${s * 0.5}px ${s * 0.2}px ${s * 0.2}px`, background: 'radial-gradient(circle at 50% 30%, #fff, #d8d8d8)', border: `${s * 0.012}px solid ${INK}`, clipPath: 'inset(0 0 45% 0)'}} />}
        </div>
      </div>
      {label && <div style={{position: 'absolute', left: x, top: y + s * 0.56, transform: 'translateX(-50%)', ...font, fontSize: Math.max(22, s * 0.16), color: '#fff', WebkitTextStroke: `${Math.max(4, s * 0.03)}px ${INK}`, paintOrder: 'stroke fill', whiteSpace: 'nowrap'}}>{label}</div>}
    </div>
  );
};
