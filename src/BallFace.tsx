// Countryball con cara completa: ojos + boca + extras. La boca se abre con la amplitud real de la voz.
import React from 'react';
import {staticFile} from 'remotion';
import {FlagCanvas} from './HexWorld';
import {INK} from './lib3';
import {EyesSvg} from './ThumbsCB';

export type Expr = 'normal' | 'happy' | 'smug' | 'angry' | 'evil' | 'scared' | 'shock' | 'sad' | 'cry' | 'laugh' | 'shades' | 'dead' | 'sleepy' | 'proud';
type Mouth = 'smile' | 'frown' | 'smirk' | 'flat' | 'wavy' | 'O' | 'grin' | 'D' | 'tongue' | 'wail';
const FACE: Record<Expr, {e: string; m: Mouth}> = {
  normal: {e: 'normal', m: 'smile'}, happy: {e: 'happy', m: 'D'}, smug: {e: 'smug', m: 'smirk'}, angry: {e: 'angry', m: 'frown'},
  evil: {e: 'evil', m: 'grin'}, scared: {e: 'scared', m: 'wavy'}, shock: {e: 'shock', m: 'O'}, sad: {e: 'sad', m: 'frown'},
  cry: {e: 'sad', m: 'wail'}, laugh: {e: 'happy', m: 'D'}, shades: {e: 'shades', m: 'smirk'}, dead: {e: 'dead', m: 'tongue'},
  sleepy: {e: 'sleepy', m: 'flat'}, proud: {e: 'smug', m: 'smile'},
};
const cl = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const Eyes2: React.FC<{e: string; s: number; look: number; blink: number}> = ({e, s, look, blink}) => {
  const lx = look * 0.06 * s, cy = 0.4 * s, dx = 0.17 * s, sw = s * 0.022;
  const xs = [0.5 * s - dx + lx, 0.5 * s + dx + lx];
  const rx = 0.085 * s, ry = 0.1 * s;
  if (blink > 0.5 && ['normal', 'smug', 'scared', 'shock', 'sad', 'angry'].includes(e))
    return <g>{xs.map((x, i) => <path key={i} d={`M${x - rx},${cy} Q${x},${cy + ry * 0.35} ${x + rx},${cy}`} fill="none" stroke={INK} strokeWidth={sw * 1.4} strokeLinecap="round" />)}</g>;
  if (e === 'happy') return <g>{xs.map((x, i) => <path key={i} d={`M${x - rx},${cy + ry * 0.25} Q${x},${cy - ry * 1.0} ${x + rx},${cy + ry * 0.25}`} fill="none" stroke={INK} strokeWidth={sw * 1.6} strokeLinecap="round" />)}</g>;
  if (e === 'sleepy') return <g>{xs.map((x, i) => <path key={i} d={`M${x - rx},${cy + ry * 0.1} Q${x},${cy + ry * 0.55} ${x + rx},${cy + ry * 0.1}`} fill="none" stroke={INK} strokeWidth={sw * 1.4} strokeLinecap="round" />)}</g>;
  if (e === 'shock') return <g>{xs.map((x, i) => <g key={i}><ellipse cx={x} cy={cy - ry * 0.1} rx={rx * 1.15} ry={ry * 1.3} fill="#fff" stroke={INK} strokeWidth={sw} /><circle cx={x + lx * 0.3} cy={cy - ry * 0.1} r={rx * 0.18} fill={INK} /></g>)}</g>;
  if (e === 'sad') return <g>{xs.map((x, i) => { const d = i === 0 ? 1 : -1;
    return <path key={i} d={`M${x - rx},${cy - ry * (d > 0 ? 0.15 : 0.75)} L${x + rx},${cy - ry * (d > 0 ? 0.75 : 0.15)} A${rx},${ry} 0 0 1 ${x - rx},${cy - ry * (d > 0 ? 0.15 : 0.75)} Z`} fill="#fff" stroke={INK} strokeWidth={sw} strokeLinejoin="round" transform={`translate(0,${ry * 0.3})`} />; })}</g>;
  if (e === 'evil') return <g>
    <defs><radialGradient id="evg"><stop offset="0" stopColor="#fff36b" /><stop offset="0.5" stopColor="#ff3b1f" /><stop offset="1" stopColor="#7a0000" /></radialGradient></defs>
    {xs.map((x, i) => { const d = i === 0 ? 1 : -1;
      return <path key={i} d={`M${x - rx * 1.1},${cy - ry * (d > 0 ? 0.95 : 0.05)} L${x + rx * 1.1},${cy - ry * (d > 0 ? 0.05 : 0.95)} A${rx * 1.1},${ry * 0.95} 0 0 1 ${x - rx * 1.1},${cy - ry * (d > 0 ? 0.95 : 0.05)} Z`} fill="url(#evg)" stroke={INK} strokeWidth={sw * 1.2} strokeLinejoin="round" transform={`translate(0,${ry * 0.35})`} />; })}</g>;
  return <EyesSvg e={e as any} s={s} look={look} />;
};

const MouthSvg: React.FC<{m: Mouth; s: number; open: number; t: number}> = ({m, s, open, t}) => {
  const cx = 0.5 * s, cy = 0.68 * s, w = 0.13 * s, sw = s * 0.022;
  const dark = '#3b0a10', tongue = '#e2525f';
  // abierta (hablando, O, grin, D, wail): forma con relleno
  const op = cl(open, 0, 1);
  if (op > 0.06 || m === 'O' || m === 'grin' || m === 'D' || m === 'wail') {
    const base = m === 'O' ? 0.55 : m === 'grin' ? 0.35 : m === 'D' ? 0.55 : m === 'wail' ? 0.75 : 0;
    const h = s * 0.035 + s * 0.13 * Math.max(op, base);
    const ww = m === 'grin' ? w * 1.45 : m === 'O' ? w * 0.6 + op * w * 0.2 : m === 'wail' ? w * 1.0 : w * (0.95 + op * 0.25);
    const frown = m === 'frown' || m === 'wavy';
    const top = cy - (frown ? h * 0.15 : 0);
    let d: string;
    if (m === 'O') d = `M${cx - ww},${cy} A${ww},${h * 0.7} 0 1 0 ${cx + ww},${cy} A${ww},${h * 0.7} 0 1 0 ${cx - ww},${cy} Z`;
    else if (frown) d = `M${cx - ww},${top + h * 0.6} Q${cx},${top - h * 0.6} ${cx + ww},${top + h * 0.6} Q${cx},${top + h * 0.9} ${cx - ww},${top + h * 0.6} Z`;
    else d = `M${cx - ww},${top - h * 0.12} Q${cx},${top + h * 0.05} ${cx + ww},${top - h * 0.12} Q${cx + ww * 0.85},${top + h * 1.25} ${cx},${top + h * 1.25} Q${cx - ww * 0.85},${top + h * 1.25} ${cx - ww},${top - h * 0.12} Z`;
    const teeth = m === 'grin' || m === 'frown';
    return <g>
      <clipPath id={`mc${Math.round(s)}${m}`}><path d={d} /></clipPath>
      <path d={d} fill={dark} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
      <g clipPath={`url(#mc${Math.round(s)}${m})`}>
        <ellipse cx={cx} cy={top + h * 1.2} rx={ww * 0.6} ry={h * 0.5} fill={tongue} />
        {teeth && <rect x={cx - ww} y={top - h} width={ww * 2} height={h * (m === 'grin' ? 1.35 : 1.05)} fill="#fff" />}
        {m === 'grin' && [-0.5, 0, 0.5].map((f, i) => <line key={i} x1={cx + ww * f} y1={top - h} x2={cx + ww * f} y2={top + h * 0.35} stroke={INK} strokeWidth={sw * 0.6} />)}
      </g>
    </g>;
  }
  if (m === 'smile' || m === 'smirk') {
    const a = m === 'smirk' ? 0.35 : 0;
    return <path d={`M${cx - w * 0.8},${cy - w * 0.05 - a * w * 0.2} Q${cx},${cy + w * 0.55} ${cx + w * 0.85},${cy - w * 0.2 - a * w * 0.5}`} fill="none" stroke={INK} strokeWidth={sw * 1.3} strokeLinecap="round" />;
  }
  if (m === 'frown') return <path d={`M${cx - w * 0.75},${cy + w * 0.35} Q${cx},${cy - w * 0.35} ${cx + w * 0.75},${cy + w * 0.35}`} fill="none" stroke={INK} strokeWidth={sw * 1.3} strokeLinecap="round" />;
  if (m === 'wavy') { const ph = t * 18; return <path d={`M${cx - w * 0.8},${cy} ${[0, 1, 2, 3, 4].map((i) => `L${cx - w * 0.8 + w * 0.4 * (i + 0.5)},${cy + (i % 2 ? 1 : -1) * w * 0.14 * (1 + 0.2 * Math.sin(ph))}`).join(' ')} L${cx + w * 0.8},${cy}`} fill="none" stroke={INK} strokeWidth={sw * 1.2} strokeLinejoin="round" strokeLinecap="round" />; }
  if (m === 'tongue') return <g><path d={`M${cx - w * 0.7},${cy} L${cx + w * 0.7},${cy}`} stroke={INK} strokeWidth={sw * 1.3} strokeLinecap="round" /><path d={`M${cx + w * 0.05},${cy} q0,${w * 0.55} ${w * 0.3},${w * 0.5} q${w * 0.25},0 ${w * 0.2},${-w * 0.5}`} fill={tongue} stroke={INK} strokeWidth={sw} /></g>;
  return <path d={`M${cx - w * 0.6},${cy} L${cx + w * 0.6},${cy}`} stroke={INK} strokeWidth={sw * 1.3} strokeLinecap="round" />;
};

export const Ball2: React.FC<{k: number; size: number; expr: Expr; open?: number; look?: number; rot?: number; t: number; seed?: number; flash?: number; sx?: number; sy?: number}> = ({k, size, expr, open = 0, look = 0, rot = 0, t, seed = 0, flash = 0, sx = 1, sy = 1}) => {
  const f = FACE[expr] || FACE.normal;
  // parpadeo natural (cada ~3-4 s, distinto por país)
  const ph = (t + seed * 0.731) % (3.1 + (seed % 7) * 0.17);
  const blink = ph < 0.11 ? 1 : 0;
  const s = size;
  return (
    <div style={{position: 'absolute', left: -s / 2, top: -s / 2, width: s, height: s, transform: `rotate(${rot}deg) scale(${sx},${sy})`, transformOrigin: '50% 100%'}}>
      {expr === 'evil' && <div style={{position: 'absolute', inset: -s * 0.25, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,40,0,0.55) 0%, rgba(255,0,0,0) 65%)', opacity: 0.75 + 0.25 * Math.sin(t * 9)}} />}
      {expr === 'evil' && [0, 1].map((i) => <div key={'h' + i} style={{position: 'absolute', left: s * (i ? 0.66 : 0.12), top: -s * 0.2, width: s * 0.22, height: s * 0.34, background: 'linear-gradient(#ff4a2a, #8a0000)', clipPath: i ? 'polygon(10% 100%, 100% 0%, 90% 100%)' : 'polygon(10% 100%, 0% 0%, 90% 100%)', filter: `drop-shadow(0 0 2px ${INK})`}} />)}
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', border: `${Math.max(2.5, s * 0.022)}px solid ${INK}`, boxShadow: `0 ${s * 0.04}px ${s * 0.07}px rgba(0,0,0,0.55)`, filter: expr === 'dead' ? 'saturate(0.6) brightness(0.85)' : 'saturate(1.12)'}}>
        <FlagCanvas k={k} w={s} h={s} />
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 32% 26%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 22%, rgba(255,255,255,0) 40%), radial-gradient(circle at 62% 70%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.5) 92%)'}} />
        {expr === 'evil' && <div style={{position: 'absolute', inset: 0, background: 'rgba(200,0,0,0.28)'}} />}
        {(expr === 'angry') && <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 70%, rgba(255,0,0,0.25), rgba(255,0,0,0) 60%)'}} />}
        {flash > 0 && <div style={{position: 'absolute', inset: 0, background: `rgba(255,255,255,${flash})`}} />}
      </div>
      <svg width={s} height={s} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <Eyes2 e={f.e} s={s} look={look} blink={blink} />
        <MouthSvg m={f.m} s={s} open={expr === 'laugh' ? 0.5 + 0.4 * Math.abs(Math.sin(t * 14)) : open} t={t} />
        {expr === 'angry' && <g transform={`translate(${s * 0.8},${s * 0.12}) scale(${s / 200})`}><path d="M-14,-4 Q-4,-4 -4,-14 M4,-14 Q4,-4 14,-4 M14,4 Q4,4 4,14 M-4,14 Q-4,4 -14,4" fill="none" stroke="#e0161b" strokeWidth={6} strokeLinecap="round" /></g>}
        {(expr === 'cry') && [0.33, 0.67].map((fx, i) => <path key={i} d={`M${s * fx},${s * 0.47} q${-s * 0.04},${s * 0.2} ${s * 0.0},${s * 0.42 * (0.6 + 0.4 * ((t * 2 + i * 0.5) % 1))}`} fill="none" stroke="#6cc4ff" strokeWidth={s * 0.05} strokeLinecap="round" opacity={0.95} />)}
        {(expr === 'scared' || expr === 'shock') && <path d={`M${s * 0.86},${s * 0.18} q${s * 0.05},${s * 0.09} 0,${s * 0.13} q${-s * 0.05},${-s * 0.04} 0,${-s * 0.13} Z`} fill="#bfe6ff" stroke={INK} strokeWidth={s * 0.012} />}
        {expr === 'happy' || expr === 'laugh' ? [0.22, 0.78].map((fx, i) => <ellipse key={i} cx={s * fx} cy={s * 0.56} rx={s * 0.06} ry={s * 0.03} fill="#ff6b8a" opacity={0.55} />) : null}
        {expr === 'sleepy' && <text x={s * 0.85} y={s * 0.05 - ((t * 20) % 20)} fontFamily="Lilita" fontSize={s * 0.22} fill="#fff" stroke={INK} strokeWidth={s * 0.02} paintOrder="stroke">z</text>}
      </svg>
    </div>
  );
};

export const Gun: React.FC<{w: number; flip: boolean; recoil: number; fire: boolean}> = ({w, flip, recoil, fire}) => {
  const m = {WebkitMaskImage: `url(${staticFile('hw/icons/ak47.svg')})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center'} as React.CSSProperties;
  return (
    <div style={{position: 'absolute', left: -w / 2, top: -w / 2, width: w, height: w, transform: `scaleX(${flip ? -1 : 1}) translateX(${-recoil * w * 0.08}px) rotate(${-recoil * 6}deg)`}}>
      <div style={{position: 'absolute', inset: 0, filter: `drop-shadow(0 0 2px ${INK}) drop-shadow(0 0 2px ${INK})`}}><div style={{width: '100%', height: '100%', ...m, background: 'linear-gradient(115deg, #2e2e2e 0%, #555 40%, #8a4a1c 41%, #b8682a 55%, #2e2e2e 56%, #4a4a4a 70%, #8a4a1c 71%, #a65c22 100%)'}} /></div>
      {fire && <div style={{position: 'absolute', left: w * 0.93, top: w * 0.32, width: w * 0.42, height: w * 0.3, transform: 'translateY(-30%)', background: 'radial-gradient(ellipse at 20% 50%, #fff 0%, #ffe066 25%, #ff8a00 50%, rgba(255,80,0,0) 72%)', clipPath: 'polygon(0% 35%, 100% 0%, 70% 50%, 100% 100%, 0% 65%)'}} />}
    </div>
  );
};
